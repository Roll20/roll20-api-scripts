/**
 * magicMaster.js
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
 * The goal of this script is to create and automate aspects of magic item
 * discovery, storage & use, initially for the ADnD 2e game in Roll20
 * 
 * v0.001  25/11/2020  Initial creation from redtrackerjacker.js stripped down
 * v0.002  30/11/2020  Working version with unused functions stripped
 * v0.003  08/12/2020  Fixed a bug when a character sheet does not have the 
 *                     sheet-flags field created, causing the API to crash
 * v0.004  12/12/2020  Allowed all players to use !magic commands
 * v0.005  14/12/2020  Added setAttr function to save attributes and not need
 *                     ChatSetAttr unless to create an attribute
 * v0.007  06/01/2021  Continued adding the Pick-or-Put functions from the macros
 * v0.008  10/01/2021  Converted to use tokenIDs as parameters to fit with standards
 *                     rather than characterIDs, and made all --button arguments
 *                     a standard format.  Add a short menu option.
 * v0.009  11/01/2021  Adding support for picking pockets and traps
 * v1.010  13/01/2021  Added capability to view the gold and treasure in
 *                     a looted target
 * v1.011  21/01/2021  TODO Added menus for editing the Magic Item bag contents
 * v1.012  05/02/2021  Added commands to allow a MI to alter the light
 *                     settings of a character, and a menu for players
 *                     to have torches, lanterns & continual light gems
 * v1.013  11/02/2021  If a controlling player is not online, send messages to
 *                     the GM as they are probably testing the character.
 * v1.014  11/02/2021  Programmed the DM-only-Change-MI macro, so that it
 *                     works well for DMs without alerting players.
 * v2.001  14/02/2021  Merged with the spellMaster draft API and renamed
 *                     magicMaster.  It will handle all Magic Items, spells & powers.
 * v2.002  19/02/2021  Changed spell functions to accept 2 parameters: type and tokenIDs
 *                     Also added spell menus.
 * v2.003  20/02/2021  Corrected how spell macros are called, as sendChat() did not work.
 *                     Also programmed spellcaster rests
 * v2.004  24/02/2021  Added all Power capabilities, using the same or similar handlers
 *                     as spell use.
 * v2.005  26/02/2021  Added Edit Magic Items Powers capability.
 * v2.006  28/02/2021  Changed used spells & powers to display name rather than '-' but
 *                     grayed out though still selectable if viewing or memorising
 * v2.007  03/03/2021  Fixed errors in recent coding.  Simplified looting.
 * v2.008  06/03/2021  Added view and use Magic Items.
 * v2.009  10/03/2021  Added the manage MI menu, and multi-database concatenation.
 * v2.010  11/03/2021  Started looking at coding Magic Items that can store spells
 * v2.011  13/03/2021  Added error handling to v2.009 code that overcame Roll20
 *                     issue with findObjs() not always finding existing ability objects,
 *                     then merged in v2.010 updates to create v2.011.  Also added
 *                     Magic Item Powers.
 * v2.012  16/03/2021  Added ability to decrement additional charges from a magic item,
 *                     for instance when using a magic item optional power
 */
 
var magicMaster = (function() {
	'use strict'; 
	var version = 2.0012,
		author = 'RED',
		pending = null;

	var MIB_StateEnum = Object.freeze({
		NOBAG: 0,
		OLDBAG: 6,
		V4BAG: 12,
	});

	var PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	var messages = Object.freeze({
		header: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}',
		restHeader: '&{template:2Edefault} {{name=^^cname^^ is Resting}}',
		noChar: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Items Bag}}{{desc=^^cname^^ does not have an associated Character Sheet, and so cannot have a Magic Item Bag.}}',
		noMIBag: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Items Bag}}{{desc=^^cname^^ does not have a Magic Item bag!  Perhaps you ought to invest in one...  Go and find an appropriate vendor (ask the DM).}}',
        oldMIBag: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=^^cname^^ has an old v3 Magic Item bag, which will not hold the latest, cutting edge Magic Items!  Perhaps you ought to invest in a new one...  Go and find an appropriate vendor (ask the DM).}}',
		cursedSlot: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh what a shame.  No, you can\'t overwrite a cursed item with a different item.  You\'ll need a *Remove Curse* spell or equivalent to be rid of it!}}',
        cursedItem: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try putting this away, but is seems to be back where it was...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		nothingToPick: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=You seem to be trying to pick up something invisible, even to me! I can\'t pick up thin air...}}',
		slotFull: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=The slot you chose is already full.}}',
		fruitlessSearch: 'does not have a store of Magic Items}}',
		noSpellbooks: '&{template:2Edefault} {{name=Spellbooks}}{{desc=^^cname^^ does not have any spellbooks!}}',
		noMUspellbook: '&{template:2Edefault} {{name=Spellbooks}}{{desc=^^cname^^ does not have a Wizard\'s spellbook.  Do they want one?  Speak to the Arch-Mage (or, failing that, the DM)}}',
		noPRspellbook: '&{template:2Edefault} {{name=Spellbooks}}{{desc=^^cname^^ does not have a Priest\'s spellbook.  Do they want one?  Pray to your god (or, failing that, the DM)}}',
		chooseSpellMenu: '&{template:2Edefault} {{name=Spellbooks}}{{desc=^^cname^^ has both Wizard and Priest spellbooks.  Which do you want to use?}}{{desc1=[Wizard](!magic --spellmenu ^^tid^^|MU) or [Priest](!magic --spellmenu ^^tid^^|PR)}}',
		shortRest: '&{template:2Edefault} {{name=^^cname^^ is Resting}}{{desc=After a short rest, ^^cname^^ has rememorised all their 1st level spells}}',
		longRest: 'After a good long rest, ^^cname^^ has regained their powers, read their spellbooks and rememorised their spells, and magic items that recharge have regained their charges.}}',
		noLongRest: '&{template:2Edefault} {{name=^^cname^^ is Unable to Rest}}{{desc=I don\'t think the DM has declared it is time for a rest yet, perhaps due to system lag.}}{{desc1=[Try Again](!magic --rest ^^tid^^|long) once the DM says you can}}',
		noMoreCharges: '&{template:2Edefault} {{name=^^cname^^ Has No Charges}}{{desc=^^cname^^ has used all the charges of the Power, Spell or Magic Item that they are using, and needs to rest before any charges are available again.}}',
		miBagFull: '&{template:2Edefault} {{name=^^cname^^ MI Bag Full}}{{desc=There are no slots left in the selected container for any more items to store}}',
	});

	var BT = Object.freeze({
		MON_ATTACK:		'MON_ATTACK',
		MON_INNATE:		'MON_INNATE',
		MON_MELEE:		'MON_MELEE',
		MELEE:			'MELEE',
		MW_DMGSM:		'MW_DMGSM',
		MW_DMGL:		'MW_DMGL',
		MON_RANGED:		'MON_RANGED',
		RANGED:			'RANGED',
		RANGEMOD:		'RANGEMOD',
		RW_DMGSM:		'RW_DMGSM',
		RW_DMGL:		'RW_DMGL',
		MI_SPELL:       'MI_SPELL',
		MI_POWER_USED:	'MI_POWER_USED',
		MU_SPELL:		'MU_SPELL',
		MU_TO_STORE:	'MU_TO_STORE',
		MU_MI_SLOT:		'MU_MI_SLOT',
		PR_SPELL:		'PR_SPELL',
		PR_TO_STORE:	'PR_TO_STORE',
		PR_MI_SLOT:		'PR_MI_SLOT',
		CAST_MUSPELL:	'CAST_MUSPELL',
		CAST_PRSPELL:	'CAST_PRSPELL',
		CAST_MISPELL:   'CAST_MISPELL',
		CHOOSE_MUSPELL:	'CHOOSE_MUSPELL',
		CHOOSE_PRSPELL:	'CHOOSE_PRSPELL',
		CHOOSE_POWER:	'CHOOSE_POWER',
		CHOOSE_MI:		'CHOOSE_MI',
		REDO_CHOOSE_MI: 'REDO_CHOOSE_MI',
		CHOOSE_VIEW_MI:	'CHOOSE_VIEW_MI',
		CHOOSE_USE_MI:	'CHOOSE_USE_MI',
		REVIEW_MUSPELL:	'REVIEW_MUSPELL',
		REVIEW_PRSPELL:	'REVIEW_PRSPELL',
		REVIEW_POWER:	'REVIEW_POWER',
		REVIEW_MI:		'REVIEW_MI',
		REVIEW_MIPOWER:	'REVIEW_MIPOWER',
		SLOT_MUSPELL:	'SLOT_MUSPELL',
		SLOT_PRSPELL:	'SLOT_PRSPELL',
		SLOT_POWER:		'SLOT_POWER',
		SLOT_MI:		'SLOT_MI',
		MEM_MUSPELL:	'MEM_MUSPELL',
		MEM_PRSPELL:	'MEM_PRSPELL',
		MEM_POWER:		'MEM_POWER',
		MEM_MIPOWER:	'MEM_MIPOWER',
		EDIT_MUSPELLS:	'EDIT_MUSPELLS',
		EDIT_PRSPELLS:	'EDIT_PRSPELLS',
		EDIT_POWER:		'EDIT_POWER',
		EDIT_MI:		'EDIT_MI',
		EDITMI_OPTION:  'EDITMI_OPTION',
		EDIT_MIPOWER:	'EDIT_MIPOWER',
		REMOVE_MUSPELL:	'REMOVE_MUSPELL',
		REMOVE_PRSPELL:	'REMOVE_PRSPELL',
		REMOVE_POWER:	'REMOVE_POWER',
		REMOVE_MI:		'REMOVE_MI',
		STORE_MI:		'STORE_MI',
		MISTORE_MUSPELL:'MISTORE_MUSPELL',
		MISTORE_PRSPELL:'MISTORE_PRSPELL',
		VIEW_MUSPELL:	'VIEW_MUSPELL',
		VIEW_PRSPELL:	'VIEW_PRSPELL',
		VIEW_POWER:		'VIEW_POWER',
		VIEW_MI:		'VIEW_MI',
		VIEWMI_OPTION:  'VIEWMI_OPTION',
		VIEWMEM_MUSPELLS:'VIEWMEM_MUSPELLS',
		VIEWMEM_PRSPELLS:'VIEWMEM_PRSPELLS',
		VIEWMEM_POWER:	'VIEWMEM_POWER',
		POP_PICK:		'POP_PICK',
		POP_STORE:		'POPsubmit',
		PICKMI_OPTION:	'PICKMI_OPTION',
		PUTMI_OPTION:	'PUTMI_OPTION',
		POWER:			'POWER',
		USE_POWER:		'USE_POWER',
		USE_MI:			'USE_MI',
		USEMI_OPTION:   'USEMI_OPTION',
		MI_BAG:			'MI_BAG',
		THIEF:			'THIEF',
		MOVE:			'MOVE',
		CHG_WEAP:		'CHG_WEAP',
		STAND:			'STAND',
		SPECIFY:		'SPECIFY',
		CARRY:			'CARRY',
		SUBMIT:			'SUBMIT',
	});
	
	var fields = Object.freeze({
		feedbackName:       'magicMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		MagicItemDB:        'MI-DB',
		MU_SpellsDB:		'MU-Spells-DB',
		PR_SpellsDB:		'PR-Spells-DB',
		PowersDB:			'PowersDB',
		GlobalVarsDB:		'Money-Gems-Exp',
		PowersDB:			'Powers-DB',
		roundMaster:        '!rounds',
		attackMaster:       '!attk',
		Fighter_class:      ['class1','current'],
		Fighter_level:      ['level-class1','current'],
		Wizard_level:       ['level-class2','current'],
		Priest_level:       ['level-class3','current'],
		Rogue_level:        ['level-class4','current'],
		Psion_level:        ['level-class5','current'],
		Expenditure:		['expenditure','current'],
		Thac0:              ['bar2','value'],
		LightSource:        ['lightsource','current'],
		initMultiplier:     ['comreact','max'],
		initMod:            ['comreact','current'],
		Strength_hit:       ['strengthhit','current'],
		Strength_dmg:       ['strengthdmg','current'],
		Dmg_magicAdj:       ['strengthdmg','max'],
		Wisdom:				['wisdom','current'],
		Dex_missile:        ['dexmissile','current'],
		Dex_react:          ['dexreact','current'],
		Backstab_mult:      ['backstabmultiplier','current'],
		MWfirstRowNamed:    true,
		MW_table:           ['repeating_weapons','current'],
		MW_name:            ['weaponname','current'],
		MW_speed:           ['weapspeed','current'],
		MW_noAttks:         ['attacknum','current'],
		MW_attkAdj:         ['attackadj','current'],
		MW_strBonus:        ['strbonus','current'],
		MW_profLevel:       ['prof-level','current'],
		MW_crit:            ['crit-thresh','current'],
		MWdmgFistRowNamed:  true,
		MW_dmgTable:        ['repeating_weapons-damage','current'],
		MW_dmgName:         ['weaponname1','current'],
		MW_dmgAdj:          ['damadj','current'],
		MW_dmgSM:           ['damsm','current'],
		MW_dmgL:            ['daml','current'],
		MW_dmgStrBonus:     ['strBonus1','current'],
		MW_dmgSpecialist:   ['specialist-damage','current'],
		RWfirstRowNamed:    true,
		RW_table:           ['repeating_weapons2','current'],
		RW_name:            ['weaponname2','current'],
		RW_speed:           ['weapspeed2','current'],
		RW_noAttks:         ['attacknum2','current'],
		RW_attkAdj:         ['attackadj2','current'],
		RW_strBonus:        ['strbonus2','current'],
        RW_dexBonus:        ['dexbonus2','current'],
		RW_profLevel:       ['prof-level2','current'],
		RW_crit:            ['crit-thresh2','current'],
		RW_range:           ['range2','current'],
		AmmoFirstRowNamed:  true,
		Ammo_table:         ['repeating_ammo','current'],
		Ammo_name:          ['ammoname','current'],
		Ammo_strBonus:      ['strbonus3','current'],
		Ammo_dmgAdj:        ['damadj2','current'],
		Ammo_dmgSM:         ['damsm2','current'],
		Ammo_dmgL:          ['daml','current'],
		Ammo_indirect:      ['Ammo-RW','current'],
		Ammo_qty:           ['ammoremain','current'],
		Ammo_flag:          ['ammo-flag-RW','current'],
		WPfirstRowNamed:    true,
		WP_table:           ['repeating_weaponprofs','current'],
		WP_specialist:      ['specialist','current'],
		WP_mastery:         ['mastery','current'],
		WP_backstab:        ['chosen-weapon','current'],
		SpellsFirstColNum:  false,
		MUSpellNo_table:	['spell-level','current'],
		MUSpellNo_total:	['-total','current'],
		MUSpellNo_memable:	['-castable','current'],
		MUSpellNo_specialist:['-specialist','current'],
		MUSpellNo_misc:		['-misc','current'],
		MUbaseCol:          1,
		PRSpellNo_table:	['spell-priest-level','current'],
		PRSpellNo_total:	['-total','current'],
		PRSpellNo_memable:	['-castable','current'],
		PRSpellNo_wisdom:	['-wisdom','current'],
		PRSpellNo_misc:		['-misc','current'],
		PRbaseCol:          28,
		SpellsCols:         3,
		Spells_table:       ['repeating_spells','current'],
		Spells_name:        ['spellname','current'],
		Spells_db:			['spellname','max'],
		Spells_speed:       ['casttime','current'],
		Spells_cost:		['casttime','max'],
		Spells_castValue:	['cast-value','current'],
		Spells_castMax:		['cast-max','current'],
		Spells_storedLevel:	['spell-points','current'],
		Spells_msg:			['cast-macro','current'],
		SpellToMem:			['spelltomem','current'],
		SpellRowRef:		['spellrowref','current'],
		SpellColIndex:		['spellref','current'],
		SpellCharges:		['spellcharges','current'],
		SpellChosen:		['spell-chosen','current'], 
		Casting_level:      ['casting-level','current'],
		Casting_name:       ['casting-name','current'],
		Spellbook:          ['spellmem','current'],
		PowersFirstColNum:  true,
		PowersBaseCol:      67,
		PowersCols:         3,
		Powers_MIPowers:	27,
		Powers_table:       ['repeating_spells','current'],
		Powers_name:        ['spellname','current'],
		Powers_speed:       ['casttime','current'],
		Powers_castValue:	['cast-value','current'],
		Powers_castMax:		['cast-max','current'],
		Power_cast:			['spell-cast','current'],
		MIFirstRowNum:      true,
		MIRows:             24,
		MIPowersRows:		9,
		MIspellLevel:       15,
		MI_table:           ['repeating_potions','current'],
		MI_name:            ['potion','current'],
		MI_trueName:        ['potion','max'],
		MI_speed:           ['potion-speed','current'],
		MI_trueSpeed:       ['potion-speed','max'],
		MI_qty:             ['potionqty','current'],
		MI_trueQty:         ['potionqty','max'],
		MI_cost:            ['potion-macro','current'],
		MI_type:            ['potion-macro','max'],
		MI_ContainerType:   ['check-for-mibag','current'],
		MI_WeaponList:      ['spellmem','current'],
		MI_ArmourList:      ['spellmem2','current'],
		MI_RingList:        ['spellmem3','current'],
		MI_MiscList:        ['spellmem4','current'],
		MI_PotionList:      ['spellmem10','current'],
		MI_ScrollList:      ['spellmem11','current'],
		MI_WandsList:       ['spellmem13','current'],
		MI_DMList:			['spellmem12','current'],
		Money_gold:         ['gold','current'],
		Money_silver:       ['silver','current'],
		Money_copper:       ['copper','current'],
		Money_treasure:		['otherval','current'],
		Monster_speed:      ['monsterini','current'],
		Armor_name:         ['armorname','current'],
		Armor_mod_none:     'noarmort',
		Armor_mod_leather:  't',
		Armor_mod_studded:  'armort',
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
	
	var flags = {
		mib_state: MIB_StateEnum.STOPPED, image: false,
		archive: false,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v1.207 determine if MI-DB character sheet is present
		FoundMagicItemDB: true,
	};
	
	var dB = {
		miDB: false,
		muDB: false,
		prDB: false,
		pwDB: false,
		dtDB: false,
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
		pw:	[{ spells: 0, base: 0,  book: 0 },
			 { spells: 9, base: 67, book: 23}],
		mi:	[{ spells: 0, base: 0,  book: 0 },
			 { spells: 0, base: 64, book: 22}],
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
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"',
		success_box: '"display: inline-block; background-color: yellow; border: 1px solid lime; padding: 2px; color: green; font-weight: bold;"',
		failure_box: '"display: inline-block; background-color: yellow; border: 1px solid red; padding: 2px; color: maroon; font-weight: bold;"',
	};
	
	var magicMaster_tmp = (function() {
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
		if (!state.magicMaster)
			{state.magicMaster = {};}
		if (!state.magicMaster.attrsToCreate)
			{state.magicMaster.attrsToCreate = {};}
		if (!state.magicMaster.debug)
		    {state.magicMaster.debug = false;}
		if (!state.magicMaster.playerConfig)
			{state.magicMaster.playerConfig = {};}
			
		// RED: v1.301 update the global ID of the Magic Item DB Library
		var miDB = findObjs({ _type: 'character' , name: fields.MagicItemDB });
       		 dB.miDB = false;
		if (miDB) {
			if (miDB.length > 0) {
				dB.miDB = miDB[0];
			}
		}
		
		// RED: v2.001 update the global ID of the Date, Powers, MU and Priest Spell DB Libraries
		var muDB = findObjs({ _type: 'character' , name: fields.MU_SpellsDB }),
			pwDB = findObjs({ _type: 'character' , name: fields.MU_SpellsDB }),
			prDB = findObjs({ _type: 'character' , name: fields.PR_SpellsDB }),
			dateDB = findObjs({ _type: 'character' , name: fields.GlobalVarsDB });
       	dB.muDB = false;
       	dB.prDB = false;
		dB.pwDB = false;
		dB.dtDB = false;
		if (muDB && muDB.length > 0) {
			dB.muDB = muDB[0];
		}
		if (prDB && prDB.length > 0) {
			dB.prDB = prDB[0];
		}
		if (pwDB && pwDB.length > 0) {
			dB.pwDB = pwDB[0];
		}
		if (dateDB && dateDB.length > 0) {
			dB.dtDB = dateDB[0];
		}
		
        // RED: log the version of the API Script

		log(`-=> magicMaster v${version} <=-`);

	}; 
	
// ------------------------------------------------ Deal with in-line expressions --------------------------------
	
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
    var sendmagicMasterAPI = function(msg, senderId) {
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
		sendDebug('sendTjAPI: sending as ' + as + ', msg is ' + msg );
		sendChat(as,msg, null,{noarchive:!flags.archive, use3d:false});
    };

	/**
	 * Function to send an API command to chat
	 * that has '^^parameter^^' replaced by relevant names & ids
	**/
	var sendAPImacro = function(charID,targetID,ability,modifier) {

		if (!charID || !targetID || !ability) {
			sendDebug('sendAPImacro: a parameter is null');
			return;
		}
		modifier = modifier || '';
		var journal,
		    curToken = getObj('graphic',charID),
		    tid = charID,
		    tname = curToken.get('name'),
		    cid = curToken.get('represents'),
		    targetCS = getCharacter(targetID),
		    words;

        journal = getObj( 'character', cid );
		if (targetCS && journal) {
			var cname = journal.get('name'),
			    ac = curToken.get('bar1_value'),
			    thac0 = curToken.get('bar2_value'),
			    hp = curToken.get('bar3_value'),
				abilityMacro = findObjs({ _type : 'ability' , characterid : targetCS.id, name :  ability + modifier }, {caseInsensitive: true});
			if (!abilityMacro || abilityMacro == undefined || abilityMacro.length === 0) {
			    sendDebug('Not found macro ' + targetCS.get('name') + '|' + ability + modifier);
			    return;
			}
			if (!cname) {
				cname = curToken.get('name');
			}
			if (abilityMacro.length > 0) {
				var macroBody = abilityMacro[0].get('action');

				macroBody = macroBody.replace( /\@\{selected\|/gi, '\@{'+cname+'|' );
				macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname );
				macroBody = macroBody.replace( /\^\^tname\^\^/gi , tname );
				macroBody = macroBody.replace( /\^\^cid\^\^/gi , cid );
				macroBody = macroBody.replace( /\^\^tid\^\^/gi , tid );
				macroBody = macroBody.replace( /\^\^bar1_current\^\^/gi , ac );
				macroBody = macroBody.replace( /\^\^bar2_current\^\^/gi , thac0 );
				macroBody = macroBody.replace( /\^\^bar3_current\^\^/gi , hp );
        		sendDebug('sendAPImacro: macroBody is ' + macroBody );
				sendChat("character|"+cid,macroBody,null,{noarchive:!flags.archive, use3d:false});
				
			}
		}
		return;
	};

	/**
	 * Function to send an API command to chat
	 * that has '^^parameter^^' replaced by relevant names & ids
	 * Also replaces
	 * @{selected|token_name} with tname,
	 * @{selected|character_name} with cname,
	 * @{selected|token_id} with tid,
	 * and @{selected| with @{cname|
	**/
	var sendAPImagic = function(tokenID,magicDB,magicName,msg) {

		if (!tokenID || !magicDB || !magicName) {
			sendDebug('sendAPImagic: a parameter is null');
			return;
		}
		var curToken = getObj('graphic',tokenID),
		    tid = tokenID,
		    tname = curToken.get('name'),
		    cid = curToken.get('represents'),
            journal = getObj( 'character', cid );
        
		if (journal) {
			var cname = journal.get('name'),
			    ac = curToken.get('bar1_value'),
			    thac0 = curToken.get('bar2_value'),
			    hp = curToken.get('bar3_value'),
				magicMacro = findObjs({ _type : 'ability' , characterid : magicDB.id, name : magicName }, {caseInsensitive: true});
			if (!magicMacro || magicMacro.length === 0) {
			    sendDebug('Not found macro ' + magicDB.get('name') + '|' + magicName);
			    return;
			}
			if (!cname) {
				cname = curToken.get('name');
			}
			var macroBody = magicMacro[0].get('action')+(msg?msg:'');

			macroBody = macroBody.replace( /\@\{selected\|token_name\}/gi , tname );
			macroBody = macroBody.replace( /\@\{selected\|token_id\}/gi , tid );
			macroBody = macroBody.replace( /\@\{selected\|character_name\}/gi , cname );
			macroBody = macroBody.replace( /\@\{selected\|character_id\}/gi , cid );
			macroBody = macroBody.replace( /\@\{selected\|/gi, '\@{'+cname+'|' );
			macroBody = macroBody.replace( /\^\^tname\^\^/gi , tname );
			macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname );
			macroBody = macroBody.replace( /\^\^cid\^\^/gi , cid );
			macroBody = macroBody.replace( /\^\^tid\^\^/gi , tid );
			macroBody = macroBody.replace( /\^\^bar1_current\^\^/gi , ac );
			macroBody = macroBody.replace( /\^\^bar2_current\^\^/gi , thac0 );
			macroBody = macroBody.replace( /\^\^bar3_current\^\^/gi , hp );
//        		sendDebug('sendAPImacro: macroBody is ' + macroBody );
	        sendChat("character|"+cid,macroBody,null,{noarchive:!flags.archive, use3d:false});
		}
		return;
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
	};

	/**
	 * Sends a response to everyone who controls the character
	 * RED: v0.012 check the player(s) controlling the character are valid for this campaign
	 * if they are not, send to the GM instead - Transmogrifier can introduce invalid IDs
	 * RED: v1.013 check if the controlling player(s) are online.  If they are not
	 * assume the GM is doing some testing and send the message to them.
	 */
	
	var sendResponse = function(charCS,msg,as,img) {
		if (!msg) 
			{return null;}
		var to, content, controlledBy, players, isPlayer=false; 
		controlledBy = charCS.get('controlledby');
		if (controlledBy.length > 0) {
		    controlledBy = controlledBy.split(',');
		    isPlayer = _.some( controlledBy, function(playerID) {
    		    players = findObjs({_type: 'player', _id: playerID, _online: true});
    		    return (players && players.length > 0);
    		});
		};
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
	 * RED: v1.014 Send a message to the player (rather than the character)
	 */

	var sendResponsePlayer = function(pid,msg,as,img) {
		sendResponseError(pid,msg,as,img);
		return;
	}
	 
	/*
	 * Send an error message to the identified player.
	 * RED: v1.013 If that player is not online, send to the GM
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
	    if (!!state.magicMaster.debug) {
	        var player = getObj('player',state.magicMaster.debug),
	            to;
    		if (player) {
	    		to = '/w "' + player.get('_displayname') + '" ';
		    } else 
		    	{throw ('sendDebug could not find player');}
		    if (!msg)
		        {msg = 'No debug msg';}
    		sendChat('magicMaster Debug',to + '<span style="color: red; font-weight: bold;">'+msg+'</span>',null,{noarchive:!flags.archive, use3d:false}); 
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
    	    state.magicMaster.debug = senderId;
            sendResponseError(senderId,'magicMaster Debug set on for ' + playerName,'magicMaster Debug');
	        sendDebug('Debugging turned on');
	    } else {
    	    sendResponseError(senderId,'magicMaster Debugging turned off','magicMaster Debug');
	        state.magicMaster.debug = false;
	    }
	};

    /**
     * Pare a message with ^^...^^ parameters in it and send to chat
     * This allows character and token names for selected characters to be sent
     * Must be called with a validated tokenID
    */
    
    var sendParsedMsg = function( tid, msg, msgFrom ) {
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

	/**
	 * Display a message when a character has picked up a magic item
	 **/

	var pickupMessage = function( args, miName, miType, pickedQty, fromCharges, toCharges ) {
	
		var tokenID = args[1],
		    fromID = args[3],
		    toID = args[4],
		    cost = parseFloat(args[7]),
		    charCS = getCharacter( tokenID ),
		    picking = (tokenID == toID),
		    content, pickOrPut, charges;
		    
		content = '&{template:2Edefault}{{name='+(picking?'Picking Up':'Putting Away')+' Items}}{{desc=';
		    
		if (picking) {
		    pickOrPut = 'picked up ';
		    charges = toCharges;
		} else {
		    pickOrPut = 'put away ';
		    charges = fromCharges;
		}
		
		switch (miType) {
		
		case 'cursed+charged':
		case 'charged':
			content += 'You have '+pickOrPut+pickedQty+' '+miName+', and now have '+charges+' charges';
			break;
			
		case 'cursed+rechargeable':
		case 'rechargeable':
			content += 'You have '+pickOrPut+miName+', a rechargeable item (if you have the skill) with '+toCharges+' charges';
			break;
			
		case 'cursed+recharging':
		case 'recharging':
			content += 'You have '+pickOrPut+miName+', an item with a maximum of '+toCharges+' charges, which regains charges each night';
			break;
			
		case 'cursed':
		case 'uncharged':
		default:
			content += 'You have '+pickOrPut+pickedQty+' '+miName+''+((pickedQty>1)?'s':'')+', and now have '+charges;
			break;
		}
		
		if (cost && !isNaN(cost) && cost > 0) {
		    content += ', at a cost of '+showCost( cost );
		}

		content += '.}}{{desc1=[Pick or put another MI](!magic --pickorput '+tokenID+'|'+fromID+'|'+toID+')}}';
		sendResponse( charCS, content );
		
	}
	
	
// -------------------------------------------- utility functions ----------------------------------------------

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
     * A function to lookup the value of any attribute, including repeating rows, without errors
     * thus avoiding the issues with getAttrByName()
     * 
     * Thanks to The Aaron for this.
	*/

    var attrLookup = function(character,name,property,caseSensitive){
        let match=name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let index=match[2],
                createOrderKeys=[],
                attrMatcher=new RegExp(`^${name.replace(/_\$\d+_/,'_([-\\da-zA-Z]+)_')}$`,(caseSensitive?'i':'')),
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

			if(index<sortOrderKeys.length && _.has(attrs,sortOrderKeys[index])){
				if (_.isUndefined(property) || _.isNull(property) || _.isUndefined(attrs[sortOrderKeys[index]])) {
					return attrs[sortOrderKeys[index]];
				} else {
					return attrs[sortOrderKeys[index]].get(property);
				}
            }
            return undefined;
        }
		let attrObj = findObjs({ type:'attribute', characterid:character.id, name: name}, {caseInsensitive: !caseSensitive})[0];
		if (_.isUndefined(property) || _.isNull(property) || _.isUndefined(attrObj)) {
			return attrObj;
		} else {
			return attrObj.get(property);
		}
    };
	
	/**
	* Check that an attribute exists, set it if it does, or
	* create it if it doesn't using !setAttr
	**/
	
	var setAttr = function( charCS, attrSpec, attrValue, caseSensitive ) {
		
		var attrObj = attrLookup( charCS, attrSpec[0], null, caseSensitive ),
		    createList = !!state.magicMaster.attrsToCreate[charCS.id],
		    createStr;
		
		if (!attrObj) {
		    sendDebug( 'setAttr: ' + attrSpec[0] + ' not found.  Adding to list for creation');
		    createStr = ' --' + attrSpec[0] + (attrSpec[1].toLowerCase() == 'max' ? '|' : '') + '|' + attrValue ;
		    if (createList) {
    			state.magicMaster.attrsToCreate[charCS.id] += createStr;
		    } else {
		        state.magicMaster.attrsToCreate[charCS.id] = createStr;
		    }
			sendDebug( 'setAttr: attrs to create for ' + charCS.get('name') + state.magicMaster.attrsToCreate[charCS.id]);
		} else {
		    sendDebug( 'setAttr: character ' + charCS.get('name') + ' attribute ' + attrSpec[0] + ' ' + attrSpec[1] + ' set to ' + attrValue );
			attrObj.set( attrSpec[1], attrValue );
		}
		return;
	}
	
	/**
	* Create any pending attributes in attrsToCreate using ChatSetAttr
	* rather than build a function myself - though this will only
	* handle simple attributes, not repeating tables
	**/
	
	var createAttrs = function( silent, replace ) {
		
		if (state.magicMaster.attrsToCreate) {
			_.each( state.magicMaster.attrsToCreate, function( attrs, charID ) {
				let setVars = '!setattr ' + ( silent ? '--silent ' : '' ) + ( replace ? '--replace ' : '' ) + '--charid ' + charID;
					setVars += attrs;
				sendDebug( 'createAttrs: creating attributes for ' + getAttrByName( charID, 'character_name' ));
				sendmagicMasterAPI( setVars );
			});
			state.magicMaster.attrsToCreate = {};
		};
	};
	
	/**
	 * Find an ability macro with the specified name in any 
	 * macro database with the specified root name, returning
	 * the database name, and the matching "ct-" object.
	 * If can't find a matching ability macro or "ct-" object
	 * then return undefined objects
	 **/
	 
	var abilityLookup = function( rootDB, abilityName ) {
		
        abilityName = abilityName.toLowerCase();
        rootDB = rootDB.toLowerCase();
	    
        var dBname,
			ctObj,
			magicDB, magicName,
            abilityObj = findObjs({type: 'ability', name: abilityName}, {caseInsensitive:true})
                            .filter(function(obj) {
                                if (!(magicDB = getObj('character',obj.get('characterid')))) {return false;}
                                magicName = magicDB.get('name').toLowerCase();
                    			if ((magicName.indexOf(rootDB) !== 0) || (/\s*v\d*\.\d*/i.test(magicName))) {return false;}
                    			if (!dBname) dBname = magicName;
                    			return true;
                            });
		if (!abilityObj || abilityObj.length === 0) {
			sendError('Not found ability '+abilityName);
			dBname = rootDB;
		} else {
			ctObj = findObjs({ type: 'attribute',
							   name: 'ct-'+abilityName,
							   characterid: abilityObj[0].get('characterid')
							}, {caseInsensitive:true});
			if (!ctObj || ctObj.length === 0) {sendError('Can\'t find ct-'+abilityName+' in '+dBname);}
		}
		return {dB: dBname, obj:abilityObj, ct: ctObj};
	}
	 
	/**
	 * String together the value of the specified attribute from
	 * all macro databases with the specified root name, separated
	 * by |.  This is used to get a complete list of available
	 * magic spell or item macros across all databases of a
	 * specific type.
	 **/
	 
	var getMagicList = function( rootDB, listAttr ) {
		
		var newList, magicList = '';
		filterObjs( function(objs) {
			if (objs.get('type') !== 'character' || objs.get('name').indexOf(rootDB) !== 0) {return false};
			if (/\s*v\d*\.\d*/i.test(objs.get('name'))) {return false};
			newList = attrLookup( objs, listAttr[0], listAttr[1] ) || ' ';
			if (newList.trim().length) magicList += (magicList.length ? '|' : '') + newList;
			return true;
		});
		return magicList.split('|').sort().join('|');
	}

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
			sendError('Invalid magicMaster arguments');
			return undefined;
		};

		curToken = getObj( 'graphic', tokenID );

		if (!curToken) {
			sendDebug('getCharacter: tokenID is not a token');
			sendError('Invalid magicMaster arguments');
			return undefined;
		};
			
		charID = curToken.get('represents');
			
		if (!charID) {
			sendDebug('getCharacter: charID is invalid');
			sendError('Invalid magicMaster arguments');
			return undefined;
		};

		charCS = getObj('character',charID);

		if (!charCS) {
			sendDebug('getCharacter: charID is not for a character sheet');
			sendError('Invalid magicMaster arguments');
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
     * Get the sheet table types for a specific character sheet
     */

    var getSheetTypes = function( charCS ) {

		var sheetTypes = {
				sheetFlags: 0,
				sheetType: 3,
				sheetMUType: 6,
				sheetPRType: 6,
				sheetPowersType: 6,
				sheetMIBagType: 6,
				sheetLangsType: 0,
				sheetNWPType: 0,
				sheetGemsType: 12,
				sheetThiefType: 1
			};
		
		if (!charCS) {
			sendDebug( 'getSheetTypes: invalid charCS passed' );
			sendError( 'Invalid character selected');
			return sheetTypes;
        };
		sheetTypes.sheetFlags = attrLookup( charCS, 'sheet-flags', 'current' );
		
		if (sheetTypes.sheetFlags != 0) {
			sheetTypes.sheetType = attrLookup( charCS, 'sheet-type', 'current' ) || 3;
			sheetTypes.sheetMUType = attrLookup( charCS, 'sheet-mu-spells-type', 'current' ) || 6;
			sheetTypes.sheetPRType = attrLookup( charCS, 'sheet-pr-spells-type', 'current' ) || 6;
			sheetTypes.sheetPowersType = attrLookup( charCS, 'sheet-powers-type', 'current' ) || 6;
			sheetTypes.sheetMIBagType = attrLookup( charCS, 'sheet-mibag-type', 'current' ) || 12;
			sheetTypes.sheetLangsType = attrLookup( charCS, 'sheet-langs-type', 'current' ) || 0;
			sheetTypes.sheetNWPType = attrLookup( charCS, 'sheet-nwp-type', 'current' ) || 0;
			sheetTypes.sheetGemsType = attrLookup( charCS, 'sheet-gems-type', 'current' ) || 12;
			sheetTypes.sheetThiefType = 1;
		}
		
        return sheetTypes;
    };
	
	/**
	 * Set the ammo flags, no ammo = false else true
	 **/
	 
	var setAmmoFlags = function( charCS, sheetTypes ) {
	
		var content = '',
		    i,
		    ammoQty,
			ammoRedirect,
			ammoRedirectPointer;
			
		for ( i=1; i<=sheetTypes.sheetType; i++) {
		
			ammoRedirectPointer = fields.Ammo_indirect[0] + i + '-';
			if (_.isUndefined(ammoRedirect = attrLookup( charCS, ammoRedirectPointer, fields.Ammo_indirect[1] ))) {
				sendDebug( 'setAmmoFlags: no ' + ammoRedirectPointer + ' set for ' + charCS.get('name') );
			} else if (_.isUndefined(ammoQty = attrLookup( charCS, ammoRedirect + fields.Ammo_qty[0], fields.Ammo_qty[1] ))) {
				sendDebug( 'setAmmoFlags: ' + ammoRedirect + fields.Ammo_qty[0] + ' does not exist for ' + charCS.get('name'));
			} else {
				setAttr( charCS, [fields.Ammo_flag[0] + i, fields.Ammo_flag[1]], (ammoQty ? 1 : 0) );
			};
		};
		return;
	};
	
    /**
     * Check for a v4 MIBag
    */

    var checkNewMIBag = function(tokenID) {

        var curToken = getObj( 'graphic', tokenID );
        if (!tokenID || !curToken) {
            sendDebug( 'checkNewMIBag: invalid tokenID passed' );
            sendError( 'Invalid token selected');
            return false;
        };
        var tokenName = curToken.get('name'),
            charCS = getObj('character', curToken.get('represents'));

        if (!charCS) {
            sendDebug( 'checkNewMIBag: token does not have an associated character sheet' );
            sendError( 'Invalid token selected');
            return false;
        }
        var charName = charCS.get('name'),
            sheetFlagsObj, sheetFlags = 0,
            MIBagTypeObj, MIBagType = 0;
			
        sheetFlags = attrLookup( charCS, 'sheet-flags', 'current');
        MIBagType = (attrLookup( charCS, (sheetFlags ? 'sheet-mibag-type' : 'sheet-type'), 'current') || MIB_StateEnum.NOBAG);
        
        sendDebug('checkNewMIBag: charName: ' + charName + ', sheetFlags: ' + sheetFlags + ', MIBagType: ' + MIBagType );
        if (MIBagType != MIB_StateEnum.V4BAG) {
            sendParsedMsg( tokenID, ((MIBagType === MIB_StateEnum.NOBAG) ? messages.noMIBag : messages.oldMIBag) );
            return false;
        }
        return true;
    };
    
    /**
     * Express a cost in coins for display
    **/
    
    var showCost = function( cost ) {
        var content = '[[' + Math.floor(cost) + ']]GP, [[' + Math.floor((cost*10)%10) + ']]SP, [[' + Math.floor((cost*100)%10) +']]CP';
        return content;
    };
    
    /**
     * Deduct expenditure from a character
     **/
     
    var spendMoney = function( toCS, cost, fromCS ) {
        
        var gold = parseInt((attrLookup( toCS, fields.Money_gold[0], fields.Money_gold[1] ) || 0), 10),
            silver = parseInt((attrLookup( toCS, fields.Money_silver[0], fields.Money_silver[1] ) || 0), 10),
            copper = parseInt((attrLookup( toCS, fields.Money_copper[0], fields.Money_copper[1] ) || 0), 10);
            
        if (!toCS || isNaN(cost) || cost == 0) {
            return gold + (silver / 10) + (copper / 100);
        }

        if (cost < 0) {
            cost = Math.abs(cost);
            gold += Math.floor(cost);
            silver += Math.floor((cost*10)%10);
            copper += Math.floor((cost*100)%10);
        } else {
            gold -= Math.floor(cost);
            silver -= Math.floor((cost*10)%10);
            copper -= Math.floor((cost*100)%10);
        }
        setAttr( toCS, fields.Money_gold, gold );
        setAttr( toCS, fields.Money_silver, silver );
        setAttr( toCS, fields.Money_copper, copper );

        if (fromCS) {
            spendMoney( fromCS, (0-cost) );
        }
        
        return gold + (silver / 10) + (copper / 100);
    }
    
    /**
     * Find and return total level of a character
     **/
     
    var characterLevel = function( charCS ) {
        var level = parseInt((attrLookup( charCS, fields.Fighter_level[0], fields.Fighter_level[1] ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Wizard_level[0], fields.Wizard_level[1] ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Priest_level[0], fields.Priest_level[1] ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Rogue_level[0], fields.Rogue_level[1] ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Psion_level[0], fields.Psion_level[1] ) || 0),10);
        return level;
    }
	
	/*
	 * Find and return the level for spell casting.
	 *    MU: Wizard_level
	 *    PR: Priest_level
	 *    POWER or MI: all levels added
	 */
	 
	var casterLevel = function( charCS, casterType ) {
		switch (casterType) {
		case 'MU':
			return (attrLookup( charCS, fields.Wizard_level[0], fields.Wizard_level[1] ) || 0);
		case 'PR':
			return (attrLookup( charCS, fields.Priest_level[0], fields.Priest_level[1] ) || 0);
		case 'POWER':
		case 'MI':
			return characterLevel( charCS );
		}
	}
	
	/*
	 * Set up the shape of the spell book.  This is complicated due to
	 * the 2E sheet L5 MU Spells start out-of-sequence at column 70
	 */
	 
	var shapeSpellbook = function( charCS, spellbook ) {

		var isMU = spellbook == 'MU',
			isPR = spellbook == 'PR',
			isPower = spellbook == 'POWER',
			isMI = spellbook == 'MI',
			sheetTypes = getSheetTypes( charCS ),
			levelSpells = (isMU ? spellLevels.mu : (isPR ? spellLevels.pr : (isMI ? spellLevels.mi : spellLevels.pw)));
			
			switch (spellbook) {

			case 'MU':
				levelSpells = spellLevels.mu;
				for (let i=1; i<=9; i++) {
					levelSpells[i].spells = (attrLookup(charCS,fields.MUSpellNo_table[0] + i + fields.MUSpellNo_total[0],fields.MUSpellNo_total[1])||0);
				}
				break;
				
			case 'PR':
				levelSpells = spellLevels.pr;
				for (let i=1; i<=7; i++) {
					levelSpells[i].spells = (attrLookup(charCS,fields.PRSpellNo_table[0] + i + fields.PRSpellNo_total[0],fields.PRSpellNo_total[1])||0);
				}
				break;
				
			case 'POWER':
				levelSpells = spellLevels.pw;
				levelSpells[1].spells = (sheetTypes.sheetPowersType == 6 ? 9 : 18);
				break;
				
			case 'MI':
				levelSpells = spellLevels.mi;
				levelSpells[1].spells = (attrLookup(charCS,fields.MUSpellNo_table[0] + 15 + fields.MUSpellNo_total[0],fields.MUSpellNo_total[1])||0);
				break;
				
			default:
				sendDebug('shapeSpellbook: invalid spellbook type '+spellbook+' specified');
				sendError('Internal magicMaster error');
				break;
		} 
		return levelSpells;
	}
	
    /**
	 * blank a slot in the MIBag
     **/

	var blankSlot = function( storeCS, rowRef ) {
		
		var MI_tableref = fields.MI_table[0] + '_$' + rowRef + '_';
		
		setAttr( storeCS, [MI_tableref + fields.MI_name[0], fields.MI_name[1]], '-' );
		setAttr( storeCS, [MI_tableref + fields.MI_trueName[0], fields.MI_trueName[1]], '-' );
		setAttr( storeCS, [MI_tableref + fields.MI_qty[0], fields.MI_qty[1]], '' );
		setAttr( storeCS, [MI_tableref + fields.MI_trueQty[0], fields.MI_trueQty[1]], '' );
		setAttr( storeCS, [MI_tableref + fields.MI_speed[0], fields.MI_speed[1]], 0 );
		setAttr( storeCS, [MI_tableref + fields.MI_trueSpeed[0], fields.MI_trueSpeed[1]], 0 );
		setAttr( storeCS, [MI_tableref + fields.MI_cost[0], fields.MI_cost[1]], 0 );
		setAttr( storeCS, [MI_tableref + fields.MI_type[0], fields.MI_type[1]], '' );
		
		return;
	}
	
	/*
	 * Return a string containing the in-game date in short or long form
	 */
	 
	var inGameDate = function( inGameDay ) {
		
		if (!dB.dtDB) {return '';}
		
		return ['Mon','Tue','Wed','Thur','Fri','Sat','Sun'][((inGameDay%7))]+', '
				+ (1+(inGameDay%28)) + ['st','nd','rd','th'][Math.min((((inGameDay%28)%20)),3)]+' '
				+ ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Math.floor(((inGameDay%336))/28)]+', '
				+ Math.floor(inGameDay/336);
	}		
		
	
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/**
	 * Ask the player how many of a particular MI to pick up
	 * args[] is the standard action|charID|fromID|toID|fromRow|toRow
	 **/
	 
	var howMany = function( args, MIname, MItype, MIqty ) {
		
		var tokenID = args[1],
			fromID = args[2],
			toID = args[3],
			fromRow = args[4],
			toRow = args[5],
			charCS = getCharacter( tokenID ),
			content = '&{template:2Edefault}{{name=How Many Items?}}'
					+ '{{desc=How many '+MIname+' do you want to '+(tokenID == toID ? 'take' : 'put away')+'?}}'
					+ '{{desc1=[One](!magic --button POPqty|'+tokenID+'|'+fromID+'|'+toID+'|'+fromRow+'|'+toRow+'|1) or '
					+ '[All '+MIqty+'](!magic --button POPqty|'+tokenID+'|'+fromID+'|'+toID+'|'+fromRow+'|'+toRow+'|'+MIqty+') or '
					+ '[Specify](!magic --button POPqty|'+tokenID+'|'+fromID+'|'+toID+'|'+fromRow+'|'+toRow+'|&#63;{How many '+MIname+'? max '+MIqty+'}) }}';

		sendResponse( charCS, content );
//        sendChat( fields.feedbackName, content );
	}
	
	/*
	 * Create a list of Magic Items in an MI bag, able
	 * to be used to select one from.  A flag determines
	 * whether empty slots '-' are included
	 */
	 
	var makeMIlist = function( charCS, includeEmpty, include0=true ) {
	
		var mi,
			qty,
			miList = '';

		for (let i = 0; i < fields.MIRows; i++) {
			mi = attrLookup( charCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_name[0], fields.MI_name[1] );
			if (mi.length > 0 && (includeEmpty || mi != '-')) {
				qty = attrLookup( charCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_qty[0], fields.MI_qty[1] );
				if (include0 || qty > 0) {
    				miList += '|' + qty + ' ' + mi + ',' + i;
				}
			}
		}
		return miList;
	}
	
	/*
	 * Create buttons to select Magic Item slots from. Highlight
	 * any button with the index of MIrowref.  A flag determines
	 * whether empty slots '-' are included.
	 */

	var makeMIbuttons = function( tokenID, miField, qtyField, cmd, extension='', MIrowref=-1, disable0=true, includeEmpty=false, pickID ) {
		
		var charCS = getCharacter(tokenID),
		    isView = extension == 'viewMI',
		    qty, mi, content = '';
		
		if (!_.isUndefined(pickID)) {
			charCS = getCharacter(pickID);
			if (!charCS) {
				charCS = getCharacter(tokenID);
			}
		}
		for (let i = 0; i < fields.MIRows; i++) {
			qty = attrLookup( charCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_qty[0], qtyField ) || 0;
			mi = attrLookup( charCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_name[0], miField ) || '';
			if (mi.length > 0 && (includeEmpty || mi != '-')) {
				content += (i == MIrowref || (disable0 && qty == 0)) ? ('<span style=' + (i == MIrowref ? design.selected_button : design.grey_button) + '>') : '['; 
				content += (mi != '-' ? (qty + ' ') : '') + mi;
				if (isView) {
					extension = '\n&#37;{'+abilityLookup( fields.MagicItemDB, mi ).dB+'|'+mi+'}';
				}
				content += (i == MIrowref || (disable0 && qty == 0)) ? '</span>' : '](!magic --button '+cmd+'|' + tokenID + '|' + i + extension + ')';
			};
		};
		return content;
	}
	
	/*
	 * Create a menu line for the number of spells the caster
	 * can have memorised at a particular spell level.
	 */
	 
	var makeNumberOfSpells = function( curToken, spellType, level, totalSpells ) {
		
		var charCS = getCharacter(curToken.id),
			tokenName = curToken.get('name'),
			spellsAtLevel, spellsSpecialist, spellsWisdom, spellsMisc,
			wisdom,
			content = tokenName + ' can memorise [[[['+totalSpells+']]';

		if (['MI','MU'].includes(spellType)) {
		    if (spellType == 'MI') level = fields.MIspellLevel;
			spellsAtLevel = (attrLookup(charCS,fields.MUSpellNo_table[0] + level + fields.MUSpellNo_memable[0],fields.MUSpellNo_memable[1])||0);
			spellsSpecialist = (attrLookup(charCS,fields.MUSpellNo_table[0] + level + fields.MUSpellNo_specialist[0],fields.MUSpellNo_specialist[1])||0);
			spellsMisc = (attrLookup(charCS,fields.MUSpellNo_table[0] + level + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1])||0);
			content += '['+spellsAtLevel+' at level '+level+',+'+spellsSpecialist+' specialist+'+spellsMisc+' misc]';
		} else {
			spellsAtLevel = (attrLookup(charCS,fields.PRSpellNo_table[0] + level + fields.PRSpellNo_memable[0],fields.PRSpellNo_memable[1])||0);
			spellsWisdom = (attrLookup(charCS,fields.PRSpellNo_table[0] + level + fields.PRSpellNo_wisdom[0],fields.PRSpellNo_wisdom[1])||0);
			wisdom = (attrLookup(charCS,fields.Wisdom[0],fields.Wisdom[1])||0);
			spellsMisc = (attrLookup(charCS,fields.PRSpellNo_table[0] + level + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1])||0);
			content += '['+spellsAtLevel+' at level '+level+', + '+spellsWisdom+' for wisdom '+wisdom+', + '+spellsMisc+' misc]';
		}
		content += ']] spells '+(spellType == 'MI' ? 'in magic items' : 'at level '+level);
		return content;
	}
	
	/*
	 * Make a list of spells in the specified memorised/stored list
	 */

	var makeSpellList = function( tokenID, command, selectedButton, submitted = false, extension = '' ) {
		
		var isMU = command.toUpperCase().includes('MU'),
			isMI = command.toUpperCase().includes('MI'),
			isPower = command.toUpperCase().includes('POWER'),
			isView = command.includes('VIEW'),
			content = '',
			buttonID = 0,
			spell, spellType,
			magicDB, levelSpells,
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			miStore = command.includes('MI_SLOT');

		if (isMU) {
		    spellType = 'MU';
			magicDB = fields.MU_SpellsDB;
		} else if (isPower) {
		    spellType = 'POWER';
			magicDB = fields.PowersDB;
		} else if (!isMI) {
		    spellType = 'PR';
			magicDB = fields.PR_SpellsDB;
		} else {
		    spellType = 'MI';
		}
		
		// build the Spell list
		levelSpells = shapeSpellbook( charCS, spellType );

		for (let l = 1; l < levelSpells.length; l++) {
			let r = 0;
            if (levelSpells[l].spells > 0) {
                if (l != 1 )
	    		    {content += '\n';}
				if (!isPower)
					{content += makeNumberOfSpells(curToken,spellType,l,levelSpells[l].spells)+'\n';}
            }
			while (levelSpells[l].spells > 0) {
				let c = levelSpells[l].base;
				for (let w = 1; (w <= fields.SpellsCols) && (levelSpells[l].spells > 0); w++) {
					let col = (fields.SpellsFirstColNum || c != 1) ? c : '',
						rep = fields.Spells_table[0] + col + '_$' + r + '_',
						spellName = attrLookup( charCS, rep + fields.Spells_name[0] + col, fields.Spells_name[1]) || '-',
						spellValue = parseInt((attrLookup( charCS, rep + fields.Spells_castValue[0] + col, fields.Spells_castValue[1]) || 0),10),
						disabled = (miStore ? (spellValue != 0) : (spellValue == 0));
					if (isView) {
						spell = abilityLookup( magicDB, spellName );
						extension = '\n&#37;{' + spell.dB + '|'+spellName+'}';
					}
					content += (buttonID == selectedButton ? '<span style=' + design.selected_button + '>' : ((submitted || disabled) ? '<span style=' + design.grey_button + '>' : '['));
					content += (spellType == 'POWER' ? (spellValue + ' ') : '') + spellName;
					content += (((buttonID == selectedButton) || submitted || disabled) ? '</span>' : '](!magic --button ' + command + '|' + tokenID + '|' + buttonID + '|' + r + '|' + c + extension + ')');
					buttonID++;
					c++;
					levelSpells[l].spells--;
				}
				r++;
			}
		}
		return content;
	}
	
	/*
	 * Create a menu for a player to manage their spell list.
	 */

	var makeManageSpellsMenu = function( args, msg ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPR = args[0].toUpperCase().includes('PR'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			level = parseInt((args[2]),10),
			spellRow = args[3],
			spellCol = args[4],
			spellToMemorise = args[5] || '',
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			levelSpells;
			
		if (!curToken || !charCS) {
			sendDebug('makeManageSpellsMenu: invalid tokenID passed');
			sendError('Internal spellMaster parameter error');
			return;
		}
		
		var	spellbook,
			spell,
		    spellName,
			spellValue,
			tokenName = curToken.get('name'),
			content,
			selectedSpell = (spellToMemorise.length > 0),
			selectedSlot = (spellRow >= 0 && spellCol >= 0),
    		selectedBoth = selectedSpell && selectedSlot,
    		selected,
			slotSpell = '',
			noToMemorise = '1',
			magicWord = 'spell',
			magicDB, magicType, tableType,
			editCmd, reviewCmd, memCmd,
			levelLimit, nextLevel,
			col, rep,
			l, r, c, w;
		
		if (isPower) {
			level = 1;
			levelLimit = 1;
			magicType = 'POWER';
			tableType = magicWord = 'power';
			editCmd = isMI ? BT.EDIT_MIPOWER : BT.EDIT_POWER;
			reviewCmd = isMI ? BT.REVIEW_MIPOWER : BT.REVIEW_POWER;
			memCmd = isMI ? BT.MEM_MIPOWER : BT.MEM_POWER;
			magicDB = fields.PowersDB;
			noToMemorise = '?{How many per day (-1=unlimited&#41;}';
		} else if (isMU) {
			levelLimit = 9;
			magicType = 'MU';
			tableType = 'Wizard Spellbook';
			editCmd = BT.EDIT_MUSPELLS;
			reviewCmd = BT.REVIEW_MUSPELL;
			memCmd = BT.MEM_MUSPELL;
			magicDB = fields.MU_SpellsDB;
		} else {
			levelLimit = 7;
			magicType = 'PR';
			tableType = 'Priest Spellbook';
			editCmd = BT.EDIT_PRSPELLS;
			reviewCmd = BT.REVIEW_PRSPELL;
			memCmd = BT.MEM_PRSPELL;
			magicDB = fields.PR_SpellsDB;
		}
		
		levelSpells = shapeSpellbook( charCS, magicType );
		
		if (isMI && isPower && charCS.id == dB.miDB.id) {
			levelSpells[1].spells = fields.Powers_MIPowers;
		} else if (isMI && isPower) {
			sendDebug('makeManageSpellsMenu: Trying to manage MI Powers, but MI-DB token not selected');
			sendError('Invalid magicMaster syntax');
			return;
		}
//		log('makeManageSpellsMenu: isMI='+isMI+', isPower='+isPower+', is miDB='+(charCS.id == dB.miDB.id)+', no of spells='+levelSpells[1].spells);
		
		spellbook = attrLookup( charCS, fields.Spellbook[0]+((fields.SpellsFirstColNum || levelSpells[level].book != 1) ? levelSpells[level].book : ''), fields.Spellbook[1] ) || '';
		content = '&{template:2Edefault}{{name=Select Slot to Use in '+tokenName+'\'s '+tableType+'s}}'
				+ ((isPower) ? ('{{subtitle=All Powers     -1 means "At Will"}}') : ('{{subtitle=Level '+level+' spells}}'));
				
		if (msg && msg.length > 0) {
			content += '{{='+msg+'}}';
		}
		
		content += '{{desc=1. [Choose](!magic --button '+editCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|?{'+magicWord+' to memorise|'+spellbook+'}) '+magicWord+' to memorise<br>';
		
		if (selectedSpell) {
			spell = abilityLookup( magicDB, spellToMemorise );
			content += '...Optionally [Review '+spellToMemorise+'](!magic --button '+reviewCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|'+spellToMemorise
			        +  '\n&#37;{' + spell.dB + '|'+spellToMemorise+'})}}';
		} else {
			content += '...Optionally <span style='+design.grey_button+'>Review the '+magicWord+'</span>}}';
		}
		content	+= '{{desc1=2. Choose slot to use\n'
				+  (isPower ? '' : (makeNumberOfSpells(curToken,isMU,level,levelSpells[level].spells)))+'\n';
		
		// build the Spell list
		
		r = 0;
		while (levelSpells[level].spells > 0) {
			c = levelSpells[level].base;
			for (w = 1; (w <= fields.SpellsCols) && (levelSpells[level].spells > 0); w++) {
				col = (fields.SpellsFirstColNum || level != 1 || c != 1) ? c : '';
				selected = (r == spellRow && c == spellCol);
				rep = fields.Spells_table[0] + col + '_$' + r + '_';
				spellName = attrLookup( charCS, rep + fields.Spells_name[0] + col, fields.Spells_name[1]);
				spellValue = parseInt((attrLookup( charCS, rep + fields.Spells_castValue[0] + col, fields.Spells_castValue[1]) || 0),10);
				content += (selected ? ('<span style=' + design.selected_button + '>') : ('['+(spellValue == 0 ? ('<span style=' + design.grey_button + '>') : '')));
				if (isPower && spellName != '-') {
				    content += spellValue + ' ';
				}
				content += spellName;
				content += (selected || spellValue == 0 ? '</span>' : '');
				content += (!selected ? ('](!magic --button ' + editCmd + '|' + tokenID + '|' + level + '|' + r + '|' + c + '|' + spellToMemorise + ')') : '');
				c++;
				levelSpells[level].spells--;
			}
			r++;
		}
		
		if (level < levelLimit) {
			nextLevel = (levelSpells[(level+1)].spells>0) ? (level+1) : 1;
		} else {
		    nextLevel = 1;
		}

		if (selectedSlot) {
			col = (fields.SpellsFirstColNum || level != 1 || spellCol != 1) ? spellCol : '';
		    slotSpell = attrLookup( charCS, fields.Spells_table[0]+col+'_$'+spellRow+'_'+fields.Spells_name[0]+col, fields.Spells_name[1] ) || '';
		}
		content += '}}{{desc2=...Then\n'
				+  '3. '+(selectedBoth ? '[' : '<span style='+design.grey_button+'>')
				+		'Memorise '+(selectedSpell ? spellToMemorise : ' the '+magicWord )
				+		 (!selectedBoth ? '</span>' : ('](!magic --button '+memCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|'+spellToMemorise+'|'+noToMemorise+')'))+'\n'
				+  (isPower ? '' : '4. When ready [Go to Level '+nextLevel+'](!magic --button '+editCmd+'|'+tokenID+'|'+nextLevel+'|-1|-1|)\n')
				+  'Or just do something else anytime\n\n'

				+  'Or ' + (selectedSlot ? '[' : ('<span style='+design.grey_button+'>'))
				+  'Remove '+slotSpell
				+  (!selectedSlot ? '</span> the' : ('](!magic --button '+memCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|-|0)') )+' '+magicWord+'}}';

		sendResponse( charCS, content );
		return;
	}

	/*
	 * Make a menu to store spells in a Magic Item from the caster's
	 * own memorised spells.
	 */
	 
	var makeStoreMIspell = function(args,msg = '') {
		
		var command = args[0],
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makeStoreMIspell: invalid tokenID passed');
			sendError('Internal magicMaster error');
			return;
		}
		
		var isMU = command.includes('MU'),
			isMI = command.includes('MI'),
			spellButton = args[(isMI ? 5 : 2)],
			spellRow = args[(isMI ? 6 : 3)],
			spellCol = args[(isMI ? 7 : 4)],
			MIbutton = args[(isMI ? 2 : 5)],
			MIrow = args[(isMI ? 3 : 6)],
			MIcol = args[(isMI ? 4 : 7)],
			spellName, col,
			tokenName = curToken.get('name'),
			content = '&{template:2Edefault}{{name=Store Spell in '+tokenName+'\'s Magic Item}}'
					+ '{{subtitle=Storing ' + (isMU ? 'MU' : 'PR') + ' spells}}'
					+ '{{desc=1.Choose a spell to store\n'+makeSpellList( tokenID, (isMU ? BT.MU_TO_STORE : BT.PR_TO_STORE), spellButton, false, ('|'+MIbutton+'|'+MIrow+'|'+MIcol) )+'}}'
					+ '{{desc1=2.Choose where to store it\n'+makeSpellList( tokenID, (isMU ? BT.MU_MI_SLOT : BT.PR_MI_SLOT), MIbutton, false, ('|'+spellButton+'|'+spellRow+'|'+spellCol) )+'}}';

		if (spellButton >= 0) {
			col = (fields.SpellsFirstColNum || spellCol != 1) ? spellCol : '';
			spellName = attrLookup( charCS, fields.Spells_table[0]+col+'_$'+spellRow+'_'+fields.Spells_name[0]+col, fields.Spells_name[1] ) || '-';
		} else {
			spellName = 'spell';
		}
		
		var canStore = spellButton >= 0 && MIbutton >= 0;
		
		content += '{{desc2=3.Once both spell and slot selected\n'
				+  (canStore ? '[' : '<span style='+design.grey_button+'>')
				+  'Store '+spellName
				+  (canStore ? ('](!magic --button '+(isMU ? BT.MISTORE_MUSPELL : BT.MISTORE_PRSPELL)+'|'+tokenID+'|'+MIbutton+'|'+MIrow+'|'+MIcol+'|'+spellButton+'|'+spellRow+'|'+spellCol+')') : '</span>')
				+  '}}';
		if (msg.length) {
			content += '{{='+msg+'}}';
		}
		sendResponse( charCS, content );
		return;
	}
	
	/*
	 * Create a menu for a player to cast a spell
	 */
	
	var makeCastSpellMenu = function( args, submitted = false ) {

        var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			spellButton = args[2],
			spellRow = args[3],
			spellCol = args[4],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			magicDB,
			magicWord = 'spell',
			spell,
			spellName = '',
            content = '',
            tokenName,
			selectCmd,
			storeCmd,
			col = (fields.SpellsFirstColNum || spellCol != 1) ? spellCol : '',
			rep = fields.Spells_table[0]+col+'_$'+spellRow+'_';
			
		if (!curToken || !charCS) {
			sendDebug('makeCastSpellMenu: invalid tokenID passed');
			sendError('Internal spellMaster parameter error');
			return content;
		}
		
		tokenName = curToken.get('name');
		content = '&{template:2Edefault}{{name=';
		if (!isPower) {content += 'What Spell is ' + tokenName + ' casting?}}{{subtitle=Casting '};
		
		if (isMI) {
			content += 'MI stored spells}}';
			if (spellButton >= 0) {magicDB = attrLookup( charCS, rep+fields.Spells_db[0]+col, fields.Spells_db[1] ) || fields.MU_SpellsDB;}
			selectCmd = BT.MI_SPELL;
			storeCmd = BT.CAST_MISPELL;
		} else if (isPower) {
			content += 'What Power is ' + tokenName + ' using?}}{{subtitle=Using Powers}}';
			magicDB = fields.PowersDB;
			magicWord = 'power';
			selectCmd = BT.POWER;
			storeCmd = BT.USE_POWER;
		} else if (isMU) {
			content += 'MU spells}}';
			magicDB = fields.MU_SpellsDB;
			selectCmd = BT.MU_SPELL;
			storeCmd = BT.CAST_MUSPELL;
		} else {
			content += 'PR spells}}';
			magicDB = fields.PR_SpellsDB;
			selectCmd = BT.PR_SPELL;
			storeCmd = BT.CAST_PRSPELL;
		}
		
		content += '{{desc=' + makeSpellList( tokenID, selectCmd, spellButton, submitted );

		if (spellButton >= 0) {
			spellName = attrLookup( charCS, rep+fields.Spells_name[0]+col, fields.Spells_name[1] ) || '-';
			if (spellName.length > 0) {
				spell = abilityLookup( magicDB, spellName );
			} else {
				spellButton = -1;
			}
		} else {
			spellName = '';
		}
		log('spellButton = '+spellButton+', submitted = '+submitted);	
		content += '}}{{desc1=Select '+magicWord+' above, then '
				+ (((spellButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Cast '+(spellName.length > 0 ? spellName : magicWord)
				+ (((spellButton < 0) || submitted) ? '</span>' : '](!magic --button ' + storeCmd + '|' + tokenID + '|' + spellButton + '|' + spellRow + '|' + spellCol + '\n&#37;{' + spell.dB + '|' + spellName + '})')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};
	
	/*
	 * Create a menu for a player to view a character's spells
	 */
	
	var makeViewMemSpells = function( args ) {

        var isMU = args[0].toUpperCase().includes('MU'),
			isPR = args[0].toUpperCase().includes('PR'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			spellButton = args[2],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			spell,
			spellName = '',
			spellValue,
            content = '',
			magicWord = 'spell',
			magicDB, magicType, tableType,
			col, rep,
			viewCmd,
			levelSpells = [],
			levelLimit,
			l, w, r, c,
			buttonID = 0;
			
		if (!charCS) {
			sendDebug('makeViewMemSpells: invalid tokenID passed');
			sendError('Internal spellMaster parameter error');
			return content;
		}
		
		if (isPower) {
			levelLimit = 1;
			magicType = 'POWER';
			tableType = 'Powers';
			magicWord = 'power';
			viewCmd = BT.VIEW_POWER;
			magicDB = fields.PowersDB;
		} else if (isMU) {
			levelLimit = 9;
			magicType = 'MU';
			tableType = 'Wizard Spells';
			viewCmd = BT.VIEW_MUSPELL;
			magicDB = fields.MU_SpellsDB;
		} else {
			levelLimit = 7;
			magicType = 'PR';
			tableType = 'Priest Spells';
			viewCmd = BT.VIEW_PRSPELL;
			magicDB = fields.PR_SpellsDB;
		}
		
		content = '&{template:2Edefault}{{name=View '+curToken.get('name')+'\'s currently memorised '+magicWord+'s}}'
				+ '{{subtitle=' + tableType + '}}'
				+ '{{desc=' + makeSpellList( tokenID, viewCmd, spellButton, false );


		content += '}}{{desc1=Select the '+magicWord+' above that you want to view the details of.  It will not be cast and will remain in your memorised '+magicWord+' list.}}';
		sendResponse( charCS, content );
	};
	
	/*
	 * Make a one button menu to ask the player
	 * if they want to cast the same spell/power/MI again
	 */
	 
	var makeCastAgainMenu = function( args ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			charCS = getCharacter( args[1] ),
			macroDB = isMI ? fields.MagicItemDB : (isPower ? fields.PowersDB : (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB)),
			spell = abilityLookup( macroDB, args[5] ),
			content = '&{template:2Edefault}{{name='+args[5]+'}}'
			        + '{{desc=[Use another charge?](!magic --button ' + args[0] + '|' + args[1] + '|' + args[2] + '|' + args[3] + '|' + args[4] + '\n'
					+ '&#37;{' + spell.dB + '|' + args[5] + '})}}';
		
		if (charCS) {
			sendResponse( charCS, content );
		}
		return;
	}
	
	/*
	 * Create a short menu to ask the player to select between 
	 * a short or a long rest.  The long rest option can be shown
	 * as disabled.
	 */
	 
	var makeRestSelectMenu = function( args, longRestEnabled ) {
		
		var tokenID = args[0],
		    casterType = args[2] || 'MU+PR',
			charCS = getCharacter(tokenID),
			curToken = getObj('graphic',tokenID),
			content = '&{template:2Edefault}{{name=Select Type of Rest for '+curToken.get('name')+'}}'
					+ '{{desc=[Short Rest](!magic --rest '+tokenID+'|short|'+casterType+') or '
					+ (longRestEnabled ? '[' : '<span style='+design.grey_button+'>')
					+ 'Long Rest'
					+ (longRestEnabled ? ('](!magic --rest '+tokenID+'|long|'+casterType+')') : '</span>')
					+ '}}';
					
		if (!longRestEnabled) {
			content += '{{It looks like the DM has not enabled Long Rests.\n[Try Again](!magic --rest '+tokenID+'|SELECT|'+args[2]+') once the DM says it is enabled}}';
		}
		sendResponse( charCS, content );
		return;
	}
	
	/**
	* Create a version of Pick or Put for coins, jewels and other treasure
	* Allow the player to switch from one to the other when looting
	**/
	
	var makeLootMenu = function(senderId,args,menuType) {
	    
	    var tokenID = args[1],
			pickID = args[3],
	        putID = args[4];
	        
        var pickCS = getCharacter( pickID ),
            putCS = getCharacter( putID );
            
        if (!pickCS || !putCS) {
            sendDebug( 'makeLootMenu: pickID or putID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        }
        
        var pickName = pickCS.get('name'),
            putName = putCS.get('name'),
            treasure = (attrLookup( pickCS, fields.Money_treasure[0], fields.Money_treasure[1] ) || ''),
            content = '&{template:2Edefault}{{name=View Treasure from ' + pickName + '}}';
            
        if (treasure && treasure.length > 0) {
            content += treasure;
        } else {
            content += '{{desc=There are no coins, gems or jewellery to be found here}}';
        }
            
		content += '{{desc1=Make a note of this - no automatic function yet!}}';
		content += '{{desc2=When ready [View Magic Items](!magic --pickorput '+tokenID+'|'+pickID+'|'+putID+') or do something else.}}';
		        
		return content;
	};
	
	/*
	 * Create a menu to view or use a magic item
	 */
	 
	var makeViewUseMI = function( args, senderId, menuType ) {
		
		var action = args[0].toUpperCase(),
			tokenID = args[1],
			MIrowref = args[2] || -1,
			isGM = playerIsGM(senderId),
			isView = action.includes('VIEW'),
			charCS = getCharacter(tokenID);

		if (!charCS) {
            sendDebug( 'makeViewUseMI: tokenID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
			return;
		}

		if (!menuType) {
			var playerConfig = getSetPlayerConfig( senderId );
			if (playerConfig) {
				menuType = playerConfig.viewUseMIType || 'long';
			} else {
			    menuType = 'long';
			}
		}
		var shortMenu = menuType == 'short',
			actionText = (isView ? 'View' : 'Use'),
			selectAction = (isView ? (shortMenu ? BT.CHOOSE_VIEW_MI : BT.VIEW_MI) : BT.CHOOSE_USE_MI),
			submitAction = (isView ? BT.VIEW_MI : BT.USE_MI),
			content = '&{template:2Edefault}{{name='+actionText+' '+charCS.get('name')+'\'s Magic Items}}'
					+ '{{desc=Select a Magic Item below to '+actionText
					+ (isView ? '. It will not be used and will remain in your Magic Item Bag' : ', and then press the **Use Item** button') + '}}'
					+ '{{desc1=';

		if (shortMenu) {
			content += '[Select a Magic Item](!magic --button '+selectAction+'|'+tokenID+'|?{Which Magic Item?'+makeMIlist( charCS, false, isView )+'}) }}';
		} else {
			// build the character's visible MI Bag
			content += makeMIbuttons( tokenID, (isGM ? 'max' : 'current'), fields.MI_qty[1], selectAction, (isView ? 'viewMI' : ''), MIrowref);
			content += '}}';
		}
		var magicItem,
		    selectedMI;
			
		content += '{{desc2=';
		if (shortMenu || !isView) {
			if (MIrowref >= 0) {
				selectedMI = attrLookup( charCS, fields.MI_table[0] + '_$' + MIrowref + '_' + fields.MI_name[0], (isGM ? 'max' : 'current') ) || '-';
				magicItem = abilityLookup( fields.MagicItemDB, selectedMI );
			}	
			content	+= (MIrowref < 0 ? ('<span style='+design.grey_button+'>') : '[')
					+  actionText+' '+(MIrowref < 0 ? 'Magic Item' : selectedMI)
					+  (MIrowref < 0 ? ('</span>') : ('](!magic --button '+submitAction+'|'+tokenID+'|'+MIrowref+'\n&#37;{'+magicItem.dB+'|'+selectedMI+'})'))
					+  '\nor\n';
		}
		menuType = (shortMenu ? 'long' : 'short');
		content += '[Swap to a '+menuType+' menu](!magic --button '+(isView ? BT.VIEWMI_OPTION : BT.USEMI_OPTION)+'|'+tokenID+'|'+menuType+')'
				+  '}}';
				
		if (isGM) {
			sendFeedback( content );
		} else {
			sendResponse( charCS, content );
		}
		return;
	}
	
	/**
	 * Make a menu to display when a Player selects to use
	 * a power of a Magic Item
	 */
	 
	var makeUseMIpowerMenu = function( args ) {
		
		var tokenID = args[1],
			powerName = args[2],
			castLevel = args[3],
			itemName = args[4],
			MIlibrary = args[5],
			power = args[6],
			powerLib = args[7],
			charCS = getCharacter(tokenID),
			tokenName = getObj('graphic',tokenID).get('name'),
			content = '&{template:2Edefault}{{name='+itemName+'\'s '+powerName+' power}}'
					+ '{{desc='+tokenName+' is about to use '+itemName+'\'s '+powerName+' power.  Is this correct?}}'
					+ '{{desc1=[Use '+powerName+'](!magic --button '+BT.MI_POWER_USED+'|'+tokenID+'|'+powerName+'|'+itemName+'|'+castLevel+'\n&#37;{'+powerLib+'|'+power+'})'
					+ ' or [Return to '+itemName+'](\~'+MIlibrary+'|'+itemName+')\nOr just do something else}}';
		sendResponse(charCS,content);
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
			remove = (selectedMI.toLowerCase().includes('remove')),
			bagSlot = !!MIrowref && MIrowref >= 0,
			content = '&{template:2Edefault}{{name=Edit Magic Item Bag}}';

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
					+  '[Potion](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Potion to store|'+getMagicList(fields.MagicItemDB,fields.MI_PotionList)+'}|'+charges+')'
					+  '[Scroll](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Scroll to store|'+getMagicList(fields.MagicItemDB,fields.MI_ScrollList)+'}|'+charges+')'
					+  '[Rods, Staves, Wands](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Rod Staff Wand to store|'+getMagicList(fields.MagicItemDB,fields.MI_WandsList)+'}|'+charges+')'
					+  '[Weapon](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Weapon to store|'+getMagicList(fields.MagicItemDB,fields.MI_WeaponList)+'}|'+charges+')'
					+  '[Armour](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Armour to store|'+getMagicList(fields.MagicItemDB,fields.MI_ArmourList)+'}|'+charges+')'
					+  '[Ring](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Ring to store|'+getMagicList(fields.MagicItemDB,fields.MI_RingList)+'}|'+charges+')'
					+  '[Miscellaneous](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Misc Item to store|'+getMagicList(fields.MagicItemDB,fields.MI_MiscList)+'}|'+charges+')';
            if (shortMenu) {
			content +=  '\n**OR**\n'
					+  '[Choose item to Remove](!magic --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|'+'Remove) from your MI bag'
                    +  '}}';
            }
		}
		if (!shortMenu || selected) {
			if (!remove) {
				if (shortMenu) {
					content += '{{desc=**1.Item chosen** ['+selectedMI+'](!magic --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'), click to reselect\n';
				}
    			content += '\nOptionally, you can '+(selected ? '[' : '<span style='+design.grey_button+'>')+'Review '+selectedMI+(selected ? ('](!magic --button '+BT.REVIEW_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|\n&#37;{'+magicItem.dB+'|'+selectedMI+'})') : '')+'</span>';
            } else {
				content += '{{desc=**1.Action chosen** ***Remove***, [click](!magic --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+') to change';
				}
			content += '}}';
		}
		
		if (bagSlot) {
			qty = attrLookup( charCS, fields.MI_table[0] + '_$' + MIrowref + '_' + fields.MI_qty[0], 'current' ) || 0;
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
				content += '[Select slot](!magic --button '+BT.SLOT_MI+'|'+tokenID+'|?{Which slot?'+makeMIlist( charCS, true )+'}|'+selectedMI+')';
			} else {
				content += makeMIbuttons( tokenID, 'current', fields.MI_qty[1], BT.SLOT_MI, '|'+selectedMI, MIrowref, false, true );
			}
			
			content += '}}';
		} else if (shortMenu && bagSlot) {
			removeMI = mi = attrLookup( charCS, fields.MI_table[0] + '_$' + MIrowref + '_' + fields.MI_name[0], 'current' );
		    
		    content += '{{desc1=**2.Selected** ['+qty+' '+mi+'](!magic --button '+BT.SLOT_MI+'|'+tokenID+'|?{Which other slot?'+makeMIlist( charCS, true )+'}|'+selectedMI+'|)'
					+  ' as slot to '+(remove ? 'remove' : 'store it in')+', click to change}}';
		}
		
		if (!shortMenu || (selected && bagSlot)) {
			menuType = (shortMenu ? 'long' : 'short');
			content += '{{desc2=**3.';
			if (!remove) {
				content += ((selected && bagSlot) ? '[' : ('<span style='+design.grey_button+'>'))
						+  'Store '+selectedMI
						+  ((selected && bagSlot && !remove) ? ('](!magic --button '+BT.STORE_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|?{Quantity?|'+qty+'})') : '</span>')
						+  ' in your MI Bag**'+(!!removeMI ? (', overwriting **'+removeMI) : '')+'**\n\n'
						+  'or ';
			}
			content += (bagSlot ? '[' : ('<span style='+design.grey_button+'>'))
					+  'Remove '+(!!removeMI ? removeMI : 'item')
					+  (bagSlot ? ('](!magic --button '+BT.REMOVE_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+')') : '</span>')
					+  ' from your MI Bag\n\n'
					+  'or [Swap to a '+menuType+' menu](!magic --button '+BT.EDITMI_OPTION+'|'+tokenID+'|'+menuType+')}}';
		}
		sendResponse( charCS, content );
		return;
	}
	
	/*
	 * Create a menu for DMs to see displayed and real Magic Item information
	 * on Character Sheets.  Hidden information can be what the MI really is,
	 * which the DM can set using this menu.
	 */
	 
	var makeGMonlyMImenu = function(args, msg) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MItoStore = args[3],
			charCS = getCharacter(tokenID);
		
		if (!charCS) {
		    sendDebug('makeGMonlyMImenu: invalid tokenID passed');
		    sendError('Internal miMaster error');
		    return;
		}	
	    
		var	qty, mi,
			content = '&{template:2Edefault}{{name=Edit '+charCS.get('name')+'\'s Magic Item Bag}}'
					+ '{{desc=**1. Choose something to store**\n';
					
		content += '[Potion](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Potion?|'+getMagicList(fields.MagicItemDB, fields.MI_PotionList)+'})'
				+  '[Scroll](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Scroll?|'+getMagicList(fields.MagicItemDB, fields.MI_ScrollList)+'})'
				+  '[Rods, Staves, Wands](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Rod, Staff or Wand?|'+getMagicList(fields.MagicItemDB, fields.MI_WandsList)+'})'
				+  '[Weapon](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Weapon?|'+getMagicList(fields.MagicItemDB, fields.MI_WeaponList)+'})'
				+  '[Armour](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which piece of Armour?|'+getMagicList(fields.MagicItemDB, fields.MI_ArmourList)+'})'
				+  '[Ring](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Ring?|'+getMagicList(fields.MagicItemDB, fields.MI_RingList)+'})'
				+  '[Miscellaneous MI](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Misc MI?|'+getMagicList(fields.MagicItemDB, fields.MI_MiscList)+'})'
				+  '[DM only list](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which DM only item?|'+getMagicList(fields.MagicItemDB, fields.MI_DMList)+'})}}';
		content += '{{desc1=**2. Choose slot to edit or store in**\n';

		// build the character's visible MI Bag
		content += makeMIbuttons( tokenID, 'current', 'current', 'GM-MIslot', '|'+MItoStore, MIrowref, false, true );
		content += '\n**Which are Actually**\n';
		// build the character's hidden MI Bag
		content += makeMIbuttons( tokenID, 'max', 'max', 'GM-MIslot', '|'+MItoStore, MIrowref, false, true );
		content += '}}';

		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			slotName = (MIrowref >= 0) ? (attrLookup( charCS, slotRef + fields.MI_name[0], 'current' ) || '') : '',
			slotActualName = (MIrowref >= 0) ? (attrLookup( charCS, slotRef + fields.MI_name[0], 'max' ) || '') : '',
			slotType = (MIrowref >= 0) ? (attrLookup( charCS, slotRef + fields.MI_type[0], fields.MI_type[1] ) || '') : '',
			slotQty = (attrLookup( charCS, slotRef + fields.MI_qty[0], 'current' ) || 0),
			slotActualQty = (attrLookup( charCS, slotRef + fields.MI_qty[0], 'max' ) || 0),
			slotCost = (attrLookup( charCS, slotRef + fields.MI_cost[0], fields.MI_cost[1] ) || 0),
		
			chosenMI = (MItoStore.length > 0),
			chosenSlot = (MIrowref >= 0),
			chosenBoth = (chosenMI && chosenSlot),
			selectableSlot = chosenSlot ? '[' : '<span style='+design.grey_button+'>',
			selectableBoth = chosenBoth ? '[' : '<span style='+design.grey_button+'>',
			containerNo = attrLookup( charCS, fields.MI_ContainerType[0], fields.MI_ContainerType[1] ),
			containerType;
			
//		log('makeGMonlyMImenu: containerNo='+containerNo);
			
		switch (containerNo) {
		case '0': containerType = 'Empty Container';
				break;
		case '1': containerType = 'Container with stuff';
				break;
		case '2': containerType = 'Sentient no MI Bag';
				break;
		case '3': containerType = 'Sentient with MI Bag';
				break;
		case '4': containerType = 'Trapped container';
				break;
		}
		
		content += '{{desc2=**3. '+selectableBoth+'Store '+MItoStore+(chosenBoth ? '](!magic --button GM-StoreMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{Quantity?|'+slotQty+'+1})' : '</span>')+' **'
				+  ' or '+selectableBoth+'Hide '+(chosenBoth ? (slotName+' as '+MItoStore+'](!magic --button GM-RenameMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+')') : '</span>')+' it<br><br>'
				+  '1. Or select MI from above ^\n'
				+  '2. '+selectableSlot+'REMOVE MI'+(chosenSlot ? '](!magic --button GM-DelMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+') ' : '</span> ')
				+  selectableSlot+'Change MI Type'+(chosenSlot ? '](!magic --button GM-ChangeMItype|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{Currently '+slotType+'. What type should '+slotName+' now be?|charged|uncharged|recharging|rechargeable|cursed|cursed+charged|cursed+recharging}) ' : '</span> ')
				+  selectableSlot+'Change displayed charges'+(chosenSlot ? '](!magic --button GM-ChangeDispCharges|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How many displayed charges should '+slotName+' now have (currently '+slotQty+'&#41;?|'+slotQty+'}) ' : '</span> ')
				+  selectableSlot+'Change actual charges'+(chosenSlot ? '](!magic --button GM-ChangeActCharges|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How many actual charges should '+slotActualName+' now have (currently '+slotActualQty+'&#41;?|'+slotActualQty+'}) ' : '</span> ')
				+  selectableSlot+'Reset single MI'+(chosenSlot ? '](!magic --button GM-ResetSingleMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+') ' : '</span> ')
				+  selectableSlot+'Change Cost'+(chosenSlot ? '](!magic --button GM-SetMIcost|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How much should '+slotName+' now cost (currently '+slotCost+'GP&#41;?|'+slotCost+'})<br>' : '</span><br>')
				+  'or [Edit Treasure](!magic --button GM-TreasureMenu|'+tokenID+'|'+MIrowref+'|'+MItoStore+') [BLANK BAG](!magic --button GM-BlankBag|'+tokenID+')\n'
				+  '['+containerType+'](!magic  --button GM-SetTokenType|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{What type of token is this?&#124;Empty Inanimate Object,0&#124;Inanimate Object with stuff,1&#124;Empty Sentient Creature,2&#124;Sentient Creature with stuff,3&#124;Trapped container,4&#125;) select to change'
				+  '}}';
				
		if (msg && msg.length > 0) {
			content += '{{'+msg+'}}';
		}
		
		sendFeedback( content );
		return;
	}
	
	/*
	 * Create the DM's Edit Treasure menu
	 */
	 
	var makeEditTreasureMenu = function(args,msg) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
	
		if (!charCS) {
			sendDebug('makeEditTreasureMenu: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var charName = charCS.get('name'),
			treasure = attrLookup( charCS, fields.Money_treasure[0], fields.Money_treasure[1] ) || '{{Treasure=None found}}',
			content = '&{template:2Edefault}{{name=Current treasure for '+charName+'}}'
					+ treasure +'{{=----- End of current Treasure ----}}'
					+ '{{desc1=[Add](!magic --button GM-AddTreasure|'+tokenID+'|?{Title for Treasure?}|?{Treasure text}) or '
					+ '[Edit](!magic --button GM-EditTreasure|'+tokenID+') or '
					+ '[Delete](!magic --button GM-DeleteTreasure|'+tokenID+') the treasure}}'
					+ '{{desc2=Return to [DM\'s Change MI menu](!magic --button GM-MImenu|'+tokenID+'|-1|)}}';
		if (msg && msg.length > 0) {
			content += '{{desc='+msg+'}}';
		}
		
		sendFeedback(content);
		return;
	}
	
	/*
	 * Create a shorter, easier Pick or Put menu, that only does either
	 * Pick or Put (Player can switch between two), that uses a drop-down
	 * list of the MIs in the container to pick from (rather than buttons), and
	 * automatically selects an empty slot to put it into
	 */

	var makeShortPOPmenu = function( args, senderId, menuType ) {
		
	    var tokenID = args[1],
			pickID = args[3],
	        putID = args[4],
	        pickRow = args[2] || -1,
	        putRow = args[5] || -1;
	        
        if (!pickID || !putID) {
            sendDebug( 'makeShortPOPmenu: pickID or putID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        };
        
        var putCS = getCharacter( putID ),
            pickCS = getCharacter( pickID ),
			pickingUp = (tokenID == putID),
			shortMenu = pickingUp,
			pickOrPut = (pickingUp ? 'Pick up' : 'Put away'),
			charCS = getCharacter(tokenID);
           
        if (!putCS || !pickCS) {
            sendDebug( 'makeShortPOPmenu: pickID or putID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        }
		if (!menuType) {
			var playerConfig = getSetPlayerConfig( senderId );
			if (playerConfig) {
				shortMenu = !!!((pickingUp ? playerConfig.pickUpMIType : playerConfig.putAwayMIType) == 'long');
			}
		} else {
			shortMenu = !!!(menuType.toLowerCase() == 'long');
		}
		menuType = shortMenu ? 'long' : 'short';
		
        var putName = putCS.get('name'),
            pickName = pickCS.get('name'),
            qty, mi, miTrueName, i,
            pickedMI, pickedTrueMI, pickableQty, pickedType, miType,
            miList = makeMIlist( pickCS, false, true );

		if (!miList || miList.length == 0) {
			sendParsedMsg( tokenID, messages.header + '{{desc=' + pickName + messages.fruitlessSearch );
			return;
		}
		
		putRow = -1;
		i = 0;
		if (pickRow >= 0) {
			pickedMI = attrLookup( pickCS, fields.MI_table[0] + '_$' + pickRow + '_' + fields.MI_name[0], fields.MI_name[1] ) || '';
			pickedTrueMI = attrLookup( pickCS, fields.MI_table[0] + '_$' + pickRow + '_' + fields.MI_trueName[0], fields.MI_trueName[1] ) || '';
			pickableQty = attrLookup( pickCS, fields.MI_table[0] + '_$' + pickRow + '_' + fields.MI_qty[0], fields.MI_qty[1] ) || '';
			pickedType = attrLookup( pickCS, fields.MI_table[0] + '_$' + pickRow + '_' + fields.MI_type[0], fields.MI_type[1] ) || '';
			while (i < fields.MIRows && putRow < 0) {
				mi = (attrLookup( putCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_name[0], fields.MI_name[1] ) || '');
				miTrueName = (attrLookup( putCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_trueName[0], fields.MI_trueName[1] ) || '');
				miType = (attrLookup( putCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_type[0], fields.MI_type[1] ) || '');
				if (mi.toLowerCase() == pickedMI.toLowerCase()
				 && miTrueName.toLowerCase() == pickedTrueMI.toLowerCase()
				 && miType.toLowerCase() == pickedType.toLowerCase()) {

					putRow = i;
//					log('makeShortPOPmenu: found same MI at row '+i);
				}
				i++;
			}
			i = 0;
		}
//		log('makeShortPOPmenu: after namesearch putRow is '+putRow);
		while (i < fields.MIRows && putRow < 0) {
			mi = attrLookup( putCS, fields.MI_table[0] + '_$' + i + '_' + fields.MI_name[0], fields.MI_name[1] );
			if (mi == '-') {
				putRow = i;
			}
			i++;
		}
//		log('makeShortPOPmenu: after emptyslot search putRow is '+putRow);
		
		if (putRow < 0) {
			sendParsedMsg( tokenID, messages.miBagFull );
			return;
		}
		
		var content = '&{template:2Edefault}{{name=Pick up from ' + pickName + ' to put in ' + putName + '\'s Magic Item Bag}}';
		
		if (shortMenu) {
			content += '{{desc=Press the **[Select]** button to select the item you want to '+pickOrPut+' from a list of items in a container, '
					+ 'then press the **[Store]** button to automatically put it away in an empty slot}}'
					+ '{{Select=[Select Item to '+pickOrPut+'](!magic --button '+BT.POP_PICK+'|'+tokenID+'|?{'+pickOrPut+' which Item?'+miList+'}|'+pickID+'|'+putID+'|'+putRow+')}}'
					+ '{{Store=';
		} else {
			content += '{{desc=Select an item you want to '+pickOrPut+'\n'
					+  makeMIbuttons( tokenID, 'current', 'current', BT.POP_PICK, '|'+pickID+'|'+putID+'|'+putRow, pickRow, false, false, pickID )
					+  '}}{{desc1='
		}
		content +=((pickRow >= 0 && putRow >= 0) ? '[' : '<span style='+design.grey_button+'>')
				+ 'Store '+((pickRow >= 0) ? pickedMI : 'item')
				+ ((pickRow < 0 || putRow < 0) ? '</span>' : ('](!magic --button '+BT.POP_STORE+'|'+tokenID+'|'+pickRow+'|'+pickID+'|'+putID+'|'+putRow+'|-1)'))
				+ ' in free slot}}{{desc2=';
		if (pickingUp) {
			content += 'Or [View Coins, Gems & Treasure](!magic --button POPtreasure|' + tokenID + '|-1|' + pickID + '|' + putID + '|-1|-1)\nor ';
		}
		content += '[Use '+menuType+' menu](!magic --button '+(pickingUp ? BT.PICKMI_OPTION : BT.PUTMI_OPTION)+'|'+tokenID+'|'+menuType+'|'+pickID+'|'+putID+')}}';
			
//		log( content );

		sendResponse( charCS, content );
		return;
		
	}
	
	/*
	 * Create the Spells menus
	 */
	 
	var makeMUSpellsMenu = function( args ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makeMUSpellsMenu: invalid tokenID parameter');
			sendError('Invalid magicMaster parameter');
			return;
		}
		var level = casterLevel( charCS, 'MU' );
		
		var content = '&{template:2Edefault} {{name='+curToken.get('name')+'\'s Magic User Spells menu}}'
					+ '{{desc=[2. Cast MU spell](!magic --cast-spell MU|'+tokenID+'|'+level+')\n'
					+ '[3. Short Rest for L1 MU Spells](~MU-Spells|Short-Rest)\n'
					+ '[3. Long Rest and recover MU spells](~MU-Spells|Reset-spells)\n'
					+ '[4. Memorise MU spells](!magic --mem-spell MU|'+tokenID+')\n'
					+ '[4. View MU Spellbook](!magic --view-spell MU|'+tokenID+')}}';
					
		sendResponse( charCS, content );
		return;
	};
	
	var makePRSpellsMenu = function( args ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makePRSpellsMenu: invalid tokenID parameter');
			sendError('Invalid magicMaster parameter');
			return;
		}
		var level = casterLevel( charCS, 'PR' );
		
		var content = '&{template:2Edefault} {{name='+curToken.get('name')+'\'s Clerical Spells menu}}'
					+ '{{desc=[2. Cast Priest spell](!magic --cast-spell PR|'+tokenID+'|'+level+')\n'
					+ '[3. Short Rest for L1 Priest Spells](~PR-Spells|Short-Rest)\n'
					+ '[3. Long Rest and recover Priest spells](~PR-Spells|Reset-spells)\n'
					+ '[4. Memorise Priest spells](!magic --mem-spell PR|'+tokenID+')\n'
					+ '[4. View Priest Spellbook](!magic --view-spell PR|'+tokenID+')}}';
					
		sendResponse( charCS, content );
		return;
	};
	
	var makePowersMenu = function( args ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makePowersMenu: invalid tokenID parameter');
			sendError('Invalid magicMaster parameter');
			return;
		}
		var level = characterLevel( charCS );
		
		var content = '&{template:2Edefault} {{name='+curToken.get('name')+'\'s Powers menu}}'
					+ '{{desc=[2. Use Power](!magic --cast-spell POWER|'+tokenID+'|'+level+')\n'
					+ '[3. Long Rest](!magic --rest '+tokenID+'|LONG)\n'
					+ '[4. Memorise Powers](!magic --mem-spell POWER|'+tokenID+')\n'
					+ '[4. View Powers](!magic --view-spell POWER|'+tokenID+')}}';
					
		sendResponse( charCS, content );
		return;
	};
	
	/*
	 * Menu to ask the user to confirm that they want
	 * to blank the specified repeating table
	 */
	 
	var menuConfirmBlank = function( args, question ) {
		
		var cmd = args[0],
			tokenID = args[1],
			charCS = getCharacter(tokenID),
			content = '&{template:2Edefault}{{name=Confirm Action}}'
					+ '{{desc='+question+'}}'
					+ '{{desc1=[Yes](!magic --button '+args[0]+'|'+tokenID+') or [No](!magic --button '+BT.ANSWER_NO+'|'+tokenID+')}}';
					
		sendResponse(charCS,content);
	}
	
// ------------------------------------------------------------ Menu Button Press Handlers --------------------------------------------

	/**
	 * Handle the selection of an option button on a menu,
	 * usually used to set short or long menus.
	 */
	 
	var handleOptionButton = function( args, senderId ) {
		
		var isView = args[0].toUpperCase().includes('VIEW'),
			tokenID = args[1],
			optionValue = args[2].toLowerCase(),
	        config = getSetPlayerConfig( senderId ) || {};

		if (!['short','long'].includes(optionValue)) {
			sendError( 'Invalid magicMaster menuType option.  Use short or long' );
			return;
		}
	        
        switch (args[0].toUpperCase()) {
        
        case BT.VIEWMI_OPTION:
		case BT.USEMI_OPTION:
            config.viewUseMIType = optionValue;
            getSetPlayerConfig( senderId, config );
			makeViewUseMI( [(isView ? BT.VIEW_MI : BT.USE_MI), tokenID, -1], senderId );
            break;
		case BT.EDITMI_OPTION:
			config.editBagType = optionValue;
            getSetPlayerConfig( senderId, config );
			makeEditBagMenu( [BT.EDIT_MI, tokenID, -1, ''], senderId, 'Using '+optionValue+' Edit MI Bag menu' );
			break;
		case BT.PICKMI_OPTION:
			config.pickUpMIType = optionValue;
            getSetPlayerConfig( senderId, config );
			makeShortPOPmenu( ['POPmenu',tokenID,-1,args[3],args[4],-1], senderId );
			break;
		case BT.PUTMI_OPTION:
			config.putAwayMIType = optionValue;
            getSetPlayerConfig( senderId, config );
			makeShortPOPmenu( ['POPmenu',tokenID,-1,args[3],args[4],-1], senderId );
			break;
            
        default:
            sendError( senderId, 'Invalid magicMaster option. [Show Help](!magic --help)');
            break;
        };
		return;
	}

	/**
	* Handle the results of pressing a spell-selection button
	* or a power-selection button
	**/
	
	var handleChooseSpell = function( args ) {
		
		if (args[3].length == 0 || isNaN(args[3]) || args[4].length == 0 || isNaN(args[4])) {
			sendDebug('handleChooseSpell: invalid row or column');
			sendError('Internal magicMaster error');
		}

		if (args[0] == BT.MI_SPELL) {
			var charCS = getCharacter(args[1]),
				col = (fields.SpellsFirstColNum || args[4] != 1) ? args[4] : '',
				storedLevel = attrLookup( charCS, fields.Spells_table[0]+col+'_$'+args[3]+'_'+fields.Spells_storedLevel[0]+col, fields.Spells_storedLevel[1] );
			if (storedLevel && storedLevel > 0) {
				setAttr( charCS, fields.Casting_level, storedLevel );
			}
		}
	
		makeCastSpellMenu( args );
		return;
				
	}
	
	/**
	 * Handle a selected spell being cast
	 */
	 
	var handleCastSpell = function( args ) {
		
		var tokenID = args[1],
			rowIndex = args[3],
			colIndex = args[4],
			charCS = getCharacter(tokenID),
			db, action;
			
		if (!charCS) {
			sendDebug('handleCastSpell: invalid tokenID parameter');
			sendError('Internal spellMaster error');
			return;
		}
		if (args[3].length == 0 || isNaN(args[3]) || args[4].length == 0 || isNaN(args[4])) {
			sendDebug('handleCastSpell: invalid row or column');
			sendError('Internal magicMaster error');
		}
		
		var colNum = (fields.SpellsFirstColNum || colIndex != 1) ? colIndex : '',
			spellRef = fields.Spells_table[0] + colNum + '_$' + rowIndex + '_',
			spellName = attrLookup( charCS, spellRef+fields.Spells_name[0]+colNum, fields.Spells_name[1] ) || '-',
			spellMsg = attrLookup( charCS, spellRef+fields.Spells_msg[0]+colNum, fields.Spells_msg[1] ) || '',
			charName = charCS.get('name');

		switch (args[0]) {
		case BT.USE_POWER:
			db = fields.PowersDB;
			action = 'using';
			break;
		case BT.CAST_MUSPELL:
			db = fields.MU_SpellsDB;
			action = 'casting';
			break;
		case BT.CAST_PRSPELL:
			db = fields.PR_SpellsDB;
			action = 'casting';
			break;
		case BT.CAST_MISPELL:
			db = attrLookup( charCS, spellRef+fields.Spells_db[0]+colNum, fields.Spells_db[1] );
			action = 'using their magic item to cast';
			break;
		}
		
		var	spell = abilityLookup( db, spellName ),
			spellCost = ((!!spell.ct && (args[0] != BT.CAST_MISPELL)) ? spell.ct[0].get('max') : 0),
			totalLeft,
			content,
			spellValue = parseInt((attrLookup( charCS, spellRef+fields.Spells_castValue[0]+colNum, fields.Spells_castValue[1] ) || 0),10);
			
		setAttr( charCS, fields.SpellToMem, spellName );
		setAttr( charCS, fields.Expenditure, spellCost );
		setAttr( charCS, fields.SpellRowRef, rowIndex );
		setAttr( charCS, fields.SpellColIndex, colIndex );
		setAttr( charCS, fields.SpellCharges, spellValue-1 );
		setAttr( charCS, fields.SpellChosen, 1 );
		
		if (spellValue > 0) {
		    spellValue--;
			setAttr( charCS, [spellRef+fields.Spells_castValue[0]+colNum, fields.Spells_castValue[1]], spellValue );
		}
//		if (spellValue == 0) {
//			setAttr( charCS, [spellRef+fields.Spells_name[0]+colNum,fields.Spells_name[1]], '-' );
//		}
		
		if (spellMsg.length > 0) {
			sendResponse( charCS, spellMsg );
		}
		
		totalLeft = spendMoney( charCS, spellCost );
		content = charName + ' is '+action+' [' + spellName + '](!&#13;&#47;w gm &#37;{'+spell.dB+'|'+spellName+'})'
				+ ' at a cost of [[' + spellCost + ']]GP (leaving [[' + totalLeft + ']]GP).'
				+ '  Select ' + charName + '\'s token before pressing to see effects.';
		sendFeedback( content );

		return;
	}
	
	/*
	 * Handle redisplaying the manage spells menu
	 * Used when selecting a spell or slot to memorise,
	 * or when changing level of spell to memorise.
	 */
	 
	var handleRedisplayManageSpells = function( args ) {
		
		var msg = '';

		if ((args[3] >= 0 && args[4] >= 0) || (args[5] && args[5].length > 0)) {
			msg += 'Selected ';
		}
		if (args[5] && args[5].length > 0) {
			msg += args[5] + ' to store';
		}
		if (args[3] >= 0 && args[4] >= 0 && args[5] && args[5].length > 0) {
			msg += ' and ';
		}
		if (args[3] >= 0 && args[4] >= 0) {
			msg += 'a slot to store it in.';
		}

		makeManageSpellsMenu( args, msg );
		return;
	}
	
	/*
	 * Review a chosen spell description
	 */
	 
	var handleReviewSpell = function( args ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPower = args[0].toUpperCase().includes('POWER'),
			isMI = args[0].toUpperCase().includes('MI'),
			isView = !args[0].toUpperCase().includes('REVIEW'),
			tokenID = args[1],
			followOn,
			msg,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleReviewSpell: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
		
		if (isMI && isPower) {
			followOn = 'EDIT_MIPOWER';
		} else if (isMI) {
			followOn = (isView ? 'VIEW_MI' : 'CHOOSE_MI');
		} else if (isPower) {
			followOn = (isView ? 'VIEWMEM_POWER' : 'EDIT_POWER');
		} else if (isMU) {
			followOn = (isView ? 'VIEWMEM_MUSPELLS' : 'EDIT_MUSPELLS');
		} else {
			followOn = (isView ? 'VIEWMEM_PRSPELLS' : 'EDIT_PRSPELLS');
		}
		
		msg = '[Return to menu](!magic --button '+followOn+'|'+args[1]+'|'+args[2]+'|'+args[3]+'|'+args[4]+'|'+args[5]+')';
		sendResponse( charCS, msg );
		return;
	}
	
	/*
	 * Handle memorising a selected spell in a selected slot
	 */
	 
	var handleMemoriseSpell = function( args ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			level = args[2],
			row = args[3],
			spellCol = args[4],
			spellName = args[5],
			noToMemorise = parseInt((args[6]),10),
			dbCS,
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleMemoriseSpell: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
		
		if (args[3].length == 0 || isNaN(args[3]) || args[4].length == 0 || isNaN(args[4])) {
			sendDebug('handleChooseSpell: invalid row or column');
			sendError('Internal magicMaster error');
		}

		if (isNaN(noToMemorise)) {
			sendResponse('You must specify the number of uses as a number');
			return;
		}
		
		var spell = abilityLookup( isPower ? fields.PowersDB : (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB), spellName ),
			castTime = (!!spell.ct ? spell.ct[0].get('current') : 0),
			castCost = (!!spell.ct ? spell.ct[0].get('max') : 0),
			col = (fields.SpellsFirstColNum || level != 1 || spellCol != 1) ? spellCol : '',
			tableRef = fields.Spells_table[0] + col + '_$' + row + '_';
		
		setAttr( charCS, [tableRef + fields.Spells_name[0] + col, 'current'], spellName );
		setAttr( charCS, [tableRef + fields.Spells_name[0] + col, 'max'], spellName );
		setAttr( charCS, [tableRef + fields.Spells_speed[0] + col, fields.Spells_speed[1]], castTime );
		setAttr( charCS, [tableRef + fields.Spells_cost[0] + col, fields.Spells_cost[1]], castCost );
		setAttr( charCS, [tableRef + fields.Spells_castValue[0] + col, fields.Spells_castValue[1]], noToMemorise );
		setAttr( charCS, [tableRef + fields.Spells_castMax[0] + col, fields.Spells_castMax[1]], (isPower ? noToMemorise : 1) );
		
		if (isMI && isPower) {
			setAttr( charCS, ['power-'+spellName, 'current'], row );
			setAttr( charCS, ['power-'+spellName, 'max'], col );
		}

		args[3] = -1;
		args[4] = -1;
		args[5] = '';
		args[6] = 1;
		
		makeManageSpellsMenu( args, 'Memorised '+spellName );
		return;
	}
	
	/*
	 * Handle undertaking a short rest to recover 1st level spells
	 */
	 
	var handleRest = function( args ) {
		
		var tokenID = args[0],
			isShort = args[1].toLowerCase().includes('short'),
			casterType = (args[2] || 'MU+PR').toUpperCase(),
			r, c, w,
			col, rep;
			
		if (casterType.includes('MI') && casterType.includes('POWER')){
			for (r = 0; (r < fields.MIPowersRows); r++) {
				c = fields.PowersBaseCol;
				for (w = 1; (w <= fields.PowersCols); w++) {
					col = (fields.PowersFirstColNum || c != 1) ? c : '';
					rep = fields.Powers_table[0] + col + '_$' + r + '_';
					setAttr( dB.miDB, [rep+fields.Spells_name[0]+col, 'current'], (attrLookup( dB.miDB, rep+fields.Spells_name[0]+col, 'max') || '-') );
					setAttr( dB.miDB, [rep+fields.Spells_castValue[0]+col, fields.Spells_castValue[1]], (attrLookup( dB.miDB, rep+fields.Spells_castMax[0]+col, fields.Spells_castMax[1] ) || 0) );
					c++;
				}
			}
			return;
		}

		var isMU = casterType.includes('MU'),
			isPR = casterType.includes('PR'),
			isMI = !isShort,
			isPower = !isShort,
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleRest: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
		
		var sheetTypes = getSheetTypes( charCS ),
		    levelSpells,
		    level,
		    restType;
		
		while (isMU || isPR || isPower) {
			restType = (isPower ? 'POWER' : (isMU ? 'MU' : 'PR' ));
			levelSpells = shapeSpellbook( charCS, restType );
			level = 1;
			while ((((restType != 'POWER') && !isShort) || level == 1) && levelSpells[level].spells > 0) {
				r = 0;
				while (levelSpells[level].spells > 0) {
					c = levelSpells[level].base;
					for (w = 1; (w <= fields.SpellsCols) && (levelSpells[level].spells > 0); w++) {
						col = (fields.SpellsFirstColNum || c != 1) ? c : '';
						rep = fields.Spells_table[0] + col + '_$' + r + '_';
						setAttr( charCS, [rep+fields.Spells_name[0]+col, 'current'], (attrLookup( charCS, rep+fields.Spells_name[0]+col, 'max') || '-'));
						setAttr( charCS, [rep+fields.Spells_castValue[0]+col, fields.Spells_castValue[1]], (restType != 'POWER' ? 1 : (attrLookup( charCS, rep+fields.Spells_castMax[0]+col, fields.Spells_castMax[1] ) || 0)) );
						c++;
						levelSpells[level].spells--;
					}
					r++;
				}
				level++;
			}

			switch (restType) {
			case 'POWER':
				isPower = false;
				break;
			case 'MU':
				isMU = false;
				break;
			case 'PR':
				isPR = false;
				break;
			}
		}
		
		if (isMI) {
			for (r = 0; (r < fields.MIRows); r++) {
				rep = (!fields.MIFirstRowNum && r == 0) ? '' : fields.MI_table[0] + '_$'+r+'_';
				if (!attrLookup( charCS, rep+fields.MI_name[0], fields.MI_name[1] )) break;
				setAttr( charCS, [rep + fields.MI_speed[0], 'current'], attrLookup( charCS, rep + fields.MI_speed[0], 'max' ) );
				setAttr( charCS, [rep + fields.MI_qty[0], 'current'], attrLookup( charCS, rep + fields.MI_qty[0], 'max' ) );
			}
		}
		
		return;
	}
	
	/*
	 * Handle time passing.  Update both the character sheet for 
	 * this character, and the global date if it is behind the
	 * character date 
	 */
	 
	var handleTimePassing = function( charCS, timeSpent ) {
		
		timeSpent = Math.ceil(timeSpent);
		var charDay = parseInt((attrLookup( charCS, fields.CharDay[0], fields.CharDay[1] ) || 0),10) + timeSpent,
			today = parseInt((attrLookup( dB.dtDB, fields.Today[0], fields.Today[1] ) || 0),10),
			globalDay = Math.max( today, charDay );
			
		setAttr( charCS, fields.CharDay, globalDay );
		if (today == globalDay)
			{return globalDay;}
			
		setAttr( dB.dtDB, fields.Today, globalDay );
		setAttr( dB.dtDB, fields.Today_weekday, (1+(globalDay%7)) );
		setAttr( dB.dtDB, fields.Today_day, (1+(globalDay%28)) );
		setAttr( dB.dtDB, fields.Today_dayth, Math.min((1+((globalDay%28)%20)),4) );
		setAttr( dB.dtDB, fields.Today_month, (1+Math.floor((globalDay%336)/28)) );
		setAttr( dB.dtDB, fields.Today_year, Math.floor(globalDay/336) );
		
		return globalDay;
	}
	
	/*
	 * Handle the selection of a magic item
	 * to use or view
	 */
	 
	var handleChooseMI = function( args, senderId ) {
		
		makeViewUseMI( args, senderId );
		return;
	}
	
	/*
	 * Handle viewing or using a magic item.
	 * The calling of the MI macro from the MI-DB is performed
	 * in the [Submit] button of the menu.
	 */

	var handleViewUseMI = function( args, isSilent, charges=1 ) {
		
		var action = args[0].toUpperCase(),
			tokenID = args[1],
			MIrowref = parseInt(args[2],10),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleViewUseMI: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
		
		if (action.includes('VIEW')) {
    		sendResponse( charCS, '[Return to menu](!magic --button '+BT.CHOOSE_VIEW_MI+'|'+args[1]+'|'+args[2]+')' );
			return;
		}

		if (isNaN(MIrowref) || MIrowref < 0) {
			sendDebug('handleViewUseMI: invalid MIrowref parameter');
			sendError('Internal magicMaster error');
			return;
		}
			
		var charName = charCS.get('name'),
			ref = fields.MI_table[0] + '_$' + MIrowref + '_',
			MIname = attrLookup( charCS, ref+fields.MI_name[0], fields.MI_type[1] ),
			MIqtyObj = attrLookup( charCS, ref+fields.MI_qty[0] ),
			MIqty = MIqtyObj.get(fields.MI_qty[1]),
			MItype = (attrLookup( charCS, ref+fields.MI_type[0], fields.MI_type[1] ) || 'uncharged').toLowerCase(),
			MIdb = abilityLookup( fields.MagicItemDB, MIname );
			
		setAttr( charCS, ['MIrowref', 'current'], MIrowref );

		if (MIqty < charges) {
			sendResponse( charCS, '&{template:2Edefault}{{name=Using '+MIname+'}}{{desc='+MIname+' does not have enough charges left to do this}}'
								 +'{{desc1=[Show '+MIname+' again](\~'+MIdb.dB+'|'+MIname+') or do something else}}' );
			return;
		}
			
		switch (MItype) {
		case 'charged':
			if (MIqty == charges) {
				blankSlot( charCS, MIrowref );
			} else {
				MIqtyObj.set('current',(MIqty-charges));
				MIqtyObj.set('max',(MIqty-charges));
			}
			break;

		case 'rechargeable':
			if (MIqty >= charges) {
				MIqtyObj.set('current',(MIqty-charges));
				MIqtyObj.set('max',(MIqty-charges));
			}
			break;
			
		case 'recharging':
			if (MIqty >= charges) {
				MIqtyObj.set('current',(MIqty-charges));
			}
			break;
				
		case 'uncharged':
		default:
			break;
		}
		
		if (isSilent) {
			return;
		}

		var MIobj = abilityLookup( fields.MagicItemDB, MIname ),
			content = '&{template:2Edefault}{{name='+charName+' is using '+MIname+'}}'
					+ '{{desc=To see the effects, select '+charName+'\'s token and press ['+MIname+'](~'+MIobj.dB+'|'+MIname+')}}';
		sendFeedback( content );
		return;
	}
	
	/*
	 * Handle the selection of a spell to store in
	 * a Magic Item, and the slot in the MI spellbook
	 * to store it in.
	 */
	 
	var handleSelectMIspell = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleViewUseMI: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			spellButton = args[(isMI ? 5 : 2)],
			spellRow = args[(isMI ? 6 : 3)],
			spellCol = args[(isMI ? 7 : 4)],
			MIbutton = args[(isMI ? 2 : 5)],
			MIrow = args[(isMI ? 3 : 6)],
			MIcol = args[(isMI ? 4 : 7)],
			spellName = '',
			col,
			content = '';
			
		if (spellButton >= 0) {
			col = (fields.SpellsFirstColNum || spellCol != 1) ? spellCol : '';
			spellName = attrLookup( charCS, fields.Spells_table[0]+col + '_$'+spellRow + '_' + fields.Spells_name[0]+col, fields.Spells_name[1] ) || '-';
			content += 'Selected '+spellName+' to store';
			if (MIbutton >= 0) {
				content += ' and ';
			}
		}
		if (MIbutton >= 0) {
			col = (fields.SpellsFirstColNum || MIcol != 1) ? MIcol : '';
			spellName = attrLookup( charCS, fields.Spells_table[0]+col + '_$'+MIrow + '_' + fields.Spells_name[0]+col, fields.Spells_name[1] ) || '-';
			content += 'Selected to store in the slot for '+spellName;
		}
		makeStoreMIspell( args, content );
		return;
	}
	
	/*
	 * Handle selecting a magic item power
	 */
	 
	var handleSelectMIpower = function( args, isUse ) {
	    
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
		if (!charCS) {
			sendDebug('handleSelectMIpower: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
			
		var powerName = args[2] || '',
			itemName = args[3] || '',
			castLevel = args[4] || 1,
			magicItem = abilityLookup( fields.MagicItemDB, itemName ),
			MIlibrary = (!magicItem.obj || magicItem.obj.length === 0) ? undefined : getObj('character', magicItem.obj[0].get('characterid'));
			
		if (!MIlibrary) {
			sendDebug('handleSelectMIpower: unable to find MIlibrary');
			sendError('Invalid magicMaster arguments');
			return;
		}
		
		var powerRow = attrLookup( MIlibrary, 'power-'+powerName, 'current' ),
			powerCol = attrLookup( MIlibrary, 'power-'+powerName, 'max' ),
			col = (fields.PowersFirstColNum || powerCol != 1) ? powerCol : '',
			rep = fields.Powers_table[0] + col + '_$' + powerRow + '_',
			power = attrLookup( MIlibrary, rep+fields.Powers_name[0]+col, fields.Powers_name[1] ) || '-',
			powerLib = abilityLookup( fields.PowersDB, power ),
			powerCount = attrLookup( MIlibrary, rep+fields.Powers_castValue[0]+col, fields.Powers_castValue[1] ) || 0,
			content = '';
		
		if (isUse) {
			if (powerCount > 0) {
				setAttr( MIlibrary, [rep+fields.Powers_castValue[0]+col, fields.Powers_castValue[1]], powerCount-1 );
			}
			content = charCS.get('name') + ' is using [' + power + '](!&#13;&#47;w gm &#37;{'+powerLib.dB+'|'+power+'}). '
					+ 'Select ' + charCS.get('name') + '\'s token before pressing to see effects.';
			sendFeedback( content );
			
		} else if (powerCount == 0) {
			content = '&{template:2Edefault}{{name='+itemName+'\'s '+powerName+' power}}'
					+ '{{desc=You have already used all '+itemName+'\'s '+powerName+' charges for today.  '
					+ 'You need to allow '+itemName+' to have a long rest so it can regain all its powers}}'
					+ '{{desc1=[Redisplay '+itemName+'](~'+magicItem.dB+'|'+itemName+') or just do something else}}';
			sendResponse( charCS, content );
		} else {
			setAttr( charCS, fields.SpellToMem, powerLib.dB+'|'+power );
			setAttr( charCS, fields.Casting_name, itemName );
			setAttr( charCS, fields.Casting_level, castLevel );
			args = ['',tokenID,powerName,castLevel,itemName,magicItem.dB,power,powerLib.dB];
			makeUseMIpowerMenu( args );
		}
	    return;
	}
	
	/*
	 * Handle storing a spell from a characters memorised
	 * spells into a spell-storing magic item.
	 */
	 
	var handleStoreMIspell = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleViewUseMI: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			MIbutton = args[2],
			MIrow = args[3],
			MIcol = args[4],
			spellButton = args[5],
			spellRow = args[6],
			spellCol = args[7];
			
		if (isNaN(MIbutton) || MIbutton<0 || isNaN(MIrow) || isNaN(MIcol) || isNaN(spellButton) || spellButton<0 || isNaN(spellRow) || isNaN(spellCol)) {
			sendDebug('handleViewUseMI: invalid button, row or col parameter');
			sendError('Internal magicMaster error');
			return;
		}
			
		var	toCol = (fields.SpellsFirstColNum || MIcol != 1) ? MIcol : '',
			toRef = fields.Spells_table[0]+toCol + '_$'+MIrow + '_',
			fromCol = (fields.SpellsFirstColNum || spellCol != 1) ? spellCol : '',
			fromRef = fields.Spells_table[0]+fromCol + '_$'+spellRow + '_',
			spellName = attrLookup( charCS, fromRef+fields.Spells_name[0]+fromCol, fields.Spells_name[1] );
			
		setAttr( charCS, [toRef+fields.Spells_name[0]+toCol, fields.Spells_name[1]], spellName );
		setAttr( charCS, [toRef+fields.Spells_db[0]+toCol, fields.Spells_db[1]], (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB) );
		setAttr( charCS, [toRef+fields.Spells_speed[0]+toCol, fields.Spells_speed[1]], attrLookup( charCS, fromRef+fields.Spells_speed[0]+fromCol, fields.Spells_speed[1] ));
		setAttr( charCS, [toRef+fields.Spells_castValue[0]+toCol, fields.Spells_castValue[1]], 1 );
		setAttr( charCS, [toRef+fields.Spells_castMax[0]+toCol, fields.Spells_castMax[1]], 1 );
		setAttr( charCS, [toRef+fields.Spells_storedLevel[0]+toCol, fields.Spells_storedLevel[1]], attrLookup( charCS, fields.Casting_level[0], fields.Casting_level[1] ));
		setAttr( charCS, [toRef+fields.Spells_cost[0]+toCol, fields.Spells_cost[1]], 0 );
		setAttr( charCS, [fromRef+fields.Spells_castValue[0]+fromCol, fields.Spells_castValue[1]], 0 );
		
		args[2] = args[5] = -1;
		
		makeStoreMIspell( args, 'Stored '+spellName+' in '+getObj('graphic',tokenID).get('name')+'\'s spell storing magic item' );
		return;
	}	
	
	/**
	 * handle where somehow the player has been able to select an empty slot
	 **/

	var handlePickupNothing = function( args, pickMI, putSlot ) {
		
		var tokenID = args[1],
		    fromID = args[3],
		    toID = args[4],
		    fromRow = args[2],
		    toRow = args[5],
		    fromCS = getCharacter(fromID),
		    toCS = getCharacter(toID);
			
		if (!fromCS || !toCS){
			sendDebug('handlePickupNothing: invalid tokenID parameter');
			sendError('Internal magicMaster error');
			return;
		}
			
		var fromName = fromCS.get('name'),
			toName = toCS.get('name'),
		    targetID = (tokenID == fromID) ? toID : fromID,
		    content = messages.nothingToPick + '{{desc1=Trying to pick up "'+pickMI+'" from '+fromName+' and putting in '+toName+'\'s "'+putSlot+'"}}'
		            + '{{desc2=[Other way round](!magic --button POPsubmit|'+tokenID+'|'+toRow+'|'+toID+'|'+fromID+'|'+fromRow+'|-1)'
		            + ' or [Pick something else](!magic --pickorput '+tokenID+'|'+targetID+')}}';
		sendParsedMsg( tokenID, content );
		return;		
	};
	
	/**
	* Handle switching to a treasure menu
	**/

	var handleTreasure = function( args, senderId ) {
		
		var tokenID = args[1],
			charCS = getCharacter( tokenID ),
			content = makeLootMenu( senderId, args );
		sendResponse( charCS, content );
		return;
	};
	
	/**
	* handle the failure of an attempt to pick pockets
	**/
	
	var handlePPfailed = function( args, senderId ) {
		
		var tokenID = args[1],
		    putID = args[2],
			targetID = args[3],
			ppRoll = parseInt(args[4],10),
			charCS = getCharacter( tokenID ),
			targetCS = getCharacter( targetID );
			
		if (!tokenID || !targetID || !charCS || !targetCS) {
			sendDebug('handlePPfailure: invalid ID argument passed');
			sendError('Invalid magicMaster parameter');
			return;
		};
		
		if (isNaN(ppRoll)) {
			sendDebug('handlePPfailure: invalid ppRoll');
			sendError('Invalid magicMaster parameter');
			return;
		}
		
		var	charName = charCS.get('name'),
			targetName = targetCS.get('name'),
			targetLevel,
    		content = '&{template:2Edefault}{{name=Failed pick pocket attempt by '+charName+'}}';
			
		targetLevel = characterLevel( targetCS );
		
		if (isNaN(targetLevel)) {
		    targetLevel = 0;
		}
		
		if (ppRoll > (100-(targetLevel*3))) {
			content += '{{desc='+charName+' tried to pick '+targetName+'\'s pocket unsuccessfully and they noticed.  What will '+targetName+' do about it?}}';
			sendResponse( targetCS, content );
		} else {
			content += '{{desc='+charName+' tried to pick '+targetName+'\'s pocket, but they did not notice.}}';
			sendFeedback( content );
		};
		content = '&{template:2Edefault}{{name='+charName+' is Picking Pockets for MIs}}'
				+ '{{desc=Oh dear! Failed! Nothing to see here... now, did anyone notice?}}';
		return content;
	};
	
	/**
	* Handle a character picking or putting away an item to/from a store
	 * args[] is the standard action|charID|fromID|toID|fromRow|toRow|qty|cost
	 * qty -1 means not yet chosen, cost -1 means not yet agreed or no cost
	**/
	
	var handlePickOrPut = function( args ) {
	
		var tokenID = args[1],
			fromID = args[3],
			toID = args[4],
			fromRowRef = args[2],
			toRowRef = args[5],
			qty = args[6],
			expenditure = args[7],
			charCS = getCharacter( tokenID ),
			fromCS = getCharacter( fromID ),
			toCS = getCharacter( toID );
		
		if (!charCS || !fromCS || !toCS) {
		    sendDebug( 'handlePickOrPut: one or more tokenIDs do not represent valid characters' );
		    sendError('Invalid magicMaster button arguments');
		    return;
		}
		if (isNaN(fromRowRef) || fromRowRef<0 || isNaN(toRowRef) || toRowRef<0) {
			sendDebug('handlePickOrPut: invalid row or column parameter');
			sendError('Internal magicMaster error');
			return;
		}
		
		var	toTableRef = fields.MI_table[0] + '_$' + toRowRef + '_',
			fromTableRef = fields.MI_table[0] + '_$' + fromRowRef + '_',
			toSlotType = (attrLookup( toCS, toTableRef + fields.MI_type[0], fields.MI_type[1] ) || '').toLowerCase(),
			fromSlotType = (attrLookup( fromCS, fromTableRef + fields.MI_type[0], fields.MI_type[1] ) || '').toLowerCase(),
			MIname = attrLookup( fromCS, fromTableRef + fields.MI_name[0], fields.MI_name[1] ),
			MItrueName = attrLookup( fromCS, fromTableRef + fields.MI_trueName[0], fields.MI_trueName[1] ),
		    toSlotName = attrLookup( toCS, toTableRef + fields.MI_name[0], fields.MI_name[1] ),
			toSlotTrueName = attrLookup( toCS, toTableRef + fields.MI_trueName[0], fields.MI_trueName[1] ),
			sameMI = (MItrueName.toLowerCase() == toSlotTrueName.toLowerCase()) && (toSlotType == fromSlotType),
			toSlotEmpty = toSlotName == '-';
			
		if (toSlotType.includes('cursed') && !sameMI && !toSlotEmpty) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Select another slot](!magic --button '+BT.POP_PICK+'|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|-1)}}' );
			return;
		}
			
		if (fromSlotType.includes('cursed') && fromID == tokenID) {
			sendParsedMsg( tokenID, messages.cursedItem + '{{desc1=[Select another item](!magic --button '+BT.POP_PICK+'|'+tokenID+'|-1|'+fromID+'|'+toID+'|'+toRowRef+')}}' );
			return;
		}
			
		var	MIqty = parseInt( (attrLookup( fromCS, fromTableRef + fields.MI_qty[0], fields.MI_qty[1] ) || 0), 10),
			MItrueQty = attrLookup( fromCS, fromTableRef + fields.MI_trueQty[0], fields.MI_trueQty[1] ),
			MIspeed = attrLookup( fromCS, fromTableRef + fields.MI_speed[0], fields.MI_speed[1] ),
			MItrueSpeed = attrLookup( fromCS, fromTableRef + fields.MI_trueSpeed[0], fields.MI_trueSpeed[1] ),
		    MItype = attrLookup( fromCS, fromTableRef + fields.MI_type[0], fields.MI_type[1] ),
		    MIcost  = parseFloat(attrLookup( fromCS, fromTableRef + fields.MI_cost[0], fields.MI_cost[1] ) || 0),
    		toSlotQty = parseInt((attrLookup( toCS, toTableRef + fields.MI_qty[0], fields.MI_qty[1] ) || 0),10),
	    	toSlotCharges = parseInt((attrLookup( toCS, toTableRef + fields.MI_trueQty[0], fields.MI_trueQty[1] ) || 0),10),
			rechargeable = ['recharging','rechargeable','cursed-recharging','cursed-charged','cursed-rechargeable'],
			recharging = ['recharging','cursed-recharging'],
			finalQty, finalCharges, pickQty, charges, content;
		
		MIqty = isNaN(MIqty) ? 0 : MIqty;
		MIcost = isNaN(MIcost) ? 0 : MIcost;
	    toSlotQty = isNaN(toSlotQty) ? 0 : toSlotQty;
	    toSlotCharges = isNaN(toSlotCharges) ? 0 : toSlotCharges;
	    	
		switch (MIqty) {
		case 0:
			if (rechargeable.includes(fromSlotType)) {
				qty = pickQty = 0;
				charges = MItrueQty;
			} else {
				handlePickupNothing( args, MIname, toSlotName );
				return;
			};
			break;
		
		case 1:
			qty = 1;
			pickQty = charges = MItrueQty;
			MIqty = 0;
			break;
			
		default:
			if (rechargeable.includes(fromSlotType)) {
				qty = MIqty;
				pickQty = (recharging.includes(fromSlotType)) ? MIqty : MItrueQty;
				charges = MItrueQty;
				MIqty = 0;
			} else if (qty < 0) {
				howMany( args, MIname, fromSlotType, MIqty );
				return;
			} else if (qty >= MIqty) {
				qty = MIqty;
				pickQty = charges = MItrueQty;
				MIqty = 0;
			} else if (qty == 0) {
				return;
			} else {
				pickQty = charges = qty * Math.ceil(MItrueQty/MIqty);
			}
			break;
		}
		finalQty = pickQty;
		finalCharges = charges;
		
		if (toSlotName.toLowerCase() == MIname.toLowerCase()) {
		    finalQty += toSlotQty;
			finalCharges += toSlotCharges;
		} else if (toSlotType != '' && (toSlotName != '-')) {
			content = messages.slotFull;
			content += '{{[Choose another slot](!magic --pickorput|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|-1)}}';
			sendParsedMsg( tokenID, content );
			return;
		}
		
		if (!_.isUndefined(expenditure)) {
		    expenditure = parseFloat(expenditure);
		}
		
		if (_.isUndefined(expenditure) || isNaN(expenditure) || expenditure < 0) {
			expenditure = MIcost * qty;
			if (expenditure && charCS.id != fromCS.id) {
				setAttr( charCS, ['expenditure', 'current'], expenditure );
				content = '&{template:2Edefault}{{name=Pay for Goods}}'
						+ '{{desc=The goods you have selected from '+fromCS.get('name')+' have a total cost of '+showCost(expenditure)+'.  Are you happy to pay this?}}'
						+ '{{desc1=[Buy goods](!magic --button POPbuy|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|'+toRowRef+'|'+qty+'|'+expenditure+') or'
						+ '[Choose something else](!magic --pickorput '+tokenID+'|'+fromID+'|'+toID+')}}';
				sendResponse( charCS, content );
				return;
			}
		}
		
        if (expenditure != 0) {
    		spendMoney( toCS, expenditure, fromCS );
        }
		
		setAttr( toCS, [toTableRef + fields.MI_name[0], fields.MI_name[1]], MIname );
		setAttr( toCS, [toTableRef + fields.MI_trueName[0], fields.MI_trueName[1]], MItrueName);
		setAttr( toCS, [toTableRef + fields.MI_qty[0], fields.MI_qty[1]], finalQty );
		setAttr( toCS, [toTableRef + fields.MI_trueQty[0], fields.MI_trueQty[1]], finalCharges );
		setAttr( toCS, [toTableRef + fields.MI_speed[0], fields.MI_speed[1]], MIspeed );
		setAttr( toCS, [toTableRef + fields.MI_trueSpeed[0], fields.MI_trueSpeed[1]], MItrueSpeed );
		setAttr( toCS, [toTableRef + fields.MI_cost[0], fields.MI_cost[1]], 0 );
		setAttr( toCS, [toTableRef + fields.MI_type[0], fields.MI_type[1]], MItype );
		
		if (MIqty == 0) {
			blankSlot( fromCS, fromRowRef );
		} else {
			setAttr( fromCS, [fromTableRef + fields.MI_trueQty[0], fields.MI_trueQty[1]], (MItrueQty - charges) );
			setAttr( fromCS, [fromTableRef + fields.MI_qty[0], fields.MI_qty[1]], (MIqty - qty) );
		};

		pickupMessage( args, MIname, MItype, qty, (MItrueQty - qty), finalCharges );
		return;
	};
	
	/*
	 * Handle selecting a magic item to store in the
	 * displayed magic item bag.
	 */
 
	var handleSelectMI = function( args, GMonly, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MItoStore = args[3],
			charCS = getCharacter(tokenID);
			
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
		
		setAttr( charCS, ['MItomem', 'current'], MItoStore );
		setAttr( charCS, ['MIct', 'current'], (attrLookup( dB.miDB, 'ct-'+MItoStore, 'current' ) || 0) );
		setAttr( charCS, ['MItype', 'current'], (attrLookup( dB.miDB, 'ct-'+MItoStore, 'max' ) || 'uncharged') );
		setAttr( charCS, ['MI-chosen', 'current'], 1 );
		
		if (GMonly) {
			makeGMonlyMImenu( args );
		} else {
			makeEditBagMenu( args, senderId, 'Selected '+MItoStore+' to store' );
		}
		return;
	};

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
		if (!MIrowref || isNaN(MIrowref) || MIrowref<0 || !MIchosen || MIchosen.length == 0) {
			sendDebug('handleSelectSlot: invalid MI parameter passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			slotItem;

		setAttr( charCS, ['MIrowref', 'current'], MIrowref );
		setAttr( charCS, ['MIcur', 'current'], (slotItem = (attrLookup( charCS, slotRef+fields.MI_name[0], fields.MI_name[1] ) || '-')) );
		setAttr( charCS, ['MIcurqty', 'current'], (attrLookup( charCS, slotRef+fields.MI_qty[0], fields.MI_qty[1] ) || 0 ) );
		setAttr( charCS, ['foundtype', 'current'], (attrLookup( charCS, slotRef+fields.MI_type[0], fields.MI_type[1] ) || 'uncharged' ) );
		setAttr( charCS, ['expenditure', 'current'], (attrLookup( charCS, slotRef+fields.MI_cost[0], fields.MI_cost[1] ) || 0 ) );
		setAttr( charCS, ['MI-chosen', 'current'], 1 );
		
		if (GMonly) {
			makeGMonlyMImenu( args );
		} else {
			makeEditBagMenu( args, senderId, 'Selected slot currently containing '+slotItem );
		}
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
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			slotNameObj = attrLookup( charCS, slotRef + fields.MI_name[0] ),
			slotQtyObj = attrLookup( charCS, slotRef + fields.MI_qty[0] ),
			slotSpeedObj = attrLookup( charCS, slotRef + fields.MI_speed[0] ),
			slotTypeObj = attrLookup( charCS, slotRef + fields.MI_type[0] ),
			slotCostObj = attrLookup( charCS, slotRef + fields.MI_cost[0] ),
			slotName = slotNameObj.get('current'),
			
			magicItem = abilityLookup( fields.MagicItemDB, MIchosen ),
			MIspeed = (magicItem.ct ? magicItem.ct[0].get('current') : undefined),
			MItype = (magicItem.ct ? magicItem.ct[0].get('max') : undefined);
			
		if (_.isUndefined(MIspeed) || _.isUndefined(MItype)) {
			sendDebug('handleStoreMI: selected magic item speed/type not defined');
			sendError('Selected Magic Item not fully defined');
			return;
		}
		
		if (!GMonly && slotTypeObj.get(fields.MI_type[1]).includes('cursed')) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!magic --edit-mi '+tokenID+')}}' );
			return;
		}

		slotNameObj.set('current',MIchosen);
		slotNameObj.set('max',MIchosen);
		slotSpeedObj.set('current',MIspeed);
		slotSpeedObj.set('max',MIspeed);
		slotQtyObj.set('current',MIqty);
		slotQtyObj.set('max',MIqty);
		slotCostObj.set(fields.MI_cost[1],0);
		slotTypeObj.set(fields.MI_type[1],MItype);
		
		args = ['',tokenID,-1,''];
		
		if (GMonly) {
			makeGMonlyMImenu( args, MIchosen + ' has been stored in slot '+MIrowref );
		} else {
			makeEditBagMenu( args, senderId, MIchosen+' has overwritten '+slotName );
		}
		return;
	}
	
	/*
	 * Handle changing the displayed magic item name to that selected
	 * without changing what it actually is.  Only available to GM
	 */
 
	var handleHideMI = function( args ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleHideMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleHideMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_';
		
		setAttr( charCS, [slotRef + fields.MI_name[0], fields.MI_name[1]], MIchosen );
		makeGMonlyMImenu( ['',tokenID,-1,''], 'Slot '+MIrowref+' is now displayed as '+MIchosen );
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
		
		var slotType = attrLookup( charCS, fields.MI_table[0] + '_$' + MIrowref + '_' + fields.MI_type[0], fields.MI_type[1] ) || '';
		if (!GMonly && slotType.toLowerCase().includes('cursed')) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!magic --edit-mi '+tokenID+')}}' );
			return;
		}
		blankSlot( charCS, MIrowref );

		args[2] = -1;
		args[3] = '';
		if (GMonly) {
			makeGMonlyMImenu( args, 'Slot '+MIrowref+' has been blanked' );
		} else {
			makeEditBagMenu( args, senderId, 'Slot '+MIrowref+' has been removed' );
		}
		return;
	};
	
	/*
	 * Handle changing the type of a Magic Item.  Only available to the GM.
	 */
	 
	var handleChangeMItype = function( args ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			newType = args[4],
			charCS = getCharacter(tokenID);
		
		if (!charCS) {
			sendDebug('handleChangeMItype: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleChangeMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			MIname = attrLookup( charCS, slotRef + fields.MI_name[0], fields.MI_name[1] ) || '-';

		setAttr( charCS, [slotRef + fields.MI_type[0], fields.MI_type[1]], newType );
		makeGMonlyMImenu( ['',tokenID,-1,''], MIname+' has been changed to be type '+newType );
		return;
	}
	
	/*
	 * Handle changing the number of charges.  A parameter determines if
	 * the displayed charges, the actual charges or both are set.
	 */
	 
	var handleChangeMIcharges = function( args, changeType ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MInewQty = args[4],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleChangeMIcharges: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleChangeMIcharges: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			MIname = attrLookup( charCS, slotRef + fields.MI_name[0], fields.MI_name[1] ) || '-';

		if (changeType == 'Displayed' || changeType == 'Both') {
			setAttr( charCS, [slotRef+fields.MI_qty[0], 'current'], MInewQty );
		}
		if (changeType == 'Actual' || changeType == 'Both') {
			setAttr( charCS, [slotRef+fields.MI_qty[0], 'max'], MInewQty );
		}
		
		makeGMonlyMImenu( ['',tokenID,-1,''], MIname+'\'s '+changeType+' quantity has been changed to '+MInewQty );
		return;
	}
	
	/*
	 * Handle resetting a single selected MI Bag slot, so that the 
	 * actual name and qty are displayed.
	 */
	 
	var handleResetSingleMI = function( args ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleResetSingleMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleResetSingleMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			MIname = attrLookup( charCS, slotRef + fields.MI_name[0], 'max' ) || '-';

		setAttr( charCS, [slotRef+fields.MI_name[0], 'current'], MIname );
		setAttr( charCS, [slotRef+fields.MI_qty[0], 'current'], attrLookup( charCS, slotRef+fields.MI_qty[0], 'max' ) );
		setAttr( charCS, [slotRef+fields.MI_speed[0], 'current'], (attrLookup( charCS, slotRef+fields.MI_speed[0], 'max' ) || 0) );
		
		makeGMonlyMImenu( ['',tokenID,-1,''], MIname+' has been reset' );
		return;
	}
	
	/*
	 * Handle change the cost of an MI, to support shops and Inns
	 */
	 
	var handleSetMIcost = function( args ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			newMIcost = args[4],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleSetMIcost: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleSetMIcost: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotRef = fields.MI_table[0] + '_$' + MIrowref + '_',
			MIname = attrLookup( charCS, slotRef + fields.MI_name[0], 'max' ) || '-';

		setAttr( charCS, [slotRef+fields.MI_cost[0], fields.MI_cost[1]], newMIcost );
		
		makeGMonlyMImenu( ['',tokenID,-1,''], MIname+' now costs '+newMIcost+'GP' );
		return;
	}
	
	/*
	 * Handle blanking the selected Magic Item bag.
	 */
	 
	var handleBlankMIBag = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleDeleteTreasure: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var content = '&{template:2Edefault}{{name=TOTALLY BLANK THE MI BAG}}'
					+ '{{desc=Are you REALLY sure you want to delete the complete MI Bag with all its contents?}}'
					+ '{{desc1=[Yes](!magic --button GM-ConfirmedBlank|'+tokenID+'|-1|) or [No](!magic --button GM-NoBlank|'+tokenID+'|-1|)}}';
					
		sendFeedback(content);
		return;
	}
	
	/*
	 * The GM confirmed they want to Blank the MI Bag
	 */
	 
	var handleConfirmedBlank = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID),
			rowRef;
			
		if (!charCS) {
			sendDebug('handleConfirmedBlank: invalid tokenID passed');
			sendError('Internal magicMaster error');
			return;
		}
		
		for (let i=0; i<fields.MIRows; i++) {
			rowRef = fields.MI_table[0] + '_$' + i + '_';
			setAttr( charCS, [rowRef+fields.MI_name[0], 'current'], '-' );
			setAttr( charCS, [rowRef+fields.MI_name[0], 'max'], '-' );
			setAttr( charCS, [rowRef+fields.MI_speed[0], 'current'], '0' );
			setAttr( charCS, [rowRef+fields.MI_speed[0], 'max'], '0' );
			setAttr( charCS, [rowRef+fields.MI_qty[0], 'current'], '' );
			setAttr( charCS, [rowRef+fields.MI_qty[0], 'max'], '0' );
			setAttr( charCS, [rowRef+fields.MI_cost[0], fields.MI_cost[1]], 0 );
			setAttr( charCS, [rowRef+fields.MI_type[0], fields.MI_type[1]], ''  );
		}
		makeGMonlyMImenu( args, 'Magic Item Bag has been blanked' );
		return;
	}
	
	/*
	 * Handle setting the type of the container
	 * 0: Empty Inanimate Object, just reports nothing to be found
	 * 1: Inanimate object that contains stuff, so can be easily looted
	 * 2: Sentient Creature without anything, but needs Pick Pocket roll or might notice
	 * 3: Sentient Creature with stuff, so a successful Pick Pocket allows looting
	 * 4: A trapped container, with the trap specified in an ability macro called Trap
	 */
	 
	var handleSetContainerType = function( args ) {
		
		var tokenID = args[1],
			tokenType = args[4],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleSetContainerType: invalid tokenID passed');
			sendError('Internal magicMaster error');
			return;
		}
			
		setAttr( charCS, fields.MI_ContainerType, tokenType );
		makeGMonlyMImenu( args, 'Container type set' );
		return;
	}
	
	/*
	 * Handle adding treasure narrative (not actual Gold) to a Character Sheet
	 * Only available to the GM.
	 */
	 
	var handleAddTreasure = function( args ) {
		
		var tokenID = args[1],
			newTitle = args[2],
			newTreasure = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleAddTreasure: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var curTreasure = attrLookup( charCS, fields.Money_treasure[0], fields.Money_treasure[1] ) || '';
		
		setAttr( charCS, fields.Money_treasure, (curTreasure+'{{'+newTitle+'='+newTreasure+'}}') );
		makeEditTreasureMenu( args, 'Treasure added' );
		return;
	}
	
	/*
	 * Handle editing the current treasure text
	 */
	 
	var handleEditTreasure = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleEditTreasure: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var curTreasure = attrLookup( charCS, fields.Money_treasure[0], fields.Money_treasure[1] ) || '',
			content = '&{template:2Edefault}{{name=Editing Treasure for '+charCS.get('name')+'}}{{desc=Select all the text below, copy it (using Ctrl-C) and paste it into the Chat Edit box below (using Ctrl-V).  Then edit the elements **within the {{...} } only** before hitting *Return* to set the new value.}}\n'
					+ '/w gm !setattr --fb-from MI System --fb-header Editing treasure --replace --name '+charCS.get('name')+' --otherval|'+curTreasure;
					
		sendFeedback(content);
		return;
	}
	
	/*
	 * Handle deleting the current treasure.  This does not
	 * affect the coinage values, only the treasure text
	 * description/journal
	 */
	 
	var handleDeleteTreasure = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleDeleteTreasure: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var curTreasure = attrLookup( charCS, fields.Money_treasure[0], fields.Money_treasure[1] ) || '',
			content = '&{template:2Edefault}{{name=Current Treasure to Delete}}'+curTreasure+'{{desc=Are you sure you want to delete this?}}'
					+ '{{desc1=[Yes](!magic --button GM-DelTreasure|'+tokenID+') or [No](!magic --button GM-NodelTreasure|'+tokenID+')}}';
					
		sendFeedback(content);
		return;
	}
	
	/*
	 * Handle a confirmed deletion of the treasure text
	 * description/journal
	 */
	 
	var handleConfirmedDelTreasure = function( args ) {
		 
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		setAttr( charCS, fields.Money_treasure, '' );
		makeEditTreasureMenu( args, 'Treasure text deleted' );
		return;
	}
	
	/*
	 * Handle a [No] button being pressed
	 */
	 
	var handleNo = function( args ) {
		
		var noType = args[0],
			tokenID = args[1],
			charCS = getCharacter(tokenID);

		switch (noType) {

		case 'GM-NodelTreasure':
		
			makeEditTreasureMenu(args,'OK, Treasure not deleted');
			break;
			
		case 'GM-NoBlank':
		
			makeGMonlyMImenu(args,'OK, Magic Item Bag not blanked');
			break;
			
		default:
			break;
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
					+ '<span style="font-weight: bold; font-size: 125%">Magic Item Bag v'+version+'</span>'
				+ '</div>'
				+ '<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
					+ '<div style="font-weight: bold;">'
						+ '!magic --help'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display this message'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!magic --pickorput characterID|containerID'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of items in the container, and items in the character\'s Magic Item bag, with options to pick up or put away items. '
						+ 'Items in the container can have an associated cost, to simulate shops.'
					+ '</li>'
					+ '<br>'
				+ '</div>'
   			+ '</div>'; 

		sendFeedback(content); 
	}; 
	
	/*
	 * Handle casting a spell
	 */
	 
	var doCastSpell = function( args ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length < 2) {
			sendDebug('doCastSpell: invalid arguments, missing caster type or token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		var isPower = args[0].toUpperCase().includes('POWER'),
		    isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
		    curToken = getObj('graphic',args[1]),
			charCS = getCharacter( args[1] ),
			level = args[2],
			castingName = args[3];
			
		if (!charCS) {
			sendDebug('doCastSpell: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		
		if (!level || level <= 0) {
			level = casterLevel( charCS, ((isPower || isMI) ? 'POWER' : (isMU ? 'MI' : 'PR')) );
		}
		if (!castingName || castingName.length == 0) {
			castingName = curToken.get('name');
		}
		
		args[4] = args[3] = args[2] = -1;
		args[5] = '';
		setAttr( charCS, fields.Casting_level, level );
		setAttr( charCS, fields.Casting_name, castingName );

		makeCastSpellMenu( args );
		return;		
	}
	
	/*
	 * Use another charge of the same spell/power/MI
	 * if there are any charges left
	 */
	 
	var doCastAgain = function( args ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length < 2) {
			sendDebug('doCastAgain: invalid arguments, missing caster type or token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		var isPower = args[0].toUpperCase().includes('POWER'),
		    isMU = args[0].toUpperCase().includes('MU'),
		    tokenID = args[1],
			charCS = getCharacter(tokenID),
			spellName = args[2];
			
		if (!charCS) {
			sendDebug('doCastAgain: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}

		var castingName = attrLookup( charCS, fields.Casting_name[0], fields.Casting_name[1] ),
			castingLevel = attrLookup( charCS, fields.Casting_level[0], fields.Casting_level[1] ),
			spellRow = attrLookup( charCS, fields.SpellRowRef[0], fields.SpellRowRef[1] ),
			spellCol = attrLookup( charCS, fields.SpellColIndex[0], fields.SpellColIndex[1] ),
			firstColNum = isPower ? fields.PowersFirstColNum : fields.SpellsFirstColNum,
			col = (firstColNum || spellCol != 1) ? spellCol : '',
			rep = (isPower ? fields.Powers_table[0] : fields.Spells_table[0]) + col + '_$' + spellRow + '_',
			spellCharges = parseInt((attrLookup( charCS, rep+fields.Spells_castValue[0]+col, fields.Spells_castValue[1] ) || 0),10);
			
		if (spellCharges <= 0) {
			sendParsedMsg( tokenID, messages.noMoreCharges );
			return;
		}
		
		if (!spellName || spellName.length == 0) {
			spellName = attrLookup( charCS, fields.SpellToMem[0], fields.SpellToMem[1] ) || '-';
		}
		
		args[0] = isPower ? BT.USE_POWER : (isMU ? BT.CAST_MUSPELL : BT.CAST_PRSPELL);
		args[3] = spellRow;
		args[4] = spellCol;
		args[5] = spellName;
		
		makeCastAgainMenu( args );
		return;
	}
	
	/*
	 * Create a menu to change the memorised spells for the day
	 */

	var doMemoriseSpells = function( args ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length < 2) {
			sendDebug('doMemoriseSpells: invalid arguments, missing caster type or token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPower = args[0].toUpperCase().includes('POWER'),
			isMI = args[0].toUpperCase().includes('MI'),
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			level;
			
		if (!charCS) {
			sendDebug('doMemoriseSpells: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		args = (isMI) ? [args[0],tokenID,-1,-1,-1,-1,-1,-1] : [args[0],tokenID,1,-1,-1,''];
		
		level = casterLevel( charCS, (isPower ? 'POWER' : (isMU ? 'MU' : 'PR')) );
		setAttr( charCS, fields.Casting_level, level );
		setAttr( charCS, fields.Casting_name, curToken.get('name') );

		if (isMI) {
			makeStoreMIspell( args );
		} else {
			makeManageSpellsMenu( args );
		}
		return;
	}
	
	/*
	 * Create a menu to see what spells the character has memorised for the day,
	 * and allow selection to see the description of each spell.
	 */
	 
	var doViewMemorisedSpells = function( args ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length < 2) {
			sendDebug('doViewMemorisedSpells: invalid arguments, missing caster type or token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			level;
			
		if (!charCS) {
			sendDebug('doViewMemorisedSpells: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		args[2] = args[3] = args[4] = -1;
		args[5] = '';

		level = casterLevel( charCS, (isPower ? 'POWER' : (isMU ? 'MI' : 'PR')) );
		setAttr( charCS, fields.Casting_level, level );
		setAttr( charCS, fields.Casting_name, curToken.get('name') );

		makeViewMemSpells( args );
		return;
	}
	
	/*
	 * Function to View or Use a Magic Item
	 * possible actions are BT.VIEW_MI or BT.USE_MI
	 */
	 
	var doViewUseMI = function( args, action, senderId ) {
		
		if (!args) {return;}
		
		args = args.split('|');
		if (args.length < 1) {
			sendDebug('doViewUseMI: invalid number of parameters');
			sendError('Invalid magicMaster parameters');
			return;
		}
		
		var tokenID = args[0],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('doViewUseMI: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}

		makeViewUseMI( [action, tokenID, -1], senderId );
		return;
		
	}
	
	/*
	 * Specify a power to use from a Magic Item (isUse = false)
	 * or actually use the Magic Item power (isUse = true)
	 */
	 
	var doSelectMIpower = function( args, isUse ) {
		
		if (!args) {
			return;
		}
		args = args.split('|');
		if (args.length < 4) {
			sendDebug('doSelectMIpower: invalid number of arguments');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		args.unshift('');
		handleSelectMIpower( args, isUse );
	
		return;
	}
	
	/*
	 * Deduct charges from a magic item.  For use when
	 * a player uses a function of a magic item that
	 * uses up more than one charge (using the magic
	 * item by default always consumes 1 charge)
	 */
	 
	var doDeductMIcharges = function( args ) {
		
		if (!args) {
			return;
		}
		args = args.split('|');
		if (args.length < 1) {
			sendDebug('doDeductMIcharges: invalid number of arguments');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		
		var tokenID = args[0],
			charges = args[1] || 1,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doDeductMIcharges: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}

		var MIrowref = attrLookup( charCS, 'MIrowref', 'current' );
		
		if (_.isUndefined(MIrowref)) {
			sendDebug('doDeductMIcharges: MIrowref not found');
			sendError('Internal magicMaster error');
		} else {
			handleViewUseMI( ['',tokenID,MIrowref], true, charges );
		}
		return;
	}
	
	/*
	 * Deal with requests to undertake a rest, either short or long, or
	 * if undetermined, ask the player which to do.  Only enable a
	 * long rest if the DM has enabled it.
	 */

	var doRest = function( args ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length < 1) {
			sendDebug('doRest: invalid arguments, missing token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}

		var tokenID = args[0],
			restType = (args[1] || 'SELECT').toUpperCase(),
			casterType = (args[2] || 'MU+PR').toUpperCase();
			
		if (casterType.includes('MI') && casterType.includes('POWER')) {
//		    log('Resetting MI powers');
			handleRest( args );
			return;
		}
		
		var	curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doRest: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		var timeSpent = attrLookup( charCS, fields.Timespent[0], fields.Timespent[1] );
		
		switch (restType) {
			
		case 'LONG':
			if (!timeSpent) {
				sendParsedMsg( tokenID, messages.noLongRest );
				break;
			}
			handleRest( args );
			setAttr( charCS, fields.Timespent, 0 );
			sendParsedMsg( tokenID, (messages.restHeader + '{{' + inGameDate(handleTimePassing( charCS, timeSpent )) + '=' + messages.longRest + '{{Check with the DM then [Try again](!magic --rest '+tokenID+'|long|'+casterType+')') );
			break;
			
		case 'SHORT':
			handleRest( args );
			sendParsedMsg( tokenID, messages.shortRest );
			break;
			
		case 'SELECT':
		default:
			makeRestSelectMenu( args, timeSpent );
			break;
			
		}
		return;
	}
	
	/*
	 * Display a menu of actions for spell use.  First, determine the type
	 * spellbooks the character has (PR, MU or both).  If a type is provided as
	 * an argument and the character has such a spellbook, display the menu.  If
	 * does not have the specified type, display an error message to the player.
	 * If no type is specified, display the appropriate spellbook menu or,
	 * if the character has both types, ask which the player wants to use.
	 */
	 
	var doSpellsMenu = function( args ) {
		
		if (!args) {
			return;
		}
		args = args.split('|');
		if (args.length < 1) {
			sendDebug('doViewMemorisedSpells: invalid arguments, missing token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		
		var tokenID = args[0],
			isMU = args[1] && args[1].toUpperCase().includes('MU'),
			isPR = args[1] && args[1].toUpperCase().includes('PR'),
			isPower = args[1] && args[1].toUpperCase().includes('POWER'),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doSpellsMenu: invalid token_id');
			sendError('Incorrect magicMaster syntax');
			return;
		}
		
		var sheetTypes = getSheetTypes( charCS ),
			muLevel = casterLevel( charCS, 'MU' ),
			prLevel = casterLevel( charCS, 'PR' );
			
		if (isMU) {
			if (muLevel > 0) {
				makeMUSpellsMenu( args );
			} else {
				sendParsedMsg( tokenID, messages.noMUspellbook );
			}
		} else if (isPR) {
			if (prLevel > 0) {
				makePRSpellsMenu( args );
			} else {
				sendParsedMsg( tokenID, messages.noPRspellbook );
			}
		} else if (isPower) {
			makePowersMenu( args );
		}

		if (!isMU && !isPR && !isPower) {
			if (muLevel > 0 && prLevel > 0) {
				sendParsedMsg( tokenID, messages.chooseSpellMenu );
			} else if (muLevel > 0) {
				makeMUSpellsMenu( args );
			} else if (prLevel > 0) {
				makePRSpellsMenu( args );
			} else {
				sendParsedMsg( tokenID, messages.noSpellbooks );
			}
		}
	};
	
	/**
	* Function to deal with a character interacting with a target, either
	* an inanimate chest or other MI store, or with an animate, possibly
	* intelligent creature that might detect their action.  In either case,
	* the target might also be trapped.
	**/
	
	var doSearchForMIs = function( args, senderId ) {
		
		if (!args) {
			return;
		}
		
		var msg = args;
		
		args = args.split('|');
		if (args.length != 3) {
			sendDebug('doSearchForMIs: invalid number of parameters');
			sendError('Invalid magicMaster parameters');
			return;
		}
		
		var tokenID = args[0],
		    pickID = args[1],
			putID = args[2],
			charCS = getCharacter( tokenID ),
			putCS = getCharacter( putID ),
			pickCS = getCharacter( pickID ),
			MIBagSecurity,
			content;
			
		if (!charCS || !putCS || !pickCS) {
			sendDebug('doSearchForMIs: invalid ID arguments');
			sendError('Invalid magicMaster parameters');
			return;
		};
		setAttr( putCS, ['target-level', 'current'], characterLevel(pickCS) );
		setAttr( putCS, ['target-token', 'current'], getObj('graphic',pickID).get('name') );
		setAttr( pickCS, ['search-id', 'current'], pickID );
		
		MIBagSecurity = parseInt((attrLookup( pickCS, 'check-for-MIBag', 'current' ) || '0'),10);
		switch (MIBagSecurity) {
		
		case 0:
		
			// target is an inanimate object or insensitive creature without any magic items

            var treasure = (attrLookup( pickCS, fields.Money_treasure[0], fields.Money_treasure[1] ) || '');
			content = messages.header + '{{desc=' + pickCS.get('name') + ' ' + messages.fruitlessSearch + treasure;
			sendParsedMsg( tokenID, content );
			break;
			
		case 1:
		
			// target is an inanimate object or insensitive creature with magic items
		
			doPickOrPut( msg, senderId );
			break;
		
		case 2:
		case 3:
		
			// target is a creature that might detect any snooping.
			// A pick pockets roll is necessary
			
			content = '&{template:2Edefault}{{name='+putCS.get('name')+' is Picking Pockets for MIs}}'
			        + '{{desc=Are you trying to pick '+pickCS.get('name')+'\'s pocket?\n'
			        + '[Yes](!magic --pickpockets '+tokenID+'|'+putID+'|'+pickID+'|&#91;&#91;?{Roll vs Pick Pockets|1d100}&#93;&#93;)'
			        + ' or [No](!&#13;&#47;w &#34;'+putCS.get('name')+'&#34; OK, not making the attempt)}}';

			sendResponse( charCS, content );

			break;
			
		case 4:
		
			// target is trapped, and should have a trap ability macro
			
            var trapVersion = (attrLookup( pickCS, 'trap-version', 'current' ) || ''),
			    trapName = 'trap'+trapVersion,
				trapMacro = findObjs({ _type : 'ability', characterid : pickCS.id, name : trapName }, {caseInsensitive: true});
			if (!trapMacro || trapMacro.length === 0) {
				trapName = 'Check-for-MIBag'+trapVersion;
				trapMacro = findObjs({ _type : 'ability', characterid : pickCS.id, name : trapName }, {caseInsensitive: true});
			}
			
			if (!trapMacro || trapMacro.length === 0) {
			    sendDebug('doSearchForMIs: Not found trapMacro');
				doPickOrPut( msg, senderId );
				break;
			}
//            sendAPImacro( putID, pickID, trapName );
			break;
			
		default:
		    sendDebug('doSearchForMIs: unknown MIBagSecurity type');
		    sendError('Unknown MIBag security type');
		};
		return;
		
	}
	
	/**
	 * Function to display the Edit MI Bag menu
	 */
	 
	var doEditMIbag = function( args, senderId ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length != 1) {
			sendDebug('doSearchForMIs: invalid number of parameters');
			sendError('Invalid magicMaster parameters');
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
	
	/**
	* Function to support picking of pockets and trapped chests, using
	* options and ability macros set in the target character sheet.
	**/
	
	var doPickPockets = function( args, senderId ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length != 3) {
			sendDebug('doSearchForMIs: invalid number of parameters');
			sendError('Invalid magicMaster parameters');
			return;
		}
		
		var	tokenID = args[0],
		    pickID = args[1],
			putID = args[2],
			ppRoll = parseInt(args[3],10),
			charCS = getCharacter( tokenID ),
			pickCS = getCharacter( pickID );
			
		if (!charCS || !pickCS) {
			sendDebug('doPPorTrap: invalid ID arguments');
			sendError('Invalid magicMaster parameters');
			return;
		};
		
		if (isNaN(ppRoll)) {
			sendDebug('doPPorTrap: invalid dice roll argument');
			sendError('Invalid magicMaster parameters');
			return;
		};
		
		var pick_pockets = (attrLookup( charCS, fields.Pick_Pockets[0]+'t', fields.Pick_Pockets[1] ) || 5),
			pp_target = (Math.min(Math.ceil(Math.max(pick_pockets,0)),96)),
			content = '&{template:2Edefault}{{name='+charCS.get('name')+' is Picking Pockets for MIs}}'
					+ '{{target=[['+pp_target+']]}}'
					+ '{{rolled=<span style=' + ((ppRoll <= pp_target) ? design.success_box : design.failure_box) + '>' + ppRoll + '</span>}}';
		
		if (ppRoll <= pp_target) {
			content += '{{desc=Press [Succeeded](!magic --pickorput '+tokenID+'|'+pickID+'|'+putID+') to view items to pick from}}';
		} else {
		    content += '{{=<span style='+design.failure_box+'>Failed!</span>}}'
		    args.unshift('PPfailed');
		    content += '\n/w "'+charCS.get('name')+'" '+handlePPfailed( args, senderId );
		}
		
		sendResponse( charCS, content );
		return;
	};


	/*
	* Function to display the menu for picking up or putting away Magic Items
	* from one Magic Item bag into another Magic Item bag.
	*/

	var doPickOrPut = function( args, senderId ) {
		if (!args)
			{return;}

        args = args.split('|');

		if (args.length < 3 || args.length > 4) {
			sendDebug('doPickOrPut: Invalid number of arguments');
			sendError('Invalid magicMaster syntax');
			return;
		};

		var tokenID = args[0],
		    pickID = args[1],
			putID = args[2],
			menuType = args[3],
			charCS = getCharacter( tokenID ),
			pickCS = getCharacter( pickID ),
			content;
			
		if (!tokenID || !putID || !pickID || !charCS || !pickCS) {
			sendDebug('doPickOrPut: One or more IDs are invalid');
			sendError('Invalid magicMaster arguments');
			return;
		};
		
		var menu,
			playerConfig = getSetPlayerConfig( senderId ),
			pickName = pickCS.get('name');
			
		if (menuType && ['short','long'].includes(menuType.toLowerCase())) {
			playerConfig.pickOrPutType = menuType.toLowerCase();
			getSetPlayerConfig( senderId, playerConfig );
		} else if (playerConfig && playerConfig.pickOrPutType) {
			menuType = playerConfig.pickOrPutType;
		} else {
		    if (!playerConfig) {
		        playerConfig = {};
		    }
			playerConfig.pickOrPutType = menuType = 'short';
			getSetPlayerConfig( senderId, playerConfig );
		};
			
		setAttr( charCS, ['MIrowref', 'current'], -1 );
		setAttr( charCS, ['MIcur', 'current'], '-' );
		setAttr( charCS, ['MIcurqty', 'current'], 0 );
		setAttr( charCS, ['MIcurqty', 'max'], 0 );
		setAttr( charCS, ['MIqty', 'current'], 0 );
		setAttr( charCS, ['MIct', 'current'], 0 );
		setAttr( charCS, ['MItype', 'current'], 'charged' );
		setAttr( charCS, ['foundrowref', 'current'], -1 );
		setAttr( charCS, ['foundcur', 'current'], '-' );
		setAttr( charCS, ['foundcurqty', 'current'], 0 );
		setAttr( charCS, ['foundcurqty', 'max'], 0 );
		setAttr( charCS, ['foundqty', 'current'], 0 );
		setAttr( charCS, ['foundct', 'current'], 0 );
		setAttr( charCS, ['foundtype', 'current'], 'charged' );
		setAttr( charCS, ['MIbag', 'current'], 'Pick-up-MIs' );
		setAttr( charCS, ['MI-from-id', 'current'], pickCS.id );
		setAttr( charCS, ['MI-from', 'current'], pickName );
		setAttr( charCS, ['foundslot-chosen', 'current'], 0 );
		setAttr( charCS, ['MIslot-chosen', 'current'], 0 );
		setAttr( charCS, ['expenditure', 'current'], 0 );
		setAttr( charCS, ['expenditure', 'max'], 0 );
		
		args = ['POPmenu',tokenID,-1,pickID,putID,-1];
		
		makeShortPOPmenu( args, senderId );
		
//		if (menuType == 'short') {
//			makeShortPOPmenu( args );
//		} else {
//			menu = makePOPmenu( senderId, args, 'long' );
//			sendResponse( charCS, menu );
//		}
		return;

    };

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, senderId ) {
		if (!args)
			{return;}
		args = args.split('|');

		var	handler = args[0];

		switch (handler) {

		case BT.VIEWMI_OPTION:
		case BT.USEMI_OPTION:
		case BT.EDITMI_OPTION:
		case BT.PICKMI_OPTION:
		case BT.PUTMI_OPTION:
		
			handleOptionButton( args, senderId );
			break;

		case BT.MU_SPELL :
		case BT.PR_SPELL :
		case BT.MI_SPELL :
		case BT.POWER :
		
			handleChooseSpell( args );
			break;
			
		case BT.CAST_MUSPELL :
		case BT.CAST_PRSPELL :
		case BT.CAST_MISPELL :
		case BT.USE_POWER :
		
			handleCastSpell( args );
			break;
			
		case BT.EDIT_MUSPELLS :
		case BT.EDIT_PRSPELLS :
		case BT.EDIT_POWER :
		
			handleRedisplayManageSpells( args );
			break;
			
		case BT.VIEW_MUSPELL :
		case BT.VIEW_PRSPELL :
		case BT.VIEW_POWER :
		case BT.REVIEW_MUSPELL :
		case BT.REVIEW_PRSPELL :
		case BT.REVIEW_POWER :
		case BT.REVIEW_MI :
			 
			handleReviewSpell( args );
			break;
			
		case BT.MEM_MUSPELL :
		case BT.MEM_PRSPELL :
		case BT.MEM_POWER :
			 
			handleMemoriseSpell( args );
			break;
			
		case BT.VIEWMEM_MUSPELLS :
		case BT.VIEWMEM_PRSPELLS :
		case BT.VIEWMEM_POWER :
		
			makeViewMemSpells( args );
			break;
			
		case BT.CHOOSE_VIEW_MI:
		case BT.CHOOSE_USE_MI:
		
			makeViewUseMI( args, senderId );
			break;
			
		case BT.REDO_CHOOSE_MI:
		    
		    makeEditBagMenu( args, senderId );
		    break;
			
		case BT.VIEW_MI:
		case BT.USE_MI:
		
			handleViewUseMI( args, playerIsGM(senderId) );
			break;
			
		case BT.MU_TO_STORE:
		case BT.PR_TO_STORE:
		case BT.MU_MI_SLOT:
		case BT.PR_MI_SLOT:
		
			handleSelectMIspell( args );
			break;
			
		case BT.MISTORE_MUSPELL:
		case BT.MISTORE_PRSPELL:
		
			handleStoreMIspell( args );
			break;
			
		case BT.MI_POWER_USED:
		
			handleSelectMIpower( args, true );
			break;

		case BT.POP_PICK :
		
			makeShortPOPmenu( args, senderId );
			break;
			
		case 'POPqty' :
		case 'POPbuy' :
		case 'POPsubmit' :
		case BT.POP_STORE :
		    
		    handlePickOrPut( args );
		    break;
			
		case 'PPfailed' :
		
			handlePPfailed( args, senderId );
			break;
			
		case 'POPtreasure' :
		
			handleTreasure( args, senderId );
			break;
			
		case 'GM-MImenu':
		
			makeGMonlyMImenu( args );
			break;
			
		case BT.CHOOSE_MI :
		case 'GM-MItoStore':
		
			handleSelectMI( args, (handler == 'GM-MItoStore'), senderId );
			break;
			
		case BT.SLOT_MI :
		case 'GM-MIslot':
		
			handleSelectSlot( args, (handler == 'GM-MIslot'), senderId );
			break;
			
		case BT.STORE_MI :
		case 'GM-StoreMI':
		
			handleStoreMI( args, (handler == 'GM-StoreMI'), senderId );
			break;
			
		case 'GM-RenameMI':
		
			handleHideMI( args );
			break;
			
		case BT.REMOVE_MI :
		case 'GM-DelMI':
		
			handleRemoveMI( args, (handler == 'GM-DelMI'), senderId );
			break;
			
		case 'GM-ChangeMIcost':
		
			handleChangeMItype( args );
			break;
			
		case 'GM-ChangeDispCharges':
		
			handleChangeMIcharges( args, 'Displayed' );
			break;
			
		case 'GM-ChangeActCharges':
		
			handleChangeMIcharges( args, 'Actual' );
			break;
			
		case 'GM-ResetSingleMI':
		
			handleResetSingleMI( args );
			break;
			
		case 'GM-ChangeMItype':
		    
		    handleChangeMItype( args );
		    break;
			
		case 'GM-SetMIcost':
		
			handleSetMIcost( args );
			break;
			
		case 'GM-SetTokenType':
		
			handleSetContainerType( args );
			break;
			
		case 'GM-TreasureMenu':
		
			makeEditTreasureMenu( args );
			break;
			
		case 'GM-AddTreasure':
		
			handleAddTreasure( args );
			break;
			
		case 'GM-EditTreasure':
		
			handleEditTreasure( args );
			break;
			
		case 'GM-DeleteTreasure':
		
			handleDeleteTreasure( args );
			break;
			
		case 'GM-DelTreasure':
		
			handleConfirmedDelTreasure( args );
			break;
			
		case 'GM-NoBlank':			
        case 'GM-NodelTreasure':
            
            handleNo( args );
            break;

		case 'GM-BlankBag':
		
			handleBlankMIBag( args );
			break;
		
		case 'GM-ConfirmedBlank':
		
			handleConfirmedBlank( args );
			break;
		
		default:
		
			sendDebug( 'doButton: invalid button type specified' );
			sendError( 'Invalid magicMaster button call' );
			return;
		};

	};
	
	/**
	 * Set options for a particular player
	 **/
	 
	var doSetOptions = function( args, senderId ) {
	    
	    if (!args)
	        {return;}
	    
	    args = args.split('|');
	    if (args.length != 2) {
	        sendDebug('soSetOptions: invalid argument pair.  Must be [option|value]');
	        sendError('Invalid magicMaster parameters');
	    }
	
	    var option = args[0],
	        value = args[1],
	        player = getObj('player',senderId),
	        playerName, content,
	        config = getSetPlayerConfig( senderId ) || {};
	        
        if (player) {
            playerName = player.get('_displayname');
        } else {
            playerName = 'GM';
        }
        content = '&{template:2Edefault}{{name='+playerName+'\'s magicMaster options}}';

        switch (option.toLowerCase()) {
        
        case 'menutype':
            value = value.toLowerCase();
            if (!['short','long'].includes(value)) {
                sendResponseError( senderId, 'Invalid menuType option.  Use short or long' );
                return;
            }
            config.pickOrPutType = value;
            getSetPlayerConfig( senderId, config );
            content += '{{desc=Menu type set to '+value+'}}';
            sendResponsePlayer(senderId,content);
            config = getSetPlayerConfig( senderId );
            break;
            
        default:
            sendResponseError( senderId, 'Invalid magicMaster option. [Show Help](!magic --help)');
            break;
        };
	    return config;
	};
	
	/**
	 * Present the Magic Item Bag menu for the tokenID passed, if it has one
	*/

    var doMIBagMenu = function( args, senderId ) {
        if (!args) {
            sendDebug('doMIBagMenu: tokenID not specified');
            sendError('Invalid magicMaster syntax');
        }
        
 		args = args.split('|');

		if (args.length != 1) {
			sendDebug('doMIBagMenu: Invalid number of arguments');
			sendError('Invalid magicMaster syntax');
			return;
		};

        var tokenID = args[0],
            curToken = getObj( 'graphic', tokenID );
            
        if (!curToken){
            sendDebug('doMIBagMenu: Invalid tokenID: ' + tokenID);
            sendError('Invalid magicMaster syntax');
            return;
        }
        
        var charID = curToken.get('represents'),
            tokenName = curToken.get('name');
            
        if (checkNewMIBag( tokenID )) {

            var ppt, ppTarget, ppTargetMax,
                content, menuType,
                charCS = getObj( 'character', charID ),
				charName = charCS.get('name');

            ppt = (attrLookup( charCS, 'ppt', 'current' ) || 5);
            ppTarget = Math.min(Math.ceil(1.5*Math.max(ppt,0)),96);
            ppTargetMax = Math.min(Math.ceil(Math.max(ppt,0)),96);
            
            content = '&{template:2Edefault} {{name=' + tokenName + '\'s\n'
                    + 'Magic Items menu}}{{desc=[2. Use a Magic Item](!magic --use-mi '+tokenID+')\n'
                    + '[3. Search for MIs & Treasure](!magic --search '+tokenID+'|&#64;{target|Search Where?|token_id}|'+tokenID+')\n'
                    + '[3. Store MIs](!magic --pickorput '+tokenID+'|'+tokenID+'|&#64;{target|Store Where?|token_id})\n'
                    + '[4. Change MIs](!magic --edit-mi '+tokenID+')\n'
                    + '[4. View your Magic Item bag](!magic --view-mi '+tokenID+')}}';
                    
            sendResponse( charCS, content );
        };
    };
	
	/*
	 * Call up the GM's Edit MI bag menu, which allows the GM
	 * change MIs to be cursed, hide the real name, reveal items
	 * once identified, change displayed & actual quantities etc.
	 */
	 
	var doGMonlyMImenu = function( args ) {
		
		if (!args) {
			return;
		}
		
		args = args.split('|');
		if (args.length != 1) {
			sendDebug('doGMonlyMImenu: Invalid number of arguments');
			sendError('Invalid magicMaster syntax');
			return;
		};

		var tokenID = args[0];
		
		if (!checkNewMIBag(tokenID)) {
			return;
		}
		
		args.push( tokenID, -1, '' );
		
		makeGMonlyMImenu( args );
		return;
	}
	
    /*
     * RED: v1.012 A menu to allow players to choose light sources
     */
	
	var doLightSourcesMenu = function( args ) {

		if (!args)
			{return;}
			
		args = args.split('|');
		if (args.length < 1) {
			sendDebug('doLightSourcesMenu: Invalid number of arguments');
			sendError('Invalid magicMaster syntax');
			return;
		};

        var tokenID = args[0],
            curToken = getObj( 'graphic', tokenID );
            
        if (!curToken){
            sendDebug('doLightSourcesMenu: Invalid tokenID: ' + tokenID);
            sendError('Invalid magicMaster syntax');
            return;
        }
		
		var charCS = getCharacter( tokenID );
		if (!charCS) {
            sendDebug('doLightSourcesMenu: Invalid tokenID: ' + tokenID);
            sendError('Invalid magicMaster syntax');
            return;
        }

		var lightSource = attrLookup( charCS, fields.LightSource[0], fields.LightSource[1] ) || 'None',
			weaponSwitch = (lightSource == 'Weapon') ? ('<td><span style='+design.selected_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Weapon)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			torchSwitch = (lightSource == 'Torch') ? ('<td><span style='+design.selected_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Torch)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			hoodedSwitch = (lightSource == 'Hooded') ? ('<td><span style='+design.selected_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Hooded)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			bullseyeSwitch = (lightSource == 'Bullseye') ? ('<td><span style='+design.selected_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Bullseye)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			contLightSwitch = (lightSource == 'ContLight') ? ('<td><span style='+design.selected_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|ContLight)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			beaconSwitch = (lightSource == 'Beacon') ? ('<td><span style='+design.selected_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Beacon)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			
			content = '&{template:2Edefault}{{name=Manage '+curToken.get('name')+'\'s Light Sources}}'
					+ '{{desc=In order of illumination<table>'
					+ '<tr><td>Magic Weapon</td><td>5ft</td>'+weaponSwitch+'</tr>'
					+ '<tr><td>Torch</td><td>15ft</td>'+torchSwitch+'</tr>'
					+ '<tr><td>Hooded Lantern</td><td>30ft</td>'+hoodedSwitch+'</tr>'
					+ '<tr><td>Bullseye Lantern</td><td>60ft beam</td>'+bullseyeSwitch+'</tr>'
					+ '<tr><td>Cont-Light gem</td><td>60ft</td>'+contLightSwitch+'</tr>'
					+ '<tr><td>Beacon Lantern</td><td>240ft beam</td>'+beaconSwitch+'</tr>'
					+ '</table>}}';
					

		sendResponse( charCS, content );
		return;
	}
	
	var doLightSource = function( args, dispMenu ) {
		
		if (!args)
			{return;}
			
		var lsArgs = args.split('|');
		if (lsArgs.length != 2) {
			sendDebug('doLightSource: Invalid number of arguments');
			sendError('Invalid magicMaster syntax');
			return;
		};

        var tokenID = lsArgs[0],
			newSource = lsArgs[1],
			curToken = getObj( 'graphic', tokenID );
            
        if (!curToken){
            sendDebug('doLightSource: Invalid tokenID: ' + tokenID);
            sendError('Invalid magicMaster syntax');
            return;
        }
		
		var charCS = getCharacter( tokenID );
		if (!charCS) {
            sendDebug('doLightSource: Invalid tokenID: ' + tokenID);
            sendError('Invalid magicMaster syntax');
            return;
        }

		switch (newSource) {
		case 'None':
			curToken.set({emits_bright_light: false, emits_low_light: false,
			bright_light_distance: 0,  low_light_distance: 0,
			has_directional_bright_light: false, has_directional_dim_light: false,
			directional_dim_light_centre: 180, directional_dim_light_total: 360,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
			
		case 'Weapon':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 1,  low_light_distance: 5,
			has_directional_bright_light: false, has_directional_dim_light: false,
//			directional_dim_light_centre: 180, directional_dim_light_total: 360,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
			
		case 'Torch':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 1,  low_light_distance: 15,
			has_directional_bright_light: false, has_directional_dim_light: false,
//			directional_dim_light_centre: 180, directional_dim_light_total: 360,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
		
		case 'Hooded':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 15, low_light_distance: 30,
			has_directional_bright_light: false, has_directional_dim_light: false,
//			directional_dim_light_centre: 180, directional_dim_light_total: 360,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
		
		case 'ContLight':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 50, low_light_distance: 60,
			has_directional_bright_light: false, has_directional_dim_light: false,
//			directional_dim_light_centre: 180, directional_dim_light_total: 360,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
		
		case 'Bullseye':
			curToken.set({emits_bright_light: true, emits_low_light: false, 
			bright_light_distance: 60, low_light_distance: 60,
			has_directional_bright_light: true, has_directional_dim_light: false,
//			directional_dim_light_centre: 180, directional_dim_light_total: 19,
			directional_bright_light_centre: 180, directional_bright_light_total: 19});
			break;
		
		case 'Beacon':
			curToken.set({emits_bright_light: true, emits_low_light: false, 
			bright_light_distance: 240, low_light_distance: 240,
			has_directional_bright_light: true, has_directional_dim_light: false,
//			directional_dim_light_centre: 180, directional_dim_light_total: 21,
			directional_bright_light_centre: 180, directional_bright_light_total: 21});
			break;
			
		default:
			sendDebug( 'doLightSource: Invalid light source type '+newSource );
			sendError( 'Invalid MIMaster syntax' );
			break;
		}
		
		setAttr( charCS, fields.LightSource, newSource );
		
		if (dispMenu) {
			doLightSourcesMenu( args );
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
			selected = msg.selected;
			
		if (args.indexOf('!magic') !== 0 && args.indexOf('!mibag') !== 0)
			{return;}

        sendDebug('magicMaster called');

		args = args.split(' --');
		args.shift();
		
		if (_.isUndefined(senderId) || _.isUndefined(getObj('player',senderId))) {
			sendDebug('senderId undefined, looking for GM');
			if (_.isUndefined(senderId = findTheGM())) {
				sendDebug('Unable to findTheGM');
				return;
			} else {
				sendDebug('found the GM');
			}
		} else {
			sendDebug('senderId is defined as ' + getObj('player',senderId).get('_displayname'));
		};
		
		var isGM = (playerIsGM(senderId) || state.MIBag.debug === senderId);
			
		_.each(args, function(e) {
			var arg = e;
			sendDebug('Processing arg: '+arg);

			// RED: v1.213 If in debugging mode, allow debugger to execute GM
			// type commands
    		if (msg.type === 'api') {
    	    	if (arg.indexOf('cast-spell ') === 0) {
    	    	    arg = arg.replace('cast-spell ','').trim();
        			doCastSpell(arg);
    	    	} else if (arg.indexOf('cast-again ') === 0) {
    	    	    arg = arg.replace('cast-again ','').trim();
        			doCastAgain(arg);
    	    	} else if (arg.indexOf('mem-spell ') === 0) {
    	    	    arg = arg.replace('mem-spell ','').trim();
        			doMemoriseSpells(arg);
    	    	} else if (arg.indexOf('view-spell ') === 0) {
    	    	    arg = arg.replace('view-spell ','').trim();
        			doViewMemorisedSpells(arg);
    	    	} else if (arg.indexOf('spellmenu ') === 0) {
    	    	    arg = arg.replace('spellmenu ','').trim();
        			doSpellsMenu(arg);
    	    	} else if (arg.indexOf('rest ') === 0) {
    	    	    arg = arg.replace('rest ','').trim();
        			doRest(arg);
    	    	} else if (arg.indexOf('pickorput ') === 0) {
    	    	    arg = arg.replace('pickorput ','').trim();
        			doPickOrPut(arg,senderId);
    	    	} else if (arg.indexOf('mimenu ') === 0) {
    	    	    arg = arg.replace('mimenu ','').trim();
    	    	    doMIBagMenu(arg,senderId);
    	    	} else if (arg.indexOf('view-mi ') === 0) {
    	    	    arg = arg.replace('view-mi ','').trim();
    	    	    doViewUseMI(arg,BT.VIEW_MI,senderId);
    	    	} else if (arg.indexOf('use-mi ') === 0) {
    	    	    arg = arg.replace('use-mi ','').trim();
    	    	    doViewUseMI(arg,BT.USE_MI,senderId);
    	    	} else if (arg.indexOf('mi-charges ') === 0) {
    	    	    arg = arg.replace('mi-charges ','').trim();
    	    	    doDeductMIcharges( arg );
    	    	} else if (arg.indexOf('mi-power ') === 0) {
    	    	    arg = arg.replace('mi-power ','').trim();
    	    	    doSelectMIpower(arg,false);
    	    	} else if (arg.indexOf('edit-mi ') === 0) {
    	    	    arg = arg.replace('edit-mi ','').trim();
    	    	    doEditMIbag(arg,senderId);
    	    	} else if (arg.indexOf('search ') === 0) {
    	    	    arg = arg.replace('search ','').trim();
    	    	    doSearchForMIs(arg,senderId);
    	    	} else if (arg.indexOf('pickpockets ') === 0) {
    	    	    arg = arg.replace('pickpockets ','').trim();
    	    	    doPickPockets(arg,senderId);
    	    	} else if (arg.indexOf('gm-edit-mi ') === 0 && isGM) {
    	    	    arg = arg.replace('gm-edit-mi ','').trim();
    	    	    doGMonlyMImenu(arg);
    	    	} else if (arg.indexOf('lightsources ') === 0) {
    	    	    arg = arg.replace('lightsources ','').trim();
    	    	    doLightSourcesMenu(arg);
    	    	} else if (arg.indexOf('light ') === 0) {
    	    	    arg = arg.replace('light ','').trim();
    	    	    doLightSource(arg,false);
    	    	} else if (arg.indexOf('changelight ') === 0) {
    	    	    arg = arg.replace('changelight ','').trim();
    	    	    doLightSource(arg,true);
	    		} else if (arg.indexOf('options ') === 0) {
	    			arg = arg.replace('options ','').trim();
		    		doSetOptions(arg,senderId);
	    		} else if (arg.indexOf('button ') === 0) {
	    			arg = arg.replace('button ','').trim();
		    		doButton(arg,senderId);
    			} else if (arg.indexOf('help') === 0) {
    				showHelp(); 
    			}  else if (arg.indexOf('relay ') === 0) {
    				arg = arg.replace('relay ','').trim();
    				doRelay(arg,senderId); 
    			} else if (arg.indexOf('debug ') === 0) {
    				// RED: v1.207 allow anyone to set debug and who to send debug messages to
    				arg = arg.replace('debug ','').trim();
    				doSetDebug(arg,senderId);
    			} else {
    			    sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
    				showHelp(); 
    			}
    		}
    	});
    	sendDebug( 'handleChatMsg: about to call createAttrs');
		createAttrs( !state.magicMaster.debug, true );
	};
	
// -------------------------------------------------------------- Register the API -------------------------------------------

	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
	};
 
	return {
		init: init,
		registerAPI: registerAPI
	};
 
}());

on("ready", function() {
	'use strict'; 
	magicMaster.init(); 
	magicMaster.registerAPI();
});