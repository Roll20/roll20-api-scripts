// GroupCheck version 0.9.1
// Last Updated: 2016-10-28
// A script to roll checks for many tokens at once with one command.

var groupCheck = groupCheck || (function() {
	'use strict';
	const version = '0.9.1', stateVersion = 4,
	// Roll appearance can be configured via this function
	outputStyle = function () {
		const makeBox = function (header, rolls) {
			return '<div style="border: 1px solid black; background-color: #FFFFFF;'
				+ ' padding: 3px 3px;">' + makeHeader(header) + '<p>'
				+ makeRollTable(rolls) +'</p></div>';
		},

		makeRollTable = function (content) {
			return '<table style="padding: 3px; border-collapse: separate; width: 100%">'
				+ content + '</table>';
		},

		makeHeader = function (text) {
		 return '<h3><div style="text-align:center">'+text+'</div></h3>';
		},

		makeRow = function (pic, name, rollStyle, formula, boundary, appendix) {
			return '<tr style="padding 2px;">' + makeName(pic, name) + (rollStyle === 'roll2' ?
				makeRoll2(formula,boundary,appendix) : makeRoll(formula,boundary,appendix))
			+ '</tr>';
		},

		makeName = function (pic, name) {
			return '<td style="vertical-align: middle; padding: 2px; border-bottom: 1px solid #ddd">'
				+ '<table><tr><td>'+ pic + '</td><td><b>' + name + '</b></td></tr></table></td>';
		},

		makeRoll = function (formula, boundary, appendix) {
			return '<td style="text-align:center; padding: 2px; border-bottom: 1px solid #ddd">'
				+ boundary[0] + formula + boundary[1] + appendix + '</td>';
		},

		makeRoll2 = function (f,b,a) {
			return makeRoll(f,b,a) + makeRoll(f,b,a);
		};

		return {
			makeBox: makeBox,
			makeRow: makeRow,
		};
	}(),

	// Data variables
	importData = {
		'5E-Shaped' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'formula' : '[[d20 + %strength_saving_throw_mod%]]' },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'formula' : '[[d20 + %dexterity_saving_throw_mod%]]' },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'formula' : '[[d20 + %constitution_saving_throw_mod%]]' },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'formula' : '[[d20 + %intelligence_saving_throw_mod%]]' },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'formula' : '[[d20 + %wisdom_saving_throw_mod%]]' },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'formula' : '[[d20 + %charisma_saving_throw_mod%]]' },
//			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : '[[d20 + %fortitude_saving_throw_mod%]]' },
//			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : '[[d20 + %reflex_saving_throw_mod%]]' },
//			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : '[[d20 + %will_saving_throw_mod%]]' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : '[[d20 + %strength_check_mod_formula%]]' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : '[[d20 + %dexterity_check_mod_formula%]]' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : '[[d20 + %constitution_check_mod_formula%]]' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : '[[d20 + %intelligence_check_mod_formula%]]' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : '[[d20 + %wisdom_check_mod_formula%]]' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : '[[d20 + %charisma_check_mod_formula%]]' },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'formula' : '[[d20 + %repeating_skill_$0_formula%]]' },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'formula' : '[[d20 + %repeating_skill_$1_formula%]]' },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'formula' : '[[d20 + %repeating_skill_$2_formula%]]' },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'formula' : '[[d20 + %repeating_skill_$3_formula%]]' },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'formula' : '[[d20 + %repeating_skill_$4_formula%]]' },
			'History': { 'name' : 'Intelligence (History) Check', 'formula' : '[[d20 + %repeating_skill_$5_formula%]]' },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'formula' : '[[d20 + %repeating_skill_$6_formula%]]' },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'formula' : '[[d20 + %repeating_skill_$7_formula%]]' },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'formula' : '[[d20 + %repeating_skill_$8_formula%]]' },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'formula' : '[[d20 + %repeating_skill_$9_formula%]]' },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'formula' : '[[d20 + %repeating_skill_$10_formula%]]' },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'formula' : '[[d20 + %repeating_skill_$11_formula%]]' },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'formula' : '[[d20 + %repeating_skill_$12_formula%]]' },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'formula' : '[[d20 + %repeating_skill_$13_formula%]]' },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'formula' : '[[d20 + %repeating_skill_$14_formula%]]' },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'formula' : '[[d20 + %repeating_skill_$15_formula%]]' },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'formula' : '[[d20 + %repeating_skill_$16_formula%]]' },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'formula' : '[[d20 + %repeating_skill_$17_formula%]]' },
			'AC' : { 'name' : 'Armor Class', 'formula' : '%AC%'}
		},
		'Pathfinder' : {
			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : '[[d20 + %Fort%]]' },
			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : '[[d20 + %Ref%]]' },
			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : '[[d20 + %Will%]]' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : '[[d20 + %STR-mod% + %checks-cond%]]' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : '[[d20 + %DEX-mod% + %checks-cond%]]' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : '[[d20 + %CON-mod% + %checks-cond%]]' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : '[[d20 + %INT-mod% + %checks-cond%]]' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : '[[d20 + %WIS-mod% + %checks-cond%]]' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : '[[d20 + %CHA-mod% + %checks-cond%]]' },
			'Perception': { 'name' : 'Perception Check', 'formula' : '[[d20 + %Perception%]]'},
			'Stealth' : { 'name' : 'Stealth Check', 'formula' : '[[d20 + %Stealth%]]'},
			'AC' : { 'name' : 'Armor Class', 'formula' : '%AC%'}
		},
		'5E-OGL' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'formula' : '[[d20 + %strength_save_bonus% + %globalsavemod%]]' },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'formula' : '[[d20 + %dexterity_save_bonus% + %globalsavemod%]]' },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'formula' : '[[d20 + %constitution_save_bonus% + %globalsavemod%]]' },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'formula' : '[[d20 + %intelligence_save_bonus% + %globalsavemod%]]' },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'formula' : '[[d20 + %wisdom_save_bonus% + %globalsavemod%]]' },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'formula' : '[[d20 + %charisma_save_bonus% + %globalsavemod%]]' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : '[[d20 + %strength_mod%]]' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : '[[d20 + %dexterity_mod%]]' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : '[[d20 + %constitution_mod%]]' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : '[[d20 + %intelligence_mod%]]' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : '[[d20 + %wisdom_mod%]]' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : '[[d20 + %charisma_mod%]]' },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'formula' : '[[d20 + %acrobatics_bonus%]]' },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'formula' : '[[d20 + %animal_handling_bonus%]]' },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'formula' : '[[d20 + %arcana_bonus%]]' },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'formula' : '[[d20 + %athletics_bonus%]]' },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'formula' : '[[d20 + %deception_bonus%]]' },
			'History': { 'name' : 'Intelligence (History) Check', 'formula' : '[[d20 + %history_bonus%]]' },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'formula' : '[[d20 + %insight_bonus%]]' },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'formula' : '[[d20 + %intimidation_bonus%]]' },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'formula' : '[[d20 + %investigation_bonus%]]' },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'formula' : '[[d20 + %medicine_bonus%]]' },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'formula' : '[[d20 + %nature_bonus%]]' },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'formula' : '[[d20 + %perception_bonus%]]' },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'formula' : '[[d20 + %performance_bonus%]]' },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'formula' : '[[d20 + %persuasion_bonus%]]' },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'formula' : '[[d20 + %religion_bonus%]]' },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'formula' : '[[d20 + %sleight_of_hand_bonus%]]' },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'formula' : '[[d20 + %stealth_bonus%]]' },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'formula' : '[[d20 + %survival_bonus%]]' },
			'AC' : { 'name' : 'Armor Class', 'formula' : '%AC%' }
		},
		'3.5' : {
			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : '[[d20 + %fortitude%]]' },
			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : '[[d20 + %reflex%]]' },
			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : '[[d20 + %wisdom%]]' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : '[[d20 + %str-mod%]]' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : '[[d20 + %dex-mod%]]' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : '[[d20 + %con-mod%]]' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : '[[d20 + %int-mod%]]' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : '[[d20 + %wis-mod%]]' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : '[[d20 + %cha-mod%]]' },
			'Hide' : { 'name' : 'Hide Check', 'formula' : '[[d20 + %hide%]]' },
			'Listen': { 'name' : 'Listen Check', 'formula' : '[[d20 + %listen%]]' },
			'Move Silently' : { 'name' : 'Move Silently Check', 'formula' : '[[d20 + %movesilent%]]' },
			'Spot': { 'name' : 'Spot Check', 'formula' : '[[d20 + %spot%]]' },
			'AC' : { 'name' : 'Armor Class', 'formula' : '%armorclass%' }
		}
	},

	optsData = {
		list : {
			ro : {type: 'string', def: 'roll1', admissible: ['roll1', 'roll2', 'adv', 'dis', 'rollsetting']},
			multi : {type: 'string', local: true},
			fallback : {type: 'string'},
			custom : {type: 'string', local: true},
			die_adv : {type: 'string', def: '2d20kh1'},
			die_dis : {type: 'string', def: '2d20kl1'},
			globalmod : {type: 'string'},
			whisper : {type: 'bool', def: false, negate : 'public'},
			hideformula : {type: 'bool', def: false, negate : 'showformula'},
			usetokenname : {type: 'bool', def: true, negate : 'usecharname'},
			showpicture : {type: 'bool', def: true, negate : 'hidepicture'},
			help : {type : 'other'}
		},
		meta : {}
	},

	// Setup
	checkInstall = function() {
		if (!state.groupCheck) {
			initializeState();
		}
		else if (state.groupCheck.version < stateVersion) {
			updateState();
		}
		// Build metadata for available options
		optsData.meta = {
			allopts : _.keys(optsData.list),
			str : _.chain(optsData.list).pick(v => v.type === 'string').keys().value(),
			glob :  _.chain(optsData.list).omit(v => v.local).keys().value(),
			bool : _.chain(optsData.list).pick(v => v.type === 'bool').keys().value(),
			boolNeg : _.chain(optsData.list).pick(v => v.type === 'bool').pluck('negate').value()
		};
		log('-=> groupCheck v'+version+' <=-');
	},

	initializeState = function() {
		state.groupCheck = {
			'checkList' : {},
			'options' : _.chain(optsData.list).pick(v => _.has(v,'def')).mapObject(v => v.def).value(),
			'version' : stateVersion
		};
		log('-=> groupCheck initialized with default settings!<=-');
	},

	updateState = function() {
		if (state.groupCheck.version == 1) {
			_.each(state.groupCheck.checkList, function(check) {
				let die = check.die || state.groupCheck.options.die;
				check.formula = _.union([die], _.map(check.mod, str => '%'+str+'%')).join(' + ');
				delete check.mod;
			});
			delete state.groupCheck.options.die;
			state.groupCheck.options.hideformula = state.groupCheck.options.hidebonus;
			delete state.groupCheck.options.hidebonus;
			state.groupCheck.version = 2;
			log('-=> groupCheck has updated to a new data format (1=>2). Please make sure your list of checks has converted correctly.<=-');
			updateState();
		}
		if (state.groupCheck.version == 2) {
			_.each(state.groupCheck.checkList, function(check) {
				check.formula = '[[' + check.formula+ ']]';
			});
			log('-=> groupCheck has updated to a new data format (2=>3). Please make sure your list of checks has converted correctly.<=-');
			state.groupCheck.version = 3;
			updateState();
		}
		if (state.groupCheck.version == 3) {
			state.groupCheck.options.showpicture = true;
			state.groupCheck.version = 4;
		}
	},

	// Utility functions
	safeReadJSON = function (string) {
		try {
			let o = JSON.parse(string);
			if (o && typeof o === 'object') {
				return o;
			}
		}
		catch (e) { }
		return false;
	},

	sendChatNoarchive = function(who, string) {
		sendChat(who, string);
	},

	recoverInlinerollFormulae = function (msg) {
		// Input:	msg - chat message
		// Output:	msg.content, with all inline rolls replaced by their expression
		if (_.has(msg, 'inlinerolls')) {
			return _.chain(msg.inlinerolls)
					.reduce(function(previous, current, index) {
						previous['$[[' + index + ']]'] = current.expression;
						return previous;
					},{})
					.reduce(function(previous, current, index) {
						return previous.replace(index, '[[' + current + ']]');
					}, msg.content)
					.value();
		} else {
			return msg.content;
		}
	},

	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		if (match) {
			return match[1] || 'GM';
		} else {
			return who || 'GM';
		}
	},

	handleError = function(who, errorMsg) {
		let output = '/w "' + who +
			'" <div style="border: 1px solid black; background-color: #FFBABA; padding: 3px 3px;">' +
			'<h4>Error</h4><p>' + errorMsg + '</p></div>';
		sendChatNoarchive('GroupCheck', output);
	},

	printHelp = function(who) {
		let helpString = '/w "' + who + '"<div style="border: 1px solid black;'
			+ ' background-color: #FFFFFF; padding: 3px 3px;">'
			+ 'Please refer to the <a style="text-decoration: underline" href='
			+ '"https://github.com/Roll20/roll20-api-scripts/tree/master/GroupCheck/0.9.1/README.md"'
			+ '>documentation</a> for help with using GroupCheck,'
			+ ' or ask in the API forum thread.</div>';
		sendChatNoarchive('GroupCheck', helpString);
	},

	printConfigHelp = function(who) {
		let helpString = '/w "' + who + '"<div style="border: 1px solid black;'
			+ ' background-color: #FFFFFF; padding: 3px 3px;">'
			+ 'Please refer to the <a style="text-decoration: underline" href='
			+ '"https://github.com/Roll20/roll20-api-scripts/tree/master/GroupCheck/0.9.1/README.md"'
			+ '>documentation</a> for help with configuring GroupCheck,'
			+ ' or ask in the API forum thread.</div>';
		sendChatNoarchive('GroupCheck', helpString);
	},

	printCommandMenu = function(who, opts) {
		// create options
		let optsCommand = '',commandOutput;
		_.each(opts, function (value, key) {
			if (typeof value === 'boolean') {
				optsCommand += `--${key} `;
			}
			if (typeof value === 'string') {
				optsCommand += `--${key} ${value} `;
			}
		});
		commandOutput = '/w "' + who;
		commandOutput += '" <div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;">';
		commandOutput += '<h3>Available commands:</h3>';
		for (let s in state.groupCheck.checkList) {
			commandOutput += `[${s}](!group-check ${optsCommand} --${s})`;
		}
		commandOutput += '</div>';
		sendChatNoarchive('GroupCheck', commandOutput);
		return;
	},

	getConfigTable = function() {
		let output = '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;display:inline-block;">' +
			'<h4>Current Options</h4><br> <table style="margin:3px;">' +
			'<tr><td><b>Name</b></td><td><b>Value</td></b></tr>';
		_.each(state.groupCheck.options, function(value, key) {
			output += '<tr><td>'+key+'</td><td>'+value+'</td></tr>';
		});
		output += '</table></div><br>';

		output += '<div style="border: 1px solid black; background-color: #FFFFFF; padding: 3px 3px;display:inline-block;">' +
			'<h4>Checks</h4><br> <table style="margin:3px;">' +
			'<tr><td><b>Command</b></td><td><b>Name</td></b><td><b>Formula</b></td></tr>';
		_.each(state.groupCheck.checkList, function(value, key) {
			output += '<tr><td>'+key+'</td><td>'+value.name+'</td><td>'+value.formula.replace(/\[\[/g,'{{').replace(/\]\]/g,'}}')+'</td></tr>';
		});
		output += '</table><br><p>(note that curly brackets may be square brackets in the formula).</p></div>';
		return output;
	},

	getRollOption = function(charid) {
		if (charid) {
			switch(getAttrByName(charid,"roll_setting")) {
				case "{{ignore=[[0" :
					return 'roll1';
					break;
				case "adv {{ignore=[[0":
					return 'adv';
					break;
				case "dis {{ignore=[[0" :
					return 'dis';
					break;
			}
		}
		return 'roll2';
	},

	processOpts = function(content, hasValue) {
		// Input:	content - string of the form command --opts1 --opts2  value --opts3.
		//					values come separated by whitespace.
		//			hasValue - array of all options which come with a value
		// Output:	object containing key:true if key is not in hasValue. and containing
		//			key:value otherwise
		var args, kv, opts = {};
		args = _.rest(content.split(/\s+--/));
		for (var k in args) {
			kv = args[k].split(/\s(.+)/);
			if (_.contains(hasValue, kv[0])) {
				opts[kv[0]] = kv[1];
			}
			else {
				opts[args[k]] = true;
			}
		}
		return opts;
	},

	// This is where we do the work
	addTokenToOutput = function(token, checkFormula, opts) {
		let displayName, computedFormula, rollAppendix = '', charName, tokenPic;
		const characterId = token.get('represents'),
			ro = opts.rollOption(characterId),
			character = getObj('character', characterId);

		if (character) {
			charName = character.get('name');
			if (opts.usetokenname) {
				displayName = token.get('name');
			}
			else {
				displayName = charName;
			}
			computedFormula = checkFormula.join(charName);
		}
		else if (opts.fallback) {
			displayName = token.get('name');
			computedFormula = checkFormula
				.join('INSERT_NAME')
				.replace(/@\{INSERT_NAME\|.*?\}/,opts.fallback)
				.replace(/@\{INSERT_NAME\|.*?\}/g,'0');
		}
		else {
			return '';
		}
		tokenPic = (opts.showpicture || !displayName) ? `<img src="${token.get('imgsrc')}" height="25" width="25">` : '';

		switch (ro) {
			case 'adv' :
				rollAppendix = ' (Advantage)';
				computedFormula = computedFormula.replace(/1?d20/,'2d20kh1');
				break;
			case 'dis' :
				rollAppendix = ' (Disadvantage)';
				computedFormula = computedFormula.replace(/1?d20/,'2d20kl1');
				break;
		}

		return outputStyle.makeRow(tokenPic, displayName, ro, computedFormula, opts.rollBoundary, rollAppendix);
	},

	handleConfig = function (msg) {
		const hasValueConfig = ['import','add','delete','set'];
		let opts = processOpts(recoverInlinerollFormulae(msg), hasValueConfig);
		let who = getPlayerName(msg.who), output;

		if (!playerIsGM(msg.playerid)) {
			sendChatNoarchive('GroupCheck', whisper + 'Permission denied.');
			return;
		}

		if (opts.import) {
			if (_.has(importData,opts.import)) {
				_.extend(state.groupCheck.checkList, importData[opts.import]);
				output = 'Data set ' + opts.import + ' imported.';
			} else {
				handleError(who, 'Dataset ' + opts.import + ' not found.');
			}
		}
		else if (opts.add) {
			let data = safeReadJSON(opts.add.replace(/\{\{/g,'[[').replace(/\}\}(?!$)/g,']]'));
			if (_.isObject(data)) {
				_.each(data, function (value, key) {
					if (!(_.isObject(value) && _.has(value, 'name') && _.has(value,'formula') && _.isString(value.formula))) {
						delete data[key];
					}
				});
				_.extend(state.groupCheck.checkList, data);
				output = 'Checks added. The imported JSON was '
					+ JSON.stringify(data).replace(/\[\[/g,'{{').replace(/\]\]/g,'}}')
					+ ' (curly brackets may be square brackets in the formula).';

			} else {
				handleError(who, 'Error reading input.');
			}
		}
		else if (opts.delete) {
			if (_.has(state.groupCheck.checkList, opts.delete)) {
				delete state.groupCheck.checkList[opts.delete];
				output = 'Check ' + opts.delete + ' deleted.';
			} else {
				handleError(who, 'Check called ' + opts.delete+ ' not found.');
			}
		}
		else if (opts.clear) {
			state.groupCheck.checkList = {};
			output = 'All checks cleared.';
		}
		else if (opts.set) {
			const kv = opts.set.split(/\s(.+)/);
			if (_.indexOf(optsData.meta.str, kv[0]) !== -1 && _.indexOf(optsData.meta.glob, kv[0]) !== -1 ) {
				state.groupCheck.options[kv[0]] = kv[1];
				output = 'Option ' + kv[0] + ' set to ' + kv[1] + '.';
			}
			else if (kv[0] === 'ro') {
				if (_.indexOf(optsData.list.ro.admissible, kv[1]) !== -1) {
					state.groupCheck.options.ro = kv[1];
					output = 'Option ' + kv[0] + ' set to ' + kv[1] + '.';
				} else {
					handleError(who, 'Roll option ' + kv[1] + ' is invalid, sorry.');
					return;
				}
			}
			else if (_.indexOf(optsData.meta.bool, kv[0]) !== -1) {
				state.groupCheck.options[kv[0]] = true;
				output = 'Option ' + kv[0] + ' set to ' + state.groupCheck.options[kv[0]] + '.';
			}
			else if (_.indexOf(optsData.meta.boolNeg, kv[0]) !== -1) {
				kv[0] = optsData.meta.bool[_.indexOf(optsData.meta.boolNeg, kv[0])];
				state.groupCheck.options[kv[0]] = false;
				output = 'Option ' + kv[0] + ' set to ' + state.groupCheck.options[kv[0]] + '.';
			}
			else {
				handleError(who, 'Command not understood.');
			}
		}
		else if (opts.defaults) {
			state.groupCheck.options = defaultOptions;
			output = 'All options reset to defaults.';
		}
		else if (opts.reset) {
			initializeState();
			output = 'Everything is reset to factory settings.';
		}
		else if (opts.show) {
			output = getConfigTable();
		}
		else {
			printConfigHelp(who);
		}

		if (output) {
			sendChatNoarchive('GroupCheck', '/w "' + who + '" ' + output);
		}

		return;
	},

	handleOutput = function (msg) {
		let checkCmd, checkName, checkFormula, output, rollBoundary, rollText;

		// Options processing
		let who = getPlayerName(msg.who);
		let opts = processOpts(recoverInlinerollFormulae(msg), optsData.meta.str);
		checkCmd = _.intersection(_.keys(state.groupCheck.checkList), _.keys(opts))[0];
		
		// Print menu if we don't know what to roll
		if (!checkCmd && !opts.custom && !opts.help) {
			printCommandMenu(who,opts);
			return;
		}
		// Continue with options processing
		if (checkCmd) {
			checkFormula = state.groupCheck.checkList[checkCmd].formula
				.replace(/\%(\S.*?)\%/g,'@{INSERT_NAME|$1}')
				.split('INSERT_NAME');
			checkName = state.groupCheck.checkList[checkCmd].name;
		}
		_.each(optsData.meta.boolNeg, function (name,index) {
			if (opts[name]) {
				opts[optsData.meta.bool[index]] = false;
			}
		});
		opts = _.pick(opts, optsData.meta.allopts);

		// Help
		if (opts.help) {
			printHelp(who);
			return;
		}

		// Handle custom modifier
		if (opts.custom) {
			let kv = opts.custom.split(/,\s?/);
			if (kv.length < 2) {
				handleError(who,"Custom roll format invalid");
				return;
			}
			checkName = kv.shift();
			checkFormula = kv.join()
				.replace(/\{\{/g,'[[')
				.replace(/\}\}/g,']]')
				.replace(/\%(\S.*?)\%/g, '@{INSERT_NAME|$1}')
				.split('INSERT_NAME');
		}

		// Plug in defaults for unspecified options
		opts = _.defaults(opts, state.groupCheck.options);
		if (_.indexOf(optsData.list.ro.admissible, opts.ro) === -1) {
			handleError(who,'Roll option ' + opts.ro + ' is invalid, sorry.');
			return;
		}

		// Output
		output = opts.whisper ? '/w GM ' : '';
		opts.multi = (opts.multi > 1 ) ? parseInt(opts.multi) : 1;
		opts.rollBoundary = (opts.hideformula) ? ['[[',']]'] : ['',''];
		opts.rollOption = (opts.ro === 'rollsetting') ? getRollOption : ( (charid) => opts.ro);

		if (opts.globalmod) {
			if (checkFormula[checkFormula.length -1].search(/\]\](?=$)/) !== -1) {
				checkFormula[checkFormula.length -1] = checkFormula[checkFormula.length -1]
					.replace(/\]\](?=$)/, ' + ' + opts.globalmod + '[global modifier]]]');
			}
			else {
				checkFormula[checkFormula.length -1] += ` + ${opts.globalmod}[global]`;
			}
		}

		rollText = _.chain(msg.selected)
			.map(obj => getObj('graphic', obj._id))
			.compact()
			.map(function (token) {
				return addTokenToOutput(token, checkFormula, opts)
					.repeat(opts.multi);
			})
			.value().join('');

		output += outputStyle.makeBox(checkName, rollText);

		try {
			sendChat(who, output);
		}
		catch(err) {
			output = 'Something went wrong with the roll. The command you tried was:<br>'
				+ msg.content + '<br> The error message generated by Roll20 is:<br>'
				+ err;
			handleError(who, output);
		}
	},

	handleInput = function(msg) {
		if (msg.type === 'api' && msg.content.search(/^!group-check($|\s)/) != -1) {
			handleOutput(msg);
		}
		else if (msg.type === 'api' && msg.content.search(/^!group-check-config\b/) != -1) {
			handleConfig(msg);
		}
		return;
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on('ready',function() {
	'use strict';

	groupCheck.CheckInstall();
	groupCheck.RegisterEventHandlers();
});
