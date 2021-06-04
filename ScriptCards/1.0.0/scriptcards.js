// Github:   https://gist.github.com/kjaegers/515dff0f04c006d7192e0fec534d96bf
// By:       Kurt Jaegers
// Contact:  https://app.roll20.net/users/2365448/kurt-j
var API_Meta = API_Meta||{};
API_Meta.ScriptCards={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.ScriptCards.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const ScriptCards = (() => { // eslint-disable-line no-unused-vars
/*
	ScriptCards is a run-time script interpreter for use in Roll20. Scripts for ScriptCards are entered into the chat window, either directly, through cut/paste,
	or executed from macros. A ScriptCard script consists of one or more lines, each delimited by a double dash (--) starting the line, followed by a statement type
	identifier.

	After the identifier, is a line tag, followed by a vertical bar (|) character, followed by the line content. The scripting language supports end-inclusion of 
	function libraries with the ###libname### directive, which will be pre-parsed and removed from the script. Any number of libraries can be specified by separating
	library names (case sensitive) with semicolons (;).

	Please see the ScriptCards Wiki Entry on Roll20 at https://wiki.roll20.net/Script:ScriptCards for details.

*/
	const APINAME = "ScriptCards";
	const APIVERSION = "1.0.0";
	const APIAUTHOR = "Kurt Jaegers";
	
	// These are the parameters that all cards will start with. This table is copied to the cardParameters table inside the processing loop and that table is updated
	// with settings from --# lines in the script.
	const defaultParameters = {
		tableborder: "2px solid #000000;",
		tablebgcolor: "#EEEEEE",
		tableborderradius: "6px;", 
		tableshadow: "5px 3px 3px 0px #aaa;",
		title: "ScriptCards",
		titlecardbackground: "#1C6EA4",
		titlecardbottomborder: "2px solid #444444;",
		titlefontface: "Contrail One",
		titlefontsize: "1.2em",
		titlefontlineheight: "1.2em",
		lineheight: "normal",
		titlefontcolor: "#FFFFFF",
		subtitlefontsize: "13px",
		subtitlefontface: "Tahoma",
		subtitlefontcolor: "#FFFFFF",
		subtitleseperator: " &" + "#x2666; ",
		tooltip: "Sent by ScriptCards",
		bodyfontsize: "14px;", 
		bodyfontface: "Helvetica",
		oddrowbackground: "#D0E4F5",
		evenrowbackground: "#eeeeee",
		oddrowfontcolor: "#000000",
		evenrowfontcolor: "#000000",
		whisper: "",
		emotetext: "",
		sourcetoken: "",
		targettoken: "",
		emotebackground: "#f5f5ba",
		emotefont: "font-family: Georgia, serif; font-weight: bold; ",
		emotestate: "visible",
		rollfontface: "helvetica",
		leftsub: "",
		rightsub: "",
		sourcecharacter: "",
		targetcharacter: "",
		debug: 0,
		hidecard: "0",
		hidetitlecard: "0",
		dontcheckbuttonsforapi: "0",
		roundup: "0",
		buttonbackground: "#1C6EA4",
		buttontextcolor: "#FFFFFF",
		buttonbordercolor: "#999999",
		dicefontcolor: "#1C6EA4",
		dicefontsize: "3.0em",
		usehollowdice: "0",
		allowplaintextinrolls: "0",
		whisper: "",
		showfromfornonwhispers: "0",
		allowinlinerollsinoutput: "0",
		nominmaxhighlight: "0",
		disablestringexpansion: "0",
		disablerollvariableexpansion: "0",
		disableparameterexpansion: "0",
		disablerollprocessing: "0",
		disableattributereplacement: "0",
		disableinlineformatting: "0",
		styleTableTag: " border-collapse:separate; border: solid black 2px; border-radius: 6px; -moz-border-radius: 6px; ",
		styleNormal:" text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFFEA2; border-color: #87850A; color: #000000;",
		styleFumble: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFAAAA; border-color: #660000; color: #660000;",
		styleCrit: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #88CC88; border-color: #004400; color: #004400;",
		styleBoth: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #8FA4D4; border-color: #061539; color: #061539;",
	};

	var htmlTemplate = `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 100%; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow};"><div style="display: table-header-group; background: !{titlecardbackground};  border-bottom: !{titlecardbottomborder}"><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="font-family: !{titlefontface}; font-style:normal; font-size: !{titlefontsize}; line-height: !{titlefontlineheight}; font-weight: bold; color: !{titlefontcolor}; text-shadow: -1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;">=X=TITLE=X=</span><br /><span style="font-family: !{subtitlefontface}; font-variant: normal; font-size: !{subtitlefontsize}; font-style:normal; font-weight: bold; color: !{subtitlefontcolor}; ">=X=SUBTITLE=X=</span></div></div></div><div style="display: table-row-group;">`;
	var htmlTemplateHiddenTitle = `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 100%; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow};"><div style="display: table-row-group;">`;
	var htmlRowTemplate = `<div style="display: table-row; =X=ROWBG=X=;"><div style="display: table-cell; padding: 0px 0px; font-family: !{bodyfontface}; font-style: normal; font-weight:normal; font-size: !{bodyfontsize}; "><span style="line-height: !{lineheight}; color: =X=FONTCOLOR=X=;">=X=ROWDATA=X=</span></div></div>`;
	var htmlTemplateEnd = `</div></div><br />`;
	var buttonStyle = 'background-color:!{buttonbackground}; color: #!{buttontextcolor}; text-align: center; vertical-align:middle; border-radius: 5px; border-color:!{buttonbordercolor}; font-size:x-small;';

	var stringVariables = {};
	var rollVariables = {};
	var rollComponents = [
		'Base','Total','Ones','Aces','Odds','Evens','Odds','RollText','Text','Style', 'tableEntryText', 'tableEntryImgURL', 'tableEntryValue'
	];

	var repeatingSection = undefined;
	var repeatingSectionIDs = undefined;
	var repeatingIndex = undefined;
	var repeatingCharID = undefined;
	var repeatingCharAttrs = undefined;
	var repeatingSectionName = undefined;

	var ScriptCardsLibrary = {};

	const diceLetters =  "JABCDEFGHIJKLMNOPQRSTUVWYZ";
	
	var jsonObject = undefined;

	// Used for storing parameters passed to a subroutine with --> or --?|> lines
	var callParamList = {};
	
	on('ready', function () {
		if (!state[APINAME]) { state[APINAME] = {module: APINAME, schemaVersion: APIVERSION, config: {}, persistentVariables: {} }; }
		if (state[APINAME].storedVariables == undefined) { state[APINAME].storedVariables = {};	}
		if (state[APINAME].storedSettings == undefined) { state[APINAME].storedSettings = {}; }
		if (state[APINAME].storedStrings == undefined) { state[APINAME].storedStrings = {}; }
		if (state[APINAME].storedSnippets == undefined) { state[APINAME].storedSnippets = {}; }

		loadLibraryHandounts();

		API_Meta.ScriptCards.version = APIVERSION;

		log(`-=> ${APINAME} - ${APIVERSION} by ${APIAUTHOR} Ready <=-`);

		on("change:handout", function () {
			loadLibraryHandounts();
		});

		on('chat:message', function (msg) {
			if (msg.type === "api") {		
				var apiCmdText = msg.content.toLowerCase();
				var processThisAPI = false;

				if (apiCmdText.startsWith("!sc-liststoredsettings")) {
					var metaCard = "!scriptcard {{ ";
					metaCard += "--#title|Stored Settings Report ";
					if (apiCmdText.split(" ").length == 1) {
						metaCard += "--#leftsub|Settings List "
						var stored = state[APINAME].storedSettings;
						for (const key in stored) {
							metaCard += `--+${key}|[button]Show::!sc-liststoredsettings ${key}[/button] [button]Delete::!sc-deletestoredsettings ${key}[/button]`;
						}
					} else {
						var settingName = msg.content.substring(msg.content.indexOf(" ")).trim();
						if (settingName) {
							metaCard += `--#leftsub|Setting List --#rightsub|${settingName} `;
							var stored = state[APINAME].storedSettings[settingName];
							for (const key in stored) {
								if (stored[key] !== defaultParameters[key]) {
									metaCard += `--+${key}|${stored[key]}`;
								}
							}
						}
					}
					metaCard += " }};"
					sendChat("API", metaCard);

				}

				if (apiCmdText.startsWith("!sc-deletestoredsettings ")) {
					var settingName = msg.content.substring(msg.content.indexOf(" ")).trim();
					if (state[APINAME].storedSettings[settingName]) {
						delete state[APINAME].storedSettings[settingName];
						metaCard = `!scriptcard {{ --#title|Remove Stored Setting --#leftsub|${settingName} --+|The setting group ${settingName} has been deleted. }} `;
						sendChat("API", metaCard);
					}
				}

				if (apiCmdText.startsWith ("!scriptcards ")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!scriptcard ")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!script ")) { processThisAPI = true; }
				if (processThisAPI) {
					var cardParameters = {};
					Object.assign(cardParameters,defaultParameters);

					// Store labels and their corresponding line numbers for branching
					var lineLabels = {};

					// The returnStack stores the line number to return to after a gosub, while the parameter stack stores parameter lists for nexted gosubs
					var returnStack = [];
					var parameterStack = [];
					var tableLineCounter = 0;

					// Builds up a list of lines that will appear on the output display
					var outputLines = [];				

 					// Clear out any pre-existing roll variables
					rollVariables = {};
					stringVariables = {};

					if (msg.playerid) {
						var sendingPlayer = getObj("player", msg.playerid);
						if (sendingPlayer) {
							stringVariables["SendingPlayerID"] = msg.playerid;
							stringVariables["SendingPlayerName"] = sendingPlayer.get("_displayname");
							stringVariables["SendingPlayerColor"] = sendingPlayer.get("color");
							stringVariables["SendingPlayerSpeakingAs"] = sendingPlayer.get("speakingas");
							stringVariables["SendingPlayerIsGM"] = playerIsGM(msg.playerid) ? "1" : "0";
						}
					}

					// Strip out all newlines in the input text
					var cardContent = msg.content.replace(/(\r\n|\n|\r)/gm, "");
					cardContent = cardContent.replace(/(<br ?\/?>)*/g,"");
					cardContent = cardContent.replace(/\}\}/g," }}");
					cardContent = cardContent.trim();
					if (cardContent.charAt(cardContent.length-1) !== "}") { 
						if (cardContent.charAt(cardContent.length-2) !== "}") {
							cardContent += "}";
						}
						cardContent += "}";
					}

					var libraries = cardContent.match(/\+\+\+.+?\+\+\+/g);
					if (libraries) { 
						cardContent = insertLibraryContent(cardContent, libraries[0].replace(/\+\+\+/g,"")); 
						cardContent = cardContent.replace(/\+\+\+.+?\+\+\+/g,"")
					}
					
					
					// Split the card into an array of tag-based (--) lines
					var cardLines = parseCardContent(cardContent);

					// pre-parse line labels and store line numbers for branching
					for (var x=0; x<cardLines.length; x++) {
						var thisTag = getLineTag(cardLines[x])
						if (thisTag.charAt(0)==":") {
							lineLabels[thisTag.substring(1)] = x;
						}
					}

					// Process card lines starting with the first line (cardLines[0] will contain an empty string due to the split)
					var lineCounter = 1;
					while (lineCounter < cardLines.length) {
						
						var thisTag = getLineTag(cardLines[lineCounter]);
						thisTag = replaceCharacterAttributes(inlineReplaceRollVariables(substituteCallVars(thisTag,cardParameters)), cardParameters);
						var thisContent = getLineContent(cardLines[lineCounter]);
						if (thisTag.charAt(0) !== "+" && thisTag.charAt(0) !== "&") {
							thisContent = replaceCharacterAttributes(inlineReplaceRollVariables(substituteCallVars(thisContent,cardParameters)), cardParameters);
						} else {
							thisContent = replaceCharacterAttributes(substituteCallVars(thisContent,cardParameters), cardParameters);
						}
						
						if (cardParameters.debug == 1) {
							log(`Line Counter: ${lineCounter}, Tag:${thisTag}, Content:${thisContent}`);
						}

						// Handle setting of card parameters (lines beginning with --#)
						if (thisTag.charAt(0) === "#") {
							var paramName = thisTag.substring(1).toLowerCase();
							if (cardParameters[paramName] !== undefined) {
								cardParameters[paramName] = thisContent;
								if (cardParameters.debug == "1") { log(`Setting parameter ${paramName} to value ${thisContent}`)}
							} else {
								if (cardParameters.debug == "1") { log(`Unable to set parameter ${paramName} to value ${thisContent}`)}
							}

							switch (paramName) {
								case "sourcetoken":
									var charLookup = getObj("graphic", thisContent.trim());
									if (charLookup !== undefined && charLookup.get("represents") !== "") {
										cardParameters.sourcecharacter = getObj("character", charLookup.get("represents"));
									}
									break;

								case "targettoken":
									var charLookup = getObj("graphic", thisContent.trim());
									if (charLookup !== undefined && charLookup.get("represents") !== "") {
										cardParameters.targetcharacter = getObj("character", charLookup.get("represents"));
									}
									break;
							}
						}

						// Handle setting string values
						if (thisTag.charAt(0) === "&") {
							var variableName = thisTag.substring(1);
							if (thisContent.charAt(0) == "+") {
								stringVariables[variableName] = (stringVariables[variableName] || "") + replaceRollVariables(thisContent.substring(1), cardParameters);
							} else {
								stringVariables[variableName] = replaceRollVariables(thisContent,cardParameters);
							}
						}

						// Handle "Case" statements
						if (thisTag.charAt(0).toLowerCase() === "c") {
							var testvalue = thisTag.substring(1);
							var cases = thisContent.split("|");
							if (cases) {
								for (var x=0; x<cases.length; x++) {
									var testcase = cases[x].split(":")[0];
									if (testvalue.toLowerCase() == testcase.toLowerCase()) {
										var jumpDest = cases[x].split(":")[1];
										var jumpTo = jumpDest;
										if (jumpTo.charAt(0) == ">") {
											jumpTo = jumpDest.split(";")[0];
											if (lineLabels[jumpTo.substring(1)]) {
												parameterStack.push(callParamList);
												var paramList = jumpDest.trim().split(";");
												callParamList = {};
												var paramCount = 0;
												paramList.forEach(function(item) {
													callParamList[paramCount] = item.toString().trim();
													paramCount++;
												});
												returnStack.push(lineCounter);
											}
											jumpTo = jumpTo.substring(1);
										}
										if (lineLabels[jumpTo]) { lineCounter = lineLabels[jumpTo] };
										x = cases.length + 1;
									}
								}
							}
						}

						// Handle setting RollVariables to function call results
						if (thisTag.charAt(0) === "~") {
							var variableName = thisTag.substring(1);
							var params = thisContent.split(";");
							switch (params[0].toLowerCase()) {
								// Chebyshev Unit distance between two tokens (params[1] and params[2]) (4E/5E)
								case "chebyshevdistance":
								case "distance":
									var result = 0;
									if (params.length >= 3) {
										var token1 = getObj("graphic", params[1]);
										var token2 = getObj("graphic", params[2]);
										if (token1 && token2) {
											// Calculate the Chebyshev Distance between the grid points
											var x1 = token1.get("left") / 70;
											var x2 = token2.get("left") / 70;
											var y1 = token1.get("top") / 70;
											var y2 = token2.get("top") / 70;
											result = Math.floor(Math.max(Math.abs(x1 - x2), Math.abs(y1-y2)));
										}
									}
									rollVariables[variableName] = parseDiceRoll(result.toString(), cardParameters);
									break;

								case "euclideandistance":
									var result = 0;
									if (params.length >= 3) {
										var token1 = getObj("graphic", params[1]);
										var token2 = getObj("graphic", params[2]);
										if (token1 && token2) {
											// Calculate the euclidean unit distance between two tokens (params[1] and params[2])
											var x1 = token1.get("left") / 70;
											var x2 = token2.get("left") / 70;
											var y1 = token1.get("top") / 70;
											var y2 = token2.get("top") / 70;
											result = Math.floor(Math.sqrt(Math.pow((x1-x2),2)+Math.pow((y1-y2),2)));
										}
									}
									rollVariables[variableName] = parseDiceRoll(result.toString(), cardParameters);
									break;

								case "manhattandistance":
								case "taxicabdistance":
									var result = 0;
									if (params.length >= 3) {
										var token1 = getObj("graphic", params[1]);
										var token2 = getObj("graphic", params[2]);
										if (token1 && token2) {
											// Calculate the manhattan unit distance between two tokens (params[1] and params[2])
											var x1 = token1.get("left") / 70;
											var x2 = token2.get("left") / 70;
											var y1 = token1.get("top") / 70;
											var y2 = token2.get("top") / 70;
											result = Math.abs(x2-x1) + Math.abs(y2-y1);
										}
									}
									rollVariables[variableName] = parseDiceRoll(result.toString(), cardParameters);
									break;		
									
								case "getselected":
									if (msg.selected) {
										for (var x=0; x < msg.selected.length; x++) {
											var obj = getObj(msg.selected[x]._type, msg.selected[x]._id);
											stringVariables[variableName + (x+1).toString()] = obj.get("id");
										}
										stringVariables[variableName + "Count"] = msg.selected.length.toString();
										rollVariables[variableName + "Count"] = parseDiceRoll(msg.selected.length.toString(), cardParameters);
									} else {
										stringVariables[variableName + "Count"] = "0";
										rollVariables[variableName + "Count"] = parseDiceRoll("0", cardParameters);
									}
									break;

								case "stateitem":
									if (params.length == 3) {
										switch (params[1].toLowerCase()) {
											case "write":
												if (params[2].toLowerCase() == "rollvariable") {
													if (rollVariables[variableName]) {
														state[APINAME].storedRollVariable = Object.assign(rollVariables[variableName]);
													}
												}
												if (params[2].toLowerCase() == "stringvariable") {
													if (stringVariables[variableName]) {
														state[APINAME].storedStringVariable = Object.assign(stringVariables[variableName]);
													}
												}
												break;
			
											case "read":
												if (params[2].toLowerCase() == "rollvariable") {
													if (state[APINAME].storedRollVariable) { rollVariables[variableName] = Object.assign(state[APINAME].storedRollVariable); }
												}
												if (params[2].toLowerCase() == "stringvariable") {
													if (state[APINAME].storedStringVariable) { stringVariables[variableName] = Object.assign(state[APINAME].storedStringVariable); }
												}
												break;
										}
									}
									break;

								case "math": //min,max,clamp,round,floor,ceil
								case "round":
								case "range":
									// call is --var|range;min;val1;val2
									if (params[1].toLowerCase() == "min" && params.length == 4) {
										var val1 = parseDiceRoll(params[2], cardParameters);
										var val2 = parseDiceRoll(params[3], cardParameters);
										if (val1.Total <= val2.Total) {
											rollVariables[variableName] = val1; 
										} else {
											rollVariables[variableName] = val2;
										}
									}
									// call is --var|range;max;val1;val2
									if (params[1].toLowerCase() == "max" && params.length == 4) {
										var val1 = parseDiceRoll(params[2], cardParameters);
										var val2 = parseDiceRoll(params[3], cardParameters);
										if (val1.Total >= val2.Total) {
											rollVariables[variableName] = val1; 
										} else {
											rollVariables[variableName] = val2;
										}
									}

									// call is --var|range;clamp;val;lowerbound;upperbound
									if (params[1].toLowerCase() == "clamp" && params.length == 5) {
										var val = parseDiceRoll(params[2], cardParameters);
										var lower = parseDiceRoll(params[3], cardParameters);
										var upper = parseDiceRoll(params[4], cardParameters);
										if (val.Total >= lower.Total && val.Total <= upper.Total) { rollVariables[variableName] = val; }
										if (val.Total < lower.Total) { rollVariables[variableName] = lower; }
										if (val.Total > upper.Total) { rollVariables[variableName] = upper; }
									}

									if (params.length == 3) {
										if (params[1].toLowerCase() == "down" || params[1].toLowerCase() == "floor") {
											rollVariables[variableName] = parseDiceRoll(Math.floor(Number(params[2])).toString(), cardParameters);
										}
										if (params[1].toLowerCase() == "up" || params[1].toLowerCase() == "ceil") {
											rollVariables[variableName] = parseDiceRoll(Math.ceil(Number(params[2])).toString(), cardParameters);
										}
										if (params[1].toLowerCase() == "closest" || params[1].toLowerCase() == "round") {
											rollVariables[variableName] = parseDiceRoll(Math.round(Number(params[2])).toString(), cardParameters);
										}
									}
									break; 

								case "stringfuncs": // strlength, substring, replace, split, before, after
								case "strings":
								case "string":
									if (params.length == 3) {
										switch (params[1].toLowerCase()) {
											//stringfuncs;strlength;string
											case "strlength":
											case "length":
												rollVariables[variableName] = parseDiceRoll((params[2].length.toString()), cardParameters);
												break;
										}
									}

									if (params.length == 4) {
										switch (params[1].toLowerCase()) {
											//stringfuncs;split;delimeter;string
											case "split":
												var splits = params[3].split(params[2]);
												rollVariables[variableName+"Count"] = parseDiceRoll(splits.length.toString(), cardParameters);
												for (var x=0; x<splits.length; x++) {
													stringVariables[variableName+(x+1).toString()] = splits[x];
												}
												break;

											//stringfuncs;before;delimiter;string
											case "before":
												if (params[3].indexOf(params[2]) < 0) {
													stringVariables[variableName] = params[3];
												} else {
													stringVariables[variableName] = params[3].substring(0,params[3].indexOf(params[2]));
												}
												break;

											//stringfuncs;after;delimeter;string
											case "after":
												if (params[3].indexOf(params[2]) < 0) {
													stringVariables[variableName] = params[3];
												} else {
													stringVariables[variableName] = params[3].substring(params[3].indexOf(params[2]));
												}
												break;

											//stringfuncs;left;count;string
											case "left":
												if (params[3].length < Number(params[2])) {
													stringVariables[variableName] = params[3];
												} else {
													stringVariables[variableName] = params[3].substring(0,Number(params[2]));
												}
												break;

											//stringfuncs;right;count;string
											case "right":
												if (params[3].length < Number(params[2])) {
													stringVariables[variableName] = params[3];
												} else {
													stringVariables[variableName] = params[3].substring(params[3].length-Number(params[2]));
												}												
												break;
										
										}
									}

									if (params.length == 5) {
										switch (params[1].toLowerCase()) {
											//stringfuncs0;substring1;start2;length3;string4
											case "substring":
												stringVariables[variableName] = params[4].substring(Number(params[2]) - 1, Number(params[3]) + Number(params[2])-1);
												break;

											case "replace":
												stringVariables[variableName] = params[4].replace(params[2], params[3]);
												break;		
										}
									}
									break;
								
							}
						}

						// Handle API Call Lines
						if (thisTag.charAt(0) === "@") {
							var apicmd = thisTag.substring(1);
							var spacer = " ";

							var params = thisContent.replace(/(?:\s+|\b)_/g, " --");
							var apiMessage = `!${apicmd}${spacer}${params}`.trim();
							sendChat(msg.who, apiMessage);
						}

						// Handle repeating attribute statements
						if (thisTag.charAt(0).toLowerCase() === "r") {
							var command = thisTag.substring(1).toLowerCase();
							var param = thisContent.split(";");
							switch (command.toLowerCase()) {
								// Find parameters are character id, value name (ie, Greatsword), section name (attack), and field to search (atkname)
								case "find": 
									repeatingSection = getSectionAttrs(param[0], param[1], param[2], param[3]); 
									fillCharAttrs(findObjs({_type: 'attribute', _characterid: param[0]}));
									repeatingCharID = param[0];
									repeatingSectionName = param[2];
									if (repeatingSection && repeatingSection[0]) {
										repeatingSectionIDs = [];									
										repeatingSectionIDs.push(repeatingSection[0].split("|")[1]);
										repeatingIndex = 0;
									} else {
										repeatingSectionIDs = [];
										repeatingSectionIDs[0] = "NoRepeatingAttributeLoaded";
										repeatingIndex = 0;
									}
									if (repeatingSection) { parseRepeatingSection() };
									break;
								case "first": 
									repeatingSectionIDs = getRepeatingSectionIDs(param[0], param[1]); 
									if (repeatingSectionIDs) {
										repeatingIndex = 0;
										repeatingCharID = param[0];
										repeatingSectionName = param[1];
										fillCharAttrs(findObjs({_type: 'attribute', _characterid: repeatingCharID}));
										repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]); 
										parseRepeatingSection();
										repeatingIndex=0; 
									} else {
										repeatingSection = undefined;
									}
									break;
								case "next": 
									if (repeatingSectionIDs) {
										if (repeatingSectionIDs[repeatingIndex + 1]) {
											repeatingIndex++;
											repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]);
											parseRepeatingSection();
										} else {
											repeatingSection = undefined; 
											repeatingSectionIDs = undefined; 
										}
									} else { 
										repeatingSection = undefined; 
										repeatingSectionIDs = undefined; 
									}
									break;
								case "dump":
									if (repeatingSection) {
										for(var x=0; x<repeatingSection.length; x++) {
											log(repeatingSection[x]);
										}
									}
							}
						}

						// Handle JSON content
						if (thisTag.charAt(0).toLowerCase() === "j") {
							var theName = thisTag.substring(1);
							try {
								jsonObject = JSON.parse(thisContent);
							} catch {

							}
						}

						// Handle setting roll ID variables
						if (thisTag.charAt(0) === "=") {
							var rollIDName = thisTag.substring(1);
							rollVariables[rollIDName] = parseDiceRoll(replaceStringVariables(thisContent, cardParameters), cardParameters);
						}
		
						// Handle direct output lines
						if (thisTag.charAt(0) === "+") {
							var rowData =buildRowOutput(thisTag.substring(1), replaceRollVariables(thisContent,cardParameters));

							tableLineCounter += 1;
							if (tableLineCounter % 2 == 0) {
								while(rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.evenrowfontcolor); }
								while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; `); }
							} else {
								while(rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.oddrowfontcolor); }
								while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; `); }
							}
					 
							outputLines.push(rowData);
						}

						// Handle Conditional Lines
						if (thisTag.charAt(0) === "?") {
							var isTrue = processFullConditional(thisTag.substring(1));
							var trueDest = thisContent.trim();
							var falseDest = undefined;
							if (trueDest.indexOf("|") >= 0) {
								falseDest = trueDest.split("|")[1].trim();
								trueDest = trueDest.split("|")[0].trim();
							}
							if (cardParameters.debug == 1) { log(`Condition ${thisTag.substring(1)} evaluation result: ${isTrue}`); }
							if (isTrue) {
								var jumpTo = trueDest;
								if (jumpTo.charAt(0) == ">") {
									jumpTo = trueDest.split(";")[0];
									if (lineLabels[jumpTo.substring(1)]) {
										parameterStack.push(callParamList);
										var paramList = trueDest.trim().split(";");
										callParamList = {};
										var paramCount = 0;
										paramList.forEach(function(item) {
											callParamList[paramCount] = item.toString().trim();
											paramCount++;
										});
										returnStack.push(lineCounter);
									}
									jumpTo = jumpTo.substring(1);
								}
								if (lineLabels[jumpTo]) { lineCounter = lineLabels[jumpTo] };
							} else {
								if (falseDest !== undefined) {
									var jumpTo = falseDest;
									if (jumpTo.charAt(0) == ">") {
										jumpTo = falseDest.split(";")[0];
										if (lineLabels[jumpTo.substring(1)]) {
											parameterStack.push(callParamList);
											var paramList = falseDest.trim().split(";");
											callParamList = {};
											var paramCount = 0;
											paramList.forEach(function(item) {
												callParamList[paramCount] = item.toString().trim();
												paramCount++;
											});
											returnStack.push(lineCounter);
										}
										jumpTo = jumpTo.substring(1);
									}
									if (lineLabels[jumpTo]) { lineCounter = lineLabels[jumpTo] };
								}
							}
						}

						// Handle X lines (exit)
						if (thisTag.charAt(0).toLowerCase() == "x") {
							lineCounter = cardLines.length+1;
						}

						// Handle E lines (echo)
						if (thisTag.charAt(0).toLowerCase() == "e") {
							var sendAs = thisTag.substring(1);
							sendChat(sendAs, thisContent);
						}

						// Handle V lines (visual effects)
						if (thisTag.charAt(0).toLowerCase() == "v") {
							if (thisTag.length > 1) {
								var effectType = thisTag.substring(1).toLowerCase();
								switch (effectType) {
									case "token":
										var params = thisContent.split(" ");
										if (params.length >= 2) {
											var s = getObj("graphic", params[0]);
											if (s) {
												var x = s.get("left");
												var y = s.get("top");
												var t = params[1].trim();
												var pid = s.get("_pageid");
												if (t !== "" && t !== "none") {
													spawnFx(x,y,t,pid);
												}
											}
										}
										break;
									case "betweentokens": 
										var params = thisContent.split(" ");
										if (params.length >= 3) {
											var s = getObj("graphic", params[0]);
											var p = getObj("graphic", params[1]);
											if (s && p) {
												var x1 = s.get("left");
												var y1 = s.get("top");
												var x2 = p.get("left"); // - (p.get("width") > 70 ? p.get("width")/2 : 0);
												var y2 = p.get("top"); // - (p.get("height") > 70 ? p.get("height")/2 : 0);
												var t = params[2].trim();
												var pid = s.get("_pageid");
												if (t !== "" && t !== "none" ) {
													spawnFxBetweenPoints({x:x1, y:y1}, {x:x2, y:y2}, t, pid);
												}
											}
										}
										break;
								}
							}
						}

						// Handle S (Stash) statements
						if (thisTag.charAt(0).toLowerCase() == "s") {
							switch (thisTag.substring(1).toLowerCase()) {
								case "rollvariables":
									if (thisContent.trim().length > 0) {
										state[APINAME].storedVariables[thisContent.trim()] = JSON.parse(JSON.stringify(rollVariables));
									}
									break;

								case "stringvariables":
									if (thisContent.trim().length > 0) {
										state[APINAME].storedStrings[thisContent.trim()] = JSON.parse(JSON.stringify(stringVariables));
									}
									break;
									
								case "settings":
									if (thisContent.trim().length > 0) {
										state[APINAME].storedSettings[thisContent.trim()] = {};
										for (var key in cardParameters) {
											if (cardParameters[key] !== defaultParameters[key]) {
												state[APINAME].storedSettings[thisContent.trim()][key] = cardParameters[key];
											}
										}
										//state[APINAME].storedSettings[thisContent.trim()] = JSON.parse(JSON.stringify(cardParameters));
									}
									break;
							}
						}

						// Handle L (Load) statements
						if (thisTag.charAt(0).toLowerCase() == "l") {
							switch (thisTag.substring(1).toLowerCase()) {
								case "rollvariables":
									if (thisContent.trim().length > 0 && state[APINAME].storedVariables[thisContent.trim()] !== undefined) {
										newVariables = state[APINAME].storedVariables[thisContent.trim()];
										for (var key in newVariables) {
											rollVariables[key] = JSON.parse(JSON.stringify(newVariables[key]));
										}
									}
									break;

								case "stringvariables":
									if (thisContent.trim().length > 0 && state[APINAME].storedStrings[thisContent.trim()] !== undefined) {
										newVariables = state[APINAME].storedStrings[thisContent.trim()];
										for (var key in newVariables) {
											stringVariables[key] = JSON.parse(JSON.stringify(newVariables[key]));
										}
									}
									break;
	
								case "settings":
									if (thisContent.trim().length > 0) {
										if (thisContent.trim().length > 0 && state[APINAME].storedSettings[thisContent.trim()] !== undefined) {
											newSettings = state[APINAME].storedSettings[thisContent.trim()];
											for (var key in newSettings) {
												cardParameters[key] = newSettings[key];
											}
											//cardParameters = JSON.parse(JSON.stringify(state[APINAME].storedSettings[thisContent.trim()]));
										}
									}
									break;
							}
						}

						// Handle branch lines
						if (thisTag.charAt(0) === "^") {
							var jumpTo = thisTag.substring(1);
							if (lineLabels[jumpTo]) { lineCounter = lineLabels[jumpTo] };
						}

						// Handle gosub lines
						if (thisTag.charAt(0) === ">") {
							parameterStack.push(callParamList);
							var paramList = thisContent.trim().split(";");
							callParamList = {};
							var paramCount = 1;
							paramList.forEach(function(item) {
								callParamList[paramCount] = item.toString().trim();;
								paramCount++;
							});
							var jumpTo = thisTag.substring(1);
							if (lineLabels[jumpTo]) {
								returnStack.push(lineCounter);
								lineCounter = lineLabels[jumpTo];
							}
						}

						// Handle return from gosub
						if (thisTag.charAt(0) === "<") {
							if (returnStack.length > 0) {
								callParamList = parameterStack.pop();
								lineCounter = returnStack.pop();
							}
						}

						lineCounter++;
					}
					
					var subtitle = "";
					if ((cardParameters.leftsub !== "") && (cardParameters.rightsub !== "")) {
						subtitle = cardParameters.leftsub + cardParameters.subtitleseperator + cardParameters.rightsub;
					}
					if ((cardParameters.leftsub !== "") && (cardParameters.rightsub == "")) {
						subtitle = cardParameters.leftsub;
					}
					if ((cardParameters.leftsub == "") && (cardParameters.rightsub !== "")) {
						subtitle = cardParameters.rightsub;
					}

					var cardOutput;

					if (cardParameters.hidetitlecard == "0") {
						cardOutput = htmlTemplate.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle);
					} else {
						cardOutput = htmlTemplateHiddenTitle.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle);
					}
					for (var x=0; x<outputLines.length; x++) {
						cardOutput += processInlineFormatting(outputLines[x], cardParameters);
					}
					cardOutput += htmlTemplateEnd;
					cardOutput = replaceStyleInformation(cardOutput, cardParameters);

					var emote = "";
					var emoteLeft = "";
					var emoteRight = "";

					if (cardParameters.emotestate == "visible") {
						if (cardParameters.sourcetoken !== "") {
							var thisToken = getObj("graphic", cardParameters.sourcetoken.trim());
							if (thisToken !== undefined && thisToken.get("imgsrc") !== "") {
								emoteLeft = `<img src=${thisToken.get("imgsrc")} style='height: 50px; min-width: 50px; float: left;'></img>`;
							}
						}
						if (cardParameters.targettoken !== "") {
							var thisToken = getObj("graphic", cardParameters.targettoken.trim());
							if (thisToken !== undefined && thisToken.get("imgsrc") !== "") {
								emoteRight = `<img src=${thisToken.get("imgsrc")} style='height: 50px; min-width: 50px; float: left;'></img>`;
							}
						}
						if (cardParameters.emotetext !== "" || emoteLeft !== "" || emoteRight !== "") {
							if (emoteLeft == "") { emoteLeft = "&nbsp;"}
							if (emoteRight == "") { emoteRight = "&nbsp;"}
							emote = "<div style='display: table; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal; background: " + cardParameters.emotebackground + "'>" + emoteLeft + "<div style='display: table-cell; width: 100%; " + cardParameters.emotefont + " vertical-align: middle; text-align: center; padding: 0px 2px;'>" + cardParameters.emotetext + "</div><div style='display: table-cell; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal;'>" + emoteRight + "</div></div>"
							emote = inlineReplaceRollVariables(emote, cardParameters);
						}
					}

					var from = cardParameters.showfromfornonwhispers !== "0" ? msg.who : "";

					cardOutput = removeInlineRolls(cardOutput, cardParameters);
					emote = removeInlineRolls(emote, cardParameters);

					if (cardParameters.hidecard == "0") {
						if (emote !== "") {
							if (cardParameters.whisper == "") {
								sendChat(from, "/desc " + emote + " " + cardOutput );
							} else {
								var whispers = cardParameters.whisper.split(",");
								for (var w in whispers) {
									var WhisperTarget = (whispers[w].trim() == 'self' ? msg.who : whispers[w].trim());
									sendChat(msg.who, "/w " + WhisperTarget + " " + cardOutput );
								}
							}
						} else {
							if (cardParameters.whisper == "") {
								sendChat(from, "/desc " + cardOutput );
							} else {
								var whispers = cardParameters.whisper.split(",");
								for (var w in whispers) {
									var WhisperTarget = (whispers[w].trim() == 'self' ? msg.who : whispers[w].trim());
									sendChat(msg.who, "/w " + WhisperTarget + " " + cardOutput );
								}
							}
						}
					}
				}
			}
		});
	});
	
	// Breaks the passed text into a series of lines and returns them as an object
	function parseCardContent(content) {
		// Strip off the !pc and the opening {{ and closing }}
		var work = content.substr(content.indexOf("{{") + 2);
		work = work.substr(0,work.lastIndexOf("}}") -1);
		work=work.trim();
		
		// Split into an array on the -- divider
		if (work !== undefined) {
			return work.split("--");
		} else {
			return [];
		}
	}

	// Given "content", replace occurances of roll variable references with their values. Used in --+ lines
	function replaceRollVariables(content,cardParameters) {
		if (cardParameters.disablerollvariableexpansion !== "0") { return content; }
		for (var key in rollVariables) {
			var baseString = `[$${key}`;
			var suffix = `]`;
			
			for (var i=0; i<rollComponents.length; i++)
			{
				while (content.indexOf(baseString+"."+rollComponents[i]+suffix) >= 0) { content = content.replace(baseString+"."+rollComponents[i]+suffix, rollVariables[key][rollComponents[i]]); }
			}
			if (cardParameters.nominmaxhighlight == "0") {
				while (content.indexOf(baseString+suffix) >= 0) { content = content.replace(baseString+suffix, buildTooltip(rollVariables[key].Total, "Roll: " + rollVariables[key].RollText + "<br /><br />Result: " + rollVariables[key].Text, rollVariables[key].Style)); }
			} else {
				while (content.indexOf(baseString+suffix) >= 0) { content = content.replace(baseString+suffix, buildTooltip(rollVariables[key].Total, "Roll: " + rollVariables[key].RollText + "<br /><br />Result: " + rollVariables[key].Text,  defaultParameters.styleNormal)); }
			}
		}

		content = replaceStringVariables(content, cardParameters);

		return content;
	}

	function replaceStringVariables(content, cardParameters)
	{
		if (cardParameters && cardParameters.disablestringexpansion !== "0") { return content; }
		if (content) {
			for (var key in stringVariables) {
				var baseString = `[&${key}`;
				var suffix = `]`;
				var replacement = ""
				if (stringVariables[key]) { replacement = stringVariables[key]; }
				while (content.indexOf(baseString+suffix) >= 0) { content = content.replace(baseString+suffix, replacement); }
			}
			content = content.replace(/\[&.*?\]/g, "");
		}

		return content;
	}

	// Given "content", replace occurances of roll variable references with their values. Used in all other line types
	function inlineReplaceRollVariables(content, cardParameters) {
		if (cardParameters && cardParameters.disablerollvariableexpansion !== "0") { return content; }
		for (var key in rollVariables) {
			var baseString = `[$${key}`;
			var suffix = `]`;
			
			for (var i=0; i<rollComponents.length; i++)
			{
				while (content.indexOf(baseString+"."+rollComponents[i]+suffix) >= 0) { content = content.replace(baseString+"."+rollComponents[i]+suffix, rollVariables[key][rollComponents[i]]); }
			}

			while (content.indexOf(baseString+suffix) >= 0) {content = content.replace(baseString+suffix, rollVariables[key].Total); }			
		}
		content = replaceStringVariables(content, cardParameters);
		return content;
	}

	function getLineTag(line) {
		if (line.indexOf("|") >= 0) {
			return line.split("|")[0];
		} else {
			return "Error - No Line Tag Specified";
		}
	}
	
	function getLineContent(line) {
		if (line.indexOf("|") >= 0) {
			return line.substring(line.indexOf("|")+1).trim();
		} else {
			return "Error - No Line Content Specified";
		}
	}

	// Take a "Roll Text" string (ie, "1d20 + 5 [Str] + 3 [Prof]") and execute the rolls.
	function parseDiceRoll(rollText, cardParameters) {
		if (cardParameters.disablerollprocessing !== "0") { return content; }
		rollText = inlineReplaceRollVariables(rollText, cardParameters);
		rollText = cleanUpRollSpacing(rollText);
		rollText = rollText.trim();
		var rollComponents = rollText.split(" ");
		var rollResult = {
			Total: 0,
			Base: 0,
			Ones: 0,
			Aces: 0,
			Odds: 0,
			Evens: 0,
			RollText: rollText,
			Text: "",
			Style: "",
			tableEntryText: "",
			tableEntryImgURL: "",
			tableEntryValue: ""
		}
		var hadOne = false;
		var hadAce = false;
		rollResult.Style = defaultParameters.styleNormal;
		var currentOperator = "+";
		
		for (var x=0; x<rollComponents.length; x++) {
			var text = rollComponents[x];
			
			var componentHandled = false;

			// A die specifier in XdX format
			if (text.match(/^\d+d\d+$/)) {
				componentHandled = true;
				var count=text.split("d")[0];
				var sides=text.split("d")[1];
				rollResult.Text += `${count}d${sides} (`;
				for (c=0; c<count; c++) {

					var thisRoll = randomInteger(sides);
					switch (currentOperator) {
						case "+": rollResult.Total += thisRoll; rollResult.Base += thisRoll; break;
						case "-": rollResult.Total -= thisRoll; rollResult.Base -= thisRoll; break;
						case "*": rollResult.Total *= thisRoll; rollResult.Base *= thisRoll; break;
						case "/": rollResult.Total /= thisRoll; rollResult.Base /= thisRoll; break;
						case "%": rollResult.Total %= thisRoll; rollResult.Base %= thisRoll; break;
					}
					if (thisRoll == 1) { rollResult.Ones++; hadOne = true; }
					if (thisRoll == sides) { rollResult.Aces++; hadAce = true; }
					if (thisRoll % 2 == 0) { rollResult.Evens++; } else { rollResult.Odds++; }
					rollResult.Text += thisRoll;
					if (c<count-1) { rollResult.Text += "," }
				}
				rollResult.Text += ") ";
			}
			
			// A die specifier in XdXkhX or XdXklX format
			if (text.match(/^\d+d\d+k[lh]\d+$/)) {
				componentHandled = true;
				var count = Number(text.split("d")[0]);
				var sides = Number(text.split("d")[1].split("k")[0]);
				var keepType = text.split("k")[1].substring(0,1);
				var keepCount = Number(text.split("k")[1].substring(1));
				var rollSet = [];
				
				if (keepCount > sides) { keepCount = sides; }
				
				rollResult.Text += `${count}d${sides}k${keepType}${keepCount} (`;
				
				for (c=0; c<count; c++) {
					var thisRoll = randomInteger(sides);
					rollSet.push(thisRoll);
				}
				
				if (keepType === "l") {
					rollSet.sort(function(a, b){return a-b});
				} else {
					rollSet.sort(function(a, b){return b-a});
				}
				
				for (c=0; c<count; c++) {
					if (c < keepCount) {
						switch (currentOperator) {
							case "+": rollResult.Total += rollSet[c]; rollResult.Base += rollSet[c]; break;
							case "-": rollResult.Total -= rollSet[c]; rollResult.Base -= rollSet[c]; break;
							case "*": rollResult.Total *= rollSet[c]; rollResult.Base *= rollSet[c]; break;
							case "/": rollResult.Total /= rollSet[c]; rollResult.Base /= rollSet[c]; break;
							case "%": rollResult.Total %= rollSet[c]; rollResult.base %= rollSet[c]; break;
						}
						if (rollSet[c] == 1) { rollResult.Ones++; hadOne = true; }
						if (rollSet[c] == sides) { rollResult.Aces++; hadAce = true; }
						if (rollSet[c] % 2 == 0) { rollResult.Evens++; } else { rollResult.Odds++; }
					}
					rollResult.Text += rollSet[c];
					if (c<count-1) { rollResult.Text += "," }
				}
				rollResult.Text += ") ";
			}

			// A die specifier in XdX>X or XdX<X format
			if (text.match(/^(\d+)d(\d+)([\>\<])(\d+)$/)) {
				componentHandled = true;
				var parts = text.match(/^(\d+)d(\d+)([\>\<])(\d+)$/);
				var count=parts[1];
				var sides=parts[2];
				var op = parts[3];
				var success = parts[4];
				rollResult.Text += `${count}d${sides}${op}${success} (`;
				for (c=0; c<count; c++) {
					var thisRoll = randomInteger(sides);
					var countIt = false;
					if (op == ">" && thisRoll > success) { countIt = true }
					if (op == "<" && thisRoll < success) { countIt = true }
					if (countIt) {
						switch (currentOperator) {
							case "+": rollResult.Total += 1; rollResult.Base += 1; break;
							case "-": rollResult.Total -= 1; rollResult.Base -= 1; break;
						}
					}
					if (thisRoll == 1) { rollResult.Ones++; hadOne = true; }
					if (thisRoll == sides) { rollResult.Aces++; hadAce = true; }
					if (thisRoll % 2 == 0) { rollResult.Evens++; } else { rollResult.Odds++; }
					rollResult.Text += thisRoll;
					if (c<count-1) { rollResult.Text += "," }
				}
				rollResult.Text += ") ";
			}			
			
			// An operator
			if (text.match(/^[\+\-\*\/\\\%]$/)) {
				componentHandled = true;
				currentOperator = text;
				//rollResult.Text += `${currentOperator} `;
				rollResult.Text += currentOperator == "*" ? "x " : currentOperator + " ";
			}
			
			// Just a number
			if (text.match(/^[+-]?(\d*\.)?\d*$/)) {
				componentHandled = true;
				rollResult.Text += `${text} `;
				if (!isNaN(text)) {
					switch (currentOperator) {
						case "+": rollResult.Total += Number(text); break;
						case "-": rollResult.Total -= Number(text); break;
						case "*": rollResult.Total *= Number(text); break;
						case "/": rollResult.Total /= Number(text); break;
						case "%": rollResult.Total %= Number(text); break;
						case "\\": rollResult.Total = cardParameters.roundup == "0" ? Math.floor(rollResult.Total / Number(text)) : Math.ceil(rollResult.Total / Number(text)); break;
					}			    
				}
			}
			
			// A card variable
			if (text.match(/^\[\$.+\]$/)) {				
				componentHandled = true;
				var thisKey = text.substring(2,text.length-1);				
				var thisValue = Number(inlineReplaceRollVariables(thisKey, cardParameters), cardParameters);

				if (rollVariables[thisKey]) {
					rollResult.Text += `(${rollVariables[thisKey].Text}) `;
				} else {
					rollResult.Text += `${thisValue} `;
				}
				
				switch (currentOperator) {
					case "+": rollResult.Total += thisValue; break;
					case "-": rollResult.Total -= thisValue; break;
					case "*": rollResult.Total *= thisValue; break;
					case "/": rollResult.Total /= thisValue; break;
					case "%": rollResult.Total %= thisValue; break;
					case "\\": rollResult.Total = cardParameters.roundup == "0" ? Math.floor(rollResult.Total / thisValue) : Math.ceil(rollResult.Total / thisValue); break;
				}			    				
			}

			// Flavor Text
			if (text.match(/^\[.+\]$/)) {
				componentHandled = true;
				if ((text.charAt(1) !== "$") && (text.charAt(1) !== "=")) {
					rollResult.Text += ` ${text} `;
				}
			}

			// Plain Text
			if (text.match(/\b[A-Za-z]+\b$/) && cardParameters.allowplaintextinrolls !== 0) {
				componentHandled = true;
				rollResult.Text += ` ${text} `;
			}


			// A Rollable Table Result
			if (text.match(/\[[Tt]\#.+?\]/g)) {
				componentHandled = true;
				var rollTableName = text.substring(3,text.length-1);
				var tableResult = rollOnRollableTable(rollTableName);
				if (tableResult) {
					rollResult.tableEntryText = tableResult[0];
					rollResult.tableEntryImgURL = tableResult[1];
					rollResult.tableEntryValue = isNaN(rollResult.tableEntryText) ? 0 : parseInt(rollResult.tableEntryText);
				}
			}

			if (!componentHandled) {
				componentHandled = true;
				rollResult.Text += `${text} `;
			}
		}
		
		if (hadOne && hadAce) { rollResult.Style = defaultParameters.styleBoth; }
		if (hadOne && !hadAce) { rollResult.Style = defaultParameters.styleFumble; }
		if (!hadOne && hadAce) { rollResult.Style = defaultParameters.styleCrit; }

		return rollResult;
	}

	function cleanUpRollSpacing(input) {
		input = input.replace(/\+/g, " + ");
		//input = input.replace(/\-/g, " - ");
		input = input.replace(/(?<!\[)\-\b(?![\w\s]*[\]])/g," - ");
		input = input.replace(/\*/g, " * ");
		input = input.replace(/\//g, " / ");
		input = input.replace(/\\/g, " \\ ")
		input = input.replace(/\%/g, " % ");
		input = input.replace(/\[/g, " [");
		input = input.replace(/\]/g, "] ");
		input = input.replace(/\s+/g, " ");
		return input;
	}
	
	function buildRowOutput(tag, content) {
		return htmlRowTemplate.replace("=X=ROWDATA=X=", `<strong>${tag}</strong> ${content}`);
	}

	function buildTooltip(text,tip,style){
		var tooltipStyle = ` font-family: ${defaultParameters.titlefont}; font-size: ${defaultParameters.titlefontsize}; font-weight: normal; font-style: normal; ${style} `;
		return `<span style='${tooltipStyle}' class='showtip tipsy' title='${tip}'>${text}</span>`; 
	};
	
	function processFullConditional(conditional, cardParameters) {
		// Remove multiple spaces
		var trimmed = conditional.replace(/\s+/g, ' ').trim();
		var parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g);
		if (!parts) { return false; }
		var currentJoiner = "none";
		var overallResult = true;
		if (parts.length < 3) { return false; }
		while (parts.length >= 3) {
			var thisCondition = `${parts[0]} ${parts[1]} ${parts[2]}`;
			var thisResult = evaluateConditional(thisCondition, cardParameters);
			parts.shift();
			parts.shift();
			parts.shift();
			switch(currentJoiner) {
				case "none": overallResult = thisResult; break;
				case "-and": overallResult = overallResult && thisResult; break;
				case "-or": overallResult = overallResult || thisResult; break;
			}
			if (parts.length > 0) {
				if ((parts[0].toLowerCase() == "-or") || (parts[0].toLowerCase() == "-and")) {
					currentJoiner = parts[0].toLowerCase();
				} else {
					log(`ScriptCards conditional error: Condition contains an invalid clause joiner. Only -and and -or are supported. Assume results are incorrect.`);
				}
				parts.shift();
			}
		}
		return overallResult;
	}

	function evaluateConditional(conditional, cardParameters) {
		var components = conditional.match(/(?:[^\s"]+|"[^"]*")+/g);
		if (!components) { return false; }
		if (components.length !== 3) {
			return false;
		}
		var left = inlineReplaceRollVariables(components[0]).replace(/\"/g,"", cardParameters);
		var right = inlineReplaceRollVariables(components[2]).replace(/\"/g,"", cardParameters);;
		if (!isNaN(left)) { left = parseFloat(left); }
		if (!isNaN(right)) { right = parseFloat(right); }

		switch (components[1]) {
			case "-gt": if (left > right) return true; break;
			case "-ge": if (left >= right) return true; break;
			case "-lt": if (left < right) return true; break;
			case "-le": if (left <= right) return true; break;
			case "-eq": if (left == right) return true; break;
			case "-eqi" : if (left.tostring().toLowerCase() == right.tostring().toLowerCase()) return true; break;
			case "-ne": if (left !== right) return true; break;
			case "-nei" : if (left.tostring().toLowerCase() !== right.tostring().toLowerCase()) return true; break;
			case "-inc": if (left.toString().toLowerCase().indexOf(right.toString().toLowerCase()) >= 0) return true; break;
		}
		return false;
	}

	function replaceStyleInformation(outputLine, cardParmeters) {
		var styleList = [
			"tableborder", "tablebgcolor", "tableborderradius", "tableshadow", "titlecardbackground", "titlecardbottomborder",
			"titlefontsize", "titlefontlineheight", "titlefontcolor", "bodyfontsize", "subtitlefontsize", "subtitlefontcolor",
			"titlefontface", "bodyfontface", "subtitlefontface", "buttonbackground", "buttontextcolor", "buttonbordercolor",
			"dicefontcolor", "dicefontsize", "lineheight"
		];

		for (var x=0; x< styleList.length; x++) {
			outputLine = outputLine.replace(new RegExp("!{" + styleList[x] + "}", "g"), cardParmeters[styleList[x]]);
		}
		return outputLine;
	}

	function processInlineFormatting(outputLine, cardParameters) {
		if (cardParameters.disableinlineformatting !== "0") { return outputLine; }
		outputLine = outputLine.replace(/\[hr\]/gi, "<hr>");
		outputLine = outputLine.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
		outputLine = outputLine.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
		outputLine = outputLine.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
		outputLine = outputLine.replace(/\[[Ss]\](.*?)\[\/[Ss]\]/g, "<s>$1</s>"); // [S]...[/s] for strikethru
		outputLine = outputLine.replace(/\[[Cc]\](.*?)\[\/[Cc]\]/g, "<div style='text-align: center; display:block;'>$1</div>"); // [C]..[/C] for center
		outputLine = outputLine.replace(/\[[Ll]\](.*?)\[\/[Ll]\]/g, "<span style='text-align: left;'>$1</span>"); // [L]..[/L] for left
		outputLine = outputLine.replace(/\[[Rr]\](.*?)\[\/[Rr]\]/g, "<div style='text-align: right; float: right;'>$1</div><div style='clear: both;'></div>"); // [R]..[/R] for right
		outputLine = outputLine.replace(/\[[Jj]\](.*?)\[\/[Jj]\]/g, "<div style='text-align: justify; display:block;'>$1</div>"); // [J]..[/J] for justify
		outputLine = outputLine.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
		var images = outputLine.match(/(\[img(.*?)\](.*?)\[\/img\])/gi);
		for(var image in images) {
			var work = images[image].replace("[img", "<img").replace("[/img]","></img>").replace("]"," src=");
			outputLine = outputLine.replace(images[image], work);
		}
		var buttons = outputLine.match(/\[button\](.*?)\:\:(.*?)\[\/button\]/gi);
		for (var button in buttons) {
			var title = buttons[button].split("::")[0].replace("[button]","").replace("[Button]", "").replace("[BUTTON]","");
			var action = buttons[button].split("::")[1].replace("[/button]","").replace("[/Button]", "").replace("[/BUTTON]","");
			if (cardParameters.dontcheckbuttonsforapi == "0") {
				action = action.replace(/(?:\s+|\b)_/g, " --");
			}
			outputLine = outputLine.replace(buttons[button], makeButton(title,action));
		}

		//DiceFont Stuff
		var dicefontchars = diceLetters;
		if (cardParameters.usehollowdice !== "0") { dicefontchars = dicefontchars.toLowerCase(); }
		outputLine = outputLine.replace(/\[d4\](.*?)\[\/d4\]/g, function(x) { var side=parseInt(x.replace("[d4]","").replace("[/d4]","").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd4;'>" + dicefontchars.charAt(side) + "</span>" } );
		outputLine = outputLine.replace(/\[d6\](.*?)\[\/d6\]/g, function(x) { var side=parseInt(x.replace("[d6]","").replace("[/d6]","").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd6;'>" + dicefontchars.charAt(side) + "</span>" } );
		outputLine = outputLine.replace(/\[d8\](.*?)\[\/d8\]/g, function(x) { var side=parseInt(x.replace("[d8]","").replace("[/d8]","").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd8;'>" + dicefontchars.charAt(side) + "</span>" } );
		outputLine = outputLine.replace(/\[d10\](.*?)\[\/d10\]/g, function(x) { var side=parseInt(x.replace("[d10]","").replace("[/d10]","").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd10;'>" + dicefontchars.charAt(side) + "</span>" } );
		outputLine = outputLine.replace(/\[d12\](.*?)\[\/d12\]/g, function(x) { var side=parseInt(x.replace("[d12]","").replace("[/d12]","").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd12;'>" + dicefontchars.charAt(side) + "</span>" } );
		outputLine = outputLine.replace(/\[d20\](.*?)\[\/d20\]/g, function(x) { var side=parseInt(x.replace("[d20]","").replace("[/d20]","").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd20;'>" + dicefontchars.charAt(side) + "</span>" } );

		return outputLine;
	}

	function substituteCallVars(text, cardParameters) {
		if (cardParameters.disableparameterexpansion !== "0") { return text; }
		var matches = text.match(/(\[\%[0-9]+\%\])/g);
		if (matches) {
			matches.forEach(function(item){
				var paramId = parseInt(item.substring(2, item.length-2));				
				var replacement = "";
				if (callParamList[paramId] !== undefined) {
					replacement = callParamList[paramId];
				}
				while(text.indexOf(item) >= 0) { text = text.replace(item,replacement); }
			});
		}
		return text;
	}

	function replaceCharacterAttributes(outputLine, cardParameters)
	{
		if (cardParameters.disableattributereplacement !== "0") { return outputLine; }

		// Notation is [*S:attribute] or [*T:attribute} or [*-lsakjlkjds:attribute] where the part before the : is a token or character id. Add ^ to attribute name for MAX
		// If we have no defined characters, don't do anything
		if (outputLine.indexOf("[*") < 0) { return outputLine }

		if (cardParameters.sourcecharacter !== undefined) {
			//var matches = outputLine.match(/\*\([sS]:.+?\)/g);
			var matches = outputLine.match(/\[\*[sS]:.+?\]/g);
			if (matches) {
				matches.forEach(function(item) {
					var opType = "current";
					var attrName = item.substring(4, item.length-1);
					if (attrName.endsWith("^")) {
						attrName = attrName.substring(0,attrName.length-1);
						opType = "max";
					}
					var attribute = getAttrByName(cardParameters.sourcecharacter.id, attrName, opType);
					while(outputLine.indexOf(item) >= 0) { outputLine = outputLine.replace(item,attribute) };
				});
			}
		}

		if (cardParameters.targetcharacter !== undefined) {
			var matches = outputLine.match(/\[\*[tT]:.+?\]/g);
			if (matches) {
				matches.forEach(function(item) {
					var opType = "current";
					var attrName = item.substring(4, item.length-1);
					if (attrName.endsWith("^")) {
						attrName = attrName.substring(0,attrName.length-1);
						opType = "max";
					}					
					var attribute = getAttrByName(cardParameters.targetcharacter.id, attrName, opType);
					while(outputLine.indexOf(item) >= 0) { outputLine = outputLine.replace(item,attribute) };
				});
			}
		}

		// Handle repeating section references
		var matches = outputLine.match(/\[\*[rR]:.+?\]/g);
		if (matches) {
			matches.forEach(function(item) {
				var opType = "";
				var attrName = item.substring(4, item.length-1);
				if (attrName.endsWith("^")) {
					attrName = attrName.substring(0,attrName.length-1);
					opType = "_max";
				}		
				var searchText = attrName + opType + "|";
				var attribute = "";		
				for (var i in repeatingSection) {
					if (repeatingSection[i].startsWith(searchText)) {
						attribute = repeatingSection[i].split("|")[1];
					}
				}
				if (!repeatingSection) { attribute = "NoRepeatingAttributeLoaded" };
				if (repeatingSection && repeatingSection.length <= 1) { attribute = "NoRepeatingAttributeLoaded" };
				while(outputLine.indexOf(item) >= 0) { outputLine = outputLine.replace(item,attribute) };
			});
		}

		// Handle repeating section attribute name retrieval
		var matches = outputLine.match(/\[\*[rR]\>.+?\]/g);
		if (matches) {
			matches.forEach(function(item) {
				var opType = "";
				var attrName = item.substring(4, item.length-1);
				if (attrName.endsWith("^")) {
					attrName = attrName.substring(0,attrName.length-1);
					opType = "_max";
				}		
				var attribute = repeatingSectionName + "_" + repeatingSectionIDs[repeatingIndex] + "_" + attrName + opType;
				if (!repeatingSection) { attribute = "NoRepeatingAttributeLoaded" };
				if (repeatingSection && repeatingSection.length <= 1) { attribute = "NoRepeatingAttributeLoaded" };
				while(outputLine.indexOf(item) >= 0) { outputLine = outputLine.replace(item,attribute) };
			});
		}
		
		// Handle ID based matches
		var matches = outputLine.match(/\[\*\-.+?:.+?\]/g);
		if (matches) {
			matches.forEach(function(item) {
				var testID = item.substring(2,item.indexOf(":"));
				var character = getObj("character", testID);
				if (character === undefined) {
					var tryToken = getObj("graphic", testID);
					if (tryToken !== undefined) {
						character = getObj("character", tryToken.get("represents"));
					}
				}
				if (character !== undefined) {
					var opType = "current";
					var attrName = item.substring(item.indexOf(":") + 1, item.length-1);
					if (attrName.endsWith("^")) {
						attrName = attrName.substring(0,attrName.length-1);
						opType = "max";
					}
					var attribute = getAttrByName(character.id, attrName, opType);
					while(outputLine.indexOf(item) >= 0) { outputLine = outputLine.replace(item,attribute) };
				}
			});
		}
		return outputLine;
	}

	function setPersistentValue(index, value) {
		state[APINAME].persistentVariables[index] = value;
	}

	function getPersistentValue(index) {
		return state[APINAME].persistentVariables[index];
	}

	function getRepeatingCount(characterID, prefix, postfix) {
		var attrs = findObjs({
				type : 'attribute',
				characterid : characterID
			});
		var attrCount = 0;
		attrs.forEach(function (s) {
			if (s.get("name").startsWith(prefix) && s.get("name").endsWith(postfix)) {
				attrCount += 1;
			}
		});
		return attrCount;
	}

	function makeButton(title, url) {
		return `<a style="${buttonStyle}" href="${url}">${title}</a>`;
	}
	
	function removeInlineRolls(text, cardParameters) {
		if (cardParameters.allowinlinerollsinoutput !== "0") { return text; }
		return text.replace(/\[\[/g, " ").replace(/\]\]/g, " ");
	}

	function fillCharAttrs(attrs) {
		if (!attrs) { return; }
		repeatingCharAttrs = {};
		attrs.forEach(function(x) {
			repeatingCharAttrs[x.get("name")] = x.get("current");
		});
	}

	// Check the active repeating section for any attribute references that need to be replaced
	function parseRepeatingSection() {
		if (!repeatingSection) { return; }
		for (var i in repeatingSection) {
			var matches = repeatingSection[i].match(/\@\{(.+?)\}/g);
			if (matches) {
 				matches.forEach(function(item) {
					var attribute = repeatingCharAttrs[item.substring(2,item.length-1)] || "";
					while (repeatingSection[i].indexOf(item) >= 0) { repeatingSection[i] = repeatingSection[i].replace(item, attribute); }
				});
			}
		}
	}

	function getRepeatingSectionAttrs(charid, prefix) {
		const repeatingAttrs = {};
		regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
		let repOrder;
		// Get attributes
		findObjs({
			_type : 'attribute',
			_characterid : charid
		}).forEach(o => {
			const attrName = o.get('name');
			if (attrName.search(regExp) === 0)
				repeatingAttrs[attrName] = o;
			else if (attrName === `_reporder_${prefix}`)
				repOrder = o.get('current').split(',');
		});
		if (!repOrder)
			repOrder = [];
		// Get list of repeating row ids by prefix from repeatingAttrs
		const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
				.map(n => n.match(regExp))
				.filter(x => !!x)
				.map(a => a[1]))];
		const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
		return [repRowIds, repeatingAttrs];
	}	

	function getRepeatingSectionIDs(charid, prefix) {
		const repeatingAttrs = {};
		regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
		let repOrder;
		// Get attributes
		findObjs({
			_type : 'attribute',
			_characterid : charid
		}).forEach(o => {
			const attrName = o.get('name');
			if (attrName.search(regExp) === 0)
				repeatingAttrs[attrName] = o;
			else if (attrName === `_reporder_${prefix}`)
				repOrder = o.get('current').split(',');
		});
		if (!repOrder)
			repOrder = [];
		// Get list of repeating row ids by prefix from repeatingAttrs
		const unorderedIds = [...new Set(Object.keys(repeatingAttrs)
				.map(n => n.match(regExp))
				.filter(x => !!x)
				.map(a => a[1]))];
		const repRowIds = [...new Set(repOrder.filter(x => unorderedIds.includes(x)).concat(unorderedIds))];
		return repRowIds;
	}	

    function getSectionAttrs(charid, entryname, sectionname, searchtext) {
		var return_set = [];
		
		try {
			var action_prefix = filterObjs(function (z) {
					return (z.get("characterid") == charid && z.get("name").startsWith(sectionname) && z.get("name").endsWith(searchtext));
				})
				.filter(entry => entry.get("current") == entryname)[0]
				.get("name").slice(0, -searchtext.length);
		} catch (e) {
			return (return_set)
		};

		var action_attrs = filterObjs(function (z) {
			return (z.get("characterid") == charid && z.get("name").startsWith(action_prefix));
		})

		action_attrs.forEach(function (z) {
			return_set.push(z.get("name").replace(action_prefix, "") + "|" + z.get("current").replace(/(?:\r\n|\r|\n)/g, "<br>"));
			return_set.push(z.get("name").replace(action_prefix, "") + "_max|" + z.get("max"));
		})

		var PrefixEntry = "xxxActionIDxxxx|" + action_prefix.replace(sectionname+"_","");
		PrefixEntry = PrefixEntry.substring(0,PrefixEntry.length-1);

		return_set.unshift(PrefixEntry);

		//repeatingSectionIDs = [];
		//repeatingSectionIDs.push(action_prefix.replace(sectionname, ""));
		//repeatingSectionIndex = 0;

		return (return_set);
	}

	function getSectionAttrsByID(charid, sectionname, sectionID) {
		var return_set = [];
		var action_prefix = sectionname + "_" + sectionID + "_";

		try {
			var action_attrs = filterObjs(function (z) {
				return (z.get("characterid") == charid && z.get("name").startsWith(action_prefix));
			})
		} catch {
			return return_set;
		}

		action_attrs.forEach(function (z) {
			try {
				return_set.push(z.get("name").replace(action_prefix, "") + "|" + z.get("current").replace(/(?:\r\n|\r|\n)/g, "<br>"));//.replace(/[\[\]\@]/g, " "));
				return_set.push(z.get("name").replace(action_prefix, "") + "_max|" + z.get("max"));
			} catch { }
		})
		return (return_set);
	}

	function rollOnRollableTable(tableName, resultType) {
		var theTable = findObjs({type: "rollabletable", name:tableName })[0];
		if (theTable !== undefined) {
        	var tableItems = findObjs({type: "tableitem", _rollabletableid: theTable.id});
	        if (tableItems !== undefined) {
            	var rollResults = {};
	            var rollIndex = 0;
            	var lastRollIndex = 0;
        	    var itemCount = 0;
    	        var maxRoll = 0;
	            tableItems.forEach(function(item) {
            	    var thisWeight = parseInt(item.get("weight"));
        	        rollIndex += thisWeight;
    	            for (var x = lastRollIndex+1; x <= rollIndex; x++) {
	                    rollResults[x] = itemCount;
                	}
            	    itemCount += 1;
        	        maxRoll += thisWeight;
    	            lastRollIndex += thisWeight;
	            });
				var tableRollResult = randomInteger(maxRoll);
				return [tableItems[rollResults[tableRollResult]].get("name"),tableItems[rollResults[tableRollResult]].get("avatar")];
    	    } else {
	            return ["",""];
			}
		}
	}
	
	function loadLibraryHandounts() {
		ScriptCardsLibrary = {};
		var handouts = filterObjs(function(obj){
			if (obj.get("type") == "handout" && obj.get("name").startsWith("ScriptCards Library")) { return true;} else { return false; } 
		 });
		 if (handouts) { 
			 handouts.forEach(function (handout) {
				var libraryName = handout.get("name").replace("ScriptCards Library", "").trim();
				var libraryContent = "";
				handout.get("notes", function(notes) {
					if (notes) {
					 notes = notes.replace(/\<p\>/g, "").replace(/\<\/p\>/g, "").replace(/\<br\>/g, "").replace(/&nbsp;/g," ").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&");
					}
					ScriptCardsLibrary[libraryName] = notes;
				});
			 });
		 }
	}

	function insertLibraryContent(cardContent, libraryList) {
		if (!libraryList) { return cardContent; }
		cardContent = cardContent.substring(0, cardContent.length - 2);
		var libs = libraryList.split(";");
		cardContent += " --X| ";
		for (var x=0; x<libs.length; x++) {
			if (ScriptCardsLibrary[libs[x]]) {
				cardContent += ScriptCardsLibrary[libs[x]];
			}
		}
		cardContent += " }}";
		return cardContent;
	}

})();

{try{throw new Error('');}catch(e){API_Meta.ScriptCards.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.ScriptCards.offset);}}