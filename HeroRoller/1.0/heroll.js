/*
=========================================================
Name			:	Hero Roller (heroll)
Version			:	1.2
Last Update		:	6/17/2020
GitHub			:	https://github.com/Roll20/roll20-api-scripts/tree/master/HeroRoller
Roll20 Contact	:	timmaugh
=========================================================

----------- DEVELOPMENT PATH ----------------------------
	-- utilize a "target" command; if there are multiple, output multiple hit-vs DCV and knockback results
	-- skill roll template
	-- explosion rings (separate BODY/STUN, or BODY/PD for entangles) peeling off dice

*/
const heroll = (() => {
	'use strict';

	// ==================================================
	//		VERSION
	// ==================================================
	const versionInfo = () => {
		const vrs = '1.2';
		const vd = new Date(1592600907866);
		log('\u0166\u0166 HeRoller v' + vrs + ', ' + vd.getFullYear() + '/' + (vd.getMonth() + 1) + '/' + vd.getDate() + ' \u0166\u0166');
		return;
	};

	const logsig = () => {
		// initialize shared namespace for all signed projects, if needed
		state.torii = state.torii || {};
		// initialize siglogged check, if needed
		state.torii.siglogged = state.torii.siglogged || false;
		state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
		if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
			const logsig = '\n' +
				'   ‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗     ' + '\n' +
				'    ∖_______________________________________∕     ' + '\n' +
				'      ∖___________________________________∕       ' + '\n' +
				'           ___┃ ┃_______________┃ ┃___            ' + '\n' +
				'          ┃___   _______________   ___┃           ' + '\n' +
				'              ┃ ┃               ┃ ┃               ' + '\n' +
				'              ┃ ┃               ┃ ┃               ' + '\n' +
				'              ┃ ┃               ┃ ┃               ' + '\n' +
				'              ┃ ┃               ┃ ┃               ' + '\n' +
				'              ┃ ┃               ┃ ┃               ' + '\n' +
				'______________┃ ┃_______________┃ ┃_______________' + '\n' +
				'             ⎞⎞⎛⎛            ⎞⎞⎛⎛      ' + '\n';
			log(`${logsig}`);
			state.torii.siglogged = true;
			state.torii.sigtime = Date.now();
		}
		return;
	};

	// ==================================================
	//		TABLES
	// ==================================================
	const radioTargetTable = {			// used with the radio_target attr
		"-1": "none",
		"1": "random",
		"2": "focus",
		"3": "headshot",
		"4": "highshot",
		"5": "bodyshot",
		"6": "lowshot",
		"7": "legshot",
		"8": "head",
		"9": "hand",
		"10": "shoulder",
		"11": "chest",
		"12": "stomach",
		"13": "vitals",
		"14": "thigh",
		"15": "leg",
		"16": "foot",
		"17": "arm",
	};

	const argAliasTable = {				// aliases for the various accepted arguments, flattening them to what they map to in the parameters object
		"p": "template",				// the template to use for the other parameter defaults
		"pow": "template",
		"pwr": "template",
		"power": "template",
		"t": "template",
		"tmp": "template",
		"template": "template",

		"rm": "mechanic",				// the die-rolling mechanic to use (normal, killing, or luck)
		"rollmech": "mechanic",
		"rollmechanic": "mechanic",
		"m": "mechanic",
		"mech": "mechanic",
		"mechanic": "mechanic",

		"db": "dbody",					// whether the roll should track a BODY value
		"dbody": "dbody",
		"doesbody": "dbody",

		"ds": "dstun",					// whether the roll should track a STUN value
		"dstun": "dstun",
		"doesstun": "dstun",

		"dkb": "dkb",					// whether the roll should track a knockback value
		"dknockback": "dkb",
		"doesknockback": "dkb",

		"xkb": "kbdicemod",				// knockback modifier; how many dice to add to base 2d6
		"extrakb": "kbdicemod",
		"kbdice": "kbdicemod",
		"kbdicemod": "kbdicemod",

		"xs": "stunmod",				// extra STUN modifier; added to base 
		"xstun": "stunmod",
		"extrastun": "stunmod",
		"stunmod": "stunmod",

		"l": "loc",						// a predefined hit location, or command to generate a hit location
		"loc": "loc",
		"location": "loc",

		"pl": "pointslabel",			// label for the Points Results (if used)
		"plbl": "pointslabel",
		"plabel": "pointslabel",
		"ptsl": "pointslabel",
		"ptslbl": "pointslabel",
		"ptslabel": "pointslabel",
		"pointsl": "pointslabel",
		"pointslbl": "pointslabel",
		"pointslabel": "pointslabel",

		"pn": "powername",				// name for the power
		"pname": "powername",
		"powername": "powername",

		"a": "act",						// if there is activation roll for the power
		"act": "act",
		"activation": "act",

		"c": "primarycolor",			// color for block elements, also drives secondary color and text color
		"col": "primarycolor",
		"color": "primarycolor",
		"pc": "primarycolor",
		"primarycolor": "primarycolor",

		"d": "dice",					// number of dice
		"dice": "dice",

		"of": "outputformat",			// whether the output should be tall or sidecar
		"output": "outputformat",
		"format": "outputformat",
		"sc": "outputformat",			// this one added specifically for value-less args (i.e., "--sc") to trigger the default value
		"outputformat": "outputformat",

		"mental": "useomcv",			// whether to use the mental OCV instead of OCV
		"um": "useomcv",
		"omcv": "useomcv",
		"useomcv": "useomcv",

		"o": "ocv",						// OCV override, use this if there is no character sheet to draw from
		"ocv": "ocv",

		"n": "notes",					// user notes
		"notes": "notes",

		"xd": "extradice",				// extra dice to be added to the dice (could be second source)
		"xdice": "extradice",
		"extradice": "extradice",

		"v": "verbose",					// logging of values to the chat for easier debugging
		"verbose": "verbose",

		"r": "recall",					// for recalling the last roll or the last roll for this user
		"rc": "recall",
		"recall": "recall",

		"tgt": "target",				// target of attack
		"target": "target",

		"s": "selective",				// whether multiple targets get indiv to-hit rolls
		"sel": "selective",
		"selective": "selective",
	};

	const templateAliasTable = {		// aliases for the various accepted templates
		"a": "a",						// AID
		"aid": "a",

		"b": "b",						// BLAST
		"blast": "b",

		"di": "di",						// DISPEL
		"dispel": "di",

		"dr": "dr",						// DRAIN
		"drain": "dr",

		"e": "e",						// ENTANGLE
		"entangle": "e",

		"f": "f",						// FLASH
		"flash": "f",

		"ha": "ha",						// HAND ATTACK
		"hattack": "ha",
		"handattack": "ha",

		"he": "he",						// HEALING
		"heal": "he",
		"healing": "he",

		"hk": "ka",						// KILLING ATTACK
		"rk": "ka",
		"k": "ka",
		"ka": "ka",
		"kattack": "ka",
		"killingattack": "ka",

		"mb": "mb",						// MENTAL BLAST
		"mblast": "mb",
		"mentalblast": "mb",

		"mi": "mi",						// MENTAL ILLUSIONS
		"millusions": "mi",
		"mentalillusions": "mi",
		"illusions": "mi",

		"mc": "mc",						// MIND CONTROL
		"mcontrol": "mc",
		"mindcontrol": "mc",

		"p": "p",						// POINTS
		"pts": "p",
		"points": "p",

		"t": "t",						// TRANSFORM
		"transform": "t",

		"l": "l",						// LUCK
		"luck": "l",

		"u": "u",						// UNLUCK
		"unluck": "u",

		"c": "c",						// CUSTOM (DEFAULT)
		"def": "c",
		"cust": "c",
		"default": "c",
		"custom": "c",
	};

	const noValArgDefaults = {			// used with command line arguments for which we don't need a value supplied (just their presence should trigger behavior)
		dbody: true,
		dstun: true,
		dkb: true,
		outputformat: 'sc',
		useomcv: true,
		verbose: true,
		recall: "", // the default case for this will be the current speaker id, so it is grabbed at the time it is needed
		selective: true,
		loc: "random",

	};

	// ==================================================
	//		UTILITY FUNCTIONS
	// ==================================================
	const splitArgs = (a) => { return a.split(":") };
	const joinVals = (a) => { return [a.slice(0)[0], a.slice(1).join(":").trim()]; };
	const lookFor = (arg) => (a) => { return a === arg; };
	const lookForArg = (arg) => (a) => { return a[0] === arg; };
	const lookForVal = (arg) => (a) => { return a[1] === arg; };
	const aliasesFrom = (o) => (a) => { return [((a[0] in o) ? o[a[0]] : a[0]), a[1]]; };
	const getKeyByValue = (object, value) => { return Object.entries(object)
															.filter(lookForVal(value))
															.map((a) => { return a[0]; });
	};

	const extendFromArray = (o, a) => {
		return a.reduce((o, e) => {
			o[e[0]] = e.slice(1).join();
			return o;
		}, o);
	};

	const storeState = (thisRoller) => {
		state.heroll[thisRoller.theSpeaker.id] = {};
		state.heroll[thisRoller.theSpeaker.id].parameters = thisRoller.parameters;
		state.heroll[thisRoller.theSpeaker.id].userparameters = thisRoller.userparameters;
		state.heroll[thisRoller.theSpeaker.id].theResult = thisRoller.theResult;
		state.heroll.lastSpeaker = thisRoller.theSpeaker.id;
		return;
	};

	const recallState = (thisRoller) => {
		let speakID = thisRoller.recallParameters.speakID || thisRoller.theSpeaker.id;
		if (typeof state.heroll[speakID] !== undefined) {
			thisRoller.parameters = state.heroll[speakID].parameters;
			thisRoller.userparameters = state.heroll[speakID].userparameters;
			thisRoller.theResult = state.heroll[speakID].theResult;

			// this will drive whether we load a previous roll
			thisRoller.recallParameters.recall = true;
		}
		return;
	};

	const roll3d6 =  () => {
		return randomInteger(6) + randomInteger(6) + randomInteger(6);
	};

	const getCountsFromArray = (rolls) => {
		// takes an array of numbers and returns an object structured as { NUMBER : COUNT }, where COUNT represents the # of appearances of that NUMBER
		return (_.reduce(rolls || [], (m, r) => {
			m[r] = (m[r] || 0) + 1;
			return m;
		}, {}));
	};

	const getArrayFromCounts = (c) => {
		// takes an object with properties structured as { NUMBER : COUNT } and returns an array of those NUMBERs repeated COUNT times
		return _.reduce(c, (m, v, k) => {
			_.times(v, () => { m.push(k); });
			return m;
		}, []);
	};

	const hexToRGB = (h) => {
		let r = 0, g = 0, b = 0;

		// 3 digits
		if (h.length == 4) {
			r = "0x" + h[1] + h[1];
			g = "0x" + h[2] + h[2];
			b = "0x" + h[3] + h[3];
			// 6 digits
		} else if (h.length == 7) {
			r = "0x" + h[1] + h[2];
			g = "0x" + h[3] + h[4];
			b = "0x" + h[5] + h[6];
		}
		return [+r, +g, +b];
	};

	const RGBToHex = (r, g, b) =>  {
		r = r.toString(16);
		g = g.toString(16);
		b = b.toString(16);

		if (r.length == 1)
			r = "0" + r;
		if (g.length == 1)
			g = "0" + g;
		if (b.length == 1)
			b = "0" + b;

		return "#" + r + g + b;
	};

	const getAltColor = (primarycolor) => {
		let pc = hexToRGB(primarycolor);
		let sc = [0, 0, 0];

		for (let i = 0; i < 3; i++) {
			sc[i] = Math.floor(pc[i] + (.35 * (255 - pc[i])));
		}

		return RGBToHex(sc[0], sc[1], sc[2]);
	};

	const getTextColor = (h) => {
		let hc = hexToRGB(h);
		return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
	};

	const getTheSpeaker = (msg) => {
		var characters = findObjs({ _type: 'character' });
		var speaking;
		characters.forEach(function (chr) { if (chr.get('name') == msg.who) speaking = chr; });
		if (speaking) {
			speaking.speakerType = "character";
			speaking.localName = speaking.get("name");
			speaking.radio_target = getCharacterAttr("radio_target", speaking.id);
			speaking.ocvFinal = getCharacterAttr("OCV", speaking.id);
			speaking.ocvBase = getCharacterAttr("ocv_base", speaking.id);
			speaking.ocvMods = speaking.ocvFinal - speaking.ocvBase;
		} else {
			speaking = getObj('player', msg.playerid);
			speaking.speakerType = "player";
			speaking.localName = speaking.get("displayname");
			speaking.radio_target = "none";
			speaking.ocvFinal = 0;
			speaking.ocvBase = 0;
			speaking.ocvMods = 0;
		}
		speaking.chatSpeaker = `${speaking.speakerType}|${speaking.id}`;
		return speaking;
	};

	const getCharacterAttr = (attr, charid) => {
		let attrDefaultTable = {
			"radio_target": -1,
			"OCV": 0,
			"ocv_base": 0,
			"DCV": 0,
			"DMCV": 0,
		}
		let defvalue = attrDefaultTable[attr];
		let retAttr = findObjs({ type: 'attribute', characterid: charid, name: attr })[0] || createObj("attribute", { name: attr, current: defvalue, characterid: charid });
		retAttr.currval = retAttr.get('current') || defvalue;
		return retAttr.currval;
	};

	const addAttribute = (attr, value, charid) => {
		let tempAttr = createObj("attribute", { name: attr, current: value, characterid: charid });
		return tempAttr;
	};

	const addAbility = (ability, value, charid) => {
		let tempAbil = createObj("ability", { name: ability, action: value, characterid: charid });
		return tempAbil;
	};

	const getLocationData = (loc) => {
		const locationDataTable = {
			head: { ocvmod: -8, ksx: 5, nsx: 2, bx: 2, hitlabel: "Head" },
			hand: { ocvmod: -6, ksx: 1, nsx: 0.5, bx: 0.5, hitlabel: "Hand" },
			arm: { ocvmod: -5, ksx: 2, nsx: 0.5, bx: 0.5, hitlabel: "Arm" },
			shoulder: { ocvmod: -5, ksx: 3, nsx: 1, bx: 1, hitlabel: "Shoulder" },
			chest: { ocvmod: -3, ksx: 3, nsx: 1, bx: 1, hitlabel: "Chest" },
			stomach: { ocvmod: -7, ksx: 4, nsx: 1.5, bx: 1, hitlabel: "Stomach" },
			vitals: { ocvmod: -8, ksx: 4, nsx: 1.5, bx: 2, hitlabel: "Vitals" },
			thigh: { ocvmod: -4, ksx: 2, nsx: 1, bx: 1, hitlabel: "Thigh" },
			leg: { ocvmod: -6, ksx: 2, nsx: 0.5, bx: 0.5, hitlabel: "Leg" },
			foot: { ocvmod: -8, ksx: 1, nsx: 0.5, bx: 0.5, hitlabel: "Foot" },
			headshot: { ocvmod: -4 },
			highshot: { ocvmod: -2 },
			bodyshot: { ocvmod: -1 },
			lowshot: { ocvmod: -2 },
			legshot: { ocvmod: -4 },
			focus: { ocvmod: -4, ksx: randomInteger(3), nsx: 1, bx: 1, hitlabel: "Focus" },
			random: { ocvmod: 0 },
			none: { ocvmod: 0, ksx: randomInteger(3), hitlabel: "none" },
		};
		return locationDataTable[loc] || locationDataTable.none;
	};

	const specHitLocation = (roll) => {
		let hit;
		if (roll < 6) hit = "head";
		else if (roll === 6) hit = "hand";
		else if (roll < 9) hit = "arm";
		else if (roll === 9) hit = "shoulder";
		else if (roll < 12) hit = "chest";
		else if (roll === 12) hit = "stomach";
		else if (roll === 13) hit = "vitals";
		else if (roll === 14) hit = "thigh";
		else if (roll < 17) hit = "leg";
		else hit = "foot";

		return hit;
	};

	const genHitLocation = (shot) => {
		let roll;
		switch (shot) {
			case "headshot":
				roll = randomInteger(6) + 3;
				break;

			case "highshot":
				roll = randomInteger(6) + randomInteger(6) + 1;
				break;

			case "bodyshot":
				roll = randomInteger(6) + randomInteger(6) + 4;
				break;

			case "lowshot":
				roll = Math.min(18, randomInteger(6) + randomInteger(6) + 7);
				break;

			case "legshot":
				roll = randomInteger(6) + 12;
				break;

			case "random":
			case "any":
			default:
				roll = roll3d6();
				break;
		}
		return roll;
	};

	const getDice = (n = 1, s = 6) => { // n is count of dice, s is sides
		let dice = [];
		for (let i = 0; i < n; i++) {
			dice.push(randomInteger(s));
		}
		return dice;
	};

	const normalizeDice = (dice) => {
		while (dice[2] >= 2) { // adder values at/over 2 should add to a 1d3, instead
			dice[1]++;
			dice[2] -= 2;
		}
		while (dice[2] <= -2) { // adder values at/below -2 should reduce a 1d3, instead
			if (dice[1] == 0) { // if d3 is already at 0, it should flow over to the d6
				if (dice[0] == 0) { // if the d6 is already 0, then the d3 should stay at 0 -- don't do anything
				} else { // the d6 is positive and can be decremented, meaning that the d3 number can increment
					dice[0]--;
					dice[1]++;
				}
			} else { // the d3 is positive and can be decremented
				dice[1]--;
			}
			dice[2] += 2;
		}
		while (dice[1] >= 2) { // every 2d3 should render 1d6 -- mostly important when combining dice and extradice arrays
			dice[0]++;
			dice[1] -= 2;
		}
		if (dice[0] != Math.floor(dice[0])) {
			const diff = Math.floor(dice[0] * 1000 - Math.floor(dice[0]) * 1000);
			dice[0] = Math.floor(dice[0]);
			if (diff <= 333) { // fractional dice up to this point should give a +1 to the adder
				dice[2]++;
			} else if (diff <= 666) { // fractional dice up to this point should give a half die (1d3)
				dice[1]++;
				if (dice[1] == 2) { // 2d3 should render 1d6
					dice[0]++;
					dice[1] = 0;
				}
			} else if (diff > 666) { // fractional dice up to this point should round to 1d6-1
				dice[0]++;
				dice[2]--;
			}
		}
		let d6 = Number(dice[0]) + Number(dice[1]) / 2;
		dice[4] = d6 + 'd6';
		if (dice[2] != 0) {
			dice[4] += (dice[2] > 0 ? "+" : "-") + Math.abs(dice[2]);
		}
		return dice;
	};

	const prioritizeArg = (arg, theFunc, thisRoller, ...passArgs) => {
		// see if the user supplied this argument
		if (thisRoller.userparameters[arg] !== "--") {
			// write sanitized value to the parameters
			thisRoller.parameters[arg] = validateInput(thisRoller.userparameters[arg].toLowerCase(), arg, thisRoller.userparameters[arg]);
			// call the process function specific to the argument being processed, spread the arguments that had beeen gathered in the rest syntax
			theFunc(thisRoller, ...passArgs);
		}
		// this argument got prioritized to run before all arguments were processed, so remove it from our set of arguments requiring processing
		thisRoller.knownparams[thisRoller.knownparams.findIndex(lookFor(arg))] = thisRoller.knownparams.pop();
		return;
	};

	const validateInput = (input, test, origCap) => {

		let valInput;

		// if the user didn't supply an argument and the argument has a noVal default, use it
		if (noValArgDefaults.hasOwnProperty(test) && input === "") return noValArgDefaults[test];

		switch (test) {
			case "template": // the template to use for the other parameter defaults
				if (input.toLowerCase() in templateAliasTable) { // if found, supply the value (no need for a not-found test; template is already defaulted to "c", and will only change if this line passes)
					valInput = templateAliasTable[input.toLowerCase()];
				}
				break;

			case "mechanic":
				switch (input) {
					case "l":
					case "luck":
						valInput = "l";
						break;

					case "u":
					case "unluck":
						valInput = "u";
						break;

					case "k":
					case "killing":
						valInput = "k";
						break;

					case "n":
					case "normal":
					default:
						// if nothing is defined properly, stay with the default normal mechanic
						valInput = "n";
						break;
				}
				break;

			case "useomcv":
			case "verbose":
			case "dbody":
			case "dstun":
			case "dkb":
				switch (input) {
					case "y":
					case "yes":
					case "t":
					case "true":
						valInput = true;
						break;

					case "n":
					case "no":
					case "f":
					case "false":
					default:
						valInput = false;
						break;
				}
				break;

			case "dice":
				valInput = [1,0,0,"--","1d6"]; // this will represent the dice[] array--> [#d6, #d3, adder, rollmechanic shorthand, rebuilt equation]
				if (input == "check" || input == "skill" || input == "none") {
					valInput = [0, 0, 0, "--", "","check"]; // extra element to trigger check
				} else {
					let nomech = input;
					var mecharray = ["l", "k", "n", "u"];
					for (let i = 0, len = mecharray.length; i < len; i++) {
						if (input.includes(mecharray[i])) {
							nomech = input.replace(mecharray[i], "");
							valInput[3] = mecharray[i];
						}
					}
					// check if the roll contains 'd6'
					if (!nomech.includes("d6")) {
						if (!isNaN(Number(nomech))) { // if there is no 'd6' in the command line, but the value of the dice argument is a number, just use that as the d6 value and normalize after that
							valInput[0] = Number(nomech);
						}
					} else {
						valInput[0] = (isNaN(nomech.split("d6")[0]) ? valInput[0] : nomech.split("d6")[0]);
						valInput[2] = (isNaN(nomech.split("d6")[1]) ? valInput[2] : Number(nomech.split("d6")[1]));
					}
				}
				valInput = normalizeDice(valInput);
				break;

			case "extradice":
				valInput = [0,0,0,"--","0d6"]; // set to default values in case no number is provided
				if (isNaN(Number(input))) {
				} else {
					valInput[0] += Number(input);
					valInput = normalizeDice(valInput);
				}
				break;

			case "ocv":
			case "act":
			case "kbdicemod":
			case "stunmod":
				if (isNaN(Number(input))) {
					valInput = 0; //default to 0 if no number is provided
				} else {
					valInput = Number(input);
				}
				break;

			case "notes":
			case "powername":
			case "pointslabel":
				valInput = origCap; // get the original version of the capitalization for anything that will go straight to display
				break;

			case "primarycolor":
				var colorRegX = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i;
				valInput = '#' + (colorRegX.test(input) ? input.replace('#', '') : 'b0c4de');
				break;

			case "loc":										// LOCATION
				const valLoc = [
					"head", "hand", "arm", "shoulder", "chest", "stomach", "vitals", "thigh", "leg", "foot", "focus",
					"headshot", "highshot", "bodyshot", "lowshot", "legshot",
					"random", "none",
					"hands", "arms", "shoulders", "thighs", "legs", "feet",
				];

				if (valLoc.indexOf(input) === -1) { // not a valid location, but the user tried to set a location, so default should go to "random" instead of "none"
					valInput = "random";
				} else { // a valid location, but we need to reduce plural entries; join the keys with a pipe, then use that as the seed for a regexp that will drive a match
					const toSingular = {
						"hands": "hand",
						"arms": "arm",
						"shoulders": "shoulder",
						"thighs": "thigh",
						"legs": "leg",
						"feet": "foot",
					};

					valInput = input.replace(new RegExp(Object.keys(toSingular).join("|"), 'gi'), function (matched) { return toSingular[matched]; });
				}
				break;

			case "outputformat":
				switch (input) {
					case "sc":
					case "side":
					case "sidecar":
						valInput = "sc";
						break;

					case "t":
					case "tall":
					default:
						valInput = "tall";
						break;
				}

			case "target":
				valInput = origCap.split(/[\s,]/);				// split on white space or comma
				break;

			case "selective":
				valInput = true;
				break;
		}

		return valInput;
	};

	// ==================================================
	//		PROCESS FUNCTIONS
	// ==================================================
	const setDefaults = (msg, thisRoller) => {			//initializes various parameters
		// SPEAKER INFO
		thisRoller.theSpeaker = getTheSpeaker(msg);

		// STATE VARIABLE STORAGE
		state.heroll = state.heroll || {};
		state.heroll[thisRoller.theSpeaker.id] = state.heroll[thisRoller.theSpeaker.id] || {};
		state.heroll.lastSpeaker = state.heroll.lastSpeaker || "none";
		if (state.heroll.lastSpeaker !== "none") state.heroll[state.heroll.lastSpeaker] = state.heroll[state.heroll.lastSpeaker] || {};
		thisRoller.recallParameters = {
			recall: false,
			speakID: thisRoller.theSpeaker.id,
		};

		// USER INPUT
		thisRoller.userparameters = {							// record user provided values; default them to "--" for "not provided", set appropriately when the args are evaluated
			template: "--",
			powername: "--",
			mechanic: "--",
			dbody: "--",
			dstun: "--",
			dkb: "--",
			kbdicemod: "--",
			stunmod: "--",
			loc: "--",
			outputformat: "--",
			dice: "--",
			act: "--",
			primarycolor: "--",
			pointslabel: "--",
			useomcv: "--",
			ocv: "--",
			extradice: "--",
			recall: "--",
			verbose: "--",
			target: "--",
			selective: "--",
			notes: ""
		};

		// KNOWN PARAMETER KEYS									// for later iteration
		thisRoller.knownparams = Object.keys(thisRoller.userparameters);

		// VALIDATED PARAMETERS
		thisRoller.parameters = {								// validated user settings (passed through validateInput() function)
			template: "c",
			powername: "Attack",
			mechanic: "n",
			dbody: true,
			dstun: true,
			dkb: true,
			kbdicemod: 0,
			stunmod: 0,
			loc: "none",										// location if specified by user; can include 'shot' locations (i.e., 'headhshot')
			dice: [1, 0, 0, "--", "1d6"],						// d6, d3, adder, rollmechanic shorthand, roll equation without shorthand
			act: -100,											// activation for the try; invalid entry will set this to 0, so -100 is a trip that it isn't set
			primarycolor: "#b0c4de",
			pointslabel: "POINTS",
			outputformat: "tall",
			useomcv: false,
			ocv: -100,
			notes: "",
			extradice: [0, 0, 0, "--", "0d6"],					// d6, d3, adder, shorthand (not used), roll equation
			recall: "--",
			target: [],											// ids of any targets supplied
			selective: false,									// whether to roll individual to-hits for each supplied target
			verbose: false,

			//inaccessible to user
			outputas: "attack",
			actroll: roll3d6(),									// activation roll, only used if the activation argument is invoked by the user 
			xdice: [0, 0, 0, "--", "0d6"],						// for the combination of dice and extradice
			dcheck: false,										// if this is a check roll, not requiring a result output
		};

		// OUTPUT PARAMETERS
		thisRoller.outputParams = {								// HTML variables for formatting output
			__CHARNAME__: thisRoller.theSpeaker.localName,		// character name
			__MECH__: "N",										// text in the mechanic bubble
			__MECH_VIS__: "block",								// whether the mechanic bubble is visible (block; none)
			__MECH_BGC__: "#b0c4de",							// background-color for mechanic bubble
			__POWERNAME__: "Power Name",						// power name color text
			__PRIMARY_BG_COL__: "#b0c4de",						// background-color for any element (like power name) that is to match the primarycolor parameter
			__PRIMARY_TEXT_COL__: "#ffffff",					// text color for anything with the primary background color
			__DS_TALL_VIS__: "block",							// whether the die strength (ie, 6d6) in the tall format should be visible (block; none)
			__DIE_STRENGTH__: "1d6",							// value for the die strength, wherever it is used
			__ACT_VIS__: "none",								// whether the Activation block is visible (block; none)
			__ACT_TGT__: "",									// target for the activation roll
			__ACT_ROLL__: "",									// result of the activation roll
			__TOHIT_VIS__: "block",								// whether the To Hit Bar (OCV, ROLL, HIT DCV) should be visible
			__TOHIT_OCV_LBL__: "OCV",							// label for the OCV box
			__TOHIT_OCV__: "--",								// to hit OCV
			__TOHIT_ROLL__: "",									// to hit roll result
			__TOHIT_DCV_LBL__: "DCV",							// label for the DCV box
			__TOHIT_DCV__: "--",								// hit DCV
			__SECONDARY_BG_COL__: "#d8e1ee",					// color for secondary-color elements (like die pool); figured by javascript as shade of the primary color
			__SECONDARY_TEXT_COL__: "#ffffff",					// text color for anything with the secondary background color
			__LOC_TALL_VIS__: "none",							// whether the Hit Location bar in the tall format should be visible (block; none)
			__LOC_SC_VIS__: "none",								// whether the Hit Location bar in the sidecar format should be visible (block; none)
			__LOC__: "Location",								// Hit location
			__DIEPOOL__: "",									// Comma-delimited set of dice resulting from the roll (as well as any adders)
			__DIEPOOL_TALL_VIS__: "block",						// whether the die pool in the tall format should be visible (block for tall; none for sidecar)
			__RES_MULT_VIS__: "none",							// visibility for the Results Bar (with Location), used for hit-location multiples (block; none)
			__BODY_MULT__: "1",									// BODY multiplier (multiplied against the BODY remaining after defenses are applied)
			__STUN_MULT__: "1",									// STUN multiplier (multiplied agianst the STUN remaining after defenses) -- could be NStun if it is a Normal mechanic attack
			__RES_BODY__: "",									// BODY rolled on the dice
			__RES_STUN__: "",									// STUN rolled on the dice
			__RES_KB__: "",										// KB done by attack
			__RES_BASE_VIS__: "block",							// visibility for the Results Bar (without Location), used if location = none (block; none)
			__RES_PTS_VIS__: "none",							// visibility for the Results Bar (Points), used for Points output (block; none)
			__RES_PTS_LBL__: "POINTS",							// text for Points label in Results Bar (Points)
			__RES_PTS__: "",									// Points done (only used for points output)
			__V_VIS__: "none",									// visibility for verbose output (block; none)
			__V_NOTE__: "",										// place for note in verbose output
			__SIDECAR_VIS__: "none",							// visibility for all sidecar elements (works opposite of tall based elements) (block for sidecar; none for tall)
			__NOTES__: "",										// text from the notes argument
			__TARGET_TABLE_HOOK__: "",							// hook for the rows of target information, if one/more is specified
		};

		// RESULT ROLL
		thisRoller.theResult = {
			tohitroll: roll3d6(),								// base to-hit roll
			theroll: [],										// dice pool of the roll result
			dicecounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },	// count of how many of each was rolled
			d6counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },	// count of how many times each was rolled, only for d6 -- used to display results differently (d6 vs d3) in output
			d3counts: { 1: 0, 2: 0, 3: 0 },						// count of how many times each was rolled, only for d3 -- used to display results differently (d6 vs d3) in output
			normalstun: 0,
			normalbody: 0,
			killingbody: 0,
			points: { stun: 0, body: 0 },
			location: { ocvmod: 0, ksx: 1, nsx: 1, bx: 1, hitlabel: "" },
			kbroll: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
			knockback: 0,
			targetData: [],										// if targets are designated, this will hold any relevant data (pic, to hit roll, location, etc.)
		};
		return;
	};

	const processRecall = (thisRoller, args) => {
		// the recall speaker was already set to current speaker with the defaults, so we only need to overwrite it if there is a value supplied
		if (thisRoller.userparameters.recall !== "") { 
			thisRoller.recallParameters.speakID = (thisRoller.userparameters.recall === "last" && state.heroll.lastSpeaker !== "none") ? state.heroll.lastSpeaker : thisRoller.userparameters.recall;
		}

		// load previous roll
		recallState(thisRoller);

		if (thisRoller.recallParameters.recall === true) {
			// that just overwrote our user supplied arguments, so reapply with only those allowed
			// first, what isn't allowed:
			const dropProps = ["dice", "extradice", "recall", "template"];
			extendFromArray(thisRoller.userparameters, args.filter((a) => { return !dropProps.includes(a[0]); }));
		}
		return;
	};

	const setTemplateDefaults = (thisRoller) => {
		// a 'template' is a slate of parameters to set general behaviors
		// for instance, an Aid power uses the dice differently from an attack, etc.
		// the boilerplate attack template is "c" (custom); boilerplate points is "p" (points)
		// the template is initialized as "c" in the setDefaults function
		let templates = {
			a: { template: "a", powername: "Aid", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#ffaa7b", pointslabel: "POINTS OF AID", useomcv: false, outputas: "points" },
			b: { template: "b", powername: "Blast", mechanic: "n", dbody: true, dstun: true, dkb: true, primarycolor: "#5ac7ff", pointslabel: "POINTS", useomcv: false, outputas: "attack" },
			c: { template: "c", powername: "Attack", mechanic: "n", dbody: true, dstun: true, dkb: true, primarycolor: "#b0c4de", pointslabel: "POINTS", useomcv: false, outputas: "attack" },
			di: { template: "di", powername: "Dispel", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#b0c4de", pointslabel: "POINTS OF DISPEL", useomcv: false, outputas: "points" },
			dr: { template: "dr", powername: "Drain", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#ffaa7b", pointslabel: "POINTS OF DRAIN", useomcv: false, outputas: "points" },
			e: { template: "e", powername: "Entangle", mechanic: "n", dbody: true, dstun: false, dkb: false, primarycolor: "#b0c4de", pointslabel: "ENTANGLE BODY", useomcv: false, outputas: "points" },
			f: { template: "f", powername: "Flash", mechanic: "n", dbody: true, dstun: false, dkb: false, primarycolor: "#b0c4de", pointslabel: "SEGMENTS OF FLASH", useomcv: false, outputas: "points" },
			ha: { template: "ha", powername: "Hand Attack", mechanic: "n", dbody: true, dstun: true, dkb: true, primarycolor: "#0289ce", pointslabel: "POINTS", useomcv: false, outputas: "attack" },
			he: { template: "he", powername: "Healing", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#ffaa7b", pointslabel: "POINTS OF HEALING", useomcv: false, outputas: "points" },
			ka: { template: "ka", powername: "Killing Attack", mechanic: "k", dbody: true, dstun: true, dkb: true, primarycolor: "#ff5454", pointslabel: "POINTS", useomcv: false, outputas: "attack" },
			mb: { template: "mb", powername: "Mental Blast", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#c284ed", pointslabel: "POINTS", useomcv: true, outputas: "attack" },
			mi: { template: "mi", powername: "Mental Illusions", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#c284ed", pointslabel: "POINTS OF ILLUSION", useomcv: true, outputas: "points" },
			mc: { template: "mc", powername: "Mind Control", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#c284ed", pointslabel: "POINTS OF MIND CONTROL", useomcv: true, outputas: "points" },
			p: { template: "p", powername: "Points Power", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#9d41e8", pointslabel: "POINTS", useomcv: false, outputas: "points" },
			t: { template: "t", powername: "Transform", mechanic: "n", dbody: false, dstun: true, dkb: false, primarycolor: "#ffaa7b", pointslabel: "POINTS OF TRANSFORM", useomcv: false, outputas: "points" },
			l: { template: "l", powername: "Luck", mechanic: "l", dbody: false, dstun: false, dkb: false, primarycolor: "#35e54e", pointslabel: "POINTS OF LUCK", useomcv: false, outputas: "points" },
			u: { template: "u", powername: "Unluck", mechanic: "u", dbody: false, dstun: false, dkb: false, primarycolor: "#FF453B", pointslabel: "POINTS OF UNLUCK", useomcv: false, outputas: "points" },
		};
		Object.assign(thisRoller.parameters, templates[thisRoller.parameters.template]);
		return;
	};

	const processArguments = (thisRoller) => {
		// process each of the known parameters appearing in the command line
		// if the userparameters version is altered from the default, pass that value through validateInput to return the sanitized version
		thisRoller.knownparams.map((p) => { thisRoller.parameters[p] = thisRoller.userparameters[p] === "--" ? thisRoller.parameters[p] : validateInput(thisRoller.userparameters[p].toLowerCase(), p, thisRoller.userparameters[p]); });

		// change unrecognized args with no value to have "NA" instead (used in verbose output)
		Object.keys(thisRoller.userparameters).filter((a) => { return !thisRoller.knownparams.includes(a); })
											  .map((a) => { thisRoller.userparameters[a] === "" ? thisRoller.userparameters[a] = "NA" : thisRoller.userparameters[a]; });

		// set the roll mechanic parameter to the shorthand, if present
		// the roll mechanic property can be set in three places; the priority should be: template < explicit mech argument < shorthand
		thisRoller.parameters.mechanic = (thisRoller.parameters.dice[3] != "--" ? thisRoller.parameters.dice[3] : thisRoller.parameters.mechanic);

		// test if the dice parameter came back with the extra element denoting this is a check (should have 5 elements: d6, d3, adder, mechanic, equation)
		if (thisRoller.parameters.dice.length > 5) {
			thisRoller.parameters.dcheck = true; // this will trigger no-result output, later
			thisRoller.parameters.dice.pop(); // remove extra element
		}
		return;
	};

	const processTargets = (thisRoller) => {
		if (thisRoller.parameters.mechanic === "l" || thisRoller.parameters.mechanic === "u") return; // no targets for luck & unluck
		let attr = thisRoller.parameters.useomcv ? "DMCV" : "DCV";				// decide which attribute we're using for the defensive value, if character sheet is present
		if (thisRoller.parameters.target.length > 0) {							// if a target was designated -- "target" here is an array of targets
			thisRoller.theResult.targetData = thisRoller.parameters.target
				.filter((a) => { return getObj('graphic', a); })				// limit to only those that are properly formatted (filter out the bad)
				.map((a) => {													// each should output an object of key:value pairs for the info we need
					let loc = getResultLocation(thisRoller);
					let thr = thisRoller.parameters.selective === true ? roll3d6() : thisRoller.theResult.tohitroll;
					let token = getObj('graphic', a);
					let chardcv = "";
					let charishit = "";
					if (token.get('represents') !== "") {						// check whether token has character sheet
						chardcv = getCharacterAttr(attr, token.get('represents'));	
						charishit = 11 + thisRoller.theSpeaker.ocvFinal - thr >= chardcv ? "&#9678;" : "";	// if character is hit, load the target character into the string; otherwise, empty
					}
					return {
						__TARGET_IMG__: token.get('imgsrc'),
						__TARGET_DCV__: chardcv,
						__TARGET_TOHIT_VIS__: thisRoller.parameters.selective ? "block" : "none",
						__TARGET_TOHIT_ROLL__: thr,
						__TARGET_LOC_VIS__: loc.hitlabel !== "none" ? "block" : "none",
						__TARGET_LOC__: loc.hitlabel + (randomInteger(2) > 1 ? " (R)" : " (L)"),
						__TARGET_BX__: loc.bx,
						__TARGET_SX__: thisRoller.parameters.mechanic === "k" ? loc.ksx : loc.nsx,
						__TARGET_HIT_DCV__: 11 + thisRoller.theSpeaker.ocvFinal - thr,
						__TARGET_ISHIT__: (thisRoller.parameters.target.length === 1 || !thisRoller.parameters.selective) ? "" : charishit,
					};
				});
		} 
	};

	const processOCV = (thisRoller) => {
		// process using OMCV instead of OCV
		if (thisRoller.parameters.useomcv === true && thisRoller.theSpeaker !== undefined && thisRoller.theSpeaker.speakerType === "character") { // if there is a character involved, get the ocv and location info from the sheet
			thisRoller.theSpeaker.ocvFinal = getCharacterAttr("OMCV", thisRoller.theSpeaker.id);
			thisRoller.theSpeaker.ocvBase = getCharacterAttr("omcv_base", thisRoller.theSpeaker.id);
			thisRoller.theSpeaker.ocvMods = thisRoller.theSpeaker.ocvFinal - thisRoller.theSpeaker.ocvBase;
		}

		// process changing the called location
		let startingLocation = radioTargetTable[thisRoller.theSpeaker.radio_target];
		if (startingLocation !== thisRoller.parameters.loc && thisRoller.theSpeaker !== undefined && thisRoller.theSpeaker.speakerType === "character") { //only matters if the location has changed
			var attr = findObjs({ _type: 'attribute', _characterid: thisRoller.theSpeaker.id, name: "radio_target" })[0];
			attr.set({ current: Object.keys(radioTargetTable).find(key => radioTargetTable[key] === thisRoller.parameters.loc) });
			if (thisRoller.parameters.useomcv === false) { // only process changes to the OCV if we are using OCV, not if we are using OMCV
				//apply the new mod, remove the old
				thisRoller.theSpeaker.ocvMods += (getLocationData(thisRoller.parameters.loc).ocvmod || 0) - (getLocationData(startingLocation).ocvmod || 0);
				// rebuild the final ocv
				thisRoller.theSpeaker.ocvFinal = Number(thisRoller.theSpeaker.ocvBase) + Number(thisRoller.theSpeaker.ocvMods);
			}
		}

		// process the OCV override
		if (thisRoller.parameters.ocv !== -100) { // user supplied an OCV override
			thisRoller.theSpeaker.ocvFinal = Math.floor(thisRoller.parameters.ocv);
			thisRoller.theSpeaker.ocvMods = 0;
		}
		return;
	};

	const getResultLocation = (thisRoller) => {
		// if it's a recall and the situation would normally trip a location generation (like random)
		// we should only roll it if there is no recall version of the location argument passed
		// original roll generates a random location; once set, that should stay the same for recalls, only changing if the recall explicitly includes new location argument
//		if (thisRoller.theResult.location.hitlabel !== "" /* default would mean no location, ie: first roll*/ && thisRoller.recallParameters.recall === true )

		let loc = {};
		// if we need to get a location, get it; run the location through the locationDataTable to get properties
		if (thisRoller.parameters.loc == "any" || thisRoller.parameters.loc == "random" || thisRoller.parameters.loc.indexOf("shot") > -1) {
			loc = getLocationData(specHitLocation(genHitLocation(thisRoller.parameters.loc)));
		} else {
			loc = getLocationData(thisRoller.parameters.loc);
		}
		return loc;
	};

	const rollResult = (thisRoller) => {
		var d6Res = [];
		var d3Res = [];
		for (let i = 0; i < 3; i++) {
			thisRoller.parameters.xdice[i] = Number(thisRoller.parameters.dice[i]) + Number(thisRoller.parameters.extradice[i]);
		}
		thisRoller.parameters.xdice = normalizeDice(thisRoller.parameters.xdice);

		if (thisRoller.parameters.xdice[0] > 0) { // get the quantity of d6
			d6Res.push(...getDice(thisRoller.parameters.xdice[0], 6));
			thisRoller.theResult.theroll = [...thisRoller.theResult.theroll, ...d6Res];
		}
		if (thisRoller.parameters.xdice[1] > 0) { // get the quantity of d3
			d3Res.push(...getDice(thisRoller.parameters.xdice[1], 3));
			thisRoller.theResult.theroll = [...thisRoller.theResult.theroll, ...d3Res];
		}
		thisRoller.theResult.theroll.sort(function (a, b) { return b - a });
		Object.assign(thisRoller.theResult.dicecounts, getCountsFromArray(thisRoller.theResult.theroll));
		Object.assign(thisRoller.theResult.d6counts, getCountsFromArray(d6Res)); // needed to output "dice" in the die pool output using the d6 font; d6 in one color, d3 in another
		Object.assign(thisRoller.theResult.d3counts, getCountsFromArray(d3Res)); // needed to output "dice" in the die pool output using the d6 font; d6 in one color, d3 in another

		// KNOCKBACK
		if (thisRoller.parameters.dkb === true) {
			let kbbasedice = 2;
			if (thisRoller.parameters.mechanic === "k") kbbasedice++;
			let kbx = Math.max(0, kbbasedice + thisRoller.parameters.kbdicemod);
			Object.assign(thisRoller.theResult.kbroll, getCountsFromArray(getDice(kbx, 6)));
			log("Knockback Roll: " + JSON.stringify(thisRoller.theResult.kbroll));
			for (let i = 1; i < 7; i++) {
				thisRoller.theResult.knockback += (thisRoller.theResult.kbroll[i] * i);
			}
		}
		return;
	};

	const calcResult = (thisRoller) => {
		// reset if we are performing recall
		if (thisRoller.recallParameters.recall) {
			Object.assign(thisRoller.theResult, {
				normalbody: 0,
				normalstun: 0,
			});
		}
		// nbody maps the amount of BODY per value of a die
		let nbody = { 1: 0, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2 };
		for (let i = 1; i < 7; i++) {
			thisRoller.theResult.normalstun += (thisRoller.theResult.dicecounts[i] * i);
			thisRoller.theResult.normalbody += (thisRoller.theResult.dicecounts[i] * nbody[i]);
		}
		thisRoller.theResult.normalstun += thisRoller.parameters.xdice[2]; //include the adder in the total
		thisRoller.theResult.killingbody = thisRoller.theResult.normalstun;

		// killing stun multiplier comes from the location in the getLocationData function (including a random d3 for no location and focus location)
		// if a stunmod is applied, incorporate it with the location stun modifier
		thisRoller.theResult.location.nsx = Math.max(1, thisRoller.theResult.location.nsx + Math.floor(thisRoller.parameters.stunmod));
		thisRoller.theResult.location.ksx = Math.max(1, thisRoller.theResult.location.ksx + Math.floor(thisRoller.parameters.stunmod));
		thisRoller.theResult.killingstun = thisRoller.theResult.killingbody * thisRoller.theResult.location.ksx;

		// if the output is points, determine where the points come from
		if (thisRoller.parameters.outputas == "points") {
			thisRoller.theResult.points.stun = thisRoller.theResult.normalstun;
			thisRoller.theResult.points.body = thisRoller.theResult.normalbody;
			if (thisRoller.parameters.mechanic === "l") thisRoller.theResult.points.stun = thisRoller.theResult.dicecounts[6];
			else if (thisRoller.parameters.mechanic === "u") thisRoller.theResult.points.stun = thisRoller.theResult.dicecounts[1];
		}

		return;
	};

	const handleInput = (msg) => {
		if (msg.type !== 'api' || !msg.content.toLowerCase().startsWith('!heroll ')) {
			return;
		}

		// reduce all inline rolls - this rewrites the content of the msg to be the output of an inline roll rather than the $[[0]], $[[1]], etc.
		if (_.has(msg, 'inlinerolls')) {
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function (m, v, k) {
					m['$[[' + k + ']]'] = v.results.total || 0;
					return m;
				}, {})
				.reduce(function (m, v, k) {
					return m.replace(k, v);
				}, msg.content)
				.value();
		}
		log(msg.content);

		let args = msg.content.split(/\s--/)							// split at argument delimiter
			.slice(1)													// drop the api tag
			.map(splitArgs)												// split each arg (foo:bar becomes [foo, bar])
			.map(joinVals)												// if the value included a colon (the delimiter), join the parts that were inadvertently separated
			.map(aliasesFrom(argAliasTable));							// flatten all argument aliases to the valid, internally tracked args
			
		let thisRoller = {};											// local object for ephemeral data storage
		setDefaults(msg, thisRoller);									// initializes all parameters, including speaker and template defaults
		extendFromArray(thisRoller.userparameters, args);				// write all args to the userparameters, adding any unrecognized args
		prioritizeArg("recall", processRecall, thisRoller, args);		// look for and process recall argument, if present

//		if (typeof state.heroll[thisRoller.recallParameters.speakID].parameters === 'undefined') {	// if no roll is stored for that speaker in the state variable
		prioritizeArg("template", setTemplateDefaults, thisRoller);		// look for and process template argument, if present
		processArguments(thisRoller);									// process the rest of the arguments
		processOCV(thisRoller);											// figure out if OMCV, location, or OCV override should alter the OCV (or replace it)
		processTargets(thisRoller);
		// rollActivation();											// no longer needed as 3d6 roll was already generated in the initialization of defaults
		// rollToHit();													// no longer needed as 3d6 roll was already generated in the initialization of defaults
		thisRoller.theResult.location = getResultLocation(thisRoller);	// generate a location if necessary, then retrieve location information
		if (!thisRoller.recallParameters.recall) rollResult(thisRoller);// generate dice pool
		calcResult(thisRoller);											// turn dice pool into stun, body, knockback, multipliers, points, etc.
		storeState(thisRoller);											// store in the state variable
		prepOutput(thisRoller);											// assign values to the output parameters
		sendOutputToChat(thisRoller);									// perform replacement using html form and the output parameters to inject the finished values; send to chat

		return;
	};

	// ==================================================
	//		OUTPUT FUNCTIONS
	// ==================================================
	const prepOutput = (thisRoller) => {
		// OUTPUT FORMAT
		if (thisRoller.parameters.outputformat != "tall") {
			thisRoller.outputParams.__DS_TALL_VIS__ = "none";
			thisRoller.outputParams.__LOC_TALL_VIS__ = "none";
			thisRoller.outputParams.__DIEPOOL_TALL_VIS__ = "none";
			thisRoller.outputParams.__SIDECAR_VIS__ = "block";
		}

		// POWER NAME
		thisRoller.outputParams.__POWERNAME__ = thisRoller.parameters.powername;

		// COLORS
		thisRoller.outputParams.__PRIMARY_BG_COL__ = thisRoller.parameters.primarycolor;
		thisRoller.outputParams.__SECONDARY_BG_COL__ = getAltColor(thisRoller.parameters.primarycolor);
		thisRoller.outputParams.__PRIMARY_TEXT_COL__ = getTextColor(thisRoller.outputParams.__PRIMARY_BG_COL__);
		thisRoller.outputParams.__SECONDARY_TEXT_COL__ = getTextColor(thisRoller.outputParams.__SECONDARY_BG_COL__);

		// ACTIVATION
		if (thisRoller.parameters.act != -100) {
			thisRoller.outputParams.__ACT_VIS__ = "block";
			thisRoller.outputParams.__ACT_TGT__ = thisRoller.parameters.act;
			thisRoller.outputParams.__ACT_ROLL__ = thisRoller.parameters.actroll;
			if (thisRoller.parameters.actroll > thisRoller.parameters.act) { // if activation fails, only show the "CLICK" message
				thisRoller.parameters.notes = '<div style="text-align: center;font-size:14px;line-height:14px;"> ----- CLICK! ----- </div>';
				thisRoller.outputParams.__RES_BASE_VIS__ = "none";
				thisRoller.outputParams.__RES_MULT_VIS__ = "none";
				thisRoller.outputParams.__TOHIT_VIS__ = "none";
				thisRoller.outputParams.__DIEPOOL_TALL_VIS__ = "none";
				thisRoller.outputParams.__DS_TALL_VIS__ = "true";
				thisRoller.outputParams.__LOC_TALL_VIS__ = "none";
				thisRoller.outputParams.__DIEPOOL_TALL_VIS__ = "none";
				thisRoller.outputParams.__SIDECAR_VIS__ = "none";
			}
		}

		// LOCATION
		if (thisRoller.parameters.loc != "none" && thisRoller.parameters.target.length === 0) { // if there is a location AND there are no targets (targets show their own locations)
			if (thisRoller.parameters.outputformat === "tall") {
				thisRoller.outputParams.__LOC_TALL_VIS__ = "block";
			} else {
				thisRoller.outputParams.__LOC_SC_VIS__ = "block";
			}

			thisRoller.outputParams.__LOC__ = thisRoller.theResult.location.hitlabel + (randomInteger(2) > 1 ? " (R)" : " (L)");
			thisRoller.outputParams.__BODY_MULT__ = thisRoller.theResult.location.bx;
			if (thisRoller.parameters.mechanic == "k") thisRoller.outputParams.__STUN_MULT__ = thisRoller.theResult.location.ksx;
			else if (thisRoller.parameters.mechanic == "n") thisRoller.outputParams.__STUN_MULT__ = thisRoller.theResult.location.nsx;

		} else {
			thisRoller.outputParams.__BODY_MULT__ = "--";										// this will either be hidden or direct people to the target info
			thisRoller.outputParams.__STUN_MULT__ = "--";
        }

		// TO HIT BAR
		thisRoller.outputParams.__TOHIT_ROLL__ = thisRoller.theResult.tohitroll;
		if (thisRoller.theSpeaker.speakerType === "character") {
			// determine how to represent ocv mods (+/-); 0's should make the whole mod portion disappear
			let outputocvmod = "";
			if (thisRoller.theSpeaker.ocvMods < 0) outputocvmod = "-";
			if (thisRoller.theSpeaker.ocvMods > 0) outputocvmod = "+";
			if (outputocvmod.length) outputocvmod += Math.abs(thisRoller.theSpeaker.ocvMods);

			thisRoller.outputParams.__TOHIT_OCV__ = thisRoller.parameters.ocv !== -100 ? thisRoller.theSpeaker.ocvFinal : thisRoller.theSpeaker.ocvBase + outputocvmod;
			thisRoller.outputParams.__TOHIT_DCV__ = 11 + thisRoller.theSpeaker.ocvFinal - thisRoller.theResult.tohitroll;
		}
		if (thisRoller.parameters.useomcv) {
			thisRoller.outputParams.__TOHIT_OCV_LBL__ = "OMCV";
			thisRoller.outputParams.__TOHIT_DCV_LBL__ = "HIT DMCV";
		}

		// RESULTS BAR
		if (thisRoller.parameters.outputas == "attack" && thisRoller.parameters.loc != "none") {
			thisRoller.outputParams.__RES_MULT_VIS__ = "block";
			thisRoller.outputParams.__RES_BASE_VIS__ = "none";
		} else if (thisRoller.parameters.outputas == "points") {
			thisRoller.outputParams.__RES_PTS_VIS__ = "block";
			thisRoller.outputParams.__RES_BASE_VIS__ = "none";
		}

		// MECHANIC
		var mechColors = { L: "#00b8a9", N: "#ff8000", K: "#bf1f2f", U:"#5438AF"};
		thisRoller.outputParams.__MECH__ = thisRoller.parameters.mechanic.toUpperCase();
		thisRoller.outputParams.__MECH_BGC__ = mechColors[thisRoller.outputParams.__MECH__];

		// DIE STRENGTH (ROLL EQUATION)
		thisRoller.outputParams.__DIE_STRENGTH__ = thisRoller.parameters.xdice[4];

		// DIE POOL
		let numx = { 1: "G", 2: "H", 3: "I", 4: "J", 5: "K", 6: "L" },
			num3x = { 1: "g", 2: "h", 3: "i" };
		for (let i = 6; i > 0; i--) {
			let initlength = thisRoller.outputParams.__DIEPOOL__.length;
			// processing the d6 roll result, output a single character for each die, mapping the value to the numx object
			// those characters are what the d6 font requires to display the correct die face
			for (let j = 0; j < thisRoller.theResult.d6counts[i]; j++) {
				thisRoller.outputParams.__DIEPOOL__ += i.toString().replace(/1|2|3|4|5|6/gi, function (matched) { return numx[matched] });
			}
			// processing the d3 roll result, do the same as above but only for 1-3, and map to the num3x object, which will display the d3 dice in a different color
			if (i < 4) {
				for (let j = 0; j < thisRoller.theResult.d3counts[i]; j++) {
					thisRoller.outputParams.__DIEPOOL__ += i.toString().replace(/1|2|3/gi, function (matched) { return num3x[matched] });
				}
			}
			if (initlength != thisRoller.outputParams.__DIEPOOL__.length && i != 1) thisRoller.outputParams.__DIEPOOL__ += "<br>";

		}

		if (thisRoller.parameters.xdice[2] != 0) {
			thisRoller.outputParams.__DIEPOOL__ += " ";
			thisRoller.outputParams.__DIEPOOL__ += (thisRoller.parameters.xdice[2] > 0 ? "+" : "-");
			thisRoller.outputParams.__DIEPOOL__ += "&nbsp;";
			thisRoller.outputParams.__DIEPOOL__ += Math.abs(thisRoller.parameters.xdice[2]).toString().replace(/1|2|3|4|5|6/gi, function (matched) { return num3x[matched] });
		}

		// POINTS
		thisRoller.outputParams.__RES_PTS_LBL__ = thisRoller.parameters.pointslabel;
		if (thisRoller.parameters.dbody && thisRoller.parameters.dstun) { // if both are true, as for a healing that does both STUN and BODY, then show both values
			thisRoller.outputParams.__RES_PTS__ = `<div style="float:left;width:50%;text-align:center;">${thisRoller.theResult.points.body}</div><div style="float:right;width:50%;text-align:center;">${thisRoller.theResult.points.stun}</div>`;
		} else if (thisRoller.parameters.dbody) { //just dbody is true (entangle)
			thisRoller.outputParams.__RES_PTS__ = thisRoller.theResult.points.body;
		} else { // just dstun or nothing is true, default to showing stun points
			thisRoller.outputParams.__RES_PTS__ = thisRoller.theResult.points.stun;
		}

		// RESULTS: BODY, STUN, KNOCKBACK, LUCK
		if ((thisRoller.parameters.xdice[0] == 0 && thisRoller.parameters.xdice[1] == 0 && thisRoller.parameters.xdice[2] == 0) || thisRoller.parameters.dcheck == true) { // if no dice rolling needs to happen, don't figure BODY/STUN, and hide Results bars
			thisRoller.outputParams.__DIE_STRENGTH__ = "&nbsp;"; // reset the die strength (roll equation) to not show anything
			thisRoller.outputParams.__RES_BASE_VIS__ = "none";
			thisRoller.outputParams.__RES_MULT_VIS__ = "none";
			thisRoller.outputParams.__TOHIT_VIS__ = "block";
			thisRoller.outputParams.__DIEPOOL_TALL_VIS__ = "none";
			thisRoller.outputParams.__DS_TALL_VIS__ = "none";
			thisRoller.outputParams.__DIEPOOL_TALL_VIS__ = "none";
			thisRoller.outputParams.__SIDECAR_VIS__ = "none";
		} else {
			if (thisRoller.parameters.mechanic == "l" || thisRoller.parameters.mechanic == "u") {
				thisRoller.outputParams.__TOHIT_VIS__ = "none";
			} else {
				if (thisRoller.parameters.mechanic == "n") {
					thisRoller.outputParams.__RES_STUN__ = thisRoller.theResult.normalstun;
					thisRoller.outputParams.__RES_BODY__ = thisRoller.theResult.normalbody;
					thisRoller.outputParams.__RES_KB__ = Math.max(0, thisRoller.theResult.normalbody - thisRoller.theResult.knockback);
				} else if (thisRoller.parameters.mechanic == "k") {
					if (thisRoller.parameters.loc != "none") thisRoller.outputParams.__RES_STUN__ = "--";
					else thisRoller.outputParams.__RES_STUN__ = thisRoller.theResult.killingstun;
					thisRoller.outputParams.__RES_BODY__ = thisRoller.theResult.killingbody;
					thisRoller.outputParams.__RES_KB__ = Math.max(0, thisRoller.theResult.killingbody - thisRoller.theResult.knockback);
				}
				if (!thisRoller.parameters.dbody) thisRoller.outputParams.__RES_BODY__ = "--";
				if (!thisRoller.parameters.dstun) thisRoller.outputParams.__RES_STUN__ = "--";
				if (!thisRoller.parameters.dkb) thisRoller.outputParams.__RES_KB__ = "--";
			}
		}

		// TARGETING
		if (thisRoller.parameters.target.length > 0) {									// if a target was designated
			let targetTable = '';
			let targetRow = '';
			if (thisRoller.parameters.selective || thisRoller.parameters.loc !== "none") {	// selective or location damage needed
				targetTable = '__TABLE-ROWS__';
				targetRow = '<!--TARGETING BAR --> <div style="overflow: hidden; background-color: black; display: block"><div style="width:95%; margin: 10px auto 7px; overflow:hidden;"><!-- TARGET --><div style="width:33.3%; display: inline-block; float: left; position: relative;"><div style="overflow: visible; width: 94%; margin: auto; border-radius: 5px; background-color: #ffffff; position: relative; float:left; display: block;"><div style="display: block"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 5px 5px; color: black"><div style="background-size:48px; height: 48px; position: relative;"><img height="48" width="48" style="max-height:48px;" src="__TARGET_IMG__"><div style="position:absolute;left: 2px;top: -3px;font-size: 18px;line-height: 18px;color:#bf1f2f;font-weight: normal;">__TARGET_ISHIT__</div><div style="position:absolute;right: 3px;top: -1px;font-size: 13px;line-height: 16px;color: #bf1f2f;font-weight: normal;text-align: right;">__TARGET_DCV__</div></div></div></div></div></div><!-- BUBBLES --><div style="width:66.7%; display: inline-block; float: left; position: relative;"><div style="width:95%; margin:auto;"><div style="display:block;"><!-- To Hit Roll Bubble --><div style="width: 25%; display:inline-block; float:left;"><div style="width:93%; margin:auto;"><div style="height: 35px; width: 100%; border-radius: 5px; background-color: #ffffff; float: left; display: __TARGET_TOHIT_VIS__"><div style="position: relative; padding-right: 1px; font-size: 18px; line-height: 18px; text-align: center; font-family: dicefontd6; color: #bf1f2f">K</div><div style="position: relative; padding-right: 1px; font-size: 13px; line-height: 16px; text-align: center; color: #000000">__TARGET_TOHIT_ROLL__</div></div></div></div><!-- Hit DCV Bubble --><div style="width: 25%; display:inline-block; float:left;"><div style="width:93%; margin:auto;"><div style="height: 35px; width: 100%; border-radius: 5px; background-color: #ffffff; float: left; display: __TARGET_TOHIT_VIS__"><div style="position: relative; padding-right: 1px; font-size: 18px; line-height: 18px; text-align: center; font-family: dicefontd6; color: #bf1f2f">&#9678;</div><div style="position: relative; padding-right: 1px; font-size: 13px; line-height: 16px; text-align: center; color: #000000">__TARGET_HIT_DCV__</div></div></div></div><!-- STUN Multiplier Bubble --><div style="width: 25%; display:inline-block; float:right;"><div style="width:93%; margin:auto;"><div style="height: 35px; width: 100%; border-radius: 5px; background-color: #ff8000; float: left; display: __TARGET_LOC_VIS__"><div style="position: relative; padding-right: 1px; font-size: 18px; line-height: 18px; text-align: center; font-family: dicefontd6; color: #ffffff">&#128497;</div><div style="position: relative; padding-right: 1px; font-size: 13px; line-height: 16px; text-align: center; color: white"><span style="font-size:8px;">x</span>__TARGET_SX__</div></div></div></div><!-- BODY Multiplier Bubble --><div style="width: 25%; display:inline-block; float:right;"><div style="width:93%; margin:auto;"><div style="height: 35px; width: 100%; border-radius: 5px; background-color: #bf1f2f; float: left; display: __TARGET_LOC_VIS__"><div style="position: relative; padding-right: 1px; font-size: 18px; line-height: 18px; text-align: center; font-family: dicefontd6; color: #ffffff">&#127778;</div><div style="position: relative; padding-right: 1px; font-size: 13px; line-height: 16px; text-align: center; color: white"><span style="font-size:8px;">x</span>__TARGET_BX__</div></div></div></div></div><!-- TARGET LOCATION BAR --><div style="padding:5px 0px 0px; clear: both; display:__TARGET_LOC_VIS__;"><div style="display: block"><div style="line-height: 12px; font-style: italic; color:#ffffff; display: block"><div style="font-weight: bold; text-align: left; float: left">Loc</div><div style="text-align: right; float: right; color:#ffffff">__TARGET_LOC__</div><div style="overflow: hidden"><div style="border-bottom: 1px dotted white; height: 10px; margin: 0px 3px">&nbsp;</div></div></div></div></div></div></div></div></div>';
			} else {																	// only output images of targets
				targetTable = '<!-- TARGETING BAR --><div style="overflow: hidden; background-color: black; display: block"><div style="width:95%; margin: 10px auto 7px; overflow:hidden;">__TABLE-ROWS__</div></div>';
				targetRow = '<!--TARGET --><div style="width:33.3%; display: inline-block; float: left; position: relative;"><div style="overflow: visible; width: 94%; margin: 4px auto; border-radius: 5px; background-color: #ffffff; position: relative; float:left; display: block;"><div style="display: block"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 5px 5px; color: black"><div style="background-size:48px; height: 48px; position: relative;"><img height="48" width="48" style="max-height:48px;" src="__TARGET_IMG__"><div style="position:absolute;left: 2px;top: -3px;font-size: 18px;line-height: 18px;color:#bf1f2f;font-weight: normal;">__TARGET_ISHIT__</div><div style="position:absolute;right: 3px;top: -1px;font-size: 13px;line-height: 16px;color: #bf1f2f;font-weight: normal;text-align: right;">__TARGET_DCV__</div></div></div></div></div></div>';
            }
			if (thisRoller.theResult.targetData.length > 0) {
				let targetKeysRegex = new RegExp(Object.keys(thisRoller.theResult.targetData[0]).join("|"), 'gi');
				let targetAllRows = thisRoller.theResult.targetData.reduce((a, v, i) => {
					return a + targetRow.replace(targetKeysRegex, (matched) => { return v[matched]; })
				},"");
				thisRoller.outputParams.__TARGET_TABLE_HOOK__ = targetTable.replace("__TABLE-ROWS__",targetAllRows);
            }
		}

		// NOTES
		if (thisRoller.parameters.notes != "") {
			thisRoller.outputParams.__NOTES__ = thisRoller.parameters.notes;
		}

		// VERBOSE
		if (thisRoller.parameters.verbose) {
			thisRoller.outputParams.__V_VIS__ = "block";
			// alternating row colors
			let rowbg = ["#ffffff", "#dedede"];
			let verbtable = '<div style="width:100%;margin:0 auto;"><table style="width:100%; margin: 0 auto; border:1px #000000 solid;border-collapse:collapse;font-size:9px;">__TABLE-ROWS__</table></div>';
			let verbheader = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:#dddddd"><td>ARG</td><td style="border-left:1px solid #000000;border-right:1px solid #000000">USER</td><td>EVAL</td></tr>';
			let verbrows = Object.keys(thisRoller.userparameters).filter((p) => { return p !== "notes"; })
				.reduce((a, v, i) => {
					return a + '<tr style="background-color:' + rowbg[(i % 2)] + ';font-weight:bold;"><td style="padding-left:2px;">' + v + '</td><td style="border-left:1px solid #000000;border-right:1px solid #000000;text-align:center;">' + thisRoller.userparameters[v] + '</td><td style="padding-left:2px;">' + (["act","ocv"].includes(v) && thisRoller.parameters[v] == -100 ? "none" : thisRoller.parameters[v]) + '</td></tr>'
				}, verbheader);
			thisRoller.outputParams.__V_NOTE__ = verbtable.replace("__TABLE-ROWS__", verbrows);
		}
		return;
	};

	const sendOutputToChat = (thisRoller) => {
		let htmlForm = '<div style="width: 405px;overflow: hidden;"><div style="width: 240px;overflow: hidden;float: left;"><div style="padding-top: 16px"><div style="margin-right: 16px; position: relative; font-family: &quot; helvetica neue&quot; , &quot;helvetica&quot; , &quot;arial&quot; , sans-serif; font-size: 12px"><!-- CHARACTER BAR --><div style="overflow: hidden"><div style="border: 1px #000000; border-radius: 15px 15px 0px 0px; background-color: black; text-align: center;color: #efefef; font-size: 25px; line-height: 35px">__CHARNAME__</div></div><!-- MECHANIC BAR --><div style="display: __MECH_VIS__"><div style="position: absolute; top: -16px; right: -14px; height: 44px; width: 44px; border-radius: 24px; background-color: __MECH_BGC__; border: 2px solid black; float: right; display: block"><div style="display: block"><div style="position: relative; font-size: 25px; line-height: 44px; text-align: center; color: white">__MECH__</div></div></div></div><!-- POWER NAME BAR --><div style="border: #000000 solid;overflow: visible;padding: 12px 5px 7px;border-width: 0px 2px;background-color: __PRIMARY_BG_COL__;color:__PRIMARY_TEXT_COL__;position: relative;min-height: 29px;display: block;"><div style="font-size: 20px;font-weight: bold;line-height: 29px;">__POWERNAME__</div></div><!-- DIE STRENGTH AND ACTIVATION BAR --><div style="border: #000000 solid;overflow: visible;padding: 0px 5px 3px;border-width: 0px 2px;height: 20px;background-color: __PRIMARY_BG_COL__;color:__PRIMARY_TEXT_COL__;position: relative;display:__DS_TALL_VIS__"><div style="float: left; width: 55%; font-size: 17px; font-weight: bold; line-height: 17px; font-style: italic;">__DIE_STRENGTH__</div><div style="position:absolute; width: 50px; top:-24px;right:3px;display: __ACT_VIS__"><div style="border: 1px solid; overflow: hidden; display: block; border-radius: 5px; color:black; border-color: __SECONDARY_BG_COL__"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: #ffffff; font-size: 10px">ACT __ACT_TGT__-</div><div style="padding: 1px; text-align: center; background-color: #ffffff; line-height: 17px">__ACT_ROLL__</div></div></div><div style="clear: both"></div></div><!-- TO-HIT BAR --><div style="border: #000000 solid; overflow: hidden; padding: 6px 7px 2px; border-width: 1px 2px 0px 2px; text-align: center; background-color: #ffffff; display: __TOHIT_VIS__"><div style="float: left; width: 31%; display: inline-block"><div style="display: block"><div style="border: 1px solid; overflow: hidden; display: block; border-radius: 5px; border-color: __PRIMARY_BG_COL__"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: #ffffff">__TOHIT_OCV_LBL__</div><div style="padding: 1px; text-align: center; background-color: #ffffff; border-color: #000000; font-size: 20px; line-height: 30px">__TOHIT_OCV__</div></div></div></div><div style="width: 31%; margin: 0px auto; display: inline-block"><div style="display: block"><div style="border: 1px solid; overflow: hidden; display: block; border-radius: 5px; border-color: __PRIMARY_BG_COL__"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: #ffffff">ROLL</div><div style="padding: 1px; text-align: center; background-color: #ffffff; font-size: 20px; line-height: 30px">__TOHIT_ROLL__</div></div></div></div><div style="float: right; width: 31%; display: inline-block"><div style="display: block"><div style="border: 1px solid; overflow: hidden; display: block; border-radius: 5px; border-color: __PRIMARY_BG_COL__"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: #ffffff">__TOHIT_DCV_LBL__</div><div style="padding: 1px; text-align: center; background-color: #ffffff; font-size: 20px; line-height: 30px">__TOHIT_DCV__</div></div></div></div></div><!-- LOCATION BAR --><div style="border: #000000 solid; overflow: hidden; padding: 5px 7px 5px 5px; border-width: 0px 2px; background-color: white; display: __LOC_TALL_VIS__"><div style="display: block"><div style="line-height: 15px; font-style: italic; clear: both; display: block"><div style="font-weight: bold; text-align: left; float: left">Hit Location</div><div style="text-align: right; float: right">__LOC__</div><div style="overflow: hidden"><div style="border-bottom: 1px dotted black; height: 10px; margin: 0px 3px">&nbsp;</div></div></div></div></div><!-- DIE POOL BAR --><div style="border: #000000 solid; overflow: hidden; border-width: 1px 2px 0px 2px; background-color: __SECONDARY_BG_COL__; display: __DIEPOOL_TALL_VIS__; padding: 0px 5px; clear: both"><div style="text-align: left; font-size: 17px; padding: 5px 0px; line-height: 20px;font-family:dicefontd6;font-size:26px;color:__SECONDARY_TEXT_COL__;">__DIEPOOL__</div></div><!-- RESULT BAR (DAMAGE WITH MULTIPLIERS)--><div style="overflow: hidden; background-color: black; display: __RES_MULT_VIS__"><div style="width:95%; margin: 10px auto 7px; overflow:hidden;"><div style="width:33.3%; display: inline-block; float: left;"><div style="overflow: visible; width: 94%; margin: auto; border-radius: 5px; background-color: transparent; position: relative; display: block; float: left"><div style="display: block"><div style="padding: 3px 0px 1px; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black; display: block"><div style="float: left; display: inline-block; margin-left: 4px">BODY</div><div style="float: right; display: inline-block; margin-right: 4px"><span style="font-size: 8px">x</span>__BODY_MULT__</div><div style="clear: both"></div></div><div style="text-align: center; font-size: 20px; background-color: #bf1f2f; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_BODY__</div></div></div></div><div style="width:33.4%; display: inline-block; float: left;"><div style="overflow: visible; width: 94%; margin: auto; border-radius: 5px; background-color: transparent; position: relative; display: block"><div style="display: block"><div style="padding: 3px 0px 1px; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black; display: block"><div style="float: left; display: inline-block; margin-left: 4px">STUN</div><div style="float: right; display: inline-block; margin-right: 4px"><span style="font-size: 8px">x</span>__STUN_MULT__</div><div style="clear: both"></div></div><div style="text-align: center; font-size: 20px; background-color: #ff8000; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_STUN__</div></div></div></div><div style="width:33.3%; display: inline-block; float: left;"><div style="width: 94%; margin: auto; overflow: visible; border-radius: 5px; background-color: transparent; position: relative; display: block; float: right"><div style="display: block"><div style="padding: 3px 0px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black">KB</div><div style="text-align: center; font-size: 20px; background-color: #00b8a9; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_KB__</div></div></div></div></div></div><!-- RESULT BAR (DAMAGE, NO MULTIPLIER) --><div style="overflow: hidden; background-color: black; display: __RES_BASE_VIS__"><div style="width:95%; margin: 10px auto 7px; overflow:hidden;"><div style="width:33.3%; display: inline-block; float: left;"><div style="overflow: visible; width: 94%; margin: auto; border-radius: 5px; background-color: transparent; position: relative; float:left; display: block;"><div style="display: block"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black">BODY</div><div style="text-align: center; font-size: 20px; background-color: #bf1f2f; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_BODY__</div></div></div></div><div style="width:33.4%; display: inline-block; float:left;"><div style="overflow: visible; width: 94%; margin: auto; border-radius: 5px; background-color: transparent; position: relative; display: block"><div style="display: block"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black">STUN</div><div style="text-align: center; font-size: 20px; background-color: #ff8000; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_STUN__</div></div></div></div><div style="width:33.3%; display: inline-block; float: left;"><div style="width: 94%; margin: auto; overflow: visible; border-radius: 5px; background-color: transparent; position: relative; float:right; display: block;"><div style="display: block"><div style="padding: 3px 0px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black">KB</div><div style="text-align: center; font-size: 20px; background-color: #00b8a9; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_KB__</div></div></div></div></div></div><!-- RESULT BAR (POINTS) --><div style="overflow: hidden; background-color: black; display: __RES_PTS_VIS__"><div style="width:95%; margin: 10px auto 7px; overflow:hidden;"><div style="overflow: hidden; border-radius: 5px; position: relative; display: block"><div style="display: block"><div style="padding: 3px 0px 1px; text-align: center; font-weight: bold; background-color: white; border-radius: 5px 5px 0px 0px; color: black">__RES_PTS_LBL__</div><div style="padding: 1px; text-align: center; font-size: 20px; background-color: #bf1f2f; border-radius: 0px 0px 5px 5px; color: white; line-height: 30px">__RES_PTS__</div></div></div></div></div>__TARGET_TABLE_HOOK__<!-- BOTTOM BAR --><div style="overflow: hidden"><div style="border: 1px #000000;border-radius: 0px 0px 15px 15px;background-color: black;text-align: center;"><div style="color: #FFFFFF;text-align:left;padding: 5px 15px 10px;font-style: italic;line-height: 12px;font-size: 12px;display:block;">__NOTES__</div></div></div><!-- ========== VERBOSE OUTPUT ========== --><div style="overflow: hidden;display: __V_VIS__;margin-top: 5px;"><div style="border: #000000 solid;border-radius: 15px 15px 0px 0px;text-align: center;line-height: 25px;font-size:10px;font-weight: bold;border-width: 2px 2px 0px 2px;">Verbose Output</div><div style="text-align:left;font-size:9px;border:#000000 solid;border-width:0px 2px 0px 2px;padding:3px 4px;">__V_NOTE__</div><div style="border:#000000 solid;border-width:0px 2px 2px 2px;border-radius: 0px 0px 15px 15px;line-height:15px;">&nbsp;</div></div></div></div></div><!-- ========== SIDECAR ========== --><div style="width: 160px; overflow: hidden; float: right;display:__SIDECAR_VIS__"><div style="padding-top: 16px"><div style="position: relative; font-family: &quot; helvetica neue&quot; , &quot;helvetica&quot; , &quot;arial&quot; , sans-serif; font-size: 12px"><!-- CONNECTING DOTS --><div style="height: 20px; display: block; clear: both"><div style="height: 8px;font-size: 8px;clear: both;display: block;line-height: 9px;"><div style="width: 0px;display: inline-block;float: left;">&nbsp;</div><div style="width: 8px; background-color: black; border-radius: 4px; display: inline-block; float: left; height: 8px">&nbsp;</div><div style="width: 10px;display: inline-block;float: left;">&nbsp;</div><div style="width: 8px; background-color: black; border-radius: 4px; display: inline-block; float: left; height: 8px">&nbsp;</div><div style="width: 10px;display: inline-block;float: left;">&nbsp;</div><div style="width: 8px; background-color: black; border-radius: 4px; display: inline-block; float: left; height: 8px">&nbsp;</div><div style="width: 10px;display: inline-block;float: left;">&nbsp;</div><div style="width: 8px; background-color: black; border-radius: 4px; display: inline-block; float: left; height: 8px">&nbsp;</div><div style="width: 10px;display: inline-block;float: left;">&nbsp;</div><div style="width: 8px; background-color: black; border-radius: 4px; display: inline-block; float: left; height: 8px">&nbsp;</div></div><div style="height: 12px; clear: both; display: block"><div style="width: 72px; display: inline-block; float: left">&nbsp;</div><div style="width: 8px; background-color: black; border-radius: 4px; display: inline-block; float: left; height: 8px; margin: 2px 0px">&nbsp;</div></div></div><!-- TOP BAR (SIDECAR)--><div style="overflow: visible"><div style="border: 1px #000000; border-radius: 15px 15px 0px 0px; background-color: black; text-align: center; height: 15px">&nbsp;</div></div><!-- DIE STRENGTH AND ACTIVATION BAR --><div style="border: #000000 solid;overflow: hidden;padding: 3px 5px;border-width: 0px 2px;height: 42px;background-color: __PRIMARY_BG_COL__;color:__PRIMARY_TEXT_COL__;position: relative;"><div style="float: left; width: 55%; font-size: 17px; font-weight: bold; line-height: 17px; font-style: italic; margin-top: 15px;">__DIE_STRENGTH__</div><div style="float: right; width: 50px; display: inline-block"><div style="display: __ACT_VIS__"><div style="border: 1px solid; overflow: hidden; display: block; border-radius: 5px; color: black; border-color: __SECONDARY_BG_COL__"><div style="padding: 3px 1px 1px; text-align: center; font-weight: bold; background-color: #ffffff; font-size: 10px">ACT __ACT_TGT__-</div><div style="padding: 1px; text-align: center; background-color: #ffffff; line-height: 17px">__ACT_ROLL__</div></div></div></div><div style="clear: both"></div></div><!-- DIE POOL BAR --><div style="border: #000000 solid; overflow: hidden; border-width: 1px 2px 0px 2px; background-color: __SECONDARY_BG_COL__; display: block; padding: 0px 5px; clear: both"><div style="text-align: left; font-size: 17px; padding: 5px 0px; line-height: 20px;font-family:dicefontd6;font-size:26px;color:__SECONDARY_TEXT_COL__;">__DIEPOOL__</div></div><!-- LOCATION BAR --><div style="border: #000000 solid; overflow: hidden; padding: 5px 7px 0px 5px; border-width: 1px 2px 0px 2px; background-color: white; display: __LOC_SC_VIS__"><div style="display: block"><div style="line-height: 15px; font-style: italic; clear: both; display: block"><div style="font-weight: bold; text-align: left; float: left">Hit Location</div><div style="text-align: right; float: right">__LOC__</div><div style="overflow: hidden"><div style="border-bottom: 1px dotted black; height: 10px; margin: 0px 3px">&nbsp;</div></div></div></div><div style="padding: 6px 5px 3px 5px; display: block"><div style="height: 25px"><div style="float: left; height: 20px; width: 20px; border-radius: 12px; background-color: #ff8000; overflow: visible; display: block; border: 1px solid black"><div style="position: relative; font-size: 10px; text-align: center; line-height: 20px; margin: 0px; color: white">__STUN_MULT__</div></div><div style="float: left"><div style="float: left; font-size: 12; font-style: italic; line-height: 24px; text-align: left; margin-left: 4px">STUN Mult.</div></div></div><div style="height: 25px"><div style="height: 20px; width: 20px; border-radius: 12px; background-color: #bf1f2f; overflow: hidden; display: block; border: 1px solid black; float: left"><div style="position: relative; font-size: 10px; text-align: center; line-height: 20px; margin: 0px; color: white">__BODY_MULT__</div></div><div style="float: left"><div style="float: left; font-size: 12; font-style: italic; line-height: 24px; text-align: left; margin-left: 4px">BODY Mult.</div></div></div></div></div><!-- BOTTOM BAR (SIDECAR) --><div style="overflow: hidden"><div style="border: 1px #000000; border-radius: 0px 0px 15px 15px; background-color: black; height: 15px">&nbsp;</div></div></div></div></div></div>';

		// join the output paramaters with a pipe, turn that into a regular expression, and feed that into the replace to modify the html form with our figured values
		let chatString = htmlForm.replace(new RegExp(Object.keys(thisRoller.outputParams).join("|"), 'gi'),
			(matched) => { return thisRoller.outputParams[matched]; }
		);

		sendChat(thisRoller.theSpeaker.chatSpeaker, chatString);
		return;
	};

	const registerEventHandlers = () => {
		on('chat:message', handleInput);
	};

	return {
		VersionInfo: versionInfo,
		LogSig: logsig,
		RegisterEventHandlers: registerEventHandlers
	};

})();

on("ready", () => {
	'use strict';
	heroll.LogSig();
	heroll.VersionInfo();
	heroll.RegisterEventHandlers();
});