const ScriptCards = (() => {
	// Script line modifiers : 
	//      --+tagname|tagcontent : a straightwardard output line. Create a card line with tagname as the left side and tagcontent as the right side
	//      --#settingname|settingvalue : if "settingname" exists as a Scripted Action Cards setting, it will be set to the passed content.
	//      --=varName|varValue : set a variable (varName) to a value (varValue)
	//      --$number|value : sets the persistent variable (number) to the passed value. There are 50 persistent variables that can be saved (1-50)
	//      --:label|(anything) : create a label for jumping and branching
	//      --^label|(anything) : Jump to a defined label
	//      --?conditional|label : if Conditional is true, jump to label. Prefix label with > for a gosub jump. If gosub, you can add a ; and append a ; separated list of params.
	//		-->Label|param1;param2;param3 : Gosub to Label and pass given parameters as numbered params ([%1%], [%2%], etc.)
	//		--<|(anything) : Return from a gosub
	//		--X|(anything) : terminate script execution
	//      --@apicommand|parameters : Call another API script
	//		--Ssettings|Identifier or --Srollvariables|Identifier : Save the current script settings (or Roll Variables) with the name "Identifier" to persistent storage
	//		--Lsettings|Identifier or --Lrollvariables|Identifier : Load  script settings (or Roll Variables) with the name "Identifier" from persistent storage
	//
	//		Development Progress:
	//			0.0.1 	- Initial release. Custom dice roller, basic output, support for +, #, = line types
	//			0.0.2	- Rewrote output as an HTML template. Added :, ^, and ? line types with conditional support and branching
	//			0.0.3	- Incorporated emotes with the ability to specify left and right tokens. 
	//					- Corrected numeric comparisons for conditionals. 
	//					- Improved Roll parsing to allow for "crunched" spacing between components
	//					  added "-inc" conditional and imporoved conditional handling to allow for values to be enclosed in quotes.
	//                    Added attribute lookup *(S:attr), *(T:attr), or *(-id:attr) causes ScriptCards to look up and substitute char attribute values
	//					  Added --@ lines to call other API scripts
	//			0.0.4	- Inline formatting is in.
	//					  Added integer division (\) operator in dice roller
	//					  Added support for "success" dice (ie, 6d6>3, etc.)
	//					  Added "gosub" support (-->), return support (--<) and conditional gosub (prefex label name with a >)
	//			0.0.5	- Fixed a bug that was preventing having a vertical bar (|) in content areas
	//					  Updated card parameter names and settings to all for case-insensitive support for setting names
	//					  Added "emotestate" setting to allow emote to be hidden
	//					  Changed Character Attribute Reference syntax to be consistend with other replacements (now [*.:.] instead of *(.:.) )
	//					  Separated evenrow colors from the table background color. Added oddrowfontcolor and evenrowfontcolor settings and support for them in template
	//                    Also eliminated the need to include CSS in background color settings. Just the hex code is needed/used now.
	//					  Cleaned up some extraneous/unused or duplicitave code. There is still some unused (right now) code at the end for future expansion.
	//			0.0.6	- Added the "S" (stash) and "L" (Load) statement types to store variables and settings between card executions
	//			0.0.7	- Added support for rollable tables in the format [T#tablename] or [T!tablename]. tablename is case sensitive and should match what you have in game.
	//					  Tables can be rolled as part of a variable assignment statement, and will set the tableEntryName and tableEntryImgURL properties on the roll variable.
	//			0.0.8	- Added "!sc-liststoredsettings" command. As bare command, this will list all of the stored setting names you have in your State variable. If you append
	//					  a setting name from the list after a space, it will display all of the card settings that are different from the default for that list.
	//					  Added the ability to use -and and -or in conditionals. These are evaluated left to right, so "true and false or true" would boil the first two down to
	//					  false and then compare "false or true" and return true for the overall result. Grouping and parenthesis are not supported at this time.
	//			0.0.9	- Added two new card settings: hideTitleCard will remove the title area of the card, including the title and subtitles. hideCard will completely
	//					  suppress the display of the card.
	//					  Added a new statement type : --v for visual effects. The tag should be either "token" or "betweentokens" and the content should be a list of
	//					  parameters separated by spaces. For "token" the parameters are TokenID, EffectType. For "betweentokens" the parameters are sourceTokenID, 
	//					  targetTokenID, EffectType. 
	//					  Added a new statement type : --e for "echo". The tag should be the "speaking as" value, while the content is sent to chat. For example: 
	//					  --eGhost|/em A mysterious presence drifts around @{selected|character_name}
	//					  Added the ability for conditionals to have a false branch. In a conditional, after the branch for true you can add a vertical bar (|) and a branch
	//					  for a false result. None, one, or both branches can be gosub branches, and gosub branches still accept parameters as normal in both cases.
	//			0.0.10	- Added the ability to use and assign string variables (no roll processing is done on these variables). Use the --& statement type to assign a
	//					  string variable (ie, --&MyString|Hello). You can also prefix the content string with a + to append to an existing variable (it is OK to append to
	//					  a string variable that doesn't yet exist). String assignments use the same roll replacement rules as direct output lines. Also added "stringvariables"
	//					  as an option to --S and --L statements
	//					  Updated the !sc-liststoredsettings command to provide a delete button to remove stored setting groups
	//			0.0.10a - Minor update to remove some console log spam and to include "dontcheckbuttonforapi" option as well as enable _ replaement in button commands. Tweaks
	//					  to --V effects lines (don't play an effect if no type is specified).
	//			0.0.10b - Minor update - Allow for multiple [img] sections on a single line and to allow for rollable tables with dashes (-) in their name. Also added the
	//					  rollVariable property .tableEntryValue, which is a parseInt of the tableEntryText.
	//			0.0.11  - Add the "roundup" setting. Defaults to 0. if set to anything else, integer division will round up instead of down.
	//					  Added three new settings : buttonbackgroundcolor, buttontextcolor, buttonbordercolor to allow you to customize the appearance of buttons generated
	//					  by the [button]text::action[/button] sequence.
	//					  Modified roll parsing code to handle plain text (1d20 fire damage will now add the plain text "fire damage" after the dice roll)
	//					  Added [d4] [d6] [d8] [d10] [d12] and [d20] inline formatting markup, and new settings: dicefontcolor, dicefontsize, usehollowdice.

	const APINAME = "ScriptCards";
	const APIVERSION = "0.0.11a";
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

		log(`-=> ${APINAME} - ${APIVERSION} by ${APIAUTHOR} Ready <=-`);

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
						thisTag = replaceCharacterAttributes(inlineReplaceRollVariables(substituteCallVars(thisTag)), cardParameters);
						var thisContent = getLineContent(cardLines[lineCounter]);
						if (thisTag.charAt(0) !== "+" && thisTag.charAt(0) !== "&") {
							thisContent = replaceCharacterAttributes(inlineReplaceRollVariables(substituteCallVars(thisContent)), cardParameters);
						} else {
							thisContent = replaceCharacterAttributes(substituteCallVars(thisContent), cardParameters);
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
								stringVariables[variableName] = (stringVariables[variableName] || "") + replaceRollVariables(thisContent.substring(1));
							} else {
								stringVariables[variableName] = replaceRollVariables(thisContent);
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

						// Handle JSON content
						if (thisTag.charAt(0) === "J") {
							var theName = thisTag.substring(1);
							try {
								jsonObject = JSON.parse(thisContent);
							} catch {

							}
						}

						// Handle setting roll ID variables
						if (thisTag.charAt(0) === "=") {
							var rollIDName = thisTag.substring(1);
							rollVariables[rollIDName] = parseDiceRoll(thisContent, cardParameters);
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
								falseDest = trueDest.split("|")[1];
								trueDest = trueDest.split("|")[0];
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

						// Handle repeating section statements (r)
						/*
						if (thisTag.charAt(0).toLowerCase() === "r") {
							var sectionPrefix = thisTag.substring(1);
							var params = thisContent.split(";");
							if (params[0] !== undefined) {
								if (params[0].toLowerCase() == "count") {

								}
							}
						}
						*/

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
							emote = inlineReplaceRollVariables(emote);
						}
					}

					var from = cardParameters.showfromfornonwhispers !== "0" ? msg.who : "";

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
		for (var key in rollVariables) {
			var baseString = `[$${key}`;
			var suffix = `]`;
			
			for (var i=0; i<rollComponents.length; i++)
			{
				content = content.replace(baseString+"."+rollComponents[i]+suffix, rollVariables[key][rollComponents[i]]);
			}
			while (content.indexOf(baseString+suffix) >= 0) { content = content.replace(baseString+suffix, buildTooltip(rollVariables[key].Total, "Roll: " + rollVariables[key].RollText + "<br /><br />Result: " + rollVariables[key].Text, rollVariables[key].Style)); }
		}

		for (var key in stringVariables) {
			var baseString = `[&${key}`;
			var suffix = `]`;
			while (content.indexOf(baseString+suffix) >= 0) { content = content.replace(baseString+suffix, stringVariables[key]); }
		}

		return content;
	}

	// Given "content", replace occurances of roll variable references with their values. Used in all other line types
	function inlineReplaceRollVariables(content) {
		for (var key in rollVariables) {
			var baseString = `[$${key}`;
			var suffix = `]`;
			
			for (var i=0; i<rollComponents.length; i++)
			{
				content = content.replace(baseString+"."+rollComponents[i]+suffix, rollVariables[key][rollComponents[i]]);
			}

			while (content.indexOf(baseString+suffix) >= 0) {content = content.replace(baseString+suffix, rollVariables[key].Total); }			
		}

		for (var key in stringVariables) {
			var baseString = `[&${key}`;
			var suffix = `]`;
			while (content.indexOf(baseString+suffix) >= 0) { content = content.replace(baseString+suffix, stringVariables[key]); }
		}
		
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
		rollText = inlineReplaceRollVariables(rollText);
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
			if (text.match(/^[\+\-\*\/\\]$/)) {
				componentHandled = true;
				currentOperator = text;
				rollResult.Text += `${currentOperator} `;
			}
			
			// Just a number
			if (text.match(/^[+-]?\d+$/)) {
				componentHandled = true;
			    rollResult.Text += `${text} `;
				switch (currentOperator) {
					case "+": rollResult.Total += Number(text); break;
					case "-": rollResult.Total -= Number(text); break;
					case "*": rollResult.Total *= Number(text); break;
					case "/": rollResult.Total /= Number(text); break;
					case "\\": rollResult.Total = cardParameters.roundup == "0" ? Math.floor(rollResult.Total / Number(text)) : Math.ceil(rollResult.Total / Number(text)); break;
				}			    
			}
			
			// A card variable
			if (text.match(/^\[\$.+\]$/)) {				
				componentHandled = true;
				var thisKey = text.substring(2,text.length-1);				
				var thisValue = Number(inlineReplaceRollVariables(thisKey));
				
			    rollResult.Text += `${thisValue} `;
				switch (currentOperator) {
					case "+": rollResult.Total += thisValue; break;
					case "-": rollResult.Total -= thisValue; break;
					case "*": rollResult.Total *= thisValue; break;
					case "/": rollResult.Total /= thisValue; break;
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
		input = input.replace(/\\/g, " \\ ");
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
	
	function processFullConditional(conditional) {
		// Remove multiple spaces
		var trimmed = conditional.replace(/\s+/g, ' ').trim();
		var parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g);
		if (!parts) { return false; }
		var currentJoiner = "none";
		var overallResult = true;
		if (parts.length < 3) { return false; }
		while (parts.length >= 3) {
			var thisCondition = `${parts[0]} ${parts[1]} ${parts[2]}`;
			var thisResult = evaluateConditional(thisCondition);
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
					log(`ScriptCards conditional error: Condition contains an invalid clause joiner. Only -and and -or ar supported. Assume results are incorrect.`);
				}
				parts.shift();
			}
		}
		return overallResult;
	}

	function evaluateConditional(conditional) {
		var components = conditional.match(/(?:[^\s"]+|"[^"]*")+/g);
		if (!components) { return false; }
		if (components.length !== 3) {
			return false;
		}
		var left = inlineReplaceRollVariables(components[0]).replace(/\"/g,"");
		var right = inlineReplaceRollVariables(components[2]).replace(/\"/g,"");;
		if (!isNaN(left)) { left = parseFloat(left); }
		if (!isNaN(right)) { right = parseFloat(right); }

		switch (components[1]) {
			case "-gt": if (left > right) return true; break;
			case "-ge": if (left >= right) return true; break;
			case "-lt": if (left < right) return true; break;
			case "-le": if (left <= right) return true; break;
			case "-eq": if (left == right) return true; break;
			case "-ne": if (left !== right) return true; break;
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

	function substituteCallVars(text) {
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

	function getSectionAttrs(charid, entryname, sectionname, searchtext, replacementprefix) {
		var return_set = [];
		try {
			var action_prefix = filterObjs(function (z) {
					return (z.get("characterid") == charid && z.get("name").startsWith("repeating_" + sectionname) && z.get("name").endsWith(searchtext));
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
				return_set.push(replacementprefix + z.get("name").replace(action_prefix, "") + "|" + z.get("current").replace(/(?:\r\n|\r|\n)/g, "<br>"));
				return_set.push(replacementprefix + z.get("name").replace(action_prefix, "") + "_max|" + z.get("max"));
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
	
})();