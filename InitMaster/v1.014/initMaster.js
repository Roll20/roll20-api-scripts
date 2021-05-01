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
 */
 
var initMaster = (function() {
	'use strict'; 
	var version = 1.015,
		author = 'RED',
		pending = null;

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
		MW_PRIME:	'MW_PRIME',
		MW_SECOND:	'MW_SECOND',
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

	var fields = Object.freeze({
		feedbackName:       'initMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		MagicItemDB:        'MI-DB',
		roundMaster:        '!tj',
		attackMaster:       '!attk',
		Fighter_class:      ['class1','current'],
		Fighter_level:      ['level-class1','current'],
		Wizard_level:       ['level-class2','current'],
		Priest_level:       ['level-class3','current'],
		Rogue_level:        ['level-class4','current'],
		Psion_level:        ['level-class5','current'],
		Thac0:              ['bar2','value'],
		initMultiplier:     ['comreact','max'],
		initMod:            ['comreact','current'],
		Strength_hit:       ['strengthhit','current'],
		Strength_dmg:       ['strengthdmg','current'],
		Dmg_magicAdj:       ['strengthdmg','max'],
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
		MW_twoHanded:       ['twohanded','current'],
		MW_profLevel:       ['prof-level','current'],
		MW_thac0:			['thac0','current'],
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
        RW_twoHanded:       ['twohanded2','current'],
		RW_profLevel:       ['prof-level2','current'],
		RW_thac0:			['thac0','current'],
		RW_crit:            ['crit-thresh2','current'],
		RW_range:           ['range2','current'],
		AmmoFirstRowNamed:  true,
		Ammo_table:         ['repeating_ammo','current'],
		Ammo_name:          ['ammoname','current'],
		Ammo_strBonus:      ['strbonus3','current'],
		Ammo_dmgAdj:        ['damadj2','current'],
		Ammo_dmgSM:         ['damsm2','current'],
		Ammo_dmgL:          ['daml2','current'],
		Ammo_indirect:      ['Ammo-RW','current'],
		Ammo_qty:           ['ammoremain','current'],
		Ammo_flag:          ['ammo-flag-RW','current'],
		WPfirstRowNamed:    true,
		WP_table:           ['repeating_weaponprofs','current'],
		WP_specialist:      ['specialist','current'],
		WP_mastery:         ['mastery','current'],
		WP_backstab:        ['chosen-weapon','current'],
		SpellsFirstColNum:  false,
		MUbaseCol:          1,
		PRbaseCol:          28,
		SpellsCols:         3,
		Spells_table:       ['repeating_spells','current'],
		Spells_name:        ['spellname','current'],
		Spells_speed:       ['casttime','current'],
		PowersFirstColNum:  true,
		PowersBaseCol:      67,
		PowersCols:         3,
		Powers_table:       ['repeating_spells','current'],
		Powers_name:        ['spellname','current'],
		Powers_speed:       ['casttime','current'],
		MIFirstRowNum:      false,
		MI_table:           ['repeating_potions','current'],
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

// -------------------------------------------- utility functions ----------------------------------------------

	
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
            return;
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
	
	var setAttr = function( charCS, attrName, attrField, attrValue, caseSensitive ) {
		
		var attrObj = attrLookup( charCS, attrName, null, caseSensitive ),
		    createList = !!state.initMaster.attrsToCreate[charCS.id],
		    createStr;
		
		if (!attrObj) {
		    sendDebug( 'setAttr: ' + attrName + ' not found.  Adding to list for creation');
		    createStr = ' --' + attrName + (attrField.toLowerCase() == 'max' ? '|' : '') + '|' + attrValue ;
		    if (createList) {
    			state.initMaster.attrsToCreate[charCS.id] += createStr;
		    } else {
		        state.initMaster.attrsToCreate[charCS.id] = createStr;
		    }
			sendDebug( 'setAttr: attrs to create for ' + charCS.get('name') + state.initMaster.attrsToCreate[charCS.id]);
		} else {
		    sendDebug( 'setAttr: character ' + charCS.get('name') + ' attribute ' + attrName + ' ' + attrField + ' set to ' + attrValue );
			attrObj.set( attrField, attrValue );
		}
		return;
	}
	
	/**
	* Create any pending attributes in attrsToCreate using ChatSetAttr
	* rather than build a function myself - though this will only
	* handle simple attributes, not repeating tables
	**/
	
	var createAttrs = function( silent, replace ) {
		
		if (state.initMaster.attrsToCreate) {
			_.each( state.initMaster.attrsToCreate, function( attrs, charID ) {
				let setVars = '!setattr ' + ( silent ? '--silent ' : '' ) + ( replace ? '--replace ' : '' ) + '--charid ' + charID;
					setVars += attrs;
				sendDebug( 'createAttrs: creating attributes for ' + getAttrByName( charID, 'character_name' ));
				sendInitAPI( setVars );
			});
			state.initMaster.attrsToCreate = {};
		};
	};
	

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
			sheetTypes.sheetType = attrLookup( charCS, 'sheet-type', 'current' );
			sheetTypes.sheetMUType = attrLookup( charCS, 'sheet-mu-spells-type', 'current' );
			sheetTypes.sheetPRType = attrLookup( charCS, 'sheet-pr-spells-type', 'current' );
			sheetTypes.sheetPowersType = attrLookup( charCS, 'sheet-powers-type', 'current' );
			sheetTypes.sheetMIBagType = attrLookup( charCS, 'sheet-mibag-type', 'current' );
			sheetTypes.sheetLangsType = attrLookup( charCS, 'sheet-langs-type', 'current' );
			sheetTypes.sheetNWPType = attrLookup( charCS, 'sheet-nwp-type', 'current' );
			sheetTypes.sheetGemsType = attrLookup( charCS, 'sheet-gems-type', 'current' );
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
				setAttr( charCS, fields.Ammo_flag[0] + i, fields.Ammo_flag[1], (ammoQty ? 1 : 0) );
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
			setAttr( charCS, 'weapno', 'max', attrLookup( charCS, 'weapno', 'current' ) );
			setAttr( charCS, 'init_action', 'max', attrLookup( charCS, 'init_action', 'current' ) );
			setAttr( charCS, 'init_speed', 'max', attrLookup( charCS, 'init_speed', 'current' ) );
			setAttr( charCS, 'init_actionnum', 'max', attrLookup( charCS, 'init_actionnum', 'current' ) );
			setAttr( charCS, 'init_preinit', 'max', 0 );
			// RED: v1.013 added init_2H to hold a flag = 1 for 2-handed weapon initiative, 
			// 0 for 1-handed weapon initiative, and -1 for any other initiative
			setAttr( charCS, 'init_2H','max', attrLookup( charCS, 'init_2H', 'current' ) );
		}
		
		setAttr( charCS, 'weapno', property, args[2]);
		setAttr( charCS, 'init_action', property, args[3]);
		setAttr( charCS, 'init_speed', property, args[4]);
		setAttr( charCS, 'init_actionnum', property, args[5]);
		setAttr( charCS, 'init_preinit', property, args[6]);
		setAttr( charCS, 'init_2H', property, args[7]);
		setAttr( charCS, 'init-chosen', property, 1);
	};

	
//----------------------------------- button press handlers ------------------------------------------	
	/**
	* Handle the results of pressing a monster attack initiative button
	* Use the simple monster initiative menu if 'monster' flag is true
	**/
	
	var handleInitMonster = function( monster, charCS, sheetTypes, args ) {

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

		weapSpeed = (attrLookup( charCS, fields.Monster_speed[0], fields.Monster_speed[1]) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier[0], fields.initMultiplier[1]) || 1), 1);
		
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
	
	var handleInitMW = function( charType, charCS, sheetTypes, args ) {

		var repeating_index,
			weaponName,
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

		if (fields.MWfirstRowNamed && rowIndex == 1) {
			repeating_index = '';
		} else {
			repeating_index = fields.MW_table[0] + '_$' + refIndex + '_';
		}

		weaponName = (attrLookup( charCS, repeating_index + fields.MW_name[0], fields.MW_name[1]) || '');
		weapSpeed = (attrLookup( charCS, repeating_index + fields.MW_speed[0], fields.MW_speed[1]) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier[0], fields.initMultiplier[1]) || 1), 1);
		attackNum = (attrLookup( charCS, repeating_index + fields.MW_noAttks[0], fields.MW_noAttks[1]) || 1);
		twoHanded = (attrLookup( charCS, repeating_index + fields.MW_twoHanded[0], fields.MW_twoHanded[1]) || 0);

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
	
	var handlePrimeWeapon = function( charCS, sheetTypes, args ) {
		
		var tokenID = args[1],
			rowIndex = args[2],
			rowIndex2 = args[3],
			refIndex = args[4],
			refIndex2 = args[5],
			repeating_index,
			buildCall;

		if (rowIndex > 0) {
			if (fields.MWfirstRowNamed && rowIndex == 1) {
				repeating_index = '';
			} else {
				repeating_index = fields.MW_table[0] + '_$' + refIndex + '_';
			}

			var	weaponName = (attrLookup( charCS, repeating_index + fields.MW_name[0], fields.MW_name[1]) || ''),
				weapSpeed = (attrLookup( charCS, repeating_index + fields.MW_speed[0], fields.MW_speed[1]) || 0),
				speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier[0], fields.initMultiplier[1]) || 1), 1),
				attackNum = (attrLookup( charCS, repeating_index + fields.MW_noAttks[0], fields.MW_noAttks[1]) || 1);
				
			// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

			buildCall = '!init --buildMenu ' + MenuType.MW_PRIME
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '|with their ' + weaponName
					+ '|[[' + weapSpeed + ']]'
					+ '|' + speedMult + '*' + attackNum
					+ '|0'
					+ '|1'
					+ '|' + rowIndex2;
					
		} else {
			buildCall = '!init --buildMenu ' + MenuType.MW_MELEE
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '| '
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|' + rowIndex2;
		}		

		sendInitAPI( buildCall );
		return;
		
	}
	
	/**
	* Handle selection of a weapon button on the Second Melee Weapon menu
	**/
	
	var handleSecondWeapon = function( charCS, sheetTypes, args ) {
		
		var tokenID = args[1],
			rowIndex = args[2],
			rowIndex2 = args[3],
			refIndex = args[4],
			refIndex2 = args[5],
			weapon,
			weaponRef,
			repeating_index,
			buildCall;
			
		if (rowIndex == rowIndex2)
			{return;}

		if (parseInt(rowIndex2,10) > 0) {
		    weapon = rowIndex2;
		    weaponRef = refIndex2;
		} else {
		    weapon = rowIndex;
		    weaponRef = refIndex;
		}
		if (fields.MWfirstRowNamed && parseInt(weapon,10) == 1) {
			repeating_index = '';
		} else {
			repeating_index = fields.MW_table[0] + '_$' + weaponRef + '_';
		}

		var	weaponName = (attrLookup( charCS, repeating_index + fields.MW_name[0], fields.MW_name[1]) || ''),
			weapSpeed = (attrLookup( charCS, repeating_index + fields.MW_speed[0], fields.MW_speed[1]) || 0),
			speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier[0], fields.initMultiplier[1]) || 1), 1),
			attackNum = (attrLookup( charCS, repeating_index + fields.MW_noAttks[0], fields.MW_noAttks[1]) || 1);
			
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
				
		sendInitAPI( buildCall );
		
		return;
	}
		
	
	/**
	* Handle the results of pressing a ranged weapon initiative button
	* if 'monster' is true, use a complex monster menu
	**/
	
	var handleInitRW = function( charType, charCS, sheetTypes, args ) {

		var repeating_index,
		    repProfs_index,
			weaponName,
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
		
		if (fields.RWfirstRowNamed && rowIndex == 2) {
			repeating_index = '';
			repProfs_index = fields.WP_table[0] + '_$0_';
		} else {
			repeating_index = fields.RW_table[0] + '_$' + refIndex + '_';
			repProfs_index = fields.WP_table[0] + '_$' + (rowIndex-2) +  '_';
		}

		weaponName = (attrLookup( charCS, repeating_index + fields.RW_name[0], fields.RW_name[1]) || '');
		weapSpeed = (attrLookup( charCS, repeating_index + fields.RW_speed[0], fields.RW_speed[1]) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier[0], fields.initMultiplier[1]) || 1), 1);
		attackNum = (attrLookup( charCS, repeating_index + fields.RW_noAttks[0], fields.RW_noAttks[1]) || 1);
		weapSpecial = attrLookup( charCS, repProfs_index + fields.WP_specialist[0], fields.WP_specialist[1]);
		twoHanded = (attrLookup( charCS, repeating_index + fields.MW_twoHanded[0], fields.MW_twoHanded[1]) || 0);

        // RED: the next few lines are only here due to a bug in attrLookup and the weaponProfs 2E charater sheet table
        // which seems to randomly cause issues with undefined values.

        if (!weapSpecial) {
    		weapSpecial = (attrLookup( charCS, fields.WP_table[0] + '_$0_' + fields.WP_specialist[0], fields.WP_specialist[1]) || 1);
        }
        
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
	
	var handleInitSpell = function( spellCasterType, charCS, sheetTypes, args ) {
	
		var colNum,
			repSpellField,
			spellName,
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

		colNum = (fields.SpellsFirstColNum || colIndex != 1);
		repSpellField = fields.Spells_table[0] + ( colNum ? colIndex : '' ) + '_$' + rowIndex + '_';

		spellName = attrLookup( charCS, repSpellField + fields.Spells_name[0] + ( colNum ? colIndex : '' ), fields.Spells_name[1] );
		spellCastTime = attrLookup( charCS, repSpellField + fields.Spells_speed[0] + ( colNum ? colIndex : '' ), fields.Spells_speed[1] );

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

	var handleInitPower = function( charCS, sheetTypes, args ) {
	
		var colNum,
			repPowerField,
			powerName,
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

		colNum = (fields.PowersFirstColNum || colIndex != 1);
		repPowerField = fields.Powers_table[0] + ( colNum ? colIndex : '' ) + '_$' + rowIndex + '_';

		powerName = attrLookup( charCS, repPowerField + fields.Powers_name[0] + ( colNum ? colIndex : '' ), fields.Powers_name[1] );
		powerCastTime = attrLookup( charCS, repPowerField + fields.Powers_speed[0] + ( colNum ? colIndex : '' ), fields.Powers_speed[1] );

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

	var handleInitMIBag = function( charCS, sheetTypes, args ) {
	
		var rowNum,
			repItemField,
			itemName,
			itemSpeed,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			buildCall = '';

		if (_.isUndefined(rowIndex == undefined)) {
			sendDebug( 'handleInitMIBag: row index undefined' );
			sendError( 'Invalid button' );
			return;
		}

		rowNum = (fields.MIFirstColNum || rowIndex != 1);
		repItemField = fields.MI_table[0] + '_$' + rowIndex + '_';

		itemName = attrLookup( charCS, (rowNum ? repItemField : '') + fields.MI_name[0], fields.MI_name[1] );
		itemSpeed = attrLookup( charCS, (rowNum ? repItemField : '') + fields.MI_speed[0], fields.MI_speed[1] );

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

	var handleInitThief = function( charCS, sheetTypes, args ) {
	
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
	
	var handleOtherActions = function( charCS, sheetTypes, args ) {
	
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
	
	var handleInitCarry = function( tokenID, charCS, sheetTypes, initMenu ) {
	
		var init_speed,
		    buildCall;
			
		setAmmoFlags( charCS, sheetTypes );
		setAttr( charCS, 'init-done', 'current', 0 );
		setAttr( charCS, 'init-submitVal', 'current', 1 );
							
		init_speed = (attrLookup( charCS, 'init_speed', 'current' ) || 0);

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
	
	/**
	* Handle any Submit button being pressed to roll the initiative
	**/
	
	var handleInitSubmit = function( senderId, charCS, sheetTypes, args ) {

		var	initMenu = args[0],
			tokenID = args[1],
		    rowIndex = args[2],
		    initMenu = args[3],
		    rowIndex2 = args[4];

		if (_.isUndefined(rowIndex)) {
			sendDebug( 'handleInitSubmit: index undefined' );
			sendError( 'Invalid button' );
			return;
		}

		var submitVal = attrLookup( charCS, 'init-submitVal', 'current' );

		if (rowIndex < 0 && !submitVal) {
			sendParsedMsg( 'InitMaster', Init_Messages.doneInit, tokenID );
			return;
		}
		
		var	charName = charCS.get('name'),
			tokenName = getObj( 'graphic', tokenID ).get('name'),
			fighterClass = (attrLookup( charCS, fields.Fighter_class[0], fields.Fighter_class[1] ) || ''),
			init_Mod = (attrLookup( charCS, fields.initMod[0], fields.initMod[1] ) || 0),
			init_Mult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier[0], fields.initMultiplier[1] ) || 1),1),
			init_Done = parseInt(attrLookup( charCS, 'init-done', 'current' ), 10),

			init_speed = attrLookup( charCS, 'init_speed', 'current' ),
			init_action = attrLookup( charCS, 'init_action', 'current' ),
			init_actionnum = attrLookup( charCS, 'init_actionnum', 'current' ),
			init_preinit = attrLookup( charCS, 'init_preinit', 'current' ),
			weapno = attrLookup( charCS, 'weapno', 'current' ),
			actionNum = Math.floor(eval( '2 * '+init_actionnum )),
			preinit = eval( init_preinit ),
			weapSpeed = parseInt( init_speed, 10 ),
			twoHanded = attrLookup( charCS, 'init_2H', 'current' ),
			round = state.initMaster.round;
		

		if (initMenu == MenuType.TWOWEAPONS) {
			
			var init_speed2 = attrLookup( charCS, 'init_speed', 'max' ),
				weapSpeed2 = parseInt( init_speed2, 10 ),
				init_action2 = attrLookup( charCS, 'init_action', 'max' ),
				init_actionnum2 = flags.twoWeapSingleAttk ? (init_Mult + '*1') : attrLookup( charCS, 'init_actionnum', 'max' ),
				actionNum2 = Math.floor(eval( '2 * '+init_actionnum2 ));

			args[3] = args[4];
		}
		
		setAttr( charCS, 'prev-round', 'current', 0 );
		setAttr( charCS, 'prev-round' + tokenID, 'current', state.initMaster.round, true );
		setAttr( charCS, 'init_chosen', 'current', 0 );
		setAttr( charCS, 'init-done', 'current', -1 );
		setAttr( charCS, 'init-submitVal', 'current', 0 );
		setAttr( charCS, 'init-carry', 'current', (init_speed > 10 ? 1 : 0) );
		setAttr( charCS, 'init-carry_speed', 'current', (init_speed - 10) );
		setAttr( charCS, 'init-carry_action', 'current', init_action );
		setAttr( charCS, 'init-carry_actionnum', 'current', init_actionnum );
		setAttr( charCS, 'init-carry_weapno', 'current', weapno );
		setAttr( charCS, 'init-carry_preinit', 'current', init_preinit );
		setAttr( charCS, 'init-carry_2H', 'current', twoHanded );
		
		if (init_Done) {
			return;
		}
		
		buildMenu( initMenu, charCS, sheetTypes, MenuState.DISABLED, args );

		var entryCount = 0,
    		content = '';

		if (initMenu != MenuType.TWOWEAPONS || weapSpeed2 >= weapSpeed) {
			
			if (actionNum > 1 || !(round % 2)) {
				content += fields.roundMaster + ' --addtotracker '
						+ tokenName
						+ '|' + tokenID
						+ '|' + (preinit ? '0' : '[[(([[1d10]])+([['+init_speed+']] + [['+init_Mod+']]) ))]]')
						+ '|0'
						+ '|' + init_action
						+ '|, rate ' + init_actionnum + ', speed ' + init_speed + ', modifier ' + init_Mod;
				entryCount++;
			}
			if (initMenu == MenuType.TWOWEAPONS && (actionNum2 > 1 || !(round % 2))) {
				content += (entryCount == 0 ? fields.roundMaster : '') + ' --addtotracker '
						+ tokenName
						+ '|' + tokenID
						+ '|[[([['+init_speed2+']] + [['+init_Mod+']] - [['+init_speed+']])]]'
						+ '|0'
						+ '|' + init_action2 
						+ '|, rate ' + init_actionnum2 + ', speed ' + init_speed2 + ', modifier ' + init_Mod;
				entryCount++;
			}
			
		} else {
			
			if (actionNum2 > 1 || !(round % 2)) {
				content += fields.roundMaster + ' --addtotracker '
						+ tokenName
						+ '|' + tokenID
						+ '|[[(([[1d10]])+([['+init_speed2+']] + [['+init_Mod+']]) ))]]'
						+ '|0'
						+ '|' + init_action2 
						+ '|, rate ' + init_actionnum2 + ', speed ' + init_speed2 + ', modifier ' + init_Mod;
				entryCount++;
			}
			if (actionNum > 1 || !(round % 2)) {
				content += (entryCount == 0 ? fields.roundMaster : '') + ' --addtotracker '
						+ tokenName
						+ '|' + tokenID
						+ '|[[([['+init_speed+']] + [['+init_Mod+']]-[['+init_speed2+']])]]'
						+ '|0'
						+ '|' + init_action 
						+ '|, rate ' + init_actionnum + ', speed ' + init_speed + ', modifier ' + init_Mod;
				entryCount++;
			}
			
		}
				
		if (actionNum > 2 && (actionNum > 4 || !(actionNum % 2) || !(round % 2))) {
			content += ' --addtotracker '
					+ tokenName
					+ '|' + tokenID
					+ '|[[' + (preinit ? '([[1d10]])+' : '') +'([['+init_speed+']] + [['+init_Mod+']])]]'
					+ '|0'
					+ '|' + init_action; 
			entryCount++;
		}

		for( let i=4; actionNum>i; i+=2 ) {
			if ((actionNum > (i+2)) || !(actionNum % 2) || !(round % 2)) {
				content += ' --addtotracker '
						+ tokenName
						+ '|' + tokenID
						+ '|[[' + (i/2) + '*([['+init_speed+']] + [['+init_Mod+']])]]'
						+ '|0'
						+ '|' + init_action;
				entryCount++;
			}
		}
		
		if (initMenu == MenuType.TWOWEAPONS) {
			if (actionNum2 > 2 && (actionNum2 > 4 || !(actionNum2 % 2) || !(round % 2))) {
				content += ' --addtotracker '
						+ tokenName
						+ '|' + tokenID
						+ '|[[([['+init_speed2+']] + [['+init_Mod+'}]])]]'
						+ '|0'
						+ '|' + init_action2;
				entryCount++;
			}

			for( let i=4; actionNum2>i; i+=2 ) {
				if ((actionNum2 > (i+2)) || !(actionNum2 % 2) || !(round % 2)) {
					content += ' --addtotracker '
							+ tokenName
							+ '|' + tokenID
							+ '|[[' + (i/2) + '*([['+init_speed2+']] + [['+init_Mod+']])]]'
    						+ '|0'
    						+ '|' + init_action2;
					entryCount++;
				}
			}
		}
		
		content += ' --removefromtracker '
				+ tokenName
				+ '|' + tokenID
				+ '|' + entryCount;

		sendInitAPI( content, senderId );
		
		content = fields.attackMaster;
		if (flags.canChange2Weaps) {
    		content += ' --twoswords ' + tokenID;
    		if (initMenu == MenuType.TWOWEAPONS && fighterClass.toLowerCase() != 'ranger') {
    			content += '|2';
    			setAttr( charCS, 'weapno', 'max', 2 );
    		} else {
    			content += '|0';
    			setAttr( charCS, 'weapno', 'max', 0 );
    		}
		}
		
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
	
// ---------------------------------- build menus to display --------------------------------------------------------	

	/**
	* Select a menu to build
	**/
	
	var buildMenu = function( initMenu, charCS, sheetTypes, selected, args ) {
	
		var content = '';
		
		switch (initMenu) {
		
		case MenuType.SIMPLE :
				makeMonsterMenu( Monster.SIMPLE, charCS, sheetTypes, selected, args );
				break;
				
		case MenuType.COMPLEX :
				makeMonsterMenu( Monster.COMPLEX, charCS, sheetTypes, selected,args );
				break;
				
			case MenuType.WEAPON :
				makeWeaponMenu( charCS, sheetTypes, selected, args );
				break;
			
			case MenuType.MW_MELEE :
				args[3] = args[8];
				makePrimeWeaponMenu( charCS, sheetTypes, selected, args );
				break;
				
            case MenuType.MW_PRIME :
			case MenuType.MW_SECOND :
				args[3] = args[8];
				makeSecondWeaponMenu( charCS, sheetTypes, selected, args );
				break;
			
			case MenuType.TWOWEAPONS :
				makeSecondWeaponMenu( charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.MUSPELL :
				makeSpellMenu( Caster.WIZARD, charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.PRSPELL :
				makeSpellMenu( Caster.PRIEST, charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.POWER :
				makePowersMenu( charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.MIBAG :
				makeMIBagMenu( charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.THIEF :
				makeThiefMenu( charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.OTHER :
				makeOtherMenu( charCS, sheetTypes, selected, args );
				break;
				
			case MenuType.MENU :
				makeInitMenu( charCS, sheetTypes, CharSheet.CHARACTER, args );
				break;
				
			case MenuType.MONSTER_MENU :
				makeInitMenu( charCS, sheetTypes, CharSheet.MONSTER, args );
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

	var MIandPowers = function( tokenID, sheetTypes, submitted ) {
		var content = '\n**Magic Items & Powers**\n';
			
		content += (submitted ? '<span style=' + design.grey_button + '>' : '[') + 'Use a Magic Item' + (submitted ? '</span>' : '](!init --mibag ' + tokenID + ')');
		content += (submitted ? '<span style=' + design.grey_button + '>' : '[') + 'Use Powers' + (submitted ? '</span>' : '](!init --power ' + tokenID + ')');
		return content;
	};

	/**
	 * Add Other Actions to any menu
	 **/

	var otherActions = function( initMenu, tokenID, sheetTypes, charButton, submitted ) {
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
    * Create the Complex Monster Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeMonsterMenu = function(complex,charCS,sheetTypes,submitted,args) {

        var tokenID = args[1],
			charButton = args[2],
			ammoPointer = '',
			weapName = '',
			tokenName,
            content,
			w, rowCount, ammoRowAdjust;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Complex Monster Attacks}}'
				+ '{{desc=**Innate weapons**\n';
				
		// add a button for innate monster attack abilities using the monster initiative modifier
		
		content += (0 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
		content += 'Monster Attack';
		content += (((0 == charButton) || submitted) ? '</span>' : '](!init --button ' + (complex ? BT.MON_INNATE : BT.MON_ATTACK) + '|' + tokenID + '|0|-1)');

		if (complex) {

			// build the Melee Weapon list
			
			content += '\n**Melee Weapons**\n';
			
            rowCount = sheetTypes.sheetType;
			if (fields.MWfirstRowNamed) {
			    rowCount--;
				content += (1 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += attrLookup( charCS, fields.MW_name[0], fields.MW_name[1]);
				content += (((1 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_MELEE + '|' + tokenID + '|1|-1)');
			}
				
			for (let i = 0; i < rowCount; i++) {
				w = 3 + (i * 2);
				content += (w == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += attrLookup( charCS, fields.MW_table[0] + '_$' + i + '_' + fields.MW_name[0], fields.MW_name[1]);
				content += (((w == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_MELEE + '|' + tokenID + '|' + w + '|' + i + ')');
			};
			
			content += '\n**Ranged weapons x ammo**\n';

			// build the character Ranged Weapons list
			
            rowCount = sheetTypes.sheetType;
            ammoRowAdjust = 1;
			if (fields.RWfirstRowNamed) {
			    rowCount--;
			    ammoRowAdjust++;
				content += (2 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += attrLookup( charCS, fields.RW_name[0], fields.RW_name[1]);
				ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + '1-', fields.Ammo_indirect[1]);
				content += ' x ' + attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1]);
				content += (((2 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_RANGED + '|' + tokenID + '|2|-1)');
			}

			for (let i = 0; i < rowCount; i++) {
				w = 4 + (i * 2);
				content += (w == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += attrLookup( charCS, fields.RW_table[0] + '_$' + i + '_' + fields.RW_name[0], fields.RW_name[1]);
				ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + (i+ammoRowAdjust) + '-', fields.Ammo_indirect[1]);
				content += ' x ' + attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1]);
				content += (((w == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_RANGED + '|' + tokenID + '|' + w + '|' + i + ')');
			};
		
			content += MIandPowers( tokenID, sheetTypes, submitted );

		}
		content	+= '}}'
				+ '{{desc1=' + otherActions( (complex ? MenuType.COMPLEX : MenuType.SIMPLE), tokenID, sheetTypes, charButton, submitted ) + '}}'
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

	var makeWeaponMenu = function(charCS,sheetTypes,submitted,args) {

        var tokenID = args[1],
			charButton = args[2],
            curToken = getObj( 'graphic', tokenID ),
			ammoPointer = '',
			ammoQty,
			weapName = '',
			tokenName,
			fighterLevel, rogueLevel,
            content,
			w, rowCount, ammoRowAdjust;

        if (!curToken) {
            sendDebug( 'makeWeaponMenu: invalid tokenID' );
            sendError( 'Invalid initMaster argument' );
            return;
        }
            
		tokenName = curToken.get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Weapon Attacks}}';
				
		fighterLevel = parseInt(attrLookup( charCS, fields.Fighter_level[0], fields.Fighter_level[1] ) || '0');
		rogueLevel = parseInt(attrLookup( charCS, fields.Rogue_level[0], fields.Rogue_level[1] ) || '0');
		if (fighterLevel || rogueLevel) {
		    content += '{{Fighter\'s & Rogue\'s Option=';
			content += submitted ? '<span style=' + design.grey_button + '>' : '[';
			content += 'Two Weapons';
			content += (submitted) ? '</span>' : '](!init --button ' + BT.TWOWEAPONS + '|' + tokenID + '|' + (!!(charButton%2) ? charButton : -1) + '|-1|' + ((charButton-3)/2) + '|-1)';
			content += '}}';
		}
				
		content += '{{desc=**Melee weapons**\n';
		// build the Melee Weapon list
		
        rowCount = sheetTypes.sheetType;
		if (fields.MWfirstRowNamed) {
		    rowCount--;
			content += (1 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, fields.MW_name[0], fields.MW_name[1]);
			content += (((1 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MELEE + '|' + tokenID + '|1|-1)');
		}
			
		for (let i = 0; i < rowCount; i++) {
			w = 3 + (i * 2);
			content += (w == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, fields.MW_table[0] + '_$' + i + '_' + fields.MW_name[0], fields.MW_name[1]);
			content += (((w == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MELEE + '|' + tokenID + '|' + w + '|' + i + ')');
		};
		
		content += '\n**Ranged weapons x ammo**\n';

		// build the character Ranged Weapons list
		
        rowCount = sheetTypes.sheetType;
        ammoRowAdjust = 1;
		if (fields.RWfirstRowNamed) {
		    rowCount--;
		    ammoRowAdjust++;
			content += (2 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, fields.RW_name[0], fields.RW_name[1]);
			ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + '1-', fields.Ammo_indirect[1]);
			if ((ammoQty = attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1])) > 0) {
				content += ' x ' + ammoQty;
			}
			content += (((2 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.RANGED + '|' + tokenID + '|2|-1)');
		}

		for (let i = 0; i < rowCount; i++) {
			w = 4 + (i * 2);
			content += (w == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, fields.RW_table[0] + '_$' + i + '_' + fields.RW_name[0], fields.RW_name[1]);
			ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + (i+ammoRowAdjust) + '-', fields.Ammo_indirect[1]);
			if ((ammoQty = attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1])) > 0) {
				content += ' x ' + ammoQty;
			}
			content += (((w == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.RANGED + '|' + tokenID + '|' + w + '|' + i + ')');
		};

		content += MIandPowers( tokenID, sheetTypes, submitted ) + '}}'
				+ '{{desc1=' + otherActions( MenuType.WEAPON, tokenID, sheetTypes, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.WEAPON + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Weapon Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makePrimeWeaponMenu = function(charCS,sheetTypes,submitted,args) {

        var tokenID = args[1],
			ammoPointer = '',
			ammoQty,
			ammoRowAdjust,
			weapName = '',
			tokenName,
			twoHanded,
            content,
			w, rowCount;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Two Weapon Attacks}}'
				+ '{{desc=**Choose Secondary Weapon**\n';
				
		content += '[One Weapon](!init --button ' + BT.ONEWEAPON + '|' + tokenID + '|-1|-1)}}';
				
		content += '{{desc1=**Melee weapons**\n';
		// build the Melee Weapon list
		
        rowCount = sheetTypes.sheetType;
		if (fields.MWfirstRowNamed) {
		    rowCount--;
			twoHanded = parseInt(attrLookup( charCS, fields.MW_twoHanded[0], fields.MW_twoHanded[1] ) || 0);
			if (!twoHanded) {
				content += '[' + (attrLookup( charCS, fields.MW_name[0], fields.MW_name[1]) || '-')
						+ '](!init --button ' + BT.MW_PRIME + '|' + tokenID + '|1|-1|-1|-1)';
			}
		}
			
		for (let i = 0; i < rowCount; i++) {
			w = 3 + (i * 2);
			twoHanded = parseInt(attrLookup( charCS, fields.MW_table[0] + '_$' + i + '_' + fields.MW_twoHanded[0], fields.MW_twoHanded[1] ) || 0);
			if (!twoHanded) {
				content += '[' + (attrLookup( charCS, fields.MW_table[0] + '_$' + i + '_' + fields.MW_name[0], fields.MW_name[1]) || '-') 
						+ '](!init --button ' + BT.MW_PRIME + '|' + tokenID + '|' + w + '|-1|' + i + '|-1)';
			}
		};
		
		content += '\n**Ranged weapons x ammo**\n';

		// build the character Ranged Weapons list
		
        rowCount = sheetTypes.sheetType;
        ammoRowAdjust = 1;
		if (fields.RWfirstRowNamed) {
		    rowCount--;
		    ammoRowAdjust++;
			twoHanded = parseInt(attrLookup( charCS, fields.RW_twoHanded[0], fields.RW_twoHanded[1] ) || 1);
			if (!twoHanded) {
				content += '[' + attrLookup( charCS, fields.RW_name[0], fields.RW_name[1]);
				ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + '1-', fields.Ammo_indirect[1]);
				if ((ammoQty = attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1])) > 0) {
					content += ' x ' + ammoQty;
				}
				content += '](!init --button ' + BT.MW_PRIME + '|' + tokenID + '|2|-1|-1|-1)';
			}
		}

		for (let i = 0; i < rowCount; i++) {
			w = 4 + (i * 2);
			twoHanded = parseInt(attrLookup( charCS, fields.RW_table[0] + '_$' + i + '_' + fields.RW_twoHanded[0], fields.RW_twoHanded[1]) || 1);
			if (!twoHanded) {
				content += '[' + attrLookup( charCS, fields.RW_table[0] + '_$' + i + '_' + fields.RW_name[0], fields.RW_name[1]);
				ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + (i+ammoRowAdjust) + '-', fields.Ammo_indirect[1]);
				if ((ammoQty = attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1])) > 0) {
					content += ' x ' + ammoQty;
				}
				content += '](!init --button ' + BT.MW_PRIME + '|' + tokenID + '|' + w + '|-1|' + i + '|-1)';
			}
		};
		content += '}}{{desc2=Select two weapons above, then '
				+ '<span style=' + design.grey_button + '>Submit</span>}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Weapon Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeSecondWeaponMenu = function(charCS,sheetTypes,submitted,args) {

        var menu = args[0],
			tokenID = args[1],
			charButton = args[2],
			charButton2 = args[3],
			ammoPointer = '',
			ammoQty,
			ammoRowAdjust,
			weapName = '',
			twoHanded,
			tokenName,
			handler,
			highlight,
            content,
			w, rowCount;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		handler = BT.MW_SECOND;
		
		content = '&{template:2Edefault}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Two Weapon Attacks}}'
				+ '{{desc=**Choose '+(charButton2>0 ? 'New ' : '')+'<span style='+design.green_button+'>Primary Weapon**</span>\n'
				+ 'Change by reselecting\n'
				+ 'Or go back to ';
				
		content += submitted ? '<span style=' + design.grey_button + '>' : '[';
		content += 'One Weapon';
		content += submitted ? '</span>' : '](!init --button ' + BT.ONEWEAPON + '|' + tokenID + '|'+ charButton + '|-1|-1)';
		content += '}}';
				
		content += '{{desc1=**1H Melee weapons**\n';
		// build the Melee Weapon list
		
        rowCount = sheetTypes.sheetType;
		if (fields.MWfirstRowNamed) {
		    rowCount--;
			twoHanded = parseInt(attrLookup( charCS, fields.MW_twoHanded[0], fields.MW_twoHanded[1] ) || 0);
			if (!twoHanded) {
				highlight = (charButton == 1) ? design.green_button : design.selected_button;
				content += (!submitted) ? '[' : '';
				content += ((1 == charButton || 1 == charButton2) ? ('<span style=' + highlight + '>') : (submitted ? '<span style=' + design.grey_button + '>' : ''));
				content += attrLookup( charCS, fields.MW_name[0], fields.MW_name[1]);
        		content += (1 == charButton || 1 == charButton2  || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + handler + '|' + tokenID + '|' + charButton + '|1|' + ((charButton-3)/2) + '|-1)') : '';
			}
		}
			
		for (let i = 0; i < rowCount; i++) {
			w = 3 + (i * 2);
			twoHanded = parseInt(attrLookup( charCS, fields.MW_table[0] + '_$' + i + '_' + fields.MW_twoHanded[0], fields.MW_twoHanded[1] ) || 0);
			if (!twoHanded) {
				highlight = (charButton == w) ? design.green_button : design.selected_button;
				content += (!submitted) ? '[' : '';
				content += ((w == charButton || w == charButton2) ? ('<span style=' + highlight + '>') : (submitted ? '<span style=' + design.grey_button + '>' : ''));
				content += attrLookup( charCS, fields.MW_table[0] + '_$' + i + '_' + fields.MW_name[0], fields.MW_name[1]);
				content += (w == charButton || w == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + handler + '|' + tokenID + '|' + charButton + '|' + w + '|' + ((charButton-3)/2) + '|' + i + ')') : '';
			}
		}

		content += '\n**1H Ranged weapons x ammo**\n';

		// build the character Ranged Weapons list
		
        rowCount = sheetTypes.sheetType;
        ammoRowAdjust = 1;
		if (fields.RWfirstRowNamed) {
		    rowCount--;
		    ammoRowAdjust++;
			twoHanded = parseInt(attrLookup( charCS, fields.RW_twoHanded[0], fields.RW_twoHanded[1] ) || 1);
			if (!twoHanded) {
				highlight = (charButton == 2) ? design.green_button : design.selected_button;
				content += (!submitted) ? '[' : '';
				content += ((2 == charButton || 2 == charButton2) ? '<span style=' + highlight + '>' : (submitted ? '<span style=' + design.grey_button + '>' : ''));
				content += attrLookup( charCS, fields.RW_name[0], fields.RW_name[1]);
				ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + '1-', fields.Ammo_indirect[1]);
				if ((ammoQty = attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1])) > 0) {
					content += ' x ' + ammoQty;
				}
				content += (2 == charButton || 2 == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + handler + '|' + tokenID + '|' + charButton + '|2|' + ((charButton-3)/2) + '|-1)') : '';
			}
		}

		for (let i = 0; i < rowCount; i++) {
			w = 4 + (i * 2);
			twoHanded = parseInt(attrLookup( charCS, fields.RW_table[0] + '_$' + i + '_' + fields.RW_twoHanded[0], fields.RW_twoHanded[1]) || 1);
			if (!twoHanded) {
				highlight = (charButton == w) ? design.green_button : design.selected_button;
				content += (!submitted) ? '[' : '';
				content += ((w == charButton || w == charButton2) ? ('<span style=' + highlight + '>') : (submitted ? '<span style=' + design.grey_button + '>' : ''));
				content += attrLookup( charCS, fields.RW_table[0] + '_$' + i + '_' + fields.RW_name[0], fields.RW_name[1]);
				ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + (i+ammoRowAdjust) + '-', fields.Ammo_indirect[1]);
				if ((ammoQty = attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1])) > 0) {
					content += ' x ' + ammoQty;
				}
				content += (w == charButton || w == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + handler + '|' + tokenID + '|' + charButton + '|' + w + '|' + ((charButton-3)/2) + '|' + i + ')') : '';
			}
		};
		
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

	var makeSpellMenu = function( spellCasterType, charCS, sheetTypes, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			spellName = '',
			isMU,
			sheetType,
            content,
            tokenName,
			firstCol,
			repSpellField,
			levelRows = [],
			l, w, r, c,
			buttonID = 0;
            
		isMU = (spellCasterType == Caster.WIZARD);

		if (sheetTypes.sheetFlags && (isMU ? sheetTypes.sheetMUType == 0 : sheetTypes.sheetPRType == 0)) {
			sendParsedMsg( 'initMaster', (isMU ? Init_Messages.noMUspellbook : Init_Messages.noPRspellbook), tokenID );
			return;
		}
		
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What Spell is ' + tokenName + ' planning to cast?}}'
				+ '{{subtitle=Initiative for L1-L4 ' + spellCasterType + ' spells}}'
				+ '{{desc=';

		// set up the shape of the spell book.  This is complicated due to
		// the 2E sheet L5 MU Spells start out-of-sequence at column 70
		
		sheetType = (isMU ? sheetTypes.sheetMUType : sheetTypes.sheetPRType );

		if (!sheetTypes.sheetFlags || sheetType == 6) {
			levelRows[1] = { rows: 4, base: (isMU ? 1 : 28) };
			levelRows[2] = { rows: 3, base: (isMU ? 4 : 31) };
			levelRows[3] = { rows: 2, base: (isMU ? 7 : 34) };
			levelRows[4] = { rows: 2, base: (isMU ? 10 : 37) };
		} else if (sheetTypes.sheetFlags && sheetType == 12) {
			levelRows[1] = { rows: (isMU ? 4 : 4), base: (isMU ? 1 : 28) };
			levelRows[2] = { rows: (isMU ? 3 : 4), base: (isMU ? 4 : 31) };
			levelRows[3] = { rows: (isMU ? 3 : 4), base: (isMU ? 7 : 34) };
			levelRows[4] = { rows: (isMU ? 3 : 4), base: (isMU ? 10 : 37) };
			levelRows[5] = { rows: (isMU ? 3 : 3), base: (isMU ? 70 : 40) };
			levelRows[6] = { rows: (isMU ? 3 : 2), base: (isMU ? 13 : 43) };
			levelRows[7] = { rows: (isMU ? 2 : 2), base: (isMU ? 16 : 46) };
			if (isMU) {
				levelRows[8] = { rows: 2, base: 19 };
				levelRows[9] = { rows: 2, base: 22 };
			}
		}
			
		// build the Spell list
		
		for (l = 1; l < (isMU ? 9 : 7); l++) {
			if (levelRows[l]) {
				content += '\n**Level ' + l + ' Spells**\n';
				for (r = 0; r < levelRows[l].rows; r++) {
					c = levelRows[l].base;
					for (w = 1; w <= fields.SpellsCols; w++) {
						firstCol = (fields.SpellsFirstColNum || l != 1 || c != 1);
						repSpellField = fields.Spells_table[0] + ( firstCol ? c : '' ) + '_$' + r + '_' + fields.Spells_name[0] + ( firstCol ? c : '' );
						content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
						content += attrLookup( charCS, repSpellField , fields.Spells_name[1]);
						content += (((buttonID == charButton) || submitted) ? '</span>' : '](!init --button ' + (isMU ? BT.MU_SPELL : BT.PR_SPELL) + '|' + tokenID + '|' + buttonID + '|' + r + '|' + c + ')');
						buttonID++;
						c++;
					}
				}
			}
		}

		content += MIandPowers( tokenID, sheetTypes, submitted ) + '}}'
				+ '{{desc1=' + otherActions( (isMU ? MenuType.MUSPELL : MenuType.PRSPELL), tokenID, sheetTypes, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + (isMU ? MenuType.MUSPELL : MenuType.PRSPELL) + ')')
				+ '}}';
				
		sendResponse( charCS, content );
		return;
	};

    /*
    * Create the Magic Item Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeMIBagMenu = function( charCS, sheetTypes, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			sheetType,
			tokenName,
            content,
			rowNum,
			itemRows = 0,
			repItemField,
			r,
			buttonID = 0;
            
		sheetType = sheetTypes.sheetMIBagType;

		if (sheetTypes.sheetFlags && sheetType == 0) {
			sendParsedMsg( 'initMaster', Init_Messages.noMIBag, tokenID );
			return;
		}
		
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What Magic Item is ' + tokenName + ' planning to use?}}'
				+ '{{subtitle=All ' + tokenName + '\'s Magic Items}}'
				+ '{{desc=';

		// set up the shape of the MI Bag.
		
		if (!sheetTypes.sheetFlags || sheetType == 12) {
			itemRows = 24;
		} else if (sheetType == 6) {
			itemRows = 12;
		}
			
		// build the Magic Item list
		
		if (fields.MIFirstRowNum) {
			repItemField = fields.MI_name[0];
			content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, repItemField , fields.MI_name[1]);
			content += (((buttonID == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MI_BAG + '|' + tokenID + '|' + buttonID + '|' + r + ')');
			buttonID++;
			itemRows--;
		}
		
		for (r = 0; r < itemRows; r++) {
			repItemField = fields.MI_table[0] + '_$' + r + '_' + fields.MI_name[0];
			content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, repItemField , fields.MI_name[1]);
			content += (((buttonID == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MI_BAG + '|' + tokenID + '|' + buttonID + '|' + r + ')');
			buttonID++;
		}

		content += '}}{{desc1=' + otherActions( MenuType.MIBAG, tokenID, sheetTypes, charButton, submitted ) + '}}'
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

	var makePowersMenu = function( charCS, sheetTypes, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			spellName = '',
			sheetType,
			tokenName,
            content,
			colNum,
			powerRows = 0,
			repSpellField,
			levelRows = [],
			l, w, r, c,
			buttonID = 0;
            
		sheetType = sheetTypes.sheetPowersType;

		if (sheetTypes.sheetFlags && sheetType == 0) {
			sendParsedMsg( 'initMaster', Init_Messages.noPowers, tokenID );
			return;
		}
		
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:2Edefault}{{name=What Power is ' + tokenName + ' planning to use?}}'
				+ '{{subtitle=All available Powers}}'
				+ '{{desc=';

		// set up the shape of the powers book.
		
		if (!sheetTypes.sheetFlags || sheetType == 6) {
			powerRows = 3;
		} else if (sheetType == 12) {
			powerRows = 9;
		}
			
		// build the Powers list
		
		for (r = 0; r < powerRows; r++) {
			c = fields.PowersBaseCol;
			for (w = 1; w <= fields.PowersCols; w++) {
				colNum = (fields.PowersFirstColNum || c != 1);
				repSpellField = fields.Powers_table[0] + ( colNum ? c : '' ) + '_$' + r + '_' + fields.Powers_name[0] + ( colNum ? c : '' );
				content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += attrLookup( charCS, repSpellField , fields.Powers_name[1]);
				content += (((buttonID == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.POWER + '|' + tokenID + '|' + buttonID + '|' + r + '|' + c + ')');
				buttonID++;
				c++;
			}
		}

		content += '}}{{desc1=' + otherActions( MenuType.POWER, tokenID, sheetTypes, charButton, submitted ) + '}}'
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

	var makeThiefMenu = function( charCS, sheetTypes, submitted, args ) {

        var tokenID = args[1],
			charButton = args[2],
			content = '',
			sheetType,
			tokenName,
			armourType,
			armourMod,
			ability = [];
            
		sheetType = sheetTypes.sheetThiefType;

		if (sheetTypes.sheetFlags && sheetType == 0) {
			sendParsedMsg( 'initMaster', Init_Messages.notThief, tokenID );
		}
		
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		// find armour type
		
		armourType = (attrLookup( charCS, fields.Armor_name[0], fields.Armor_name[1] ) || 'leather' ).toLowerCase();
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
		ability[0] = {name:'Picking Pockets',skill: Math.max((attrLookup( charCS, fields.Pick_Pockets[0]+armourMod, fields.Pick_Pockets[1] ) || 0), 5 ), speed: '0' };
		ability[1] = {name: 'Opening Locks', skill: Math.max((attrLookup( charCS, fields.Open_Locks[0]+armourMod, fields.Open_Locks[1] ) || 0), 5 ), speed: '1d8'};
		ability[2] = {name: 'Finding Traps', skill: Math.max((attrLookup( charCS, fields.Find_Traps[0]+armourMod, fields.Find_Traps[1] ) || 0), 5 ), speed: '1d100'};
		ability[3] = {name: 'Moving Silently', skill: Math.max((attrLookup( charCS, fields.Move_Silently[0]+armourMod, fields.Move_Silently[1] ) || 0), 5 ), speed: '0' };
		ability[4] = {name: 'Hiding in Shadows', skill: Math.max((attrLookup( charCS, fields.Hide_in_Shadows[0]+armourMod, fields.Hide_in_Shadows[1] ) || 0), 5 ), speed: '0'};
		ability[5] = {name: 'Detecting Noise', skill: Math.max((attrLookup( charCS, fields.Detect_Noise[0]+armourMod, fields.Detect_Noise[1] ) || 0), 5 ), speed: '1d6'};
		ability[6] = {name: 'Climbing Walls', skill: Math.max((attrLookup( charCS, fields.Climb_Walls[0]+armourMod, fields.Climb_Walls[1] ) || 0), 5 ), speed: '1d10'};
		ability[7] = {name: 'Reading Languages', skill: Math.max((attrLookup( charCS, fields.Read_Languages[0]+armourMod, fields.Read_Languages[1] ) || 0), 5 ), speed: '1d100'};
		ability[8] = {name: 'Remembering Legends', skill: Math.max((attrLookup( charCS, fields.Legend_Lore[0]+armourMod, fields.Legend_Lore[1] ) || 0), 5 ), speed: '1d100'};

		// build the thieving skills list
		
		content = '&{template:2Edefault}{{name=What Thieving ability is ' + tokenName + ' planning to use?}}'
				+ '{{subtitle=' + tokenName + '\'s thieving abilities}}'
				+ '{{desc=';
				
		for (let i=0; i<8; i++) {
			content += (i == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += ability[i].name + '(' + ability[i].skill + '%)';
			content += (((i == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.THIEF + '|' + tokenID + '|' + i + '|' + ability[i].name + ' ' + ability[i].skill + '%|' + ability[i].speed + ')');
		}
		
		content += '}}{{desc1=' + otherActions( MenuType.THIEF, tokenID, sheetTypes, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.THIEF + ')')
				+ '}}';

		sendResponse( charCS, content );
		return;

	};

	var makeInitMenu = function( charCS, sheetTypes, monster, args ) {
		
		var tokenID = args[1],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
		    fighter,
		    wizard,
		    priest,
		    rogue,
		    content = '&{template:2Edefault}{{name=What does ' + tokenName + ' want to do?}}'
					+ '{{subtitle=' + tokenName + '\'s possible activities}}'
					+ '{{desc=';
		
		fighter = attrLookup( charCS, fields.Fighter_level[0], fields.Fighter_level[1] );
		wizard = attrLookup( charCS, fields.Wizard_level[0], fields.Wizard_level[1] );
		priest = attrLookup( charCS, fields.Priest_level[0], fields.Priest_level[1] );
		rogue = attrLookup( charCS, fields.Rogue_level[0], fields.Rogue_level[1] );
					
		if (sheetTypes.sheetType) {
			content += '[Attack](!init ' + (monster == CharSheet.MONSTER ? '--complex ' : '--weapon ') + tokenID + ')';
		}
		if (sheetTypes.sheetMUType && wizard) {
			content += '[Cast MU Spell](!init --muspell ' + tokenID + ')';
		}
		if (sheetTypes.sheetPRType && priest) {
			content += '[Cast PR Spell](!init --prspell ' + tokenID + ')';
		}
		if (sheetTypes.sheetPowersType) {
			content += '[Use Power](!init --power ' + tokenID + ')';
		}
		if (sheetTypes.sheetMIBagType) {
			content += '[Use Magic Item](!init --mibag ' + tokenID + ')';
		}
		if (sheetTypes.sheetThiefType) {
			content += '[Use Thieving Skills](!init --thief ' + tokenID + ')';
		}
		content += '[Other Actions](!init --other ' + tokenID + ')}}';
		
		sendResponse( charCS, content );
		return;
	}
	
	var makeOtherMenu = function( charCS, sheetTypes, submitted, args ) {
	
		var tokenID = args[1],
			charButton = args[2],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
		    content = '&{template:2Edefault}{{name=What does ' + tokenName + ' want to do?}}'
					+ '{{subtitle=' + tokenName + '\'s possible activities}}'
					+ '{{desc='+ otherActions( MenuType.OTHER, tokenID, sheetTypes, charButton, submitted ) + '}}'
					+ '{{desc1=Select action above, then '
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
		
		args = args.split('|');
		var tokenID = args[0],
			charCS = getCharacter( tokenID ),
			weapTable,
			profTable,
			dmgTable,
			i;

		if (!charCS) {
			sendDebug('doDispWeaps: Invalid token ID passed');
			sendError('Invalid initMaster initialisation request');
			return;
		}
		
		var sheetTypes = getSheetTypes( charCS ),
		    charName = charCS.get('name'),
			content = '&{template:2Edefault}{{name=Weapons check for '+charName+'}}{{desc=Melee Weapons\n'
					+ '<table>'
					+ '<tr><td>St</td><td>2H</td><td>Weapon</td><td>Prof</td><td>#Att</td><td>Adj</td><td>Spd</td><td>Crit</td><td>Sp</td><td>M</td><td>CW</td><td>DSt</td><td>Dweap</td><td>DSp</td><td>DAdj</td><td>SM</td><td>L</td></tr>';
			

		if (fields.MWfirstRowNamed) {
			content += '<tr>'
					+ '<td>'+attrLookup( charCS, fields.MW_strBonus[0], fields.MW_strBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_twoHanded[0], fields.MW_twoHanded[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_name[0], fields.MW_name[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_profLevel[0], fields.MW_profLevel[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_noAttks[0], fields.MW_noAttks[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_attkAdj[0], fields.MW_attkAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_speed[0], fields.MW_speed[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_crit[0], fields.MW_crit[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_specialist[0], fields.WP_specialist[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_mastery[0], fields.WP_mastery[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.WP_backstab[0], fields.WP_backstab[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgStrBonus[0], fields.MW_dmgStrBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgName[0], fields.MW_dmgName[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgSpecialist[0], fields.MW_dmgSpecialist[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgAdj[0], fields.MW_dmgAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgSM[0], fields.MW_dmgSM[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.MW_dmgL[0], fields.MW_dmgL[1] ) + '</tr>';
		}
		
		for (i=0; i<(sheetTypes.sheetType-1); i++) {
			weapTable = fields.MW_table[0] + '_$' + i + '_';
			profTable = fields.WP_table[0] + '_$' + (1+(i*2)) + '_';
			dmgTable = fields.MW_dmgTable[0] + '_$' + i + '_';
			content += '<td>'+attrLookup( charCS, weapTable + fields.MW_strBonus[0], fields.MW_strBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_twoHanded[0], fields.MW_twoHanded[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_name[0], fields.MW_name[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_profLevel[0], fields.MW_profLevel[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_noAttks[0], fields.MW_noAttks[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_attkAdj[0], fields.MW_attkAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_speed[0], fields.MW_speed[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.MW_crit[0], fields.MW_crit[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_specialist[0], fields.WP_specialist[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_mastery[0], fields.WP_mastery[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_backstab[0], fields.WP_backstab[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.MW_dmgStrBonus[0], fields.MW_dmgStrBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.MW_dmgName[0], fields.MW_dmgName[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.MW_dmgSpecialist[0], fields.MW_dmgSpecialist[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.MW_dmgAdj[0], fields.MW_dmgAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.MW_dmgSM[0], fields.MW_dmgSM[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.MW_dmgL[0], fields.MW_dmgL[1] ) + '</tr>';
		}
		content += '</table>}}{{desc1=Ranged weapons\n'
				+ '<table>'
					+ '<tr><td>St</td><td>Dx</td><td>2H</td><td>Weapon</td><td>Prof</td><td>#Att</td><td>Adj</td><td>Spd</td><td>Crit</td><td>Sp</td><td>M</td><td>CW</td><td>DSt</td><td>Dweap</td><td>DAdj</td><td>SM</td><td>L</td><td>Qty</td></tr>';
		if (fields.RWfirstRowNamed) {
			profTable = fields.WP_table[0] + '_$0_';
			content += '<td>'+attrLookup( charCS, fields.RW_strBonus[0], fields.RW_strBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_dexBonus[0], fields.RW_dexBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_twoHanded[0], fields.RW_twoHanded[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_name[0], fields.RW_name[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_profLevel[0], fields.RW_profLevel[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_noAttks[0], fields.RW_noAttks[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_attkAdj[0], fields.RW_attkAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_speed[0], fields.RW_speed[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.RW_crit[0], fields.RW_crit[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_specialist[0], fields.WP_specialist[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_mastery[0], fields.WP_mastery[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_backstab[0], fields.WP_backstab[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_strBonus[0], fields.Ammo_strBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_name[0], fields.Ammo_name[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_dmgAdj[0], fields.Ammo_dmgAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_dmgSM[0], fields.Ammo_dmgSM[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_dmgL[0], fields.Ammo_dmgL[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, fields.Ammo_qty[0], fields.Ammo_qty[1] ) + '</tr>';
		}
		
		for (i=0; i<(sheetTypes.sheetType-1); i++) {
			weapTable = fields.RW_table[0] + '_$' + i + '_';
			profTable = fields.WP_table[0] + '_$' + (2+(i*2)) + '_';
			dmgTable = fields.Ammo_table[0] + '_$' + i + '_';
			content += '<td>'+attrLookup( charCS, weapTable + fields.RW_strBonus[0], fields.RW_strBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_dexBonus[0], fields.RW_dexBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_twoHanded[0], fields.RW_twoHanded[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_name[0], fields.RW_name[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_profLevel[0], fields.RW_profLevel[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_noAttks[0], fields.RW_noAttks[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_attkAdj[0], fields.RW_attkAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_speed[0], fields.RW_speed[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, weapTable + fields.RW_crit[0], fields.RW_crit[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_specialist[0], fields.WP_specialist[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_mastery[0], fields.WP_mastery[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, profTable + fields.WP_backstab[0], fields.WP_backstab[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.Ammo_strBonus[0], fields.Ammo_strBonus[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.Ammo_name[0], fields.Ammo_name[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.Ammo_dmgAdj[0], fields.Ammo_dmgAdj[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.Ammo_dmgSM[0], fields.Ammo_dmgSM[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.Ammo_dmgL[0], fields.Ammo_dmgL[1] ) + '</td>'
					+ '<td>'+attrLookup( charCS, dmgTable + fields.Ammo_qty[0], fields.Ammo_qty[1] ) + '</tr>';
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
            
        args = args.split('|');
        
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
        prevRoundObj = attrLookup( charCS, 'prev-round'+tokenID, null, true );
        
        if (!prevRoundObj) {
            sendDebug('doRedo: prev-round'+tokenID+' not defined');
            sendError( 'Invalid initMaster redo request' );
            return;
        }

        prevRoundObj.set( 'current', 0 );
        
        tidyCmd = '!tj --removefromtracker ' + tokenName + '|' + tokenID + '|0';
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
        
        args = args.split('|');
        
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

		var init_speed = (attrLookup( charCS, 'init-carry_speed', 'current' ) || 0),
			init_action = (attrLookup( charCS, 'init-carry_action', 'current' ) || 'doing nothing'),
			init_actionnum = (attrLookup( charCS, 'init-carry_actionnum', 'current' ) || 1),
			weapno = (attrLookup( charCS, 'init-carry_weapno', 'current' ) || 0),
			init_preinit = (attrLookup( charCS, 'init-carry_preinit', 'current' ) || 0),
			changedRound = state.initMaster.changedRound,
			round = state.initMaster.round,
			prevRound = (attrLookup( charCS, 'prev-round'+tokenID, 'current', true ) || 0),
			init_submitVal = (changedRound || (prevRound != round) ? 1 : 0 ),
			content;
		
		setAttr( charCS, 'init_speed', 'current', init_speed );
		setAttr( charCS, 'init_action', 'current', init_action );
		setAttr( charCS, 'init_actionnum', 'current', init_actionnum );
		setAttr( charCS, 'weapno', 'current', weapno );
		setAttr( charCS, 'init_preinit', 'current', init_preinit );
		setAttr( charCS, 'init_submitVal', 'current', init_submitVal );
		setAttr( charCS, 'init_chosen', 'current', 1 );
		setAttr( charCS, 'init-done', 'current', 0 );

		content = '&{template:2Edefault}'
				+ '{{name=What is ' + getObj( 'graphic', tokenID ).get('name') + ' doing?}}'
				+ '{{subtitle=Continue Long Action}}'
				+ '{{desc=Continue ' + init_action + ' for '
				+ '<span style=' + fields.boxed_number + '>' + Math.ceil(init_speed/10) + '</span>'
				+ ' more rounds or do something else?}}'
				+ '{{desc1=[Continue](!init --button ' + BT.SUBMIT + '|' + tokenID + '|-1|' + MenuType.CARRY + ')'
				+ ' [Something Else](!init --button ' + BT.CARRY + '|' + tokenID + '|-1|' + initMenu + ')}}';
				
		sendResponse( charCS, content );
			
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
		args = args.split('|');
		if (args.length < 8) {
			sendDebug('doBuildMenu: Invalid number of arguments');
			sendError('Invalid initMaster syntax');
			return;
		};
		var menu = args[0],
			tokenID = args[1],
			charCS,
			sheetTypes;
			
		if (!(charCS = getCharacter( tokenID ))) {
			sendDebug( 'doBuildMenu: invalid character' );
			sendError( 'Invalid initMaster attributes' );
			return;
		}
		sheetTypes = getSheetTypes( charCS );
		
//		setInitVars( charCS, args, (menu == MenuType.MW_SECOND ? 'max' : 'current') );
		setInitVars( charCS, args, 'current');
		buildMenu( menu, charCS, sheetTypes, MenuState.ENABLED, args );
		return;
	}

	/*
	* Function to display the menu for doing initiative.
	*/

	var doInitMenu = function( args, initMenu ) {
		if (!args || !initMenu)
			{return;}

		args = args.split('|');

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
		
		init_carry = parseInt(attrLookup( charCS, 'init-carry', 'current' ));
		if (init_carry !== 0) {
			doCarryOver( tokenID, charCS, initMenu );
			return;
		}

		var content = '',
		    charName = charCS.get('name'),
			tokenName = curToken.get('name'),
			changedRound = state.initMaster.changedRound,
			roundCounter = state.initMaster.round,
			prevRound = (attrLookup( charCS, 'prev-round' + tokenID, 'current', true ) || 0),
			sheetTypes = getSheetTypes( charCS ),
			init_submitVal = (changedRound || (prevRound != roundCounter) ? 1 : 0 );
		
		setAmmoFlags( charCS, sheetTypes );
		setAttr( charCS, 'init-done', 'current', 0 );
		setAttr( charCS, 'init-submitVal', 'current', init_submitVal );

		if (!init_submitVal) {
			sendParsedMsg( 'InitMaster', Init_Messages.doneInit, tokenID );
			return;
		};
		
        args.unshift(initMenu);
		args[2] = -1;
		
		buildMenu( initMenu, charCS, sheetTypes, MenuState.ENABLED, args );
		return;

    };

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, senderId ) {
		if (!args)
			{return;}
		args = args.split('|');

		if (args.length < 1 || args.length > 10) {
			sendDebug('doButton: Invalid number of arguments');
			sendError('Invalid initMaster syntax');
			return;
		}

		var	content = '',
		    sheetTypes, curToken, charID, charCS,
			setVars, 
		    handler = args[0],
			tokenID = args[1];

		if (!(charCS = getCharacter( tokenID ))) {
			sendDebug( 'doButton: tokenID does not specify a character' );
			sendError( 'Invalid button' );
			return;
		}
		sheetTypes = getSheetTypes( charCS );
			
		switch (handler) {

			case BT.MON_ATTACK :
			
				// Handle the results of pressing a 'monster attack' button
				
				handleInitMonster( Monster.SIMPLE, charCS, sheetTypes, args );
				break;

			case BT.MON_INNATE :
			
				// Handle the results of pressing a complex 'monster attack' button
				
				handleInitMonster( Monster.COMPLEX, charCS, sheetTypes, args );
				break;

			case BT.MELEE :

				// Handle the results of pressing a character melee weapon initiative button
		
				handleInitMW( CharSheet.CHARACTER, charCS, sheetTypes, args );
				break;
			
			case BT.MON_MELEE :

				// Handle the results of pressing a complex monster melee weapon initiative button
		
				handleInitMW( CharSheet.MONSTER, charCS, sheetTypes, args );
				break;
			
			case BT.TWOWEAPONS :
			
				// Handle switching to the twoWeaponsMenu for fighters
				
				handlePrimeWeapon( charCS, sheetTypes, args );
				break;

			case BT.MW_PRIME :
			
				// Handle selection of the first of two weapons to use
				
				handlePrimeWeapon( charCS, sheetTypes, args );
				break;
				
			case BT.MW_SECOND :
			
				// Handle selection of the second of two weapons to use
				
				handleSecondWeapon( charCS, sheetTypes, args );
				break;
				
			case BT.ONEWEAPON :
			
				// Handle returning to selecting a single weapon
				
				handleInitMW( CharSheet.CHARACTER, charCS, sheetTypes, args );
				break;
			
			case BT.RANGED :

				// Handle the results of pressing a character ranged weapon initiative button
		
				handleInitRW( CharSheet.CHARACTER, charCS, sheetTypes, args );
				break;
				
			case BT.MON_RANGED :

				// Handle the results of pressing a complex monster ranged weapon initiative button
		
				handleInitRW( CharSheet.MONSTER, charCS, sheetTypes, args );
				break;
				
			case BT.MU_SPELL :
			
				// Handle the results of pressing a MU spell initiative button
				
				handleInitSpell( Caster.WIZARD, charCS, sheetTypes, args );
				break;
				
			case BT.PR_SPELL :
				
				// Handle the results of pressing a PR spell initiative button
				
				handleInitSpell( Caster.PRIEST, charCS, sheetTypes, args );
				break;
				
			case BT.POWER :
			
				// Handle the results of pressing a Power initiative button
				
				handleInitPower( charCS, sheetTypes, args );
				break;
				
			case BT.MI_BAG :
			
				// Handle the results of pressing a MIBag initiative button
				
				handleInitMIBag( charCS, sheetTypes, args );
				break;
				
			case BT.THIEF :
			
				// Handle the results of pressing a Thieving initiative button
				
				handleInitThief( charCS, sheetTypes, args );
				break;
				
			case BT.OTHER :

				// Handle the results of pressing the buttons on the 'Other' menu
				
				handleOtherActions( charCS, sheetTypes, args );
				break;
				
			case BT.CARRY :

				// Handle a Carry situation (action longer than 1 round)
				
				handleInitCarry( tokenID, charCS, sheetTypes, args[3] );
				break;
				
			case BT.SUBMIT :

				// Handle the results of pressing any Submit button

				handleInitSubmit( senderId, charCS, sheetTypes, args );
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
			selected = msg.selected;
			
		if (args.indexOf('!init') !== 0)
			{return;}

        sendDebug('initMaster called');

		args = args.split(' --');
		args.shift();
		
		_.each(args, function(e) {
			var arg = e;
			sendDebug('Processing arg: '+arg);
			senderId = msg.playerid;

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
			
			// RED: If in debugging mode, allow debugger to execute GM
			// type commands
    		if (msg.type === 'api') {
    	    	if (arg.indexOf('weapon') === 0) {
    	    	    arg = arg.replace('weapon','').trim();
        			doInitMenu(arg,MenuType.WEAPON);
	    		} else if (arg.indexOf('monster') === 0) {
	    			arg = arg.replace('monster','').trim();
		    		doInitMenu(arg,MenuType.SIMPLE);
	    		} else if (arg.indexOf('complex') === 0) {
	    			arg = arg.replace('complex','').trim();
		    		doInitMenu(arg,MenuType.COMPLEX);
	    		} else if (arg.indexOf('muspell') === 0) {
	    			arg = arg.replace('muspell','').trim();
		    		doInitMenu(arg,MenuType.MUSPELL);
	    		} else if (arg.indexOf('prspell') === 0) {
	    			arg = arg.replace('prspell','').trim();
		    		doInitMenu(arg,MenuType.PRSPELL);
	    		} else if (arg.indexOf('power') === 0) {
	    			arg = arg.replace('power','').trim();
		    		doInitMenu(arg,MenuType.POWER);
	    		} else if (arg.indexOf('mibag') === 0) {
	    			arg = arg.replace('mibag','').trim();
		    		doInitMenu(arg,MenuType.MIBAG);
	    		} else if (arg.indexOf('thief') === 0) {
	    			arg = arg.replace('thief','').trim();
		    		doInitMenu(arg,MenuType.THIEF);
	    		} else if (arg.indexOf('other') === 0) {
	    			arg = arg.replace('other','').trim();
		    		doInitMenu(arg,MenuType.OTHER);
	    		} else if (arg.indexOf('menu') === 0) {
	    			arg = arg.replace('menu','').trim();
		    		doInitMenu(arg,MenuType.MENU);
	    		} else if (arg.indexOf('monmenu') === 0) {
	    			arg = arg.replace('monmenu','').trim();
		    		doInitMenu(arg,MenuType.MONSTER_MENU);
	    		} else if (arg.indexOf('redo') === 0) {
	    			arg = arg.replace('redo','').trim();
		    		doRedo(arg);
	    		} else if (arg.indexOf('button') === 0) {
	    			arg = arg.replace('button','').trim();
		    		doButton(arg,senderId);
	    		} else if (arg.indexOf('buildMenu') === 0) {
	    			arg = arg.replace('buildMenu','').trim();
		    		doBuildMenu(arg);
	    		} else if (arg.indexOf('isRound') === 0) {
	    			arg = arg.replace('isRound','').trim();
		    		doIsRound(arg);
	    		} else if (arg.indexOf('disp-weaps') === 0) {
	    			arg = arg.replace('disp-weaps','').trim();
		    		doDispWeaps(arg);
    			} else if (arg.indexOf('help') === 0) {
    				showHelp(); 
    			}  else if (arg.indexOf('relay') === 0) {
    				arg = arg.replace('relay','').trim(); 
    				doRelay(arg,senderId); 
    			} else if (arg.indexOf('debug') === 0) {
    				// RED: v1.207 allow anyone to set debug and who to send debug messages to
    				arg = arg.replace('debug','').trim();
    				doSetDebug(arg,senderId);
    			} else {
    			    sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
    				showHelp(); 
    			}
    		}
    	});
		createAttrs( !!state.initMaster.debug, true );
	};
	
// ---------------------------------- register with Roll20 event handler ---------------------------------

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
	initMaster.init(); 
	initMaster.registerAPI();
});