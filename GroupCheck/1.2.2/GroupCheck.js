// GroupCheck version 1.2.2
// Last Updated: 2017-02-02
// A script to roll checks for many tokens at once with one command.

var groupCheck = groupCheck || (function() {
	'use strict';
	const version = '1.2.2',
	stateVersion = 6,
	dataVersion = 1,
	// Roll appearance
	outputStyle = function () {
		const makeBox = function (header, subheader, freetext, content) {
			return '<div style="border:1px solid #888;background-color:#FFFFFF;' +
				'border-radius:5px;padding:1px 3px;margin-left:-42px;"><div style' +
				'="margin-bottom:1em">' + makeHeader(header) + makeSubheader(subheader) +
				'</div>' + makeContent(content) + makeFreetext(freetext) +'</div>';
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
		makeRow = function (pic, name, roll2, formula0, formula1) {
			return '<tr style="padding:3px;width:90%;height:30px;margin-left:5%">' +
				makeName(pic,name) +
				(roll2 ? makeRoll2(formula0, formula1) : makeRoll(formula0)) +
				'</tr>';
		},
		makeName = function (pic, name) {
			return '<td style="vertical-align:middle;padding:2px;border-bottom:' +
				'1px solid #ddd"><table><tr>' +
				'<td>' + (pic ? '<img style="display:inline-block;width:25px"' +
					'src="' + pic + '">' : '') + '</td>' +
				'<td style="font-weight:bold;">' + name + '</td>' +
				'</tr></table></td>';
		},
		makeRoll = function (formula) {
			return '<td style="text-align:center;padding:2px;border-bottom:1px ' +
				 'solid #ddd">' + formula + '</td>';
		},
		makeRoll2 = function (formula0, formula1) {
			return makeRoll(formula0) + makeRoll(formula1);
		},
		makeCommandButton = function (name, command) {
			return `<a href="${htmlReplace(command)}"style="font-weight:bold;border:none;` +
				`color:#000000;background-color:#FFFFFF">${name}</a>`;
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
				(hideformula ? '' : 'Rolling ' + htmlReplace(roll.expression) + ' = ' +
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
								' critfail'	 : '')
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
			makeCommandButton : makeCommandButton,
			makeInlineroll: makeInlineroll,
			makeRow: makeRow
		};
	}(),
	// Data variables
	importData = {
		'5E-Shaped' : {
			'Strength Save': { 'name' : 'Strength Saving Throw', 'formula' : '[[d20 + %strength_formula% + %strength_saving_throw_mod%]]' },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'formula' : '[[d20 + %dexterity_formula% + %dexterity_saving_throw_mod%]]' },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'formula' : '[[d20 + %constitution_formula% + %constitution_saving_throw_mod%]]' },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'formula' : '[[d20 + %intelligence_formula% + %intelligence_saving_throw_mod%]]' },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'formula' : '[[d20 + %wisdom_formula% + %wisdom_saving_throw_mod%]]' },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'formula' : '[[d20 + %charisma_formula% + %charisma_saving_throw_mod%]]' },
//			'Fortitude Save': { 'name' : 'Fortitude Saving Throw', 'formula' : '[[d20 + %fortitude_saving_throw_mod%]]' },
//			'Reflex Save': { 'name' : 'Reflex Saving Throw', 'formula' : '[[d20 + %reflex_saving_throw_mod%]]' },
//			'Will Save': { 'name' : 'Will Saving Throw', 'formula' : '[[d20 + %will_saving_throw_mod%]]' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : '[[d20 + %strength_formula% + %strength_check_mod_formula%]]' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : '[[d20 + %dexterity_formula% + %dexterity_check_mod_formula%]]' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : '[[d20 + %constitution_formula% + %constitution_check_mod_formula%]]' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : '[[d20 + %intelligence_formula% + %intelligence_check_mod_formula%]]' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : '[[d20 + %wisdom_formula% + %wisdom_check_mod_formula%]]' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : '[[d20 + %charisma_formula% + %charisma_check_mod_formula%]]' },
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
			'Strength Save': { 'name' : 'Strength Saving Throw', 'formula' : '[[d20 + %strength_save_bonus% * {{1%npc_str_save%0, 0}=10} + 0%npc_str_save% + %globalsavemod% ]]' },
			'Dexterity Save': { 'name' : 'Dexterity Saving Throw', 'formula' : '[[d20 + %dexterity_save_bonus% * {{1%npc_dex_save%0, 0}=10} + 0%npc_dex_save% + %globalsavemod% ]]' },
			'Constitution Save': { 'name' : 'Constitution Saving Throw', 'formula' : '[[d20 + %constitution_save_bonus% * {{1%npc_con_save%0, 0}=10} + 0%npc_con_save% + %globalsavemod% ]]' },
			'Intelligence Save': { 'name' : 'Intelligence Saving Throw', 'formula' : '[[d20 + %intelligence_save_bonus% * {{1%npc_int_save%0, 0}=10} + 0%npc_int_save% + %globalsavemod% ]]' },
			'Wisdom Save': { 'name' : 'Wisdom Saving Throw', 'formula' : '[[d20 + %wisdom_save_bonus% * {{1%npc_wis_save%0, 0}=10} + 0%npc_wis_save% + %globalsavemod% ]]' },
			'Charisma Save': { 'name' : 'Charisma Saving Throw', 'formula' : '[[d20 + %charisma_save_bonus% * {{1%npc_cha_save%0, 0}=10} + 0%npc_cha_save% + %globalsavemod% ]]' },
			'Strength Check': { 'name' : 'Strength Check', 'formula' : '[[d20 + %strength_mod%]]' },
			'Dexterity Check': { 'name' : 'Dexterity Check', 'formula' : '[[d20 + %dexterity_mod%]]' },
			'Constitution Check': { 'name' : 'Constitution Check', 'formula' : '[[d20 + %constitution_mod%]]' },
			'Intelligence Check': { 'name' : 'Intelligence Check', 'formula' : '[[d20 + %intelligence_mod%]]' },
			'Wisdom Check': { 'name' : 'Wisdom Check', 'formula' : '[[d20 + %wisdom_mod%]]' },
			'Charisma Check': { 'name' : 'Charisma Check', 'formula' : '[[d20 + %charisma_mod%]]' },
			'Acrobatics': { 'name' : 'Dexterity (Acrobatics) Check', 'formula' : '[[d20 + %acrobatics_bonus% * {{1%npc_acrobatics%0, 0}=10} + 0%npc_acrobatics%]]' },
			'Animal Handling': { 'name' : 'Wisdom (Animal Handling) Check', 'formula' : '[[d20 + %animal_handling_bonus% * {{1%npc_animal_handling%0, 0}=10} + 0%npc_animal_handling%]]' },
			'Arcana': { 'name' : 'Intelligence (Arcana) Check', 'formula' : '[[d20 + %arcana_bonus% * {{1%npc_arcana%0, 0}=10} + 0%npc_arcana%]]' },
			'Athletics': { 'name' : 'Strength (Athletics) Check', 'formula' : '[[d20 + %athletics_bonus% * {{1%npc_athletics%0, 0}=10} + 0%npc_athletics%]]' },
			'Deception': { 'name' : 'Charisma (Deception) Check', 'formula' : '[[d20 + %deception_bonus% * {{1%npc_deception%0, 0}=10} + 0%npc_deception%]]' },
			'History': { 'name' : 'Intelligence (History) Check', 'formula' : '[[d20 + %history_bonus% * {{1%npc_history%0, 0}=10} + 0%npc_history%]]' },
			'Insight': { 'name' : 'Wisdom (Insight) Check', 'formula' : '[[d20 + %insight_bonus% * {{1%npc_insight%0, 0}=10} + 0%npc_insight%]]' },
			'Intimidation': { 'name' : 'Charisma (Intimidation) Check', 'formula' : '[[d20 + %intimidation_bonus% * {{1%npc_intimidation%0, 0}=10} + 0%npc_intimidation%]]' },
			'Investigation': { 'name' : 'Intelligence (Investigation) Check', 'formula' : '[[d20 + %investigation_bonus% * {{1%npc_investigation%0, 0}=10} + 0%npc_investigation%]]' },
			'Medicine': { 'name' : 'Wisdom (Medicine) Check', 'formula' : '[[d20 + %medicine_bonus% * {{1%npc_medicine%0, 0}=10} + 0%npc_medicine%]]' },
			'Nature': { 'name' : 'Intelligence (Nature) Check', 'formula' : '[[d20 + %nature_bonus% * {{1%npc_nature%0, 0}=10} + 0%npc_nature%]]' },
			'Perception': { 'name' : 'Wisdom (Perception) Check', 'formula' : '[[d20 + %perception_bonus% * {{1%npc_perception%0, 0}=10} + 0%npc_perception%]]' },
			'Performance': { 'name' : 'Charisma (Performance) Check', 'formula' : '[[d20 + %performance_bonus% * {{1%npc_performance%0, 0}=10} + 0%npc_performance%]]' },
			'Persuasion': { 'name' : 'Charisma (Persuasion) Check', 'formula' : '[[d20 + %persuasion_bonus% * {{1%npc_persuasion%0, 0}=10} + 0%npc_persuasion%]]' },
			'Religion': { 'name' : 'Intelligence (Religion) Check', 'formula' : '[[d20 + %religion_bonus% * {{1%npc_religion%0, 0}=10} + 0%npc_religion%]]' },
			'Sleight of Hand': { 'name' : 'Dexterity (Sleight of Hand) Check', 'formula' : '[[d20 + %sleight_of_hand_bonus% * {{1%npc_sleight_of_hand%0, 0}=10} + 0%npc_sleight_of_hand%]]' },
			'Stealth': { 'name' : 'Dexterity (Stealth) Check', 'formula' : '[[d20 + %stealth_bonus% * {{1%npc_stealth%0, 0}=10} + 0%npc_stealth%]]' },
			'Survival': { 'name' : 'Wisdom (Survival) Check', 'formula' : '[[d20 + %survival_bonus% * {{1%npc_survival%0, 0}=10} + 0%npc_survival%]]' },
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
			button : {type: 'string', local: true},
			multi : {type: 'string', local: true},
			input : {type: 'string', local: true},
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
		if (state.groupCheck.dataVersion < dataVersion) {
			updateCheckList();
		}
		// Build metadata for available options
		optsData.meta = {
			allopts : _.keys(optsData.list),
			str : _.chain(optsData.list)
				.pick(v => v.type === 'string')
				.keys()
				.value(),
			glob :	_.chain(optsData.list)
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
		log('-=> GroupCheck v'+version+' <=-');
	},
	initializeState = function() {
		state.groupCheck = {
			'checkList' : {},
			'options' : _.chain(optsData.list)
				.pick(v => _.has(v,'def'))
				.mapObject(v => v.def)
				.value(),
			'version' : stateVersion,
			'importInfo' : '',
			'dataVersion' : 1
		};
		log('-=> GroupCheck initialized with default settings!<=-');
	},
	updateState = function() {
		switch (state.groupCheck.version) {
			case 1:
				_.each(state.groupCheck.checkList, function(check) {
					let die = check.die || state.groupCheck.options.die;
					check.formula = _.union([die], _.map(check.mod, str => '%'+str+'%'))
						.join(' + ');
					delete check.mod;
				});
				delete state.groupCheck.options.die;
				state.groupCheck.options.hideformula = state.groupCheck.options.hidebonus;
				delete state.groupCheck.options.hidebonus;
				log('-=> GroupCheck has updated to a new data format (1=>2). Please ' +
					'make sure your list of checks has converted correctly.<=-');
			case 2:
				_.each(state.groupCheck.checkList, function(check) {
					check.formula = '[[' + check.formula+ ']]';
				});
				log('-=> GroupCheck has updated to a new data format (2=>3). Please ' +
					'make sure your list of checks has converted correctly.<=-');
			case 3:
				state.groupCheck.options.showpicture = true;
			case 4:
				state.groupCheck.options.process = false;
			case 5:
				state.groupCheck.dataVersion = 0;
				state.groupCheck.importInfo = '';
				state.groupCheck.version = 6;
		}
	},
	updateCheckList = function() {
		let changedData = false;
		switch (state.groupCheck.dataVersion) {
			case 0:
				// Detect 5E-Shaped
				if (_.has(state.groupCheck.checkList, 'Strength Save') &&
					state.groupCheck.checkList['Strength Save'].formula ===
					'[[d20 + %strength_saving_throw_mod%]]') {
					state.groupCheck.importInfo = '5E-Shaped';
				}
				// Detect 5E-OGL
				if (_.has(state.groupCheck.checkList, 'Strength Save') &&
					state.groupCheck.checkList['Strength Save'].formula ===
					'[[d20 + %strength_save_bonus% * {1%npc_str_save%0, 0}=10 +' +
					' 0%npc_str_save% + %globalsavemod% ]]') {
					state.groupCheck.importInfo = '5E-OGL';
				}
				// Detect Pathfinder
				if (_.has(state.groupCheck.checkList, 'Fortitude Save') &&
					state.groupCheck.checkList['Fortitude Save'].formula ===
					'[[d20 + %Fort%]]') {
					state.groupCheck.importInfo = 'Pathfinder';
				}
				// Detect 3.5
				if (_.has(state.groupCheck.checkList, 'Move Silently') &&
					state.groupCheck.checkList['Move Silently'].formula ===
					'[[d20 + %movesilent%]]') {
					state.groupCheck.importInfo = '3.5';
				}
				if (state.groupCheck.importInfo === '5E-OGL' ||
					state.groupCheck.importInfo === '5E-Shaped') {
					changedData = true;
				}
		}
		if (state.groupCheck.importInfo && changedData) {
			_.extend(state.groupCheck.checkList, importData[state.groupCheck.importInfo]);
			log('-=> GroupCheck has detected that you are using the ' +
				state.groupCheck.importInfo + ' data set and has updated your checks ' +
				'database automatically. Sorry for any inconvenience caused. <=-');
		}
		state.groupCheck.dataVersion = dataVersion;
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
		sendChat(who, string, null, {noarchive: true});
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
			'"' : 'quot',
			']' : '#93',
			'*' : '#42'
		};
		return _.map(str.split(''), c => (_.has(entities,c)) ? ('&'+entities[c]+';') : c)
			.join('');
	},
	getWhisperPrefix = function(playerid) {
		let player = getObj('player', playerid);
		if (player && player.get('_displayname')) {
			return '/w "' + player.get('_displayname') + '" ';
		} else {
			return '/w GM ';
		}
	},
	handleError = function(whisper, errorMsg) {
		let output = whisper + '<div style="border:1px solid black;background-color:' +
			'#FFBABA;padding:3px 3px;"><h4>Error</h4><p>' + errorMsg + '</p></div>';
		sendChatNoarchive('GroupCheck', output);
	},
	printHelp = function(whisper) {
		let helpString = whisper + '<div style="border:1px solid black;' +
			'background-color:#FFFFFF;padding:3px 3px;">Please refer to the ' +
			'<a style="text-decoration:underline" href="https://github.com/joesinghaus/' +
			'roll20-api-scripts/tree/master/GroupCheck/1.2.2/README.md">documentation' +
			'</a> for help with using GroupCheck, or ask in the API forum thread.</div>';
		sendChatNoarchive('GroupCheck', helpString);
	},
	printCommandMenu = function(whisper, opts) {
		let optsCommand = _.map(opts, function (value, key) {
			return (typeof value === 'boolean') ? `--${key}` : `--${key} ${value}`;
		}).join(' ');
		let commandOutput = whisper + '<div style="border:1px solid black;' +
			'background-color:#FFFFFF;padding:3px 3px;">' +
			'<h3 style="text-align:center">Available commands:</h3><p>' +
			_.map(_.keys(state.groupCheck.checkList), function (s) {
				return `[${s}](!group-check ${optsCommand} --${s})`;
			}).join('') +
			'</p></div>';
		sendChatNoarchive('GroupCheck', commandOutput);
	},
	getConfigTable = function() {
		return '<div style="border:1px solid black;background-color:#FFFFFF;padding:' +
			'3px 3px;display:inline-block;"><h4>Current Options</h4><br><table ' +
			'style="margin:3px;"><tr><td><b>Name</b></td><td><b>Value</td></b></tr>' +
			_.map(state.groupCheck.options, function(value, key) {
				return `<tr><td>${key}</td><td>${value}</td></tr>`;
			}).join('') +
			'</table></div><br><div style="border:1px solid black;background-color:' +
			'#FFFFFF;padding:3px 3px;display:inline-block;"><h4>Checks</h4><br>' +
			'<table style="margin:3px;"><tr><td><b>Command</b></td><td><b>Name</b>' +
			'</td><td><b>Formula</b></td></tr>' +
			_.map(state.groupCheck.checkList, function(value, key) {
				return `<tr><td>${key}</td><td>${value.name}</td><td>` +
					`${htmlReplace(value.formula)}</td></tr>`;
			}).join('') +
			'</table></div>';
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
	replaceInput = function (formula, input) {
		if (!_.isUndefined(input)) {
			_.each(input.split(','), function (v,i) {
				formula = formula.replace(new RegExp('INPUT_' + i, 'g'), v);
			});
		}
		formula = formula.replace(/INPUT_\d+/g, '');
		return formula;
	},
	//Main functions
	processTokenRollData = function(token, checkFormula, opts) {
		let displayName, computedFormula, charName, tokenPic;
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
		tokenPic = (opts.showpicture || !displayName) ?
			token.get('imgsrc').replace('max', 'thumb') : false;
		switch (ro) {
			case 'adv' :
				computedFormula += ' (Advantage)';
				computedFormula = computedFormula.replace(/1?d20/, opts.die_adv);
				break;
			case 'dis' :
				computedFormula += ' (Disadvantage)';
				computedFormula = computedFormula.replace(/1?d20/, opts.die_dis);
				break;
		}
		return {
			'pic' : tokenPic,
			'name' : displayName,
			'roll2' : (ro === 'roll2'),
			'formula' : computedFormula,
			'id' : token.id
		}
	},
	sendFinalMessage = function (opts, checkName, rollData, msg) {
		let freetext = '', match, inlinerollData = {};
		// Format inline rolls
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
		// Format rows of output
		let rolls = _.map(rollData, function (o) {
			return outputStyle.makeRow(o.pic, o.name, o.roll2, o['styled_0'],
				o['styled_1']);
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
		if (_.has(opts, 'button')) {
			let commandData = opts.button.split(/\s(.+)/),
				commandName = commandData.shift().replace('_',' '),
				commandText = (commandData[0] || '').replace(/~/g, '--')
					.replace(/RESULTS\((.+?)\)/,
						_.map(rollData, o => o['result_0'][0]).join('$1'))
					.replace(/IDS\((.+?)\)/, _.map(rollData, o => o.id).join('$1'));
			freetext += outputStyle.makeCommandButton(commandName, commandText);
		}
		// Combine output
		let output = (opts.whisper ? '/w GM ' : '') +
			outputStyle.makeBox(checkName, opts.subheader, freetext, rolls.join(''));
		sendChat(opts.speaking, output);
	},
	handleConfig = function (msg) {
		const hasValueConfig = ['import','add','delete','set'];
		let opts = parseOpts(recoverInlinerollFormulae(msg), hasValueConfig),
			whisper = getWhisperPrefix(msg.playerid),
			output;
		if (!playerIsGM(msg.playerid)) {
			sendChatNoarchive('GroupCheck', whisper + 'Permission denied.');
			return;
		}
		if (opts.import) {
			if (_.has(importData,opts.import)) {
				_.extend(state.groupCheck.checkList, importData[opts.import]);
				state.groupCheck.importInfo = opts.import;
				output = `Data set ${opts.import} imported.`;
			} else {
				handleError(whisper, `Data set ${opts.import} not found.`);
			}
		} else if (opts.add) {
			let data = safeReadJSON(opts.add.replace(/\\(\[|\])/g,'$1$1'));
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
				handleError(whisper, 'Error reading input.');
			}
		} else if (opts.delete) {
			if (_.has(state.groupCheck.checkList, opts.delete)) {
				delete state.groupCheck.checkList[opts.delete];
				output = `Check ${opts.delete} deleted.`;
			} else {
				handleError(whisper, `Check called ${opts.delete} not found.`);
			}
		} else if (opts.set) {
			let kv = opts.set.split(/\s(.+)/);
			if (_.indexOf(optsData.meta.str, kv[0]) !== -1 && _.indexOf(optsData.meta.glob, kv[0]) !== -1 ) {
				state.groupCheck.options[kv[0]] = kv[1];
			} else if (kv[0] === 'ro') {
				if (_.indexOf(optsData.list.ro.admissible, kv[1]) !== -1) {
					state.groupCheck.options.ro = kv[1];
				} else {
					handleError(whisper, `Roll option ${kv[1]} is invalid, sorry.`);
					return;
				}
			} else if (_.indexOf(optsData.meta.bool, kv[0]) !== -1) {
				state.groupCheck.options[kv[0]] = true;
			} else if (_.indexOf(optsData.meta.boolNeg, kv[0]) !== -1) {
				kv[0] = optsData.meta.bool[_.indexOf(optsData.meta.boolNeg, kv[0])];
				state.groupCheck.options[kv[0]] = false;
			} else {
				handleError(whisper, 'Command not understood.');
				return;
			}
			output = `Option ${kv[0]} set to ${state.groupCheck.options[kv[0]]}.`;
		} else if (opts.clear) {
			state.groupCheck.checkList = {};
			state.groupCheck.importInfo = '';
			output = 'All checks cleared.';
		} else if (opts.defaults) {
			state.groupCheck.options = _.chain(optsData.list)
				.pick(v => _.has(v,'def'))
				.mapObject(v => v.def)
				.value();
			output = 'All options reset to defaults.';
		} else if (opts.reset) {
			initializeState();
			output = 'Everything is reset to factory settings.';
		} else if (opts.show) {
			output = getConfigTable();
		} else {
			printHelp(whisper);
		}
		if (output) {
			sendChatNoarchive('GroupCheck', whisper + output);
		}
		return;
	},
	handleRolls = function (msg) {
		// Options processing
		let checkName, checkFormula,
			whisper = getWhisperPrefix(msg.playerid),
			opts = parseOpts(recoverInlinerollFormulae(msg), optsData.meta.str),
			checkCmd = _.intersection(_.keys(state.groupCheck.checkList), _.keys(opts))[0];
		// Print menu if we don't know what to roll
		if (opts.help) {
			printHelp(whisper);
			return;
		}
		if (!checkCmd && !opts.custom) {
			printCommandMenu(whisper, opts);
			return;
		}
		// Continue with options processing
		if (checkCmd) {
			checkFormula = state.groupCheck.checkList[checkCmd].formula;
			checkName = state.groupCheck.checkList[checkCmd].name;
		}
		_.each(optsData.meta.boolNeg, function (name,index) {
			_.has(opts, name) ? opts[optsData.meta.bool[index]] = false : null;
		});
		// Handle --custom
		if (opts.custom) {
			let kv = opts.custom.replace(/\\(\[|\])/g,'$1$1').split(/,\s?/);
			if (kv.length < 2) {
				handleError(whisper, "Custom roll format invalid");
				return;
			}
			checkName = kv.shift();
			checkFormula = kv.join();
		}
		// Remove invalid options and check commands from opts
		// Plug in defaults for unspecified options
		opts = _.chain(opts)
			.pick(optsData.meta.allopts)
			.defaults(state.groupCheck.options)
			.value();
		// Apply global modifier
		if (opts.globalmod) {
			if (checkFormula.search(/\]\](?=$)/) !== -1) {
				checkFormula = checkFormula.replace(/\]\](?=$)/,
					' + ' + opts.globalmod + '[global modifier]]]');
			} else {
				checkFormula += ' + ' + opts.globalmod;
			}
		}
		// Prepare formula for insertion and replace placeholders
		checkFormula = replaceInput(checkFormula, opts.input)
			.replace(/\%(\S.*?)\%/g, '@{INSERT_NAME|$1}')
			.split('INSERT_NAME');
		// Eliminate invalid roll option.
		if (!_.contains(optsData.list.ro.admissible, opts.ro)) {
			handleError(whisper, 'Roll option ' + opts.ro + ' is invalid, sorry.');
			return;
		}
		// Get options into desired format
		opts.rollOption = (opts.ro === 'rollsetting') ?
			getRollOption : ((charid) => opts.ro);
		opts.multi = (opts.multi > 1) ? parseInt(opts.multi) : 1;
		opts.speaking = (msg.playerid === 'API') ? 'API' : 'player|' + msg.playerid;
		// Transform tokens into nice data packages
		let rollData = _.chain(msg.selected)
			.map(obj => getObj('graphic', obj._id))
			.compact()
			.map(token => processTokenRollData(token, checkFormula, opts))
			.compact()
			.map(function(o) {
				if (opts.multi === 1) return o;
				let a = [];
				for (let i=0; i < opts.multi; i++) a.push(_.clone(o));
				return a;
			})
			.flatten()
			.value();
		try {
			if (!opts.process) {
				let rolls = _.map(rollData, function(o) {
					let f = opts.hideformula ? `[[${o.formula}]]` : o.formula;
					return outputStyle.makeRow(o.pic, o.name, o.roll2, f, f);
				}).join('');
				let output = (opts.whisper ? '/w GM ' : '') +
					outputStyle.makeBox(checkName, opts.subheader, '', rolls);
				sendChat(opts.speaking, output);
			} else {
				let sentFormula = _.map(rollData, function(o) {
						return (o.formula + '####' + (o.roll2 ? (o.formula) : ''));
					}).join('<br>'),
					callback = _.partial(sendFinalMessage, opts, checkName, rollData);
				sendChat('', sentFormula, callback);
			}
		} catch(err) {
			let errorMessage = 'Something went wrong with the roll. The command you ' +
				'tried was:<br>' + msg.content + '<br> The error message generated ' +
				'by Roll20 is:<br>' + err;
			handleError(whisper, errorMessage);
		}
	},
	handleInput = function(msg) {
		if (msg.type === 'api') {
			if (msg.content.search(/^!group-check($|\s)/) != -1) {
				handleRolls(msg);
			} else if (msg.content.search(/^!group-check-config\b/) != -1) {
				handleConfig(msg);
			}
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
