/**
 * initMaster.js
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
 * The goal of this script is to create and automate aspects of initiative
 * rolling, modifying and tracking, initially for the ADnD 2e game in Roll20.
 * Designed to be used with the roundMaster !rm API Script
 * 
 * v0.001  30/11/2020  Initial creation 
 * v0.002  03/12/2020  Added handling for carry-over (actions of more than 10 segments)
 * v0.003  05/12/2020  Added disabling of the initiative menu after selection
 * v0.004  06/12/2020  Added additional menus for Powers & Magic Items
 * v0.005  06/12/2020  Added better state values and flags, and added Thieving initiative menu
 * v0.006  07/12/2020  (Changes not documented...)
 * v0.007  12/12/2020  Removed Fighter restriction on initiative menu, and removed ammo display
 *                     on the weapon initiative if there is no ammo definition for a weapon
 * v0.008  28/12/2020  Change attrLookup() and setAttr() functions to move the 'caseSensitive'
 *                     flag to be the last parameter, optional and default to false.
 * v0.009  28/12/2020  Add a 'Two Weapons' button for Fighters which allows selection of
 *                     two melee weapons for initiative
 * v0.010  13/01/2021  Corrected how menus are built for tables with no static first row
 *                     to support new AD&D 2E character sheet
 * v0.011  19/01/2021  Corrected the initiative rolls for Fighters using 2 weapons, to allow
 *                     any second weapon, with only 1 attack for the 2nd weapon, and also
 *                     include Rogues as per PHB.
 * v0.012  26/01/2021  Added support for the @{twoHanded} field in the weapons tables, and 
 *                     used to limit the weapons that can be used single handed for two weapon attacks
 *                     Also silenced any 3d dice rolls from sendChat() to suppress any ghosts 
 * v1.012  29/01/2021  First released version used in Lost & Found: White Plume Mountain
 * v1.013  03/02/2021  Integrated two-handed weapon selection with Armour Class management
 *                     in the attackMaster API.
 * v1.014  11/02/2021  If players who control characters are not online, send messages for
 *                     that character to the GM.
 * v1.015  12/02/2021  Fixed a problem with Haste which caused subsequent attack initiatives
 *                     to fail. (also fixed Haste-end effect)
 * v1.016  18/02/2021  Changed spell initiative menu to display the correct number of spells
 *                     at every level up to 7 for priests or 9 for wizards
 * v1.017  24/02/2021  Corrected inconsistencies in the name of init_submitVal, which caused
 *                     initiative carry-over to not work.
 * v1.018  03/03/2021  Updated to deal with new spell usage, retaining name but disabling
 *                     selection button for cast-value of 0
 * v1.019  19/03/2021  Fixed error with doing initiative for the second MI in any character's
 *                     MI Bag, which would always cause an API crash.
 * v1.020  01/04/2021  Amend attrLookup() and setAttr() to use fields object more efficiently
 * v1.021  03/05/2021  Register with new commandMaster API
 * v1.022  07/05/2021  Amend Ranged Weapons initiative to ignore ammo numbers to work with
 *                     new AttackMaster API
 * v1.023  08/05/2021  Enabled initiative for "All Weapons" for characters/NPCs/monsters 
 *                     with more than 2 weapon hands.
 * v1.024  11/05/2021  Added support for Dancing weapons, displaying as auto-selected buttons 
 *                     on Initiative menus and automatically added to the Turn Order.  Also 
 *                     detected existance of Powers & Magic Items, and suppress initative buttons
 *                     that don't apply.  Also standard Initiative Menu call now deals with all
 *                     types of character/monster, inc simple & complex monsters in one call
 * v1.025  27/05/2021  Commented out diagnostic logs.
 * v1.026  19/06/2021  Amended sendResponse() to ignore the Viewer player id
 * v1.027  26/06/2021  Changed handleInitSubmit() to work with the new version of roundMaster,
 *                     using absolute init roll values, rather than base+increment
 * v1.028  28/06/2021  Adapted chat message handling to use a switch statement 
 *                     and have a try/catch strategy for error capture and 
 *                     prevent the API falling over
 * v1.029  03/07/2021  Implemented new Table Management suite not needing ChatSetAttr API
 * v1.030  04/06/2021  Updated MI field names to match MagicMaster API
 */
 
var initMaster = (function() {
	'use strict'; 
	var version = 1.030,
		author = 'RED',
		pending = null;

	/*
	 * The fields object defines all the fields on a character sheet that the
	 * initMaster API uses.  These can be changed by the user **with caution**
	 * DO NOT change the name of each line in the object - this is what initMaster
	 * uses to find the name of the fields you want on the character sheet.
	 * ONLY CHANGE definitions within the '[...]' brackets.  Before the comma is
	 * the name of the field on the character sheet, and after the comma is the
	 * value used in the attribute object with that name.
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
	 *     3rd row:  repeating_weapons_$1_weaponname.current, repeating_weapons_$2_weapspeed.current
	 *     etc...
	 */

	var fields = Object.freeze({
		
		feedbackName:       'initMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		MagicItemDB:        'MI-DB',
		MU_SpellsDB:		'MU-Spells-DB',
		PR_SpellsDB:		'PR-Spells-DB',
		GlobalVarsDB:		'Money-Gems-Exp',
		PowersDB:			'Powers-DB',
		roundMaster:        '!rounds',
		attackMaster:       '!attk',
		commandMaster:		'!cmd',
		Total_level:        ['level-class5','current'],
		Fighter_class:      ['class1','current'],
		Fighter_level:      ['level-class1','current'],
		Wizard_level:       ['level-class2','current'],
		Priest_level:       ['level-class3','current'],
		Rogue_level:        ['level-class4','current'],
		Psion_level:        ['level-class5','current'],
		Expenditure:		['expenditure','current'],
		Thac0:              ['bar2','value'],
		LightSource:        ['lightsource','current'],
		Init_action:		['init_action', 'current'],
		Init_2ndAction:		['init_action', 'max'],
		Init_speed:			['init_speed', 'current'],
		Init_2ndSpeed:		['init_speed', 'max'],
		Init_actNum:		['init_actionnum', 'current'],
		Init_2ndActNum:		['init_actionnum', 'max'],
		Init_preInit:		['init_preinit', 'current'],
		Init_2ndPreInit:	['init_preinit', 'max'],
		Init_2Hweapon:		['init_2H','current'],
		Init_2nd2Hweapon:	['init_2H', 'max'],
		Init_chosen:		['init_chosen', 'current'],
		initMultiplier:     ['comreact','max'],
		initMod:            ['comreact','current'],
		Init_submitVal:		['init_submitVal','current'],
		Init_done:			['init_done', 'current'],
		Init_carry:			['init_carry', 'current'],
		Init_carrySpeed:	['init-carry_speed', 'current'],
		Init_carryAction:	['init-carry_action', 'current'],
		Init_carryActNum:	['init-carry_actionnum', 'current'],
		Init_carryWeapNum:	['init-carry_weapno', 'current'],
		Init_carryPreInit:	['init-carry_preinit', 'current'],
		Init_carry2H:		['init-carry_2H', 'current'],
		Prev_round:			['prev-round', 'current'],
		Strength_hit:       ['strengthhit','current'],
		Strength_dmg:       ['strengthdmg','current'],
		Dmg_magicAdj:       ['strengthdmg','max'],
		Wisdom:				['wisdom','current'],
		Dex_missile:        ['dexmissile','current'],
		Dex_react:          ['dexreact','current'],
		Backstab_mult:      ['backstabmultiplier','current'],
		Weapon_num:			['weapno','current'],
		Weapon_2ndNum:		['weapno','max'],
		Monster_dmg1:		['monsterdmg','current'],
		Monster_dmg2:		['monsterdmg2','current'],
		Monster_dmg3:		['monsterdmg3','current'],
		MWrows:				12,
		MW_table:           ['repeating_weapons',0],
		MW_name:            ['weaponname','current','-'],
		MW_speed:           ['weapspeed','current',5],
		MW_dancing:         ['weapspeed','max',0],
		MW_noAttks:         ['attacknum','current',1],
		MW_attkAdj:         ['attackadj','current',0],
		MW_strBonus:        ['strbonus','current',1],
		MW_twoHanded:       ['twohanded','current',0],
		MW_profLevel:       ['prof-level','current',0],
		MW_crit:            ['crit-thresh','current',20],
		MWdmgRows:			12,
		MW_dmgTable:        ['repeating_weapons-damage',0],
		MW_dmgName:         ['weaponname1','current','-'],
		MW_dmgAdj:          ['damadj','current',0],
		MW_dmgSM:           ['damsm','current',0],
		MW_dmgL:            ['daml','current',0],
		MW_dmgStrBonus:     ['strBonus1','current',1],
		MW_dmgSpecialist:   ['specialist-damage','current',0],
		RWrows:				12,
		RW_table:           ['repeating_weapons2',0],
		RW_name:            ['weaponname2','current','-'],
		RW_speed:           ['weapspeed2','current',5],
		RW_dancing:         ['weapspeed2','max',0],
		RW_noAttks:         ['attacknum2','current',1],
		RW_attkAdj:         ['attackadj2','current',0],
		RW_strBonus:        ['strbonus2','current',0],
        RW_dexBonus:        ['dexbonus2','current',1],
        RW_twoHanded:       ['twohanded2','current',1],
		RW_profLevel:       ['prof-level2','current',0],
		RW_crit:            ['crit-thresh2','current',20],
		RW_range:           ['range2','current','1/2/3'],
		AmmoRows:			12,
		Ammo_table:         ['repeating_ammo',0],
		Ammo_name:          ['ammoname','current','-'],
		Ammo_strBonus:      ['strbonus3','current',0],
		Ammo_dmgAdj:        ['damadj2','current',0],
		Ammo_dmgSM:         ['damsm2','current',0],
		Ammo_dmgL:          ['daml','current',0],
		Ammo_indirect:      ['Ammo-RW','current'],
		Ammo_qty:           ['ammoremain','current',0],
		Ammo_flag:          ['ammo-flag-RW','current',0],
		WProws:				24,
		WP_table:           ['repeating_weaponprofs',0],
		WP_specialist:      ['specialist','current',0],
		WP_mastery:         ['mastery','current',0],
		WP_backstab:        ['chosen-weapon','current',0],
		MUSpellNo_table:	['spell-level',0],
		MUSpellNo_total:	['-total','current'],
		MUSpellNo_memable:	['-castable','current'],
		MUSpellNo_specialist:['-specialist','current'],
		MUSpellNo_misc:		['-misc','current'],
		MUbaseCol:          1,
		PRSpellNo_table:	['spell-priest-level',0],
		PRSpellNo_total:	['-total','current'],
		PRSpellNo_memable:	['-castable','current'],
		PRSpellNo_wisdom:	['-wisdom','current'],
		PRSpellNo_misc:		['-misc','current'],
		PRbaseCol:          28,
		MISpellNo_table:	['spell-level',0],
		MISpellNo_memable:  ['-castable','current'],
		MISpellNo_total:	['-total','current'],
		SpellsCols:         3,
		Spells_table:       ['repeating_spells',false],
		Spells_name:        ['spellname','current'],
		Spells_db:			['spellname','max'],
		Spells_speed:       ['casttime','current'],
		Spells_cost:		['casttime','max'],
		Spells_castValue:	['cast-value','current'],
		Spells_castMax:		['cast-max','current'],
		Spells_storedLevel:	['spell-points','current'],
		Spells_miSpellSet:	['arc','current'],
		Spells_msg:			['cast-macro','current'],
		SpellToMem:			['spelltomem','current'],
		SpellRowRef:		['spellrowref','current'],
		SpellColIndex:		['spellref','current'],
		SpellCharges:		['spellcharges','current'],
		SpellChosen:		['spell-chosen','current'], 
		Casting_level:      ['casting-level','current'],
		MU_Casting_level:   ['mu-casting-level','current'],
		PR_Casting_level:   ['pr-casting-level','current'],
		Casting_name:       ['casting-name','current'],
		Spellbook:          ['spellmem','current'],
		PowersBaseCol:      67,
		PowerRows:			9,
		PowersCols:         3,
		Powers_MIPowers:	27,
		Powers_table:       ['repeating_spells',false],
		Powers_name:        ['spellname','current'],
		Powers_speed:       ['casttime','current'],
		Powers_castValue:	['cast-value','current'],
		Powers_castMax:		['cast-max','current'],
		Power_cast:			['spell-cast','current'],
		MIRows:             24,
		MIPowersRows:		9,
		MIspellLevel:       15,
		MIpowerLevel:		14,
		Items_table:		['repeating_potions',0],
		Items_name:			['potion','current'],
		Items_trueName:		['potion','max'],
		Items_speed:		['potion-speed','current'],
		Items_trueSpeed:	['potion-speed','max'],
		Items_qty:			['potionqty','current'],
		Items_trueQty:		['potionqty','max'],
		Items_cost: 		['potion-macro','current'],
		Items_type:			['potion-macro','max'],
		ItemContainerType:   ['check-for-mibag','current'],
		ItemWeaponList:      ['spellmem','current'],
		ItemArmourList:      ['spellmem2','current'],
		ItemRingList:        ['spellmem3','current'],
		ItemMiscList:        ['spellmem4','current'],
		ItemPotionList:      ['spellmem10','current'],
		ItemScrollList:      ['spellmem11','current'],
		ItemWandsList:       ['spellmem12','current'],
		ItemDMList:			['spellmem13','current'],
		ItemMUspellsList:	['mi-muspells-','current'],
		ItemMUspellValues:	['mi-muspells-','max'],
		ItemPRspellsList:	['mi-prspells-','current'],
		ItemPRspellValues:	['mi-prspells-','max'],
		ItemPowersList:		['mi-powers-','current'],
		ItemPowerValues:		['mi-powers-','max'],
		MIspellPrefix:		['mi-spell-','current'],
		MIpowerPrefix:		['mi-power-','current'],
		Money_gold:         ['gold','current'],
		Money_silver:       ['silver','current'],
		Money_copper:       ['copper','current'],
		Money_treasure:		['otherval','current'],
		Monster_speed:      ['monsterini','current'],
		Armor_name:         ['armorname','current'],
		Armor_mod_none:     'noarmort',
		Armor_mod_leather:  't',
		Armor_mod_studded:  'armort',
		Equip_handedness:   ['handedness','current'],
		Equip_dancing:		['dancing-count','current'],
		Pick_Pockets:       ['pp','current'],
		Open_Locks:         ['ol','current'],
		Find_Traps:         ['rt','current'],
		Move_Silently:      ['ms','current'],
		Hide_in_Shadows:    ['hs','current'],
		Detect_Noise:       ['dn','current'],
		Climb_Walls:        ['cw','current'],
		Read_Languages:     ['rl','current'],
		Legend_Lore:        ['ib','current'],
		Timespent:			['timespent','current'],
		CharDay:			['in-game-day','current'],
		Today:				['today','current'],
		Today_weekday:		['today-weekday','current'],
		Today_day:			['today-day','current'],
		Today_dayth:		['today-dayth','current'],
		Today_month:		['today-month','current'],
		Today_year:			['today-year','current'],
	}); 
	
	var Init_StateEnum = Object.freeze({
		ACTIVE: 0,
		PAUSED: 1,
		STOPPED: 2,
		FROZEN: 3
	});

	var YN_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	var MenuType = Object.freeze({
		SIMPLE:			'SIMPLE',
		COMPLEX:		'COMPLEX',
		WEAPON:			'WEAPON',
		TWOWEAPONS:		'TWOWEAPONS',
		MW_MELEE:       'MW_MELEE',
		MW_PRIME:		'MW_PRIME',
		MW_SECOND:		'MW_SECOND',
		MUSPELL:		'MUSPELL',
		PRSPELL:		'PRSPELL',
		POWER:			'POWER',
		MIBAG:			'MIBAG',
		THIEF:			'THIEF',
		OTHER:			'OTHER',
		CARRY:			'CARRY',
		MENU:			'MENU',
		MONSTER_MENU:	'MONSTER',
	});
	
	var BT = Object.freeze({
		MON_ATTACK:	'MON_ATTACK',
		MON_INNATE:	'MON_INNATE',
		MON_MELEE:	'MON_MELEE',
		MELEE:		'MELEE',
		ONEWEAPON:	'ONEWEAPON',
		TWOWEAPONS:	'TWOWEAPONS',
		ALLWEAPONS: 'ALLWEAPONS',
		MW_PRIME:	'MW_PRIME',
		RW_PRIME:	'RW_PRIME',
		MW_SECOND:	'MW_SECOND',
		RW_SECOND:	'RW_SECOND',
		MON_RANGED:	'MON_RANGED',
		RANGED:		'RANGED',
		MU_SPELL:	'MU_SPELL',
		PR_SPELL:	'PR_SPELL',
		POWER:		'POWER',
		MI_BAG:		'MI_BAG',
		THIEF:		'THIEF',
		OTHER:		'OTHER',
		MOVE:		'MOVE',
		CHG_WEAP:	'CHG_WEAP',
		STAND:		'STAND',
		SPECIFY:	'SPECIFY',
		CARRY:		'CARRY',
		SUBMIT:		'SUBMIT',
	});
	
	var Caster = Object.freeze({
		WIZARD: 'WIZARD',
		PRIEST: 'PRIEST',
	});
	
	var Monster = Object.freeze({
		COMPLEX: true,
		SIMPLE: false,
	});
	
	var CharSheet = Object.freeze({
		MONSTER: true,
		CHARACTER: false,
	});
	
	var MenuState = Object.freeze({
		ENABLED: false,
		DISABLED: true,
	});
	
	var Init_Messages = Object.freeze({
		noChar: '/w gm &{template:2Edefault} {{name=^^tname^^\'s\nInit Master}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot participate in Initiative.}}',
		doneInit: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ has already completed initiative for this round}}{{desc1=If you want to change ^^tname^^\'s initiative, press [Redo Initiative](!init --redo ^^tid^^)}}',
        redoMsg: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=Initiative has been re-enabled for ^^tname^^.  You can now select something else for them to do.}}',
		noMUspellbook: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have a Wizard\'s Spellbook, and so cannot plan to cast Magic User spells.  If you need one, talk to the High Wizard (or perhaps the DM)}}',
		noPRspellbook: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have a Priest\'s Spellbook, and so cannot plan to cast Clerical spells.  If you need one, talk to the Arch-Cleric (or perhaps the DM)}}',
		noPowers: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have any Powers, and so cannot start powering up.  If you want some, you better get on the good side of your god (or perhaps the DM)}}',
		noMIBag: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have Magic Item Bag, and thus no magic items.  You can go and buy one, and fill it on your next campaign.}}',
		notThief: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ is not a thief.  You can try these skills if you want - everyone has at least a small chance of success...  but perhaps prepare for a long stint staying at the local lord\'s pleasure!}}',
		heavyArmour: '&{template:2Edefault} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ realises that the armour they are wearing prevents them from using any thievish skills.  You will have to remove it, and then perhaps you might have a chance.  Change the armour type on the Rogue tab of your Character Sheet.}}',
	});

	var flags = {
		init_state: Init_StateEnum.STOPPED,
		image: false,
		archive: false,
		// RED: determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v1.013 turn on or off attackMaster integration
		canChangeAC: true,
		canChange2Weaps: true,
		// RED: indicate if 2nd weapon of 2-weapon attacks can have more than 1 attack
		twoWeapSingleAttk: true,
		// RED: characters that can use 2-weapon attacks
		twoWeapFighter: true,
		twoWeapMage: false,
		twoWeapPriest: false,
		twoWeapRogue: true,
		twoWeapPsion: false,
	};
	
	var spellLevels = Object.freeze({ 
		mu: [{ spells: 0, base: 0,  book: 0 },
		     { spells: 0, base: 1,  book: 1 },
             { spells: 0, base: 4,  book: 2 },
		     { spells: 0, base: 7,  book: 3 },
		     { spells: 0, base: 10, book: 4 },
		     { spells: 0, base: 70, book: 30},
		     { spells: 0, base: 13, book: 5 },
		     { spells: 0, base: 16, book: 6 },
		     { spells: 0, base: 19, book: 7 },
		     { spells: 0, base: 22, book: 8 }],
		pr: [{ spells: 0, base: 0,  book: 0 },
		     { spells: 0, base: 28, book: 10},
		     { spells: 0, base: 31, book: 11},
		     { spells: 0, base: 34, book: 12},
		     { spells: 0, base: 37, book: 13},
		     { spells: 0, base: 40, book: 14},
    		 { spells: 0, base: 43, book: 15},
    		 { spells: 0, base: 46, book: 16}],
	});
	
	var design = {
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
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		green_button: '"display: inline-block; background-color: white; border: 1px solid lime; padding: 4px; color: darkgreen; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"'
	};
	
	var initMaster_tmp = (function() {
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

    /*
     * Asynchronous Semaphore copied from the API cookbook
     * to allow us to wait until all sendChat and other async calls
     * have completed.
     */
    

    function Semaphore(callback, initial, context) {
        var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
    
        this.lock = parseInt(initial, 10) || 0;
        this.callback = callback;
        this.context = context || callback;
        this.args = args.slice(3);
    }
    Semaphore.prototype = {
        v: function() { this.lock++; },
        p: function() {
            var parameters;
    
            this.lock--;
    
            if (this.lock === 0 && this.callback) {
                // allow sem.p(arg1, arg2, ...) to override args passed to Semaphore constructor
                if (arguments.length > 0) { parameters = arguments; }
                else { parameters = this.args; }
    
                this.callback.apply(this.context, parameters);
            }
        }
    };


	/**
	 * Init
	 */
	var init = function() {
		if (!state.initMaster)
			{state.initMaster = {};}
		if (!state.initMaster.debug)
		    {state.initMaster.debug = false;}
		if (!state.initMaster.round)
			{state.initMaster.round = 1;}
		if (!state.initMaster.changedRound)
			{state.initMaster.changedRound = false;}
		if (!state.initMaster.attrsToCreate)
		    {state.initMaster.attrsToCreate = {};}

	        // RED: log the version of the API Script

		log(`-=> initMaster v${version} <=-`);
		

	}; 
	
    /**
     * RED: Find the GM, generally when a player can't be found
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

	/**
	 * Return the string with the roll formatted, this is accomplished by simply
	 * surrounding roll equations with [[ ]] TODO, should be replaced with a
	 * single regex
	 * 
	 */
	var getFormattedRoll = function(str) {
		if (!str) {return "";}
		var retval = str,
			re = /\d+d\d+/,
			idx, 
			expr, 
			roll, 
			pre, 
			post;

		if ((roll=re.exec(str))) {
			expr = getExpandedExpr(roll[0],str,roll.index);
			idx = str.indexOf(expr);
			pre = str.substring(0,idx);
			post = str.substring(idx+expr.length);
		} else { return retval;}
		
		return pre+"[["+expr+"]]"+getFormattedRoll(post);
	};
	
	/**
	 * Return the target expression expanded as far as it logically can span
	 * within the provided line.
	 * 
	 * ie: target = 1d20
	 *	   locHint = 4
	 *	   line = "2+1d20+5+2d4 bla (bla 1d20+8 bla) bla (4d8...) bla bla"
	 * 
	 * result = 2+1d20+5+2d4
	 */
	var getExpandedExpr = function(target, line, locHint) {
		if (!target || !line) 
			{return;}
		if (!locHint) 
			{locHint = 0;}
		var retval = target,
			re = /\d|[\+\-]|d/,
			loc = -1, 
			start = 0, 
			end = 0;
		
		if((loc=line.indexOf(target,locHint)) !== -1) {
			start = loc;
			while (start > 0) {
				if (line[start].match(re))
					{start--;}
				else
					{start++;break;}
			}
			end = loc;
			while (end < line.length) {
				if (line[end].match(re))
					{end++;}
				else
					{break;}
			}
			retval = line.substring(start,end);
			retval = getLegalRollExpr(retval);
		}
		
		return retval;
	};
	
	/**
	 * Gets a legal roll expression.
	 */
	var getLegalRollExpr = function(expr) {
		if (!expr) {return;}
		var retval = expr,
			stray = expr.match(/d/g),
			valid = expr.match(/\d+d\d+/g),
			errMsg = "Illegal expression " + expr; 
		
		try {
			if (expr.match(/[^\s\d\+-d]/g) || 
			!stray || 
			!valid || 
			(stray.length =! valid.length))
				{throw errMsg;}

			stray = expr.match(/\+/g);
			valid = expr.match(/\d+\+\d+/g);
			if ((stray !== null) && (valid !== null) && 
			(stray.length !== valid.length))
				{throw errMsg;}
			stray = expr.match(/-/g);
			valid = expr.match(/\d+-\d+/g);
			if ((stray !== null) && (valid !== null) && 
			(stray.length !== valid.length))
				{throw errMsg;}
		} catch (e) {
			throw e;
		}
		
		//check for leading, trailing, operands
		if (retval[0].match(/\+|-/))
			{retval = retval.substring(1);}
		if (retval[retval.length-1].match(/\+|-/))
				{retval = retval.substring(0,retval.length-1);}
		
		return retval;
	};
	
    /**
     * RED: v1.190 Added in the inline roll evaluator from ChatSetAttr script v1.9
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

// -------------------------------------------- send messages to chat -----------------------------------------
	
	/**
	 * Send public message
	 */
	 
	var sendPublic = function(msg) {
		if (!msg) 
			{return undefined;}
		var content = '/desc ' + msg;
		sendChat('',content,null,{noarchive:!flags.archive, use3d:false});
	};
	
    /**
     * Send API command to chat
     */
    var sendInitAPI = function(msg, senderId) {
        var as;
		if (!msg) {
		    sendDebug('sendInitAPI: no msg');
		    return undefined;
		}
		if (!senderId || senderId.length == 0) {
			as = '';
		} else {
			as = 'player|' + senderId;
		}
		sendDebug('sendInitAPI: sending as ' + as + ', msg is ' + msg );
		sendChat(as,msg, null,{noarchive:!flags.archive, use3d:false});
    };

	/**
	* Send feedback to the GM only!
	*/
	var sendFeedback = function(msg) {

 		var content = '/w GM '
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + fields.feedbackImg + '">' 
				+ '</div>'
				+ msg;
			
		sendChat(fields.feedbackName,content,null,{noarchive:!flags.archive, use3d:false});
		sendDebug(msg);
	};

	/**
	 * Sends a response to everyone who controls the character
	 * RED: v0.012 check the player(s) controlling the character are valid for this campaign
	 * if they are not, send to the GM instead - Transmogrifier can introduce invalid IDs
	 * RED: v1.014 check if the controlling player(s) are online.  If they are not
	 * assume the GM is doing some testing and send the message to them.
	 */
	
	var sendResponse = function(charCS,msg,as,img) {
		if (!msg) 
			{return null;}
		var to, content, controlledBy, players, viewerID, isPlayer=false; 
		controlledBy = charCS.get('controlledby');
		if (controlledBy.length > 0) {
		    controlledBy = controlledBy.split(',');
			viewerID = state.roundMaster.viewer.is_set ? (state.roundMaster.viewer.pid || null) : null;
            players = controlledBy.filter(id => id != viewerID);
            log('Init sendResponse: character is '+charCS.get('name')+', viewerID='+viewerID+', controlledBy='+controlledBy+', players.length='+players.length);
			if (players.length) {
    		    isPlayer = _.some( controlledBy, function(playerID) {
        		    players = findObjs({_type: 'player', _id: playerID, _online: true});
        		    return (players || players.length > 0);
        		});
			    log('Init sendResponse: has players other than viewer, online='+isPlayer);
			};
		};
		log('Init sendResponse: !charCS='+!charCS+', controlledBy.length='+controlledBy.length+', !isPlayer='+!isPlayer);
		if (!charCS || controlledBy.length == 0 || !isPlayer) {
			to = '/w gm ';
		} else {
			to = '/w "' + charCS.get('name') + '" ';
		}
		content = to
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + (img ? img:fields.feedbackImg) + '">' 
				+ '</div>'
				+ msg;
		sendChat((as ? as:fields.feedbackName),content,null,{noarchive:!flags.archive, use3d:false});
	}; 

	/*
	 * Send an error message to the identified player.  If that player
	 * is not online, send to the GM
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
	    if (!!state.initMaster.debug) {
	        var player = getObj('player',state.initMaster.debug),
	            to;
    		if (player) {
	    		to = '/w "' + player.get('_displayname') + '" ';
		    } else 
		    	{throw ('sendDebug could not find player');}
		    if (!msg)
		        {msg = 'No debug msg';}
    		sendChat('Init Debug',to + '<span style="color: red; font-weight: bold;">'+msg+'</span>',null,{noarchive:!flags.archive, use3d:false}); 
	    };
	}; 
	
	var doSetDebug = function(args,senderId) {
		var player = getObj('player',senderId),
		    playerName;
		if (player) {
		    playerName = player.get('_displayname');
		}
		else 
			{throw ('doSetDebug could not find player: ' + args);}
	    if (!!args && args.indexOf('off') != 0) {
    	    state.initMaster.debug = senderId;
            sendResponseError(senderId,'Debug set on for ' + playerName,'iM Debug');
	        sendDebug('Debugging turned on');
	    } else {
    	    sendResponseError(senderId,'Debugging turned off','iM Debug');
	        state.initMaster.debug = false;
	    }
	};

    /**
     * Pare a message with ^^...^^ parameters in it and send to chat
     * This allows character and token names for selected characters to be sent
     * Must be called with a validated tokenID
    */
    
    var sendParsedMsg = function( msgFrom, msg, tid ) {
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
		
		sendResponse( charCS, parsedMsg, msgFrom, null );

    };
	
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
//        log('getTable table is '+rowName);
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

			if (_.isUndefined(tableObj.sortKeys) || tableObj.sortKeys.length <= sortOrderKeys.length) {
//			    log('getTable setting sortKeys');
				tableObj.sortKeys = sortOrderKeys;
			};
//            log('getTable updating attrs length '+_.size(attrs));
			tableObj[name].attrs=attrs;
        } else {
//            log('getTable initialising attrs '+(_.isUndefined(tableObj.sortKeys)?'and sortKeys':''));
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
//                    log('getAllTables saving rows['+key+']');
					rows[key]=elem;
					if (_.isUndefined(tableInfo[setupType].values[elem[0]])) {
//					    log('getAllTables initialising values['+elem[0]+']');
						tableInfo[setupType].values[elem[0]] = {current:'',max:''};
					}
//				    log('getAllTables setting values['+elem[0]+'].'+elem[1]+' to '+(elem[2] || ''));
					tableInfo[setupType].values[elem[0]][elem[1]] = elem[2] || '';
				};
				return;
        	});
			_.each(rows, (elem,key) => {
				tableInfo[setupType] = getTable( charCS, tableInfo[setupType], tableInfo[setupType].table, elem, c, elem[2] );
//			    log('getAllTables got table '+setupType+'.'+elem[0]+', property='+elem+', defaultVal='+tableInfo[setupType][elem[0]].defaultVal);
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
        log('tableLookup tableObj:'+!!tableObj+', attrDef:'+attrDef[0]+','+attrDef[1]+', index:'+index+', retObj:'+retObj);
        var val, name = attrDef[0];
        if (_.isUndefined(retObj)) {
			retObj=false;
		} else if (retObj === true) {
			defVal=false;
		}
		if (_.isUndefined(defVal)) {
			defVal=true;
		}
//        log('tableLookup table '+name+' row '+index+' on entry defVal='+defVal+', retObj='+retObj);
		if (tableObj[name]) {
//		    log('tableLookup found tableObj '+tableObj.table[0]+' name '+name+' with a standard default value of '+tableObj[name].defaultVal);
			let property = (retObj === true) ? null : ((retObj === false) ? attrDef :  retObj);
			defVal = (defVal===false) ? (undefined) : ((defVal===true) ? tableObj[name].defaultVal[attrDef[1]] : defVal);
//			log('tableLookup table['+name+'] row '+index+' calculated defVal is '+defVal);
			if (index>=0) {
				let attrs = tableObj[name].attrs,
					sortOrderKeys = tableObj.sortKeys;
				if (index<sortOrderKeys.length && _.has(attrs,sortOrderKeys[index])) {
					if (_.isUndefined(property) || _.isNull(property) || !property || !property[1] || _.isUndefined(attrs[sortOrderKeys[index]])) {
//					    log('tableLookup table '+name+' property='+property+', object isUndefined='+_.isUndefined(attrs[sortOrderKeys[index]]));
						return attrs[sortOrderKeys[index]];
					} else {
						val = attrs[sortOrderKeys[index]].get(property[1]);
						if (_.isUndefined(val)) {
//						    log('tableLookup table '+name+' property '+property[0]+' undefined, setting to '+defVal+', table default is '+tableObj[name].defaultVal);
						    val = defVal;
						};
//						log('tableLookup table '+name+' row '+index+' returning '+val);
						return val;
					}
				}
//				log('tableLookup '+name+' index '+index+' beyond length '+sortOrderKeys.length+' or not in attrs');
				return defVal;
			} else if (!_.isUndefined(property) && !_.isNull(property)) {
//			    log('tableLookup '+name+' first row static, index:'+index+', property.length:'+property.length+', property:'+property);
				val = attrLookup( tableObj.character, property );
				if ( _.isUndefined(val)) {
//				    log('tableLookup table '+name+' property '+property[0]+' undefined, setting to '+defVal+', table default is '+tableObj[name].defaultVal);
				    val = defVal;
				}
				return val;
			}
		}
		
//		log('tableLookup table '+name+' row '+index+' drop through returning undefined');
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
    		    log('tableSet r<0 setting '+attrDef[0]+' to '+attrValue);
				let attrObj = attrLookup( tableObj.character, [attrDef[0], null], null, null, null, caseSensitive );
				if (!attrObj) attrObj = createObj( 'attribute', {characterid:tableObj.character.id, name:attrDef[0] });
				attrObj.set(attrDef[1],attrValue);
    		    return tableObj;
    		}
			let attrs = tableObj[name].attrs,
				sortOrderKeys = tableObj.sortKeys,
				value = {},
				rowObj;
			    
			log('attrDef = '+attrDef);
			log('tableSet r='+r+', sok.length='+sortOrderKeys.length);
			if (r<sortOrderKeys.length && !_.has(attrs,sortOrderKeys[r])) {
				let finalName = tableObj.table[0]+tableObj.column+'_'+sortOrderKeys[r]+'_'+attrDef[0]+tableObj.column;
    	        value = {current:'', max:''};
    			value[attrDef[1]]=String(attrValue);
				log('tableSet create obj r='+r+', length='+sortOrderKeys.length+', _.has(attrs[sok[r]])='+_.has(attrs,sortOrderKeys[r])+', trying to set '+finalName+','+attrDef[1]+' to '+attrValue);
				rowObj = createObj( "attribute", {characterid: tableObj.character.id, name: finalName});
				rowObj.set(value);
				tableObj[name].attrs[sortOrderKeys[r]] = rowObj;
			} else if (r<sortOrderKeys.length && _.has(attrs,sortOrderKeys[r])
										&& !_.isUndefined(attrDef)
										&& !_.isNull(attrDef)
										&& attrDef[1]
										&& !_.isUndefined(attrs[sortOrderKeys[r]])) {
				attrs[sortOrderKeys[r]].set(attrDef[1],String(attrValue));
	            log('tableSet able to set '+tableObj.table[0]+' row '+r+' '+attrDef+' to '+attrs[sortOrderKeys[r]].get(attrDef[1])+', should be'+attrValue);
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
		    log('addTableRow no fieldGroup in '+tableObj.table[0]);
			sendDebug('addTableRow: no fieldGroup defined');
			throw 'Internal magicMaster Error';
		}
		    
	    log('addTableRow called, tableObj.table='+tableObj.table[0]+', index='+index+', fieldGroup='+fieldGroup+', table '+(fieldGroup+'name')
	                    +', value='+tableLookup( tableObj, fields[fieldGroup+'name'], index, false ));
		if ((index < 0) || !_.isUndefined(tableLookup( tableObj, fields[fieldGroup+'name'], index, false ))) {
			_.each( list, (elem,key) => {
			    if (_.isUndefined(elem.attrs)) return;
				currentVal = (!values || _.isUndefined(values[key])) ? elem.defaultVal['current'] : values[key]['current'];
				maxVal = (!values || _.isUndefined(values[key])) ? elem.defaultVal['max'] : values[key]['max'];
				log('addTableRow index='+index+' static or exists, setting '+key+' to be '+newVal);
				tableObj = tableSet( tableObj, [key,'current'], index, currentVal );
				tableObj = tableSet( tableObj, [key,'max'], index, maxVal );
			});
		} else {
			let rowObjID = generateRowID(),
			    namePt1 = tableObj.table[0]+tableObj.column+'_'+rowObjID+'_';
			_.each( list, (elem,key) => {
			    if (_.isUndefined(elem.attrs)) return;
				log('addTableRow found elem '+key);
				rowObj = createObj( "attribute", {characterid: tableObj.character.id, name: (namePt1+key+tableObj.column)} );
				if (!values || _.isUndefined(values[key])) {
					newVal = elem.defaultVal;
				} else {
					newVal = values[key];
				}
				log('addTableRow creating elem[0] '+key+', newVal.current '+newVal.current+' max '+newVal.max+'');
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
//							log('initValues values['+elem[0]+'] initialised to '+values[elem[0]][elem[1]]);
						});
        return values;
	};
	
	/*
	 * A function to find the index of a matching entry in a table
	 */
	 
	var tableFind = function( tableObj, attrDef, val ) {
		
        val = val.toLowerCase().replace(reIgnore,'');
		let property = attrDef[1];
		if ((tableObj.table[1] < 0) && val == attrLookup( tableObj.character, attrDef ).toLowerCase().replace(reIgnore,'')) {
			return -1;
		}
		let tableIndex = tableObj.sortKeys.indexOf(
								_.findKey(tableObj[attrDef[0]].attrs, function( elem, objID ) {return val == elem.get(property).toLowerCase().replace(reIgnore,'');})
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
//			if (_.isNull(tableDef)) {log('attrLookup tableLookup for '+attrDef;}
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
	    
//	    if(_.isUndefined(attrDef)) {log('setAttr attrDef:'+attrDef+', attrValue:'+attrValue+', tableDef:'+tableDef+', r:'+r+', c:'+c);}
	    
		var name, attrObj, match, worker;

	    try {
	        name = attrDef[0];
	    } catch {
	        // log('setAttr attrDef is '+attrDef+', attrValue is '+attrValue);
	        return undefined;
	    }
		
		if (tableDef && (tableDef[1] || r >= 0)) {
			c = (c && (tableDef[1] || c != 1)) ? c : '';
			name = tableDef[0] + c + '_$' + r + '_' + attrDef[0] + c;
//            log('setAttr: table:'+tableDef[0]+', r:'+r+', c:'+c+', name:'+name);
		} else {
//            log('setAttr: name:'+attrDef);
			name = attrDef[0];
		}
		worker = attrDef[3];
		match=name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let index=match[2],
				tableObj = getTable(character,{},tableDef,attrDef,c,caseSensitive);
//			if (_.isNull(tableDef)) {log('attrLookup tableLookup for '+tableObj.property);}
			if (tableObj)
				tableObj = tableSet(tableObj,attrDef,r,attrValue);
			attrObj = tableLookup(tableObj,attrDef,r,false,true);
		
		} else {
			attrObj = attrLookup( character, [name, null], null, null, null, caseSensitive );
			if (!attrObj) {
				log( 'setAttr: ' + name + ' not found so creating');
				attrObj = createObj( 'attribute', {characterid:character.id, name:attrDef[0]} );
			}
//    		log('setAttr: attrObj.get(name) = '+attrObj.get('name'));
			if (_.isUndefined(attrDef)) {log('setAttr attrDef corrupted:'+attrDef);return undefined;}
			sendDebug( 'setAttr: character ' + character.get('name') + ' attribute ' + attrDef[0] + ' ' + attrDef[1] + ' set to ' + attrValue );
            if (!worker)
    			attrObj.set( attrDef[1], String(attrValue) );
    		else
    		    attrObj.setWithWorker( attrDef[1], String(attrValue) );

		}
		return attrObj;
	}
	
	/**
	* Create any pending attributes in attrsToCreate using ChatSetAttr
	* rather than build a function myself - though this will only
	* handle simple attributes, not repeating tables
	**/
/*	
	var createAttrs = function( silent, replace ) {
		
		if (state.magicMaster.attrsToCreate) {
			_.each( state.magicMaster.attrsToCreate, function( attrs, charID ) {
				let setVars = '!setattr ' + ( silent ? '--silent ' : '' ) + ( replace ? '--replace ' : '' ) + '--charid ' + charID;
					setVars += attrs;
				sendDebug( 'createAttrs: creating attributes for ' + getAttrByName( charID, 'character_name' ));
				sendMagicAPI( setVars );
			});
			state.magicMaster.attrsToCreate = {};
		};
	};
	
// -------------------------------------------- utility functions ----------------------------------------------

	/**
	 * check if the character object exists, return first match
	 */
	var characterObjExists = function(name, type, charId) {
		var retval = null;

		var obj = findObjs({
			_type: type,
			name: name,
			_characterid: charId
		});
 		if (obj.length > 0) {
			retval = obj[0];
		}

		return retval;
	}; 
	
	/**
	 * Get valid character from a tokenID
	 */
	 
	var getCharacter = function( tokenID ) {
	
		var curToken,
		    charID,
		    charCS;
		
		if (!tokenID) {
			sendDebug('getCharacter: tokenID is invalid');
			sendError('Invalid initMaster arguments');
			return undefined;
		};

		curToken = getObj( 'graphic', tokenID );

		if (!curToken) {
			sendDebug('getCharacter: tokenID is not a token');
			sendError('Invalid initMaster arguments');
			return undefined;
		};
			
		charID = curToken.get('represents');
			
		if (!charID) {
			sendDebug('getCharacter: charID is invalid');
			sendError('Invalid initMaster arguments');
			return undefined;
		};

		charCS = getObj('character',charID);

		if (!charCS) {
			sendDebug('getCharacter: charID is not for a character sheet');
			sendError('Invalid initMaster arguments');
			return undefined;
		};
		return charCS;

	};
	
    /**
     * Get the sheet table types for a specific character sheet
     */
/*
    var getSheetTypes = function( charCS ) {

		var sheetTypes = {
				sheetFlags: 0,
				sheetType: 3,
				sheetMUType: 6,
				sheetPRType: 6,
				sheetPowersType: 3,
				sheetMIBagType: 6,
				sheetLangsType: 0,
				sheetNWPType: 0,
				sheetGemsType: 12,
				sheetThiefType: 1
			};
		
		if (!charCS) {
			sendDebug( 'getSheetTypes: invalid charID passed' );
			sendError( 'Invalid character selected');
			return sheetTypes;
        };
		sheetTypes.sheetFlags = attrLookup( charCS, 'sheet-flags', 'current' );
		
		if (sheetTypes.sheetFlags != 0) {
			sheetTypes.sheetType = attrLookup( charCS, ['sheet-type', 'current'] );
			sheetTypes.sheetMUType = attrLookup( charCS, ['sheet-mu-spells-type', 'current'] );
			sheetTypes.sheetPRType = attrLookup( charCS, ['sheet-pr-spells-type', 'current'] );
			sheetTypes.sheetPowersType = attrLookup( charCS, ['sheet-powers-type', 'current'] );
			sheetTypes.sheetMIBagType = attrLookup( charCS, ['sheet-mibag-type', 'current'] );
			sheetTypes.sheetLangsType = attrLookup( charCS, ['sheet-langs-type', 'current'] );
			sheetTypes.sheetNWPType = attrLookup( charCS, ['sheet-nwp-type', 'current'] );
			sheetTypes.sheetGemsType = attrLookup( charCS, ['sheet-gems-type', 'current'] );
			sheetTypes.sheetThiefType = 1;
		}
		
        return sheetTypes;
    };
	
	/**
	 * Set the ammo flags, no ammo = false else true
	 **/
 
	var setAmmoFlags = function( charCS ) {
	
		var content = '',
		    i,
		    ammoQty,
			ammoRedirect,
			ammoRedirectPointer;
			
		for ( i=1; i<=fields.AmmoRows; i++) {
		
			ammoRedirectPointer = fields.Ammo_indirect[0] + i + '-';
			if (_.isUndefined(ammoRedirect = attrLookup( charCS, [ammoRedirectPointer, fields.Ammo_indirect[1]] ))) {
				sendDebug( 'setAmmoFlags: no ' + ammoRedirectPointer + ' set for ' + charCS.get('name') );
			} else if (_.isUndefined(ammoQty = attrLookup( charCS, [ammoRedirect + fields.Ammo_qty[0], fields.Ammo_qty[1]] ))) {
				sendDebug( 'setAmmoFlags: ' + ammoRedirect + fields.Ammo_qty[0] + ' does not exist for ' + charCS.get('name'));
			} else {
				setAttr( charCS, [fields.Ammo_flag[0] + i, fields.Ammo_flag[1]], (ammoQty ? 1 : 0) );
			};
		};
		return;
	};
	
	/**
	* Set the initiative variables when a button has been selected
	* Push the previous selection into the max of each representing a second weapon
	**/

	var setInitVars = function( charCS, args, property ) {
	
		if (_.isUndefined(property)) {
			property = 'current';
		}
		
		if (property == 'current') {
//		    log('setInitVars setting 2nd weap_num:'+attrLookup( charCS, fields.Weapon_num )+', action:'+attrLookup( charCS, fields.Init_action ));
			setAttr( charCS, fields.Weapon_2ndNum, attrLookup( charCS, fields.Weapon_num ) );
			setAttr( charCS, fields.Init_2ndAction, attrLookup( charCS, fields.Init_action ) );
			setAttr( charCS, fields.Init_2ndSpeed, attrLookup( charCS, fields.Init_speed ) );
			setAttr( charCS, fields.Init_2ndActNum, attrLookup( charCS, fields.Init_actNum ) );
			setAttr( charCS, fields.Init_2ndPreInit, 0 );
			// RED: v1.013 added init_2H to hold a flag = 1 for 2-handed weapon initiative, 
			// 0 for 1-handed weapon initiative, and -1 for any other initiative
			setAttr( charCS, fields.Init_2nd2Hweapon, attrLookup( charCS, fields.Init_2Hweapon ) );
		}
		
//	    log('setInitVars setting 1st weap_num:'+args[2]+', action:'+args[3]);
		setAttr( charCS, [fields.Weapon_num[0], property], args[2]);
		setAttr( charCS, [fields.Init_action[0], property], args[3]);
		setAttr( charCS, [fields.Init_speed[0], property], args[4]);
		setAttr( charCS, [fields.Init_actNum[0], property], args[5]);
		setAttr( charCS, [fields.Init_preInit[0], property], args[6]);
		setAttr( charCS, [fields.Init_2Hweapon[0], property], args[7]);
		setAttr( charCS, [fields.Init_chosen[0], property], 1);
	};

	
//----------------------------------- button press handlers ------------------------------------------	
	/**
	* Handle the results of pressing a monster attack initiative button
	* Use the simple monster initiative menu if 'monster' flag is true
	**/
	
	var handleInitMonster = function( monster, charCS, args ) {

		var weapSpeed,
			speedMult,
			tokenID = args[1],
			rowIndex = args[2],
			buildCall = '';

		if (_.isUndefined(rowIndex)) {
			sendDebug( 'handleInitMonster: index undefined' );
			sendError( 'Invalid button' );
			return;
		}

		weapSpeed = (attrLookup( charCS, fields.Monster_speed ) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		
		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + (monster == Monster.SIMPLE ? MenuType.SIMPLE : MenuType.COMPLEX)
				+ '|' + tokenID
				+ '|' + rowIndex
				+ '|with their innate abilities'
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*1'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
	}
	
	/**
	* Handle the results of pressing a melee weapon initiative button
	**/
	
	var handleInitMW = function( charType, charCS, args ) {

		var weaponName,
			weapSpeed,
			speedMult,
			attackNum,
			twoHanded,
			tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3],
			buildCall = '';

		if (rowIndex == undefined || refIndex == undefined) {
			sendDebug( 'handleInitMW: indexes undefined' );
			sendError( 'Invalid button' );
			return;
		}

		weaponName = (attrLookup( charCS, fields.MW_name, fields.MW_table, refIndex ) || '');
		weapSpeed = (attrLookup( charCS, fields.MW_speed, fields.MW_table, refIndex) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		attackNum = (attrLookup( charCS, fields.MW_noAttks, fields.MW_table, refIndex ) || 1);
		twoHanded = (attrLookup( charCS, fields.MW_twoHanded, fields.MW_table, refIndex ) || 0);

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + (charType == CharSheet.MONSTER ? MenuType.COMPLEX : MenuType.WEAPON)
				+ '|' + tokenID
				+ '|' + rowIndex
				+ '|with their ' + weaponName
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*' + attackNum
				+ '|0'
				+ '|' + twoHanded;

		sendInitAPI( buildCall );
		return;
	}
	
	/**
	* Handle the selection of the Two Weapons button on the Weapon menu
	**/
	
	var handlePrimeWeapon = function( charCS, args ) {
		
		var command = args[0],
			tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3],
			weaponName, weapSpeed,
			speedMult, attackNum,
			buildCall;
			
//		log('handlePrimeWeapon called, args='+args);

		if (rowIndex > 0) {
			speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		    if (command != BT.RW_PRIME) {
    			weaponName = (attrLookup( charCS, fields.MW_name, fields.MW_table, refIndex ) || '');
    			weapSpeed = (attrLookup( charCS, fields.MW_speed, fields.MW_table, refIndex ) || 0);
    			attackNum = (attrLookup( charCS, fields.MW_noAttks, fields.MW_table, refIndex ) || 1);
            } else {
    			weaponName = (attrLookup( charCS, fields.RW_name, fields.RW_table, refIndex ) || '');
    			weapSpeed = (attrLookup( charCS, fields.RW_speed, fields.RW_table, refIndex ) || 0);
    			attackNum = (attrLookup( charCS, fields.RW_noAttks, fields.RW_table, refIndex ) || 1);
            }
			// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

			buildCall = '!init --buildMenu ' + MenuType.MW_PRIME
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '|with their ' + weaponName
					+ '|[[' + weapSpeed + ']]'
					+ '|' + speedMult + '*' + attackNum
					+ '|0'
					+ '|1'
					+ '|0';
					
		} else {
			buildCall = '!init --buildMenu ' + MenuType.MW_MELEE
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '| '
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|0';
		}
		
//		log('handlePrimeWeapon buildCall='+buildCall);

		sendInitAPI( buildCall );
		return;
		
	}
	
	/**
	* Handle selection of a weapon button on the Second Melee Weapon menu
	**/
	
	var handleSecondWeapon = function( charCS, args ) {
		
		var command = args[0],
			tokenID = args[1],
			rowIndex = args[2],
			rowIndex2 = args[3],
			refIndex = args[4],
			refIndex2 = args[5],
			weapon, weaponRef,
			weaponName, weapSpeed,
			speedMult, attackNum,
			buildCall;
			
//		log('handleSecondWeapon args:'+args+', command='+command);
			
		if (rowIndex == rowIndex2)
			{return;}

		if (parseInt(rowIndex2,10) > 0) {
//		    log('handleSecondWeapon getting info from rowIndex2='+rowIndex2+' and refIndex2='+refIndex2);
		    weapon = rowIndex2;
		    weaponRef = refIndex2;
		} else {
//		    log('handleSecondWeapon getting info from rowIndex='+rowIndex+' and refIndex='+refIndex);
		    weapon = rowIndex;
		    weaponRef = refIndex;
		}
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		if (command != BT.RW_SECOND) {
			weaponName = (attrLookup( charCS, fields.MW_name, fields.MW_table, weaponRef ) || '');
			weapSpeed = (attrLookup( charCS, fields.MW_speed, fields.MW_table, weaponRef ) || 0);
			attackNum = (attrLookup( charCS, fields.MW_noAttks, fields.MW_table, weaponRef ) || 1);
		} else {
			weaponName = (attrLookup( charCS, fields.RW_name, fields.RW_table, weaponRef ) || '');
			weapSpeed = (attrLookup( charCS, fields.RW_speed, fields.RW_table, weaponRef ) || 0);
			attackNum = (attrLookup( charCS, fields.RW_noAttks, fields.RW_table, weaponRef ) || 1);
		}
			
		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + MenuType.MW_SECOND
				+ '|' + tokenID
				+ '|' + weapon
				+ '|with their ' + weaponName
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*' + attackNum
				+ '|0'
				+ '|1'
				+ '|' + (rowIndex2 > 0 ? rowIndex : rowIndex2);
				
//		log('handleSecondWeapon buildCall:'+buildCall);
				
		sendInitAPI( buildCall );
		
		return;
	}
		
	
	/**
	* Handle the results of pressing a ranged weapon initiative button
	* if 'monster' is true, use a complex monster menu
	**/
	
	var handleInitRW = function( charType, charCS, args ) {

		var weaponName,
			weapSpeed,
			weapSpecial,
			speedMult,
			attackNum,
			twoHanded,
			tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3],
			buildCall = '';

		if (rowIndex == undefined || refIndex == undefined) {
			sendDebug( 'handleInitRW: indexes undefined' );
			sendError( 'Invalid button' );
			return;
		}
		
		weaponName = (attrLookup( charCS, fields.RW_name, fields.RW_table, refIndex ) || '');
		weapSpeed = (attrLookup( charCS, fields.RW_speed, fields.RW_table, refIndex ) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		attackNum = (attrLookup( charCS, fields.RW_noAttks, fields.RW_table, refIndex ) || 1);
		weapSpecial = (attrLookup( charCS, fields.WP_specialist, fields.WP_table, (rowIndex-2)) || 0);
		twoHanded = (attrLookup( charCS, fields.MW_twoHanded, fields.RW_table, refIndex ) || 0);

/*        // RED: the next few lines are only here due to a bug in attrLookup and the weaponProfs 2E charater sheet table
        // which seems to randomly cause issues with undefined values.

        if (!weapSpecial) {
    		weapSpecial = (attrLookup( charCS, fields.WP_specialist, fields.WP_table, 0 ) || 1);
        }
*/        
        // End of bug handling

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + (charType == CharSheet.MONSTER ? MenuType.COMPLEX : MenuType.WEAPON)
				+ '|' + tokenID
				+ '|' + rowIndex
				+ '|with their ' + weaponName
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*' + attackNum
				+ '|' + weapSpecial
				+ '|' + twoHanded;

		sendInitAPI( buildCall );
		return;
	}
	
	/**
	* Handle the results of pressing a spell-casting initiative button
	* The 'spellCasterType' parameter determines if this is an MU or a Priest
	**/
	
	var handleInitSpell = function( spellCasterType, charCS, args ) {
	
		var spellName,
			spellCastTime,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			colIndex = args[4],
			buildCall = '';

		if (rowIndex == undefined || colIndex == undefined) {
			sendDebug( 'handleInitSpell: indexes undefined' );
			sendError( 'Invalid button' );
			return;
		}

		spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, rowIndex, colIndex );
		spellCastTime = attrLookup( charCS, fields.Spells_speed, fields.Spells_table, rowIndex, colIndex );

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + (spellCasterType == Caster.WIZARD ? MenuType.MUSPELL : MenuType.PRSPELL)
				+ '|' + tokenID
				+ '|' + charButton
				+ '|casting ' + spellName
				+ '|[[' + spellCastTime + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
				
	}

    /**
    * Handle an initiative power button selection
    */

	var handleInitPower = function( charCS, args ) {
	
		var powerName,
			powerCastTime,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			colIndex = args[4],
			buildCall = '';

		if (rowIndex == undefined || colIndex == undefined) {
			sendDebug( 'handleInitPower: indexes undefined' );
			sendError( 'Invalid button' );
			return;
		}

		powerName = attrLookup( charCS, fields.Powers_name, fields.Powers_table, rowIndex, colIndex );
		powerCastTime = attrLookup( charCS, fields.Powers_speed, fields.Powers_table, rowIndex, colIndex );

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + MenuType.POWER
				+ '|' + tokenID
				+ '|' + charButton
				+ '|using their power ' + powerName
				+ '|[[' + powerCastTime + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
				
	}

    /**
    * Handle an initiative Magic Item button selection
    */

	var handleInitMIBag = function( charCS, args ) {
	
		var rowNum,
			repItemField,
			itemName,
			itemSpeed,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			buildCall = '';

		if (_.isUndefined(rowIndex)) {
			sendDebug( 'handleInitMIBag: row index undefined' );
			sendError( 'Invalid button' );
			return;
		}

		rowNum = (fields.MIFirstRowNum || rowIndex != 0);
		repItemField = fields.Items_table[0] + '_$' + rowIndex + '_';

		itemName = attrLookup( charCS, fields.Items_name, fields.Items_table, rowIndex );
		itemSpeed = attrLookup( charCS, fields.Items_speed, fields.Items_table, rowIndex );

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + MenuType.MIBAG
				+ '|' + tokenID
				+ '|' + charButton
				+ '|using their ' + itemName
				+ '|[[' + itemSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
				
	}

    /**
    * Handle an initiative thieving skill button selection
    */

	var handleInitThief = function( charCS, args ) {
	
		var tokenID = args[1],
			charButton = args[2],
			skillName = args[3],
			skillSpeed = args[4],
			
			// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

			buildCall = '!init --buildMenu ' + MenuType.THIEF
				+ '|' + tokenID
				+ '|' + charButton
				+ '|' + skillName
				+ '|[[' + skillSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
				
	}

	/**
	* Handler for Other Actions (move, change weapon, do nothing & other),
	* which appear on all menus
	**/

	var handleOtherActions = function( charCS, args ) {
	
		var tokenID = args[1],
			selectedButton = args[2],
			initMenu = args[3],
			otherAction = args[4],
			otherSpeed = args[5],

			// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

			buildCall = '!init --buildMenu ' + initMenu
				+ '|' + tokenID
				+ '|' + selectedButton
				+ '|' + otherAction
				+ '|[[' + otherSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
	}
	
	/**
	* Handler for a carryOver escape, i.e. when a long (multi-round) action is terminated
	* prior to completion by the player
	**/
	
	var handleInitCarry = function( tokenID, charCS, initMenu ) {
	
		var init_speed,
		    buildCall;
			
		setAmmoFlags( charCS );
		setAttr( charCS, fields.Init_carry, 0 );
		setAttr( charCS, fields.Init_done, 0 );
		setAttr( charCS, fields.Init_submitVal, 1 );
							
		init_speed = (attrLookup( charCS, fields.Init_speed ) || 0);

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + initMenu
				+ '|' + tokenID
				+ '|-1'
				+ '| '
				+ '|[[' + init_speed + ']]'
				+ '|0'
				+ '|0'
				+ '|-1';

		sendInitAPI( buildCall );
		return;
	};
	
	/*
	 * Handle a character/NPC/monster with more than 2 hands attacking 
	 * with all their weapons.
	 */
 
	var handleAllWeapons = function( senderId, charCS, args, base, onlyDancing ) {
		
		var	initCmd = args[0],
			tokenID = args[1],
		    rowIndex = args[2],
		    initMenu = args[3],
		    rowIndex2 = args[4],
			tokenName = getObj('graphic',tokenID).get('name'),
			entry = parseInt(fields.MW_table[1]),
			speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1),
			init_Mod = parseInt(attrLookup( charCS, fields.initMod ) || 0),
			hands = parseInt(attrLookup( charCS, fields.Equip_handedness ) || 2)+entry,
			noDancing = parseInt(attrLookup( charCS, fields.Equip_dancing ) || 0),
			attacks = [new Set()],
			weapons = [],
    		content = fields.roundMaster,
			round = state.initMaster.round,
			WeaponTable, weapon, dancing, speed, 
			actionNum, actions, initiative, i;

		log('handleAllWeapons getting Melee Weapon tables.  hands='+hands+', noDancing='+noDancing);
			
		WeaponTable = getTable( charCS, {}, fields.MW_table, fields.MW_name );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_speed );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_noAttks );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_dancing );
		
		log('handleAllWeapons about to loop on Melee Weapons');
			
		do {
			weapon = tableLookup( WeaponTable, fields.MW_name, entry, false );
			dancing = tableLookup( WeaponTable, fields.MW_dancing, entry );
    		log('handleAllWeapons found weapon '+weapon+', dancing='+dancing);
			
			if (_.isUndefined(weapon)) {break;}
			if (weapon != '-' && (!onlyDancing || dancing != 0)) {
				weapons.push(weapon);
				speed = parseInt(tableLookup( WeaponTable, fields.MW_speed, entry, '0' ));
				actionNum = tableLookup( WeaponTable, fields.MW_noAttks, entry, '1' );
				actions = eval(actionNum+'*2*'+speedMult);
				initiative = base+speed+init_Mod;
		log('handleAllWeapons pushing init:'+initiative+', action: with their '+(dancing ? 'dancing ' : '')+weapon+', msg: rate '+actionNum+', speed '+speed+', modifier '+init_Mod);
			
				attacks.push({init:initiative,ignore:0,action:('with their '+(dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				for (i=(3+(round%2)); i<=actions; i+=2) {
					initiative += speed;
        log('handleAllWeapons pushing init:'+initiative+', action: with their '+(dancing ? 'dancing ' : '')+weapon+', msg: rate '+actionNum+', speed '+speed+', modifier '+init_Mod);
					attacks.push({init:initiative,ignore:0,action:('with their '+(dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				}
			}
			entry++
		} while (entry < hands+noDancing);
		
		log('handleAllWeapons Getting Ranged Weapon tables');

		WeaponTable = getTable( charCS, {}, fields.RW_table, fields.RW_name );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_speed );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_noAttks );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_dancing );
		entry = fields.RW_table[1];
		
		log('handleAllWeapons about to start Ranged Weapon loop');

		do {
			weapon = tableLookup( WeaponTable, fields.RW_name, entry, false );
			dancing = tableLookup( WeaponTable, fields.RW_dancing, entry );
    		log('handleAllWeapons found weapon '+weapon+', dancing='+dancing);
			if (_.isUndefined(weapon)) {break;}
			if (weapon != '-' && !weapons.includes(weapon) && (!onlyDancing || dancing != 0)) {

				speed = parseInt(tableLookup( WeaponTable, fields.RW_speed, entry, '0' ));
				actionNum = tableLookup( WeaponTable, fields.RW_noAttks, entry, '1' );
				actions = eval(actionNum+'*2*'+speedMult);
				initiative = base+speed+init_Mod;
		log('handleAllWeapons pushing init:'+initiative+', action: with their '+(dancing ? 'dancing ' : '')+weapon+', msg: rate '+actionNum+', speed '+speed+', modifier '+init_Mod);
				attacks.push({init:initiative,ignore:0,action:('with their '+(dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				for (i=(3+(round%2)); i<=actions; i+=2) {
					initiative += speed;
		log('handleAllWeapons pushing init:'+initiative+', action: with their '+(dancing ? 'dancing ' : '')+weapon+', msg: rate '+actionNum+', speed '+speed+', modifier '+init_Mod);
					attacks.push({init:initiative,ignore:0,action:('with their '+(dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				}
			}
			entry++
		} while (entry < hands+noDancing);
		
		log('handleAllWeapons got all '+(onlyDancing?'dancing':'')+' weapons');

		return attacks;
	}
	
	/**
	* Handle any Submit button being pressed to roll the initiative
	**/
	
	var handleInitSubmit = function( senderId, charCS, args ) {

		var	initCmd = args[0],
			tokenID = args[1],
		    rowIndex = args[2],
		    initMenu = args[3],
		    rowIndex2 = args[4],
			base = randomInteger(10),
			actions, initiative;

		if (_.isUndefined(rowIndex)) {
			sendDebug( 'handleInitSubmit: index undefined' );
			sendError( 'Invalid button' );
			return;
		}
		
		var submitVal = attrLookup( charCS, fields.Init_submitVal );

		if (rowIndex < 0 && !submitVal) {
			sendParsedMsg( 'InitMaster', Init_Messages.doneInit, tokenID );
			return;
		}
		
		log('handleInitSubmt args:'+args);
		
		actions = handleAllWeapons( senderId, charCS, args, base, (rowIndex != -2) );

        log('handleInitSubmit done handleAllWeapons');

		if (rowIndex != -2) {
			var	charName = charCS.get('name'),
				tokenName = getObj( 'graphic', tokenID ).get('name'),
				fighterClass = (attrLookup( charCS, fields.Fighter_class ) || ''),
				init_Mod = parseInt(attrLookup( charCS, fields.initMod )) || 0,
				init_Mult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1),1),
				init_Done = parseInt(attrLookup( charCS, fields.Init_done ), 10),

				init_speed = parseInt(attrLookup( charCS, fields.Init_speed )) || 0,
				init_action = attrLookup( charCS, fields.Init_action ),
				init_actionnum = attrLookup( charCS, fields.Init_actNum ),
				init_preinit = attrLookup( charCS, fields.Init_preInit ),
				weapno = attrLookup( charCS, fields.Weapon_num ),
				actionNum = Math.floor(eval( '2 * '+init_actionnum )),
				preinit = eval( init_preinit ),
//				weapSpeed = parseInt( init_speed, 10 ),
				twoHanded = attrLookup( charCS, fields.Init_2Hweapon ),
				round = state.initMaster.round;
			
			log('handleInitSubmit get initial vars');

			if (initMenu == MenuType.TWOWEAPONS) {
				
				var init_speed2 = parseInt(attrLookup( charCS, fields.Init_2ndSpeed )) || 0,
//					weapSpeed2 = parseInt( init_speed2, 10 ),
					init_action2 = attrLookup( charCS, fields.Init_2ndAction ),
					init_actionnum2 = flags.twoWeapSingleAttk ? (init_Mult + '*1') : attrLookup( charCS, fields.Init_2ndActNum ),
					actionNum2 = Math.floor(eval( '2 * '+init_actionnum2 )),
					preinit2 = false;

				args[3] = args[4];
			}
			
			setAttr( charCS, fields.Prev_round, 0 );
			setAttr( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], state.initMaster.round, null, null, null, true );
			setAttr( charCS, fields.Init_chosen, 0 );
			setAttr( charCS, fields.Init_done, -1 );
			setAttr( charCS, fields.Init_submitVal, 0 );
			setAttr( charCS, fields.Init_carry, (init_speed > 10 ? 1 : 0) );
			setAttr( charCS, fields.Init_carrySpeed, (init_speed - 10) );
			setAttr( charCS, fields.Init_carryAction, init_action );
			setAttr( charCS, fields.Init_carryActNum, init_actionnum );
			setAttr( charCS, fields.Init_carryWeapNum, weapno );
			setAttr( charCS, fields.Init_carryPreInit, init_preinit );
			setAttr( charCS, fields.Init_carry2H, twoHanded );
			
			log('handleInitSubmit done setAttr block');
			
			if (init_Done) {
				return;
			}
			
			log( 'handleInitSubmit first weapon='+init_action+', second weapon='+init_action2);
			buildMenu( initMenu, charCS, MenuState.DISABLED, args );
			if (initMenu != MenuType.TWOWEAPONS) {
				setAttr( charCS, fields.Weapon_num, -1 );
				setAttr( charCS, fields.Weapon_2ndNum, -1 );
			}
			log('handleInitSubmit: built menu again');

			var content = fields.roundMaster;

			if (initMenu != MenuType.TWOWEAPONS || init_speed2 >= init_speed) {
				
				if (actionNum > 1 || !(round % 2)) {
					
					initiative = (preinit ? 0 : base+init_speed+init_Mod);
					actions.push({init:initiative,ignore:0,action:init_action,msg:(' rate '+init_actionnum+', speed '+init_speed+', modifier '+init_Mod)});
				}
				if (initMenu == MenuType.TWOWEAPONS && (actionNum2 > 1 || !(round % 2))) {
					initiative = base + init_speed2 + init_Mod;
					actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+', modifier '+init_Mod)});
				}
				
			} else {
				
				if (actionNum2 > 1 || !(round % 2)) {
					initiative = (preinit2 ? 0 : base+init_speed2+init_Mod);
					actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+', modifier '+init_Mod)});
				}
				if (actionNum > 1 || !(round % 2)) {
					initiative = base+init_speed+init_Mod;
					actions.push({init:initiative,ignore:0,action:init_action,msg:(' rate '+init_actionnum+', speed '+init_speed+', modifier '+init_Mod)});
				}
				
			}
					
//			if (actionNum == 4 || (actionNum == 3 && !(round % 2))) {
//				initiative = base + 2*(init_speed + init_Mod);
//				actions.push({init:initiative,ignore:0,action:init_action,msg:''});
//			}

			for( let i=2; actionNum>i; i+=2 ) {
				if ((actionNum > (i+2)) || !(actionNum % 2) || !(round % 2)) {
					initiative = base + (((i+2)/2) * (init_speed+init_Mod));
					actions.push({init:initiative,ignore:0,action:init_action,msg:''});
				}
			}
			
			if (initMenu == MenuType.TWOWEAPONS) {
				if (actionNum2 > 2 && (actionNum2 > 4 || !(actionNum2 % 2) || !(round % 2))) {
					initiative = base + 2*(init_speed + init_Mod);
					actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+', modifier '+init_Mod)});
				}

				for( let i=4; actionNum2>i; i+=2 ) {
					if ((actionNum2 > (i+2)) || !(actionNum2 % 2) || !(round % 2)) {
						initiative = base + ((i/2) * (init_speed2+init_Mod));
						actions.push({init:initiative,ignore:0,action:init_action2,msg:''});
					}
				}
			}
		}
		// RED: v1.023 changed InitSubmit to use an array for all actions
		// RED: v1.027 changed InitSubmit to work with new roundMaster, just passing unmodified rolls

		actions = _.sortBy( actions, 'init' );
		_.each( actions, function(act) {
		    if (_.isUndefined(act.init)) {return;}
			content += ' --addtotracker '+tokenName+'|'+tokenID+'|'+act.init+'|'+act.ignore+'|'+act.action+'|'+act.msg;
		});
		log('handleInitSubmit actions.length+1 is '+(actions.length+1));
		content += ' --removefromtracker '+tokenName+'|'+tokenID+'|'+(actions.length);
		log('handleInitSubmit '+content);

		sendInitAPI( content, senderId );
		
		content = fields.attackMaster;
/*		RED: v1.023 AttackMaster now uses the weapno field to determine 
					if two weapons are being used, and determines for 
					itself what the penalty will be

		if (flags.canChange2Weaps) {
    		content += ' --twoswords ' + tokenID;
    		if (initMenu == MenuType.TWOWEAPONS && fighterClass.toLowerCase() != 'ranger') {
    			content += '|2';
    			setAttr( charCS, fields.Weapon_2ndNum, 2 );
    		} else {
    			content += '|0';
    			setAttr( charCS, fields.Weapon_2ndNum, 0 );
    		}
		}
*/
		
		// RED: v1.013 if the two-handed weapon initiative flag is either 0 or 1
		// call --setACstatus in the attackMaster API to set the appropriate AC
		// as two-handed weapons mean the wielder is shieldless.
		if (flags.canChangeAC && twoHanded >= 0) {
			content += ' --setacstatus ' + tokenID + '|' + (twoHanded > 0 ? 'Shieldless' : 'Full');
		}
		if (flags.canChange2Weaps || flags.canChangeAC) {
    		sendInitAPI( content, senderId );
		}

	};

	/*
	 * Set up the shape of the spell book.  This is complicated due to
	 * the 2E sheet L5 MU Spells start out-of-sequence at column 70
	 */
	 
	var shapeSpellbook = function( charCS, isMU ) {

		var levelSpells = (isMU ? spellLevels.mu : spellLevels.pr);
	
		for (let i=1; i<=(isMU ? 9 : 7); i++) {
			if (isMU) {
				levelSpells[i].spells  = (attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_memable[0],fields.MUSpellNo_memable[1]])||0);
				levelSpells[i].spells += (attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_specialist[0],fields.MUSpellNo_specialist[1]])||0);
				levelSpells[i].spells += (attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1]])||0);
			} else {
				levelSpells[i].spells  = (attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_memable[0],fields.PRSpellNo_memable[1]])||0);
				levelSpells[i].spells += (attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_wisdom[0],fields.PRSpellNo_wisdom[1]])||0);
				levelSpells[i].spells += (attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1]])||0);
			}
		}
		return levelSpells;
	}
	
	/*
	 * Checks for the existence of magic items in the MI bag
	 */
	 
	var checkForMIs = function( charCS ) {

		var MagicItems = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
			i = fields.Items_table[1],
			item;

		while (!_.isUndefined(item = tableLookup( MagicItems, fields.Items_name, i++ ))) {
			if (item.length && item != '-') {return true;}
		}
		return false;
	}
	
	/*
	 * Checks for the existence of powers
	 */
	 
	var checkForPowers = function( charCS ) {
		var item = attrLookup( charCS, fields.Powers_name, fields.Powers_table, 0, fields.PowersBaseCol+0 );
		for (let r = 0; !_.isUndefined(item); r++) {
			for (let c = 0; c<fields.PowersCols && !_.isUndefined(item); c++) {
				item = attrLookup( charCS, fields.Powers_name, fields.Powers_table, r, fields.PowersBaseCol+c );
				if (item && item.length && item != '-') {return true;}
			}
		}
		return false;
	}
	
// ---------------------------------- build menus to display --------------------------------------------------------	

	/**
	* Select a menu to build
	**/

	var buildMenu = function( initMenu, charCS, selected, args ) {
	
		var content = '';
		
		switch (initMenu) {
		
		case MenuType.SIMPLE :
				makeMonsterMenu( Monster.SIMPLE, charCS, selected, args );
				break;
				
		case MenuType.COMPLEX :
				makeMonsterMenu( Monster.COMPLEX, charCS, selected,args );
				break;
				
			case MenuType.WEAPON :
				makeWeaponMenu( charCS, selected, args );
				break;
			
			case MenuType.MW_MELEE :
				args[3] = args[8];
				makePrimeWeaponMenu( charCS, selected, args );
				break;
				
            case MenuType.MW_PRIME :
			case MenuType.MW_SECOND :
				args[3] = args[8];
				makeSecondWeaponMenu( charCS, selected, args );
				break;
			
			case MenuType.TWOWEAPONS :
				makeSecondWeaponMenu( charCS, selected, args );
				break;
				
			case MenuType.MUSPELL :
				makeSpellMenu( Caster.WIZARD, charCS, selected, args );
				break;
				
			case MenuType.PRSPELL :
				makeSpellMenu( Caster.PRIEST, charCS, selected, args );
				break;
				
			case MenuType.POWER :
				makePowersMenu( charCS, selected, args );
				break;
				
			case MenuType.MIBAG :
				makeMIBagMenu( charCS, selected, args );
				break;
				
			case MenuType.THIEF :
				makeThiefMenu( charCS, selected, args );
				break;
				
			case MenuType.OTHER :
				makeOtherMenu( charCS, selected, args );
				break;
				
			case MenuType.MENU :
				makeInitMenu( charCS, CharSheet.CHARACTER, args );
				break;
				
			case MenuType.MONSTER_MENU :
				makeInitMenu( charCS, CharSheet.MONSTER, args );
				break;
				
			case MenuType.CARRY :
			    break;
				
			default:
				sendDebug( 'buildMenu: "' + initMenu + '" is an invalid menu' );
				sendError( 'Invalid initMaster menu call' );

		}
		return;
	}


	/**
	 * Add the Magic Item and Powers initiative buttons to a menu
	 **/

	var MIandPowers = function( tokenID, submitted ) {
		var charCS = getCharacter(tokenID),
			mis = checkForMIs(charCS),
			powers = checkForPowers(charCS),
			content = '';
			
		if (mis || powers) {
			content = '\n**Magic Items & Powers**\n';
			if (mis) {content += (submitted ? '<span style=' + design.grey_button + '>' : '[') + 'Use a Magic Item' + (submitted ? '</span>' : '](!init --mibag ' + tokenID + ')');}
			if (powers) {content += (submitted ? '<span style=' + design.grey_button + '>' : '[') + 'Use Powers' + (submitted ? '</span>' : '](!init --power ' + tokenID + ')');}
		}
		return content;
	};

	/**
	 * Add Other Actions to any menu
	 **/

	var otherActions = function( initMenu, tokenID, charButton, submitted ) {
		var	content = (charButton == 101 ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
					+ 'Move'
					+ ((charButton == 101 || submitted) ? '</span>' : '](!init --button ' + BT.OTHER + '|' + tokenID + '|101|' + initMenu + '|while moving|0)')
					+ (charButton == 102 ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
					+ 'Change weapon'
					+ ((charButton == 102 || submitted) ? '</span>' : '](!init --button ' + BT.OTHER + '|' + tokenID + '|102|' + initMenu + '|while changing weapon|0)')
					+ (charButton == 103 ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
        			+ 'Do nothing'
					+ ((charButton == 103 || submitted) ? '</span>' : '](!init --button ' + BT.OTHER + '|' + tokenID + '|103|' + initMenu + '|while doing nothing|0)')
					+ (charButton == 104 ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
					+ 'Other'
					+ ((charButton == 104 || submitted) ? '</span>' : '](!init --button ' + BT.OTHER + '|' + tokenID + '|104|' + initMenu + '|doing ?{Doing what?}|?{Speed?|1})');
		return content;
	};
	
	/*
	 * Make weapon button lists
	 */
	 
	var makeWeaponButtons = function( tokenID, charButton, submitted, MWcmd, RWcmd, show2H, showDancing, showInHand ) {
		
        if (_.isUndefined(show2H) || _.isNull(show2H)) {show2H = true};
        if (_.isUndefined(showDancing) || _.isNull(showDancing)) {showDancing = true};
        if (_.isUndefined(showInHand) || _.isNull(showInHand)) {showInHand = true};

		var charCS = getCharacter( tokenID ),
			weapName,
			ammoRowAdj,
			ammoPointer,
			twoHanded,
			dancing,
			i, w, a,
			header = true,
			content = '',
			dancingWeapons = '',

			WeaponTable = getTable( charCS, {}, fields.MW_table, fields.MW_name );
			WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_twoHanded );
			WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_dancing );
		
		a = fields.MW_table[1];
		for (i = a; i < (fields.MWrows + a); i++) {
			w = (1 - (a * 2)) + (i * 2);
			weapName = tableLookup( WeaponTable, fields.MW_name, i, false );
			log('makeWeaponButtons i='+i+', weapName='+weapName);
			if (_.isUndefined(weapName)) {log('makeWeaponButtons MW loop breaking');break;}
			if (_.isUndefined(weapName)) {break;}
			log('makeWeaponButtons name='+weapName+', 2H='+tableLookup( WeaponTable, fields.MW_twoHanded, i )+', dancing='+tableLookup(WeaponTable, fields.MW_dancing, i ));
			twoHanded = tableLookup( WeaponTable, fields.MW_twoHanded, i ) != 0;
			dancing = tableLookup(WeaponTable, fields.MW_dancing, i ) != 0;
			if (showInHand && (weapName != '-') && (show2H || !twoHanded) && !dancing) {
			    if (header) {
			        content += '**Melee Weapons**\n';
			        header = false;
			    }
				content += (w == charButton || submitted ? '<span style=' + (submitted ? design.grey_button : design.selected_button) + '>' : '[');
				content += weapName;
				content += (((w == charButton) || submitted) ? '</span>' : '](!init --button ' + MWcmd + '|' + tokenID + '|' + w + '|' + i + ')');
			} else if ((weapName != '-') && dancing) {
				dancingWeapons += '<span style='+(submitted ? design.grey_button : design.green_button)+'>'+weapName+'</span>';
				log('makeWeaponButtons adding '+weapName+' to dancingWeapons');
			}
		};
		if (!header) {
		    content += '\n';
		    header = true;
		}

		// build the character Ranged Weapons list ****
		
		WeaponTable = getTable( charCS, {}, fields.RW_table, fields.RW_name );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_twoHanded, '', 1 );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_dancing, '', 0 );

		a = fields.RW_table[1];
		for (i = a; i < (fields.RWrows + a); i++) {
			w = (2 - (a * 2)) + (i * 2);
			weapName = tableLookup( WeaponTable, fields.RW_name, i );
			if (_.isUndefined(weapName)) {break;}
			log('makeWeaponButtons name='+weapName+', 2H='+tableLookup( WeaponTable, fields.RW_twoHanded, i )+', dancing='+tableLookup(WeaponTable, fields.RW_dancing, i ));
			twoHanded = tableLookup( WeaponTable, fields.RW_twoHanded, i ) != 0;
			dancing = tableLookup(WeaponTable, fields.RW_dancing, i ) != 0;
			if (showInHand && weapName != '-' && (show2H || !twoHanded) && !dancing) {
			    if (header) {
			        content += '**Ranged weapons**\n';
			        header = false;
			    }
				content += (w == charButton || submitted ? '<span style=' + (submitted ? design.grey_button : design.selected_button) + '>' : '[');
				content += weapName;
				content += (((w == charButton) || submitted) ? '</span>' : '](!init --button ' + RWcmd + '|' + tokenID + '|' + w + '|' + i + ')');
			} else if ((weapName != '-') && dancing && !dancingWeapons.includes('>'+weapName+'<')) {
				dancingWeapons += '<span style='+design.green_button+'>'+weapName+'</span>';
				log('makeWeaponButtons adding '+weapName+' to dancingWeapons');
			}
		}
		if (!header) {
			content += '\n';
		}
		if (dancingWeapons.length) {
		    log('makeWeaponButtons adding dancingWeapons to returned string');
			content += '**Dancing weapons**\nAutomatic Initiative\n' + dancingWeapons;
		}
		
		return content;
	}

    /*
    * Create the Complex Monster Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeMonsterMenu = function(complex,charCS,submitted,args) {

        var tokenID = args[1],
			charButton = args[2],
			tokenName,
            content;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Complex Monster Attacks}}'
				+ '{{desc=**Innate weapons**\n';
				
		// add a button for innate monster attack abilities using the monster initiative modifier
		
		content += (0 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
		content += 'Monster Attack';
		content += (((0 == charButton) || submitted) ? '</span>' : '](!init --button ' + (complex ? BT.MON_INNATE : BT.MON_ATTACK) + '|' + tokenID + '|0|-1)');

		if (complex) {

			content += '\n'+makeWeaponButtons( tokenID, charButton, submitted, BT.MON_MELEE, BT.MON_RANGED );
			content += MIandPowers( tokenID, submitted );
			
			

		}
		content	+= '}}'
				+ '{{desc1=' + otherActions( (complex ? MenuType.COMPLEX : MenuType.SIMPLE), tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + (complex ? MenuType.COMPLEX : MenuType.SIMPLE) + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Weapon Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeWeaponMenu = function(charCS,submitted,args) {

        var tokenID = args[1],
			charButton = args[2],
            curToken = getObj( 'graphic', tokenID ),
            baseMW = fields.MW_table[1],
            baseRW = fields.RW_table[1],
			tokenName,
			fighterLevel, rogueLevel, hands,
			monAttk1, monAttk2, monAttk3,
            content;

        if (!curToken) {
            sendDebug( 'makeWeaponMenu: invalid tokenID' );
            sendError( 'Invalid initMaster argument' );
            return;
        }
            
		tokenName = curToken.get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Weapon Attacks}}';
				
		fighterLevel = parseInt(attrLookup( charCS, fields.Fighter_level ) || '0');
		rogueLevel = parseInt(attrLookup( charCS, fields.Rogue_level ) || '0');
		hands = parseInt(attrLookup( charCS, fields.Equip_handedness ) || 2 );
		if (fighterLevel || rogueLevel) {
		    let refIndex = (charButton%2) ? (baseMW==0?((charButton-1)/2):((charButton-3)/2)) : ((baseRW==0)?((charButton-2)/2):((charButton-4)/2))
		    content += '{{Fighter\'s & Rogue\'s Option=';
			content += submitted ? '<span style=' + design.grey_button + '>' : '[';
			content += 'Two Weapons';
			content += (submitted) ? '</span>' : '](!init --button ' + BT.TWOWEAPONS + '|' + tokenID + '|' + charButton + '|' + refIndex + ')';
			content += '}}';
		}
		if (hands > 2) {
			content += '{{Many Hands Option='
					+  (-2 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
					+  'All Weapons'
					+  (((-2 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.ALLWEAPONS + '|' + tokenID + '|' + -2 + '|' + -2 + ')')
					+  '}}';
		}

		content += '{{desc=';

		monAttk1 = attrLookup( charCS, fields.Monster_dmg1 );
		monAttk2 = attrLookup( charCS, fields.Monster_dmg2 );
		monAttk3 = attrLookup( charCS, fields.Monster_dmg3 );
		if (monAttk1 || monAttk2 || monAttk3) {
			content += (0 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += 'Monster Attack';
			content += (((0 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|-1)\n');
		}
				
		content += makeWeaponButtons( tokenID, charButton, submitted, BT.MELEE, BT.RANGED );

		content += MIandPowers( tokenID, submitted ) + '}}'
				+ '{{desc1=' + otherActions( MenuType.WEAPON, tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton == -1) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton == -1) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.WEAPON + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Primary Weapon Initiative menu for 2 weapon attacks.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makePrimeWeaponMenu = function(charCS,submitted,args) {

        var tokenID = args[1],
			ammoPointer = '',
			ammoQty,
			ammoRowAdjust,
			weapName = '',
			tokenName,
			twoHanded,
            content,
			w, rowCount;
			
//		log('makePrimeWeaponMenu called');
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Two Weapon Attacks}}'
				+ '{{desc=**Choose Secondary Weapon**\n'
				+ 'or go back to [One Weapon](!init --button ' + BT.ONEWEAPON + '|' + tokenID + '|-1|-1)}}';
				
		content += '{{desc1=' + makeWeaponButtons( tokenID, -1, submitted, BT.MW_PRIME, BT.RW_PRIME, false );

		content += '}}{{desc2=Select two weapons above, then '
				+ '<span style=' + design.grey_button + '>Submit</span>}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Secondary Weapon Initiative menu for 2 weapon attacks.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeSecondWeaponMenu = function(charCS,submitted,args) {

        var menu = args[0],
			tokenID = args[1],
			charButton = args[2],
			charButton2 = args[3],
			ammoPointer = '',
			ammoQty,
			weapName = '',
			twoHanded,
			dancing,
			tokenName,
			highlight,
            content,
			dancingWeapons = '',
            header = true,
			w, i, a,
			rowCount,
			WeaponTable = getTable( charCS, {}, fields.MW_table, fields.MW_name );
			WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_twoHanded, '', 0 );
			WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_dancing, '', 0 );
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Two Weapon Attacks}}'
				+ '{{desc=**Choose '+(charButton2>0 ? 'New ' : '')+'<span style='+design.green_button+'>Primary Weapon**</span>\n'
				+ 'Change by reselecting\n'
				+ 'Or go back to ';
			
		content += submitted ? '<span style=' + design.grey_button + '>' : '[';
		content += 'One Weapon';
		content += submitted ? '</span>' : '](!init --button ' + BT.ONEWEAPON + '|' + tokenID + '|'+ charButton + '|-1|-1)';
		content += '}}{{desc1=';
				
		// build the Melee Weapon list
		
		a = fields.MW_table[1];
		for (i = a; i < (fields.MWrows + a); i++) {
			w = (1 - (a * 2)) + (i * 2);
			weapName = tableLookup( WeaponTable, fields.MW_name, i );
			if (_.isUndefined(weapName)) {break;}
			twoHanded = tableLookup( WeaponTable, fields.MW_twoHanded, i ) != 0;
			dancing = tableLookup(WeaponTable, fields.MW_dancing, i ) != 0;
			if (!twoHanded && !dancing && weapName != '-') {
			    if (header) {
			        content += '**1H Melee weapons**\n';
			        header = false;
			    }
				highlight = submitted ? design.grey_button : ((charButton == w) ? design.green_button : design.selected_button);
				content += (!submitted) ? '[' : '';
				content += ((w == charButton || w == charButton2 || submitted) ? ('<span style=' + highlight + '>') : '');
				content += weapName;
				content += (w == charButton || w == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + BT.MW_SECOND + '|' + tokenID + '|' + charButton + '|' + w + '|' + ((charButton-(1-(a*2)))/2) + '|' + i + ')') : '';
			} else if ((weapName != '-') && dancing) {
				dancingWeapons += '<span style='+(submitted ? design.grey_button : design.green_button)+'>'+weapName+'</span>';
			}
		}

		if (!header) {
			content += '\n';
			header = true;
		}

		// build the character Ranged Weapons list
		WeaponTable = getTable( charCS, {}, fields.RW_table, fields.RW_name );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_twoHanded, '', 1 );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_dancing, '', 0 );
		
		a = fields.RW_table[1];
		for (i = a; i < (fields.RWrows + a); i++) {
			w = (2 - (a * 2)) + (i * 2);
			weapName = tableLookup( WeaponTable, fields.RW_name, i );
			if (_.isUndefined(weapName)) {break;}
			twoHanded = tableLookup( WeaponTable, fields.RW_twoHanded, i ) != 0;
			dancing = tableLookup(WeaponTable, fields.RW_dancing, i ) != 0;
			if (!twoHanded && !dancing && weapName != '-') {
			    if (header) {
			        content += '**1H Ranged weapons**\n';
			        header = false;
			    }
				highlight = submitted ? design.grey_button : ((charButton == w) ? design.green_button : design.selected_button);
				content += (!submitted) ? '[' : '';
				content += ((w == charButton || w == charButton2 || submitted) ? ('<span style=' + highlight + '>') : '');
//				ammoPointer = attrLookup( charCS, [fields.Ammo_indirect[0] + (i+1-a) + '-', fields.Ammo_indirect[1]] );
//				content += attrLookup( charCS, [ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1]] ) + ' x ' + weapName;
				content += weapName;
				content += (w == charButton || w == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + BT.RW_SECOND + '|' + tokenID + '|' + charButton + '|' + w + '|' + (charButton-((2-(a*2))/2)) + '|' + i + ')') : '';
			} else if ((weapName != '-') && dancing && !dancingWeapons.includes(weapName)) {
				dancingWeapons += '<span style='+(submitted ? design.grey_button : design.green_button)+'>'+weapName+'</span>';
			}
		};
		
		if (dancingWeapons.length) {
			content += '**Dancing weapons**\nAutomatic Initiative\n' + dancingWeapons;
		}
		content += '}}{{desc2=Select two weapons above, then '
				+ ((charButton < 1 || charButton2 < 1 || charButton == charButton2 || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ ((charButton < 1 || charButton2 < 1 || charButton == charButton2 || submitted) ? '</span>' : ('](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.TWOWEAPONS + '|' + charButton2 + ')'))
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the spell Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeSpellMenu = function( spellCasterType, charCS, submitted, args ) {

        var tokenID = args[1],
			spellButton = args[2],
			spellName = '',
			dancers,
			qty,
			isMU,
            content,
            tokenName,
			levelSpells = [],
			l, w, r, c,
			buttonID = 0;
            
		isMU = (spellCasterType == Caster.WIZARD);

		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What Spell is ' + tokenName + ' planning to cast?}}'
				+ '{{subtitle=Initiative for L1-L4 ' + spellCasterType + ' spells}}'
				+ '{{desc=';

		// set up the shape of the spell book.  This is complicated due to
		// the 2E sheet L5 MU Spells start out-of-sequence at column 70
		
		levelSpells = shapeSpellbook( charCS, isMU );

		// build the Spell list
		
		for (l = 1; l < levelSpells.length; l++) {
			r = 0;
            if (levelSpells[l].spells > 0) {
				if (l != 1)
					{content += '\n';}
				content += '**Level '+l+' spells**\n';
			}
			while (levelSpells[l].spells > 0) {
				c = levelSpells[l].base;
				for (w = 1; (w <= fields.SpellsCols) && (levelSpells[l].spells > 0); w++) {
					spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, r, c );
					if (_.isUndefined(spellName)) {
						levelSpells[l].spells = 0;
						break;
					}
					qty = parseInt(attrLookup( charCS, fields.Spells_castValue, fields.Spells_table, r, c ));
					content += (buttonID == spellButton ? '<span style=' + design.selected_button + '>' : (submitted || qty == 0 ? '<span style=' + design.grey_button + '>' : '['));
					content += spellName;
					content += (((buttonID == spellButton) || submitted || !qty) ? '</span>' : '](!init --button ' + (isMU ? BT.MU_SPELL : BT.PR_SPELL) + '|' + tokenID + '|' + buttonID + '|' + r + '|' + c + ')');
					buttonID++;
					c++;
					levelSpells[l].spells--;
				}
				r++;
			}
		}

		if (!buttonID) {
			sendParsedMsg( 'initMaster', (isMU ? Init_Messages.noMUspellbook : Init_Messages.noPRspellbook), tokenID );
			return;
		}
		
		dancers =  makeWeaponButtons( tokenID, -1, submitted, '', '', true, true, false );

		content += (dancers.length ? '\n'+dancers : '')
		        +  MIandPowers( tokenID, submitted ) + '}}'
				+ '{{desc1='+otherActions( (isMU ? MenuType.MUSPELL : MenuType.PRSPELL), tokenID, spellButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((spellButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((spellButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + spellButton + '|' + (isMU ? MenuType.MUSPELL : MenuType.PRSPELL) + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Magic Item Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeMIBagMenu = function( charCS, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			tokenName,
			miName,
            content,
            dancers,
			r, rowAdj,
			buttonID = 0;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What Magic Item is ' + tokenName + ' planning to use?}}'
				+ '{{subtitle=All ' + tokenName + '\'s Magic Items}}'
				+ '{{desc=';

		// build the Magic Item list
		
		rowAdj = fields.Items_table[1];
		for (r = rowAdj; r < (fields.MIRows + rowAdj); r++) {
			miName = attrLookup( charCS, fields.Items_name, fields.Items_table, r );
			if (_.isUndefined(miName)) {break;}
			if (miName != '-') {
				content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += miName;
				content += (((buttonID == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MI_BAG + '|' + tokenID + '|' + buttonID + '|' + r + ')');
			}
			buttonID++;
		}

		if (r == rowAdj) {
			sendParsedMsg( 'initMaster', Init_Messages.noMIBag, tokenID );
			return;
		}

		dancers =  makeWeaponButtons( tokenID, -1, submitted, '', '', true, true, false );

		content += (dancers.length ? '\n'+dancers : '')
		        + '}}{{desc1=' + otherActions( MenuType.MIBAG, tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.MIBAG + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Powers Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makePowersMenu = function( charCS, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			spellName = '',
			qty,
			tokenName,
			powerName,
            content,
            dancers,
			col, rep,
			powerRows = 0,
			levelRows = [],
			l, w, r, c,
			buttonID = 0;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What Power is ' + tokenName + ' planning to use?}}'
				+ '{{subtitle=All available Powers}}'
				+ '{{desc=';

		// build the Powers list
		
		for (r = 0; r < fields.PowerRows; r++) {
			c = fields.PowersBaseCol;
			for (w = 1; w <= fields.PowersCols; w++) {
				qty = attrLookup( charCS, fields.Spells_castValue, fields.Powers_table, r, c );
				powerName = attrLookup( charCS, fields.Powers_name, fields.Powers_table, r, c );
				if (_.isUndefined(powerName)) {break;}
				if (powerName != '-') {
					content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted || !qty ? '<span style=' + design.grey_button + '>' : '['));
					content += powerName;
					content += (((buttonID == charButton) || submitted || !qty) ? '</span>' : '](!init --button ' + BT.POWER + '|' + tokenID + '|' + buttonID + '|' + r + '|' + c + ')');
				}
				buttonID++;
				c++;
			}
		}

		if (!buttonID) {
			sendParsedMsg( 'initMaster', Init_Messages.noPowers, tokenID );
			return;
		}
		
		dancers =  makeWeaponButtons( tokenID, -1, submitted, '', '', true, true, false );

		content += (dancers.length ? '\n'+dancers : '')
		        + '}}{{desc1=' + otherActions( MenuType.POWER, tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.POWER + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Thieving Actions Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeThiefMenu = function( charCS, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			content = '',
			dancers,
			sheetType,
			tokenName,
			armourType,
			armourMod,
			ability = [],
			level = attrLookup( charCS, fields.Rogue_level );
            
		if (!level || level == 0) {
			sendParsedMsg( 'initMaster', Init_Messages.notThief, tokenID );
		}
		
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		// find armour type
		
		armourType = (attrLookup( charCS, fields.Armor_name ) || 'leather' ).toLowerCase();
		switch (armourType) {
			case 'no armour':
			case 'no armor':
			case 'none':
				armourMod = fields.Armor_mod_none;
				break;
				
			case 'light':
			case 'leather':
				armourMod = fields.Armor_mod_leather;
				break;

			case 'studded':
			case 'padded':
			case 'studded leather':
			case 'padded leather':
				armourMod = fields.Armor_mod_studded;
				break;
				
			default:
				sendParsedMsg( 'initMaster', Init_Messages.heavyArmour, tokenID );
				return content;
		}
		
		// Get the thieving skill levels

        ability.length = 9;
		ability[0] = {name: 'Picking Pockets',skill: Math.max((attrLookup( charCS, [fields.Pick_Pockets[0]+armourMod, fields.Pick_Pockets[1]] ) || 0), 5 ), speed: '0' };
		ability[1] = {name: 'Opening Locks', skill: Math.max((attrLookup( charCS, [fields.Open_Locks[0]+armourMod, fields.Open_Locks[1]] ) || 0), 5 ), speed: '1d8'};
		ability[2] = {name: 'Finding Traps', skill: Math.max((attrLookup( charCS, [fields.Find_Traps[0]+armourMod, fields.Find_Traps[1]] ) || 0), 5 ), speed: '1d100'};
		ability[3] = {name: 'Moving Silently', skill: Math.max((attrLookup( charCS, [fields.Move_Silently[0]+armourMod, fields.Move_Silently[1]] ) || 0), 5 ), speed: '0' };
		ability[4] = {name: 'Hiding in Shadows', skill: Math.max((attrLookup( charCS, [fields.Hide_in_Shadows[0]+armourMod, fields.Hide_in_Shadows[1]] ) || 0), 5 ), speed: '0'};
		ability[5] = {name: 'Detecting Noise', skill: Math.max((attrLookup( charCS, [fields.Detect_Noise[0]+armourMod, fields.Detect_Noise[1]] ) || 0), 5 ), speed: '1d6'};
		ability[6] = {name: 'Climbing Walls', skill: Math.max((attrLookup( charCS, [fields.Climb_Walls[0]+armourMod, fields.Climb_Walls[1]] ) || 0), 5 ), speed: '1d10'};
		ability[7] = {name: 'Reading Languages', skill: Math.max((attrLookup( charCS, [fields.Read_Languages[0]+armourMod, fields.Read_Languages[1]] ) || 0), 5 ), speed: '1d100'};
		ability[8] = {name: 'Remembering Legends', skill: Math.max((attrLookup( charCS, [fields.Legend_Lore[0]+armourMod, fields.Legend_Lore[1]] ) || 0), 5 ), speed: '1d100'};

		// build the thieving skills list
		
		content = '&{template:2Edefault}{{name=What Thieving ability is ' + tokenName + ' planning to use?}}'
				+ '{{subtitle=' + tokenName + '\'s thieving abilities}}'
				+ '{{desc=';
				
		for (let i=0; i<8; i++) {
			content += (i == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += ability[i].name + '(' + ability[i].skill + '%)';
			content += (((i == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.THIEF + '|' + tokenID + '|' + i + '|' + ability[i].name + ' ' + ability[i].skill + '% |' + ability[i].speed + ')');
		}
		
		dancers =  makeWeaponButtons( tokenID, -1, submitted, '', '', true, true, false );

		content += (dancers.length ? '\n'+dancers : '')
		        + '}}{{desc1=' + otherActions( MenuType.THIEF, tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.THIEF + ')')
				+ '}}';

		sendResponse( charCS, content );
		return;

	};
	
	/*
	 * Make a menu of all types of actions that the character can perform, so
	 * the Player can choose which to do Initiative with.
	 */

	var makeInitMenu = function( charCS, monster, args ) {
		
		var tokenID = args[1],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
			charCS = getCharacter(tokenID),
			mis = checkForMIs(charCS),
			powers = checkForPowers(charCS),
		    fighter,
		    wizard,
		    priest,
		    rogue,
		    content = '&{template:2Edefault}{{name=What does ' + tokenName + ' want to do?}}'
					+ '{{subtitle=' + tokenName + '\'s possible activities}}'
					+ '{{desc=';
		
		fighter = attrLookup( charCS, fields.Fighter_level );
		wizard = attrLookup( charCS, fields.Wizard_level );
		priest = attrLookup( charCS, fields.Priest_level );
		rogue = attrLookup( charCS, fields.Rogue_level );
					
		content += '[Attack](!init ' + (monster == CharSheet.MONSTER ? '--complex ' : '--weapon ') + tokenID + ')';
		if (wizard) {
			content += '[Cast MU Spell](!init --muspell ' + tokenID + ')';
		}
		if (priest) {
			content += '[Cast PR Spell](!init --prspell ' + tokenID + ')';
		}
		if (powers) {
			content += '[Use Power](!init --power ' + tokenID + ')';
		}
		if (mis) {
			content += '[Use Magic Item](!init --mibag ' + tokenID + ')';
		}
		content += '[Use Thieving Skills](!init --thief ' + tokenID + ')';
		content += '[Other Actions](!init --other ' + tokenID + ')}}';
		
		sendResponse( charCS, content );
		return;
	}
	
	var makeOtherMenu = function( charCS, submitted, args ) {
	
		var tokenID = args[1],
			charButton = args[2],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
    		dancers =  makeWeaponButtons( tokenID, -1, submitted, '', '', true, true, false ),

    		content = '&{template:2Edefault}{{name=What does ' + tokenName + ' want to do?}}'
					+ '{{subtitle=' + tokenName + '\'s possible activities}}'
					+ '{{desc='+ otherActions( MenuType.OTHER, tokenID, charButton, submitted )
					+ (dancers.length ? '\n'+dancers : '')
		            + '}}{{desc1=Select action above, then '
					+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.OTHER + ')')
					+ '}}';
		
		sendResponse( charCS, content );
		return;
	}

	
//------------------------------------- do commands --------------------------------------------

	/**
	 * Show help message
	 */ 
	var showHelp = function() {
		var content = 
			'<div style="background-color: #FFF; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; margin-left: 2px; margin-right: 2px; padding-top: 5px; padding-bottom: 5px;">'
				+ '<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 125%">Initiative Master v'+version+'</span>'
				+ '</div>'
				+ '<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
					+ '<div style="font-weight: bold;">'
						+ '!init --help'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display this message'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!init --complex tokenID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of attack actions that a complex monster can do as the action for the round'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!init --weapon tokenID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of weapons to attack with as the action for the round'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!init --muspell tokenID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of wizard spells to cast as the action for the round'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!init --prspell tokenID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of priest spells to cast as the action for the round'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!init --power tokenID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of powers that could be used as the action for the round'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!init --mibag tokenID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of magic items to use as the action for the round'
					+ '</li>'
					+ '<br>'
				+ '</div>'
   			+ '</div>'; 

		sendFeedback(content); 
	}; 
	
	/*
	 * Function to flip the state of gmView which,
	 * when true, copies all API messages to the GM
	 */
	
	var doGMview = function( args, senderID ) {
		
		state.initMaster.gmView = !state.initMaster.gmView;
		
		sendFeedback( 'GM will now '+(state.initMaster.gmView ? '' : 'not ')+'see any initMaster messages to players' );
		return;
	}	
	
	/**
	 * Function to display all weapons tables
	 * used by the initiative system to check validity
	 **/
	 
	var doDispWeaps = function( args ) {
		
		if (!args)
		{return;}
		
		var tokenID = args[0],
			charCS = getCharacter( tokenID ),
			counterAdj,
			i;

		if (!charCS) {
			sendDebug('doDispWeaps: Invalid token ID passed');
			sendError('Invalid initMaster initialisation request');
			return;
		}
		
		var charName = charCS.get('name'),
			content = '&{template:2Edefault}{{name=Weapons check for '+charName+'}}{{desc=Melee Weapons\n'
					+ '<table>'
					+ '<tr><td>St</td><td>2H</td><td>Weapon</td><td>Prof</td><td>#Att</td><td>Adj</td><td>Spd</td><td>Crit</td><td>Sp</td><td>M</td><td>CW</td><td>DSt</td><td>Dweap</td><td>DSp</td><td>DAdj</td><td>SM</td><td>L</td></tr>';
			
		counterAdj = (fields.MW_table ? 0 : -1);
		for (i=counterAdj; i<(fields.MWrows+counterAdj); i++) {
			content += '<td>'+attrLookup( charCS, fields.MW_strBonus, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_twoHanded, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_name, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_profLevel, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_noAttks, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_attkAdj, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_speed, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_crit, fields.MW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_specialist, fields.WP_table, (1+(i*2)) ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_mastery, fields.WP_table, (1+(i*2)) ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_backstab, fields.WP_table, (1+(i*2)) ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgStrBonus, fields.MW_dmgTable, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgName, fields.MW_dmgTable, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgSpecialist, fields.MW_dmgTable, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgAdj, fields.MW_dmgTable, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgSM, fields.MW_dmgTable, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgL, fields.MW_dmgTable, i ) + '</tr>';
		}
		content += '</table>}}{{desc1=Ranged weapons\n'
				+ '<table>'
					+ '<tr><td>St</td><td>Dx</td><td>2H</td><td>Weapon</td><td>Prof</td><td>#Att</td><td>Adj</td><td>Spd</td><td>Crit</td><td>Sp</td><td>M</td><td>CW</td><td>DSt</td><td>Dweap</td><td>DAdj</td><td>SM</td><td>L</td><td>Qty</td></tr>';
		counterAdj = (fields.RW_table ? 0 : -1);
		for (i=counterAdj; i<(fields.RWrows+counterAdj); i++) {
			weapTable = fields.RW_table[0] + '_$' + i + '_';
			profTable = fields.WP_table[0] + '_$' + (2+(i*2)) + '_';
			dmgTable = fields.Ammo_table[0] + '_$' + i + '_';
			content += '<td>'+attrLookup( charCS, fields.RW_strBonus, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_dexBonus, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_twoHanded, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_name, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_profLevel, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_noAttks, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_attkAdj, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_speed, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_crit, fields.RW_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_specialist, fields.WP_table, (2+(i*2)) ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_mastery, fields.WP_table, (2+(i*2)) ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_backstab, fields.WP_table, (2+(i*2)) ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_strBonus, fields.Ammo_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_name, fields.Ammo_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_dmgAdj, fields.Ammo_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_dmgSM, fields.Ammo_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_dmgL, fields.Ammo_table, i ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_qty, fields.Ammo_table, i ) + '</tr>';
		}

        content += '</table>}}';
		
		sendFeedback( content );
		return;		
	}
	
    /**
     * Function to allow players to redo initiative
     * TODO handle a configurable callback to the DM to allow or otherwise
     * a player to redo initiative
     **/
   
    var doRedo = function( args ) {
        
        if (!args)
            {return;}
            
        if (args.length !== 1) {
            sendDebug( 'doRedo: invalid number of arguments' );
            sendError( 'Invalid initMaster syntax' );
        }
        
        var tidyCmd,
            tokenName,
            charCS,
            prevRoundObj,
            tokenID = args[0];
            
        if (!(charCS = getCharacter( tokenID ))) {
            sendDebug( 'doRedo: tokenID is not a character' );
            sendError( 'Invalid initMaster redo request' );
            return;
        }
        
        tokenName = getObj( 'graphic', tokenID ).get('name');
        prevRoundObj = attrLookup( charCS, ['prev-round'+tokenID, null], null, null, null, true );
        
        if (!prevRoundObj) {
            sendDebug('doRedo: prev-round'+tokenID+' not defined');
            sendError( 'Invalid initMaster redo request' );
            return;
        }

        prevRoundObj.set( 'current', 0 );
        
        tidyCmd = fields.roundMaster+' --removefromtracker ' + tokenName + '|' + tokenID + '|0';
        sendInitAPI( tidyCmd );
        
        sendParsedMsg( 'initMaster', Init_Messages.redoMsg, tokenID );
        
    };


    /**
     * Function to set the current round.  generally used as an
     * internal call from the !rm roundMaster API to notify
     * initMaster of the new round
     **/
   
     var doIsRound = function(args) {
        if (!args)
            {return;}
        
        if (args.length < 1 || args.length > 2) {
			sendDebug('doIsRound: Invalid number of arguments');
			sendError('Invalid initMaster syntax');
			return;
        }
        
        var round = parseInt(args[0],10),
            changedRound = (args[1] || false);
        
        if (_.isNaN(round)) {
			sendDebug( 'doIsRound: invalid round number' );
			sendError( 'Invalid initMaster attributes' );
			return;
        }
        
        state.initMaster.round = round;
        state.initMaster.changedRound = changedRound;
        return;
     }
	 
	/**
	* Function to handle initiatives where a previous initiative has been
	* for an action that will take more than 1 round (or 10 segments), but
	* give the player the option to abort the action and select from the 
	* initiative menu called instead.
	**/
	
	var doCarryOver = function( tokenID, charCS, initMenu ) {

		var init_speed = (attrLookup( charCS, fields.Init_carrySpeed ) || 0),
			init_action = (attrLookup( charCS, fields.Init_carryAction ) || 'doing nothing'),
			init_actionnum = (attrLookup( charCS, fields.Init_carryActNum ) || 1),
			weapno = (attrLookup( charCS, fields.Init_carryWeapNum ) || 0),
			init_preinit = (attrLookup( charCS, fields.Init_carryPreInit ) || 0),
			changedRound = state.initMaster.changedRound,
			round = state.initMaster.round,
			prevRound = (attrLookup( charCS, ['prev-round'+tokenID, 'current'], null, null, null, true ) || 0),
			init_submitVal = (changedRound || (prevRound != round) ? 1 : 0 ),
			content;
			
		setAttr( charCS, fields.Init_speed, init_speed );
		setAttr( charCS, fields.Init_action, init_action );
		setAttr( charCS, fields.Init_actNum, init_actionnum );
		setAttr( charCS, fields.Weapon_num, weapno );
		setAttr( charCS, fields.Init_preInit, init_preinit );
		setAttr( charCS, fields.Init_submitVal, init_submitVal );
		setAttr( charCS, fields.Init_chosen, 1 );
		setAttr( charCS, fields.Init_done, 0 );

		content = '&{template:2Edefault}'
				+ '{{name=What is ' + getObj( 'graphic', tokenID ).get('name') + ' doing?}}'
				+ '{{subtitle=Continue Long Action}}'
				+ '{{desc=Continue ' + init_action + ' for '
				+ '<span style=' + design.boxed_number + '>' + Math.ceil(init_speed/10) + '</span>'
				+ ' more rounds or do something else?}}'
				+ '{{desc1=[Continue](!init --button ' + BT.SUBMIT + '|' + tokenID + '|-1|' + MenuType.CARRY + ')'
				+ ' [Something Else](!init --button ' + BT.CARRY + '|' + tokenID + '|-1|' + initMenu + ')}}';
				
		sendResponse( charCS, content );
		return;	
	};
	
	/**
	* Internal command function to accept rolled parameters
	* and display a menu with the Submit button enabled after
	* handling an action selection.
	**/

	var doBuildMenu = function( args ) {
		
		if (!args) {
			return;
		}
		if (args.length < 8) {
			sendDebug('doBuildMenu: Invalid number of arguments');
			sendError('Invalid initMaster syntax');
			return;
		};
		var menu = args[0],
			tokenID = args[1],
			charCS;
			
		if (!(charCS = getCharacter( tokenID ))) {
			sendDebug( 'doBuildMenu: invalid character' );
			sendError( 'Invalid initMaster attributes' );
			return;
		}
//		setInitVars( charCS, args, (menu == MenuType.MW_SECOND ? 'max' : 'current') );
		setInitVars( charCS, args, 'current');
		buildMenu( menu, charCS, MenuState.ENABLED, args );
		return;
	}

	/*
	* Function to display the menu for doing initiative.
	*/

	var doInitMenu = function( args, initMenu ) {
		if (!args || !initMenu)
			{return;}

		if (args.length !== 1) {
			sendDebug('doInitMenu: Invalid number of arguments');
			sendError('Invalid initMaster syntax');
			return;
		};

		var tokenID = args[0],
			curToken = getObj( 'graphic', tokenID ),
			charID,
			charCS,
			init_carry;

		if (!(charCS = getCharacter( tokenID ))) {
			sendDebug( 'doInitMenu: invalid character' );
			sendError( 'Invalid initMaster attributes' );
			return;
		}
		
//		init_carry = parseInt(attrLookup( charCS, 'init-carry', 'current' ));
//		if (init_carry !== 0) {
//			doCarryOver( tokenID, charCS, initMenu );
//			return;
//		}

		var content = '',
		    charName = charCS.get('name'),
			tokenName = curToken.get('name'),
			changedRound = state.initMaster.changedRound,
			roundCounter = state.initMaster.round,
			prevRound = (attrLookup( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], true ) || 0),
			init_submitVal = (changedRound || (prevRound != roundCounter) ? 1 : 0 );
			
		setAmmoFlags( charCS );
		setAttr( charCS, fields.Init_done, 0 );
		setAttr( charCS, fields.Init_submitVal, init_submitVal );

		if (!init_submitVal) {
			sendParsedMsg( 'InitMaster', Init_Messages.doneInit, tokenID );
			return;
		};
		
		init_carry = parseInt(attrLookup( charCS, fields.Init_carry ));
		if (init_carry !== 0) {
			doCarryOver( tokenID, charCS, initMenu );
			return;
		}

        args.unshift(initMenu);
		args[2] = -1;
		
		buildMenu( initMenu, charCS, MenuState.ENABLED, args );
		return;

    };

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, senderId ) {
		if (!args)
			{return;}

		if (args.length < 1 || args.length > 10) {
			sendDebug('doButton: Invalid number of arguments');
			sendError('Invalid initMaster syntax');
			return;
		}

		var	content = '',
		    curToken, charID, charCS,
			setVars, 
		    handler = args[0],
			tokenID = args[1];

		if (!(charCS = getCharacter( tokenID ))) {
			sendDebug( 'doButton: tokenID does not specify a character' );
			sendError( 'Invalid button' );
			return;
		}
		switch (handler) {

			case BT.MON_ATTACK :
			
				// Handle the results of pressing a 'monster attack' button
				
				handleInitMonster( Monster.SIMPLE, charCS, args );
				break;

			case BT.MON_INNATE :
			
				// Handle the results of pressing a complex 'monster attack' button
				
				handleInitMonster( Monster.COMPLEX, charCS, args );
				break;

			case BT.MELEE :

				// Handle the results of pressing a character melee weapon initiative button
		
				handleInitMW( CharSheet.CHARACTER, charCS, args );
				break;
			
			case BT.MON_MELEE :

				// Handle the results of pressing a complex monster melee weapon initiative button
		
				handleInitMW( CharSheet.MONSTER, charCS, args );
				break;
			
			case BT.TWOWEAPONS :
			
				// Handle switching to the twoWeaponsMenu for fighters
				
			case BT.MW_PRIME :
			case BT.RW_PRIME :
			
				// Handle selection of the first of two weapons to use
				
				handlePrimeWeapon( charCS, args );
				break;
				
			case BT.MW_SECOND :
			case BT.RW_SECOND :
			
				// Handle selection of the second of two weapons to use
				
				handleSecondWeapon( charCS, args );
				break;
				
			case BT.ONEWEAPON :
			
				// Handle returning to selecting a single weapon
				
				handleInitMW( CharSheet.CHARACTER, charCS, args );
				break;
			
            case BT.ALLWEAPONS :
                
                // Handle a multi-handed character/monster attacking with all weapons
                
                makeWeaponMenu( charCS, false, args );
                break;

			case BT.RANGED :

				// Handle the results of pressing a character ranged weapon initiative button
		
				handleInitRW( CharSheet.CHARACTER, charCS, args );
				break;
				
			case BT.MON_RANGED :

				// Handle the results of pressing a complex monster ranged weapon initiative button
		
				handleInitRW( CharSheet.MONSTER, charCS, args );
				break;
				
			case BT.MU_SPELL :
			
				// Handle the results of pressing a MU spell initiative button
				
				handleInitSpell( Caster.WIZARD, charCS, args );
				break;
				
			case BT.PR_SPELL :
				
				// Handle the results of pressing a PR spell initiative button
				
				handleInitSpell( Caster.PRIEST, charCS, args );
				break;
				
			case BT.POWER :
			
				// Handle the results of pressing a Power initiative button
				
				handleInitPower( charCS, args );
				break;
				
			case BT.MI_BAG :
			
				// Handle the results of pressing a MIBag initiative button
				
				handleInitMIBag( charCS, args );
				break;
				
			case BT.THIEF :
			
				// Handle the results of pressing a Thieving initiative button
				
				handleInitThief( charCS, args );
				break;
				
			case BT.OTHER :

				// Handle the results of pressing the buttons on the 'Other' menu
				
				handleOtherActions( charCS, args );
				break;
				
			case BT.CARRY :

				// Handle a Carry situation (action longer than 1 round)
				
				handleInitCarry( tokenID, charCS, args[3] );
				break;
				
			case BT.SUBMIT :

				// Handle the results of pressing any Submit button

				handleInitSubmit( senderId, charCS, args );
				break;
				
			default:
				sendDebug( 'doButton: invalid action name for switch - "' + handler + '"' );
				sendError( 'Invalid initMaster button' );
		
		};

	};

// ------------------------------------- process messages from chat ------------------------------------	
           
	/**
	 * Handle chat message event
	 * Allows multiple actions per call
	 * This allows procedural/linear processing of activity and overcomes
	 * some of the limitations of Roll20 asynchronous processing
	 */ 
	 

	var handleChatMessage = function(msg) { 
		var args = processInlinerolls(msg),
			senderId = msg.playerid,
			selected = msg.selected,
			isGM = (playerIsGM(senderId) || state.commandMaster.debug === senderId);
			
		if (args.indexOf('!init') !== 0)
			{return;}

        sendDebug('initMaster called');

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
		}

		args = args.split(' --');
		args.shift();
		
		_.each(args, function(e) {
			var arg = e, i=arg.indexOf(' '), cmd, argString;
//			log('CommandMaster processing arg: '+arg);
			sendDebug('Processing arg: '+arg);
			
			cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
			argString = (i<0 ? '' : arg.substring(i+1).trim());
			arg = argString.split('|');
			
//			log('commandMaster parsed to '+cmd+' '+argString);

			try {
				switch (cmd) {
				case 'weapon':
        			doInitMenu(arg,MenuType.WEAPON);
					break;
	    		case 'monster':
		    		doInitMenu(arg,MenuType.SIMPLE);
					break;
	    		case 'complex':
		    		doInitMenu(arg,MenuType.COMPLEX);
					break;
	    		case 'muspell':
		    		doInitMenu(arg,MenuType.MUSPELL);
					break;
	    		case 'prspell':
		    		doInitMenu(arg,MenuType.PRSPELL);
					break;
	    		case 'power':
		    		doInitMenu(arg,MenuType.POWER);
					break;
	    		case 'mibag':
		    		doInitMenu(arg,MenuType.MIBAG);
					break;
	    		case 'thief':
		    		doInitMenu(arg,MenuType.THIEF);
					break;
	    		case 'other':
		    		doInitMenu(arg,MenuType.OTHER);
					break;
	    		case 'menu':
		    		doInitMenu(arg,MenuType.MENU);
					break;
	    		case 'monmenu':
		    		doInitMenu(arg,MenuType.MONSTER_MENU);
					break;
	    		case 'redo':
		    		doRedo(arg);
					break;
	    		case 'button':
		    		doButton(arg,senderId);
					break;
	    		case 'buildmenu':
		    		doBuildMenu(arg);
					break;
	    		case 'isround':
		    		if (isGM) doIsRound(arg);
					break;
	    		case 'disp-weaps':
		    		doDispWeaps(arg);
					break;
    			case 'help':
    				showHelp();
					break;
    			case 'relay':
    				doRelay(argString,senderId); 
					break;
    			case 'debug':
    				// RED: v1.207 allow anyone to set debug and who to send debug messages to
    				doSetDebug(argString,senderId);
					break;
				default:
    			    sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
    				showHelp(); 
    			}
			} catch (e) {
				sendDebug('InitiativeMaster handleChatMsg: caught JavaScript error');
				sendError('initiativeMaster JavaScript '+e.name+': '+e.message);
			}
    	});
	};
	
// ---------------------------------- register with Roll20 event handler ---------------------------------

	/*
	 * Register attackMaster API with the
	 * commandMaster API
	 */
	 
	var cmdMasterRegister = function() {
		var cmd = fields.commandMaster
				+ ' --register Do_Initiative|Specify what character will do in current round and roll initiative|init|~~menu|`{selected|token_id}'
				+ ' --register Do_Complex_Monster_Init|Specify initiative for a Monster with both inate and weapon attacks|init|~~complex|`{selected|token_id}'
				+ ' --register Do_Monster_Init|Specify simple monster initiative|init|~~monster|`{selected|token_id}';
		sendInitAPI( cmd );
		return;
	};

	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		cmdMasterRegister();
	};
 
	return {
		init: init,
		registerAPI: registerAPI
	};
 
}());

on("ready", function() {
	'use strict'; 
	initMaster.init(); 
	initMaster.registerAPI();
});