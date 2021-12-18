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
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = 1.036,
		author = 'RED',
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

	var fields = Object.freeze({
		feedbackName:       'AttackMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
		defaultTemplate:    '2Edefault',
		commandMaster:		'!cmd',
		roundMaster:		'!rounds',
		MagicItemDB:        'MI-DB',
		WeaponDB:			'MI-DB',
		ToHitRoll:			'1d20',
		SaveRoll:			'1d20',
		dbVersion:			['db-version','current'],
		Race:               ['race','current'],
		Expenditure:		['expenditure','current'],
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
		MW_table:           ['repeating_weapons',0],
		MW_name:            ['weaponname','current','-'],
		MW_type:			['weaponname','max',''],
		MW_range:			['range','current',''],
		MW_superType:		['range','max',''],
		MW_speed:           ['weapspeed','current',''],
		MW_dancing:			['weapspeed','max','0'],
		MW_noAttks:         ['attacknum','current','1'],
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
		RW_table:           ['repeating_weapons2',0],
		RW_name:            ['weaponname2','current','-'],
		RW_type:			['weaponname2','max',''],
		RW_speed:           ['weapspeed2','current',''],
		RW_dancing:			['weapspeed2','max','0'],
		RW_noAttks:         ['attacknum2','current','1'],
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
		Equip_rightHand:	['worn-Weapon2','current'],
		Equip_bothHands:	['worn-Hands','current'],
		Equip_handedness:	['handedness','current'],
		Equip_dancing:		['dancing-count','current'],
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

	var PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	var messages = Object.freeze({
		noChar: '/w "gm" &{template:2Edefault} {{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
		cursedSlot: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh what a shame.  No, you can\'t overwrite a cursed item with a different item.  You\'ll need a *Remove Curse* spell or equivalent to be rid of it!}}',
        cursedItem: '&{template:2Edefault} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try putting this away, but is seems to be back where it was...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		PleaseWait: '**Please wait...** - processing is taking a while',
	});
	
	var MenuState = Object.freeze({
		ENABLED: false,
		DISABLED: true,
	});
	
	var Attk = Object.freeze({
		TO_HIT: 'TO_HIT',
		ROLL: 'ROLL',
		TARGET: 'TARGET',
	});
	
	var TwoWeapons = Object.freeze({
	    SINGLE: 0,
	    PRIMARY: 2,
	    SECONDARY: 4,
	    NOPENALTY: ['ranger'],
	});
	
	var BT = Object.freeze({
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
	});
	
	var tableIntro = Object.freeze({
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
	
	var dbNames = Object.freeze({
	MI_DB_Armour:	{bio:'<blockquote>Armour and Shields</blockquote><b>v5.1  29/10/2021</b><br><br>This Magic Item database holds definitions for Armour & Shields.',
					gmnotes:'<blockquote>Change Log:</blockquote><br>v5.1  29/10/2021  Encoded machine readable data to support API distribution of databases<br><br>v5.0  01/10/2021  Split MI-DB into separate databases for different types of Item. See MI-DB for earlier Change Log.',
					root:'MI-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/141800/VLyMWsmneMt4n6OBOLYn6A/max.png?1344434416',
					version:5.1,
					db:[{name:'-',type:'',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" This is a blank slot in your Magic Item bag. Go search out some new Magic Items to fill it up!'},
						{name:'Ankheg-Armour',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ankheg Armour}}{{subtitle=Armour}}{{Armour=+0 non-magical, constructed like Full Plate}}Specs=[Ankheg,Armour,0H,Plate]{{AC=[[0]]\nNaturally 0, no metal}}ACData=[a:Ankheg,st:Plate,+:0,ac:0,sz:L,wt:25,sp:0,rc:uncharged]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=Armour made from the shell of an Ankheg. Exceptionally durable, very light, and naturally AC0. Its construction does not involve any metal components.}}'},
						{name:'Armour',type:'',ct:0,charge:'uncharged',cost:0,body:'%{MI-DB-Armour|Magical-Armour}'},
						{name:'Armour-of-Resistance+3',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Field Plate Armour of Resistance+3}}{{subtitle=Magical Armour}}{{Armour=+3 selectively magical Field Plate}}Specs=[Armour-of-Resistance,Armour,0H,Plate]{{AC=[[2]][[0-3]]\nagainst Slashing damage}}ACData=[a:Armour-of-Resistance+3,st:Plate,+S:3,+:0,ac:2,sz:L,wt:60,sp:0,rc:uncharged]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armour provides resistance to Slashing damage only.\nThis armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.\nFor each +1 bonus to armor, regardless of the type of armor, the wearer\'s Armor Class moves downward (toward AC 2 . . . to 1 . . . to 0, -1, -2, and so on). Note, however, that Armor Class can never be improved beyond -10.}}'},
						{name:'Armour-of-Vulnerability+-3',type:'Armour',ct:0,charge:'cursed',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Field Plate Armour of Vulnerability+/-3}}{{subtitle=Cursed Armour}}{{Armour=+/-3 selectively magical Field Plate}}Specs=[Armour-of-Vulnerability|Armour-of-Resistance,Armour,0H,Plate]{{AC=[[2]][[0-3]] better AC against Slashing damage\n+[[3]] worse AC against any other type}}ACData=[a:Armour-of-Vulnerability+-3,st:Mail,+S:3,+P:-3,+B:-3,ac:2,sz:L,wt:60,sp:0,rc:cursed]{{Speed=0}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=***Curse.*** This armor is cursed, a fact that is revealed only when an identify spell is cast on the armor or you attune to it. Attuning to the armor curses you until you are targeted by the remove curse spell or similar magic; removing the armor fails to end the curse. While cursed, you have vulnerability to two of the three damage types associated with the armor (not the one to which it grants resistance).}}{{desc1=This armour provides resistance to Slashing damage only, but vulnerability to Piercing and Bludgeoning damage. \nThis armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.\nFor each +1 bonus to armor, regardless of the type of armor, the wearer\'s Armor Class moves downward (toward AC 2 . . . to 1 . . . to 0, -1, -2, and so on). Note, however, that Armor Class can never be improved beyond -10}}'},
						{name:'Banded-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Banded Mail Armour}}{{subtitle=Armour}}{{Armour=Banded Mail armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]]\nvs all attacks}}ACData=[a:Banded-Mail,st:Mail,+:0,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Banded-Mail+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Banded Mail +1}}{{subtitle=Magical Armour}}{{Armour=Banded Mail +1 armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]][[0-1]]\nvs all attacks}}ACData=[a:Banded-Mail+1,st:Mail,+:1,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Banded-Mail+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Banded Mail +2}}{{subtitle=Magical Armour}}{{Armour=Banded Mail +2 armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]][[0-2]]\nvs all attacks}}ACData=[a:Banded-Mail+2,st:Mail,+:2,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Banded-Mail+3',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Banded Mail Armour +3}}{{subtitle=Magical Armour}}{{Armour=+3 magical Mail armour}}Specs=[Banded Mail,Armour,0H,Mail]{{AC=[[4]][[0-3]]\nvs all attacks}}ACData=[a:Banded-Mail+3,st:Mail,+:3,ac:4,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of overlapping strips of metal sewn to a backing of leather and chain mail. Generally the strips cover only the more vulnerable areas, while the chain and leather protect the joints where freedom of movement must be ensured. Through straps and buckles, the weight is more or less evenly distributed.}}'},
						{name:'Body-Shield',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Body or Tower Shield}}{{subtitle=Shield}}{{Shield=1-handed body shield (also known as a tower shield) made of wood \\amp metal}}Specs=[Body Shield,Shield,1H,Shield]{{AC=+0, Body/Tower shield}}ACData=[a:Body Shield,st:Shield,+:0,+M:1,sz:M,wt:15]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nThe *body shield* is a massive shield reaching nearly from chin to toe. It must be firmly fastened to the forearm and the shield hand must grip it at all times. It provides a great deal of protection, improving the Armor Class of the character by 1 against melee attacks and by 2 against missile attacks, for attacks from the front or front flank sides. It is very heavy; the DM may wish to use the optional encumbrance system if he allows this shield.}}'},
						{name:'Bracers-AC4',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bracers of Defense AC4}}{{subtitle=Magic Armour}}{{Armour=magical armour composed of a pair of bracers}}Specs=[Bracers,Armour,0H,Magic Item]{{AC=[[4]]}}ACData=[a:Bracers AC4,st:Bracers,+:0,ac:4,sz:S,wt:0]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=These items appear to be wrist or arm guards. Their magic bestows an effective Armor Class equal to someone wearing armor and employing a shield. If armor is actually worn, the bracers have no additional effect, but they do work in conjunction with other magical items of protection. The Armor Class the bracers of defense bestow is determined by making a percentile roll and consulting the table}}'},
						{name:'Bracers-AC5',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bracers of Defense AC5}}{{subtitle=Magic Armour}}{{Armour=magical armour composed of a pair of bracers}}Specs=[Bracers,Armour,0H,Magic Item]{{AC=[[5]]}}ACData=[a:Bracers AC5,st:Bracers,+:0,ac:5,sz:S,wt:0]{{Speed=[[0]]}}[ct:0,ty:uncharged]{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=These items appear to be wrist or arm guards. Their magic bestows an effective Armor Class equal to someone wearing armor and employing a shield. If armor is actually worn, the bracers have no additional effect, but they do work in conjunction with other magical items of protection. The Armor Class the bracers of defense bestow is determined by making a percentile roll and consulting the table}}'},
						{name:'Bracers-AC6',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bracers of Defense AC6}}{{subtitle=Magic Armour}}{{Armour=magical armour composed of a pair of bracers}}Specs=[Bracers,Armour,0H,Magic Item]{{AC=[[6]]}}ACData=[a:Bracers AC6,st:Bracers,+:0,ac:6,sz:S,wt:0]{{Speed=[[0]]}}[ct:0,ty:uncharged]{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=These items appear to be wrist or arm guards. Their magic bestows an effective Armor Class equal to someone wearing armor and employing a shield. If armor is actually worn, the bracers have no additional effect, but they do work in conjunction with other magical items of protection. The Armor Class the bracers of defense bestow is determined by making a percentile roll and consulting the table}}'},
						{name:'Brigandine+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magical Brigandine +1 Armour}}{{subtitle=Armour}}{{Armour=Brigandine Armour +1}}Specs=[Brigandine,Armour,0H,Brigandine]{{AC=[[6]][[0-1]]\nagainst all attacks}}ACData=[a:Brigandine+1,st:Brigandine,+:1,ac:6,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from small metal plates sewn or riveted to a layer of canvas or leather and protected by an outer layer of cloth. It is rather stiff and does not provide adequate protection to the joints where the metal plates must be spaced widely or left off.}}'},
						{name:'Brigandine+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magical Brigandine +2 Armour}}{{subtitle=Armour}}{{Armour=Brigandine Armour +2}}Specs=[Brigandine,Armour,0H,Brigandine]{{AC=[[6]][[0-2]]\nagainst all attacks}}ACData=[a:Brigandine+2,st:Brigandine,+:2,ac:6,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from small metal plates sewn or riveted to a layer of canvas or leather and protected by an outer layer of cloth. It is rather stiff and does not provide adequate protection to the joints where the metal plates must be spaced widely or left off.}}'},
						{name:'Brigandine-Armour',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Brigandine Armour}}{{subtitle=Armour}}{{Armour=Brigandine Armour}}Specs=[Brigandine,Armour,0H,Brigandine]{{AC=[[6]]\nagainst all attacks}}ACData=[a:Brigandine,st:Brigandine,+:0,ac:6,sz:L,wt:35]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from small metal plates sewn or riveted to a layer of canvas or leather and protected by an outer layer of cloth. It is rather stiff and does not provide adequate protection to the joints where the metal plates must be spaced widely or left off.}}'},
						{name:'Bronze-Plate+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bronze Plate Mail +1}}{{subtitle=Armour}}{{Armour=+1 magical plate mail made from bronze}}Specs=[Bronze Plate Mail,Armour,0H,Mail]{{AC=[[4]][[0-1]]\nagainst all attacks}}ACData=[a:Bronze Plate+1,st:Mail,ac:4,+:1,sz:L,wt:45]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a plate mail armor--a combination of metal plates, chain mail or brigandine, leather and padding--made of softer bronze. It is easier and cheaper to make than steel armor, but it does not protect as well. A large breastplate and other metal plates cover areas of the body, but the other materials must protect the joints and movable parts of the body. It is not the full plate armor of the heavy knight of the Late Middle Ages and the Renaissance.}}'},
						{name:'Bronze-Plate+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bronze Plate Mail +2}}{{subtitle=Armour}}{{Armour=+2 magical plate mail made from bronze}}Specs=[Bronze Plate Mail,Armour,0H,Mail]{{AC=[[4]][[0-2]]\nagainst all attacks}}ACData=[a:Bronze Plate+2,st:Mail,ac:4,+:2,sz:L,wt:45]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a plate mail armor--a combination of metal plates, chain mail or brigandine, leather and padding--made of softer bronze. It is easier and cheaper to make than steel armor, but it does not protect as well. A large breastplate and other metal plates cover areas of the body, but the other materials must protect the joints and movable parts of the body. It is not the full plate armor of the heavy knight of the Late Middle Ages and the Renaissance.}}'},
						{name:'Bronze-Plate-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bronze Plate Mail}}{{subtitle=Armour}}{{Armour=Plate mail made from bronze}}Specs=[Bronze Plate Mail,Armour,0H,Mail]{{AC=[[4]] against all attacks}}ACData=[a:Bronze Plate Mail,st:Mail,ac:4,+:0,sz:L,wt:45]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a plate mail armor--a combination of metal plates, chain mail or brigandine, leather and padding--made of softer bronze. It is easier and cheaper to make than steel armor, but it does not protect as well. A large breastplate and other metal plates cover areas of the body, but the other materials must protect the joints and movable parts of the body. It is not the full plate armor of the heavy knight of the Late Middle Ages and the Renaissance.}}'},
						{name:'Buckler',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Buckler}}{{subtitle=Shield}}{{Shield=Hands-free shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shield]{{AC=+0 Buckler, against 1 attack only}}ACData=[a:Buckler,st:Shield,+:0,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Buckler+1',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Buckler+1}}{{subtitle=Magical Shield}}{{Shield=Hands-free magical shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shield]{{AC=+1 Buckler, against 1 attack only}}ACData=[a:Buckler+1,st:Shield,+:1,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Buckler+2',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Buckler+2}}{{subtitle=Magical Shield}}{{Shield=Hands-free magical shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shield]{{AC=+2 Buckler, against 1 attack only}}ACData=[a:Buckler+2,st:Shield,+:2,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Buckler+3',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Buckler+3}}{{subtitle=Magical Shield}}{{Shield=Hands-free magical shield for archers, made of metal}}Specs=[Buckler,Shield,0H,Shield]{{AC=+3 Buckler, against 1 attack only}}ACData=[a:Buckler+3,st:Shield,+:3,sz:S,wt:3]{{Speed=[[0]]}}{{Size=Small}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nA* buckler (or target)* is a very small shield that fastens on the forearm. It can be worn by crossbowmen and archers with no hindrance. Its small size enables it to protect against only one attack per melee round (of the user\'s choice), improving the character\'s Armor Class by 1 against that attack.}}'},
						{name:'Chain-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Chain Mail}}{{subtitle=Armour}}{{Armour=Chain Mail}}Specs=[Chain Mail,Armour,0H,Mail]{{AC=[[5]]\nvs all attacks}}ACData=[a:Chain Mail,st:Mail,+:0,ac:5,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}'},
						{name:'Chain-Mail+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Chain Mail +1}}{{subtitle=Magical Armour}}{{Armour=+1 magical chain mail}}Specs=[Chain mail,Armour,0H,Mail]{{AC=[[5]][[0-1]]\nvs all attacks}}ACData=[a:Chain Mail+1,st:Mail,+:1,ac:5,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}'},
						{name:'Chain-Mail+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Chain Mail +2}}{{subtitle=Magical Armour}}{{Armour=+2 magical chain mail}}Specs=[Chain mail,Armour,0H,Mail]{{AC=[[5]][[0-2]]\nvs all attacks}}ACData=[a:Chain Mail+2,st:Mail,+:2,ac:5,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of interlocking metal rings. It is always worn with a layer of quilted fabric padding underneath to prevent painful chafing and to cushion the impact of blows. Several layers of mail are normally hung over vital areas. The links yield easily to blows, absorbing some of the shock. Most of the weight of this armor is carried on the shoulders and it is uncomfortable to wear for long periods of time.}}'},
						{name:'Field-Plate',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Field Plate}}{{subtitle=Armour}}{{Armour=Field plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]] against all attacks}}ACData=[a:Field Plate,st:Plate,ac:3,+:0,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Field-Plate+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Field Plate+1}}{{subtitle=Armour}}{{Armour=Magical Field plate +1}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]][[0-1]]\nagainst all attacks}}ACData=[a:Field Plate+1,st:Plate,ac:3,+:1,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Field-Plate+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Field Plate+2}}{{subtitle=Armour}}{{Armour=Magical Field plate +2}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]][[0-2]]\nagainst all attacks}}ACData=[a:Field Plate+2,st:Plate,ac:3,+:2,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Full-Plate',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Full-Plate Armour}}{{subtitle=Armour}}{{Armour=Full Plate}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]]\nagainst all attacks}}ACData=[a:Full Plate,st:Plate,+:0,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Full-Plate+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Full-Plate+1}}{{subtitle=Armour}}{{Armour=+1 magical Full Plate}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]][[0-1]]\nagainst all attacks}}ACData=[a:Full Plate+1,st:Plate,+:1,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Full-Plate+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Full-Plate+2}}{{subtitle=Armour}}{{Armour=+2 magical Full Plate}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]][[0-2]]\nagainst all attacks}}ACData=[a:Full Plate+2,st:Plate,+:2,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Helm-of-Languages',type:'Miscellaneous',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Helm of Comprehending Languages \\amp Reading Magic}}{{subtitle=Magic Item}}Specs=[Helm of Languages,Miscelaneous,0H,Helm]{{Speed=[[0]]}}ACData=[sp:0,rc:uncharged]{{Size=Medium}}{{Immunity=None}}{{desc=Appearing as a normal helmet, a helmet of comprehending languages and reading magic enables its wearer to understand 90% of strange tongues and writings and 80% of magical writings. (Note that these percentage figures apply to whether all or none of the speaking/writing or inscription is understandable. Understanding does not necessarily imply spell use.) This device is equal to a normal helmet of the type accompanying Armor Class 5.}}'},
						{name:'Hide-Armour',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hide Armour}}{{subtitle=Armour}}{{Armour=Hide Armour}}Specs=[Hide,Armour,0H,Hide]{{AC=[[6]]\nagainst all attacks}}ACData=[a:Hide,st:Hide,+:0,ac:6,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is armor prepared from the extremely thick hide of a creature (such as an elephant) or from multiple layers of regular leather. It is stiff and hard to move in.}}'},
						{name:'Hide-Armour+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hide Armour +1}}{{subtitle=Magical Armour}}{{Armour=Hide Armour +1}}Specs=[Hide,Armour,0H,Hide]{{AC=[[6]][[0-1]]\nagainst all attacks}}ACData=[a:Hide+1,st:Hide,+:1,ac:6,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is armor prepared from the extremely thick hide of a creature (such as an elephant) or from multiple layers of regular leather. It is stiff and hard to move in.}}'},
						{name:'Hide-Armour+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hide Armour +2}}{{subtitle=Magical Armour}}{{Armour=Hide Armour +2}}Specs=[Hide,Armour,0H,Hide]{{AC=[[6]][[0-2]]\nagainst all attacks}}ACData=[a:Hide+2,st:Hide,+:2,ac:6,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is armor prepared from the extremely thick hide of a creature (such as an elephant) or from multiple layers of regular leather. It is stiff and hard to move in.}}'},
						{name:'Indirect',type:'',ct:0,charge:'uncharged',cost:0,body:'@{'},
						{name:'Leather',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Leather Armour}}{{subtitle=Armour}}{{Armour=Leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]]\nagainst all attacks}}ACData=[a:Leather,st:Leather,+:0,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Leather+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Leather+1}}{{subtitle=Magical Armour}}{{Armour=+1 magical leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]][[0-1]]\nagainst all attacks}}ACData=[a:Leather+1,st:Leather,+:1,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Leather+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Leather+2}}{{subtitle=Magical Armour}}{{Armour=+2 magical leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]][[0-2]]\nagainst all attacks}}ACData=[a:Leather+2,st:Leather,+:2,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Leather-Armour',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Leather Armour}}{{subtitle=Armour}}{{Armour=Leather armour}}Specs=[Leather,Armour,0H,Leather]{{AC=[[8]]\nagainst all attacks}}ACData=[a:Leather,st:Leather,+:0,ac:8,sz:L,wt:15]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made of leather hardened in boiling oil and then shaped into breastplate and shoulder protectors. The remainder of the suit is fashioned from more flexible, somewhat softer materials.}}'},
						{name:'Magical-Armour',type:'',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Magical Armour}}{{subtitle=Magical Armour}}{{Speed=[[0]]}}{{Size=Large}}{{Immunity=Unknown}}{{Resistance=+? on AC}}{{Saves=Unknown effect}}{{desc=This armour appears especially well made, and seems to glow somewhat if in a darkened area. Check with the DM as to what type of materials it seems to be made of}}'},
						{name:'Magical-Shield',type:'',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Magical Shield}}{{subtitle=Magical Armour}}{{Shield=+? on AC}}[Magical Shield,Armour,1H,Shield]{{AC=AC [[0-1]] -?}}ACData=[a:Magical Shield,st:Shield,+:0,sz:M,wt:10]{{Speed=[[0]]}}{{Size=Medium (even if small)}}{{Immunity=Unknown}}{{Saves=Unknown effect}}{{desc=This shield seems to be exceptionally finely crafted, and gleams with hidden power. Check with the DM about its size and material components}}'},
						{name:'Magical-plate+0',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magical Plate +0}}{{subtitle=Magical Armour}}{{Armour=+0 magical armour (so resizes itself to fit}}Specs=[Full Plate,Armour,0H,Plate]{{AC=[[1]]\nagainst all attacks}}ACData=[a:Magical Plate+0,st:Plate,+:0,ac:1,sz:L,wt:70]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Resistance=+[[0]] on AC}}{{Saves=No effect}}{{desc=This is the impressive, high Gothic-style armor of the Late Middle Ages and Renaissance. It is perfectly forged and fitted. All the plates are interlocking and carefully angled to deflect blows. The surfaces are normally highly ornamented with etching and inlaid metals. Each suit must be carefully custom-fitted to the owner and there is only a 20% chance that a captured suit can be refitted to a new owner of approximately the same size. The metal plates are backed by padding and chain mail. The weight is well-distributed. The armor is hot, slow to don, and extremely expensive. *Due to these factors, it tends to be used more for parades and triumphs than actual combat.*}}'},
						{name:'Memorise-MI-Power',type:'',ct:0,charge:'uncharged',cost:0,body:'!magic --mem-spell MIPOWERS|@{selected|token_id}'},
						{name:'Padded-Armour',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Padded Armour}}{{subtitle=Armour}}{{Armour=Padded armour}}Specs=[Padded Armour,Armour,0H,Padded]{{AC=[[8]]\nagainst all attacks}}ACData=[a:Padded Armour,st:Padded,+:0,ac:8,sz:L,wt:10]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the simplest type of armor, fashioned from quilted layers of cloth and batting. It tends to get hot and after a time becomes foul with sweat, grime, lice, and fleas.}}'},
						{name:'Padded-Armour+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Padded Armour +1}}{{subtitle=Magical Armour}}{{Armour=Magical Padded armour +1}}Specs=[Padded Armour,Armour,0H,Padded]{{AC=[[8]][[0-1]]\nagainst all attacks}}ACData=[a:Padded Armour+1,st:Padded,+:1,ac:8,sz:L,wt:10]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the simplest type of armor, fashioned from quilted layers of cloth and batting. It tends to get hot and after a time becomes foul with sweat, grime, lice, and fleas.}}'},
						{name:'Padded-Armour+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Padded Armour +2}}{{subtitle=Magical Armour}}{{Armour=Magical Padded armour +2}}Specs=[Padded Armour,Armour,0H,Padded]{{AC=[[8]][[0-2]]\nagainst all attacks}}ACData=[a:Padded Armour+2,st:Padded,+:2,ac:8,sz:L,wt:10]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the simplest type of armor, fashioned from quilted layers of cloth and batting. It tends to get hot and after a time becomes foul with sweat, grime, lice, and fleas.}}'},
						{name:'Plate+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magical Plate+1}}{{subtitle=Armour}}{{Armour=+1 magical field plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[2]][[0-1]] against all attacks}}ACData=[a:Field Plate +1,st:Plate,ac:2,+:1,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Plate+1+3-vs-Breath',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magical Plate+1, +3 vs Breath Weapons}}{{subtitle=Armour}}{{Armour=+1 Field Plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[2]][[0-1]] against all attacks}}ACData=[a:Field Plate+1+3 vs Breath,st:Plate,ac:2,+:1,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=+[[3]] vs Breath Weapons}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Plate+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magical Plate+2}}{{subtitle=Armour}}{{Armour=+2 magical field plate}}Specs=[Field Plate,Armour,0H,Plate]{{AC=[[3]][[0-2]] against all attacks}}ACData=[a:Field Plate+2,st:Plate,ac:3,+:2,sz:L,wt:60]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is the most common version of full plate armor, consisting of shaped and fitted metal plates riveted and interlocked to cover the entire body. It includes gauntlets, boots, and a visored helmet. A thick layer of padding must be worn underneath. However, the weight of the suit is well-distributed over the whole body. Such armor hampers movement only slightly. Aside from its expense, the main disadvantages are the lack of ventilation and the time required to put it on and take it off. Each suit of field plate must be individually fitted to its owner by a master armorer, although captured pieces can be resized to fit the new owner (unless such is patently absurd, such as a human trying to resize a halfling\'s armor).}}'},
						{name:'Plate-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Plate Mail}}{{subtitle=Armour}}{{Armour=Plate mail made from steel}}Specs=[Plate Mail,Armour,0H,Mail]{{AC=[[3]] against all attacks}}ACData=[a:Plate Mail,st:Mail,ac:3,+:0,sz:L,wt:50]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.}}'},
						{name:'Plate-Mail+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Plate Mail+1}}{{subtitle=Magical Armour}}{{Armour=Magical Plate Mail +1}}Specs=[Plate Mail,Armour,0H,Mail]{{AC=[[3]][[0-1]]\nagainst all attacks}}ACData=[a:Plate Mail+1,st:Mail,ac:3,+:1,sz:L,wt:50]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.}}'},
						{name:'Plate-Mail+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Plate Mail+2}}{{subtitle=Magical Armour}}{{Armour=Magical Plate Mail +2}}Specs=[Plate Mail,Armour,0H,Mail]{{AC=[[3]][[0-2]]\nagainst all attacks}}ACData=[a:Plate Mail+2,st:Mail,ac:3,+:2,sz:L,wt:50]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is a combination of chain or brigandine with metal plates (cuirass, epaulettes, elbow guards, gauntlets, tasets, and greaves) covering vital areas. The weight is distributed over the whole body and the whole thing is held together by buckles and straps. This is the most common form of heavy armor.}}'},
						{name:'Ring-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ring Mail}}{{subtitle=Armour}}{{Armour=Ring Mail}}Specs=[Ring Mail,Armour,0H,Mail]{{AC=[[7]]\nagainst all attacks}}ACData=[a:Ring Mail,st:Mail,+:0,ac:7,sz:L,wt:30]{{Speed=[[0]]}}[ct:0,ty:uncharged]{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is an early (and less effective) form of chain mail in which metal rings are sewn directly to a leather backing instead of being interlaced. (Historians still debate whether this armor ever existed.)}}'},
						{name:'Ring-Mail+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ring Mail+1}}{{subtitle=Armour}}{{Armour=Magical Ring Mail+1}}Specs=[Ring Mail,Armour,0H,Mail]{{AC=[[7]][[0-1]]\nagainst all attacks}}ACData=[a:Ring Mail+1,st:Mail,+:1,ac:7,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is an early (and less effective) form of chain mail in which metal rings are sewn directly to a leather backing instead of being interlaced. (Historians still debate whether this armor ever existed.)}}'},
						{name:'Ring-Mail+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ring Mail+2}}{{subtitle=Armour}}{{Armour=Magical Ring Mail+2}}Specs=[Ring Mail,Armour,0H,Mail]{{AC=[[7]][[0-2]]\nagainst all attacks}}ACData=[a:Ring Mail+2,st:Mail,+:2,ac:7,sz:L,wt:30]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is an early (and less effective) form of chain mail in which metal rings are sewn directly to a leather backing instead of being interlaced. (Historians still debate whether this armor ever existed.)}}'},
						{name:'Scale-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scale Mail}}{{subtitle=Armour}}{{Armour=Scale Mail}}Specs=[Scale Mail,Armour,0H,Mail]{{AC=[[6]]\nagainst all attacks}}ACData=[a:Scale Mail,st:Mail,+:0,ac:6,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish.}}'},
						{name:'Scale-Mail+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scale Mail+1}}{{subtitle=Magical Armour}}{{Armour=Magical Scale Mail+1}}Specs=[Scale Mail,Armour,0H,Mail]{{AC=[[6]][[0-1]]\nagainst all attacks}}ACData=[a:Scale Mail+1,st:Mail,+:1,ac:6,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish.}}'},
						{name:'Scale-Mail+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scale Mail+2}}{{subtitle=Magical Armour}}{{Armour=Magical Scale Mail+2}}Specs=[Scale Mail,Armour,0H,Mail]{{AC=[[6]][[0-2]]\nagainst all attacks}}ACData=[a:Scale Mail+2,st:Mail,+:2,ac:6,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This is a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish.}}'},
						{name:'Shield',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Medium Shield}}{{subtitle=Shield}}{{Shield=1-handed medium shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shield]{{AC=+0, Medium shield}}ACData=[a:Medium Shield,st:Shield,+:0,sz:M,wt:10]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						{name:'Shield+1',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Shield+1}}{{subtitle=Shield}}{{Shield=1-handed +1 Medium Shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shield]{{AC=+[[1]] against all attacks from the front}}ACData=[a:Medium Shield+1,st:Shield,+:1,sz:M,wt:10]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						{name:'Shield+2',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Shield+2}}{{subtitle=Shield}}{{Shield=1-handed +2 Medium Shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shield]{{AC=+[[2]] against all attacks from the front}}ACData=[a:Medium Shield+2,st:Shield,+:2,sz:M,wt:10]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						{name:'Small-Shield+1',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Small Magical Shield+1}}{{subtitle=Shield}}{{Shield=1-handed +1 Small Shield made of wood \\amp metal}}Specs=[Small Shield,Shield,1H,Shield]{{AC=+[[1]] against only 2 attacks from the front}}ACData=[a:Small Shield+1,st:Shield,+:1,sz:M,wt:5]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*A small shield* is carried on the forearm and gripped with the hand. Its light weight permits the user to carry other items in that hand (although he cannot use weapons). *It can be used to protect against **only** two frontal attacks of the user\'s choice.*}}'},
						{name:'Small-metal-shield+1',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Small Metal Shield+1 made of metal \\amp some wood}}{{subtitle=Shield}}{{Shield=1-handed +1 Small Metal Shield}}Specs=[Small Metal Shield,Shield,1H,Shield]{{AC=+[[1]] against only 2 attacks from the front}}ACData=[a:Small Metal Shield+1,st:Shield,+:1,sz:M,wt:5]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*A small shield* is carried on the forearm and gripped with the hand. Its light weight permits the user to carry other items in that hand (although he cannot use weapons). *It can be used to protect against **only** two frontal attacks of the user\'s choice.*}}'},
						{name:'Small-wood-shield+1',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Small Wooden Shield+1}}{{subtitle=Shield}}{{Shield=1-handed +1 Small Wooden Shield}}Specs=[Small Wooden Shield,Shield,1H,Wooden Shield]{{AC=+[[1]] against only 2 attacks from the front}}ACData=[a:Small Wooden Shield+1,st:Wooden Shield,+:1,sz:M,wt:4]{{Speed=[[0]]}}{{Size=M}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*A small shield* is carried on the forearm and gripped with the hand. Its light weight permits the user to carry other items in that hand (although he cannot use weapons). *It can be used to protect against **only** two frontal attacks of the user\'s choice.*}}'},
						{name:'Splint-Mail',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Splint Mail}}{{subtitle=Armour}}{{Armour=Splint Mail}}Specs=[Splint Mail,Armour,0H,Mail]{{AC=[[4]]\nvs all attacks}}ACData=[a:Splint Mail,st:Mail,+:0,ac:4,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=The existence of this armor has been questioned. It is claimed that the armor is made of narrow vertical strips riveted to a backing of leather and cloth padding. Since this is not flexible, the joints are protected by chain mail.}}'},
						{name:'Splint-Mail+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Splint Mail+1}}{{subtitle=Magical Armour}}{{Armour=Magical Splint Mail+1}}Specs=[Splint Mail,Armour,0H,Mail]{{AC=[[4]][[0-1]]\nvs all attacks}}ACData=[a:Splint Mail+1,st:Mail,+:1,ac:4,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=The existence of this armor has been questioned. It is claimed that the armor is made of narrow vertical strips riveted to a backing of leather and cloth padding. Since this is not flexible, the joints are protected by chain mail.}}'},
						{name:'Splint-Mail+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Splint Mail+2}}{{subtitle=Magical Armour}}{{Armour=Magical Splint Mail+2}}Specs=[Splint Mail,Armour,0H,Mail]{{AC=[[4]][[0-2]]\nvs all attacks}}ACData=[a:Splint Mail+2,st:Mail,+:2,ac:4,sz:L,wt:40]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=The existence of this armor has been questioned. It is claimed that the armor is made of narrow vertical strips riveted to a backing of leather and cloth padding. Since this is not flexible, the joints are protected by chain mail.}}'},
						{name:'Studded-Leather',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Studded Leather Armour}}{{subtitle=Armour}}{{Armour=Studded leather armour}}Specs=[Studded Leather,Armour,0H,Leather]{{AC=[[7]]\nagainst all attacks}}ACData=[a:Studded Leather,st:Leather,+:0,ac:7,sz:L,wt:25]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from leather (not hardened as with normal leather armor) reinforced with close-set metal rivets. In some ways it is very similar to brigandine, although the spacing between each metal piece is greater.}}'},
						{name:'Studded-Leather+1',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Studded Leather+1}}{{subtitle=Magical Armour}}{{Armour=+1 magical studded leather armour}}Specs=[Studded Leather,Armour,0H,Leather]{{AC=[[7]][[0-1]]\nagainst all attacks}}ACData=[a:Studded Leather+1,st:Leather,+:1,ac:7,sz:L,wt:25]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from leather (not hardened as with normal leather armor) reinforced with close-set metal rivets. In some ways it is very similar to brigandine, although the spacing between each metal piece is greater.}}'},
						{name:'Studded-Leather+2',type:'Armour',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Studded Leather+2}}{{subtitle=Magical Armour}}{{Armour=+2 magical studded leather armour}}Specs=[Studded Leather,Armour,0H,Leather]{{AC=[[7]][[0-2]]\nagainst all attacks}}ACData=[a:Studded Leather+2,st:Leather,+:2,ac:7,sz:L,wt:25]{{Speed=[[0]]}}{{Size=Large}}{{Immunity=None}}{{Saves=No effect}}{{desc=This armor is made from leather (not hardened as with normal leather armor) reinforced with close-set metal rivets. In some ways it is very similar to brigandine, although the spacing between each metal piece is greater.}}'},
						{name:'Tower-Shield',type:'Shield',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Tower or Body Shield}}{{subtitle=Shield}}{{Shield=1-handed tower shield (also known as a body shield) made of wood \\amp metal}}Specs=[Tower Shield,Shield,1H,Shield]{{AC=+0, Tower/Body shield}}ACData=[a:Tower Shield,st:Shield,+:0,+M:1,sz:M,wt:15]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\nThe *body shield* is a massive shield reaching nearly from chin to toe. It must be firmly fastened to the forearm and the shield hand must grip it at all times. It provides a great deal of protection, improving the Armor Class of the character by 1 against melee attacks and by 2 against missile attacks, for attacks from the front or front flank sides. It is very heavy; the DM may wish to use the optional encumbrance system if he allows this shield.}}'},
						{name:'Unknown-Bracers',type:'',ct:0,charge:'uncharged',cost:0,body:'/w "@{selected|character_name}" \\amp{template:2Espell}{{title=Unknown Bracers}}{{splevel=Bracers}}{{school=Unknown}}{{components=M}}{{time=Unknown}}{{range=Unknown}}{{duration=Unknown}}{{aoe=Unknown}}{{save=Unknown}}{{effects=The powers of these bracers are unknown. In fact, are they magical bracers at all, or just of fine quality and just treasure?}}{{materials=Bracers}}'},
						{name:'Wooden-Shield',type:'Shield',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Medium Wooden Shield}}{{subtitle=Shield}}{{Shield=1-handed medium shield made of wood \\amp metal}}Specs=[Medium Shield,Shield,1H,Shield]{{AC=+0, Medium shield}}ACData=[a:Medium Shield,st:Shield,+:0,sz:M,wt:10]{{Speed=[[0]]}}{{Size=Medium}}{{Immunity=None}}{{Saves=No effect}}{{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.\n*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}'},
						]},
	MI_DB_Weapons:	{bio:'<blockquote>Weapons Database</blockquote><b>v5.5  05/11/2021</b><br><br>This sheet holds definitions of weapons that can be used in the redMaster API system.  They are defined in such a way as to be lootable and usable magic items for magicMaster and also usable weapons in attackMaster.',
					gmnotes:'<blockquote>Change Log:</blockquote>v5.5  05/11/2021  Split the Ammo and Weapons databases<br><br>v5.4  31/10/2021  Further encoded using machine readable data to support API databases<br><br>v5.3.4  21/08/2021  Fixed incorrect damage for all types of Two-handed Sword<br><br>v5.3.3  07/06/2021  Added the missing Scimitar macro<br><br>v5.3.2  31/05/2021  Cleaned ranged weapon ranges, as specifying a range for the weapon in the {{To-Hit=...}} section will now adjust the range of the ammo by that amount (for extended range weapons).  Self-ammoed weapons (like thrown daggers) should specify their range in the {{Range=...}} section.<br><br>v5.3.1  19/05/2021  Fixed a couple of bugs, missing weapons in the transfer from MI-DB<br><br>v5.3  14/05/2021  All standard weapons from the PHB now encoded.<br><br>v5.2  12/05/2021  Added support for weapon types (S,P,B), and more standard weapons<br><br>v5.1  06/05/2021  Added a number of standard and magical weapons<br><br>v5.0  28/04/2021  Initial separation of weapons listings from the main MI-DB',
					root:'MI-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
					version:5.5,
					db:[{name:'-',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" This is a blank slot in your Magic Item bag. Go search out some new Magic Items to fill it up!'},
						{name:'Awl-Pike',type:'Melee',ct:'13',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Awl Pike}}{{subtitle=Polearm}}{{Speed=[[13]]}}Speed=[13,uncharged]{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Awl Pike,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Awl Pike,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:12-20,sp:13,rc:uncharged]{{Attacks=1 per 2 rounds + specialisation \\amp level, Piercing}}{{Damage=SM:1d6, L:1d12, + Str Bonus}}DmgData=[w:Awl Pike,sb:1,+:0,SM:1d6,L:1d12]{{desc=This is a normal Awl Pike, a type of Polearm. The point is sharp and keen, but nothing special. However, it still does double damage when set to receive a charge.\nEssentially this is a long spear 12 to 20 feet long ending in a spike point of tapered spear head. It was a popular weapon during the Renaissance. Since the pike stuck out in front, men could be packed side-by-side in dense formations, and several rows of men could fight. Large blocks of pikemen made formidable troops. However, once the pikemen engaged in close combat, they normally dropped their clumsy awl pikes and fought hand-to-hand with short swords.}}'},
						{name:'Bardiche',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bardiche}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Bardiche,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bardiche,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:5-8,sp:9,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+0, SM:1d6, L:1d12, + Str Bonus}}DmgData=[w:Awl Pike,sb:1,+:0,SM:1d6,L:1d12]{{desc=This is a normal Bardiche, a type of Polearm. The point is sharp and keen, but nothing special.\nOne of the simplest of polearms, the bardiche is an elongated battle axe. A large curving axe-head is mounted on the end of a shaft 5 to 8 feet long. It probably grew out of common peasant tools and was popular with them. One relative disadvantage is that the bardiche required more space to wield than a pike or a spear.}}'},
						{name:'Bastard-Sword',type:'Melee|Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bastard Sword}}{{subtitle=Sword}}{{Speed=1H [[6]], 2H [[8]]}}{{Size=Medium}}{{Weapon=1 or 2-handed melee long blade}}Specs=[Bastard-Sword, Melee, 1H, Long-blade],[Bastard-Sword, Melee, 2H, Long-blade]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bastard-Sword, sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:6,rc:uncharged],[w:Bastard-Sword 2H,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:8]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Bastard-Sword,sb:1,+:0,SM:1d8,L:1d12],[w:Bastard-Sword 2H,sb:1,+:0,SM:2d4,L:2d8]{{desc=This is a normal sword. The blade is sharp and keen, but nothing out of the ordinary.}}'},
						{name:'Bastard-Sword+1',type:'Melee|Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bastard Sword+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1 or 2-handed melee long blade}}Specs=[Bastard-Sword,Melee,1H,Long-blade],[Bastard-Sword,Melee,2H,Long-blade]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Bastard Sword+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:6,rc:uncharged],[w:Bastard Sword 2H+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:8,,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+1, 1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Bastard Sword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Bastard Sword 2H+1,sb:1,+:1,SM:2d4,L:2d8]{{desc=This is a normal magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Bastardsword-of-Adaptation+1',type:'Melee|Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bastardsword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1- or 2-handed melee long-blade}}Specs=[Bastard-Sword,Melee,1H,Long-blade],[Bastard-Sword,Melee,2H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Bastardsword of Adapt+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:6],[w:Bastardsword of Adapt 2H+1, sb:1, +:1, n:1, ch:20, cm:1, sz:M, ty:S, r:5, sp:8]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1,\n **1H:** SM:1d8, L:1d12\n**2H:** SM:2d4, L:2d8\n+ Str bonus}}DmgData=[w:Bastardsword of Adapt+1,sb:1,+:1,SM:1d8,L:1d12],[w:Bastardsword of Adapt 2H+1,sb:1,+:1,SM:2d4,L:2d8]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Battle-Axe',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Battle Axe}}{{subtitle=Axe}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee axe}}Specs=[Battle-Axe,Melee,1H,Axe]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Battle Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:7,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+0, SM:1d8, L:1d12 + Str Bonus}}DmgData=[w:Battle Axe,sb:1,+:0,SM:1d8,L:1d12]{{desc=A standard Battle Axe of good quality, but nothing special}}'},
						{name:'Battle-Axe+1',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Battle Axe+1}}{{subtitle=Magic Weapon}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee axe}}Specs=[Battle-Axe,Melee,1H,Axe]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Battle Axe+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:7,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+1, SM:1d8, L:1d12 + Str Bonus}}DmgData=[w:Battle Axe,sb:1,+:1,SM:1d8,L:1d12]{{desc=A standard Battle Axe of fine quality, good enough to be enchanted to be a +1 magical weapon}}'},
						{name:'Bec-de-Corbin',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bec de Corbin}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee pole arm}}Specs=[Bec de Corbin,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bec de Corbin,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PB,r:8,sp:9,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, piercing \\amp bludgeoning}}{{Damage=+0+Str Bonus, SM:1d8, L:1d6}}DmgData=[w:Bec de Corbin,sb:1,+:0,SM:1d8,L:1d6]{{desc=This is a normal Bec de Corbin, a type of Polearm, especially good against politicians of a certain persuasion. The point is sharp and keen, but nothing special.\nThis was a highly specialized weapon of the upper classes during the Late Middle Ages and the early Renaissance. It is an early can-opener designed specifically to deal with plate armor. The pick or beak is made to punch through plate, while the hammer side can be used to give a stiff blow. The end is fitted with a short blade for dealing with unarmored or helpless foes. The weapon is about eight feet long. Since the weapon relies on impact, a great deal of swinging space is needed.}}'},
						{name:'Bill-guisarme',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Bill-guisarme}}{{subtitle=Polearm}}{{Speed=[[10]]}}{{Size=Large}}{{Weapon=2-handed melee pole arm}}Specs=[Bill-guisarme,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Bill-guisarme,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:7-8,sp:10,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Piercing \\amp Slashing}}{{Damage=+0+Str Bonus, SM:2d4, L:1d10}}DmgData=[w:Bill-guisarme,sb:1,+:0,SM:2d4,L:1d10]{{desc=This is a normal Bill-guisarme, a type of Polearm. The point is sharp and keen, but nothing special.\nA particularly bizarre-looking combination weapon, the bill-guisarme is an outgrowth of the common bill hook. Mounted on a seven- to eight-foot-long pole, it has a combination of a heavy cleaver blade, a jutting back spike, and a hook or spike on the end. Thus, it can be used in several different ways. Like most polearms, it requires lots of room to use.}}'},
						{name:'Blackrazor',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Blackrazor\nIntelligent, Chaotic Neutral}}{{subtitle=Magic Sword}}{{Speed=[[8]]}}{{Size=M}}{{Weapon=2-handed melee Greatsword}}Specs=[Greatsword,Melee,2H,Long-blade],[Greatsword,Melee,2H,Long-blade]{{To-hit=+3 + Str Bonus}}ToHitData=[w:Blackrazor, sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:S,r:5,sp:8,rc:uncharged],[w: Blackrazor vs Undead,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:S,r:5,sp:8,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Slashing}}{{Damage=+3 + Str Bonus, SM:2d6, L:2d10, drain HP on kill, -ve vs. Undead}}DmgData=[w:Blackrazor,sb:1,+:3,SM:2d6,L:2d10],[[w:Blackrazor vs Undead,sb:1,SM:0-1d10,L:0-1d10]{{resistance=Charm \\amp Fright (e.g. *Spook, Fear*)}}WeapData=[w:Blackrazor,ns:1][cl:PW,w:Blackrazor-Haste,sp:3,lv:12,pd:1]{{saves=Advantage on To-Hit, Saves \\amp NWP roles}}{{desc=**Blackrazor:** Weapon (greatsword), legendary (requires attunement by a creature of non-lawful alignment)\n\n**Attacks:** +3 on attack and damage\n**Devour Soul:** If reduce target to [[0]] HP, you get temporary HP equal to slain creature\'s HP max (subsequent kills overwrite). HP fade after Long Rest. While have temporary HP and *Blackrazor* is in hand, have advantage on attacks, saves, and NWP checks - roll d20 twice \\amp take best roll.\n**Undead:** If hit undead, you take [1d10](!\\amp#13;\\amp#47;r 1d10) necrotic damage, target regains the HP you loose. If this necrotic damage reduces you to 0 hit points, *Blackrazor* devours your soul.\n**Soul Hunter:** While held, you are aware of Tiny or larger creatures within [[60]] feet, not constructs or undead.\n**Immunity:** Can\'t be *charmed* or *frightened*.\n[Haste](!magic --mi-power @{selected|token_id}|Blackrazor-Haste|Blackrazor|12) 1/day ***It*** decides to cast and maintains concentration on it so that you don\'t have to.\n\nFor full detail, **[click here to see Blackrazor](http://journal.roll20.net/handout/-Kdm2Y9fzQXxv-4v6a-G)** handout}}'},
						{name:'Blowgun',type:'Ranged',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Blowgun}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed ranged blowgun}}Specs=[Blowgun,Ranged,1H,Blowgun]{{To-hit=+0 +Dex Bonus}}ToHitData=[w:Blowgun,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:5,rc:uncharged]{{Attacks=2 per round + specialisation \\amp level, Piercing}}{{desc=This is a normal blowgun. The tube is clean and smooth, but nothing special.}}'},
						{name:'Broadsword',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Broadsword}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handled melee long blade}}Specs=[Broadsword,Melee,1H,Long-blade]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Broadsword,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged]{{Attack=1 per round + specialisation \\amp level, Slashing}}{{Damage=+0 + Str Bonus, \nvs. SM:2d4, L:1+1d6}}DmgData=[w:Broadsword,sb:1,+:0,SM:2d4,L:1+1d6]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Club',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Club}}{{subtitle=Bludgeoning Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Club,Melee,1H,Club]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Club,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Bludgeoning}}{{Damage=+0 + Str Bonus, vs SM:1d6, L:1d3}}DmgData=[w:Club,sb:1,+:0,SM:1d6,L:1d3]{{desc=This is a good but ordinary club. The wood is hard and heavy, but somewhat dull with smears of something brown.}}'},
						{name:'Club+1',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Club+1}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Club,Melee,1H,Club]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Club,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4,rc:uncharged]{{Attacks=1 per round + specialisation \\amp level, Bludgeoning}}{{Damage=+1 + Str Bonus, vs SM:1d6, L:1d3}}DmgData=[w:Club,sb:1,+:1,SM:1d6,L:1d3]{{desc=This is a magical club. The wood is hard and heavy with a silvery sheen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Composite-Longbow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Composite Longbow}}{{subtitle=Bow}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Composite-Longbow,Ranged,2H,Bow]{{To-hit=+0 + any ammo, Dex and Str bonuses}}ToHitData=[w:Composite Longbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:7,rc:uncharged]{{Attacks=2 per round regardless of level or specialisation}}{{desc=This is a composite longbow (otherwise known as a Recurve Bow). The limbs have well-bonded laminations of good quality wood, which make it strong and flexible, but nothing special}}'},
						{name:'Composite-Longbow+1',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Composite Longbow+1}}{{subtitle=Magic Bow}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Composite-Longbow,Ranged,2H,Bow]{{To-hit=+1 + any ammo, Dex \\amp Str bonuses}}ToHitData=[w:Composite Longbow+1,sb:1,db:1,+:1,n:2,ch:20,cm:1,sz:L,ty:P,r:=+0/+2/+2/+2,sp:8,rc:uncharged]{{Attacks=2 per round regardless of level or specialisation}}{{desc=This is a magical longbow. The limbs are strong enough to add strength bonuses, and increase Short, Medium and Long range for each type of ammunition by 20 (PB remains at 30). Any bow string that is strung immediately seems like fine silver, and is a delight to draw. It is a +[[1]] magical weapon at all times, which counts even if using normal arrows.}}'},
						{name:'Composite-Shortbow',type:'Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Composite Shortbow}}{{subtitle=Bow}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=2-handed ranged bow}}Specs=[Composite-Shortbow,Ranged,2H,Bow]{{To-hit=+0 + any ammo, Dex \\amp Str bonuses}}ToHitData=[w:Composite Shortbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:6,rc:uncharged]{{Attacks=2 per round regardless of level or specialisation}}{{desc=This is a composite shortbow (otherwise known as a Recurve Bow). The limbs have well-bonded laminations of good quality wood, which make it strong and flexible, but nothing special}}'},
						{name:'Dagger',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger}}{{subtitle=Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+0 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger,sb:1,+:0,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+0, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger,sb:1,+:0,SM:1d4,L:1d3],[ ]{{Ammo=+0, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger,t:Dagger,st:Dagger,sb:1,+:0,SM:1d4,L:1d3,]{{Range=S:10, M:20, L:30}}RangeData=[t:Dagger,+:0,r:1/2/3]{{desc=A standard Dagger of good quality, but otherwise ordinary}}'},
						{name:'Dagger+1',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger+1}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+1 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger+1,sb:1,+:1,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+1,sb:1,db:1,+:1,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+1, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+1,sb:1,+:1,SM:1d4,L:1d3],[]{{Ammo=+1, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+1,t:Dagger,st:Dagger,sb:1,+:1,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:1,r:-/1/2/3]{{desc=A standard Dagger of fine quality, good enough to be enchanted to be a +1 magical weapon}}'},
						{name:'Dagger+2',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger+2}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+2 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+2,sb:1,+:2,SM:1d4,L:1d3],[]{{Ammo=+2, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+2,t:Dagger,st:Dagger,sb:1,+:2,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:2,r:-/1/2/3]{{desc=A standard Dagger Axe of fine quality, good enough to be enchanted to be a +2 magical weapon}}'},
						{name:'Dagger+3',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger+3}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+3 + Str Bonus (or Dex if thrown)}}ToHitData=[w:Dagger+3,sb:1,+:3,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+3,sb:1,db:1,+:3,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+3, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+3,sb:1,+:3,SM:1d4,L:1d3],[]{{Ammo=+3, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+3,t:Dagger,st:Dagger,sb:1,+:3,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:3,r:-/1/2/3]{{desc=A standard Dagger Axe of fine quality, good enough to be enchanted to be a +3 magical weapon}}'},
						{name:'Dagger-Elf-Slayer',type:'Melee|Melee|Ranged|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger+2 +4 vs Elves}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+2, +4 vs Elves + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+4 vs Elves,sb:1,+:4,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged],[w:Dagger+4 vs Elves,sb:1,db:1,+:4,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, +4 vs Elves, vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:Dagger+2,sb:1,+:2,SM:1d4,L:1d3],[w:Dagger+2,sb:1,+:2,SM:1d4,L:1d3],[],[]{{Ammo=+2 +4 vs Elves, vs. SM:1d4, L:1d3 + Str bonus}}AmmoData=[w:Dagger+2,t:Dagger,st:Dagger,sb:1,+:2,SM:1d4,L:1d3],[w:Dagger+4 vs Elves,t:Dagger,st:Dagger,sb:1,+:4,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:dagger,+:2,r:-/1/2/3],[t:dagger,+:4,r:-/1/2/3]{{desc=A Dagger of extra-fine quality, with an engraving of a lying sleeping (or dead?) Elf in the blade. It is enchanted to be a +2 magical weapon, but +4 when used against Elves}}'},
						{name:'Dagger-of-Throwing',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger of Throwing}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Short-blade]{{To-hit=+2 + Str Bonus (and Dex if thrown)}}ToHitData=[w:Dagger of Throwing+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger of Throwing+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, melee vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:+2,sb:1,+:2,SM:1d4,L:2d3],[]{{Ammo=+2, vs. SM:2d4, L:2d3 when thrown + Str bonus}}AmmoData=[w:Dagger of Throwing,t:Dagger,st:Dagger,sb:1,+:2,SM:2d4,L:2d3]{{Range=PB: 30, S:60, M:120, L:180}}RangeData=[t:dagger,+:2,r:3/6/12/18]{{desc=This appears to be a normal weapon but will radiate strongly of magic when this is checked for. The balance of this sturdy blade is perfect, such that when it is thrown by anyone, the dagger will demonstrate superb characteristics as a ranged weapon. The magic of the dagger enables it to be hurled up to 180 feet. A successful hit when it is thrown will inflict twice normal dagger damage, plus the bonus provided by the blade, which will range from +1 to +4.}}'},
						{name:'Dagger-of-Throwing+2',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dagger of Throwing}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or ranged short-bladed}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Short-blade]{{To-hit=+2 + Str Bonus (or Dex if thrown)}}ToHitData=[w:Dagger of Throwing+2,sb:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,r:5,sp:2,rc:uncharged],[w:Dagger of Throwing+2,sb:1,db:1,+:2,n:2,ch:20,cm:1,sz:S,ty:P,sp:2,rc:uncharged]{{Attacks=2 per round, + specialisation \\amp level, Piercing}}{{Damage=+2, melee vs. SM:1d4, L:1d3, + Str Bonus}}DmgData=[w:+2,sb:1,+:2,SM:1d4,L:2d3],[]{{Ammo=+2, vs. SM:2d4, L:2d3 when thrown + Str bonus}}AmmoData=[w:Dagger of Throwing,t:Dagger,st:Dagger,sb:1,+:2,SM:2d4,L:2d3]{{Range=PB: 30, S:60, M:120, L:180}}RangeData=[t:dagger,+:2,r:3/6/12/18]{{desc=This appears to be a normal weapon but will radiate strongly of magic when this is checked for. The balance of this sturdy blade is perfect, such that when it is thrown by anyone, the dagger will demonstrate superb characteristics as a ranged weapon. The magic of the dagger enables it to be hurled up to 180 feet. A successful hit when it is thrown will inflict twice normal dagger damage, plus the bonus provided by the blade, which will range from +1 to +4.}}'},
						{name:'Dancing-Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dancing Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=2-handed ranged dancing bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0 + Dex bonus (only when held)}}ToHitData=[w:Dancing Longbow,sb:0,db:1,+:1,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]{{Attacks=2 per round, Piercing}}{{desc=This is a dancing longbow. Use it in hand for 4 rounds, and it will improve your aim by 1, then 2 then 3, then 4 points. Then it will dance for 1, 2, 3, 4 rounds before returning to your side.}}'},
						{name:'Dart',type:'Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dart}}{{subtitle=Thrown weapon}}{{Speed=[[2]]}}{{Size=Tiny}}{{Weapon=1-handed ranged dart}}Specs=[Dart,Ranged,1H,Dart]{{To-hit=+0, + Str \\amp Dex bonuses}}ToHitData=[w:Dart,sb:1,db:1,+:0,n:3,ch:20,cm:1,sz:T,ty:P,sp:2,rc:uncharged]{{Attacks=3 per round, + specialisation \\amp level, Piercing}}{{Ammo=+0, vs. SM:1d3, L:1d2 + Str Bonus}}AmmoData=[w:Dart,t:Dart,st:Dart,sb:1,+:0,SM:1d3,L:1d2,]{{Range=S:10, M:20, L:40}}RangeData=[t:Dart,+:0,r:1/2/4]{{desc=A standard Dart of good quality, but otherwise ordinary}}'},
						{name:'Dart+3',type:'Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dart+3}}{{subtitle=Thrown weapon}}{{Speed=[[2]]}}{{Size=Tiny}}{{Weapon=1-handed ranged dart}}Specs=[Dart,Ranged,1H,Dart]{{To-hit=+3, + Str \\amp Dex bonuses}}ToHitData=[w:Dart,sb:1,db:1,+:3,n:3,ch:20,cm:1,sz:T,ty:P,sp:2,rc:uncharged]{{Attacks=3 per round, + specialisation \\amp level, Piercing}}{{Ammo=+3, vs. SM:1d3, L:1d2, + Str Bonus}}AmmoData=[w:Dart,t:Dart,st:Dart,sb:1,+:3,SM:1d3,L:1d2]{{Range=S:10, M:20, L:40}}RangeData=[t:Dart,+:3,r:1/2/4]{{desc=A Dart of exceptionally fine quality, with a sparkling tip and glowing flight feathers of many colours. A +3 weapon at all times}}'},
						{name:'Dragonslayer-Broadsword',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Dragonslayer Broadsword}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed slashing melee long blade}}Specs=[Broadsword,Melee,1H,Long-blade],[Broadsword,Melee,1H,Long-blade]{{To-hit=+2, +4 vs. Dragons, + Str Bonus}}ToHitData=[w:Dragonslayer+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged],[w:Dragonslayer vs. Dragon,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attks per round=[[1]] per round}}{{Damage=+2, +4 vs Dragons, + Str bonus. Kills 1 type - or does triple damage}}DmgData=[w:Dragonslayer+2,sb:1,+:2,SM:2d4,L:1+1d6][w:Dragonslayer vs Dragon,sb:1,+:4,SM:2d4,L:1+1d6]{{desc=This +2 sword has a +4 bonus against any sort of true dragon. It either inflicts triple damage against one sort of dragon (i.e., 3d6+3+4), or might be of a type that slays the dragon in 1 blow and immediately disintegrates. It will only act as a normal +2 sword against a dragon of a diametrically different colour (e.g. if a Black Dragonslayer, then will only be ordinary vs. a Silver dragon). Note that an unusual sword with intelligence and alignment will not be made to slay dragons of the same alignment. Determine dragon type (excluding unique ones like Bahamut and Tiamat) by rolling 1d10:\n1 black (CE)\n2 blue (LE)\n3 brass (CG)\n4 bronze (LG)\n5 copper (CG)\n6 gold (LG)\n7 green (LE)\n8 red (CE)\n9 silver (LG)\n10 white (CE)}}'},
						{name:'Extended-Range-Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Extended Range Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0 + Dex and Str bonuses}}ToHitData=[w:X-range Longbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,r:+0/+2/+2/+2,sp:8,rc:uncharged]{{Attacks=2 per round regardless of specialisation or level}}{{Range=Range of Ammo +20 at each of S, M \\amp L}}{{desc=This is a strong longbow which imparts extra range to its ammunition. The wood is polished, the string taut, and the limbs seem both stronger and more springy than the average bow. As a result, it can both impart the bowyer\'s strength bonus and 20 extra yards per range category (except PB)}}'},
						{name:'Fauchard',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Fauchard}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Fauchard,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Fauchard,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:6-8,sp:8,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs. SM:1d6, L:1d8, + Str Bonus}}DmgData=[w:Fauchard,sb:1,+:0,SM:1d6,L:1d8]{{desc=This is a normal Fauchard, a type of Polearm. The point is sharp and keen, but nothing special.\nAn outgrowth of the sickle and scythe, the fauchard is a long, inward curving blade mounted on a shaft six to eight feet long. It can slash or thrust, although the inward curving point makes thrusting rather ineffective. Its advantage is that a peasant can easily convert his common scythe into this weapon of war.}}'},
						{name:'Fauchard-Fork',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Fauchard-Fork}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Fauchard,Melee,2H,Polearm]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Fauchard-Fork,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:6-8,sp:8,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs. SM:1d8, L1d10, + Str bonus}}DmgData=[w:Fauchard-Fork,sb:1,+:0,SM:1d8,L:1d10]{{desc=This is a normal Fauchard-Fork, a type of Polearm. The blade is sharp and keen, but nothing special.\nThis is an attempted improvement on the fauchard, adding a long spike or fork to the back of the blade. Supposedly this improves the thrusting ability of the weapon. It is still an inefficient weapon.}}'},
						{name:'Felling-Axe',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Felling Axe}}{{subtitle=Magic Weapon}}{{Speed=[[7]]}}{{Size=M}}{{Weapon=2-handed melee axe or 1-handed ranged throwing axe}}Specs=[Felling-Axe,Melee,2H,Axe],[Throwing-Axe,Ranged,1H,Throwing-blade]{{To-hit=+1 + Str \\amp Dex bonuses}}ToHitData=[w:Felling Axe,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:7,rc:uncharged],[w:Felling Axe,sb:1,db:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:-/1/2/3,sp:7,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=As melee weapon +1, vs. SM:2d6, L:2d6 + Str bonus}}DmgData=[w:Felling Axe,sb:1,+:1,SM:2d6,L:2d6],[]{{Ammo=As ranged weapon +1, SM:1d6, L1d4 + Str Bonus}}AmmoData=[w:Felling Axe,t:Felling-Axe,st:Felling-Axe,sb:1,+:1,SM1d6,L:1d4]{{Range=S:10, M:20, L:30}}[t:Felling-Axe,+:1,r:-/1/2/3]{{desc=Axe of unsurpassed balance and sharpness. Used as a Weapon it is +1, 2D6+1, but if used as a felling axe any individual of 12 or greater strength can fell a 2\' diameter tree in one round (pro-rate to other trees on ratio of diameters). A character of 17 strength can use it as a throwing axe.}}'},
						{name:'Flail+1',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Footman\'s Flail+1}}{{subtitle=Flail}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee flail}}Specs=[Footmans Flail,Melee,1H,Flail]{{To-hit=+1 + Str Bonus}}ToHitData=[w:Footmans Flail+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+1 vs. SM:1d6+1, L:2d4 + Str bonus}}DmgData=[w:Footmans Flail+1,sb:1,+:1,SM:1+1d6,L:2d4]{{desc=A Footman\'s Flail of very good quality, which has shiny chain, very supple and strong leather, and has a slight silvery glow about it. At all times, it is a +[[1]] weapon}}'},
						{name:'Flaming-Scimitar',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Flaming Scimitar}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade],[Scimitar,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Scimitar+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged],[w:Scimitar+1 Flaming,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5,rc:uncharged]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, normally SM:1d8, L:1d8, + Str bonus, when flaming add 1d6}}DmgData=[w:Scimitar+1,sb:1,+:1,SM:1d8,L:1d8],[w:Scimitar+1 Flaming,sb:1,+:1,SM:1d8+1d6,L:1d8+1d6]{{desc=This sword flames upon the command of the wielder, causing flame to appear all along the blade as if fed from some invisible magical oil channels running from the hilt. The flame easily ignites oil, burns webs, or sets fire to paper, parchment, dry wood, etc. For creatures who take flame damage, does an additional 1d6 of flaming damage}}'},
						{name:'Footmans-flail',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Footman\'s Flail}}{{subtitle=Flail}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee flail}}Specs=[Footmans Flail,Melee,1H,Flail]{{To-hit=+0, + Str bonus}}ToHitData=[w:Footmans Flail,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round, + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d6+1, L:2d4, + Str bonus}}DmgData=[w:Footmans Flail,sb:1,+:0,SM:1+1d6,L:2d4]{{desc=A standard Footman\'s Flail of good quality, but nothing special}}'},
						{name:'Footmans-mace',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Footman\'s Mace}}{{subtitle=Mace}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Footmans Mace,Melee,1H,Club]{{To-hit=+0, + Str bonus}}ToHitData=[w:Footmans Mace,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d6+1, L:1d6, + Str bonus}}DmgData=[w:Footmans Mace,sb:1,+:0,SM:1+1d6,L:1d6]{{desc=This is a normal Footman\'s Mace. The business end is extra hard, but nothing special.}}'},
						{name:'Footmans-pick',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Footman\'s Pick}}{{subtitle=Pick}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee pick}}Specs=[Footmans Pick,Melee,1H,Pick]{{To-hit=+0, + Str bonus}}ToHitData=[w:Footmans Pick,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:7]{{Attacks=1 per round, + level \\amp specialisation, Piercing}}{{Damage=+0, vs. SM:1d6+1, L:2d4, + Str bonus}}DmgData=[w:Footmans Pick,sb:1,+:0,SM:1+1d6,L:2d4]{{desc=This is a normal Footman\'s Pick. The business end is wickedly pointed, but nothing special.}}'},
						{name:'Gaff',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Gaff}}{{subtitle=Hook}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee hook}}Specs=[Gaff,Melee,1H,Hook]{{To-hit=+0 + Str bonus}}ToHitData=[w:Gaff,sb:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,r:4,sp:2]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d4, L:1d3, + Str bonus}}DmgData=[w:Gaff,sb:1,+:0,SM:1d4,L:1d3]{{desc=The gaff or hook is actually a tool used to hook and land fish. It is commonly found where fishing boats are encountered, and the hooks are in plentiful supply, affording the disarmed adventurer a weapon of last resort.\nA successful hit with the Gaff or Hook will grapple the target as well as doing damage. A Dexterity check next round escapes without additional damage, a Strength check -3 escapes with damage.\nThe gaff consists of a metal hook with a wooden or metal crossbar at the base. A onehanded tool, the hook protrudes from between the middle and ring fingers. Some sailors who have lost a hand have a cup with a gaff hook attached to the stump, guaranteeing that they are never without a weapon.}}'},
						{name:'Glaive',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Glaive}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Glaive,Melee,2H,Polearm]{{To-hit=+0, + Str bonus}}ToHitData=[w:Glaive,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:8-10,sp:8]{{Attacks=1 per round, + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d6, L:1d10, + Str bonus}}DmgData=[w:Glaive,sb:1,+:0,SM:1d6,L:1d10]{{desc=This is a normal Glaive, a type of Polearm. The blade is sharp and keen, but nothing special. **Inflicts double damage against charging creatures of Large or greater size**.\nOne of the most basic polearms, the glaive is a single-edged blade mounted on an eight- to ten-foot-long shaft. While not the most efficient weapon, it is relatively easy to make and use. Normally the blade turns outward to increase the cutting area until it almost resembles a cleaver or axe.}}'},
						{name:'Glaive-guisarme',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Glaive-guisarme}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Glaive,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Glaive-guisarme,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:8-10,sp:9]{{Attacks=1 per round, + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:2d4, L:2d6 + Str bonus}}DmgData=[w:Glaive-guisarme,sb:1,+:0,SM:2d4,L:2d6]{{desc=This is a normal Glaive-guisarme, a type of Polearm. The blade is sharp and keen, but nothing special. **Inflicts double damage against charging creatures of Large or greater size**.\nAnother combination weapon, this one takes the basic glaive and adds a spike or hook to the back of the blade. In theory, this increases the usefulness of the weapon although its actual application is somewhat questionable.}}'},
						{name:'Great-Axe',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Great Axe}}{{subtitle=Axe}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=2-handed melee axe}}Specs=[Great Axe,Melee,2H,Axe]{{To-hit=+0 + Str bonus}}ToHitData=[w:Great Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:9]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs. SM:1d10, L:2d8, + Str bonus}}DmgData=[w:Great Axe,sb:1,+:0,SM:1d10,L:2d8]{{desc=This is an impressive Great Axe. The blade is sharp and keen, but nothing special.}}'},
						{name:'Great-Axe+1',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Great Axe+1}}{{subtitle=Axe}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=2-handed melee axe}}Specs=[Great Axe,Melee,2H,Axe]{{To-hit=+1 + Str bonus}}ToHitData=[w:Great Axe+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:9]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d10, L:2d8, + Str bonus}}DmgData=[w:Great Axe+1,sb:1,+:1,SM:1d10,L:2d8]{{desc=This is an impressive Great Axe. The blade is sharp and keen, and gleams with an impossibly sharp edge.}}'},
						{name:'Greatsword',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Greatsword}}{{subtitle=Sword}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=2-handed melee great-blade}}Specs=[Greatsword, Melee, 2H, Great-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Greatsword,Str Bonus sb:1,Attk +:0,No per round n:1,Crit hit ch:20,Crit Miss cm:1,Size sz:M,Type ty:S,Range r:6,Speed sp:9]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:2d6, L:2d10, + Str bonus}}DmgData=[w:Greatsword,Str Bonus sb:1,Dmg +:0,Dmg SM:2d6,Dmg L:2d10]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Guisarme',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Guisarme}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Guisarme,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Guisarme,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:8,sp:8]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:2d4, L:1d8, + Str bonus}}DmgData=[w:Guisarme,sb:1,+:0,SM:2d4,L:1d8]{{desc=This is a normal Guisarme, a type of Polearm. The blade is sharp and keen, but nothing special.\nThought to have derived from a pruning hook, this is an elaborately curved heavy blade. While convenient and handy, it is not very effective.}}'},
						{name:'Guisarme-voulge',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Guisarme-voulge}}{{subtitle=Polearm}}{{Speed=[[10]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Guisarme,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Guisarme-voulge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:8,sp:10]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:2d4, L:2d4, + Str bonus}}DmgData=[w:Guisarme-voulge,sb:1,+:0,SM:2d4,L:2d4]{{desc=This is a normal Guisarme-voulge a type of Polearm. The blade is sharp and keen, but nothing special.\nThis weapon has a modified axe blade mounted on an eight-foot long shaft. The end of the blade tapers to a point for thrusting and a back spike is fitted for punching through armor. Sometimes this spike is replaced by a sharpened hook for dismounting riders.}}'},
						{name:'Halberd',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Halberd}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Halberd,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Halberd,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:5-8,sp:9]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:1d10, L:2d6, + Str bonus}}DmgData=[w:Halberd,sb:1,+:0,SM:1d10,L:2d6]{{desc=This is a normal Halberd, a type of Polearm. The blade is sharp and keen, but nothing special.\nAfter the awl pike and the bill, this was one of the most popular weapons of the Middle Ages. Fixed on a shaft five to eight feet long is a large axe blade, angled for maximum impact. The end of the blade tapers to a long spear point or awl pike. On the back is a hook for attacking armor or dismounting riders. Originally intended to defeat cavalry, it is not tremendously successful in that role since it lacks the reach of the pike and needs considerable room to swing. It found new life against blocks of pikemen. Should the advance of the main attack stall, halberdiers issue out of the formation and attack the flanks of the enemy. The pikemen with their overlong weapons are nearly defenseless in such close combat.}}'},
						{name:'Hand-Axe',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hand Axe}}{{subtitle=Axe}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown axe}}Specs=[Hand Axe,Melee,1H,Axe],[Hand Axe,Ranged,1H,Axe]{{To-hit=+0 + Str \\amp Dex bonuses}}ToHitData=[w:Hand Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:4],[w:Hand Axe,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:1/2/3,sp:4]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Hand Axe,sb:1,+:0,SM:1d6,L:1d4],[]{{Ammo=+0, + Str bonus}}AmmoData=[w:Hand Axe,t:Hand Axe,st:Hand Axe,sb:1,+:0,SM:1d6,L:1d4]{{Range=S:10, M:20, L:30}}[t:Hand Axe,+:0,r:1/2/3]{{desc=This is a normal Hand- or Throwing-Axe. The blade is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Hand-Crossbow',type:'Ranged',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hand Crossbow}}{{subtitle=Crossbow}}{{Speed=[[5]]}}{{Size=Small}}{{Weapon=1-handed ranged crossbow}}Specs=[Hand Crossbow,Ranged,1H,Crossbow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Hand Crossbow,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,sp:5]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{desc=This is a hand crossbow, small enough to use in 1 hand, with a magazine of 10 quarrels requiring reloading. Made of good quality wood and various metals, it is portable and easy to hold, but it is nothing special}}'},
						{name:'Harpoon',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Harpoon}}{{subtitle=Spear}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=1-handed melee or thrown weapon}}Specs=[Harpoon,Melee,1H,Spear],[Harpoon,Ranged,1H,Spear]{{To-hit=+0, + Dex (if thrown) \\amp Str bonuses}}ToHitData=[w:Harpoon,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:5,sp:7],[w:Harpoon,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round, + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:2d4, L:2d6, + Str bonus}}DmgData=[w:Harpoon,sb:1,+:0,SM:2d4,L:2d6],[]{{Ammo=+0, vs SM:2d4, L:2d6 + Str bonus}}AmmoData=[w:Harpoon,t:Harpoon,st:Spear,sb:1,+:0,SM:2d4,L:2d6]{{Range=S:10, M:20, L:30}}RangeData=[t:Harpoon,+:0,r:1/2/3]{{desc=This is a normal Harpoon. The point is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Heavy-Crossbow',type:'Ranged',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Heavy Crossbow}}{{subtitle=Crossbow}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed ranged crossbow}}Specs=[Heavy Crossbow,Ranged,2H,Crossbow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Heavy Crossbow,sb:0,db:1,+:0,n:1/2,ch:20,cm:1,sz:M,ty:P,sp:10]{{Attacks=1 per 2 rounds + level \\amp specialisation, Piercing}}{{desc=This is a heavy crossbow, large and somewhat cumbersome. Made of good quality wood and various metals, it is somewhat difficult to hold and reload, and is nothing special}}'},
						{name:'Heavy-Horse-Lance',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Heavy Horse Lance}}{{subtitle=Lance}}{{Speed=[[8]]}}{{Size=Huge}}{{Weapon=1-handed mounted melee lance}}Specs=[Lance,Melee,1H,Lance]{{To-hit=+0, + Str bonus (Heavy War Horse only)}}ToHitData=[w:Heavy Horse Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:8]{{Attacks=1 per round (unless jousting), Piercing}}{{Damage=+0, vs SM:1d8+1, L:3d6, + Str bonus (Heavy War Horse only)}}DmgData=[w:Heavy Horse Lance,sb:1,+:0,SM:1+1d8,L:3d6]{{desc=This is a normal lance for use with a heavy war horse. The point is well hardened and the shaft in good condition, but nothing special.}}'},
						{name:'Heavy-Xbow-Bolt+2',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magic Crossbow Bolts}}{{subtitle=Magic Ammo}}{{Size=Tiny}}Specs=[Heavy-Quarrel,Ammo,1H,Quarrel]{{Ammo=+2, vs SM:1d4+1, L:1d6+1, no other bonuses}}AmmoData=[t:heavy-crossbow,st:heavy-crossbow,sb:0,+:2,SM:1+1d4,L:1+1d6]{{Range=PB:30 S:80 M:160 L:240}}RangeData=[t:heavy-crossbow,+:2,r:3/8/16/24]{{desc=Fine quality heavy crossbow bolts which are +2 on to-hit and damage. The tips are sharp and keen, and are very shiny.}}'},
						{name:'Hook',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hook}}{{subtitle=Hook}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee hook}}Specs=[Hook,Melee,1H,Hook]{{To-hit=+0, + Str bonus}}ToHitData=[w:Hook,sb:1,+:0,n:1,ch:20,cm:1,sz:S,ty:P,r:4,sp:2]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0 vs SM:1d4, L:1d3, + Str bonus}}DmgData=[w:Hook,sb:1,+:0,SM:1d4,L:1d3]{{desc=The gaff or hook is actually a tool used to hook and land fish. It is commonly found where fishing boats are encountered, and the hooks are in plentiful supply, affording the disarmed adventurer a weapon of last resort.\nA successful hit with the Gaff or Hook will grapple the target as well as doing damage. A Dexterity check next round escapes without additional damage, a Strength check -3 escapes with damage.\nThe gaff consists of a metal hook with a wooden or metal crossbar at the base. A onehanded tool, the hook protrudes from between the middle and ring fingers. Some sailors who have lost a hand have a cup with a gaff hook attached to the stump, guaranteeing that they are never without a weapon.}}'},
						{name:'Hook-Fauchard',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hook Fauchard}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Fauchard,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Hook Fauchard,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PS,r:6-8,sp:9]{{Attacks=1 per round, + level \\amp specialisation, Piercing \\amp Slashing}}{{Damage=+0, vs SM:1d4, L:1d4, + Str bonus}}DmgData=[w:Hook Fauchard,sb:1,+:0,SM:1d4,L:1d4]{{desc=This is a normal Hook Fauchard, a type of Polearm. The blade is sharp and keen, but nothing special.\nThis combination weapon is another attempted improvement to the fauchard. A back hook is fitted to the back of the blade, supposedly to dismount horsemen. Like the fauchard, this is not a tremendously successful weapon.}}'},
						{name:'Horeshoes-of-Strength',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Horseshoes of Strength}}{{subtitle=Magic Item}}{{Speed=No effect}}{{Size=Small}}{{Weapon=1-hooved melee horseshoe}}Specs=[Horseshoes,Melee,1H,Horseshoes]{{To-hit=+1}}ToHitData=[w:Horseshoes+1,+:1,n:1,ch:20,cm:1,sz:S,ty:SB,r:5,sp:0]{{Attacks=2 per round (front kicks or rear kicks, Bludgeoning)}}{{Damage=+1, vs SM:1d3, L:1d3, for War Horse}}DmgData=[w:Horseshoes+1,+:1,SM:1d3,L:1d3]{{Reference=House Rules / Prices / Horses}}{{desc=Enable a horse to carry loads as if one level of horse higher. If a Heavy War Horse already, add 50% extra load. Also act as +1 weapon when horse attacks with hooves.}}'},
						{name:'Horsemans-Flail',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Horseman\'s Flail}}{{subtitle=Flail}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=1-handed mounted melee flail}}Specs=[Horsemans Flail,Melee,1H,Flail]{{To-hit=+0, + Str bonus}}ToHitData=[w:Horsemans Flail,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:6]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d4+1, L:1d4+1, + Str bonus}}DmgData=[w:Horsemans Flail,sb:1,+:0,SM:1+1d4,L:1+1d4]{{desc=This is a normal Horseman\'s Flail. The business end is made of vicious steel chain and thick leather, but is nothing special.}}'},
						{name:'Horsemans-Mace',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Horseman\'s Mace}}{{subtitle=Club}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=1-handed mounted melee club}}Specs=[Horsemans Mace,Melee,1H,Club]{{To-hit=+0 + Str bonus}}ToHitData=[w:Horsemans Mace, sb:1, +:0,n:1,ch:20,cm:1,sz:M, ty:B,r:5, sp:6]{{Attacks=1 per round + level + specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Horsemans Mace,sb:1,+:0,SM:1d6,L:1d4]{{desc=This is a normal Horseman\'s Mace. The business end is hardened wood and steel, but is nothing special.}}'},
						{name:'Horsemans-pick',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Horseman\'s Pick}}{{subtitle=Pick}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed mounted melee pick}}Specs=[Horsemans Pick,Melee,1H,Pick]{{To-hit=+0 + Str bonus}}ToHitData=[w:Horsemans Pick,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5, sp:6]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d4+1, L:1d4}}DmgData=[w:Horsemans Pick,sb:1,+:0,SM:1+1d4,L:1d4]{{desc=This is a normal Horseman\'s Pick. The business end is hard and sharp, but is nothing special.}}'},
						{name:'Indirect',type:'',ct:'0',charge:'uncharged',cost:'0',body:'@{'},
						{name:'Javelin',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Javelin}}{{subtitle=Spear}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown spear}}Specs=[Javelin,Melee,1H,Spear],[Javelin,Ranged,1H,Spear]{{To-hit=+0 + Str Bonus}}ToHitData=[w:Javelin,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:4],[w:Javelin,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,sp:4]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d6 + Str bonus}}DmgData=[w:Javelin,sb:1,+:0,SM:1d6,L:1d6],[]{{Ammo=+0, vs SM:1d6, L:1d6 + Str bonus}}AmmoData=[w:Javelin,t:Javelin,st:Spear,sb:1,+:0,SM:1d6,L:1d6,]{{Range=PB:20 S:30 M:40 L:60}}RangeData=[t:Javelin,+:0,r:2/3/4/6]{{desc=This is a normal Javelin. It is light, the point is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Jim-the-Sun-Blade',type:'Melee|Melee|Melee|Melee',ct:'100',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Jim the Sun Blade\nIntelligent, Neutral}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}WeapData=[w:Jim the Sun Blade,ns:5][cl:PW,w:Jims-Locate-Object,sp:100,lv:6,pd:1],[cl:PW,w:Jims-Find-Traps,sp:5,lv:6,pd:2],[cl:PW,w:Jims-Levitation,sp:2,lv:1,pd:3],[cl:PW,w:Jims-Sunlight,sp:3,lv:6,pd:1],[cl:PW,w:Jims-Fear,sp:4,lv:6,pd:2]{{Size=Special (feels like a Shortsword)}}{{Weapon=1 or 2 handed melee Long or Short blade}}Specs=[Bastard-sword|Short-sword,Melee,1H,Long-blade|Short-blade],[Bastard-sword|Short-sword,Melee,1H,Long-blade|Short-blade],[Bastard-sword,Melee,2H,Long-blade],[Bastard-sword,Melee,2H,Long-blade]{{To-hit=+2, +4 vs Evil + Str Bonus}}ToHitData=[w:Jim +2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim vs Evil+4,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim 2H +2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3],[w:Jim 2H vs Evil+4,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:3]{{Attacks=1 per round}}{{Damage=+2, +4 vs Evil, + 1-handed SM:1d8 L:1d12, 2-handed SM:2d4 L:2d8}}DmgData=[w:Jim+2,sb:1,+:2,SM:1d8,L:1d12],[w:Jim vs Evil+4,sb:1,+:4,SM:2d4,L:2d8],[w:Jim 2H +2,sb:1,+:2,SM:1d8,L:1d12],[w:Jim 2H vs Evil+4,sb:1,+:4,SM:2d4,L:2d8]{{desc=An intelligent weapon: A Sun Blade called Jim (DMs Guide Page 185). It is Neutral. It needs its owner to be proficient with either a Short or Bastard Sword or promise to get such proficiency as soon as possible. It cannot be used by someone who is not proficient. It requires its owner to be Neutral on at least one of its axis, and may not be Evil. NG LN CN and of cause true N are all ok. Abilities:\n**1:** It is +2 normally, or +4 against evil creatures, and does Bastard sword damage.\n**2:** It feels and react as if it is a short sword and uses short sword striking time.\n**3:** [Locate Object](!magic --mi-power @{selected|token_id}|Jims-Locate-Object|Jim-the-Sun-Blade|6) at [[6]]th Level in 120\' radius (1x day). \n**4:** [Detect traps](!magic --mi-power @{selected|token_id}|Jims-Find-Traps|Jim-the-Sun-Blade|6) of large size in 10\' radius (2xday). \n**5:** [Levitation](!magic --mi-power @{selected|token_id}|Jims-Levitation|Jim-the-Sun-Blade|1) 3x a day for 1 turn (cast at 1st Level).\n**6:** [Sunlight](!magic --mi-power @{selected|token_id}|Jims-Sunlight|Jim-the-Sun-Blade|6)Once a day, upon command, the blade can be swung vigorously above the head, and it will shed a bright yellow radiance that is like full daylight. The radiance begins shining in a 10-foot radius around the sword-wielder, spreading outward at 5 feet per round for 10 rounds thereafter, creating a globe of light with a 60-foot radius. When the swinging stops, the radiance fades to a dim glow that persists for another turn before disappearing entirely.\n**7:** It has a special purpose namely Defeat Evil. \n**8:** On hitting an Evil being it causes [Fear](!magic --mi-power @{selected|token_id}|Jims-Fear|Jim-the-Sun-Blade|6) for 1d4 rounds (unless saving throw is made). It can do this **twice a day** when the wielder desires.\n**9:** It speaks Common and its name is Jim. It will talk to the party.\n**10:** It has an ego of 16 and is from Yorkshire. \n**11:** It will insist on having a Neutral wielder. (See Intelligent weapons on page 187 in DMG). \n**12:** If picked by a player, it will be keen to become the players main weapon.\n**13:** If picked up by a player who is not Neutral it will do them 16 points of damage}}'},
						{name:'Jousting-Lance',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Jousting Lance}}{{subtitle=Lance}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=1-handed mounted melee lance}}Specs=[Jousting Lance,Melee,1H,Lance]{{To-hit=+0 + Str bonus (when mounted only)}}ToHitData=[w:Jousting Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:8]{{Attacks=1 per round + level \\amp specialisation (while mounted \\amp except when Jousting), Piercing}}{{Damage=+0, vs SM:1d3-1, L:1, + Str bonus}}DmgData=[w:Jousting Lance,sb:1,+:0,SM:0-1+1d3,L:0-1+1d2]{{desc=This is a normal lance for use with a heavy war horse or charger trained in the competition of jousting. The point is well hardened but blunted to reduce damage in the competition, and the shaft in good condition, but nothing special.}}'},
						{name:'Khopesh',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Khopesh}}{{subtitle=Sword}}{{Speed=[[9]]}}{{Size=Medium}}{{Weapon=1-handed melee medium-length blade}}Specs=[Khopesh,Melee,1H,Medium-blade]{{To-hit=+0 + Str bonus}}ToHitData=[name w:Khopesh,strength bonus sb:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:S, range r:5,speed sp:9]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:2d4, L:1d6, + Str bonus}}DmgData=[name w:Khopesh,strength bonus sb:1,magic+:0,vs SM:2d4,vs L:1d6]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.\nThis is an Egyptian weapon. A khopesh has about six inches of handle and quillons. Its blade is then straight from the quillons for about two feet. The blade becomes sickle-shaped at this point, being about two additional feet long but effectively extending the overall length of the sword by only 1.5 feet. This makes the khopesh both heavy and unwieldy, difficult to employ properly, and slow to recover, particularly after a badly missed blow. Its sickle-like portion can snag an opponent or an opposing weapon.}}'},
						{name:'Knife',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Knife}}{{subtitle=Blade}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee fencing-blade or short-blade, or ranged throwing-blade}}Specs=[Knife,Melee,1H,Fencing-blade|Short-blade],[Knife,Ranged,1H,Throwing-blade]{{To-hit=+0 + Str \\amp Dex bonuses}}ToHitData=[w:Knife,sb:1,+:0,n:2,ch:20,cm:1,sz:S,ty:SP,r:5,sp:2],[w:Knife,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:S,ty:P,sp:2]{{Attacks=2 per round + level \\amp specialisation, Slashing \\amp Piercing}}{{Damage=+0, vs SM: 1d3, L:1d2, + Str bonus}}DmgData=[w:Knife,sb:1,+:0,SM:1d3,L:1d2],[ ]{{Ammo=+0, vs SM:1d3, L:1d2 + Str bonus}}AmmoData=[w:Knife,t:Knife,st:Knife,sb:1,+:0,SM:1d3,L:1d2]{{Range=S:10, M:20, L:30}}[t:Knife,+:0,r:1/2/3]{{desc=A standard Knife of good quality, versatile in combat, but otherwise ordinary}}'},
						{name:'Light-Crossbow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Light Crossbow}}{{subtitle=Crossbow}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=2-handed ranged crossbow}}Specs=[Light Crossbow,Ranged,2H,Crossbow]{{To-hit=+0 + Dex bonus only}}ToHitData=[w:Light Crossbow,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{desc=This is a heavy crossbow, large and somewhat cumbersome. Made of good quality wood and various metals, it is somewhat difficult to hold and reload, and is nothing special}}'},
						{name:'Light-Horse-Lance',type:'Melee',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Light Horse Lance}}{{subtitle=Lance}}{{Speed=[[6]]}}{{Size=Large}}{{Weapon=1-handed mounted melee lance}}Specs=[Lance,Melee,1H,Lance]{{To-hit=+0 + Str bonus}}ToHitData=[w:Light Horse Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:6]{{Attacks=1 per round when mounted (except if jousting)}}{{Damage=+0, vs SM:1d6, L:1d8, + Str bonus (when mounted)}}DmgData=[w:Light Horse Lance,sb:1,+:0,SM:1d6,L:1d8]{{desc=This is a normal lance for use with a light war horse. The point is well hardened and the shaft in good condition, but nothing special.}}'},
						{name:'LightBringer-Mace',type:'Melee|Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=LightBringer Mace+1}}{{subtitle=Magical Weapon}}{{Speed=7}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Footmans-Mace,Melee,1H,Club],[Footmans-Mace,Melee,1H,Club]{{To-hit=+1 + Str bonus}}ToHitData=[w:Lightbringer Mace+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7],[w:Lightbringer vs Undead,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+1\n**vs Undead** SM:2d6+1, L:2d6,\n**vs other** SM:1d6+1, L:1d6}}DmgData=[w:Lightbringer Mace+1,sb:1,+:1,SM:1+1d6,L:1d6],[w:Lightbringer vs Undead,sb:1,+:1,SM:1+2d6,L:2d6]{{Other Powers=Torch [On](!rounds --target caster|@{selected|token_id}|Lightbringer-mace|99|0|Lightbringer is lit|aura) or [Off](!tj --removestatus lightbringer-mace) \\amp [Light burst](!\\amp#13;\\amp#47;r 1d6 radient damage vs undead) vs undead}}{{desc= This +1 mace was made for a cleric of Lathander, the god of dawn. The head of the mace is shaped like a sunburst and made of solid brass. Named Lightbringer, this weapon glows as bright as a torch when its wielder commands. While glowing, the mace deals an extra 1d6 radiant damage to undead creatures.\nIt can be used by anyone.\nIt glows on command without limitation as brightly as a torch}}'},
						{name:'Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=Ranged 2-handed Bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0 + Dex Bonus}}ToHitData=[w:Longbow,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]{{Attacks=Piercing, 2 per round}}{{desc=This is a normal longbow. The wood is polished, the string taut, but nothing special.}}'},
						{name:'Longsword',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+0 + Str bonus}}ToHitData=[name w:Longsword,strength bonus sb:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:S, range r:5,speed sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[name w:Longsword,strength bonus sb:1,magic+:0,vs SM:1d8,vs L:1d12]}}{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Longsword+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+1, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12]{{desc=This is a magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Longsword+1+2-vs-Orcs',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword Orc-slayer}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-Hit=+1, +2 vs Orcs, + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Orcs+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, +2 vs Orcs, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Longsword vs Orcs+2,sb:1,+:2,SM:1d8,L:1d12]{{desc=This sword has a hilt guard with a centre boss of a sculpted Orc\'s face, scowling. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. When facing Orcs, its blade seems to glisten, and the increasing sharpness can almost be seen by the wielder. \n It is +[[2]] on attack and damage vs. Orcs}}'},
						{name:'Longsword+1+3-vs-Regenerating',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword +1,+3 vs Regenerating (charged)}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-Hit=+1, +3 vs Regenerating (uses 1 charge), + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Regen+3,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, +3 vs Regenerating (uses 1 charge), vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Longsword vs Regen+3,sb:1,+:3,SM:1d8,L:1d12]{{desc=This sword has a hilt guard with a centre boss of a sculpted Troll. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. When facing Regenerating creatures, its blade seems to turn blood red, and the increasing sharpness can almost be seen by the wielder. \n It is +[[3]] on attack and damage vs. Regenerating creatures, but each hit will use a charge if the sword has charges}}'},
						{name:'Longsword+1+3-vs-undead',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword +1,+3 vs Undead}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-Hit=+1, +3 vs Undead, + Str bonus}}ToHitData=[w:Longsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Undead+3,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round +level \\amp specialisation, Slashing}}{{Damage=+1, +3 vs Undead, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword+1,sb:1,+:1,SM:1d8,L:1d12],[w:Longsword vs Undead+3,sb:1,+:3,SM:1d8,L:1d12]{{desc=This sword has a hilt guard with a centre boss of a sculpted Skull. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. When facing Undead, its blade seems to darken, and the increasing sharpness can almost be seen by the wielder. \n It is +[[3]] on attack and damage vs. Undead}}'},
						{name:'Longsword+2',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword+2}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Longsword+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+2 + Str bonus}}DmgData=[w:Longsword+2,sb:1,+:2,SM:1d8,L:1d12]{{desc=This is a fine magical sword. The blade is very sharp and keen, and is a +[[2]] magical weapon at all times.}}'},
						{name:'Longsword+2-Planteater',type:'Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword+2, Planteater}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade],[Longsword,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Longsword+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Longsword vs Plant+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+2, vs SM:1d8, L:1d12, + Str bonus. Always max damage vs plants}}DmgData=[w:Longsword+2,sb:1,+:2,SM:1d8,L:1d12],[w:Longsword vs Plant+2,sb:1,+:2,SM:8,L:12]{{desc=This is an extra fine magical sword. The blade is very sharp and keen with a greenish hue and engraved with pictures of vines, leaves, branches, plants and plant-based monsters. It is a +[[2]] magical weapon at all times, and does automatic ***maximum*** damage if it hits plant-based material.}}'},
						{name:'Longsword-of-Adaptation+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Longsword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Longsword,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Longsword of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d8, L:1d12, + Str bonus}}DmgData=[w:Longsword of Adapt+1,sb:1,+:1,SM:1d8,L:1d12]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Lucern-Hammer',type:'Melee|Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Lucern Hammer}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Lucern Hammer|Bec de Corbin,Melee,2H,Polearm],[Lucern Hammer|Bec de Corbin,Melee,2H,Polearm]}}{{To-hit=+0 + Str bonus}}ToHitData=[w:Lucern Hammer,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PB,r:8-10,sp:9],[w:Lucern Hammer set vs charge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:PB,r:8-10,sp:9]{{Attacks=1 per round + level \\amp specialisation, Piercing \\amp Bludgeoning}}{{Damage=+0, vs SM:2d4, L:1d6 (if set vs charge SM:4d4, L:2d6) + Str bonus}}DmgData=[w:Lucern Hammer,sb:1,+:0,SM:2d4,L:1d6],[w:Lucern Hammer vs charge,sb:1,+:0,SM:4d4,L:2d6]{{desc=This is a normal Lucern Hammer, a type of Polearm. The blade is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nThis weapon is similar to the bec de corbin. Fitted with a shaft up to ten feet long, it is usually found in the hands of the common soldier. Like the bec de corbin, its main purpose is to punch through armor. The end is fitted with the long point of an awl pike to hold off enemy cavalry.}}'},
						{name:'Magic-Quarterstaff',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magic Quarterstaff}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=Quarterstaff,Melee,2H,Staff}}Specs=[Magic-Quarterstaff,Melee,1H,Quarterstaff]{{To-hit=+ as per weapon}}{{damage=+ as per weapon}}{{desc=A standard Quarterstaff of fine quality, good enough to be enchanted}}'},
						{name:'Magical-1H-Sword',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Magical Sword}}{{subtitle=Magic Sword}}{{Speed=By type}}{{Size=Medium}}{{Weapon=[Sword,Melee,1H,Sword]}}{{To-hit=+?}}Specs=[Magic-Sword,Melee,1H,Sword]{{damage=+?}}{{Other Powers=Unknown}}{{desc=This definitely appears to be a magical sword, and the DM will tell you what basic type of sword it is.}}'},
						{name:'Magical-Weapon',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Magical Weapon}}{{subtitle=Magic Weapon}}{{Speed=By type}}{{Size=Medium}}{{Weapon=A magical weapon on some type that is unclear for some reason. Magical obscurement?}}Specs=[Magic-Weapon,Melee,1H,Any]{{To-hit=+?}}{{damage=+?}}{{Other Powers=Unknown}}{{desc=This definitely appears to be a magical weapon, and the DM will tell you what basic type of weapon it is.}}'},
						{name:'Mancatcher',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Mancatcher}}{{subtitle=Polearm}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=1-handed melee polearm}}Specs=[Mancatcher,Melee,1H,Polearm]{{To-hit=+0 + *Dex* bonus}}ToHitData=[w:Mancatcher,db:1,+:0,n:1,ch:20,cm:1,sz:L,ty:N,r:10,sp:7]{{Attacks=1 per round, automatic once caught}}{{Damage=+0, vs SM:1d2, L:1d2, automatic each round, no other bonuses}}DmgData=[w:Mancatcher,sb:1,+:0,SM:1d2,L:1d2]{{desc=This item is a highly specialized type of polearm designed to capture without killing a victim. It consists of a long pole with a spring-loaded set of sharpened jaws at the end. The victim is caught between the arms, which then snap shut. The mancatcher is effective only on man-sized creatures. The target is always treated as AC 10, modified for Dexterity. If a hit is scored, the character is caught. The caught victim loses all shield and Dexterity bonuses and can be pushed and pulled about. This causes an automatic 1d2 points of damage per round and gives a 25% chance of pulling the victim to the ground. The victim can escape on a successful bend bars/lift gates roll, although this results in 1d2 points more damage. A common tactic is to use the weapon to pull horsemen off their mounts, then pin them to the ground.}}'},
						{name:'Manticore-tail',type:'Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Manticore Tail}}{{subtitle=Ranged Weapon}}{{Speed=[[0]] Innate Weapon}}{{Size=Large}}{{Weapon=Body part with projectile spikes}}Specs=[Manticore Tail,Ranged,1H,Innate]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Manticore-tail,sb:1,db:0,+:0,n:1d6,ch:20,cm:1,sz:L,ty:P,sp:0,r:6/12/18]{{Attacks=1d6/round, Piercing}}{{desc=The tail of a Manticore is covered in spikes. In total, the typical Manticore tail has a total of 4d6 tail spikes which can be fired in upto 4 volleys. Each spike does 1d6 damage if it hits.}}'},
						{name:'Medium-Horse-Lance',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Medium Horse Lance}}{{subtitle=Lance}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=1-handed mounted melee lance}}Specs=[Lance,Melee,1H,Lance]{{To-hit=+0 + Str bonus when mounted}}ToHitData=[w:Medium Horse Lance,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10,sp:7]{{Attacks=1 per round + level \\amp specialisation (when mounted), Piercing}}{{Damage=+0, vs SM:1d6+1, L:2d6, + Str bonus when mounted}}DmgData=[w:Medium Horse Lance,sb:1,+:0,SM:1+1d6,L:2d6]{{desc=This is a normal lance for use with a medium war horse. The point is well hardened and the shaft in good condition, but nothing special.}}'},
						{name:'Memorise-MI-Power',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --mem-spell MIPOWERS|@{selected|token_id}'},
						{name:'Military-Fork',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Military Fork}}{{subtitle=Polearm}}{{Speed=[[7]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Military Fork,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Military Fork,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:8-10,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d8, L:2d4, + Str bonus}}DmgData=[w:Military Fork,sb:1,+:0,SM:1d8,L:2d4]{{desc=This is a normal Military Fork, a type of Polearm. The points are sharp and keen, but nothing special. **Inflicts double damage against charging creatures of Large or greater size.**\nThis is one of the simplest modifications of a peasant\'s tool since it is little more than a pitchfork fixed to a longer shaft. With tines strengthened and straightened, the military fork serves well. The need for cutting and cleaving eventually often results in combining the fork with other weapons.}}'},
						{name:'Morningstar',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Morning Star +2}}{{subtitle=Mace/Club}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Morningstar,Melee,1H,Club]{{To-hit=+0 + Str bonus}}ToHitData=[w:Morning Star,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:2d4, L:1d6+1, + Str bonus}}DmgData=[w:Morning Star,sb:1,+:0,SM:2d4,L:1+1d6]{{desc=This is a good Morning Star. The knobbly bit on the chain has sharp spikes, but otherwise it is an ordinary weapon.}}'},
						{name:'Morningstar+2',type:'Melee',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Morning Star +2}}{{subtitle=Magic Weapon}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Morningstar,Melee,1H,Club]{{To-hit=+2 + Str bonus}}ToHitData=[w:Morning Star+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:7]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+2, vs SM:2d4, L:1d6+1, + Str bonus}}DmgData=[w:Morning Star+2,sb:1,+:2,SM:2d4,L:1+1d6]{{desc=This is a fine magical Morning Star. The knobbly bit on the chain has very sharp spikes that seem extra pointy, and is a +[[2]] magical weapon at all times.}}'},
						{name:'Ogre-Club-Flyswatter+2+4',type:'Melee|Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ogre Club of Flyswatting +2,+4}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Ogre-Club,Melee,1H,Club],[Ogre-Club,Melee,1H,Club]{{To-hit=+2, +4 vs insectoids, + Str bonus, requires Str 18 to wield}}ToHitData=[w:Ogre-Club+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4],[w:Ogre-Club+4 vs insectoids,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation if strong enough, Bludgeoning}}{{Damage=+2, +4 vs insectoids, vs SM:2d8, L:2d8, + Str bonus}}DmgData=[w:Ogre-Club+2,sb:1,+:2,SM:2d8,L:2d8],[w:Ogre-Club+4 vs Insectoids,sb:1,+:4,SM:2d8,L:2d8]{{desc=This is a large, heavy club needing a strength of at least 18 to wield, originally used by an Ogre. A [Medallion of Flyswatting](~MI-DB|Medallion-of-Flyswatting) has been attached. When attached to any type of weapon, will turn it into +2, +4 vs Insectoids - any existing plusses and powers are "overwritten" while this medallion is attached. On examination it will be found to display the holy symbol of the holder (changes with holder), and may be used to turn undead at +1 level, cumulative with other turning undead items or powers. If used by a holder with no power to turn, gives power as a 1st level cleric}}'},
						{name:'Ogre-club+0',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ogre Club +0}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee club}}Specs=[Ogre-Club,Melee,1H,Club]{{To-hit=+0 + Str bonus, requires Str 18 to wield}}ToHitData=[w:Ogre-Club+0,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation if strong enough, Bludgeoning}}{{Damage=+0, vs SM:2d8, L:2d8, + Str bonus}}DmgData=[w:Ogre-Club+0,sb:1,+:0,SM:2d8,L:2d8]{{desc=This is a large, heavy club needing a strength of at least 18 to wield, which hits as a magic weapon but at +[[0]]. The wood is incredibly dense but still heavily blood-stained, and is a +[[0]] magical weapon at all times.}}'},
						{name:'Partisan',type:'Melee',ct:'9',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Partisan}}{{subtitle=Polearm}}{{Speed=[[9]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Partisan,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Partisan,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10-14,sp:9]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d6+1, + Str bonus}}DmgData=[w:Partisan,sb:1,+:0,SM:1d6,L:1+1d6]{{desc=This is a normal Partisan, a type of Polearm. The point is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nShorter than the awl pike but longer than the spear, the partisan is a broad spear-head mounted on an eight-foot-long shaft. Two smaller blades project out from the base of the main blade, just to increase damage and trap weapons. Since it is a thrusting weapon, it can be used in closely packed formations.}}'},
						{name:'Quarterstaff',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Quarterstaff}}{{subtitle=Staff}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=2-handed melee staff}}Specs=[Quarterstaff,Melee,2H,Staff]{{To-hit=+0 + Str bonus}}ToHitData=[w:Quarterstaff,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:B,r:5,sp:4,wt:4]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d6, L:1d6, + Str bonus}}DmgData=[w:Quarterstaff,sb:1,+:0,SM:1d6,L:1d6]{{desc=A good, hardwood quarterstaff that is well balanced but nothing out of the ordinary}}'},
						{name:'Quarterstaff+1',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Quarterstaff+1}}{{subtitle=Staff}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=2-handed melee staff}}Specs=[Quarterstaff,Melee,2H,Staff]{{To-hit=+1 + Str bonus}}ToHitData=[w:Quarterstaff,sb:1,+:1,n:1,ch:20,cm:1,sz:L,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+1, vs SM:1d6, L:1d6, + Str bonus}}DmgData=[w:Quarterstaff,sb:1,+:1,SM:1d6,L:1d6]{{desc=An excellent hardwood quarterstaff that is exceptionally well balanced and has a slight warm shine to the wood. A +[[1]] weapon at all times}}'},
						{name:'Quarterstaff-of-Dancing',type:'Melee',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Quarterstaff-of-Dancing}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Large}}{{Weapon=2-handed \\amp dancing melee staff}}Specs=[Quarterstaff,Melee,2H,Staff]{{To-hit=+1/2/3/4 increasing over 4 rounds, + Str bonus (no bonus when dancing)}}ToHitData=[w:Quarterstaff-of-Dancing,sb:1,+:1,n:1,ch:20,cm:1,sz:L,ty:B,r:5,sp:4]{{Attacks=1 per round + level \\amp specialisation, even when dancing, Bludgeoning}}{{Damage=+1/2/3/4 increasing over 4 rounds, vs SM: 1d6, L:1d6, + Str bonus (no bonus when dancing)}}DmgData=[w:Quarterstaff-of-Dancing,sb:1,+:1,SM:1d6,L:1d6]{{desc=This quarterstaff acts the same as a standard Sword of Dancing. Round one weapon is +1, on the second +2, on the third +3, and on the fourth it is +4. On the fifth round, it drops back to +1 and the cycle begins again. In addition, after four rounds of melee its wielder can opt to allow it to "dance."\nDancing consists of loosing the staff on any round (after the first) when its bonus is +1. The staff then fights on its own at the same level of experience as its wielder. After four rounds of dancing, the staff returns to its wielder, who must hold it (and use it) for four rounds before it can dance again. When dancing, the staff will leave its owner\'s hand and may go up to [[30]] feet distant. At the end of its fourth round of solo combat, it will move to its possessor\'s hand automatically. Note that when dancing the staff cannot be physically hit, although certain magical attacks such as a fireball, lightning bolt, or transmute metal to wood spell could affect it.\nFinally, remember that the dancing staff fights alone exactly the same; if a 7th-level thief is the wielder, the staff will so fight when dancing. Relieved of his weapon for four melee rounds, the possessor may act in virtually any manner desired—resting, discharging missiles, drawing another weapon and engaging in hand-to-hand combat, etc.—as long as he remains within [[30]] feet of the staff. If he moves more than 30 feet from the weapon, it falls lifeless to the ground and is a +1 weapon when again grasped.}}'},
						{name:'Ranseur',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Ranseur}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Ranseur,Melee,2H,Polearm],[Ranseur,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Ranseur,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10-14,sp:8],[w:Ranseur set vs charge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:10-14,sp:8]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:2d4, L:2d4, if set vs charge SM:4d4, L:4d4, + Str bonus}}DmgData=[w:Ranseur,sb:1,+:0,SM:2d4,L:2d4],[w:Ranseur vs charge,sb:1,+:0,SM:4d4,L:4d4]{{desc=This is a normal Ranseurn, a type of Polearm. The point is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nVery much like the partisan, the Ranseur differs in that the main blade is thinner and the projecting blades extended more like tines of a fork. These can trap a weapon and sometimes punch through armor.}}'},
						{name:'Rapier',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Rapier}}{{subtitle=Sword}}{{Speed=[[2]]}}{{Size=Medium}}{{Weapon=1-handed melee fencing-blade}}Specs=[Rapier,Melee,1H,Fencing-blade]{{To-hit=+0 no bonuses}}ToHitData=[w:Rapier,sb:0,+:0,n:2,ch:20,cm:1,sz:M,ty:P,r:5,sp:2]{{Attacks=2 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d4+2, L:1d4, no bonuses}}DmgData=[w:Rapier,sb:0,+:0,SM:2+1d4,L:1d4]{{desc=This is a normal fencing sword. The blade is sharp but is otherwise unremarkable.}}'},
						{name:'Rapier-for-Thieves',type:'Melee',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Thieves Rapier}}{{subtitle=Sword}}{{Speed=[[2]]}}{{Size=Medium}}{{Weapon=1-handed melee fencing-blade}}Specs=[Thieves-Rapier,Melee,1H,Fencing-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Rapier,sb:1,+:1,n:2,ch:20,cm:1,sz:M,ty:P,r:5,sp:2]{{Attacks=2 per round + level, Piercing}}{{Damage=+1, vs SM:1d4+2, L:1d4, + Str bonus}}DmgData=[w:Rapier,sb:1,+:1,SM:2+1d4,L:1d4]{{desc=This is a normal fencing sword, but extra-effective in the hands of a thief. The blade is sharp but is otherwise unremarkable.}}'},
						{name:'Scimitar',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scimitar}}{{subtitle=Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Scimitar,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar,sb:1,+:0,SM:1d8,L:1d8]{{desc=This is a normal sword. The blade is sharp but is otherwise unremarkable.}}'},
						{name:'Scimitar+',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Scimitar}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+?}}{{damage=+?}}{{Normal=[TSM:1d8+?](!\\amp#13;\\amp#47;r 1d8+0)[LH:1d8+?](!\\amp#13;\\amp#47;r 1d8+0)}}{{desc=This is an unknown, fine-quality scimitar}}'},
						{name:'Scimitar+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scimitar+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Scimitar+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar+1,sb:1,+:1,SM:1d8,L:1d8]{{desc=This is a normal magical sword. The blade is very sharp and shimmers with a silvery hue, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Scimitar+2',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scimitar+2}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+2 + Str bonus}}ToHitData=[w:Scimitar+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+2, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar+2,sb:1,+:2,SM:1d8,L:1d8]{{desc=This is a normal magical sword. The blade is very sharp and shimmers with a silvery hue, and is a +[[2]] magical weapon at all times.}}'},
						{name:'Scimitar-of-Adaptation+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scimitar of Adaptation +1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Scimitar,Melee,1H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Scimitar of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d8, L:1d8, + Str bonus}}DmgData=[w:Scimitar of Adapt+1,sb:1,+:1,SM:1d8,L:1d8]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Scourge',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Scourge}}{{subtitle=Whip}}{{Speed=[[5]]}}{{Size=Small}}{{Weapon=1-handed melee whip}}Specs=[Scourge,Melee,1H,Whip]{{To-hit=+0 + Str bonus}}ToHitData=[w:Scourge,sb:1,+:0,n:1,ch:20,cm:1,sz:S,ty:N,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d4, L:1d2, + Str bonus}}DmgData=[w:Scourge,sb:1,+:0,SM:1d4,L:1d2]{{desc=A standard Scourge of good quality, but nothing special.\nThis wicked weapon is a short whip with several thongs or tails. Each thong is studded with metal barbs, resulting in a terrible lash. It is sometimes used as an instrument of execution.}}'},
						{name:'Shadowbane-Broadsword',type:'Melee|Melee|Melee|Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sword +2, Dragon Slayer (special)}}{{subtitle=Magic Sword}}{{Speed=[[5]] or by sword}}{{Size=Medium}}{{Weapon=1-handed melee long-blade}}Specs=[Broad-sword,Melee,1H,Long-blade],[Broad-sword,Melee,1H,Long-blade],[Broad-sword,Melee,1H,Long-blade],[Broad-sword,Melee,1H,Long-blade]{{To-hit=+2, +4 vs dragons, + Str bonus}}ToHitData=[w:Shadowbane+2,sb:1,+:2,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Shadowbane vs Dragon,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Shadowbane vs Silver,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5],[w:Shadowbane vs Black,sb:1,+:4,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+2, +4 vs dragons except Silver \\amp Black}}DmgData=[w:Shadowbane+2,sb:1,+:2,SM:2d4,L:1+1d6],[w:Shadowbane vs Dragon,sb:1,+:4,SM:1d12,L:1d12],[w:Shadowbane vs Silver,sb:1,+:2,SM:2d4,L:1+1d6],[w:Shadowbane vs Black,sb:1,+:4,SM:2000,L:2000]{{Special=vs. Black Dragon, a hit kills, then sword disintegrates\nvs. Silver Dragon normal damage}}{{desc=This has a +[[4]] bonus against any sort of true dragon. It automatically kills one sort of dragon but then immediately disintegrates and can no longer be used. Note that an unusual sword with intelligence and alignment will not be made to slay dragons of the same alignment. Determine dragon type (excluding unique ones like Bahamut and Tiamat) by rolling 1d10:\n1 black (CE) 6 gold (LG)\n2 blue (LE) 7 green (LE)\n3 brass (CG) 8 red (CE)\n4 bronze (LG) 9 silver (LG)\n5 copper (CG) 10 white (CE)}}'},
						{name:'Shortbow',type:'Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Shortbow}}{{subtitle=Bow}}{{Speed=[[7]]}}{{Size=Medium}}{{Weapon=2-handed ranged bow}}Specs=[Shortbow,Ranged,2H,Bow]{{To-hit=+0 + Dex bonus}}ToHitData=[w:Shortbow,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:M,ty:P,sp:7]{{Attacks=2 per round, no increases, Piercing}}{{desc=This is a normal shortbow. The wood is polished, the string taut, but nothing special.}}'},
						{name:'Shortsword',type:'Melee',ct:'3',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Shortsword}}{{subtitle=Sword}}{{Speed=[[3]]}}{{Size=Medium}}{{Weapon=1-handed melee short-blade}}Specs=[Shortsword,Melee,1H,Short-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Shortsword,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:3]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d8, + Str bonus}}DmgData=[w:Shortsword,sb:1,+:0,SM:1d6,L:1d8]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Shortsword+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Shortsword+1}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}{{Size=Medium}}{{Weapon=1-handed melee short-blade}}Specs=[Short-sword,Melee,1H,Short-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Shortsword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:5]{{Damage=+1 + Str Bonus}}DmgData=[w:Shortsword+1,sb:1,+:1,SM:1d6,L:1d8]{{desc=This is a normal magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times.}}'},
						{name:'Shortsword-of-Adaptation+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Shortsword of Adaptation +1}}{{subtitle=Magic Sword}}{{Speed=[[3]]}}{{Size=Medium}}{{Weapon=1-handed melee short-blade}}Specs=[Shortsword,Melee,1H,Short-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Shortsword of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:P,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+1, vs SM:1d6, L:1d8, + Str bonus}}DmgData=[w:Shortsword of Adapt+1,sb:1,+:1,SM:1d6,L:1d8]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Sickle',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sickle}}{{subtitle=Short Blade}}{{Speed=[[5]]}}{{Size=Small}}{{Weapon=1-handed melee short-blade}}Specs=[Sickle,Melee,1H,Short-balde]{{To-hit=+0 + Str bonus}}ToHitData=[w:Sickle,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:5]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d4+1, L:1d4}}DmgData=[w:Sickle,sb:1,+:0,SM:1+1d4,L:1d4]{{desc=This is a normal Sickle. The blade is sharp and keen, but nothing special.}}'},
						{name:'Sling',type:'Ranged|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sling}}{{subtitle=Ranged Weapon}}{{Speed=2H [[6]]/1H [[7]]}}{{Size=Small}}{{Weapon=1- or 2-handed ranged sling}}Specs=[Sling,Ranged,1H,Sling],[Sling,Ranged,2H,Sling]}}{{To-hit=+0 + Dex bonus}}ToHitData=[w:Sling,sb:0,db:1,+:0,n:1,ch:20,cm:1,sz:S,ty:B,sp:7,r:Varies by ammo],[w:Sling,sb:0,db:1,+:0,n:2,ch:20,cm:1,sz:S,ty:B,sp:6,r:Varies by ammo]{{Attacks=1-handed=1/round, 2-handed=2/round, Bludgeoning}}{{desc=A sling, made of supple leather. Can be either 1-handed or 2-handed. However, 1-handed is slightly slower to load and fire and requires more coordination, and thus can only get 1 shot per round. 2-handed gets 2 shots per round}}'},
						{name:'Spear',type:'Melee|Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Spear}}{{subtitle=Spear}}{{Speed=[[6]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown spear}}Specs=[Spear,Melee,1H,Spear],[Spear,Ranged,1H,Spear]{{To-hit=+0 + Str \\amp Dex bonuses}}ToHitData=[w:Spear,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,r:8,sp:6],[w:Spear,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:P,sp:6]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+0, vs SM:1d6, L:1d8, + Str bonus}}DmgData=[w:Spear,sb:1,+:0,SM:1d6,L:1d8],[]{{Ammo=+0, vs SM:1d6, L:1d8, + Str bonus}}[w:Spear,t:Spear,st:Spear,sb:1,+:0,SM:1d6,L:1d8]}}{{Range=S:10, M:20, L:30}}RangeData=[t:Spear,+:0,r:1/2/3]{{desc=This is a normal Spear. The point is sharp and it is well balanced, but nothing special.}}'},
						{name:'Spetum',type:'Melee|Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Spetum}}{{subtitle=Polearm}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Spetum,Melee,2H,Polearm],[Spetum,Melee,2H,Polearm]}}{{To-hit=+0 + Str bonus}}ToHitData=[w:Spetum,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:8-10,sp:8],[w:Spetum set vs charge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:P,r:8-10,sp:8]((Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d6+1, L:2d6, if set vs charge SM:2d6+2, L:4d6, + Str bonus}}DmgData=[w:Spetum,sb:1,+:0,SM:1+1d6,L:2d6],[w:Spetum vs charge,sb:1,+:0,SM:2+2d6,L:4d6]{{desc=This is a normal Spetum, a type of Polearm. The point is sharp and keen, but nothing special. **Inflicts double damage when set firmly vs. charge.**\nThe spetum is a modification of the normal spear. The shaft increases to eight to ten feet and side blades are added. Some have blades that angle back, increasing the damage when pulling the weapon out of a wound. These blades can also trap and block weapons or catch and hold an opponent.}}'},
						{name:'Spiritual-Hammer+1',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Spiritual Hammer+1}}{{subtitle=Hammer/Club}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed magically remote melee club}}Specs=[Spiritual Hammer,Melee,1H,Club]{{To-hit=+1, no other bonuses}}ToHitData=[w:Spiritual-Hammer+1,sb:0,+:1,n:1,ch:20,cm:1,sz:M, ty:B, r:Varies,sp:5],{{Attacks=1 per round, no effect from level or specialisation, Bludgeoning}}{{Damage=+1, vs SM:1d4+1, L:1d4, no Str bonus}}DmgData=[w:Spiritual-Hammer+1,sb:0,+:1,SM:1+1d4,vs L:1d4]{{desc=A hammer conjured by a priest using a Spiritual Hammer spell. Base Thac0 same as caster [[22-(ceil(@{selected|Casting-Level}/3)*2)]] without strength bonus plus magical plus of +[[{{(ceil(@{selected|Casting-Level}/6)),3}kl1}]]. Damage is plus magical bonus but no others. Hits are in the direction caster is facing, allowing rear attacks. Dispel Magic on caster or hammer can dispel. Stopping concentrating dispels. Magic Resistance checked in 1st round and spell lost if made or full effect if not.}}'},
						{name:'Spiritual-Hammer+2',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Spiritual Hammer+1}}{{subtitle=Hammer/Club}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed magically remote melee club}}Specs=[Spiritual Hammer,Melee,1H,Club]{{To-hit=+2, no other bonuses}}ToHitData=[w:Spiritual-Hammer+2,sb:0,+:2,n:1,ch:20,cm:1,sz:M, ty:B, r:Varies,sp:5],{{Attacks=1 per round, no effect from level or specialisation, Bludgeoning}}{{Damage=+2, vs SM:1d4+1, L:1d4, no Str bonus}}DmgData=[w:Spiritual-Hammer+2,sb:0,+:2,SM:1+1d4,vs L:1d4]{{desc=A hammer conjured by a priest using a Spiritual Hammer spell. Base Thac0 same as caster [[22-(ceil(@{selected|Casting-Level}/3)*2)]] without strength bonus plus magical plus of +[[{{(ceil(@{selected|Casting-Level}/6)),3}kl1}]]. Damage is plus magical bonus but no others. Hits are in the direction caster is facing, allowing rear attacks. Dispel Magic on caster or hammer can dispel. Stopping concentrating dispels. Magic Resistance checked in 1st round and spell lost if made or full effect if not.}}'},
						{name:'Spiritual-Hammer+3',type:'Melee',ct:'5',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Spiritual Hammer+1}}{{subtitle=Hammer/Club}}{{Speed=[[5]]}}{{Size=Medium}}{{Weapon=1-handed magically remote melee club}}Specs=[Spiritual Hammer,Melee,1H,Club]{{To-hit=+3, no other bonuses}}ToHitData=[w:Spiritual-Hammer+3,sb:0,+:3,n:1,ch:20,cm:1,sz:M, ty:B, r:Varies,sp:5],{{Attacks=1 per round, no effect from level or specialisation, Bludgeoning}}{{Damage=+3, vs SM:1d4+1, L:1d4, no Str bonus}}DmgData=[w:Spiritual-Hammer+3,sb:0,+:3,SM:1+1d4,vs L:1d4]{{desc=A hammer conjured by a priest using a Spiritual Hammer spell. Base Thac0 same as caster [[22-(ceil(@{selected|Casting-Level}/3)*2)]] without strength bonus plus magical plus of +[[{{(ceil(@{selected|Casting-Level}/6)),3}kl1}]]. Damage is plus magical bonus but no others. Hits are in the direction caster is facing, allowing rear attacks. Dispel Magic on caster or hammer can dispel. Stopping concentrating dispels. Magic Resistance checked in 1st round and spell lost if made or full effect if not.}}'},
						{name:'Staff-Sling',type:'Ranged',ct:'6',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Staff-Sling}}{{subtitle=Ranged Weapon}}{{Speed=[[11]]}}{{Size=Medium}}{{Weapon=2-handed ranged sling}}Specs=[Staff-Sling,Ranged,2H,Sling]{{To-hit=+0 no bonuses}}ToHitData=[w:Staff-Sling,sb:0,+:0,n:2,ch:20,cm:1,sz:S,ty:B,r:+2/+3/+4,sp:6]{{Attacks=2 per round + level \\amp specialisation, Bludgeoning}}{{desc=A staff sling, made of supple leather and a sturdy pole. Ideal for slinging balls for dogs to fetch...}}'},
						{name:'Strong-Longbow',type:'Ranged',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Strong Longbow}}{{subtitle=Bow}}{{Speed=[[8]]}}{{Size=Large}}{{Weapon=2-handed ranged bow}}Specs=[Longbow,Ranged,2H,Bow]{{To-hit=+0, + Str \\amp Dex bonuses}}ToHitData=[w:Longbow,sb:1,db:1,+:0,n:2,ch:20,cm:1,sz:L,ty:P,sp:8]{{Attacks=2 per round + level \\amp specialisation, Piercing}}{{desc=This is a longbow with strong limbs, able to be drawn by a very strong bowyer, incorporating strength bonuses. The wood is polished, the limbs flexible, the string taut, but nothing special.}}'},
						{name:'Sword-of-adaptation+1',type:'Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[5]]}}{{Size=Medium}}Specs=[Sword of Adaptation,Melee,1H,Sword]{{To-hit=+[[1]]}}{{damage=+[[1]]}}{{Roll=Varies by use}}{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Throwing-Axe',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Throwing Axe}}{{subtitle=Axe}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee \\amp thrown axe}}Specs=[Throwing Axe,Melee,1H,Axe],[Throwing Axe,Ranged,1H,Axe]{{To-hit=+0, + Str \\amp Dex bonuses}}ToHitData=[w:Throwing Axe,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:4],[w:Throwing Axe,sb:1,db:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,sp:4]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Throwing Axe,sb:1,+:0,SM:1d6,L:1d4],[]{{Ammo=+0, SM:1d6, L:1d4, + Str bonus}}AmmoData=[w:Throwing Axe,t:Throwing Axe,st:Axe,sb:1,+:0,SM:1d6,L:1d4]}}{{Range=S:10, M:20, L:30}}RangeData=[t:Throwing Axe,+:0,r:1/2/3]{{desc=This is a normal Hand- or Throwing-Axe. The blade is extra sharp and it is well balanced, but nothing special.}}'},
						{name:'Throwing-Dagger+4',type:'Melee|Ranged',ct:'2',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Throwing Dagger +0/+4}}{{subtitle=Magic Weapon}}{{Speed=[[2]]}}{{Size=Small}}{{Weapon=1-handed melee or thrown short-blade}}Specs=[Dagger,Melee,1H,Short-blade],[Dagger,Ranged,1H,Throwing-blade]{{To-hit=+0, +4 when thrown, + Str \\amp Dex bonus}}ToHitData=[w:Throwing Dagger+0,sb:1,+:0,n:2,ch:20,cm:1,sz:S,ty:S,r:5,sp:2],[w:Throwing-Dagger+4,sb:1,db:1,+:4,n:2,ch:20,cm:1,sz:S,ty:P,sp:2]{{Attacks=2 per round + level \\amp specialisation, Slashing \\amp Piercing}}{{Damage=+0, vs SM:1d4, L:1d3, + Str bonus}}DmgData=[w:Throwing Dagger+0,sb:1,+:0,SM:1d4,L:1d3],[ ]}}{{Ammo=+4, vs SM:1d4, L:1d3, + Str bonus}}AmmoData=[w:Throwing Dagger+4,t:Dagger,st:Dagger,sb:1,+:4,SM:1d4,L:1d3]{{Range=S:10, M:20, L:30}}RangeData=[t:Dagger,+:4,r:1/2/3]{{desc=This is a finely balanced throwing dagger, which is +4 to hit and for damage when thrown (though it has no bonuses if used in the hand)}}'},
						{name:'Throwing-axe+1',type:'Melee|Ranged',ct:'4',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Throwing Axe+1}}{{subtitle=Magic Weapon}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown axe}}Specs=[Throwing-Axe,Melee,1H,Axe],[Throwing-Axe,Ranged,1H,Throwing-blade]{{To-hit=+1 + Str \\amp Dex bonuses}}ToHitData=[w:Throwing Axe+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:3,sp:4],[w:Throwing Axe+1,sb:1,db:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,sp:4,r:-/1/2/3]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+1, vs SM:1d6, L:1d4, + Str bonus}}DmgData=[w:Throwing Axe+1,sb:1,+:1,SM:1d6,L:1d4],[]}}{{Ammo=+1, vs SM:1d6, L:1d4, + Str bonus}}AmmoData=[w:Throwing Axe,t:Throwing-Axe,sb:1,+:1,SM:1d6,L:1d4]{{Range=S:10, M:20, L:30}}RangeData=[t:Throwing-Axe,+:1,r:-/1/2/3]{{desc=A standard Throwing Axe of fine quality, good enough to be enchanted to be a +1 magical weapon}}'},
						{name:'Touch',type:'Melee|Melee',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Touch}}{{subtitle=Innate Action}}{{Speed=[[0]]}}{{Size=None}}{{Weapon=1- or 2-handed melee innate ability}}Specs=[Innate,Melee,1H,Innate],[Innate,Melee,2H,Innate]{{To-hit=+0 + Str bonus}}ToHitData=[w:Touch,sb:1,+:0,n:1,ch:20,cm:1,sz:T,ty:B,r:5,sp:0],[w:Touch,sb:1,+:0,n:1,ch:20,cm:1,sz:T,ty:B,r:5,sp:0]{{Attacks=1 per round + level}}{{Damage=None}}DmgData=[w:Touch,sb:0,+:0,SM:0,L:0],[w:Touch,sb:0,+:0,SM:0,L:0]{{desc=Touching with a hand or other limb not containing a weapon. Typically a spell caster\'s ability which they select as a weapon when aiming to use a Touch spell}}'},
						{name:'Trident',type:'Melee|Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Fine quality Trident}}{{subtitle=Weapon}}{{Speed=By type}}{{Size=Medium}}Specs=[Trident,Melee,1H,Spear],[Trident,Ranged,1H,Spear]{{To-hit=+?}}{{damage=+?}}{{Other Powers=Unknown}}{{desc=This definitely appears to be a trident, and the DM will describe it more if you pick it up to look closely at it}}'},
						{name:'Trident-of-Fish-Command',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Trident of Fish Command}}{{subtitle=Weapon}}{{Speed=7}}{{Size=Large}}{{Weapon=1-handed melee or thrown spear}}Specs=[Trident,Melee,1H,Spear],[Trident,Ranged,1H,Spear]{{To-hit=+3 + Str \\amp Dex bonuses}}ToHitData=[w:Trident Fish Command,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,r:8,sp:7],[w:Trident Fish Command,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+3, vs SM:1d6+1, L:3d4, + Str bonus}}DmgData=[w:Trident Fish Command,sb:1,+:3,SM:1+1d6,L:3d4],[]{{Ammo=+3, vs SM:1d6+1, L:3d4, + Str bonus}}[w:Trident Fish Command,t:Trident,st:Spear,sb:1,+:3,SM:1+1d6,L:3d4]{{Range=S:10, L:20}}RangeData=[t:Trident,+:3,r:1/1/2]{{Other Powers=Fish Command}}{{desc=This three-tined fork atop a stout 6-foot long rod appears to be a barbed military fork of some sort. However, its magical properties enable its wielder to cause all fish within a 60-foot radius to roll saving throws vs. spell. This uses one charge of the trident. Fish failing this throw are completely under empathic command and will not attack the possessor of the trident nor any creature within 10 feet of him. The wielder of the device can cause fish to move in whatever direction is desired and can convey messages of emotion (i.e., fear, hunger, anger, indifference, repletion, etc.). Fish making their saving throw are free of empathic control, but they will not approach within 10 feet of the trident.\nIn addition to ordinary fish, the trident affects sharks and eels. It doesn\'t affect molluscs, crustaceans, amphibians, reptiles, mammals, and similar sorts of non-piscine marine creatures. A school of fish should be checked as a single entity.\nA trident of this type contains 1d4+16 charges. It is otherwise a +1 magical weapon.}}'},
						{name:'Trident-of-Warning',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Trident of Warning}}{{subtitle=Weapon}}{{Speed=7}}{{Size=Large}}{{Weapon=1-handed melee or thrown spear}}Specs=[Trident,Melee,1H,Spear],[Trident,Ranged,1H,Spear]{{To-hit=+3 + Str \\amp Dex bonuses}}ToHitData=[w:Trident of Warning,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,r:8,sp:7],[w:Trident of Warning,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+3, vs SM:1d6+1, L:3d4, + Str bonus}}DmgData=[w:Trident of Warning,sb:1,+:3,SM:1+1d6,L:3d4],[]{{Ammo=+3, vs SM:1d6+1, L:3d4, + Str bonus}}AmmoData=[w:Trident of Warning,t:Trident,st:Spear,sb:1,+:3,SM:1+1d6,L:3d4]{{Range=S:10, L:20}}RangeData=[t:Trident,+:3,r:1/1/2]{{Other Powers=Aquatic Hostiles detection}}{{desc=A weapon of this type enables its wielder to determine the location, depth, species, and number of hostile or hungry marine predators within 240 feet. A trident of warning must be grasped and pointed in order for the person using it to gain such information, and it requires one round to scan a hemisphere with a radius of 240 feet. There are 19-24 charges in a trident of this type, each charge sufficient to last for two rounds of scanning. The weapon is otherwise a +2 magical weapon}}'},
						{name:'Two-Handed-Sword',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Two Handed Sword}}{{subtitle=Sword}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed melee long-blade}}Specs=[Two-Handed-Sword,Melee,2H,long-blade|great-blade]{{To-hit=+0 + Str bonus}}ToHitData=[w:Two-Handed-Sword,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:10]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+0, vs SM:1d10, L:3d6, + Str bonus}}DmgData=[w:Two-Handed-Sword,sb:1,+:0,SM:1d10,L:3d6]{{desc=This is a normal sword. The blade is sharp and keen, but nothing special.}}'},
						{name:'Two-Handed-Sword+1',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Two Handed Sword+1}}{{subtitle=Magic Sword}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed melee long-blade}}Specs=[Two-Handed-Sword,Melee,2H,Long-blade|Great-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Two-Handed-Sword+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:10]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d10, L:3d6, + Str bonus}}DmgData=[w:Two-Handed-Sword,sb:1,+:1,SM:1d10,L:3d6]{{desc=This is a really well balanced sword. The blade is extra sharp and keen, and has a magical glint.}}'},
						{name:'Two-Handed-Sword-of-Adaptation+1',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Two Handed Sword of Adaptation+1}}{{subtitle=Magic Sword}}{{Speed=[[10]]}}{{Size=Medium}}{{Weapon=2-handed melee long-blade}}Specs=[Two-Handed-Sword,Melee,2H,Long-blade]{{To-hit=+1 + Str bonus}}ToHitData=[w:Two-Handed Sword of Adapt+1,sb:1,+:1,n:1,ch:20,cm:1,sz:M,ty:S,r:5,sp:10]{{Attacks=1 per round + level \\amp specialisation, Slashing}}{{Damage=+1, vs SM:1d10, L:3d6, + Str bonus}}DmgData=[w:Two-Handed Sword of Adapt+1,sb:1,+:1,SM:1d10,L:3d6]{{desc=This is an exceptional magical sword. The blade is sharp and keen, and is a +[[1]] magical weapon at all times. However, it can adapt to be a sword of any type the wielder desires (and is proficient with). It will take [[1]] round to change shape to a different type of sword.}}'},
						{name:'Voulge',type:'Melee',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Voulge}}{{subtitle=Polearm}}{{Speed=[[10]]}}{{Size=Large}}{{Weapon=2-handed melee polearm}}Specs=[Voulge,Melee,2H,Polearm]{{To-hit=+0 + Str bonus}}ToHitData=[w:Voulge,sb:1,+:0,n:1,ch:20,cm:1,sz:L,ty:S,r:7-8,sp:10]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0 vs SM:2d4, L:2d4}}DmgData=[w:Voulge,sb:1,+:0,SM:2d4,L:2d4]{{desc=This is a normal Voulge a type of Polearm. The blade is sharp and keen, but nothing special.\nThe voulge, like the bardich, is a variation on the axe and the cleaver. The voulge is little more than a cleaver on the end of a long (seven- to eight-foot) pole. It is a popular weapon, easy to make and simple to learn. It is also called the Lochaber axe.}}'},
						{name:'Warhammer',type:'Melee|Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Warhammer}}{{subtitle=Hammer/Club}}{{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown club}}Specs=[Warhammer,Melee,1H,Club],[Warhammer,Ranged,1H,Club]{{To-hit=+0 + Str \\amp Dex bonus}}ToHitData=[name w:Warhammer,strength bonus sb:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:B, range r:5,speed sp:4],[name w:Warhammer,strength bonus sb:1,dexterity bonus db:1,magic+:0,attks per round n:1,crit hit ch:20,crit miss cm:1,size sz:M, type ty:B, speed sp:4]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d4+1, L:1d4, + Str bonus}}DmgData=[name w:Warhammer,strength bonus sb:1,magic+:0,vs SM:1+1d4,vs L:1d4][]{{Ammo=+0, vs SM:1d4+1, L:1d4, + Str bonus}}AmmoData=[w:Warhammer,t:Warhammer,st:Throwing-club,sb:1,+:0,SM:1+1d4,L:1d4]{{Range=S:10, M:20, L:30}}RangeData=[t:Warhammer,+:0,r:1/2/3]{{desc=This is a normal warhammer. The blade is sharp and keen, but nothing special.}}'},
						{name:'Wave',type:'Melee|Ranged',ct:'7',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Wave\nIntelligent, Neutral}}{{subtitle=Magic Trident}}{{Speed=[[7]]}}{{Size=M}}{{Weapon=1-handed melee or thrown spear}}Specs=[Trident,Melee,1H,Spear],[Trident,Ranged,1H,Spear]{{To-hit=+3 + Str bonus}}ToHitData=[w:Wave,sb:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,r:8,sp:7],[w:Wave,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:L,ty:P,sp:7]{{Attacks=1 per round + level \\amp specialisation, Piercing}}{{Damage=+3, vs SM:1d6+1, L:3d4, + Str bonus}}DmgData=[w:Wave,sb:1,+:3,SM:1+1d6,L:3d4],[]{{Ammo=+3, vs SM:1d6+1, L:3d4, + Str bonus}}AmmoData=[w:Wave,t:Trident,st:Spear,sb:1,+:3,SM:1+1d6,L:3d4]{{Range=S:10, L:20}}RangeData=[t:Trident,+:3,r:1/1/2]{{desc=**Wave**\nWeapon (trident), legendary (requires attunement by a creature that worships a god of the sea)\n\n**Powers**\n+3 bonus to attack and damage rolls\nCritical hit causes extra damage of half target\'s HP maximum.\nFunctions as\n[Trident of Fish Command](~Trident-of-Fish-Command)\n[Weapon of Warning](~Trident-of-Warning)\n[Cap of Water Breathing](~Magic-Items|Target-User)\n[Cube of Force](~MI-DB|Cube-of-Force)\n[Squeak with Aquatic Animals](~PR-Spells-DB|Speak-with-Animals)\n\n***Sentience:*** Neutral alignment, Int 14, Wisdom 10, Chr 18. Hearing and *darkvision* range [[120]] feet. Telepathic with wielder, can speak, read, and understand Aquan\n\n**[Click here to see Wave handout for *Personality* and *Purpose*](http://journal.roll20.net/handout/-KdlsAAepzd1bKBYW_v3)**}}\n!setattr --charid @{selected|character_id} --silent --MI-used|Wave doing Water Breathing --MI-cast|Wave-Breath --MI-duration|99 --MI-direction|0 --MI-msg|Breathing under water --MI-marker|strong --casting-level|12 --casting-name|Wave'},
						{name:'Whelm',type:'Melee|Ranged',ct:'10',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Whelm\nIntelligent, Lawful Neutral}}{{subtitle=Magic Warhammer}}{{Speed=[[10]]}}{{Size=M}}WeapData=[w:Whelm,ns:4][cl:PW,w:Whelm-Shockwave,sp:10,pd:1,lv:12],[cl:PW,w:Whelm-Detect-Evil,sp:10,pd:1,lv:12],[cl:PW,w:Whelm-Detect-Good,sp:10,pd:1,lv:12],[cl:PW,w:Whelm-Locate-Object,sp:100,pd:1,lv:12]{{Weapon=1-handed melee or thrown club}}Specs=[Warhammer,Melee,1H,Club],[Warhammer,Ranged,1H,Throwing-Club]{{To-hit=+3 + Str \\amp Dex bonuses}}ToHitData=[w:Whelm,sb:1,+:3,n:1,ch:20,cm:1,sz:M,ty:B,r:5,sp:4],[w:Whelm,sb:1,db:1,+:3,n:1,ch:20,cm:1,sz:M,ty:B,sp:4]{{Attacks=1 per round + level \\amp specialisation, Bludgeoning}}{{Damage=+3, vs SM:1d4+1, L:1d4, + Str bonus}}DmgData=[w:Whelm,sb:1,+:3,SM:1+1d4,L:1d4],[]{{Ammo=+3, vs SM:1d4+1d8+1, L:1d4+2d8, + Str Bonus, and automatically returns}}AmmoData=[w:Whelm,t:Warhammer,st:Throwing-club,+:3,ru:1,SM:1+1d4+1d8,L:1d4+2d8]{{Range=S:20, M:40, L:60}}RangeData=[t:Warhammer,+:3,r:2/4/6]{{desc=**Whelm:** Weapon (warhammer), legendary. Powerful war-hammer forged by dwarves.\n\n**Attacks:** +3 attack and damage rolls.\n**Disadvantage:** Wielder has fear of being outdoors. Disadvantage (roll twice and take the worse outcome) on attack, saves, and ability checks under daytime sky.\n**Thrown Weapon:** range 20/40/60 feet. extra 1d8 (TSM) 2d8 (LG) bludgeoning damage when thrown. Flies back to your hand after attack. If don\'t have hand free, weapon lands at your feet.\n[Shock Wave](!magic --mi-power @{selected|token_id}|Whelm-Shock-Wave|Whelm|12): Strike the ground with *Whelm* and send out *Shock Wave* (1 per day). Creatures of your choice within [[60]]ft of impact point must save vs. Staves or stunned for [[1]] turn (additional save each round)\n[Detect Evil](!magic --mi-power @{selected|token_id}|Whelm-Detect-Evil|Whelm|12) 1/day\n[Detect Good](!magic --mi-power @{selected|token_id}|Whelm-Detect-Good|Whelm|12) 1/day\n[Locate Object](!magic --mi-power @{selected|token_id}|Whelm-Locate-Object|Whelm|12) 1/day\n\n***Sentience:*** Lawful Neutral weapon, Int 15, Wisdom 12, Chr 15.Hearing and *darkvision* range 120 ft, uses powers at L12. Communicates telepathically with wielder and can speak, read, and understand Dwarvish. Giant, and Goblin. It shouts battle cries in Dwarvish when used in combat.\n\n**[Click here to see Whelm handout for *Personality* and *Purpose*](http://journal.roll20.net/handout/-KdlOvcft0A5MZUR1Quv)**}}\n!setattr --charid @{selected|character_id} --silent --MI-used|Whelm doing Shock Wave --MI-cast|Whelm-Stunned --MI-duration|10 --MI-direction|-1 --MI-msg|Stunned roll save vs Staves again --MI-marker|fishing-net --casting-level|12 --casting-name|Whelm'},
						{name:'Whip',type:'Melee',ct:'8',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Whip}}{{subtitle=Whip}}{{Speed=[[8]]}}{{Size=Medium}}{{Weapon=1-handed melee whip}}Specs=[Whip,Melee,1H,Whip]{{To-hit=+0 + Str bonus}}ToHitData=[w:Whip,sb:1,+:0,n:1,ch:20,cm:1,sz:M,ty:N,r:10,sp:8]{{Attacks=1 per round + level \\amp specialisation}}{{Damage=+0, vs SM:1d2, L:1 + Str bonus \\amp entangle}}DmgData=[w:Whip,sb:1,+:0,SM:1d2,L:1]{{desc=A standard Whip of good quality, but nothing special.\nTo inflict damage, the whip must strike exposed or lightly covered flesh. Heavy clothing, thick hair, or fur gives considerable protection until torn away by repeated lashing. The type of armor determines how long it takes the whip to begin doing damage. With heavy clothing, damage begins on the third successful blow; thick hair or fur, on the second; padded armor, on the fourth; leather armor, on the fifth; hide armor, on the sixth. The whip can do no harm through armor heavier than that. Thick hide, such as that of an elephant or rhinoceros, will allow a slight sting at best, with no real damage inflicted.\nWhips can be up to 25ft long, and are useful for Entanglement, with various percentages for achieving this: success = 5% per level for proficient wielders, and if successful, roll 1d100 for result (1-50: a non-weapon limb, 51-60: two limbs, 61-80 weapon wielding limb, 81-00 head). You can use a called shot at -10% on success roll to be able to vary the outcome roll by 20% either way (e.g. so if successful, you could make a 35 into a 55 and entangle 2 limbs instead of one)}}'},
						]},
	MI_DB_Ammo:		{bio:'<blockquote><h2>Weapons Database</h2></blockquote><b>v5.5  05/11/2021</b><br><br>This sheet holds definitions of weapons that can be used in the redMaster API system.  They are defined in such a way as to be lootable and usable magic items for magicMaster and also usable weapons in attackMaster.',
					gmnotes:'<blockquote>Change Log:</blockquote>v5.5  05/11/2021  Split the Weapon and Ammo databases<br><br>v5.4  31/10/2021  Further encoded using machine readable data to support API databases<br><br>v5.3.4  21/08/2021  Fixed incorrect damage for all types of Two-handed Sword<br><br>v5.3.3  07/06/2021  Added the missing Scimitar macro<br><br>v5.3.2  31/05/2021  Cleaned ranged weapon ranges, as specifying a range for the weapon in the {{To-Hit=...}} section will now adjust the range of the ammo by that amount (for extended range weapons).  Self-ammoed weapons (like thrown daggers) should specify their range in the {{Range=...}} section.<br><br>v5.3.1  19/05/2021  Fixed a couple of bugs, missing weapons in the transfer from MI-DB<br><br>v5.3  14/05/2021  All standard weapons from the PHB now encoded.<br><br>v5.2  12/05/2021  Added support for weapon types (S,P,B), and more standard weapons<br><br>v5.1  06/05/2021  Added a number of standard and magical weapons<br><br>v5.0  28/04/2021  Initial separation of weapons listings from the main MI-DB',
					root:'MI-DB',
					controlledby:'all',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
					version:5.5,
					db:[{name:'-',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" This is a blank slot in your Magic Item bag. Go search out some new Magic Items to fill it up!'},
						{name:'Barbed-dart',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Barbed Dart}}{{subtitle=Ammo for Blowgun}}{{Speed=As per blowgun}}{{Size=Tiny}}Specs=[Barbed Dart,Ammo,1H,Blowgun]{{Ammo=For Blowgun, SM:1d3, L:1d2}}AmmoData=[w:Barbed Dart,t:Blowgun,+:0,SM:1d3,L:1d2,rc:uncharged]{{Range=1/2/3}}RangeData=[t:Blowgun,+:0,r:1/2/3]{{desc=A Blowgun dart, barbed and of good quality but otherwise ordinary}}'},
						{name:'Bullet',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sling Bullet}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Bullet,Ammo,1H,Bullet]{{Ammo=+0, vs SM:1+1d4, L:1+1d6}}AmmoData=[w:Bullet,st:Sling,+:0,SM:1+1d4,L:1+1d6],{{Range=Point Blank 6-30,\nShort 31-40,\nMedium 41-80,\nLong 81-160}}RangeData=[t:sling,+:0,r:3/4/8/16]{{desc=A Sling Bullet of good quality but otherwise ordinary}}'},
						{name:'Chalk',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Chalk Stone}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Chalk,Ammo,1H,Bullet]{{Ammo=+2, vs SM:1+1d4, L:1+1d6}}AmmoData=[w:Chalk,st:Sling,+:2,SM:1+1d4,L:1+1d6]{{Range=Point Blank 6-30,\nShort 31-50,\nMedium 51-100,\nLong 101-200}}RangeData=[t:sling,+:0,r:3/5/10/20]}}{{desc=A piece of teacher\'s chalk, which can be used to great effect in a sling (though teachers can possibly just throw it with the same effect!)}}'},
						{name:'Flight-Arrow+1',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Flight Arrow+1}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]{{Ammo=+1,\n**Warbow** vs. SM:1d8, L:1d8,\n**Other Bows** vs. SM:1d6, L:1d6, Piercing}}AmmoData=[w:Flight Arrow+1,st:Bow,+:1,SM:1d6,L:1d6,rc:uncharged],[w:Warbow Flight Arrow+1,t:warbow,+:1,SM:1d8,L:1d8,rc:uncharged]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:60, M:120, L:210,\n**Warbow:**\nS90, M:160, L:250,\n**Composite Sbow:**\nS:50, M:100, L:180,\n**Composite Lbow:**\nS:70, M:140, L:210}}RangeData=[t:longbow,sb:1,+:1,r:3/6/12/21],[t:shortbow,sb:1,+:1,r:3/5/10/15],[t:warbow,+:1,r:3/9/16/25],[t:compositelongbow,sb:1,+:1,r:3/7/14/21],[t:compositeshortbow,sb:1,+:1,r:3/5/10/18]}}{{desc=A magical Flight Arrow of fine quality}}'},
						{name:'Flight-Arrow+2',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Flight Arrow+2}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]{{Ammo=+2,\n**Warbow** vs. SM:1d8, L:1d8,\n**Other Bows** vs. SM:1d6, L:1d6, Piercing}}AmmoData=[w:Flight Arrow+2,st:Bow,sb:1,+:2,SM:1d6,L:1d6],[w:Warbow Flight Arrow+2,t:warbow,sb:1,+:2,SM:1d8,L:1d8]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:60, M:120, L:210,\n**Warbow:**\nS90, M:160, L:250,\n**Composite Sbow:**\nS:50, M:100, L:180,\n**Composite Lbow:**\nS:70, M:140, L:210}}RangeData=[t:longbow,+:2,r:3/6/12/21],[t:shortbow,+:2,r:3/5/10/15],[t:warbow,+:2,r:3/9/16/25],[t:compositelongbow,+:2,r:3/7/14/21],[t:compositeshortbow,+:2,r:3/5/10/18]}}{{desc=A magical Flight Arrow of very fine quality}}'},
						{name:'Flight-Arrows',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Flight Arrow}}{{subtitle=Ammo}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow],[Flight-Arrow,Ammo,1H,Arrow]{{Ammo=+0,\n**Warbow** vs. SM:1d8, L:1d8,\n**Other Bows** vs. SM:1d6, L:1d6, Piercing}}AmmoData=[w:Flight Arrow,st:Bow,+:0,SM:1d6,L:1d6,rc:uncharged],[w:Warbow Flight Arrow,t:warbow,+:0,SM:1d8,L:1d8,rc:uncharged]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:60, M:120, L:210,\n**Warbow:**\nS90, M:160, L:250,\n**Composite Sbow:**\nS:50, M:100, L:180,\n**Composite Lbow:**\nS:70, M:140, L:210}}RangeData=[t:longbow,sb:1,+:0,r:3/6/12/21],[t:shortbow,+:0,r:3/5/10/15],[t:warbow,sb:1,+:0,r:3/9/16/25],[t:compositelongbow,sb:1,+:0,r:3/7/14/21],[t:compositeshortbow,sb:1,+:0,r:3/5/10/18]}}{{desc=A Flight Arrow of good quality but otherwise ordinary}}'},
						{name:'Flight-arrow+?',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Flight Arrow+?}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Flight-Arrow,Ammo,1H,Arrow]{{To-hit=Unknown}}{{damage=Unknown}}{{desc=A magical Flight Arrow of very fine quality, but with unknown plusses}}'},
						{name:'Glass-Arrow+3',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Glass Sheaf Arrow+3}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Glass Arrow,Ammo,1H,Arrow],[Glass Arrow,Ammo,1H,Arrow]{{Ammo=+3 Piercing,\n**Warbow** vs\nSM:1d10, L:1d10\n**Other Bows** vs\nSM:1d8, L:1d8,\nbreaks on use}}AmmoData=[w:Glass Arrow+3,st:Bow,+:3,ru:-1,SM:1d8,L:1d8],[w:Glass Arrow+3,t:warbow,+:3,ru:-1,SM:1d10,L:1d10]{{Range=Varies by bow:\n**Longbow**\nPB:30 S:50 M:100 L:170\n**Shortbow**\nPB:30 S:40 M:80 L:150\n**Warbow**\nPB:30 S:70 M:120 L:210\n**Composite Lbow**\nPB:30 S:50 M:100 L:180\n**Composite Sbow**\nPB:30 S:50 M:100 L:150}}RangeData=[t:longbow,+:3,r:3/5/10/17],[t:shortbow,+:3,r:3/4/8/15],[t:warbow,+:3,r:3/7/12/21],[t:compositelongbow,+:3,r:3/5/10/18],[t:compositeshortbow:,+:3,r:3/5/10/17]{{desc=A magical Sheaf Arrow made of ultra-sharp glass. The arrows always shatter on use.}}'},
						{name:'Glass-arrow+10',type:'Ammo|Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Glass Sheaf Arrow+3}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Glass Arrow,Ammo,1H,Arrow],[Glass Arrow,Ammo,1H,Arrow]{{Ammo=+10 Piercing,\n**Warbow** vs\nSM:1d10, L:1d10\n**Other Bows** vs\nSM:1d8, L:1d8,\nbreaks on use}}AmmoData=[w:Glass Arrow+10,st:Bow,+:10,ru:-1,SM:1d8,L:1d8],[w:Glass Arrow+10,t:warbow,+:10,ru:-1,SM:1d10,L:1d10]{{Range=Varies by bow:\n**Longbow**\nPB:30 S:50 M:100 L:170\n**Shortbow**\nPB:30 S:40 M:80 L:150\n**Warbow**\nPB:30 S:70 M:120 L:210\n**Composite Lbow**\nPB:30 S:50 M:100 L:180\n**Composite Sbow**\nPB:30 S:50 M:100 L:150}}RangeData=[t:longbow,+:10,r:3/5/10/17],[t:shortbow,+:10,r:3/4/8/15],[t:warbow,+:10,r:3/7/12/21],[t:compositelongbow,+:10,r:3/5/10/18],[t:compositeshortbow:,+:10,r:3/5/10/17]{{desc=A magical Sheaf Arrow made of ultra-sharp glass. The arrows always shatter on use.}}'},
						{name:'Hand-Quarrel',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Hand Quarrel}}{{subtitle=Ammo}}{{Speed=As per crossbow}}{{Size=Tiny}}Specs=[Hand-Quarrel,Ammo,1H,Quarrel]{{Ammo=+0, vs SM:1d3, L:1d2, Piercing}}AmmoData=[w:Hand Quarrel,t:Hand Crossbow,+:0,SM:1d3,L:1d2]{{Range=PB:20, S:20, M:40, L:60}}RangeData=[t:Hand Crossbow,+:0,r:2/2/4/6]{{desc=A quarrel for a hand crossbow, of good quality but otherwise ordinary}}'},
						{name:'Heavy-Quarrel',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Heavy Quarrel}}{{subtitle=Ammo}}{{Speed=As per crossbow}}{{Size=Tiny}}Specs=[Heavy-Quarrel,Ammo,1H,Quarrel]{{Ammo=+0, vs SM:1d4+1, L:1d6+1, Piercing}}AmmoData=[w:Heavy Quarrel,t:Heavy Crossbow,+:0,SM:1+1d4,L:1+1d6],{{Range=PB:30 S:80 M:160 L:240}}RangeData=[t:Heavy Crossbow,+:0,r:3/8/16/24]{{desc=A quarrel for a heavy crossbow, of good quality but otherwise ordinary}}'},
						{name:'Heavy-Xbow-Bolt+2',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magic Crossbow Bolts}}{{subtitle=Magic Ammo}}{{Size=Tiny}}Specs=[Heavy-Quarrel,Ammo,1H,Quarrel]{{Ammo=+2, vs SM:1d4+1, L:1d6+1, no other bonuses}}AmmoData=[t:heavy-crossbow,st:heavy-crossbow,sb:0,+:2,SM:1+1d4,L:1+1d6]{{Range=PB:30 S:80 M:160 L:240}}RangeData=[t:heavy-crossbow,+:2,r:3/8/16/24]{{desc=Fine quality heavy crossbow bolts which are +2 on to-hit and damage. The tips are sharp and keen, and are very shiny.}}'},
						{name:'Indirect',type:'',ct:'0',charge:'uncharged',cost:'0',body:'@{'},
						{name:'Light-Quarrel',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Light Quarrel}}{{subtitle=Ammo}}{{Speed=As per crossbow}}{{Size=Tiny}}Specs=[Light Quarrel,Ammo,1H,Quarrel]{{Ammo=+0, vs SM:1d4, L:1d4}}AmmoData=[w:Light Quarrel,t:Light Crossbow,+:0,SM:1d4,L:1d4]{{Range=PB:30 S:60 M:120 L:180}}RangeData=[t:Light Crossbow,+:0,r:3/6/12/18]{{desc=A quarrel for a light crossbow, of good quality but otherwise ordinary}}'},
						{name:'Magic-Ammo',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Magical Ammo}}{{subtitle=Magic Ammo}}{{Speed=As per ranged weapon?}}{{Size=Small}}Specs=[Magic-Ammo,Ammo,1H,Ammo]{{To-hit=Unknown}}{{damage=Unknown}}{{desc=Magical Ammo of fine quality}}'},
						{name:'Magic-Heavy-Xbow-Bolts',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Magic Crossbow Bolts}}{{subtitle=Magic Ammo}}{{Size=Tiny}}Specs=[Magic-Ammo,Ammo,1H,Ammo]{{Ammo=[t:heavy-xbow,st:heavy-xbow,sb:0,+:2,SM:1+1d4,L:1+1d6]}}{{desc=Fine quality heavy crossbow bolts. The tips are sharp and keen, and are very shiny.}}'},
						{name:'Magical-Sheaf-Arrows',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Unknown Magical Sheaf Arrow}}{{subtitle=Magic Ammo}}{{Speed=As per bow?}}{{Size=Small}}Specs=[Magic-Ammo,Ammo,1H,Ammo]{{To-hit=Unknown}}{{damage=Unknown}}{{desc=A magical Sheaf Arrow of fine quality}}'},
						{name:'Manticore-Tail-Spikes',type:'Ranged',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Manticore Tail Spikes}}{{subtitle=Ammo}}{{Size=Tiny}}Specs=[Manticore Tail Spikes,Ranged,1H,Quarrel]{{Ammo=+1, vs SM:1d6, L:1d6, for a light crossbow with no other bonuses}}AmmoData=[t:light-crossbow,st:light-crossbow,sb:0,+:1,SM:1d6,L:1d6]{{Range=PB:30 S:60 M:120 L:180}}RangeData=[t:light-crossbow,+:2,r:3/6/12/18]{{desc=These Manticore Tail Spikes can be used as ammunition for a light crossbow with a +1 to hit \\amp on damage}}'},
						{name:'Needle',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Needle}}{{subtitle=Ammo for Blowgun}}{{Speed=As per blowgun}}{{Size=Tiny}}Specs=[Needle,Ammo,1H,Blowgun]{{Ammo=+0, vs SM:1, L:1, no bonuses}}AmmoData=[w:Needle,t:Blowgun,+:0,SM:1,L:1]{{Range=S:10, M:20, L:30}}RangeData=[t:Blowgun,+:0,r:1/2/3]{{desc=A Blowgun needle, tiny and sharp, of good quality but otherwise ordinary - careful! Perhaps dipped in poison?}}'},
						{name:'Sheaf-Arrow+1',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sheaf Arrow+1}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+1,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Sheaf Arrow+1,st:Bow,sb:1,+:1,SM:1d8,L:1d8],[w:Warbow Sheaf Arrow+1,t:warbow,sb:1,+:1,SM:1d10,L:1d10]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:1,r:3/5/10/17],[t:shortbow,+:1,r:3/5/10/15],[t:warbow,+:1,r:3/7/12/21],[t:compositelongbow,+:1,r:3/5/10/18],[t:compositeshortbow,+:1,r:3/5/10/17]}}{{desc=A magical Sheaf Arrow of fine quality}}'},
						{name:'Sheaf-Arrow+2',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sheaf Arrow+2}}{{subtitle=Magic Weapon}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+2,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Sheaf Arrow+2,st:Bow,sb:1,+:2,SM:1d8,L:1d8],[w:Warbow Sheaf Arrow+2,t:warbow,sb:1,+:2,SM:1d10,L:1d10]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:2,r:3/5/10/17],[t:shortbow,+:2,r:3/5/10/15],[t:warbow,+:2,r:3/7/12/21],[t:compositelongbow,+:2,r:3/5/10/18],[t:compositeshortbow,+:2,r:3/5/10/17]}}{{desc=A magical Sheaf Arrow of very fine quality}}'},
						{name:'Sheaf-Arrows',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sheaf Arrow}}{{subtitle=Ammo}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf-Arrow,Ammo,1H,Arrow]{{Ammo=+0,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Sheaf Arrow,st:Bow,sb:1,+:0,SM:1d8,L:1d8],[w:Warbow Sheaf Arrow,t:warbow,sb:1,+:0,SM:1d10,L:1d10]{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:0,r:3/5/10/17],[t:shortbow,+:0,r:3/5/10/15],[t:warbow,+:0,r:3/7/12/21],[t:compositelongbow,+:0,r:3/5/10/18],[t:compositeshortbow,+:0,r:3/5/10/17]}}{{desc=A Sheaf Arrow of good quality but otherwise ordinary}}'},
						{name:'Silver-Bullets',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Silver Bullet}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Silver Bullet,Ammo,1H,Bullet]{{Ammo=+0, vs SM:1d4+1, L:1d6+1, no bonuses}}[w:Silver Bullet,st:Sling,+:0,SM:1+1d4,L:1+1d6]{{Range=PB:30 S:40 M:80 L:160}}RangeData=[t:sling,+:0,r:3/4/8/16]{{desc=A Sling Bullet coated or made of silver of good quality but otherwise ordinary}}'},
						{name:'Silver-tipped-Sheaf',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Silver-Tipped Sheaf Arrow}}{{subtitle=Ammo}}{{Speed=As per bow}}{{Size=Small}}Specs=[Sheaf Arrow,Ammo,1H,Arrow]{{Ammo=+0,\n**Warbow** vs. SM:1d10, L:1d10,\n**Other Bows** vs. SM:1d8, L:1d8, Piercing}}AmmoData=[w:Silver Sheaf Arrow,st:Bow,+:0,SM:1d8,L:1d8],[w:Warbow Silver Sheaf Arrow,t:warbow,+:0,SM:1d10,L:1d10]}}{{Range=PB:30, others vary by bow\n**Shortbow:**\nS:50, M:100, L150,\n**Longbow:**\nS:50, M:100, L:170,\n**Warbow:**\nS70, M:120, L:210,\n**Composite Sbow:**\nS:50, M:100, L:170,\n**Composite Lbow:**\nS:70, M:100, L:180}}RangeData=[t:longbow,+:0,r:3/5/10/17],[t:shortbow,+:0,r:3/5/10/15],[t:warbow,+:0,r:3/7/12/21],[t:complbow,+:0,r:3/5/10/18],[t:compsbow:,+:0,r:3/5/10/17]5}}{{desc=A Sheaf Arrow of good quality with a silver tip, good against werecreatures}}'},
						{name:'Stone',type:'Ammo',ct:'0',charge:'uncharged',cost:'0',body:'/w "@{selected|character_name}" \\amp{template:2Edefault}{{name=Sling Stone}}{{subtitle=Ammo}}{{Speed=As per sling}}{{Size=Tiny}}Specs=[Stone,Ammo,1H,Bullet]{{Ammo=+0, no bonuses}}AmmoData=[w:Stone,st:Sling,+:0,SM:1+1d4,L:1+1d6]{{Range=PB:20 S:30 M:60 L:120}}RangeData=[t:sling,+:0,r:2/3/6/12]}}{{desc=A nicely rounded stone that can be used in a sling}}'},
						]},
	});
	
	var handouts = Object.freeze({
	AttackMaster_Help:	{name:'AttackMaster Help',
						 version:1.06,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">AttackMaster Help v1.04</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Attack Master API v'+version+'</h1>'
							+'<p>AttackMaster API provides functions to manage weapons, armour & shields, including taking weapons in hand and using them to attack.  It uses standard AD&D 2e rules to the full extent, taking into account: ranged weapon ammo management with ranges varying appropriately and range penalties/bonuses applied; Strength & Dexterity bonuses where appropriate; any magic bonuses to attacks that are in effect (if used with <b>RoundMaster API</b> effects); penalties & bonuses for non-proficiency, proficiency, specialisation & mastery; penalties for non-Rangers attacking with two weapons; use of 1-handed, 2-handed or many-handed weapons and restrictions on the number of weapons & shields that can be held at the same time; plus many other features.  This API works best with the databases provided with this API, which hold the data for automatic definition of weapons and armour.  However, some attack commands will generally work with manual entry of weapons onto the character sheet.  The <b>CommandMaster API</b> can be used by the GM to easily manage weapon proficiencies.</p>'
							+'<p>Specification for weapons, armour & shields are implemented as ability macros in specific database character sheets.  This API comes with a wide selection of weapon and armour macros, held in databases that are created and updated automatically when the API is run.  If the <b>MagicMaster API</b> is also loaded, it provides many more specifications for standard and magic items that are beneficial to melee actions and armour class.  The GM can add to the provided items in the databases using standard Roll20 Character Sheet editing, following the instructions provided in the relevant Database Help handout.</p>'
							+'<p><b><u>Note:</u></b> For some aspects of the APIs to work, the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs: <b>RoundMaster, InitiativeMaster, MagicMaster and CommandMaster</b>.  This will provide the most immersive game-support environment</p>'
							+'<h2>Syntax of AttackMaster calls</h2>'							+'<p>The AttackMaster API is called using !attk.</p>'							+'<pre>!attk --help</pre>'
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
							+'<dt>--attk-target</dt><dd>is only available to the GM.  It asks the GM to select a target token for the attack.  It then displays the AC the attack roll will hit and the AC of the selected target.  It also automatically rolls damage for Small/Medium and Large targets, and displays the current Hit Points for the targeted token.</dd></dl>'
							+'<p>The optional message is displayed as part of the display of the damage done on a successful hit.  If a monster, the message can be three concatenated messages separated by \'$$\'.  The message can include API Buttons if needed.  The following characters must be replaced (escaped) using these replacements:</p>'
							+'<table>'
							+'	<tr><th scope="row">Character</th><td>?</td><td>[</td><td>]</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td></tr>'
							+'	<tr><th scope="row">Substitute</th><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td>`</td><td>~</td><td>¦</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td></tr>'
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
							+'<p>This command displays a chat menu displaying what is currently in the Character\'s (or NPC or creature\'s) hands, and allowing the Player to change what is held to any weapon or shield that they have in their backpack.  Subsequent attacks will then use the newly specified weapon(s).  Selecting a ranged weapon that uses ammunition, the appropriate ammunition held in their backpack is also loaded into the character\'s “quiver”.</p>'
							+'<p>Selecting a hand (either Left or Right) will display any 1-handed weapons that can be used for selection in a list.  Selecting the Both Hands button will display all the 2-handed weapons (including bows) that can be used for selection in a list.  Some weapons can be used either 1-handed or 2-handed, and the appropriate stats will be given based on the selection made.</p>'
							+'<p>If being used by the GM, the menu also has an option to change the number of hands the creature has, which will then allow the creature to hold (and attack with) more than two items, or to hold items that require more than two hands.</p>'
							+'<p><b>Note:</b> this function is dependent on the weapon and shield definitions including certain key information in a specified format: see section 8 below.</p>'
							+'<h3>3.2 Manage a dancing weapon</h3>'
							+'<pre>--dance [token_id] | weapon  | [ STOP ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and an optional STOP command.</p>'
							+'<p>This command marks the named weapon as “dancing” which means it will no longer occupy a hand, but will still appear in the list of possible attacks when an attack is made.  When started, the --weapon command is automatically run so that an additional weapon can be taken in the freed-up hand.</p>'
							+'<p>Appending the “STOP” command will un-mark the weapon as dancing.  The Player will have to take the no-longer dancing weapon back in hand, if they so desire, using the --weapon command.</p>'
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
							+'<p>Takes an optional token ID (if not specified uses selected token), the unique name of the ammunition, an optional value for the current quantity, optionally preceded by +/- or replaced by an =, an optional value for the maximum quantity with the same +/- & = possibilities, and an optional parameter of “Silent” (case insensitive).</p>'
							+'<p>This command allows programmatic or macro alteration of the quantity of a type of ammo:</p>'
							+'<ul><li>The current quantity and/or the maximum held (i.e. the amount to which ammunition can be recovered up to - see section 4.1 Ammunition Recovery, above) can be set to absolute values just by entering numbers for the parameters.</li>'
							+'<li>Either parameter can be preceded by a + or -, in which case the parameter will modify the corresponding current value, rather than replacing it.</li>'
							+'<li>Either parameter can be an = by itself.  In this instance, the corresponding value is set to the other corresponding value (after any modification) i.e. putting = for cur_qty sets the current quantity held to be the maximum possible, or putting = for max_qty sets the maximum possible to be the current quantity.  Putting = for both does nothing.</li>'
							+'<li>No value can go below 0, and the current quantity will be constrained at or below the maximum quantity.</li></ul>'
							+'<p>So, for example, this command will set the maximum quantity to 10 and set the current quantity to be equal to it:</p>'
							+'<pre>!attk -setammo @{selected|token_id}|Flight-Arrow+1|=|10|silent</pre>'
							+'<p>If the “Silent” parameter is not specified, then the Ammunition Recovery chat menu will display with the amended values once complete, and a message is displayed with the changes that occurred.</p>'
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
							+'<p>Takes an optional token ID (if not specified uses selected token), an optional “Silent” command, and an optional damage type which can be “SADJ”, “PADJ” or “BADJ” (the “Silent” and damage type parameters are not case sensitive).</p>'
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
							+'<p>The first form shows all the possible saves that can be made, the saving through that needs to be achieved to make the save, and any modifiers that apply to this particular character.  There are buttons to modify the saving throw table and the modifiers, and/or to apply a “situational modifier” to immediate saving throws (the “situational modifier” only applies to current rolls and is not remembered).  Also, each type of saving throw can actually be made by clicking the buttons provided.  Doing so effectively runs the second form of the command.</p>'
							+'<p>The situational modifier can optionally be passed in as a value with the command call if so desired, instead of selecting via the button on the menu.</p>'
							+'<p>Running the second form of the command (or selecting to make a saving throw from the first form\'s menu) will execute the saving throw (as a dice roll if this is specified instead of a straight value) of the specified type, using the data in the character\'s saving throw table to assess success or failure, displaying the outcome and the calculation behind it in the chat window.</p>'
							+'<br>'
							+'<h2>6.Other commands</h2>'
							+'<h3>6.1 Display help on these commands</h3>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h3>6.2 Check database completeness & integrity</h3>'
							+'<pre>--check-db [ db-name ]</pre>'
							+'<p>Takes an optional database name or part of a database name: if a partial name, checks all character sheets with the provided text in their name that also have \'-db\' as part of their name.  If omitted, checks all character sheets with \'-db\' in the name.  Not case sensitive.  Can only be used by the GM.</p>'
							+'<p>This command finds all databases that match the name or partial name provided (not case sensitive), and checks them for completeness and integrity.  The command does not alter any ability macros, but ensures that the casting time (\'ct-\') attributes are correctly created, that the item lists are sorted and complete, and that any item-specific power & spell specifications are correctly built and saved.</p>'
							+'<p>This command is very useful to run after creating/adding new items as ability macros to the databases (see section 8 below).  It does not check if the ability macro definition itself is valid, but if it is then it ensures all other aspects of the database consistently reflect the new ability(s).</p>'
							+'<h3>6.3 Handshake with other APIs</h3>'
							+'<pre>-hsq from|[command]<br>'
							+'-handshake from|[command]</pre>'
							+'<p>Either form performs a handshake with another API, whose call (without the \'!\') is specified as <i>from</i> in the command parameters (the response is always an <b>-hsr</b> command).  The command calls the <i>from</i> API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>'
							+'<dl><dt>Received:</dt><dd><i>!attk -hsq init</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr attk</i></dd></dl>'
							+'<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the <i>command</i> string parameter is added, where <i>command</i> is the RoundMaster command (the \'--\' text without the \'--\').  This will respond with a <i>true/false</i> response: e.g.</p>'
							+'<dl><dt>Received:</dt><dd><i>!attk -handshake init|menu</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr attk|menu|true</i></dd></dl>'
							+'<h3>6.4 Switch on or off Debug mode</h3>'
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
							+'<p>The system handles both Ranged weapons that take ammunition, such as bows and slings, and also “self-ammoed” Ranged weapons like daggers, that can be thrown at a target.  The quantity of ammunition or self-ammoed weapons is managed by the system: as they are used in attacks, the quantity in the Characters Item table decreases.  A menu can be called to recover ammunition, in agreement with the DM - the same menu can be used to add or remove quantities of ammunition for other reasons (such as being purchased).  Some types of ammo always breaks and can\'t be recovered (for example glass arrows) - this is charged ammo.</p>'
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
						 version:1.04,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">RPGMaster CharSheet Setup v1.03</span>'
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
							+'<p>These assignments can be changed in each API, by changing the fields object near the top of the API script (<b>note:</b> no underscore, and \'bar#\' and \'value\' or \'max\' are separate entries in an array of 2 elements).  <b><i><u>All APIs must use the same field definitions</u></i></b>:</p>'
							+'<pre>fields.Token_AC:	defines the token field for the AC value (normally [\'bar1\',\'value\'])<br>'
							+'fields.Token_MaxAC:	defines the token field for the AC max (normally [\'bar1\',\'max\'])<br>'
							+'fields.Token_Thac0:	defines the token field for the Thac0 value (normally [\'bar2\',\'value\'])<br>'
							+'fields.Token_MaxThac0: defines the token field for the Thac0 max (normally [\'bar2\',\'max\'])<br>'
							+'fields.Token_HP:	defines the token field for the HP value (normally [\'bar3\',\'value\'])<br>'
							+'fields.Token_MaxHP:	defines the token field for the HP max (normally [\'bar3\',\'max\'])</pre>'
							+'<p>Alter the bar numbers appropriately or, <b><u><i>if you are not wanting one or more of these assigned</i></u></b>: leave the two elements of the array as [\'\',\'\'].  The system will generally work fine with reassignment or no assignment, but not always.  Specifically, some effects in the Effects-DB, which implement spell effects on Character Sheets and Tokens, may not set the right values if no assignment of one or more of HP, AC & Thac0 are made to the Token.</p>'
							+'<br>'
							+'<h3>2. Use with various game system character sheets</h3>'
							+'<p>The API issued is initially set up to work with the AD&D 2E character sheet (as this is what the author mostly plays).  However, it can be set up for any character sheet.  In the AttackMaster API code, right at the top, is an object definition called \'fields\': see section 3 for details.  This can be altered to get the API to work with other character sheets.</p>'
							+'<p>The coding of the API is designed to use the AD&D 2E system of attack calculations, armour class values and saving throw management.  If you use another system (e.g. the D&D 5e system) the API coding will need to change.  This might be a future enhancement.</p>'
							+'<h3>3. Matching the API to a type of Character Sheet</h3>'
							+'<p>The API has an object definition called \'fields\', which contains items of the form </p>'
							+'<pre>Internal_api_name: [sheet_field_name, field_attribute, optional_default_value, optional_set_with_worker_flag]</pre>'
							+'<p>A typical example might be:</p>'
							+'<pre>Fighter_level:[\'level-class1\',\'current\'],<br>'
							+'Or<br>'
							+'MUSpellNo_memable:[\'spell-level-castable\',\'current\',\'\',true],</pre>'
							+'<p>Table names are slightly different: always have an <i>internal_api_name</i> ending in \'_table\' and their definition specifies the repeating table name and the index of the starting row of the table or -1 for a static field as the 1<sup>st</sup> row.</p>'
							+'<p><i>Internal_api_table: [sheet_repeating_table_name,starting_index]</i></p>'
							+'<p>An example is:</p>'
							+'<pre>MW_table:[\'repeating_weapons\',0],</pre>'
							+'<p>The <i>internal_api_name</i> <b><u>must not be altered!</b></u> Doing so will cause the system not to work.  However, the <i>sheet_repeating_table_name</i> and <i>starting_index</i> can be altered to match any character sheet.</p>'
							+'<p>Each character sheet must have repeating tables to hold weapons, ammo and magic items.  By default, melee weapons \'in hand\' are held in sections of the repeating_weapons table, melee weapon damage in the repeating_weapons-damage table, ranged weapons in the repeating_weapons2 table, ammo in the repeating_ammo table, and magic items are held in the repeating_potions table.  The table management system provided by the API expands and writes to repeating attributes automatically, and the DM & Players do not need to worry about altering or updating any of these tables on the Character Sheet. </p>'
							+'<h3>4. Character Attributes, Races, Classes and Levels</h3>'
							+'<p>Character Attributes of <i>Strength, Dexterity, Constitution, Intelligence, Wisdom</i> and <i>Charisma</i> are generally not directly important to the AttackMaster API, but the resulting bonuses and penalties are.  All Attributes and resulting modifiers should be entered into the Character Sheet in the appropriate places (that is in the Character Sheet fields identified in the \'fields\' API object as noted in section 2 above).</p>'
							+'<p>The Character\'s race is also important for calculating saves and ability to use certain items.  The race should be set in the appropriate Character Sheet field.  Currently, the races <i>\'dwarf\', \'elf\', \'gnome\', \'halfelf\', \'halfling\', \'half-orc\'</i> and <i>\'human\'</i> are implemented (not case sensitive, and spaces, hyphens and underscores are ignored).  If not specified, <i>human</i> is assumed.  The race impacts saves, some magic items and armour, and bonuses on some attacks.</p>'
							+'<p>The system supports single-class and multi-class characters.  Classes must be entered in the appropriate fields on the Character Sheet.  Classes and levels affect spell casting ability, ability to do two-weapon attacks with or without penalty, and the ability to backstab and the related modifiers, among other things.  Class and level also determine valid armour, shields, some magic items and saves.</p>'
							+'<p><b>Note:</b> on the Advanced D&D 2e Character Sheet, Fighter classes must be in the first class column, Wizard classes in the second column, Priest classes in the third, Rogues in the fourth, and Psions (or any others) in the fifth.  It is important that these locations are adhered to.</p>'
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
							+'<p>The best (and easiest) way to give a Character or NPC spells and powers is to use the <b>MagicMaster API</b>.  However, for the purposes of just doing initiative and selecting which spell to cast in the next round, the spells and powers can be entered manually onto the character sheet.  Spells are held in the relevant section of the Spells table, which by default is set to the character sheet spells table, <i>repeating_spells</i>.  As with other fields, this can be changed in the <i>\'fields\'</i> object.  Note that on the Advanced D&D 2e character sheet Wizard spells, Priest spells & Powers are all stored in various parts of this one very large table.</p>'
							+'<p>If you are just using the character sheet fields to type into, add spells (or powers) to the relevant “Spells Memorised” section (using the [+Add] buttons to add more as required) <b>a complete row at a time</b> (that is add columns before starting the next row).  Enter the spell names into the “Spell Name” field, and “1” into each of the “current” & “maximum” “Cast Today” fields - the API suite <i>counts down</i> to zero on using a spell, so in order for a spell to appear as available (not greyed out) on the initiative menus, the “current” number left must be > 0.  This makes spells consistent with other tables in the system (e.g. potion dose quantities also count down as they are consumed, etc).</p>'
							+'<p>Then, you need to set the “Spell Slots” values on each level of spell to be correct for the level of caster.  Just enter numbers into each of the “Level”, “Misc.” and “Wisdom” (for Priests) fields, and/or tick “Specialist” for the Wizard levels as relevant.  This will determine the maximum number of spells memorised each day, that will appear in the spells Initiative Menu.  Do the same for Powers using the “Powers Available” field.  As with other fields on the character sheet, each of these fields can be re-mapped by altering the <i>\'fields\'</i> object in the APIs.</p>'
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
						 version:1.04,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">Weapon & Armour Database Help v1.03</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Weapon and Armour Databases</h1>'
							+'<h6><i>for AttackMaster v'+version+'</i></h6>'
							+'<h2>1. General Database information</h2>'
							+'<p>The RPGMaster APIs use a number of Character Sheets as databases to hold Ability Macros defining weapons, ammo, and items of armour and their specifications.  The API is distributed with many weapon, ammo and armour definitions and it also checks for, creates and updates these Character Sheet databases on start-up.  DMs can add their own weapons, ammo and armour to additional databases, but the databases provided are totally rewritten when new updates are released so the DM must add their own database sheets.  If the <i>provided</i> databases are accidentally deleted, they will be automatically recreated the next time the Campaign is opened. Additional databases should be named as follows:</p>'
							+'<table><tr><td>Weapons:</td><td>additional databases: MI-DB-Weapons-[added name] where [added name] can be replaced with anything you want.</td></tr>'
							+'<tr><td>Ammo:</td><td>additional databases: MI-DB-Ammo-[added name] where [added name] can be replaced with anything you want.</td></tr>'
							+'<tr><td>Armour:</td><td>additional databases: MI-DB-Armour-[added name] where [added name] can be replaced with anything you want.</td></tr></table>'
							+'<p><b>However:</b> the system will ignore any database with a name that includes a version number of the form “v#.#” where # can be any number or group of numbers e.g. MI-DB v2.13 will be ignored.  This is so that the DM can version control their databases, with only the current one (without a version number) being live.</p>'
							+'<p>There can be as many additional databases as you want.  Other Master series APIs come with additional databases, some of which overlap - this does not cause a problem as version control and merging unique macros is managed by the APIs.</p>'
							+'<p><b>Important Note:</b> all Character Sheet databases <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  This must be for all databases, both those provided (set by the API) and any user-defined ones.  Otherwise, Players will not be able to run the macros contained in them.</p>'
							+'<p>Each database has a similar structure, with:</p>'
							+'<ul><li>Ability Macros named as the weapon, ammo or armour specified, and used to describe and provide specifications for using the commands with the AttackMaster API;</li>'
							+'<li>Custom Attributes with the attribute name “ct-ability-macro-name”, one per Ability Macro, which defines the speed and type for each item;</li>'
							+'<li>An entry in a list on the character sheet in the spell book of the relevant Character Sheet tab (various spell books for different items - see entry below);</li>'
							+'<li>Optionally, some entries come also with attributes that define Powers and Spells delivered by or stored on the item.</li></ul>'
							+'<p><b>Note:</b> a DM only needs to program the Ability Macro using the formats shown in the next section, and then run the <b>!attk --check-db</b> or <b>!magic --check-db</b> command, which will correctly parse the ability macro and set the rest of the database entries as needed.</p>'
							+'<p>Ability Macros can be whatever the DM wants and can be as simple or as complex as desired. Roll Templates are very useful when defining ability macros.  When a Player or an NPC or Monster views the specifications of a weapon, ammunition or piece of armour, the APIs run the relevant Ability Macro from the databases as if it had been run by the Player from the chat window.  All Roll20 functions for macros are available.</p>'
							+'<h2>2. Weapon & Ammunition Databases</h2>'
							+'<p>Weapon databases are all character sheets that have names that start with MI-DB-Weapon (though in fact, weapons can be in any database starting with MI-DB- if desired), and can have anything put at the end, though those with version numbers of the form v#.# as part of the name will be ignored.  Ammunition databases are similar, with the root database MI-DB-Ammo.</p>'
							+'<p>As previously stated, each weapon definition has 3 parts in the database (see Section 1): an Ability Macro with a name that is unique and matches the weapon, an Attribute with the name of the Ability Macro preceded by “ct-“, and a listing in the database character sheet of the ability macro name separated by \'|\' along with other weapons. The quickest way to understand these entries is to examine existing entries.  Do go to the root databases and take a look (but be careful not to alter anything unless you know what you\'re doing!)</p>'
							+'<p><b>Note:</b> The DM creating new weapons does not need to worry about anything other than the Ability Macro in the database, as running the <b>AttackMaster</b> or <b>MagicMaster -check-db MI-DB-Weapons</b> command will update all other aspects of the database appropriately for all databases that have a name starting with or including <i>\'MI-DB-Weapons\'</i>, as long as the <i>Specs</i> and <i>Data</i> fields are correctly defined. Use the parameter <i>\'MI-DB-Ammo\'</i> to check and update the ammunition databases.  Running the command <b>-check-db</b> with no parameters will check and update all databases.</p>'
							+'<p>Ability macros can be added to a database just by using the [+Add] button at the top of the Abilities column in the Attributes and Abilities tab of the Database Character Sheet, and then using the edit “pencil” icon on the new entry to open it for editing.  Ability macros are standard Roll20 functionality and not dependent on the API.  Refer to the Roll20 Help Centre for more information.</p>'
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
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Warhammer}}{{subtitle=Hammer/Club}} {{Speed=[[4]]}}{{Size=Medium}}{{Weapon=1-handed melee or thrown club}}<mark style="color:green">Specs=[Warhammer,Melee,1H,Club],[Warhammer,Ranged,1H,Club]</mark>{{To-hit=+0 + Str & Dex bonus}}<mark style="color:blue">ToHitData=[w:Warhammer, sb:1, +:0, n:1, ch:20, cm:1, sz:M, ty:B, r:5, sp:4],[ w:Warhammer, sb:1, db:1,  +:0, n:1, ch:20, cm:1, sz:M, ty:B, sp:4]</mark>{{Attacks=1 per round + level & specialisation, Bludgeoning}}{{Damage=+0, vs SM:1d4+1, L:1d4, + Str bonus}}<mark style="color:red">DmgData=[ w:Warhammer, sb:1, +:0, SM:1+1d4, L:1d4][]</mark>{{Ammo=+0, vs SM:1d4+1, L:1d4, + Str bonus}}<mark style="color:orange">AmmoData=[w:Warhammer,t:Warhammer,st:Throwing-club,sb:1,+:0,SM:1+1d4,L:1d4]</mark>{{Range=S:10, M:20, L:30}}<mark style="color:purple">RangeData=[t:Warhammer,+:0,r:1/2/3]</mark>{{desc=This is a normal warhammer. The blade is sharp and keen, but nothing special.}}</p>'
							+'<p>A melee weapon that can also be thrown, and is its own ammunition, is termed a “self-ammoed” weapon.  Its definition combines the data elements of both melee weapons, ranged weapons and ammunition.</p>'
							+'<pre>Specs=[Warhammer,Melee,1H,Club],[Warhammer,Ranged,1H,Club]</pre>'
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
							+'<tr><td><b>pd:</b></td><td><-1 / #>  Number per day, or -1 for “use at will”  </td></tr></table>'
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
							+'<p><b>Note:</b> Armour that fits on the body generally does not take any hands to hold, and so the third field, <i>Handedness</i>, is set to “0H”.</p>'
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
							+'<tr><td><b>rc:</b></td><td><recharging/curse type> Armour can be “cursed”, but generally does not have charges. Default is “uncharged”.  See MagicMaster API documentation for more information on charges and curses.</td></tr></table>'
							+'<br>'
							+'<h3>Shield+2</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">/w "@{selected|character_name}" &{template:2Edefault}{{name=Shield+2}}{{subtitle=Shield}}{{Shield=1-handed +2 Medium Shield made of wood & metal}}<mark style="color:green">Specs=[Medium Shield,Shield,1H,Shield]</mark>{{AC=+[[2]] against all attacks from the front}}<mark style="color:blue">ACData=[a:Medium Shield+2, st:Shield, +:2,sz:M, wt:10]</mark> {{Speed=[[0]]}} {{Size=M}} {{Immunity=None}} {{Saves=No effect}} {{desc=All shields improve a character\'s Armor Class by 1 or more against a specified number of attacks. A shield is useful only to protect the front and flanks of the user. Attacks from the rear or rear flanks cannot be blocked by a shield (exception: a shield slung across the back does help defend against rear attacks). The reference to the size of the shield is relative to the size of the character. Thus, a human\'s small shield would have all the effects of a medium shield when used by a gnome.<br>'
							+'*The medium shield* is carried on the forearm and gripped with the hand. Its weight prevents the character from using his shield hand for other purposes. With a medium shield, a character can protect against any frontal or flank attacks.}}</p>'
							+'<p>As can be seen here, the specification for a Shield is almost identical in structure to that of any other armour, the major difference being in the Specs section type field.</p>'
							+'<p><b>Note:</b> The <b>ac:</b> field in the data section for a shield is always assumed to be “+1”, meaning a shield adds 1 to the base AC before magical adjustments are taken into account.  However, it can be specified as a different value, if desired.</p>'
							+'<p><b>Note:</b> All shields except a <i>Buckler</i> must be taken in hand using the <b>!attk --weapon</b> command before the Armour Class system of the AttackMaster API adds it to the AC for the character.  A <i>buckler</i> is a special type of very small shield that is strapped to the arm and can counter only 1 blow per melee round, but allows both (all) hands to be free.  In fact, any shield can have this functionality if desired, by setting the handedness field of the Specs section to be “0H”, meaning it take no hands to hold it.</p>'
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
							+'<tr><td>	3H</td><td>A weapon that takes 3 hands…</td></tr>'
							+'<tr><td>	4H</td><td>Etc (e.g. a siege weapon that needs 2 people to operate it)</td></tr>'
							+'<tr><td>	…</td><td>…</td></tr></table>'
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
							+'<p>	0H		Armour and Shields that are not held in the hand (e.g. a Buckler or a Helm)'
							+'	1H		Generally a type of Shield that must be held in a hand'
							+'	2H		Armour and Shields that use two hands, and/or prevent use of those hands for other things'
							+'	3H		Generally siege engines that shield against attacks… (not yet implemented)'
							+'	…		etc.</p>'
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
	});
	

	const miTypeLists = {
		miscellaneous:	{type:'miscellaneous',field:fields.ItemMiscList},
		light:			{type:'miscellaneous',field:fields.ItemMiscList},
		weapon:			{type:'weapon',field:fields.ItemWeaponList},
		melee:			{type:'weapon',field:fields.ItemWeaponList},
		ranged:			{type:'weapon',field:fields.ItemWeaponList},
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
	};
	
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

	var reIgnore = /[\s\-\_]*/gi;
	
	var	replacers = [
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
			[/\\amp[^;]/g, "&"],
		];
		
	var	dbReplacers = [
			[/\\lbrak/g, "["],
			[/\\rbrak/g, "]"],
			[/\\ques/g, "?"],
			[/\\at/g, "@"],
			[/\\dash/g, "-"],
			[/\\n/g, "\n"],
			[/\\vbar/g, "|"],
			[/\\clon/g, ":"]
		];

	var classLevels = [[fields.Fighter_class,fields.Fighter_level],
					   [fields.Wizard_class,fields.Wizard_level],
					   [fields.Priest_class,fields.Priest_level],
					   [fields.Rogue_class,fields.Rogue_level],
					   [fields.Psion_class,fields.Psion_level],
					   [fields.Fighter_class,fields.Monster_hitDice]];
	
	var rangedWeapMods = Object.freeze({
		N	: -5,
		PB	: 2,
		S	: 0,
		M	: -2,
		L	: -5,
		F	: -20,
	});
	
	var classNonProfPenalty = [[fields.Fighter_level,-2],
                              [fields.Wizard_level,-5],
	                          [fields.Priest_level,-3],
	                          [fields.Rogue_level,-3]];
	
	var raceToHitMods = Object.freeze({
		elf: [['bow',1],['longsword',1],['shortsword',1]],
		halfling: [['sling',1],['thrown-blade',1]],
	});
	
	var classAllowedWeaps = Object.freeze({
		warrior: ['any'],
		fighter: ['any'],
		ranger: ['any'],
		paladin: ['any'],
		beastmaster: ['any'],
		barbarian: ['any'],
		defender: ['axe','club','flail','longblade','fencingblade','mediumblade','shortblade','polearm'],
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
		priest:	['club','mace','hammer','staff'],
		cleric:	['club','mace','hammer','staff'],
		druid: ['club','sickle','dart','spear','dagger','scimitar','sling','staff'],
		healer: ['club','quarterstaff','mancatcher','sling'],
		priestoflife: ['club','quarterstaff','mancatcher','sling'],
		priestofwar: ['any'],
		priestoflight: ['dart','javelin','spear'],
		priestofknowledge: ['sling','quarterstaff'],
		shaman: ['longblade','mediumblade','shortblade','blowgun','club','staff','shortbow','horsebow','handxbow'],
		rogue: ['club','shortblade','dart','handxbow','lasso','shortbow','sling','broadsword','longsword','staff'],
		thief: ['club','shortblade','dart','handxbow','lasso','shortbow','sling','broadsword','longsword','staff'],
		bard: ['any'],
		assassin: ['any'],
	});
	
	var classAllowedArmour = Object.freeze({
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
		priestoflife: ['any'],
		priestofwar: ['any'],
		priestoflight: ['studdedleather','ringmail','chainmail','shield','ring','magicitem','cloak'],
		priestofknowledge: ['magicitem','ring','cloak'],
		shaman: ['padded','leather','hide','brigandine','ringmail','scalemail','chainmail','splintmail','bandedmail','shield','ring','magicitem','cloak'],
		rogue: ['padded','leather','studdedleather','elvenchain'],
		thief: ['padded','leather','studdedleather','elvenchain'],
		bard: ['padded','leather','hide','brigandine','ringmail','scalemail','chainmail','ring','magicitem','cloak'],
		assassin: ['any'],
	});
	
	var weapMultiAttks = Object.freeze ({
		Proficient: { melee: ['+0','+1/2','+1'],
					  ranged: ['+0','+0','+0'],
		},
		Specialist: { melee: ['+1/2','+1','+3/2'],
					  lightxbow: ['+0','+1/2','+1'],
					  heavyxbow: ['+0','+1/2','+1'],
					  throwndagger: ['+1','+2','+3'],
					  throwndart: ['+1','+2','+3'],
					  bow: ['+0','+0','+0'],
					  arquebus: ['+1/3','+2/3','+7/6'],
					  blowgun: ['+1','+2','+3'],
					  knife: ['+1','+2','+3'],
					  sling: ['+1','+2','+3'],
					  ranged: ['+0','+1/2','+1'],
		}
	});
	
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

	var reWeapSpecs = Object.freeze ({
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
	});
	
	var reACSpecs = Object.freeze ({
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
	});
	
	var reSpellSpecs = Object.freeze ({
		name:		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+]+?)[,\]]/i},
		type:		{field:'spell',def:'',re:/[\[,\s]cl:(PR|MU|PW)[,\s\]]/i},
		speed:		{field:'speed',def:0,re:/[\[,\s]sp:([d\d\+\-]+?)[,\s\]]/i},
		level:		{field:'level',def:1,re:/[\[,\s]lv:(\d+?)[,\s\]]/i},
		perDay:		{field:'perDay',def:1,re:/[\[,\s]pd:(\d+?)[,\s\]]/i},
		cost:		{field:'cost',def:0,re:/[\[,\s]gp:(\d+?\.?\d*?)[,\s\]]/i},
		recharge:	{field:'type',def:'uncharged',re:/[\[,\s]rc:([\-\w]+?)[,\s\]]/i},
	});
	
	var apiCommands = {};
	
	var flags = {
		image: false,
		archive: false,
		dice3d: true,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
	};
	
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
		if (!state.attackMaster.attrsToCreate)
			{state.attackMaster.attrsToCreate = {};}
		if (!state.attackMaster.twoWeapons)
		    {state.attackMaster.twoWeapons = {};}
		if (!state.magicMaster.playerConfig)
			{state.magicMaster.playerConfig={};}
		if (!state.attackMaster.debug)
		    {state.attackMaster.debug = false;}
			
		log(`-=> attackMaster v${version} <=-`);
		
		// Handshake with other APIs to see if they are loaded
		setTimeout( cmdMasterRegister, 4000 );
		setTimeout( () => issueHandshakeQuery('magic'), 4000);
		setTimeout( () => issueHandshakeQuery('money'), 4000);
		setTimeout( () => updateHandouts(true,findTheGM()), 4000);

		// Once all is settled build or update the Weapon & Armour dBs
		// Might already be done, if MagicMaster API already loaded
		setTimeout( () => doUpdateDB(['silent']), 9000);
	
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
//		log('AttackMaster issuing handshake to '+api+((cmd && cmd.length) ? (' for command '+cmd) : ''));
		sendAttkAPI(handshake);
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
        var val, name = attrDef[0];
        if (_.isUndefined(retObj)) {
			retObj=false;
		} else if (retObj === true) {
			defVal=false;
		}
		if (_.isUndefined(defVal)) {
			defVal=true;
		}
		if (tableObj[name]) {
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
    	        value = tableObj.values[attrDef[0]] || {current:'', max:''};
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
		    
		if ((index < 0) || !_.isUndefined(tableLookup( tableObj, fields[fieldGroup+'name'], index, false ))) {
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
		match=name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let index=match[2],
				tableObj = getTable(character,{},tableDef,attrDef,c,caseSensitive);
			if (tableObj)
				tableObj = tableSet(tableObj,attrDef,r,attrValue);
			attrObj = tableLookup(tableObj,attrDef,r,false,true);
		
		} else {
			attrObj = attrLookup( character, [name, null], null, null, null, caseSensitive );
			if (!attrObj) {
				attrObj = createObj( 'attribute', {characterid:character.id, name:attrDef[0]} );
			}
			if (_.isUndefined(attrDef)) {
				log('setAttr attrDef corrupted:'+attrDef);
				sendDebug('setAttr attrDef corrupted:'+attrDef);
				return undefined;
			}
			sendDebug( 'setAttr: character ' + character.get('name') + ' attribute ' + attrDef[0] + ' ' + attrDef[1] + ' set to ' + attrValue );
			if (attrDef[3]) {
				attrObj.setWithWorker( attrDef[1], attrValue );
			} else {
				attrObj.set( attrDef[1], String(attrValue) );
			}
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
	 **/
	 
	var abilityLookup = function( rootDB, abilityName, silent=false ) {
	    
        abilityName = abilityName.toLowerCase().replace(reIgnore,'');
        rootDB = rootDB.toLowerCase();
        if (!abilityName || abilityName.length==0) {
			return {dB: rootDB, obj: undefined, ct: undefined};
        }
	    
        var dBname, ctObj, found = false,
			magicDB, magicName, abilityObj = [];

		filterObjs(function(obj) {
			if (found) return false;
			if (obj.get('type') != 'ability') return false;
			if (obj.get('name').toLowerCase().replace(reIgnore,'') != abilityName) return false;
			if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
			magicName = magicDB.get('name');
			if ((magicName.toLowerCase().indexOf(rootDB) !== 0) || (/\s*v\d*\.\d*/i.test(magicName))) return false;
			if (!dbNames[magicName.replace(/-/g,'_')]) {
				dBname = magicName;
				found = true;
			} else if (!dBname) dBname = magicName;
			abilityObj[0] = obj;
			return true;
		});
		if (!abilityObj || abilityObj.length === 0) {
			if (!silent) sendError('Not found ability '+abilityName);
			dBname = rootDB;
		} else {
			found = false;
			// Must use a filterObjs() as ignoring reIgnore character set
			ctObj = filterObjs(function(obj) {
						if (found) return false;
						if (obj.get('type') != 'attribute') return false;
						if (obj.get('name').toLowerCase().replace(reIgnore,'') != ('ct'+abilityName)) return false;
						return found = (obj.get('characterid') == abilityObj[0].get('characterid'));
			});
			if (!silent && (!ctObj || ctObj.length === 0)) {sendError('Can\'t find ct-'+abilityName+' in '+dBname);}
		}
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
				if (!silent) {
					sendFeedback(msg); 
				} else {
					log(msg);
				}
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
		
		dbFullName = dbFullName.replace(/_/g,'-');
		
		var dbName = dbFullName.toLowerCase(),
			dbCS = findObjs({ type:'character', name:dbFullName },{caseInsensitive:true}),
			dbVersion = 0.0,
			errFlag = false,
			lists = {},
			foundItems = [],
			csDBlist, specs, objType, objBody,
			spells = dbName.toLowerCase().includes('spell') || dbName.toLowerCase().includes('power'),
			typeList = (spells ? spTypeLists : miTypeLists),
			rootDB = dbObj.root.toLowerCase(),
			msg, versionObj, curDB;
		
		if (!checkDBver( dbFullName, dbObj, silent )) return false; 

		if (dbCS && dbCS.length) {
			dbCS[0].remove();
		}
		dbCS = createObj( 'character', {name:dbFullName} );
		
		_.each(_.sortBy(dbObj.db,'name'),function( item ) {
			if (foundItems.includes(item.name)) return;
			foundItems.push(item.name);
			item.body = parseStr(item.body,dbReplacers);
			// If the effect to be written already exists but not
			// in the database to be updated, don't write it.  This
			// allows the user to create new versions, but only in
			// their own databases
			curDB = abilityLookup( dbObj.root, item.name, true ).dB.toLowerCase();
			if (curDB != rootDB) {
				if (curDB != dbName) return;
			} else if (curDB.obj && curDB.obj[0] && dbName != rootDB) {
				curDB.obj[0].remove();
			}
			
			if (!setAbility( dbCS, item.name, item.body )) {
				errFlag = true;
			} else {
				setAttr( dbCS, [fields.CastingTimePrefix[0]+item.name, 'current'], item.ct );
				setAttr( dbCS, [fields.CastingTimePrefix[0]+item.name, 'max'], (spells ? item.cost : item.charge) );
				addMIspells( dbCS, item );
				_.each(item.type.replace(reIgnore,'').toLowerCase().split('|'),type => {
					if (type && type.length && typeList[type]) {
						type = typeList[type].type.toLowerCase();
						if (!lists[type]) lists[type] = [];
						lists[type].push(item.name);
					} else if (type && type.length && !typeList[type]) {
						sendError('Unable to identify item type '+type+' when updating '+item.name+' in database '+dbFullName);
					};
				});
			};
		});
		if (errFlag) {
			sendError( 'Unable to completely update database '+dbName );
		} else {
			_.each(typeList, dbList => setAttr( dbCS, [dbList.field[0],'current'], (lists[dbList.type.toLowerCase] || ['']).join('|')));
			setAttr( dbCS, fields.dbVersion, dbObj.version );
			dbCS.set('avatar',dbObj.avatar);
			dbCS.set('bio',dbObj.bio);
			dbCS.set('controlledby',dbObj.controlledby);
			dbCS.set('gmnotes',dbObj.gmnotes);
			let msg = 'Updated database '+dbName+' to version '+String(dbObj.version);
			if (!silent) sendFeedback( msg ); else log(msg);
		}
		return !errFlag;
	}
	
	/*
	 * Update  databases to latest versions held in API
	 */
 
	var doUpdateDB = function(args) {
		
		var silent = (args[0] || '').toLowerCase() == 'silent',
			dbName = args[1];
			
		if (dbName && dbName.length) {
			let dbLabel = dbName.replace(/-/g,'_');
			if (!dbNames[dbLabel]) {
				sendError('Not found database '+dbName);
			} else {
				log('Updating database '+dbName);
				sendFeedback('Updating database '+dbName);
				buildCSdb( dbName, dbNames[dbLabel], silent );
			}
		} else if (_.some( dbNames, (db,dbName) => checkDBver( dbName, db, silent ))) {
			log('Updating all AttackMaster databases');
			if (!silent) sendFeedback('Updating all AttackMaster databases');
			_.each( dbNames, (db,dbName) => {
				let dbCS = findObjs({ type:'character', name:dbName.replace(/_/g,'-') },{caseInsensitive:true});
				if (dbCS && dbCS.length) {
					dbCS[0].remove();
				}
			});
			// Have to remove all pre-defined databases before updating them
			// so that moves can happen without causing duplicates
			_.each( dbNames, (db,dbName) => buildCSdb( dbName, db, silent ));
		}
		
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
			dbCSlist,
			objCS, objCSname, objName, 
			objBody, type,
			objCT, objChg, objCost,
			specs, spellsDB;
		
		if (!dbName || !dbName.length) {
			dbName = '-db';
		}
		dbCSlist = filterObjs( obj => {
			if (obj.get('type') !== 'ability') return false;
			objCS = getObj('character',obj.get('characterid'));
			objCSname = objCS.get('name').toLowerCase();
			if (!objCSname.includes(dbName) || !objCSname.includes('-db')) return false;
			objBody = obj.get('action');
			specs = objBody.match(/}}\s*specs\s*=(.*?){{/im);
			if (!specs) return true;
			spellsDB = objCSname.includes('spell');
			objName = obj.get('name');
			specs = specs ? [...('['+specs[0]+']').matchAll(/\[\s*?\w[\s\|\w\-]*?\s*?,\s*?(\w[\s\|\w\-]*?)\s*?,.*?\]/g)] : [];
			for (let i=0; i < specs.length; i++) {
				type = specs[i][1];
				if (type && type.length) {
					type = spellsDB ? spTypeLists[type].type : miTypeLists[type].type;
					if (!lists[objCS.id]) lists[objCS.id] = {};
					if (!lists[objCS.id][type]) lists[objCS.id][type] = [];
					lists[objCS.id][type].push(objName);
				};
			}
			objCT	= (objBody.match(/\}\}\s*?\w*?data\s*?=\[.*?[\[,]\s*?sp:(\d+?\.?\d*?)/im) || ['',0])[1];
			objChg	= (objBody.match(/\}\}\s*?\w*?data\s*?=\[.*?[\[,]\s*?rc:([\w-]+)\s*?[,\]]/im) || ['','uncharged'])[1];
			objCost	= (objBody.match(/\}\}\s*?\w*?data\s*?=\[.*?[\[,]\s*?gp:(\d+?\.?\d*?)/im) || ['',0])[1];
			setAttr( objCS, [fields.CastingTimePrefix[0]+objName, 'current'], objCT );
			setAttr( objCS, [fields.CastingTimePrefix[0]+objName, 'max'], (spellsDB ? objCost : objChg) );
			addMIspells( objCS, {name:objName,body:objBody} );
			return true;
		});
		if (!dbCSlist || !dbCSlist.length) {
			sendFeedback('No databases found with a name that includes '+dbName);
		} else {
			_.each(dbCSlist,dbCS => {
				_.each((spellsDB ? spTypeLists : miTypeLists), dbList => {
					if (lists[dbCS.id] && lists[dbCS.id][dbList.type]) {
						setAttr( dbCS, [dbList.field[0],'current'], (lists[dbCS.id][dbList.type].sort().join('|') || '' ));
					}
				});
			});
			sendFeedback((dbName === '-db') ? 'All databases have' : ('Database '+args[0]+' has') + ' been updated'); 
		}
		return;
	}
	
	/**
	 * Update or create the help handouts
	 **/
	 
	var updateHandouts = function(silent,senderId) {
		
		_.each(handouts,(obj,k) => {
			let dbCS = findObjs({ type:'handout', name:obj.name },{caseInsensitive:true});
			if (!dbCS || !dbCS[0]) {
			    log(obj.name+' not found.  Creating version '+obj.version);
				dbCS = createObj('handout',{name:obj.name,inplayerjournals:senderId});
				dbCS.set('notes',obj.bio);
				dbCS.set('avatar',obj.avatar);
			} else {
				dbCS = dbCS[0];
				dbCS.get('notes',function(note) {
					let reVersion = new RegExp(obj.name+'\\s*?v(\\d+?.\\d*?)</span>', 'im');
					let version = note.match(reVersion);
					version = (version && version.length) ? (parseFloat(version[1]) || 0) : 0;
					if (version >= obj.version) {
//					    log('Not updating handout '+obj.name+' as is already version '+obj.version);
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
	 
	var getCharacter = function( tokenID ) {
	
		var curToken,
		    charID,
		    charCS;
		
		if (!tokenID) {
			sendDebug('getCharacter: tokenID is invalid');
			sendError('Invalid attackMaster arguments');
			return undefined;
		};

		curToken = getObj( 'graphic', tokenID );

		if (!curToken) {
			sendDebug('getCharacter: tokenID is not a token');
			sendError('Invalid attackMaster arguments');
			return undefined;
		};
			
		charID = curToken.get('represents');
			
		if (!charID) {
			sendDebug('getCharacter: charID is invalid');
			sendError('Invalid attackMaster arguments');
			return undefined;
		};

		charCS = getObj('character',charID);

		if (!charCS) {
			sendDebug('getCharacter: charID is not for a character sheet');
			sendError('Invalid attackMaster arguments');
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
		var penalties = _.filter( classNonProfPenalty, elem => (0 < (attrLookup(charCS,elem[0]) || 0)));
		if (!penalties || !penalties.length) {
		    return 0;
		} else {
		    return _.map(penalties, elem => elem[1]).reduce((penalty,highest) => Math.max(penalty,highest));
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
	 
	var parseData = function( attributes, reSpecs ) {
		
		var parsedData = {},
			val;

		_.each( reSpecs, spec => {
			val = attributes.match(spec.re);
			if (!!val && val.length>1 && val[1].length) {
				parsedData[spec.field] = val[1];
			} else {
				parsedData[spec.field] = spec.def;
			}
		});
		return parsedData;
	}
	
	/*
	 * Determine if a particular item type or superType is an 
	 * allowed type for a specific class.
	 */
	 
	var classAllowedItem = function( charCS, wname, wt, wst, allowedItemsByClass ) {
		
        wt = wt ? wt.toLowerCase().replace(reIgnore,'') : '-';
        wst = wst ? wst.toLowerCase().replace(reIgnore,'') : '-';
        wname = wname ? wname.toLowerCase().replace(reIgnore,'') : '-';
		
		var charLevels = (getCharLevels( charCS ) || fields.Fighter_level);
    	var	validItem = _.filter( classLevels, a => {
    		    return _.some( charLevels, b => {
    		        return (a[1].includes(b[0]))
    		    })
    		})
			.some( elem => {
        	    let charClass = attrLookup(charCS,elem[0]) || 'Fighter',
        	        allowedItems = allowedItemsByClass[charClass.toLowerCase().replace(reIgnore,'')] || '';
        	    if (_.isUndefined(allowedItems))
        	        {return false;}
                return allowedItems.includes('any') || allowedItems.includes(wt)
                                                    || allowedItems.includes(wst)
                                                    || (wt=='-' && wst=='-' && allowedItems.includes(wname));  	    
        	});
		return validItem;
	};
	
	/*
	 * Determine if the character has a shield in-hand
	 */
	 
	var shieldInHand = function( charCS, shieldTrueName ) {
		var inHandTable = getTable( charCS, {}, fields.InHand_table, fields.InHand_trueName );
		return !_.isUndefined(tableFind( inHandTable, fields.InHand_trueName, shieldTrueName ));
	}
	
	/*
	 * Determine the number of attacks per round for a weapon,
	 * using the type, superType or class (melee/ranged) of 
	 * the weapon.
	 */
	 
	var getAttksPerRound = function( charCS, attksData, wt, wst, wc, weapBase ) {
        wt = wt.toLowerCase().replace(reIgnore,'');
        wst = wst.toLowerCase().replace(reIgnore,'');
        wc = wc.toLowerCase().replace(reIgnore,'');
		var boost, newVal, result, level;
		if (_.isUndefined(boost = attksData[wt])) {
			if (_.isUndefined(boost = attksData[wst])) {
				if (_.isUndefined(boost = attksData[wc])) {
					return weapBase;
				}
			}
		}
		result = (boost[(Math.min(Math.ceil((attrLookup( charCS, fields.Fighter_level ) || 0)/6),3)-1)] || '+0');
		level = attrLookup( charCS, fields.Fighter_level );
		try {
			newVal = eval('2*('+ weapBase + result +')');
			result = (newVal % 2) ? newVal + '/2' : newVal/2;
		} catch {
			result = weapBase;
		}

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
			attrVal = curToken.get(tokenBar[0]+'_'+tokenBar[1]);
			attrName = tokenBar[0];
		}
		if (!attrVal || isNaN(attrVal)) {
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
				attrVal = attrObj.get(property);
			}
		}
		if ((!attrVal || isNaN(attrVal)) && attr == 'thac0') {
			attrVal = parseInt(attrLookup( charCS, fields.Thac0_base ));
			attrName = fields.Thac0_base[0];
		}
		if (!attrVal || isNaN(attrVal)) {
			attrVal = parseInt(attrLookup( charCS, field ));
			attrName = field[0];
		}
		if (altField && (!attrVal || isNaN(attrVal))) {
			attrVal = parseInt(attrLookup( charCS, altField ));
			attrName = altField[0];
		}
		return (!nameFlag ? attrVal : ((!attrVal || isNaN(attrVal)) ? undefined : attrName));
	}
	
/* ----------------------------------------------- Weapon Management Functions ----------------------------------------
	
	/*
	 * Create a Roll Query with a list of either 1H or 2H 
	 * weapons from the character's magic item bag
	 */
	
	var weaponQuery = function( charCS, handed, anyHand ) {
		
		var magicDB, magicName,
			itemTable = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
			itemObjs = itemTable[fields.Items_name[0]].attrs,
			weaponList = ['-,-'],
			re = /\[.*?,\s*?(\d+)H\s*?,.*?\]/ig;
			
		if (handed > 2) {
		    handed = '[0-9]+'
		}
		
		var abilityObjs = filterObjs(function(obj) {
						if (obj.get('type') != 'ability') return false;
						if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
						magicName = magicDB.get('name').toLowerCase();
						if ((magicName.indexOf(fields.WeaponDB.toLowerCase()) !== 0) || (/\s*v\d*\.\d*/i.test(magicName))) return false;
						let specs = obj.get('action');
						let weaponSpecs = specs.match(/{{\s*weapon\s*=.*?(?:\n.*?)*?}}(.*?){{/im);
						weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(re)] : [];
						if (_.some(weaponSpecs, (w) => (w[1]==handed || (anyHand && w[1]<=handed)))) {
							return true;
						}
						let shieldSpecs = specs.match(/{{\s*shield\s*=.*?(?:\n.*?)*?}}(.*?){{/im);
						shieldSpecs = shieldSpecs ? [...('['+shieldSpecs[0]+']').matchAll(re)] : [];
						return _.some(shieldSpecs, (s) => (s[1]==handed || (anyHand && s[1]<=handed)));
					});
		_.each(itemObjs, (item,id) => {
			let itemName = item.get('current');
			let nameMatch = itemName.toLowerCase().replace(reIgnore,'');
			_.some( abilityObjs, elem => {
				if (nameMatch == elem.get('name').toLowerCase().replace(reIgnore,'')) {
					weaponList.push(itemName+','+itemTable.sortKeys.indexOf(id));
					return true;
				}
				return false;
			});
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
			spec;
			
		do {
			let wpName = tableLookup( WeaponProfs, fields.WP_name, i, false ),
				wpType = tableLookup( WeaponProfs, fields.WP_type, i );
			if (_.isUndefined(wpName)) {break;}
            wpName = wpName.toLowerCase().replace(reIgnore,'');
            wpType = (!!wpType ? wpType.toLowerCase().replace(reIgnore,'') : '');

            let isType = (wpName && wpName.length && wt.includes(wpName)),
                isSuperType = (wpType && (wst.includes(wpType))),
                isSameName = (wpName && wpName.length && wname.includes(wpName));

			if (isType || (!isSuperType && isSameName)) {
				prof = 0;
				spec = tableLookup( WeaponProfs, fields.WP_specialist, i );
				if (spec && spec != 0) {
					prof = 2;
				}
				spec = tableLookup( WeaponProfs, fields.WP_mastery, i );
				if (spec && spec != 0) {
					prof = 3;
				}
			} else if (isSuperType) {
				prof = Math.floor(prof/2);
			}
			i++;
		} while (prof < 0);
		if (prof < 0 && !classAllowedItem( charCS, wname, wt, wst, classAllowedWeaps )) {
		    prof *= 2;
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
			if (_.isUndefined(fields[group+key])) return;
			let property = fields[group+key];
			if (key != 'dmgType' && key != 'noAttks') {
				values[property[0]][property[1]]=val;
			} else if (key != 'dmgType') {
				values[property[0]][property[1]] = getAttksPerRound(charCS, 
														 weapMultiAttks[(proficiency>0) ? 'Specialist' : 'Proficient'], 
														 weapon[1],
														 weapon[4], 
														 weapon[2],
														 val );
			} else {
				let dmgType=val.toUpperCase();
				values[fields[group+'slash'][0]][fields[group+'slash'][1]]=(dmgType.includes('S')?1:0);
				values[fields[group+'pierce'][0]][fields[group+'pierce'][1]]=(dmgType.includes('P')?1:0);
				values[fields[group+'bludgeon'][0]][fields[group+'bludgeon'][1]]=(dmgType.includes('B')?1:0);
			}
		});
		return values;
	}
	
	/*
	 * Insert ammo that has been found into the Ammo table
	 * but avoid duplicates by searching tableInfo ammoTypes
	 */
	
	var insertAmmo = function( charCS, ammoTrueName, ammoSpecs, rangeSpecs, tableInfo, ammoType, sb, miIndex ) {
        var ammoData, values, rowAmmo, ammoRow, qty;
        if (tableInfo.ammoTypes.includes(ammoTrueName+'-'+ammoType)) {return tableInfo;}
		tableInfo.ammoTypes.push(ammoTrueName+'-'+ammoType);
        blankWeapon( charCS, tableInfo, ['AMMO'], ammoTrueName );
		for (let w=0; w<ammoSpecs.length; w++) {
			ammoData = ammoSpecs[w][0],
			values = initValues( tableInfo.AMMO.fieldGroup );
			values[fields.Ammo_name[0]][fields.Ammo_name[1]]=(ammoData.match(/[\[,\s]w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','Unknown ammo'])[1];
			values[fields.Ammo_strBonus[0]][fields.Ammo_strBonus[1]]=(sb ? (ammoData.match(/[\[,\s]sb:\s*?([01])\s*?[,\]]/i) || [0,0])[1] : 0);
			values[fields.Ammo_adj[0]][fields.Ammo_adj[1]]=(ammoData.match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || [0,0])[1];
			values[fields.Ammo_reuse[0]][fields.Ammo_reuse[1]]=(ammoData.match(/[\[,\s]ru:\s*?([+-]?[01])\s*?[,\]]/i) || [0,0])[1];
			values[fields.Ammo_dmgSM[0]][fields.Ammo_dmgSM[1]]=(ammoData.match(/[\[,\s]sm:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
			values[fields.Ammo_dmgL[0]][fields.Ammo_dmgL[1]]=(ammoData.match(/[\[,\s]l:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
			values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=qty=(attrLookup( charCS, fields.Items_qty, fields.Items_table, miIndex ) || 1);
			values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]]=(parseInt(attrLookup( charCS, fields.Items_trueQty, fields.Items_table, miIndex )) || qty);
			values[fields.Ammo_attkAdj[0]][fields.Ammo_attkAdj[1]]=(rangeSpecs[0][0].match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || ['',''])[1];
			values[fields.Ammo_range[0]][fields.Ammo_range[1]]=(rangeSpecs[0][0].match(/[\[,\s]r:\s*?([-\d\/]+)/i) || ['',''])[1];
			values[fields.Ammo_type[0]][fields.Ammo_type[1]]=ammoType;
			values[fields.Ammo_miName[0]][fields.Ammo_miName[1]]=ammoTrueName;

			ammoRow = tableInfo.AMMO.table[1]-1;
			do {
				rowAmmo = tableLookup( tableInfo.AMMO, fields.Ammo_name, ++ammoRow, false );
			} while (!_.isUndefined(rowAmmo) && (rowAmmo != '-'));
			tableInfo.AMMO = addTableRow( tableInfo.AMMO, ammoRow, values );
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
					ammoMatch = [...(' '+ammoData.match(/{{\s*?ammo\s*?=.*?(?:\n.*?)*{{/im)).matchAll(/\[.*?\]/g)];
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
							ammoMatch = [...(' '+ammoData.match(/{{\s*?range\s*?=.*?(?:\n.*?)*{{/im)).matchAll(/\[.*?\]/g)];
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
								let values = initValues( 'Quiver_' );
								values[fields.Quiver_name[0]][fields.Quiver_name[1]] = ammoName;
								values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = ammoTrueName;
								values[fields.Quiver_index[0]][fields.Quiver_index[1]] = miIndex;
								Quiver = addTableRow( Quiver, Quiver.index, values, 'Quiver_' );
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
		if (isNaN(lineNo) || lineNo < -1) {
			if (!!hand) {
				setAttr( charCS, hand, '' );
			}
			return [tableInfo,Quiver];
		}
		var weaponName = attrLookup( charCS, fields.Items_name, fields.Items_table, lineNo ),
			weaponTrueName = attrLookup( charCS, fields.Items_trueName, fields.Items_table, lineNo ) || weaponName,
		    item = abilityLookup(fields.WeaponDB, weaponTrueName),
			specs = item.obj[0].get('action'),
			weaponSpecs = specs.match(/{{\s*weapon\s*=.*?(?:\n.*?)*?}}(.*?){{/im),
			toHitSpecs = specs.match(/{{\s*to-hit\s*=.*?(?:\n.*?)*?}}(.*?){{/im),
			dmgSpecs = specs.match(/{{\s*damage\s*=.*?(?:\n.*?)*?}}(.*?){{/im),
			ammoSpecs = specs.match(/{{\s*ammo\s*=.*?(?:\n.*?)*?}}(.*?){{/im),
			re = /[\s\-]*?/gi,
			tempObj, values, group,
			wt, wst, dmg,
		    rowWeap, weapRow,
			dancingProf;
			
		blankWeapon( charCS, tableInfo, ['MELEE','RANGED','DMG','AMMO'], weaponTrueName );

		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
		toHitSpecs = toHitSpecs ? [...('['+toHitSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		dmgSpecs = dmgSpecs ? [...('['+dmgSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];

		if (!!hand) {
			setAttr( charCS, hand, weaponName );
		}

		for (let i=0; i<Math.min(weaponSpecs.length,toHitSpecs.length); i++) {
			let weapon = weaponSpecs[i],
				toHit = toHitSpecs[i][0],
				proficiency = proficient( charCS, weaponTrueName, weapon[1], weapon[4] ),
				attk2H = weapon[3]=='2H' ? 1 : 0;
			
			if ((noOfHands == 0) || (noOfHands ==  (attk2H+1))) {
			
    			let weapData = parseData( toHit, reWeapSpecs );
    			if (weapon[2].toLowerCase().includes('melee')) {

					group = tableInfo.MELEE.fieldGroup;
    			    values = initValues( group );
					values[fields.MW_name[0]][fields.MW_name[1]]='Unknown weapon';
					
					values = setAttackTableRow( charCS, tableInfo.MELEE.fieldGroup, weapon, weapData, proficiency, values );
					values[fields.MW_miName[0]][fields.MW_miName[1]]=weaponTrueName;
    			    values[fields.MW_twoHanded[0]][fields.MW_twoHanded[1]]=attk2H;
					values[fields.MW_profLevel[0]][fields.MW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.MW_type[0]][fields.MW_type[1]]=weapon[1];
					values[fields.MW_superType[0]][fields.MW_superType[1]]=weapon[4];
					values[fields.MW_dancing[0]][fields.MW_dancing[1]]=(dancing?1:0);
					dancingProf = parseInt(values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] = getAttksPerRound(charCS, 
														 weapMultiAttks[(dancingProf>0) ? 'Specialist' : 'Proficient'], 
														 weapon[1],
														 weapon[4], 
														 weapon[2],
														 values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] );
					}
					if (_.isUndefined( weapRow = tableFind( tableInfo.MELEE, fields.MW_name, '-', false ))) weapRow = tableInfo.MELEE.sortKeys.length;
					tableInfo.MELEE = addTableRow( tableInfo.MELEE, weapRow, values );
						
    				if (dmgSpecs && i<dmgSpecs.length && !_.isUndefined(dmg=dmgSpecs[i][0])) {
						values = setAttackTableRow( charCS, tableInfo.DMG.fieldGroup, weapon, parseData( dmg, reWeapSpecs ), proficiency, initValues( tableInfo.DMG.fieldGroup ) );
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
					values[fields.RW_type[0]][fields.RW_type[1]]=weapon[1];
					values[fields.RW_superType[0]][fields.RW_superType[1]]=weapon[4];
					values[fields.RW_dancing[0]][fields.RW_dancing[1]]=(dancing?1:0);
					dancingProf = parseInt(values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] = getAttksPerRound(charCS, 
														 weapMultiAttks[(dancingProf>0) ? 'Specialist' : 'Proficient'], 
														 weapon[1],
														 weapon[4], 
														 weapon[2],
														 values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] );
					}

					if (_.isUndefined( weapRow = tableFind( tableInfo.RANGED, fields.RW_name, '-', false ))) weapRow = tableInfo.RANGED.sortKeys.length;
					tableInfo.RANGED = addTableRow( tableInfo.RANGED, weapRow, values );
					
					let attkStrBonus = values[fields.RW_strBonus[0]][fields.RW_strBonus[1]];
    				if (ammoSpecs && ammoSpecs.length) {
    					let rangeSpecs = [...('['+specs.match(/{{\s*range\s*=.*?(?:\n.*?)*?}}(.*?){{/im)[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
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
			weaponSpecs = specs.match(/{{\s*weapon\s*=.*?(?:\n.*?)*?}}(.*?){{/im),
			ammoSpecs = specs.match(/{{\s*ammo\s*=.*?(?:\n.*?)*?}}(.*?){{/im);

		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];

		for (let i=0; i<weaponSpecs.length; i++) {
			let weapon = weaponSpecs[i];
			if (weapon[2].toLowerCase() == 'ranged') {
				if (ammoSpecs && ammoSpecs.length) {
					let values = initValues( 'Quiver_' );
					values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
					values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
					values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo
					Quiver = addTableRow( Quiver, Quiver.index, values, 'Quiver_' );
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
			noHands = parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2,
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
				if (itemDef.obj && itemDef.obj[0]) {
					itemDesc = itemDef.obj[0].get('action');
					itemSpecs = itemDesc.match(/{{\s*armou?r\s*=.*?(?:\n.*?)*?}}(.*?){{/im);
					itemData = itemDesc.match(/}}\s*a?c?data\s*=(.*?){{/im);
					
					if (itemData) {
						if (itemSpecs) {
							itemSpecs = [...('['+itemSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)];
						} else {
							itemSpecs = itemDesc.match(/{{\s*shield\s*=.*?(?:\n.*?)*?}}(.*?){{/im);
							if (itemSpecs) {
								itemSpecs = [...('['+itemSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)];
							} else {
								itemSpecs = itemDesc.match(/{{\s*protection\s*=.*?(?:\n.*?)*?}}(.*?){{/im);
								if (itemSpecs) {
									itemSpecs = [...('['+itemSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)];
								}
							}
						}
						if (itemSpecs) {
							itemData = [...('['+itemData[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
							for (let i=0; i<Math.min(itemSpecs.length,itemData.length); i++) {
								let itemType = itemSpecs[i][1].toLowerCase().replace(reIgnore,''),
									itemClass = itemSpecs[i][2].toLowerCase().replace(reIgnore,''),
									itemHands = itemSpecs[i][3].toUpperCase(),
									itemSuperType = itemSpecs[i][4].toLowerCase().replace(reIgnore,''),
									acData = parseData( itemData[i][0], reACSpecs );
								if (itemClass == 'armor') itemClass = 'armour';
								if (!classAllowedItem(charCS, itemName, itemType, itemSuperType, classAllowedArmour)) {
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
											if (itemClass == 'armour') {
												diff = (parseInt(data.ac || 10) - itemAdj - (parseFloat(data.db || 1)*dexBonus)) - (ac - adj - dexAdj);
											} else {
												diff = ((adj + dexAdj) - (itemAdj + (parseFloat(data.db || 1)*dexBonus)));
												if (itemClass.includes('protection') && acValues.armour.magic) {
													armourMsg.push(itemName+' cannot be used alongside magical armour');
												}
											}
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
										}
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
			tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, true ),
			tokenAC = (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}]]') : 'Not known'),
			tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, true ),
			tokenHP = (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : 'Not known'),
			attkMacro;
			
		monsterDmg1 = monsterDmg1[(monsterDmg1.length > 1 ? 1 : 0)];
		monsterDmg2 = monsterDmg2[(monsterDmg2.length > 1 ? 1 : 0)];
		monsterDmg3 = monsterDmg3[(monsterDmg3.length > 1 ? 1 : 0)];
		
		msg = msg.split('$$');
			
		switch (attkType.toUpperCase()) {
		
		case Attk.TARGET:
			if (attk1) {
				attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} using '+attk1+'}}'
						  + '{{Hits AC=[[(([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}'
						  + '{{Target AC='+tokenAC+'}}'
						  + '{{Damage if hit= [[(([['+monsterDmg1+']]['+attk1+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'
						  + '{{Target HP='+tokenHP+'HP}}'+(msg[0] && msg[0].length ? '{{'+parseStr(msg[0])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Attk-1', attkMacro );
			}
			if (attk2) {
				attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} using '+attk2+'}}'
						  + '{{Hits AC=[[ ( ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}'
						  + '{{Target AC='+tokenAC+'}}'
						  + '{{Damage if hit= [[(([['+monsterDmg2+']]['+attk2+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'
						  + '{{Target HP='+tokenHP+'HP}}'+(msg[1] && msg[1].length ? '{{'+parseStr(msg[1])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Attk-2', attkMacro );
			}
			if (attk3) {
				attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} using '+attk3+'}}'
						  + '{{Hits AC=[[ ( ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}'
						  + '{{Target AC='+tokenAC+'}}'
						  + '{{Damage if hit= [[(([['+monsterDmg3+']]['+attk3+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'
						  + '{{Target HP='+tokenHP+'HP}}'+(msg[2] && msg[2].length ? '{{'+parseStr(msg[2])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Attk-3', attkMacro );
			}
			break;
			
		case Attk.TO_HIT:
		case Attk.ROLL:
			if (attk1) {
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' attacks with their '+attk1+'}}'
						  + '{{Hits AC=[[ ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}\n'
						  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~Do-not-use-Monster-Dmg-1)}}';
				setAbility( charCS, 'Do-not-use-Monster-Attk-1', attkMacro );
				
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+attk1+'}}'
						  + '{{Damage=[[(([['+monsterDmg1+']]['+attk1+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'+(msg[0] && msg[0].length ? '{{'+parseStr(msg[0])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Dmg-1', attkMacro );
			}
			if (attk2) {
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' attacks with their '+attk2+'}}'
						  + '{{Hits AC=[[ ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}\n'
						  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~Do-not-use-Monster-Dmg-2)}}';
				setAbility( charCS, 'Do-not-use-Monster-Attk-2', attkMacro );
				
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+attk2+'}}'
						  + '{{Damage=[[(([['+monsterDmg2+']]['+attk2+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'+(msg[1] && msg[1].length ? '{{'+parseStr(msg[1])+'}}' : '');
				setAbility( charCS, 'Do-not-use-Monster-Dmg-2', attkMacro );
			}
			if (attk3) {
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' attacks with their '+attk3+'}}'
						  + '{{Hits AC=[[ ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}\n'
						  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~Do-not-use-Monster-Dmg-3)}}';
				setAbility( charCS, 'Do-not-use-Monster-Attk-3', attkMacro );
				
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+attk3+'}}'
						  + '{{Damage=[[(([['+monsterDmg3+']]['+attk3+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'+(msg[2] && msg[2].length ? '{{'+parseStr(msg[2])+'}}' : '');
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
		
		var tokenID		= args[1],
			attkType	= args[2],
			msg			= parseStr(args[5] || ''),
			curToken 	= getObj('graphic',tokenID),
			tokenName 	= curToken.get('name'),
			toHitRoll 	= fields.ToHitRoll,
			thac0		= getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0) || 20,
			mwNumber    = mwIndex + (fields.MW_table[1]==0 ? 1 : 2),
			weaponName 	= tableLookup( tableInfo.MELEE, fields.MW_name, mwIndex ),
			dancing		= tableLookup( tableInfo.MELEE, fields.MW_dancing, mwIndex ),
			attkAdj 	= tableLookup( tableInfo.MELEE, fields.MW_adj, mwIndex ),
			strBonus 	= tableLookup( tableInfo.MELEE, fields.MW_strBonus, mwIndex ),
			mwType 		= tableLookup( tableInfo.MELEE, fields.MW_type, mwIndex ),
			mwSuperType = tableLookup( tableInfo.MELEE, fields.MW_superType, mwIndex ),
			critHit 	= tableLookup( tableInfo.MELEE, fields.MW_critHit, mwIndex ) || 20,  // Temp fix for Efriiti corruption
			critMiss 	= tableLookup( tableInfo.MELEE, fields.MW_critMiss, mwIndex ),
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
			tokenAC = (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}]]') : 'Not known'),
			tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, true ),
			tokenHP = (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : 'Not known'),
			attkMacro, totalAttkAdj, bsDmgMult, totalDmgAdj;
			
			totalAttkAdj   = '(([['+attkAdj+']][Weapon+])+([[('+strBonus+'*'+strHit+')]][Strength+])'
						   + '+([['+(proficiency==2?1:proficiency)+']][Proficiency])+([['+race+']][Race mod])+([['+magicHitAdj+']][magic hit adj])'
 						   + '+([['+twoWeapPenalty+']][2-weap penalty]))';
						   
			bsDmgMult	   = '([['+Math.min((1+(backstab ? Math.ceil(rogueLevel/4) : 0)),5)+']][Backstab mult])';
			
			totalDmgAdj    = '([['+dmgAdj+']][weapon+])+([['+magicDmgAdj+']][magic dmg adj])'
						   + '+([['+(Math.max(proficiency,0))+']][Proficiency+])';
						   
		if (attkType.toUpperCase() == Attk.ROLL) {
			toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
			dmgSM     = '?{Roll Damage vs TSM|'+dmgSM+'}';
			dmgL      = '?{Roll Damage vs LH|'+dmgL+'}';
		}
		
		switch (attkType.toUpperCase()) {
			
		case Attk.TARGET:
			attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} with '+weaponName+'}}'
					  + '{{Hits AC=[[([['+thac0+']][Thac0])-('+totalAttkAdj+')-'+toHitRoll+'cs>'+critHit+'cf<'+critMiss+']] }}'
					  + '{{Target AC='+tokenAC+'}}'
					  + '{{Damage SM if hit=[[ ((([['+dmgSM+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+('+totalDmgAdj+')]] HP}}'
					  + '{{Damage L if hit=[[ ((([['+dmgL+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+('+totalDmgAdj+')]] HP}}'
					  + '{{Target HP='+tokenHP+'HP}}'+(msg && msg.length ? '{{'+msg+'}}' : '');
					  
			setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, attkMacro );
			break;
			
		case Attk.TO_HIT:
		case Attk.ROLL:
			attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks with their '+weaponName+'}}'
					  + '{{Hits AC=[[([['+thac0+']][Thac0])-([['+totalAttkAdj+']][Adjustments])-'+toHitRoll+'cs>'+critHit+'cf<'+critMiss+']] }}'
					  + '{{Total Adjustments=[['+totalAttkAdj+']]}}\n'
					  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If successfully hit\n[TSM Damage](~Do-not-use-Dmg-TSM-MW'+mwNumber+') or [LH Damage](~Do-not-use-Dmg-LH-MW'+mwNumber+')}}';

			setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, attkMacro );
			
			attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
					  + '{{Damage vs TSM=[[ ((([['+dmgSM+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+([['+totalDmgAdj+']][Adjustments])]] HP}}'
					  + '{{Total Plusses='+(backstab ? ('Backstab dice x [['+bsDmgMult+']] + ') : '')
					  + '[[([['+(dmgStrBonus * strDmg)+'*'+bsDmgMult+']][str bonus'+(backstab ? ' x backstab' : '')+'])'
					  + '+'+totalDmgAdj+']]}}'+(msg && msg.length ? '{{'+msg+'}}' : '');
					  
			setAbility( charCS, 'Do-not-use-Dmg-TSM-MW'+mwNumber, attkMacro );
			
			attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
					  + '{{Damage vs LH=[[ ((([['+dmgL+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+([['+totalDmgAdj+']][Adjustments])]] HP}}'
					  + '{{Total Plusses='+(backstab ? ('Backstab dice x [['+bsDmgMult+']] + ') : '')
					  + '[[([['+(dmgStrBonus * strDmg)+'*'+bsDmgMult+']][str bonus'+(backstab ? ' x backstab' : '')+'])'
					  + '+'+totalDmgAdj+']]}}'+(msg && msg.length ? '{{'+msg+'}}' : '');
					  
			setAbility( charCS, 'Do-not-use-Dmg-LH-MW'+mwNumber, attkMacro );
			break;
			
		default:
			sendDebug('buildMWattkMacros: Invalid attkType specified');
			sendError('Internal AttackMaster error');
			break;
		}
		return;
	}
	
	/*
	 * Build ranged weapon attack macro, one for each 
	 * of the 6 possible ranges: Near, PB, S, M, L, Far
	 */
	 
	var buildRWattkMacros = function( args, charCS, tableInfo ) {
		
		var tokenID 	= args[1],
			attkType 	= args[2],
			rwIndex 	= parseInt(args[3]),
			ammoIndex 	= parseInt(args[4]),
			msg			= parseStr(args[5] || ''),
			curToken 	= getObj('graphic',tokenID),
			tokenName 	= curToken.get('name'),
			charName	= charCS.get('name'),
			toHitRoll 	= fields.ToHitRoll,
			thac0		= getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0) || 20,
			rwNumber    = rwIndex + (fields.RW_table[1]==0 ? 1 : 2),
			weaponName 	= tableLookup( tableInfo.RANGED, fields.RW_name, rwIndex ),
			dancing		= tableLookup( tableInfo.RANGED, fields.RW_dancing, rwIndex ),
			attkAdj 	= tableLookup( tableInfo.RANGED, fields.RW_adj, rwIndex ),
			weapStrBonus= tableLookup( tableInfo.RANGED, fields.RW_strBonus, rwIndex ),
			weapDexBonus= tableLookup( tableInfo.RANGED, fields.RW_dexBonus, rwIndex ),
			rwType 		= tableLookup( tableInfo.RANGED, fields.RW_type, rwIndex ),
			rwSuperType = tableLookup( tableInfo.RANGED, fields.RW_superType, rwIndex ),
			critHit 	= tableLookup( tableInfo.RANGED, fields.RW_critHit, rwIndex ),
			critMiss 	= tableLookup( tableInfo.RANGED, fields.RW_critMiss, rwIndex ),
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
			tokenAC = (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}]]') : 'Not known'),
			tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, true ),
			tokenHP = (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : 'Not known'),
			attkMacro, totalAttkAdj, totalDmgAdj,
			rangeMod;
			
	
		if (attkType.toUpperCase() == Attk.ROLL) {
			toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
			dmgSM     = '?{Roll Damage vs TSM|'+dmgSM+'}';
			dmgL      = '?{Roll Damage vs LH|'+dmgL+'}';
		}
			
		_.each(rangedWeapMods, function( defMod, dist ) {
			
			if (dist != 'PB' || proficiency > 0) {

				rangeMod = attrLookup( charCS, [fields.RWrange_mod[0]+dist, fields.RWrange_mod[1]] ) || defMod;
				
        		totalAttkAdj = '([['+attkAdj+']][Weapon+]) + ([['+dmgAdj+']][Ammo+]) + ([[ '+weapDexBonus+' *[['+dexMissile+']]]][Dexterity+] )'
        					 + '+([['+weapStrBonus+'*[['+strHit+']]]][Strength+])+([['+race+']][Race mod])+([['+Math.min(proficiency,0)+']][Prof penalty])'
							 + '+([['+twoWeapPenalty+']][2-weap penalty])+([['+rangeMod+']][Range mod])';
        			
				totalDmgAdj = '( ([['+dmgAdj+']][Ammo+]) +([['+magicDmgAdj+']][Magic dmg+]) +([['+(ammoStrBonus*strDmg)+']][Strength+]) )';

				if (attkType == Attk.TARGET) {
					attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}'
							  + '{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} with their '+weaponName+'}}'
							  + '{{Hits AC=[[([['+thac0+']][Thac0]) - ('+totalAttkAdj+')'
							  + '- '+toHitRoll+'cs>'+critHit+'cf<'+critMiss+' ]] }}'
							  + '{{Target AC='+tokenAC+'}}'
							  + '{{Damage if hit SM=[[ floor( [['+dmgSM+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ('+totalDmgAdj+') ]]HP}}'
							  + '{{Damage if hit L=[[ floor( [['+dmgSM+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ('+totalDmgAdj+') ]]HP}}'
							  + '{{Target HP='+tokenHP+'}}'
							  + '{{Ammo left='+(ammoReuse != 1 ? (ammoQty-1) : ammoQty)+'}}'+(msg && msg.length ? '{{'+msg+'}}' : '')
							  + ((ammoReuse <= 0) ? ('\n!attk --setammo '+tokenID+'|'+ammoName+'|-1|'+(ammoReuse < 0 ? '=' : '+0')+'|SILENT') : '');
					setAbility( charCS, 'Do-not-use-Attk-RW'+rwNumber+'-'+dist, attkMacro );
				
				} else {
					attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}'
							  + '{{name='+tokenName+' attacks with their '+weaponName+'}}'
							  + '{{Hits AC=[[([['+thac0+']][Thac0]) - ([['+totalAttkAdj+']][Adjustments])'
							  + '- '+toHitRoll+'cs>'+critHit+'cf<'+critMiss+' ]] }}'
        					  + '{{Total Adjustments=[['+totalAttkAdj+']]}}'
							  + '{{Ammo left='+(ammoReuse != 1 ? (ammoQty-1) : ammoQty)+'}}\n'
							  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If successfully hit\n[TSM Damage](~'+charName+'|Do-not-use-Dmg-TSM-RW'+rwNumber+'-'+dist+')'
							  + 'or [LH Damage](~'+charName+'|Do-not-use-Dmg-LH-RW'+rwNumber+'-'+dist+')}}'
							  + ((ammoReuse <= 0) ? ('\n!attk --setammo '+tokenID+'|'+ammoName+'|-1|'+(ammoReuse < 0 ? '=' : '+0')+'|SILENT') : '');
					setAbility( charCS, 'Do-not-use-Attk-RW'+rwNumber+'-'+dist, attkMacro );
					
					attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
							  + '{{Damage vs TSM=[[ floor( [['+dmgSM+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ([['+totalDmgAdj+']][Adjustments]) ]]HP}}'
							  + '{{Total Plusses=dice '+((dist=='N')?'/':'*')+'[[[['+((dist=='PB'||dist=='N')?2:1)+']][N/PB Mult]]] + [[ ([['+(dist=='PB'?2:0)+']][PB bonus])'
							  + ' + ([['+dmgAdj+']][Ammo+]) + ([['+magicDmgAdj+']][Magic dmg+]) +([['+(strDmg*ammoStrBonus)+']][Strength+]) ]]}}'+(msg && msg.length ? '{{'+msg+'}}' : '');
					setAbility( charCS, 'Do-not-use-Dmg-TSM-RW'+rwNumber+'-'+dist, attkMacro );

					attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
							  + '{{Damage vs LH=[[ floor( [['+dmgL+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ([['+totalDmgAdj+']][Adjustments]) ]]HP}}'
							  + '{{Total Plusses=dice '+((dist=='N')?'/':'*')+'[[[['+((dist=='PB'||dist=='N')?2:1)+']][N/PB Mult]]] + [[ ([['+(dist=='PB'?2:0)+']][PB bonus])'
							  + ' + ([['+dmgAdj+']][Ammo+]) + ([['+magicDmgAdj+']][Magic dmg+]) +([['+(strDmg*ammoStrBonus)+']][Strength+]) ]]}}'+(msg && msg.length ? '{{'+msg+'}}' : '');
					setAbility( charCS, 'Do-not-use-Dmg-LH-RW'+rwNumber+'-'+dist, attkMacro );
				}
			}
		});
		return;
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
					+ '&{template:2Edefault}{{name='+name+' Save vs '+saveType+'}}'
					+ '{{Saving Throw=Roll[['+fields.SaveRoll+'cf<'+(save-saveMod-sitMod-saveAdj-1)+'cs>'+(save-saveMod-sitMod-saveAdj)+']]≥[[0+'+(save-saveMod-sitMod-saveAdj)+']]target}}'
					+ '{{desc=**'+name+'\'s target**[[0+'+save+']] base save vs. poison with [[0+'+saveMod+']] improvement from race, class & Magic Items, [[0+'+saveAdj+']] improvement from current magic effects, and [[0+'+sitMod+']] adjustment for the situation}}';
		
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
            content = '&{template:2Edefault}{{name=How is ' + tokenName + ' attacking?}}';
			
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
			reAmmo = /{{\s*?ammo\s*?=/im,
			qty, maxQty, title=false,
			ammoName, breakable,
			itemIndex = fields.Items_table[1]-1,
			itemTable = fields.Items_table,
			itemName = fields.Items_name,
			itemQty = fields.Items_qty,
			itemMax = fields.Items_trueQty,
			checkAmmo = false,
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
				let ammo = abilityLookup( fields.MagicItemDB, ammoName, true ),
					ammoData, ammoMatch;
				if (checkAmmo || (ammo.obj && ammo.obj[0])) {
					if (ammo.obj && ammo.obj[0]) ammoData = ammo.obj[0].get('action');
					if (checkAmmo || (ammoData && ammoData.length && reAmmo.test(ammoData))) {
						if (!title) {
							content += '<table><tr><td>Now</td><td>Max</td><td>Ammo Name</td></tr>';
							title = true;
						}
						breakable = ammo.ct && ammo.ct[0] && (ammo.ct[0].get('max') || '').toLowerCase() == 'charged';
						qty = tableLookup(Items,itemQty,itemIndex);
						maxQty = tableLookup(Items,itemMax,itemIndex) || qty;
						content += '<tr><td>[['+qty+']]</td><td>[['+maxQty+']]</td>'
								+  '<td>'+(breakable ? '<span style=' + design.grey_button + '>' : '[')
								+  ammoName
								+  (breakable ? '</span>' : '](!attk --button '+BT.AMMO+'|'+tokenID+'|'+ammoName+'|?{How many do you recover?|0}|=)') + '</td></tr>';
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
			InHandTable = getTable( charCS, {}, fields.InHand_table, fields.InHand_name ),
			prefHand = args[3] || (handedness.match(/Left Handed|Right Handed|Ambidextrous|Neither Handed/i) || 'Right Handed'),
			tokenName = getObj('graphic',tokenID).get('name'),
			handedness = (hands == 2 ? '' : (hands + ' ')) + prefHand,
		
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Handedness}}'
					+ '{{desc=You can change the number of hands to any number, which affects the number of weapons that can be wielded.  Handedness can also be set, but currently has little effect}}'
					+ '{{desc1=**'+tokenName+' currently is '+handedness+'**\n'
					+ '[Number of Hands](!attk --button '+BT.NOHANDS+'|'+tokenID+'|?{Number of Hands}|'+prefHand+')'
					+ '[Preferred Hand](!attk --button '+BT.NOHANDS+'|'+tokenID+'|'+hands+'|?{Preferred hand|Right Handed|Left Handed|Ambidextrous|Neither Handed|Every Handed})}}'
					+ '{{desc2=Return to [Change Weapons](!attk --weapon '+tokenID+') menu}}';
		
		InHandTable = checkInHandRows( charCS, InHandTable, hands );
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
			MagicItems = getTable( charCS, {}, fields.Items_table, fields.Items_name, '', '' ),
			InHandTable = getTable( charCS, {}, fields.InHand_table, fields.InHand_name, '', '-' ),
			inHand, inHandHandedness, content, extraHands, weapList1H;
		
		InHandTable = getTable( charCS, InHandTable, fields.InHand_table, fields.InHand_handedness, '', 1 );
		InHandTable = checkInHandRows( charCS, InHandTable, noHands );
		left = tableLookup( InHandTable, fields.InHand_name, i++ );
		right = tableLookup( InHandTable, fields.InHand_name, i++ );
		both = tableLookup( InHandTable, fields.InHand_name, i++ );
		noHands -= 2;

		weapList1H = weaponQuery(charCS,1);
		content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s weapon}}'
				+ '{{ =**'+msg+'**}}'
				+ '{{desc=Select Left or Right Hand to hold a one-handed weapon or shield.'
				+ ' Select Both Hands to hold a two handed weapon and set AC to Shieldless}}'
				+ '{{desc1=[' + (left != '-' ? 'LH\: '+left : 'Left Hand') + '](!attk --button '+BT.LEFT+'|'+tokenID+'|'+weapList1H+'|0)'
				+ '[' + (right != '-' ? 'RH\: '+right : 'Right Hand') + '](!attk --button '+BT.RIGHT+'|'+tokenID+'|'+weapList1H+'|1)\n'
				+ 'or [' + (both != '-' ? '2H\: '+both : 'Both Hands') + '](!attk --button '+BT.BOTH+'|'+tokenID+'|'+weaponQuery(charCS,2)+'|2)\n';
				
        extraHands = noHands;
		while (noHands > 0) {
            inHand = tableLookup( InHandTable, fields.InHand_name, i );
			noHands -= inHandHandedness = parseInt(inHand != '-' ? tableLookup( InHandTable, fields.InHand_handedness, i ) : 1) || 1;
			hands = (inHandHandedness == 1) ? '' : (inHandHandedness == 2 ? ('+H'+(handNo+1)) : ('-H'+(handNo+inHandHandedness-1)));
			content += '['+(inHand != '-' ? ('H'+handNo+hands+'\: '+inHand) : ('Hand '+handNo))+ '](!attk --button '+BT.HAND+'|'+tokenID+'|'+weaponQuery(charCS,extraHands,true)+'|'+i+')';
			handNo += inHandHandedness;
			i++;
		}
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
			dmgType = (args[3] || 'sadj').toLowerCase(),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			tokenName = curToken.get('name'),
			currentAC = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC),
			AC = getACvalues(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Current Armour for '+tokenName+'}}';

		if (currentAC != finalAC) {
			content += '{{AC=<span style='+design.green_button+'>'+finalAC+'</span>'
					+  '\n(<span style='+design.selected_button+'>'+currentAC+'</span> with current magic)';
		} else {
			content += '{{AC=<span style='+design.selected_button+'>'+finalAC+'</span>';
		}

		if (dmgAdj.armoured.sadj != 0 || dmgAdj.armoured.padj != 0 || dmgAdj.armoured.badj != 0) {
			content += '\nvs.\n';
			args[3]='sadj';
			content += (dmgType == 'sadj'?'<span style='+design.selected_button+'>':'[')+'Slash:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj)+(dmgType=='sadj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[3]='padj';
			content += (dmgType == 'padj'?'<span style='+design.selected_button+'>':'[')+'Pierce:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj)+(dmgType=='padj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[3]='badj';
			content += (dmgType == 'badj'?'<span style='+design.selected_button+'>':'[')+'Bludgeon:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj)+(dmgType=='badj'?'</span>':'](!attk --checkac '+args.join('|')+')');
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
				    + 'or change the items in your backpack}}';

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
			content = '&{template:2Edefault}{{name=Roll a Saving Throw for '+name+'}}{{desc=<table>'
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
					+ '{{desc2=[Update Saving Throw table](!attk --setSaves '+tokenID+') if the numbers need to change}}';

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
			content = '&{template:2Edefault}{{name=Set '+name+'\'s Saving Throws}}'
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
					+ '{{desc=[Attack (Roll20 rolls)](!attk --attk-hit &#64;{selected|token_id})\n'
					+ '[Attack (You roll)](!attk --attk-roll &#64;{selected|token_id})\n'
					+ (isGM ? '[GM Targeted Attack](!attk --attk-target &#64;{selected|token_id})\n' : '')
					+ '[Change Weapon](!attk --weapon &#64;{selected|token_id})\n'
					+ '[Recover Ammo](!attk --ammo &#64;{selected|token_id})\n'
					+ '[Edit Weapons & Armour]('+((apiCommands.magic && apiCommands.magic.exists) ? '!magic --edit-mi' : '!attk --edit-weapons' )+' &#64;{selected|token_id})\n' 
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
			Ammo, ammoIndex, ammoDef,
			setQty, setMax,
			MagicItems, miIndex,
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
		MagicItems = getTable(charCS,{},fields.Items_table,fields.Items_name);
        MagicItems = getTable(charCS,MagicItems,fields.Items_table,fields.Items_trueName);

		if (!isMI) {
			ammoIndex = tableFind( Ammo, fields.Ammo_name, ammoName );
			ammoMIname = tableLookup( Ammo, fields.Ammo_miName, ammoIndex) || ammoMIname;
		} else {
			ammoIndex = tableFind( Ammo, fields.Ammo_miName, ammoName ) || tableFind( Ammo, fields.Ammo_name, ammoName );
		}
		miIndex = tableFind( MagicItems, fields.Items_name, ammoMIname );
			
		if (isNaN(miIndex)) {
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
			
		if (!isNaN(miIndex)) {
			MagicItems = tableSet( MagicItems, fields.Items_qty, miIndex, qty );
			MagicItems = tableSet( MagicItems, fields.Items_trueQty, miIndex, maxQty );
		
			if (maxQty == 0) {
				ammoDef = abilityLookup( fields.WeaponDB, ammoMIname );
				if (ammoDef.ct && ammoDef.ct.length && (ammoDef.ct[0].get('max') || '').toLowerCase() == 'charged') {
					MagicItems = tableSet( MagicItems, fields.Items_name, miIndex, '-' );
					MagicItems = tableSet( MagicItems, fields.Items_trueName, miIndex, '-' );
				}
			}
		}
		
		if (!isNaN(ammoIndex) && ammoIndex >= -1) {
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
	 
	var handleChangeWeapon = function( args, isGM ) {

		// Give some feedback to the user that something is happening
		
		sendResponse( getCharacter(args[1]), "**Please Wait... Updating weapon tables" );

		// delay the call to the processing of the weapon change to
		// allow Roll20 to update the chat window
		
		setTimeout( () => handleChangeWeaponDelayed( args, isGM ), 100 );
		return;
	}

	/*
	 * Handle the selection of weapons when the character is
	 * changing weapons.  Delete all weapons in the weapons,
	 * damage and ammo tables and rebuild them each time (easier 
	 * than trying to discover which remain & which to remove)
	 */

	var handleChangeWeaponDelayed = function( args, isGM ) {
	    
		var tokenID = args[1],
			selection = args[2],
			row = args[3],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			weaponInfo = getAllTables( charCS, 'MELEE,DMG,RANGED,AMMO' ),
			InHandTable = getAllTables( charCS, 'INHAND' )['INHAND'],
			Quiver = getAllTables( charCS, 'QUIVER' )['QUIVER'],
			values = initValues( 'InHand_' ),
			weapon, trueWeapon, weaponSpecs, handedness, item, i, hand, index;
			
		// First, check there are enough rows in the InHand table
		
		InHandTable = checkInHandRows( charCS, InHandTable, row );

		// Next, blank the quiver table
		
	    weapon = attrLookup( charCS, fields.Items_name, fields.Items_table, selection ) || '-';
	    trueWeapon = attrLookup( charCS, fields.Items_trueName, fields.Items_table, selection ) || weapon;
		Quiver = blankQuiver( charCS, Quiver );

		// Then add the weapon to the InHand table
		
	    values[fields.InHand_name[0]][fields.InHand_name[1]] = weapon;
	    values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = trueWeapon;
	    values[fields.InHand_index[0]][fields.InHand_index[1]] = selection;
	    values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness = 1;

		switch (args[0]) {
		case BT.BOTH:
		    InHandTable = tableSet( InHandTable, fields.InHand_name, 0, '-');
		    InHandTable = tableSet( InHandTable, fields.InHand_trueName, 0, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_index, 0, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_name, 1, '-');
		    InHandTable = tableSet( InHandTable, fields.InHand_trueName, 1, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_index, 1, '');
		    values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness = 2;
			break;
		case BT.HAND:
			if (isNaN(selection)) {
				values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness = 1;
			} else {
				item = abilityLookup(fields.WeaponDB, weapon);
				if (!item) {
					log('handleChangeWeapon not found '+weapon);
					sendDebug('handleChangeWeapon not found '+weapon);
					break;
				};
				weaponSpecs = item.obj[0].get('action').match(/{{\s*weapon\s*=(.*?){{/im);
				weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
				values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness = (parseInt(weaponSpecs[0][3]) || 1);
			}
			break;
		default:
		    InHandTable = tableSet( InHandTable, fields.InHand_name, 2, '-');
		    InHandTable = tableSet( InHandTable, fields.InHand_trueName, 2, '');
		    InHandTable = tableSet( InHandTable, fields.InHand_index, 2, '');
		    break;
		}
        InHandTable = addTableRow( InHandTable, row, values, 'InHand_' );

		// Next add the new weapon to the weapon tables and 
		// at the same time check every weapon InHand for ammo to 
		// add to the quiver
		
		[weaponInfo,Quiver] = updateAttackTables( charCS, InHandTable, Quiver, weaponInfo, row, selection, handedness );
		
		// Then remove any weapons or ammo from the weapon tables that 
		// are not currently inHand (in the InHand or Quiver tables)

		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG' );
		filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO' );
		
		sendAPImacro(curToken,'',trueWeapon,'-inhand');
		
		doCheckAC( [tokenID], isGM, [], true );
		makeChangeWeaponMenu( args, isGM, 'Now using '+weapon+'. ' );

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
			specs = abilityLookup( fields.WeaponDB, weapon ),
			weaponSpecs = specs.obj[0].get('action').match(/{{\s*weapon\s*=.*?(?:\n.*?)*?}}(.*?){{/im),
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
	 
	var handleModWeapon = function( args ) {
		
	// --modWeapon tokenID|weaponName|table|attributes:values
	//  table: Melee,Dmg,Ranged,Ammo
	//  attribute: w,t,st,+,sb,db,n,r,sp,sz,ty,sm,l,
	
		var tokenID = args[1],
			weapon = (args[2]||'').toLowerCase().replace(reIgnore,''),
			tableName = (args[3]||'').toUpperCase(),
			attributes = args[4],
			charCS = getCharacter(tokenID),
			weapData = parseData( ','+attributes+',', reWeapSpecs ),
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
				if (['MELEE','RANGED'].includes(tableName)) {
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
						if (_.isUndefined(fields[group+key])) {
							throw {name:'attackMaster Error',message:('Invalid mod-weapon table '+tableName+' key '+key)};
						} else if (key != 'dmgType') {
							if ((val[0]=='-') || (val[0]=='+')) {
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
						}
					});
				}
			}
		} while (!_.isUndefined(attkName));
		
		if (_.isNull(weapIndex)) {
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

		addTableRow( getAllTables(charCS,'MI')['MI'], index, null, 'Items_' );
		
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
		    MagicItems = getAllTables( charCS, 'MI' )['MI'];
		    
		if (MIrowref >= MagicItems.sortKeys.length) {
    		addTableRow( MagicItems, MIrowref, null, 'Items_' );
		}
		
		setAttr( charCS, fields.ItemRowRef, MIrowref );
		setAttr( charCS, fields.Expenditure, (attrLookup( charCS, fields.Items_cost, fields.Items_table, MIrowref ) || 0 ) );
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
		var MItables = getAllTables( charCS, 'MI' )['MI'],
			slotName = tableLookup( MItables, fields.Items_name, MIrowref ),
			slotType = tableLookup( MItables, fields.Items_type, MIrowref ),
			containerNo = attrLookup( charCS, fields.ItemContainerType ),
			magicItem = abilityLookup( fields.MagicItemDB, MIchosen ),
			values = MItables.values;
		
		if (!magicItem.ct || _.isUndefined(magicItem.ct[0])) {
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
		addTableRow( getAllTables( charCS, 'MI' )['MI'], MIrowref );	// Blanks this table row
		
		// RED: v2.037 calling attackMaster checkAC command to see if 
		//             there has been any impact on AC.
		doCheckAC( [tokenID,'Silent','',senderId], GMonly, [] );

		args[2] = -1;
		args[3] = '';
		makeEditBagMenu( args, senderId, 'Slot '+MIrowref+' has been removed' );
		return;
	};
	
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
		handleModWeapon( args );
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
		makeChangeWeaponMenu( args, isGM );
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
			dmgType = (args[2] || 'sadj').toLowerCase(),
			senderID = args[3],
			curToken = getObj('graphic',tokenID),
			charCS;
			
		if (!curToken)
			{throw {name:'AttackMaster error', message:'Invalid token_id provided.'};}
		charCS = getCharacter( tokenID );
		if (!charCS) return;
		
		if (!['sadj','padj','badj'].includes(dmgType)) {
			throw {name:'attackMaster error', message:'Invalid damage type provided.'};
		}
		
		silent = silent || (silentCmd.toLowerCase().trim() == 'silent');
		isGM = _.isUndefined(senderID) ? isGM : playerIsGM(senderID);
		
		if ((attrLookup( charCS, fields.MonsterAC ) || '').length) {
			if (!silent && isGM) sendFeedback('Monster AC is '+attrLookup( charCS, fields.MonsterAC ));
			return;
		}
		
		var armourInfo = scanForArmour( charCS ),
			acValues = armourInfo.acValues,
			armourMsgs = armourInfo.msgs,
			dexBonus = parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0) * -1,
			baseAC = (parseInt(acValues.armour.data.ac || 10) - parseInt(acValues.armour.data.adj || 0)),
            prevAC = parseInt(attrLookup( charCS, fields.Armour_normal ) || 10),
			dmgAdj = {armoured:{adj:0,madj:0,sadj:0,padj:0,badj:0},
					  sless:{adj:0,madj:0,sadj:0,padj:0,badj:0},
					  aless:{adj:0,madj:0,sadj:0,padj:0,badj:0}},
			magicArmour = acValues.armour.magic,
			armouredDexBonus = dexBonus,
			armourlessDexBonus = dexBonus,
			shieldlessDexBonus = dexBonus,
			armourlessAC = 10,
			ac, currentAC;
			
		_.each( acValues, (e,k) => {
			if (k == 'armour') return;
			if (!k.toLowerCase().includes('protection') || !magicArmour) {
				dmgAdj.armoured = _.mapObject(dmgAdj.armoured, (d,a) => {;return d + parseInt(e.data[a] || 0)});
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

		if (!silent || (ac != prevAC)) {
			args = [tokenID,silent,senderID,dmgType];
			makeACDisplay( args, ac, dmgAdj, acValues, armourMsgs, isGM );
		}
		return;
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
			
		default :
			sendDebug('doButton: Invalid button type');
			sendError('Invalid attackMaster syntax');
		};

	};


	/**
	 * Handle a handshake from another API
	 **/
	 
	/**
	 * Handle handshake request
	 **/
	 
	var doHsQueryResponse = function(args) {
		if (!args) return;
		var from = args[0] || '',
			func = args[1] || '',
			funcTrue = ['menu','other-menu','attk-hit','attk-roll','attk-target','weapon','dance','mod-weapon','quiet-modweap','ammo','setammo','checkac','save','help','check-db','debug'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr attk'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
//		log('AttackMaster recieved handshake query from '+from+((func && func.length) ? (' checking command '+func+' so responding '+funcTrue) : (' and responding')));
		sendRmAPI(cmd);
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
//		log('AttackMaster recieved handshake response from '+from+((func && func.length) ? (' that command '+func+' is '+funcTrue) : (' so it is loaded')));
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
		state.attackMaster.attrsToCreate = {};

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
					doCheckAC(arg, isGM, selected, false);
					break;
				case 'twoswords':
					doMultiSwords(arg,selected);
					break;
				case 'weapon':
					doChangeWeapon(arg,isGM,selected);
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
					doUpdateDB(arg);
					break;
				case 'check-db':
					if (isGM) checkCSdb(arg);
					break;
				case 'hsq':
				case 'handshake':
					doHsQueryResponse(arg);
					break;
				case 'hsr':
					doHandleHsResponse(arg);
					break;
				case 'handout':
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
	attackMaster.init(); 
	attackMaster.registerAPI();
});