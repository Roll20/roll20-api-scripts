/**
 * PaladinAura Roll20 API
 *
 * Created by Layton Burchell
 * https://app.roll20.net/users/1519557/layton
 * https://gitlab.com/LaytonGB/Paladin-Aura-API
 */
// TODO Add comments for every function
const PaladinAura = (function () {
    'use strict';
    // ANCHOR Roll20 object structures
    /*
        state.PaladinAura = {
            TokenList: { [id: string]: TokenObj },
            PaladinList: string[],
            PageLoad: boolean,
        }

        globalconfig.PaladinAura = {
            DiagonalMeasurementMethod: "auto" | "foure" | "threefive" | "pythagorean" | "manhattan",
        }
    */
    state.PaladinAura = state.PaladinAura || {}; // Init state object
    // ANCHOR Class definitions
    class TokenObj {
        constructor(token) {
            this.ID = token.id;
            this.xPos = token.get('left');
            this.yPos = token.get('top');
            this.xSize = token.get('width');
            this.ySize = token.get('height');
            const character = getObj('character', token.get('represents'));
            if (character !== undefined) {
                this.characterID = character.id;
                this.isNPC = this.characterID === undefined ||
                    getAttrByName(character.id, 'npc') === '1';
                if (this.isNPC === false) {
                    const paladinClass = charIsPaladin(this.characterID);
                    if (paladinClass !== false) {
                        this.paladinProps = new PaladinProps(token, paladinClass);
                        Paladin.initFromStoredInclusionList(this);
                        STATE.PaladinList.push(token.id);
                    }
                }
            }
            else {
                this.isNPC = true;
            }
        }
    }
    class PaladinProps {
        constructor(token, paladinClass) {
            this.characterID = token.get('represents');
            // if paladinClass is not true it is the name of the multiclass (eg 'multiclass2')
            if (paladinClass === true) {
                this.levelAttrID = getAttrID('base_level', this.characterID);
            }
            else {
                this.levelAttrID = getAttrID(paladinClass + '_lvl', this.characterID);
            }
            this.chaBonusAttrID = getAttrID('charisma_mod', this.characterID);
            this.hpAttrID = getAttrID('hp', this.characterID);
            this.forceIncludeAttrID = getAttrID('pa_force_include', this.characterID);
            if (this.forceIncludeAttrID !== undefined) {
                const forceIncludeAttr = getAttrFromID(this.forceIncludeAttrID);
                if (forceIncludeAttr !== undefined) {
                    const forceIncludeStr = forceIncludeAttr.get('current');
                    if (forceIncludeStr.trim().length > 0) {
                        this.forceIncludeArr = forceIncludeStr.split(',').map(a => {
                            const parts = a.split('|');
                            return [parts[0], (+parts[1])];
                        });
                    }
                }
            }
            // Add paladin abilities to character
            const abilities = findObjs({
                _type: 'ability',
                _characterid: this.characterID,
            });
            // Get an array of abilities that do not already exist
            const abilitiesToCreate = Paladin.paladinAbilities().filter(a => {
                return !abilities.some(b => { return a[0] === b.get('name'); });
            });
            abilitiesToCreate.forEach(a => {
                createObj('ability', {
                    _characterid: this.characterID,
                    name: a[0],
                    action: a[1],
                    istokenaction: true,
                });
            });
        }
    }
    // ANCHOR Global variables
    const DiagonalMeasurementMethod = globalconfig.DiagonalMeasurementMethod || 'auto';
    const StatusMarker = 'status_bolt-shield';
    // ANCHOR Input handling
    function handleInput(msg) {
        if (msg.type === 'api') {
            const parts = msg.content.split(/ +/g);
            if (parts[0] === '!pa') {
                // Example message: '!pa toggle @{selected|id} @{target|id}'
                if (parts[1] === 'toggle' && parts[2] && parts[3]) {
                    Paladin.toggleAuraForTarget(parts[2], parts[3]);
                }
            }
        }
        else if (msg.rolltemplate === 'simple' && msg.content.search(/{{rname=([A-z]* Save|\^{[A-z]*-save-u})}}/gi) !== -1) {
            // Saving throw chat response for if a token has an aura bonus
            const regexResult = /(?<={{charname=)\w*/i.exec(msg.content);
            const nameInRoll = regexResult && regexResult[0]; // First name of the character
            if (nameInRoll === null)
                return; // break if null
            // Find all tokens that contain the first name of the character
            const foundTokens = Object.keys(STATE.get('TokenList')).map(k => {
                return getObj('graphic', k);
            }).filter(t => {
                return t.get('name').includes(nameInRoll);
            });
            if (foundTokens.length > 0) {
                // if token(s) have bonus, post to chat
                if (foundTokens.length === 1) {
                    // send one obj reply to chat
                    const bonus = foundTokens[0].get('status_bolt-shield');
                    if (bonus !== false && bonus !== true) {
                        Chat.send(`${nameInRoll} has a bonus of ${bonus}.`);
                    }
                }
                else {
                    // send uncertain reply to chat
                    const allBonuses = foundTokens.map(t => {
                        const bonus = t.get('status_bolt-shield');
                        return bonus;
                    });
                    const bonuses = allBonuses.filter(bonus => {
                        return bonus !== false && bonus !== true;
                    });
                    if (bonuses.length > 0) {
                        const sortedBonusStrings = bonuses.sort((a, b) => { return a - b; })
                            .map(a => { return a.toString(); });
                        Chat.send(`${nameInRoll} token bonuses:<br>${sortedBonusStrings.join(', ')}.`);
                    }
                }
            }
        }
    }
    // ANCHOR Global functions
    /**
     * Returns the ID of an attribute with the name provided, if one is found.
     * @param name The name of the attribute to find.
     * @param characterID The character the attribute belongs to.
     */
    function getAttrID(name, characterID) {
        const attrs = findObjs({
            _type: 'attribute',
            _characterid: characterID,
            name: name,
        });
        if (attrs === undefined || attrs[0] === undefined) {
            return undefined;
        }
        return attrs[0].id;
    }
    function getAttrFromID(id) {
        if (id === undefined) {
            return undefined;
        }
        else {
            const attr = getObj('attribute', id);
            if (attr === undefined) {
                return undefined;
            }
            else {
                return attr;
            }
        }
    }
    /**
     * Test if a character has any levels in paladin and returns different values
     * based on whether the character is a multi-classed paladin.
     *
     * If the character is not a multiclassed paladin, returns `true` or `false` if they
     * are or are not a paladin respectively. If the character is a multiclassed paladin,
     * `'multiclass' + <number>` will be returned as the name of the attribute the class
     * is stored in.
     * @param CharID The targeted character.
     */
    function charIsPaladin(charID) {
        const multiclasses = [];
        const classesToCheck = ['class'];
        ['multiclass1', 'multiclass2', 'multiclass3'].forEach(a => {
            multiclasses.push(getAttrByName(charID, a + '_flag'));
        });
        multiclasses.forEach(a => {
            if (a === '1') {
                classesToCheck.push(a);
            }
        });
        const palClass = classesToCheck.find(c => {
            const val = getAttrByName(charID, c);
            return val.search(/paladin/gi) !== -1;
        });
        if (palClass === 'class')
            return true;
        else if (palClass !== undefined)
            return palClass;
        else
            return false;
    }
    /**
     * Calculates and sets the aura bonus for all tokens.
     */
    function calcAndSetAllBonuses() {
        Object.keys(STATE.get('TokenList')).forEach(k => {
            const tokenObj = STATE.get('TokenList', k);
            Token.setBonus(tokenObj, Token.calcBonus(tokenObj));
        });
    }
    /**
     * Get and clear the TokenList.
     */
    function clearTokenList() {
        const tokenList = STATE.get('TokenList');
        if (tokenList) {
            Object.keys(tokenList).forEach(k => {
                const tokenObj = STATE.get('TokenList', k);
                Token.setBonus(tokenObj, 0);
            });
        }
    }
    /**
     * Returns the distance between two points in pixels.
     *
     * Automatically accounts for sizes of tokens.
     * @param token A `TokenObj` that represents the token that may receive a paladin aura bonus.
     * @param paladin A `TokenObj` that represents the paladin that may be granting an aura bonus.
     */
    function getDistance(token, paladin) {
        const txPos = token.xPos;
        const tyPos = token.yPos;
        const txSize = token.xSize;
        const tySize = token.ySize;
        const pxPos = paladin.xPos;
        const pyPos = paladin.yPos;
        const pxSize = paladin.xSize;
        const pySize = paladin.ySize;
        const pageID = Campaign().get('playerpageid');
        const page = getObj('page', pageID);
        if (page !== undefined) {
            const pixPerSquare = page.get('snapping_increment') * 70;
            const grid_type = page.get('grid_type');
            const scale_units = page.get('scale_units');
            if (grid_type === 'square' && scale_units === 'ft') {
                const txAdjust = txSize <= pixPerSquare ? 0 : (txSize - pixPerSquare) / 2;
                const tyAdjust = tySize <= pixPerSquare ? 0 : (tySize - pixPerSquare) / 2;
                const pxAdjust = pxSize <= pixPerSquare ? 0 : (pxSize - pixPerSquare) / 2;
                const pyAdjust = pySize <= pixPerSquare ? 0 : (pySize - pixPerSquare) / 2;
                const xDif = Math.abs(txPos - pxPos);
                const yDif = Math.abs(tyPos - pyPos);
                const dist1 = xDif >= yDif ?
                    Math.max(xDif - txAdjust - pxAdjust, 0) :
                    Math.max(yDif - tyAdjust - pyAdjust, 0);
                const dist2 = xDif >= yDif ?
                    Math.max(yDif - tyAdjust - pyAdjust, 0) :
                    Math.max(xDif - txAdjust - pxAdjust, 0);
                // If the measurement method is set to 'auto' use the page setting,
                // unless the page is undefined - then use pythagorean.
                let measurementMethod;
                if (DiagonalMeasurementMethod === 'auto') {
                    if (page === undefined) {
                        measurementMethod = 'pythagorean';
                    }
                    else {
                        measurementMethod = page.get('diagonaltype');
                    }
                }
                else {
                    measurementMethod = DiagonalMeasurementMethod;
                }
                switch (measurementMethod) {
                    case 'foure':
                        // Return the largest distance
                        return dist1 - (pixPerSquare / 2);
                    case 'threefive':
                        // Return larger distance + 1/2 smaller distance rounded down to grid
                        return dist1 + (Math.floor(dist2 / pixPerSquare / 2) * pixPerSquare) - (pixPerSquare / 2);
                    case 'manhattan':
                        // Return the sum of distances
                        return dist1 + dist2 - (pixPerSquare / 2);
                    case 'pythagorean':
                        // Return exact distance, rounded to grid
                        return Math.sqrt(Math.pow(dist1, 2) + Math.pow(dist2, 2));
                    default:
                        Chat.send('GetDistance error - measurementMethod is invalid.<br>Distances could not be calculated.', 'error');
                }
            }
        }
        else {
            return undefined;
        }
    }
    /**
     * Tests if the current page is compatible with the API.
     */
    function checkPage(token) {
        const page = getObj('page', Campaign().get('playerpageid'));
        if (page === undefined)
            return false;
        if (token && token.get('_pageid') !== page.id)
            return false;
        let grid_type = '';
        let scale_units = '';
        if (page !== undefined) {
            grid_type = page.get('grid_type');
            scale_units = page.get('scale_units');
        }
        if (page !== undefined && grid_type === 'square' && scale_units === 'ft') {
            return true;
        }
        else {
            let msg = 'Current page is not compatible with PaladinAura due to the following settings:';
            if (page === undefined)
                msg += '<br>page: undefined';
            if (grid_type !== 'square')
                msg += '<br>grid_type: not \'square\'';
            if (scale_units !== 'ft')
                msg += '<br>scale_units: not \'ft\'';
            Chat.send(msg, 'warning');
        }
        return false;
    }
    // SECTION Function objects
    // ANCHOR State object
    const STATE = {
        get(val1, val2, val3) {
            if (val2 === undefined && val3 === undefined) {
                return state.PaladinAura[val1];
            }
            else if (val2 !== undefined && val3 === undefined) {
                return state.PaladinAura[val1][val2];
            }
            else if (val2 !== undefined && val3 !== undefined) {
                return state.PaladinAura[val1][val2][val3];
            }
            else {
                return undefined;
            }
        },
        set(newVal, val1, val2, val3) {
            if (val2 === undefined && val3 === undefined) {
                state.PaladinAura[val1] = newVal;
            }
            else if (val2 !== undefined && val3 === undefined) {
                state.PaladinAura[val1][val2] = newVal;
            }
            else if (val2 !== undefined && val3 !== undefined) {
                state.PaladinAura[val1][val2][val3] = newVal;
            }
        },
        delete(val1, val2, val3) {
            if (val2 === undefined && val3 === undefined) {
                delete state.PaladinAura[val1];
            }
            else if (val2 !== undefined && val3 === undefined) {
                delete state.PaladinAura[val1][val2];
            }
            else if (val2 !== undefined && val3 !== undefined) {
                delete state.PaladinAura[val1][val2][val3];
            }
        },
        PaladinList: {
            /**
             * Only use this function to add one-offs to the `PaladinList`.
             *
             * For larger operations use `get()` and `set()` or `modify()`.
             * @param paladinID A paladin ID.
             */
            push(paladinID) {
                const arr = Array.from(state.PaladinAura.PaladinList);
                arr.push(paladinID);
                STATE.PaladinList.set(arr);
            },
            /**
             * Only use this function to remove one-offs from the `PaladinList`.
             *
             * For larger operations use `get()` and `set()` or `modify()`.
             * @param paladinID The ID of the paladin to be removed.
             */
            remove(paladinID) {
                const palList = STATE.PaladinList.get();
                const index = palList.findIndex(pID => { return pID === paladinID; });
                if (index !== -1) {
                    palList.splice(index, 1);
                    STATE.PaladinList.set(palList);
                    // // Remove the token's character's paladin abilities
                    // const tokenObj = STATE.get('TokenList', paladinID) as TokenObj | undefined;
                    // if (tokenObj !== undefined && tokenObj.characterID !== undefined) {
                    //     const abilities = findObjs({
                    //         _type: 'ability',
                    //         _characterid: paladinID,
                    //     }) as Ability[];
                    //     const abilitiesToRemove = abilities.filter(a => {
                    //         return Paladin.paladinAbilities().some(b => { return b[0] === a.get('name'); });
                    //     });
                    //     abilitiesToRemove.forEach(a => {
                    //         a.remove();
                    //     });
                    // }
                }
            },
            get() {
                return Array.from(state.PaladinAura.PaladinList);
            },
            set(strArr) {
                state.PaladinAura.PaladinList = strArr;
            },
            modify({ add, remove }) {
                const input = add ? true : remove ? true : false;
                let palList = [];
                if (input) {
                    palList = STATE.PaladinList.get();
                }
                if (add) {
                    add.forEach(id => {
                        palList.push(id);
                    });
                }
                if (remove) {
                    remove.forEach(id => {
                        const index = palList.findIndex(e => { return e === id; });
                        if (index !== -1) {
                            palList.splice(index, 1);
                        }
                    });
                }
                if (input) {
                    STATE.PaladinList.set(palList);
                }
            },
            clear() {
                state.PaladinAura.PaladinList = [];
            },
        },
    };
    // ANCHOR Token object
    const Token = {
        addToken(token) {
            if (token.get('_subtype') === 'token') {
                const tokenObj = new TokenObj(token);
                STATE.set(tokenObj, 'TokenList', token.id);
                return tokenObj;
            }
            return undefined;
        },
        removeToken(token) {
            const tokenID = token.id || token.ID || undefined;
            if (tokenID && STATE.get('TokenList', tokenID) !== undefined) {
                STATE.PaladinList.remove(tokenID);
                STATE.delete('TokenList', tokenID);
                calcAndSetAllBonuses();
            }
        },
        getOrAddTokenObj(token) {
            let tObj = STATE.get('TokenList', token.id);
            if (tObj === undefined) {
                tObj = new TokenObj(token);
                STATE.set(tObj, 'TokenList', token.id);
            }
            return tObj;
        },
        setBonus(tokenObj, bonus) {
            const token = getObj('graphic', tokenObj.ID);
            if (token === undefined) {
                // Remove the TokenObj from the TokenList
                STATE.PaladinList.remove(tokenObj.ID);
            }
            else {
                // Show bonus on token
                if (bonus > 0) {
                    token.set(StatusMarker, bonus);
                }
                else {
                    token.set(StatusMarker, false);
                }
            }
            // if (ModifyAttributes && character !== undefined) {
            //     // TODO set bonus in attributes for characters
            //     // TODO set bonus in attrs for NPCs
            // }
        },
        /**
         * Tests if a token is in range of a paladin and gives them the aura bonus of the paladin with the highest bonus.
         * @param token A TokenObj that represents the token having its bonus calculated.
         */
        calcBonus(token) {
            const applicableBonuses = [];
            const palList = STATE.PaladinList.get();
            const paladinsToRemove = [];
            const character = token.characterID && getObj('character', token.characterID);
            palList.forEach(pID => {
                const paladin = STATE.get('TokenList', pID);
                let paladinProps;
                if (paladin) {
                    paladinProps = paladin.paladinProps;
                }
                if (paladin === undefined || paladinProps === undefined) {
                    paladinsToRemove.push(pID);
                }
                else {
                    const dist = getDistance(token, paladin);
                    if (dist !== undefined && dist <= Paladin.auraRange(paladin)) {
                        const chaBonusAttr = getAttrFromID(paladinProps.chaBonusAttrID);
                        const chaBonus = chaBonusAttr !== undefined ? chaBonusAttr.get('current') : 1;
                        let forceInclusion;
                        if (character)
                            forceInclusion = Paladin.getInclusion(paladin, character.id);
                        else
                            forceInclusion = Paladin.getInclusion(paladin, token.ID);
                        if (forceInclusion === true ||
                            (!token.isNPC && forceInclusion !== false)) {
                            applicableBonuses.push(+chaBonus);
                        }
                    }
                }
            });
            STATE.PaladinList.modify({ remove: paladinsToRemove });
            return Math.max(...applicableBonuses, 0);
        },
        /**
         * Updates the TokenObj position and size for the relevant token, and then
         * re-calculates the bonuses for all tokens that could have been affected
         * by its recent changes.
         * @param token A Token that has just been modified.
         */
        update(token) {
            if (token.get('_subtype') === 'token' && token.get('layer') === 'objects' && token.get('_pageid') === Campaign().get('playerpageid')) {
                const tObj = Token.getOrAddTokenObj(token);
                Token.updatePos(token, tObj);
                Token.updateSize(token, tObj);
                if (tObj.paladinProps === undefined) {
                    Token.setBonus(tObj, Token.calcBonus(tObj));
                }
                else {
                    calcAndSetAllBonuses();
                }
            }
        },
        /**
         * Updates the stored position of a graphic if it's linked to a token. If the
         * token is a paladin then all tokens will have their bonuses re-calculated.
         * @param Graphic The updated token.
         */
        updatePos(token, tObj) {
            tObj.xPos = token.get('left');
            tObj.yPos = token.get('top');
        },
        updateSize(token, tObj) {
            tObj.xSize = token.get('width');
            tObj.ySize = token.get('height');
        },
        updateAttrs(attr) {
            const name = attr.get('name');
            let val;
            let tokenObjs;
            switch (name) {
                case 'hp':
                    val = attr.get('current');
                    if (val) {
                        tokenObjs = Token.getTokenObjsFromCharID(attr.get('_characterid'));
                        if (tokenObjs) {
                            tokenObjs.forEach(t => {
                                Token.calcBonus(t);
                            });
                        }
                    }
                    break;
                default:
                    return;
            }
        },
        /**
         * Returns `true` if the provided `tokenID` is in the `PaladinList`, else `false`.
         * @param tokenID The token ID to check against the `PaladinList`.
         */
        tokenIsPaladin(tokenID) {
            return STATE.PaladinList.get().indexOf(tokenID) !== -1;
        },
        getTokenObjsFromCharID(charID) {
            const char = getObj('character', charID);
            if (char) {
                const tokenIDs = Object.keys(STATE.get('TokenList')).filter(k => {
                    return charID === STATE.get('TokenList', k, 'characterID');
                });
                return tokenIDs.map(id => { return STATE.get('TokenList', id); });
            }
        },
    };
    // ANCHOR Paladin object
    const Paladin = {
        paladinAbilities() {
            return [
                ['~ToggleAuraTarget', '!pa toggle @{selected|token_id} @{target|token_id}'],
            ];
        },
        /**
         * Returns the radius of the paladin's aura in pixels, or -1.
         * @param paladin The paladin TokenObj.
         */
        auraRange(paladin) {
            const pageID = Campaign().get('playerpageid');
            const page = getObj('page', pageID);
            if (paladin.paladinProps === undefined || paladin.paladinProps.levelAttrID === undefined) {
                log(`PA: Couldn't get paladin level for tokenObj with ID ${paladin.ID}.`);
                return -1;
            }
            else if (page === undefined) {
                log('PA: Couldn\'t calculate paladin aura because player page is undefined.');
                return -1;
            }
            else {
                const hpAttr = getAttrFromID(paladin.paladinProps.hpAttrID);
                const hp = hpAttr !== undefined ? hpAttr.get('current') : 0;
                const grid_type = page.get('grid_type');
                const scale_units = page.get('scale_units');
                if (+hp > 0 && grid_type === 'square' && scale_units === 'ft') {
                    const pixPerSquare = page.get('snapping_increment') * 70;
                    const scale_number = page.get('scale_number');
                    const levelAttr = getAttrFromID(paladin.paladinProps.levelAttrID);
                    const level = levelAttr !== undefined ? levelAttr.get('current') : 0;
                    switch (true) {
                        case +level < 6:
                            return -1;
                        case +level < 18:
                            return 10 * pixPerSquare / scale_number;
                        default:
                            return 30 * pixPerSquare / scale_number;
                    }
                }
                else {
                    return -1;
                }
            }
        },
        /**
         * Toggles whether the target receives an aura bonus from the supplied paladin.
         * @param paladinID The supplied paladin ID.
         * @param targetID The target ID.
         */
        toggleAuraForTarget(paladinID, targetID) {
            if (Token.tokenIsPaladin(paladinID)) {
                const paladinObj = STATE.get('TokenList', paladinID);
                const targetObj = STATE.get('TokenList', targetID);
                if (paladinObj.paladinProps === undefined) {
                    Chat.send('Could not toggle aura for target because supplied paladin has no paladin properties.', 'warning');
                }
                else {
                    const target = getObj('graphic', targetID);
                    if (target === undefined || target.get('_subtype') !== 'token' || target.get('layer') !== 'objects') {
                        Chat.send('Could not grant bonus to target, the target is not a token (possibly a drawing or card).', 'warning');
                    }
                    else {
                        const tIsNPC = targetObj && targetObj.isNPC;
                        const character = targetObj && targetObj.characterID && getObj('character', targetObj.characterID);
                        const forceInclusion = character ?
                            Paladin.getInclusion(paladinObj, character.id) :
                            Paladin.getInclusion(paladinObj, targetID);
                        let newVal;
                        if (forceInclusion !== undefined) {
                            if (character)
                                Paladin.toggleInclusion(paladinObj, character.id);
                            else
                                Paladin.toggleInclusion(paladinObj, targetID);
                        }
                        else {
                            newVal = tIsNPC ? 1 : 0;
                            if (character)
                                Paladin.addInclusion(paladinObj, character.id, newVal);
                            else
                                Paladin.addInclusion(paladinObj, targetID, newVal);
                        }
                        if (targetObj) {
                            Token.setBonus(targetObj, Token.calcBonus(targetObj));
                        }
                        else {
                            calcAndSetAllBonuses();
                        }
                    }
                }
            }
            else {
                Chat.send('The selected token is not registered as a paladin. Try restarting the API if this is an error.', 'error');
            }
        },
        /**
         * Gets the list of targets that this paladin has chosen to override
         * default behavior for from the paladin's attributes, and returns them
         * in a list.
         * @param paladinObj The supplied paladin objects.
         * @returns `[string, 0 | 1][]` or `undefined`.
         */
        getStoredInclusionList(paladinObj) {
            const paladinProps = paladinObj.paladinProps;
            if (paladinProps !== undefined) {
                const attrID = paladinProps.forceIncludeAttrID || '';
                const attr = getObj('attribute', attrID);
                if (attr) {
                    const attrString = attr.get('current');
                    if (attrString) {
                        const cases = [];
                        attrString.split(',').forEach(s => {
                            const parts = s.split('|');
                            cases.push([parts[0], +parts[1]]);
                        });
                        return cases;
                    }
                }
            }
        },
        storeInclusionList(paladinObj) {
            const paladinProps = paladinObj.paladinProps;
            if (paladinProps !== undefined &&
                paladinProps.forceIncludeArr !== undefined) {
                if (paladinProps.forceIncludeAttrID === undefined) {
                    paladinProps.forceIncludeAttrID = createObj('attribute', {
                        _characterid: paladinProps.characterID,
                        name: 'pa_force_include',
                    }).id;
                }
                const attr = getObj('attribute', paladinProps.forceIncludeAttrID);
                if (attr !== undefined) {
                    let newVal = '';
                    paladinProps.forceIncludeArr.forEach((a, b) => {
                        if (b > 0) {
                            newVal += ',';
                        }
                        newVal += `${a[0]}|${a[1]}`;
                    });
                    attr.setWithWorker('current', newVal);
                }
            }
        },
        getInclusionList(paladinObj) {
            const paladinProps = paladinObj.paladinProps;
            if (!(paladinProps === undefined ||
                paladinProps.forceIncludeArr === undefined)) {
                return paladinProps.forceIncludeArr;
            }
            else
                return [];
        },
        initFromStoredInclusionList(paladinObj) {
            if (paladinObj.paladinProps !== undefined) {
                paladinObj.paladinProps.forceIncludeArr = Paladin.getStoredInclusionList(paladinObj);
            }
        },
        getInclusion(paladinObj, targetID) {
            const inclusions = Paladin.getInclusionList(paladinObj);
            const thisInclusion = inclusions && inclusions.find(a => { return a[0] === targetID; });
            if (thisInclusion !== undefined) {
                const include = thisInclusion[1] === 1;
                return include;
            }
        },
        addInclusion(paladinObj, targetID, include) {
            if (paladinObj.paladinProps !== undefined) {
                if (paladinObj.paladinProps.forceIncludeArr !== undefined) {
                    const inclArr = Array.from(paladinObj.paladinProps.forceIncludeArr);
                    inclArr.push([targetID, include]);
                    paladinObj.paladinProps.forceIncludeArr = inclArr;
                }
                else {
                    paladinObj.paladinProps.forceIncludeArr = [[targetID, include]];
                }
                Paladin.storeInclusionList(paladinObj);
            }
        },
        toggleInclusion(paladinObj, targetID) {
            const list = Paladin.getInclusionList(paladinObj);
            const index = list.findIndex(a => { return a[0] === targetID; });
            list[index][1] = list[index][1] === 0 ? 1 : 0;
            if (paladinObj.paladinProps !== undefined) {
                paladinObj.paladinProps.forceIncludeArr = list;
                Paladin.storeInclusionList(paladinObj);
            }
            return list;
        },
    };
    const Chat = {
        send(msg, status, whisper) {
            let style = '<br><div style="text-align:center; background:#00646D; color:white; border-radius:8px; padding:6px">';
            if (status !== undefined) {
                if (status === 'success')
                    style = '<br><div style="text-align:center; background:#056D00; color:white; border-radius:8px; padding:6px">';
                else if (status === 'error')
                    style = '<br><div style="text-align:center; background:#6D0000; color:white; border-radius:8px; padding:6px">';
                else if (status === 'warning')
                    style = '<br><div style="text-align:center; background:#6D6100; color:white; border-radius:8px; padding:6px">';
            }
            sendChat('PaladinAura', (whisper ? `/w ${whisper} ` : '') + style + msg + '</div>');
        },
    };
    // !SECTION
    // ANCHOR Start of API
    const startup = function () {
        // STARTUP CHECKLIST
        // - Check settings
        // - Register Events
        registerEventHandlers();
        // - Perform first run
        pageLoad();
    };
    // ANCHOR Event functions
    /**
     * Overload workaround that just calls `pageLoad()`.
     */
    function triggerPageLoad() {
        const oldTokens = Object.keys(STATE.get('TokenList')).map(k => {
            return getObj('graphic', k);
        }).filter(t => { return t !== undefined; });
        oldTokens.forEach(t => {
            const token = getObj('graphic', t.id);
            if (token)
                token.set(StatusMarker, false);
        });
        pageLoad();
    }
    /**
     * Uses `checkPage()` to see if the current player page is appropriate
     * for PaladinAura, then storing the result in
     * `state.PaladinAura.PageLoad`.
     *
     * If the page is appropriate, it replaces the current TokenList and
     * PaladinList state objects with newly filled instances.
     *
     * If `override` is supplied as `true` or `false` it will force the page
     * to load, or not to load, respectively.
     */
    function pageLoad(override) {
        const run = override || checkPage();
        STATE.set(run, 'PageLoad');
        if (run) {
            STATE.PaladinList.clear();
            const tokenList = {};
            const pageTokens = findObjs({
                _pageid: Campaign().get('playerpageid'),
                _type: 'graphic',
                _subtype: 'token',
                layer: 'objects',
            });
            pageTokens.forEach(t => {
                const tokenObj = new TokenObj(t);
                tokenList[t.id] = tokenObj;
            });
            STATE.set(tokenList, 'TokenList');
            calcAndSetAllBonuses();
            Chat.send('= PaladinAura API Ready =', 'success', 'gm');
        }
        else {
            clearTokenList();
        }
    }
    /**
     * Runs whenever a page is modified. If the modified page is the one
     * the players are playing on, the page's new settings are checked.
     *
     * If the pages new settings change whether the page is appropriate,
     * `pageLoad()` is run.
     * @param p The page that has been modified.
     */
    function pageChange(p) {
        if (p.id === Campaign().get('playerpageid')) {
            const override = checkPage();
            if (override !== STATE.get('PageLoad'))
                pageLoad(override);
            else {
                setTimeout(() => {
                    calcAndSetAllBonuses();
                }, 1000);
            }
        }
    }
    // ANCHOR Misc
    const registerEventHandlers = function () {
        on('chat:message', handleInput);
        on('change:campaign:playerpageid', triggerPageLoad);
        on('change:page', pageChange);
        on('change:graphic', Token.update);
        on('add:graphic', Token.addToken);
        on('destroy:graphic', Token.removeToken);
        on('change:attribute', Token.updateAttrs);
        log('-=> PaladinAura Ready <=-');
    };
    return {
        Startup: startup,
    };
})();
on('ready', () => {
    PaladinAura.Startup();
});
