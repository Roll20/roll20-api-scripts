//if (typeof MarkStart != 'undefined') {MarkStart('MassCombat');}
/* Mass Combat
*
* A companion script for Kyburn's Mass Combat rule set: 
* https://docs.google.com/document/d/1-56AC-p57x-vr_BzszksjC55kTFK4d67XOzcIb1pWCY/edit?usp=sharing
*
* by Michael Greene (Volt Cruelerz)
*
*/

on('ready', () => {
    const mcname = 'MassCombat';
    const v = 0.9;
    const cache = {};
    let debugLog = false;

    // Debug Log
    const dlog = (str) => {
        if (debugLog) {
            log(str);
        }
    };

    // Initialize the state
    const ConfigureState = () => {
        if (!state.MassCombat) {
            state.MassCombat = {
                SavedInitiative: []
            };
        }
        if (!state.MassCombat.Version || state.MassCombat.Version < 0.8) {
            log('-=> Updating Mass Combat to version 0.8');
            state.MassCombat.Version = 0.8;
            state.MassCombat.OperationHistory = [];
            state.MassCombat.OperationHistorySize = 20;
            state.MassCombat.OpId = 0;
        } else if (state.MassCombat.Version < 0.9) {
            state.MassCombat.Version = 0.9;
        }
    }; ConfigureState();

    const getCharByAny = (nameOrId) => {
        let character = null;
      
        // Try to directly load the character ID
        character = getObj('character', nameOrId);
        if (character) {
            return character;
        }
      
        // Try to load indirectly from the token ID
        const token = getObj('graphic', nameOrId);
        if (token) {
            character = getObj('character', token.get('represents'));
            if (character) {
                return character;
            }
        }
      
        // Try loading through char name
        const list = findObjs({
            _type: 'character',
            name: nameOrId,
        });
        if (list.length === 1) {
            return list[0];
        }
      
        // Default to null
        return null;
    };

    const getAttrs = (char, attrName) => {
        const attr = filterObjs((obj) => {
            if (obj.get('type') === 'attribute'
                && obj.get('characterid') === char.id
                && obj.get('name') == attrName) {
                    return obj;
            }
        });
        if (!attr || attr.length === 0) {
            dlog('No Attr: ' + char + ': ' + attrName);
            return null;
        }
        return attr;
    }

    const getAttr = (char, attrName) => {
        let attr = getAttrs(char, attrName);
        if (!attr) {
            return null;
        }
        return attr[0];
    }

    const getAttrsFromSub = (char, substringName) => {
        const attrs = filterObjs((obj) => {
            if (obj.get('type') === 'attribute'
                && obj.get('characterid') === char.id
                && obj.get('name').indexOf(substringName) !== -1) {
                    return obj;
            }
        });
        if (!attrs || attrs.length === 0) {
            dlog('No Substr Attr: ' + char + ': ' + substringName);
            return null;
        }
        return attrs;
    }

    const getAttrFromSub = (char, substringName) => {
        return getAttrsFromSub(char, substringName)[0];
    }

    const setAttr = (charId, attrName, val) => {
        const attr = findObjs({
            type: 'attribute',
            characterid: charId,
            name: attrName,
        })[0];
        if (typeof attr === 'undefined' || attr == null) {
            const attr = createObj('attribute', { name: attrName, characterid: charId, current: val+'' });
        } else {
            attr.setWithWorker({
                current: val+'',
            });
        }
    };

    // Pulls the interior message out of carets (^)
    const Decaret = (quotedString) => {
        const startQuote = quotedString.indexOf('^');
        const endQuote = quotedString.lastIndexOf('^');
        if (startQuote >= endQuote) {
            if (!quietMode) {
                sendChat(drname, `**ERROR:** You must have a string within carets in the phrase ${string}`);
            }
            return null;
        }
        return quotedString.substring(startQuote + 1, endQuote);
    };

    const sizeCostArray = [0.01, 0.03, 0.1, 0.3, 1.0, 3.0];
    const creatureSize = {
        "Tiny": 0,
        "Small": 1,
        "Medium": 2,
        "Large": 3,
        "Huge": 4,
        "Gargantuan": 5
    };

    const getCreatureSize = (npcType) => {
        if (npcType.toLowerCase().includes('tiny')) {
            return creatureSize.Tiny;
        } else if (npcType.toLowerCase().includes('small')) {
            return creatureSize.Medium;
        } else if (npcType.toLowerCase().includes('medium')) {
            return creatureSize.Medium;
        } else if (npcType.toLowerCase().includes('large')) {
            return creatureSize.Large;
        } else if (npcType.toLowerCase().includes('huge')) {
            return creatureSize.Huge;
        } else if (npcType.toLowerCase().includes('gargantuan')) {
            return creatureSize.Gargantuan;
        } else {
            return -1;
        }
    };

    class Hero {
        constructor(name, hp, mhp) {
            this.Name = name;
            this.HP = hp;
            this.MHP = mhp;
        }
    }

    class Status {
        constructor(type, value) {
            this.Type = type;
            this.Value = value;
        }
    }

    const GetStatuses = (token) => {
        const rawStatus = token.get('statusmarkers');
        const oldStatusArray = rawStatus.split(',');
        const newStatusArray = [];
        let previousType = false;
        let prevStatus = null;
        oldStatusArray.forEach((entry) => {
            const statusFields = entry.split('@');
            const type = statusFields[0];
            const value = statusFields.length > 1
                ? statusFields[1]
                : true;
            let newStatus = null;
            // If we've already gotten one of this kind, we're seeing a duplicate, so add to previous
            if (type === previousType) {
                newStatus = prevStatus;
                prevStatus.Value = prevStatus.Value + value;
            } else {
                newStatus = new Status(type, value);
                newStatusArray.push(newStatus);
            }
            previousType = type;
            prevStatus = newStatus;
        });
        return newStatusArray;
    };

    const GetStatusValue = (token, type) => {
        const statuses = GetStatuses(token);
        for(let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            if (type === curStatus.Type) {
                const intVal = parseInt(curStatus.Value);
                if (isNaN(intVal)) {
                    return curStatus.Value;
                } else {
                    return intVal;
                }
            }
        }
        return false;
    };

    const StringifyStatus = (status) => {
        if (status.Value === true) {
            return status.Type;
        } else {
            const strVal = status.Value + "";
            const digitArray = strVal.split('');
            const valArray = [];
            for (let i = 0; i < digitArray.length; i++) {
                let char = digitArray[i];
                valArray.push(status.Type + '@' + char);
            }
            return valArray.join(',');
        }
    };

    const UpdateStatusValue = (token, type, value) => {
        let alreadyExists = false;
        const statuses = GetStatuses(token);
        for(let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            if (type === curStatus.Type) {
                curStatus.Value = value;
                alreadyExists = true;
                break;
            }
        }
        if (!alreadyExists) {
            statuses.push(new Status(type, value));
        }
        const statusStrings = [];
        for (let i = 0; i < statuses.length; i++) {
            const curStatus = statuses[i];
            statusStrings.push(StringifyStatus(curStatus));
        }
        const statusString = statusStrings.join(',');
        token.set('statusmarkers', statusString);
        return value;
    };

    const StatusIcons = {
        Routed: "status_chained-heart",
        Guard: "status_sentry-gun",
        Defend: "status_bolt-shield",
        Disorganized: "status_rolling-bomb",
        Recovering: "status_half-heart",
        Dead: "status_dead"
    };

    const StripStatus = (icon) => {
        const prefix = "status_";
        return icon.substr(prefix.length);
    }

    const LeftAlignDiv = {
        Open: `<div align="left" style="margin-left: 7px;margin-right: 7px">`,
        Close: '</div>'
    };

    const brTag = '<br>';

    const HTag = (str, tier, startLine = false, stopLine = false) => {
        let startTag = startLine ? brTag : '';
        let stopTag = stopLine ? brTag : '';
        return startTag + '<h' + tier + '>' + str + '</h' + tier + '>' + stopTag;
    };

    const Bold = (str, startLine = false, stopLine = false) => {
        let startTag = startLine ? brTag : '';
        let stopTag = stopLine ? brTag : '';
        return startTag + '<b>' + str + '</b>' + stopTag;
    };

    const ListItem = (str, startLine = false, stopLine = false) => {
        let startTag = startLine ? brTag : '';
        let stopTag = stopLine ? brTag : '';
        return startTag + '<li>' + str + '</li>' + stopTag;
    };

    const printBattleRating = (infExp, infCount, infTroops, cavExp, cavCount, cavTroops, arcExp, arcCount, arcTroops, magExp, magCount, magTroops, sctExp, sctCount, sctTroops, heroList) => {
        let totalExp = infExp + cavExp + arcExp + magExp + sctExp;
        totalExp = totalExp.toExponential(3);

        let armyOverview = `&{template:desc} {{desc=`
        + `<h3>Army Summary</h3>`
            + `<hr><h4>Battle Rating</h4>`
                + `<b>Total BR:</b> ${totalExp}`
            + (infCount + cavCount + arcCount + magCount + sctCount > 0 ? `<hr><h4>Force Details</h4>` : '')
                + (infCount > 0 ? `<br><b>Infantry:</b> ${infCount} formation` + (infCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${infTroops} infantrymen</p>` : '')
                + (cavCount > 0 ? `<br><b>Cavalry:</b> ${cavCount} formation` + (cavCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${cavTroops} cavalrymen</p>` : '')
                + (arcCount > 0 ? `<br><b>Archers:</b> ${arcCount} formation` + (arcCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${arcTroops} archers</p>` : '')
                + (magCount > 0 ? `<br><b>Mages:</b> ${magCount} formation` + (magCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${magTroops} mages</p>` : '')
                + (sctCount > 0 ? `<br><b>Scouts:</b> ${sctCount} formation` + (sctCount > 1 ? 's' : '') + `<p style="margin-left: 20px">${sctTroops} scouts</p>` : '')
            + (heroList.length > 0 ? `<hr><h4>Hero Details</h4>` : '');
        heroList.forEach((hero) => {
            armyOverview += `<p style="margin-left: 20px"><b>${hero.Name}</b>: ${hero.HP}/${hero.MHP}</p>`;
        });
        armyOverview += '}}';
        sendChat(mcname, armyOverview);
    };

    const sendChatToFormation = (formName, title, text) => {
        const msg = `/w "${formName}" &{template:desc} {{desc=<h3>${title}</h3><hr>${LeftAlignDiv.Open}${text}${LeftAlignDiv.Close}}}`;
        dlog(msg);
        sendChat(mcname, msg);
    };

    const sendChatToSource = (inMsg, outMsg) => {
        sendChat(mcname, `/w "${inMsg.who.replace(' (GM)', '')}" ${outMsg}`);
    };

    class Operation {
        constructor(name, formName, tokenId, barChanges, iconChanges) {
            this.Name = name;
            this.FormName = formName;
            this.TokenId = tokenId;
            this.BarChanges = barChanges;
            this.IconChanges = iconChanges;
            this.Timestamp = new Date().toUTCString();
            this.Id = state.MassCombat.OpId++;
        }
    }

    class Diff {
        constructor(type, oldVal, newVal) {
            this.Type = type;
            this.Old = oldVal;
            this.New = newVal;
        }
    }

    const AttrEnum = {
        HP: 'bar1_value',
        HPM: 'bar1_max',
        FP: 'bar2_value',
        FPM: 'bar2_max',
        CP: 'bar3_value',
        CPM: 'bar3_max'
    };

    const DiffDict = {};
    const InitDiffDict = () => {
        DiffDict[AttrEnum.HP] = 'Hit Points';
        DiffDict[AttrEnum.HPM] = 'Hit Point Max';
        DiffDict[AttrEnum.CP] = 'Chaos Points';
        DiffDict[AttrEnum.CPM] = 'Chaos Point Max';
        DiffDict[AttrEnum.FP] = 'Fatality Points';
        DiffDict[AttrEnum.FPM] = 'Fatality Point Max';
        DiffDict[StatusIcons.Routed] = 'Routed';
        DiffDict[StatusIcons.Guard] = 'Guarding';
        DiffDict[StatusIcons.Defend] = 'Defending';
        DiffDict[StatusIcons.Disorganized] = 'Disorganization';
        DiffDict[StatusIcons.Recovering] = 'Recovering';
        DiffDict[StatusIcons.Dead] = 'Dead';
    }; InitDiffDict();

    const addOperation = (operation) => {
        // Add the new one
        state.MassCombat.OperationHistory.push(operation);

        // If limit exceeded, remove the oldest
        if (state.MassCombat.OperationHistory.length > state.MassCombat.OperationHistorySize) {
            state.MassCombat.OperationHistory.splice(0, 1);
        }
    };

    const stringifyDiff = (diff) => {
        const type = DiffDict[diff.Type];
        const oldVal = diff.Old;
        const newVal = diff.New;
        
        // Don't print things that didn't happen to change
        if (oldVal === newVal) {
            return '';
        }

        return ListItem(`${Bold(type)}: ${oldVal} to ${newVal}`);
    };

    const rgbToHex = (rgb) => { 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    };

    const getAuraColor = (hp, maxHP) => {
        let half = maxHP*0.5;
        let perc = hp/half;
        let gVal = Math.floor(perc*255);
        let gHex = rgbToHex(gVal).toLowerCase();
        return '#ff' + gHex + '00';
    };

    const setTokenAura = (formToken, oldHP, newHP, maxHP) => {
        if (oldHP === newHP) {
            return;
        }
        let color = 'transparent';
        let showAura = false;
        let isDead = false;
        let size = 0.0;
        maxHP = maxHP > -1 
            ? maxHP 
            : (formToken.get(AttrEnum.HPM) || 0);
        if (newHP < 1) {
            isDead = true;
        } else if (newHP * 2 <= maxHP) {
            color = getAuraColor(newHP, maxHP);
            size = 12.6;
            showAura = true;
        }

        let params = {
            'aura1_radius': size,
            'aura1_color': color,
            'showplayers_aura1': showAura,
            'status_dead': isDead
        };

        dlog("Aura Params: " + JSON.stringify(params));
        
        formToken.set(params);
    };

    const revertOp = (op) => {
        const formToken = getObj('graphic', op.TokenId);
        log('Got Token');
        const barReverts = [];
        const iconReverts = [];
        let oldHP = -1;
        let newHP = -1;
        let maxHP = -1;

        log('Reverting Op ' + op.Name + ' with ' + op.BarChanges.length + ' bar changes and ' + op.IconChanges.length + ' icon changes.');

        // Revert changes to the bars
        for (let i = 0; i < op.BarChanges.length; i++) {
            const diff = op.BarChanges[i];
            const live = formToken.get(diff.Type);
            if (diff.Type === AttrEnum.HP) {
                oldHP = parseInt(formToken.get(AttrEnum.HP)) || 0;
                newHP = diff.Old;
            } else if (diff.Type === AttrEnum.HPM) {
                maxHP = parseInt(formToken.get(AttrEnum.HPM)) || 0 ;
            }
            barReverts.push(new Diff(diff.Type, live, diff.Old));
            dlog('Set ' + op.TokenId + '\' ' + diff.Type + ' from ' + live + ' to ' + diff.Old);
            formToken.set(diff.Type, diff.Old);
        }

        // Revert changes to icons
        for (let i = 0; i < op.IconChanges.length; i++) {
            const diff = op.IconChanges[i];
            const strippedType = StripStatus(diff.Type);
            const live = GetStatusValue(formToken, strippedType);
            iconReverts.push(new Diff(diff.Type, live, diff.Old));
            dlog('Set ' + op.TokenId + '\' ' + diff.Type + ' from ' + live + ' to ' + diff.Old);
            UpdateStatusValue(formToken, strippedType, diff.Old);
        }

        // Record the revert as its own revertible operation
        addOperation(new Operation(`Revert ${op.Id}`, op.FormName, op.TokenId, barReverts, iconReverts));

        // Update Auras
        if (oldHP !== -1) {
            setTokenAura(formToken, oldHP, newHP, maxHP);
        }

        // Print
        sendChatToFormation(op.FormName, 'Reverted', 'Successfully reverted ' + op.Name);
    };

    class MoraleFactor {
        constructor(name, value) {
            this.Name = name;
            this.Value = value;
        }
    }

    class Morale {
        constructor(commanderCha, factors) {
            this.CommanderCha = commanderCha;
            this.Factors = factors;
        }
    }

    const MoraleAttrName = 'mc_morale';

    const GetMorale = (char, cr) => {
        let attr = getAttr(char, MoraleAttrName);
        if (!attr) {
            dlog('Morale Attr does not exist yet');
            const commanderCha = (cr/2).toFixed(0);
            const factors = [
                new MoraleFactor('Rest', 0),
                new MoraleFactor('Food & Drink', 0),
                new MoraleFactor('Equipment', 0),
                new MoraleFactor('Compensation', 0),
                new MoraleFactor('Personal Stake', 0),
                new MoraleFactor('Prototype Might', 0),
                new MoraleFactor('Commander Prep', 0),
                new MoraleFactor('Treatment', 0),
                new MoraleFactor('Camaraderie', 0),
                new MoraleFactor('Terrain', 0),
                new MoraleFactor('Weather', 0)
            ];
            const morale = new Morale(commanderCha, factors);
            const moraleStr = JSON.stringify(morale);
            dlog('New Morale String: ' + moraleStr);
            setAttr(char.id, MoraleAttrName, moraleStr);
            return morale;
        }

        const attrCurrent = attr.get('current');
        dlog('Load existing morale attr.' + attrCurrent);
        return JSON.parse(attrCurrent);
    };

    const GetMoraleRating = (factors) => {
        // Sum factors
        let morale = 0;
        for (let i = 0; i < factors.length; i++) {
            morale += factors[i].Value;
        }

        // Get string
        let desc = '';
        if (morale <= -10) {
            desc = 'Openly Rebellious';
        } else if (morale <= -8) {
            desc = 'Mutinous';
        } else if (morale <= -4) {
            desc = 'Disgruntled';
        } else if (morale <= -2) {
            desc = 'Shaky';
        } else if (morale < 2) {
            desc = 'Average';
        } else if (morale < 4) {
            desc = 'Motivated';
        } else if (morale < 8) {
            desc = 'Stalwart';
        } else if (morale < 10) {
            desc = 'Fanatical';
        } else {
            desc = 'Unbreakable';
        }

        dlog('Get Morale Rating: ' + morale + ' = ' + desc);
        return {
            Value: morale,
            Description: desc
        };
    };

    const PrintMorale = (name, morale) => {
        const rating = GetMoraleRating(morale.Factors);
        const desc = rating.Description;
        const value = rating.Value;

        let moraleMsg = `${HTag(name, 4)}`
            + `${Bold('Commander CHA')}: ${morale.CommanderCha} [+/-](!mc -setMorale ?{Please enter new Commander Charisma modifier} ^CommanderCha^)<br/>`
            + `${Bold('Morale Rating')}: ${value} (${desc})<br/>`;

        // Begin formulating deltas for the roll string
        let deltas = morale.CommanderCha > 0
            ? '+' + morale.CommanderCha
            : morale.CommanderCha;
        deltas += '[Commander Charisma]';

        if (morale.Expand) {
            moraleMsg += `${HTag('Morale Factors', 4)}`;
        }
        for (let i = 0; i < morale.Factors.length; i++) {
            const factor = morale.Factors[i];
            if (morale.Expand) {
                moraleMsg += `${factor.Value} |`
                    + `[-](!mc -setMorale ${factor.Value-1} ^${factor.Name}^)`
                    + `[+](!mc -setMorale ${factor.Value+1} ^${factor.Name}^)`
                    + ` ${factor.Name}<br/>`;
            }

            if (factor.Value !== 0) {
                deltas += factor.Value > 0
                    ? '+' + factor.Value
                    : factor.Value;
                deltas += `[${factor.Name}]`;
            }
        }
        if (morale.Expand) {
            moraleMsg += '[Hide](!mc -setMorale 0 ^Expand^)';
        }
        else {
            moraleMsg += '<br/>[Expand](!mc -setMorale 1 ^Expand^)';
        }
        moraleMsg += `<hr>${HTag('Leadership Check', 4)}[[d20${deltas}]]`;
        
        dlog('Sending Morale to ' + name + ': ' + moraleMsg);
        sendChatToFormation(name, 'Morale', moraleMsg);
        return moraleMsg;
    };

    on('chat:message', (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.startsWith('!mc') !== true) return;
        
        let tokens = msg.content.split(' ');
        if (tokens.length < 2) return;
        let key = tokens[1];
        
        // BR sums
        let infExp = 0;
        let infCount = 0;
        let infTroops = 0;
        let cavExp = 0;
        let cavCount = 0;
        let cavTroops = 0;
        let arcExp = 0;
        let arcCount = 0;
        let arcTroops = 0;
        let magExp = 0;
        let magCount = 0;
        let magTroops = 0;
        let sctExp = 0;
        let sctCount = 0;
        let sctTroops = 0;

        // Upkeep sums
        let purchaseCost = 0;
        let upkeepCost = 0;

        // List of hero names
        let heroList = [];

        // Perform operations without needed selection
        if (key === '-overview' || key === '-o' || key === '-help') {
            let menuString = `&{template:desc} {{desc=`
            + LeftAlignDiv.Open
            + HTag('Battle', 3)
                + HTag('Damage', 4)
                    + `[Direct](!mc -damage ?{Damage Type|Battle|Chaos|Fatality} ?{Amount})`
                    + `[Scaled](!mc -scaledDamage ?{Damage Type|Battle|Chaos|Fatality} ?{Amount} ?{Scale})`
                + HTag('Disorganize', 4)
                    + `[Set](!mc -disorganize ?{Please type the new disorganization scale.  Type 'false' to remove existing disorganization})`
                    + `[Pop](!mc -popDisorganize ?{Are you sure you wish to pop disorganization|yes|no})`
                + HTag('Recovery', 4)
                    + `[Start](!mc -startRecover)`
                    + `[Finish](!mc -recover)`
                + HTag('Restore', 4)
                    + `[Heal](!mc -heal ?{Points of healing})`
                    + `[Long Rest](!mc -longrest ?{Sure you want to long rest|yes|no})`
                + HTag('Stance', 4)
                    + `[Guard](!mc -guard)`
                    + `[Defend](!mc -defend)`
                + HTag('Route', 4)
                    + `[Set](!mc -route ?{Route Degree|Not Routed,-1|0 Failures,0|1 Failure,1|2 Failures,2|3 Failures,3})`
                    + `[Tick](!mc -routeDamage)`
            + HTag('Stats', 3)
                + `[AC](!mc -ac)`
                + `[Speed](!mc -speed)`
                + `[Morale](!mc -morale)`
            + HTag('Initiative', 3)
                + `[Save](!mc -saveInitiative ?{Are you sure you wish to SAVE initiative|yes|no})`
                + `[Load](!mc -loadInitiative ?{Are you sure you wish to LOAD initiative|yes|no})`
            + HTag('Other', 3)
                + `[Upkeep](!mc -upkeep)`
                + `[BR](!mc -battleRating)`
                + `[History](!mc -history)`
            + LeftAlignDiv.Close
            + `}}`;
            sendChatToSource(msg, menuString);
            return;
        } else if (key === '-saveInitiative') {
            if (tokens.length < 3) return;
            if (tokens[2] !== 'yes') return;
            let turnorder = [];
            let existingOrder = Campaign().get('turnorder');
            if (existingOrder != '') {
                turnorder = JSON.parse(existingOrder);
            } else {
                sendChat(mcname, 'ERROR: There is no initiative order to save.');
                return;
            }
            state.MassCombat.SavedInitiative = turnorder;
            let saveMessage = `&{template:desc} {{desc=Turn Order Saved.}}`;
            sendChat(mcname, saveMessage);
            return;
        } else if (key === '-loadInitiative') {
            if (tokens.length < 3) return;
            if (tokens[2] !== 'yes') return;
            Campaign().set('turnorder', JSON.stringify(state.MassCombat.SavedInitiative));
            state.MassCombat.SavedInitiative = [];
            let saveMessage = `&{template:desc} {{desc=Turn Order Loaded.}}`;
            sendChat(mcname, saveMessage);
            return;
        } else if (key === '-history') {
            let text = '';
            for (let i = 0; i < state.MassCombat.OperationHistory.length; i++) {
                const op = state.MassCombat.OperationHistory[i];
                let opStr = HTag(`[${op.Id}] ${op.Name}`, 4);
                opStr += Bold('Target') + ': ' + op.FormName + brTag;
                opStr += Bold('Time') + ': ' + op.Timestamp + brTag;
                opStr += '<ul>';
                let preLeng = opStr.length;
                for (let j = 0; j < op.BarChanges.length; j++) {
                    opStr += stringifyDiff(op.BarChanges[j]);
                }
                for (let j = 0; j < op.IconChanges.length; j++) {
                    let changes = op.IconChanges[j];
                    let iconChangeString = stringifyDiff(changes);
                    opStr += iconChangeString;
                }
                let postLeng = opStr.length;
                opStr += '</ul>';
                opStr += `[Revert](!mc -revert ${op.Id})`;

                // Don't paste an empty op that did nothing
                if (postLeng > preLeng) {
                    text += opStr;
                }
            }
            const historyStr = `&{template:desc} {{desc=<h3>History</h3><hr>${LeftAlignDiv.Open}${text}${LeftAlignDiv.Close}}}`;
            sendChatToSource(msg, historyStr);
            return;
        } else if (key === '-clearHistory') {
            if (tokens.length < 3) return;
            if (tokens[2] !== 'yes') return;
            state.MassCombat.OperationHistory = [];
            sendChat(mcname, 'Cleared Op History');
            return;
        } else if (key === '-revert') {
            if (tokens.length < 3) return;
            const id = parseInt(tokens[2]);
            if(isNaN(id)) return;
            for (let i = 0; i < state.MassCombat.OperationHistory.length; i++) {
                const op = state.MassCombat.OperationHistory[i];
                if (op.Id === id) {
                    revertOp(op);
                    return;
                }
            }
        }

        // Iterate through selected tokens
        if (!msg.selected) return;
        let processed = 0;

        // Wait Duration Warning Messages
        let wait = 0;
        if (msg.selected.length > 0) {
            if (key === '-battleRating'){
                sendChat(mcname, 'Calculating Battle Rating.  This may take a few moments...');
                wait = 100;
            } else if (key === '-upkeep'){
                sendChat(mcname, 'Calculating Upkeep.  This may take a few moments...');
                wait = 100;
            }
        } else {
            sendChatToSource(msg, 'You must select a token for the command you selected.');
        }
        setTimeout(() => {
            msg.selected.forEach((selection) => {
                _.defer(() => {
                    processed++;
                    
                    // Load token data.  Unfortunately, we can't use the cache for this because you could have mook tokens with different hp bars
                    let formToken = getObj('graphic', selection._id);
                    let formationType = formToken.get('represents');
                    let formName = formToken.get('name');
                    let hp = parseInt(formToken.get(AttrEnum.HP)) || 0;
                    let hpm = parseInt(formToken.get(AttrEnum.HPM)) || 0 ;
                    let fp = parseInt(formToken.get(AttrEnum.FP)) || 0;
                    let cp = parseInt(formToken.get(AttrEnum.CP)) || 0 ;
                    dlog(`Operation ${key} on ${formName} with ${hp}/${fp}/${cp}/${hpm}`);
    
                    // Load charsheet data.  Use a cache for this
                    let cacheEntry = cache[formationType];
                    if (!cacheEntry) {
                        buildNewEntry = true;
                        let char = getCharByAny(formationType);

                        // Discount accidental selections of unowned tokens or graphics
                        if (!char) {
                            return;
                        }

                        // Filter NPCs vs PCs
                        const npcAttr = getAttr(char, 'npc');
                        let isNPC = false;
                        if (npcAttr && (isNPC = npcAttr.get('current'))) {
                            let traits = getAttrsFromSub(char, 'npctrait');

                            // Discount non-formation NPCs
                            if (!traits) {
                                heroList.push(new Hero(formName, hp, hpm));
                                return;
                            }

                            // Get formation values
                            let formationTraitArray = traits.filter(trait => trait.get('current').includes('Formation of'));
                            if(formationTraitArray.length === 0) {
                                cacheEntry = {
                                    char: char,
                                    isNPC: isNPC,
                                    isHero: true,
                                    npcType: getAttr(char, 'npc_type').get('current'),
                                    cr: parseInt(getAttr(char, 'npc_challenge').get('current')),
                                    xp: parseInt(getAttr(char, 'npc_xp').get('current')),
                                    traits: traits,
                                    formationTraitArray: formationTraitArray
                                };
                            } else {
                                let formDetails = formationTraitArray[0].get('current');
                                cacheEntry = {
                                    char: char,
                                    isNPC: isNPC,
                                    isHero: false,
                                    npcType: getAttr(char, 'npc_type').get('current'),
                                    cr: parseInt(getAttr(char, 'npc_challenge').get('current')),
                                    xp: parseInt(getAttr(char, 'npc_xp').get('current')),
                                    ac: parseInt(getAttr(char, 'npc_ac').get('current')),
                                    speed: parseInt(getAttr(char, 'npc_speed').get('current')),
                                    traits: traits,
                                    formationTraitArray: formationTraitArray,
                                    formDetails: formDetails
                                };
                            }
                        } else {
                            cacheEntry = {
                                char: char,
                                isNPC: isNPC,
                                isHero: true
                            };
                        }
                        cache[formationType] = cacheEntry;
                    }
                    if (cacheEntry.isHero) {
                        dlog(`Selected ${formName} is not an NPC`);
                        heroList.push(new Hero(formName, hp, hpm));
                        if (processed === msg.selected.length) {
                            if (key === '-battleRating') {
                                printBattleRating(infExp, infCount, infTroops, cavExp, cavCount, cavTroops, arcExp, arcCount, arcTroops, magExp, magCount, magTroops, sctExp, sctCount, sctTroops, heroList);
                            } else if (key === '-upkeep') {
                                sendChat(mcname, `&{template:desc} {{desc=<h3>Army Cost</h3><hr>Procurement Cost: <b>${purchaseCost}</b><br>Upkeep: <b>${upkeepCost}gp</b><hr>(plus mounts and gear for troops if relevant)}}`);
                            }
                        }
                        return;
                    }
                    let npcType = cacheEntry.npcType;
                    let cr = cacheEntry.cr;
                    let xp = cacheEntry.xp;
                    let formDetails = cacheEntry.formDetails;
                    let formTokens = formDetails.split(' ');
                    let formType = formTokens[0];
                    let protoCount = parseInt(formTokens[3]);
                    let recruitSource = formTokens[4];
                    let sourceCreature = formTokens[4];
                    if (formTokens.length > 5) {
                        let sourceCreatureIndex = formDetails.indexOf(formTokens[5]);
                        dlog('Source Index: ' + sourceCreatureIndex);
                        sourceCreature = formDetails.substr(sourceCreatureIndex);
                    }
    
                    dlog(`${npcType} NPC of ${protoCount} CR ${cr} ${sourceCreature} recruited via ${recruitSource}`);
    
                    if (key === '-damage' || key === '-scaledDamage') {
                        if (tokens.length < 4) return;
                        let type = tokens[2];
                        let amount = parseInt(tokens[3]);
                        if (key === '-scaledDamage') {
                            if (tokens.length < 5) return;
                            let damageScale = parseInt(tokens[4]);
                            amount *= damageScale;
                        }
                        let chaosBurn = hp-amount < 0 
                            ? hp-amount 
                            : 0;
                        let fatalZone = hp-amount >= 0
                            ? amount
                            : amount - hp;
                        dlog(`Received ${amount} ${type} damage.  ChaosBurn: ${chaosBurn}, FatalZone: ${fatalZone}`);
                        let remHP = Math.max(0, hp-amount);
                        let iconChanges = [];
                        if (remHP < 1) {
                            iconChanges.push(new Diff(StatusIcons.Dead, hp < 1, true));
                        }
                        setTokenAura(formToken, hp, remHP, hpm);
                        if (type === 'Battle') {
                            const newFP = fp + 0.25 * fatalZone + chaosBurn;
                            const newCP = Math.max(0, cp + amount / 2 + chaosBurn);
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.CP, newCP);
                            formToken.set(AttrEnum.FP, newFP);
                            const operation = new Operation('Battle Damage', formName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, remHP),
                                new Diff(AttrEnum.CP, cp, newCP),
                                new Diff(AttrEnum.FP, fp, newFP)
                            ], iconChanges);
                            addOperation(operation);
                        } else if (type === 'Chaos') {
                            const newCP = Math.max(0, cp + amount + chaosBurn);
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.CP, newCP);
                            const operation = new Operation('Chaos Damage', formName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, remHP),
                                new Diff(AttrEnum.CP, cp, newCP)
                            ], iconChanges);
                            addOperation(operation);
                        } else if (type === 'Fatality') {
                            const newFP = fp + fatalZone + chaosBurn;
                            const newCP = Math.max(0, cp + chaosBurn);
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.FP, newFP);
                            formToken.set(AttrEnum.CP, newCP);
                            const operation = new Operation('Fatality Damage', formName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, remHP),
                                new Diff(AttrEnum.CP, cp, newCP),
                                new Diff(AttrEnum.FP, fp, newFP)
                            ], iconChanges);
                            addOperation(operation);
                        } else {
                            sendChat(mcname, 'Invalid Damage Type.');
                            return;
                        }
                        sendChatToFormation(formName, 'Damage Received', `<b>Victim:</b> ${formDetails}<br><b>Damage:</b> ${amount} ${type}`);
                    } else if (key === '-routeDamage') {
                        let remHP = Math.max(0, hp-hpm*.1);
                        let iconChanges = [];
                        if (remHP < 1) {
                            iconChanges.push(new Diff(StatusIcons.Dead, hp < 1, true));
                        }
                        setTokenAura(formToken, hp, remHP, hpm);
                        const newCP = cp + hpm*.1;
                        formToken.set(AttrEnum.HP, remHP);
                        formToken.set(AttrEnum.CP, newCP);
                        const operation = new Operation('Route Tick', formName, selection._id,
                        [
                            new Diff(AttrEnum.HP, hp, remHP),
                            new Diff(AttrEnum.CP, cp, newCP)
                        ], iconChanges);
                        addOperation(operation);
                        sendChatToFormation(formName, 'Routed Tick', `<b>Victim:</b> ${formDetails}<br><b>Damage:</b> ${hpm*.1}`);
                    } else if (key === '-startRecover') {
                        formToken.set(StatusIcons.Recovering, true);
                        addOperation(new Operation('Start Recover', formName, selection._id, [], [new Diff(StatusIcons.Recovering, false, true)]));
                    } else if (key === '-recover') {
                        formToken.set(StatusIcons.Recovering, false);
                        const newHP = Math.min(hpm, hp+cp);
                        formToken.set(AttrEnum.HP, newHP);
                        formToken.set(AttrEnum.CP, 0);
                        const operation = new Operation('Finish Recovery', formName, selection._id,
                            [ new Diff(AttrEnum.HP, hp, newHP), new Diff(AttrEnum.CP, cp, 0) ], 
                            [ new Diff(StatusIcons.Recovering, true, false) ]);
                        addOperation(operation);
                        setTokenAura(formToken, hp, newHP, hpm);
                        sendChatToFormation(formName, 'Recovery', `<b>Benefactor:</b> ${formDetails}<br><b>Regerated:</b> ${cp}`);
                    } else if (key === '-disorganize') {
                        if (tokens.length < 3) return;
                        let type = StripStatus(StatusIcons.Disorganized);
                        const oldVal = GetStatusValue(formToken, type);
                        let disorganizeScale = parseInt(tokens[2]);
                        formToken.set(StatusIcons.Disorganized, "" + disorganizeScale);
                        UpdateStatusValue(formToken, type, disorganizeScale);
                        addOperation(new Operation('Disorganize', formName, selection._id, [], [new Diff(StatusIcons.Disorganized, oldVal, disorganizeScale)]));
                    } else if (key === '-popDisorganize') {
                        if (tokens.length < 3) return;
                        if (tokens[2] !== 'yes') return;
                        let type = StripStatus(StatusIcons.Disorganized);
                        const popScale = GetStatusValue(formToken, type);
                        dlog('Disorganization Scale of Token: ' + popScale);
                        if (popScale !== true) {
                            let amount = hpm * 0.05 * popScale;
                            dlog(`Popping Disorganized ${formName}, dealing ${amount} direct damage due to scale ${popScale}`);
                            let remHP = Math.max(0, hp-amount);
                            setTokenAura(formToken, hp, remHP, hpm);
                            const newFP = fp + amount;
                            formToken.set(AttrEnum.HP, remHP);
                            formToken.set(AttrEnum.FP, newFP);
                            formToken.set(StatusIcons.Disorganized, false);
                            const operation = new Operation('Pop Disorganized', formName, selection._id,
                                [ new Diff(AttrEnum.HP, hp, remHP), new Diff(AttrEnum.FP, fp, newFP) ], 
                                [ new Diff(StatusIcons.Disorganized, popScale, false) ]);
                            addOperation(operation);
                            sendChatToFormation(formName, 'Disorganization Popped', `<b>Victim:</b> ${formDetails}<br><b>Damage:</b> ${amount} fatality`);
                        } else {
                            sendChat(mcname, 'That token was not marked as disorganized!  Unable to pop.');
                        }
                    } else if (key === '-longrest') {
                        if (tokens.length < 3) return;
                        if (tokens[2] !== 'yes') return;
                        let newMax = hpm - fp;
                        let reduxPerc = 1 - newMax/hpm;
                        reduxPerc = +reduxPerc.toFixed(2);
                        formToken.set(AttrEnum.HP, newMax);
                        formToken.set(AttrEnum.HPM, newMax);
                        formToken.set(AttrEnum.FP, 0);
                        formToken.set(AttrEnum.FPM, newMax);
                        formToken.set(AttrEnum.CP, 0);
                        formToken.set(AttrEnum.CPM, newMax);
                        setTokenAura(formToken, hp, newMax, newMax);
                        let reduxScalar = 1-reduxPerc;
                        addOperation(new Operation('Long Rest', formName, selection._id,
                            [
                                new Diff(AttrEnum.HP, hp, newMax),
                                new Diff(AttrEnum.HPM, hpm, newMax),
                                new Diff(AttrEnum.CP, cp, 0),
                                new Diff(AttrEnum.CPM, hpm, newMax),
                                new Diff(AttrEnum.FP, fp, 0),
                                new Diff(AttrEnum.FPM, hpm, newMax)
                            ], []));
                        sendChatToFormation(formName, 'Long Rest', `${formName} has had CP converted to HP.<br>Requires manual reduction in damage by <b>${100*reduxPerc}%</b><br>(multiply by ${reduxScalar.toFixed(2)})`);
                    } else if (key === '-upkeep') {
                        let upkeep = 0;
                        let buyPrice = 0;
                        let buyString = '0';
                        let formType = '';
                        if (npcType.toLowerCase().includes('undead')) {
                            upkeep = cr * protoCount * 0.1;
                            buyPrice = cr * protoCount * 20;
                            buyString = `Creation: <b>${buyPrice}gp</b><br>`;
                        } else if (npcType.toLowerCase().includes('construct')) {
                            upkeep = cr * protoCount * 0.2;
                            buyPrice = cr * protoCount * 50;
                            buyString = `Creation: <b>${buyPrice}gp</b><br>`;
                        } else if (npcType.toLowerCase().includes('plant')) {
                            upkeep = cr * protoCount * 0.2;
                            buyPrice = cr * protoCount;
                            buyString = `Creation: <b>${buyPrice}gp</b><br>`;
                        } else {
                            let sizeMod = sizeCostArray[getCreatureSize(npcType)];
                            let recruitMod = 1;
                            buyString = '';
                            formType = 'Mercenary ';
                            buyPrice = cr * protoCount;
                            if (recruitSource === 'Levied') {
                                recruitMod = 0.5;
                                buyString = `Procurement: <b>${buyPrice}gp</b><br>`;
                                formType = 'Levied ';
                            }
                            dlog(`Size Mod: ${sizeMod}  CR: ${cr}  Count: ${protoCount}  Recruit Mod: ${recruitMod}`);
                            upkeep = (sizeMod + cr) * protoCount * recruitMod;
                        }
                        upkeep = +upkeep.toFixed(2);
                        purchaseCost += buyPrice;
                        upkeepCost += upkeep;
                        if (msg.selected.length === 1) {
                            sendChat(mcname, `&{template:desc} {{desc=<h3>${formType}${formName} Cost</h3><hr>${buyString}Upkeep: <b>${upkeep}gp</b><hr>(plus mounts and gear for ${protoCount} ${sourceCreature} if relevant)}}`);
                            return;
                        }
                        if (processed === msg.selected.length) {
                            sendChat(mcname, `&{template:desc} {{desc=<h3>Army Cost</h3><hr>Procurement Cost: <b>${purchaseCost}</b><br>Upkeep: <b>${upkeepCost}gp</b><hr>(plus mounts and gear for troops if relevant)}}`);
                        }
                    } else if (key === '-battleRating') {
                        dlog('Calc Battle Rating');
                        switch (formType.toLowerCase()) {
                            case 'infantry':
                                infExp += protoCount * xp;
                                infCount++;
                                infTroops += protoCount;
                                break;
                            case 'cavalry':
                                cavExp += protoCount * xp;
                                cavCount++;
                                cavTroops += protoCount;
                                break;
                            case 'archers':
                            case 'archer':
                                arcExp += protoCount * xp;
                                arcCount++;
                                arcTroops += protoCount;
                                break;
                            case 'mage':
                            case 'mages':
                                magExp += protoCount * xp;
                                magCount++;
                                magTroops += protoCount;
                                break;
                            case 'scout':
                            case 'scouts':
                                sctExp += protoCount * xp;
                                sctCount++;
                                sctTroops += protoCount;
                                break;
                            default:
                                dlog('Invalid Formation Type: ' + formType);
                                sendChat(mcname, 'Invalid Formation Type: ' + formDetails);
                                return;
                        }
                        if (processed === msg.selected.length) {
                            _.defer(() => {
                                printBattleRating(infExp, infCount, infTroops, cavExp, cavCount, cavTroops, arcExp, arcCount, arcTroops, magExp, magCount, magTroops, sctExp, sctCount, sctTroops, heroList);
                            });
                        }
                    } else if (key === '-defend') {
                        const isDefending = formToken.get(StatusIcons.Defend);
                        formToken.set(StatusIcons.Defend, !isDefending);
                        addOperation(new Operation('Defending', formName, selection._id, [], [new Diff(StatusIcons.Defend, isDefending, !isDefending)]));
                    } else if (key === '-guard') {
                        const isGuarding = formToken.get(StatusIcons.Guard);
                        formToken.set(StatusIcons.Guard, !isGuarding);
                        addOperation(new Operation('Guarding', formName, selection._id, [], [new Diff(StatusIcons.Guard, isGuarding, !isGuarding)]));
                    } else if (key === '-route') {
                        formToken.set(StatusIcons.Guard, false);
                        formToken.set(StatusIcons.Defend, false);
                        if (tokens.length < 3) return;
                        let newRouteValue = parseInt(tokens[2]);
                        if (newRouteValue === -1) {
                            formToken.set(StatusIcons.Routed, false);
                        } else if (newRouteValue === 0) {
                            formToken.set(StatusIcons.Routed, true);
                        } else if (newRouteValue === 1) {
                            formToken.set(StatusIcons.Routed, "1");
                        } else if (newRouteValue === 2) {
                            formToken.set(StatusIcons.Routed, "2");
                        } else {
                            formToken.set(StatusIcons.Routed, false);
                            formToken.set(StatusIcons.Dead, true);
                        }
                    } else if (key === '-heal') {
                        if (tokens.length < 3) return;
                        let healVal = parseInt(tokens[2]);
                        let missingVitality = hpm - fp - cp - hp;
                        let realHeal = Math.min(healVal, missingVitality);
                        dlog(`Attempting Heal of ${healVal}, which was reduced to ${realHeal}`);
                        const newHP = hp + realHeal;
                        formToken.set(AttrEnum.HP, newHP);
                        const capString = realHeal < healVal
                            ? `, capped at <b>${realHeal}`
                            : ``;
                        const operation = new Operation('Heal', formName, selection._id, [ new Diff(AttrEnum.HP, hp, newHP) ], []);
                        addOperation(operation);
                        setTokenAura(formToken, hp, newHP, hpm);
                        sendChatToFormation(formName, 'Healing Received', `<b>Recipient:</b> ${formDetails}<br><b>Healing</b>: ${healVal}${capString}`);
                    } else if (key === '-ac') {
                        sendChatToSource(msg, `${formName}'s AC: ${cacheEntry.ac}`);
                    } else if (key === '-speed') {
                        sendChatToSource(msg, `${formName}'s Speed: ${cacheEntry.speed}`);
                    } else if (key === '-morale') {
                        const char = getCharByAny(formationType);
                        let morale = cacheEntry.Morale ? cacheEntry.Morale : GetMorale(char, cr);
                        cacheEntry.Morale = morale;
                        PrintMorale(formName, morale);
                    } else if (key === '-setMorale') {
                        if (msg.selected.length > 1) {
                            sendChatToSource(msg, 'Error: set morale does not support multiselect.');
                            return;
                        }
                        if (tokens.length < 4) return;
                        let newVal = parseInt(tokens[2]);
                        let factorName = Decaret(msg.content);
                        dlog('Updating Factor ' + factorName + ' to ' + newVal);
                        
                        // Load existing
                        const char = getCharByAny(formationType);
                        let morale = cacheEntry.Morale ? cacheEntry.Morale : GetMorale(char, cr);

                        // Mutate
                        if (factorName === 'CommanderCha') {
                            morale.CommanderCha = newVal;
                        } else if (factorName === 'Expand') {
                            morale.Expand = newVal === 1;
                        } else {
                            for (let i = 0; i < morale.Factors.length; i++) {
                                const factor = morale.Factors[i];
                                if (factor.Name === factorName) {
                                    factor.Value = newVal;
                                    break;
                                }
                            }
                        }

                        // Save
                        const moraleStr = JSON.stringify(morale);
                        setAttr(formationType, MoraleAttrName, moraleStr);
                        cacheEntry.Morale = morale;

                        // Print
                        PrintMorale(formName, morale);
                    } else {
                        dlog('Unrecognized Input');
                        sendChatToSource(msg, 'Unrecognized input.');
                    }
                });
            });
        }, wait);
    });

    log(`-=> ${mcname} v${v} online. <=-`);
});
//if (typeof MarkStop != 'undefined') {MarkStop('MassCombat');}
