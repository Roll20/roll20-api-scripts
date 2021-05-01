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
 * *                   some bug fixes
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = 1.009,
		author = 'RED',
		pending = null;

	var PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	var messages = Object.freeze({
		noChar: '/w "gm" &{template:2Edefault} {{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
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
		AMMO:		'AMMO',
	});
	
	var fields = Object.freeze({
		feedbackName:       'attackMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		defaultTemplate:    '2Edefault',
		MagicItemDB:        'MI-DB',
		WeaponDB:			'MI-DB',
		ToHitRoll:			'1d20',
		Race:               ['race','current'],
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
		Thac0:              ['thac0','current'],
		MonsterThac0:		['monsterthac0','current'],
		AC:					['AC','current'],
		ACstate:			['ACstate','current'],
		ACmod:				['temp-AC','current'],
		Armour_normal:		['ACtouch','current'],
		Armour_missile:		['ACmissile','current'],
		Armour_surprised:	['ACsurprise','current'],
		Armour_back:		['ACback','current'],
		Armour_head:		['AChead','current'],
		Shieldless_normal:	['ACshieldless','current'],
		Shieldless_missile:	['ACmissile','max'],
		Shieldless_surprised:['ACsurprise','max'],
		Shieldless_back:	['ACback','max'],
		Shieldless_head:	['AChead','max'],
		Armourless_normal:	['ACshieldless','max'],
		Armourless_missile:	['ACarmourless-missile','current'],
		Armourless_surprised:['ACarmourless-surprise','current'],
		Armourless_back:	['ACarmourless-back','current'],
		Armourless_head:	['ACarmourless-head','current'],
		initMultiplier:     ['comreact','max'],
		initMod:            ['comreact','current'],
		Strength_hit:       ['strengthhit','current'],
		Strength_dmg:       ['strengthdmg','current'],
		Magic_hitAdj:		['strengthhit','max'],
		Magic_dmgAdj:       ['strengthdmg','max'],
		Dex_missile:        ['dexmissile','current'],
		Dex_react:          ['dexreact','current'],
		Backstab_mult:      ['backstabmultiplier','current'],
		NonProfPenalty:     ['nonprof-penalty','current'],
		Primary_weapon:		['weapno','max'],
		MW_table:           ['repeating_weapons',false],
		MW_name:            ['weaponname','current','-'],
		MW_type:			['weaponname','max',''],
		MW_range:			['range','current','5'],
		MW_superType:		['range','max',''],
		MW_speed:           ['weapspeed','current','5'],
		MW_noAttks:         ['attacknum','current','1'],
		MW_attkAdj:         ['attackadj','current','0'],
		MW_strBonus:        ['strbonus','current','1'],
		MW_twoHanded:       ['twohanded','current','0'],
		MW_size:            ['size','current','M'],
		MW_miName:          ['size','max',''],
		MW_profLevel:       ['prof-level','current','0'],
		MW_critHit:         ['crit-thresh','current','20'],
		MW_critMiss:        ['crit-thresh','max','1'],
		Dmg_table:			['repeating_weapons-damage',false],
		Dmg_name:         	['weaponname1','current','-'],
		Dmg_dmgAdj:         ['damadj','current','0'],
		Dmg_dmgSM:          ['damsm','current',''],
		Dmg_dmgL:           ['daml','current',''],
		Dmg_strBonus:       ['strBonus1','current','0'],
		Dmg_specialist:     ['specialist-damage','current','0'],
		RW_table:           ['repeating_weapons2',false],
		RW_name:            ['weaponname2','current','-'],
		RW_type:			['weaponname2','max',''],
		RW_speed:           ['weapspeed2','current','5'],
		RW_noAttks:         ['attacknum2','current','1'],
		RW_attkAdj:         ['attackadj2','current','0'],
		RW_strBonus:        ['strbonus2','current','0'],
        RW_dexBonus:        ['dexbonus2','current','1'],
        RW_twoHanded:       ['twohanded2','current','0'],
		RW_profLevel:       ['prof-level2','current','0'],
		RW_crit:            ['crit-thresh2','current','20'],
		RW_critHit:         ['crit-thresh2','current','20'],
		RW_critMiss:        ['crit-thresh2','max','1'],
		RW_size:            ['size2','current','M'],
		RW_miName:          ['size2','max',''],
		RW_range:           ['range2','current','-/1/2/3'],
		RW_superType:		['range2','max',''],
		RWrange_mod:		['rangemod-','current'],
		Ammo_table:         ['repeating_ammo',false],
		Ammo_name:          ['ammoname','current','-'],
		Ammo_miName:        ['daml2','max',''],
		Ammo_type:			['ammoname','max',''],
		Ammo_strBonus:      ['strbonus3','current','0'],
		Ammo_dmgAdj:        ['damadj2','current','0'],
		Ammo_attkAdj:       ['damadj2','max','0'],
		Ammo_dmgSM:         ['damsm2','current',''],
		Ammo_dmgL:          ['daml2','current',''],
		Ammo_range:        	['damsm2','max',''],
		Ammo_qty:           ['ammoremain','current',''],
		Ammo_maxQty:		['ammoremain','max',''],
		WP_table:           ['repeating_weaponprofs',false],
		WP_name:            ['weapprofname','current','-'],
		WP_type:            ['weapprofname','max',''],
		WP_specialist:      ['specialist','current','0'],
		WP_mastery:         ['mastery','current','0'],
		WP_backstab:        ['chosen-weapon','current','0'],
		MUbaseCol:          1,
		PRbaseCol:          28,
		SpellsCols:         3,
		Spells_table:       ['repeating_spells',false],
		Spells_name:        ['spellname','current','-'],
		Spells_speed:       ['casttime','current','5'],
		PowersBaseCol:      67,
		PowersCols:         3,
		Powers_table:       ['repeating_spells',false],
		Powers_name:        ['spellname','current','-'],
		Powers_speed:       ['casttime','current','0'],
		MIRows:             24,
		MI_table:           ['repeating_potions',true],
		MI_name:            ['potion','current','-'],
		MI_trueName:        ['potion','max',''],
		MI_speed:           ['potion-speed','current','5'],
		MI_trueSpeed:       ['potion-speed','max','5'],
		MI_qty:             ['potionqty','current',''],
		MI_trueQty:         ['potionqty','max',''],
		MI_cost:            ['potion-macro','current','0'],
		MI_type:            ['potion-macro','max','uncharged'],
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
		Equip_leftHand:		['worn-Weapon1','current'],
		Equip_rightHand:	['worn-Weapon2','current'],
		Equip_bothHands:	['worn-Hands','current'],
		Equip_auto1Slot:	['worn-Weapon3','current'],
		Equip_auto2Slot:	['worn-Weapon4','current'],
		MonsterAttk1:		['monsterAttk1','current'],
		MonsterAttk2:		['monsterAttk2','current'],
		MonsterAttk3:		['monsterAttk3','current'],
		MonsterCritHit:		['monstercrit','current'],
		MonsterCritMiss:	['monstercrit','max'],
		MonsterDmg1:		['monsterdmg','current'],
		MonsterDmg2:		['monsterdmg2','current'],
		MonsterDmg3:		['monsterdmg3','current'],
	});

	var tableIntro = Object.freeze({
		MELEE:['MW_',fields.MW_table],
		DMG:['Dmg_',fields.Dmg_table],
		RANGED:['RW_',fields.RW_table],
		AMMO:['Ammo_',fields.Ammo_table],
		WPROF:['WP_',fields.WP_table],
		MI:['MI_',fields.MI_table],
		SPELL:['Spells_',fields.Spells_table],
		POWER:['Powers_',fields.Powers_table],
	});
	
	var reIgnore = /[\s\-\_]*/gi;
	
	var classLevels = [[fields.Fighter_class,fields.Fighter_level],
					   [fields.Wizard_class,fields.Wizard_level],
					   [fields.Priest_class,fields.Priest_level],
					   [fields.Rogue_class,fields.Rogue_level],
					   [fields.Psion_class,fields.Psion_level]];
	
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
		if (!state.attackMaster.attrsToCreate)
			{state.attackMaster.attrsToCreate = {};}
		if (!state.attackMaster.twoWeapons)
		    {state.attackMaster.twoWeapons = {};}
		if (!state.attackMaster.debug)
		    {state.attackMaster.debug = false;}
			

		log(`-=> attackMaster v${version} <=-`);

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
        
		var to, controlledBy, players, isPlayer=false; 
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
		    	{throw ('sendDebug could not find player');}
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
			{throw ('doSetDebug could not find player: ' + args);}
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
	
// Magic Master 2.020

/* --------------------------------------------------- Table Management --------------------------------------------- */

	/*
	 * A function to get the whole of a repeating table in 
	 * two parts: an array of objects indexed by Roll20 object IDs,
	 * and an array of object IDs indexed by repeating table row number.
	 * Returns an object containing the table, and all parameters defining
	 * that table and where it came from.
	 */
	 
	var getTable = function(character,tableObj,name,tableDef,attrDef,col='',defaultVal=null,caseSensitive=false) {
        let rowName;
	    if (tableDef && !_.isNull(tableDef) && !tableDef[1] && col && col==1) {col = '';}
	    if (tableDef && !_.isNull(tableDef)) {
            rowName = tableDef[0]+col+'_$0_'+attrDef[0]+col;
	    } else {
            rowName = attrDef[0];
	    }
		if (_.isNull(defaultVal)) {
			defaultVal=attrDef[2];
		}
//        log('getTable table is '+rowName);
		tableObj.character=character;
		tableObj.table=tableDef;
		tableObj.column=col;
		tableObj[name]={property:attrDef,defaultVal:defaultVal};
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
	
	/**
	 * A function to take a table obtained using getTable() and a row number, and 
	 * safely return the value of the table row, or undefined.  Uses the table object
	 * parameters such as the character object it came from and the field property.
	 * If the row entry is undefined use a default value if set in the getTable() call,
	 * which can be overridden with an optional parameter.  Can just return the row 
	 * object or can return a different property of the object using the second optional parameter.
	 */
	 
	var tableLookup = function( tableObj, name, index, defVal=true, getObj=false ) {
//        log('tableLookup tableObj:'+!!tableObj+', index:'+index+', getObj:'+getObj);
        var val;
		if (tableObj[name]) {
//		    log('tableLookup found tableObj '+tableObj.table[0]);
			let property = (_.isObject(getObj) ? getObj : (getObj == false ? tableObj[name].property : null));
			defVal = (!_.isBoolean(defVal)) ? defVal : (defVal ? tableObj[name].defaultVal : undefined);
			if (index>=0) {
				let attrs = tableObj[name].attrs,
					sortOrderKeys = tableObj.sortKeys;
				if (index<sortOrderKeys.length && _.has(attrs,sortOrderKeys[index])) {
					if (_.isUndefined(property) || _.isNull(property) || !property || !property[1] || _.isUndefined(attrs[sortOrderKeys[index]])) {
//					    log('tableLookup undefined property or object')
						return attrs[sortOrderKeys[index]];
					} else {
						val = attrs[sortOrderKeys[index]].get(property[1]);
						if (_.isUndefined(val)) {
//						    log('tableLookup property '+property[0]+' undefined, setting to '+defVal+', table default is '+tableObj.defaultVal);
						    val = defVal;
						};
						return val;
					}
				}
//				log('tableLookup index '+index+' beyond length '+sortOrderKeys.length+' or not in attrs');
			} else if (!_.isUndefined(property) && !_.isNull(property)) {
//			    log('tableLookup first row static, index:'+index+', property.length:'+property.length+', property:'+property);
				val = attrLookup( tableObj.character, property );
				if ( _.isUndefined(val)) {
//				    log('tableLookup property '+property[0]+' undefined, setting to '+defVal+', table default is '+tableObj.defaultVal);
				    val = defVal;
				}
				return val;
			}
		}
//		log('tableLookup returning undefined');
		return undefined;
	}

	/**
	 * A function to take a table obtained using getTable() a row number, and 
	 * a value, and safely set the value of the property, 
	 * returning true for success and false for failure, or undefined if 
	 * it tries setAttr to create an entry that does not exist.
	 */
	 
	 var tableSet = function( tableObj, name, r, attrValue, caseSensitive ) {
		
		if (tableObj[name]) {
			if (_.isUndefined(attrValue)) {
				attrValue = tableObj[name].defaultVal;
			}
    		if (r < 0) {
    		    // log('tableSet r<0 setting '+tableObj[name].property[0]+' to '+attrValue);
    		    setAttr( tableObj.character, tableObj[name].property, attrValue, tableObj.table, r, tableObj.column, caseSensitive );
    		    return tableObj;
    		}
			let attrs = tableObj[name].attrs,
				sortOrderKeys = tableObj.sortKeys,
				attrDef = tableObj[name].property,
				value = {},
				rowObj;
			    
			value[attrDef[1]]=String(attrValue);
			// log('tableSet r='+r+', sok.length='+sortOrderKeys.length);
			if (r<sortOrderKeys.length && !_.has(attrs,sortOrderKeys[r])) {
				let finalName = tableObj.table[0]+tableObj.column+'_'+sortOrderKeys[r]+'_'+tableObj[name].property[0]+tableObj.column;
				// log('tableSet create obj r='+r+', length='+sortOrderKeys.length+', _.has(attrs[sok[r]])='+_.has(attrs,sortOrderKeys[r])+', trying to set '+finalName+' to '+attrValue);
				rowObj = createObj( "attribute", {characterid: tableObj.character.id, name: finalName});
				rowObj.setWithWorker(value);
				tableObj = getTable( tableObj.character, tableObj, name, tableObj.table, attrDef, tableObj.column, tableObj[name].defaultVal, caseSensitive );
			} else if (r<sortOrderKeys.length && _.has(attrs,sortOrderKeys[r])
										&& !_.isUndefined(attrDef)
										&& !_.isNull(attrDef)
										&& attrDef[1]
										&& !_.isUndefined(attrs[sortOrderKeys[r]])) {
				attrs[sortOrderKeys[r]].setWithWorker(value);
	            // log('tableSet able to set '+tableObj.table[0]+' row '+r+' '+attrDef+' to '+attrs[sortOrderKeys[r]].get(attrDef[1])+', should be'+attrValue);
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
	 */
	
	var addTableRow = function( tableObj, index, values, fieldGroup ) {
	    
		let rowObj, newVal, list = tableObj;
		    
	    log('addTableRow called, tableObj.table='+tableObj.table[0]+', index='+index+', fieldGroup='+tableObj.fieldGroup+', table '+(tableObj.fieldGroup+'name')
	                    +', value='+tableLookup( tableObj, (tableObj.fieldGroup+'name'), index, false ));
		if ((index < 0) || !_.isUndefined(tableLookup( tableObj, (tableObj.fieldGroup+'name'), index, false ))) {
			_.each( list, (elem,key) => {
				if (_.isUndefined(elem.property)) {return;}
				newVal = (!values || _.isUndefined(values[elem.property[0]])) ? undefined : values[elem.property[0]][elem.property[1]];
				log('addTableRow index='+index+' static or exists, setting '+key+' to be '+newVal);
				tableObj = tableSet( tableObj, key, index, newVal );
			});
		} else {
			let rowObjID = generateRowID(),
				maxList = {},
			    namePt1 = tableObj.table[0]+tableObj.column+'_'+rowObjID+'_';
			fieldGroup = fieldGroup || tableObj.fieldGroup;
			_.each( list, (elem,key) => {
				if (elem.property && elem.property[1].toLowerCase() == 'current') {
					log('addTableRow found elem '+key+'.'+elem.property[0]+'.'+elem.property[1]);
					rowObj = createObj( "attribute", {characterid: tableObj.character.id, name: (namePt1+elem.property[0]+tableObj.column)} );
					if (!values || _.isUndefined(values[elem.property[0]])) {
						newVal = {current: (_.isUndefined(elem.property[2]) ? '' : elem.property[2]), max: ''};
					} else {
						newVal = values[elem.property[0]];
					}
					log('addTableRow creating elem[0] '+elem.property[0]+', newVal.current '+newVal.current+' max '+newVal.max+'');
					rowObj.setWithWorker(newVal);
					tableObj[key].attrs[rowObjID] = rowObj;
					tableObj.sortKeys[index] = rowObjID;
					maxList[elem.property[0]] = rowObj;
				}
				return;
			});
			_.each( list, (elem,key) => {
				if (elem.property && elem.property[1].toLowerCase() == 'max') {
					tableObj[key].attrs[rowObjID] = maxList[elem.property[0]];
				}
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
	 
	var tableFind = function( tableObj, name, val ) {
		
        val = val.toLowerCase().replace(reIgnore,'');
		let property = tableObj[name].property[1];
		if (!tableObj.table[1] && val == attrLookup( tableObj.character, tableObj[name].property ).toLowerCase().replace(reIgnore,'')) {
			return -1;
		}
		let tableIndex = tableObj.sortKeys.indexOf(
								_.findKey(tableObj[name].attrs, function( elem, objID ) {return val == elem.get(property).toLowerCase().replace(reIgnore,'');})
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
				tableObj = getTable(character,{},'temp',tableDef,attrDef,c,caseSensitive);
//			if (_.isNull(tableDef)) {log('attrLookup tableLookup for '+tableObj.property);}
			return tableLookup(tableObj,'temp',index,false);
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
	
	var setAttr = function( charCS, attrDef, attrValue, tableDef, r, c, caseSensitive ) {
	    
//	    if(_.isUndefined(attrDef)) {log('setAttr attrDef:'+attrDef+', attrValue:'+attrValue+', tableDef:'+tableDef+', r:'+r+', c:'+c);}
	    
		var name;

	    try {
	        name = attrDef[0];
	    } catch {
	        // log('setAttr attrDef is '+attrDef+', attrValue is '+attrValue);
	        return undefined;
	    }
		
		if (!_.isUndefined(tableDef) && (tableDef[1] || r >= 0)) {
			c = (c && (tableDef[1] || c != 1)) ? c : '';
			name = tableDef[0] + c + '_$' + r + '_' + attrDef[0] + c;
//            log('setAttr: table:'+tableDef[0]+', r:'+r+', c:'+c+', name:'+name);
		} else {
//            log('setAttr: name:'+attrDef);
			name = attrDef[0];
		}
		var attrObj = attrLookup( charCS, [name, null], null, null, null, caseSensitive ),
		    createList = !!state.attackMaster.attrsToCreate[charCS.id],
		    createStr, name;
		    
		if (!attrObj) {
		    log( 'setAttr: ' + name + ' not found.  Adding to list for creation');
		    sendDebug( 'setAttr: ' + name + ' not found.  Adding to list for creation');
		    createStr = ' --' + name + (attrDef[1].toLowerCase() == 'max' ? '|' : '') + '|' + attrValue ;
		    if (createList) {
    			state.attackMaster.attrsToCreate[charCS.id] += createStr;
		    } else {
		        state.attackMaster.attrsToCreate[charCS.id] = createStr;
		    }
			sendDebug( 'setAttr: attrs to create for ' + charCS.get('name') + state.attackMaster.attrsToCreate[charCS.id]);
		} else {
//    		log('setAttr: attrObj.get(name) = '+attrObj.get('name'));
		
		    if (_.isUndefined(attrDef)) {log('setAttr attrDef corrupted:'+attrDef);return undefined;}
		    sendDebug( 'setAttr: character ' + charCS.get('name') + ' attribute ' + attrDef[0] + ' ' + attrDef[1] + ' set to ' + attrValue );
			attrObj.setWithWorker( attrDef[1], String(attrValue) );
		}
		return;
	}
	
	/**
	* Create any pending attributes in attrsToCreate using ChatSetAttr
	* rather than build a function myself - though this will only
	* handle simple attributes, not repeating tables
	**/
	
	var createAttrs = function( silent, replace ) {
		
		if (state.attackMaster.attrsToCreate) {
			_.each( state.attackMaster.attrsToCreate, function( attrs, charID ) {
				let setVars = '!setattr ' + ( silent ? '--silent ' : '' ) + ( replace ? '--replace ' : '' ) + '--charid ' + charID;
					setVars += attrs;
				sendDebug( 'createAttrs: creating attributes for ' + getAttrByName( charID, 'character_name' ));
				sendAttkAPI( setVars );
			});
			state.attackMaster.attrsToCreate = {};
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
		
        abilityName = abilityName.toLowerCase().trim();
        rootDB = rootDB.toLowerCase();
        if (!abilityName || abilityName.length==0) {
			return {dB: rootDB, obj: undefined, ct: undefined};
        }
	    
        var dBname,
			ctObj,
			magicDB, magicName,
            abilityObj = _.chain(findObjs({type: 'ability', name: abilityName}, {caseInsensitive:true}))
                            .filter(function(obj) {
                                if (!(magicDB = getObj('character',obj.get('characterid')))) {return false;}
                                magicName = magicDB.get('name').toLowerCase();
                   			if ((magicName.indexOf(rootDB) !== 0) || (/\s*v\d*\.\d*/i.test(magicName))) {return false;}
                    			if (!dBname) dBname = magicName;
                    			return true;
                            }).value();
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
		
        AC.shielded = {};
        AC.shieldless = {};
        AC.armourless = {};

		AC.shielded.normal = attrLookup(charCS,fields.Armour_normal) || 0;
		AC.shielded.missile = attrLookup(charCS,fields.Armour_missile) || 0;
		AC.shielded.surprised = attrLookup(charCS,fields.Armour_surprised) || 0;
		AC.shielded.back = attrLookup(charCS,fields.Armour_back) || 0;
		AC.shielded.head = attrLookup(charCS,fields.Armour_head) || 0;
		
		AC.shieldless.normal = attrLookup(charCS,fields.Shieldless_normal) || 0;
		AC.shieldless.missile = attrLookup(charCS,fields.Shieldless_missile) || 0;
		AC.shieldless.surprised = attrLookup(charCS,fields.Shieldless_surprised) || 0;
		AC.shieldless.back = attrLookup(charCS,fields.Shieldless_back) || 0;
		AC.shieldless.head = attrLookup(charCS,fields.Shieldless_head) || 0;
		
		AC.armourless.normal = attrLookup(charCS,fields.Armourless_normal) || 0;
		AC.armourless.missile = attrLookup(charCS,fields.Armourless_missile) || 0;
		AC.armourless.surprised = attrLookup(charCS,fields.Armourless_surprised) || 0;
		AC.armourless.back = attrLookup(charCS,fields.Armourless_back) || 0;
		AC.armourless.head = attrLookup(charCS,fields.Armourless_head) || 0;
		
		return AC;
	}
	
	/*
	 * Create a Roll Query with a list of either 1H or 2H 
	 * weapons from the character's magic item bag
	 */
	
	var weaponQuery = function( charCS, handed ) {
		
		var item, itemDef,
			weapon, weaponTypes,
			MagicItems = getTable( charCS, {}, 'MI_name', fields.MI_table, fields.MI_name ),
			weaponList = ['-,'],
			i = fields.MI_table[1] ? 0 : -1;
			
		do {
			item = tableLookup( MagicItems, 'MI_name', i, false );
			if (_.isUndefined(item)) {break;}
			itemDef = abilityLookup( fields.WeaponDB, item );
//			log('weaponQuery i:'+i+', item:'+item+', itemDef.dB:'+itemDef.dB+', itemDef.obj[0]:'+itemDef.obj[0]);
			if (itemDef.obj[0]) {
				let reWeapon = new RegExp( '{{\\s*?weapon\\s*?=.*?[\\[,]\\s*?'+handed+'H\\s*?[\\],].*?}}', 'i' ),
					reShield = new RegExp( '{{\\s*?shield\\s*?=.*?[\\[,]\\s*?'+handed+'H\\s*?[\\],].*?}}', 'i' ),
				    action = itemDef.obj[0].get('action');
				if (reWeapon.test(action) || reShield.test(action)) {
//				    log('weaponQuery found item '+item+' at index '+i);
					weaponList.push(item+','+i);
				} else {
//				    log('weaponQuery not weapon:'+action);
				}
			}
//			log('i:'+i);
		} while (++i < fields.MIRows);
		
//		log('final i:'+i+', fields.MIRows:'+fields.MIRows);
		return '&#63;{Which weapon?|'+weaponList.join('|')+'}';
	}
	
	/*
	 * Check for a character's proficiency with a weapon type
	 */
	
	var proficient = function( charCS, wt, wst ) {
		
        wt = wt.toLowerCase().replace(reIgnore,'');
        wst = wst.toLowerCase().replace(reIgnore,'');
        
        // log('proficient testing for wt '+wt+', wst '+wst);

		var i = fields.WP_table[1] ? 0 : -1,
			prof = getCharNonProfs( charCS ),
			WeaponProfs = getTable( charCS, {}, 'WP_name', fields.WP_table, fields.WP_name ),
			WeaponProfs = getTable( charCS, WeaponProfs, 'WP_type', fields.WP_table, fields.WP_type ),
			WeaponProfs = getTable( charCS, WeaponProfs, 'WP_specialist', fields.WP_table, fields.WP_specialist ),
			WeaponProfs = getTable( charCS, WeaponProfs, 'WP_mastery', fields.WP_table, fields.WP_mastery ),
			spec;
			
//		log('proficient WPnames properties '+WPnames.property);

		do {
			let wpName = tableLookup( WeaponProfs, 'WP_name', i, false ),
				wpType = tableLookup( WeaponProfs, 'WP_type', i );
			if (_.isUndefined(wpName)) {break;}
            wpName = wpName.toLowerCase().replace(reIgnore,'');
            wpType = (wpType ? wpType.toLowerCase().replace(reIgnore,'') : '');
			// log('proficient row '+i+': type '+wpName+' superType '+wpType);
			if (wpName && wpName.length && wt.includes(wpName)) {
			    // log('proficient found '+wpName);
				prof = 0;
				spec = tableLookup( WeaponProfs, 'WP_specialist', i );
				if (spec && spec != 0) {
					prof = 2;
				}
				spec = tableLookup( WeaponProfs, 'WP_mastery', i );
				if (spec && spec != 0) {
					prof = 3;
				}
			} else if (wpType && (wst.includes(wpType))) {
			    // log('proficient found superType '+wpType)
				prof = Math.floor(prof/2);
			} else {
			    // log('proficient not found anything');
			}
			i++;
		} while (prof < 0);
		if (prof < 0 && !classProficiency( charCS, wt, wst )) {
		    prof *= 2;
		}
		// log('Final prof level = '+prof);
		return prof;
	};
	
	/*
	 * Determine the class or classes of the character, and 
	 * the level of each
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
    		mods = _.find( raceToHitMods, (elem,r) => {return (r.toLowerCase() == race.toLowerCase());});
		if (_.isUndefined(mods)) {return 0;}
		weaponMod = _.find( mods, elem => {return [wt.toLowerCase(),wst.toLowerCase()].includes(elem[0].toLowerCase());});
		if (_.isUndefined(weaponMod)) {return 0;}
		return weaponMod[1];
	}
	
	/*
	 * Determine if a particular weapon type or superType is an 
	 * allowed type for a specific class.  If not, the non-proficiency 
	 * penalty is doubled.
	 */
	 
	var classProficiency = function( charCS, wt, wst ) {

        wt = wt.toLowerCase().replace(reIgnore,'');
        wst = wst.toLowerCase().replace(reIgnore,'');
	    
		var charLevels = (getCharLevels( charCS ) || fields.Fighter_level),
    		validWeapon = _.filter( classLevels, a => {
    		    return _.some( charLevels, b => {
    		        return (a[1].includes(b[0]))
    		    })
    		})
			.some( elem => {
        	    let charClass = attrLookup(charCS,elem[0]) || '',
        	        allowedWeapons = classAllowedWeaps[charClass.toLowerCase()];
//        	    log('classProficiency charClass='+charClass+', allowedWeapons='+allowedWeapons);
        	    if (_.isUndefined(allowedWeapons))
        	        {return false;}
                return allowedWeapons.includes('any') || allowedWeapons.includes(wt.toLowerCase()) || allowedWeapons.includes(wst.toLowerCase());  	    
        	});
		
//		log('classProficiency charLevels = '+charLevels+', [0]='+charLevels[0]+', [1]='+charLevels[1]);
//		log('classProficiency classLevels = '+classLevels+', [0][0]='+classLevels[0][0]+', [0][1]='+classLevels[0][1]);
//		log('classProficiency charClasses = '+charClasses);
//		log('classProficiency wt='+wt+', wst='+wst+', validWeapon='+validWeapon);
		return validWeapon;
	};
	
	/*
	 * Determine the number of attacks per round for a weapon,
	 * using the type, superType or class (melee/ranged) of 
	 * the weapon.
	 */
	 
	var getAttksPerRound = function( charCS, attksData, wt, wst, wc ) {
        wt = wt.toLowerCase().replace(reIgnore,'');
        wst = wst.toLowerCase().replace(reIgnore,'');
        wc = wc.toLowerCase().replace(reIgnore,'');
		var boost;
		if (_.isUndefined(boost = attksData[wt])) {
			// log('attks/round not wt '+wt);
			if (_.isUndefined(boost = attksData[wst])) {
				// log('attks/round not wst '+wst);
				if (_.isUndefined(boost = attksData[wc])) {
					// log('attks/round not wc '+wc);
					return '+0';
				}
			}
		}
		let result = (boost[(Math.min(Math.ceil((attrLookup( charCS, fields.Fighter_level ) || 0)/6),3)-1)] || '+0'),
		    level = attrLookup( charCS, fields.Fighter_level );
		// log('attks/round level '+level+', /6='+Math.ceil(level/6)+', min(,3)-1='+(Math.min(Math.ceil(level/6),3)-1)+' boost is '+boost+', result is '+result);
		return result;
	}
	
	/*
	 * Blank the specified weapon table, ready to have new
	 * weapons specified.
	 */

	var blankTable = function( charCS, tableInfo, table ) {
		
		var i, base, TableObj;
		
		switch (table.toUpperCase()) {
		case 'MELEE':
			base = tableInfo.indicies.MW;
			TableObj = tableInfo[table];
			break;
		case 'RANGED':
			base = tableInfo.indicies.RW;
			TableObj = tableInfo[table];
			break;
		case 'DMG':
			base = tableInfo.indicies.Dmg;
			TableObj = tableInfo[table];
			break;
		case 'AMMO':
			base = tableInfo.ammoInfo.ammoIndex;
			TableObj = tableInfo[table];
			break;
		default:
			return;
		}

		_.each(TableObj, (elem,key) => {
		    i = base-1;
		    if (!elem.property) {return;}
		    // log('Blanking '+elem.property+' of '+TableObj.table[0]+', key '+key);
			while (!_.isUndefined(tableLookup(TableObj,key,++i,false))) {
			    // log('Setting row '+i+' to '+elem.defaultVal);
				tableSet( TableObj, key, i, elem.defaultVal );
			}
		});
		return;
	};
	
	/*
	 * Insert ammo that has been found into the Ammo table
	 */
	
	var insertAmmo = function( charCS, ammoName, ammoSpecs, rangeSpecs, tableInfo, ammoType, sb, miIndex ) {
        if (tableInfo.ammoInfo.ammoTypes.includes(ammoName+'-'+ammoType)) {return tableInfo;}
		tableInfo.ammoInfo.ammoTypes.push(ammoName+'-'+ammoType);
		for (let w=0; w<ammoSpecs.length; w++) {
			let ammoData = ammoSpecs[w][0],
			    values = initValues( tableInfo.AMMO.fieldGroup );
			values[fields.Ammo_name[0]][fields.Ammo_name[1]]=(ammoData.match(/w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','Unknown ammo'])[1];
			values[fields.Ammo_strBonus[0]][fields.Ammo_strBonus[1]]=(sb ? (ammoData.match(/sb:\s*?([01])\s*?[,\]]/i) || [0,0])[1] : 0);
			values[fields.Ammo_dmgAdj[0]][fields.Ammo_dmgAdj[1]]=(ammoData.match(/\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || [0,0])[1];
			values[fields.Ammo_dmgSM[0]][fields.Ammo_dmgSM[1]]=(ammoData.match(/sm:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
			values[fields.Ammo_dmgL[0]][fields.Ammo_dmgL[1]]=(ammoData.match(/l:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
			values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=(attrLookup( charCS, fields.MI_qty, fields.MI_table, miIndex ) || 1);
			values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]]=(attrLookup( charCS, fields.MI_trueQty, fields.MI_table, miIndex ) || 1);
			values[fields.Ammo_attkAdj[0]][fields.Ammo_attkAdj[1]]=(rangeSpecs[0][0].match(/\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || ['',''])[1];
			values[fields.Ammo_range[0]][fields.Ammo_range[1]]=(rangeSpecs[0][0].match(/r:\s*?([\d\/]+)/i) || ['',''])[1];
			values[fields.Ammo_type[0]][fields.Ammo_type[1]]=ammoType;
			values[fields.Ammo_miName[0]][fields.Ammo_miName[1]]=ammoName;
			// log('insertAmmo values[fields.Ammo_name[0]].current='+values[fields.Ammo_name[0]].current+', max='+values[fields.Ammo_name[0]].max);

			tableInfo['AMMO'] = addTableRow( tableInfo['AMMO'], tableInfo.ammoInfo.ammoIndex, values );
			tableInfo.ammoInfo.ammoIndex++;
		}
		return tableInfo;
	}

	/*
	 * Add a weapon to the weapon tables.  Get the full specs from 
	 * the magic item database.  If it is a ranged weapon, also 
	 * search for matching ammo.  Use a returned array to ensure 
	 * ammo duplications don't occur
	 */

	var addWeapon = function( charCS, hand, noOfHands, lineNo, tableInfo ) {
	    // log('addWeapon hand:'+hand+', lineNo:'+lineNo);
		if (isNaN(lineNo) || lineNo < -1) {
			setAttr( charCS, hand, '' );
			return tableInfo;
		}
		var indicies = tableInfo.indicies,
//			ammoInfo = tableInfo.ammoInfo,
			MWindex = indicies.MW,
			RWindex = indicies.RW,
			weaponName = attrLookup( charCS, fields.MI_trueName, fields.MI_table, lineNo ),
			item = abilityLookup(fields.WeaponDB, weaponName),
			specs = item.obj[0].get('action'),
			weaponSpecs = specs.match(/{{\s*weapon\s*=(.*?)}}/im),
			toHitSpecs = specs.match(/{{\s*to-hit\s*=(.*?)}}/im),
			dmgSpecs = specs.match(/{{\s*damage\s*=(.*?)}}/im),
			ammoSpecs = specs.match(/{{\s*ammo\s*=(.*?)}}/im),
			re = /[\s\-]*?/gi,
			tempObj, values,
			wt, wst, dmg;

		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
		toHitSpecs = toHitSpecs ? [...('['+toHitSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		dmgSpecs = dmgSpecs ? [...('['+dmgSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];

		// log('addWeapon name:'+weaponName+', specs:'+specs);	
		// log('addWeapon dmg:'+specs.match(/{{\s*damage\s*=(.*?)}}/im));
		// log('addWeapon weaponSpecs:'+weaponSpecs);
		// log('addWeapon toHitSpecs:'+toHitSpecs);
		// log('addWeapon dmgSpecs:'+dmgSpecs);
		// log('addWeapon ammoSpecs:'+ammoSpecs);
			
		setAttr( charCS, hand, attrLookup(charCS,fields.MI_name,fields.MI_table,lineNo) );

		for (let i=0; i<Math.min(weaponSpecs.length,toHitSpecs.length); i++) {
			let weapon = weaponSpecs[i],
				toHit = toHitSpecs[i][0],
				proficiency = Math.min(proficient( charCS, weapon[1], weapon[4] ),1),
				attk2H = weapon[3]=='2H' ? 1 : 0;
			
			// log('addWeapon proficiency of '+weaponName+' type '+weapon[1]+' superType '+weapon[4]+' is '+proficiency);
			// log('noOfHands is '+noOfHands+', weapon[3] is '+weapon[3]+', attk2H is '+attk2H+', test result is '+((noOfHands != 0) && (noOfHands !=  (attk2H+1))));
				
			if ((noOfHands == 0) || (noOfHands ==  (attk2H+1))) {
			
     			// log('addWeapon loop weaponSpecs['+i+']:'+weapon+', weapon type:'+weapon[2]);
    			// log('addWeapon loop toHitSpecs['+i+'][0]:'+toHit);
    			// log('addWeapon loop attkName will be:'+toHit.match(/w:([\s\w\-\+\,\:]+?)[\,\]]/i));
    			// log('addWeapon loop attkStrBonus will be:'+toHit.match(/sb:([01])/i));
    			// log('addWeapon loop attkDexBonus will be:'+toHit.match(/db:([01])/i));
    			// log('addWeapon loop attkAdj will be:'+toHit.match(/\+:([+-]?\d+?)/i));
    			// log('addWeapon loop attkNum will be:'+toHit.match(/n:([\d\/]+)/i));
    			// log('addWeapon loop attkCritHit will be:'+toHit.match(/c:(\d+?)/i));
    			// log('addWeapon loop attkCritMiss will be:'+toHit.match(/m:(\d+?)/i));
    			// log('addWeapon loop attkSize will be:'+toHit.match(/sz:([tsmlh])/i));
    			// log('addWeapon loop attkRange will be:'+toHit.match(/r:([\d\/]+)/i));
       			// log('addWeapon loop attkSpeed will be:'+toHit.match(/sp:(\d+?)/i));
    			let attkName = (toHit.match(/w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','Unknown weapon'])[1],
    				attkStrBonus = (toHit.match(/sb:([01])/i) || [0,0])[1],
    				attkDexBonus = (toHit.match(/db:([01])/i) || [1,1])[1],
    				attkAdj = (toHit.match(/\+:([+-]?\d+?)[,\]]/i) || [0,0])[1],
    				attkNum = (toHit.match(/n:([\d\/]+)[,\]]/i) || [1,1])[1],
    				attkCritHit = (toHit.match(/c:(\d+?)[,\]]/i) || [20,20])[1],
    				attkCritMiss = (toHit.match(/m:(\d+?)[,\]]/i) || [1,1])[1],
    				attkSize = (toHit.match(/sz:([tsmlh])/i) || ['M','M'])[1],
    				attkRange = (toHit.match(/r:([\d\/]+)[,\]]/i) || ['',''])[1],
    				attkSpeed = (toHit.match(/sp:(\d+?)[,\]]/i) || [5,5])[1];

				attkNum = eval('2*('+attkNum + getAttksPerRound( charCS, 
																 weapMultiAttks[(proficiency>0) ? 'Specialist' : 'Proficient'], 
																 weapon[1],
																 weapon[4], 
																 weapon[2] )+')');
				attkNum = (attkNum % 2) ? attkNum + '/2' : attkNum/2;
				// log('attkNum = '+attkNum);

    			if (weapon[2].toLowerCase() == 'melee') {
    			    // log('setting up melee weapon '+indicies.MW+' as '+attkName);
    			    values = initValues( tableInfo.MELEE.fieldGroup );
    			    values[fields.MW_name[0]][fields.MW_name[1]]=attkName;
    			    values[fields.MW_twoHanded[0]][fields.MW_twoHanded[1]]=attk2H;
    			    values[fields.MW_strBonus[0]][fields.MW_strBonus[1]]=attkStrBonus;
					values[fields.MW_attkAdj[0]][fields.MW_attkAdj[1]]=attkAdj;
					values[fields.MW_noAttks[0]][fields.MW_noAttks[1]]=attkNum;
					values[fields.MW_size[0]][fields.MW_size[1]]=attkSize;
					values[fields.MW_range[0]][fields.MW_range[1]]=attkRange;
					values[fields.MW_speed[0]][fields.MW_speed[1]]=attkSpeed;
					values[fields.MW_profLevel[0]][fields.MW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.MW_critHit[0]][fields.MW_critHit[1]]=attkCritHit;
					values[fields.MW_critMiss[0]][fields.MW_critMiss[1]]=attkCritMiss;
					values[fields.MW_type[0]][fields.MW_type[1]]=weapon[1];
					values[fields.MW_superType[0]][fields.MW_superType[1]]=weapon[4];
					
					tableInfo['MELEE'] = addTableRow( tableInfo['MELEE'], indicies.MW, values );
						
                    // log('dmgSpecs.length='+dmgSpecs.length+', i='+i+', dmgSpecs[i][0]'+dmgSpecs[i][0]);
    				if (dmgSpecs && i<dmgSpecs.length && !_.isUndefined(dmg=dmgSpecs[i][0])) {
        				// log('addWeapon setting up dmg');
						values = initValues( tableInfo.DMG.fieldGroup );
						values[fields.Dmg_name[0]][fields.Dmg_name[1]]=(dmg.match(/w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['',''])[1];
						values[fields.Dmg_strBonus[0]][fields.Dmg_strBonus[1]]=(dmg.match(/sb:([01])/i) || [0,0])[1];
						values[fields.Dmg_dmgAdj[0]][fields.Dmg_dmgAdj[1]]=(dmg.match(/\+:([+-]?\d+?)[,\]]/i) || [0,0])[1];
						values[fields.Dmg_dmgSM[0]][fields.Dmg_dmgSM[1]]=(dmg.match(/sm:(.*?\d+?d\d+?.*?)[,\]]/i) || [0,0])[1];
						values[fields.Dmg_dmgL[0]][fields.Dmg_dmgL[1]]=(dmg.match(/l:(.*?\d+?d\d+?.*?)[,\]]/i) || [0,0])[1]
						values[fields.Dmg_specialist[0]][fields.Dmg_specialist[1]]=(proficiency>=1)?1:0;
						
						tableInfo['DMG'] = addTableRow( tableInfo['DMG'], indicies.MW, values );
    				} else {
    				    sendError('Weapon '+attkName+' missing damage spec');
    				}
    				indicies.MW++;
    			} else if (weapon[2].toLowerCase() == 'ranged') {
    			    // log('addWeapon setting up ranged weapon '+indicies.RW+' as '+attkName);
    			    values = initValues( tableInfo.RANGED.fieldGroup );
    			    values[fields.RW_name[0]][fields.RW_name[1]]=attkName;
    			    values[fields.RW_twoHanded[0]][fields.RW_twoHanded[1]]=attk2H;
    			    values[fields.RW_strBonus[0]][fields.RW_strBonus[1]]=attkStrBonus;
					values[fields.RW_dexBonus[0]][fields.RW_dexBonus[1]]=attkDexBonus;
					values[fields.RW_attkAdj[0]][fields.RW_attkAdj[1]]=attkAdj;
					values[fields.RW_noAttks[0]][fields.RW_noAttks[1]]=attkNum;
					values[fields.RW_size[0]][fields.RW_size[1]]=attkSize;
					values[fields.RW_range[0]][fields.RW_range[1]]=attkRange;
					values[fields.RW_speed[0]][fields.RW_speed[1]]=attkSpeed;
					values[fields.RW_profLevel[0]][fields.RW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.RW_critHit[0]][fields.RW_critHit[1]]=attkCritHit;
					values[fields.RW_critMiss[0]][fields.RW_critMiss[1]]=attkCritMiss;
					values[fields.RW_type[0]][fields.RW_type[1]]=weapon[1];
					values[fields.RW_superType[0]][fields.RW_superType[1]]=weapon[4];

					tableInfo['RANGED'] = addTableRow( tableInfo['RANGED'], indicies.RW, values );
					
    				if (ammoSpecs && ammoSpecs.length) {
    				    // log(weaponName+' is a self-ammoed weapon with ammoSpecs.length='+ammoSpecs.length);
    					let rangeSpecs = [...('['+specs.match(/{{\s*range\s*=(.*?)}}/im)[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
    					if (rangeSpecs && rangeSpecs.length) {
    					    // log('rangeSpecs = '+rangeSpecs);
    						tableInfo = insertAmmo( charCS, weaponName, ammoSpecs, rangeSpecs, tableInfo, weapon[1], attkStrBonus, lineNo );
    					}
    				} else {
    				    // log('Looking up ammo for ranged weapon '+weaponName);
    					tableInfo = addAmmo( charCS, tableInfo, weapon[1], weapon[4], attkStrBonus );
    				}
    				indicies.RW++;
    			}
			}
		}
		tableInfo.indicies = indicies;
		return tableInfo;
	};

	/*
	 * Find ammo for the specified ranged weapon type, and
	 * add it to the ammo table
	 */

	var addAmmo = function( charCS, tableInfo, weaponType, weaponSuperType, sb ) {
		
		var miIndex = fields.MI_table[1] ? -1 : -2,
			MagicItems = getTable( charCS, {}, 'MI_trueName', fields.MI_table, fields.MI_trueName ),
			attrs, sortKeys, ammoName, typeCheck;

		while (!_.isUndefined(ammoName = tableLookup(MagicItems,'MI_trueName',++miIndex,false))) {
			let ammo = abilityLookup( fields.MagicItemDB, ammoName ),
    			ammoData, ammoMatch, t = '',
			    ammoSpecs = [], rangeSpecs = [];
			if (ammo.obj && ammo.obj[0]) {
			    ammoData = ammo.obj[0].get('action');
			    if (ammoData && ammoData.length) {
//					log('ammoData: '+ammoData);
//					log('ammoData ammo = '+[...('['+ammoData.match(/{{\s*?ammo\s*?=.*?}}/im)+']').matchAll(/\[.*?\]/g)]);
//					log('ammoData range = '+[...('['+ammoData.match(/{{\s*?range\s*?=.*?}}/im)+']').matchAll(/\[.*?\]/g)]);
					ammoMatch = [...('['+ammoData.match(/{{\s*?ammo\s*?=.*?}}/im)+']').matchAll(/\[.*?\]/g)];
					if (ammoMatch && ammoMatch[0]) {
					    typeCheck = new RegExp('t:\\s*?'+weaponType+'\\s*?[,\\]]', 'i');
						ammoSpecs = ammoMatch.filter(elem => typeCheck.test(elem));
						t = weaponType;
						if (!ammoSpecs.length) {
						    typeCheck = new RegExp('st:\\s*?'+weaponSuperType+'\\s*?[,\\]]', 'i');
							ammoSpecs = ammoMatch.filter(elem => typeCheck.test(elem));
							t = weaponSuperType;
						}
					}
					if (ammoSpecs && ammoSpecs.length) {
//					    log('addAmmo found ammo type '+t);
						if (!tableInfo.ammoInfo.ammoTypes.includes(ammoName+'-'+t)) {
							ammoMatch = [...('['+ammoData.match(/{{\s*?range\s*?=.*?}}/im)+']').matchAll(/\[.*?\]/g)];
							if (ammoMatch && ammoMatch[0]) {
							    typeCheck = new RegExp( 't:\\s*?'+weaponType+'\\s*?[,\\]]','i' );
								rangeSpecs = ammoMatch.filter(elem => typeCheck.test(elem));
								if (!rangeSpecs.length) {
								    typeCheck = new RegExp( 't:\\s*?'+weaponSuperType+'\\s*?[,\\]]','i' );
									rangeSpecs = ammoMatch.filter(elem => typeCheck.test(elem));
								}
							}
							if (!!rangeSpecs.length) {
//							    log('addAmmo and found range.  Inserting ammo');
								tableInfo = insertAmmo( charCS, ammoName, ammoSpecs, rangeSpecs, tableInfo, t, sb, miIndex );
							}
						}
					}
				}
			}
		}
		return tableInfo;
	}
	
	/*
	 * Find the named weapons in the character's Magic Item 
	 * bag and return their current index.
	 */

	var findWeapon = function( charCS, ...weapons ) {
		
		var i = fields.MI_table[1] ? 0 : -1,
			MagicItems = getTable( charCS, {}, 'MI_name', fields.MI_table, fields.MI_name ),
		    itemName,
			index = [];
			
		index.length = weapons.length;
		index.fill(NaN);
		
		while (!_.isUndefined(itemName = tableLookup( MagicItems, 'MI_name', i, false ))) {
			index[weapons.indexOf(itemName)] = i;
			i++;
		}
		return index;
	}
	
	/*
	 * Get Thac0 from the right place for this token.  This should be from 
	 * Bar2 current value on the token (to support multi-token monsters affected 
	 * individually by +/- magic impacts on thac0) but checks if another bar allocated
	 * or, if none are, get from character sheet (monster or character)
	 */
	 
	var getThac0 = function( tokenID, property=fields.Thac0[1] ) {
		
		var curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			thac0, thac0Obj;
			
		if (!charCS) {return undefined;}
		
		if (_.some( ['bar2_link','bar1_link','bar3_link'], linkName=>{
				let linkID = curToken.get(linkName);
				if (linkID) {
					thac0Obj = getObj('attribute',linkID);
					if (thac0Obj) {
						let thac0name = thac0Obj.get('name').toLowerCase();
						return (thac0name == fields.Thac0[0].toLowerCase() || thac0name == fields.MonsterThac0[0].toLowerCase());
					}
				}
				return false;
		})) {
			thac0 = thac0Obj.get(property);
		} else {
			thac0 = parseInt(attrLookup( charCS, [fields.Thac0[0], property] ));
			if (!thac0 || isNaN(thac0)) {
				thac0 = attrLookup( charCS, [fields.MonsterThac0[0], property] );
			}
		}
		return thac0;
	}
	
	/*
	 * Find all the necessary tables to manage weapons of any 
	 * or all types.  Dynamically driven by the table field 
	 * definitions in the 'fields' object. 
	 */

	var weaponTables = function( charCS, tableTypes, tableInfo ) {
		
		var tableTypes = tableTypes.toUpperCase().split(','),
			rows = {};

		if (_.isUndefined(tableInfo)) {
			tableInfo = {};
			tableInfo.indicies = {};
			tableInfo.ammoInfo = {};
		
			tableInfo.indicies.MW = fields.MW_table[1] ? 0 : -1;
			tableInfo.indicies.RW = fields.RW_table[1] ? 0 : -1;
			tableInfo.indicies.Dmg = fields.Dmg_table[1] ? 0 : -1;
			
			tableInfo.ammoInfo.ammoIndex = fields.Ammo_table[1] ? 0 : -1;
			tableInfo.ammoInfo.ammoTypes = [];
		};
		
		_.each( tableTypes, setupType => {
		    rows = {};
			if (_.isUndefined(tableInfo[setupType])) {
				tableInfo[setupType] = {};
				tableInfo[setupType].tableType = setupType;
				tableInfo[setupType].fieldGroup = tableIntro[setupType][0];
				tableInfo[setupType].table = tableIntro[setupType][1];
			}
			_.each( fields, (elem,key) => {
				if (key.startsWith(tableInfo[setupType].fieldGroup) && ['current','max'].includes(String(elem[1]).toLowerCase())) {
                    // log('weaponTables saving rows['+key+']');
					rows[key]=elem;
				};
				return;
        	});
			_.each(rows, (elem,key) => {
				tableInfo[setupType] = getTable( charCS, tableInfo[setupType], key, tableInfo[setupType].table, elem, '', elem[2] );
			    // log('weaponTables got table '+setupType+'.'+key+', property='+tableInfo[setupType][key].property);
			});
		});

		return tableInfo;
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
			curToken = getObj('graphic',tokenID),
			tokenName = curToken.get('name'),
			charName = charCS.get('name'),
			thac0 = getThac0(tokenID) || 20,
			monsterCritHit = attrLookup( charCS, fields.MonsterCritHit ) || 20,
			monsterCritMiss = attrLookup( charCS, fields.MonsterCritMiss ) || 1,
			monsterDmg1 = (attrLookup( charCS, fields.MonsterDmg1 ) || '0').split(',').pop(),
			monsterDmg2 = (attrLookup( charCS, fields.MonsterDmg2 ) || '0').split(',').pop(),
			monsterDmg3 = (attrLookup( charCS, fields.MonsterDmg3 ) || '0').split(',').pop(),
			magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0,
			magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
			attkMacro;
			
		switch (attkType.toUpperCase()) {
		
		case Attk.TARGET:
			if (attk1) {
				attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} using '+attk1+'}}'
						  + '{{Hits AC=[[ ( ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}'
						  + '{{Target AC=[[@{Target|Select Target|bar1}]]}}'
						  + '{{Damage if hit= [[(([['+monsterDmg1+']]['+attk1+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'
						  + '{{Target HP=[[@{Target|Select Target|bar3}]]HP}}';
				setAbility( charCS, 'Monster-Attk-1', attkMacro );
			}
			if (attk2) {
				attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} using '+attk2+'}}'
						  + '{{Hits AC=[[ ( ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}'
						  + '{{Target AC=[[@{Target|Select Target|bar1}]]}}'
						  + '{{Damage if hit= [[(([['+monsterDmg2+']]['+attk2+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'
						  + '{{Target HP=[[@{Target|Select Target|bar3}]]HP}}';
				setAbility( charCS, 'Monster-Attk-2', attkMacro );
			}
			if (attk3) {
				attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} using '+attk3+'}}'
						  + '{{Hits AC=[[ ( ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}'
						  + '{{Target AC=[[@{Target|Select Target|bar1}]]}}'
						  + '{{Damage if hit= [[(([['+monsterDmg3+']]['+attk3+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}'
						  + '{{Target HP=[[@{Target|Select Target|bar3}]]HP}}';
				setAbility( charCS, 'Monster-Attk-3', attkMacro );
			}
			break;
			
		case Attk.TO_HIT:
		case Attk.ROLL:
			if (attk1) {
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' attacks with their '+attk1+'}}'
						  + '{{Hits AC=[[ ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}\n'
						  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~Monster-Dmg-1)}}';
				setAbility( charCS, 'Monster-Attk-1', attkMacro );
				
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+attk1+'}}'
						  + '{{Damage=[[(([['+monsterDmg1+']]['+attk1+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}';
				setAbility( charCS, 'Monster-Dmg-1', attkMacro );
			}
			if (attk2) {
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' attacks with their '+attk2+'}}'
						  + '{{Hits AC=[[ ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}\n'
						  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~Monster-Dmg-2)}}';
				setAbility( charCS, 'Monster-Attk-2', attkMacro );
				
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+attk2+'}}'
						  + '{{Damage=[[(([['+monsterDmg2+']]['+attk2+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}';
				setAbility( charCS, 'Monster-Dmg-2', attkMacro );
			}
			if (attk3) {
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' attacks with their '+attk3+'}}'
						  + '{{Hits AC=[[ ( ([['+thac0+']][Thac0]) - ([['+magicHitAdj+']][Magic hit adj]) - 1d20cs>'+monsterCritHit+'cf<'+monsterCritMiss+' )]]}}\n'
						  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If this hits [Do Damage](~Monster-Dmg-3)}}';
				setAbility( charCS, 'Monster-Attk-3', attkMacro );
				
				attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+attk3+'}}'
						  + '{{Damage=[[(([['+monsterDmg3+']]['+attk3+' Dmg])+([['+magicDmgAdj+']][Added Magic Dmg]))]] HP}}';
				setAbility( charCS, 'Monster-Dmg-3', attkMacro );
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
	    
		var tokenID = args[1],
			attkType = args[2],
			curToken 	= getObj('graphic',tokenID),
			tokenName 	= curToken.get('name'),
			toHitRoll 	= fields.ToHitRoll,
			thac0		= getThac0(tokenID) || 20,
			mwNumber    = mwIndex + (fields.MW_table[1] ? 1 : 2),
			weaponName 	= tableLookup( tableInfo.MELEE, 'MW_name', mwIndex ),
			attkAdj 	= tableLookup( tableInfo.MELEE, 'MW_attkAdj', mwIndex ),
			strBonus 	= tableLookup( tableInfo.MELEE, 'MW_strBonus', mwIndex ),
			mwType 		= tableLookup( tableInfo.MELEE, 'MW_type', mwIndex ),
			mwSuperType = tableLookup( tableInfo.MELEE, 'MW_superType', mwIndex ),
			critHit 	= tableLookup( tableInfo.MELEE, 'MW_critHit', mwIndex ),
			critMiss 	= tableLookup( tableInfo.MELEE, 'MW_critMiss', mwIndex ),
			dmgAdj 		= tableLookup( tableInfo.DMG, 'Dmg_dmgAdj', mwIndex ),
			dmgSM 		= tableLookup( tableInfo.DMG, 'Dmg_dmgSM', mwIndex ),
			dmgL 		= tableLookup( tableInfo.DMG, 'Dmg_dmgL', mwIndex ),
			dmgStrBonus = (tableLookup( tableInfo.DMG, 'Dmg_strBonus', mwIndex ) || 1),
			strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
			strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
			rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
						+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
			magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0, 
			magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
			primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
			twoWeapPenalty = (primeWeapon < 1) ? 0 : ((mwIndex+(fields.MW_table[1]?1:2)) == primeWeapon ? -2 : -4),
			proficiency = proficient( charCS, mwType, mwSuperType ),
			race		= raceMods( charCS, mwType, mwSuperType ),
			attkMacro, totalAttkAdj, bsDmgMult, totalDmgAdj;
			
			totalAttkAdj   = '(([['+attkAdj+']][Weapon+])+([[('+strBonus+'*'+strHit+')]][Strength+])'
						   + '+([['+proficiency+']][Proficiency])+([['+race+']][Race mod])+([['+magicHitAdj+']][magic hit adj])'
 						   + '+([['+twoWeapPenalty+']][2-weap penalty]))';
						   
			bsDmgMult	   = '([['+Math.min((1+(backstab ? Math.ceil(rogueLevel/4) : 0)),5)+']][Backstab mult])';
			
			totalDmgAdj    = '([['+dmgAdj+']][weapon+])+([['+magicDmgAdj+']][magic dmg adj])'
						   + '+([['+(Math.max(proficiency,0))+']][Proficiency+])';
						   
		// log('strDmg='+strDmg+', dmgStrBonus='+dmgStrBonus);
						   
		if (attkType.toUpperCase() == Attk.ROLL) {
			toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
			dmgSM     = '?{Roll Damage vs TSM|'+dmgSM+'}';
			dmgL      = '?{Roll Damage vs LH|'+dmgL+'}';
		}
		
		classProficiency( charCS, mwType, mwSuperType );
			
		switch (attkType.toUpperCase()) {
			
		case Attk.TARGET:
			attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} with '+weaponName+'}}'
					  + '{{Hits AC=[[([['+thac0+']][Thac0])-('+totalAttkAdj+')-'+toHitRoll+'cs>'+critHit+'cf<'+critMiss+']] }}'
					  + '{{Target AC=[[@{Target|Select Target|bar1}]]}}'
					  + '{{Damage SM if hit=[[ ((([['+dmgSM+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+('+totalDmgAdj+')]] HP}}'
					  + '{{Damage L if hit=[[ ((([['+dmgL+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+('+totalDmgAdj+')]] HP}}'
					  + '{{Target HP=[[@{Target|Select Target|bar3}]]HP}}';
					  
			setAbility( charCS, 'Attk-MW'+mwNumber, attkMacro );
			break;
			
		case Attk.TO_HIT:
		case Attk.ROLL:
			attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' Attacks with their '+weaponName+'}}'
					  + '{{Hits AC=[[([['+thac0+']][Thac0])-([['+totalAttkAdj+']][Adjustments])-'+toHitRoll+'cs>'+critHit+'cf<'+critMiss+']] }}'
					  + '{{Total Adjustments=[['+totalAttkAdj+']]}}\n'
					  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If successfully hit\n[TSM Damage](~Dmg-TSM-MW'+mwNumber+') or [LH Damage](~Dmg-LH-MW'+mwNumber+')}}';

			setAbility( charCS, 'Attk-MW'+mwNumber, attkMacro );
			
			attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
					  + '{{Damage vs TSM=[[ ((([['+dmgSM+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+([['+totalDmgAdj+']][Adjustments])]] HP}}'
					  + '{{Total Plusses='+(backstab ? ('Backstab dice x [['+bsDmgMult+']] + ') : '')
					  + '[[([['+(dmgStrBonus * strDmg)+'*'+bsDmgMult+']][str bonus'+(backstab ? ' x backstab' : '')+'])'
					  + '+'+totalDmgAdj+']]}}';
					  
			setAbility( charCS, 'Dmg-TSM-MW'+mwNumber, attkMacro );
			
			attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
					  + '{{Damage vs LH=[[ ((([['+dmgL+']][Dice Roll])+([['+(dmgStrBonus * strDmg)+']][Strength+]))'
					  + (backstab ? ('*'+bsDmgMult) : '')+')+([['+totalDmgAdj+']][Adjustments])]] HP}}'
					  + '{{Total Plusses='+(backstab ? ('Backstab dice x [['+bsDmgMult+']] + ') : '')
					  + '[[([['+(dmgStrBonus * strDmg)+'*'+bsDmgMult+']][str bonus'+(backstab ? ' x backstab' : '')+'])'
					  + '+'+totalDmgAdj+']]}}';
					  
			setAbility( charCS, 'Dmg-LH-MW'+mwNumber, attkMacro );
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
			curToken 	= getObj('graphic',tokenID),
			tokenName 	= curToken.get('name'),
			charName	= charCS.get('name'),
			toHitRoll 	= fields.ToHitRoll,
			thac0		= getThac0(tokenID) || 20,
			rwNumber    = rwIndex + (fields.RW_table[1] ? 1 : 2),
			weaponName 	= tableLookup( tableInfo.RANGED, 'RW_name', rwIndex ),
			attkAdj 	= tableLookup( tableInfo.RANGED, 'RW_attkAdj', rwIndex ),
			weapStrBonus= tableLookup( tableInfo.RANGED, 'RW_strBonus', rwIndex ),
			weapDexBonus= tableLookup( tableInfo.RANGED, 'RW_dexBonus', rwIndex ),
			rwType 		= tableLookup( tableInfo.RANGED, 'RW_type', rwIndex ),
			rwSuperType = tableLookup( tableInfo.RANGED, 'RW_superType', rwIndex ),
			critHit 	= tableLookup( tableInfo.RANGED, 'RW_critHit', rwIndex ),
			critMiss 	= tableLookup( tableInfo.RANGED, 'RW_critMiss', rwIndex ),
			ammoName    = tableLookup( tableInfo.AMMO, 'Ammo_name', ammoIndex ),
			dmgAdj 		= tableLookup( tableInfo.AMMO, 'Ammo_dmgAdj', ammoIndex ),
			dmgSM 		= tableLookup( tableInfo.AMMO, 'Ammo_dmgSM', ammoIndex ),
			dmgL 		= tableLookup( tableInfo.AMMO, 'Ammo_dmgL', ammoIndex ),
			ammoStrBonus= tableLookup( tableInfo.AMMO, 'Ammo_strBonus', ammoIndex ),
			ammoQty		= tableLookup( tableInfo.AMMO, 'Ammo_qty', ammoIndex ),
			strHit 		= parseInt(attrLookup( charCS, fields.Strength_hit ) || 0),
			strDmg 		= parseInt(attrLookup( charCS, fields.Strength_dmg ) || 0),
			dexMissile	= attrLookup( charCS, fields.Dex_missile ) || 0,
			rogueLevel 	= attrLookup( charCS, fields.Rogue_level ) || 0,
			magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0, 
			magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
			primeWeapon = attrLookup( charCS, fields.Primary_weapon ),
			twoWeapPenalty = (primeWeapon < 1) ? 0 : ((rwIndex+(fields.RW_table[1]?1:2)) == primeWeapon ? -2 : -4),
			proficiency = proficient( charCS, rwType, rwSuperType ),
			race		= raceMods( charCS, rwType, rwSuperType ),
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
        					 + '+([['+weapStrBonus+'*[['+strHit+']]]][Strength+])+([['+race+']][Race mod])+([['+proficiency+']][Proficiency])'
							 + '+([['+rangeMod+']][Range mod])';
        			
				totalDmgAdj = '( ([['+dmgAdj+']][Ammo+]) +([['+magicDmgAdj+']][Magic dmg+]) +([['+(ammoStrBonus*strDmg)+']][Strength+]) )';

				if (attkType == Attk.TARGET) {
					attkMacro = '/w gm &{template:'+fields.defaultTemplate+'}'
							  + '{{name='+tokenName+' Attacks @{Target|Select Target|Token_name} with their '+weaponName+'}}'
							  + '{{Hits AC=[[([['+thac0+']][Thac0]) - ('+totalAttkAdj+')'
							  + '- '+toHitRoll+'cs>'+critHit+'cf<'+critMiss+' ]] }}'
							  + '{{Target AC=[[@{Target|Select Target|bar1}]]}}'
							  + '{{Damage if hit SM=[[ floor( [['+dmgSM+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ('+totalDmgAdj+') ]]HP}}'
							  + '{{Damage if hit L=[[ floor( [['+dmgSM+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ('+totalDmgAdj+') ]]HP}}'
							  + '{{Target HP=[[@{Target|Select Target|bar3}]]}}'
							  + '{{Ammo left='+(ammoQty-1)+'}}\n'
							  + '!attk --setammo '+tokenID+'|'+ammoName+'|-1|0|SILENT';
					setAbility( charCS, 'Attk-RW'+rwNumber+'-'+dist, attkMacro );
				
				} else {
					attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}'
							  + '{{name='+tokenName+' attacks with their '+weaponName+'}}'
							  + '{{Hits AC=[[([['+thac0+']][Thac0]) - ([['+totalAttkAdj+']][Adjustments])'
							  + '- '+toHitRoll+'cs>'+critHit+'cf<'+critMiss+' ]] }}'
        					  + '{{Total Adjustments=[['+totalAttkAdj+']]}}'
							  + '{{Ammo left='+(ammoQty-1)+'}}\n'
							  + sendToWho(charCS,false)+' &{template:'+fields.defaultTemplate+'}{{name=Do Damage?}}{{desc=If successfully hit\n[TSM Damage](~'+charName+'|Dmg-TSM-RW'+rwNumber+'-'+dist+')'
							  + 'or [LH Damage](~'+charName+'|Dmg-LH-RW'+rwNumber+'-'+dist+')}}\n'
							  + '!attk --setammo '+tokenID+'|'+ammoName+'|-1|0|SILENT';
					setAbility( charCS, 'Attk-RW'+rwNumber+'-'+dist, attkMacro );
					
					attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
							  + '{{Damage vs TSM=[[ floor( [['+dmgSM+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ([['+totalDmgAdj+']][Adjustments]) ]]HP}}'
							  + '{{Total Plusses=dice '+((dist=='N')?'/':'*')+'[[[['+((dist=='PB'||dist=='N')?2:1)+']][N/PB Mult]]] + [[ ([['+(dist=='PB'?2:0)+']][PB bonus])'
							  + ' + ([['+dmgAdj+']][Ammo+]) + ([['+magicDmgAdj+']][Magic dmg+]) +([['+(strDmg*ammoStrBonus)+']][Strength+]) ]]}}';
					setAbility( charCS, 'Dmg-TSM-RW'+rwNumber+'-'+dist, attkMacro );

					attkMacro = sendToWho(charCS,true)+' &{template:'+fields.defaultTemplate+'}{{name='+tokenName+' does damage with their '+weaponName+'}}'
							  + '{{Damage vs LH=[[ floor( [['+dmgL+']][Dice roll] '+(dist=='N'?'/':'*')+' [['+((dist=='PB' || dist=='N')?2:1)+']][N/PB dmg mult] )'
							  + ' + ([['+(dist=='PB'?2:0)+']][Spec PB+]) + ([['+totalDmgAdj+']][Adjustments]) ]]HP}}'
							  + '{{Total Plusses=dice '+((dist=='N')?'/':'*')+'[[[['+((dist=='PB'||dist=='N')?2:1)+']][N/PB Mult]]] + [[ ([['+(dist=='PB'?2:0)+']][PB bonus])'
							  + ' + ([['+dmgAdj+']][Ammo+]) + ([['+magicDmgAdj+']][Magic dmg+]) +([['+(strDmg*ammoStrBonus)+']][Strength+]) ]]}}';
					setAbility( charCS, 'Dmg-LH-RW'+rwNumber+'-'+dist, attkMacro );
				}
			}
		});
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
			farRange = 0,
			content = '',
			ranges = [],
			proficiency,
			specialist = true,
			wt, wst,
    		disabled = isNaN(weaponIndex) || isNaN(ammoIndex);

		if (!disabled) {
    		ranges = tableLookup( tableInfo.AMMO, 'Ammo_range', ammoIndex );
    		wt = tableLookup( tableInfo.RANGED, 'RW_type', weaponIndex );
    		wst = tableLookup( tableInfo.RANGED, 'RW_superType', weaponIndex );
			proficiency = proficient( charCS, wt, wst );
    		specialist = proficiency > 0;
			
			buildRWattkMacros( args, charCS, tableInfo );
    
    		ranges = ranges.split('/');
    		// Remove any non-numeric entries from the ranges
    		ranges = _.reject(ranges, function(dist){return isNaN(parseInt(dist,10));});
    		// Make the ranges always start with Short (assume 4 or more ranges start with Point Blank)
    		if (ranges.length >= 4) {
    			specRange = parseInt(ranges.shift(),10);
				specRange = isNaN(specRange) ? 30 : specRange*10;
    		}
 		}
		
		weaponIndex += fields.RW_table[1] ? 1 : 2;
		
		content += disabled ? ('<span style='+design.grey_button+'>') : '[';
		farRange = 6;
		content += ranges.length ? 'Near: 0 to 5' : 'Near';
		content += disabled ? '</span>' : ('](~'+charName+'|Attk-RW'+weaponIndex+'-N)');

		if (specialist) {
			content += disabled ? ('<span style='+design.grey_button+'>') : '[';
			farRange = specRange;
			content += ranges.length ? 'PB: 6 to '+farRange : 'Point Blank' ;
			content += disabled ? '</span>' : ('](~'+charName+'|Attk-RW'+weaponIndex+'-PB)');
		}
		content += disabled ? ('<span style='+design.grey_button+'>') : '[';
		farRange = ranges.length ? (10*parseInt(ranges[0])) : farRange;
		content += ranges.length ? ('S: '+(specialist ? (specRange+1) : '6')+' to '+farRange) : 'Short';
		content += disabled ? '</span>' : ('](~'+charName+'|Attk-RW'+weaponIndex+'-S)');

		if (ranges.length != 1) {
			content += disabled ? ('<span style='+design.grey_button+'>') : '[';
			farRange = ranges.length ? (10*parseInt(ranges[1])) : farRange;
			content += ranges.length ? ('M: '+((10*parseInt(ranges[0]))+1)+' to '+farRange) : 'Medium';
			content += disabled ? '</span>' : ('](~'+charName+'|Attk-RW'+weaponIndex+'-M)');
		}
		if (!ranges.length || ranges.length > 2) {
			content += disabled ? ('<span style='+design.grey_button+'>') : '[';
			farRange = ranges.length ? (10*parseInt(ranges[2])) : farRange;
			content += ranges.length ? ('L: '+((10*parseInt(ranges[1]))+1)+' to '+farRange) : 'Long';
			content += disabled ? '</span>' : ('](~'+charName+'|Attk-RW'+weaponIndex+'-L)');
		}
		content += disabled ? ('<span style='+design.grey_button+'>') : '[';
		content += ranges.length ? ('Far: beyond '+(farRange)) : 'Far';
		content += disabled ? '</span>' : ('](~'+charName+'|Attk-RW'+weaponIndex+'-F)');

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
				content += '[' + monsterAttk1 + '](~'+charName+'|Monster-Attk-1)';
			}
			if (monsterAttk2) {
				content += '[' + monsterAttk2 + '](~'+charName+'|Monster-Attk-2)';
			}
			if (monsterAttk3) {
				content += '[' + monsterAttk3 + '](~'+charName+'|Monster-Attk-3)';
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

		weaponIndex = fields.MW_table[1] ? -1 : -2;
		weaponOffset = fields.MW_table[1] ? 1 : 2;
		title = false;
		Weapons = getTable( charCS, {}, 'MW_name', fields.MW_table, fields.MW_name );
		while (!_.isUndefined(weaponName = tableLookup( Weapons, 'MW_name', ++weaponIndex, false ))) {
			if (weaponName != '-') {
				if (!title) {
					tableInfo = weaponTables( charCS, 'MELEE,DMG' ),
					content += '{{ =**MeleeWeapons**\n';
					title = true;
				}
				buildMWattkMacros( args, charCS, tableInfo, weaponIndex, backstab );
				content += '['+weaponName+'](~'+charName+'|Attk-MW'+(weaponIndex+weaponOffset)+') ';
			}
		};
		
		content += title ? '}}' : '';
		
		if (!backstab) {

			// build the character Ranged Weapons list

			weaponIndex = fields.RW_table[1] ? -1 : -2;
			title = false;
			Weapons = getTable( charCS, {}, 'RW_name', fields.RW_table, fields.RW_name );
			while (!_.isUndefined(weaponName = tableLookup( Weapons, 'RW_name', ++weaponIndex, false ))) {
				if (weaponName != '-') {
					if (!title) {
						tableInfo = weaponTables( charCS, 'RANGED,AMMO' ),
						content += '{{  =**RangedWeapons**}}';
						title = true;
					}
					content += '{{'+weaponName+'=';
					weaponType = tableLookup( tableInfo.RANGED, 'RW_type', weaponIndex );
					weaponSuperType = tableLookup( tableInfo.RANGED, 'RW_superType', weaponIndex );
					ammoIndex = fields.Ammo_table[1] ? -1 : -2;
					while (!_.isUndefined(ammoName = tableLookup( tableInfo.AMMO, 'Ammo_name', ++ammoIndex, false ))) {
						ammoType = tableLookup( tableInfo.AMMO, 'Ammo_type', ammoIndex );
						if (ammoName != '-' && (ammoType == weaponType || ammoType == weaponSuperType)) {
							ammoQty = tableLookup( tableInfo.AMMO, 'Ammo_qty', ammoIndex );
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
			qty, maxQty, title=false,
			miIndex = fields.MI_table[1] ? -1 : -2,
			ammoName,
			MagicItems = getTable( charCS, {}, 'MI_name', fields.MI_table, fields.MI_name ),
			MagicItems = getTable( charCS, MagicItems, 'MI_qty', fields.MI_table, fields.MI_qty  ),
			MagicItems = getTable( charCS, MagicItems, 'MI_trueQty', fields.MI_table, fields.MI_trueQty ),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Ammunition}}'
					+ '{{desc=The current quantity is displayed with the maximum you used to have.'
					+ 'To change the amount of any ammo listed, click the ammo name and enter the *change* (plus or minus).'
					+ 'The maximum will be set to the final current quantity, reflecting your new total}}'
					+ '{{desc1=';
		while (!_.isUndefined(ammoName = tableLookup(MagicItems,'MI_name',++miIndex,false))) {
			let ammo = abilityLookup( fields.MagicItemDB, ammoName ),
    			ammoData, ammoMatch;
			if (ammo.obj && ammo.obj[0]) {
			    ammoData = ammo.obj[0].get('action');
			    if (ammoData && ammoData.length) {
					ammoMatch = [...('['+ammoData.match(/{{\s*?ammo\s*?=.*?}}/im)+']').matchAll(/\[.*?\]/g)];
					if (ammoMatch && ammoMatch[0] && ammoMatch[0][0].toLowerCase().includes('ammo')) {
					    // log('ammoMatch[0] = '+ammoMatch[0]);
						if (!title) {
							content += '<table><tr><td>Now</td><td>Max</td><td>Ammo Name</td></tr>';
							title = true;
						}
						qty = tableLookup(MagicItems,'MI_qty',miIndex);
						maxQty = tableLookup(MagicItems,'MI_trueQty',miIndex);
						content += '<tr><td>[['+qty+']]</td><td>[['+maxQty+']]</td>'
								+  '<td>['+ammoName+'](!attk --button '+BT.AMMO+'|'+tokenID+'|'+ammoName+'|?{How many do you recover?|0})</td></tr>';
					}
				}
			}
		}
		if (!title) {
			content += 'You do not appear to have any ammo in your bag!}}';
		} else {
			content += '</table>}}';
		}
//		log(content);
		sendResponse( charCS, content );
		return;
	};
	
	/*
	 * Make the "Change Weapon" menu, that populates the 
	 * weapon tables from items in the character's magic item bag 
	 * that are specified as being some type of weapon.
	 */
	 
	var makeChangeWeaponMenu = function( args ) {
		
		var tokenID = args[1],
			leftIndex = args[2],
			rightIndex = args[3],
			bothIndex = args[4],
			auto1Index = args[5],
			auto2Index = args[6],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			MagicItems = getTable( charCS, {}, 'MI_name', fields.MI_table, fields.MI_name, '', '' ),
			left = isNaN(leftIndex) ? '' : tableLookup( MagicItems, 'MI_name', leftIndex ),
			right = isNaN(rightIndex) ? '' : tableLookup( MagicItems, 'MI_name', rightIndex ),
			both = isNaN(bothIndex) ? '' : tableLookup( MagicItems, 'MI_name', bothIndex ),
			auto1 = isNaN(auto1Index) ? '' : tableLookup( MagicItems, 'MI_name', auto1Index ),
			auto2 = isNaN(auto2Index) ? '' : tableLookup( MagicItems, 'MI_name', auto2Index ),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s weapon}}'
					+ '{{desc=Select Left or Right Hand to hold a one-handed weapon or shield.'
					+ ' Select Both Hands to hold a two handed weapon and set AC to Shieldless'
					+ (auto1 || auto2 ? ('\n'+(auto1 && auto2 ? (auto1+' and '+auto2+' are') : ((auto1 ? auto1 : auto2)+' is'))+' dancing, and do(es) not need adding') : '')
					+ '}}'
					+ '{{desc1=[' + (left.length ? 'LH\: '+left : 'Left Hand') + '](!attk --button '+BT.LEFT+'|'+tokenID+'|'+weaponQuery(charCS,1)+'|'+rightIndex+'|null)'
					+ '[' + (right.length ? 'RH\: '+right : 'Right Hand') + '](!attk --button '+BT.RIGHT+'|'+tokenID+'|'+leftIndex+'|'+weaponQuery(charCS,1)+'|null)}}'
					+ '{{desc2=or [' + (both.length ? '2H\: '+both : 'Both Hands') + '](!attk --button '+BT.BOTH+'|'+tokenID+'|null|null|'+weaponQuery(charCS,2)+')}}';
		sendResponse( charCS, content );
		return;
	}
	
	/**
	 * Make a menu to display situational armour classes,
	 * allow them to be changed by the player or DM,
	 * and allow selection of the currently relevant one
	 */
	 
	var makeACmenu = function( args, toGM ) {
		
		var tokenID = args[0],
			armourState = args[1],
			changeValue = '!attk --changeac '+tokenID+'|'+armourState+'|',
			charCS = getCharacter(tokenID),
			AC = getACvalues(tokenID),
			charName,
			content;
			
		if (!charCS) {
		    sendDebug( 'makeACmenu: invalid tokenID' );
		    sendError( 'Invalid attackMaster call' );
		    return;
		}
		
		charName = charCS.get('name');
		
		content = '&{template:2Edefault}{{name='+charName+'\'s Armour Class}}'
				+ '{{desc=<table>'
				+ '<tr>'
					+ '<td style="min-width:35px"></td>'
					+ '<td style="min-width:25px">'+(armourState=='Full' ? '<span style='+design.selected_button+'>With Shield</span>' : '[Set Shield](!attk --setac '+tokenID+'|Full)')+'</td>'
					+ '<td style="min-width:25px">'+(armourState=='Shieldless' ? '<span style='+design.selected_button+'>No Shield</span>' : '[Stow Shield](!attk --setac '+tokenID+'|Shieldless)')+'</td>'
					+ '<td style="min-width:25px">'+(armourState=='Armourless' ? '<span style='+design.selected_button+'>No Armour</span>' : '[Remove Armour](!attk --setac '+tokenID+'|Armourless)')+'</td>'
				+ '</tr><tr>'
					+ '<td>Normal</td><td>['+AC.shielded.normal+']('+changeValue+'Full-normal|?{Shielded AC?})</td><td>['+AC.shieldless.normal+']('+changeValue+'Shieldless-normal|?{Shieldless AC?})</td><td>['+AC.armourless.normal+']('+changeValue+'Armourless-normal|?{Armourless AC?})</td>'
				+ '</tr><tr>'
					+ '<td>Missile</td><td>['+AC.shielded.missile+']('+changeValue+'Full-missile|?{Shielded AC vs missile?})</td><td>['+AC.shieldless.missile+']('+changeValue+'Shieldless-missile|?{Shieldless AC vs missile?})</td><td>['+AC.armourless.missile+']('+changeValue+'Armourless-missile|?{Armourless AC vs missile?})</td>'
				+ '</tr><tr>'	
					+ '<td>Surprised</td><td>['+AC.shielded.surprised+']('+changeValue+'Full-surprise|?{AC if surprised?})</td><td>['+AC.shieldless.surprised+']('+changeValue+'Shieldless-surprise|?{Shieldless AC if surprised?})</td><td>['+AC.armourless.surprised+']('+changeValue+'Armourless-surprise|?{Armourless AC if surprised?})</td>'
				+ '</tr><tr>'
					+ '<td>Back</td><td>['+AC.shielded.back+']('+changeValue+'Full-back|?{AC of back?})</td><td>['+AC.shieldless.back+']('+changeValue+'Shieldless-back|?{Shieldless AC of back?})</td><td>['+AC.armourless.back+']('+changeValue+'Armourless-back|?{Armourless AC of back?})</td>'
				+ '</tr><tr>'
					+ '<td>Head</td><td>['+AC.shielded.head+']('+changeValue+'Full-head|?{AC of head?})</td><td>['+AC.shieldless.head+']('+changeValue+'Shieldless-head|?{Shieldless AC of head?})</td><td>['+AC.armourless.head+']('+changeValue+'Armourless-head|?{Armourless AC of head?})</td>'
				+ '</tr></table>}}'
				+ '{{desc1=To set your armour state, select **Set Shield** or **Stow Shield**, or **Remove Armour**\n'
				+ 'To change the values for each situation, select a value and then enter a new value}}';


		if (toGM) {
			sendFeedback( content );
		} else {
			sendResponse( charCS, content );
		}
		return AC;
	};
	
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
					+ '[Manage AC](!attk --showac &#64;{selected|token_id})}}';
					
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
			setQty = parseInt(args[3]),
			setMax = parseInt(args[4]),
			silent = ((args[5] || '').toUpperCase() == 'SILENT'),
			charCS = getCharacter(tokenID),
			ammoMIname = ammoName,
			Ammo, ammoIndex,
			MagicItems, miIndex;
			
		Ammo = getTable(charCS,{},'Ammo_name',fields.Ammo_table,fields.Ammo_name);
		ammoIndex = tableFind( Ammo, 'Ammo_name', ammoName );
		if (!isMI) {
			ammoMIname = attrLookup( charCS, fields.Ammo_miName, fields.Ammo_table, ammoIndex);
		}
		MagicItems = getTable(charCS,{},'MI_name',fields.MI_table,fields.MI_name),
		miIndex = tableFind( MagicItems, 'MI_name', ammoMIname );
			
		log('handleAmmoChange: args='+args+', ammoIndex='+ammoIndex+', miName='+ammoMIname+', miIndex='+miIndex);
			
		if (isNaN(miIndex)) {return;}

		var	MagicItems = getTable(charCS,MagicItems,'MI_qty',fields.MI_table,fields.MI_qty,'',0),
			MagicItems = getTable(charCS,MagicItems,'MI_trueQty',fields.MI_table,fields.MI_trueQty,'',0),
    		miQ = parseInt(tableLookup( MagicItems, 'MI_qty', miIndex )),
    		miM = parseInt(tableLookup( MagicItems, 'MI_trueQty', miIndex )),
    		qty = Math.max(setQty + miQ,0),
    		maxQty = isNaN(setMax) ? qty : Math.max(setMax + miM,0);
    		
    	// log('handleAmmoChange: miQ='+miQ+', miM='+miM+', qty:'+qty+', maxQty='+maxQty);

		MagicItems = tableSet( MagicItems, 'MI_qty', miIndex, qty );
		MagicItems = tableSet( MagicItems, 'MI_trueQty', miIndex, maxQty );
		
		if (!isNaN(ammoIndex) && ammoIndex >= -1) {
			setAttr( charCS, fields.Ammo_qty, qty, fields.Ammo_table, ammoIndex );
			setAttr( charCS, fields.Ammo_maxQty, maxQty, fields.Ammo_table, ammoIndex );
		}
		if (!silent) {
			makeAmmoMenu( args );
			makeAmmoChangeMsg( tokenID, args[2], miQ, qty, miM, maxQty );
		}
		return;
	};	
			
	/*
	 * Handle the selection of weapons when the character is
	 * changing weapons.  Delete all weapons in the weapons,
	 * damage and ammo tables and rebuild them each time (easier 
	 * than trying to discover which remain & which to remove)
	 */
	 
	var handleChangeWeapon = function( args ) {
		
		makeChangeWeaponMenu( args );
		
		var tokenID = args[1],
			leftIndex = args[2],
			rightIndex = args[3],
			bothIndex = args[4],
			auto1Index = args[5],
			auto2Index = args[6],
			i,
			charCS = getCharacter(tokenID),
			tableInfo = weaponTables( charCS, 'MELEE,DMG,RANGED,AMMO' );
			
		// log('handleChangeWeapon args:'+args);

		blankTable( charCS, tableInfo, 'MELEE' );
		blankTable( charCS, tableInfo, 'RANGED' );
		blankTable( charCS, tableInfo, 'DMG' );
		blankTable( charCS, tableInfo, 'AMMO' );
		
		tableInfo = addWeapon( charCS, fields.Equip_leftHand, 1,  leftIndex,  tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_rightHand, 1, rightIndex, tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_bothHands, 2, bothIndex,  tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_auto1Slot, 0, auto1Index, tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_auto2Slot, 0, auto2Index, tableInfo );
				
        // log('handleChangeWeapon returning');
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
					+ '<div style="font-weight: bold;">'
						+ '!attk --help'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display this message'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!attk --attkmenu tokenID|monsterAttk1|monsterAttk2|monsterAttk3'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display a menu of possible physical attacks.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>tokenID</b> of the token doing the attack.'
					+ '</li>'
		        	+ '<li style="padding-left: 20px;">'
						+ '<b>monsterAttks</b> (optional) names of up to 3 monster innate attacks relating to monster sheet damage lines.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!attk --multiswords tokenID|multiWeapon'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Set a token as using either 1 or 2 swords in future attacks.  If 2 swords, then melee weapon attacks will alternate between primary and secondary attack penalties if they apply.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>tokenID</b> of the token doing the attack.'
					+ '</li>'
		        	+ '<li style="padding-left: 20px;">'
						+ '<b>multiWeapon</b> (optional) defines multi-weapon attacks. 2 for 2 melee weapons, 1 for 1 melee weapon.'
					+ '</li>'
					+ '<br>'
				+ '</div>'
   			+ '</div>'; 

		sendFeedback(content); 
	};
	
	/*
	 * Display a menu of attack options
	 */
	 
	var doMenu= function(args,isGM) {
		if (!args) 
			{return;}
			
		args = args.split('|');
		if (args.length < 1) {
			sendDebug('doMenu: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doMenu: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
		
		args.unshift('');
		makeAttkActionMenu(args,isGM);
		return;
	}

	/*
	* Function to display the menu for attacking with physical melee, ranged or innate weapons
	*/

	var doAttk = function(args,attkType) {
		if (!args)
			{return;}
			
		if (!_.contains(Attk,attkType.toUpperCase())) {
			sendDebug('doAttk: Invalid attkType '+attkType+' specified');
			sendError('Invalid AttackMaster parameter');
			return;
		}

        args = args.split('|');

		if (args.length < 1 || args.length > 4) {
			sendDebug('doAttk: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID ),
		    mAttk;
	
		if (!charCS) {
            sendDebug( 'doAttackMenu: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
		
		if (!args[1] && (mAttk = (attrLookup( charCS, fields.MonsterDmg1 ) || '')).length) {
			args[1] = mAttk.split(',')[0];
		}
		if (!args[2] && (mAttk = (attrLookup( charCS, fields.MonsterDmg2 ) || '')).length) {
			args[2] = mAttk.split(',')[0];
		}
		if (!args[3] && (mAttk = (attrLookup( charCS, fields.MonsterDmg3 ) || '')).length) {
			args[3] = mAttk.split(',')[0];
		}
        
		makeAttackMenu( ['', tokenID, attkType, null, null], MenuState.ENABLED, args[1], args[2], args[3] );
		return;
    };
	
	/*
	 * Modify the amount of a specified type of ammo.
	 * This sets both the ammo line (if current) and 
	 * the corresponding Magic Item.
	 */
	 
	var doSetAmmo = function( args ) {
		
		if (!args)
			{return;}
		args = args.split('|');
		
		if (args.length < 4) {
			sendDebug('doSetAmmo: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doSetAmmo: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
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
	 
	var doAmmoMenu = function( args ) {

		if (!args)
			{return;}
		args = args.split('|');
		
		if (args.length < 1) {
			sendDebug('doAmmoMenu: tokenID not specified');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doAmmoMenu: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
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
	
	var doMultiSwords = function( args ) {
		
		if (!args)
			{return;}
		args = args.split('|');

		if (args.length != 2) {
			sendDebug('doMulti: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		var tokenID = args[0],
			useMultiWeapons = (parseInt(args[1],10) == 2) ? TwoWeapons.PRIMARY : TwoWeapons.SINGLE;
		
		state.attackMaster.twoWeapons[tokenID] = useMultiWeapons ;
		return;
	}
	
	/*
	 * Display a menu to allow the Player to change the weapon(s)
	 * that a character is wielding, selecting them from the MI Bag,
	 * and create them in the weapon tables.  For ranged weapons,
	 * also search the MI Bag for ammo for that type of ranged weapon.
	 */
	 
	var doChangeWeapon = function( args ) {
		
		if (!args) {return;}
		args = args.split('|');
			
		if (args.length != 1) {
			sendDebug('doSetShield: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
            sendDebug( 'doSetShield: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
        
        var leftHand = attrLookup( charCS, fields.Equip_leftHand  ),
            rightHand = attrLookup( charCS, fields.Equip_rightHand ),
            bothHands = attrLookup( charCS, fields.Equip_bothHands ),
            auto1 = attrLookup( charCS, fields.Equip_auto1Slot ),
            auto2 = attrLookup( charCS, fields.Equip_auto2Slot );
            
//        log('doChangeWeapon l:'+leftHand+', r:'+rightHand+', b:'+bothHands+', a1:'+auto1+', a2:'+auto2);
		
		args.unshift('');
		args = args.concat(findWeapon( charCS,
									   (attrLookup( charCS, fields.Equip_leftHand  ) || '' ),
									   (attrLookup( charCS, fields.Equip_rightHand ) || '' ),
									   (attrLookup( charCS, fields.Equip_bothHands ) || '' ),
									   (attrLookup( charCS, fields.Equip_auto1Slot ) || '' ),
									   (attrLookup( charCS, fields.Equip_auto2Slot ) || '' )));
		
//        log('doChangeWeapon args:'+args);
		makeChangeWeaponMenu( args );
		return;
	}
	
	/*
	 * Display the Armour Class menu to allow updates to,
	 * and selection of the Armour Class of a Character
	 */
	 
	var doDisplayACmenu = function( args, toGM ) {
		
		args = args.split('|');
		if (args.length != 1) {
			sendDebug('doSetShield: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
			ACstate,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
            sendDebug( 'doSetShield: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
		
		ACstate = attrLookup( charCS, fields.ACstate ) || 'Full';
		args.push(ACstate);
		makeACmenu( args, toGM );
		return;
	}
	
	/*
	 * An attackMaster command to set the AC value of a character's armour
	 * If displayMenu is true it displays the AC menu so the player can 
	 * set the AC values.
	 * To display menu !attk --setac tokenID|[Full,Shieldless,Armourless]
	 * To set AC state only !attk --setacstatus tokenID|[Full,Shieldless,Armourless]
	 */
	
	var doSetAC = function( args, displayMenu, toGM ) {
		
		args = args.split('|');
		
		if (args.length != 2) {
			sendDebug('doSetShield: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
			newACstate = args[1],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
            sendDebug( 'doSetShield: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
		
		if (!['Full','Shieldless','Armourless'].includes(newACstate)) {
            sendDebug( 'doSetShield: invalid armour state' );
            sendError( 'Invalid attackMaster armour state. Use Full, Shieldless or Armourless' );
            return;
        };
		
		var currentACstate = attrLookup( charCS, fields.ACstate ) || 'Full';
		
		if (newACstate == currentACstate)
			{return;}
			
		var	currentACfield = (currentACstate == 'Armourless' ? fields.Armourless_normal : 
								(currentACstate == 'Shieldless' ? fields.Shieldless_normal : fields.Armour_normal)),
			newACfield = (newACstate == 'Armourless' ? fields.Armourless_normal : 
								(newACstate == 'Shieldless' ? fields.Shieldless_normal : fields.Armour_normal)),
			currentAC = parseInt(attrLookup( charCS, currentACfield ) || 0),
			newAC = parseInt(attrLookup( charCS, newACfield ) || 0),
			AC = parseInt(attrLookup( charCS, fields.AC ) || 0);

		if (currentAC != newAC) {
			setAttr( charCS, fields.AC, (AC+newAC-currentAC) );
		}
		
		if (displayMenu) {
			makeACmenu( args, toGM );
		}
		setAttr( charCS, fields.ACstate, newACstate );
		return;
	}
	
	/*
	 * Internal attackMaster function to change the value of
	 * a situational armour class in the AC menu
	 */
	 
	var doChangeAC = function( args, toGM ) {
		
		args = args.split('|');
		
		if (args.length != 4) {
			sendDebug('doChangeAC: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
			ACstate = args[1],
			situation = args[2],
			newValue = parseInt(args[3]),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
            sendDebug( 'doChangeAC: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };

		var currentACstate = attrLookup( charCS, fields.ACstate ) || 'Full',
			AC = parseInt(attrLookup( charCS, fields.AC ) || 10),
			currentValue;
		
		
		switch (situation) {
			
		case 'Full-normal':
			if (currentACstate == 'Full') {
				currentValue = parseInt(attrLookup( charCS, fields.Armour_normal ) || 10);
				if (currentValue != newValue) {
					setAttr( charCS, fields.AC, (AC+newValue-currentValue) );
				}
			}
			setAttr( charCS, fields.Armour_normal, newValue );
			break;
			
		case 'Full-missile':
			setAttr( charCS, fields.Armour_missile, newValue );
			break;
			
		case 'Full-surprise':
			setAttr( charCS, fields.Armour_surprised, newValue );
			break;
			
		case 'Full-back':
			setAttr( charCS, fields.Armour_back, newValue );
			break;
			
		case 'Full-head':
			setAttr( charCS, fields.Armour_head, newValue );
			break;
			
		case 'Shieldless-normal':
			if (currentACstate == 'Shieldless') {
				currentValue = parseInt(attrLookup( charCS, fields.Shieldless_normal ) || 10);
				if (currentValue != newValue) {
					setAttr( charCS, fields.AC, (AC+newValue-currentValue) );
				}
			}
			setAttr( charCS, fields.Shieldless_normal, newValue );
			break;
			
		case 'Shieldless-missile':
			setAttr( charCS, fields.Shieldless_missile, newValue );
			break;
			
		case 'Shieldless-surprise':
			setAttr( charCS, fields.Shieldless_surprised, newValue );
			break;
			
		case 'Shieldless-back':
			setAttr( charCS, fields.Shieldless_back, newValue );
			break;
			
		case 'Shieldless-head':
			setAttr( charCS, fields.Shieldless_head, newValue );
			break;
			
		case 'Armourless-normal':
			if (currentACstate == 'Armourless') {
				currentValue = parseInt(attrLookup( charCS, fields.Armourless_normal ) || 10);
				if (currentValue != newValue) {
					setAttr( charCS, fields.AC, (AC+newValue-currentValue) );
				}
			}
			setAttr( charCS, fields.Armourless_normal, newValue );
			break;
			
		case 'Armourless-missile':
			setAttr( charCS, fields.Armourless_missile, newValue );
			break;
			
		case 'Armourless-surprise':
			setAttr( charCS, fields.Armourless_surprised, newValue );
			break;
			
		case 'Armourless-back':
			setAttr( charCS, fields.Armourless_back, newValue );
			break;
			
		case 'Armourless-head':
			setAttr( charCS, fields.Armourless_head, newValue );
			break;
			
		default:
			sendDebug( 'doChangeAC: invalid situation specifier' );
			sendError( 'Invalid attackMaster internal call' );
			break;
		}
		
		makeACmenu( args, toGM );
		return;
	}
			

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, playerId ) {
		if (!args)
			{return;}
		args = args.split('|');

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
			handleAmmoChange( args );
			break;
			
		case BT.LEFT :
		case BT.RIGHT :
		case BT.BOTH :
		
//		    log('doButton handleChangeWeapon');
			handleChangeWeapon( args );
			break;
			
		default :
			sendDebug('doButton: Invalid button type');
			sendError('Invalid attackMaster syntax');
		};

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
			var arg = e;
			sendDebug('Processing arg: '+arg);

			
   	    	if (arg.indexOf('attk-hit ') === 0) {
				arg = arg.replace('attk-hit ','').trim();
				doAttk(arg,Attk.TO_HIT);
			} else if (arg.indexOf('attk-roll ') === 0) {
				arg = arg.replace('attk-roll ','').trim();
				doAttk(arg,Attk.ROLL);
			} else if (arg.indexOf('attk-target ') === 0) {
				arg = arg.replace('attk-target ','').trim();
				doAttk(arg,Attk.TARGET);
			} else if (arg.indexOf('ammo ') === 0) {
				arg = arg.replace('ammo ','').trim();
				doAmmoMenu(arg);
			} else if (arg.indexOf('setammo ') === 0) {
				arg = arg.replace('setammo ','').trim();
				doSetAmmo(arg);
			} else if (arg.indexOf('showac ') === 0) {
				arg = arg.replace('showac ','').trim();
				doDisplayACmenu(arg, true);
			} else if (arg.indexOf('setacstatus ') === 0) {
				arg = arg.replace('setacstatus ','').trim();
				doSetAC(arg, false, true);
			} else if (arg.indexOf('setac' ) === 0) {
				arg = arg.replace('setac ','').trim();
				doSetAC(arg, true, true);
			} else if (arg.indexOf('changeac ') === 0) {
				arg = arg.replace('changeac ','').trim();
				doChangeAC(arg, true);
			} else if ((arg.indexOf('twoswords ') === 0) && isGM) {
				arg = arg.replace('twoswords ','').trim();
				doMultiSwords(arg);
			} else if (arg.indexOf('weapon ') === 0) {
				arg = arg.replace('weapon ','').trim();
				doChangeWeapon(arg);
			} else if ((arg.indexOf('menu ') && isGM) === 0) {
				arg = arg.replace('menu ','').trim();
				doMenu(arg,isGM);
			} else if ((arg.indexOf('button ') && isGM) === 0) {
				arg = arg.replace('button ','').trim();
				doButton(arg,senderId);
			} else if (arg.indexOf('help ') === 0) {
				showHelp(); 
			}  else if ((arg.indexOf('relay ') === 0) && isGM) {
				arg = arg.replace('relay ','').trim(); 
				doRelay(arg,senderId); 
			} else if (arg.indexOf('debug ') === 0) {
				// RED: v1.207 allow anyone to set debug and who to send debug messages to
				arg = arg.replace('debug ','').trim();
				doSetDebug(arg,senderId);
			} else {
				showHelp(); 
				sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
			}
    	});
    	sendDebug( 'handleChatMsg: about to call createAttrs');
		createAttrs( !state.attackMaster.debug, true );
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
	attackMaster.init(); 
	attackMaster.registerAPI();
});