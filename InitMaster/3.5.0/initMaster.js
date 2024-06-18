// Github:   https://github.com/Roll20/roll20-api-scripts/tree/master/InitMaster
// Beta:     https://github.com/DameryDad/roll20-api-scripts/tree/InitMaster/InitMaster
// By:       Richard @ Damery
// Contact:  https://app.roll20.net/users/6497708/richard-at-damery

var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.InitMaster={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.InitMaster.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-8);}}

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
 * v0.1.0 to v2.3.3    See previous versions for earlier change log
 * v3.0.0  15/11/2023  Added support for other character sheets and game systems. Added support for 
 *                     magical multipliers to creature attacks. Fixed issues with magical multipliers
 *                     on off-hand weapon attacks. Implemented optional magical weapon plus effect
 *                     on weapon speed.
 * v3.1.0  02/02/2024  Reworked weapon/attack initiative to use the InHand table where possible (i.e.
 *                     if AttackMaster is loaded) for management of number of attacks per round and
 *                     other aspects that are common to a weapon as opposed to a Weapon Table entry.
 * v3.2.0  23/02/2024  Non-functional release to align release numbers.
 * v3.2.1  24/02/2024  Fix init-mod to allow slow to reduce number of attacks
 * v3.3.0  13/03/2024  Fix major bug with attacking with 2 weapons where one or both are ranged.
 *                     Change two-weapon attack initiative to select using weapon names, with an 
 *                     initial default of prime & off-hand. Change initiative to use weapon names
 *                     with initial defaults of prime hand, while still allowing user-defined
 *                     weapons. Added init-chosen|max attribute to char sheets if the initiative
 *                     roll is to be fixed to a specific value. Fixed speed calculations that include
 *                     multiply '*', divide '/' and parentheses '(' & ')'
 * v3.4.0  06/04/2024  Fixed creature initiative where creature has both innate and weapon attacks
 *                     Provide --check-init and --set-mods commands to add and remove modifiers to
 *                     initiative rolls and record them in a table, with a dialog to show to players.
 *                     Fixed detection of creature innate attacks where none exist, and count them
 *                     where correct count field not recorded. Made default attack initiative setting
 *                     more reliable. Adjusted "Set Round No." default to blank which defaults to +1.
 * v3.4.1  20/05/2024  Fixed error in initiative mods table when specifying =# for override mods.
 * v3.5.0  06/05/2024  Added 'fix' command to --set-mods which overrides the calculated initiative roll
 *                     for the specified character sheet. Set both the character sheet and token 
 *                     prev_round to be the round number held in the state variable.
 */

var initMaster = (function() {
	'use strict'; 
	var version = '3.5.0',
		author = 'Richerd @ Damery',
		pending = null;
    const lastUpdate = 1717750563;

	/*
	 * Define redirections for functions moved to the RPGMaster library
	 */
		
	const getRPGMap = (...a) => libRPGMaster.getRPGMap(...a);
	const setAttr = (...a) => libRPGMaster.setAttr(...a);
	const attrLookup = (...a) => libRPGMaster.attrLookup(...a);
	const evalAttr = (...a) => libRPGMaster.evalAttr(...a);
	const abilityLookup = (...a) => libRPGMaster.abilityLookup(...a);
	const getTableField = (...t) => libRPGMaster.getTableField(...t);
	const getTable = (...t) => libRPGMaster.getTable(...t);
	const initValues = (...v) => libRPGMaster.initValues(...v);
	const updateHandouts = (...a) => libRPGMaster.updateHandouts(...a);
	const findThePlayer = (...a) => libRPGMaster.findThePlayer(...a);
	const findCharacter = (...a) => libRPGMaster.findCharacter(...a);
	const fixSenderId = (...a) => libRPGMaster.fixSenderId(...a);
	const getSetPlayerConfig = (...a) => libRPGMaster.getSetPlayerConfig(...a);
	const getCharacter = (...a) => libRPGMaster.getCharacter(...a);
	const classObjects = (...a) => libRPGMaster.classObjects(...a);
	const classAllowedItem = (...a) => libRPGMaster.classAllowedItem(...a);
	const resolveData = (...a) => libRPGMaster.resolveData(...a);
	const caster = (...a) => libRPGMaster.caster(...a);
    const sendToWho = (...m) => libRPGMaster.sendToWho(...m);
    const sendPublic = (...m) => libRPGMaster.sendPublic(...m);
    const sendAPI = (...m) => libRPGMaster.sendAPI(...m);
    const sendFeedback = (...m) => libRPGMaster.sendFeedback(...m);
    const sendResponse = (...m) => libRPGMaster.sendResponse(...m);
    const sendResponsePlayer = (...p) => libRPGMaster.sendResponsePlayer(...p);
    const sendResponseError = (...e) => libRPGMaster.sendResponseError(...e);
    const sendError = (...e) => libRPGMaster.sendError(...e);
    const sendCatchError = (...e) => libRPGMaster.sendCatchError(...e);
    const sendParsedMsg = (...m) => libRPGMaster.sendParsedMsg(...m);
    const sendGMquery = (...m) => libRPGMaster.sendGMquery(...m);
    const sendWait = (...m) => libRPGMaster.sendWait(...m);
	const getHandoutIDs = (...h) => libRPGMaster.getHandoutIDs(...h);
	const getDBindex = (...i) => libRPGMaster.getDBindex(...i);
	const creatureAttkDefs = (...c) => libRPGMaster.creatureAttkDefs(...c);
		
	/*
	 * Handle for reference to character sheet field mapping table.
	 * See RPG library for your RPG/character sheet combination for 
	 * full details of this mapping.  See also the help handout on
	 * RPGMaster character sheet setup.
	 */
	
	var fields = {
		defaultTemplate:	'RPGMdefault',
		spellTemplate:		'RPGMspell',
		warningTemplate:	'RPGMwarning',
		menuTemplate:		'RPGMmenu',
	}; 

	/*
	 * Handle for the library object used to pass back RPG & character sheet
	 * specific data tables.
	 */

	var RPGMap = {};
	
	/*
	 * Define various designs for icons, buttons, etc.
	 */

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
		initSelect: 'https://s3.amazonaws.com/files.d20.io/images/349576618/1kS4qRhkJBlDCg0DUR0HiA/thumb.png?1688909231',
		grey_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
		dark_button: '"display: inline-block; background-color: darkgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		green_button: '"display: inline-block; background-color: white; border: 1px solid lime; padding: 4px; color: darkgreen; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"'
	};
	
	/*
	 * Set the default timeout for asynchronous processes
	 */
	 
	var asyncTime = 50;
	
	/*
	 * InitiativeMaster related help handout information.
	 */
	
	var handouts = Object.freeze({
	InitMaster_Help:	{name:'InitiativeMaster Help',
						 version:2.07,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">InitiativeMaster Help v2.07</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Initiative Master API v'+version+'</h1>'
							+'<h4>and later</h4>'
							+'<h3><mark style="color:green">New</mark> in this Help Handout</h3>'
							+'<ul>'
							+'<li><mark style="color:green">New</mark> FIX command for --set-mods to fix initiative roll to a value</li>'
							+'</ul>'
							+'<l1>This API supports initiative for RPGs using the Turn Order and the Tracker window.  The InitiativeMaster API provides functions dealing with all aspects of: managing how initiative is done; rolling for initiative; for "group" and "individual" initiative types providing Character action selection to determine the speed and number of attacks of weapons, the casting time of spells & the usage speed of magic items; supporting initiative for multiple attacks with one or multiple weapons per round; supporting and tracking actions that take multiple rounds; managing the resulting Turn Order; as well as performing the "End of Day" activity.  It works very closely with the <b>RoundMaster API</b> to the extent that InitiativeMaster cannot work without RoundMaster (though the reverse is possible).  InitiativeMaster also works closely with <b>AttackMaster API</b> and <b>MagicMaster API</b> and uses the data configured on the Character Sheet by these other APIs, although it can use manually completed Character Sheets once correctly configured.  As with all RPGMaster series APIs (other than RoundMaster), the correct <b>RPGMaster Library</b> for the D&D game version and Roll20 character sheet type you are using must also be loaded, to provide the correct rule set, parameters and databases for your campaign.</p>'
							+'<h2>Syntax of InitiativeMaster calls</h2>'
							+'<p>The InitiativeMaster API is called using !init.</p>'
							+'<pre>!init --help</pre>'
							+'<p>Commands to be sent to the InitiativeMaster API must be preceded by two hyphens \'--\' as above for the --help command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!init --init [party-roll]|[foes-roll]</pre>'
							+'<p>If optional parameters are not to be included, but subsequent parameters are needed, just leave out the optional parameter but leave the vertical bars in, e.g.</p>'
							+'<pre>!init --init  | [foes-roll]</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!init --list-pcs  ALL  --init </pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).<\p>'
							+'<h3>Overriding the Controlling Player</h3>'
							+'<p>When a command is sent to Roll20 APIs / Mods, Roll20 tries to work out which player or character sent the command and tells the API its findings. The API then uses this information to direct any output appropriately. However, when it is the API itself that is sending commands, such as from a <i>{{successcmd=...}}</i> or <i>{{failcmd=...}}</i> sequence in a RPGMdefault Roll Template, Roll20 sees the API as the originator of the command and sends output to the GM by default. This is not always the desired result.</p>'
							+'<p>To overcome this, or when output is being misdirected for any other reason, a <b>Controlling Player Override Syntax</b> (otherwise known as a <i>SenderId Override</i>) has been introduced (for RPGMaster Suite APIs only, I\'m afraid), with the following command format:</p>'
							+'<pre>!init [sender_override_id] --cmd1 args1... --cmd2 args2...</pre>'
							+'<p>The optional <i>sender_override_id</i> (don\'t include the [...], that\'s just the syntax for "optional") can be a Roll20 player_id, character_id or token_id. The API will work out which it is. If a player_id, the commands output will be sent to that player when player output is appropriate, even if that player is not on-line (i.e. no-one will get it if they are not on-line). If a character_id or token_id, the API will look for a controlling player <i>who is on-line</i> and send appropriate output to them - if no controlling players are on-line, or the token/character is controlled by the GM, the GM will receive all output. If the ID passed does not represent a player, character or token, or if no ID is provided, the API will send appropriate output to whichever player Roll20 tells the API to send it to.</p>'
							+'<br>'
							+'<h3>Using Character Sheet Ability/Action buttons</h3>'
							+'<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>'
							+'<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: <b>--menu</b> and <b>--monmenu</b>.  From these, most other commands can be accessed.  If using the <b>CommandMaster API</b>, its character sheet setup functions can be used to add all the necessary and/or desired Ability Macros and Token Action Buttons to any Character Sheet.</p>'
							+'<h2>How Initiative Master API works</h2>'
							+'<p>The Initiative Master API ("InitMaster") provides commands that allow the DM to set and manage the type of initiative to be used in the campaign, and for Players to undertake initiative rolls.  The API uses data on the Character Sheet represented by a selected token to show menus of actions that can be taken: these commands are often added to the Character Sheet as Ability Macros that can be shown as Token Actions (see Roll20 Help Centre for how to achieve this, or the <b>CommandMaster API</b> documentation).  The API displays resulting Turn Order token names with action priorities in the Turn Order Tracker window (standard Roll20 functionality - see Roll20 documentation & Help Centre).</p>'
							+'<p><b>Note:</b> Use the <b>--maint</b> command to display the Maintenance Menu and start the <b>RoundMaster API</b> using the <b>Start / Pause</b> button (at the top of the displayed menu) before using the Turn Order Tracker.  The top entry in the Turn Order Tracker window should change from showing a "Stopped" symbol, and change to a "Play".'
							+'<p>The API must be used with both the <b>RoundMaster API</b> and the game-version-specific <b>RPGMaster Library</b>.  The RPGMaster Library sets all the right parameters for the RPGMaster APIs to work with different D&D game versions and different Roll20 D&D character sheets.  Ensure you have the right library loaded for the game version you are playing and the character sheet version you have loaded.</p>'
							+'<h3>Specifying a token</h3>'
							+'<p>Most of the InitiativeMaster API commands need to know the token_id of the token that represents the character, NPC or creature that is to be acted upon.  This ID can be specified in two possible ways:</p>'
							+'<ol><li>explicitly in the command call using either a literal Roll20 token ID or using @{selected|token_id} or @{target|token_id} in the command string to read the token_id of a selected token on the map window,<br>or</li>'
							+'<li>by having a token selected on the map window, not specifying the token_id in the command call, and allowing the API to discover the selected token_id.</li></ol>'
							+'<p>In either case, if more than one token is selected at the time of the call then using either @{selected|token_id} to specify the token in the command call, or allowing the command to find a selected token, is likely (but not guaranteed) to take the first token that was selected.  To avoid ambiguity, it is generally recommended to make command calls with only one token selected on the map window.</p>'
							+'<h3>Types of Initiative System</h3>'
							+'<p>The API supports several methods for initiative: "standard", "group" and "individual", selectable by the DM in-game and changeable during game play, if desired.</p>'
							+'<p>"Standard" initiative just requires a "Party" initiative dice roll and a "Foe" initiative dice roll to be entered, and the Turn Order entries are set appropriately.  For "Group" initiative, the same rolls are entered but, in addition, the action of each character / NPC / creature (each token) taking part specifies what actions they are going to perform that round and the speed of that action is added to the relevant group dice roll to create the Turn Order priority for that token.  For "Individual" initiative, each character / NPC / creature makes its own individual dice roll as well as specifying their action, with the individual dice roll and speed of action being combined to give the Turn Order priority.</p>'
							+'<p>Alternatively, standard Roll20 functionality can be used to "right click" on a token and choose the option to add it to the Turn Order, and the <b>--maint</b> command can be used to set "Stop Melee" button, thus stopping the Turn Order from being cleared each round, and then the Initiative will just cycle round the party members.</p>'
							+'<h3>Monster Attack Initiatives</h3>'
							+'<p>Creatures using the Innate Monster Attack fields on the AD&D2e Character Sheet Monster tab benefit from an extended syntax for entries in these fields: each field can take</p>'
							+'<pre>damage dice roll,[Attack name],[speed],[dmg type] </pre>'
							+'<p>for example <code>1d8,Claw,2,S</code> and <code>2d4+1,Club+1,5,B</code>.  These will result in possible initiative actions for that creature for <b>Claw</b> and <b>Club+1</b>.  If Attack Name is omitted, the dice roll is displayed as the action name instead.  If the Speed is omitted, the Innate attack speed field value is used instead.</p>'
							+'<h3>Effect of Magic on Initiative</h3>'
							+'<p>The system can take into account various modifiers applied by spells and/or magic items (e.g. Haste and Slow spells), and the spell, power & magic item macros provided with the <b>MagicMaster API</b> use this functionality when used in conjunction with <b>RoundMaster</b> <i>Effects</i>. Mods set, amended or cleared with the provided commands will be stored on the character sheet and can be examined by the player alongside a tag describing each initiative mod.</p>'
							+'<h3>Multi-attack Initiatives</h3>'
							+'<p>The system can also create multiple initiative turns for weapons that achieve multiple attacks per round, like bows and daggers, as well as by the class, level and proficiency of the character or any combination of the three as per the D&D game version rules (held in the specific version of the <i>RPGMaster Library</i> you have loaded), including 3 attacks per 2 rounds, or 5 per 2.  Also Fighter and Rogue classes using 2 weapons are catered for, even with those weapons possibly having multiple attacks themselves - the weapon specified by the character as the Primary will achieve its multiple attacks, whereas the secondary weapon will only get the number of attacks specified as per the rules for multiple attacks in the game version you are using.</p>'
							+'<h3>Multi-round Initiatives</h3>'
							+'<p>Multi-round initiatives are also supported e.g. for spells like Chant which takes 2 rounds.  Any Character Sheet entry that has a speed (<b>note:</b> action speed only, not action plus initiative roll) of longer than 10 segments (1/10ths of a round), when chosen by a player, will add an entry for that action not only in the current round but also in the following and subsequent rounds as appropriate.  Each new round, when they select to specify an initiative action (e.g. using <b>!init --menu</b>) the Player of that character (or the DM for a Foe) is asked if they want to continue with the action or has it been interrupted: if interrupted or stopped by choice the player can choose another action for that character, otherwise the "carried forward" action is added to the tracker. </p>'
							+'<p><b>Note:</b> the Player (or DM) must still select to do initiative each round for this to happen.</p>'
							+'<h3>Changing an Initiative Action</h3>'
							+'<p>If using "Group" or "Individual" initiative and a Player has completed selecting an initiative action for a Character (or the DM for a Foe) and changes their mind about what they are doing before the DM starts the round, the Player can select the token and rerun the relevant command (use the relevant token action button) to do initiative again (presuming the DM\'s agreement).  The system will warn the Player that initiative has already been completed for the Character and present a new button to redo initiative if the Player wants to (this is so that accidental selection of the redo command is prevented) - all entries for the token name will be removed from the Turn Order and the relevant menus presented again to the Player.</p>'
							+'<p>Selecting any particular action for initiative <i><u>does not</u> force that to be the action the Player takes on their turn</i>.  When that Character\'s turn comes up in the Turn Order, a message is displayed to all Players and the DM stating the action that was selected for initiative for that token (DM-controlled NPCs & creatures only display to the Players that it is their turn, not what they are doing, while the DM gets a full action message).  The Player can then take that action, or do something else entirely (presumably with the DM\'s agreement) for instance if circumstances have changed (e.g. the foe being attacked has died prior to an "Attack" action).</p>'
							+'<h3>GM Multi-token Initiative Process</h3>'
							+'<p>When doing <i>Group</i> or <i>Individual</i> initiative, while players only need to choose actions for one character (or perhaps 2 or 3 especially if the character has pets or henchmen), the GM will often have multiple foes to select initiative actions for. Selecting each in turn and either using the <b>!init --menu</b> command or pressing the [Initiative] action button for each can be time consuming, so from v2.1 of the InitMaster API the GM can select multiple tokens (including Player Character tokens if so desired) using Shift-click, and then issue the <b>!init --menu</b> command or select the [Initiative] action button: the first token will then be surrounded by a yellow border and the GM will be presented with the Initiative menu for that token. Once an action is selected for that token, the yellow border will surround the next selected token and the GM presented with the Initiative menu for that token. This continues until all selected tokens have had Initiative actions selected, or alternatively at any time the GM can just ignore any menu presented and re-select a different token or tokens and issue the <b>!init --menu</b> command or use the [Initiative] action button again to start specifying initiative for this new set, or the GM can just "click-on" the Turn Order to start the round, or do anything else (though the yellow box will not clear until the round is started).</p>'
							+'<h3>In Summary</h3>'
							+'<p>InitMaster manages the whole of this process seamlessly, and in addition will support actions that result in more than one Turn Order entry (such as firing a bow that can make two shots per round), automatically taking into account character class to allow two-weapon attack actions, supporting initiative for "dancing" weapons (when used with the AttackMaster and MagicMaster APIs), and other complex aspects of initiative.</p>'
							+'<p>The easiest way to set up Character Sheets for InitMaster operation is by using the rest of the APIs in the Master series:</p>'
							+'<p><b>RPGMaster Library</b> for the game version you are playing is required for the operation of all RPGMaster APIs (except RoundMaster).  It holds the version-specific rules, parameters and databases for the game version.</p>'
							+'<p><b>RoundMaster API</b> is required for the operation of InitMaster.  It manages all aspects of interaction with the Turn Order Tracker window in Roll20, and the management of token statuses and Effects.</p>'
							+'<p><b>CommandMaster API</b> will add the relevant DM Macro Bar buttons, and Token Action Buttons to a Character Sheet for all commands needed for each of the APIs, including InitiativeMaster.</p>'
							+'<p><b>MagicMaster API</b> will support entering the correct data on the sheet for all sorts of weapons, magic items, spells and powers, through looting chests & bodies, learning & memorising spells and being granted powers.  Initiative actions can then use these items with the correct action speed.</p>'
							+'<p><b>AttackMaster API</b> will arm the character by taking weapons and/or shields "in hand".  Initiative actions can then be selected for attacks with these weapons using the correct speed modifiers.  AttackMaster will also support making attacks with all the relevant modifiers, changing the weapons in-hand, managing ammunition for ranged weapons, selecting the correct range for ranged weapons and applying the right modifiers, supporting magical weapons and artifacts, and also dealing with armour, armour classes & saves.</p>'
							+'<p>Token setup for use with the Master series of APIs is simple (to almost non-existent) and explained in the Character Sheet Setup handout.</p>'
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<p>All commands are preceded by !init unless otherwise stated.</p>'
							+'<h3>1. Manage Initiative type, rolls & party</h3>'
							+'<pre>--init [party-roll]|[foes-roll]<br>'
							+'--type < STANDARD / GROUP / INDIVIDUAL ><br>'
							+'--init-level < WEAPON / ACTION ></pre>'
							+'<h3>2. Show group / individual Initiative menus</h3>'
							+'<pre>--menu [token-id]<br>'
							+'--monmenu [token-id]</pre>'
							+'<h3>3. Show Initiative menus and mods</h3>'
							+'<pre>--weapon [token-id]<br>'
							+'--monster [token-id]<br>'
							+'--complex [token-id]<br>'
							+'--muspell [token-id]<br>'
							+'--prspell [token-id]<br>'
							+'--power [token-id]<br>'
							+'--mibag [token-id]<br>'
							+'--thief [token-id]<br>'
							+'--other [token-id]<br>'
							+'--check-init [token-id]<br>'
							+'<span style='+design.selected_button+'>Updated:</span>--set-mods [token-id]|cmd|name|[=][+/-]mod|[=][+/-]mult|[SILENT]</pre>'
							+'<h3>4. Maintain the Turn Order and Rounds</h3>'
							+'<pre>--maint<br>'
							+'--check-tracker<br>'
							+'--list-pcs  ALL / MAP / REPLACE / ADD</pre>'
							+'<h3>5. End of Day processing</h3>'
							+'<pre>--end-of-day [Type]|[=][cost]</pre>'
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
							+'	<li>the level of detail of attack action choices (by weapon or by action),</li>'
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
							+'<p>The level of detail for initiative selections involving an attack can be selected to be "by weapon" or "by action". E.g. if a <i>Longsword+1,+3 vs Undead</i> has two attack action lines (a +1 attack, and another for +3 vs Undead) in the melee weapon table, the <i>initiative by weapon</i> option will just show 1 option of "Longsword+1,+3 vs Undead" whereas the <i>initiative by action</i> option will offer two initiative options of "Longsword+1" and "Longsword+3 vs Undead". The GM can choose which level of detail is presented to players.</p>'
							+'<p>Another API button checks to see if the Turn Order contains entries for every token listed as being in the Party, i.e. that everybody has selected their actions for the next round.</p>'
							+'<p>This menu can appear automatically as each completed round finishes if <b>RoundMaster API</b> is managing the Turn Order and Rounds.  This is useful for standard and group initiative, as the first thing that needs to happen is for the Party & Foe initiative dice rolls to be entered.  It is less useful for this menu to appear for individual initiative, and it can be turned off with an API Button on the menu.</p>'
							+'<h4>1.2 Set the type of Initiative being used in the Campaign</h4>'
							+'<pre>--type < STANDARD / GROUP / INDIVIDUAL ></pre>'
							+'<p>Takes a mandatory initiative type which must be one of those shown.</p>'
							+'<p>This command sets the initiative type to the specified type without bringing up the complete --init menu.  The type of initiative specified persists between game sessions.</p>'
							+'<h4>1.3 Set attack initiative level of detail</h4>'
							+'<pre>--init-level < WEAPON / ACTION ></pre>'
							+'<p>Takes a mandatory initiative level which must be one of those shown.</p>'
							+'<p>This command sets the level of detail for players to specify initiative actions for attacks, which can be at the level of weapons in-hand or (where individual weapons have more than one possible attack action) at the level of every possible attack action. See the "--init" command above for more details and an example.</p>'
							+'<br>'
							+'<h3>2. Show Group / Individual initiative action selection menus</h3>'
							+'<h4>2.1 Display a menu of possible actions for the selected Character / NPC</h4>'
							+'<pre>--menu [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>This command displays a chat menu of buttons for types of action that the Character / NPC / creature can perform.  Each of these buttons may take the Player to a more detailed list of specific action buttons.  Selecting any of the buttons will add the speed/casting time and correct number of instances of the selected action to the group or individual initiative dice roll (1d10) and enter the result in the Turn Order using the <b>RoundMaster API</b> - \'individual\'-type initiative dice rolls are performed in the background by the API and there is currently no option for the Player to do the roll instead.  The system records the action selected and the speed of that action along with any modifiers as a message to display when the Character\'s / NPCs / creature\'s turn comes around.</p>'
							+'<p>For multiple actions per round, those subsequent to the first action with the same item have speeds in the Turn Order incremented from each other by the speed of the action: thus multiple attacks with a Longbow (2 per round, speed 8) after an initiative roll of 5 on a 1d10, will happen at priority 13 & 21.  For attacks by a Fighter with two weapons, such as a Longsword (sp 5) in their left hand and a Short sword (sp 3) in their right hand, after an initiative roll of 5, the Short sword will get a Turn Order priority of 8 and the Longsword 10 - that is they are concurrent not sequential.</p>'
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
							+'<p>If the Character / NPC / creature has Powers or Magic Items they can use, buttons also appear on the menu to go to the menus to select these instead of doing a weapon initiative - see the <b>--power</b> and <b>--mibag</b> commands.  There are also buttons for "Other" actions, such as Moving, Changing Weapon (which takes a round), doing nothing, or Player-specified actions - see the <b>--other</b> command.</p>'
							+'<h4>3.2 Display initiative actions for a simple creature to attack</h4>'
							+'<pre>--monster [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a chat menu only listing innate monster attacks from the Monster tab of the AD&D2e Character Sheet.</p>'
							+'<p>Creatures using the Innate Monster Attack fields on the AD&D2e Character Sheet Monster tab benefit from an extended syntax for entries in these fields: each field can take [&lt;Attack name&gt;,]&lt;damage dice roll&gt;[,&lt;speed&gt;][,&lt;attack type&gt;] for example <code>Claw,1d8,2,S</code> and <code>Club+1,2d4+1,5,B</code>.  These will result in possible initiative actions for that creature for <b>Claw</b> and <b>Club+1</b>.  If Attack Name is omitted, the dice roll is displayed as the action name instead.  If the speed is omitted, the Innate attack speed field value is used instead.  The speed will then be used to calculate the Turn Order priority. The optional attack type of S(slashing), P(piercing), or B(bludgeoning), or any combination of these, will be used by the <b>AttackMaster API</b> when displaying the success or otherwise of a targeted attack.</p>'
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
							+'<p>Displays a menu of Powers that the Character / NPC has been granted (see the <b>MagicMaster API</b> documentation for managing powers, or see <i>RPGMaster CharSheet Setup</i> handout for entering powers manually).  Any power that has not been consumed can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.</p>'
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
							+'<h4>3.10 View current initiative modifiers</h4>'
							+'<pre>--check-init [token-id]</pre>'
							+'<p>Takes an optional token ID.</p>'
							+'<p>Displays a dialog showing all currently in-play initiative modifiers for the character represented by the identified or selected token. Also provides buttons to add, change or remove modifiers - one for mods that add or subtract to the initiative roll, and one for mods that multiply or reduce the number of attack actions the character can undertake. See the --set-mods command for more information.</p>'
							+'<h4>3.11 <span style='+design.selected_button+'>Updated:</span> Add, change or remove modifiers</h4>'
							+'<pre>--set-mods [token-id] | (DEL / FIX / MOD / MULT / BOTH) | name | [[=][+/-]mod] | [[=][+/-]mult] | [SILENT]</pre>'
							+'<p>Takes an optional token ID, a command specifying the action, the name of the mod, the optional value of an addative modifier optionally preceeded with = or - or +, the optional value of a multiplying modifier optionally preceeded with = or - or +, and an optional "silent" qualifier.</p>'
							+'<p>Sets, fixes, changes, or deletes a named initiative modifier that can have one or both of additive and multiplicative elements. Each of these modifiers can include maths to be evaluated using standard maths operators +, -, *, /, (, ), and ^(#,#,...) for max, and v(#,#,...) for min (commas can be replaced by semi-colons ;). Preceeding a mod or mult value by = will set that value (e.g. =-2 will set the value to -2), or preceeding by + or - without the = will amend the current value by that amount. The FIX command will cause the named modifier to <i>override all other modifiers and the initiative dice roll</i> and set future initiative rolls to the value of <i>mod</i> (until DEL or a different command is used for the same name of modifier). Including the SILENT argument will not display any outcome, while ommitting it will display the result in a --check-init dialog.</p>'
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
							+'	<tr><td>Enable Long Rest for PCs</td><td>!init --end-of-day <cost></td><td>Run the normal initMaster end-of-day command</td></tr>'
							+'	<tr><td>Enable Long Rest for selected tokens</td><td>!init --enable-rest</td><td>Init API command to enable a long rest only for the characters / NPCs / creatures represented by the selected tokens, at no cost.  See the MagicMaster API documentation for information on Long Rests</td></tr>'
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
							+'	<tr><th scope="row">Alternative</th><td>\\ques;</td><td>\\lbrak;</td><td>\\rbrak;</td><td>\\at;</td><td>\\dash;</td><td>\\vbar;</td><td>\\clon;</td><td>\\amp;</td><td>\\lbrc;</td><td>\\rbrc;</td></tr>'
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
							+'<p>Optionally, a command query can be made to see if the command is supported by InitMaster if the command string parameter is added, where command is the InitMaster command (the \'--\' text without the \'--\').  This will respond with a true/false response: e.g.</p>'
							+'<p>Received:	<i>!init --handshake attk|monster</i><br>'
							+'Response:	<i>!attk --hsr init|monster|true</i></p>'
							+'<h4>6.3 Switch on or off Debug mode</h4>'
							+'<pre>--debug (ON/OFF)</pre>'
							+'<p>Takes one mandatory argument which should be ON or OFF.</p>'
							+'<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player - so the DM or a technical advisor can play as a Player and see the debugging messages.</p>'
							+'<br>'
							+'</div>',
						},
	});
	
	/*
	 * Handles for other RPG and Character Sheet specific data tables
	 * obtained from the RPGMaster Library.
	 */

	var fieldGroups;
	var spellLevels;
	var casterLevels;
	var spellsPerLevel;
	var reClassSpecs;
	var reACSpecs;
	var reWeapSpecs;
	
	var DBindex = {};
	var initSelection = {};

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
		MIATTK:			'MIATTK',
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
		MELEE:		'MW_MELEE',
		ONEWEAPON:	'ONEWEAPON',
		TWOWEAPONS:	'TWOWEAPONS',
		ALLWEAPONS: 'ALLWEAPONS',
		MW_PRIME:	'MW_PRIME',
		RW_PRIME:	'RW_PRIME',
		MW_SECOND:	'MW_SECOND',
		RW_SECOND:	'RW_SECOND',
		MON_RANGED:	'MON_RANGED',
		RANGED:		'RW_RANGED',
		MU_SPELL:	'MU_SPELL',
		PR_SPELL:	'PR_SPELL',
		POWER:		'POWER',
		MI_BAG:		'MI_BAG',
		MI_POWER:	'MI_POWER',
		MI_ATTACK:	'MI_ATTACK',
		THIEF:		'THIEF',
		OTHER:		'OTHER',
		MOVE:		'MOVE',
		CHG_WEAP:	'CHG_WEAP',
		STAND:		'STAND',
		SPECIFY:	'SPECIFY',
		CARRY:		'CARRY',
		SUBMIT:		'SUBMIT',
		SETMODS:	'SETMODS',
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
		noChar: '/w gm &{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInit Master}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot participate in Initiative.}}',
		doneInit: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ has already completed initiative for this round}}{{desc1=If you want to change ^^tname^^\'s initiative, press [Redo Initiative](!init --redo ^^tid^^)}}',
        redoMsg: '&{template:'+fields.menuTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=Initiative has been re-enabled for ^^tname^^.  You can now select something else for them to do.}}',
		noMUspellbook: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have a Wizard\'s Spellbook, and so cannot plan to cast Magic User spells.  If you need one, talk to the High Wizard (or perhaps the DM)}}',
		noPRspellbook: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have a Priest\'s Spellbook, and so cannot plan to cast Clerical spells.  If you need one, talk to the Arch-Cleric (or perhaps the DM)}}',
		noPowers: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have any Powers, and so cannot start powering up.  If you want some, you better get on the good side of your god (or perhaps the DM)}}',
		noMIBag: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ does not have Magic Item Bag, and thus no magic items.  You can go and buy one, and fill it on your next campaign.}}',
		notThief: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ is not a thief.  You can try these skills if you want - everyone has at least a small chance of success...  but perhaps prepare for a long stint staying at the local lord\'s pleasure!}}',
		heavyArmour: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=^^tname^^ realises that the armour they are wearing prevents them from using any thievish skills.  You will have to remove it, and then perhaps you might have a chance.  Change the armour type on the Rogue tab of your Character Sheet.}}',
		stdInit: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=Currently, the game is running on Standard AD&D Initiative rules, so it is a Party initiative roll.  You do not need to select an action.}}',
		notYet: '&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nInitiative}}{{desc=The game is running on Group AD&D Initiative rules, so the Party need to make an initiative roll before you add the speed of what you are doing.  You cannot yet select an action yet.}}',
		waitMsg: '&{template:'+fields.warningTemplate+'} {{name=Please Wait}}{{desc=Gathering data. Please wait for the menu to appear.}}',
	});

	var flags = {
		init_state: Init_StateEnum.STOPPED,
		feedbackName: 'initMaster',
		feedbackImg:  'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
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
		// RED: v2.050 determine if missing libraries should be notified
		notifyLibErr: true,
		noWaitMsg: true,
	};
	
	var apiCommands = {};
	var initMarkers;
	var msg_orig = {};
	
	const initMarkerRatio = 1.25;
	
	const reIgnore = /[\s\-\_]*/gi;
	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;
	const reDiceRollSpec = /(?:^\d+$|\d+d\d+)/i;
	const reClassRaceData = /}}\s*?(?:Class|Race)Data\s*?=.*?{{/im;
	const reNotAttackData = /}}[\s\w\-]*?(?<!tohit|dmg|ammo|range)data\s*?=(.+?){{/im;
	
	var	replacers = [
			[/\\lbrc;?/g, "{"],
			[/\\rbrc;?/g, "}"],
			[/\\gt;?/gm, ">"],
			[/\\lt;?/gm, "<"],
			[/<<?|«/g, "["],
			[/\\lbrak;?/g, "["],
			[/>>|»/g, "]"],
			[/\\rbrak;?/g, "]"],
			[/\^/g, "?"],
			[/\\ques;?/g, "?"],
			[/`/g, "@"],
			[/\\at;?/g, "@"],
			[/~/g, "-"],
			[/\\dash;?/g, "-"],
			[/\\n/g, "\n"],
			[/¦/g, "|"],
			[/\\vbar;?/g, "|"],
			[/\\clon;?/g, ":"],
			[/\\amp;?/g, "&"],
		];

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
		try {
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
			if (!state.initMaster.playerChars)
				{state.initMaster.playerChars = getPlayerCharList();}
			if (!state.initMaster.initType)
				{state.initMaster.initType = 'individual';}
			if (_.isUndefined(state.initMaster.playerRoll))
				{state.initMaster.playerRoll = '';}
			if (_.isUndefined(state.initMaster.dmRoll))
				{state.initMaster.dmRoll = '';}
			if (_.isUndefined(state.initMaster.dispRollOnInit))
				{state.initMaster.dispRollOnInit = true;}
			if (_.isUndefined(state.initMaster.weapInit))
				{state.initMaster.weapInit = true;}
			if (_.isUndefined(state.initMaster.waitTime))
				{state.initMaster.waitTime = 500;}
				
			if (!state.moneyMaster)
				{state.moneyMaster = {};}
			if (_.isUndefined(state.moneyMaster.inGameDay))
				{state.moneyMaster.inGameDay = 0;}
				
			[fields,RPGMap] = getRPGMap();
			fieldGroups = RPGMap.fieldGroups;
			spellLevels = RPGMap.spellLevels;
			casterLevels = RPGMap.casterLevels;
			spellsPerLevel = RPGMap.spellsPerLevel;
			reClassSpecs = RPGMap.reClassSpecs;
			reACSpecs = RPGMap.reACSpecs;
			reWeapSpecs = RPGMap.reWeapSpecs;
			flags.noWaitMsg = true;
			setTimeout( () => {flags.noWaitMsg = false;}, 5000 );

			// RED: v1.037 register with commandMaster
			setTimeout( cmdMasterRegister, 30 );
			
			// RED: v1.036 create help handouts from stored data
			setTimeout( () => updateHandouts(handouts,true,findTheGM()),30);

			// RED: v1.036 handshake with RoundMaster API
			setTimeout( () => issueHandshakeQuery('rounds'),80);
			
			// RED: v1.4.05 ensure DBindex is created
			setTimeout( () => DBindex = getDBindex(false), 90); // checking the DB indexing
			
			clearInitMarkers();
			
			// RED: log the version of the API Script

			log('-=> initMaster v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
			return;
		} catch (e) {
			sendCatchError('InitMaster',null,e,'InitMaster initialisation');
		}
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
						state.initMaster.gmID = player.id;
	    	            return player.id;
                    }
		        }
            }))) {
                return playerGM.id;
            }
        }
        return state.initMaster.gmID;
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
	
	// RED 2.050 Chat management functions moved to common library

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

 // -------------------------------------------- utility functions ----------------------------------------------

	/**
	 * Remove all multi-init markers from the campaign
	 */

	var clearInitMarkers = function() {
		_.each(initMarkers, (pageMarkers,page) => {
			_.each(pageMarkers, (markerObj,playerID) => {
				if (markerObj) markerObj.remove();
				pageMarkers[playerID] = undefined;
			});
			initMarkers[page] = undefined;
		});
		initMarkers = {};
		initSelection = {};
		
		_.each( findObjs({type:'graphic',name:'initMarker'}), m => m.remove() );
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
	 * Issue a handshake request to check if another API or 
	 * specific API command is present
	 **/
	 
	var issueHandshakeQuery = function( api, cmd ) {
		sendDebug('InitMaster issuing handshake to '+api+((cmd && cmd.length) ? (' for command '+cmd) : ''));
		var handshake = '!'+api+' --hsq init'+((cmd && cmd.length) ? ('|'+cmd) : '');
		sendAPI(handshake);
		return;
	};
	
	/*
	 * Create a list of currently Player-controlled Characters
	 */
	 
	var getPlayerCharList = function( page=false, monster=false ) {
		
		var charID,charCS,controlledBy,
			nameList = [];
			
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
//			log('setInitVars: pushing action '+attrLookup( charCS, fields.Init_action )+' to second weapon');
			setAttr( charCS, fields.Weapon_2ndNum, attrLookup( charCS, fields.Weapon_num ) );
			setAttr( charCS, fields.Init_2ndAction, attrLookup( charCS, fields.Init_action ) );
			setAttr( charCS, fields.Init_2ndSpeed, attrLookup( charCS, fields.Init_speed ) );
			setAttr( charCS, fields.Init_2ndActNum, attrLookup( charCS, fields.Init_actNum ) );
			setAttr( charCS, fields.Init_2ndAttacks, (attrLookup( charCS, fields.Init_attacks ) || 1));
			setAttr( charCS, fields.Init_2ndPreInit, 0 );
			setAttr( charCS, fields.Init_2nd2Hweapon, attrLookup( charCS, fields.Init_2Hweapon ) );
		}
		
//		log('setInitVars: setting action '+args[3]+' as primary weapon');
		setAttr( charCS, [fields.Weapon_num[0], property], args[2]);
		setAttr( charCS, [fields.Init_action[0], property], args[3]);
		setAttr( charCS, [fields.Init_speed[0], property], args[4]);
		setAttr( charCS, [fields.Init_actNum[0], property], args[5]);
		setAttr( charCS, [fields.Init_preInit[0], property], args[6]);
		setAttr( charCS, [fields.Init_2Hweapon[0], property], args[7]);
		setAttr( charCS, [fields.Init_attacks[0], property], (args[9] || 1));
		setAttr( charCS, [fields.Init_chosen[0], property], 1);
		
//		log('setInitVars: init_speed = '+args[4]);
	};

	/*
	 * Check for a character's proficiency with a weapon type
	 */

	var proficient = function( charCS, wname, wt, wst ) {
		
        wname = wname ? wname.dbName() : '';
        wt = wt ? wt.dbName() : '';
        wst = wst ? wst.dbName() : '';
        
		var i = fields.WP_table[1],
			prof = -1,
			WeaponProfs = getTableField( charCS, {},          fields.WP_table, fields.WP_name ),
			WeaponProfs = getTableField( charCS, WeaponProfs, fields.WP_table, fields.WP_type ),
			WeaponProfs = getTableField( charCS, WeaponProfs, fields.WP_table, fields.WP_specialist ),
			WeaponProfs = getTableField( charCS, WeaponProfs, fields.WP_table, fields.WP_mastery ),
			spec;
			
		do {
			let wpName = WeaponProfs.tableLookup( fields.WP_name, i, false ),
				wpType = WeaponProfs.tableLookup( fields.WP_type, i );
			if (_.isUndefined(wpName)) {break;}
            wpName = wpName.dbName();
            wpType = (!!wpType ? wpType.dbName() : '');

            let isType = (wpName && wpName.length && wt.includes(wpName)),
                isSuperType = (wpType && (wst.includes(wpType))),
                isSameName = (wpName && wpName.length && wname.includes(wpName));

			if (isType || (!isSuperType && isSameName)) {
				prof = 0;
				spec = WeaponProfs.tableLookup( fields.WP_specialist, i );
				if (spec && spec != 0) {
					prof = 2;
				}
				spec = WeaponProfs.tableLookup( fields.WP_mastery, i );
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
	
	/*
	 * Just get the caster level
	 */
	
	var casterLevel = function( charCS, casterType ) {
		return caster( charCS, casterType ).clv;
	}
	
	/*
	 * If the InHand table exists, set the number of attacks
	 * counter for the specified weapon.
	 */
	 
	var setAttkCount = function( charCS, weapon, attkCount ) {
		let InHandTable = getTableField( charCS, {}, fields.InHand_table, fields.InHand_miName );
		InHandTable = getTableField( charCS, InHandTable, fields.InHand_table, fields.InHand_attkCount );
		InHandTable.tableSet( fields.InHand_attkCount, InHandTable.tableFind( fields.InHand_miName, weapon ), attkCount);
	};
	
	/*
	 * Remember the reference of the initiative weapon
	 * so the same one is set as default next time
	 */
	 
	var rememberWeapRef = function( charCS, hand, ref ) {
		if (_.isNull(ref)) ref = undefined;
//		log('rememberWeapRef: setting hand '+hand+' to be ref = '+ref);
		setAttr( charCS, [fields.Init_hand[0]+hand,fields.Init_hand[1]], ref );
	};
	
	/*
	 * Create args for a weapon specification
	 */
	 
	var buildWeaponArgs = function( charCS, cmd, weaponRef ) {
		
//		log('buildWeaponArgs: cmd = '+cmd+', weaponRef = '+weaponRef);
		
		var fieldObj = {
				melee: {name:fields.MW_name,miName:fields.MW_miName,styleSpeed:fields.MW_styleSpeed,adj:fields.MW_adj,speed:fields.MW_speed,styleAttks:fields.MW_styleAttks,noAttks:fields.MW_noAttks,preInit:fields.MW_preInit,attkRound:fields.MW_attkRound,attkCount:fields.MW_attkCount,curCount:fields.MW_curCount,twoHanded:fields.MW_twoHanded,type:fields.MW_type},		
				ranged:{name:fields.RW_name,miName:fields.RW_miName,styleSpeed:fields.RW_styleSpeed,adj:fields.RW_adj,speed:fields.RW_speed,styleAttks:fields.RW_styleAttks,noAttks:fields.RW_noAttks,preInit:fields.RW_preInit,attkRound:fields.RW_attkRound,attkCount:fields.RW_attkCount,curCount:fields.RW_curCount,twoHanded:fields.RW_twoHanded,type:fields.RW_type}
			},
			attackCount, attacks,
			WeaponTables = getTable( charCS, (cmd.includes('MW') ? fieldGroups.MELEE : fieldGroups.RANGED )),
			attrs = ((cmd.includes('MW')) ? fieldObj.melee : fieldObj.ranged),
			weaponName = (WeaponTables.tableLookup( attrs.miName, weaponRef ) || WeaponTables.tableLookup( attrs.name, weaponRef ) || ''),
			weaponType = (WeaponTables.tableLookup( attrs.type, weaponRef ) || ''),
			speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 0.5),
			styleSpeed = WeaponTables.tableLookup( attrs.styleSpeed, weaponRef) || 0,
			weaponPlus = (parseInt(WeaponTables.tableLookup( attrs.adj, weaponRef)) || 0) * -1,
			weapSpeed = (WeaponTables.tableLookup( attrs.speed, weaponRef) || 0) + ('-+'.includes(styleSpeed[0])?styleSpeed:'+'+styleSpeed) + (state.attackMaster.weapRules.initPlus ? (weaponPlus >= 0 ? '+' : '') + weaponPlus : '+0'),
			styleNum = WeaponTables.tableLookup( attrs.styleAttks, weaponRef) || 0,
			attackNum = (WeaponTables.tableLookup( attrs.noAttks, weaponRef ) || 1),
			attackNum = (styleNum && styleNum != '0') ? '(('+attackNum+')+('+styleNum+'))' : attackNum,
			preInit = (WeaponTables.tableLookup( attrs.preInit, weaponRef ) || 0),
			weapSpecial = (proficient( charCS, weaponName, weaponType, '' ) > 0) ? 1 : preInit,
			twoHanded = (WeaponTables.tableLookup( attrs.twoHanded, weaponRef ) || 0),
			curRound = WeaponTables.tableLookup( attrs.attkRound, weaponRef ) || 0;
		if (curRound != state.initMaster.round) {
			attackCount = WeaponTables.tableLookup( attrs.attkCount, weaponRef ) || 0;
			WeaponTables = WeaponTables.tableSet( attrs.curCount, weaponRef, attackCount );
			WeaponTables = WeaponTables.tableSet( attrs.attkRound, weaponRef, state.initMaster.round );
		} else {
			attackCount = WeaponTables.tableLookup( attrs.curCount, weaponRef ) || 0;
		}
		attackCount = eval( attackCount + '+(' + speedMult + '*' + attackNum + ')' );
		attacks = Math.floor( attackCount );
		WeaponTables.tableSet( attrs.attkCount, weaponRef, (attackCount-attacks) );
		setAttkCount( charCS, WeaponTables.tableLookup( attrs.miName, weaponRef ), (attackCount-attacks) );
		
//		log('buildWeaponArgs: name = '+weaponName);
		
		return {name:weaponName, speed:weapSpeed, mult:speedMult, attkNum:attackNum, preInit:preInit, attks:attacks, twoHanded:twoHanded, type:weaponType, special:weapSpecial};
	}	

//----------------------------------- button press handlers ------------------------------------------	
	/**
	* Handle the results of pressing a monster attack initiative button
	* Use the simple monster initiative menu if 'monster' flag is true
	**/
	
	var handleInitMonster = function( monster, charCS, args, senderId ) {

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
			throw new Error( 'Invalid button while handling a monster initiative selection' );
		}

		weapSpeed = (attrLookup( charCS, fields.Monster_speed ) || 0);
		speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 1);
		
		buildCall = '!init --buildMenu ' + senderId 
				+ '|' + (monster == Monster.SIMPLE ? MenuType.SIMPLE : MenuType.COMPLEX)
				+ '|' + tokenID
				+ '|' + rowIndex
				+ '|with their innate abilities'
				+ '|[[' + weapSpeed + ']]'
				+ '|' + speedMult + '*1'
				+ '|0'
				+ '|-1'
				+ '|'+monIndex;

		sendAPI( buildCall, senderId );

		rememberWeapRef(charCS,0,rowIndex);
		rememberWeapRef(charCS,1,undefined);
		rememberWeapRef(charCS,2,undefined);
		return;
	}
	
	/**
	* Handle the results of pressing a melee weapon initiative button
	**/
	
	var handleInitMW = function( charType, charCS, args, senderId ) {

		var weaponName, weaponPlus, weapSpeed,
			styleSpeed, speedMult, attackNum,
			styleNum, preInit, attackCount,
			curRound, attacks, twoHanded,
			tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3];

		if (rowIndex == undefined || refIndex == undefined) {
			throw new Error( 'Invalid button while handling a melee attack initiative selection' );
		}
		
//		log('handleInitMW: rowIndex = '+rowIndex+', refIndex = '+refIndex);

		var weapArgs = buildWeaponArgs( charCS, BT.MELEE, refIndex ),	
			buildCall = '!init --buildMenu ' + senderId 
					+ '|' + (charType == CharSheet.MONSTER ? MenuType.COMPLEX : MenuType.WEAPON)
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '|with their ' + weapArgs.name
					+ '|[[' + weapArgs.speed + ']]'
					+ '|' + weapArgs.mult + '*' + weapArgs.attkNum
					+ '|' + weapArgs.preInit
					+ '|' + weapArgs.twoHanded
					+ '|'
					+ '|' + weapArgs.attks;
				
		sendAPI( buildCall, senderId );
		rememberWeapRef(charCS,(weapArgs.twoHanded > 0 ? 2 : 0),rowIndex);
		rememberWeapRef(charCS,1,undefined);
		rememberWeapRef(charCS,(weapArgs.twoHanded < 1 ? 2 : 0),undefined);
		return;
	}
	
	/**
	* Handle the Two Weapons button being selected on the weapons menu
	**/
	
	var handleTwoWeapons = function( charCS, args, senderId ) {
		
		var command = args[0],
			tokenID = args[1],
			rowIndex = args[2],
			rowIndex2 = args[3],
			refIndex = args[4],
			refIndex2 = args[5],
			weapon, weaponRef;
			
		if (rowIndex == rowIndex2)
			{return;}

		let weapArgs = buildWeaponArgs( charCS, ((rowIndex%2) > 0 ? BT.MELEE : BT.RANGED), refIndex );
		setInitVars( charCS, [MenuType.MW_PRIME,tokenID,refIndex,('with their '+weapArgs.name),evalAttr(weapArgs.speed),(weapArgs.mult+'*'+weapArgs.attkNum),weapArgs.preInit,'1','0',weapArgs.attks], 'current');
		args[0] = ((rowIndex2%2) > 0 ? BT.MELEE : BT.RANGED);
		handleSecondWeapon( charCS, args, senderId );
	}
	
	/**
	* Handle the selection of the Two Weapons button on the Weapon menu
	**/
	
	var handlePrimeWeapon = function( charCS, args, senderId ) {
		
		var command = args[0],
			tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3],
			buildCall;
			
		if (rowIndex > 0) {
			let weapArgs = buildWeaponArgs( charCS, command, refIndex );	

			buildCall = '!init --buildMenu ' + senderId 
					+ '|' + MenuType.MW_PRIME
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '|with their ' + weapArgs.name
					+ '|[[' + weapArgs.speed + ']]'
					+ '|' + weapArgs.mult + '*' + weapArgs.attkNum
					+ '|' + weapArgs.preInit
					+ '|1'
					+ '|0'
					+ '|' + weapArgs.attks;
		} else {
			buildCall = '!init --buildMenu ' + senderId 
					+ '|' + MenuType.MW_MELEE
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
		sendAPI( buildCall, senderId );
		rememberWeapRef(charCS,0,rowIndex);
		rememberWeapRef(charCS,1,undefined);
		rememberWeapRef(charCS,2,undefined,senrId);
		return;
	}
	
	/**
	* Handle selection of a weapon button on the Second Melee Weapon menu
	**/
	
	var handleSecondWeapon = function( charCS, args, senderId ) {
		
		var command = args[0],
			tokenID = args[1],
			rowIndex = args[2],
			rowIndex2 = args[3],
			refIndex = args[4],
			refIndex2 = args[5],
			weapon, weaponRef;
			

			if (rowIndex == rowIndex2)
			{return;}

		if (parseInt(rowIndex2,10) > 0) {
		    weapon = rowIndex2;
		    weaponRef = refIndex2;
		} else {
		    weapon = rowIndex;
		    weaponRef = refIndex;
		}
		
		var weapArgs = buildWeaponArgs( charCS, command, weaponRef ),	
			buildCall = '!init --buildMenu ' + senderId 
					+ '|' + MenuType.MW_SECOND
					+ '|' + tokenID
					+ '|' + weapon
					+ '|with their ' + weapArgs.name
					+ '|[[' + weapArgs.speed + ']]'
					+ '|' + weapArgs.mult + '*' + weapArgs.attkNum
					+ '|' + weapArgs.preInit
					+ '|1'
					+ '|' + (rowIndex2 > 0 ? rowIndex : rowIndex2)
					+ '|' + weapArgs.attks;
				
		sendAPI( buildCall, senderId );
		rememberWeapRef(charCS,0,rowIndex2);
		rememberWeapRef(charCS,1,rowIndex);
		rememberWeapRef(charCS,2,undefined);
		
		return;
	}
		
	
	/**
	* Handle the results of pressing a ranged weapon initiative button
	* if 'monster' is true, use a complex monster menu
	**/
	
	var handleInitRW = function( charType, charCS, args, senderId ) {

		var tokenID = args[1],
			rowIndex = args[2],
			refIndex = args[3];

		if (rowIndex == undefined || refIndex == undefined) {
			throw new Error( 'Invalid button while handling a ranged attack initiative selection' );
		}
		
		var weapArgs = buildWeaponArgs( charCS, BT.RANGED, refIndex ),
			buildCall = '!init --buildMenu ' + senderId 
					+ '|' + (charType == CharSheet.MONSTER ? MenuType.COMPLEX : MenuType.WEAPON)
					+ '|' + tokenID
					+ '|' + rowIndex
					+ '|with their ' + weapArgs.name
					+ '|[[' + weapArgs.speed + ']]'
					+ '|' + weapArgs.mult + '*' + weapArgs.attkNum
					+ '|' + weapArgs.special
					+ '|' + weapArgs.twoHanded
					+ '|0'
					+ '|' + weapArgs.attks;

		sendAPI( buildCall, senderId );
		rememberWeapRef(charCS,(weapArgs.twoHanded > 0 ? 2 : 0),rowIndex);
		rememberWeapRef(charCS,1,undefined);
		rememberWeapRef(charCS,(weapArgs.twoHanded < 1 ? 2 : 0),undefined);
		return;
	}
	
	/**
	* Handle the results of pressing a spell-casting initiative button
	* The 'spellCasterType' parameter determines if this is an MU or a Priest
	**/
	
	var handleInitSpell = function( spellCasterType, charCS, args, senderId ) {
	
		var spellName,
			spellCastTime,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			colIndex = args[4],
			buildCall = '',
			spellSpeedOverride = attrLookup( charCS, fields.SpellSpeedOR ) || '';

		if (rowIndex == undefined || colIndex == undefined) {
			throw new Error( 'Invalid button while handling a spell-casting initiative selection' );
		}

		spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, rowIndex, colIndex );
		spellCastTime = (spellSpeedOverride || attrLookup( charCS, fields.Spells_speed, fields.Spells_table, rowIndex, colIndex ));

		buildCall = '!init --buildMenu ' + senderId 
				+ '|' + (spellCasterType == Caster.WIZARD ? MenuType.MUSPELL : MenuType.PRSPELL)
				+ '|' + tokenID
				+ '|' + charButton
				+ '|casting ' + spellName
				+ '|[[' + spellCastTime + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
		return;
				
	}

    /**
    * Handle an initiative power button selection
    */

	var handleInitPower = function( charCS, args, senderId ) {
	
		var powerName,
			powerCastTime,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			colIndex = args[4],
			buildCall = '';

		if (rowIndex == undefined || colIndex == undefined) {
			throw new Error( 'Invalid button while handling initiative selection using a Power' );
		}

		powerName = attrLookup( charCS, fields.Powers_name, fields.Powers_table, rowIndex, colIndex );
		powerCastTime = attrLookup( charCS, fields.Powers_speed, fields.Powers_table, rowIndex, colIndex );

		buildCall = '!init --buildMenu ' + senderId 
				+ '|' + MenuType.POWER
				+ '|' + tokenID
				+ '|' + charButton
				+ '|using their power ' + powerName
				+ '|[[' + powerCastTime + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
		return;
				
	}

    /**
    * Handle an initiative Magic Item button selection
    */

	var handleInitMIBag = function( charCS, args, senderId ) {
	
		var repItemField,
			itemName,
			itemSpeed,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			buildCall = '';

		if (_.isUndefined(rowIndex)) {
			throw new Error( 'Invalid button while handling a initiative selection to use a magic item' );
		}
		itemName = attrLookup( charCS, fields.Items_name, fields.Items_table, rowIndex );
		itemSpeed = (attrLookup( charCS, fields.Items_trueSpeed, fields.Items_table, rowIndex ) || attrLookup( charCS, fields.Items_speed, fields.Items_table, rowIndex ) || 0);

		buildCall = '!init --buildMenu ' + senderId 
				+ '|' + MenuType.MIBAG
				+ '|' + tokenID
				+ '|' + charButton
				+ '|using their ' + itemName
				+ '|[[' + itemSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
		return;
				
	}
	
	/**
	 * Handle an initiative MI power button selection
	 **/
	 
	var handleInitMIpower = function( charCS, args, senderId ) {
		
		var repItemField,
			powerName,
			powerSpeed,
			isMIattk = args[0] == BT.MI_ATTACK,
			tokenID = args[1],
			charButton = args[2],
			rowIndex = args[3],
			buildCall = '';

		if (_.isUndefined(rowIndex)) {
			throw new Error( 'Invalid button while handling a initiative selection for a power of a magic item' );
		}
		powerName = attrLookup( charCS, fields.Magic_name, fields.Magic_table, rowIndex );
		powerSpeed = (attrLookup( charCS, fields.Magic_speed, fields.Magic_table, rowIndex ) || 0);

		buildCall = '!init --buildMenu ' + senderId 
				+ '|' + (isMIattk ? MenuType.MIATTK : MenuType.MIBAG)
				+ '|' + tokenID
				+ '|' + charButton
				+ '|using their ' + powerName
				+ '|[[' + powerSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
		return;
	}

    /**
    * Handle an initiative thieving skill button selection
    */

	var handleInitThief = function( charCS, args, senderId ) {
	
		var tokenID = args[1],
			charButton = args[2],
			skillName = args[3],
			skillSpeed = args[4],
			
			buildCall = '!init --buildMenu ' + senderId 
				+ '|' + MenuType.THIEF
				+ '|' + tokenID
				+ '|' + charButton
				+ '|' + skillName
				+ '|[[' + skillSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
		return;
				
	}

	/**
	* Handler for Other Actions (move, change weapon, do nothing & other),
	* which appear on all menus
	**/

	var handleOtherActions = function( charCS, args, senderId ) {
	
		var tokenID = args[1],
			selectedButton = args[2],
			initMenu = args[3],
			otherAction = args[4],
			otherSpeed = args[5],

			buildCall = '!init --buildMenu ' + senderId 
				+ '|' + initMenu
				+ '|' + tokenID
				+ '|' + selectedButton
				+ '|' + otherAction
				+ '|[[' + otherSpeed + ']]'
				+ '|1'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
		return;
	}
	
	/**
	* Handler for a carryOver escape, i.e. when a long (multi-round) action is terminated
	* prior to completion by the player
	**/
	
	var handleInitCarry = function( tokenID, charCS, initMenu, senderId ) {
	
		var init_speed,
		    buildCall;
			
		setAttr( charCS, fields.Init_carry, 0 );
		setAttr( charCS, fields.Init_done, 0 );
		setAttr( charCS, fields.Init_submitVal, 1 );
							
		init_speed = (attrLookup( charCS, fields.Init_speed ) || 0);

		buildCall = '!init --buildMenu ' + senderId 
				+ '|' + initMenu
				+ '|' + tokenID
				+ '|-1'
				+ '| '
				+ '|[[' + init_speed + ']]'
				+ '|0'
				+ '|0'
				+ '|-1';

		sendAPI( buildCall, senderId );
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
			entry = 0,
			hands = parseInt(attrLookup( charCS, fields.Equip_handedness ) || 2)+entry,
			noDancing = parseInt(attrLookup( charCS, fields.Equip_dancing ) || 0),
			attacks = [new Set()],
			weapons = [],
			InHandTable = getTableField( charCS, {}, fields.InHand_table, fields.InHand_miName );
			InHandTable = getTableField( charCS, InHandTable, fields.InHand_table, fields.InHand_attkCount );
			
		var calcAttks = function( fieldGroup ) {
			
			var WeaponTable = getTable( charCS, fieldGroup ),
				row = parseInt(WeaponTable.table[1]),
				speedMult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1), 0.5),
				init_Mod = parseInt(attrLookup( charCS, fields.initMod ) || 0),
				prefix = fieldGroup.prefix;
			
			do {
				var weapon = WeaponTable.tableLookup( fields[prefix+'name'], row, false ),
					weapMI = WeaponTable.tableLookup( fields[prefix+'miName'], row ),
					dancing= parseInt(WeaponTable.tableLookup( fields[prefix+'dancing'], row ));
				
				if (_.isUndefined(weapon)) return;
				if (weapon != '-' && (!onlyDancing || (!isNaN(dancing) && dancing != 0))) {
					let speed = parseInt(WeaponTable.tableLookup( fields[prefix+'speed'], row, '0' )),
						actionNum = WeaponTable.tableLookup( fields[prefix+'noAttks'], row, '1' ),
						attackCount = WeaponTable.tableLookup( fields[prefix+'attkCount'], row, '0' );
					attackCount = eval( attackCount + '+(' + speedMult + '*' + actionNum + ')' );
					let actions = Math.floor( attackCount );
					WeaponTable = WeaponTable.tableSet( fields[prefix+'attkCount'], row, (attackCount-actions));
					InHandTable = InHandTable.tableSet(fields.InHand_attkCount, InHandTable.tableFind( fields.InHand_miName, weapMI ), (attackCount-actions));
					let initiative = base+speed+init_Mod;
					if (!weapons.includes(weapMI.dbName())) {
						attacks.push({init:initiative,ignore:0,action:('with their '+(!!dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
						for (let i=2; i<=actions; i++) {
							initiative += speed;
							attacks.push({init:initiative,ignore:0,action:('with their '+(!!dancing ? 'dancing ' : '')+weapon),msg:(' rate '+actionNum+', speed '+speed+', modifier '+init_Mod)});
						}
						weapons.push(weapMI.dbName());
					}
					entry++;
				}
				row++;
			} while (!_.isUndefined(weapon));
			return;
		};
			
		calcAttks( fieldGroups.MELEE );
		calcAttks( fieldGroups.RANGED );

		if (entry > 0) {
			setAttr( charCS, fields.Prev_round, 0 );
			setAttr( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], state.initMaster.round, null, null, null, true );
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
			
		makeCheckInitMenu( tokenID, charCS, senderId, true );

		var initSubmit = function( senderId, charCS, args ) {
			var	initCmd = args[0],
				tokenID = args[1],
				rowIndex = args[2],
				initMenu = args[3],
				rowIndex2 = args[4],
				base = parseInt(state.initMaster.initType == 'group' ? state.initMaster.playerRoll : randomInteger(10)),
				init_Mod = parseInt(attrLookup( charCS, fields.initMod )) || 0,
				init_Mult = Math.max((parseFloat(attrLookup( charCS, fields.initMultiplier )) || 1),0.5),
				actions, initiative, count,
				curToken = getObj('graphic',tokenID),
				charName = charCS.get('name'),
				tokenName = curToken.get('name'),
				submitVal = attrLookup( charCS, fields.Init_submitVal ),
				content = fields.roundMaster;

			if (init_Mult !== 1) {
				sendFeedback( '&{template:RPGMwarning}{{name=init_mod not 1}}{{desc='+charCS.get('name')+' has an init_mod of '+init_Mult+'}}');
			}

			if (rowIndex < 0 && !submitVal) {
				sendParsedMsg( tokenID, Init_Messages.doneInit, senderId, flags.feedbackName );
				return;
			}
			
			actions = handleAllWeapons( senderId, charCS, args, base, (rowIndex != -2) );

			if (rowIndex == 0 && (initMenu == MenuType.COMPLEX || initMenu == MenuType.SIMPLE || initMenu == MenuType.WEAPON)) {
				
				var monAttk1 = (attrLookup( charCS, fields.Monster_dmg1 ) || '').split(','),
					monAttk2 = (attrLookup( charCS, fields.Monster_dmg2 ) || '').split(','),
					monAttk3 = (attrLookup( charCS, fields.Monster_dmg3 ) || '').split(','),
					monSpeed = parseInt(attrLookup( charCS, fields.Monster_speed ) || 0),
					monSpeed1 = (parseInt((monAttk1.length > 2) ? monAttk1[2] : monSpeed) || monSpeed) / init_Mult,
					monSpeed2 = (parseInt((monAttk2.length > 2) ? monAttk2[2] : monSpeed) || monSpeed) / init_Mult,
					monSpeed3 = (parseInt((monAttk3.length > 2) ? monAttk3[2] : monSpeed) || monSpeed) / init_Mult,
					monMod = parseInt(attrLookup( charCS, fields.initMod )) || 0,
					monDmg1 = reDiceRollSpec.test(monAttk1[0]) ? monAttk1[1] : (monAttk1[0] || ''),
					monDmg2 = reDiceRollSpec.test(monAttk2[0]) ? monAttk2[1] : (monAttk2[0] || ''),
					monDmg3 = reDiceRollSpec.test(monAttk3[0]) ? monAttk3[1] : (monAttk3[0] || '');
					
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
				
				if (monAttk1[0].length && (rowIndex2 == 0 || rowIndex2 == 1)) {
					actions.push({init:(base+Math.round(monSpeed1)+monMod),ignore:0,action:('with their '+monDmg1),msg:(' rate 1, speed '+Math.round(monSpeed1)+'/'+init_Mult+', modifier '+monMod)});
					for (let i=2; i<=init_Mult; i++) {actions.push({init:(base+Math.round(i * monSpeed1)+monMod),ignore:0,action:('with their '+monDmg1),msg:''})};
				}
				if (monAttk2[0].length && (rowIndex2 == 0 || rowIndex2 == 2)) {
					actions.push({init:(base+Math.round(monSpeed2)+monMod),ignore:0,action:('with their '+monDmg2),msg:(' rate 1, speed '+Math.round(monSpeed2)+'/'+init_Mult+', modifier '+monMod)});
					for (let i=2; i<=init_Mult; i++) {actions.push({init:(base+Math.round(i * monSpeed2)+monMod),ignore:0,action:('with their '+monDmg2),msg:''})};
				}
				if (monAttk3[0].length && (rowIndex2 == 0 || rowIndex2 == 3)) {
					actions.push({init:(base+Math.round(monSpeed3)+monMod),ignore:0,action:('with their '+monDmg3),msg:(' rate 1, speed '+Math.round(monSpeed3)+'/'+init_Mult+', modifier '+monMod)});
					for (let i=2; i<=init_Mult; i++) {actions.push({init:(base+Math.round(i * monSpeed3)+monMod),ignore:0,action:('with their '+monDmg3),msg:''})};
				}

			} else if (rowIndex != -2) {
				var	fighterClass = (attrLookup( charCS, fields.Fighter_class ) || ''),
					weapAttk = [MenuType.WEAPON,MenuType.TWOWEAPONS,MenuType.MW_MELEE,MenuType.MW_PRIME,MenuType.MW_SECOND].includes(initMenu),
					init_Mod = parseInt(attrLookup( charCS, fields.initMod )) || 0,
					init_Mult = Math.max(parseFloat(attrLookup( charCS, fields.initMultiplier ) || 1),0.5),
					init_Done = parseInt(attrLookup( charCS, fields.Init_done ), 10),
					init_speed = Math.max((parseInt(attrLookup( charCS, fields.Init_speed )) || 0),0),
					init_multSpeed = weapAttk ? init_speed/init_Mult : init_speed,
					init_action = attrLookup( charCS, fields.Init_action ),
					init_actionnum = attrLookup( charCS, fields.Init_actNum ),
					init_attacks = parseInt(attrLookup( charCS, fields.Init_attacks ) || 1),
					init_preinit = attrLookup( charCS, fields.Init_preInit ),
					init_fixinit = parseInt(attrLookup( charCS, fields.Init_fixInit ) || '0'),
					preinit = init_fixinit || eval( init_preinit ),
					weapno = attrLookup( charCS, fields.Weapon_num ),
					twoHanded = attrLookup( charCS, fields.Init_2Hweapon ),
					round = state.initMaster.round;
					
				if (initMenu == MenuType.TWOWEAPONS) {
					
					var init_speed2 = parseInt(attrLookup( charCS, fields.Init_2ndSpeed )) || 0,
						init_multSpeed2 = weapAttk ? init_speed2/init_Mult : init_speed2,
						init_action2 = attrLookup( charCS, fields.Init_2ndAction ),
						init_actionnum2 = attrLookup( charCS, fields.Init_2ndActNum ),
						preinit2 = init_fixinit,
						init_attacks2 = parseInt(attrLookup( charCS, fields.Init_2ndAttacks ));
					if (isNaN(init_attacks2)) init_attacks2 = 1;
					if (flags.twoWeapSingleAttk && init_attacks2 > 1) {
						init_attacks2 = init_Mult;
						init_actionnum2 = (init_Mult + '*1 (2nd weap)');
					}
					args[3] = args[4];
				}
				
				setAttr( charCS, fields.Prev_round, state.initMaster.round );
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
				
				if (initMenu != MenuType.TWOWEAPONS) {
					setAttr( charCS, fields.Weapon_num, -1 );
					setAttr( charCS, fields.Weapon_2ndNum, -1 );
				}

				if (initMenu != MenuType.TWOWEAPONS || init_speed2 >= init_speed || preinit) {
					
					if (preinit && preinit !== 1) {
						base = preinit > 0 ? (preinit - 1) : preinit;
						preinit = 0;
					}
					
					if (init_attacks >= 1) {
						initiative = (preinit ? 0 : base+Math.round(init_multSpeed)+init_Mod);
						actions.push({init:initiative,ignore:0,action:init_action,msg:(' rate '+init_actionnum+', speed '+init_speed+(weapAttk ? ('/'+init_Mult) : '')+', modifier '+init_Mod+(init_fixinit?', roll magically set to '+(init_fixinit-1) : ''))});
					}
					if (initMenu == MenuType.TWOWEAPONS && (init_attacks2 >= 1)) {
						initiative = base + Math.round(init_multSpeed2) + init_Mod;
						actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+(weapAttk ? ('/'+init_Mult) : '')+', modifier '+init_Mod+(init_fixinit?', roll magically set to '+(init_fixinit-1) : ''))});
					}

				} else {
					
					if (preinit2 && preinit2 !== 1) {
						base = preinit2 > 0 ? (preinit2 - 1) : preinit2;
						preinit2 = 0;
					}
					
					if (init_attacks2 >= 1) {
						initiative = (preinit2 ? 0 : base+Math.round(init_multSpeed2)+init_Mod);
						actions.push({init:initiative,ignore:0,action:init_action2,msg:(' rate '+init_actionnum2+', speed '+init_speed2+(weapAttk ? ('/'+init_Mult) : '')+', modifier '+init_Mod+(init_fixinit?', roll magically set to '+(init_fixinit-1) : ''))});
					}
					if (init_attacks >= 1) {
						initiative = base+Math.round(init_multSpeed)+init_Mod;
						actions.push({init:initiative,ignore:0,action:init_action,msg:(' rate '+init_actionnum+', speed '+init_speed+(weapAttk ? ('/'+init_Mult) : '')+', modifier '+init_Mod+(init_fixinit?', roll magically set to '+(init_fixinit-1) : ''))});
					}
					
				}
						
				for( let i=2; i<=init_attacks; i++ ) {
					initiative = base + Math.round(i * (init_multSpeed)) + init_Mod;
					actions.push({init:initiative,ignore:0,action:init_action,msg:''});
				}
				
				if (initMenu == MenuType.TWOWEAPONS) {
					for( let i=2; i<=init_attacks2; i++ ) {
						initiative = base + Math.round(i * (init_multSpeed2)) + init_Mod;
						actions.push({init:initiative,ignore:0,action:init_action2,msg:''});
					}
				}
			}
			count = 0;
			actions = _.sortBy( actions, 'init' );
			sendWait(senderId,0);
			_.each( actions, function(act) {
				if (_.isUndefined(act.init)) {return;}
				content += ' --addtotracker '+tokenName+'|'+tokenID+'|'+act.init+'|'+act.ignore+'|'+act.action+'|'+act.msg;
			});
			sendAPI( content, senderId );
			
			content = '&{template:'+fields.menuTemplate+'}{{name='+tokenName+'\'s Initiative}}'
			if (init_attacks < 1) {
				count++;
				content += '{{desc='+tokenName+'\'s action '+init_action+' at a rate of '+init_actionnum+' does not result in an action this round}}';
			};
			if (initMenu == MenuType.TWOWEAPONS && init_attacks2 < 1) {
				count++;
				content += '{{desc='+tokenName+'\'s action '+init_action2+' at a rate of '+init_actionnum2+' does not result in an action this round}}';
			};
			if (count) sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );

			(initSelection[senderId] || [0]).shift();
			if ((initSelection[senderId] || []).length) {
				setTimeout( () => doInitMenu( [], initSelection[senderId], MenuType.MENU, senderId ), 0 );
			} else {
				let page = curToken.get('_pageid');
				if (initMarkers && initMarkers[page] && initMarkers[page][senderId]) {
					initMarkers[page][senderId].remove();
					initMarkers[page][senderId] = undefined;
				}
			}
		};

		if (state.initMaster.initType == 'standard') {
			sendParsedMsg( tokenId, Init_Messages.stdInit, senderId, flags.feedbackName );
			return;
		} else if (state.initMaster.initType == 'group' && isNaN(state.initMaster.playerRoll)) {
			sendParsedMsg( tokenID, Init_Messages.notYet, senderId, flags.feedbackName );
			return;
		}

		if (_.isUndefined(rowIndex)) {
			throw new Error( 'Invalid button while handling a monster initiative selection' );
		}
		
		buildMenu( initMenu, charCS, MenuState.DISABLED, args, senderId );
		
	    let page = Campaign().get('playerpageid'),
			tracker = Campaign().get('initiativepage'); 
		
		if (page !== tracker) Campaign().set('initiativepage', page);
		sendAPI('!rounds --start always');
		
		setTimeout( initSubmit, 0, senderId, charCS, args );
		
		let content = fields.attackMaster + ' --checkac ' + tokenID + '|Silent||' + senderId;
		setTimeout( sendAPI, Math.round(60000+(Math.random()*60000)), content, senderId );
	};
	
	/*
	 * Handle a player setting modifications to the initiative roll factors
	 */
	 
	var handleAdjustInitMods = function( args, senderId, silent ) {
		
		var cmd = args[0],
			tokenID = args[1],
			val = args[2],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug( 'handleChangeInitMods: tokenID does not represent a character' );
			sendError( 'Invalid tokenID given' );
			return;
		}
		setAttr( charCS, (cmd === BT.INIT_ADJMOD ? fields.InitModAdjust : fields.InitMultAdjust), val );
		makeCheckInitMenu( tokenID, charCS, senderId, silent, ('Set initiative speed '+(cmd === BT.INIT_ADJMOD ? 'modifier' : 'multiplier')+' to '+val) );
		return;
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

		var MagicItems = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
			i = fields.Items_table[1],
			item;

		while (!_.isUndefined(item = MagicItems.tableLookup( fields.Items_name, i++, false ))) {
			if (item.length && item != '-') {return true;}
		}
		return false;
	}
	
	/*
	 * Checks for the existence of powers
	 */
	 
	var checkForPowers = function( charCS ) {
		var item = attrLookup( charCS, fields.Powers_name, fields.Powers_table, 0, fields.PowersBaseCol+0, false, false );
		for (let r = 0; !_.isUndefined(item); r++) {
			for (let c = 0; c<fields.PowersCols && !_.isUndefined(item); c++) {
				item = attrLookup( charCS, fields.Powers_name, fields.Powers_table, r, fields.PowersBaseCol+c, false, false );
				if (item && item.length && item != '-') {return true;}
			}
		}
		return false;
	}
	
	/*
	 * Count the number of active weapons currently in-hand
	 */
	 
	var countWeaponsInHand = function( charCS ) {
		var InHandTable = getTableField( charCS, {}, fields.InHand_table, fields.InHand_name ),
			InHandTable = getTableField( charCS, InHandTable, fields.InHand_table, fields.InHand_miName ),
			InHandTable = getTableField( charCS, InHandTable, fields.InHand_table, fields.InHand_type ),
			WeapTable = getTableField( charCS, {}, fields.MW_table, fields.MW_name ),
			WeapTable = getTableField( charCS, WeapTable, fields.MW_table, fields.MW_miName ),
			meleeWeap = 0,
			rangedWeap = 0,
			shieldWeap = 0,
			monAttk = parseInt(attrLookup( charCS, fields.Monster_attks, null, null, null, null, false )),
			r = InHandTable.table[1],
			miNames = [],
			weapon;
			
		if (isNaN(monAttk) || !monAttk) {
			monAttk  = (String(attrLookup( charCS, fields.Monster_dmg1 ) || '') !== '') ? 1 : 0;
			monAttk += (String(attrLookup( charCS, fields.Monster_dmg2 ) || '') !== '') ? 1 : 0;
			monAttk += (String(attrLookup( charCS, fields.Monster_dmg3 ) || '') !== '') ? 1 : 0;
		};
			
		while (!_.isUndefined(weapon = InHandTable.tableLookup( fields.InHand_name, r, false ))) {
			if (weapon != '-') {
				let miName = InHandTable.tableLookup( fields.InHand_miName, r );
				if (miName && !miNames.includes(miName.dbName())) {
					miNames.push(miName.dbName());
					let type = (InHandTable.tableLookup( fields.InHand_type, r ) || '').toLowerCase();
					if (!type || !type.length) {
						let weapObj = abilityLookup( fields.WeaponDB, (InHandTable.tableLookup( fields.InHand_miName, r ) || weapon) ).obj;
						if (weapObj) type = weapObj[1].type;
					}
					if (type.includes('shield')) shieldWeap++;
					else if (type.includes('melee')) meleeWeap++;
					if (type.includes('ranged')) rangedWeap++;
				}
			}
			r++;
		}
		r = WeapTable.table[1];
		while (!_.isUndefined(weapon = WeapTable.tableLookup( fields.MW_name, r, false ))) {
			if (miNames.includes(weapon.dbName())) {
				miNames.push(weapon.dbName());
				let miName = WeapTable.tableLookup( fields.MW_miName, r );
				if (!miName && !miName.length) meleeWeap++;
			}
			r++;
		}
		WeapTable = getTableField( charCS, {}, fields.RW_table, fields.RW_name );
		WeapTable = getTableField( charCS, WeapTable, fields.RW_table, fields.RW_miName );
		r = WeapTable.table[1];
		while (!_.isUndefined(weapon = WeapTable.tableLookup( fields.RW_name, r, false ))) {
			if (miNames.includes(weapon.dbName())) {
				miNames.push(weapon.dbName());
				let miName = WeapTable.tableLookup( fields.RW_miName, r );
				if (!miName && !miName.length) rangedWeap++;
			}
			r++;
		}
		return {melee:meleeWeap, ranged:rangedWeap, shield:shieldWeap, monster:monAttk};
	}
	
// ---------------------------------- build menus to display --------------------------------------------------------	

	/**
	* Select a menu to build
	**/

	var buildMenu = function( initMenu, charCS, selected, args, senderId ) {
		
		switch (initMenu.toUpperCase()) {
		
		case MenuType.SIMPLE :
//				makeMonsterMenu( Monster.SIMPLE, charCS, selected, args, senderId );
//				break;
				
		case MenuType.COMPLEX :
//				makeMonsterMenu( Monster.COMPLEX, charCS, selected, args, senderId );
//				break;
				
		case MenuType.WEAPON :
		case MenuType.MIATTK :
			makeWeaponMenu( charCS, selected, args, senderId );
			break;
		
		case MenuType.MW_MELEE :
			args[3] = args[8];
			makePrimeWeaponMenu( charCS, selected, args, senderId );
			break;
			
		case MenuType.MW_PRIME :
		case MenuType.MW_SECOND :
			args[3] = args[8];
			makeSecondWeaponMenu( charCS, selected, args, senderId );
			break;
		
		case MenuType.TWOWEAPONS :
			makeSecondWeaponMenu( charCS, selected, args, senderId );
			break;
			
		case MenuType.MUSPELL :
			makeSpellMenu( Caster.WIZARD, charCS, selected, args, senderId );
			break;
			
		case MenuType.PRSPELL :
			makeSpellMenu( Caster.PRIEST, charCS, selected, args, senderId );
			break;
			
		case MenuType.POWER :
			makePowersMenu( charCS, selected, args, senderId );
			break;
			
		case MenuType.MIBAG :
			makeMIBagMenu( charCS, selected, args, senderId );
			break;
			
		case MenuType.THIEF :
			makeThiefMenu( charCS, selected, args, senderId );
			break;
			
		case MenuType.OTHER :
			makeOtherMenu( charCS, selected, args, senderId );
			break;
			
		case MenuType.MENU :
			makeInitMenu( charCS, CharSheet.CHARACTER, args, senderId );
			break;
			
		case MenuType.MONSTER_MENU :
			makeInitMenu( charCS, CharSheet.MONSTER, args, senderId );
			break;
			
		case MenuType.CARRY :
			break;
			
		default:
			throw new Error( 'Invalid initiative menu build request' );

		}
		return;
	}


	/**
	 * Add the Magic Item and Powers initiative buttons to a menu
	 **/

	var MIandPowers = function( tokenID, submitted ) {
		var charCS = getCharacter(tokenID,false),
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
	
	/**
	 * Add powers of Magic Items in-hand to any menu
	 **/
	 
	var inHandMIbuttons = function( tokenID, charCS, senderId, buttonID, charButton, submitted, cmd ) {
		
		return new Promise(resolve => {
			try {
				var content = '',
					inHandTitle = false,
					MagicTable = getTableField( charCS, {}, fields.Magic_table, fields.Magic_name ),
					ItemsTable = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
					powerList = {},
					magicName, miName, miQty;
					
				MagicTable = getTableField( charCS, MagicTable, fields.Magic_table, fields.Magic_miName );
				ItemsTable = getTableField( charCS, ItemsTable, fields.Items_table, fields.Items_trueName );
				ItemsTable = getTableField( charCS, ItemsTable, fields.Items_table, fields.Items_qty );
				for (let r = MagicTable.table[1]; !_.isUndefined(magicName = MagicTable.tableLookup( fields.Magic_name, r, false )); r++) {
					if (magicName != '-') {
						miName = MagicTable.tableLookup( fields.Magic_miName, r );
						let itemRow = ItemsTable.tableFind( fields.Items_trueName, miName );
						miQty = ItemsTable.tableLookup( fields.Items_qty, itemRow );
						miName = ItemsTable.tableLookup( fields.Items_name, itemRow ) || 'Miagic Item';
						if (!powerList[miName]) powerList[miName] = {};
						powerList[miName][magicName] = [r,(isNaN(parseInt(miQty)) ? 1 : miQty)];
					}
				}
				if (_.size(powerList)) content += '{{Section1=**Magic Items in-hand**}}';

				_.each(powerList, (p,n) => {
					content += '{{'+n.dispName()+'=';
					_.each(p, (q,m) => {
						content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted || (q[1] <= 0) ? '<span style=' + design.grey_button + '>' : '['));
						content += q[1] + ' ' + m;
						content += (((buttonID == charButton) || submitted || (q[1] == 0)) ? '</span>' : '](!init --button ' + cmd + '|' + tokenID + '|' + buttonID + '|' + q[0] + ')');
						buttonID++;
					});
					content += '}}';
				});
				
			} catch (e) {
				log('MagicMaster updateCharSheets: JavaScript '+e.name+': '+e.message+' while converting sheet '+charCS.get('name'));
				sendDebug('MagicMaster updateCharSheets: JavaScript '+e.name+': '+e.message+' while converting sheet '+charCS.get('name'));
				sendCatchError('InitMaster',msg_orig[senderId],e);
			} finally {
				setTimeout(() => {
					resolve([content,buttonID]);
				}, asyncTime);
			}
		});

	}
	
	/*
	 * Make monster attack buttons 
	 */
	 
	var makeMonAttkButtons = function( tokenID, charCS, senderId, charButton, monButton, submitted ) {
		
		var errFlag = false;
		try {
			
			creatureAttkDefs( charCS );
			
			var content = '',
				monAttk1 = attrLookup( charCS, fields.Monster_dmg1 ),
				monAttk2 = attrLookup( charCS, fields.Monster_dmg2 ),
				monAttk3 = attrLookup( charCS, fields.Monster_dmg3 );
			
			if ((monAttk1 && monAttk2) || (monAttk1 && monAttk3) || (monAttk2 && monAttk3)) {
				content += ((0 == charButton && 0 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += 'All Innate Attks';
				content += (((0 == charButton && 0 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|0)\n');
			}
			if (monAttk1) {
				monAttk1 = monAttk1.split(',');
				content += ((0 == charButton && 1 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += 'Creature '+ (monAttk1.length > 1 && reDiceRollSpec.test(monAttk1[0]) ? monAttk1[1] : monAttk1[0]);
				content += (((0 == charButton && 1 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|1)\n');
			}
			if (monAttk2) {
				monAttk2 = monAttk2.split(',');
				content += ((0 == charButton && 2 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += 'Creature '+ (monAttk2.length > 1 && reDiceRollSpec.test(monAttk2[0]) ? monAttk2[1] : monAttk2[0]);
				content += (((0 == charButton && 2 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|2)\n');
			}
			if (monAttk3) {
				monAttk3 = monAttk3.split(',');
				content += ((0 == charButton && 3 == monButton) ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += 'Creature '+ (monAttk3.length > 1 && reDiceRollSpec.test(monAttk3[0]) ? monAttk3[1] : monAttk3[0]);
				content += (((0 == charButton && 3 == monButton) || submitted) ? '</span>' : '](!init --button ' + BT.MON_INNATE + '|' + tokenID + '|0|3)\n');
			}
			
			content += ((content && content.length) ? '\n' : '');
			
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		} finally {
			return content;
		}
	};

	
	/*
	 * Make weapon button lists
	 */
	
	async function makeWeaponButtons( tokenID, senderId, charButton, submitted, MWcmd, RWcmd, show2H=true, showDancing=true, showInHand=true, showWeapons=false, MWtable, RWtable ) {
		
		try {
//			if (_.isUndefined(show2H) || _.isNull(show2H)) {show2H = true};
//			if (_.isUndefined(showDancing) || _.isNull(showDancing)) {showDancing = true};
//			if (_.isUndefined(showInHand) || _.isNull(showInHand)) {showInHand = true};

			var charCS = getCharacter( tokenID,false ),
				weapName,
				ammoRowAdj,
				ammoPointer,
				twoHanded,
				dancing,
				i, w, a,
				header = true,
				errFlag = false,
				content = '',
				weapList = [],
				dancingWeapons = '',
				ItemsTable  = getTableField( charCS, {}, fields.Items_table, fields.Items_name );

				ItemsTable  = getTableField( charCS, ItemsTable, fields.Items_table, fields.Items_qty );
				
			// build the character Melee Weapon list

			var meleeWeaps = function(senderId, WeaponTable) {
				var errFlag = false;
				return new Promise(resolveMelee => {
					try {
						var content = '';
						
						if (_.isUndefined(WeaponTable)) {
							WeaponTable = getTableField( charCS, {}, fields.MW_table, fields.MW_name );
							WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_miName );
							WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_twoHanded );
							WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_dancing );
							WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_charges );
							WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_hand );
						}
						let a = fields.MW_table[1];
						for (let i = a; i < (fields.MWrows + a); i++) {
							let w = (1 - (a * 2)) + (i * 2),
								weapName = WeaponTable.tableLookup( fields.MW_name, i, false );
							if (_.isUndefined(weapName)) {break;}
							let twoHanded = WeaponTable.tableLookup( fields.MW_twoHanded, i ) != 0,
								dancing = WeaponTable.tableLookup(fields.MW_dancing, i ) != 0;
							if (showInHand && (weapName != '-') && (show2H || !twoHanded) && !dancing) {
								if (header) {
									content += '**Melee Weapons**\n';
									header = false;
								}
								let miName = WeaponTable.tableLookup( fields.MW_miName, i ) || '';
								if (showWeapons && miName && miName.length) {
									if (weapList.includes(miName.dbName())) continue;
									weapList.push(miName.dbName());
									weapName = miName;
								}
								let	weapData = resolveData( miName, fields.WeaponDB, reNotAttackData, charCS, {chargeType:reWeapSpecs.chargeType} ),
									weapCharged = weapData.chargeType && !(['uncharged','cursed','single-uncharged'].includes(weapData.chargeType.toLowerCase())),
									charges = weapCharged  ? (WeaponTable.tableLookup( fields.MW_charges, i ) || 1) : 0,
									exhausted = submitted,
									qty = '';
								if (charges) {
									let itemIndex = attrLookup( charCS, fields.InHand_index, fields.InHand_table, WeaponTable.tableLookup( fields.MW_hand, i ));
									qty = _.isUndefined(itemIndex) ? 0 : ItemsTable.tableLookup( fields.Items_qty, itemIndex ) || 0;
									exhausted = qty < charges;
									qty = String(qty) + ' ';
								}
								content += (w == charButton || exhausted ? '<span style=' + (w == charButton ? design.selected_button : design.grey_button) + '>' : '[');
								content += qty + weapName;
								content += (((w == charButton) || exhausted) ? '</span>' : '](!init --button ' + MWcmd + '|' + tokenID + '|' + w + '|' + i + ')');
							} else if ((weapName != '-') && dancing) {
								dancingWeapons += '<span style='+design.green_button+'>'+weapName+'</span>';
							}
						};
						if (!header) {
							content += '\n';
							header = true;
						}
					} catch (e) {
						sendCatchError('InitMaster',msg_orig[senderId],e);
					} finally {
						setTimeout(() => {
							resolveMelee(content);
						}, asyncTime);
					}
				});
			};

			// build the character Ranged Weapons list ****
			
			var rangedWeaps = function(senderId,WeaponTable) {
				var errFlag = false;
				return new Promise(resolveRanged => {
					try {
						var content = '';
						
						if (_.isUndefined(WeaponTable)) {
							WeaponTable = getTableField( charCS, {}, fields.RW_table, fields.RW_name );
							WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_miName, '', 1 );
							WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_charges, '', 1 );
							WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_twoHanded, '', 1 );
							WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_dancing, '', 0 );
						}
						let a = fields.RW_table[1];
						for (let i = a; i < (fields.RWrows + a); i++) {
							let w = (2 - (a * 2)) + (i * 2),
								weapName = WeaponTable.tableLookup( fields.RW_name, i );
							if (_.isUndefined(weapName)) {break;}
							let twoHanded = WeaponTable.tableLookup( fields.RW_twoHanded, i ) != 0,
								dancing = WeaponTable.tableLookup( fields.RW_dancing, i ) != 0;
							if (showInHand && weapName != '-' && (show2H || !twoHanded) && !dancing) {
								if (header) {
									content += '**Ranged weapons**\n';
									header = false;
								}
								let miName = WeaponTable.tableLookup( fields.RW_miName, i ) || '',
									weapData = resolveData( miName, fields.WeaponDB, reNotAttackData, charCS, {chargeType:reWeapSpecs.chargeType} ),
									weapCharged = weapData.chargeType && !(['uncharged','cursed','single-uncharged'].includes(weapData.chargeType.toLowerCase())),
									charges = weapCharged  ? WeaponTable.tableLookup( fields.RW_charges, i ) : 0,
									exhausted = submitted,
									qty = '';
								if (charges) {
									let itemIndex = ItemsTable.tableFind( fields.Items_name, miName );
									qty = _.isUndefined(itemIndex) ? 0 : ItemsTable.tableLookup( fields.Items_qty, itemIndex ) || 0;
									exhausted = qty < charges;
									qty = String(qty) + ' ';
								}
								content += (w == charButton || exhausted ? '<span style=' + (w == charButton ? design.selected_button : design.grey_button) + '>' : '[');
								content += qty + weapName;
								content += (((w == charButton) || exhausted) ? '</span>' : '](!init --button ' + RWcmd + '|' + tokenID + '|' + w + '|' + i + ')');
							} else if ((weapName != '-') && dancing && !dancingWeapons.includes('>'+weapName+'<')) {
								dancingWeapons += '<span style='+design.green_button+'>'+weapName+'</span>';
							}
						}
						if (!header) {
							content += '\n';
						}
					} catch (e) {
						sendCatchError('InitMaster',msg_orig[senderId],e);
					} finally {
						setTimeout(() => {
							resolveRanged(content);
						}, asyncTime);
					}
				});
			};
			
			content += await meleeWeaps(senderId,MWtable);
			content += await rangedWeaps(senderId,RWtable);

			if (dancingWeapons.length) {
				content += '**Dancing weapons**\nAutomatic Initiative\n' + dancingWeapons;
			}
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		} finally {
			return content;
		}
	};

    /*
    * Create the Complex Monster Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makeMonsterMenu(complex,charCS,submitted,args,senderId) {

		try {
			var tokenID = args[1],
				charButton = args[2],
				monButton = args[8],
				tokenName,
				content;
				
			tokenName = getObj( 'graphic', tokenID ).get('name');
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
					+ '{{subtitle=Initiative for Complex Monster Attacks}}'
					+ '{{desc=**Innate weapons**\n';
					
			// add buttons for innate monster attack abilities using the monster initiative modifier
			
			content += makeMonAttkButtons( tokenID, charCS, senderId, charButton, monButton, submitted );

			if (complex) {
				content += '\n'+await makeWeaponButtons( tokenID, senderId, charButton, submitted, BT.MON_MELEE, BT.MON_RANGED );
				content += MIandPowers( tokenID, submitted );			
			}
			content	+= '}}'
					+ '{{desc1=' + otherActions( (complex ? MenuType.COMPLEX : MenuType.SIMPLE), tokenID, charButton, submitted ) + '}}'
					+ '{{desc2=Select action above, then '
					+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + (complex ? MenuType.COMPLEX : MenuType.SIMPLE) + '|' + monButton + ')')
					+ '}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;

		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};

    /*
    * Create the Weapon Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makeWeaponMenu(charCS,submitted,args,senderId) { 
	
		try {
			var isMIattk = args[0] == MenuType.MIATTK,
				tokenID = args[1],
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
				weapCount = countWeaponsInHand( charCS ),
				shieldStyle = (weapCount.melee > 0 && weapCount.shield > 0 && ((attrLookup( charCS, fields.Init_2ndShield ) || 0) > 0)) ? weapCount.shield : 0,
				inHandMIs = '',
				weaponButtons,buttonID,content,
				primeHand, primeRef, offHand, offRef, bothHands, bothRef;

			var MW_handFields = getTableField( charCS, {}, fields.MW_table, fields.MW_hand ),
				MW_handFields = getTableField( charCS, MW_handFields, fields.MW_table, fields.MW_miName ),
				MW_handFields = getTableField( charCS, MW_handFields, fields.MW_table, fields.MW_name ),
				MW_handFields = getTableField( charCS, MW_handFields, fields.MW_table, fields.MW_twoHanded ),
				MW_handFields = getTableField( charCS, MW_handFields, fields.MW_table, fields.MW_dancing ),
				MW_handFields = getTableField( charCS, MW_handFields, fields.MW_table, fields.MW_charges ),
				RW_handFields = getTableField( charCS, {}, fields.RW_table, fields.RW_hand ),
				RW_handFields = getTableField( charCS, RW_handFields, fields.RW_table, fields.RW_miName ),
				RW_handFields = getTableField( charCS, RW_handFields, fields.RW_table, fields.RW_name ),
				RW_handFields = getTableField( charCS, RW_handFields, fields.RW_table, fields.RW_charges, '', 1 ),
				RW_handFields = getTableField( charCS, RW_handFields, fields.RW_table, fields.RW_twoHanded, '', 1 ),
				RW_handFields = getTableField( charCS, RW_handFields, fields.RW_table, fields.RW_dancing, '', 0 ),
				InHandField = getTableField( charCS, {}, fields.InHand_table, fields.InHand_miName ),
				InHandField = getTableField( charCS, InHandField, fields.InHand_table, fields.InHand_name ),
				index;

			var getRef = function( charCS, hand, forceFind=false ) {
				var ref = attrLookup(charCS,[fields.Init_hand[0]+hand,fields.Init_hand[1]],null,null,null,false,false);
				if (forceFind || _.isNaN(ref) || ref == '') ref = undefined;

				let miName = (InHandField.tableLookup( fields.InHand_miName, hand ) || InHandField.tableLookup( fields.InHand_name, hand ) || '');

				if (!_.isUndefined(ref) && !!miName && miName.dbName().length) {
					index = ((ref%2) > 0 ? ((ref-(1+(fields.MW_table[1]*2)))/2) : ((ref-(2+(fields.RW_table[1]*2)))/2));
					return [index,ref];
				}
				
				if (!_.isUndefined(index = MW_handFields.tableFind( fields.MW_hand, hand ))) {
					ref = (1 - (fields.MW_table[1] * 2)) + (index * 2);
				} else if (!_.isUndefined(index = RW_handFields.tableFind( fields.RW_hand, hand ))) {
					ref = (2 - (fields.RW_table[1] * 2)) + (index * 2);
				} else {
					if (!!miName && miName.dbName().length && miName !== '-') {
						if (!_.isUndefined(index = MW_handFields.tableFind( fields.MW_miName, miName ))) {
							ref = (1 - (fields.MW_table[1] * 2)) + (index * 2);
						} else if (!_.isUndefined(index = RW_handFields.tableFind( fields.RW_miName, miName ))) {
							ref = (2 - (fields.RW_table[1] * 2)) + (index * 2);
						} else if (!_.isUndefined(index = MW_handFields.tableFind( fields.MW_name, miName ))) {
							ref = (1 - (fields.MW_table[1] * 2)) + (index * 2);
						} else if (!_.isUndefined(index = RW_handFields.tableFind( fields.RW_name, miName ))) {
							ref = (2 - (fields.RW_table[1] * 2)) + (index * 2);
						};
					};
				};
				if (!forceFind) rememberWeapRef(charCS,hand,ref);
				return [index,ref];
			};

			if (!curToken) {
				throw new Error( 'The token_id does not represent a valid token' );
			}
			
			if (weapCount.melee + weapCount.ranged + shieldStyle) {
				[primeHand,primeRef] = getRef(charCS,0);
				[offHand,offRef] = getRef(charCS,1);
				[bothHands,bothRef] = getRef(charCS,2);
			}
			let isPrime = !_.isUndefined(primeHand),
				isOff = !_.isUndefined(offHand),
				isBoth = !_.isUndefined(bothHands);
			
			if (((weapCount.melee + weapCount.ranged + shieldStyle) > 0) && (!charButton || !charButton.length || charButton == -1)) {
				charButton = isBoth ? bothRef : (isPrime ? primeRef : (isOff ? offRef : charButton));
				let charHand = isBoth ? bothHands : (isPrime ? primeHand : offHand);
				if (!_.isUndefined(charHand)) {
					if ((charButton%2)>0) {
						handleInitMW( CharSheet.CHARACTER, charCS, [BT.MELEE,tokenID,charButton,charHand], senderId );
					} else {
						handleInitRW( CharSheet.CHARACTER, charCS, [BT.MELEE,tokenID,charButton,charHand], senderId );
					}
					return;
				}
			};
			if (weapCount.monster > 0 && (!charButton || !charButton.length || charButton == -1)) {
				charButton = 0;
				monButton = weapCount.monster > 1 ? 0 : 1;
				handleInitMonster( Monster.COMPLEX, charCS, [BT.MON_INNATE,tokenID,charButton,monButton], senderId );
				return;
			};

			tokenName = curToken.get('name');
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
					+ '{{subtitle=Initiative for Weapon Attacks}}';
					
			// Insert buttons for powers of Magic Items that are in-hand

			[inHandMIs,buttonID] = await inHandMIbuttons( tokenID, charCS, senderId, 0, (isMIattk ? charButton : -1), submitted, BT.MI_ATTACK );
			content += inHandMIs;
			charButton = isMIattk ? undefined : charButton;
			
			if (weapCount.melee > 1 || (weapCount.melee > 0 && shieldStyle > 0) || weapCount.monster > 1 || ((weapCount.melee+weapCount.ranged) > 0 && weapCount.monster > 0)) {
				if ((fighterLevel || rogueLevel || monsterLevel) && isPrime && isOff) {
					if (offRef == primeRef) [offHand,offRef] = getRef(charCS,0,true);
					content += '{{Fighter\'s & Rogue\'s Option='
							+  (submitted ? ('<span style=' + design.grey_button + '>') : '[')
							+  'Two Weapons'
							+  (submitted ? '</span>' : ('](!init --button ' + BT.TWOWEAPONS + '|' + tokenID + '|' + offRef + '|' + primeRef + '|' + offHand + '|' + primeHand + ')'))
							+  '}}';
				}
				if (hands > 2 || weapCount.monster > 1) {
					content += '{{Many Hands Option='
							+  (-2 == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['))
							+  'All Weapons'
							+  (((-2 == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.ALLWEAPONS + '|' + tokenID + '|' + -2 + '|' + -2 + ')')
							+  '}}';
				}
			}
			
			content += '{{desc=';

			content += makeMonAttkButtons( tokenID, charCS, senderId, charButton, monButton, submitted );
			content += await makeWeaponButtons( tokenID, senderId, charButton, submitted, BT.MELEE, BT.RANGED, true, true, true, state.initMaster.weapInit, MW_handFields, RW_handFields );

			content += MIandPowers( tokenID, submitted ) + '}}'
					+ '{{desc1=' + otherActions( MenuType.WEAPON, tokenID, charButton, submitted ) + '}}'
					+ '{{desc2=Select action above, then '
					+ (((charButton == -1) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((charButton == -1) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.WEAPON + '|' + monButton + ')')
					+ '}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};

    /*
    * Create the Primary Weapon Initiative menu for 2 weapon attacks.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makePrimeWeaponMenu(charCS,submitted,args,senderId) {

		try {
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
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
					+ '{{subtitle=Initiative for Two Weapon Attacks}}'
					+ '{{desc=**Choose Secondary Weapon**\n'
					+ 'or go back to [One Weapon](!init --button ' + BT.ONEWEAPON + '|' + tokenID + '|-1|-1)}}';
					
			content += '{{desc1=' + await makeWeaponButtons( tokenID, senderId, -1, submitted, BT.MW_PRIME, BT.RW_PRIME, false, null, null, state.initMaster.weapInit );

			content += '}}{{desc2=Select two weapons above, then '
					+ '<span style=' + design.grey_button + '>Submit</span>}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};

    /*
    * Create the Secondary Weapon Initiative menu for 2 weapon attacks.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	var makeSecondWeaponMenu = function(charCS,submitted,args,senderId) {

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
			weapMI,
			weaponList = [],
			highlight,
            content,
			dancingWeapons = '',
            header = true,
			w, i, a,
			rowCount,
			WeaponTable = getTableField( charCS, {}, fields.MW_table, fields.MW_name );
			WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_twoHanded, '', 0 );
			WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_dancing, '', 0 );
			WeaponTable = getTableField( charCS, WeaponTable, fields.MW_table, fields.MW_miName, '', 0 );
            
		tokenName = getObj( 'graphic', tokenID ).get('name');
		
		content = '&{template:'+fields.menuTemplate+'}{{name=What is ' + tokenName + ' doing?}}'
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
			weapName = WeaponTable.tableLookup( fields.MW_name, i );
			if (_.isUndefined(weapName)) {break;}
			twoHanded = WeaponTable.tableLookup( fields.MW_twoHanded, i ) != 0;
			dancing = WeaponTable.tableLookup( fields.MW_dancing, i ) != 0;
			if (!twoHanded && !dancing && weapName != '-') {
			    if (header) {
			        content += '**1H Melee weapons**\n';
			        header = false;
			    }
				weapMI = (WeaponTable.tableLookup( fields.MW_miName, i ) || weapName);
				if (state.initMaster.weapInit) {
					if (weapMI && weaponList.includes(weapMI.dbName())) continue;
					weaponList.push(weapMI.dbName());
				} else {
					weapMI = weapName;
				}
				highlight = (charButton == w) ? design.green_button : ((charButton2 == w) ? design.selected_button : design.dark_button);
				content += (!submitted) ? '[' : '';
				content += ((w == charButton || w == charButton2 || submitted) ? ('<span style=' + highlight + '>') : '');
				content += weapMI;
				content += (w == charButton || w == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + BT.MW_SECOND + '|' + tokenID + '|' + charButton + '|' + w + '|' + ((charButton-(1-(a*2)))/2) + '|' + i + ')') : '';
			} else if ((weapName != '-') && dancing) {
				dancingWeapons += '<span style='+(submitted ? design.grey_button : design.green_button)+'>'+weapMI+'</span>';
			}
		}

		if (!header) {
			content += '\n';
			header = true;
		}

		// build the character Ranged Weapons list
		WeaponTable = getTableField( charCS, {}, fields.RW_table, fields.RW_name );
		WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_twoHanded, '', 1 );
		WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_dancing, '', 0 );
		WeaponTable = getTableField( charCS, WeaponTable, fields.RW_table, fields.RW_miName, '', '' );
		
		a = fields.RW_table[1];
		weaponList = [];
		for (i = a; i < (fields.RWrows + a); i++) {
			w = (2 - (a * 2)) + (i * 2);
			weapName = WeaponTable.tableLookup( fields.RW_name, i );
			if (_.isUndefined(weapName)) {break;}
			twoHanded = WeaponTable.tableLookup( fields.RW_twoHanded, i ) != 0;
			dancing = WeaponTable.tableLookup( fields.RW_dancing, i ) != 0;
			if (!twoHanded && !dancing && weapName != '-') {
			    if (header) {
			        content += '**1H Ranged weapons**\n';
			        header = false;
			    }
				weapMI = (WeaponTable.tableLookup( fields.RW_miName, i ) || weapName);
				if (state.initMaster.weapInit) {
					if (weapMI && weaponList.includes(weapMI.dbName())) continue;
					weaponList.push(weapMI.dbName());
				} else {
					weapMI = weapName;
				}
				highlight = (charButton == w) ? design.green_button : ((charButton2 == w) ? design.selected_button : design.grey_button);
				content += (!submitted) ? '[' : '';
				content += ((w == charButton || w == charButton2 || submitted) ? ('<span style=' + highlight + '>') : '');
				content += weapMI;
				content += (w == charButton || w == charButton2 || submitted) ? '</span>' : '';
				content += (!submitted) ? ('](!init --button ' + BT.RW_SECOND + '|' + tokenID + '|' + charButton + '|' + w + '|' + (charButton-((2-(a*2))/2)) + '|' + i + ')') : '';
			} else if ((weapName != '-') && dancing && !dancingWeapons.includes(weapMI)) {
				dancingWeapons += '<span style='+(submitted ? design.dark_button : design.green_button)+'>'+weapMI+'</span>';
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
				
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};

    /*
    * Create the spell Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makeSpellMenu( spellCasterType, charCS, submitted, args, senderId ) {

		try {
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
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What Spell is ' + tokenName + ' planning to cast?}}'
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
						spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, r, c, false, false );
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
				sendParsedMsg( tokenID, (isMU ? Init_Messages.noMUspellbook : Init_Messages.noPRspellbook), null, flags.feedbackName );
				return;
			}
			
			dancers =  await makeWeaponButtons( tokenID, senderId, -1, submitted, '', '', true, true, false );

			content += (dancers.length ? '\n'+dancers : '')
					+  MIandPowers( tokenID, submitted ) + '}}'
					+ '{{desc1='+otherActions( (isMU ? MenuType.MUSPELL : MenuType.PRSPELL), tokenID, spellButton, submitted ) + '}}'
					+ '{{desc2=Select action above, then '
					+ (((spellButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((spellButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + spellButton + '|' + (isMU ? MenuType.MUSPELL : MenuType.PRSPELL) + ')')
					+ '}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};

    /*
    * Create the Magic Item Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makeMIBagMenu( charCS, submitted, args, senderId ) {

		try {
			var tokenID = args[1],
				charButton = args[2],
				tokenName,
				miName, miTable,
				content,
				dancers,
				r, rowAdj,
				inHandTitle = false,
				inBagTitle = false,
				inHandMIs = '',
				buttonID = 0;
				
			tokenName = getObj( 'graphic', tokenID ).get('name');
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What Magic Item is ' + tokenName + ' planning to use?}}'
					+ '{{subtitle=All ' + tokenName + '\'s Magic Items}}';
					
			// build the in-hand Magic Item Powers list
			
			[inHandMIs,buttonID] = await inHandMIbuttons( tokenID, charCS, senderId, buttonID, charButton, submitted, BT.MI_POWER );
			content += inHandMIs;
			
			// build the Magic Item list
			
			miTable = getTableField( charCS, {}, fields.Items_table, fields.Items_name );
			for (r = miTable.table[1]; !_.isUndefined(miName = miTable.tableLookup( fields.Items_name, r, false )); r++) {
				if (miName != '-') {
					if (!inBagTitle) {
						content += '{{Section2=Magic Items in Bag\n';
						inBagTitle = true;
					}
					content += (buttonID == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
					content += miName;
					content += (((buttonID == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.MI_BAG + '|' + tokenID + '|' + buttonID + '|' + r + ')');
				}
				buttonID++;
			}
			if (inBagTitle) {
				content += '}}';
			}

			if (!inHandTitle && !inBagTitle) {
				sendParsedMsg( tokenID, Init_Messages.noMIBag, null, flags.feedbackName );
				return;
			}

			dancers =  await makeWeaponButtons( tokenID, senderId, -1, submitted, '', '', true, true, false );

			content += (dancers.length ? '\n'+dancers : '')
					+ '{{desc1=' + otherActions( MenuType.MIBAG, tokenID, charButton, submitted ) + '}}'
					+ '{{desc2=Select action above, then '
					+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.MIBAG + ')')
					+ '}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};

    /*
    * Create the Powers Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makePowersMenu( charCS, submitted, args, senderId ) {

		try {
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
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What Power is ' + tokenName + ' planning to use?}}'
					+ '{{subtitle=All available Powers}}'
					+ '{{desc=';

			// build the Powers list
			
			for (r = 0; r < fields.PowerRows; r++) {
				c = fields.PowersBaseCol;
				for (w = 1; w <= fields.PowersCols; w++) {
					qty = attrLookup( charCS, fields.Spells_castValue, fields.Powers_table, r, c );
					powerName = attrLookup( charCS, fields.Powers_name, fields.Powers_table, r, c, false, false );
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
				sendParsedMsg( tokenID, Init_Messages.noPowers, null, flags.feedbackName );
				return;
			}
			
			dancers = await makeWeaponButtons( tokenID, senderId, -1, submitted, '', '', true, true, false );

			content += (dancers.length ? '\n'+dancers : '')
					+ '}}{{desc1=' + otherActions( MenuType.POWER, tokenID, charButton, submitted ) + '}}'
					+ '{{desc2=Select action above, then '
					+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.POWER + ')')
					+ '}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};

    /*
    * Create the Thieving Actions Initiative menu.
    * Highlight buttons specified with a number (-1 means no highlight)
    */

	async function makeThiefMenu( charCS, submitted, args, senderId ) {

		try {
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
				sendParsedMsg( tokenID, Init_Messages.notThief, null, flags.feedbackName );
			}
			
			tokenName = getObj( 'graphic', tokenID ).get('name');
			
			// find armour type
			
			armourType = (attrLookup( charCS, fields.Armor_name ) || 'leather' ).toLowerCase();
			switch (armourType.toLowerCase()) {
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
					sendParsedMsg( tokenID, Init_Messages.heavyArmour, null, flags.feedbackName );
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
			
			content = '&{template:'+fields.menuTemplate+'}{{name=What Thieving ability is ' + tokenName + ' planning to use?}}'
					+ '{{subtitle=' + tokenName + '\'s thieving abilities}}'
					+ '{{desc=';
					
			for (let i=0; i<8; i++) {
				content += (i == charButton ? '<span style=' + design.selected_button + '>' : (submitted ? '<span style=' + design.grey_button + '>' : '['));
				content += ability[i].name + '(' + ability[i].skill + '%)';
				content += (((i == charButton) || submitted) ? '</span>' : '](!init --button ' + BT.THIEF + '|' + tokenID + '|' + i + '|' + ability[i].name + ' ' + ability[i].skill + '% |' + ability[i].speed + ')');
			}
			
			dancers = await makeWeaponButtons( tokenID, senderId, -1, submitted, '', '', true, true, false );

			content += (dancers.length ? '\n'+dancers : '')
					+ '}}{{desc1=' + otherActions( MenuType.THIEF, tokenID, charButton, submitted ) + '}}'
					+ '{{desc2=Select action above, then '
					+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
					+ 'Submit'
					+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.THIEF + ')')
					+ '}}';

			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	};
	
	/*
	 * Make a menu of all types of actions that the character can perform, so
	 * the Player can choose which to do Initiative with.
	 */

	var makeInitMenu = function( charCS, monster, args, senderId ) {
		
		var tokenID = args[1],
			tokenName = getObj( 'graphic', tokenID ).get('name'),
//			charCS = getCharacter(tokenID,false),
		    content = '&{template:'+fields.menuTemplate+'}{{name=What does ' + tokenName + ' want to do?}}'
					+ '{{subtitle=' + tokenName + '\'s possible activities}}'
					+ '{{Section=';
					
		content += '[Attack](!init ' + (monster == CharSheet.MONSTER ? '--complex ' : '--weapon ') + tokenID + ')';
		if (casterLevel( charCS, 'MU' )) {
			content += '[Cast MU Spell](!init --muspell ' + tokenID + ')';
		}
		if (casterLevel( charCS, 'PR' )) {
			content += '[Cast PR Spell](!init --prspell ' + tokenID + ')';
		}
		if (checkForPowers(charCS)) {
			content += '[Use Power](!init --power ' + tokenID + ')';
		}
		if (checkForMIs(charCS)) {
			content += '[Use Magic Item](!init --mibag ' + tokenID + ')';
		}
		content += '[Use Thieving Skills](!init --thief ' + tokenID + ')}}';
		content += '{{Section1='+otherActions( MenuType.OTHER, tokenID, 0, false )+'}}';
		content += '{{Section2=[Check Initiative Modifiers](!init --checkinit '+tokenID+'||menu)}}';
				
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	}
	
	async function makeOtherMenu( charCS, submitted, args, senderId ) {
	
		try {
			var tokenID = args[1],
				charButton = args[2],
				tokenName = getObj( 'graphic', tokenID ).get('name'),
				dancers = await makeWeaponButtons( tokenID, senderId, -1, submitted, '', '', true, true, false ),

				content = '&{template:'+fields.menuTemplate+'}{{name=What does ' + tokenName + ' want to do?}}'
						+ '{{subtitle=' + tokenName + '\'s possible activities}}'
						+ '{{desc='+ otherActions( MenuType.OTHER, tokenID, charButton, submitted )
						+ (dancers.length ? '\n'+dancers : '')
						+ '}}{{desc1=Select action above, then '
						+ (((charButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
						+ 'Submit'
						+ (((charButton < 0) || submitted) ? '</span>' : '](!init --button ' + BT.SUBMIT + '|' + tokenID + '|' + charButton + '|' + MenuType.OTHER + ')')
						+ '}}';
			
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('InitMaster',msg_orig[senderId],e);
		}
	}

	/*
	 * Make a dialog to show factors that affect initiative,
	 * and allow the player to set a manual modifier
	 */
	
	var makeCheckInitMenu = function( tokenID, charCS, senderId, silent=false, msg='', menu='' ) { //specs
		
		const parseTable = {initmod:reClassSpecs.initmod,initmult:reClassSpecs.initmult,rules:reACSpecs.rules},
			  classes = classObjects( charCS, senderId, parseTable ),
			  race = (attrLookup( charCS, fields.Race ) || 'human').dbName(),
			  tokenName = getObj('graphic',tokenID).get('name');
		var ItemNames = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
			ItemNames = getTableField( charCS, ItemNames, fields.Items_table, fields.Items_trueName ),
			Inits = getTable( charCS, fieldGroups.INIT ),
			totalMod = 0,
			eqModFlag = false,
			totalMult = 1,
			eqMultFlag = false,
			content = '&{template:'+fields.menuTemplate+'}{{title=Current Initiative Modifiers\n for '+tokenName+'}}'
					+ (!!msg && msg.length ? '{{Section='+msg+'}}' : '');
		
		const assessInit = function( name, mod, mult, remove=false ) {
			let eqMod = mod[0] === '=',
				eqMult = mult[0] === '=';

			mod = parseFloat( eqMod ? mod.slice(1) : mod );
			if (eqMod && !isNaN(mod)) totalMod = eqModFlag ? Math.min(mod,totalMod) : mod;
			eqModFlag = eqModFlag || eqMod;

			mult = parseFloat( eqMult ? mult.slice(1) : mult );
			if (eqMult && !isNaN(mult)) totalMult = eqMultFlag ? Math.max(mult,totalMult) : mult;
			eqMultFlag = eqMultFlag || eqMult;
			
			let modFlag = !isNaN(mod) && (mod != 0),
				multFlag = !isNaN(mult) && (mult != 1);
			if (!modFlag && !multFlag) return '';
			let desc = '{{'+name.dispName()+'=';
			if (modFlag) {
				if (!eqMod) totalMod += mod;
				desc += (eqMod ? 'Overriding ' : '')+(mod < 0 ? 'Beneficial' : 'Penalty')+' mod of '+(mod>0 ? '+' : '')+mod+(multFlag ? '\n' : '');
			}
			if (multFlag) {
				if (!eqMult) totalMult *= mult;
				desc += (eqMult ? 'Overriding ' : '')+(mult > 1 ? 'Beneficial' : 'Penalty')+' speed mult x '+mult;
			};
			if (remove) {
				desc += ' \n[Remove](!init --setmods '+tokenID+'|del|'+name+'|0|1)';
			}
			desc += '}}';
			return desc;
		};
		
		setAttr( charCS, fields.Init_fixInit, '' );
		
		_.each( classes, c => {
			content += assessInit( c.obj[1].name, c.classData.initmod, c.classData.initmult );
		});
		let raceData = resolveData( race, fields.RaceDB, reClassRaceData, charCS, parseTable ).parsed;
		content += assessInit( race, raceData.initmod, raceData.initmult );
		
		let conflict = '',
			itemClasses = [],
			itemSuperTypes = [],
			nameArray = [],
			item = '';
		for (let r = 0; !_.isUndefined(item = ItemNames.tableLookup( fields.Items_name, r, false )); r++) {
			if (item === '-') continue;
			let trueItem = ItemNames.tableLookup( fields.Items_trueName, r ),
				itemData = resolveData( trueItem, fields.MagicItemDB, reNotAttackData, charCS, parseTable, r ).parsed,
				itemObj = abilityLookup( fields.MagicItemDB, trueItem ),
				addRules = itemData.rules.split('|').map( r => (r[0] === '-' ? '-' : '')+r.dbName() ),
				specsArray = (!!itemObj.obj ? itemObj.specs() : ['-','-','magic','1H','-']);
			if (itemObj.obj) {
				itemSuperTypes = _.uniq(itemSuperTypes.concat(specsArray.map( c => c[4].dbName() ).join('|').split('|')));
				itemClasses = _.uniq(itemClasses.concat(specsArray.map( c => c[2].dbName() ).join('|').split('|')));
			};
			if (itemData.initmod == 0 && itemData.initmult == 1) continue;
			let	inHand = !itemData.rules || !itemData.rules.includes('+inhand') || !_.isUndefined(getTableField( charCS, {}, fields.InHand_table, fields.InHand_trueName ).tableFind( fields.InHand_trueName, trueItem ));
			let worn = !itemData.rules || !itemData.rules.includes('+worn') || classAllowedItem( charCS, trueItem, specsArray[0][1].dbName(), specsArray[0][4].dbName(), 'weaps' );
			let adds = !itemData.rules || (!_.some(itemClasses,c => {conflict=c;return addRules.includes( '-'+c )}) && !_.some(itemSuperTypes,mi => {conflict=mi;return addRules.includes('-'+mi)}));
			let nameIndex = nameArray.findIndex( (n,i) => n[0] === item );
			if (nameIndex >= 0) {
				item += ' '+(++nameArray[nameIndex][1]);
			} else {
				nameArray.push([item,1]);
			};
			if (!inHand) {content += '{{'+item.dispName()+'=Is not in-hand so does not affect initiative}}';
			} else if (!worn) {content += '{{'+item.dispName()+'=Is not of a usable type so does not affect initiative}}';
			} else if (!adds) {content += '{{'+item.dispName()+'=Does not combine with '+conflict+' so does not affect initiative}}';}
			if (!inHand || !worn || !adds) continue;
			content += assessInit( item, itemData.initmod, itemData.initmult );
		};

		for (let r = 0; !_.isUndefined(item = Inits.tableLookup( fields.InitMagic_name, r, false )); r++ ) {
			if (item === '-') continue;
			if (item.length === 0) {
				Inits = Inits.delTableRow( r );
			} else if (Inits.tableLookup( fields.InitMagic_cmd, r ) === 'fix') {
				let fixMod = Inits.tableLookup( fields.InitMagic_mod, r );
				setAttr( charCS, fields.Init_fixInit, fixMod );
				content += '{{'+item.dispName()+'=Fixed initiative of '+fixMod+'}}';
			} else content += assessInit( item, Inits.tableLookup( fields.InitMagic_mod, r ), Inits.tableLookup( fields.InitMagic_mult, r ), true );
		};
		
		let modAdj = parseFloat(attrLookup( charCS, fields.InitModAdjust )) || 0,
			modSign = (modAdj > 0 ? '+' : ''),
			multAdj = parseFloat(attrLookup( charCS, fields.InitMultAdjust )) || 1;
		totalMod += modAdj;
		totalMult *= multAdj;
		content += '{{Manual Adjustments=[Mod Adjustment](!init --setmods '+tokenID+'|mod|&#63;{What do you want to call this modifier?|adjustment}|&#63;{What modifier should be added to initiative speed (-ve beneficial?&#41;}) and'
				+  '[Mult Adjustment](!init --setmods '+tokenID+'|mult|&#63;{What do you want to call this multiplier?|adjustment}||&#63;{What multiplier should be applied to the initiative speed (>1 beneficial&#41;?})}}';
		
		content += '{{Totals=Mod of **'+(totalMod > 0 ? '+' : '')+totalMod+'** and Mult of **x'+totalMult+'**}}'
				+  '{{desc=Select button above to set a manual adjustment to these totals.\n'
				+  '**Modifier** less than 0 is beneficial\n'
				+  '**Multiplier** greater than 1 is beneficial}}'
				+  (menu && menu.length ? ('{{desc1=[Return to menu](!init --'+menu+')}}') : '');
		
		setAttr( charCS, fields.initMod, totalMod );
		setAttr( charCS, fields.initMultiplier, totalMult );
		
//		log('makeCheckInitMenu: content = '+content);
		if (!silent) sendResponse( charCS, content, senderId );
		return {mod:totalMod,mult:totalMult};
	}
			
//------------------------------------- do commands --------------------------------------------

	/**
	 * Show help message
	 */ 
	var showHelp = function() {

	var handoutIDs = getHandoutIDs();
	var content = '&{template:'+fields.menuTemplate+'}{{title=InitiativeMaster Help}}{{InitMaster Help=For help on !init commands [**Click Here**]('+fields.journalURL+handoutIDs.InitiativeMasterHelp+')}}{{Character Sheet Setup=For help on setting up character sheets for use with RPGMaster APIs, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterCharSheetSetup+')}}{{RPGMaster Templates=For help using RPGMaster Roll Templates, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterLibraryHelp+')}}';

		sendFeedback(content,flags.feedbackName,flags.feedbackImg); 
	}; 
	
    /**
     * Function to allow players to redo initiative
     * TODO handle a configurable callback to the DM to allow or otherwise
     * a player to redo initiative
     **/
   
    var doRedo = function( args, selected, senderId ) {
        
        if (!args)
            {return;}
            
        if (args.length < 1) {
            sendError( 'Invalid initMaster redo command syntax',msg_orig[senderId] );
			return;
        }
        
        var tidyCmd,
            tokenName,
            charCS,
            prevRound,
            tokenID = args[0],
			silent = args[1] && args[1].toUpperCase() === 'SILENT';
            
        if (!(charCS = getCharacter( tokenID ))) {
			if (!silent) {
				sendError( 'The selected token does not represent a character sheet' ,msg_orig[senderId]);
			}
            return;
        }
        
        tokenName = getObj( 'graphic', tokenID ).get('name');
        setAttr( charCS, ['prev-round'+tokenID, 'current'], 0 );
        
        tidyCmd = fields.roundMaster+' --removefromtracker ' + tokenName + '|' + tokenID + '|0';
        sendAPI( tidyCmd, senderId );
		
		if (silent) {
			sendWait(senderId,0);
			return;
		}
        
        sendParsedMsg( tokenID, Init_Messages.redoMsg, senderId, flags.feedbackName );
		doInitMenu(args,selected,MenuType.MENU,senderId);
        
    };


    /**
     * Function to set the current round.  generally used as an
     * internal call from the !rm roundMaster API to notify
     * initMaster of the new round
     **/
   
     var doIsRound = function(args,senderId) {
        if (!args)
            {return;}
        
        if (args.length < 1 || args.length > 2) {
			sendError('Invalid initMaster isround syntax',msg_orig[senderId]);
			return;
        }
        
        var round = parseInt(args[0],10),
            changedRound = (args[1] || false);
			
        if (_.isNaN(round)) {
			sendError( 'Invalid initMaster round number',msg_orig[senderId] );
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
	
	var doCarryOver = function( tokenID, charCS, initMenu, senderId ) {

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

		content = '&{template:'+fields.menuTemplate+'}'
				+ '{{name=What is ' + getObj( 'graphic', tokenID ).get('name') + ' doing?}}'
				+ '{{subtitle=Continue Long Action}}'
				+ '{{desc=Continue ' + init_action + ' for '
				+ '<span style=' + design.boxed_number + '>' + Math.ceil(init_speed/10) + '</span>'
				+ ' more rounds or do something else?}}'
				+ '{{desc1=[Continue](!init --button ' + BT.SUBMIT + '|' + tokenID + '|-1|' + MenuType.CARRY + ')'
				+ ' [Something Else](!init --button ' + BT.CARRY + '|' + tokenID + '|-1|' + initMenu + ')}}';
				
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;	
	};
	
	/**
	* Internal command function to accept rolled parameters
	* and display a menu with the Submit button enabled after
	* handling an action selection.
	**/

	var doBuildMenu = function( args, senderId ) {
		
		if (!args) {
			return;
		}
		if (args.length < 8) {
			sendError('Invalid initMaster syntax',msg_orig[senderId]);
			return;
		};
		senderId = args.shift();
		var menu = args[0],
			tokenID = args[1],
			charCS;
			
		if (!(charCS = getCharacter( tokenID ))) {
			sendError( 'The selected token does not represent a character sheet',msg_orig[senderId] );
			return;
		}
		setInitVars( charCS, args, 'current');
		buildMenu( menu, charCS, MenuState.ENABLED, args, senderId );
		return;
	}
	
	/*
	* Function to display the menu for doing initiative.
	*/

	var doInitMenu = function( args, selected, initMenu, senderId ) {
		
		if (!initMenu)
			{return;}
			
		if (!args) args = [];
			
		if (selected && selected.length) {
			args[0] = initSelection[senderId] && initSelection[senderId].length ? initSelection[senderId][0]._id : selected[0]._id;
		} else if (!args[0]) {
            sendError( 'No token selected',msg_orig[senderId] );
            return;
 		}
		
		if (!initSelection[senderId]) initSelection[senderId] = [];
		if ((!initMenu || initMenu === MenuType.MENU) && !initSelection[senderId].length) initSelection[senderId] = Array.from(selected);
		
		var tokenID = args[0],
			curToken = getObj( 'graphic', tokenID ),
			isGM = playerIsGM(senderId),
			charID, charCS, foe,
			initRoll, init_carry;
			
		if (!(charCS = getCharacter( tokenID ))) {
			if (initSelection[senderId] && initSelection[senderId].length) {
				(initSelection[senderId] || [0]).shift();
				setTimeout( () => doInitMenu( args, initSelection[senderId], initMenu, senderId ), 0 );
				return;
			} else {
				sendError( 'The selected token does not represent a character sheet',msg_orig[senderId] );
				return;
			}
		}
		foe = charCS.get('controlledby').length == 0;
		initRoll = foe ? state.initMaster.dmRoll : state.initMaster.playerRoll;
		
		if (state.initMaster.initType == 'standard') {
			sendParsedMsg( tokenID, Init_Messages.stdInit, null, flags.feedbackName );
			return;
		} else if (state.initMaster.initType == 'group' && isNaN(initRoll)) {
			sendParsedMsg( tokenID, Init_Messages.notYet, null, flags.feedbackName );
			return;
		}
		var content = '',
		    charName = charCS.get('name'),
			tokenName = curToken.get('name'),
			changedRound = state.initMaster.changedRound,
			roundCounter = state.initMaster.round,
			prevRound = (attrLookup( charCS, [fields.Prev_round[0] + tokenID, fields.Prev_round[1]], null, null, null, true ) || 0),
			init_submitVal = (changedRound || (prevRound != roundCounter) ? 1 : 0 );
			
		setAttr( charCS, fields.Init_done, 0 );
		setAttr( charCS, fields.Init_submitVal, init_submitVal );
		
		if (isGM && (!initMenu || initMenu === MenuType.MENU) && (!_.isUndefined(initMarkers) || (selected && selected.length))) {
			if (!initMarkers) initMarkers = {};
			let page = curToken.get('_pageid'),
				size = Math.round(Math.max(curToken.get('width'),curToken.get('height')) * initMarkerRatio);
			if (!initMarkers[page]) initMarkers[page] = {};
			if (!initMarkers[page][senderId]) {
				initMarkers[page][senderId] = createObj("graphic",{pageid:page,subtype:"token",name:'initMarker',imgsrc:design.initSelect,controlledby:senderId,layer:"gmlayer",isdrawing:true,});
			}
			initMarkers[page][senderId].set({top:curToken.get('top'),left:curToken.get('left'),width:size,height:size,layer:(isGM ? "gmlayer" : "map")});
			if (isGM) {
				toBack(initMarkers[page][senderId]);
			} else {
				toFront(initMarkers[page][senderId]);
			}
		}
		if (!init_submitVal) {

			sendParsedMsg( tokenID, Init_Messages.doneInit, senderId, flags.feedbackName );
			return;
		};
		
		init_carry = parseInt(attrLookup( charCS, fields.Init_carry ) || 0);
		if (init_carry !== 0) {

			doCarryOver( tokenID, charCS, initMenu, senderId );
			return;
		}

        args.unshift(initMenu);
		args[2] = -1;
		buildMenu( initMenu, charCS, MenuState.ENABLED, args, senderId );
		return;

    };
	
	/*
	 * Display the dialog describing the factors currently affecting the
	 * selected character's initiative rolls, including class, race,
	 * magic items and spells currently in effect. Allow the player
	 * to set manual adjustments if required.
	 */
	 
	var doShowInitFactors = function( args, selected, senderId ) {
		
		if (!args) args = [];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doShowInitFactors: tokenID is invalid' );
			sendError( 'No token selected' );
			return;
		}
		
		var tokenID = args[0],
			silent = (args[1] || '').toLowerCase() === 'silent',
			menu = args[2],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError( 'Invalid token selected' );
			return;
		}
			
		makeCheckInitMenu( tokenID, charCS, senderId, silent, '', menu );
		return;
	}

	/*
	 * Handle a spell, power, or other magic affecting the initiative 
	 * of a character
	 */
 
	var doMagicInitEffect = function( args, selected, senderId, silent ) {
		
		if (!args) args = [];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doMagicInitEffect: tokenID is invalid' );
			sendError( 'No token selected' );
			return;
		}

		var tokenID = args[0],
			cmd = (args[1] || '').toLowerCase(),
			name = args[2],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError( 'Invalid token selected' );
			return;
		}
		
		var InitMagic = getTable( charCS, fieldGroups.INIT ),
			initIndex = InitMagic.tableFind( fields.InitMagic_name, name ),
			modOp = '=+-*/'.includes((args[3] || ' ')[0]),
			modEq = (args[3] || ' ')[0] === '=' ? '=' : '',
			multOp = '=+-*/'.includes((args[4] || ' ')[0]),
			multEq = (args[4] || ' ')[0] === '=' ? '=' : '',
			modVal = (modOp ? args[3].slice(1) : args[3]) || 0,
			multVal = (multOp ? args[4].slice(1) : args[4]) || 1,
			silent = silent || ((args[5] || '').toLowerCase() === 'silent'),
			values = initValues( InitMagic.fieldGroup ),
			msg = '';
			
		if (_.isUndefined(initIndex) && (modVal !== 0 || multVal !== 1)) {
			modVal = evalAttr( args[3] || modVal );
			multVal = evalAttr( args[4] || multVal );
			msg = 'Added new magic initiative effect *'+name+'* with mod '+(modVal>0 ? '+' : '')+modVal+' and mult '+'x'+multVal;
			values[fields.InitMagic_cmd[0]][fields.InitMagic_cmd[1]] = cmd;
			values[fields.InitMagic_name[0]][fields.InitMagic_name[1]] = name;
			values[fields.InitMagic_mod[0]][fields.InitMagic_mod[1]] = modVal;
			values[fields.InitMagic_mult[0]][fields.InitMagic_mult[1]] = multVal;
			InitMagic = InitMagic.addTableRow( initIndex, values );
			
		} else if (!_.isUndefined(initIndex)) {
			let curMod = InitMagic.tableLookup( fields.InitMagic_mod, initIndex ),
				curMult = InitMagic.tableLookup( fields.InitMagic_mult, initIndex );
			modVal = evalAttr( modEq ? args[3] : (modOp ? curMod+args[3] : modVal) );
			multVal = evalAttr( multEq ? args[3] : (multOp ? curMult+args[3] : multVal) );

			if (cmd === 'del' || (modVal === 0 && multVal === 1)) {
				InitMagic = InitMagic.delTableRow( initIndex );
				msg = 'Initiative effect *'+name+'* has been removed';
			} else {
				InitMagic = InitMagic.tableSet( fields.InitMagic_cmd, initIndex, cmd );
				switch (cmd) {
				case 'fix':
				case 'mod':
					InitMagic = InitMagic.tableSet( fields.InitMagic_mod, initIndex, modVal );
					msg = (cmd === 'fix' ? (name+' fixes initiative to be ') : ('Changed *'+name+'* Initiative modifier to be '))+(modVal>0 ? '+' : '')+modVal;
					break;
				case 'mult':
					InitMagic = InitMagic.tableSet( fields.InitMagic_mult, initIndex, multVal );
					msg = 'Changed *'+name+'* Initiative multiplier to be '+'x'+multVal;
					break;
				default:
					InitMagic = InitMagic.tableSet( fields.InitMagic_mod, initIndex, modVal );
					InitMagic = InitMagic.tableSet( fields.InitMagic_mult, initIndex, multVal );
					msg = 'Changed *'+name+'* Initiative modifier to be '+(modVal>0 ? '+' : '')+modVal+' and multiplier to be '+multVal;
					break;
				};
			};
		}
		makeCheckInitMenu( tokenID, charCS, senderId, silent, msg );
		return;
	}

	/*
	 * Make the menu for managing initiative each round, including
	 * changing initiative type, changing the listed Player Characters,
	 * and rolling Initiative dice for Standard & Group 
	 * Initiative as per the AD&D2e DMG 
	 */
	 
	var doInitDiceRoll = function( args, msg='', senderId ) {   // button
		
		var playerRoll = parseInt(args[0] || NaN),
			dmRoll = parseInt(args[1] || NaN),
			cmd = (args[2] || '').toLowerCase(),
			argStr = (args[0] || '') + '|' + (args[1] || ''),
			charStr = _.pluck(state.initMaster.playerChars,'name').join(', '),
			content = '&{template:'+fields.menuTemplate+'}'
					+ '{{name=Initiative Dice Rolls}}'
					+ '{{subtitle=For Standard & Group Initiative}}'
					+ (msg.length ? ('{{ ='+msg+'\n}}') : '' )
					+ '{{Section=Current Player Characters\n**'+charStr+'**\n\n'
					+ '[PCs all maps](!init --list-pcs all|'+argStr+') [PCs this map](!init --list-pcs map|'+argStr+') '
					+ '[Add selected to PCs](!init --list-pcs add|'+argStr+') [Replace with selected PCs](!init --list-pcs replace|'+argStr+')}}'
					+ '{{Section1=Initiative type is currently\n'
					+ ((state.initMaster.initType == 'standard') ? ('<span style='+design.selected_button+'>Standard</span> ') : '[Standard](!init --type standard|'+argStr+') ')
					+ ((state.initMaster.initType == 'group') ? ('<span style='+design.selected_button+'>Group</span> ') : '[Group](!init --type group|'+argStr+') ')
					+ ((state.initMaster.initType == 'individual') ? ('<span style='+design.selected_button+'>Individual</span>') : '[Individual](!init --type individual|'+argStr+')')
					+ '}}';
		if (state.initMaster.initType !== 'individual') {
			state.initMaster.playerRoll = playerRoll;
			state.initMaster.dmRoll = dmRoll;
			args[2] = '';
//			doInitRoll( args, true, senderId );
			content +='{{Section2=Ask a Player to roll 1d10 and also roll 1d10 as DM, then enter the values below\n'
					+ '['+(isNaN(playerRoll) ? ('Enter Party Roll') : ('<span style='+design.selected_button+'>Party Rolled '+playerRoll+'</span>'))+'](!init --roll &#63;{Enter 1d10 roll|&#124;1&#124;2&#124;3&#124;4&#124;5&#124;6&#124;7&#124;8&#124;9&#124;10}|'+dmRoll+'|menu)'
					+ '['+(isNaN(dmRoll) ? ('Enter Foes Roll') : ('<span style='+design.selected_button+'>DM Rolled '+dmRoll+'</span>'))+'](!init --roll '+playerRoll+'|&#63;{Enter 1d10 roll|&#124;1&#124;2&#124;3&#124;4&#124;5&#124;6&#124;7&#124;8&#124;9&#124;10}|menu)'
					+ '}}';
		};
		content += '{{section3=Choose Attack Initiative detail level\n'
				+  (state.initMaster.weapInit ? ('<span style='+design.selected_button+'>By Weapon</span> ') : '[By Weapon](!init --init-level weapon) ')
				+  (!state.initMaster.weapInit ? ('<span style='+design.selected_button+'>By Action</span> ') : '[By Action](!init --init-level action) ')
				+  '}}';
		if (state.initMaster.initType !== 'standard') {
			content +='{{Section4=Check that all Characters have specified what they are doing\n'
					+ '[Check Tracker Complete](!init --check-tracker roll|'+argStr+')}}';
		};
		if (cmd == 'disptoggle') state.initMaster.dispRollOnInit = !state.initMaster.dispRollOnInit;
		content += '{{Section5=['+(state.initMaster.dispRollOnInit ? ('<span style='+design.selected_button+'>Auto-displaying</span>') : 'Auto-display')+'](!init --init '+args[0]+'|'+args[1]+'|dispToggle) on new round}}';
		
		if (cmd != 'rounds' || state.initMaster.dispRollOnInit) {
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		} else {
			sendWait(senderId,0,'init');
		}
		return;
	};
	
	/*
	 * Record an initiative roll made if doing 'standard'
	 * or 'group' initiative
	 */
	 
	var doInitRoll = function( args, isGM, senderId ) {
		
		var playerRoll = args[0] || NaN,
			dmRoll = args[1] || NaN,
			isMenu = ((args[2] || '') === 'menu');
			
		if (!isGM && !isNaN(state.initMaster.playerRoll)) return;

		if (!isMenu && isNaN(playerRoll)) {
			args[0] = state.initMaster.playerRoll;
		}
		if (!isMenu && (!isGM || isNaN(dmRoll))) {
			args[1] = state.initMaster.dmRoll;
		}

		if (state.initMaster.initType == 'standard' && (!isNaN(args[0]) || !isNaN(args[1]))) {
			let page = Campaign().get('playerpageid'),
				tracker = Campaign().get('initiativepage'); 
			if (page !== tracker) Campaign().set('initiativepage', page);
			if (!tracker) sendAPI('!rounds --start start');
		}

		if (!isNaN(args[0]) && state.initMaster.initType == 'standard') {
			_.each(_.shuffle(state.initMaster.playerChars), obj => sendAPI( fields.roundMaster+' --addtotracker '+obj.name+'|'+obj.id+'|='+args[0]+'|last|doing an action' ), senderId);
		}
		if (!isNaN(args[1]) && state.initMaster.initType == 'standard') {
			sendAPI( fields.roundMaster+' --addtotracker Foes|-1|='+args[1]+'|last', senderId );
		}
		if (isMenu) {
			doInitDiceRoll( args, (isNaN(playerRoll) && isNaN(dmRoll) ? '' : 'Dice Roll made'), senderId );
		} else {
			sendWait(senderId,0);
		}
		return;
	}
	
	/*
	 * Set the type of initiative to one of 'standard', 'group', or 'individual'
	 * See the DMG p55 for details of each type
	 */
	 
	var doSetInitType = function( args, senderId ) {
		
		if (!['standard','group','individual'].includes(args[0].toLowerCase())) {
			sendError('Invalid initMaster initiative type',msg_orig[senderId]);
			return;
		}

		var msg ='Set initiative type to '+args[0];
		
		state.initMaster.initType = args[0].toLowerCase();
		args.shift();
		if (args.length) {
			doInitDiceRoll( args, msg, senderId );
		} else {
			sendFeedback( msg,flags.feedbackName,flags.feedbackImg );
		}
		return;
	}
	
	/*
	 * Modify the list of current player tokens which are
	 * used for checking if all characters have completed
	 * their initiative selections, and for "End of Day" processing.
	 */
	 
	var doCharList = function( args, selected, senderId ) {
		
		var listType = (args[0] || '').toLowerCase(),
			msg = '',
			curToken, charID, charCS;
		
		switch( listType.toLowerCase() ) {
		case 'all':
			state.initMaster.playerChars = getPlayerCharList();
			msg = 'All player-controlled tokens on all maps added to list';
			break;
		case 'map':
			state.initMaster.playerChars = getPlayerCharList(Campaign().get('playerpageid'));
			msg = 'All player-controlled tokens on the current map added to list';
			break;
		case 'replace':
			state.initMaster.playerChars = [];
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
			sendError(('Invalid initMaster character list command "'+listType+'". Must be one of *all, map, replace* or *add*'),msg_orig[senderId]);
		};
		args.shift();
		if (args.length) {
			doInitDiceRoll( args, msg, senderId );
		} else {
			sendFeedback( msg,flags.feedbackName,flags.feedbackImg );
		}
		return;
	}

	/*
	 * Check the Tracker against the current list of Player Character
	 * tokens to see if they are all represented.  Display a list of those
	 * who have not yet completed initiative.
	 */
	 
	var doCheckTracker = function( args, senderId ) {
		
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
			doInitDiceRoll( args, msg, senderId );
		} else {
			let content = '&{template:'+fields.menuTemplate+'}{{name=Check Tracker}}{{desc=' + msg +'}}'
					+ (tokenList.length ? '{{desc1=[Check again](!init --check-tracker)}}' : '');
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );
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
		
		var	content = '&{template:'+fields.menuTemplate+'}{{name=Initiative Maintenance Menu}}'
					+ '{{desc=**Turn Order**\n'
					+ '[Start/Pause](!rounds --start&#13;&#47;w gm Tracker started/paused)\n'
					+ '[Start Melee](!rounds --clearonround on --clear&#13;&#47;w gm Started Melee, Tracker will clear each round ready for next initiative)'
						+ '[Stop-melee](!rounds --clearonround off&#13;&#47;w gm Stopped Melee, Tracker will not clear each round, but will cycle round)'
						+ '[Re-start](!rounds --sort&#13;&#47;w gm Tracker restarted at start of current round)\n'
					+ '[Set round no.](!rounds --reset &#63;{To round number?}&#13;/w gm Turn Order set to round &#63;{To round number?})'
						+ '[Clear Turn Order](!rounds --clear&#13;&#47;w gm Tracker cleared)'
						+ '[Remove Tokens from Tracker](!rounds --removefromtracker&#13;&#47;w gm Cleared all entries for selected tokens from the Tracker)\n'
					+ '**Status Markers**\n'
					+ 'Select one or multiple tokens\n'
					+ '[Edit Selected Tokens](!rounds --edit)[Move Token Status](!rounds --moveStatus)[Clean Selected Tokens](!rounds --clean)\n'
					+ '**End of Day**\n'
					+ '[Enable Long Rest for PCs](!init --end-of-day)\n'
					+ '[Enable Long Rest for selected tokens](!init --enable-rest)\n'
//					+ '**Manage Campaign**\n'
//					+ '[Set Date](~Money-Gems-Exp|Set-Date)[Set Campaign](~Money-Gems-Exp|Set-Campaign)\n'
					+ '**Add or Change Action Buttons**\n'
					+ 'Select one or multiple tokens\n'
					+ '[Update Selected Tokens](!cmd --abilities)\n'
					+ '\n'
					+ '}}{{desc1=[Emergency Stop!](!&#13;&#47;w gm Are you sure you want to stop the Turn Order, and clear all status durations it is tracking?  [Yes, stop it](!rounds --stop&amp;#13;&amp;#47;w gm Tracking & Status Tracking terminated&#41;)}}';
					
		sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		return;
	}
	
	/*
	 * Ask the GM who has requested the End of Day 
	 * what to charge for an overnight stay and whether 
	 * to deduct the cost from Characters
	 */
	 
	var doEndOfDay = function( args, senderId ) {
		
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
			sendError('Invalid End of Day command.  Must be one of "Ask", "Set", "Overnight", "Rest" or "Foes"',msg_orig[senderId]);
			return;
		}
			
		if (cost && cost[0] === '=') {
			cmd = 'set';
			cost = cost.slice(1);
		}
		if (cmd == 'set') {
			state.initMaster.dailyCost = parseStr(cost);
			sendFeedback('Daily cost set',flags.feedbackName,flags.feedbackImg);
			return;
		}
		
		if (!cost && parseFloat(cost) !== 0) {
			cost = state.initMaster.dailyCost;
		};
		
		if ((night || rest) && isNaN(parseFloat(cost))) {
			askToRest = rest;
			rest = night = false;
		}

		names = _.pluck(state.initMaster.playerChars,'name');
		content = '&{template:'+fields.menuTemplate+'}{{name=End of Day}}';
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
					sendResponse( charObj,'&{template:'+fields.menuTemplate+'}{{name=End of Day}}'
										+ '{{desc='+tokenName+' has made arrangements for the night '+(cost < 0 ? 'and today earned' : 'at a cost of')
										+ ' '+Math.abs(cost)+'gp, and can now rest}}', null, flags.feedbackName, flags.feedbackImg, obj.id);
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
		}
		sendFeedback( content );
//		log('doEndOfDay: rest string is '+restStr);
		if (rest && restStr.length) sendAPI( fields.magicMaster + restStr, senderId );
		return;
	}
	
	var doEnableLongRest = function( args, selected, senderId ) {
		
		var names=[],
			curToken, charID, charCS, name, content;
		
		if (!args) args = [];
		if (!args[0] && !(selected && selected.length)) {
            sendError( 'No tokens selected',msg_orig[senderId] );
            return;
 		}	
		if (!selected && !selected.length) {
			selected = [];
			selected[0]._id = args[0];
		}
		selected.forEach(t => {
			if (!(curToken = getObj('graphic',t._id))) return;
			if (!(charID = curToken.get('represents'))) return;
			if (!(charCS=getCharacter(t._id))) return;
			setAttr( charCS, fields.Timespent, 1 );
			name = curToken.get('name');
			names.push( name );
			content = '&{template:'+fields.menuTemplate+'}{{title='+name+' can now rest}}{{desc='+name+' has reached a relatively safe place and can now rest}}';
			sendResponse( charCS, content, null, flags.feedbackName, flags.feedbackImg );
		});
		content = '&{template:'+fields.messageTemplate+'}{{desc=These tokens have had long rests enabled:\n'+names.join(', ')+'}}';
		sendFeedback( content, flags.feedbackName, flags.feedbackImg );
		return;
	}

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, senderId, selected ) {
		if (!args)
			{return;}

		if (args.length < 1 || args.length > 10) {
			throw new Error('Invalid initMaster button command syntax');
		}

		var	content = '',
		    curToken, charID, charCS,
			setVars, 
		    handler = args[0],
			tokenID = args[1];

		if (!(charCS = getCharacter( tokenID ))) {
			throw new Error( 'initMaster button tokenID does not specify a character' );
		}
		switch (handler.toUpperCase()) {

			case BT.MON_ATTACK :
			
				// Handle the results of pressing a 'monster attack' button
				
				handleInitMonster( Monster.SIMPLE, charCS, args, senderId );
				break;

			case BT.MON_INNATE :
			
				// Handle the results of pressing a complex 'monster attack' button
				
				handleInitMonster( Monster.COMPLEX, charCS, args, senderId );
				break;

			case BT.MELEE :

				// Handle the results of pressing a character melee weapon initiative button
		
				handleInitMW( CharSheet.CHARACTER, charCS, args, senderId );
				break;
			
			case BT.MON_MELEE :

				// Handle the results of pressing a complex monster melee weapon initiative button
		
				handleInitMW( CharSheet.MONSTER, charCS, args, senderId );
				break;
			
			case BT.TWOWEAPONS :
			
				// Handle switching to the twoWeaponsMenu for fighters
				
				handleTwoWeapons( charCS, args, senderId );
				break;
				
			case BT.MW_PRIME :
			case BT.RW_PRIME :
			
				// Handle selection of the first of two weapons to use
				
				handlePrimeWeapon( charCS, args, senderId );
				break;
				
			case BT.MW_SECOND :
			case BT.RW_SECOND :
			
				// Handle selection of the second of two weapons to use
				
				handleSecondWeapon( charCS, args, senderId );
				break;
				
			case BT.ONEWEAPON :
			
				// Handle returning to selecting a single weapon
				
				handleInitMW( CharSheet.CHARACTER, charCS, args, senderId );
				break;
			
            case BT.ALLWEAPONS :
                
                // Handle a multi-handed character/monster attacking with all weapons
                
                makeWeaponMenu( charCS, false, args, senderId );
                break;

			case BT.RANGED :

				// Handle the results of pressing a character ranged weapon initiative button
		
				handleInitRW( CharSheet.CHARACTER, charCS, args, senderId );
				break;
				
			case BT.MON_RANGED :

				// Handle the results of pressing a complex monster ranged weapon initiative button
		
				handleInitRW( CharSheet.MONSTER, charCS, args, senderId );
				break;
				
			case BT.MU_SPELL :
			
				// Handle the results of pressing a MU spell initiative button
				
				handleInitSpell( Caster.WIZARD, charCS, args, senderId );
				break;
				
			case BT.PR_SPELL :
				
				// Handle the results of pressing a PR spell initiative button
				
				handleInitSpell( Caster.PRIEST, charCS, args, senderId );
				break;
				
			case BT.POWER :
			
				// Handle the results of pressing a Power initiative button
				
				handleInitPower( charCS, args, senderId );
				break;
				
			case BT.MI_POWER :
			case BT.MI_ATTACK :
			
				// Handle the results of pressing a MI In-Hand Power initiative button
				
				handleInitMIpower( charCS, args, senderId );
				break;
				
			case BT.MI_BAG :
			
				// Handle the results of pressing a MIBag initiative button
				
				handleInitMIBag( charCS, args, senderId );
				break;
				
			case BT.THIEF :
			
				// Handle the results of pressing a Thieving initiative button
				
				handleInitThief( charCS, args, senderId );
				break;
				
			case BT.OTHER :

				// Handle the results of pressing the buttons on the 'Other' menu
				
				handleOtherActions( charCS, args, senderId );
				break;
				
			case BT.SETMODS :
			
				// Handle using buttons on the Initiative Mods dialog
				
				doMagicInitEffect( args, selected, senderId, false );
				break;
				
			case BT.CARRY :

				// Handle a Carry situation (action longer than 1 round)
				
				handleInitCarry( tokenID, charCS, args[3], senderId );
				break;
				
			case BT.SUBMIT :

				// Handle the results of pressing any Submit button

				handleInitSubmit( senderId, charCS, args );
				break;
				
			default:
				throw new Error( 'doButton: invalid action name for switch - "' + handler + '"' );
		
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
			throw new Error('Invalid handshake response received');
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
			senderId = findThePlayer(msg.who),
			selected = msg.selected,
			roundsExists = apiCommands.rounds && apiCommands.rounds.exists,
			isGM = (playerIsGM(senderId) || state.initMaster.debug === senderId),
			t = 10;
			
		var doInitCmd = function( e, selected, senderId ) {
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			try {
				if (!sendGMquery( 'init', arg, senderId )) {
					cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
					argString = (i<0 ? '' : arg.substring(i+1).trim());
					arg = argString.split('|');
					
					if (!flags.noWaitMsg && !(roundsExists  || ['hsq','handshake','hsr','help','debug','isround','button'].includes(cmd))) {
						sendError('RoundMaster API not found.  InitMaster requires RoundMaster API to be loaded and enabled');
						return;
					}

					switch (cmd.toLowerCase()) {
					case 'maint':
						if (isGM) doMaintMenu(arg,selected);
						break;
					case 'init-level':
						if (isGM) {
							state.initMaster.weapInit = (arg[0].toLowerCase() == 'weapon');
						}
					case 'init':
						if (isGM) doInitDiceRoll(arg,'',senderId);
						break;
					case 'roll':
						doInitRoll(arg,isGM, senderId);
						break;
					case 'type':
						if (isGM) doSetInitType(arg,senderId);
						break;
					case 'weapon':
						doInitMenu(arg,selected,MenuType.WEAPON,senderId);
						break;
					case 'monster':
						doInitMenu(arg,selected,MenuType.SIMPLE,senderId);
						break;
					case 'complex':
						doInitMenu(arg,selected,MenuType.COMPLEX,senderId);
						break;
					case 'muspell':
						doInitMenu(arg,selected,MenuType.MUSPELL,senderId);
						break;
					case 'prspell':
						doInitMenu(arg,selected,MenuType.PRSPELL,senderId);
						break;
					case 'power':
						doInitMenu(arg,selected,MenuType.POWER,senderId);
						break;
					case 'mibag':
						doInitMenu(arg,selected,MenuType.MIBAG,senderId);
						break;
					case 'thief':
						doInitMenu(arg,selected,MenuType.THIEF,senderId);
						break;
					case 'other':
						doInitMenu(arg,selected,MenuType.OTHER,senderId);
						break;
					case 'menu':
						if (isGM) clearInitMarkers();
						doInitMenu(arg,selected,MenuType.MENU,senderId);
						break;
					case 'monmenu':
						doInitMenu(arg,selected,MenuType.MONSTER_MENU,senderId);
						break;
					case 'redo':
						doRedo(arg,selected,senderId);
						break;
					case 'checkinit':
					case 'check-init':
						doShowInitFactors(arg,selected,senderId);
						break;
					case 'setmods':
					case 'set-mods':
						doMagicInitEffect(arg,selected,senderId,false);
						break;
					case 'isround':
						sendWait(senderId,0,'isround');
						if (isGM) doIsRound(arg,senderId);
						break;
					case 'end-of-day':
						if (isGM) doEndOfDay(arg,senderId);
						break;
					case 'enable-rest':
						if (isGM) doEnableLongRest(arg,selected,senderId);
						break;
					case 'check-tracker':
						if (isGM) doCheckTracker(arg,senderId);
						break;
					case 'set-wait':
					case 'setwait':
						if (isGM) {
							state.initMaster.waitTime = parseInt(arg[0]) || 500;
							sendFeedback( 'Initiative please wait message delay set to '+state.initMaster.waitTime );
						}
						break;
					case 'list-pcs':
						if (isGM) doCharList(arg,selected,senderId);
						break;
					case 'clear-markers':
					case 'clearmarkers':
						sendWait(senderId,0);
						clearInitMarkers();
						break;
					case 'hsq':
					case 'handshake':
						sendWait(senderId,0);
						doHsQueryResponse(arg);
						break;
					case 'hsr':
						sendWait(senderId,0);
						doHandleHsResponse(arg);
						break;
					case 'handout':
					case 'handouts':
						if (isGM) updateHandouts(handouts,false,senderId);
						break;
					case 'button':
						doButton(arg,senderId,selected);
						break;
					case 'buildmenu':
						doBuildMenu(arg,senderId);
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
						sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>',flags.feedbackName,flags.feedbackImg);
						showHelp(); 
					}
				}
			} catch (err) {
				log('initiativeMaster JavaScript '+err.name+': '+err.message+' while processing command '+cmd+' '+argString);
				sendDebug('initiativeMaster JavaScript '+err.name+': '+err.message+' while processing command '+cmd+' '+argString);
				sendCatchError('InitMaster',msg_orig[senderId],err);
			}
		}

		msg_orig[senderId] = msg;		
			
		// Make sure libRPGMaster exists, and has the functions that are expected
		if('undefined' === typeof libRPGMaster
			|| (['getTableField','getTable','initValues','attrLookup','setAttr'].find(k=>
				!libRPGMaster.hasOwnProperty(k) || 'function' !== typeof libRPGMaster[k]
			))
		) { 
			if (flags.notifyLibErr) {
				flags.notifyLibErr = !flags.notifyLibErr;
				setTimeout( () => flags.notifyLibErr = !flags.notifyLibErr, 10000 );
				// notify of the missing library
				sendChat('',`/w gm <div style="color:yellow;font-weight:bold;border:2px solid red;background-color:black;border-radius:1em;padding:1em;">Missing dependency: libRPGMaster</div>`);
			}
			return;
		};

		if (msg.type !== 'api' || args.indexOf('!init') !== 0)
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
		let senderMod = args.shift().split(' ');
		if (senderMod.length > 1) senderId = fixSenderId( [senderMod[1]], selected, senderId );
		
		if (!flags.noWaitMsg) {
			sendWait(senderId,50,'initMaster');
		}
		
		_.each(args, function(e) {
			if (isGM) doInitCmd( e, selected, senderId );
			else setTimeout( doInitCmd, (asyncTime*t++), e, selected, senderId );
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
		sendAPI( cmd );
		return;
	};

	/*
	 * Rediscover player character tokens after a page change for
	 * the initiative party list
	 */
	 
	var handleMovePClist = function() {
		
		try {
			var page = Campaign().get('playerpageid'),
				newList = [];
			_.each( state.initMaster.playerChars, pc => {
				let pcToken = findObjs({_type:'graphic',_pageid:page,name:pc.name});
				if (pcToken && pcToken.length) {
					newList.push({id:pcToken[0].id,name:pcToken[0].get('name')});
				} else if (!_.isUndefined(getObj('graphic',pc.id)) && !_.isUndefined(pc.name)) {
					newList.push(pc);
				}
			});
			state.initMaster.playerChars = newList;
		} catch (e) {
			sendCatchError('InitMaster',null,e,'InitMaster handleMovePClist()');
		}
	}
	
	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('change:campaign:playerpageid',handleMovePClist);
		on('change:graphic:pageid',handleMovePClist);
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

{try{throw new Error('');}catch(e){API_Meta.InitMaster.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.InitMaster.offset);}}
