// Github:   https://gist.github.com/kjaegers/515dff0f04c006d7192e0fec534d96bf
// By:       Kurt Jaegers
// Contact:  https://app.roll20.net/users/2365448/kurt-j
var API_Meta = API_Meta||{};
API_Meta.ScriptCards={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.ScriptCards.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

var scriptCardsStashedScripts = {};

const ScriptCards = (() => { // eslint-disable-line no-unused-vars
/*
	ScriptCards is a run-time script interpreter for use in Roll20. Scripts for ScriptCards are entered into the chat window, either directly, through cut/paste,
	or executed from macros. A ScriptCard script consists of one or more lines, each delimited by a double dash (--) starting the line, followed by a statement type
	identifier.

	After the identifier, is a line tag, followed by a vertical bar (|) character, followed by the line content. The scripting language supports end-inclusion of
	function libraries with the +++libname+++ directive, which will be pre-parsed and removed from the script. Any number of libraries can be specified by separating
	library names (case sensitive) with semicolons (;).

	Please see the ScriptCards Wiki Entry on Roll20 at https://wiki.roll20.net/Script:ScriptCards for details.
*/

	const APINAME = "ScriptCards";
	const APIVERSION = "1.4.0e";
	const APIAUTHOR = "Kurt Jaegers";
	const debugMode = false;

	const parameterAliases = {
		"tablebackgroundcolor": "tablebgcolor",
		"titlecardbackgroundcolor": "titlecardbackground",
		"nominmaxhilight": "nominmaxhighlight",
		"norollhilight": "norollhilight",
		"buttonbackgroundcolor": "buttonbackground",
	}

	// These are the parameters that all cards will start with. This table is copied to the
	// cardParameters table inside the processing loop and that table is updated with settings
	// from --# lines in the script.
	const defaultParameters = {
		reentrant: "0",
		tableborder: "2px solid #000000;",
		tablebgcolor: "#EEEEEE",
		tableborderradius: "6px;",
		tableshadow: "5px 3px 3px 0px #aaa;",
		title: "ScriptCards",
		titlecardbackground: "#1C6EA4",
		titlecardgradient: "0",
		titlecardbackgroundimage: "",
		titlecardbottomborder: "2px solid #444444;",
		titlefontface: "Contrail One",
		titlefontsize: "1.2em",
		titlefontlineheight: "1.2em",
		titlefontshadow: "-1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;",
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
		bodybackgroundimage: "",
		oddrowbackgroundimage: "",
		evenrowbackgroundimage: "",
		whisper: "",
		emotetext: "",
		sourcetoken: "",
		targettoken: "",
		activepage: "",
		emotebackground: "#f5f5ba",
		emotefont: "Georgia",
		emotefontweight: "bold",
		emotefontsize: "14px",
		emotestate: "visible",
		emotefontcolor: "",
		rollfontface: "helvetica",
		leftsub: "",
		rightsub: "",
		sourcecharacter: "",
		targetcharacter: "",
		activepageobject: undefined,
		debug: "0",
		hidecard: "0",
		hidetitlecard: "0",
		dontcheckbuttonsforapi: "0",
		roundup: "0",
		buttonbackground: "#1C6EA4",
		buttonbackgroundimage: "",
		buttontextcolor: "White",
		buttonbordercolor: "#999999",
		buttonfontsize: "x-small",
		buttonfontface: "Tahoma",
		/*
		damagebuttonbackgroundcolor: "#FF4444",
		damagebuttonbackgroundimage: "",
		healbuttonbackgroundcolor: "#22DD22",
		healbuttonbackgroundimage: "",
		*/
		dicefontcolor: "#1C6EA4",
		dicefontsize: "3.0em",
		usehollowdice: "0",
		allowplaintextinrolls: "0",
		whisper: "",
		showfromfornonwhispers: "0",
		allowinlinerollsinoutput: "0",
		nominmaxhighlight: "0",
		norollhighlight: "0",
		disablestringexpansion: "0",
		disablerollvariableexpansion: "0",
		disableparameterexpansion: "0",
		disablerollprocessing: "0",
		disableattributereplacement: "0",
		disableinlineformatting: "0",
		executionlimit:"40000",
		deferralcharacter:"^",
		locale:"en-US", //apparently not supported by Roll20's Javascript implementation...
		timezone:"America/New_York",
		hpbar: "3",
		styleTableTag: " border-collapse:separate; border: solid black 2px; border-radius: 6px; -moz-border-radius: 6px; ",
		stylenone: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; ",
		stylenormal:" text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFFEA2; border-color: #87850A; color: #000000;",
		stylefumble: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #FFAAAA; border-color: #660000; color: #660000;",
		stylecrit: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #88CC88; border-color: #004400; color: #004400;",
		styleboth: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: 1em; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: #8FA4D4; border-color: #061539; color: #061539;",
	};

	// HTML Templates for the various pieces of the output card. Replaced sections are marked with
	// !{...} syntax, and will have values substituted in them when the output line is built.
	var htmlTemplate = `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 100%; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow};"><div style="display: table-header-group; background-color: !{titlecardbackground}; background-image: !{titlecardbackgroundimage}; border-bottom: !{titlecardbottomborder}"><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="font-family: !{titlefontface}; font-style:normal; font-size: !{titlefontsize}; line-height: !{titlefontlineheight}; font-weight: bold; color: !{titlefontcolor}; text-shadow: !{titlefontshadow}">=X=TITLE=X=</span><br /><span style="font-family: !{subtitlefontface}; font-variant: normal; font-size: !{subtitlefontsize}; font-style:normal; font-weight: bold; color: !{subtitlefontcolor}; ">=X=SUBTITLE=X=</span></div></div></div><div style="display: table-row-group; background-image:!{bodybackgroundimage};">`;
	var htmlTemplateHiddenTitle = `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 100%; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow};"><div style="display: table-row-group; background-image:!{bodybackgroundimage};">`;
	var htmlRowTemplate = `<div style="display: table-row; =X=ROWBG=X=;"><div style="display: table-cell; padding: 0px 0px; font-family: !{bodyfontface}; font-style: normal; font-weight:normal; font-size: !{bodyfontsize}; "><span style="line-height: !{lineheight}; color: =X=FONTCOLOR=X=;">=X=ROWDATA=X=</span></div></div>`;
	var htmlTemplateEnd = `</div></div><br />`;
	var buttonStyle = 'background-color:!{buttonbackground}; background-image:!{buttonbackgroundimage}; color: !{buttontextcolor}; text-align: center; vertical-align:middle; border-radius: 5px; border-color:!{buttonbordercolor}; font-family: !{buttonfontface}; font-size:!{buttonfontsize};';
	var gradientStyle = "linear-gradient(rgba(255, 255, 255, .3), rgba(255, 255, 255, 0))";

	// Objects to hold various variables and things we could need while running a script.
	var stringVariables = {};
	var rollVariables = {};
	var arrayVariables = {};
	var arrayIndexes = {};
	var tokenMarkerURLs = [];

	// The rollComponents list determines what suffixes are available when reporting out the value
	// of rollVariables (i.e., AttackRoll.Base)
	var rollComponents = [
		'Base','Total','Ones','Aces','Odds','Evens','Odds','RollText','Text','Style', 'tableEntryText', 'tableEntryImgURL', 'tableEntryValue', 'Raw'
	];

	// tokenAttributes lists all of the attribute names that are valid for looking up attributes
	// on token objects (as compared to character objects)
	var tokenAttributes = "token_name:name:token_id:statusmarkers:bar1_value:bar1_max:bar2_value:bar2_max:bar3_value:bar3_max:top:left:width:height:rotation:layer:aura1_radius:aura1_color:aura2_radius:aura2_color:aura1_square:aura2_square:tint_color:light_radius:light_dimradius:light_angle:light_losangle:light_multiplier:light_otherplayers:light_hassight:flipv:fliph:controlledby:_cardid:_pageid:imgsrc:bar1_link:bar2_link:bar3_link:represents:layer:isdrawing:name:gmnotes:showname:showplayers_name:showplayers_bar1:showplayers_bar2:showplayers_bar3:showplayers_aura1:showplayers_aura2:playersedit_name:playersedit_bar1:playersedit_bar2:playersedit_bar3:playersedit_aura1:playersedit_aura2:lastmove:adv_fow_view_distance:has_bright_light_vision:has_night_vision:night_vision_distance:emits_bright_light:bright_light_distance:emits_low_light:low_light_distance:has_limit_field_of_vision: limit_field_of_vision_center: limit_field_of_vision_total: has_limit_field_of_night_vision: limit_field_of_night_vision_center: limit_field_of_night_vision_total: has_directional_bright_light:directional_bright_light_center:directional_bright_light_total:has_directional_dim_light:directional_dim_light_center:directional_dim_light_total:bar_location:compact_bar:light_sensitivity_multiplier:night_vision_effect:lightColor";

	//We use several variables to track repeating section (--R) commands
	var repeatingSection = undefined;
	var repeatingSectionIDs = undefined;
	var repeatingIndex = undefined;
	var repeatingCharID = undefined;
	var repeatingCharAttrs = undefined;
	var repeatingSectionName = undefined;

	// Storage for any Library handouts found in the game
	var ScriptCardsLibrary = {};

	// The Dice Fonts in Roll20 use these letters to represent the characters that display
	// the dice value (J=0, A=1, B=2, etc) To get the appropriate letter to display, we can
	// just the substring numeric position in this string to find the matching letter.
	const diceLetters =  "JABCDEFGHIJKLMNOPQRSTUVWYZ";

	// Planned JSON support. Not currently implemented/documented.
	var jsonObject = undefined;

	// Used for storing parameters passed to a subroutine with --> or --?|> lines
	var callParamList = {};

	on('ready', function () {
		// if ScriptCards has never been run in this game, create state information to store
		// configuration and values between sessions/sandbox instances.
		if (!state[APINAME]) { state[APINAME] = {module: APINAME, schemaVersion: APIVERSION, config: {}, persistentVariables: {} }; }
		if (state[APINAME].storedVariables == undefined) { state[APINAME].storedVariables = {};	}
		if (state[APINAME].storedSettings == undefined) { state[APINAME].storedSettings = {}; }
		if (state[APINAME].storedStrings == undefined) { state[APINAME].storedStrings = {}; }
		if (state[APINAME].storedSnippets == undefined) { state[APINAME].storedSnippets = {}; }

		// Retrieve the list of token/status markers from the Campaign and create an associative
		// array that links the marker name to the URL of the marker image for use in the
		// [sm]...[/sm] inline formatting syntax. This allows us to fully support custom token
		// marker sets.
		const tokenMarkers = JSON.parse(Campaign().get("token_markers"));
		for (var x=0;x<tokenMarkers.length;x++) {
			tokenMarkerURLs[tokenMarkers[x].name] = tokenMarkers[x].url;
		}

		// Cache any library handouts
		loadLibraryHandounts();

		API_Meta.ScriptCards.version = APIVERSION;

		// Log that the script is "ready". We also include the meta offset which can be used
		// to track sandbox crash errors by subtracting the offset from the line number that the
		// sandbox reports to contain the error.
		log(`-=> ${APINAME} - ${APIVERSION} by ${APIAUTHOR} Ready <=- Meta Offset : ${API_Meta.ScriptCards.offset}`);

		// When a handout changes, recache the library handouts
		on("change:handout", function () {
			loadLibraryHandounts();
		});

		// Main processing area... looing for api commands to handle.
		// While the main ScriptCards command is !scriptcards (or !script, or !scriptcard) we also
		// respond to several other commands, including:
		// !sc-liststoredsettings - Provides a list of stored settings groups (via --s)
		// !sc-deletestoredsettings - Delete a stored settings group
		// !sc-resume - resume a card paused with --i
		// !sc-reentrant - resume execution of a card at a particular label
		on('chat:message', function (msg) {
			if (msg.type === "api") {
				var apiCmdText = msg.content.toLowerCase();
				var processThisAPI = false;
				var isResume = false;
				var isReentrant = false;
				var resumeArgs;
				var cardContent;

				// !sc-liststoredsettings creates a new scriptcard and sends it to
				// chat. With no parameters, it reports a list of all of the stored settings
				// groups. If a stored settings group name is passed, it will list all of the
				// customized settings for that group.
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

				if (apiCmdText.startsWith("!sc-resume ")) {
					var resumeString = msg.content.substring(11);
					resumeArgs = resumeString.split("-|-");
					if (scriptCardsStashedScripts[resumeArgs[0]]) {
						isResume = true;
						processThisAPI = true;
					}
				}

				if (apiCmdText.startsWith("!sc-reentrant ")) {
					var resumeString = msg.content.substring(14);
					resumeArgs = resumeString.split("-|-");
					if (scriptCardsStashedScripts[resumeArgs[0]]) {
						isResume = true;
						isReentrant = true;
						processThisAPI = true;
					}
				}

				if (apiCmdText.startsWith ("!scriptcards ")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!scriptcard ")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!script ")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!scriptcards{{")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!scriptcard{{")) { processThisAPI = true; }
				if (apiCmdText.startsWith ("!script{{")) { processThisAPI = true; }
				if (processThisAPI) {
					var cardParameters = {};
					Object.assign(cardParameters,defaultParameters);
					if (state[APINAME].storedSettings["Default"] !== undefined) {
						newSettings = state[APINAME].storedSettings["Default"];
						for (var key in newSettings) {
							cardParameters[key] = newSettings[key];
						}
					}
					msg.content = processInlinerolls(msg);

					// Store labels and their corresponding line numbers for branching
					var lineLabels = {};
					var labelChecking = {};

					// The returnStack stores the line number to return to after a gosub, while the parameter stack stores parameter lists for nexted gosubs
					var returnStack = [];
					var parameterStack = [];
					var tableLineCounter = 0;

					// Builds up a list of lines that will appear on the output display
					var outputLines = [];
					var gmonlyLines = [];
					var lineCounter = 1;

					// Clear out any pre-existing roll variables
					rollVariables = {};
					stringVariables = {};
					arrayVariables = {};
					arrayIndexes = {};

					loopControl = {};
					loopStack = [];

					scriptData = [];
					saveScriptData = [];
					lastBlockAction = "";
					executionCounter = 0;

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

					if (isResume) {
						var stashIndex = resumeArgs[0];
						if (scriptCardsStashedScripts[stashIndex].scriptContent) { cardLines = JSON.parse(scriptCardsStashedScripts[stashIndex].scriptContent); }
						if (scriptCardsStashedScripts[stashIndex].cardParameters) { cardParameters = JSON.parse(scriptCardsStashedScripts[stashIndex].cardParameters); }
						if (scriptCardsStashedScripts[stashIndex].stringVariables) { stringVariables = JSON.parse(scriptCardsStashedScripts[stashIndex].stringVariables); }
						if (scriptCardsStashedScripts[stashIndex].rollVariables) { rollVariables = JSON.parse(scriptCardsStashedScripts[stashIndex].rollVariables); }
						if (scriptCardsStashedScripts[stashIndex].arrayVariables) { arrayVariables = JSON.parse(scriptCardsStashedScripts[stashIndex].arrayVariables); }
						if (scriptCardsStashedScripts[stashIndex].arrayIndexes) { arrayIndexes = JSON.parse(scriptCardsStashedScripts[stashIndex].arrayIndexes); }
						if (scriptCardsStashedScripts[stashIndex].returnStack) { returnStack = JSON.parse(scriptCardsStashedScripts[stashIndex].returnStack); }
						if (scriptCardsStashedScripts[stashIndex].parameterStack) { parameterStack = JSON.parse(scriptCardsStashedScripts[stashIndex].parameterStack); }
						if (scriptCardsStashedScripts[stashIndex].outputLines) { outputLines = JSON.parse(scriptCardsStashedScripts[stashIndex].outputLines); }
						if (scriptCardsStashedScripts[stashIndex].gmonlyLines) { gmonlyLines = JSON.parse(scriptCardsStashedScripts[stashIndex].gmonlyLines); }
						if (scriptCardsStashedScripts[stashIndex].repeatingSectionIDs) { repeatingSectionIDs = JSON.parse(scriptCardsStashedScripts[stashIndex].repeatingSectionIDs); }
						if (scriptCardsStashedScripts[stashIndex].repeatingSection) { repeatingSection = JSON.parse(scriptCardsStashedScripts[stashIndex].repeatingSection); }
						if (scriptCardsStashedScripts[stashIndex].repeatingCharAttrs) { repeatingCharAttrs = JSON.parse(scriptCardsStashedScripts[stashIndex].repeatingCharAttrs); }
						repeatingCharID = scriptCardsStashedScripts[stashIndex].repeatingCharID;
						repeatingSectionName = scriptCardsStashedScripts[stashIndex].repeatingSectionName;
						repeatingIndex = scriptCardsStashedScripts[stashIndex].repeatingIndex;
						lineCounter = scriptCardsStashedScripts[stashIndex].programCounter;

						if(cardParameters.sourcetoken) {
							var charLookup = getObj("graphic", cardParameters.sourcetoken);
							if (charLookup !== undefined && charLookup.get("represents") !== "") {
								cardParameters.sourcecharacter = getObj("character", charLookup.get("represents"));
							} else {
								cardParameters.sourcecharacter = undefined;
							}
						}

						if(cardParameters.targettoken) {
							var charLookup = getObj("graphic", cardParameters.targettoken);
							if (charLookup !== undefined && charLookup.get("represents") !== "") {
								cardParameters.targetcharacter = getObj("character", charLookup.get("represents"));
							} else {
								cardParameters.targetcharacter = undefined;
							}
						}

						if (!isReentrant) {
							for (var x=1; x<resumeArgs.length; x++) {
								var thisInfo = resumeArgs[x].split(";");
								stringVariables[thisInfo[0].trim()] = thisInfo[1].trim();
							}
						}
						if (!isReentrant && scriptCardsStashedScripts[resumeArgs[0]]) { delete scriptCardsStashedScripts[resumeArgs[0]]; }
					} else {
						// Strip out all newlines in the input text
						cardContent = msg.content.replace(/(\r\n|\n|\r)/gm, "");
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
					}

					// pre-parse line labels and store line numbers for branching and for data lines to store in the data structure
					for (var x=0; x<cardLines.length; x++) {
						var thisTag = getLineTag(cardLines[x],x,false)
						var isRedef = false;
						if (thisTag.charAt(0)==":") {
							if (lineLabels[thisTag.substring(1)]) {
								log(`ScriptCards Warning: redefined label ${thisTag.substring(1)}`);
								isRedef = true;
							}
							if (labelChecking[thisTag.substring(1).toLowerCase()] && !isRedef) {
								log(`ScriptCards Warning: Similar labels ${labelChecking[thisTag.substring(1).toLowerCase()]} and ${thisTag.substring(1)}`);
							}
							lineLabels[thisTag.substring(1)] = x;
							labelChecking[thisTag.substring(1).toLowerCase()] = thisTag.substring(1);
						}
						if (thisTag.toLowerCase() === "d!") {
							var thisData = CSVtoArray(getLineContent(cardLines[x]));
							while (thisData.length > 0) {
								var dataElement = thisData.shift();
								scriptData.push(dataElement);
								saveScriptData.push(dataElement);
							}
						}
					}

					if (isReentrant) {
						outputLines = [];
						gmonlyLines = [];
						var entryLabel = resumeArgs[1].split(";")[0];
						stringVariables["reentryval"] = resumeArgs[1].split(";")[1];
						if (lineLabels[entryLabel]) {
							lineCounter = lineLabels[entryLabel]
						} else {
							log(`ScriptCards Error: Label ${resumeArgs[1]} is not defined for reentrant script`)
						};
					}

					// Process card lines starting with the first line (cardLines[0] will contain an empty string due to the split)
					while (lineCounter < cardLines.length) {

						var thisTag = getLineTag(cardLines[lineCounter],x,true);
						thisTag = replaceVariableContent(thisTag, cardParameters, false);
						var thisContent = getLineContent(cardLines[lineCounter]);

						thisContent = replaceVariableContent(thisContent, cardParameters, (thisTag.charAt(0) == "+" || thisTag.charAt(0) == "*" || thisTag.charAt(0) == "&"));
						//thisContent = replaceCharacterAttributes(thisContent, cardParameters);

						if (cardParameters.debug == 1) {
							log(`Line Counter: ${lineCounter}, Tag:${thisTag}, Content:${thisContent}`);
						}

						// Handle Stashing and asking for info
						if (thisTag.charAt(0).toLowerCase() == "i") {
							var myGuid = uuidv4();
							var stashType = thisTag.substring(1);
							var stashList = thisContent.split("||");
							var buildLine = "";
							var varList = "";
							for (var x=0; x<stashList.length; x++) {
								var theseParams = stashList[x].split(";");
								if (theseParams[0].toLowerCase() == "t") {
									if (buildLine !== "") { buildLine += "-|-"; varList += ";"; }
									buildLine += theseParams[1] + ";&#64;{target|" + theseParams[2] + "|token_id}";
									varList += theseParams[1];
								}
								if (theseParams[0].toLowerCase() == "q") {
									if (buildLine !== "") { buildLine += "-|-"; varList += ";"; }
									buildLine += theseParams[1] + ";?{" + theseParams[2] + "}";
									varList += theseParams[1];
								}
							}
							var flavorText = stashType.split(";")[0];
							var buttonLabel = stashType.split(";")[1];

							stashAScript(myGuid, cardLines, cardParameters, stringVariables, rollVariables, returnStack, parameterStack, lineCounter + 1, outputLines, varList, "X", arrayVariables, arrayIndexes, gmonlyLines);
							lineCounter = cardLines.length + 100;
							cardParameters.hidecard = "1";
							sendChat(msg.who, `/w ${msg.who} ${flavorText}` + makeButton(buttonLabel, `!sc-resume ${myGuid}-|-${buildLine}`, cardParameters));
						}

						// Handle looping statements
						if (thisTag.charAt(0) === "%") {
							var loopCounter = thisTag.substring(1);
							if (loopCounter && loopCounter !== "!") {
								if (loopControl[loopCounter]) { log(`ScriptCards: Warning - loop counter ${loopCounter} reused inside itself on line ${lineCounter}.`); }
								var params = thisContent.split(";");
								if (params.length === 2) { params.push("1"); } // Add a "1" as the assumed step value if only two parameters
								if (params.length === 3) {
									if (isNumeric(params[0]) && isNumeric(params[1]) && isNumeric(params[2]) && parseInt(params[2]) != 0) {
										loopControl[loopCounter] = { initial:parseInt(params[0]), current:parseInt(params[0]), end:parseInt(params[1]), step:parseInt(params[2]), nextIndex: lineCounter }
										stringVariables[loopCounter] = params[0];
										loopStack.push(loopCounter);
										if (cardParameters.debug == 1) { log(`ScriptCards: Info - Beginning of loop ${loopCounter}`) }
									} else {
										if (parseInt(params[2] == 0)) {
											log(`ScriptCards: Error - cannot use loop step of 0 at line ${lineCounter}`)
										} else {
											log(`ScriptCards: Error - loop initialization contains non-numeric values on line ${lineCounter}`)
										}
									}
								}
							} else {
								if (loopStack.length >= 1) {
									var currentLoop = loopStack[loopStack.length-1];
									if (loopControl[currentLoop]) {
										loopControl[currentLoop].current += loopControl[currentLoop].step;
										stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
										if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
											(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
											loopCounter == "!") {
											loopStack.pop();
											delete loopControl[currentLoop];
											if (cardParameters.debug == 1) { log(`ScriptCards: Info - End of loop ${currentLoop}`)}
											if (loopCounter == "!") {
												var line = lineCounter;
												for (line = lineCounter + 1; line<cardLines.length; line++) {
													if (getLineTag(cardLines[line],line,"").trim() == "%") {
														lineCounter = line;
														break;
													}
												}
												if (lineCounter > cardLines.length) {
													log(`ScriptCards: Warning - no end block marker found for loop block started ${loopCounter}`);
													lineCounter = cardLines.length + 1;
												}
											}
										} else {
											lineCounter = loopControl[currentLoop].nextIndex;
										}
									}
								} else {
									log(`ScriptCards: Error - Loop end statement without and active loop on line ${lineCounter}`);
								}
							}
						}

						// Handle setting of card parameters (lines beginning with --#)
						if (thisTag.charAt(0) === "#") {
							var paramName = thisTag.substring(1).toLowerCase();
							paramName = parameterAliases[paramName] || paramName;
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

								case "activepage":
									if (thisContent.trim().toLowerCase() === "playerpage") {
										cardParameters.activepageobject = getObj("page", Campaign().get("playerpageid"));
									} else {
										var pageLookup = getObj("page", thisContent.trim());
										if (pageLookup !== undefined) {
											cardParameters.activepageobject = pageLookup;
										}
									}
									break;

								case "titlecardgradient":
									if (thisContent.trim() !== "0") {
										cardParameters["titlecardbackgroundimage"] = gradientStyle;
									} else {
										cardParameters["titlecardbackgroundimage"] = "";
									}
									break;

								case "buttontextcolor":
									if (thisContent.trim().match(/^[0-9a-fA-F]{6}$/)) {
										//cardParameters["buttontextcolor"] = `#${thisContent.trim()}`;
									}
									break;

								case "bodybackgroundimage":
									if (thisContent.trim() !== "") {
										cardParameters.oddrowbackground = "#00000000";
										cardParameters.evenrowbackground = "#00000000";
									}
								break;

								case "evenrowbackgroundimage":
									if (thisContent.trim() !== "") {
										cardParameters.evenrowbackground = "#00000000";
									}
								break;

								case "oddrowbackgroundimage":
									if (thisContent.trim() !== "") {
										cardParameters.oddrowbackground = "#00000000";
									}
								break;

								/*
								case "damagebuttonbackgroundimage":
									if (thisContent.trim() !== "") {
										cardParameters.damagebuttonbackgroundcolor = "#00000000";
									}
								break;

								case "healbuttonbackgroundimage":
									if (thisContent.trim() !== "") {
										cardParameters.healbuttonbackgroundcolor = "#00000000";
									}
								break;
								*/
							}
						}

						// Handle setting string values
						if (thisTag.charAt(0) === "&") {
							var variableName = thisTag.substring(1).trim();
							if (thisContent.charAt(0) == "+") {
								stringVariables[variableName] = (stringVariables[variableName] || "") + replaceVariableContent(thisContent.substring(1), cardParameters, true);
							} else {
								stringVariables[variableName] = replaceVariableContent(thisContent,cardParameters, true);
							}
						}

						// Handle data read statements
						if (thisTag.charAt(0).toLowerCase() === "d" && thisTag.charAt(1) !== "!") {
							if (thisTag.charAt(1) == "<") {
								scriptData = saveScriptData.slice(0);
							} else {
								if (scriptData.length > 0) {
									stringVariables[thisTag.substring(1)] = scriptData.shift();
								} else {
									stringVariables[thisTag.substring(1)] = "EndOfDataError";
								}
							}
						}

						// Handle "Macro" calls (--m)
						if (thisTag.charAt(0).toLowerCase() === "m") {
							var characterName = thisTag.substring(1);
							var macroName = thisContent.trim();
							if (characterName.length >= 1) {
								sendChat("ScriptCards", `%{${characterName}|${macroName}}`);
							} else {
								sendChat("ScriptCards", `#${macroName}`);
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
										var resultType = "goto";
										var varName = undefined;
										var varValue = undefined;
										if (jumpDest) {
											switch (jumpDest.charAt(0)) {
												case ">" : resultType = "gosub"; break;
												case "%" : resultType = "next"; break;
												case "=" :
												case "&" :
													jumpDest.charAt(0) == "=" ? resultType = "rollset" : resultType = "stringset";
													jumpDest = jumpDest.substring(1);
													varName = jumpDest.split(";")[0];
													varValue  = jumpDest.split(";")[1];
													break;
											}

											switch (resultType) {
												case "goto":
													if (lineLabels[jumpDest]) {
														lineCounter = lineLabels[jumpDest] ;
													} else {
														log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter}`);
													}
													break;
												case "gosub":
													jumpDest = jumpDest.substring(1);
													parameterStack.push(callParamList);
													var paramList = CSVtoArray(jumpDest.trim());
													callParamList = {};
													var paramCount = 0;
													if (paramList) {
														paramList.forEach(function(item) {
															callParamList[paramCount] = item.toString().trim();
															paramCount++;
														});
													}
													returnStack.push(lineCounter);
													jumpDest = jumpDest.split(";")[0];
													if (lineLabels[jumpDest]) {
														lineCounter = lineLabels[jumpDest] ;
													} else {
														log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter}`);
													}
													break;
												case "rollset":
													rollVariables[varName] = parseDiceRoll(replaceVariableContent(varValue, cardParameters), cardParameters, true);
													break;
												case "stringset":
													if (varName && varValue) {
														if (resultType == "stringset" && varValue.charAt(0) == "+") {
															varValue = (stringVariables[varName] || "") +  varValue.substring(1);
														}
														stringVariables[varName] = replaceVariableContent(varValue,cardParameters, true);
													} else {
														log(`ScriptCards Error: Variable name or value not specified in conditional on line ${lineCounter}`);
													}
													break;
												case "next":
													if (loopStack.length >= 1) {
														var currentLoop = loopStack[loopStack.length-1];
														if (loopControl[currentLoop]) {
															loopControl[currentLoop].current += loopControl[currentLoop].step;
															stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
															if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
																(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
																jumpDest.charAt(1) == "!") {
																loopStack.pop();
															delete loopControl[currentLoop];
															} else {
																lineCounter = loopControl[currentLoop].nextIndex;
															}
														}
													} else {
														log(`ScriptCards: Error - Loop end statement without and active loop on line ${lineCounter}`);
													}
													break;
											}
											x = cases.length + 1;
										}
									}
								}
							}
						}

						// Handle setting RollVariables to function call results
						if (thisTag.charAt(0) === "~") {
							var variableName = thisTag.substring(1);
							var params = thisContent.split(";");
							switch (params[0].toLowerCase()) {
								case "character":
									if (params.length >= 4) {
										switch (params[1].toLowerCase()) {
											case "runability":
												var charid = undefined
												var char = getObj("character", params[2]);
												if (char === undefined) {
													var actualToken = getObj("graphic", params[2]);
													if (actualToken !== undefined) {
														charid = actualToken.get("represents");
														char = getObj("character", charid);
													}
												} else {
													charid = char.get("_id");
												}
												if (char !== undefined) {
													var abilname = params[3]
													var ability = findObjs({type: "ability", _characterid: charid, name: abilname })
													if (ability !== undefined && ability !== []) {
														ability = ability[0]
														if (ability !== undefined) {
															sendChat(char.get("name"), ability.get('action').replace(/@\{([^|]*?|[^|]*?\|max|[^|]*?\|current)\}/g, '@{'+(char.get('name'))+'|$1}'));
														}
													}
												}
											break;
										}
									}
								break;

								case "system":
									if (params.length >= 3) {
										switch (params[1].toLowerCase()) {
											case "date":
												var d = new Date();
												switch (params[2].toLowerCase()) {
													case "getdatetime":
														log(cardParameters.locale);
														try {
															stringVariables[variableName] = d.toLocaleString(cardParameters.locale, {timeZone: cardParameters.timezone});
														} catch {
															stringVariables[variableName] = "Unknown/Invalid Locale or TimeZone";
														}
													break;
													case "gettime":
														try {
															stringVariables[variableName] = d.toLocaleTimeString(cardParameters.locale,  {timeZone: cardParameters.timezone});
														} catch {
															stringVariables[variableName] = "Unknown/Invalid Locale or TimeZone";
														}
													break;
													case "getdate":
														try {
															stringVariables[variableName] = d.toLocaleDateString(cardParameters.locale, {timeZone: cardParameters.timezone});
														} catch {
															stringVariables[variableName] = "Unknown/Invalid Locale or TimeZone";
														}
													break;
													case "getraw":
														stringVariables[variableName] = d.getTime();
													break;
												}
											break;

											case "readsetting":
												stringVariables[variableName] = cardParameters[params[2].toLowerCase()] || "UnknownSetting";
											break;

											case "dumpvariables":
												switch (params[2].toLowerCase()) {
													case "rolls":
														for (var key in rollVariables) {
															log(`RollVariable: ${key}, Value: ${rollVariables[key]}`)
														}
													break;

													case "string":
														for (var key in stringVariables) {
															log(`StringVariable: ${key}, Value: ${stringVariables[key]}`)
														}
													break;

													case "array":
														for (var key in arrayVariables) {
															log(`ArrayVariable: ${key}, Value: ${arrayVariables[key]}`)
														}
													break;
												}
											break;

											case "findability":
												// Params: 2-character name, 3-ability name
												stringVariables[variableName] = "AbilityNotFound";
												var theChar = findObjs({_type:"character", name: params[2]});
												if (theChar[0]) {
													var theAbility = findObjs({_type:"ability", _characterid: theChar[0].id, name:params[3]});
													if (theAbility[0]) {
														stringVariables[variableName] = theAbility[0].id;
													}
												}
											break;
										}
									}
								break;

								case "turnorder":
									var variableName = thisTag.substring(1);
									if (params.length == 2) {
										if (params[1].toLowerCase() == "clear") {
											Campaign().set("turnorder", "");
										}
										if (params[1].toLowerCase() == "getcurrentactor") {
											var turnorder = [];
											if (Campaign().get("turnorder") !== "") {
												turnorder = JSON.parse(Campaign().get("turnorder"));
											}
											if (turnorder !== []) {
												stringVariables[variableName] = turnorder[0].id
											}
										}
									}
									if (params.length == 3) {
										if (params[1].toLowerCase() == "removetoken") {
											var turnorder = [];
											if (Campaign().get("turnorder") !== "") {
												turnorder = JSON.parse(Campaign().get("turnorder"));
											}
											for (var x=turnorder.length-1; x>=0; x--) {
												if (turnorder[x].id == params[2]) {
													turnorder.splice(x,1);
												}
											}
											Campaign().set("turnorder", JSON.stringify(turnorder));
										}
										if (params[1].toLowerCase() == "findtoken") {
											var turnorder = JSON.parse(Campaign().get("turnorder"));
											for (var x=turnorder.length-1; x>=0; x--) {
												if (turnorder[x].id.trim() == params[2].trim()) {
													 stringVariables[variableName] = turnorder[x].pr;
													 log(`Set variable to ${turnorder[x].pr}`)
												}
											}
										}
									}
									if (params.length == 4) {
										if (params[1].toLowerCase() == "addtoken") {
											var turnorder = [];
											if (Campaign().get("turnorder") !== "") {
												turnorder = JSON.parse(Campaign().get("turnorder"));
											}
											turnorder.push({
												id: params[2],
												pr: params[3],
												custom: "",
											});
											Campaign().set("turnorder", JSON.stringify(turnorder));
										}
										if (params[1].toLowerCase() == "replacetoken") {
											var turnorder = [];
											if (Campaign().get("turnorder") !== "") {
												turnorder = JSON.parse(Campaign().get("turnorder"));
											}
											var wasfound = false;
											for (var x=turnorder.length-1; x>=0; x--) {
												if (turnorder[x].id.trim() == params[2].trim()) {
													turnorder[x].pr = params[3];
													wasfound=true;
												}
											}
											if (!wasfound) {
												turnorder.push({
													id: params[2],
													pr: params[3],
													custom: "",
												});
											}
											Campaign().set("turnorder", JSON.stringify(turnorder));
										}
										if (params[1].toLowerCase() == "addcustom") {
											var turnorder = [];
											if (Campaign().get("turnorder") !== "") {
												turnorder = JSON.parse(Campaign().get("turnorder"));
											}
											turnorder.push({
												id: "-1",
												pr: params[3],
												custom: params[2],
											});
											Campaign().set("turnorder", JSON.stringify(turnorder));
										}
									}
								break;

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

								case "euclideanpixel":
								case "euclideanlong":
									var result = 0;
									if (params.length >= 3) {
										var token1 = getObj("graphic", params[1]);
										var token2 = getObj("graphic", params[2]);
										if (token1 && token2) {
											// Calculate the euclidean unit distance between two tokens (params[1] and params[2])
											var x1 = token1.get("left");
											var x2 = token2.get("left");
											var y1 = token1.get("top");
											var y2 = token2.get("top");
											result = Math.floor(Math.sqrt(Math.pow((x1-x2),2)+Math.pow((y1-y2),2)));
											if (params[0].toLowerCase() == "euclideanlong") { result = result / 70; }
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
												if (params[2].toLowerCase() == "array") {
													if (arrayVariables[variableName]) {
														state[APINAME].storedArrayVariable = Object.assign(arrayVariables[variableName]);
														state[APINAME].storedArrayIndex = Object.assign(arrayIndexes[variableName]);
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
												if (params[2].toLowerCase() == "array") {
													if (state[APINAME].storedArrayVariable) {
														arrayVariables[variableName] = Object.assign(state[APINAME].storedArrayVariable);
														arrayIndexes[variableName] = Object.assign(state[APINAME].storedArrayIndex);
													}
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

									if (params[1].toLowerCase() == "abs" && params.length == 3) {
										if (!isNaN(parseFloat((params[2])))) {
											rollVariables[variableName] = Math.abs(params[2])
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

									if (params.length == 4 && params[1].toLowerCase() == "angle") {
										var token1 = getObj("graphic", params[2]);
										var token2 = getObj("graphic", params[3]);
										if (token1 && token2) {
											var angle = Math.atan2(token2.get("top") - token1.get("top"), token2.get("left") - token1.get("left"));
											angle *= 180 / Math.PI;
											angle -= 270;
											while (angle < 0) { angle = 360 + angle}
											stringVariables[variableName] = angle;
										}
									}
								break;

								case "attribute":
									if (params.length > 4) {
										if (params[1].toLowerCase() == "set") {
											var theCharacter = getObj("character", params[2]);
											if (theCharacter) {
												var oldAttrs = findObjs({ _type:"attribute", _characterid: params[2], name: params[3].trim()});
												if (oldAttrs.length > 0) {
													oldAttrs.forEach(function(element) { element.remove(); });
												}
												if (params[4] !== "") {
													createObj("attribute", { _characterid: params[2], name: params[3].trim(), current: params[4].trim() });
												}
											}
										}
									}

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

											case "tolowercase":
												stringVariables[variableName] = params[2].toLowerCase();
												break;

											case "touppercase":
												stringVariables[variableName] = params[2].toUpperCase();
												break;

											case "trim":
												stringVariables[variableName] = params[2].trim();
												break;

											case "totitlecase":
												stringVariables[variableName] = params[2].toLowerCase()
													.split(' ')
													.map(function(word) {
														return (word.charAt(0).toUpperCase() + word.slice(1));
													})
													.join(" ")
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
													stringVariables[variableName] = params[3].substring(params[3].indexOf(params[2])+params[2].length);
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

											case "replaceall":
												var str = params[4];
												while(str.includes(params[2])) { str = str.replace(params[2], params[3])}
												stringVariables[variableName] = str;
												break;
										}
									}
									break;

								case "array":
									if (params.length > 2) {
										if (params[1].toLowerCase() == "define") {
											arrayVariables[params[2]] = [];
											for (var x=3; x<params.length; x++) {
												arrayVariables[params[2]].push(params[x]);
											}
											arrayIndexes[params[2]] = 0;
                                        }
                                        if (params[1].toLowerCase() == "sort") {
                                            if (arrayVariables[params[2]]) {
                                                arrayVariables[params[2]].sort();
                                            }
                                        }
										if (params[1].toLowerCase() == "stringify") {
											if (arrayVariables[params[2]]) {
												stringVariables[variableName] = arrayVariables[params[2]].join(";");
											} else {
												stringVariables[variableName] = "";
											}
										}
										if (params[1].toLowerCase() == "pageobjects") {
                                            var pages = findObjs({_type:"page"});
                                            arrayVariables[params[2]] = [];
                                            for (var x=0; x<pages.length; x++) {
                                                arrayVariables[params[2]].push(pages[x].get("id"));
                                            }
                                        }
										if (params[1].toLowerCase() == "pagetokens") {
											arrayVariables[params[2]] = [];
											var pageid = params[3];
											var templateToken = getObj("graphic", params[3]);
											if (templateToken) { 
												pageid = templateToken.get("_pageid");
											}
											var filter="all";
											if (params[4]) {
												if (params[4].toLowerCase() == "char" || params[3].toLowerCase() == "chars") {
													filter = "char";
												}
												if (params[4].toLowerCase() == "npc" || params[3].toLowerCase() == "npcs") {
													filter = "npc";
												}
												if (params[4].toLowerCase() == "pc" || params[3].toLowerCase() == "pcs") {
													filter = "pc";
												}
												if (params[4].toLowerCase() == "graphic" || params[3].toLowerCase() == "graphics") {
													filter = "graphic";
												}
											}
											if (getObj("page", pageid)) {
												var t = findObjs({_type:"graphic", _pageid: pageid });
												if (t) {
													for (var x=0; x<t.length; x++) {
														if (filter == "all") {
															arrayVariables[params[2]].push(t[x].id);
														}

														if (filter == "char") {
															if (!isBlank(t[x].get("represents"))) { arrayVariables[params[2]].push(t[x].id); }
														}

														if (filter == "npc") {
															var charobj = getObj("character", t[x].get("represents"));
															if (charobj && isBlank(charobj.get("controlledby"))) { arrayVariables[params[2]].push(t[x].id); }
														}

														if (filter == "pc") {
															var charobj = getObj("character", t[x].get("represents"));
															if (charobj && !isBlank(charobj.get("controlledby"))) { arrayVariables[params[2]].push(t[x].id); }
														}

														if (filter == "graphic") {
															if (isBlank(t[x].get("represents"))) { arrayVariables[params[2]].push(t[x].id); }
														}

													}
												}
												arrayIndexes[params[2]] = 0;
												if (variableName) { stringVariables[variableName] = arrayVariables[params[2]].length; }
											} else {
												arrayVariables[params[2]] = [];
												if (variableName) { stringVariables[variableName] = "0"; }
											}
										}
										if (params[1].toLowerCase() == "playerobjects") {
											var players = findObjs({_type:"player"});
											arrayVariables[params[2]] = [];
											for (var x=0; x<players.length; x++) {
												arrayVariables[params[2]].push(players[x].get("id"));
											}
										}
										if (params[1].toLowerCase() == "handoutobjects") {
											var players = findObjs({_type:"handout"});
											arrayVariables[params[2]] = [];
											for (var x=0; x<players.length; x++) {
												arrayVariables[params[2]].push(players[x].get("id"));
											}
										}
										if (params[1].toLowerCase() == "selectedtokens") {
											if (msg.selected) {
												arrayVariables[params[2]] = [];
												for (var x=0; x < msg.selected.length; x++) {
													var obj = getObj(msg.selected[x]._type, msg.selected[x]._id);
													arrayVariables[params[2]].push(obj.get("id"));
												}
												arrayIndexes[params[2]] = 0;
												if (variableName) { stringVariables[variableName] = arrayVariables[params[2]].length; }
											} else {
												arrayVariables[params[2]] = [];
												if (variableName) { stringVariables[variableName] = "0"; }
											}
										}
										if (params[1].toLowerCase() == "statusmarkers") {
											arrayVariables[params[2]] = [];
											var theToken = getObj("graphic", params[3]);
											if (theToken) {
												var markers = theToken.get("statusmarkers").split(",");
												for (var x=0; x<markers.length; x++) {
													arrayVariables[params[2]].push(markers[x]);
												}
												arrayIndexes[params[2]] = 0;
											}
										}
										if (params[1].toLowerCase() == "add") {
											if (!arrayVariables[params[2]]) { arrayVariables[params[2]] = []; arrayIndexes[params[2]] = 0; }
											for (var x=3; x<params.length; x++) {
												arrayVariables[params[2]].push(params[x]);
											}
										}
										if (params[1].toLowerCase() == "remove") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												for (var x=3; x<params.length; x++) {
													for (var i=arrayVariables[params[2]].length-1; i>=0; i--) {
														if (arrayVariables[params[2]][i] == params[x]) {
															arrayVariables[params[2]].splice(i,1);
														}
													}
												}
											}
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length == 0) {
												delete arrayVariables[params[2]];
												delete arrayIndexes[params[2]];
											} else {
												arrayIndexes[params[2]] = 0;
											}
										}
										if (params[1].toLowerCase() == "removeat") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												if (Number(params[3] < arrayVariables[params[2]].length))
												{
													arrayVariables[params[2]].splice(Number(params[3]),1);
												}
											}
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length == 0) {
												delete arrayVariables[params[2]];
												delete arrayIndexes[params[2]];
											} else {
												arrayIndexes[params[2]] = 0;
											}
										}
										if (params[1].toLowerCase() == "setindex") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												if (arrayVariables[params[2]].length > Number(params[3])) {
													arrayIndexes[params[2]] = Number(params[3]);
												}
											}
										}

										if (params[1].toLowerCase() == "getindex") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												stringVariables[variableName] = arrayIndexes[params[2]];
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "indexof") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												var wasFound = arrayVariables[params[2]].indexOf(params[3]);
												if (wasFound >= 0) {
														stringVariables[variableName] = wasFound.toString();
												} else {
														stringVariables[variableName] = "ArrayError";
												}
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "getlength" || params[1].toLowerCase() == "getcount") {
											if (arrayVariables[params[2]]) {
												stringVariables[variableName] = arrayVariables[params[2]].length;
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "getcurrent") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												stringVariables[variableName] = arrayVariables[params[2]][arrayIndexes[params[2]]];
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "getfirst") {
											if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
												arrayIndexes[params[2]] = 0;
												stringVariables[variableName] = arrayVariables[params[2]][arrayIndexes[params[2]]];
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "getlast") {
											if (arrayVariables[params[2]]) {
												arrayIndexes[params[2]] = arrayVariables[params[2]].length-1;
												stringVariables[variableName] = arrayVariables[params[2]][arrayIndexes[params[2]]];
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "getnext") {
											if (arrayVariables[params[2]]) {
												if (arrayIndexes[params[2]] < arrayVariables[params[2]].length-1) {
													arrayIndexes[params[2]]++;
													stringVariables[variableName] = arrayVariables[params[2]][arrayIndexes[params[2]]];
												} else {
													stringVariables[variableName] = "ArrayError";
												}
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}

										if (params[1].toLowerCase() == "getprevious") {
											if (arrayVariables[params[2]]) {
												if (arrayIndexes[params[2]] > 0) {
													arrayIndexes[params[2]]--;
													stringVariables[variableName] = arrayVariables[params[2]][arrayIndexes[params[2]]];
												} else {
													stringVariables[variableName] = "ArrayError";
												}
											} else {
												stringVariables[variableName] = "ArrayError";
											}
										}
									}
									if (params.length == 5) {
										if (params[1].toLowerCase() == "replace") {
											if (arrayVariables[params[2]]) {
												for (var i=0; i < arrayVariables[params[2]].length; i++) {
													if (arrayVariables[params[2]][i] == params[3]) {
														arrayVariables[params[2]][i] = params[4];
													}
												}

											}
											arrayIndexes[params[2]] = 0;
										}
										if (params[1].toLowerCase() == "setatindex") {
											if (arrayVariables[params[2]]) {
												var index = Number(params[3]);
												if (arrayVariables[params[2]].length >= index) {
													arrayVariables[params[2]][index] = params[4];
												}
											}
										}
										if (params[1].toLowerCase() == "fromstring") {
											arrayVariables[params[2]] = [];
											var splitString = params[4].split(params[3]);
											for (var x=0; x<splitString.length; x++) {
												arrayVariables[params[2]].push(splitString[x]);
											}
											arrayIndexes[params[2]] = 0;
										}
									}
									break;

								case "object":

									break;

							}
						}

						// Handle API Call Lines
						if (thisTag.charAt(0) === "@") {
							var apicmd = thisTag.substring(1);
							var spacer = " ";
							const slash="\\";

							// Replace _ with --
							var params = thisContent.replace(/(^|\ +)_/g, " --");

							// Remove deferral markers from deferred SelectManager/ZeroFrame calls
							var regex = new RegExp(`${slash}{${slash}${cardParameters.deferralcharacter}(${slash}&.*?)${slash}}`, "g");
							params = params.replace(regex, "{$1}");

							// Remove deferral markers from deferred Fetch calls
							regex = new RegExp(`${slash}@${slash}${cardParameters.deferralcharacter}${slash}((.*?)${slash})`,"g");
							params = params.replace(regex, "@($1)");
							regex = new RegExp(`${slash}*${slash}${cardParameters.deferralcharacter}${slash}((.*?)${slash})`,"g");
							params = params.replace(regex, "*($1)");

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

						// Handle setting roll ID variables
						if (thisTag.charAt(0) === "=") {
							var rollIDName = thisTag.substring(1).trim();
							rollVariables[rollIDName] = parseDiceRoll(replaceVariableContent(thisContent, cardParameters), cardParameters, true);
						}

						// Handle direct output lines
						if (thisTag.charAt(0) === "+") {
							var rowData = buildRowOutput(thisTag.substring(1), replaceVariableContent(thisContent,cardParameters, true));

							tableLineCounter += 1;
							if (tableLineCounter % 2 == 0) {
								while(rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.evenrowfontcolor); }
								while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; background-image: ${cardParameters.evenrowbackgroundimage}; `); }
								//while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; `); }
							} else {
								while(rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.oddrowfontcolor); }
								while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; background-image: ${cardParameters.oddrowbackgroundimage}; `); }
								//while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; `); }
							}
							rowData = processInlineFormatting(rowData, cardParameters);

							outputLines.push(rowData);
						}

						if (thisTag.charAt(0) === "*") {
							var rowData = buildRowOutput(thisTag.substring(1), replaceVariableContent(thisContent,cardParameters, true));

							tableLineCounter += 1;
							if (tableLineCounter % 2 == 0) {
								while(rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.evenrowfontcolor); }
								while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; background-image: ${cardParameters.evenrowbackgroundimage}; `); }
								//while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; `); }
							} else {
								while(rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.oddrowfontcolor); }
								while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; background-image: ${cardParameters.oddrowbackgroundimage}; `); }
								//while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; `); }
							}
							rowData = processInlineFormatting(rowData, cardParameters);

							gmonlyLines.push(rowData);
						}

						// Handle Conditional Lines
						if (thisTag.charAt(0) === "?") {
							var isTrue = processFullConditional(thisTag.substring(1));
							var trueDest = thisContent.trim();
							var falseDest = undefined;
							var varName = undefined;
							var varValue = undefined;
							var resultType = "goto";
							if (trueDest.indexOf("|") >= 0) {
								falseDest = trueDest.split("|")[1].trim();
								trueDest = trueDest.split("|")[0].trim();
							}
							if (cardParameters.debug == 1) { log(`Condition ${thisTag.substring(1)} evaluation result: ${isTrue}`); }
							var jumpDest = isTrue ? trueDest : falseDest;
							var blockSkip = false;
							var blockChar = "]";
							if (isTrue && falseDest == "[") { blockSkip = true; }
							if (!isTrue && trueDest == "[") { blockSkip = true; }
							if (jumpDest) {
								switch (jumpDest.charAt(0)) {
									case ">" : resultType = "gosub"; break;
									case "%" : resultType = "next"; break;
									case "[" : resultType = "block"; break;
									case "=" :
									case "&" :
										jumpDest.charAt(0) == "=" ? resultType = "rollset" : resultType = "stringset";
										jumpDest = jumpDest.substring(1);
										varName = jumpDest.split(";")[0];
										varValue  = jumpDest.split(";")[1];
										break;
								}

								switch (resultType) {
									case "goto":
										if (lineLabels[jumpDest]) {
											lineCounter = lineLabels[jumpDest] ;
										} else {
											log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter}`);
										}
										break;
									case "gosub":
										jumpDest = jumpDest.substring(1);
										parameterStack.push(callParamList);
										var paramList = CSVtoArray(jumpDest.trim());
										callParamList = {};
										var paramCount = 0;
										if (paramList) {
											paramList.forEach(function(item) {
												callParamList[paramCount] = item.toString().trim();
												paramCount++;
											});
										}
										returnStack.push(lineCounter);
										jumpDest = jumpDest.split(";")[0];
										if (lineLabels[jumpDest]) {
											lineCounter = lineLabels[jumpDest] ;
										} else {
											log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter}`);
										}
										break;
									case "rollset":
										rollVariables[varName] = parseDiceRoll(replaceVariableContent(varValue, cardParameters, false), cardParameters);
										break;
									case "stringset":
										if (varName && varValue) {
											if (resultType == "stringset" && varValue.charAt(0) == "+") {
												varValue = (stringVariables[varName] || "") +  varValue.substring(1);
											}
											stringVariables[varName] = replaceVariableContent(varValue,cardParameters, false);
										} else {
											log(`ScriptCards Error: Variable name or value not specified in conditional on line ${lineCounter}`);
										}
										break;
									case "next":
										if (loopStack.length >= 1) {
											var currentLoop = loopStack[loopStack.length-1];
											if (loopControl[currentLoop]) {
												loopControl[currentLoop].current += loopControl[currentLoop].step;
												stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
												if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
													(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
													jumpDest.charAt(1) == "!") {
													loopStack.pop();
													delete loopControl[currentLoop];
													blockSkip = true;
													blockChar = "%";
												} else {
													lineCounter = loopControl[currentLoop].nextIndex;
												}
											}
										} else {
											log(`ScriptCards: Error - Loop end statement without and active loop on line ${lineCounter}`);
										}
										break;
									case "block":
										lastBlockAction = "E";
										break;
								}
							}
							if (blockSkip) {
								var line = lineCounter;
								if (blockChar === "]") { lastBlockAction = "S"; }
								for (line = lineCounter + 1; line<cardLines.length; line++) {
									if (getLineTag(cardLines[line],line,"").trim() == blockChar) {
										lineCounter = line + (blockChar == "]" ? 0 : 0);
										break;
									}
								}
								if (lineCounter > cardLines.length) {
									log(`ScriptCards: Warning - no end block marker found for block started reference on line ${lineCounter}`);
									lineCounter = cardLines.length + 1;
								}
							}
						}

						// Handle X lines (exit)
						if (thisTag.charAt(0).toLowerCase() == "x") {
							if (cardParameters["reentrant"] !== 0) {
								stashAScript(cardParameters["reentrant"], cardLines, cardParameters, stringVariables, rollVariables, returnStack, parameterStack, lineCounter + 1, outputLines, varList, "X", arrayVariables, arrayIndexes, gmonlyLines);
							}
							lineCounter = cardLines.length+1;
						}

						// Handle E lines (echo)
						if (thisTag.charAt(0).toLowerCase() == "e") {
							var sendAs = thisTag.substring(1);
							sendChat(sendAs, thisContent);
						}

						// Handle [ lines (Arrays)
						//if (thisTag.charAt(0) == "[") {
						//	var arrayName = thisTag.substring(1);
						//	var addItems = false;
						//	if (thisContent.charAt(0) == "+") { addItems = true; thisContent = thisContent.substring(1); }
						//	if (!addItems || !arrays[arrayName]) { arrays[arrayName] = []; }
						//	var items = thisContent.split("|");
						//	for (var x=0; x<items.length; x++) { arrays[arrayName].push(items[x]); }
						//}

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
												var pid = s.get("_pageid");
												var effectInfo = findObjs({
													_type : "custfx",
													name : params[1].trim()
												});
												if (!_.isEmpty(effectInfo)) {
													spawnFxWithDefinition(x, y, effectInfo[0].get('definition'), pid);
												} else {
													var t = params[1].trim();
													if (t !== "" && t !== "none") {
														spawnFx(x,y,t,pid);
													}
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
												var x2 = p.get("left");
												var y2 = p.get("top");
												var pid = s.get("_pageid");
												var effectInfo = findObjs({
													_type : "custfx",
													name : params[2].trim()
												});
												if (!_.isEmpty(effectInfo)) {
													var angleDeg = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
													if (angleDeg < 0) {
														angleDeg += 360;
													}
													var definition = effectInfo[0].get('definition');
													definition.angle = angleDeg;
													spawnFxWithDefinition(x1, y1, definition, pid);
												} else {
													var t = params[2].trim();
													if (t !== "" && t !== "none" ) {
														spawnFxBetweenPoints({x:x1, y:y1}, {x:x2, y:y2}, t, pid);
													}
												}
											}
										}
										break;

									case "point":
										var params = thisContent.split(" ");
										var x = params[0];
										var y = params[1];
										var pid = Campaign().get("playerpageid");
										if (cardParameters.activepage !== "") {
											pid = cardParameters.activepage;
										}
										var effectInfo = findObjs({
											_type : "custfx",
											name : params[2].trim()
										});
										if (!_.isEmpty(effectInfo)) {
											spawnFxWithDefinition(x, y, effectInfo[0].get('definition'), pid);
										} else {
											var t = params[2].trim();
											if (x && y) {
												if (t !== "" && t !== "none") {
													spawnFx(x,y,t,pid);
												}
											}
										}
										break;

									case "line":
										var params = thisContent.split(" ");
										var x1 = params[0];
										var y1 = params[1];
										var x2 = params[2];
										var y2 = params[3];
										var t = params[4];
										var pid = Campaign().get("playerpageid");
										log(`${x1} ${y1} ${x2} ${y2} ${t} ${pid}`)
										if (x1 && y1 && x2 && y2 && t && pid) {
											spawnFxBetweenPoints({x:x1, y:y1}, {x:x2, y:y2}, t, pid);
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
										}
									}
									break;
							}
						}

						// Handle branch lines
						if (thisTag.charAt(0) === "^") {
							var jumpTo = thisTag.substring(1);
							if (lineLabels[jumpTo]) { lineCounter = lineLabels[jumpTo] } else { log(`ScriptCards Error: Label ${jumpTo} is not defined on line ${lineCounter}`)};
						}

						if (thisTag.charAt(0) === "]") {
							if (thisContent.charAt(0) === "[") {
								if (lastBlockAction === "S") {
									lastBlockAction = "";
								}
								if (lastBlockAction === "E") {
									var line = lineCounter;
									for (line = lineCounter + 1; line<cardLines.length; line++) {
										if (getLineTag(cardLines[line],line,"").trim() === "]") {
											lineCounter = line;
											break;
										}
									}
									if (lineCounter > cardLines.length) {
										log(`ScriptCards: Warning - no end block marker found for block started on line ${lineCounter}`);
										lineCounter = cardLines.length + 1;
									}
									lastBlockAction = "";
								}
							} else {
								lastBlockAction = "";
							}
						}

						// Handle gosub lines
						if (thisTag.charAt(0) === ">") {
							parameterStack.push(callParamList);
							var paramList = CSVtoArray(thisContent.trim());
							callParamList = {};
							var paramCount = 1;
							if (paramList) {
								paramList.forEach(function(item) {
									callParamList[paramCount] = item.toString().trim();
									paramCount++;
								});
							}
							var jumpTo = thisTag.substring(1);
							if (lineLabels[jumpTo]) {
								returnStack.push(lineCounter);
								lineCounter = lineLabels[jumpTo];
							} else { log(`ScriptCards Error: Label ${jumpTo} is not defined on line ${lineCounter}`)};
						}

						// Handle return from gosub
						if (thisTag.charAt(0) === "<") {
							if (returnStack.length > 0) {
								callParamList = parameterStack.pop();
								lineCounter = returnStack.pop();
							}
						}

						executionCounter++;
						if (executionCounter > cardParameters.executionlimit) {
							log("ScriptCards Error: Execution Limit Reached. Terminating Script;")
							lineCounter = cardLines.length+1;
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
					var gmoutput;
					if (gmonlyLines.length > 0) {
						gmoutput = htmlTemplateHiddenTitle.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle);
					}

					if (cardParameters.hidetitlecard == "0") {
						cardOutput = htmlTemplate.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle);
					} else {
						cardOutput = htmlTemplateHiddenTitle.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle);
					}

					for (var x=0; x<outputLines.length; x++) {
						//cardOutput += processInlineFormatting(outputLines[x], cardParameters);
						cardOutput += outputLines[x];
					}

					for (var x=0; x<gmonlyLines.length; x++) {
						//gmoutput += processInlineFormatting(gmonlyLines[x], cardParameters);
						gmoutput += gmonlyLines[x];
					}


					cardOutput += htmlTemplateEnd;
					cardOutput = replaceStyleInformation(cardOutput, cardParameters);

					if (gmonlyLines.length > 0) {
						gmoutput += htmlTemplateEnd;
						gmoutput = replaceStyleInformation(gmoutput, cardParameters);
					}

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
							emote = "<div style='display: table; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal; background: " + cardParameters.emotebackground + "'>" + emoteLeft + "<div style='display: table-cell; width: 100%; " + " font-size: " + cardParameters.emotefontsize + "; font-weight: " + cardParameters.emotefontweight + "; color: " + cardParameters.emotefontcolor + "; font-family: " + cardParameters.emotefont + "; " + "vertical-align: middle; text-align: center; padding: 0px 2px;'>" + cardParameters.emotetext + "</div><div style='display: table-cell; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal;'>" + emoteRight + "</div></div>"
							//emote = inlineReplaceRollVariables(emote, cardParameters);
							emote = replaceVariableContent(emote, cardParameters, false);
						}
					}

					var from = cardParameters.showfromfornonwhispers !== "0" ? msg.who : "";

					cardOutput = removeInlineRolls(cardOutput, cardParameters);
					emote = removeInlineRolls(emote, cardParameters);

					if (cardParameters.hidecard == "0") {
						if (emote !== "") {
							if (cardParameters.whisper == "" || cardParameters.whisper == "0") {
								sendChat(from, "/desc " + emote + " " + cardOutput );
							} else {
								var whispers = cardParameters.whisper.split(",");
								for (var w in whispers) {
									//var WhisperTarget = (whispers[w].trim() == 'self' ? msg.playerid : whispers[w].trim());
									var WhisperTarget = whispers[w].trim();
									if (WhisperTarget == "self") {
										WhisperTarget = getObj("player", msg.playerid).get("displayname");
									}
									sendChat(msg.who, `/w "${WhisperTarget}" ${cardOutput}`);
									//sendChat(msg.who, "/w \"" + WhisperTarget + "\" " + cardOutput );
								}
							}
						} else {
							if (cardParameters.whisper == "" || cardParameters.whisper == "0") {
								sendChat(from, "/desc " + cardOutput );
							} else {
								var whispers = cardParameters.whisper.split(",");
								for (var w in whispers) {
									//var WhisperTarget = (whispers[w].trim() == 'self' ? msg.playerid : whispers[w].trim());
									var WhisperTarget = whispers[w].trim();
									if (WhisperTarget == "self") {
										WhisperTarget = getObj("player", msg.playerid).get("displayname");
									}
									sendChat(msg.who, `/w "${WhisperTarget}" ${cardOutput}`);
									//sendChat(msg.who, "/w " + WhisperTarget + " " + cardOutput );
								}
							}
						}
					}

					if (gmonlyLines.length > 0) {
						sendChat("API", "/w gm " + gmoutput);
					}
				}
			}
		});
	});

	// Breaks the passed text into a series of lines and returns them as an object
	function parseCardContent(content) {
		// Strip off the !pc and the opening {{ and closing }}
		var work = content.substr(content.indexOf("{{") + 2) ;
		work = work.substr(0,work.lastIndexOf("}}") -1);
		work=work.trim();
		work = " " + work;

		// Split into an array on the -- divider
		if (work !== undefined) {
			return work.split("--");
			//return work.split(/\s+--/);
		} else {
			return [];
		}
	}

	function replaceVariableContent(content, cardParameters, rollHilighting) {
		var matchCount = 0;
		var failCount = 0;
		const failLimit = 1000;
		var contentIn = content;
		var charId = "";
		if (content === undefined) { return content }
		while(content.match(/\[(?:[\$|\&|\@|\%|\*])[\w|À-ÖØ-öø-ÿ|\%|\(|\:|\.|\_|\>|\^|\-|\)]*?(?!\w+[\[])(\])/g) !== null) {
			var thisMatch = content.match(/\[(?:[\$|\&|\@|\%|\*])[\w|À-ÖØ-öø-ÿ|\%|\(|\:|\.|\_|\>|\^|\-|\)]*?(?!\w+[\[])(\])/g)[0];
			var replacement = "";
			matchCount++;
			switch (thisMatch.charAt(1)) {
				case "&":
					// Replace a string variable
					var vName = thisMatch.substring(2,thisMatch.length-1);
					if (stringVariables[vName] !== undefined) {
						replacement = stringVariables[vName];
					} else {
						replacement = "";
					}
					if (cardParameters.debug !== "0") {
						log(`ContentIn: ${content} Match: ${thisMatch}, vName: ${vName}, replacement ${replacement}`)
					}
					break;

				case "$":
					// Replace a roll variable
					var vName = thisMatch.match(/(?<=\[\$|\#).*?(?=[\.|\]])/g)[0];
					var vSuffix = "Total";
					if (thisMatch.match(/(?<=\.).*?(?=[\.|\]])/g) !== null) {
						vSuffix = thisMatch.match(/(?<=\.).*?(?=[\.|\]])/g)[0];
					}
					var replacement = "";
					if (rollVariables[vName] !== undefined) {
						replacement = vSuffix == "Raw" ? rollVariables[vName]["Total"] : rollVariables[vName][vSuffix]
					}
					debugOutput(`RollHilighting: ${rollHilighting}, Suffix: ${vSuffix}`);
					if (rollHilighting == true && vSuffix == "Total" && rollVariables[vName] !== undefined) {
						replacement = buildTooltip(replacement, "Roll: " + rollVariables[vName].RollText + "<br /><br />Result: " + rollVariables[vName].Text, rollVariables[vName].Style);
					}
					if (cardParameters.debug !== "0") {
						log(`ContentIn: ${content} Match: ${thisMatch}, vName: ${vName}, vSuffix: ${vSuffix}, replacement ${replacement}`)
					}
					break;

				case "@":
					// Replace Array References
					var vName = thisMatch.match(/(?<=\[\$|\@).*?(?=[\(])/g)[0];
					var vIndex = 0;
					if (thisMatch.match(/(?<=\().*?(?=[)]])/g) !== null) {
						vIndex = parseInt(thisMatch.match(/(?<=\().*?(?=[)]])/g)[0]);
					}
					var replacement = "";
					if (arrayVariables[vName] && arrayVariables[vName].length > vIndex) {
						replacement = arrayVariables[vName][vIndex];
					}
					if (cardParameters.debug !== "0") {
						log(`ContentIn: ${content} Match: ${thisMatch}, vName: ${vName}, vIndex: ${vIndex}, replacement ${replacement}`)
					}
					break;

				case "%":
					// Replace gosub parameter references
					var vName = thisMatch.match(/(?:\[\%)(.*?)(?:\%\])/g)[0];
					vName = vName.substring(2,vName.length-2);
					if (callParamList[vName] !== undefined) {
						replacement = callParamList[vName];
					}
					break;

				case "*":
					// Replace ability references
					var activeCharacter = ""
					if (thisMatch.charAt(2).toLowerCase() == "s") {
						if (cardParameters.sourcetoken !== undefined || cardParameters.sourcecharacter !== undefined) {
							activeCharacter = cardParameters.sourcetoken || cardParameters.sourcecharacter;
						}
					}
					if (thisMatch.charAt(2).toLowerCase() == "t") {
						if (cardParameters.targettoken !== undefined || cardParameters.targetcharacter !== undefined) {
							activeCharacter = cardParameters.targettoken || cardParameters.targetcharacter;
						}
					}
					if (thisMatch.charAt(2) == "-") {
						activeCharacter = thisMatch.substring(2,thisMatch.indexOf(":"));
					}
					if (activeCharacter !== "") {
						var token;
						var attribute = "";
						var attrName = thisMatch.substring(thisMatch.indexOf(":") + 1, thisMatch.length-1);
						var character = getObj("character", activeCharacter);
						if (character === undefined) {
							token = getObj("graphic", activeCharacter);
							if (token !== undefined) {
								character = getObj("character", token.get("represents"));
							}
						}
						if (character !== undefined) {
							charId = character.get("_id");
							var opType = "current";
							if (attrName.endsWith("^")) {
								attrName = attrName.substring(0,attrName.length-1);
								opType = "max";
							}
						}
						if (token !== undefined && attrName.toLowerCase().startsWith("t-") && tokenAttributes.indexOf(attrName.substring(2)) >= 0) {
							attribute = token.get(attrName.substring(2));
						}
						if (character !== undefined &&  (!attrName.toLowerCase().startsWith("t-"))) {
							attribute = getAttrByName(character.id, attrName, opType);
							if (attribute === undefined) {
								attribute = character.get(attrName);
							}
						}
						replacement = attribute;
					}

					if (thisMatch.charAt(2).toLowerCase() == "p") {
						// page attributes
						var attrName = thisMatch.substring(4, thisMatch.length-1);
						replacement = cardParameters.activepageobject.get(attrName) || "";
					}

					if (thisMatch.charAt(2).toLowerCase() == "c") {
						// campaign attributes
						var attrName = thisMatch.substring(4, thisMatch.length-1);
						replacement = Campaign().get(attrName) || "";
					}

					if (thisMatch.charAt(2).toLowerCase() == "r") {
						// Repeating section attributes
						var opType = "";
						var attrName = thisMatch.substring(4,thisMatch.length-1);
						if (attrName.endsWith("^")) {
							attrName = attrName.substring(0, attrName.length - 1);
							opType = "_max";
						}
						var searchText = attrName+opType+"|";
						if (thisMatch.charAt(3) == ":") {
							if (repeatingSectionIDs) {
								for (var i in repeatingSection) {
									if (repeatingSection[i].startsWith(searchText)) {
										replacement = repeatingSection[i].split("|").slice(1,999).join("|");
										charId = repeatingCharID;
									}
								}
							}
						} else {
							replacement = repeatingSectionName + "_" + repeatingSectionIDs[repeatingIndex] + "_" + attrName + opType;
						}
						if (!repeatingSection) { replacement = "NoRepeatingAttributeLoaded" };
						if (repeatingSection && repeatingSection.length <= 1) { replacement = "NoRepeatingAttributeLoaded" };
					}

					break;
			}

			//replacement = replaceSubattributeReferences(replacement, charId);
			content = content.replace(thisMatch, replacement);

			failCount++;
			if (failCount > failLimit) return content;
		}
		return content;
	}

	function replaceSubattributeReferences(content, characterid) {
		var failCount = 100;
		while (content.toString().match(/\@\{.*?\}/g) !== null) {
			var thisMatch = content.match(/\@\{.*?\}/g)[0];
			var replacement = "";
			var attrName = "";
			var theCharacter = getObj("character", characterid);
			if (theCharacter !== undefined) {
				attrName = thisMatch.substring(2,thisMatch.length-1);
				debugOutput(`AttrName: ${attrName}, char: ${theCharacter}, Attr: ${theCharacter.get(attrName)}`);
				replacement = getAttrByName(characterid, attrName);
			}
			debugOutput(`Subattribute: Replacing ${thisMatch} with ${replacement} for char ${theCharacter} attr: ${attrName}`);
			content.replace(thisMatch, replacement);
			failCount++;
			if (failCount > 100) { return content; }
		}
		return content;
	}

	function getLineTag(line,linenum,logerror) {
		if (line.indexOf("|") >= 0) {
			return line.split("|")[0].trim();
		} else {
			if (line.trim() !== "" && logerror) {
				log(`ScriptCards Error: Line ${linenum} is missing a | character. (${line})`);
			}
			return "/Error - No Line Tag Specified";
		}
	}

	function getLineContent(line) {
		if (line.indexOf("|") >= 0) {
			return line.substring(line.indexOf("|")+1).trim();
		} else {
			return "/Error - No Line Content Specified";
		}
	}

	// Take a "Roll Text" string (ie, "1d20 + 5 [Str] + 3 [Prof]") and execute the rolls.
	function parseDiceRoll(rollText, cardParameters) {
		if (cardParameters.disablerollprocessing !== "0") { return content; }
		rollText = replaceVariableContent(rollText, cardParameters, false);
		rollText = removeBRs(rollText);
		rollText = removeTags(rollText);
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
		rollResult.Style = defaultParameters.stylenormal;
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

			// A die specifier in XdXkhXr<>X or XdXklXr<>X format
			if (text.match(/^\d+d\d+k[lh]\d+r[\<\>]\d+$/)) {
				componentHandled = true;
				var count = Number(text.split("d")[0]);
				var sides = Number(text.split("d")[1].split("k")[0]);
				var keepType = text.split("k")[1].substring(0,1);
				var keepCount = Number(text.split("k")[1].substring(1).split("r")[0]);
				var rerolltype = text.split("r")[1].substring(0,1);
				var rerolltexttype = "L";
				if (rerolltype == ">") {rerolltexttype = "G"}
				var rerollThreshold = Number(text.split("r")[1].substring(1));
				var rollSet = [];
				if (rerollThreshold == sides && rerolltype == "<") { rerollThreshold = sides - 1 }
				if (rerollThreshold == 1 && rerolltype == ">" ) { rerollThreshold = 2 }

				if (keepCount > sides) { keepCount = sides; }

				rollResult.Text += `${count}d${sides}k${keepType}${keepCount}r${rerolltexttype}${rerollThreshold} (`;

				for (c=0; c<count; c++) {
					var thisRoll = randomInteger(sides);
					if (rerolltype == "<") {
						while (thisRoll <= rerollThreshold) {
							thisRoll = randomInteger(sides);
						}
					}
					if (rerolltype == ">") {
						while (thisRoll >= rerollThreshold) {
							thisRoll = randomInteger(sides);
						}
					}
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

			// A die specifier in XdXro<X or XdXro>X format (reroll above/below number)
			if (text.match(/^\d+d\d+ro[\<\>]\d+$/)) {
				componentHandled = true;
				var count = Number(text.split("d")[0]);
				var sides = Number(text.split("d")[1].split("ro")[0]);
				var rerolltype = text.split("ro")[1].substring(0,1);
				var rerolltexttype = "L";
				if (rerolltype == ">") {rerolltexttype = "G"}
				var rerollThreshold = Number(text.split("ro")[1].substring(1));
				var rollSet = [];
				var rollTextSet = [];
				if (rerollThreshold == sides && rerolltype == "<") { rerollThreshold = sides - 1 }
				if (rerollThreshold == 1 && rerolltype == ">" ) { rerollThreshold = 2 }
				rollResult.Text += `${count}d${sides}ro${rerolltexttype}${rerollThreshold} (`;

				for (c=0; c<count; c++) {
					var thisRoll = 0;
					var thisRollText = "";

					thisRoll = randomInteger(sides);
					thisRollText = thisRoll.toString();
					if (rerolltexttype == "G" && thisRoll >= rerollThreshold) {
						thisRoll = randomInteger(sides);
						thisRollText += "(" + thisRoll.toString() + ")";
					}

					if (rerolltexttype == "L" && thisRoll <= rerollThreshold) {
						thisRoll = randomInteger(sides);
						thisRollText += "(" + thisRoll.toString() + ")";
					}
					rollSet.push(thisRoll);
					rollTextSet.push(thisRollText);
				}

				for (c=0; c<count; c++) {
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
					rollResult.Text += rollTextSet[c];
					if (c<count-1) { rollResult.Text += "," }
				}
				rollResult.Text += ") ";
			}

			// A die specifier in XdXr<X or XdXr>X format (reroll above/below number)
			if (text.match(/^\d+d\d+r[\<\>]\d+$/)) {
				componentHandled = true;
				var count = Number(text.split("d")[0]);
				var sides = Number(text.split("d")[1].split("r")[0]);
				var rerolltype = text.split("r")[1].substring(0,1);
				var rerolltexttype = "L";
				if (rerolltype == ">") {rerolltexttype = "G"}
				var rerollThreshold = Number(text.split("r")[1].substring(1));
				var rollSet = [];
				if (rerollThreshold == sides && rerolltype == "<") { rerollThreshold = sides - 1 }
				if (rerollThreshold == 1 && rerolltype == ">" ) { rerollThreshold = 2 }
				rollResult.Text += `${count}d${sides}ro${rerolltexttype}${rerollThreshold} (`;

				var thisRoll=-1;

				for (c=0; c<count; c++) {
					if (rerolltype == "<") {
						do {
							thisRoll = randomInteger(sides);
						} while (thisRoll <= rerollThreshold);
					} else {
						do {
							thisRoll = randomInteger(sides);
						} while (thisRoll >= rerollThreshold);
					}
					rollSet.push(thisRoll);
				}

				for (c=0; c<count; c++) {
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
					rollResult.Text += rollSet[c];
					if (c<count-1) { rollResult.Text += "," }
				}
				rollResult.Text += ") ";
			}

			// A die specifier in XdX! or XdX!>X format (exploding dice)
			if (text.match(/^\d+d\d+!([\<\>]\d+)?$/)) {
				componentHandled = true;
				var count = Number(text.split("d")[0]);
				var sides = Number(text.split("d")[1].split("!")[0]);
				var rerollnumber = sides;
				var comptype = "G";
				if (text.split("d")[1].split("!")[1] !== "") {
					comptype = text.split("d")[1].split("!")[1].substring(0,1);
					if (comptype == "<") {
						comptype = "L";
					} else {
						comptype = "G";
					}
					rerollnumber = Number(text.split("d")[1].split("!")[1].substring(1));
				}
				if (comptype == "G" && rerollnumber == 1) { rerollnumber += 1 }
				if (comptype == "L" && rerollnumber == sides) { rerollnumber -= 1 }
				var rollSet = [];
				var rollTextSet = [];
				rollResult.Text += `${count}d${sides}!${comptype}${rerollnumber} (`;
				for (c=0; c<count; c++) {
					var thisRoll = 0;
					var subroll = 0
					var thisRollText = ""

					subroll = randomInteger(sides);
					if (comptype == "G") {
						thisRoll = subroll;
						thisRollText += subroll.toString();
						while (subroll >= rerollnumber) {
							subroll = randomInteger(sides);
							thisRoll += subroll;
							thisRollText += "!" + subroll.toString();
						}
					}

					if (comptype == "L") {
						thisRoll = subroll;
						thisRollText += subroll.toString();
						while (subroll <= rerollnumber) {
							subroll = randomInteger(sides);
							thisRoll += subroll;
							thisRollText += "!" + subroll.toString();
						}
					}
					rollSet.push(thisRoll);
					rollTextSet.push(thisRollText);
				}

				for (c=0; c<count; c++) {
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
					rollResult.Text += rollTextSet[c];
					if (c<count-1) { rollResult.Text += " ," }
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
				rollResult.Text += `${count}d${sides}${op==">"?"G":"L"}${success} (`;
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

			// A mathmatical function
			if (text.match(/^\{.*\}$/)) {
				var operation = text.substring(1, text.length-1);
				switch (operation.toLowerCase()) {
					case "abs":
						rollResult.Total = Math.abs(rollResult.Total);
						rollResult.Text += "{ABS}";
						break;

					case "ceil":
						rollResult.Total = Math.ceil(rollResult.Total);
						rollResult.Text += "{CEIL}";
						break;

					case "floor":
						rollResult.Total = Math.floor(rollResult.Total);
						rollResult.Text += "{FLOOR}";
						break;

					case "round":
						rollResult.Total = Math.round(rollResult.Total);
						rollResult.Text += "{ROUND}";
						break;

					case "negate":
						rollResult.Total = rollResult.Total * -1;
						rollResult.Text += "{NEGATE}";
						break;
				}
			}

			// An operator
			if (text.match(/^[\+\-\*\/\\\%]$/)) {// && !text.match(/^-\d*$/)) {
				componentHandled = true;
				currentOperator = text;
				//rollResult.Text += `${currentOperator} `;
				rollResult.Text += currentOperator == "*" ? "x " : currentOperator + " ";
			}

			// A bare number within parens (just strip them)
			if (text.match(/^\([+-]?(\d*\.)?\d*\)$/)) {
				text = text.substring(1, text.length - 1)
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
				//var thisValue = Number(inlineReplaceRollVariables(thisKey, cardParameters), cardParameters);
				var thisValue = Number(replaceVariableContent(thisKey, cardParameters, false));

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

		if (hadOne && hadAce) { rollResult.Style = cardParameters.styleboth; }
		if (hadOne && !hadAce) { rollResult.Style = cardParameters.stylefumble; }
		if (!hadOne && hadAce) { rollResult.Style = cardParameters.stylecrit; }
		if (cardParameters.nominmaxhighlight !== "0") { rollResult.Style = cardParameters.stylenormal; }
		if (cardParameters.norollhighlight !== "0") { rollResult.Style = cardParameters.stylenone; }

		rollResult.Text = rollResult.Text.replace(/\+ \+/g," + ");
		rollResult.Text = rollResult.Text.replace(/\- \-/g," - ");

		return rollResult;
	}

	function cleanUpRollSpacing(input) {
		input = input.replace(/\+/g, " + ");
		input = input.replace(/\-(?![^[]*?])/g, " - ");
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
		return `<span style='${tooltipStyle}' class='showtip tipsy' title='${tip.toString().replace(/\~/g,"")}'>${text}</span>`;
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
					log(`ScriptCards conditional error: Condition contains an invalid clause joiner on line. Only -and and -or are supported. Assume results are incorrect. ${conditional}`);
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
		//var left = inlineReplaceRollVariables(components[0]).replace(/\"/g,"", cardParameters);
		var left = replaceVariableContent(components[0]).replace(/\"/g,"", cardParameters, false);
		//var right = inlineReplaceRollVariables(components[2]).replace(/\"/g,"", cardParameters);;
		var right = replaceVariableContent(components[2]).replace(/\"/g,"", cardParameters, false);
		if (!isNaN(left)) { left = parseFloat(left); }
		if (!isNaN(right)) { right = parseFloat(right); }

		switch (components[1]) {
			case "-gt": if (left > right) return true; break;
			case "-ge": if (left >= right) return true; break;
			case "-lt": if (left < right) return true; break;
			case "-le": if (left <= right) return true; break;
			case "-eq": if (left == right) return true; break;
			case "-eqi" : if (left.toString().toLowerCase() == right.toString().toLowerCase()) return true; break;
			case "-ne": if (left !== right) return true; break;
			case "-nei" : if (left.toString().toLowerCase() !== right.toString().toLowerCase()) return true; break;
			case "-inc": if (left.toString().toLowerCase().indexOf(right.toString().toLowerCase()) >= 0) return true; break;
			case "-ninc": if (left.toString().toLowerCase().indexOf(right.toString().toLowerCase()) < 0) return true; break;
		}
		return false;
	}

	function replaceStyleInformation(outputLine, cardParmeters) {
		var styleList = [
			"tableborder", "tablebgcolor", "tableborderradius", "tableshadow", "titlecardbackground", "titlecardbottomborder",
			"titlefontsize", "titlefontlineheight", "titlefontcolor", "bodyfontsize", "subtitlefontsize", "subtitlefontcolor", "titlefontshadow",
			"titlefontface", "bodyfontface", "subtitlefontface", "buttonbackground", "buttonbackgroundimage", "buttontextcolor", "buttonbordercolor",
			"dicefontcolor", "dicefontsize", "lineheight", "buttonfontsize", "buttonfontface", "titlecardbackgroundimage", "bodybackgroundimage",
		];

		for (var x=0; x< styleList.length; x++) {
			outputLine = outputLine.replace(new RegExp("!{" + styleList[x] + "}", "g"), cardParmeters[styleList[x]].replace(/\"/g, "'"));
		}
		return outputLine;
	}

	function processInlineFormatting(outputLine, cardParameters) {
		if (cardParameters.disableinlineformatting !== "0") { return outputLine; }
		outputLine = outputLine.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
		//outputLine = outputLine.replace(/\[hr\]/gi, '<table width=100% height=2px><tr><td bgcolor=red></td><font size=xx-small>&nbsp;</font></tr></table>');
		outputLine = outputLine.replace(/\[br\]/gi, "<br />");
		outputLine = outputLine.replace(/\[tr(.*?)\]/gi, "<tr $1>");
		outputLine = outputLine.replace(/\[\/tr\]/gi, "</tr>");
		outputLine = outputLine.replace(/\[td(.*?)\]/gi, "<td $1>");
		outputLine = outputLine.replace(/\[\/td\]/gi, "</td>");
		outputLine = outputLine.replace(/\[t(.*?)\]/gi, "<table $1>");
		outputLine = outputLine.replace(/\[\/t\]/gi, "</table>");
		outputLine = outputLine.replace(/\[p\]/gi, "<p>");
		outputLine = outputLine.replace(/\[\/p\]/gi, "</p>");
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
		var statusmarkers = outputLine.match(/\[sm(.*?)\](.*?)\[\/sm\]/gi);
		for (var sm in statusmarkers) {
			var markername = statusmarkers[sm].substring(statusmarkers[sm].indexOf("]") + 1);
			markername = markername.substring(0,markername.indexOf("["));
			var work = statusmarkers[sm].replace("[sm","<img ").replace("[/sm]","></img>").replace("]", " src=" + tokenMarkerURLs[markername]);
			outputLine = outputLine.replace(statusmarkers[sm], work);
		}
		var buttons = outputLine.match(/\[button\](.*?)\:\:(.*?)\[\/button\]/gi);
		for (var button in buttons) {
			var title = buttons[button].split("::")[0].replace("[button]","").replace("[Button]", "").replace("[BUTTON]","");
			var action = buttons[button].split("::")[1].replace("[/button]","").replace("[/Button]", "").replace("[/BUTTON]","");
			if (cardParameters.dontcheckbuttonsforapi == "0") {
				action = action.replace(/(^|\ +)_/g, " --");
			}
			outputLine = outputLine.replace(buttons[button], makeButton(title,action, cardParameters));
		}

		var sheetbuttons = outputLine.match(/\[sheetbutton\](.*?)\:\:(.*?)\:\:(.*?)\[\/sheetbutton\]/gi);
		for (var button in sheetbuttons) {
			var title = sheetbuttons[button].split("::")[0].replace("[sheetbutton]","").replace("[Sheetbutton]", "").replace("[SHEETBUTTON]","");
			var actor = "";
			var tryID = sheetbuttons[button].split("::")[1];
			if (getObj("character", tryID)) {
				actor = tryID;
			} else {
				if (getObj("graphic", tryID)) {
					if (getObj("character", getObj("graphic", tryID).get("represents"))) {
						actor = getObj("graphic", tryID).get("represents");
					}
				}
			}
			if (actor == "") {
				var possible = findObjs({type: "character"}).filter(function(value, index,arg) { return value.get("name").toLowerCase().trim() == tryID.toLowerCase().trim() });;
				if (possible.length > 0) {
					actor = possible[0].get("_id");
				}
			}
			if (actor !== "") {
				var action = "~" + actor + "|" + sheetbuttons[button].split("::")[2].replace("[/sheetbutton]","").replace("[/Sheetbutton]", "").replace("[/SHEETBUTTON]","");
				if (cardParameters.dontcheckbuttonsforapi == "0") {
					action = action.replace(/(^|\ +)_/g, " --");
				}
				outputLine = outputLine.replace(sheetbuttons[button], makeButton(title,action, cardParameters));
			}
		}

		var reentrantbuttons = outputLine.match(/\[rbutton\](.*?)\:\:(.*?)\[\/rbutton\]/gi);
		for (var button in reentrantbuttons) {
			var title = reentrantbuttons[button].split("::")[0].replace("[rbutton]","").replace("[Rbutton]", "").replace("[RBUTTON]","");
			var reentrylabel = reentrantbuttons[button].split("::")[1].replace("[/rbutton]","").replace("[/Rbutton]", "").replace("[/RBUTTON]","");
			var action = "!sc-reentrant " + cardParameters["reentrant"] + "-|-" + reentrylabel
			outputLine = outputLine.replace(reentrantbuttons[button], makeButton(title,action,cardParameters));
		}

		// [apply]15[/apply]
		// creates buttons:
		// [-15] [-7] [-3] [+15]
		// Requires TokenMod

		/*
		var applybuttons = outputLine.match(/\[applyset\](.*?)\[\/applyset\]/gi);
		for (var button in applybuttons) {
			var buttonParameters = {};
			Object.assign(buttonParameters,cardParameters);
			buttonParameters.buttonbackground = cardParameters.damagebuttonbackgroundcolor;
			buttonParameters.buttonbackgroundimage = cardParameters.damagebuttonbackgroundimage;
			var amount = applybuttons[button].replace(/\[applyset\]/gi,"").replace(/\[\/applyset\]/gi, "");
			var action = `!token-mod --sel --set bar${cardParameters.hpbar}_value|-${amount}!`;
			var theseButtons = makeButton("-" + amount.toString(), action, buttonParameters);
			action = `!token-mod --sel --set bar${cardParameters.hpbar}_value|-${Math.floor(amount * 2)}!`;
			theseButtons +=  " " + makeButton("-" + Math.floor(amount * 2).toString(), action, buttonParameters);
			action = `!token-mod --sel --set bar${cardParameters.hpbar}_value|-${Math.floor(amount / 2)}!`;
			theseButtons +=  " " + makeButton("-" + Math.floor(amount / 2).toString(), action, buttonParameters);
			action = `!token-mod --sel --set bar${cardParameters.hpbar}_value|-${Math.floor(amount / 4)}!`;
			theseButtons +=  " " + makeButton("-" + Math.floor(amount / 4).toString(), action, buttonParameters);
			buttonParameters.buttonbackground = cardParameters.healbuttonbackgroundcolor;
			buttonParameters.buttonbackgroundimage = cardParameters.healbuttonbackgroundimage;
			action = `!token-mod --sel --set bar${cardParameters.hpbar}_value|+${amount}!`;
			theseButtons +=  " " + makeButton("+" + amount.toString(), action, buttonParameters);
			outputLine = outputLine.replace(applybuttons[button], theseButtons);
		}

		var applybuttons = outputLine.match(/\[apply\](.*?)\[\/apply\]/gi);
		for (var button in applybuttons) {
			var buttonParameters = {};
			Object.assign(buttonParameters,cardParameters);
			var amount = applybuttons[button].replace(/\[apply\]/gi,"").replace(/\[\/apply\]/gi, "");
			var mod = "-";
			if (Number(amount) > 0) {
				buttonParameters.buttonbackground = cardParameters.healbuttonbackgroundcolor;
				buttonParameters.buttonbackgroundimage = cardParameters.healbuttonbackgroundimage;
				mod = "+";
			} else {
				buttonParameters.buttonbackground = cardParameters.damagebuttonbackgroundcolor;
				buttonParameters.buttonbackgroundimage = cardParameters.damagebuttonbackgroundimage;
			}
			var action = `!token-mod --sel --set bar${cardParameters.hpbar}_value|${mod}${amount}!`;
			var theseButtons = makeButton(mod + amount.toString(), action, buttonParameters);
			outputLine = outputLine.replace(applybuttons[button], theseButtons);
		}
		*/

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

	function* retrieveAsyncValue(character, value) {
		var thisAttribute = undefined;
		character.get(value, function(val) {thisAttribute = val} )
		while (thisAttribute == undefined) { yield thisAttribute; }
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

	function makeButton(title, url, parameters) {
        return `<a style="${replaceStyleInformation(buttonStyle, parameters)}" href="${removeTags(removeBRs(url))}">${removeTags(removeBRs(title))}</a>`;
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
		var char_attrs = findObjs({type:"attribute", _characterid:charid});
		try {
			var action_prefix = char_attrs
			.filter(function(z) {
				return (z.get("name").startsWith(sectionname) && z.get("name").endsWith(searchtext))
			})
			.filter(entry => entry.get("current") == entryname)[0]
			.get("name").slice(0, -searchtext.length);
		} catch {
			return return_set;
		}

		try {
			action_attrs = char_attrs.filter(function(z) {return (z.get("name").startsWith(action_prefix));})
		} catch {
			return return_set;
		}

		action_attrs.forEach(function (z) {
			if (z.get("name")) {
				return_set.push(z.get("name").toString().replace(action_prefix, "") + "|" + z.get("current").toString().replace(/(?:\r\n|\r|\n)/g, "<br>"));
				return_set.push(z.get("name").toString().replace(action_prefix, "") + "_max|" + z.get("max").toString());
			}
		})

		var PrefixEntry = "xxxActionIDxxxx|" + action_prefix.replace(sectionname+"_","");
		PrefixEntry = PrefixEntry.substring(0,PrefixEntry.length-1);

		return_set.unshift(PrefixEntry);

		return (return_set);
	}

	function getSectionAttrsByID(charid, sectionname, sectionID) {
		var return_set = [];
		var action_prefix = sectionname + "_" + sectionID + "_";

		try {
			var action_attrs = findObjs({type:"attribute", _characterid:charid})
			action_attrs = action_attrs.filter(function(z) {return (z.get("name").startsWith(action_prefix));})
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
					notes = notes.replace(/\<p\>/g, " ").replace(/\<\/p\>/g, " ").replace(/\<br\>/g, " ").replace(/&nbsp;/g," ").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&");
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

	function stashAScript(stashIndex, scriptContent, cardParameters, stringVariables, rollVariables, returnStack, parameterStack, programCounter, outputLines, resultStringName, stashType, arrayVariables, arrayIndexes, gmonlyLines) {
		if (scriptCardsStashedScripts[stashIndex]) { delete scriptCardsStashedScripts[stashIndex]; }

		scriptCardsStashedScripts[stashIndex] = {};
		scriptCardsStashedScripts[stashIndex].scriptContent = JSON.stringify(scriptContent);
		scriptCardsStashedScripts[stashIndex].cardParameters = JSON.stringify(cardParameters);
		scriptCardsStashedScripts[stashIndex].stringVariables = JSON.stringify(stringVariables);
		scriptCardsStashedScripts[stashIndex].rollVariables = JSON.stringify(rollVariables);
		scriptCardsStashedScripts[stashIndex].arrayVariables = JSON.stringify(arrayVariables);
		scriptCardsStashedScripts[stashIndex].arrayIndexes = JSON.stringify(arrayIndexes);
		scriptCardsStashedScripts[stashIndex].returnStack = JSON.stringify(returnStack);
		scriptCardsStashedScripts[stashIndex].parameterStack = JSON.stringify(parameterStack);
		scriptCardsStashedScripts[stashIndex].outputLines = JSON.stringify(outputLines);
		scriptCardsStashedScripts[stashIndex].gmonlyLines = JSON.stringify(gmonlyLines);
		scriptCardsStashedScripts[stashIndex].repeatingSectionIDs = JSON.stringify(repeatingSectionIDs);
		scriptCardsStashedScripts[stashIndex].repeatingSection = JSON.stringify(repeatingSection);
		scriptCardsStashedScripts[stashIndex].repeatingCharAttrs = JSON.stringify(repeatingCharAttrs);
		scriptCardsStashedScripts[stashIndex].repeatingCharID = repeatingCharID;
		scriptCardsStashedScripts[stashIndex].repeatingSectionName = repeatingSectionName;
		scriptCardsStashedScripts[stashIndex].repeatingIndex = repeatingIndex;
		scriptCardsStashedScripts[stashIndex].programCounter = programCounter;
		scriptCardsStashedScripts[stashIndex].resultStringName = resultStringName;
		scriptCardsStashedScripts[stashIndex].stashType = stashType;
	}

	function unstashAScript(stashIndex) {
		if (scriptCardsStashedScripts[stashIndex]) {
			return [
				scriptCardsStashedScripts[stashIndex].scriptContent,
				scriptCardsStashedScripts[stashIndex].cardParameters,
				scriptCardsStashedScripts[stashIndex].stringVariables,
				scriptCardsStashedScripts[stashIndex].rollVariables,
				scriptCardsStashedScripts[stashIndex].returnStack,
				scriptCardsStashedScripts[stashIndex].parameterStack,
				scriptCardsStashedScripts[stashIndex].outputLines,
				scriptCardsStashedScripts[stashIndex].repeatingSectionIDs,
				scriptCardsStashedScripts[stashIndex].repeatingSection,
				scriptCardsStashedScripts[stashIndex].repeatingCharAttrs,
				scriptCardsStashedScripts[stashIndex].repeatingCharID,
				scriptCardsStashedScripts[stashIndex].repeatingSectionName,
				scriptCardsStashedScripts[stashIndex].repeatingIndex,
				scriptCardsStashedScripts[stashIndex].programCounter,
				scriptCardsStashedScripts[stashIndex].resultStringName,
				scriptCardsStashedScripts[stashIndex].stashType
			];
		}
	}

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
		});
	}

	function isNumeric(n) {
		return !isNaN(parseInt(n));
	}

	function decodeGMNotes(notes) {
		return(decodeURIComponent(notes));
	}

	// Despite the name, this function takes a semicolon separated value string and returns an
	// array of objects. Used to parse parameter lists to gosub branches.
	function CSVtoArray(text) {
		var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s\\]*(?:\s+[^;'"\s\\]+)*)\s*(?:;\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s]*(?:\s+[^;'"\s\\]+)*)\s*)*$/;
		var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^;'"\s]*(?:\s+[^;'"\s\\]+)*))\s*(?:;|$)/g;
		// Return NULL if input string is not well formed CSV string.
		if (!re_valid.test(text)) {
			log("ScriptCards Error: Parameter content is not valid. Do you have unescaped quotes or qoutes not surrounding escaped values?")
			return null;
		}

		var a = []; // Initialize array to receive values.
		text.replace(re_value, // "Walk" the string using replace with callback.
			function(m0, m1, m2, m3) {

				// Remove backslash from \' in single quoted values.
				if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));

				// Remove backslash from \" in double quoted values.
				else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
				else if (m3 !== undefined) a.push(m3);
				return ''; // Return empty string.
			});

		// Handle special case of empty last value.
		if (/,\s*$/.test(text)) a.push('');
		return a;
	};

	// ScriptCards doesn't directly support inline rolls, but there are cases where some sheets
	// are so strange that an inline roll is required to retrieve simple values. This routine
	// is run before processing script lines and replaces the inline roll markers with their
	// final values as literal strings.
	function processInlinerolls(msg) {
		if(_.has(msg,'inlinerolls')){
			return _.chain(msg.inlinerolls)
			.reduce(function(m,v,k){
				var ti=_.reduce(v.results.rolls,function(m2,v2){
					if(_.has(v2,'table')){
						m2.push(_.reduce(v2.results,function(m3,v3){
							m3.push(v3.tableItem.name);
							return m3;
						},[]).join(', '));
					}
					return m2;
				},[]).join(', ');
				m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
				return m;
			},{})
			.reduce(function(m,v,k){
				return m.replace(k,v);
			},msg.content)
			.value();
		} else {
			return msg.content;
		}
	}

	function debugOutput(msg) {
		if (debugMode) { log(msg) }
	}

	function isBlank(str) {
		return (!str || /^\s*$/.test(str));
	}

	function removeTags(str) {
		if ((str===null) || (str===''))
			return false;
		else
			return str.toString().replace(/(<([^>]+)>)/ig, '');
	}

	function removeBRs(str) {
		if ((str===null) || (str==='') || (str === undefined))
			return false;
		else
			return str.toString().replace(/<br \/\>/ig, '').replace(/<br\/\>/ig, '');
	}


	return {}
})();

// Meta marker for the end of ScriptCards
{try{throw new Error('');}catch(e){API_Meta.ScriptCards.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.ScriptCards.offset);}}
