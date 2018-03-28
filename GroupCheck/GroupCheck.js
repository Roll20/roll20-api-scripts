// GroupCheck version 1.7
// Last Updated: 2018-03-23
// A script to roll checks for many tokens at once with one command.
const groupCheck = (() => {
	'use strict';
	const version = '1.7',
		stateVersion = 7,
		dataVersion = 5,
		// Roll appearance
		outputStyle = (() => {
			const makeBox = (header, subheader, freetext, content) => {
					return '<div style="border:1px solid #888;background-color:#fff;border-radius:15px;padding:3px 3px 1px;margin-left:-42px;">' +
						`<div>${makeHeader(header)}${makeSubheader(subheader)}</div>` +
						makeContent(content) + makeFreetext(freetext) +
						'</div>';
				},
				makeContent = (text) => (`<table style="width:100%">${text}</table>`),
				makeHeader = (text) => (`<h4 style="text-align:center">${text}</h4>`),
				makeSubheader = (text) => (text ? `<h4 style="text-align:center">${text}</h4>` : ''),
				makeFreetext = (text) => (text ? `<p style="text-align:center">${text}</p>` : ''),
				makeRow = (pic, name, roll2, formula0, formula1, isLast) => {
					return `<tr${isLast ? '' :' style="border-bottom: 1px solid #ddd"'}>` +
						makeName(pic, name) +	(roll2 ? makeRoll2(formula0, formula1) : makeRoll(formula0)) +
						'</tr>';
				},
				makeName = (pic, name) => {
					const imgStyle = 'display:inline-block;height:30px;width:30px;vertical-align:middle;margin-right:4px;';
					return '<td style="padding:3px;height:30px;width:85%">' +
						(pic ? `<div style="${imgStyle}background:url('${pic}') 0/contain no-repeat;"></div>` : '') +
						`<span style="vertical-align:middle;font-weight:bolder">${name}</span>` +
						'</td>';
				},
				makeRoll = (formula) => (`<td style="text-align:center">${formula}</td>`),
				makeRoll2 = (formula0, formula1) => (makeRoll(formula0) + makeRoll(formula1)),
				makeCommandButton = (name, command) => (`<a href="${htmlReplace(command)}"style="font-weight:bold;border:none;color:#000;background:#fff">${name}</a>`),
				makeInlineroll = (roll, hideformula) =>  {
					const boundary = results => {
						switch (detectCritical(results)) {
						case 'crit':
							return ';border:2px solid #3FB315';
						case 'mixed':
							return ';border:2px solid #4A57ED';
						case 'fumble':
							return ';border:2px solid #B31515';
						default:
							return '';
						}
					};
					return '<div ' +
						(hideformula ? '' : `class="showtip tipsy" title="Rolling ${htmlReplace(roll.expression)} = ${rollToText(roll.results)}" `) +
						'style="display:inline-block;min-width:1em;font-size:1.2em;font-weight:bold;padding:0 3px;vertical-align:middle;' +
						`cursor:${hideformula ? 'default' : 'help'}${boundary(roll.results)}">${roll.results.total || 0}</div>`;
				},
				rollToText = (roll) => {
					switch (roll.type) {
					case 'R':
						const c = (roll.mods && roll.mods.customCrit) || [{
								comp: '==',
								point: roll.sides
							}],
							f = (roll.mods && roll.mods.customFumble) || [{
								comp: '==',
								point: 1
							}],
							styledRolls = roll.results.map(r => {
								const style = rollIsCrit(r.v, c[0].comp, c[0].point) ?
									' critsuccess' :
									(rollIsCrit(r.v, f[0].comp, f[0].point) ?
										' critfail' : '');
								return `<span class='basicdiceroll${style}'>${r.v}</span>`;
							});
						return `(${styledRolls.join('+')})`;
					case 'M':
						return roll.expr.toString().replace(/(\+|-)/g, '$1 ').replace(/\*/g, '&' + 'ast' + ';');
					case 'V':
						return roll.rolls.map(rollToText).join(' ');
					case 'G':
						return `'(${roll.rolls.map(a => a.map(rollToText).join(' ')).join(' ')})`;
					default:
						return '';
					}
				},
				detectCritical = (roll) => {
					let s = [];
					if (roll.type === 'V' && 'rolls' in roll) {
						s = roll.rolls.map(detectCritical);
					}
					else if (roll.type === 'G' && 'rolls' in roll) {
						s = roll.rolls.reduce((m, v) => m.concat(v), []).map(detectCritical);
					}
					else if (roll.type === 'R' &&  'sides' in roll) {
						const crit = (roll.mods && roll.mods.customCrit) || [{
							comp: '==',
							point: roll.sides
						}];
						const fumble = (roll.mods && roll.mods.customFumble) || [{
							comp: '==',
							point: 1
						}];
						if (roll.results.some(r => rollIsCrit(r.v, crit[0].comp, crit[0].point))) {
							s.push('crit');
						}
						if (roll.results.some(r => rollIsCrit(r.v, fumble[0].comp, fumble[0].point))) {
							s.push('fumble');
						}
					}
					const c = s.includes('crit'),
						f = s.includes('fumble'),
						m = s.includes('mixed') || (c && f);
					return (m ? 'mixed' : (c ? 'crit' : (f ? 'fumble' : (false))));
				},
				rollIsCrit = (value, comp, point) => {
					switch (comp) {
					case '==':
						return value == point;
					case '<=':
						return value <= point;
					case '>=':
						return value >= point;
					}
				};
			return {
				makeBox, makeCommandButton, makeInlineroll, makeRow
			};
		})(),
		// Data variables
		importData = {
			"5E-Shaped": {
				"Strength Save": {
					"name": "Strength Saving Throw",
					"formula": "[[d20  + %strength_saving_throw_formula%]]",
					"special": "shaped"
				},
				"Dexterity Save": {
					"name": "Dexterity Saving Throw",
					"formula": "[[d20  + %dexterity_saving_throw_formula%]]",
					"special": "shaped"
				},
				"Constitution Save": {
					"name": "Constitution Saving Throw",
					"formula": "[[d20  + %constitution_saving_throw_formula%]]",
					"special": "shaped"
				},
				"Intelligence Save": {
					"name": "Intelligence Saving Throw",
					"formula": "[[d20  + %intelligence_saving_throw_formula%]]",
					"special": "shaped"
				},
				"Wisdom Save": {
					"name": "Wisdom Saving Throw",
					"formula": "[[d20  + %wisdom_saving_throw_formula%]]",
					"special": "shaped"
				},
				"Charisma Save": {
					"name": "Charisma Saving Throw",
					"formula": "[[d20  + %charisma_saving_throw_formula%]]",
					"special": "shaped"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + %strength_check_formula%]]",
					"special": "shaped"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + %dexterity_check_formula%]]",
					"special": "shaped"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + %constitution_check_formula%]]",
					"special": "shaped"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + %intelligence_check_formula%]]",
					"special": "shaped"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + %wisdom_check_formula%]]",
					"special": "shaped"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + %charisma_check_formula%]]",
					"special": "shaped"
				},
				"Acrobatics": {
					"name": "Dexterity (Acrobatics) Check",
					"formula": "[[d20 + %repeating_skill_$0_formula%]]",
					"special": "shaped"
				},
				"Animal Handling": {
					"name": "Wisdom (Animal Handling) Check",
					"formula": "[[d20 + %repeating_skill_$1_formula%]]",
					"special": "shaped"
				},
				"Arcana": {
					"name": "Intelligence (Arcana) Check",
					"formula": "[[d20 + %repeating_skill_$2_formula%]]",
					"special": "shaped"
				},
				"Athletics": {
					"name": "Strength (Athletics) Check",
					"formula": "[[d20 + %repeating_skill_$3_formula%]]",
					"special": "shaped"
				},
				"Deception": {
					"name": "Charisma (Deception) Check",
					"formula": "[[d20 + %repeating_skill_$4_formula%]]",
					"special": "shaped"
				},
				"History": {
					"name": "Intelligence (History) Check",
					"formula": "[[d20 + %repeating_skill_$5_formula%]]",
					"special": "shaped"
				},
				"Insight": {
					"name": "Wisdom (Insight) Check",
					"formula": "[[d20 + %repeating_skill_$6_formula%]]",
					"special": "shaped"
				},
				"Intimidation": {
					"name": "Charisma (Intimidation) Check",
					"formula": "[[d20 + %repeating_skill_$7_formula%]]",
					"special": "shaped"
				},
				"Investigation": {
					"name": "Intelligence (Investigation) Check",
					"formula": "[[d20 + %repeating_skill_$8_formula%]]",
					"special": "shaped"
				},
				"Medicine": {
					"name": "Wisdom (Medicine) Check",
					"formula": "[[d20 + %repeating_skill_$9_formula%]]",
					"special": "shaped"
				},
				"Nature": {
					"name": "Intelligence (Nature) Check",
					"formula": "[[d20 + %repeating_skill_$10_formula%]]",
					"special": "shaped"
				},
				"Perception": {
					"name": "Wisdom (Perception) Check",
					"formula": "[[d20 + %repeating_skill_$11_formula%]]",
					"special": "shaped"
				},
				"Performance": {
					"name": "Charisma (Performance) Check",
					"formula": "[[d20 + %repeating_skill_$12_formula%]]",
					"special": "shaped"
				},
				"Persuasion": {
					"name": "Charisma (Persuasion) Check",
					"formula": "[[d20 + %repeating_skill_$13_formula%]]",
					"special": "shaped"
				},
				"Religion": {
					"name": "Intelligence (Religion) Check",
					"formula": "[[d20 + %repeating_skill_$14_formula%]]",
					"special": "shaped"
				},
				"Sleight of Hand": {
					"name": "Dexterity (Sleight of Hand) Check",
					"formula": "[[d20 + %repeating_skill_$15_formula%]]",
					"special": "shaped"
				},
				"Stealth": {
					"name": "Dexterity (Stealth) Check",
					"formula": "[[d20 + %repeating_skill_$16_formula%]]",
					"special": "shaped"
				},
				"Survival": {
					"name": "Wisdom (Survival) Check",
					"formula": "[[d20 + %repeating_skill_$17_formula%]]",
					"special": "shaped"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[%AC%]]"
				}
			},
			"Pathfinder": {
				"Fortitude Save": {
					"name": "Fortitude Saving Throw",
					"formula": "[[d20 + %Fort%]]"
				},
				"Reflex Save": {
					"name": "Reflex Saving Throw",
					"formula": "[[d20 + %Ref%]]"
				},
				"Will Save": {
					"name": "Will Saving Throw",
					"formula": "[[d20 + %Will%]]"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + %STR-mod% + %checks-cond%]]"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + %DEX-mod% + %checks-cond%]]"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + %CON-mod% + %checks-cond%]]"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + %INT-mod% + %checks-cond%]]"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + %WIS-mod% + %checks-cond%]]"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + %CHA-mod% + %checks-cond%]]"
				},
				"Perception": {
					"name": "Perception Check",
					"formula": "[[d20 + %Perception%]]"
				},
				"Stealth": {
					"name": "Stealth Check",
					"formula": "[[d20 + %Stealth%]]"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[%AC%]]"
				}
			},
			"5E-OGL": {
				"Strength Save": {
					"name": "Strength Saving Throw",
					"formula": "[[d20 + (%strength_save_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_str_save%*%npc%) [NPC]]]"
				},
				"Dexterity Save": {
					"name": "Dexterity Saving Throw",
					"formula": "[[d20 + (%dexterity_save_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_dex_save%*%npc%) [NPC]]]"
				},
				"Constitution Save": {
					"name": "Constitution Saving Throw",
					"formula": "[[d20 + (%constitution_save_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_con_save%*%npc%) [NPC]]]"
				},
				"Intelligence Save": {
					"name": "Intelligence Saving Throw",
					"formula": "[[d20 + (%intelligence_save_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_int_save%*%npc%) [NPC]]]"
				},
				"Wisdom Save": {
					"name": "Wisdom Saving Throw",
					"formula": "[[d20 + (%wisdom_save_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_wis_save%*%npc%) [NPC]]]"
				},
				"Charisma Save": {
					"name": "Charisma Saving Throw",
					"formula": "[[d20 + (%charisma_save_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_cha_save%*%npc%) [NPC]]]"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + %strength_mod%]]"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + %dexterity_mod%]]"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + %constitution_mod%]]"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + %intelligence_mod%]]"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + %wisdom_mod%]]"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + %charisma_mod%]]"
				},
				"Acrobatics": {
					"name": "Dexterity (Acrobatics) Check",
					"formula": "[[d20 + (%acrobatics_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_acrobatics%*%npc%) [NPC]]]"
				},
				"Animal Handling": {
					"name": "Wisdom (Animal Handling) Check",
					"formula": "[[d20 + (%animal_handling_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_animal_handling%*%npc%) [NPC]]]"
				},
				"Arcana": {
					"name": "Intelligence (Arcana) Check",
					"formula": "[[d20 + (%arcana_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_arcana%*%npc%) [NPC]]]"
				},
				"Athletics": {
					"name": "Strength (Athletics) Check",
					"formula": "[[d20 + (%athletics_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_athletics%*%npc%) [NPC]]]"
				},
				"Deception": {
					"name": "Charisma (Deception) Check",
					"formula": "[[d20 + (%deception_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_deception%*%npc%) [NPC]]]"
				},
				"History": {
					"name": "Intelligence (History) Check",
					"formula": "[[d20 + (%history_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_history%*%npc%) [NPC]]]"
				},
				"Insight": {
					"name": "Wisdom (Insight) Check",
					"formula": "[[d20 + (%insight_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_insight%*%npc%) [NPC]]]"
				},
				"Intimidation": {
					"name": "Charisma (Intimidation) Check",
					"formula": "[[d20 + (%intimidation_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_intimidation%*%npc%) [NPC]]]"
				},
				"Investigation": {
					"name": "Intelligence (Investigation) Check",
					"formula": "[[d20 + (%investigation_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_investigation%*%npc%) [NPC]]]"
				},
				"Medicine": {
					"name": "Wisdom (Medicine) Check",
					"formula": "[[d20 + (%medicine_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_medicine%*%npc%) [NPC]]]"
				},
				"Nature": {
					"name": "Intelligence (Nature) Check",
					"formula": "[[d20 + (%nature_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_nature%*%npc%) [NPC]]]"
				},
				"Perception": {
					"name": "Wisdom (Perception) Check",
					"formula": "[[d20 + (%perception_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_perception%*%npc%) [NPC]]]"
				},
				"Performance": {
					"name": "Charisma (Performance) Check",
					"formula": "[[d20 + (%performance_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_performance%*%npc%) [NPC]]]"
				},
				"Persuasion": {
					"name": "Charisma (Persuasion) Check",
					"formula": "[[d20 + (%persuasion_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_persuasion%*%npc%) [NPC]]]"
				},
				"Religion": {
					"name": "Intelligence (Religion) Check",
					"formula": "[[d20 + (%religion_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_religion%*%npc%) [NPC]]]"
				},
				"Sleight of Hand": {
					"name": "Dexterity (Sleight of Hand) Check",
					"formula": "[[d20 + (%sleight_of_hand_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_sleight_of_hand%*%npc%) [NPC]]]"
				},
				"Stealth": {
					"name": "Dexterity (Stealth) Check",
					"formula": "[[d20 + (%stealth_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_stealth%*%npc%) [NPC]]]"
				},
				"Survival": {
					"name": "Wisdom (Survival) Check",
					"formula": "[[d20 + (%survival_bonus%%pbd_safe%*(1-%npc%)) [PC] + (%npc_survival%*%npc%) [NPC]]]"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[%AC%]]"
				}
			},
			"3.5": {
				"Fortitude Save": {
					"name": "Fortitude Saving Throw",
					"formula": "[[d20 + %fortitude%]]"
				},
				"Reflex Save": {
					"name": "Reflex Saving Throw",
					"formula": "[[d20 + %reflex%]]"
				},
				"Will Save": {
					"name": "Will Saving Throw",
					"formula": "[[d20 + %wisdom%]]"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + %str-mod%]]"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + %dex-mod%]]"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + %con-mod%]]"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + %int-mod%]]"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + %wis-mod%]]"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + %cha-mod%]]"
				},
				"Hide": {
					"name": "Hide Check",
					"formula": "[[d20 + %hide%]]"
				},
				"Listen": {
					"name": "Listen Check",
					"formula": "[[d20 + %listen%]]"
				},
				"Move Silently": {
					"name": "Move Silently Check",
					"formula": "[[d20 + %movesilent%]]"
				},
				"Spot": {
					"name": "Spot Check",
					"formula": "[[d20 + %spot%]]"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[%armorclass%]]"
				}
			}
		},
		optsData = {
			list: {
				ro: {
					type: 'string',
					def: 'roll1',
					admissible: ['roll1', 'roll2', 'adv', 'dis', 'rollsetting']
				},
				die_adv: {
					type: 'string',
					def: '2d20kh1'
				},
				die_dis: {
					type: 'string',
					def: '2d20kl1'
				},
				fallback: {
					type: 'string'
				},
				globalmod: {
					type: 'string'
				},
				subheader: {
					type: 'string',
					local: true
				},
				custom: {
					type: 'string',
					local: true
				},
				button: {
					type: 'string',
					local: true
				},
				send: {
					type: 'string',
					local: true
				},
				multi: {
					type: 'string',
					local: true
				},
				input: {
					type: 'string',
					local: true
				},
				whisper: {
					type: 'bool',
					def: false,
					negate: 'public'
				},
				hideformula: {
					type: 'bool',
					def: false,
					negate: 'showformula'
				},
				usetokenname: {
					type: 'bool',
					def: true,
					negate: 'usecharname'
				},
				showname: {
					type: 'bool',
					def: true,
					negate: 'hidename'
				},
				showpicture: {
					type: 'bool',
					def: true,
					negate: 'hidepicture'
				},
				process: {
					type: 'bool',
					def: false,
					negate: 'direct'
				},
				showaverage: {
					type: 'bool',
					local: true
				}
			},
			meta: {}
		},
		// Setup
		checkInstall =  () => {
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
				allopts: Object.keys(optsData.list),
				str: Object.keys(optsData.list).filter(k => optsData.list[k].type === 'string'),
				glob: Object.keys(optsData.list).filter(k => !optsData.list[k].local),
				bool: Object.keys(optsData.list).filter(k => optsData.list[k].type === 'bool'),
				boolNeg: Object.values(optsData.list).filter(v => (v.type === 'bool')).map(v => v.negate)
			};
			log(`-=> GroupCheck v${version} <=-`);
		},
		initializeState =  () => {
			state.groupCheck = {
				'checkList': {},
				'options': Object.entries(optsData.list).reduce((m, [k, v]) => {
						if ('def' in v) m[k] = v.def;
						return m;
					}, {}),
				'version': stateVersion,
				'importInfo': '',
				'dataVersion': dataVersion
			};
			log('-=> GroupCheck initialized with default settings!<=-');
		},
		updateState =  () => {
			switch (state.groupCheck.version) {
			case 1:
			case 2:
				initializeState();
				break;
			case 3:
				state.groupCheck.options.showpicture = true;
				/* falls through */
			case 4:
				state.groupCheck.options.process = false;
				/* falls through */
			case 5:
				state.groupCheck.dataVersion = 0;
				state.groupCheck.importInfo = '';
				/* falls through */
			case 6:
				state.groupCheck.options.showname = true;
				state.groupCheck.version = 7;
			}
		},
		updateCheckList = () => {
			let changedData = false;
			switch (state.groupCheck.dataVersion) {
			case 1:
			case 2:
			case 3:
				if (state.groupCheck.importInfo === '5E-Shaped') changedData = true;
				/* falls through */
			case 4:
				if (state.groupCheck.importInfo === '5E-OGL') changedData = true;
			}
			if (state.groupCheck.importInfo && changedData) {
				Object.assign(state.groupCheck.checkList, importData[state.groupCheck.importInfo]);
				log(`-=> GroupCheck has detected that you are using the ${state.groupCheck.importInfo}` +
					` data set and has updated your checks database automatically. Sorry for any inconvenience caused. <=-`);
			}
			state.groupCheck.dataVersion = dataVersion;
		},
		// Utility functions
		safeReadJSON = (string) => {
			try {
				const o = JSON.parse(string);
				if (o && typeof o === 'object') {
					return o;
				}
			}
			catch (e) {}
			return false;
		},
		sendChatNoarchive = (who, string) => sendChat(who, string, null, {noarchive: true}),
		recoverInlinerollFormulae = (msg) => {
			return (msg.inlinerolls || []).reduce((m, v, k) => m.replace(`$[[${k}]]`, `[[${v.expression}]]`), msg.content);
		},
		htmlReplace = (str) => {
			const entities = {
				'<': 'lt',
				'>': 'gt',
				"'": '#39',
				'@': '#64',
				'{': '#123',
				'|': '#124',
				'}': '#125',
				'[': '#91',
				'"': 'quot',
				']': '#93',
				'*': '#42'
			};
			return str.replace(/[<>'"@{|}[*\]]/g, c => ('&' + entities[c] + ';'));
		},
		getWhisperPrefix = (playerid) => {
			const player = getObj('player', playerid);
			if (player && player.get('_displayname')) return '/w "' + player.get('_displayname') + '" ';
			else return '/w GM ';
		},
		handleError = (whisper, errorMsg) => {
			const output = `${whisper}<div style="border:1px solid black;background:#FFBABA;padding:3px">` +
				`<h4>Error</h4><p>${errorMsg}</p></div>`;
			sendChatNoarchive('GroupCheck', output);
		},
		printHelp = (whisper) => {
			const helpString = `${whisper}<div style="border:1px solid black;background:#FFF;padding:3px">` +
				'Please refer to the <a style="text-decoration:underline" href="https://github.com/joesinghaus/' +
				'roll20-api-scripts/tree/master/GroupCheck/1.7/README.md">documentation</a>' +
				' for help with using GroupCheck, or ask in the API forum thread.</div>';
			sendChatNoarchive('GroupCheck', helpString);
		},
		printCommandMenu = (whisper, opts) => {
			const optsCommand = Object.entries(opts).map(([key, value]) => {
				return (typeof value === 'boolean') ? `--${key}` : `--${key} ${value}`;
			}).join(' ');
			const commandOutput = `${whisper}<div style="border:1px solid black;background-color:#FFF;padding:3px">` +
				'<h3 style="text-align:center">Available commands:</h3><p>' +
				Object.keys(state.groupCheck.checkList)
					.map((s) => `[${s}](!group-check ${optsCommand} --${s})`).join('') +
				'</p></div>';
			sendChatNoarchive('GroupCheck', commandOutput);
		},
		getConfigTable = () => {
			return '<div style="border:1px solid black;background-color:#FFFFFF;padding:' +
				'3px 3px;display:inline-block;"><h4>Current Options</h4><br><table ' +
				'style="margin:3px;"><tr><td><b>Name</b></td><td><b>Value</td></b></tr>' +
				Object.entries(state.groupCheck.options)
					.map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`).join('') +
				'</table></div><br><div style="border:1px solid black;background-color:' +
				'#FFFFFF;padding:3px 3px;display:inline-block;"><h4>Checks</h4><br>' +
				'<table style="margin:3px;"><tr><td><b>Command</b></td><td><b>Name</b>' +
				'</td><td><b>Formula</b></td><td><b>Special</b></td></tr>' +
				Object.entries(state.groupCheck.checkList)
					.map(([key, value]) => `<tr><td>${key}</td><td>${value.name}</td><td>${htmlReplace(value.formula)}</td><td>${value.special||''}</td></tr>`)
					.join('') +
				'</table></div>';
		},
		getRollOption = (charid) => {
			if (charid) {
				switch (getAttrByName(charid, "shaped_d20")) {
				case "d20":
					return 'roll1';
				case "2d20kh1":
				case "?{Disadvantaged|No,2d20kh1|Yes,d20}":
					return 'adv';
				case "2d20kl1":
				case "?{Advantaged|No,2d20kl1|Yes,d20}":
					return 'dis';
				default:
					return 'roll2';
				}
			}
		},
		parseOpts = (content, hasValue) => {
			return content.replace(/<br\/>\n/g, ' ')
				.replace(/({{(.*?)\s*}}\s*$)/g, '$2')
				.split(/\s+--/)
				.slice(1)
				.reduce((opts, arg) => {
					const kv = arg.split(/\s(.+)/);
					if (hasValue.includes(kv[0])) (opts[kv[0]] = (kv[1] || ''));
					else opts[arg] = true;
					return opts;
				}, {});
		},
		replaceInput = (formula, input) => {
			if (typeof input === 'string') {
				input.split(',').forEach((v, i) => {
					formula = formula.replace(new RegExp(`INPUT_${i}`, 'g'), v);
				});
			}
			return formula.replace(/INPUT_\d+/g, '');
		},
		processFormula = (formula, special, charID, charName) => {
			if (special === 'shaped') {
				let match = formula.match(/%(\S.*?)%/);
				while (match) {
					formula = formula.replace(/%(\S.*?)%/, getAttrByName(charID, match[1]) || '');
					match = formula.match(/%(\S.*?)%/);
				}
				return formula.replace(/(?:{{@{(?:[a-zA-Z0-9-_])+}=1}} )?{{roll1=\[\[@{(?:[a-zA-Z0-9-_])+}(?:@{d20_mod})? \+ (.*?)\]\]}}(?: {{roll2=\[\[.*?\]\]}})?/, '$1') || '0';
			}
			else return formula.replace(/%(\S.*?)%/g, `@{${charName}|$1}`);
		},
		//Main functions
		processTokenRollData = (token, checkFormula, checkSpecial, opts) => {
			let displayName, computedFormula, charName, tokenPic;
			if (!token) return null;
			const characterId = token.get('represents'),
				ro = opts.rollOption(characterId),
				character = getObj('character', characterId);
			if (character) {
				charName = character.get('name');
				displayName = (opts.usetokenname) ? token.get('name') : charName;
				computedFormula = processFormula(checkFormula, checkSpecial, characterId, charName);
			}
			else if (opts.fallback) {
				displayName = token.get('name');
				computedFormula = checkFormula.replace(/%(\S.*?)%/, opts.fallback)
					.replace(/%(\S.*?)%/g, '0');
			}
			else return null;
			if (!opts.showname) displayName = '';
			tokenPic = (opts.showpicture || !displayName) ? token.get('imgsrc').replace(/(?:max|original|med).png/, 'thumb.png') : false;
			switch (ro) {
			case 'adv':
				computedFormula += ' (Advantage)';
				computedFormula = computedFormula.replace(/1?d20/, opts.die_adv);
				break;
			case 'dis':
				computedFormula += ' (Disadvantage)';
				computedFormula = computedFormula.replace(/1?d20/, opts.die_dis);
				break;
			}
			return {
				'pic': tokenPic,
				'name': displayName,
				'roll2': (ro === 'roll2'),
				'formula': computedFormula,
				'id': token.id
			};
		},
		sendFinalMessage = (msg, opts, checkName, rollData) => {
			let freetext = '';
			// Format inline rolls
			const inlinerollData = (msg[0].inlinerolls || []).reduce((r, c, i) => {
				r[`$[[${i}]]`] = {
					result: c.results.total || 0,
					styled: outputStyle.makeInlineroll(c, opts.hideformula)
				};
				return r;
			}, {});
			msg[0].content.split('<br>').forEach((value, j) => {
				value.split('####').forEach((str, n) => {
					rollData[j]['result_' + n] = [];
					let match = str.match(/\$\[\[\d+\]\]/);
					while (match) {
						rollData[j]['result_' + n].push(inlinerollData[match[0]].result);
						str = str.replace(match[0], inlinerollData[match[0]].styled);
						match = str.match(/\$\[\[\d+\]\]/);
					}
					rollData[j]['styled_' + n] = str;
				});
			});
			// Format rows of output
			const lastIndex = opts.showaverage ? rollData.length : (rollData.length - 1);
			const rolls = rollData.map((o, i) => outputStyle.makeRow(o.pic, o.name, o.roll2, o.styled_0, o.styled_1, i === lastIndex));
			if (opts.showaverage) {
				const fakeRoll = {
					results: {
						total: (Math.round(10 * (rollData.map(o => o.result_0[0]).reduce((p, c) => p + c, 0)) / rollData.length) / 10)
					}
				};
				rolls.push(outputStyle.makeRow('', 'Average of rolls', false, outputStyle.makeInlineroll(fakeRoll, true), '', true));
			}
			if ('button' in opts) {
				const commandData = opts.button.split(/\s(.+)/),
					commandName = commandData.shift().replace('_', ' '),
					commandText = (commandData[0] || '').replace(/~/g, '--')
					.replace(/RESULTS\((.+?)\)/, rollData.map(o => o.result_0[0]).join('$1'))
					.replace(/IDS\((.+?)\)/, rollData.map(o => o.id).join('$1'));
				freetext = outputStyle.makeCommandButton(commandName, commandText);
			}
			if ('send' in opts) {
				const command = (opts.send || '').replace(/~/g, '--')
					.replace(/RESULTS\((.+?)\)/, rollData.map(o => o.result_0[0]).join('$1'))
					.replace(/IDS\((.+?)\)/, rollData.map(o => o.id).join('$1'));
				sendChat('API', command);
			}
			// Combine output
			const output = (opts.whisper ? '/w GM ' : '') +
				outputStyle.makeBox(checkName, opts.subheader, freetext, rolls.join(''));
			sendChat(opts.speaking, output);
		},
		handleConfig = (msg) => {
			const hasValueConfig = ['import', 'add', 'delete', 'set'];
			let opts = parseOpts(recoverInlinerollFormulae(msg), hasValueConfig),
				whisper = getWhisperPrefix(msg.playerid),
				output;
			if (!playerIsGM(msg.playerid)) {
				sendChatNoarchive('GroupCheck', `${whisper} Permission denied.`);
				return;
			}
			if (opts.import) {
				if (opts.import in importData) {
					Object.assign(state.groupCheck.checkList, importData[opts.import]);
					state.groupCheck.importInfo = opts.import;
					output = `Data set ${opts.import} imported.`;
				}
				else handleError(whisper, `Data set ${opts.import} not found.`);
			}
			else if (opts.add) {
				const data = safeReadJSON(opts.add.replace(/\\(\[|\])/g, '$1$1'));
				if (typeof data === 'object') {
					Object.entries(data).forEach(([key, value]) => {
						if (!(typeof value === 'object' && 'name' in value && 'formula' in value && typeof value.formula === 'string')) {
							delete data[key];
						}
					});
					Object.assign(state.groupCheck.checkList, data);
					output = `Checks added. The imported JSON was: <br>${htmlReplace(JSON.stringify(data))}`;
				}
				else handleError(whisper, 'Error reading input.');
			}
			else if (opts.delete) {
				if (opts.delete in state.groupCheck.checkList) {
					delete state.groupCheck.checkList[opts.delete];
					output = `Check ${opts.delete} deleted.`;
				}
				else handleError(whisper, `Check called ${opts.delete} not found.`);
			}
			else if (opts.set) {
				const kv = opts.set.split(/\s(.+)/);
				if (optsData.meta.str.includes(kv[0]) && optsData.meta.glob.includes(kv[0])) {
					state.groupCheck.options[kv[0]] = kv[1];
				}
				else if (kv[0] === 'ro') {
					if (optsData.list.ro.admissible.includes(kv[1])) {
						state.groupCheck.options.ro = kv[1];
					}
					else {
						handleError(whisper, `Roll option ${kv[1]} is invalid, sorry.`);
						return;
					}
				}
				else if (optsData.meta.bool.includes(kv[0])) {
					state.groupCheck.options[kv[0]] = true;
				}
				else if (optsData.meta.boolNeg.includes(kv[0])) {
					kv[0] = optsData.meta.bool[optsData.meta.boolNeg.indexOf(kv[0])];
					state.groupCheck.options[kv[0]] = false;
				}
				else {
					handleError(whisper, 'Command not understood.');
					return;
				}
				output = `Option ${kv[0]} set to ${state.groupCheck.options[kv[0]]}.`;
			}
			else if (opts.clear) {
				state.groupCheck.checkList = {};
				state.groupCheck.importInfo = '';
				output = 'All checks cleared.';
			}
			else if (opts.defaults) {
				state.groupCheck.options = Object.entries(optsData.list).reduce((m, [k, v]) => {
						if ('def' in v) m[k] = v.def;
						return m;
					}, {});
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
				printHelp(whisper);
			}
			if (output) {
				sendChatNoarchive('GroupCheck', whisper + output);
			}
			return;
		},
		handleRolls = (msg) => {
			// Options processing
			let checkName, checkFormula, checkSpecial,
				whisper = getWhisperPrefix(msg.playerid),
				opts = parseOpts(recoverInlinerollFormulae(msg), optsData.meta.str),
				checkCmd = Object.keys(state.groupCheck.checkList).find(x => x in opts);
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
				checkSpecial = state.groupCheck.checkList[checkCmd].special;
			}
			optsData.meta.boolNeg.forEach((name, index) => {
				if (name in opts) opts[optsData.meta.bool[index]] = false;
			});
			// Handle --custom
			if (opts.custom) {
				const kv = opts.custom.replace(/\\(\[|\])/g, '$1$1').split(/,\s?/);
				if (kv.length < 2) {
					handleError(whisper, "Custom roll format invalid");
					return;
				}
				checkName = kv.shift();
				checkFormula = kv.join();
			}
			// Remove invalid options and check commands from opts
			// Plug in defaults for unspecified options

			opts = Object.assign({}, state.groupCheck.options, _.pick(opts, optsData.meta.allopts));
			// Apply global modifier
			if (opts.globalmod) {
				if (checkFormula.search(/\]\](?=$)/) !== -1) {
					checkFormula = checkFormula.replace(/\]\](?=$)/, ` + (${opts.globalmod}[global modifier])]]`);
				}
				else checkFormula += ` + ${opts.globalmod}`;
			}
			// Replace placeholders
			checkFormula = replaceInput(checkFormula, opts.input);
			// Eliminate invalid roll option.
			if (!optsData.list.ro.admissible.includes(opts.ro)) {
				handleError(whisper, `Roll option ${opts.ro} is invalid, sorry.`);
				return;
			}
			// Get options into desired format
			opts.rollOption = (opts.ro === 'rollsetting') ? getRollOption : (() => opts.ro);
			opts.multi = (opts.multi > 1) ? parseInt(opts.multi) : 1;
			opts.speaking = (msg.playerid === 'API') ? 'API' : 'player|' + msg.playerid;
			// Transform tokens into nice data packages
			const rollData = (msg.selected || []).map(obj => getObj('graphic', obj._id))
				.map(token => processTokenRollData(token, checkFormula, checkSpecial, opts))
				.reduce((m, o) => {
					if (o) for (let i = 0; i < opts.multi; i++) m.push(Object.assign({}, o));
					return m;
				}, []);
			try {
				if (!opts.process) {
					const rolls = rollData.map((roll, index, list) => {
						const f = opts.hideformula ? `[[${roll.formula}]]` : roll.formula;
						return outputStyle.makeRow(roll.pic, roll.name, roll.roll2, f, f, index === list.length - 1);
					}).join('');
					const output = (opts.whisper ? '/w GM ' : '') +
						outputStyle.makeBox(checkName, opts.subheader, '', rolls);
					sendChat(opts.speaking, output);
				}
				else {
					const sentFormula = rollData.map(o => `${o.formula}####${o.roll2 ? (o.formula) : ''}`)
						.join('<br>');
					sendChat('', sentFormula, (msg) => sendFinalMessage(msg, opts, checkName, rollData));
				}
			}
			catch (err) {
				const errorMessage = 'Something went wrong with the roll. The command you tried was:<br>' +
					`${msg.content}<br>The error message generated by Roll20 is:<br>${err}`;
				handleError(whisper, errorMessage);
			}
		},
		handleInput = (msg) => {
			if (msg.type === 'api') {
				if (msg.content.search(/^!group-check($|\s)/) != -1) handleRolls(msg);
				else if (msg.content.search(/^!group-check-config\b/) != -1) handleConfig(msg);
			}
		},
		registerEventHandlers = (() => on('chat:message', handleInput));
	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
})();
on('ready', () => {
	'use strict';
	groupCheck.CheckInstall();
	groupCheck.RegisterEventHandlers();
});
