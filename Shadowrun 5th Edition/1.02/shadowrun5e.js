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
	const primary = '#610b0d', secondary = '#666', third = '#e7e6e5', accent = '#333';
	const divstyle   = `style="color: #eee;width: 90%; border: 1px solid ${accent}; background-color: #131415; padding: 5px;"`;
	const buttons    = `text-align:center; border: 1px solid ${accent}; margin: 3px; padding: 2px; background-color: ${primary}; border-radius: 4px;  box-shadow: 1px 1px 1px ${secondary};`
	const astyle     = `style="text-align:center; ${buttons} width: 68%;"`;
	const arrowstyle = `style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid ${secondary}; margin: 5px 0px;"`;
	const headstyle  = `style="color: #fff; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif; margin-bottom: 2px;"`;
	const substyle   = 'style="font-size: 0.8em; line-height: 13px; margin-top: -2px; font-style: italic;"';
	const breaks     = `style="border-color:${third}; margin: 5px 2px;"`;
	const circles    = `style='font-family:pictos;color: #fff;padding:2%;${buttons} width: 15px;'`
	const centered   = `style="text-align:center;"`;
	const apiName    = `Shadowrun 5th Edition`;
	const version    = '1.02';
	const header     = `<div ${divstyle}><div ${headstyle}>${apiName} <span ${substyle}>(v.${version})</span></div><div ${arrowstyle}>`;
	const errorMessage = (name, error) => log(`${name}: ${error}`)

  const handleInput = msg => {
		const args = msg.content.split(" --")
		const who = msg.who.split(' ')[0]
		log(args)
		if (args[0] === "!sr5" && msg.type === "api") {
				const noTokensSelected = `<div ${centered}>No tokens selected.</div>`;
				const selected = msg.selected;
				switch(args[1]) {
					case "linkToken":
							if (args[2]) {
									args[2] === 'info' ? chatMessage(apiCommands.linkToken.info) : chatMessage(apiCommands.linkToken.help)
							} else {
									selected ? linkTokens(selected, who) : selected === undefined ? chatMessage(noTokensSelected) : apiMenu();
							}
							break;
					case "initCounter":
							if (args[2]) {
									if (args[2] === 'info') {
										chatMessage(apiCommands.initCounter.info)
									} else if (args[2] === 'help') {
										chatMessage(apiCommands.initCounter.help)
									} else {
										chatMessage(`Arguement provided was invalid, ${args[0]} <br /> ${returnMenu}`)
									}
							} else {
									addInitiativeCounter()
							}
							break;
					case "rollInit":
							if (args[2]) {
									if (args[2] === 'info') {
										chatMessage(apiCommands.rollInit.info)
									} else if (args[2] === 'help') {
										chatMessage(apiCommands.rollInit.help)
									} else if (args[2] === 'error') {
										chatMessage(apiCommands.rollInit.error)
									} else {
										chatMessage(`Arguement provided was invalid, ${args[0]} <br/> ${returnMenu}`)
									}
							} else {
									selected ? rollInitaitve(selected) : selected === undefined  ? chatMessage(noTokensSelected) : apiMenu();
							}
							break;
					default:
							apiMenu(who)
				}
		} else if (msg.who === `${apiName} Roll Initiative`) {
				processIniatitive(msg.inlinerolls)
		} else if (msg.inlinerolls) {
				//reRollDice(msg);
		} 
	},

	apiMenu = who => {
			let feedback = ""
			let commandArray = ['linkToken', 'initCounter', 'rollInit']
			commandArray.forEach(command => feedback += menuButtons(command));

			chatMessage(feedback, who);
	},

	readmeLink = '[Readme](https://github.com/Roll20/roll20-api-scripts/tree/master/Shadowrun%205th%20Edition)',
	returnMenu = `<div ${centered}><a ${astyle} href="!sr5">Api Menu</a></div>`,
	apiCommands = {
			linkToken: {
					name: 'Link Tokens',
					info: `<div ${centered}>Link Tokens</div><div>Set a number of defaults on selected tokens then set the default token on the represented character sheets. For full details review the ${readmeLink}</div></div>${returnMenu}`,
					help: `<div ${centered}>Link Tokens</div><div ${centered}>!sr5 --linkToken</div><ol><li>Set token to represent a character sheet in the token settings</li><li>Select a token or multiple tokens</li><li>Run the above command or push the menu button in chat.</li></ol><div>${readmeLink}</div>${returnMenu}`
			},
			initCounter: {
					name: 'Initiative Counter',
					info: `<div ${centered}>Initiative Counter</div><div>Adds a initiative turn to the Turn Order that will count up the Combat Rounds and Initiative Passes. Every time this custom entry gets to the top of a round it will reduce initiative by 10 and remove any entries that are less than 1. If it is the only entry in the Turn Order it will increase the round counter.</div><div>${readmeLink}</div>${returnMenu}`,
					help: `<div ${centered}>Initiative Counter</div><div ${centered}>!sr5 --initCounter</div><ul><li>Add counter before rolling initiative.</li><li>Use arrow at the bottom of the turn tracker to cycle through turns.</li></ul><div>${readmeLink}</div>${returnMenu}`
			},
			rollInit: {
					name: 'Roll Initiative',
					info: `<div ${centered}>Roll Initiative</div><div>Roll initiative for all the selected tokens and add it to the token tracker.</div><div>${readmeLink}</div>${returnMenu}`,
					help: `<div ${centered}>Roll Initiative</div><div ${centered}>!sr5 --rollInit</div><ol><li>Set tokens to represent a characters sheet</li><li>Select a token or multiple tokens.</li><li>Run the above command or push the menu button in chat.</li></ol><div>${readmeLink}</div>${returnMenu}`,
					error: `<div ${centered}><strong>Roll Initiative</strong></div><div ${centered}>Troubleshooting</div><ol> <li>Ensure initiative modifier attributes are valid</li> <li>Ensure initiative dice are valid</li> <li>Change attributes related to intiative then change them back to their original value to toggle sheetworkers</li> </ol> <div>${readmeLink}</div>${returnMenu}`
			}
	},

	menuButtons = command => {
			let feedback = ""
			feedback += `<div ${centered}><a ${astyle} href="!sr5 --${command}">${apiCommands[command].name}</a>`
			feedback += `<a ${circles} href="!sr5 --${command} --info">i</a><a ${circles} href="!sr5 --${command} --help">?</a>`
			feedback += `</div>`
			feedback += `<hr ${breaks} />`

			return feedback
	},

	//:+:+:+:+:+: TOKEN LINKER :+:+:+:+:+: //
	//== This looks at a Token's Linked character Sheet and set a number of defaults 
	linkTokens = (selected, who) => {
			selected.forEach(token => {
					const characterID   = sr5HelperFunctions.getCharacterIdFromTokenId(token["_id"]) || false;
					const characterName = getAttrByName(characterID, 'character_name') || "";
					const tokenID       = token["_id"];
					let feedback = '';

					if (characterID) {
							const update = tokenLinker(characterID, tokenID, characterName);

							//Set the default token for the represented character sheet
							const tokenGet = getObj("graphic", tokenID);
							const representsCharacter  = getObj('character', characterID);
							if (update) {
									tokenGet.set(update);
									setDefaultTokenForCharacter(representsCharacter, tokenGet);

									feedback += `<div ${centered}><strong>${characterName}</strong></div><hr ${breaks} /><div>Token defaults set.</div>`
							} else {
									errorMessage('linkTokens', 'Update not found')
							};
					} else {
							feedback += `<div>Token does not represents a character. Set a character in the Token settings.</div>`;
					}

					sendChat(`${apiName} Token Linker`, `/w ${who} ${header}</div>${feedback}</div>`)
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
							playersedit_name: true,
							playersedit_bar1: true,
							playersedit_bar2: true,
							playersedit_bar3: true,
							light_hassight: true,
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

				const roll = value.expression ? `[[${value.expression} [${value.token}]]]` : `<a ${circles} href="!sr5 --rollInit --error">!</a>`
				feedback += `<div style='color: ${accent}; width: 15%; display: inline-block;'>${roll}</div>`

				feedback += `</div><br />`
			}

			sendChat(`${apiName} Roll Initiative`, `${header}</div>${feedback}</div>`);
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

				const character = new Character(characterID)
				character.modifier = getAttrByName(characterID, `${intiativeType}_mod`);
				character.dice = getAttrByName(characterID, `${intiativeType}_dice`);

				if (character.modifier && character.dice) {
					character.expression = `${character.modifier}+${character.dice}d6cs0cf0`
				} else {
					character.expression = undefined
				}

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
	chatMessage = (feedback, who) => sendChat(`${apiName} API`, `/w ${who || 'gm'} ${header}</div>${feedback}</div>`),

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
		//Reduce all the intiatives by 10 or remove them if < 0
		turnorder.forEach(element => {     
				element.pr -= 10
				element.pr > 0 ? newTurnOrder.push(element) : false;
		});

		newTurnOrder = sr5HelperFunctions.sortDescending(newTurnOrder, 'pr')

		const split = counter.pr.split(` / `)
		let round = newTurnOrder.length < 1 ? parseInt(split[0], 10) + 1 : split[0]
		let pass = newTurnOrder.length < 1 ? 1 : parseInt(split[1], 10) + 1
		counter.pr = `${round} / ${pass}`

		newTurnOrder.length < 1 ? sendChat('API', `<div style="color: #eee;width: 90%; border: 1px solid #333; background-color: #131415; padding: 5px;"><div style="color: #fff; font-size: 18px; text-align: left; font-constiant: small-caps; font-family: Times, serif; margin-bottom: 2px;">Shadowrun 5th Edition <span style="font-size: 0.8em; line-height: 13px; margin-top: -2px; font-style: italic;">(v.1)</span></div><div style="border: none; border-top: 3px solid transparent; border-bottom: 3px solid transparent; border-left: 195px solid #666; margin: 5px 0px;"></div><div style="text-align:center;">Combat Round <strong>${round}</strong></span></div>`) : false;

		newTurnOrder.push(counter)

		Campaign().set("turnorder", JSON.stringify(newTurnOrder));
	}
},

on('change:campaign:turnorder', () => {
    sr5CounterCheckInitiative();
});
//:+:+:+:+:+: END INITATIVE COUNTER :+:+:+:+:+: //

