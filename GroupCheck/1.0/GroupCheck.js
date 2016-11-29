// GroupCheck version 1.0
// Last Updated: 2016-11-22
// A script to roll checks for many tokens at once with one command.

var groupCheck = groupCheck || (function() {
	'use strict';
	const version = '1.0',
	stateVersion = 5,
	// Roll appearance
	outputStyle = function () {
		const makeBox = function (header, subheader, freetext, content) {
			return '<div style="border:1px solid #888;background-color:#FFFFFF;' +
				'border-radius:5px;padding:1px 3px"><div style="margin-bottom:1em">' +
				makeHeader(header) + makeSubheader(subheader) + '</div>' +
				makeContent(content) + makeFreetext(freetext) +	'</div>';
		},
		makeContent = function (text) {
			return '<table style="border-collapse:separate;width:100%">' +
				text + '</table>';
		},
		makeHeader = function (text) {
			return '<h3 style="text-align:center">' + text + '</h3>';
		},
		makeSubheader = function (text) {
			return text ? '<h4 style="text-align:center">' + text + '</h4>' : '';
		},
		makeFreetext = function (text) {
			return text ? '<p style="text-align:center">' + text + '</p>' : '';
		},
		makeRow = function (pic, name, roll2, r0, r1, appendix) {
			return '<tr style="padding:3px;border-bottom:1px solid #ddd;width:90%;' +
				'height:30px;margin-left:5%">' + makeName(pic,name) +
				(roll2 ? makeRoll2(r0, r1) : makeRoll(r0, appendix)) + '</tr>';
		},
		makeName = function (pic, name) {
			return '<td style="vertical-align:middle;padding:2px;border-bottom:' +
				'1px solid #ddd"><table><tr><td>' +
				(pic ? '<img style="display:inline-block;width:25px"' +
					'src="' + pic + '">' : '') + '</td><td><b>' +
				name + '</b></td></tr></table></td>';
		},
		makeRoll = function (text, appendix) {
			return '<td style="text-align:center;padding:2px;border-bottom:1px' +
				 ` solid #ddd">${text}${appendix}</td>`;
		},
		makeRoll2 = function (r0,r1) {
			return makeRoll(r0,'') + makeRoll(r1,'');
		},
		makeInlineroll = function(roll, hideformula) {
			let boundary = '';
			switch (detectCritical(roll.results)) {
				case 'crit' :
					boundary = ';border:2px solid #3FB315';
					break;
				case 'mixed' :
					boundary = ';border:2px solid #4A57ED';
					break;
				case 'fumble' :
					boundary = ';border:2px solid #B31515';
			}
			return '<div class="showtip tipsy" title="' +
				(hideformula ? '' : 'Rolling ' + roll.expression + ' = ' +
					rollToText(roll.results)) +
				'"style="display:inline-block;min-width:1em;font-size:1.2em;' +
				'font-weight:bold;padding:0px 3px;cursor:help' + boundary + '">' +
				(roll.results.total || 0) + '</div>';
		},
		rollToText = function(roll) {
			switch (roll.type) {
				case 'R' :
					let c = (roll.mods && roll.mods.customCrit) ||
						[{ comp : '==', point : roll.sides}],
						f = (roll.mods && roll.mods.customFumble) ||
						[{ comp : '==', point : 1}],
						styledRolls = _.map(roll.results, function (r) {
							let style = rollIsCrit(r.v, c[0].comp, c[0].point) ?
								' critsuccess' :
								(rollIsCrit(r.v, f[0].comp, f[0].point) ?
								' critfail'  : '')
							return `<span class='basicdiceroll${style}'>${r.v}</span>`;
						});
					return `(${styledRolls.join('+')})`;
					break;
				case 'M' :
					return roll.expr.toString().replace(/(\+|-)/g,'$1 ');
					break;
				case 'V' :
					return _.map(roll.rolls, rollToText).join(' ');
					break;
				case 'G' :
					return '(' + _.map(roll.rolls, a => _.map(a, rollToText).join(' '))
						.join(' ') + ')';
					break;
				default :
					return '';
			}
		};
		return {
			makeBox: makeBox,
			makeInlineroll: makeInlineroll,
			makeRow: makeRow
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
			ro : {type: 'string', def: 'roll1',
				admissible: ['roll1', 'roll2', 'adv', 'dis', 'rollsetting']},
			die_adv : {type: 'string', def: '2d20kh1'},
			die_dis : {type: 'string', def: '2d20kl1'},
			fallback : {type: 'string'},
			globalmod : {type: 'string'},
			subheader : {type: 'string', local: true},
			custom : {type: 'string', local: true},
			'apply-change' : {type: 'string', local: true},
			whisper : {type: 'bool', def: false, negate : 'public'},
			hideformula : {type: 'bool', def: false, negate : 'showformula'},
			usetokenname : {type: 'bool', def: true, negate : 'usecharname'},
			showpicture : {type: 'bool', def: true, negate : 'hidepicture'},
			process : {type: 'bool', def: false, negate : 'direct'},
			showaverage : {type: 'bool', local: true}
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
			str : _.chain(optsData.list)
				.pick(v => v.type === 'string')
				.keys()
				.value(),
			glob :  _.chain(optsData.list)
				.omit(v => v.local)
				.keys()
				.value(),
			bool : _.chain(optsData.list)
				.pick(v => v.type === 'bool')
				.keys()
				.value(),
			boolNeg : _.chain(optsData.list)
				.pick(v => v.type === 'bool')
				.pluck('negate')
				.value()
		};
		log('-=> groupCheck v'+version+' <=-');
	},
	initializeState = function() {
		state.groupCheck = {
			'checkList' : {},
			'options' : _.chain(optsData.list)
				.pick(v => _.has(v,'def'))
				.mapObject(v => v.def)
				.value(),
			'version' : stateVersion
		};
		log('-=> groupCheck initialized with default settings!<=-');
	},
	updateState = function() {
		if (state.groupCheck.version == 1) {
			_.each(state.groupCheck.checkList, function(check) {
				let die = check.die || state.groupCheck.options.die;
				check.formula = _.union([die], _.map(check.mod, str => '%'+str+'%'))
					.join(' + ');
				delete check.mod;
			});
			delete state.groupCheck.options.die;
			state.groupCheck.options.hideformula = state.groupCheck.options.hidebonus;
			delete state.groupCheck.options.hidebonus;
			state.groupCheck.version = 2;
			log('-=> groupCheck has updated to a new data format (1=>2). Please make' +
				' sure your list of checks has converted correctly.<=-');
		}
		if (state.groupCheck.version == 2) {
			_.each(state.groupCheck.checkList, function(check) {
				check.formula = '[[' + check.formula+ ']]';
			});
			log('-=> groupCheck has updated to a new data format (2=>3). Please make' +
				' sure your list of checks has converted correctly.<=-');
			state.groupCheck.version = 3;
		}
		if (state.groupCheck.version == 3) {
			state.groupCheck.options.showpicture = true;
			state.groupCheck.version = 4;
		}
		if (state.groupCheck.version == 4) {
			state.groupCheck.options.process = false;
			state.groupCheck.version = 5;
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
		if (_.has(msg, 'inlinerolls')) {
			return _.chain(msg.inlinerolls)
				.reduce(function(m, v, k) {
					m['$[['+k+']]'] = '[['+v.expression+']]';
					return m;
				},{})
				.reduce((m, v, k) => m.replace(k, v), msg.content)
				.value();
		} else {
			return msg.content;
		}
	},
	htmlReplace = function (str) {
		let entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};
		return _.map(str.split(''), c => (_.has(entities,c)) ? ('&'+entities[c]+';') : c)
			.join('');
	},
	getPlayerName = function(who) {
		let match = who.match(/(.*) \(GM\)/);
		return match ? (match[1] || 'GM') : (who || 'GM');
	},
	handleError = function(who, errorMsg) {
		let output = `/w "${who}" <div style="border:1px solid black;background-color:` +
			`#FFBABA;padding:3px 3px;"><h4>Error</h4><p>${errorMsg}</p></div>`;
		sendChatNoarchive('GroupCheck', output);
	},
	printHelp = function(who) {
		let helpString = `/w "${who}" <div style="border:1px solid black;` +
			'background-color:#FFFFFF;padding:3px 3px;">Please refer to the ' +
			'<a style="text-decoration:underline" href="https://github.com/Roll20/' +
			'roll20-api-scripts/tree/master/GroupCheck/1.0/README.md">documentation' +
			'</a> for help with using GroupCheck, or ask in the API forum thread.</div>';
		sendChatNoarchive('GroupCheck', helpString);
	},
	printCommandMenu = function(who, opts) {
		let optsCommand = _.map(opts, function (value, key) {
			return (typeof value === 'boolean') ? `--${key}` : `--${key} ${value}`;
		}).join(' ');
		let commandOutput = `/w "${who}" <div style="border:1px solid black;` +
			'background-color:#FFFFFF;padding:3px 3px;">' +
			'<h3 style="text-align:center">Available commands:</h3><p>' +
			_.map(_.keys(state.groupCheck.checkList), function (s) {
				return `[${s}](!group-check ${optsCommand} --${s})`;
			}).join('') +
			'</p></div>';
		sendChatNoarchive('GroupCheck', commandOutput);
	},
	getConfigTable = function() {
		let output = '<div style="border: 1px solid black; background-color: #FFFFFF;' +
			' padding: 3px 3px;display:inline-block;"><h4>Current Options</h4><br><table' +
			' style="margin:3px;"><tr><td><b>Name</b></td><td><b>Value</td></b></tr>' +
			_.map(state.groupCheck.options, function(value, key) {
				return `<tr><td>${key}</td><td>${value}</td></tr>`;
			}).join('') +
			'</table></div><br>';
		output += '<div style="border: 1px solid black; background-color: #FFFFFF;' +
			' padding: 3px 3px;display:inline-block;"><h4>Checks</h4><br><table style=' +
			'"margin:3px;"><tr><td><b>Command</b></td><td><b>Name</td></b><td><b>' +
			'Formula</b></td></tr>' +
			_.map(state.groupCheck.checkList, function(value, key) {
				return `<tr><td>${key}</td><td>${value.name}</td><td>` +
					`${htmlReplace(value.formula)}</td></tr>`;
			}).join('') +
			'</table></div>';
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
	parseOpts = function (content, hasValue) {
		return _.chain(content.replace(/<br\/>\n/g, ' ')
				.replace(/({{(.*?)\s*}}\s*$)/g, '$2')
				.split(/\s+--/))
			.rest()
			.reduce(function (opts, arg) {
				let kv = arg.split(/\s(.+)/);
				(_.contains(hasValue, kv[0])) ? (opts[kv[0]] = (kv[1] || '')) :
					(opts[arg] = true);
				return opts;
			}, {})
			.value();
	},
	detectCritical = function(roll) {
		let s = [];
		if (roll.type === 'V' && _.has(roll, 'rolls')) {
			s = _.map(roll.rolls, detectCritical);
		} else if (roll.type === 'G' && _.has(roll, 'rolls')) {
			s = _.chain(roll.rolls)
				.map(a => _.map(a, detectCritical))
				.flatten()
				.value();
		} else if (roll.type === 'R' && _.has(roll,'sides')) {
			let crit = (roll.mods && roll.mods.customCrit) ||
				[{ comp : '==', point : roll.sides}];
			let fumble = (roll.mods && roll.mods.customFumble) ||
				[{ comp : '==', point : 1}];
			if (_.some(roll.results, r => rollIsCrit(r.v, crit[0].comp, crit[0].point))) {
				s.push('crit');
			}
			if (_.some(roll.results, r => rollIsCrit(r.v, fumble[0].comp, fumble[0].point))) {
				s.push('fumble');
			}
		}
		let c = _.contains(s, 'crit');
		let f = _.contains(s, 'fumble');
		let m = _.contains(s, 'mixed') || (c && f);
		return (m ? 'mixed' : (c ? 'crit' : (f ? 'fumble' : (false))));
	},
	rollIsCrit = function(value, comp, point) {
		switch (comp) {
			case '==' :
				return value == point;
				break;
			case '<=' :
				return value <= point;
				break;
			case '>=' :
				return value >= point;
		}
	},
	//Main functions
	processTokenRollData = function(token, checkFormula, opts) {
		let displayName, computedFormula, rollAppendix = '', charName, tokenPic;
		const characterId = token.get('represents'),
			ro = opts.rollOption(characterId),
			character = getObj('character', characterId);
		if (character) {
			charName = character.get('name');
			displayName = (opts.usetokenname) ? token.get('name') : charName;
			computedFormula = checkFormula.join(charName);
		} else if (opts.fallback) {
			displayName = token.get('name');
			computedFormula = checkFormula
				.join('INSERT_NAME')
				.replace(/@\{INSERT_NAME\|.*?\}/, opts.fallback)
				.replace(/@\{INSERT_NAME\|.*?\}/g, '0');
		} else {
			return null;
		}
		tokenPic = (opts.showpicture || !displayName) ? token.get('imgsrc') : false;
		switch (ro) {
			case 'adv' :
				rollAppendix = ' (Advantage)';
				computedFormula = computedFormula.replace(/1?d20/, opts.die_adv);
				break;
			case 'dis' :
				rollAppendix = ' (Disadvantage)';
				computedFormula = computedFormula.replace(/1?d20/, opts.die_dis);
				break;
		}
		return {
			'pic' : tokenPic,
			'name' : displayName,
			'roll2' : (ro === 'roll2'),
			'formula' : computedFormula,
			'id' : token.id,
			'appendix' : rollAppendix
		}
	},
	sendFinalMessage = function (opts, checkName, rollData, msg) {
		let	freetext = '', match, inlinerollData = {};
		if (_.has(msg[0], 'inlinerolls')) {
			inlinerollData = _.reduce(msg[0].inlinerolls, function(r, c, i) {
				r[`$[[${i}]]`] = {
					result : c.results.total || 0,
					styled : outputStyle.makeInlineroll(c, opts.hideformula)
				};
				return r;
			},{});
		}
		_.each(msg[0].content.split('<br>'), function (value, j) {
			_.each(value.split('####'), function (str,n) {
				rollData[j]['result_' + n] = [];
				match = str.match(/\$\[\[\d+\]\]/);
				while (match) {
					rollData[j]['result_' + n].push(inlinerollData[match[0]].result);
					str = str.replace(match[0], inlinerollData[match[0]].styled);
					match = str.match(/\$\[\[\d+\]\]/);
				}
				rollData[j]['styled_' + n] = str;
			});
		});
		let rolls = _.map(rollData, function (o) {
			return outputStyle.makeRow(o.pic, o.name, o.roll2, o['styled_0'],
				o['styled_1'], o.appendix);
		});
		if (opts.showaverage) {
			let fakeRoll = {results :
				{
					total : (Math.round(10 * (_.chain(rollData)
						.map(o => o['result_0'][0]).reduce((p,c) => p + c, 0)).value() /
						rollData.length) / 10)
				}
			};
			rolls.push(outputStyle.makeRow('', 'Average of rolls', false,
				outputStyle.makeInlineroll(fakeRoll, true), '', ''));
		}
		if (_.has(opts, 'apply-change')) {
			let applyChangeOpts = (opts['apply-change'] || '')
				.replace(/~/g, '--')
				.replace(/RESULTS/, _.map(rollData, o => o['result_0'][0]).join(',')) +
				' --ids ' + _.map(rollData, o => o.id).join(' ');
			let button = `[stuff](apply-change ${applyChangeOpts} --ids ${ids})`;
		}
		let output = (opts.whisper ? '/w GM ' : '') +
			outputStyle.makeBox(checkName, opts.subheader, freetext, rolls.join(''));
		sendChat(opts.who, output);
	},
	handleConfig = function (msg) {
		const hasValueConfig = ['import','add','delete','set'];
		let opts = parseOpts(recoverInlinerollFormulae(msg), hasValueConfig);
		let who = getPlayerName(msg.who), output;
		if (!playerIsGM(msg.playerid)) {
			sendChatNoarchive('GroupCheck', `/w "${who}" Permission denied.`);
			return;
		}
		if (opts.import) {
			if (_.has(importData,opts.import)) {
				_.extend(state.groupCheck.checkList, importData[opts.import]);
				output = `Data set ${opts.import} imported.`;
			} else {
				handleError(who, `Data set ${opts.import} not found.`);
			}
		} else if (opts.add) {
			let data = safeReadJSON(opts.add);
			if (_.isObject(data)) {
				_.each(data, function (value, key) {
					if (!(_.isObject(value) && _.has(value, 'name') &&
						_.has(value,'formula') && _.isString(value.formula))) {
						delete data[key];
					}
				});
				_.extend(state.groupCheck.checkList, data);
				output = 'Checks added. The imported JSON was: <br>'
					+ htmlReplace(JSON.stringify(data));
			} else {
				handleError(who, 'Error reading input.');
			}
		} else if (opts.delete) {
			if (_.has(state.groupCheck.checkList, opts.delete)) {
				delete state.groupCheck.checkList[opts.delete];
				output = `Check ${opts.delete} deleted.`;
			} else {
				handleError(who, `Check called ${opts.delete} not found.`);
			}
		} else if (opts.set) {
			let kv = opts.set.split(/\s(.+)/);
			if (_.indexOf(optsData.meta.str, kv[0]) !== -1 && _.indexOf(optsData.meta.glob, kv[0]) !== -1 ) {
				state.groupCheck.options[kv[0]] = kv[1];
			} else if (kv[0] === 'ro') {
				if (_.indexOf(optsData.list.ro.admissible, kv[1]) !== -1) {
					state.groupCheck.options.ro = kv[1];
				} else {
					handleError(who, `Roll option ${kv[1]} is invalid, sorry.`);
					return;
				}
			} else if (_.indexOf(optsData.meta.bool, kv[0]) !== -1) {
				state.groupCheck.options[kv[0]] = true;
			} else if (_.indexOf(optsData.meta.boolNeg, kv[0]) !== -1) {
				kv[0] = optsData.meta.bool[_.indexOf(optsData.meta.boolNeg, kv[0])];
				state.groupCheck.options[kv[0]] = false;
			} else {
				handleError(who, 'Command not understood.');
				return;
			}
			output = `Option ${kv[0]} set to ${state.groupCheck.options[kv[0]]}.`;
		} else if (opts.clear) {
			state.groupCheck.checkList = {};
			output = 'All checks cleared.';
		} else if (opts.defaults) {
			state.groupCheck.options = defaultOptions;
			output = 'All options reset to defaults.';
		} else if (opts.reset) {
			initializeState();
			output = 'Everything is reset to factory settings.';
		} else if (opts.show) {
			output = getConfigTable();
		} else {
			printHelp(who);
		}
		if (output) {
			sendChatNoarchive('GroupCheck', `/w "${who}" ${output}`);
		}
		return;
	},
	handleRolls = function (msg) {
		// Options processing
		let checkName, checkFormula,
			who = getPlayerName(msg.who),
			opts = parseOpts(recoverInlinerollFormulae(msg), optsData.meta.str),
			checkCmd = _.intersection(_.keys(state.groupCheck.checkList), _.keys(opts))[0];
		// Print menu if we don't know what to roll
		if (opts.help) {
			printHelp(who);
			return;
		}
		if (!checkCmd && !opts.custom) {
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
		// Handle --custom
		if (opts.custom) {
			let kv = opts.custom.split(/,\s?/);
			if (kv.length < 2) {
				handleError(who,"Custom roll format invalid");
				return;
			}
			checkName = kv.shift();
			checkFormula = kv.join()
				.replace(/\%(\S.*?)\%/g, '@{INSERT_NAME|$1}')
				.split('INSERT_NAME');
		}
		// Remove invalid options and check commands from opts
		// Plug in defaults for unspecified options
		opts = _.chain(opts)
			.pick(optsData.meta.allopts)
			.defaults(state.groupCheck.options)
			.value();
		// Eliminate invalid roll option.
		if (_.indexOf(optsData.list.ro.admissible, opts.ro) === -1) {
			handleError(who,'Roll option ' + opts.ro + ' is invalid, sorry.');
			return;
		}
		// Get options into desired format
		opts.rollOption = (opts.ro === 'rollsetting') ? getRollOption : ( (charid) => opts.ro);
		opts.who = who;
		// Adjust formula if opts.globalmod is given
		if (opts.globalmod) {
			if (checkFormula[checkFormula.length -1].search(/\]\](?=$)/) !== -1) {
				checkFormula[checkFormula.length -1] = checkFormula[checkFormula.length -1]
					.replace(/\]\](?=$)/, ' + ' + opts.globalmod + '[global modifier]]]');
			} else {
				checkFormula[checkFormula.length -1] += ` + ${opts.globalmod}[global]`;
			}
		}
		// Transform tokens into nice data packages
		let rollData = _.chain(msg.selected)
			.map(obj => getObj('graphic', obj._id))
			.compact()
			.map(token => processTokenRollData(token, checkFormula, opts))
			.compact()
			.value();
		try {
			if (!opts.process) {
				opts.multi = (opts.multi > 1 ) ? parseInt(opts.multi) : 1;
				let rolls = _.map(rollData, function(o) {
					let f = opts.hideformula ? `[[${o.formula}]]` : o.formula;
					return outputStyle.makeRow(o.pic, o.name, o.roll2, f, f, o.appendix)
						.repeat(opts.multi);
				}).join('');
				let output = (opts.whisper ? '/w GM ' : '') +
					outputStyle.makeBox(checkName, opts.subheader, '', rolls);
				sendChat(who, output);
			} else {
				let sentFormula = _.map(rollData, function(o) {
						return (o.formula +	'####' + (o.roll2 ? (o.formula) : ''));
					}).join('<br>'),
					callback = _.partial(sendFinalMessage, opts, checkName, rollData);
				sendChat('', sentFormula, callback);
			}
		} catch(err) {
			let errorMessage = 'Something went wrong with the roll. The command you tried was:'
				+ '<br>' + msg.content + '<br> The error message generated by Roll20 is:'
				+ '<br>' + err;
			handleError(who, errorMessage);
		}
	},
	handleInput = function(msg) {
		if (msg.type === 'api' && msg.content.search(/^!group-check($|\s)/) != -1) {
			handleRolls(msg);
		} else if (msg.type === 'api' && msg.content.search(/^!group-check-config\b/) != -1) {
			handleConfig(msg);
		}
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
