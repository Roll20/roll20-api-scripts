// GroupCheck version 1.9
// Last Updated: 2018-04-23
// A script to roll checks for many tokens at once with one command.
/* global state, getObj, getAttrByName, on, log, sendChat, playerIsGM, _ */

const groupCheck = (() => {
	'use strict';
	const version = '1.9',
		stateVersion = 7,
		dataVersion = 6,
		// Roll appearance
		outputStyle = (() => {
			const makeBox = (header, subheader, freetext, content) => {
					return '<div style="border: 1px solid #888;background:#fff;border-radius:15px;padding:3px 3px 1px;margin-left:-42px">' +
						`<h4 style="text-align:center">${header}</h4>` +
						`<h5 style="text-align:center">${subheader || ''}</h5>` +
						`<table style="width:100%">${content}</table>` +
						(freetext ? `<div style="text-align:center;margin-bottom:4px">${freetext}</div>` : '') +
						'</div>';
				},
				makeRow = (pic, name, roll1, roll2, isLast) => {
					return `<tr${isLast ? '' :' style="border-bottom: 1px solid #ddd"'}>` +
						makeName(pic, name) +
						`<td style="text-align:center">${roll1}</td>` +
						(roll2 ? `<td style="text-align:center">${roll2}</td>` : '') +
						'</tr>';
				},
				makeName = (pic, name) => {
					const imgStyle = 'display:inline-block;height:30px;width:30px;vertical-align:middle;margin-right:4px';
					return '<td style="padding:3px;height:30px;width:85%">' +
						(pic ? `<div style="${imgStyle};background:url('${pic}') 0/contain no-repeat"></div>` : '') +
						`<span style="vertical-align:middle;font-weight:bolder">${name}</span>` +
						'</td>';
				},
				makeCommandButton = (name, command, useBorder) => {
					const style = `style="font-weight:bold;color:#000;background:#fff;border:${useBorder?'1px solid black;padding:2px;margin:1px 0':'none;padding:0'}"`;
					return `<a href="${htmlReplace(command)}" ${style}>${name}</a>`;
				},
				makeInlineroll = (roll, hideformula) => {
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
						`cursor:${hideformula ? 'default' : 'help'}${boundary(roll.results)}">${roll.results.total || '0'}</div>`;
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
									(rollIsCrit(r.v, f[0].comp, f[0].point) ? ' critfail' : '');
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
					if (roll.type === 'V') s = (roll.rolls || []).map(detectCritical);
					if (roll.type === 'G') s = _.flatten(roll.rolls || []).map(detectCritical);
					if (roll.type === 'R') {
						const crit = (roll.mods && roll.mods.customCrit) || [{
							comp: '==',
							point: roll.sides || 0
						}];
						const fumble = (roll.mods && roll.mods.customFumble) || [{
							comp: '==',
							point: 1
						}];
						if (roll.results.some(r => rollIsCrit(r.v, crit[0].comp, crit[0].point))) s.push('crit');
						if (roll.results.some(r => rollIsCrit(r.v, fumble[0].comp, fumble[0].point))) s.push('fumble');
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
				makeBox,
				makeCommandButton,
				makeInlineroll,
				makeRow
			};
		})(),
		// Data variables
		importData = {
			"5E-Shaped": {
				"Strength Save": {
					"name": "Strength Saving Throw",
					"formula": "[[d20  + @{strength_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Dexterity Save": {
					"name": "Dexterity Saving Throw",
					"formula": "[[d20  + @{dexterity_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Constitution Save": {
					"name": "Constitution Saving Throw",
					"formula": "[[d20  + @{constitution_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Intelligence Save": {
					"name": "Intelligence Saving Throw",
					"formula": "[[d20  + @{intelligence_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Wisdom Save": {
					"name": "Wisdom Saving Throw",
					"formula": "[[d20  + @{wisdom_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Charisma Save": {
					"name": "Charisma Saving Throw",
					"formula": "[[d20  + @{charisma_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Death Save": {
					"name": "Death Saving Throw",
					"formula": "[[d20  + @{death_saving_throw_formula}]]",
					"special": "shaped"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + @{strength_check_formula}]]",
					"special": "shaped"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + @{dexterity_check_formula}]]",
					"special": "shaped"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + @{constitution_check_formula}]]",
					"special": "shaped"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + @{intelligence_check_formula}]]",
					"special": "shaped"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + @{wisdom_check_formula}]]",
					"special": "shaped"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + @{charisma_check_formula}]]",
					"special": "shaped"
				},
				"Acrobatics": {
					"name": "Dexterity (Acrobatics) Check",
					"formula": "[[d20 + @{repeating_skill_$0_formula}]]",
					"special": "shaped"
				},
				"Animal Handling": {
					"name": "Wisdom (Animal Handling) Check",
					"formula": "[[d20 + @{repeating_skill_$1_formula}]]",
					"special": "shaped"
				},
				"Arcana": {
					"name": "Intelligence (Arcana) Check",
					"formula": "[[d20 + @{repeating_skill_$2_formula}]]",
					"special": "shaped"
				},
				"Athletics": {
					"name": "Strength (Athletics) Check",
					"formula": "[[d20 + @{repeating_skill_$3_formula}]]",
					"special": "shaped"
				},
				"Deception": {
					"name": "Charisma (Deception) Check",
					"formula": "[[d20 + @{repeating_skill_$4_formula}]]",
					"special": "shaped"
				},
				"History": {
					"name": "Intelligence (History) Check",
					"formula": "[[d20 + @{repeating_skill_$5_formula}]]",
					"special": "shaped"
				},
				"Insight": {
					"name": "Wisdom (Insight) Check",
					"formula": "[[d20 + @{repeating_skill_$6_formula}]]",
					"special": "shaped"
				},
				"Intimidation": {
					"name": "Charisma (Intimidation) Check",
					"formula": "[[d20 + @{repeating_skill_$7_formula}]]",
					"special": "shaped"
				},
				"Investigation": {
					"name": "Intelligence (Investigation) Check",
					"formula": "[[d20 + @{repeating_skill_$8_formula}]]",
					"special": "shaped"
				},
				"Medicine": {
					"name": "Wisdom (Medicine) Check",
					"formula": "[[d20 + @{repeating_skill_$9_formula}]]",
					"special": "shaped"
				},
				"Nature": {
					"name": "Intelligence (Nature) Check",
					"formula": "[[d20 + @{repeating_skill_$10_formula}]]",
					"special": "shaped"
				},
				"Perception": {
					"name": "Wisdom (Perception) Check",
					"formula": "[[d20 + @{repeating_skill_$11_formula}]]",
					"special": "shaped"
				},
				"Performance": {
					"name": "Charisma (Performance) Check",
					"formula": "[[d20 + @{repeating_skill_$12_formula}]]",
					"special": "shaped"
				},
				"Persuasion": {
					"name": "Charisma (Persuasion) Check",
					"formula": "[[d20 + @{repeating_skill_$13_formula}]]",
					"special": "shaped"
				},
				"Religion": {
					"name": "Intelligence (Religion) Check",
					"formula": "[[d20 + @{repeating_skill_$14_formula}]]",
					"special": "shaped"
				},
				"Sleight of Hand": {
					"name": "Dexterity (Sleight of Hand) Check",
					"formula": "[[d20 + @{repeating_skill_$15_formula}]]",
					"special": "shaped"
				},
				"Stealth": {
					"name": "Dexterity (Stealth) Check",
					"formula": "[[d20 + @{repeating_skill_$16_formula}]]",
					"special": "shaped"
				},
				"Survival": {
					"name": "Wisdom (Survival) Check",
					"formula": "[[d20 + @{repeating_skill_$17_formula}]]",
					"special": "shaped"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[@{AC}]]"
				}
			},
			"Pathfinder-Community": {
				"Fortitude Save": {
					"name": "Fortitude Saving Throw",
					"formula": "[[d20 + @{Fort}]]"
				},
				"Reflex Save": {
					"name": "Reflex Saving Throw",
					"formula": "[[d20 + @{Ref}]]"
				},
				"Will Save": {
					"name": "Will Saving Throw",
					"formula": "[[d20 + @{Will}]]"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + @{STR-mod} + @{checks-cond}]]"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + @{DEX-mod} + @{checks-cond}]]"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + @{CON-mod} + @{checks-cond}]]"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + @{INT-mod} + @{checks-cond}]]"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + @{WIS-mod} + @{checks-cond}]]"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + @{CHA-mod} + @{checks-cond}]]"
				},
				"Perception": {
					"name": "Perception Check",
					"formula": "[[d20 + @{Perception}]]"
				},
				"Stealth": {
					"name": "Stealth Check",
					"formula": "[[d20 + @{Stealth}]]"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[@{AC}]]"
				}
			},
			"5E-OGL": {
				"Strength Save": {
					"name": "Strength Saving Throw",
					"formula": "[[d20 + (@{strength_save_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_str_save}*@{npc}) [NPC]]]"
				},
				"Dexterity Save": {
					"name": "Dexterity Saving Throw",
					"formula": "[[d20 + (@{dexterity_save_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_dex_save}*@{npc}) [NPC]]]"
				},
				"Constitution Save": {
					"name": "Constitution Saving Throw",
					"formula": "[[d20 + (@{constitution_save_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_con_save}*@{npc}) [NPC]]]"
				},
				"Intelligence Save": {
					"name": "Intelligence Saving Throw",
					"formula": "[[d20 + (@{intelligence_save_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_int_save}*@{npc}) [NPC]]]"
				},
				"Wisdom Save": {
					"name": "Wisdom Saving Throw",
					"formula": "[[d20 + (@{wisdom_save_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_wis_save}*@{npc}) [NPC]]]"
				},
				"Charisma Save": {
					"name": "Charisma Saving Throw",
					"formula": "[[d20 + (@{charisma_save_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_cha_save}*@{npc}) [NPC]]]"
				},
				"Death Save": {
					"name": "Death Saving Throw",
					"formula": "[[d20 + @{death_save_bonus}@{globalsavingthrowbonus}]]"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + @{strength_mod}]]"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + @{dexterity_mod}]]"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + @{constitution_mod}]]"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + @{intelligence_mod}]]"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + @{wisdom_mod}]]"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + @{charisma_mod}]]"
				},
				"Acrobatics": {
					"name": "Dexterity (Acrobatics) Check",
					"formula": "[[d20 + (@{acrobatics_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_acrobatics}*@{npc}) [NPC]]]"
				},
				"Animal Handling": {
					"name": "Wisdom (Animal Handling) Check",
					"formula": "[[d20 + (@{animal_handling_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_animal_handling}*@{npc}) [NPC]]]"
				},
				"Arcana": {
					"name": "Intelligence (Arcana) Check",
					"formula": "[[d20 + (@{arcana_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_arcana}*@{npc}) [NPC]]]"
				},
				"Athletics": {
					"name": "Strength (Athletics) Check",
					"formula": "[[d20 + (@{athletics_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_athletics}*@{npc}) [NPC]]]"
				},
				"Deception": {
					"name": "Charisma (Deception) Check",
					"formula": "[[d20 + (@{deception_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_deception}*@{npc}) [NPC]]]"
				},
				"History": {
					"name": "Intelligence (History) Check",
					"formula": "[[d20 + (@{history_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_history}*@{npc}) [NPC]]]"
				},
				"Insight": {
					"name": "Wisdom (Insight) Check",
					"formula": "[[d20 + (@{insight_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_insight}*@{npc}) [NPC]]]"
				},
				"Intimidation": {
					"name": "Charisma (Intimidation) Check",
					"formula": "[[d20 + (@{intimidation_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_intimidation}*@{npc}) [NPC]]]"
				},
				"Investigation": {
					"name": "Intelligence (Investigation) Check",
					"formula": "[[d20 + (@{investigation_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_investigation}*@{npc}) [NPC]]]"
				},
				"Medicine": {
					"name": "Wisdom (Medicine) Check",
					"formula": "[[d20 + (@{medicine_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_medicine}*@{npc}) [NPC]]]"
				},
				"Nature": {
					"name": "Intelligence (Nature) Check",
					"formula": "[[d20 + (@{nature_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_nature}*@{npc}) [NPC]]]"
				},
				"Perception": {
					"name": "Wisdom (Perception) Check",
					"formula": "[[d20 + (@{perception_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_perception}*@{npc}) [NPC]]]"
				},
				"Performance": {
					"name": "Charisma (Performance) Check",
					"formula": "[[d20 + (@{performance_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_performance}*@{npc}) [NPC]]]"
				},
				"Persuasion": {
					"name": "Charisma (Persuasion) Check",
					"formula": "[[d20 + (@{persuasion_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_persuasion}*@{npc}) [NPC]]]"
				},
				"Religion": {
					"name": "Intelligence (Religion) Check",
					"formula": "[[d20 + (@{religion_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_religion}*@{npc}) [NPC]]]"
				},
				"Sleight of Hand": {
					"name": "Dexterity (Sleight of Hand) Check",
					"formula": "[[d20 + (@{sleight_of_hand_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_sleight_of_hand}*@{npc}) [NPC]]]"
				},
				"Stealth": {
					"name": "Dexterity (Stealth) Check",
					"formula": "[[d20 + (@{stealth_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_stealth}*@{npc}) [NPC]]]"
				},
				"Survival": {
					"name": "Wisdom (Survival) Check",
					"formula": "[[d20 + (@{survival_bonus}@{pbd_safe}*(1-@{npc})) [PC] + (@{npc_survival}*@{npc}) [NPC]]]"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[@{AC}]]"
				}
			},
			"3.5": {
				"Fortitude Save": {
					"name": "Fortitude Saving Throw",
					"formula": "[[d20 + @{fortitude}]]"
				},
				"Reflex Save": {
					"name": "Reflex Saving Throw",
					"formula": "[[d20 + @{reflex}]]"
				},
				"Will Save": {
					"name": "Will Saving Throw",
					"formula": "[[d20 + @{wisdom}]]"
				},
				"Strength Check": {
					"name": "Strength Check",
					"formula": "[[d20 + @{str-mod}]]"
				},
				"Dexterity Check": {
					"name": "Dexterity Check",
					"formula": "[[d20 + @{dex-mod}]]"
				},
				"Constitution Check": {
					"name": "Constitution Check",
					"formula": "[[d20 + @{con-mod}]]"
				},
				"Intelligence Check": {
					"name": "Intelligence Check",
					"formula": "[[d20 + @{int-mod}]]"
				},
				"Wisdom Check": {
					"name": "Wisdom Check",
					"formula": "[[d20 + @{wis-mod}]]"
				},
				"Charisma Check": {
					"name": "Charisma Check",
					"formula": "[[d20 + @{cha-mod}]]"
				},
				"Hide": {
					"name": "Hide Check",
					"formula": "[[d20 + @{hide}]]"
				},
				"Listen": {
					"name": "Listen Check",
					"formula": "[[d20 + @{listen}]]"
				},
				"Move Silently": {
					"name": "Move Silently Check",
					"formula": "[[d20 + @{movesilent}]]"
				},
				"Spot": {
					"name": "Spot Check",
					"formula": "[[d20 + @{spot}]]"
				},
				"AC": {
					"name": "Armor Class",
					"formula": "[[@{armorclass}]]"
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
				},
				raw: {
					type: 'string',
					local: true,
				},
				title: {
					type: 'string',
					local: true,
				},
				ids: {
					type: 'string',
					local: true,
				},
			},
			meta: {}
		},
		// Setup
		checkInstall = () => {
			if (!state.groupCheck) initializeState();
			else if (state.groupCheck.version < stateVersion) updateState();
			if (state.groupCheck.dataVersion < dataVersion) updateCheckList();
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
		initializeState = (isReset) => {
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
			if (!isReset) sendWelcomeMessage();
		},
		updateState = () => {
			switch (state.groupCheck.version) {
			case 1:
			case 2:
				initializeState();
				break;
			case 3:
				state.groupCheck.options.showpicture = true;
				/* falls through */
			case 4:
			case 5:
				state.groupCheck.dataVersion = 0;
				state.groupCheck.importInfo = '';
				/* falls through */
			case 6:
				state.groupCheck.options.showname = true;
			}
			state.groupCheck.version = version;
		},
		updateCheckList = () => {
			let changedData = false;
			switch (state.groupCheck.dataVersion) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
				if (state.groupCheck.importInfo === 'Pathfinder') state.groupCheck.importInfo = 'Pathfinder-Community';
				if (['5E-Shaped', '5E-OGL'].includes(state.groupCheck.importInfo)) changedData = true;
				Object.values(state.groupCheck.checkList).forEach(o => {
					o.formula = o.formula.replace(/%(\S.*?)%/g, '@{$1}');
				});
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
				if (o && typeof o === 'object') return o;
			}
			catch (e) {}
			return false;
		},
		sendChatNoarchive = (playerid, string) => {
			const whisperPrefix = `/w "${(getObj('player', playerid) || {get: () => 'GM'}).get('_displayname')}" `;
			sendChat('GroupCheck', whisperPrefix + string, null, {
				noarchive: true
			});
		},
		recoverInlinerollFormulae = (msg) => {
			return (msg.inlinerolls || []).reduce((m, v, k) => m.replace(`$[[${k}]]`, `[[${v.expression}]]`), msg.content);
		},
		htmlReplace = (str, weak) => {
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
				'*': '#42',
				'&': 'amp',
			};
			const regExp = weak ? /['"@{|}[*&\]]/g : /[<>'"@{|}[*&\]]/g;
			return str.replace(regExp, c => ('&' + entities[c] + ';'));
		},
		sendChatBox = (playerid, content, background) => {
			const output = `<div style="border:1px solid black;background:#${background || 'FFF'};` +
				`padding:3px;margin:0 10px 0 -32px">${content}</div>`;
			sendChatNoarchive(playerid, output);
		},
		handleError = (playerid, errorMsg) => sendChatBox(playerid, `<h4>Error</h4><p>${errorMsg}</p>`, 'FFBABA'),
		getImportButton = (label) => {
			return outputStyle.makeCommandButton(label, `!group-check-config --import ?{Which set|${Object.keys(importData).join('|')}}`);
		},
		getHelp = () => htmlReplace(`<h1>GroupCheck</h1><p>This is an API script meant to run checks for several tokens at once. You can specify the type of check to run and it will roll it once for every selected token. Note that you <strong>will</strong> have to configure the script and import the right types of checks before you can use it.</p><h2>Basic usage</h2><p>Having configured some checks, you can call the script using the following syntax</p><pre><code>!group-check [--options] --Check Command</code></pre><p>Here, you can supply zero or more options (see the section on options for specifics) that modify what exactly is rolled. <strong>Check Command</strong> is the command associated to the check you want to run. If no valid <strong>Check Command</strong> is supplied, a list of valid commands (in the form of API buttons) is instead output to chat, allowing you to press them to roll the corresponding check.<strong>Check Command</strong> will then be rolled once for every selected token that represents a character, and the result will be output to chat.</p><h3>Example</h3><p>Suppose that we are using D&D 5E, and want to roll a Dexterity saving throw for every selected token, outputting the result to the GM only. The command would be</p><pre><code>!group-check --whisper --Dexterity Save</code></pre><p>Note that this only works after having imported the right data for the sheet you are using.</p><p>If you have two tokens selected, representing the characters <strong>Sarah</strong> and <strong>Mark</strong>, the script will output (with default settings)</p><p><strong>Sarah:</strong> [[d20 + @{Sarah|dexterity_saving_throw_mod}]]</p><p><strong>Mark:</strong> [[d20 + @{Mark|dexterity_saving_throw_mod}]]</p><p>Internally, the form of the check is proscribed by a formula; the formula in this case is of the form "[[d20 + @{dexterity_saving_throw_mod}]]", and the script will fill in the right attribute in place of "@{dexterity_saving_throw_mod}".</p><h2>Configuration</h2><p>The script is designed to be easily configured to your specific system's needs. You can configure the script using the <strong>!group-check-config</strong> command. <strong>!group-check-config</strong> accepts the following options:</p><h3>Show options</h3><ul><li><strong>!group-check-config --show</strong> will display the current list of checks and the default options for GroupCheck.</li></ul><h3>Manipulating the check database</h3><ul><li><p><strong>!group-check-config --import [Name]</strong> imports a predefined set of checks and adds them to the list. Currently, the available choices for <strong>[Name]</strong> are <strong>5E-Shaped</strong>, <strong>5E-OGL</strong>, <strong>Pathfinder-Neceros</strong>, and <strong>3.5</strong>.</p></li><li><p><strong>!group-check-config --add [JSON]</strong>  adds a check, or several checks, to the list of checks in the database. <strong>[JSON]</strong> must be valid JSON in the following format:</p><p>{ "Check Command" : { "name" : "Check Name", "formula" : "FORMULA"} }Here, the command will be called by <strong>!group-check --Check Command</strong>, the title of the box appearing in chat will be Check Name, and FORMULA is the formula used to calculate the roll result. Attributes to be filled in in FORMULA need to be specified as \\at{name}; inline roll brackets ("[[" or "]]") should be replaced by "\\[", respectively "\\]". For example, to add a check with command Strength that roll a d20 + the character's Strength attribute, you would type</p><p>!group-check-config --add { "Strength" : { "name" : "Strength Test", "formula" : "[d20 + \\at{Strength}]"} }</p></li><li><p><strong>!group-check-config --delete [Command]</strong> will delete the check called <strong>Command</strong> from the database.</p></li><li><p><strong>!group-check-config --clear</strong> will empty the list of checks in the database.</p></li></ul><h3>Manipulating default options</h3><ul><li><p><strong>!group-check-config --set option value</strong> will set <strong>option</strong> to <strong>value</strong>. The following options are available: <strong>ro</strong>, <strong>die_adv</strong>, <strong>die_dis</strong>, <strong>fallback</strong>, and <strong>globalmod</strong>. To find out more about what these options do, consult the Options sections.</p></li><li><p><strong>!group-check-config --set option</strong> will set <strong>option</strong> (this is the variant for options which can be either true or false). The following options are available: <strong>showformula</strong>, <strong>hideformula</strong>, <strong>whisper</strong>, <strong>public</strong>, <strong>usecharname</strong>, <strong>usetokenname</strong>, <strong>showpicture</strong>, and <strong>hidepicture</strong>, <strong>direct</strong> and <strong>process</strong>. To find out more about what these options do, consult the Options section.</p></li><li><p><strong>!group-check-config --defaults</strong> will reset all options to the factory defaults.</p></li><li><p><strong>!group-check-config --reset</strong> will both empty the list of checks and reset all options.</p></li></ul><h2>Options</h2><p>Most of the following options can be supplied in two ways: you can either supply them on the command line, or change the defaults via !group-check-config. Most of the time, it is probably advisable to do the latter.</p><h3>Targeting</h3><p>By default, the script will be run for every selected token. Alternatively, if the <strong>--ids IDs</strong> option is specified, it will instead run for every token in <strong>IDs</strong>, which is supplied in the form of a comma-separated list of token IDs. This shouldn't normally be necessary, but it could be useful for generating GroupCheck commands via an API script.</p><h3>List of options</h3><ul><li><p>The options <strong>die_adv</strong>, and <strong>die_dis</strong> control the die substitution for disadvantage and advantage. The first d20 in the roll formula will be replaced by the value of die_adv resp. die_dis if the roll option adv for Advantage or dis for Disadvantage is specified.</p></li><li><p>The options <strong>whisper</strong>, resp. <strong>public</strong>, control if rolls are whispered to the GM or output publicly.</p></li><li><p>You can use the option <strong>--title [text]</strong> to display <strong>[text]</strong> instead of the normal title of the roll.</p></li><li><p>You can use the option <strong>--subheader [text]</strong> to display <strong>[text]</strong> below the title of your roll.</p></li><li><p>The options <strong>--direct</strong> and <strong>--process</strong> let GroupCheck use the rolls in two very different ways (you probably want to set this option via !group-check-config permanently instead of specifying it for every roll). <strong>--direct</strong> is the default, and equals the behaviour of GroupCheck prior to version 1.0, in that it simply outputs inline rolls to chat. On the other hand, <strong>--process</strong> lets GroupCheck process the results first to change their appearance and pass on the results to other scripts. Since <strong>--process</strong> has not been tested for many cases yet, this could lead to strange results. Enabling <strong>--process</strong> also changes the appearance of rolls, for example by removing the yellow background, and enables the <strong>--showaverage</strong>, <strong>--button</strong>, and <strong>--send</strong> options.</p></li><li><p>The option <strong>--showaverage</strong> (requires <strong>--process</strong>) will add an extra line at the end showing an average of all rolls.</p></li><li><p>The option <strong>--button [Name] [Command]</strong> (requires <strong>--process</strong>) will add an API command button to the end of the roll output with name <strong>[Name]</strong> and command <strong>[Command]</strong>. A tilde (~) inside the command will be replaced by double dashes (--) in order not to interfere with GroupCheck's syntax. You can use the results of the roll inside the command as follows: the string <strong>IDS([sep])</strong> will be replaced by the token ids used in the roll, joined by <strong>[sep]</strong>. The string <strong>RESULTS([sep])</strong> will be replaced by the results of the rolls (first roll for each token only), joined by <strong>[sep]</strong>. For example, if you want a comma-separated list of token ids, use <strong>IDS(,)</strong>.</p></li><li><p>The option <strong>--raw [subheader]</strong> will send a second version of the results to chat (always publicly, not whispered), which only shows the dice rolls for the tokens, without modifiers. Optionally, you can specifiy the subheader here, which will work like <strong>--subheader</strong>, except that it is only shown in the raw version. Requires <strong>--process</strong>.</p></li><li><p>The option <strong>--send [Command]</strong> option will send <strong>[Command]</strong> to chat as a separate message. It allows the same replacement of <strong>RESULTS</strong> and <strong>IDS</strong> as <strong>--button</strong> does, and is intended for sending API commands containing the results of the roll.</p></li><li><p>The option <strong>--input [input0],[input1]...</strong> will allow you to replace parts of a formula on-the-fly (for example, via roll queries). If the string INPUT_i is present in the roll's formula, it will be replaced by your i-th input (undefined INPUT_i will just be removed). This is meant to be able to easily DCs, target numbers, and the like.</p></li><li><p>The option <strong>--usecharname</strong>, resp. <strong>--usetokenname</strong>, control if the name of the token or the name of the character is displayed in front of the roll result. You can use e.g. the TokenNameNumber script to give different tokens for the same character different (numbered) names, allowing you to discern which of the tokens rolled which roll, even if there are several tokens representing the same character. This is active by default.</p></li><li><p>It is possible to alter the specific way rolls are made. There are 5 options: roll normally, roll with advantage, roll with disadvantage, always roll 2 times for every token, or (for the 5E Shaped sheet only) respect the roll setting on the sheet for selected tokens. You can control this via the option <strong>--ro [Setting]</strong>, where <strong>[Setting]</strong> can be one of roll1, roll2, adv, dis, rollsetting, respectively. If you are not using D&D 5th Edition, you probably want to leave this option on roll1 constantly.</p></li><li><p>The option <strong>--globalmod [mod]</strong> will add <strong>[mod]</strong> as a modifier to all rolls made. Here <strong>[mod]</strong> can be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things.</p></li><li><p>You can use <strong>--multi [n]</strong> to run every check <strong>[n]</strong> times instead of once, with a minimum of 1 time.</p></li><li><p>It is possible to hide the formula for checks and only show the final result of the roll. This is controlled via the options <strong>--showformula</strong> and <strong>--hideformula</strong>.</p></li><li><p>You can turn off the display of the token image next to the character name (it will always be displayed if the name is empty). This is controlled via the options <strong>--showpicture</strong> and <strong>--hidepicture</strong> (on by default).</p></li><li><p>You can turn off the display of the name next to the token image. This is controlled via the options <strong>--showname</strong> and <strong>--hidename</strong> (on by default).</p></li><li><p>You can supply a fallback value. When the option <strong>--fallback [value]</strong> is given, a roll will be made even for tokens not linked to a character; for these tokens, <strong>[value]</strong> will be used instead of the FIRST attribute in a roll, and all other attributes are treated as if they were 0. <strong>[value]</strong> may be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things. If also using <strong>--globalmod</strong>, the global modifier is applied in addition to the fallback mod.</p></li><li><p>It is possible to supply a custom roll not present in the checks database. The syntax to do this is <strong>--custom CheckName, formula</strong>. This will roll a check with title <strong>CheckName</strong> and formula <strong>formula</strong> for the roll.</p></li></ul>`, true),
		showCommandMenu = (playerid, opts) => {
			const optsCommand = Object.entries(opts)
				.map(([key, value]) => (typeof value === 'boolean') ? `--${key}` : `--${key} ${value}`)
				.join(' ');
			const commandOutput = '<h3 style="text-align:center">Available commands</h3><p style="text-align:center">' +
				(Object.keys(state.groupCheck.checkList)
					.map(s => outputStyle.makeCommandButton(s, `!group-check ${optsCommand} --${s}`, true))
					.join(' ') || `It seems there are no checks defined yet. See the ` +
					`${outputStyle.makeCommandButton('help', '!group-check --help')} for information ` +
					`on how to add them, or just ${getImportButton('import')} one of the built-in lists.`) +
				'</p>';
			sendChatBox(playerid, commandOutput);
		},
		getConfigTable = () => {
			return '<h4>Current Options</h4>' +
				'<table style="margin:3px;">' +
				'<tr style="font-weight:bold"><td>Name</td><td>Value</td></tr>' +
				Object.entries(state.groupCheck.options)
				.map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
				.join('') +
				'</table>' +
				'<h4>Checks</h4>' +
				'<table style="margin:3px;">' +
				'<tr style="font-weight:bold"><td>Command</td><td>Name</td><td>Formula</td><td>Special</td></tr>' +
				Object.entries(state.groupCheck.checkList)
				.map(([key, value]) => `<tr><td>${key}</td><td>${value.name}</td><td>${htmlReplace(value.formula)}</td><td>${value.special||''}</td></tr>`)
				.join('') +
				'</table>';
		},
		sendWelcomeMessage = () => {
			const output = `/w GM <div style="border:1px solid black;background:#FFF;padding:3px;margin:0 10px 0 -32px">` +
				`It seems you are starting fresh with GroupCheck. Please refer to the ` +
				`${outputStyle.makeCommandButton('help', '!group-check --help')} for an in-depth ` +
				`explanation of all the features. Would you like to ${getImportButton('import')} ` +
				`one of the built-in lists of checks?</div>`;
			sendChat('GroupCheck', output);
		},
		getRollOption = (charID) => {
			if (charID) {
				switch (getAttrByName(charID, "shaped_d20")) {
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
			else return 'roll2';
		},
		parseOpts = (content, hasValue) => {
			return content.replace(/<br\/>\n/g, ' ')
				.replace(/({{(.*?)\s*}}\s*$)/g, '$2')
				.split(/\s+--/)
				.slice(1)
				.reduce((opts, arg) => {
					const kv = arg.split(/\s(.+)/);
					if (hasValue.includes(kv[0])) opts[kv[0]] = kv[1] || '';
					else opts[arg] = true;
					return opts;
				}, {});
		},
		replaceInput = (formula, input) => {
			const inputs = (input || '').split(',');
			return formula.replace(/INPUT_(\d+)/g, (_, num) => inputs[parseInt(num)] || '');
		},
		processFormula = (formula, special, charID) => {
			const myGetAttrByName = attrName => {
					const result = getAttrByName(charID, attrName);
					if (typeof result === 'number') return String(result);
					else return result || '';
				},
				replacer = (_, attrName) => myGetAttrByName(attrName);

			if (special === 'shaped') {
				formula = formula.replace(/@{(.*?)}/, (_, attrName) => {
					const attrValue = myGetAttrByName(attrName);
					return (attrValue.match(/{{roll1=\[\[@{(?:[a-zA-Z0-9-_])+}(?:@{d20_mod})? \+ (.*?)\]\]}}/) || ['', attrValue])[1];
				});
			}
			while (/@{(.*?)}/.test(formula)) formula = formula.replace(/@{(.*?)}/g, replacer);
			return formula;
		},
		//Main functions
		processTokenRollData = (token, checkFormula, checkSpecial, opts) => {
			const charID = token.get('represents'),
				ro = opts.rollOption(charID),
				character = getObj('character', charID),
				displayName = opts.showname ? ((opts.usetokenname || !character) ? token.get('name') : character.get('name')) : '',
				tokenPic = (opts.showpicture || !displayName) ? token.get('imgsrc').replace(/(?:max|original|med)\.png/, 'thumb.png') : false;

			let computedFormula;
			if (character) computedFormula = processFormula(checkFormula, checkSpecial, charID);
			else if (opts.fallback) computedFormula = checkFormula.replace(/@{(.*?)}/, opts.fallback).replace(/@{(.*?)}/g, '0');
			else return null;

			if (ro === 'adv') computedFormula = `${computedFormula.replace(/1?d20/, opts.die_adv)} (Advantage)`;
			if (ro === 'dis') computedFormula = `${computedFormula.replace(/1?d20/, opts.die_dis)} (Disadvantage)`;

			return {
				'pic': tokenPic,
				'name': displayName,
				'roll2': (ro === 'roll2'),
				'formula': computedFormula,
				'id': token.id,
			};
		},
		sendFinalMessage = (msg, opts, checkName, rollData) => {
			let freetext = '';
			// Format inline rolls
			const extractDiceRoll = roll => {
				if (roll.type === 'V' && roll.rolls)
					return roll.rolls.map(extractDiceRoll).reduce((m,x) => m+x,0);
				if (roll.type === 'G' && roll.rolls)
					return _.flatten(roll.rolls).map(extractDiceRoll).reduce((m,x) => m+x,0);
				if (roll.type === 'R')
					return roll.results.filter(x => x.v && !x.d).map(x => x.v).reduce((m,x) => m+x,0);
				else return 0;
			};
			const inlinerollData = (msg[0].inlinerolls || []).map(roll => {
				return {
					raw: extractDiceRoll(roll.results),
					result: roll.results.total || 0,
					styled: outputStyle.makeInlineroll(roll, opts.hideformula)
				};
			});
			msg[0].content.split('<br>').forEach((value, j) => {
				value.split('####').forEach((str, n) => {
					rollData[j][`result_${(n+1)}`] = [];
					rollData[j][`raw_${(n+1)}`] = [];
					rollData[j][`styled_${n+1}`] = str.replace(/\$\[\[(\d+)\]\]/g, (_, number) => {
						rollData[j][`result_${(n+1)}`].push(inlinerollData[parseInt(number)].result);
						rollData[j][`raw_${(n+1)}`].push(inlinerollData[parseInt(number)].raw);
						return inlinerollData[parseInt(number)].styled;
					});
				});
			});
			// Format rows of output
			const lastIndex = opts.showaverage ? rollData.length : (rollData.length - 1);
			const rolls = rollData.map((o, i) => {
				return outputStyle.makeRow(o.pic, o.name, o.styled_1, (o.roll2 ? o.styled_2 : ''), i === lastIndex);
			});
			if (opts.showaverage) {
				const fakeRoll = {
					results: {
						total: (Math.round(10 * (rollData.map(o => o.result_1[0]).reduce((p, c) => p + c, 0)) / rollData.length) / 10)
					}
				};
				rolls.push(outputStyle.makeRow('', 'Average of rolls', outputStyle.makeInlineroll(fakeRoll, true), false, true));
			}
			if ('button' in opts) {
				const commandData = opts.button.split(/\s(.+)/),
					commandName = commandData.shift().replace('_', ' '),
					commandText = (commandData[0] || '').replace(/~/g, '--')
					.replace(/RESULTS\((.+?)\)/, rollData.map(o => o.result_1[0]).join('$1'))
					.replace(/IDS\((.+?)\)/, rollData.map(o => o.id).join('$1'));
				freetext = outputStyle.makeCommandButton(commandName, commandText);
			}
			if ('send' in opts) {
				const command = (opts.send || '').replace(/~/g, '--')
					.replace(/RESULTS\((.+?)\)/, rollData.map(o => o.result_1[0]).join('$1'))
					.replace(/IDS\((.+?)\)/, rollData.map(o => o.id).join('$1'));
				sendChat('API', command);
			}
			if ('raw' in opts) {
				const rawData = rollData.map((o, i) => {
					const styled_1 = (o.raw_1 || []).map(x => outputStyle.makeInlineroll({
						results: {
							total: x
						}
					}, true)).join(' ');
					const styled_2 = (o.raw_2 || []).map(x => outputStyle.makeInlineroll({
						results: {
							total: x
						}
					}, true)).join(' ');
					return outputStyle.makeRow(o.pic, o.name, styled_1, o.roll2 ? styled_2 : '', i === lastIndex);
				});
				sendChat(opts.speaking, outputStyle.makeBox(checkName, opts.raw || '', '', rawData.join('')));
			}
			// Combine output
			const output = (opts.whisper ? '/w GM ' : '') +
				outputStyle.makeBox(checkName, opts.subheader, freetext, rolls.join(''));
			sendChat(opts.speaking, output);
		},
		handleConfig = (msg) => {
			const opts = parseOpts(recoverInlinerollFormulae(msg), ['import', 'add', 'delete', 'set']),
				throwError = error => handleError(msg.playerid, error);

			let output;
			if (!playerIsGM(msg.playerid)) {
				sendChatNoarchive(msg.playerid, 'Permission denied.');
				return;
			}
			if (opts.import) {
				if (opts.import in importData) {
					Object.assign(state.groupCheck.checkList, importData[opts.import]);
					state.groupCheck.importInfo = opts.import;
					output = `Data set ${opts.import} imported.`;
				}
				else throwError(`Data set ${opts.import} not found.`);
			}
			else if (opts.add) {
				const data = safeReadJSON(opts.add.replace(/\\(\[|\])/g, '$1$1').replace(/\\at/g, '@'));
				if (typeof data === 'object') {
					Object.entries(data).forEach(([key, value]) => {
						if (!(typeof value === 'object' && 'name' in value && typeof value.formula === 'string')) {
							delete data[key];
						}
					});
					Object.assign(state.groupCheck.checkList, data);
					output = `Checks added. The imported JSON was: <br>${htmlReplace(JSON.stringify(data))}`;
				}
				else throwError('Error reading input.');
			}
			else if (opts.delete) {
				if (opts.delete in state.groupCheck.checkList) {
					delete state.groupCheck.checkList[opts.delete];
					output = `Check ${opts.delete} deleted.`;
				}
				else throwError(`Check called ${opts.delete} not found.`);
			}
			else if (opts.set) {
				const kv = opts.set.split(/\s(.+)/);
				if (optsData.meta.str.includes(kv[0]) && optsData.meta.glob.includes(kv[0]))
					state.groupCheck.options[kv[0]] = kv[1];
				else if (kv[0] === 'ro') {
					if (optsData.list.ro.admissible.includes(kv[1]))
						state.groupCheck.options.ro = kv[1];
					else {
						throwError(`Roll option ${kv[1]} is invalid, sorry.`);
						return;
					}
				}
				else if (optsData.meta.bool.includes(kv[0]))
					state.groupCheck.options[kv[0]] = true;
				else if (optsData.meta.boolNeg.includes(kv[0])) {
					kv[0] = optsData.meta.bool[optsData.meta.boolNeg.indexOf(kv[0])];
					state.groupCheck.options[kv[0]] = false;
				}
				else {
					throwError('Command not understood.');
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
				initializeState(true);
				output = 'Everything is reset to factory settings.';
			}
			else if (opts.show) output = getConfigTable();
			else output = getHelp();
			if (output) sendChatBox(msg.playerid, output);
			return;
		},
		handleRolls = (msg) => {
			// Options processing
			let checkName, checkFormula, checkSpecial;
			let opts = parseOpts(recoverInlinerollFormulae(msg), optsData.meta.str);
			const checkCmd = Object.keys(state.groupCheck.checkList).find(x => x in opts),
				throwError = error => handleError(msg.playerid, error);
			// Help is useless, but on the off chance somebody will use this...
			if (opts.help) {
				sendChatBox(msg.playerid, getHelp());
				return;
			}

			// Print menu if we don't know what to roll
			if (!checkCmd && !opts.custom) {
				showCommandMenu(msg.playerid, opts);
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
				const kv = opts.custom.replace(/\\(\[|\])/g, '$1$1').replace(/\\at/g, '@').split(/,\s?/);
				if (kv.length < 2) {
					throwError("Custom roll format invalid.");
					return;
				}
				checkName = kv.shift();
				checkFormula = kv.join();
			}

			// Custom title
			if ('title' in opts) checkName = opts.title;

			// Remove invalid options and check commands from opts
			// Plug in defaults for unspecified options
			opts = Object.assign({}, state.groupCheck.options, _.pick(opts, optsData.meta.allopts));

			// Apply global modifier
			if (opts.globalmod) {
				if (checkFormula.search(/\]\](?=$)/) !== -1)
					checkFormula = checkFormula.replace(/\]\](?=$)/, ` + (${opts.globalmod}[global modifier])]]`);
				else checkFormula += ` + ${opts.globalmod}`;
			}
			// Replace placeholders
			checkFormula = replaceInput(checkFormula, opts.input);
			// Eliminate invalid roll option.
			if (!optsData.list.ro.admissible.includes(opts.ro)) {
				throwError(`Roll option ${opts.ro} is invalid, sorry.`);
				return;
			}
			// Get options into desired format
			opts.rollOption = (opts.ro === 'rollsetting') ? getRollOption : (() => opts.ro);
			opts.multi = (opts.multi > 1) ? parseInt(opts.multi) : 1;
			opts.speaking = (msg.playerid === 'API') ? 'API' : `player|${msg.playerid}`;

			// Get list of tokens
			const tokenIDs = opts.ids ? opts.ids.split(',').map(x => x.trim())
				: (msg.selected || []).map(obj => obj._id);

			// Transform tokens into nice data packages
			const rollData = tokenIDs.map(id => getObj('graphic', id))
				.filter(x => !!x)
				.map(token => processTokenRollData(token, checkFormula, checkSpecial, opts))
				.reduce((m, o) => {
					if (o)
						for (let i = 0; i < opts.multi; i++) m.push(Object.assign({}, o));
					return m;
				}, []);

			try {
				if (!opts.process) {
					const rolls = rollData.map((roll, index, list) => {
						const formula = opts.hideformula ? `[[${roll.formula}]]` : roll.formula;
						return outputStyle.makeRow(roll.pic, roll.name, formula, (roll.roll2 ? formula : ''), index === list.length - 1);
					}).join('');
					const output = (opts.whisper ? '/w GM ' : '') +
						outputStyle.makeBox(checkName, opts.subheader, '', rolls);
					sendChat(opts.speaking, output);
				}
				else {
					const sentFormula = rollData.map(o => `${o.formula}${o.roll2 ? `####${o.formula}` : ''}`)
						.join('<br>');
					sendChat('', sentFormula, msg => sendFinalMessage(msg, opts, checkName, rollData));
				}
			}
			catch (err) {
				const errorMessage = 'Something went wrong with the roll. The command you tried was:<br>' +
					`${msg.content}<br>The error message generated by Roll20 is:<br>${err}`;
				throwError(errorMessage);
			}
		},
		handleInput = (msg) => {
			if (msg.type === 'api') {
				if (msg.content.search(/^!group-check($|\s)/) !== -1) handleRolls(msg);
				else if (msg.content.search(/^!group-check-config\b/) !== -1) handleConfig(msg);
			}
		},
		registerEventHandlers = (() => on('chat:message', handleInput));

	return {
		checkInstall,
		registerEventHandlers
	};
})();

on('ready', () => {
	'use strict';
	groupCheck.checkInstall();
	groupCheck.registerEventHandlers();
});
