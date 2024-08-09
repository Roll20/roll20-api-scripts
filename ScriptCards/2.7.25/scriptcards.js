/* eslint-disable no-undef */
/* eslint-disable no-useless-escape */
/* eslint-disable no-redeclare */
// Github:   https://gist.github.com/kjaegers/515dff0f04c006d7192e0fec534d96bf
// By:       Kurt Jaegers
// Contact:  https://app.roll20.net/users/2365448/kurt-j
if (typeof MarkStart === "function") MarkStart('ScriptCards');
var API_Meta = API_Meta || {};
API_Meta.ScriptCards = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ScriptCards.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 7); } }

var scriptCardsStashedScripts = {};

const ScriptCards = (() => { // eslint-disable-line no-unused-vars
	/*

		ScriptCards implements a run-time scripting language interpreter for the Roll20 system. It contains no system-specific code, and can process scripts
		entered into the chat window, either directly, through cut/paste, or executed from macros, character abilities, etc.
		
		A ScriptCard script consists of one or more lines, each delimited by a double dash (--) starting the line, followed by a statement type identifier.
	
		After the identifier, is a line tag, followed by a vertical bar (|) character, followed by the line content. The scripting language supports 
		end-inclusion of function libraries with the +++libname+++ directive, which will be pre-parsed and removed from the script. Any number of libraries 
		can be specified by separating library names (case sensitive) with semicolons (;). 
	
		Please see the ScriptCards Wiki Entry on Roll20 at https://wiki.roll20.net/Script:ScriptCards for details.
	*/

	const APINAME = "ScriptCards";
	const APIVERSION = "2.7.25a";
	const NUMERIC_VERSION = "207251"
	const APIAUTHOR = "Kurt Jaegers";
	const debugMode = false;

	const parameterAliases = {
		"tablebackgroundcolor": "tablebgcolor",
		"titlecardbackgroundcolor": "titlecardbackground",
		"nominmaxhilight": "nominmaxhighlight",
		"norollhilight": "norollhilight",
		"buttonbackgroundcolor": "buttonbackground",
		"concatentioncharacter": "concatenationcharacter",
		"reentry": "reentrant"
	}

	var lastExecutedByID;
	var lastExecutedDisplayName;

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
		titlefontweight: "strong",
		titlefontstyle: "normal",
		titlefontshadow: "-1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000;",
		lineheight: "normal",
		rollhilightlineheight: "1.0em",
		rollhilightcolornormal: "#FFFEA2",
		rollhilightcolorcrit: "#88CC88",
		rollhilightcolorfumble: "#FFAAAA",
		rollhilightcolorboth: "#8FA4D4",
		titlefontcolor: "#FFFFFF",
		subtitlefontsize: "13px",
		subtitlefontface: "Tahoma",
		subtitlefontcolor: "#FFFFFF",
		subtitleseparator: " &" + "#x2666; ",
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
		emotesourcetokensize: "50",
		emotetargettokensize: "50",
		emotesourcetokenoverride: "0",
		emotetargettokenoverride: "0",
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
		buttonpadding: "5px",
		parameterdelimiter: ";",
		concatenationcharacter: "+",
		formatoutputforobjectmodification: "0",
		dicefontcolor: "#1C6EA4",
		dicefontsize: "3.0em",
		usehollowdice: "0",
		allowplaintextinrolls: "0",
		showfromfornonwhispers: "0",
		allowinlinerollsinoutput: "0",
		nominmaxhighlight: "0",
		norollhighlight: "0",
		disablestringexpansion: "0",
		disablerollvariableexpansion: "0",
		disableparameterexpansion: "0",
		disablerollprocessing: "0",
		disableattributereplacement: "0",
		attemptattributeparsing: "0",
		disableinlineformatting: "0",
		executionlimit: "40000",
		inlineconditionseparator: "|",
		deferralcharacter: "^",
		locale: "en-US", //apparently not supported by Roll20's Javascript implementation...
		timezone: "America/New_York",
		hpbar: "3",
		outputtagprefix: "",
		outputcontentprefix: " ",
		enableattributesubstitution: "0",
		formatinforequesttext: "0",
		overridetemplate: "none",
		explodingonesandaces: "0",
		functionbenchmarking: "0",
		gmoutputtarget: "gm",
		storagecharid: "",
		styleTableTag: " border-collapse:separate; border: solid black 2px; border-radius: 6px; -moz-border-radius: 6px; ",
		stylenone: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: !{rollhilightlineheight}; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; ",
		stylenormal: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: !{rollhilightlineheight}; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: !{rollhilightcolornormal}; border-color: #87850A; color: #000000;",
		stylefumble: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: !{rollhilightlineheight}; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: !{rollhilightcolorfumble}; border-color: #660000; color: #660000;",
		stylecrit: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: !{rollhilightlineheight}; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: !{rollhilightcolorcrit}; border-color: #004400; color: #004400;",
		styleboth: " text-align: center; font-size: 100%; display: inline-block; font-weight: bold; height: !{rollhilightlineheight}; min-width: 1.75em; margin-top: -1px; margin-bottom: 1px; padding: 0px 2px; border: 1px solid; border-radius: 3px; background-color: !{rollhilightcolorboth}; border-color: #061539; color: #061539;",

		// These settings can be used freely and are stored with the format storage commands
		usersetting0: "",
		usersetting1: "",
		usersetting2: "",
		usersetting3: "",
		usersetting4: "",
		usersetting5: "",
		usersetting6: "",
		usersetting7: "",
		usersetting8: "",
		usersetting9: "",
	};

	const SettingsThatAreColors = [
		"tablebgcolor",
		"titlecardbackground",
		"rollhilightcolornormal",
		"rollhilightcolorcrit",
		"rollhilightcolorfumble",
		"rollhilightcolorboth",
		"titlefontcolor",
		"subtitlefontcolor",
		"oddrowbackground",
		"evenrowbackground",
		"oddrowfontcolor",
		"evenrowfontcolor",
		"emotebackground",
		"buttonbackground",
		"buttonbordercolor",
		"dicefontcolor"
	];

	const SettingsThatAreNumbers = [
		"emotesourcetokensize",
		"emotetargettokensize"
	]

	const TokenAttrsThatAreNumbers = [
		"left", "top", "width", "height", "rotation"
	]

	const EncodingReplaements = [
		"%5B:[",
		"%5D:]",
		"%7B:{",
		"%7C:|",
		"%7D:}",
		"%20: ",
		"%21:!",
		'%22:"',
		"%23:#",
		"%24:$",
		"%25:%",
		"%26:&",
		"%27:'",
		"%28,(",
		"%29,)",
		"%2A:*",
		"%2B:+",
		"%2C:,",
		"%2D:-",
		"%2E:.",
		"%2F:/",
		"%3C:<",
		"%3D:=",
		"%3E:>",
	]

	//---------------------------------------------------------------------------------------
	// Handles registering token change events for other api scripts
	//---------------------------------------------------------------------------------------
	let observers = {
		tokenChange: []
	};

	const observeTokenChange = function (handler) {
		if (handler && _.isFunction(handler)) {
			observers.tokenChange.push(handler);
		}
	};

	const notifyObservers = function (event, obj, prev) {
		_.each(observers[event], function (handler) {
			try {
				handler(obj, prev);
			} catch (e) {
				log(`ScriptCards: An observer threw and exception in handler: ${handler}`);
			}
		});
	};
	//---------------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------------------
	// "borrowed" from token-mod to force lighting updates after modifying tokens
	//---------------------------------------------------------------------------------------

	const getActivePages = () => [...new Set([
		Campaign().get('playerpageid'),
		...Object.values(Campaign().get('playerspecificpages')),
		...findObjs({
			type: 'player',
			online: true
		})
			.filter((p) => playerIsGM(p.id))
			.map((p) => p.get('lastpage'))
	])
	];

	const forceLightUpdateOnPage = (() => {
		const forPage = (pid) => (getObj('page', pid) || { set: () => { } }).set('force_lighting_refresh', true);
		let pids = new Set();
		let t;

		return (pid) => {
			pids.add(pid);
			clearTimeout(t);
			t = setTimeout(() => {
				let activePages = getActivePages();
				[...pids].filter(p => activePages.includes(p)).forEach(forPage);
				pids.clear();
			}, 100);
		};
	})();

	// HTML Templates for the various pieces of the output card. Replaced sections are marked with
	// !{...} syntax, and will have values substituted in them when the output line is built.
	var htmlTemplate = `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 100%; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow};"><div style="display: table-header-group; background-color: !{titlecardbackground}; background-image: !{titlecardbackgroundimage}; border-bottom: !{titlecardbottomborder}"><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="font-family: !{titlefontface}; font-style:!{titlefontstyle}; font-size: !{titlefontsize}; line-height: !{titlefontlineheight}; font-weight: !{titlefontweight}; color: !{titlefontcolor}; text-shadow: !{titlefontshadow}">=X=TITLE=X=</span><br /><span style="font-family: !{subtitlefontface}; font-variant: normal; font-size: !{subtitlefontsize}; font-style:normal; font-weight: bold; color: !{subtitlefontcolor}; ">=X=SUBTITLE=X=</span></div></div></div><div style="display: table-row-group; background-image:!{bodybackgroundimage};">`;
	var htmlTemplateHiddenTitle = `<div style="display: table; border: !{tableborder}; background-color: !{tablebgcolor}; width: 100%; text-align: left; border-radius: !{tableborderradius}; border-collapse: separate; box-shadow: !{tableshadow};"><div style="display: table-row-group; background-image:!{bodybackgroundimage};">`;
	var htmlRowTemplate = `<div style="display: table-row; =X=ROWBG=X=;"><div style="display: table-cell; padding: 0px 0px; font-family: !{bodyfontface}; font-style: normal; font-weight:normal; font-size: !{bodyfontsize}; "><span style="line-height: !{lineheight}; color: =X=FONTCOLOR=X=;">=X=ROWDATA=X=</span></div></div>`;
	var htmlTemplateEnd = `</div></div><br />`;
	var buttonStyle = 'background-color:!{buttonbackground}; padding:!{buttonpadding}; background-image:!{buttonbackgroundimage}; color: !{buttontextcolor}; text-align: center; vertical-align:middle; border-radius: 5px; border-color:!{buttonbordercolor}; font-family: !{buttonfontface}; font-size:!{buttonfontsize};';
	var gradientStyle = "linear-gradient(rgba(255, 255, 255, .3), rgba(255, 255, 255, 0))";

	// Objects to hold various variables and things we could need while running a script.
	var stringVariables = {};
	var rollVariables = {};
	var arrayVariables = {};
	var arrayIndexes = {};
	var hashTables = {};
	var tokenMarkerURLs = [];
	var templates = {};
	var benchmarks = {};

	//We use several variables to track repeating section (--R) commands
	var repeatingSection = undefined;
	var repeatingSectionIDs = undefined;
	var repeatingIndex = undefined;
	var repeatingCharID = undefined;
	var repeatingCharAttrs = undefined;
	var repeatingSectionName = undefined;
	var triggerCharID = undefined;
	var storageCharID = undefined;
	var bioCharID = undefined;
	var repeatScriptCard = false;

	// Store labels and their corresponding line numbers for branching
	var lineLabels = {};
	var labelChecking = {};

	// The returnStack stores the line number to return to after a gosub, while the parameter stack stores parameter lists for nested gosubs
	var returnStack = [];
	var parameterStack = [];
	var tableLineCounter = 0;

	// Builds up a list of lines that will appear on the output display
	var outputLines = [];
	var bareoutputLines = [];
	var gmonlyLines = [];
	var lineCounter = 1;
	var lastBlockAction = "";
	var blockDepth = 0;

	// Storage for any Library handouts found in the game
	var ScriptCardsLibrary = {};

	// The Dice Fonts in Roll20 use these letters to represent the characters that display
	// the dice value (J=0, A=1, B=2, etc) To get the appropriate letter to display, we can
	// just the substring numeric position in this string to find the matching letter.
	const diceLetters = "JABCDEFGHIJKLMNOPQRSTUVWYZ";

	// Used for storing parameters passed to a subroutine with --> or --?|> lines
	var callParamList = {};

	on('ready', function () {
		// if ScriptCards has never been run in this game, create state information to store
		// configuration and values between sessions/sandbox instances.
		if (!state[APINAME]) { state[APINAME] = { module: APINAME, schemaVersion: APIVERSION, config: {}, persistentVariables: {} }; }
		if (state[APINAME].storedVariables == undefined) { state[APINAME].storedVariables = {}; }
		if (state[APINAME].storedSettings == undefined) { state[APINAME].storedSettings = {}; }
		if (state[APINAME].storedStrings == undefined) { state[APINAME].storedStrings = {}; }
		if (state[APINAME].storedSnippets == undefined) { state[APINAME].storedSnippets = {}; }
		if (state[APINAME].triggersenabled == undefined) { state[APINAME].triggersenabled = true; }
		if (state[APINAME].playerscandelete == undefined) { state[APINAME].playerscandelete = false; }

		reload_template_mule();

		if (state[APINAME].triggersenabled) {

			var findBioMule = findObjs({ _type: "character", name: "ScriptCards_BioMule" })[0];
			if (findBioMule) { bioCharID = findBioMule.id; log(`ScriptCards Bio Mule Active. BioMule Character ID is ${bioCharID}`) }

			var findTriggerChar = findObjs({ _type: "character", name: "ScriptCards_Triggers" })[0];
			if (findTriggerChar) {
				triggerCharID = findTriggerChar.id;
				log(`ScriptCards Triggers Active. Trigger Character ID is ${triggerCharID}`);
				on('change:campaign:playerpageid', function (obj, prev) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "change:campaign:playerpageid" });
					if (Array.isArray(ability) && ability.length > 0) {
						var replacement = ` --&PreviousPageID|${prev.playerpageid} --&NewPageID|${obj.get("playerpageid")} `;
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('change:campaign:turnorder', function () { onChangeCampaignTurnorder(triggerCharID) });

				on('change:attribute', function (obj, prev) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: `change:attribute:${prev.name}` });
					if (Array.isArray(ability) && ability.length > 0) {
						var replacement = "";
						for (const property in prev) {
							//replacement += ` --&AttributeOld${property}|${prev[property]} --&AttributeNew${property}|${obj.get(property)}`
							replacement += ` ${getSafeTriggerString("AttributeOld" + property, prev[property])} ${getSafeTriggerString("AttributeNew" + property, obj.get(property))} `
						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('change:graphic', function (obj, prev) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: `change:graphic` });
					if (Array.isArray(ability) && ability.length > 0) {
						var replacement = "";
						for (const property in prev) {
							//replacement += ` --&GraphicOld${property}|${prev[property]} --&GraphicNew${property}|${obj.get(property)}`
							replacement += ` ${getSafeTriggerString("GraphicOld" + property, prev[property])} ${getSafeTriggerString("GraphicNew" + property, obj.get(property))} `
						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('change:door', function (obj, prev) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: `change:door` });
					if (Array.isArray(ability) && ability.length > 0) {
						var replacement = "";
						for (const property in prev) {
							//replacement += ` --&DoorOld${property}|${prev[property]} --&DoorNew${property}|${obj.get(property)}`
							replacement += ` ${getSafeTriggerString("DoorOld" + property, prev[property])} ${getSafeTriggerString("DoorNew" + property, obj.get(property))} `
						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('change:page', function (obj, prev) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: `change:page` });
					if (Array.isArray(ability) && ability.length > 0) {
						var replacement = "";
						for (const property in prev) {
							//replacement += ` --&PageOld${property}|${prev[property]} --&PageNew${property}|${obj.get(property)}`
							replacement += ` ${getSafeTriggerString("PageOld" + property, prev[property])} ${getSafeTriggerString("PageNew" + property, obj.get(property))} `

						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('change:character', function (obj, prev) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: `change:character` });
					if (Array.isArray(ability) && ability.length > 0) {
						//var replacement = ` --&CharChanged|${obj.id}} `;
						var replacement = getSafeTriggerString("CharChanged", obj.id);
						for (const property in prev) {
							//replacement += ` --&CharOld${property}|${prev[property]} --&CharNew${property}|${obj.get(property)}`
							replacement += ` ${getSafeTriggerString("CharOld" + property, prev[property])} ${getSafeTriggerString("CharNew" + property, obj.get(property))} `
							replacement += ` ${getSafeTriggerString("CharacterOld" + property, prev[property])} ${getSafeTriggerString("CharacterNew" + property, obj.get(property))} `
						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('add:attribute', function (obj) {
					var ability = findObjs({ type: "attribute", _characterid: triggerCharID, name: "add:attribute" });
					if (Array.isArray(ability) && ability.length > 0) {
						for (let ab = 0; ab < ability.length; ab++) {
							setTimeout(() => {
								//var replacement = ` --&AttributeAdded|${obj.id}} `;
								var replacement = ` ${getSafeTriggerString("AttributeAdded", obj.id)} `
								var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
								sendChat("API", metacard);
							}
								, 500);
						}
					}
				})
				on('add:page', function (obj) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "add:page" });
					if (Array.isArray(ability) && ability.length > 0) {
						for (let ab = 0; ab < ability.length; ab++) {
							setTimeout(() => {
								//var replacement = ` --&PageAdded|${obj.id}} `;
								var replacement = ` ${getSafeTriggerString("PageAdded", obj.id)} `
								var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
								sendChat("API", metacard);
							}
								, 500);
						}
					}
				})
				on('add:character', function (obj) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "add:character" });
					if (Array.isArray(ability) && ability.length > 0) {
						for (let ab = 0; ab < ability.length; ab++) {
							setTimeout(() => {
								//var replacement = ` --&CharAdded|${obj.id}} `;
								var replacement = ` ${getSafeTriggerString("CharAdded", obj.id)} `
								var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
								sendChat("API", metacard);
							}
								, 500);
						}
					}
				})
				on('destroy:page', function (obj) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "destroy:page" });
					if (Array.isArray(ability) && ability.length > 0) {
						const copy = Object.assign({}, obj);
						var replacement = "";
						for (const property in copy.attributes) {
							try {
								replacement += ` ${getSafeTriggerString("PageRemoved" + property, copy.attributes[property])} `
							} catch (e) {
								//do nothing 
							}
						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				on('add:graphic', function (obj) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "add:graphic" });
					if (Array.isArray(ability) && ability.length > 0) {
						for (let ab = 0; ab < ability.length; ab++) {
							setTimeout(() => {
								//var replacement = ` --&GraphicAdded|${obj.id} `;
								var replacement = ` ${getSafeTriggerString("GraphicAdded", obj.id)} `
								var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
								sendChat("API", metacard);
							}
								, 500);
						}
					}
				})
				on('destroy:graphic', function (obj) {
					try {
						var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "destroy:graphic" });
						if (Array.isArray(ability) && ability.length > 0) {
							const copy = Object.assign({}, obj);
							var replacement = "";
							for (const property in copy.attributes) {
								try {
									replacement += ` ${getSafeTriggerString("GraphicRemoved" + property, copy.attributes[property])} `
								} catch (e) {
									//do nothing 
								}
							}
							for (let ab = 0; ab < ability.length; ab++) {
								var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
								sendChat("API", metacard);
							}
						}
					} catch (e) { log(`Error: ${e}`) }
				})
				on('add:door', function (obj) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "add:door" });
					if (Array.isArray(ability) && ability.length > 0) {
						for (let ab = 0; ab < ability.length; ab++) {
							setTimeout(() => {
								//var replacement = ` --&DoorAdded|${obj.id}} `;
								var replacement = ` ${getSafeTriggerString("DoorAdded", obj.id)} `
								var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
								sendChat("API", metacard);
							}
								, 500);
						}
					}
				})
				on('destroy:door', function (obj) {
					var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "destroy:door" });
					if (Array.isArray(ability) && ability.length > 0) {
						const copy = Object.assign({}, obj);
						var replacement = "";
						for (const property in copy.attributes) {
							try {
								replacement += ` ${getSafeTriggerString("DoorRemoved" + property, copy.attributes[property])} `
							} catch (e) {
								//do nothing 
							}
						}
						for (let ab = 0; ab < ability.length; ab++) {
							var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
							sendChat("API", metacard);
						}
					}
				})
				setTimeout(function () {
					var attrib = findObjs({ type: "attribute", _characterid: triggerCharID, name: `listen_to_tokenmod` });
					if (attrib && attrib[0] && attrib[0].get("current") == "1") {
						if ('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange) {
							TokenMod.ObserveTokenChange(function (obj, prev) {
								var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: `change:graphic` });
								if (Array.isArray(ability) && ability.length > 0) {
									var replacement = "";
									for (const property in prev) {
										replacement += ` --&GraphicOld${property}|${prev[property]} --&GraphicNew${property}|${obj.get(property)}`
									}
									var metacard = ability[0].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
									sendChat("API", metacard);
								}
							});
							log('ScriptCards: Triggers character exists, so registered with TokenMod to observe token changes.');
						}
					}
				}, 1);
			} else {
				log(`ScriptCards Triggers could not find character named "ScriptCards_Triggers"`);
			}
		}

		var findStorageChar = findObjs({ _type: "character", name: "ScriptCards_Storage" })[0];
		if (findStorageChar) { storageCharID = findStorageChar.id; log(`ScriptCards Storage character: ${storageCharID} `) }

		// Retrieve the list of token/status markers from the Campaign and create an associative
		// array that links the marker name to the URL of the marker image for use in the
		// [sm]...[/sm] inline formatting syntax. This allows us to fully support custom token
		// marker sets.
		const tokenMarkers = JSON.parse(Campaign().get("token_markers"));
		for (let x = 0; x < tokenMarkers.length; x++) {
			tokenMarkerURLs[tokenMarkers[x].name] = tokenMarkers[x].url;
		}

		// Cache any library handouts
		loadLibraryHandounts();

		API_Meta.ScriptCards.version = APIVERSION;

		// Log that the script is "ready". We also include the meta offset which can be used
		// to track sandbox crash errors by subtracting the offset from the line number that the
		// sandbox reports to contain the error.
		log(`-=> ${APINAME} - ${APIVERSION} by ${APIAUTHOR} Ready <=- Meta Offset : ${API_Meta.ScriptCards.offset}`);
		if (APIVERSION.endsWith("experimental")) {
			log(`-=> NOTE: This is an experimental version of ScriptCards and is not recommended for widespread use at this time. <=-`);
		}

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
				var apiCmdText = msg.content.toLowerCase().trim();
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
							metaCard += `--+${key}|[r][button]Show::!sc-liststoredsettings ${key}[/button] [button]Delete::!sc-deletestoredsettings ${key}[/button][/r]`;
						}
					} else {
						var settingName = msg.content.substring(msg.content.indexOf(" ")).trim();
						if (settingName) {
							metaCard += `--#leftsub|Setting List --#rightsub|${settingName} `;
							var stored = state[APINAME].storedSettings[settingName];
							for (const key in stored) {
								if (stored[key] !== defaultParameters[key]) {
									metaCard += `--+${key}|${stored[key]} [r][button]Edit::!sc-editstoredsetting ${settingName}|${key}|?{New Value|${stored[key]}}[/button] [button]Delete::!sc-deleteindividualstoredsetting ${settingName}|${key}[/button][/r]`;
								}
							}
							metaCard += `--+|[c][button]Add Setting::!sc-addstoredsetting ${settingName}|?{Setting Name?}|?{Setting Value?}[/button][/c]`
						}
					}
					metaCard += " }};"
					sendChat("API", metaCard);
				}

				if (apiCmdText.startsWith("!sc-reloadtemplates")) {
					reload_template_mule();
					sendChat("ScriptCards", `/w ${msg.who} Templates mule reloaded. ${Object.keys(templates).length} defined templates.`)
				}

				if (apiCmdText.startsWith("!sc-deletestoredsettings ")) {
					var settingName = msg.content.substring(msg.content.indexOf(" ")).trim();
					if (state[APINAME].storedSettings[settingName]) {
						delete state[APINAME].storedSettings[settingName];
						metaCard = `!scriptcard {{ --#title|Remove Stored Setting --#leftsub|${settingName} --+|The setting group ${settingName} has been deleted. }} `;
						sendChat("API", metaCard);
					} else {
						metaCard = `!scriptcard {{ --#title|Remove Stored Setting --#leftsub|${settingName} --+|No stored settings group named ${settingName} was found. }} `;
						sendChat("API", metaCard);
					}
				}

				if (apiCmdText.startsWith("!sc-deleteindividualstoredsetting ")) {
					try {
						var settingSet = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[0];
						var settingName = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[1];

						if (state[APINAME].storedSettings[settingSet] && state[APINAME].storedSettings[settingSet][settingName]) {
							delete state[APINAME].storedSettings[settingSet][settingName];
							metaCard = `!scriptcard {{ --#title|Remove Stored Setting --#leftsub|${settingSet} --#rightsub|${settingName} --+|The setting ${settingName} has been deleted from the stored setting set ${settingSet}. }} `;
							sendChat("API", metaCard);
						} else {
							metaCard = `!scriptcard {{ --#title|Remove Stored Setting --#leftsub|${settingName} --#rightsub|${settingName} --+|No stored setting named ${settingName} found in group ${settingSet}. }} `;
							sendChat("API", metaCard);
						}
					} catch { log(`An error occured processing deleteindividualstoredsetting request for ${msg.content}`) }
				}

				if (apiCmdText.startsWith("!sc-editstoredsetting ")) {
					try {
						var settingSet = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[0];
						var settingName = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[1];
						var newValue = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[2];

						if (state[APINAME].storedSettings[settingSet] && state[APINAME].storedSettings[settingSet][settingName]) {
							state[APINAME].storedSettings[settingSet][settingName] = newValue;
							metaCard = `!scriptcard {{ --#title|Edit Stored Setting --#leftsub|${settingSet} --#rightsub|${settingName} --+|The setting ${settingName} in set ${settingSet} has been updated to ${newValue}. }} `;
							sendChat("API", metaCard);
						} else {
							metaCard = `!scriptcard {{ --#title|Remove Stored Setting --#leftsub|${settingName} --#rightsub|${settingName} --+|No stored setting named ${settingName} found in group ${settingSet}. }} `;
							sendChat("API", metaCard);
						}
					} catch { log(`An error occured processing editstoredsetting request for ${msg.content}`) }
				}

				if (apiCmdText.startsWith("!sc-addstoredsetting ")) {
					try {
						var settingSet = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[0];
						var settingName = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[1];
						var newValue = msg.content.substring(msg.content.indexOf(" ")).trim().split("|")[2];

						if (state[APINAME].storedSettings[settingSet] && !(state[APINAME].storedSettings[settingSet][settingName])) {
							state[APINAME].storedSettings[settingSet][settingName] = newValue;
							metaCard = `!scriptcard {{ --#title|Add Stored Setting --#leftsub|${settingSet} --#rightsub|${settingName} --+|The setting ${settingName} in set ${settingSet} has been updated to ${newValue}. }} `;
							sendChat("API", metaCard);
						} else {
							metaCard = `!scriptcard {{ --#title|Add Stored Setting --#leftsub|${settingName} --#rightsub|${settingName} --+|Either ${settingSet} group does not exist, or a setting named ${settingName} is already defined in the group. }} `;
							sendChat("API", metaCard);
						}
					} catch { log(`An error occured processing addstoredsetting request for ${msg.content}`) }
				}

				if (apiCmdText.startsWith("!sc-purgestoredsettings")) {
					delete state[APINAME].storedSettings
					state[APINAME].storedSettings = {}
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

				if (apiCmdText.startsWith("!sc-purgestachedscripts")) {
					scriptCardsStashedScripts = {};
				}

				if (apiCmdText.startsWith("!scriptcards ")) { processThisAPI = true; }
				if (apiCmdText.startsWith("!scriptcard ")) { processThisAPI = true; }
				if (apiCmdText.startsWith("!script ")) { processThisAPI = true; }
				if (apiCmdText.startsWith("!scriptcards{{")) { processThisAPI = true; }
				if (apiCmdText.startsWith("!scriptcard{{")) { processThisAPI = true; }
				if (apiCmdText.startsWith("!script{{")) { processThisAPI = true; }
				if (processThisAPI) {
					var cardParameters = {};
					Object.assign(cardParameters, defaultParameters);
					if (storageCharID) {
						cardParameters.storagecharid = storageCharID
					}
					if (state[APINAME].storedSettings["Default"] != null) {
						newSettings = state[APINAME].storedSettings["Default"];
						for (var key in newSettings) {
							cardParameters[key] = newSettings[key];
						}
					}
					msg.content = processInlinerolls(msg);

					scriptStartTimestamp = Date.now();

					outputLines = [];
					bareoutputLines = [];
					gmonlyLines = [];
					lineCounter = 1;

					// Store labels and their corresponding line numbers for branching
					lineLabels = {};
					labelChecking = {};

					benchmarks = {};

					// The returnStack stores the line number to return to after a gosub, while the parameter stack stores parameter lists for nexted gosubs
					returnStack = [];
					parameterStack = [];
					tableLineCounter = 0;

					// Clear out any pre-existing roll variables
					rollVariables = {};
					stringVariables = {};
					arrayVariables = {};
					arrayIndexes = {};
					hashTables = {};

					loopControl = {};
					loopStack = [];

					scriptData = [];
					saveScriptData = [];
					lastBlockAction = "";
					executionCounter = 0;

					stringVariables["ScriptCards_Version"] = APIVERSION;
					stringVariables["SC_VERSION_NUMERIC"] = NUMERIC_VERSION

					if (msg.playerid) {
						var sendingPlayer = getObj("player", msg.playerid);
						if (sendingPlayer) {
							stringVariables["SendingPlayerID"] = msg.playerid;
							stringVariables["OriginalSendingPlayerID"] = msg.playerid;
							lastExecutedByID = msg.playerid;
							stringVariables["SendingPlayerName"] = sendingPlayer.get("_displayname");
							stringVariables["OriginalSendingPlayerName"] = sendingPlayer.get("_displayname");
							lastExecutedDisplayName = sendingPlayer.get("_displayname");
							stringVariables["SendingPlayerColor"] = sendingPlayer.get("color");
							stringVariables["OriginalSendingPlayerColor"] = sendingPlayer.get("color");
							stringVariables["SendingPlayerSpeakingAs"] = sendingPlayer.get("speakingas");
							stringVariables["OriginalSendingPlayerSpeakingAs"] = sendingPlayer.get("speakingas");
							stringVariables["SendingPlayerIsGM"] = playerIsGM(msg.playerid) ? "1" : "0";
							stringVariables["OriginalSendingPlayerIsGM"] = playerIsGM(msg.playerid) ? "1" : "0";
						}
					}

					if (msg.selected) {
						arrayVariables["SC_SelectedTokens"] = [];
						for (let x = 0; x < msg.selected.length; x++) {
							arrayVariables["SC_SelectedTokens"].push(msg.selected[x]._id);
							arrayIndexes["SC_SelectedTokens"] = 0;
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
						if (scriptCardsStashedScripts[stashIndex].hashTables) { hashTables = JSON.parse(scriptCardsStashedScripts[stashIndex].hashTables); }
						if (scriptCardsStashedScripts[stashIndex].returnStack) { returnStack = JSON.parse(scriptCardsStashedScripts[stashIndex].returnStack); }
						if (scriptCardsStashedScripts[stashIndex].parameterStack) { parameterStack = JSON.parse(scriptCardsStashedScripts[stashIndex].parameterStack); }
						if (scriptCardsStashedScripts[stashIndex].outputLines) { outputLines = JSON.parse(scriptCardsStashedScripts[stashIndex].outputLines); }
						if (scriptCardsStashedScripts[stashIndex].bareoutputLines) { bareoutputLines = JSON.parse(scriptCardsStashedScripts[stashIndex].bareoutputLines); }
						if (scriptCardsStashedScripts[stashIndex].gmonlyLines) { gmonlyLines = JSON.parse(scriptCardsStashedScripts[stashIndex].gmonlyLines); }
						if (scriptCardsStashedScripts[stashIndex].repeatingSectionIDs) { repeatingSectionIDs = JSON.parse(scriptCardsStashedScripts[stashIndex].repeatingSectionIDs); }
						if (scriptCardsStashedScripts[stashIndex].repeatingSection) { repeatingSection = JSON.parse(scriptCardsStashedScripts[stashIndex].repeatingSection); }
						if (scriptCardsStashedScripts[stashIndex].repeatingCharAttrs) { repeatingCharAttrs = JSON.parse(scriptCardsStashedScripts[stashIndex].repeatingCharAttrs); }
						if (scriptCardsStashedScripts[stashIndex].loopControl) { loopControl = scriptCardsStashedScripts[stashIndex].loopControl; }
						if (scriptCardsStashedScripts[stashIndex].loopStack) { loopStack = scriptCardsStashedScripts[stashIndex].loopStack; }
						//if (scriptCardsStashedScripts[stashIndex].loopCounter) {loopCounter = scriptCardsStashedScripts[stashIndex].loopCounter; }
						repeatingCharID = scriptCardsStashedScripts[stashIndex].repeatingCharID;
						repeatingSectionName = scriptCardsStashedScripts[stashIndex].repeatingSectionName;
						repeatingIndex = scriptCardsStashedScripts[stashIndex].repeatingIndex;
						lineCounter = scriptCardsStashedScripts[stashIndex].programCounter;

						if (cardParameters.sourcetoken) {
							var charLookup = getObj("graphic", cardParameters.sourcetoken);
							if (charLookup != null && charLookup.get("represents") !== "") {
								cardParameters.sourcecharacter = getObj("character", charLookup.get("represents"));
							} else {
								cardParameters.sourcecharacter = undefined;
							}
						}

						if (cardParameters.targettoken) {
							var charLookup = getObj("graphic", cardParameters.targettoken);
							if (charLookup != null && charLookup.get("represents") !== "") {
								cardParameters.targetcharacter = getObj("character", charLookup.get("represents"));
							} else {
								cardParameters.targetcharacter = undefined;
							}
						}

						if (msg.selected) {
							arrayVariables["SC_SelectedTokens"] = [];
							for (let x = 0; x < msg.selected.length; x++) {
								arrayVariables["SC_SelectedTokens"].push(msg.selected[x]._id);
								arrayIndexes["SC_SelectedTokens"] = 0;
							}
						}

						if (!isReentrant) {
							for (var x = 1; x < resumeArgs.length; x++) {
								var thisInfo = resumeArgs[x].split(cardParameters.parameterdelimiter);
								stringVariables[thisInfo[0].trim()] = thisInfo[1].trim();
							}
						}
						if (!isReentrant && scriptCardsStashedScripts[resumeArgs[0]]) { delete scriptCardsStashedScripts[resumeArgs[0]]; }

						if (msg.playerid) {
							var sendingPlayer = getObj("player", msg.playerid);
							if (sendingPlayer) {
								stringVariables["SendingPlayerID"] = msg.playerid;
								lastExecutedByID = msg.playerid;
								stringVariables["SendingPlayerName"] = sendingPlayer.get("_displayname");
								lastExecutedDisplayName = sendingPlayer.get("_displayname");
								stringVariables["SendingPlayerColor"] = sendingPlayer.get("color");
								stringVariables["SendingPlayerSpeakingAs"] = sendingPlayer.get("speakingas");
								stringVariables["SendingPlayerIsGM"] = playerIsGM(msg.playerid) ? "1" : "0";
							}
						}

					} else {
						// Strip out all newlines in the input text
						cardContent = msg.content.replace(/(\r\n|\n|\r)/gm, " ");
						cardContent = cardContent.replace(/(<br ?\/?>)*/g, "");
						cardContent = cardContent.replace(/\}\}/g, " }}");
						cardContent = cardContent.trim();
						if (cardContent.charAt(cardContent.length - 1) !== "}") {
							if (cardContent.charAt(cardContent.length - 2) !== "}") {
								cardContent += "}";
							}
							cardContent += "}";
						}

						var libraries = cardContent.match(/\+\+\+.+?\+\+\+/g);
						if (libraries) {
							cardContent = insertLibraryContent(cardContent, libraries[0].replace(/\+\+\+/g, ""));
							cardContent = cardContent.replace(/\+\+\+.+?\+\+\+/g, "")
						}

						// Split the card into an array of tag-based (--) lines
						let cardWork = cardContent.match(/\{\{(.*?)\}\}/gis)
						if (cardWork && cardWork[0]) {
							var cardLines = cardWork[0].substring(2, cardWork[0].length - 3).split("--")
						}
						//var cardLines = cardContent.match(/\{\{(.*?)\}\}/gis) ? (" " + cardContent.match(/\{\{(.*?)\}\}/gis)[0]).substring(2,-2).split("--") : []
					}

					// pre-parse line labels and store line numbers for branching and for data lines to store in the data structure
					for (let x = 0; x < cardLines.length; x++) {
						let thisTag = getLineTag(cardLines[x], x, false)
						let isRedef = false;
						if (thisTag.charAt(0) == ":") {
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
								let dataElement = thisData.shift();
								scriptData.push(dataElement);
								saveScriptData.push(dataElement);
							}
						}
					}

					if (isReentrant) {
						outputLines = [];
						bareoutputLines = [];
						gmonlyLines = [];
						var entryLabel = resumeArgs[1].split(";")[0];
						stringVariables["reentryval"] = resumeArgs[1].split(";")[1];
						if (lineLabels[entryLabel]) {
							lineCounter = lineLabels[entryLabel]
						} else {
							log(`ScriptCards Error: Label ${resumeArgs[1]} is not defined for reentrant script`)
						}
					}

					// Process card lines starting with the first line (cardLines[0] will contain an empty string due to the split)
					do {
						while (lineCounter < cardLines.length) {

							let thisTag = replaceVariableContent(getLineTag(cardLines[lineCounter], lineCounter, true), cardParameters, false);
							let thisContent = replaceVariableContent(getLineContent(cardLines[lineCounter]), cardParameters, (thisTag.charAt(0) == "+" || thisTag.charAt(0) == "*" || thisTag.charAt(0) == "&"));

							if (cardParameters.debug == 1) {
								log(`Line Counter: ${lineCounter}, Tag:${thisTag}, Content:${thisContent}`);
							}

							if (thisTag.charAt(0) !== "/") {

								// Handle Stashing and asking for info
								if (thisTag.charAt(0).toLowerCase() == "i") {
									var myGuid = uuidv4();
									var stashType = thisTag.substring(1);
									var stashList = thisContent.split("||");
									var buildLine = "";
									var varList = "";
									for (var x = 0; x < stashList.length; x++) {
										var theseParams = stashList[x].split(";");
										if (theseParams[0].toLowerCase() == "t") {
											if (buildLine !== "") { buildLine += "-|-"; varList += ";"; }
											buildLine += theseParams[1] + ";&#64;{target|" + theseParams[2] + "|token_id}";
											varList += theseParams[1];
										}
										if (theseParams[0].toLowerCase() == "q") {
											if (buildLine !== "") { buildLine += "-|-"; varList += cardParameters.parameterdelimiter; }
											buildLine += theseParams[1] + cardParameters.parameterdelimiter + "?{" + theseParams[2] + "}";
											varList += theseParams[1];
										}
									}
									var flavorText = stashType.split(";")[0];
									if (cardParameters.formatinforequesttext !== "0") {
										flavorText = processInlineFormatting(flavorText, cardParameters, false);
									}
									var buttonLabel = stashType.split(";")[1];

									stashAScript(myGuid, cardLines, cardParameters, stringVariables, rollVariables, returnStack, parameterStack, lineCounter + 1, outputLines, "", "X", arrayVariables, arrayIndexes, gmonlyLines, bareoutputLines);
									lineCounter = cardLines.length + 100;
									cardParameters.hidecard = "1";
									sendChat(msg.who, `/w ${msg.who} ${flavorText}` + makeButton(buttonLabel, `!sc-resume ${myGuid}-|-${buildLine}`, cardParameters));
								}

								// *********** STARTHERE

								switch (thisTag.charAt(0).toLowerCase()) {
									case "!": handleObjectModificationCommands(thisTag, thisContent, cardParameters); break;
									case "a": playJukeboxTrack(thisContent); break;
									case "c": handleCaseCommand(thisTag, thisContent, cardParameters, cardLines); break;
									case "d": handleDataReadCommands(thisTag); break;
									case "e": handleEmoteCommands(thisTag, thisContent); break;
									case "h": handleHasTableCommands(thisTag, hashTables, thisContent); break;
									case "l": handleLoadCommands(thisTag, thisContent, cardParameters); break;
									case "r": handleRepeatingAttributeCommands(thisTag, thisContent, cardParameters); break;
									case "s": handleStashLines(thisTag, thisContent, cardParameters); break;
									case "w": handleWaitStatements(thisTag, thisContent, cardParameters); break;
									case "v": handleVisualEffectsCommand(thisTag, thisContent, cardParameters); break;
									case "x": {
										if (cardParameters.functionbenchmarking == "1") { reportBenchmarkingData(); }
										(cardParameters["reentrant"] !== 0) ? stashAScript(cardParameters["reentrant"], cardLines, cardParameters, stringVariables, rollVariables, returnStack, parameterStack, lineCounter + 1, outputLines, varList, "X", arrayVariables, arrayIndexes, gmonlyLines, bareoutputLines) : null
										lineCounter = cardLines.length + 1;
									} break;
									case "z": handleZOrderSettingCommands(thisTag, thisContent); break;
									case "~": handleFunctionCommands(thisTag, thisContent, cardParameters, msg); break;
									case "^": if (lineLabels[thisTag.substring(1)]) { lineCounter = lineLabels[thisTag.substring(1)] } else { log(`ScriptCards Error: Label ${jumpTo} is not defined on line ${lineCounter} (${thisTag}, ${thisContent})`) } break;
									case "@": handleAPICallCommands(thisTag, thisContent, cardParameters, msg); break;
									case "#": handleCardSettingsCommands(thisTag, thisContent, cardParameters); break;
									case "+": case "*": handleOutputCommands(thisTag, thisContent, cardParameters); break;
									case "=": handleRollVariableSetCommand(thisTag, thisContent, cardParameters); break;
									case "&": setStringOrArrayElement(thisTag.substring(1), thisContent, cardParameters); break;
									case "\\": handleConsoleLogs(thisTag, thisContent); break;
									case "<": if (returnStack.length > 0) {
										arrayVariables["args"] = [];
										callParamList = parameterStack.pop();
										if (callParamList) {
											for (const [key, value] of Object.entries(callParamList)) {
												arrayVariables["args"].push(value.toString().trim());
											}
										}
										lineCounter = returnStack.pop();
									} break;
									case ">": handleGosubCommands(thisTag, thisContent, cardParameters, cardLines); break;
									case "]": handleBlockEndCommand(thisTag, thisContent, cardLines); break;
									case "?": handleConditionalBlock(thisTag, thisContent, cardParameters, cardLines); break;
									//case "%": handleLoopStatements(thisTag, thisContent, cardParameters, cardLines); break;
								}

								// Handle looping statements
								if (thisTag.charAt(0) === "%") {
									var loopCounter = thisTag.substring(1);
									if (loopCounter && loopCounter !== "!") {
										if (loopControl[loopCounter]) { log(`ScriptCards: Warning - loop counter ${loopCounter} reused inside itself on line ${lineCounter}.`); }
										var params = thisContent.split(cardParameters.parameterdelimiter);
										if (params.length === 2 && params[0].toLowerCase().endsWith("each")) {
											// This will be a for-each loop, so the first (and only) parameter must be an array name
											if (arrayVariables[params[1]] && arrayVariables[params[1]].length > 0) {
												loopControl[loopCounter] = { loopType: "foreach", initial: 0, current: 0, end: arrayVariables[params[1]].length - 1, step: 1, nextIndex: lineCounter, arrayName: params[1] }
												stringVariables[loopCounter] = arrayVariables[params[1]][0];
												loopStack.push(loopCounter);
												if (cardParameters.debug == 1) { log(`ScriptCards: Info - Beginning of loop ${loopCounter}`) }
											} else {
												log(`ScriptCards For...Each loop without a defined array or with empty array on line ${lineCounter}`)
											}
										}
										if (params.length === 2 && (params[0].toLowerCase().endsWith("while") || params[0].toLowerCase().endsWith("until"))) {
											var originalContent = getLineContent(cardLines[lineCounter]);
											var contentParts = originalContent.split(cardParameters.parameterdelimiter);
											var isTrue = processFullConditional(replaceVariableContent(contentParts[1], cardParameters)) || params[0].toLowerCase().endsWith("until");
											if (isTrue) {
												loopControl[loopCounter] = { loopType: params[0].toLowerCase().endsWith("until") ? "until" : "while", initial: 0, current: 0, end: 999999, step: 1, nextIndex: lineCounter, condition: contentParts[1] }
												stringVariables[loopCounter] = "true";
												loopStack.push(loopCounter);
												if (cardParameters.debug == 1) { log(`ScriptCards: Info - Beginning of loop ${loopCounter}`) }
											} else {
												var line = lineCounter;
												for (line = lineCounter + 1; line < cardLines.length; line++) {
													if (getLineTag(cardLines[line], line, "").trim() == "%") {
														lineCounter = line;
													}
												}
												if (lineCounter > cardLines.length) {
													log(`ScriptCards: Warning - no end block marker found for loop block started ${loopCounter}`);
													lineCounter = cardLines.length + 1;
												}
											}
										}
										if (params.length === 2 && (!params[0].toLowerCase().endsWith("each")) && (!params[0].toLowerCase().endsWith("until")) && (!params[0].toLowerCase().endsWith("while"))) { params.push("1"); } // Add a "1" as the assumed step value if only two parameters
										if (params.length === 3) {
											if (isNumeric(params[0]) && isNumeric(params[1]) && isNumeric(params[2]) && parseInt(params[2]) != 0) {
												loopControl[loopCounter] = { loopType: "fornext", initial: parseInt(params[0]), current: parseInt(params[0]), end: parseInt(params[1]), step: parseInt(params[2]), nextIndex: lineCounter }
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
											var currentLoop = loopStack[loopStack.length - 1];
											if (loopControl[currentLoop]) {
												loopControl[currentLoop].current += loopControl[currentLoop].step;
												switch (loopControl[currentLoop].loopType) {
													case "fornext":
														stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
														break;
													case "foreach":
														try {
															var beforeLoopEnded = stringVariables[currentLoop]
															stringVariables[currentLoop] = arrayVariables[loopControl[currentLoop].arrayName][loopControl[currentLoop].current]
														} catch {
															stringVariables[currentLoop] = "ArrayError"
														}
														break;
													case "while":
														var isTrue = processFullConditional(replaceVariableContent(loopControl[currentLoop].condition, cardParameters));
														if (!isTrue) {
															loopControl[currentLoop].current = loopControl[currentLoop].end + 1;
															loopControl[currentLoop].step = 1;
														}
														break;
													case "until":
														var isTrue = processFullConditional(replaceVariableContent(loopControl[currentLoop].condition, cardParameters));
														if (isTrue) {
															loopControl[currentLoop].current = loopControl[currentLoop].end + 1;
															loopControl[currentLoop].step = 1;
														}
														break;

												}
												if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
													(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
													loopCounter == "!") {
													stringVariables[currentLoop] = beforeLoopEnded;
													loopStack.pop();
													delete loopControl[currentLoop];
													if (cardParameters.debug == 1) { log(`ScriptCards: Info - End of loop ${currentLoop}`) }
													if (loopCounter == "!") {
														var line = lineCounter;
														for (line = lineCounter + 1; line < cardLines.length; line++) {
															if (getLineTag(cardLines[line], line, "").trim() == "%") {
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
											log(`ScriptCards: Error - Loop end statement without an active loop on line ${lineCounter}`);
										}
									}
								}
							}

							executionCounter++;

							if (executionCounter > cardParameters.executionlimit) {
								log("ScriptCards Error: Execution Limit Reached. Terminating Script;")
								lineCounter = cardLines.length + 1;
							}
							lineCounter++;
						}
					} while (repeatScriptCard)

					var subtitle = "";
					if ((cardParameters.leftsub !== "") && (cardParameters.rightsub !== "")) {
						subtitle = cardParameters.leftsub + cardParameters.subtitleseparator + cardParameters.rightsub;
					}
					if ((cardParameters.leftsub !== "") && (cardParameters.rightsub == "")) {
						subtitle = cardParameters.leftsub;
					}
					if ((cardParameters.leftsub == "") && (cardParameters.rightsub !== "")) {
						subtitle = cardParameters.rightsub;
					}

					subtitle = processInlineFormatting(subtitle, cardParameters, (cardParameters.overridetemplate.toLowerCase() !== "none"));

					var gmoutput = (gmonlyLines.length > 0) ? gmoutput = htmlTemplateHiddenTitle.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle) : ""

					var cardOutput = (cardParameters.hidetitlecard == "0") ? (htmlTemplate.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle))
						: htmlTemplateHiddenTitle.replace("=X=TITLE=X=", cardParameters.title).replace("=X=SUBTITLE=X=", subtitle);

					cardOutput += outputLines.join("")
					gmoutput += gmonlyLines.join("")

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
							if (thisToken != null && thisToken.get("imgsrc") !== "") {
								emoteLeft = `<img src=${thisToken.get("imgsrc")} style='height: ${cardParameters.emotesourcetokensize}px; min-width: ${cardParameters.emotesourcetokensize}px; float: left;'></img>`;
							}
						}
						if (cardParameters.targettoken !== "") {
							var thisToken = getObj("graphic", cardParameters.targettoken.trim());
							if (thisToken != null && thisToken.get("imgsrc") !== "") {
								emoteRight = `<img src=${thisToken.get("imgsrc")} style='height: ${cardParameters.emotetargettokensize}px; min-width: ${cardParameters.emotetargettokensize}px; float: left;'></img>`;
							}
						}
					}

					if (cardParameters.emotesourcetokenoverride !== "0") {
						emoteLeft = `<img src=${cardParameters.emotesourcetokenoverride} style='height: ${cardParameters.emotesourcetokensize}px; min-width: ${cardParameters.emotesourcetokensize}px; float: left;'></img>`;
					}

					if (cardParameters.emotetargettokenoverride !== "0") {
						emoteRight = `<img src=${cardParameters.emotetargettokenoverride} style='height: ${cardParameters.emotesourcetokensize}px; min-width: ${cardParameters.emotesourcetokensize}px; float: left;'></img>`;
					}

					if (cardParameters.emotetext !== "" || emoteLeft !== "" || emoteRight !== "") {
						if (emoteLeft == "") { emoteLeft = "&nbsp;" }
						if (emoteRight == "") { emoteRight = "&nbsp;" }
						emote = "<div style='display: table; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal; background: " + cardParameters.emotebackground + "'>" + emoteLeft + "<div style='display: table-cell; width: 100%; " + " font-size: " + cardParameters.emotefontsize + "; font-weight: " + cardParameters.emotefontweight + "; color: " + cardParameters.emotefontcolor + "; font-family: " + cardParameters.emotefont + "; " + "vertical-align: middle; text-align: center; padding: 0px 2px;'>" + cardParameters.emotetext + "</div><div style='display: table-cell; margin: -5px 0px 3px -7px; font-weight: normal; font-style: normal;'>" + emoteRight + "</div></div>"
						emote = replaceVariableContent(emote, cardParameters, false);
					}

					var from = cardParameters.showfromfornonwhispers !== "0" ? msg.who : "";

					cardOutput = removeInlineRolls(cardOutput, cardParameters);
					emote = removeInlineRolls(emote, cardParameters);

					if (cardParameters.overridetemplate.toLowerCase() !== "none") {
						var textCode = templates[cardParameters.overridetemplate].textcode;
						if (textCode && textCode.indexOf("font-style:") == -1) {
							textCode = textCode.slice(0, textCode.lastIndexOf(";")) + "; font-style: normal;" + textCode.slice(textCode.lastIndexOf(";") + 1)
						}
						var titleCode = templates[cardParameters.overridetemplate].titlecode
						if (titleCode && titleCode.indexOf("font-style:") == -1) {
							titleCode = titleCode.slice(0, titleCode.lastIndexOf(";")) + "; font-style: normal;" + titleCode.slice(titleCode.lastIndexOf(";") + 1)
						}
						var boxCode = templates[cardParameters.overridetemplate].boxcode
						if (boxCode && boxCode.indexOf("font-style:") == -1) {
							boxCode = boxCode.slice(0, boxCode.lastIndexOf(";")) + "; font-style: normal;" + boxCode.slice(boxCode.lastIndexOf(";") + 1)
						}
						cardOutput = boxCode + titleCode + cardParameters.title + textCode;
						if (subtitle != "") {
							cardOutput += `<div align=center ${FillTemplateStyle("subtitlestyle", cardParameters, true)}> ${subtitle}</div>`
						}
						for (var x = 0; x < outputLines.length; x++) {
							cardOutput += bareoutputLines[x];
						}
						cardOutput += templates[cardParameters.overridetemplate].buttonwrapper
						cardOutput += '</div></div></div>' + templates[cardParameters.overridetemplate].footer + "</div>"
						cardOutput = replaceStyleInformation(cardOutput, cardParameters);
						cardOutput = removeInlineRolls(cardOutput, cardParameters);
					}

					if (cardParameters.hidecard == "0") {
						if (emote !== "") {
							if (cardParameters.whisper == "" || cardParameters.whisper == "0") {
								sendChat(from, "/desc " + emote + " " + cardOutput);
							} else {
								var whispers = cardParameters.whisper.split(",");
								for (var w in whispers) {
									var WhisperTarget = whispers[w].trim();
									if (WhisperTarget == "self") {
										WhisperTarget = getObj("player", msg.playerid).get("displayname");
									}
									sendChat(msg.who, `/w "${WhisperTarget}" ${emote} ${cardOutput}`);
								}
							}
						} else {
							if (cardParameters.whisper == "" || cardParameters.whisper == "0") {
								sendChat(from, "/desc " + cardOutput);
							} else {
								var whispers = cardParameters.whisper.split(",");
								for (var w in whispers) {
									var WhisperTarget = whispers[w].trim();
									if (WhisperTarget == "self") {
										WhisperTarget = getObj("player", msg.playerid).get("displayname");
									}
									sendChat(msg.who, `/w "${WhisperTarget}" ${cardOutput}`);
								}
							}
						}
					}

					if (gmonlyLines.length > 0) {
						var gmWhisperTarget = cardParameters.gmoutputtarget
						if (gmWhisperTarget == "self") {
							gmWhisperTarget = getObj("player", msg.playerid).get("displayname");
						}
						sendChat("API", "/w " + gmWhisperTarget + " " + gmoutput);
					}
				}
			}
		});
	});

	function resolveAttributeSubstitution(characterid, reference) {
		if (typeof reference.match === "function") {
			while (reference.match(/\@(?:[\{])[\w|\s|À-ÖØ-öø-ÿ|\%|\(|\:|\.|\_|\>|\^|\-\+|\)]*?(?!\w+[\{])(\})/g) != null) {
				var thisMatch = reference.match(/\@(?:[\{])[\w|\s|À-ÖØ-öø-ÿ|\%|\(|\:|\.|\_|\>|\^|\-\+|\)]*?(?!\w+[\{])(\})/g)[0];
				var attrName = thisMatch.substring(2, thisMatch.length - 1);
				var replacement = getAttrByName(characterid, attrName);
				reference = reference.replace(thisMatch, replacement);
			}
		}

		return reference;
	}

	function replaceVariableContent(content, cardParameters, rollHilighting) {
		var failCount = 0;
		const failLimit = 1000;
		if (content === undefined) { return content }
		if (!(typeof content.match == 'function')) { return content }
		content = content.replace(/\[&zwnj;/g, "[")
		//		while (content.match(/\[(?:[\$|\&|\@|\%|\*|\~|\=|\:])[^\[\]]*?(?!\.+[\[])(\])/g) != null) {
		//			var thisMatch = content.match(/\[(?:[\$|\&|\@|\%|\*|\~|\=|\:])[^\[\]]*?(?!\.+[\[])(\])/g)[0];
		while (content.match(/\[(?:[\$|\&|\@|\%|\*|\~|\=|\:|\?])[^\[\]]*?(?!\.+[\[])(\])/g) != null) {
			var thisMatch = content.match(/\[(?:[\$|\&|\@|\%|\*|\~|\=|\:|\?])[^\[\]]*?(?!\.+[\[])(\])/g)[0];
			var replacement = "";
			switch (thisMatch.charAt(1)) {
				case "&":
					// Replace a string variable
					if (thisMatch.match(/(?<=\[\&).*?(?=[\(])/g) != null) {
						// String variable with substring information
						var vName = thisMatch.match(/(?<=\[\&).*?(?=[\(])/g)[0];
						if (stringVariables[vName] != null) {
							try {
								var TestMatch = thisMatch.match(/(?<=\().*?(?=[)]])/g)[0].toString();
								var substringInfo = TestMatch.split(/(?<!\\),/);
								for (let x = 0; x < substringInfo.length; x++) {
									substringInfo[x] = substringInfo[x].replace("\\", "")
								}
								//log(substringInfo)
								//var substringInfo = TestMatch.match(/("[^"]*")|[^,]+/g)
								if (isNaN(substringInfo[0])) {
									switch (substringInfo[0].toLowerCase()) {
										case "length": replacement = stringVariables[vName].length; break;

										case "tolowercase":
										case "lower":
										case "tolower":
										case "lowercase": replacement = stringVariables[vName].toLowerCase(); break;

										case "reverse":
											replacement = stringVariables[vName].split("").reverse().join("");
											break;

										case "touppercase":
										case "upper":
										case "toupper":
										case "uppercase": replacement = stringVariables[vName].toUpperCase(); break;

										case "totitlecase":
										case "titlecase":
										case "title":
											replacement = stringVariables[vName].toLowerCase()
												.split(' ')
												.map(function (word) {
													return (word.charAt(0).toUpperCase() + word.slice(1));
												})
												.join(" ")
											break;

										case "contains":
										case "includes":
										case "icontains":
										case "iincludes":
											if (substringInfo.length == 2) {
												var c1 = stringVariables[vName]; var c2 = substringInfo[1]
												if (substringInfo[0].toLowerCase().startsWith("i")) { c1 = c1.toLowerCase(); c2 = c2.toLowerCase(); }
												if (c1.includes(c2)) {
													replacement = "1"
												} else {
													replacement = "0"
												}
											} else {
												replacement = "Contains Argument Error"
												log("ScriptCards Error : String contains evalulation incorrect arguments")
											}
											break;

										case "word":
											if (substringInfo.length == 2) {
												var words = stringVariables[vName].split(/[\s]/);
												if (parseInt(substringInfo[1]) > 0) {
													replacement = words[parseInt(substringInfo[1]) - 1] || "";
												} else {
													if (parseInt(substringInfo[1]) == 0) {
														replacement = stringVariables[vName];
													} else {
														replacement = words[words.length + parseInt(substringInfo[1])] || "";
													}
												}
											} else {
												replacement = "Word Argument Error"
												log("ScriptCards Error : String contains evalulation incorrect arguments")
											}
											break;

										case "indexof":
										case "iindexof":
											if (substringInfo.length == 2) {
												var c1 = stringVariables[vName]; var c2 = substringInfo[1]
												if (substringInfo[0].toLowerCase().startsWith("i")) { c1 = c1.toLowerCase(); c2 = c2.toLowerCase(); }
												replacement = c1.indexOf(c2);
											} else {
												replacement = "Indexof Argument Error"
												log("ScriptCards Error : String contains evalulation incorrect arguments")
											}
											break;

										case "lastindexof":
										case "ilastindexof":
											if (substringInfo.length == 2) {
												var c1 = stringVariables[vName]; var c2 = substringInfo[1]
												if (substringInfo[0].toLowerCase().startsWith("i")) { c1 = c1.toLowerCase(); c2 = c2.toLowerCase(); }
												replacement = c1.lastIndexOf(c2);
											} else {
												replacement = "Indexof Argument Error"
												log("ScriptCards Error : String contains evalulation incorrect arguments")
											}
											break;

										case "replace":
											if (substringInfo.length == 3) {
												replacement = stringVariables[vName].replace(substringInfo[1], substringInfo[2]);
											} else {
												replacement = "";
											}
											break;

										case "replaceall":
											if (substringInfo.length == 3) {
												try {
													if (substringInfo[2].indexOf(substringInfo[1]) == -1) {
														var str = stringVariables[vName];
														while (str.includes(substringInfo[1])) { str = str.replace(substringInfo[1], substringInfo[2]) }
														replacement = str;
													} else {
														log(`ScriptCards Error : Replace all string cannot contain the search string: ${substringInfo[0]}, ${substringInfo[1]}, ${substringInfo[2]}`);
														replacement = stringVariables[vName];
													}
												} catch (e) {
													log(e);
												}
											} else {
												replacement = "";
											}
											break;

										case "before":
											if (substringInfo.length == 2) {
												if (stringVariables[vName].includes(substringInfo[1])) {
													replacement = stringVariables[vName].substring(0, stringVariables[vName].indexOf(substringInfo[1]))
												} else {
													replacement = stringVariables[vName]
												}
											} else {
												log(`ScriptCards Error : Before string reference doesn't contains a search parameter`);
												replacement = stringVariables[vName];
											}
											break;

										case "after":
											if (substringInfo.length == 2) {
												if (stringVariables[vName].includes(substringInfo[1])) {
													replacement = stringVariables[vName].substring(stringVariables[vName].indexOf(substringInfo[1]) + substringInfo[1].length)
												} else {
													replacement = stringVariables[vName]
												}
											} else {
												log(`ScriptCards Error : After string reference doesn't contains a search parameter`);
												replacement = stringVariables[vName];
											}
											break;

										case "split":
											if (substringInfo.length == 3)
												replacement = stringVariables[vName].split(substringInfo[1])[substringInfo[2]]
											else
												replacment = stringVariables[vName]
											break;

									}
								} else {
									if (substringInfo.length == 1) {
										if (parseInt(substringInfo[0]) >= 0) {
											replacement = stringVariables[vName].substring(parseInt(substringInfo[0]));
										} else {
											replacement = stringVariables[vName].substring(stringVariables[vName].length + parseInt(substringInfo[0]));
										}
									} else {
										if (parseInt(substringInfo[0]) >= 0) {
											var first = parseInt(substringInfo[0]);
											var last = first + parseInt(substringInfo[1]);
											replacement = stringVariables[vName].substring(first, last);
										} else {
											var first = stringVariables[vName].length + parseInt(substringInfo[0]);
											var last = first + parseInt(substringInfo[1]);
											replacement = stringVariables[vName].substring(first, last);
										}
									}
								}
							} catch (e) {
								log(e)
								replcement = "Substring reference error."
							}
						} else {
							if (vName.startsWith("zwnj;")) {
								replacement = "[" + vName.replace(/zwnj;/g, "") + "]"
							} else {
								replacement = ""
							}
						}
					} else {
						var vName = thisMatch.substring(2, thisMatch.length - 1);
						if (stringVariables[vName] != null) {
							replacement = stringVariables[vName];
						} else {
							if (vName.startsWith("zwnj;")) {
								replacement = "[" + vName.replace(/zwnj;/g, "") + "]"
							} else {
								replacement = "";
							}
						}
						if (cardParameters.debug !== "0") {
							log(`ContentIn: ${content} Match: ${thisMatch}, vName: ${vName}, replacement ${replacement}`)
						}
					}
					break;

				case ":":
					try {
						var hashparams = thisMatch.substring(2, thisMatch.length - 1);
						var hashName = hashparams.split('("')[0];
						var hashKey = hashparams.split('("')[1];

						if (hashName != null && hashKey != null) {
							hashKey = hashKey.substring(0, hashKey.indexOf('")'))
						}

						if (hashName && hashKey) {
							replacement = hashTables[hashName][hashKey]
						} else {
							replacement = "";
						}
					} catch (e) {
						replacement = "";
					}

					break;

				case "$":
					// Replace a roll variable
					try {
						var vName = thisMatch.match(/(?<=\[\$).*?(?=[\.|\]])/g)[0];
						var vSuffix = "Total";
						if (thisMatch.match(/(?<=\.).*?(?=[\.|\]])/g) != null) {
							vSuffix = thisMatch.match(/(?<=\.).*?(?=[\.|\]])/g)[0];
						}
						if (rollVariables[vName] != null) {
							var rawValue = rollVariables[vName]["Total"].toString();
							if (rollVariables[vName].PaddingDigits > rawValue.length) {
								rawValue = rawValue.padStart(rollVariables[vName].PaddingDigits, '0');
							}
							switch (vSuffix.toLocaleLowerCase()) {
								case "raw":
								case "total":
									replacement = rawValue;
									break;

								default:
									replacement = rollVariables[vName][vSuffix];
							}
							if (vSuffix.startsWith("RolledDice") || vSuffix.startsWith("KeptDice") || vSuffix.startsWith("DroppedDice")) {
								if (thisMatch.match(/(?<=\().*?(?=[)]])/g)) {
									var vIndex = thisMatch.match(/(?<=\().*?(?=[)]])/g)[0];
									if (vIndex) {
										vIndex -= 1;
										var suffixName = vSuffix.substring(0, vSuffix.indexOf("("));
										replacement = rollVariables[vName][suffixName][vIndex];
									} else {
										replacement = "0";
									}
								}
							}
						}
						debugOutput(`RollHilighting: ${rollHilighting}, Suffix: ${vSuffix}`);
						if (rollHilighting == true && vSuffix == "Total" && rollVariables[vName] != null) {
							replacement = buildTooltip(replacement, "Roll: " + rollVariables[vName].RollText.replace("<", "L").replace(">", "G") + "<br /><br />Result: " + rollVariables[vName].Text, rollVariables[vName].Style);
						}
						if (cardParameters.debug !== "0") {
							log(`ContentIn: ${content} Match: ${thisMatch}, vName: ${vName}, vSuffix: ${vSuffix}, replacement ${replacement}`)
						}
					} catch (e) {
						replacement = "";
					}
					break;

				case "~":
					// Replace a settings reference
					var vName = thisMatch.substring(2, thisMatch.length - 1);
					replacement = cardParameters[vName.toLowerCase()] || "";
					break;

				case "=":
					var vName = "ScriptCardsInternalDummyRollVariable";
					var rollFormula = thisMatch.substring(2, thisMatch.length - 1);
					if (thisMatch.indexOf(":") > 0 && thisMatch.indexOf(":") < thisMatch.indexOf("]")) {
						vName = thisMatch.substring(2, thisMatch.indexOf(":"));
						rollFormula = thisMatch.substring(thisMatch.indexOf(":") + 1, thisMatch.length - 1);
					}
					rollVariables[vName] = parseDiceRoll(rollFormula, cardParameters);
					replacement = rollVariables[vName]["Total"]
					break;

				case "@":
					// Replace Array References
					if (thisMatch.match(/(?<=\[\$|\@).*?(?=[\(])/g)) {
						var vName = thisMatch.match(/(?<=\[\$|\@).*?(?=[\(])/g)[0];
						var vIndex = 0;
						var TestMatch = thisMatch.match(/(?<=\().*?(?=[)]])/g)[0].toString();
						if (TestMatch == "" || TestMatch.toLowerCase() == "length") {
							if (arrayVariables[vName] != null) {
								replacement = arrayVariables[vName].length.toString();
							} else {
								replacement = "undefined array";
							}
						}
						if (TestMatch.toLowerCase() == "lastindex" || TestMatch.toLowerCase() == "maxindex") {
							if (arrayVariables[vName] != null) {
								replacement = (arrayVariables[vName].length - 1).toString();
							} else {
								replacement = "undefined array";
							}
						}
						if (thisMatch.match(/(?<=\().*?(?=[)]])/g) != null) {
							vIndex = parseInt(thisMatch.match(/(?<=\().*?(?=[)]])/g)[0]);
							if (arrayVariables[vName] != null) {
								if (arrayVariables[vName] && arrayVariables[vName].length > vIndex) {
									replacement = arrayVariables[vName][vIndex];
								}
							} else {
								replacement = "undefined array";
							}
						}
						if (cardParameters.debug !== "0") {
							log(`ContentIn: ${content} Match: ${thisMatch}, vName: ${vName}, vIndex: ${vIndex}, replacement ${replacement}`)
						}
					} else {
						log(`Array reference error : ${thisMatch}`)
					}
					break;

				case "%":
					// Replace gosub parameter references
					if (thisMatch.match(/(?:\[\%)(.*?)(?:\%\])/g) !== null) {
						var vName = thisMatch.match(/(?:\[\%)(.*?)(?:\%\])/g)[0];
						if (vName !== null) {
							vName = vName.substring(2, vName.length - 2);
							if (callParamList[vName] != null) {
								replacement = callParamList[vName];
							}
						}
					}
					break;

				case "?":
					// Replace inline conditional references
					try {
						let Pieces = (thisMatch.substring(2, thisMatch.length - 1)).split(cardParameters.inlineconditionseparator)
						if (processFullConditional(Pieces[0])) {
							replacement = Pieces[1]
						} else {
							replacement = Pieces[2]
						}
					} catch (e) {
						replacement = "";
					}
					break;

				case "*":
					// Replace ability references
					var activeCharacter = ""
					if (thisMatch.charAt(2).toLowerCase() == "s") {
						if (cardParameters.sourcetoken != null || cardParameters.sourcecharacter != null) {
							activeCharacter = cardParameters.sourcetoken || cardParameters.sourcecharacter;
						}
					}
					if (thisMatch.charAt(2).toLowerCase() == "t") {
						if (cardParameters.targettoken != null || cardParameters.targetcharacter != null) {
							activeCharacter = cardParameters.targettoken || cardParameters.targetcharacter;
						}
					}
					if (thisMatch.charAt(2) == "-") {
						activeCharacter = thisMatch.substring(2, thisMatch.indexOf(":"));
					}
					if (activeCharacter !== "") {
						var workString = thisMatch;
						if (workString == "this should never happen") {
							//if (workString.indexOf(":") !== workString.lastIndexOf(":")) {
							// Format to access a repeating value: [*S:r-section:index:attribute]
							//let op = workString.split(":");

						} else {
							if (cardParameters.enableattributesubstitution !== "0") { workString = resolveAttributeSubstitution(activeCharacter, thisMatch); }
							var token;
							var attribute = "";
							var defaultValue = null;
							var useDefaultValue = false;
							var attrName = workString.substring(workString.indexOf(":") + 1, workString.length - 1);
							if (attrName.indexOf(":::") >= 0) {
								defaultValue = attrName.substring(attrName.indexOf(":::") + 3, attrName.length);
								attrName = attrName.substring(0, attrName.indexOf(":::"))
								useDefaultValue = true;
							}
							var character = getObj("character", activeCharacter);
							if (character === undefined) {
								token = getObj("graphic", activeCharacter);
								if (token != null) {
									character = getObj("character", token.get("represents"));
								}
							}
							if (character != null) {
								var opType = "current";
								if (attrName.endsWith("^")) {
									attrName = attrName.substring(0, attrName.length - 1);
									opType = "max";
								}
							}
							if (token != null && attrName.toLowerCase().startsWith("t-")) { //&& tokenAttributes.indexOf(attrName.substring(2)) >= 0) {
								if (token.get(attrName.substring(2))) {
									attribute = token.get(attrName.substring(2)).toString() || "";
								}
							}
							if (character != null && (!attrName.toLowerCase().startsWith("t-"))) {
								//log(`attrName: ${attrName}`)
								if (attrName !== "bio" && attrName !== "notes" && attrName !== "gmnotes") {
									attribute = getAttrByName(character.id, attrName, opType);
									if (attribute === undefined) {
										attribute = character.get(attrName);
									}
								} else {
									// Add URL Decoding?
									/*
									log("In else")
									const myFunc = async (character) => {
										const charBio = await getNotes(attrName, character);
										log(`Bio: ${charBio}`);
										attribute = charBio;
										log(`Atrr: ${attribute}`)
										return $charBio
									};
									*/
									//attribute = myFunc();
									//attribute = new Promise((resolve, reject) => { character.get("bio", resolve); })
									//Promise.resolve().then( () => { log(attribute) } )
								}
								if (cardParameters.attemptattributeparsing != 0) {
									attribute = ParseCalculatedAttribute(attribute, character)
								}
							}
							if (token == undefined && character == undefined) {
								// Try finding a Player object
								var player = getObj("player", activeCharacter);
								if (player != null) {
									attribute = player.get(attrName) || "";
								}
							}
							replacement = attribute;
							if (useDefaultValue && (replacement == null || replacement == undefined || replacement == "")) {
								replacement = defaultValue;
							}
							if (character != null) {
								if (cardParameters.enableattributesubstitution !== "0") {
									replacement = resolveAttributeSubstitution(character.get("_id"), replacement);
								}
							}
						}
					}

					if (thisMatch.charAt(2).toLowerCase() == "g") {
						// Game State Variables
						var objectInfo = StripAndSplit(thisMatch, ":");
						replacement = ""

						if (state[objectInfo[1]] != null) {
							var baseObj = state[objectInfo[1]]
							for (var ai = 2; ai < objectInfo.length; ai++) {
								if (Object.prototype.hasOwnProperty.call(baseObj, objectInfo[ai])) {
									baseObj = baseObj[objectInfo[ai]]
								} else {
									replacement = "StateObjectReferenceError"
								}
							}
						}
						if (replacement !== "StateObjectReferenceError") {
							replacement = baseObj.toString() == "[object Object]" ? JSON.stringify(baseObj) : baseObj.toString();
						}
					}

					if (thisMatch.charAt(2).toLowerCase() == "p") {
						// page attributes
						var attrName = thisMatch.substring(4, thisMatch.length - 1);
						if (cardParameters.activepageobject) {
							replacement = cardParameters.activepageobject.get(attrName) || "";
						} else {
							const thisPage = getObj("page", Campaign().get("playerpageid"));
							if (thisPage) {
								replacement = thisPage.get(attrName) || "";
							}
						}
					}

					if (thisMatch.charAt(2).toLowerCase() == "c") {
						// campaign attributes
						let attrName = thisMatch.substring(4, thisMatch.length - 1);
						if (attrName == "playerpage") { attrName = "playerpageid" }
						replacement = Campaign().get(attrName) || "";
					}

					if (thisMatch.charAt(2).toLowerCase() == "o") {
						// object attributes. Format is [*Oobjectid:objecttype:property]
						var objectInfo = thisMatch.replace("[", "").replace("]", "").split(":");
						if (objectInfo.length == 4) {
							var objectID = objectInfo[1];
							var objectType = objectInfo[2];
							var propertyName = objectInfo[3];
							var thisObj = getObj(objectType, objectID);
							if (thisObj != null && !(propertyName == "action")) {
								replacement = thisObj.get(propertyName) || "";
							} else {
								replacement = ""
							}
							if (thisObj != null && objectType == "player" && propertyName.toLowerCase() == "isgm") {
								replacement = (playerIsGM(thisObj.id)) ? 1 : 0
							}
						} else {
							replacment = ""
						}
					}

					if (thisMatch.charAt(2).toLowerCase() == "r") {
						// Repeating section attributes
						var opType = "";
						var repSectionHandled = false;
						var attrName = thisMatch.substring(4, thisMatch.length - 1);
						if (attrName.toLowerCase() == "$fieldlist$") {
							replacement = "";
							if (repeatingSection) {
								for (var x = 0; x < repeatingSection.length; x++) {
									replacement += repeatingSection[x].split("|")[0] + "|";
								}
							}
							replacement.slice(0, -1)
							repSectionHandled = true
						}
						if (attrName.match(/(\-.*)\:(.*)\:(\d*)\:(.*)/) && !repSectionHandled) {
							replacement = ""
							var values = attrName.match(/(\-.*)\:(.*)\:(\d*)\:(.*)/)
							values.shift();
							repeatingSectionIDs = getRepeatingSectionIDs(values[0], values[1])
							if (values[3].endsWith("^")) { values[3] = values[3].substring(0, values[3].length - 1) + "_max" }
							if (repeatingSectionIDs) {
								if (thisMatch.charAt(3) == ":") {
									let repeatingIndex = Number(values[2]);
									let repeatingCharID = values[0];
									let repeatingSectionName = values[1];
									fillCharAttrs(findObjs({ _type: 'attribute', _characterid: repeatingCharID }));
									repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]);
									repeatingIndex = Number(values[2]);
									if (repeatingSectionIDs) {
										for (let i in repeatingSection) {
											if (repeatingSection[i].split("|")[0] == values[3]) {
												replacement = repeatingSection[i].split("|").slice(1, 999).join("|");
											}
										}
									}
								} else {
									replacement = values[1] + "_" + repeatingSectionIDs[Number(values[2])] + "_" + values[3]
								}
							}
							repSectionHandled = true
						}
						if (attrName.match(/(\-.*)\:(.*)\:rowcount/) && !repSectionHandled) {
							replacement = ""
							let values = attrName.match(/(\-.*)\:(.*)\:rowcount/)
							values.shift();
							repeatingSectionIDs = getRepeatingSectionIDs(values[0], values[1])
							replacement = repeatingSectionIDs.length;
							repSectionHandled = true
						}
						if (!repSectionHandled) {
							if (attrName.endsWith("^")) {
								attrName = attrName.substring(0, attrName.length - 1);
								opType = "_max";
							}
							var searchText = attrName + opType + "|";
							if (thisMatch.charAt(3) == ":") {
								if (repeatingSectionIDs) {
									for (var i in repeatingSection) {
										if (repeatingSection[i].startsWith(searchText)) {
											replacement = repeatingSection[i].split("|").slice(1, 999).join("|");
											//charId = repeatingCharID;
										}
									}
								}
							} else {
								replacement = repeatingSectionName + "_" + repeatingSectionIDs[repeatingIndex] + "_" + attrName + opType;
							}
							if (!repeatingSection) { replacement = "NoRepeatingAttributeLoaded" }
							if (repeatingSection && repeatingSection.length <= 1) { replacement = "NoRepeatingAttributeLoaded" }
						}

					}

					break;
			}

			content = content.replace(thisMatch, replacement);

			failCount++;
			if (failCount > failLimit) return content;
		}
		return content;
	}

	function getLineTag(line, linenum, logerror) {
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
			return line.substring(line.indexOf("|") + 1).trim();
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
			tableEntryValue: "",
			RolledDice: [],
			KeptDice: [],
			DroppedDice: [],
			RollCount: 0,
			KeptCount: 0,
			DroppedCount: 0,
			PaddingDigits: 0,
			DiceFont: ""
		}
		var hadOne = false;
		var hadAce = false;
		rollResult.Style = cardParameters.stylenormal;
		var currentOperator = "+";

		for (var x = 0; x < rollComponents.length; x++) {
			var text = rollComponents[x];
			//log(text)
			var componentHandled = false;

			if (text.match(/^(\d+[dDuUmM][fF\d]+)([eE])?([kK][lLhH]\d+)?([rR][<\>]\d+)?([rR][oO][<\>]\d+)?(![HhLl])?(![<\>]\d+)?(!)?([Ww][Ss][Xx])?([Ww][Ss])?([Ww][Xx])?([Ww])?([\><]\d+)?(f\<\d+)?(\#)?$/)) {
				var thisRollHandled = handleDiceFormats(text);
				componentHandled = true;

				if (thisRollHandled.wasWild) { hadOne = thisRollHandled.hadOne; hadAce = thisRollHandled.hadAce; }
				if (thisRollHandled.highlightasfailure) { hadOne = true }

				var dieCount = thisRollHandled.rollSet.length;
				rollResult.RollCount += dieCount;
				rollResult.RolledDice.push(...thisRollHandled.rawRollSet);
				rollResult.KeptCount += thisRollHandled.keptRollSet.length;
				rollResult.KeptDice.push(...thisRollHandled.keptRollSet);
				rollResult.DroppedCount += thisRollHandled.droppedRollSet.length;
				rollResult.DroppedDice.push(...thisRollHandled.droppedRollSet);

				for (var i = 0; i < dieCount; i++) {
					if (thisRollHandled.rollSet[i] == 1) {
						rollResult.Ones++;
						if (!thisRollHandled.dontHilight) { hadOne = true; }
					}
					if (thisRollHandled.rollTextSet[i].indexOf("!") > 0 && cardParameters.explodingonesandaces !== "1") {
						rollResult.Aces += 1;
					}
					if (thisRollHandled.rollTextSet[i].indexOf("!") > 0 && cardParameters.explodingonesandaces == "1") {
						// Handle reroll ones counting
						let subrolls = thisRollHandled.rollTextSet[i].split("!");
						for (var x = 1; x < subrolls.length; x++) {
							if (subrolls[x] == "1") {
								rollResult.Ones += 1;
							}
						}
						rollResult.Aces += subrolls.length - 1;
					}
					if (thisRollHandled.rollSet[i] >= thisRollHandled.sides) {
						rollResult.Aces++;
						if (!thisRollHandled.dontHilight) { hadAce = true; }
					}
					if (thisRollHandled.rollSet[i] % 2 == 0) {
						rollResult.Evens++;
					} else {
						rollResult.Odds++;
					}
				}

				switch (currentOperator) {
					case "+": rollResult.Total += thisRollHandled.rollTotal; if (!thisRollHandled.dontBase) { rollResult.Base += thisRollHandled.rollTotal; } break;
					case "-": rollResult.Total -= thisRollHandled.rollTotal; if (!thisRollHandled.dontBase) { rollResult.Base -= thisRollHandled.rollTotal; } break;
					case "*": rollResult.Total *= thisRollHandled.rollTotal; if (!thisRollHandled.dontBase) { rollResult.Base *= thisRollHandled.rollTotal; } break;
					case "/": rollResult.Total /= thisRollHandled.rollTotal; if (!thisRollHandled.dontBase) { rollResult.Base /= thisRollHandled.rollTotal; } break;
					case "%": rollResult.Total %= thisRollHandled.rollTotal; if (!thisRollHandled.dontBase) { rollResult.Base %= thisRollHandled.rollTotal; } break;
					case "\\": rollResult.Total = cardParameters.roundup == "0" ? Math.floor(rollResult.Total / thisRollHandled.rollTotal) : Math.ceil(rollResult.Total / thisRollHandled.rollTotal);
						if (!thisRollHandled.dontBase) { rollResult.Base = cardParameters.roundup == "0" ? Math.floor(rollResult.Base / thisRollHandled.rollTotal) : Math.ceil(rollResult.Base / thisRollHandled.rollTotal); }
						break;
				}

				rollResult.Text += "(" + thisRollHandled.rollText + ") ";
			}

			if (!componentHandled) {
				// A mathmatical function
				if (text.match(/^\{.*\}$/)) {
					componentHandled = true;
					var operation = text.substring(1, text.length - 1);
					var precision = 0;
					var value1 = 0;
					var value2 = 0;
					if (operation.toLowerCase().startsWith("round:")) {
						precision = Math.min(6, parseInt(operation.substring(6)));
						operation = "ROUND:";
					}
					if (operation.toLowerCase().startsWith("pad:")) {
						value1 = parseFloat(operation.substring(4));
						operation = "PAD";
					}
					if (operation.toLowerCase().startsWith("min:")) {
						value1 = parseFloat(operation.substring(4));
						operation = "MIN";
					}
					if (operation.toLowerCase().startsWith("max:")) {
						value1 = parseFloat(operation.substring(4));
						operation = "MAX";
					}
					if (operation.toLowerCase().startsWith("clamp:")) {
						var range = operation.substring(6);
						if (range.indexOf(":") > 0) {
							value1 = parseInt(range.split(":")[0]);
							value2 = parseInt(range.split(":")[1]);
							operation = "CLAMP";
						}
					}
					switch (operation.toLowerCase()) {
						case "abs":
							rollResult.Total = Math.abs(rollResult.Total);
							rollResult.Text += "{ABS}";
							break;

						case "sqrt":
						case "squareroot":
							rollResult.Total = Math.sqrt(rollResult.Total);
							rollResult.Text += "{SQRT}";
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

						case "neg":
						case "negate":
							rollResult.Total = rollResult.Total * -1;
							rollResult.Text += "{NEGATE}";
							break;

						case "sin":
							rollResult.Total = Math.sin(rollResult.Total);
							rollResult.Text += "{SIN}";
							break;

						case "cos":
							rollResult.Total = Math.cos(rollResult.Total);
							rollResult.Text += "{COS}";
							break;

						case "tan":
							rollResult.Total = Math.tan(rollResult.Total);
							rollResult.Text += "{TAN}";
							break;

						case "asin":
							rollResult.Total = Math.asin(rollResult.Total);
							rollResult.Text += "{ASIN}";
							break;

						case "acos":
							rollResult.Total = Math.acos(rollResult.Total);
							rollResult.Text += "{ACOS}";
							break;

						case "atan":
							rollResult.Total = Math.atan(rollResult.Total);
							rollResult.Text += "{ATAN}";
							break;

						case "square":
							rollResult.Total = rollResult.Total * rollResult.Total;
							rollResult.Text += "{SQUARE}";
							break;

						case "cube":
						case "cubed":
							rollResult.Total = rollResult.Total * rollResult.Total * rollResult.Total;
							rollResult.Text += "{CUBE}";
							break;

						case "cbrt":
						case "cuberoot":
							rollResult.Total = Math.cbrt(rollResult.Total);
							rollResult.Text += "{CUBEROOT}";
							break;

						case "round:":
							rollResult.Total = rollResult.Total.toFixed(precision);
							break;

						case "pad":
							rollResult.PaddingDigits = value1;
							break;

						case "min":
							if (rollResult.Total < value1) {
								rollResult.Total = value1
							}
							rollResult.Text += `{MIN:${value1}}`;
							break;

						case "max":
							if (rollResult.Total > value1) {
								rollResult.Total = value1
							}
							rollResult.Text += `{MAX:${value1}}`;
							break;

						case "clamp":
							if (rollResult.Total < value1) {
								rollResult.Total = value1
							}
							if (rollResult.Total > value2) {
								rollResult.Total = value2
							}
							rollResult.Text += `{CLAMP:${value1}:${value2}}`;
							break;
					}
				}
			}

			// An operator
			if (!componentHandled) {
				if (text.match(/^[\+\-\*\/\\\%]$/)) {// && !text.match(/^-\d*$/)) {
					componentHandled = true;
					currentOperator = text;
					componentHandled = true;
					//rollResult.Text += `${currentOperator} `;
					rollResult.Text += currentOperator == "*" ? "x " : currentOperator + " ";
				}
			}

			// A bare number within parens (just strip them)
			if (!componentHandled) {
				if (text.match(/^\([+-]?(\d*\.)?\d*#*\)$/)) {
					text = text.substring(1, text.length - 1)
				}
				if (text.match(/^[+-]?(\d*\.)?\d*#$/)) {
					text = text.substring(0, text.length - 1)
				}
				// Just a number
				if (text.match(/^[+-]?(\d*\.)?\d*$/)) {
					componentHandled = true;
					rollResult.Text += `${text} `;

					if (!isNaN(text)) {
						switch (currentOperator) {
							case "+": rollResult.Total += Number(text.replace("#", "")); break;
							case "-": rollResult.Total -= Number(text.replace("#", "")); break;
							case "*": rollResult.Total *= Number(text.replace("#", "")); break;
							case "/": rollResult.Total /= Number(text.replace("#", "")); break;
							case "%": rollResult.Total %= Number(text.replace("#", "")); break;
							case "\\": rollResult.Total = cardParameters.roundup == "0" ? Math.floor(rollResult.Total / Number(text.replace("#", ""))) : Math.ceil(rollResult.Total / Number(text.replace("#", ""))); break;
						}
					}
				}
			}

			// A card variable
			if (!componentHandled) {
				if (text.match(/^\[\$.+\]$/)) {
					componentHandled = true;
					var thisKey = text.substring(2, text.length - 1);
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
			}

			// A Rollable Table Result
			if (!componentHandled) {
				if (text.match(/\[[Tt]\#.+?\]/g)) {
					componentHandled = true;
					var rollTableName = text.substring(3, text.length - 1);
					var tableResult = rollOnRollableTable(rollTableName);
					if (tableResult) {
						rollResult.tableEntryText = tableResult[0];
						rollResult.tableEntryImgURL = tableResult[1];
						rollResult.Total = tableResult[2];
						rollResult.Base = tableResult[2];
						rollResult.RollText = `[T#${rollTableName}]`;
						rollResult.Text = tableResult[0];
						rollResult.tableEntryValue = isNaN(rollResult.tableEntryText) ? 0 : parseInt(rollResult.tableEntryText);
					}
				}
			}

			// Flavor Text
			if (!componentHandled) {
				if (text.match(/^\[.+\]$/)) {
					//log(`Flavor Text: ${text}`)
					componentHandled = true;
					if ((text.charAt(1) !== "$") && (text.charAt(1) !== "=")) {
						if (text.charAt(1) == "t" || text.charAt(1) == "T") {
							if (text.charAt(2) !== "#") {
								rollResult.Text += ` [&zwnj;${text.substring(1)} `;
							}
						}
						rollResult.Text += ` ${text} `;
					}
				}
			}

			// Plain Text
			if (!componentHandled) {
				if (text.match(/\b[A-Za-z]+\b$/) && cardParameters.allowplaintextinrolls !== 0) {
					componentHandled = true;
					rollResult.Text += ` ${text} `;
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

		rollResult.Style = replaceStyleInformation(rollResult.Style, cardParameters);

		rollResult.Text = rollResult.Text.replace(/\+ \+/g, " + ");
		rollResult.Text = rollResult.Text.replace(/\- \-/g, " - ");

		return rollResult;
	}

	function cleanUpRollSpacing(input) {
		input = input.replace(/\+/g, " + ");
		//input = input.replace(/\-(?![^[]*?])/g, " - ");
		input = input.replace(/(?<![:])\-(?![^[]*?])/g, " - ");
		input = input.replace(/\*/g, " * ");
		input = input.replace(/\//g, " / ");
		input = input.replace(/\\/g, " \\ ")
		input = input.replace(/\%/g, " % ");
		input = input.replace(/\[/g, " [&zwnj;");
		input = input.replace(/\[\&zwnj;T\#/g, " [T#");
		input = input.replace(/\]/g, "] ");
		input = input.replace(/\s+/g, " ");
		input = input.replace(/\* \- /g, "* -");
		input = input.replace(/\- \- /g, "- -");
		input = input.replace(/\/ \- /g, "/ -");
		input = input.replace(/\\ \- /g, "\ -");
		input = input.replace(/\% \- /g, "% -");
		return input;
	}

	function buildRowOutput(tag, content, tagprefix, contentprefix) {
		return htmlRowTemplate.replace("=X=ROWDATA=X=", `<strong>${tagprefix}${tag}</strong>${contentprefix}${content}`);
	}

	function buildRawRowOutput(tag, content, tagprefix, contentprefix) {
		return `<div><strong>${tagprefix}${tag}</strong>${contentprefix}${content}</div>`;
	}

	function buildTooltip(text, tip, style) {
		var tooltipStyle = ` font-family: ${defaultParameters.titlefont}; font-size: ${defaultParameters.titlefontsize}; font-weight: normal; font-style: normal; ${style} `;
		return `<span style='${tooltipStyle}' class='showtip tipsy' title='${tip.toString().replace(/\~/g, "")}'>${text}</span>`;
	}

	function processFullConditional(conditional, cardParameters) {
		// Remove multiple spaces
		var trimmed = conditional.replace(/\s+/g, ' ').trim();
		var parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g);
		if (!parts) { return false; }
		/*
		var alljoinersAnd = true;
		var alljoinersOr = true;
		// Currently disabled... beginnings of short-circuit evaluation
		for (var x = 0; x < parts.length; x++) {
			if (parts[x].toLowerCase() !== "-and" || parts[x].toLowerCase() !== "-or") {
				if (parts[x].toLowerCase() == "-and") { alljoinersOr = false; }
				if (parts[x].toLowerCase() == "-or") { alljoinersAnd = false; }
			}
		}
		//log(`AllJoinersAnd: ${alljoinersAnd} AllJoinersOr: ${alljoinersOr}`)
		*/
		var currentJoiner = "none";
		var overallResult = true;
		if (parts.length < 3) { return false; }
		while (parts.length >= 3) {
			var thisCondition = `${parts[0]} ${parts[1]} ${parts[2]}`;
			var thisResult = evaluateConditional(thisCondition, cardParameters);
			parts.shift();
			parts.shift();
			parts.shift();
			switch (currentJoiner) {
				case "none": overallResult = thisResult; break;
				case "-and": overallResult = overallResult && thisResult; break;
				case "-or": overallResult = overallResult || thisResult; break;
			}
			/*
			if (alljoinersAnd && !overallResult) { log(`False, exiting`); x = parts.length + 1; }
			if (alljoinersOr && overallResult) { log(`True, exiting`); x = parts.length + 1; }
			*/
			if (parts.length > 0) {
				if ((parts[0].toLowerCase() == "-or") || (parts[0].toLowerCase() == "-and")) {
					currentJoiner = parts[0].toLowerCase();
				} else {
					log(`ScriptCards conditional error: Condition contains an invalid clause joiner on line. Only -and and -or are supported. Assume results are incorrect. ${conditional} - ${thisContent}`);
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
		var left = replaceVariableContent(components[0]).replace(/\"/g, "", cardParameters, false);
		var right = replaceVariableContent(components[2]).replace(/\"/g, "", cardParameters, false);
		if (!isNaN(left) && left !== "") { left = parseFloat(left); }
		if (!isNaN(right) && right !== "") { right = parseFloat(right); }
		switch (components[1]) {
			case "-gt": if (left > right) return true; break;
			case "-ge": if (left >= right) return true; break;
			case "-lt": if (left < right) return true; break;
			case "-le": if (left <= right) return true; break;
			case "-eq": if (left == right) return true; break;
			case "-eqi": if (left.toString().toLowerCase() == right.toString().toLowerCase()) return true; break;
			case "-ne": if (left !== right) return true; break;
			case "-nei": if (left.toString().toLowerCase() !== right.toString().toLowerCase()) return true; break;
			case "-inc": if (left.toString().toLowerCase().indexOf(right.toString().toLowerCase()) >= 0) return true; break;
			case "-ninc": if (left.toString().toLowerCase().indexOf(right.toString().toLowerCase()) < 0) return true; break;
			case "-csinc": if (left.toString().indexOf(right.toString()) >= 0) return true; break;
			case "-csninc": if (left.toString().indexOf(right.toString()) < 0) return true; break;
		}
		return false;
	}

	function replaceStyleInformation(outputLine, cardParmeters) {
		var styleList = [
			"tableborder", "tablebgcolor", "tableborderradius", "tableshadow", "titlecardbackground", "titlecardbottomborder",
			"titlefontsize", "titlefontlineheight", "titlefontcolor", "bodyfontsize", "subtitlefontsize", "subtitlefontcolor", "titlefontshadow",
			"titlefontface", "bodyfontface", "subtitlefontface", "buttonbackground", "buttonpadding", "buttonbackgroundimage", "buttontextcolor", "buttonbordercolor",
			"dicefontcolor", "dicefontsize", "lineheight", "buttonfontsize", "buttonfontface", "titlecardbackgroundimage", "bodybackgroundimage",
			"rollhilightlineheight", "rollhilightcolornormal", "rollhilightcolorfumble", "rollhilightcolorcrit", "rollhilightcolorboth",
			"titlefontweight", "titlefontstyle"
		];

		for (var x = 0; x < styleList.length; x++) {
			outputLine = outputLine.replace(new RegExp("!{" + styleList[x] + "}", "g"), cardParmeters[styleList[x]].replace(/\"/g, "'"));
		}
		return outputLine;
	}

	function processInlineFormatting(outputLine, cardParameters, raw) {
		if (cardParameters.disableinlineformatting !== "0") { return outputLine; }
		outputLine = outputLine.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
		outputLine = outputLine.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
		outputLine = outputLine.replace(/\[br\]/gi, "<br />");
		outputLine = outputLine.replace(/\[tr(.*?)\]/gi, `<tr ${FillTemplateStyle("tablestyle", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/tr\]/gi, "</tr>");
		outputLine = outputLine.replace(/\[td(.*?)\]/gi, `<td ${FillTemplateStyle("tdstyle", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/td\]/gi, "</td>");
		outputLine = outputLine.replace(/\[th(.*?)\]/gi, `<th ${FillTemplateStyle("thstyle", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/th\]/gi, `</th>`);
		outputLine = outputLine.replace(/\[h1(.*?)\]/gi, `<h1 ${FillTemplateStyle("h1style", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/h1\]/gi, `</h1>`);
		outputLine = outputLine.replace(/\[h2(.*?)\]/gi, `<h2 ${FillTemplateStyle("h2style", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/h2\]/gi, `</h2>`);
		outputLine = outputLine.replace(/\[h3(.*?)\]/gi, `<h3 ${FillTemplateStyle("h3style", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/h3\]/gi, `</h3>`);
		outputLine = outputLine.replace(/\[h4(.*?)\]/gi, `<h4 ${FillTemplateStyle("h4style", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/h4\]/gi, `</h4>`);
		outputLine = outputLine.replace(/\[h5(.*?)\]/gi, `<h5 ${FillTemplateStyle("h5style", cardParameters, raw)} $1>`);
		outputLine = outputLine.replace(/\[\/h5\]/gi, `</h5>`);
		outputLine = outputLine.replace(/\[t\s+?(.*?)\]/gi, "<table $1>");
		outputLine = outputLine.replace(/\[t\]/gi, "<table>");
		outputLine = outputLine.replace(/\[\/t\]/gi, "</table>");
		outputLine = outputLine.replace(/\[p\s+?(.+?)\]/gi, "<p $1>");
		outputLine = outputLine.replace(/\[p\]/gi, "<p>");
		outputLine = outputLine.replace(/\[\/p\]/gi, "</p>");
		outputLine = outputLine.replace(/\[[Ff](\d+)\](.*?)\[\/F\]/gi, "<div style='font-size:$1px;'>$2</div>"); // [F8] for font size 8
		outputLine = outputLine.replace(/\[[Ff]\:([a-zA-Z\s]*)\:?(\d+)?\](.*?)\[\/[Ff]\]/gi, "<span style='font-family:$1; font-size:$2px'>$3</span>"); // [F8] for font size 8
		outputLine = outputLine.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
		outputLine = outputLine.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
		outputLine = outputLine.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
		outputLine = outputLine.replace(/\[[Ss]\](.*?)\[\/[Ss]\]/g, "<s>$1</s>"); // [S]...[/s] for strikethru
		outputLine = outputLine.replace(/\[[Qq]\](.*?)\[\/[Qq]\]/g, "<blockquote style='margin-left:10px';>$1</blockquote>"); // [S]...[/s] for strikethru
		outputLine = outputLine.replace(/\[[Cc]\](.*?)\[\/[Cc]\]/g, "<div style='text-align: center; display:block;'>$1</div>"); // [C]..[/C] for center
		outputLine = outputLine.replace(/\[[Ll]\](.*?)\[\/[Ll]\]/g, "<div style='text-align: left;'>$1</div>"); // [L]..[/L] for left
		outputLine = outputLine.replace(/\[[Rr]\](.*?)\[\/[Rr]\]/g, "<div style='text-align: right; float: right;'>$1</div><div style='clear: both;'></div>"); // [R]..[/R] for right
		outputLine = outputLine.replace(/\[[Jj]\](.*?)\[\/[Jj]\]/g, "<div style='text-align: justify; display:block;'>$1</div>"); // [J]..[/J] for justify

		var fakerolls = outputLine.match(/(\[roll(.*?)\](.*?)\[\/roll\])/gi)
		for (let fakeroll in fakerolls) {
			var base = fakerolls[fakeroll].replace(/\[roll(.*?)\]/, "").replace(/\[\/roll(.*?)\]/, "")
			let style = cardParameters.stylenormal
			if (fakerolls[fakeroll].substring(5, 7).toLowerCase() == ":c") {
				style = cardParameters.stylecrit
			}
			if (fakerolls[fakeroll].substring(5, 7).toLowerCase() == ":f") {
				style = cardParameters.stylefumble
			}
			var work = buildTooltip(base, "Roll: " + base + "<br /><br />Result: " + base, style)
			outputLine = outputLine.replace(fakerolls[fakeroll], work)
		}

		var images = outputLine.match(/(\[img(.*?)\](.*?)\[\/img\])/gi);
		for (var image in images) {
			var work = images[image].replace("[img", "<img").replace("[/img]", "></img>").replace("]", " src=");
			outputLine = outputLine.replace(images[image], work);
		}
		var webms = outputLine.match(/(\[webm(.*?)\](.*?)\[\/webm\])/gi);
		for (var webm in webms) {
			var work = webms[webm].replace("[webm]", "<video autoplay loop width=100% &#115;&#114;&#99;='").replace("[/webm]", "' type=video/webm></video>");
			outputLine = outputLine.replace(webms[webm], work);
		}
		var statusmarkers = outputLine.match(/\[sm(.*?)\](.*?)\[\/sm\]/gi);
		for (var sm in statusmarkers) {
			var markername = statusmarkers[sm].substring(statusmarkers[sm].indexOf("]") + 1);
			markername = markername.substring(0, markername.indexOf("["));
			var work = statusmarkers[sm].replace("[sm", "<img ").replace("[/sm]", "></img>").replace("]", " src=" + tokenMarkerURLs[markername]);
			outputLine = outputLine.replace(statusmarkers[sm], work);
		}
		var buttons = outputLine.match(/\[button(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:([0-9]{1,})PX)?(\:(.*?))?\](.*?)\:\:(.*?)\[\/button\]/gi);
		for (var button in buttons) {
			var customTextColor = undefined;
			var customBackgroundColor = undefined;
			var customfontsize = undefined;
			let customHoverText = undefined;
			var basebutton = buttons[button].replace(/\[button(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:([0-9]{1,})PX)?(\:.+?)?\]/gi, "[button]");
			//log(basebutton);
			if (basebutton.toLowerCase() !== buttons[button].toLowerCase()) {
				var tempbutton = buttons[button].replace("[button:", "").replace("[Button:", "").replace("[BUTTON:", "").split("]")[0];
				var customs = tempbutton.split(":");
				var firstColorUsed = false;
				for (var c in customs) {
					if (customs[c].startsWith("#")) {
						if (firstColorUsed) { customBackgroundColor = customs[c]; } else { customTextColor = customs[c]; firstColorUsed = true; }
					} else {
						if (customs[c].toLowerCase().endsWith("px")) {
							customfontsize = customs[c];
						} else {
							if (customs[c] !== "[rbutton") customHoverText = customs[c];
						}
					}
				}
			}
			var title = basebutton.split("::")[0].replace("[button]", "").replace("[Button]", "").replace("[BUTTON]", "");
			var action = basebutton.split("::")[1].replace("[/button]", "").replace("[/Button]", "").replace("[/BUTTON]", "");
			if (cardParameters.dontcheckbuttonsforapi == "0") {
				action = action.replace(/(^|\ +)_/g, " --");
			}
			if (raw == true) {
				outputLine = outputLine.replace(buttons[button], makeTemplateButton(title, action, cardParameters));
			} else {
				outputLine = outputLine.replace(buttons[button], makeButton(title, action, cardParameters, customTextColor, customBackgroundColor, customfontsize, customHoverText));
			}
		}

		var sheetbuttons = outputLine.match(/\[sheetbutton(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:([0-9]{1,})PX)?(\:(.*?))?\](.*?)\:\:(.*?)\:\:(.*?)\[\/sheetbutton\]/gi);
		for (var button in sheetbuttons) {
			var customTextColor = undefined;
			var customBackgroundColor = undefined;
			var customfontsize = undefined;
			let customHoverText = undefined;
			var basebutton = sheetbuttons[button].replace(/\[sheetbutton(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:([0-9]{1,})PX)?(\:.+?)?\]/gi, "[sheetbutton]");
			if (basebutton.toLowerCase() !== sheetbuttons[button].toLowerCase()) {
				var tempbutton = sheetbuttons[button].replace("[sheetbutton:", "").replace("[Sheetbutton:", "").replace("[SHEETBUTTON:", "").split("]")[0];
				var customs = tempbutton.split(":");
				var firstColorUsed = false;
				for (var c in customs) {
					if (customs[c].startsWith("#")) {
						if (firstColorUsed) { customBackgroundColor = customs[c]; } else { customTextColor = customs[c]; firstColorUsed = true; }
					} else {
						if (customs[c].toLowerCase().endsWith("px")) {
							customfontsize = customs[c];
						} else {
							if (customs[c] !== "[rbutton") customHoverText = customs[c];
						}
					}
				}
			}
			var title = basebutton.split("::")[0].replace("[sheetbutton]", "").replace("[Sheetbutton]", "").replace("[SHEETBUTTON]", "");
			var actor = "";
			var tryID = basebutton.split("::")[1];
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
				// eslint-disable-next-line no-unused-vars
				var possible = findObjs({ type: "character" }).filter(function (value, index, arg) { return value.get("name").toLowerCase().trim() == tryID.toLowerCase().trim() });
				if (possible.length > 0) {
					actor = possible[0].get("_id");
				}
			}
			if (actor !== "") {
				var action = "~" + actor + "|" + basebutton.split("::")[2].replace("[/sheetbutton]", "").replace("[/Sheetbutton]", "").replace("[/SHEETBUTTON]", "");
				if (cardParameters.dontcheckbuttonsforapi == "0") {
					action = action.replace(/(^|\ +)_/g, " --");
				}
				if (raw == true) {
					outputLine = outputLine.replace(sheetbuttons[button], makeTemplateButton(title, action, cardParameters));
				} else {
					outputLine = outputLine.replace(sheetbuttons[button], makeButton(title, action, cardParameters, customTextColor, customBackgroundColor, customfontsize, customHoverText));
				}
			}
		}

		var reentrantbuttons = outputLine.match(/\[rbutton(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:([0-9]{1,})PX)?(\:(.*?))?\](.*?)\:\:(.*?)\[\/rbutton\]/gi);
		for (var button in reentrantbuttons) {
			var customTextColor = undefined;
			var customBackgroundColor = undefined;
			var customfontsize = undefined;
			var customHoverText = undefined;
			var basebutton = reentrantbuttons[button].replace(/\[rbutton(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}))?(\:([0-9]{1,})PX)?(\:.+?)?\]/gi, "[rbutton]");
			if (basebutton.toLowerCase() !== reentrantbuttons[button].toLowerCase()) {
				var tempbutton = reentrantbuttons[button].replace("[rbutton:", "").replace("[Rbutton:", "").replace("[RBUTTON:", "").split("]")[0];
				var customs = tempbutton.split(":");
				var firstColorUsed = false;
				for (var c in customs) {
					if (customs[c].startsWith("#")) {
						if (firstColorUsed) { customBackgroundColor = customs[c]; } else { customTextColor = customs[c]; firstColorUsed = true; }
					} else {
						if (customs[c].toLowerCase().endsWith("px")) {
							customfontsize = customs[c];
						} else {
							if (customs[c] !== "[rbutton") customHoverText = customs[c];
						}
					}
				}
			}
			var title = basebutton.split("::")[0].replace("[rbutton]", "").replace("[Rbutton]", "").replace("[RBUTTON]", "");
			var reentrylabel = basebutton.split("::")[1].replace("[/rbutton]", "").replace("[/Rbutton]", "").replace("[/RBUTTON]", "");
			var action = "!sc-reentrant " + cardParameters["reentrant"] + "-|-" + reentrylabel
			if (raw == true) {
				outputLine = outputLine.replace(reentrantbuttons[button], makeTemplateButton(title, action, cardParameters));
			} else {
				outputLine = outputLine.replace(reentrantbuttons[button], makeButton(title, action, cardParameters, customTextColor, customBackgroundColor, customfontsize, customHoverText));
			}
		}

		//DiceFont Stuff
		var dicefontchars = diceLetters;
		if (cardParameters.usehollowdice !== "0") { dicefontchars = dicefontchars.toLowerCase(); }
		outputLine = outputLine.replace(/\[d4\](.*?)\[\/d4\]/g, function (x) { var side = parseInt(x.replace("[d4]", "").replace("[/d4]", "").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd4;'>" + dicefontchars.charAt(side) + "</span>" });
		outputLine = outputLine.replace(/\[d6\](.*?)\[\/d6\]/g, function (x) { var side = parseInt(x.replace("[d6]", "").replace("[/d6]", "").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd6;'>" + dicefontchars.charAt(side) + "</span>" });
		outputLine = outputLine.replace(/\[d8\](.*?)\[\/d8\]/g, function (x) { var side = parseInt(x.replace("[d8]", "").replace("[/d8]", "").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd8;'>" + dicefontchars.charAt(side) + "</span>" });
		outputLine = outputLine.replace(/\[d10\](.*?)\[\/d10\]/g, function (x) { var side = parseInt(x.replace("[d10]", "").replace("[/d10]", "").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd10;'>" + dicefontchars.charAt(side) + "</span>" });
		outputLine = outputLine.replace(/\[d12\](.*?)\[\/d12\]/g, function (x) { var side = parseInt(x.replace("[d12]", "").replace("[/d12]", "").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd12;'>" + dicefontchars.charAt(side) + "</span>" });
		outputLine = outputLine.replace(/\[d20\](.*?)\[\/d20\]/g, function (x) { var side = parseInt(x.replace("[d20]", "").replace("[/d20]", "").trim()); return "<span style='color: !{dicefontcolor}; font-size:!{dicefontsize}; font-family: dicefontd20;'>" + dicefontchars.charAt(side) + "</span>" });

		return outputLine;
	}

	function makeButton(title, url, parameters, customTextColor, customBackgroundColor, customfontsize, customHoverText) {
		var thisButtonStyle = buttonStyle;
		let thisHoverText = "";
		if (customTextColor) { thisButtonStyle = thisButtonStyle.replace("!{buttontextcolor}", customTextColor) }
		if (customBackgroundColor) { thisButtonStyle = thisButtonStyle.replace("!{buttonbackground}", customBackgroundColor) }
		if (customfontsize) { thisButtonStyle = thisButtonStyle.replace("!{buttonfontsize}", customfontsize) }
		if (customHoverText) { thisHoverText = ` title="${customHoverText}" ` }
		return `<a style="${replaceStyleInformation(thisButtonStyle, parameters)}" ${thisHoverText}" href="${removeTags(removeBRs(url))}">${removeBRs(title)}</a>`;
	}

	function makeTemplateButton(title, url, parameters) {
		if (parameters.overridetemplate !== "none") {
			return `<a ${templates[parameters.overridetemplate].buttonstyle} href="${removeTags(removeBRs(url))}">${removeBRs(title)}</a>`;
		} else {
			return "Template button without Template"
		}
	}

	function removeInlineRolls(text, cardParameters) {
		if (cardParameters.allowinlinerollsinoutput !== "0") { return text; }
		return text.replace(/\[\[/g, " ").replace(/\]\]/g, " ");
	}

	function fillCharAttrs(attrs) {
		if (!attrs) { return; }
		repeatingCharAttrs = {};
		attrs.forEach(function (x) {
			repeatingCharAttrs[x.get("name")] = x.get("current");
		});
	}

	function getRepeatingSectionIDs(charid, prefix) {
		const repeatingAttrs = {};
		regExp = new RegExp(`^${prefix}_(-[-A-Za-z0-9]+?|\\d+)_`);
		let repOrder;
		// Get attributes
		findObjs({
			_type: 'attribute',
			_characterid: charid
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

	function getSectionAttrs(charid, entryname, sectionname, searchtext, fuzzy) {
		var return_set = [];
		var char_attrs = findObjs({ type: "attribute", _characterid: charid });
		try {
			if (!fuzzy) {
				var action_prefix = char_attrs
					.filter(function (z) {
						return (z.get("name").startsWith(sectionname) && z.get("name").endsWith(searchtext))
					})
					.filter(entry => entry.get("current") == entryname)[0]
					.get("name").slice(0, -searchtext.length);
			} else {
				var thisRegex = new RegExp(entryname, "i")
				var action_prefix = char_attrs
					.filter(function (z) {
						return (z.get("name").startsWith(sectionname) && z.get("name").match(searchtext))
					})
					.filter(entry => entry.get("current").match(thisRegex))[0]
					.get("name").slice(0, -searchtext.length);
			}
		} catch {
			return return_set;
		}

		try {
			action_attrs = char_attrs.filter(function (z) { return (z.get("name").startsWith(action_prefix)); })
		} catch {
			return return_set;
		}

		action_attrs.forEach(function (z) {
			if (z.get("name")) {
				return_set.push(z.get("name").toString().replace(action_prefix, "") + "|" + z.get("current").toString().replace(/(?:\r\n|\r|\n)/g, "<br>").replace("@{", "").replace("}", ""));
				return_set.push(z.get("name").toString().replace(action_prefix, "") + "_max|" + z.get("max").toString());
			}
		})

		var PrefixEntry = "xxxActionIDxxxx|" + action_prefix.replace(sectionname + "_", "");
		PrefixEntry = PrefixEntry.substring(0, PrefixEntry.length - 1);

		return_set.unshift(PrefixEntry);

		return (return_set);
	}

	function getSectionAttrsByID(charid, sectionname, sectionID) {
		var return_set = [];
		var action_prefix = sectionname + "_" + sectionID + "_";

		try {
			var action_attrs = findObjs({ type: "attribute", _characterid: charid })
			action_attrs = action_attrs.filter(function (z) { return (z.get("name").startsWith(action_prefix)); })
		} catch {
			return return_set;
		}

		action_attrs.forEach(function (z) {
			try {
				return_set.push(z.get("name").replace(action_prefix, "") + "|" + z.get("current").toString().replace(/(?:\r\n|\r|\n)/g, "<br>"));//.replace(/[\[\]\@]/g, " "));
				return_set.push(z.get("name").replace(action_prefix, "") + "_max|" + z.get("max").toString());
				// eslint-disable-next-line no-empty
			} catch { log(`Attribute lookup error parsing ${z.get("name'")}`) }
		})
		return (return_set);
	}

	function rollOnRollableTable(tableName) {
		var theTable = findObjs({ type: "rollabletable", name: tableName })[0];
		if (theTable != null) {
			var tableItems = findObjs({ type: "tableitem", _rollabletableid: theTable.id });
			if (tableItems != null) {
				var rollResults = {};
				var rollIndex = 0;
				var lastRollIndex = 0;
				var itemCount = 0;
				var maxRoll = 0;
				var nonOneWeights = 0;
				tableItems.forEach(function (item) {
					try {
						var thisWeight = parseInt(item.get("weight"));
						if (isNaN(thisWeight)) { thisWeight = 1 }
						if (thisWeight !== 1) { nonOneWeights += 1; }
						rollIndex += thisWeight;
						for (var x = lastRollIndex + 1; x <= rollIndex; x++) {
							rollResults[x] = itemCount;
						}
						itemCount += 1;
						maxRoll += thisWeight;
						lastRollIndex += thisWeight;
					} catch {
						log(`ScriptCards: Exception attempting to get rollable table item information`)
					}
				});
				var tableRollResult = randomInteger(maxRoll);
				try {
					if (nonOneWeights == 0) {
						return [tableItems[rollResults[tableRollResult]].get("name"), tableItems[rollResults[tableRollResult]].get("avatar"), tableRollResult];
					} else {
						return [tableItems[rollResults[tableRollResult]].get("name"), tableItems[rollResults[tableRollResult]].get("avatar"), 0];
					}
				} catch {
					log(`ScriptCards: Exception while reading table results for table item ${tableRollResult}`)
					return "", ""
				}
			} else {
				return ["", ""];
			}
		}
	}

	function loadLibraryHandounts() {
		ScriptCardsLibrary = {};
		var handouts = filterObjs(function (obj) {
			if (obj.get("type") == "handout" && obj.get("name").startsWith("ScriptCards Library")) { return true; } else { return false; }
		});
		if (handouts) {
			handouts.forEach(function (handout) {
				var libraryName = handout.get("name").replace("ScriptCards Library", "").trim();
				//var libraryContent = "";
				handout.get("notes", function (notes) {
					if (notes) {
						notes = notes.replace(/\<p\>/g, " ").replace(/\<\/p\>/g, " ").replace(/\<br\>/g, " ").replace(/&nbsp;/g, " ").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
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
		for (var x = 0; x < libs.length; x++) {
			if (ScriptCardsLibrary[libs[x]]) {
				cardContent += ScriptCardsLibrary[libs[x]];
			}
		}
		cardContent += " }}";
		return cardContent;
	}

	function stashAScript(stashIndex, scriptContent, cardParameters, stringVariables, rollVariables, returnStack, parameterStack, programCounter, outputLines, resultStringName, stashType, arrayVariables, arrayIndexes, gmonlyLines, bareoutputLines) {
		if (scriptCardsStashedScripts[stashIndex]) { delete scriptCardsStashedScripts[stashIndex]; }

		scriptCardsStashedScripts[stashIndex] = {};
		scriptCardsStashedScripts[stashIndex].scriptContent = JSON.stringify(scriptContent);
		scriptCardsStashedScripts[stashIndex].cardParameters = JSON.stringify(cardParameters);
		scriptCardsStashedScripts[stashIndex].stringVariables = JSON.stringify(stringVariables);
		scriptCardsStashedScripts[stashIndex].rollVariables = JSON.stringify(rollVariables);
		scriptCardsStashedScripts[stashIndex].arrayVariables = JSON.stringify(arrayVariables);
		scriptCardsStashedScripts[stashIndex].arrayIndexes = JSON.stringify(arrayIndexes);
		scriptCardsStashedScripts[stashIndex].hashTables = JSON.stringify(hashTables);
		scriptCardsStashedScripts[stashIndex].returnStack = JSON.stringify(returnStack);
		scriptCardsStashedScripts[stashIndex].parameterStack = JSON.stringify(parameterStack);
		scriptCardsStashedScripts[stashIndex].outputLines = JSON.stringify(outputLines);
		scriptCardsStashedScripts[stashIndex].gmonlyLines = JSON.stringify(gmonlyLines);
		scriptCardsStashedScripts[stashIndex].bareoutputLines = JSON.stringify(bareoutputLines);
		scriptCardsStashedScripts[stashIndex].repeatingSectionIDs = JSON.stringify(repeatingSectionIDs);
		scriptCardsStashedScripts[stashIndex].repeatingSection = JSON.stringify(repeatingSection);
		scriptCardsStashedScripts[stashIndex].repeatingCharAttrs = JSON.stringify(repeatingCharAttrs);
		scriptCardsStashedScripts[stashIndex].repeatingCharID = repeatingCharID;
		scriptCardsStashedScripts[stashIndex].repeatingSectionName = repeatingSectionName;
		scriptCardsStashedScripts[stashIndex].repeatingIndex = repeatingIndex;
		scriptCardsStashedScripts[stashIndex].programCounter = programCounter;
		scriptCardsStashedScripts[stashIndex].resultStringName = resultStringName;
		scriptCardsStashedScripts[stashIndex].loopControl = loopControl;
		scriptCardsStashedScripts[stashIndex].loopStack = loopStack;
		scriptCardsStashedScripts[stashIndex].stashType = stashType;
	}

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	function isNumeric(n) {
		return !isNaN(parseInt(n));
	}

	function isNumber(n) {
		return !isNaN(Number(n));
	}

	// Despite the name, this function takes a semicolon separated value string and returns an
	// array of objects. Used to parse parameter lists to gosub branches.
	function CSVtoArray(text) {
		var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s\\]*(?:\s+[^;'"\s\\]+)*)\s*(?:;\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s]*(?:\s+[^;'"\s\\]+)*)\s*)*$/;
		var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^;'"\s]*(?:\s+[^;'"\s\\]+)*))\s*(?:;|$)/g;
		// Return NULL if input string is not well formed CSV string.
		if (!re_valid.test(text)) {
			log(`ScriptCards Error: Parameter content is not valid. Do you have unescaped quotes or qoutes not surrounding escaped values? (${text})`)
			return null;
		}

		var a = []; // Initialize array to receive values.
		text.replace(re_value, // "Walk" the string using replace with callback.
			function (m0, m1, m2, m3) {

				// Remove backslash from \' in single quoted values.
				if (m1 != null) a.push(m1.replace(/\\'/g, "'"));

				// Remove backslash from \" in double quoted values.
				else if (m2 != null) a.push(m2.replace(/\\"/g, '"'));
				else if (m3 != null) a.push(m3);
				return ''; // Return empty string.
			});

		// Handle special case of empty last value.
		if (/,\s*$/.test(text)) a.push('');
		return a;
	}

	// ScriptCards doesn't directly support inline rolls, but there are cases where some sheets
	// are so strange that an inline roll is required to retrieve simple values. This routine
	// is run before processing script lines and replaces the inline roll markers with their
	// final values as literal strings.
	function processInlinerolls(msg) {
		if (_.has(msg, 'inlinerolls')) {
			return _.chain(msg.inlinerolls)
				.reduce(function (m, v, k) {
					var ti = _.reduce(v.results.rolls, function (m2, v2) {
						if (_.has(v2, 'table')) {
							m2.push(_.reduce(v2.results, function (m3, v3) {
								m3.push(v3.tableItem.name);
								return m3;
							}, []).join(', '));
						}
						return m2;
					}, []).join(', ');
					m['$[[' + k + ']]'] = (ti.length && ti) || v.results.total || 0;
					return m;
				}, {})
				.reduce(function (m, v, k) {
					return m.replace(k, v);
				}, msg.content)
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
		if ((str === null) || (str === ''))
			return false;
		else
			return str.toString().replace(/(<([^>]+)>)/ig, '');
	}

	function removeBRs(str) {
		if ((str === null) || (str === '') || (str === undefined))
			return false;
		else
			return str.toString().replace(/<br \/\>/ig, '').replace(/<br\/\>/ig, '');
	}

	var playJukeboxTrack = function (trackname) {
		var track = findObjs({ type: 'jukeboxtrack', title: trackname })[0];
		if (track) {
			track.set('softstop', false);
			track.set('playing', true);
		} else {
			log(`ScriptCards warning: Jukebox track ${trackname} not found in game.`);
		}
	}

	// eslint-disable-next-line no-unused-vars
	function handleDiceFormats(text, rollResult, hadOne, hadAce, currentOperator) {
		// Split the dice roll into components
		var matches = text.toLowerCase().match(/^(\d+[dDuUmM][fF\d]+)([eE])?([kK][lLhH]\d+)?([rR][<\>]\d+)?([rR][oO][<\>]\d+)?(![HhLl])?(![<\>]\d+)?(!)?([Ww][Ss][Xx])?([Ww][Ss])?([Ww][Xx])?([Ww])?([\><]\d+)?(f\<\d+)?(\#)?$/);

		var resultSet = {
			rollSet: [],
			rollTextSet: [],
			rollText: "",
			rollTotal: 0,
			hadOne: false,
			hadAce: false,
			dontHilight: false,
			highlightasfailure: false,
			dontBase: false,
			sides: 6,
			rawRollSet: [],
			droppedRollSet: [],
			keptRollSet: [],
			diceFontSet: []
		};

		// Just some defaults
		var count = 1;
		var sides = 6;
		var fudgeDice = false;
		var fudgeText = ["-", "0", "+"];
		var keeptype = "a";
		var keepcount = count;
		var rerollThreshold = undefined;
		var rerollType = "x";
		var rerollUnlimited = true;
		var rollUnique = false;
		var explodeValue = 0;
		var isWildDie = false;
		var minRollValue = 1;
		var wildDieDropSelf = false;
		var wildDieDropHighest = false;
		var successThreshold = 0;
		var failureThreshold = 0;

		if (matches) {
			for (var x = 1; x < matches.length; x++) {
				if (matches[x]) {

					// Handle XdY
					if (matches[x].match(/^\d+[dD][fF\d]+$/)) {
						count = matches[x].split("d")[0]
						keepcount = count;
						sides = matches[x].split("d")[1]
						if (sides == "f") { sides = 3; fudgeDice = true; }
					}

					// Handle XmY (X dice, always returning the highest possible (sides) roll value)
					if (matches[x].match(/^\d+[mM]\d+$/)) {
						count = matches[x].split("m")[0]
						keepcount = count;
						sides = matches[x].split("m")[1]
						minRollValue = Number(sides);
						if (sides == "f") { sides = 3; fudgeDice = true; }
						log(`ScriptCards: Player ${lastExecutedDisplayName}(${lastExecutedByID}) used an XmY dice formula in a roll: ${text}`)
					}

					// Handle XuY (Roll XdY dice, always getting a unique value on the roll)
					if (matches[x].match(/^\d+[uU]\d+$/)) {
						count = matches[x].split("u")[0]
						keepcount = count;
						sides = matches[x].split("u")[1]
						if (parseInt(keepcount) > parseInt(sides)) { keepcount = sides; count = sides; log(`ScriptCards: Attempt to roll more than ${sides} unique d${sides}`) }
						rollUnique = true;
					}

					// Handle keep highest/lowest
					if (matches[x].match(/^[kK][lLhH]\d+$/)) {
						keeptype = matches[x].charAt(1);
						keepcount = Number(matches[x].substring(2));
					}

					// Handle keep furthest from center (rolling with emphasis)
					if (matches[x].match(/^[eE]$/)) {
						keeptype = "e";
						keepcount = 1;
					}

					// Handle reroll thresholds (r>Z, r<Z)
					if (matches[x].match(/^[rR][\<\>]\d+$/)) {
						rerollType = matches[x].charAt(1);
						rerollThreshold = Number(matches[x].substring(2));
						rerollUnlimited = true;
					}

					// Handle reroll once (ro>Z, ro<Z)
					if (matches[x].match(/^[rR][oO][\<\>]\d+$/)) {
						rerollType = matches[x].charAt(2);
						rerollThreshold = Number(matches[x].substring(3));
						rerollUnlimited = false;
					}

					// Handle exploding dice (!h or !l)
					if (matches[x].match(/^![HhLl]$/)) {
						keepcount = 1;
						if (matches[x].charAt(1) == "h") {
							explodeValue = sides;
							keeptype = "h";
						} else {
							explodeValue = 1;
							keeptype = "h";
						}
					}

					// Handle exploding dice without rerolls
					if (matches[x].match(/^![\<\>]\d+$/)) {
						explodeValue = Number(matches[x].substring(2));
					}

					// Handle exploding dice
					if (matches[x].match(/^!$/)) {
						explodingType = "h";
						explodeValue = sides;
					}

					// Handle counting successes
					if (matches[x].match(/^[\><]\d+/)) {
						successThreshold = Number(matches[x].substring(1));
					}

					// Handle failure counting
					if (matches[x].match(/^f[\><]\d+/)) {
						failureThreshold = Number(matches[x].substring(2));
					}

					// Handle Wild Dice
					if (matches[x].match(/^([Ww])?([Xx])?([Ss])?([Xx])?$/)) {
						isWildDie = true;
						count--;
						if (matches[x].indexOf("s") > 0) {
							wildDieDropSelf = true;
						}
						if (matches[x].indexOf("x") > 0) {
							wildDieDropHighest = true;
						}
					}

					// Handle counting successes
					if (matches[x].match(/^\#$/)) {
						resultSet.dontHilight = true;
						resultSet.dontBase = true;
					}
				}
			}

			resultSet.sides = sides;

			// Roll the dice
			for (var x = 0; x < count; x++) {
				do {
					var thisDiceRoll = rollWithReroll(sides, rerollThreshold, rerollType, rerollUnlimited);
					var thisRoll = Number(thisDiceRoll[1]);
				} while (resultSet.rollSet.includes(thisRoll) && rollUnique)
				if (Number(minRollValue) > 1) {
					thisRoll = Number(minRollValue);
					thisDiceRoll[0] = sides.toString() + ` {MIN ${minRollValue}}`;
				}
				if (fudgeDice) { thisRoll -= 2; resultSet.dontHilight = true }
				var thisTotal = thisRoll;
				//var thisText = thisTotal.toString();
				var thisText = thisDiceRoll[0];
				if (fudgeDice) {
					thisText = fudgeText[thisRoll + 1];
				}
				while ((explodeValue > 0) && (thisRoll >= explodeValue)) {
					thisReroll = rollWithReroll(sides, rerollThreshold, rerollType, rerollUnlimited);
					thisRoll = Number(thisReroll[1]);
					thisTotal += Number(thisReroll[1]);
					thisText += "!" + thisReroll[0].toString();
				}
				resultSet.rollSet.push(thisTotal);
				resultSet.rawRollSet.push(thisTotal);
				resultSet.rollTextSet.push(thisText);
				switch (sides) {
					case 20: rollSet.diceFontSet.push("[d20]thisTotal[/d20]"); break;
					case 12: rollSet.diceFontSet.push("[d12]thisTotal[/d12]"); break;
					case 10: rollSet.diceFontSet.push("[d10]thisTotal[/d10]"); break;
					case 8: rollSet.diceFontSet.push("[d8]thisTotal[/d8]"); break;
					case 6: rollSet.diceFontSet.push("[d6]thisTotal[/d6]"); break;
					case 4: rollSet.diceFontSet.push("[d4]thisTotal[/d4]"); break;
				}
			}

			// If we are keeping highest or lowest number of dice, eliminate the ones to remove
			if (keepcount !== count) {
				var removeCount = count - keepcount;
				for (var x = 0; x < removeCount; x++) {
					if (keeptype == "h") { removeLowestRoll(resultSet.rollSet, resultSet.rollTextSet, resultSet.droppedRollSet) }
					if (keeptype == "l") { removeHighestRoll(resultSet.rollSet, resultSet.rollTextSet, resultSet.droppedRollSet) }
					if (keeptype == "e") { removeClosestRolls(resultSet.rollSet, resultSet.rollTextSet, resultSet.droppedRollSet, sides / 2) }
				}
				for (var x = 0; x < count; x++) {
					if (!resultSet.rollTextSet[x].startsWith("[x")) {
						resultSet.keptRollSet.push(resultSet.rollSet[x]);
					}
				}
			} else {
				resultSet.keptRollSet.push(...resultSet.rollSet);
			}

			// Handle the Wild Die if present
			if (isWildDie) {
				var thisRoll = randomInteger(sides);
				var thisTotal = thisRoll;
				var thisText = thisTotal.toString();
				while (thisRoll == sides) {
					thisRoll = randomInteger(sides);
					thisTotal += thisRoll;
					thisText += "!" + thisRoll.toString();
				}
				if (thisTotal == 1) { resultSet.hadOne = true; }
				if (thisTotal >= sides) { resultSet.hadAce = true; }
				if (thisTotal == 1 && wildDieDropHighest) { removeHighestRoll(resultSet.rollSet, resultSet.rollTextSet) }
				if (thisTotal > 1 || !wildDieDropSelf) {
					thisText = "W:" + thisText;
				} else {
					thisText = "W:[x" + thisText + "x]";
				}
				resultSet.rollSet.push(thisTotal);
				resultSet.rollTextSet.push(thisText);
				resultSet.dontHilight = true;
			}
		}

		// Compute the totals for the roll
		var thisResult = 0;
		var thisResultText = "";
		if (successThreshold == 0) {
			for (var x = 0; x < resultSet.rollSet.length; x++) {
				thisResult += resultSet.rollSet[x];
				thisResultText += resultSet.rollTextSet[x] + (x == resultSet.rollSet.length - 1 ? "" : ",");
			}
		} else {
			for (var x = 0; x < resultSet.rollSet.length; x++) {
				if (resultSet.rollSet[x] > successThreshold) {
					thisResult += 1
				}
				if (failureThreshold > 0 && resultSet.rollSet[x] < failureThreshold) {
					thisResult -= 1
					resultSet.highlightasfailure = true
				}
				thisResultText += resultSet.rollTextSet[x] + (x == resultSet.rollSet.length - 1 ? "" : ",");
			}
			resultSet.dontHilight = true;
		}
		resultSet.rollTotal = thisResult;
		resultSet.rollText = thisResultText;

		return resultSet;
	}

	function rollWithReroll(sides, rerollThreshold, rType, unlimited) {
		var thisRoll = randomInteger(sides);
		var rollText = "";
		var once = false;
		while (rType == ">" && (unlimited || !once) && thisRoll >= rerollThreshold) { rollText += `[x${thisRoll}x]`; thisRoll = randomInteger(sides); once = true; }
		while (rType == "<" && (unlimited || !once) && thisRoll <= rerollThreshold) { rollText += `[x${thisRoll}x]`; thisRoll = randomInteger(sides); once = true; }
		rollText += thisRoll;
		return [rollText, thisRoll]
	}

	function removeHighestRoll(rollSet, rollSetText, droppedRollSet) {
		var highest = -1;
		var highestIndex = -1;
		for (var x = 0; x < rollSet.length; x++) {
			if (rollSet[x] > highest) {
				highest = rollSet[x];
				highestIndex = x;
			}
		}
		if (highestIndex > -1) {
			droppedRollSet.push(rollSet[highestIndex]);
			rollSet[highestIndex] = 0;
			rollSetText[highestIndex] = "[x" + rollSetText[highestIndex] + "x]"
		}
	}

	function removeLowestRoll(rollSet, rollSetText, droppedRollSet) {
		var lowest = Number.MAX_SAFE_INTEGER;
		var lowestIndex = -1;
		for (var x = 0; x < rollSet.length; x++) {
			if (rollSet[x] < lowest && rollSet[x] > 0) {
				lowest = rollSet[x];
				lowestIndex = x;
			}
		}
		if (lowestIndex > -1) {
			droppedRollSet.push(rollSet[lowestIndex]);
			rollSet[lowestIndex] = 0;
			rollSetText[lowestIndex] = "[x" + rollSetText[lowestIndex] + "x]"
		}
	}

	function removeClosestRolls(rollSet, rollSetText, droppedRollSet, centerValue) {
		var difference = 0;
		var emphasisIndex = -1;
		for (var x = 0; x < rollSet.length; x++) {
			if ((Math.abs(centerValue - rollSet[x]) < difference && rollSet[x] > 0)
				|| (emphasisIndex == -1)
				|| (Math.abs(centerValue - rollSet[x] && rollSet[x] > rollSet[emphasisIndex])
				)) {
				difference = Math.abs(centerValue - rollSet[x]);
				emphasisIndex = x;
			}
		}
		if (emphasisIndex > -1) {
			for (let x = 0; x < rollSet.length; x++) {
				if (x !== emphasisIndex) {
					droppedRollSet.push(rollSet[rollSet[x]])
				}
			}
			rollSet[emphasisIndex] = 0;
			rollSetText[emphasisIndex] = "[x" + rollSetText[emphasisIndex] + "x]"
		}
	}

	function StripAndSplit(content, delimeter) {
		//log(content)
		//var work = content.replace("[","").replace(")","").replace("(","").replace(")","")
		var work = content.replace(/[^a-z0-9áéíóúñü:; \,_-]/gim, "");
		return work.split(delimeter);
	}

	const getCleanImgsrc = (imgsrc) => {
		let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
		if (parts) {
			return parts[1] + 'thumb' + parts[3] + (parts[4] ? parts[4] : `?${Math.round(Math.random() * 9999999)}`);
		}
		return;
	};

	function DelaySandboxExecution(thisContent) {
		var now = new Date;
		var startTime = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();
		var delay = parseFloat(thisContent);
		if (delay > 10) { delay = 10; }
		var endTime = startTime + delay;
		while (endTime > (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds()) {
			now = new Date;
		}
	}

	function delayFunction(speaker, output) {
		return function () {
			sendChat("ScriptCards", output.trim());
		}
	}

	const generateUUID = (() => {
		let a = 0;
		let b = [];
		return () => {
			let c = (new Date()).getTime() + 0;
			let f = 7;
			let e = new Array(8);
			let d = c === a;
			a = c;
			for (; 0 <= f; f--) {
				e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
				c = Math.floor(c / 64);
			}
			c = e.join("");
			if (d) {
				for (f = 11; 0 <= f && 63 === b[f]; f--) {
					b[f] = 0;
				}
				b[f]++;
			} else {
				for (f = 0; 12 > f; f++) {
					b[f] = Math.floor(64 * Math.random());
				}
			}
			for (f = 0; 12 > f; f++) {
				c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
			}
			return c;
		};
	})();

	const generateRowID = () => generateUUID().replace(/_/g, "Z");

	function setStringOrArrayElement(varName, varValue, cardParameters) {
		// Determine if the varName is a string or Array Element
		if (varName.match(/(.*)\((-?\d*)\)/)) {
			// It's an array element reference, split into a name and index
			var match = varName.match(/(.*)\((-?\d*)\)/);
			var arrayName = match[1];
			var arrayIndex = match[2];

			if (isNumber(arrayIndex)) {
				// If the array doesn't exist, create an empty array
				if (arrayVariables[arrayName] == null) {
					arrayVariables[arrayName] = [];
				}
				if (arrayVariables[arrayName].length >= (arrayIndex - 1) && arrayIndex >= 0) {
					arrayVariables[arrayName][arrayIndex] = varValue;
				} else {
					if (arrayIndex < 0) {
						arrayVariables[arrayName].unshift(varValue);
					} else {
						arrayVariables[arrayName].push(varValue);
					}
				}
			}
		} else {
			if (varValue == null) { varValue = "" }

			//if (typeof (varValue) === 'string' && varValue.charAt(0) == "+") {
			if (typeof (varValue) === 'string' && varValue.charAt(0) == cardParameters.concatenationcharacter) {
				varValue = (stringVariables[varName] || "") + varValue.substring(1);
			}

			stringVariables[varName] = replaceVariableContent(varValue, cardParameters, true);
		}
	}

	function reload_template_mule() {
		templates = {}

		if (typeof Supernotes_Templates != "undefined") {
			templates = Object.assign({}, Supernotes_Templates);
		}

		templates["dnd5e"] = {
			boxcode: `<div style='background-image: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(https://i.imgur.com/8Mm94QY.png); background-size: 100% 100%; box-shadow: 0 0 3px #fff; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; color: black; font-family: serif; white-space: pre-wrap; line-height:1.2em; font-style:normal'>`, //"Bookinsanity", 
			titlecode: `<div style='margin: 0.5em 1em 0.25em 1em; font-size: 18px; font-variant: small-caps; border-bottom: 2px solid #d3b63b; font-family: "MrEavesSmallCaps", Monsterrat, serif; color: #8b281c; display: block; margin-block-start: 1em; margin-block-end: 0; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;'>`, //padding-bottom: .1rem;
			textcode: "</div><div><div style='font-weight: normal; display: block; margin: 0 1em 0 1em;'>",
			buttonwrapper: `<div style='display:block;'>`,
			buttonstyle: `style='display:inline-block; margin: 0px; font-size: 10px; color:#fff; padding: 2px 1px 1px 2px; background-color: #d00; text-align: center; border-radius: 5px;'`,
			playerbuttonstyle: `style='display:inline-block; color:#000; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
			buttondivider: `<span style='color:#000; margin:0px;'> • </span>`,
			handoutbuttonstyle: `style='display:inline-block; color:#13f2fc; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
			footer: ""
		};
		templates["dnd1e_green"] = {
			boxcode: `<div style='background-color: #b5dcb0; box-shadow: 0 0 3px #fff; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; color: black; font-family: sans-serif; white-space: pre-wrap; line-height:1.3em; font-style:normal'>`,
			titlecode: `<div style='margin: 0.5em 1em 0.25em 1em; font-size: 16px; font-variant: small-caps; font-family: "Goblin One", sans-serif; color: #000; display: block; margin-block-start: 1em; margin-block-end: 0; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;'>`, //padding-bottom: .1rem;
			textcode: "</div><div><div style='font-weight: normal; display: block; margin: 0 1em 0 1em;'>",
			buttonwrapper: `<div style='display:block;'>`,
			buttonstyle: `style='display:inline-block; font-size: 10px; color:#000; padding: 2px 0px 2px 0px; background-color: transparent; border: 1px solid black; text-align: center; border-radius: 0px;'`,
			playerbuttonstyle: `style='display:inline-block; color:#000; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
			buttondivider: `<span style='color:#000; margin:0px;'> • </span>`,
			handoutbuttonstyle: `style='display:inline-block; color:#13f2fc; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
			footer: ""
		};
		templates["dnd1e_amber"] = {
			boxcode: `<div style='background-color: #f3d149; box-shadow: 0 0 3px #fff; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; color: black; font-family: sans-serif; white-space: pre-wrap; line-height:1.3em; font-style:normal'>`,
			titlecode: `<div style='margin: 0.5em 1em 0.25em 1em; font-size: 16px; font-variant: small-caps; font-family: "Goblin One", sans-serif; color: #000; display: block; margin-block-start: 1em; margin-block-end: 0; margin-inline-start: 0px; margin-inline-end: 0px; font-weight: bold;'>`, //padding-bottom: .1rem;
			textcode: "</div><div><div style='font-weight: normal; display: block; margin: 0 1em 0 1em;'>",
			buttonwrapper: `<div style='display:block;'>`,
			buttonstyle: `style='display:inline-block; font-size: 10px; color:#000; padding: 2px 1px 1px 2px; background-color: transparent; border: 1px solid black; text-align: center; border-radius: 0px;'`,
			playerbuttonstyle: `style='display:inline-block; color:#000; font-weight:normal; background-color: transparent;padding: 0px; border: none;'`,
			buttondivider: `<span style='color:#000; margin:0px;'> • </span>`,
			handoutbuttonstyle: `style='display:inline-block; color:#13f2fc; font-weight:normal; background-color: transparent; padding: 0px; border: none;'`,
			footer: ""
		};

		try {
			var findTemplateChar = findObjs({ _type: "character", name: "ScriptCards_TemplateMule" })[0];
		} catch {
			//log(`ScriptCards: TemplateMule not found`) 
		}

		try {
			if (findTemplateChar) {
				var muleTemplates = findObjs({ _type: "ability", characterid: findTemplateChar.id });
				if (muleTemplates) {
					for (var x = 0; x < muleTemplates.length; x++) {
						var tempName = muleTemplates[x].get("name")
						templates[tempName] = templates[tempName] || {}
						var templateText = muleTemplates[x].get("action")
						var templateLines = templateText.split("||")
						for (var i = 0; i < templateLines.length; i++) {
							var pieces = templateLines[i].replace(/(\r\n|\n|\r)/gm, "").split("::")
							if (pieces && pieces.length == 2) {
								pieces[1] = pieces[1].replace(/\{/g, "<").replace(/\}/g, ">").trim()
								pieces[0] = pieces[0].trim()
								if (pieces[0] == 'boxcode') { templates[tempName].boxcode = pieces[1] }
								if (pieces[0] == 'titlecode') { templates[tempName].titlecode = pieces[1] }
								if (pieces[0] == 'textcode') { templates[tempName].textcode = pieces[1] }
								if (pieces[0] == 'buttonwrapper') { templates[tempName].buttonwrapper = pieces[1] }
								if (pieces[0] == 'buttonstyle') { templates[tempName].buttonstyle = pieces[1] }
								if (pieces[0] == 'footer') { templates[tempName].footer = pieces[1] }
								if (pieces[0] == 'tablestyle') { templates[tempName].tablestyle = pieces[1] }
								if (pieces[0] == 'thstyle') { templates[tempName].thstyle = pieces[1] }
								if (pieces[0] == 'tdstyle') { templates[tempName].tdstyle = pieces[1] }
								if (pieces[0] == 'trstyle') { templates[tempName].trstyle = pieces[1] }
								if (pieces[0] == 'subtitlestyle') { templates[tempName].subtitlestyle = pieces[1] }
								if (pieces[0] == 'h1style') { templates[tempName].h1style = pieces[1] }
								if (pieces[0] == 'h2style') { templates[tempName].h2style = pieces[1] }
								if (pieces[0] == 'h3style') { templates[tempName].h3style = pieces[1] }
								if (pieces[0] == 'h4style') { templates[tempName].h4style = pieces[1] }
								if (pieces[0] == 'h5style') { templates[tempName].h5style = pieces[1] }
							}
						}
					}
				}
			}
		} catch {
			log("ScriptCards: Error parsing Templates Mule. Mule templates may not be available")
		}
		log(`ScriptCards: ${Object.keys(templates).length} Templates loaded`);
	}

	function ParseCalculatedAttribute(attribute, character) {
		while (attribute.match(/\@\{(.*?)\}/g) != null) {
			var thisMatch = attribute.match(/\@\{(.*?)\}/g)[0];
			var replacement = "";
			try {
				replacement = getAttrByName(character.id, thisMatch.replace("@{", "").replace("}", ""), "current");
			} catch {
				log(`Failure looking up attribute ${thisMatch}`)
			}
			attribute = attribute.replace(thisMatch, replacement);
		}
		attribute = attribute.replace(/floor\((.*?)\)/g, "$1 {FLOOR}"); // Remove double square brackets
		attribute = attribute.replace(/ceil\((.*?)\)/g, "$1 {CEIL}"); // Remove double square brackets
		attribute = attribute.replace(/\[\[(.*?)\]\]/g, "$1"); // Remove double square brackets
		attribute = attribute.replace(/\((.*?)\)/g, "$1"); // Remove double square brackets
		return attribute;
	}

	function FillTemplateStyle(piece, cardParameters, raw) {
		if (!raw) { return "" }
		if (cardParameters.overridetemplate == "none") { return "" }
		if (templates[cardParameters.overridetemplate][piece]) {
			return `style='${templates[cardParameters.overridetemplate][piece]}'`
		} else {
			return ""
		}
	}

	function storeRollVar(charid, prefix, varname) {
		try {
			let testObj = findObjs({ type: "attribute", characterid: charid, name: `SCR_${prefix}-${varname}` })[0]
			if (testObj) {
				testObj.set("current", JSON.stringify(rollVariables[varname]))
			} else {
				createObj("attribute", {
					name: `SCR_${prefix}-${varname}`,
					current: JSON.stringify(rollVariables[varname]),
					characterid: charid
				})
			}
		} catch (e) {
			log(`Unable to store Roll ${varname} on ${charid}, error ${e} `)
		}
	}

	function loadRollVar(charid, prefix, varname) {
		try {
			let charobj = getObj("character", charid)
			if (charobj) {
				let attr = findObjs({ type: "attribute", characterid: charid, name: `SCR_${prefix}-${varname}` })[0];
				if (attr) {
					rollVariables[varname] = JSON.parse(attr.get("current"));
				}
			}
		} catch (e) {
			log(`Unable to load ${varname} on ${charid}, error ${e} `)
		}
	}

	function storeStringVar(charid, prefix, varname) {
		try {
			let testObj = findObjs({ type: "attribute", characterid: charid, name: `SCS_${prefix}-${varname}` })[0]
			if (testObj) {
				testObj.set("current", stringVariables[varname])
			} else {
				createObj("attribute", {
					name: `SCS_${prefix}-${varname}`,
					current: stringVariables[varname],
					characterid: charid
				})
			}
		} catch (e) {
			log(`Unable to store String ${varname} on ${charid}, error ${e} `)
		}
	}

	function loadStringVar(charid, prefix, varname) {
		try {
			let charobj = getObj("character", charid)
			if (charobj) {
				let attr = findObjs({ type: "attribute", characterid: charid, name: `SCS_${prefix}-${varname}` })[0];
				if (attr) {
					stringVariables[varname] = attr.get("current");
				}
			}
		} catch (e) {
			log(`Unable to load ${varname} on ${charid}, error ${e} `)
		}
	}

	function storeArray(charid, prefix, varname) {
		try {
			let testObj = findObjs({ type: "attribute", characterid: charid, name: `SCA_${prefix}-${varname}` })[0]
			if (testObj) {
				testObj.set("current", JSON.stringify(arrayVariables[varname]))
			} else {
				createObj("attribute", {
					name: `SCA_${prefix}-${varname}`,
					current: JSON.stringify(arrayVariables[varname]),
					characterid: charid
				})
			}
		} catch (e) {
			log(`Unable to store Array ${varname} on ${charid}, error ${e} `)
		}
	}

	function loadArray(charid, prefix, varname) {
		try {
			let charobj = getObj("character", charid)
			if (charobj) {
				let attr = findObjs({ type: "attribute", characterid: charid, name: `SCA_${prefix}-${varname}` })[0];
				if (attr) {
					arrayVariables[varname] = JSON.parse(attr.get("current"));
				}
			}
		} catch (e) {
			log(`Unable to load ${varname} on ${charid}, error ${e} `)
		}
	}

	function storeHashTable(charid, prefix, varname) {
		try {
			// If saving an empty hash table, delete the attribute
			if (hashTables[varname] && JSON.stringify(hashTables[varname]) == "{}") {
				let testObj = findObjs({
					type: "attribute",
					characterid: charid,
					name: `SCH_${prefix}-${varname}`
				})[0];
				if (testObj) { testObj.remove() }
			} else {
				let testObj = findObjs({
					type: "attribute",
					characterid: charid,
					name: `SCH_${prefix}-${varname}`
				})[0]
				if (testObj) {
					testObj.set("current", JSON.stringify(hashTables[varname]))
				} else {
					log(JSON.stringify(hashTables[varname]))
					createObj("attribute", {
						name: `SCH_${prefix}-${varname}`,
						current: JSON.stringify(hashTables[varname]),
						characterid: charid
					})
				}
			}
		} catch (e) {
			log(`Unable to store Hash ${varname} on ${charid}, error ${e} `)
		}
	}

	/*
	function loadHashTable(charid, prefix, varname) {
		try {
			let charobj = getObj("character", charid)
			if (charobj) {
				let attr = findObjs({ type: "attribute", characterid: charid, name: `SCH_${prefix}-${varname}` })[0];
				if (attr) {
					hashTables[varname] = JSON.parse(attr.get("current"));
				}
			}
		} catch (e) {
			log(`Unable to load ${varname} on ${charid}, error ${e} `)
		}
	}
	*/

	function loadHashTable(characterId, prefix, variableName) {
		try {
			let characterObject = getObj("character", characterId)
			if (characterObject) {
				let attribute = findObjs({ type: "attribute", characterid: characterId, name: `SCH_${prefix}-${variableName}` })[0];
				if (attribute) {
					hashTables[variableName] = JSON.parse(attribute.get("current"));
				} else {
					log(`Attribute not found for ${variableName} on ${characterId}`)
				}
			} else {
				log(`Character not found for id ${characterId}`)
			}
		} catch (error) {
			log(`Unable to load ${variableName} on ${characterId}, error ${error} `)
		}
	}

	function storeSetting(charid, prefix, varname, cardParameters) {
		if (cardParameters[varname] !== undefined) {
			try {
				let testObj = findObjs({ type: "attribute", characterid: charid, name: `SCT_${prefix}-${varname}` })[0]
				if (testObj) {
					testObj.set("current", cardParameters[varname])
				} else {
					createObj("attribute", {
						name: `SCT_${prefix}-${varname}`,
						current: cardParameters[varname],
						characterid: charid
					})
				}
			} catch (e) {
				log(`Unable to store Setting ${varname} on ${charid}, error ${e} `)
			}
		} else {
			log(`Attempted to store ${varname} setting, which does not exist`)
		}
	}

	function loadSetting(charid, prefix, varname, cardParameters) {
		if (cardParameters[varname] !== undefined) {
			try {
				let charobj = getObj("character", charid)
				if (charobj) {
					let attr = findObjs({ type: "attribute", characterid: charid, name: `SCT_${prefix}-${varname}` })[0];
					if (attr) {
						cardParameters[varname] = attr.get("current");
					}
				}
			} catch (e) {
				//log(`Unable to load ${varname} on ${charid}, error ${e} `)
			}
		} else {
			//log(`Attempted to load ${varname} setting, which does not exist`)
		}
	}

	function handleEmoteCommands(thisTag, thisContent) {
		/*
		try {
			var characterName = thisTag.substring(1);
			var macroName = thisContent.trim();
			log("gothere")
			if (characterName.length >= 1) {
				log("sendwithname")
				sendChat("ScriptCards", `%{${characterName}|${macroName}}`);
			} else {
				sendChat("ScriptCards", `#${macroName}`);
			}
		} catch (e) {
			log(`Error generating echo command: ${e}. thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
		*/
		try {
			var sendAs = thisTag.substring(1);
			sendChat(sendAs, thisContent);
		} catch (e) {
			log(`Error generating echo command: ${e}. thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleConsoleLogs(thisTag, thisContent) {
		try {
			log(thisContent);
		} catch (e) {
			log(e);
		}
	}

	function handleHasTableCommands(thisTag, hashTables, thisContent) {
		try {
			let hashparams = thisTag.substring(2);
			let tableName = hashparams.split('("')[0];
			let tableKey = hashparams.split('("')[1];
			tableKey = tableKey.substring(0, tableKey.indexOf('")'));
			if (hashTables[tableName] === undefined) {
				hashTables[tableName] = {};
			}
			if (thisContent == null || thisContent.trim() == "") {
				delete hashTables[tableName][tableKey];
			} else {
				hashTables[tableName][tableKey] = thisContent;
			}
		} catch (e) {
			log(`Error setting hash table ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleWaitStatements(thisTag, thisContent, cardParameters) {
		try {
			if (thisTag.length == 1) {
				DelaySandboxExecution(thisContent);
			} else {
				if (thisTag.indexOf(":") > 0) {
					var delayArgs = thisTag.substring(1).split(":");
					var delayLength = delayArgs[0];
					delayArgs.shift();
					var delayCommand = delayArgs.join(":");
					var hideInfo = "--#hidecard|1"
					if (delayCommand.charAt(0) == "+" || delayCommand.charAt(0) == "*") {
						hideInfo = "--#hidetitlecard|1"
					}
					setTimeout(delayFunction("", `!script {{ ${hideInfo} --${replaceVariableContent(delayCommand, cardParameters)}|${replaceVariableContent(thisContent, cardParameters)} }}`), parseFloat(delayLength) * 1000)
				}
			}
		} catch (e) {
			log(`Error setting up wait statement ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleLoopStatements(thisTag, thisContent, cardParameters, cardLines) {
		let loopCounter = undefined || thisTag.substring(1);
		if (loopCounter && loopCounter !== "" && loopCounter !== "!") {
			if (loopControl[loopCounter]) { log(`ScriptCards: Warning - loop counter ${loopCounter} reused inside itself on line ${lineCounter}.`); }
			let params = thisContent.split(cardParameters.parameterdelimiter);
			if (params.length === 2 && params[0].toLowerCase().endsWith("each")) {
				// This will be a for-each loop, so the first (and only) parameter must be an array name
				if (arrayVariables[params[1]] && arrayVariables[params[1]].length > 0) {
					loopControl[loopCounter] = { loopType: "foreach", initial: 0, current: 0, end: arrayVariables[params[1]].length - 1, step: 1, nextIndex: lineCounter, arrayName: params[1] }
					stringVariables[loopCounter] = arrayVariables[params[1]][0];
					loopStack.push(loopCounter);
					if (cardParameters.debug == 1) { log(`ScriptCards: Info - Beginning of loop ${loopCounter}`) }
				} else {
					log(`ScriptCards For...Each loop without a defined array or with empty array on line ${lineCounter}`)
				}
			}
			if (params.length === 2 && (params[0].toLowerCase().endsWith("while") || params[0].toLowerCase().endsWith("until"))) {
				let originalContent = getLineContent(cardLines[lineCounter]);
				let contentParts = originalContent.split(cardParameters.parameterdelimiter);
				let isTrue = processFullConditional(replaceVariableContent(contentParts[1], cardParameters)) || params[0].toLowerCase().endsWith("until");
				if (isTrue) {
					loopControl[loopCounter] = { loopType: params[0].toLowerCase().endsWith("until") ? "until" : "while", initial: 0, current: 0, end: 999999, step: 1, nextIndex: lineCounter, condition: contentParts[1] }
					stringVariables[loopCounter] = "true";
					loopStack.push(loopCounter);
					if (cardParameters.debug == 1) { log(`ScriptCards: Info - Beginning of loop ${loopCounter}`) }
				} else {
					let line = lineCounter;
					for (line = lineCounter + 1; line < cardLines.length; line++) {
						if (getLineTag(cardLines[line], line, "").trim() == "%") {
							lineCounter = line;
						}
					}
					if (lineCounter > cardLines.length) {
						log(`ScriptCards: Warning - no end block marker found for loop block started ${loopCounter}`);
						lineCounter = cardLines.length + 1;
					}
				}
			}
			if (params.length === 2 && (!params[0].toLowerCase().endsWith("each")) && (!params[0].toLowerCase().endsWith("until")) && (!params[0].toLowerCase().endsWith("while"))) { params.push("1"); } // Add a "1" as the assumed step value if only two parameters
			if (params.length === 3) {
				if (isNumeric(params[0]) && isNumeric(params[1]) && isNumeric(params[2]) && parseInt(params[2]) != 0) {
					loopControl[loopCounter] = { loopType: "fornext", initial: parseInt(params[0]), current: parseInt(params[0]), end: parseInt(params[1]), step: parseInt(params[2]), nextIndex: lineCounter }
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
				let currentLoop = loopStack[loopStack.length - 1];
				if (loopControl[currentLoop]) {
					loopControl[currentLoop].current += loopControl[currentLoop].step;
					switch (loopControl[currentLoop].loopType) {
						case "fornext":
							stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
							break;
						case "foreach":
							try {
								var beforeLoopEnded = stringVariables[currentLoop]
								stringVariables[currentLoop] = arrayVariables[loopControl[currentLoop].arrayName][loopControl[currentLoop].current]
							} catch {
								stringVariables[currentLoop] = "ArrayError"
							}
							break;
						case "while":
							var isTrue = processFullConditional(replaceVariableContent(loopControl[currentLoop].condition, cardParameters));
							if (!isTrue) {
								loopControl[currentLoop].current = loopControl[currentLoop].end + 1;
								loopControl[currentLoop].step = 1;
							}
							break;
						case "until":
							var isTrue = processFullConditional(replaceVariableContent(loopControl[currentLoop].condition, cardParameters));
							if (isTrue) {
								loopControl[currentLoop].current = loopControl[currentLoop].end + 1;
								loopControl[currentLoop].step = 1;
							}
							break;

					}
					if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
						(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
						loopCounter == "!") {
						stringVariables[currentLoop] = beforeLoopEnded;
						loopStack.pop();
						delete loopControl[currentLoop];
						if (cardParameters.debug == 1) { log(`ScriptCards: Info - End of loop ${currentLoop}`) }
						if (loopCounter == "!") {
							let line = lineCounter;
							for (line = lineCounter + 1; line < cardLines.length; line++) {
								if (getLineTag(cardLines[line], line, "").trim() == "%") {
									lineCounter = line;
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
				log(`ScriptCards: Error - Loop end statement without an active loop on line ${lineCounter}`);
			}
		}
	}

	function handleCardSettingsCommands(thisTag, thisContent, cardParameters) {
		try {
			let paramName = thisTag.substring(1).toLowerCase();
			paramName = parameterAliases[paramName] || paramName;
			if (cardParameters[paramName] != null) {
				cardParameters[paramName] = thisContent;
				if (cardParameters.debug == "1") { log(`Setting parameter ${paramName} to value ${thisContent} - ${cardParameters[paramName]}`) }
			} else {
				if (cardParameters.debug == "1") { log(`Unable to set parameter ${paramName} to value ${thisContent}`) }
			}

			switch (paramName) {
				case "sourcetoken":
					var charLookup = getObj("graphic", thisContent.trim());
					if (charLookup != null && charLookup.get("represents") !== "") {
						cardParameters.sourcecharacter = getObj("character", charLookup.get("represents"));
					}
					break;

				case "targettoken":
					var charLookup = getObj("graphic", thisContent.trim());
					if (charLookup != null && charLookup.get("represents") !== "") {
						cardParameters.targetcharacter = getObj("character", charLookup.get("represents"));
					}
					break;

				case "activepage":
					if (thisContent.trim().toLowerCase() === "playerpage") {
						cardParameters.activepageobject = getObj("page", Campaign().get("playerpageid"));
					} else {
						var pageLookup = getObj("page", thisContent.trim());
						if (pageLookup != null) {
							cardParameters.activepageobject = pageLookup;
						}
					}
					break;

				case "overridetemplate":
					if (templates[thisContent.trim()] != null) {
						cardParameters.overridetemplate = thisContent.trim();
					} else {
						if (thisContent.trim() !== "none") {
							log(`ScriptCards: Unknown template ${thisContent.trim()} specified. Template names are case sensitive. Reverting to "none"`)
						}
						cardParameters.overridetemplate = "none";
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

				case "subtitleseperator":
					cardParameters.subtitleseparator = thisContent;
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
			}
			if (SettingsThatAreColors.includes(paramName)) {
				if (thisContent.trim().match(/^[0-9a-fA-F]{8}$/)) {
					cardParameters[paramName] = `#${thisContent.trim()}`;
				}
				if (thisContent.trim().match(/^[0-9a-fA-F]{6}$/)) {
					cardParameters[paramName] = `#${thisContent.trim()}`;
				}
				if (thisContent.trim().match(/^[0-9a-fA-F]{3}$/)) {
					cardParameters[paramName] = `#${thisContent.trim()}`;
				}
				if (thisContent.trim() == "") {
					cardParameters[paramName] = "#00000000"
				}
			}
			if (SettingsThatAreNumbers.includes(paramName)) {
				cardParameters[paramName] = thisContent.match(/\d+/)[0]
			}
		} catch (e) {
			log(`Error setting card parameter ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleZOrderSettingCommands(thisTag, thisContent) {
		try {
			let statementParams = thisTag.split(":");
			let contentParams = thisContent.split(" ");
			if (statementParams[1].toLowerCase() == "graphic") {
				if (contentParams[0].toLowerCase() == "tofront") {
					let thisObj = getObj("graphic", statementParams[2]);
					if (thisObj) { toFront(thisObj); }
				}
				if (contentParams[0].toLowerCase() == "toback") {
					let thisObj = getObj("graphic", statementParams[2]);
					if (thisObj) { toBack(thisObj); }
				}
			}
		} catch (e) {
			log(`Error setting z-order ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleObjectModificationCommands(thisTag, thisContent, cardParameters) {
		try {
			if (thisTag.length > 1) {
				if (thisTag.charAt(2) == ":" || thisTag.charAt(3) == ":") {
					let objectType = thisTag.substring(1, 2).toLowerCase();
					switch (objectType) {
						case "o":
							switch (thisTag.substring(2, 3).toLowerCase()) {
								case "c": {
									let settings = thisContent.split(cardParameters.parameterdelimiter);
									let newChar = createObj("character", { name: settings[0] });
									if (newChar) {
										stringVariables[thisTag.substring(4)] = newChar.id
									} else {
										stringVariables[thisTag.substring(4)] = "OBJECT_CREATION_ERROR";
									}
								}
									break;

								case "#": {
									let returnVarName = thisTag.substring(4);
									let settings = thisContent.split(cardParameters.parameterdelimiter);
									if (returnVarName && settings[0]) {
										let showPlayers = false;
										if (settings[1] && (settings[1].toLowerCase() == "true" || settings[1].toLowerCase() == "yes" || settings[1] == "1")) {
											showPlayers = true;
										}
										var newTable = createObj("rollabletable", { name: settings[0], showplayers: showPlayers })
										if (newTable) {
											stringVariables[returnVarName] = newTable.id
										} else {
											stringVariables[returnVarName] = "OBJECT_CREATION_ERROR";
										}
									}
								}
									break;

								case "e": {
									let returnVarName = thisTag.substring(4);
									let settings = thisContent.split(cardParameters.parameterdelimiter);
									if (returnVarName && settings[0] && settings[1]) {
										let weight = 1;
										let avatar = "";
										if (settings[2]) {
											weight = parseInt(settings[2]) || 1;
										}
										if (settings[3]) {
											avatar = getCleanImgsrc(settings[3]);
										}
										var newTableEntry = createObj("tableitem", { _rollabletableid: settings[0], name: settings[1], weight: weight, avatar: avatar })
										if (newTableEntry) {
											stringVariables[returnVarName] = newTableEntry.id
										} else {
											stringVariables[returnVarName] = "OBJECT_CREATION_ERROR";
										}
									}
								}
									break;

								case "b": {
									let attributeInfo = thisTag.substring(4).split(":");
									if (attributeInfo.length >= 3) {
										let theCharacter = getObj("character", attributeInfo[1])
										let isTokenAction = (attributeInfo[3] != null && attributeInfo[3].toLowerCase() == "y") ? true : false
										if (theCharacter != null) {
											let newAbility = createObj("ability", {
												name: attributeInfo[2],
												_characterid: attributeInfo[1],
												action: thisContent,
												istokenaction: isTokenAction
											});
											stringVariables[attributeInfo[0]] = newAbility.id;
										} else {
											stringVariables[attributeInfo[0]] = "OBJECT_CREATION_ERROR";
										}
									} else {
										stringVariables[attributeInfo[0]] = "OBJECT_CREATION_ERROR";
									}
								}
									break;

								case "r": {
									let charInfo = thisTag.substring(4).split(":");
									if (charInfo.length >= 2) {
										var theCharacter = getObj("character", charInfo[0])
										var theSection = charInfo[1];
										var rowID = generateRowID();
										stringVariables["SC_LAST_CREATED_ROWID"] = rowID;
										var repeatingInfo = thisContent.split("|");
										if (theCharacter != null) {
											for (var x = 0; x < repeatingInfo.length; x++) {
												var subInfo = repeatingInfo[x].replace(":::").split(":");
												subInfo.push("");
												subInfo.push("");
												subInfo.push("");
												try {
													// eslint-disable-next-line no-unused-vars
													var newAttribute = createObj("attribute",
														{
															name: `repeating_${theSection}_${rowID}_${subInfo[0].trim()}`,
															_characterid: theCharacter.id,
															//current: subInfo[1].trim(),
															current: "",
															max: subInfo[2].replace(/%3A/gi, ":").trim()
														}
													)
													newAttribute.setWithWorker({ current: subInfo[1].replace(/%3A/gi, ":").trim() });
												} catch {
													log(`ScriptCards: Error creating repeating section values on character ${theCharacter}, section ${theSection}`)
												}
											}
										}

									}
								}
									break;
							}
							break;

						case "t": {
							var tokenID = thisTag.substring(3);
							if (tokenID.toLowerCase() == "s" && cardParameters.sourcetoken) { tokenID = cardParameters.sourcetoken; }
							if (tokenID.toLowerCase() == "t" && cardParameters.targettoken) { tokenID = cardParameters.targettoken; }
							let settings = thisContent.split("|");
							let theToken = getObj("graphic", tokenID);
							let prevTok = JSON.parse(JSON.stringify(theToken));

							if (theToken) {
								for (let i = 0; i < settings.length; i++) {
									let thisSetting = settings[i].split(":");
									let settingName = thisSetting.shift();
									let settingValue = thisSetting.join(':');

									if (settingName.toLowerCase() == "night_vision_effect" && (settingValue.trim().toLowerCase() == "dimming")) {
										settingValue = "Dimming_0"
									}

									if (settingName.toLowerCase() == "imgsrc") { settingValue = getCleanImgsrc(settingValue); }

									if (settingName.toLowerCase() == "bar1_link" ||
										settingName.toLowerCase() == "bar2_link" ||
										settingName.toLowerCase() == "bar3_link") {
										let theChar = getObj("character", theToken.get("represents"));
										if (theChar != null) {
											try {
												var theAttribute = findObjs({ _type: "attribute", _characterid: theChar.get("_id"), name: settingValue })[0];
											} catch { log("Error setting bar link. Attribute not found.") }
											if (theAttribute != null) {
												settingValue = theAttribute.get("_id");
											}
										}
									}

									if (settingName.toLowerCase() == "currentside") {
										if (settingValue) {
											let sides = theToken.get("sides").split("|");
											if (sides[Number(settingValue)]) {
												if (settingValue == "0") { settingValue = ""; }
												theToken.set("currentSide", settingValue);
												// Note: Remove this for March 2024 API Update
												var newImgSrc = getCleanImgsrc(sides[Number(settingValue)].replace("%3A", ":").replace("%3F", "?"));
												theToken.set("imgsrc", newImgSrc);
											}
										}

									}
									if (settingValue && (settingValue.startsWith("+=") || settingValue.startsWith("-="))) {
										let currentValue = theToken.get(settingName);
										let delta = settingValue.substring(2);
										if (isNumber(currentValue) && isNumber(delta)) {
											settingValue = settingValue.startsWith("+=") ? Number(currentValue) + Number(delta) : Number(currentValue) - Number(delta);
										} else {
											settingValue = currentValue + delta;
										}
									}
									if (cardParameters.formatoutputforobjectmodification == "1") {
										settingValue = processInlineFormatting(settingValue, cardParameters, false);
									}

									if (typeof (theToken.get(settingName)) == "boolean" && settingValue) {
										switch (settingValue.toLowerCase()) {
											case "true": case "on": case "1": settingValue = true; break;
											case "false": case "off": case "0": settingValue = false; break;
											case "": case "toggle": case "flip": settingValue = !(theToken.get(settingName)); break;
										}
									}

									//if (settingName && settingValue) { 
									if (settingName) {
										if (TokenAttrsThatAreNumbers.includes(settingName)) {
											settingValue = Number(settingValue)
										}

										theToken.set(settingName, settingValue);
										notifyObservers('tokenChange', theToken, prevTok);
									}

									forceLightUpdateOnPage();

								}
							} else {
								log(`ScriptCards Error: Modify Token called without valid TokenID`)
							}
						}
							break;

						case "c": {
							var charID = thisTag.substring(3);
							if (charID.toLowerCase() == "s") {
								if (cardParameters.sourcecharacter) {
									tokenID = cardParameters.sourcecharacter.id;
								}
							}
							if (charID.toLowerCase() == "t") {
								if (cardParameters.targetcharacter) {
									tokenID = cardParameters.targetcharacter.id;
								}
							}
							var settings = thisContent.split("|");
							var theCharacter = getObj("character", charID);
							if (theCharacter) {
								for (var i = 0; i < settings.length; i++) {
									var thisSetting = settings[i].split(":");
									var settingName = thisSetting.shift();
									var settingValue = thisSetting.join(':');
									if (settingValue.startsWith("+=") || settingValue.startsWith("-=")) {
										var currentValue = theCharacter.get(settingName);
										var delta = settingValue.substring(2);
										if (isNumber(currentValue) && isNumber(delta)) {
											settingValue = settingValue.startsWith("+=") ? Number(currentValue) + Number(delta) : Number(currentValue) - Number(delta);
										} else {
											settingValue = currentValue + delta;
										}
									}
									if (settingName.toLowerCase() == "defaulttoken") {
										var theToken = getObj("graphic", settingValue)
										if (theToken) {
											setDefaultTokenForCharacter(theCharacter, theToken)
										}
									} else {
										theCharacter.set(settingName, settingValue);
									}
								}
							} else {
								log(`ScriptCards Error: Modify character called without valid characterID`)
							}
						}
							break;

						case "a": {
							var objectID = thisTag.substring(3);
							if (objectID.toLowerCase() == "s") {
								if (cardParameters.sourcecharacter) {
									objectID = cardParameters.sourcecharacter.id;
								}
							}
							if (objectID.toLowerCase() == "t") {
								if (cardParameters.targetcharacter) {
									objectID = cardParameters.targetcharacter.id;
								}
							}
							var characterObj = undefined;
							var tokenTest = getObj("graphic", objectID);
							if (tokenTest) {
								characterObj = getObj("character", tokenTest.get("represents"));
							} else {
								characterObj = getObj("character", objectID);
							}
							if (characterObj != null) {
								var settings = thisContent.split("|");
								for (var i = 0; i < settings.length; i++) {
									var thisSetting = settings[i].split(":");
									var settingName = thisSetting.shift();
									var createAttribute = false;
									var useSheetWorker = true;
									var setType = "current";
									if (settingName.startsWith("!")) {
										createAttribute = true;
										settingName = settingName.substring(1);
									}
									if (settingName.startsWith("repeating_")) {
										createAttribute = true;
									}
									if (settingName.endsWith("^")) {
										setType = "max";
										settingName = settingName.slice(0, -1);
									}
									if (settingName.startsWith("$")) {
										useSheetWorker = false;
										settingName = settingName.substring(1);
									}
									var settingValue = thisSetting.join(":");
									var theAttribute = findObjs({
										type: 'attribute',
										characterid: characterObj.id,
										name: settingName
									}, { caseInsensitive: true })[0];
									if (settingName.toLowerCase() !== "bio" && settingName.toLowerCase() !== "gmnotes" && settingName.toLowerCase() !== "notes") {
										if (theAttribute) {
											if (settingValue.startsWith("+=") || settingValue.startsWith("-=")) {
												var currentValue = theAttribute.get(setType);
												var delta = settingValue.substring(2);
												if (isNumber(currentValue) && isNumber(delta)) {
													settingValue = settingValue.startsWith("+=") ? Number(currentValue) + Number(delta) : Number(currentValue) - Number(delta);
												} else {
													settingValue = currentValue + delta;
												}
											}
											if (setType == "current" && useSheetWorker) {
												theAttribute.setWithWorker({ current: settingValue });
											}
											if (setType == "max" && useSheetWorker) {
												theAttribute.setWithWorker({ max: settingValue });
											}
											if (!useSheetWorker) {
												theAttribute.set(setType, settingValue);
											}
										} else {
											if (createAttribute && settingValue) {
												if (settingValue.toString().startsWith("+=")) {
													settingValue = settingValue.substring(2);
													if (isNumber(settingValue)) { settingValue = Number(settingValue) }
												}
												if (settingValue.toString().startsWith("-=")) {
													settingValue = "-" + settingValue.substring(2);
													if (isNumber(settingValue)) { settingValue = Number(settingValue) }
												}
												theAttribute = createObj('attribute', {
													characterid: characterObj.id,
													name: settingName,
													current: setType == "current" ? settingValue : "",
													max: setType == "max" ? settingValue : ""
												});
											}
										}
									} else {
										log(`ScriptCards Error: Setting notes, gmnotes, or bio are not currently supported.`);
									}
								}
							} else {
								log(`ScriptCards Error: Modify attribute called without valid ID ${thisTag}, ${thisContent}`)
							}
						}
							break;
					}
				} else {
					var objectInfo = thisTag.substring(1).split(":");
					if (objectInfo.length == 2) {
						var objectType = objectInfo[0];
						var objectID = objectInfo[1];
						var thisObject = getObj(objectType, objectID);
						if (thisObject != null) {
							var settings = thisContent.split("|");
							for (var i = 0; i < settings.length; i++) {
								var thisSetting = settings[i].split(":");
								var settingName = thisSetting.shift();
								var settingValue = thisSetting.join(':');
								if (settingName.toLowerCase() == "imgsrc") {
									settingValue = getCleanImgsrc(settingValue);
								}

								if (settingName.toLowerCase() == "night_vision_effect") {
									if (settingValue.toLowerCase() == "dimming") {
										settingValue = "Dimming_0"
									}
								}

								if (cardParameters.formatoutputforobjectmodification == "1") {
									settingValue = processInlineFormatting(settingValue, cardParameters, false);
								}

								if (typeof (thisObject.get(settingName)) == "boolean" && (settingValue != null)) {
									switch (settingValue.toLowerCase()) {
										case "true": settingValue = true; break;
										case "false": settingValue = false; break;
									}
								}

								if (settingName.toLowerCase() == "speakingas") {
									settingValue = settingValue.replace("^", "|")
								}

								if (settingName != null) {
									thisObject.set(settingName, settingValue);
								}
							}
							if (objectType.toLowerCase() == "graphic") { forceLightUpdateOnPage() }
						} else {
							log(`ScriptCards Error: Modify object called without valid object type or object ID`)
						}
					}
				}
			}
		} catch (e) {
			log(`Error updating/adding object ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleDataReadCommands(thisTag) {
		try {
			if (thisTag.charAt(1) !== "!") {
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
		} catch (e) {
			log(`Error reading data ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleAPICallCommands(thisTag, thisContent, cardParameters, msg) {
		try {
			let apicmd = thisTag.substring(1);
			let spacer = " ";
			let slash = "\\";

			// Replace _ with --
			let params = thisContent.replace(/(^|\ +)_/g, " --");

			// Remove deferral markers from deferred SelectManager/ZeroFrame calls
			let regex = new RegExp(`${slash}{${slash}${cardParameters.deferralcharacter}(${slash}&.*?)${slash}}`, "g");
			params = params.replace(regex, "{$1}");

			// Remove deferral markers from deferred Fetch calls
			regex = new RegExp(`${slash}@${slash}${cardParameters.deferralcharacter}${slash}((.*?)${slash})`, "g");
			params = params.replace(regex, "@($1)");
			regex = new RegExp(`${slash}*${slash}${cardParameters.deferralcharacter}${slash}((.*?)${slash})`, "g");
			params = params.replace(regex, "*($1)");
			regex = new RegExp(`get${slash}${cardParameters.deferralcharacter}${slash}.`, "g");
			params = params.replace(regex, "get.");
			regex = new RegExp(`set${slash}${cardParameters.deferralcharacter}${slash}.`, "g");
			params = params.replace(regex, "set.");

			var apiMessage = `!${apicmd}${spacer}${params}`.trim();
			if (cardParameters.debug !== "0") {
				log(`ScriptCards: Making API call - ${apiMessage}`);
			}
			sendChat(msg.who, apiMessage);
		} catch (e) {
			log(`Error calling API command ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleOutputCommands(thisTag, thisContent, cardParameters) {
		try {
			let rowData = buildRowOutput(thisTag.substring(1), replaceVariableContent(thisContent.replace(/\[&zwnj;/g, "["), cardParameters, true), cardParameters.outputtagprefix, cardParameters.outputcontentprefix);
			let rawRowData = buildRawRowOutput(thisTag.substring(1), replaceVariableContent(thisContent.replace(/\[&zwnj;/g, "["), cardParameters, true), cardParameters.outputtagprefix, cardParameters.outputcontentprefix);

			tableLineCounter += 1;
			if (tableLineCounter % 2 == 0) {
				while (rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.evenrowfontcolor); }
				while (rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; background-image: ${cardParameters.evenrowbackgroundimage}; `); }
				//while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; `); }
			} else {
				while (rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.oddrowfontcolor); }
				while (rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; background-image: ${cardParameters.oddrowbackgroundimage}; `); }
				//while(rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; `); }
			}
			rowData = processInlineFormatting(rowData, cardParameters, false);
			rawRowData = processInlineFormatting(rawRowData, cardParameters, true);

			thisTag.charAt(0) == "+" ? outputLines.push(rowData) : gmonlyLines.push(rowData)
			thisTag.charAt(0) == "+" ? bareoutputLines.push(rawRowData) : null
		} catch (e) {
			log(`Error adding output/gmoutput line ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleGosubCommands(thisTag, thisContent, cardParameters, cardLines) {
		try {
			parameterStack.push(callParamList);
			let paramList = CSVtoArray(thisContent.trim());
			callParamList = {};
			arrayVariables["args"] = []
			let paramCount = 1;

			if (paramList) {
				paramList.forEach(function (item) {
					arrayVariables["args"].push(item.toString().trim());
					callParamList[paramCount] = item.toString().trim();
					paramCount++;
				});
			}
			let jumpTo = thisTag.substring(1);
			if (cardParameters.functionbenchmarking == "1") {
				benchmarks[jumpTo] ? benchmarks[jumpTo] += 1 : benchmarks[jumpTo] = 1
			}
			if (lineLabels[jumpTo]) {
				returnStack.push(lineCounter);
				lineCounter = lineLabels[jumpTo];
			} else { log(`ScriptCards Error: Label ${jumpTo} is not defined on line ${lineCounter} (${thisTag}, ${thisContent})`) }
		} catch (e) {
			log(`Error executing gosub ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleVisualEffectsCommand(thisTag, thisContent, cardParameters) {
		try {
			if (thisTag.length > 1) {
				let effectType = thisTag.substring(1).toLowerCase();
				let params = thisContent.split(" ");
				switch (effectType) {
					case "token":
						if (params.length >= 2) {
							let s = getObj("graphic", params[0]);
							if (s) {
								var x = s.get("left");
								var y = s.get("top");
								var pid = s.get("_pageid");
								if (params[1].toLowerCase() == "ping") {
									let moveall = false;
									if (params[2] && params[2].toLowerCase() == "moveall") {
										moveall = true;
									}
									sendPing(x, y, pid, stringVariables["SendingPlayerID"], moveall);
								} else {
									let effectInfo = findObjs({
										_type: "custfx",
										name: params[1].trim()
									});
									if (!_.isEmpty(effectInfo)) {
										spawnFxWithDefinition(x, y, effectInfo[0].get('definition'), pid);
									} else {
										let t = params[1].trim();
										if (t !== "" && t !== "none") {
											spawnFx(x, y, t, pid);
										}
									}
								}
							}
						}
						break;
					case "betweentokens":
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
									_type: "custfx",
									name: params[2].trim()
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
									if (t !== "" && t !== "none") {
										spawnFxBetweenPoints({ x: x1, y: y1 }, { x: x2, y: y2 }, t, pid);
									}
								}

							}
						}
						break;

					case "point":
						var x = params[0];
						var y = params[1];
						var pid = Campaign().get("playerpageid");
						if (cardParameters.activepage !== "") {
							pid = cardParameters.activepage;
						}
						if (params[2].toLowerCase() == "ping") {
							var moveall = false;
							if (params[3] && params[3].toLowerCase() == "moveall") {
								moveall = true;
							}
							sendPing(x, y, pid, stringVariables["SendingPlayerID"], moveall);
						} else {
							var effectInfo = findObjs({
								_type: "custfx",
								name: params[2].trim()
							});
							if (!_.isEmpty(effectInfo)) {
								spawnFxWithDefinition(x, y, effectInfo[0].get('definition'), pid);
							} else {
								var t = params[2].trim();
								if (x && y) {
									if (t !== "" && t !== "none") {
										spawnFx(x, y, t, pid);
									}
								}
							}
						}
						break;

					case "line":
						var x1 = params[0];
						var y1 = params[1];
						var x2 = params[2];
						var y2 = params[3];
						var t = params[4];
						var pid = Campaign().get("playerpageid");
						if (cardParameters.activepage !== "") {
							pid = cardParameters.activepage;
						}
						if (x1 && y1 && x2 && y2 && t && pid) {
							spawnFxBetweenPoints({ x: x1, y: y1 }, { x: x2, y: y2 }, t, pid);
						}
						break;
				}
			}
		} catch (e) {
			log(`Error creating VFX ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleStashLines(thisTag, thisContent, cardParameters) {
		try {
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

				// Handle variable storage and recall
				if ("$&@#:".includes(thisTag.charAt(1))) {
					let varType = thisTag.charAt(1)
					let prefix = ""
					if (thisTag.length > 2) {
						prefix = thisTag.substring(2)
					}
					let varList = thisContent.split(cardParameters.parameterdelimiter)
					if (cardParameters.storagecharid && varList) {
						if (varType == "$") {
							varList.forEach((element) => storeRollVar(cardParameters.storagecharid, prefix, element));
						}
						if (varType == "&") {
							varList.forEach((element) => storeStringVar(cardParameters.storagecharid, prefix, element));
						}
						if (varType == "@") {
							varList.forEach((element) => storeArray(cardParameters.storagecharid, prefix, element));
						}
						if (varType == ":") {
							varList.forEach((element) => storeHashTable(cardParameters.storagecharid, prefix, element));
						}
						if (varType == "#") {
							if (thisContent.toLowerCase().trim() == "allsettings") {
								varList = [];
								for (var key in cardParameters) {
									if (cardParameters[key] !== defaultParameters[key]) {
										if (key != "storagecharid") {
											varList.push(key);
										}
									}
								}
							}
							varList.forEach((element) => storeSetting(cardParameters.storagecharid, prefix, element.toLowerCase(), cardParameters));
						}
					}
				}
			}
		} catch (e) {
			log(`Error stashing content ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleLoadCommands(thisTag, thisContent, cardParameters) {
		try {
			if (thisTag.charAt(0).toLowerCase() == "l") {
				switch (thisTag.substring(1).toLowerCase()) {
					case "rollvariables":
						if (thisContent.trim().length > 0 && state[APINAME].storedVariables[thisContent.trim()] != null) {
							newVariables = state[APINAME].storedVariables[thisContent.trim()];
							for (var key in newVariables) {
								rollVariables[key] = JSON.parse(JSON.stringify(newVariables[key]));
							}
						}
						break;

					case "stringvariables":
						if (thisContent.trim().length > 0 && state[APINAME].storedStrings[thisContent.trim()] != null) {
							newVariables = state[APINAME].storedStrings[thisContent.trim()];
							for (var key in newVariables) {
								stringVariables[key] = JSON.parse(JSON.stringify(newVariables[key]));
							}
						}
						break;

					case "settings":
						if (thisContent.trim().length > 0) {
							if (thisContent.trim().length > 0 && state[APINAME].storedSettings[thisContent.trim()] != null) {
								newSettings = state[APINAME].storedSettings[thisContent.trim()];
								for (var key in newSettings) {
									cardParameters[key] = newSettings[key];
								}
							} else {
								log(`Attempt to load stored settings ${thisContent.trim()}, but setting list not found.`)
							}
						}
						break;
				}
				if ("$&@#:".includes(thisTag.charAt(1))) {
					let varType = thisTag.charAt(1)
					let prefix = ""
					if (thisTag.length > 2) {
						prefix = thisTag.substring(2)
					}
					let varList = thisContent.split(cardParameters.parameterdelimiter)
					//log(`Loading: ${varType}, Prefix: ${prefix}, varList: ${varList}`)
					if (cardParameters.storagecharid && varList) {
						if (varType == "$") {
							varList.forEach((element) => loadRollVar(cardParameters.storagecharid, prefix, element));
						}
						if (varType == "&") {
							varList.forEach((element) => loadStringVar(cardParameters.storagecharid, prefix, element));
						}
						if (varType == "@") {
							varList.forEach((element) => loadArray(cardParameters.storagecharid, prefix, element));
						}
						if (varType == ":") {
							varList.forEach((element) => loadHashTable(cardParameters.storagecharid, prefix, element));
						}
						if (varType == "#") {
							if (thisContent.toLowerCase().trim() == "allsettings") {
								varList = [];
								for (var key in cardParameters) {
									if (key != "storagecharid") {
										varList.push(key);
									}
								}
							}
							varList.forEach((element) => loadSetting(cardParameters.storagecharid, prefix, element.toLowerCase(), cardParameters));
						}
						//if (varType == "#") {
						//	varList.forEach((element) => loadSetting(cardParameters.storagecharid, prefix, element.toLowerCase(), cardParameters));
						//}
					}
				}

			}
		} catch (e) {
			log(`Error loading stashed content ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleBlockEndCommand(thisTag, thisContent, cardLines) {
		try {
			if (thisContent.charAt(0) === "[") {
				if (lastBlockAction === "S") {
					lastBlockAction = "";
				}
				if (lastBlockAction === "E") {
					var line = lineCounter;
					for (line = lineCounter + 1; line < cardLines.length; line++) {
						if (getLineTag(cardLines[line], line, "").trim() === "]") {
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
		} catch (e) {
			log(`Error ending block statement ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleFunctionCommands(thisTag, thisContent, cardParameters, msg) {
		try {
			var variableName = thisTag.substring(1);
			var params = thisContent.split(cardParameters.parameterdelimiter);
			switch (params[0].toLowerCase()) {
				case "character":
					if (params.length >= 4) {
						switch (params[1].toLowerCase()) {
							case "runability":
								var charid = undefined
								var char = getObj("character", params[2]);
								if (char === undefined) {
									var actualToken = getObj("graphic", params[2]);
									if (actualToken != null) {
										charid = actualToken.get("represents");
										char = getObj("character", charid);
									}
								} else {
									charid = char.get("_id");
								}
								if (char != null) {
									var abilname = params[3]
									var ability = findObjs({ type: "ability", _characterid: charid, name: abilname })
									//if (ability != null && ability !== []) {
									if (Array.isArray(ability) && ability.length > 0) {
										ability = ability[0]
										if (ability != null) {
											sendChat(char.get("name"), ability.get('action').replace(/@\{([^|]*?|[^|]*?\|max|[^|]*?\|current)\}/g, '@{' + (char.get('name')) + '|$1}'));
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
										//log(cardParameters.locale);
										try {
											stringVariables[variableName] = d.toLocaleString(cardParameters.locale, { timeZone: cardParameters.timezone });
										} catch {
											stringVariables[variableName] = "Unknown/Invalid Locale or TimeZone";
										}
										break;
									case "gettime":
										try {
											stringVariables[variableName] = d.toLocaleTimeString(cardParameters.locale, { timeZone: cardParameters.timezone });
										} catch {
											stringVariables[variableName] = "Unknown/Invalid Locale or TimeZone";
										}
										break;
									case "getdate":
										try {
											stringVariables[variableName] = d.toLocaleDateString(cardParameters.locale, { timeZone: cardParameters.timezone });
										} catch {
											stringVariables[variableName] = "Unknown/Invalid Locale or TimeZone";
										}
										break;
									case "getraw":
									case "gettimestamp":
										stringVariables[variableName] = d.getTime();
										break;
								}
								break;

							case "playerisgm":
								stringVariables[variableName] = playerIsGM(params[2] || "") ? 1 : 0
								break;

							case "runaction":
							case "runability":
								var ability = findObjs({ type: "ability", _characterid: params[2], name: params[3] });
								var metacard = ability[0].get("action")
								if (Array.isArray(ability) && ability.length > 0) {
									for (let x = 4; x < params.length; x++) {
										metacard = metacard.replace(`[REPL${x - 3}]`, params[x])
									}
									metacard = metacard.replaceAll("-_-_", "--")
									sendChat("API", metacard);
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

									case "hash":
									case "hashtable":
									case "hashtables":
										for (var key in hashTables) {
											log(`Hash: ${key}, Value: ${JSON.stringify(hashTables[key])}`)
										}
										break
								}
								break;

							case "findability":
								// Params: 2-character name, 3-ability name
								stringVariables[variableName] = "AbilityNotFound";
								var theChar = findObjs({ _type: "character", name: params[2] });
								if (theChar[0]) {
									var theAbility = findObjs({ _type: "ability", _characterid: theChar[0].id, name: params[3] });
									if (theAbility[0]) {
										stringVariables[variableName] = theAbility[0].id;
									}
								}
								break;

							case "dropoutputlines":
								if (params[2].toLowerCase() == "all" || params[2].toLowerCase() == "both" || params[2].toLowerCase() == "direct") {
									outputLines = [];
									bareoutputLines = [];
								}
								if (params[2].toLowerCase() == "all" || params[2].toLowerCase() == "both" || params[2].toLowerCase() == "gmonly") {
									gmonlyLines = [];
								}
						}
					}
					break;

				case "turnorder":
					var variableName = thisTag.substring(1);
					if (params.length >= 2) {
						if (params[1].toLowerCase() == "clear") {
							Campaign().set("turnorder", "");
						}
						if (params[1].toLowerCase() == "getcurrentactor") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
							}
							//if (turnorder !== []) {
							if (Array.isArray(turnorder) && turnorder.length > 0) {
								stringVariables[variableName] = turnorder[0].id
							}
						}
						if (params[1].toLowerCase() == "sort") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
								turnorder.sort((a, b) => (Number(a.pr) > Number(b.pr)) ? 1 : ((Number(b.pr) > Number(a.pr)) ? -1 : 0))
								turnorder.reverse();
								Campaign().set("turnorder", JSON.stringify(turnorder));
							}
						}
					}
					if (params.length == 3) {
						if (params[1].toLowerCase() == "removetoken") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
							}
							for (var x = turnorder.length - 1; x >= 0; x--) {
								if (turnorder[x].id == params[2]) {
									turnorder.splice(x, 1);
								}
							}
							Campaign().set("turnorder", JSON.stringify(turnorder));
						}
						if (params[1].toLowerCase() == "removecustom") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
							}
							for (var x = turnorder.length - 1; x >= 0; x--) {
								if (turnorder[x].id == -1 && turnorder[x].custom == params[2]) {
									turnorder.splice(x, 1);
								}
							}
							Campaign().set("turnorder", JSON.stringify(turnorder));
						}
						if (params[1].toLowerCase() == "findtoken") {
							var turnorder = JSON.parse(Campaign().get("turnorder"));
							for (var x = turnorder.length - 1; x >= 0; x--) {
								if (turnorder[x].id.trim() == params[2].trim()) {
									stringVariables[variableName] = turnorder[x].pr;
									//log(`Set variable to ${turnorder[x].pr}`)
								}
							}
						}
						if (params[1].toLowerCase() == "sort") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
								turnorder.sort((a, b) => (Number(a.pr) > Number(b.pr)) ? 1 : ((Number(b.pr) > Number(a.pr)) ? -1 : 0))
								turnorder.reverse();
								if ((params[2].toLowerCase().startsWith("a"))) { turnorder.reverse(); }
								if ((params[2].toLowerCase().startsWith("u"))) { turnorder.reverse(); }
								Campaign().set("turnorder", JSON.stringify(turnorder));
							}
						}
					}
					if (params.length == 4 || params.length == 5 || params.length == 6 || params.length == 7) {
						if (params[1].toLowerCase() == "addtoken") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
							}
							var custom = params[4] || ""
							var formula = params[5] || ""
							var t = getObj('graphic', params[2]);
							if (t) {
								turnorder.push({
									id: params[2],
									pr: params[3],
									_pageid: t.get('pageid'),
									custom: custom,
									formula: formula
								});
							}
							Campaign().set("turnorder", JSON.stringify(turnorder));
						}
						if (params[1].toLowerCase() == "replacetoken") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
							}
							var wasfound = false;
							var custom = params[4] || ""
							var formula = params[5] || ""
							for (var x = turnorder.length - 1; x >= 0; x--) {
								if (turnorder[x].id.trim() == params[2].trim()) {
									turnorder[x].pr = params[3];
									turnorder[x].custom = custom;
									turnorder[x].formula = formula;
									wasfound = true;
								}
							}
							if (!wasfound) {
								var t = getObj('graphic', params[2]);
								if (t) {
									turnorder.push({
										id: params[2],
										pr: params[3],
										_pageid: t.get('pageid'),
										custom: custom,
										formula: formula
									});
								}
							}
							Campaign().set("turnorder", JSON.stringify(turnorder));
						}
						if (params[1].toLowerCase() == "addcustom") {
							var turnorder = [];
							if (Campaign().get("turnorder") !== "") {
								turnorder = JSON.parse(Campaign().get("turnorder"));
							}
							var custom = undefined || params[2]
							var pr = undefined || params[3]
							var formula = undefined || params[4]
							var insertionPoint = turnorder.length
							if (params[5]) {
								var insertion = params[5] || ""
								if (insertion !== "") {
									var foundIndex = -1
									if (insertion.toLowerCase() == "top") { insertionPoint = 0 }
									if (insertion.toLowerCase() == "bottom") { insertionPoint = turnorder.length }
									for (let to = 0; to < turnorder.length; to++) {
										if (turnorder[to].id == insertion.substring(insertion.indexOf(":") + 1)) {
											foundIndex = to
										}
									}
									if (foundIndex != -1) {
										if (insertion.toLowerCase().startsWith("before:") || insertion.toLowerCase().startsWith("above:")) {
											insertionPoint = foundIndex
										}
										if (insertion.toLowerCase().startsWith("after:") || insertion.toLowerCase().startsWith("below:")) {
											insertionPoint = foundIndex + 1
										}
									}
								}
							}
							turnorder.splice(insertionPoint, 0, {
								id: "-1",
								pr: pr,
								_pageid: Campaign().get('playerpageid'),
								custom: custom,
								formula: formula,
							});

							Campaign().set("turnorder", JSON.stringify(turnorder));
						}
					}
					break;

				// Chebyshev Unit distance between two tokens (params[1] and params[2]) (4E/5E)
				case "chebyshevdistance":
				case "distance":
				case "euclideandistance":
				case "manhattandistance":
				case "taxicabdistance":
					var result = 0;
					if (params.length >= 3) {
						let token1 = getObj("graphic", params[1]);
						let token2 = getObj("graphic", params[2]);
						if (token1 != null && token2 != null) {
							try {
								let scale = 1.0;
								let page = getObj("page", token1.get("_pageid"));
								if (page) { scale = page.get("snapping_increment") }
								let t1 = getTokenCoords(token1, scale)
								let t2 = getTokenCoords(token2, scale)
								if (params[0].toLowerCase() == "distance" || params[0].toLowerCase() == "chebyshevdistance") {
									result = Math.floor(Math.max(Math.abs(t1[0] - t2[0]), Math.abs(t1[1] - t2[1])));
								}
								if (params[0].toLowerCase() == "euclideandistance") {
									result = Math.floor(Math.sqrt(Math.pow((t1[0] - t2[0]), 2) + Math.pow((t1[1] - t2[1]), 2)));
								}
								if (params[0].toLowerCase() == "manhattandistance" || params[0].toLowerCase() == "taxicabdistance") {
									result = Math.abs(t2[0] - t1[0]) + Math.abs(t2[1] - t1[1]);
								}
							} catch {
								result = 0;
							}
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
						if (token1 != null && token2 != null) {
							try {
								var scale = 1.0;
								var page = getObj("page", token1.get("_pageid"));
								if (page) { scale = page.get("snapping_increment") }
								// Calculate the euclidean unit distance between two tokens (params[1] and params[2])
								let t1 = getTokenCoords(token1, (1 / 70))
								let t2 = getTokenCoords(token2, (1 / 70))
								result = Math.floor(Math.sqrt(Math.pow((t1[0] - t2[0]), 2) + Math.pow((t1[1] - t2[1]), 2)));
								if (params[0].toLowerCase() == "euclideanlong") { result = result / (scale * 70); }
							} catch {
								result = 0;
							}
						}
					}
					rollVariables[variableName] = parseDiceRoll(result.toString(), cardParameters);
					break;

				case "getselected":
					if (msg.selected) {
						for (var x = 0; x < msg.selected.length; x++) {
							var obj = getObj(msg.selected[x]._type, msg.selected[x]._id);
							stringVariables[variableName + (x + 1).toString()] = obj.get("id");
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
					switch (params[1].toLowerCase()) {
						case "min":
						case "max":
							if (params.length == 4) {
								let val1 = parseDiceRoll(params[2], cardParameters);
								let val2 = parseDiceRoll(params[3], cardParameters);
								rollVariables[variableName] = params[1].toLowerCase() == "min" ? (val1.Total <= val2.Total ? val1 : val2) :
									val1.Total >= val2.Total ? val1 : val2;
							}
							break;

						case "abs":
							if (params.length == 3 && !isNaN(parseFloat((params[2])))) {
								rollVariables[variableName] = parseDiceRoll(Math.abs(parseFloat(params[2])), cardParameters)
							}
							break;

						case "sqrt":
						case "squareroot":
							if (params.length == 3 && !isNaN(parseFloat((params[2])))) {
								rollVariables[variableName] = parseDiceRoll(Math.sqrt(parseFloat(params[2])), cardParameters)
							}
							break;

						case "clamp":
							if (params.length == 5) {
								let val = parseDiceRoll(params[2], cardParameters);
								let lower = parseDiceRoll(params[3], cardParameters);
								let upper = parseDiceRoll(params[4], cardParameters);
								val.Total >= lower.Total && val.Total <= upper.Total ? rollVariables[variableName] = val :
									val.Total < lower.Total ? rollVariables[variableName] = lower : rollVariables[variableName] = upper;
							}
							break;
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
							while (angle < 0) { angle = 360 + angle }
							stringVariables[variableName] = angle;
						}
					}
					break;

				case "attribute":
					if (params.length > 4) {
						if (params[1].toLowerCase() == "set") {
							var theCharacter = getObj("character", params[2]);
							if (theCharacter) {
								var oldAttrs = findObjs({ _type: "attribute", _characterid: params[2], name: params[3].trim() });
								if (oldAttrs.length > 0) {
									oldAttrs.forEach(function (element) { element.remove(); });
								}
								if (params[4] !== "") {
									createObj("attribute", { _characterid: params[2], name: params[3].trim(), current: params[4].trim() });
								}
							}
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
								rollVariables[variableName] = parseDiceRoll((params[2].length.toString()), cardParameters)
								break;

							case "tolowercase":
								setStringOrArrayElement(variableName, params[2].toLowerCase(), cardParameters)
								break;

							case "touppercase":
								setStringOrArrayElement(variableName, params[2].toUpperCase(), cardParameters)
								break;

							case "striphtml":
								setStringOrArrayElement(variableName, params[2].replace(/<[^>]*>?/gm, ''), cardParameters)
								break;

							case "trim":
								setStringOrArrayElement(variableName, params[2].trim(), cardParameters)
								break;

							case "onlynumbers":
								var tempvalue = params[2].trim().startsWith("-") ? "-" : "";
								tempvalue += params[2].replace(/\D/g, '')
								setStringOrArrayElement(variableName, tempvalue, cardParameters)
								break;

							case "nonumbers":
								setStringOrArrayElement(variableName, params[2].replace(/\d/g, ''), cardParameters)
								break;

							case "totitlecase":
								setStringOrArrayElement(variableName,
									params[2].toLowerCase()
										.split(' ')
										.map(function (word) {
											return (word.charAt(0).toUpperCase() + word.slice(1));
										})
										.join(" "),
									cardParameters);
								break;
						}
					}

					if (params.length == 4) {
						switch (params[1].toLowerCase()) {
							//stringfuncs;split;delimeter;string
							case "split":
								var splits = params[3].split(params[2]);
								rollVariables[variableName + "Count"] = parseDiceRoll(splits.length.toString(), cardParameters);
								for (var x = 0; x < splits.length; x++) {
									stringVariables[variableName + (x + 1).toString()] = splits[x];
								}
								break;

							//stringfuncs;before;delimiter;string
							case "before":
								if (params[3].indexOf(params[2]) < 0) {
									setStringOrArrayElement(variableName, params[3], cardParameters)
								} else {
									setStringOrArrayElement(variableName, params[3].substring(0, params[3].indexOf(params[2])), cardParameters);
								}
								break;

							//stringfuncs;after;delimeter;string
							case "after":
								if (params[3].indexOf(params[2]) < 0) {
									setStringOrArrayElement(variableName, params[3], cardParameters)
								} else {
									setStringOrArrayElement(variableName, params[3].substring(params[3].indexOf(params[2]) + params[2].length), cardParameters);
								}
								break;

							//stringfuncs;left;count;string
							case "left":
								if (params[3].length < Number(params[2])) {
									setStringOrArrayElement(variableName, params[3], cardParameters)
								} else {
									setStringOrArrayElement(variableName, params[3].substring(0, Number(params[2])), cardParameters);
								}
								break;

							//stringfuncs;right;count;string
							case "right":
								if (params[3].length < Number(params[2])) {
									setStringOrArrayElement(variableName, params[3], cardParameters)
								} else {
									setStringOrArrayElement(variableName, params[3].substring(params[3].length - Number(params[2])), cardParameters);
								}
								break;

							case "stripchars":
								var str = params[3]
								for (var i = 0; i < params[2].length; i++) {
									while (str.includes(params[2].substring(i, i + 1))) {
										str = str.replace(params[2].substring(i, i + 1), "")
									}
								}
								setStringOrArrayElement(variableName, str, cardParameters);
								break;

						}
					}

					if (params.length == 5) {
						switch (params[1].toLowerCase()) {
							//stringfuncs0;substring1;start2;length3;string4
							case "substring":
								setStringOrArrayElement(variableName, params[4].substring(Number(params[2]) - 1, Number(params[3]) + Number(params[2]) - 1), cardParameters);
								break;

							case "replace":
								setStringOrArrayElement(variableName, params[4].replace(params[2], params[3]), cardParameters);
								break;

							case "replaceall":
								if (!params[3].includes(params[2])) {
									var str = params[4];
									while (str.includes(params[2])) { str = str.replace(params[2], params[3]) }
									setStringOrArrayElement(variableName, str, cardParameters);
								}
								break;
						}
					}

					if (params.length > 2) {
						switch (params[1].toLowerCase()) {
							case "replaceencoding":
								var tempparams = Object.assign(params);
								tempparams.shift();
								tempparams.shift();
								var tempString = tempparams.join();
								for (let zz = 0; zz < EncodingReplaements.length; zz++) {
									let f = EncodingReplaements[zz].split(":")[0]
									let r = EncodingReplaements[zz].split(":")[1]
									if (f && tempString && r) {
										tempString = tempString.replaceAll(f.toUpperCase(), r);
										tempString = tempString.replaceAll(f.toLowerCase(), r);
									}
								}
								if (variableName) { setStringOrArrayElement(variableName, tempString, cardParameters) }
								break;
						}
					}
					break;

				case "hashtable":
				case "hash":
					if (params.length == 3) {
						if (params[1].toLowerCase() == "clear") {
							hashTables[params[2]] = {};
						}
					}

					if (params.length > 2) {
						if (params[1].toLowerCase() == "set") {
							try {
								let tableName = params[2];
								if (hashTables[tableName] === undefined) {
									hashTables[tableName] = {};
								}
								for (var x = 3; x < params.length; x++) {
									if (params[x].indexOf("==") > 0) {
										let thisKey = params[x].split("==")[0]
										let thisValue = params[x].split("==")[1]
										hashTables[tableName][thisKey] = thisValue
									}
								}
							} catch (e) {
								log(`ScriptCards: Error encounted: ${e}`)
							}
						}
						if (params[1].toLowerCase() == "fromobject") {
							try {
								let tableName = params[2];
								hashTables[tableName] = {};
								let theObject = getObj(params[3], params[4])
								let jsonArray = Object.entries(theObject.attributes);
								for (let j = 0; j < jsonArray.length; j++) {
									hashTables[tableName][jsonArray[j][0]] = jsonArray[j][1]
								}
							} catch (e) {
								log(`ScriptCards: Error encounted: ${e}`)
							}
						}

						if (params[1].toLowerCase() == "fromrepeatingsection") {
							try {
								let charid = params[2]
								let sectionname = params[3]
								let identifier = params[4]
								let hashname = params[5]
								let rowID = ""

								hashTables[hashname] = {};

								let sectionIDs = getRepeatingSectionIDs(charid, sectionname)

								for (let x = 0; x < sectionIDs.length; x++) {
									let thisSection = getSectionAttrsByID(charid, sectionname, sectionIDs[x])
									for (let y = 0; y < thisSection.length; y++) {
										let rowName = thisSection[y].split("|")[0]
										let rowValue = thisSection[y].split("|")[1]
										if (rowName.toLowerCase() == identifier) {
											rowID = rowValue
										}
									}

									for (let y = 0; y < thisSection.length; y++) {
										let rowName = thisSection[y].split("|")[0]
										let rowValue = thisSection[y].split("|")[1]
										if (rowValue.indexOf("@{") > -1) { rowValue = "Unsupported (AttrRef)" }
										if (rowValue.indexOf("[[") > -1) { rowValue = "Unsupported (InlineRoll)" }
										if (rowValue.indexOf("{{") > -1) { rowValue = "Unsupported (TemplateRef)" }
										if (!rowValue) { rowValue = "" }
										hashTables[hashname][rowID + "_" + rowName] = rowValue
									}
									hashTables[hashname][rowID + "_sectionid"] = sectionIDs[x]

								}
							} catch (e) {
								log(`ScriptCards: Error occured converting repeating section to hash table: ${e}`)
							}
						}

						if (params[1].toLowerCase() == "fromrepeatingrow") {
							try {
								let charid = params[2]
								let sectionname = params[3]
								let sectionID = params[4]
								let hashname = params[5]

								hashTables[hashname] = {};

								let thisSection = getSectionAttrsByID(charid, sectionname, sectionID)
								for (let y = 0; y < thisSection.length; y++) {
									let rowName = thisSection[y].split("|")[0]
									let rowValue = thisSection[y].split("|")[1]
									if (rowValue.indexOf("@{") > -1) { rowValue = "Unsupported (AttrRef)" }
									if (rowValue.indexOf("[[") > -1) { rowValue = "Unsupported (InlineRoll)" }
									if (rowValue.indexOf("{{") > -1) { rowValue = "Unsupported (TemplateRef)" }
									if (!rowValue) { rowValue = "" }
									hashTables[hashname][rowName] = rowValue
								}
							} catch (e) {
								log(`ScriptCards: Error occured converting repeating row to hash table: ${e}`)
							}
						}

						if (params[1].toLowerCase() == "getjukeboxtracks") {
							try {
								hashTables[params[2]] = {};
								let tracks = findObjs({ type: 'jukeboxtrack' });
								for (let j = 0; j < tracks.length; j++) {
									hashTables[params[2]][tracks[j].get("title")] = tracks[j].get("_id")
									hashTables[params[2]][tracks[j].get("title") + "-playing"] = tracks[j].get("playing")
									hashTables[params[2]][tracks[j].get("title") + "-loop"] = tracks[j].get("loop")
									hashTables[params[2]][tracks[j].get("title") + "-volume"] = tracks[j].get("volume")
								}
							} catch (e) {
								log(`ScriptCards: Error encounted: ${e}`)
							}
						}
						if (params[1].toLowerCase() == "getplayerspecificpages") {
							try {
								hashTables[params[2]] = {};
								let pairs = breakObjectIntoPairs(Campaign().get("playerspecificpages"));
								for (let j = 0; j < pairs.length; j++) {
									hashTables[params[2]][pairs[j][0]] = pairs[j][1]
								}
							} catch (e) {
								log(e);
							}
						}
						if (params[1].toLowerCase() == "setplayerspecificpages") {
							try {
								var tempArray = [];
								if (hashTables[params[2]]) {
									Object.keys(hashTables[params[2]]).forEach(function (key) {
										let thisTemp = [];
										thisTemp.push(key)
										thisTemp.push(hashTables[params[2]][key])
										tempArray.push(thisTemp);
									});
								} else { tempArray = undefined }
								tempArray ? Campaign().set("playerspecificpages", arrayPairsToObject(tempArray)) : Campaign().set("playerspecificpages", false)
							} catch (e) { log(e) }
						}
					}
					break;

				case "array":
					if (params.length > 2) {
						if (params[1].toLowerCase() == "define") {
							arrayVariables[params[2]] = [];
							for (var x = 3; x < params.length; x++) {
								arrayVariables[params[2]].push(params[x]);
							}
							arrayIndexes[params[2]] = 0;
						}
						if (params[1].toLowerCase() == "sort") {
							if (arrayVariables[params[2]]) {
								arrayVariables[params[2]].sort();
								if (params[3] != null) {
									if (params[3].toLowerCase().startsWith("desc")) {
										arrayVariables[params[2]].reverse();
									}
								}
							}
						}
						if (params[1].toLowerCase() == "numericsort") {
							if (arrayVariables[params[2]]) {
								arrayVariables[params[2]].sort(function (a, b) { return parseInt(a) - parseInt(b) });
								if (params[3] != null) {
									if (params[3].toLowerCase().startsWith("desc")) {
										arrayVariables[params[2]].reverse();
									}
								}
							}
						}

						if (params[1].toLowerCase() == "fromrollvar") {
							// param2 = array, param3 = rollvar, param3 = rolled/kept/dropped
							try {
								arrayVariables[params[2]] = [];
								if (rollVariables[params[3]]) {
									switch (params[4].toLowerCase()) {
										case "rolled":
											arrayVariables[params[2]] = [...rollVariables[params[3]].RolledDice];
											break;
										case "kept":
											arrayVariables[params[2]] = [...rollVariables[params[3]].KeptDice];
											break;
										case "dropped":
											arrayVariables[params[2]] = [...rollVariables[params[3]].DroppedDice];
											break;
									}
								}
							} catch (e) {
								log(`ScriptCards: array fromrolleddice error: ${e}`)
							}
						}

						if (params[1].toLowerCase() == "fromtable") {
							arrayVariables[params[2]] = [];
							var theTable = findObjs({ type: "rollabletable", name: params[3] })[0];
							if (theTable != null) {
								var tableItems = findObjs({ type: "tableitem", _rollabletableid: theTable.id });
								if (tableItems != null) {
									tableItems.forEach(function (item) {
										arrayVariables[params[2]].push(item.get("name"))
									})
								}
								if (variableName) { stringVariables[variableName] = arrayVariables[params[2]].length; }
							}
						}

						if (params[1].toLowerCase() == "fromhashtablekeys" ||
							params[1].toLowerCase() == "fromkeys") {
							arrayVariables[params[2]] = [];
							if (hashTables[params[3]]) {
								Object.keys(hashTables[params[3]]).forEach(function (key) {
									arrayVariables[params[2]].push(key);
								});
							}
							var theTable = findObjs({ type: "rollabletable", name: params[3] })[0];
							if (theTable != null) {
								var tableItems = findObjs({ type: "tableitem", _rollabletableid: theTable.id });
								if (tableItems != null) {
									tableItems.forEach(function (item) {
										arrayVariables[params[2]].push(item.get("name"))
									})
								}
								if (variableName) { stringVariables[variableName] = arrayVariables[params[2]].length; }
							}
						}

						if (params[1].toLowerCase() == "fromtableweighted") {
							arrayVariables[params[2]] = [];
							var theTable = findObjs({ type: "rollabletable", name: params[3] })[0];
							if (theTable != null) {
								var tableItems = findObjs({ type: "tableitem", _rollabletableid: theTable.id });
								if (tableItems != null) {
									tableItems.forEach(function (item) {
										for (let w = 0; w < Number(item.get("weight")); w++) {
											arrayVariables[params[2]].push(item.get("name"))
										}
									})
								}
								if (variableName) { stringVariables[variableName] = arrayVariables[params[2]].length; }
							}
						}

						if (params[1].toLowerCase() == "stringify") {
							if (arrayVariables[params[2]]) {
								var sep = cardParameters.parameterdelimiter;
								if (params[3] != null && params[3] != null) {
									sep = params[3];
								}
								setStringOrArrayElement(variableName, arrayVariables[params[2]].join(sep), cardParameters);
							} else {
								setStringOrArrayElement(variableName, "", cardParameters);
							}
						}

						if (params[1].toLowerCase() == "fromcontrolledcharacters") {
							arrayVariables[params[2]] = [];
							var chars = findObjs({ type: "character" });
							if (chars && chars[0]) {
								for (let x = 0; x < chars.length; x++) {
									if (chars[x].get("controlledby").includes(params[3])) {
										arrayVariables[params[2]].push(chars[x].id)
									}
								}
							}
						}

						if (params[1].toLowerCase() == "fromplayerlist") {
							arrayVariables[params[2]] = [];
							var players = findObjs({ type: "player" });
							for (let x = 0; x < players.length; x++) {
								if (!playerIsGM(players[x].id)) {
									arrayVariables[params[2]].push(players[x].id)
								}
							}
						}

						if (params[1].toLowerCase() == "fromgmplayerlist") {
							arrayVariables[params[2]] = [];
							var players = findObjs({ type: "player" });
							for (let x = 0; x < players.length; x++) {
								if (playerIsGM(players[x].id)) {
									arrayVariables[params[2]].push(players[x].id)
								}
							}
						}

						if (params[1].toLowerCase() == "pagetokens") {
							arrayVariables[params[2]] = [];
							var pageid = params[3];
							var templateToken = getObj("graphic", params[3]);
							var foundTokens = []
							if (templateToken) {
								pageid = templateToken.get("_pageid");
							}
							if (getObj("page", pageid)) {
								foundTokens = findObjs({ _type: "graphic", _pageid: pageid });
							}
							if (params[4]) {
								for (let p = 4; p < params.length; p++) {
									for (let t = foundTokens.length - 1; t >= 0; t--) {
										if (params[p].toLowerCase() == "char" || params[p].toLowerCase() == "chars") {
											if (isBlank(foundTokens[t].get("represents"))) {
												foundTokens.splice(t, 1);
											}
										}

										if (params[p].toLowerCase() == "graphic" || params[p].toLowerCase() == "graphics") {
											if (!isBlank(foundTokens[t].get("represents"))) {
												foundTokens.splice(t, 1);
											}
										}

										if (params[p].toLowerCase() == "npc" || params[p].toLowerCase() == "npcs") {
											if (isBlank(foundTokens[t].get("represents"))) {
												foundTokens.splice(t, 1);
											} else {
												if (!isBlank(getObj("character", foundTokens[t].get("represents")).get("controlledby"))) {
													foundTokens.splice(t, 1);
												}
											}
										}

										if (params[p].toLowerCase() == "pc" || params[p].toLowerCase() == "pcs") {
											if (isBlank(foundTokens[t].get("represents"))) {
												foundTokens.splice(t, 1);
											} else {
												if (isBlank(getObj("character", foundTokens[t].get("represents")).get("controlledby"))) {
													foundTokens.splice(t, 1);
												}
											}
										}

										if (params[p].toLowerCase().startsWith("attr:") ||
											params[p].toLowerCase().startsWith("prop:") ||
											params[p].toLowerCase().startsWith("tprop:")) {
											var attrFilter = "";
											var attrValue = "";
											let subfilter = params[p].toLowerCase().split(":")[0];
											if (subfilter.indexOf("~") > 0) {
												subfilter = subfilter.slice(0, -1)
											}
											try {
												if (params[p].indexOf("=") >= 0) {
													attrFilter = params[p].split(":")[1].split("=")[0];
													attrValue = (params[p].split(":")[1].split("=")[1]).toLowerCase().trim();
												}
												if (params[p].indexOf("~=") >= 0) {
													subfilter = subfilter + "_partial";
													attrFilter = params[p].split(":")[1].split("~=")[0];
													attrValue = (params[p].split(":")[1].split("~=")[1]).toLowerCase().trim();
												}
											} catch (e) {
												log('Incorrect pagetokens attribute filter syntax.')
											}
											var charobj = getObj("character", foundTokens[t].get("represents"));
											if (subfilter.startsWith("tp") || charobj) {
												switch (subfilter) {
													case "attr":
														if (!charobj) {
															foundTokens.splice(t, 1);
														} else {
															try {
																var attrFind = findObjs({ type: 'attribute', characterid: charobj.id, name: attrFilter })[0]
																if (!attrFind || attrFind.get('current').toLowerCase().trim() !== attrValue) {
																	foundTokens.splice(t, 1);
																}
															} catch (e) {
																foundTokens.splice(t, 1);
															}
														}
														break;

													case "attr_partial":
														if (!charobj) {
															foundTokens.splice(t, 1);
														} else {
															try {
																var attrFind = findObjs({ type: 'attribute', characterid: charobj.id, name: attrFilter })[0]
																if (!attrFind || attrFind.get('current').toLowerCase().trim().indexOf(attrValue) == -1) {
																	foundTokens.splice(t, 1);
																}
															} catch (e) {
																//
															}
														}
														break;

													case "prop":
														try {
															var charobj = getObj("character", foundTokens[t].get("represents"));
															if (charobj.get(attrFilter).toLowerCase().trim() !== attrValue) {
																foundTokens.splice(t, 1);
															}
														} catch (e) {
															//
														}
														break;

													case "prop_partial":
														try {
															var charobj = getObj("character", foundTokens[t].get("represents"));
															if (charobj.get(attrFilter).toLowerCase().trim().indexOf(attrValue) == -1) {
																foundTokens.splice(t, 1);
															}
														} catch (e) {
															//
														}
														break;

													case "tprop":
														try {
															if (foundTokens[t].get(attrFilter).toLowerCase().trim() !== attrValue) {
																foundTokens.splice(t, 1);
															}
														} catch (e) {
															//
														}
														break;

													case "tprop_partial":
														try {
															if (foundTokens[t].get(attrFilter).toLowerCase().trim().indexOf(attrValue) == -1) {
																foundTokens.splice(t, 1);
															}
														} catch (e) {
															//
														}
														break;
												}

											} else {
												foundTokens.splice(t, 1);
											}
										}
									}
								}
							}
							arrayVariables[params[2]] = [];
							for (let l = 0; l < foundTokens.length; l++) {
								arrayVariables[params[2]].push(foundTokens[l].id);
							}
							if (foundTokens.length > 0) {
								arrayIndexes[params[2]] = 0;
								if (variableName) { stringVariables[variableName] = arrayVariables[params[2]].length; }
							} else {
								arrayVariables[params[2]] = [];
								if (variableName) { stringVariables[variableName] = "0"; }
							}
						}

						if (params[1].toLowerCase().startsWith("objects:")) {
							var details = params[1].split(":");
							var objects = findObjs({ _type: details[1].toLowerCase() });
							var lookupField = "name";
							if (details[1].toLowerCase() == "player") { lookupField = "_displayname"; }
							if (details[1].toLowerCase() == "jukeboxtrack") { lookupField = "title"; }
							if (details[1].toLowerCase() == "hand") { lookupField = "_type"; }
							if (details[1].toLowerCase() == "card") { lookupField = "_type"; }
							if (details[1].toLowerCase() == "campaign") { lookupField = "_type"; }
							if (details[1].toLowerCase() == "path") { lookupField = "stroke"; }
							if (details[1].toLowerCase() == "text") { lookupField = "text"; }
							arrayVariables[params[2]] = [];
							for (var x = 0; x < objects.length; x++) {
								if (params[3] != null) {
									var okFilter = false || params[3] == "";
									var okChar = !(params[4] != null) || objects[x].get("characterid") == params[4];
									if (objects[x].get(lookupField).toLowerCase().startsWith(params[3].toLowerCase())) {
										okFilter = true;
									}
									if (okFilter && okChar) {
										arrayVariables[params[2]].push(objects[x].get("_id"));
									}
								} else {
									arrayVariables[params[2]].push(objects[x].get("_id"));
								}
							}
						}

						if (params[1].toLowerCase() == "attributes") {
							// Note P1=attributes, P2=array name, P3=character id, P4=Name Starts with
							try {
								var foundAttrs = findObjs({ type: "attribute", characterid: params[3] });
								if (foundAttrs && foundAttrs[0]) {
									arrayVariables[params[2]] = []
									for (let x = 0; x < foundAttrs.length; x++) {
										if (params[4]) {
											if (foundAttrs[x].get("name").startsWith(params[4])) {
												arrayVariables[params[2]].push(foundAttrs[x].id)
											}
										} else {
											arrayVariables[params[2]].push(foundAttrs[x].id)
										}
									}
								}
							} catch (e) { log(e); }
						}

						if (params[1].toLowerCase() == "selectedtokens") {
							if (msg.selected) {
								arrayVariables[params[2]] = [];
								for (var x = 0; x < msg.selected.length; x++) {
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
								for (var x = 0; x < markers.length; x++) {
									if (markers[x].trim() != "") {
										arrayVariables[params[2]].push(markers[x]);
									}
								}
								arrayIndexes[params[2]] = 0;
							}
						}
						if (params[1].toLowerCase() == "add") {
							if (!arrayVariables[params[2]]) { arrayVariables[params[2]] = []; arrayIndexes[params[2]] = 0; }
							for (var x = 3; x < params.length; x++) {
								arrayVariables[params[2]].push(params[x]);
							}
						}
						if (params[1].toLowerCase() == "remove") {
							if (arrayVariables[params[2]] && arrayVariables[params[2]].length > 0) {
								for (var x = 3; x < params.length; x++) {
									for (var i = arrayVariables[params[2]].length - 1; i >= 0; i--) {
										if (arrayVariables[params[2]][i] == params[x]) {
											arrayVariables[params[2]].splice(i, 1);
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
								if (Number(params[3] < arrayVariables[params[2]].length)) {
									arrayVariables[params[2]].splice(Number(params[3]), 1);
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
								arrayIndexes[params[2]] = arrayVariables[params[2]].length - 1;
								stringVariables[variableName] = arrayVariables[params[2]][arrayIndexes[params[2]]];
							} else {
								stringVariables[variableName] = "ArrayError";
							}
						}

						if (params[1].toLowerCase() == "getnext") {
							if (arrayVariables[params[2]]) {
								if (arrayIndexes[params[2]] < arrayVariables[params[2]].length - 1) {
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
								for (var i = 0; i < arrayVariables[params[2]].length; i++) {
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
							for (var x = 0; x < splitString.length; x++) {
								arrayVariables[params[2]].push(splitString[x]);
							}
							arrayIndexes[params[2]] = 0;
						}

						if (params[1].toLowerCase() == "fromrollabletable" || params[1].toLowerCase() == "fromtable") {
							// params: 1-fromrollabletable, 2-array name, 3-table name, 4-name or avatar or both)
							if (params[2] !== "") {
								arrayVariables[params[2]] = [];
								var theTable = findObjs({ type: "rollabletable", name: params[3] })[0];
								if (theTable != null) {
									findObjs({ type: "tableitem", _rollabletableid: theTable.id }).forEach(function (item) {
										if (item !== null) {
											switch (params[4].toLowerCase()) {
												case "avatar":
												case "image":
													arrayVariables[params[2]].push(item.get("avatar"));
													break;

												case "name":
												case "text":
													arrayVariables[params[2]].push(item.get("name"));
													break;

												case "both":
													arrayVariables[params[2]].push(`${item.get("name")}|${item.get("avatar")}`)
													break;
											}
										}
									});
								}
							}
						}
					}
					if (params.length == 6) {
						if (params[1].toLowerCase() == "fromrepeatingsection" || params[1].toLowerCase() == "fromrepsection") {
							if (params[2] !== "") {
								try {
									arrayVariables[params[2]] = [];
									var pushValue = "";
									var localSectionIDs = getRepeatingSectionIDs(params[3], params[4]);
									if (localSectionIDs && localSectionIDs.length > 0) {
										for (var x = 0; x < localSectionIDs.length; x++) {
											var thisRepeatingSection = getSectionAttrsByID(params[3], params[4], localSectionIDs[x]);
											pushValue = "";
											for (var q = 0; q < thisRepeatingSection.length; q++) {
												if (thisRepeatingSection[q].split("|")[0] == params[5]) {
													pushValue = thisRepeatingSection[q].split("|")[1];
												}
											}
											arrayVariables[params[2]].push(pushValue);
										}
									}
								} catch {
									arrayVariables[params[2]] = [];
								}
							}
						}
					}
					if (params.length == 7) {
						if (params[1].toLowerCase() == "fullrepeatingsection" || params[1].toLowerCase() == "fullrepsection") {
							if (params[2] !== "") {
								try {
									arrayVariables[params[2]] = [];
									var pushValue = "";
									var localSectionIDs = getRepeatingSectionIDs(params[3], params[4]);
									var attrList = params[5].split(":");
									if (localSectionIDs && localSectionIDs.length > 0) {
										for (var x = 0; x < localSectionIDs.length; x++) {
											pushValue = [];
											var thisRepeatingSection = getSectionAttrsByID(params[3], params[4], localSectionIDs[x]);
											for (var y = 0; y < attrList.length; y++) {
												var found = false
												for (var q = 0; q < thisRepeatingSection.length; q++) {
													if (thisRepeatingSection[q].split("|")[0] == attrList[y]) {
														if (thisRepeatingSection[q].split("|")[1] != null) {
															pushValue.push(thisRepeatingSection[q].split("|")[1]);
															found = true
														} else {
															pushValue.push("");
														}

													}
												}
												if (!found) { pushValue.push(""); }
											}
											arrayVariables[params[2]].push(pushValue.join(params[6]));
										}
									}
								} catch {
									arrayVariables[params[2]] = [];
								}
							}
						}
					}
					break;

				case "object":

					break;
			}
		} catch (e) {
			log(`Error executing function  ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleRollVariableSetCommand(thisTag, thisContent, cardParameters) {
		try {
			var rollIDName = thisTag.substring(1).trim();
			if (rollIDName.indexOf('.') == -1) {
				rollVariables[rollIDName] = parseDiceRoll(replaceVariableContent(thisContent, cardParameters), cardParameters, true);
			} else {
				var parts = rollIDName.split(".");
				if (parts[0] && rollVariables[parts[0]]) {
					if (parts[1] && rollVariables[parts[0]][parts[1]]) {
						rollVariables[parts[0]][parts[1]] = replaceVariableContent(thisContent, cardParameters);
					}
				}
			}
		} catch (e) {
			log(`Error setting roll variable ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleRepeatingAttributeCommands(thisTag, thisContent, cardParameters) {
		try {
			var command = thisTag.substring(1).toLowerCase();
			var param = thisContent.split(cardParameters.parameterdelimiter);
			//log(`Processing Repeating Section Command: ${command}, Params: ${param}`)
			switch (command.toLowerCase()) {
				case "find":
				case "search":
					var fuzzy = (command.toLowerCase() == "search" ? true : false)
					repeatingSection = getSectionAttrs(param[0], param[1], param[2], param[3], fuzzy);
					fillCharAttrs(findObjs({ _type: 'attribute', _characterid: param[0] }));
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
					break;
				case "first":
					repeatingSectionIDs = getRepeatingSectionIDs(param[0], param[1]);
					if (repeatingSectionIDs) {
						repeatingIndex = 0;
						repeatingCharID = param[0];
						repeatingSectionName = param[1];
						fillCharAttrs(findObjs({ _type: 'attribute', _characterid: repeatingCharID }));
						repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]);
						repeatingIndex = 0;
					} else {
						repeatingSection = undefined;
					}
					break;
				case "byindex":
					if (param[0] && param[1] && param[2]) {
						repeatingSectionIDs = getRepeatingSectionIDs(param[0], param[1]);
						if (repeatingSectionIDs) {
							repeatingIndex = Number(param[2]);
							repeatingCharID = param[0];
							repeatingSectionName = param[1];
							fillCharAttrs(findObjs({ _type: 'attribute', _characterid: repeatingCharID }));
							repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]);
							repeatingIndex = Number(param[2]);
						} else {
							repeatingSection = undefined;
						}
					} else {
						repeatingSection = undefined;
					}
					break;
				case "bysectionid":
					if (param[0] && param[1] && param[2]) {
						let charID = param[0]
						let secName = param[1]
						var ci = false
						if (param[3] && (param[3] == "1" || param[3].toLowerCase() == "i")) {
							ci = true
						}
						repeatingSectionIDs = getRepeatingSectionIDs(charID, secName);
						if (repeatingSectionIDs) {
							repeatingIndex = undefined;
							for (let x = 0; x < repeatingSectionIDs.length; x++) {
								if (repeatingSectionIDs[x].trim() == param[2].trim()) {
									repeatingIndex = x;
								}
								if (ci && repeatingSectionIDs[x].toLowerCase().trim() == param[2].toLowerCase().trim()) {
									repeatingIndex = x;
								}
							}
							repeatingCharID = charID;
							repeatingSectionName = secName;
							fillCharAttrs(findObjs({ _type: 'attribute', _characterid: repeatingCharID }));
							repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]);
						} else {
							repeatingSection = undefined;
						}
					} else {
						repeatingSection = undefined;
					}
					break;
				case "next":
					if (repeatingSectionIDs) {
						if (repeatingSectionIDs[repeatingIndex + 1]) {
							repeatingIndex++;
							repeatingSection = getSectionAttrsByID(repeatingCharID, repeatingSectionName, repeatingSectionIDs[repeatingIndex]);
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
						for (var x = 0; x < repeatingSection.length; x++) {
							log(repeatingSection[x]);
						}
					}
					break;
			}
		} catch (e) {
			log(`Error processing Repeating Section command ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleConditionalBlock(thisTag, thisContent, cardParameters, cardLines) {
		try {
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
			if (falseDest == "[" || trueDest == "]") {
				var curDepth = blockDepth
				blockDepth++
			}
			if (isTrue && falseDest == "[") { blockSkip = true; }
			if (!isTrue && trueDest == "[") { blockSkip = true; }
			if (jumpDest) {
				switch (jumpDest.charAt(0)) {
					case ">": resultType = "gosub"; break;
					case "<": resultType = "return"; break;
					case "%": resultType = "next"; break;
					case "[": resultType = "block"; break;
					case "+": resultType = "directoutput"; break;
					case "*": resultType = "gmoutput"; break;
					case "=":
					case "&":
						jumpDest.charAt(0) == "=" ? resultType = "rollset" : resultType = "stringset";
						jumpDest = jumpDest.substring(1);
						varName = jumpDest.split(cardParameters.parameterdelimiter)[0];
						varValue = jumpDest.split(cardParameters.parameterdelimiter)[1];
						break;
				}

				switch (resultType) {
					case "goto":
						if (lineLabels[jumpDest]) {
							lineCounter = lineLabels[jumpDest];
						} else {
							log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter} (${thisTag}, ${thisContent})`);
						}
						break;
					case "return":
						arrayVariables["args"] = []
						if (returnStack.length > 0) {
							arrayVariables["args"] = [];
							callParamList = parameterStack.pop();
							if (callParamList) {
								for (const [key, value] of Object.entries(callParamList)) {
									arrayVariables["args"].push(value.toString().trim());
								}
							}
							lineCounter = returnStack.pop();
						}
						break;
					case "directoutput":
					case "gmoutput":
						if (jumpDest.split(";") != null) {
							var conditionalTag = jumpDest.split(";")[0];
							var conditionalContent = jumpDest.substring(jumpDest.indexOf(";") + 1);
							if (jumpDest.indexOf(";") < 0) {
								conditionalContent = "";
							}
							var rowData = buildRowOutput(conditionalTag.substring(1), replaceVariableContent(conditionalContent, cardParameters, true), cardParameters.outputtagprefix, cardParameters.outputcontentprefix);

							tableLineCounter += 1;
							if (tableLineCounter % 2 == 0) {
								while (rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.evenrowfontcolor); }
								while (rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; background-image: ${cardParameters.evenrowbackgroundimage}; `); }
							} else {
								while (rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.oddrowfontcolor); }
								while (rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; background-image: ${cardParameters.oddrowbackgroundimage}; `); }
							}
							rowData = processInlineFormatting(rowData, cardParameters, false);
							if (resultType == "directoutput") {
								outputLines.push(rowData);
							} else {
								gmonlyLines.push(rowData);
							}
						}
						break;
					case "gosub":
						jumpDest = jumpDest.substring(1);
						var nestSkip = 0;
						parameterStack.push(callParamList);
						var paramList = CSVtoArray(jumpDest.trim());
						callParamList = {};
						var paramCount = 0;
						arrayVariables["args"] = []
						if (paramList) {
							paramList.forEach(function (item) {
								callParamList[paramCount] = item.toString().trim();
								arrayVariables["args"].push(item.toString().trim());
								paramCount++;
							});
						}
						returnStack.push(lineCounter);
						jumpDest = jumpDest.split(cardParameters.parameterdelimiter)[0];
						if (lineLabels[jumpDest]) {
							lineCounter = lineLabels[jumpDest];
						} else {
							log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter} (${thisTag}, ${thisContent})`);
						}
						break;
					case "rollset":
						rollVariables[varName] = parseDiceRoll(replaceVariableContent(varValue, cardParameters, false), cardParameters);
						break;
					case "stringset":
						if (varName) {
							setStringOrArrayElement(varName, varValue, cardParameters);
						} else {
							log(`ScriptCards Error: Variable name or value not specified in conditional on line ${lineCounter} (${thisTag}) ${thisContent}`);
						}
						break;
					case "next":
						if (loopStack.length >= 1) {
							var currentLoop = loopStack[loopStack.length - 1];
							var breakLoop = false;
							if (loopControl[currentLoop]) {
								loopControl[currentLoop].current += loopControl[currentLoop].step;
								switch (loopControl[currentLoop].loopType) {
									case "fornext":
										stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
										break;
									case "foreach":
										if (jumpDest.charAt(1) !== "!") {
											try {
												stringVariables[currentLoop] = arrayVariables[loopControl[currentLoop].arrayName][loopControl[currentLoop].current]
											} catch {
												stringVariables[currentLoop] = "ArrayError"
											}
										}
										break;
									case "while":
									case "until":
										breakLoop = true;
										break;
								}
								if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
									(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
									jumpDest.charAt(1) == "!" || breakLoop) {
									loopStack.pop();
									delete loopControl[currentLoop];
									blockSkip = true;
									blockChar = "%";
								} else {
									lineCounter = loopControl[currentLoop].nextIndex;
								}
							}
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
				for (line = lineCounter + 1; line < cardLines.length; line++) {
					if (getLineTag(cardLines[line], line, "").trim() == blockChar) {
						lineCounter = line + (blockChar == "]" ? 0 : 0);
						break;
					}
				}
				if (lineCounter > cardLines.length) {
					log(`ScriptCards: Warning - no end block marker found for block started reference on line ${lineCounter}`);
					lineCounter = cardLines.length + 1;
				}
			}
		} catch (e) {
			log(`Error processing conditional ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}
	}

	function handleCaseCommand(thisTag, thisContent, cardParameters, cardLines) {
		try {
			var testvalue = thisTag.substring(1);
			var cases = thisContent.split("|");
			var blockSkip = false;
			var blockChar = "";
			if (cases) {
				for (var x = 0; x < cases.length; x++) {
					var testcase = cases[x].split(":")[0];
					if (testvalue.toLowerCase() == testcase.toLowerCase()) {
						var jumpDest = cases[x].split(":")[1];
						var resultType = "goto";
						var varName = undefined;
						var varValue = undefined;
						if (jumpDest) {
							switch (jumpDest.charAt(0)) {
								case ">": resultType = "gosub"; break;
								case "<": resultType = "return"; break;
								case "%": resultType = "next"; break;
								case "+": resultType = "directoutput"; break;
								case "*": resultType = "gmoutput"; break;
								case "=":
								case "&":
									jumpDest.charAt(0) == "=" ? resultType = "rollset" : resultType = "stringset";
									jumpDest = jumpDest.substring(1);
									varName = jumpDest.split(cardParameters.parameterdelimiter)[0];
									varValue = jumpDest.split(cardParameters.parameterdelimiter)[1];
									break;
							}

							switch (resultType) {
								case "goto":
									if (lineLabels[jumpDest]) {
										lineCounter = lineLabels[jumpDest];
									} else {
										log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter} (${thisTag}, ${thisContent})`);
									}
									break;
								case "return":
									arrayVariables["args"] = []
									if (returnStack.length > 0) {
										callParamList = parameterStack.pop();
										if (callParamList) {
											for (const [key, value] of Object.entries(callParamList)) {
												arrayVariables["args"].push(value.toString().trim());
											}
										}
										lineCounter = returnStack.pop();
									}
									break;
								case "directoutput":
								case "gmoutput":
									if (jumpDest.split(";") != null) {
										var conditionalTag = jumpDest.split(";")[0];
										var conditionalContent = jumpDest.substring(jumpDest.indexOf(";") + 1);
										if (jumpDest.indexOf(";") < 0) {
											conditionalContent = "";
										}
										var rowData = buildRowOutput(conditionalTag.substring(1), replaceVariableContent(conditionalContent, cardParameters, true), cardParameters.outputtagprefix, cardParameters.outputcontentprefix);

										tableLineCounter += 1;
										if (tableLineCounter % 2 == 0) {
											while (rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.evenrowfontcolor); }
											while (rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.evenrowbackground}; background-image: ${cardParameters.evenrowbackgroundimage}; `); }
										} else {
											while (rowData.indexOf("=X=FONTCOLOR=X=") > 0) { rowData = rowData.replace("=X=FONTCOLOR=X=", cardParameters.oddrowfontcolor); }
											while (rowData.indexOf("=X=ROWBG=X=") > 0) { rowData = rowData.replace("=X=ROWBG=X=", ` background: ${cardParameters.oddrowbackground}; background-image: ${cardParameters.oddrowbackgroundimage}; `); }
										}

										rowData = processInlineFormatting(rowData, cardParameters, false);
										if (resultType == "directoutput") {
											outputLines.push(rowData);
										} else {
											gmonlyLines.push(rowData);
										}
									}
									break;
								case "gosub":
									jumpDest = jumpDest.substring(1);
									parameterStack.push(callParamList);
									var paramList = CSVtoArray(jumpDest.trim());
									callParamList = {};
									var paramCount = 0;
									arrayVariables["args"] = []
									if (paramList) {
										paramList.forEach(function (item) {
											callParamList[paramCount] = item.toString().trim();
											arrayVariables["args"].push(item.toString().trim());
											paramCount++;
										});
									}
									returnStack.push(lineCounter);
									jumpDest = jumpDest.split(cardParameters.parameterdelimiter)[0];
									if (lineLabels[jumpDest]) {
										lineCounter = lineLabels[jumpDest];
									} else {
										log(`ScriptCards Error: Label ${jumpDest} is not defined on line ${lineCounter} (${thisTag}, ${thisContent})`);
									}
									break;
								case "rollset":
									rollVariables[varName] = parseDiceRoll(replaceVariableContent(varValue, cardParameters), cardParameters, true);
									break;
								case "stringset":
									if (varName) {
										setStringOrArrayElement(varName, varValue, cardParameters);
									} else {
										log(`ScriptCards Error: Variable name or value not specified in conditional on line ${lineCounter} (${thisTag}) ${thisContent}`);
									}
									break;
								case "next":
									if (loopStack.length >= 1) {
										var currentLoop = loopStack[loopStack.length - 1];
										var breakLoop = false;
										if (loopControl[currentLoop]) {
											loopControl[currentLoop].current += loopControl[currentLoop].step;
											switch (loopControl[currentLoop].loopType) {
												case "fornext":
													stringVariables[currentLoop] = loopControl[currentLoop].current.toString();
													break;
												case "foreach":
													if (jumpDest.charAt(1) !== "!") {
														try {
															stringVariables[currentLoop] = arrayVariables[loopControl[currentLoop].arrayName][loopControl[currentLoop].current]
														} catch {
															stringVariables[currentLoop] = "ArrayError"
														}
													}
													break;
												case "while":
												case "until":
													breakLoop = true;
													break;
											}
											if ((loopControl[currentLoop].step > 0 && loopControl[currentLoop].current > loopControl[currentLoop].end) ||
												(loopControl[currentLoop].step < 0 && loopControl[currentLoop].current < loopControl[currentLoop].end) ||
												jumpDest.charAt(1) == "!" || breakLoop) {
												loopStack.pop();
												delete loopControl[currentLoop];
												blockSkip = true;
												blockChar = "%";
											} else {
												lineCounter = loopControl[currentLoop].nextIndex;
											}
										}
									}
									break;
							}
							x = cases.length + 1;
						}
					}
				}
			}
			if (blockSkip) {
				var line = lineCounter;
				for (line = lineCounter + 1; line < cardLines.length; line++) {
					if (getLineTag(cardLines[line], line, "").trim() == blockChar) {
						lineCounter = line;
						break;
					}
				}
				if (lineCounter > cardLines.length) {
					log(`ScriptCards: Warning - no end block marker found for block started reference on line ${lineCounter}`);
					lineCounter = cardLines.length + 1;
				}
			}
		} catch (e) {
			log(`Error processing case statement ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)
		}

	}

	function reportBenchmarkingData() {
		log(benchmarks);
		let difference = Date.now() - scriptStartTimestamp
		log(`Script Execution Time: ${difference} ms`)
		log(`Executed script lines: ${executionCounter}`)
	}

	/*
	const getNotes = function (prop, obj) {
		return new Promise((resolve, reject) => {
			obj.get(prop, (p) => {
				resolve(p);
			});
		});
	};
	*/

	function getSafeTriggerString(prefix, property) {
		try {
			let prop = property
			prop == null ? prop = "" : prop = prop.toString()
			if (prop.toString().indexOf("--") < 0) {
				return ` --&${prefix}|${prop} `
			}
			let split = prop.split("--")
			let ret = ""
			for (let x = 0; x < split.length; x++) {
				ret += ` --&${prefix}|${x == 0 ? "" : "+-"}${split[x]}${x < (split.length - 1) ? "-" : ""}`
			}
			return ret;
		} catch (e) {
			log(`Error creating safe trigger string: ${e.message}`)
		}
	}

	return {
		ObserveTokenChange: observeTokenChange
	};

	function breakObjectIntoPairs(obj) {
		return Object.entries(obj);
	}

	function arrayPairsToObject(arrayPairs) {
		var obj = {};
		if (arrayPairs) {
			arrayPairs.forEach(pair => {
				const [key, value] = pair;
				obj[key] = value;
			});
		} else {
			return undefined;
		}
		return obj;
	}

	function getTokenCoords(token, scale) {
		try {
			return [token.get("left") / (scale * 70), token.get("top") / (scale * 70)]
		} catch (e) {
			log(e);
			return [0, 0]
		}
	}

	function onChangeCampaignTurnorder(triggerCharID) {
		var ability = findObjs({ type: "ability", _characterid: triggerCharID, name: "change:campaign:turnorder" });
		if (Array.isArray(ability) && ability.length > 0) {
			for (let ab = 0; ab < ability.length; ab++) {
				var replacement = ` `;
				var metacard = ability[ab].get("action").replace("--/|TRIGGER_REPLACEMENTS", replacement);
				sendChat("API", metacard);
			}
		}
	}

})();

// log(`Error setting z-order ${e.message}, thisTag: ${thisTag}, thisContent: ${thisContent}`)

// Meta marker for the end of ScriptCards
{ try { throw new Error(''); } catch (e) { API_Meta.ScriptCards.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ScriptCards.offset); } }

// Support for AirBag Crash Handler (if installed)
if (typeof MarkStop === "function") MarkStop('ScriptCards');