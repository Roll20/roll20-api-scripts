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
 * v1.031  14/07/2021  Modified to support monster attack speeds in damage specs
 * v1.032  25/08/2021  sendResponse() for tokens controlled by All Players now sends message
 *                     to all players, including the GM.  Also fixed issues with multiple 
 *                     weapon attacks, enabled monster "Two Weapon" attacks, & made redo-initiative
 *                     automatically pull up the initiative menu.
 * v1.033  05/09/2021  Implemented initiative carry-over for monster attack 1 only
 * v1.034  13/10/2021  Changed calls to attackMaster API to not change AC based on attacks, but
 *                     instead call the attackMaster function to check current AC on submission
 *                     of the initiative
 * v1.035  03/11/2021  Added the Maintenance Menu for RoundMaster API control, and the 
 *                     --check-tracker command to check if all players have completed their
 *                     initiative rolls
 * v1.036  15/11/2021  Reduced fields object to only include fields used in InitMaster API,
 *                     and added API handshakes to detect other required APIs are loaded
 * v1.037  30/11/2021  Bug fixes for when using with manually created Character Sheet
 * v1.038  03/12/2021  Added all Roll Template names to fields object and fixed illegal
 *                     characters in handout text
 * v1.039  18/12/2021  Found & fixed errors in command registration with CommandMaster API
 * v1.040  16/01/2022  Corrected initiative modifier for haste & slow on 2nd and subsequent
 *                     attacks in a round, and corrected a slight issue with Bow specialist
 *                     initiative
 * v1.041  23/01/2022  Corrected illegal characters not rendered by One-Click install
 *                     Fixed issue with non-character tokens displaying errors on end-of-day
 * v1.042  28/01/2022  Stopped the Initiative Std/Group roll menu reappearing after reloading
 *                     the campaign if it is turned off.
 * v1.043  04/02/2022  Corrected the Maintenance Menu "End-of-Day" button command call
 * v2.044  01/03/2022  Replaced "Other Actions" initiative menu button with the expanded menu 
 *                     throughout.  Fixed to support very slow weapons of > 1 rounds per attack.
 *                     Changed multi-attack counting method to support any fractional or whole 
 *                     number of attacks per round. Fixed issues with manual entries in Character 
 *                     Sheet tables. Changed white text on grey buttons to black text
 * v2.045  10/04/2022  Fixed 2nd weapon initiative held to 1 when twoWeapSingleAttk is true (bug
 *                     introduced with v2.044)
 * v2.046  20/05/2022  Fixed Group initiative action calculation - was concatenating strings rather
 *                     than adding numbers.
 */

var initMaster = (function() {
	'use strict'; 
	var version = 2.046,
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
		defaultTemplate:	'2Edefault',
		spellTemplate:		'2Espell',
		Fighter_class:      ['class1','current'],
		Fighter_level:      ['level-class1','current'],
		Wizard_level:       ['level-class2','current'],
		Priest_level:       ['level-class3','current'],
		Rogue_level:        ['level-class4','current'],
		Init_action:		['init_action', 'current'],
		Init_2ndAction:		['init_action', 'max'],
		Init_speed:			['init_speed', 'current'],
		Init_2ndSpeed:		['init_speed', 'max'],
		Init_actNum:		['init_actionnum', 'current'],
		Init_2ndActNum:		['init_actionnum', 'max'],
		Init_attacks:		['init_attacks','current'],
		Init_2ndAttacks:	['init_attacks','max'],
		Init_preInit:		['init_preinit', 'current'],
		Init_2ndPreInit:	['init_preinit', 'max'],
		Init_2Hweapon:		['init_2H','current'],
		Init_2nd2Hweapon:	['init_2H', 'max'],
		Init_chosen:		['init_chosen', 'current'],
		Init_submitVal:		['init_submitVal','current'],
		Init_done:			['init_done', 'current'],
		Init_carry:			['init_carry', 'current'],
		Init_carrySpeed:	['init-carry_speed', 'current'],
		Init_carryAction:	['init-carry_action', 'current'],
		Init_carryActNum:	['init-carry_actionnum', 'current'],
		Init_carryAttacks:	['init-carry_attacks', 'current'],
		Init_carryWeapNum:	['init-carry_weapno', 'current'],
		Init_carryPreInit:	['init-carry_preinit', 'current'],
		Init_carry2H:		['init-carry_2H', 'current'],
		initMultiplier:     ['comreact','max'],
		initMod:            ['comreact','current'],
		Prev_round:			['prev-round', 'current'],
		Weapon_num:			['weapno','current'],
		Weapon_2ndNum:		['weapno','max'],
		Monster_hitDice:	['hitdice','current'],
		Monster_hpExtra:	['monsterhpextra','current'],
		Monster_int:		['monsterintelligence','current'],
		Monster_attks:		['monsteratknum','current'],
		Monster_speed:      ['monsterini','current'],
		Monster_dmg1:		['monsterdmg','current'],
		Monster_dmg2:		['monsterdmg2','current'],
		Monster_dmg3:		['monsterdmg3','current'],
		MWrows:				12,
		MWdmgRows:			12,
		MW_table:           ['repeating_weapons',0],
		MW_name:            ['weaponname','current','-'],
		MW_speed:           ['weapspeed','current',5],
		MW_dancing:         ['weapspeed','max',0],
		MW_noAttks:         ['attacknum','current',1],
		MW_attkCount:       ['attacknum','max',0],
		MW_twoHanded:       ['twohanded','current',0],
		RWrows:				12,
		RW_table:           ['repeating_weapons2',0],
		RW_name:            ['weaponname2','current','-'],
		RW_type:			['weaponname2','max',''],
		RW_superType:		['range2','max',''],
		RW_speed:           ['weapspeed2','current',5],
		RW_dancing:         ['weapspeed2','max',0],
		RW_noAttks:         ['attacknum2','current',1],
		RW_attkCount:       ['attacknum2','max',0],
        RW_twoHanded:       ['twohanded2','current',1],
		WP_table:           ['repeating_weaponprofs',0],
		WP_name:			['weapprofname','current','-'],
		WP_type:			['weapprofname','max',''],
		WP_specialist:      ['specialist','current',0],
		WP_mastery:			['mastery','current',0],
		SpellsCols:			3,
		MUSpellNo_table:	['spell-level',0],
		MUSpellNo_memable:	['-castable','current'],
		MUSpellNo_specialist:['-specialist','current'],
		MUSpellNo_misc:		['-misc','current'],
		PRSpellNo_table:	['spell-priest-level',0],
		PRSpellNo_memable:	['-castable','current'],
		PRSpellNo_wisdom:	['-wisdom','current'],
		PRSpellNo_misc:		['-misc','current'],
		Spells_table:       ['repeating_spells',false],
		Spells_name:        ['spellname','current'],
		Spells_speed:       ['casttime','current'],
		Spells_castValue:	['cast-value','current'],
		PowersBaseCol:      67,
		PowerRows:			9,
		PowersCols:         3,
		Powers_table:       ['repeating_spells',false],
		Powers_name:        ['spellname','current'],
		Powers_speed:       ['casttime','current'],
		MIRows:             100,
		Items_table:		['repeating_potions',0],
		Items_name:			['potion','current'],
		Items_speed:		['potion-speed','current'],
		Items_trueSpeed:	['potion-speed','max'],
		Armor_name:         ['armorname','current'],
		Armor_mod_none:     'noarmort',
		Armor_mod_leather:  't',
		Armor_mod_studded:  'armort',
		Equip_handedness:   ['handedness','current'],
		Equip_dancing:		['dancing-count','current'],
		Money_gold:         ['gold','current'],
		Money_silver:       ['silver','current'],
		Money_copper:       ['copper','current'],
		Timespent:			['timespent','current'],
		CharDay:			['in-game-day','current'],
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
	
	const tableIntro = Object.freeze({
		MELEE:['MW_',fields.MW_table],
		DMG:['Dmg_',fields.Dmg_table],
		RANGED:['RW_',fields.RW_table],
		AMMO:['Ammo_',fields.Ammo_table],
		WPROF:['WP_',fields.WP_table],
		MI:['Items_',fields.Items_table],
		SPELLS:['Spells_',fields.Spells_table],
		POWERS:['Powers_',fields.Powers_table],
		INHAND:['InHand_',fields.InHand_table],
		QUIVER:['Quiver_',fields.Quiver_table],
	});

	var handouts = Object.freeze({
	InitMaster_Help:	{name:'InitiativeMaster Help',
						 version:1.05,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">InitiativeMaster Help v1.05</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Initiative Master API</h1>'
							+'<p>This API supports initiative for RPGs using the Turn Order and the Tracker window.  The InitiativeMaster API provides functions dealing with all aspects of: managing how initiative is done; rolling for initiative; for "group" and "individual" initiative types providing Character action selection to determine the speed and number of attacks of weapons, the casting time of spells & the usage speed of magic items; supporting initiative for multiple attacks with one or multiple weapons per round; supporting and tracking actions that take multiple rounds; managing the resulting Turn Order; as well as performing the "End of Day" activity.  It works very closely with the <b>RoundMaster API</b> to the extent that InitiativeMaster cannot work without RoundMaster (though the reverse is possible).  InitiativeMaster also works closely with <b>AttackMaster API</b> and <b>MagicMaster API</b> and uses the data configured on the Character Sheet by these other APIs, although it can use manually completed Character Sheets once correctly configured.</p>'
							+'<h2>Syntax of InitiativeMaster calls</h2>'
							+'<p>The InitiativeMaster API is called using !init.</p>'
							+'<pre>!init --help</pre>'
							+'<p>Commands to be sent to the InitiativeMaster API must be preceded by two hyphens \'--\' as above for the --help command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!init --init [party-roll]|[foes-roll]</pre>'
							+'<p>If optional parameters are not to be included, but subsequent parameters are needed, just leave out the optional parameter but leave the vertical bars in, e.g.</p>'
							+'<pre>--init  | [foes-roll]</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!init --list-pcs  ALL  --init </pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).<\p>'
							+'<h2>Using Character Sheet Ability/Action buttons</h2>'
							+'<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>'
							+'<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: <b>--menu</b> and <b>--monmenu</b>.  From these, most other commands can be accessed.  If using the <b>CommandMaster API</b>, its character sheet setup finctions can be used to add all the necessary and/or desired Ability Macros and Token Action Buttons to any Character Sheet.</p>'
							+'<h2>Command Index</h2>'
							+'<p>All commands are preceded by !init unless otherwise stated.</p>'
							+'<h3>1. Manage Initiative type, rolls & party</h3>'
							+'<pre>--init [party-roll]|[foes-roll]<br>'
							+'--type < STANDARD / GROUP / INDIVIDUAL ></pre>'
							+'<h3>2. Show group / individual Initiative menus</h3>'
							+'<pre>--menu [token-id]<br>'
							+'--monmenu [token-id]</pre>'
							+'<h3>3. Show action-specific Initiative menus</h3>'
							+'<pre>--weapon [token-id]<br>'
							+'--monster [token-id]<br>'
							+'--complex [token-id]<br>'
							+'--muspell [token-id]<br>'
							+'--prspell [token-id]<br>'
							+'--power [token-id]<br>'
							+'--mibag [token-id]<br>'
							+'--thief [token-id]<br>'
							+'--other [token-id]</pre>'
							+'<h3>4. Maintain the Turn Order and Rounds</h3>'
							+'<pre>--maint<br>'
							+'--check-tracker<br>'
							+'--list-pcs  ALL / MAP / REPLACE / ADD</pre>'
							+'<h3>5. End of Day processing</h3>'
							+'<pre>--end-of-day [cost]</pre>'
							+'<h3>6. Other commands</h3>'
							+'<pre>--help<br>'
							+'--handshake from | [cmd]<br>'
							+'--hsq from | [cmd]<br>'
							+'--hsr from | [cmd] | [TRUE/FALSE]<br>'
							+'--debug ON/OFF</pre>'
							+'<h3>7. How to use the InitiativeMaster API</h3>'
							+'<br>'
							+'<h2>Detail of Commands</h2>'
							+'<h3>1. Manage Initiative type, rolls & party</h3>'
							+'<h4>1.1 Manage the Initiative process</h4>'
							+'<pre>--init [party-roll]|[foes-roll]</pre>'
							+'<p>DM Only command.  Takes an optional dice roll result for the Party, and an optional dice roll result for the foes.</p>'
							+'<p>This command displays a chat menu to specify:</p>'
							+'<ul>'
							+'	<li>the type of initiative to do (standard, group or individual),</li>'
							+'	<li>the initiative rolls for the Party and the Foes (for standard and group initiative),</li>'
							+'	<li>who is in the Party,</li>'
							+'	<li>to check if everyone has selected their action for the next round (for group and individual initiative),</li>'
							+'	<li>and whether to show this menu automatically as each new round starts.</li></ul>'
							+'<p>The different types of AD&D2e Initiative process are explained in the DMG p55, and consist of "standard", "group", and "individual":</p>'
							+'<table>'
							+'	<tr><th scope="row">Standard:</th><td>the Party and the Foes (DM) each roll 1d10, and all of whichever gets the lowest roll goes first.  The system supports taking the two rolls, and putting entries in the Turn Order for all defined Party members, and one entry for the Foes.</td></tr>'
							+'	<tr><th scope="row">Group:</th><td>the Party and the Foes (DM) each roll 1d10, and then all Party members and all Foes choose what actions they will perform during the next round.  The speed/casting time of the Character\'s / Foes selected action will then be added to the relevant roll to define the Character\'s / Foes initiative(s) which are added to the Turn Order.</td></tr>'
							+'	<tr><th scope="row">Individual:</th><td>each individual Character & Foe chooses what action they will do each round, and the speed/casting time of that action is added to an individual system-rolled 1d10 for that Character / Foe resulting in each Character\'s initiative(s) which are all added to the Turn Order.</td></tr>'
							+'</table>'
							+'<p>The type of initiative selected persists between game sessions.</p>'
							+'<p>Who is in the party can be defined by using API Buttons on the menu to do one of: search all maps in the Campaign for tokens controlled by Players; search just the map the Players are on for tokens controlled by Players; select a number of tokens on any map and add them to the list; or replace the whole list with the selected tokens.</p>'
							+'<p>Another API button checks to see if the Turn Order contains entries for every token listed as being in the Party, i.e. that everybody has selected their actions for the next round.</p>'
							+'<p>This menu can appear automatically as each completed round finishes if <b>RoundMaster API</b> is managing the Turn Order and Rounds.  This is useful for standard and group initiative, as the first thing that needs to happen is for the Party & Foe initiative dice rolls to be entered.  It is less useful for this menu to appear for individual initiative, and it can be turned off with an API Button on the menu.</p>'
							+'<h4>1.2 Set the type of Initiative being used in the Campaign</h4>'
							+'<pre>--type < STANDARD / GROUP / INDIVIDUAL ></pre>'
							+'<p>Takes a mandatory initiative type which must be one of those shown.</p>'
							+'<p>This command sets the initiative type to the specified type without bringing up the complete --init menu.  The type of initiative specified persists between game sessions.</p>'
							+'<br>'
							+'<h3>2. Show Group / Individual initiative action selection menus</h3>'
							+'<h4>2.1 Display a menu of possible actions for the selected Character / NPC</h4>'
							+'<pre>--menu [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>This command displays a chat menu of buttons for types of action that the Character / NPC / creature can perform.  Each of these buttons may take the Player to a more detailed list of specific action buttons.  Selecting any of the buttons will add the speed/casting time and correct number of instances of the selected action to the group or individual initiative dice roll (1d10) and enter the result in the Turn Order using the <b>RoundMaster API</b> - \'individual\'-type initiative dice rolls are performed in the background by the API and there is currently no option for the Player to do the roll instead.  The system records the action selected and the speed of that action along with any modifiers as a message to display when the Character\'s / NPCs / creature\'s turn comes around.</p>'
							+'<p>For multiple actions per round, those subsequent to the first action with the same item have speeds in the Turn Order incremented from each other by the speed of the action: thus multiple attacks with a Longbow (2 per round, speed 8) after an initiative roll of 5 on a 1d10, will happen at priority 13 & 21.  For attacks by a Fighter with two weapons, such as a Longsword (sp 5) in their left hand and a Short sword (sp 3) in their right hand, after an initiative roll of 5, the Short sword will get a Turn Order priority of 8 and the Longsword 10 - that is they are consecutive not sequential.</p>'
							+'<p>See the individual menu explanations for more detail on each type of action.</p>'
							+'<h4>2.2 Display a menu of possible actions for the selected creature</h4>'
							+'<pre>--monmenu [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>This produces a slightly simpler form of the initiative action menu for creatures.  Otherwise, all actions result in similar processing as per the normal action selection.</p>'
							+'<p>If the creature is very simple (only uses the simple attack lines on the Monster tab of the AD&D2e Character Sheet), then it might be sensible to use the <b>--monster</b> command instead: see below.</p>'
							+'<br>'
							+'<h3>3. Action specific Initiative menus</h3>'
							+'<h4>3.1 Display initiative actions to attack with the weapons "in-hand"</h4>'
							+'<pre>--weapon [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a chat menu listing all the weapons that the Character / NPC / creature has "in-hand" (i.e. that are currently in the Weapon and Ranged tables), with additional options as appropriate to the Character Sheet.  Rogue class characters will get a "Backstab" option which will apply the Rogue backstab multiplier as appropriate.  Fighter & Rogue classes will get an option to choose two weapons (if there are two one-handed weapons in-hand) which presents the option of selecting a Primary and a Secondary weapon to do initiative for.  Weapons can be those typed into the Character Sheet weapons tables (see <i>RPGMaster CharSheet Setup</i> handout) or loaded using the <b>AttackMaster API</b> (see AttackMaster documentation).</p>'
							+'<p>If the Character / NPC / creature has Powers or Magic Items they can use, buttons also appear on the menu to go to the menus to select these instead of doing a weapon initiative - see the <b>--power</b> and <b>--mibag</b> commands.  There is also a button for "Other" actions, such as Moving, Changing Weapon (which takes a round), doing nothing, or Player-specified actions - see the <b>--other</b> command.</p>'
							+'<h4>3.2 Display initiative actions for a simple creature to attack</h4>'
							+'<pre>--monster [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a chat menu only listing innate monster attacks from the Monster tab of the AD&D2e Character Sheet.</p>'
							+'<p>Creatures using the Innate Monster Attack fields on the AD&D2e Character Sheet Monster tab benefit from an extended syntax for entries in these fields: each field can take [&lt;Attack name&gt;,]&lt;damage dice roll&gt;[,&lt;speed&gt;] for example <code>Claw,1d8,2</code> and <code>Sword+1,2d4+1,5</code>.  These will result in possible initiative actions for that creature for <b>Claw</b> and <b>Sword+1</b>.  If Attack Name is omitted, the dice roll is displayed as the action name instead.  If the speed is omitted, the Innate attack speed field value is used instead.  The speed will then be used to calculate the Turn Order priority.</p>'
							+'<h4>3.3 Display initiative actions for a weapon-wielding creature to attack</h4>'
							+'<pre>--complex [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a more complex monster attack menu, with both "Innate" attacks from the Monster tab as well as weapon attacks from the Character tab weapons tables (the API does not use the recently introduced Weapon table for Monsters on the Monster tab so that the <b>AttackMaster API</b> only has to deal with one set of tables) - see 3.1 above for entering weapons and 3.2 for setting up monster attacks.  If the creature has powers or magic items, it will also offer action menu buttons for those.  The selected attack or weapon speed will then be used to calculate the Turn Order priority.</p>'
							+'<h4>3.4 Display initiative actions for Wizard spells</h4>'
							+'<pre>--muspell [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a menu of Wizard spells that the Character / NPC has memorised (see the <b>MagicMaster API</b> documentation for memorising spells, or see <i>RPGMaster CharSheet Setup</i> handout for entering spells manually).  Any spell that is still memorised can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.</p>'
							+'<h4>3.5 Display initiative actions for Priest spells</h4>'
							+'<pre>--prspell [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a menu of Priest spells that the Character / NPC has memorised (see the <b>MagicMaster API</b> documentation for memorising spells, or see <i>RPGMaster CharSheet Setup</i> handout for entering spells manually).  Any spell that is still memorised can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.<p>'
							+'<h4>3.6 Display initiative actions for powers</h4>'
							+'<pre>--power [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a menu of Powers that the Character / NPC has been granted (see the MagicMaster API documentation for managing powers, or see <i>RPGMaster CharSheet Setup</i> handout for entering powers manually).  Any power that has not been consumed can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.</p>'
							+'<h4>3.7 Display initiative actions for Magic Items</h4>'
							+'<pre>--mibag [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a menu of Magic Items and non-magical equipment that the Character / NPC / creature has on their person - that is in the Item table (by default, the Potions table on the AD&D2e character sheet): see the Character Sheet Setup handout, or the <b>MagicMaster API</b> documentation for information on Items.  Selecting an item for initiative uses the speed of action of that item to calculate the Turn Order priority.</p>'
							+'<h4>3.8 Display initiative actions for Thieves</h4>'
							+'<pre>--thief [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a menu of Thievish actions (with current percentage proficiencies of each).  Selecting one for initiative uses the speed of action of that item to calculate the Turn Order priority.</p>'
							+'<h4>3.9 Display other actions </h4>'
							+'<pre>--other [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a menu of other (non-attacking) actions that the Character / NPC / creature can take, namely: Moving (speed 0 as it is an innate ability); Changing Weapon (also speed 0 but takes all round); Doing Nothing (obviously speed 0); and one that allows the Player to enter a description and specify a speed for that action (presumably with the agreement of the DM).</p>'
							+'<br>'
							+'<h3>4. Maintain the Turn Order and Rounds</h3>'
							+'<h4>4.1 Display the DM\'s round maintenance menu</h4>'
							+'<pre>--maint</pre>'
							+'<p>DM Only command.  Does not take any parameters.</p>'
							+'<p>Displays a chat menu of action API Buttons to control the Turn Order Tracker window using commands sent to the RoundMaster API.  The key one is Start/Pause, which initialises RoundMaster and starts it managing the Turn Order, or pauses it so that stepping through the Turn Order does not trigger any RoundMaster actions (such as counting down token status timers or initiating Effects).  The full list of functions is:</p>'
							+'<table>'
							+'	<thead>'
							+'		<th scope="col">Maintenance Menu Button</th>'
							+'		<th scope="col">RoundMaster !rounds command (unless otherwise stated)</th>'
							+'		<th scope="col">Description</th>'
							+'	</thead>'
							+'	<tr><td>Start / Pause</td><td>--start</td><td>Starts / Pauses RoundMaster functioning</td></tr>'
							+'	<tr><td>Start Melee</td><td>--clearonround on<br>--clear</td><td>Causes the Turn Order to automatically clear at the end of each round (once all actions have completed) ready for Players to select actions for their Characters</td></tr>'
							+'	<tr><td>Stop Melee</td><td>--clearonround off</td><td>Stops the Turn Order from automatically clearing at the end of each round, so that the Turn Order is preserved.  Can be useful when just wanting to cycle around a list of Characters selected in the !init --init menu command and running "Standard" initiative.</td></tr>'
							+'	<tr><td>Re-start</td><td>--sort</td><td>Re-sorts the current Turn Order, effectively re-starting the round.  Useful if the DM accidentally starts the next round by moving the Turn Order on before all Players have completed their initiative actions - allow new actions to be selected and then use Re-start</td></tr>'
							+'	<tr><td>Set Round Number</td><td>--reset #</td><td>Sets the current Round number to #.  If # is larger than the current round, all token status counters will advance by the number of rounds difference, ending if they reach 0 with the consequential Effects triggered</td></tr>'
							+'	<tr><td>Clear Turn Order</td><td>--clear</td><td>Clears the Turn Order of all entries (except the round number)</td></tr>'
							+'	<tr><td>Remove Tokens from Tracker</td><td>--removefromtracker</td><td>Removes all the selected tokens from the Turn Order and the Tracker window.  Multiple tokens can be selected and removed all at the same time.</td></tr>'
							+'	<tr><td>Edit Selected Tokens</td><td>--edit</td><td>Displays the status markers on all the selected tokens, and offers options to edit or delete them.  The "spanner" icon edits the status, and the "bin" icon deletes it.</td></tr>'
							+'	<tr><td>Move Token Status</td><td>--moveStatus</td><td>For each of the selected tokens in turn, searches for tokens in the whole campaign with the same name and representing the same character sheet, and moves all existing statuses and markers from all the found tokens to the selected token (removing any duplicates).  This supports Players moving from one Roll20 map to another and, indeed, roundMaster detects page changes and automatically runs this command for all tokens on the new page controlled by the Players who have moved to the new page.</td></tr>'
							+'	<tr><td>Clean Selected Tokens</td><td>--clean</td><td>Drops all status markers from the selected token, whether they have associated effects or time left, or are just manually applied markers.  Useful when there might have been corruption, or everyone is just confused!  The token statuses still exist, and associated markers will be correctly rebuilt at the start of the next round or the next trigger event (but not manually added ones).</td></tr>'
							+'	<tr><td>Enable Long Rest for PCs</td><td>--end-of-day <cost></td><td>Run the normal initMaster end-of-day command</td></tr>'
							+'	<tr><td>Enable Long Rest for selected tokens</td><td>--enable-rest</td><td>Enable a long rest only for the characters / NPCs / creatures represented by the selected tokens.  See the MagicMaster API documentation for information on Long Rests</td></tr>'
							+'	<tr><td>Set Date</td><td> </td><td>Currently not implemented - future expansion</td></tr>'
							+'	<tr><td>Set Campaign</td><td> </td><td>Currently not implemented - future expansion</td></tr>'
							+'	<tr><td>Update Selected Tokens</td><td>!cmd --abilities</td><td>Use the <b>CommandMaster API</b> function (if loaded) to setup and maintain Character ability action buttons, weapon proficiencies, spell books & granted powers, saving throws, token "bar & circle" assignment etc.  See CommandMaster API documentation on the --abilities command.</td></tr>'
							+'	<tr><td>Emergency Stop!</td><td>--stop</td><td>After confirmation, performs a Full Stop and re-start of the RoundMaster API, dropping all internal tables of statuses & effects, token markers, timers etc.  <b><u>Use with care!</u></b></td></tr>'
							+'</table>'
							+'<h4>4.2 Display those characters that have not yet had initiative actions selected</h4>'
							+'<pre>--check-tracker</pre>'
							+'<p>DM Only command.  Does not take any parameters.</p>'
							+'<p>Uses the Player Character name list created & maintained in the <b>--init</b> menu or with the <b>--list-pcs</b> command, and checks that all of the Character\'s named have completed initiative selection to the point where their token name is in the Turn Order at least once, and appears in the Tracker window.  Names those that have not in a message to the DM, or states that initiative is complete.</p>'
							+'<h4>4.3 Change the list of characters in the Party</h4>'
							+'<pre>--list-pcs < ALL / MAP / REPLACE / ADD ></pre>'
							+'<p>DM Only command.  Takes a specifier for the tokens to have in the Player Character list which must be one of those listed.</p>'
							+'<p>Updates the internally held list of Characters that are controlled by Players (and others that the DM can add at will).  This list is displayed on the <b>--init</b> menu, and is used by <b>--check-tracker</b> and <b>--end-of-day</b> commands.  The list persists between sessions of game-play.  The following parameters have the following effects:</p>'
							+'<table>'
							+'	<tr><th scope="row">all:</th><td>looks across all tokens in the campaign and creates a new list composed of those representing Character Sheets controlled by a Player (standard Roll20 Character Sheet functionality - refer to the Help Centre for information on setting Players to control Character Sheets and their tokens).</td></tr>'
							+'	<tr><th scope="row">map:</th><td>creates a new list that only has Characters represented by tokens on the current Player map that are controlled by Players.  (See Roll20 Help Centre on how to select the current Player map).</td></tr>'
							+'	<tr><th scope="row">replace:</th><td>creates a new list including all the currently selected token(s) (whomever controls them), and no others.</td></tr>'
							+'	<tr><th scope="row">add:</th><td>adds the currently selected token(s) (whomever controls them) to the existing list leaving all the others unchanged.</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>5. End of Day processing</h3>'
							+'<pre>--end-of-day [ASK/ASKTOREST/OVERNIGHT/REST/SET/FOES]|[=][cost]</pre>'
							+'<p>DM Only command.  Takes an optional type of rest (which, if provided, must be one of those shown - defaults to ASK) and an optional cost parameter, optionally preceded by an \'=\' character.  If cost is not provided, it defaults to that previously set with SET and/or \'=\'.</p>'
							+'<p>This command performs the "End-of-Day" processing for the campaign.  This consists of enabling Long Rests for all Characters / NPCs / creatures to regain their spells and powers, and for recharging Magic Items to regain their charges (see <b>MagicMaster API</b> documentation for information on Long Rests).  It also removes spent ammunition from quivers that has not been recovered, as it is assumed to be lost, broken or taken by other creatures during the period of the night (see <b>AttackMaster API</b> documentation about recovery of ammunition and its loss over a Long Rest).</p>'
							+'<p>Each day can cost or earn the members of the Party money, perhaps depending on where they stay overnight, whether they eat just camp rations or lavish meals, use an Inn and drink too much, or earn money doing a job.  The optional <i>cost</i> parameter can be set to a positive cost to the party which will be deducted from every member, or a negative quantity which will be earned (a negative cost).</p>'
							+'<table>'
							+'	<tr><th scope="row">ASK:</th><td>If no rest type is supplied, or ASK is used, the DM is asked to confirm if they wish the cost to be deducted from/earned by all the Characters listed.  If No is selected, nothing is deducted or earned.  The system then sets flags to allow Players to perform a Rest command on their characters (see <b>MagicMaster API</b>).</td></tr>'
							+'	<tr><th scope="row">ASKTOREST:</th><td>Asks the DM to confirm the cost/earnings in the same way as ASK, but then automatically performs the MagicMaster API --rest command for each character in the party, and the Players do not need to do so.</td></tr>'
							+'	<tr><th scope="row">OVERNIGHT:</th><td>Applies the cost to the Party members without asking and enables them to rest (they have to do the rest themselves).  If cost (or the previously set default cost) is not a number (e.g. a Roll Query), asks if a charge is to be made.</td></tr>'
							+'	<tr><th scope="row">REST:</th><td>Does the same as OVERNIGHT, but automatically runs the MagicMaster API --rest command for all characters in the party, and the Players do not need to do so.</td></tr>'
							+'	<tr><th scope="row">FOES:</th><td>Does the same as OVERNIGHT, but for all NPCs and Monsters, allowing them to rest.</td></tr>'
							+'	<tr><th scope="row">SET:</th><td>If the rest type is SET and/or there is an \'=\' before the cost, will not run the "End-of-Day", but instead will set the standard cost for each night if no cost parameter is given when other commands are used.  If the \'=\' is followed by a Roll Query (see Roll20 Help Centre for information on Roll Queries), the Roll Query will be run each time the –end-of-day command is run without a cost parameter, allowing (for instance) the DM to select from a list of possible daily costs or earnings.  However, remember to replace the \'?\' at the start of the Roll Query with &amp;#63; so that the Roll Query does not run when it is passed in to be set.  Other characters can be substituted as follows:</td></tr>'
							+'</table>'
							+'<table>'
							+'	<tr><th scope="row">Character</th><td>?</td><td>[</td><td>]</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td></tr>'
							+'	<tr><th scope="row">Substitute</th><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td>`</td><td>~</td><td>&amp;#124;</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td></tr>'
							+'	<tr><th scope="row">Alternative</th><td>\\ques</td><td>\\lbrak</td><td>\\rbrak</td><td>\\at</td><td>\\dash</td><td>\\vbar</td><td>\\clon</td><td>\\amp</td><td>\\lbrc</td><td>\\rbrc</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>6. Other Commands</h3>'
							+'<h4>6.1 Display help on these commands</h4>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h4>6.2 Handshake with other APIs</h4>'
							+'<pre>--hsq from|[command]<br>'
							+'--handshake from|[command]</pre>'
							+'<p>Either form performs a handshake with another API, whose call (without the \'!\') is specified as the <i>from</i> paramater in the command parameters.  The response from InitiativeMaster is always an --hsr command.  The command calls the from API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>'
							+'<p>Received:	<i>!init --hsq magic</i><br>'
							+'Response:	<i>!magic --hsr init</i></p>'
							+'Which means the MagicMaster API has requested a handshake with InitiativeMaster to see if it is loaded, and InitiativeMaster has responded, proving it is running and taking commands.</p>'
							+'<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the command string parameter is added, where command is the RoundMaster command (the \'--\' text without the \'--\').  This will respond with a true/false response: e.g.</p>'
							+'<p>Received:	<i>!init --handshake attk|monster</i><br>'
							+'Response:	<i>!attk --hsr init|monster|true</i></p>'
							+'<h4>6.3 Switch on or off Debug mode</h4>'
							+'<pre>--debug (ON/OFF)</pre>'
							+'<p>Takes one mandatory argument which should be ON or OFF.</p>'
							+'<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player - so the DM or a technical advisor can play as a Player and see the debugging messages.</p>'
							+'<br>'
							+'<h2>7. How Initiative Master API works</h2>'
							+'<p>The Initiative Master API ("InitMaster") provides commands that allow the DM to set and manage the type of initiative to be used in the campaign, and for Players to undertake initiative rolls.  The API uses data on the Character Sheet represented by a selected token to show menus of actions that can be taken: these commands are often added to the Character Sheet as Ability Macros that can be shown as Token Actions (see Roll20 Help Centre for how to achieve this, or the <b>CommandMaster API</b> documentation).  The API displays resulting Turn Order token names with action priorities in the Turn Order Tracker window (standard Roll20 functionality - see Roll20 documentation & Help Centre).</p>'
							+'<p><b>Note:</b> Use the <b>--maint</b> command to display the Maintenance Menu and start the <b>RoundMaster API</b> using the <b>Start / Pause</b> button (at the top of the displayed menu) before using the Turn Order Tracker.  The top entry in the Turn Order Tracker window should change from showing a "Stopped" symbol, and change to a "Play".'
							+'<p>The API (as with other APIs in the RPGMaster series) is distributed configured for the AD&D 2e Character Sheet from Peter B.  The API can be easily modified to work with other character sheets by changing the fields object in the API to map the internal names for fields to the character sheet field names - see the <b>RPGMaster CharSheet Setup handout</b>.</p>'
							+'<h3>Specifying a token</h3>'
							+'<p>Most of the InitiativeMaster API commands need to know the token_id of the token that represents the character, NPC or creature that is to be acted upon.  This ID can be specified in two possible ways:</p>'
							+'<ol><li>explicitly in the command call using either a literal Roll20 token ID or using @{selected|token_id} or @{target|token_id} in the command string to read the token_id of a selected token on the map window,<br>or</li>'
							+'<li>by having a token selected on the map window, not specifying the token_id in the command call, and allowing the API to discover the selected token_id.</li></ol>'
							+'<p>In either case, if more than one token is selected at the time of the call then using either @{selected|token_id} to specify the token in the command call, or allowing the command to find a selected token, is likely (but not guaranteed) to take the first token that was selected.  To avoid ambiguity, it is generally recommended to make command calls with only one token selected on the map window.</p>'
							+'<h3>Types of Initiative System</h3>'
							+'<p>The API supports AD&D2e methods for initiative: "standard", "group" and "individual", selectable by the DM in-game and changeable during game play, if desired.</p>'
							+'<p>"Standard" AD&D2e initiative just requires a "Party" initiative dice roll and a "Foe" initiative dice roll to be entered, and the Turn Order entries are set appropriately.  For "Group" initiative, the same rolls are entered but, in addition, the action of each character / NPC / creature (each token) taking part specifies what actions they are going to perform that round and the speed of that action is added to the relevant group dice roll to create the Turn Order priority for that token.  For "Individual" initiative, each character / NPC / creature makes its own individual dice roll as well as specifying their action, with the individual dice roll and speed of action being combined to give the Turn Order priority.</p>'
							+'<h3>Monster Attack Initiatives</h3>'
							+'<p>Creatures using the Innate Monster Attack fields on the AD&D2e Character Sheet Monster tab benefit from an extended syntax for entries in these fields: each field can take</p>'
							+'<pre>[Attack name],damage dice roll,[speed] </pre>'
							+'<p>for example <code>Claw,1d8,2</code> and <code>Sword+1,2d4+1,5</code>.  These will result in possible initiative actions for that creature for <b>Claw</b> and <b>Sword+1</b>.  If Attack Name is omitted, the dice roll is displayed as the action name instead.  If the Speed is omitted, the Innate attack speed field value is used instead.</p>'
							+'<h3>Effect of Magic on Initiative</h3>'
							+'<p>The system can take into account various modifiers applied by spells and/or magic items (e.g. Haste and Slow spells), and the spell, power & magic item macros provided with the <b>MagicMaster API</b> use this functionality when used in conjunction with <b>RoundMaster</b> <i>Effects</i>.  <b>The Character Sheet Setup handout</b> states which Character Sheet fields to enter the modifiers into in order for them to be taken into account.</p>'
							+'<h3>Multi-attack Initiatives</h3>'
							+'<p>The system can also create multiple initiative turns for weapons that achieve multiple attacks per round, like bows and daggers, as well as by the class, level and proficiency of the character or any combination of the three as per the AD&D rules, including 3 attacks per 2 rounds, or 5 per 2 (more attacks on even-numbered rounds).  Also Fighter and Rogue classes using 2 weapons are catered for, even with those weapons possibly having multiple attacks themselves - the weapon specified by the character as the Primary will achieve its multiple attacks, whereas the secondary weapon will only get 1 attack, as per the rules for multiple attacks.</p>'
							+'<h3>Multi-round Initiatives</h3>'
							+'<p>Multi-round initiatives are also supported e.g. for spells like Chant which takes 2 rounds.  Any Character Sheet entry that has a speed (<b>note:</b> action speed only, not action plus initiative roll) of longer than 10 segments (1/10ths of a round), when chosen by a player, will add an entry for that action not only in the current round but also in the following and subsequent rounds as appropriate.  Each new round, when they select to specify an initiative action (e.g. using <b>!init --menu</b>) the Player of that character (or the DM for a Foe) is asked if they want to continue with the action or has it been interrupted: if interrupted or stopped by choice the player can choose another action for that character, otherwise the "carried forward" action is added to the tracker. </p>'
							+'<p><b>Note:</b> the Player (or DM) must still select to do initiative each round for this to happen.</p>'
							+'<h3>Changing an Initiative Action</h3>'
							+'<p>If using "Group" or "Individual" initiative and a Player has completed selecting an initiative action for a Character (or the DM for a Foe) and changes their mind about what they are doing before the DM starts the round, the Player can select the token and rerun the relevant command (use the relevant token action button) to do initiative again (presuming the DM\'s agreement).  The system will warn the Player that initiative has already been completed for the Character and present a new button to redo initiative if the Player wants to (this is so that accidental selection of the redo command is prevented) - all entries for the token name will be removed from the Turn Order and the relevant menus presented again to the Player.</p>'
							+'<p>Selecting any particular action for initiative <i><u>does not</u> force that to be the action the Player takes on their turn</i>.  When that Character\'s turn comes up in the Turn Order, a message is displayed to all Players and the DM stating the action that was selected for initiative for that token (DM-controlled NPCs & creatures only display to the Players that it is their turn, not what they are doing, while the DM gets a full action message).  The Player can then take that action, or do something else entirely (presumably with the DM\'s agreement) for instance if circumstances have changed (e.g. the foe being attacked has died prior to an "Attack" action).</p>'
							+'<h3>In Summary</h3>'
							+'<p>InitMaster manages the whole of this process seamlessly, and in addition will support actions that result in more than one Turn Order entry (such as firing a bow that can make two shots per round), automatically taking into account character class to allow two-weapon attack actions, supporting initiative for "dancing" weapons (when used with the AttackMaster and MagicMaster APIs), and other complex aspects of initiative.</p>'
							+'<p>The easiest way to set up Character Sheets for InitMaster operation is by using the rest of the APIs in the Master series:</p>'
							+'<p><b>RoundMaster API</b> is required for the operation of InitMaster.  It manages all aspects of interaction with the Turn Order Tracker window in Roll20, and the management of token statuses and Effects.</p>'
							+'<p><b>CommandMaster API</b> will add the relevant DM Macro Bar buttons, and Token Action Buttons to a Character Sheet for all commands needed for each of the APIs, including InitiativeMaster.</p>'
							+'<p><b>MagicMaster API</b> will support entering the correct data on the sheet for all sorts of weapons, magic items, spells and powers, through looting chests & bodies, learning & memorising spells and being granted powers.  Initiative actions can then use these items with the correct action speed.</p>'
							+'<p><b>AttackMaster API</b> will use the data from MagicMaster to arm the character by taking weapons and/or shields "in hand".  Initiative actions can then be selected for attacks with these weapons using the correct speed modifiers.  AttackMaster will also support making attacks with all the relevant modifiers, changing the weapons in-hand, managing ammunition for ranged weapons, selecting the correct range for ranged weapons and applying the right modifiers, supporting magical weapons and artifacts, and also dealing with armour, armour classes & saves.</p>'
							+'<p>Token setup for use with the Master series of APIs is simple (to almost non-existent) and explained in the Character Sheet Setup handout.</p>'
							+'</div>',
						},
	RPGCS_Setup:		{name:'RPGMaster CharSheet Setup',
						 version:1.06,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">RPGMaster CharSheet Setup v1.06</span>'
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
							+'<p>The <i>internal_api_name</i> <b><u>must not be altered!</b></u> Doing so will cause the system not to work.  However, the <i>sheet_field_name</i> and <i>field_attribute</i> can be altered to match any character sheet.</p>'
							+'<p>Table names are slightly different: always have an <i>internal_api_name</i> ending in \'_table\' and their definition specifies the repeating table name and the index of the starting row of the table or -1 for a static field as the 1<sup>st</sup> row.</p>'
							+'<p><i>Internal_api_table: [sheet_repeating_table_name,starting_index]</i></p>'
							+'<p>An example is:</p>'
							+'<pre>MW_table:[\'repeating_weapons\',0],</pre>'
							+'<p>The <i>internal_api_table</i> <b><u>must not be altered!</b></u> Doing so will cause the system not to work.  However, the <i>sheet_repeating_table_name</i> and <i>starting_index</i> can be altered to match any character sheet.</p>'
							+'<p>Each character sheet must have repeating tables to hold weapons, ammo and magic items, as well as other data.  By default, melee weapons \'in hand\' are held in sections of the repeating_weapons table, melee weapon damage in the repeating_weapons-damage table, ranged weapons in the repeating_weapons2 table, ammo in the repeating_ammo table, and magic items are held in the repeating_potions table.  The table management system provided by the API expands and writes to repeating attributes automatically, and the DM & Players do not need to worry about altering or updating any of these tables on the Character Sheet. </p>'
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
		noChar: '/w gm &{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInit Master}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot participate in Initiative.}}',
		doneInit: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ has already completed initiative for this round}}{{desc1=If you want to change ^^tname^^\'s initiative, press [Redo Initiative](!init --redo ^^tid^^)}}',
        redoMsg: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=Initiative has been re-enabled for ^^tname^^.  You can now select something else for them to do.}}',
		noMUspellbook: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have a Wizard\'s Spellbook, and so cannot plan to cast Magic User spells.  If you need one, talk to the High Wizard (or perhaps the DM)}}',
		noPRspellbook: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have a Priest\'s Spellbook, and so cannot plan to cast Clerical spells.  If you need one, talk to the Arch-Cleric (or perhaps the DM)}}',
		noPowers: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have any Powers, and so cannot start powering up.  If you want some, you better get on the good side of your god (or perhaps the DM)}}',
		noMIBag: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have Magic Item Bag, and thus no magic items.  You can go and buy one, and fill it on your next campaign.}}',
		notThief: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ is not a thief.  You can try these skills if you want - everyone has at least a small chance of success...  but perhaps prepare for a long stint staying at the local lord\'s pleasure!}}',
		heavyArmour: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ realises that the armour they are wearing prevents them from using any thievish skills.  You will have to remove it, and then perhaps you might have a chance.  Change the armour type on the Rogue tab of your Character Sheet.}}',
		stdInit: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=Currently, the game is running on Standard AD&D Initiative rules, so it is a Party initiative roll.  You do not need to select an action.}}',
		notYet: '&{template:'+fields.defaultTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=The game is running on Group AD&D Initiative rules, so the Party need to make an initiative roll before you add the speed of what you are doing.  You cannot yet select an action yet.}}',
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
		// RED: indicate if 2nd weapon of 2-weapon attacks are restricted to 1 attack
		twoWeapSingleAttk: true,
		// RED: characters that can use 2-weapon attacks
		twoWeapFighter: true,
		twoWeapMage: false,
		twoWeapPriest: false,
		twoWeapRogue: true,
		twoWeapPsion: false,
	};
	
	var apiCommands = {};
	
	const reIgnore = /[\s\-\_]*/gi;
	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;
	
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
		dark_button: '"display: inline-block; background-color: darkgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
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

	/**
	 * Init
	 */
	var init = function() {
		if (!state.initMaster)
			{state.initMaster = {};}
		if (_.isUndefined(state.initMaster.debug))
		    {state.initMaster.debug = false;}
		if (!state.initMaster.round)
			{state.initMaster.round = 1;}
		if (_.isUndefined(state.initMaster.changedRound))
			{state.initMaster.changedRound = false;}
		if (!state.initMaster.dailyCost)
			{state.initMaster.dailyCost = '?{What costs?|Camping 1sp,0.1|Inn D&B&B 2gp,2|Inn B&B 1gp,1|Set other amount,?{How many GP - fractions OK?&#125;|No charge,0}';}
		// RED: v1.035 get a list of Player-controlled characters
		// to use where API calls act on all PCs.
		if (!state.initMaster.playerChars)
			{state.initMaster.playerChars = getPlayerCharList();}
		// RED: v1.035 support individual, group, or standard 
		// initiative types
		if (!state.initMaster.initType)
			{state.initMaster.initType = 'individual';}
		if (_.isUndefined(state.initMaster.playerRoll))
			{state.initMaster.playerRoll = '';}
		if (_.isUndefined(state.initMaster.dmRoll))
			{state.initMaster.dmRoll = '';}
		if (_.isUndefined(state.initMaster.dispRollOnInit))
			{state.initMaster.dispRollOnInit = true;}
			
		// RED: v1.036 setup in-game-day as a MoneyMaster
		// state value in anticipation of the API
		
		if (!state.moneyMaster)
			{state.moneyMaster = {};}
		if (_.isUndefined(state.moneyMaster.inGameDay))
			{state.moneyMaster.inGameDay = 0;}
			
		// RED: v1.037 register with commandMaster
		setTimeout( cmdMasterRegister, 3000 );
		
		// RED: v1.036 create help handouts from stored data
		setTimeout( () => updateHandouts(true,findTheGM()),3000);

		// RED: v1.036 handshake with RoundMaster API
		setTimeout( () => issueHandshakeQuery('rounds'),8000);
		
	    // RED: log the version of the API Script

		log(`-=> initMaster v${version} <=-`);
		return;
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


	/*
	 * Function to replace special characters in a string
	 */
	 
	var parseStr=function(str){
		return replacers.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
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
				sendError('initMaster not able to save to '+tableObj.table[0]+' table row '+r);
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
			throw {name:'magicMaster Error',message:'undefined addTable fieldGroup'};
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
//					    log('Not updating handout '+obj.name+' as is already version '+obj.version);
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

	/**
	 * Issue a handshake request to check if another API or 
	 * specific API command is present
	 **/
	 
	var issueHandshakeQuery = function( api, cmd ) {
		sendDebug('InitMaster issuing handshake to '+api+((cmd && cmd.length) ? (' for command '+cmd) : ''));
		var handshake = '!'+api+' --hsq init'+((cmd && cmd.length) ? ('|'+cmd) : '');
		sendInitAPI(handshake);
		return;
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
	
	/*
	 * Create a list of currently Player-controlled Characters
	 */
	 
	var getPlayerCharList = function( page=false, monster=false ) {
		
		var charID,charCS,controlledBy,
			nameList = [new Set()];
			
		nameList =  _.chain(filterObjs(function(obj) {
					if ((obj.get('type') !== 'graphic') || (obj.get('subtype') !== 'token')) return false;
					if (!(charID = obj.get('represents')).length > 0) return false;
					if (page && (page !== obj.get('pageid'))) return false;
					charCS = getObj('character',charID);
					if (!charCS) return false;
					controlledBy = charCS.get('controlledby');
					if (controlledBy.toLowerCase() == 'all') return false;
					return  (monster != (controlledBy.length > 0)) ;
				}))
				.map(function(obj) {return {name:obj.get('name'),id:obj.id};})
				.uniq(false,obj => obj.name)
				.sortBy('name')
				.value();
		return nameList;
	}
	
	/**
	* Set the initiative variables when a button has been selected
	* Push the previous selection into the max of each representing a second weapon
	**/

	var setInitVars = function( charCS, args, property ) {
	
		if (_.isUndefined(property)) {
			property = 'current';
		}
		
		if (property == 'current') {
			setAttr( charCS, fields.Weapon_2ndNum, attrLookup( charCS, fields.Weapon_num ) );
			setAttr( charCS, fields.Init_2ndAction, attrLookup( charCS, fields.Init_action ) );
			setAttr( charCS, fields.Init_2ndSpeed, attrLookup( charCS, fields.Init_speed ) );
			setAttr( charCS, fields.Init_2ndActNum, attrLookup( charCS, fields.Init_actNum ) );
			setAttr( charCS, fields.Init_2ndAttacks, (attrLookup( charCS, fields.Init_attacks ) || 1));
			setAttr( charCS, fields.Init_2ndPreInit, 0 );
			// RED: v1.013 added init_2H to hold a flag = 1 for 2-handed weapon initiative, 
			// 0 for 1-handed weapon initiative, and -1 for any other initiative
			setAttr( charCS, fields.Init_2nd2Hweapon, attrLookup( charCS, fields.Init_2Hweapon ) );
		}
		
		setAttr( charCS, [fields.Weapon_num[0], property], args[2]);
		setAttr( charCS, [fields.Init_action[0], property], args[3]);
		setAttr( charCS, [fields.Init_speed[0], property], args[4]);
		setAttr( charCS, [fields.Init_actNum[0], property], args[5]);
		setAttr( charCS, [fields.Init_preInit[0], property], args[6]);
		setAttr( charCS, [fields.Init_2Hweapon[0], property], args[7]);
		setAttr( charCS, [fields.Init_attacks[0], property], (args[9] || 1));
		setAttr( charCS, [fields.Init_chosen[0], property], 1);
		
		log('setInitVars: setting Init_attacks to '+args[9]);
	};

	/*
	 * Check for a character's proficiency with a weapon type
	 */

	var proficient = function( charCS, wname, wt, wst ) {
		
        wname = wname ? wname.toLowerCase().replace(reIgnore,'') : '';
        wt = wt ? wt.toLowerCase().replace(reIgnore,'') : '';
        wst = wst ? wst.toLowerCase().replace(reIgnore,'') : '';
        
		var i = fields.WP_table[1],
			prof = -1,
			WeaponProfs = getTable( charCS, {},          fields.WP_table, fields.WP_name ),
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
		return prof;
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
			monIndex = args[3],
			monAttk1 = attrLookup( charCS, fields.Monster_dmg1 ),
			monAttk2 = attrLookup( charCS, fields.Monster_dmg2 ),
			monAttk3 = attrLookup( charCS, fields.Monster_dmg3 ),
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
				+ '|-1'
				+ '|'+monIndex;

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
			attackCount,
			attacks,
			twoHanded,
			tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3],
			buildCall = '',
			WeaponTables = getAllTables( charCS, 'MELEE' ).MELEE;

		if (rowIndex == undefined || refIndex == undefined) {
			sendDebug( 'handleInitMW: indexes undefined' );
			sendError( 'Invalid button' );
			return;
		}

		weaponName = (tableLookup( WeaponTables, fields.MW_name, refIndex ) || '');
		weapSpeed = (tableLookup( WeaponTables, fields.MW_speed, refIndex) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		attackNum = (tableLookup( WeaponTables, fields.MW_noAttks, refIndex ) || 1);
		// RED: v1.044 changed attackNum calculation to deal with numbers of attacks that are not multiples/divisors of 2
		attackCount = tableLookup( WeaponTables, fields.MW_attkCount, refIndex );
		if (!attackCount) attackCount = 0;
		attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
		attacks = Math.floor( attackCount );
		WeaponTables = tableSet( WeaponTables, fields.MW_attkCount, refIndex, (attackCount-attacks) );
		// -------- end of change ------
		twoHanded = (tableLookup( WeaponTables, fields.MW_twoHanded, refIndex ) || 0);

		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + (charType == CharSheet.MONSTER ? MenuType.COMPLEX : MenuType.WEAPON)
				+ '|' + tokenID
				+ '|' + rowIndex
				+ '|with their ' + weaponName
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*' + attackNum
				+ '|0'
				+ '|' + twoHanded
				+ '|'
				+ '|' + attacks;
				
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
			WeaponTables = getAllTables( charCS, 'MELEE' ).MELEE,
			weaponName, weapSpeed,
			speedMult, attackNum,
			attackCount, attacks,
			buildCall;
			
		if (rowIndex > 0) {
			speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		    if (command != BT.RW_PRIME) {
    			weaponName = (tableLookup( WeaponTables, fields.MW_name, refIndex ) || '');
    			weapSpeed = (tableLookup( WeaponTables, fields.MW_speed, refIndex ) || 0);
    			attackNum = (tableLookup( WeaponTables, fields.MW_noAttks, refIndex ) || 1);
				// RED: v1.044 changed attackNum calculation to deal with numbers of attacks that are not multiples/divisors of 2
				attackCount = (tableLookup( WeaponTables, fields.MW_attkCount, refIndex ) || 0);
				attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
				attacks = Math.floor( attackCount );
				WeaponTables = tableSet( WeaponTables, fields.MW_attkCount, refIndex, (attackCount-attacks) );
				// -------- end of change ------
            } else {
    			weaponName = (tableLookup( charCS, fields.RW_name, refIndex ) || '');
    			weapSpeed = (tableLookup( charCS, fields.RW_speed, refIndex ) || 0);
    			attackNum = (tableLookup( charCS, fields.RW_noAttks, refIndex ) || 1);
				// RED: v1.044 changed attackNum calculation to deal with numbers of attacks that are not multiples/divisors of 2
				attackCount = (tableLookup( charCS, fields.RW_attkCount, refIndex ) || 0);
				attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
				attacks = Math.floor( attackCount );
				WeaponTables = tableSet( WeaponTables, fields.RW_attkCount, refIndex, (attackCount-attacks) );
				// -------- end of change ------
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
					+ '|0'
					+ '|' + attacks;
					
		} else {
			buildCall = '!init --buildMenu ' + MenuType.MW_MELEE
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '| '
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|0'
					+ '|0';
		}
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
			WeaponTables = getAllTables( charCS, 'MELEE' ).MELEE,
			weapon, weaponRef,
			weaponName, weapSpeed,
			speedMult, attackNum,
			attackCount, attacks,
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
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		if (command != BT.RW_SECOND) {
			weaponName = (tableLookup( WeaponTables, fields.MW_name, weaponRef ) || '');
			weapSpeed = (tableLookup( WeaponTables, fields.MW_speed, weaponRef ) || 0);
			attackNum = (tableLookup( WeaponTables, fields.MW_noAttks, weaponRef ) || 1);
			// RED: v1.044 changed attackNum calculation to deal with numbers of attacks that are not multiples/divisors of 2
			attackCount = (tableLookup( WeaponTables, fields.MW_attkCount, refIndex ) || 0);
			attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
			attacks = Math.floor( attackCount );
			WeaponTables = tableSet( WeaponTables, fields.MW_attkCount, refIndex, (attackCount-attacks) );
			// -------- end of change ------
		} else {
			weaponName = (tableLookup( WeaponTables, fields.RW_name, weaponRef ) || '');
			weapSpeed = (tableLookup( WeaponTables, fields.RW_speed, weaponRef ) || 0);
			attackNum = (tableLookup( WeaponTables, fields.RW_noAttks, weaponRef ) || 1);
			// RED: v1.044 changed attackNum calculation to deal with numbers of attacks that are not multiples/divisors of 2
			attackCount = (tableLookup( WeaponTables, fields.RW_attkCount, refIndex ) || 0);
			attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
			attacks = Math.floor( attackCount );
			WeaponTables = tableSet( WeaponTables, fields.RW_attkCount, refIndex, (attackCount-attacks) );
			// -------- end of change ------
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
				+ '|' + (rowIndex2 > 0 ? rowIndex : rowIndex2)
				+ '|' + attacks;
				
		sendInitAPI( buildCall );
		
		return;
	}
		
	
	/**
	* Handle the results of pressing a ranged weapon initiative button
	* if 'monster' is true, use a complex monster menu
	**/
	
	var handleInitRW = function( charType, charCS, args ) {

		var tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3];

		if (rowIndex == undefined || refIndex == undefined) {
			sendDebug( 'handleInitRW: indexes undefined' );
			sendError( 'Invalid button' );
			return;
		}
		
		var	WeaponTables = getAllTables( charCS, 'RANGED' ).RANGED,
			weaponName = (tableLookup( WeaponTables, fields.RW_name, refIndex ) || ''),
			weaponType = (tableLookup( WeaponTables, fields.RW_type, refIndex ) || ''),
			weapSpeed = (tableLookup( WeaponTables, fields.RW_speed, refIndex ) || 0),
			speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1),
			attackNum = (tableLookup( WeaponTables, fields.RW_noAttks, refIndex ) || 1),
			weapSpecial = (proficient( charCS, weaponName, weaponType, '' ) > 0) ? 1 : 0,
			twoHanded = (tableLookup( WeaponTables, fields.MW_twoHanded, refIndex ) || 0),
			buildCall = '',
			attackCount, attacks;
			
		// RED: v1.044 changed attackNum calculation to deal with numbers of attacks that are not multiples/divisors of 2
		attackCount = (tableLookup( WeaponTables, fields.RW_attkCount, refIndex ) || 0);
		attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
		attacks = Math.floor( attackCount );
		WeaponTables = tableSet( WeaponTables, fields.RW_attkCount, refIndex, (attackCount-attacks) );
		// -------- end of change ------
		
		// RED: v1.013 tacked the 2-handed weapon status to the end of the --buildmenu call

		buildCall = '!init --buildMenu ' + (charType == CharSheet.MONSTER ? MenuType.COMPLEX : MenuType.WEAPON)
				+ '|' + tokenID
				+ '|' + rowIndex
				+ '|with their ' + weaponName
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*' + attackNum
				+ '|' + weapSpecial
				+ '|' + twoHanded
				+ '|0'
				+ '|' + attacks;

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
	
		var repItemField,
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

//		repItemField = fields.Items_table[0] + '_$' + rowIndex + '_';

		itemName = attrLookup( charCS, fields.Items_name, fields.Items_table, rowIndex );
		itemSpeed = (attrLookup( charCS, fields.Items_trueSpeed, fields.Items_table, rowIndex ) || attrLookup( charCS, fields.Items_speed, fields.Items_table, rowIndex ) || 0);

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
			
//		setAmmoFlags( charCS );
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
			row = parseInt(fields.MW_table[1]),
			entry = 0,
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

		WeaponTable = getTable( charCS, {}, fields.MW_table, fields.MW_name );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_speed );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_noAttks );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_attkCount );
		WeaponTable = getTable( charCS, WeaponTable, fields.MW_table, fields.MW_dancing );
		
		do {
			weapon = tableLookup( WeaponTable, fields.MW_name, row, false );
			dancing = parseInt(tableLookup( WeaponTable, fields.MW_dancing, row ));
			
			if (_.isUndefined(weapon)) {break;}
			if (weapon != '-' && (!onlyDancing || (!isNaN(dancing) && dancing != 0))) {
				weapons.push(weapon);
				speed = parseInt(tableLookup( WeaponTable, fields.MW_speed, row, '0' ));
				actionNum = tableLookup( WeaponTable, fields.MW_noAttks, row, '1' );
				attackCount = tableLookup( WeaponTable, fields.MW_attkCount, row, '0' );
				attackCount = eval( attackCount + '+(' + speedMult + '*' + actionNum + ')' );
				actions = Math.floor( attackCount );
				tableSet( WeaponTable, fields.MW_attkCount, row, (attackCount-actions));
				log('handleAllWeapons: setting MW_attkCount to '+tableLookup(WeaponTable, fields.MW_attkCount, row));
				initiative = base+speed+init_Mod;
				attacks.push({init:initiative,ignore:0,action:('with their '+(!!dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				for (i=2; i<=actions; i++) {
					initiative += speed;
					attacks.push({init:initiative,ignore:0,action:('with their '+(!!dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				}
				entry++;
			}
			row++;
		} while (entry < hands+noDancing);
		
		WeaponTable = getTable( charCS, {}, fields.RW_table, fields.RW_name );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_speed );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_noAttks );
		WeaponTable = getTable( charCS, WeaponTable, fields.RW_table, fields.RW_dancing );
		row = fields.RW_table[1];
		
		do {
			weapon = tableLookup( WeaponTable, fields.RW_name, row, false );
			dancing = parseInt(tableLookup( WeaponTable, fields.RW_dancing, row ));
			if (_.isUndefined(weapon)) {break;}
			if (weapon != '-' && !weapons.includes(weapon) && (!onlyDancing || (!isNaN(dancing) && dancing != 0))) {

				speed = parseInt(tableLookup( WeaponTable, fields.RW_speed, row, '0' ));
				actionNum = tableLookup( WeaponTable, fields.RW_noAttks, row, '1' );
				attackCount = tableLookup( WeaponTable, fields.RW_attkCount, row, '0' );
				attackCount = eval( attackCount + '+(' + speedMult + '*' + actionNum + ')' );
				actions = Math.floor( attackCount );
				tableSet( WeaponTable, fields.RW_attkCount, row, (attackCount-actions));
				initiative = base+speed+init_Mod;
				attacks.push({init:initiative,ignore:0,action:('with their '+(dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				for (i=2; i<=actions; i++) {
					initiative += speed;
					attacks.push({init:initiative,ignore:0,action:('with their '+(dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
				}
				entry++;
			}
			row++;
		} while (entry < hands+noDancing);
		
		if (entry > 0) {
			setAttr( charCS, fields.Prev_round, 0 );
			setAttr( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], state.initMaster.round, null, null, null, true );
			buildMenu( initMenu, charCS, MenuState.DISABLED, args );
		}
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
			base = parseInt(state.initMaster.initType == 'group' ? state.initMaster.playerRoll : randomInteger(10)),
			actions, initiative, count;

		if (state.initMaster.initType == 'standard') {
			sendParsedMsg( 'InitMaster', Init_Messages.stdInit, tokenID );
			return;
		} else if (state.initMaster.initType == 'group' && isNaN(state.initMaster.playerRoll)) {
			sendParsedMsg( 'InitMaster', Init_Messages.notYet, tokenID );
			return;
		}

		if (_.isUndefined(rowIndex)) {
			sendDebug( 'handleInitSubmit: index undefined' );
			sendError( 'Invalid button' );
			return;
		}
		
		var charName = charCS.get('name'),
			tokenName = getObj( 'graphic', tokenID ).get('name'),
			submitVal = attrLookup( charCS, fields.Init_submitVal ),
			content = fields.roundMaster;


		if (rowIndex < 0 && !submitVal) {
			sendParsedMsg( 'InitMaster', Init_Messages.doneInit, tokenID );
			return;
		}
		
		actions = handleAllWeapons( senderId, charCS, args, base, (rowIndex != -2) );

		if (rowIndex == 0 && (initMenu == MenuType.COMPLEX || initMenu == MenuType.SIMPLE)) {
			buildMenu( initMenu, charCS, MenuState.DISABLED, args );
			var monAttk1 = (attrLookup( charCS, fields.Monster_dmg1 ) || '').split(','),
				monAttk2 = (attrLookup( charCS, fields.Monster_dmg2 ) || '').split(','),
				monAttk3 = (attrLookup( charCS, fields.Monster_dmg3 ) || '').split(','),
				monSpeed = parseInt(attrLookup( charCS, fields.Monster_speed ) || 0),
				monSpeed1 = parseInt((monAttk1.length > 2) ? monAttk1[2] : monSpeed) || monSpeed,
				monSpeed2 = parseInt((monAttk2.length > 2) ? monAttk2[2] : monSpeed) || monSpeed,
				monSpeed3 = parseInt((monAttk3.length > 2) ? monAttk3[2] : monSpeed) || monSpeed,
				monMod = parseInt(attrLookup( charCS, fields.initMod )) || 0;
				
			actions = [new Set()];
			setAttr( charCS, fields.Prev_round, 0 );
			setAttr( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], state.initMaster.round, null, null, null, true );
			setAttr( charCS, fields.Init_chosen, 0 );
			setAttr( charCS, fields.Init_done, -1 );
			setAttr( charCS, fields.Init_submitVal, 0 );
			setAttr( charCS, fields.Init_speed, monSpeed1 );
			setAttr( charCS, fields.Init_carry, (monSpeed1 > 10 ? 1 : 0) );
			setAttr( charCS, fields.Init_carrySpeed, (monSpeed1 - 10) );
			setAttr( charCS, fields.Init_carryAction, 'with their '+monAttk1[0] );
			setAttr( charCS, fields.Init_carryActNum, 1 );
			setAttr( charCS, fields.Init_carryWeapNum, -1 );
			setAttr( charCS, fields.Init_carryPreInit, 0 );
			setAttr( charCS, fields.Init_carry2H, 0 );

			if (monAttk1[0].length && (rowIndex2 == 0 || rowIndex2 == 1)) actions.push({init:(base+monSpeed1+monMod),ignore:0,action:('with their '+monAttk1[0]),msg:(' rate 1, speed '+monSpeed1+', modifier '+monMod)});
			if (monAttk2[0].length && (rowIndex2 == 0 || rowIndex2 == 2)) actions.push({init:(base+monSpeed2+monMod),ignore:0,action:('with their '+monAttk2[0]),msg:(' rate 1, speed '+monSpeed2+', modifier '+monMod)});
			if (monAttk3[0].length && (rowIndex2 == 0 || rowIndex2 == 3)) actions.push({init:(base+monSpeed3+monMod),ignore:0,action:('with their '+monAttk3[0]),msg:(' rate 1, speed '+monSpeed3+', modifier '+monMod)});

		} else if (rowIndex != -2) {
			var	fighterClass = (attrLookup( charCS, fields.Fighter_class ) || ''),
				init_Mod = parseInt(attrLookup( charCS, fields.initMod )) || 0,
				init_Mult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1),1),
				init_Done = parseInt(attrLookup( charCS, fields.Init_done ), 10),
				init_speed = parseInt(attrLookup( charCS, fields.Init_speed )) || 0,
				init_action = attrLookup( charCS, fields.Init_action ),
				init_actionnum = attrLookup( charCS, fields.Init_actNum ),
				init_attacks = parseInt(attrLookup( charCS, fields.Init_attacks ) || 1),
				init_preinit = attrLookup( charCS, fields.Init_preInit ),
				weapno = attrLookup( charCS, fields.Weapon_num ),
				preinit = eval( init_preinit ),
				twoHanded = attrLookup( charCS, fields.Init_2Hweapon ),
				round = state.initMaster.round;
				
			if (initMenu == MenuType.TWOWEAPONS) {
				
				var init_speed2 = parseInt(attrLookup( charCS, fields.Init_2ndSpeed )) || 0,
					init_action2 = attrLookup( charCS, fields.Init_2ndAction ),
					init_actionnum2 = flags.twoWeapSingleAttk ? (init_Mult + '*1') : attrLookup( charCS, fields.Init_2ndActNum ),
					init_attacks2 = (flags.twoWeapSingleAttk ? Math.min(parseInt(attrLookup( charCS, fields.Init_2ndAttacks ) || 1),1) : parseInt(attrLookup( charCS, fields.Init_2ndAttacks ) || 1)),
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
			setAttr( charCS, fields.Init_carryAttacks, init_attacks );
			setAttr( charCS, fields.Init_carryWeapNum, weapno );
			setAttr( charCS, fields.Init_carryPreInit, init_preinit );
			setAttr( charCS, fields.Init_carry2H, twoHanded );
			
			if (init_Done) {
				return;
			}
			
			buildMenu( initMenu, charCS, MenuState.DISABLED, args );
			if (initMenu != MenuType.TWOWEAPONS) {
				setAttr( charCS, fields.Weapon_num, -1 );
				setAttr( charCS, fields.Weapon_2ndNum, -1 );
			}

			if (initMenu != MenuType.TWOWEAPONS || init_speed2 >= init_speed) {
				
				if (init_attacks >= 1) {
					initiative = (preinit ? 0 : base+init_speed+init_Mod);
					actions.push({init:initiative,ignore:0,action:init_action,msg:(' rate '+init_actionnum+', speed '+init_speed+', modifier '+init_Mod)});
				}
				if (initMenu == MenuType.TWOWEAPONS && (init_attacks2 >= 1)) {
					initiative = base + init_speed2 + init_Mod;
					actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+', modifier '+init_Mod)});
				}
				
			} else {
				
				if (init_attacks2 >= 1) {
					initiative = (preinit2 ? 0 : base+init_speed2+init_Mod);
					actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+', modifier '+init_Mod)});
				}
				if (init_attacks >= 1) {
					initiative = base+init_speed+init_Mod;
					actions.push({init:initiative,ignore:0,action:init_action,msg:(' rate '+init_actionnum+', speed '+init_speed+', modifier '+init_Mod)});
				}
				
			}
					
			for( let i=2; i<=init_attacks; i++ ) {
				initiative = base + (i * (init_speed)) + init_Mod;
				actions.push({init:initiative,ignore:0,action:init_action,msg:''});
			}
			
			if (initMenu == MenuType.TWOWEAPONS) {
//				if (actionNum2 > 2 && (actionNum2 > 4 || !(actionNum2 % 2) || !(round % 2))) {
//					initiative = base + (2*init_speed) + init_Mod;
//					actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+', modifier '+init_Mod)});
//				}

				for( let i=2; i<=init_attacks2; i++ ) {
					initiative = base + (i * (init_speed2)) + init_Mod;
					actions.push({init:initiative,ignore:0,action:init_action2,msg:''});
				}
			}
		}
		// RED: v1.023 changed InitSubmit to use an array for all actions
		// RED: v1.027 changed InitSubmit to work with new roundMaster, just passing unmodified rolls
		// RED: v1.044 changed InitSubmit to pop up a message if calculations result in no actions
		
		count = 0;
		actions = _.sortBy( actions, 'init' );
		_.each( actions, function(act) {
			if (_.isUndefined(act.init)) {return;}
			count++;
			content += ' --addtotracker '+tokenName+'|'+tokenID+'|'+act.init+'|'+act.ignore+'|'+act.action+'|'+act.msg;
			
		});
		content += ' --removefromtracker '+tokenName+'|'+tokenID+'|'+(actions.length);
		sendInitAPI( content, senderId );
		
		if (!count) {
			content = '&{template:'+fields.defaultTemplate+'}{{name='+tokenName+'\'s Initiative}}'
					+ '{{desc='+tokenName+'\'s action '+init_action+' at a rate of '+init_actionnum+' does not result in an action this round}}';
			sendResponse( charCS, content );
		};
		
/*		RED: v1.034 AttackMaster (v1.030) now uses the items the
		            player says are in-hand and worn to determine 
		            overall armour class, with a check requested 
		            by InitMaster on Initiative Submission
*/
		content = fields.attackMaster + ' --checkac ' + tokenID + '|Silent||' + senderId;
   		sendInitAPI( content, senderId );
	};

	/*
	 * Set up the shape of the spell book.  This is complicated due to
	 * the 2E sheet L5 MU Spells start out-of-sequence at column 70
	 */
	 
	var shapeSpellbook = function( charCS, isMU ) {

		var levelSpells = (isMU ? spellLevels.mu : spellLevels.pr);
	
		for (let i=1; i<=(isMU ? 9 : 7); i++) {
			if (isMU) {
				levelSpells[i].spells  = parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_memable[0],fields.MUSpellNo_memable[1]])||0);
				levelSpells[i].spells += parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_specialist[0],fields.MUSpellNo_specialist[1]])||0);
				levelSpells[i].spells += parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1]])||0);
			} else {
				levelSpells[i].spells  = parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_memable[0],fields.PRSpellNo_memable[1]])||0);
				levelSpells[i].spells += parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_wisdom[0],fields.PRSpellNo_wisdom[1]])||0);
				levelSpells[i].spells += parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1]])||0);
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
	 * Make monster attack buttons 
	 */
	 
	var makeMonAttkButtons = function( tokenID, charCS, charButton, monButton, submitted ) {
		
		var monAttk1 = attrLookup( charCS, fields.Monster_dmg1 ),
			monAttk2 = attrLookup( charCS, fields.Monster_dmg2 ),
			monAttk3 = attrLookup( charCS, fields.Monster_dmg3 ),
			content = '';
		
		if ((monAttk1 && monAttk2) || (monAttk1 && monAttk3) || (monAttk2 && monAttk3)) {
			content += ((0 == charButton && 0 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += 'All Innate Attks';
			content += (((0 == charButton && 0 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|0)\n');
		}
		if (monAttk1) {
			monAttk1 = monAttk1.split(',');
			content += ((0 == charButton && 1 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += 'Monster '+monAttk1[0];
			content += (((0 == charButton && 1 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|1)\n');
		}
		if (monAttk2) {
			monAttk2 = monAttk2.split(',');
			content += ((0 == charButton && 2 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += 'Monster '+monAttk2[0];
			content += (((0 == charButton && 2 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|2)\n');
		}
		if (monAttk3) {
			monAttk3 = monAttk3.split(',');
			content += ((0 == charButton && 3 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
			content += 'Monster '+monAttk3[0];
			content += (((0 == charButton && 3 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|3)\n');
		}
		
		return content;
	}

	
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
			if (_.isUndefined(weapName)) {break;}
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
			}
		}
		if (!header) {
			content += '\n';
		}
		if (dancingWeapons.length) {
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
			monButton = args[8],
			tokenName,
            content;
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Complex Monster Attacks}}'
				+ '{{desc=**Innate weapons**\n';
				
		// add buttons for innate monster attack abilities using the monster initiative modifier
		
		content += makeMonAttkButtons( tokenID, charCS, charButton, monButton, submitted );

		if (complex) {
			content += '\n'+makeWeaponButtons( tokenID, charButton, submitted, BT.MON_MELEE, BT.MON_RANGED );
			content += MIandPowers( tokenID, submitted );			
		}
		content	+= '}}'
				+ '{{desc1=' + otherActions( (complex ? MenuType.COMPLEX : MenuType.SIMPLE), tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + (complex ? MenuType.COMPLEX : MenuType.SIMPLE) + '|' + monButton + ')')
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
			monButton = args[8],
            curToken = getObj( 'graphic', tokenID ),
            baseMW = fields.MW_table[1],
            baseRW = fields.RW_table[1],
			tokenName,
			fighterLevel = parseInt(attrLookup( charCS, fields.Fighter_level ) || '0'),
			rogueLevel = parseInt(attrLookup( charCS, fields.Rogue_level ) || '0'),
			monsterHD = parseInt(attrLookup( charCS, fields.Monster_hitDice ) || '0'),
			monsterHPplus = parseInt(attrLookup( charCS, fields.Monster_hpExtra )) || 0,
			monsterIntField = attrLookup( charCS, fields.Monster_int ) || '',
			monsterIntNum = (monsterIntField.match(/\d+/)||["1"])[0],
			monsterInt = monsterIntField.toLowerCase().includes('non') ? 0 : monsterIntNum,
			monsterLevel = Math.ceil((monsterHD + Math.ceil(monsterHPplus/4)) / (monsterInt != 0 ? 1 : 2)),
			hands = parseInt(attrLookup( charCS, fields.Equip_handedness ) || 2 ),
			monAttks = parseInt(attrLookup( charCS, fields.Monster_attks ) || 0 ),
            weaponButtons,content;

        if (!curToken) {
            sendDebug( 'makeWeaponMenu: invalid tokenID' );
            sendError( 'Invalid initMaster argument' );
            return;
        }
            
		tokenName = curToken.get('name');
		
		weaponButtons = makeWeaponButtons( tokenID, -1, false, BT.MELEE, BT.RANGED, false, false );

		content = '&{template:'+fields.defaultTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
				+ '{{subtitle=Initiative for Weapon Attacks}}';
				
		if (weaponButtons && weaponButtons.split(']').length > 1) {
			if (fighterLevel || rogueLevel || (monsterLevel && monAttks > 1)) {
				let refIndex = (charButton%2) ? (baseMW==0?((charButton-1)/2):((charButton-3)/2)) : ((baseRW==0)?((charButton-2)/2):((charButton-4)/2))
				content += '{{Fighter\'s & Rogue\'s Option=';
				content += submitted ? '<span style=' + design.grey_button + '>' : '[';
				content += 'Two Weapons';
				content += (submitted) ? '</span>' : '](!init --button ' + BT.TWOWEAPONS + '|' + tokenID + '|' + charButton + '|' + refIndex + ')';
				content += '}}';
			}
			if (hands > 2 || monAttks > 1) {
				content += '{{Many Hands Option='
						+  (-2 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
						+  'All Weapons'
						+  (((-2 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.ALLWEAPONS + '|' + tokenID + '|' + -2 + '|' + -2 + ')')
						+  '}}';
			}
		}

		content += '{{desc=';
		
		content += makeMonAttkButtons( tokenID, charCS, charButton, monButton, submitted );

		content += makeWeaponButtons( tokenID, charButton, submitted, BT.MELEE, BT.RANGED );

		content += MIandPowers( tokenID, submitted ) + '}}'
				+ '{{desc1=' + otherActions( MenuType.WEAPON, tokenID, charButton, submitted ) + '}}'
				+ '{{desc2=Select action above, then '
				+ (((charButton == -1) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Submit'
				+ (((charButton == -1) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.WEAPON + '|' + monButton + ')')
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
			
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
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
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
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
				highlight = submitted ? design.dark_button : ((charButton == w) ? design.green_button : design.selected_button);
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
				dancingWeapons += '<span style='+(submitted ? design.dark_button : design.green_button)+'>'+weapName+'</span>';
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
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What Spell is ' + tokenName + ' planning to cast?}}'
				+ '{{subtitle=Initiative for ' + spellCasterType + ' spells}}'
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
					qty = parseInt(attrLookup( charCS, fields.Spells_castValue, fields.Spells_table, r, c ) || 0);
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
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What Magic Item is ' + tokenName + ' planning to use?}}'
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
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What Power is ' + tokenName + ' planning to use?}}'
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
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=What Thieving ability is ' + tokenName + ' planning to use?}}'
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
		    content = '&{template:'+fields.defaultTemplate+'}{{name=What does ' + tokenName + ' want to do?}}'
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
		content += '[Use Thieving Skills](!init --thief ' + tokenID + ')}}'
				+  '{{desc1='+otherActions( MenuType.OTHER, tokenID, 0, false )+'}}';
				
				
//		[Other Actions](!init --other ' + tokenID + ')}}';
		
		sendResponse( charCS, content );
		return;
	}
	
	var makeOtherMenu = function( charCS, submitted, args ) {
	
		var tokenID = args[1],
			charButton = args[2],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
    		dancers =  makeWeaponButtons( tokenID, -1, submitted, '', '', true, true, false ),

    		content = '&{template:'+fields.defaultTemplate+'}{{name=What does ' + tokenName + ' want to do?}}'
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
					+ '<div style="font-weight: bold;">!init --help</div>'
					+ '<li style="padding-left: 10px;">Display this message</li><br>'
					+ '<div style="font-weight: bold;">!init --init [party-roll]|[foes-roll]</div>'
					+ '<li style="padding-left: 10px;">Set initiative parameters and enter dice rolls</li><br>'
					+ '<div style="font-weight: bold;">!init --type < STANDARD / GROUP / INDIVIDUAL ></div>'
					+ '<li style="padding-left: 10px;">Set the type of initiative rules to use</li><br>'
					+ '<div style="font-weight: bold;">!init --list-pcs < ALL / MAP / REPLACE / ADD ></div>'
					+ '<li style="padding-left: 10px;">Finds all / adds to / replaces current list of party member tokens</li><br>'
					+ '<div style="font-weight: bold;">!init --check-tracker</div>'
					+ '<li style="padding-left: 10px;">Checks if all party member tokens have completed initiative actions</li><br>'
					+ '<div style="font-weight: bold;">!init --end-of-day [ASK / ASKTOREST / OVERNIGHT / REST / SET / FOES]|[=][cost]</div>'
					+ '<li style="padding-left: 10px;">Performs End of Day processing, or sets overnight costs/days earnings</li><br>'
					+ '<div style="font-weight: bold;">!init --maint [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu to control RounMaster and the Turn Order Tracker</li><br>'
					+ '<div style="font-weight: bold;">!init --menu [token-id]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of actions the selected Character/NPC token can take in the next round</li><br>'
					+ '<div style="font-weight: bold;">!init --monmenu [token-id]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of actions the selected Creature token can take in the next round</li><br>'
					+ '<div style="font-weight: bold;">!init --complex [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of attack actions that a complex monster can do as the action for the round</li><br>'
					+ '<div style="font-weight: bold;">!init --weapon [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of weapons to attack with as the action for the round</li><br>'
					+ '<div style="font-weight: bold;">!init --muspell [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of wizard spells to cast as the action for the round</li><br>'
					+ '<div style="font-weight: bold;">!init --prspell [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of priest spells to cast as the action for the round</li><br>'
					+ '<div style="font-weight: bold;">!init --power [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of powers that could be used as the action for the round</li><br>'
					+ '<div style="font-weight: bold;">!init --mibag [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of magic items to use as the action for the round</li><br>'
					+ '<div style="font-weight: bold;">!init --thief [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display a menu of thieving skills to use as the action for the round</li><br>'
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
/*	 
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
			content = '&{template:'+fields.defaultTemplate+'}{{name=Weapons check for '+charName+'}}{{desc=Melee Weapons\n'
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
   
    var doRedo = function( args, selected ) {
        
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
		doInitMenu(args,selected,MenuType.MENU);
        
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

		content = '&{template:'+fields.defaultTemplate+'}'
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

	var doInitMenu = function( args, selected, initMenu ) {
		if (!initMenu)
			{return;}

		if (!args) args = [];
			
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doInitMenu: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		
		var tokenID = args[0],
			curToken = getObj( 'graphic', tokenID ),
			charID, charCS, foe,
			initRoll, init_carry;

		if (!(charCS = getCharacter( tokenID ))) {
			sendDebug( 'doInitMenu: invalid character' );
			sendError( 'Invalid initMaster attributes' );
			return;
		}
		
		foe = charCS.get('controlledby').length == 0;
		initRoll = foe ? state.initMaster.dmRoll : state.initMaster.playerRoll;
		
		if (state.initMaster.initType == 'standard') {
			sendParsedMsg( 'InitMaster', Init_Messages.stdInit, tokenID );
			return;
		} else if (state.initMaster.initType == 'group' && isNaN(initRoll)) {
			sendParsedMsg( 'InitMaster', Init_Messages.notYet, tokenID );
			return;
		}

		
		var content = '',
		    charName = charCS.get('name'),
			tokenName = curToken.get('name'),
			changedRound = state.initMaster.changedRound,
			roundCounter = state.initMaster.round,
			prevRound = (attrLookup( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], true ) || 0),
			init_submitVal = (changedRound || (prevRound != roundCounter) ? 1 : 0 );
			
		setAttr( charCS, fields.Init_done, 0 );
		setAttr( charCS, fields.Init_submitVal, init_submitVal );

		if (!init_submitVal) {
			sendParsedMsg( 'InitMaster', Init_Messages.doneInit, tokenID );
			return;
		};
		
		init_carry = parseInt(attrLookup( charCS, fields.Init_carry ) || 0);
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
	 * Make the menu for managing initiative each round, including
	 * changing initiative type, changing the listed Player Characters,
	 * and rolling Initiative dice for Standard & Group 
	 * Initiative as per the AD&D2e DMG 
	 */
	 
	var doInitDiceRoll = function( args, msg='' ) {
		
		var playerRoll = args[0] || NaN,
			dmRoll = args[1] || NaN,
			cmd = (args[2] || '').toLowerCase(),
			argStr = (args[0] || '') + '|' + (args[1] || ''),
			charStr = _.pluck(state.initMaster.playerChars,'name').join(', '),
			content = '&{template:'+fields.defaultTemplate+'}'
					+ '{{name=Initiative Dice Rolls}}'
					+ '{{subtitle=For Standard & Group Initiative}}'
					+ (msg.length ? ('{{ ='+msg+'\n}}') : '' )
					+ '{{  =Current Player Characters\n**'+charStr+'**\n\n'
					+ '[PCs all maps](!init --list-pcs all|'+argStr+') [PCs this map](!init --list-pcs map|'+argStr+') '
					+ '[Add selected to PCs](!init --list-pcs add|'+argStr+') [Replace with selected PCs](!init --list-pcs replace|'+argStr+')}}'
					+ '{{   =Initiative type is currently\n'
					+ ((state.initMaster.initType == 'standard') ? ('<span style='+design.selected_button+'>Standard</span> ') : '[Standard](!init --type standard|'+argStr+') ')
					+ ((state.initMaster.initType == 'group') ? ('<span style='+design.selected_button+'>Group</span> ') : '[Group](!init --type group|'+argStr+') ')
					+ ((state.initMaster.initType == 'individual') ? ('<span style='+design.selected_button+'>Individual</span>') : '[Individual](!init --type individual|'+argStr+')')
					+ '}}';
		if (state.initMaster.initType !== 'individual') {
			state.initMaster.playerRoll = playerRoll;
			state.initMaster.dmRoll = dmRoll;
			content +='{{desc=Ask a Player to roll 1d10 and also roll 1d10 as DM, then enter the values below\n'
					+ '['+(isNaN(playerRoll) ? ('Enter Party Roll') : ('<span style='+design.selected_button+'>Party Rolled '+playerRoll+'</span>'))+'](!init --roll &#63;{Enter 1d10 roll|&#124;1&#124;2&#124;3&#124;4&#124;5&#124;6&#124;7&#124;8&#124;9&#124;10}|'+dmRoll+'|menu)'
					+ '['+(isNaN(dmRoll) ? ('Enter Foes Roll') : ('<span style='+design.selected_button+'>DM Rolled '+dmRoll+'</span>'))+'](!init --roll '+playerRoll+'|&#63;{Enter 1d10 roll|&#124;1&#124;2&#124;3&#124;4&#124;5&#124;6&#124;7&#124;8&#124;9&#124;10}|menu)'
					+ '}}';
		};
		if (state.initMaster.initType !== 'standard') {
			content +='{{desc1=Check that all Characters have specified what they are doing\n'
					+ '[Check Tracker Complete](!init --check-tracker roll|'+argStr+')}}';
		};
		if (cmd == 'disptoggle') state.initMaster.dispRollOnInit = !state.initMaster.dispRollOnInit;
		content += '{{desc2=['+(state.initMaster.dispRollOnInit ? ('<span style='+design.selected_button+'>Auto-displaying</span>') : 'Auto-display')+'](!init --init '+args[0]+'|'+args[1]+'|dispToggle) on new round}}';
		
		if (cmd != 'rounds' || state.initMaster.dispRollOnInit) sendFeedback( content );
		return;
	};
	
	/*
	 * Record an initiative roll made is doing 'standard'
	 * or 'group' initiative
	 */
	 
	var doInitRoll = function( args, isGM ) {
		
		var playerRoll = args[0] || '',
			dmRoll = args[1] || '',
			isMenu = ((args[2] || '') == 'menu');
			
		if (!isGM && !isNaN(state.initMaster.playerRoll)) return;

		if (!isMenu && isNaN(playerRoll)) {
			args[0] = state.initMaster.playerRoll;
		}
		if (!isNaN(args[0]) && state.initMaster.initType == 'standard') {
			_.each(state.initMaster.playerChars, obj => sendInitAPI( fields.roundMaster+' --addtotracker '+obj.name+'|'+obj.id+'|='+args[0]+'|last|doing an action' ));
		}

		if (!isMenu && (!isGM || isNaN(dmRoll))) {
			args[1] = state.initMaster.dmRoll;
		}
		if (!isNaN(args[1]) && state.initMaster.initType == 'standard') {
			sendInitAPI( fields.roundMaster+' --addtotracker Foes|-1|='+args[1]+'|last' );
		}
		doInitDiceRoll( args, 'Dice Roll made' );
		return;
	}

	/*
	 * Set the type of initiative to one of 'standard', 'group', or 'individual'
	 * See the DMG p55 for details of each type
	 */
	 
	var doSetInitType = function( args ) {
		
		if (!['standard','group','individual'].includes(args[0].toLowerCase())) {
			sendError('Invalid initMaster parameter');
			return;
		}

		var msg ='Set initiative type to '+args[0];
		
		state.initMaster.initType = args[0].toLowerCase();
		args.shift();
		if (args.length) {
			doInitDiceRoll( args, msg );
		} else {
			sendFeedback( msg );
		}
		return;
	}
	
	/*
	 * Modify the list of current player tokens which are
	 * used for checking if all characters have completed
	 * their initiative selections, and for "End of Day" processing.
	 */
	 
	var doCharList = function( args, selected ) {
		
		var listType = (args[0] || '').toLowerCase(),
			msg = '',
			curToken, charID, charCS;
		
		switch( listType ) {
		case 'all':
			state.initMaster.playerChars = getPlayerCharList();
			msg = 'All player-controlled tokens on all maps added to list';
			break;
		case 'map':
			state.initMaster.playerChars = getPlayerCharList(Campaign().get('playerpageid'));
			msg = 'All player-controlled tokens on the current map added to list';
			break;
		case 'replace':
			state.initMaster.playerChars = [new Set()];
			msg = 'List replaced.  ';
		case 'add':
			let list = state.initMaster.playerChars;
			_.each(selected, token => {
				if (!(curToken = getObj('graphic',token._id))) return;
				if (!((charID=curToken.get('represents')).length)) return;
				if (!(charCS = getObj('character',charID))) return;
				//				if (!(charCS.get('controlledby').length)) return;
				list.push({name:curToken.get('name'),id:curToken.id});
			});
			list = _.uniq(list,false,obj => obj.name);
			state.initMaster.playerChars = _.sortBy(list,'name');
			msg += 'Added all selected tokens';
			break;
		default:
			sendError('Invalid initMaster parameter');
		};
		args.shift();
		if (args.length) {
			doInitDiceRoll( args, msg );
		} else {
			sendFeedback( msg );
		}
		return;
	}

	/*
	 * Check the Tracker against the current list of Player Character
	 * tokens to see if they are all represented.  Display a list of those
	 * who have not yet completed initiative.
	 */
	 
	var doCheckTracker = function( args ) {
		
		var menuType = args[0] || '',
			turnorder = Campaign().get('turnorder'),
			tokenList = _.pluck(state.initMaster.playerChars,'name'),
			msg = '',
			token;
		if (!turnorder) 
			{return;} 
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);} 
		
		_.each(turnorder,turn => {
			token = getObj('graphic',turn.id);
			if (token) tokenList = _.without(tokenList,token.get('name'));
		});
		msg = (tokenList.length ? (tokenList.join(', ')+' have still to complete their initiative') : 'All Players have completed initiative');
		if (menuType.toLowerCase() === 'roll') {
			args.shift();
			doInitDiceRoll( args, msg );
		} else {
			let content = '&{template:'+fields.defaultTemplate+'}{{name=Check Tracker}}{{desc=' + msg +'}}'
					+ (tokenList.length ? '{{desc1=[Check again](!init --check-tracker)}}' : '');
			sendFeedback( content );
		}
		return;
	}

	/*
	 * Make the Maintenance Menu to control the Initiative functions 
	 * of the RoundMaster API.  InitMaster cannot function without 
	 * RoundMaster.  If RoundMaster is used by itself, the GM must 
	 * control it via chat commands or create their own menu
	 */
	 
	var doMaintMenu = function( args, selected ) {
		
		var tokenID = (selected && selected[0]) ? selected[0].id : '',
			tokenName = tokenID ? getObj('graphic',tokenID).get('name') : '';
		
		var	content = '&{template:'+fields.defaultTemplate+'}{{name=Initiative Maintenance Menu}}'
					+ '{{desc=**Turn Order**\n'
					+ '[Start/Pause](!rounds --start&#13;&#47;w gm Tracker started/paused)\n'
					+ '[Start Melee](!rounds --clearonround on --clear&#13;&#47;w gm Started Melee, Tracker will clear each round ready for next initiative)'
						+ '[Stop-melee](!rounds --clearonround off&#13;&#47;w gm Stopped Melee, Tracker will not clear each round, but will cycle round)'
						+ '[Re-start](!rounds --sort&#13;&#47;w gm Tracker restarted at start of current round)\n'
					+ '[Set round no.](!rounds --reset &#63;{To round number?|1}&#13;/w gm redTrackerJacker set to round &#63;{To round number?})'
						+ '[Clear Turn Order](!rounds --clear&#13;&#47;w gm Tracker cleared)'
						+ '[Remove Tokens from Tracker](!rounds --removefromtracker&#13;&#47;w gm Cleared all entries for selected tokens from the Tracker)\n'
					+ '**Status Markers**\n'
					+ 'Select one or multiple tokens\n'
					+ '[Edit Selected Tokens](!rounds --edit)[Move Token Status](!rounds --moveStatus)[Clean Selected Tokens](!rounds --clean)\n'
					+ '**End of Day**\n'
					+ '[Enable Long Rest for PCs](!init --end-of-day)\n'
					+ '[Enable Long Rest for selected tokens](!setattr --fb-from Spell system --fb-header Rest Enabled --fb-content _CHARNAME_ can now Rest --sel --timespent|1)\n'
//					+ '**Manage Campaign**\n'
//					+ '[Set Date](~Money-Gems-Exp|Set-Date)[Set Campaign](~Money-Gems-Exp|Set-Campaign)\n'
					+ '**Add or Change Action Buttons**\n'
					+ 'Select one or multiple tokens\n'
					+ '[Update Selected Tokens](!cmd --abilities)\n'
					+ '\n'
					+ '}}{{desc1=[Emergency Stop!](!&#13;&#47;w gm Are you sure you want to stop the Turn Order, and clear all status durations it is tracking?  [Yes, stop it](!rounds --stop&amp;#13;&amp;#47;w gm Tracking & Status Tracking terminated&#41;)}}';
					
		sendFeedback( content );
		return;
	}
	
	/*
	 * Ask the GM who has requested the End of Day 
	 * what to charge for an overnight stay and whether 
	 * to deduct the cost from Characters
	 */
	 
	var doEndOfDay = function( args ) {
		
		if (!args) args = [];
		
		var cmd = (args.shift() || 'ask').toLowerCase(),
			cost = args.join('|'),
			askToRest = cmd == 'asktorest',
			rest = cmd == 'rest',
			night = cmd == 'overnight',
			foes = cmd == 'foes',
			done = [],
			restStr = '',
			names, content;
			
		if (!['ask','asktorest','set','overnight','rest','foes'].includes(cmd)) {
			sendError('Invalid End of Day command.  Must be one of "Ask", "Set", "Overnight", "Rest" or "Foes"');
			return;
		}
			
		if (cost && cost[0] === '=') {
			cmd = 'set';
			cost = cost.slice(1);
		}
		if (cmd == 'set') {
			state.initMaster.dailyCost = parseStr(cost);
			sendFeedback('Daily cost set');
			return;
		}
		
		if (!cost) {
			cost = state.initMaster.dailyCost;
		};
		
		if ((night || rest) && isNaN(parseFloat(cost))) {
			askToRest = rest;
			rest = night = false;
		}

		names = _.pluck(state.initMaster.playerChars,'name');
		content = '&{template:'+fields.defaultTemplate+'}{{name=End of Day}}';
		if (rest || night || foes) {
			content += '{{desc=The following characters have '+(night ? 'overnighted ' : 'rested ')+(cost < 0 ? 'and earned ' : ' at a cost of ')+cost+' gp}}{{desc1=';
			if (foes) content += '\nAll NPCs & monsters';
			filterObjs( function(obj) {
				if (!names.length) return false;
				if (obj.get('type') != 'graphic' || obj.get('subtype') != 'token') return false;
				let charID = obj.get('represents');
				if (!charID || !charID.length) return false;
				let tokenName = obj.get('name');
				let charObj = getObj('character',charID);
				if (!charObj) return false;
				let charName = charObj.get('name');
				if (done.includes(charName)) return false;
				let party = names.includes(tokenName);
				if (!(foes ^ party)) return false;
				done.push(charName);
				if (rest) restStr += ' --rest '+obj.id+'|long';
				if (!foes) content += tokenName+'\n';
				if (night) {
					sendResponse( charObj,'&{template:'+fields.defaultTemplate+'}{{name=End of Day}}'
										+ '{{desc='+tokenName+' has made arrangements for the night '+(cost < 0 ? 'and today earned' : 'at a cost of')
										+ ' '+Math.abs(cost)+'gp, and can now rest}}');
				}
				names = _.without(names,tokenName);
				setAttr( charObj, fields.Timespent, '1' );
				setAttr( charObj, fields.CharDay, state.moneyMaster.inGameDay );
				cost = parseFloat(cost) || 0;
				if (cost == 0) return true;
				setAttr( charObj, fields.Money_copper, ((parseInt(attrLookup( charObj, fields.Money_copper )||0)||0) - Math.floor((cost*100)%10)) );
				setAttr( charObj, fields.Money_silver, ((parseInt(attrLookup( charObj, fields.Money_silver )||0)||0) - Math.floor((cost*10)%10)) );
				setAttr( charObj, fields.Money_gold, ((parseInt(attrLookup( charObj, fields.Money_gold )||0)||0) - Math.floor(cost)) );
				return true;
			});
			content += '}}';
			if (!foes) state.moneyMaster.inGameDay += 1;
		} else {
			if (isNaN(parseFloat(cost))) {
				content += '{{desc=Do you want charges / earnings applied to ';
			} else {
				content += '{{desc=Do you want to apply overnight cost of '+cost+'gp to ';
			}
			cmd = askToRest ? 'rest' : 'overnight';
			content += (names.join(', '))+' ? '
					+ '[Yes](!init --end-of-day '+cmd+'|'+cost+') '
					+ '[No](!init --end-of-day '+cmd+'|0)'
					+  '}}';
//					+ '\n!setattr --name '+names.join()+' --in-game-day|@{Money-Gems-Exp|today}'
		}
		sendFeedback( content );
		if (rest && restStr.length) sendInitAPI( '!magic '+restStr );
		return;
	}
	
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
			funcTrue = ['init','type','menu','monmenu','weapon','monster','complex','muspell','prspell','power','mibag','thief','other','maint','check-tracker','list-pcs',
						'end-of-day','help','debug'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr init'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');

		sendDebug('InitMaster recieved handshake query from '+from+((func && func.length) ? (' checking command '+func+' so responding '+funcTrue) : (' and responding')));
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
		sendDebug('InitMaster recieved handshake response from '+from+((func && func.length) ? (' that command '+func+' is '+funcTrue) : (' so it is loaded')));
		return;
	}

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
			roundsExists = apiCommands.rounds && apiCommands.rounds.exists,
			isGM = (playerIsGM(senderId) || state.initMaster.debug === senderId);
			
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
			sendDebug('Processing arg: '+arg);
			
			cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
			argString = (i<0 ? '' : arg.substring(i+1).trim());
			arg = argString.split('|');
			
			if (!(roundsExists || ['hsq','handshake','hsr','help','debug','isround','button'].includes(cmd))) {
				sendError('RoundMaster API not found.  InitMaster requires RoundMaster API to be loaded and enabled');
				return;
			}

			try {
				switch (cmd) {
				case 'maint':
					if (isGM) doMaintMenu(arg,selected);
					break;
				case 'init':
					if (isGM) doInitDiceRoll(arg);
					break;
				case 'roll':
					doInitRoll(arg,isGM);
					break;
				case 'type':
					if (isGM) doSetInitType(arg);
					break;
				case 'weapon':
        			doInitMenu(arg,selected,MenuType.WEAPON);
					break;
	    		case 'monster':
		    		doInitMenu(arg,selected,MenuType.SIMPLE);
					break;
	    		case 'complex':
		    		doInitMenu(arg,selected,MenuType.COMPLEX);
					break;
	    		case 'muspell':
		    		doInitMenu(arg,selected,MenuType.MUSPELL);
					break;
	    		case 'prspell':
		    		doInitMenu(arg,selected,MenuType.PRSPELL);
					break;
	    		case 'power':
		    		doInitMenu(arg,selected,MenuType.POWER);
					break;
	    		case 'mibag':
		    		doInitMenu(arg,selected,MenuType.MIBAG);
					break;
	    		case 'thief':
		    		doInitMenu(arg,selected,MenuType.THIEF);
					break;
	    		case 'other':
		    		doInitMenu(arg,selected,MenuType.OTHER);
					break;
	    		case 'menu':
		    		doInitMenu(arg,selected,MenuType.MENU);
					break;
	    		case 'monmenu':
		    		doInitMenu(arg,selected,MenuType.MONSTER_MENU);
					break;
	    		case 'redo':
		    		doRedo(arg,selected);
					break;
	    		case 'isround':
		    		if (isGM) doIsRound(arg);
					break;
				case 'end-of-day':
					if (isGM) doEndOfDay(arg);
					break;
				case 'check-tracker':
					if (isGM) doCheckTracker(arg);
					break;
				case 'list-pcs':
					if (isGM) doCharList(arg,selected);
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
					break;
				case 'button':
		    		doButton(arg,senderId);
					break;
	    		case 'buildmenu':
		    		doBuildMenu(arg);
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
	 * Register initMaster API with the
	 * commandMaster API
	 */
	 
	var cmdMasterRegister = function() {
		var cmd = fields.commandMaster
				+ ' --register Do_Initiative|Specify what character will do in current round and roll initiative|init|~~menu|`{selected|token_id}'
				+ ' --register Complex_Monster_Init|Specify initiative for a Monster that can have both inate and weapon attacks|init|~~monmenu|`{selected|token_id}'
				+ ' --register Monster_Init|Specify simple monster initiative|init|~~monster|`{selected|token_id}'
				+ ' --register Wizard_Spell_Init|Specify only wizard spell-casting initiative|init|~~muspell|`{selected|token_id}'
				+ ' --register Priest_Spell_Init|Specify only priest spell-casting initiative|init|~~prspell|`{selected|token_id}'
				+ ' --register Powers_Init|Specify only power use initiative|init|~~power|`{selected|token_id}'
				+ ' --register Magic_Item_Init|Specify only magic item use initiative|init|~~mibag|`{selected|token_id}'
				+ ' --register Thief_Init|Specify only thief skill initiative|init|~~thief|`{selected|token_id}'
				+ ' --register Other_Actions_Init|Specify only other actions initiative|init|~~other|`{selected|token_id}';
		sendInitAPI( cmd );
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
	initMaster.init(); 
	initMaster.registerAPI();
});