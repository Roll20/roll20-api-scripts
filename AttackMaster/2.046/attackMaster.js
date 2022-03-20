/**
 * attackMaster.js
 *
 * * Copyright 2020: Richard @ Damery.
 * Licensed under the GPL Version 3 license.
 * http://www.gnu.org/licenses/gpl.html
 * 
 * This script is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This script is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * The goal of this script is to create and automate aspects of melee and
 * ranged weapon attacks, initially for the ADnD 2e game in Roll20.
 * However, until Roll20 re-instates 3d dice rolling from APIs, development
 * will concentrate on other aspects of melee combat, such as AC management
 * 
 * v0.001  17/12/2020  Initial creation from MIBag.js
 * v0.002  05/02/2021  Added Armour Class management menu
 * v0.003  11/02/2021  If none of the players who control a character are
 *                     online, send messages to the GM instead
 * v0.004  04/04/2021  First version of new weapons system
 * v0.005  16/04/2021  Changed addWeapon to use table objects
 * v0.006  23/04/2021  Major development and tidying up
 * v0.007  25/04/2021  Attempt to automatically expand tables
 * v1.008  29/04/2021  First live release to L&F:WPM
 * v1.009  30/04/2021  Minor tweaks to make a little faster and
 *                     some bug fixes
 * v1.010  03/05/2021  Register with new commandMaster API
 * v1.011  07/05/2021  Handle more than 2 hands for weapons
 * v1.012  09/05/2021  Added support for dancing weapons, and weapon
 *                     damage type (S, P, B) 
 * v1.013  18/05/2021  Added a function to modify attributes of
 *                     a weapon in-hand, e.g. for a dancing weapon
 * v1.014  26/05/2021  Procedurised the parsing of weapon data, & changed 
 *                     critical hit & miss parameters to ch: & cm:
 * v1.015  28/05/2021  Fixed issue with triggering sheet workers, and 
 *                     got dancing weapons working
 * v1.016  02/06/2021  Fixed adding lines to the Quiver automatically
 * v1.017  03/06/2021  Added the Other Actions menu, detecting relevant
 *                     options based on player & character, and developed
 *                     Returning (recharging) and charged ammo
 * v1.018  10/06/2021  Commented out diagnostic logs
 * v1.019  17/06/2021  fixed filterWeapons() to correctly compare true names,
 *                     and amended sendResponse() to treat viewer PID as GM
 * v1.020  28/06/2021  Adapted chat message handling to use a switch statement 
 *                     and have a try/catch strategy for error capture and 
 *                     prevent the API falling over
 * v1.021  03/06/2021  Fixed errors in matching ranged weapons to valid ammo and 
 *                     updated the table management suite to not need chatSetAttr API
 * v1.022  04/06/2021  Updated MI field names to match MagicMaster API
 * v1.023  14/07/2021  Added optional monster attack specific speed so monster attack 
 *                     spec can now be 'Attk name,dmg roll,speed'. Speed reverts to
 *                     monster standard speed if not specified
 * v1.024  02/08/2021  Fixed parsing of Ammo types and super types to allow 
 *                     hyphens, underscores and spaces, which will be ignored
 * v1.025  25/08/2021  sendResponse() for tokens controlled by All Players now sends message
 *                     to all players, including the GM.
 * v1.026  29/08/2021  Changed the name of attack macros created on the Character Sheet
 *                     to warn DMs not to use them for attacks.  Also add attk message 
 *                     as additional parameter to attk API calls.
 * v1.027  11/09/2021  Amended weapon definition parsing to allow machine readable specs
 *                     to be placed between Roll Template brackets }}...{{ where they
 *                     will not be shown when reviewing human readable weapon specs
 * v1.028  27/09/2021  Swapped adding self-ammoed weapons to use addTableRow() to
 *                     add to the Quiver rather than tableSet() to avoid errors
 * v1.029  07/10/2021  Fixed using multi-line weapon specifications
 * v1.030  11/10/2021  Added armour class calculation scanning of the MI bag
 * v1.031  19/10/2021  Added monster class & level management for checking purposes,
 *                     added understanding of AC vs S,P & B damage, and
 *                     fixed some bugs in AC management.
 * v1.032  28/10/2021  Updated regExpressions for weapon specs to allow spaces before
 *                     attribute identifiers plus some other tweaks, and also implemented
 *                     multi-type weapon specs (search for include() 'melee' & 'ranged'
 *                     instead of equivalence) in addWeapon().
 * v1.033  04/11/2021  Fixed support for extended range weapons (ones that extend the 
 *                     range beyond that of the ammo default) and added support for
 *                     saving throws.
 * v1.034  04/11/2021  Implemented API database update system for Weapons & Armour, and
 *                     updated getThac0() to get Thac0_base field before Thac0 field.
 * v1.035  10/11/2021  Updated getThac0() to be getTokenValue() and work for token AC 
 *                     and HP as well.  Added flag to return the found object 
 *                     (or undefined) so that name of field can be obtained for targeting
 * v1.036  18/12/2021  Reduced fields object to only include fields used in AttackMaster API,
 *                     and added API handshaking to check if other APIs are loaded
 *                     Fixed DM-controlled NPC/creature saving throws to not be shown to Players
 *                     Give a feedback message to the player when changing weapon, as 
 *                     updating the weapon tables takes some time
 * v1.037  29/12/2021  Fixed bugs in --mod-weap and ammo that can be both self-ammo & ammo.
 *                     Added melee dmg types & superTypes. Fixed checkCSdb() bugs
 *                     Prioritised user-defined database items over provided ones
 *                     Added weapons required for spells (e.g. Ice Knife)
 * v1.038  08/01/2022  Added database indexing for improved performance
 *                     Changed data tags to reflect newest standard
 *                     Fixed bug relating to calculated AC0 when checking AC
 *                     Fixed ranged weapon magical to-hit bonus due to spells in operation
 * v1.039  23/01/2022  Fixed Spear definition for self-ammo-ed ranged weapon & added powerful-longsword
 *                     Fixed illegal characters not rendered by One-Click install
 *                     Added Bow mastery to do double damage at PB range (removed from specialist)
 * v1.040  02/02/2022  Added --config command and menu for DM to alter some API behavior.
 *                     Multiple weapon changes and additions
 * v1.041  18/02/2022  Fixed proficient() bug with non-proficient vs. restricted weapons
 * v1.042  24/02/2022  Fixed error in Database build incorrectly replacing special characters
 *                     Fixed bug with prioritising of user-defined database entries
 * v2.043  26/02/2022  Added one character able to "lend a hand" to another character to 
 *                     cooperate on using weapons (or other objects) that require more than 2 hands.
 *                     Also added Character Class Database to expose all rules relating to
 *                     a character's class, and allow them to be altered or new classes defined.
 * v2.044  02/03/2022  Created the Attacks-DB to expose attack calculations and enable DMs and game
 *                     creators to alter them as needed for their campaigns and rule sets.
 * v2.045  06/03/2022  Added saving throw data to Class specs using method that can also apply
 *                     to other database items.  Updated --check-saves function to include MIs
 *                     that affect saves.  Make database updates asynchronous to avoid invalid
 *                     "infinite loop" errors.  Added Creature character class.
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = 2.046,
		author = 'Richard @ Damery',
		pending = null;

	/*
	 * The fields object defines all the fields on a character sheet that the
	 * API uses.  These can be changed by the user **with caution**
	 * DO NOT change the name of each line in the object - this is what the API
	 * uses to find the name of the fields you want on the character sheet.
	 * ONLY CHANGE definitions within the '[...]' brackets.  Before the comma is
	 * the name of the field on the character sheet, and after the comma is the
	 * property used in the attribute object with that name.
	 * For REPEATING TABLE LINES: the table reference is in a definition named '..._table:'
	 * and consists of the reference name before the comma, and a flag defining if the
	 * first row of the table is the 'repeating_..._$0_' line (true) or a static field (false).
	 * Values in the table are then defined as separate definitions below the table
	 * reference definition e.g. 
	 *     MW_table: ['repeating_weapons',false],
	 *     MW_name:  ['weaponname','current'],
	 *     MW_speed: ['weapspeed','current'],
	 * means the MW (Melee Weapons) table has the following structure:
	 *     1st row:  weaponname.current, weapspeed.current
	 *     2nd row:  repeating_weapons_$0_weaponname.current, repeating_weapons_$0_weapspeed.current
	 *     3rd row:  repeating_weapons_$1_weaponname.current, repeating_weapons_$1_weapspeed.current
	 *     etc...
	 */

	const fields = Object.freeze({
		feedbackName:       'AttackMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
		defaultTemplate:    '2Edefault',
		commandMaster:		'!cmd',
		roundMaster:		'!rounds',
		MagicItemDB:        'MI-DB',
		WeaponDB:			'MI-DB',
		ClassDB:			'Class-DB',
		AttacksDB:			'Attacks-DB',
		ToHitRoll:			'1d20',
		SaveRoll:			'1d20',
		dbVersion:			['db-version','current'],
		Race:               ['race','current'],
		Expenditure:		['expenditure','current'],
		Strength:			['strength','current'],
		Dexterity:			['dexterity','current'],
		Constitution:		['constitution','current'],
		Intelligence:		['intelligence','current'],
		Wisdom:				['wisdom','current'],
		Charisma:			['charisma','current'],
		Fighter_class:      ['class1','current'],
		Wizard_class:		['class2','current'],
		Priest_class:		['class3','current'],
		Rogue_class:		['class4','current'],
		Psion_class:		['class5','current'],
		Fighter_level:      ['level-class1','current'],
		Wizard_level:       ['level-class2','current'],
		Priest_level:       ['level-class3','current'],
		Rogue_level:        ['level-class4','current'],
		Psion_level:        ['level-class5','current'],
		Monster_level:		['hitdice','current'],
		Monster_hpExtra:	['monsterhpextra','current'],
		Monster_int:		['monsterintelligence','current'],
		ClassWarriorList:	['spellmem','current'],
		ClassWizardList:	['spellmem2','current'],
		ClassPriestList:	['spellmem3','current'],
		ClassRogueList:		['spellmem4','current'],
		ClassPsionList:		['spellmem30','current'],
		ClassCreatureList:	['spellmem5','current'],
		Monster_hitDice:    ['hitdice','current'],
		Token_Thac0:		['bar2','value'],
		Token_MaxThac0:		['bar2','max'],
		Thac0_base:			['thac0-base','current'],
		Thac0:              ['thac0','current'],
		MonsterThac0:		['monsterthac0','current'],
		Token_HP:			['bar3','value'],
		Token_MaxHP:		['bar3','max'],
		HP:					['HP','current'],
		Token_AC:			['bar1','value'],
		Token_MaxAC:		['bar1','max'],
		MonsterAC:			['monsterarmor','current'],
		AC:					['AC','current'],
		Armour_normal:		['ACtouch','current'],
		Armour_missile:		['ACmissile','current'],
		Armour_surprised:	['ACsurprise','current'],
		Armour_back:		['ACback','current'],
		Armour_head:		['AChead','current'],
		Shieldless_normal:	['ACshieldless','current'],
		Shieldless_missile:	['ACshieldless-missile','current'],
		Shieldless_surprised:['ACshieldless-surprise','current'],
		Shieldless_back:	['ACshieldless-back','current'],
		Shieldless_head:	['ACshieldless-head','current'],
		Armourless_normal:	['ACarmourless','current'],
		Armourless_missile:	['ACarmourless-missile','current'],
		Armourless_surprised:['ACarmourless-surprise','current'],
		Armourless_back:	['ACarmourless-back','current'],
		Armourless_head:	['ACarmourless-head','current'],
		StdAC:				['StandardAC','current'],
		SlashAC:			['SlashAC','current'],
		PierceAC:			['PierceAC','current'],
		BludgeonAC:			['BludgeonAC','current'],
		StdMissileAC:		['StandardAC','max'],
		SlashMissileAC:		['SlashAC','max'],
		PierceMissileAC:	['PierceAC','max'],
		BludgeonMissileAC:	['BludgeonAC','max'],
		Saves_paralysis:	['partar','current'],
		Saves_poison:		['poitar','current'],
		Saves_death:		['deatar','current'],
		Saves_rod:			['rodtar','current'],
		Saves_staff:		['statar','current'],
		Saves_wand:			['wantar','current'],
		Saves_petrification:['pettar','current'],
		Saves_polymorph:	['poltar','current'],
		Saves_breath:		['breathtar','current'],
		Saves_spell:		['sptar','current'],
		Saves_modParalysis:	['parmod','current'],
		Saves_modPoison:	['poimod','current'],
		Saves_modDeath:		['deamod','current'],
		Saves_modRod:		['rodmod','current'],
		Saves_modStaff:		['stamod','current'],
		Saves_modWand:		['wanmod','current'],
		Saves_modPetrification:['petmod','current'],
		Saves_modPolymorph:	['polmod','current'],
		Saves_modBreath:	['breathmod','current'],
		Saves_modSpell:		['spmod','current'],
		Saves_monParalysis:	['monpartar','current'],
		Saves_monPoison:	['monpoitar','current'],
		Saves_monDeath:		['mondeatar','current'],
		Saves_monRod:		['monrodtar','current'],
		Saves_monStaff:		['monstatar','current'],
		Saves_monWand:		['monwantar','current'],
		Saves_monPetri:		['monpettar','current'],
		Saves_monPolymorph:	['monpoltar','current'],
		Saves_monBreath:	['monbretar','current'],
		Saves_monSpell:		['monspetar','current'],
		Magic_saveAdj:		['wisdef','max'],
		Strength_hit:       ['strengthhit','current'],
		Strength_dmg:       ['strengthdmg','current'],
		Magic_hitAdj:		['strengthhit','max'],
		Magic_dmgAdj:       ['strengthdmg','max'],
		Dex_missile:        ['dexmissile','current'],
		Dex_acBonus:		['dexdefense','current'],
		Wisdom_defAdj:		['wisdef','current'],
		Primary_weapon:		['weapno','current'],
		Prime_weapName:		['weapno','max'],
		NonProfPenalty:		['nonprof-penalty','current','0'],
		RelWeapPenalty:		['famil-penalty','current','0'],
		MW_table:           ['repeating_weapons',0],
		MW_name:            ['weaponname','current','-'],
		MW_type:			['weaponname','max',''],
		MW_range:			['range','current',''],
		MW_superType:		['range','max',''],
		MW_speed:           ['weapspeed','current',''],
		MW_dancing:			['weapspeed','max','0'],
		MW_noAttks:         ['attacknum','current','1'],
		MW_attkCount:       ['attacknum','max','0'],
		MW_adj:				['attackadj','current','0'],
		MW_strBonus:        ['strbonus','current','1'],
		MW_twoHanded:       ['twohanded','current','0'],
		MW_size:            ['size','current',''],
		MW_miName:          ['size','max',''],
		MW_profLevel:       ['prof-level','current','0'],
		MW_dancingProf:     ['prof-level','max','0'],
		MW_critHit:         ['crit-thresh','current','20'],
		MW_critMiss:        ['crit-thresh','max','1'],
		MW_slash:			['weaptype-slash','current','0'],
		MW_pierce:			['weaptype-pierce','current','0'],
		MW_bludgeon:		['weaptype-blunt','current','0'],
		Dmg_table:			['repeating_weapons-damage',0],
		Dmg_name:         	['weaponname1','current','-'],
		Dmg_miName:			['weaponname1','max',''],
		Dmg_adj:			['damadj','current','0'],
		Dmg_dmgSM:          ['damsm','current',''],
		Dmg_dmgL:           ['daml','current',''],
		Dmg_strBonus:       ['strBonus1','current','0'],
		Dmg_specialist:     ['specialist-damage','current','0'],
		Dmg_type:			['type','current',''],
		Dmg_superType:		['type','max',''],
		RW_table:           ['repeating_weapons2',0],
		RW_name:            ['weaponname2','current','-'],
		RW_type:			['weaponname2','max',''],
		RW_speed:           ['weapspeed2','current',''],
		RW_dancing:			['weapspeed2','max','0'],
		RW_noAttks:         ['attacknum2','current','1'],
		RW_attkCount:       ['attacknum2','max','0'],
		RW_adj:				['attackadj2','current','0'],
		RW_strBonus:        ['strbonus2','current','0'],
        RW_dexBonus:        ['dexbonus2','current','1'],
        RW_twoHanded:       ['twohanded2','current','1'],
		RW_profLevel:       ['prof-level2','current','0'],
		RW_dancingProf:     ['prof-level2','max','0'],
		RW_critHit:         ['crit-thresh2','current','20'],
		RW_critMiss:        ['crit-thresh2','max','1'],
		RW_size:            ['size2','current',''],
		RW_miName:          ['size2','max',''],
		RW_range:           ['range2','current',''],
		RW_slash:			['weaptype-slash2','current','0'],
		RW_pierce:			['weaptype-pierce2','current','0'],
		RW_bludgeon:		['weaptype-blunt2','current','0'],
		RW_superType:		['range2','max',''],
		RWrange_mod:		['rangemod-','current'],
		Ammo_table:         ['repeating_ammo',0],
		Ammo_name:          ['ammoname','current','-'],
		Ammo_type:			['ammoname','max',''],
		Ammo_strBonus:      ['strbonus3','current','0'],
		Ammo_adj:			['damadj2','current','0'],
		Ammo_attkAdj:       ['damadj2','max','0'],
		Ammo_reuse:			['reuse','current','0'],
		Ammo_setQty:		['reuse','max','0'],
		Ammo_dmgSM:         ['damsm2','current',''],
		Ammo_range:        	['damsm2','max',''],
		Ammo_dmgL:          ['daml2','current',''],
		Ammo_miName:        ['daml2','max',''],
		Ammo_qty:           ['ammoremain','current',''],
		Ammo_maxQty:		['ammoremain','max',''],
		WP_table:           ['repeating_weaponprofs',0],
		WP_name:            ['weapprofname','current','-'],
		WP_type:            ['weapprofname','max',''],
		WP_specialist:      ['specialist','current','0'],
		WP_mastery:         ['mastery','current','0'],
		SpellsCols:         3,
		Spells_table:       ['repeating_spells',false],
		Powers_table:       ['repeating_spells',false],
		MIRows:             100,
		Items_table:		['repeating_potions',0],
		Items_name:			['potion','current','-'],
		Items_trueName:		['potion','max',''],
		Items_speed:		['potion-speed','current','5'],
		Items_trueSpeed:	['potion-speed','max','5'],
		Items_qty:			['potionqty','current',''],
		Items_trueQty:		['potionqty','max',''],
		Items_cost:			['potion-macro','current','0'],
		Items_type:			['potion-macro','max','uncharged'],
		ItemContainerType:	['check-for-mibag','current'],
		ItemContainerSize:	['container-size','current'],
		ItemWeaponList:		['spellmem','current'],
		ItemArmourList:		['spellmem2','current'],
		ItemRingList:		['spellmem3','current'],
		ItemMiscList: 		['spellmem4','current'],
		ItemPotionList:		['spellmem10','current'],
		ItemScrollList:		['spellmem11','current'],
		ItemWandsList:		['spellmem12','current'],
		ItemDMList:			['spellmem13','current'],
		ItemAttacksList:	['spellmem5','current'],
		ItemMUspellsList:	['mi-muspells-','current'],
		ItemMUspellValues:	['mi-muspells-','max'],
		ItemPRspellsList:	['mi-prspells-','current'],
		ItemPRspellValues:	['mi-prspells-','max'],
		ItemPowersList:		['mi-powers-','current'],
		ItemPowerValues:	['mi-powers-','max'],
		ItemSelected:       ['MI-chosen', 'current'],
		ItemRowRef:			['MIrowref','current'],
		ItemCastingTime:    ['MIct', 'current'],
		CastingTimePrefix:  ['ct-','current'],
		Equip_leftHand:		['worn-Weapon1','current'],
		Equip_lendLeft:		['worn-Weapon1','max'],
		Equip_rightHand:	['worn-Weapon2','current'],
		Equip_lendRight:	['worn-Weapon2','max'],
		Equip_bothHands:	['worn-Hands','current'],
		Equip_lendBoth:		['worn-Hands','max'],
		Equip_handedness:	['handedness','current'],
		Equip_lentHands:	['handedness','max'],
		Equip_dancing:		['dancing-count','current'],
		Equip_takenInHand:	['Equip-inHand','current'],
		Equip_trueInHand:	['Equip-inHand','max'],
		InHand_table:		['repeating_inhand',0],
		InHand_name:		['dust','current','-'],
		InHand_trueName:	['dust','max',''],
		InHand_handedness:	['dustqty','current',1],
		InHand_index:		['dust-speed','current',''],
		Quiver_table:		['repeating_quiver',0],
		Quiver_name:		['scroll','current','-'],
		Quiver_trueName:	['scroll','max',''],
		Quiver_index:		['scroll-speed','current',''],
		MonsterCritHit:		['monstercrit','current'],
		MonsterCritMiss:	['monstercrit','max'],
		Monster_dmg1:		['monsterdmg','current'],
		Monster_dmg2:		['monsterdmg2','current'],
		Monster_dmg3:		['monsterdmg3','current'],
	});

	const PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	const messages = Object.freeze({
		noChar: '/w "gm" &{'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
		cursedSlot: '&{'+fields.defaultTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh what a shame.  No, you can\'t overwrite a cursed item with a different item.  You\'ll need a *Remove Curse* spell or equivalent to be rid of it!}}',
        cursedItem: '&{'+fields.defaultTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try putting this away, but is seems to be back where it was...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		PleaseWait: '**Please wait...** - processing is taking a while',
	});
	
	const MenuState = Object.freeze({
		ENABLED: false,
		DISABLED: true,
	});
	
	const Attk = Object.freeze({
		TO_HIT: 'TO_HIT',
		ROLL: 'ROLL',
		TARGET: 'TARGET',
	});
	
	const TwoWeapons = Object.freeze({
	    SINGLE: 0,
	    PRIMARY: 2,
	    SECONDARY: 4,
	    NOPENALTY: ['ranger'],
	});
	
	const BT = Object.freeze({
		MON_ATTACK: 'MON_ATTACK',
		MON_INNATE: 'MON_INNATE',
		MON_MELEE:  'MON_MELEE',
		BACKSTAB:   'BACKSTAB',
		MELEE:      'MELEE',
		MW_DMGSM:   'MW_DMGSM',
		MW_DMGL:    'MW_DMGL',
		MON_RANGED: 'MON_RANGED',
		RANGED:     'RANGED',
		RANGEMOD:   'RANGEMOD',
		RW_DMGSM:   'RW_DMGSM',
		RW_DMGL:    'RW_DMGL',
		MU_SPELL:   'MU_SPELL',
		PR_SPELL:   'PR_SPELL',
		POWER:      'POWER',
		MI_BAG:     'MI_BAG',
		ADD_MIROW:	'ADD_MIROW',
		EDIT_MI:	'EDIT_MI',
		EDITMI_OPTION:'EDITMI_OPTION',	
		CHOOSE_MI:	'CHOOSE_MI',
		REDO_CHOOSE_MI:'REDO_CHOOSE_MI',
		REVIEW_MI:	'REVIEW_MI',
		SLOT_MI:	'SLOT_MI',
		STORE_MI:	'STORE_MI',
		REMOVE_MI:	'REMOVE_MI',
		THIEF:      'THIEF',
		MOVE:       'MOVE',
		CHG_WEAP:   'CHG_WEAP',
		STAND:      'STAND',
		SPECIFY:    'SPECIFY',
		CARRY:      'CARRY',
		SUBMIT:     'SUBMIT',
		LEFT:		'LEFT',
		RIGHT:		'RIGHT',
		BOTH:		'BOTH',
		HAND:		'HAND',
		NOHANDS:	'NOHANDS',
		AUTO_ADD:	'AUTO_ADD',
		AUTO_DELETE:'AUTO_DELETE',
		AMMO:		'AMMO',
		SAVES:		'SAVES',
	});
	
	const tableIntro = Object.freeze({
		MELEE:['MW_',fields.MW_table],
		DMG:['Dmg_',fields.Dmg_table],
		RANGED:['RW_',fields.RW_table],
		AMMO:['Ammo_',fields.Ammo_table],
		WPROF:['WP_',fields.WP_table],
		MI:['Items_',fields.Items_table],
		SPELL:['Spells_',fields.Spells_table],
		POWER:['Powers_',fields.Powers_table],
		INHAND:['InHand_',fields.InHand_table],
		QUIVER:['Quiver_',fields.Quiver_table],
	});
	
	const stdDB = ['MU_Spells_DB','PR_Spells_DB','Powers_DB','MI_DB','MI_DB_Ammo','MI_DB_Armour','MI_DB_Light','MI_DB_Potions','MI_DB_Rings','MI_DB_Scrolls_Books','MI_DB_Wands_Staves_Rods','MI_DB_Weapons','Attacks_DB','Class_DB'];
	
	const dbNames = Object.freeze({
	MI_DB_Armour:	{bio:'<blockquote>Armour and Shields</blockquote><b>v5.8  09/03/2022</b><br><br>This Magic Item database holds definitions for Armour & Shields for the RPGMaster series APIs.',
					gmnotes:'<blockquote>Change Log:</blockquote><br>v5.8  09/03/2022  Added saving throw data to MIs that affect saves<br><br>v5.7  26/02/2022  Added in performance of armour vs. types of attack<br><br>v5.6  01/01/2022  Updated to common release version<br><br>v5.2 - 5.5 Skipped to even up version numbers<br><br>v5.1  29/10/2021  Encoded machine readable data to support API distribution of databases<br><br>v5.0  01/10/2021  Split MI-DB into separate databases for different types of Item. See MI-DB for earlier Change Log.',
					root:'MI-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/141800/VLyMWsmneMt4n6OBOLYn6A/max.png?1344434416',
					version:5.8,
					db:[{name:'-',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" This is a blank slot in your Magic Item bag. Go search out some new Magic Items to fill it up!'},
						{name:'Ankheg-Armour',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ankheg Armour}}{{subtitle=Armour}}{{Armour=+0 non-magical, constructed like Full Plate}}Specs=[Ankheg,Armour,0H,Plate]{{AC=[[0]]\nNaturally 0, no metal}}ACData=[a:Ankheg,st:Plate,+:0,ac:0,sz:L,wt:25,sp:0,rc:uncharged]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=Armour made from the shell of an Ankheg. Exceptionally durable, very light, and naturally AC0. Its construction does not involve any metal components.}}'},
						{name:'Armour',type:'',ct:'0',charge:'uncharged',cost:'0',body:'%{MI-DB-Armour|Magical-Armour}'},
						{name:'Armour-of-Resistance+3',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Field Plate Armour of Resistance+3}}{{subtitle=Magical Armour}}{{Armour=+3 selectively magical Field Plate}}Specs=[Armour-of-Resistance,Armour,0H,Plate]{{AC=[[2]][[0-3]]\nagainst Slashing damage}}ACData=[a:Armour-of-Resistance+3,t:Field-Plate, st:Plate,+S:6,+P:1,+B:0,+:0,ac:2,sz:L,wt:60,sp:0,rc:uncharged]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armour provides resistance to Slashing damage only.\nThis armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.\nFor each +1 bonus to armor, regardless of the type of armor, the wearer\'s Armor Class moves downward (toward AC 2 . . . to 1 . . . to 0, -1, -2, and so on). Note, however, that Armor Class can never be improved beyond -10.}}'},
						{name:'Armour-of-Vulnerability+-3',type:'Armour',ct:'0',charge:'cursed',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Field Plate Armour of Vulnerability+/-3}}{{subtitle=Cursed Armour}}{{Armour=+/-3 selectively magical Field Plate}}Specs=[Armour-of-Vulnerability|Armour-of-Resistance,Armour,0H,Plate]{{AC=[[2]][[0-3]] better AC against Slashing damage\n+[[3]] worse AC against any other type}}ACData=[a:Armour-of-Vulnerability+-3,t:Field-Plate,st:Mail,+S:6,+P:-2,+B:-3,ac:2,sz:L,wt:60,sp:0,rc:cursed]{{Speed=0}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=***Curse.*** This armor is cursed, a fact that is revealed only when an identify spell is cast on the armor or you attune to it. Attuning to the armor curses you until you are targeted by the remove curse spell or similar magic; removing the armor fails to end the curse. While cursed, you have vulnerability to two of the three damage types associated with the armor (not the one to which it grants resistance).}}{{desc1=This armour provides resistance to Slashing damage only, but vulnerability to Piercing and Bludgeoning damage. \nThis armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.\nFor each +1 bonus to armor, regardless of the type of armor, the wearer\'s Armor Class moves downward (toward AC 2 . . . to 1 . . . to 0, -1, -2, and so on). Note, however, that Armor Class can never be improved beyond -10}}'},
						{name:'Banded-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Banded Mail Armour}}{{subtitle=Armour}}{{Armour=Banded Mail armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]]\nvs all attacks}}ACData=[a:Banded-Mail,t:Banded-Mail,st:Mail,+S:2,+P:0,+B:1,+:0,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Banded-Mail+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Banded Mail +1}}{{subtitle=Magical Armour}}{{Armour=Banded Mail +1 armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]][[0-1]]\nvs all attacks}}ACData=[a:Banded-Mail+1,t:Banded-Mail,st:Mail,+S:2,+P:0,+B:1,+:1,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Banded-Mail+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Banded Mail +2}}{{subtitle=Magical Armour}}{{Armour=Banded Mail +2 armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]][[0-2]]\nvs all attacks}}ACData=[a:Banded-Mail+2,t:Banded-Mail,st:Mail,+S:2,+P:0,+B:1,+:2,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Banded-Mail+3',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Banded Mail Armour +3}}{{subtitle=Magical Armour}}{{Armour=+3 magical Mail armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]][[0-3]]\nvs all attacks}}ACData=[a:Banded-Mail+3,t:Banded-Mail,st:Mail,+S:2,+P:0,+B:1,+:3,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Body-Shield',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Body or Tower Shield}}{{subtitle=Shield}}{{Shield=1-handed body shield (also known as a tower shield) made of wood \\amp metal}}Specs=[Body Shield,Shield,1H,Shields]{{AC=+0, Body/Tower shield}}ACData=[a:Body Shield,t:Body-Shield,st:Shield,+:0,+M:1,sz:M,wt:15]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nThe *body shield* is a massive shield reaching nearly from chin to toe. It must be firmly fastened to the forearm and the shield hand must grip it at all times. It provides a great deal of protection, improving the Armor Class of the character by 1 against melee attacks and by 2 against missile attacks, for attacks from the front or front flank sides. It is very heavy; the DM may wish to use the optional encumbrance system if he allows this shield.}}'},
						{name:'Bracers-AC4',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bracers of Defense AC4}}{{subtitle=Magic Armour}}{{Armour=magical armour composed of a pair of bracers}}Specs=[Bracers,Armour,0H,Magic Item]{{AC=[[4]]}}ACData=[a:Bracers AC4,t:Magic-Bracers,st:Bracers,+:0,ac:4,sz:S,wt:0]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=These items appear to be wrist or arm guards. Their magic bestows an effective Armor Class equal to someone wearing armor and employing a shield. If armor is actually worn, the bracers have no additional effect, but they do work in conjunction with other magical items of protection. The Armor Class the bracers of defense bestow is determined by making a percentile roll and consulting the table}}'},
						{name:'Bracers-AC5',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bracers of Defense AC5}}{{subtitle=Magic Armour}}{{Armour=magical armour composed of a pair of bracers}}Specs=[Bracers,Armour,0H,Magic Item]{{AC=[[5]]}}ACData=[a:Bracers AC5,t:Magic-Bracers,st:Bracers,+:0,ac:5,sz:S,wt:0]{{Speed=[[0]]}}[ct:0,ty:uncharged]{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=These items appear to be wrist or arm guards. Their magic bestows an effective Armor Class equal to someone wearing armor and employing a shield. If armor is actually worn, the bracers have no additional effect, but they do work in conjunction with other magical items of protection. The Armor Class the bracers of defense bestow is determined by making a percentile roll and consulting the table}}'},
						{name:'Bracers-AC6',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bracers of Defense AC6}}{{subtitle=Magic Armour}}{{Armour=magical armour composed of a pair of bracers}}Specs=[Bracers,Armour,0H,Magic Item]{{AC=[[6]]}}ACData=[a:Bracers AC6,t:Magic-Bracers,st:Bracers,+:0,ac:6,sz:S,wt:0]{{Speed=[[0]]}}[ct:0,ty:uncharged]{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=These items appear to be wrist or arm guards. Their magic bestows an effective Armor Class equal to someone wearing armor and employing a shield. If armor is actually worn, the bracers have no additional effect, but they do work in conjunction with other magical items of protection. The Armor Class the bracers of defense bestow is determined by making a percentile roll and consulting the table}}'},
						{name:'Brigandine+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Brigandine +1 Armour}}{{subtitle=Armour}}{{Armour=Brigandine Armour +1}}Specs=[Brigandine,Armour,0H,Brigandine]{{AC=[[6]][[0-1]]\nagainst all attacks}}ACData=[a:Brigandine+1,t:Brigandine,st:Brigandine,+S:1,+P:1,+B:0,+:1,ac:6,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from small metal plates sewn or riveted to a layer of canvas or leather and protected by an outer layer of cloth. It is rather stiff and does not provide adequate protection to the joints where the metal plates must be spaced widely or left off.}}'},
						{name:'Brigandine+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Brigandine +2 Armour}}{{subtitle=Armour}}{{Armour=Brigandine Armour +2}}Specs=[Brigandine,Armour,0H,Brigandine]{{AC=[[6]][[0-2]]\nagainst all attacks}}ACData=[a:Brigandine+2,st:Brigandine,t:Brigandine,+S:1,+P:1,+B:0,+:2,ac:6,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from small metal plates sewn or riveted to a layer of canvas or leather and protected by an outer layer of cloth. It is rather stiff and does not provide adequate protection to the joints where the metal plates must be spaced widely or left off.}}'},
						{name:'Brigandine-Armour',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Brigandine Armour}}{{subtitle=Armour}}{{Armour=Brigandine Armour}}Specs=[Brigandine,Armour,0H,Brigandine]{{AC=[[6]]\nagainst all attacks}}ACData=[a:Brigandine,st:Brigandine,t:Brigandine,+S:1,+P:1,+B:0,+:0,ac:6,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from small metal plates sewn or riveted to a layer of canvas or leather and protected by an outer layer of cloth. It is rather stiff and does not provide adequate protection to the joints where the metal plates must be spaced widely or left off.}}'},
						{name:'Bronze-Plate+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bronze Plate Mail +1}}{{subtitle=Armour}}{{Armour=+1 magical plate mail made from bronze}}Specs=[Bronze Plate Mail,Armour,0H,Mail]{{AC=[[4]][[0-1]]\nagainst all attacks}}ACData=[a:Bronze Plate+1,st:Mail,t:Bronze-Plate,+S:2,+P:0,+B:-2,ac:4,+:1,sz:L,wt:45]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a plate mail armor--a combination of metal plates, chain mail or brigandine, leather and padding--made of softer bronze. It is easier and cheaper to make than steel armor, but it does not protect as well. A large breastplate and other metal plates cover areas of the body, but the other materials must protect the joints and movable parts of the body. It is not the full plate armor of the heavy knight of the Late Middle Ages and the Renaissance.}}'},
						{name:'Bronze-Plate+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bronze Plate Mail +2}}{{subtitle=Armour}}{{Armour=+2 magical plate mail made from bronze}}Specs=[Bronze Plate Mail,Armour,0H,Mail]{{AC=[[4]][[0-2]]\nagainst all attacks}}ACData=[a:Bronze Plate+2,st:Mail,t:Bronze-Plate,+S:2,+P:0,+B:-2,ac:4,+:2,sz:L,wt:45]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a plate mail armor--a combination of metal plates, chain mail or brigandine, leather and padding--made of softer bronze. It is easier and cheaper to make than steel armor, but it does not protect as well. A large breastplate and other metal plates cover areas of the body, but the other materials must protect the joints and movable parts of the body. It is not the full plate armor of the heavy knight of the Late Middle Ages and the Renaissance.}}'},
						{name:'Bronze-Plate-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bronze Plate Mail}}{{subtitle=Armour}}{{Armour=Plate mail made from bronze}}Specs=[Bronze Plate Mail,Armour,0H,Mail]{{AC=[[4]] against all attacks}}ACData=[a:Bronze Plate Mail,st:Mail,t:Bronze-Plate,+S:2,+P:0,+B:-2,ac:4,+:0,sz:L,wt:45]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a plate mail armor--a combination of metal plates, chain mail or brigandine, leather and padding--made of softer bronze. It is easier and cheaper to make than steel armor, but it does not protect as well. A large breastplate and other metal plates cover areas of the body, but the other materials must protect the joints and movable parts of the body. It is not the full plate armor of the heavy knight of the Late Middle Ages and the Renaissance.}}'},
						{name:'Buckler',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Buckler}}{{subtitle=Shield}}{{Shield=Hands-free shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shields]{{AC=+0 Buckler, against 1 attack only}}ACData=[a:Buckler,t:Buckler,st:Shield,+:0,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Buckler+1',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Buckler+1}}{{subtitle=Magical Shield}}{{Shield=Hands-free magical shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shields]{{AC=+1 Buckler, against 1 attack only}}ACData=[a:Buckler+1,t:Buckler,st:Shield,+:1,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Buckler+2',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Buckler+2}}{{subtitle=Magical Shield}}{{Shield=Hands-free magical shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shields]{{AC=+2 Buckler, against 1 attack only}}ACData=[a:Buckler+2,t:Buckler,st:Shield,+:2,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Buckler+3',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Buckler+3}}{{subtitle=Magical Shield}}{{Shield=Hands-free magical shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shields]{{AC=+3 Buckler, against 1 attack only}}ACData=[a:Buckler+3,t:Buckler,st:Shield,+:3,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Chain-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Chain Mail}}{{subtitle=Armour}}{{Armour=Chain Mail}}Specs=[Chain Mail,Armour,0H,Mail]{{AC=[[5]]\nvs all attacks}}ACData=[a:Chain Mail,st:Mail,t:Chain-Mail,+S:2,+P:0,+B:-2,+:0,ac:5,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}'},
						{name:'Chain-Mail+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Chain Mail +1}}{{subtitle=Magical Armour}}{{Armour=+1 magical chain mail}}Specs=[Chain mail,Armour,0H,Mail]{{AC=[[5]][[0-1]]\nvs all attacks}}ACData=[a:Chain Mail+1,st:Mail,t:Chain-Mail,+S:2,+P:0,+B:-2,+:1,ac:5,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}'},
						{name:'Chain-Mail+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Chain Mail +2}}{{subtitle=Magical Armour}}{{Armour=+2 magical chain mail}}Specs=[Chain mail,Armour,0H,Mail]{{AC=[[5]][[0-2]]\nvs all attacks}}ACData=[a:Chain Mail+2,st:Mail,t:Chain-Mail,+S:2,+P:0,+B:-2,+:2,ac:5,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}'},
						{name:'Field-Plate',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Field Plate}}{{subtitle=Armour}}{{Armour=Field plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]] against all attacks}}ACData=[a:Field Plate,st:Plate,t:Field-Plate,+S:3,+P:1,+B:0,ac:3,+:0,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Field-Plate+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Field Plate+1}}{{subtitle=Armour}}{{Armour=Magical Field plate +1}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]][[0-1]]\nagainst all attacks}}ACData=[a:Field Plate+1,st:Plate,t:Field-Plate,+S:3,+P:1,+B:0,ac:3,+:1,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Field-Plate+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Field Plate+2}}{{subtitle=Armour}}{{Armour=Magical Field plate +2}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]][[0-2]]\nagainst all attacks}}ACData=[a:Field Plate+2,st:Plate,t:Field-Plate,+S:3,+P:1,+B:0,ac:3,+:2,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Full-Plate',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Full-Plate Armour}}{{subtitle=Armour}}{{Armour=Full Plate}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]]\nagainst all attacks}}ACData=[a:Full Plate,st:Plate,t:Full-Plate,+S:4,+P:3,+B:0,+:0,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Full-Plate+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Full-Plate+1}}{{subtitle=Armour}}{{Armour=+1 magical Full Plate}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]][[0-1]]\nagainst all attacks}}ACData=[a:Full Plate+1,st:Plate,t:Full-Plate,+S:4,+P:3,+B:0,+:1,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Full-Plate+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Full-Plate+2}}{{subtitle=Armour}}{{Armour=+2 magical Full Plate}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]][[0-2]]\nagainst all attacks}}ACData=[a:Full Plate+2,st:Plate,t:Full-Plate,+S:4,+P:3,+B:0,+:2,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Helm-of-Languages',type:'Miscellaneous',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Helm of Comprehending Languages \\amp Reading Magic}}{{subtitle=Magic Item}}Specs=[Helm of Languages,Miscellaneous,0H,Helm]{{Speed=[[0]]}}ACData=[a:Helm of Languages,sp:0,rc:uncharged]{{Size=Medium}}{{Immunity=None}}{{desc=Appearing as a normal helmet, a helmet of comprehending languages and reading magic enables its wearer to understand 90% of strange tongues and writings and 80% of magical writings. (Note that these percentage figures apply to whether all or none of the speaking/writing or inscription is understandable. Understanding does not necessarily imply spell use.) This device is equal to a normal helmet of the type accompanying Armor Class 5.}}'},
						{name:'Hide-Armour',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hide Armour}}{{subtitle=Armour}}{{Armour=Hide Armour}}Specs=[Hide,Armour,0H,Hide]{{AC=[[6]]\nagainst all attacks}}ACData=[a:Hide,st:Hide,t:Hide,+S:0,+P:-2,+B:0,+:0,ac:6,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is armor prepared from the extremely thick hide of a creature (such as an elephant) or from multiple layers of regular leather. It is stiff and hard to move in.}}'},
						{name:'Hide-Armour+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hide Armour +1}}{{subtitle=Magical Armour}}{{Armour=Hide Armour +1}}Specs=[Hide,Armour,0H,Hide]{{AC=[[6]][[0-1]]\nagainst all attacks}}ACData=[a:Hide+1,st:Hide,t:Hide,+S:0,+P:-2,+B:0,+:1,ac:6,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is armor prepared from the extremely thick hide of a creature (such as an elephant) or from multiple layers of regular leather. It is stiff and hard to move in.}}'},
						{name:'Hide-Armour+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hide Armour +2}}{{subtitle=Magical Armour}}{{Armour=Hide Armour +2}}Specs=[Hide,Armour,0H,Hide]{{AC=[[6]][[0-2]]\nagainst all attacks}}ACData=[a:Hide+2,st:Hide,t:Hide,+S:0,+P:-2,+B:0,+:2,ac:6,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is armor prepared from the extremely thick hide of a creature (such as an elephant) or from multiple layers of regular leather. It is stiff and hard to move in.}}'},
						{name:'Indirect',type:'',ct:'0',charge:'uncharged',cost:'0',body:'@{'},
						{name:'Leather',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Leather Armour}}{{subtitle=Armour}}{{Armour=Leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]]\nagainst all attacks}}ACData=[a:Leather,st:Leather,t:Leather,+S:0,+P:-2,+B:0,+:0,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Leather+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Leather+1}}{{subtitle=Magical Armour}}{{Armour=+1 magical leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]][[0-1]]\nagainst all attacks}}ACData=[a:Leather+1,st:Leather,t:Leather,+S:0,+P:-2,+B:0,+:1,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Leather+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Leather+2}}{{subtitle=Magical Armour}}{{Armour=+2 magical leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]][[0-2]]\nagainst all attacks}}ACData=[a:Leather+2,st:Leather,t:Leather,+S:0,+P:-2,+B:0,+:2,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Leather-Armour',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Leather Armour}}{{subtitle=Armour}}{{Armour=Leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]]\nagainst all attacks}}ACData=[a:Leather,st:Leather,t:Leather,+S:0,+P:-2,+B:0,+:0,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Magical-Armour',type:'DMitem',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Magical Armour}}{{subtitle=Magical Armour}}Specs=[Magical Armour,DMitem,0H,Armour]{{Speed=[[0]]}}ACData=[w:Magical Armour]{{Size=Large}}{{Immunity=Unknown}}{{Resistance=+? on AC}}{{Saves=Unknown effect}}{{desc=This armour appears especially well made, and seems to glow somewhat if in a darkened area. Check with the DM as to what type of materials it seems to be made of}}'},
						{name:'Magical-Shield',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Magical Shield}}{{subtitle=Magical Armour}}{{Shield=+? on AC}}[Magical Shield,DMitem,1H,Shields]{{AC=AC [[0-1]] -?}}ACData=[a:Magical Shield,st:Shield,+:0,sz:M,wt:10]{{Speed=[[0]]}}{{Size=Medium (even if small)}}{{Immunity=Unknown}}{{Saves=Unknown effect}}{{desc=This shield seems to be exceptionally finely crafted, and gleams with hidden power. Check with the DM about its size and material components}}'},
						{name:'Magical-plate+0',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Plate +0}}{{subtitle=Magical Armour}}{{Armour=+0 magical armour (so resizes itself to fit}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]]\nagainst all attacks}}ACData=[a:Magical Plate+0,st:Plate,t:Full-Plate,+S:4,+P:3,+B:0,+:0,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Resistance=+[[0]] on AC}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Memorise-MI-Power',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --mem-spell MIPOWERS|@{selected|token_id}'},
						{name:'Padded-Armour',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Padded Armour}}{{subtitle=Armour}}{{Armour=Padded armour}}Specs=[Padded Armour,Armour,0H,Padded]{{AC=[[8]]\nagainst all attacks}}ACData=[a:Padded Armour,st:Padded,t:Padded,+S:0,+P:-2,+B:0,+:0,ac:8,sz:L,wt:10]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the simplest type of armor, fashioned from quilted layers of cloth and batting. It tends to get hot and after a time becomes foul with sweat, grime, lice, and fleas.}}'},
						{name:'Padded-Armour+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Padded Armour +1}}{{subtitle=Magical Armour}}{{Armour=Magical Padded armour +1}}Specs=[Padded Armour,Armour,0H,Padded]{{AC=[[8]][[0-1]]\nagainst all attacks}}ACData=[a:Padded Armour+1,st:Padded,t:Padded,,+S:0,+P:-2,+B:0,+:1,ac:8,sz:L,wt:10]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the simplest type of armor, fashioned from quilted layers of cloth and batting. It tends to get hot and after a time becomes foul with sweat, grime, lice, and fleas.}}'},
						{name:'Padded-Armour+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Padded Armour +2}}{{subtitle=Magical Armour}}{{Armour=Magical Padded armour +2}}Specs=[Padded Armour,Armour,0H,Padded]{{AC=[[8]][[0-2]]\nagainst all attacks}}ACData=[a:Padded Armour+2,st:Padded,t:Padded,+S:0,+P:-2,+B:0,+:2,ac:8,sz:L,wt:10]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the simplest type of armor, fashioned from quilted layers of cloth and batting. It tends to get hot and after a time becomes foul with sweat, grime, lice, and fleas.}}'},
						{name:'Plate+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Plate+1}}{{subtitle=Armour}}{{Armour=+1 magical field plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[2]][[0-1]] against all attacks}}ACData=[a:Field Plate +1,st:Plate,t:Field-Plate,+S:3,+P:1,+B:0,ac:2,+:1,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Plate+1+3-vs-Breath',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Plate+1, +3 vs Breath Weapons}}{{subtitle=Armour}}{{Armour=+1 Field Plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[2]][[0-1]] against all attacks}}ACData=[a:Field Plate+1+3 vs Breath,st:Plate,t:Field-Plate,+S:3,+P:1,+B:0,ac:2,+:1,sz:L,svbre:3,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=+[[3]] vs Breath Weapons}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Plate+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Plate+2}}{{subtitle=Armour}}{{Armour=+2 magical field plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]][[0-2]] against all attacks}}ACData=[a:Field Plate+2,st:Plate,t:Field-Plate,+S:3,+P:1,+B:0,ac:3,+:2,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Plate-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Plate Mail}}{{subtitle=Armour}}{{Armour=Plate mail made from steel}}Specs=[Plate Mail,Armour,0H,Mail]{{AC=[[3]] against all attacks}}ACData=[a:Plate Mail,st:Mail,t:Plate-Mail,+S:3,+P:0,+B:0,ac:3,+:0,sz:L,wt:50]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.}}'},
						{name:'Plate-Mail+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Plate Mail+1}}{{subtitle=Magical Armour}}{{Armour=Magical Plate Mail +1}}Specs=[Plate Mail,Armour,0H,Mail]{{AC=[[3]][[0-1]]\nagainst all attacks}}ACData=[a:Plate Mail+1,st:Mail,t:Plate-Mail,+S:3,+P:0,+B:0,ac:3,+:1,sz:L,wt:50]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.}}'},
						{name:'Plate-Mail+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Plate Mail+2}}{{subtitle=Magical Armour}}{{Armour=Magical Plate Mail +2}}Specs=[Plate Mail,Armour,0H,Mail]{{AC=[[3]][[0-2]]\nagainst all attacks}}ACData=[a:Plate Mail+2,st:Mail,t:Plate-Mail,+S:3,+P:0,+B:0,ac:3,+:2,sz:L,wt:50]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.}}'},
						{name:'Ring-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ring Mail}}{{subtitle=Armour}}{{Armour=Ring Mail}}Specs=[Ring Mail,Armour,0H,Mail]{{AC=[[7]]\nagainst all attacks}}ACData=[a:Ring Mail,st:Mail,t:Ring-Mail,+S:1,+P:1,+B:0,+:0,ac:7,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is an early (and less effective) form of chain mail in which metal rings are sewn directly to a leather backing instead of being interlaced. (Historians still debate whether this armor ever existed.)}}'},
						{name:'Ring-Mail+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ring Mail+1}}{{subtitle=Armour}}{{Armour=Magical Ring Mail+1}}Specs=[Ring Mail,Armour,0H,Mail]{{AC=[[7]][[0-1]]\nagainst all attacks}}ACData=[a:Ring Mail+1,st:Mail,t:Ring-Mail,+S:1,+P:1,+B:0,+:1,ac:7,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is an early (and less effective) form of chain mail in which metal rings are sewn directly to a leather backing instead of being interlaced. (Historians still debate whether this armor ever existed.)}}'},
						{name:'Ring-Mail+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ring Mail+2}}{{subtitle=Armour}}{{Armour=Magical Ring Mail+2}}Specs=[Ring Mail,Armour,0H,Mail]{{AC=[[7]][[0-2]]\nagainst all attacks}}ACData=[a:Ring Mail+2,st:Mail,t:Ring-Mail,+S:1,+P:1,+B:0,+:2,ac:7,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is an early (and less effective) form of chain mail in which metal rings are sewn directly to a leather backing instead of being interlaced. (Historians still debate whether this armor ever existed.)}}'},
						{name:'Scale-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scale Mail}}{{subtitle=Armour}}{{Armour=Scale Mail}}Specs=[Scale Mail,Armour,0H,Mail]{{AC=[[6]]\nagainst all attacks}}ACData=[a:Scale Mail,st:Mail,t:Scale-Mail,+S:0,+P:1,+B:0,+:0,ac:6,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish.}}'},
						{name:'Scale-Mail+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scale Mail+1}}{{subtitle=Magical Armour}}{{Armour=Magical Scale Mail+1}}Specs=[Scale Mail,Armour,0H,Mail]{{AC=[[6]][[0-1]]\nagainst all attacks}}ACData=[a:Scale Mail+1,st:Mail,t:Scale-Mail,+S:0,+P:1,+B:0,+:1,ac:6,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish.}}'},
						{name:'Scale-Mail+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scale Mail+2}}{{subtitle=Magical Armour}}{{Armour=Magical Scale Mail+2}}Specs=[Scale Mail,Armour,0H,Mail]{{AC=[[6]][[0-2]]\nagainst all attacks}}ACData=[a:Scale Mail+2,st:Mail,t:Scale-Mail,+S:0,+P:1,+B:0,+:2,ac:6,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish.}}'},
						{name:'Shield',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Medium Shield}}{{subtitle=Shield}}{{Shield=1-handed medium shield made of wood only}}Specs=[Wooden Shield,Shield,1H,Shields]{{AC=+0, Medium shield}}ACData=[a:Wooden Shield,t:Medium-Shield,st:Wooden-Shield,+:0,sz:M,wt:10]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						{name:'Shield+1',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shield+1}}{{subtitle=Shield}}{{Shield=1-handed +1 Medium Shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shields]{{AC=+[[1]] against all attacks from the front}}ACData=[a:Medium Shield+1,st:Shield,t:Medium Shield,+:1,sz:M,wt:10]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						{name:'Shield+2',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shield+2}}{{subtitle=Shield}}{{Shield=1-handed +2 Medium Shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shields]{{AC=+[[2]] against all attacks from the front}}ACData=[a:Medium Shield+2,st:Shield,t:Medium-Shield,+:2,sz:M,wt:10]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						{name:'Small-Shield+1',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Small Magical Shield+1}}{{subtitle=Shield}}{{Shield=1-handed +1 Small Shield made of wood \\amp metal}}Specs=[Small Shield,Shield,1H,Shields]{{AC=+[[1]] against only 2 attacks from the front}}ACData=[a:Small Shield+1,t:Small-Shield,st:Shield,+:1,sz:M,wt:5]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*A small shield* is carried on the forearm and gripped with the hand. Its light weight permits the user to carry other items in that hand (although he cannot use weapons). *It can be used to protect against **only** two frontal attacks of the user\'s choice.*}}'},
						{name:'Small-metal-shield+1',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Small Metal Shield+1 made of metal \\amp some wood}}{{subtitle=Shield}}{{Shield=1-handed +1 Small Metal Shield}}Specs=[Small Metal Shield,Shield,1H,Shields]{{AC=+[[1]] against only 2 attacks from the front}}ACData=[a:Small Metal Shield+1,t:Small-Shield,st:Shield,+:1,sz:M,wt:5]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*A small shield* is carried on the forearm and gripped with the hand. Its light weight permits the user to carry other items in that hand (although he cannot use weapons). *It can be used to protect against **only** two frontal attacks of the user\'s choice.*}}'},
						{name:'Small-wood-shield+1',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Small Wooden Shield+1}}{{subtitle=Shield}}{{Shield=1-handed +1 Small Wooden Shield}}Specs=[Small Wooden Shield,Shield,1H,Wooden Shields]{{AC=+[[1]] against only 2 attacks from the front}}ACData=[a:Small Wooden Shield+1,t:Small-Shield,st:Wooden Shield,+:1,sz:M,wt:4]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*A small shield* is carried on the forearm and gripped with the hand. Its light weight permits the user to carry other items in that hand (although he cannot use weapons). *It can be used to protect against **only** two frontal attacks of the user\'s choice.*}}'},
						{name:'Splint-Mail',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Splint Mail}}{{subtitle=Armour}}{{Armour=Splint Mail}}Specs=[Splint Mail,Armour,0H,Mail]{{AC=[[4]]\nvs all attacks}}ACData=[a:Splint Mail,st:Mail,t:Splint-Mail,+S:0,+P:1,+B:2,+:0,ac:4,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=The existence of this armor has been questioned. It is claimed that the armor is made of narrow vertical strips riveted to a backing of leather and cloth padding. Since this is not flexible, the joints are protected by chain mail.}}'},
						{name:'Splint-Mail+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Splint Mail+1}}{{subtitle=Magical Armour}}{{Armour=Magical Splint Mail+1}}Specs=[Splint Mail,Armour,0H,Mail]{{AC=[[4]][[0-1]]\nvs all attacks}}ACData=[a:Splint Mail+1,st:Mail,t:Splint-Mail,+S:0,+P:1,+B:2,+:1,ac:4,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=The existence of this armor has been questioned. It is claimed that the armor is made of narrow vertical strips riveted to a backing of leather and cloth padding. Since this is not flexible, the joints are protected by chain mail.}}'},
						{name:'Splint-Mail+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Splint Mail+2}}{{subtitle=Magical Armour}}{{Armour=Magical Splint Mail+2}}Specs=[Splint Mail,Armour,0H,Mail]{{AC=[[4]][[0-2]]\nvs all attacks}}ACData=[a:Splint Mail+2,st:Mail,t:Splint-Mail,+S:0,+P:1,+B:2,+:2,ac:4,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=The existence of this armor has been questioned. It is claimed that the armor is made of narrow vertical strips riveted to a backing of leather and cloth padding. Since this is not flexible, the joints are protected by chain mail.}}'},
						{name:'Studded-Leather',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Studded Leather Armour}}{{subtitle=Armour}}{{Armour=Studded leather armour}}Specs=[Studded Leather,Armour,0H,Leather]{{AC=[[7]]\nagainst all attacks}}ACData=[a:Studded Leather,st:Studded-Leather,t:Studded-Leather,+S:2,+P:1,+B:0,+:0,ac:7,sz:L,wt:25]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from leather (not hardened as with normal leather armor) reinforced with close-set metal rivets. In some ways it is very similar to brigandine, although the spacing between each metal piece is greater.}}'},
						{name:'Studded-Leather+1',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Studded Leather+1}}{{subtitle=Magical Armour}}{{Armour=+1 magical studded leather armour}}Specs=[Studded Leather,Armour,0H,Leather]{{AC=[[7]][[0-1]]\nagainst all attacks}}ACData=[a:Studded Leather+1,st:Studded-Leather,t:Studded-Leather,+S:2,+P:1,+B:0,+:1,ac:7,sz:L,wt:25]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from leather (not hardened as with normal leather armor) reinforced with close-set metal rivets. In some ways it is very similar to brigandine, although the spacing between each metal piece is greater.}}'},
						{name:'Studded-Leather+2',type:'Armour',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Studded Leather+2}}{{subtitle=Magical Armour}}{{Armour=+2 magical studded leather armour}}Specs=[Studded Leather,Armour,0H,Leather]{{AC=[[7]][[0-2]]\nagainst all attacks}}ACData=[a:Studded Leather+2,st:Studded-Leather,t:Studded-Leather,+S:2,+P:1,+B:0,+:2,ac:7,sz:L,wt:25]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from leather (not hardened as with normal leather armor) reinforced with close-set metal rivets. In some ways it is very similar to brigandine, although the spacing between each metal piece is greater.}}'},
						{name:'Tower-Shield',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Tower or Body Shield}}{{subtitle=Shield}}{{Shield=1-handed tower shield (also known as a body shield) made of wood \\amp metal}}Specs=[Tower Shield,Shield,1H,Shields]{{AC=+0, Tower/Body shield}}ACData=[a:Tower Shield,t:Body-Shield,st:Shield,+:0,+M:1,sz:M,wt:15]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nThe *body shield* is a massive shield reaching nearly from chin to toe. It must be firmly fastened to the forearm and the shield hand must grip it at all times. It provides a great deal of protection, improving the Armor Class of the character by 1 against melee attacks and by 2 against missile attacks, for attacks from the front or front flank sides. It is very heavy; the DM may wish to use the optional encumbrance system if he allows this shield.}}'},
						{name:'Unknown-Bracers',type:'DMitem',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Bracers}}{{subtitle=Bracers}}{{Armour=Unknown Bracers}}Specs=[Unknown Bracers,DMitem,0H,Bracers]{{save=Unknown}}ACData=[a:Unknown Bracers,st:Bracers,t:Magical-Bracers,+:0,sz:S,wt:1]{{desc=The powers of these bracers are unknown. In fact, are they magical bracers at all, or just of fine quality and just treasure?}}'},
						{name:'Wooden-Shield',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Medium Wooden Shield}}{{subtitle=Shield}}{{Shield=1-handed medium shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shields]{{AC=+0, Medium shield}}ACData=[a:Medium Shield,st:Shield,t:Medium-Shield,+:0,sz:M,wt:10]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
					]},
	MI_DB_Weapons:	{bio:'<blockquote>Weapons Database</blockquote><b>v5.10  28/02/2022</b><br><br>This sheet holds definitions of weapons that can be used in the redMaster API system.  They are defined in such a way as to be lootable and usable magic items for MagicMaster and also usable weapons in attackMaster.',
					gmnotes:'<blockquote>Change Log:</blockquote>v5.10  28/02/2022  Added Shillelagh as a magical weapon to support Priest spell<br><br>v5.9  20/02/2022  Pluralised weapon groups that had the same name as a weapon type (e.g. club and clubs) to add clarity in weapon proficiencies<br><br>v5.8  04/02/2022  Added Scimitar+3<br><br>v5.7  17/01/2022  Corrected multiple weapon definitions to ensure consistency.<br><br>v5.6  01/01/2022  Added summoned weapons needed for spells, such as Rainbow & Ice Knife<br><br>v5.5  05/11/2021  Split the Ammo and Weapons databases<br><br>v5.4  31/10/2021  Further encoded using machine readable data to support API databases<br><br>v5.3.4  21/08/2021  Fixed incorrect damage for all types of Two-handed Sword<br><br>v5.3.3  07/06/2021  Added the missing Scimitar macro<br><br>v5.3.2  31/05/2021  Cleaned ranged weapon ranges, as specifying a range for the weapon in the {{To-Hit=...}} section will now adjust the range of the ammo by that amount (for extended range weapons).  Self-ammoed weapons (like thrown daggers) should specify their range in the {{Range=...}} section.<br><br>v5.3.1  19/05/2021  Fixed a couple of bugs, missing weapons in the transfer from MI-DB<br><br>v5.3  14/05/2021  All standard weapons from the PHB now encoded.<br><br>v5.2  12/05/2021  Added support for weapon types (S,P,B), and more standard weapons<br><br>v5.1  06/05/2021  Added a number of standard and magical weapons<br><br>v5.0  28/04/2021  Initial separation of weapons listings from the main MI-DB',
					root:'MI-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
					version:6.01,
					db:[{name:'Acorn-Fire-Seed',type:'Ranged',ct:'2',charge:'charged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Acorn Fire Seed (spell)}}{{subtitle=Thrown magical seed}}{{Speed=[[2]]}}{{Size=Tiny}}{{Weapon=1-handed ranged dart}}Specs=[Acorn-Fire-Seed,Ranged,1H,Dart]{{To-hit=+0, + Dex bonuses}}ToHitData=[w:Acorn Fire Seed,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:T,ty:B,sp:2,rc:charged]{{Attacks=1 per round, + specialisation \\amp level, Fire burst}}{{Ammo=+0, vs. SM:2d8, L:2d8 in 10ft dia. from fire}}AmmoData=[w:Acorn Fire Seed,t:Acorn Fire Seed,st:Dart,sb:0,+:0,ru:-1,SM:2d8,L:2d8]{{Range=S:40, M:40, L:40}}RangeData=[t:Acorn Fire Seed,+:0,r:40]{{desc=The Fire Seed spell turns up to four acorns into special grenadelike missiles that can be hurled up to 40 yards. An attack roll is required to strike the intended target, and proficiency penalties are considered. Each acorn bursts upon striking any hard surface, causing 2d8 points of damage and igniting any combustible materials within a [10-foot diameter](!rounds --aoe @{selected|token_id}|circle|feet|120|10||fire) of the point of impact. If a successful saving throw vs. spell is made, a creature within the burst area receives only one-half damage, but a creature struck directly suffers full damage (i.e., no saving throw)}}'},
						{name:'Awl-Pike',type:'Melee',ct:'13',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Awl Pike}}{{subtitle=Polearm}}{{Speed=[[13]]}}Speed=[13,uncharged]{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Awl Pike,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Awl Pike,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:12-20,sp:13,rc:uncharged]{{Attacks=1 per 2 rounds + specialisation \\amp level, Piercing}}{{Damage=SM:1d6, L:1d12, + Str Bonus}}DmgData=[w:Awl Pike,sb:1,+:0,SM:1d6,L:1d12]{{desc=This is a normal Awl Pike, a type of Polearm. The point is sharp and keen, but nothing special. However, it still does double damage when set to receive a charge.\nEssentially this is a long spear 12 to 20 feet long ending in a spike point of tapered spear head. It was a popular weapon during the Renaissance. Since the pike stuck out in front, men could be packed side-by-side in dense formations, and several rows of men could fight. Large blocks of pikemen made formidable troops. However, once the pikemen engaged in close combat, they normally dropped their clumsy awl pikes and fought hand-to-hand with short swords.}}'},
						{name:'Bardiche',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bardiche}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Bardiche,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bardiche,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:5-8,sp:9,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+0, SM:1d6, L:1d12, + Str Bonus}}DmgData=[w:Awl Pike,sb:1,+:0,SM:1d6,L:1d12]{{desc=This is a normal Bardiche, a type of Polearm. The point is sharp and keen, but nothing special.\nOne of the simplest of polearms, the bardiche is an elongated battle axe. A large curving axe-head is mounted on the end of a shaft 5 to 8 feet long. It probably grew out of common peasant tools and was popular with them. One relative disadvantage is that the bardiche required more space to wield than a pike or a spear.}}'},
						{name:'Bastard-Sword',type:'Melee|Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bastard Sword}}{{subtitle=Sword}}{{Speed=1H [[6]], 2H [[8]]}}{{Size=Medium}}{{Weapon=1 or 2-handed melee long blade}}Specs=[Bastard-sword, Melee, 1H, Long-blade],[Bastard-sword, Melee, 2H, Long-blade]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bastard-Sword, sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:6,rc:uncharged],[w:Bastard-Sword 2H,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:8]}}{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Bastard-Sword,sb:1,+:0,SM:1d8,L:1d12],[w:Bastard-Sword 2H,sb:1,+:0,SM:2d4,L:2d8]}}{{desc=This is a normal sword. The blade is sharp and keen, but nothing out of the ordinary.}}'},
						{name:'Bastard-Sword+1',type:'Melee|Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bastard Sword+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1 or 2-handed melee long blade}}Specs=[Bastard-sword,Melee,1H,Long-blade],[Bastard-sword,Melee,2H,Long-blade]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Bastard Sword+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:6,rc:uncharged],[w:Bastard Sword 2H+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:8,,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+1, 1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Bastard Sword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Bastard Sword 2H+1,sb:1,+:1,SM:2d4,L:2d8]{{desc=This is a normal magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Bastardsword-of-Adaptation+1',type:'Melee|Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bastardsword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1- or 2-handed melee long-blade}}Specs=[Bastard-sword,Melee,1H,Long-blade],[Bastard-sword,Melee,2H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Bastardsword of Adapt+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:6],[w:Bastardsword of Adapt 2H+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:8]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1,\n **1H:** SM:1d8, L:1d12\n**2H:** SM:2d4, L:2d8\n+ Str bonus}}DmgData=[w:Bastardsword of Adapt+1,sb:1,+:1,SM:1d8,L:1d12],[w:Bastardsword of Adapt 2H+1,sb:1,+:1,SM:2d4,L:2d8]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Battle-Axe',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Battle Axe}}{{subtitle=Axe}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee axe}}Specs=[Battle-Axe,Melee,1H,Axe]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Battle Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:7,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+0, SM:1d8, L:1d12 + Str Bonus}}DmgData=[w:Battle Axe,sb:1,+:0,SM:1d8,L:1d12]{{desc=A standard Battle Axe of good quality, but nothing special}}'},
						{name:'Battle-Axe+1',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Battle Axe+1}}{{subtitle=Magic Weapon}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee axe}}Specs=[Battle-Axe,Melee,1H,Axe]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Battle Axe+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:7,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+1, SM:1d8, L:1d12 + Str Bonus}}DmgData=[w:Battle Axe,sb:1,+:1,SM:1d8,L:1d12]{{desc=A standard Battle Axe of fine quality, good enough to be enchanted to be a +1 magical weapon}}'},
						{name:'Bec-de-Corbin',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bec de Corbin}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee pole arm}}Specs=[Bec de Corbin,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bec de Corbin,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PB,r:8,sp:9,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, piercing \\amp bludgeoning}}{{Damage=+0+Str Bonus, SM:1d8, L:1d6}}DmgData=[w:Bec de Corbin,sb:1,+:0,SM:1d8,L:1d6]{{desc=This is a normal Bec de Corbin, a type of Polearm, especially good against politicians of a certain persuasion. The point is sharp and keen, but nothing special.\nThis was a highly specialized weapon of the upper classes during the Late Middle Ages and the early Renaissance. It is an early can-opener designed specifically to deal with plate armor. The pick or beak is made to punch through plate, while the hammer side can be used to give a stiff blow. The end is fitted with a short blade for dealing with unarmored or helpless foes. The weapon is about eight feet long. Since the weapon relies on impact, a great deal of swinging space is needed.}}'},
						{name:'Bill-guisarme',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bill-guisarme}}{{subtitle=Polearm}}{{Speed=[[10]]}}{{Size=Large}}{{Weapon=2-handed melee pole arm}}Specs=[Bill-guisarme,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bill-guisarme,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:7-8,sp:10,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Piercing \\amp Slashing}}{{Damage=+0+Str Bonus, SM:2d4, L:1d10}}DmgData=[w:Bill-guisarme,sb:1,+:0,SM:2d4,L:1d10]{{desc=This is a normal Bill-guisarme, a type of Polearm. The point is sharp and keen, but nothing special.\nA particularly bizarre-looking combination weapon, the bill-guisarme is an outgrowth of the common bill hook. Mounted on a seven- to eight-foot-long pole, it has a combination of a heavy cleaver blade, a jutting back spike, and a hook or spike on the end. Thus, it can be used in several different ways. Like most polearms, it requires lots of room to use.}}'},
						{name:'Blackrazor',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Blackrazor\nIntelligent, Chaotic Neutral}}{{subtitle=Magic Sword}}{{Speed=[[8]]}}{{Size=M}}{{Weapon=2-handed melee Greatsword}}Specs=[Greatsword,Melee,2H,Long-blade],[Greatsword,Melee,2H,Long-blade]{{To-hit=+3 + Str Bonus}}ToHitData=[w:Blackrazor, sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:S,r:5,sp:8,rc:uncharged],[w: Blackrazor vs Undead,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:S,r:5,sp:8,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+3 + Str Bonus, SM:2d6, L:2d10, drain HP on kill, -ve vs. Undead}}DmgData=[w:Blackrazor,sb:1,+:3,SM:2d6,L:2d10],[[w:Blackrazor vs Undead,sb:1,SM:0-1d10,L:0-1d10]{{resistance=Charm \\amp Fright (e.g. *Spook, Fear*)}}WeapData=[w:Blackrazor,ns:1][cl:PW,w:Blackrazor-Haste,sp:3,lv:12,pd:1]{{saves=Advantage on To-Hit, Saves \\amp NWP roles}}{{desc=**Blackrazor:** Weapon (greatsword), legendary (requires attunement by a creature of non-lawful alignment)\n\n**Attacks:** +3 on attack and damage\n**Devour Soul:** If reduce target to [[0]] HP, you get temporary HP equal to slain creature\'s HP max (subsequent kills overwrite). HP fade after Long Rest. While have temporary HP and *Blackrazor* is in hand, have advantage on attacks, saves, and NWP checks - roll d20 twice \\amp take best roll.\n**Undead:** If hit undead, you take [1d10](!\\amp#13;\\amp#47;r 1d10) necrotic damage, target regains the HP you loose. If this necrotic damage reduces you to 0 hit points, *Blackrazor* devours your soul.\n**Soul Hunter:** While held, you are aware of Tiny or larger creatures within [[60]] feet, not constructs or undead.\n**Immunity:** Can\'t be *charmed* or *frightened*.\n[Haste](!magic --mi-power @{selected|token_id}|Blackrazor-Haste|Blackrazor|12) 1/day ***It*** decides to cast and maintains concentration on it so that you don\'t have to.\n\nFor full detail, **[click here to see Blackrazor](http://journal.roll20.net/handout/-Kdm2Y9fzQXxv-4v6a-G)** handout}}'},
						{name:'Blowgun',type:'Ranged',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Blowgun}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed ranged blowgun}}Specs=[Blowgun,Ranged,1H,Blowgun]{{To-hit=+0 +Dex Bonus}}ToHitData=[w:Blowgun,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:5,rc:uncharged]{{Attacks=2 per round + specialisation \\amp level, Piercing}}{{desc=This is a normal blowgun. The tube is clean and smooth, but nothing special.}}'},
						{name:'Broadsword',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Broadsword}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handled melee long blade}}Specs=[Broad sword,Melee,1H,Long-blade]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Broadsword,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged]{{Attack=1 per round + specialisation \\amp level, Slashing}}{{Damage=+0 + Str Bonus, \nvs. SM:2d4, L:1+1d6}}DmgData=[w:Broadsword,sb:1,+:0,SM:2d4,L:1+1d6]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Club',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Club}}{{subtitle=Bludgeoning Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Club,Melee,1H,Clubs]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Club,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Bludgeoning}}{{Damage=+0 + Str Bonus, vs SM:1d6, L:1d3}}DmgData=[w:Club,sb:1,+:0,SM:1d6,L:1d3]{{desc=This is a good but ordinary club. The wood is hard and heavy, but somewhat dull with smears of something brown.}}'},
						{name:'Club+1',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Club+1}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Club,Melee,1H,Clubs]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Club,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Bludgeoning}}{{Damage=+1 + Str Bonus, vs SM:1d6, L:1d3}}DmgData=[w:Club,sb:1,+:1,SM:1d6,L:1d3]{{desc=This is a magical club. The wood is hard and heavy with a silvery sheen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Composite-Longbow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Composite Longbow}}{{subtitle=Bow}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Composite-Longbow,Ranged,2H,Bow]{{To-hit=+0 + any ammo, Dex and Str bonuses}}ToHitData=[w:Composite Longbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:7,rc:uncharged]{{Attacks=2 per round regardless of level or specialisation}}{{desc=This is a composite longbow (otherwise known as a Recurve Bow). The limbs have well-bonded laminations of good quality wood, which make it strong and flexible, but nothing special}}'},
						{name:'Composite-Longbow+1',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Composite Longbow+1}}{{subtitle=Magic Bow}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Composite-Longbow,Ranged,2H,Bow]{{To-hit=+1 + any ammo, Dex \\amp Str bonuses}}ToHitData=[w:Composite Longbow+1,sb:1,db:1,+:1,n:2,ch:20,cm:1,sz:L,ty:P,r:=+0/+2/+2/+2,sp:8,rc:uncharged]{{Attacks=2 per round regardless of level or specialisation}}{{desc=This is a magical longbow. The limbs are strong enough to add strength bonuses, and increase Short, Medium and Long range for each type of ammunition by 20 (PB remains at 30). Any bow string that is strung immediately seems like fine silver, and is a delight to draw. It is a +[[1]] magical weapon at all times, which counts even if using normal arrows.}}'},
						{name:'Composite-Shortbow',type:'Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Composite Shortbow}}{{subtitle=Bow}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=2-handed ranged bow}}Specs=[Composite-Shortbow,Ranged,2H,Bow]{{To-hit=+0 + any ammo, Dex \\amp Str bonuses}}ToHitData=[w:Composite Shortbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:6,rc:uncharged]{{Attacks=2 per round regardless of level or specialisation}}{{desc=This is a composite shortbow (otherwise known as a Recurve Bow). The limbs have well-bonded laminations of good quality wood, which make it strong and flexible, but nothing special}}'},
						{name:'Dagger',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger}}{{subtitle=Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+0 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger,sb:1,+:0,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+0, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger,sb:1,+:0,SM:1d4,L:1d3],[ ]}}{{Ammo=+0, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger,t:Dagger,st:Dagger,sb:1,+:0,SM:1d4,L:1d3,]}}{{Range=S:10, M:20, L:30}}RangeData=[t:Dagger,+:0,r:1/2/3]{{desc=A standard Dagger of good quality, but otherwise ordinary}}'},
						{name:'Dagger+1',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger+1}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+1 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger+1,sb:1,+:1,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+1,sb:1,db:1,+:1,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+1, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+1,sb:1,+:1,SM:1d4,L:1d3],[]}}{{Ammo=+1, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+1,t:Dagger,st:Dagger,sb:1,+:1,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:1,r:-/1/2/3]{{desc=A standard Dagger of fine quality, good enough to be enchanted to be a +1 magical weapon}}'},
						{name:'Dagger+2',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger+2}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+2 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+2,sb:1,+:2,SM:1d4,L:1d3],[]{{Ammo=+2, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+2,t:Dagger,st:Dagger,sb:1,+:2,SM:1d4,L:1d3]}}{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:2,r:-/1/2/3]{{desc=A standard Dagger Axe of fine quality, good enough to be enchanted to be a +2 magical weapon}}'},
						{name:'Dagger+3',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger+3}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+3 + Str Bonus (or Dex if thrown)}}ToHitData=[w:Dagger+3,sb:1,+:3,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+3,sb:1,db:1,+:3,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]}}{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+3, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+3,sb:1,+:3,SM:1d4,L:1d3],[]{{Ammo=+3, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+3,t:Dagger,st:Dagger,sb:1,+:3,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:3,r:-/1/2/3]{{desc=A standard Dagger Axe of fine quality, good enough to be enchanted to be a +3 magical weapon}}'},
						{name:'Dagger-Elf-Slayer',type:'Melee|Melee|Ranged|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger+2 +4 vs Elves}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade],[Dagger,Ranged,1H,Throwing-blade]}}{{To-hit=+2, +4 vs Elves + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+4 vs Elves,sb:1,+:4,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged],[w:Dagger+4 vs Elves,sb:1,db:1,+:4,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, +4 vs Elves, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+2,sb:1,+:2,SM:1d4,L:1d3],[w:Dagger+2,sb:1,+:2,SM:1d4,L:1d3],[],[]}}{{Ammo=+2 +4 vs Elves, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+2,t:Dagger,st:Dagger,sb:1,+:2,SM:1d4,L:1d3],[w:Dagger+4 vs Elves,t:Dagger,st:Dagger,sb:1,+:4,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:2,r:-/1/2/3],[t:dagger,+:4,r:-/1/2/3]{{desc=A Dagger of extra-fine quality, with an engraving of a lying sleeping (or dead?) Elf in the blade. It is enchanted to be a +2 magical weapon, but +4 when used against Elves}}'},
						{name:'Dagger-of-Throwing',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger of Throwing}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Short-blade]{{To-hit=+2 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger of Throwing+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger of Throwing+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, melee vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:+2,sb:1,+:2,SM:1d4,L:2d3],[]{{Ammo=+2, vs. SM:2d4, L:2d3 when thrown + Str bonus}}AmmoData=[w:Dagger of Throwing,t:Dagger,st:Dagger,sb:1,+:2,SM:2d4,L:2d3]{{Range=PB: 30, S:60, M:120, L:180}}RangeData=[t:dagger,+:2,r:3/6/12/18]}}{{desc=This appears to be a normal weapon but will radiate strongly of magic when this is checked for. The balance of this sturdy blade is perfect, such that when it is thrown by anyone, the dagger will demonstrate superb characteristics as a ranged weapon. The magic of the dagger enables it to be hurled up to 180 feet. A successful hit when it is thrown will inflict twice normal dagger damage, plus the bonus provided by the blade, which will range from +1 to +4.}}'},
						{name:'Dagger-of-Throwing+2',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dagger of Throwing}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Short-blade]{{To-hit=+2 + Str Bonus (or Dex if thrown)}}ToHitData=[w:Dagger of Throwing+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger of Throwing+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, melee vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:+2,sb:1,+:2,SM:1d4,L:2d3],[]{{Ammo=+2, vs. SM:2d4, L:2d3 when thrown + Str bonus}}AmmoData=[w:Dagger of Throwing,t:Dagger,st:Dagger,sb:1,+:2,SM:2d4,L:2d3]{{Range=PB: 30, S:60, M:120, L:180}}RangeData=[t:dagger,+:2,r:3/6/12/18]}}{{desc=This appears to be a normal weapon but will radiate strongly of magic when this is checked for. The balance of this sturdy blade is perfect, such that when it is thrown by anyone, the dagger will demonstrate superb characteristics as a ranged weapon. The magic of the dagger enables it to be hurled up to 180 feet. A successful hit when it is thrown will inflict twice normal dagger damage, plus the bonus provided by the blade, which will range from +1 to +4.}}'},
						{name:'Dancing-Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dancing Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=2-handed ranged dancing bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0 + Dex bonus (only when held)}}ToHitData=[w:Dancing Longbow,sb:0,db:1,+:1,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]{{Attacks=2 per round, Piercing}}{{desc=This is a dancing longbow. Use it in hand for 4 rounds, and it will improve your aim by 1, then 2 then 3, then 4 points. Then it will dance for 1, 2, 3, 4 rounds before returning to your side.}}'},
						{name:'Dart',type:'Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dart}}{{subtitle=Thrown weapon}}{{Speed=[[2]]}}{{Size=Tiny}}{{Weapon=1-handed ranged dart}}Specs=[Dart,Ranged,1H,Dart]{{To-hit=+0, + Str \\amp Dex bonuses}}ToHitData=[w:Dart,sb:1,db:1,+:0,n:3,ch:20,cm:1,sz:T,ty:P,sp:2,rc:uncharged]{{Attacks=3 per round, + specialisation \\amp level, Piercing}}{{Ammo=+0, vs. SM:1d3, L:1d2 + Str Bonus}}AmmoData=[w:Dart,t:Dart,st:Dart,sb:1,+:0,SM:1d3,L:1d2,]{{Range=S:10, M:20, L:40}}RangeData=[t:Dart,+:0,r:1/2/4]{{desc=A standard Dart of good quality, but otherwise ordinary}}'},
						{name:'Dart+3',type:'Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dart+3}}{{subtitle=Thrown weapon}}{{Speed=[[2]]}}{{Size=Tiny}}{{Weapon=1-handed ranged dart}}Specs=[Dart,Ranged,1H,Dart]{{To-hit=+3, + Str \\amp Dex bonuses}}ToHitData=[w:Dart,sb:1,db:1,+:3,n:3,ch:20,cm:1,sz:T,ty:P,sp:2,rc:uncharged]}}{{Attacks=3 per round, + specialisation \\amp level, Piercing}}{{Ammo=+3, vs. SM:1d3, L:1d2, + Str Bonus}}AmmoData=[w:Dart,t:Dart,st:Dart,sb:1,+:3,SM:1d3,L:1d2]{{Range=S:10, M:20, L:40}}RangeData=[t:Dart,+:3,r:1/2/4]{{desc=A Dart of exceptionally fine quality, with a sparkling tip and glowing flight feathers of many colours. A +3 weapon at all times}}'},
						{name:'Dragonslayer-Broadsword',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Dragonslayer Broadsword}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed slashing melee long blade}}Specs=[Broadsword,Melee,1H,Long-blade],[Broadsword,Melee,1H,Long-blade]{{To-hit=+2, +4 vs. Dragons, + Str Bonus}}ToHitData=[w:Dragonslayer+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged],[w:Dragonslayer vs. Dragon,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attks per round=[[1]] per round}}{{Damage=+2, +4 vs Dragons, + Str bonus. Kills 1 type - or does triple damage}}DmgData=[w:Dragonslayer+2,sb:1,+:2,SM:2d4,L:1+1d6][w:Dragonslayer vs Dragon,sb:1,+:4,SM:2d4,L:1+1d6]{{desc=This +2 sword has a +4 bonus against any sort of true dragon. It either inflicts triple damage against one sort of dragon (i.e., 3d6+3+4), or might be of a type that slays the dragon in 1 blow and immediately disintegrates. It will only act as a normal +2 sword against a dragon of a diametrically different colour (e.g. if a Black Dragonslayer, then will only be ordinary vs. a Silver dragon). Note that an unusual sword with intelligence and alignment will not be made to slay dragons of the same alignment. Determine dragon type (excluding unique ones like Bahamut and Tiamat) by rolling 1d10:\n1 black (CE)\n2 blue (LE)\n3 brass (CG)\n4 bronze (LG)\n5 copper (CG)\n6 gold (LG)\n7 green (LE)\n8 red (CE)\n9 silver (LG)\n10 white (CE)}}'},
						{name:'Extended-Range-Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Extended Range Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0 + Dex and Str bonuses}}ToHitData=[w:X-range Longbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,r:+0/+2/+2/+2,sp:8,rc:uncharged]{{Attacks=2 per round regardless of specialisation or level}}{{Range=Range of Ammo +20 at each of S, M \\amp L}}{{desc=This is a strong longbow which imparts extra range to its ammunition. The wood is polished, the string taut, and the limbs seem both stronger and more springy than the average bow. As a result, it can both impart the bowyer\'s strength bonus and 20 extra yards per range category (except PB)}}'},
						{name:'Fauchard',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Fauchard}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Fauchard,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Fauchard,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:6-8,sp:8,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs. SM:1d6, L:1d8, + Str Bonus}}DmgData=[w:Fauchard,sb:1,+:0,SM:1d6,L:1d8]{{desc=This is a normal Fauchard, a type of Polearm. The point is sharp and keen, but nothing special.\nAn outgrowth of the sickle and scythe, the fauchard is a long, inward curving blade mounted on a shaft six to eight feet long. It can slash or thrust, although the inward curving point makes thrusting rather ineffective. Its advantage is that a peasant can easily convert his common scythe into this weapon of war.}}'},
						{name:'Fauchard-Fork',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Fauchard-Fork}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Fauchard,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Fauchard-Fork,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:6-8,sp:8,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs. SM:1d8, L1d10, + Str bonus}}DmgData=[w:Fauchard-Fork,sb:1,+:0,SM:1d8,L:1d10]{{desc=This is a normal Fauchard-Fork, a type of Polearm. The blade is sharp and keen, but nothing special.\nThis is an attempted improvement on the fauchard, adding a long spike or fork to the back of the blade. Supposedly this improves the thrusting ability of the weapon. It is still an inefficient weapon.}}'},
						{name:'Felling-Axe',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Felling Axe}}{{subtitle=Magic Weapon}}{{Speed=[[7]]}}{{Size=M}}{{Weapon=2-handed melee axe or 1-handed ranged throwing axe}}Specs=[Felling-Axe,Melee,2H,Axe],[Throwing-Axe,Ranged,1H,Throwing-blade]{{To-hit=+1 + Str \\amp Dex bonuses}}ToHitData=[w:Felling Axe,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:7,rc:uncharged],[w:Felling Axe,sb:1,db:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:-/1/2/3,sp:7,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=As melee weapon +1, vs. SM:2d6, L:2d6 + Str bonus}}DmgData=[w:Felling Axe,sb:1,+:1,SM:2d6,L:2d6],[]{{Ammo=As ranged weapon +1, SM:1d6, L1d4 + Str Bonus}}AmmoData=[w:Felling Axe,t:Felling-Axe,st:Felling-Axe,sb:1,+:1,SM1d6,L:1d4]{{Range=S:10, M:20, L:30}}[t:Felling-Axe,+:1,r:-/1/2/3]{{desc=Axe of unsurpassed balance and sharpness. Used as a Weapon it is +1, 2D6+1, but if used as a felling axe any individual of 12 or greater strength can fell a 2\' diameter tree in one round (pro-rate to other trees on ratio of diameters). A character of 17 strength can use it as a throwing axe.}}'},
						{name:'Flail+1',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Footman\'s Flail+1}}{{subtitle=Flail}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee flail}}Specs=[Footmans Flail,Melee,1H,Flails]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Footmans Flail+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+1 vs. SM:1d6+1, L:2d4 + Str bonus}}DmgData=[w:Footmans Flail+1,sb:1,+:1,SM:1+1d6,L:2d4]{{desc=A Footman\'s Flail of very good quality, which has shiny chain, very supple and strong leather, and has a slight silvery glow about it. At all times, it is a +[[1]] weapon}}'},
						{name:'Flaming-Scimitar',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Flaming Scimitar}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade],[Scimitar,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Scimitar+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged],[w:Scimitar+1 Flaming,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, normally SM:1d8, L:1d8, + Str bonus, when flaming add 1d6}}DmgData=[w:Scimitar+1,sb:1,+:1,SM:1d8,L:1d8],[w:Scimitar+1 Flaming,sb:1,+:1,SM:1d8+1d6,L:1d8+1d6]{{desc=This sword flames upon the command of the wielder, causing flame to appear all along the blade as if fed from some invisible magical oil channels running from the hilt. The flame easily ignites oil, burns webs, or sets fire to paper, parchment, dry wood, etc. For creatures who take flame damage, does an additional 1d6 of flaming damage}}'},
						{name:'Footmans-flail',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Footman\'s Flail}}{{subtitle=Flail}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee flail}}Specs=[Footmans Flail,Melee,1H,Flails]{{To-hit=+0, + Str bonus}}ToHitData=[w:Footmans Flail,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round, + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d6+1, L:2d4, + Str bonus}}DmgData=[w:Footmans Flail,sb:1,+:0,SM:1+1d6,L:2d4]{{desc=A standard Footman\'s Flail of good quality, but nothing special}}'},
						{name:'Footmans-mace',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Footman\'s Mace}}{{subtitle=Mace}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Footmans Mace,Melee,1H,Clubs]{{To-hit=+0, + Str bonus}}ToHitData=[w:Footmans Mace,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d6+1, L:1d6, + Str bonus}}DmgData=[w:Footmans Mace,sb:1,+:0,SM:1+1d6,L:1d6]{{desc=This is a normal Footman\'s Mace. The business end is extra hard, but nothing special.}}'},
						{name:'Footmans-pick',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Footman\'s Pick}}{{subtitle=Pick}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee pick}}Specs=[Footmans Pick,Melee,1H,Picks]{{To-hit=+0, + Str bonus}}ToHitData=[w:Footmans Pick,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:7]{{Attacks=1 per round, + level \\amp specialisation, Piercing}}{{Damage=+0, vs. SM:1d6+1, L:2d4, + Str bonus}}DmgData=[w:Footmans Pick,sb:1,+:0,SM:1+1d6,L:2d4]}}{{desc=This is a normal Footman\'s Pick. The business end is wickedly pointed, but nothing special.}}'},
						{name:'Gaff',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Gaff}}{{subtitle=Hook}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee hook}}Specs=[Gaff,Melee,1H,Hooks]{{To-hit=+0 + Str bonus}}ToHitData=[w:Gaff,sb:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,r:4,sp:2]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d4, L:1d3, + Str bonus}}DmgData=[w:Gaff,sb:1,+:0,SM:1d4,L:1d3]{{desc=The gaff or hook is actually a tool used to hook and land fish. It is commonly found where fishing boats are encountered, and the hooks are in plentiful supply, affording the disarmed adventurer a weapon of last resort.\nA successful hit with the Gaff or Hook will grapple the target as well as doing damage. A Dexterity check next round escapes without additional damage, a Strength check -3 escapes with damage.\nThe gaff consists of a metal hook with a wooden or metal crossbar at the base. A onehanded tool, the hook protrudes from between the middle and ring fingers. Some sailors who have lost a hand have a cup with a gaff hook attached to the stump, guaranteeing that they are never without a weapon.}}'},
						{name:'Glaive',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Glaive}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Glaive,Melee,2H,Polearm]{{To-hit=+0, + Str bonus}}ToHitData=[w:Glaive,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:8-10,sp:8]{{Attacks=1 per round, + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d6, L:1d10, + Str bonus}}DmgData=[w:Glaive,sb:1,+:0,SM:1d6,L:1d10]{{desc=This is a normal Glaive, a type of Polearm. The blade is sharp and keen, but nothing special. **Inflicts double damage against charging creatures of Large or greater size**.\nOne of the most basic polearms, the glaive is a single-edged blade mounted on an eight- to ten-foot-long shaft. While not the most efficient weapon, it is relatively easy to make and use. Normally the blade turns outward to increase the cutting area until it almost resembles a cleaver or axe.}}'},
						{name:'Glaive-guisarme',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Glaive-guisarme}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Glaive,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Glaive-guisarme,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:8-10,sp:9]{{Attacks=1 per round, + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:2d4, L:2d6 + Str bonus}}DmgData=[w:Glaive-guisarme,sb:1,+:0,SM:2d4,L:2d6]{{desc=This is a normal Glaive-guisarme, a type of Polearm. The blade is sharp and keen, but nothing special. **Inflicts double damage against charging creatures of Large or greater size**.\nAnother combination weapon, this one takes the basic glaive and adds a spike or hook to the back of the blade. In theory, this increases the usefulness of the weapon although its actual application is somewhat questionable.}}'},
						{name:'Great-Axe',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Great Axe}}{{subtitle=Axe}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=2-handed melee axe}}Specs=[Great Axe,Melee,2H,Axe]{{To-hit=+0 + Str bonus}}ToHitData=[w:Great Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:9]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs. SM:1d10, L:2d8, + Str bonus}}DmgData=[w:Great Axe,sb:1,+:0,SM:1d10,L:2d8]{{desc=This is an impressive Great Axe. The blade is sharp and keen, but nothing special.}}'},
						{name:'Great-Axe+1',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Great Axe+1}}{{subtitle=Axe}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=2-handed melee axe}}Specs=[Great Axe,Melee,2H,Axe]{{To-hit=+1 + Str bonus}}ToHitData=[w:Great Axe+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:9]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d10, L:2d8, + Str bonus}}DmgData=[w:Great Axe+1,sb:1,+:1,SM:1d10,L:2d8]{{desc=This is an impressive Great Axe. The blade is sharp and keen, and gleams with an impossibly sharp edge.}}'},
						{name:'Greatsword',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Greatsword}}{{subtitle=Sword}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=2-handed melee great-blade}}Specs=[Greatsword, Melee, 2H, Great-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Greatsword,Str Bonus sb:1,Attk +:0,No per round n:1,Crit hit ch:20,Crit Miss cm:1,Size sz:M,Type ty:S,Range r:6,Speed sp:9]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:2d6, L:2d10, + Str bonus}}DmgData=[w:Greatsword,Str Bonus sb:1,Dmg +:0,Dmg SM:2d6,Dmg L:2d10]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Guisarme',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Guisarme}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Guisarme,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Guisarme,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:8,sp:8]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:2d4, L:1d8, + Str bonus}}DmgData=[w:Guisarme,sb:1,+:0,SM:2d4,L:1d8]{{desc=This is a normal Guisarme, a type of Polearm. The blade is sharp and keen, but nothing special.\nThought to have derived from a pruning hook, this is an elaborately curved heavy blade. While convenient and handy, it is not very effective.}}'},
						{name:'Guisarme-voulge',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Guisarme-voulge}}{{subtitle=Polearm}}{{Speed=[[10]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Guisarme,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Guisarme-voulge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:8,sp:10]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:2d4, L:2d4, + Str bonus}}DmgData=[w:Guisarme-voulge,sb:1,+:0,SM:2d4,L:2d4]{{desc=This is a normal Guisarme-voulge a type of Polearm. The blade is sharp and keen, but nothing special.\nThis weapon has a modified axe blade mounted on an eight-foot long shaft. The end of the blade tapers to a point for thrusting and a back spike is fitted for punching through armor. Sometimes this spike is replaced by a sharpened hook for dismounting riders.}}'},
						{name:'Halberd',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Halberd}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Halberd,Melee,2H,Polearm]}}{{To-hit=+0 + Str bonus}}ToHitData=[w:Halberd,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:5-8,sp:9]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:1d10, L:2d6, + Str bonus}}DmgData=[w:Halberd,sb:1,+:0,SM:1d10,L:2d6]{{desc=This is a normal Halberd, a type of Polearm. The blade is sharp and keen, but nothing special.\nAfter the awl pike and the bill, this was one of the most popular weapons of the Middle Ages. Fixed on a shaft five to eight feet long is a large axe blade, angled for maximum impact. The end of the blade tapers to a long spear point or awl pike. On the back is a hook for attacking armor or dismounting riders. Originally intended to defeat cavalry, it is not tremendously successful in that role since it lacks the reach of the pike and needs considerable room to swing. It found new life against blocks of pikemen. Should the advance of the main attack stall, halberdiers issue out of the formation and attack the flanks of the enemy. The pikemen with their overlong weapons are nearly defenseless in such close combat.}}'},
						{name:'Hand-Axe',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hand Axe}}{{subtitle=Axe}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown axe}}Specs=[Hand Axe,Melee,1H,Axe],[Hand Axe,Ranged,1H,Axe]{{To-hit=+0 + Str \\amp Dex bonuses}}ToHitData=[w:Hand Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:4],[w:Hand Axe,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:1/2/3,sp:4]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Hand Axe,sb:1,+:0,SM:1d6,L:1d4],[]{{Ammo=+0, + Str bonus}}AmmoData=[w:Hand Axe,t:Hand Axe,st:Hand Axe,sb:1,+:0,SM:1d6,L:1d4]{{Range=S:10, M:20, L:30}}[t:Hand Axe,+:0,r:1/2/3]{{desc=This is a normal Hand- or Throwing-Axe. The blade is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Hand-Crossbow',type:'Ranged',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hand Crossbow}}{{subtitle=Crossbow}}{{Speed=[[5]]}}{{Size=Small}}{{Weapon=1-handed ranged crossbow}}Specs=[Hand Crossbow,Ranged,1H,Crossbow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Hand Crossbow,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,sp:5]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{desc=This is a hand crossbow, small enough to use in 1 hand, with a magazine of 10 quarrels requiring reloading. Made of good quality wood and various metals, it is portable and easy to hold, but it is nothing special}}'},
						{name:'Harpoon',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Harpoon}}{{subtitle=Spear}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=1-handed melee or thrown weapon}}Specs=[Harpoon,Melee,1H,Spears],[Harpoon,Ranged,1H,Spears]{{To-hit=+0, + Dex (if thrown) \\amp Str bonuses}}ToHitData=[w:Harpoon,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:5,sp:7],[w:Harpoon,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round, + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:2d4, L:2d6, + Str bonus}}DmgData=[w:Harpoon,sb:1,+:0,SM:2d4,L:2d6],[]{{Ammo=+0, vs SM:2d4, L:2d6 + Str bonus}}AmmoData=[w:Harpoon,t:Harpoon,st:Spear,sb:1,+:0,SM:2d4,L:2d6]{{Range=S:10, M:20, L:30}}RangeData=[t:Harpoon,+:0,r:1/2/3]{{desc=This is a normal Harpoon. The point is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Heavy-Crossbow',type:'Ranged',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Heavy Crossbow}}{{subtitle=Crossbow}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed ranged crossbow}}Specs=[Heavy Crossbow,Ranged,2H,Crossbow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Heavy Crossbow,sb:0,db:1,+:0,n:1/2,ch:20,cm:1,sz:M,ty:P,sp:10]{{Attacks=1 per 2 rounds + level \\amp specialisation, Piercing}}{{desc=This is a heavy crossbow, large and somewhat cumbersome. Made of good quality wood and various metals, it is somewhat difficult to hold and reload, and is nothing special}}'},
						{name:'Heavy-Horse-Lance',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Heavy Horse Lance}}{{subtitle=Lance}}{{Speed=[[8]]}}{{Size=Huge}}{{Weapon=1-handed mounted melee lance}}Specs=[Lance,Melee,1H,Lances]{{To-hit=+0, + Str bonus (Heavy War Horse only)}}ToHitData=[w:Heavy Horse Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:8]{{Attacks=1 per round (unless jousting), Piercing}}{{Damage=+0, vs SM:1d8+1, L:3d6, + Str bonus (Heavy War Horse only)}}DmgData=[w:Heavy Horse Lance,sb:1,+:0,SM:1+1d8,L:3d6]{{desc=This is a normal lance for use with a heavy war horse. The point is well hardened and the shaft in good condition, but nothing special.}}'},
						{name:'Hook',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hook}}{{subtitle=Hook}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee hook}}Specs=[Hook,Melee,1H,Hooks]{{To-hit=+0, + Str bonus}}ToHitData=[w:Hook,sb:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,r:4,sp:2]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0 vs SM:1d4, L:1d3, + Str bonus}}DmgData=[w:Hook,sb:1,+:0,SM:1d4,L:1d3]{{desc=The gaff or hook is actually a tool used to hook and land fish. It is commonly found where fishing boats are encountered, and the hooks are in plentiful supply, affording the disarmed adventurer a weapon of last resort.\nA successful hit with the Gaff or Hook will grapple the target as well as doing damage. A Dexterity check next round escapes without additional damage, a Strength check -3 escapes with damage.\nThe gaff consists of a metal hook with a wooden or metal crossbar at the base. A onehanded tool, the hook protrudes from between the middle and ring fingers. Some sailors who have lost a hand have a cup with a gaff hook attached to the stump, guaranteeing that they are never without a weapon.}}'},
						{name:'Hook-Fauchard',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hook Fauchard}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Fauchard,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Hook Fauchard,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:6-8,sp:9]{{Attacks=1 per round, + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:1d4, L:1d4, + Str bonus}}DmgData=[w:Hook Fauchard,sb:1,+:0,SM:1d4,L:1d4]{{desc=This is a normal Hook Fauchard, a type of Polearm. The blade is sharp and keen, but nothing special.\nThis combination weapon is another attempted improvement to the fauchard. A back hook is fitted to the back of the blade, supposedly to dismount horsemen. Like the fauchard, this is not a tremendously successful weapon.}}'},
						{name:'Horeshoes-of-Strength',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Horseshoes of Strength}}{{subtitle=Magic Item}}{{Speed=No effect}}{{Size=Small}}{{Weapon=1-hooved melee horseshoe}}Specs=[Horseshoes,Melee,1H,Horseshoes]{{To-hit=+1}}ToHitData=[w:Horseshoes+1,+:1,n:1,ch:20,cm:1,sz:S,ty:SB,r:5,sp:0]{{Attacks=2 per round (front kicks or rear kicks, Bludgeoning)}}{{Damage=+1, vs SM:1d3, L:1d3, for War Horse}}DmgData=[w:Horseshoes+1,+:1,SM:1d3,L:1d3]{{Reference=House Rules / Prices / Horses}}{{desc=Enable a horse to carry loads as if one level of horse higher. If a Heavy War Horse already, add 50% extra load. Also act as +1 weapon when horse attacks with hooves.}}'},
						{name:'Horsemans-Flail',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Horseman\'s Flail}}{{subtitle=Flail}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=1-handed mounted melee flail}}Specs=[Horsemans Flail,Melee,1H,Flails]{{To-hit=+0, + Str bonus}}ToHitData=[w:Horsemans Flail,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:6]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d4+1, L:1d4+1, + Str bonus}}DmgData=[w:Horsemans Flail,sb:1,+:0,SM:1+1d4,L:1+1d4]{{desc=This is a normal Horseman\'s Flail. The business end is made of vicious steel chain and thick leather, but is nothing special.}}'},
						{name:'Horsemans-Mace',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Horseman\'s Mace}}{{subtitle=Club}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=1-handed mounted melee club}}Specs=[Horsemans Mace,Melee,1H,Clubs]{{To-hit=+0 + Str bonus}}ToHitData=[w:Horsemans Mace, sb:1, +:0,n:1,ch:20,cm:1,sz:M, ty:B,r:5, sp:6]{{Attacks=1 per round + level + specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Horsemans Mace,sb:1,+:0,SM:1d6,L:1d4]}}{{desc=This is a normal Horseman\'s Mace. The business end is hardened wood and steel, but is nothing special.}}'},
						{name:'Horsemans-pick',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Horseman\'s Pick}}{{subtitle=Pick}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed mounted melee pick}}Specs=[Horsemans Pick,Melee,1H,Picks]{{To-hit=+0 + Str bonus}}ToHitData=[w:Horsemans Pick,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5, sp:6]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d4+1, L:1d4}}DmgData=[w:Horsemans Pick,sb:1,+:0,SM:1+1d4,L:1d4]{{desc=This is a normal Horseman\'s Pick. The business end is hard and sharp, but is nothing special.}}'},
						{name:'Huge-Flaming-Scimitar',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Huge Flaming Scimitar}}{{subtitle=Magic Sword}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee long-blade}}Specs=[Huge Scimitar,Melee,2H,Great-blade],[Huge Scimitar,Melee,2H,Great-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Huge Scimitar+1,sb:1,+:1,n:1,ch:20,cm:1,sz:L,ty:S,r:5,sp:8,rc:uncharged],[w:Huge Scimitar+1 Flaming,sb:1,+:1,n:1,ch:20,cm:1,sz:L,ty:S,r:5,sp:8,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, normally SM:2d8, L:2d8, + Str bonus, when flaming add 1d8}}DmgData=[w:Huge Scimitar+1,sb:1,+:1,SM:2d8,L:2d8],[w:Huge Scimitar+1 Flaming,sb:1,+:1,SM:3d8,L:3d8]{{desc=This sword is a huge 2-handed version of a Flaming Scimitar+1, normally wielded by creatures from the elemental plane of fire, or other flame-oriented magical creatures. It requires at least *Hill Giant Strength* (Strength 19 or greater) in order to wield it. It flames upon the command of the wielder, causing flame to appear all along the blade as if fed from some invisible magical oil channels running from the hilt. The flame easily ignites oil, burns webs, or sets fire to paper, parchment, dry wood, etc. For creatures who take flame damage, does an additional 1d8 of flaming damage}}'},
						{name:'Ice-Knife',type:'Innate-Ranged',ct:'2',charge:'recharging',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ice Knife (spell)}}{{subtitle=Thrown magical knife}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed ranged throwing-blade}}Specs=[Ice Knife,Innate-Ranged,1H,Innate]{{To-hit=+0, + Dex bonuses}}ToHitData=[w:Ice Knife,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,sp:2,rc:recharging]{{Attacks=1 per round, + specialisation \\amp level, Piercing}}{{Ammo=+0, vs. SM:2d8, L:2d8 or shatters for grenade-like cold damage (see spell)}}AmmoData=[w:Ice Knife,t:Ice Knife,st:Throwing-Blade,sb:0,+:0,SM:2d8,L:2d8]{{Range=S:10, M:20, L:30}}RangeData=[t:Ice Knife,+:0,r:1/2/3]{{desc=The Ice Knife spell fires a dagger of ice at the target. If misses, check the spell details for the grnade-like effect.}}'},
						{name:'Javelin',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Javelin}}{{subtitle=Spear}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown spear}}Specs=[Javelin,Melee,1H,Spears],[Javelin,Ranged,1H,Spears]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Javelin,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:4],[w:Javelin,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,sp:4]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d6 + Str bonus}}DmgData=[w:Javelin,sb:1,+:0,SM:1d6,L:1d6],[]{{Ammo=+0, vs SM:1d6, L:1d6 + Str bonus}}AmmoData=[w:Javelin,t:Javelin,st:Spear,sb:1,+:0,SM:1d6,L:1d6,]{{Range=PB:20 S:30 M:40 L:60}}RangeData=[t:Javelin,+:0,r:2/3/4/6]{{desc=This is a normal Javelin. It is light, the point is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Jim-the-Sun-Blade',type:'Melee|Melee|Melee|Melee',ct:'100',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Jim the Sun Blade\nIntelligent, Neutral}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}WeapData=[w:Jim the Sun Blade,ns:5][cl:PW,w:Jims-Locate-Object,sp:100,lv:6,pd:1],[cl:PW,w:Jims-Find-Traps,sp:5,lv:6,pd:2],[cl:PW,w:Jims-Levitation,sp:2,lv:1,pd:3],[cl:PW,w:Jims-Sunlight,sp:3,lv:6,pd:1],[cl:PW,w:Jims-Fear,sp:4,lv:6,pd:2]{{Size=Special (feels like a Shortsword)}}{{Weapon=1 or 2 handed melee Long or Short blade}}Specs=[Bastard-sword|Short-sword,Melee,1H,Long-blade|Short-blade],[Bastard-sword|Short-sword,Melee,1H,Long-blade|Short-blade],[Bastard-sword,Melee,2H,Long-blade],[Bastard-sword,Melee,2H,Long-blade]{{To-hit=+2, +4 vs Evil + Str Bonus}}ToHitData=[w:Jim +2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim vs Evil+4,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim 2H +2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim 2H vs Evil+4,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3]{{Attacks=1 per round}}{{Damage=+2, +4 vs Evil, + 1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Jim+2,sb:1,+:2,SM:1d8,L:1d12],[w:Jim vs Evil+4,sb:1,+:4,SM:2d4,L:2d8],[w:Jim 2H +2,sb:1,+:2,SM:1d8,L:1d12],[w:Jim 2H vs Evil+4,sb:1,+:4,SM:2d4,L:2d8]{{desc=An intelligent weapon: A Sun Blade called Jim (DMs Guide Page 185). It is Neutral. It needs its owner to be proficient with either a Short or Bastard Sword or promise to get such proficiency as soon as possible. It cannot be used by someone who is not proficient. It requires its owner to be Neutral on at least one of its axis, and may not be Evil. NG LN CN and of cause true N are all ok. Abilities:\n**1:** It is +2 normally, or +4 against evil creatures, and does Bastard sword damage.\n**2:** It feels and react as if it is a short sword and uses short sword striking time.\n**3:** [Locate Object](!magic --mi-power @{selected|token_id}|Jims-Locate-Object|Jim-the-Sun-Blade|6) at [[6]]th Level in 120\' radius (1x day). \n**4:** [Detect traps](!magic --mi-power @{selected|token_id}|Jims-Find-Traps|Jim-the-Sun-Blade|6) of large size in 10\' radius (2xday). \n**5:** [Levitation](!magic --mi-power @{selected|token_id}|Jims-Levitation|Jim-the-Sun-Blade|1) 3x a day for 1 turn (cast at 1st Level).\n**6:** [Sunlight](!magic --mi-power @{selected|token_id}|Jims-Sunlight|Jim-the-Sun-Blade|6)Once a day, upon command, the blade can be swung vigorously above the head, and it will shed a bright yellow radiance that is like full daylight. The radiance begins shining in a 10-foot radius around the sword-wielder, spreading outward at 5 feet per round for 10 rounds thereafter, creating a globe of light with a 60-foot radius. When the swinging stops, the radiance fades to a dim glow that persists for another turn before disappearing entirely.\n**7:** It has a special purpose namely Defeat Evil. \n**8:** On hitting an Evil being it causes [Fear](!magic --mi-power @{selected|token_id}|Jims-Fear|Jim-the-Sun-Blade|6) for 1d4 rounds (unless saving throw is made). It can do this **twice a day** when the wielder desires.\n**9:** It speaks Common and its name is Jim. It will talk to the party.\n**10:** It has an ego of 16 and is from Yorkshire. \n**11:** It will insist on having a Neutral wielder. (See Intelligent weapons on page 187 in DMG). \n**12:** If picked by a player, it will be keen to become the players main weapon.\n**13:** If picked up by a player who is not Neutral it will do them 16 points of damage}}'},
						{name:'Jousting-Lance',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Jousting Lance}}{{subtitle=Lance}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=1-handed mounted melee lance}}Specs=[Jousting Lance,Melee,1H,Lances]{{To-hit=+0 + Str bonus (when mounted only)}}ToHitData=[w:Jousting Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:8]{{Attacks=1 per round + level \\amp specialisation (while mounted \\amp except when Jousting), Piercing}}{{Damage=+0, vs SM:1d3-1, L:1, + Str bonus}}DmgData=[w:Jousting Lance,sb:1,+:0,SM:0-1+1d3,L:0-1+1d2]{{desc=This is a normal lance for use with a heavy war horse or charger trained in the competition of jousting. The point is well hardened but blunted to reduce damage in the competition, and the shaft in good condition, but nothing special.}}'},
						{name:'Khopesh',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Khopesh}}{{subtitle=Sword}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=1-handed melee medium-length blade}}Specs=[Khopesh,Melee,1H,Medium-blade]{{To-hit=+0 + Str bonus}}ToHitData=[name w:Khopesh,strength bonus sb:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:S, range r:5,speed sp:9]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:2d4, L:1d6, + Str bonus}}DmgData=[name w:Khopesh,strength bonus sb:1,magic+:0,vs SM:2d4,vs L:1d6]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.\nThis is an Egyptian weapon. A khopesh has about six inches of handle and quillons. Its blade is then straight from the quillons for about two feet. The blade becomes sickle-shaped at this point, being about two additional feet long but effectively extending the overall length of the sword by only 1.5 feet. This makes the khopesh both heavy and unwieldy, difficult to employ properly, and slow to recover, particularly after a badly missed blow. Its sickle-like portion can snag an opponent or an opposing weapon.}}'},
						{name:'Knife',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Knife}}{{subtitle=Blade}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee fencing-blade or short-blade, or ranged throwing-blade}}Specs=[Knife,Melee,1H,Fencing-blade|Short-blade],[Knife,Ranged,1H,Throwing-blade]{{To-hit=+0 + Str \\amp Dex bonuses}}ToHitData=[w:Knife,sb:1,+:0,n:2,ch:20,cm:1,sz:S,ty:SP,r:5,sp:2],[w:Knife,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:S,ty:P,sp:2]{{Attacks=2 per round + level \\amp specialisation, Slashing \\amp Piercing}}{{Damage=+0, vs SM: 1d3, L:1d2, + Str bonus}}DmgData=[w:Knife,sb:1,+:0,SM:1d3,L:1d2],[ ]{{Ammo=+0, vs SM:1d3, L:1d2 + Str bonus}}AmmoData=[w:Knife,t:Knife,st:Knife,sb:1,+:0,SM:1d3,L:1d2]{{Range=S:10, M:20, L:30}}[t:Knife,+:0,r:1/2/3]{{desc=A standard Knife of good quality, versatile in combat, but otherwise ordinary}}'},
						{name:'Light-Crossbow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Light Crossbow}}{{subtitle=Crossbow}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=2-handed ranged crossbow}}Specs=[Light Crossbow,Ranged,2H,Crossbow]{{To-hit=+0 + Dex bonus only}}ToHitData=[w:Light Crossbow,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{desc=This is a heavy crossbow, large and somewhat cumbersome. Made of good quality wood and various metals, it is somewhat difficult to hold and reload, and is nothing special}}'},
						{name:'Light-Horse-Lance',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Light Horse Lance}}{{subtitle=Lance}}{{Speed=[[6]]}}{{Size=Large}}{{Weapon=1-handed mounted melee lance}}Specs=[Lance,Melee,1H,Lances]{{To-hit=+0 + Str bonus}}ToHitData=[w:Light Horse Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:6]{{Attacks=1 per round when mounted (except if jousting)}}{{Damage=+0, vs SM:1d6, L:1d8, + Str bonus (when mounted)}}DmgData=[w:Light Horse Lance,sb:1,+:0,SM:1d6,L:1d8]{{desc=This is a normal lance for use with a light war horse. The point is well hardened and the shaft in good condition, but nothing special.}}'},
						{name:'LightBringer-Mace',type:'Melee|Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=LightBringer Mace+1}}{{subtitle=Magical Weapon}}{{Speed=7}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Footmans-Mace,Melee,1H,Clubs],[Footmans-Mace,Melee,1H,Clubs]{{To-hit=+1 + Str bonus}}ToHitData=[w:Lightbringer Mace+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7],[w:Lightbringer vs Undead,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+1\n**vs Undead** SM:2d6+1, L:2d6,\n**vs other** SM:1d6+1, L:1d6}}DmgData=[w:Lightbringer Mace+1,sb:1,+:1,SM:1+1d6,L:1d6],[w:Lightbringer vs Undead,sb:1,+:1,SM:1+2d6,L:2d6]{{Other Powers=Torch [On](!rounds --target caster|@{selected|token_id}|Lightbringer-mace|99|0|Lightbringer is lit|aura) or [Off](!tj --removestatus lightbringer-mace) \\amp [Light burst](!\\amp#13;\\amp#47;r 1d6 radient damage vs undead) vs undead}}{{desc= This +1 mace was made for a cleric of Lathander, the god of dawn. The head of the mace is shaped like a sunburst and made of solid brass. Named Lightbringer, this weapon glows as bright as a torch when its wielder commands. While glowing, the mace deals an extra 1d6 radiant damage to undead creatures.\nIt can be used by anyone.\nIt glows on command without limitation as brightly as a torch}}'},
						{name:'Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=Ranged 2-handed Bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0 + Dex Bonus}}ToHitData=[w:Longbow,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]{{Attacks=Piercing, 2 per round}}{{desc=This is a normal longbow. The wood is polished, the string taut, but nothing special.}}'},
						{name:'Longsword',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+0 + Str bonus}}ToHitData=[name w:Longsword,strength bonus sb:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:S, range r:5,speed sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[name w:Longsword,strength bonus sb:1,magic+:0,vs SM:1d8,vs L:1d12]}}{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Longsword+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+1, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12]{{desc=This is a magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Longsword+1+2-vs-Orcs',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword Orc-slayer}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-Hit=+1, +2 vs Orcs, + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Orcs+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, +2 vs Orcs, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Longsword vs Orcs+2,sb:1,+:2,SM:1d8,L:1d12]{{desc=This sword has a hilt guard with a centre boss of a sculpted Orc\'s face, scowling. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. When facing Orcs, its blade seems to glisten, and the increasing sharpness can almost be seen by the wielder. \n It is +[[2]] on attack and damage vs. Orcs}}'},
						{name:'Longsword+1+3-vs-Regenerating',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword +1,+3 vs Regenerating (charged)}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-Hit=+1, +3 vs Regenerating (uses 1 charge), + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Regen+3,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, +3 vs Regenerating (uses 1 charge), vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Longsword vs Regen+3,sb:1,+:3,SM:1d8,L:1d12]{{desc=This sword has a hilt guard with a centre boss of a sculpted Troll. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. When facing Regenerating creatures, its blade seems to turn blood red, and the increasing sharpness can almost be seen by the wielder. \n It is +[[3]] on attack and damage vs. Regenerating creatures, but each hit will use a charge if the sword has charges}}'},
						{name:'Longsword+1+3-vs-undead',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword +1,+3 vs Undead}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-Hit=+1, +3 vs Undead, + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Undead+3,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round +level \\amp specialisation, Slashing}}{{Damage=+1, +3 vs Undead, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Longsword vs Undead+3,sb:1,+:3,SM:1d8,L:1d12]{{desc=This sword has a hilt guard with a centre boss of a sculpted Skull. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. When facing Undead, its blade seems to darken, and the increasing sharpness can almost be seen by the wielder. \n It is +[[3]] on attack and damage vs. Undead}}'},
						{name:'Longsword+2',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword+2}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Longsword+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+2 + Str bonus}}DmgData=[w:Longsword+2,sb:1,+:2,SM:1d8,L:1d12]{{desc=This is a fine magical sword. The blade is very sharp and keen, and is a +[[2]] magical weapon at all times.}}'},
						{name:'Longsword+2-Planteater',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword+2, Planteater}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Longsword+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Plant+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+2, vs SM:1d8, L:1d12, + Str bonus. Always max damage vs plants}}DmgData=[w:Longsword+2,sb:1,+:2,SM:1d8,L:1d12],[w:Longsword vs Plant+2,sb:1,+:2,SM:8,L:12]{{desc=This is an extra fine magical sword. The blade is very sharp and keen with a greenish hue and engraved with pictures of vines, leaves, branches, plants and plant-based monsters. It is a +[[2]] magical weapon at all times, and does automatic ***maximum*** damage if it hits plant-based material.}}'},
						{name:'Longsword-of-Adaptation+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Longsword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Longsword of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword of Adapt+1,sb:1,+:1,SM:1d8,L:1d12]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Lucern-Hammer',type:'Melee|Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Lucern Hammer}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Lucern Hammer|Bec de Corbin,Melee,2H,Polearm],[Lucern Hammer|Bec de Corbin,Melee,2H,Polearm]}}{{To-hit=+0 + Str bonus}}ToHitData=[w:Lucern Hammer,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PB,r:8-10,sp:9],[w:Lucern Hammer set vs charge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PB,r:8-10,sp:9]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Bludgeoning}}{{Damage=+0, vs SM:2d4, L:1d6 (if set vs charge SM:4d4, L:2d6) + Str bonus}}DmgData=[w:Lucern Hammer,sb:1,+:0,SM:2d4,L:1d6],[w:Lucern Hammer vs charge,sb:1,+:0,SM:4d4,L:2d6]{{desc=This is a normal Lucern Hammer, a type of Polearm. The blade is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nThis weapon is similar to the bec de corbin. Fitted with a shaft up to ten feet long, it is usually found in the hands of the common soldier. Like the bec de corbin, its main purpose is to punch through armor. The end is fitted with the long point of an awl pike to hold off enemy cavalry.}}'},
						{name:'Magic-Quarterstaff',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magic Quarterstaff}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=Quarterstaff,Melee,2H,Staff}}Specs=[Quarterstaff,Melee,1H,Staff]{{To-hit=+ as per weapon}}{{damage=+ as per weapon}}{{desc=A standard Quarterstaff of fine quality, good enough to be enchanted}}'},
						{name:'Magical-1H-Sword',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Magical Sword}}{{subtitle=Magic Sword}}{{Speed=By type}}{{Size=Medium}}{{Weapon=[Sword,Melee,1H,Sword]}}{{To-hit=+?}}Specs=[Magic-Sword,Melee,1H,Long-blade|Short-blade]{{damage=+?}}{{Other Powers=Unknown}}{{desc=This definitely appears to be a magical sword, and the DM will tell you what basic type of sword it is.}}'},
						{name:'Magical-Stone',type:'Innate-Ranged',ct:'1',charge:'recharging',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magical Stone (spell)}}{{subtitle=Thrown or slung ammo}}{{Speed=[[1]] if thrown\nor as per sling}}{{Size=Tiny}}{{Weapon=1-handed ranged stone, usable as sling ammo}}Specs=[Magical Stone,Innate-Ranged,1H,Magical Stone]{{To-hit=+0, + Dex bonuses}}ToHitData=[w:Magical Stone,sb:0,db:1,+:0,n:3,ch:20,cm:1,sz:T,ty:B,sp:1,rc:recharging]{{Ammo=+0, no bonuses, but acts as if +1 ammo}}AmmoData=[w:Magical Stone,st:Magical Stone,+:0,SM:1d4,L:1d4],[w:Magical Stone vs Undead,st:Magical Stone,+:0,SM:2d4,L:2d4],[w:Magical Sling Stone,st:Sling,+:0,SM:1d4,L:1d4],[w:Magical Sling Stone vs Undead,st:Sling,+:0,SM:2d4,L:2d4]{{Range=30yds or as sling stone}}RangeData=[t:Magical Stone,+:0,r:9],[t:Magical Stone vs Undead,+:0,r:30],[t:sling,+:0,r:2/3/6/12]}}{{desc=A magically endowed stone made magical by the *Magical Stone* spell, which is +0, but hits creatures that need at least a +1 weapon. Can be thrown with range 30yds, or used as ammo for a sling.}}'},
						{name:'Magical-Weapon',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Magical Weapon}}{{subtitle=Magic Weapon}}{{Speed=By type}}{{Size=Medium}}{{Weapon=A magical weapon on some type that is unclear for some reason. Magical obscurement?}}Specs=[Magic-Weapon,Melee,1H,Any]{{To-hit=+?}}{{damage=+?}}{{Other Powers=Unknown}}{{desc=This definitely appears to be a magical weapon, and the DM will tell you what basic type of weapon it is.}}'},
						{name:'Mancatcher',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Mancatcher}}{{subtitle=Polearm}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=1-handed melee polearm}}Specs=[Mancatcher,Melee,1H,Polearm]{{To-hit=+0 + *Dex* bonus}}ToHitData=[w:Mancatcher,db:1,+:0,n:1,ch:20,cm:1,sz:L,ty:N,r:10,sp:7]{{Attacks=1 per round, automatic once caught}}{{Damage=+0, vs SM:1d2, L:1d2, automatic each round, no other bonuses}}DmgData=[w:Mancatcher,sb:1,+:0,SM:1d2,L:1d2]{{desc=This item is a highly specialized type of polearm designed to capture without killing a victim. It consists of a long pole with a spring-loaded set of sharpened jaws at the end. The victim is caught between the arms, which then snap shut. The mancatcher is effective only on man-sized creatures. The target is always treated as AC 10, modified for Dexterity. If a hit is scored, the character is caught. The caught victim loses all shield and Dexterity bonuses and can be pushed and pulled about. This causes an automatic 1d2 points of damage per round and gives a 25% chance of pulling the victim to the ground. The victim can escape on a successful bend bars/lift gates roll, although this results in 1d2 points more damage. A common tactic is to use the weapon to pull horsemen off their mounts, then pin them to the ground.}}'},
						{name:'Manticore-tail',type:'Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Manticore Tail}}{{subtitle=Ranged Weapon}}{{Speed=[[0]] Innate Weapon}}{{Size=Large}}{{Weapon=Body part with projectile spikes}}Specs=[Manticore Tail,Ranged,1H,Innate]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Manticore-tail,sb:1,db:0,+:0,n:1d6,ch:20,cm:1,sz:L,ty:P,sp:0,r:6/12/18]{{Attacks=1d6/round, Piercing}}{{desc=The tail of a Manticore is covered in spikes. In total, the typical Manticore tail has a total of 4d6 tail spikes which can be fired in upto 4 volleys. Each spike does 1d6 damage if it hits.}}'},
						{name:'Medium-Horse-Lance',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Medium Horse Lance}}{{subtitle=Lance}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=1-handed mounted melee lance}}Specs=[Lance,Melee,1H,Lances]{{To-hit=+0 + Str bonus when mounted}}ToHitData=[w:Medium Horse Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:7]{{Attacks=1 per round + level \\amp specialisation (when mounted), Piercing}}{{Damage=+0, vs SM:1d6+1, L:2d6, + Str bonus when mounted}}DmgData=[w:Medium Horse Lance,sb:1,+:0,SM:1+1d6,L:2d6]{{desc=This is a normal lance for use with a medium war horse. The point is well hardened and the shaft in good condition, but nothing special.}}'},
						{name:'Military-Fork',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Military Fork}}{{subtitle=Polearm}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Military Fork,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Military Fork,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:8-10,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d8, L:2d4, + Str bonus}}DmgData=[w:Military Fork,sb:1,+:0,SM:1d8,L:2d4]{{desc=This is a normal Military Fork, a type of Polearm. The points are sharp and keen, but nothing special. **Inflicts double damage against charging creatures of Large or greater size.**\nThis is one of the simplest modifications of a peasant\'s tool since it is little more than a pitchfork fixed to a longer shaft. With tines strengthened and straightened, the military fork serves well. The need for cutting and cleaving eventually often results in combining the fork with other weapons.}}'},
						{name:'Mongol-Horse-Bow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Mongol Horse Bow}}{{subtitle=Bow}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=2-handed ranged bow}}Specs=[Shortbow,Ranged,2H,Bow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Mongol Horse Bow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:7]{{Attacks=2 per round, no increases, Piercing}}{{desc=Very similar to a shortbow, the Mongol Horse Bow is designed to work really well from the back of a horse, but works identically to a shortbow at all times.}}'},
						{name:'Mordenkainens-Sword',type:'Innate-Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Mordenkainen\'s Sword (spell)}}{{subtitle=Summoned Sword}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Mordenkainens-Sword,Innate-Melee,1H,Long-blade]{{To-hit=+0 no Str bonus}}ToHitData=[w:Mordenkainens Sword,sb:0,+:0,n:1,ch:19,cm:1,sz:M,ty:S,r:5,sp:7]{{Attacks=1 per round + level as Fighter of [[ceil(@{selected|casting-level}/2)]], Slashing}}{{Damage=+0, vs SM:5d4, vs L:5d6, no Str bonus}}DmgData=[w:Mordenkainens Sword,sb:0,+:0,SM:5d4,L:5d6]}}{{desc=This sword is called into being by a *Mordenkainen\'s Sword* spell. The sword has no magical attack bonuses, but it can hit nearly any sort of opponent, even those normally struck only by +3 weapons or those who are astral, ethereal, or out of phase. It hits any Armor Class on a roll of 19 or 20. It inflicts 5d4 points of damage to opponents of man size or smaller, and 5d6 points of damage to opponents larger than man size}}'},
						{name:'Morningstar',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Morning Star +2}}{{subtitle=Mace/Club}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Morningstar,Melee,1H,Clubs]{{To-hit=+0 + Str bonus}}ToHitData=[w:Morning Star,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:2d4, L:1d6+1, + Str bonus}}DmgData=[w:Morning Star,sb:1,+:0,SM:2d4,L:1+1d6]{{desc=This is a good Morning Star. The knobbly bit on the chain has sharp spikes, but otherwise it is an ordinary weapon.}}'},
						{name:'Morningstar+2',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Morning Star +2}}{{subtitle=Magic Weapon}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Morningstar,Melee,1H,Clubs]{{To-hit=+2 + Str bonus}}ToHitData=[w:Morning Star+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+2, vs SM:2d4, L:1d6+1, + Str bonus}}DmgData=[w:Morning Star+2,sb:1,+:2,SM:2d4,L:1+1d6]{{desc=This is a fine magical Morning Star. The knobbly bit on the chain has very sharp spikes that seem extra pointy, and is a +[[2]] magical weapon at all times.}}'},
						{name:'Ogre-Club-Flyswatter+2+4',type:'Melee|Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ogre Club of Flyswatting +2,+4}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Ogre-Club,Melee,1H,Clubs],[Ogre-Club,Melee,1H,Clubs]{{To-hit=+2, +4 vs insectoids, + Str bonus, requires Str 18 to wield}}ToHitData=[w:Ogre-Club+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4],[w:Ogre-Club+4 vs insectoids,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation if strong enough, Bludgeoning}}{{Damage=+2, +4 vs insectoids, vs SM:2d8, L:2d8, + Str bonus}}DmgData=[w:Ogre-Club+2,sb:1,+:2,SM:2d8,L:2d8],[w:Ogre-Club+4 vs Insectoids,sb:1,+:4,SM:2d8,L:2d8]{{desc=This is a large, heavy club needing a strength of at least 18 to wield, originally used by an Ogre. A [Medallion of Flyswatting](-MI-DB|Medallion-of-Flyswatting) has been attached. When attached to any type of weapon, will turn it into +2, +4 vs Insectoids - any existing plusses and powers are "overwritten" while this medallion is attached. On examination it will be found to display the holy symbol of the holder (changes with holder), and may be used to turn undead at +1 level, cumulative with other turning undead items or powers. If used by a holder with no power to turn, gives power as a 1st level cleric}}'},
						{name:'Ogre-club+0',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ogre Club +0}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Ogre-Club,Melee,1H,Clubs]{{To-hit=+0 + Str bonus, requires Str 18 to wield}}ToHitData=[w:Ogre-Club+0,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation if strong enough, Bludgeoning}}{{Damage=+0, vs SM:2d8, L:2d8, + Str bonus}}DmgData=[w:Ogre-Club+0,sb:1,+:0,SM:2d8,L:2d8]{{desc=This is a large, heavy club needing a strength of at least 18 to wield, which hits as a magic weapon but at +[[0]]. The wood is incredibly dense but still heavily blood-stained, and is a +[[0]] magical weapon at all times.}}'},
						{name:'Partisan',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Partisan}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Partisan,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Partisan,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10-14,sp:9]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d6+1, + Str bonus}}DmgData=[w:Partisan,sb:1,+:0,SM:1d6,L:1+1d6]{{desc=This is a normal Partisan, a type of Polearm. The point is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nShorter than the awl pike but longer than the spear, the partisan is a broad spear-head mounted on an eight-foot-long shaft. Two smaller blades project out from the base of the main blade, just to increase damage and trap weapons. Since it is a thrusting weapon, it can be used in closely packed formations.}}'},
						{name:'Powerful-Longsword+2',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Powerful Longsword+2}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Longsword+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+2 + Str bonus}}DmgData=[w:Longsword+2,sb:1,+:2,SM:1d8,L:1d12]{{Powers=[View](!magic --view-spell mi-power|@{selected|token_id}|6) or [Use](!magic --cast-spell mi-power|@{selected|token_id}|6) powers}}{{desc=This is a very fine magical sword, perhaps with some personality. The blade is very sharp and keen, and is a +[[2]] magical weapon at all times, and it also seems to exude power! Use the *View* and *Use* buttons to see what it does.}}'},
						{name:'Quarterstaff',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Quarterstaff}}{{subtitle=Staff}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=2-handed melee staff}}Specs=[Quarterstaff,Melee,2H,Staff]{{To-hit=+0 + Str bonus}}ToHitData=[w:Quarterstaff,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:B,r:5,sp:4,wt:4]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d6, L:1d6, + Str bonus}}DmgData=[w:Quarterstaff,sb:1,+:0,SM:1d6,L:1d6]{{desc=A good, hardwood quarterstaff that is well balanced but nothing out of the ordinary}}'},
						{name:'Quarterstaff+1',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Quarterstaff+1}}{{subtitle=Staff}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=2-handed melee staff}}Specs=[Quarterstaff,Melee,2H,Staff]{{To-hit=+1 + Str bonus}}ToHitData=[w:Quarterstaff,sb:1,+:1,n:1,ch:20,cm:1,sz:L,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+1, vs SM:1d6, L:1d6, + Str bonus}}DmgData=[w:Quarterstaff,sb:1,+:1,SM:1d6,L:1d6]{{desc=An excellent hardwood quarterstaff that is exceptionally well balanced and has a slight warm shine to the wood. A +[[1]] weapon at all times}}'},
						{name:'Quarterstaff-of-Dancing',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Quarterstaff-of-Dancing}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=2-handed \\amp dancing melee staff}}Specs=[Quarterstaff,Melee,2H,Staff]{{To-hit=+1/2/3/4 increasing over 4 rounds, + Str bonus (no bonus when dancing)}}ToHitData=[w:Quarterstaff-of-Dancing,sb:1,+:1,n:1,ch:20,cm:1,sz:L,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation, even when dancing, Bludgeoning}}{{Damage=+1/2/3/4 increasing over 4 rounds, vs SM: 1d6, L:1d6, + Str bonus (no bonus when dancing)}}DmgData=[w:Quarterstaff-of-Dancing,sb:1,+:1,SM:1d6,L:1d6]{{desc=This quarterstaff acts the same as a standard Sword of Dancing. Round one weapon is +1, on the second +2, on the third +3, and on the fourth it is +4. On the fifth round, it drops back to +1 and the cycle begins again. In addition, after four rounds of melee its wielder can opt to allow it to "dance."\nDancing consists of loosing the staff on any round (after the first) when its bonus is +1. The staff then fights on its own at the same level of experience as its wielder. After four rounds of dancing, the staff returns to its wielder, who must hold it (and use it) for four rounds before it can dance again. When dancing, the staff will leave its owner\'s hand and may go up to [[30]] feet distant. At the end of its fourth round of solo combat, it will move to its possessor\'s hand automatically. Note that when dancing the staff cannot be physically hit, although certain magical attacks such as a fireball, lightning bolt, or transmute metal to wood spell could affect it.\nFinally, remember that the dancing staff fights alone exactly the same; if a 7th-level thief is the wielder, the staff will so fight when dancing. Relieved of his weapon for four melee rounds, the possessor may act in virtually any manner desired—resting, discharging missiles, drawing another weapon and engaging in hand-to-hand combat, etc.—as long as he remains within [[30]] feet of the staff. If he moves more than 30 feet from the weapon, it falls lifeless to the ground and is a +1 weapon when again grasped.}}'},
						{name:'Rainbow-Bow',type:'Innate-Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Rainbow Shortbow}}{{subtitle=Bow}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=2-handed ranged magical bow conjured by the *Rainbow* spell}}Specs=[Rainbow-Bow,Innate-Ranged,2H,Rainbow-bow]{{To-hit=Use only Rainbow arrows to gain Dex \\amp Str bonuses}}ToHitData=[w:Rainbow Bow,sb:1,db:1,+:0,n:4,ch:20,cm:1,sz:M,ty:P,sp:6,rc:uncharged]{{Attacks=Up to 4 per round regardless of level or specialisation}}{{desc=This is a magical composite shortbow (otherwise known as a Recurve Bow) conjured by the Rainbow spell. The limbs appear to be made from the light of a rainbow!}}'},
						{name:'Ranseur',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ranseur}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Ranseur,Melee,2H,Polearm],[Ranseur,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Ranseur,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10-14,sp:8],[w:Ranseur set vs charge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10-14,sp:8]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:2d4, L:2d4, if set vs charge SM:4d4, L:4d4, + Str bonus}}DmgData=[w:Ranseur,sb:1,+:0,SM:2d4,L:2d4],[w:Ranseur vs charge,sb:1,+:0,SM:4d4,L:4d4]{{desc=This is a normal Ranseurn, a type of Polearm. The point is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nVery much like the partisan, the Ranseur differs in that the main blade is thinner and the projecting blades extended more like tines of a fork. These can trap a weapon and sometimes punch through armor.}}'},
						{name:'Rapier',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Rapier}}{{subtitle=Sword}}{{Speed=[[2]]}}{{Size=Medium}}{{Weapon=1-handed melee fencing-blade}}Specs=[Rapier,Melee,1H,Fencing-blade]{{To-hit=+0 no bonuses}}ToHitData=[w:Rapier,sb:0,+:0,n:2,ch:20,cm:1,sz:M,ty:P,r:5,sp:2]{{Attacks=2 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d4+2, L:1d4, no bonuses}}DmgData=[w:Rapier,sb:0,+:0,SM:2+1d4,L:1d4]{{desc=This is a normal fencing sword. The blade is sharp but is otherwise unremarkable.}}'},
						{name:'Rapier-for-Thieves',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Thieves Rapier}}{{subtitle=Sword}}{{Speed=[[2]]}}{{Size=Medium}}{{Weapon=1-handed melee fencing-blade}}Specs=[Thieves-Rapier,Melee,1H,Fencing-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Rapier,sb:1,+:1,n:2,ch:20,cm:1,sz:M,ty:P,r:5,sp:2]{{Attacks=2 per round + level, Piercing}}{{Damage=+1, vs SM:1d4+2, L:1d4, + Str bonus}}DmgData=[w:Rapier,sb:1,+:1,SM:2+1d4,L:1d4]{{desc=This is a normal fencing sword, but extra-effective in the hands of a thief. The blade is sharp but is otherwise unremarkable.}}'},
						{name:'Scimitar',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scimitar}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Scimitar,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar,sb:1,+:0,SM:1d8,L:1d8]{{desc=This is a normal sword. The blade is sharp but is otherwise unremarkable.}}'},
						{name:'Scimitar+',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Scimitar}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+?}}{{damage=+?}}{{Normal=[TSM:1d8+?](!\\amp#13;\\amp#47;r 1d8+0)[LH:1d8+?](!\\amp#13;\\amp#47;r 1d8+0)}}{{desc=This is an unknown, fine-quality scimitar}}'},
						{name:'Scimitar+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scimitar+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Scimitar+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar+1,sb:1,+:1,SM:1d8,L:1d8]{{desc=This is a normal magical sword. The blade is very sharp and shimmers with a silvery hue, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Scimitar+2',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scimitar+2}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Scimitar+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+2, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar+2,sb:1,+:2,SM:1d8,L:1d8]{{desc=This is a normal magical sword. The blade is very sharp and shimmers with a silvery hue, and is a +[[2]] magical weapon at all times.}}'},
						{name:'Scimitar+3',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scimitar+3}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+3 + Str bonus}}ToHitData=[w:Scimitar+3,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+3, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar+3,sb:1,+:3,SM:1d8,L:1d8]{{desc=This is a normal magical sword. The blade is very sharp and shimmers with a silvery hue, and is a +[[3]] magical weapon at all times.}}'},
						{name:'Scimitar-of-Adaptation+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scimitar of Adaptation +1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Scimitar of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar of Adapt+1,sb:1,+:1,SM:1d8,L:1d8]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Scourge',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Scourge}}{{subtitle=Whip}}{{Speed=[[5]]}}{{Size=Small}}{{Weapon=1-handed melee whip}}Specs=[Scourge,Melee,1H,Whips]{{To-hit=+0 + Str bonus}}ToHitData=[w:Scourge,sb:1,+:0,n:1,ch:20,cm:1,sz:S,ty:N,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d4, L:1d2, + Str bonus}}DmgData=[w:Scourge,sb:1,+:0,SM:1d4,L:1d2]{{desc=A standard Scourge of good quality, but nothing special.\nThis wicked weapon is a short whip with several thongs or tails. Each thong is studded with metal barbs, resulting in a terrible lash. It is sometimes used as an instrument of execution.}}'},
						{name:'Shadowbane-Broadsword',type:'Melee|Melee|Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sword +2, Dragon Slayer (special)}}{{subtitle=Magic Sword}}{{Speed=[[5]] or by sword}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Broad-sword,Melee,1H,Long-blade],[Broad-sword,Melee,1H,Long-blade],[Broad-sword,Melee,1H,Long-blade],[Broad-sword,Melee,1H,Long-blade]{{To-hit=+2, +4 vs dragons, + Str bonus}}ToHitData=[w:Shadowbane+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Shadowbane vs Dragon,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Shadowbane vs Silver,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Shadowbane vs Black,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+2, +4 vs dragons except Silver \\amp Black}}DmgData=[w:Shadowbane+2,sb:1,+:2,SM:2d4,L:1+1d6],[w:Shadowbane vs Dragon,sb:1,+:4,SM:1d12,L:1d12],[w:Shadowbane vs Silver,sb:1,+:2,SM:2d4,L:1+1d6],[w:Shadowbane vs Black,sb:1,+:4,SM:2000,L:2000]{{Special=vs. Black Dragon, a hit kills, then sword disintegrates\nvs. Silver Dragon normal damage}}{{desc=This has a +[[4]] bonus against any sort of true dragon. It automatically kills one sort of dragon but then immediately disintegrates and can no longer be used. Note that an unusual sword with intelligence and alignment will not be made to slay dragons of the same alignment. Determine dragon type (excluding unique ones like Bahamut and Tiamat) by rolling 1d10:\n1 black (CE) 6 gold (LG)\n2 blue (LE) 7 green (LE)\n3 brass (CG) 8 red (CE)\n4 bronze (LG) 9 silver (LG)\n5 copper (CG) 10 white (CE)}}'},
						{name:'Shillelagh',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shillelagh}}{{subtitle=Magical Bludgeoning Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Club,Melee,1H,Clubs]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Shillelagh,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Bludgeoning}}{{Damage=+1 + Str Bonus, vs SM:2d4, L:1+1d4}}DmgData=[w:Club,sb:1,+:1,SM:2d4,L:1+1d4]{{desc=This is a good club improved with the Level 1 Priest spell, Shillelagh. The wood is hard and heavy, and gleams with a magical aura.}}'},
						{name:'Shortbow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shortbow}}{{subtitle=Bow}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=2-handed ranged bow}}Specs=[Shortbow,Ranged,2H,Bow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Shortbow,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:7]{{Attacks=2 per round, no increases, Piercing}}{{desc=This is a normal shortbow. The wood is polished, the string taut, but nothing special.}}'},
						{name:'Shortsword',type:'Melee',ct:'3',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shortsword}}{{subtitle=Sword}}{{Speed=[[3]]}}{{Size=Medium}}{{Weapon=1-handed melee short-blade}}Specs=[Short-sword,Melee,1H,Short-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Shortsword,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:3]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d8, + Str bonus}}DmgData=[w:Shortsword,sb:1,+:0,SM:1d6,L:1d8]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Shortsword+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shortsword+1}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}{{Size=Medium}}{{Weapon=1-handed melee short-blade}}Specs=[Short-sword,Melee,1H,Short-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Shortsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:5]{{Damage=+1 + Str Bonus}}DmgData=[w:Shortsword+1,sb:1,+:1,SM:1d6,L:1d8]{{desc=This is a normal magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Shortsword-of-Adaptation+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Shortsword of Adaptation +1}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}{{Size=Medium}}{{Weapon=1-handed melee short-blade}}Specs=[Short-sword,Melee,1H,Short-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Shortsword of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+1, vs SM:1d6, L:1d8, + Str bonus}}DmgData=[w:Shortsword of Adapt+1,sb:1,+:1,SM:1d6,L:1d8]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Sickle',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sickle}}{{subtitle=Short Blade}}{{Speed=[[5]]}}{{Size=Small}}{{Weapon=1-handed melee short-blade}}Specs=[Sickle,Melee,1H,Short-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Sickle,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d4+1, L:1d4}}DmgData=[w:Sickle,sb:1,+:0,SM:1+1d4,L:1d4]{{desc=This is a normal Sickle. The blade is sharp and keen, but nothing special.}}'},
						{name:'Sling',type:'Ranged|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sling}}{{subtitle=Ranged Weapon}}{{Speed=2H [[6]]/1H [[7]]}}{{Size=Small}}{{Weapon=1- or 2-handed ranged sling}}Specs=[Sling,Ranged,1H,Slings],[Sling,Ranged,2H,Slings]}}{{To-hit=+0 + Dex bonus}}ToHitData=[w:Sling,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:S,ty:B,sp:7,r:Varies by ammo],[w:Sling,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:S,ty:B,sp:6,r:Varies by ammo]{{Attacks=1-handed=1/round, 2-handed=2/round, Bludgeoning}}{{desc=A sling, made of supple leather. Can be either 1-handed or 2-handed. However, 1-handed is slightly slower to load and fire and requires more coordination, and thus can only get 1 shot per round. 2-handed gets 2 shots per round}}'},
						{name:'Spear',type:'Melee|Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Spear}}{{subtitle=Spear}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown spear}}Specs=[Spear,Melee,1H,Spears],[Spear,Ranged,1H,Spears]{{To-hit=+0 + Str \\amp Dex bonuses}}ToHitData=[w:Spear,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:8,sp:6],[w:Spear,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,sp:6]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d8, + Str bonus}}DmgData=[w:Spear,sb:1,+:0,SM:1d6,L:1d8],[]{{Ammo=+0, vs SM:1d6, L:1d8, + Str bonus}}AmmoData=[w:Spear,t:Spear,st:Spear,sb:1,+:0,SM:1d6,L:1d8]}}{{Range=S:10, M:20, L:30}}RangeData=[t:Spear,+:0,r:1/2/3]{{desc=This is a normal Spear. The point is sharp and it is well balanced, but nothing special.}}'},
						{name:'Spetum',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Spetum}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Spetum,Melee,2H,Polearm],[Spetum,Melee,2H,Polearm]}}{{To-hit=+0 + Str bonus}}ToHitData=[w:Spetum,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:8-10,sp:8],[w:Spetum set vs charge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:8-10,sp:8]((Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d6+1, L:2d6, if set vs charge SM:2d6+2, L:4d6, + Str bonus}}DmgData=[w:Spetum,sb:1,+:0,SM:1+1d6,L:2d6],[w:Spetum vs charge,sb:1,+:0,SM:2+2d6,L:4d6]{{desc=This is a normal Spetum, a type of Polearm. The point is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nThe spetum is a modification of the normal spear. The shaft increases to eight to ten feet and side blades are added. Some have blades that angle back, increasing the damage when pulling the weapon out of a wound. These blades can also trap and block weapons or catch and hold an opponent.}}'},
						{name:'Spiritual-Hammer+1',type:'Innate-Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Spiritual Hammer+1}}{{subtitle=Hammer/Club}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed magically remote melee club}}Specs=[Spiritual Hammer,Innate-Melee,1H,Innate]{{To-hit=+1, no other bonuses}}ToHitData=[w:Spiritual-Hammer+1,sb:0,+:1,n:1,ch:20,cm:1,sz:M, ty:B, r:Varies,sp:5],{{Attacks=1 per round, no effect from level or specialisation, Bludgeoning}}{{Damage=+1, vs SM:1d4+1, L:1d4, no Str bonus}}DmgData=[w:Spiritual-Hammer+1,sb:0,+:1,SM:1+1d4,vs L:1d4]{{desc=A hammer conjured by a priest using a Spiritual Hammer spell. Base Thac0 same as caster [[@{selected|thac0-base}]] without strength bonus plus magical plus of +[[{{(ceil(@{selected|Casting-Level}/6)),3}kl1}]]. Damage is plus magical bonus but no others. Hits are in the direction caster is facing, allowing rear attacks. Dispel Magic on caster or hammer can dispel. Stopping concentrating dispels. Magic Resistance checked in 1st round and spell lost if made or full effect if not.}}'},
						{name:'Spiritual-Hammer+2',type:'Innate-Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Spiritual Hammer+1}}{{subtitle=Hammer/Club}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed magically remote melee club}}Specs=[Spiritual Hammer,Innate-Melee,1H,Innate]{{To-hit=+2, no other bonuses}}ToHitData=[w:Spiritual-Hammer+2,sb:0,+:2,n:1,ch:20,cm:1,sz:M, ty:B, r:Varies,sp:5],{{Attacks=1 per round, no effect from level or specialisation, Bludgeoning}}{{Damage=+2, vs SM:1d4+1, L:1d4, no Str bonus}}DmgData=[w:Spiritual-Hammer+2,sb:0,+:2,SM:1+1d4,vs L:1d4]{{desc=A hammer conjured by a priest using a Spiritual Hammer spell. Base Thac0 same as caster [[@{selected|thac0-base}]] without strength bonus plus magical plus of +[[{{(ceil(@{selected|Casting-Level}/6)),3}kl1}]]. Damage is plus magical bonus but no others. Hits are in the direction caster is facing, allowing rear attacks. Dispel Magic on caster or hammer can dispel. Stopping concentrating dispels. Magic Resistance checked in 1st round and spell lost if made or full effect if not.}}'},
						{name:'Spiritual-Hammer+3',type:'Innate-Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Spiritual Hammer+1}}{{subtitle=Hammer/Club}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed magically remote melee club}}Specs=[Spiritual Hammer,Innate-Melee,1H,Innate]{{To-hit=+3, no other bonuses}}ToHitData=[w:Spiritual-Hammer+3,sb:0,+:3,n:1,ch:20,cm:1,sz:M, ty:B, r:Varies,sp:5],{{Attacks=1 per round, no effect from level or specialisation, Bludgeoning}}{{Damage=+3, vs SM:1d4+1, L:1d4, no Str bonus}}DmgData=[w:Spiritual-Hammer+3,sb:0,+:3,SM:1+1d4,vs L:1d4]{{desc=A hammer conjured by a priest using a Spiritual Hammer spell. Base Thac0 same as caster [[@{selected|thac0-base}]] without strength bonus plus magical plus of +[[{{(ceil(@{selected|Casting-Level}/6)),3}kl1}]]. Damage is plus magical bonus but no others. Hits are in the direction caster is facing, allowing rear attacks. Dispel Magic on caster or hammer can dispel. Stopping concentrating dispels. Magic Resistance checked in 1st round and spell lost if made or full effect if not.}}'},
						{name:'Staff-Sling',type:'Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Staff-Sling}}{{subtitle=Ranged Weapon}}{{Speed=[[11]]}}{{Size=Medium}}{{Weapon=2-handed ranged sling}}Specs=[Staff-Sling,Ranged,2H,Slings]{{To-hit=+0 no bonuses}}ToHitData=[w:Staff-Sling,sb:0,+:0,n:2,ch:20,cm:1,sz:S,ty:B,r:+2/+3/+4,sp:6]{{Attacks=2 per round + level \\amp specialisation, Bludgeoning}}{{desc=A staff sling, made of supple leather and a sturdy pole. Ideal for slinging balls for dogs to fetch...}}'},
						{name:'Strong-Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Strong Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0, + Str \\amp Dex bonuses}}ToHitData=[w:Longbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]{{Attacks=2 per round + level \\amp specialisation, Piercing}}{{desc=This is a longbow with strong limbs, able to be drawn by a very strong bowyer, incorporating strength bonuses. The wood is polished, the limbs flexible, the string taut, but nothing special.}}'},
						{name:'Sword-of-adaptation+1',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}Specs=[Sword of Adaptation,Melee,1H,Sword]{{To-hit=+[[1]]}}{{damage=+[[1]]}}{{Roll=Varies by use}}{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Throwing-Axe',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Throwing Axe}}{{subtitle=Axe}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee \\amp thrown axe}}Specs=[Throwing Axe,Melee,1H,Axe],[Throwing Axe,Ranged,1H,Axe]{{To-hit=+0, + Str \\amp Dex bonuses}}ToHitData=[w:Throwing Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:4],[w:Throwing Axe,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,sp:4]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Throwing Axe,sb:1,+:0,SM:1d6,L:1d4],[]{{Ammo=+0, SM:1d6, L:1d4, + Str bonus}}AmmoData=[w:Throwing Axe,t:Throwing Axe,st:Axe,sb:1,+:0,SM:1d6,L:1d4]}}{{Range=S:10, M:20, L:30}}RangeData=[t:Throwing Axe,+:0,r:1/2/3]{{desc=This is a normal Hand- or Throwing-Axe. The blade is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Throwing-Dagger+4',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Throwing Dagger +0/+4}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or thrown short-blade}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+0, +4 when thrown, + Str \\amp Dex bonus}}ToHitData=[w:Throwing Dagger+0,sb:1,+:0,n:2,ch:20,cm:1,sz:S,ty:S,r:5,sp:2],[w:Throwing-Dagger+4,sb:1,db:1,+:4,n:2,ch:20,cm:1,sz:S,ty:P,sp:2]{{Attacks=2 per round + level \\amp specialisation, Slashing \\amp Piercing}}{{Damage=+0, vs SM:1d4, L:1d3, + Str bonus}}DmgData=[w:Throwing Dagger+0,sb:1,+:0,SM:1d4,L:1d3],[ ]}}{{Ammo=+4, vs SM:1d4, L:1d3, + Str bonus}}AmmoData=[w:Throwing Dagger+4,t:Dagger,st:Dagger,sb:1,+:4,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:Dagger,+:4,r:1/2/3]{{desc=This is a finely balanced throwing dagger, which is +4 to hit and for damage when thrown (though it has no bonuses if used in the hand)}}'},
						{name:'Throwing-axe+1',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Throwing Axe+1}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown axe}}Specs=[Throwing-Axe,Melee,1H,Axe],[Throwing-Axe,Ranged,1H,Throwing-blade]{{To-hit=+1 + Str \\amp Dex bonuses}}ToHitData=[w:Throwing Axe+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:3,sp:4],[w:Throwing Axe+1,sb:1,db:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,sp:4,r:-/1/2/3]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+1, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Throwing Axe+1,sb:1,+:1,SM:1d6,L:1d4],[]}}{{Ammo=+1, vs SM:1d6, L:1d4, + Str bonus}}AmmoData=[w:Throwing Axe,t:Throwing-Axe,sb:1,+:1,SM:1d6,L:1d4]{{Range=S:10, M:20, L:30}}RangeData=[t:Throwing-Axe,+:1,r:-/1/2/3]{{desc=A standard Throwing Axe of fine quality, good enough to be enchanted to be a +1 magical weapon}}'},
						{name:'Touch',type:'Melee|Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Touch}}{{subtitle=Innate Action}}{{Speed=[[0]]}}{{Size=None}}{{Weapon=1- or 2-handed melee innate ability}}Specs=[Innate,Melee,1H,Innate],[Innate,Melee,2H,Innate]{{To-hit=+0 + Str bonus}}ToHitData=[w:Touch,sb:1,+:0,n:1,ch:20,cm:1,sz:T,ty:B,r:5,sp:0],[w:Touch,sb:1,+:0,n:1,ch:20,cm:1,sz:T,ty:B,r:5,sp:0]{{Attacks=1 per round + level}}{{Damage=None}}DmgData=[w:Touch,sb:0,+:0,SM:0,L:0],[w:Touch,sb:0,+:0,SM:0,L:0]}}{{desc=Touching with a hand or other limb not containing a weapon. Typically a spell caster\'s ability which they select as a weapon when aiming to use a Touch spell}}'},
						{name:'Trident',type:'Melee|Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Fine quality Trident}}{{subtitle=Weapon}}{{Speed=By type}}{{Size=Medium}}Specs=[Trident,Melee,1H,Spears],[Trident,Ranged,1H,Spears]{{To-hit=+?}}{{damage=+?}}{{Other Powers=Unknown}}{{desc=This definitely appears to be a trident, and the DM will describe it more if you pick it up to look closely at it}}'},
						{name:'Trident-of-Fish-Command',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Trident of Fish Command}}{{subtitle=Weapon}}{{Speed=7}}{{Size=Large}}{{Weapon=1-handed melee or thrown spear}}Specs=[Trident,Melee,1H,Spears],[Trident,Ranged,1H,Spears]{{To-hit=+3 + Str \\amp Dex bonuses}}ToHitData=[w:Trident Fish Command,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,r:8,sp:7],[w:Trident Fish Command,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+3, vs SM:1d6+1, L:3d4, + Str bonus}}DmgData=[w:Trident Fish Command,sb:1,+:3,SM:1+1d6,L:3d4],[]{{Ammo=+3, vs SM:1d6+1, L:3d4, + Str bonus}}AmmoData=[w:Trident Fish Command,t:Trident,st:Spear,sb:1,+:3,qty:1,SM:1+1d6,L:3d4]{{Range=S:10, L:20}}RangeData=[t:Trident,+:3,r:1/1/2]{{Other Powers=Fish Command}}{{desc=This three-tined fork atop a stout 6-foot long rod appears to be a barbed military fork of some sort. However, its magical properties enable its wielder to cause all fish within a 60-foot radius to roll saving throws vs. spell. This uses one charge of the trident. Fish failing this throw are completely under empathic command and will not attack the possessor of the trident nor any creature within 10 feet of him. The wielder of the device can cause fish to move in whatever direction is desired and can convey messages of emotion (i.e., fear, hunger, anger, indifference, repletion, etc.). Fish making their saving throw are free of empathic control, but they will not approach within 10 feet of the trident.\nIn addition to ordinary fish, the trident affects sharks and eels. It doesn\'t affect molluscs, crustaceans, amphibians, reptiles, mammals, and similar sorts of non-piscine marine creatures. A school of fish should be checked as a single entity.\nA trident of this type contains 1d4+16 charges. It is otherwise a +1 magical weapon.}}'},
						{name:'Trident-of-Warning',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Trident of Warning}}{{subtitle=Weapon}}{{Speed=7}}{{Size=Large}}{{Weapon=1-handed melee or thrown spear}}Specs=[Trident,Melee,1H,Spears],[Trident,Ranged,1H,Spears]{{To-hit=+3 + Str \\amp Dex bonuses}}ToHitData=[w:Trident of Warning,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,r:8,sp:7],[w:Trident of Warning,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+3, vs SM:1d6+1, L:3d4, + Str bonus}}DmgData=[w:Trident of Warning,sb:1,+:3,SM:1+1d6,L:3d4],[]{{Ammo=+3, vs SM:1d6+1, L:3d4, + Str bonus}}AmmoData=[w:Trident of Warning,t:Trident,st:Spear,sb:1,+:3,qty:1,SM:1+1d6,L:3d4]{{Range=S:10, L:20}}RangeData=[t:Trident,+:3,r:1/1/2]{{Other Powers=Aquatic Hostiles detection}}{{desc=A weapon of this type enables its wielder to determine the location, depth, species, and number of hostile or hungry marine predators within 240 feet. A trident of warning must be grasped and pointed in order for the person using it to gain such information, and it requires one round to scan a hemisphere with a radius of 240 feet. There are 19-24 charges in a trident of this type, each charge sufficient to last for two rounds of scanning. The weapon is otherwise a +2 magical weapon}}'},
						{name:'Two-Handed-Sword',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Two Handed Sword}}{{subtitle=Sword}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed melee long-blade}}Specs=[Two-Handed-Sword,Melee,2H,long-blade|great-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Two-Handed-Sword,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:10]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d10, L:3d6, + Str bonus}}DmgData=[w:Two-Handed-Sword,sb:1,+:0,SM:1d10,L:3d6]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Two-Handed-Sword+1',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Two Handed Sword+1}}{{subtitle=Magic Sword}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed melee long-blade}}Specs=[Two-Handed-Sword,Melee,2H,Long-blade|Great-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Two-Handed-Sword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:10]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d10, L:3d6, + Str bonus}}DmgData=[w:Two-Handed-Sword,sb:1,+:1,SM:1d10,L:3d6]{{desc=This is a really well balanced sword. The blade is extra sharp and keen, and has a magical glint.}}'},
						{name:'Two-Handed-Sword-of-Adaptation+1',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Two Handed Sword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed melee long-blade}}Specs=[Two-Handed-Sword,Melee,2H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Two-Handed Sword of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:10]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d10, L:3d6, + Str bonus}}DmgData=[w:Two-Handed Sword of Adapt+1,sb:1,+:1,SM:1d10,L:3d6]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Voulge',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Voulge}}{{subtitle=Polearm}}{{Speed=[[10]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Voulge,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Voulge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:7-8,sp:10]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0 vs SM:2d4, L:2d4}}DmgData=[w:Voulge,sb:1,+:0,SM:2d4,L:2d4]{{desc=This is a normal Voulge a type of Polearm. The blade is sharp and keen, but nothing special.\nThe voulge, like the bardich, is a variation on the axe and the cleaver. The voulge is little more than a cleaver on the end of a long (seven- to eight-foot) pole. It is a popular weapon, easy to make and simple to learn. It is also called the Lochaber axe.}}'},
						{name:'Warhammer',type:'Melee|Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Warhammer}}{{subtitle=Hammer/Club}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown club}}Specs=[Warhammer,Melee,1H,Clubs],[Warhammer,Ranged,1H,Clubs]{{To-hit=+0 + Str \\amp Dex bonus}}ToHitData=[name w:Warhammer,strength bonus sb:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:B, range r:5,speed sp:4],[name w:Warhammer,strength bonus sb:1,dexterity bonus db:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:B, speed sp:4]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d4+1, L:1d4, + Str bonus}}DmgData=[name w:Warhammer,strength bonus sb:1,magic+:0,vs SM:1+1d4,vs L:1d4][]{{Ammo=+0, vs SM:1d4+1, L:1d4, + Str bonus}}AmmoData=[w:Warhammer,t:Warhammer,st:Throwing-club,sb:1,+:0,SM:1+1d4,L:1d4]{{Range=S:10, M:20, L:30}}RangeData=[t:Warhammer,+:0,r:1/2/3]{{desc=This is a normal warhammer. The blade is sharp and keen, but nothing special.}}'},
						{name:'Wave',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Wave\nIntelligent, Neutral}}{{subtitle=Magic Trident}}{{Speed=[[7]]}}{{Size=M}}{{Weapon=1-handed melee or thrown spear}}Specs=[Trident,Melee,1H,Spears],[Trident,Ranged,1H,Spears]{{To-hit=+3 + Str bonus}}ToHitData=[w:Wave,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,r:8,sp:7],[w:Wave,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+3, vs SM:1d6+1, L:3d4, + Str bonus}}DmgData=[w:Wave,sb:1,+:3,SM:1+1d6,L:3d4],[]{{Ammo=+3, vs SM:1d6+1, L:3d4, + Str bonus}}AmmoData=[w:Wave,t:Trident,st:Spear,sb:1,+:3,SM:1+1d6,L:3d4,qty:1]{{Range=S:10, L:20}}RangeData=[t:Trident,+:3,r:1/1/2]{{desc=**Wave**\nWeapon (trident), legendary (requires attunement by a creature that worships a god of the sea)\n\n**Powers**\n+3 bonus to attack and damage rolls\nCritical hit causes extra damage of half target\'s HP maximum.\nFunctions as\n[Trident of Fish Command](-Trident-of-Fish-Command)\n[Weapon of Warning](-Trident-of-Warning)\n[Cap of Water Breathing](!rounds --target caster|@{selected|tokenID|Wave-Breath|99|0|Breathing under water|strong)\n[Cube of Force](-MI-DB|Cube-of-Force)\n[Squeak with Aquatic Animals](-PR-Spells-DB|Speak-with-Animals)\n\n***Sentience:*** Neutral alignment, Int 14, Wisdom 10, Chr 18. Hearing and *darkvision* range [[120]] feet. Telepathic with wielder, can speak, read, and understand Aquan\n\n**[Click here to see Wave handout for *Personality* and *Purpose*](http://journal.roll20.net/handout/-KdlsAAepzd1bKBYW_v3)**}}\n!setattr --charid @{selected|character_id} --silent --casting-level|12 --casting-name|Wave'},
						{name:'Whelm',type:'Melee|Ranged',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Whelm\nIntelligent, Lawful Neutral}}{{subtitle=Magic Warhammer}}{{Speed=[[10]]}}{{Size=M}}WeapData=[w:Whelm,ns:4][cl:PW,w:Whelm-Shockwave,sp:10,pd:1,lv:12],[cl:PW,w:Whelm-Detect-Evil,sp:10,pd:1,lv:12],[cl:PW,w:Whelm-Detect-Good,sp:10,pd:1,lv:12],[cl:PW,w:Whelm-Locate-Object,sp:100,pd:1,lv:12]{{Weapon=1-handed melee or thrown club}}Specs=[Warhammer,Melee,1H,Clubs],[Warhammer,Ranged,1H,Throwing-Clubs]{{To-hit=+3 + Str \\amp Dex bonuses}}ToHitData=[w:Whelm,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4],[w:Whelm,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:M,ty:B,sp:4]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+3, vs SM:1d4+1, L:1d4, + Str bonus}}DmgData=[w:Whelm,sb:1,+:3,SM:1+1d4,L:1d4],[]{{Ammo=+3, vs SM:1d4+1d8+1, L:1d4+2d8, + Str Bonus, and automatically returns}}AmmoData=[w:Whelm,t:Warhammer,st:Throwing-club,+:3,ru:1,SM:1+1d4+1d8,L:1d4+2d8]{{Range=S:20, M:40, L:60}}RangeData=[t:Warhammer,+:3,r:2/4/6]{{desc=**Whelm:** Weapon (warhammer), legendary. Powerful war-hammer forged by dwarves.\n\n**Attacks:** +3 attack and damage rolls.\n**Disadvantage:** Wielder has fear of being outdoors. Disadvantage (roll twice and take the worse outcome) on attack, saves, and ability checks under daytime sky.\n**Thrown Weapon:** range 20/40/60 feet. extra 1d8 (TSM) 2d8 (LG) bludgeoning damage when thrown. Flies back to your hand after attack. If don\'t have hand free, weapon lands at your feet.\n[Shock Wave](!magic --mi-power @{selected|token_id}|Whelm-Shock-Wave|Whelm|12): Strike the ground with *Whelm* and send out *Shock Wave* (1 per day). Creatures of your choice within [[60]]ft of impact point must save vs. Staves or stunned for [[1]] turn (additional save each round)\n[Detect Evil](!magic --mi-power @{selected|token_id}|Whelm-Detect-Evil|Whelm|12) 1/day\n[Detect Good](!magic --mi-power @{selected|token_id}|Whelm-Detect-Good|Whelm|12) 1/day\n[Locate Object](!magic --mi-power @{selected|token_id}|Whelm-Locate-Object|Whelm|12) 1/day\n\n***Sentience:*** Lawful Neutral weapon, Int 15, Wisdom 12, Chr 15.Hearing and *darkvision* range 120 ft, uses powers at L12. Communicates telepathically with wielder and can speak, read, and understand Dwarvish. Giant, and Goblin. It shouts battle cries in Dwarvish when used in combat.\n\n**[Click here to see Whelm handout for *Personality* and *Purpose*](http://journal.roll20.net/handout/-KdlOvcft0A5MZUR1Quv)**}}\n!setattr --charid @{selected|character_id} --silent --MI-used|Whelm doing Shock Wave --MI-cast|Whelm-Stunned --MI-duration|10 --MI-direction|-1 --MI-msg|Stunned roll save vs Staves again --MI-marker|fishing-net --casting-level|12 --casting-name|Whelm'},
						{name:'Whip',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Whip}}{{subtitle=Whip}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=1-handed melee whip}}Specs=[Whip,Melee,1H,Whips]{{To-hit=+0 + Str bonus}}ToHitData=[w:Whip,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:N,r:10,sp:8]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d2, L:1 + Str bonus \\amp entangle}}DmgData=[w:Whip,sb:1,+:0,SM:1d2,L:1]{{desc=A standard Whip of good quality, but nothing special.\nTo inflict damage, the whip must strike exposed or lightly covered flesh. Heavy clothing, thick hair, or fur gives considerable protection until torn away by repeated lashing. The type of armor determines how long it takes the whip to begin doing damage. With heavy clothing, damage begins on the third successful blow; thick hair or fur, on the second; padded armor, on the fourth; leather armor, on the fifth; hide armor, on the sixth. The whip can do no harm through armor heavier than that. Thick hide, such as that of an elephant or rhinoceros, will allow a slight sting at best, with no real damage inflicted.\nWhips can be up to 25ft long, and are useful for Entanglement, with various percentages for achieving this: success = 5% per level for proficient wielders, and if successful, roll 1d100 for result (1-50: a non-weapon limb, 51-60: two limbs, 61-80 weapon wielding limb, 81-00 head). You can use a called shot at -10% on success roll to be able to vary the outcome roll by 20% either way (e.g. so if successful, you could make a 35 into a 55 and entangle 2 limbs instead of one)}}'},
					]},
	MI_DB_Ammo:		{bio:'<blockquote><h2>Weapons Database</h2></blockquote><b>v5.6  01/01/2022</b><br><br>This sheet holds definitions of weapons that can be used in the RPGMaster API system.  They are defined in such a way as to be lootable and usable magic items for MagicMaster and also usable weapons in attackMaster.',
					gmnotes:'<blockquote>Change Log:</blockquote>v5.6  01/01/2022  Added summoned Rainbow Sheaf Arrows for Rainbow spell<br><br>v5.5  05/11/2021  Split the Weapon and Ammo databases<br><br>v5.4  31/10/2021  Further encoded using machine readable data to support API databases<br><br>v5.3.4  21/08/2021  Fixed incorrect damage for all types of Two-handed Sword<br><br>v5.3.3  07/06/2021  Added the missing Scimitar macro<br><br>v5.3.2  31/05/2021  Cleaned ranged weapon ranges, as specifying a range for the weapon in the {{To-Hit=...}} section will now adjust the range of the ammo by that amount (for extended range weapons).  Self-ammoed weapons (like thrown daggers) should specify their range in the {{Range=...}} section.<br><br>v5.3.1  19/05/2021  Fixed a couple of bugs, missing weapons in the transfer from MI-DB<br><br>v5.3  14/05/2021  All standard weapons from the PHB now encoded.<br><br>v5.2  12/05/2021  Added support for weapon types (S,P,B), and more standard weapons<br><br>v5.1  06/05/2021  Added a number of standard and magical weapons<br><br>v5.0  28/04/2021  Initial separation of weapons listings from the main MI-DB',
					root:'MI-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
					version:5.6,
					db:[{name:'-',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" This is a blank slot in your Magic Item bag. Go search out some new Magic Items to fill it up!'},
						{name:'Barbed-dart',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Barbed Dart}}{{subtitle=Ammo for Blowgun}}{{Speed=As per blowgun}}{{Size=Tiny}}Specs=[Barbed Dart,Ammo,1H,Blowgun]{{Ammo=For Blowgun, SM:1d3, L:1d2}}AmmoData=[w:Barbed Dart,t:Blowgun,+:0,SM:1d3,L:1d2,rc:uncharged]{{Range=1/2/3}}RangeData=[t:Blowgun,+:0,r:1/2/3]{{desc=A Blowgun dart, barbed and of good quality but otherwise ordinary}}'},
						{name:'Bullet',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sling Bullet}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Bullet,Ammo,1H,Bullet]{{Ammo=+0, vs SM:1+1d4, L:1+1d6}}AmmoData=[w:Bullet,st:Sling,+:0,SM:1+1d4,L:1+1d6],{{Range=Point Blank 6-30,\nShort 31-40,\nMedium 41-80,\nLong 81-160}}RangeData=[t:sling,+:0,r:3/4/8/16]{{desc=A Sling Bullet of good quality but otherwise ordinary}}'},
						{name:'Chalk',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Chalk Stone}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Chalk,Ammo,1H,Bullet]{{Ammo=+2, vs SM:1+1d4, L:1+1d6}}AmmoData=[w:Chalk,st:Sling,+:2,SM:1+1d4,L:1+1d6]{{Range=Point Blank 6-30,\nShort 31-50,\nMedium 51-100,\nLong 101-200}}RangeData=[t:sling,+:0,r:3/5/10/20]}}{{desc=A piece of teacher\'s chalk, which can be used to great effect in a sling (though teachers can possibly just throw it with the same effect!)}}'},
						{name:'Flight-Arrow+1',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Flight Arrow+1}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]{{Ammo=+1,\n**Warbow** vs. SM:1d8, L:1d8,\n**Other Bows** vs. SM:1d6, L:1d6, Piercing}}AmmoData=[w:Flight Arrow+1,st:Bow,+:1,SM:1d6,L:1d6,rc:uncharged],[w:Warbow Flight Arrow+1,t:warbow,+:1,SM:1d8,L:1d8,rc:uncharged]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:60, M:120, L:210,\n**Warbow:**\nS90, M:160, L:250,\n**Composite Sbow:**\nS:50, M:100, L:180,\n**Composite Lbow:**\nS:70, M:140, L:210}}RangeData=[t:longbow,sb:1,+:1,r:3/6/12/21],[t:shortbow,sb:1,+:1,r:3/5/10/15],[t:warbow,+:1,r:3/9/16/25],[t:compositelongbow,sb:1,+:1,r:3/7/14/21],[t:compositeshortbow,sb:1,+:1,r:3/5/10/18]}}{{desc=A magical Flight Arrow of fine quality}}'},
						{name:'Flight-Arrow+2',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Flight Arrow+2}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]{{Ammo=+2,\n**Warbow** vs. SM:1d8, L:1d8,\n**Other Bows** vs. SM:1d6, L:1d6, Piercing}}AmmoData=[w:Flight Arrow+2,st:Bow,sb:1,+:2,SM:1d6,L:1d6],[w:Warbow Flight Arrow+2,t:warbow,sb:1,+:2,SM:1d8,L:1d8]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:60, M:120, L:210,\n**Warbow:**\nS90, M:160, L:250,\n**Composite Sbow:**\nS:50, M:100, L:180,\n**Composite Lbow:**\nS:70, M:140, L:210}}RangeData=[t:longbow,+:2,r:3/6/12/21],[t:shortbow,+:2,r:3/5/10/15],[t:warbow,+:2,r:3/9/16/25],[t:compositelongbow,+:2,r:3/7/14/21],[t:compositeshortbow,+:2,r:3/5/10/18]}}{{desc=A magical Flight Arrow of very fine quality}}'},
						{name:'Flight-Arrows',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Flight Arrow}}{{subtitle=Ammo}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]{{Ammo=+0,\n**Warbow** vs. SM:1d8, L:1d8,\n**Other Bows** vs. SM:1d6, L:1d6, Piercing}}AmmoData=[w:Flight Arrow,st:Bow,+:0,SM:1d6,L:1d6,rc:uncharged],[w:Warbow Flight Arrow,t:warbow,+:0,SM:1d8,L:1d8,rc:uncharged]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:60, M:120, L:210,\n**Warbow:**\nS90, M:160, L:250,\n**Composite Sbow:**\nS:50, M:100, L:180,\n**Composite Lbow:**\nS:70, M:140, L:210}}RangeData=[t:longbow,sb:1,+:0,r:3/6/12/21],[t:shortbow,+:0,r:3/5/10/15],[t:warbow,sb:1,+:0,r:3/9/16/25],[t:compositelongbow,sb:1,+:0,r:3/7/14/21],[t:compositeshortbow,sb:1,+:0,r:3/5/10/18]}}{{desc=A Flight Arrow of good quality but otherwise ordinary}}'},
						{name:'Flight-arrow+?',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Flight Arrow+?}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow]{{To-hit=Unknown}}{{damage=Unknown}}{{desc=A magical Flight Arrow of very fine quality, but with unknown plusses}}'},
						{name:'Glass-Arrow+3',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Glass Sheaf Arrow+3}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Glass Arrow,Ammo,1H,Arrow],[Glass Arrow,Ammo,1H,Arrow]{{Ammo=+3 Piercing,\n**Warbow** vs\nSM:1d10, L:1d10\n**Other Bows** vs\nSM:1d8, L:1d8,\nbreaks on use}}AmmoData=[w:Glass Arrow+3,st:Bow,+:3,ru:-1,SM:1d8,L:1d8],[w:Glass Arrow+3,t:warbow,+:3,ru:-1,SM:1d10,L:1d10]{{Range=Varies by bow:\n**Longbow**\nPB:30 S:50 M:100 L:170\n**Shortbow**\nPB:30 S:40 M:80 L:150\n**Warbow**\nPB:30 S:70 M:120 L:210\n**Composite Lbow**\nPB:30 S:50 M:100 L:180\n**Composite Sbow**\nPB:30 S:50 M:100 L:150}}RangeData=[t:longbow,+:3,r:3/5/10/17],[t:shortbow,+:3,r:3/4/8/15],[t:warbow,+:3,r:3/7/12/21],[t:compositelongbow,+:3,r:3/5/10/18],[t:compositeshortbow:,+:3,r:3/5/10/17]{{desc=A magical Sheaf Arrow made of ultra-sharp glass. The arrows always shatter on use.}}'},
						{name:'Glass-arrow+10',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Glass Sheaf Arrow+3}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Glass Arrow,Ammo,1H,Arrow],[Glass Arrow,Ammo,1H,Arrow]{{Ammo=+10 Piercing,\n**Warbow** vs\nSM:1d10, L:1d10\n**Other Bows** vs\nSM:1d8, L:1d8,\nbreaks on use}}AmmoData=[w:Glass Arrow+10,st:Bow,+:10,ru:-1,SM:1d8,L:1d8],[w:Glass Arrow+10,t:warbow,+:10,ru:-1,SM:1d10,L:1d10]{{Range=Varies by bow:\n**Longbow**\nPB:30 S:50 M:100 L:170\n**Shortbow**\nPB:30 S:40 M:80 L:150\n**Warbow**\nPB:30 S:70 M:120 L:210\n**Composite Lbow**\nPB:30 S:50 M:100 L:180\n**Composite Sbow**\nPB:30 S:50 M:100 L:150}}RangeData=[t:longbow,+:10,r:3/5/10/17],[t:shortbow,+:10,r:3/4/8/15],[t:warbow,+:10,r:3/7/12/21],[t:compositelongbow,+:10,r:3/5/10/18],[t:compositeshortbow:,+:10,r:3/5/10/17]{{desc=A magical Sheaf Arrow made of ultra-sharp glass. The arrows always shatter on use.}}'},
						{name:'Hand-Quarrel',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Hand Quarrel}}{{subtitle=Ammo}}{{Speed=As per crossbow}}{{Size=Tiny}}Specs=[Hand-Quarrel,Ammo,1H,Quarrel]{{Ammo=+0, vs SM:1d3, L:1d2, Piercing}}AmmoData=[w:Hand Quarrel,t:Hand Crossbow,+:0,SM:1d3,L:1d2]{{Range=PB:20, S:20, M:40, L:60}}RangeData=[t:Hand Crossbow,+:0,r:2/2/4/6]{{desc=A quarrel for a hand crossbow, of good quality but otherwise ordinary}}'},
						{name:'Heavy-Quarrel',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Heavy Quarrel}}{{subtitle=Ammo}}{{Speed=As per crossbow}}{{Size=Tiny}}Specs=[Heavy-Quarrel,Ammo,1H,Quarrel]{{Ammo=+0, vs SM:1d4+1, L:1d6+1, Piercing}}AmmoData=[w:Heavy Quarrel,t:Heavy Crossbow,+:0,SM:1+1d4,L:1+1d6],{{Range=PB:30 S:80 M:160 L:240}}RangeData=[t:Heavy Crossbow,+:0,r:3/8/16/24]{{desc=A quarrel for a heavy crossbow, of good quality but otherwise ordinary}}'},
						{name:'Heavy-Xbow-Bolt+2',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magic Crossbow Bolts}}{{subtitle=Magic Ammo}}{{Size=Tiny}}Specs=[Heavy-Quarrel,Ammo,1H,Quarrel]{{Ammo=+2, vs SM:1d4+1, L:1d6+1, no other bonuses}}AmmoData=[t:heavy-crossbow,st:heavy-crossbow,sb:0,+:2,SM:1+1d4,L:1+1d6]{{Range=PB:30 S:80 M:160 L:240}}RangeData=[t:heavy-crossbow,+:2,r:3/8/16/24]{{desc=Fine quality heavy crossbow bolts which are +2 on to-hit and damage. The tips are sharp and keen, and are very shiny.}}'},
						{name:'Indirect',type:'',ct:'0',charge:'uncharged',cost:'0',body:'@{'},
						{name:'Light-Quarrel',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Light Quarrel}}{{subtitle=Ammo}}{{Speed=As per crossbow}}{{Size=Tiny}}Specs=[Light Quarrel,Ammo,1H,Quarrel]{{Ammo=+0, vs SM:1d4, L:1d4}}AmmoData=[w:Light Quarrel,t:Light Crossbow,+:0,SM:1d4,L:1d4]{{Range=PB:30 S:60 M:120 L:180}}RangeData=[t:Light Crossbow,+:0,r:3/6/12/18]{{desc=A quarrel for a light crossbow, of good quality but otherwise ordinary}}'},
						{name:'Magic-Ammo',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Magical Ammo}}{{subtitle=Magic Ammo}}{{Speed=As per ranged weapon?}}{{Size=Small}}Specs=[Magic-Ammo,Ammo,1H,Ammo]{{To-hit=Unknown}}{{damage=Unknown}}{{desc=Magical Ammo of fine quality}}'},
						{name:'Magic-Heavy-Xbow-Bolts',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magic Crossbow Bolts}}{{subtitle=Magic Ammo}}{{Size=Tiny}}Specs=[Magic-Ammo,Ammo,1H,Ammo]{{Ammo=[t:heavy-xbow,st:heavy-xbow,sb:0,+:2,SM:1+1d4,L:1+1d6]}}{{desc=Fine quality heavy crossbow bolts. The tips are sharp and keen, and are very shiny.}}'},
						{name:'Magical-Sheaf-Arrows',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Unknown Magical Sheaf Arrow}}{{subtitle=Magic Ammo}}{{Speed=As per bow?}}{{Size=Small}}Specs=[Magic-Ammo,Ammo,1H,Ammo]{{To-hit=Unknown}}{{damage=Unknown}}{{desc=A magical Sheaf Arrow of fine quality}}'},
						{name:'Manticore-Tail-Spikes',type:'Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Manticore Tail Spikes}}{{subtitle=Ammo}}{{Size=Tiny}}Specs=[Manticore Tail Spikes,Ranged,1H,Quarrel]{{Ammo=+1, vs SM:1d6, L:1d6, for a light crossbow with no other bonuses}}AmmoData=[t:light-crossbow,st:light-crossbow,sb:0,+:1,SM:1d6,L:1d6]{{Range=PB:30 S:60 M:120 L:180}}RangeData=[t:light-crossbow,+:2,r:3/6/12/18]{{desc=These Manticore Tail Spikes can be used as ammunition for a light crossbow with a +1 to hit \\amp on damage}}'},
						{name:'Needle',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Needle}}{{subtitle=Ammo for Blowgun}}{{Speed=As per blowgun}}{{Size=Tiny}}Specs=[Needle,Ammo,1H,Blowgun]{{Ammo=+0, vs SM:1, L:1, no bonuses}}AmmoData=[w:Needle,t:Blowgun,+:0,SM:1,L:1]{{Range=S:10, M:20, L:30}}RangeData=[t:Blowgun,+:0,r:1/2/3]{{desc=A Blowgun needle, tiny and sharp, of good quality but otherwise ordinary - careful! Perhaps dipped in poison?}}'},
						{name:'Rainbow-Sheaf-Arrow',type:'Ammo',ct:'0',charge:'recharging',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Rainbow Sheaf Arrow+2}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Rainbow-Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+2,\n**Rainbow Bow** vs. SM:1d8, L:1d8}}AmmoData=[w:Rainbow-Sheaf Arrow+2,st:Rainbow-Bow,sb:1,+:2,SM:1d8,L:1d8,rc:recharging]{{Range=PB:30, S:50, M:100, L:170}}RangeData=[t:rainbow-bow,+:2,r:3/5/10/17]}}{{desc=A magical rainbow-hewed Sheaf Arrow of pure magic. See *Rainbow* spell for full details.}}'},
						{name:'Sheaf-Arrow+1',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sheaf Arrow+1}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+1,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Sheaf Arrow+1,st:Bow,sb:1,+:1,SM:1d8,L:1d8],[w:Warbow Sheaf Arrow+1,t:warbow,sb:1,+:1,SM:1d10,L:1d10]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:1,r:3/5/10/17],[t:shortbow,+:1,r:3/5/10/15],[t:warbow,+:1,r:3/7/12/21],[t:compositelongbow,+:1,r:3/5/10/18],[t:compositeshortbow,+:1,r:3/5/10/17]}}{{desc=A magical Sheaf Arrow of fine quality}}'},
						{name:'Sheaf-Arrow+2',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sheaf Arrow+2}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+2,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Sheaf Arrow+2,st:Bow,sb:1,+:2,SM:1d8,L:1d8],[w:Warbow Sheaf Arrow+2,t:warbow,sb:1,+:2,SM:1d10,L:1d10]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:2,r:3/5/10/17],[t:shortbow,+:2,r:3/5/10/15],[t:warbow,+:2,r:3/7/12/21],[t:compositelongbow,+:2,r:3/5/10/18],[t:compositeshortbow,+:2,r:3/5/10/17]}}{{desc=A magical Sheaf Arrow of very fine quality}}'},
						{name:'Sheaf-Arrows',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sheaf Arrow}}{{subtitle=Ammo}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+0,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Sheaf Arrow,st:Bow,sb:1,+:0,SM:1d8,L:1d8],[w:Warbow Sheaf Arrow,t:warbow,sb:1,+:0,SM:1d10,L:1d10]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:0,r:3/5/10/17],[t:shortbow,+:0,r:3/5/10/15],[t:warbow,+:0,r:3/7/12/21],[t:compositelongbow,+:0,r:3/5/10/18],[t:compositeshortbow,+:0,r:3/5/10/17]}}{{desc=A Sheaf Arrow of good quality but otherwise ordinary}}'},
						{name:'Silver-Bullets',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Silver Bullet}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Silver Bullet,Ammo,1H,Bullet]{{Ammo=+0, vs SM:1d4+1, L:1d6+1, no bonuses}}[w:Silver Bullet,st:Sling,+:0,SM:1+1d4,L:1+1d6]{{Range=PB:30 S:40 M:80 L:160}}RangeData=[t:sling,+:0,r:3/4/8/16]{{desc=A Sling Bullet coated or made of silver of good quality but otherwise ordinary}}'},
						{name:'Silver-tipped-Sheaf',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Silver-Tipped Sheaf Arrow}}{{subtitle=Ammo}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf Arrow,Ammo,1H,Arrow]{{Ammo=+0,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Silver Sheaf Arrow,st:Bow,+:0,SM:1d8,L:1d8],[w:Warbow Silver Sheaf Arrow,t:warbow,+:0,SM:1d10,L:1d10]}}{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:0,r:3/5/10/17],[t:shortbow,+:0,r:3/5/10/15],[t:warbow,+:0,r:3/7/12/21],[t:complbow,+:0,r:3/5/10/18],[t:compsbow:,+:0,r:3/5/10/17]5}}{{desc=A Sheaf Arrow of good quality with a silver tip, good against werecreatures}}'},
						{name:'Stone',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Sling Stone}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Stone,Ammo,1H,Bullet]{{Ammo=+0, no bonuses}}AmmoData=[w:Stone,st:Sling,+:0,SM:1+1d4,L:1+1d6]{{Range=PB:20 S:30 M:60 L:120}}RangeData=[t:sling,+:0,r:2/3/6/12]}}{{desc=A nicely rounded stone that can be used in a sling}}'},
					]},

	Attacks_DB:		{bio:'<blockquote><h2>Character Class Database</h2></blockquote><b>v1.04  13/03/2022</b><br><br>This sheet holds definitions of Character Classes that can be used by the RPGMaster API system.  The definitions includes valid alignments and races, hit dice, the weapons & armour each class can use, the types of spells usable by the class (if any), and the powers that the class gets. Depending on API configuration, the APIs can restrict characters of a particular class to these specifications, or not as desired.',
					gmnotes:'<blockquote>Change Log:</blockquote>v1.04  13/03/2022  Added bespoke oil flask attack macro templates<br><br>v1.03  09/03/2022  Added attack damage type to To-Hit result text<br><br>v1.02  02/03/2022  Added capability to show AC vs. attack type on targeted attacks.<br><br>v1.01  12/02/2022  Initial release with classes defined in the Players Handbook',
					root:'Attacks-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/257648113/iUlG62xcBc6AdUj5lv32Ww/max.png?1638047575',
					version:1.05,
					db:[{name:'MW-Backstab-DmgL',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does a backstab with their ^^weapon^^}}Specs=[MWbsDmgL,AttackMacro,1d20,Attack]{{Damage vs LGH=[[ ( (([[^^weapDmgL^^]][Dice Roll])+([[^^strDmgBonus^^*^^weapStrDmg^^]][Strength+])) * ([[{ {[[1+(^^backstab^^*ceil(^^rogueLevel^^/4))]]},{5} }kl1]][Backstab mult]))+([[([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+])+([[^^masterProf^^*3]][Mastery+])]][Adjustments])]] HP}}{{Total Plusses=Backstab (dice + [[[[^^strDmgBonus^^]][Str bonus]]]) x [[[[{ {1+(^^backstab^^*ceil(^^rogueLevel^^/4))},{5} }kl1]][Backstab multiplier]]]+ [[([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+])+([[^^masterProf^^*3]][Mastery+])]]}}'},
						{name:'MW-Backstab-DmgSM',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does a backstab with their ^^weapon^^}}Specs=[MWbsDmgSM,AttackMacro,1d20,Attack]{{Damage vs TSM=[[ ( (([[^^weapDmgSM^^]][Dice Roll])+([[^^strDmgBonus^^*^^weapStrDmg^^]][Strength+])) * ([[{ {[[1+(^^backstab^^*ceil(^^rogueLevel^^/4))]]},{5} }kl1]][Backstab mult]))+([[([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+])+([[^^masterProf^^*3]][Mastery+])]][Adjustments])]] HP}}{{Total Plusses=Backstab (dice + [[[[^^strDmgBonus^^]][Str bonus]]]) x [[[[{ {1+(^^backstab^^*ceil(^^rogueLevel^^/4))},{5} }kl1]][Backstab multiplier]]]+ [[([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+])+([[^^masterProf^^*3]][Mastery+])]]}}'},
						{name:'MW-DmgL',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^weapon^^}}Specs=[MWdmgL,AttackMacro,1d20,Attack]{{Damage vs LHG=[[([[ ([[^^weapDmgL^^]][Dice Roll])+([[^^strDmgBonus^^*^^weapStrDmg^^]][Strength+])+([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+]+[[^^masterProf^^*3]][Mastery+])]][Adjustments])]] HP}}{{Total Plusses=[[[[^^strDmgBonus^^*^^weapStrDmg^^]][Strength+]+([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+]+[[^^masterProf^^*3]][Mastery+])]]}}'},
						{name:'MW-DmgSM',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^weapon^^}}Specs=[MWdmgSM,AttackMacro,1d20,Attack]{{Damage vs TSM=[[([[ ([[^^weapDmgSM^^]][Dice Roll])+([[^^strDmgBonus^^*^^weapStrDmg^^]][Strength+])+([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+]+[[^^masterProf^^*3]][Mastery+])]][Adjustments])]] HP}}{{Total Plusses=[[[[^^strDmgBonus^^*^^weapStrDmg^^]][Strength+]+([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+]+[[^^masterProf^^*3]][Mastery+])]]}}'},
						{name:'MW-Targeted-Attk',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ Attacks @{Target|Select Target|Token_name} with their ^^weapon^^}}Specs=[MWtargetedAttk,AttackMacro,1d20,Attack]{{Hits AC=[[([[^^thac0^^]][Thac0])-((([[^^weapAttkAdj^^]][Weapon+])+([[(^^strAttkBonus^^ * ^^weapStrHit^^)]][Strength+])+([[^^profPenalty^^]][Prof Penalty]+[[^^specProf^^]][Specialist]+[[^^masterProf^^*3]][Mastery])+([[^^raceBonus^^]][Race mod])+([[^^magicAttkAdj^^]][Magic hit adj])+([[^^twoWeapPenalty^^]][2-weap penalty])))-^^toHitRoll^^cs\\gt^^weapCritHit^^cf\\lt^^weapCritMiss^^]] }}{{Target AC=^^ACvsNoModsTxt^^:^^ACvsNoMods^^\n^^ACvsSlashTxt^^:^^ACvsSlash^^ ^^ACvsPierceTxt^^:^^ACvsPierce^^ ^^ACvsBludgeonTxt^^:^^ACvsBludgeon^^}}{{Damage SM if hit=[[ ((([[^^weapDmgSM^^]][Dice Roll])+([[^^strDmgBonus^^ * ^^weapStrDmg^^]][Strength+])) * [[{ {1+(^^backstab^^*ceil(^^rogueLevel^^/4))},{5} }kl1]][Backstab mult])+(([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+]+[[^^masterProf^^*3]][Mastery+]))]] HP}}{{Damage LH if hit=[[ ((([[^^weapDmgL^^]][Dice Roll])+([[^^strDmgBonus^^ * ^^weapStrDmg^^]][Strength+])) * [[{ {1+(^^backstab^^*ceil(^^rogueLevel^^/4))},{5} }kl1]][Backstab mult])+(([[^^weapDmgAdj^^]][weapon+])+([[^^magicDmgAdj^^]][Magic dmg adj])+([[^^specProf^^*2]][Specialist+]+[[^^masterProf^^*3]][Mastery+]))]] HP}}{{Target HP=^^targetHPfield^^ HP}}'},
						{name:'MW-ToHit',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ Attacks with their ^^weapon^^}}Specs=[MWtoHit,AttackMacro,1d20,Attack]{{Hits AC=[[([[^^thac0^^]][Thac0])-([[(([[^^weapAttkAdj^^]][Weapon+])+([[(^^strAttkBonus^^ * ^^weapStrHit^^)]][Strength+])+([[^^profPenalty^^]][Prof Penalty]+[[^^specProf^^]][Specialist]+[[^^masterProf^^*3]][Mastery])+([[^^raceBonus^^]][Race mod])+([[^^magicAttkAdj^^]][Magic hit adj])+([[^^twoWeapPenalty^^]][2-weap penalty]))]][Adjustments])-^^toHitRoll^^cs\\gt^^weapCritHit^^cf\\lt^^weapCritMiss^^]]\n^^ACvsSlashTxt^^ ^^ACvsPierceTxt^^ ^^ACvsBludgeonTxt^^ attack}}{{Total Adjustments=[[(([[^^weapAttkAdj^^]][Weapon+])+([[(^^strAttkBonus^^ * ^^weapStrHit^^)]][Strength+])+([[^^profPenalty^^]][Prof Penalty]+[[^^specProf^^]][Specialist]+[[^^masterProf^^*3]][Mastery])+([[^^raceBonus^^]][Race mod])+([[^^magicAttkAdj^^]][Magic hit adj])+([[^^twoWeapPenalty^^]][2-weap penalty]))]]}}\n^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=Do Damage?}}{{desc=If successfully hit\n[TSM Damage](~^^mwSMdmgMacro^^) or [LH Damage](~^^mwLHdmgMacro^^)}}'},
						{name:'Mon-Attk1',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ attacks with their ^^attk1^^}}Specs=[MonAttk1,AttackMacro,1d20,Attack]{{Hits AC=[[ ( ([[^^thac0^^]][Thac0]) - ([[^^magicAttkAdj^^]][Magic hit adj]) - ^^toHitRoll^^cs\\gt^^monsterCritHit^^cf\\lt^^monsterCritMiss^^ )]]}}\n^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~^^monsterDmgMacro1^^)}}'},
						{name:'Mon-Attk2',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ attacks with their ^^attk2^^}}Specs=[MonAttk2,AttackMacro,1d20,Attack]{{Hits AC=[[ ( ([[^^thac0^^]][Thac0]) - ([[^^magicAttkAdj^^]][Magic hit adj]) - ^^toHitRoll^^cs\\gt^^monsterCritHit^^cf\\lt^^monsterCritMiss^^ )]]}}\n^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~^^monsterDmgMacro2^^)}}'},
						{name:'Mon-Attk3',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ attacks with their ^^attk3^^}}Specs=[MonAttk3,AttackMacro,1d20,Attack]{{Hits AC=[[ ( ([[^^thac0^^]][Thac0]) - ([[^^magicAttkAdj^^]][Magic hit adj]) - ^^toHitRoll^^cs\\gt^^monsterCritHit^^cf\\lt^^monsterCritMiss^^ )]]}}\n^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~^^monsterDmgMacro3^^)}}'},
						{name:'Mon-Dmg1',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^attk1^^}}Specs=[MonDmg1,AttackMacro,1d20,Attack]{{Damage=[[(([[^^monsterDmg1^^]][^^attk1^^ Dmg])+([[^^magicDmgAdj^^]][Added Magic Dmg]))]] HP}}'},
						{name:'Mon-Dmg2',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^attk2^^}}Specs=[MonDmg2,AttackMacro,1d20,Attack]{{Damage=[[(([[^^monsterDmg2^^]][^^attk2^^ Dmg])+([[^^magicDmgAdj^^]][Added Magic Dmg]))]] HP}}'},
						{name:'Mon-Dmg3',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^attk3^^}}Specs=[MonDmg3,AttackMacro,1d20,Attack]{{Damage=[[(([[^^monsterDmg3^^]][^^attk3^^ Dmg])+([[^^magicDmgAdj^^]][Added Magic Dmg]))]] HP}}'},
						{name:'Mon-Targeted-Attk1',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ Attacks @{Target|Select Target|Token_name} using ^^attk1^^}}Specs=[MonTargetedAttk1,AttackMacro,1d20,Attack]{{Hits AC=[[(([[^^thac0^^]][Thac0]) - ([[^^magicAttkAdj^^]][Magic hit adj]) - ^^toHitRoll^^cs\\gt^^monsterCritHit^^cf\\lt^^monsterCritMiss^^ )]]}}{{Target AC=^^ACvsNoModsTxt^^:^^ACvsNoMods^^\n^^ACvsSlashTxt^^:^^ACvsSlash^^ ^^ACvsPierceTxt^^:^^ACvsPierce^^ ^^ACvsBludgeonTxt^^:^^ACvsBludgeon^^}}{{Damage if hit= [[(([[^^monsterDmg1^^]][^^attk1^^ Dmg])+([[^^magicDmgAdj^^]][Added Magic Dmg]))]] HP}}{{Target HP=^^targetHPfield^^HP}}'},
						{name:'Mon-Targeted-Attk2',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ Attacks @{Target|Select Target|Token_name} using ^^attk2^^}}Specs=[MonTargetedAttk2,AttackMacro,1d20,Attack]{{Hits AC=[[(([[^^thac0^^]][Thac0]) - ([[^^magicAttkAdj^^]][Magic hit adj]) - ^^toHitRoll^^cs\\gt^^monsterCritHit^^cf\\lt^^monsterCritMiss^^ )]]}}{{Target AC=^^ACvsNoModsTxt^^:^^ACvsNoMods^^\n^^ACvsSlashTxt^^:^^ACvsSlash^^ ^^ACvsPierceTxt^^:^^ACvsPierce^^ ^^ACvsBludgeonTxt^^:^^ACvsBludgeon^^}}{{Damage if hit= [[(([[^^monsterDmg2^^]][^^attk2^^ Dmg])+([[^^magicDmgAdj^^]][Added Magic Dmg]))]] HP}}{{Target HP=^^targetHPfield^^HP}}'},
						{name:'Mon-Targeted-Attk3',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ Attacks @{Target|Select Target|Token_name} using ^^attk3^^}}Specs=[MonTargetedAttk3,AttackMacro,1d20,Attack]{{Hits AC=[[(([[^^thac0^^]][Thac0]) - ([[^^magicAttkAdj^^]][Magic hit adj]) - ^^toHitRoll^^cs\\gt^^monsterCritHit^^cf\\lt^^monsterCritMiss^^ )]]}}{{Target AC=^^ACvsNoModsTxt^^:^^ACvsNoMods^^\n^^ACvsSlashTxt^^:^^ACvsSlash^^ ^^ACvsPierceTxt^^:^^ACvsPierce^^ ^^ACvsBludgeonTxt^^:^^ACvsBludgeon^^}}{{Damage if hit= [[(([[^^monsterDmg3^^]][^^attk3^^ Dmg])+([[^^magicDmgAdj^^]][Added Magic Dmg]))]] HP}}{{Target HP=^^targetHPfield^^HP}}'},
						{name:'RW-DmgL',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^weapon^^}}Specs=[RWdmgL,AttackMacro,1d20,Attack]{{Damage vs LH=[[ floor( [[^^ammoDmgL^^]][Dice roll] * [[(^^rangeN^^*0.5)+(^^rangePB^^*(1+^^masterProfPB^^))+(^^rangeSMLF^^*1)]]) + ([[^^rangePB^^*^^masterProfPB^^*2]]) + (([[^^ammoDmgAdj^^]][Ammo+])+([[^^magicDmgAdj^^]][Magic dmg+]) +([[^^strDmgBonus^^*^^ammoStrDmg^^]][Strength+])) ]]HP}}{{Total Plusses=dice x [[[[(^^rangeN^^*0.5)+(^^rangePB^^*(1+^^masterProfPB^^))+(^^rangeSMLF^^*1)]][N/PBM Mult]]] + [[ ([[^^rangePB^^*^^masterProfPB^^*2]][PBM bonus]) + ([[^^ammoDmgAdj^^]][Ammo+])+([[^^magicDmgAdj^^]][Magic dmg+]) +([[^^strDmgBonus^^*^^ammoStrDmg^^]][Strength+]) ]]}}'},
						{name:'RW-DmgL-Oil-Flask',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^\'s oil flask smashes in a ball of flame}}Specs=[RWdmgL,AttackMacro,1d20,Attack]{{subtitle=Fire damage}}{{Location=Drag the crosshair to where the oil flask smashed}}{{Splash=Those splashed take [[ceil([[1d6]]/2)]]HP fire damage}}\n!rounds --aoe ^^tid^^|circle|feet|[[(^^rangeN^^*5)+(^^rangePB^^*10)+(^^rangeS^^*10)+(^^rangeM^^*20)+(^^rangeL^^*30)+(^^rangeF^^*30)-5]]|4|0|fire'},
						{name:'RW-DmgSM',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ does damage with their ^^weapon^^}}Specs=[RWdmgSM,AttackMacro,1d20,Attack]{{Damage vs TSM=[[ floor( [[^^ammoDmgSM^^]][Dice roll] * [[(^^rangeN^^*0.5)+(^^rangePB^^*(1+^^masterProfPB^^))+(^^rangeSMLF^^*1)]]) + ([[^^rangePB^^*^^masterProfPB^^*2]]) + (([[^^ammoDmgAdj^^]][Ammo+])+([[^^magicDmgAdj^^]][Magic dmg+]) +([[^^strDmgBonus^^*^^ammoStrDmg^^]][Strength+])) ]]HP}}{{Total Plusses=dice x [[[[(^^rangeN^^*0.5)+(^^rangePB^^*(1+^^masterProfPB^^))+(^^rangeSMLF^^*1)]][N/PBM Mult]]] + [[ ([[^^rangePB^^*^^masterProfPB^^*2]][PBM bonus]) + ([[^^ammoDmgAdj^^]][Ammo+])+([[^^magicDmgAdj^^]][Magic dmg+]) +([[^^strDmgBonus^^*^^ammoStrDmg^^]][Strength+]) ]]}}'},
						{name:'RW-DmgSM-Oil-Flask',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^\'s oil flask scores a direct hit}}Specs=[RWdmgSM,AttackMacro,1d20,Attack]{{subtitle=Fire damage}}{{Round 1=Fire damage [[2d6]]}}{{Round 2=Will be rolled next round}}\n!rounds --aoe @{target|Who\'s the target?|token_id}|circle|feet|0|7|0|fire|true --target single|@{selected|token_id}|@{target|Who\'s the target?|token_id}|Oil-fire|1|-1|Taking fire damage from burning oil|three-leaves'},
						{name:'RW-Targeted-Attk',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ Attacks @{Target|Select Target|Token_name} with their ^^weapon^^}}Specs=[RWtargetedAttk,AttackMacro,1d20,Attack]{{Hits AC=[[([[^^thac0^^]][Thac0])-(([[^^weapAttkAdj^^]][Weapon+]) + ([[^^ammoDmgAdj^^]][Ammo+]) + ([[ ^^weapDexBonus^^*[[^^dexMissile^^]]]][Dexterity+] )+([[[[^^strAttkBonus^^]]*[[^^weapStrHit^^]]]][Strength+])+([[^^raceBonus^^]][Race mod])+([[^^profPenalty^^]][Prof penalty])+([[^^magicAttkAdj^^]][Magic Hit+])+([[^^twoWeapPenalty^^]][2-weap penalty])+([[^^rangeMod^^]][Range mod]))-^^toHitRoll^^cs\\gt^^weapCritHit^^cf\\lt^^weapCritMiss^^ ]] }}{{Target AC=^^ACvsNoModsTxt^^:^^ACvsNoModsMissile^^\n^^ACvsSlashMissileTxt^^:^^ACvsSlashMissile^^ ^^ACvsPierceMissileTxt^^:^^ACvsPierceMissile^^ ^^ACvsBludgeonMissileTxt^^:^^ACvsBludgeonMissile^^}}{{Damage if hit SM=[[ floor( [[^^ammoDmgSM^^]][Dice roll] * [[(^^rangeN^^*0.5)+(^^rangePB^^*(1+^^masterProfPB^^))+(^^rangeSMLF^^*1)]]) + ([[^^rangePB^^*^^masterProfPB^^*2]])+ (([[^^ammoDmgAdj^^]][Ammo+])+([[^^magicDmgAdj^^]][Magic dmg+]) +([[^^strDmgBonus^^*^^ammoStrDmg^^]][Strength+])) ]]HP}}{{Damage if hit LH=[[ floor( [[^^ammoDmgL^^]][Dice roll] * [[(^^rangeN^^*0.5)+(^^rangePB^^*(1+^^masterProfPB^^))+(^^rangeSMLF^^*1)]]) + ([[^^rangePB^^*^^masterProfPB^^*2]]) + (([[^^ammoDmgAdj^^]][Ammo+])+([[^^magicDmgAdj^^]][Magic dmg+]) +([[^^strDmgBonus^^*^^ammoStrDmg^^]][Strength+])) ]]HP}}{{Target HP=^^targetHPfield^^ HP}}{{Ammo left=^^ammoLeft^^}}'},
						{name:'RW-Targeted-Attk-Oil-Flask',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ throws a prepared oil flask at @{Target|Select Target|Token_name}}}Specs=[RWtargetedAttk,AttackMacro,1d20,Attack]{{Hits AC=[[([[^^thac0^^]][Thac0])-(([[^^weapAttkAdj^^]][Weapon+]) + ([[^^ammoDmgAdj^^]][Ammo+]) + ([[ ^^weapDexBonus^^*[[^^dexMissile^^]]]][Dexterity+] )+([[[[^^strAttkBonus^^]]*[[^^weapStrHit^^]]]][Strength+])+([[^^raceBonus^^]][Race mod])+([[^^profPenalty^^]][Prof penalty])+([[^^magicAttkAdj^^]][Magic Hit+])+([[^^twoWeapPenalty^^]][2-weap penalty])+([[^^rangeMod^^]][Range mod]))-^^toHitRoll^^cs\\gt^^weapCritHit^^cf\\lt^^weapCritMiss^^ ]] }}{{Target AC=^^ACvsNoModsTxt^^:^^ACvsNoModsMissile^^\n^^ACvsSlashMissileTxt^^:^^ACvsSlashMissile^^ ^^ACvsPierceMissileTxt^^:^^ACvsPierceMissile^^ ^^ACvsBludgeonMissileTxt^^:^^ACvsBludgeonMissile^^}}{{ =Direct Hit}}{{Target=[Direct hit on target](!rounds --aoe @{Target|Select Target|token_id}|circle|feet|0|6|0|fire|true --target single|@{selected|token_id}|@{Target|Select Target|token_id}|Oil-fire|1|-1|Taking fire damage from burning oil|three-leaves)}}{{Dmg Round 1=[[2d6]]HP fire damage}}{{Dmg Round 2=Roll next round}}{{ \n =Splash Damage}}{{Location=[Select where flask smashed](!rounds --aoe ^^tid^^|circle|feet|[[(^^rangeN^^*5)+(^^rangePB^^*10)+(^^rangeS^^*10)+(^^rangeM^^*20)+(^^rangeL^^*30)+(^^rangeF^^*30)-5]]|4|0|fire)}}{{Damage=[[ceil([[1d6]]/2)]]HP fire damage}}{{Target HP=^^targetHPfield^^ HP}}{{Ammo left=^^ammoLeft^^}}'},
						{name:'RW-ToHit',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ attacks with their ^^weapon^^}}Specs=[RWtoHit,AttackMacro,1d20,Attack]{{Hits AC=[[([[^^thac0^^]][Thac0])-([[([[^^weapAttkAdj^^]][Weapon+]) + ([[^^ammoDmgAdj^^]][Ammo+]) + ([[ ^^weapDexBonus^^*[[^^dexMissile^^]]]][Dexterity+] )+([[[[^^strAttkBonus^^]]*[[^^weapStrHit^^]]]][Strength+])+([[^^raceBonus^^]][Race mod])+([[^^profPenalty^^]][Prof penalty])+([[^^magicAttkAdj^^]][Magic Hit+])+([[^^twoWeapPenalty^^]][2-weap penalty])+([[^^rangeMod^^]][Range mod])]][Adjustments])-^^toHitRoll^^cs\\gt^^weapCritHit^^cf\\lt^^weapCritMiss^^ ]]\n^^ACvsSlashMissileTxt^^ ^^ACvsPierceMissileTxt^^ ^^ACvsBludgeonMissileTxt^^ attack}}{{Total Adjustments=[[([[^^weapAttkAdj^^]][Weapon+]) + ([[^^ammoDmgAdj^^]][Ammo+]) + ([[ ^^weapDexBonus^^*[[^^dexMissile^^]]]][Dexterity+] )+([[[[^^strAttkBonus^^]]*[[^^weapStrHit^^]]]][Strength+])+([[^^raceBonus^^]][Race mod])+([[^^profPenalty^^]][Prof penalty])+([[^^magicAttkAdj^^]][Magic Hit+])+([[^^twoWeapPenalty^^]][2-weap penalty])+([[^^rangeMod^^]][Range mod])]]}}{{Ammo left=^^ammoLeft^^}}\n^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=Do Damage?}}{{desc=If successfully hit\n[TSM Damage](~^^rwSMdmgMacro^^) or [LH Damage](~^^rwLHdmgMacro^^)}}'},
						{name:'RW-ToHit-Oil-Flask',type:'AttackMacro',ct:'0',charge:'uncharged',cost:'0',body:'^^toWhoPublic^^ \\amp{template:^^defaultTemplate^^}{{name=^^tname^^ throws a prepared oil flask}}Specs=[RWtoHit,AttackMacro,1d20,Attack]{{Hits AC=[[([[^^thac0^^]][Thac0])-([[([[^^weapAttkAdj^^]][Weapon+]) + ([[^^ammoDmgAdj^^]][Ammo+]) + ([[ ^^weapDexBonus^^*[[^^dexMissile^^]]]][Dexterity+] )+([[[[^^strAttkBonus^^]]*[[^^weapStrHit^^]]]][Strength+])+([[^^raceBonus^^]][Race mod])+([[^^profPenalty^^]][Prof penalty])+([[^^magicAttkAdj^^]][Magic Hit+])+([[^^twoWeapPenalty^^]][2-weap penalty])+([[^^rangeMod^^]][Range mod])]][Adjustments])-^^toHitRoll^^cs\\gt^^weapCritHit^^cf\\lt^^weapCritMiss^^ ]]\n^^ACvsSlashMissileTxt^^ ^^ACvsPierceMissileTxt^^ ^^ACvsBludgeonMissileTxt^^ attack}}{{Total Adjustments=[[([[^^weapAttkAdj^^]][Weapon+]) + ([[^^ammoDmgAdj^^]][Ammo+]) + ([[ ^^weapDexBonus^^*[[^^dexMissile^^]]]][Dexterity+] )+([[[[^^strAttkBonus^^]]*[[^^weapStrBonus^^]]]][Strength+])+([[^^raceBonus^^]][Race mod])+([[^^profPenalty^^]][Prof penalty])+([[^^magicAttkAdj^^]][Magic Hit+])+([[^^twoWeapPenalty^^]][2-weap penalty])+([[^^rangeMod^^]][Range mod])]]}}{{Ammo left=^^ammoLeft^^}}\n^^toWho^^ \\amp{template:^^defaultTemplate^^}{{name=Do Damage?}}{{desc=Select the appropriate result\n[Direct hit](~^^rwSMdmgMacro^^) or [Grenade/Splash](~^^rwLHdmgMacro^^)}}'},
					]},

	Class_DB:		{bio:'<blockquote><h2>Character Class Database</h2></blockquote><b>v1.03  23/02/2022</b><br><br>This sheet holds definitions of Character Classes that can be used by the RPGMaster API system.  The definitions includes valid alignments and races, hit dice, the weapons & armour each class can use, the types of spells usable by the class (if any), and the powers that the class gets. Depending on API configuration, the APIs can restrict characters of a particular class to these specifications, or not as desired.',
					gmnotes:'<blockquote>Change Log:</blockquote>v1.03  23/02/2022  Initial release with classes defined in the Players Handbook',
					root:'Class-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/141880538/q9us_ihVJqijf8PpphgrqQ/max.png?1591624422',
					version:1.04,
					db:[{name:'Abjurer',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Abjurer}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Wis:[[15]]}}{{Alignment=Any}}{{Race=Human only}}{{Hit Dice=1d4}}Specs=[Abjurer,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Abjuration}}{{Banned=Alteration \\amp Illusion}}ClassData=[w:Wizard, hd:1d4, race:human, sps:abjuration, spb:alteration|illusion, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Spells of this school focus magical energies to provide protection. This protection can take a number of forms, including warding off specific types of weapons or creatures and discouraging or dispelling enemies. The school also includes a variety of spells involving avoidance and repellence. Abjuration spells concentrate on eliminating or hindering sources of potential harm rather than repairing damage.}}'},
						{name:'Assassin',type:'RogueKitClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Assassin}}{{subtitle=Rogue Class}}{{Min Abilities=Dex:[[12]], Int:[[11]], Str:[[12]]}}{{Race=Any}}{{Hit Dice=1d6}}{{Alignment=Any not Good (most are some form of Evil)}}Specs=[Assassin,RogueKitClass,0H,Rogue]{{Skills=Thieving Abilities *Pick Pockets, Open Locks, Find/Remove Traps, Move Silently, Hide in Shadows, Detect Noise, Climb Walls,* and *Read Languages*, but only with reduced percentage points to allocate. Also, Assassins can *Backstab*.\nHave a chance to *Identify Poisons*}}ClassData=[w:Assassin, hd:1d6, align:ln|nn|n|cn|le|ne|ce, weaps:any, ac:padded|leather|studdedleather|elvenchain|magicitem|ring|cloak]{{desc=In any reasonably corrupt culture, there are those who wish to eliminate someone whose very existence stands in the way of their plans. To serve them there are Assassins: trained killers whose services are for hire.\nIn the AD\\ampD(R) 2nd Edition Players\' Handbook, the idea of an assassin, a hired killer, has been divorced from any particular character class. Indeed, a character can be any class and still be an assassin; this thief kit simply shows how a thief can be converted into an efficient, discreet killer. Characters of other classes still can (and often will) be assassins, so it would be best not to let down one\'s guard . . .}}{{Reference=*The Complete Thief\'s Handbook* Assassin Kit}}'},
						{name:'Bard',type:'RogueClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Bard}}{{subtitle=Rogue Class}}{{Min Abilities=Dex:[[12]], Int:[[13]], Chr:[[15]]}}{{Race=Human or Half Elf}}{{Hit Dice=1d6}}{{Alignment=Any Neutral}}Specs=[Bard,RogueClass,0H,Rogue]{{Skills=Bardish Abilities *Pick Pockets, Detect Noise, Climb Walls,* and *Read Languages*. Can cast some wizard spells from 2nd Level (less likely to be Combat-type spells)}}ClassData=[w:Bard, hd:1d6, race:human|halfelf, align:ng|nn|n|ne|ln|cn, weaps:any, ac:padded|leather|hide|brigandine|ringmail|scalemail|chainmail|ring|magicitem|cloak, sps:any, slv:6|1|100|MU, spl1:0|1|2|2|3|3|3|3|3|3|3|3|3|3|3|4|4|4|4|4, spl2:0|0|0|1|1|2|2|3|3|3|3|3|3|3|3|3|4|4|4|4, spl3:0|0|0|0|0|0|1|1|2|2|3|3|3|3|3|3|3|4|4|4, spl4:0|0|0|0|0|0|0|0|0|1|1|2|2|3|3|3|3|3|4|4, spl5:0|0|0|0|0|0|0|0|0|0|0|0|1|1|2|2|3|3|3|4, spl6:0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|1|2|2|3]{{desc=The bard is an optional character class that can be used if your DM allows. He makes his way in life by his charm, talent, and wit. A good bard should be glib of tongue, light of heart, and fleet of foot (when all else fails).\nIn precise historical terms, the title "bard" applies only to certain groups of Celtic poets who sang the history of their tribes in long, recitative poems. These bards, found mainly in Ireland, Wales, and Scotland, filled many important roles in their society. They were storehouses of tribal history, reporters of news, messengers, and even ambassadors to other tribes. However, in the AD\\ampD game, the bard is a more generalized character. Historical and legendary examples of the type include Alan-a-Dale, Will Scarlet, Amergin, and even Homer. Indeed, every culture has its storyteller or poet, whether he is called bard, skald, fili, jongleur, or something else.}}'},
						{name:'Cleric',type:'PriestClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Cleric}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[9]]}}{{Race=Any}}{{Hit Dice=1d8}}{{ =**Alignment**}}{{Deity=Any}}{{Priests=Any}}{{Flock=Any}}Specs=[Cleric,PriestClass,0H,Priest]{{Powers=*Turn Undead*}}{{ =Spells}}{{Major Spheres=All, Astral, Charm, Combat, Creation, Divination, Guardian, Healing, Necromantic, Protection, Summoning, and Sun}}{{Minor Spheres=Elemental}}ClassData=[w:Cleric, hd:1d8, weaps:clubs|flails|staff|slings, ac:any, sps:all|astral|charm|combat|creation|divination|guardian|healing|necromantic|protection|summoning|sun, spm:elemental, ns:1][cl:PW, w:Turn-Undead, lv:1, pd:-1]{{desc=The most common type of priest is the cleric. The cleric may be an adherent of any religion (though if the DM designs a specific mythos, the cleric\'s abilities and spells may be changed--see following). Clerics are generally good, but are not restricted to good; they can have any alignment acceptable to their order.\nThe cleric class is similar to certain religious orders of knighthood of the Middle Ages: the Teutonic Knights, the Knights Templars, and Hospitalers. These orders combined military and religious training with a code of protection and service. Members were trained as knights and devoted themselves to the service of the church. These orders were frequently found on the outer edges of the Christian world, either on the fringe of the wilderness or in war-torn lands. Archbishop Turpin (of The Song of Roland) is an example of such a cleric. Similar orders can also be found in other lands, such as the sohei of Japan.}}'},
						{name:'Conjurer',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Conjurer}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Con:[[15]]}}{{Alignment=Any}}{{Race=Human \\amp Half Elf}}{{Hit Dice=1d4}}Specs=[Conjurer,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Conjuration / Summoning}}{{Banned=Greater Divination \\amp Invocation}}ClassData=[w:Conjurer, hd:1d4, race:human|halfelf, sps:conjuration|summoning|conjurationsummoning, spb:greaterdivination|invocation, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=This school includes two different types of magic, though both involve bringing in matter from another place. Conjuration spells produce various forms of nonliving matter. Summoning spells entice or compel creatures to come to the caster, as well as allowing the caster to channel forces from other planes. Since the casting techniques and ability requirements are the same for both types of magic, conjuration and summoning are considered two parts of the same school.}}'},
						{name:'Creature',type:'CreatureClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Creature}}{{subtitle=Warrior Class}}{{Min Abilities=None}}{{Alignment=Any}}{{Race=Any}}Specs=[Creature,CreatureClass,0H,Creature]{{Powers=None}}{{Hit Dice=1d8}}ClassData=[w:Creature, align:any, race:any, hd:1d8, weaps:any, ac:any]{{desc=A creature can be any type of monster, pet, war-trained animal, woodland beast or dungeon denizen. It can have weapon use and armour, be intelligent, speak some or many languages, and be everything any other NPC or PC can be. Generally, it uses the Monster tab on Character Sheets. A specific class of creature can be specified by giving it a Race and defining a Class Database entry for that Race}}'},
						{name:'Diviner',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Diviner}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Wis:[[16]]}}{{Alignment=Any}}{{Race=Human, Elf \\amp Half Elf}}{{Hit Dice=1d4}}Specs=[Diviner,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Greater Divination}}{{Banned=Conjuration / Summoning}}ClassData=[w:Diviner, hd:1d4, race:human|elf|halfelf, sps:greaterdivination, spb:conjurationsummoning|conjuration|summoning, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=This school includes a variety of spells that reveal information that would otherwise remain hidden or secret. Greater divination spells reveal the existence of specific items, creatures, or conditions, as well as information about the past, present, and future. This school also includes spells that contact creatures from other planes of existence, but do not induce direct action from those creatures.}}'},
						{name:'Druid',type:'PriestClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Druid}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]], Chr:[[15]]}}{{Race=Human or Half Elf}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Neutral}}{{Priests=Neutral}}{{Flock=Neutral}}Specs=[Druid,PriestClass,0H,Priest]{{ =**Powers**}}{{3rd Level=*Identify Plants \\amp Animals \\amp Pure Water, Pass Without Trace, Speak a Woodland Language* (1/level)}}{{7th Level=*Immune to woodland charm, Shapechange to Normal Animal* (3/day)}}{{ =**Spells**}}{{Major Spheres=All, Animal, Elemental, Healing, Plant, and Weather}}{{Minor Spheres=Divination}}ClassData=[w:Druid, hd:1d8, weaps:clubs|sickle|dart|spears|dagger|scimitar|slings|staff, ac:leather|padded|hide|woodenshield|magicitem|ring|cloak, sps:all|animal|elemental|healing|plant|weather, spm:divination, ns:3],[cl:PW, w:Druids-Identify, lv:3, pd:-1],[cl:PW, w:Pass-Without-Trace, lv:3, pd:-1],[cl:PW, w:Druids-Shapechange, lv:7, pd:3]{{desc=Historically, druids lived among the Germanic tribes of Western Europe and Britain during the days of the Roman Empire. They acted as advisors to chieftains and held great influence over the tribesmen. Central to their thinking was the belief that the earth was the mother and source of all life. They revered many natural things -- the sun, moon, and certain trees -- as deities. Druids in the AD\\ampD game, however, are only loosely patterned after these historical figures. They are not required to behave like or follow the beliefs of historical druids.}}'},
						{name:'Enchanter',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Enchanter}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Chr:[[16]]}}{{Alignment=Any}}{{Race=Human, Elf \\amp Half Elf}}{{Hit Dice=1d4}}Specs=[Enchanter,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Enchantment / Charm}}{{Banned=Invocation / Evocation \\amp Necromancy}}ClassData=[w:Enchanter, hd:1d4, race:human|elf|halfelf, sps:enchantment|charm|enchantmentcharm, spb:invocation|evocation|invocationevocation|necromancy, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Similar to the school of conjuration/summoning, this school encompasses two general types of spells. Both types imbue their subjects with magical energy to create specific effects. *Charm* spells induce changes or influence the behavior of creatures, usually altering their subject\'s mental or emotional states. *Enchantment* spells invest non-living objects with magical powers. Neither *charm* nor *enchantment* spells have any effect on their subject\'s physical form.}}'},
						{name:'Fighter',type:'WarriorClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Fighter}}{{subtitle=Warrior Class}}{{Min Abilities=Str:[[9]]}}{{Alignment=Any}}{{Race=Any}}Specs=[Fighter,WarriorClass,0H,Warrior]{{Powers=None}}{{Hit Dice=1d10}}ClassData=[w:Fighter, align:any, hd:1d10, race:any, weaps:any, ac:any]{{desc=The fighter is a warrior, an expert in weapons and, if he is clever, tactics and strategy. There are many famous fighters from legend: Hercules, Perseus, Hiawatha, Beowulf, Siegfried, Cuchulain, Little John, Tristan, and Sinbad. History is crowded with great generals and warriors: El Cid, Hannibal, Alexander the Great, Charlemagne, Spartacus, Richard the Lionheart, and Belisarius. Your fighter could be modeled after any of these, or he could be unique. A visit to your local library can uncover many heroic fighters.}}'},
						{name:'Illusionist',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Illusionist}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Dex:[[16]]}}{{Alignment=Any}}{{Race=Human, Gnome}}{{Hit Dice=1d4}}Specs=[Illusionist,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Illusion / Phantasm}}{{Banned=Abjuration, Invocation / Evocation, Necromancy}}ClassData=[w:Illusionist, hd:1d4, race:human|gnome, sps:illusion|phantasm|illusionphantasm, spb:abjuration|invocation|evocation|invocationevocation|necromancy, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Spells from the school of illusion bend reality to create apparent changes in the environment, in the caster, or in other persons or creatures. These spells do not cause real changes as alteration spells do, but instead alter the way that creatures and persons perceive reality. This school includes both illusion and phantasm spells.}}'},
						{name:'Invoker',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Invoker}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Con:[[16]]}}{{Alignment=Any}}{{Race=Human only}}{{Hit Dice=1d4}}Specs=[Invoker,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Invocation / Evocation}}{{Banned=Enchantment / Charm \\amp Conjuration / Summoning}}ClassData=[w:Invoker, hd:1d4, race:human, sps:invocation|evocation|invocationevocation, spb:enchantment|charm|enchantmentcharm|conjuration|summoning|conjurationsummoning, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=This school includes two types of spells, both of which use magical energy to create specific effects by bringing forth special forces that the caster shapes into constructs of energy or constructs of matter. Evocation spells use the natural magical forces of the planes. Invocation spells call on the intervention of powerful extradimensional beings.}}'},
						{name:'Mage',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Mage}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]]}}{{Alignment=Any}}{{Race=Human, Elf or Half-Elf}}{{Hit Dice=1d4}}Specs=[Mage,WizardClass,0H,Wizard]{{Spells=Any}}ClassData=[w:Mage, hd:1d4, race:human|elf|halfelf, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Mages are the most versatile types of wizards, those who choose not to specialize in any single school of magic. This is both an advantage and disadvantage. On the positive side, the mage\'s selection of spells enables him to deal with many different situations. (Wizards who study within a single school of magic learn highly specialized spells, but at the expense of spells from other areas.) The other side of the coin is that the mage\'s ability to learn specialized spells is limited compared to the specialist\'s.\nMages have no historical counterparts; they exist only in legend and myth. However, players can model their characters after such legendary figures as Merlin, Circe, or Medea. Accounts of powerful wizards and sorceresses are rare, since their reputations are based in no small part on the mystery that surrounds them. These legendary figures worked toward secret ends, seldom confiding in the normal folk around them.}}'},
						{name:'Magic-User',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Magic User}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]]}}{{Alignment=Any}}{{Race=Human, Elf or Half-Elf}}{{Hit Dice=1d4}}Specs=[Magic User,WizardClass,0H,Wizard]{{Spells=Any}}ClassData=[w:Magic User, hd:1d4, race:human|elf|halfelf, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Mages are the most versatile types of wizards, those who choose not to specialize in any single school of magic. This is both an advantage and disadvantage. On the positive side, the mage\'s selection of spells enables him to deal with many different situations. (Wizards who study within a single school of magic learn highly specialized spells, but at the expense of spells from other areas.) The other side of the coin is that the mage\'s ability to learn specialized spells is limited compared to the specialist\'s.\nMages have no historical counterparts; they exist only in legend and myth. However, players can model their characters after such legendary figures as Merlin, Circe, or Medea. Accounts of powerful wizards and sorceresses are rare, since their reputations are based in no small part on the mystery that surrounds them. These legendary figures worked toward secret ends, seldom confiding in the normal folk around them.}}'},
						{name:'Necromancer',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Necromancer}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Wis:[[16]]}}{{Alignment=Any}}{{Race=Human only}}{{Hit Dice=1d4}}Specs=[Necromancer,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Necromancy}}{{Banned=Enchantment / Charm \\amp Illusion}}ClassData=[w:Necromancer, hd:1d4, race:human, sps:necromancy, spb:enchantment|charm|enchantmentcharm|illusion|phantasm|illusionphantasm, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=This powerful school involves spells dealing with death and the dead. These spells drain vitality from living creatures and restore life functions to unliving creatures. Bones, blood, spirits, and apparitions are all associated with the magical energies shaped and controlled by the specialists of this school.}}'},
						{name:'Paladin',type:'WarriorClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Paladin}}{{subtitle=Warrior Class}}{{Min Abilities=Str:[[12]], Con:[[9]], Wis:[[13]], Chr:[[17]]}}{{Alignment=Lawful Good}}{{Race=Human only}}Specs=[Paladin,WarriorClass,0H,Warrior]{{Hit Dice=1d10}}{{=**Powers**}}{{1st Level=*Detect Evil Intent, Immune* to disease, *Lay on Hands, Cure Disease, Aura of Protection*}}{{3rd Level=*Turn Undead and Fiends*}}{{9th Level=Aquire Clerical spell casting}}{{.=**Priest Spells**}}{{Major Spheres=Combat, Divination, Healing, Protective}}ClassData=[w:Paladin, align:lg, hd:1d10, race:human, weaps:any, ac:any, sps:combat|divination|healing|protective, slv:4|9|9|PR, spl1:1|2|2|2|2|3|3|3|3|3|3|3, spl2:0|0|1|2|2|2|2|3|3|3|3|3, spl3:0|0|0|0|1|1|1|2|3|3|3|3, spl4:0|0|0|0|0|0|1|1|1|1|2|3, ns:4],[cl:PW, w:Paladin-Detect-Evil, lv:1, pd:-1],[cl:PW, w:Paladin-lay-on-hands, lv:1, pd:1],[cl:PW, w:Cure-Disease, lv:1, pd:1],[cl:PW, w:Turn-Undead, lv:3, pd:-1]{{desc=The paladin is a noble and heroic warrior, the symbol of all that is right and true in the world. As such, he has high ideals that he must maintain at all times. Throughout legend and history there are many heroes who could be called paladins: Roland and the 12 Peers of Charlemagne, Sir Lancelot, Sir Gawain, and Sir Galahad are all examples of the class. However, many brave and heroic soldiers have tried and failed to live up to the ideals of the paladin. It is not an easy task!}}'},
						{name:'Priest',type:'PriestClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[9]]}}{{Race=Any}}{{Hit Dice=1d8}}{{ =**Alignment**}}{{Deity=Any}}{{Priests=Any}}{{Flock=Any}}Specs=[Priest,PriestClass,0H,Priest]{{Powers=*Turn Undead*}}{{ =Spells}}{{Major Spheres=All, Astral, Charm, Combat, Creation, Divination, Guardian, Healing, Necromantic, Protection, Summoning, and Sun}}{{Minor Spheres=Elemental}}ClassData=[w:Priest, hd:1d8, weaps:clubs|flails|staff|slings, ac:any, sps:all|astral|charm|combat|creation|divination|guardian|healing|necromantic|protection|summoning|sun, spm:elemental]{{desc=The most common type of priest is the cleric. The cleric may be an adherent of any religion (though if the DM designs a specific mythos, the cleric\'s abilities and spells may be changed--see following). Clerics are generally good, but are not restricted to good; they can have any alignment acceptable to their order.\nThe cleric class is similar to certain religious orders of knighthood of the Middle Ages: the Teutonic Knights, the Knights Templars, and Hospitalers. These orders combined military and religious training with a code of protection and service. Members were trained as knights and devoted themselves to the service of the church. These orders were frequently found on the outer edges of the Christian world, either on the fringe of the wilderness or in war-torn lands. Archbishop Turpin (of The Song of Roland) is an example of such a cleric. Similar orders can also be found in other lands, such as the sohei of Japan.}}'},
						{name:'Priest-of-Agriculture',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Agriculture}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[11]], Con:[[12]]}}{{Races=Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=True Neutral or Neutral Good}}{{Flock=Any}}Specs=[Priest of Agriculture,PriesthoodClass,0H,Priest]{{ =**Spells**}}{{Major Spheres=All, Creation, Divination, Plant, Summoning}}{{Minor Spheres=Animal, Healing, Protection, Sun, Weather}}{{.=**Powers**}}{{1st Level=*Analysis, Detection, \\amp Identification; Create Food \\amp Water* (1/day); *Immunity* to *natural* food poisoning}}{{8th Level=*Heroes\' Feast,* (1/day)}}ClassData=[w:Priest of Agriculture, align:NN|NG, hd:1d8, race:gnomes|halfelves|halflings|humans, weaps:hooks|flails|handaxe|throwingaxe|scythe|sickle, ac:leather|padded|hide|woodenshield|magicitem|ring|cloak, sps:all|Creation|Divination|Plant|Summoning, spm:Animal|Healing|Protection|Sun|Weather, ns:3],[cl:PW, w:Analysis-Detection-Identification, lv:1, pd:-1],[cl:PW, w:Create-Food-and-Water, lv:1, pd:1],[cl:PW, w:Heroes-Feast, lv:8, pd:1]{{desc=Agriculture concerns Man harvesting Nature. The god has shown man how to plant, grow, reap, and utilize crops; man, in turn, worships the god as thanks for this bounty. The gods of agriculture is different from the other gods of nature and natural forces in that he represents the elements of growing that man utilizes and can control.\nThe priesthood of this god is principally interested in making sure that mankind continues to appreciate the agricultural god. An angry god of this sort can decide that crops fail, either on a local level or even worldwide, resulting in mass starvation and (eventually, if the god is not appeased) a destruction of civilization; man would return to a hunter-gatherer culture, living in small nomadic tribes and following herds of beasts, if this were to take place.\nA god of Agriculture doesn\'t have to be the god of all agriculture. He could be the god of a specific crop (especially wheat, barley, corn, vines, olives, and other principal crops) or of a specific, lesser attribute of agriculture (sowing, reaping, brewing, etc.).\nMost agricultural deities are female.\nThe priests of this god are on good terms with Druids and the priests of Community, Earth, Fertility, Fire, Life-Death-Rebirth Cycle, Nature, Seasons, and Vegetation.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Ancestors',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Ancestors}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]]}}{{Races=Dwarves, Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Neutral Good}}{{Priests=Any Good}}{{Flock=Any Neutral or Good}}{{ =**Spells**}}{{Major Spheres=All, Astral, Creation, Divination, Guardian, Necromantic and Protection}}{{Minor Spheres=Charm, Healing}}Specs=[Priest of Ancestors,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Detection* of graves \\amp undead, *Immunity* to *charm* abilities of undead creatures, *Turn Undead*}}{{8th Level=*Prophecy* (not at will)}}ClassData=[w:Priest of Ancestors, align:LG|NG|CG, hd:1d8, race:dwarves|elves|gnomes|halfelves|halflings|humans, weaps:clubs|dagger|dirk|dart|knife|staff, ac:magicitem|ring|cloak, sps:all|astral|creation|divination|guardian|necromantic|protection, spm:charm|healing, ns:1],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Prophesy, lv:8, pd:-1]{{desc=A god devoted to man\'s communion with and honoring of his dead ancestors. As such, this is a god of civilization and learning, even of courtesy.\nThe priests of this god keep the deeds of ancestors and heroes in the minds of the population. They commune with and honor the dead, and are also devoted to learning from them # not just reading their writings, but communicating with them magically, even exploring alternate planes to understand the meaning of life and death.\nThey are also devoted to the protection of new generations, whom they teach to appreciate the previous generations of this race.\nThis priesthood places a high value on truth.\nPriests of the god of ancestors hate the undead, regarding them as a mockery of true and noble death. These priests seek to eradicate the undead whenever encountered. \nLesser gods of this attribute would be devoted to subsets of the broad field of Ancestors. Such subsets include: Ancestors of a particular race, of a particular city, of a particular extended clan; all male ancestors, all female ancestors, all warrior ancestors, all scholar ancestors, etc. It would be appropriate for a civic deity (see Community, below) also to be a god of the city\'s ancestors, for instance.\nAncestor deities are not inclined toward either sex.\nThe priests of this god are on good terms with the priests of Birth/Children, Community, Divinity of Mankind, Fate/Destiny, Race, and Sites. The priests of this god dislike the priests of Disease.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Darkness',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Darkness}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[11]], Int:[[11]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Neutral Good, Neutral Evil, or True Neutral}}{{Flock=Any Alignment}}{{ =**Spells**}}{{Major Spheres=All, Charm, Divination, Necromantic, Summoning and Sun}}{{Minor Spheres=Animal, Elemental, Guardian, Protection}}Specs=[Priest of Darkness,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Infravision*. NG \\amp N have *Turn Undead*, NE have *Control Undead*}}ClassData=[w:Priest of Darkness, align:NG|NN|N|NE, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow|crossbow|dagger|dirk|knife|stiletto|rapier|shortsword, ac:hide|leather|padded|magicitem|ring|cloak, sps:all|charm|divination|necromantic|summoning|sun, spm:animal|elemental|guardian|protection, ns:2],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Control-Undead, lv:1, pd:-1]{{desc=This god is a god of some forces that humans fear. However, this doesn\'t mean the god is evil. Generally, he\'s not. He\'s just the embodiment of darkness, including all its benefits and all its dangers. The god of Darkness and Night would be the god of sleep, of dreams, of nightmares, and of nocturnal predators; some of these traits are considered good, some ill.\nThe priests of this god are interested in making sure that man regards Darkness and Night with a reverential awe # making sure that the sentient humanoid races appreciate the virtues of night while still respecting or fearing its more frightening aspects. These priests tend to be more aloof from the common man than priests of many other gods.\nLesser gods of this attribute would be gods of only one of these factors. One might be the god of Sleep, and another the god of Nightmares. In these cases, the DM can choose to vary the god\'s alignment; the god of Sleep, much beloved of men, could be lawful good, while the god of Nightmares, hated by men, could be chaotic evil.\nGods of darkness or night are most likely to be female.\nThe priests of this god are on good terms with the priests of Dawn, Death, Elemental Forces, Hunting, Light, Magic, Moon, Oracles/Prophecy, and Sun. Some DMs may be surprised that the gods of Darkness and Night are not listed here as being opposed to those of light and sun. It\'s because they don\'t have to be; in Greek mythology, for instance, the sun-god, moon-goddess, and dawn-goddess were all siblings who never opposed one another. Naturally, the individual DM can decide for his campaign that the deities of darkness and light, moon and sun are enemies.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Dawn',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Dawn}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[10]], Chr:[[13]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Lawful Good}}{{Priests=Any Good}}{{Flock=Any not Evil}}{{ =**Spells**}}{{Major Spheres=All, Charm, Divination, Elemental(Fire/Air), Healing, Summoning and Sun}}{{Minor Spheres=Animal, Creation, Necromantic, Plant,Protection, Weather}}Specs=[Priest of Dawn,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Charm/Fascination* 3/day (not in combat), *Immunity* to Level Drain from Undead, *Turn Undead*}}{{10th Level=*Chariot of Sustarre* 1/day}}ClassData=[w:Priest of Darkness, align:NG|LG|CG, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow, ac:magicitem|ring|cloak, sps:all|charm|divination|elementalfire|elementalair|healing|summoning|sun, spm:animal|creation|necromantic|plant|protection|weather, ns:3],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Charm-Fascination, lv:1, pd:3],[cl:PW, w:Chariot-of-Sustarre, lv:10, pd:1]{{desc=The god of dawn represents the border between Night and Day, Darkness and Light, Moon and Sun. He\'s a friend of mankind, a bringer of inspiration, an enemy of dark things.\nThe priests of this god work mostly to keep the flock appreciating the god\'s virtues. These priests, like their allies, the priests of the god of the Sun, are also enemies of the undead.\nDeities of the dawn are mostly likely to be female.\nThe priests of this god are on good terms with the priests of Darkness/Night, Elemental Forces, Fire, Healing, Hunting, Light, Magic, Moon, Oracles/Prophecy, and Sun.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Death',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Death}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[9]]}}{{Races=Dwarves, Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Any Alignment}}{{Flock=Any Alignment}}{{ =**Spells**}}{{Major Spheres=All, Astral, Charm, Divination, Protection}}{{Minor Spheres=Guardian, Necromantic, Sun, and Weather}}Specs=[Priest of Death,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Inspire Fear* 2/day, *Control Undead* even if not Evil}}ClassData=[w:Priest of Death, align:any, hd:1d8, race:dwarves|elves|gnomes|halfelves|halflings|humans, weaps:battleaxe|dagger|dirk|knife|lasso|scythe|sickle|stiletto|khopesh|shortsword, ac:magicitem|ring|cloak, sps:all|astral|charm|divination|protection, spm:guardian|necromantic|sun|weather, ns:2],[cl:PW, w:Control-Undead, lv:1, pd:-1],[cl:PW, w:Inspire-Fear, lv:1, pd:2]{{desc=The God of Death is, naturally, a terrifying figure whom man regards as an enemy, an unavoidable doom.\nBut this doesn\'t mean that death-gods are evil. Most, in fact, are true neutral. A deathgod can be the King of the Land of the Dead, the Grim Reaper who cuts down the living, or the Guide of the Souls who helps the departed spirit on to its reward or next existence.\nPriests of the death-god are often agents who must "help" people on to the afterlife, especially if such people have successfully thwarted Death in the past. This duty may take the form of assassination, or of mercy-killing. In some campaigns, spirits sometimes escape the afterlife and return to the land of the living; the death-god\'s priests must hunt them down and capture them for return to their proper place.\nDeath-gods are equally likely to be male or female.\nThe priests of this god are on good terms with the priests of Ancestors, Community, Darkness/Night, Disease, Justice/Revenge, Life-Death-Rebirth Cycle, and Time. Priests of this god are sometimes (at individual DM discretion) allies of the priests of the philosophy of Evil, but this is actually not common, regardless of how scary the god of Death might be. The priests of this god dislike the priests of Fertility and Healing, and (at the DM\'s discretion) Strength.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Disease',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Disease}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[9]], Con:[[15]]}}{{Races=Dwarves, Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Neutral Evil}}{{Priests=Neutral Evil}}{{Flock=Neutral Evil}}{{ =**Spells**}}{{Major Spheres=All, Animal, Healing (reversed only), Summoning, Weather}}{{Minor Spheres=Combat, Divination, Necromantic (reversed only), Protection (reversed where applicable)}}Specs=[Priest of Disease,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Immunity* to all diseases, *Laying on Harmful Hands* 1/day}}ClassData=[w:Priest of Disease, align:ne, hd:1d8, race:dwarves|elves|gnomes|halfelves|halflings|humans, weaps:bow|dart|scourge|scythe|whip, ac:any, sps:all|animal|healing|summoning|weather, spm:combat|divination|necromantic, ns:1],[cl:PW, w:Lay-on-Harmful-Hands, lv:1, pd:1]{{desc=This is an evil god which dislikes mankind and other sentient races. It creates new and ever-more-terrifying illnesses to inflict upon the sentient races.\nThe priests of this god spread illness and ignorance. They carry infected victims and rats infested with disease-bearing insects to new ports. Through their actions, they deny their victims an honorable death and can sometimes topple entire civilizations. This is not a character class for PCs to take unless the campaign is very unusual.\nLesser gods of disease would be gods of specific ailments. It\'s entirely appropriate, for instance, for the Black Plague to have its own representative god.\nGods of disease are just as likely to be male as female.\nThe priests of this god are on good terms with the priests of Death and Evil. The priests of this god dislike the priests of Birth/Children, Fire, Healing, and Strength.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Earth',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Earth}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]]}}{{Races=Dwarves, Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Neutral or Neutral Good}}{{Flock=Any Alignment}}{{ =**Spells**}}{{Major Spheres=All, Creation, Elemental (Earth), Plant, Summoning}}{{Minor Spheres=Animal, Divination, Healing, Protection}}Specs=[Priest of Earth,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Detect grade or slope* 5 in 6 (dwarves \\amp gnomes automatic), *Approx Depth Underground* 50% (dwarves \\amp gnomes 5 in 6), *Immunity* to all snake venoms}}ClassData=[w:Priest of Earth, align:n|nn|ng, hd:1d8, race:dwarves|elves|gnomes|halfelves|halflings|humans, weaps:club|dagger|dirk|knife|footmansmace|maul|morningstar|picks|scythe|sickle|slings|stiletto|warhammer, ac:hide|padded|leather|woodenshield|ring|magicitem, sps:all|creation|elementalearth|plant|summoning, spm:animal|divination|healing|protection]{{desc=This deity is the manifestation of the world in all its aspects. He\'s not just a god of growing things, plants and animals; he also represents weather, volcanoes, earthquakes, flood, and many other powerful natural forces. Many earth-gods are also makers of\nmonsters.\nThis god\'s priests are a vigorous sect who insist that everyone worship the god, for without the god all creatures on the face of the world could not exist.\nLesser gods of this attribute would represent only one aspect of the earth. One might be a god of earthquakes, one a god of stony mountains, one a god of caves and caverns. The gods of Agriculture, Animals, Nature and Vegetation can also be considered lesser gods of the Earth attribute.\nLesser gods are as likely to be male as female, but the comprehensive god of all the earth is probably female.\nThe priests of this god are on good terms with Druids and the priests of Agriculture, Animals, Fertility, Life-Death-Rebirth Cycle, Nature, Seasons, Sky/Weather, and Vegetation.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Good',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Good (Philosophy)}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[9]]}}{{Races=Dwarves, Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Philosophy=Good}}{{Priests=Any Good}}{{Flock=Any Good}}{{ =**Spells**}}{{Major Spheres=All, Healing and Protection}}{{Minor Spheres=Charm and Divination}}Specs=[Priest of Good,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Detect Evil* 3/day, *Permanent +1 to-hit \\amp damage* vs. all Evil enemies, above \\amp beyond other bonuses, *Turn Undead*}}ClassData=[w:Priest of Good, align:lg|ng|cg, hd:1d8, race:dwarves|elves|gnomes|halfelves|halflings|humans, weaps:bow|handaxe|throwingaxe|javelin|lasso|polearm|spear|staffsling|stiletto|shortblade|mediumblade|longblade|fencingblade, ac:any|magicitem|ring|cloak, sps:all|healing|protection, spm:charm|divination, ns:2],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Detect-Evil, lv:1, pd:3]{{desc=Just as evil thoughts and deeds create evil energies, good thoughts and deeds create good energies, resulting in priests of the philosophy of Good.\nThe goal of these priests is to counter the spread of evil throughout the universe. They work primarily to anticipate the deeds of evil beings, head them off, and counter them whenever possible. They may or may not believe in Law; some of them, chaotic good priests, break all sorts of laws and restrictions of society in order to realize their good intentions.\nThe priests of this philosophy are on good terms with the priests of Divinity of Mankind, Everything, Peace, Race, Redemption, and Wisdom. The priests of this philosophy especially dislike the priests of Evil.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Healing',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Healing}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[10]], Int:[[10]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Lawful Good}}{{Priests=Any Good}}{{Flock=Any not Evil}}{{ =**Spells**}}{{Major Spheres=All, Creation, Divination, Healing, Necromantic, Protection, Summoning}}{{Minor Spheres=Animal, Charm, Guardian, Plant, Sun, Weather}}Specs=[Priest of Healing,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*+2 to saving throws* vs. poisons and diseases, *Lay on Hands* 1/day, *Soothing Word* 3/day, and *Turn Undead*}}{{3rd Level=*Analysis \\amp Identification* of diseases and poisons if succeeding an Intelligence check}}ClassData=[w:Priest of Healing, align:lg|ng|cg, hd:1d8, race:dwarves|elves|gnomes|halfelves|halflings|humans, weaps:lasso|mancatcher|net|quarterstaff, ac:hide|padded|leather|magicitem|ring|cloak, sps:all|creation|divination|healing|necromantic|protection|summoning, spm:animal|charm|guardian|plant|sun|weather, ns:4],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Lay-on-Healing-Hands, lv:1, pd:1],[cl:PW, w:Soothing-Word, lv:1, pd:3],[cl:PW, w:Analysis-Detection-Identification, lv:3, pd:-1]{{desc=This god is the champion of doctors, medicine and other healing functions. He cures the sick and passes on his healing knowledge to his mortal doctor/priests. He is the enemy of disease and injury, and no admirer of war.\nThe priesthood is devoted to healing and are not allowed by their order to turn away a patient in need; if they can help him, they must.\nLesser gods of this attribute are gods of specific types of healing. One might be a god of combat injuries, one a god who heals illnesses of the mind. The god of childbirth could\nbe considered a lesser god of healing.\nHealing gods are as likely to be male as female.\nThe priests of this god are on good terms with the priests of Birth/Children, Dawn, Guardianship, Light, Love, Peace, and Sun. The priests of this god dislike the priests of Death, Disease, and Evil.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Light',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Light}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]], Int:[[12]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Neutral Good}}{{Priests=Any Good}}{{Flock=Any Neutral or Good}}Specs=[Priest of Light,PriesthoodClass,0H,Priest]{{ =**Spells**}}{{Major Spheres=All, Charm, Divination, Healing and Sun}}{{Minor Spheres=Animal, Creation, Necromantic and Plant}}{{.=**Powers**}}{{1st Level=*Infravision, Turn Undead*}}{{3rd Level=*Laying on Hands* 1/day}}{{5th Level=*Charm/Fascination* 3/day}}{{9th Level=*Prophecy*}}ClassData=[w:Priest of Light, align:LG|NG|CG, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow|crossbow|dagger|dirk|dart|javelin|knife|slings|spear, ac:leather|padded|hide|magicitem|ring|cloak, sps:all|charm|divination|healing|sun, spm:animal|creation|necromantic|plant, ns:3],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Lay-On-Healing-Hands, lv:3, pd:1],[cl:PW, w:Charm-Fascination, lv:5, pd:3],[cl:PW, w:Prophesy, lv:9, pd:-1]{{desc=The god of all forms of light: Sunlight, moonlight, firelight, etc. The god is a friend of life, a patron of magic, a proponent of logical thought, and an enemy of the undead.\nThe priesthood of the god is devoted to celebrating these aspects of the god and to promoting positive forces such as healing.\nLesser gods of this attribute would be gods of one aspect of light. One god might be the god of Reason, another the god of Inspiration, etc.\nThis deity is as likely to be male as female.\nThe priests of this god are on good terms with the priests of Arts, Crafts, Darkness/Night, Dawn, Elemental Forces, Fire, Healing, Hunting, Literature/Poetry, Magic, Metalwork, Moon, Music/Dance, Oracles/Prophecy, and Sun.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Magic',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Magic}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]], Int:[[13]]}}{{Races=Elves, Half-Elves, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Neutral Good, True Neutral, or Neutral Evil}}{{Flock=Any Alignment}}{{ =**Spells**}}{{Major Spheres=All, Astral, Charm, Divination, Elemental, Healing, Protection, Summoning}}{{Minor Spheres=Animal, Guardian, Necromantic, Plant, Sun, Weather}}Specs=[Priest of Magic,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Inspire Fear* 2/day, *Languages* 1/level (1st-8th Level), *Turn Undead*}}{{3rd Level=*Infravision*}}{{8th Level=*Shapechange* 3/day}}ClassData=[w:Priest of Magic, align:ng|nn|n|ne, hd:1d8, race:elves|halfelves|humans, weaps:belayingpin|dagger|dirk|dart|knike|quarterstaff|sling, ac:magicitem|ring|cloak, sps:all|astral|charm|divination|elemental|healing|protection|summoning, spm:animal|guardian|necromantic|plant|sun|weather, ns:3],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Inspire-Fear, lv:1, pd:2],[cl:PW, w:Shapechange, lv:8, pd:3]{{desc=This god is the patron of magic in all its forms. At the DM\'s discretion, he could be the source of all magical energies used by the world\'s mages; or, he could just be the god responsible for teaching the most important spells and rituals to mortal mages. Either way, he is as beloved of mages as of any other class of characters.\nPriests of this god, in addition to encouraging worship of the god, act as scholars of magic. They help preserve libraries of magical information and encourage correspondence and the exchange of ideas (and spells) between mages.\nEvery school of magic or priest sphere of influence could have its own, lesser god: There could be a god of Necromancy, a god of Enchantment, etc.\nGods of magic are as likely to be male as female.\nThe priests of this god are on good terms with the priests of Darkness/Night, Dawn, Elemental Forces, Fire, Healing, Light, Moon, Oracles/Prophecy, and Sun.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-Night',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Night}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[11]], Int:[[11]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Neutral Good, Neutral Evil, or True Neutral}}{{Flock=Any Alignment}}{{ =**Spells**}}{{Major Spheres=All, Charm, Divination, Necromantic, Summoning and Sun}}{{Minor Spheres=Animal, Elemental, Guardian, Protection}}Specs=[Priest of Night,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Infravision*. NG \\amp N have *Turn Undead*, NE have *Control Undead*}}ClassData=[w:Priest of Night, align:NG|NN|N|NE, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow|crossbow|dagger|dirk|knife|stiletto|rapier|shortsword, ac:hide|leather|padded|magicitem|ring|cloak, sps:all|charm|divination|necromantic|summoning|sun, spm:animal|elemental|guardian|protection, ns:2],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Control-Undead, lv:1, pd:-1]{{desc=This god is a god of some forces that humans fear. However, this doesn\'t mean the god is evil. Generally, he\'s not. He\'s just the embodiment of darkness, including all its benefits and all its dangers. The god of Darkness and Night would be the god of sleep, of dreams, of nightmares, and of nocturnal predators; some of these traits are considered good, some ill.\nThe priests of this god are interested in making sure that man regards Darkness and Night with a reverential awe # making sure that the sentient humanoid races appreciate the virtues of night while still respecting or fearing its more frightening aspects. These priests tend to be more aloof from the common man than priests of many other gods.\nLesser gods of this attribute would be gods of only one of these factors. One might be the god of Sleep, and another the god of Nightmares. In these cases, the DM can choose to vary the god\'s alignment; the god of Sleep, much beloved of men, could be lawful good, while the god of Nightmares, hated by men, could be chaotic evil.\nGods of darkness or night are most likely to be female.\nThe priests of this god are on good terms with the priests of Dawn, Death, Elemental Forces, Hunting, Light, Magic, Moon, Oracles/Prophecy, and Sun. Some DMs may be surprised that the gods of Darkness and Night are not listed here as being opposed to those of light and sun. It\'s because they don\'t have to be; in Greek mythology, for instance, the sun-god, moon-goddess, and dawn-goddess were all siblings who never opposed one another. Naturally, the individual DM can decide for his campaign that the deities of darkness and light, moon and sun are enemies.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-War',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of War}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[9]], Str:[[13]]}}{{Race=Dwarves, elves, gnomes, half-elves, halflings, humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Any Neutral}}{{Flock=Any}}Specs=[Priest of War,PriesthoodClass,0H,Priest]{{ =**Spells**}}{{Major Spheres=All, Combat, Healing}}{{Minor Spheres=Necromantic, Protection}}{{.=**Powers**}}{{1st Level=*Incite Berserker Rage* 1/day}}{{5th Level=*Inspire Fear* 1/day}}ClassData=[w:Priest of War, hd:1d8, align:ng|nn|n|ne, weaps:battleaxe|bow|lance|footmansmace|horsemansmace|maul|polearm|spears|shortblade|mediumblade|longblade|fencingblade|warhammer, ac:any, sps:all|combat|healing, spm:necromantic|protection, ns:2],[cl:PW, w:Incite-Rage, lv:1, pd:1],[cl:PW, w:Inspire-Fear, lv:5, pd:1]{{desc=This god is the deity of combat and warfare. He exists only to promote and participate in bloody battle.\nEach nation has priests of this god, and in each nation the priests constitute a separate cult; they do not cooperate with one another in times of war, especially when their armies are opposed. They help train new warriors, teach battlefield tactics, and make records of the most valiant fights of any war or battle.\nIn painful times of peace, these individual sects may cooperate with one another. However, they usually only do so to conspire and start up another war.\nLesser gods of war will be gods of some secondary aspect. One might be the god of Berserker Rages, another the god of Battlefield Terror, another the god of Confusion, another the god of Tactics, another the god of Cavalry... and so on.\nThe chief war-god is male, but lesser war-gods are as likely to be female as male.\nThe priests of this god are on good terms with the priests of Community, Culture, Guardianship, Justice/Revenge, Messengers, Metalwork, Mischief/Trickery, and Rulership/Kingship. The priests of this god dislike the priests of Peace.}}'},
						{name:'Priest-of-Wisdom',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of Wisdom}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[13]]}}{{Races=Dwarves, Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Any Good, tending to Neutral Good}}{{Priests=Any Good}}{{Flock=Any not Evil}}{{ =**Spells**}}{{Major Spheres=All, Charm, Divination}}{{Minor Spheres=Healing, Sun}}Specs=[Priest of Wisdom,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Immunity* to *confusion* and *feeblemind* spells, *Soothing Word* 3/day}}{{5th Level=*Inspire Fear* 2/day}}{{8th Level=*Prophesy*}}ClassData=[w:Priest of the Sun, align:lg|ng|cg, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow|crossbow|dagger|dirk|dart|javelin|knife|spear, ac:brigandine|mail|plate|studdedleather|magicitem|ring|cloak, sps:all|divination|healing|necromantic|sun, spm:charm|elementalfire|plant|protection, ns:4],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Lay-on-Hands, lv:5, pd:1],[cl:PW, w:Prophesy, lv:8, pd:-1],[cl:PW, w:Chariot-of-Sustarre, lv:10, pd:1]{{desc=This god is a god of magic, healing, inspiration, and life, sometimes of madness and heatstroke. He is an enemy of dark creatures, especially the undead.\nThe priesthood of this god exists to promote all those traits among the flock, and to celebrate the daily blessing that the sun-god shines down upon the world.\nThe sun-god is usually male.\nThe priests of this god are on good terms with the priests of Arts, Crafts, Darkness/Night, Dawn, Elemental Forces, Fire, Healing, Hunting, Light, Literature/Poetry, Magic, Metalwork, Moon, Music/Dance, and Oracles/Prophecy.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-the-Moon',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of the Moon}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[10]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Neutral Good, True Neutral, or Neutral Evil}}{{Flock=Any Alignment}}{{ =**Spells**}}{{Major Spheres=All, Charm, Divination, Summoning, Sun}}{{Minor Spheres=Animal, Elemental, Healing, Necromantic}}Specs=[Priest of the Moon,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Charm-Fascination* 3/day, *Infravision*}}{{5th Level=*Inspire-Fear* 2/day}}{{10th Level=*Chariot of Sustarre* 1/day}}ClassData=[w:Priest of the Moon, align:ng|nn|n|ne, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow|dagger|dirk|dart|javelin|knife|sling|spear, ac:hide|padded|leather|shield|magicitem|ring|cloak, sps:all|charm|divination|summoning|sun, spm:animal|elemental|healing|necromantic, ns:3],[cl:PW, w:Charm-Fascination, lv:1, pd:3],[cl:PW, w:Inspire-Fear, lv:5, pd:2],[cl:PW, w:Chariot-of-Sustarre, lv:10, pd:1]{{desc=This deity is a god of inspiration, magic, and mystery, and is closely related to the god of Darkness.\nHis priests celebrate the magics and light granted by the moon.\nIn a fantasy setting, there could be numerous gods of the moon... one for each of several moons the planet possesses.\nMost moon-gods are female.\nThe priests of this god are on good terms with the priests of Darkness/Night, Dawn, Hunting, Light, Magic, Oracles/Prophecy, and Sun.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Priest-of-the-Sun',type:'PriesthoodClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Priest of the Sun}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]], Int:[[12]]}}{{Races=Elves, Gnomes, Half-Elves, Halflings, Humans}}{{Hit Dice=1d8}}{{=**Alignment**}}{{Deity=Any Good, tending to Neutral Good}}{{Priests=Any Good}}{{Flock=Any not Evil}}{{ =**Spells**}}{{Major Spheres=All, Divination, Healing, Necromantic, Sun}}{{Minor Spheres=Charm, Elemental (Fire), Plant, Protection}}Specs=[Priest of the Sun,PriesthoodClass,0H,Priest]{{.=**Powers**}}{{1st Level=*Detect Secret Doors* as Elf, 1 in 6 10ft rad, 2 in 6 secret doors \\amp 3 in 6 concealed portal if actively searching (elven priests +1), *Infravision*, *Turn Undead*}}{{5th Level=*Lay on Hands* 1/day}}{{8th Level=*Prophesy* (not at will)}}{{10th Level=*Chariot of Sustarre* 1/day}}ClassData=[w:Priest of the Sun, align:lg|ng|cg, hd:1d8, race:elves|gnomes|halfelves|halflings|humans, weaps:bow|crossbow|dagger|dirk|dart|javelin|knife|spear, ac:brigandine|mail|plate|studdedleather|magicitem|ring|cloak, sps:all|divination|healing|necromantic|sun, spm:charm|elementalfire|plant|protection, ns:4],[cl:PW, w:Turn-Undead, lv:1, pd:-1],[cl:PW, w:Lay-on-Hands, lv:5, pd:1],[cl:PW, w:Prophesy, lv:8, pd:-1],[cl:PW, w:Chariot-of-Sustarre, lv:10, pd:1]{{desc=This god is a god of magic, healing, inspiration, and life, sometimes of madness and heatstroke. He is an enemy of dark creatures, especially the undead.\nThe priesthood of this god exists to promote all those traits among the flock, and to celebrate the daily blessing that the sun-god shines down upon the world.\nThe sun-god is usually male.\nThe priests of this god are on good terms with the priests of Arts, Crafts, Darkness/Night, Dawn, Elemental Forces, Fire, Healing, Hunting, Light, Literature/Poetry, Magic, Metalwork, Moon, Music/Dance, and Oracles/Prophecy.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}'},
						{name:'Psion',type:'PsionClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Psionicist}}{{subtitle=Psion Class}}{{Min Abilities=Con:[[11]], Int:[[12]], Wis:[[15]]}}{{Race=Human, Halfling, Dwarf, Gnome, Elf, Half-Elf}}{{Hit Dice=1d6}}{{Alignment=Any not Chaotic}}Specs=[Psionicist,PsionClass,0H,Psion]{{Powers=Psionics (not yet implemented). See Reference}}ClassData=[w:Psion, hd:1d6, align:lg|ln|le|ng|nn|n|ne, weaps:shortbow|lightcrossbow|handcrossbow|shortblade|club|handaxe|throwingaxe|horsemansmace|horsemanspick|scimitar|spear|warhammer, ac:padded|leather|studdedleather|smallshield|magicitem|ring|cloak]{{desc=Psionicists are extraordinary characters who develop their powers through arduous training. (While members of other classes may occasionally boast a psionic power or two, such characters are mere shadows of true psionicists.) An NPC psionicist has the potential to stand his own against any other class. As a PC in a team of adventurers, the psionicist will complement other classes well. Most of the psionicist\'s powers are unique. He advances slowly, at a rate somewhere between the fighter and mage. At low levels, however, the psionicist has the potential to be powerful.}}'},
						{name:'Psionicist',type:'PsionClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Psionicist}}{{subtitle=Psion Class}}{{Min Abilities=Con:[[11]], Int:[[12]], Wis:[[15]]}}{{Race=Human, Halfling, Dwarf, Gnome, Elf, Half-Elf}}{{Hit Dice=1d6}}{{Alignment=Any not Chaotic}}Specs=[Psionicist,PsionClass,0H,Psion]{{Powers=Psionics (not yet implemented). See Reference}}ClassData=[w:Psion, hd:1d6, align:lg|ln|le|ng|nn|n|ne, weaps:shortbow|lightcrossbow|handcrossbow|shortblade|club|handaxe|throwingaxe|horsemansmace|horsemanspick|scimitar|spear|warhammer, ac:padded|leather|studdedleather|smallshield|magicitem|ring|cloak]{{desc=Psionicists are extraordinary characters who develop their powers through arduous training. (While members of other classes may occasionally boast a psionic power or two, such characters are mere shadows of true psionicists.) An NPC psionicist has the potential to stand his own against any other class. As a PC in a team of adventurers, the psionicist will complement other classes well. Most of the psionicist\'s powers are unique. He advances slowly, at a rate somewhere between the fighter and mage. At low levels, however, the psionicist has the potential to be powerful.}}'},
						{name:'Ranger',type:'WarriorClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Ranger}}{{subtitle=Warrior Class}}{{Min Abilities=Str:[[12]], Dex:[[13]], Con:[[14]], Wis:[[14]]}}{{Alignment=Any Good}}{{Race=Human, Elf or Half-Elf}}Specs=[Ranger,WarriorClass,0H,Warrior]{{Hit Dice=1d10}}{{=**Powers**}}{{1st Level=*Tracking, Hide In Shadows* (Natural Surroundings), *Move Silently* (Natural Surroundings), *Animal Friendship*}}{{8th Level=Cast limited Priest Spells from *Animal* and *Plant* spheres}}ClassData=[w:Ranger, align:lg|ng|cg, hd:1d10, race:human|elf|halfelf, weaps:any, ac:any, sps:plant|animal, slv:3|8|9|PR, spl1:1|2|2|2|2|3|3|3|3, spl2:0|0|1|2|2|2|2|3|3, spl3:0|0|0|0|1|1|2|2|3, ns:1],[cl:PW, w:Rangers-Animal-Friendship, lv:1, pd:-1]{{desc=The ranger is a hunter and woodsman who lives by not only his sword, but also his wits. Robin Hood, Orion, Jack the giant killer, and the huntresses of Diana are examples of rangers from history and legend. The abilities of the ranger make him particularly good at tracking, woodcraft, and spying.}}'},
						{name:'Rogue',type:'RogueClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Rogue}}{{subtitle=Rogue Class}}{{Min Abilities=Dex:[[9]]}}{{Race=Any}}{{Hit Dice=1d6}}{{Alignment=Any not Lawful}}Specs=[Rogue,RogueClass,0H,Rogue]{{=**Powers**}}{{1st Level=Thieving Abilities *Pick Pockets, Open Locks, Find/Remove Traps, Move Silently, Hide in Shadows, Detect Noise, Climb Walls,* and *Read Languages* Also, Thieves can *Backstab*}}{{10th Level=Limited ability to use magical \\amp priest scrolls, with 25% chance of backfire}}ClassData=[w:Rogue, hd:1d6, align:ng|nn|n|ne|cg|cn|ce, weaps:club|shortblade|fencingblade|dart|handxbow|lasso|shortbow|sling|broadsword|longsword|staff, ac:padded|leather|studdedleather|elvenchain|magicitem|ring|cloak]{{desc=Thieves come in all sizes and shapes, ready to live off the fat of the land by the easiest means possible. In some ways they are the epitome of roguishness.\nThe profession of thief is not honorable, yet it is not entirely dishonorable, either. Many famous folk heroes have been more than a little larcenous -- Reynard the Fox, Robin Goodfellow, and Ali Baba are but a few. At his best, the thief is a romantic hero fired by noble purpose but a little wanting in strength of character. Such a person may truly strive for good but continually run afoul of temptation.}}'},
						{name:'Thief',type:'RogueClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Thief}}{{subtitle=Rogue Class}}{{Min Abilities=Dex:[[9]]}}{{Race=Any}}{{Hit Dice=1d6}}{{Alignment=Any not Lawful}}Specs=[Thief,RogueClass,0H,Rogue]{{=**Powers**}}{{1st Level=Thieving Abilities *Pick Pockets, Open Locks, Find/Remove Traps, Move Silently, Hide in Shadows, Detect Noise, Climb Walls,* and *Read Languages* Also, Thieves can *Backstab*}}{{10th Level=Limited ability to use magical \\amp priest scrolls, with 25% chance of backfire}}ClassData=[w:Thief, hd:1d6, align:ng|nn|n|ne|cg|cn|ce, weaps:club|shortblade|fencingblade|dart|handxbow|lasso|shortbow|sling|broadsword|longsword|staff, ac:padded|leather|studdedleather|elvenchain|magicitem|ring|cloak]{{desc=Thieves come in all sizes and shapes, ready to live off the fat of the land by the easiest means possible. In some ways they are the epitome of roguishness.\nThe profession of thief is not honorable, yet it is not entirely dishonorable, either. Many famous folk heroes have been more than a little larcenous -- Reynard the Fox, Robin Goodfellow, and Ali Baba are but a few. At his best, the thief is a romantic hero fired by noble purpose but a little wanting in strength of character. Such a person may truly strive for good but continually run afoul of temptation.}}'},
						{name:'Transmuter',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Transmuter}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Dex:[[15]]}}{{Alignment=Any}}{{Race=Human or Half Elf}}{{Hit Dice=1d4}}Specs=[Transmuter,WizardClass,0H,Wizard]{{=**Spells**}}{{Specialist=Alteration}}{{Banned=Abjuration \\amp Necromancy}}ClassData=[w:Transmuter, hd:1d4, race:human|halfelf, sps:alteration, spb:abjuration|necromancy, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Spells of this school enable the caster to channel magical energies to cause direct and specific change in an existing object, creature, or condition. Alterations can affect a subject\'s form (*polymorph other*), weight (*feather fall*), abilities (*strength*), location (*teleport without error*), or even his physical well-being (*death fog*).}}'},
						{name:'Warrior',type:'WarriorClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Fighter}}{{subtitle=Warrior Class}}{{Min Abilities=Str:[[9]]}}{{Alignment=Any}}{{Race=Any}}Specs=[Fighter,WarriorClass,0H,Warrior]{{Powers=None}}{{Hit Dice=1d10}}ClassData=[w:Fighter, align:any, race:any, hd:1d10, weaps:any, ac:any]{{desc=The fighter is a warrior, an expert in weapons and, if he is clever, tactics and strategy. There are many famous fighters from legend: Hercules, Perseus, Hiawatha, Beowulf, Siegfried, Cuchulain, Little John, Tristan, and Sinbad. History is crowded with great generals and warriors: El Cid, Hannibal, Alexander the Great, Charlemagne, Spartacus, Richard the Lionheart, and Belisarius. Your fighter could be modeled after any of these, or he could be unique. A visit to your local library can uncover many heroic fighters.}}'},
						{name:'Wizard',type:'WizardClass',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:'+fields.defaultTemplate+'}{{name=Wizard}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]]}}{{Alignment=Any}}{{Race=Human, Elf or Half-Elf}}{{Hit Dice=1d4}}Specs=[Wizard,WizardClass,0H,Wizard]{{Spells=Any}}ClassData=[w:Wizard, hd:1d4, race:human|elf|halfelf, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]{{desc=Mages are the most versatile types of wizards, those who choose not to specialize in any single school of magic. This is both an advantage and disadvantage. On the positive side, the mage\'s selection of spells enables him to deal with many different situations. (Wizards who study within a single school of magic learn highly specialized spells, but at the expense of spells from other areas.) The other side of the coin is that the mage\'s ability to learn specialized spells is limited compared to the specialist\'s.\nMages have no historical counterparts; they exist only in legend and myth. However, players can model their characters after such legendary figures as Merlin, Circe, or Medea. Accounts of powerful wizards and sorceresses are rare, since their reputations are based in no small part on the mystery that surrounds them. These legendary figures worked toward secret ends, seldom confiding in the normal folk around them.}}'},
					]},
	});
	
	const handouts = Object.freeze({
	AttackMaster_Help:	{name:'AttackMaster Help',
						 version:1.10,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">AttackMaster Help v1.10</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Attack Master API v'+version+'</h1>'
							+'<p>AttackMaster API provides functions to manage weapons, armour & shields, including taking weapons in hand and using them to attack.  It uses standard AD&D 2e rules to the full extent, taking into account: ranged weapon ammo management with ranges varying appropriately and range penalties/bonuses applied; Strength & Dexterity bonuses where appropriate; any magic bonuses to attacks that are in effect (if used with <b>RoundMaster API</b> effects); penalties & bonuses for non-proficiency, proficiency, specialisation & mastery; penalties for non-Rangers attacking with two weapons; use of 1-handed, 2-handed or many-handed weapons and restrictions on the number of weapons & shields that can be held at the same time; plus many other features.  This API works best with the databases provided with this API, which hold the data for automatic definition of weapons and armour.  However, some attack commands will generally work with manual entry of weapons onto the character sheet.  The <b>CommandMaster API</b> can be used by the GM to easily manage weapon proficiencies.</p>'
							+'<p>Specification for weapons, armour & shields are implemented as ability macros in specific database character sheets.  This API comes with a wide selection of weapon and armour macros, held in databases that are created and updated automatically when the API is run.  If the <b>MagicMaster API</b> is also loaded, it provides many more specifications for standard and magic items that are beneficial to melee actions and armour class.  The GM can add to the provided items in the databases using standard Roll20 Character Sheet editing, following the instructions provided in the relevant Database Help handout.</p>'
							+'<p><b><u>Note:</u></b> For some aspects of the APIs to work, the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs: <b>RoundMaster, InitiativeMaster, MagicMaster and CommandMaster</b>.  This will provide the most immersive game-support environment</p>'
							+'<h2>Syntax of AttackMaster calls</h2>'
							+'<p>The AttackMaster API is called using !attk.</p>'
							+'<pre>!attk --help</pre>'
							+'<p>Commands to be sent to the AttackMaster API must be preceded by two hyphens <b>\'--\'</b> as above for the <b>--help</b> command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!attk --attk-hit token_id | [message] | [monster weap1] | [monster weap2] | [monster weap3]</pre>'
							+'<p>If optional parameters are not to be included, but subsequent parameters are needed, use two vertical bars together with nothing between them, e.g.</p>'
							+'<pre>!attk --checkac token_id || [SADJ / PADJ / BADJ]</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!attk --checkac token_id | [ SILENT ] | [SADJ / PADJ / BADJ] -weapon token_id</pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>'
							+'<br>'
							+'<h2>Using Character Sheet Ability/Action buttons</h2>'
							+'<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>'
							+'<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: <b>--menu</b> and <b>--other-menu</b>.  From these, most other commands can be accessed.  If using the <b>CommandMaster API</b>, its character sheet setup functions can be used to add the necessary Ability Macros and Token Action Buttons to any Character Sheet.</p>'
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<h3>1. Menus</h3>'
							+'<pre>--menu [token_id]<br>'
							+'--other-menu [token_id]</pre>'
							+'<h3>2. Attacking commands</h3>'
							+'<pre>--attk-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-roll [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-target [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--twoswords [token_id]|[prime-weapon]</pre>'
							+'<h3>3. Weapon Management</h3>'
							+'<pre>--weapon [token_id]<br>'
							+'--dance [token_id] | weapon  | [ STOP ]<br>'
							+'--mod-weapon [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>'
							+'--quiet-modweap [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>'
							+'--edit-weapons [token_id]</pre>'
							+'<h3>4. Ammunition Management</h3>'
							+'<pre>--ammo [token_id]<br>'
							+'--setammo [token_id] | ammo_name | [ [+/-]cur_qty / = ] | [ [+/-]max_qty / = ] | [ SILENT ]</pre>'
							+'<h3>5. Armour Class and Saving Throws</h3>'
							+'<pre>--edit-armour [token_id]<br>'
							+'--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]<br>'
							+'--save [token_id] | [situation-mod]</pre>'
							+'<h3>6. Other Commands</h3>'
							+'<pre>--help<br>'
							+'--config [PROF/ALL-WEAPS/WEAP-CLASS/ALL-ARMOUR/MASTER-RANGE/SPECIALIST-RULES/SPELL-NUM] | [TRUE/FALSE]<br>'
							+'--check-db [ db-name ]<br>'
							+'--handshake from | [cmd]<br>'
							+'--hsq from | [cmd]<br>'
							+'--hsr from | [cmd] | [TRUE/FALSE]<br>'
							+'--debug [ ON / OFF ]</pre>'
							+'<h3>7. How To Use AttackMaster</h3>'
							+'<pre>Specifying a token<br>'
							+'Who can make AttackMaster API command calls<br>'
							+'Weapons that can be used<br>'
							+'Allocating weapons to a Character<br>'
							+'Selecting weapons to attack with<br>'
							+'Making attacks<br>'
							+'Ammunition<br>'
							+'Ranged weapon and ammunition ranges<br>'
							+'Dancing weapons<br>'
							+'Armour Class management<br>'
							+'Saves</pre>'
							+'<br>'
							+'<h2>Command details</h2>'
							+'<h2>1. Menus</h2>'
							+'<h3>1.1 Display a menu to do actions relating to attacks</h3>'
							+'<pre>--menu [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token</p>'
							+'<p>Displays a Chat menu with buttons for: Attacking, with either Roll20 rolling a dice, or the Player entering a dice roll result; changing what is in the Character\'s (or NPC\'s) hands; to recover spent ammo; and to check the current Armour Class for the Character under various circumstances.  If the GM uses the menu, an additional button for a Targeted Hit appears, which allows the GM to select both the attacker and the target and get full specs on the hit and damage done, and the AC & current hit Points of the target.</p>'
							+'<h3>1.2 Display a menu of other actions</h3>'
							+'<pre>--other-menu [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token</p>'
							+'<p>Displays a Chat menu with buttons for: saving throws and saving throw management; and managing light sources for the character\'s token (if Dynamic Lighting is being used) (requires <b>MagicMaster API</b> to work).  If the GM uses the menu, two further options appear: mark the token selected as Dead (which also marks the body as an inanimate object that can be looted); and the ability to adjust damage for the selected token for any arbitrary reason, which can also be noted.</p>'
							+'<h2>2. Attacking Commands</h2>'
							+'<h3>2.1 Attack an opponent with a weapon</h3>'
							+'<pre>--attk-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-roll [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-target [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]</pre>'
							+'<p>Each takes an optional token ID (if not specified uses selected token), an optional formatted message to include with the attack damage, and up to three optional names for each of the monster attacks that are displayed on the attack menu.</p>'
							+'<p>Each of these three commands present a menu of currently possible attacks, using the weapons and ammo in-hand or, for monsters using the Monster tab on the AD&D 2e Character Sheet, up to 3 types of monster attacks.  Ranged weapon attacks will prompt the Player to specify which range to fire at. Selecting one of the possible attacks has different outcomes based on the command used:</p>'
							+'<dl><dt>--attk-hit</dt><dd>prompts Roll20 to make an attack roll, using 3D dice if they are enabled, displays the AC hit with supporting information on how this was calculated and displays buttons to roll for damage if the attack is successful.</dd>'
							+'<dt>--attk-roll</dt><dd>displays an entry field to allow the Player to enter the value of their own dice roll (for those that prefer to roll their own dice) though the default entry will also roll the dice for the player.  Subsequently, the process is the same as --attk-hit.</dd>'
							+'<dt>--attk-target</dt><dd>asks the Player to select a target token for the attack.  It then displays the AC the attack roll will hit and the AC of the selected target.  It also automatically rolls damage for Small/Medium and Large targets, and displays the current Hit Points for the targeted token.  Recommended only for the DM, as it reveals information about the target</dd></dl>'
							+'<p>The optional message is displayed as part of the display of the damage done on a successful hit.  If a monster, the message can be three concatenated messages separated by \'$$\'.  The message can include API Buttons if needed.  The following characters must be replaced (escaped) using these replacements:</p>'
							+'<table>'
							+'	<tr><th scope="row">Character</th><td>?</td><td>[</td><td>]</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td></tr>'
							+'	<tr><th scope="row">Substitute</th><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td>`</td><td>~</td><td>&amp;#124;</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td></tr>'
							+'	<tr><th scope="row">Alternative</th><td>\\ques</td><td>\\lbrak</td><td>\\rbrak</td><td>\\at</td><td>\\dash</td><td>\\vbar</td><td>\\clon</td><td>\\amp</td><td>\\lbrc</td><td>\\rbrc</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>2.2 Use two weapons to attack</h3>'
							+'<pre>--twoswords [token_id]|[prime-weapon]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token) and an optional weapon name.</p>'
							+'<p>This command sets the system up to apply the correct penalties / bonuses when using two weapons to attack.  Under AD&D 2e rules, only types of Fighter & Rogue can use 2 weapons at a time to attack in a round, and only Rangers do so without penalty.  Using this command with the name of a <i>prime-weapon</i> specified will mark that weapon as the Primary which will get the smaller penalty of the two and will also be allowed multiple attacks per round (if using <b>InitiativeMaster API</b>).  Use of any other weapon during the current or subsequent rounds will incur a larger penalty and be restricted to one attack per round regardless of type of weapon, level & proficiency.  Penalties are adjusted by the Dexterity Reaction Adjustment.  See AD&D 2e PHB p96 for full explanation of rules applied.</p>'
							+'<p>Calling this command without a prime-weapon specified will terminate two-weapon mode and no penalties will be applied for the current and subsequent rounds.</p>'
							+'<br>'
							+'<h2>3. Weapon Management</h2>'
							+'<h3>3.1 Change weapons currently in hand</h3>'
							+'<pre>--weapon [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>This command displays a chat menu displaying what is currently in the Character\'s (or NPC or creature\'s) hands, and allowing the Player to change what is held to any weapon or shield that they have in their backpack.  Subsequent attacks will then use the newly specified weapon(s).  When selecting a ranged weapon that uses ammunition, the appropriate ammunition held in their backpack is also loaded into the character\'s "quiver".</p>'
							+'<p>Selecting a hand (either Left or Right) will display any 1-handed weapons that can be used for selection in a list.  Selecting the Both Hands button will display all the 2-handed weapons (including bows) that can be used for selection in a list.  Some weapons can be used either 1-handed or 2-handed, and the appropriate stats will be given based on the selection made.</p>'
							+'<p>A button is also shown to allow the Character to "lend" their hands to another Character: this will allow the receiving Character to use weapons and devices that require more than 2 hands, such as large siege engines and windlasses on ships.  If the donating Character selects to take any new weapon in-hand, the "lent" hands will be removed from the receiving Character and any device needing more hands than are left will be dropped.  Multiple Characters can lend hands to a receiving Character so that very large devices (such as a Battering Ram) can be used.</p>'
							+'<p>If being used by the GM, the menu also has an option to change the number of hands the creature has, which will then allow the creature to hold (and attack with) more than two items, or to hold items that require more than two hands.</p>'
							+'<p><b>Note:</b> this function is dependent on the weapon and shield definitions including certain key information in a specified format: see section 8 below.</p>'
							+'<h3>3.2 Manage a dancing weapon</h3>'
							+'<pre>--dance [token_id] | weapon  | [ STOP ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and an optional STOP command.</p>'
							+'<p>This command marks the named weapon as "dancing" which means it will no longer occupy a hand, but will still appear in the list of possible attacks when an attack is made.  When started, the --weapon command is automatically run so that an additional weapon can be taken in the freed-up hand.</p>'
							+'<p>Appending the "STOP" command will un-mark the weapon as dancing.  The Player will have to take the no-longer dancing weapon back in hand, if they so desire, using the --weapon command.</p>'
							+'<p><b>Note:</b> the most effective use of the --dance command is when combined with the RoundMaster effect management system, to count down rounds of use, automatically call the --dance command at the appropriate time, and stop the dancing automatically after the appropriate duration.</p>'
							+'<h3>3.3 Manage weapon statistics</h3>'
							+'<pre>--mod-weapon [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>'
							+'--quiet-modweap [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments</pre>'
							+'<p>Each command takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and a mandatory data type.</p>'
							+'<p>These commands allow the specifications of any weapon currently in-hand to be adjusted programmatically.  E.g. the magical plus on to-hit and damage can be adjusted round by round (as for a Sword of Dancing.  The type of data to be adjusted must be identified using the data type parameter: MELEE & RANGED alter To-Hit data, and DMG & AMMO alter Damage.</p>'
							+'<p>The weapon parameter can name a specific weapon name, a type of weapon (e.g. bow, long-blade, club etc), a changed weapon name (previously changed by this command), or even \'all\' for all currently held weapons.  All data of the specified data type for all weapons that match the weapon parameter may then be altered, using the comma-separated adjustments parameter.  Each adjustment is of the format <i><pre>field_id:[=][+/-]value</pre></i> where the field_ids are:</p>'
							+'<table><tr><td>w:</td><td>weapon name</td><td>t:</td><td>weapon type</td><td>st:</td><td>weapon super-type</td></tr>'
							+'<tr><td>sb:</td><td>strength bonus</td><td>db:</td><td>dexterity bonus</td><td>+:</td><td>magical plus</td></tr>'
							+'<tr><td>n:</td><td>number of attacks per round</td><td>pl:</td><td>proficiency level</td><td>pd:</td><td>dancing proficiency level</td></tr>'
							+'<tr><td>ch:</td><td>critical hit roll</td><td>cm:</td><td>critical miss roll</td><td>sz:</td><td>size</td></tr>'
							+'<tr><td>r:</td><td>range (can be #/#/#)</td><td>ty:</td><td>damage type</td><td>sp:</td><td>speed in segments</td></tr>'
							+'<tr><td>sm:</td><td>damage vs small & medium</td><td>l:</td><td>damage vs large</td></tr></table>'
							+'<br>'
							+'<p>Numeric values can be preceeded by + or -, which will adjust rather than replace the current value.  To set a value as negative, precede the minus by an equals thus =-value.  For attributes that are relevant to multiple data types, only the specified data type will be adjusted.  Multiple attributes can be adjusted using one command call by concatenating comma-delimited adjustments. E.g. </p>'
							+'<pre>--mod-weap @{selected|token_id}|Sword-of-Dancing|MELEE|sb:0,+:+1,sp:-1</pre>'
							+'<p>If the weapon is not found, the GM receives an error message, but no other issues occur.</p>'
							+'<h3>3.4 Adding & removing weapons and ammunition</h3>'
							+'<pre>--edit-weapons [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>The very best way for the Character, NPC or creature to acquire weapons (or any other items including magic items) is to use the <b>MagicMaster API</b> and its commands and databases.  However, AttackMaster provides a small subset of those facilities to allow the DM and/or Players to add weapons, ammo & armour to their Character Sheet item bags.  Once added, these items can be taken \'in-hand\' by the Character (using the <b>--weapon</b> command) and then used to attack.</p>'
							+'<p>The advantage of doing this over just typing the item names into the Character Sheet tables is that the items are assured to exist in the weapon, ammo & armour databases that come with the API and so all other aspects of the API will work properly.</p>'
							+'<p>This command and <b>--edit-armour</b> are identical, and call the same menu.</p>'
							+'<br>'
							+'<h2>4. Ammunition Management</h2>'
							+'<h3>4.1 Ammunition recovery</h3>'
							+'<pre>--ammo [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>This command displays a chat menu of ammunition that the Character has on their person (not just the ammo that they have in their quiver or in-hand) including any ammunition that has run-out but might still be recoverable.  The Player can ask the DM if they can retrieve any ammunition of the types displayed that they have recently used and, once the DM responds with the amount recovered, click on the type of ammunition in the list and enter the amount recovered.  Both the amount on their person, and any amount in their quiver or in-hand are updated.</p>'
							+'<p><b>Note:</b> enter the amount recovered <em>not</em> the new total.  The amount entered will be added to the current amount held, and then this new value set as the new maximum.  A negative amount can also be entered, which will be removed from the current quantity and will also set the new maximum.</p>'
							+'<p><b>Note:</b> after a Long Rest (see <b>MagicMaster API</b>) all ammunition maximum totals are set to current quantities at that time.  It is assumed that during the period of a long rest, some creature will have found any loose ammo, or it will otherwise have been broken or lost.</p>'
							+'<p><b>Note:</b> ammunition that has the item-type of <i>\'charged\'</i> will appear on the menu with a grey box which cannot be selected, indicating that the ammo cannot be recovered - such ammunition always breaks on contact: e.g. glass arrows.</p>'
							+'<h3>4.2 Ammunition quantity amendment</h3>'
							+'<pre>--setammo [token_id] | ammo_name | [ [+/-]cur_qty / = ] | [ [+/-]max_qty / = ] | [ SILENT ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), the unique name of the ammunition, an optional value for the current quantity, optionally preceded by +/- or replaced by an =, an optional value for the maximum quantity with the same +/- & = possibilities, and an optional parameter of "Silent" (case insensitive).</p>'
							+'<p>This command allows programmatic or macro alteration of the quantity of a type of ammo:</p>'
							+'<ul><li>The current quantity and/or the maximum held (i.e. the amount to which ammunition can be recovered up to - see section 4.1 Ammunition Recovery, above) can be set to absolute values just by entering numbers for the parameters.</li>'
							+'<li>Either parameter can be preceded by a + or -, in which case the parameter will modify the corresponding current value, rather than replacing it.</li>'
							+'<li>Either parameter can be an = by itself.  In this instance, the corresponding value is set to the other corresponding value (after any modification) i.e. putting = for cur_qty sets the current quantity held to be the maximum possible, or putting = for max_qty sets the maximum possible to be the current quantity.  Putting = for both does nothing.</li>'
							+'<li>No value can go below 0, and the current quantity will be constrained at or below the maximum quantity.</li></ul>'
							+'<p>So, for example, this command will set the maximum quantity to 10 and set the current quantity to be equal to it:</p>'
							+'<pre>!attk -setammo @{selected|token_id}|Flight-Arrow+1|=|10|silent</pre>'
							+'<p>If the "Silent" parameter is not specified, then the Ammunition Recovery chat menu will display with the amended values once complete, and a message is displayed with the changes that occurred.</p>'
							+'<p><b>Note:</b> if more than one ammo item of the same name is listed in the backpack table (see section 7 on Character Sheet Setup), only the first item found will be amended.  If no item of that name is found, nothing happens and no menus or messages are displayed.</p>'
							+'<br>'
							+'<h2>5. Armour Class and Saving Throws</h2>'
							+'<h3>5.1 Edit Armour</h3>'
							+'<pre>--edit-armour [token_id]<br>'
							+'--edit-armor [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>The very best way for the Character, NPC or creature to acquire armour (or any other items including magic items) is to use the <b>MagicMaster API</b> and its commands and databases.  However, AttackMaster provides a small subset of those facilities to allow the DM and/or Players to add weapons, ammo & armour to their Character Sheet item bags.  Once added, these items can be taken \'in-hand\' by the Character (using the <b>--weapon</b> command), and improve the Armour Class of the Character appropriately.</p>'
							+'<p>The advantage of doing this over just typing the item names into the Character Sheet tables is that the items are assured to exist in the weapon, ammo & armour databases that come with the API and so all other aspects of the API will work properly (see section 5.2 below).</p>'
							+'<p>This command is identical to the <b>--edit-weapons</b> command and uses the same menu.</p>'
							+'<h3>5.2 Review Armour Class</h3>'
							+'<pre>--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), an optional "Silent" command, and an optional damage type which can be "SADJ", "PADJ" or "BADJ" (the "Silent" and damage type parameters are not case sensitive).</p>'
							+'<p>This command analyses the items in the Character\'s backpack table (see section 7 on Character Sheet Setup) using the information in the various item databases supplied / created by the API(s), and taking into account the current Dexterity bonuses calculates the current Armour Class of the Character.  It then displays a chat message with its results and an explanation of how it came to them.  If the optional damage type is provided, the calculation takes this into account.</p>'
							+'<p>The system can use the information in the databases to take into account magical armour plusses, combined effects of armour that can work together (like Armour and Shields), exclude combinations that are not allowed (like Rings of Protection with magical armour), and the armour types allowed for various character classes and races including specialist variations.</p>'
							+'<p>The system automatically updates this information any time the Character changes what is in their hands (e.g. if they pick up or put down a shield) using the <b>--weapon</b> command.  If using the InitMaster API, the command is also run every time the character does an Initiative roll.  If using the MagicMaster API, the command is also run any time items are looted from a chest or NPC, or stored away or given to another character.</p>'
							+'<p>The system remembers on the Character Sheet what its calculations are each time.  If the most recent calculation results in a change in Armour Class for the character, the character\'s token AC (if displayed) will be modified by the difference between the old and new values.  This modified value will be shown on the Armour Class Review message in the chat window if it is different from the calculated value.</p>'
							+'<p><b>Note:</b> the token displayed AC is only modified by the difference between the previous and current calculations.  This allows magical and other effects (such as those managed by the RoundMaster API) to alter the token displayed AC and not be overwritten by a change in calculated AC, but still take into account the change.  The token AC can be manually updated at any time without impact on this functionality, to overcome any errors.</p>'
							+'<p><b>Note:</b> if the token is configured following the Master Series API standard (see CommandMaster API documentation), the token bar for the displayed AC is normally hidden.  if the calculated AC and token displayed AC are different (see above) then the AC token bar appears, representing the difference between the two.  This acts as a visual reminder to the DM and Player that the token is the subject of some effect on AC - it also helps to identify if there is a difference in error, so that this can be manually rectified (by manually altering the token displayed AC).  Once the two are again the same and the <b>-check-ac</b> command run, the token AC bar will again be hidden.</p>'
							+'<h3>5.3 Saving Throws</h3>'
							+'<pre>--save [token_id] | [ situation-mod ]<br>'
							+'--save [token_id] | [ situation-mod ] | save-type | saving-throw</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), and different forms of the command take an optional situational modifier to the saving throw, a type of save (which can be one of \'paralysis\', \'poison\', \'death\', \'rod\', \'staff\', \'wand\', \'petrification\', \'polymorph\', \'breath\', or \'spell\', not sensitive to case), and the base, unmodified saving throw achieved on a dice.</p>'
							+'<p>This command can either display a menu from which to display and manage the saving throw table, and make saving throws or, in its second form, to make a saving throw and check the result against the saving throw table.</p>'
							+'<p>The first form shows all the possible saves that can be made, the saving throw that needs to be achieved to make the save, and any modifiers that apply to this particular character.  There are buttons to modify the saving throw table and the modifiers, and/or to apply a "situational modifier" to immediate saving throws (the "situational modifier" only applies to current rolls and is not remembered).  Also, each type of saving throw can actually be made by clicking the buttons provided.  Doing so effectively runs the second form of the command.</p>'
							+'<p>The situational modifier can optionally be passed in as a value with the command call if so desired, instead of selecting via the button on the menu.</p>'
							+'<p>Running the second form of the command (or selecting to make a saving throw from the first form\'s menu) will execute the saving throw (as a dice roll if this is specified instead of a straight value) of the specified type, using the data in the character\'s saving throw table to assess success or failure, displaying the outcome and the calculation behind it in the chat window.</p>'
							+'<br>'
							+'<h2>6.Other commands</h2>'
							+'<h3>6.1 Display help on these commands</h3>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h3>6.2 Configure API behavior</h3>'
							+'<pre>--config [PROF/ALL-WEAPS/WEAP-CLASS/ALL-ARMOUR/MASTER-RANGE/SPECIALIST-RULES/SPELL-NUM] | [TRUE/FALSE]</pre>'
							+'<p>Takes two optional arguments, the first a switchable flag name, and the second TRUE or FALSE.</p>'
							+'<p>Allows configuration of several API behaviors.  If no arguments given, displays menu for DM to select configuration.  Parameters have the following effects:</p>'
							+'<table>'
							+'	<thead><tr><th>Flag</th><th>True</th><th>False</th></tr></thead>'
							+'	<tr><th scope="row">DM-TARGET</th><td>Default Attack action for DM is a <i>Targeted Attack</i></td><td>Default Attack action for DM is a <i>To Hit Roll Attack</i></td></tr>'
							+'	<tr><th scope="row">PROF</th><td>Strictly apply non-proficient weapon penalties as per PHB</td><td>Use the non-proficient weapon penalty displayed on the Character Sheet</td></tr>'
							+'	<tr><th scope="row">ALL-WEAPS</th><td>Allow any character of any class to use and become proficient in any weapon.</td><td>Restrict the use of weapons by class to some degree set by WEAP-CLASS</td></tr>'
							+'	<tr><th scope="row">WEAP-CLASS</th><td>Weapons not allowed to a class get a penalty of -100</td><td>Weapons not allowed to a class get double non-proficient penalty</td></tr>'
							+'	<tr><th scope="row">ALL-ARMOUR</th><td>All armour types allowed for all classes</td><td>Armour not allowed to a class not included in AC calculations</td></tr>'
							+'	<tr><th scope="row">MASTER-RANGE</th><td>Ranged weapon Mastery gives double damage at Point Blank range</td><td>Ranged weapon Mastery not allowed, as per PHB</td></tr>'
							+'	<tr><th scope="row">SPECIALIST-RULES</th><td>Only Specialist Wizards specified in the PHB get an extra spell per spell level</td><td>Any non-Standard Wizard gets an extra spell per spell level</td></tr>'
							+'	<tr><th scope="row">SPELL-NUM</th><td>Spellcaster spells per level restricted to PHB rules</td><td>Spellcaster spells per level alterable using Misc Spells button</td></tr>'
							+'	<tr><th scope="row">ALL-SPELLS</th><td>Spellcaster spell schools are unrestricted</td><td>Spellcaster spell schools are restricted by class rules</td></tr>'
							+'</table>'
							+'<h3>6.3 Check database completeness & integrity</h3>'
							+'<pre>--check-db [ db-name ]</pre>'
							+'<p>Takes an optional database name or part of a database name: if a partial name, checks all character sheets with the provided text in their name that also have \'-db\' as part of their name.  If omitted, checks all character sheets with \'-db\' in the name.  Not case sensitive.  Can only be used by the GM.</p>'
							+'<p>This command finds all databases that match the name or partial name provided (not case sensitive), and checks them for completeness and integrity.  The command does not alter any ability macros, but ensures that the casting time (\'ct-\') attributes are correctly created, that the item lists are sorted and complete, and that any item-specific power & spell specifications are correctly built and saved.</p>'
							+'<p>This command is very useful to run after creating/adding new items as ability macros to the databases (see section 8 below).  It does not check if the ability macro definition itself is valid, but if it is then it ensures all other aspects of the database consistently reflect the new ability(s).</p>'
							+'<h3>6.4 Handshake with other APIs</h3>'
							+'<pre>-hsq from|[command]<br>'
							+'-handshake from|[command]</pre>'
							+'<p>Either form performs a handshake with another API, whose call (without the \'!\') is specified as <i>from</i> in the command parameters (the response is always an <b>-hsr</b> command).  The command calls the <i>from</i> API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>'
							+'<dl><dt>Received:</dt><dd><i>!attk -hsq init</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr attk</i></dd></dl>'
							+'<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the <i>command</i> string parameter is added, where <i>command</i> is the RoundMaster command (the \'--\' text without the \'--\').  This will respond with a <i>true/false</i> response: e.g.</p>'
							+'<dl><dt>Received:</dt><dd><i>!attk -handshake init|menu</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr attk|menu|true</i></dd></dl>'
							+'<h3>6.5 Switch on or off Debug mode</h3>'
							+'<pre>--debug (ON/OFF)</pre>'
							+'<p>Takes one mandatory argument which should be ON or OFF.</p>'
							+'<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player - so the DM or a technical advisor can play as a Player and see the debugging messages.</p>'
							+'<br>'
							+'<h2>How To Use AttackMaster</h2>'
							+'<h3>Specifying a token</h3>'
							+'<p>Most of the AttackMaster API commands need to know the token_id of the token that represents the character, NPC or creature that is to be acted upon.  This ID can be specified in two possible ways:</p>'
							+'<ol><li>explicitly in the command call using either a literal Roll20 token ID or using @{selected|token_id} or @{target|token_id} in the command string to read the token_id of a selected token on the map window,<br>or</li>'
							+'<li>by having a token selected on the map window, not specifying the token_id in the command call, and allowing the API to discover the selected token_id.</li></ol>'
							+'<p>In either case, if more than one token is selected at the time of the call then using either @{selected|token_id} to specify the token in the command call, or allowing the command to find a selected token, is likely (but not guaranteed) to take the first token that was selected.  To avoid ambiguity, it is generally recommended to make command calls with only one token selected on the map window.</p>'
							+'<h3>Who can make AttackMaster API command calls</h3>'
							+'<p>The majority of API command calls can be made by both the GM and all Players.  The typical means for command calls to be made is via Character Sheet Token Action Buttons (standard Roll20 functionality - see Roll20 Help Centre for information) which trigger Ability macros on the Character Sheet which simply make the API command call.  The Character Sheets can be controlled by the GM or Players.  The API knows if it is a GM or a Player that has triggered the call, and reacts accordingly.</p>'
							+'<h3>Weapons that can be used</h3>'
							+'<p>Any weapon in the Weapons tables on the Character Sheet can be used for attacks.  However, the very best approach is to use the functions in this and other RPGMaster APIs to manage weapon choice.  Weapon definitions are held in weapon databases: see section  8 for details.  All standard weapons from the AD&D 2e Players Handbook are included, as well as many magic variations.</p>'
							+'<h3>Allocating weapons to a Character</h3>'
							+'<p>Weapons and ammunition are held in the Items table, which holds data on all items that the Character / NPC / creature has on their person- see section 7 regarding where the Item table is on the Character Sheet and the data that is held in it.  The added weapon must have a listing in the Weapons database.</p>'
							+'<p>The easiest way to enter the correct data into the Items table is to use the <b>MagicMaster API</b>, which supports finding and looting weapons e.g. from a chest or a dead body, or just the DM or Player choosing weapons from a menu.  If a Ranged Weapon that uses ammunition is added, a quantity of the respective ammunition (or multiple types of ammunition) must also be added to the Items table.</p>'
							+'<p>Multiple weapons of many different types can be added, including those with magical properties.  The system will take all the weapon statistics into account using the information in the associated databases.</p>'
							+'<h3>Selecting weapons to attack with</h3>'
							+'<p>Each Character / NPC / creature has a defined number of hands (which can be different from 2), and AttackMaster provides a menu to take any weapon(s) in hand.  Doing so enters all the correct information from the weapons database into the Weapons, Damage and Ranged Weapons tables, and the correct ammunition type(s) held in the Items table into the Ammo table.</p>'
							+'<h3>Making attacks</h3>'
							+'<p>Several different attack approaches are supported by the API.</p>'
							+'<table><tr><th scope="row">Roll20 rolls:</th><td>the system makes an attack dice roll and modifies it using the data on the Character Sheet, then displays the results to the Player.  Hovering the mouse over the displayed values of AC (armour class) hit and the Adjustments will display information explaining the values.  Buttons are displayed to make Damage rolls which can be used if the attack was deemed successful (the target\'s AC was the same or worse than the AC hit).</d></tr>'
							+'<tr><th scope="row">Player rolls:</th><td>the system prompts for the Player to roll a dice and enter the result, and then modifies the roll entered using the data on the Character Sheet and displays the result to the Player.  As above, hovering the mouse over the displayed results will explain how the amounts were calculated.  Buttons to make Damage rolls are also displayed, which will also prompt the user to make a dice roll (showing the dice that should be rolled).</td></tr>'
							+'<tr><th scope="row">Targeted attack:</th><td>DM only option.  The DM can, if they choose, make a targeted attack, which prompts the DM to select the target.  The system then rolls the Attack dice and the Damage dice and displays all possible results, and also displays the AC and HP of the target for quick analysis.</td></tr></table>'
							+'<h3>Ammunition</h3>'
							+'<p>The system handles both Ranged weapons that take ammunition, such as bows and slings, and also "self-ammoed" Ranged weapons like daggers, that can be thrown at a target.  The quantity of ammunition or self-ammoed weapons is managed by the system: as they are used in attacks, the quantity in the Characters Item table decreases.  A menu can be called to recover ammunition, in agreement with the DM - the same menu can be used to add or remove quantities of ammunition for other reasons (such as being purchased).  Some types of ammo always breaks and can\'t be recovered (for example glass arrows) - this is charged ammo.</p>'
							+'<h3>Ranged weapon and ammunition ranges</h3>'
							+'<p>Each type of ammunition has a range with the weapon used to fire it.  These ranges can be different for different types of weapon - thus a longbow can fire an flight arrow further than a short bow, and a sheaf arrow has different ranges than the flight arrow with each.  The ranges that can be achieved by the weapon and ammunition combination are displayed when they are used in an attack, and the Player is asked to select which range to use, which then applies the correct range modifier to the attack roll.</p>'
							+'<h3>Dancing weapons</h3>'
							+'<p>The system can support any weapon becoming a dancing weapon, with qualities that can be the same as or different from a Sword of Dancing.  In the system a dancing weapon does not have to be held in hand in order for it to be available for attacks and, if using the <b>InitiativeMaster API</b>, the weapon is also automatically added to the Turn Order Tracker for its attacks to be performed in battle sequence.  All of this can be achieved automatically if used with the <b>RoundMaster API</b>, with durations of \'warm up\' and \'dancing\' dealt with, as well as magical properties changing as the rounds progress - that function requires some editing of the Effects database to adapt for a particular weapon - see section 8 of the RoundMaster API documentation for details.</p>'
							+'<h3>Armour Class management</h3>'
							+'<p>The system continually checks the Armour Class of each Character / NPC / creature by examining the information on the Character Sheet and the items in the Item table.  Armour and Shields can be placed in the Items table which will be discovered, and the specifications from the Armour database used to calculate the appropriate AC under various conditions and display them to the Player.  The process the system made to achieve the calculated AC will be shown.</p>'
							+'<p>Many magic items have AC qualities, such as Bracers of Defence and Rings of Protection, and if the <b>MagicMaster API</b> is used these are also taken into account - invalid combinations will also be prevented, such as Rings of Protection with magical armour.  If allocated to a Token Circle, the calculated AC is compared to the displayed Token AC and any difference highlighted - this may be due to magical effects currently in place, for instance - the highlight allows the Player to review why this might be.</p>'
							+'<h3>Saves</h3>'
							+'<p>The corollary to attacks is saves.  The system provides a menu to access, review, update and make saving throws and the appropriate modifiers.</p>'
							+'<p>The initial menu presented shows the saving throw table from the Character Sheet (always the one from the Character tab rather than the Monster Tab - monster saving throws should be copied to both).  Each type of save has a button to make the saving throw: the system will perform the roll and display the result with an indication of success or failure.  The menu also shows buttons to add a situational adjustment (as per the AD&D 2e PHB) and to modify the saving throw table.</p>'
							+'<p>The easiest way to set the correct saving throws for each type of save, based on class, level & race, is to use the <b>CommandMaster API</b> Character Sheet setup commands.</p>'
							+'</div>',
						},
	RPGCS_Setup:		{name:'RPGMaster CharSheet Setup',
						 version:1.07,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">RPGMaster CharSheet Setup v1.07</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h2>Character Sheet and Token setup for use with RPGMaster APIs</h2>'
							+'<h3>1. Token configuration</h3>'
							+'<p>The API can work with any Token configuration but requires tokens that are going to participate in API actions to represent a Character Sheet, so that actions relevant to the token and the character it represents can be selected. </p>'
							+'<p>A single Character Sheet can have multiple Tokens representing it, and each of these are able to do individual actions made possible by the data on the Character Sheet jointly represented.  However, if such multi-token Characters / NPCs / creatures are likely to encounter spells that will affect the Character Sheet (such as <i>Haste</i> and <i>Slow</i>) they must be split with each Token representing a separate Character Sheet, or else the one spell will affect all tokens associated with the Character Sheet, whether they were targeted or not!  In fact, <b>it is recommended that tokens and character sheets are 1-to-1 to keep things simple.</b></p>'
							+'<p>The recommended Token Bar assignments for all APIs in the Master Series are:</p>'
							+'<pre>Bar1 (Green Circle):	Armour Class (AC field) - only current value<br>'
							+'Bar2 (Blue Circle):	Base Thac0 (thac0-base field) before adjustments - only current value<br>'
							+'Bar3 (Red Circle):	Hit Points (HP field) - current & max</pre>'
							+'<p>It is recommended to use these assignments, and they are the bar assignments set by the <b>CommandMaster API</b> if its facilities are used to set up the tokens.  All tokens must be set the same way, whatever way you eventually choose.</p>'
							+'<p>These assignments can be changed in each API, by changing the fields object near the top of the API script (<b>note:</b> \'bar#\' and \'value\' or \'max\' are separate entries in an array of 2 elements).  <b><i><u>All APIs must use the same field definitions</u></i></b>:</p>'
							+'<pre>fields.Token_AC:	defines the token field for the AC value (normally [\'bar1\',\'value\'])<br>'
							+'fields.Token_MaxAC:	defines the token field for the AC max (normally [\'bar1\',\'max\'])<br>'
							+'fields.Token_Thac0:	defines the token field for the Thac0 value (normally [\'bar2\',\'value\'])<br>'
							+'fields.Token_MaxThac0: defines the token field for the Thac0 max (normally [\'bar2\',\'max\'])<br>'
							+'fields.Token_HP:	defines the token field for the HP value (normally [\'bar3\',\'value\'])<br>'
							+'fields.Token_MaxHP:	defines the token field for the HP max (normally [\'bar3\',\'max\'])</pre>'
							+'<p>Alter the bar numbers appropriately or, <b><u><i>if you are not wanting one or more of these assigned</i></u></b>: leave the two elements of the array as [\'\',\'\'].  The system will generally work fine with reassignment or no assignment, but not always.  Specifically, some effects in the Effects-DB, which implement spell effects on Character Sheets and Tokens, may not set the right values if no assignment of one or more of HP, AC & Thac0 are made to the Token.</p>'
							+'<br>'
							+'<h3>2. Use with various game system character sheets</h3>'
							+'<p>The API issued is initially set up to work with the AD&D 2E character sheet (as this is what the author mostly plays).  However, it can be set up for any character sheet.  In each API code, right at the top, is an object definition called \'fields\': see section 3 for details.  This can be altered to get the API to work with other character sheets.</p>'
							+'<p>The coding of the API is designed to use the AD&D 2E system of attack calculations, armour class values and saving throw management.  If you use another system (e.g. the D&D 5e system) the API coding will need to change.  This might be a future enhancement.</p>'
							+'<h3>3. Matching the API to a type of Character Sheet</h3>'
							+'<p>The API has an object definition called \'fields\', which contains items of the form </p>'
							+'<pre>Internal_api_name: [sheet_field_name, field_attribute, optional_default_value, optional_set_with_worker_flag]</pre>'
							+'<p>A typical example might be:</p>'
							+'<pre>Fighter_level:[\'level-class1\',\'current\'],<br>'
							+'Or<br>'
							+'MUSpellNo_memable:[\'spell-level-castable\',\'current\',\'\',true],</pre>'
							+'<p>The <i>internal_api_name</i> <b><u>must not be altered!</b></u> Doing so will cause the system not to work.  However, the <i>sheet_field_name</i> and <i>field_attribute</i> can be altered to match any character sheet.</p>'
							+'<p>Table names are slightly different: always have an <i>internal_api_name</i> ending in \'_table\' and their definition specifies the repeating table name and the index of the starting row of the table or -1 for a static field as the 1<sup>st</sup> row.</p>'
							+'<pre>Internal_api_table: [sheet_repeating_table_name,starting_index]</pre>'
							+'<p>An example is:</p>'
							+'<pre>MW_table:[\'repeating_weapons\',0],</pre>'
							+'<p>The <i>internal_api_table</i> <b><u>must not be altered!</b></u> Doing so will cause the system not to work.  However, the <i>sheet_repeating_table_name</i> and <i>starting_index</i> can be altered to match any character sheet.</p>'
							+'<p>Each character sheet must have repeating tables to hold weapons, ammo and magic items, as well as other data.  By default, melee weapons \'in hand\' are held in sections of the repeating_weapons table, melee weapon damage in the repeating_weapons-damage table, ranged weapons in the repeating_weapons2 table, ammo in the repeating_ammo table, and magic items are held in the repeating_potions table.  The table management system provided by the API expands and writes to repeating attributes automatically, and the DM & Players do not need to worry about altering or updating any of these tables on the Character Sheet. If the Character Sheet does not have tables to display any specific table, the APIs will create the table and attach it to the sheet and will be able to use it, but the Players and DM will not see the content except through the API menus and dialogues.</p>'
							+'<h3>4. Character Attributes, Races, Classes and Levels</h3>'
							+'<p>Character Attributes of <i>Strength, Dexterity, Constitution, Intelligence, Wisdom</i> and <i>Charisma</i> are generally not directly important to the RPGMaster Series APIs, but the resulting bonuses and penalties are.  All Attributes and resulting modifiers should be entered into the Character Sheet in the appropriate places (that is in the Character Sheet fields identified in the \'fields\' API object as noted in section 2 above).</p>'
							+'<p>The Character\'s race is also important for calculating saves and ability to use certain items.  The race should be set in the appropriate Character Sheet field.  Currently, the races <i>\'dwarf\', \'elf\', \'gnome\', \'halfelf\', \'halfling\', \'half-orc\'</i> and <i>\'human\'</i> are implemented (not case sensitive, and spaces, hyphens and underscores are ignored).  If not specified, <i>human</i> is assumed.  The race impacts saves, some magic items and armour, and bonuses on some attacks.</p>'
							+'<p>The system supports single-class and multi-class characters.  Classes must be entered in the appropriate fields on the Character Sheet.  Classes and levels affect spell casting ability, ability to do two-weapon attacks with or without penalty, and the ability to backstab and the related modifiers, among other things.  Class and level also determine valid weapons, armour, shields, some magic items and saves.</p>'
							+'<p><b>Important Note:</b> on the Advanced D&D 2e Character Sheet, Fighter classes must be in the first class column, Wizard classes in the second column, Priest classes in the third, Rogues in the fourth, and Psions (or any others) in the fifth.  It is important that these locations are adhered to.</p>'
							+'<p><b>Note:</b> classes of Fighter and Rogue (such as Rangers and Bards) that can use clerical &/or wizard spells will automatically be allowed to cast spells once they reach the appropriate level by AD&D 2e rules, but not before.  They <b><u>do not</b></u> need to have levels set in the corresponding spell-caster columns - the casting ability & level is worked out by the system</p>'
							+'<p>The following Classes are currently supported:</p>'
							+'<table><thead><tr><td>Fighter classes</td><td>Wizard Classes</td><td>Priest Classes</td><td>Rogue Classes</td></tr></thead>'
							+'<tr><td>Warrior</td><td>Wizard</td><td>Priest</td><td>Rogue</td></tr>'
							+'<tr><td>Fighter</td><td>Mage</td><td>Cleric</td><td>Thief</td></tr>'
							+'<tr><td>Ranger</td><td>Abjurer</td><td>Druid</td><td>Bard</td></tr>'
							+'<tr><td>Paladin</td><td>Conjurer</td><td>Healer</td><td>Assassin</td></tr>'
							+'<tr><td>Beastmaster</td><td>Diviner</td><td>Priest of Life</td></tr>'
							+'<tr><td>Barbarian</td><td>Enchanter</td><td>Priest of War	</td></tr>'
							+'<tr><td>Defender (Dwarven)</td><td>Illusionist</td><td>Priest of Light</td></tr>'
							+'<tr><td> </td><td>Invoker</td><td>Priest of Knowledge</td></tr>'
							+'<tr><td> </td><td>Necromancer</td><td>Shaman</td></tr>'
							+'<tr><td> </td><td>Transmuter</td></tr></table>'
							+'<p>The level for each class must be entered in the corresponding field.  Multiple classes and levels can be entered, and will be dealt with accordingly.  Generally, the most beneficial outcome for any combination will be used.  </p>'
							+'<h3>5. Magic Items and Equipment</h3>'
							+'<p>All magic items and standard equipment, including weapons, armour, lanterns etc, are held in the Items table, which by default is set to the potions table, <i>repeating_potions</i>, on the Character Sheet.  As with other fields, this can be changed in the <i>\'fields\'</i> object.  The best way to put items into this table is by using the <b>MagicMaster API</b> commands <b>--edit-mi</b> or the GM-only command <b>--gm-edit-mi</b>.  Alternatively, the <b>AttackMaster --edit-weapons</b> command can be used to load weapons, ammunition and armour into the Items table.  It is generally possible to enter item names and quantities directly into the table and use them within the system, but only items that also exist in the supplied databases will actually work fully with the API (i.e. be recognised by the API as weapons, armour, ammo, etc).  Other items can be in the table but will not otherwise be effective.</p>'
							+'<p>Items can be added to the databases.  See the Database Handouts for more information on the databases.</p>'
							+'<h3>6. Weapons and Ammo</h3>'
							+'<p>For the APIs to work fully the melee weapons, damage, ranged weapons and ammo must be selected using the <b>AttackMaster --weapon</b> command to take the weapon \'in hand\'.  This will display a menu to take weapons and shields from the Items table and take them in hand, ready to use.  This automatically fills all the correct fields for the weapons and ammo to make attacks, including many fields that are not displayed.  Entering weapon data directly into the melee weapon, damage, ranged weapon and ammo tables will generally work, but will be overwritten if the --weapon command is used.  Also, some API functions may not work as well or at all.</p>'
							+'<p>For the <b>InitiativeMaster API</b> to support weapon attack actions weapon name, speed and number of attacks are the most important fields.  For the <b>AttackMaster API</b> to support attack rolls, proficiency calculations, ranged attacks, strength and dexterity bonuses, and other aspects of functionality, fill in as many fields as are visible on the character sheet.  When entering data manually, ensure that the row a melee or ranged weapon is in matches the row damage or ammo is entered in the respective tables (there is no need to do this if using AttackMaster functions to take weapons in-hand, as the relevant lines are otherwise linked).</p>'
							+'<h3>7. Weapon Proficiencies</h3>'
							+'<p>Weapon Proficiencies must be set on the Character Sheet.  This is best done by using the <b>CommandMaster API</b> character sheet management functions, but can be done manually.  Both specific weapons and related weapon groups can be entered in the table, and when a Player changes the character\'s weapons in-hand the table of proficiencies will be consulted to set the correct bonuses and penalties.  Weapon specialisation and mastery (otherwise known as double specialisation) are supported by the CommandMaster functions, but can also be set by ticking/selecting the relevant fields on the Character Sheet weapon proficiencies table.  If a weapon or its related weapon group does not appear in the list, it will be assumed to be not proficient.</p>'
							+'<h3>8. Spell books and memorisable spells</h3>'
							+'<p>The best (and easiest) way to give a Character or NPC spells and powers is to use <b>CommandMaster API</b> to add spells and powers to the Character\'s spellbooks, and <b>MagicMaster API</b> to memorise and cast spells and use powers.  However, for the purposes of just doing initiative and selecting which spell to cast in the next round, the spells and powers can be entered manually onto the character sheet.  Spells are held in the relevant section of the Spells table, which by default is set to the character sheet spells table, <i>repeating_spells</i>.  As with other fields, this can be changed in the <i>\'fields\'</i> object.  Note that on the Advanced D&D 2e character sheet Wizard spells, Priest spells & Powers are all stored in various parts of this one very large table.</p>'
							+'<p>If you are just using the character sheet fields to type into, add spells (or powers) to the relevant "Spells Memorised" section (using the [+Add] buttons to add more as required) <b>a complete row at a time</b> (that is add columns before starting the next row).  Enter the spell names into the "Spell Name" field, and "1" into each of the "current" & "maximum" "Cast Today" fields - the API suite <i>counts down</i> to zero on using a spell, so in order for a spell to appear as available (not greyed out) on the initiative menus, the "current" number left must be > 0.  This makes spells consistent with other tables in the system (e.g. potion dose quantities also count down as they are consumed, etc).</p>'
							+'<p>Then, you need to set the "Spell Slots" values on each level of spell to be correct for the level of caster.  Just enter numbers into each of the "Level", "Misc." and "Wisdom" (for Priests) fields, and/or tick "Specialist" for the Wizard levels as relevant.  This will determine the maximum number of spells memorised each day, that will appear in the spells Initiative Menu.  Do the same for Powers using the "Powers Available" field.  As with other fields on the character sheet, each of these fields can be re-mapped by altering the <i>\'fields\'</i> object in the APIs.</p>'
							+'<p>Spells can only be cast if they have macros defined in the spell databases (see Spell Database Handout).  If the <b>CommandMaster API</b> is loaded, the DM can use the tools provided there to manage Character, NPC & creature spell books and granted powers from the provided spell & power databases.</p>'
							+'<p>The spells a spell caster can memorise (what they have in their spell books, or what their god has granted to them) is held as a list of spell names separated by vertical bars \'|\' in the character sheet attribute defined in <i>fields.Spellbook</i> (on the AD&D2E character sheet \'spellmem\') of each level of spell.  On the AD&D2E sheet, the spell books are the large Spell Book text fields at the bottom of each spell level tab.  The spell names used must be identical (though not case sensitive) to the spell ability macro names in the spell databases (hence the hyphens in the names).   So, for example, a 1<sup>st</sup> level Wizard might have the following in their large Wizard Level 1 spell book field:</p>'
							+'<pre>Armour|Burning-Hands|Charm-Person|Comprehend-Languages|Detect-Magic|Feather-fall|Grease|Identify|Light|Magic-Missile|Read-Magic|Sleep</pre>'
							+'<p>Only these spells will be listed as ones they can memorise at level 1.  When they learn new spells and put them in their spell book, this string can be added to just by typing into it.  When they reach 3<sup>rd</sup> level and can have 2<sup>nd</sup> level spells, the following string might be put in the spell book on the Level 2 Wizard spells tab:</p>'
							+'<pre>Alter-Self|Invisibility|Melfs-Acid-Arrow|Mirror-Image|Ray-of-Enfeeblement</pre>'
							+'<p>Again, as they learn more spells and put them in their spell book, just edit the text to add the spells.</p>'
							+'<p>Once these spell books are defined, the DM or Player can use the <b>MagicMaster -mem-spell</b> command (or an action button and associated ability macro on the Character Sheet) to memorise the correct number of these spells in any combination and store those on the Character Sheet.</p>'
							+'<h3>9. Powers</h3>'
							+'<p>Powers can only be used if they are defined in the Powers database - see Database handouts.  If the <b>CommandMaster API</b> is also loaded, the DM can use the tools provided there to manage Character, NPC & creature spellbooks and granted powers.</p>'
							+'<p>Powers work in an almost identical way to Wizard & Priest spells, except that there is only 1 level of powers.  Powers that the character has are added to the spell book on the Powers tab in the same way as spells, and then memorised using the <b>--mem-spell</b> command (which also works for powers with the right parameters).</p>'
							+'</div>',
						},
	WeaponDB_Handout:	{name:'Weapon & Armour Database Help',
						 version:1.11,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">Weapon & Armour Database Help v1.11</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Weapon and Armour Databases</h1>'
							+'<h6><i>for AttackMaster v'+version+'</i></h6>'
							+'<h2>1. General Database information</h2>'
							+'<p>The RPGMaster APIs use a number of Character Sheets as databases to hold Ability Macros defining weapons, ammo, and items of armour and their specifications.  The API is distributed with many weapon, ammo and armour definitions and it also checks for, creates and updates these Character Sheet databases on start-up.  DMs can add their own weapons, ammo and armour to additional databases, but the databases provided are totally rewritten when new updates are released so the DM must add their own database sheets.  If the <i>provided</i> databases are accidentally deleted, they will be automatically recreated the next time the Campaign is opened. Additional databases should be named as follows:</p>'
							+'<table><tr><td>Weapons:</td><td>additional databases: MI-DB-Weapons-[added name] where [added name] can be replaced with anything you want.</td></tr>'
							+'<tr><td>Ammo:</td><td>additional databases: MI-DB-Ammo-[added name] where [added name] can be replaced with anything you want.</td></tr>'
							+'<tr><td>Armour:</td><td>additional databases: MI-DB-Armour-[added name] where [added name] can be replaced with anything you want.</td></tr></table>'
							+'<p><b>However:</b> the system will ignore any database with a name that includes a version number of the form "v#.#" where # can be any number or group of numbers e.g. MI-DB v2.13 will be ignored.  This is so that the DM can version control their databases, with only the current one (without a version number) being live.</p>'
							+'<p>There can be as many additional databases as you want.  Other Master series APIs come with additional databases, some of which overlap - this does not cause a problem as version control and merging unique macros is managed by the APIs.</p>'
							+'<p><b>Important Note:</b> all Character Sheet databases <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  This must be for all databases, both those provided (set by the API) and any user-defined ones.  Otherwise, Players will not be able to run the macros contained in them.</p>'
							+'<p>Each database has a similar structure, with:</p>'
							+'<ul><li>Ability Macros named as the weapon, ammo or armour specified, and used to describe and provide specifications for using the commands with the AttackMaster API;</li>'
							+'<li>Custom Attributes with the attribute name "ct-ability-macro-name", one per Ability Macro, which defines the speed and type for each item;</li>'
							+'<li>An entry in a list on the character sheet in the spell book of the relevant Character Sheet tab (various spell books for different items - see entry below);</li>'
							+'<li>Optionally, some entries come also with attributes that define Powers and Spells delivered by or stored on the item.</li></ul>'
							+'<p><b>Note:</b> a DM only needs to program the Ability Macro using the formats shown in the next section, and then run the <b>!attk --check-db</b> or <b>!magic --check-db</b> command, which will correctly parse the ability macro and set the rest of the database entries as needed.</p>'
							+'<p>Ability Macros can be whatever the DM wants and can be as simple or as complex as desired. Roll Templates are very useful when defining ability macros.  When a Player or an NPC or Monster views the specifications of a weapon, ammunition or piece of armour, the APIs run the relevant Ability Macro from the databases as if it had been run by the Player from the chat window.  All Roll20 functions for macros are available.</p>'
							+'<h3>1.1 Replacing Provided Weapons</h3>'
							+'<p>If you want to replace any item provided in any of the databases, you can do so simply by creating an Ability Macro in one of your own databases with exactly the same name as the provided item to be replaced.  The API gives preference to Ability Macros in user-defined databases, so yours will be selected in preference to the one provided with the APIs.</p>'
							+'<h2>2. Weapon & Ammunition Databases</h2>'
							+'<p>Weapon databases are all character sheets that have names that start with MI-DB-Weapon (though in fact, weapons can be in any database starting with MI-DB- if desired), and can have anything put at the end, though those with version numbers of the form v#.# as part of the name will be ignored.  Ammunition databases are similar, with the root database MI-DB-Ammo.</p>'
							+'<p>As previously stated, each weapon definition has 3 parts in the database (see Section 1): an Ability Macro with a name that is unique and matches the weapon, an Attribute with the name of the Ability Macro preceded by "ct-", and a listing in the database character sheet of the ability macro name separated by \'|\' along with other weapons. The quickest way to understand these entries is to examine existing entries.  Do go to the root databases and take a look (but be careful not to alter anything unless you know what you\'re doing!)</p>'
							+'<p><b>Note:</b> The DM creating new weapons does not need to worry about anything other than the Ability Macro in the database, as running the <b>AttackMaster</b> or <b>MagicMaster -check-db MI-DB-Weapons</b> command will update all other aspects of the database appropriately for all databases that have a name starting with or including <i>\'MI-DB-Weapons\'</i>, as long as the <i>Specs</i> and <i>Data</i> fields are correctly defined. Use the parameter <i>\'MI-DB-Ammo\'</i> to check and update the ammunition databases.  Running the command <b>-check-db</b> with no parameters will check and update all databases.</p>'
							+'<p>Ability macros can be added to a database just by using the [+Add] button at the top of the Abilities column in the Attributes and Abilities tab of the Database Character Sheet, and then using the edit "pencil" icon on the new entry to open it for editing.  Ability macros are standard Roll20 functionality and not dependent on the API.  Refer to the Roll20 Help Centre for more information.</p>'
							+'<p>Here are some examples:</p>'
							+'<h3>Longsword</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Longsword}} {{subtitle=Sword}}{{Speed=[[5]]}} {{Size=Medium}}{{Weapon=1-handed melee long-blade}}<mark style="color:green">Specs=[Longsword,Melee,1H,Long-blade]</mark>{{To-hit=+0 + Str bonus}}<mark style="color:blue">ToHitData=[w:Longsword, sb:1, +:0, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:5]</mark>{{Attacks=1 per round + level & specialisation, Slashing}}{{Damage=+0, vs SM:1d8, L:1d12, + Str bonus}}<mark style="color:red">DmgData=[w:Longsword, sb:1, +:0, SM:1d8, L:1d12]</mark>{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}</p>'
							+'<p>The ability specification for this Longsword uses a Roll20 Roll Template, in this case defined by the Advanced D&D 2e Character Sheet by Peter B (see the documentation for the Character Sheet on Roll20 for specifications of this Roll Template), but any Roll Template you desire can be used.  The entries in the Roll Template itself can be anything you desire, giving as much or as little information as you want.  However, the important elements for the APIs are those highlighted.  Each of these elements are inserted <i>between</i> the elements of the Roll Template, meaning they will not be seen by the player when the macro is run.  Generally spaces, hyphens and underscores in the data elements are ignored, and case is not significant.  Each element is described below:</p>'
							+'<pre>Specs = [Type, Class, Handedness, Weapon Group]</pre>'
							+'<p>The Specs section describes what weapon type and proficiency groups this weapon belongs to.  These fields must be in this order.  This format is identical for all database items, whether in these databases or others used by the Master series of APIs.</p>'
							+'<table><tr><td><b>Type</b></td><td>is the type of the weapon, often the same as the ability macro name without magical plusses.</td></tr>'
							+'<tr><td><b>Class</b></td><td>is one of Melee, Ranged, or Ammo.</td></tr>'
							+'<tr><td><b>Handedness</b></td><td>is #H, where # is the number of hands needed to wield the weapon.</td></tr>'
							+'<tr><td><b>Weapon Group</b></td><td>is the group of related weapons that the weapon belongs to.</td></tr></table>'
							+'<pre>ToHitData = [w:Longsword, sb:1, +:0, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:5]</pre>'
							+'<p>The ToHitData section specifies the data relating to an attack with the weapon.  These fields can be in any order.</p>'
							+'<table><tr><td><b>w:</b></td><td>&lt;text&gt; the name to display for attacks with this weapon</td></tr>'
							+'<tr><td><b>sb:</b></td><td><0/1> strength bonus flag - specifies if the strength bonus is applicable to the To-Hit roll</td></tr>'
							+'<tr><td><b>+:</b></td><td><[+/-]#> the magical attack bonus/penalty - an integer of any size</td></tr>'
							+'<tr><td><b>n:</b></td><td><#[/#]> the basic number of attacks per round: the API will modify to account for specialisation and level</td></tr>'
							+'<tr><td><b>ch:</b></td><td><1-20> the roll for a Critical Hit, shown in the API with a green border to the attack AC achieved</td></tr>'
							+'<tr><td><b>cm:</b></td><td><1-20> the roll for a Critical Miss, shown in the API with a red border to the attack AC achieved</td></tr>'
							+'<tr><td><b>sz:</b></td><td><T/S/M/L/H/G> the size of the weapon</td></tr>'
							+'<tr><td><b>ty:</b></td><td><SPB> the type of damage done by the weapon - Slashing, Piercing and/or Bludgeoning</td></tr>'
							+'<tr><td><b>sp:</b></td><td><#> the speed of the weapon in segments</td></tr>'
							+'<tr><td><b>r:</b></td><td><[+/-/=]# [/#/#/#] > the range or range modifier of the weapon.  Ranged weapons use PB / S / M / L</td></tr></table>'
							+'<p>The number of attacks per round, <b>n:</b>, can be an integer or a fraction such as 3/2 meaning 3 attacks every 2 rounds.  If using the InitMaster API the Tracker will have the correct number of entries for the Character relating to the number of attacks in the current round.</p>'
							+'<p>The range for the weapon, <b>r:</b>, can be a single integer (representing the range of a melee weapon or simple ranged weapon) or a range modifier, starting with +, -, or =.  The range modifier will amend the range of the ammo for a ranged weapon - ranged weapons vary their range with the ammo used.  The weapon can use that range or modify it.  Ranged weapon range modifiers can be of the form [[+/-]#/][+/-]#/[+/-]#/[+/-]# which will add or subtract a different modifier for each range ([Point Blank] / Short / Medium / Long - Point Blank range is optional)</p>'
							+'<pre>DmgData = [w:Longsword, sb:1, +:0, SM:1d8, L:1d12]</pre>'
							+'<p>The DmgData section specifies the data relating to the damage done by the weapon, and relates to melee weapons only (not ranged weapons).  These fields can be in any order.</p>'
							+'<table><tr><td><b>w:</b></td><td>&lt;text&gt; the name to display for damage calculations for this weapon</td></tr>'
							+'<tr><td><b>sb:</b></td><td><0/1> strength bonus flag - specifies if the strength bonus is applicable to the Damage roll</td></tr>'
							+'<tr><td><b>+:</b></td><td><[+/-]#> the magical damage bonus/penalty - an integer of any size</td></tr>'
							+'<tr><td><b>sm:</b></td><td><dice roll spec> the base dice roll vs. small/medium creatures excluding any magical bonus</td></tr>'
							+'<tr><td><b>l:</b></td><td><dice roll spec> the base dice roll vs. large/huge creatures excluding any magical bonus</td></tr></table>'
							+'<br>'
							+'<h3>Bastardsword+1</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Bastard Sword+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1 or 2-handed melee long blade}}<mark style="color:green">Specs=[Bastard-Sword,Melee,1H,Long-blade],[Bastard-Sword,Melee,2H,Long-blade]</mark>{{To-hit=+1 + Str Bonus}}<mark style="color:blue">ToHitData=[w:Bastard Sword+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:6,rc:uncharged],[w:Bastard Sword 2H+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:8,,rc:uncharged]</mark>{{Attacks=1 per round + specialisation & level, Slashing}}{{Damage=+1, 1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}<mark style="color:red">DmgData=[w:Bastard Sword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Bastard Sword 2H+1,sb:1,+:1,SM:2d4,L:2d8]</mark>{{desc=This is a normal magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}</p>'
							+'<p>The Bastardsword can be used either single handed or two handed with different to-hit and damage outcomes.  This can be represented in the macro as shown here, with multiple specification sections.  When using the <b>AttackMaster API !attk --weapon</b> command to take the Bastardsword in hand, choosing 1 hand (either left or right) will use the 1-handed specifications, and choosing to take it in Both Hands will use the 2-handed specifications.</p>'
							+'<p>All the field definitions are the same as for the Longsword example above, but there are (in this case) two sets of data for each section, the first set for 1-handed, the second set for 2-handed (as defined by the <b>handedness</b> entry in the <b>Specs</b> section data sets.</p>'
							+'<br>'
							+'<h3>Longbow</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=Ranged 2-handed Bow}}<mark style="color:green">Specs=[Longbow,Ranged,2H,Bow]</mark>{{To-hit=+0 + Dex Bonus}}<mark style="color:blue">ToHitData=[w:Longbow,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]</mark>{{Attacks=Piercing, 2 per round}}{{desc=This is a normal longbow. The wood is polished, the string taut, but nothing special.}}</p>'
							+'<p>A ranged weapon like a Longbow uses the same data section definitions as melee weapons except for the following additions and differences.</p>'
							+'<pre>ToHitData=[w:Longbow,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]</pre>'
							+'<p>The To-Hit section has an extra option:</p>'
							+'<table><tr><td><b>db:</b></td><td><0/1> dexterity bonus flag - specifies if the dexterity bonus is applicable to the To-Hit roll.</td></tr>'
							+'<tr><td><b>r:</b></td><td>the range data is not provided because this weapon does not modify the range of its ammo, but could be provided if required.</td></tr></table>'
							+'<p>There is no DmgData section, as damage is defined by the ammo.</p>'
							+'<br>'
							+'<h3>Flight-Arrow+2 (Ammunition Database)</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Flight Arrow+2}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}<mark style="color:green">Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]</mark>{{Ammo=+2,<br>'
							+'<b>**Warbow**</b> vs. SM:1d8, L:1d8,<br>'
							+'<b>**Other Bows**</b> vs. SM:1d6, L:1d6, Piercing}}<mark style="color:orange">AmmoData=[w:Flight Arrow+2, st:Bow, sb:1, +:2, SM:1d6, L:1d6],[w:Warbow Flight Arrow+2, t:warbow, sb:1, +:2, SM:1d8,L:1d8]</mark>{{Range=PB:30, others vary by bow<br>'
							+'<b>**Shortbow:**</b><br>'
							+'S:50, M:100, L150,<br>'
							+'<b>**Longbow:**</b><br>'
							+'S:60, M:120, L:210,<br>'
							+'<b>**Warbow:**</b><br>'
							+'S90, M:160, L:250,<br>'
							+'<b>**Composite Sbow:**</b><br>'
							+'S:50, M:100, L:180,<br>'
							+'<b>**Composite Lbow:**</b><br>'
							+'S:70, M:140, L:210}}<mark style="color:purple">RangeData=[t:longbow, +:2, r:3/6/12/21],[t:shortbow, +:2, r:3/5/10/15],[t:warbow, +:2, r:3/9/16/25],[t:compositelongbow, +:2, r:3/7/14/21],[t:compositeshortbow, +:2, r:3/5/10/18]</mark>{{desc=A magical Flight Arrow of very fine quality}}</p>'
							+'<p>Ammo has a different specification, as the To-Hit data sections are obviously part of the ranged weapon data.  Instead it provides data on which weapons this can be ammo for, and what ranges it has for each.  To determine this, it uses the weapon type and group-type set in the weapon <b>Specs</b> section.</p>'
							+'<pre>AmmoData=[w:Flight Arrow+2, st:Bow, sb:1, +:2, SM:1d6, L:1d6],[w:Warbow Flight Arrow+2, t:warbow, sb:1, +:2, SM:1d8,L:1d8]</pre>'
							+'<p>The AmmoData section has mostly the same as the DmgData sections (order of fields is immaterial and spaces, hyphens and underscores ignored in type and supertype names), but repeated data sets relate to the data for different types of weapon, and in addition:</p>'
							+'<table><tr><td><b>t:</b></td><td><weapon-type> the specific type of ranged weapon this data matches - takes priority over <b>st:</b>.  An example is <i>Longbow<i></td></tr>'
							+'<tr><td><b>st:</b></td><td><group-type> the group-type of ranged weapon this data can be used for.  An example is <i>Bow</i>, which means all bows</td></tr></table>'
							+'<pre>RangeData=[t:longbow, +:2, r:3/6/12/21],[t:shortbow, +:2, r:3/5/10/15],[t:warbow, +:2, r:3/9/16/25], [t:compositelongbow, +:2, r:3/7/14/21],[t:compositeshortbow, +:2, r:3/5/10/18],[st:bow, +:2, r:3/5/10/15]</pre>'
							+'<p>The RangeData section has one or more data sets relating to weapons that result in different ranges. The range specifications can have 3 or 4 parts: if 4, the first is for Point Blank range which is only relevant for specialists; the remaining 3 are always short, medium & long ranges.</p>'
							+'<h3>Self-ammoed weapons e.g. Warhammer</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Warhammer}}{{subtitle=Hammer/Club}} {{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown club}}<mark style="color:green">Specs=[Warhammer,Melee,1H,Clubs],[Warhammer,Ranged,1H,Clubs]</mark>{{To-hit=+0 + Str & Dex bonus}}<mark style="color:blue">ToHitData=[w:Warhammer, sb:1, +:0, n:1, ch:20, cm:1, sz:M, ty:B, r:5, sp:4],[ w:Warhammer, sb:1, db:1,  +:0, n:1, ch:20, cm:1, sz:M, ty:B, sp:4]</mark>{{Attacks=1 per round + level & specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d4+1, L:1d4, + Str bonus}}<mark style="color:red">DmgData=[ w:Warhammer, sb:1, +:0, SM:1+1d4, L:1d4][]</mark>{{Ammo=+0, vs SM:1d4+1, L:1d4, + Str bonus}}<mark style="color:orange">AmmoData=[w:Warhammer,t:Warhammer,st:Throwing-club,sb:1,+:0,SM:1+1d4,L:1d4]</mark>{{Range=S:10, M:20, L:30}}<mark style="color:purple">RangeData=[t:Warhammer,+:0,r:1/2/3]</mark>{{desc=This is a normal warhammer. The blade is sharp and keen, but nothing special.}}</p>'
							+'<p>A melee weapon that can also be thrown, and is its own ammunition, is termed a "self-ammoed" weapon.  Its definition combines the data elements of both melee weapons, ranged weapons and ammunition.</p>'
							+'<pre>Specs=[Warhammer,Melee,1H,Clubs],[Warhammer,Ranged,1H,Clubs]</pre>'
							+'<p>Has two data sets, one as a melee weapon and one as a ranged weapon.</p>'
							+'<pre>ToHitData=[w:Warhammer, sb:1, +:0, n:1, ch:20, cm:1, sz:M, ty:B, r:5, sp:4],[ w:Warhammer, sb:1, db:1,  +:0, n:1, ch:20, cm:1, sz:M, ty:B, sp:4]</pre>'
							+'<p>Also has two sets of data, each of which relates to the corresponding Specs set.</p>'
							+'<pre>DmgData=[ w:Warhammer, sb:1, +:0, SM:1+1d4, L:1d4],[]</pre>'
							+'<p>Does have two data sets, but the one corresponding to the ranged data is empty, as this data is in the Ammo data set.</p>'
							+'<pre>AmmoData=[w:Warhammer,t:Warhammer,st:Throwing-club,sb:1,+:0,SM:1+1d4,L:1d4]</pre>'
							+'<p>There is only 1 Ammo data set, as it only relates to the one weapon, itself.</p>'
							+'<pre>RangeData=[t:Warhammer,+:0,r:1/2/3]</pre>'
							+'<p>And only 1 Range data set, as it only relates to itself.</p>'
							+'<br>'
							+'<h3>Artifact sword</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Jim the Sun Blade<br>'
							+'Intelligent, Neutral}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}<mark style="color:magenta">WeapData=[w:Jim the Sun Blade,ns:5][cl:PW,w:Jims-Locate-Object,sp:100,lv:6,pd:1],[cl:PW,w:Jims-Find-Traps,sp:5,lv:6,pd:2],[cl:PW,w:Jims-Levitation,sp:2,lv:1,pd:3],[cl:PW,w:Jims-Sunlight,sp:3,lv:6,pd:1],[cl:PW,w:Jims-Fear,sp:4,lv:6,pd:2]</mark>{{Size=Special (feels like a Shortsword)}}{{Weapon=1 or 2 handed melee Long or Short blade}}Specs=[Bastard-sword|Short-sword,Melee,1H,Long-blade|Short-blade],[Bastard-sword|Short-sword,Melee,1H,Long-blade|Short-blade],[Bastard-sword,Melee,2H,Long-blade],[Bastard-sword,Melee,2H,Long-blade]{{To-hit=+2, +4 vs Evil + Str Bonus}}ToHitData=[w:Jim +2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim vs Evil+4,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim 2H +2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim 2H vs Evil+4,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3]{{Attacks=1 per round}}{{Damage=+2, +4 vs Evil, + 1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Jim+2,sb:1,+:2,SM:1d8,L:1d12],[w:Jim vs Evil+4,sb:1,+:4,SM:2d4,L:2d8],[w:Jim 2H +2,sb:1,+:2,SM:1d8,L:1d12],[w:Jim 2H vs Evil+4,sb:1,+:4,SM:2d4,L:2d8]{{desc=An intelligent weapon: A Sun Blade called Jim (DMs Guide Page 185). It is Neutral. It needs its owner to be proficient with either a Short or Bastard Sword or promise to get such proficiency as soon as possible. It cannot be used by someone who is not proficient. It requires its owner to be Neutral on at least one of its axis, and may not be Evil. NG LN CN and of cause true N are all ok. Abilities:<br>'
							+'<b>**1:**</b> It is +2 normally, or +4 against evil creatures, and does Bastard sword damage.<br>'
							+'<b>**2:**</b> It feels and react as if it is a short sword and uses short sword striking time.<br>'
							+'<b>**3:**</b> <span style="color:red">[Locate Object](!magic --mi-power @{selected|token_id}|Jims-Locate-Object|Jim-the-Sun-Blade|6)</span> at [[6]]th Level in 120\' radius (1x day).<br>'
							+'<b>**4:**</b> <span style="color:red">[Detect traps](!magic --mi-power @{selected|token_id}|Jims-Find-Traps|Jim-the-Sun-Blade|6)</span> of large size in 10\' radius (2xday).<br>'
							+'<b>**5:**</b> <span style="color:red">[Levitation](!magic --mi-power @{selected|token_id}|Jims-Levitation|Jim-the-Sun-Blade|1)</span> 3x a day for 1 turn (cast at 1st Level).<br>'
							+'<b>**6:**</b> <span style="color:red">[Sunlight](!magic --mi-power @{selected|token_id}|Jims-Sunlight|Jim-the-Sun-Blade|6)</span> Once a day, upon command, the blade can be swung vigorously above the head, and it will shed a bright yellow radiance that is like full daylight. The radiance begins shining in a 10-foot radius around the sword-wielder, spreading outward at 5 feet per round for 10 rounds thereafter, creating a globe of light with a 60-foot radius. When the swinging stops, the radiance fades to a dim glow that persists for another turn before disappearing entirely.<br>'
							+'<b>**7:**</b> It has a special purpose namely Defeat Evil. <br>'
							+'<b>**8:**</b> On hitting an Evil being it causes [Fear](!magic --mi-power @{selected|token_id}|Jims-Fear|Jim-the-Sun-Blade|6) for 1d4 rounds (unless saving throw is made). It can do this **twice a day** when the wielder desires.<br>'
							+'<b>**9:**</b> It speaks Common and its name is Jim. It will talk to the party.<br>'
							+'<b>**10:**</b> It has an ego of 16 and is from Yorkshire. <br>'
							+'<b>**11:**</b> It will insist on having a Neutral wielder. (See Intelligent weapons on page 187 in DMG).<br>'
							+'<b>**12:**</b> If picked by a player, it will be keen to become the players main weapon.<br>'
							+'<b>**13:**</b> If picked up by a player who is not Neutral it will do them 16 points of damage}}</p>'
							+'<p>An artefact such as an intelligent sword with powers introduces data sets that specify the powers that the artefact has and how often they can be used.  These match the API Buttons with calls to the <b>MagicMaster API</b> to enact the powers.</p>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">WeapData=[w:Jim the Sun Blade,ns:5][cl:PW,w:Jims-Locate-Object,sp:100,lv:6,pd:1],[cl:PW,w:Jims-Find-Traps,sp:5,lv:6,pd:2],[cl:PW,w:Jims-Levitation,sp:2,lv:1,pd:3],[cl:PW,w:Jims-Sunlight,sp:3,lv:6,pd:1],[cl:PW,w:Jims-Fear,sp:4,lv:6,pd:2]</p>'
							+'<p>The WeapData data sets can be used to define the powers that an artefact has (or stored spells - see MagicMaster API for more information on spell storing)</p>'
							+'<p>1<sup>st</sup> data set:</p>'
							+'<table><tr><td><b>w:</b></td><td>&lt;text&gt;  The name of the weapon (not currently used)</td></tr>'
							+'<tr><td><b>ns:</b></td><td><#>  The number of spells or powers for which the specifications follow</td></tr></table>'
							+'<p>Subsequent data sets:</p>'
							+'<table><tr><td><b>cl:</b></td><td>< MU / PR / PW >  The type of data: MU=Wizard, PR=Priest, PW=Power</td></tr>'
							+'<tr><td><b>w:</b></td><td>&lt;text&gt;  Name of the spell or power: must be the same as the corresponding database definition</td></tr>'
							+'<tr><td><b>sp:</b></td><td><#>  Speed of the spell/power casting in segments (1/10ths of a round)</td></tr>'
							+'<tr><td><b>lv:</b></td><td><#>  The level at which the artefact will cast the spell/power (if omitted will use character\'s level)</td></tr>'
							+'<tr><td><b>pd:</b></td><td><-1 / #>  Number per day, or -1 for "use at will"  </td></tr></table>'
							+'<br>'
							+'<h2>3. Armour Databases</h2>'
							+'<p>Armour databases are all character sheets that have names that start with MI-DB-Armour (as with weapons, this can be in any database starting with MI-DB- if desired), and can have anything put at the end, though those with version numbers of the form v#.# as part of the name will be ignored.</p>'
							+'<p>As previously stated and as per the weapon and ammunition databases, each armour definition has 3 parts in the database (see Section 1): the Ability Macro, the ct- attribute, and the listing (and occasionally attributes for powers and spells).  The quickest way to understand these entries is to examine existing entries.  Do go to the root databases and take a look (but be careful not to alter anything unless you know what you\'re doing!)</p>'
							+'<p><b>Note:</b>The DM creating new armour entries does not need to worry about anything other than the Ability Macro in the database, as running the <b>!attk --check-db MI-DB-Armour</b> or <b>!magic --check-db MI-DB-Armour</b> command will update all other aspects of the database appropriately for all databases that have a name starting with or including \'MI-DB-Armour\', as long as the Specs and Data fields are correctly defined.  Running the command <b>-check-db</b> with no parameters will check and update all databases.</p>'
							+'<p>Here are some examples:</p>'
							+'<h3>Chain Mail</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Chain Mail}}{{subtitle=Armour}}{{Armour=Chain Mail}}<mark style="color:green">Specs=[Chain Mail,Armour,0H,Mail]</mark>{{AC=[[5]] vs all attacks}}<mark style="color:blue">ACData=[a:Chain Mail,st:Mail,+:0,ac:5,sz:L,wt:40]</mark>{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}</p>'
							+'<p>The ability specification for this suit of Chain Mail uses a Roll20 Roll Template, in this case defined by the Advanced D&D 2e Character Sheet by Peter B.  The entries in the Roll Template itself can be anything you desire, giving as much or as little information as you want.  However, the important elements for the AttackMaster API are those highlighted.  Each of these elements are inserted between the elements of the Roll Template, meaning they will not be seen by the player when the macro is run.  Generally spaces, hyphens and underscores in the data elements are ignored, and case is not significant.  Each element is described below:</p>'
							+'<pre>Specs=[Chain Mail,Armour,0H,Mail]</pre>'
							+'<p>The Specs section of the specification has exactly the same format as for weapons and ammunition (and indeed all database items).  See section 9 for the definition of the fields.</p>'
							+'<p><b>Note:</b>The armour Type (the 1<sup>st</sup> parameter) and Group-Type (the 4<sup>th</sup> parameter) are used to determine if the character is of a class that can use the armour.  Currently implemented types are listed in Section 9.</p>'
							+'<p><b>Note:</b> Armour that fits on the body generally does not take any hands to hold, and so the third field, <i>Handedness</i>, is set to \'0H\'.</p>'
							+'<pre>ACData=[a:Chain Mail,st:Mail,+:0,ac:5,sz:L,wt:40]</pre>'
							+'<p>The Armour Class Data (ACData) section holds data specific to the armour.  As with other data sections, fields can be in any order, and spaces, hyphens, underscores and case are ignored.</p>'
							+'<table><tr><td><b>a:</b></td><td>< text > the name of the armour to be displayed.  Often the same as the Ability.</td></tr>'
							+'<tr><td><b>st:</b></td><td>< group-type > the supertype of the armour, often the same as the fourth parameter of the Specs section.</td></tr>'
							+'<tr><td><b>+:</b></td><td><[+/-]#> the magical bonus or penalty of the armour (defaults to 0 if not supplied).</td></tr>'
							+'<tr><td><b>ac:</b></td><td><[-]#> the base armour class (excluding magical bonuses) for this type of armour.</td></tr>'
							+'<tr><td><b>sz:</b></td><td><[T/S/M/L/H]> The size of the item (not necessarily indicating its fit).</td></tr>'
							+'<tr><td><b>wt:</b></td><td><#> The weight of the item in lbs (could be considered kg - or any measure - if everything is the same).</td></tr></table>'
							+'<p>Other possible fields are:</p>'
							+'<table><tr><td><b>t:</b></td><td>< armour-type > The specific armour type, often the same as the first parameter of the Specs section.</td></tr>'
							+'<tr><td><b>db:</b></td><td><[-/+]#> The dexterity bonus or penalty that wearing the armour bestowes.</td></tr>'
							+'<tr><td><b>+m:</b></td><td><[-/+]#> The adjustment that the armour gives vs. missiles and ammunition of ranged weapons.</td></tr>'
							+'<tr><td><b>+s:</b></td><td><[-/+]#> The magical adjustment specifically against slashing damage.</td></tr>'
							+'<tr><td><b>+p:</b></td><td><[-/+]#> The magical adjustment specifically against piercing damage.</td></tr>'
							+'<tr><td><b>+b:</b></td><td><[-/+]#> The magical adjustment specifically against bludgeoning damage.</td></tr>'
							+'<tr><td><b>rc:</b></td><td><recharging/curse type> Armour can be "cursed", but generally does not have charges. Default is "uncharged".  See MagicMaster API documentation for more information on charges and curses.</td></tr></table>'
							+'<br>'
							+'<h3>Shield+2</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Shield+2}}{{subtitle=Shield}}{{Shield=1-handed +2 Medium Shield made of wood & metal}}<mark style="color:green">Specs=[Medium Shield,Shield,1H,Shields]</mark>{{AC=+[[2]] against all attacks from the front}}<mark style="color:blue">ACData=[a:Medium Shield+2, st:Shield, +:2,sz:M, wt:10]</mark> {{Speed=[[0]]}} {{Size=M}} {{Immunity=None}} {{Saves=No effect}} {{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.<br>'
							+'*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}</p>'
							+'<p>As can be seen here, the specification for a Shield is almost identical in structure to that of any other armour, the major difference being in the Specs section type field.</p>'
							+'<p><b>Note:</b> The <b>ac:</b> field in the data section for a shield is always assumed to be \'+1\', meaning a shield adds 1 to the base AC before magical adjustments are taken into account.  However, it can be specified as a different value, if desired.</p>'
							+'<p><b>Note:</b> All shields except a <i>Buckler</i> must be taken in hand using the <b>!attk --weapon</b> command before the Armour Class system of the AttackMaster API adds it to the AC for the character.  A <i>buckler</i> is a special type of very small shield that is strapped to the arm and can counter only 1 blow per melee round, but allows both (all) hands to be free.  In fact, any shield can have this functionality if desired, by setting the handedness field of the Specs section to be \'0H\', meaning it take no hands to hold it.</p>'
							+'<br>'
							+'<h3>Armour-of-Vulnerability+-3</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Field Plate Armour of Vulnerability+/-3}}{{subtitle=Cursed Armour}}{{Armour=+/-3 selectively magical Field Plate}}<mark style="color:green">Specs=[Armour-of-Vulnerability|Armour-of-Resistance,Armour,0H,Plate]</mark>{{AC=[[2]][[0-3]] better AC against Slashing damage'
							+'+[[3]] worse AC against any other type}}<mark style="color:blue">ACData=[a:Armour-of-Vulnerability+-3,st:Mail,+S:3,+P:-3,+B:-3,ac:2,sz:L,wt:60,sp:0,rc:cursed]</mark>{{Speed=0}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=***Curse.*** This armor is cursed, a fact that is revealed only when an identify spell is cast on the armor or you attune to it. Attuning to the armor curses you until you are targeted by the remove curse spell or similar magic; removing the armor fails to end the curse. While cursed, you have vulnerability to two of the three damage types associated with the armor (not the one to which it grants resistance).}}{{desc1=This armour provides resistance to Slashing damage only, but vulnerability to Piercing and Bludgeoning damage.<br>'
							+'This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.<br>'
							+'For each +1 bonus to armor, regardless of the type of armor, the wearer\'s Armor Class moves downward (toward AC 2 . . . to 1 . . . to 0, -1, -2, and so on). Note, however, that Armor Class can never be improved beyond -10}}</p>'
							+'<p>This is a slightly more complex type of armour.  It is a cursed item, and generally appears initially as <i>Armour-of-Resistance+3</i>, hence the <b>Specs</b> first parameter of armour type having two possible values, separated by \'|\'.</p>'
							+'<p>The use of the damage type specific magical adjustment fields can be seen in the data section, along with the use of the <b>rc:</b> field tag with the value <i>\'cursed\'</i>.  See section 9 for a complete list of <b>rc:</b> field values.</p>'
							+'<br>'
							+'<h2>4. Specs & Data field values</h2>'
							+'<p>Below are lists of the current possible values for the item database Ability macro sections.</p>'
							+'<h3>4.1 Specs sections</h3>'
							+'<pre>Specs=[Type, Item-Class, Handedness, Group-Type]</pre>'
							+'<h4>4.1(a) Weapon Types</h4>'
							+'<p>There is an infinite list of weapon types: generally the type is the weapon name without any reference to magical plusses, so the Type of a Longsword+2 is Longsword.  This Type is used to check for Proficiency.</p>'
							+'<h4>4.1(b) Weapon Item-Classes</h4>'
							+'<table><tr><td>Melee</td><td>Melee weapon which strikes while in hand</td></tr>'
							+'<tr><td>Ranged</td><td>Weapon that causes damage when thrown or with ammunition</td></tr>'
							+'<tr><td>Ammo</td><td>Ammunition for a ranged weapon of a specific Type or Group-Type</td></tr></table>'
							+'<h4>4.1(c) Weapon Handedness</h4>'
							+'<table><tr><td>	0H</td><td>A weapon that does not take a hand (e.g. spike on helm)</td></tr>'
							+'<tr><td>	1H</td><td>A weapon that is 1-handed, such as a short sword</td></tr>'
							+'<tr><td>	2H</td><td>A weapon that takes 2 hands to wield, such as a longbow</td></tr>'
							+'<tr><td>	3H</td><td>A weapon that takes 3 hands...</td></tr>'
							+'<tr><td>	4H</td><td>Etc (e.g. a siege weapon that needs 2 people to operate it)</td></tr>'
							+'<tr><td>	...</td><td>...</td></tr></table>'
							+'<br>'
							+'<h4>4.1(d) Weapon Group-Types</h4>'
							+'<p>Weapon Group-Types determine related weapons for weapon proficiency, and whether it can be used by a Character of a specific class.  The APIs use the definitions in the AD&D2e Fighter\'s Handbook section on \'Tight Groups\', extended to cover certain additional weapons and weapon types.  Those implemented so far for the Weapon databases are:</p>'
							+'<table><tr><td>Arrow</td><td>Club</td><td>Great-Blade</td><td>Long-Blade</td><td>Short-Blade</td><td>Whip</td></tr>'
							+'<tr><td>Axe</td><td>Crossbow</td><td>Hook</td><td>Medium-Blade</td><td>Sling</td></tr>'
							+'<tr><td>Blowgun</td><td>Dart</td><td>Horeshoes</td><td>Pick</td><td>Spear</td></tr>'
							+'<tr><td>Bow</td><td>Fencing-Blade</td><td>Innate</td><td>Polearm</td><td>Staff</td></tr>'
							+'<tr><td>Bullet</td><td>Flail</td><td>Lance</td><td>Quarrel</td><td>Throwing-Blade</td></tr></table>'
							+'<p>Types and Group-Types that can be used by various Character Classes are:</p>'
							+'<table><tr><td>Warrior</td><td>Any</td></tr>'
							+'<tr><td>Fighter</td><td>Any</td></tr>'
							+'<tr><td>Ranger</td><td>Any</td></tr>'
							+'<tr><td>Paladin</td><td>Any</td></tr>'
							+'<tr><td>Beastmaster</td><td>Any</td></tr>'
							+'<tr><td>Barbarian</td><td>Any</td></tr>'
							+'<tr><td>Defender</td><td>"axe", "club", "flail", "long-blade", "fencing-blade", "medium-blade", "short-blade", "polearm"</td></tr>'
							+'<tr><td>Wizard</td><td>(all types)	"dagger", "staff", "dart", "knife", "sling"</td></tr>'
							+'<tr><td>Priest / Cleric</td><td>"club", "mace", "hammer", "staff"</td></tr>'
							+'<tr><td>Druid</td><td>"club", "sickle", "dart", "spear", "dagger", "scimitar", "sling", "staff"</td></tr>'
							+'<tr><td>Healer</td><td>"club", "quarterstaff", "mancatcher", "sling"</td></tr>'
							+'<tr><td>Priest of Life</td><td>"club", "quarterstaff", "mancatcher", "sling"</td></tr>'
							+'<tr><td>Priest of War</td><td>Any</td></tr>'
							+'<tr><td>Priest of Light</td><td>"dart", "javelin", "spear"</td></tr>'
							+'<tr><td>Priest of Knowledge</td><td>"sling", "quarterstaff"</td></tr>'
							+'<tr><td>Shaman</td><td>"long-blade", "medium-blade", "short--blade", "blowgun", "club", "staff", "shortbow", "horsebow", "hand-xbow"</td></tr>'
							+'<tr><td>Rogue / Thief</td><td>"club", "short-blade", "dart", "hand-xbow", "lasso", "shortbow", "sling", "broadsword", "longsword", "staff"</td></tr>'
							+'<tr><td>Bard</td><td>Any</td></tr>'
							+'<tr><td>Assassin</td><td>Any</td></tr></table>'
							+'<br>'
							+'<h4>4.1(e) Armour Types</h4>'
							+'<p>There is an infinite list of armour types: generally the type is the armour name without any reference to magical plusses, so the Type of Plate-Mail+2 is Plate-Mail.  This Type is used to check for Proficiency.</p>'
							+'<br>'
							+'<h4>4.1(f) Armour Item-Classes</h4>'
							+'<p>	Armour		Any type of armour that does not need to be held to work'
							+'	Shield		A barrier that is held in hand(s) and defends against one or more attacks from the front</p>'
							+'<br>'
							+'<h4>4.1(g) Armour Handedness</h4>'
							+'<p>	0H		Armour and Shields that are not held in the hand (e.g. a Buckler or a Helm)<br>'
							+'	1H		Generally a type of Shield that must be held in a hand<br>'
							+'	2H		Armour and Shields that use two hands, and/or prevent use of those hands for other things<br>'
							+'	3H		Generally siege engines that shield against attacks... (not yet implemented)<br>'
							+'	...		etc.</p>'
							+'<br>'
							+'<h4>4.1(h) Armour Group-Types</h4>'
							+'<p>Armour Types and Group Types determine whether the armour can be used by various Character Classes.  Here are the currently implemented restrictions:</p>'
							+'<table><tr><td>Warrior	Any</td></tr>'
							+'<tr><td>Fighter</td><td>Any</td></tr>'
							+'<tr><td>Ranger</td><td>Any</td></tr>'
							+'<tr><td>Paladin</td><td>Any</td></tr>'
							+'<tr><td>Beastmaster</td><td>Any</td></tr>'
							+'<tr><td>Barbarian</td><td>"padded", "leather", "hide", "brigandine", "ring-mail", "scale-mail", "chain-mail", "shield", "ring",  "magic-item","cloak"</td></tr>'
							+'<tr><td>Defender</td><td>Any</td></tr>'
							+'<tr><td>Wizard (all types)</td><td>"magic-item", "ring", "cloak"</td></tr>'
							+'<tr><td>Priest / Cleric</td><td>Any</td></tr>'
							+'<tr><td>Druid</td><td>"leather", "padded", "hide", "wooden-shield", "magic-item", "ring", "cloak"</td></tr>'
							+'<tr><td>Healer</td><td>Any</td></tr>'
							+'<tr><td>Priest of Life</td><td>Any</td></tr>'
							+'<tr><td>Priest of War</td><td>Any</td></tr>'
							+'<tr><td>Priest of Light</td><td>"studded-leather", "ring-mail", "chain-mail", "shield", "ring", "magic-item", "cloak"</td></tr>'
							+'<tr><td>Priest of Knowledge</td><td>"magic-item", "ring", "cloak"</td></tr>'
							+'<tr><td>Shaman</td><td>"padded", "leather", "hide", "brigandine", "ring-mail", "scale-mail", "chain-mail", "splint-mail", "banded-mail", "shield", "ring", "magic-item", "cloak"</td></tr>'
							+'<tr><td>Rogue / Thief</td><td>Any</td></tr>'
							+'<tr><td>Bard</td><td>"padded", "leather", "hide", "brigandine", "ring-mail", "scale-mail", "chain-mail", "ring", "magic-item", "cloak"</td></tr>'
							+'<tr><td>Assassin</td><td>Any</td></tr></table>'
							+'<br>'
							+'<h3>4.2 Data Sections</h3>'
							+'<table>'
							+'	<thead>'
							+'		<tr>'
							+'			<th scope="col" rowspan="2">Field</th>'
							+'			<th scope="col" rowspan="2">Format</th>'
							+'			<th scope="col" rowspan="2">Default Value</th>'
							+'			<th scope="col" rowspan="2">Description</th>'
							+'			<th scope="col" colspan="6">Can be used in</th>'
							+'		</tr>'
							+'		<tr>'
							+'			<th scope="col">ToHit<br>Data</th>'
							+'			<th scope="col">Dmg<br>Data</th>'
							+'			<th scope="col">Ammo<br>Data</th>'
							+'			<th scope="col">Range<br>Data</th>'
							+'			<th scope="col">Weapon<br>Data</th>'
							+'			<th scope="col">AC<br>Data</th>'
							+'		</tr>'
							+'	</thead>'
							+'	<tr><td>w:</td><td>< text ></td><td>\'-\'</td><td>Name to be displayed</td>				<td>X</td><td>X</td><td>X</td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>w:</td><td>< text ></td><td>\'-\'</td><td>Name of spell or power</td>				<td>	</td><td> </td><td> </td><td> </td><td>X</td><td> </td></tr>'
							+'	<tr><td>a:</td><td>< text ></td><td>\'-\'</td><td>Name to be displayed</td>				<td> </td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>t:</td><td>< text ></td><td>\'\'</td><td>Type</td>								<td> </td><td> </td><td>X</td><td>X</td><td> </td><td>X</td></tr>'
							+'	<tr><td>st:</td><td>< text ></td><td>\'\'</td><td>Group Type (aka Tight-Group)</td>		<td> </td><td> </td><td>X</td><td>X</td><td> </td><td>X</td></tr>'
							+'	<tr><td>sb:</td><td>0 / 1</td><td>0</td><td>Strength Bonus</td>						<td>X</td><td>X</td><td>X</td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>db:</td><td>0 / 1</td><td>1</td><td>Dexterity Bonus</td>						<td>X</td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>+:</td><td>[ + / - ] #</td><td>0</td><td>Magical adjustment</td>				<td>X</td><td>X</td><td>X</td><td>X</td><td> </td><td>X</td></tr>'
							+'	<tr><td>+m:</td><td>[ + / - ] #</td><td>0</td><td>Missile attack adjustment</td>		<td> </td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>+s:</td><td>[ + / - ] #</td><td>0</td><td>Slashing damage adjustment</td>		<td> </td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>+p:</td><td>[ + / - ] #</td><td>0</td><td>Piercing damage adjustment	</td>	<td> </td><td> </td><td> </td><td> </td><td> </td><td>X </td></tr>'
							+'	<tr><td>+b:</td><td>[ + / - ] #</td><td>0</td><td>Bludgeoning damage adjustment</td>	<td> </td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>n:</td><td># [ / # ]</td><td>1</td><td>Attacks per round</td>					<td>X</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>dp:</td><td>#</td><td>0</td><td>Dancing proficiency adjustment</td>			<td>X</td><td> </td><td> </td><td> </td><td> </td><td> 	</td></tr>'
							+'	<tr><td>ch:</td><td>1 - 20</td><td>20</td><td>Critical Hit roll value</td>				<td>X</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>cm:</td><td>1 - 20</td><td>1</td><td>Critical Miss roll value</td>			<td>X</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>sz:</td><td>[ t / s / m / l / h ]</td><td>\'\'</td><td>Size of item</td>			<td>X</td><td> </td><td>X</td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>r:</td><td>[# /] # / # / #</td><td>\'\'</td><td>Range</td>						<td>X</td><td> </td><td> </td><td>X</td><td> </td><td> </td></tr>'
							+'	<tr><td>r:</td><td>[+/-]# [ / [+/-]# / [+/-]# / [+/-]# ]</td><td>0</td><td>Range Modifier</td><td>X</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>ty:</td><td>SPB any combination</td><td>\'\'</td><td>Type of damage</td>			<td>X</td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>sp:</td><td>[-]#</td><td>0</td><td>Speed in segments (1/10 round)</td>		<td>X</td><td> </td><td> </td><td> </td><td>X</td><td> </td></tr>'
							+'	<tr><td>sm:</td><td>dice roll format</td><td>0</td><td>Damage roll for Small & Medium opponents</td><td> </td><td>X</td><td>X</td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>l:</td><td>dice roll format</td><td>0</td><td>Damage roll for Large & Huge opponents</td><td> </td><td>X</td><td>X</td><td> </td><td> </td><td> </td></tr>'
							+'	<tr><td>ac:</td><td>[-]#</td><td>\'\'</td><td>Armour class</td>							<td> </td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>wt:</td><td>#</td><td>1</td><td>Weight of item in lbs</td>					<td>X</td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'	<tr><td>ns:</td><td>#</td><td>0</td><td>Number of spells & powers defined for item</td><td> </td><td> </td><td> </td><td> </td><td>X</td><td>X</td></tr>'
							+'	<tr><td>cl:</td><td>MU / PR / PW</td><td>\'\'</td><td>Type of spell or power</td>		<td> </td><td> </td><td> </td><td> </td><td>X</td><td> </td></tr>'
							+'	<tr><td>lv:</td><td>#</td><td>1</td><td>Level at which spell/power is cast</td>		<td> </td><td> </td><td> </td><td> </td><td>X</td><td> </td></tr>'
							+'	<tr><td>pd:</td><td>-1 / #</td><td>1</td><td>Number per day (power only)</td>			<td> </td><td> </td><td> </td><td> </td><td>X</td><td> 	</td></tr>'
							+'	<tr><td>rc:</td><td>Charged /<br>Uncharged /<br> Rechargeable /<br>Recharging /<br>Self-charging /<br>Cursed /<br>Charged-Cursed /<br>Recharging-Cursed /<br>Self-charging-Cursed</td><td>Uncharged</td><td>Initial charged and Cursed status of item when found</td><td>X</td><td> </td><td> </td><td> </td><td> </td><td>X</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>4.3 Character Sheet data fields</h3>'
							+'<p>As stated in section 7, the Character Sheet field mapping to the API script can be altered using the definition of the fields object.  You can find the complete mapping for all APIs in the RPGMaster series, with an explanation of each, in a separate document.</p>'
							+'</div>',
						},
	ClassDatabase_Help:	{name:'Class Database Help',
						 version:1.04,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">Character Class Database Help v1.04</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Character Class Database</h1>'
							+'<h6><i>for RPGMaster APIs</i></h6>'
							+'<h2>1. General Database information</h2>'
							+'<p>The RPGMaster APIs use a number of Character Sheets as databases to hold Ability Macros defining character classes, spells, powers and magic items and their effects.  The API is distributed with many class, spell, power & magic item definitions, and checks for, creates and updates these Character Sheet databases on start-up.  DMs can add their own character classes, spells, items, weapons, ammo and armour to additional databases, but the databases provided are totally rewritten when new updates are released so the DM must add their own database sheets.  If these provided databases are accidentally deleted, they will be automatically recreated the next time the Campaign is opened. Additional databases should be named as follows:</p>'
							+'<table>'
							+'	<tr><th scope="row">Wizard Spells:</th><td>additional databases: MU-Spells-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Priest Spells:</th><td>additional databases: PR-Spells-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Powers:</th><td>additional databases: Powers-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Magic Items:</th><td>additional databases: MI-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Character Classes:</th><td>additional databases: Class-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Attack Calculations:</th><td>additional databases: Attacks-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'</table>'
							+'<p><b>However:</b> the system will ignore any database with a name that includes a version number of the form "v#.#" where # can be any number or group of numbers e.g. MI-DB v2.13 will be ignored.  This is so that the DM can version control their databases, with only the current one (without a version number) being live.</p>'
							+'<p>There can be as many additional databases as you want. Other Master series APIs come with additional databases, some of which overlap - this does not cause a problem as version control and merging unique macros is managed by the APIs.</p>'
							+'<p><b>Important Note:</b> all Character Sheet databases <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  This must be for all databases, both those provided (set by the API) and any user-defined ones.  Otherwise, Players will not be able to run the macros contained in them.</p>'
							+'<p>Each database has a similar structure, with:</p>'
							+'<ul>'
							+'	<li>Ability Macros named as the class, spell, power or magic item specified, and used to describe and provide effects for classes, spells, powers and magic items using the commands in the RPGMaster APIs;</li>'
							+'	<li>Custom Attributes with the attribute name "ct-ability-macro-name", one per Ability Macro, which defines the casting time and casting cost for spells & powers, and speed and MI type for magic items (not currently used for Class definitions);</li>'
							+'	<li>An entry in a list on the character sheet in the spell book of the relevant Character Sheet tab (Spell Level of the spell defined, Powers tab, or various spell books for different Classes & Magic Items - see Class entry below).</li>'
							+'</ul>'
							+'<p>Ability Macros can be whatever the DM wants and can be as simple or as complex as desired. Roll Templates are very useful when defining class, spell, power and magic item ability macros.  When a Player or an NPC or Monster views or casts a spell, power or uses a magic item the Magic Master API runs the relevant Ability Macro from the databases as if it had been run by the Player from the chat window.  All Roll20 functions for macros are available.</p>'
							+'<h3>1.1 Replacing Classes, Spells & Items</h3>'
							+'<p>If you want to replace any Ability Macro provided in any of the databases, you can do so simply by creating an Ability Macro in one of your own databases with exactly the same name as the provided item to be replaced.  The API gives preference to Ability Macros in user-defined databases, so yours will be selected in preference to the one provided with the APIs.</p>'
							+'<br>'
							+'<h2>2. Character Class Database</h2>'
							+'<p>Character Class databases are all character sheets that have names that start with Class-DB</p>'
							+'<p>	<b>Classes:</b>	Class-DB-<i>[added name]</i></p>'
							+'<p>Those with version numbers of the form v#.# as part of the name will be ignored.</p>'
							+'<p>As previously stated, each class definition has 3 parts in the database (see Section 1): an Ability Macro with a name that is unique and matches the Class being defined, an Attribute with the name of the Ability Macro preceded by "ct-", and a listing in the database character sheet of the ability macro name separated by \'|\' along with others of the same base class: the base classes being "Warrior", "Wizard", "Priest", "Rogue", and "Psion".  The quickest way to understand these entries is to examine existing entries.  Do go to the root database and take a look (but be careful not to alter anything unless you know what you\'re doing!)</p>'
							+'<p><b>Note:</b> The DM creating new classes does not need to worry about anything other than the Ability Macro in the database, as running the command <b><i>--check-db</i></b> will update all other aspects of the database appropriately for all databases, as long as the Specs and Data fields in the Ability Macros are correctly defined. Use the name of the particular database as a parameter to check and update just that database.  Running the command <b><i>--check-db</i></b> with no parameters will check and update all databases.</p>'
							+'<p>Ability macros can be added to a database just by using the [+Add] button at the top of the Abilities column in the Attributes and Abilities tab of the Database Character Sheet, and then using the edit "pencil" icon on the new entry to open it for editing.  Ability macros are standard Roll20 functionality and not dependent on the API.  Refer to the Roll20 Help Centre for more information.</p>'
							+'<h3>Standard / Simple Class definitions</h3>'
							+'<p><b>The Ability Macro</b> for a Class may look something like this:</p>'
							+'<h4>Thief</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Thief}}{{subtitle=Rogue Class}}{{Min Abilities=Dex:[[9]]}}{{Race=Any}}{{Hit Dice=1d6}}{{Alignment=Any not Lawful}}<mark style="color:green">Specs=[Thief,RogueClass,0H,Rogue]</mark>{{=**Powers**}}{{1st Level=Thieving Abilities *Pick Pockets, Open Locks, Find/Remove Traps, Move Silently, Hide in Shadows, Detect Noise, Climb Walls,* and *Read Languages* Also, Thieves can *Backstab*}}{{10th Level=Limited ability to use magical & priest scrolls, with 25% chance of backfire}}<mark style="color:blue">ClassData=[w:Thief, hd:1d6, align:ng|nn|n|ne|cg|cn|ce, npp:-3, weaps:club|shortblade|dart|handxbow|lasso|shortbow|sling|broadsword|longsword|staff, ac:padded|leather|studdedleather|elvenchain|magicitem|ring|cloak]</mark>{{desc=Thieves come in all sizes and shapes, ready to live off the fat of the land by the easiest means possible. In some ways they are the epitome of roguishness.<br>'
							+'The profession of thief is not honorable, yet it is not entirely dishonorable, either. Many famous folk heroes have been more than a little larcenous -- Reynard the Fox, Robin Goodfellow, and Ali Baba are but a few. At his best, the thief is a romantic hero fired by noble purpose but a little wanting in strength of character. Such a person may truly strive for good but continually run afoul of temptation.}}</p>'
							+'<p>The ability specification for this Rogue class uses a Roll20 Roll Template, in this case defined by the Advanced D&D 2e Character Sheet by Peter B (see the documentation for the Character Sheet on Roll20 for specifications of this Roll Template), but any Roll Template you desire can be used.  The entries in the Roll Template itself can be anything you desire, giving as much or as little information as you want.  However, the important elements for the RoundMaster APIs are those highlighted.  Each of the elements important to the database are inserted <i>between</i> the elements of the Roll Template, meaning they will not be seen by the player when the macro is run.  Generally spaces, hyphens and underscores in the data elements are ignored, and case is not significant.  Each element is described below:</p>'
							+'<pre>Specs = [Character Class, Macro Type, Handedness, Base Class]</pre>'
							+'<p>The Specs section describes what Character Class and Base Class this is (and tells the APIs that this is a macro of type "Class").  These fields must be in this order.  This format is identical for all database items, whether in these databases or others used by the RPGMaster series of APIs. Where there are multiple answers for a field, separate each by \'|\'. <b>Note:</b>Only A-Z, a-z, 0-9, hyphen/minus(-), plus(+), equals(=) point(.) and vertical bar(|) are allowed.  Replace any forward slash with hyphen.</p>'
							+'<table>'
							+'	<tr><th scope="row">Character Class</th><td>the Character Class name, often the same as the ability macro name.</td></tr>'
							+'	<tr><th scope="row">Macro Type</th><td>the type of the data in this Ability Macro, one of <i>WarriorClass, WizardClass, PriestClass, RogueClass,</i> or <i>PsionClass</i>.</td></tr>'
							+'	<tr><th scope="row">Handedness</th><td>#H, where # is the number of hands needed to be a character of this class (not currently used).</td></tr>'
							+'	<tr><th scope="row">Base Class</th><td>the base class that this class belongs to, one of <i>Warrior, Wizard, Priest, Rogue,</i> or <i>Psion</i>.</td></tr>'
							+'</table>'
							+'<pre>ClassData=[w:Thief, hd:1d6, align:ng|nn|n|ne|cg|cn|ce, weaps:club|shortblade|dart|handxbow|lasso|shortbow|sling|broadsword|longsword|staff, ac:padded|leather|studdedleather|elvenchain|magicitem|ring|cloak]</pre>'
							+'<p>The ClassData section specifies the data relating to the class.  These fields can be in any order.</p>'
							+'<table>'
							+'	<tr><th scope="row">w:</th><td>&lt;text&gt;</td><td>the name of the class</td></tr>'
							+'	<tr><th scope="row">align:</th><td>&lt;lg|ln|le|ng|nn|n|ne|cg|cn|ce&gt; or &lt;any&gt;</td><td>the valid alignments for characters of this class, separated by \'|\' (not currently restricted)</td></tr>'
							+'	<tr><th scope="row">race:</th><td>&lt;list of races&gt; or &lt;any&gt;</td><td>the races that can take this class, separated by \'|\' (not currently restricted)</td></tr>'
							+'	<tr><th scope="row">hd:</th><td>&lt;dice roll spec&gt;</td><td>the dice roll specification for hit points at each level (not currently used, for future expansion)</td></tr>'
							+'	<tr><th scope="row">npp:</th><td>&lt;[-/+]#&gt;</td><td>optional field to set a bespoke non-proficient weapon penalty for the character class.  If not provided defaults to that for the Base Class.</td></tr>'
							+'	<tr><th scope="row">weaps:</th><td>&lt;list of weapons & weapon types&gt; or &lt;any&gt;</td><td>a vertical bar \'|\' separated list of weapons and weapon types that are valid for the class (see Section ### for a list)</td></tr>'
							+'	<tr><th scope="row">ac:</th><td>&lt;list of armour types&gt; or &lt;any&gt;</td><td>a vertical bar \'|\' separated list of armour and armour types that are valid for the class (see Section ### for a list)</td></tr>'
							+'</table>'
							+'<p>The list of weapons and weapon types listed after the "weaps:" tag are checked by the system when a character tries to take a weapon in-hand using the "Change Weapons" dialogue or AttackMaster <b>--weapon</b> command, as determined by the API configuration setting, accessed via the MagicMaster or AttackMaster <b>--config</b> command.  This configuration can be to restrict weapons to those listed ("Strict" mode), to give unlisted weapons a penalty of double the non-proficient weapon penalty for the base class ("Lax" mode), or to ignore this list and allow any weapon to be proficient or to just get the standard non-proficient weapon penalty ("Allowed" mode).</p>'
							+'<p>In exactly the same way as for weapons, armour and armour types listed after the "ac:" tag are checked when calculating the Armour Class of the character using the "Check AC" dialogue or AttackMaster <b>--checkac</b> command, or automatically by the APIs at various points when AC might change, again according to the API configuration settings accessed via the <b>--config</b> command.  This configuration can restrict a class to the armours and armour types listed for the class ("Rules" mode), or not restrict usage at all ("Allowed" mode).</p>'
							+'<p>Three additional field tags are optionally available to allow the default weapon attacks per round progression to be overridden with a bespoke progression.  Any one, two or all three can be specified: if just the progression level sequence is given, these levels will override the default levels, and similarly for the melee and ranged weapon mods, and defaults will be used or those not overridden.  This only works for classes that are types of Warrior.  The defaults are those specified for the Warrior class in the Player\'s Handbook.</p>'
							+'<table>'
							+'	<tr><th scope="row">attkl:</th><td>&lt;0|#|#|...&gt;</td><td>a vertical bar \'|\' separated list of levels (the first must be 0) at which the next higher number of attacks per round is achieved.</td></tr>'
							+'	<tr><th scope="row">attkm:</th><td>&lt;#|#|#|...&gt;</td><td>a vertical bar \'|\' separated list of modifications to the standard number of attacks per round for any melee weapon used.  Each can be an integer, a decimal float (# . #) or a fraction (# / #)</td></tr>'
							+'	<tr><th scope="row">attkr:</th><td>&lt;#|#|#|...&gt;</td><td>a vertical bar \'|\' separated list of modifications to the standard number of attacks per round for any ranged weapon used.  Each can be an integer, a decimal float (# . #) or a fraction (# / #)</td></tr>'
							+'</table>'
							+'<h3>Changing the Default Saving Throws</h3>'
							+'<p>The default Saving Throw table from the Player\'s Handbook can be overridden for any class definition. A new set of base saving throws by experience level can be defined.'
							+'<h4>Dwarven Defender</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Dwarven Defender}}{{subtitle=Warrior Class}}{{Min Abilities=Str:[[12]], Con:[[15]]}}{{Race=Dwarf only}}{{Alignment=Any}}<mark style="color:green">Specs=[Dwarven Defender,WarriorHRClass,0H,Warrior]</mark>{{Hit Dice=1d12}}{{=**Powers**}}{{1st Level=*Defensive Stance* (1/4 levels per day}}<mark style="color:blue">ClassData=[w:Fighter, align:any, hd:1d12, race:dwarf, weaps:axe|club|flail|longblade|fencingblade|mediumblade|shortblade|polearm, ac:any, svl0:16|18|17|20|19, svl1:12|17|15|16|15, svl3:11|16|14|15|14, svl5:10|14|12|12|12, svl7:9|13|11|11|11, svl10:7|11|9|8|9, svl13:4|9|6|5|7, sv16:2|7|4|3|4, ns:1][cl:PW, w:Defensive-Stance, lv:1, pd:1l4]</mark>{{desc=The Dwarven defender is a formidable warrior. They are trained in the art of defence from a young age and make a defensive line nearly unbreakable.<br>'
							+'The class is limited to Dwarves.<br>'
							+'They can wear any armour but tend to go with the heaviest and toughest they can afford. They always use a shield, whenever possible a special Dwarven Tower shields (+1 in melee but +3 vs missiles when braced and in position). To use a Tower Shield requires a weapon proficiency slot. The dwarven Tower Shield has to be acquired in the campaign, it isn’t just granted to the character on creation (it’s a bit like a Paladins Warhorse).   It may take many levels before they get a quest to acquire one.<br>'
							+'They can only become proficient, specialise and double specialise in axes (not great axes) or hammers. They can never use missile weapons like a bow or crossbow but can throw hammers or axes.<br>'
							+'They get bonus non weapon proficiency slots in Armourer, Blacksmithing and Mining.}}</p>'
							+'<p>In addition to the elements described previously, the ClassData section specifies new elements regarding saving throws (ignore the ns: and everything beyond for now):</p>'
							+'<pre>ClassData=[w:Fighter, align:any, hd:1d12, race:dwarf, weaps:axe|club|flail|longblade|fencingblade|mediumblade|shortblade|polearm, ac:any, svl0:16|18|17|20|19, svl1:12|17|15|16|15, svl3:11|16|14|15|14, svl5:10|14|12|12|12, svl7:9|13|11|11|11, svl10:7|11|9|8|9, svl13:4|9|6|5|7, sv16:2|7|4|3|4, ns:1]</pre>'
							+'<p>Each <i>sv#</i> element specifies the base saves at and above experience level "#", for the five standard base save types, <i>Paralysation, Poison & Death | Rod, Staff & Wand | Petrification & Polymorph | Breath Weapon | Spells</i>.  The highest specification element applies to all higher experience levels.</p>'
							+'<p>Magic Items, Race definitions, and other database elements that affect a character can specify modifications to the base Saving Throws (whether using the defaults or custom Class specifications) by using the data element <b>svXXX:[+-=]#,</b>, where "XXX" is one of <i>par, poi, dea, rod, sta, wan, pet, pol, bre, spe</i> or <i>all</i>, followed by a colon, then <i>a plus (+), a minus (-), an equals (=),</i> and a number, or just a number with nothing before it.  Each of the three letter qualifiers refers to the relevant save, except "all" which applies the modifier to all saves.  Preceeding the modifier amount by plus (+) or nothing <i><b>improves</b></i> the save by the modifier, preceeding by minus (-) <i><b>worsens</b></i> the save by the modifier, and by equals (=) overrides any other modifier being applied and applies <i>only</i> the modifier preceeded by the equals.  Obviously, racial mods apply at all times (unless overridden by a magic item using the "=" modifier), and magic item mods only apply if the character has the magic item in their held items.</p>'
							+'<h3>Restricting the Schools and Spheres of Spells available</h3>'
							+'<p>While standard Wizards and Priests are very similar to the standard specification above, the definitions of specialist spellcaster classes is slightly more complex.</p>'
							+'<h4>Conjurer</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Conjurer}}{{subtitle=Wizard Class}}{{Min Abilities=Int:[[9]], Con:[[15]]}}{{Alignment=Any}}{{Race=Human & Half Elf}}{{Hit Dice=1d4}}<mark style="color:green">Specs=[Conjurer,WizardClass,0H,Wizard]</mark>{{=**Spells**}}{{Specialist=Conjuration / Summoning}}{{Banned=Greater Divination & Invocation}}<mark style="color:blue">ClassData=[w:Conjurer, hd:1d4, race:human|halfelf, sps:conjuration|summoning|conjurationsummoning, spb:greaterdivination|invocation, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]</mark>{{desc=This school includes two different types of magic, though both involve bringing in matter from another place. Conjuration spells produce various forms of nonliving matter. Summoning spells entice or compel creatures to come to the caster, as well as allowing the caster to channel forces from other planes. Since the casting techniques and ability requirements are the same for both types of magic, conjuration and summoning are considered two parts of the same school.}}</p>'
							+'<pre>ClassData=[w:Conjurer, hd:1d4, race:human|halfelf, sps:conjuration|summoning|conjurationsummoning, spb:greaterdivination|invocation, weaps:dagger|staff|dart|knife|sling, ac:magicitem|ring|cloak]</pre>'
							+'<p>The ClassData for specialist casters includes additional tags to specify the schools/spheres of magic that the caster can and cannot use (and for priests major and minor access to spheres).</p>'
							+'<table>'
							+'	<tr><th scope="row">sps:</th><td>&lt;text|text|...&gt; or &lt;any&gt;</td><td>a list of specialist schools or major spheres separated by vertical bars (\'|\')</td></tr>'
							+'	<tr><th scope="row">spb:</th><td>&lt;text|text|...&gt;</td><td>a list of banned schools/spheres that this class is not allowed to use separated by vertical bars (\'|\')</td></tr>'
							+'	<tr><th scope="row">spm:</th><td>&lt;text|text|...&gt;</td><td>a list of minor spheres (only relevant to Priest classes) separated by vertical bars (\'|\')</td></tr>'
							+'</table>'
							+'<p>The spellcaster will be restricted to memorising only spells from the schools/spheres listed depending on the API configuration using the <b>--config</b> command.  The configuration can be to restrict to the specified schools/spheres ("Strict" mode) or allow all at any level ("Allowed" mode).  The DM will also have a single button to add all valid spells at all levels to a Priest character sheet using the [Token-setup] macro or the <b>!cmd --abilities</b> command, and then using the [Add to Spellbook] / [Priest] dialogue.</p>'
							+'<h3>Default spells and spells per level</h3>'
							+'<p>Using the classes called "Wizard" or "Priest" will always grant the standard Wizard and Priest spells per level respectively as per the Player\'s Handbook, thus the class specifications are no different from that above.  Also, <i>any</i> class name placed in the <i>Wizard</i> class fields (the second class definition column of the Advanced 2e sheet) will get standard Wizard spell casting capabilities (unless otherwise specified as below), and those in the <i>Priest</i> class fields (the third class definition column of the Advanced 2e sheet) will get standard Priest spell casting capabilities (unless otherwise specified as below).</p>'
							+'<h3>Non-standard spells per level</h3>'
							+'<p>A <b>non-standard</b> spellcaster (such as a Ranger, Paladin or Bard, or any class you wish to specify of a similar nature) can have their spellcasting capabilities specified in the class definition:</p>'
							+'<h4>Priest of Magic</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Priest of Magic}}{{subtitle=Priest Class}}{{Min Abilities=Wis:[[12]], Int:[[13]]}}{{Race=Human or Half Elf}}{{Hit Dice=1d8}}{{Reference=*House Rules v16*}}{{=**Alignment**}}{{Deity=True Neutral}}{{Priests=Any Neutral}}{{Flock=Any Alignment}}{{  =**Spells**}}{{Major Spheres=All, Divination, Protection, Healing, Elemental}}{{Minor Spheres=Sun}}<mark style="color:green">Specs=[Priest of Magic,PriestClass,0H,Priest]</mark>{{Powers=None}}<mark style="color:blue">ClassData=[w:Priest of Magic, hd:1d8, race:human|halfelf, align:ng|nn|n|ne, weaps:dagger|staff|dart|knife|sling, ac:any, sps:any, slv:4|3|12|MU, spl1:1|2|2|3|3|3|4|4|4|4|5|5, spl2:0|0|1|1|2|2|3|3|3|4|4|4, spl3:0|0|0|0|1|1|2|2|3|3|3|3, spl4:0|0|0|0|0|0|1|1|1|2|2|3],[w:Priest of Magic, sps:all|divination|protection|healing|elemental, spm:sun, slv:7|1|100|PR, spl1:1|2|2|3|3|3|3|3|3|3|3|3|3|3|4|4|4|4|4, spl2:0|0|1|1|2|2|3|3|3|3|3|3|3|3|3|4|4|4|4, spl3:0|0|0|0|0|1|1|2|2|3|3|3|3|3|3|3|4|4|4, spl4:0|0|0|0|0|0|0|0|1|1|2|2|3|3|3|3|3|4|4, spl5:0|0|0|0|0|0|0|0|0|0|0|1|1|2|2|3|3|3|4, spl6:0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|1|2|2|3, spl7:0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|1|2|2|2]</mark>{{desc=The Priest of Magic is an optional character class that can be used if your DM allows. It is a curious class in that it is a priest of the god of Magic, who then grants the priest the use of some limited Wizard spells as well as a slightly more restricted range of clerical spells.}}</p>'
							+'<p>The <i>Priest of Magic</i> (a "House Rules" class for my group) can cast some Wizard spells at the expense of loosing some Priest spellcasting capability.  Its class definition has ClassData for both "MU" and "PR" spells, in two separate sections (enclosed in each comma-separated \'[...]\').'
							+'<table>'
							+'	<tr><th scope="row">slv:</th><td>&lt;#|#|#|(MU|PR)&gt;</td><td>three numbers followed by <i>either</i> MU <b>or</b> PR (no brackets), separated by vertical bars (\'|\').  The first number is the highest level of spell that can be cast, the second the first class level at which spells can be cast, and the third the maximum casting level, followed by the class of spells being specified (MU=Wizard, PR=Priest)</td></tr>'
							+'	<tr><th scope="row">spl#:</th><td>&lt;#|#|#|...&gt;</td><td>for spells of level spl#, starting at the class level at which spells can be cast, the numbers of spells that can be cast at that and subsequent levels</td></tr>'
							+'</table>'
							+'<h3>Classes with Specific Powers</h3>'
							+'<p>A character class can also be granted powers, and these can be specified in the class definition both as text for the Player to read, and also coded so the APIs can read them.</p>'
							+'<h4>Priest of Light</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Priest of Light}}{{subtitle=Priest Class}}{{ =**Alignment**}}{{Deity=Neutral Good}}{{Priests=Any Good}}{{Flock=Any Neutral or Good}}{{Hit Dice=1d8}}<mark style="color:green">Specs=[Priest of Light,PriesthoodClass,0H,Priest]</mark>{{ =**Powers**}}{{1st Level=*Infravision, Turn Undead*}}{{3rd Level=*Laying on Hands*}}{{5th Level=*Charm/Fascination*}}{{9th Level=*Prophecy*}}{{ =**Spells**}}{{Major Spheres=All, Charm, Divination, Healing and Sun}}{{Minor Spheres=Animal, Creation, Necromantic and Plant}}<mark style="color:blue">ClassData=[w:Priest of Light, align:LG|NG|CG, hd:1d8, weaps:bow|crossbow|dagger|dirk|dart|javelin|knife|slings|spear, ac:leather|padded|hide|magicitem|ring|cloak, sps:all|charm|divination|healing|sun, spm:animal|creation|necromantic|plant, ns:5][cl:PW, w:Infravision, lv:1, pd:-1][cl:PW, w:Turn Undead, lv:1, pd:-1][cl:PW, w:Laying on Hands, lv:3, pd:1][cl:PW, w:Charm-Fascination, lv:5, pd:1][cl:PW, w:Prophecy, lv:9, pd:1]</mark>{{desc=The god of all forms of light: Sunlight, moonlight, firelight, etc. The god is a friend of life, a patron of magic, a proponent of logical thought, and an enemy of the undead.<br>'
							+'The priesthood of the god is devoted to celebrating these aspects of the god and to promoting positive forces such as healing.<br>'
							+'Lesser gods of this attribute would be gods of one aspect of light. One god might be the god of Reason, another the god of Inspiration, etc.<br>'
							+'This deity is as likely to be male as female.<br>'
							+'The priests of this god are on good terms with the priests of Arts, Crafts, Darkness/Night, Dawn, Elemental Forces, Fire, Healing, Hunting, Literature/Poetry, Magic, Metalwork, Moon, Music/Dance, Oracles/Prophecy, and Sun.}}{{Reference=*The Complete Priest\'s Handbook* Sample Priesthoods}}</p>'
							+'<p>The ClassData specification now has a tag of <b>ns:</b> which specifies a following number of sections enclosed in square brackets (\'[...]\'), each of which defines a single power granted to characters of this class.  These sections include the following fields:</p>'
							+'<table>'
							+'	<tr><th scope="row">cl:</th><td>&lt;PW&gt;</td><td>specifies the type of granted capability - for Class definitions, this is always PW (standing for Power)</td></tr>'
							+'	<tr><th scope="row">w:</th><td>&lt;text&gt;</td><td>the name of the power granted (which should match a definition in the Powers database Powers-DB)</td></tr>'
							+'	<tr><th scope="row">lv:</th><td>&lt;#&gt;</td><td>the character level at which they will gain this power</td></tr>'
							+'	<tr><th scope="row">pd:</th><td>&lt;-1 / #[L#]&gt;</td><td>the number of times per day the power can be used. A number, or -1 (meaning <i>"at will"</i>, or #L# which is first number per second number levels per day (e.g. 1L4 means once per day for L1 to L4, twice L5 to L8, etc)</td></tr>'
							+'</table>'
							+'<p>This allows the DM to use a single button to add all the specified powers to the Powers list of a specific character sheet using the [Token-Setup] macro or the <b>!cmd --abilities</b> command, and then using the [Add to Spellbook] / [Powers] dialogue.  The Player will then only be able to memorise the appropriate powers for the character\'s level.</p>'
							+'<h2>3. Specs & Data field values</h2>'
							+'<p>Below are lists of the current possible values for the item database Ability macro sections.</p>'
							+'<h3>3.1 Specs sections</h3>'
							+'<pre>Specs=[Class Type, Macro Type, Handedness, Class Group-Type]</pre>'
							+'<p>There are no default settings for any of the Specs data fields.  All must be explicitly specified.</p>'
							+'<h4>3.1(a) Class Types</h4>'
							+'<p>There is an infinite list of class types: generally the type is the class name.</p>'
							+'<h4>3.1(b) Macro Type</h4>'
							+'One of "WarriorClass", "WizardClass", "PriestClass", "RogueClass", "PsionClass", relating to the base class of the character.  This field is used to add the Class name to the right base class list for selection by the Players.'
							+'<h4>3.1(c) Class Handedness</h4>'
							+'<p><b>0H</b> A Class that can only be taken by characters and creatures that do not have hands (e.g. a fish-type creature)<br>'
							+'<b>1H</b> A Class that can only be taken by characters or creatures with only one hand (e.g. a snake NPC that can use its prehensile tail to hold weapons)<br>'
							+'<b>2H</b> A Class that has two hands - the normal for humanoid PCs and NPCs<br>'
							+'<b>3H</b> A Class that can only be taken by characters or creatures with three or more hands<br>'
							+'<b>4H</b> Etc  <br>'
							+'<b>...</b>	...</p>'
							+'<p><i>(Handedness for Classes are not currently restricted or used by the system.  In future, the number of hands specified on the "Change Weapon" dialogue may be related to the Character Class)</i></p>'
							+'<h4>3.1(d) Base Classes</h4>'
							+'<p>The Base Class can currently be one of "Warrior", "Wizard", "Priest", "Rogue" or "Psion". If a character class is allowed to be of more than one base class, separate each with a vertical bar character \'|\'.  This determines the valid Character Sheet fields that this Class Type can appear in.</p>'
							+'<br>'
							+'<h4>3.2 Data Sections</h4>'
							+'<p>Below are the definitions for each of the possible ClassData fields.</p>'
							+'<p><b>Note:</b> Always refer to the database specification definitions in other sections above for detailed information on the use of these Field specifiers.  Not all specifiers have an obvious use.</p>'
							+'<table>'
							+'	<thead>'
							+'		<tr>'
							+'			<th scope="col">Field</th>'
							+'			<th scope="col">Format</th>'
							+'			<th scope="col">Default Value</th>'
							+'			<th scope="col">Description</th>'
							+'		</tr>'
							+'	</thead>'
							+'	<tr><th scope="row">w:</th><td>< text ></td><td>\'Fighter\'</td><td>Name of the Class</td></tr>'
							+'	<tr><th scope="row">hd:</th><td>Dice Roll spec</td><td>0</td><td>Hit dice roll per level</td></tr>'
							+'	<tr><th scope="row">align:</th><td>[ lg / ng / cg / ln / nn / n / cn / le / ne / ce / any ]</td><td>any</td><td>Allowed alignments</td></tr>'
							+'	<tr><th scope="row">race:</th><td>< text | text | ... > or any</td><td>any</td><td>Allowed races</td></tr>'
							+'	<tr><th scope="row">weaps:</th><td>< text | text | ... > or any</td><td>any</td><td>Allowed weapons and weapon types</td></tr>'
							+'	<tr><th scope="row">ac:</th><td>< text | text | ... > or any</td><td>any</td><td>Allowed armour types</td></tr>'
							+'	<tr><th scope="row">attkl:</th><td>< 0 | # | # | ... ></td><td>\'\'</td><td>Class level progression for "attacks per round" modifiers</td></tr>'
							+'	<tr><th scope="row">attkm:</th><td>< # | # | # | ... ></td><td>\'\'</td><td>Melee weapon "attacks per round" modifiers by class level progression</td></tr>'
							+'	<tr><th scope="row">attkr:</th><td>< # | # | # | ... ></td><td>\'\'</td><td>Ranged weapon "attacks per round" modifiers by class level progression</td></tr>'
							+'	<tr><th scope="row">ns:</th><td>#</td><td>0</td><td>Number of granted spells/powers defined for item</td></tr>'
							+'	<tr><th scope="row">cl:</th><td>< MU / PR / PW ></td><td>\'\'</td><td>Type of granted spell/power (always PW=Power)</td></tr>'
							+'	<tr><th scope="row">w:</th><td>< text ></td><td>\'-\'</td><td>Name of granted spell/power</td></tr>'
							+'	<tr><th scope="row">lv:</th><td>#</td><td>1</td><td>The character level at which the Power is granted</td></tr>'
							+'	<tr><th scope="row">pd:</th><td>[ -1 / # / #L# ]</td><td>1</td><td>No. of times per day power can be used. -1 is <i>"at will"</i>, and #L# is first number per second number levels per day </td></tr>'
							+'	<tr><th scope="row">sps:</th><td>< text | text | ... > or any</td><td>any</td><td>Allowed spell schools or major spheres</td></tr>'
							+'	<tr><th scope="row">spm:</th><td>< text | text | ... ></td><td>\'\'</td><td>Allowed minor spheres</td></tr>'
							+'	<tr><th scope="row">spb:</th><td>< text | text | ... ></td><td>\'\'</td><td>Banned spell schools</td></tr>'
							+'	<tr><th scope="row">slv:</th><td>< # | # | # | &lt;MU / PR&gt; ></td><td>\'\'</td><td>Non-standard spellcaster level/type specification</td></tr>'
							+'	<tr><th scope="row">spl#</th><td>< # | # | # | ... ></td><td>\'\'</td><td>No. of spells of level spl# at each character level</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>7.3 Character Sheet data fields</h3>'
							+'<p>The Character Sheet field mapping to the API script can be altered using the definition of the fields object, the definition for which can be found at the top of each API.  You can find the complete mapping for all APIs in the RPGMaster series, with an explanation of each, in a separate document - as the Author for a copy.</p>'
							+'</div>',
						},
	AttacksDatabase_Help:{name:'Attacks Database Help',
						 version:1.01,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">Attacks Database Help v1.01</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>CAttacks Database</h1>'
							+'<h6><i>for RPGMaster APIs</i></h6>'
							+'<h2>1. General Database information</h2>'
							+'<p>The RPGMaster APIs use a number of Character Sheets as databases to hold Ability Macros defining character classes, attack templates, spells, powers and magic items and their effects.  The API is distributed with many class, attack, spell, power & magic item definitions, and checks for, creates and updates these Character Sheet databases on start-up.  DMs can add their own character classes, attack templates, spells, items, weapons, ammo and armour to additional databases, but the databases provided are totally rewritten when new updates are released so the DM must add their own database sheets.  If the provided databases are accidentally deleted, they will be automatically recreated the next time the Campaign is opened. Additional databases should be named as follows:</p>'
							+'<table>'
							+'	<tr><th scope="row">Wizard Spells:</th><td>additional databases: MU-Spells-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Priest Spells:</th><td>additional databases: PR-Spells-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Powers:</th><td>additional databases: Powers-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Magic Items:</th><td>additional databases: MI-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Character Classes:</th><td>additional databases: Class-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Attack Templates:</th><td>additional databases: Attacks-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'</table>'
							+'<p><b>However:</b> the system will ignore any database with a name that includes a version number of the form "v#.#" where # can be any number or group of numbers e.g. MI-DB v2.13 will be ignored.  This is so that the DM can version control their databases, with only the current one (without a version number) being live.</p>'
							+'<p>There can be as many additional databases as you want. Other Master series APIs come with additional databases, some of which overlap - this does not cause a problem as version control and merging unique macros is managed by the APIs.</p>'
							+'<p><b>Important Note:</b> all Character Sheet databases <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  This must be for all databases, both those provided (set by the API) and any user-defined ones.  Otherwise, Players will not be able to run the macros contained in them.</p>'
							+'<p>Each database has a similar structure, with:</p>'
							+'<ul>'
							+'	<li>Ability Macros named as the class, attack type, spell, power or magic item specified, and used to describe and provide effects for classes, attacks, spells, powers and magic items using the commands in the RPGMaster APIs;</li>'
							+'	<li>Custom Attributes with the attribute name "ct-ability-macro-name", one per Ability Macro, which defines the casting time and casting cost for spells & powers, and speed and MI type for magic items (not currently used for Class or Attack definitions, but they still have to exist);</li>'
							+'	<li>An entry in a list on the character sheet in the spell book of the relevant Character Sheet tab (Spell Level of the spell defined, Powers tab, or various spell books for different Classes & Magic Items).</li>'
							+'</ul>'
							+'<p>However, as with all other Databases in the RPGMaster Suite of APIs, if the <i>Ability Macros</i> are correctly set up using the formats detailed in the Help Documentation, the <b>AttackMaster API</b> command <b>!attk --check-db database-name</b> will check the database and set up all other aspects for you, including the correct Custom Attributes and List entries.</p>'
							+'<p>Ability Macros can be whatever the DM wants and can be as simple or as complex as desired. Roll Templates are very useful when defining class, spell, power and magic item ability macros, and are an essential part of Attack Templates.  When a Player or an NPC or Monster makes an attack, the AttackMaster API runs the relevant Ability Macro from the databases as if it had been run by the Player from the chat window.  All Roll20 functions for macros are available.</p>'
							+'<h3>1.1 Replacing Classes, Attacks, Spells & Items</h3>'
							+'<p>If you want to replace any Ability Macro provided in any of the databases, you can do so simply by creating an Ability Macro in one of your own databases (a database with the same root name) with the Ability Macro you create having exactly the same name as the provided item to be replaced.  The API gives preference to Ability Macros in user-defined databases, so yours will be selected in preference to the one provided with the APIs.</p>'
							+'<br>'
							+'<h2>2. How Attacks Work</h2>'
							+'<p>In order to understand the Attacks Database, it is first important to understand how attacks are executed by the <b>AttackMaster API</b>.  Under <i>AD&D 2nd Edition</i>, attacks are quite complex, involving many factors that can vary from moment to moment.  Some say that this is why they prefer RPG systems that require less maths and are faster to execute, that the complexity of the AD&D2e combat system interrupts the flow of play.  The AttackMaster API handles attacks in such a way as to hide as much of that complexity from the players as possible, and thus allow game-play to flow and players to concentrate on the unfolding story.</p>'
							+'<p>In order for the API to achieve this, it must evaluate many factors "on the fly" such as current magical effects in place (generally or on individuals), the current attributes of a character (which can vary as they are affected by game play), the type, range and properties of the weapon combinations used at that point in time for that particular attack, and the effects of the race, class, level and proficiency of the character, among several others.  Given that these factors can vary even during a single round, each attack must be fully evaluated from scratch each time it is made.</p>'
							+'<p>Another issue is introduced by players feeling much more satisfied if they can see dice rolling for the attack, or they may want to use the Roll20 dice rolling mouse action, or even their own physical dice.  Unfortunately for API authors, at the time of writing the API it is only possible to display rolling 3D dice from Chat Window dice rolls, either typed in the entry box by the player or run from Macros displayed in the Chat Window - 3D dice will not work when called by or included in API calls and commands.</p>'
							+'<p>So how does the AttackMaster API achieve 3D dice rolls and attack calculations that can accelerate game-play?  The answer is that it uses Attack Template definitions which it parses and turns into Ability Macros on the Character Sheet of the character that selects to do an attack.  The Melee Weapon templates are parsed and the attack Ability Macros for each Melee weapon in-hand created on the Character Sheet as (in fact just before) the Attack chat window menu is displayed, and Ranged Weapon templates are parsed and their attack Ability Macros are created after the type of Ammo has been selected and just before the relevant range buttons on the Attack menu are enabled for the Player to select.  When the Player selects a Melee weapon to attack with, or the relevant range button for a Ranged weapon, the API is then not actually involved at all - the Roll20 Chat Window button just selected is just doing a standard macro call to the relevant attack Ability Macro just created on the Character Sheet.  This also means the actual attacks happen at the fastest speed Roll20 can achieve as no API code is being run at that point.</p>'
							+'<br>'
							+'<h2>3. The Attacks Database</h2>'
							+'<p>The Attack Templates are stored in the Attacks Database, <i>Attacks-DB</i>, and any additional bespoke Attacks Databases the DM/Game Creator adds using the Character Sheet name <i>Attacks-DB-[added name]</i>.  There are 17 basic Attacks Templates:</p>'
							+'<table>'
							+'	<tr><th scope="row">MW-ToHit</th><td>Melee Weapon calculation to assess and display the Armour Class hit by an attack</td></tr>'
							+'	<tr><th scope="row">MW-DmgSM</th><td>Melee Weapon calculation to assess the damage done to a Medium or smaller opponent if the hit was sucessful</td></tr>'
							+'	<tr><th scope="row">MW-DmgL</th><td>Melee Weapon calculation to assess the damage done to Large or larger opponents as a result of a successful hit</td></tr>'
							+'	<tr><th scope="row">MW-Targeted-Attk</th><td>Melee Weapon calculation for using a targeted attack which rolls all attack and damage dice at once, and then displays the AC hit, the damage vs. all types of opponents, and the current AC & HP of the targeted opponent</td></tr>'
							+'	<tr><th scope="row">RW-ToHit</th><td>Ranged Weapon calculation to assess and display the Armour Class hit by an attack</td></tr>'
							+'	<tr><th scope="row">RW-DmgSM</th><td>Ranged Weapon calculation to assess the damage done to a Medium or smaller opponent if the hit was sucessful</td></tr>'
							+'	<tr><th scope="row">RW-DmgL</th><td>Ranged Weapon calculation to assess the damage done to Large or larger opponents as a result of a successful hit</td></tr>'
							+'	<tr><th scope="row">RW-Targeted-Attk</th><td>Ranged Weapon calculation for using a targeted attack which rolls all attack and damage dice at once, and then displays the AC hit, the damage vs. all types of opponents, and the current AC & HP of the targeted opponent</td></tr>'
							+'	<tr><th scope="row">Mon-Attk1</th><td>Monster/Creature attack 1 calculation to assess and display the Armour Class hit by an attack</td></tr>'
							+'	<tr><th scope="row">Mon-Attk2</th><td>Monster/Creature attack 2 calculation to assess and display the Armour Class hit by an attack</td></tr>'
							+'	<tr><th scope="row">Mon-Attk3</th><td>Monster/Creature attack 3 calculation to assess and display the Armour Class hit by an attack</td></tr>'
							+'	<tr><th scope="row">Mon-Dmg1</th><td>Monster/Creature damage 1 calculation to assess and display the damage done by an attack</td></tr>'
							+'	<tr><th scope="row">Mon-Dmg2</th><td>Monster/Creature damage 2 calculation to assess and display the damage done by an attack</td></tr>'
							+'	<tr><th scope="row">Mon-Dmg3</th><td>Monster/Creature damage 3 calculation to assess and display the damage done by an attack</td></tr>'
							+'	<tr><th scope="row">Mon-Targeted-Attk1</th><td>Monster/Creature for a targeted attack 1 calculation to assess and display the Armour Class hit and damage done by an attack, along with the target\'s current AC and HP</td></tr>'
							+'	<tr><th scope="row">Mon-Targeted-Attk2</th><td>Monster/Creature for a targeted attack 2 calculation to assess and display the Armour Class hit and damage done by an attack, along with the target\'s current AC and HP</td></tr>'
							+'	<tr><th scope="row">Mon-Targeted-Attk3</th><td>Monster/Creature for a targeted attack 3 calculation to assess and display the Armour Class hit and damage done by an attack, along with the target\'s current AC and HP</td></tr>'
							+'</table>'
							+'<p>The Melee Weapon Attack Templates will be parsed for each Melee Weapon in-hand at the time of the attack, and the Ranged Weapon Attack Templates will be parsed for each possible range of the Ranged Weapon/Ammo combination selected for the attack.  Two additional Melee Weapon Attack Templates are parsed if the character making the attack is a Rogue class:</p>'
							+'<table>'
							+'	<tr><th scope="row">MW-Backstab-DmgSM</th><td>Melee Weapon calculation to assess the damage done to a Medium or smaller opponent if the hit was a Rogue doing a backstab and the attack was successful</td></tr>'
							+'	<tr><th scope="row">MW-Backstab-DmgL</th><td>Melee Weapon calculation to assess the damage done to a Large or larger opponent if the hit was a Rogue doing a backstab and the attack was successful</td></tr>'
							+'</table>'
							+'<p>All of the above templates are provided in the Attacks-DB database supplied with the AttackMaster API.  They are created to follow AD&D 2nd Edition rules: DMs and Game Creators can create their own attack and damage calculations following whatever rules they want in their own bespoke Attacks Database, using the information provided in the next section.</p>'
							+'<p>It is possible to add additional Attack Templates that are specific to particular Races, Classes, or even individual weapons!  Indeed, the database supplied with the AttackMaster API includes an example of a bespoke Attack Template set for a thrown prepared Oil Flask.  When an attack is the action selected by the Player, the API will search the Attacks-DB and bespoke user Attacks Databases for Melee and Ranged Attack Templates in the following name order (replace the ?W with either MW or RW as appropriate):</p>'
							+'<ol>'
							+'	<li><b>?W-ToHit-\<weapon name\></b> Searches for a weapon-specific Attack Template set for the weapon being used to attack with, but if not found then</li>'
							+'	<li><b>?W-ToHit-\<class name\></b> Searches for a class-specific Attack Template set for the class (or each class of a multi/dual class) of the attacking character, but if not found then</li>'
							+'	<li><b>?W-ToHit-\<race\></b> Searches for a race-specific Attack Template set for the race of the attacking character, but if not found then</li>'
							+'	<li><b>?W-ToHit</b> Uses the default Attack Template set.</li>'
							+'</ol>'
							+'<br>'
							+'<h2>4. Attack Data Fields</h2>'
							+'<p>Attack Templates can take the form of any message or macro that can be held in a Roll20 Character Sheet Ability Macro and be displayed in the Chat Window when called.  Typically, this will use a Roll Template (standard Roll20 functionality - see Roll20 Help for information), but it can be any format you desire as long as it results in the correct display of information to the Player.</p>'
							+'<p>The Attack Template has a large number of template fields that it can call upon to use in its calculations - these are pre-calculated values supplied by the API that the DM / Game Creator writing a new Attack Template can use.  The standard Roll20 attribute value notation of @{selected|field-name} is not recommended for use in Attack Templates, as when the template is parsed, and then later the resulting Ability Macro run as part of the attack, there are circumstances where the token for the attacking Character may not be currently selected, resulting in the wrong value being used or, worse, an error occurring and the game halting.  Instead, all the following template fields are available:</p>'
							+'<table>'
							+'	<thead>'
							+'		<tr><th colspan="2">All Attack Templates</th><tr>'
							+'	</thead>'
							+'	<tr><th scope="row">^^toWho^^</th><td>Resolves to a Roll20 whisper command to the Character making the attack</td></tr>'
							+'	<tr><th scope="row">^^toWhoPublic^^</th><td>Resolves to a Roll20 chat command to the GM if a GM controlled creature is making the attack, otherwise a public message to all Players</td></tr>'
							+'	<tr><th scope="row">^^defaultTemplate^^</th><td>Resolves to the name of the Default Roll Template name set in the AttackMaster API</td></tr>'
							+'	<tr><th scope="row">^^cname^^</th><td>Resolves to the Character Name of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^tname^^</th><td>Resolves to the Token Name of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^cid^^</th><td>Resolves to the Roll20 Character ID of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^tid^^</th><td>Resolves to the Roll20 Token ID of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^toHitRoll^^</th><td>Depending on if the Player chose for Roll20 to roll the attack dice or to roll their own dice, resolves to one of (a) the attack dice specification provided in the Attack Template\'s <i>Specs</i> field, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^thac0^^</th><td>Resolves to the base thac0 (value "to hit armour class 0") of the attacking character without any adjustments</td></tr>'
							+'	<tr><th scope="row">^^ACfield^^</th><td>Resolves to the Character Sheet field name that holds the target creatures current Armour Class (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^targetACfield^^</th><td>Resolves to the targeted token value Armour Class macro call <i>@{target|Select Target|tokenAC-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^targetHPfield^^</th><td>Resolves to the targeted token value Hit Points macro call <i>@{target|Select Target|tokenHP-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^HPfield^^</th><td>Resolves to the Character Sheet field name that holds the target creatures current Hit Points (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^magicAttkAdj^^</th><td>Resolves to any magical effect attack bonus or penalty resulting from magic currently in effect</td></tr>'
							+'	<tr><th scope="row">^^strAttkBonus^^</th><td>Resolves to the strength to-hit bonus/penalty of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^strDmgBonus^^</th><td>Resolves to the strength damage bonus/penalty of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^slashWeap^^</th><td>Resolves to 1 if the damage type of the weapon includes Slashing (or S), otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^pierceWeap^^</th><td>Resolves to 1 if the damage type of the weapon includes Piercing (or P), otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^bludgeonWeap^^</th><td>Resolves to 1 if the damage type of the weapon includes Bludgeoning (or B), otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^weapType^^</th><td>Resolves to the 3 letter damage type of the weapon (S, P, B or any combination)</td></tr>'
							+'	<tr><th scope="row">^^ACvsNoMods^^</th><td>Resolves to the targeted standard Armour Class macro call <i>@{target|Select Target|AC-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsSlash^^</th><td>Resolves to the targeted Slashing damage Armour Class macro call <i>@{target|Select Target|SlashAC-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsPierce^^</th><td>Resolves to the targeted Piercing Armour Class macro call <i>@{target|Select Target|PierceAC-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsBludgeon^^</th><td>Resolves to the targeted Bludgeoning Armour Class macro call <i>@{target|Select Target|BludgeonAC-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsNoModsTxt^^</th><td>Resolves to the text "No Mods"</td></tr>'
							+'	<tr><th scope="row">^^ACvsSlashTxt^^</th><td>If this is a slashing weapon, resolves to the text "Slash", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsPierceTxt^^</th><td>If this is a piercing weapon, resolves to the text "Pierce", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsBludgeonTxt^^</th><td>If this is a bludgeoning weapon, resolves to the text "Bludgeon", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsSTxt^^</th><td>If this is a slashing weapon, resolves to the text "S", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsPTxt^^</th><td>If this is a piercing weapon, resolves to the text "P", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsBTxt^^</th><td>If this is a slashing weapon, resolves to the text "B", otherwise resolves to an empty string</td></tr>'
							+'</table>'
							+'<br>'
							+'<table>'
							+'	<thead>'
							+'		<tr><th colspan="2">Monster Attack Templates</th><tr>'
							+'	</thead>'
							+'	<tr><th scope="row">^^attk1^^</th><td>Resolves to the name of the creature\'s attack 1, if provided (applies to monster attacks only)</td></tr>'
							+'	<tr><th scope="row">^^attk2^^</th><td>Resolves to the name of the creature\'s attack 2, if provided (applies to monster attacks only)</td></tr>'
							+'	<tr><th scope="row">^^attk3^^</th><td>Resolves to the name of the creature\'s attack 3, if provided (applies to monster attacks only)</td></tr>'
							+'	<tr><th scope="row">^^monsterCritHit^^</th><td>Resolves to the critical hit dice roll value of the creature (applies to monster/creature attacks only)</td></tr>'
							+'	<tr><th scope="row">^^monsterCritMiss^^</th><td>Resolves to the critical miss dice roll value of the creature (applies to monster/creature attacks only)</td></tr>'
							+'	<tr><th scope="row">^^monsterDmgMacro1^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Monster Ability damage 1 Macro</td></tr>'
							+'	<tr><th scope="row">^^monsterDmgMacro2^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Monster Ability damage 2 Macro</td></tr>'
							+'	<tr><th scope="row">^^monsterDmgMacro3^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Monster Ability damage 3 Macro</td></tr>'
							+'	<tr><th scope="row">^^monsterDmg1^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification for Monster attack 1, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^monsterDmg2^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification for Monster attack 2, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^monsterDmg3^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification for Monster attack 3, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'</table>'
							+'<br>'
							+'<table>'
							+'	<thead>'
							+'		<tr><th colspan="2">Melee Weapon Attack Templates</th><tr>'
							+'	</thead>'
							+'	<tr><th scope="row">^^weapAttkAdj^^</th><td>Resolves to the magical attack adjustment of the weapon</td></tr>'
							+'	<tr><th scope="row">^^weapStrHit^^</th><td>Resolves to a 1 if the character\'s strength to-hit bonus applies to this weapon, or 0 otherwise</td></tr>'
							+'	<tr><th scope="row">^^profPenalty^^</th><td>Resolves to any proficiency penalty incurred by the attacking character for using a non-proficient or related weapon</td></tr>'
							+'	<tr><th scope="row">^^specProf^^</th><td>Resolves to 1 if the attacking character is a specialist in the weapon, otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^masterProf^^</th><td>Resolves to 1 if the attacking character is a master (double specialised) in the weapon, otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^raceBonus^^</th><td>Resolves to the race bonus of the attacking character with this weapon</td></tr>'
							+'	<tr><th scope="row">^^twoWeapPenalty^^</th><td>Resolves to any penalty relevant if the attacking character is using two weapons to attack (is 0 for character classes that can use two weapons without penalty, such as rangers)</td></tr>'
							+'	<tr><th scope="row">^^weapDmgAdj^^</th><td>Resolves to the magical damage adjustment of the weapon</td></tr>'
							+'	<tr><th scope="row">^^magicDmgAdj^^</th><td>Resolves to any magical effect damage bonus or penalty resulting from magic currently in effect</td></tr>'
							+'	<tr><th scope="row">^^backstab^^</th><td>Resolves to a 1 if a backstab is being attempted, otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rogueLevel^^</th><td>Resolves to the Rogue class level of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^weapon^^</th><td>Resolves to the name of the weapon</td></tr>'
							+'	<tr><th scope="row">^^weapCritHit^^</th><td>Resolves to the critical hit dice roll value of the weapon</td></tr>'
							+'	<tr><th scope="row">^^weapCritMiss^^</th><td>Resolves to the critical miss dice roll value of the weapon</td></tr>'
							+'	<tr><th scope="row">^^weapDmgSM^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification vs. Medium and smaller opponents for the weapon, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^weapDmgL^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification vs. Large and larger opponents for the weapon, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^weapStrDmg^^</th><td>Resolves to a 1 if the character\'s strength damage bonus applies to this weapon, or 0 otherwise</td></tr>'
							+'	<tr><th scope="row">^^mwSMdmgMacro^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Melee weapon Ability damage Macro against Medium and smaller opponents</td></tr>'
							+'	<tr><th scope="row">^^mwLHdmgMacro^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Melee weapon Ability damage Macro against Large and larger opponents</td></tr>'
							+'</table>'
							+'<br>'
							+'<table>'
							+'	<thead>'
							+'		<tr><th colspan="2">Ranged Weapon Attack Templates</th><tr>'
							+'	</thead>'
							+'	<tr><th scope="row">^^weapon^^</th><td>Resolves to the name of the weapon</td></tr>'
							+'	<tr><th scope="row">^^dexMissile^^</th><td>Resolves to the dexterity missile adjustment of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^weapDexBonus^^</th><td>Resolves to a 1 if the dexterity missile bonus applies to the weapon, otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^strAttkBonus^^</th><td>Resolves to the strength to-hit bonus/penalty of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^weapStrHit^^</th><td>Resolves to a 1 if the character\'s strength to-hit bonus applies to this weapon, or 0 otherwise</td></tr>'
							+'	<tr><th scope="row">^^profPenalty^^</th><td>Resolves to any proficiency penalty incurred by the attacking character for using a non-proficient or related weapon</td></tr>'
							+'	<tr><th scope="row">^^specProf^^</th><td>Resolves to 1 if the attacking character is a specialist in the weapon, otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^masterProf^^</th><td>Resolves to 1 if the attacking character is a master (double specialised) in the weapon, otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^raceBonus^^</th><td>Resolves to the race bonus of the attacking character with this weapon</td></tr>'
							+'	<tr><th scope="row">^^twoWeapPenalty^^</th><td>Resolves to any penalty relevant if the attacking character is using two weapons to attack (is 0 for character classes that can use two weapons without penalty, such as rangers)</td></tr>'
							+'	<tr><th scope="row">^^weapDmgAdj^^</th><td>Resolves to the magical damage adjustment of the weapon</td></tr>'
							+'	<tr><th scope="row">^^rangeMod^^</th><td>Resolves to the range attack modifier</td></tr>'
							+'	<tr><th scope="row">^^rangeN^^</th><td>Resolves to 1 if the range is "Near", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rangePB^^</th><td>Resolves to 1 if the range is "Point Blank", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rangeS^^</th><td>Resolves to 1 if the range is "Short", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rangeM^^</th><td>Resolves to 1 if the range is "Medium", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rangeL^^</th><td>Resolves to 1 if the range is "Long", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rangeF^^</th><td>Resolves to 1 if the range is "Far", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^rangeSMLF^^</th><td>Resolves to 1 if the range is not "Near" or "Point Blank", otherwise 0</td></tr>'
							+'	<tr><th scope="row">^^ammoDmgAdj^^</th><td>Resolves to the magical damage adjustment of the selected ammunition of the ranged weapon</td></tr>'
							+'	<tr><th scope="row">^^magicDmgAdj^^</th><td>Resolves to any magical effect damage bonus or penalty resulting from magic currently in effect</td></tr>'
							+'	<tr><th scope="row">^^strDmgBonus^^</th><td>Resolves to the strength damage bonus/penalty of the attacking character</td></tr>'
							+'	<tr><th scope="row">^^weapCritHit^^</th><td>Resolves to the critical hit dice roll value of the weapon</td></tr>'
							+'	<tr><th scope="row">^^weapCritMiss^^</th><td>Resolves to the critical miss dice roll value of the weapon</td></tr>'
							+'	<tr><th scope="row">^^ACvsNoModsMissile^^</th><td>Resolves to the targeted Armour Class vs missiles macro call <i>@{target|Select Target|ACmissile-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsSlashMissile^^</th><td>Resolves to the targeted Slashing damage Armour Class vs missiles macro call <i>@{target|Select Target|SlashACmissile-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsPierceMissile^^</th><td>Resolves to the targeted Piercing Armour Class vs missiles macro call <i>@{target|Select Target|PierceACmissile-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsBludgeonMissile^^</th><td>Resolves to the targeted Bludgeoning Armour Class vs missiles macro call <i>@{target|Select Target|BludgeonACmissile-field}</i> vs. a targeted opponent (only used in targeted attacks)</td></tr>'
							+'	<tr><th scope="row">^^ACvsNoModsMissileTxt^^</th><td>Resolves to the text "No Mods"</td></tr>'
							+'	<tr><th scope="row">^^ACvsSlashMissileTxt^^</th><td>If this is a slashing weapon, resolves to the text "Slash", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsPierceMissileTxt^^</th><td>If this is a piercing weapon, resolves to the text "Pierce", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsBludgeonMissileTxt^^</th><td>If this is a bludgeoning weapon, resolves to the text "Bludgeon", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsSmissileTxt^^</th><td>If this is a slashing weapon, resolves to the text "S", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsPmissileTxt^^</th><td>If this is a piercing weapon, resolves to the text "P", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ACvsBmissileTxt^^</th><td>If this is a slashing weapon, resolves to the text "B", otherwise resolves to an empty string</td></tr>'
							+'	<tr><th scope="row">^^ammoDmgSM^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification vs. Medium and smaller opponents for the ammunition used, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^ammoDmgL^^</th><td>Depending on if the Player chose for Roll20 to roll the damage dice or to roll their own dice, resolves to one of (a) the damage dice specification vs. Large and larger opponents for the ammunition used, or (b) a Roll Query requesting the Player to enter a dice roll result</td></tr>'
							+'	<tr><th scope="row">^^ammoStrDmg^^</th><td>Resolves to a 1 if the character\'s strength damage bonus applies to the selected ammunition, or 0 otherwise</td></tr>'
							+'	<tr><th scope="row">^^ammoLeft^^</th><td>Resolves to the quantity of the selected ammunition left after this attack</td></tr>'
							+'	<tr><th scope="row">^^rwSMdmgMacro^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Ranged weapon Ability damage Macro against Medium and smaller opponents</td></tr>'
							+'	<tr><th scope="row">^^rwLHdmgMacro^^</th><td>Resolves to the correct Ability Macro name to use in an API button or macro call to run the matching Ranged weapon Ability damage Macro against Large and larger opponents</td></tr>'
							+'</table>'
							+'<br>'
							+'<h2>5. Character (PC & NPC) Attack Templates</h2>'
							+'<p>As previously described, the Attacks Database contains Attack Templates as Ability Macro entries on the <i>Attributes and Abilities</i> tab of a Character Sheet.  For Characters and NPCs that attack using weapons "in-hand" (see AttackMaster API documentation for information on taking weapons "in-hand"), four standard Attack Templates are required: -ToHit; -DmgSM; -DmgL; and -Targeted-Attk.</p>'
							+'<h3>5.1 The "To Hit" Template</h3>'
							+'<p>The standard <i>To Hit</i> Attack Template looks like this:</p>'
							+'<h4>MW-ToHit</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^ </b>&{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> Attacks with their <b>^^weapon^^</b>}}<mark style="color:green">Specs=[MWtoHit,AttackMacro,1d20,Attack]</mark>{{Hits AC=[[([[<b>^^thac0^^</b>]][Thac0])-([[(([[<b>^^weapAttkAdj^^</b>]][Weapon+])+([[(<b>^^strAttkBonus^^</b> * <b>^^weapStrHit^^</b>)]][Strength+])+([[<b>^^profPenalty^^</b>]][Prof Penalty]+[[<b>^^specProf^^</b>]][Specialist]+[[<b>^^masterProf^^</b>*3]][Mastery])+([[<b>^^raceBonus^^</b>]][Race mod])+([[<b>^^magicAttkAdj^^</b>]][Magic hit adj])+([[<b>^^twoWeapPenalty^^</b>]][2-weap penalty]))]][Adjustments])-<b>^^toHitRoll^^</b>cs\><b>^^weapCritHit^^</b>cf\<<b>^^weapCritMiss^^</b>]]<br>'
							+'<b>^^ACvsSlashTxt^^</b> <b>^^ACvsPierceTxt^^</b> <b>^^ACvsBludgeonTxt^^</b> attack}}{{Total Adjustments=[[(([[<b>^^weapAttkAdj^^</b>]][Weapon+])+([[(<b>^^strAttkBonus^^</b> * <b>^^weapStrHit^^</b>)]][Strength+])+([[<b>^^profPenalty^^</b>]][Prof Penalty]+[[<b>^^specProf^^</b>]][Specialist]+[[<b>^^masterProf^^</b>*3]][Mastery])+([[<b>^^raceBonus^^</b>]][Race mod])+([[<b>^^magicAttkAdj^^</b>]][Magic hit adj])+([[<b>^^twoWeapPenalty^^</b>]][2-weap penalty]))]]}}<br>'
							+'<b>^^toWho^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=Do Damage?}}{{desc=If successfully hit<br>'
							+'[TSM Damage](~<b>^^mwSMdmgMacro^^</b>) or [LH Damage](~<b>^^mwLHdmgMacro^^</b>)}}</p>'
							+'<p>As with all RPGMaster database items, the Attack Templatre has a <i>Specs</i> section:</p>'
							+'<pre>Specs=[MWtoHit,AttackMacro,1d20,Attack]</pre>'
							+'<p>The four fields in the <i>Specs</i> data are the standard four used in all Specs fields: Entry Type (MWtoHit), Entry Class (AttackMacro), Handedness (in this case replaced by toHit dice roll spec 1d20), and Entry Supertype (Attack).  The key field to note here is the <b>ToHit Dice Roll Specification</b> (which replaces the <i>Handedness</i> field).  This can be any valid dice roll, and will be used for the <i>^^toHitRoll^^</i> template field if the Player selects Roll20 to roll the attack dice.</p>'
							+'<p>This Attack Template is formatted using a Roll20 Roll Template with a type specified using the <i>^^defaultTemplate^^</i> template field, but need not be - formatting is up to the creator of the Attack Template.  It is important this information is displayed to the right people - Players that control a character, all Players as a public post, or just the DM for attacks by creatures & NPCs.  The <i>^^toWhoPublic^^</i> template field will check if the attacking token represents a Character/NPC/Creature controlled by a Player and, if so, make a public post that all can see, but otherwise just whisper the results of the attack to the DM only.  Similarly, <i>^^toWho^^</i> will whisper the attack information either only to the Player(s) that control the attacking character/creature or, if no one does, then to the DM.</p>'
							+'<p>The rest of the Attack Template defines the calculations using the API supplied data to display the Armour Class value that would be successfully hit by the attacking character, with the selected weapon under the current conditions.  It also defines a display of the adjustments that are made to the dice roll which the Players and DM can hover a mouse over to get an explanation of the calculations.  All the calculations and tag display are standard Roll20 functionality, so once the Attack Template Data Fields are replaced by actual values by the API and the resulting Ability Macro saved to the attacking character\'s Character Sheet, running it like any other Ability Macro will use only Roll20 functionality, and not involve use of the APIs.</p>'
							+'<p>The Attack Template shown above is a To Hit template for a Melee weapon attack.  That for a Ranged weapon attack is very similar, just using some different and ranged attack related Template Fields.</p>'
							+'<h3>5.2 The "Damage" Templates</h3>'
							+'<p>There are always two damage Attack Templates to go with each <i>To Hit</i> Template, typically one for damage to Medium and smaller opponents and one for Large and larger.  However, as will be seen when discussing the <i>Oil Flask</i> bespoke Attack Templates below, those are not always the outcomes of the two damage Templates.  However, they <i>do</i> always start with MW-DmgSM and MW-DmgL for Melee weapon attacks, and RW-DmgSM and RW-DmgL for Ranged weapon attacks (optionally followed by a race, class or weapon name). The standard <i>Damage</i> Attack Template looks like this:</p>'
							+'<h4>MW-DmgSM</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> does damage with their <b>^^weapon^^</b>}}<mark style="color:green">Specs=[MWdmgSM,AttackMacro,1d20,Attack]</mark>{{Damage vs TSM=[[([[ ([[<b>^^weapDmgSM^^</b>]][Dice Roll])+([[<b>^^strDmgBonus^^</b>*<b>^^weapStrDmg^^</b>]][Strength+])+([[<b>^^weapDmgAdj^^</b>]][weapon+])+([[<b>^^magicDmgAdj^^</b>]][Magic dmg adj])+([[<b>^^specProf^^</b>*2]][Specialist+]+[[<b>^^masterProf^^</b>*3]][Mastery+])]][Adjustments])]] HP}}{{Total Plusses=[[[[<b>^^strDmgBonus^^</b>*<b>^^weapStrDmg^^</b>]][Strength+]+([[<b>^^weapDmgAdj^^</b>]][weapon+])+([[<b>^^magicDmgAdj^^</b>]][Magic dmg adj])+([[<b>^^specProf^^</b>*2]][Specialist+]+[[<b>^^masterProf^^</b>*3]][Mastery+])]]}}</p>'
							+'<p>The damage Attack Template works in the same way as the other Attack Templates as explained above for the <i>ToHit</i> template.  While the <i>Specs</i> data includes the "To Hit" dice roll specification, this is not used in the damage Template, and is irrelevant.  That field just needs to hold something, and a dice roll specification is what is expected.  Hopefully, the rest of this damage Attack Template is self explanatory.</p>'
							+'<h2>6. Monster Attack Templates</h2>'
							+'<p>If a creature specified as a Monster on the Character Sheet uses in-hand weapons, as supported under the RPGMaster APIs, attacks with those weapons (Melee or Ranged) will use the standard <i>To Hit</i> and <i>Damage</i> Attack Templates described above.  However, attacks by creatures that are specified on the Monster tab of the Advanced 2nd Edition character sheet, and under AD&D 2nd Edition rules, are much simpler than character attacks with in-hand weapons.  The differences mean that such creatures require different Attack Templates.  Attacks specified on the Monster tab use the Monster Attack Templates: Mon-Attk1, Mon-Attk2, Mon-Attk3, and Mon-Dmg1, Mon-Dmg2, Mon-Dmg3 (or the Targeted Attack Templates, see later).  Remember that the AttackMaster API supports an extension of the Monster Attk fields on the Advanced 2nd Edition Character Sheet: each can contain a comma-separated list consisting of "attack name","dice roll","speed in segments" (see AttackMaster Help for details).</p>'
							+'<p>The Monster Attack and Damage Templates look like this:</p>'
							+'<h4>Mon-Attk1</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> attacks with their <b>^^attk1^^</b>}}<mark style="color:green">Specs=[MonAttk1,AttackMacro,1d20,Attack]</mark>{{Hits AC=[[ ( ([[<b>^^thac0^^</b>]][Thac0]) - ([[<b>^^magicAttkAdj^^</b>]][Magic hit adj]) - <b>^^toHitRoll^^</b>cs\><b>^^monsterCritHit^^</b>cf\<<b>^^monsterCritMiss^^</b> )]]}}<br>'
							+'<b>^^toWho^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~<b>^^monsterDmgMacro1^^</b>)}}</p>'
							+'<br>'
							+'<h4>Mon-Dmg1</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> does damage with their <b>^^attk1^^</b>}}<mark style="color:green">Specs=[MonDmg1,AttackMacro,1d20,Attack]</mark>{{Damage=[[(([[<b>^^monsterDmg1^^</b>]][<b>^^attk1^^</b> Dmg])+([[<b>^^magicDmgAdj^^</b>]][Added Magic Dmg]))]] HP}}</p>'
							+'<p>Unsurprisingly, these work in exactly the same way as other Attack Templates.</p>'
							+'<br>'
							+'<h2>7. Targeted Attack Templates</h2>'
							+'<p>The AttackMaster API supports the DM (and optionally, Players) using "targeted attacks".  This is an attack that prompts the DM / Player to select a target token, and then performs all attack and damage dice rolls at the same time, displaying the attack results alongside the Armour Class and Hit Points of the targeted opponent.  This speeds the attack process even further than having the API do all the attack calculations.  <b>Note:</b> the results of the attack <i>are not</i> applied to the targeted opponent - the results are still open to interpretation by the Players and DM, and circumstantial adjustment before manually applying them to the Token / Character Sheet of the opponent.</p>'
							+'<p>The Ranged weapon Attack Template looks like this:</p>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWho^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> Attacks @{Target|Select Target|Token_name} with their <b>^^weapon^^</b>}}<mark style="color:green">Specs=[RWtargetedAttk,AttackMacro,1d20,Attack]</mark>{{Hits AC=[[([[<b>^^thac0^^</b>]][Thac0])-(([[<b>^^weapAttkAdj^^</b>]][Weapon+]) + ([[<b>^^ammoDmgAdj^^</b>]][Ammo+]) + ([[ <b>^^weapDexBonus^^</b>*[[<b>^^dexMissile^^</b>]]]][Dexterity+] )+([[[[<b>^^strAttkBonus^^</b>]]*[[<b>^^weapStrHit^^</b>]]]][Strength+])+([[<b>^^raceBonus^^</b>]][Race mod])+([[<b>^^profPenalty^^</b>]][Prof penalty])+([[<b>^^magicAttkAdj^^</b>]][Magic Hit+])+([[<b>^^twoWeapPenalty^^</b>]][2-weap penalty])+([[<b>^^rangeMod^^</b>]][Range mod]))-<b>^^toHitRoll^^</b>cs\><b>^^weapCritHit^^</b>cf\<<b>^^weapCritMiss^^</b> ]] }}{{Target AC=<b>^^ACvsNoModsTxt^^</b>:<b>^^ACvsNoModsMissile^^</b><br>'
							+'<b>^^ACvsSlashMissileTxt^^</b>:<b>^^ACvsSlashMissile^^</b> <b>^^ACvsPierceMissileTxt^^</b>:<b>^^ACvsPierceMissile^^</b> <b>^^ACvsBludgeonMissileTxt^^</b>:<b>^^ACvsBludgeonMissile^^</b>}}{{Damage if hit SM=[[ floor( [[<b>^^ammoDmgSM^^</b>]][Dice roll] * [[(<b>^^rangeN^^</b>*0.5)+(<b>^^rangePB^^</b>*(1+<b>^^masterProfPB^^</b>))+(<b>^^rangeSMLF^^</b>*1)]]) + ([[<b>^^rangePB^^</b>*<b>^^masterProfPB^^</b>*2]])+ (([[<b>^^ammoDmgAdj^^</b>]][Ammo+])+([[<b>^^magicDmgAdj^^</b>]][Magic dmg+]) +([[<b>^^strDmgBonus^^</b>*<b>^^ammoStrDmg^^</b>]][Strength+])) ]]HP}}{{Damage if hit LH=[[ floor( [[<b>^^ammoDmgL^^</b>]][Dice roll] * [[(<b>^^rangeN^^</b>*0.5)+(<b>^^rangePB^^</b>*(1+<b>^^masterProfPB^^</b>))+(<b>^^rangeSMLF^^</b>*1)]]) + ([[<b>^^rangePB^^</b>*<b>^^masterProfPB^^</b>*2]]) + (([[<b>^^ammoDmgAdj^^</b>]][Ammo+])+([[<b>^^magicDmgAdj^^</b>]][Magic dmg+]) +([[<b>^^strDmgBonus^^</b>*<b>^^ammoStrDmg^^</b>]][Strength+])) ]]HP}}{{Target HP=<b>^^targetHPfield^^</b> HP}}{{Ammo left=<b>^^ammoLeft^^</b>}}</p>'
							+'<p>The key difference, other than doing all of the calculations for the Armour Class hit and both the damage for Medium and smaller and Large and larger, is that several of the Template Fields used resolve to appropriately formatted Roll20 <i>@{target|...}</i> entries, that will display values from the targeted opponent\'s token and/or character sheet.  The API searches for the most appropriate token and character sheet fields to resolve the targeted Template Fields to (it searches the attacking creature\'s data, and assumes all tokens are set up the same way): if using the standard RPGMaster token settings (as set by the <b>CommandMaster API --abilities</b> command or [Token Setup] DM\'s Macro button) it will find the data it needs on the token; otherwise it will first search other token fields, then standard Character Sheet character tab fields, then Character Sheet monster tab fields.  If the API can\'t find AC or HP data, it will display appropriate text saying the data was not found, but will not cause an error.  Thus it is sensible to use these Template Fields rather than statically defined <i>@{target|...}</i> commands.</p>'
							+'<br>'
							+'<h2>8. Bespoke / Custom Attack Templates</h2>'
							+'<p>All of the above examples and discussion have explored the standard Attack Templates distributed with the AttackMaster API.  It will be the case that this will cater for around 95% of attacks and attack-like situations (e.g. there is a weapon called "Touch" which Spell Casters can use for touch-attack spells, which uses the standard Attack Templates without change to achieve the needed outcome).  However, for that other 5% (or perhaps closer to 1%) of special cases you can define your own bespoke or custom Attack Templates.  Being able to change the way attacks are calculated is also essential if you wish to adapt the API to work for game systems other than Advanced Dungeons & Dragons 2nd Edition.</p>'
							+'<p>As stated in Section 1, you <i>should not</i> add Attack Templates to the <i>Attacks-DB</i> database directly as, when updates are released, the whole database will be overwritten and your additions will be lost.  Instead, create your own Character Sheet named <i>Attack-DB-[any-name-you-want]</i> and add Attack Templates to it. If you want to replace the Attack Templates provided for Melee weapons, Ranged weapons and/or Monster attacks, just create ones in your added database with the same Ability Macro name and they will automatically be used in preference to the standard versions.</p>'
							+'<p>As also mentioned previously, while Attack Templates are always called with names of the format given in Section 3, they do not have to result in standard attacks or damage - the calculations and resulting information provided to players can be whatever is needed as a result of that attack action.  An example of this is included in the distributed <i>Attacks-DB</i>, the <b>Oil Flask Attack Template set</b>:</p>'
							+'<h4>RW-ToHit-Oil-Flask</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> throws a prepared oil flask}}<mark style="color:green">Specs=[RWtoHit,AttackMacro,1d20,Attack]</mark>{{Hits AC=[[([[<b>^^thac0^^</b>]][Thac0])-([[([[<b>^^weapAttkAdj^^</b>]][Weapon+]) + ([[<b>^^ammoDmgAdj^^</b>]][Ammo+]) + ([[ <b>^^weapDexBonus^^</b>*[[<b>^^dexMissile^^</b>]]]][Dexterity+] )+([[[[<b>^^strAttkBonus^^</b>]]*[[<b>^^weapStrHit^^</b>]]]][Strength+])+([[<b>^^raceBonus^^</b>]][Race mod])+([[<b>^^profPenalty^^</b>]][Prof penalty])+([[<b>^^</b>magicAttkAdj^^</b>]][Magic Hit+])+([[<b>^^twoWeapPenalty^^</b>]][2-weap penalty])+([[<b>^^rangeMod^^</b>]][Range mod])]][Adjustments])-<b>^^toHitRoll^^</b>cs\><b>^^weapCritHit^^</b>cf\<<b>^^weapCritMiss^^</b> ]]<br>'
							+'<b>^^ACvsSlashMissileTxt^^</b> <b>^^ACvsPierceMissileTxt^^</b> <b>^^ACvsBludgeonMissileTxt^^</b> attack}}{{Total Adjustments=[[([[<b>^^weapAttkAdj^^</b>]][Weapon+]) + ([[<b>^^ammoDmgAdj^^</b>]][Ammo+]) + ([[ <b>^^weapDexBonus^^</b>*[[<b>^^dexMissile^^</b>]]]][Dexterity+] )+([[[[<b>^^strAttkBonus^^</b>]]*[[<b>^^weapStrBonus^^</b>]]]][Strength+])+([[<b>^^raceBonus^^</b>]][Race mod])+([[<b>^^profPenalty^^</b>]][Prof penalty])+([[<b>^^magicAttkAdj^^</b>]][Magic Hit+])+([[<b>^^twoWeapPenalty^^</b>]][2-weap penalty])+([[<b>^^rangeMod^^</b>]][Range mod])]]}}{{Ammo left=<b>^^ammoLeft^^</b>}}<br>'
							+'<b>^^toWho^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=Do Damage?}}{{desc=Select the appropriate result<br>'
							+'[Direct hit](~<b>^^rwSMdmgMacro^^</b>) or [Grenade/Splash](~<b>^^rwLHdmgMacro^^</b>)}}</p>'
							+'<p>The <i>To Hit</i> Attack Template is very similar to a normal Ranged weapon Attack Template, except that instead of API buttons indicating damage rolls vs. different sized opponents, it provides one API button to select a [Direct Hit], and another selecting a [Grenade/Splash] outcome.  Each of these still calls the same damage Attack Templates using the Template Fields provided but in this case, because the attack is with a weapon called <i>Oil Flask</i>, the Template Fields will resolve to calls to <b>RW-DmgSM-Oil-Flask</b> and <b>RW-DmgL-Oil-Flask</b> respectively, and these custom Attack Templates do damage in a very different way to a normal Ranged Weapon attack.</p>'
							+'<h4>RW-DmgSM-Oil-Flask</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b>\'s oil flask scores a direct hit}}<mark style="color:green">Specs=[RWdmgSM,AttackMacro,1d20,Attack]</mark>{{subtitle=Fire damage}}{{Round 1=Fire damage [[2d6]]}}{{Round 2=Will be rolled next round}}<br>'
							+'!rounds --aoe @{target|Who\'s the target?|token_id}|circle|feet|0|7|0|fire|true --target single|@{selected|token_id}|@{target|Who\'s the target?|token_id}|Oil-fire|1|-1|Taking fire damage from burning oil|three-leaves</p>'
							+'<p>The <i>Oil Flask</i> version of the <i>RW-DmgSM</i> Attack Template caters for damage done by an Oil Flask successfully scoring a direct hit on an opponent.  This results in a damage dice roll for this round of 2d6 with no modifiers, and then also makes an API call to the <b>RoundMaster API</b> with two stacked commands: an Area of Effect call to place fire on the opponent\'s token, and a Target call to add a status to the opponent\'s token which will last 2 rounds, causing a Status Effect to run in the second round to prompt for another damage roll of 1d6.</p>'
							+'<h4>RW-DmgL-Oil-Flask</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWhoPublic^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b>\'s oil flask smashes in a ball of flame}}<mark style="color:green">Specs=[RWdmgL,AttackMacro,1d20,Attack]</mark>{{subtitle=Fire damage}}{{Location=Drag the crosshair to where the oil flask smashed}}{{Splash=Those splashed take [[ceil([[1d6]]/2)]]HP fire damage}}<br>'
							+'!rounds --aoe <b>^^tid^^</b>|circle|feet|[[(<b>^^rangeN^^</b>*5)+(<b>^^rangePB^^</b>*10)+(<b>^^rangeS^^</b>*10)+(<b>^^rangeM^^</b>*20)+(<b>^^rangeL^^</b>*30)+(<b>^^rangeF^^</b>*30)-5]]|4|0|fire</p>'
							+'<p>The <i>Oil Flask</i> version of the <i>RW-DmgL</i> Attack Template caters for an Oil Flask that either missed its intended target, or is deliberately used as a grenade-like missile.  This results in a dice roll of 1d3 splash damage to anyone in the area of effect, which is shown using a call to the <b>RoundMaster API</b> Area of Effect command which this time can be positioned where the oil flask landed.</p>'
							+'<h4>RW-Targeted-Attk-Oil-Flask</h4>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"><b>^^toWho^^</b> &{template:<b>^^defaultTemplate^^</b>}{{name=<b>^^tname^^</b> throws a prepared oil flask at @{Target|Select Target|Token_name}}}<mark style="color:green">Specs=[RWtargetedAttk,AttackMacro,1d20,Attack]</mark>{{Hits AC=[[([[<b>^^thac0^^</b>]][Thac0])-(([[<b>^^weapAttkAdj^^</b>]][Weapon+]) + ([[<b>^^ammoDmgAdj^^</b>]][Ammo+]) + ([[ <b>^^weapDexBonus^^</b>*[[<b>^^dexMissile^^</b>]]]][Dexterity+] )+([[[[<b>^^strAttkBonus^^</b>]]*[[<b>^^weapStrHit^^</b>]]]][Strength+])+([[<b>^^raceBonus^^</b>]][Race mod])+([[<b>^^profPenalty^^</b>]][Prof penalty])+([[<b>^^magicAttkAdj^^</b>]][Magic Hit+])+([[<b>^^twoWeapPenalty^^</b>]][2-weap penalty])+([[<b>^^rangeMod^^</b>]][Range mod]))-<b>^^toHitRoll^^</b>cs\\gt<b>^^weapCritHit^^</b>cf\\lt<b>^^weapCritMiss^^</b> ]] }}{{Target AC=<b>^^ACvsNoModsTxt^^</b>:<b>^^ACvsNoModsMissile^^</b><br>'
							+'<b>^^ACvsSlashMissileTxt^^</b>:<b>^^ACvsSlashMissile^^</b> <b>^^ACvsPierceMissileTxt^^</b>:<b>^^ACvsPierceMissile^^</b> <b>^^ACvsBludgeonMissileTxt^^</b>:<b>^^ACvsBludgeonMissile^^</b>}}{{ =Direct Hit}}{{Target=[Direct hit on target](!rounds --aoe @{Target|Select Target|token_id}|circle|feet|0|6|0|fire|true --target single|@{selected|token_id}|@{Target|Select Target|token_id}|Oil-fire|1|-1|Taking fire damage from burning oil|three-leaves)}}{{Dmg Round 1=[[2d6]]HP fire damage}}{{Dmg Round 2=Roll next round}}{{. =Splash Damage}}{{Location=[Select where flask smashed](!rounds --aoe <b>^^tid^^</b>|circle|feet|[[(<b>^^rangeN^^</b>*5)+(<b>^^rangePB^^</b>*10)+(<b>^^rangeS^^</b>*10)+(<b>^^rangeM^^</b>*20)+(<b>^^rangeL^^</b>*30)+(<b>^^rangeF^^</b>*30)-5]]|4|0|fire)}}{{Damage=[[ceil([[1d6]]/2)]]HP fire damage}}{{Target HP=<b>^^targetHPfield^^</b> HP}}{{Ammo left=<b>^^ammoLeft^^</b>}}</p>'
							+'<p>The <i>Oil Flask</i> version of the <i>RW-Targeted-Attk</i> Attack Template combines the functions and calculations of the other Oil Flask custom Attack Templates in a single result display, with appropriate API buttons to implement the various outcomes of the attack.</p>'
							+'<p>Similar or entirely different custom Attack Templates can be created for other individual weapons with non-standard attack outcomes, or for individual classes of character, creatures, or races.  Just use the Attack Template naming conventions described in Section 3, and add them to your own Attack Databases as described in Section 1, and you can give Players more interesting situations and means of dealing with them.  When combined with the features and capabilities of the RoundMaster API and other APIs of the RPGMaster suite, the possibilities are endless!</p>'
							+'</div>',
						},
	});
	

	const miTypeLists = Object.freeze({
		miscellaneous:	{type:'miscellaneous',field:fields.ItemMiscList},
		protectioncloak:{type:'miscellaneous',field:fields.ItemMiscList},
		light:			{type:'miscellaneous',field:fields.ItemMiscList},
		weapon:			{type:'weapon',field:fields.ItemWeaponList},
		melee:			{type:'weapon',field:fields.ItemWeaponList},
		innatemelee:	{type:'weapon',field:fields.ItemWeaponList},
		ranged:			{type:'weapon',field:fields.ItemWeaponList},
		innateranged:	{type:'weapon',field:fields.ItemWeaponList},
		ammo:			{type:'weapon',field:fields.ItemWeaponList},
		armour:			{type:'armour',field:fields.ItemArmourList},
		shield:			{type:'armour',field:fields.ItemArmourList},
		ring:			{type:'ring',field:fields.ItemRingList},
		protectionring:	{type:'ring',field:fields.ItemRingList},
		potion:			{type:'potion',field:fields.ItemPotionList},
		scroll:			{type:'scroll',field:fields.ItemScrollList},
		rod:			{type:'rod',field:fields.ItemWandsList},
		staff:			{type:'rod',field:fields.ItemWandsList},
		wand:			{type:'rod',field:fields.ItemWandsList},
		dmitem:			{type:'dmitem',field:fields.ItemDMList},
		attackmacro:	{type:'attack',field:fields.ItemAttacksList},
	});
	
	const clTypeLists = Object.freeze({
		warriorclass:	{type:'warrior',field:fields.ClassWarriorList},
		warriorhrclass:	{type:'warrior',field:fields.ClassWarriorList},
		warriorkitclass:{type:'warrior',field:fields.ClassWarriorList},
		wizardclass:	{type:'wizard',field:fields.ClassWizardList},
		wizardhrclass:	{type:'wizard',field:fields.ClassWizardList},
		wizardkitclass:	{type:'wizard',field:fields.ClassWizardList},
		priestclass:	{type:'priest',field:fields.ClassPriestList},
		priesthrclass:	{type:'priest',field:fields.ClassPriestList},
		priesthoodclass:{type:'priest',field:fields.ClassPriestList},
		priestkitclass:	{type:'priest',field:fields.ClassPriestList},
		rogueclass:		{type:'rogue',field:fields.ClassRogueList},
		roguehrclass:	{type:'rogue',field:fields.ClassRogueList},
		roguekitclass:	{type:'rogue',field:fields.ClassRogueList},
		psionclass:		{type:'psion',field:fields.ClassPsionList},
		psionhrclass:	{type:'psion',field:fields.ClassPsionList},
		psionkitclass:	{type:'psion',field:fields.ClassPsionList},
		creatureclass:	{type:'creature',field:fields.ClassCreatureList},
	});
	
	const spTypeLists = {
		muspelll1:		{type:'muspelll1',field:['spellmem','current']},
		muspelll2:		{type:'muspelll2',field:['spellmem2','current']},
		muspelll3:		{type:'muspelll3',field:['spellmem3','current']},
		muspelll4:		{type:'muspelll4',field:['spellmem4','current']},
		muspelll5:		{type:'muspelll5',field:['spellmem30','current']},
		muspelll6:		{type:'muspelll6',field:['spellmem5','current']},
		muspelll7:		{type:'muspelll7',field:['spellmem6','current']},
		muspelll8:		{type:'muspelll8',field:['spellmem7','current']},
		muspelll9:		{type:'muspelll9',field:['spellmem8','current']},
		muspelll0:		{type:'muspelll0',field:['spellmem20','current']},
		prspelll1:		{type:'prspelll1',field:['spellmem10','current']},
		prspelll2:		{type:'prspelll2',field:['spellmem11','current']},
		prspelll3:		{type:'prspelll3',field:['spellmem12','current']},
		prspelll4:		{type:'prspelll4',field:['spellmem13','current']},
		prspelll5:		{type:'prspelll5',field:['spellmem14','current']},
		prspelll6:		{type:'prspelll6',field:['spellmem15','current']},
		prspelll7:		{type:'prspelll7',field:['spellmem16','current']},
		prspelll0:		{type:'prspelll0',field:['spellmem17','current']},
		power:			{type:'power',    field:['spellmem23','current']},
		itempower:		{type:'itempower',field:['spellmem21','current']},
		itemspell:		{type:'itemspell',field:['spellmem22','current']},
	};
	
	const reIgnore = /[\s\-\_\(\)]*/gi;
	
	const	replacers = [
			[/\\lbrc/g, "{"],
			[/\\rbrc/g, "}"],
			[/\\gt/gm, ">"],
			[/\\lt/gm, "<"],
			[/<<|«/g, "["],
			[/\\lbrak/g, "["],
			[/>>|»/g, "]"],
			[/\\rbrak/g, "]"],
			[/\^/g, "?"],
			[/\\ques/g, "?"],
			[/`/g, "@"],
			[/\\at/g, "@"],
			[/~/g, "-"],
			[/\\dash/g, "-"],
			[/\\n/g, "\n"],
			[/¦/g, "|"],
			[/\\vbar/g, "|"],
			[/\\clon/g, ":"],
			[/\\amp/g, "&"],
		];
		
	const dbReplacers = [
			[/\\amp/gm, "&"],
			[/\\lbrak/gm, "["],
			[/\\rbrak/gm, "]"],
			[/\\ques/gm, "?"],
			[/\\at/gm, "@"],
			[/\\dash/gm, "-"],
			[/\\n/gm, "\n"],
			[/\\vbar/gm, "|"],
			[/\\clon/gm, ":"],
			[/\\gt/gm, ">"],
			[/\\lt/gm, "<"],
		];

	const classLevels = [[fields.Fighter_class,fields.Fighter_level],
					   [fields.Wizard_class,fields.Wizard_level],
					   [fields.Priest_class,fields.Priest_level],
					   [fields.Rogue_class,fields.Rogue_level],
					   [fields.Psion_class,fields.Psion_level],
					   [fields.Fighter_class,fields.Monster_hitDice]];
	
	const rangedWeapMods = Object.freeze({
		N	: -5,
		PB	: 2,
		S	: 0,
		M	: -2,
		L	: -5,
		F	: -20,
	});
	
	var saveLevels = {
		warrior: 	[0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9],
		wizard:		[0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5],
		priest:		[0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7],
		rogue:		[0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6],
		psion:		[0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6],
	};
	
	var baseSaves = {
		warrior:	[[16,18,17,20,19],[14,16,15,17,17],[13,15,14,16,16],[11,13,12,13,14],[10,12,11,12,13],[8,10,9,9,11],[7,9,8,8,10],[5,7,6,5,8],[4,6,5,4,7],[3,5,4,4,6]],
		wizard:		[[16,18,17,20,19],[14,11,13,15,12],[13,9,11,13,10],[11,7,9,11,8],[10,5,7,9,6],[8,3,5,7,4]],
		priest:		[[16,18,17,20,19],[10,14,13,16,15],[9,13,12,15,14],[7,11,10,13,12],[6,10,9,12,11],[5,9,8,11,10],[4,8,7,10,9],[2,6,5,8,7]],
		rogue:		[[16,18,17,20,19],[13,14,12,16,15],[12,12,11,15,13],[11,10,10,14,11],[10,8,9,13,9],[9,6,8,12,7],[8,4,7,11,5]],
		psion:		[[16,18,17,20,19],[13,15,10,16,15],[12,13,9,15,14],[11,11,8,13,12],[10,9,7,12,7],[9,7,6,11,9],[8,5,5,9,7]],
	};
	
	var classSaveMods = {
		undefined:	{par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		paladin:	{par:2,poi:2,dea:2,rod:2,sta:2,wan:2,pet:2,pol:2,bre:2,spe:2},
	};
	
	var raceSaveMods = {
		dwarf:		{att:'con',par:0,poi:3.5,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},
		elf:		{att:'con',par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		gnome:		{att:'con',par:0,poi:0,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},
		halfelf:	{att:'con',par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		halfling:	{att:'con',par:0,poi:3.5,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},
		halforc:	{att:'con',par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		human:		{att:'con',par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
	};
	
	const defaultNonProfPenalty=[[fields.Fighter_class,fields.Fighter_level,-2],
								[fields.Wizard_class,fields.Wizard_level,-5],
								[fields.Priest_class,fields.Priest_level,-3],
								[fields.Rogue_class,fields.Rogue_level,-3],
								[fields.Psion_class,fields.Psion_level,-4]];
							  
	var classNonProfPenalty = {};
	
	const raceToHitMods = Object.freeze({
		elf: [['bow',1],['longsword',1],['shortsword',1]],
		halfling: [['sling',1],['thrown-blade',1]],
	});
	
	const classAllowedWeaps = Object.freeze({
		warrior: ['any'],
		fighter: ['any'],
		ranger: ['any'],
		paladin: ['any'],
		beastmaster: ['any'],
		barbarian: ['any'],
		defender: ['axe','clubs','flails','longblade','fencingblade','mediumblade','shortblade','polearm'],
		wizard: ['dagger','staff','dart','knife','sling'],
		mage: ['dagger','staff','dart','knife','sling'],
		mu: ['dagger','staff','dart','knife','sling'],
		abjurer: ['dagger','staff','dart','knife','sling'],
		conjurer: ['dagger','staff','dart','knife','sling'],
		diviner: ['dagger','staff','dart','knife','sling'],
		enchanter: ['dagger','staff','dart','knife','sling'],
		illusionist: ['dagger','staff','dart','knife','sling'],
		invoker: ['dagger','staff','dart','knife','sling'],
		necromancer: ['dagger','staff','dart','knife','sling'],
		transmuter: ['dagger','staff','dart','knife','sling'],
		priest:	['clubs','hammer','staff'],
		cleric:	['clubs','hammer','staff'],
		druid: ['club','sickle','dart','spear','dagger','scimitar','sling','staff'],
		healer: ['club','quarterstaff','mancatcher','sling'],
		priestofagriculture: ['hooks','flails','handaxe','throwingaxe','scythe','sickle'],
		priestofancestors: ['club','dagger','dirk','dart','knife','staff'],
		priestofanimals: ['hooks','cestus','clubs','maingauche','greatblade','longblade','mediumblade','shortblade','fencingblade','warhammer'],
		priestofarts: ['bow'],
		priestoflife: ['club','quarterstaff','mancatcher','sling'],
		priestofwar: ['any'],
		priestoflight: ['dart','javelin','spears'],
		priestofknowledge: ['sling','quarterstaff'],
		shaman: ['longblade','mediumblade','shortblade','blowgun','club','staff','shortbow','horsebow','handcrossbow'],
		rogue: ['club','shortblade','dart','handcrossbow','lasso','shortbow','sling','broadsword','longsword','staff'],
		thief: ['club','shortblade','dart','handcrossbow','lasso','shortbow','sling','broadsword','longsword','staff'],
		bard: ['any'],
		assassin: ['any'],
		psion: ['shortbow','handcrossbow','lightcrossbow','shortblade','clubs','axe','horsemanspick','scimitar','spears','warhammer'],
	});
	
	const classAllowedArmour = Object.freeze({
		warrior: ['any'],
		fighter: ['any'],
		ranger: ['any'],
		paladin: ['any'],
		beastmaster: ['any'],
		barbarian: ['padded','leather','hide','brigandine','ringmail','scalemail','chainmail','shield','ring','magicitem','cloak'],
		defender: ['any'],
		wizard: ['magicitem','ring','cloak'],
		mage: ['magicitem','ring','cloak'],
		mu: ['magicitem','ring','cloak'],
		abjurer: ['magicitem','ring','cloak'],
		conjurer: ['magicitem','ring','cloak'],
		diviner: ['magicitem','ring','cloak'],
		enchanter: ['magicitem','ring','cloak'],
		illusionist: ['magicitem','ring','cloak'],
		invoker: ['magicitem','ring','cloak'],
		necromancer: ['magicitem','ring','cloak'],
		transmuter: ['magicitem','ring','cloak'],
		priest:	['any'],
		cleric:	['any'],
		druid: ['leather','padded','hide','woodenshield','magicitem','ring','cloak'],
		healer: ['any'],
		priestofagriculture: ['leather','padded','hide','woodenshield','magicitem','ring','cloak'],
		priestofancestors: ['magicitem','ring','cloak'],
		priestofanimals: ['leather','padded','hide','magicitem','ring','cloak'],
		priestofarts: ['magicitem','ring','cloak'],
		priestofbirth: ['magicitem','ring','cloak'],
		priestofchildren: ['magicitem','ring','cloak'],
		priestofcommunity: ['any'],
		priestofcompetition: ['any'],
		priestofcrafts: ['leather','padded','hide','shields','magicitem','ring','cloak'],
		priestofculture: ['any','-shields'],
		priestofdarkness: ['leather','padded','hide','magicitem','ring','cloak'],
		priestofnight: ['leather','padded','hide','magicitem','ring','cloak'],
		priestoflife: ['any'],
		priestofwar: ['any'],
		priestoflight: ['studdedleather','ringmail','chainmail','shield','ring','magicitem','cloak'],
		priestofknowledge: ['magicitem','ring','cloak'],
		shaman: ['padded','leather','hide','brigandine','ringmail','scalemail','chainmail','splintmail','bandedmail','shield','ring','magicitem','cloak'],
		rogue: ['padded','leather','studdedleather','elvenchain'],
		thief: ['padded','leather','studdedleather','elvenchain'],
		bard: ['padded','leather','hide','brigandine','ringmail','scalemail','chainmail','ring','magicitem','cloak'],
		assassin: ['any'],
		psion: ['leather','studdedleather','hide','smallshield'],
	});
	
	var weapMultiAttks = {
		fighter:	{
			Levels:		['0','7','13'],
			Proficient: { melee: ['0','1/2','1'],
						  ranged: ['0','0','0'],
			},
		},
		Specialist: { melee: ['1/2','1','3/2'],
					  lightxbow: ['0','1/2','1'],
					  heavyxbow: ['0','1/2','1'],
					  throwndagger: ['1','2','3'],
					  throwndart: ['1','2','3'],
					  bow: ['0','0','0'],
					  arquebus: ['1/3','2/3','7/6'],
					  blowgun: ['1','2','3'],
					  knife: ['1','2','3'],
					  sling: ['1','2','3'],
					  ranged: ['0','1/2','1'],
		},
	};
	
	const saveVals = {paralysis:	{save:fields.Saves_paralysis,mod:fields.Saves_modParalysis},
					  poison:		{save:fields.Saves_poison,mod:fields.Saves_modPoison},
					  death:		{save:fields.Saves_death,mod:fields.Saves_modDeath},
					  rod:			{save:fields.Saves_rod,mod:fields.Saves_modRod},
					  staff:		{save:fields.Saves_staff,mod:fields.Saves_modStaff},
					  wand:			{save:fields.Saves_wand,mod:fields.Saves_modWand},
					  petrification:{save:fields.Saves_petrification,mod:fields.Saves_modPetrification},
					  polymorph:	{save:fields.Saves_polymorph,mod:fields.Saves_modPolymorph},
					  breath:		{save:fields.Saves_breath,mod:fields.Saves_modBreath},
					  spell:		{save:fields.Saves_spell,mod:fields.Saves_modSpell},
	};

	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;
	
	const reWeapSpecs = Object.freeze ({
		name: 		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+\:\|]+?)[,\]]/i},
		type: 		{field:'type',def:'',re:/[\[,\s]t:([\s\w\-\+\:\|]+?)[,\]]/i},
		superType: 	{field:'superType',def:'',re:/[\[,\s]st:([\s\w\-\+\:\|]+?)[,\]]/i},
		strBonus:	{field:'strBonus',def:'0',re:/[\[,\s]sb:([01])/i},
		dexBonus:	{field:'dexBonus',def:'1',re:/[\[,\s]db:([01])/i},
		adj:		{field:'adj',def:0,re:/[\[,\s]\+:(=?[+-]?\d+?d?\d*?)[,\]]/i},
		noAttks:	{field:'noAttks',def:1,re:/[\[,\s]n:([+-]?[\d\/]+)[,\]]/i},
		profLevel:	{field:'prof-level',def:0,re:/[\[,\s]pl:(=?[+\-]?[+\-\d\/]+)[,\]]/i},
		dancingProf:{field:'dancingProf',def:0,re:/[\[,\s]dp:(=?[+-]?[\d\/]+)[,\]]/i},
		critHit:	{field:'critHit',def:20,re:/[\[,\s]ch:([+-]?\d+?)[,\]]/i},
		critMiss:	{field:'critMiss',def:1,re:/[\[,\s]cm:([+-]?\d+?)[,\]]/i},
		size:		{field:'size',def:'',re:/[\[,\s]sz:([tsmlh])/i},
		range:		{field:'range',def:'',re:/[\[,\s]r:(=?[+-]?[\s\w\+\-\d\/]+)[,\]]/i},
		dmgType:	{field:'dmgType',def:'',re:/[\[,\s]ty:([spb]+)[,\]]/i},
		speed:		{field:'speed',def:0,re:/[\[,\s]sp:(=?[+-]?[d\d\+\-]+?)[,\]]/i},
		dmgSM:		{field:'dmgSM',def:0,re:/[\[,\s]sm:(=?[+-]?.*?)[,\]]/i},
		dmgL:		{field:'dmgL',def:0,re:/[\[,\s]l:(=?[+-]?.*?)[,\]]/i},
		weight:		{field:'weight',def:1,re:/[\[,\s]wt:(\d+?)[,\]]/i},	
		allowed:	{field:'allowed',def:'',re:/[\[,\s]allow:([\d,\s]+?)[,\]]/i},
		banned:		{field:'banned',def:'',re:/[\[,\s]ban:([\d,\s]+?)[,\]]/i},
	});
	
	const reACSpecs = Object.freeze ({
		name: 		{field:'name',def:'',re:/[\[,\s]a:([\s\w\-\+\,\:]+?)[,\]]/i},
		type: 		{field:'type',def:'',re:/[\[,\s]t:([\s\w\-\+\,\:]+?)[,\]]/i},
		superType: 	{field:'superType',def:'',re:/[\[,\s]st:([\s\w\-\+\,\:]+?)[,\]]/i},
		dexBonus:	{field:'dexBonus',def:0,re:/[\[,\s]db:([01])/i},
		ac:			{field:'ac',def:'',re:/[\[,\s]ac:(\d+?)[,\s\]]/i},
		adj:		{field:'adj',def:0,re:/[\[,\s]\+:(=?[+-]?\d+?)[,\s\]]/i},
		size:		{field:'size',def:'',re:/[\[,\s]sz:([tsmlh])/i},
		madj:		{field:'madj',def:0,re:/[\[,\s]\+m:(=?[+-]?\d+?)[,\]]/i},
		sadj:		{field:'sadj',def:0,re:/[\[,\s]\+s:(=?[+-]?\d+?)[,\]]/i},
		padj:		{field:'padj',def:0,re:/[\[,\s]\+p:(=?[+-]?\d+?)[,\]]/i},
		badj:		{field:'badj',def:0,re:/[\[,\s]\+b:(=?[+-]?\d+?)[,\]]/i},
		weight:		{field:'weight',def:1,re:/[\[,\s]wt:(\d+?)[,\]]/i},												 
		allowed:	{field:'allowed',def:'',re:/[\[,\s]allow:([\d,\s]+?)[,\]]/i},
		banned:		{field:'banned',def:'',re:/[\[,\s]ban:([\d,\s]+?)[,\]]/i},
	});
	
	const reSpellSpecs = Object.freeze ({
		name:		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+]+?)[,\]]/i},
		type:		{field:'spell',def:'',re:/[\[,\s]cl:(PR|MU|PW)[,\s\]]/i},
		speed:		{field:'speed',def:0,re:/[\[,\s]sp:([d\d\+\-]+?)[,\s\]]/i},
		level:		{field:'level',def:1,re:/[\[,\s]lv:(\d+?)[,\s\]]/i},
		perDay:		{field:'perDay',def:1,re:/[\[,\s]pd:(\d+?)[,\s\]]/i},
		cost:		{field:'cost',def:0,re:/[\[,\s]gp:(\d+?\.?\d*?)[,\s\]]/i},
		recharge:	{field:'type',def:'uncharged',re:/[\[,\s]rc:([\-\w]+?)[,\s\]]/i},
		allowed:	{field:'allowed',def:'',re:/[\[,\s]allow:([\d,\s]+?)[,\]]/i},
		banned:		{field:'banned',def:'',re:/[\[,\s]ban:([\d,\s]+?)[,\]]/i},
	});
	
	const reClassSpecs = Object.freeze ({
		name:		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+]+?)[,\]]/i},
		alignment:	{field:'align',def:'any',re:/[\[,\s]align:([\s\w\-\+\|]+?)[,\s\]]/i},
		hitdice:	{field:'hd',def:'1d10',re:/[\[,\s]hd:([d\d\+\-]+?)[,\s\]]/i},
		race:		{field:'race',def:'any',re:/[\[,\s]race:([\s\w\-\|]+?)[,\s\]]/i},
		weapons:	{field:'weaps',def:'any',re:/[\[,\s]weaps:([\s\w\-\+\|]+?)[,\s\]]/i},
		armour:		{field:'ac',def:'any',re:/[\[,\s]ac:([\s\w\-\+\|]+?)[,\s\]]/i},
		majorsphere:{field:'sps',def:'any',re:/[\[,\s]sps:([\s\w\-\|]+?)[,\s\]]/i},
		minorsphere:{field:'spm',def:'',re:/[\[,\s]spm:([\s\w\-\|]+?)[,\]]/i},
		bannedsphere:{field:'spb',def:'',re:/[\[,\s]spb:([\s\w\-\|]+?)[,\]]/i},
		attklevels:	{field:'attkLevels',def:'0',re:/[\[,\s]attkl:([-\s\d\|]+?)[,\]]/i},
		attkmelee:	{field:'attkMelee',def:'0',re:/[\[,\s]attkm:([-.\s\d\|\/]+?)[,\]]/i},
		attkranged:	{field:'attkRanged',def:'0',re:/[\[,\s]attkr:([-.\s\d\|\/]+?)[,\]]/i},
		nonprofpen:	{field:'nonProfPen',def:'',re:/[\[,\s]npp:([-\s\d]+?)[,\]]/i},
	});
	
	const reRangeMods = Object.freeze ({
		near:		{field:'N',def:'-5',re:/[\[,\s]N:([-\+\d]+?)[,\]]/i},
		pointblank:	{field:'PB',def:'2',re:/[\[,\s]PB:([-\+\d]+?)[,\]]/i},
		short:		{field:'S',def:'0',re:/[\[,\s]S:([-\+\d]+?)[,\]]/i},
		medium:		{field:'M',def:'-2',re:/[\[,\s]M:([-\+\d]+?)[,\]]/i},
		long:		{field:'L',def:'-5',re:/[\[,\s]L:([-\+\d]+?)[,\]]/i},
		far:		{field:'F',def:'-20',re:/[\[,\s]F:([-\+\d]+?)[,\]]/i},
	});
		
	
	const design = Object.freeze ({
		turncolor: '#D8F9FF',
		roundcolor: '#363574',
		statuscolor: '#F0D6FF',
		statusbgcolor: '#897A87',
		statusbordercolor: '#430D3D',
		edit_icon: 'https://s3.amazonaws.com/files.d20.io/images/11380920/W_Gy4BYGgzb7jGfclk0zVA/thumb.png?1439049597',
		delete_icon: 'https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579',
		settings_icon: 'https://s3.amazonaws.com/files.d20.io/images/11920672/7a2wOvU1xjO-gK5kq5whgQ/thumb.png?1440940765', 
		apply_icon: 'https://s3.amazonaws.com/files.d20.io/images/11407460/cmCi3B1N0s9jU6ul079JeA/thumb.png?1439137300',
		grey_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
		dark_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: black; font-weight: normal;"',
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		green_button: '"display: inline-block; background-color: white; border: 1px solid lime; padding: 4px; color: darkgreen; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"'
	});
	
	var apiCommands = {},
		apiDBs = {magic:true,attk:false};

	var DBindex = {
		mu_spells_db:	{},
		pr_spells_db:	{},
		powers_db:		{},
		mi_db:			{},
		class_db:		{},
		attacks_db:		{}
	};
	
	var flags = {
		image: false,
		archive: false,
		dice3d: true,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
	};
		
	var attackMaster_tmp = (function() {
		var templates = {
			button: _.template('<a style="display: inline-block; font-size: 100%; color: black; padding: 3px 3px 3px 3px; margin: 2px 2px 2px 2px; border: 1px solid black; border-radius: 0.5em; font-weight: bold; text-shadow: -1px -1px 1px #FFF, 1px -1px 1px #FFF, -1px 1px 1px #FFF, 1px 1px 1px #FFF; background-color: #C7D0D2;" href="<%= command %>"><%= text %></a>'),
			confirm_box: _.template('<div style="font-weight: bold; background-color: #FFF; text-align: center; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 1em; border: 1px solid black; margin: 5px 5px 5px 5px; padding: 2px 2px 2px 2px;">'
					+ '<div style="border-bottom: 1px solid black;">'
						+ '<%= message %>'
					+ '</div>'
					+ '<table style="text-align: center; width: 100%">'
						+ '<tr>'
							+ '<td>'
								+ '<%= confirm_button %>'
							+ '</td>'
							+ '<td>'
								+ '<%= reject_button %>'
							+ '</td>'
						+ '</tr>'
					+ '</table>'
				+ '</div>')
    		};

		return {
			getTemplate: function(tmpArgs, type) {
				var retval;
				
				retval = _.find(templates, function(e,i) {
					if (type === i) {
						{return true;}
					}
				})(tmpArgs);
				
				return retval;
			},
			
			hasTemplate: function(type) {
				if (!type) 
					{return false;}
				return !!_.find(_.keys(templates), function(elem) {
					{return (elem === type);}
				});
				
			}
		};
	}());


	/**
	 * Init
	 */
	var init = function() {
		if (!state.attackMaster)
			{state.attackMaster = {};}
		if (!state.magicMaster)
			{state.magicMaster = {};}
		if (_.isUndefined(state.attackMaster.weapRules))
			{state.attackMaster.weapRules = {prof:true,allowAll:false,classBan:false,allowArmour:false,masterRange:false,dmTarget:false};}
		if (!state.attackMaster.twoWeapons)
		    {state.attackMaster.twoWeapons = {};}
		if (!state.magicMaster.playerConfig)
			{state.magicMaster.playerConfig={};}
		if (_.isUndefined(state.attackMaster.debug))
		    {state.attackMaster.debug = false;}
			
		log(`-=> attackMaster v${version} <=-`);
		
		// Handshake with other APIs to see if they are loaded
		setTimeout( () => issueHandshakeQuery('magic'), 2000);
		setTimeout( () => issueHandshakeQuery('money'), 2000);
		setTimeout( () => issueHandshakeQuery('cmd'), 2000);
		setTimeout( () => updateHandouts(true,findTheGM()), 3000);
		setTimeout( cmdMasterRegister, 4000 );
		
		// Once all is settled build or update the Weapon & Armour dBs
		// Might already be done, if MagicMaster API already loaded
		setTimeout( () => doUpdateDB([], true), 9000);
	}; 
	
// ------------------------------------------------ Deal with in-line expressions --------------------------------
	
    /**
     * In the inline roll evaluator from ChatSetAttr script v1.9
     * by Joe Singhaus and C Levett.
    **/

	var processInlinerolls = function (msg) {
		if (msg.inlinerolls && msg.inlinerolls.length) {
			return msg.inlinerolls.map(v => {
				const ti = v.results.rolls.filter(v2 => v2.table)
					.map(v2 => v2.results.map(v3 => v3.tableItem.name).join(", "))
					.join(", ");
				return (ti.length && ti) || v.results.total || 0;
			})
				.reduce((m, v, k) => m.replace(`$[[${k}]]`, v), msg.content);
		} else {
			return msg.content;
		}
	};

	
// -------------------------------------------- send messages to chat -----------------------------------------
	

    /*
     * Determine who to send a Response to: use who controls
     * the character - if no one or if none of the controlling
     * players are on-line send the response to the GM
     */
  
    var sendToWho= function(charCS,makePublic=false) {
        
		var to, controlledBy, players, viewerID, isPlayer=false; 
		controlledBy = charCS.get('controlledby');
		if (controlledBy.length > 0) {
		    controlledBy = controlledBy.split(',');
			viewerID = state.roundMaster.viewer.is_set ? (state.roundMaster.viewer.pid || null) : null;
            players = controlledBy.filter(id => id != viewerID);
			if (players.length) {
    		    isPlayer = _.some( controlledBy, function(playerID) {
        		    players = findObjs({_type: 'player', _id: playerID, _online: true});
        		    return (players && players.length > 0);
        		});
			};
		};
        if (controlledBy.includes('all')) {
            to = '';
        } else if (!charCS || controlledBy.length == 0 || !isPlayer) {
			to = '/w gm ';
		} else if (makePublic) {
		    to = '';
		} else {
			to = '/w "' + charCS.get('name') + '" ';
		}
        return to;
    }

	/**
	 * Send public message with 3d dice rolls (if enabled)
	 */

	var sendPublic = function(msg,charCS) {
		if (!msg) 
			{return undefined;}
		var who;

		if (charCS) {
		    who = 'character|'+charCS.id;
		} else {
		    who = '';
		}
		sendChat(who,msg,null,{use3d:true});
	};
	
	/**
	 * Send a request to run an effect macro to RoundMaster
	**/
	var sendAPImacro = function(curToken,msg,effect,macro) {

		if (!curToken || !macro || !effect) {
			sendDebug('sendAPImacro: a parameter is null');
			return;
		}
		
		var cmd = fields.roundMaster + ' --effect '+curToken.id+'|'+msg+'|'+effect+'|'+macro;
		
		sendAttkAPI( cmd );
		return;
	}


/*		var journal,
		    tid = curToken.id,
		    tname = curToken.get('name'),
		    cid = curToken.get('represents'),
		    words,
			effectsLib = state.roundMaster.effectsLib;
			
		sendDebug( 'msg is ' + msg );
			
		if (msg.length && msg.length > 0) {
		    words = msg.split(' ');
            if (words.length && words.length > 1 && words[0].toLowerCase() === 'effect')
                    {effect = words[1];}
		}
        journal = getObj( 'character', cid );
		if (effectsLib && journal) {
			var cname = journal.get('name'),
			    bar1 = curToken.get('bar1_value'),
			    bar2 = curToken.get('bar2_value'),
			    bar3 = curToken.get('bar3_value'),
				ac = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC),
				thac0 = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0),
				hp = getTokenValue(curToken,fields.Token_HP,fields.HP),
				effectMacro = findObjs({ _type : 'ability' , characterid : effectsLib.id, name :  effect + macro }, {caseInsensitive: true});
			if (!effectMacro || effectMacro.length === 0) {
			    sendDebug('Not found effectMacro ' + effectsLib.get('name') + '|' + effect + macro);
			}
			if (!cname) {
				cname = curToken.get('name');
			}
			if (effectMacro.length > 0) {
				var macroBody = effectMacro[0].get('action');

				macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname );
				macroBody = macroBody.replace( /\^\^tname\^\^/gi , tname );
				macroBody = macroBody.replace( /\^\^cid\^\^/gi , cid );
				macroBody = macroBody.replace( /\^\^tid\^\^/gi , tid );
				macroBody = macroBody.replace( /\^\^bar1_current\^\^/gi , bar1 );
				macroBody = macroBody.replace( /\^\^bar2_current\^\^/gi , bar2 );
				macroBody = macroBody.replace( /\^\^bar3_current\^\^/gi , bar3 );
				macroBody = macroBody.replace( /\^\^token_ac\^\^/gi , ac );
				macroBody = macroBody.replace( /\^\^token_thac0\^\^/gi , thac0 );
				macroBody = macroBody.replace( /\^\^token_hp\^\^/gi , hp );
        		sendDebug('sendAPImacro: macroBody is ' + macroBody );
		        sendChat("character|"+cid,macroBody,null,{noarchive:!flags.archive, use3d:false});
				
			}
		}
	}
*/	
    /**
     * Send API command to chat
     */

    var sendAttkAPI = function(msg, senderId) {
        var as;
		if (!msg) {
		    sendDebug('sendAttkAPI: no msg');
		    return undefined;
		}
		if (!senderId || senderId.length == 0) {
			as = '';
		} else {
			as = 'player|' + senderId;
		}
		sendDebug('sendAttkAPI: sending as ' + as + ', msg is ' + msg );
		sendChat(as,msg, null,(flags.archive ? null:{noarchive:true}));
    };

	/**
	* Send feedback to the GM only (with 3d dice rolls if enabled)!
	*/

	var sendFeedback = function(msg) {

 		var content = '/w GM '
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + fields.feedbackImg + '">' 
				+ '</div>'
				+ msg;
			
		sendChat(fields.feedbackName,content,null,{noarchive:!fields.archive,use3d:fields.dice3d});
		sendDebug(msg);
	};

	/**
	 * Sends a response with a 3d dice roll (if enabled) to everyone who controls the character
	 */

	var sendDiceRoll = function(charCS,msg,as,img) {
		if (!msg) 
			{return null;}
		var to, content; 
		if (!charCS || charCS.get('controlledby').length == 0) {
			to = '/w gm ';
		} else {
			to = '/w "' + charCS.get('name') + '" ';
		}
		content = to
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + (img ? img:fields.feedbackImg) + '">' 
				+ '</div>'
				+ msg;
		sendChat((as ? as:fields.feedbackName),content,null,{noarchive:!flags.archive,use3d:flags.dice3d});
	}; 

	/**
	 * Sends a response to everyone who controls the character
	 * RED: v0.003 Check the player(s) controlling the character are valid for this campaign
	 * if they are not, send to the GM instead - Transmogrifier can introduce invalid IDs
	 * Also check if the controlling player(s) are online.  If they are not
	 * assume the GM is doing some testing and send the message to them.
	 */
	
	var sendResponse = function(charCS,msg,as,img) {
		if (!msg) 
			{return null;}
        var content = sendToWho(charCS)
    				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
    					+ '<img src="' + (img ? img:fields.feedbackImg) + '">' 
    				+ '</div>'
    				+ msg;
		sendChat((as ? as:fields.feedbackName),content,null,{noarchive:!flags.archive, use3d:false});
	}; 

	/*
	 * Send an error message to the identified player.  
	 * RED: v0.003 If that player is not online, send to the GM
	 */

	var sendResponseError = function(pid,msg,as,img) {
		if (!pid || !msg) 
			{return null;}
		var player = getObj('player',pid),
			to; 
		if (player && player.get('_online')) {
			to = '/w "' + player.get('_displayname') + '" ';
		} else {
			to = '/w gm ';
		}
		var content = to
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + (img ? img:fields.feedbackImg) + '">' 
				+ '</div>'
				+ msg;
		sendChat((as ? as:fields.feedbackName),content,null,{noarchive:!flags.archive, use3d:false});
	}; 

	/**
	 * Send an error
	 */ 
	
	var sendError = function(msg) {
		sendFeedback('<span style="color: red; font-weight: bold;">'+msg+'</span>'); 
	}; 
 
	/**
	 * RED: v1.207 Send a debugging message if the debugging flag is set
	 */ 

	var sendDebug = function(msg) {
	    if (!!state.attackMaster.debug) {
	        var player = getObj('player',state.attackMaster.debug),
	            to;
    		if (player) {
	    		to = '/w "' + player.get('_displayname') + '" ';
		    } else 
		    	{throw {name:'attackMaster Error',message:'sendDebug could not find player'};}
		    if (!msg)
		        {msg = 'No debug msg';}
    		sendChat('attackMaster Debug',to + '<span style="color: red; font-weight: bold;">'+msg+'</span>',null,(flags.archive ? null:{noarchive:true})); 
	    };
	}; 
	
	var doSetDebug = function(args,senderId) {
		var player = getObj('player',senderId),
		    playerName;
		if (player) {
		    playerName = player.get('_displayname');
		}
		else 
			{throw {name:'attackMaster Error',message:'doSetDebug could not find player: ' + args};}
	    if (!!args && args.indexOf('off') != 0) {
    	    state.attackMaster.debug = senderId;
            sendResponseError(senderId,'attackMaster Debug set on for ' + playerName,'attackMaster Debug');
	        sendDebug('Debugging turned on');
	    } else {
    	    sendResponseError(senderId,'attackMaster Debugging turned off','attackMaster Debug');
	        state.attackMaster.debug = false;
	    }
	};

    /**
     * Parse a message with ^^...^^ parameters in it and send to chat
     * This allows character and token names for selected characters to be sent
     * Must be called with a validated tokenID
    */
  
    var sendParsedMsg = function( msgFrom, msg, tid, t2id ) {
        var cid, tname, charCS, cname, curToken,
            parsedMsg = msg;
            
        curToken = getObj( 'graphic', tid );
        tname = curToken.get('name');
        cid = curToken.get('represents');
		charCS = getObj('character',cid);
        cname = charCS.get('name');

		parsedMsg = parsedMsg.replace( /\^\^cid\^\^/gi , cid );
		parsedMsg = parsedMsg.replace( /\^\^tid\^\^/gi , tid );
		parsedMsg = parsedMsg.replace( /\^\^cname\^\^/gi , cname );
		parsedMsg = parsedMsg.replace( /\^\^tname\^\^/gi , tname );
		if (t2id) {
			curToken = getObj( 'graphic', t2id );
			tname = curToken.get('name');
			cid = curToken.get('represents');
			charCS = getObj('character',cid);
			cname = charCS.get('name');

			parsedMsg = parsedMsg.replace( /\^\^c2id\^\^/gi , cid );
			parsedMsg = parsedMsg.replace( /\^\^t2id\^\^/gi , t2id );
			parsedMsg = parsedMsg.replace( /\^\^c2name\^\^/gi , cname );
			parsedMsg = parsedMsg.replace( /\^\^t2name\^\^/gi , tname );
		}
		
		sendResponse( charCS, parsedMsg, msgFrom, null );

    };
	
// -------------------------------------------- utility functions ----------------------------------------------

	/**
	 * Issue a handshake request to check if another API or 
	 * specific API command is present
	 **/
	 
	var issueHandshakeQuery = function( api, cmd ) {
		var handshake = '!'+api+' --hsq attk'+((cmd && cmd.length) ? ('|'+cmd) : '');
		sendAttkAPI(handshake);
		if (_.isUndefined(apiCommands[api])) apiCommands[api] = {};
		apiCommands[api].exists = false;
		return;
	};
	
    /**
     * Find the GM, generally when a player can't be found
     */
   
    var findTheGM = function() {
	    var playerGM,
	        players = findObjs({ _type:'player' });

		if (players.length !== 0) {
		    if (!_.isUndefined(playerGM = _.find(players, function(p) {
		        var player = p;
		        if (player) {
    		        if (playerIsGM(player.id)) {
	    	            return player.id;
                    }
		        }
            }))) {
                return playerGM.id;
            }
        }
        return undefined;
    }
	
/* --------------------------------------------------- Table Management --------------------------------------------- */

	/*
	 * A function to get the whole of a repeating table in 
	 * two parts: an array of objects indexed by Roll20 object IDs,
	 * and an array of object IDs indexed by repeating table row number.
	 * Returns an object containing the table, and all parameters defining
	 * that table and where it came from.
	 */
	 
	var getTable = function(character,tableObj,tableDef,attrDef,col,defaultVal,caseSensitive) {
        let rowName, name = attrDef[0];
	    if (_.isUndefined(col) || _.isNull(col) || (tableDef && !_.isNull(tableDef) && !tableDef[1] && col && col==1)) {col = '';}
	    if (tableDef && !_.isNull(tableDef)) {
            rowName = tableDef[0]+col+'_$0_'+attrDef[0]+col;
	    } else {
            rowName = attrDef[0];
	    }
		
		if (_.isUndefined(defaultVal)) {
			defaultVal=attrDef[2];
		}
		tableObj.character=character;
		tableObj.table=tableDef;
		tableObj.column=col;
		if (_.isUndefined(tableObj[name])) {
		    tableObj[name]={};
		    tableObj[name].defaultVal = {current:'',max:''};
		}
		tableObj[name].property = attrDef;
		tableObj[name].defaultVal[attrDef[1]] = defaultVal;
		let	match= rowName.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let createOrderKeys=[],
                attrMatcher=new RegExp(`^${rowName.replace(/_\$\d+_/,'_([-\\da-zA-Z]+)_')}$`,(caseSensitive?'i':'')),
                attrs=_.chain(findObjs({type:'attribute', characterid:character.id}))
                    .map((a)=>{
                        return {attr:a,match:a.get('name').match(attrMatcher)};
                    })
                    .filter((o)=>o.match)
                    .each((o)=>createOrderKeys.push(o.match[1]))
                    .reduce((m,o)=>{ m[o.match[1]]=o.attr; return m;},{})
                    .value(),
                sortOrderKeys = _.chain( ((findObjs({
                        type:'attribute',
                        characterid:character.id,
                        name: `_reporder_${match[1]}`
                    })[0]||{get:_.noop}).get('current') || '' ).split(/\s*,\s*/))
                    .intersection(createOrderKeys)
                    .union(createOrderKeys)
                    .value();

			if (_.isUndefined(tableObj.sortKeys)) {
				tableObj.sortKeys = sortOrderKeys;
			} else {
				tableObj.sortKeys = tableObj.sortKeys.concat(_.difference(sortOrderKeys,tableObj.sortKeys));
				if (_.some(sortOrderKeys, (e,k) => e !== tableObj.sortKeys[k])) sendDebug('Warning: table '+tableDef[0]+', attr '+attrDef[0]+' is not fully aligned');
			}
			tableObj[name].attrs=attrs;
        } else {
            tableObj[name].attrs=[];
            if (_.isUndefined(tableObj.sortKeys)) {
                tableObj.sortKeys = [];
            }
        }
		return tableObj;
	};
	
	/*
	 * Find all the necessary tables to manage a repeating 
	 * section of a character sheet.  Dynamically driven by 
	 * the table field definitions in the 'fields' object. 
	 */

	var getAllTables = function( charCS, tableTypes, c, tableInfo ) {
		
		var tableTypes = tableTypes.toUpperCase().split(','),
			rows = {};

		if (_.isUndefined(tableInfo)) {
			tableInfo = {};
			tableInfo.ammoTypes = [];
		};

		_.each( tableTypes, setupType => {
		    rows = {};
			if (_.isUndefined(tableInfo[setupType])) {
				tableInfo[setupType] = {};
				tableInfo[setupType].tableType = setupType;
				tableInfo[setupType].fieldGroup = tableIntro[setupType][0];
				tableInfo[setupType].table = tableIntro[setupType][1]
				tableInfo[setupType].values = [new Set()];
			}
			_.each( fields, (elem,key) => {
				if (key.startsWith(tableInfo[setupType].fieldGroup)
					&& ['current','max'].includes(String(elem[1]).toLowerCase())) {
					rows[key]=elem;
					if (_.isUndefined(tableInfo[setupType].values[elem[0]])) {
						tableInfo[setupType].values[elem[0]] = {current:'',max:''};
					}
					tableInfo[setupType].values[elem[0]][elem[1]] = elem[2] || '';
				};
				return;
        	});
			_.each(rows, (elem,key) => {
				tableInfo[setupType] = getTable( charCS, tableInfo[setupType], tableInfo[setupType].table, elem, c, elem[2] );
			});
		});

		return tableInfo;
	}
	
	/**
	 * A function to take a table obtained using getTable() and a row number, and 
	 * safely return the value of the table row, or undefined.  Uses the table object
	 * parameters such as the character object it came from and the field property.
	 * If the row entry is undefined use a default value if set in the getTable() call,
	 * which can be overridden with an optional parameter.  Can just return the row 
	 * object or can return a different property of the object using the second optional parameter.
	 */

	var tableLookup = function( tableObj, attrDef, index, defVal, retObj ) {
		if (_.isUndefined(attrDef))
			throw {name:'attackMaster Error',message:'undefined table field attribute'};
		var val, name = attrDef[0];
        if (_.isUndefined(retObj)) {
			retObj=false;
		} else if (retObj === true) {
			defVal=false;
		}
		if (_.isUndefined(defVal)) {
			defVal=true;
		}
		if (!_.isUndefined(index) && tableObj[name]) {
			let property = (retObj === true) ? null : ((retObj === false) ? attrDef :  retObj);
			defVal = (defVal===false) ? (undefined) : ((defVal===true) ? tableObj[name].defaultVal[attrDef[1]] : defVal);
			if (index>=0) {
				let attrs = tableObj[name].attrs,
					sortOrderKeys = tableObj.sortKeys;
				if (index<sortOrderKeys.length && _.has(attrs,sortOrderKeys[index])) {
					if (_.isUndefined(property) || _.isNull(property) || !property || !property[1] || _.isUndefined(attrs[sortOrderKeys[index]])) {
						return attrs[sortOrderKeys[index]];
					} else {
						val = attrs[sortOrderKeys[index]].get(property[1]);
						if (_.isUndefined(val)) {
						    val = defVal;
						};
						return val;
					}
				}
				return defVal;
			} else if (!_.isUndefined(property) && !_.isNull(property)) {
				val = attrLookup( tableObj.character, property );
				if ( _.isUndefined(val)) {
				    val = defVal;
				}
				return val;
			}
		}
		return undefined;
	}

	/**
	 * A function to take a table obtained using getTable() a row number, and 
	 * a value, and safely set the value of the property, 
	 * returning true for success and false for failure, or undefined if 
	 * it tries setAttr to create an entry that does not exist.
	 */
	 
	 var tableSet = function( tableObj, attrDef, r, attrValue, caseSensitive ) {
		
        var name = attrDef[0];
		if (tableObj[name]) {
			if (_.isUndefined(attrValue)) {
				attrValue = tableObj[name].defaultVal;
			}
    		if (r < 0) {
				let attrObj = attrLookup( tableObj.character, [attrDef[0], null], null, null, null, caseSensitive );
				if (!attrObj) attrObj = createObj( 'attribute', {characterid:tableObj.character.id, name:attrDef[0] });
				attrObj.set(attrDef[1],attrValue);
    		    return tableObj;
    		}
			let attrs = tableObj[name].attrs,
				sortOrderKeys = tableObj.sortKeys,
				value = {},
				rowObj;
				
			if (r<sortOrderKeys.length && !_.has(attrs,sortOrderKeys[r])) {
				let finalName = tableObj.table[0]+tableObj.column+'_'+sortOrderKeys[r]+'_'+attrDef[0]+tableObj.column;
				value = (tableObj.values && tableObj.values[attrDef[0]]) ? tableObj.values[attrDef[0]] : {current:'', max:''};
    			value[attrDef[1]]=String(attrValue);
				rowObj = createObj( "attribute", {characterid: tableObj.character.id, name: finalName});
				rowObj.set(value);
				tableObj[name].attrs[sortOrderKeys[r]] = rowObj;
			} else if (r<sortOrderKeys.length && _.has(attrs,sortOrderKeys[r])
										&& !_.isUndefined(attrDef)
										&& !_.isNull(attrDef)
										&& attrDef[1]
										&& !_.isUndefined(attrs[sortOrderKeys[r]])) {
				attrs[sortOrderKeys[r]].set(attrDef[1],String(attrValue));
			} else {
				log('tableSet not been able to set '+tableObj.table[0]+tableObj.column+'_$'+r+'_'+attrDef[0]+tableObj.column+' "'+attrDef[1]+'" to '+attrValue);
				sendError('attackMaster not able to save to '+tableObj.table[0]+' table row '+r);
			}
		}
		return tableObj;
	};
	
    /*
     * Function to generate unique IDs for creating objects in Roll20
     */

	var generateUUID = function () {
			var a = 0,
				b = [];
			return function () {
				var c = (new Date()).getTime() + 0,
					d = c === a;
				a = c;
				for (var e = new Array(8), f = 7; 0 <= f; f--) {
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
		}();
	var	generateRowID = function () {
			return generateUUID().replace(/_/g, "Z");
		};

	/*
	 * Create a new table row and add values to it
	 * If the table row already exists, set it to the provided values.
	 * If the row exists and no values are provided, set it to defaults.
	 */
	
	var addTableRow = function( tableObj, index, values, fieldGroup ) {
	    
		let rowObj, newVal, currentVal, maxVal, list = tableObj;
		
		if (!values) values = tableObj.values;
		if (!fieldGroup) fieldGroup = tableObj.fieldGroup;
		if (!fieldGroup) {
			throw {name:'attackMaster Error',message:'undefined addTable fieldGroup'};
		}
		    
		if (!_.isUndefined(index) && ((index < 0) || !_.isUndefined(tableLookup( tableObj, fields[fieldGroup+'name'], index, false )))) {
			_.each( list, (elem,key) => {
			    if (_.isUndefined(elem.attrs)) return;
				currentVal = (!values || _.isUndefined(values[key])) ? elem.defaultVal['current'] : values[key]['current'];
				maxVal = (!values || _.isUndefined(values[key])) ? elem.defaultVal['max'] : values[key]['max'];
				tableObj = tableSet( tableObj, [key,'current'], index, currentVal );
				tableObj = tableSet( tableObj, [key,'max'], index, maxVal );
			});
		} else {
			let rowObjID = generateRowID(),
			    namePt1 = tableObj.table[0]+tableObj.column+'_'+rowObjID+'_';
			_.each( list, (elem,key) => {
			    if (_.isUndefined(elem.attrs)) return;
				rowObj = createObj( "attribute", {characterid: tableObj.character.id, name: (namePt1+key+tableObj.column)} );
				if (!values || _.isUndefined(values[key])) {
					newVal = elem.defaultVal;
				} else {
					newVal = values[key];
				}
				rowObj.set(newVal);
				tableObj[key].attrs[rowObjID] = rowObj;
				tableObj.sortKeys[index] = rowObjID;
				return;
			});
		}
		return tableObj;
	}
	
	/*
	 * Function to initialise a values[] array to hold data for 
	 * setting a table row to.
	 */
	 
	var initValues = function( fieldGroup ) {
	
		var values = [new Set()],
    		rows = _.filter( fields, (elem,f) => {return f.startsWith(fieldGroup)})
						.map(elem => {
							if (_.isUndefined(values[elem[0]])) {
								values[elem[0]] = {current:'',max:''};
							}
							values[elem[0]][elem[1]] = elem[2] || '';
						});
        return values;
	};
	
	/*
	 * A function to find the index of a matching entry in a table
	 */
	 
	var tableFind = function( tableObj, attrDef, val, noSeparators=true ) {
		
        if (noSeparators) val = val.toLowerCase().replace(reIgnore,'');
		
		let property = attrDef[1];
		if (tableObj.table[1] < 0) {
			let found = attrLookup( tableObj.character, attrDef );
			if (val == (noSeparators ? found.toLowerCase().replace(reIgnore,'') : found)) {
				return -1;
			}
		}
		let tableIndex = tableObj.sortKeys.indexOf(
								_.findKey(tableObj[attrDef[0]].attrs, function( elem, objID ) {
									return val == (noSeparators ? elem.get(property).toLowerCase().replace(reIgnore,'') : elem.get(property));
								})
								);
		return (tableIndex >= 0) ? tableIndex : undefined;
	}

    /**
     * A function to lookup the value of any attribute, including repeating rows, without errors
     * thus avoiding the issues with getAttrByName()
     * 
     * Thanks to The Aaron for this, which I have modded to split and 
	 * allow tables to be loaded once rather than multiple times.
	*/

    var attrLookup = function(character,attrDef,tableDef,r,c='',caseSensitive=false) {
		if (_.isUndefined(attrDef))
			throw {name:'attackMaster Error',message:'undefined field attribute'};
		let name, match,
			property = attrDef[1];
		
		if (tableDef && (tableDef[1] || r >= 0)) {
			c = (tableDef[1] || c != 1) ? c : '';
			name = tableDef[0] + c + '_$' + r + '_' + attrDef[0] + c;
		} else {
			name = attrDef[0];
		}
		match=name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let index=match[2],
				tableObj = getTable(character,{},tableDef,attrDef,c,caseSensitive);
			return tableLookup(tableObj,attrDef,index,false,!attrDef[1]);
		} else {
			let attrObj = findObjs({ type:'attribute', characterid:character.id, name: name}, {caseInsensitive: !caseSensitive});
			if (!attrObj || attrObj.length == 0) {
				return undefined;
			} else {
				attrObj = attrObj[0];
				if (_.isUndefined(property) || _.isNull(property) || _.isUndefined(attrObj)) {
					return attrObj;
				} else {
					return attrObj.get(property);
				}
			}
		}
    };
	
	/**
	* Check that an attribute exists, set it if it does, or
	* create it if it doesn't using !setAttr
	**/
	
	var setAttr = function( character, attrDef, attrValue, tableDef, r, c, caseSensitive ) {
	    
		var name, attrObj, match;

		if (_.isUndefined(attrDef)) {log('setAttr attrDef undefined:'+attrDef);return undefined;}
	    try {
	        name = attrDef[0];
	    } catch {
	        return undefined;
	    }
		
		if (tableDef && (tableDef[1] || r >= 0)) {
			c = (c && (tableDef[1] || c != 1)) ? c : '';
			name = tableDef[0] + c + '_$' + r + '_' + attrDef[0] + c;
		} else {
			name = attrDef[0];
		}
		match=name.match(reRepeatingTable);
        if(match){
            let tableObj = getTable(character,{},tableDef,attrDef,c,caseSensitive);
			if (tableObj) {
				attrObj = tableLookup(tableObj,attrDef,r,false,true);
			}
		} else {
			attrObj = attrLookup( character, [name, null], null, null, null, caseSensitive );
			if (!attrObj) {
				attrObj = createObj( 'attribute', {characterid:character.id, name:attrDef[0], current:'', max:''} );
			}
		};
		if (attrObj) {
			if (attrDef[3]) {
				attrObj.setWithWorker(attrDef[1],String(attrValue));
			} else {
				attrObj.set(attrDef[1],String(attrValue));
			}
			sendDebug( 'setAttr: character ' + character.get('name') + ' attribute ' + attrDef[0] + ' ' + attrDef[1] + ' set to ' + attrValue );
		}
		return attrObj;
	}
	
/* -------------------------------------------------------------- Ability Management ---------------------------------------- */
	
	/**
	 * Find an ability macro with the specified name in any 
	 * macro database with the specified root name, returning
	 * the database name, and the matching "ct-" object.
	 * If can't find a matching ability macro or "ct-" object
	 * then return undefined objects
	 * RED v1.038: Updated to use a database index of object IDs 
	 * to speed up lookups.
	 **/
	 
	var abilityLookup = function( rootDB, abilityName, silent=false ) {
	    
        var searchName = abilityName.toLowerCase().replace(reIgnore,'');
        if (!searchName || searchName.length==0) {
			return {dB: rootDB, obj: undefined, ct: undefined};
        }
		
		var charID, obj, objIndex, dBname,
			abilityObj = [],
			ctObj = [],
	        rDB = rootDB.toLowerCase().replace(/-/g,'_');
		
		if (!_.isUndefined(DBindex[rDB]) && !_.isUndefined(DBindex[rDB][searchName])) {
			objIndex = DBindex[rDB][searchName];
			obj = getObj('ability',objIndex[0]);
		}
		if (!obj) {
			if (!silent) {
				log('Not found ability '+abilityName+' in any '+rootDB+' database');
				sendError('Not found ability '+abilityName+' in any '+rootDB+' database');
			}
			return {dB: rootDB, obj: undefined, ct: undefined};
		} else {
			charID = obj.get('characterid');
			dBname = getObj('character',charID).get('name');
			abilityObj[0] = obj;
			ctObj[0] = getObj('attribute',objIndex[1]);
			if (!ctObj || ctObj.length === 0 || !ctObj[0]) {
				log('Can\'t find ct-'+abilityName+' in '+dBname);
				if (!silent) sendError('Can\'t find ct-'+abilityName+' in '+dBname);
				return {dB: rootDB, obj: abilityObj[0], ct: undefined};
			};
		};
		return {dB: dBname, obj:abilityObj, ct: ctObj};
	}
	
	/*
	 * Create or update an ability on a character sheet
	 */
	
	var setAbility = function( charCS, abilityName, abilityMacro, actionBar=false ) {
		
		var abilityObj = findObjs({type: 'ability',
								   characterid: charCS.id,
								   name: abilityName}, 
								   {caseInsensitive:true});
		if (!abilityObj || abilityObj.length == 0) {
			abilityObj = createObj( 'ability', {characterid: charCS.id,
												name: abilityName,
												action: abilityMacro,
												istokenaction: actionBar});
		} else {
			abilityObj = abilityObj[0];
			abilityObj.set( 'action', abilityMacro );
			abilityObj.set( 'istokenaction', actionBar );
		}
		return abilityObj;
	}
	
/* ------------------------- Character Sheet Database Management ------------------------- */

	/*
	 * Check the version of a Character Sheet database against 
	 * the current version in the API.  Return true if needs updating
	 */
	 
	var checkDBver = function( dbFullName, dbObj, silent ) {
		
		dbFullName = dbFullName.replace(/_/g,'-');
		
		var dbName = dbFullName.toLowerCase(),
			dbCS = findObjs({ type:'character', name:dbFullName },{caseInsensitive:true}),
			dbVersion = 0.0,
			msg, versionObj;
		
		if (dbCS && dbCS.length) {
			dbCS = dbCS[0];
			dbVersion = parseFloat(attrLookup( dbCS, fields.dbVersion ) || dbVersion);
			
			if (dbVersion >= (parseFloat(dbObj.version) || 0)) {
				msg = dbFullName+' v'+dbVersion+' not updated as is already latest version';
				if (!silent) sendFeedback(msg); 
//				log(msg);
				return false;
			}
		}
		return true;
	}

	/*
	 * For magic items that have stored spells or powers, extract 
	 * these from the MI definition and create or update the 
	 * related character sheet database attribute.
	 */
	 
	var addMIspells = function( dbCS, dbItem ) {
		
		var itemData = dbItem.body.match(/}}[\s\w\-]*?(?<!tohit|dmg|ammo|range)data\s*?=\s*?\[.*?[\s,]ns:\d+?.*?\],?(.*?){{/img),
			itemSpells = itemData ? [...('['+itemData[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [],
			spellSet = {MU:[[],[]],PR:[[],[]],PW:[[],[]]};

		_.each(itemSpells, spell => {
			let parsedData = parseData( spell[0], reSpellSpecs );
			if (parsedData && parsedData.spell && ['MU','PR','PW'].includes(parsedData.spell.toUpperCase())) {
				let spellType = parsedData.spell.toUpperCase();
				spellSet[spellType][0].push(parsedData.name);
				spellSet[spellType][1].push((spellType == 'PW') ? (parsedData.perDay+'.'+parsedData.perDay) : (parsedData.level+'.0'));
			}
		});
		if (spellSet.PW && spellSet.PW[0].length) {
			setAttr( dbCS, [fields.ItemPowersList[0]+dbItem.name,fields.ItemPowersList[1]], spellSet.PW[0].join() );
			setAttr( dbCS, [fields.ItemPowerValues[0]+dbItem.name,fields.ItemPowerValues[1]], spellSet.PW[1].join() );
		}
		if (spellSet.PR && spellSet.PR[0].length) {
			setAttr( dbCS, [fields.ItemPRspellsList[0]+dbItem.name,fields.ItemPRspellsList[1]], spellSet.PR[0].join() );
			setAttr( dbCS, [fields.ItemPRspellValues[0]+dbItem.name,fields.ItemPRspellValues[1]], spellSet.PR[1].join() );
		}
		if (spellSet.MU && spellSet.MU[0].length) {
			setAttr( dbCS, [fields.ItemMUspellsList[0]+dbItem.name,fields.ItemMUspellsList[1]], spellSet.MU[0].join() );
			setAttr( dbCS, [fields.ItemMUspellValues[0]+dbItem.name,fields.ItemMUspellValues[1]], spellSet.MU[1].join() );
		}
		return;
	}

	/*
	 * Check the version of a Character Sheet database and, if 
	 * it is earlier than the static data held in this API, update 
	 * it to the latest version.
	 */
	 
	var buildCSdb = function( dbFullName, dbObj, silent ) {
		
		return new Promise(resolve => {
			
			dbFullName = dbFullName.replace(/_/g,'-');

			const dbName = dbFullName.toLowerCase(),
				  spells = dbName.includes('spell') || dbName.includes('power'),
				  charClass = dbName.includes('class'),
				  typeList = (spells ? spTypeLists : (charClass ? clTypeLists : miTypeLists)),
				  rootDB = dbObj.root.toLowerCase();

			var dbVersion = 0.0,
				dbCS = findObjs({ type:'character', name:dbFullName },{caseInsensitive:true}),
				errFlag = false,
				lists = {},
				foundItems = [],
				csDBlist, specs, objType, objBody,
				msg, versionObj, curDB;

			if (!checkDBver( dbFullName, dbObj, silent )) return false; 

			if (dbCS && dbCS.length) {
				let abilities = findObjs({ _type:'ability', _characterid:dbCS[0].id });
	//			log('buildCSdb: database '+dbName+' has '+abilities.length+' abilities');
				_.each( abilities, a => a.remove() );
				dbCS = dbCS[0];
			} else {
				dbCS = createObj( 'character', {name:dbFullName} );
			}
			
			_.each(_.sortBy(dbObj.db,'name'), item => {
				if (foundItems.includes(item.name)) return;
				foundItems.push(item.name);
				item.body = parseStr(item.body,dbReplacers);

				if (!setAbility( dbCS, item.name, item.body )) {
					errFlag = true;
					log('buildCSdb: unable to set database '+dbName+' entry '+item.name);
				} else {
					setAttr( dbCS, [fields.CastingTimePrefix[0]+item.name, 'current'], item.ct );
					setAttr( dbCS, [fields.CastingTimePrefix[0]+item.name, 'max'], (spells ? item.cost : item.charge) );
					addMIspells( dbCS, item );
					let types = item.type.toLowerCase().replace(reIgnore,'').split('|');
					_.each(types,t => {
						if (t && t.length && typeList[t]) {
							let listType = typeList[t].type.toLowerCase();
							if (!lists[listType]) lists[listType] = [];
							if (!lists[listType].includes(item.name)) {
								lists[listType].push(item.name);
							}
						} else if (t && t.length && !typeList[t]) {
							sendError('Unable to identify item type '+t+' when updating '+item.name+' in database '+dbFullName);
						};
					});
				};
				return;
			});
			if (errFlag) {
				sendError( 'Unable to completely update database '+dbName );
			} else {
				_.each(typeList, dbList => setAttr( dbCS, [dbList.field[0],'current'], (lists[dbList.type.toLowerCase()] || ['']).join('|')));
				setAttr( dbCS, fields.dbVersion, dbObj.version );
				dbCS.set('avatar',dbObj.avatar);
				dbCS.set('bio',dbObj.bio);
				dbCS.set('controlledby',dbObj.controlledby);
				dbCS.set('gmnotes',dbObj.gmnotes);
				let msg = 'Updated database '+dbName+' to version '+String(dbObj.version);
				if (!silent) sendFeedback( msg ); else log(msg);
			}
			setTimeout(() => {
				resolve(!errFlag);
			}, 10);
		});
	}
	
	/*
	 * Update databases to latest versions held in API
	 */
 
	async function doUpdateDB(args, silent) {
		
		var dbName = args[0];
			
		if (dbName && dbName.length) {
			let dbLabel = dbName.replace(/-/g,'_');
			if (!dbNames[dbLabel]) {
				sendError('Not found database '+dbName);
			} else {
				log('Updating database '+dbName);
				sendFeedback('Updating database '+dbName);
				let result = await buildCSdb( dbName, dbNames[dbLabel], silent );
			}
		} else if (_.some( dbNames, (db,dbName) => checkDBver( dbName, db, silent ))) {
			log('Updating all AttackMaster databases');
			if (!silent) sendFeedback('Updating all AttackMaster databases');
			_.each( dbNames, (db,dbName) => {
				let dbCS = findObjs({ type:'character', name:dbName.replace(/_/g,'-') },{caseInsensitive:true});
				if (dbCS && dbCS.length) {
					setAttr( dbCS[0], fields.dbVersion, 0 );
				}
			});
			for (const name in dbNames) {
				let result = await buildCSdb( name, dbNames[name], silent );
//				log('doUpdateDB: db '+name+' build result is '+result);
			}

		};
//		log('doUpdateDB: starting indexing');
		apiDBs.attk = true;
		sendAttkAPI('!magic --index-db attk');
		sendAttkAPI('!cmd --index-db attk');
		updateDBindex();
		
		return;
	}
	
	/*
	 * Check a character sheet database and update/create the 
	 * required attributes from the definitions.  This should 
	 * be run after updating or adding item or spell definitions.
	 */
	 
	var checkCSdb = function( args ) {
		
		var dbName = args[0].toLowerCase(),
			lists = {},
			spellsDB,
			classDB,
			dbCSlist,
			dbTypeList;

		var	checkObj = function( obj ) {
				var	objCS, objCSname, objName, objBody, type, objCT, objChg, objCost, specs, spellsDB;

				if (obj.get('type') !== 'ability') return false;
				objCS = getObj('character',obj.get('characterid'));
				objCSname = objCS.get('name').toLowerCase();
				if (!objCSname.includes(dbName) || !objCSname.includes('-db')) return false;
				objBody = obj.get('action');
				specs = objBody.match(/}}\s*specs\s*=(.*?){{/im);
				if (!specs) return true;
				spellsDB = objCSname.includes('spells') || objCSname.includes('powers');
				classDB = objCSname.includes('class');
				dbTypeList = (spellsDB ? spTypeLists : (classDB ? clTypeLists : miTypeLists));
				objName = obj.get('name');
				specs = specs ? [...('['+specs[0]+']').matchAll(/\[\s*?\w[\s\|\w\-\+]*?\s*?,\s*?(\w[\s\|\w\-]*?)\s*?,.*?\]/g)] : [];
				for (const i of specs) {
					type = i[1];
					if (type && type.length) {
						let typeList = type.toLowerCase().replace(reIgnore,'').split('|');
						for (const t of typeList) {
							if (_.isUndefined(dbTypeList[t])) {
								sendError(objName+' is of undefined type '+t+'.  Please correct this item definition.');
							} else {
								let itemType = dbTypeList[t].type;
								if (!lists[objCS.id]) lists[objCS.id] = {};
								if (!lists[objCS.id][itemType]) lists[objCS.id][itemType] = [];
								if (!lists[objCS.id][itemType].includes(objName)) {
									lists[objCS.id][itemType].push(objName);
								};
							};
						};
					};
				};
				objCT	= (objBody.match(/\}\}\s*?\w*?data\s*?=\[.*?[\[,]\s*?sp:(\d+?\.?\d*?)[,\]\s]/im) || ['',0])[1];
				objChg	= (objBody.match(/\}\}\s*?\w*?data\s*?=\[.*?[\[,]\s*?rc:([\w-]+)\s*?[,\]]/im) || ['','uncharged'])[1];
				objCost	= (objBody.match(/\}\}\s*?\w*?data\s*?=\[.*?[\[,]\s*?gp:(\d+?\.?\d*?)[,\]\s]/im) || ['',0])[1];
				setAttr( objCS, [fields.CastingTimePrefix[0]+objName, 'current'], objCT );
				setAttr( objCS, [fields.CastingTimePrefix[0]+objName, 'max'], (spellsDB ? objCost : objChg) );
				addMIspells( objCS, {name:objName,body:objBody} );
				return true;
			};
		
		if (!dbName || !dbName.length) {
			dbName = '-db';
		}
		dbCSlist = filterObjs( obj => checkObj(obj) );
		if (!dbCSlist || !dbCSlist.length) {
			sendFeedback('No databases found with a name that includes '+dbName);
		} else {
			_.each(lists,(types,dbID) => {
				let dbCS = getObj('character',dbID),
					name = dbCS.get('name').toLowerCase();
				spellsDB = name.includes('spells') || name.includes('powers');
				classDB = name.includes('class');
				_.each((spellsDB ? spTypeLists : (classDB ? clTypeLists : miTypeLists)), dbList => {
					if (types[dbList.type]) {
						setAttr( dbCS, [dbList.field[0],'current'], (types[dbList.type].sort().join('|') || '' ));
					}
				});
			});
			sendFeedback(((dbName === '-db') ? 'All databases have' : ('Database '+args[0]+' has')) + ' been updated'); 
		}
		apiDBs.attk = true;
		sendAttkAPI('!magic --index-db attk');
		sendAttkAPI('!cmd --index-db attk');
		updateDBindex();
		return;
	}
	
	/**
	 * Create an internal index of items in the databases 
	 * to make searches much faster.  Index entries indexed by
	 * database root name & short name (name in lower case with 
	 * '-', '_' and ' ' ignored).  index[0] = abilityID,
	 * index[1] = ct-attributeID
	 * v2.045 Check that other database-handling APIs have finished
	 *        updating their databases and performed a handshake
	 **/
	 
	var updateDBindex = function() {
		
		if (Object.values(apiDBs).some(db => !db)) return;

		var rootDB, magicDB, validDB,
			dbName, shortName, attrName;
		
		filterObjs( function(obj) {
			if (obj.get('type') != 'ability') return false;
			if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
			dbName = magicDB.get('name').replace(/-/g,'_');
			if (/\s*v\d*\.\d*/i.test(dbName)) return false;
			let validDB = false;
			for (let rDB in DBindex) {
			    if (dbName.toLowerCase().startsWith(rDB)) {
			        validDB = true;
			        rootDB = rDB;
			    }
			}
			if (!validDB) return false;
			let shortName = obj.get('name').toLowerCase().replace(reIgnore,'');
			if (_.isUndefined(DBindex[rootDB][shortName]) || !stdDB.includes(dbName)) {
				DBindex[rootDB][shortName] = [obj.id,''];
			}
			return true;
		});
		filterObjs( function(obj) {
			if (obj.get('type') != 'attribute') return false;
			attrName = obj.get('name');
			if (!attrName.startsWith('ct-')) return false;
			if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
			dbName = magicDB.get('name').replace(/-/g,'_');
			if (/\s*v\d*\.\d*/i.test(dbName)) return false;
			let validDB = false;
			for (let rDB in DBindex) {
			    if (dbName.toLowerCase().startsWith(rDB)) {
			        validDB = true;
			        rootDB = rDB;
			    }
			}
			if (!validDB) return false;
			let shortName = attrName.toLowerCase().replace(reIgnore,'').substring(2);
			if (!DBindex[rootDB][shortName]) return false;
			if (!stdDB.includes(dbName) || !DBindex[rootDB][shortName][1].length) {
				DBindex[rootDB][shortName][1] = obj.id;
			};
			return true;
		});
		parseClassDB();
		checkACvars(false);
		return;
	}

	/*
	 * Parse the Class Databases to update internal rule tables with 
	 * any changes held for specific Class definitions
	 */
	 
	var parseClassDB = function(silent=true) {
		
//		log('parseClassDB: on entry name=fighter, levels='+weapMultiAttks.fighter.Levels+', melee='+weapMultiAttks.fighter.Proficient.melee);
		_.each( DBindex.class_db, Class => {
			let classDef = getObj('ability',Class[0]).get('action'),
				classData = classDef.match(/}}\s*?ClassData\s*?=(.*?){{/im);
//			log('parseClassDB: raw classData='+classData);
			if (classData && !_.isNull(classData)) {
				classData = [...('['+classData[0]+']').matchAll(/\[.+?\]/g)];
//				log('parseClassDB: unsplit classData='+classData.join(' // '));
				for (let r=0; r<classData.length; r++) {
					let rowData = classData[r][0],
						parsedData = parseData( rowData, reClassSpecs, false );
//					log('parseClassDB: rowData['+r+'][0]='+rowData);
					let	name = (parsedData.name || 'Other').toLowerCase().replace(reIgnore,'');
					if (parsedData.attkLevels || parsedData.attkMelee || parsedData.attkRanged) {
//						log('parseClassDB: parsed levels='+rowData.attkLevels+', parsed melee='+rowData.attkMelee);
						if (_.isUndefined(weapMultiAttks[name])) {
							weapMultiAttks[name] = {};
							weapMultiAttks[name].Levels = new Array(weapMultiAttks.fighter.Levels);
							weapMultiAttks[name].Proficient = Object.create(weapMultiAttks.fighter.Proficient);
//												{melee: new Array(weapMultiAttks.fighter.Proficient.melee, ranged: new Array(weapMultiAttks.fighter.Proficient.ranged}
						}
						if (parsedData.attkLevels) weapMultiAttks[name].Levels = parsedData.attkLevels.split('|');
						if (parsedData.attkMelee) weapMultiAttks[name].Proficient.melee = parsedData.attkMelee.split('|');
						if (parsedData.attkRanged) weapMultiAttks[name].Proficient.ranged = parsedData.attkRanged.split('|');
//						log('parseClassDB: name='+name+', levels='+weapMultiAttks[name].Levels+', melee='+weapMultiAttks[name].Proficient.melee);
					};
					if (parsedData.nonProfPen) {
						classNonProfPenalty[name] = parsedData.nonProfPen;
					};
					let rowArray = rowData.toLowerCase().replace(reIgnore,'').replace(/\[/g,'').replace(/\]/g,'').split(','),
						svlArray = rowArray.filter(elem => elem.startsWith('svl'));
					if (svlArray && svlArray.length) {
						svlArray.sort((a,b)=>{parseInt((a.match(/svl(\d+):/)||[0,0])[1])-parseInt((b.match(/svl(\d+):/)||[0,0])[1]);});
//						log('parseClassDB: rowArray='+rowArray.join(',')+', svlArray='+svlArray.join(','));
						saveLevels[name] = [];
						baseSaves[name] = [];
						let oldLevel = 0,
							baseIndex = 0;
						svlArray.forEach(svl => {
							let sv = svl.match(/svl(\d+):([\d\|]+)/),
								level = parseInt(sv[1] || 0),
								saves = (sv[2] || '20|20|20|20|20').split('|');
//							log('parseClassDB: sv[1]='+sv[1]+', sv[2]='+sv[2]+', level='+level+', saves='+saves.join('|'));
							saveLevels[name].length = level+1;
							saveLevels[name].fill(baseIndex,oldLevel,level+1);
//							log('parseClassDB: after fill('+baseIndex+','+oldLevel+','+level+'), saveLevels.['+name+']='+saveLevels[name]);
							if (baseIndex == 0 && level != 0) {
								baseSaves[name].push([16,18,17,20,19]);
//								log('parseClassDB: pushing saves=[16,18,17,20,19]');
								baseIndex++;
							}
							saves.length = 5;
							baseSaves[name].push(saves);
//							log('parseClassDB: pushing saves='+saves);
							baseIndex++
							oldLevel = level+1;
						});	
//						log('parseClassDB: saveLevels['+name+']='+saveLevels[name]);
//						log('parseClassDB: baseSaves['+name+']='+baseSaves[name].join('],['));
					};
					svlArray = rowArray.filter(elem => {return /^sv[a-z]{3}:/.test(elem);});
//					log('parseClassDB: svlArray = '+svlArray);
					if (svlArray && svlArray.length) {
						classSaveMods[name] = {att:'con',par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0};
						svlArray.forEach(svm => {
							let sv = svm.match(/sv([a-z]{3}):\s*([-\+]?\d+|\w{3})/);
//							log('parseClassDB: sv='+sv+', sv[1]='+sv[1]+', sv[2]='+sv[2]);
							if (sv[1] == 'all') {
								classSaveMods[name] = _.mapObject(classSaveMods[name], (v,k) => {return k != 'att' ? v + (parseInt(sv[2] || 0) || 0) : v;});
							} else {
								classSaveMods[name][sv[1]] = (sv[1] != 'att') ? (parseInt(sv[2] || 0) || 0) : (sv[2] || 'con').toLowerCase().replace(reIgnore,'');
							}
						});
//						log('parseClassDB: classSaveMods['+name+']='+_.chain(classSaveMods[name]).pairs().flatten(false).value());
					};
				};
			};
		});	
//		log('parseClassDB: name=fighter, levels='+weapMultiAttks.fighter.Levels+', melee='+weapMultiAttks.fighter.Proficient.melee);
		return;
	};

	/**
	 * Update or create the help handouts
	 **/
	 
	var updateHandouts = function(silent,senderId) {
		
		_.each(handouts,(obj,k) => {
			let dbCS = findObjs({ type:'handout', name:obj.name },{caseInsensitive:true});
			if (!dbCS || !dbCS[0]) {
			    log(obj.name+' not found.  Creating version '+obj.version);
				if (!silent) sendFeedback(obj.name+' not found.  Creating version '+obj.version);
				dbCS = createObj('handout',{name:obj.name,inplayerjournals:(senderId || '')});
				dbCS.set('notes',obj.bio);
				dbCS.set('avatar',obj.avatar);
			} else {
				dbCS = dbCS[0];
				dbCS.get('notes',function(note) {
					let reVersion = new RegExp(obj.name+'\\s*?v(\\d+?.\\d*?)</span>', 'im');
					let version = note.match(reVersion);
					version = (version && version.length) ? (parseFloat(version[1]) || 0) : 0;
					if (version >= obj.version) {
						if (!silent) sendFeedback('Not updating handout '+obj.name+' as is already version '+obj.version);
					    return;
					}
					dbCS.set('notes',obj.bio);
					dbCS.set('avatar',obj.avatar);
					if (!silent) sendFeedback(obj.name+' handout updated to version '+obj.version);
					log(obj.name+' handout updated to version '+obj.version);
				});
			}
		});
		return;
	}

/* -------------------------------------------- Utility Functions ------------------------------------------------- */
	
	/*
	 * Function to replace special characters in a string
	 */
	 
	var parseStr=function(str,replace=replacers){
		return replace.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}

	/**
	 * Get valid character from a tokenID
	 */
	 
	var getCharacter = function( tokenID, silent=false ) {
	
		var curToken,
		    charID,
		    charCS;
		
		if (!tokenID) {
			sendDebug('getCharacter: tokenID is invalid');
			if (!silent) sendError('Invalid attackMaster arguments');
			return undefined;
		};

		curToken = getObj( 'graphic', tokenID );

		if (!curToken) {
			sendDebug('getCharacter: tokenID is not a token');
			if (!silent) sendError('Invalid attackMaster arguments');
			return undefined;
		};
			
		charID = curToken.get('represents');
			
		if (!charID) {
			sendDebug('getCharacter: charID is invalid');
			if (!silent) sendError('Invalid attackMaster arguments');
			return undefined;
		};

		charCS = getObj('character',charID);

		if (!charCS) {
			sendDebug('getCharacter: charID is not for a character sheet');
			if (!silent) sendError('Invalid attackMaster arguments');
			return undefined;
		};
		return charCS;

	};
	
	/**
	 * Get the configuration for the player who's ID is passed in
	 * or, if the config is passed back in, set it in the state variable
	 **/
	 
	var getSetPlayerConfig = function( playerID, configObj ) {
		
		if (!_.isUndefined(configObj)) {
		    if (!state.magicMaster.playerConfig[playerID]) {
		        state.magicMaster.playerConfig[playerID]={};
		    }
			state.magicMaster.playerConfig[playerID] = configObj;
		}
		return state.magicMaster.playerConfig[playerID];
	};
	/**
	 * Get the current armour class values for tokenID passed.
	 * Returns an AC object containing all possible AC combinations.
	 */
	 
	var getACvalues = function( tokenID ) {
		
		var AC = {},
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug( 'getACvalues: invalid tokenID passed' );
			sendError( 'Internal attackMaster error' );
			return;
		}
		
        AC.sh = {};
        AC.sl = {};
        AC.al = {};

		AC.sh.n = {c:(attrLookup(charCS,fields.Armour_normal) || 10),m:(attrLookup(charCS,[fields.Armour_normal[0],'max']) || 10)};
		AC.sh.m = {c:(attrLookup(charCS,fields.Armour_missile) || 10),m:(attrLookup(charCS,[fields.Armour_missile[0],'max']) || 10)};
		AC.sh.s = {c:(attrLookup(charCS,fields.Armour_surprised) || 10),m:(attrLookup(charCS,[fields.Armour_surprised[0],'max']) || 10)};
		AC.sh.b = {c:(attrLookup(charCS,fields.Armour_back) || 10),m:(attrLookup(charCS,[fields.Armour_back[0],'max']) || 10)};
		AC.sh.h = {c:(attrLookup(charCS,fields.Armour_head) || 10),m:(attrLookup(charCS,[fields.Armour_head[0],'max']) || 10)};
		
		AC.sl.n = {c:(attrLookup(charCS,fields.Shieldless_normal) || 10),m:(attrLookup(charCS,[fields.Shieldless_normal[0],'max']) || 10)};
		AC.sl.m = {c:(attrLookup(charCS,fields.Shieldless_missile) || 10),m:(attrLookup(charCS,[fields.Shieldless_missile[0],'max']) || 10)};
		AC.sl.s = {c:(attrLookup(charCS,fields.Shieldless_surprised) || 10),m:(attrLookup(charCS,[fields.Shieldless_surprised[0],'max']) || 10)};
		AC.sl.b = {c:(attrLookup(charCS,fields.Shieldless_back) || 10),m:(attrLookup(charCS,[fields.Shieldless_back[0],'max']) || 10)};
		AC.sl.h = {c:(attrLookup(charCS,fields.Shieldless_head) || 10),m:(attrLookup(charCS,[fields.Shieldless_head[0],'max']) || 10)};
		
		AC.al.n = {c:(attrLookup(charCS,fields.Armourless_normal) || 10),m:(attrLookup(charCS,[fields.Armourless_normal[0],'max']) || 10)};
		AC.al.m = {c:(attrLookup(charCS,fields.Armourless_missile) || 10),m:(attrLookup(charCS,[fields.Armourless_missile[0],'max']) || 10)};
		AC.al.s = {c:(attrLookup(charCS,fields.Armourless_surprised) || 10),m:(attrLookup(charCS,[fields.Armourless_surprised[0],'max']) || 10)};
		AC.al.b = {c:(attrLookup(charCS,fields.Armourless_back) || 10),m:(attrLookup(charCS,[fields.Armourless_back[0],'max']) || 10)};
		AC.al.h = {c:(attrLookup(charCS,fields.Armourless_head) || 10),m:(attrLookup(charCS,[fields.Armourless_head[0],'max']) || 10)};
		
		return AC;
	}
	/**
	 * String together the value of the specified attribute from
	 * all macro databases with the specified root name, separated
	 * by |.  This is used to get a complete list of available
	 * magic spell or item macros across all databases of a
	 * specific type.
	 **/
	 
	var getMagicList = function( rootDB, listAttr ) {
		
		var magicList = '';
		filterObjs( function(objs) {
			let name = objs.get('name'),
			    newList;
			if (objs.get('type') !== 'character' || !name.startsWith(rootDB)) {return false};
			if (/\s*v\d*\.\d*/i.test(name)) {return false};
			magicList += (magicList.length ? '|' : '') + (attrLookup( objs, listAttr ) || '');
			return true;
		});
		return magicList.split('|').filter( list => !!list ).sort().join('|');
	}

	/*
	 * Create a list of Magic Items in an MI bag, able
	 * to be used to select one from.  A flag determines
	 * whether empty slots '-' are included
	 */

	var makeMIlist = function( charCS, includeEmpty=true, include0=true ) {
	
		var mi, qty, rows, maxSize,
			i = fields.Items_table[1],
			miList = '',
			Items = getTable( charCS, {}, fields.Items_table, fields.Items_name );
			
		Items = getTable( charCS, Items, fields.Items_table, fields.Items_qty );
		rows = i+((Items && Items.sortKeys) ? Items.sortKeys.length : 0);
		maxSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRows;
		
		while (i < rows) {
			if (i<0) {
				mi = attrLookup( charCS, fields.Items_name );
				qty = attrLookup( charCS, fields.Items_qty ) || 0;
			} else {
			    mi = tableLookup( Items, fields.Items_name, i );
			    qty = tableLookup( Items, fields.Items_qty, i );
			}
			if (_.isUndefined(mi)) {break;}
			if (mi.length > 0 && (includeEmpty || mi != '-')) {
				if (include0 || qty > 0) {
    				miList += '|' + qty + ' ' + mi + ',' + i;
				}
			}
			i++;
		}
		if (i < maxSize && i < fields.MIRows && includeEmpty) {
		    miList += '|0 -,'+i;
		}
		return miList;
	}
	
	/*
	 * Create buttons to select Magic Item slots from. Highlight
	 * any button with the index of MIrowref.  A flag determines
	 * whether empty slots '-' are included.
	 */
//		content += makeMIbuttons( tokenID, 'current', fields.Items_qty[1], BT.SLOT_MI, '|'+selectedMI, MIrowref, false, true );

	var makeMIbuttons = function( tokenID, miField, qtyField, cmd, extension='', MIrowref, disable0=true, includeEmpty=false, pickID ) {
		
		var charCS = getCharacter(tokenID),
		    isView = extension == 'viewMI',
			i = fields.Items_table[1],
		    qty, mi, type, makeGrey, Items, rows, maxSize, content = '';
		
		if (!_.isUndefined(pickID)) {
			charCS = getCharacter(pickID);
			if (!charCS) {
				charCS = getCharacter(tokenID);
			}
		}
		
		if (_.isUndefined(MIrowref)) MIrowref = -1;

		Items = getTable( charCS, {}, fields.Items_table, fields.Items_name );
		Items  = getTable( charCS, Items, fields.Items_table, fields.Items_qty );
		Items  = getTable( charCS, Items, fields.Items_table, fields.Items_type );

		rows = i+((Items && Items.sortKeys) ? Items.sortKeys.length : 0);
		maxSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRows;
		
		while (i < rows) {
			mi = tableLookup( Items, fields.Items_name, i, false, ['',miField] );
			qty = tableLookup( Items, fields.Items_qty, i, true, ['',miField] );
			type = tableLookup( Items, fields.Items_type, i ).toLowerCase();
			makeGrey = (type != 'selfchargeable' && disable0 && qty == 0);
			if (_.isUndefined(mi)) {break;}
			if (mi.length > 0 && (includeEmpty || mi != '-')) {
				content += (i == MIrowref || makeGrey) ? ('<span style=' + (i == MIrowref ? design.selected_button : design.grey_button) + '>') : '['; 
				content += (mi != '-' ? (qty + ' ') : '') + mi;
				if (isView) {
					extension = '\n&#37;{'+abilityLookup( fields.MagicItemDB, mi ).dB+'|'+mi+'}';
				}
				content += (i == MIrowref || makeGrey) ? '</span>' : '](!attk --button '+cmd+'|' + tokenID + '|' + i + extension + ')';
			};
			i++;
		};
		if (i < maxSize && i < fields.MIRows && includeEmpty) {
			content += i == MIrowref ? ('<span style=' + design.selected_button +'>' ) : '['; 
			content += '-';
			content += i == MIrowref  ? '</span>' : '](!attk --button '+BT.ADD_MIROW+'|'+cmd+'|' + tokenID + '|' + i + extension + ')';
		}
		return content;
	}
	
	/*
	 * Determine the class or classes of the character, and 
	 * the level of each
	 *
	 */
	 
	var getCharLevels = function( charCS ) {
		return _.filter( fields, (elem,l) => {return l.toLowerCase().includes('_level')})
					.filter( elem => {return 0 < (attrLookup( charCS, elem ) || 0)});
	}
	
	/*
	 * Determine the non-weapon proficiency penalty for the class or classes 
	 * of the character
	 */
	 
	var getCharNonProfs = function( charCS ) {
		
		var sheetNonProf = attrLookup( charCS, fields.NonProfPenalty ),
			penalties = _.filter( defaultNonProfPenalty, elem => (0 < (attrLookup(charCS,elem[1]) || 0)));
		if (!state.attackMaster.weapRules.prof && !_.isUndefined(sheetNonProf)) {
			return sheetNonProf;
		} else if (!penalties || !penalties.length) {
		    return 0;
		} else {
		    return _.map(penalties, elem => classNonProfPenalty[(attrLookup( charCS, elem[0] ) || '').toLowerCase().replace(reIgnore,'')] || elem[2])
					.reduce((penalty,highest) => Math.max(penalty,highest));
		}
	}
	
	/*
	 * Find the racial weapon mods for a character
	 */
	 
	var raceMods = function( charCS, wt, wst ) {
		var weaponMod,
		    race = attrLookup( charCS, fields.Race ) || '',
    		mods = _.find( raceToHitMods, (elem,r) => {return (race.toLowerCase().includes(r.toLowerCase()));});
		if (_.isUndefined(mods)) {return 0;}
		weaponMod = _.find( mods, elem => {return [wt.toLowerCase(),wst.toLowerCase()].includes(elem[0].toLowerCase());});
		if (_.isUndefined(weaponMod)) {return 0;}
		return weaponMod[1];
	}
	
	/*
	 * Parse a data string for attribute settings
	 */
	 
	var parseData = function( attributes, reSpecs, def=true ) {
		
		var parsedData = {},
			val;

		_.each( reSpecs, spec => {
			val = attributes.match(spec.re);
			if (!!val && val.length>1 && val[1].length) {
				parsedData[spec.field] = val[1];
			} else if (!def) {
				parsedData[spec.field] = undefined;
			} else {
				parsedData[spec.field] = spec.def;
			}
		});
		return parsedData;
	}
	
	/*
	 * Create an array of class objects for the classes
	 * of the specified character.
	 */
	 
	var classObjects = function( charCS ) {
		
		var charLevels = (getCharLevels( charCS ) || fields.Fighter_level),
			charClass, baseClass, charLevel;
			
//		log('classObjects: got variables, charLevels='+_.chain(charLevels).values().flatten(false).value());
		var value = _.filter( classLevels, a => {
    		    return _.some( charLevels, b => {
    		        return (a[1].includes(b[0]))
    		    })
    		})
			.map( elem => {
				charClass = attrLookup(charCS,elem[0]) || '';
				charLevel = attrLookup( charCS, elem[1] ) || 0;
//				log('classObjects: checking class '+charClass);
				if (elem[0][0] == fields.Wizard_class[0]) {
					baseClass = 'wizard';
				} else if (elem[0][0] == fields.Priest_class[0]) {
					baseClass = 'priest';
				} else if (elem[0][0] == fields.Rogue_class[0]) {
					baseClass = 'rogue';
				} else if (elem[0][0] == fields.Psion_class[0]) {
					baseClass = 'psion';
				} else if (elem[1][0] == fields.Monster_hitDice[0]) {
					let	monsterHD = parseInt(attrLookup( charCS, fields.Monster_hitDice )) || 0,
						monsterHPplus = parseInt(attrLookup( charCS, fields.Monster_hpExtra )) || 0,
						monsterIntField = attrLookup( charCS, fields.Monster_int ) || '',
						monsterIntNum = parseInt((monsterIntField.match(/\d+/)||["1"])[0]) || 0,
						monsterInt = monsterIntField.toLowerCase().includes('non') ? 0 : monsterIntNum;
					charLevel = Math.ceil((monsterHD + Math.ceil(monsterHPplus/4)) / (monsterInt != 0 ? 1 : 2));  // Calculation based on p65 of DMG
					baseClass = 'warrior';
					if (!charClass || !charClass.length) {
						charClass = attrLookup(charCS,fields.Race) || 'creature';
					};
				} else {
					baseClass = 'warrior';
				}
				let classObj = abilityLookup( fields.ClassDB, charClass, true );
				if (_.isUndefined(classObj.obj)) {
//					log('classObject: unknown class');
					charClass = baseClass;
//					log('classObjects: using class '+charClass+' instead');
					classObj = abilityLookup( fields.ClassDB, baseClass );
				}
				return {name:charClass.toLowerCase().replace(reIgnore,''), base:baseClass.toLowerCase().replace(reIgnore,''), level:charLevel, obj:classObj.obj[0]};
			});
//		log('classObjects:returning '+value.length+' class objects');
		return (_.isUndefined(charLevel) ? [{name:'creature', base:'warrior', level:0, obj:abilityLookup( fields.ClassDB, 'creature' ).obj[0]}] : value);
	};
	
	/*
	 * Determine if a particular item type or superType is an 
	 * allowed type for a specific class.
	 */
	 
	var classAllowedItem = function( charCS, wname, wt, wst, allowedItemsByClass ) {
		
//		log('classAllowedItem: called');

        wt = wt ? wt.toLowerCase().replace(reIgnore,'') : '-';
        wst = wst ? wst.toLowerCase().replace(reIgnore,'') : '-';
        wname = wname ? wname.toLowerCase().replace(reIgnore,'') : '-';
		allowedItemsByClass = allowedItemsByClass.toLowerCase().replace(reIgnore,'');
		
		var typeDefaults = {weaps:'any',ac:'any',sps:'any',spm:'',spb:'',align:'any',race:'any'},
			itemType = !_.isUndefined(typeDefaults[allowedItemsByClass]) ? allowedItemsByClass : 'weaps';
			
//		log('classAllowedItem: got variables');
		var value = classObjects( charCS ).some( elem => {
				let classData = elem.obj.get('action');
				classData = classData.match(/}}\s*ClassData\s*=(.*?){{/im);
				classData = parseData( classData[1], reClassSpecs );
				let allowedItems = (classData[itemType] || typeDefaults[itemType]).split('|');
                return _.some( allowedItems, item => item.includes('any') || wt.includes(item)
																		  || wst.includes(item)
																		  || (wt=='-' && wst=='-' && wname.includes(item)));  	    
				});
//		log('classAllowedItem: returning '+value);
		return value;
	};
	
	/*
	 * Determine if the character has a shield in-hand
	 */
	 
	var shieldInHand = function( charCS, shieldTrueName ) {
		var inHandTable = getTable( charCS, {}, fields.InHand_table, fields.InHand_trueName );
		return !_.isUndefined(tableFind( inHandTable, fields.InHand_trueName, shieldTrueName ));
	}
	
	/*
	 * Check all Character Sheets represented by Tokens to ensure 
	 * that they have Slash, Pierce & Bludgeon AC fields created.
	 * This is necessary for Targeted Attacks to not cause errors 
	 * when used on an opponent and the opponent's AC vs. damage 
	 * type is read and displayed.
	 */
	 
	async function checkACvars(forceUpdate) {
		
		log('checkACvars: called');
		
		var errFlag, charCS;
		
		var setAC = function( tokenID ) {
			
			return new Promise(resolve => {

				var errFlag = doCheckAC( [tokenID], true, [], true );
				setTimeout(() => {
					resolve(errFlag);
				}, 10);
			});
		};
		
		var tokens = filterObjs( function(obj) {
				if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') return false;
				if (!(charCS = getObj('character',obj.get('represents')))) return false;
				return forceUpdate || _.isUndefined(attrLookup( charCS, fields.SlashAC ));
			});
			
		log('checkACvars: found '+tokens.length+' tokens');
			
		for (const t of tokens) {
			log('checkACvars: checking AC values for '+t.get('name'));
			errFlag = await setAC(t.id);
		};
		log('AttackMaster finished checking token AC values');
		return;
	};
			
	
	/*
	 * Determine the number of attacks per round for a weapon,
	 * using the type, superType or class (melee/ranged) of 
	 * the weapon.
	 */
	 
	var getAttksPerRound = function( charCS, proficiency, weaponSpecs, weapBase ) {

		var level = Math.max((parseInt(attrLookup( charCS, fields.Fighter_level )) || 0),0),
			charClass = (attrLookup( charCS, fields.Fighter_class ) || 'fighter').toLowerCase().replace(reIgnore,''),
			wt = weaponSpecs[1].toLowerCase().replace(reIgnore,''),
			wst = weaponSpecs[4].toLowerCase().replace(reIgnore,''),
			wc = weaponSpecs[2].toLowerCase().replace(reIgnore,''),
			levelsData = [],
			boost, newVal, result, attksData;
			
		if (_.isUndefined(weapMultiAttks[charClass])) {
//			log('getAttksPerRound: '+charClass+' not found in weapMultiAttks');
			charClass = 'fighter';
		}
		attksData = proficiency > 0 ? weapMultiAttks.Specialist : weapMultiAttks[charClass].Proficient;
		if (_.isUndefined(boost = attksData[wt])) {
			if (_.isUndefined(boost = attksData[wst])) {
				if (_.isUndefined(boost = attksData[wc])) {
					return weapBase;
				}
			}
		}
		levelsData = Array.from(weapMultiAttks[charClass].Levels);
		if (_.isUndefined(levelsData) || !levelsData.length)
			{levelsData = [0];}
//		log('levelsData before reverse='+levelsData);
		levelsData = levelsData.reverse();
//		log('levelsData after reverse='+levelsData+', weapMultiAttks.Levels='+weapMultiAttks[charClass].Levels);
		let addition = (boost[(levelsData.length - 1 - levelsData.findIndex(l => l <= level ))] || boost[boost.length-1]);
		try {
			newVal = eval('2*('+ weapBase + '+' + addition +')');
			result = (newVal % 2) ? newVal + '/2' : newVal/2;
		} catch {
			result = weapBase;
		}
//		log('getAttksPerRound: levelsData='+levelsData+', boost='+boost+', addition='+addition+' newVal='+newVal+', result='+result);

		return result;
	}
	
	/*
	 * Get a bar value from the right place for this token.  This should be from 
	 * a bar current value on the token (to support multi-token monsters affected 
	 * individually by +/- magic impacts on bar values) but checks if another bar allocated
	 * or, if none are, get from character sheet (monster or character)
	 */
	 
	var getTokenValue = function( curToken, tokenBar, field, altField, nameFlag=false ) {
		
		var charCS = getCharacter(curToken.id),
			attr = field[0].toLowerCase(),
			altAttr = altAttr ? altField[0].toLowerCase() : 'EMPTY',
			property = field[1],
			attrVal, attrObj, attrName;
			
		if (!charCS) {return undefined;}
		
		if (tokenBar && tokenBar[0].length) {
			attrVal = parseInt(curToken.get(tokenBar[0]+'_'+tokenBar[1]));
			attrName = tokenBar[0];
		}
		if (isNaN(attrVal)) {
			if (_.some( ['bar2_link','bar1_link','bar3_link'], linkName=>{
				let linkID = curToken.get(linkName);
				if (linkID) {
					attrObj = getObj('attribute',linkID);
					if (attrObj) {
						attrName = attrObj.get('name').toLowerCase();
						return (attrName.includes(attr) || attrName.includes(altAttr));
					}
				}
				return false;
			})) {
				attrVal = parseInt(attrObj.get(property));
			}
		}
		if (isNaN(attrVal) && attr == 'thac0') {
			attrVal = parseInt(attrLookup( charCS, fields.Thac0_base ));
			attrName = fields.Thac0_base[0];
		}
		if (isNaN(attrVal)) {
			attrVal = parseInt(attrLookup( charCS, field ));
			attrName = field[0];
		}
		if (altField && isNaN(attrVal)) {
			attrVal = parseInt(attrLookup( charCS, altField ));
			attrName = altField[0];
		}
		return (!nameFlag ? attrVal : (isNaN(attrVal) ? undefined : attrName));
	}
	
/* ----------------------------------------------- Weapon Management Functions ----------------------------------------
	
	/*
	 * Create a Roll Query with a list of either 1H or 2H 
	 * weapons from the character's magic item bag
	 */
	
	var weaponQuery = function( charCS, handed, anyHand=0 ) {
		
		var magicDB, magicName,
			itemTable = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
			itemObjs = itemTable[fields.Items_name[0]].attrs,
			weaponList = ['-,-','Touch,-2'],
			re = /\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?,\s*?(\d+)H\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/ig;
			
		if (handed > 2) {
		    handed = '[0-9]+'
		}
		
		_.each(itemObjs, (item,id) => {
			let itemName = item.get('current');
			let nameMatch = itemName.toLowerCase().replace(reIgnore,'');
			let mi = abilityLookup( fields.MagicItemDB, itemName );
			if (!mi.obj) return;
			let specs = mi.obj[0].get('action');
			let weaponSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?(?:melee|ranged).*?\])\s*?{{/im);
			weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(re)] : [];
			if (_.some(weaponSpecs, (w) => ((w[3]==handed || (anyHand && w[3]>=anyHand && w[3]<=handed))
						&& (!state.attackMaster.weapRules.classBan || classAllowedItem( charCS, nameMatch, w[1], w[4], 'weaps' ))))) {
				weaponList.push(itemName+','+itemTable.sortKeys.indexOf(id));
				return;
			}
			let shieldSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?shield.*?\])\s*?{{/im);
			shieldSpecs = shieldSpecs ? [...('['+shieldSpecs[0]+']').matchAll(re)] : [];
			if (_.some(shieldSpecs, (s) => ((s[3]==handed || (anyHand && s[3]>=anyHand && s[3]<=handed))
						&& (state.attackMaster.weapRules.allowArmour || classAllowedItem( charCS, nameMatch, s[1], s[4], 'ac' ))))) {
				weaponList.push(itemName+','+itemTable.sortKeys.indexOf(id));
				return;
			}
		});
			
		return '&#63;{Which weapon?|'+weaponList.join('|')+'}';
	}
	
	/*
	 * Check for a character's proficiency with a weapon type
	 */

	var proficient = function( charCS, wname, wt, wst ) {
		
        wname = wname ? wname.toLowerCase().replace(reIgnore,'') : '';
        wt = wt ? wt.toLowerCase().replace(reIgnore,'') : '';
        wst = wst ? wst.toLowerCase().replace(reIgnore,'') : '';
        
		var i = fields.WP_table[1],
			prof = getCharNonProfs( charCS ),
			WeaponProfs = getTable( charCS, {}, fields.WP_table, fields.WP_name ),
			WeaponProfs = getTable( charCS, WeaponProfs, fields.WP_table, fields.WP_type ),
			WeaponProfs = getTable( charCS, WeaponProfs, fields.WP_table, fields.WP_specialist ),
			WeaponProfs = getTable( charCS, WeaponProfs, fields.WP_table, fields.WP_mastery ),
			allowedWeap = state.attackMaster.weapRules.allowAll || classAllowedItem( charCS, wname, wt, wst, 'weaps' ),
			spec, wpName, wpType;
			
		if (allowedWeap) {
			do {
				wpName = tableLookup( WeaponProfs, fields.WP_name, i, false );
				wpType = tableLookup( WeaponProfs, fields.WP_type, i );
				if (_.isUndefined(wpName)) {break;}
				wpName = wpName.toLowerCase().replace(reIgnore,'');
				wpType = (!!wpType ? wpType.toLowerCase().replace(reIgnore,'') : '');

				let isType = (wpName && wpName.length && wt.includes(wpName)),
					isSuperType = (wpType && (wst.includes(wpType))),
					isSameName = (wpName && wpName.length && wname.includes(wpName));
					
				if (isType || (!isSuperType && isSameName)) {
					prof = Math.max(prof,0);
					spec = tableLookup( WeaponProfs, fields.WP_specialist, i );
					if (spec && spec != 0) {
						prof = Math.max(prof,2);
					}
					spec = tableLookup( WeaponProfs, fields.WP_mastery, i );
					if (spec && spec != 0) {
						prof = Math.max(prof,3);
					}
				} else if (isSuperType) {
					prof = Math.floor(prof/2);
				}
				i++;
			} while (!_.isUndefined(wpName));
		}
		if (prof < 0 && !allowedWeap) {
			if (state.attackMaster.weapRules.classBan) {
				prof = -100;
			} else {
				prof *= 2;
			}
		}
		return prof;
	};
	
	/*
	 * Blank the quiver, ready to be updated with what ammo 
	 * you have in hand at the moment.
	 */
	 
	var blankQuiver = function( charCS, Quiver ) {
		
		var i = Quiver.table[1]-1;
		while(!_.isUndefined(tableLookup( Quiver, fields.Quiver_name, ++i, false ))) {
			Quiver = tableSet( Quiver, fields.Quiver_name, i, '-' );
			Quiver = tableSet( Quiver, fields.Quiver_trueName, i, '-' );
		}
		Quiver.index = Quiver.table[1];
		return Quiver;
	}
	
	/*
	 * Remove the specified weapon from the attack weapon tables
	 */
	 
	var blankWeapon = function( charCS, WeaponInfo, tables, weapon ) {
	    
        var i, f;

        for (const e of tables) {
            i = WeaponInfo[e].table[1]-1;
            f = WeaponInfo[e].fieldGroup;
    	    while (!_.isUndefined(tableLookup( WeaponInfo[e], fields[f+'name'], ++i, false ))) {
    	        if (weapon == tableLookup( WeaponInfo[e], fields[f+'miName'], i )) {
    	            addTableRow( WeaponInfo[e], i );
    	        }
    	    }
        }
	    return WeaponInfo;
	}
	
	/*
	 * Filter the specified weapon table, to remove all but the
	 * weapons InHand and in Quiver
	 */

	var filterWeapons = function( tokenID, charCS, InHand, Quiver, Weapons, table ) {
		
		var i, base, weapTableField, WeaponTable, weapName,
		    curToken = getObj('graphic',tokenID),
		    CheckTable = InHand,
		    checkTableField = fields.InHand_trueName;

		switch (table.toUpperCase()) {
		case 'MELEE':
			weapTableField = fields.MW_miName;
			break;
		case 'RANGED':
			weapTableField = fields.RW_miName;
			break;
		case 'DMG':
			weapTableField = fields.Dmg_miName;
			break;
		case 'AMMO':
			weapTableField = fields.Ammo_miName;
			CheckTable = Quiver;
			checkTableField = fields.Quiver_trueName;
			
			break;
		}
				
		WeaponTable = Weapons[table];
		i = WeaponTable.table[1]-1;
		while(!_.isUndefined(weapName = tableLookup( WeaponTable, weapTableField, ++i, false ))) {
			if (weapName && weapName.length && weapName != '-' && _.isUndefined(tableFind( CheckTable, checkTableField, weapName ))) {
				WeaponTable = addTableRow( WeaponTable, i );
        		sendAPImacro(curToken,'',weapName,'-sheath');
			}
		}

		return;
	};
	
	/*
	 * Set up attack table row data using parsed attributes
	 */
	 
	var setAttackTableRow = function( charCS, group, weapon, weapData, proficiency, values ) {
		
		_.each( weapData, (val,key) => {

			if (key == 'dmgType') {
				if (_.isUndefined(fields[group+'slash']) || _.isUndefined(fields[group+'pierce']) || _.isUndefined(fields[group+'bludgeon'])) return;
				let dmgType=val.toUpperCase();
				values[fields[group+'slash'][0]][fields[group+'slash'][1]]=(dmgType.includes('S')?1:0);
				values[fields[group+'pierce'][0]][fields[group+'pierce'][1]]=(dmgType.includes('P')?1:0);
				values[fields[group+'bludgeon'][0]][fields[group+'bludgeon'][1]]=(dmgType.includes('B')?1:0);
			} else {
				if (_.isUndefined(fields[group+key])) return;
				let property = fields[group+key];
				if (key != 'noAttks') {
					values[property[0]][property[1]]=val;
				} else {
					values[property[0]][property[1]] = getAttksPerRound(charCS, proficiency, weapon, val );
				}
			}
		});
		return values;
	}
	
	/*
	 * Insert ammo that has been found into the Ammo table
	 * but avoid duplicates by searching tableInfo ammoTypes
	 */
	
	var insertAmmo = function( charCS, ammoTrueName, ammoSpecs, rangeSpecs, tableInfo, ammoType, sb, miIndex ) {
        var ammoData, specType, specSuperType, values, rowAmmo, ammoRow, qty,
			typeCheck = ammoType.toLowerCase().replace(reIgnore,'');
        if (tableInfo.ammoTypes.includes(ammoTrueName+'-'+ammoType)) {return tableInfo;}
		tableInfo.ammoTypes.push(ammoTrueName+'-'+ammoType);
        blankWeapon( charCS, tableInfo, ['AMMO'], ammoTrueName );
		for (let w=0; w<ammoSpecs.length; w++) {
			ammoData = ammoSpecs[w][0];
			specType = (ammoData.match(/[\[,\s]t:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','unknown'])[1].toLowerCase().replace(reIgnore,'');
			specSuperType = (ammoData.match(/[\[,\s]st:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','unknown'])[1].toLowerCase().replace(reIgnore,'');
			if (typeCheck == specType || typeCheck == specSuperType) {
				values = initValues( tableInfo.AMMO.fieldGroup );
				values[fields.Ammo_name[0]][fields.Ammo_name[1]]=(ammoData.match(/[\[,\s]w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','Unknown ammo'])[1];
				values[fields.Ammo_strBonus[0]][fields.Ammo_strBonus[1]]=(sb ? (ammoData.match(/[\[,\s]sb:\s*?([01])\s*?[,\]]/i) || [0,0])[1] : 0);
				values[fields.Ammo_adj[0]][fields.Ammo_adj[1]]=(ammoData.match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || [0,0])[1];
				values[fields.Ammo_reuse[0]][fields.Ammo_reuse[1]]=(ammoData.match(/[\[,\s]ru:\s*?([+-]?[01])\s*?[,\]]/i) || [0,0])[1];
				values[fields.Ammo_dmgSM[0]][fields.Ammo_dmgSM[1]]=(ammoData.match(/[\[,\s]sm:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
				values[fields.Ammo_dmgL[0]][fields.Ammo_dmgL[1]]=(ammoData.match(/[\[,\s]l:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
				values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=qty=parseInt((ammoData.match(/[\[,\s]qty:\s*?(\d+?)[,\]]/i) || [0,0])[1]);
				values[fields.Ammo_setQty[0]][fields.Ammo_setQty[1]] = qty ? 1 : 0;
				if (!qty) {
					values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=qty=(attrLookup( charCS, fields.Items_qty, fields.Items_table, miIndex ) || 1);
					values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]]=(parseInt(attrLookup( charCS, fields.Items_trueQty, fields.Items_table, miIndex )) || qty);
				} else {
					values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]] = qty;
				}
				values[fields.Ammo_attkAdj[0]][fields.Ammo_attkAdj[1]]=(rangeSpecs[0][0].match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || ['',''])[1];
				values[fields.Ammo_range[0]][fields.Ammo_range[1]]=(rangeSpecs[0][0].match(/[\[,\s]r:\s*?([-\d\/]+)/i) || ['',''])[1];
				values[fields.Ammo_type[0]][fields.Ammo_type[1]]=ammoType;
				values[fields.Ammo_miName[0]][fields.Ammo_miName[1]]=ammoTrueName;
				
	//			ammoRow = tableInfo.AMMO.table[1]-1;
	//			do {
	//				rowAmmo = tableLookup( tableInfo.AMMO, fields.Ammo_name, ++ammoRow, false );
	//			} while (!_.isUndefined(rowAmmo) && (rowAmmo != '-'));

				tableInfo.AMMO = addTableRow( tableInfo.AMMO, tableFind( tableInfo.AMMO, fields.Ammo_name, '-' ), values );
			}
		}
		return tableInfo;
	}

	/*
	 * Find ammo for the specified ranged weapon type, and
	 * add it to the ammo table
	 */

	var addAmmo = function( charCS, tableInfo, Quiver, weaponType, weaponSuperType, sb, inQuiver ) {
		
		var miIndex = fields.Items_table[1]-1,
			MagicItems = getTable( charCS, {}, fields.Items_table, fields.Items_trueName ),
			MagicItems = getTable( charCS, MagicItems, fields.Items_table, fields.Items_name ),
            weaponType = weaponType ? weaponType.toLowerCase().replace(reIgnore,'') : '',
            weaponSuperType = weaponSuperType ? weaponSuperType.toLowerCase().replace(reIgnore,'') : '',
		    ammoTypeCheck = new RegExp('[\[,\s]t:\\s*?'+weaponType+'\\s*?[,\\]]', 'i'),
			ammoSuperTypeCheck = new RegExp('[\[,\s]st:\\s*?'+weaponSuperType+'\\s*?[,\\]]', 'i'),
			rangeTypeCheck = new RegExp( '[\[,\s]t:\\s*?'+weaponType+'\\s*?[,\\]]','i' ),
		    rangeSuperTypeCheck = new RegExp( '[\[,\s]t:\\s*?'+weaponSuperType+'\\s*?[,\\]]','i' ),
			attrs, sortKeys, ammoName, ammoTrueName, ammo, ammoSpecs, rangeSpecs, t;

		while (!_.isUndefined(ammoName = tableLookup(MagicItems,fields.Items_name,++miIndex,false))) {
		    ammoTrueName = tableLookup(MagicItems,fields.Items_trueName,miIndex) || ammoName;
			let ammoData, ammoMatch;
			ammo = abilityLookup( fields.MagicItemDB, ammoTrueName );
    		ammoSpecs = rangeSpecs = [];

			if (ammo.obj && ammo.obj[0]) {
			    ammoData = ammo.obj[0].get('action');
			    if (ammoData && ammoData.length) {
					ammoMatch = [...(' '+ammoData.match(/}}\s*?ammodata\s*?=.*?(?:\n.*?)*{{/im)).matchAll(/\[.*?\]/g)];
					if (ammoMatch && ammoMatch[0] && ammoMatch[0][0]) {
						ammoSpecs = ammoMatch.filter(elem => ammoTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
						if (!ammoSpecs.length) {
							ammoSpecs = ammoMatch.filter(elem => ammoSuperTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
							t = weaponSuperType;
						} else {
    						t = weaponType;
						}
					}
					if (ammoSpecs && ammoSpecs.length) {
						if (!tableInfo.ammoTypes.includes(ammoTrueName+'-'+t)) {
							ammoMatch = [...(' '+ammoData.match(/}}\s*?rangedata\s*?=.*?(?:\n.*?)*{{/im)).matchAll(/\[.*?\]/g)];
							if (ammoMatch && ammoMatch[0]) {
																			
								rangeSpecs = ammoMatch.filter(elem => rangeTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
								if (!rangeSpecs.length) {
																				  
									rangeSpecs = ammoMatch.filter(elem => rangeSuperTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
								}
							}
							if (!!rangeSpecs.length) {
								if (inQuiver) {
									tableInfo = insertAmmo( charCS, ammoTrueName, ammoSpecs, rangeSpecs, tableInfo, t, sb, miIndex );
								}
								let values = initValues( Quiver.fieldGroup );
								values[fields.Quiver_name[0]][fields.Quiver_name[1]] = ammoName;
								values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = ammoTrueName;
								values[fields.Quiver_index[0]][fields.Quiver_index[1]] = miIndex;
								Quiver = addTableRow( Quiver, Quiver.index, values, Quiver.fieldGroup );
								Quiver.index++;
							}
						}
					}
				} else {
				    log('addAmmo no ammo defined for '+ammoTrueName);
					sendDebug('addAmmo no ammo defined for '+ammoTrueName);
				}
			} else {
			    log('addAmmo not found MI definition for '+ammoTrueName);
				sendDebug('addAmmo not found MI definition for '+ammoTrueName);
			}
		}
		return [tableInfo, Quiver];
	}
	
	/*
	 * Add a weapon to the weapon tables.  Get the full specs from 
	 * the magic item database.  If it is a ranged weapon, also 
	 * search for matching ammo.  Use a returned array to ensure 
	 * ammo duplications don't occur
	 */

	var addWeapon = function( charCS, hand, noOfHands, lineNo, dancing, tableInfo, Quiver ) {

		if (isNaN(lineNo) || lineNo < -3) {
			if (!!hand) {
				setAttr( charCS, hand, '' );
			}
			return [tableInfo,Quiver];
		}
		
		var weaponName = lineNo >= -1 ? attrLookup( charCS, fields.Items_name, fields.Items_table, lineNo ) : (lineNo == -2 ? 'Touch' : 'Lend-a-Hand');
		
		var	weaponTrueName = lineNo >= -1 ? (attrLookup( charCS, fields.Items_trueName, fields.Items_table, lineNo ) || weaponName) : weaponName,
			item = abilityLookup(fields.WeaponDB, weaponTrueName),
			specs = item.obj[0].get('action'),
			weaponSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?(?:melee|ranged).*?\])\s*?{{/im),
			toHitSpecs = specs.match(/}}\s*ToHitData\s*=(.*?){{/im),
			dmgSpecs = specs.match(/}}\s*DmgData\s*=(.*?){{/im),
			ammoSpecs = specs.match(/}}\s*AmmoData\s*=(.*?){{/im),
			re = /[\s\-]*?/gi,
			tempObj, values, group,
			wt, wst, dmg,
			rowWeap, weapRow,
			dancingProf;
			
		blankWeapon( charCS, tableInfo, ['MELEE','RANGED','DMG','AMMO'], weaponTrueName );
		
		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
		toHitSpecs = toHitSpecs ? [...('['+toHitSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		dmgSpecs = dmgSpecs ? [...('['+dmgSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];

		if (!!hand) {
			setAttr( charCS, hand, weaponName );
		}
		
		for (let i=0; i<Math.min(weaponSpecs.length,toHitSpecs.length); i++) {
			let weapon = weaponSpecs[i],
				toHit = toHitSpecs[i][0],
				innate = weapon[2].toLowerCase().includes('innate'),
				proficiency = innate ? 0 : proficient( charCS, weaponTrueName, weapon[1], weapon[4] ),
				attk2H = weapon[3]=='2H' ? 1 : 0;
			
			if ((noOfHands == 0) || (noOfHands ==  (attk2H+1))) {
			
				let weapData = parseData( toHit, reWeapSpecs );
				
				if (weapon[2].toLowerCase().includes('melee')) {

					values = initValues( tableInfo.MELEE.fieldGroup );
					values[fields.MW_name[0]][fields.MW_name[1]]='Unknown weapon';
					
					values = setAttackTableRow( charCS, tableInfo.MELEE.fieldGroup, weapon, weapData, proficiency, values );
					values[fields.MW_miName[0]][fields.MW_miName[1]]=weaponTrueName;
					values[fields.MW_twoHanded[0]][fields.MW_twoHanded[1]]=attk2H;
					values[fields.MW_profLevel[0]][fields.MW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.MW_type[0]][fields.MW_type[1]]=innate ? 'innate' : weapon[1];
					values[fields.MW_superType[0]][fields.MW_superType[1]]=weapon[4];
					values[fields.MW_dancing[0]][fields.MW_dancing[1]]=(dancing?1:0);
					dancingProf = parseInt(values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] = getAttksPerRound(charCS, 
														 dancingProf, 
														 weapon,
														 values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] );
					}
					if (_.isUndefined( weapRow = tableFind( tableInfo.MELEE, fields.MW_name, '-', false ))) weapRow = tableInfo.MELEE.sortKeys.length;
					tableInfo.MELEE = addTableRow( tableInfo.MELEE, weapRow, values );
						
					if (dmgSpecs && i<dmgSpecs.length && !_.isUndefined(dmg=dmgSpecs[i][0])) {
						values = setAttackTableRow( charCS, tableInfo.DMG.fieldGroup, weapon, parseData( dmg, reWeapSpecs ), proficiency, initValues( tableInfo.DMG.fieldGroup ) );
						values[fields.Dmg_type[0]][fields.Dmg_type[1]]=innate ? 'innate' : weapon[1];
						values[fields.Dmg_superType[0]][fields.Dmg_superType[1]]=weapon[4];
						values[fields.Dmg_miName[0]][fields.Dmg_miName[1]]=weaponTrueName;
						values[fields.Dmg_specialist[0]][fields.Dmg_specialist[1]]=(proficiency>=1)?1:0;
						
						tableInfo.DMG = addTableRow( tableInfo.DMG, weapRow, values );
					} else {
						sendError('Weapon '+weaponTrueName+' missing damage spec');
					}
				} else if (weapon[2].toLowerCase().includes('ranged')) {
					values = setAttackTableRow( charCS, tableInfo.RANGED.fieldGroup, weapon, weapData, proficiency, initValues( tableInfo.RANGED.fieldGroup ) );
					values[fields.RW_miName[0]][fields.RW_miName[1]]=weaponTrueName;
					values[fields.RW_twoHanded[0]][fields.RW_twoHanded[1]]=attk2H;
					values[fields.RW_profLevel[0]][fields.RW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.RW_type[0]][fields.RW_type[1]]=innate ? 'innate' : weapon[1];
					values[fields.RW_superType[0]][fields.RW_superType[1]]=weapon[4];
					values[fields.RW_dancing[0]][fields.RW_dancing[1]]=(dancing?1:0);
					dancingProf = parseInt(values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] = getAttksPerRound(charCS, 
														 dancingProf, 
														 weapon,
														 values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] );
					}

					if (_.isUndefined( weapRow = tableFind( tableInfo.RANGED, fields.RW_name, '-', false ))) weapRow = tableInfo.RANGED.sortKeys.length;
					tableInfo.RANGED = addTableRow( tableInfo.RANGED, weapRow, values );
					
					let attkStrBonus = values[fields.RW_strBonus[0]][fields.RW_strBonus[1]];
					if (ammoSpecs && ammoSpecs.length) {
						let rangeSpecs = [...('['+specs.match(/}}\s*RangeData\s*=(.*?){{/im)[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
						if (rangeSpecs && rangeSpecs.length) {
							tableInfo = insertAmmo( charCS, weaponTrueName, ammoSpecs, rangeSpecs, tableInfo, weapon[1], attkStrBonus, lineNo );
							values = initValues( 'Quiver_' );
							values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
							values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
							values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo;
							Quiver = addTableRow( Quiver, Quiver.index, values, 'Quiver_' );
							Quiver.index++;
						}
					} else {
						[tableInfo,Quiver] = addAmmo( charCS, tableInfo, Quiver, weapon[1], weapon[4], attkStrBonus, true );
					}
				}
			}
		}
		return [tableInfo,Quiver];
	};

	/*
	 * Search for ammo associated with a weapon at line lineNo in 
	 * the character's MI Bag, and add it to the Quiver table (representing 
	 * ammo 'in hand').  This is then used to compare to the Ammo table,
	 * and any lines with ammo that do not appear in the Quiver are
	 * removed.
	 */

	var putAmmoInQuiver = function( charCS, weaponInfo, Quiver, lineNo ) {

		if (isNaN(lineNo) || lineNo < -1) {
			return Quiver;
		}
		var weaponName = attrLookup( charCS, fields.Items_name, fields.Items_table, lineNo ),
			weaponTrueName = attrLookup( charCS, fields.Items_trueName, fields.Items_table, lineNo ) || weaponName,
			specs = abilityLookup(fields.WeaponDB, weaponName).obj[0].get('action'),
			weaponSpecs = specs.match(/}}\s*Specs\s*=(.*?){{/im),
			ammoSpecs = specs.match(/}}\s*ammodata\s*=(.*?){{/im);
			
		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[-\s\w\|]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];

		for (let i=0; i<weaponSpecs.length; i++) {
			let weapon = weaponSpecs[i];
			if (weapon[2].toLowerCase().includes('ranged')) {
				if (ammoSpecs && ammoSpecs.length) {
					let values = initValues( Quiver.fieldGroup );
					values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
					values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
					values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo
					Quiver = addTableRow( Quiver, Quiver.index, values, Quiver.fieldGroup );
					Quiver.index++;
				} else {
					[weaponInfo, Quiver] = addAmmo( charCS, weaponInfo, Quiver, weapon[1], weapon[4], 0, false );
				}
			}
		}
		return Quiver;
	};

	/*
	 * Find the named weapons in the character's Magic Item 
	 * bag and return their current index.
	 */

	var findWeapon = function( charCS, ...weapons ) {
		
		var i = fields.Items_table[1],
			MagicItems = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
		    itemName,
			index = [];
			
		index.length = weapons.length;
		index.fill(NaN);
		
		while (!_.isUndefined(itemName = tableLookup( MagicItems, fields.Items_name, i, false ))) {
			index[weapons.indexOf(itemName)] = i;
			i++;
		}
		return index;
	}
	
	/*
	 * Function to check the number of rows in the weapons InHand table 
	 * matches the number of hands that the character has, and if necessary 
	 * add more rows.
	 */
	 
	var checkInHandRows = function( charCS, InHandTables, hands ) {
		
		var values = initValues( 'InHand_' ),
		    rows = Math.max(3,((parseInt(hands)||0)+1)),
		    i;
		
		for (i=0; i<rows; i++) {
			if (_.isUndefined(tableLookup( InHandTables, fields.InHand_name, i, false ))) {
				InHandTables = addTableRow( InHandTables, i, values, 'InHand_' );
			};
		};
		return InHandTables;
	}
	
	/*
	 * Function to promote InHand weapons to the character sheet 
	 * weapons in use & attack tables
	 */
	 
	var updateAttackTables = function( charCS, InHandTable, Quiver, weaponInfo, rowInHand, miSelection, handedness ) {
	
        var base = fields.InHand_table[1],
			i = base,
			lentHands = parseInt(attrLookup( charCS, fields.Equip_lentHands )) || 0,
			noHands = Math.max(((parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2) + lentHands), 2),
			weapon, weapHands, hand, index;

		while ((!_.isUndefined(weapon = tableLookup( InHandTable, fields.InHand_name, i, false )))) {
            index = tableLookup( InHandTable, fields.InHand_index, i, false );
		    if (i == rowInHand) {
		        index = parseInt(miSelection);
		        weapHands = handedness;
    		    hand = (i==base ? fields.Equip_leftHand : (i==base+1 ? fields.Equip_rightHand : (i==base+2 ? fields.Equip_bothHands : null)));
				[weaponInfo,Quiver] = addWeapon( charCS, hand, weapHands, index, (i>(noHands+base)), weaponInfo, Quiver );
		    } else {
                weapHands = tableLookup( InHandTable, fields.InHand_handedness, i );
				if (weapon != '-' && index != '' && index >= -1) {
					Quiver = putAmmoInQuiver( charCS, weaponInfo, Quiver, index );
				}
            }
			i++;
		}
		return [weaponInfo,Quiver];
	}
	
/* ----------------------------------------- Armour Management Functions ----------------------------------------------- */
	
	/*
	 * Function to scan the magic item bag for any armour, shields or 
	 * protective items and build and retun a table of the best versions 
	 * of each type
	 */
	 
	var scanForArmour = function( charCS ) {
		
		var Items = getTable( charCS, {}, fields.Items_table, fields.Items_trueName ),
			i = Items.table[1]-1,
			totalFlag = false,
			armourMsg = [],
			itemName, itemTrueName,
			acValues = {armour:{name:'Clothes',magic:false,specs:['','Clothes','armour','0H','cloth'],data:{ac:10,adj:0,madj:0}}},
			dexBonus = parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0),
			itemDef, itemDesc, itemSpecs, itemData;
			
		Items = getTable( charCS, Items, fields.Items_table, fields.Items_name );
		while (!_.isUndefined(itemName = tableLookup( Items, fields.Items_name, ++i, false ))) {
			itemTrueName = tableLookup( Items, fields.Items_trueName, i ) || itemName;
			if (itemName.length && itemName != '-') {
				itemDef = abilityLookup( fields.MagicItemDB, itemTrueName );
				if (itemDef.obj) {
					itemDesc = itemDef.obj[0].get('action');
					itemSpecs = itemDesc.match(/}}\s*Specs\s*=(.*?(?:armou?r|shield|protection).*?){{/im);
					itemData = itemDesc.match(/}}\s*a?c?data\s*=(.*?){{/im);
					
					if (itemData && itemSpecs) {
						itemSpecs = [...('['+itemSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)];
						itemData = [...('['+itemData[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
						for (let i=0; i<Math.min(itemSpecs.length,itemData.length); i++) {
							let itemType = itemSpecs[i][1].toLowerCase().replace(reIgnore,''),
								itemClass = itemSpecs[i][2].toLowerCase().replace(reIgnore,''),
								itemHands = itemSpecs[i][3].toUpperCase(),
								itemSuperType = itemSpecs[i][4].toLowerCase().replace(reIgnore,''),
								acData = parseData( itemData[i][0], reACSpecs );
							if (itemClass == 'armor') itemClass = 'armour';
							if (!state.attackMaster.weapRules.allowArmour && !classAllowedItem(charCS, itemName, itemType, itemSuperType, 'ac')) {
								armourMsg.push(itemName+' is not of a usable type');
							} else if (itemClass == 'shield' && itemHands != '0H' && !shieldInHand(charCS,itemTrueName)) {
								armourMsg.push(itemName+' is not currently in hand');
							} else {
								let ac = parseInt(acData.ac || 10),
									adj = ((parseInt(acData.adj || 0) + parseInt(acData.madj || 0) + parseInt(acData.sadj || 0) + parseInt(acData.padj || 0) + parseInt(acData.badj || 0))/5),
									dexAdj = Math.floor(dexBonus * parseFloat(acData.db || 1)),
									diff;
								if (itemClass == 'totalac') {
									itemClass = 'armour';
									if (totalFlag) {
										diff = (acValues.armour.data.ac - acValues.armour.data.adj - (acValues.armour.data.db*dexBonus)) - (ac - adj - dexAdj);
									} else {
										_.each( acValues, e => armourMsg.push(e.name+' is overridden by another item'));
										acValues = {};
										diff = 1;
										totalFlag = true;
									}
								} else if (!totalFlag) {
									if (_.isUndefined(acValues[itemClass])) {
										diff = 1;
									} else {
										let data = acValues[itemClass].data,
											itemAdj = (parseInt(data.adj || 0) + parseInt(data.madj || 0) + parseInt(data.sadj || 0) + parseInt(data.padj || 0) + parseInt(data.badj || 0))/5;
//										if (itemClass == 'armour') {
											diff = (parseInt(data.ac || 10) - itemAdj - (parseFloat(data.db || 1)*dexBonus)) - (ac - adj - dexAdj);
//										} else {
//											diff = ((adj + dexAdj) - (itemAdj + (parseFloat(data.db || 1)*dexBonus)));
											if (itemClass.includes('protection') && acValues.armour.magic) {
												armourMsg.push(itemName+' does not add to magical armour');
											}
//										}
									}
									
								} else {
									armourMsg.push(itemName+' is overridden by another item');
									diff = undefined;
								}
								
								if (!_.isUndefined(diff)) {
									if (diff < 0) {
										armourMsg.push(itemName+' is not the best '+itemSpecs[i][2]+' available');
									} else if (diff == 0) {
										armourMsg.push(itemName+' is no better than other '+itemSpecs[i][2]+'s');
									} else {
										if (acValues[itemClass] && acValues[itemClass].name) {
											armourMsg.push(acValues[itemClass].name+' is not the best '+itemSpecs[i][2]+' available');
										}
										acValues[itemClass] = {};
										acValues[itemClass].name = itemName;
										acValues[itemClass].specs = itemSpecs[i];
										acValues[itemClass].data = acData;
										
										if (itemClass == 'armour') {
											if (acValues.armour.magic = ((parseInt(acData.adj||0)!=0
																	|| parseInt(acData.madj||0)!=0
																	|| parseInt(acData.sadj||0)!=0
																	|| parseInt(acData.padj||0)!=0 
																	|| parseInt(acData.badj||0))!=0)) {
												_.find( acValues, function(item,iClass) {
													if (iClass.toLowerCase().includes('protection')) {
														armourMsg.push(item.name+' cannot be used alongside magical armour');
														return true;
													}
													return false;
												});
											}
										}
//										log('name='+itemName+', itemClass='+itemClass+', total adj='+(parseInt(acData.adj)+parseInt(acData.madj)+parseInt(acData.sadj)+parseInt(acData.padj)+parseInt(acData.badj))+', magic='+acValues.armour.magic);
									}
								}
							}
						}
					}
				}
			}
		}
		return {acValues: acValues, msgs: armourMsg};
	}
	
	
// ------------------------------------------------ Build Attack Macros ----------------------------------------------------

/*
 * This section builds macros for various attack types on the identified character sheet.  This is necessary as 
 * dice rolls made from API commands will not trigger 3D dice rolls, but those called from macros do.  So attacks 
 * are best made from macros, which are built on the fly (pre-building them requires too many and a separate library)
 * on the character sheet associated with the token making the attack.  These are then called from the API buttons 
 * dynamically created for each character's attacks.
 */

	/*
	 * Get the "to-hit" dice roll specification from the passed attack macro object
	 */
	 
	var getToHitRoll = function( attkMacro ) {
		var rollSpec = attkMacro.match(/}}\s*Specs\s*=\s*\[\s*\w[\s\|\w\-]*?\s*?,\s*?\w[\s\|\w\-]*?\w\s*?,\s*?(\d+d\d+)\s*?,\s*?\w[\s\|\w\-]*?\w\s*?\]/im);
		return rollSpec ? rollSpec[1] : fields.toHitRoll;
	};
	
	/*
	 * Create the macros for monster attacks
	 */
	 
	var buildMonsterAttkMacros = function( args, charCS, attk1, attk2, attk3 ) {
		
		var tokenID = args[1],
			attkType = args[2],
			msg = args[5] || '',
			curToken = getObj('graphic',tokenID),
			tokenName = curToken.get('name'),
			charName = charCS.get('name'),
			thac0 = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0) || 20,
			monsterCritHit = attrLookup( charCS, fields.MonsterCritHit ) || 20,
			monsterCritMiss = attrLookup( charCS, fields.MonsterCritMiss ) || 1,
			monsterDmg1 = (attrLookup( charCS, fields.Monster_dmg1 ) || '0').split(','),
			monsterDmg2 = (attrLookup( charCS, fields.Monster_dmg2 ) || '0').split(','),
			monsterDmg3 = (attrLookup( charCS, fields.Monster_dmg3 ) || '0').split(','),
			magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0,
			magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
			strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
			strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
			slashWeap	= true,
			pierceWeap	= true,
			bludgeonWeap= true,
			weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
			ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'}]]',
			ACslash		= slashWeap ? '[[0+@{Target|Select Target|'+fields.SlashAC[0]+'}]]' : '',
			ACpierce	= pierceWeap ? '[[0+@{Target|Select Target|'+fields.PierceAC[0]+'}]]' : '',
			ACbludgeon	= bludgeonWeap ? '[[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'}]]' : '',
			noModsACtxt = 'No Mods',
			sACtxt		= slashWeap ? 'S' : '',
			pACtxt		= pierceWeap ? 'P' : '',
			bACtxt		= bludgeonWeap ? 'B' : '',
			slashACtxt	= slashWeap ? 'Slash' : '',
			pierceACtxt	= pierceWeap ? 'Pierce' : '',
			bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
			tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, true ),
			tokenAC = (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}]]') : 'Not known'),
			tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, true ),
			tokenHP = (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : 'Not known'),
			attkMacro, attkMacroDef;

		var parseMonAttkMacro = function( args, charCS, attkType, attkMacroObj ) {
			
			var	attkMacro   = attkMacroObj.get('action'),
				toHitRoll 	= getToHitRoll( attkMacro );
				
			if (attkType.toUpperCase() == Attk.ROLL) {
				toHitRoll	= '?{Roll To-Hit Dice|'+toHitRoll+'}';
			}
			attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,false) )
								 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,true) )
								 .replace( /\^\^defaultTemplate\^\^/gi , fields.defaultTemplate )
								 .replace( /\^\^cname\^\^/gi , charName )
								 .replace( /\^\^tname\^\^/gi , tokenName )
								 .replace( /\^\^cid\^\^/gi , charCS.id )
								 .replace( /\^\^tid\^\^/gi , tokenID )
								 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
								 .replace( /\^\^attk1\^\^/gi , attk1 )
								 .replace( /\^\^attk2\^\^/gi , attk2 )
								 .replace( /\^\^attk3\^\^/gi , attk3 )
								 .replace( /\^\^monsterCritHit\^\^/gi , monsterCritHit )
								 .replace( /\^\^monsterCritMiss\^\^/gi , monsterCritMiss )
								 .replace( /\^\^monsterDmgMacro1\^\^/gi , 'Do-not-use-Monster-Dmg-1' )
								 .replace( /\^\^monsterDmgMacro2\^\^/gi , 'Do-not-use-Monster-Dmg-2' )
								 .replace( /\^\^monsterDmgMacro3\^\^/gi , 'Do-not-use-Monster-Dmg-3' )
								 .replace( /\^\^thac0\^\^/gi , thac0 )
								 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
								 .replace( /\^\^weapType\^\^/gi , weapTypeTxt )
								 .replace( /\^\^ACvsNoMods\^\^/gi , ACnoMods )
								 .replace( /\^\^ACvsSlash\^\^/gi , ACslash )
								 .replace( /\^\^ACvsPierce\^\^/gi , ACpierce )
								 .replace( /\^\^ACvsBludgeon\^\^/gi , ACbludgeon )
								 .replace( /\^\^ACvsNoModsTxt\^\^/gi , noModsACtxt )
								 .replace( /\^\^ACvsSlashTxt\^\^/gi , slashACtxt )
								 .replace( /\^\^ACvsPierceTxt\^\^/gi , pierceACtxt )
								 .replace( /\^\^ACvsBludgeonTxt\^\^/gi , bludgeonACtxt )
								 .replace( /\^\^ACvsSTxt\^\^/gi , sACtxt )
								 .replace( /\^\^ACvsPTxt\^\^/gi , pACtxt )
								 .replace( /\^\^ACvsBTxt\^\^/gi , bACtxt )
								 .replace( /\^\^targetACfield\^\^/gi , tokenAC )
								 .replace( /\^\^ACfield\^\^/gi , tokenACname )
								 .replace( /\^\^monsterDmg1\^\^/gi , monsterDmg1 )
								 .replace( /\^\^monsterDmg2\^\^/gi , monsterDmg2 )
								 .replace( /\^\^monsterDmg3\^\^/gi , monsterDmg3 )
								 .replace( /\^\^magicDmgAdj\^\^/gi , magicDmgAdj )
								 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
								 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
								 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
								 .replace( /\^\^strDmgBonus\^\^/gi , strDmg );
			
			return attkMacro;
		};
			
		monsterDmg1 = monsterDmg1[(monsterDmg1.length > 1 ? 1 : 0)];
		monsterDmg2 = monsterDmg2[(monsterDmg2.length > 1 ? 1 : 0)];
		monsterDmg3 = monsterDmg3[(monsterDmg3.length > 1 ? 1 : 0)];
		
		if (attkType.toUpperCase() == Attk.ROLL) {
			monsterDmg1	= '?{Roll '+attk1+' damage|'+monsterDmg1+'}';
			monsterDmg2	= '?{Roll '+attk2+' damage|'+monsterDmg2+'}';
			monsterDmg3	= '?{Roll '+attk3+' damage|'+monsterDmg3+'}';
		}
		msg = msg.split('$$');
			
		switch (attkType.toUpperCase()) {
		
		case Attk.TARGET:
			if (attk1) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Targeted-Attk1' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg[0] && msg[0].length ? '{{'+parseStr(msg[0])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Attk-1', attkMacro );
			}
			if (attk2) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Targeted-Attk2' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg[1] && msg[1].length ? '{{'+parseStr(msg[1])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Attk-2', attkMacro );
			}
			if (attk3) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Targeted-Attk3' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg[2] && msg[2].length ? '{{'+parseStr(msg[2])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Attk-3', attkMacro );
			}
			break;
			
		case Attk.TO_HIT:
		case Attk.ROLL:
			if (attk1) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Attk1' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]);
				setAbility( charCS, 'Do-not-use-Monster-Attk-1', attkMacro );
				
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Dmg1' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg[0] && msg[0].length ? '{{'+parseStr(msg[0])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Dmg-1', attkMacro );
			}
			if (attk2) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Attk2' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]);
				setAbility( charCS, 'Do-not-use-Monster-Attk-2', attkMacro );
				
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Dmg2' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg[1] && msg[1].length ? '{{'+parseStr(msg[1])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Dmg-2', attkMacro );
			}
			if (attk3) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Attk3' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]);
				setAbility( charCS, 'Do-not-use-Monster-Attk-3', attkMacro );
				
				attkMacroDef = abilityLookup( fields.AttacksDB, 'Mon-Dmg3' );
				if (!attkMacroDef.obj) return;
				attkMacro = parseMonAttkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg[2] && msg[2].length ? '{{'+parseStr(msg[2])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Dmg-3', attkMacro );
			}
			break;
		
		default:
			sendDebug('buildMonsterAttkMacros: Invalid attkType specified');
			sendError('Internal AttackMaster error');
			break;
		}
		return;
	}
	
	/*
	 * Build melee weapon attack macro
	 */
	 
	var buildMWattkMacros = function( args, charCS, tableInfo, mwIndex, backstab=false ) {
		
		return new Promise(resolve => {
			
			var tokenID		= args[1],
				attkType	= args[2],
				msg			= parseStr(args[5] || ''),
				errFlag		= false,
				curToken 	= getObj('graphic',tokenID),
				tokenName 	= curToken.get('name'),
				charName	= charCS.get('name'),
				raceName	= attrLookup( charCS, fields.Race ) || 'human',
				classes		= classObjects( charCS ),
				thac0		= getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0) || 20,
				mwNumber    = mwIndex + (fields.MW_table[1]==0 ? 1 : 2),
				weaponName 	= tableLookup( tableInfo.MELEE, fields.MW_name, mwIndex ),
				weapTrueName= tableLookup( tableInfo.MELEE, fields.MW_miName, mwIndex ),
				dancing		= tableLookup( tableInfo.MELEE, fields.MW_dancing, mwIndex ),
				attkAdj 	= tableLookup( tableInfo.MELEE, fields.MW_adj, mwIndex ),
				strBonus 	= tableLookup( tableInfo.MELEE, fields.MW_strBonus, mwIndex ),
				mwType 		= tableLookup( tableInfo.MELEE, fields.MW_type, mwIndex ),
				mwSuperType = tableLookup( tableInfo.MELEE, fields.MW_superType, mwIndex ),
				critHit 	= tableLookup( tableInfo.MELEE, fields.MW_critHit, mwIndex ) || 20,  // Temp fix for Efriiti corruption
				critMiss 	= tableLookup( tableInfo.MELEE, fields.MW_critMiss, mwIndex ),
				slashWeap	= parseInt(tableLookup( tableInfo.MELEE, fields.MW_slash, mwIndex )),
				pierceWeap	= parseInt(tableLookup( tableInfo.MELEE, fields.MW_pierce, mwIndex )),
				bludgeonWeap= parseInt(tableLookup( tableInfo.MELEE, fields.MW_bludgeon, mwIndex )),
				weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
				dmgAdj 		= tableLookup( tableInfo.DMG, fields.Dmg_adj, mwIndex ),
				dmgSM 		= tableLookup( tableInfo.DMG, fields.Dmg_dmgSM, mwIndex ),
				dmgL 		= tableLookup( tableInfo.DMG, fields.Dmg_dmgL, mwIndex ),
				dmgStrBonus = (tableLookup( tableInfo.DMG, fields.Dmg_strBonus, mwIndex ) || 1),
				strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
				strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
				rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
							+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
				fighterType = attrLookup( charCS, fields.Fighter_class ) || '',
				ranger		= fighterType.toUpperCase() == 'RANGER' || fighterType.toUpperCase() == 'MONSTER',
				magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0, 
				magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
				primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
				twoWeapPenalty = (ranger || primeWeapon < 1) ? 0 : (((mwIndex*2)+(fields.MW_table[1]==0?1:3)) == primeWeapon ? -2 : -4),
				proficiency = dancing != 1 ? proficient( charCS, weaponName, mwType, mwSuperType ) : tableLookup( tableInfo.MELEE, fields.MW_dancingProf, mwIndex ),
				race		= raceMods( charCS, mwType, mwSuperType ),
				tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, true ),
				ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]',
				ACslash		= slashWeap ? '[[0+@{Target|Select Target|'+fields.SlashAC[0]+'} &{noerror}]]' : '',
				ACpierce	= pierceWeap ? '[[0+@{Target|Select Target|'+fields.PierceAC[0]+'} &{noerror}]]' : '',
				ACbludgeon	= bludgeonWeap ? '[[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'} &{noerror}]]' : '',
				noModsACtxt = 'No Mods',
				sACtxt		= slashWeap ? 'S' : '',
				pACtxt		= pierceWeap ? 'P' : '',
				bACtxt		= bludgeonWeap ? 'B' : '',
				slashACtxt	= slashWeap ? 'Slash' : '',
				pierceACtxt	= pierceWeap ? 'Pierce' : '',
				bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
				tokenAC 	= (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}]]') : 'Not known'),
				tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, true ),
				tokenHP 	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : 'Not known'),
				attkMacro, attkMacroDef, qualifier;

			var parseMWattkMacro = function( args, charCS, attkType, attkMacroObj ) {
				
				var	attkMacro   = attkMacroObj.get('action'),
					toHitRoll 	= getToHitRoll( attkMacro );
					
				if (attkType.toUpperCase() == Attk.ROLL) {
					toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
				}
				attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,false) )
									 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,true) )
									 .replace( /\^\^defaultTemplate\^\^/gi , fields.defaultTemplate )
									 .replace( /\^\^cname\^\^/gi , charName )
									 .replace( /\^\^tname\^\^/gi , tokenName )
									 .replace( /\^\^cid\^\^/gi , charCS.id )
									 .replace( /\^\^tid\^\^/gi , tokenID )
									 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
									 .replace( /\^\^weapAttkAdj\^\^/gi , attkAdj )
									 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
									 .replace( /\^\^weapStrHit\^\^/gi , strBonus )
									 .replace( /\^\^profPenalty\^\^/gi , Math.min(proficiency,0) )
									 .replace( /\^\^specProf\^\^/gi , proficiency == 2 ? 1 : 0 )
									 .replace( /\^\^masterProf\^\^/gi , proficiency > 2 ? 1 : 0 )
									 .replace( /\^\^raceBonus\^\^/gi , race )
									 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
									 .replace( /\^\^twoWeapPenalty\^\^/gi , twoWeapPenalty )
									 .replace( /\^\^weapDmgAdj\^\^/gi , dmgAdj )
									 .replace( /\^\^magicDmgAdj\^\^/gi , magicDmgAdj )
									 .replace( /\^\^strDmgBonus\^\^/gi , strDmg )
									 .replace( /\^\^backstab\^\^/gi , backstab ? 1 : 0 )
									 .replace( /\^\^rogueLevel\^\^/gi , rogueLevel )
									 .replace( /\^\^weapon\^\^/gi , weaponName )
									 .replace( /\^\^thac0\^\^/gi , thac0 )
									 .replace( /\^\^weapCritHit\^\^/gi , critHit )
									 .replace( /\^\^weapCritMiss\^\^/gi , critMiss )
									 .replace( /\^\^slashWeap\^\^/gi , slashWeap )
									 .replace( /\^\^pierceWeap\^\^/gi , pierceWeap )
									 .replace( /\^\^bludgeonWeap\^\^/gi , bludgeonWeap )
									 .replace( /\^\^weapType\^\^/gi , weapTypeTxt )
									 .replace( /\^\^ACvsNoMods\^\^/gi , ACnoMods )
									 .replace( /\^\^ACvsSlash\^\^/gi , ACslash )
									 .replace( /\^\^ACvsPierce\^\^/gi , ACpierce )
									 .replace( /\^\^ACvsBludgeon\^\^/gi , ACbludgeon )
									 .replace( /\^\^ACvsNoModsTxt\^\^/gi , noModsACtxt )
									 .replace( /\^\^ACvsSlashTxt\^\^/gi , slashACtxt )
									 .replace( /\^\^ACvsPierceTxt\^\^/gi , pierceACtxt )
									 .replace( /\^\^ACvsBludgeonTxt\^\^/gi , bludgeonACtxt )
									 .replace( /\^\^ACvsSTxt\^\^/gi , sACtxt )
									 .replace( /\^\^ACvsPTxt\^\^/gi , pACtxt )
									 .replace( /\^\^ACvsBTxt\^\^/gi , bACtxt )
									 .replace( /\^\^ACfield\^\^/gi , tokenACname )
									 .replace( /\^\^targetACfield\^\^/gi , tokenAC )
									 .replace( /\^\^weapDmgSM\^\^/gi , dmgSM )
									 .replace( /\^\^weapStrDmg\^\^/gi , dmgStrBonus )
									 .replace( /\^\^weapDmgL\^\^/gi , dmgL )
									 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
									 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
									 .replace( /\^\^mwSMdmgMacro\^\^/gi , 'Do-not-use-DmgSM-MW'+mwNumber )
									 .replace( /\^\^mwLHdmgMacro\^\^/gi , 'Do-not-use-DmgL-MW'+mwNumber );
									 
				return attkMacro;
			};
			
			var attkType = args[2],
				attkMacro;
							   
			if (attkType.toUpperCase() == Attk.ROLL) {
				dmgSM     = '?{Roll Damage vs TSM|'+dmgSM+'}';
				dmgL      = '?{Roll Damage vs LH|'+dmgL+'}';
			}
			switch (attkType.toUpperCase()) {
				
			case Attk.TARGET:
				attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-Targeted-Attk'+weapTrueName, true );
				qualifier = weapTrueName;
				if (!attkMacroDef.obj) {
					qualifier = _.find( classes, c => {
						attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-Targeted-Attk'+c.name, true );
						return !_.isUndefined(attkMacroDef.obj);
					});
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-Targeted-Attk'+raceName, true );
					qualifier = raceName;
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-Targeted-Attk' );
					qualifier = '';
				}
				if (!attkMacroDef.obj) {
					errFlag = true;
					return;
				}
				attkMacro = parseMWattkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg && msg.length ? '{{'+msg+'}}' : '');
				setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, attkMacro );
				break;
				
			case Attk.TO_HIT:
			case Attk.ROLL:
				attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-ToHit'+weapTrueName, true );
				qualifier = weapTrueName;
				if (!attkMacroDef.obj) {
					qualifier = _.find( classes, c => {
						attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-ToHit'+c.name, true );
						return !_.isUndefined(attkMacroDef.obj);
					});
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-ToHit'+raceName, true );
					qualifier = raceName;
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, 'MW-ToHit' );
					qualifier = '';
				}
				if (!attkMacroDef.obj) {
					errFlag = true;
					return;
				}
				setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, parseMWattkMacro(args, charCS, attkType, attkMacroDef.obj[0]) );

				attkMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgSM'+qualifier) : ('MW-DmgSM'+qualifier)), true );
				if (!attkMacroDef.obj) attkMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgSM') : ('MW-DmgSM')) );
				if (!attkMacroDef.obj) {
					errFlag = true;
					return;
				}
				attkMacro = parseMWattkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg && msg.length ? '{{'+msg+'}}' : '');
				setAbility( charCS, 'Do-not-use-DmgSM-MW'+mwNumber, attkMacro );

				attkMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgL'+qualifier) : ('MW-DmgL'+qualifier)), true );
				if (!attkMacroDef.obj) attkMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgL') : ('MW-DmgL')) );
				if (!attkMacroDef.obj) {
					errFlag = true;
					return;
				}
				attkMacro = parseMWattkMacro(args, charCS, attkType, attkMacroDef.obj[0]) + (msg && msg.length ? '{{'+msg+'}}' : '');
				setAbility( charCS, 'Do-not-use-DmgL-MW'+mwNumber, attkMacro );
				
				break;
				
			default:
				sendDebug('buildMWattkMacros: Invalid attkType specified');
				sendError('Internal AttackMaster error');
				errFlag = true;
				break;
			}
			setTimeout(() => {
				resolve(errFlag);
			}, 5);
		});
	}
	
	/*
	 * Build ranged weapon attack macro, one for each 
	 * of the 6 possible ranges: Near, PB, S, M, L, Far
	 */
	 
	var buildRWattkMacros = function( args, charCS, tableInfo, rwIndex ) {
		
		return new Promise(resolve => {
			
			var tokenID 	= args[1],
				attkType 	= args[2],
				rwIndex 	= parseInt(args[3]),
				ammoIndex 	= parseInt(args[4]),
				msg			= parseStr(args[5] || ''),
				errFlag		= false,
				curToken 	= getObj('graphic',tokenID),
				tokenName 	= curToken.get('name'),
				charName	= charCS.get('name'),
				raceName	= attrLookup( charCS, fields.Race ) || 'human',
				classes		= classObjects( charCS ),
				thac0		= getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0) || 20,
				rwNumber    = rwIndex + (fields.RW_table[1]==0 ? 1 : 2),
				weaponName 	= tableLookup( tableInfo.RANGED, fields.RW_name, rwIndex ),
				weapTrueName= tableLookup( tableInfo.RANGED, fields.RW_miName, rwIndex ),
				dancing		= tableLookup( tableInfo.RANGED, fields.RW_dancing, rwIndex ),
				attkAdj 	= tableLookup( tableInfo.RANGED, fields.RW_adj, rwIndex ),
				weapStrBonus= tableLookup( tableInfo.RANGED, fields.RW_strBonus, rwIndex ),
				weapDexBonus= tableLookup( tableInfo.RANGED, fields.RW_dexBonus, rwIndex ),
				rwType 		= tableLookup( tableInfo.RANGED, fields.RW_type, rwIndex ),
				rwSuperType = tableLookup( tableInfo.RANGED, fields.RW_superType, rwIndex ),
				critHit 	= tableLookup( tableInfo.RANGED, fields.RW_critHit, rwIndex ),
				critMiss 	= tableLookup( tableInfo.RANGED, fields.RW_critMiss, rwIndex ),
				slashWeap	= parseInt(tableLookup( tableInfo.RANGED, fields.RW_slash, rwIndex )),
				pierceWeap	= parseInt(tableLookup( tableInfo.RANGED, fields.RW_pierce, rwIndex )),
				bludgeonWeap= parseInt(tableLookup( tableInfo.RANGED, fields.RW_bludgeon, rwIndex )),
				weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
				ammoName    = tableLookup( tableInfo.AMMO, fields.Ammo_name, ammoIndex ),
				dmgAdj 		= tableLookup( tableInfo.AMMO, fields.Ammo_adj, ammoIndex ),
				dmgSM 		= tableLookup( tableInfo.AMMO, fields.Ammo_dmgSM, ammoIndex ),
				dmgL 		= tableLookup( tableInfo.AMMO, fields.Ammo_dmgL, ammoIndex ),
				ammoStrBonus= tableLookup( tableInfo.AMMO, fields.Ammo_strBonus, ammoIndex ),
				ammoQty		= tableLookup( tableInfo.AMMO, fields.Ammo_qty, ammoIndex ),
				ammoReuse	= tableLookup( tableInfo.AMMO, fields.Ammo_reuse, ammoIndex ),
				strHit 		= parseInt(attrLookup( charCS, fields.Strength_hit ) || 0),
				strDmg 		= parseInt(attrLookup( charCS, fields.Strength_dmg ) || 0),
				dexMissile	= attrLookup( charCS, fields.Dex_missile ) || 0,
				rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
							+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
				fighterType = attrLookup( charCS, fields.Fighter_class ) || '',
				ranger		= fighterType.toUpperCase() == 'RANGER' || fighterType.toUpperCase() == 'MONSTER',
				magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0, 
				magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
				primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
				twoWeapPenalty = (ranger || primeWeapon < 1) ? 0 : (((rwIndex*2)+(fields.RW_table[1]==0?2:4)) == primeWeapon ? -2 : -4),
				proficiency = dancing != 1 ? proficient( charCS, weaponName, rwType, rwSuperType ) : tableLookup( tableInfo.RANGED, fields.RW_dancingProf, rwIndex ),
				race		= raceMods( charCS, rwType, rwSuperType ),
				tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, true ),
				ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]',
				ACslash		= slashWeap ? '[[0+@{Target|Select Target|'+fields.SlashAC[0]+'} &{noerror}]]' : '',
				ACpierce	= pierceWeap ? '[[0+@{Target|Select Target|'+fields.PierceAC[0]+'} &{noerror}]]' : '',
				ACbludgeon	= bludgeonWeap ? '[[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'} &{noerror}]]' : '',
				noModsACtxt = 'No Mods',
				slashACtxt	= slashWeap ? 'Slash' : '',
				pierceACtxt	= pierceWeap ? 'Pierce' : '',
				bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
				sACtxt		= slashWeap ? 'S' : '',
				pACtxt		= pierceWeap ? 'P' : '',
				bACtxt		= bludgeonWeap ? 'B' : '',
				missileACnoMods		= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'|max} &{noerror}]]',
				missileACslash		= slashWeap ? '[[0+@{Target|Select Target|'+fields.SlashAC[0]+'|max} &{noerror}]]' : '',
				missileACpierce		= pierceWeap ? '[[0+@{Target|Select Target|'+fields.PierceAC[0]+'|max} &{noerror}]]' : '',
				missileACbludgeon	= bludgeonWeap ? '[[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'|max} &{noerror}]]' : '',
				missileACnoModsTxt  = 'No Mods',
				missileACslashTxt	= slashWeap ? 'Slash' : '',
				missileACpierceTxt	= pierceWeap ? 'Pierce' : '',
				missileACbludgeonTxt= bludgeonWeap ? 'Bludgeon' : '',
				missileACsTxt		= slashWeap ? 'S' : '',
				missileACpTxt		= pierceWeap ? 'P' : '',
				missileACbTxt		= bludgeonWeap ? 'B' : '',
				tokenAC 	= (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}]]') : 'Not known'),
				tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, true ),
				tokenHP 	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : 'Not known'),
				attkMacro, attkMacroDef, qualifier;

			var parseRWattkMacro = function( args, charCS, attkType, range, attkMacroObj ) {
			
				return new Promise(resolve => {
			
					var attkMacro   = attkMacroObj.get('action'),
						toHitRoll 	= getToHitRoll( attkMacro ),
						rangeMods = attkMacro.match(/}}\s*RangeMods\s*=\s*(\[[-\w\d\+\,\:]+?\])\s*{{/im),
						rangeMod;

					if (attkType.toUpperCase() == Attk.ROLL) {
						toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
					}
					rangeMods = parseData( ((rangeMods && !_.isNull(rangeMods)) ? rangeMods[1] : ''), reRangeMods );
					rangeMod = attrLookup( charCS, [fields.RWrange_mod[0]+range, fields.RWrange_mod[1]] ) || rangeMods[range];
						
					attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,false) )
										 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,true) )
										 .replace( /\^\^defaultTemplate\^\^/gi , fields.defaultTemplate )
										 .replace( /\^\^cname\^\^/gi , charName )
										 .replace( /\^\^tname\^\^/gi , tokenName )
										 .replace( /\^\^cid\^\^/gi , charCS.id )
										 .replace( /\^\^tid\^\^/gi , tokenID )
										 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
										 .replace( /\^\^weapAttkAdj\^\^/gi , attkAdj )
										 .replace( /\^\^dexMissile\^\^/gi , dexMissile )
										 .replace( /\^\^weapDexBonus\^\^/gi , weapDexBonus )
										 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
										 .replace( /\^\^weapStrHit\^\^/gi , weapStrBonus )
										 .replace( /\^\^profPenalty\^\^/gi , Math.min(proficiency,0) )
										 .replace( /\^\^specProf\^\^/gi , proficiency == 2 ? 1 : 0 )
										 .replace( /\^\^masterProfPB\^\^/gi , (range == 'PB' && state.attackMaster.weapRules.masterRange && proficiency > 2) ? 1 : 0 )
										 .replace( /\^\^raceBonus\^\^/gi , race )
										 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
										 .replace( /\^\^twoWeapPenalty\^\^/gi , twoWeapPenalty )
										 .replace( /\^\^rangeMod\^\^/gi , rangeMod )
										 .replace( /\^\^ammoDmgAdj\^\^/gi , dmgAdj )
										 .replace( /\^\^magicDmgAdj\^\^/gi , magicDmgAdj )
										 .replace( /\^\^strDmgBonus\^\^/gi , strDmg )
										 .replace( /\^\^weapon\^\^/gi , weaponName )
										 .replace( /\^\^thac0\^\^/gi , thac0 )
										 .replace( /\^\^weapCritHit\^\^/gi , critHit )
										 .replace( /\^\^weapCritMiss\^\^/gi , critMiss )
										 .replace( /\^\^slashWeap\^\^/gi , slashWeap )
										 .replace( /\^\^pierceWeap\^\^/gi , pierceWeap )
										 .replace( /\^\^bludgeonWeap\^\^/gi , bludgeonWeap )
										 .replace( /\^\^weapType\^\^/gi , weapTypeTxt )
										 .replace( /\^\^ACvsNoMods\^\^/gi , ACnoMods )
										 .replace( /\^\^ACvsSlash\^\^/gi , ACslash )
										 .replace( /\^\^ACvsPierce\^\^/gi , ACpierce )
										 .replace( /\^\^ACvsBludgeon\^\^/gi , ACbludgeon )
										 .replace( /\^\^ACvsNoModsTxt\^\^/gi , noModsACtxt )
										 .replace( /\^\^ACvsSTxt\^\^/gi , sACtxt )
										 .replace( /\^\^ACvsPTxt\^\^/gi , pACtxt )
										 .replace( /\^\^ACvsBTxt\^\^/gi , bACtxt )
										 .replace( /\^\^ACvsSlashTxt\^\^/gi , slashACtxt )
										 .replace( /\^\^ACvsPierceTxt\^\^/gi , pierceACtxt )
										 .replace( /\^\^ACvsBludgeonTxt\^\^/gi , bludgeonACtxt )
										 .replace( /\^\^ACvsNoModsMissile\^\^/gi , missileACnoMods )
										 .replace( /\^\^ACvsSlashMissile\^\^/gi , missileACslash )
										 .replace( /\^\^ACvsPierceMissile\^\^/gi , missileACpierce )
										 .replace( /\^\^ACvsBludgeonMissile\^\^/gi , missileACbludgeon )
										 .replace( /\^\^ACvsNoModsMissileTxt\^\^/gi , missileACnoModsTxt )
										 .replace( /\^\^ACvsSlashMissileTxt\^\^/gi , missileACslashTxt )
										 .replace( /\^\^ACvsPierceMissileTxt\^\^/gi , missileACpierceTxt )
										 .replace( /\^\^ACvsBludgeonMissileTxt\^\^/gi , missileACbludgeonTxt )
										 .replace( /\^\^ACvsSmissileTxt\^\^/gi , missileACsTxt )
										 .replace( /\^\^ACvsPmissileTxt\^\^/gi , missileACpTxt )
										 .replace( /\^\^ACvsBmissileTxt\^\^/gi , missileACbTxt )
										 .replace( /\^\^ACfield\^\^/gi , tokenACname )
										 .replace( /\^\^targetACfield\^\^/gi , tokenAC )
										 .replace( /\^\^rangeN\^\^/gi , (range == 'N' ? 1 : 0) )
										 .replace( /\^\^rangePB\^\^/gi , (range == 'PB' ? 1 : 0) )
										 .replace( /\^\^rangeS\^\^/gi , (range == 'S' ? 1 : 0) )
										 .replace( /\^\^rangeM\^\^/gi , (range == 'M' ? 1 : 0) )
										 .replace( /\^\^rangeL\^\^/gi , (range == 'L' ? 1 : 0) )
										 .replace( /\^\^rangeF\^\^/gi , (range == 'F' ? 1 : 0) )
										 .replace( /\^\^rangeSMLF\^\^/gi , ((range != 'N' && range != 'PB') ? 1 : 0) )
										 .replace( /\^\^ammoDmgSM\^\^/gi , dmgSM )
										 .replace( /\^\^ammoStrDmg\^\^/gi , ammoStrBonus )
										 .replace( /\^\^ammoDmgL\^\^/gi , dmgL )
										 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
										 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
										 .replace( /\^\^ammoLeft\^\^/gi , ammoReuse != 1 ? ammoQty-1 : ammoQty )
										 .replace( /\^\^rwSMdmgMacro\^\^/gi , 'Do-not-use-DmgSM-RW'+rwNumber+'-'+range )
										 .replace( /\^\^rwLHdmgMacro\^\^/gi , 'Do-not-use-DmgL-RW'+rwNumber+'-'+range );
					
					setTimeout(() => {
						resolve(attkMacro);
					}, 5);
				});
			};
			
			async function buildAbility( defMod, dist ) {

				if (dist != 'PB' || proficiency > 0) {
				
					if (attkType == Attk.TARGET) {
						attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-Targeted-Attk'+qualifier, true );
						if (!attkMacroDef.obj) attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-Targeted-Attk' );
						if (!attkMacroDef.obj) {
							errFlag = true;
							return;
						}
						attkMacro = await parseRWattkMacro(args, charCS, attkType, dist, attkMacroDef.obj[0]);
						attkMacro += (msg && msg.length ? '{{'+msg+'}}' : '') + ((ammoReuse <= 0) ? ('\n!attk --setammo '+tokenID+'|'+ammoName+'|-1|'+(ammoReuse < 0 ? '=' : '+0')+'|SILENT') : '');
						setAbility( charCS, 'Do-not-use-Attk-RW'+rwNumber+'-'+dist, attkMacro );
					
					} else {
						attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-ToHit'+qualifier, true );
						if (!attkMacroDef.obj) attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-ToHit' );
						if (!attkMacroDef.obj) {
							errFlag = true;
							return;
						}
						attkMacro = await parseRWattkMacro(args, charCS, attkType, dist, attkMacroDef.obj[0]);
						attkMacro += ((ammoReuse <= 0) ? ('\n!attk --setammo '+tokenID+'|'+ammoName+'|-1|'+(ammoReuse < 0 ? '=' : '+0')+'|SILENT') : '');
						setAbility( charCS, 'Do-not-use-Attk-RW'+rwNumber+'-'+dist, attkMacro );

						attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM'+qualifier, true );
						if (!attkMacroDef.obj) attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM' );
						if (!attkMacroDef.obj) {
							errFlag = true;
							return;
						}
						attkMacro = await parseRWattkMacro(args, charCS, attkType, dist, attkMacroDef.obj[0]);
						attkMacro += (msg && msg.length ? '{{'+msg+'}}' : '');
						setAbility( charCS, 'Do-not-use-DmgSM-RW'+rwNumber+'-'+dist, attkMacro );

						attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL'+qualifier, true );
						if (!attkMacroDef.obj) attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL' );
						if (!attkMacroDef.obj) {
							errFlag = true;
							return;
						}
						attkMacro = await parseRWattkMacro(args, charCS, attkType, dist, attkMacroDef.obj[0])
						attkMacro += (msg && msg.length ? '{{'+msg+'}}' : '');
						setAbility( charCS, 'Do-not-use-DmgL-RW'+rwNumber+'-'+dist, attkMacro );
					}
				}
				return errFlag;
			};
			
			if (attkType.toUpperCase() == Attk.ROLL) {
				dmgSM     = '?{Roll Damage vs TSM|'+dmgSM+'}';
				dmgL      = '?{Roll Damage vs LH|'+dmgL+'}';
			}
			attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-ToHit'+weapTrueName, true );
			qualifier = weapTrueName;
			if (!attkMacroDef.obj) {
				qualifier = _.find( classes, c => {
					attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-ToHit'+c.name, true );
					return !_.isUndefined(attkMacroDef.obj);
				});
			}
			if (!attkMacroDef.obj) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-ToHit'+raceName, true );
				qualifier = raceName;
			}
			if (!attkMacroDef.obj) {
				attkMacroDef = abilityLookup( fields.AttacksDB, 'RW-ToHit' );
				qualifier = '';
			}
			_.each(rangedWeapMods, (defMod, dist) => buildAbility( defMod , dist ));

			setTimeout(() => {
				resolve(errFlag);
			}, 5);
		});
	}

	/*
	 * Dynamically build the ability macro for a saving throw
	 */
	 
	var buildSaveRoll = function( tokenID, charCS, sitMod, saveType, saveObj, isGM ) {
		
		sitMod = parseInt(sitMod);
		var curToken = getObj('graphic',tokenID),
			name = curToken.get('name'),
			save = parseInt(attrLookup( charCS, saveObj.save ) || 0),
			saveMod = parseInt(attrLookup( charCS, saveObj.mod ) || 0),
			saveAdj = parseInt(attrLookup( charCS, fields.Magic_saveAdj ) || 0),
			content = (isGM ? '/w gm ' : '')
					+ '&{template:'+fields.defaultTemplate+'}{{name='+name+' Save vs '+saveType+'}}'
					+ '{{Saving Throw=Roll[['+fields.SaveRoll+'cf<'+(save-saveMod-sitMod-saveAdj-1)+'cs>'+(save-saveMod-sitMod-saveAdj)+']] vs. [[0+'+(save-saveMod-sitMod-saveAdj)+']]target}}'
					+ '{{desc=**'+name+'\'s target**[[0+'+save+']] base save vs. '+saveType+' with [[0+'+saveMod+']] improvement from race, class & Magic Items, [[0+'+saveAdj+']] improvement from current magic effects, and [[0+'+sitMod+']] adjustment for the situation}}';
		
		setAbility(charCS,'Do-not-use-'+saveType+'-save',content);
		return;
	}
					  
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/**
	 * Create range buttons for a ranged weapon attack to add into a menu.
	**/

	var makeRangeButtons = function( args, charCS, tableInfo ) {

		var tokenID = args[1],
		    attkType = args[2],
		    weaponIndex = parseInt(args[3]),
		    ammoIndex = parseInt(args[4]),
		    charName = charCS.get('name'),
		    specRange = 30,
			specRangeMod = 0,
			farRange = 0,
			content = '',
			ranges = [],
			rangeMod = [],
			proficiency,
			specialist = true,
			wt, wst, wname, dancing,
			weapRangeMod, weapRangeOverride,
    		disabled = isNaN(weaponIndex) || isNaN(ammoIndex);

		if (!disabled) {
    		ranges = tableLookup( tableInfo.AMMO, fields.Ammo_range, ammoIndex );
    		wname = tableLookup( tableInfo.RANGED, fields.RW_name, weaponIndex );
    		dancing = tableLookup( tableInfo.RANGED, fields.RW_dancing, weaponIndex );
			rangeMod = tableLookup( tableInfo.RANGED, fields.RW_range, weaponIndex );
    		wt = tableLookup( tableInfo.RANGED, fields.RW_type, weaponIndex );
    		wst = tableLookup( tableInfo.RANGED, fields.RW_superType, weaponIndex );
			proficiency = dancing != 1 ? proficient( charCS, wname, wt, wst ) : tableLookup( tableInfo.RANGED, fields.RW_dancingProf, weaponIndex );
    		specialist = proficiency > 0;
			
			buildRWattkMacros( args, charCS, tableInfo );
			
			if (weapRangeOverride = (rangeMod[0] == '=')) rangeMod.slice(1);
			weapRangeOverride = weapRangeOverride || !ranges || !ranges.length;
			weapRangeMod = (rangeMod[0] == '-' || rangeMod[0] == '+');
    
			ranges = ranges.split('/');
			rangeMod = rangeMod.split('/');
    		// Remove any non-numeric entries from the ranges
    		ranges = _.reject(ranges, function(dist){return isNaN(parseInt(dist,10));}).map( r => parseInt(r,10));
    		rangeMod = _.reject(rangeMod, function(dist){return isNaN(parseInt(dist,10));}).map( r => parseInt(r,10));
			if (weapRangeOverride) {
				ranges = rangeMod;
			} else if (weapRangeMod) {
				for (let i=0; rangeMod.length && i<ranges.length; i++) {
					ranges[i] += rangeMod[Math.min(i,(rangeMod.length-1))];
				}
			}

			// Test for if ranges need *10 (assume 1st range (PB or short) is never >= 100 yds or < 10)
			if (ranges[0] < 10) ranges = ranges.map(x => x * 10);
				
    		// Make the range always start with Short (assume 4 or more ranges start with Point Blank)
    		if (ranges.length >= 4) {
				specRange = ranges.shift();
    		}
 		}
		
		weaponIndex += fields.RW_table[1]==0 ? 1 : 2;
		
		content += disabled ? ('<span style='+design.grey_button+'>') : '[';
		farRange = 6;
		content += ranges.length ? 'Near: 0 to 5' : 'Near';
		content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-N)');

		if (specialist) {
			content += disabled ? ('<span style='+design.grey_button+'>') : '[';
			farRange = specRange;
			content += ranges.length ? 'PB: 6 to '+farRange : 'Point Blank' ;
			content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-PB)');
		}
		content += disabled ? ('<span style='+design.grey_button+'>') : '[';
		farRange = ranges.length ? (ranges[0]) : farRange;
		content += ranges.length ? ('S: '+(specialist ? (specRange+1) : '6')+' to '+farRange) : 'Short';
		content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-S)');

		if (ranges.length != 1) {
			content += disabled ? ('<span style='+design.grey_button+'>') : '[';
			farRange = ranges.length ? (ranges[1]) : farRange;
			content += ranges.length ? ('M: '+((ranges[0])+1)+' to '+farRange) : 'Medium';
			content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-M)');
		}
		if (!ranges.length || ranges.length > 2) {
			content += disabled ? ('<span style='+design.grey_button+'>') : '[';
			farRange = ranges.length ? (ranges[2]) : farRange;
			content += ranges.length ? ('L: '+((ranges[1])+1)+' to '+farRange) : 'Long';
			content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-L)');
		}
		content += disabled ? ('<span style='+design.grey_button+'>') : '[';
		content += ranges.length ? ('Far: beyond '+(farRange)) : 'Far';
		content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-F)');

		return content;
	}


    /*
    * Create the standard weapon Attack menu.  If the optional monster attack parameters are passed,
	* also display the monster attacks.
    */

	var makeAttackMenu = function( args, submitted, monsterAttk1, monsterAttk2, monsterAttk3 ) {

		var backstab = (args[0] == BT.BACKSTAB),
			tokenID = args[1],
		    attkType = args[2],
		    weaponButton = args[3],
		    ammoButton = args[4],
		    curToken,
			charID,
			charCS,
			tableInfo,
			i, w, title,
			Weapons,
			currentType,
			weaponType,
			weaponSuperType,
			weaponName,
			weaponIndex,
			weaponOffset,
			ammoName,
			ammoType,
			ammoIndex,
			ammoQty;
			
		if (!tokenID || !(curToken = getObj( 'graphic', tokenID ))) {
            sendDebug( 'makeAttackMenu: tokenID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        };
        
		charID = curToken.get( 'represents' );

		if (!charID || !(charCS = getObj( 'character', charID ))) {
            sendDebug( 'makeAttackMenu: charID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        };
       
        var tokenName = curToken.get('name'),
			charName = charCS.get('name'),
            content = '&{template:'+fields.defaultTemplate+'}{{name=How is ' + tokenName + ' attacking?}}';
			
		if ( monsterAttk1 || monsterAttk2 || monsterAttk3 ) {
			buildMonsterAttkMacros( args, charCS, monsterAttk1, monsterAttk2, monsterAttk3 );
			content += 	'{{=**Monster Attacks**\n';
			if (monsterAttk1) {
				content += '[' + monsterAttk1 + '](~'+charName+'|Do-not-use-Monster-Attk-1)';
			}
			if (monsterAttk2) {
				content += '[' + monsterAttk2 + '](~'+charName+'|Do-not-use-Monster-Attk-2)';
			}
			if (monsterAttk3) {
				content += '[' + monsterAttk3 + '](~'+charName+'|Do-not-use-Monster-Attk-3)';
			}
			content += '}}';
		}
		
		// If a Rogue, provide a backstab button
		
		if (attrLookup( charCS, fields.Rogue_level )) {
			content += '{{Backstab=If '+(backstab ? 'not ' : '')+'backstabbing press ['
					+  (backstab ? '<span style=' + design.selected_button + '>' : '')
					+  'Backstab'
			+  (backstab ? '</span>' : '') + '](!attk --button '+ (backstab ? BT.MELEE : BT.BACKSTAB) + '|' + tokenID + '|' + attkType + '||)'
			+  (backstab ? ' again' : ' first')+'}}';
		}

		// build the Melee Weapon list

		weaponIndex = fields.MW_table[1]-1;
		weaponOffset = fields.MW_table[1]==0 ? 1 : 2;
		title = false;
		Weapons = getTable( charCS, {}, fields.MW_table, fields.MW_name );
		while (!_.isUndefined(weaponName = tableLookup( Weapons, fields.MW_name, ++weaponIndex, false ))) {
			if (weaponName != '-') {
				if (!title) {
					tableInfo = getAllTables( charCS, 'MELEE,DMG' ),
					content += '{{ =**MeleeWeapons**\n';
					title = true;
				}
				buildMWattkMacros( args, charCS, tableInfo, weaponIndex, backstab );
				content += '['+weaponName+'](~'+charName+'|Do-not-use-Attk-MW'+(weaponIndex+weaponOffset)+') ';
			}
		};
		
		content += title ? '}}' : '';
		
		if (!backstab) {

			// build the character Ranged Weapons list

			weaponIndex = fields.RW_table[1]-1;
			title = false;
			Weapons = getTable( charCS, {}, fields.RW_table, fields.RW_name );
			while (!_.isUndefined(weaponName = tableLookup( Weapons, fields.RW_name, ++weaponIndex, false ))) {
				if (weaponName != '-') {
					if (!title) {
						tableInfo = getAllTables( charCS, 'RANGED,AMMO' ),
						content += '{{  =**RangedWeapons**}}';
						title = true;
					}
					content += '{{'+weaponName+'=';
					weaponType = tableLookup( tableInfo.RANGED, fields.RW_type, weaponIndex ).toLowerCase().replace(reIgnore,'');
					weaponSuperType = tableLookup( tableInfo.RANGED, fields.RW_superType, weaponIndex ).toLowerCase().replace(reIgnore,'');
					ammoIndex = fields.Ammo_table[1]-1;
					while (!_.isUndefined(ammoName = tableLookup( tableInfo.AMMO, fields.Ammo_name, ++ammoIndex, false ))) {
						ammoType = tableLookup( tableInfo.AMMO, fields.Ammo_type, ammoIndex ).toLowerCase().replace(reIgnore,'');
						if (ammoName != '-' && (ammoType == weaponType || ammoType == weaponSuperType)) {
							ammoQty = tableLookup( tableInfo.AMMO, fields.Ammo_qty, ammoIndex );
							content += (weaponIndex == weaponButton && ammoIndex == ammoButton) ? ('<span style=' + design.selected_button + '>')
											: (ammoQty <= 0 ? ('<span style=' + design.grey_button + '>') : '[');
							content += '**'+ammoQty+'** '+ammoName;
							content += (((weaponIndex == weaponButton && ammoIndex == ammoButton) || ammoQty <= 0) ? '</span>' 
											: '](!attk --button ' + BT.RANGED + '|' + tokenID + '|' + attkType + '|' + weaponIndex + '|' + ammoIndex + ')');
						}
					}
					content += '}}';
				}
			}

			// add the range selection buttons (disabled until ranged weapon selected)

			if (title) {
				content +=  '{{desc=**Range selection**\n';
				content += makeRangeButtons( args, charCS, tableInfo );
				content += '}}';
			}
		}
		sendResponse( charCS, content );
		return;
	};
	
	/*
	 * Make a message about changes in the amount of ammo
	 * that the character has.
	 */
	 
	var makeAmmoChangeMsg = function( tokenID, ammo, oldQty, newQty, oldMax, newMax ) {
		
		var curToken = getObj('graphic',tokenID),
			tokenName = curToken.get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Ammo}}'
					+ '{{desc='+tokenName+' did have [['+oldQty+']] ***'+ammo+'***, and now has [['+newQty+']]}}'
					+ '{{desc1=A possible total [['+newMax+']] ***'+ammo+'*** are now available}}';

		sendResponse( charCS, content );
		return;
	};
	
	/*
	 * Make a menu to recover or add (or otherwise change)
	 * ammunition, both in the ammo table and in the 
	 * magic item bag (which is the default)
	 */
	 
	var makeAmmoMenu = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID),
			tokenName = getObj('graphic',tokenID).get('name'),
			reAmmo = /}}\s*?AmmoData\s*?=/im,
			reSetQty = /}}\s*?AmmoData.*?[\[,\s]qty:\s*?(\d+?)[,\]].*?{{/im,
			reReuse = /}}\s*?AmmoData.*?[\[,\s]ru:\s*?([-\+\d]+?)[,\]].*?{{/im,
			qty, maxQty, title=false,
			ammoName, breakable = false,
			itemIndex = fields.Items_table[1]-1,
			itemTable = fields.Items_table,
			itemName = fields.Items_name,
			itemQty = fields.Items_qty,
			itemMax = fields.Items_trueQty,
			checkAmmo = false,
			setQty = 0,
			reuse = 0,
			Items,
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Ammunition}}'
					+ '{{desc=The current quantity is displayed with the maximum you used to have.'
					+ 'To change the amount of any ammo listed, click the ammo name and enter the *change* (plus or minus).'
					+ 'The maximum will be set to the final current quantity, reflecting your new total}}'
					+ '{{desc1=';
		do {
			Items = getTable( charCS, {}, itemTable, itemName );
			Items = getTable( charCS, Items, itemTable, itemQty );
			Items = getTable( charCS, Items, itemTable, itemMax );
			while (!_.isUndefined(ammoName = tableLookup(Items,itemName,++itemIndex,false))) {
				let ammo = abilityLookup( fields.MagicItemDB, ammoName, false ),
					ammoData, ammoMatch;
				if (checkAmmo || !_.isUndefined(ammo.obj)) {
					if (ammo.obj && ammo.obj[0]) ammoData = ammo.obj[0].get('action');
					if (checkAmmo || (ammoData && ammoData.length && reAmmo.test(ammoData))) {
						if (!title) {
							content += '<table><tr><td>Now</td><td>Max</td><td>Ammo Name</td></tr>';
							title = true;
						}
						if (ammoData && ammoData.length) {
							setQty = parseInt((ammoData.match(reSetQty) || [0,0])[1]);
							reuse = parseInt((ammoData.match(reReuse) || [0,0])[1]);
							breakable = (setQty != 0) || (reuse < 0) || (ammo.ct && ammo.ct[0] && (ammo.ct[0].get('max') || '').toLowerCase() == 'charged');
						}
						if (setQty != 0) {
							qty = maxQty = setQty;
						} else {
							qty = tableLookup(Items,itemQty,itemIndex) || 0;
							maxQty = tableLookup(Items,itemMax,itemIndex) || qty;
						}
						content += '<tr><td>[['+qty+']]</td><td>[['+maxQty+']]</td>'
								+  '<td>'+(breakable ? '<span style=' + design.grey_button + '>' : '[')
								+  ammoName
								+  (breakable ? '</span>' : '](!attk --button '+BT.AMMO+'|'+tokenID+'|'+ammoName.replace(/[\(\)]/g,'')+'|?{How many do you recover?|0}|=)') + '</td></tr>';
					}
				}
			}
			if (!title) {
				itemIndex = fields.Ammo_table[1]-1;
				itemTable = fields.Ammo_table;
				itemName = fields.Ammo_name;
				itemQty = fields.Ammo_qty;
				itemMax = fields.Ammo_maxQty;
				checkAmmo = !checkAmmo;
			}
		} while (!title && checkAmmo);
		if (!title) {
			content += 'You do not appear to have any ammo in your bag!}}';
		} else {
			content += '</table>}}';
		}
		sendResponse( charCS, content );
		return;
	};
	
	/*
	 * Make a menu to specify the "handedness" of a character or 
	 * monster.  The default is 2 hands, Right Handed, but can 
	 * be any number of hands (more makes the system slower) and
	 * left, right, ambidextrous or neither handed.  This is a 
	 * GM-only function.
	 */
 
	var makeHandednessMenu = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID),
			handedness = attrLookup( charCS, fields.Equip_handedness ) || 'Right Handed',
			hands = args[2] || (parseInt(handedness) || 2),
			prefHand = args[3] || (handedness.match(/Left Handed|Right Handed|Ambidextrous|Neither Handed/i) || 'Right Handed'),
			tokenName = getObj('graphic',tokenID).get('name'),
			handedness = (hands == 2 ? '' : (hands + ' ')) + prefHand,
		
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Handedness}}'
					+ '{{desc=You can change the number of hands to any number, which affects the number of weapons that can be wielded.  Handedness can also be set, but currently has little effect}}'
					+ '{{desc1=**'+tokenName+' currently is '+handedness+'**\n'
					+ '[Number of Hands](!attk --button '+BT.NOHANDS+'|'+tokenID+'|?{Number of Hands}|'+prefHand+')'
					+ '[Preferred Hand](!attk --button '+BT.NOHANDS+'|'+tokenID+'|'+hands+'|?{Preferred hand|Right Handed|Left Handed|Ambidextrous|Neither Handed|Every Handed})}}'
					+ '{{desc2=Return to [Change Weapons](!attk --weapon '+tokenID+') menu}}';
		
		checkInHandRows( charCS, getAllTables( charCS, 'INHAND' ).INHAND, hands );
		sendFeedback( content );
		setAttr( charCS, fields.Equip_handedness, handedness );
		return;
	}
	
	/*
	 * Make the "Change Weapon" menu, that populates the 
	 * weapon tables from items in the character's magic item bag 
	 * that are specified as being some type of weapon.
	 */
	 
	var makeChangeWeaponMenu = function( args, isGM, msg='' ) {
		
		var tokenID = args[1],
			left = '',
			right = '',
			both = '',
			hands,
			handNo = 3,
			auto = false,
			i = fields.InHand_table[1],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			noHands = parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2,
			lentHands = parseInt(attrLookup( charCS, fields.Equip_lentHands )) || 0,
			InHandTable = getAllTables( charCS, 'INHAND' ).INHAND,
			handsQuestion = noHands, // ((noHands <= 2) ? 2 : '&#63;{Lend how many hands - (min 2&#41;?|2}'),
			inHand, inHandHandedness, content, extraHands, weapList1H;
		
		noHands = Math.max( 2, noHands+lentHands );
		InHandTable = checkInHandRows( charCS, InHandTable, noHands );
		left = tableLookup( InHandTable, fields.InHand_name, i++ );
		right = tableLookup( InHandTable, fields.InHand_name, i++ );
		both = tableLookup( InHandTable, fields.InHand_name, i );
		extraHands = tableLookup( InHandTable, fields.InHand_handedness, i++ );

		weapList1H = weaponQuery(charCS,1);
		content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s weapon}}'
				+ '{{ =**'+msg+'**}}'
				+ '{{desc=Select Left or Right Hand to hold a one-handed weapon or shield.'
				+ ' Select Both Hands to hold a two handed weapon and set AC to Shieldless}}'
				+ '{{desc1=[' + (left != '-' ? 'LH\: '+left : 'Left Hand') + '](!attk --button '+BT.LEFT+'|'+tokenID+'|'+weapList1H+'|0)'
				+ '[' + (right != '-' ? 'RH\: '+right : 'Right Hand') + '](!attk --button '+BT.RIGHT+'|'+tokenID+'|'+weapList1H+'|1)\n'
				+ 'or [' + (both != '-' ? '2H\: '+both : 'Both Hands') + '](!attk --button '+BT.BOTH+'|'+tokenID+'|'+weaponQuery(charCS,noHands,2)+'|2)\n';

		extraHands = noHands -= Math.max(2,extraHands);
		while (noHands > 0) {
            inHand = tableLookup( InHandTable, fields.InHand_name, i );
			noHands -= inHandHandedness = parseInt(inHand != '-' ? tableLookup( InHandTable, fields.InHand_handedness, i ) : 1) || 1;
			hands = (inHandHandedness == 1) ? '' : (inHandHandedness == 2 ? ('+H'+(handNo+1)) : ('-H'+(handNo+inHandHandedness-1)));
			content += '['+(inHand != '-' ? ('H'+handNo+hands+'\: '+inHand) : ('Hand '+handNo))+ '](!attk --button '+BT.HAND+'|'+tokenID+'|'+weaponQuery(charCS,extraHands,1)+'|'+i+')';
			extraHands -= inHandHandedness;
			handNo += inHandHandedness;
			i += inHandHandedness;
		}
		content += '\nor '+((!lentHands) ? '[' : ('<span style='+((lentHands<0) ? design.selected_button : design.grey_button)+'>'))
				+  'Lend hands to somebody'
				+  ((lentHands) ? '</span>' : ('](!attk --button '+BT.BOTH+'|'+tokenID+'|-3|2|'+handsQuestion+' --lend-a-hand '+tokenID+'|&#64;{target|Who to lend a hand to?|token_id}|'+handsQuestion+'|'+BT.BOTH+')'));

		if (isGM) {
			content += '\n\n'+tokenName+' has '+(parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2)+' hands. [Change number of Hands](!attk --button '+BT.NOHANDS+'|'+tokenID+')';
		}
		content += '}}';
		while (!_.isUndefined((inHand = tableLookup( InHandTable, fields.InHand_name, i++, false )))) {
		    if (inHand != '-') {
    			if (!auto) {
    				content += '{{desc2=And these weapons are dancing\n'
    						+  '<span style='+design.green_button+'>'+inHand+'</span>';
    				auto = true;
    			} else {
    				content += '<span style='+design.green_button+'>'+inHand+'</span>';
    			}
		    }
		}
		if (auto) {content += '}}';}
		
		sendResponse( charCS, content );
		return;
	}
	
	/**
	* Create the Edit Magic Item Bag menu.  Allow for a short version if
	* the Short Menus status flag is set, and highlight selected buttons
	**/
	
	var makeEditBagMenu = function(args,senderId,msg='',menuType) {
	    
		var tokenID = args[1],
			MIrowref = args[2],
			selectedMI = args[3] || '',
			charges = args[4],
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug( 'makeEditMImenu: Invalid character ID passed' );
			sendError( 'Invalid magicMaster argument' );
			return;
		}
		
        var qty, mi, playerConfig, magicItem, removeMI,
			selected = !!selectedMI && selectedMI.length > 0,
			remove = (selectedMI.toLowerCase() == 'remove'),
			bagSlot = !!MIrowref && MIrowref >= 0,
			content = '&{template:'+fields.defaultTemplate+'}{{name=Edit Magic Item Bag}}';

		if (!menuType) {
			playerConfig = getSetPlayerConfig( senderId );
			if (playerConfig) {
				menuType = playerConfig.editBagType;
			} else {
			    menuType = 'long';
			}
		}
		var shortMenu = menuType == 'short';

		if (selected && !remove) {
			magicItem = abilityLookup( fields.MagicItemDB, selectedMI );
			if (!magicItem.obj) {
				sendResponse( charCS, 'Can\'t find '+selectedMI+' in the Magic Item database' );
				return;
			}
		}
		
		if (msg && msg.length>0) {
			content += '{{='+msg+'}}';
		}
		
		if (!shortMenu || !selected) {
			content += '{{desc=**1.Choose what item to store**\n'
					+  '[Weapon](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Weapon to store|'+getMagicList(fields.MagicItemDB,fields.ItemWeaponList)+'}|'+charges+')'
					+  '[Armour](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Armour to store|'+getMagicList(fields.MagicItemDB,fields.ItemArmourList)+'}|'+charges+')'
			if (shortMenu) {
				content +=  '\n**OR**\n'
						+  '[Choose item to Remove](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|'+'Remove) from your MI bag}}'
						+  '{{desc2=[Swap to a long menu](!attk --button '+BT.EDITMI_OPTION+'|'+tokenID+'|'+(shortMenu ? 'long' : 'short')+')}}';
			}
		}
		if (!shortMenu || selected) {
			if (!remove) {
				if (shortMenu) {
					content += '{{desc=**1.Item chosen** ['+selectedMI+'](!attk --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'), click to reselect\n';
				}
    			content += '\nOptionally, you can '+(selected ? '[' : '<span style='+design.grey_button+'>')+'Review '+selectedMI+(selected ? ('](!attk --button '+BT.REVIEW_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|\n&#37;{'+magicItem.dB+'|'+selectedMI+'})') : '')+'</span>';
            } else {
				content += '{{desc=**1.Action chosen** ***Remove***, [click](!attk --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+') to change';
				}
			content += '}}';
		}
		
		if (bagSlot) {
			qty = attrLookup( charCS, [fields.Items_qty[0], 'current'], fields.Items_table, MIrowref ) || 0;
			removeMI = attrLookup( charCS, [fields.Items_name[0], 'current'], fields.Items_table, MIrowref );
		}
		if (!shortMenu || (selected && !bagSlot)) {
			content += '{{desc1=';
			if (remove) {
				content += '2.Select the item to **remove**\n';
			} else if (selected) {
				content +=  '**2.Select the slot to add this item to**\n';
			} else {
				content += 'Select an Item above then\n'
						+  '**2.Select a slot to add it to**\n';
			}
			
			if (shortMenu) {
				content += '[Select slot](!attk --button '+BT.SLOT_MI+'|'+tokenID+'|?{Which slot?'+makeMIlist( charCS, true )+'}|'+selectedMI+')';
			} else {
				content += makeMIbuttons( tokenID, 'current', fields.Items_qty[1], BT.SLOT_MI, '|'+selectedMI, MIrowref, false, true );
			}
			
			content += '}}';
		} else if (shortMenu && bagSlot) {
			removeMI = mi = attrLookup( charCS, [fields.Items_name[0], 'current'], fields.Items_table, MIrowref );
		    
		    content += '{{desc1=**2.Selected** ['+qty+' '+mi+'](!attk --button '+BT.SLOT_MI+'|'+tokenID+'|?{Which other slot?'+makeMIlist( charCS, true )+'}|'+selectedMI+'|)'
					+  ' as slot to '+(remove ? 'remove' : 'store it in')+', click to change}}';
		}
		
		if (!shortMenu || (selected && bagSlot)) {

			menuType = (shortMenu ? 'long' : 'short');
			content += '{{desc2=**3.';
			if (!remove) {
				content += ((selected && bagSlot) ? '[' : ('<span style='+design.grey_button+'>'))
						+  'Store '+selectedMI
						+  ((selected && bagSlot && !remove) ? ('](!attk --button '+BT.STORE_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|?{Quantity?|'+qty+'+1})') : '</span>')
						+  ' in your MI Bag**'+(!!removeMI ? (', overwriting **'+removeMI) : '')+'**\n\n'
						+  'or ';
			}
			content += (bagSlot ? '[' : ('<span style='+design.grey_button+'>'))
					+  'Remove '+(!!removeMI ? removeMI : 'item')
					+  (bagSlot ? ('](!attk --button '+BT.REMOVE_MI+'|'+tokenID+'|'+MIrowref+'|'+removeMI+')') : '</span>')
					+  ' from your MI Bag\n\n'
					+  'or [Swap to a '+menuType+' menu](!attk --button '+BT.EDITMI_OPTION+'|'+tokenID+'|'+menuType+')}}';
		}
		sendResponse( charCS, content );
		return;
	}
	
	/*
	 * Make a display of the current armour scan results
	 */

	var makeACDisplay = function( args, finalAC, dmgAdj, acValues, armourMsgs, isGM ) {
		
		var tokenID = args[0],
			dmgType = (args[2] || 'nadj').toLowerCase(),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			tokenName = curToken.get('name'),
			currentAC = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC),
			AC = getACvalues(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Current Armour for '+tokenName+'}}';

		if (currentAC != finalAC) {
			content += '{{AC=<span style='+design.green_button+'>'+finalAC+'</span>'
					+  '\n(<span style='+design.selected_button+'>'+currentAC+'</span> with current magic)';

		} else if (dmgAdj.armoured.sadj != 0 || dmgAdj.armoured.padj != 0 || dmgAdj.armoured.badj != 0) {
			content += '{{AC=';
			args[2]='nadj';
			content += (dmgType == 'nadj'?'<span style='+design.selected_button+'>':'[')+'Standard:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj)+(dmgType=='nadj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='sadj';
			content += (dmgType == 'sadj'?'<span style='+design.selected_button+'>':'[')+'Slash:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj)+(dmgType=='sadj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='padj';
			content += (dmgType == 'padj'?'<span style='+design.selected_button+'>':'[')+'Pierce:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj)+(dmgType=='padj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='badj';
			content += (dmgType == 'badj'?'<span style='+design.selected_button+'>':'[')+'Bludgeon:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj)+(dmgType=='badj'?'</span>':'](!attk --checkac '+args.join('|')+')');
		} else {
			content += '{{AC=<span style='+design.selected_button+'>'+finalAC+'</span>';
		}

		content += '}}'
				+ (acValues.armour ? '{{Armour='+acValues.armour.name+' AC'+(parseInt(acValues.armour.data.ac||10)-parseInt(acValues.armour.data.adj||0)-parseInt(acValues.armour.data[dmgType]||0))+'}}' : '')
				+ (acValues.shield ? '{{Shield='+acValues.shield.name+'}}' : '');
				
		_.each( acValues, (e,k) => {
			if (k != 'armour' && k != 'shield') {
				content += '{{'+e.specs[2]+'='+e.name+'}}';
			}
		});
		if (armourMsgs && armourMsgs.length) {
			content += '{{desc=These items have been ignored:\n';
			_.each( armourMsgs, msg => content += msg + '\n' );
			content += '}}';
		}

		content += '{{desc1=<table>'
				+ '<tr>'
					+ '<td style="min-width:35px"></td><td style="min-width:25px">Armor + Shield</td><td style="min-width:25px">No Shield</td><td style="min-width:25px">No Armour</td>'
				+ '</tr><tr>'
					+ '<td>Normal</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.n.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.n.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.n.c+'</span></td>'
				+ '</tr><tr>'
					+ '<td>Missile</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.m.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.m.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.m.c+'</span></td>'
				+ '</tr><tr>'	
					+ '<td>Surprised</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.s.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.s.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.s.c+'</span></td>'
				+ '</tr><tr>'
					+ '<td>Back</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.b.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.b.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.b.c+'</span></td>'
				+ '</tr><tr>'
					+ '<td>Head</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.h.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.h.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.h.c+'</span></td>'
				+ '</tr></table>}}'
				+ '{{desc2=To change your armour state, use *Change Weapon* to change your shield,'
				    + ' or change the items you have equipped}}';

		if (isGM) {
			sendFeedback(content);
		} else {
			sendResponse( charCS, content );
		}
		return;
	}
	
	/*
	 * Make a menu for saving throws, and to maintain the 
	 * saving throws table
	 */
	 
	var makeSavingThrowMenu = function( args, isGM ) {
		
		var tokenID = args[0],
			sitMod = (parseInt((args[1] || 0),10) || 0),
			curToken = getObj('graphic',tokenID),
			charCS  = getCharacter( tokenID ),
			name =  curToken.get('name'),
			charName = charCS.get('name'),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Roll a Saving Throw for '+name+'}}{{desc=<table>'
					+ '<tr>'
						+ '<td>Save</td><td>Base</td><td>Mod</td>'
					+ '</tr><tr>'
						+ '<td>[Paralysation](~'+charName+'|Do-not-use-paralysis-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_paralysis)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modParalysis)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Poison](~'+charName+'|Do-not-use-poison-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_poison)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modPoison)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Death](~'+charName+'|Do-not-use-death-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_death)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modDeath)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Rod](~'+charName+'|Do-not-use-rod-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_rod)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modRod)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Staff](~'+charName+'|Do-not-use-staff-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_staff)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modStaff)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Wand](~'+charName+'|Do-not-use-wand-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_wand)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modWand)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Petrification](~'+charName+'|Do-not-use-petrification-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_petrification)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modPetrification)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Polymorph](~'+charName+'|Do-not-use-polymorph-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_polymorph)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modPolymorph)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Breath](~'+charName+'|Do-not-use-breath-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_breath)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modBreath)+']]</td>'
					+ '</tr><tr>'
						+ '<td>[Spell](~'+charName+'|Do-not-use-spell-save)</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_spell)+']]</td>'
						+ '<td>[[0+'+attrLookup(charCS,fields.Saves_modSpell)+']]</td>'
					+ '</tr></table>}}'
					+ '{{desc1=Select a button above to roll a saving throw or '
					+ '[Add Situational Modifier](!attk --save '+tokenID+'|?{What type of attack to save against'
																		+'&#124;Weak Poison,?{Enter DM\'s adjustment for Weak Poison&amp;#124;0&amp;#125;'
																		+'&#124;Dodgeable ranged attack,([[([[0+'+attrLookup(charCS,fields.Dex_acBonus)+']])*-1]]&#41;'
																		+'&#124;Mental Attack,'+attrLookup(charCS,fields.Wisdom_defAdj)
																		+'&#124;Physical damage attack,?{Enter your magical armour plusses&amp;#124;0&amp;#125;'
																		+'&#124;Fire or acid attack,?{Enter your magical armour plusses&amp;#124;0&amp;#125;'
																		+'&#124;DM adjustment,?{Ask DM for value of adjustment&amp;#124;0&amp;#125;'
																		+'&#124;None of the above,0})'
					+ 'such as Wisdom adjustment, Dexterity adjustment, etc. before making the roll}}'
					+ '{{desc2=[Auto-check Saving Throws](!attk --check-saves '+tokenID+') to set saves using Race, Class, Level & MI data, or\n'
					+ '[Update Saving Throw table](!attk --setSaves '+tokenID+') to manually change numbers}}';

		_.each( saveVals, (saveObj,saveType) => buildSaveRoll( tokenID, charCS, sitMod, saveType, saveObj, isGM ));
					
		if (isGM) {
			sendFeedback( content );
		} else {
			sendResponse( charCS, content );
		}
	}
	
	/*
	 * Make a menu to modify the saving throw table
	 */

	var makeModSavesMenu = function( args, msg ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter( tokenID ),
			name = curToken.get('name'),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Set '+name+'\'s Saving Throws}}'
					+ ((msg && msg.length) ? '{{ ='+msg+'}}' : '')
					+ '{{desc=<table><tr>'
						+ '<td>Save</td><td>Base</td><td>Mod</td>'
					+ '</tr><tr>'
						+ '<td>**Paralysation**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_paralysis)+'](!attk --setSaves '+tokenID+'|Paralysis|Save|?{Save vs Paralysation base?|'+attrLookup(charCS,fields.Saves_paralysis)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modParalysis)+'](!attk --setSaves '+tokenID+'|Paralysis|Mod|?{Paralysation Save modifier?|'+attrLookup(charCS,fields.Saves_modParalysis)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Poison**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_poison)+'](!attk --setSaves '+tokenID+'|Poison|Save|?{Save vs Poison base?|'+attrLookup(charCS,fields.Saves_poison)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modPoison)+'](!attk --setSaves '+tokenID+'|Poison|Mod|?{Poison Save modifier?|'+attrLookup(charCS,fields.Saves_modPoison)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Death**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_death)+'](!attk --setSaves '+tokenID+'|Death|Save|?{Save vs Death base?|'+attrLookup(charCS,fields.Saves_death)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modDeath)+'](!attk --setSaves '+tokenID+'|Death|Mod|?{Death Save modifier?|'+attrLookup(charCS,fields.Saves_modDeath)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Rod**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_rod)+'](!attk --setSaves '+tokenID+'|Rod|Save|?{Save vs Rod base?|'+attrLookup(charCS,fields.Saves_rod)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modRod)+'](!attk --setSaves '+tokenID+'|Rod|Mod|?{Rod Save modifier?|'+attrLookup(charCS,fields.Saves_modRod)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Staff**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_staff)+'](!attk --setSaves '+tokenID+'|Staff|Save|?{Save vs Staff base?|'+attrLookup(charCS,fields.Saves_staff)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modStaff)+'](!attk --setSaves '+tokenID+'|Staff|Mod|?{Staff Save modifier?|'+attrLookup(charCS,fields.Saves_modStaff)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Wand**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_wand)+'](!attk --setSaves '+tokenID+'|Wand|Save|?{Save vs Wand base?|'+attrLookup(charCS,fields.Saves_wand)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modWand)+'](!attk --setSaves '+tokenID+'|Wand|Mod|?{Wand Save modifier?|'+attrLookup(charCS,fields.Saves_modWand)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Petrification**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_petrification)+'](!attk --setSaves '+tokenID+'|Petrification|Save|?{Save vs Petrification base?|'+attrLookup(charCS,fields.Saves_petrification)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modPetrification)+'](!attk --setSaves '+tokenID+'|Petrification|Mod|?{Petrification Save modifier?|'+attrLookup(charCS,fields.Saves_modPetrification)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Polymorph**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_polymorph)+'](!attk --setSaves '+tokenID+'|Polymorph|Save|?{Save vs Polymorph base?|'+attrLookup(charCS,fields.Saves_polymorph)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modPolymorph)+'](!attk --setSaves '+tokenID+'|Polymorph|Mod|?{Polymorph Save modifier?|'+attrLookup(charCS,fields.Saves_modPolymorph)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Breath**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_breath)+'](!attk --setSaves '+tokenID+'|Breath|Save|?{Save vs Breath base?|'+attrLookup(charCS,fields.Saves_breath)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modBreath)+'](!attk --setSaves '+tokenID+'|Breath|Mod|?{Breath Save modifier?|'+attrLookup(charCS,fields.Saves_modBreath)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Spell**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_spell)+'](!attk --setSaves '+tokenID+'|Spell|Save|?{Save vs Spell base?|'+attrLookup(charCS,fields.Saves_spell)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modSpell)+'](!attk --setSaves '+tokenID+'|Spell|Mod|?{Spell Save modifier?|'+attrLookup(charCS,fields.Saves_modSpell)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr></table>}}'
					+ '{{desc1=Select a button above to set the Save or Modifyer numbers, or select [Adjust all mods](!attk --setSaves '+tokenID+'|All|Mod|?{Change in all Save modifiers?|0|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})}}'
					+ '{{desc2=Return to [Roll Saves](!attk --save '+tokenID+') menu}}';
		
		sendResponse(charCS,content);
	}
	
	/*
	 * Make a menu for accessing the attack API capabilities
	 */
	 
	var makeAttkActionMenu = function( args, isGM ) {
		
		var tokenID = args[1],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name='+tokenName+'\'s Attack Actions}}'
					+ '{{desc=[Attack (Roll20 rolls)](!attk --attk-menu-hit &#64;{selected|token_id})\n'
					+ '[Attack (You roll)](!attk --attk-roll &#64;{selected|token_id})\n'
					+ (isGM ? '[GM Targeted Attack](!attk --attk-target &#64;{selected|token_id})\n' : '')
					+ '[Change Weapon](!attk --weapon &#64;{selected|token_id})\n'
					+ '[Recover Ammo](!attk --ammo &#64;{selected|token_id})\n'
					+ '[Edit Weapons & Armour](!attk --edit-weapons &#64;{selected|token_id})\n' 
					+ '[Check AC](!attk --checkac &#64;{selected|token_id})}}';
					
		sendResponse( charCS, content );
		return;
	}
	
	/*
	 * Make a menu that covers other actions
	 */
	 
	var makeOtherActionsMenu = function( args, isGM ) {
		
		var tokenID = args[1],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name='+tokenName+'\'s Other Actions}}'
					+ '{{subtitle=Maintenance}}'
					+ '{{desc=[Saves](!attk --save '+tokenID+')\n'
					+ ((apiCommands.cmd && apiCommands.cmd.exists) ? ('[Manage Character Class](!cmd --class-menu '+tokenID+')\n') : ('<span style='+design.grey_button+'>Manage Character Class</span>'))
					+ (isGM ? ('[Death](!setattr --fb-header &#64;{selected|token_name} Has Died --fb-content Making _CHARNAME_ as dead --charid &#64;{selected|character_id} --Check-for-MIBag|[&#91;&#64;{selected|Check-for-MIBag}%2&#93;]&#13;'
									+ '!token-mod --ignore-selected --ids &#64;{selected|token_id} --set statusmarkers|dead)\n') : '')
					+ ((apiCommands.magic && apiCommands.magic.exists) ? ('[Manage Light Sources](!magic --lightsources &#64;{selected|token_id})\n') : ('<span style='+design.grey_button+'>Manage Light Sources</span>'))
					+ ((apiCommands.money && apiCommands.money.exists) ? ('[Manage Money](!money --money-menu &#64;{selected|token_id})\n') : ('<span style='+design.grey_button+'>Manage Money</span>'))
					+ ((apiCommands.money && apiCommands.money.exists) ? ('[Out-of-Campaign activities](!money --training &#64;{selected|token_id})\n') : ('<span style='+design.grey_button+'>Out-of-Campaign activities</span>'))
					+ (isGM ? '[Adjust Damage](!setattr --silent --charid &#64;{selected|character_id} --strengthdmg||&#63;{Damage adjustment?} --strnotes|\'Dmg bonus: &#63;{Damage adjustment?|0} because &#63;{Why?}\'&#13;'
						+ '&#47;w gm **&#64;{Selected|Token_name}\'s new damage adjustment is [&#91;&#63;{Damage adjustment?|0}&#93;] because of &#63;{Why?}.**  Previous damage adjustment was &#91;[0+&#64;{selected|strengthdmg|max}]&#93;.)\n' : '')
					+'}}';
		sendResponse( charCS, content );
		return;
	}
	
	/*
	 * Make a configuration menu to allow the DM to select:
	 * - strict mode: follow the rules precisely,
	 * - house rules mode: follow "old fogies" house rules
	 * - no restrictions: allow anything goes
	 */
	 
	var makeConfigMenu = function( args, msg='' ) {
		
		var configButtons = function( flag, txtOn, cmdOn, txtOff, cmdOff ) {
			var	buttons = '<td>'
						+ (flag ? ('['+txtOn+']('+cmdOn+')</td><td><span style='+design.selected_button+'>'+txtOff+'</span>')
								 : ('<span style='+design.selected_button+'>'+txtOn+'</span></td><td>['+txtOff+']('+cmdOff+')'))
						+ '</td>';
				return buttons;
			};
					
		var content = '&{template:'+fields.defaultTemplate+'}{{name=Configure RPGMaster}}{{subtitle=AttackMaster}}'
					+ (msg.length ? '{{ ='+msg+'}}' : '')
					+ '{{desc=Select which configuration you wish for this campaign using the toggle buttons below.}}'
					+ '{{desc1=<table>';
				
		content += '<tr><td>DM Targeted Attks</td>'+configButtons(!state.attackMaster.weapRules.dmTarget, 'Targeted', '!attk --config dm-target|true', 'Standard', '!attk --config dm-target|false')+'</tr>\n'
				+  '<tr><td>Allowed weapons</td>'+configButtons(state.attackMaster.weapRules.allowAll, 'Restrict', '!attk --config all-weaps|false', 'Allow All', '!attk --config all-weaps|true')+'</tr>\n'
				+  (state.attackMaster.weapRules.allowAll ? '' : ('<tr><td>Restrict weapons</td>'+configButtons(!state.attackMaster.weapRules.classBan, 'Strict', '!attk --config weap-class|true', 'Lax', '!attk --config weap-class|false')+'</tr>\n'))
				+  '<tr><td>Allowed Armour</td>'+configButtons(state.attackMaster.weapRules.allowArmour, 'Strict', '!attk --config all-armour|false', 'Allow All', '!attk --config all-armour|true')+'</tr>\n'
				+  '<tr><td>Non-Prof Penalty</td>'+configButtons(!state.attackMaster.weapRules.prof, 'Use Rules', '!attk --config prof|true', 'Use Sheet', '!attk --config prof|false')+'</tr>\n'
				+  '<tr><td>Ranged Mastery</td>'+configButtons(state.attackMaster.weapRules.masterRange, 'Not Allowed', '!attk --config master-range|false', 'Allowed', '!attk --config master-range|true')+'</tr>\n';
		if (apiCommands['magic']) {
			content += '<tr><td>Specialist Wizards</td>'+configButtons(!state.MagicMaster.spellRules.specMU, 'Strict', '!magic --config specialist-rules|true', 'Allow All', '!magic --config specialist-rules|false')+'</tr>\n'
					+  '<tr><td>Spells per Level</td>'+configButtons(!state.MagicMaster.spellRules.strictNum, 'Strict', '!magic --config spell-num|true', 'Allow Misc', '!magic --config spell-num|false')+'</tr>\n'
					+  '<tr><td>Spell Schools</td>'+configButtons(state.MagicMaster.spellRules.allowAll, 'Strict', '!magic --config all-spells|false', 'Allow All', '!magic --config all-spells|true')+'</tr>\n'
		}
		content += '</table>}}';
		sendFeedback( content );
		return;
	}
		
// --------------------------------------------------------------- Button press Handlers ----------------------------------------------

	/*
	 * Handle changing the amount of Ammo held.  Update 
	 * both the Ammo table and the related Magic Item with
	 * the current amount and/or the maximum amount specified,
	 * or modify it if a + or - precedes the amount.
	 */
 
	var handleAmmoChange = function( args ) {
		
		var isMI = args[0].includes(BT.AMMO),
			tokenID = args[1],
			ammoName = args[2],
			silent = ((args[5] || '').toUpperCase() == 'SILENT'),
			charCS = getCharacter(tokenID),
			ammoMIname = ammoName,
			changeQty = '+-'.includes((args[3]||[+0])[0]),
			changeMax = '+-'.includes((args[4]||[+0])[0]),
			qtyToMax = '=' == args[3],
			maxToQty = '=' == args[4],
			useAmmoQty = false,
			Ammo, ammoIndex, ammoDef,
			setQty, setMax,
			MagicItems, miIndex, miName,
			miQ, miM, maxQty, qty;
			
		if (qtyToMax && maxToQty) {return;}
			
		try {
			setQty = parseInt(eval(args[3]));
		} catch {
			setQty = NaN;
		}
		try {
			setMax = parseInt(eval(args[4]));
		} catch {
			setMax = NaN;
		}
			
		Ammo = getTable(charCS,{},fields.Ammo_table,fields.Ammo_name);
		Ammo = getTable(charCS,Ammo,fields.Ammo_table,fields.Ammo_miName);
		Ammo = getTable(charCS,Ammo,fields.Ammo_table,fields.Ammo_qty);
		Ammo = getTable(charCS,Ammo,fields.Ammo_table,fields.Ammo_maxQty);
		Ammo = getTable(charCS,Ammo,fields.Ammo_table,fields.Ammo_setQty);
		MagicItems = getTable(charCS,{},fields.Items_table,fields.Items_name);
        MagicItems = getTable(charCS,MagicItems,fields.Items_table,fields.Items_trueName);

		if (!isMI) {
			ammoIndex = tableFind( Ammo, fields.Ammo_name, ammoName );
			ammoMIname = tableLookup( Ammo, fields.Ammo_miName, ammoIndex) || ammoMIname;
		} else {
			ammoIndex = tableFind( Ammo, fields.Ammo_miName, ammoName ) || tableFind( Ammo, fields.Ammo_name, ammoName );
		}
		miIndex = tableFind( MagicItems, fields.Items_name, ammoMIname );
		if (!isNaN(ammoIndex)) useAmmoQty = tableLookup( Ammo, fields.Ammo_setQty, ammoIndex ) != 0;
			
		if (isNaN(miIndex) || useAmmoQty) {
			miQ = parseInt(tableLookup( Ammo, fields.Ammo_qty, ammoIndex )) || 0;
			miM = parseInt(tableLookup( Ammo, fields.Ammo_maxQty, ammoIndex )) || miQ;
		} else {
			MagicItems = getTable(charCS,MagicItems,fields.Items_table,fields.Items_qty,'',0);
			MagicItems = getTable(charCS,MagicItems,fields.Items_table,fields.Items_trueQty,'',0);
			miQ = parseInt(tableLookup( MagicItems, fields.Items_qty, miIndex )) || 0;
			miM = parseInt(tableLookup( MagicItems, fields.Items_trueQty, miIndex )) || miQ;
		}
		maxQty = isNaN(setMax) ? miM : (changeMax ? Math.max(miM + setMax,0) : setMax);
		qty = isNaN(setQty) ? (qtyToMax ? maxQty : Math.min(miQ,maxQty)) : ((!changeQty) ? (maxToQty ? setQty : Math.min(setQty,maxQty)) : (maxToQty ? Math.max(miQ + setQty,0) : Math.min(Math.max(miQ + setQty,0),maxQty)));
			
		if (maxToQty) {
			maxQty = qty;
		}
		if (!isNaN(miIndex) && !useAmmoQty) {
			MagicItems = tableSet( MagicItems, fields.Items_qty, miIndex, qty );
			MagicItems = tableSet( MagicItems, fields.Items_trueQty, miIndex, maxQty );
			miName = tableLookup( MagicItems, fields.Items_name, miIndex );
		
			if (maxQty == 0) {
				ammoDef = abilityLookup( fields.WeaponDB, ammoMIname );
				if (ammoDef.ct && ammoDef.ct.length && (ammoDef.ct[0].get('max') || '').toLowerCase() == 'charged') {
					MagicItems = tableSet( MagicItems, fields.Items_name, miIndex, '-' );
					MagicItems = tableSet( MagicItems, fields.Items_trueName, miIndex, '-' );
				}
			}
			ammoIndex = Ammo.table[1]-1;
			while(!_.isUndefined(ammoMIname = tableLookup(Ammo, fields.Ammo_miName, ++ammoIndex, false))) {
				if (ammoMIname == miName) {
					Ammo = tableSet( Ammo, fields.Ammo_qty, ammoIndex, qty );
					Ammo = tableSet( Ammo, fields.Ammo_maxQty, ammoIndex, maxQty );
				}
			}
		} else if (!isNaN(ammoIndex) && ammoIndex >= -1) {
			Ammo = tableSet( Ammo, fields.Ammo_qty, ammoIndex, qty );
			Ammo = tableSet( Ammo, fields.Ammo_maxQty, ammoIndex, maxQty );
		}
		if (!silent) {
			makeAmmoMenu( args );
			makeAmmoChangeMsg( tokenID, args[2], miQ, qty, miM, maxQty );
		}
		return;
	};	
			
	/**
	 * The processing to change weapon is lengthy as it has to do
	 * a lot of searching & updating of tables.  So send a
	 * "please wait..." message to the Player and a time-delayed
	 * call to the processing to allow the screen to update before
	 * hogging the processing power...
	 */
	 
	var handleChangeWeapon = function( args, isGM, silent=false ) {
		
		var tokenID = args[1],
			selection = args[2],
			row = args[3],
			handsLent = parseInt(args[4]) || 0,
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			weaponInfo = getAllTables( charCS, 'MELEE,DMG,RANGED,AMMO' ),
			InHandTable = getAllTables( charCS, 'INHAND' )['INHAND'],
			Quiver = getAllTables( charCS, 'QUIVER' )['QUIVER'],
			values = initValues( InHandTable.fieldGroup ),
			noHands = parseInt(attrLookup(charCS,fields.Equip_handedness)) || 2,
			lentHands = parseInt(attrLookup(charCS,fields.Equip_lentHands)) || 0,
			handedness = 1,
			lentLeftID, lentRightID, lentBothID,
			weapon, trueWeapon, weaponSpecs, item, i, hand, index;
			
		// First, check there are enough rows in the InHand table
		
		InHandTable = checkInHandRows( charCS, InHandTable, row );

		// See if any hands are currently lent to anyone else
		
		lentLeftID = (attrLookup( charCS, fields.Equip_lendLeft ) || '');
		lentRightID = (attrLookup( charCS, fields.Equip_lendRight ) || '');
		lentBothID = (attrLookup( charCS, fields.Equip_lendBoth ) || '');

		// Find the weapon items
		
		if (selection == -2) {
			weapon = trueWeapon = 'Touch';
		} else if (selection == -3) {
			weapon = trueWeapon = 'Lend-a-Hand';
			handedness = Math.min(Math.max(handsLent,2), noHands);
			setAttr( charCS, fields.Equip_lentHands, (lentHands - handedness) );
		} else {
			weapon = attrLookup( charCS, fields.Items_name, fields.Items_table, selection ) || '-';
			trueWeapon = attrLookup( charCS, fields.Items_trueName, fields.Items_table, selection ) || weapon;
			if (!isNaN(selection)) {
				item = abilityLookup(fields.WeaponDB, weapon, true);
				if (!item.obj) {
					log('handleChangeWeapon not found '+weapon);
					sendDebug('handleChangeWeapon not found '+weapon);
					return;
				};
				weaponSpecs = item.obj[0].get('action').match(/}}\s*Specs\s*=(.*?){{/im);
				weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[-\s\|\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
				handedness = (parseInt(weaponSpecs[0][3]) || 1);
			}
		}
		
		// Next, blank the quiver table
		
		Quiver = blankQuiver( charCS, Quiver );

		// And reverse any previously lent hands
		
		if (lentBothID.length) {
			setAttr( charCS, fields.Equip_lendBoth, '' );
			setAttr( charCS, fields.Equip_lentHands, 0 );
			sendAttkAPI('!attk --lend-a-hand '+tokenID+'|'+lentBothID+'|'+lentHands+'|'+BT.BOTH);
		}

		// Then add the weapon to the InHand table
		
	    values[fields.InHand_name[0]][fields.InHand_name[1]] = weapon;
	    values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = trueWeapon;
	    values[fields.InHand_index[0]][fields.InHand_index[1]] = selection;
	    values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness;

		switch (args[0]) {
		case BT.BOTH:
		    InHandTable = tableSet( InHandTable, fields.InHand_name, 0, '-');
		    InHandTable = tableSet( InHandTable, fields.InHand_trueName, 0, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_index, 0, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_name, 1, '-');
		    InHandTable = tableSet( InHandTable, fields.InHand_trueName, 1, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_index, 1, '');
			break;
		case BT.HAND:
			break;
		default:
		    InHandTable = tableSet( InHandTable, fields.InHand_name, 2, '-');
		    InHandTable = tableSet( InHandTable, fields.InHand_trueName, 2, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_index, 2, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_handedness, 2, 0);
		    break;
		}
        InHandTable = addTableRow( InHandTable, row, values, 'InHand_' );

		// If weapon requires more than 1 hand, blank the following rows that
		// represent hands holding this weapon
		
		i = handedness;
		hand = row;
		while (i>1) {
			InHandTable = addTableRow( InHandTable, ++hand );
			i--;
		}
		
		// Next add the new weapon to the weapon tables and 
		// at the same time check every weapon InHand for ammo to 
		// add to the quiver
		
		if (selection != -3) [weaponInfo,Quiver] = updateAttackTables( charCS, InHandTable, Quiver, weaponInfo, row, selection, handedness );
		
		// Then remove any weapons or ammo from the weapon tables that 
		// are not currently inHand (in the InHand or Quiver tables)

		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO' );
		
		sendAPImacro(curToken,'',trueWeapon,'-inhand');
		
		// RED v1.038: store name of weapon just taken in hand for later reference as needed
		setAttr( charCS, fields.Equip_takenInHand, weapon );
		setAttr( charCS, fields.Equip_trueInHand, trueWeapon );
		
		doCheckAC( [tokenID], isGM, [], true );
		if (!silent) makeChangeWeaponMenu( args, isGM, 'Now using '+weapon+'. ' );

        return;
	}
	
	/*
	 * Handle the addition or removal of autonomous weapons, such as 
	 * dancing weapons*/
	 
	var handleDancingWeapons = function( args, isGM ) {
		
		var isAdd = (args[0] == BT.AUTO_ADD),
			tokenID = args[1],
			weapon = (args[2] || ''),
			lcWeapon = weapon.toLowerCase(),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			noHands = parseInt(attrLookup(charCS,fields.Equip_handedness)) || 2,
			dancing = parseInt(attrLookup(charCS,fields.Equip_dancing)) || 0,
			MagicItems = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
            weaponInfo = getAllTables(charCS,'MELEE,RANGED,DMG,AMMO'),
			InHandTable = getAllTables(charCS,'INHAND').INHAND,
			Quiver = getAllTables(charCS,'QUIVER').QUIVER,
			i = tableFind( InHandTable, fields.InHand_name, weapon ),
			weaponIndex = tableFind( MagicItems, fields.Items_name, weapon ),
			slotName, handedness, specs, weaponSpecs, values, msg;

		if (_.isUndefined(weaponIndex)) {
			log('handleDancingWeapons unable to find '+weapon);
			sendDebug('handleDancingWeapons unable to find '+weapon);
			return;
		}
		
		if (!_.isUndefined(i)) {
			InHandTable = addTableRow( InHandTable, i );
		}
		
		Quiver = blankQuiver( charCS, Quiver );

		if (!isAdd) {
			setAttr( charCS, fields.Equip_dancing, (dancing-1) );
			i = weaponIndex = handedness = null;
			msg = weapon+' has stopped Dancing. If you have free hands, grab it now.  If not, change weapons next round to take it in hand again}}';
		} else {
			specs = abilityLookup( fields.WeaponDB, weapon );
			weaponSpecs = specs.obj[0].get('action').match(/}}\s*Specs\s*=(.*?){{/im);
			weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
			values = initValues('InHand_'),
			values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness = (parseInt(weaponSpecs[0][3]) || 1);
			values[fields.InHand_name[0]][fields.InHand_name[1]] = weapon;
			values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = (attrLookup( charCS, fields.Items_trueName, fields.Items_table, weaponIndex ) || weapon);
			values[fields.InHand_index[0]][fields.InHand_index[1]] = weaponIndex;
			
			InHandTable = checkInHandRows( charCS, InHandTable, noHands+dancing+1 );
			
			i = InHandTable.sortKeys.length;
			do {
				slotName = tableLookup( InHandTable, fields.InHand_name, --i );
			} while (slotName != '-' && i > fields.InHand_table[1] );
			if (slotName != '-') {
				sendError('Unable to add '+weapon+' as a Dancing weapon' );
			} else {
				InHandTable = addTableRow( InHandTable, i, values );
			}
			setAttr( charCS, fields.Equip_dancing, (dancing+1) );
			sendPublic( getObj('graphic',tokenID).get('name')+' lets go of their '+weapon+' which continues to fight by itself' );
			msg = weapon+' has started *Dancing!* and will automatically be added to Initiative rolls';
    	}
		[weaponInfo,Quiver] = updateAttackTables( charCS, InHandTable, Quiver, weaponInfo, i, weaponIndex, handedness );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO' );

   		if (isAdd) sendAPImacro(curToken,'',weapon,'-dancing');
		makeChangeWeaponMenu( args, isGM, msg );

		return;
	}
		
	/*
	 * Handle a command for changing the specifications of a weapon,
	 * given the weapon name, the attribute to change, and the value.
	 * prefix of +/- modifies, none or = sets
	 */
	 
	var handleModWeapon = function( args, silent ) {
		
	// --modWeapon tokenID|weaponName|table|attributes:values
	//  table: Melee,Dmg,Ranged,Ammo
	//  attribute: w,t,st,+,sb,db,n,r,sp,sz,ty,sm,l,
	
		var tokenID = args[1],
			weapon = (args[2]||'').toLowerCase().replace(reIgnore,''),
			tableName = (args[3]||'').toUpperCase(),
			attributes = args[4],
			charCS = getCharacter(tokenID),
			weapData = parseData( ','+attributes+',', reWeapSpecs, false ),
			table = getAllTables( charCS, tableName )[tableName],
			group = table.fieldGroup,
			i = table.table[1]-1,
			weapIndex = null,
			typeName = '',
			superType = '',
			miName, attkName, newVal;
			
		do {
			attkName = tableLookup( table, fields[group+'name'], ++i, false );
			if (!_.isUndefined(attkName)) {
				miName = tableLookup( table, fields[group+'miName'], i );
				if (['MELEE','RANGED','DMG'].includes(tableName)) {
					typeName = tableLookup( table, fields[group+'type'], i );
					superType = tableLookup( table, fields[group+'superType'], i );
				}
				if ('all' == weapon || miName.toLowerCase().replace(reIgnore,'') == weapon 
									|| attkName.toLowerCase().replace(reIgnore,'') == weapon
									|| typeName.toLowerCase().replace(reIgnore,'') == weapon
									|| superType.toLowerCase().replace(reIgnore,'') == weapon) {
					weapIndex = i;
					_.each( weapData, (val,key) => {
						var oldVal, ranges, rangeMod;
						if (!_.isUndefined(val) && !_.isUndefined(fields[group+key])) {
							if (key != 'dmgType') {
								if (val.length > 1 && ((val[0]=='-') || (val[0]=='+'))) {
									oldVal = tableLookup( table, fields[group+key], weapIndex );
									if (key != 'range') {
										try {
											newVal = eval('(2*'+(oldVal || '0')+')+(2*'+val+')');
											newVal = (newVal%2) ? (newVal + '/2') : (newVal/2);
										} catch {
											newVal = (oldVal || 0) + val;
										}
									} else {
										//deal with range mods
										ranges = (oldVal || '0').split('/');
										rangeMod = val.split('/');
										// Remove any non-numeric entries from the ranges
										ranges = _.reject(ranges, function(dist){return isNaN(parseInt(dist,10));}).map(r => parseInt(r,10));
										rangeMod = _.reject(rangeMod, function(dist){return isNaN(parseInt(dist,10));}).map(r => parseInt(r,10));
										// Reduce the number of mod ranges to match the weapon ranges
										while (rangeMod.length > 1 && rangeMod.length > ranges.length) {
											rangeMod.shift();
										}
										for (let i=0; rangeMod.length && i<ranges.length; i++) {
											ranges[i] += rangeMod[Math.min(i,(rangeMod.length-1))];
										}
										newVal = ranges.join('/');
									}
								} else if (val[0]=='\=') {
									newVal = val.slice(1);
								} else {
									newVal = val;
								}
								table = tableSet( table, fields[group+key], weapIndex, newVal );
							} else {
								let dmgType =val.toUpperCase();
								table = tableSet( table, fields[group+'slash'], weapIndex, (dmgType.includes('S')?1:0) );
								table = tableSet( table, fields[group+'pierce'], weapIndex, (dmgType.includes('P')?1:0) );
								table = tableSet( table, fields[group+'bludgeon'], weapIndex, (dmgType.includes('B')?1:0) );
							};
						};
					});
				}
			}
		} while (!_.isUndefined(attkName));
		
		if (_.isNull(weapIndex) && !silent) {
			sendError('Weapon '+weapon+' not found to amend');
		}
		return;
	}
	
	/**
	 * Set or clear the primary weapon for two weapon attacks
	 **/
	 
	var handleSetPrimaryWeapon = function( args ) {
		
		var tokenID = args[0],
			weapon = args[1],
			silent = (args[2] || '').toLowerCase() == 'silent',
			charCS = getCharacter(tokenID),
			MeleeWeapons = getTable( charCS, {}, fields.MW_table, fields.MW_name ),
			MeleeWeapons = getTable( charCS, MeleeWeapons, fields.MW_table, fields.MW_miName ),
			RangedWeapons = getTable( charCS, {}, fields.RW_table, fields.RW_name ),
			RangedWeapons = getTable( charCS, RangedWeapons, fields.RW_table, fields.RW_miName ),
			msg, index;
			
		if (!weapon || !weapon.length) {
			setAttr( charCS, fields.Primary_weapon, -1 );
			setAttr( charCS, fields.Prime_weapName, '' );
			msg = 'No longer wielding two weapons';
		} else {
			index = tableFind(MeleeWeapons, fields.MW_name, weapon );
			if (_.isUndefined(index)) index = tableFind(MeleeWeapons, fields.MW_miName, weapon );
			if (!_.isUndefined(index)) {
				index = ((index*2)+(fields.MW_table[1]==0?1:3));
			} else {
				index = tableFind(RangedWeapons, fields.RW_name, weapon );
				if (_.isUndefined(index)) index = tableFind(RangedWeapons, fields.RW_miName, weapon );
				if (!_.isUndefined(index)) {
					index = ((index*2)+(fields.RW_table[1]==0?2:4));
				}
			}
			if (!_.isUndefined(index)) {
				setAttr( charCS, fields.Primary_weapon, index );
				setAttr( charCS, fields.Prime_weapName, weapon );
				msg = 'Primary attack set to be with '+weapon+'. Using any other weapon might incur a penalty';
			} else {
				setAttr( charCS, fields.Primary_weapon, -1 );
				setAttr( charCS, fields.Prime_weapName, '' );
				msg = 'Weapon '+weapon+' not found, so no primary weapon set';
			}
		}
		msg = '&{template:'+fields.defaultTemplate+'}{{name=Setting Primary Weapon}}'
			+ '{{desc='+msg+'.}}';
		sendResponse(charCS,msg);
		return;
	}

	/**
	 * Handle the selection of an option button on a menu,
	 * usually used to set short or long menus.
	 */
	 
	var handleOptionButton = function( args, senderId ) {
		
		var tokenID = args[1],
			optionValue = args[2].toLowerCase(),
	        config = getSetPlayerConfig( senderId ) || {};

		if (!['short','long'].includes(optionValue)) {
			sendError( 'Invalid magicMaster menuType option.  Use short or long' );
			return;
		}
		config.editBagType = optionValue;
		getSetPlayerConfig( senderId, config );
		makeEditBagMenu( [BT.EDIT_MI, tokenID, -1, ''], senderId, 'Using '+optionValue+' Edit MI Bag menu' );
		return;
	}
	
	/*
	 * Handle adding a row to the MIbag.  This is usually called as a 
	 * command in front of a command string that will call a follow-on,
	 * meaning a shift() creates the follow-on command call to doButton()
	 */
	 
	var handleAddMIrow = function( args, senderID ) {
		
		args.shift();
		
		var tokenID = args[1],
			index = args[2],
			charCS = getCharacter(tokenID);

		addTableRow( getAllTables(charCS,'MI').MI, index, null, 'Items_' );
		
		doButton( args, senderID );
		return;
	}
			
	/*
	 * Handle selecting a magic item to store in the
	 * displayed magic item bag.
	 */
 
	var handleSelectMI = function( args, GMonly, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MItoStore = args[3],
			charCS = getCharacter(tokenID),
			MIdata;
			
		if (!charCS) {
			sendDebug('handleSelectMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (!MItoStore || MItoStore.length == 0) {
			sendDebug('handleSelectMI: invalid Magic Item passed');
			sendError('Internal miMaster error');
			return;
		}
		MIdata = abilityLookup( fields.MagicItemDB, MItoStore );
		setAttr( charCS, fields.ItemCastingTime, ((MIdata.ct && MIdata.ct[0]) ? MIdata.ct[0].get('current') : 0 ));
		setAttr( charCS, fields.ItemSelected, 1 );
		
		makeEditBagMenu( args, senderId, 'Selected '+MItoStore+' to store' );
		return;
	};

	/*
	 * Review a chosen spell description
	 */
	 
	var handleReviewMI = function( args ) {
		
		var tokenID = args[1],
			msg,
			charCS = getCharacter(tokenID);
			
		args.shift();
		msg = '[Return to menu](!attk --button CHOOSE_MI|'+args.join('|')+')';
		sendResponse( charCS, msg );
		return;
	}
	
	/*
	 * Handle selecting a slot in the displayed MI bag
	 */
	 
	var handleSelectSlot = function( args, GMonly, senderId ) {

		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleSelectSlot: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (!MIrowref || isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleSelectSlot: invalid MI parameter passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotItem,
		    MagicItems = getAllTables( charCS, 'MI' ).MI;
		    
		if (MIrowref >= MagicItems.sortKeys.length) {
    		addTableRow( MagicItems, MIrowref, null, 'Items_' );
		}
		
		setAttr( charCS, fields.ItemRowRef, MIrowref );
		setAttr( charCS, fields.Expenditure, (tableLookup( MagicItems, fields.Items_cost, MIrowref ) || 0 ) );
		setAttr( charCS, fields.ItemSelected, 1 );
		
		makeEditBagMenu( args, senderId, 'Selected slot currently containing '+slotItem );
		return;			
	}
	
	/*
	 * Handle storing an MI in a Magic Item bag.
	 * A flag parameter determines if this is a GM-only action
	 */
	 
	var handleStoreMI = function( args, GMonly, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			MIqty = args[4],
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug('handleStoreMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleStoreMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
				
		if (MIqty.length == 0 || MIqty.length > 5) {
			MIqty = 0;
		} else {
			try {
				MIqty = eval(MIqty) || 0;
			} catch {
				MIqty = 0;
			}
		}
		var MItables = getAllTables( charCS, 'MI' ).MI,
			slotName = tableLookup( MItables, fields.Items_name, MIrowref ),
			slotType = tableLookup( MItables, fields.Items_type, MIrowref ),
			containerNo = attrLookup( charCS, fields.ItemContainerType ),
			magicItem = abilityLookup( fields.MagicItemDB, MIchosen ),
			values = MItables.values;
		
		if (!magicItem.obj) {
			sendDebug('handleStoreMI: selected magic item speed/type not defined');
			sendError('Selected Magic Item not fully defined');
			return;
		}
		
		var MIspeed = magicItem.ct[0].get('current'),
		    MItype = magicItem.ct[0].get('max'),
		    midbCS;
			
		if (!GMonly && slotType.toLowerCase().includes('cursed')) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!attk --edit-mi '+tokenID+')}}' );
			return;
		}
		values[fields.Items_name[0]][fields.Items_name[1]] = MIchosen;
		values[fields.Items_trueName[0]][fields.Items_trueName[1]] = MIchosen;
		values[fields.Items_speed[0]][fields.Items_speed[1]] = MIspeed;
		values[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = MIspeed;
		values[fields.Items_qty[0]][fields.Items_qty[1]] = MIqty;
		values[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = MIqty;
		values[fields.Items_cost[0]][fields.Items_cost[1]] = 0;
		values[fields.Items_type[0]][fields.Items_type[1]] = MItype;
		
		MItables = addTableRow( MItables, MIrowref, values );

		if (!(containerNo % 2)) {
			setAttr( charCS, fields.ItemContainerType, (isNaN(containerNo) ? 1 : containerNo+1) );
		}
		
		// RED: v2.037 calling checkAC command to see if 
		//             there has been any impact on AC.
		doCheckAC( [tokenID,'Silent','',senderId], GMonly, [] );

		args = ['',tokenID,-1,''];
		
		makeEditBagMenu( args, senderId, MIchosen+' has overwritten '+slotName );
		return;
	}
	
	/*
	 * Handle removing an MI from a Magic Item bag.
	 * Use a flag to check if this is being done by the GM.
	 */
	 
	var handleRemoveMI = function( args, GMonly, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleRemoveMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleRemoveMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotType = attrLookup( charCS, fields.Items_type, fields.Items_table, MIrowref ) || '';
		if (!GMonly && slotType.toLowerCase().includes('cursed')) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!attk --edit-mi '+tokenID+')}}' );
			return;
		}
		addTableRow( getAllTables( charCS, 'MI' ).MI, MIrowref );	// Blanks this table row
		
		// RED: v2.037 calling attackMaster checkAC command to see if 
		//             there has been any impact on AC.
		doCheckAC( [tokenID,'Silent','',senderId], GMonly, [] );

		args[2] = -1;
		args[3] = '';
		makeEditBagMenu( args, senderId, 'Slot '+MIrowref+' has been removed' );
		return;
	};
	
	/*
	 * Scan Race, Class, Level and MI data to set the saving throws table
	 * for a particular Token
	 */
	 
	var handleCheckSaves = function( args, isGM, selected ) {
		
//		log('handleCheckSaves: called');

		var tokenID,
			charCS,
			attkMenu,
			content = '&{template:'+fields.defaultTemplate+'}';

		if (attkMenu = (args && args[0])) {
			log('handleCheckSaves: tokenID argument detected, setting single selected item');
			selected = [];
			selected.push(getObj('graphic',args[0]));
		}
		
		_.each( selected, curToken => {
		    
			tokenID = attkMenu ? curToken.id : curToken._id;
			charCS = getCharacter( tokenID, true );

			if (!charCS) {
//				sendError('Invalid token selected');
//				log('handleCheckSaves: invalid tokenID = '+tokenID);
				return;
			}
			var	tokenName = getObj('graphic',tokenID).get('name'),
				classes = classObjects( charCS ),
				race = (attrLookup( charCS, fields.Race ) || 'human').toLowerCase().replace(reIgnore,''),
				ItemNames = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
				reSave = /[,\[\s]sv([a-z]{3}):([-\+]?\d+)[,\s\]]/g,
				saves = [],
				classSaves, classMods,
				mods = _.isUndefined(raceSaveMods[race]) ? raceSaveMods.human : raceSaveMods[race],
				blankMods = {par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
				setFlags = {att:false,par:false,poi:false,dea:false,rod:false,sta:false,wan:false,pet:false,pol:false,bre:false,spe:false},
				xlate = {att:'Attribute',par:'Paralysis',poi:'Poison',dea:'Death',rod:'Rod',sta:'Staff',wan:'Wand',pet:'Petrify',pol:'Polymorph',bre:'Breath',spe:'Spell'},
				miMods = [],
				attribute, attrVal, item,
				itemText = '';
				
			content += (selected.length == 1) ? '{{name='+tokenName+'\'s Saving Throws}}' : '{{name=Setting Saving Throws}}';
//			log('handleCheckSaves: set variables');
				
			classes.forEach( c => {
				if (!saveLevels[c.name]) {
					classSaves = baseSaves[c.base][saveLevels[c.base][Math.min(c.level,saveLevels[c.base].length)]];
				} else {
					classSaves = baseSaves[c.name][saveLevels[c.name][Math.min(c.level,saveLevels[c.name].length)]];
				}
				if (!saves || !saves.length) {
					saves = classSaves;
				} else {
					saves = saves.map((v,k)=> Math.min(v,classSaves[k]));
				}
				itemText += '{{'+c.name+'=Level '+c.level+'='+classSaves+'}}';
			});
			switch (mods.att) {
			case 'str':
				attribute = fields.Strength;
				break;
			case 'dex':
				attribute = fields.Dexterity;
				break;
			case 'con':
				attribute = fields.Constitution;
				break;
			case 'int':
				attribute = fields.Intelligence;
				break;
			case 'wis':
				attribute = fields.Wisdom;
				break;
			case 'chr':
				attribute = fields.Charisma;
				break;
			default:
				attribute = undefined;
			};
			if (attribute) {
				attrVal = parseInt(attrLookup( charCS, attribute )) || -1;
			} else {
				attrVal = -1;
			}
			if (_.some(mods,(m,k)=>!!m  && k!='att')) itemText += '{{'+race+'=';
			mods = _.mapObject(mods,(v,k) => {
				if (k == 'att') {
					return v;
				} else {
					if (v != 0) itemText += xlate[k]+':'+Math.floor(attrVal != -1 ? (attrVal/v) : v)+', ';
					return Math.floor(v != 0 ? (attrVal != -1 ? (attrVal/v) : v) : 0);
				}
			});
			if (_.some(mods,(m,k)=>!!m  && k!='att')) itemText += '}}';

//			log('handleCheckSaves: got attribute, mods='+_.chain(mods).pairs().flatten(false));

			classes.forEach( c => {
				classMods = classSaveMods[c.name] || classSaveMods[c.base] || classSaveMods.undefined;
//				log('handleCheckSaves: classMods['+c.name+']='+_.chain(classMods).pairs().flatten(false).value());
				if (!mods && !mods.length) {
					mods = classMods;
				} else {
					mods = _.mapObject(mods,(v,k)=>{return k != 'att' ? v+classMods[k] : v});
				}
				if (classMods.att) classMods.att = classMods.par;
				if (_.some(classMods)) itemText += '{{'+c.name+' Mods=';
				let vals = _.chain(classMods).values().uniq().value();
				if (vals.length == 1) {
					itemText += 'All mods:'+vals[0];
				} else {
					_.mapObject(classMods,(v,k)=> ((k!='att' && v) ? (itemText += xlate[k]+':'+v+' ') : ''));
				}
				if (_.some(classMods)) itemText += '}}';
			});
//			log('handleCheckSaves: initial mods='+_.chain(mods).pairs().flatten(false).value());
			
			for (let itemRow = 0; !_.isUndefined(item = tableLookup( ItemNames, fields.Items_name, itemRow, false )); itemRow++) {
				if (item != '-') {
//					log('handleCheckSaves: checking item '+item);
					let itemObj = abilityLookup( fields.MagicItemDB, item );
					if (itemObj.obj) {
						let itemDef = itemObj.obj[0].get('action').toLowerCase(),
							specs = itemDef.match(/}}\s*specs=\s*?(.*?)\s*?{{/im),
							specsArray = specs ? [...('['+specs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : undefined,
							miClass = specsArray ? (specsArray[0][2].toLowerCase().replace(reIgnore,'') || 'magicitem') : 'magicitem',
							dataArray = [...itemDef.matchAll(/}}\s*\w*?data\s*=.*?sv[a-z]{3}:.*?{{/g)];
							
//						log('handleCheckSaves: miClass='+miClass);

	//					_.each(dataArray,(v,k)=>log('handleCheckSaves: dataArray['+k+'] = '+v));
						_.each( dataArray, data => {
//							log('handleCheckSaves: processing item '+item+' data '+data);
							if (!data) return;
							let saveMods = data ? [...data[0].matchAll(reSave)] : [];
//							log('handleCheckSaves: item '+item+' saveMods = '+saveMods.join('|'));
							_.each( saveMods, m => {
								if (!miMods[miClass]) miMods[miClass] = blankMods;
//								log('handleCheckSaves: initial miMods['+miClass+']='+_.chain(miMods[miClass]).pairs().flatten(false).value());
//								log('handleCheckSaves: m = '+m.join('|'));
								if (m[1] == 'all') {
//									log('handleCheckSaves: found mod all, value '+parseInt(m[2]));
									
									miMods[miClass] = _.mapObject(miMods[miClass], (v,k)=> {
										if (k != 'att') {
											if ('+-'.includes(m[2][0]) && !setFlags[m[1]]) {
												return (v+(parseInt(m[2]) || 0));
											} else if (m[2][0] == '=') {
												if (setFlags[m[1]]) {
													return Math.max(v,(parseInt(m[2]) || 0));
												} else {
													setFlags[m[1]] = true;
													return (parseInt(m[2].substring(1)) || 0);
												}
											} else if (!setFlags[m[1]]) {
												return Math.max(v,(parseInt(m[2]) || 0));
											}
										} else {
											return v;
										}
									});
								} else if (mods[m[1]]) {
									allMods = false;
//									log('handleCheckSaves: found mod '+m[1]+' value '+m[2]);
									if (m[1] != 'att') {
										if ('+-'.includes(m[2][0]) && !setFlags[m[1]]) {
											miMods[miClass][m[1]] += (parseInt(m[2]) || 0);
										} else if (m[2][0] == '=') {
											if (setFlags[m[1]]) {
												miMods[miClass][m[1]] = Math.max(v,(parseInt(m[2]) || 0));
											} else {
												setFlags[m[1]] = true;
												miMods[miClass][m[1]] = (parseInt(m[2].substring(1)) || 0);
											}
										} else if (!setFlags[m[1]]) {
											miMods[miClass][m[1]] = Math.max(v,(parseInt(m[2]) || 0));
										}
									} else {
										miMods[miClass][m[1]] = v;
									}
								};
							});
						});
						if (_.some(miMods[miClass])) {
							itemText += '{{'+item+'=';
							let vals = _.chain(miMods[miClass]).values().uniq().value();
							if (vals.length == 1) {
								itemText += 'All mods:'+vals[0];
							} else {
								_.mapObject(miMods[miClass],(v,k)=> itemText += (k!='att' && v) ? (xlate[k]+':'+v+', ') : '');
							}
							itemText += '}}';
						};
					};
				};
			};
			_.mapObject(miMods, function(s,c) {
//				log('handleCheckSaves: adding miMods['+c+']='+_.chain(s).pairs().flatten(false).value());
				mods = _.mapObject(mods, function(v,k) {
//					log('handleCheckSaves: setting mods['+k+' using setFlags['+k+'] of '+setFlags[k]+', miMods['+c+'], miSaves['+k+']='+s[k]+', v='+v+', so returning '+(setFlags[k] ? s[k] : (v + s[k])));
					return (setFlags[k] ? s[k] : (v + s[k]));
				});
			});
			
//			log('handleCheckSaves: final mods='+_.chain(mods).pairs().flatten(false).value());
			
			setAttr( charCS, fields.Saves_monParalysis, saves[0] );
			setAttr( charCS, fields.Saves_monPoison, saves[0] );
			setAttr( charCS, fields.Saves_monDeath, saves[0] );
			setAttr( charCS, fields.Saves_monRod, saves[1] );
			setAttr( charCS, fields.Saves_monStaff, saves[1] );
			setAttr( charCS, fields.Saves_monWand, saves[1] );
			setAttr( charCS, fields.Saves_monPetri, saves[2] );
			setAttr( charCS, fields.Saves_monPolymorph, saves[2] );
			setAttr( charCS, fields.Saves_monBreath, saves[3] );
			setAttr( charCS, fields.Saves_monSpell, saves[4] );
			setAttr( charCS, fields.Saves_paralysis, saves[0] );
			setAttr( charCS, fields.Saves_poison, saves[0] );
			setAttr( charCS, fields.Saves_death, saves[0] );
			setAttr( charCS, fields.Saves_rod, saves[1] );
			setAttr( charCS, fields.Saves_staff, saves[1] );
			setAttr( charCS, fields.Saves_wand, saves[1] );
			setAttr( charCS, fields.Saves_petrification, saves[2] );
			setAttr( charCS, fields.Saves_polymorph, saves[2] );
			setAttr( charCS, fields.Saves_breath, saves[3] );
			setAttr( charCS, fields.Saves_spell, saves[4] );
			setAttr( charCS, fields.Saves_modParalysis, mods.par );
			setAttr( charCS, fields.Saves_modPoison, mods.poi );
			setAttr( charCS, fields.Saves_modDeath, mods.dea );
			setAttr( charCS, fields.Saves_modRod, mods.rod );
			setAttr( charCS, fields.Saves_modStaff, mods.sta );
			setAttr( charCS, fields.Saves_modWand, mods.wan );
			setAttr( charCS, fields.Saves_modPetrification, mods.pet );
			setAttr( charCS, fields.Saves_modPolymorph, mods.pol );
			setAttr( charCS, fields.Saves_modBreath, mods.bre );
			setAttr( charCS, fields.Saves_modSpell, mods.spe );
			
			content +='{{'+tokenName+'=<table>'
					+ '<tr><td>[['+saves[0]+']]</td><td>Paralysis('+(mods.par>=0?'+':'')+mods.par+'), Poison('+(mods.poi>=0?'+':'')+mods.poi+'), Death('+(mods.dea>=0?'+':'')+mods.dea+')</td></tr>'
					+ '<tr><td>[['+saves[1]+']]</td><td>Rod('+(mods.rod>=0?'+':'')+mods.rod+'), Staff('+(mods.sta>=0?'+':'')+mods.sta+'), Wand('+(mods.wan>=0?'+':'')+mods.wan+')</td></tr>'
					+ '<tr><td>[['+saves[2]+']]</td><td>Petrification('+(mods.pet>=0?'+':'')+mods.pet+'), Polymorph('+(mods.pol>=0?'+':'')+mods.pol+')</td></tr>'
					+ '<tr><td>[['+saves[3]+']]</td><td>Breath('+(mods.bre>=0?'+':'')+mods.bre+')</td></tr>'
					+ '<tr><td>[['+saves[4]+']]</td><td>Spell('+(mods.spe>=0?'+':'')+mods.spe+')</td></tr></table>}}'
					+ ((selected.length == 1) ? itemText : '');
		
		});
		if (attkMenu || (args && args[1])) {
			content += '{{desc=[Return to Menu]('+(attkMenu ? ('!attk --button '+BT.SAVES+'|'+tokenID) : ('!cmd --button '+args[1]))+')}}';
		}
		
//		log('handleCheckSaves: content = '+content);

		if (isGM || !charCS) {
			sendFeedback( content );
		} else {
			sendResponse( charCS, content );
		}
		return;
	}
	
// ------------------------------------------------------------- Command Action Functions ---------------------------------------------

	/**
	 * Show help message
	 */ 

	var showHelp = function() {
		var content = 
			'<div style="background-color: #FFF; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; margin-left: 2px; margin-right: 2px; padding-top: 5px; padding-bottom: 5px;">'
				+ '<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 125%">AttackMaster v'+version+'</span>'
				+ '</div>'
				+ '<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
					+ '<div style="font-weight: bold;">!attk --help</div>'
					+ '<li style="padding-left: 10px;">Display this message</li><br>'
					+ '<div style="font-weight: bold;">!attk --menu [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display attack action menu</li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token taking action.</li><br>'
					+ '<div style="font-weight: bold;">!attk --other-menu [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display other actions menu</li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token taking action.</li><br>'
					+ '<div style="font-weight: bold;">!attk --attk-hit [tokenID]|[msg]|[mon1]|[mon2]|[mon3]</div>'
					+ '<li style="padding-left: 10px;">Attack with an in-hand weapon. Alternatives: <b>--attk-roll</b> & <b>--attk-target</b></li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of attacking token</li>'
					+ '<li style="padding-left: 20px;"><b>msg</b> to display with damage</li>'
					+ '<li style="padding-left: 20px;"><b>mon1/2/3</b> names of upto 3 innate monster attacks</li><br>'
					+ '<div style="font-weight: bold;">!attk --weapon [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Change held weapons</li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token changing weapons</li><br>'
					+ '<div style="font-weight: bold;">!attk --dance [tokenID]|weapon|[STOP]</div>'
					+ '<li style="padding-left: 10px;">Set or stop a weapon dancing</li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token with dancing weapon</li>'
					+ '<li style="padding-left: 20px;"><b>weapon</b> name of dancing weapon</li>'
					+ '<li style="padding-left: 20px;"><b>STOP</b> stops the weapon dancing</li><br>'
					+ '<div style="font-weight: bold;">!attk --mod-weapon [tokenID]|weapon|MELEE/RANGED/DMG/AMMO|adj</div>'
					+ '<li style="padding-left: 10px;">Adjust weapon statistics. Alternatives: <b>--quiet-modweap</b></li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token with weapon</li>'
					+ '<li style="padding-left: 20px;"><b>weapon</b> name of weapon</li>'
					+ '<li style="padding-left: 20px;"><b>MELEE/etc</b> type of table entry to adjust</li>'
					+ '<li style="padding-left: 20px;"><b>adj</b> formatted adjustments (see read-me)</li><br>'
					+ '<div style="font-weight: bold;">!attk --ammo [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display ammo recovery menu</li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token recovering ammo</li><br>'
					+ '<div style="font-weight: bold;">!attk --setammo [tokenID]|ammo|[ [+/-]cur_qty/=]|[ [+/-]max_qty/=]|[SILENT]</div>'
					+ '<li style="padding-left: 10px;">Adjust ammo quantities</b></li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token with ammo</li>'
					+ '<li style="padding-left: 20px;"><b>ammo</b> name of ammo</li>'
					+ '<li style="padding-left: 20px;"><b>cur_qty</b> value for current qty</li>'
					+ '<li style="padding-left: 20px;"><b>max_qty</b> value for max qty</li>'
					+ '<li style="padding-left: 20px;"><b>SILENT</b> to silence responses</li><br>'
					+ '<div style="font-weight: bold;">!attk --checkac [tokenID]|[SILENT]|[SADJ/PADJ/BADJ]</div>'
					+ '<li style="padding-left: 10px;">Check AC values</b></li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token with armour</li>'
					+ '<li style="padding-left: 20px;"><b>SILENT</b> to silence responses</li>'
					+ '<li style="padding-left: 20px;"><b>SADJ/PADJ/BADJ</b> show AC for S/P/B attacks</li><br>'
					+ '<div style="font-weight: bold;">!attk --save [tokenID]|[sit-mod]</div>'
					+ '<li style="padding-left: 10px;">Show/make/edit saving throws</b></li>'
					+ '<li style="padding-left: 20px;"><b>tokenID</b> of token making save</li>'
					+ '<li style="padding-left: 20px;"><b>sit-mod</b> +/- situational modifier to save</li><br>'
				+ '</div>'
   			+ '</div>'; 

		sendFeedback(content); 
	};
	
	/*
	 * Display a menu of attack options
	 */
	 
	var doMenu= function(args,isGM, selected) {
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doMenu: no token specified');
			sendError('No token selected');
			return;
		}
			
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doMenu: specified token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		makeAttkActionMenu(args,isGM);
		return;
	}

	/*
	 * Display a menu of other actions
	 */
	 
	var doOtherMenu= function(args,isGM, selected) {
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doOtherMenu: no token specified');
			sendError('No token selected');
			return;
		}
			
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doOtherMenu: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		makeOtherActionsMenu(args,isGM);
		return;
	}

	/*
	* Function to display the menu for attacking with physical melee, ranged or innate weapons
	*/

	var doAttk = function(args,attkType,selected) {
		if (!args) args = [];
			
		if (!_.contains(Attk,attkType.toUpperCase())) {
			sendDebug('doAttk: Invalid attkType '+attkType+' specified');
			sendError('Invalid AttackMaster parameter');
			return;
		}

		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doAttk: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		
		if (args.length < 1 || args.length > 5) {
			sendDebug('doAttk: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID ),
		    mAttk;
	
		if (!charCS) {
            sendDebug( 'doAttackMenu: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		if (!args[2] && (mAttk = (attrLookup( charCS, fields.Monster_dmg1 ) || '')).length) {
			args[2] = mAttk.split(',')[0];
		}
		if (!args[3] && (mAttk = (attrLookup( charCS, fields.Monster_dmg2 ) || '')).length) {
			args[3] = mAttk.split(',')[0];
		}
		if (!args[4] && (mAttk = (attrLookup( charCS, fields.Monster_dmg3 ) || '')).length) {
			args[4] = mAttk.split(',')[0];
		}
        
		makeAttackMenu( ['', tokenID, attkType, null, null, args[1]], MenuState.ENABLED, args[2], args[3], args[4] );
		return;
    };
	
	/*
	 * Modify an attribute of a weapon in one of 
	 * the weapon attack tables
	 * Syntax: --modWeapon tokenID|weaponName|table|attributes:values
	 * table: Melee,Dmg,Ranged,Ammo
	 * attribute: w,t,st,+,sb,db,n,c,m,r,sp,sz,ty,sm,l
	 */
	 
	var doModWeapon = function( args, silent, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doModWeapon: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		if (args.length < 4) {
			sendDebug('doModWeapon: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
			weaponName = args[1],
			table = args[2],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doModWeapon: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		if (!['MELEE','RANGED','DMG','AMMO'].includes(table.toUpperCase())) {
            sendDebug( 'doModWeapon: table type '+table+' is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };

		args.unshift('');
		handleModWeapon( args, silent );
		if (!silent) {
			let content = '&{template:'+fields.defaultTemplate+'}{{name=Weapon Specification Changed}}'
						+ '{{desc='+getObj('graphic',tokenID).get('name')+'\'s '+weaponName+' has had a modification}}';
			sendResponse( charCS, content );
		}
		return;
	}
	
	/*
	 * Modify the amount of a specified type of ammo.
	 * This sets both the ammo line (if current) and 
	 * the corresponding Magic Item.
	 */
	 
	var doSetAmmo = function( args, selected ) {
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doSetAmmo: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		
		if (args.length < 4) {
			sendDebug('doSetAmmo: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doSetAmmo: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		handleAmmoChange( args );
		return;
	}
	
	/*
	 * Display a menu to allow the player to recover or 
	 * change ammunition quantities.
	 */
	 
	var doAmmoMenu = function( args, selected ) {

		if (!args) args = [];

		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doAmmoMenu: tokenID not specified');
			sendError('No token selected');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doAmmoMenu: tokenID does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		makeAmmoMenu( args );
		return;
	}
	
 

	
	/*
	 * Specify that the next attack will be using 
	 * multiple weapons 
	 */
	
	var doMultiSwords = function( args, selected ) {
		
		if (!args) {args = [];}
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doMultiSwords: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		if (!getCharacter(args[0])) {
            sendDebug( 'doMultiSwords: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
			
		handleSetPrimaryWeapon( args );
		return;
	}
	
	/*
	 * Display a menu to allow the Player to change the weapon(s)
	 * that a character is wielding, selecting them from the MI Bag,
	 * and create them in the weapon tables.  For ranged weapons,
	 * also search the MI Bag for ammo for that type of ranged weapon.
	 */
	 
	var doChangeWeapon = function( args, isGM, selected ) {
		
		if (!args) {args = [];}

		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doChangeWeapon: Token not specified');
			sendError('No token selected');
			return;
		};
		
		if (!getCharacter(args[0])) {
            sendDebug( 'doChangeWeapon: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };

        args.unshift('');
		makeChangeWeaponMenu( args, isGM, args[2] );
		return;
	}
	
	/*
	 * Manage the starting and stopping of a dancing weapon, or 
	 * other form of auto-attacking weapon that does not use a 
	 * character's hand
	 */
	 
	var doDancingWeapon = function( args, isGM, selected ) {

		if (!args) {args = [];}
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doDancingWeapon: No token selected');
			sendError('No token selected');
			return;
		}

		if (args.length < 2) {
			sendDebug('doDancingWeapon: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		if (!getCharacter(args[0])) {
            sendDebug( 'doDancingWeapon: tokenID does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };

        args.unshift((args[2] || '').toUpperCase()=='STOP' ? BT.AUTO_DELETE : BT.AUTO_ADD);
		handleDancingWeapons( args, isGM );
		return;
	}
	
	/**
	 * Function to display the Edit Item Bag menu
	 */
	 
	var doEditMIbag = function( args, selected, senderId ) {
		
		if (!args) args = [];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doEditMIbag: No token selected');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doEditMIbag: invalid ID arguments');
			sendError('Invalid magicMaster parameters');
			return;
		};
		
		args = [BT.EDIT_MI,tokenID,-1,''];
		makeEditBagMenu( args, senderId );
		return;
	}
	
	/*
	 * Scan the MI bag for Armour, Shields and Protective items 
	 * to determine the base AC.  Add any Dex or other bonuses, and 
	 * set the token AC_max as this.  Then check token effects -
	 * if there are no effects set the AC_current to this, otherwise 
	 * if the two are different turn on the AC bar to indicate difference
	 */
	 
	var doCheckAC = function( args, isGM, selected, silent = false ) {
		
		if (!args) args=[];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		}
		
		var tokenID = args[0],
			silentCmd = args[1] || '',
			dmgType = (args[2] || 'nadj').toLowerCase(),
			noDmgAdj = dmgType == 'nadj',
			senderID = args[3],
			curToken = getObj('graphic',tokenID),
			charCS;
			
		if (!curToken)
			{throw {name:'AttackMaster error', message:'Invalid token_id provided.'};}
		charCS = getCharacter( tokenID );
		if (!charCS) return false;
		
		if (!['sadj','padj','badj','nadj'].includes(dmgType)) {
			throw {name:'attackMaster error', message:'Invalid damage type provided.'};
		}
		
		silent = silent || (silentCmd.toLowerCase().trim() == 'silent');
		isGM = _.isUndefined(senderID) ? isGM : playerIsGM(senderID);
		
		if ((attrLookup( charCS, fields.MonsterAC ) || '').length) {
			let monsterAC = attrLookup( charCS, fields.MonsterAC );
			if (!silent && isGM) sendFeedback('Monster AC is '+monsterAC);
			setAttr( charCS, fields.StdAC, monsterAC );
			setAttr( charCS, fields.SlashAC, monsterAC );
			setAttr( charCS, fields.PierceAC, monsterAC );
			setAttr( charCS, fields.BludgeonAC, monsterAC );
			setAttr( charCS, fields.StdMissileAC, monsterAC );
			setAttr( charCS, fields.SlashMissileAC, monsterAC );
			setAttr( charCS, fields.PierceMissileAC, monsterAC );
			setAttr( charCS, fields.BludgeonMissileAC, monsterAC );
			return;
		}
		
		var armourInfo = scanForArmour( charCS );
		
		var	acValues = armourInfo.acValues,
			armourMsgs = armourInfo.msgs,
			dexBonus = parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0) * -1,
			baseAC = (parseInt(acValues.armour.data.ac || 10) - parseInt(acValues.armour.data.adj || 0)),
            prevAC = parseInt(attrLookup( charCS, fields.Armour_normal ) || 10),
			dmgAdj = {armoured:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0},
					  sless:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0},
					  aless:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0}},
			magicArmour = acValues.armour.magic,
			armouredDexBonus = dexBonus,
			armourlessDexBonus = dexBonus,
			shieldlessDexBonus = dexBonus,
			armourlessAC = 10,
			ac, currentAC;

		_.each( acValues, (e,k) => {
			if (k == 'armour') return;
			if (!k.toLowerCase().includes('protection') || !magicArmour) {
				
				dmgAdj.armoured = _.mapObject(dmgAdj.armoured, (d,a) => {return d + parseInt(e.data[a] || 0)});
				armouredDexBonus *= parseFloat(e.data.db || 1);
				if (k == 'shield') {
					dmgAdj.armoured.adj += parseInt(e.data.ac || 1);
				} else {
					dmgAdj.sless = _.mapObject(dmgAdj.sless, (d,a) => {return d + parseInt(e.data[a] || 0)});
					shieldlessDexBonus *= parseFloat(e.data.db || 1);
				}
			}
			if (k != 'shield') {
				dmgAdj.aless = _.mapObject(dmgAdj.aless, (d,a) => {;return d + parseInt(e.data[a] || 0)});
				armourlessDexBonus *= parseFloat(e.data.db || 1);
			}
		});
		dmgAdj.armoured.adj += dmgAdj.armoured[dmgType];
		dmgAdj.sless.adj += dmgAdj.sless[dmgType];
		baseAC -= parseInt(acValues.armour.data[dmgType] || 0);
		dmgAdj.armoured.madj += parseInt(acValues.armour.data.madj || 0);
		dexBonus = Math.floor(armouredDexBonus * parseFloat(acValues.armour.data.db || 1));
		
		if (dexBonus) {
			acValues.dexBonus = {name:('Dexterity Bonus '+dexBonus),specs:['',('Dexterity Bonus '+dexBonus),'dexterity','0H','dexterity'],data:{adj:dexBonus}};
		}

//		log('Final baseAC='+baseAC+', -adj='+dmgAdj.armoured.adj+', -dexBonus='+dexBonus);

        setAttr( charCS, fields.Armour_normal, (baseAC - dmgAdj.armoured.adj - dexBonus) );
		setAttr( charCS, fields.Armour_missile, (baseAC - dmgAdj.armoured.adj - dexBonus - dmgAdj.armoured.madj) );
		setAttr( charCS, fields.Armour_surprised, (baseAC - dmgAdj.armoured.adj) );
		setAttr( charCS, fields.Armour_back, (baseAC - dmgAdj.sless.adj - dmgAdj.sless.madj) );
		setAttr( charCS, fields.Armour_head, (baseAC - dmgAdj.armoured.adj - dexBonus - 4) );
		setAttr( charCS, fields.Shieldless_normal, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus) );
		setAttr( charCS, fields.Shieldless_missile, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - dmgAdj.sless.madj) );
		setAttr( charCS, fields.Shieldless_surprised, (baseAC - dmgAdj.sless.adj) );
		setAttr( charCS, fields.Shieldless_back, (baseAC - dmgAdj.sless.adj) );
		setAttr( charCS, fields.Shieldless_head, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - 4) );
		setAttr( charCS, fields.Armourless_normal, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus) );
		setAttr( charCS, fields.Armourless_missile, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - dmgAdj.aless.madj) );
		setAttr( charCS, fields.Armourless_surprised, (armourlessAC - dmgAdj.aless.adj) );
		setAttr( charCS, fields.Armourless_back, (armourlessAC - dmgAdj.aless.adj) );
		setAttr( charCS, fields.Armourless_head, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - 4) );
		
		dmgAdj.armoured.sadj += parseInt(acValues.armour.data.sadj || 0);
		dmgAdj.armoured.padj += parseInt(acValues.armour.data.padj || 0);
		dmgAdj.armoured.badj += parseInt(acValues.armour.data.badj || 0);
			
		// set token circles & bars
		
        ac = (baseAC - dmgAdj.armoured.adj - dexBonus);
		currentAC = parseInt(getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC));
		currentAC = isNaN(currentAC) ? ac : currentAC + ac - prevAC;
		if (fields.Token_MaxAC[0].length) {
			if (currentAC != ac) {
				curToken.set(fields.Token_MaxAC[0]+'_'+fields.Token_MaxAC[1],((ac*currentAC)<0)?currentAC:ac);
			} else {
				curToken.set(fields.Token_MaxAC[0]+'_'+fields.Token_MaxAC[1],'');
			}
		}
		if (fields.Token_AC[0].length) {
			curToken.set(fields.Token_AC[0]+'_'+fields.Token_AC[1],currentAC);
		}
		
		setAttr( charCS, fields.StdAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj) );
		setAttr( charCS, fields.SlashAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj) );
		setAttr( charCS, fields.PierceAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj) );
		setAttr( charCS, fields.BludgeonAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj) );
		setAttr( charCS, fields.StdMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj-dmgAdj.armoured.madj) );
		setAttr( charCS, fields.SlashMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj-dmgAdj.armoured.madj) );
		setAttr( charCS, fields.PierceMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj-dmgAdj.armoured.madj) );
		setAttr( charCS, fields.BludgeonMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj-dmgAdj.armoured.madj) );

		if (!silent || (ac != prevAC)) {
			makeACDisplay( args, ac, dmgAdj, acValues, armourMsgs, isGM );
		}
		return false;
	}
	
	/*
	 * Handle making a saving throw
	 */
	 
	var doSave = function( args, isGM, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doSave: no token specified');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug('doSave: invalid tokenID passed as args[0]');
			sendError('Invalid token selected');
			return;
		}
		
		makeSavingThrowMenu( args, isGM );
		return;
	}
	
	/*
	 * Check the saving throw table
	 */
	 
	var doCheckSaves = function( args, isGM, selected ) {
		
		handleCheckSaves( args, isGM, selected );
		return;
	}
	
	/*
	 * Handle madification of the saving throw table 
	 */
	 
	var doModSaves = function( args, isGM, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doModSaves: no token specified');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			saveType = (args[1] || '').toLowerCase(),
			saveField = (args[2] || '').toLowerCase(),
			saveNewVal = (parseInt((args[3] || 0),10) || 0),
			charCS = getCharacter( tokenID ),
			name, content = '';
			
		if (!charCS) {
			sendDebug('doModSaves: invalid tokenID passed as args[0]');
			sendError('Invalid attackMaster arguments');
			return;
		}
			
		if (saveType == 'all') {
			_.each(saveVals, sVal => (sVal[saveField] ? setAttr( charCS, sVal[saveField], saveNewVal ) : ''));
			content = 'Set all save'+(saveField=='mod'?' modifiers':'s')+' to [['+saveNewVal+']]';
		} else if (saveType && saveVals[saveType] && saveVals[saveType][saveField]) {
			setAttr( charCS, saveVals[saveType][saveField], saveNewVal );
			content = 'Set '+saveType+' save '+(saveField=='mod'?'modifier':'')+' to [['+saveNewVal+']]';
		}
		makeModSavesMenu( args, content );
		return;
	}
	
	/*
	 * Handle the Lend-a-Hand command, so multiple characters can 
	 * work together to man a weapon requiring more than 2 hands
	 */
	 
	var doLendAHand = function( args, isGM ) {
		
		if (!args || args.length < 3) {
			sendDebug('doLendAHand: invalid number of parameters for Lend-a-Hand');
			sendError('Invalid AttackMaster arguments');
			return;
		}
		
		var fromID = args[0],
			toID = args[1],
			noHands = parseInt(args[2] || 2),
			hand = args[3] || BT.HAND,
			fromChar = getCharacter(fromID),
			toChar = getCharacter(toID),
			currentHands;
			
		if (!fromChar || !toChar) {
			sendDebug('doLendAHand: invalid character tokens selected');
			sendError('Invalid AttackMaster arguments');
			return;
		}
		if (noHands > 0) {
			switch (hand.toUpperCase()) {
			case BT.LEFT:
				setAttr( fromChar, fields.Equip_lendLeft, toID );
				break;
			case BT.RIGHT:
				setAttr( fromChar, fields.Equip_lendRight, toID );
				break;
			case BT.BOTH:
			case BT.HAND:
				setAttr( fromChar, fields.Equip_lendBoth, toID );
				break;
			default:
				sendDebug('doLendAHand: invalid hand specified');
				sendError('Invalid AttackMaster arguments');
				return;
			}
		}
		currentHands = Math.max(((parseInt(attrLookup( toChar, fields.Equip_lentHands )) || 0) + noHands), 0);
		setAttr( toChar, fields.Equip_lentHands, currentHands );
		if (noHands > 0) {
			sendResponse( toChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}{{desc='+getObj('graphic',fromID).get('name')+' has lent '+noHands+' hand(s) to you so you can work together}}' );
			sendResponse( fromChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}{{desc=you have lent '+noHands+' hand(s) to '+getObj('graphic',toID).get('name')+' so you can work together}}' );
		}
		if (noHands < 0) {
			currentHands += (parseInt(attrLookup( toChar, fields.Equip_handedness )) || 2);
			let InHandTable = getTable( toChar, {}, fields.InHand_table, fields.InHand_handedness ),
				droppedWeapons = [],
				weapon;
			InHandTable = getTable( toChar, InHandTable, fields.InHand_table, fields.InHand_name );
			for (let i=fields.InHand_table[1]; !_.isUndefined(weapon = tableLookup(InHandTable, fields.InHand_name, i, false)); i++) {
				if (weapon && weapon != '-') {
					noHands = parseInt(tableLookup( InHandTable, fields.InHand_handedness, i)) || 0;
					currentHands -= noHands;
					if (currentHands < 0) {
						droppedWeapons.push( weapon );
						hand = (i==0) ? BT.LEFT : (i==1 ? BT.RIGHT : (i==2 ? BT.BOTH : BT.HAND));
						handleChangeWeapon( [hand,toID,'-',i], isGM, true );
					}
				}
			}
			sendResponse( toChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}'
								 +'{{desc='+getObj('graphic',fromID).get('name')+' is no longer lending you their hands'
								 +(droppedWeapons.length ? (', and you have had to drop '+droppedWeapons.join(', ')) : '')+'}}' );
			sendResponse( fromChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}{{desc=You are no longer lending hand(s) to '+getObj('graphic',toID).get('name')+'}}');
		}
		return;
	}
	
	/*
	 * Handle the Config command, to configure the API
	 */
 
	var doConfig = function( args ) {
		
		if (!args || args.length < 2) {
			makeConfigMenu( args );
			return;
		}
		
		var flag = args[0].toLowerCase(),
			value = args[1].toLowerCase() == 'true',
			msg = '';
		
		switch (flag) {
		case 'prof':
			state.attackMaster.weapRules.prof = value;
			msg = value ? 'Non-Proficient weapon penalty set as per rules' : 'Non-Proficienct weapon penalty uses Character Sheet field value';
			break;
			
		case 'all-weaps':
			state.attackMaster.weapRules.allowAll = value;
			msg = value ? 'All classes can be proficient in all weapons' : 'Class weapons restricted to some degree';
			break;
			
		case 'weap-class':
			state.attackMaster.weapRules.classBan = value;
			msg = value ? 'Classes strictly restricted to allowed weapons' : 'Classes can use restricted weapons at increased penalty';
			break;
			
		case 'all-armour':
			state.attackMaster.weapRules.allowArmour = value;
			msg = value ? 'All classes can use any armour' : 'Class armour restricted to rules';
			break;
			
		case 'master-range':
			state.attackMaster.weapRules.masterRange = value;
			msg = value ? 'Ranged weapons can be Mastered' : 'Only Melee weapons can be Mastered';
			break;
			
		case 'dm-target':
			state.attackMaster.weapRules.dmTarget = value;
			msg = value ? 'DM uses Targeted Attack by default' : 'DM uses standard To-Hit Attack by default';
			break;
			
		default:
			sendError('Invalid Config Command syntax');
			return;
		}
		makeConfigMenu( args, msg );
		return;
	}

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, isGM, senderId ) {
		if (!args)
			{return;}

		if (args.length < 1) {
			sendDebug('doButton: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};

		var	handler = args[0];
			
		switch (handler) {
        case BT.MELEE :
        case BT.BACKSTAB :
		case BT.RANGED :
		
			makeAttackMenu( args, false );
			break;
			
		case BT.RANGEMOD :
		
			makeAttackMenu( args, true );
			break;

		case BT.AMMO :
		    args[3]=('+-'.includes(args[3][0])?args[3]:'+'+args[3]);
			handleAmmoChange( args );
			break;
			
		case BT.LEFT :
		case BT.RIGHT :
		case BT.BOTH :
		case BT.HAND :
		
			handleChangeWeapon( args, isGM );
			break;
			
		case BT.NOHANDS :
		
			makeHandednessMenu( args );
			break;
			
		case BT.ADD_MIROW:
		    
		    handleAddMIrow( args, senderId );
		    break;
			
		case BT.EDITMI_OPTION:
		
			handleOptionButton( args, senderId );
			break;

		case BT.CHOOSE_MI :
		
			handleSelectMI( args, isGM, senderId );
			break;
			
		case BT.REDO_CHOOSE_MI:
		    
		    makeEditBagMenu( args, senderId );
		    break;
			
		case BT.REVIEW_MI :
			 
			handleReviewMI( args );
			break;
			
		case BT.SLOT_MI :
		
			handleSelectSlot( args, isGM, senderId );
			break;
			
		case BT.STORE_MI :
		
			handleStoreMI( args, isGM, senderId );
			break;

		case BT.REMOVE_MI :
		
			handleRemoveMI( args, isGM, senderId );
			break;
			
		case BT.SAVES :
			args.shift();
			makeSavingThrowMenu( args, isGM );
			break;
			
		default :
			sendDebug('doButton: Invalid button type');
			sendError('Invalid attackMaster syntax');
		};

	};


/* ----------------------------------- Handle handshakes ------------------------------ */
	 
	/**
	 * Handle a database indexing handshake
	 **/
	 
	var doIndexDB = function( args ) {
		
		apiDBs[args[0]] = true;
		updateDBindex();
		return;
	};
		
	/**
	 * Handle handshake request
	 **/
	 
	var doHsQueryResponse = function(args) {
		if (!args) return;
		var from = args[0] || '',
			func = args[1] || '',
			funcTrue = ['menu','other-menu','attk-hit','attk-roll','attk-target','weapon','dance','mod-weapon','quiet-modweap','ammo','setammo','checkac','save','help','check-db','debug'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr attk'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
		sendAttkAPI(cmd);
		return;
	};

	/**
	 * Handle the response to a handshake query
	 **/
	 
	var doHandleHsResponse = function(args) {
		if (!args) {
			sendError('Invalid handshake response received');
			return;
		}
		var from = args[0] || '',
			func = args[1] || '',
			funcExists = (!!args[2]) || false;
		
		if (!apiCommands[from]) {
			apiCommands[from] = {};
		}
		apiCommands[from].exists = true;
		if (func && func.length) {
			apiCommands[from][func] = funcExists;
		}
		if (!_.isUndefined(apiDBs[from])) {
			apiDBs[from] = false;
		}
		return;
	}

	/**
	 * Handle Pending Requests
	 */

	var doRelay = function(args,senderId) {
		if (!args) 
			{return;}
		var carry,
			hash; 
		args = args.split(' %% '); 
		if (!args) { log(args); return; }
		hash = args[0];
		if (hash) {
			hash = hash.match(/hc% .+/);
			if (!hash) { log(hash); return; }
			hash = hash[0].replace('hc% ','');
			carry = args[1];
			if (carry)
				{carry = carry.trim();}
			var pr = findPending(hash);
			if (pr) {
				pr.doOps(carry);
				clearPending(hash);    
			} else {
                sendDebug('doRelay: Selection Invalidated');
				sendResponseError(senderId,'Selection Invalidated');
			}
		}
	}; 


// -------------------------------------------------------- Event Handlers --------------------------------------------------
            
	/**
	 * Handle chat message event
	 * RED: v1.213 Updated to allow multiple actions per call
	 * This allows procedural/linear processing of activity and overcomes
	 * some of the limitations of Roll20 asynchronous processing
	 */ 


	var handleChatMessage = function(msg) { 
		var args = processInlinerolls(msg),
			senderId = msg.playerid,
			selected = msg.selected,
			isGM = (playerIsGM(senderId) || state.attackMaster.debug === senderId);
			
		if (msg.type !=='api' || args.indexOf('!attk') !== 0)
			{return;}

		sendDebug('attackMaster called');

		args = args.split(' --');
		args.shift();

		senderId = msg.playerid;
		if (_.isUndefined(senderId) || _.isUndefined(getObj('player',senderId))) {
			sendDebug('senderId undefined, looking for GM');
			if (_.isUndefined(senderId = findTheGM())) {
				sendDebug('Unable to findTheGM');
				return;
			} else {
				sendDebug('found the GM');
				isGM = true;
			}
		} else {
			sendDebug('senderId is defined as ' + getObj('player',senderId).get('_displayname'));
		};
		
		_.each(args, function(e) {
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
			argString = (i<0 ? '' : arg.substring(i+1).trim());
			arg = argString.split('|');
			
			try {
				switch (cmd) {
				case 'attk-hit':
					if (isGM && state.attackMaster.weapRules.dmTarget) {
						doAttk(arg,Attk.TARGET,selected);
						break;
					}
				case 'attk-menu-hit':
					doAttk(arg,Attk.TO_HIT,selected);
					break;
				case 'attk-roll':
					doAttk(arg,Attk.ROLL,selected);
					break;
				case 'attk-target':
					doAttk(arg,Attk.TARGET,selected);
					break;
				case 'ammo':
					doAmmoMenu(arg,selected);
					break;
				case 'setammo':
					doSetAmmo(arg,selected);
					break;
				case 'checkac':
//					updateDBindex();
					doCheckAC(arg, isGM, selected, false);
					break;
				case 'twoswords':
					doMultiSwords(arg,selected);
					break;
				case 'weapon':
					doChangeWeapon(arg,isGM,selected);
					break;
				case 'lend-a-hand':
					doLendAHand(arg);
					break;
				case 'dance':
					doDancingWeapon(arg,isGM,selected);
					break;
				case 'mod-weapon':
					doModWeapon(arg,false,selected);
					break;
				case 'quiet-modweap':
					doModWeapon(arg,true,selected);
					break;
    	    	case 'edit-weapons':
				case 'edit-armour':
				case 'edit-armor':
    	    	    doEditMIbag(arg,selected,senderId);
					break;
				case 'save':
					doSave(arg,isGM,selected);
					break;
				case 'check-saves':
					doCheckSaves(arg, isGM, selected);
					break;
				case 'setsaves':
					doModSaves(arg,isGM,selected);
					break;
				case 'menu':
					doMenu(arg,isGM,selected);
					break;
				case 'other-menu':
					doOtherMenu(arg,isGM,selected);
					break;
				case 'update-db':
					doUpdateDB(arg, false);
					break;
				case 'check-db':
					if (isGM) checkCSdb(arg);
					break;
				case 'index-db':
					if (isGM) doIndexDB(arg);
					break;
				case 'config':
					if (isGM) doConfig(arg);
					break;
				case 'set-all-ac':
					if (isGM) checkACvars(true);
					break;
				case 'hsq':
				case 'handshake':
					doHsQueryResponse(arg);
					break;
				case 'hsr':
					doHandleHsResponse(arg);
					break;
				case 'handout':
				case 'handouts':
					if (isGM) updateHandouts(false,senderId);
					break
				case 'button':
					doButton(arg,isGM, senderId);
					break;
				case 'help':
					showHelp();
					break;
				case 'relay':
					if (isGM) doRelay(argString,senderId);
					break;
				case 'debug':
					// RED: v1.207 allow anyone to set debug and who to send debug messages to
					doSetDebug(argString,senderId);
					break;
				default:
					showHelp(); 
					sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
				}
			} catch (e) {
				sendDebug('attackMaster handleChatMsg: JavaScript '+e.name+': '+e.message+' while processing cmd '+cmd);
				sendError('attackMaster JavaScript '+e.name+': '+e.message);
			}
    	});
		return;
	};

	 
// -------------------------------------------------------------- Register the API -------------------------------------------

	/*
	 * Register attackMaster API with the
	 * commandMaster API
	 */
	 
	var cmdMasterRegister = function() {
		var cmd = fields.commandMaster
				+ ' --register Attack_hit|Do an attack where Roll20 rolls the dice|attk|~~attk-hit|`{selected|token_id}'
				+ ' --register Attack_roll|Do an attack where player rolls the dice|attk|~~attk-roll|`{selected|token_id}'
				+ ' --register Attack_target|Do an attack with full target statistics (GM-only)|attk|~~attk-target|`{selected|token_id}'
				+ ' --register Attack_menu|Display a menu of attack functions|attk|~~menu|`{selected|token_id}'
				+ ' --register Other_actions|Display a menu of Other Actions|attk|~~other-menu|`{selected|token_id}'
				+ ' --register Ammo|Retrieve or acquire ammo|attk|~~ammo|`{selected|token_id}'
				+ ' --register Save|Make and maintain saving throws|attk|~~save|`{selected|token_id}'
				+ ' --register Change_weapon|Change weapons in-hand|attk|~~weapon|`{selected|token_id}'
				+ ' --register Check_armour|Check and display current armour class|attk|~~checkac|`{selected|token_id}'
				+ ' --register Edit_weapons|Add and remove weapons owned|attk|~~edit-weapons|`{selected|token_id}'
				+ ' --register Edit_armour|Add and remove armour owned|attk|~~edit-armour|`{selected|token_id}';
		sendAttkAPI( cmd );
		return;
	};
	
	var handleNewToken = function(obj,prev) {
		
		log('handleNewToken: detected added token');
		
		if (!obj)
			{return;}
			
		if (obj.get('name') == prev['name'])
		    {return;}
		
		if (obj.get('_subtype') == 'token' && !obj.get('isdrawing')) {
			log('handleNewToken: checking AC of '+obj.get('name'));
			doCheckAC( [obj.id], true, [], true );
		}
		return;
	}

	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('change:graphic:name',handleNewToken);
	};
 
	return {
		init: init,
		registerAPI: registerAPI
	};
 
}());

on("ready", function() {
	'use strict'; 
	attackMaster.init(); 
	attackMaster.registerAPI();
});