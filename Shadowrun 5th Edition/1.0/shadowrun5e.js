class Character {
    constructor(characterID) {
        this.name = getAttrByName(characterID, 'character_name');
        this.id = characterID;
        this.token = this.getTokenId(characterID);
        this.src = this.getTokenURL(characterID);
    }

    getTokenId(id) {
        return findObjs({represents: id, _type: "graphic"})[0].attributes["_id"]
    }

    getTokenURL(id) {
        return findObjs({represents: id, _type: "graphic"})[0].attributes["imgsrc"]
    }
}

class InitiativeTurn {
  constructor(total, id, name) {
    this.pr = total;
    this.id = id ? id : undefined;
    this.custom = name ? name : undefined;
  }
}

//:+:+:+:+:+: HELPER FUNCTIONS :+:+:+:+:+: //
const sr5HelperFunctions = {
    d6: () => Math.floor(Math.random() * 5) + 1,

    getCharacterAttr: (characterID, name) =>  findObjs({characterid : characterID, "name": name}),
    getTokenAttributes: tokenID => findObjs({_id: tokenID, _type: "graphic"}),

    getCharacterIdFromTokenId: tokenID => sr5HelperFunctions.getTokenAttributes(tokenID)[0].attributes.represents,

    getTokenURL: id => findObjs({represents: id, _type: "graphic"})[0].attributes["imgsrc"],
    getTokenId: id => findObjs({represents: id, _type: "graphic"})[0].attributes["_id"],

    getTokenAttrsFromCharacterId: id => findObjs({represents: id, _type: "graphic"}),

    //Status icons
    getStatusIcons: tokenId => findObjs({_id: tokenId, _type: "graphic"})[0].attributes['statusmarkers'],

    //Used to get character attributes for Linking Tokens
    getIDsFromTokens: selectedToken => {
        return [selectedToken].map(obj => getObj("graphic", obj._id))
            .filter(x => !!x)
            .map(token => token.get("represents"))
            .filter(id => getObj("character", id || ""));
    },

    //Used to verify a token represents a character before trying to Link Tokens.
    getTokenRepresents: selectedToken => [selectedToken].map(obj => getObj("graphic", obj._id)).map(token => token.get("represents")),

    //Sheet type examples 'sprite', 'host', 'vehicle', 'grunt', 'pc'....
    getSheetType: id => getAttrByName([id], 'sheet_type'),

    //Find the index of an object in an array based on a value
    findIndex: (property, match) => property.findIndex(element => Object.values(element).includes(match)),

    //Sort in Descending order
    sortDescending: (array, key) => array.sort((a,b) => a[key] > b[key] ? -1 : 1)
}
//:+:+:+:+:+: END HELPER FUNCTIONS :+:+:+:+:+: //

var sr5api = sr5api || (function() {
    'use strict';
    const primary = '#610b0d', secondary = '#666', third = '#e7e6e5';
    const divstyle   = 'style="color: #eee;width: 90%; border: 1px solid black; background-color: #131415; padding: 5px;"';
    const astyle     = `style="text-align:center; border: 1px solid black; margin: 3px; padding: 2px; background-color: ${primary}; border-radius: 4px;  box-shadow: 1px 1px 1px ${secondary}; width: 150px;"`;
    const arrowstyle = `style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ${secondary}; margin: 5px 0px;"`;
    const headstyle  = `style="color: #fff; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif; margin-bottom: 2px;"`;
    const substyle   = 'style="font-size: 0.8em; line-height: 13px; margin-top: -2px; font-style: italic;"';
    const breaks     = `style="border-color:${third}; margin: 5px 2px;"`;
    const centered   = `style="text-align:center;"`;
    const version    = '1';
    const header     = `<div ${divstyle}><div ${headstyle}>Shadowrun 5th Edition <span ${substyle}>(v.${version})</span></div><div ${arrowstyle}>`;
    const errorMessage = (name, error) => log(`${name}: ${error}`)

    const handleInput = msg => {
        const args = msg.content.split(" --");
        if (args[0] === "!sr5" && msg.type === "api") {
            const noTokensSelected = `<div ${centered}>No tokens selected.</div>`;
            switch(args[1]) {
                case "linkToken":
                    msg.selected != undefined ? linkTokens(msg.selected) : msg.selected === undefined ? chatMessage(noTokensSelected) : apiMenu();
                    break;
                case "initCounter":
                    addInitiativeCounter()
                    break;
                case "rollInit":
                    msg.selected != undefined ? rollInitaitve(msg.selected) : msg.selected === undefined  ? chatMessage(noTokensSelected) : apiMenu();
                    break;
                default:
                    apiMenu()
            }
        } else if (msg.who === 'Sr5 Roll Initiative') {
            processIniatitive(msg.inlinerolls)
        } else if (msg.inlinerolls) {
            //reRollDice(msg);
        } 
    },

    apiMenu = () => {
        let feedback = ""
        feedback += `<div ${centered}><a ${astyle} href="!sr5 --linkToken">Link Tokens</a></div>`
        feedback += `<div ${centered}>Tokens must represent a character sheet.</div>`
        feedback += `<hr ${breaks} />`
        feedback += `<div ${centered}><a ${astyle} href="!sr5 --initCounter">Initiative Counter</a></div>`
        feedback += `<div ${centered}>Adds an entry to track initiative passes. When it returns to top of tracker it will subtract all entries by 10.</div>`
        feedback += `<hr ${breaks} />`
        feedback += `<div ${centered}><a ${astyle} href="!sr5 --rollInit">Roll Initiative</a></div>`
        feedback += `<div ${centered}>Roll intiative for all selected tokens</div>`
        
        chatMessage(feedback);
    },

    //:+:+:+:+:+: TOKEN LINKER :+:+:+:+:+: //
    //== This looks at a Token's Linked character Sheet and set a number of defaults 
    linkTokens = selected => {
        selected.forEach(token => {
            const characterID   = sr5HelperFunctions.getCharacterIdFromTokenId(token["_id"]) || false;
            const characterName = getAttrByName(characterID, 'character_name') || "";
            const tokenID       = token["_id"];

            if (characterID) {
                const update = tokenLinker(characterID, tokenID, characterName);

                //Set the default token for the represented character sheet
                const tokenGet = getObj("graphic", tokenID);
                const representsCharacter  = getObj('character', characterID);
                if (update) {
                    tokenGet.set(update);
                    setDefaultTokenForCharacter(representsCharacter, tokenGet);
                    chatMessage(`<div ${centered}><strong>${characterName}</strong></div><hr ${breaks} /><div>Token defaults set.</div>`);
                } else {
                    errorMessage('linkTokens', 'Update not found')
                };
            } else {
                chatMessage(`<div>Token does not represents a character. Set a character in the Token settings.</div>`);
            }
        });
    },

    tokenLinker = (characterID, tokenID, characterName) => {
        try {
            const sheetType  = getAttrByName(characterID, 'sheet_type');
            const statusMarkers = sr5HelperFunctions.getStatusIcons(tokenID);
            const matrixMarker = statusMarkers.includes('matrix') ? 'matrix' : false;

            const stunCharacters = ['grunt', 'pc'];
            const physicalCharacters = stunCharacters.concat(['vehicle']);
            const matrixCharacters = ['vehicle', 'host', 'sprite'];
            const stun = stunCharacters.includes(sheetType) ? true : false;
            const matrix = matrixCharacters.includes(sheetType) || matrixMarker ? true : false;
            const physical = physicalCharacters.includes(sheetType) ? true : false;

            let update = {
                bar1_value: 0,
                bar2_value: 0,
                bar3_value: 0,
                name: characterName || "",
                bar1_link: "",
                bar2_link: "",
                bar3_link: "",
                showname: true,
                showplayers_bar1: true,
                showplayers_bar2: true,
                showplayers_bar3: true,
                bar1_max: stun ? getAttrByName(characterID, `stun`, "max") || 0 : "",
                bar2_max: matrix ? getAttrByName(characterID, `matrix`, "max") || 0 : "",
                bar3_max: physical ? getAttrByName(characterID, `physical`, "max") || 0 : "",
            }; 

            if (sheetType === 'pc') {
                ['stun', 'matrix', 'physical'].forEach(attr => {
                    const link = sr5HelperFunctions.getCharacterAttr(characterID, `${attr}`);
                    if (attr === 'matrix' && matrixMarker) {
                        link[0] ? update[`bar2_link`] = link[0].id : log(`Linked attribute not found for bar${num}`);
                    } else {
                        const num = attr === 'stun' ? 1 : 3;
                        link[0] ? update[`bar${num}_link`] = link[0].id : log(`Linked attribute not found for bar${num}`);
                    }
                });
            }

            return update
        } catch (error) {
            errorMessage('tokenLinker', error)
        };
    },
    //:+:+:+:+:+: END TOKEN LINKER :+:+:+:+:+: //

    //:+:+:+:+:+: INITATIVE COUNTER :+:+:+:+:+: //
    addInitiativeCounter = () => {
        try {
            let turnorder = Campaign().get("turnorder") === "" ? [] :  JSON.parse(Campaign().get("turnorder"));

            //Open Tracker if not open
            openIntiativePage();

            let iniobj = {
                to: [],
                check: '',
                idx: 0
            };

            const inicheck = () => {
                iniobj.po = iniobj.to;
                iniobj.to = JSON.parse(Campaign().get('turnorder'));
                iniobj.check = _.find(iniobj.to, obj => obj.custom == 'Round / Pass');
                iniobj.idx = iniobj.to.indexOf(iniobj.check);
            };

            const addini = oTurnOrder => {
                oTurnOrder.unshift({
                    id: '-1',
                    pr: '1 / 1',
                    custom: 'Round / Pass'
                });
                Campaign().set("turnorder", JSON.stringify(oTurnOrder));
            };

            //Setup iniobj
            inicheck();

            //Create "Initiative Pass" if it doesn't exist
            if (iniobj.check === undefined) {
                addini(iniobj.to);
            } else{
                iniobj.to.splice(iniobj.idx, 1);
                addini(iniobj.to);
            };

        } catch (error) {
            errorMessage('addInitiativeCounter', error)
        }
    },

    openIntiativePage = () => {
        if (Campaign().get('initiativepage') === false) {
            Campaign().set('initiativepage', true);
        };
    },
    //:+:+:+:+:+: END INITATIVE COUNTER :+:+:+:+:+: //

    //:+:+:+:+:+: GROUP INITIATIVE :+:+:+:+:+: //
    addInitiativeToTracker = tokenInitiatives => {
        try {
            let turnorder = Campaign().get("turnorder") === "" ? [] :  JSON.parse(Campaign().get("turnorder"));
            const counterIndex = sr5HelperFunctions.findIndex(turnorder, 'Round / Pass');

            //Open Tracker if not open
            openIntiativePage();

            turnorder.forEach(turn => {
                const index = sr5HelperFunctions.findIndex(tokenInitiatives, turn.id)

                if (index >= 0) {
                    turn.pr = tokenInitiatives[index].total
                    tokenInitiatives.splice(index, 1)
                }
            });

            tokenInitiatives.forEach(token => {
                const newInitiative = new InitiativeTurn(token.total, token.token);
                turnorder.push(newInitiative)
            });

            if (counterIndex >= 0) {
                const counter = turnorder[counterIndex]
                turnorder.splice(counterIndex, 1)
                turnorder.push(counter)
            }

            Campaign().set("turnorder", JSON.stringify(turnorder));
        } catch (error) {
            errorMessage('addInitiativeTracker', error)
        }
    },

    processIniatitive = characterInitiativesRolls => {
        try {
            const processedRolls = processResults(characterInitiativesRolls)
            const sortedByTotal = sr5HelperFunctions.sortDescending(processedRolls, 'total')

            addInitiativeToTracker(sortedByTotal)
        } catch (error) {
            errorMessage('processIniatitive', error)
        }
    },

    processResults = results => {
        try {
            let array = [];
            results.forEach(roll =>{
                const tokenID = roll['expression'].split(' [')[1].slice(0, -1)
                const characterID = sr5HelperFunctions.getCharacterIdFromTokenId(tokenID)

                const character = new Character(characterID)
                character.total = roll.results.total
                array.push(character)
            });
            return array
        } catch (error) {
            errorMessage('processResults', error)
        }
    },

    rollInitaitve = selected => {
        try {
            const selectedInitatives = findInitativeScores(selected);
            let feedback = '';

            for (let [key, value] of Object.entries(selectedInitatives)) {
                feedback += `<div style='display: inline-block; border: 1px solid ${third}; border-radius: 5px; padding: 2%; background-color: ${secondary}; margin-bottom: 3%; width: 95%;'>`
                feedback += `<img src='${value.src}' style='margin-right: 2%; width: 20%;'>`
                feedback += `<label style='display: inline-block; font-weight: bold; font-size: 1.3em; color: ${third}; vertical-align: middle; width: 60%;'>${value.name}</label>`
                feedback += `<div style='color: black; width: 15%; display: inline-block;'>[[${value.expression} [${value.token}]]]</div>`
                feedback += `</div><br />`
            }

            sendChat('Sr5 Roll Initiative', `${header}</div>${feedback}</div>`);
        } catch (error) {
            errorMessage('rollInitaitve', error)
        }
    },

    findInitativeScores = selected => {
        try {
            let array = [];
            selected.forEach(token => {
                const characterID = sr5HelperFunctions.getCharacterIdFromTokenId(token["_id"]);
                const statusMarkers = sr5HelperFunctions.getStatusIcons(token["_id"]);
                const sheetType  = sr5HelperFunctions.getSheetType(characterID);
                const intiativeType = sheetType === "sprite" || sheetType === "host" || sheetType === "vehicle" || statusMarkers.includes('matrix') ? 'matrix' : statusMarkers.includes('astral') ? 'astral' : 'initiative';
                const mod = getAttrByName(characterID, `${intiativeType}_mod`); 
                const dice = getAttrByName(characterID, `${intiativeType}_dice`);

                const character = new Character(characterID)
                character.expression = `${mod}+${dice}d6cs0cf0`
                array.push(character)
            });
            return array
        } catch (error) {
            errorMessage('findInitativeScores', error)
        }
    },
    //:+:+:+:+:+: END GROUP INITIATIVE :+:+:+:+:+: //

    //Reroll Failures
    reRollDice = msg => {
        //const diceIndex = msg.content.split('{{dice=$[[')[1].split(']]}}')[0];
        //const numberDiceRolled = msg.inlinerolls[`${diceIndex}`].results.rolls[0].dice;
        //const successTotal = msg.inlinerolls[`${diceIndex}`].results.total;
        //const reRollDice = numberDiceRolled - successTotal;

        //DO I create a button with the API?
        //Do I set a sheet atttribue and link a button to roll it?
    },
    
    //Send message to chat
    chatMessage = feedback => sendChat('API', `/w gm ${header}</div>${feedback}</div>`),

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    return {
        RegisterEventHandlers: registerEventHandlers
    };
}());

on("ready",() => {
    'use strict';
    sr5api.RegisterEventHandlers();
});


//:+:+:+:+:+: INITATIVE COUNTER :+:+:+:+:+: //
sr5CounterCheckInitiative = () => {
    let turnorder = JSON.parse(Campaign().get("turnorder"));
    const counterIndex = sr5HelperFunctions.findIndex(turnorder, 'Round / Pass');

    if (counterIndex === 0) {
        let counter = turnorder[counterIndex]
        turnorder.splice(counterIndex, 1)

        let newTurnOrder = []
        //Reduce all the intiatiives by 10 or remove them if < 0
        turnorder.forEach(element => {     
            element.pr -= 10
            element.pr > 0 ? newTurnOrder.push(element) : false;
        });

        newTurnOrder = sr5HelperFunctions.sortDescending(newTurnOrder, 'pr')

        const split = counter.pr.split(` / `)
        let round = newTurnOrder.length < 1 ? parseInt(split[0], 10) + 1 : split[0]
        let pass = newTurnOrder.length < 1 ? 1 : parseInt(split[1], 10) + 1
        counter.pr = `${round} / ${pass}`

        newTurnOrder.length < 1 ? sendChat('API', `<div style="color: #eee;width: 90%; border: 1px solid black; background-color: #131415; padding: 5px;"><div style="color: #fff; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif; margin-bottom: 2px;">Shadowrun 5th Edition <span style="font-size: 0.8em; line-height: 13px; margin-top: -2px; font-style: italic;">(v.1)</span></div><div style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid #666; margin: 5px 0px;"></div><div style="text-align:center;">Combat Round <strong>${round}</strong></span></div>`) : false;

        newTurnOrder.push(counter)

        Campaign().set("turnorder", JSON.stringify(newTurnOrder));
    }
},

on('change:campaign:turnorder', () => {
    sr5CounterCheckInitiative();
});
//:+:+:+:+:+: END INITATIVE COUNTER :+:+:+:+:+: //

