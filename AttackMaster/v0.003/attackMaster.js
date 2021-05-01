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
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = 0.003,
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
	});
	
	var fields = Object.freeze({
		feedbackName:       'attackMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		MagicItemDB:        'MI-DB',
		Fighter_class:      ['class1','current'],
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
				sendAttkAPI( setVars );
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
		sheetTypes.sheetFlags = attrLookup( charCS, 'sheet-flags', 'current' );
		
		if (sheetTypes.sheetFlags != 0) {
			sheetTypes.sheetType = attrLookup( charCS, 'sheet-type', 'current' );
			sheetTypes.sheetMUType = attrLookup( charCS, 'sheet-mu-spells-type', 'current' );
			sheetTypes.sheetPRType = attrLookup( charCS, 'sheet-pr-spells-type', 'current' );
			sheetTypes.sheetPowersType = attrLookup( charCS, 'sheet-powers-type', 'current' );
			sheetTypes.sheetattackMasterType = attrLookup( charCS, 'sheet-attackMaster-type', 'current' );
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
			if (_.isUndefined((ammoRedirect = attrLookup( charCS, ammoRedirectPointer, fields.Ammo_indirect[1] )))) {
				sendDebug( 'setAmmoFlags: no ' + ammoRedirectPointer + ' set for ' + charCS.get('name') );
			} else if (_.isUndefined((ammoQty = attrLookup( charCS, ammoRedirect + fields.Ammo_qty[0], fields.Ammo_qty[1] )))) {
				sendDebug( 'setAmmoFlags: ' + ammoRedirect + fields.Ammo_qty[0] + ' does not exist for ' + charCS.get('name'));
			} else {
				setAttr( charCS, fields.Ammo_flag[0] + i, fields.Ammo_flag[1], (ammoQty ? 1 : 0) );
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

		AC.shielded.normal = attrLookup(charCS,fields.Armour_normal[0],fields.Armour_normal[1]) || 0;
		AC.shielded.missile = attrLookup(charCS,fields.Armour_missile[0],fields.Armour_missile[1]) || 0;
		AC.shielded.surprised = attrLookup(charCS,fields.Armour_surprised[0],fields.Armour_surprised[1]) || 0;
		AC.shielded.back = attrLookup(charCS,fields.Armour_back[0],fields.Armour_back[1]) || 0;
		AC.shielded.head = attrLookup(charCS,fields.Armour_head[0],fields.Armour_head[1]) || 0;
		
		AC.shieldless.normal = attrLookup(charCS,fields.Shieldless_normal[0],fields.Shieldless_normal[1]) || 0;
		AC.shieldless.missile = attrLookup(charCS,fields.Shieldless_missile[0],fields.Shieldless_missile[1]) || 0;
		AC.shieldless.surprised = attrLookup(charCS,fields.Shieldless_surprised[0],fields.Shieldless_surprised[1]) || 0;
		AC.shieldless.back = attrLookup(charCS,fields.Shieldless_back[0],fields.Shieldless_back[1]) || 0;
		AC.shieldless.head = attrLookup(charCS,fields.Shieldless_head[0],fields.Shieldless_head[1]) || 0;
		
		AC.armourless.normal = attrLookup(charCS,fields.Armourless_normal[0],fields.Armourless_normal[1]) || 0;
		AC.armourless.missile = attrLookup(charCS,fields.Armourless_missile[0],fields.Armourless_missile[1]) || 0;
		AC.armourless.surprised = attrLookup(charCS,fields.Armourless_surprised[0],fields.Armourless_surprised[1]) || 0;
		AC.armourless.back = attrLookup(charCS,fields.Armourless_back[0],fields.Armourless_back[1]) || 0;
		AC.armourless.head = attrLookup(charCS,fields.Armourless_head[0],fields.Armourless_head[1]) || 0;
		
		return AC;
	}
	
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/**
	 * Create range buttons for a ranged weapon attack to add into a menu.
	**/

	var makeRangeButtons = function( args, charCS, disabled ) {

		var tokenID = args[1],
		    attkType = args[2],
		    weapon = args[3],
		    rowIndex = parseInt(args[4],10),
			diceRoll = args[6],
		    range = args[7],
		    specRange = 3,
			farRange,
			content = '',
			rwTableRef = '',
			wpTableRef = '',
			ranges = [],
			specialist = true,
			charCS = getCharacter( tokenID );

		if (rowIndex >= -1) {
			rwTableRef = (rowIndex != -1) ? (fields.RW_table[0] + '_$' + rowIndex + '_') : '';
			wpTableRef = fields.WP_table[0] + '_$' + (2*(rowIndex+1)) + '_';
		}
		
		if (!_.isNull(weapon) && !(parseInt(weapon,10) % 2)) {
    		ranges = (attrLookup( charCS, rwTableRef + fields.RW_range[0], fields.RW_range[1] ) || '');
    		specialist = parseInt((attrLookup( charCS, wpTableRef + fields.WP_specialist[0], fields.WP_specialist[1] ) || 1), 10);
    
    		ranges = ranges.split('/');
    		// Remove any non-numeric entries from the ranges
    		ranges = _.reject(ranges, function(dist){return isNaN(parseInt(dist,10));});
    		// Make the ranges always start with Short (assume 4 or more ranges start with Point Blank)
    		if (ranges.length >= 4) {
    			specRange = parseInt(ranges.shift(),10);
    		}
    		log( 'weapon:'+weapon+', specialist:'+specialist+', rowIndex:'+rowIndex+', specialist lookup:'+attrLookup( charCS, wpTableRef + fields.WP_specialist[0], fields.WP_specialist[1] )+', wpTableRef:'+wpTableRef);
		
		}
		
		if (specialist) {
			content += (disabled || range) ? ('<span style='+(range=='PB' ? design.selected_button : design.grey_button)+'>') : '[';
			content += (ranges.length) ? 'PB: 6 to 30' : 'Point Blank' ;
			content += (disabled || range) ? '</span>' : ('](!attk --button ' + BT.RANGEMOD + '|' + tokenID +  '|' + attkType + '|' + weapon + '|' + rowIndex + '|0|'+diceRoll+'|PB)');
		}
		content += (disabled || range) ? ('<span style='+(range=='S' ? design.selected_button : design.grey_button)+'>') : '[';
		farRange = (ranges.length) ? 10*parseInt(ranges[0]) : 0;
		content += (ranges.length) ? ('S: '+(specialist ? '31' : '6')+' to '+farRange) : 'Short';
		content += (disabled || range) ? '</span>' : ('](!attk --button ' + BT.RANGEMOD + '|' + tokenID +  '|' + attkType + '|' + weapon + '|' + rowIndex + '|0|'+diceRoll+'S)');

		if (ranges.length != 1) {
			content += (disabled || range) ? ('<span style='+(range=='M' ? design.selected_button : design.grey_button)+'>') : '[';
			farRange = (ranges.length) ? 10*parseInt(ranges[1]) : 0;
			content += (ranges.length) ? ('M: '+((10*parseInt(ranges[0]))+1)+' to '+farRange) : 'Medium';
			content += (disabled || range) ? '</span>' : ('](!attk --button ' + BT.RANGEMOD + '|' + tokenID +  '|' + attkType + '|' + weapon + '|' + rowIndex + '|0|'+diceRoll+'M)');
		}
		if (!ranges.length || ranges.length > 2) {
			content += (disabled || range) ? ('<span style='+(range=='L' ? design.selected_button : design.grey_button)+'>') : '[';
			farRange = (ranges.length) ? 10*parseInt(ranges[2]) : 0;
			content += (ranges.length) ? ('L: '+((10*parseInt(ranges[1]))+1)+' to '+farRange) : 'Long';
			content += (disabled || range) ? '</span>' : ('](!attk --button ' + BT.RANGEMOD + '|' + tokenID +  '|' + attkType + '|' + weapon + '|' + rowIndex + '|0|'+diceRoll+'L)');
		}

		content += (disabled || range) ? ('<span style='+(range=='F' ? design.selected_button : design.grey_button)+'>') : '[';
		content += (ranges.length) ? ('Far: beyond '+(farRange+1)) : 'Far';
		content += (disabled || range) ? '</span>' : ('](!attk --button ' + BT.RANGEMOD + '|' + tokenID +  '|' + attkType + '|' + weapon + '|' + rowIndex + '|0|'+diceRoll+'F)');

		return content;
	}


    /*
    * Create the standard weapon Attack menu.  If the optional monster attack parameters are passed,
	* also display the monster attacks.
    */

	var makeAttackMenu = function( args, submitted, monsterAttk1, monsterAttk2, monsterAttk3 ) {

		var tokenID = args[1],
		    attkType = args[2],
		    weaponButton = args[3],
		    rowIndex = parseInt(args[4],10),
		    twoWeapons = (args[5] || 0),
			diceRoll = args[6] || 0),
		    range = args[7],
		    curToken,
			charID,
			charCS,
			i, w,
			ammoPointer,
			ammoQty;
	
		if (!tokenID || !(curToken = getObj( 'graphic', tokenID ))) {
            sendDebug( 'makeAttackMenu: tokenID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        };
        
		charID = curToken.get( 'represents' );

		if (!charID || !((charCS = getObj( 'character', charID )))) {
            sendDebug( 'makeAttackMenu: charID is invalid' );
            sendError( 'Invalid make-menu call syntax' );
            return;
        };
       
        var tokenName = curToken.get('name'),
			charName = charCS.get('name'),
			sheetTypes = getSheetTypes( charCS ),
            content = '&{template:2Edefault}{{name=How is ' + tokenName + ' attacking?}}'
					+ '{{desc=';
			
		if ( monsterAttk1 || monsterAttk2 || monsterAttk3 ) {
			content += '**Monster Attacks**\n';
			if (monsterAttk1) {
				content += '[' + monsterAttk1 + '](!attk --button ' + BT.MON_INNATE + '|' + tokenID + '|' + attkType + '|1|-1|-1|&#91;&#91;1d20&#93;&#93;)';
			}
			if (monsterAttk2) {
				content += '[' + monsterAttk2 + '](!attk --button ' + BT.MON_INNATE + '|' + tokenID + '|' + attkType + '|2|-1|-1|&#91;&#91;1d20&#93;&#93;)';
			}
			if (monsterAttk3) {
				content += '[' + monsterAttk3 + '](!attk --button ' + BT.MON_INNATE + '|' + tokenID + '|' + attkType + '|3|-1|-1|&#91;&#91;1d20&#93;&#93;)';
			}
			content += '}}{{desc1=';
		}
			
		content += '**Melee weapons**\n';

		// build the Melee Weapon list
		
		for (i = 0; i < (sheetTypes.sheetType); i++) {
			w = 1 + (i * 2);
			weapTableRef = (fields.MWfirstRowNamed && i == 0) : '' ? fields.MW_table[0] + '_$' + i + '_';
			content += (w == weaponButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, weapTableRef + fields.MW_name[0], fields.MW_name[1]);
			content += ((w == weaponButton) || submitted) ? '</span>' : '](!attk --button ' + BT.MELEE + '|' + tokenID + '|' + attkType + '|' + w + '|' + i + '|' + twoWeapons + '\n&#37;{Attacks|To-Hit-ally-MW'+(i+1)+'})';
		};
		
		content += '}}{{desc2=**Ranged weapons x ammo**\n';

		// build the character Ranged Weapons list
		
		if (fields.RWfirstRowNamed) {
			ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + '1-', fields.Ammo_indirect[1]);
			ammoQty = Math.max(attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1]),0);
			content += (2 == weaponButton ? '<span style=' + design.selected_button + '>' : ((submitted || !ammoQty ) ? '<span style=' + design.grey_button + '>' : '['));
			content += attrLookup( charCS, fields.RW_name[0], fields.RW_name[1]);
			if (ammoQty) {
				content += ' x ' + ammoQty;
			}
			content += ((2 == weaponButton) || submitted || !ammoQty) ? '</span>' : '](!attk --button ' + BT.RANGED + '|' + tokenID + '|' + attkType + '|2|-1|0|&#91;&#91;1d20&#93;&#93;)';
		}

		for (i = 0; i < (sheetTypes.sheetType-1); i++) {
			w = 2 + (i * 2);
			weapTableRef = (fields.RWfirstRowNamed && i == 0) : '' ? fields.RW_table[0] + '_$' + i + '_';
			ammoPointer = attrLookup( charCS, fields.Ammo_indirect[0] + (i+1) + '-', fields.Ammo_indirect[1]);
			ammoQty = Math.max(attrLookup( charCS, ammoPointer + fields.Ammo_qty[0], fields.Ammo_qty[1]),0);
			content += (w == weaponButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += ammoQty + ' x ' + attrLookup( charCS, weapTableRef + fields.RW_name[0], fields.RW_name[1]);
			content += ((w == weaponButton) || submitted) ? '</span>' : '](!attk --button ' + BT.RANGED + '|' + tokenID + '|' + attkType + '|' + w + '|' + i + '|0)';
		};

		// add the range selection buttons (disabled until ranged weapon selected)
		
		content +=  '\n**Range selection**\n';

		content += makeRangeButtons( args, charCS, (range || _.isNull(weaponButton) || !!(parseInt(weaponButton,10) % 2)) );
		
		content += '}}';

		sendResponse( charCS, content );
		return;
	};
	
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

    /**
     * Handle a melee weapon attack "To Hit" roll
    **/

	var handleMeleeAttack = function( args ) {

		var tokenID = args[1],
			attkType = args[2],
			rowIndex = parseInt(args[4],10),
			twoWeapons = parseInt(args[5],10),
			diceRoll = parseInt(args[6],10),
			curToken = getObj( 'graphic', tokenID ),
			tokenName = curToken.get('name'),
			charCS = getCharacter( tokenID ),
			tableRef,
			thac0,
			content;
			
		makeAttackMenu( args, MenuState.DISABLED );
		
		thac0 = parseInt(curToken.get(fields.Thac0[0] + '_' + fields.Thac0[1]), 10);
		if (!thac0) {
			sendDebug( 'handleMeleeAttack: token thac0 undefined, using 20' );
			sendError( 'thac0 undefined for token ' + tokenName + '.  Using 20.' );
			thac0 = 20;
		}
		
		tableRef = (rowIndex != -1) ? (fields.MW_table[0] + '_$' + rowIndex + '_') : '';
		
		var	attackAdj = (attrLookup( charCS, tableRef + fields.MW_attkAdj[0], fields.MW_attkAdj[1] ) || '0'),
			strBonus = parseInt((attrLookup( charCS, tableRef + fields.MW_strBonus[0], fields.MW_strBonus[1] ) || '0'), 10),
			profLevel = (attrLookup( charCS, tableRef + fields.MW_profLevel[0], fields.MW_profLevel[1] ) || '0'),
			proficiency = parseInt(profLevel,10),
			weapon = (attrLookup( charCS, tableRef + fields.MW_name[0], fields.MW_name[1] ) || ''),
			critThreshold = parseInt((attrLookup( charCS, tableRef + fields.MW_crit[0], fields.MW_crit[1] ) || '20'), 10),
			fighterClass = (attrLookup( charCS, fields.Fighter_class[0], fields.Fighter_class[1] ) || ''),
			dexReact = parseInt((attrLookup( charCS, fields.Dex_react[0], fields.Dex_react[1] ) || '0'), 10),
			twoWeapons = state.attackMaster.twoWeapons[tokenID],
			twoWeapPenalty = 0;
			
		log('Raw profLevel:'+profLevel+', profLevel lookup:'+attrLookup( charCS, tableRef + fields.MW_profLevel[0], fields.MW_profLevel[1] )+', proficiency:'+proficiency);
			
		if (_.isNaN(proficiency)) {
		    profLevel = profLevel.substring(2,profLevel.length-1);
		    proficiency = '@{'+charCS.get('name')+'|'+profLevel+'}';
		}
			
		log('Processed profLevel:'+profLevel+', profLevel lookup:'+attrLookup( charCS, profLevel, 'current' )+', proficiency:'+proficiency);
		
		if (twoWeapons && (twoWeapons != TwoWeapons.SINGLE) && !_.contains(TwoWeapons.NOPENALTY,fighterClass)) {
		    twoWeapPenalty = twoWeapons - dexReact;
		    state.attackMaster.twoWeapons[tokenID] = (twoWeapons == TwoWeapons.PRIMARY) ? TwoWeapons.SECONDARY : TwoWeapons.PRIMARY ;
		}
			
		tableRef = (rowIndex != -1) ? (fields.WP_table[0] + '_$' + (1 + (2*rowIndex)) + '_') : '';
		
		var	mastery = parseInt((attrLookup( charCS, tableRef + fields.WP_mastery[0], fields.WP_mastery[1] ) || '0'), 10),
			strengthHit = parseInt((attrLookup( charCS, fields.Strength_hit[0], fields.Strength_hit[1] ) || '0'), 10),
			adjustments = (strBonus * strengthHit) + (2 * mastery) - twoWeapPenalty,
			adjThac0 = thac0 - adjustments;

		log( 'attackAdj:'+attackAdj+', strBonus:'+strBonus+', strengthHit:'+strengthHit+', profLevel:'+profLevel+', proficiency:'+proficiency+', mastery:'+mastery+', dexReact:'+dexReact+', twoWeapPenalty:'+twoWeapPenalty+', critThreshold='+critThreshold );

		content = '&{template:2Edefault}{{name=' + tokenName + ' attacks with their ' + weapon + '}}'
				+ '{{Hits AC=[['+adjThac0+'-([['+attackAdj+']]+[['+proficiency+']])-'+diceRoll+'cs>'+critThreshold+']]}}'
				+ '{{Thac0=[[' + thac0 + ']]}}'
				+ '{{Adjustments=[[([[' + adjustments + ']]+[[' + attackAdj + ']]+[[' + proficiency + ']])]]}}\n';
				
		content += '/w "' + charCS.get('name') + '" &{template:2Edefault}{{name=' + tokenName + ' attacks with their ' + weapon + '}}'
				+ '{{If hit SM=[Damage SM](!attk --button ' + BT.MW_DMGSM + '|' + tokenID + '|' + rowIndex + ')}}'
				+ '{{If hit L=[Damage L](!attk --button ' + BT.MW_DMGL + '|' + tokenID + '|' + rowIndex + ')}}';
				
		log( content );

		if (charCS.get('controlledby').length) {
			sendPublic( content, charCS );
		} else {
			sendFeedback( content );
		}
		return;
	};

    /**
     * Handle an attack with a Ranged Weapon - first, get the range modifier
    **/

	var handleRangedAttack = function( args ) {
		
		makeAttackMenu( args, true );

		return;	
	}
    
    /**
     * Once ranged weapon range and to hit roll determined, display the results
    **/
	
	var handleRangedAttackCalc = function( args ) {

		var tokenID = args[1],
			attkType = args[2],
			rowIndex = parseInt(args[4],10),
			range = args[6],
			curToken = getObj( 'graphic', tokenID ),
			tokenName = curToken.get('name'),
			charCS = getCharacter( tokenID ),
			content,
			tableRef;
			
		makeAttackMenu( args, MenuState.DISABLED );
		
		var thac0 = parseInt(curToken.get(fields.Thac0[0] + '_' + fields.Thac0[1]), 10);
		if (!thac0) {
			sendDebug( 'handleMeleeAttack: token thac0 undefined, using 20' );
			sendError( 'thac0 undefined for token ' + tokenName + '.  Using 20.' );
			thac0 = 20;
		}
		
		log('Thac0: '+thac0);
		
		tableRef = (rowIndex != -1) ? (fields.RW_table[0] + '_$' + rowIndex + '_') : '';
		
		var	weapon = (attrLookup( charCS, tableRef + fields.RW_name[0], fields.RW_name[1] ) || ''),
            attackAdj = (attrLookup( charCS, tableRef + fields.RW_attkAdj[0], fields.RW_attkAdj[1] ) || '0'),
			profLevel = (attrLookup( charCS, tableRef + fields.RW_profLevel[0], fields.RW_profLevel[1] ) || '0'),
            proficiency = parseInt(profLevel,10),
			strBonus = parseInt((attrLookup( charCS, tableRef + fields.RW_strBonus[0], fields.RW_strBonus[1] ) || 0), 10),
			dexBonus = parseInt((attrLookup( charCS, tableRef + fields.RW_dexBonus[0], fields.RW_dexBonus[1] ) || 0), 10),
			critThreshold = parseInt((attrLookup( charCS, tableRef + fields.RW_crit[0], fields.RW_crit[1] ) || 0), 10);

		log('Raw profLevel:'+profLevel+', profLevel lookup:'+attrLookup( charCS, tableRef + fields.MW_profLevel[0], fields.MW_profLevel[1] )+', proficiency:'+proficiency);
			
		if (_.isNaN(proficiency)) {
		    profLevel = profLevel.substring(2,profLevel.length-1);
		    proficiency = '@{'+charCS.get('name')+'|'+profLevel+'}';
		}
			
		log('Processed profLevel:'+profLevel+', profLevel lookup:'+attrLookup( charCS, profLevel, 'current' )+', proficiency:'+proficiency);
			
		tableRef = fields.WP_table[0] + '_$' + (2*(rowIndex+1)) + '_';
		
		var	specialist = parseInt((attrLookup( charCS, tableRef + fields.WP_specialist[0], fields.WP_specialist[1] ) || 0), 10),
			mastery = parseInt((attrLookup( charCS, tableRef + fields.WP_mastery[0], fields.WP_mastery[1] ) || 0), 10),
			strengthHit = parseInt((attrLookup( charCS, fields.Strength_hit[0], fields.Strength_hit[1] ) || 0), 10),
			dexMissile = parseInt((attrLookup( charCS, fields.Dex_missile[0], fields.Dex_missile[1] ) || 0), 10),
			rangeMod = parseInt((attrLookup( charCS, 'Rangemod-'+range, 'current' ) || 0), 10),
			adjustments = (dexBonus * dexMissile) + (strBonus * strengthHit) + proficiency + rangeMod,
			adjThac0 = thac0 - adjustments;

		log( 'attackAdj:'+attackAdj+', strBonus:'+strBonus+', strengthHit:'+strengthHit+', profLevel:'+profLevel+', proficiency:'+proficiency+', specialist:'+specialist+', mastery:'+mastery+', dexBonus:'+dexBonus+', dexMissile:'+dexMissile+', rangeMod:'+rangeMod+', critThreshold:'+critThreshold );

		var content = '&{template:2Edefault}{{name=' + tokenName + ' attacks with their ' + weapon + '}}'
				+ '{{Hits AC=[['+adjThac0+'-([['+attackAdj+']]+[['+proficiency+']])-1d20cs>'+critThreshold+']]}}'
				+ '{{Thac0=[[' + thac0 + ']]}}'
				+ '{{Adjustments=[[([[' + adjustments + ']]+[[' + attackAdj + ']]+[[' + proficiency + ']])]]}}\n';
				
		content += '/w "' + charCS.get('name') + '" &{template:2Edefault}{{name=' + tokenName + ' attacks with their ' + weapon + '}}'
				+ '{{If hit SM=[Damage SM](!attk --button ' + BT.RW_DMGSM + '|' + tokenID + '|' + rowIndex + '|' + range + ')}}'
				+ '{{If hit L=[Damage L](!attk --button ' + BT.RW_DMGL + '|' + tokenID + '|' + rowIndex + '|' + range + ')}}';
				
		log( content );
				
//		if (charCS.get('controlledby')) {
//			sendPublic( content );
//		} else {
//			sendFeedback( content );
//		}
		return;
	};

	/**
	 * Handle the calculation of damage done by a melee weapon attack
	**/
	
	var handleMeleeDamage = function( args ) {
		
		var dmgType = args[0],
			tokenID = args[1],
			rowIndex = args[2],
            tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter( tokenID ),
			tableRef = (rowIndex != -1) ? (fields.MW_dmgTable[0] + '_$' + rowIndex + '_') : '' ,
            weapon = (attrLookup( charCS, tableRef + fields.MW_name[0], fields.MW_name[1] ) || ''),
			dmgAdj = (attrLookup( charCS, tableRef + fields.MW_dmgAdj[0], fields.MW_dmgAdj[1] ) || '0'),
			specialist = parseInt((attrLookup( charCS, tableRef + fields.MW_dmgSpecialist[0], fields.MW_dmgSpecialist[1] ) || '0'), 10),
			strBonus = parseInt((attrLookup( charCS, tableRef + fields.MW_dmgStrBonus[0], fields.MW_dmgStrBonus[1] ) || '0'), 10),
			strDmg = parseInt((attrLookup( charCS, fields.Strength_dmg[0], fields.Strength_dmg[1] ) || '0'), 10),
			magicDmgAdj = parseInt((attrLookup( charCS, fields.Dmg_magicAdj[0], fields.Dmg_magicAdj[1] ) || '0'), 10),
			backstabMult = parseInt((attrLookup( charCS, fields.Backstab_mult[0], fields.Backstab_mult[1] ) || '0'), 10),
			content,
			dmgDice;
			
		if (!fields.MWdmgFistRowNamed && rowIndex < 0) {
			sendDebug( 'handleRangedAttackCalc: invalid rowIndex for melee damage table' );
			sendError( 'attackMaster field definition error' );
			return;
		}
		
		if (dmgType == BT.MW_DMGL) {
			dmgDice = (attrLookup( charCS, tableRef + fields.MW_dmgL[0], fields.MW_dmgL[1] ) || '0');
		} else {
			dmgDice = (attrLookup( charCS, tableRef + fields.MW_dmgSM[0], fields.MW_dmgSM[1] ) || '0');
		}
		
		tableRef = (rowIndex != -1) ? (fields.WP_table[0] + '_$' + (1 + (2*rowIndex)) + '_') : '';
		var mastery = parseInt((attrLookup( charCS, tableRef + fields.WP_mastery[0], fields.WP_mastery[1] ) || '0'), 10),
			backstab = parseInt((attrLookup( charCS, tableRef + fields.WP_backstab[0], fields.WP_backstab[1] ) || '0'), 10),
			otherAdj = (strBonus * strDmg * (backstab ? backstabMult : 1)) + (magicDmgAdj + specialist + mastery);
			
		content = '&{template:2Edefault}{{name=' + tokenName + (backstab ? ' backstabs' : ' does damage') + ' with their ' + weapon + '}}'
				+ '{{Damage=[[([[' + dmgDice + ']]*' + (backstab ? backstabMult : 1) + ')+' + dmgAdj + '+' + otherAdj + ']]}}';
		
		if (backstab) {
			content += '{{Adjustment=Dice x [[' + backstabMult + ']] + [[' + dmgAdj + '+' + otherAdj + ']]}}';
		} else {
			content += '{{Adjustment=Dice + [[' + dmgAdj + '+' + totalAdj + ']]}}';
		}

		if (charCS.get('controlledby').length) {
			sendPublic( content );
		} else {
			sendFeedback( content );
		}
		return;
	};

		/**
	 * Handle the calculation of damage done by a ranged weapon attack
	**/
	
	var handleRangedDamage = function( args ) {
		
		var dmgType = args[0],
			tokenID = args[1],
			rowIndex = args[2],
			range = args[3],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
			charCS = getCharacter( tokenID ),
			ammoPointer = (attrLookup( charCS, fields.Ammo_indirect[0] + (rowIndex+(fields.AmmoFirstRowNamed ? 2 : 1)) + '-', fields.Ammo_indirect[1]) || ''),
			dmgAdj = (attrLookup( charCS, ammoPointer + fields.Ammo_dmgAdj[0], fields.Ammo_dmgAdj[1] ) || '0'),
			strBonus = parseInt((attrLookup( charCS, ammoPointer + fields.Ammo_strBonus[0], fields.Ammo_strBonus[1] ) || '0'), 10),
			strDmg = parseInt((attrLookup( charCS, fields.Strength_dmg[0], fields.Strength_dmg[1] ) || '0'), 10),
			magicDmgAdj = parseInt((attrLookup( charCS, fields.Dmg_magicAdj[0], fields.Dmg_magicAdj[1] ) || '0'), 10),
			content,
			weapon,
			tableRef,
			dmgDice,
			specialist,
			rangeMod,
			rangeMult;
			
		if (!fields.AmmoFirstRowNamed && rowIndex < 0) {
			sendDebug( 'handleRangedAttackCalc: invalid rowIndex for ammo table' );
			sendError( 'attackMaster field definition error' );
			return;
		}

		if (dmgType = BT.RW_DMGL) {
			dmgDice = (attrLookup( charCS, tableRef + fields.Ammo_dmgL[0], fields.Ammo_dmgL[1] ) || '0');
		} else {
			dmgDice = (attrLookup( charCS, tableRef + fields.Ammo_dmgSM[0], fields.Ammo_dmgSM[1] ) || '0');
		}
		
		tableRef = (rowIndex != -1) ? (fields.MW_table[0] + '_$' + (2*rowIndex) + '_') : '';
		weapon = (attrLookup( charCS, tableRef + fields.MW_name[0], fields.MW_name[1] ) || 'ranged weapon');
		
		tableRef = (rowIndex != -1) ? (fields.WP_table[0] + '_$' + (2*rowIndex) + '_') : '';
		specialist = parseInt((attrLookup( charCS, tableRef + fields.WP_specialist[0], fields.WP_specialist[1] ) || '0'), 10);
		
		if (range == 'PB' && specialist) {
			rangeMult = rangeMod = parseInt((attrLookup( charCS, 'Rangemod-PB', 'current' ) || '0'),  10);
		} else {
			rangeMod =0;
			rangeMult=1;
		}
		
		var otherAdj = rangeMod + magicDmgAdj + (strBonus * strDmg);
			
		content = '&{template:2Edefault}{{name=' + tokenName + ' does damage with their ' + weapon + '}}'
				+ '{{Damage=[[([[' + dmgDice + ']]*' + rangeMult + ')+' + dmgAdj + '+' + otherAdj + ']]}}'
				+ '{{Adjustment=Dice x [[' + rangeMult + ']] + [[' + dmgAdj + '+' + otherAdj + ']]}}';

		if (charCS.get('controlledby').length) {
			sendPublic( content );
		} else {
			sendFeedback( content );
		}
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

        args = args.split('|');

		if (args.length < 1 || args.length > 4) {
			sendDebug('doAttackMenu: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    multiWeapNo = (args[1] || 0),
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doAttackMenu: tokenID is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };
        
		setAttr( charCS, 'monsterAttk1', 'current', (args[2] || '') );
		setAttr( charCS, 'monsterAttk2', 'current', (args[3] || '') );
		setAttr( charCS, 'monsterAttk3', 'current', (args[4] || '') );

		makeAttackMenu( ['', tokenID, attkType, null, null, multiWeapNo, 0, ''], MenuState.ENABLED, args[2], args[3], args[4] );
		return;
    };
	
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
		
		ACstate = attrLookup( charCS, fields.ACstate[0], fields.ACstate[1] ) || 'Full';
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
		
		var currentACstate = attrLookup( charCS, fields.ACstate[0], fields.ACstate[1] ) || 'Full';
		
		if (newACstate == currentACstate)
			{return;}
			
		var	currentACfield = (currentACstate == 'Armourless' ? fields.Armourless_normal : 
								(currentACstate == 'Shieldless' ? fields.Shieldless_normal : fields.Armour_normal)),
			newACfield = (newACstate == 'Armourless' ? fields.Armourless_normal : 
								(newACstate == 'Shieldless' ? fields.Shieldless_normal : fields.Armour_normal)),
			currentAC = parseInt(attrLookup( charCS, currentACfield[0], currentACfield[1] ) || 0),
			newAC = parseInt(attrLookup( charCS, newACfield[0], newACfield[1] ) || 0),
			AC = parseInt(attrLookup( charCS, fields.AC[0], fields.AC[1] ) || 0);

		if (currentAC != newAC) {
			setAttr( charCS, fields.AC[0], fields.AC[1], (AC+newAC-currentAC) );
		}
		
		if (displayMenu) {
			makeACmenu( args, toGM );
		}
		setAttr( charCS, fields.ACstate[0], fields.ACstate[1], newACstate );
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

		var currentACstate = attrLookup( charCS, fields.ACstate[0], fields.ACstate[1] ) || 'Full',
			AC = parseInt(attrLookup( charCS, fields.AC[0], fields.AC[1] ) || 10),
			currentValue;
		
		
		switch (situation) {
			
		case 'Full-normal':
			if (currentACstate == 'Full') {
				currentValue = parseInt(attrLookup( charCS, fields.Armour_normal[0], fields.Armour_normal[1] ) || 10);
				if (currentValue != newValue) {
					setAttr( charCS, fields.AC[0], fields.AC[1], (AC+newValue-currentValue) );
				}
			}
			setAttr( charCS, fields.Armour_normal[0], fields.Armour_normal[1], newValue );
			break;
			
		case 'Full-missile':
			setAttr( charCS, fields.Armour_missile[0], fields.Armour_missile[1], newValue );
			break;
			
		case 'Full-surprise':
			setAttr( charCS, fields.Armour_surprised[0], fields.Armour_surprised[1], newValue );
			break;
			
		case 'Full-back':
			setAttr( charCS, fields.Armour_back[0], fields.Armour_back[1], newValue );
			break;
			
		case 'Full-head':
			setAttr( charCS, fields.Armour_head[0], fields.Armour_head[1], newValue );
			break;
			
		case 'Shieldless-normal':
			if (currentACstate == 'Shieldless') {
				currentValue = parseInt(attrLookup( charCS, fields.Shieldless_normal[0], fields.Shieldless_normal[1] ) || 10);
				if (currentValue != newValue) {
					setAttr( charCS, fields.AC[0], fields.AC[1], (AC+newValue-currentValue) );
				}
			}
			setAttr( charCS, fields.Shieldless_normal[0], fields.Shieldless_normal[1], newValue );
			break;
			
		case 'Shieldless-missile':
			setAttr( charCS, fields.Shieldless_missile[0], fields.Shieldless_missile[1], newValue );
			break;
			
		case 'Shieldless-surprise':
			setAttr( charCS, fields.Shieldless_surprised[0], fields.Shieldless_surprised[1], newValue );
			break;
			
		case 'Shieldless-back':
			setAttr( charCS, fields.Shieldless_back[0], fields.Shieldless_back[1], newValue );
			break;
			
		case 'Shieldless-head':
			setAttr( charCS, fields.Shieldless_head[0], fields.Shieldless_head[1], newValue );
			break;
			
		case 'Armourless-normal':
			if (currentACstate == 'Armourless') {
				currentValue = parseInt(attrLookup( charCS, fields.Armourless_normal[0], fields.Armourless_normal[1] ) || 10);
				if (currentValue != newValue) {
					setAttr( charCS, fields.AC[0], fields.AC[1], (AC+newValue-currentValue) );
				}
			}
			setAttr( charCS, fields.Armourless_normal[0], fields.Armourless_normal[1], newValue );
			break;
			
		case 'Armourless-missile':
			setAttr( charCS, fields.Armourless_missile[0], fields.Armourless_missile[1], newValue );
			break;
			
		case 'Armourless-surprise':
			setAttr( charCS, fields.Armourless_surprised[0], fields.Armourless_surprised[1], newValue );
			break;
			
		case 'Armourless-back':
			setAttr( charCS, fields.Armourless_back[0], fields.Armourless_back[1], newValue );
			break;
			
		case 'Armourless-head':
			setAttr( charCS, fields.Armourless_head[0], fields.Armourless_head[1], newValue );
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
		
			handleMeleeAttack( args );
			break;
			
		case BT.RANGED :
		
			handleRangedAttack( args );
			break;
			
		case BT.RANGEMOD :
		
			handleRangedAttackCalc( args );
			break;
			
		case BT.MW_DMGSM :
		case BT.MW_DMGL :

			handleMeleeDamage( args );
			break;
		
		case BT.RW_DMGSM :
		case BT.RW_DMGL :

			handleRangedDamage( args );
			break;
		
		case BT.MON_INNATE :
		
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
			selected = msg.selected;
			
		if (args.indexOf('!attk') !== 0)
			{return;}

        sendDebug('attackMaster called');

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
			
			// If in debugging mode, allow debugger to execute GM
			// type commands
    		if (msg.type === 'api'
    		&& (playerIsGM(senderId) || state.attackMaster.debug === senderId)) {
    	    	if (arg.indexOf('attkmenu') === 0) {
    	    	    arg = arg.replace('attkmenu','').trim();
        			doAttkMenu(arg,Attk.TO_HIT);
	    		} else if (arg.indexOf('showac') === 0) {
	    			arg = arg.replace('showac','').trim();
		    		doDisplayACmenu(arg, true);
	    		} else if (arg.indexOf('setacstatus') === 0) {
	    			arg = arg.replace('setacstatus','').trim();
		    		doSetAC(arg, false, true);
	    		} else if (arg.indexOf('setac') === 0) {
	    			arg = arg.replace('setac','').trim();
		    		doSetAC(arg, true, true);
	    		} else if (arg.indexOf('changeac') === 0) {
	    			arg = arg.replace('changeac','').trim();
		    		doChangeAC(arg, true);
	    		} else if (arg.indexOf('twoswords') === 0) {
	    			arg = arg.replace('twoswords','').trim();
		    		doMultiSwords(arg);
	    		} else if (arg.indexOf('button') === 0) {
	    			arg = arg.replace('button','').trim();
		    		doButton(arg,senderId);
	    		} else if (arg.indexOf('attkroll') === 0) {
	    			arg = arg.replace('attkroll','').trim();
		    		doAttkRoll(arg,senderId);
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
    		} else if (msg.type === 'api') {
    	    	if (arg.indexOf('attkMenu') === 0) {
    	    	    arg = arg.replace('attkMenu','').trim();
        			doAttkMenu(arg,Attk.TO_HIT);
	    		} else if (arg.indexOf('showac') === 0) {
	    			arg = arg.replace('showac','').trim();
		    		doDisplayACmenu(arg, false);
	    		} else if (arg.indexOf('setacstatus') === 0) {
	    			arg = arg.replace('setacstatus','').trim();
		    		doSetAC(arg, false, false);
	    		} else if (arg.indexOf('setac') === 0) {
	    			arg = arg.replace('setac','').trim();
		    		doSetAC(arg, true, false);
	    		} else if (arg.indexOf('changeac') === 0) {
	    			arg = arg.replace('changeac','').trim();
		    		doChangeAC(arg, false);
	    		} else if (arg.indexOf('button') === 0) {
	    			arg = arg.replace('button','').trim();
		    		doButton(arg);
    			} else if (arg.indexOf('help') === 0) {
	    			arg = arg.replace('help','').trim();
    				showHelp(); 
			    } else if (arg.indexOf('debug') === 0) {
  		                  // RED: v1.207 allow anyone to set debug and who to send debug messages to
    				arg = arg.replace('debug','').trim();
    				doSetDebug(arg,senderId);
    			}
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