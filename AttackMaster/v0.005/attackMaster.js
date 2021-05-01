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
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = 0.005,
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
		Thac0:              ['bar2','value'],
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
		Hit_magicAdj:		['strengthhit','max'],
		Dmg_magicAdj:       ['strengthdmg','max'],
		Dex_missile:        ['dexmissile','current'],
		Dex_react:          ['dexreact','current'],
		Backstab_mult:      ['backstabmultiplier','current'],
		NonProfPenalty:     ['nonprof-penalty','current'],
		Primary_weapon:		['weapno','max'],
		MWfirstRowNamed:    true,
		MW_table:           ['repeating_weapons',false],
		MW_name:            ['weaponname','current'],
		MW_type:			['weaponname','max'],
		MW_range:			['range','current'],
		MW_superType:		['range','max'],
		MW_speed:           ['weapspeed','current'],
		MW_noAttks:         ['attacknum','current'],
		MW_attkAdj:         ['attackadj','current'],
		MW_strBonus:        ['strbonus','current'],
		MW_twoHanded:       ['twohanded','current'],
		MW_size:            ['size','current'],
		MW_miName:          ['size','max'],
		MW_profLevel:       ['prof-level','current'],
		MW_critHit:         ['crit-thresh','current'],
		MW_critMiss:        ['crit-thresh','max'],
		MWdmgFistRowNamed:  true,
		MW_dmgTable:        ['repeating_weapons-damage',false],
		MW_dmgName:         ['weaponname1','current'],
		MW_dmgAdj:          ['damadj','current'],
		MW_dmgSM:           ['damsm','current'],
		MW_dmgL:            ['daml','current'],
		MW_dmgStrBonus:     ['strBonus1','current'],
		MW_dmgSpecialist:   ['specialist-damage','current'],
		RWfirstRowNamed:    true,
		RW_table:           ['repeating_weapons2',false],
		RW_name:            ['weaponname2','current'],
		RW_type:			['weaponname2','max'],
		RW_speed:           ['weapspeed2','current'],
		RW_noAttks:         ['attacknum2','current'],
		RW_attkAdj:         ['attackadj2','current'],
		RW_strBonus:        ['strbonus2','current'],
        RW_dexBonus:        ['dexbonus2','current'],
        RW_twoHanded:       ['twohanded2','current'],
		RW_profLevel:       ['prof-level2','current'],
		RW_crit:            ['crit-thresh2','current'],
		RW_critHit:         ['crit-thresh2','current'],
		RW_critMiss:        ['crit-thresh2','max'],
		RW_size:            ['size2','current'],
		RW_miName:          ['size2','max'],
		RW_range:           ['range2','current'],
		RW_rangeMod:		['rangemod-','current'],
		RW_superType:		['range2','max'],
		AmmoFirstRowNamed:  true,
		Ammo_table:         ['repeating_ammo',false],
		Ammo_name:          ['ammoname','current'],
		Ammo_miName:        ['daml2','max'],
		Ammo_type:			['ammoname','max'],
		Ammo_strBonus:      ['strbonus3','current'],
		Ammo_dmgAdj:        ['damadj2','current'],
		Ammo_attkAdj:       ['damadj2','max'],
		Ammo_dmgSM:         ['damsm2','current'],
		Ammo_dmgL:          ['daml2','current'],
		Ammo_range:        	['damsm2','max'],
		Ammo_qty:           ['ammoremain','current'],
		Ammo_maxQty:		['ammoremain','max'],
		Ammo_indirect:      ['Ammo-RW','current'],
		Ammo_flag:          ['ammo-flag-RW','current'],
		WPfirstRowNamed:    true,
		WP_table:           ['repeating_weaponprofs',false],
		WP_name:            ['weapprofname','current'],
		WP_type:            ['weapprofname','max'],
		WP_specialist:      ['specialist','current'],
		WP_mastery:         ['mastery','current'],
		WP_backstab:        ['chosen-weapon','current'],
		SpellsFirstColNum:  false,
		MUbaseCol:          1,
		PRbaseCol:          28,
		SpellsCols:         3,
		Spells_table:       ['repeating_spells',false],
		Spells_name:        ['spellname','current'],
		Spells_speed:       ['casttime','current'],
		PowersFirstColNum:  true,
		PowersBaseCol:      67,
		PowersCols:         3,
		Powers_table:       ['repeating_spells',false],
		Powers_name:        ['spellname','current'],
		Powers_speed:       ['casttime','current'],
		MIFirstRowNum:      false,
		MIRows:             24,
		MI_table:           ['repeating_potions',true],
		MI_name:            ['potion','current'],
		MI_trueName:        ['potion','max'],
		MI_speed:           ['potion-speed','current'],
		MI_trueSpeed:       ['potion-speed','max'],
		MI_qty:             ['potionqty','current'],
		MI_trueQty:         ['potionqty','max'],
		MI_cost:            ['potion-macro','current'],
		MI_type:            ['potion-macro','max'],
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
		Equip_leftHand:		['worn_Weapon1','current'],
		Equip_rightHand:	['worn_Weapon2','current'],
		Equip_bothHands:	['worn_Hands','current'],
		Equip_auto1Slot:	['worn_Weapon3','current'],
		Equip_auto2Slot:	['worn_Weapon4','current'],
		MonsterAttk1:		['monsterAttk1','current'],
		MonsterAttk2:		['monsterAttk2','current'],
		MonsterAttk3:		['monsterAttk3','current'],
		MonsterCritHit:		['monstercrit','current'],
		MonsterCritMiss:	['monstercrit','max'],
		MonsterDmg1:		['monsterdmg','current'],
		MonsterDmg2:		['monsterdmg2','current'],
		MonsterDmg3:		['monsterdmg3','current'],
	}); 
	
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
		defender: ['axe','club','flail','long-blade','fencing-blade','medium-blade','short-blade','polearm'],
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
		priest_of_life: ['club','quarterstaff','mancatcher','sling'],
		priest_of_war: ['any'],
		priest_of_light: ['dart','javelin','spear'],
		priest_of_knowledge: ['sling','quarterstaff'],
		shaman: ['long-blade','medium-blade','short-blade','blowgun','club','staff','shortbow','horsebow','hand-crossbow'],
		rogue: ['club','short-blade','dart','hand-crossbow','lasso','shortbow','sling','broadsword','longsword','staff'],
		thief: ['club','short-blade','dart','hand-crossbow','lasso','shortbow','sling','broadsword','longsword','staff'],
		bard: ['any'],
		assassin: ['any'],
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

// -------------------------------------- make dice rolls and roll queries ------------------------------------

	/**
	 * Use a callback from a sendChat dice roll to send the result as a --attkRoll command
	 * rollCmd must be a /roll or a /gmroll dice roll
	 * Alternatively, if rollCmd is anything else, the response will be processed for inline rolls
	 * and the full response returned as a --attkQuery command (useful for roll queries)
	 * If an array of args is supplied, these will be appended to the command string, each separated by '|'
	 * so that they are passed back to the handler
	**/
	
	var diceRoll = function( rollCmd, rollType, args ) {
        log( 'diceRoll called');
		var rollResult, content;
		sendChat('',rollCmd,function(ops) {
		    log( 'dice callback made');
			_.each( ops, function( resultObj ) {
				if (resultObj.type == 'rollresult' || resultObj.type == 'gmrollresult') {
					rollResult = JSON.parse(resultObj.content);
					if (rollResult) {
						content = '!attk --attkroll ' + rollType + '|' + rollResult.total;
						for (let i=0; i<args.length; i++) {
							content += '|' + args[i];
						};
						sendAttkAPI( content );
					};
				} else if (resultObj.type != 'API' ) {
					rollResult = processInlinerolls( resultObj );
					if (rollResult) {
						content = '!attk --attkroll ' + rollType + '|' + rollResult;
						for (let i=0; i<args.length; i++) {
							content += '|' + args[i];
						};
						sendAttkAPI( content );
					};
				};
			});
		}, {use3d:true} );
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

	/*
	 * A function to get the whole of a repeating table in 
	 * two parts: an array of objects indexed by Roll20 object IDs,
	 * and an array of object IDs indexed by repeating table row number.
	 */
	 
	var getTable = function(character,tableDef,attrDef,col='',defaultVal=null,caseSensitive=false) {
	    let name;
	    if (tableDef && !_.isNull(tableDef) && !tableDef[1] && col && col==1) {col = '';}
	    if (tableDef && !_.isNull(tableDef)) {
            name = tableDef[0]+col+'_$0_'+attrDef[0]+col;
	    } else {
            name = attrDef[0];
	    }
		let	match= name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let createOrderKeys=[],
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

//            log('getTable returning '+name+' of length '+sortOrderKeys.length);
            return {character:character,property:attrDef,table:tableDef,defaultVal:defaultVal,attrs:attrs,sortKeys:sortOrderKeys};
        }
        log('getTable unable to match '+name+', returning undefined');
		return undefined;
	};
	
	/**
	 * A function to take a table obtained using getTable() a row number, and 
	 * and a property, and safely return the value of the property, or undefined
	 */
	 
	var tableLookup = function( tableObj, index, defVal=true, getObj=false ) {
//        log('tableLookup tableObj:'+!!tableObj+', index:'+index+', getObj:'+getObj);
        var val;
		if (tableObj) {
//		    log('tableLookup found tableObj '+tableObj.table[0]);
			let property = (_.isObject(getObj) ? getObj : (getObj == false ? tableObj.property : null));
			defVal = (!_.isBoolean(defVal)) ? defVal : (defVal ? tableObj.defaultVal : undefined);
			if (index>=0) {
				let attrs = tableObj.attrs,
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
	 * a property and a value, and safely set the value of the property, 
	 * returning true for success an false for failure, or undefined if 
	 * it tries setAttr to create an entry that does not exist.
	 */
	 
	var tableSet = function( tableObj, r, attrValue, c, caseSensitive ) {
		if (tableObj) {
			if (_.isUndefined(attrValue)) {
				attrValue = tableObj.defaultVal;
			}
			let attrs = tableObj.attrs,
				sortOrderKeys = tableObj.sortKeys,
				attrDef = tableObj.property;
			if (r<sortOrderKeys.length && _.has(attrs,sortOrderKeys[r])){
				if (_.isUndefined(attrDef) || _.isNull(attrDef) || !attrDef[1] || _.isUndefined(attrs[sortOrderKeys[r]])) {
					return false;
				} else {
					attrs[sortOrderKeys[r]].set(attrDef[1],attrValue);
					return true;
				}
			}
			setAttr( tableObj.character, tableObj.property, attrValue, tableObj.table, r, c, caseSensitive );
		}
		return undefined;
	}
	
	/*
	 * A function to find the index of a matching entry in a table
	 */
	 
	var tableFind = function( tableObj, val ) {
		
		let property = tableObj.property[1];
		if (!tableObj.table[1] && val == attrLookup( tableObj.character, tableObj.property )) {
			return -1;
		}
		let tableIndex = tableObj.sortKeys.indexOf(
								_.findKey(tableObj.attrs, function( elem, objID ) {return val == elem.get(property);})
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
				tableObj = getTable(character,tableDef,attrDef,c,caseSensitive);
//			if (_.isNull(tableDef)) {log('attrLookup tableLookup for '+tableObj.property);}
			return tableLookup(tableObj,index,false);
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
	        log('setAttr attrDef is '+attrDef+', attrValue is '+attrValue);
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
			attrObj.set( attrDef[1], attrValue );
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
		
        abilityName = abilityName.toLowerCase();
        rootDB = rootDB.toLowerCase();
	    
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
	 * check if a named character exists, return first match
	 */

	var characterExists = function(name, caseSensitive) {
		var retval = null;

		var obj = findObjs({ _type: 'character', name: name }, {caseInsensitive: !caseSensitive});
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

    var getSheetTypes = function( charCS ) {

		var sheetTypes = {
				sheetFlags: 0,
				sheetType: 3,
				sheetMUType: 6,
				sheetPRType: 6,
				sheetPowersType: 3,
				sheetattackMasterType: 6,
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
		sheetTypes.sheetFlags = attrLookup( charCS, ['sheet-flags', 'current'] );
		
		if (sheetTypes.sheetFlags != 0) {
			sheetTypes.sheetType = attrLookup( charCS, ['sheet-type', 'current'] );
			sheetTypes.sheetMUType = attrLookup( charCS, ['sheet-mu-spells-type', 'current'] );
			sheetTypes.sheetPRType = attrLookup( charCS, ['sheet-pr-spells-type', 'current'] );
			sheetTypes.sheetPowersType = attrLookup( charCS, ['sheet-powers-type', 'current'] );
			sheetTypes.sheetattackMasterType = attrLookup( charCS, ['sheet-attackMaster-type', 'current'] );
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
	 
	var setAmmoFlags = function( charCS, sheetTypes ) {
	
		var content = '',
		    i,
		    ammoQty,
			ammoRedirect,
			ammoRedirectPointer;
			
		for ( i=1; i<=sheetTypes.sheetType; i++) {
		
			ammoRedirectPointer = fields.Ammo_indirect[0] + i + '-';
			if (_.isUndefined((ammoRedirect = attrLookup( charCS, [ammoRedirectPointer, fields.Ammo_indirect[1]] )))) {
				sendDebug( 'setAmmoFlags: no ' + ammoRedirectPointer + ' set for ' + charCS.get('name') );
			} else if (_.isUndefined((ammoQty = attrLookup( charCS, [ammoRedirect + fields.Ammo_qty[0], fields.Ammo_qty[1]] )))) {
				sendDebug( 'setAmmoFlags: ' + ammoRedirect + fields.Ammo_qty[0] + ' does not exist for ' + charCS.get('name'));
			} else {
				setAttr( charCS, [fields.Ammo_flag[0] + i, fields.Ammo_flag[1]], (ammoQty ? 1 : 0) );
			};
		};
		return;
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
			MInames = getTable( charCS, fields.MI_table, fields.MI_name ),
			weaponList = [],
			i = fields.MI_table[1] ? 0 : -1;
			
		do {
			item = tableLookup( MInames, i, false );
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
	
	var proficient = function( charCS, weaponType, weaponSuperType ) {
		
		var i = fields.WP_table[1] ? 0 : -1,
			prof = attrLookup( charCS, fields.NonProfPenalty ),
			WPnames = getTable( charCS, fields.WP_table, fields.WP_name ),
			WPtypes = getTable( charCS, fields.WP_table, fields.WP_type ),
			WPspecs = getTable( charCS, fields.WP_table, fields.WP_specialist ),
			WPmasters = getTable( charCS, fields.WP_table, fields.WP_mastery ),
			spec;
//		log('proficient WPnames properties '+WPnames.property);
		do {
			let wpName = tableLookup( WPnames, i, false ),
				wpType = tableLookup( WPtypes, i );
			if (_.isUndefined(wpName)) {break;}
//			log('proficient row '+i+': type '+wpName+' superType '+wpType);
			if (wpName != '-' && weaponType.toLowerCase().includes(wpName.toLowerCase())) {
//			    log('proficient found '+wpName);
				prof = 0;
				spec = tableLookup( WPspecs, i );
				if (spec && spec != 0) {
					prof = 2;
				}
				spec = tableLookup( WPmasters, i );
				if (spec && spec != 0) {
					prof = 3;
				}
			} else if (wpType && (weaponSuperType.toLowerCase().includes(wpType.toLowerCase()))) {
//			    log('proficient found superType '+wpType)
				prof = Math.floor(prof/2);
//			} else {
//			    log('proficient not found anything');
			}
			i++;
		} while (prof < 0);
		if (prof < 0 && !classProficiency( charCS, weaponType, weaponSuperType )) {
		    prof *= 2;
		}
		return prof;
	};
	
	/*
	 * Determine the class or classes of the character, and 
	 * the level of each
	 */
	 
	var getCharLevels = function( charCS ) {
		var levels = _.filter( fields, (elem,l) => {log('getCharLevels l='+l);return l.toLowerCase().includes('_level')});
		return _.filter( levels, elem => {log('getCharLevels elem='+elem);return 0 < (attrLookup( charCS, elem ) || 0)});
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
	    
	    
		var charLevels = getCharLevels( charCS ),
    		charClasses = _.filter( classLevels, a => {
    		    return _.some( charLevels, b => {
    		        return (a[1].includes(b[0]))
    		    })
    		}),
        	validWeapon = _.some( charClasses, elem => {
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
	 * Blank the specified weapon table, ready to have new
	 * weapons specified.
	 */

	var blankTable = function( charCS, tableInfo, table ) {
		
		var i, base, TableObj;
		
		switch (table.toUpperCase()) {
		case 'MELEE':
			base = tableInfo.indicies.MW;
			TableObj = tableInfo.Melee;
			break;
		case 'RANGED':
			base = tableInfo.indicies.RW;
			TableObj = tableInfo.Ranged;
			break;
		case 'DMG':
			base = tableInfo.indicies.Dmg;
			TableObj = tableInfo.Dmg;
			break;
		case 'AMMO':
			base = tableInfo.ammoInfo.ammoIndex;
			TableObj = tableInfo.Ammo;
			break;
		default:
			return;
		}

		_.each(TableObj, elem=> {
		    i = base;
//		    log('Blanking '+elem.property+' of '+elem.table);
			while (!_.isUndefined(tableLookup(elem,i,false))) {
//			    log('Setting row '+i+' to '+elem.defaultVal);
				tableSet( elem, i, elem.defaultVal );
				i++;
			}
		});
		return;
	};
	
	/*
	 * Insert ammo that has been found into the Ammo table
	 */
	
	var insertAmmo = function( charCS, ammoName, ammoSpecs, rangeSpecs, ammoTable, ammoInfo, ammoType, sb, miIndex ) {
        if (ammoInfo.ammoTypes.includes(ammoName+'-'+ammoType)) {return ammoInfo;}
		ammoInfo.ammoTypes.push(ammoName+'-'+ammoType);
//		log('insertAmmo ammoSpecs is '+ammoSpecs+', length '+ammoSpecs.length);
		for (let w=0; w<ammoSpecs.length; w++) {
//		    log('insertAmmo loop ammoSpecs['+w+'][0] = '+ammoSpecs[w][0]+', type is '+typeof ammoSpecs[w][0]);
		    let ammoData = ammoSpecs[w][0];
			tableSet( ammoTable.AmmoTypes, ammoInfo.ammoIndex, ammoType );
			tableSet( ammoTable.AmmoMInames, ammoInfo.ammoIndex, ammoName );
			tableSet( ammoTable.AmmoNames, ammoInfo.ammoIndex, (ammoData.match(/w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','Unknown ammo'])[1] );
			tableSet( ammoTable.AmmoStrBonuses, ammoInfo.ammoIndex, (sb ? (ammoData.match(/sb:\s*?([01])\s*?[,\]]/i) || [0,0])[1] : 0) );
			tableSet( ammoTable.AmmoDmgAdjs, ammoInfo.ammoIndex, (ammoData.match(/\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || [0,0])[1] );
			tableSet( ammoTable.AmmoDmgSMs, ammoInfo.ammoIndex, (ammoData.match(/sm:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1] );
			tableSet( ammoTable.AmmoDmgLs, ammoInfo.ammoIndex, (ammoData.match(/l:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1] );
			tableSet( ammoTable.AmmoAttkAdjs, ammoInfo.ammoIndex, (rangeSpecs[0][0].match(/\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || ['',''])[1] );
			tableSet( ammoTable.AmmoRanges, ammoInfo.ammoIndex, (rangeSpecs[0][0].match(/r:\s*?([\d\/]+)/i) || ['',''])[1] );
			tableSet( ammoTable.AmmoQtys, ammoInfo.ammoIndex, (attrLookup( charCS, fields.MI_qty, fields.MI_table, miIndex ) || 1) );
			tableSet( ammoTable.AmmoMaxQtys, ammoInfo.ammoIndex, (attrLookup( charCS, fields.MI_trueQty, fields.MI_table, miIndex ) || 1) );
			ammoInfo.ammoIndex++;
		}
		return ammoInfo;
	}

	/*
	 * Add a weapon to the weapon tables.  Get the full specs from 
	 * the magic item database.  If it is a ranged weapon, also 
	 * search for matching ammo.  Use a returned array to ensure 
	 * ammo duplications don't occur
	 */

	var addWeapon = function( charCS, hand, noOfHands, lineNo, tableInfo ) {
//	    log('addWeapon hand:'+hand+', lineNo:'+lineNo);
		if (isNaN(lineNo) || lineNo < -1) {
			setAttr( charCS, hand, '' );
			return tableInfo;
		}
		var indicies = tableInfo.indicies,
			ammoInfo = tableInfo.ammoInfo,
			MWindex = indicies.MW,
			RWindex = indicies.RW,
			weaponName = attrLookup( charCS, fields.MI_name, fields.MI_table, lineNo ),
			item = abilityLookup(fields.WeaponDB, weaponName),
			specs = item.obj[0].get('action'),
			weaponSpecs = specs.match(/{{\s*weapon\s*=(.*?)}}/im),
			toHitSpecs = specs.match(/{{\s*to-hit\s*=(.*?)}}/im),
			dmgSpecs = specs.match(/{{\s*damage\s*=(.*?)}}/im),
			ammoSpecs = specs.match(/{{\s*ammo\s*=(.*?)}}/im),
			dmg;

		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
		toHitSpecs = toHitSpecs ? [...('['+toHitSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		dmgSpecs = dmgSpecs ? [...('['+dmgSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)] : [];

//		log('addWeapon name:'+weaponName+', specs:'+specs);	
//		log('addWeapon dmg:'+specs.match(/{{\s*damage\s*=(.*?)}}/im));
//		log('addWeapon weaponSpecs:'+weaponSpecs);
//		log('addWeapon toHitSpecs:'+toHitSpecs);
//		log('addWeapon dmgSpecs:'+dmgSpecs);
//		log('addWeapon ammoSpecs:'+ammoSpecs);
			
		setAttr( charCS, hand, weaponName );

		for (let i=0; i<Math.min(weaponSpecs.length,toHitSpecs.length); i++) {
			let weapon = weaponSpecs[i],
				toHit = toHitSpecs[i][0],
				proficiency = Math.min(proficient( charCS, weapon[1], weapon[4] ),1),
				attk2H = weapon[3]=='2H' ? 1 : 0;
			
//			log('addWeapon proficiency of '+weaponName+' type '+weapon[1]+' superType '+weapon[4]+' is '+proficiency);
//			log('noOfHands is '+noOfHands+', weapon[3] is '+weapon[3]+', attk2H is '+attk2H+', test result is '+((noOfHands != 0) && (noOfHands !=  (attk2H+1))));
				
			if ((noOfHands == 0) || (noOfHands ==  (attk2H+1))) {
			
//     			log('addWeapon loop weaponSpecs['+i+']:'+weapon+', weapon type:'+weapon[2]);
//    			log('addWeapon loop toHitSpecs['+i+'][0]:'+toHit);
//    			log('addWeapon loop attkName will be:'+toHit.match(/w:([\s\w\-\+\,\:]+?)[\,\]]/i));
//    			log('addWeapon loop attkStrBonus will be:'+toHit.match(/sb:([01])/i));
//    			log('addWeapon loop attkDexBonus will be:'+toHit.match(/db:([01])/i));
//    			log('addWeapon loop attkAdj will be:'+toHit.match(/\+:([+-]?\d+?)/i));
//    			log('addWeapon loop attkNum will be:'+toHit.match(/n:([\d\/]+)/i));
//    			log('addWeapon loop attkCritHit will be:'+toHit.match(/c:(\d+?)/i));
//    			log('addWeapon loop attkCritMiss will be:'+toHit.match(/m:(\d+?)/i));
//    			log('addWeapon loop attkSize will be:'+toHit.match(/sz:([tsmlh])/i));
//    			log('addWeapon loop attkRange will be:'+toHit.match(/r:([\d\/]+)/i));
 //   			log('addWeapon loop attkSpeed will be:'+toHit.match(/sp:(\d+?)/i));
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
    			if (weapon[2].toLowerCase() == 'melee') {
//    			    log('setting up melee weapon '+indicies.MW+' as '+attkName);
    				tableSet( tableInfo.Melee.MWnames, indicies.MW, attkName );
    				tableSet( tableInfo.Melee.MWtypes, indicies.MW, weapon[1] );
    				tableSet( tableInfo.Melee.MW2Hs, indicies.MW, attk2H );
    				tableSet( tableInfo.Melee.MWstrBonuses, indicies.MW, attkStrBonus );
    				tableSet( tableInfo.Melee.MWattkAdjs, indicies.MW, attkAdj );
    				tableSet( tableInfo.Melee.MWnoAttks, indicies.MW, attkNum );
    				tableSet( tableInfo.Melee.MWcritHits, indicies.MW, attkCritHit );
    				tableSet( tableInfo.Melee.MWcritMisses, indicies.MW, attkCritMiss );
    				tableSet( tableInfo.Melee.MWsizes, indicies.MW, attkSize );
    				tableSet( tableInfo.Melee.MWranges, indicies.MW, attkRange );
    				tableSet( tableInfo.Melee.MWspeeds, indicies.MW, attkSpeed );
    				tableSet( tableInfo.Melee.MWprofs, indicies.MW, Math.min(proficiency,1) );
    				tableSet( tableInfo.Melee.MWsuperTypes, indicies.MW, weapon[4] );
    				if (dmgSpecs && i<dmgSpecs.length && !_.isUndefined(dmg=dmgSpecs[i][0])) {
//        				log('addWeapon setting up dmg');
        				tableSet( tableInfo.Dmg.MWdmgNames, indicies.MW, (dmg.match(/w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['',''])[1] );
        				tableSet( tableInfo.Dmg.MWdmgStrBonuses, indicies.MW, (dmg.match(/sb:([01])/i) || [0,0])[1] );
        				tableSet( tableInfo.Dmg.MWdmgAdjs, indicies.MW, (dmg.match(/\+:([+-]?\d+?)[,\]]/i) || [0,0])[1] );
        				tableSet( tableInfo.Dmg.MWdmgSMs, indicies.MW, (dmg.match(/sm:(.*?\d+?d\d+?.*?)[,\]]/i) || [0,0])[1] );
        				tableSet( tableInfo.Dmg.MWdmgLs, indicies.MW, (dmg.match(/l:(.*?\d+?d\d+?.*?)[,\]]/i) || [0,0])[1] );
        				tableSet( tableInfo.Dmg.MWdmgSpecs, indicies.MW, (proficiency>=1)?1:0 );
    				} else {
    				    sendError('Weapon '+attkName+' missing damage spec');
    				}
    				indicies.MW++;
    			} else if (weapon[2].toLowerCase() == 'ranged') {
//    			    log('addWeapon setting up ranged weapon '+indicies.RW+' as '+attkName);
    				tableSet( tableInfo.Ranged.RWnames, indicies.RW, attkName );
    				tableSet( tableInfo.Ranged.RWtypes, indicies.RW, weapon[1] );
    				tableSet( tableInfo.Ranged.RW2Hs, indicies.RW, attk2H );
    				tableSet( tableInfo.Ranged.RWstrBonuses, indicies.RW, attkStrBonus );
    				tableSet( tableInfo.Ranged.RWdexBonuses, indicies.RW, attkDexBonus );
    				tableSet( tableInfo.Ranged.RWattkAdjs, indicies.RW, attkAdj );
    				tableSet( tableInfo.Ranged.RWnoAttks, indicies.RW, attkNum );
    				tableSet( tableInfo.Ranged.RWcritHits, indicies.RW, attkCritHit );
    				tableSet( tableInfo.Ranged.RWcritMisses, indicies.RW, attkCritMiss );
    				tableSet( tableInfo.Ranged.RWsizes, indicies.RW, attkSize );
    				tableSet( tableInfo.Ranged.RWspeeds, indicies.RW, attkSpeed );
    				tableSet( tableInfo.Ranged.RWprofs, indicies.RW, Math.min(proficiency,0) );
    				tableSet( tableInfo.Ranged.RWsuperTypes, indicies.RW, weapon[4] );
    				tableSet( tableInfo.Ranged.RWranges, indicies.RW, attkRange );
    				if (ammoSpecs && ammoSpecs.length) {
//    				    log(weaponName+' is a self-ammoed weapon with ammoSpecs.length='+ammoSpecs.length);
    					let rangeSpecs = [...('['+specs.match(/{{\s*range\s*=(.*?)}}/im)[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
    					if (rangeSpecs && rangeSpecs.length) {
//    					    log('rangeSpecs = '+rangeSpecs);
    						ammoInfo = insertAmmo( charCS, weaponName, ammoSpecs, rangeSpecs, tableInfo.Ammo, ammoInfo, weapon[1], attkStrBonus, lineNo );
    					}
    				} else {
//    				    log('Looking up ammo for ranged weapon '+weaponName);
    					ammoInfo = addAmmo( charCS, tableInfo.Ammo, ammoInfo, weapon[1], weapon[4], attkStrBonus );
    				}
    				indicies.RW++;
    			}
			}
		}
		tableInfo.indicies = indicies;
		tableInfo.ammoInfo = ammoInfo;
		return tableInfo;
	};

	/*
	 * Find ammo for the specified ranged weapon type, and
	 * add it to the ammo table
	 */

	var addAmmo = function( charCS, ammoTable, ammoInfo, weaponType, weaponSuperType, sb ) {
		
		var miIndex = fields.MI_table[1] ? -1 : -2,
			ammoIndex = ammoInfo.ammoIndex,
			ammoTypes = ammoInfo.ammoTypes,
			MInames = getTable( charCS, fields.MI_table, fields.MI_name ),
			attrs, sortKeys, ammoName, typeCheck;

		while (!_.isUndefined(ammoName = tableLookup(MInames,++miIndex,false))) {
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
						if (!ammoInfo.ammoTypes.includes(ammoName+'-'+t)) {
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
								ammoInfo = insertAmmo( charCS, ammoName, ammoSpecs, rangeSpecs, ammoTable, ammoInfo, t, sb, miIndex );
							}
						}
					}
				}
			}
		}
		return {ammoIndex:ammoIndex,ammoTypes:ammoTypes};
	}
	
	/*
	 * Find the named weapons in the character's Magic Item 
	 * bag and return their current index.
	 */

	var findWeapon = function( charCS, ...weapons ) {
		
		var i = fields.MI_table[1] ? 0 : -1,
			MInames = getTable( charCS, fields.MI_table, fields.MI_name ),
		    itemName,
			index = [];
			
		index.length = weapons.length;
		index.fill(NaN);
		
		while (!_.isUndefined(itemName = tableLookup( MInames, i, false ))) {
			index[weapons.indexOf(itemName)] = i;
			i++;
		}
		return index;
	}
	
	/*
	 * Find all the necessary tables to manage weapons of any 
	 * or all types.
	 */

	var weaponTables = function( charCS, tableTypes ) {
		
		var tableInfo = {};

		tableInfo.indicies = {};
		tableInfo.ammoInfo = {};
	
		tableInfo.indicies.MW = fields.MW_table[1] ? 0 : -1;
		tableInfo.indicies.RW = fields.RW_table[1] ? 0 : -1;
		tableInfo.indicies.Dmg = fields.MW_dmgTable[1] ? 0 : -1;
		
		tableInfo.ammoInfo.ammoIndex = fields.Ammo_table[1] ? 0 : -1;
		tableInfo.ammoInfo.ammoTypes = [];
		
		if (tableTypes.toUpperCase().includes('MELEE')) {
			tableInfo.Melee = {};
			tableInfo.Melee.MWnames = getTable( charCS, fields.MW_table, fields.MW_name, '', '-' );
			tableInfo.Melee.MWtypes = getTable( charCS, fields.MW_table, fields.MW_type, '', '' );
			tableInfo.Melee.MW2Hs = getTable( charCS, fields.MW_table, fields.MW_twoHanded, '', 0 );
			tableInfo.Melee.MWstrBonuses = getTable( charCS, fields.MW_table, fields.MW_strBonus, '', 1 );
			tableInfo.Melee.MWattkAdjs = getTable( charCS, fields.MW_table, fields.MW_attkAdj, '', 0 );
			tableInfo.Melee.MWnoAttks = getTable( charCS, fields.MW_table, fields.MW_noAttks, '', 1 );
			tableInfo.Melee.MWcritHits = getTable( charCS, fields.MW_table, fields.MW_critHit, '', 20 );
			tableInfo.Melee.MWcritMisses = getTable( charCS, fields.MW_table, fields.MW_critMiss, '', 1 );
			tableInfo.Melee.MWsizes = getTable( charCS, fields.MW_table, fields.MW_size, '', '' );
			tableInfo.Melee.MWranges = getTable( charCS, fields.MW_table, fields.MW_range, '', '' );
			tableInfo.Melee.MWspeeds = getTable( charCS, fields.MW_table, fields.MW_speed, '', 5 );
			tableInfo.Melee.MWprofs = getTable( charCS, fields.MW_table, fields.MW_profLevel, '', 0 );
			tableInfo.Melee.MWsuperTypes = getTable( charCS, fields.MW_table, fields.MW_superType, '', '' );
//			log('weaponTables MWnames property='+tableInfo.Melee.MWnames.property+', length '+tableInfo.Melee.MWnames.sortKeys.length);
		}
		if (tableTypes.toUpperCase().includes('DMG')) {
			tableInfo.Dmg = {};
			tableInfo.Dmg.MWdmgNames = getTable( charCS, fields.MW_dmgTable, fields.MW_dmgName, '', '-' );
			tableInfo.Dmg.MWdmgStrBonuses = getTable( charCS, fields.MW_dmgTable, fields.MW_dmgStrBonus, '', 1 );
			tableInfo.Dmg.MWdmgAdjs = getTable( charCS, fields.MW_dmgTable, fields.MW_dmgAdj, '', 0 );
			tableInfo.Dmg.MWdmgSMs = getTable( charCS, fields.MW_dmgTable, fields.MW_dmgSM, '', 0 );
			tableInfo.Dmg.MWdmgLs = getTable( charCS, fields.MW_dmgTable, fields.MW_dmgL, '', 0 );
			tableInfo.Dmg.MWdmgSpecs = getTable( charCS, fields.MW_dmgTable, fields.MW_dmgSpecialist, '', 0 );
//			log('weaponTables MWdmgNames property='+tableInfo.Dmg.MWdmgNames.property+', length '+tableInfo.Dmg.MWdmgNames.sortKeys.length);
		}
		if (tableTypes.toUpperCase().includes('RANGED')) {
			tableInfo.Ranged = {};
			tableInfo.Ranged.RWnames = getTable( charCS, fields.RW_table, fields.RW_name, '', '-' );
			tableInfo.Ranged.RWtypes = getTable( charCS, fields.RW_table, fields.RW_type, '', '' );
			tableInfo.Ranged.RW2Hs = getTable( charCS, fields.RW_table, fields.RW_twoHanded, '', 1 );
			tableInfo.Ranged.RWstrBonuses = getTable( charCS, fields.RW_table, fields.RW_strBonus, '', 0 );
			tableInfo.Ranged.RWdexBonuses = getTable( charCS, fields.RW_table, fields.RW_dexBonus, '', 1 );
			tableInfo.Ranged.RWattkAdjs = getTable( charCS, fields.RW_table, fields.RW_attkAdj, '', 0 );
			tableInfo.Ranged.RWnoAttks = getTable( charCS, fields.RW_table, fields.RW_noAttks, '', '' );
			tableInfo.Ranged.RWcritHits = getTable( charCS, fields.RW_table, fields.RW_critHit, '', 20 );
			tableInfo.Ranged.RWcritMisses = getTable( charCS, fields.RW_table, fields.RW_critMiss, '', 1 );
			tableInfo.Ranged.RWsizes = getTable( charCS, fields.RW_table, fields.RW_size, '', '' );
			tableInfo.Ranged.RWranges = getTable( charCS, fields.RW_table, fields.RW_range, '', '' );
			tableInfo.Ranged.RWspeeds = getTable( charCS, fields.RW_table, fields.RW_speed, '', '' );
			tableInfo.Ranged.RWprofs = getTable( charCS, fields.RW_table, fields.RW_profLevel, '', 0 );
			tableInfo.Ranged.RWsuperTypes = getTable( charCS, fields.RW_table, fields.RW_superType, '', '' );
//			log('weaponTables RWnames property='+tableInfo.Ranged.RWnames.property+', length '+tableInfo.Ranged.RWnames.sortKeys.length);
		}
		if (tableTypes.toUpperCase().includes('AMMO')) {
			tableInfo.Ammo = {};
			tableInfo.Ammo.AmmoNames = getTable( charCS, fields.Ammo_table, fields.Ammo_name, '', '-' );
			tableInfo.Ammo.AmmoMInames = getTable( charCS, fields.Ammo_table, fields.Ammo_miName, '', '-' );
			tableInfo.Ammo.AmmoTypes = getTable( charCS, fields.Ammo_table, fields.Ammo_type, '', '' );
			tableInfo.Ammo.AmmoStrBonuses = getTable( charCS, fields.Ammo_table, fields.Ammo_strBonus, '', 0 );
			tableInfo.Ammo.AmmoDmgAdjs = getTable( charCS, fields.Ammo_table, fields.Ammo_dmgAdj, '', 0 );
			tableInfo.Ammo.AmmoAttkAdjs = getTable( charCS, fields.Ammo_table, fields.Ammo_attkAdj, '', 0 );
			tableInfo.Ammo.AmmoDmgSMs = getTable( charCS, fields.Ammo_table, fields.Ammo_dmgSM, '', '' );
			tableInfo.Ammo.AmmoDmgLs = getTable( charCS, fields.Ammo_table, fields.Ammo_dmgL, '', '' );
			tableInfo.Ammo.AmmoRanges = getTable( charCS, fields.Ammo_table, fields.Ammo_range, '', '-1/2/3' );
			tableInfo.Ammo.AmmoQtys = getTable( charCS, fields.Ammo_table, fields.Ammo_qty, '', 0 );
			tableInfo.Ammo.AmmoMaxQtys = getTable( charCS, fields.Ammo_table, fields.Ammo_maxQty, '', 0 );
		}
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
			thac0 = curToken.get('bar2_value'),
			monsterCritHit = attrLookup( charCS, fields.MonsterCritHit ) || 20,
			monsterCritMiss = attrLookup( charCS, fields.MonsterCritMiss ) || 1,
			monsterDmg1 = attrLookup( charCS, fields.MonsterDmg1 ) || 0,
			monsterDmg2 = attrLookup( charCS, fields.MonsterDmg2 ) || 0,
			monsterDmg3 = attrLookup( charCS, fields.MonsterDmg3 ) || 0,
			magicHitAdj = attrLookup( charCS, fields.Hit_magicAdj ) || 0,
			magicDmgAdj = attrLookup( charCS, fields.Dmg_magicAdj ) || 0,
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
			thac0		= curToken.get('bar2_value'),
			mwNumber    = mwIndex + (fields.MW_table[1] ? 1 : 2),
			weaponName 	= tableLookup( tableInfo.Melee.MWnames, mwIndex ),
			attkAdj 	= tableLookup( tableInfo.Melee.MWattkAdjs, mwIndex ),
			strBonus 	= tableLookup( tableInfo.Melee.MWstrBonuses, mwIndex ),
			mwType 		= tableLookup( tableInfo.Melee.MWtypes, mwIndex ),
			mwSuperType = tableLookup( tableInfo.Melee.MWsuperTypes, mwIndex ),
			critHit 	= tableLookup( tableInfo.Melee.MWcritHits, mwIndex ),
			critMiss 	= tableLookup( tableInfo.Melee.MWcritMisses, mwIndex ),
			dmgAdj 		= tableLookup( tableInfo.Dmg.MWdmgAdjs, mwIndex ),
			dmgSM 		= tableLookup( tableInfo.Dmg.MWdmgSMs, mwIndex ),
			dmgL 		= tableLookup( tableInfo.Dmg.MWdmgLs, mwIndex ),
			dmgStrBonus = tableLookup( tableInfo.Dmg.MWdmgStrBonuses, mwIndex ),
			strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
			strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
			rogueLevel 	= attrLookup( charCS, fields.Rogue_level ) || 0,
			magicHitAdj = attrLookup( charCS, fields.Hit_magicAdj ) || 0, 
			magicDmgAdj = attrLookup( charCS, fields.Dmg_magicAdj ) || 0,
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
			thac0		= curToken.get('bar2_value'),
			rwNumber    = rwIndex + (fields.RW_table[1] ? 1 : 2),
			weaponName 	= tableLookup( tableInfo.Ranged.RWnames, rwIndex ),
			attkAdj 	= tableLookup( tableInfo.Ranged.RWattkAdjs, rwIndex ),
			weapStrBonus= tableLookup( tableInfo.Ranged.RWstrBonuses, rwIndex ),
			weapDexBonus= tableLookup( tableInfo.Ranged.RWdexBonuses, rwIndex ),
			rwType 		= tableLookup( tableInfo.Ranged.RWtypes, rwIndex ),
			rwSuperType = tableLookup( tableInfo.Ranged.RWsuperTypes, rwIndex ),
			critHit 	= tableLookup( tableInfo.Ranged.RWcritHits, rwIndex ),
			critMiss 	= tableLookup( tableInfo.Ranged.RWcritMisses, rwIndex ),
			ammoName    = tableLookup( tableInfo.Ammo.AmmoNames, ammoIndex ),
			dmgAdj 		= tableLookup( tableInfo.Ammo.AmmoDmgAdjs, ammoIndex ),
			dmgSM 		= tableLookup( tableInfo.Ammo.AmmoDmgSMs, ammoIndex ),
			dmgL 		= tableLookup( tableInfo.Ammo.AmmoDmgLs, ammoIndex ),
			ammoStrBonus= tableLookup( tableInfo.Ammo.AmmoStrBonuses, ammoIndex ),
			ammoQty		= tableLookup( tableInfo.Ammo.AmmoQtys, ammoIndex ),
			strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
			strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
			dexMissile	= attrLookup( charCS, fields.Dex_missile ) || 0,
			rogueLevel 	= attrLookup( charCS, fields.Rogue_level ) || 0,
			magicHitAdj = attrLookup( charCS, fields.Hit_magicAdj ) || 0, 
			magicDmgAdj = attrLookup( charCS, fields.Dmg_magicAdj ) || 0,
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

				rangeMod = attrLookup( charCS, [fields.RW_rangeMod[0]+dist, fields.RW_rangeMod[1]] ) || defMod;
				
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
    		disabled = isNaN(weaponIndex) || isNaN(ammoIndex);

		if (!disabled) {
    		ranges = tableLookup( tableInfo.Ammo.AmmoRanges, ammoIndex );
			proficiency = proficient( charCS, tableLookup( tableInfo.Ranged.RWtypes, weaponIndex ), tableLookup( tableInfo.Ranged.RWsuperTypes, weaponIndex ));
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
			i, w, title,
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
			tableInfo = weaponTables( charCS, 'MELEE,DMG,RANGED,AMMO' ),
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
			+  (backstab ? 'again' : '')+'}}';
		}

		// build the Melee Weapon list

		weaponIndex = fields.MW_table[1] ? -1 : -2;
		weaponOffset = fields.MW_table[1] ? 1 : 2;
		title = false;
		while (!_.isUndefined(weaponName = tableLookup( tableInfo.Melee.MWnames, ++weaponIndex, false ))) {
			if (weaponName != '-') {
				if (!title) {
					content += '{{ =**MeleeWeapons**\n';
					title = true;
				}
				buildMWattkMacros( args, charCS, tableInfo, weaponIndex, backstab );
				content += '['+weaponName+'](~'+charName+'|Attk-MW'+(weaponIndex+weaponOffset)+') ';
			}
		};
		
		content += title ? '}}' : '';

		// build the character Ranged Weapons list

		weaponIndex = fields.RW_table[1] ? -1 : -2;
		title = false;
		while (!_.isUndefined(weaponName = tableLookup( tableInfo.Ranged.RWnames, ++weaponIndex, false ))) {
			if (weaponName != '-') {
				if (!title) {
					content += '{{  =**RangedWeapons**}}';
					title = true;
				}
				content += '{{'+weaponName+'=';
				weaponType = tableLookup( tableInfo.Ranged.RWtypes, weaponIndex );
				weaponSuperType = tableLookup( tableInfo.Ranged.RWsuperTypes, weaponIndex );
				ammoIndex = fields.Ammo_table[1] ? -1 : -2;
				while (!_.isUndefined(ammoName = tableLookup( tableInfo.Ammo.AmmoNames, ++ammoIndex, false ))) {
					ammoType = tableLookup( tableInfo.Ammo.AmmoTypes, ammoIndex );
					if (ammoName != '-' && (ammoType == weaponType || ammoType == weaponSuperType)) {
						ammoQty = tableLookup( tableInfo.Ammo.AmmoQtys, ammoIndex );
						content += ((weaponIndex == weaponButton && ammoIndex == ammoButton) ? '<span style=' + design.selected_button + '>' : '[');
						content += '**'+ammoQty+'** '+ammoName;
						content += ((weaponIndex == weaponButton && ammoIndex == ammoButton) ? '</span>' : '](!attk --button ' + BT.RANGED + '|' + tokenID + '|' + attkType + '|' + weaponIndex + '|' + ammoIndex + ')');
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
			MInames = getTable( charCS, fields.MI_table, fields.MI_name ),
			MIqtys  = getTable( charCS, fields.MI_table, fields.MI_qty  ),
			MImaxs  = getTable( charCS, fields.MI_table, fields.MI_trueQty ),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Ammunition}}'
					+ '{{desc=The current quantity is displayed with the maximum you used to have.'
					+ 'To change the amount of any ammo listed, click the ammo name and enter the *change* (plus or minus).'
					+ 'The maximum will be set to the final current quantity, reflecting your new total}}'
					+ '{{desc1=';
		while (!_.isUndefined(ammoName = tableLookup(MInames,++miIndex,false))) {
			let ammo = abilityLookup( fields.MagicItemDB, ammoName ),
    			ammoData, ammoMatch;
			if (ammo.obj && ammo.obj[0]) {
			    ammoData = ammo.obj[0].get('action');
			    if (ammoData && ammoData.length) {
					ammoMatch = [...('['+ammoData.match(/{{\s*?ammo\s*?=.*?}}/im)+']').matchAll(/\[.*?\]/g)];
					if (ammoMatch && ammoMatch[0] && ammoMatch[0][0].toLowerCase().includes('ammo')) {
					    log('ammoMatch[0] = '+ammoMatch[0]);
						if (!title) {
							content += '<table><tr><td>Now</td><td>Max</td><td>Ammo Name</td></tr>';
							title = true;
						}
						qty = tableLookup(MIqtys,miIndex);
						maxQty = tableLookup(MImaxs,miIndex);
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
			MInames = getTable( charCS, fields.MI_table, fields.MI_name, '', '' ),
			left = isNaN(leftIndex) ? '' : tableLookup( MInames, leftIndex ),
			right = isNaN(rightIndex) ? '' : tableLookup( MInames, rightIndex ),
			both = isNaN(bothIndex) ? '' : tableLookup( MInames, bothIndex ),
			auto1 = isNaN(auto1Index) ? '' : tableLookup( MInames, auto1Index ),
			auto2 = isNaN(auto2Index) ? '' : tableLookup( MInames, auto2Index ),
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
	 
	
// --------------------------------------------------------------- Button press Handlers ----------------------------------------------

	/*
	 * Handle changing the amount of Ammo held.  Update 
	 * both the Ammo table and the related Magic Item with
	 * the current amount and/or the maximum amount specified,
	 * or modify it if a + or - precedes the amount.
	 */
 
	var handleAmmoChange = function( args ) {
		
		var tokenID = args[1],
			ammo = args[2],
			setQty = parseInt(args[3]),
			setMax = parseInt(args[4]),
			silent = ((args[5] || '').toUpperCase() == 'SILENT'),
			charCS = getCharacter(tokenID),
			ammoNames = getTable(charCS,fields.Ammo_table,fields.Ammo_name),
			ammoMIs = getTable(charCS,fields.Ammo_table,fields.Ammo_miName),
			ammoIndex = tableFind( ammoNames, ammo ),
			ammoMIname = tableLookup(ammoMIs,ammoIndex),
			miNames = getTable(charCS,fields.MI_table,fields.MI_name),
			miIndex = tableFind( miNames, ammoMIname );
			
//		log('handleAmmoChange: args='+args+', ammoIndex='+ammoIndex+', miName='+ammoMIname+', miIndex='+miIndex);
			
		if (!miIndex) {return;}

		var	ammoQtys = getTable(charCS,fields.Ammo_table,fields.Ammo_qty,'',0),
			ammoMaxs = getTable(charCS,fields.Ammo_table,fields.Ammo_maxQty,'',0),
			miQtys = getTable(charCS,fields.MI_table,fields.MI_qty,'',0),
			miMaxs = getTable(charCS,fields.MI_table,fields.MI_trueQty,'',0),
    		miQ = parseInt(tableLookup( miQtys, miIndex )),
    		miM = parseInt(tableLookup( miMaxs, miIndex )),
    		qty = Math.max(setQty + miQ,0),
    		maxQty = isNaN(setMax) ? qty : Math.max(setMax + miM,0);
    		
//    	log('handleAmmoChange: miQ='+miQ+', miM='+miM+', qty:'+qty+', maxQty='+maxQty);

		tableSet( miQtys, miIndex, qty );
		tableSet( miMaxs, miIndex, maxQty );
		
		if (!isNaN(ammoIndex) && ammoIndex >= -1) {
			tableSet( ammoQtys, ammoIndex, qty );
			tableSet( ammoMaxs, ammoIndex, maxQty );
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
		
		var tokenID = args[1],
			leftIndex = args[2],
			rightIndex = args[3],
			bothIndex = args[4],
			auto1Index = args[5],
			auto2Index = args[6],
			i,
			charCS = getCharacter(tokenID),
			tableInfo = weaponTables( charCS, 'MELEE,DMG,RANGED,AMMO' );
			
//		log('handleChangeWeapon args:'+args);

		blankTable( charCS, tableInfo, 'MELEE' );
		blankTable( charCS, tableInfo, 'RANGED' );
		blankTable( charCS, tableInfo, 'DMG' );
		blankTable( charCS, tableInfo, 'AMMO' );

		tableInfo = addWeapon( charCS, fields.Equip_leftHand, 1,  leftIndex,  tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_rightHand, 1, rightIndex, tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_bothHands, 2, bothIndex,  tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_auto1Slot, 0, auto1Index, tableInfo );
		tableInfo = addWeapon( charCS, fields.Equip_auto2Slot, 0, auto2Index, tableInfo );
		
		makeChangeWeaponMenu( args );
		
//        log('handleChangeWeapon returning');
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

	/**
	 * Function to handle the internal --attkRoll command and return
	 * a dice roll to where it came from
	**/
	
	var doAttkRoll = function(args,playerId) {
		
		args = args.split('|');
		if (args.length < 2) {
			sendDebug( 'doAttkRoll: invalid arguments for roll result' );
			sendError( 'Internal attackMaster roll error' );
			return;
		};
		
		switch (args[1]) {
		case BT.MELEE :
			
			sendFeedback( 'doAttkRoll: roll result is type: MELEE, roll: ' + args[1] + '.  Total of ' + args.length + ' arguments.' );
			break;
			
		default :
			sendFeedback( 'doAttkRoll: roll result is type: ' + args[0] + ', roll: ' + args[1] + '.  Total of ' + args.length + ' arguments.' );
			break;
		};	
		
	};

	/*
	* Function to display the menu for attacking with physical melee, ranged or innate weapons
	*/

	var doAttkMenu = function(args,attkType) {
		if (!args)
			{return;}
			
		if (!_.contains(Attk,attkType.toUpperCase())) {
			sendDebug('doAttkMenu: Invalid attkType '+attkType+' specified');
			sendError('Invalid AttackMaster parameter');
			return;
		}

        args = args.split('|');

		if (args.length < 1 || args.length > 4) {
			sendDebug('doAttackMenu: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doAttackMenu: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
        
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
				doAttkMenu(arg,Attk.TO_HIT);
			} else if (arg.indexOf('attk-roll ') === 0) {
				arg = arg.replace('attk-roll ','').trim();
				doAttkMenu(arg,Attk.ROLL);
			} else if (arg.indexOf('attk-target ') === 0) {
				arg = arg.replace('attk-target ','').trim();
				doAttkMenu(arg,Attk.TARGET);
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