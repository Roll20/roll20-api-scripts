// Github:   https://github.com/Roll20/roll20-api-scripts/tree/master/MagicMaster
// Beta:     https://github.com/DameryDad/roll20-api-scripts/tree/MagicMaster/MagicMaster
// By:       Richard @ Damery
// Contact:  https://app.roll20.net/users/6497708/richard-at-damery

var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.MagicMaster={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.MagicMaster.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-8);}}

/**
 * MagicMaster.js
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
 * The goal of this script is to create and automate aspects of magic spell & item
 * discovery, storage & use, initially for the ADnD 2e game in Roll20
 * 
 * v0.1.0 to v2.3.4    For earlier change log see earlier versions
 * v3.0.0  31/10/2023  Added support for other character sheets and game systems.  Corrected how the 
 *                     casting level of spells used as powers are calculated. Fixed storing items in 
 *                     type 6 or 7 containers. Added query: attribute to magic items to add Roll Queries 
 *                     to adding a new MI to a sheet to drive variable data. Moved parseData() to library.
 *                     Fixed Long Rest for MI spells & powers. Added config option for magical weapon plus
 *                     affecting weapon speeds, and corrected --config command documentation.
 * v3.1.0  17/12/2023  Added additional support for other character sheets. Moved configuation menu to
 *                     library. Added support for an "item carried" flag as used on the AD&D1e sheet.
 * v3.1.2  15/01/2024  Implemented inheritance for magic item database objects. Implemented magic item
 *                     query: and variables. Implemented "change-last" and "cursed+change-last" magic item
 *                     classes for items that change to a different item when reaching zero charges. Added
 *                     "Remove Curse" option to GM-only MI menu. Use evalAttr() when specifying qty for
 *                     storing an MI
 * v3.2.0  08/02/2024  New recharge types 'enable' and 'disable' which are uncharged but allow c: 
 *                     charge comparisons to support enabling and disabling of weapon attack rows. Fix
 *                     moving hidden db item variables to always move with the trueName of the weapon
 *                     (not the name). Added swordType as a shorthand query tag. Fixes to do with handling
 *                     hidden equipment items. Add optional API command as a 5th parameter to --message 
 *                     command.
 * v3.2.1  11/02/2024  Improvements to management of hidden items. Config item to set default reveal type
 *                     to on use or manually. Better support for data attribute hide: - force hiding with 
 *                     'hide', default to auto-hide state with no definition, or force no hiding with 
 *                     anything else. Improve parseStr() handling of undefined or empty strings. 
 * v3.3.0  26/02/2024  Allow re-usable (-1) powers to be weaponised in the same way that other spells and
 *                     powers are. For spells & powers stored on items with a casting level, set the MU- 
 *                     and PR- casting levels to the stored level as well as the overall casting level.
 *                     Extend "changing" items to allow cursed types. Define the store: attribute for
 *                     bag-type objects which can be used with "nostore" to define a bag from which can
 *                     be taken from but not stored. Extend GM's add-items dialog to cater for equipment.
 *                     Fixed spell-storing items displaying "ghost" spells. Fixed issue with removing 
 *                     memorised spells.
 * v3.4.0  27/03/2024  Added pick: and put: data attributes for commands to execute on picking & putting
 *                     (or adding/removing) a magic item.  Fixed bag creation on MI use. Fixed display 
 *                     of spells stored in a spell-storing item using a --view-spells command. Allow 
 *                     --mi-power command to be passed multiple '/' separated item names to cater for 
 *                     changing items. Add check for impact on character's initiative when picking or 
 *                     putting an item. Add maths evaluation to the MIqty argument of --addmi command.
 *                     Fix trapped container that does not have a "Trap-1" (open/disarmed) macro to assume 
 *                     trap removed. Added --query-qty command to set the SpellCharges attribute on the 
 *                     character sheet to the charges of a spell, power or item. Added the --button SHOWMORE
 *                     command to support the new [show more...] and {{hide#=...}} syntax of RPGMspell & 
 *                     RPGMdefault templates. On token death, save current container type & set to 6 
 *                     (force inanimate), but reset to original if revived.
 * v3.4.1  23/05/2024  Fixed errors in renaming magic items using the GM-edit-mi menu.
 * v3.5.0  06/05/2024  Updated --level-change to support "fixed class" where does not ask for classes.
 *                     Allow configuration option to "grey out" spell & item action buttons when viewing
 *                     (rather than using). Add "splitable" items which can be split when picked up but 
 *                     do not stack (e.g. used for paper, parchment & papyrus) except for renamed items 
 *                     which can't do this. Fix spell storing items that have an "-ADD" postfix allowing 
 *                     the player/character to add spells. Fix magic item rev: attribute to correctly use
 *                     'manual', 'view', or 'use'. Support renaming of items picked up that are not 
 *                     stackable and the container already contains that item name. Fix handling of use 
 *                     of --mi-charges with "=#" for setting the quantity to an absolute number. Support 
 *                     RPGM maths operators for numbers passed to --mi-charges. Fixed stacking of looted
 *                     items. Added container self-heal capability on version change.
 */
 
var MagicMaster = (function() {
	'use strict';
	var version = '3.5.0',
		author = 'RED',
		pending = null;
	const lastUpdate = 1717750563;
		
	/*
	 * Define redirections for functions moved to the RPGMaster library
	 */
		
	const getRPGMap = (...a) => libRPGMaster.getRPGMap(...a);
	const getHandoutIDs = (...a) => libRPGMaster.getHandoutIDs(...a);
	const setAttr = (...a) => libRPGMaster.setAttr(...a);
	const attrLookup = (...a) => libRPGMaster.attrLookup(...a);
	const setAbility = (...a) => libRPGMaster.setAbility(...a);
	const abilityLookup = (...a) => libRPGMaster.abilityLookup(...a);
	const doDisplayAbility = (...a) => libRPGMaster.doDisplayAbility(...a);
	const getAbility = (...a) => libRPGMaster.getAbility(...a);
	const getTableField = (...t) => libRPGMaster.getTableField(...t);
	const getTable = (...t) => libRPGMaster.getTable(...t);
	const getLvlTable = (...t) => libRPGMaster.getLvlTable(...t);
	const initValues = (...v) => libRPGMaster.initValues(...v);
	const checkDBver = (...a) => libRPGMaster.checkDBver(...a);
	const saveDBtoHandout = (...a) => libRPGMaster.saveDBtoHandout(...a);
	const buildCSdb = (...a) => libRPGMaster.buildCSdb(...a);
	const checkCSdb = (...a) => libRPGMaster.checkCSdb(...a);
	const getDBindex = (...a) => libRPGMaster.getDBindex(...a);
	const updateHandouts = (...a) => libRPGMaster.updateHandouts(...a);
	const findThePlayer = (...a) => libRPGMaster.findThePlayer(...a);
	const findCharacter = (...a) => libRPGMaster.findCharacter(...a);
	const fixSenderId = (...a) => libRPGMaster.fixSenderId(...a);
	const evalAttr = (...a) => libRPGMaster.evalAttr(...a);
	const getCharacter = (...a) => libRPGMaster.getCharacter(...a);
	const characterLevel = (...a) => libRPGMaster.characterLevel(...a);
	const caster = (...a) => libRPGMaster.caster(...a);
	const getTokenValue = (...a) => libRPGMaster.getTokenValue(...a);
	const classObjects = (...a) => libRPGMaster.classObjects(...a);
	const redisplayOutput = (...a) => libRPGMaster.redisplayOutput(...a);
	const getMagicList = (...a) => libRPGMaster.getMagicList(...a);
	const getShownType = (...a) => libRPGMaster.getShownType(...a);
	const addMIspells = (...a) => libRPGMaster.addMIspells(...a);
	const handleCheckWeapons = (...a) => libRPGMaster.handleCheckWeapons(...a);
	const handleCheckSaves = (...a) => libRPGMaster.handleCheckSaves(...a);
	const parseClassDB = (...a) => libRPGMaster.parseClassDB(...a);
	const parseData = (...a) => libRPGMaster.parseData(...a);
	const parseStr = (...a) => libRPGMaster.parseStr(...a);
	const resolveData = (...a) => libRPGMaster.resolveData(...a);
	const getSetPlayerConfig = (...a) => libRPGMaster.getSetPlayerConfig(...a);
	const makeConfigMenu = (...a) => libRPGMaster.makeConfigMenu(...a);
	const sendToWho = (...m) => libRPGMaster.sendToWho(...m);
	const sendMsgToWho = (...m) => libRPGMaster.sendMsgToWho(...m);
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

	/*
	 * Handle for reference to character sheet field mapping table.
	 * See RPG library for your RPG/character sheet combination for 
	 * full details of this mapping.  See also the help handout on
	 * RPGMaster character sheet setup.
	 */
	
	var fields = {
		defaultTemplate:    'RPGMdefault',
		spellTemplate:		'RPGMspell',
		potionTemplate:		'RPGMpotion',
		menuTemplate:		'RPGMmenu',
		warningTemplate:	'RPGMwarning',
		messageTemplate:	'RPGMmessage',
	};
	
	/*
	 * Handle for reference to database data relevant to MagicMaster.
	 * Actual data is held in the relevant RPG-specific library.  Refer
	 * to the library for full details.  See also the help handout for 
	 * each database.
	 */

	var dbNames;
	
	/*
	 * Handle for the Database Index, used for rapid access to the character 
	 * sheet ability fields used to hold database items.
	 */

	var DBindex = {};

	/*
	 * Handle for the library object used to pass back RPG & character sheet
	 * specific data tables.
	 */

	var RPGMap = {};
	
	/*
	 * set design strings for common icons and button colours before they
	 * are used.
	 */
	
	const design = {
		turncolor: '#D8F9FF',
		roundcolor: '#363574',
		statuscolor: '#F0D6FF',
		statusbgcolor: '#897A87',
		statusbordercolor: '#430D3D',
		edit_icon: 'https://s3.amazonaws.com/files.d20.io/images/11380920/W_Gy4BYGgzb7jGfclk0zVA/thumb.png?1439049597',
		delete_icon: 'https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579',
		settings_icon: 'https://s3.amazonaws.com/files.d20.io/images/11920672/7a2wOvU1xjO-gK5kq5whgQ/thumb.png?1440940765', 
		apply_icon: 'https://s3.amazonaws.com/files.d20.io/images/11407460/cmCi3B1N0s9jU6ul079JeA/thumb.png?1439137300',
		bag_icon: 'https://s3.amazonaws.com/files.d20.io/images/335981697/ocKqy1UIfPMSD-TYEO6oXA/thumb.png?1680722832',
		info_msg: '<div style="color:green;font-weight:bold;border:2px solid black;background-color:white;border-radius:1em;padding:1em;">',
		grey_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
		dark_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: black; font-weight: normal;"',
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		green_button: '"display: inline-block; background-color: white; border: 1px solid lime; padding: 4px; color: darkgreen; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"',
		success_box: '"display: inline-block; background-color: yellow; border: 1px solid lime; padding: 2px; color: green; font-weight: bold;"',
		failure_box: '"display: inline-block; background-color: yellow; border: 1px solid red; padding: 2px; color: maroon; font-weight: bold;"',
		grey_action: '&lt;span style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"&gt;$1&lt;/span&gt;'
	};
	
	/*
	 * MagicMaster related help handout information.
	 */
	
	const handouts = Object.freeze({
	MagicMaster_Help:	{name:'MagicMaster Help',
						 version:3.07,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">MagicMaster Help v3.07</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>MagicMaster API v'+version+'</h1>'
							+'<h4>and later</h4>'
							+'<h3><span style='+design.selected_button+'>New:</span>  in this Help Handout</h3>'
							+'<p><span style='+design.selected_button+'>Update:</span> Added RPGM maths processor to many numerical command parameters</p>'
							+'<p><span style='+design.selected_button+'>Update:</span> On viewing a spell or an item description, action buttons are disabled</p>'
							+'<p><span style='+design.selected_button+'>Update:</span> Fixed --add-mi when replacing an item to also replace in-hand weapons and worn rings</p>'
							+'<p><span style='+design.selected_button+'>Update:</span> Extended optional parameters for --level-change</p>'
							+'<p>The MagicMaster API provides functions to manage all types of magic, including Wizard & Priest spell use and effects; Character, NPC & Monster Powers; and discovery, looting, use and cursing of Magic Items.  All magical aspects can work with the <b>RoundMaster API</b> to implement token markers that show and measure durations, and produce actual effects that can change token or character sheet attributes temporarily for the duration of the spell or permanently if so desired.  They can also work with the <b>InitiativeMaster API</b> to provide menus of initiative choices and correctly adjust individual initiative rolls, including effects of Haste and Slow and similar spells.  This API can also interact with the <b>MoneyMaster API</b> (under development) to factor in the passing of time, the cost of spell material use, the cost of accommodation for resting, and the cost of training for leveling up as a spell caster (Wizard, Priest or any other).</p>'
							+'<h2>Syntax of MagicMaster calls</h2>'
							+'<p>The MagicMaster API is called using !magic (or the legacy command !mibag).</p>'
							+'<pre>!magic --help</pre>'
							+'<p>Commands to be sent to the MagicMaster API must be preceded by two hyphens \'--\' as above for the --help command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!magic --mi-power token_id|power_name|mi_name|[casting-level]</pre>'
							+'<p>If optional parameters are not to be included, but subsequent parameters are needed, use two vertical bars together with nothing between them, e.g.</p>'
							+'<pre>!magic --cast-spell MI|[token_id]||[casting_name]</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!magic --spellmenu [token_id]|[MU/PR/POWER] --mimenu [token_id]</pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>'
							+'<br>'
							+'<h3>Roll Query Extension</h3>'
							+'<p>The syntax of the Roll20 Roll Query has been extended within the RPGMaster MagicMaster API to support !magic API commands with Roll Queries that the GM is invited to answer, rather than the player, regardless of who issued the command. The standard syntax and the extended syntax is shown below:</p>'
							+'<pre>Standard Syntax: ?{Query text|option1|option2|...}<br>'
							+'Extended syntax: gm{Query text/option1/option2/...}</pre>'
							+'<p>When used in a !magic API command, the extended Roll Query will prompt the GM with a button in the Chat Window for the GM to answer the question posed by the query text.  The result will be fed into the action taken by the API command.  This allows the GM to be involved when, for instance, a Staff of the Magi absorbs levels of spells cast at a character that the character & player can\'t know.</p>'
							+'<br>'
							+'<h3>Overriding the Controlling Player</h3>'
							+'<p>When a command is sent to Roll20 APIs / Mods, Roll20 tries to work out which player or character sent the command and tells the API its findings. The API then uses this information to direct any output appropriately. However, when it is the API itself that is sending commands, such as from a <i>{{successcmd=...}}</i> or <i>{{failcmd=...}}</i> sequence in a RPGMdefault Roll Template, Roll20 sees the API as the originator of the command and sends output to the GM by default. This is not always the desired result.</p>'
							+'<p>To overcome this, or when output is being misdirected for any other reason, a <b>Controlling Player Override Syntax</b> (otherwise known as a <i>SenderId Override</i>) has been introduced (for RPGMaster Suite APIs only, I\'m afraid), with the following command format:</p>'
							+'<pre>!magic [sender_override_id] --cmd1 args1... --cmd2 args2...</pre>'
							+'<p>The optional <i>sender_override_id</i> (don\'t include the [...], that\'s just the syntax for "optional") can be a Roll20 player_id, character_id or token_id. The API will work out which it is. If a player_id, the commands output will be sent to that player when player output is appropriate, even if that player is not on-line (i.e. no-one will get it if they are not on-line). If a character_id or token_id, the API will look for a controlling player <i>who is on-line</i> and send appropriate output to them - if no controlling players are on-line, or the token/character is controlled by the GM, the GM will receive all output. If the ID passed does not represent a player, character or token, or if no ID is provided, the API will send appropriate output to whichever player Roll20 tells the API to send it to.</p>'
							+'<br>'
							+'<h3><span style='+design.selected_button+'>New:</span> Doing Maths for Numeric Values</h3>'
							+'<p>Roll20 provides many excellent maths functions for commands made to the chat window and contained in API button strings. However, it is not always possible to use the Roll20 maths using the [[...]] syntax to achieve what you want. RPGMaster provides an alternative set of maths functions to help resolve these issues. Formulas can be entered for many numeric values required by RPGMaster commands using the supported syntax. <b><i>However:</i></b> this syntax does not work for anything other than RPGMaster commands as of writing (this might be a future develpment).</p>'
							+'<p>The square brackets [[...]] are not required. The syntax follows normal maths presedent with a few additional operators to support range calculations and dice rolls:</p>'
							+'<table>'
								+'<tr><th scope="row">+-*/</th><td>The standard maths operators work as expected</td></tr>'
								+'<tr><th scope="row">(...)</th><td>Parentheses can be used to define the order of calculation as normal</td></tr>'
								+'<tr><th scope="row">^(#,#,#,...)</th><td>This will resolve to the maximum value in the list, and each # can also be a calculation (semi-colons can be used instead of commas)</td></tr>'
								+'<tr><th scope="row">v(#,#,#,...)</th><td>This will resolve to the minimum value in the list, and each # can also be a calculation (semi-colons can be used instead of commas)</td></tr>'
								+'<tr><th scope="row">c(...)</th><td>This will resolve to the ceiling (the number rounded up) of the result of the contained calculation</td></tr>'
								+'<tr><th scope="row">f(...)</th><td>This will resolve to the floor (the number rounded down) of the result of the contained calculation</td></tr>'
								+'<tr><th scope="row">#d#r#</th><td>Dice roll specifications can be included in the maths with optional reroll values anywhere in the calculation, and the numbers can be calculations</td></tr>'
								+'<tr><th scope="row">#:#</th><td>A different feature is the range calculation - this will derive a number in the range between the two numbers (inclusive), but will try to do so using the equivalent to 3 dice if possible - e.g. 3:18 would make the equivalent of rolling 3d6, 7:34 will resolve to 4+(3d10), 7:35 will resolve to 4+1d11+2d10. A range can be used anywhere in the calculation, and the numbers can themselves be calculations</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>Using Character Sheet Ability/Action buttons</h3>'
							+'<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>'
							+'<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: <b>--spellmenu</b> and <b>--mimenu</b>.  From these, most other commands can be accessed.  If using the <b>CommandMaster API</b>, its character sheet setup functions can be used to add the necessary Ability Macros and Token Action Buttons to any Character Sheet.</p>'
							+'<br>'
							+'<h2>How MagicMaster works</h2>'
							+'<h3>Race, Class, Item, Spell and Power databases</h3>'
							+'<p>MagicMaster uses a large range of items held in databases.  The current versions of these databases are distributed with the game-version-specific <b>RPGMaster Library</b>, updated as new versions are released via Roll20.  The provided databases are held in memory, but can be extracted to ability macros in database character sheets using the <b>!magic --extract-db</b> command.  These macros can do anything that can be programmed in Roll20 using ability macros and calls to APIs, and are found (either in the Character Sheet database or the internal database in memory) and called by the MagicMaster API when the Player selects them using the menus provided by the MagicMaster functions.  The GM can add to the provided items in the databases using standard Roll20 Character Sheet editing, following the instructions provided in the <b>Magic Database Handout</b>.</p>'
							+'<h3>Races & Classes</h3>'
							+'<p>The definitions for character Races & Classes held in the Race-DB and Class-DB databases include a description of the race and class and its capabilities, the powers/non-weapon proficiencies that it comes with, any restrictions on weapons, armour and spells that it is subject to, and other class-specific aspects such as alignments and races.  As you might expect, these are not just descriptions, but restrict the player character to the characteristics defined (alterable by using the <b>!magic --config</b> command).  The Class & Race Database Help handout provides information on the structure of the race & class specifications and how the GM / game creator can add their own races and classes and alter those provided.</p>'
							+'<h3>Spells and Powers</h3>'
							+'<p>The Ability Macros for spells and powers include descriptions of the spell they represent (limited, I\'m afraid, to avoid copyright issues), and also can optionally have API Buttons embedded in them which, if selected by the Player, can enact the actions of the spell or power.  The API Buttons call one or more of the API commands listed in this document, or commands provided by other APIs.  This is most powerful when combined with the <b>RoundMaster API</b> to implement token statuses and status markers with durations and effect macros, enabling the spells & powers to make temporary (or permanent, if desired) changes to the targeted creature\'s token and character sheet attributes.</p>'
							+'<p>The best way to learn about these capabilities is to look at example spell definitions in the databases and use those spells or powers to see what they do.</p>'
							+'<h3>Types of Item Provided</h3>'
							+'<p>The Item database is currently split into nine parts: Weapons, Ammunition, Armour, Lights, Potions, Scrolls & Spellbooks, Wands Staves & Rods, Rings, and Miscellaneous.  More might be added in future releases, and any DM can add more databases with their own items.</p>'
							+'<p>Many magic items have actions that they can perform in the same way as Spells & Powers, using API Buttons in their macros that call MagicMaster API commands, or commands from other APIs.  As with spells & powers, this is most powerful when combined with the capabilities of the <b>RoundMaster API</b>.</p>'
							+'<p>Items can have stored spells (like Rings of Spell Storing) and the spells can be cast from them, and/or can have powers that can be consumed and are refreshed each day.  Again, using the RoundMaster API, the spells and powers can have temporary or permanent effects on Tokens and Character Sheets, if desired.</p>'
							+'<h3>Adding Items to the Character</h3>'
							+'<p>Classes are set using the <b>CommandMaster API</b> or via the <b>AttackMaster !attk --other-menu</b> menu (or can be set manually on the Character Sheet).  Classes can be those provided in the Class-DB, or any other class.  Class names that are not in the database will adopt the attributes of the standard classes depending on the character sheet field the class name and level are entered into: <i>Warrior, Wizard, Priest, Rogue,</i> and <i>Psion</i>.  Depending on the settings selected by the GM under the <b>--config</b> menu, the choise of class will restrict or grant the character\'s ability to use certain items and cast certain spells.</p>'
							+'<p>The MagicMaster API provides commands to perform menu-driven addition of items to the Character Sheet.  Using these commands will set up all the necessary fields so that the Player can use the items with the other APIs - if using MagicMaster then items should not be added directly to the Character Sheet.</p>'
							+'<p>Items can also be acquired by finding them in chests or on tables (simply tokens with images of chests or tables that represent Character Sheets with items added to them) that can be looted, or even dead bodies of NPCs that have been killed in battle.  MagicMaster provides commands that support a menu-driven way to perform looting.  Characters, especially Rogues, can even try to Pick Pockets to take items from NPCs (or even other Characters...), though failure may alert the DM (or other Player) to the attempt.  Containers can even be trapped, with magical consequences if the trap goes off!  On the other hand, Characters can also put items away into chests or onto tables or other storage places, or give them to other Characters or NPCs.</p>'
							+'<h3>Adding Spells & Powers to the Character</h3>'
							+'<p>Spells need to be added in two steps: 1. adding to a Character\'s or NPC\'s spell book; and 2. Memorising the spells each day.</p>'
							+'<p>The simplest way to add spells to a Character\'s spell books is to use the <b>CommandMaster API</b> functions that set up Character Sheets from scratch.  However, spells can be added to the Character Sheet manually: see the <b>RPG Master CharSheet Setup handout</b> for details of how to do this.  Either approach results in the Character having a list of spells at each spell level they can use that they have available to memorise.</p>'
							+'<p>Spells can be memorised using the MagicMaster menus or via the <b>!magic --mem-spell</b> MagicMaster command.  This limits the number of spells memorised at each level to the number that is valid for the Character, with their specific characteristics, class, level and other valid adjustments (though it is possible to add a "fudge factor" if needed).  Once memorised, they can be rememorised or changed at any time, though the DM usually limits this in game play to once each in-game day.  If a Player is happy with the spells a Character has, the Character just needs to rest at the end of the day to regain their spells (and powers, and recharging magic item charges).</p>'
							+'<p>Powers are added in exactly the same way as Spells.  The difference between the two is that Powers are granted to a Character, either as a function of the class they have adopted, or from being granted powers in game-play.  Of course, NPCs and creatures also have many various powers.  Some Powers can be used more than once a day, or even \'at will\' (an example is Priests turning undead).</p>'
							+'<h3>Using Items</h3>'
							+'<p>Items possessed by the Character can be used to perform their functions, using MagicMaster menus.  When used with the InitiativeMaster API, the action for the next round can be the use of a specific item the Character has on them, with the speed of that item.  This may use charges or consume quantities of the item, and these charges may or may not be regained overnight, or through other means.  The items use Roll20 ability macros that can be as simple as putting text in the chat window explaining what the item does, through to much more complex targeting of effects on the user, a single other target, or all tokens in a defined area.  When used with the RoundMaster API, targeted tokens can have a status marker applied with a pre-determined duration and associated effects at the start, each round and when it finishes.  Items that are totally consumed will automatically disappear from the Character Sheet.</p>'
							+'<h3>Casting spells and using powers</h3>'
							+'<p>Spells memorised by the Character can be cast using MagicMaster menus.  As with items, when used with the InitiativeMaster API with <i>Group</i> or <i>Individual</i> initiative, the action for the next round can be the casting of a specific spell with the speed of the Casting Time.  Casting a spell will remove it from memory for the rest of the day, but a rest will bring it back.  Like items, spells use Roll20 ability macros and thus can perform any function a macro or an API call can achieve.  The same capability to affect tokens and Character Sheets is available if used with the RoundMaster API.</p>'
							+'<h3>Dynamic lighting for tokens</h3>'
							+'<p>MagicMaster API provides commands to change the lighting settings of the token to reflect illumination, as if holding various light sources.  This includes both radiant light sources such as hooded lanterns, torches, continual light gems, magic items and magic armour, and also directed light sources such as beacon lanterns and bullseye lanterns which only illuminate in beams.</p>'
							+'<h3>DM tools</h3>'
							+'<p>The DM is provided with tools to be able to add items to chests, NPCs, Characters etc.  These tools allow the DM to also change certain aspects of the items, including the displayed name and the cursed status of the item.  Items that are cursed are not obvious to Characters and Players, and such items can be \'hidden\' and appear to be other items until revealed as the cursed item by the DM.</p>'
							+'<p>The tools also allow the DM to increase or restrict the number of items Characters can have on their person: it is then possible to give each Character a \'backpack\' token/character sheet, which the Character can store items to and get items from - of course, retrieving an item from the backpack takes a round (at the DM\'s discression - the system does not impose this).</p>'
							+'<p>DMs can also add their own items, spells and powers to additional databases (the provided databases should not be added to, but entries can be replaced by new entries in your own databases - updates will not replace your own databases - see the <b>Magic Database Help handout</b>).  This requires some knowledge of Roll20 macro programming and use of APIs.  See the Roll20 Help Centre for information.</p>'
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<h3>1.Spell and Power management</h3>'
							+'<pre>--spellmenu [token_id]|[MU/PR/POWER]<br>'
							+'--mem-spell (MU/PR/POWER)|[token_id]<br>'
							+'<span style='+design.selected_button+'>Update:</span>--view-spell (MU/PR/POWER)|[token_id]<br>'
							+'--cast-spell (MU/PR/POWER/MI)|[token_id]|[casting_level]|[casting_name]<br>'
							+'--cast-again (MU/PR/POWER)|token_id|[spell_name]<br>'
							+'--mem-all-powers token_id</pre>'
							+'<h3>2.Magic Item management</h3>'
							+'<pre>--mimenu [token_id]<br>'
							+'--edit-mi [token_id]<br>'
							+'<span style='+design.selected_button+'>Update:</span>--view-mi [token_id]<br>'
							+'--use-mi [token_id]<br>'
							+'<span style='+design.selected_button+'>Update:</span>--add-mi [token_id]|(mi-to-replace/row#)|mi-to-add|quantity|hand#|[NOCURSE]|[SILENT]<br>'
							+'--mi-charges token_id|value|[mi_name]|[maximum]|[charge_override]<br>'
							+'--mi-power token_id|power_name|mi_name|[casting-level]<br>'
							+'--store-spells token_id|mi-name<br>'
							+'--mem-spell (MI-MU/MI-PR)[-ANY/-ADD/-CHANGE]|[token_id]|[mi-name]<br>'
							+'--view-spell (MI/MI-MU/MI-PR/MI-POWER)|[token_id]|[mi-name]<br>'
							+'--cast-spell (MI/MI-POWER)|[token_id]|[casting_level]|[casting_name]|[CHARGED]|[mi-name]<br>'
							+'--learn-spell [token_id]|spell_name</pre>'
							+'<h3>3.Spell, power & magic item effects and resting</h3>'
							+'<pre>!rounds --target CASTER|caster_token_id|caster_token_id|spell_name|duration|increment|[msg]|[marker]<br>'
							+'!rounds --target (SINGLE/AREA)|caster_token_id|target_token_id|spell_name|duration|increment|[msg]|[marker]<br>'
							+'--touch token_id|effect-name|duration|per-round|message|marker<br>'
							+'<span style='+design.selected_button+'>Update:</span>--level-change [token_id]|[# of levels]|[HP change]|[class]<br>'
							+'--change-attr [token_id]|change|[field]|[SILENT]<br>'
							+'--rest [token_id]|[SHORT/LONG]|[MU/PR/MU-PR/POWER/MI/MI-POWER]|[timescale]<br>'
							+'--mi-rest [token_id]|mi_name|[charges]|[power_name]<br>'
							+'--query-qty [token_id]|(MU/PR/POWER/MI/MIPOWER)|item|[SILENT]</pre>'
							+'<h3>4.Treasure & Item container management</h3>'
							+'<pre>--gm-edit-mi [token_id]<br>'
							+'--find-traps token_id|pick_id|put_id<br>'
							+'--search token_id|pick_id|put_id<br>'
							+'--pickorput token_id|pick_id|put_id|[SHORT/LONG]</pre>'
							+'<h3>5.Light source management</h3>'
							+'<pre>--lightsources [token_id]<br>'
							+'--light token_id|(NONE/WEAPON/TORCH/HOODED/CONTLIGHT/BULLSEYE/BEACON)</pre>'
							+'<h3>6.Other commands</h3>'
							+'<pre>--help<br>'
							+'--message [who|][token_id]|title|message|[command]<br>'
							+'--display-ability [who|][token_id]|database|db_item|[dice_roll1]|[dice_roll2]|[target_id]<br>'
							+'--tidy [token_id]|[SILENT]<br>'
							+'--config [FANCY-MENUS/SPECIALIST-RULES/SPELL-NUM/ALL-SPELLS/ALL-POWERS/CUSTOM-SPELLS/AUTO-HIDE/ALPHA-LISTS/GM-ROLLS] | [TRUE/FALSE]<br>'
							+'--check-db [db-name]<br>'
							+'--extract-db [db-name]<br>'
							+'--handshake from | [cmd]<br>'
							+'--hsq from | [cmd]<br>'
							+'--hsr from | [cmd] | [TRUE/FALSE]<br>'
							+'--debug (ON/OFF)</pre>'
							+'<br>'
							+'<h2>1. Spell management</h2>'
							+'<h3>1.1 Display a menu to do actions with spells</h3>'
							+'<pre>--spellmenu [token_id]|[MU/PR/POWER]</pre>'
							+'<p>Takes an optional token ID and an optional menu type as arguments. If token ID is not specified, uses the selected token.</p>'
							+'<table>'
							+'	<tr><th scope="row">MU:</th><td>displays buttons for Magic User/Wizard spells for casting, resting (short or long), memorising spells from the character\'s spell book, or viewing the memorised spells.</td></tr>'
							+'	<tr><th scope="row">PR:</th><td>displays buttons for Priest spells for casting, resting (short or long), memorising spells from the character\'s spell book, or viewing the memorised spells.</td></tr>'
							+'	<tr><th scope="row">POWER:</th><td>displays buttons for using powers, doing a long rest, changing/resetting powers from the character\'s granted powers, or viewing the granted powers.</td></tr>'
							+'	<tr><th scope="row">None of the above:</th><td>the system will check the class(es) of the character and display the appropriate menu, or if a multi-class character including both a Wizard and a Priest, ask if the player wants to display Magic User or Priest menus.</td></tr>'
							+'</table>'
							+'<p>If the specified token is not associated with a character that has a spell book of the chosen type, or any granted powers, an error message is displayed.</p>'
							+'<h3>1.2 Display a menu to memorise spells from the Character\'s spell book</h3>'
							+'<pre>--mem-spell (MU/PR/POWER/MI-MU/MI-PR)|[token_id]|[mi-name]</pre>'
							+'<p>Takes a mandatory spell book type, an optional token ID, and an optional magic item name as arguments. If token ID is not specified, uses the selected token.</p>'
							+'<p>The Character Sheet associated with the token must have spell books specified for the relevant types of spells or powers.  These are lists of spells from the spell macro databases (see Section 7) specified by level (powers are all 1 level) and as lists separated by \'|\'.  E.g. Charm-Person|Light|Sleep.  If the CommandMaster API is installed, the GM can use its menus to set up character spell books and granted powers.</p>'
							+'<p>Initially displays a menu for memorising Level 1 spells (the only level for powers), with buttons to: choose a spell from the Level 1 spell book on the character sheet; review the chosen spell; and one for each memorising slot the Character has at this level.  Other buttons to memorise or remove spells become available when spells or slots are chosen.  Another button goes to the next available level with slots.  When a granted power is memorised to a slot, a quantity per day can be specified: -1 will grant unlimited uses of the power per day.  Memorising any other type of spell is limited to 1 use per slot.</p>'
							+'<p>Depending on the settings on the <b>--config</b> menu, the character will be limited to memorising spells and powers allowed to their character class and level.</p>'
							+'<p>MI-MU and MI-PR have a special function: these are used to cast memorised spells into the named spell-storing magic item (if no item is named, the last item selected by the Character running the command will be used instead), such as a Ring-of-Spell-Storing.  Magic Item spells are stored in an unused level of the Character Sheet.  This command displays both all memorised spells and all spell-storing magic item spell slots, and allows a memorised spell to be selected, a slot (for the same spell name) to be selected, and the spell cast from one to the other.  Spells can only be replaced by the same spell that was in the slot previously (unless this is the first time spells have been stored in a blank spell-storing item).</p>'
							+'<h3>1.3 <span style='+design.selected_button+'>Updated:</span> View the memorised spells or granted powers</h3>'
							+'<pre>--view-spell (MU/PR/POWER/MI-MU/MI-PR/MI-POWER)|[token_id]|[mi-name]</pre>'
							+'<p>Takes a mandatory spell type, an optional token ID, and an optional magic item name. If token ID is not specified, uses the selected token.</p>'
							+'<p>Displays a menu of all levels of memorised spells of the selected type (there is only 1 level of powers).  Spells that have already been cast appear as greyed out buttons, and can\'t be selected.  Spells that are still available to cast that day can be selected and this runs the spell or power macro from the relevant database without consuming the spell, so that the Player can see the specs. Action buttons on the macro are "greyed out" and can\'t be selected, with the exception of [View...] buttons on spell-storing items which will display the stored spells/powers if selected (again without consuming them).</p>'
							+'<p>Adding MI- before any of the types of spell views the spells or powers available for the specified magic item, or the last Magic Item used by the Character if no magic item name is provided.  Generally this version of the command is only called from API Buttons from the magic item\'s ability macro.</p>'
							+'<h3>1.4 Cast a memorised spell or use a granted power</h3>'
							+'<pre>--cast-spell (MU/PR/POWER/MI/MI-POWER)|[token_id]|[casting_level]|[casting_name]|[CHARGED]|[mi-name]</pre>'
							+'<p>Takes a mandatory spell type, an optional token ID (if not specified, uses the selected token), an optional casting level, and an optional caster name, an optional \'CHARGED\' command, and an optional magic item name.</p>'
							+'<p>This displays a menu of all levels of the memorised spells/powers of the relevant type.  MI displays the spell book for spells stored on the specified magic item, or the last magic item used or viewed if not specified (both MU & PR), and MI-POWER all stored powers in the specified or last selected magic item, (this version of the command is generally called using an API Button in the magic item ability macro).  The player can select a spell/power and then a button becomes available to cast it, using up that slot/deducting a power charge until the next long rest (or until the item is recharged).</p>'
							+'<p>If a casting_level is specified, the spell will be cast as if by a caster of that level, and if a casting_name is specified, that name will be displayed in the spell macro information.  These functions are often used for magic items that cast at specific levels of use, or magic artefacts that are named and/or sentient.  If these are not specified, the caster name and relevant class level are used.  In either case, specified or not, the character\'s Character Sheet Attributes called @{Casting-name} and @{Casting-level} are set to the values used, and can be used in spell, power, or magic item macros.</p>'
							+'<p>If the optional CHARGED parameter is specified (only relevant to spells and powers stored on magic items), this specifies that the Magic Item from which the spell or power is cast is charged, and looses one charge when that cast is made.  This is generally the case when the spell or power is on a Scroll.  When the charge quantity reaches zero, the item will follow the behaviour determined by its charge type (charged, uncharged, rechargeable, recharging, self-charging) - see section 4.1 for more information on charges and charge types.</p>'
							+'<h3>1.5 Cast the last used spell or power again</h3>'
							+'<pre>--cast-again (MU/PR/POWER)|token_id|[spell_name]</pre>'
							+'<p>Takes a mandatory spell type, a mandatory token ID and an optional spell name.</p>'
							+'<p>This command is used for certain spells and powers that, once cast, allow continuing effects in the same or subsequent rounds, without using additional charges.  If the optional spell name is not used, the command just casts again the same spell as the last spell cast by the character associated with the selected token, at the same casting level and casting name.  If a spell name is specified, this spell is cast instead as if it were the same spell: this is used where different spell macros are required to specify subsequent spell effects.</p>'
							+'<h3>1.6 Memorise All Valid Powers</h3>'
							+'<pre>--mem-all-powers token_id</pre>'
							+'<p>Takes a mandatory token_id.</p>'
							+'<p>Reviews all the Powers currently in the Powers Spellbook, checking for Race, Creature, Class and user-added Powers, and checks them against their respective definitions in the various databases to assess if they can be used at the level of experience/Hit Dice of the character / creature.  Memorises each valid power for the number of uses per day specified in the Race, Class or Creature database definition: user-added powers are memorised at unlimited uses per day unless a default is otherwise specified in the Powers database, on the basis that DMs/Players will either change this by rememorising them individually, or otherwise play to the agreed limits of use.</p>'
							+'<br>'
							+'<h2>2. Magic Item management</h2>'
							+'<h3>2.1 Display a menu of possible Magic Item actions</h3>'
							+'<pre>--mimenu [token_id]</pre>'
							+'<p>Takes an optional token ID as an argument. If token ID is not specified, uses the selected token.</p>'
							+'<p>Displays a menu with the following actions: Use a magic item, Search for magic items & treasure, Store magic items in a container, Edit the contents of a character\'s magic item bag, and View the contents of a character\'s magic item bag.</p>'
							+'<p>Searching & Storing are explained in section 4.</p>'
							+'<h3>2.2 Edit a Magic Item bag</h3>'
							+'<pre>--edit-mi [token_id]|[MARTIAL/MAGICAL/ALL]</pre>'
							+'<p>Takes an optional token ID, and an optional item type as arguments. If token ID is not specified, uses the selected token. If the item type is not specified, defaults to MAGICAL.</p>'
							+'<p>Displays a menu similar to editing memorised spells.  At the top are buttons to choose different types of magic items which have macros in the magic item databases. If the optional item type is MARTIAL, only weapons, ammo and armour are listed; if ALL is specified, lists of all items are shown; otherwise only non-MARTIAL items are listed.  The slots available in the bag are shown (with their current contents) and, when magic items and/or slots are chosen buttons become selectable below to store, review, or remove magic items in/from the bag.</p>'
							+'<p>Storing a magic item will ask for a number - either a quantity or a number of charges.  Magic Items can be of various types: Charged (is used up when reaches 0), Uncharged (a number is a pure quantity that is not consumed), Recharging (regains charges after each long rest), Rechargable (is not used up when reaches 0, stays in bag and can be recharged when the DM allows), Self-charging (recharge at a rate per round determined by the item) and can also be Cursed - more under section 4.</p>'
							+'<p>This menu is generally used when Magic Item & treasure containers (such as Treasure Chests and NPCs/monsters with treasure) have not been set up in a campaign as lootable, and provides a means of giving found magic items to characters. The DM just tells the Player that they have found a magic item, and the Player adds it to their Character Sheet using this command (more likely accessed via the Magic Item menu).</p>'
							+'<h3>2.3 <span style='+design.selected_button+'>Updated:</span> View a character\'s Magic Item Bag</h3>'
							+'<pre>--view-mi [token_id]</pre>'
							+'<p>Takes an optional token ID as an argument. If token ID is not specified, uses the selected token.</p>'
							+'<p>Displays a menu of items in the character\'s magic item bag, with the quantity possessed or the number of charges.  Pressing a button displays the named Magic Item specs without using any charges so that the Player can review the specifications of that item. Action buttons on the item macro are "greyed out" and can\'t be selected, with the exception of [View...] buttons on spell-storing items which will display the stored spells/powers if selected (again without consuming them). Items for which all charges have been consumed are greyed out, and cannot be viewed as the character can no longer use them.  They will become viewable again if they gain charges.</p>'
							+'<h3>2.4 Use a Magic Item from the bag</h3>'
							+'<pre>--use-mi [token_id]</pre>'
							+'<p>Takes an optional token ID as an argument. If token ID is not specified, uses the selected token.</p>'
							+'<p>Displays a similar menu as for viewing the contents of the Magic Item Bag, but when an item is selected, a button is enabled that uses the Magic Item and consumes a charge.  Other buttons specified in the item macro might use additional charges to perform additional effects.  See section 3.</p>'
							+'<p>Items with 0 quantity or charges left are greyed out and cannot be selected, unless they have abilities to regain charges such as "spell absorbing" items.  When a Charged Item reaches 0 charges left, it is removed from the character\'s Magic Item Bag automatically.</p>'
							+'<h3>2.5 <span style='+design.selected_button+'>Updated:</span> Add an Item to a Character / Container</h3>'
							+'<pre>--add-mi [token_id]|(mi-to-replace/row#)|mi-to-add|[quantity]|[hand#]|[NOCURSE]|[SILENT]</pre>'
							+'<p>Takes an optional token ID (if not provided, uses selected token), then either the name of the item to be replaced or the row number of the item in the equipment list, the name of the item to add, the quantity to add (defaults to quantity of replaced item, or 1), optionally a hand number to use to take in-hand, optionally NOCURSE if replacement of cursed items is possible, and optionally SILENT to not trigger messages, menus or dialogs.</p>'
							+'<p>This command can be used to add a named item from the databases to a character, NPC, creature or other container without going through other dialogs to select the item. It will add the item to a numbered row in the equipment list or, more usefully, replace a named item that already exists in the list (or \'-\' to find an empty row). If the item is one that can be taken in-hand (e.g. a weapon or a shield, or a magic item like a wand or staff), the optional \'hand number\' can be used to specify which hand to take it in. 0=prime hand,1=offhand,2=both,3 onwards for other hands, or just \'=\' (or blank) means replace in-hand if mi-to-replace is in-hand or worn as a ring - if the item is not one that can be held the item will not be taken in-hand. If the item to be replaced is cursed, it <i>will not be replaced</i> and an error message will be displayed unless the NOCURSE option is used. Finally, the command will pop up the edit-mi dialog or the gm-edit-mi dialog (if NOCURSE is specified) showing the resulting equipment list unless the SILENT flag is also used.</p>'
							+'<p>The quantity can be a number to set the amount of the item to add. If preceeded by an operator (such as \'+\', \'-\', \'*\', or \'/\'), the quantity will modify the quantity of the item replaced (up to the maximum quantity of the replaced item). If the quantity is just \'=\' the quantity will set to the same as the replaced item, or 1 for an added item, or if the item to be replaced is not found and quantity is \'=\', the item will not be added.</p>'
							+'<h3>2.6 Add, set or deduct Magic Item charges</h3>'
							+'<pre>--mi-charges token_id|[+/-/0]value|[mi_name]|[maximum]|[charge_override]</pre>'
							+'<p>Takes a mandatory token ID, a mandatory value preceeded by an optional + or -, an optional magic item name, an optional maximum value, and an optional magic item charge type override as arguments.</p>'
							+'<p>Does not display anything but alters the number of current or recoverable charges on an item.  By default, alters the last magic item used by the character, or will affect the named magic item.  Warning: a character can have two items of the same name, and there is no guarantee which will be affected if the name is used.</p>'
							+'<p>Remember: using a Charged, Recharging, Rechargeable or Self-Charging Magic Item will automatically use 1 charge on use (unless the ItemData specification includes the field <b>c:0</b>, in which case no charges will automatically be deducted on use). If the c: tag is not used, or is anything other than 0, then charges will be deducted (default 1 charge) on use of the item.  In addition, that one charge deduction always happens - if an effect of a Magic Item uses 2 charges, only 1 more needs to be deducted.</p>'
							+'<p><b>Note:</b> \'-\' reduces <i>current</i> remaining charges, \'+\' adds to the <i>maximum</i> recoverable charges, no + or - sets the <i>maximum</i> recoverable charges, and \'0\' (or starting with 0 e.g. \'01\') the item will <i>recharge</i> to the set or current maximum.  This command <i>cannot</i> otherwise be used to increase the current remaining charges <i>unless</i> the item is of type <i>absorbing</i>.</p>'
							+'<p>Using minus \'-\' before the value will deduct charges from the current quantity/charges: e.g. if using an optional power of the item that uses more than 1 charge.  Using + before the value will add the value to the number of recoverable charges (overnight or rechargeable to), up to any specified maximum (often used for magic items that regain variable numbers of charges overnight).  Just using the value without + or - will just set the number of recoverable charges to the given value.  This command is not required to recharge self-charging items but can be used to change the maximum number of charges they will self-charge up to.</p>'
							+'<p><b>Absorbing items</b> can gain charges in use from other sources, so the <b>--mi-charges</b> command works differently: \'-\' reduces <i>both current and maximum charges</i> and \'+\' only increases <i>current charges</i> (but only to maximum and not beyond). Using neither \'-\' or \'+\' will set the <i>current</i> charges (but, again, only up to the maximum).</p>'
							+'<p>The <i>charge-override</i> can be used to temporarily change the charge behaviour of the magic item. Specifying an override will cause the magic item to behave as if its charging type was that of the override only for this call.  Thus charges could be deducted from an <i>uncharged</i> item by overriding by <i>rechargeable</i> or <i>charged</i>.</p>'
							+'<h3>2.7 Use a Magic Item power</h3>'
							+'<pre>--mi-power token_id|[type-]power_name|mi_name|[casting-level]</pre>'
							+'<p>Takes a mandatory token ID, mandatory power name (optionally prefixed by a power type), mandatory magic item name (<mark style="color:green">New</mark> which can be several names separated by forward slash), and an optional casting level as parameters.</p>'
							+'<p>Magic Items, especially artefacts, can have their own powers that can be used a specified number of times a day, or at will.  This command can be used in API buttons in the Magic Item macro to call on that power.  The power name and the magic item name (or names, especially where items that change with use have powers) must be specified to select the right power.  If a casting level is specified, any relevant impacts on use of the power will be taken into account: it is often the case that magic items use powers at specific levels. If not specified, the item using Character\'s level is used (user does not need to be a spell caster).</p>'
							+'<p>Generally, magic item powers have unique names, though they do not have to.  Such magic items require specific setting up by the DM - see later sections. However, powers can have a prefix that indicates a power type that specifies the power is in fact a Wizard spell (MU-), a Priest spell (PR-), or a Magic Item (MI-) or (for completeness) confirmed as a Power (PW-). Specifying a power type prefix means the appropriate database types will be searched for the named power - thus (for instance) a Wizard or Priest spell can be specified as a Magic Item power without having to program a duplicate in the Powers Databases. If no power type prefix is specified, the system will first search for a matching power in the Powers Databases (both API-supplied and user-supplied), then all Wizard spell databases, then Priest spell databases, then all Magic Item databases, and finally the character sheet of the creature wielding the Magic Item.</p>'
							+'<h3>2.8 Add spells to a spell-storing Magic Item</h3>'
							+'<pre>--store-spells token_id|mi_name</pre>'
							+'<p>Takes a mandatory token ID and a mandatory magic item name.</p>'
							+'<p>This command presents a dialog in the chat window that stores spells or powers in any magic item that has been defined as being able to cast stored spells/powers. The item definition <i>must</i> include somewhere in its definition the command call <code>!magic --cast-spell MI|</code> or <code>!magic --cast-spell MI-POWER|</code>, (or either of their <code>--view-spell</code> equivalents) generally as part of an API button, or spells/powers cannot be stored. If the command is for MI, the dialog defaults to Level 1 Wizard spells, and has buttons to switch level and to Priest spells. If the command is for MI-POWER, the dialog allows powers to be stored, but Wizard and Priest spells can also be stored as powers, and the dialog will prompt for a number of uses per day for each.</p>'
							+'<p>Once a spell is cast from a spell-storing item, the spell is spent and does not return on a long or short rest: the spell must be refreshed using the <b>--mem-spell</b> command (see below). If a power is used from a power-storing item, the power will have a number of uses per day (or be "at will"), and <i>will</i> refresh on a long rest.</p>'
							+'<h3>2.9 Restore spells in a spell-storing Magic Item</h3>'
							+'<pre>--mem-spell (MI-MU/MI-PR)[-ADD/-ANY/-CHANGE]|[token_id]|[mi-name]</pre>'
							+'<p>Takes a mandatory spell type (optionally followed by -ADD or -ANY or -CHANGE), an optional Token ID for the character, and an optional magic item name.  If token ID is not provided, it uses the selected token, and if the magic item name is not specified, the last used magic item is assumed.</p>'
							+'<p>MI-MU and MI-PR mem-spell types are used to cast memorised spells into a spell-storing magic item, such as a Ring of Spell Storing.  Magic Item spells are stored in an unused spell level of the Character Sheet (by default Wizard Level 15 spells).  This command displays both all the character\'s memorised spells and the spell-storing magic item spell slots in the specified magic item (or the last one used if not specified), and allows a memorised spell to be selected, a slot to be selected (for the same spell name - limiting the item to only store certain defined spells <i>unless</i> "-ANY" or "-CHANGE" is added to the command), and the spell cast from one to the other.</p>'
							+'<p>If either "-ANY" or "-ADD" are added to the spell type string, the player can just select a memorised spell and then immediately cast it into the device without choosing a slot: this will <i>add</i> the spell to the device. If the extension is "-ADD" then existing spells need to be refreshed with an identical spell, the same way as if -ADD was not specified. If "-ANY" is specified, not only can the player extend the spells stored, they can replace expended spell slots with any spell, not just the one previously stored in the slot. "-CHANGE" will allow different spells to be stored in a slot, but not give the ability to add to the number of slots. If none of these qualifiers are specified in the command, spell slots cannot be added, and slots have to be refreshed with the same spell - just like a normal <i>Ring of Spell Storing</i>. Generally, the GM will state that the device used for storing the spells will have a limited capacity of some type - number of spell levels, number of spells, types or spheres of spell, etc. The number of levels can be set in the database entry for the magic item (see the <i>Magic Database Help</i> handout) and the caster\'s spells of higher level than can be stored will not be available. The number of spells can be restricted by using the "-CHANGE" qualifier or no qualifier.  Alternatively the GM can just tell the players to do so manually.</p>'
							+'<p>Unlike some other menus, however, magic item spell slots that are full are greyed out and not selectable - their spell is intact and does not need replacing.  Spell slots that need replenishing are displayed as selectable buttons with the spell name that needs to be cast into the slot.</p>'
							+'<p>The level of the caster at the time of casting the spell into the magic item is stored in the magic item individually for each spell - when it is subsequently cast from the spell-storing magic item it is cast as if by the same level caster who stored it.</p>'
							+'<p>A spell-storing magic item can hold spells from one or both of Wizard and Priest spells.  The database where the spell is defined is also stored in the magic item with the spell, so the correct one is used when at some point in the future it is cast.  A copy of the spell macro is also stored on the Character Sheet of the character that has the spell-storing magic item. If, when cast, the system can\'t find the database or the spell in that database (perhaps the character has been moved to a different campaign with different databases), and it can\'t use the copy on its own character sheet for some reason, the system will search all databases for a spell with the same name - this does not guarantee that the same spell will be found: the definition used by a different DM could be different - or the DM may not have loaded the database in question into the campaign for some reason.  In this case, an error will occur when the spell is cast.</p>'
							+'<p>See the Magic Items Database documentation for how spell-storing magic items are defined.</p>'
							+'<h3>2.10 Casting a spell from a spell-storing magic item</h3>'
							+'<pre>--cast-spell (MI/MI-POWER)|[token_id]|[casting_level]|[casting_name]|[CHARGED]|[mi-name]</pre>'
							+'<p>Takes a mandatory casting type of \'MI\', an optional Token ID (if token ID is not provided, it uses the selected token), an optional casting level (which will be ignored in favour of the level of the caster of the spell who cast it into the item), an optional casting name which, if not specified, will be the name of the wielder of the magic item, an optional \'CHARGED\' command, and an optional magic item name (if not provided, uses name of the last magic item the character selected, viewed or used).</p>'
							+'<p>This command works in the same way as for casting other spells.  However, spells cast from a spell-storing magic item are not regained by resting - either short or long rests.  The only way to regain spells cast from such an item is to cast them back into the item from the character\'s own memorised spells: see the <b>--mem-spell</b> command above.  If the character does not have these spells in their spell book or is not of a level able to memorise them, then they will not be able to replace the spells and will have to get another spell caster to cast them into the item (by giving the item to the other Character and asking nicely for it back again) or wait until they can get the spells.</p>'
							+'<p>If the optional parameter <i>\'CHARGED\'</i> is used, spells on the magic item are not re-storable.  The spells will be deleted after they are all used up and the magic item will not be able to store any more spells.  This is mainly used for Scrolls with multiple spells.</p>'
							+'<h3>2.11 Learning a spell in a spellbook (or other MI)</h3>'
							+'<pre>--learn-spell [token_id]|spell_name</pre>'
							+'<p>Takes an optional token_id which defaults to that of the currently selected token, followed by a mandatory spell name.</p>'
							+'<p>This command is intended for use with magic items of the type <i>spellbook</i> (listed in the GM\'s <i>Add Items</i> dialog under <i>Scrolls</i>), although any spell storing magic item that has the Data tag <i>learn:</i> set to 1 (as in learn:1) will prompt the player with a [Learn this spell] button when stored spells are viewed.  If the GM stores a spellbook item in a container or adds it to an NPC character sheet, and then stores Wizard spells in the spellbook (all of this by using the GM\'s <i>Add Items</i> dialog), any Wizard spell-casting character looting the spellbook will gain access to view the spells the GM stored in it. Viewing any of the spells in a spellbook will display a [Learn this spell] button at the bottom of the spell description. Selecting this button runs this command, which will:</p>'
							+'<ul><li>Check the spell is not already in the character\'s spellbook;</li>'
							+'<li>Check that the spell is of a school the character can use;</li>'
							+'<li>Check that the spell is of a level the character can cast;</li>'
							+'<li>Present a dialog to the player to roll "Spell Knowledge" with a target pre-adjusted for specialism;</li>'
							+'<li>If all of the above checks are passed, add the spell to the character\'s correct level of spellbook.</li></ul>'
							+'<br>'
							+'<h2>3.Spell, power & magic item effects and resting</h2>'
							+'<p>If this API is used in conjunction with the RoundMaster API, Magic Items, Spells & Powers can all place status markers on tokens, and also cause real Effects to alter token & character sheet attributes and behaviours: when cast; during each round of their duration; and when they expire.  See the RoundMaster documentation for further information, especially on Effects and the Effects Database.</p>'
							+'<h3>3.1 Target spell effects on a token (with RoundMaster API only)</h3>'
							+'<pre>!rounds --target CASTER|caster_token_id|[caster_token_id|]spell_name|duration|[+/-]increment|[msg]|[marker]<br>'
							+'!rounds --target (SINGLE/AREA)|caster_token_id|target_token_id|spell_name|duration|increment|[msg]|[marker]</pre>'
							+'<p>Takes mandatory CASTER, SINGLE or AREA command, a mandatory caster token ID, for SINGLE/AREA a mandatory target token ID, mandatory spell name, duration & increment (preceeded by an optional +/-), and an optional message and optional token marker name.</p>'
							+'<p>If using the RoundMaster API, this command targets one, or a sequential set of tokens and applies a token marker to the token for the specified duration number of rounds, with the increment applied each round.  The optional message will be shown below that token\'s turn announcement each round.  The marker used will either be the one specified or if not specified a menu to choose one will be shown.</p>'
							+'<table>'
							+'	<tr><th scope="row">CASTER</th><td>will just take one Token ID and apply the marker to that token.</td></tr>'
							+'	<tr><th scope="row">SINGLE</th><td>will take both the Token ID of the caster, and the Token ID of a target of the spell/power/MI.  The marker will be applied to that of the target.</td></tr>'
							+'	<tr><th scope="row">AREA</th><td>will take the Token ID of the caster, and one Token ID of the first token in the area of effect.  As each token is specified the command will ask the Player to select subsequent tokens in the area of effect. Once all relevant tokens have been selected, just ignore the next prompt.</td></tr>'
							+'</table>'
							+'<p>If the Player is not the DM/GM, the system will ask the DM/GM to approve the marker/effect for each token - this allows the DM to make saving throws for monsters/NPCs affected where appropriate.</p>'
							+'<p>See the RoundMaster API documentation for full details.</p>'
							+'<h3>3.2 Cast a spell that requires a "touch" attack roll</h3>'
							+'<pre>--touch token_id|effect-name|duration|per-round|[message]|[marker]</pre>'
							+'<p>Takes mandatory token ID, effect name, duration of the effect, an increment to the duration per round (often -1), an optional message each round for the targeted token, and an optional status marker to use (if not supplied, the DM or user will be asked to select one).</p>'
							+'<p>Note: this command requires RoundMaster API to also be loaded, but is a !magic command.</p>'
							+'<p>Sets up the Character represented by the specified token ready for an "Attack Roll" to deliver a touch attack for a spell or power or magic item use that requires an attack.  The parameters are those that will be passed to the <b>!rounds --target</b> command if the attack is successful (see above).</p>'
							+'<p>To use this command, add it as part of a spell, power or MI macro in the appropriate database, before or after the body of the macro text (it does not matter which, as long as it is on a separate line in the macro - the Player will not see the command).  Then include in the macro (in a place the Player will see it and be able to click it) an API Button call [Button name](~Selected|To-Hit-Spell) which will run the Ability "To-Hit-Spell" on the Character\'s sheet (which has just been newly written there or updated by the <b>--touch</b> command).</p>'
							+'<p>Thus, when the Player casts the Character\'s spell, power or MI, they can then press the API Button when the macro runs and the attack roll will be made.  If successful, the Player can then use the button that appears to mark the target token and apply the spell effect to the target.</p>'
							+'<p>See the RoundMaster API documentation for further information on targeting, marking and effects.</p>'
							+'<h3>3.3 <span style='+design.selected_button+'>Update:</span> Change the Experience Level</h3>'
							+'<pre>--level-change [token_id]|[# of levels]|[HP change]|[class]</pre>'
							+'<p>Takes an optional Token ID (if not specified, uses the selected token), an optional number of levels (plus or minus: if not specified assumes -1), an optional total number of HP gained or lost, and an optional class to apply the level change to.</p>'
							+'<p>Mainly used for attacks and spell-like effects that drain levels from opponents, this command undertakes all the calculations and Character Sheet updates that can automatically be done when a character or creature changes experience level. Saving throw targets are reassessed, weapon attacks per round recalculated, numbers of memorised spells changed, Race & Class powers checked for level appropriateness, etc. If this is a single class character or a creature, the optional class parameter will be ignored and the single class/monster HD applied. If the HP change is not specified for a single class character, then the appropriate HP dice will be rolled and changed (Tip: it\'s better to put in a roll query to ask the player for the HP to change by). If the character is multi- or dual-class, it will either use the class specified, or asks the player which class to add/drain levels to/from and the hit points for each.</p>'
							+'<h3>3.4 Change an Attribute Value</h3>'
							+'<pre>--change-attr [token_id]|change|[STRENGTH/DEXTERITY/CONSTITUTION/INTELLIGENCE/WISDOM/CHARISMA]</pre>'
							+'<p>Takes an optional Token ID (if not specified, uses the selected token), and a mandatory change value (plus, minus, or zero), and an optional attribute name (defaults to STRENGTH)</p>'
							+'<p>Mainly used to support magical effects and creature attacks that drain or add to attributes such as Strength, this command specifically deals with aspects such as Exceptional Strength, remembering if a Character has exceptional strength as a characteristic and taking it into account as the value is changed. Going up or down from the original rolled value and then back the other way will include as a step the exceptional, percentage value.  If the change requested would take the value past the original rolled value, the change will only go as far as the original value, whatever change was requested. However, the change can then continue with subsequent calls to beyond the original value with subsequent calls.</p>'
							+'<p><b>Note:</b>Should the rolled value need to change permanently to a new rolled value, the <i>change</i> value of 0 (zero) will reset the remembered original rolled value to the current value of the attribute - this is not needed the first time the command is used on a character sheet, which will trigger this value to be remembered for the first time.</p>'
							+'<h3>3.5 Perform Short or Long Rests</h3>'
							+'<pre>--rest [token_id]|[SHORT/LONG]|[MU/PR/MU-PR/POWER/MI/MI-POWER]|[timescale]</pre>'
							+'<p>Takes an optional token ID (if not specified, uses the selected token), an optional rest type, short or long, an optional magic type to regain charges for, and an optional timescale for days passing.</p>'
							+'<p>Most magic requires the character to rest periodically to study spell books, rememorise spells, and regain powers and charges of magic items.  This command implements both Short and Long rests.</p>'
							+'<p>The type of rest (short or long) can be specified or, if not specified, the system will ask the Player what type of rest is to be undertaken - though Long Rests will be disabled if the Timescale (either the optional value or the character sheet attribute) is not 1 or more days (see below).  The type of magic to be affected can also be specified or, if not specified, all types of magic are affected.</p>'
							+'<p>A Short rest is deemed to be for 1 hour (though this is not a restriction of the system and is up to the DM), and allows spell casters (such as Wizards and Priests, as well as others) to regain their 1st level spells only.  This can happen as often as the DM allows.</p>'
							+'<p>A Long rest is considered to be an overnight activity of at least 8 hours (though again this is not a restriction of the system and is up to the DM).  A Long rest allows spell casters to regain all their spells, all character and magic item powers to be regained to full uses per day, and for recharging magic items to regain their charges up to their current maximum.  After a long rest, ammunition that has been used but not recovered can no longer be recovered using the Ammunition Management command (see AttackMaster API documentation): it is assumed that other creatures will have found the ammo, or it has been broken or otherwise lost in the 8 hours of the long rest.</p>'
							+'<p>A Long rest can only be undertaken if certain conditions are met: either the optional Timescale (in days) must be specified as 1 or more days, or the Character Sheet must have a Roll20 attribute called Timescale, current, set to a value of 1 or more (can be set by <b>InitiativeMaster API --end-of-day</b> command).  An internal date system is incremented: an attribute on the Character Sheet called In-Game-Day is incremented by the Timescale, and Timescale is then set to 0.</p>'
							+'<p>If the <b>InitiativeMaster API</b> is being used, the system will interact with the "End of Day" command to allow rests to be coordinated with the choice of accommodation (and its cost...!) or with earnings made for the day\'s adventuring.</p>'
							+'<h3>3.6 Perform a Single Item Rest</h3>'
							+'<pre>--mi-rest [token_id]|mi_name|[charges]|[power_name]</pre>'
							+'<p>Takes an optional Token ID (defaults to the selected token), a mandatory magic item name (case insensitive), an optional number of charges to recharge to, and an optional power name (case insensitive).</p>'
							+'<p>This command restores the powers for a single magic item, or even a single power of a single magic item. If the optional number of charges is specified, this is the number of charges set for the power, otherwise the power is restored to its original max uses. If a power name is specified, and the item has a power of the same name, only that power will be affected. Otherwise, all powers of the item will be restored.</p>'
							+'<h3>3.7 <mark style="color:green">New</mark> Query the Number of Charges</h3>'
							+'<pre>--query-qty [token_id]|(MU/PR/MU-PR/POWER/MI/MI-POWER)|item|[SILENT]</pre>'
							+'<p>Takes an optional token ID (defaults to selected token), a mandatory item type, the mandatory name of the item, and an optional "silent" to surpress feedback.</p>'
							+'<p>Some spells, powers, and magic items need to know how many charges they have left in order to impact the effect they have.  The quantity is difficult to find from the table entry in macro code unless the row number is known, so this command finds the item for the macro and saves the current quantity in the character sheet attribute that can be accessed using @{selected|spellcharges}. Generally a call to this command should be outside of any roll template so that the command runs before the roll template is displayed and any API buttons become available.</p>'
							+'<br>'
							+'<h2>4.Treasure & Item container management</h2>'
							+'<h3>4.1 DM/GM version of Magic Item management</h3>'
							+'<pre>--gm-edit-mi [token_id]</pre>'
							+'<p>Takes an optional token ID. If token ID is not specified, uses the selected token.</p>'
							+'<p>This command opens a menu showing all the items in the Items table of the character sheet associated with the specified token.  Unlike the Player version of the command (--edit-mi), this command shows all attributes of every magic item, including those of hidden and cursed items, and also offers an additional list of "DM Only" magic items from the magic item databases.</p>'
							+'<p>The following functions are available once both a magic item is selected from the lists, and a slot to store it in are selected:</p>'
							+'<table>'
							+'	<tr><th scope="row">Store item:</th><td>Select a magic item from the databases and store it in a slot - this is the same as the Player version.</td></tr>'
							+'	<tr><th scope="row">Hide item as different item:</th><td>The magic item already in the selected bag slot is given the displayed name of the magic item selected from the databases - the Player will only see the Magic Item selected (Displayed Name), and not the hidden actual name.  The MI will behave exactly like the selected, displayed item until the DM reverts the item to the hidden version using the [Reset Single MI] button.  This is generally used for items in containers, especially Cursed items, so that the real nature of the item is hidden until the character uses it or the DM wants them to. Once an item has been marked as hidden, the DM can see the name it will be displayed to the palyer as by selecting that slot - the displayed name will appear on the menu, and other options for hidden items will become selectable.</td></tr>'
							+'	<tr><th scope="row">Rename MI:</th><td>Allows the DM to change the actual and displayed name of an item. This will create a unique item (existing item names cannot be used) stored on the character\'s/container\'s Character Sheet which will work in exactly the same way as the original item. This can be used to resolve duplicate magic items, such as two rings of spell storing can be given different names.  This is different from hiding - the actual name of the item is changed.</td></tr>'
							+'	<tr><th scope="row">Remove MI:</th><td>Blanks the selected Bag slot, removing all details, both displayed & actual.</td></tr>'
							+'	<tr><th scope="row">Change MI Type:</th><td>This allows the type of the item in the selected Bag slot to be changed.  It can be one of the following - Charged, Discharging, Uncharged, Recharging, Rechargeable, Self-charging, Absorbing, Cursed, Cursed-Charged, Cursed-Self-charging, Cursed-Recharging, Cursed-Absorbing (cursed rechargeable items behave in exactly the same way as Cursed-Charged items).  Cursed versions of items cannot be removed from the character\'s MI Bag, given away, stored or deleted by the Player, even when all their charges are depleted.  Otherwise, they act in the same way as other magic items. Charged, Discharging, and Rechargeable items disappear if they reach zero charges, unless preceeded by \'perm-\'. Charged, Uncharged and Cursed items can be divided when picked up by Searching or Storing, other types cannot.</td></tr>'
							+'	<tr><th scope="row">Change Displayed Charges:</th><td>Changes the number of displayed/current charges for the item in the selected Bag slot.  This can be used to set the quantity of Uncharged items, or the current charges of other types.  It also allows charged items in containers to be stored as a single item, for instance single Wands (current/displayed qty = 1) with multiple charges (max qty = n): when picked up the current qty is always set to the actual value - see the <b>--pickorput</b> command below.</td></tr>'
							+'	<tr><th scope="row">Change Actual Charges:</th><td>Setting this allows the actual quantity of Uncharged items in containers to be hidden, or the maximum number of charges to be set for other types.  When the item is picked up from a container, the actual number of charges will be set as the current value.</td></tr>'
							+'	<tr><th scope="row">Store Spells/Powers in MI</th><td>Only enabled for items that can store & cast spells or powers: the item definition must have a call to <code>!magic --cast-spell MI</code> for spell storing, or <code>!magic --cast-spell MI-POWER</code> for powers, associated with an API button.  If this is the case, this option opens a menu to select Wizard or Priest spells, or powers as appropriate. A blank Ring-of-Spell-Storing and a blank Scroll-of-Spells are both included in the databases, allowing GMs to build their own unique items and then give them a unique new name using the Rename function described above.</td></tr>'
							+'	<tr><th scope="row">Change Item Cost:</th><td>Items can have a cost in GP (fractions allowed which get converted to SP & CP).  When an item is picked up from a container, the cost will be multiplied by the quantity picked up and the Player will be asked if they want the character to pay the cost.  If confirmed, the cost will be deducted from the money values on the character sheet.  0 and negative values are allowed.  This supports merchants and shops to be created in the campaign.</td></tr>'
							+'	<tr><th scope="row">Reset Qty to Max:</th><td>Allows the DM to reset the quantity of the selected Bag slot to the actual (max) values.</td></tr>'
							+'	<tr><th scope="row">Reveal Now:</th><td>Only available when a hidden item is selected. Reveals the item, setting the displayed name to the actual name, which will function as the revealed item from that point on.</td></tr>'
							+'  <tr><th scope="row">Reveal MI</th><td>Allows selection of when a hidden item is revealed: MANUALLY by DM (the default) using the Reveal Now button; on VIEWING the item; or on USING the item. From the point the item is revealed onwards, the item will behave as the revealed item.</td></tr>'
							+'	<tr><th scope="row">Edit Treasure:</th><td>Mainly for use on Magic Item containers, such as Treasure Chests, but also useful for NPCs and Monsters.  Allows the DM to add text only treasure descriptions to the container.  The displayed menu allows [Add], [Edit], and [Delete] functions to manage multiple lines/rows of treasure description.</td></tr>'
							+'	<tr><th scope="row">Container Type:</th><td>Sets the type of the Magic Item container or Bag.  Available choices are: Untrapped container, Trapped container, Force to be an Inanimate Container, Force to be a Sentient creature. If searched,  Inanimate objects can be looted without penalty;  Sentient beings require a Pick Pockets check; Trapped containers call a Trap ability macro on the container\'s character sheet to determine the effect.  See the <b>--search</b> command below.</td></tr>'
							+'	<tr><th scope="row">Container Size:</th><td>Sets the maximum number of items that can be stored in the selected Character\'s/containers bag.  The default is 18 items, though identical items can be stacked.</td></tr>'
							+'	<tr><th scope="row">Show As:</th><td>Sets what level of item description a Player sees when looting a container. Either "Show as Item Types" (e.g. potion, scroll, melee weapon, etc), or "Show as Item Names" (default) which shows the display names of the items. Once picked up from the container, will always show their display names.</td></tr>'
							+'</table>'
							+'<h3>4.2 Check a token for traps</h3>'
							+'<pre>--find-traps token_id|check_id|searcher_id</pre>'
							+'<p>Takes a mandatory token ID of the character\'s token, mandatory token ID of the token to check for traps, mandatory token ID of the token doing the checking.</p>'
							+'<p>This command will check a token for any traps. If the container represented by the token was created using the <i>Drag & Drop</i> container system (see <b>CommandMaster API</b> documentaion for details of the <i>Drag & Drop</i> container system) this command will start the selected container\'s <i>"Find & Remove Traps"</i> programmed sequence, with a (small) chance of the trap (if any) being triggered. If the trap is successfully removed, the container may still be locked but will no longer be trapped. If the token represents any other type of character, container, creature or object a standard <i>"Find/Remove Traps"</i> sequence will ensue, resulting in the party (and the GM) being alerted to the success or otherwise of the outcome.</p>'
							+'<p>In either case, the default approach to the <i>Find Traps</i> roll is that the GM is asked to make it - being presented with a drop-down list of options that includes (a) just rolling 1d100 against the character\'s chance, (b) forcing a successful roll (e.g. if they were meant to find it), and (c) forcing a failure to find a trap (e.g. if there is no trap to be found). The GM can use the <b>!magic --config</b> command to change this action so that the player always rolls to <i>Find Traps</i>, though this might result in an indication for a (non-<i>Drag & Drop</i>) container indicating success for a container that is not trapped!</p>'
							+'<h3>4.3 <span style='+design.selected_button+'>Update:</span> Searching/Storing tokens with Items and Treasure</h3>'
							+'<pre>--search token_id|pick_id|put_id</pre>'
							+'<p>Takes a mandatory token ID of the character\'s token, mandatory token ID of the token to search and pick up items from, mandatory token ID of the token to put picked up items into.</p>'
							+'<p>This command can be used to pick the pockets of an NPC or even another Player Character, as well as to loot magic item and treasure containers such as Chests and dead bodies.  It can also be used for putting stuff away, storing items from the character\'s Magic Item Bag into a container, for instance if the MI Bag is getting too full (it is limited to the number of items specified via the --gm-edit-mi menu, though similar items can be stacked). The effect of this command depends on the type of the container: intelligent characters, NPCs and creatures (even if only with animal intelligence of 1) are considered sentient unless they are dead (Hit Points equal to or less than zero). The trapped container status is set by any <i>Drag & Drop</i> container, or via the GM\'s [Add Items] button or <b>!magic --gm-edit-mi</b> command. All other containers (tokens with character sheets) are considered inanimate and untrapped. Any status can also be overridden if so desired by resetting the container type using the <i>Add Items</i> dialog to set the type to a different value - a sentient creature can be forced to be inanimate (i.e. does not need a <i>pick pockets</i> roll), and visa-versa (e.g. luggage Terry Pratchett style).</p>'
							+'<table>'
							+'	<tr><th scope="row">Inanimate container:</th><td>a message is shown to the Player saying the container is empty or the items in the container are displayed, and the character doing the search (associated with the put_id token ID) can pick them up and store them in their own Magic Item Bag or, if storing, put items from their character into the container.</td></tr>'
							+'	<tr><th scope="row">Sentient Creature:</th><td>if searching, a Pick Pockets check is undertaken - the Player is asked to roll a dice and enter the result (or Roll20 can do it for them), which is compared to the Pick Pockets score on their character sheet.  If successful, a message is displayed in the same way as an Inanimate object.  If unsuccessful, a further check is made against the level of the being targeted to see if they notice, and the DM is informed either way.  The DM can then take whatever action they believe is needed. Of course, you can always freely <i>give/store</i> items to another creature.</td></tr>'
							+'	<tr><th scope="row">Trapped container:</th><td>Traps can be as simple or as complex as the DM desires.  Traps may be nothing more than a lock that requires a Player to say they have a specific key, or a combination that has to be chosen from a list, and nothing happens if it is wrong other than the items in the container not being displayed.  Or setting a trap off can have damaging consequences for the character searching or the whole party.  It can just be a /whisper gm message to let the DM know that the trapped container has been searched.  Searching a trapped container with this command calls an ability macro called "Trap-@{container_name|version}" on the container\'s character sheet: if this does not exist, it calls an ability macro just called "Trap".  The first version allows the Trap macro to change the behaviour on subsequent calls to the Trap functionality (if using the ChatSetAttr API to change the version attribute), for instance to allow the chest to open normally once the trap has been defused or expended.  This functionality requires confidence in Roll20 macro programming.<br><b>Important Note:</b> all Character Sheets representing Trapped containers <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  Otherwise, Players will not be able to run the macros contained in them that operate the trap!</td></tr>'
							+'</table>'
							+'<p><span style='+design.selected_button+'>New:</span> <b>Note:</b> Some items are not stackable - they are single items with charges such as a wand or rod, or a spell-storing item which must retain its uniqueness so the spells remain associated. However, it is also the case that non-stackable items like these need to have unique names in the container to retain their unique identity. Thus, when a second copy of a non-stackable item is picked up or put away into a container that already contains another item with the same name, the player will be asked to provide a new unique name for the item (which cannot be the same as any other magic item, even those not in the container - sorry, you can\'t turn that <i>ring of protection+1</i> into a <i>ring of wishes</i>!). Once the item is stored with this new name, it will work in all respects like the item it is, just with a different name.</p>'
							+'<h3>4.4 Looting and storing without searching a container</h3>'
							+'<pre>--pickorput token_id|pick_id|put_id|[SHORT/LONG]</pre>'
							+'<p>Takes a mandatory token ID for the Player\'s character, a mandatory token ID for the token to pick items from, a mandatory token ID for the token to put items in to, and an optional argument specifying whether to use a long or a short menu.</p>'
							+'<p>This command displays a menu from which items on the character sheet associated with the Pick token can be selected to put in the character sheet associated with the Put token.  The Player character\'s token can be either the Put token (if picking up items from a container) or the Pick token (if storing items from their sheet into the container).  The other token can be another Player Character (useful for one character giving a magic item to another character) or any other selectable token with a character sheet.  No traps or sentient being checks are made by this command - this allows the DM to allow Players to bypass the searching functionality when looting a container or storing items in it.  Note: the Player\'s Magic Item menu (accessed via the <b>--mimenu</b> command) does not have an option to loot without searching.</p>'
							+'<p>There are two forms of this menu - the Long form displays all items in the container as individual buttons for the Player to select from, and a single button to store the item: this is generally OK when looting containers with not much in them.  The Short form of the menu shows only two buttons: one button which, when clicked, brings up a pick list of all the items in the Pick container, and another button to store the item in the Put container: this is generally best for when a character is storing something from their character sheet items into a chest or other container, or giving an MI to another character, as a character\'s sheet often has many items in it which can make a Long menu very long.  Each type of menu has a button on it to switch to the other type of menu without re-issuing the command.  If not specified in the command, the type of menu the Player last used in this campaign is remembered and used by the system.</p>'
							+'<br>'
							+'<h2>5.Light source management</h2>'
							+'<p>These functions use Roll20 Dynamic Lighting to provide a token with a light source.  If your campaign does not use Dynamic Lighting, they will not function.  They can also be accessed through the menu displayed by the AttackMaster API <b>!attk --other-menu</b> command.</p>'
							+'<h3>5.1 Show a menu of Light Sources to select from</h3>'
							+'<pre>--lightsources [token_id]</pre>'
							+'<p>Takes an optional token ID as an argument. If token ID is not specified, uses the selected token.</p>'
							+'<p>This command brings up a menu showing a selection of various light sources that a character can use.  Selecting one will change the Roll20 Dynamic Lighting values on the Token identified to provide this lighting effect.  These are:</p>'
							+'<ul>'
							+'	<li>Magic Weapon or Magical Armour (5ft radius circle),</li>'
							+'	<li>Torch (15ft radius circle),</li>'
							+'	<li>Hooded Lantern (30ft radius circle),</li>'
							+'	<li>Continual Light lantern (60ft radius circle),</li>'
							+'	<li>Bullseye Lantern (cone of light, 20 degrees wide and 60ft long),</li>'
							+'	<li>Beacon Lantern (cone of light, 20 degrees wide and 240ft long).</li>'
							+'</ul>'
							+'<p>The menu shows [ON] and [OFF] buttons for each type.  Only one type can be ON for each Token: selecting an ON button for any light source turns OFF the others for that Token.  Turning the current light source off will turn off all lighting effects on the identified token.</p>'
							+'<h3>5.2 Set a lightsource for a token</h3>'
							+'<pre>--light token_id|(NONE/WEAPON/TORCH/HOODED/CONTLIGHT/BULLSEYE/BEACON)</pre>'
							+'<p>Takes a mandatory token ID, and a mandatory type of light source.</p>'
							+'<p>This command sets the light source type that the identified token is using, and changes the Roll20 Dynamic Lighting settings of the token to the relevant value shown under section 5.1, or turn off all lighting effects for the selected token if NONE is specified.</p>'
							+'<br>'
							+'<h2>6.Other commands</h2>'
							+'<h3>6.1 Display help on these commands</h3>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h3>6.2 Display a formatted message in chat</h3>'
							+'<pre>--message [who|][token_id]|title|message|[command]</pre>'
							+'<p>This command takes an optional parameter stating who to send the message to, which defaults to depending on who owns the character represented by the token, an optional token_id which defaults to a selected token, a title for the message which can be an empty string, the message to display, and an optional API command string to be sent at the same time that the message is sent (can use standard & extended escape characters).</p>'
							+'<p>The "who" parameter can be one of:</p>'
							+'<table>'
							+'	<tr><th scope="row">gm</th><td>Send only to the GM</td></tr>'
							+'	<tr><th scope="row">whisper</th><td>Send only to the players that control the character represented by the token</td></tr>'
							+'	<tr><th scope="row">w</th><td>Short for "whisper" and does the same</td></tr>'
							+'	<tr><th scope="row">public</th><td>Send to all players and the GM</td></tr>'
							+'	<tr><th scope="row">standard</th><td>Check which players/GMs control the character represented by the token. If the GM controls, or no-one, or the controlling player is not on-line, or the token does not represent a character, send to the GM; otherise make public.</td></tr>'
							+'	<tr><th scope="row">Anything else</th><td>Same as Standard</td></tr>'
							+'</table>'
							+'<h3>6.3 Display a database item or Character Sheet ability</h3>'
							+'<pre>--display-ability [who|][token_id]|database|db_item|[dice_roll1]|[dice_roll2]|[target_id]</pre>'
							+'<p>This command takes an optional parameter stating who to send the output to, which defaults to depending on who owns the character represented by the token, an optional token_id which defaults to a selected token, the mandatory name or ID of a database or character sheet, the mandatory name of a database item or character sheet ability macro, two optional dice roll results (or Roll20 in-line roll specifications), and an optional token_id of a target token.</p>'
							+'<p>This command can be used to extract database items wherever they are currently stored and display them to a player, character, the GM, or publicly - the options are the same as for the <b>--message</b> command above. If the "database" parameter has a name that includes "-DB" the db_item is read from the databases. This includes extracting database items from the databases held in code by the APIs and displaying them, as if they were ability macros in a Character Sheet, or from a Character Sheet database if the db_item exists there. If the "database" parameter is not for a database, but instead represents the name of a Character Sheet that <u>does not</u> include "-DB", the command will look for and display an ability macro with name "db_item" from that character sheet.</p>'
							+'<p>Whether from the databases or from a character sheet ability macro, the item retrieved can optionally have up to two dice roll values and/or a target token ID passed to it. The dice roll parameters will <i>replace</i> the place-holders %%diceRoll1%% and %%diceRoll2%% in the retrieved item. The parameters can be plain numbers, roll queries (which will be resolved if the command is passed via the chat window or an API button), or in-line roll calculations in Roll20 format (using [[...]]). The target token_id will <i>replace</i> anywhere the <i>@{target|...|token_id}</i> syntax is used.</p>'
							+'<h3>6.4 Tidy one or more character sheets</h3>'
							+'<pre>--tidy [token_id]</pre>'
							+'<p>This command takes an optional token_id. If not specified, the command will act on the character sheets represented by all currently selected tokens.</p>'
							+'<p>This command tidies up the character sheet, removing Spell and Magic Item attribute and ability objects that are no longer for items held, and for spells no longer in any spell book.  Attack ability objects will also all be removed.  All of these will be recreated as and when these items, spells or attacks are again picked up, added to spell books, or used for attacks. This simplifies and speeds up the system, removing redundant processing and memory usage.</p>'
							+'<p><b>Note:</b> this command is automatically run whenever the DM moves the "Player Ribbon" to a new map page, for every token on that map page that represents a character sheet, and also whenever a character token is dragged onto the active Player page. This continually tidies the system while not imposing a heavy overhead on processing.</p>'
							+'<h3>6.5 Configure API behavior</h3>'
							+'<pre>--config [FANCY-MENUS/SPECIALIST-RULES/SPELL-NUM/ALL-SPELLS/ALL-POWERS/CUSTOM-SPELLS/AUTO-HIDE/ALPHA-LISTS/GM-ROLLS] | [TRUE/FALSE]</pre>'
							+'<p>Takes two optional arguments, the first a switchable flag name, and the second TRUE or FALSE.</p>'
							+'<p>Allows configuration of several API behaviors.  If no arguments given, displays menu for DM to select configuration.  Parameters have the following effects:</p>'
							+'<table>'
							+'	<thead><tr><th>Flag</th><th>True</th><th>False</th></tr></thead>'
							+'	<tr><th scope="row">FANCY-MENUS</th><td>Use chat menus with a textured background</td><td>Use chat menus with a plain background</td></tr>'
							+'	<tr><th scope="row">SPECIALIST-RULES</th><td>Only Specialist Wizards specified in the PHB get an extra spell per spell level</td><td>Any non-Standard Wizard gets an extra spell per spell level</td></tr>'
							+'	<tr><th scope="row">SPELL-NUM</th><td>Spellcaster spells per level restricted to PHB rules</td><td>Spellcaster spells per level alterable using Misc Spells button</td></tr>'
							+'	<tr><th scope="row">ALL-SPELLS</th><td>Spellcaster spell schools are unrestricted</td><td>Spellcaster spell schools are restricted by class rules</td></tr>'
							+'	<tr><th scope="row">ALL-POWERS</th><td>Class powers not restricted by level</td><td>Class powers <i>are</i> restricted by level as per spec</td></tr>'
							+'	<tr><th scope="row">CUSTOM-SPELLS</th><td>No distributed custom spells/items allowed (but CS DB allowed)</td><td>All custom spells and items allowed</td></tr>'
							+'	<tr><th scope="row">AUTO-HIDE</th><td>Items defined to be hideable will be automatically hidden when added to containers</td><td>Hideable items must be hidden manually if desired</td></tr>'
							+'	<tr><th scope="row">ALPHA-LISTS</th><td>Long lists will automatically be split into alpha lists</td><td>Whole long lists will be displayed for selection</td></tr>'
							+'	<tr><th scope="row">GM-ROLLS</th><td>GM is asked to roll thievish skill-based chances when using Find Traps</td><td>Player rolls skill-based chances for Find Traps</td></tr>'
							+'</table>'
							+'<h3>6.6 Check database completeness & integrity (GM only)</h3>'
							+'<pre>--check-db [ db-name ]</pre>'
							+'<p>Takes an optional database name or part of a database name: if a partial name, checks all character sheets with the provided text in their name that also have \'-db\' as part of their name.  If omitted, checks all character sheets with \'-db\' in the name.  Not case sensitive.  Can only be used by the GM.</p>'
							+'<p>This command finds all databases that match the name or partial name provided (not case sensitive), and checks them for completeness and integrity.  The command does not alter any ability macros, but ensures that the casting time (\'ct-\') attributes are correctly created, that the item lists are sorted and complete, and that any item-specific power & spell specifications are correctly built and saved.</p>'
							+'<p>This command is very useful to run after creating/adding new items as ability macros to the databases (see specific database documentation).  It does not check if the ability macro definition itself is valid, but if it is then it ensures all other aspects of the database consistently reflect the new ability(s).</p>'
							+'<h3>6.7 Extract database for Editing</h3>'
							+'<pre>--extract-db [db-name]</pre>'
							+'<p>Takes an optional database name or part of a database name: if a partial name, extracts all character sheets with the provided text in their name that also have \'-db\' as part of their name.  If omitted, checks all character sheets with \'-db\' in the name.  Not case sensitive.  Can only be used by the GM.</p>'
							+'<p>Extracts a named database or all provided databases from the loaded RPGMaster Library, and builds the database(s) in a Character Sheet format: see the Database specific help handouts for further details of this format.  This allows editing of the standard items in the databases, adding additional items to the databases, or for items to be copied into the GM\'s own databases.  Unlike with previous versions of the Master Series APIs, these extracted databases will not be overwritten automatically by the system. <b>However:</b> using extracted databases will slow the system down - the use of the internal API databases held in memory is much faster. The best use for these extracts is to examine how various items have been programmed so that the GM can create variations of the standard items in their own databases by copying and making small alterations to the definitions, and then the extracted databases can be deleted.</p>'
							+'<p><b>Important:</b> Once a Character Sheet database is changed or deleted, run the <b>!magic --check-db</b> command against any database (especially a changed one) to prompt the APIs to re-index the objects in all databases.</p>'
							+'<h3>6.8 Handshake with other APIs</h3>'
							+'<pre>-hsq from|[command]<br>'
							+'-handshake from|[command]</pre>'
							+'<p>Either form performs a handshake with another API, whose call (without the \'!\') is specified as <i>from</i> in the command parameters (the response is always an <b>-hsr</b> command).  The command calls the <i>from</i> API command responding with its own command to confirm that this API is loaded and running: e.g. </p>'
							+'<dl><dt>Received:</dt><dd><i>!magic -hsq init</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr magic</i></dd></dl>'
							+'<p>Optionally, a command query can be made to see if the command is supported by MagicMaster if the <i>command</i> string parameter is added, where <i>command</i> is the MagicMaster command (the \'--\' text without the \'--\').  This will respond with a <i>true/false</i> response: e.g.</p>'
							+'<dl><dt>Received:</dt><dd><i>!magic -handshake init|menu</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr magic|menu|true</i></dd></dl>'
							+'<h3>6.9 Switch on or off Debug mode</h3>'
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
	var miTypeLists;
	var clTypeLists;
	var spTypeLists;
	var reSpellSpecs;
	var reClassSpecs;
	var saveFormat;
	var spellsPerLevel;
	var casterLevels;
	var specMU;
	var ordMU;
	var wisdomSpells;
	var spellLevels;
	var showMoreObj;

	/*
	 * MagicMaster specific global data tables and variables.
	 */

	const MIB_StateEnum = Object.freeze({
		NOBAG: 0,
		OLDBAG: 6,
		V4BAG: 12,
	});

	const PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	const messages = Object.freeze({
		header: '&{template:'+fields.menuTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}',
		restHeader: '&{template:'+fields.menuTemplate+'} {{name=^^cname^^ is Resting}}',
		noChar: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Items Bag}}{{desc=^^cname^^ does not have an associated Character Sheet, and so cannot have a Magic Item Bag.}}',
		noMIBag: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Items Bag}}{{desc=^^cname^^ does not have a Magic Item bag!  Perhaps you ought to invest in one...  Go and find an appropriate vendor (ask the DM).}}',
		oldMIBag: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=^^cname^^ has an old v3 Magic Item bag, which will not hold the latest, cutting edge Magic Items!  Perhaps you ought to invest in a new one...  Go and find an appropriate vendor (ask the DM).}}',
		cursedSlot: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh what a shame.  No, you can\'t overwrite a cursed item with a different item.  You\'ll need a *Remove Curse* spell or equivalent to be rid of it!}}',
		cursedItem: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try putting this away, but is seems to be back where it was...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		nothingToPick: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=You seem to be trying to pick up something invisible, even to me! I can\'t pick up thin air...}}',
		slotFull: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^\'s\nMagic Item Bag}}{{desc=The slot you chose is already full.}}',
		fruitlessSearch: 'does not have a store of Magic Items}}',
		noSpellbooks: '&{template:'+fields.warningTemplate+'} {{name=Spellbooks}}{{desc=^^cname^^ does not have any spellbooks!}}',
		noMUspellbook: '&{template:'+fields.warningTemplate+'} {{name=Spellbooks}}{{desc=^^cname^^ does not have a Wizard\'s spellbook.  Do they want one?  Speak to the Arch-Mage (or, failing that, the DM)}}',
		noPRspellbook: '&{template:'+fields.warningTemplate+'} {{name=Spellbooks}}{{desc=^^cname^^ does not have a Priest\'s spellbook.  Do they want one?  Pray to your god (or, failing that, the DM)}}',
		chooseSpellMenu: '&{template:'+fields.menuTemplate+'} {{name=Spellbooks}}{{section1=^^cname^^ has both Wizard and Priest spellbooks.  Which do you want to use?}}{{section2=[Wizard](!magic --spellmenu ^^tid^^|MU) or [Priest](!magic --spellmenu ^^tid^^|PR)}}',
		shortRest: '&{template:'+fields.messageTemplate+'} {{name=^^cname^^ is Resting}}{{desc=After a short rest, ^^cname^^ has rememorised all their 1st level spells}}',
		longRest: 'After a good long rest, ^^cname^^ has regained their powers, read their spellbooks and rememorised their spells, and magic items that recharge have regained their charges.}}',
		noLongRest: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^ is Unable to Rest}}{{desc=I don\'t think the DM has declared it is time for a rest yet, perhaps due to system lag.}}{{desc1=[Try Again](!magic --rest ^^tid^^|long) once the DM says you can}}',
		noMoreCharges: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^ Has No Charges}}{{desc=^^cname^^ has used all the charges of the Power, Spell or Magic Item that they are using, and needs to rest before any charges are available again.}}',
		miBagFull: '&{template:'+fields.warningTemplate+'} {{name=^^c2name^^ MI Bag Full}}{{desc=There are no slots left in the selected container for any more items to store}}',
		fixedSpell: '&{template:'+fields.warningTemplate+'} {{name=Fixed MI Spell Slot}}{{desc=The chosen slot in your spell-storing Magic Item is fixed to be the named spell. You may only refresh it with the same spell}}',
		notSpellCaster: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^ is Not a Spell Caster}}{{desc=^^cname^^ may aspire to be a wonderful Wizard or powerful Priest, but has yet to fulfil those desires.  Until then, refrain from pretending - you will be found out!}}',
		notYetSpellCaster: '&{template:'+fields.warningTemplate+'} {{name=^^cname^^ can\'t cast spells yet}}{{desc=^^cname^^ is eager to reach a level of experience at which they can cast spells: keep adventuring and you\'ll get there soon!}}',
		castSpellClass: '&{template:'+fields.menuTemplate+'} {{name=Spellbooks}}{{desc=^^cname^^ has both Wizard and Priest spellbooks.  Which do you want to use?}}{{desc1=[Wizard](!magic --cast-spell MU|^^tid^^) or [Priest](!magic --cast-spell PR|^^tid^^)}}',
		memSpellClass: '&{template:'+fields.menuTemplate+'} {{name=Spellbooks}}{{desc=^^cname^^ has both Wizard and Priest spellbooks.  Which do you want to use?}}{{desc1=[Wizard](!magic --mem-spell MU|^^tid^^) or [Priest](!magic --mem-spell PR|^^tid^^)}}',
		viewSpellClass: '&{template:'+fields.menuTemplate+'} {{name=Spellbooks}}{{desc=^^cname^^ has both Wizard and Priest spellbooks.  Which do you want to view?}}{{desc1=[Wizard](!magic --view-spell MU|^^tid^^) or [Priest](!magic --view-spell PR|^^tid^^)}}',
		noStoring: '&{template:'+fields.warningTemplate+'} {{name=Can\'t Store Items Here}}{{desc=You can\'t store items in the selected container. Perhaps try somewhere else?}}',
	});

	const BT = Object.freeze({
		ADD_MIROW:      	'ADD_MIROW',
		ADD_TO_STORE:		'ADD_TO_STORE',
		ADD_AS_POWER:		'ADD_AS_POWER',
		MON_ATTACK:			'MON_ATTACK',
		MON_INNATE:			'MON_INNATE',
		MON_MELEE:			'MON_MELEE',
		MELEE:				'MELEE',
		MW_DMGSM:			'MW_DMGSM',
		MW_DMGL:			'MW_DMGL',
		MON_RANGED:			'MON_RANGED',
		RANGED:				'RANGED',
		RANGEMOD:			'RANGEMOD',
		RW_DMGSM:			'RW_DMGSM',
		RW_DMGL:			'RW_DMGL',
		MI_SPELL:       	'MI_SPELL',
		MI_POWER:			'MI_POWER',
		MI_POWER_USED:		'MI_POWER_USED',
		MI_POWER_CHARGE_USED:'MI_POWER_CHARGE_USED',
		LEVEL_CHANGE:		'LEVEL_CHANGE',
		LEFTRING:			'LEFTRING',
		RIGHTRING:			'RIGHTRING',
		MU_SPELL:			'MU_SPELL',
		MU_TO_STORE:		'MU_TO_STORE',
		MU_TO_STORE_ANY:	'MU_TO_STORE_ANY',
		MU_TO_STORE_ADD:	'MU_TO_STORE_ADD',
		MU_MI_SLOT:			'MU_MI_SLOT',
		MU_MI_SLOT_ANY:		'MU_MI_SLOT_ANY',
		MU_MI_SLOT_ADD:		'MU_MI_SLOT_ADD',
		PR_SPELL:			'PR_SPELL',
		PR_TO_STORE:		'PR_TO_STORE',
		PR_TO_STORE_ANY:	'PR_TO_STORE_ANY',
		PR_TO_STORE_ADD:	'PR_TO_STORE_ADD',
		PR_MI_SLOT:			'PR_MI_SLOT',
		PR_MI_SLOT_ANY:		'PR_MI_SLOT_ANY',
		PR_MI_SLOT_ADD:		'PR_MI_SLOT_ADD',
		CAST_MUSPELL:		'CAST_MUSPELL',
		CAST_PRSPELL:		'CAST_PRSPELL',
		CAST_MISPELL:   	'CAST_MISPELL',
		CAST_MIPOWER:		'CAST_MIPOWER',
		CAST_SCROLL:		'CAST_SCROLL',
		CHOOSE_MUSPELL:		'CHOOSE_MUSPELL',
		CHOOSE_PRSPELL:		'CHOOSE_PRSPELL',
		CHOOSE_POWER:		'CHOOSE_POWER',
		CHOOSE_MI:			'CHOOSE_MI',
		CHOOSE_MARTIAL_MI:	'CHOOSE_MARTIAL_MI',
		CHOOSE_ALLITEMS_MI:	'CHOOSE_ALLITEMS_MI',
		REDO_CHOOSE_MI:		'REDO_CHOOSE_MI',
		REDO_MARTIAL_MI:	'REDO_MARTIAL_MI',
		REDO_ALLITEMS_MI:	'REDO_ALLITEMS_MI',
		CHOOSE_VIEW_MI:		'CHOOSE_VIEW_MI',
		CHOOSE_USE_MI:		'CHOOSE_USE_MI',
		CHOOSE_TO_STORE:	'CHOOSE_TO_STORE',
		REVIEW_MUSPELL:		'REVIEW_MUSPELL',
		REVIEW_PRSPELL:		'REVIEW_PRSPELL',
		REVIEW_POWER:		'REVIEW_POWER',
		REVIEW_MI:			'REVIEW_MI',
		REVIEW_MARTIAL_MI:	'REVIEW_MARTIAL_MI',
		REVIEW_ALLITEMS_MI:	'REVIEW_ALLITEMS_MI',
		REVIEW_MIPOWER:		'REVIEW_MIPOWER',
		REVIEW_STORE:		'REVIEW_STORE',
		LEARNT_MUSPELL:		'LEARNT_MUSPELL',
		SLOT_MUSPELL:		'SLOT_MUSPELL',
		SLOT_PRSPELL:		'SLOT_PRSPELL',
		SLOT_POWER:			'SLOT_POWER',
		SLOT_MI:			'SLOT_MI',
		SLOT_MARTIAL_MI:	'SLOT_MARTIAL_MI',
		SLOT_ALLITEMS_MI:	'SLOT_ALLITEMS_MI',
		MISC_SPELL:			'MISC_SPELL',
		MEM_MUSPELL:		'MEM_MUSPELL',
		MEM_PRSPELL:		'MEM_PRSPELL',
		MEM_POWER:			'MEM_POWER',
		MEM_MIPOWER:		'MEM_MIPOWER',
		MEMALL_POWERS:		'MEMALL_POWERS',
		EDIT_MUSPELLS:		'EDIT_MUSPELLS',
		EDIT_PRSPELLS:		'EDIT_PRSPELLS',
		EDIT_NOSPELLS:		'EDIT_NOSPELLS',
		EDIT_POWERS:		'EDIT_POWERS',
		EDIT_MIMUSPELLS:	'EDIT_MIMUSPELLS',
		EDIT_MIPRSPELLS:	'EDIT_MIPRSPELLS',
		EDIT_MIPOWERS:		'EDIT_MIPOWERS',
		EDIT_MI:			'EDIT_MI',
		EDIT_MARTIAL:		'EDIT_MARTIAL',
		EDIT_ALLITEMS:		'EDIT_ALLITEMS',
		EDITMI_OPTION:  	'EDITMI_OPTION',
		EDITMARTIAL_OPTION:	'EDITMARTIAL_OPTION',
		EDITALLITEMS_OPTION:'EDITALLITEMS_OPTION',
		ALPHALIST_OPTION:	'ALPHALIST_OPTION',
		REMOVE_MUSPELL:		'REMOVE_MUSPELL',
		REMOVE_PRSPELL:		'REMOVE_PRSPELL',
		REMOVE_POWER:		'REMOVE_POWER',
		REMOVE_MI:			'REMOVE_MI',
		REMOVE_MARTIAL_MI:	'REMOVE_MARTIAL_MI',
		DEL_STORED:			'DEL_STORED',
		STORE_MI:			'STORE_MI',
		STORE_MARTIAL_MI:	'STORE_MARTIAL_MI',
		STORE_ALLITEMS_MI:	'STORE_ALLITEMS_MI',
		MISTORE_MUSPELL:	'MISTORE_MUSPELL',
		MISTORE_PRSPELL:	'MISTORE_PRSPELL',
		MISTORE_MUSPELL_ANY:'MISTORE_MUSPELL_ANY',
		MISTORE_PRSPELL_ANY:'MISTORE_PRSPELL_ANY',
		MISTORE_MUSPELL_ADD:'MISTORE_MUSPELL_ADD',
		MISTORE_PRSPELL_ADD:'MISTORE_PRSPELL_ADD',
		VIEW_MUSPELL:		'VIEW_MUSPELL',
		VIEW_PRSPELL:		'VIEW_PRSPELL',
		VIEW_POWER:			'VIEW_POWER',
		VIEW_MI_POWER:  	'VIEW_MI_POWER',
		VIEW_MI_SPELL:		'VIEW_MI_SPELL',
		VIEW_MI_MUSPELL:	'VIEW_MI_MUSPELL',
		VIEW_MI_PRSPELL:	'VIEW_MI_PRSPELL',
		VIEW_MI:			'VIEW_MI',
		VIEWMI_OPTION:  	'VIEWMI_OPTION',
		VIEWMEM_MUSPELLS:	'VIEWMEM_MUSPELLS',
		VIEWMEM_PRSPELLS:	'VIEWMEM_PRSPELLS',
		VIEWMEM_POWERS:		'VIEWMEM_POWERS',
		VIEWMEM_MI_POWERS:  'VIEWMEM_MI_POWERS',
		VIEWMEM_MI_SPELLS:	'VIEWMEM_MI_SPELLS',
		VIEWMEM_MI_MUSPELLS:'VIEWMEM_MI_MUSPELLS',
		VIEWMEM_MI_PRSPELLS:'VIEWMEM_MI_PRSPELLS',
		POP_PICK:			'POP_PICK',
		POP_STORE:			'POPsubmit',
		PICKMI_OPTION:		'PICKMI_OPTION',
		PUTMI_OPTION:		'PUTMI_OPTION',
		LOCKTYPE:			'LOCKTYPE',
		TRAPTYPE:			'TRAPTYPE',
		POWER:				'POWER',
		USE_POWER:			'USE_POWER',
		USE_MI:				'USE_MI',
		USEMI_OPTION:   	'USEMI_OPTION',
		MI_BAG:				'MI_BAG',
		THIEF:				'THIEF',
		MOVE:				'MOVE',
		CHG_WEAP:			'CHG_WEAP',
		STAND:				'STAND',
		SPECIFY:			'SPECIFY',
		CARRY:				'CARRY',
		SUBMIT:				'SUBMIT',
		RIGHT:				'PRIMARY',
		LEFT:				'OFFHAND',
		BOTH:				'BOTH',
		HAND:				'HAND',
		AB_ASK_TOKENBARS:	'AB_ASK_TOKENBARS',
	});
	
	const reIgnore = /[\s\-\_]*/gi;
	const reCastMIspellCmd = /!magic\s+--(?:cast|view)-spell\s+MI(?:-SPELLS)?\s*\|/im;
	const reCastMIpowerCmd = /!magic\s+--(?:cast|view)-spell\s+MI-POWERS?\s*\|/im;
	const reLooksLike = /Looks\s?Like=/im;
	const reInitMIqty = /}}\s*?\w*?data\s*?=.*?[\[,]\s*?qty:([d\d\+\-\*\/.]+?)[,\s\]]/im;
	const reSpecs = /}}\s*?specs\s*?=(.*?){{/im;
	const reSpecsAll = /\[\s*?(\w[-\+\s\w\|]*?)\s*?,\s*?(\w[-\s\w\|]*?\w)\s*?,\s*?(\w[\s\w\|]*?\w)\s*?,\s*?(\w[-\+\s\w\|]*?\w)\s*?\]/g;
	const reSpecClass = /\[\s*?\w[\s\|\w\-\+]*?\s*?,\s*?(\w[\s\|\w\-]*?)\s*?,.*?\]/g;
	const reSpecSuperType = /}}\s*Specs=\s*?\[\s*?\w[-\+\s\w\|]*?\s*?,\s*?\w[-\s\w\|]*?\w\s*?,\s*?\d+H(?:\|\d*H)\s*?,\s*?(\w[-\+\s\w\|]*?\w)\s*?\]/im;
	const reDataSpeed = /}}\s*?\w*?data\s*?=.*?[\[,]\s*?sp:([d\d\+\-\*\/.]+?)[,\s\]]/im;
	const reDataCost = /}}\s*?\w*?data\s*?=.*?[\[,]\s*?gp:(\d+?\.?\d*?)[,\s\]]/im;
	const reDataLevel = /}}\s*?\w*?data\s*?=.*?[\[,]\s*?lv:(\d+?)[,\s\]]/im;
	const reLevel = /[\[,]\s*?lv:(\d+?)[,\s\]]/im;
	const reClassData = /}}\s*?ClassData\s*?=(.*?){{/im;
	const reRaceData = /}}\s*?(?:Class|Race)Data\s*?=(.*?){{/im;
	const reSpellData = /}}\s*?SpellData\s*?=(.*?){{/im;
	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;
	const reItemData = /}}[\s\w\-]*?(?<!tohit|dmg|ammo|range)data\s*?=\s*?\[.+?\][\s,]*?{{/im;
	const reDataCharges = /}}[\s\w\-]*?(?<!tohit|dmg|ammo|range)data\s*?=\s*?\[[^\]]*?,?\s*?c:(\d+?)[,\s\]]/im;
	const reActionButton = /(?<!}}\w+?=)\[(?!view)([^\]]+)\]\([^\)]+\)/img;
	
	const dbReplacers = [
			[/\\amp;?/gm, "&"],
			[/\\lbrak;?/gm, "["],
			[/\\rbrak;?/gm, "]"],
			[/\\ques;?/gm, "?"],
			[/\\at;?/gm, "@"],
			[/\\dash;?/gm, "-"],
			[/\\n/gm, "\n"],
			[/\\vbar;?/gm, "|"],
			[/\\clon;?/gm, ":"],
			[/\\gt;?/gm, ">"],
			[/\\lt;?/gm, "<"],
			[/¦/g, "|"],
		];
		
	const msgReplacers = [
			[/\\api;?/g, "!"],
			[/\\lbrc;?/g, "{"],
			[/\\rbrc;?/g, "}"],
			[/\\gt;?/gm, ">"],
			[/\\lt;?/gm, "<"],
			[/<<|«/g, "["],
			[/\\lbrak;?/g, "["],
			[/>>|»/g, "]"],
			[/\\rbrak;?/g, "]"],
			[/\\\^/g, "?"],
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
			[/\\lpar;?/g, "("],
			[/\\rpar;?/g, ")"],
			[/\\cr;?/g, "&#13;"],
			[/&&/g, "&#47;"],
			[/%%/g, "&#37;"],
			[/\\fs;?/g, "\\"],
		];
		

	const dbEncoders = [
			[/\r?\n/gm,'\\n'],
			[/'/gm,"\\'"],
			[/&/gm,"\\\\amp;"],
			[/>/gm,"\\\\gt;"],
			[/</gm,"\\\\lt;"]
		];

	const	splitable = ['charged','uncharged','splitable','cursed','change-each','cursed+change-each'];
	const	stackable = ['charged','uncharged','cursed','change-each','cursed+change-each'];
	const	recharging = ['recharging','cursed+recharging','absorbing','cursed+absorbing'];

	
	var apiCommands = {},
		slotCounts = {},
		apiDBs = {magic:false,attk:false},
		GMalphaLists = true,
		msg_orig = {},
		time = Date.now();

	var flags = {
		mib_state: MIB_StateEnum.STOPPED,
		feedbackName: 'MagicMaster',
		feedbackImg:  'https://s3.amazonaws.com/files.d20.io/images/5063/thumb.png?1336230370',
		image: false,
		archive: false,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v1.207 determine if MI-DB character sheet is present
		FoundMagicItemDB: true,
		// RED: v3.060 determine if missing libraries should be notified
		notifyLibErr: true,
		noWaitMsg: true,
	};
		
	var MagicMaster_tmp = (function() {
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
			if (!state.MagicMaster)
				{state.MagicMaster = {};}
			if (_.isUndefined(state.MagicMaster.spellRules))
				{state.MagicMaster.spellRules = {specMU:true,strictNum:false,allowAll:false,allowAnyPower:false,denyCustom:false}}
			if (_.isUndefined(state.MagicMaster.fancy))
				{state.MagicMaster.fancy = true;}
			if (_.isUndefined(state.MagicMaster.alphaLists))
				{state.MagicMaster.alphaLists = true;}
			if (_.isUndefined(state.MagicMaster.autoHide))
				{state.MagicMaster.autoHide = false;}
			if (_.isUndefined(state.MagicMaster.reveal))
				{state.MagicMaster.reveal = false;}
			if (_.isUndefined(state.MagicMaster.viewActions))
				{state.MagicMaster.viewActions = false;}
			if (_.isUndefined(state.MagicMaster.gmRolls))
				{state.MagicMaster.gmRolls = true;}
			if (_.isUndefined(state.MagicMaster.debug))
				{state.MagicMaster.debug = false;}
			if (_.isUndefined(state.MagicMaster.gmID))
				{state.MagicMaster.gmID = undefined;}
			if (!state.MagicMaster.playerConfig)
				{state.MagicMaster.playerConfig = {};}
				
			if (!state.moneyMaster)
				{state.moneyMaster = {};}
			if (!state.moneyMaster.inGameDay)
				{state.moneyMaster.inGameDay = 0;}
			
			[fields,RPGMap] = getRPGMap();
			dbNames = RPGMap.dbNames;
			fieldGroups = RPGMap.fieldGroups;
			miTypeLists = RPGMap.miTypeLists;
			clTypeLists = RPGMap.clTypeLists;
			spTypeLists = RPGMap.spTypeLists;
			reSpellSpecs = RPGMap.reSpellSpecs;
			reClassSpecs = RPGMap.reClassSpecs;
			saveFormat = RPGMap.saveFormat;
			spellsPerLevel = RPGMap.spellsPerLevel;
			casterLevels = RPGMap.casterLevels;
			specMU = RPGMap.specMU;
			ordMU = RPGMap.ordMU;
			wisdomSpells = RPGMap.wisdomSpells;
			spellLevels = RPGMap.spellLevels;
			showMoreObj = RPGMap.showMoreObj;
			DBindex = undefined;
			flags.noWaitMsg = true;
			reSpellSpecs.reveal.def = state.MagicMaster.reveal ? 'use' : '';
			setTimeout( () => flags.noWaitMsg=false, 5000 );

			// RED: v2.040 check what other APIs are loaded
			setTimeout( () => issueHandshakeQuery('rounds'), 20);
			setTimeout( () => issueHandshakeQuery('attk'), 20);
			setTimeout( () => issueHandshakeQuery('cmd'), 20);
			setTimeout( () => updateHandouts(handouts,true,findTheGM()), 30);
			setTimeout(cmdMasterRegister, 40);
			setTimeout( () => updateDBindex(false), 80);
//			setTimeout( () => handleCStidy( [], true ), 5000 );

//			updateCharSheets(''); // Update any out-of-date character sheets to current version

			// RED: log the version of the API Script

			log('-=> MagicMaster v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
		} catch (e) {
			log('MagicMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendDebug('MagicMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendCatchError('MagicMaster',null,e,'MagicMaster initialisation');
		}
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
	
	// RED 3.060 Chat management functions moved to common library

	/**
	 * Function to send an API command to chat
	 * that has '^^parameter^^' replaced by relevant names & ids
	**/
	var sendAPImacro = function(senderId,charID,targetID,ability,modifier) {

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
				bar1 = curToken.get('bar1_value'),
				bar2 = curToken.get('bar2_value'),
				bar3 = curToken.get('bar3_value'),
				ac = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC,fields.Thac0_base).val,
				thac0 = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0,fields.Thac0_base).val,
				hp = getTokenValue(curToken,fields.Token_HP,fields.HP,null,fields.Thac0_base).val,
				targetcid = targetCS.id,
				targetchar = targetCS.get('name'),
				targettoken = getObj('graphic',targetID).get('name'),
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
				
				macroBody = macroBody.replace( /\@\{selected\|token_id}/gi, tid )
									 .replace( /\@\{selected\|/gi, '\@{'+cname+'|' )
									 .replace( /\^\^cname\^\^/gi , cname )
									 .replace( /\^\^tname\^\^/gi , tname )
									 .replace( /\^\^cid\^\^/gi , cid )
									 .replace( /\^\^tid\^\^/gi , tid )
									 .replace( /\^\^pid\^\^/gi , senderId )
									 .replace( /\^\^targetchar\^\^/gi , cname )
									 .replace( /\^\^targettoken\^\^/gi , tname )
									 .replace( /\^\^targetcid\^\^/gi , targetcid )
									 .replace( /\^\^targettid\^\^/gi , targetID )
									 .replace( /\^\^bar1_current\^\^/gi , bar1 )
									 .replace( /\^\^bar2_current\^\^/gi , bar2 )
									 .replace( /\^\^bar3_current\^\^/gi , bar3 )
									 .replace( /\^\^token_ac\^\^/gi , ac )
									 .replace( /\^\^token_thac0\^\^/gi , thac0 )
									 .replace( /\^\^token_hp\^\^/gi , hp );
									 
				sendChat("character|"+cid,sendMsgToWho(journal,senderId,macroBody),null,{noarchive:!flags.archive, use3d:false});
			}
		}
		return;
	};

	/**
	 * RED: v1.207 Send a debugging message if the debugging flag is set
	 */ 
	
	var sendDebug = function(msg) {
		if (!!state.MagicMaster.debug) {
			var player = getObj('player',state.MagicMaster.debug),
				to;
			if (player) {
				to = '/w "' + player.get('_displayname') + '" ';
			} else 
				{throw ('sendDebug could not find player');}
			if (!msg)
				{msg = 'No debug msg';}
			sendChat('MagicMaster Debug',to + '<span style="color: red; font-weight: bold;">'+msg+'</span>',null,{noarchive:!flags.archive, use3d:false}); 
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
			state.MagicMaster.debug = senderId;
			sendResponseError(senderId,'MagicMaster Debug set on for ' + playerName,'MagicMaster Debug');
			sendDebug('Debugging turned on');
		} else {
			sendResponseError(senderId,'MagicMaster Debugging turned off','MagicMaster Debug');
			state.MagicMaster.debug = false;
		}
	};

	/**
	 * Display a message when a character has picked up a magic item
	 **/

	var pickupMessage = function( args, miName, miType, pickedQty, fromCharges, toCharges, senderId ) {
	
		var tokenID = args[1],
			fromID = args[3],
			toID = args[4],
			cost = parseFloat(args[7]),
			charCS = getCharacter( tokenID ),
			picking = (tokenID == toID),
			content, pickOrPut, charges;
			
		content = '&{template:'+fields.messageTemplate+'}{{name='+(picking?'Picking Up':'Putting Away')+' Items}}{{desc=';
			
		if (picking) {
			pickOrPut = 'picked up ';
			charges = toCharges;
		} else {
			pickOrPut = 'put away ';
			charges = fromCharges;
		}
		
		switch (miType.toLowerCase()) {
		
		case 'charged':
		case 'cursed+charged':
		case 'perm-charged':
		case 'changing':
		case 'change-last':
		case 'cursed+change-last':
		case 'change-each':
		case 'cursed+change-each':
		case 'discharging':
		case 'perm-discharging':
		case 'cursed+discharging':
			content += 'You have '+pickOrPut+pickedQty+' '+miName+', and now have '+charges+' charges';
			break;
			
		case 'cursed+rechargeable':
		case 'cursed+selfchargeable':
		case 'rechargeable':
		case 'selfchargeable':
			content += 'You have '+pickOrPut+miName+', a rechargeable item (if you have the skill) with '+toCharges+' charges';
			break;
			
		case 'cursed+recharging':
		case 'recharging':
			content += 'You have '+pickOrPut+miName+', an item with a maximum of '+toCharges+' charges, which regains charges each night';
			break;
			
		case 'cursed+absorbing':
		case 'absorbing':
			content += 'You have '+pickOrPut_miName+', a charge-absorbing item currently with '+charges+' charges, which can increase to a maximum of '+toCharges;
			break;
			
		case 'cursed':
		case 'splitable':
		case 'uncharged':
		case 'single-uncharged':
		case 'cursed+uncharged':
		case 'enable':
		case 'disable':
		
		default:
			content += 'You have '+pickOrPut+pickedQty+' '+miName+''+((pickedQty>1)?'s':'')+', and now have '+charges;
			break;
		}
		
		if (cost && !isNaN(cost) && cost > 0) {
			content += ', at a cost of '+showCost( cost );
		}

		content += '.}}{{desc1=[Pick or put another MI](!magic --pickorput '+tokenID+'|'+fromID+'|'+toID+')}}';
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
	}
	
	
// -------------------------------------------- Roll20 utility functions ----------------------------------------------

	/**
	 * Issue a handshake request to check if another API or 
	 * specific API command is present
	 **/
	 
	var issueHandshakeQuery = function( api, cmd ) {
		var handshake = '!'+api+' --hsq magic'+((cmd && cmd.length) ? ('|'+cmd) : '');
		sendAPI(handshake);
		return;
	};
	
	/**
	 * Do any necessary updates
	 */
	 
	async function updateACS( charCS, curVer, senderId ) {
		
		try {
			var charName = charCS.get('name'),
				updated = false,
				csv = csVer(charCS);

			var updateCSspellCol = function( charCS, charName, c, senderId ) {
				return new Promise(resolve => {
					try {
						var	spellName, SpellCol,
							updated = false,
							r = 0;
						SpellCol = getTableField( charCS, {}, fields.Spells_table, fields.Spells_name, c );
						SpellCol = getTableField( charCS, SpellCol, fields.Spells_table, fields.Spells_macro, c, '' );
						SpellCol = getTableField( charCS, SpellCol, fields.Spells_table, fields.Spells_msg, c, '' );
						while (!_.isUndefined(spellName = SpellCol.tableLookup( fields.Spells_name, r, false ))) {
							if (spellName != '-') {
								updated = true;
								let msg = SpellCol.tableLookup( fields.Spells_macro, r );
								SpellCol = SpellCol.tableSet( fields.Spells_msg, r, msg );
								SpellCol = SpellCol.tableSet( fields.Spells_macro, r, (spellName != '-' ? ('%{'+charName+'|'+spellName+'}') : ''));
							}
							r++;
						}
					} catch (e) {
						log('MagicMaster updateCharSheets: JavaScript '+e.name+': '+e.message+' while converting sheet '+charCS.get('name'));
						sendDebug('MagicMaster updateCharSheets: JavaScript '+e.name+': '+e.message+' while converting sheet '+charCS.get('name'));
						sendCatchError('MagicMaster',msg_orig[senderId],e);
					} finally {
						setTimeout(() => {
							resolve(updated);
						}, 10);
					}
				});
			};
			
			if (csv < curVer) {
				if (csv < 2.1) {
//					log('updateACS: updating '+charName);
					for (let c=1; c<=fields.MaxSpellCol; c++) {
						await updateCSspellCol( charCS, charName, c, senderId );
					}
					csv = 2.1;
					setAttr( charCS, fields.msVersion, version );
				}
			}
		} catch (e) {
			sendCatchError('MagicMaster',msg_orig[senderId],e);
		}
	};

	var updateCharSheets = function(args,senderId) {
		
		var curVer = parseFloat(((version || '1.5').match(/^\d+\.\d+/) || ['1.5'])[0]) || 1.5,
			CSarray = [],
			charObj;
		
		if (args && args.length) {
			charObj = getCharacter(args[0]);
			if (charObj) {
				if (curVer > csVer(charObj)) {
					CSarray = [charObj];
				}
			}
		} else {
			let CSarray = filterObjs( obj => {
				if (obj.get('type') !== 'character') return false;
				if (obj.get('name').toLowerCase().includes('-db')) return false;
				return curVer > csVer(obj);
			});
		};
		for (const charCS of CSarray) {
			let delay = Math.round(10000+(Math.random() * 10000));
//			log('updateCharSheets: '+charCS.get('name')+' is in the list, delay = '+delay);
			setTimeout( updateACS, delay, charCS, curVer, senderId );
		}
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
						state.MagicMaster.gmID = player.id;
						return player.id;
					}
				}
			}))) {
				return playerGM.id;
			}
		}
		return state.MagicMaster.gmID;
	}
	
	/**
	 * Get the configuration for the player who's ID is passed in
	 * or, if the config is passed back in, set it in the state variable
	 **/
/*	 
	var getSetPlayerConfig = function( playerID, configObj ) {
		
		if (!state.MagicMaster.playerConfig[playerID]) {
			state.MagicMaster.playerConfig[playerID]={};
		}
		if (!_.isUndefined(configObj)) {
			state.MagicMaster.playerConfig[playerID] = configObj;
		};
		return state.MagicMaster.playerConfig[playerID];
	};
				
/* ------------------------------- Character Sheet Database Management -------------------------- */
	
	/*
	 * Check the version of a Character Sheet database and, if 
	 * it is earlier than the static data held in this API, update 
	 * it to the latest version.
	 */
	 
	var buildDB = function( dbFullName, dbObj, senderId, silent ) {
		
		return new Promise(resolve => {
			
			try {
				const dbName = dbFullName.toLowerCase(),
					  typeList = dbObj.type.includes('spell') ? spTypeLists : (dbObj.type.includes('class') ? clTypeLists : miTypeLists);
					  
				var	errFlag = buildCSdb( dbFullName, dbObj, typeList, silent );
			} catch (e) {
				sendCatchError('MagicMaster',msg_orig[senderId],e);
				var errFlag = true;
			} finally {
				setTimeout(() => {
					resolve(errFlag);
				}, 10);
			}
		});
	};
	
	var copyMarkerCSdb = function( APIdbName, UserDbName, itemClass ) {
		
		let APIdbCS = findObjs({ _type:'character', name:APIdbName });
		let reItemClass = new RegExp( itemClass, 'im' );
		if (!APIdbCS || !APIdbCS.length) {
			sendError(APIdbName+' not found');
			return;
		} else {
			APIdbCS = APIdbCS[0];
		}
		let UserDbCS = findObjs({ _type:'character', name:UserDbName });
		if (!UserDbCS || !UserDbCS.length) {
			UserDbCS = createObj( 'character', {name:UserDbName} );
		} else {
			UserDbCS = UserDbCS[0];
		}
		
		let abilities = findObjs({ _type:'ability', _characterid:APIdbCS.id })
						.filter( o => /\s--target\s|\s--touch\s/im.test(o.get('action')) )
						.filter( o => reItemClass.test(o.get('action')));
					
		_.each(abilities, a => {
			let UserObj = findObjs({_type:'ability', _characterid:UserDbCS.id, name:a.get('name') });
			if (!UserObj || !UserObj.length) {
				createObj( 'ability', {name: a.get('name'), action: a.get('action'), characterid: UserDbCS.id} );
			}
		});
		checkDB([UserDbName]);
		return;
	};

	/*
	 * Check a character sheet database and update/create the 
	 * required attributes from the definitions.  This should 
	 * be run after updating or adding item or spell definitions.
	 */
	 
	var checkDB = function( args ) {
		
		checkCSdb( args[0] );
		
		apiDBs.magic = true;
		updateDBindex(true);
		return;
	}
	
	/**
	 * Create an internal index of items in the databases 
	 * to make searches much faster.  Index entries indexed by
	 * database root name & short name (name in lower case with 
	 * '-', '_' and ' ' ignored).  index[0] = abilityID,
	 * index[1] = ct-attributeID
	 * v3.051 Check that other database-handling APIs have finished
	 *        updating their databases and performed a handshake
	 **/
	 
	var updateDBindex = function(forceUpdate=false) {
		
		apiDBs.attk = !!apiDBs.attk || ('undefined' === typeof attackMaster);

		DBindex = getDBindex(forceUpdate);
		parseClassDB(forceUpdate);
		return;
	}
	
/* ------------------------------- Magic Utility functions ----------------------------- */
	
	/*
	 * Function to replace special characters in a string
	 */
/*	 
	var parseStr=function(str='',replacers=dbReplacers){
		return replacers.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}

	/*
	 * Function to encode special characters in a string
	 */
	 
	var encodeStr=function(str,encoders=dbEncoders){
		return encoders.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}
	
	/*
	 * Function to standardise two strings and compare them.
	 */
	 
	var stdEqual=function(strA,strB){
		return ((strA.dbName() || '-') === (strB.dbName() || '-'));
	}

	/*
	 * Function to return the msVersion of the Character Sheet
	 * i.e. which versions of MagicMaster it is matched to
	 */

	var csVer = charCS => parseFloat(((attrLookup( charCS, fields.msVersion ) || '1.5').match(/^\d+\.\d+/) || ['1.5'])[0]) || 1.5;

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
		
		var gold = parseInt((attrLookup( toCS, fields.Money_gold ) || 0), 10),
			silver = parseInt((attrLookup( toCS, fields.Money_silver ) || 0), 10),
			copper = parseInt((attrLookup( toCS, fields.Money_copper ) || 0), 10);
			
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
	
	/*
	 * Determine the class or classes of the character, and 
	 * the level of each
	 *
	 */
	 
	var getCharLevels = function( charCS ) {
		return _.filter( fields, (elem,l) => {return l.toLowerCase().includes('_level')})
					.filter( elem => {return 0 < (attrLookup( charCS, elem ) || 0)});
	}
	
	var casterLevel = function( charCS, casterType ) {
		return caster( charCS, casterType ).clv;
	}
	
	/**
	 * Determine the type of caster and set the correct levels
	 **/
	 
	var setCaster = function( args, msg, senderId ) {
	 
		var isPower = args[0].toUpperCase().includes('POWER'),
			isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPR = args[0].toUpperCase().includes('PR'),
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter( tokenID ),
			level = args[2],
			pr_level, mu_level,
			castingName = args[3],
//			chargedItem = (!!args[4] && args[4].toLowerCase()=='charged'),
			itemName = args[5] || '';
			
		if (!charCS) {
			sendDebug('setCaster: invalid token_id');
			sendError('Incorrect MagicMaster syntax');
			return;
		}

		mu_level = parseInt(casterLevel( charCS, 'MU' ),10);
		pr_level = parseInt(casterLevel( charCS, 'PR' ),10);
		
		if (isMU && isPR) {
			isMU = !isNaN(mu_level) && mu_level > 0;
			isPR = !isNaN(pr_level) && pr_level > 0;
			if (isPR && !isMU) {
				args[0] = 'PR';
			} else if (isMU && !isPR) {
				args[0] = 'MU';
			}
		}
		
		if (!isPower && !isMI && !isMU && !isPR && (mu_level || pr_level)) {
			sendParsedMsg( tokenID, messages.notYetSpellCaster, senderId );
			return;
		} else if (!mu_level && !pr_level && !isMI && !isPower) {
			sendParsedMsg( tokenID, messages.notSpellCaster, senderId );
			return;
		} else if ((isMU && isPR) || (!isPower && !isMI && !isMU && !isPR)) {
			sendParsedMsg( tokenID, msg, senderId );
			return;
		}
		
		if (!level || level <= 0) {
			level = casterLevel( charCS, ((isPower || isMI) ? 'POWER' : (isMU ? 'MU' : 'PR')) );
			mu_level = mu_level || ((isPower || isMI) ? level : 0);
			pr_level = pr_level || ((isPower || isMI) ? level : 0);
		} else{
			mu_level = pr_level = level;
		}
		
		if (!level || level <= 0) {
			sendParsedMsg( tokenID, messages.notSpellCaster, senderId );
			return;
		}
		
		if (!castingName || castingName.length == 0) {
			castingName = curToken.get('name');
		}
		
		setAttr( charCS, fields.CastingLevel, level );
		setAttr( charCS, fields.MU_CastingLevel, mu_level );
		setAttr( charCS, fields.PR_CastingLevel, pr_level );
		setAttr( charCS, fields.Casting_name, castingName );
		if (itemName.length) {
			setAttr( charCS, fields.ItemChosen, itemName );
		}
		
		return args;
	};
	
	/*
	 * Set up the shape of the spell book.  This is complicated due to
	 * the 2E sheet L5 MU Spells start out-of-sequence at column 70
	 */
	 
	var shapeSpellbook = function( charCS, spellbook ) {

		var sheetTypes, charClass, level, maxLevel, miscSpells, noSpells,
			specSpells = 0,
			levelSpec = 0,
			levelSpells = [];
			
		var countSpells = function( levelSpells ) {
			levelSpells[1].spells = 0;
			let r = 0,
				spellName = '',
				hasDash = false,
				spellTables = [];
			do {
				let c = levelSpells[1].base;
				for (let w = 1; (w <= fields.SpellsCols); w++) {
					if (!spellTables[w]) {
						spellTables[w] = getTable( charCS, fieldGroups.SPELLS, c );
					}
					spellName = spellTables[w].tableLookup( fields.Spells_name, r, false );
					if (_.isUndefined(spellName)) {
						break;
					} else {
						hasDash = hasDash || spellName == '-';
						levelSpells[1].spells++;
						c++;
					}
				}
				r++;
			} while(!_.isUndefined(spellName));
			if (!hasDash) levelSpells[1].spells++;
			return levelSpells;
		};

			
		if (charCS) {
			var casterSpecs = caster( charCS, spellbook ),
				level = casterSpecs.lv,
				charClass = casterSpecs.ccl;
				
			switch (spellbook.toUpperCase()) {

			case 'MU':
				levelSpells = spellLevels.mu;
				if (!level || !charClass) {return levelSpells;}
				maxLevel = 1+parseInt(spellsPerLevel[charClass]['MU'][0][0]);
				specSpells = (state.MagicMaster.spellRules.specMU ? specMU.includes(casterSpecs.cl.dbName()) : !ordMU.includes(casterSpecs.cl.dbName())) ? 1 : 0;
				for (let i=1; i<Math.min(levelSpells.length,maxLevel); i++) {
					noSpells = parseInt(spellsPerLevel[charClass]['MU'][i][level]);
					miscSpells = (noSpells && !state.MagicMaster.spellRules.strictNum) ? parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1]]) || 0) : 0;
					levelSpec = (noSpells + miscSpells) ? specSpells : 0;
					setAttr(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_memable[0],fields.MUSpellNo_memable[1]],noSpells);
					setAttr(charCS,[fields.MUSpellNo_table[0] + i + fields.MUSpellNo_specialist[0],fields.MUSpellNo_specialist[1],'',true],levelSpec);
					levelSpells[i].spells = noSpells + miscSpells + levelSpec;
				}
				break;
				
			case 'PR':
				levelSpells = spellLevels.pr;
				if (!level || !charClass) {return levelSpells;}
				maxLevel = 1+parseInt(spellsPerLevel[charClass]['PR'][0][0]);
				for (let i=1; i<Math.min(levelSpells.length,maxLevel); i++) {
					noSpells = parseInt(spellsPerLevel[charClass]['PR'][i][level]);
					miscSpells = !state.MagicMaster.spellRules.strictNum ? parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1]]) || 0) : 0;
					specSpells = ((charClass == 'priest') && (noSpells + miscSpells)) ? parseInt(wisdomSpells[(Math.min(i,wisdomSpells.length)-1)][(attrLookup(charCS,fields.Wisdom) || 0)]) : 0;
					setAttr(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_memable[0],fields.PRSpellNo_memable[1]], noSpells);
					setAttr(charCS,[fields.PRSpellNo_table[0] + i + fields.PRSpellNo_wisdom[0],fields.PRSpellNo_wisdom[1],'',true], specSpells);
					levelSpells[i].spells = noSpells + specSpells + miscSpells;
				}
				break;
				
			case 'POWER':
				levelSpells = countSpells(spellLevels.pw);
				break;
				
			case 'MI':
				levelSpells = countSpells(spellLevels.mi);
				break;
				
			case 'MIPOWER':
				levelSpells = countSpells(spellLevels.pm);
				break;
				
			default:
				sendDebug('shapeSpellbook: invalid spellbook type '+spellbook+' specified');
				sendError('Internal MagicMaster error');
				break;
			}
		} 
		return levelSpells;
	}
	
	/*
	 * Check if the caster can actually cast the school/sphere of spell
	 * selected to use or memorise
	 */
	 
	var checkValidSpell = function( args ) {
		
		var isMU = args[0].includes('MU'),
			isPR = args[0].includes('PR'),
			tokenID = args[1],
			spell = args[5],
			charCS = getCharacter(tokenID),
			casterDef = caster(charCS, (isMU ? 'MU' : 'PR')),
			reAllowedSpells = {	sps:	reClassSpecs.majorsphere,
								spm:	reClassSpecs.minorsphere,
								spb:	reClassSpecs.bannedsphere,
			},
			allowAll = state.MagicMaster.spellRules.allowAll,

			spellSpec, spellData, school, sphere, level, banned, specialist, specStd,
			casterSpec, casterData, majorSpells, minorSpells, bannedSpells;
			
		if (!args[5] || !args[5].length) return 1;
		
		spellSpec = abilityLookup( (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB), spell, charCS );
		if (!spellSpec.obj) return 0;
		spellData = spellSpec.obj[1].body;
		school = spellSpec.specs();
		school = (!school || !school[0] || !school[0][4]) ? 'Invalid' : school[0][4];
		school = (school ||'any').dbName().split('|');
		spellData = (spellData.match(reSpellData) || ['',''])[1];
		spellData = parseData( spellData, reSpellSpecs );
		sphere = (spellData.sph || 'any').dbName().split('|');
		level = spellData.level || 1;
		casterSpec = abilityLookup( fields.ClassDB, casterDef.cl, charCS, true, false );
		if (!casterSpec.obj) {
			casterSpec = abilityLookup( fields.ClassDB, casterDef.ccl, charCS );
		}
		let test = (spellsPerLevel[casterDef.ccl] && spellsPerLevel[casterDef.ccl][(isMU ? 'MU' : 'PR')] && spellsPerLevel[casterDef.ccl][(isMU ? 'MU' : 'PR')][level] && spellsPerLevel[casterDef.ccl][(isMU ? 'MU' : 'PR')][level][casterDef.lv]);
		if (!casterSpec.obj || !test) return 0;

		casterData = casterSpec.obj[1].body;
		casterData = (casterData.match(reClassData) || ['',''])[1];
		casterData = parseData( casterData, reAllowedSpells );
		majorSpells = casterData.sps.dbName();
		minorSpells = casterData.spm.dbName();
		bannedSpells = casterData.spb.dbName();
		
		return _.reduce( (isMU ? school : sphere), (r,s) => {
			banned = !(s === 'any' || ((isMU || majorSpells.includes('any') || majorSpells.includes(s) || (minorSpells.includes(s) && spellData.level < 4)) && (isPR || !bannedSpells.includes(s))));
			specialist = isMU && majorSpells.includes(s);
			specStd = isMU && !majorSpells.includes('any');
			return ((!allowAll && (!r || banned)) ? 0 : (specialist ? 3 : (specStd ? 2 : r)));
		},1);
	}
	
	/*
	 * Check if the specified power is a class-defined power and, if so
	 * assess if the power can be used by a character of this level
	 */
	 
	var checkValidPower = function( args, senderId ) {
		
		var matchPower = (args[5] || '').dbName(),
			charCS = getCharacter( args[1] ),
			classObj = classObjects( charCS, senderId ),
			age = parseInt(attrLookup( charCS, fields.AgeVal ) || 9999),
			castAsLvl = -1;
			
		if (!matchPower || !matchPower.length || state.MagicMaster.spellRules.allowAnyPower) {log('checkValidPower: no check possible. !matchPower='+!matchPower+', matchPower.length='+matchPower.length+', !matchPower.length='+!matchPower.length+', allowAll='+state.MagicMaster.spellRules.allowAnyPower); return true;}
			
		let success = classObj.some( c => {
			let classData = resolveData( c.name, c.dB, reRaceData ).raw;
			return _.some(classData, p => {
				let powerData = parseData( String(p), reSpellSpecs );
				let powerName = powerData.name.toLowerCase();
				if (powerName.startsWith('mu-') || powerName.startsWith('pr-') || powerName.startsWith('pw-')) powerName = powerName.slice(3);
				let isClassPower = matchPower == powerName.dbName();
				let isValidPower = (parseInt(powerData.age) <= age && parseInt(powerData.level) <= parseInt(c.level));
				castAsLvl = !isClassPower ? castAsLvl : (isValidPower ? (powerData.castlvl || -1) : 0);
				return (isClassPower && isValidPower);
			});
		}) || (castAsLvl < 0);
		return success ? castAsLvl : 0;
	};
	
	/*
	 * Find the power use per day for Race & Class powers, or default 
	 * from the Powers database
	 */
	 
	var getUsesPerDay = function( charCS, power, senderId ) {
		
		var matchPower = (power || '').dbName(),
			classObj = classObjects( charCS, senderId ),
			foundPower, perDay;
			
		foundPower = classObj.some( c => {
			let classData = resolveData( c.name, c.dB, reRaceData ).raw;
			return _.some(classData, p => {
				let powerData = parseData( String(p), reSpellSpecs, false );
				let foundName = ((powerData.name || '').match(/(?:MU\-|PR\-|PW\-|MI\-)?(.*)$/i) || ['',''])[1];
				let isClassPower = matchPower == foundName.dbName();
				if (isClassPower) {
					let perLevel = (powerData.perDay || '').match(/(\d+)L(\d+?)/i);
					if (perLevel) {
						perDay =  perLevel[1] * Math.ceil(c.level / perLevel[2]);
					} else {
						perDay = powerData.perDay;
					}
				}
				return (isClassPower);
			});
		});
		if (!foundPower || _.isUndefined(perDay)) {
			let race = attrLookup( charCS, fields.Race );
			let raceDef = abilityLookup( fields.RaceDB, race, charCS );
			if (raceDef.obj) {
				let raceData = raceDef.data(reRaceData);
				foundPower = _.some(raceData, p => {
					let powerData = parseData( String(p), reSpellSpecs, false );
					let foundName = ((powerData.name || '').match(/(?:MU\-|PR\-|PW\-|MI\-)?(.*)$/i) || ['',''])[1];
					let isRacePower = matchPower == foundName.dbName();
					if (isRacePower) perDay = powerData.perDay;
					return (isRacePower);
				});
			};
		};
		if (!foundPower || _.isUndefined(perDay)) {
			let powerDef = findPower( charCS, power );
			if (powerDef.obj) {
				let powerData = powerDef.data(reSpellData);
				powerData = powerData ? parseData( String(powerData), reSpellSpecs, false ) : powerData;
				if (powerData) perDay = powerData.perDay;
			};
		};
		return (perDay || -1);
	};
			
	
	/*
	 * Return a string containing the in-game date in short or long form
	 */
	 
	var inGameDate = function( inGameDay ) {
		
		return ['Mon','Tue','Wed','Thur','Fri','Sat','Sun'][((inGameDay%7))]+', '
				+ (1+(inGameDay%28)) + ['st','nd','rd','th'][Math.min((((inGameDay%28)%20)),3)]+' '
				+ ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Math.floor(((inGameDay%336))/28)]+', '
				+ Math.floor(inGameDay/336);
	}		
	
	/*
	 * insert a spell into an identified spellbook slot
	 */
	 
	var setSpell = function( charCS, spellTables, altSpellTable, spellDB, spellName, r, c, lv, cost, msg, levelOrPerDay, castAsLvl='' ) {
		
		var isPower = spellDB.toUpperCase().includes('POWER'),
			isMU = spellDB.toUpperCase().includes('MU'),
			newSpellObj, altValues, altSpellRow;

		if (fields.GameVersion === 'AD&D1e') {
			altSpellRow = altSpellTable.tableFind( (isPower ? fields.AltPowers_name : fields.AltSpells_name), (spellTables.tableLookup( fields.Spells_name, r ) || '-') );
		} else {
			altSpellRow = (parseInt(r) * fields.SpellsCols) + parseInt(c);
		}
		if (!isPower) {
			newSpellObj = getAbility( spellDB, spellName, charCS, true );
		} else {
			newSpellObj = findPower( charCS, spellName );
			spellDB = newSpellObj.dB;
			spellName = newSpellObj.obj ? newSpellObj.obj[1].name : spellName;
			if (newSpellObj.obj) getAbility( spellDB, spellName, charCS, true );
		};
		
		if (!newSpellObj.obj) {
			sendError('Unable to find the spell or power '+spellName+' in any '+spellDB+' database');
			
			// If spell not found, just blank the row
			if (!isPower || fields.GameVersion === 'AD&D1e') altSpellTable.addTableRow( altSpellRow );
			return spellTables.addTableRow( r );
		}
		
		var	speed = newSpellObj.obj[1].ct,
			level = parseInt(newSpellObj.obj[1].type.match(/\d+/)) || 1,
			specs = newSpellObj.specs(),
			data = newSpellObj.data(),
			spellData = data ? parseData( data[0][0], reSpellSpecs ) : {},
			values = spellTables.copyValues(),
			csv = csVer(charCS),
			weapon = newSpellObj.obj[1].body.match(/}}\s*tohitdata\s*=\s*\[.+?\]/im),
			equip = (!weapon ? '' : (weapon[0].match(/[\[,\s]equip:(.+?)[,\]]/i) || ['',''])[1].toLowerCase());
			
		values[fields.Spells_name[0]][fields.Spells_name[1]] = spellName;
		values[fields.Spells_db[0]][fields.Spells_db[1]] = spellDB;
		values[fields.Spells_speed[0]][fields.Spells_speed[1]] = speed;
		values[fields.Spells_cost[0]][fields.Spells_cost[1]] = cost || newSpellObj.obj[1].cost;
		values[fields.Spells_msg[0]][fields.Spells_msg[1]] = msg;
		values[fields.Spells_macro[0]][fields.Spells_macro[1]] = csv < 2.1 ? msg : ('%{'+charCS.get('name')+'|'+(spellName.hyphened())+'}');
		values[fields.Spells_weapon[0]][fields.Spells_weapon[1]] = weapon ? '1' : '0';
		values[fields.Spells_equip[0]][fields.Spells_equip[1]] = (equip==='prime'?'0':(equip==='offhand'?'1':(equip==='both'?'2':equip)));
		values[fields.Spells_spellLevel[0]][fields.Spells_spellLevel[1]] = level;
		
		if (!isPower || fields.GameVersion === 'AD&D1e') altValues = altSpellTable.copyValues();
		if (isPower) {
			values[fields.Spells_castValue[0]][fields.Spells_castValue[1]] = (levelOrPerDay[0] || fields.Spells_castValue[2]);
			values[fields.Spells_castMax[0]][fields.Spells_castMax[1]] = levelOrPerDay[0];
			values[fields.Spells_storedLevel[0]][fields.Spells_storedLevel[1]] = castAsLvl || levelOrPerDay[1] || casterLevel( charCS, 'POWER' );
			if (fields.GameVersion === 'AD&D1e') {
				altValues[fields.AltPowers_name[0]][fields.AltPowers_name[1]] = spellName;
				altValues[fields.AltPowers_castValue[0]][fields.AltPowers_castValue[1]] = (levelOrPerDay[0] || fields.Spells_castValue[2]);
				altValues[fields.AltPowers_effect[0]][fields.AltPowers_effect[1]] = '%{'+charCS.get('name')+'|'+(spellName.hyphened())+'}';
				altValues[fields.AltPowers_castMax[0]][fields.AltPowers_castMax[1]] = 1;
				altSpellTable.addTableRow( altSpellRow, altValues );
			}
		} else {
			values[fields.Spells_miSpellSet[0]][fields.Spells_miSpellSet[1]] = (levelOrPerDay[1] || fields.Spells_miSpellSet[2]);
			values[fields.Spells_storedLevel[0]][fields.Spells_storedLevel[1]] = levelOrPerDay[0];
			values[fields.Spells_castValue[0]][fields.Spells_castValue[1]] = (levelOrPerDay[0]==0 ? 0 : 1);
			values[fields.Spells_castMax[0]][fields.Spells_castMax[1]] = 1;
			altValues[fields.AltSpells_name[0]][fields.AltSpells_name[1]] = spellName;
			altValues[fields.AltSpells_speed[0]][fields.AltSpells_speed[1]] = speed;
			altValues[fields.AltSpells_level[0]][fields.AltSpells_level[1]] = lv;
			altValues[fields.AltSpells_effect[0]][fields.AltSpells_effect[1]] = '%{'+charCS.get('name')+'|'+(spellName.hyphened())+'}';
			altValues[fields.AltSpells_remaining[0]][fields.AltSpells_remaining[1]] = (levelOrPerDay[0]==0 ? 0 : 1);;
			altValues[fields.AltSpells_memorized[0]][fields.AltSpells_memorized[1]] = 1;
			altValues[fields.AltSpells_range[0]][fields.AltSpells_range[1]] = spellData.range;
			altValues[fields.AltSpells_school[0]][fields.AltSpells_school[1]] = specs ? specs[0][4] : '';
			altValues[fields.AltSpells_aoe[0]][fields.AltSpells_aoe[1]] = spellData.aoe;
			altValues[fields.AltSpells_save[0]][fields.AltSpells_save[1]] = spellData.save;
			altValues[fields.AltSpells_comps[0]][fields.AltSpells_comps[1]] = spellData.comps;
			altValues[fields.AltSpells_duration[0]][fields.AltSpells_duration[1]] = spellData.duration; // (newSpellObj.obj[1].body.match(/}}.*?data\s*=\s*\[.*?dur:([^,\]]+?)[\,\]].*?{{/im) || ['',''])[1];
			altSpellTable.addTableRow( altSpellRow, altValues );
		}
		return spellTables.addTableRow( r, values );
	}

	/*
	 * add or remove spells/powers listed in the parameters to
	 * the specified spell level table in the specified character sheet
	 */

	var changeMIspells = function( charCS, MIname, listType, action, spellList, spellValues = '' ) {
		
		var	isAdd = action.toUpperCase() == 'ADD',
			c, valueItem, spellHyphen, altGroup,
			spellDB, levelSpells,
			spellName, spellQty,
			toDoList = spellList,
			spellTables = [],
			level = fields.MIspellLevel,
			levelSpells = shapeSpellbook( charCS, 'MI' ),
			rows = [],
			cols = [];
			
		if (!isAdd) {
			valueList = removeMIspells( charCS, MIname, listType, spellList, spellValues );
			if (!_.isUndefined(valueList)) return valueList;
		}

		spellList = spellList.split(',');
		toDoList = toDoList.toLowerCase().split(',');
		MIname = MIname.replace(/\s/g,'-');
		var indexPrefix = fields.MIspellPrefix[0]+MIname+'-'+(listType.toLowerCase()),
			valueList = spellValues ? spellValues.split(',') : [],
			altSpellTable;

		switch (listType.toUpperCase()) {
		case 'MU':
			spellDB = fields.MU_SpellsDB;
			altGroup = fieldGroups.ALTWIZ;
			break;
		case 'PR':
			spellDB = fields.PR_SpellsDB;
			altGroup = fieldGroups.ALTPRI;
			break;
		case 'POWER':
			spellDB = fields.PowersDB;
			level = fields.MIpowerLevel;
			indexPrefix = fields.MIpowerPrefix[0]+MIname+'-';
			levelSpells = shapeSpellbook( charCS, 'MIPOWER' );
			altGroup = fields.GameVersion === 'AD&D1e' ? fieldGroups.ALTPWR : undefined;
			break;
		}
		for (let lv=1; lv < levelSpells.length; lv++) {
			if (altGroup) altSpellTable = getLvlTable( charCS, altGroup, (level+lv-1) );
			let r = 0;
			do {
				let c = levelSpells[lv].base;
				let w = 1;
				do {
					if (!spellTables[w]) {
						spellTables[w] = getTable( charCS, fieldGroups.SPELLS, c ); 
					}
					spellName = spellTables[w].tableLookup( fields.Spells_name, r, false );
					if (isAdd && (_.isUndefined(spellName) || spellName === '-')) {
						spellName = spellList.shift() || '';
						spellHyphen = spellName.replace(/\s/g,'-');
						valueItem = valueList.shift().split('.');
						if (listType === 'POWER') {
							setAttr( charCS, [indexPrefix+spellHyphen, 'current'], r );
							setAttr( charCS, [indexPrefix+spellHyphen, 'max'], c );
						}
						rows.push(r);
						cols.push(c);
						spellTables[w] = setSpell( charCS, spellTables[w], altSpellTable, spellDB, spellName, r, w-1, lv, 0, spellName, valueItem );
					} else if (!_.isUndefined(spellName) && !isAdd && ((valueItem = toDoList.indexOf(spellName.toLowerCase())) >= 0)) {
						toDoList[valueItem] = '';
						spellList.splice(spellList.indexOf(spellName),1);
						spellQty = spellTables[w].tableLookup( fields.Spells_castValue, r );
						valueList[valueItem] = (spellQty <= 0 ? 0 : (spellTables[w].tableLookup(fields.Spells_storedLevel, r)))
											 + '.' + (spellTables[w].tableLookup( fields.Spells_miSpellSet, r ));
						spellTables[w].addTableRow(r);
					}
					c++;
					w++;
				} while ((w <= fields.SpellsCols) && !_.isUndefined(spellName) && (spellList && spellList.length));
				r++;
			} while (!_.isUndefined(spellName) && (spellList && spellList.length));
			setAttr( charCS, [fields.MISpellNo_table[0] + lv + fields.MISpellNo_memable[0],fields.MISpellNo_memable[1]], Math.max(spellTables.reduce((s,w) => s+w.sortKeys.length, 0),levelSpells[lv].spells) );
			if (!spellList || !spellList.length) break;
			spellTables = [];
		}
		setAttr( charCS, [indexPrefix,fields.MIspellRows[1]], rows.join(',') );
		setAttr( charCS, [indexPrefix,fields.MIspellCols[1]], cols.join(',') );
		if (isAdd) {
			if (spellList && spellList.length>0) {
				sendError(charCS.get('name')+'\'s Character Sheet storage not large enough to save all '+listType+' magic item spells');
			}
			return spellValues;
		} else {
			return valueList.join();
		}
	};
	
	/*
	 * Remove MI spells/powers specified in the list, using the
	 * row/column references saved on the character sheet
	 */
	 
	var removeMIpowers = function( charCS, MIname, powerList, powerValues ) {

		var powerName,
			attrObj,
			PowersTable = [],
			r, c, i=0;
			
		powerValues = powerValues.split(',');
		powerList = powerList.split(',');
		MIname = MIname.replace(/\s/g,'-');
		while (powerList.length > 0) {
			powerName = powerList.shift();
			powerName = powerName.replace(/\s/g,'-');
			attrObj = attrLookup( charCS, [fields.MIpowerPrefix[0]+MIname+'-'+powerName, null] );
			if (!attrObj) attrObj = attrLookup( charCS, [fields.MIpowerPrefix[0]+powerName, null] );
			if (attrObj) {
				r = attrObj.get('current');
				c = attrObj.get('max');
				if (!_.isUndefined(r) && !_.isUndefined(c)) {
					if (_.isUndefined(PowersTable[c])) {
						PowersTable[c] = getTable( charCS, fieldGroups.POWERS, c );
					}
					powerValues[i] = PowersTable[c].tableLookup( fields.Powers_castMax, r ) + '.' + PowersTable[c].tableLookup( fields.Powers_storedLevel, r );
					PowersTable[c].addTableRow( r );
				}
				attrObj.remove();
				i++;
			}
		}
		return powerValues.join();
	}
	
	/*
	 * Remove MI spells/powers specified in the list, using the
	 * row/column references saved on the character sheet
	 */
	 
	var removeMIspells = function( charCS, MIname, spellType, spellList, spellValues ) {

		var attrObj,
			SpellsTable = [],
			spellQty, r, c, altSpellRow, i=0,
			attrName = fields.MIspellPrefix[0]+(MIname.replace(/\s/g,'-'))+'-'+(spellType.toLowerCase()),
			spellRCobj = attrLookup( charCS, [attrName,null] ),
			base = shapeSpellbook( charCS, 'MI' )[1].base;
			
		if (!spellRCobj) return undefined;
		
		var	spellRows = spellRCobj.get(fields.MIspellRows[1]).split(','),
			spellCols = spellRCobj.get(fields.MIspellCols[1]).split(','),
			altSpellTable = getLvlTable( charCS, fieldGroups.ALTWIZ, fields.MIspellLevel );
			
		spellValues = spellValues.split(',');
		spellList = spellList.split(',');
		while (spellRows.length > 0 && spellCols.length > 0) {
			r = spellRows.shift();
			c = spellCols.shift();
			if (!_.isUndefined(r) && !_.isUndefined(c)) {
				altSpellRow = (parseInt(r) * fields.SpellsCols) + parseInt(c-base);
				if (_.isUndefined(SpellsTable[c])) {
					SpellsTable[c] = getTable( charCS, fieldGroups.SPELLS, c );
				}
				spellQty = SpellsTable[c].tableLookup( fields.Spells_castValue, r );
				spellValues[i] = (spellQty <= 0 ? 0 : (SpellsTable[c].tableLookup(fields.Spells_storedLevel, r)))
											 + '.' + (SpellsTable[c].tableLookup( fields.Spells_miSpellSet, r ));
				
				SpellsTable[c].addTableRow( r );
				altSpellTable.addTableRow( altSpellRow );
			};
			i++;
		}
		spellRCobj.remove();
		return spellValues.join();
	};
	
	/*
	 * handle removing and adding magic item spells and powers
	 * from their defining lists
	 * Usually used when picking up or putting away a magic item
	 */

	var moveMIspells = function( senderId, fromCS, toCS, itemName='', type='ALL', del=false ) {
		
		return new Promise(resolve => {
			
			try {
			
				var MIobj = getAbility( fields.MagicItemDB, itemName, toCS, true ),
					notFrom = !fromCS && !!toCS,
					update = (!!fromCS && !!toCS && (fromCS.id === toCS.id)),
					oldCS = fromCS,
					MIname = itemName.hyphened(),
					doMU = type === 'MU' || type === 'ALL',
					doPR = type === 'PR' || type === 'ALL',
					doPW = type === 'PW' || type === 'ALL',
					error = false;
					
				if (notFrom || update) {
					if (!MIobj.obj) {
						sendDebug('moveMIspells: can\'t find item '+MIname+' in any database');
						throw 'Invalid spell storing item specified';
					}
					addMIspells( toCS, MIobj.obj[1] );
					oldCS = toCS;
				}
				var MUspellObj = attrLookup( oldCS, [fields.ItemMUspellsList[0]+MIname, null] ),
					PRspellObj = attrLookup( oldCS, [fields.ItemPRspellsList[0]+MIname, null] ),
					powerObj = attrLookup( oldCS, [fields.ItemPowersList[0]+MIname, null] ),
					MUspellList = (!!MUspellObj ? (MUspellObj.get(fields.ItemMUspellsList[1]) || '') : ''),
					PRspellList = (!!PRspellObj ? (PRspellObj.get(fields.ItemPRspellsList[1]) || '') : ''),
					powerList = (!!powerObj ? (powerObj.get(fields.ItemPowersList[1]) || '') : ''),
					MUlistField = [fields.ItemMUspellValues[0]+MIname, fields.ItemMUspellValues[1]],
					PRlistField = [fields.ItemPRspellValues[0]+MIname, fields.ItemPRspellValues[1]],
					PWlistField = [fields.ItemPowerValues[0]+MIname, fields.ItemPowerValues[1]],
					MUspellValues = attrLookup( oldCS, MUlistField ),
					PRspellValues = attrLookup( oldCS, PRlistField ),
					powerValues = attrLookup( oldCS, PWlistField ),
					saveLists = (MUspellList && MUspellList.length) || (PRspellList && PRspellList.length) || (powerList && MUspellList.length),
					queries = (resolveData(itemName,fields.MagicItemDB,reItemData,(fromCS || toCS),{query:reClassSpecs.query}).parsed.query || '').split('$$'),
					miSpellValues;
					
				if (!notFrom && toCS && saveLists) {
					setAttr( toCS, [fields.ItemMUspellsList[0]+MIname, fields.ItemMUspellsList[1]], MUspellList );
					setAttr( toCS, [fields.ItemPRspellsList[0]+MIname, fields.ItemPRspellsList[1]], PRspellList );
					setAttr( toCS, [fields.ItemPowersList[0]+MIname, fields.ItemPowersList[1]], powerList );
				}
				
				if (doMU && MUspellList.length) {
					setAttr( oldCS, MUlistField, (miSpellValues = notFrom ? MUspellValues : changeMIspells( fromCS, itemName, 'MU', 'REMOVE', MUspellList, MUspellValues)));
					if (toCS) {
						setAttr( toCS, MUlistField, changeMIspells( toCS, itemName, 'MU', 'ADD', MUspellList, miSpellValues ));
					}
					if (del && !notFrom && !fromCS.get('name').startsWith('MI-DB')) MUspellObj.remove();
				}
				if (doPR && PRspellList.length) {
					setAttr( oldCS, PRlistField, (miSpellValues = notFrom ? PRspellValues : changeMIspells( fromCS, itemName, 'PR', 'REMOVE', PRspellList, PRspellValues )));
					if (toCS) {
						setAttr( toCS, PRlistField, changeMIspells( toCS, itemName, 'PR', 'ADD', PRspellList, miSpellValues ));
					}
					if (del && !notFrom && !fromCS.get('name').startsWith('MI-DB')) PRspellObj.remove();
				}
				if (doPW && powerList.length) {
					setAttr( oldCS, PWlistField, (miSpellValues = notFrom ? powerValues : removeMIpowers( fromCS, itemName, powerList, powerValues )));
					if (toCS) {
						setAttr( toCS, PWlistField, changeMIspells( toCS, itemName, 'POWER', 'ADD', powerList, miSpellValues ));
					}
					if (del && !notFrom && !fromCS.get('name').startsWith('MI-DB')) powerObj.remove();
				}
				if (queries && queries.length && itemName && !notFrom && !update) {
					let fromRow = getTableField( fromCS, {}, fields.Items_table, fields.Items_trueName ).tableFind( fields.Items_trueName, itemName ),
						toRow = toCS ? getTableField( toCS, {}, fields.Items_table, fields.Items_trueName ).tableFind( fields.Items_trueName, itemName ) : 0;
						
					if (!isNaN(fromRow)) {
						_.each( queries, q => {
							let varObj;
							let fromField = [fields.ItemVar[0]+MIname+'+'+fromRow+'-'+q.split('=')[0],fields.ItemVar[1]];		// Needs row reference
							let toField = [fields.ItemVar[0]+MIname+'+'+toRow+'-'+q.split('=')[0],fields.ItemVar[1]];			// ditto
							if (toCS && !isNaN(toRow)) setAttr( toCS, toField, (attrLookup( fromCS, fromField ) || '') );
							if (!_.isUndefined(varObj = attrLookup( fromCS, [fromField[0],null] ))) varObj.remove();
						});
					};
				};
					
			} catch (e) {
				log('MagicMaster moveMIspells: '+e.name+': '+e.message+' while processing item '+itemName);
				sendDebug('MagicMaster moveMIspells: '+e.name+': '+e.message+' while processing item '+itemName);
				sendCatchError('MagicMaster',msg_orig[senderId],e);
				error = true;

			} finally {
				setTimeout(() => {
					resolve(error);
				}, 5);
			}
		});
	};
		
	/**
	 * Find an item identified as a Power, but which might actually 
	 * be in a different database, as powers can be anything magical
	 **/
	 
	var findPower = function( charCS, power ) {
		
		if (!power || !power.length) return abilityLookup( fields.PowersDB, '', charCS, true, false );
	 
		const dbList = [['PW-',fields.PowersDB],['MU-',fields.MU_SpellsDB],['PR-',fields.PR_SpellsDB],['MI-',fields.MagicItemDB]];
		
		var	powerType = power.substring(0,3),
			powerLib;
			
		if (_.some(dbList,dB=>dB[0]===powerType.toUpperCase())) power = power.slice(powerType.length);
			
		if (!_.some(dbList, dB => {
			if (powerType.toUpperCase() === dB[0]) {
				powerLib = abilityLookup( dB[1], power, null, true );
				return true;
			} else {
				return false;
			}
		})) {
			_.some(dbList, dB => {
				powerLib = abilityLookup( dB[1], power, null, true );
				return !_.isUndefined(powerLib.obj);
			});
		};
		if (!powerLib.obj) {
			powerLib = abilityLookup( fields.PowersDB, power, charCS );
		}
		powerLib.name = power;
		return powerLib;
	}
	
	/*
	 * Check an item to see if it is a "bag" that can contain
	 * other items. If so, check to see if the "bag" character sheet 
	 * has been created yet, and if it needs to be filled with initial
	 * items.
	 */
	 
	var checkForBag = function( charCS, miName, row ) {
		
		var bag = resolveData( miName, fields.MagicItemDB, reItemData, charCS, {bag:reSpellSpecs.bag,store:reSpellSpecs.store}, row );
		if (!bag.parsed.bag) return;
		
/*		var miObj = abilityLookup( fields.MagicItemDB, miName, charCS );
		if (!miObj.obj) return;
		
		var bagData = miObj.obj[1].body.match(/}}.*?data\s*?=[^{]+?bag:(\d+).*?{{/im);
		if (!bagData) return;
*/
		var bagData = parseInt(bag.parsed.bag);
		var bagCS = findObjs({ type:"character", name:miName });
		var itemSpecs = {name:reSpellSpecs.name,
						 trueName:reSpellSpecs.trueName,
						 speed:reSpellSpecs.speed,
						 qty:reSpellSpecs.qty,
						 spell:reSpellSpecs.type,
						 type:reSpellSpecs.recharge,
						 trueType:reSpellSpecs.truerc,
						 reveal:reSpellSpecs.reveal,
						};
		
		if (!bagCS || !bagCS.length) {

			bagCS = createObj( "character",
							   {name:miName,
								avatar: design.bag_icon,
								inplayerjournals:charCS.get("inplayerjournals"),
								controlledby:charCS.get("controlledby")});
			setAttr( bagCS, fields.Race, 'Magic Item' );
			
			if (bagData > 0) {
				let Items = getTable( bagCS, fieldGroups.MI );
				setAttr( bagCS, fields.ItemContainerType, (bag.parsed.store !== 'nostore' ? '1' : '-1') ); 
				setAttr(charCS, fields.ItemOldContainerType, attrLookup(charCS, fields.ItemContainerType));
				setAttr( bagCS, fields.ItemContainerSize, Math.max( fields.MIRowsStandard, bagData )); 
//				bagData = miObj.data(/}}[^{]*?data\s*?=\s*?(\[[^{]+?bag\:[^{]+?\]){{/im);
				_.each( bag.raw, item => {
					let itemData = parseData( item[0], itemSpecs, false, charCS, miName );
					if ((itemData.spell || '').toUpperCase() != 'MI') return;
					let itemObj = abilityLookup( fields.MagicItemDB, (itemData.trueName || itemData.name), charCS );
					if (itemObj.obj) {
						itemData.speed = itemData.speed || itemObj.obj[1].ct;
						itemData.type = itemData.type || itemObj.obj[1].charge;
					}
					
					let values = Items.copyValues();
					values[fields.Items_name[0]][fields.Items_name[1]] = itemData.name;
					values[fields.Items_trueName[0]][fields.Items_trueName[1]] = (itemData.trueName || itemData.name);
					values[fields.Items_speed[0]][fields.Items_speed[1]] = itemData.speed || 5;
					values[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = itemData.speed || 5;
					values[fields.Items_qty[0]][fields.Items_qty[1]] = itemData.qty || 1;
					values[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = itemData.qty || 1;
					values[fields.Items_cost[0]][fields.Items_cost[1]] = 0;
					values[fields.Items_type[0]][fields.Items_type[1]] = itemData.type || 'uncharged';
					values[fields.Items_trueType[0]][fields.Items_trueType[1]] = itemData.trueType || itemData.type || 'uncharged';
					values[fields.Items_reveal[0]][fields.Items_reveal[1]] = itemData.reveal || '';
					
					Items.addTableRow( NaN, values );
				});
			} else {
				setAttr( bagCS, fields.ItemContainerType, '0' ); 
				setAttr(charCS, fields.ItemOldContainerType, '0');
				setAttr( bagCS, fields.ItemContainerSize, fields.MIRowsStandard );
			}
		} else {
			bagCS = bagCS[0];
			bagCS.set({inplayerjournals:charCS.get("inplayerjournals"), controlledby:charCS.get("controlledby")});
		}
		return;
	}
	
	/**
	 * Remove a magic item ability object from a character sheet if 
	 * it no longer exists in the equipment list
	 **/
 
	var removeMIability = function( charCS, itemName, Items ) {
	
		if (!Items.tableFind( fields.Items_name, itemName ) && !Items.tableFind( fields.Items_trueName, itemName )) {
			let MIobjs = filterObjs( obj => {
				if (obj.type !== 'ability' && obj.type !== 'attribute') return false;
				return (obj.name === itemName || obj.name.startsWith(fields.ItemVar[0]+itemName.hyphened()));
			});
			if (MIobjs) _.each(MIobjs,MIobj => MIobj.remove());
		}
	}
	
	/**
	 * Parse a data item query statement and return the parsed version.
	 **/
	 
	var parseQuery = function( query ) {
		query = (query || '').split('$$').map(q => {
			switch (q) {
				case 'weaponMagic': q = 'weaponMagic=How magical is this weapon?|+0%%0/|-4%%-4/Cursed|-3%%-3/Cursed|-2%%-2/Cursed|-1%%-1/Cursed|0%%0/|+1%%1/|+2%%2/|+3%%3/|+4%%4/'; break;
				case 'weaponPlus': q = 'weaponPlus=How magical is this weapon?|+0%%0/|+1%%1/|+2%%2/|+3%%3/|+4%%4/|+5%%5'; break;
				case 'weaponCurse': q = 'weaponCurse=How cursed is this weapon?|-0%%0/Cursed|-1%%-1/Cursed|-2%%-2/Cursed|-3%%-3/Cursed|-4%%-4/Cursed'; break;
				case 'swordType': q = 'swordType=What type of sword?|Bastard-Sword%%M/S/6/1d8/1d12/M/S/8/2d4/2d8/Long-Blade|Broadsword%%M/S/5/2d4/1+1d6/M/S/5/2d4/1+1d6/Long-Blade|Khopesh%%M/S/9/2d4/1d6/M/S/9/2d4/1d6/Medium-Blade|Longsword%%M/S/5/1d8/1d12/M/S/5/1d8/1d12/Long-Blade|Rapier%%M/P/4/1+1d6/1+1d8/M/P/4/1d8/1d8/Fencing-Blade|Sabre%%M/S/5/1d8/1d8/M/S/5/1d8/1d8/Fencing-Blade|Scimitar%%M/S/5/1d8/1d8/M/S/5/1d8/1d8/Long-Blade|Shortsword%%S/P/3/1d6/1d8/S/P/3/1d6/1d8/Short-Blade|Two-Handed-Sword%%L/S/10/0/0/L/S/10/1d10/3d6/Long-Blade]'; break;
				default: break;
			}
			return q;
		}).join('$$');
		let queries = (query || '').replace(/\)/g,'\\rpar;').replace(/\|(.+?)%%/g,'|$1,$1/').replace(/=/g,'=&#63;{').replace(/\$\$/g,'}|');
		if (queries.length) queries += '}';
		return queries;
	};
	
	/*
	 * Do the minimal parsing of a "pick:" or "put:" command and 
	 * then send it to chat on a timeout
	 */
	
	var pickPutCmd = function( cmd, tokenID, charCS, who ) {
	 
		setTimeout(() => sendAPI( cmd.replace(/&#44;/g,',')
									 .replace(/&#91;/g,'[')
									 .replace(/&#93;/g,']')
									 .replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
									 .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'),
		null, who), 2000);
	};

		
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/**
	 * Ask the player how many of a particular MI to pick up
	 * args[] is the standard action|charID|fromID|toID|fromRow|toRow
	 **/
	 
	var howMany = function( args, MIname, MItype, MIqty, senderId ) {
		
		var tokenID = args[1],
			fromID = args[2],
			toID = args[3],
			fromRow = args[4],
			toRow = args[5],
			charCS = getCharacter( tokenID ),
			content = '&{template:'+fields.messageTemplate+'}{{name=How Many Items?}}'
					+ '{{desc=How many '+MIname+' do you want to '+(tokenID == toID ? 'take' : 'put away')+'?}}'
					+ '{{desc1=[One](!magic --button POPqty|'+tokenID+'|'+fromID+'|'+toID+'|'+fromRow+'|'+toRow+'|1) or '
					+ '[All '+MIqty+'](!magic --button POPqty|'+tokenID+'|'+fromID+'|'+toID+'|'+fromRow+'|'+toRow+'|'+MIqty+') or '
					+ '[Specify](!magic --button POPqty|'+tokenID+'|'+fromID+'|'+toID+'|'+fromRow+'|'+toRow+'|&#63;{How many '+MIname+'? max '+MIqty+'}) }}';

		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
	}
	
	/*
	 * Create a list of Magic Items in an MI bag, able
	 * to be used to select one from.  A flag determines
	 * whether empty slots '-' are included
	 */

	var makeMIlist = function( charCS, senderId, includeEmpty=true, include0=true, showTypes=false, showMagic=true ) {

		return new Promise(resolve => {
			
			try {
			
				var mi, miText, qty, rows, maxSize, specs, carried,
					i = fields.Items_table[1],
					miList = '',
					slotsUsed = 0,
					Items = getTableField( charCS, {}, fields.Items_table, fields.Items_name );
					
				Items = getTableField( charCS, Items, fields.Items_table, fields.Items_qty );
				Items = getTableField( charCS, Items, fields.Items_table, fields.Items_carried );
				rows = i+((Items && Items.sortKeys) ? Items.sortKeys.length : 0);
				maxSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRows;
				
				while (i < rows) {
					if (i<0) {
						miText = mi = attrLookup( charCS, fields.Items_name );
						qty = attrLookup( charCS, fields.Items_qty ) || 0;
						carried = attrLookup( charCS, fields.Items_carried) || '';
					} else {
						miText = mi = Items.tableLookup( fields.Items_name, i );
						qty = Items.tableLookup( fields.Items_qty, i );
						carried = Items.tableLookup( fields.Items_carried, i );
					}
					if (_.isUndefined(mi)) break;
					if (!carried.length || carried == 'carried') {
						let miObj = abilityLookup( fields.MagicItemDB, mi, charCS, true );
						if (mi.length > 0 && (includeEmpty || mi != '-') && (showMagic || (miObj.obj && !miObj.obj[1].type.toLowerCase().includes('magic')))) {
							if (include0 || qty > 0) {
								if (showTypes && miObj.obj) {
									miText = getShownType( miObj, i );
								}
								if (mi != '-') slotsUsed++;
								miList += '|' + qty + ' ' + miText + ',' + i;
							}
						}
					}
					i++;
				}
				if (i < maxSize && i < fields.MIRows && includeEmpty) {
					miList += '|0 -,'+i;
				}
				if (i == fields.Items_table[1]) {
					miList += '|0 -,'+i;
				}
				slotCounts[charCS.id] = slotsUsed;

			} catch (e) {
				log('MagicMaster makeMIlist: JavaScript '+e.name+': '+e.message+' while listing MI '+miText);
				sendDebug('MagicMaster makeMIlist: JavaScript '+e.name+': '+e.message+' while listing MI '+miText);
				sendCatchError('MagicMaster',msg_orig[senderId],e);
				miList = '';

			} finally {
				setTimeout(() => {
					resolve(miList);
				}, 5);
			}
		});
	}
	
	/*
	 * Create buttons to select Magic Item slots from. Highlight
	 * any button with the index of MIrowref.  A flag determines
	 * whether empty slots '-' are included.
	 */

	var makeMIbuttons = function( tokenID, senderId, miField, qtyField, cmd, extension='', MIrowref=-1, disable0=true, includeEmpty=false, showTypes=false, showMagic=true, pickID ) {
		
		return new Promise(resolve => {
			
			try {
			
				var charCS = getCharacter(tokenID),
					isView = extension == 'viewMI',
					i = fields.Items_table[1],
					isGM = playerIsGM(senderId),
					slotsUsed = 0,
					renamed, miObj,
					qty, maxQty, mi, miText, type, makeGrey, Items, rows, maxSize,
					content = '';
				
				if (!_.isUndefined(pickID)) {
					charCS = getCharacter(pickID);
					if (!charCS) {
						charCS = getCharacter(tokenID);
					}
				}
				if (isView) extension = '';
				
				Items = getTable( charCS, fieldGroups.MI );

				rows = i+((Items && Items.sortKeys) ? Items.sortKeys.length : 0);
				maxSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRowsStandard;
				
				while (i < rows) {
					miText = mi = Items.tableLookup( fields.Items_name, i, false, ['',miField] );
					if (_.isUndefined(mi)) {break;}
					let trueMI = Items.tableLookup( fields.Items_trueName, i );
					let carried = Items.tableLookup( fields.Items_carried, i ) || '';
					if (carried.length && carried != 'carried') {i++; continue;}
					qty = Items.tableLookup( fields.Items_qty, i, true, ['',qtyField] );
					maxQty = Items.tableLookup( fields.Items_trueQty, i );
					type = Items.tableLookup( fields.Items_type, i ).toLowerCase();
					makeGrey = (!type.includes('selfchargeable') && !type.includes('absorbing') && disable0 && qty == 0);
					if (mi.length > 0 && (includeEmpty || mi != '-')) {
						miObj = abilityLookup( fields.MagicItemDB, mi, charCS, true );
						renamed = !miObj.dB.toLowerCase().includes('-db');
						makeGrey = makeGrey || (!showMagic && (!miObj.obj || miObj.obj[1].type.toLowerCase().includes('magic')));
						if (showTypes && miObj.obj) {
							miText = getShownType( miObj, i, resolveData( trueMI, fields.MagicItemDB, reItemData, charCS, {itemType:reSpellSpecs.itemType}, i ).parsed.itemType );
							if (!['charged','uncharged','splitable','cursed','change-last','change-each','changing','cursed+change-last','discharging','cursed+discharging'].includes(type)) {
								qty = Math.min(qty,1);
							}
						}
						content += (i == MIrowref || makeGrey) ? ('<span style=' + (i == MIrowref ? design.selected_button : design.grey_button) + '>') : '['; 
						content += (mi !== '-' ? (qty + ((qty != maxQty && isGM) ? '/'+maxQty : '') + ' ' + miText.replace(/\-/g,' ')) : '-');
						if (mi != '-') slotsUsed++;
						if (isView && mi.replace(reIgnore,'').length) {
							if (Items.tableLookup( fields.Items_reveal, i ) == 'view') mi = trueMI;
							let hide = !miObj.obj ? '' : resolveData( mi, fields.MagicItemDB, reItemData, charCS, {hide:reSpellSpecs.hide}, i ).parsed.hide,
								reveal = (mi !== trueMI) && !!miObj.obj && hide && hide.length && hide !== 'hide';
							miObj = getAbility( fields.MagicItemDB, mi, charCS, false, isGM, (reveal ? mi : trueMI), i );
							if (!state.MagicMaster.viewActions && !renamed && miObj.obj) miObj.obj[0].set('action',miObj.obj[0].get('action').replace(reActionButton,design.grey_action) );
							extension = '&#13;'+sendToWho(charCS,senderId,false,true)+(miObj.api ? '&#13;' : '')+'&#37;{'+miObj.dB+'|'+mi.hyphened()+'}';
						}
						content += (i == MIrowref || makeGrey) ? '</span>' : '](!magic --button '+ cmd +'|'+ tokenID +'|'+ i + extension +')';
					};
					i++;
				};
				if (i < maxSize && i < fields.MIRows && includeEmpty) {
					content += i == MIrowref ? ('<span style=' + design.selected_button +'>' ) : '['; 
					content += '-';
					content += i == MIrowref  ? '</span>' : '](!magic --button '+ BT.ADD_MIROW +'|'+ cmd +'|'+ tokenID +'|'+ i + extension +')';
				}
				slotCounts[charCS.id] = slotsUsed;

			} catch (e) {
				sendCatchError('MagicMaster',msg_orig[senderId],e);
				content = '';

			} finally {
				setTimeout(() => {
					resolve(content);
				}, 5);
			}
		});
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
			content = tokenName + ' can memorise ';
			
		if (spellType == 'MI') {
			content += 'these spells in magic items';
		} else {
			content += '[[[['+totalSpells+']]';
			if (spellType == 'MU') {
				spellsAtLevel = parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_memable[0],fields.MUSpellNo_memable[1]])||0);
				spellsSpecialist = parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_specialist[0],fields.MUSpellNo_specialist[1]])||0);
				spellsMisc = !state.MagicMaster.spellRules.strictNum ? parseInt(attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1]])||0) : 0;
				content += '['+spellsAtLevel+' at level '+level+',+'+spellsSpecialist+' specialist, +'+spellsMisc+' misc]';
			} else {
				spellsAtLevel = parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_memable[0],fields.PRSpellNo_memable[1]])||0);
				spellsWisdom = parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_wisdom[0],fields.PRSpellNo_wisdom[1]])||0);
				wisdom = parseInt(attrLookup(charCS,fields.Wisdom)||0);
				spellsMisc = !state.MagicMaster.spellRules.strictNum ? parseInt(attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1]])||0) : 0;
				content += '['+spellsAtLevel+' at level '+level+', + '+spellsWisdom+' for wisdom '+wisdom+', + '+spellsMisc+' misc]';
			}
			content += ']] spells at level '+level;
		}
		return content;
	}
	
	/*
	 * Create a menu line for the number of spells the caster
	 * can have memorised at a particular spell level, where the 
	 * number can be edited..
	 */
	 
	var makeEditNumberOfSpells = function( args, spellType, totalSpells ) {
		
		var mngSpellsCmd = args[0],
			tokenID = args[1],
			level = args[2],
			curToken = getObj('graphic',tokenID),
			content = curToken.get('name') + ' can memorise ';
			
		if (spellType == 'MI') {
			content += 'these spells in this magic item';
		} else if (!state.MagicMaster.spellRules.strictNum) {
			content += '['+totalSpells+'](!magic --button '+BT.EDIT_NOSPELLS+'|'+tokenID+'|'+spellType+'|'+level+'|'+mngSpellsCmd+') spells at level '+level;
		} else {
			content = makeNumberOfSpells( curToken, spellType, level, totalSpells );
		}
		return content;
	}
	
	/*
	 * Create a menu to edit the number of misc spells for 
	 * a particular spell class and level
	 */
	 
	var makeMiscSpellsEdit = function( args, senderId ) {
		
		var tokenID = args[1],
			spellClass = args[2],
			level = args[3],
			mngSpellsCmd = args[4],
			charCS = getCharacter(tokenID),
			spellsAtLevel, spellsSpecialist, spellsMisc, spellsTotal, spellsWisdom, wisdom,
			content = '&{template:'+fields.messageTemplate+'}{{name=Edit Level '+level+' Misc Spells}}'
					+ '{{desc=Here\'s how '+getObj('graphic',tokenID).get('name')+' total '+spellClass+' spells are determined.  '
					+ 'You can adjust the Miscellaneous number by clicking on it and specifying a different value}}{{desc1=';

		if (spellClass == 'MU') {
			spellsAtLevel = (attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_memable[0],fields.MUSpellNo_memable[1]])||0);
			spellsSpecialist = (attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_specialist[0],fields.MUSpellNo_specialist[1]])||0);
			spellsMisc = (attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1]])||0);
			spellsTotal = (attrLookup(charCS,[fields.MUSpellNo_table[0] + level + fields.MUSpellNo_total[0],fields.MUSpellNo_total[1]])||0);
			content += spellsAtLevel+' MU spells at level '+level+', + '+spellsSpecialist+' specialist';
		} else {
			spellsAtLevel = (attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_memable[0],fields.PRSpellNo_memable[1]])||0);
			spellsWisdom = (attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_wisdom[0],fields.PRSpellNo_wisdom[1]])||0);
			wisdom = (attrLookup(charCS,fields.Wisdom)||0);
			spellsMisc = (attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1]])||0);
			spellsTotal = (attrLookup(charCS,[fields.PRSpellNo_table[0] + level + fields.PRSpellNo_total[0],fields.PRSpellNo_total[1]])||0);
			content += spellsAtLevel+' PR spells at level '+level+', + '+spellsWisdom+' for wisdom '+wisdom;
		}
		content += ', + ['+spellsMisc+' misc](!magic --button '+BT.MISC_SPELL+'|'+tokenID+'|'+spellClass+'|'+level+'|?{How many miscellaneous spells?|'+spellsMisc+'}|'+mngSpellsCmd+')'
				+  ' = '+spellsTotal+' total}}{{desc2=[Return to spells menu](!magic --button '+(spellClass=='PR' ? BT.EDIT_PRSPELLS : BT.EDIT_MUSPELLS)+'|'+tokenID+'|'+level+'|-1|-1||1)}}';

		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	}
	
	/*
	 * Make a list of spells in the specified memorised/stored list
	 */
	var makeSpellList = function( senderId, tokenID, command, selectedButton, noDash = false, submitted = false, extension = '', maxLevel = 13 ) {
		
		var isMU = command.toUpperCase().includes('MU'),
			isPR = command.toUpperCase().includes('PR'),
			isMI = command.toUpperCase().includes('MI'),
			isPower = command.toUpperCase().includes('POWER'),
			isView = command.toUpperCase().includes('VIEW'),
			isGM = playerIsGM(senderId),
			content = '',
			viewCmd = '',
			buttonID = 0,
			buttonList = [],
			spell, spellType, spellName,
			magicDB, levelSpells,
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			miStore = command.includes('MI_SLOT'),
			miName = attrLookup( charCS, fields.ItemChosen ) || '-',
			miRow = attrLookup( charCS, fields.ItemRowRef ) || '',
			oldVer = 2.1 > csVer(charCS),
			toWho = sendToWho(charCS,senderId,false,true),
			spellTables = [],
			spellLevels = 0,
			learn = false,
			rows = [], cols = [];
			
		miName = miName.replace(/\s/g,'-');
			
		if (isPower && isMI) {
			spellType = 'MIPOWER';
			buttonList = 'EmptyList,' + attrLookup( charCS, [fields.ItemPowersList[0]+miName, fields.ItemPowersList[1]] ) || '';
			buttonList = buttonList.dbName().split(',');
		} else if (isPower) {
			spellType = 'POWER';
		} else if (isMI) {
			spellType = 'MI';
			buttonList = 'EmptyList,' + attrLookup( charCS, [fields.ItemMUspellsList[0]+miName, fields.ItemMUspellsList[1]] ) || '';
			buttonList += ',' + attrLookup( charCS, [fields.ItemPRspellsList[0]+miName, fields.ItemPRspellsList[1]]) || '';
			buttonList = buttonList.dbName().split(',');
			let miObj = abilityLookup( fields.MagicItemDB, miName, charCS );
			if (miObj.obj) {
				learn = resolveData( miName, fields.MagicItemDB, reItemData, charCS, {learn:reSpellSpecs.learn}, miRow ).parsed.learn == 1;
			};
			// see if can build an item-specific spell list...
			
			rows.push((attrLookup( charCS, [fields.MIspellRows[0]+miName+'-mu',fields.MIspellRows[1]] ) || ''),(attrLookup( charCS, [fields.MIspellRows[0]+miName+'-pr',fields.MIspellRows[1]] ) || ''));
			rows = rows.join().split(',').filter(r=>!!r);
			cols.push((attrLookup( charCS, [fields.MIspellCols[0]+miName+'-mu',fields.MIspellCols[1]] ) || ''),(attrLookup( charCS, [fields.MIspellCols[0]+miName+'-pr',fields.MIspellCols[1]] ) || ''));
			cols = cols.join().split(',').filter(c=>!!c);
			if (rows.length && cols.length) {
				_.each( cols, (c,k) => {
					let r = rows[k];
					if (_.isUndefined(spellTables[c])) spellTables[c] = getTable( charCS, fieldGroups.SPELLS, c );
					let spellMsg = spellTables[c].tableLookup( (oldVer ? fields.Spells_macro : fields.Spells_msg), r );
					if (miStore) spellName = spellMsg; else spellName = spellTables[c].tableLookup( fields.Spells_name, r );
					let	spellDB = spellTables[c].tableLookup( fields.Spells_db, r ) || fields.MU_SpellsDB,
						spellValue = parseInt((spellTables[c].tableLookup( fields.Spells_castValue, r )),10),
						disabled = (miStore ? (spellValue != 0) : (spellValue == 0));
					if (!disabled) spellLevels = spellLevels + (parseInt(spellTables[c].tableLookup( fields.Spells_spellLevel, r )) || 1);
					if (!noDash || spellName != '-') {
						content += (buttonID == selectedButton ? '<span style=' + design.selected_button + '>' : ((submitted || disabled) ? '<span style=' + design.grey_button + '>' : '['));
						content += ((spellType.includes('POWER') && spellValue) ? (spellValue + ' ') : '') + (spellName || '-');
						content += (((buttonID == selectedButton) || submitted || disabled) ? '</span>' : '](!magic --button '+ command +'|'+ tokenID +'|'+ buttonID +'|'+ r +'|'+ c + extension + ' --display-ability '+tokenID+'|'+spellDB+'|'+spellName+')');
					}
					buttonID++;
				});
				return [content,spellLevels];
			};
		} else if (!isMU) {
			spellType = 'PR';
			magicDB = fields.PR_SpellsDB;
		} else {
			spellType = 'MU';
			magicDB = fields.MU_SpellsDB;
		}
		
		// build the Spell list
		levelSpells = shapeSpellbook( charCS, spellType );
		
		for (let lv = 1; lv < levelSpells.length; lv++) {
			let r = 0;
			if (levelSpells[lv].spells > 0) {
				if (lv != 1 )
					{content += '\n';}
				if (!isPower)
					{content += makeNumberOfSpells(curToken,spellType,lv,levelSpells[lv].spells)+'\n';}
			}
			while (levelSpells[lv].spells > 0) {
				let c = levelSpells[lv].base,
					buttonIndex;
				for (let w = 1; (w <= fields.SpellsCols) && (levelSpells[lv].spells > 0); w++) {
					if (_.isUndefined(spellTables[w])) {
						spellTables[w] = getTable( charCS, fieldGroups.SPELLS, c ); 
					}
					let spellMsg = spellTables[w].tableLookup( (oldVer ? fields.Spells_macro : fields.Spells_msg), r );
					if (miStore) spellName = spellMsg.hyphened();
					else spellName = spellTables[w].tableLookup( fields.Spells_name, r ).hyphened();
					if (_.isUndefined(spellName)) {
						levelSpells[lv].spells = 0;
						break;
					}
					if (spellName.trim().length && (!buttonList.length || (buttonIndex = buttonList.indexOf(spellMsg.dbName())) != -1)) {
						if (buttonList.length) buttonList.splice(buttonIndex,1);
						spellLevels = spellLevels + (parseInt(spellTables[w].tableLookup( fields.Spells_spellLevel, r )) || 1);
						let	spellValue = parseInt((spellTables[w].tableLookup( fields.Spells_castValue, r )),10),
							disabled = (miStore ? (spellValue != 0) : (spellValue == 0));
						if (!noDash || spellName != '-') {
							if (isView && spellName.replace(reIgnore,'').length) {
								magicDB = spellTables[w].tableLookup( fields.Spells_db,r );
								if (!magicDB || magicDB == spellName) {
									magicDB = findPower(charCS,spellName).dB;
									spellTables[w] = spellTables[w].tableSet( fields.Spells_db,r,magicDB );
								}
								spell = getAbility( magicDB, spellName, charCS );
								if (!state.MagicMaster.viewActions) spell.obj[0].set('action',spell.obj[0].get('action').replace(reActionButton,design.grey_action) );
								extension = `${!learn ? '' : ` --message ${tokenID}|Learn Spell|Try to &#91;Learn this spell&#93;&#40;!magic ~~learn-spell ${tokenID}¦${spellName}&#41;`}&#13;${(spell.api ? '' : toWho)}&#37;{${spell.dB}|${spellName}}`;
							}
							content += (buttonID == selectedButton ? '<span style=' + design.selected_button + '>' : ((submitted || disabled || (lv > maxLevel)) ? '<span style=' + design.grey_button + '>' : '['));
							content += ((spellType.includes('POWER') && spellValue) ? (spellValue + ' ') : '') + spellName.dispName();
							content += (((buttonID == selectedButton) || submitted || disabled || (lv > maxLevel)) ? '</span>' : '](!magic --button '+ command +'|'+ tokenID +'|'+ buttonID +'|'+ r +'|'+ c + extension +')');
						}
					}
					buttonID++;
					c++;
					levelSpells[lv].spells--;
				}
				r++;
			}
			spellTables = [];
		}
		return [content,spellLevels];
	}
	
	/*
	 * Create a menu for a player to manage their spell list.
	 */

	var makeManageSpellsMenu = function( args, senderId, msg ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPR = args[0].toUpperCase().includes('PR'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			level = parseInt((args[2]),10),
			spellRow = args[3],
			spellCol = args[4],
			spellToMemorise = args[5] || '',
			singleLevel = (args[7] || '').dbName() === 'single',
			spellToDisplay = spellToMemorise,
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			levelSpells;
			
		if (!curToken || !charCS) {
			sendDebug('makeManageSpellsMenu: invalid tokenID passed');
			sendError('Internal MagicMaster parameter error');
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
			spellTables = [],
			magicDB, magicType, tableType,
			editCmd, reviewCmd, memCmd,
			levelLimit, nextLevel,
			col, rep,
			l, r, c, w;
		
		if (isPower) {
			level = 1;
			levelLimit = 1;
			magicType = isMI ? 'MIPOWER' : 'POWER';
			tableType = magicWord = 'power';
			editCmd = isMI ? BT.EDIT_MIPOWERS : BT.EDIT_POWERS;
			reviewCmd = isMI ? BT.REVIEW_MIPOWER : BT.REVIEW_POWER;
			memCmd = isMI ? BT.MEM_MIPOWER : BT.MEM_POWER;
			spell = findPower( charCS, spellToMemorise );
			spellToDisplay = spell.name;
			magicDB = spell.dB;
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
		
		spellbook = attrLookup( charCS, [fields.Spellbook[0]+((fields.SpellsFirstColNum || levelSpells[level].book != 1) ? levelSpells[level].book : ''), fields.Spellbook[1]] ) || '';
		content = '&{template:'+fields.menuTemplate+'}{{name=Select Slot to Use in '+tokenName+'\'s '+tableType+'s}}'
				+ ((isPower) ? ('{{subtitle=All Powers     -1 means "At Will"}}') : ('{{subtitle=Level '+level+' spells}}'));
				
		if (msg && msg.length > 0) {
			content += '{{='+msg+'}}';
		}
		
		content += '{{desc=1. [Choose](!magic --button '+editCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|?{'+magicWord+' to memorise|'+spellbook+'}) '+magicWord+' to memorise<br>';
		
		if (selectedSpell) {
			spell = getAbility( magicDB, spellToDisplay, charCS );
			if (!state.MagicMaster.viewActions) spell.obj[0].set('action',spell.obj[0].get('action').replace(reActionButton,design.grey_action) );
			content += '...Optionally [Review '+spellToDisplay+'](!magic --button '+reviewCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|'+spellToMemorise 
					+  '&#13;'+(spell.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+spell.dB+'|'+spellToDisplay.hyphened()+'})}}';
		} else {
			content += '...Optionally <span style='+design.grey_button+'>Review the '+magicWord+'</span>}}';
		}
		content	+= '{{desc1=2. Choose slot to use\n'
				+  (isPower ? '' : (makeEditNumberOfSpells(args,magicType,levelSpells[level].spells)))+'\n';
		
		// build the Spell list
		
		r = 0;
		while (levelSpells[level].spells > 0) {
			c = levelSpells[level].base;
			for (w = 1; (w <= fields.SpellsCols) && (levelSpells[level].spells > 0); w++) {
				if (!spellTables[w]) {
					spellTables[w] = getTable( charCS, fieldGroups.SPELLS, c );
				}
				selected = (r == spellRow && c == spellCol);
				spellName = spellTables[w].tableLookup( fields.Spells_name, r, false );
				if (_.isUndefined(spellName)) {
					spellTables[w].addTableRow( r );
					spellName = '-';
				}
				spellValue = parseInt((spellTables[w].tableLookup( fields.Spells_castValue, r )),10);
				content += (selected ? ('<span style=' + design.selected_button + '>') : ('['+(spellValue == 0 ? ('<span style=' + design.dark_button + '>') : '')));
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
			spellTables = [];
		}
		
		if (level < levelLimit) {
			nextLevel = (levelSpells[(level+1)].spells>0) ? (level+1) : 1;
		} else {
			nextLevel = 1;
		}

		if (selectedSlot) {
			slotSpell = attrLookup( charCS, fields.Spells_name, fields.Spells_table, spellRow, spellCol ) || '';
		}
		content += '}}{{desc2=...Then\n'
				+  '3. '+(selectedBoth ? '[' : '<span style='+design.grey_button+'>')
				+		'Memorise '+(selectedSpell ? spellToDisplay : ' the '+magicWord )
				+		 (!selectedBoth ? '</span>' : ('](!magic --button '+memCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|'+spellToMemorise+'|'+noToMemorise+')'))+'\n'
				+  (isPower ? (!isMI ? 'or [Memorise all valid Powers](!magic --button '+BT.MEMALL_POWERS+'|'+tokenID+'|1|-1|-1||)\n' : '') : (singleLevel ? '' : '4. When ready [Go to Level '+nextLevel+'](!magic --button '+editCmd+'|'+tokenID+'|'+nextLevel+'|-1|-1|)\n'))
				+  'Or just do something else anytime\n\n'

				+  'Or ' + (selectedSlot ? '[' : ('<span style='+design.grey_button+'>'))
				+  'Remove '+slotSpell
				+  (!selectedSlot ? '</span> the' : ('](!magic --button '+memCmd+'|'+tokenID+'|'+level+'|'+spellRow+'|'+spellCol+'|-|0)') )+' '+magicWord+'}}';

		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	}

	/*
	 * Make a menu to store spells in a Magic Item from the caster's
	 * own memorised spells.
	 */
	 
	var makeStoreMIspell = function(args,senderId,msg = '') {
		
		var command = (args[0] || '').toUpperCase(),
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makeStoreMIspell: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var isMU = command.includes('MU'),
			isMI = command.includes('MI'),
			isAdd = command.includes('ADD'),
			isChange = command.includes('CHANGE'),
			spellButton = args[(isMI ? 5 : 2)],
			spellRow = args[(isMI ? 6 : 3)],
			spellCol = args[(isMI ? 7 : 4)],
			MIbutton = args[(isMI ? 2 : 5)],
			MIrow = args[(isMI ? 3 : 6)],
			MIcol = args[(isMI ? 4 : 7)],
			isAny = command.includes('ANY') || (isAdd && MIbutton < 0),
			item = attrLookup( charCS, fields.ItemChosen ) || '-',
			row = attrLookup( charCS, fields.ItemRowRef ) || '',
			itemObj = abilityLookup( fields.MagicItemDB, item, charCS ),
			wisLevel = casterLevel( charCS, (isMU ? 'MU' : 'PR') ),
			extra = isAdd ? '_ADD' : (isAny ? '_ANY' : ''),
			spellName = 'spell', 
			MIspellName = '',
			oldVer = 2.1 > csVer(charCS),
			levelLimit = false,
			col,
			tokenName = curToken.get('name');
			
		if (!itemObj.obj) {
			sendError('Item '+item+' not found. Unable to store spells in this item.');
			return;
		} else {
			let itemData = parseData((itemObj.data()[0][0] || {}),reSpellSpecs,true,charCS,item,row);
			let storeSpells = (itemData.store || 'store').toLowerCase();
			isAdd = isAdd || storeSpells === 'add';
			isChange = isChange || storeSpells === 'change';
			isAny = isAny || (storeSpells === 'any' || (isAdd && MIbutton < 0));
			levelLimit = itemData.lvlimit == 1;
		};
			
		var	memSpells, storedSpells, storedLevels, itemQty = 99;
			
		[storedSpells,storedLevels] = makeSpellList( senderId, tokenID, (isMU ? BT.MU_MI_SLOT : BT.PR_MI_SLOT)+extra, MIbutton, !isAny, false, ('|'+spellButton+'|'+spellRow+'|'+spellCol) );
		if (levelLimit) {
			let Items = getTable( charCS, fieldGroups.MI ),
				itemRow = Items.tableFind( fields.Items_name, item );
			if (itemRow) itemQty = parseInt(Items.tableLookup( fields.Items_trueQty, itemRow )) || 99;
		}
		[memSpells] = makeSpellList( senderId, tokenID, (isMU ? BT.MU_TO_STORE : BT.PR_TO_STORE)+extra, spellButton, true, false, ('|'+MIbutton+'|'+MIrow+'|'+MIcol), (itemQty - storedLevels) );

		var	content = '&{template:'+fields.menuTemplate+'}{{name=Store Spell in '+tokenName+'\'s Magic Items}}'
					+ '{{subtitle=Storing ' + (isMU ? 'MU' : 'PR') + ' spells}}'
					+ '{{desc=**1.Choose a spell to store**\n'+memSpells+'}}'
					+ '{{desc1=**2.'+(isAny ? 'Optionally c' : 'C')+'hoose where to store it**\n'+(storedSpells || 'No spells currently stored')+'}}';

		if (spellButton >= 0) {
			spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, spellRow, spellCol ) || '-';
		}
		if (MIbutton >= 0) {
			MIspellName = attrLookup( charCS, (oldVer ? fields.Spells_macro : fields.Spells_msg), fields.Spells_table, MIrow, MIcol ) || '-';
			if ((isAdd || isAny) && MIspellName === '-') MIbutton = -1;
		}
		var canStore = isAny || isChange || (isAdd && MIspellName === '-') || (spellName.dbName() == MIspellName.dbName());
		
		content += '{{desc2=3.Once both spell and '+(isAny ? 'optionally ' : '')+'slot selected\n'
				+  ((canStore && (spellButton >= 0) && (isAdd || isAny || MIbutton >= 0)) ? '[' : '<span style='+design.grey_button+'>')
				+  ((isAdd || isAny) && MIbutton < 0 ? 'Add ' : 'Store ')+spellName
				+  ((canStore && (spellButton >= 0)) ? (((isAdd || isAny) && MIbutton<0) ? ('](!magic --button ADD_TO_SPELLS|'+tokenID+'|'+item+'|'+command+'|1|STORE-MI-SPELL|'+spellName+'|'+wisLevel+'||'+MIspellName+'|'+spellRow+'|'+spellCol+')')
																			  : ('](!magic --button '+(isMU ? BT.MISTORE_MUSPELL : BT.MISTORE_PRSPELL)+extra+'|'+tokenID+'|'+MIbutton+'|'+MIrow+'|'+MIcol+'|'+spellButton+'|'+spellRow+'|'+spellCol+')'))
													 : '</span>')
				+  ((spellButton >= 0 && MIbutton >= 0 && !canStore) ? ' Spells don\'t match. Must be the same\n' : '')
				+  ' or switch to ['+(isMU ? 'Priest' : 'Wizard')+'](!magic --mem-spell MI-'+(isMU ? 'PR' : 'MU')+extra+'|'+tokenID+') spells'
				+  '}}';
		if (msg.length) {
			content += '{{='+msg+'}}';
		}
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	}
	
	/*
	 * Create a menu for a player to cast a spell
	 */
	
	var makeCastSpellMenu = function( args, senderId, submitted = false ) {

		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			spellButton = args[2],
			spellRow = args[3],
			spellCol = args[4],
			charged = args[5].toString().toLowerCase() == 'true',
			
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			magicDB,
			magicWord = 'spell',
			spell,
			spellName = '',
			content = '',
			maxLevel = 13,
			tokenName,
			selectCmd,
			storeCmd;
			
		if (!curToken || !charCS) {
			sendDebug('makeCastSpellMenu: invalid tokenID passed');
			sendError('Internal MagicMaster parameter error');
			return content;
		}
		
		tokenName = curToken.get('name');
		content = '&{template:'+fields.menuTemplate+'}{{name=';
		if (!isPower) {content += 'What Spell is ' + tokenName + ' casting?}}{{subtitle=Casting '};
		
		if (isPower) {
			content += 'What Power is ' + tokenName + ' using?}}{{subtitle=Using Powers';
			if (spellButton >= 0) {magicDB = attrLookup( charCS, fields.Spells_db, fields.Spells_table, spellRow, spellCol ) || fields.PowersDB;}
			magicWord = 'power';
			selectCmd = isMI ? BT.MI_POWER : BT.POWER;
			storeCmd = isMI ? BT.CAST_MIPOWER : BT.USE_POWER;
		} else if (isMI) {
			content += 'MI stored spells';
			if (spellButton >= 0) {magicDB = attrLookup( charCS, fields.Spells_db, fields.Spells_table, spellRow, spellCol ) || fields.MU_SpellsDB;}
			selectCmd = BT.MI_SPELL;
			storeCmd = charged ? BT.CAST_SCROLL : BT.CAST_MISPELL;
		} else if (isMU) {
			content += 'MU spells';
			magicDB = fields.MU_SpellsDB;
			selectCmd = BT.MU_SPELL;
			storeCmd = BT.CAST_MUSPELL;
		} else {
			content += 'PR spells';
			magicDB = fields.PR_SpellsDB;
			selectCmd = BT.PR_SPELL;
			storeCmd = BT.CAST_PRSPELL;
		}
		
		if (!isPower && !isMI && charged) {
			let miName = attrLookup( charCS, fields.ItemChosen ),
				itemRow = parseInt(attrLookup( charCS, fields.ItemRowRef ));
			if (miName) {
				if (isNaN(itemRow)) {
					let Items = getTableField( charCS, {}, fields.Items_table, fields.Items_name );
					itemRow = parseInt(Items.tableFind( fields.Items_name, miName ));
				};
				if (!isNaN(itemRow)) {
					maxLevel = parseInt(attrLookup( charCS, fields.Items_qty, fields.Items_table, itemRow )) || 0;
				}
			}
		}

		content += '}}{{desc=' + (makeSpellList( senderId, tokenID, selectCmd, spellButton, true, submitted, '|'+charged, maxLevel )[0]);

		if (spellButton >= 0) {
			spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, spellRow, spellCol ) || '-';
			if (spellName.replace(reIgnore,'').length) {
				spell = getAbility( magicDB, spellName, charCS );
			} else {
				spellButton = -1;
			}
		} else {
			spellName = '';
		}
		content += '}}{{desc1=Select '+magicWord+' above, then '
				+ (((spellButton < 0) || submitted) ? '<span style=' + design.grey_button + '>' : '[')
				+ 'Cast '+(spellName.length > 0 ? spellName : magicWord)
				+ (((spellButton < 0) || submitted) ? '</span>' : '](!magic --button '+ storeCmd +'|'+ tokenID +'|'+ spellButton +'|'+ spellRow +'|'+ spellCol +'|'+ charged
				+'&#13;'+(spell.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{' + spell.dB + '|' + spellName.hyphened() + '})')
				+ '}}';
				
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};
	
	/*
	 * Create a menu for a player to view a character's spells
	 */
	
	var makeViewMemSpells = function( args, senderId ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPR = args[0].toUpperCase().includes('PR'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			tokenID = args[1],
			spellButton = args[2],
			learn = (String(args[3]) || '').toUpperCase() === 'LEARN',
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
			sendError('Internal MagicMaster parameter error');
			return content;
		}
		
		var title = isMI ? attrLookup( charCS, fields.ItemChosen ) : curToken.get('name');
		if (isPower) {
			levelLimit = 1;
			magicType = 'POWER';
			tableType = 'Powers';
			magicWord = 'power';
			viewCmd = isMI ? BT.VIEW_MI_POWER : BT.VIEW_POWER;
			magicDB = fields.PowersDB;
		} else if (isMI && !(isMU || isPR)) {
			levelLimit = 9;
			tableType = 'Magic Item Spells';
			viewCmd = BT.VIEW_MI_SPELL;
		} else if (isMU) {
			levelLimit = 9;
			magicType = 'MU';
			tableType = (isMI ? 'Magic Item ' : '')+'Wizard Spells';
			viewCmd = isMI ? BT.VIEW_MI_MUSPELL : BT.VIEW_MUSPELL;
			magicDB = fields.MU_SpellsDB;
		} else {
			levelLimit = 7;
			magicType = 'PR';
			tableType = (isMI ? 'Magic Item ' : '')+'Priest Spells';
			viewCmd = isMI ? BT.VIEW_MI_PRSPELL : BT.VIEW_PRSPELL;
			magicDB = fields.PR_SpellsDB;
		}
		
		content = '&{template:'+fields.menuTemplate+'}{{name=View '+title+'\'s currently memorised '+magicWord+'s}}'
				+ '{{subtitle=' + tableType + '}}'
				+ '{{desc=' + ((makeSpellList( senderId, tokenID, viewCmd, spellButton, true ))[0] || 'No '+magicWord+'s currently memorised');

		content += '}}{{desc1=Select the '+magicWord+' above that you want to view the details of.  It will not be cast and will remain in your memorised '+magicWord+' list.}}';
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
	};
	
	/*
	 * Make a one button menu to ask the player
	 * if they want to cast the same spell/power/MI again
	 */
	 
	var makeCastAgainMenu = function( args, senderId ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isPR = args[0].toUpperCase().includes('PR'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			spellName = args[5] || '-',
			charCS = getCharacter( args[1] ),
			macroDB = isPower ? fields.PowersDB : (isMU ? fields.MU_SpellsDB : (isPR ? fields.PR_SpellsDB : fields.MagicItemDB)),
			spell = getAbility( macroDB, spellName, charCS ),
			content = '&{template:'+fields.menuTemplate+'}{{name='+args[5]+'}}'
					+ '{{desc=[Use another charge?](!magic --button '+ args[0] +'|'+ args[1] +'|'+ args[2] +'|'+ args[3] +'|'+ args[4]
					+ '&#13;'+(spell.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{' + spell.dB + '|' + (args[5].hyphened()) + '})}}';
		
		if (charCS) {
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, args[1] );
		}
		return;
	}
	
	/*
	 * Create a short menu to ask the player to select between 
	 * a short or a long rest.  The long rest option can be shown
	 * as disabled.
	 */
	 
	var makeRestSelectMenu = function( args, longRestEnabled, senderId ) {
		
		var tokenID = args[0],
			casterType = args[2] || 'MU+PR',
			charCS = getCharacter(tokenID),
			curToken = getObj('graphic',tokenID),
			content = '&{template:'+fields.menuTemplate+'}{{name=Select Type of Rest for '+curToken.get('name')+'}}'
					+ '{{desc=[Short Rest](!magic --rest '+tokenID+'|short|'+casterType+') or '
					+ (longRestEnabled ? '[' : '<span style='+design.grey_button+'>')
					+ 'Long Rest'
					+ (longRestEnabled ? ('](!magic --rest '+tokenID+'|long|'+casterType+')') : '</span>')
					+ '}}';
					
		if (!longRestEnabled) {
			content += '{{ =It looks like the DM has not enabled Long Rests.\n[Try Again](!magic --rest '+tokenID+'|SELECT|'+args[2]+') once the DM says it is enabled}}';
		}
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
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
			treasure = (attrLookup( pickCS, fields.Money_treasure ) || ''),
			content = '&{template:'+fields.menuTemplate+'}{{name=View Treasure from ' + pickName + '}}';
			
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
	 
	async function makeViewUseMI( args, senderId, menuType ) {
		
		try {
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
				content = '&{template:'+fields.menuTemplate+'}{{name='+actionText+' '+charCS.get('name')+'\'s Magic Items}}'
						+ '{{desc=Select a Magic Item below to '+actionText
						+ (isView ? '. It will not be used and will remain in your Magic Item Bag' : ', and then press the **Use Item** button')
						+ '. Note that some items, such as Rods, Staves or Wands, may need to be taken in-hand using *Change Weapon* and used via the *Attack* action}}'
						+ '{{desc1=';

			if (shortMenu) {
				content += '[Select a Magic Item](!magic --button '+selectAction+'|'+tokenID+'|?{Which Magic Item?';
				content += await makeMIlist( charCS, senderId, false, isView, false, isView );
				content +='}) }}';
			} else {
				// build the character's visible MI Bag
				content += await makeMIbuttons( tokenID, senderId, (isGM ? 'max' : 'current'), fields.Items_qty[1], selectAction, (isView ? 'viewMI' : ''), MIrowref, true, false, false, isView );
				content += '}}';
			}
			content += '{{desc2=';
			if (shortMenu || !isView) {
				if (MIrowref >= 0) {
					let Items = getTable( charCS, fieldGroups.MI ),
						reveal = Items.tableLookup( fields.Items_reveal, MIrowref ).toLowerCase(),
						selectedMI = Items.tableLookup( fields.Items_name, MIrowref ),
						displayMI = selectedMI,
						trueMI = Items.tableLookup( fields.Items_trueName, MIrowref );;
						
					if ((shortMenu && isView && reveal == 'view') || (!isView && reveal == 'use')) {
						displayMI = trueMI.hyphened();
					}
					let miObj = abilityLookup( fields.MagicItemDB, displayMI, charCS, true ),
						hide = resolveData( displayMI, fields.MagicItemDB, reItemData, charCS, {hide:reSpellSpecs.hide}, MIrowref ).parsed.hide,
						showDesc = (displayMI !== trueMI) && hide && hide.length && hide !== 'hide',
						renamed = !abilityLookup( fields.MagicItemDB, displayMI ).obj,
						magicItem = getAbility( fields.MagicItemDB, displayMI, charCS, false, isGM, (showDesc ? displayMI : trueMI), MIrowref );
					if (!state.MagicMaster.viewActions && isView && !renamed && !!magicItem.obj) magicItem.obj[0].set('action',magicItem.obj[0].get('action').replace(reActionButton,design.grey_action) );
					content += '['+actionText+' '+selectedMI+'](!magic --button '+ submitAction +'|'+ tokenID +'|'+ MIrowref
																+'&#13;'+(magicItem.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+magicItem.dB+'|'+(displayMI.hyphened())+'})';
				} else {
					content	+= '<span style='+design.grey_button+'>'+actionText+' Magic Item</span>';
				}
				content += '\nor\n';
			}
			if (isView) {
				content += '[['+(attrLookup( charCS, fields.ItemContainerSize ) - (slotCounts[charCS.id] || 0))+']] remaining slots. ';
			}
			menuType = (shortMenu ? 'long' : 'short');
			content += '[Swap to a '+menuType+' menu](!magic --button '+(isView ? BT.VIEWMI_OPTION : BT.USEMI_OPTION)+'|'+tokenID+'|'+menuType+')'
					+  '}}';
					
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('MagicMaster',msg_orig[senderId],e);
		}
	}
	
	/**
	 * Make a menu to display when a Player selects to use
	 * a power of a Magic Item
	 */
	 
	var makeUseMIpowerMenu = function( args, senderId ) {
		
		var tokenID = args[1],
			powerName = args[2],
			castLevel = args[3],
			itemName = args[4],
			MIlibrary = args[5],
			power = args[6],
			powerLib = args[7],
			charCS = getCharacter(tokenID),
			tokenName = getObj('graphic',tokenID).get('name'),
			spell = getAbility( powerLib, power, charCS ),
			item = getAbility( MIlibrary, itemName, charCS ),
			toWho = sendToWho(charCS,senderId,false,true),
			content = '&{template:'+fields.menuTemplate+'}{{name='+itemName+'\'s '+powerName+' power}}'
					+ '{{desc='+tokenName+' is about to use '+itemName+'\'s '+powerName+' power.  Is this correct?}}'
					+ '{{desc1=[Use '+powerName+'](!magic --button '+ BT.MI_POWER_USED +'|'+ tokenID +'|'+ powerName +'|'+ itemName +'|'+ castLevel
					+ '&#13;'+(spell.api ? '' : toWho)+'&#37;{'+spell.dB +'|'+ (power.hyphened()) +'})'
					+ ' or [Return to '+itemName+'](!&#13;'+(item.api ? '' : toWho)+'&#37;{'+MIlibrary+'|'+(itemName.hyphened())+'})\nOr just do something else}}';
		sendResponse(charCS,content,senderId, flags.feedbackName, flags.feedbackImg, tokenID);
		return;	
	}
			
	
	/**
	* Create the Edit Magic Item Bag menu.  Allow for a short version if
	* the Short Menus status flag is set, and highlight selected buttons
	**/
	
	async function makeEditBagMenu(args,senderId,msg='',menuType) {
		
		try {
			var cmd = (args[0] || '').toUpperCase(),
				tokenID = args[1],
				MIrowref = args[2],
				itemName = args[3] || '',
				charges = args[4],
				selectedMI = itemName.hyphened(),
				alphaLists = state.MagicMaster.alphaLists,
				charCS = getCharacter( tokenID );
				
			if (!charCS) {
				sendDebug( 'makeEditMImenu: Invalid character ID passed' );
				sendError( 'Invalid MagicMaster argument' );
				return;
			}
			
			var qty, mi, playerConfig, magicItem, removeMI,
				selected = !!selectedMI && selectedMI.length > 0,
				remove = (selectedMI.toLowerCase() == 'remove'),
				bagSlot = !!MIrowref && MIrowref >= 0,
				queries = '',
				content = '&{template:'+fields.menuTemplate+'}{{name=Edit Magic Item Bag}}';

			if (!menuType) {
				playerConfig = getSetPlayerConfig( senderId );
				if (playerConfig) {
					menuType = playerConfig.editBagType;
					alphaLists = playerConfig.alphaLists;
				} else {
					menuType = 'long';
				}
			}
			var shortMenu = menuType == 'short',
				editMartial = cmd.includes('MARTIAL'),
				editAll = cmd.includes('ALLITEMS'),
				optionCmd = (editMartial ? BT.EDITMARTIAL_OPTION : (editAll ? BT.EDITALLITEMS_OPTION : BT.EDITMI_OPTION)),
				chooseCmd = (editMartial ? BT.CHOOSE_MARTIAL_MI : (editAll ? BT.CHOOSE_ALLITEMS_MI : BT.CHOOSE_MI)),
				redoCmd   = (editMartial ? BT.REDO_MARTIAL_MI : (editAll ? BT.REDO_ALLITEMS_MI : BT.REDO_CHOOSE_MI)),
				slotCmd   = (editMartial ? BT.SLOT_MARTIAL_MI : (editAll ? BT.SLOT_ALLITEMS_MI : BT.SLOT_MI)),
				storeCmd  = (editMartial ? BT.STORE_MARTIAL_MI : (editAll ? BT.STORE_ALLITEMS_MI : BT.STORE_MI)),
				reviewCmd = (editMartial ? BT.REVIEW_MARTIAL_MI : (editAll ? BT.REVIEW_ALLITEMS_MI : BT.REVIEW_MI)),
				removeCmd = (editMartial ? BT.REMOVE_MARTIAL_MI : (editAll ? BT.REMOVE_ALLITEMS_MI : BT.REMOVE_MI));
				
			if (selected && !remove) {
				magicItem = getAbility( fields.MagicItemDB, selectedMI, charCS, null, null, null, MIrowref );
				if (!magicItem.obj) {
					sendResponse( charCS, 'Can\'t find '+selectedMI+' in the Magic Item database', senderId, flags.feedbackName, flags.feedbackImg, tokenID );
					return;
				} else {
					let renamed = !abilityLookup( fields.MagicItemDB, displayMI ).obj;
					if (!state.MagicMaster.viewActions && isView && !renamed && !!magicItem.obj) magicItem.obj[0].set('action',magicItem.obj[0].get('action').replace(reActionButton,design.grey_action) );
				}
			}
			
			if (msg && msg.length>0) {
				content += '{{Section='+msg+'}}';
			}
			
			if (!shortMenu || !selected) {
				let potions = getMagicList(fields.MagicItemDB,miTypeLists,'potion',senderId,'',false,'',alphaLists),
					scrolls = getMagicList(fields.MagicItemDB,miTypeLists,'scroll',senderId,'',false,'',alphaLists),
					rods = getMagicList(fields.MagicItemDB,miTypeLists,'rod',senderId,'',false,'',alphaLists),
					weapons = getMagicList(fields.MagicItemDB,miTypeLists,'weapon',senderId,'',false,'',alphaLists),
					ammo = getMagicList(fields.MagicItemDB,miTypeLists,'ammo',senderId,'',false,'',alphaLists),
					armour = getMagicList(fields.MagicItemDB,miTypeLists,'armour',senderId,'',false,'',alphaLists),
					rings = getMagicList(fields.MagicItemDB,miTypeLists,'ring',senderId,'',false,'',alphaLists),
					equip = getMagicList(fields.MagicItemDB,miTypeLists,'equipment',senderId,'',false,'',alphaLists),
					misc = getMagicList(fields.MagicItemDB,miTypeLists,'miscellaneous',senderId,'',false,'',alphaLists);
				
				content += '{{Section1=[Use '+(alphaLists ? 'full' : 'alphabeticised')+' lists](!magic --button '+BT.ALPHALIST_OPTION+'|'+tokenID+'|'+(alphaLists ? 'full' : 'alpha')+'|'+cmd+') to select items from}}'
						+  '{{desc=**1.Choose what item to store**\n'
						+  (editMartial ? '' : '[Potion](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Potion to store|'+potions+'}|'+charges+')')
						+  (editMartial ? '' : '[Scroll](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Scroll to store|'+scrolls+'}|'+charges+')')
						+  (editMartial ? '' : '[Rods, Staves, Wands](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Rod Staff Wand to store|'+rods+'}|'+charges+')')
						+  (!editMartial && !editAll ? '' : '[Weapon](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Weapon to store|'+weapons+'}|'+charges+')')
						+  (!editMartial && !editAll ? '' : '[Ammo](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Ammunition to store|'+ammo+'}|'+charges+')')
						+  (!editMartial && !editAll ? '' : '[Armour](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Armour to store|'+armour+'}|'+charges+')')
						+  (editMartial ? '' : '[Ring](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Ring to store|'+rings+'}|'+charges+')')
						+  (editMartial ? '' : '[Equipment](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Equipment to store|'+equip+'}|'+charges+')')
						+  (editMartial ? '' : '[Miscellaneous](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|?{Misc Item to store|'+misc+'}|'+charges+')');
				if (shortMenu) {
					content +=  '\n**OR**\n'
							+  '[Choose item to Remove](!magic --button '+chooseCmd+'|'+tokenID+'|'+MIrowref+'|'+'Remove) from your MI bag}}'
							+  '{{desc2=[Swap to a long menu](!magic --button '+optionCmd+'|'+tokenID+'|'+(shortMenu ? 'long' : 'short')+')}}';
				}
			}
			if (!shortMenu || selected) {
				if (!remove) {
					if (shortMenu) {
						content += '{{desc=**1.Item chosen** ['+itemName+'](!magic --button '+redoCmd+'|'+tokenID+'|'+MIrowref+'), click to reselect\n';
					}
					content += '\nOptionally, you can '+(selected ? '[' : '<span style='+design.grey_button+'>')+'Review '+itemName+(selected ? ('](!magic --button '+reviewCmd+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|&#13;'+(magicItem.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+magicItem.dB+'|'+(selectedMI.hyphened())+'})') : '')+'</span>';
				} else {
					content += '{{Section1=}}{{Section2=}}{{desc=**1.Action chosen** ***Remove***, [click](!magic --button '+redoCmd+'|'+tokenID+'|'+MIrowref+') to change';
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
					content += '[Select slot](!magic --button '+slotCmd+'|'+tokenID+'|?{Which slot?';
					content += await makeMIlist( charCS, senderId, true );
					content +='}|'+selectedMI+')';
				} else {
					content += await makeMIbuttons( tokenID, senderId, 'current', fields.Items_qty[1], slotCmd, '|'+selectedMI, MIrowref, false, true );
				}
				
				content += '}}';
			} else if (shortMenu && bagSlot) {
				removeMI = mi = attrLookup( charCS, [fields.Items_name[0], 'current'], fields.Items_table, MIrowref );
				
				content += '{{desc1=**2.Selected** ['+qty+' '+mi+'](!magic --button '+slotCmd+'|'+tokenID+'|?{Which other slot?';
				content += await makeMIlist( charCS, senderId, true );
				content += '}|'+selectedMI+'|)'
						+  ' as slot to '+(remove ? 'remove' : 'store it in')+', click to change}}';
			}
			
			if (!shortMenu || (selected && bagSlot)) {

				menuType = (shortMenu ? 'long' : 'short');
				content += '{{desc2=**3.';
				if (!remove) {
					qty = String(qty)+'+1';
					if (selected) {
						let chosenData = resolveData( selectedMI, fields.MagicItemDB, reItemData, charCS, {qty:reSpellSpecs.qty,query:reSpellSpecs.query}, MIrowref ).parsed;
						qty = chosenData.qty || (selectedMI.trueCompare(removeMI) ? qty : 1);
						queries = parseQuery( chosenData.query );
					}
					
					content += ((selected && bagSlot) ? '[' : ('<span style='+design.grey_button+'>'))
							+  'Store '+itemName
							+  ((selected && bagSlot && !remove) ? ('](!magic --button '+storeCmd+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|?{Quantity?|'+qty+'}||'+queries+')') : '</span>')
							+  ' in your MI Bag**'+(!!removeMI ? (', overwriting **'+removeMI) : '')+'**\n\n'
							+  'or ';
				}
				content += (bagSlot ? '[' : ('<span style='+design.grey_button+'>'))
						+  'Remove '+(!!removeMI ? removeMI : 'item')
						+  (bagSlot ? ('](!magic --button '+removeCmd+'|'+tokenID+'|'+MIrowref+'|'+removeMI+')') : '</span>')
						+  ' from your MI Bag\n\n'
						+  'or [Swap to a '+menuType+' menu](!magic --button '+optionCmd+'|'+tokenID+'|'+menuType+')}}';
			}
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} catch (e) {
			sendCatchError('MagicMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Create a menu for DMs to see displayed and real Magic Item information
	 * on Character Sheets.  Hidden information can be what the MI really is,
	 * which the DM can set using this menu.
	 */
	 
	async function makeGMonlyMImenu(args, senderId, msg, alphaLists) {

		try {
			var cmd = args[0],
				tokenID = args[1],
				MIrowref = args[2],
				MItoStore = args[3],
				charCS = getCharacter(tokenID),
				
				ensureUnique = function( Items, name ) {
					var count = 1,
						newName = name;
					while (Items.tableFind( fields.Items_name, newName )) {
						newName = name + String(count++);
					}
					return newName;
				};
				
			if (!charCS) {
				sendDebug('makeGMonlyMImenu: invalid tokenID passed');
				sendError('Internal MagicMaster error');
				return;
			}	
			
			if (!_.isUndefined(alphaLists) && !_.isNull(alphaLists)) {
				state.MagicMaster.alphaLists = alphaLists;
			} else {
				alphaLists = state.MagicMaster.alphaLists;
			}
			
			var	qty, mi,
				potions = getMagicList(fields.MagicItemDB,miTypeLists,'potion',senderId,'',false,'',!!alphaLists),
				scrolls = getMagicList(fields.MagicItemDB,miTypeLists,'scroll',senderId,'',false,'',!!alphaLists),
				rods = getMagicList(fields.MagicItemDB,miTypeLists,'rod',senderId,'',false,'',!!alphaLists),
				weapons = getMagicList(fields.MagicItemDB,miTypeLists,'weapon',senderId,'',false,'',!!alphaLists),
				ammo = getMagicList(fields.MagicItemDB,miTypeLists,'ammo',senderId,'',false,'',!!alphaLists),
				armour = getMagicList(fields.MagicItemDB,miTypeLists,'armour',senderId,'',false,'',!!alphaLists),
				rings = getMagicList(fields.MagicItemDB,miTypeLists,'ring',senderId,'',false,'',!!alphaLists),
				misc = getMagicList(fields.MagicItemDB,miTypeLists,'miscellaneous',senderId,'',false,'',!!alphaLists),
				equip = getMagicList(fields.MagicItemDB,miTypeLists,['equipment','light'],senderId,'',false,'',!!alphaLists),
				dmitems = getMagicList(fields.MagicItemDB,miTypeLists,'dmitem',senderId,'',false,'',false),
				content = '&{template:'+fields.menuTemplate+'}{{name=Edit '+charCS.get('name')+'\'s Magic Item Bag}}'
						+ (msg && msg.length ? '{{section='+msg+'}}' : '')
						+ '{{desc=**1. Choose something to store** [Alpha '+!!alphaLists+'](!magic --button '+(alphaLists ? 'GM-MIalphaOff':'GM-MIalphaOn')+'|'+args[1]+'|'+args[2]+'|'+args[3]+')\n';
						
			content += '[Potion](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Potion?|'+potions+'})'
					+  '[Scroll](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Scroll?|'+scrolls+'})'
					+  '[Rods, Staves, Wands](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Rod, Staff or Wand?|'+rods+'})'
					+  '[Weapon](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Weapon?|'+weapons+'})'
					+  '[Ammo](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Ammo?|'+ammo+'})'
					+  '[Armour](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which piece of Armour?|'+armour+'})'
					+  '[Ring](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Ring?|'+rings+'})'
					+  '[Miscellaneous MI](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which Misc MI?|'+misc+'})'
					+  '[Equipment](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{What Equipment?|'+equip+'})'
					+  '[DM only list](!magic --button GM-MItoStore|'+tokenID+'|'+MIrowref+'|?{Which DM only item?|'+dmitems+'})}}';
			content += '{{desc1=**2. Choose slot to edit or store in**\n';

			var Items = getTable( charCS, fieldGroups.MI ),
				slotName = (MIrowref >= 0) ? Items.tableLookup( fields.Items_name, MIrowref ) : '',
				slotActualName = (MIrowref >= 0) ? Items.tableLookup( fields.Items_trueName, MIrowref ) : '',
				slotType = (MIrowref >= 0) ? Items.tableLookup( fields.Items_type, MIrowref ) : '',
				slotTrueType = (MIrowref >= 0) ? Items.tableLookup( fields.Items_trueType, MIrowref ) : '',
				slotQty = parseInt(Items.tableLookup( fields.Items_qty, MIrowref )) || 0,
				slotActualQty = parseInt(Items.tableLookup( fields.Items_trueQty, MIrowref )) || 0,
				slotCost = parseFloat(Items.tableLookup( fields.Items_cost, MIrowref )) || 0,
				slotReveal = (MIrowref >= 0) ? Items.tableLookup( fields.Items_reveal, MIrowref ) : '',
				slotCursed = slotType.toLowerCase().includes('cursed'),
			
				chosenMI = (MItoStore.length > 0),
				chosenSlot = (MIrowref >= 0),
				chosenBoth = (chosenMI && chosenSlot),
				hideAvail = chosenBoth,
				chosenEither = (chosenMI || chosenSlot),
				hiddenMI = slotName !== slotActualName,
				greyButton = '<span style='+design.grey_button+'>',
				selectableSlot = chosenSlot ? '[' : greyButton,
				selectableBoth = chosenBoth ? '[' : greyButton,
				hideableBoth = selectableBoth,
				selectableEither = chosenEither ? '[' : greyButton,
				hiddenSlot = hiddenMI ? '[' : greyButton,
				revealType = (!slotReveal || slotReveal.toLowerCase() === 'manual' ? 'Manually' : ('on '+slotReveal)),
				intelligence = Math.max( (parseInt(attrLookup( charCS, fields.Intelligence )) || 0), (parseInt(attrLookup( charCS, fields.Monster_int )) || 0)),
				hp = parseInt(attrLookup( charCS, fields.HP )) || 0,
				sentient = (intelligence > 0 && hp > 0),
				containerNo = parseInt(attrLookup( charCS, fields.ItemContainerType )) || 0,
				containerSize = attrLookup( charCS, fields.ItemContainerSize ),
				showTypes = parseInt(attrLookup( charCS, fields.ItemContainerHide )),
				spellStoring = false,
				looksLike = false,
				queries = '',
				chosenData, initQty, containerType, slotObj, itemObj;
			
			// build the character's visible MI Bag
			content += await makeMIbuttons( tokenID, senderId, 'max', 'current', 'GM-MIslot', '|'+MItoStore, MIrowref, false, true );
			content	+= '}}';

			if (hiddenMI) {
				content += '{{desc2=**Which is hidden as**\n'
						+ '<span style=' + design.selected_button  + '>'
						+ (slotName != '-' ? (slotQty + ((slotQty != slotActualQty) ? '/'+slotQty : '') + ' ') : '') + slotName
						+ '</span>}}';
			}

			if (chosenSlot) {
				slotObj = getAbility( fields.MagicItemDB, slotActualName, charCS, false, true, slotActualName, MIrowref );
				if (slotObj.obj) {
					spellStoring = reCastMIspellCmd.test(slotObj.obj[1].body) || reCastMIpowerCmd.test(slotObj.obj[1].body);
					looksLike = reLooksLike.test(slotObj.obj[1].body);
					if (looksLike && !hiddenMI && !chosenMI) {
						MItoStore = ensureUnique( Items, getShownType( slotObj, MIrowref, resolveData( slotActualName, fields.MagicItemDB, reItemData, charCS, {itemType:reSpellSpecs.itemType}, MIrowref ).parsed.itemType ));
						hideAvail = MItoStore !== slotName;
						hideableBoth = hideAvail ? '[' : greyButton;
					}
				}
			}
			var storableSlot = (spellStoring && chosenSlot) ? '[' : '<span style='+design.grey_button+'>';

			if (_.isUndefined(containerSize)) {
				containerSize = fields.MIRowsStandard;
				setAttr( charCS, fields.ItemContainerSize, containerSize );
			}
			
			if (containerNo < 4) {
				if (hp <= 0 || !sentient) {
					containerNo = 1;
				} else {
					containerNo = 3;
				}
			}
			switch (containerNo) {
			case 0: 
			case 1: 
			case 6: containerType = 'Inanimate Container';
					break;
			case 2: 
			case 3: 
			case 7:containerType = 'Sentient Creature';
					break;
			case 4:
			case 5: containerType = 'Trapped container';
					break;
			default:containerType = 'Empty Container';
					containerNo = 0;
					break;
			}
			setAttr( charCS, fields.ItemContainerType, containerNo );
			setAttr(charCS, fields.ItemOldContainerType, containerNo);
			
			var itemName = MItoStore;
			MItoStore = (MItoStore || '').hyphened();
			initQty = String(slotQty)+'+1';
			if (chosenMI) {
				itemObj = getAbility( fields.MagicItemDB, MItoStore, charCS, false, true, MItoStore, chosenSlot );
				if (itemObj.obj) {
					chosenData = resolveData( MItoStore, fields.MagicItemDB, reItemData, charCS, {qty:reSpellSpecs.qty,query:reSpellSpecs.query}, chosenSlot );
					initQty = chosenData.parsed.qty || (itemName.trueCompare(slotName) ? initQty : 1);
					queries = parseQuery( chosenData.parsed.query );
				}
			};
			
			var reviewItem = ((cmd !== 'GM-MItoStore' && chosenSlot) ? slotActualName : itemName),
				reviewObj  = ((cmd !== 'GM-MItoStore' && chosenSlot) ? slotObj : itemObj),
				renamed = !abilityLookup( fields.MagicItemDB, reviewItem ).obj;
			if (!state.MagicMaster.viewActions && reviewObj && reviewObj.obj && !renamed) reviewObj.obj[0].set('action',reviewObj.obj[0].get('action').replace(reActionButton,design.grey_action) );
			
			content += '{{desc3=**3. '+selectableBoth+(chosenBoth ? ('Store '+itemName+'](!magic --button GM-StoreMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|&#91;[?{Quantity?|'+initQty+'}]&#93;||'+queries+')') : ('Store'+(chosenSlot ? ('d '+slotActualName) : itemName)+'</span>'))+' **'
					+  ' or '+hideableBoth+(hideAvail ? ('Hide '+slotName+' as '+itemName+'](!magic --button GM-HideMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+')') : ((hiddenMI ? ('Hidden as '+slotName) : ('Hide Item'+(chosenMI?(' as '+itemName):'')))+'</span>'))+'<br>'
					+  ' or '+selectableEither+'Review'+(chosenEither ? (' '+reviewItem+'](!magic --button GM-ReviewMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+'&#13;'+(reviewObj.api ? '' : '/w gm ')+'&#37;{'+reviewObj.dB+'|'+(reviewItem.hyphened())+'})') : ' the item</span>')+'<br><br>}}'
					+  '{{desc4=1. Or select MI from above ^\n'
					+  '<table width="100%"><tr><td>'
					+  selectableSlot+'Rename '+slotName+(chosenSlot ? ('](!magic --button GM-RenameMI|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{What name should '+slotName+' now have?}) ') : '</span> ')+'<br>'
					+  selectableSlot+(!slotCursed ? 'Change Type' : 'Remove Curse')+(chosenSlot ? ('](!magic --button GM-ChangeMItype|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|'+(slotCursed ? 'removeCurse' : ('?{Currently '+slotType+'. What type should '+slotName+' now be?|charged|uncharged|splitable|recharging|rechargeable|selfchargeable|absorbing|discharging|cursed|cursed+charged|cursed+recharging|cursed+rechargeable|cursed+selfchargeable|cursed+absorbing|cursed+discharging}'))+') ') : '</span> ')+'<br>'
					+  selectableSlot+'Change displayed charges'+(chosenSlot ? ('](!magic --button GM-ChangeDispCharges|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How many displayed charges should '+slotName+' now have (currently '+slotQty+'&#41;?|'+slotQty+'}) ') : '</span> ')+'<br>'
					+  selectableSlot+'Change actual charges'+(chosenSlot ? ('](!magic --button GM-ChangeActCharges|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How many actual charges should '+slotActualName+' now have (currently '+slotActualQty+'&#41;?|'+slotActualQty+'}) ') : '</span> ')+'<br>'
					+  storableSlot+'Store Spells/Powers in MI'+((spellStoring && chosenSlot) ? ('](!magic --store-spells '+tokenID+'|'+slotActualName+'|||GM-EDIT-MI) ') : '</span> ')+'</td>'
					+  '<td>'+hiddenSlot+'Reveal '+revealType+((hiddenMI && chosenSlot) ? ('](!magic --set-reveal '+tokenID+'|'+slotActualName+'|?{Currently '+revealType+'. How should '+slotActualName+' be revealed?|Manually by DM,|When viewed,View|When used,Use|On Long Rest,Rest}|'+MIrowref+'|MENU) ') : '</span> ')+'<br>'
					+  selectableSlot+(hiddenMI ? 'Reveal Now' : 'Reset Qty to Max')+(chosenSlot ? ('](!magic --button GM-ResetSingleMI|'+tokenID+'|'+MIrowref+') ') : '</span> ')+'<br>'
					+  selectableSlot+'Change Cost'+(chosenSlot ? ('](!magic --button GM-SetMIcost|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How much should '+slotName+' now cost (currently '+slotCost+'GP&#41;?|'+slotCost+'})') : '</span>')+'<br>'
					+  selectableSlot+'REMOVE MI'+(chosenSlot ? '](!magic --button GM-DelMI|'+tokenID+'|'+MIrowref+'|'+slotActualName+') ' : '</span> ')+'</td></tr></table>}}'
					+  '{{desc5=or [Edit Treasure](!magic --button GM-TreasureMenu|'+tokenID+'|'+MIrowref+'|'+MItoStore+')\n'
					+  '['+containerSize+' slot](!magic --button GM-SetTokenSize|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{How many slots does this container have?&#124;'+containerSize+'&#125;)'
					+  '['+containerType+'](!magic  --button GM-SetTokenType|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|?{What type of token is this?&#124;Untrapped Container,1&#124;Trapped container,4&#124;Force Inanimate Container,6&#124;Force Sentient Creature,7&#125;)\n'
					+  '['+(showTypes ? 'Show as Item types' : 'Show as Item names')+'](!magic --button GM-HideAsTypes|'+tokenID+'|'+MIrowref+'|'+MItoStore+'|'+showTypes+') in container. '
					+  '[BLANK BAG](!magic --button GM-BlankBag|'+tokenID+')'
					+  '}}';
					
			sendFeedback( content, flags.feedbackName, null, tokenID, charCS );
			return;
		} catch (e) {
			sendCatchError('MagicMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Create the DM's Edit Treasure menu
	 */
	 
	var makeEditTreasureMenu = function(args,senderId,msg) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
	
		if (!charCS) {
			sendDebug('makeEditTreasureMenu: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var charName = charCS.get('name'),
			treasure = attrLookup( charCS, fields.Money_treasure ) || '{{Treasure=None found}}',
			content = '&{template:'+fields.menuTemplate+'}{{name=Current treasure for '+charName+'}}'
					+ treasure +'{{=----- End of current Treasure ----}}'
					+ '{{desc1=[Add](!magic --button GM-AddTreasure|'+tokenID+'|?{Title for Treasure?}|?{Treasure text}) or '
					+ '[Edit](!magic --button GM-EditTreasure|'+tokenID+') or '
					+ '[Delete](!magic --button GM-DeleteTreasure|'+tokenID+') the treasure}}'
					+ '{{desc2=Return to [DM\'s Change MI menu](!magic --button GM-MImenu|'+tokenID+'|-1|)}}';
		if (msg && msg.length > 0) {
			content += '{{desc='+msg+'}}';
		}
		
		sendFeedback(content,flags.feedbackName,tokenID,charCS);
		return;
	}
	
	/*
	 * Create a shorter, easier Pick or Put menu, that only does either
	 * Pick or Put (Player can switch between two), that uses a drop-down
	 * list of the MIs in the container to pick from (rather than buttons), and
	 * automatically selects an empty slot to put it into
	 */

	async function makeShortPOPmenu( args, senderId, menuType ) {  // silent
		
		try {
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
				putItems,
				miObj,
				pickedMI, pickedTrueMI, pickableQty, pickedType, miType,
				bagSize = (attrLookup( putCS, fields.ItemContainerSize ) || fields.MIRows),
				showTypes = parseInt(attrLookup( pickCS, fields.ItemContainerHide )),
				miList = await makeMIlist( pickCS, senderId, false, true, showTypes ),
				treasure = (attrLookup( pickCS, fields.Money_treasure ) || '{{desc1=and there is no treasure here, either}}'),
				content = '&{template:'+fields.menuTemplate+'}{{name=Take from ' + pickName + ' to add to ' + putName + '\'s Items of Equipment}}',
				magicItems, slotsUsed;
				
			putRow = -1;
			putItems = getTableField( putCS, {}, fields.Items_table, fields.Items_name );
			if (pickRow >= 0) {
				pickedMI = attrLookup( pickCS, fields.Items_name, fields.Items_table, pickRow ) || '';
				pickedTrueMI = (attrLookup( pickCS, fields.Items_trueName, fields.Items_table, pickRow ) || '').dbName() || '-';
				pickableQty = attrLookup( pickCS, fields.Items_qty, fields.Items_table, pickRow ) || '';
				pickedType = (attrLookup( pickCS, fields.Items_type, fields.Items_table, pickRow ) || '').dbName() || '-';
				putItems = getTableField( putCS, putItems, fields.Items_table, fields.Items_trueName );
				putItems = getTableField( putCS, putItems, fields.Items_table, fields.Items_type );
				let lowerMI = pickedMI.dbName() || '-';
				for (i = 0; i < putItems.sortKeys.length; i++) {
					mi = (putItems.tableLookup(fields.Items_name,i) || '').dbName() || '-';
					if (_.isUndefined(mi)) break;
					if (mi != lowerMI) continue;
					miTrueName = (putItems.tableLookup(fields.Items_trueName,i) || '').dbName() ||'-';
					if (miTrueName != pickedTrueMI) continue;
					miType = (putItems.tableLookup(fields.Items_type,i) || pickedType);
					if (miType.dbName() !== '' && (miType.dbName() !== pickedType || !stackable.includes(miType.toLowerCase()))) continue;
					putRow = i;
					break;
				}
				if (showTypes) {
					miObj = abilityLookup( fields.MagicItemDB, pickedMI, pickCS );
					pickedMI = !miObj.obj ? pickedMI : getShownType( miObj, pickRow );
				}
			}
			i = slotsUsed = 0;
			while (i < putItems.sortKeys.length) {
				mi = putItems.tableLookup( fields.Items_name, i, false );
				if (_.isUndefined(mi)) {break;}
				if (mi == '-' && putRow < 0) {
					putRow = i;
				} else if (mi !== '-') slotsUsed++;
				i++;
			}
			
			slotCounts[putID] = slotsUsed;

			if (putRow < 0) {
				if (i >= bagSize) {
					sendParsedMsg( tokenID, messages.miBagFull, senderId, '', putID );
					return;
				} else {
					putRow = i;
				}
			}
			
			shortMenu = shortMenu && (miList.split('|').length > 2);
			
			if (pickingUp) content += treasure;
			
			magicItems = await makeMIbuttons( tokenID, senderId, 'current', 'current', BT.POP_PICK, '|'+pickID+'|'+putID+'|'+putRow, pickRow, false, false, showTypes, true, pickID );
			
			content += '{{desc='+putName+' has [['+(attrLookup( putCS, fields.ItemContainerSize ) - slotCounts[putID])+']] remaining slots. ';
			
			if (magicItems && magicItems.length) {
				if (shortMenu) {
					content += 'Press the **[Select]** button to select the item you want to '+pickOrPut+' from a list of items in a container, '
							+ 'then press the **[Store]** button to automatically put it away in an empty slot}}'
							+ '{{Select=[Select Item to '+pickOrPut+'](!magic --button '+BT.POP_PICK+'|'+tokenID+'|?{'+pickOrPut+' which Item?'+miList+'}|'+pickID+'|'+putID+'|'+putRow+')}}'
							+ '{{Store=';
				} else {
					content += 'Select an item you want to '+pickOrPut+'\n'
							+  magicItems
							+  '}}{{desc1='
				}
				content +=((pickRow >= 0 && putRow >= 0) ? '[' : '<span style='+design.grey_button+'>')
						+ 'Store '+((pickRow >= 0) ? pickedMI : 'item')
						+ ((pickRow >= 0 && putRow >= 0) ? ('](!magic --button '+BT.POP_STORE+'|'+tokenID+'|'+pickRow+'|'+pickID+'|'+putID+'|'+putRow+'|-1)') : '</span>' )
						+ ' in free slot}}{{desc2=';
				content += '[Use '+menuType+' menu](!magic --button '+(pickingUp ? BT.PICKMI_OPTION : BT.PUTMI_OPTION)+'|'+tokenID+'|'+menuType+'|'+pickID+'|'+putID+')}}';

				sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			} else {
				content = messages.header + '{{desc=' + pickCS.get('name') + ' ' + messages.fruitlessSearch + treasure;
				sendParsedMsg( tokenID, content, senderId );
			}
			return;
		} catch (e) {
			sendCatchError('MagicMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Create the Spells menus
	 */
	 
	var makeMUSpellsMenu = function( args, senderId ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makeMUSpellsMenu: invalid tokenID parameter');
			sendError('Invalid MagicMaster parameter');
			return;
		}
		var content = '&{template:'+fields.menuTemplate+'} {{name='+curToken.get('name')+'\'s Magic User Spells menu}}'
					+ '{{desc=[Cast MU spell](!magic --cast-spell MU|'+tokenID+')\n'
					+ ((apiCommands.rounds && apiCommands.rounds.exists) ? ('[Show an Area of Effect](!rounds --aoe '+tokenID+')\n') : ('<span style='+design.grey_button+'>Show an Area of Effect</span>'))
					+ '[Short Rest for L1 MU Spells](!magic --rest '+tokenID+'|short|MU)\n'
					+ '[Long Rest and recover MU spells](!magic --rest '+tokenID+'|long|MU)\n'
					+ '[Memorise MU spells](!magic --mem-spell MU|'+tokenID+')\n'
					+ '[View MU Spellbook](!magic --view-spell MU|'+tokenID+')}}';
					
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};
	
	var makePRSpellsMenu = function( args, senderId ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makePRSpellsMenu: invalid tokenID parameter');
			sendError('Invalid MagicMaster parameter');
			return;
		}
		var content = '&{template:'+fields.menuTemplate+'} {{name='+curToken.get('name')+'\'s Clerical Spells menu}}'
					+ '{{desc=[Cast Priest spell](!magic --cast-spell PR|'+tokenID+')\n'
					+ ((apiCommands.rounds && apiCommands.rounds.exists) ? ('[Show an Area of Effect](!rounds --aoe '+tokenID+')\n') : ('<span style='+design.grey_button+'>Show an Area of Effect</span>'))
					+ '[Short Rest for L1 Priest Spells](!magic --rest '+tokenID+'|short|PR)\n'
					+ '[Long Rest and recover Priest spells](!magic --rest '+tokenID+'|long|PR)\n'
					+ '[Memorise Priest spells](!magic --mem-spell PR|'+tokenID+')\n'
					+ '[View Priest Spellbook](!magic --view-spell PR|'+tokenID+')}}';
					
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};
	
	var makePowersMenu = function( args, senderId ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('makePowersMenu: invalid tokenID parameter');
			sendError('Invalid MagicMaster parameter');
			return;
		}
		var content = '&{template:'+fields.menuTemplate+'} {{name='+curToken.get('name')+'\'s Powers menu}}'
					+ '{{desc=[2. Use Power](!magic --cast-spell POWER|'+tokenID+')\n'
					+ '[3. Long Rest](!magic --rest '+tokenID+'|LONG)\n'
					+ '[4. Memorise Powers](!magic --mem-spell POWER|'+tokenID+')\n'
					+ '[4. View Powers](!magic --view-spell POWER|'+tokenID+')}}';
					
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};
	
	/**
	 * Make a menu to ask the Player which class they want a
	 * requested level drain (or boost) to be applied to.
	 **/
	
	var makeLevelDrainMenu = function( args, classes, senderId, msg, totalHP ) {
		
		var tokenID = args[0],
			drainLevels = parseInt(args[1]) || -1,
			absLevels = Math.abs(drainLevels),
			multiLevels = absLevels > 1,
			content = '&{template:'+fields.menuTemplate+'}{{title=Level '+(drainLevels > 0 ? 'Boost' : 'Drain')+'}}'+(msg ? '{{Section='+msg+'}}' : '')
					+ '{{desc='+getObj('graphic',tokenID).get('name')+' is being '+(drainLevels > 0 ? 'boosted by' : 'drained of')+' '+absLevels+' level'+(multiLevels ? 's' : '')
					+ '. Which class do you want/have to '+(drainLevels > 0 ? 'gain' : 'lose')+' the '
					+ (multiLevels > 1 ? 'next one level? You will then be asked which levels to drain the rest of the levels from, one at a time.' : 'level from?')
					+ '}}{{desc1=';
				
		_.each( classes, c => {
			content += 'Level '+c.level+' ['+(c.classData.name || c.name)+'](!magic --button '+BT.LEVEL_CHANGE+'|'+tokenID+'|'+drainLevels+'|'+c.base+'|'+args[3]+'|&#63;{How many HP to '+(drainLevels > 0 ? 'add' : 'deduct')+'|'+totalHP+'})\n';
		});
		content += '}}';
		sendResponse( getCharacter(tokenID), content );
		return;
	}
	
	/*
	 * Menu to ask the user to confirm that they want
	 * to blank the specified repeating table
	 */
 
	var menuConfirmBlank = function( args, question, senderId ) {
		
		var cmd = args[0],
			tokenID = args[1],
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.menuTemplate+'}{{name=Confirm Action}}'
					+ '{{desc='+question+'}}'
					+ '{{desc1=[Yes](!magic --button '+args[0]+'|'+tokenID+') or [No](!magic --button '+BT.ANSWER_NO+'|'+tokenID+')}}';
					
		sendResponse(charCS,content,senderId, flags.feedbackName, flags.feedbackImg, tokenID);
	}
	
	/*
	 * Display a menu to add spells and powers to spell-storing magic items
	 */
	 
	async function makeSpellsMenu( args, senderId, msg='' ) {
		
		try {
			var lists = args[0].toUpperCase(),
				tokenID = args[1],
				item = args[2].dispName(),
				miName = args[2].hyphened(),
				cmd = args[3].toUpperCase(),
				level = parseInt(args[4]) || 1,
				retMenu = (args[5] || 'VIEW-ITEM').toUpperCase(),
				spellName = args[6].dispName(),
				spell = args[6].hyphened(),
				charCS = getCharacter(tokenID),
				isMU = cmd.includes('MU'),
				isPR = cmd.includes('PR'),
				isPower = cmd.includes('POWER'),
				storeBoth = lists.includes('BOTH'),
				storeSpells = lists.includes('SPELLS'),
				storePowers = lists.includes('POWERS'),
				curSpells = '',
				storedSelected = false,
				pwList = [fields.ItemPowersList[0]+miName,fields.ItemPowersList[1]],
				pwVals = [fields.ItemPowerValues[0]+miName,fields.ItemPowerValues[1]],
				muList = [fields.ItemMUspellsList[0]+miName,fields.ItemMUspellsList[1]],
				muVals = [fields.ItemMUspellValues[0]+miName,fields.ItemMUspellValues[1]],
				prList = [fields.ItemPRspellsList[0]+miName,fields.ItemPRspellsList[1]],
				prVals = [fields.ItemPRspellValues[0]+miName,fields.ItemPRspellValues[1]],
				nextLevel, minLevel, rootDB, listAttr, listType,
				storedSpellsAttr, storedLevelAttr, choice,
				spellObj, cmdStr, shortCmdStr, desc, question, content;
				
			lists = storeBoth ? 'BOTH' : (storePowers ? 'POWERS' : 'SPELLS');
				
			if (isPower) {
				desc = 'Powers';
				choice = ' a power';
				rootDB = fields.PowersDB;
				storedSpellsAttr = pwList;
				listType = ['power','itempower'];
				minLevel = 1;
				question = 'Cast how many per day (-1 means unlimited&#41;?';
			} else if (isMU) {
				desc = storePowers ? 'Powers' : 'Stored Wizard spells';
				choice = ' a level '+level+' Wizard spell',
				rootDB = fields.MU_SpellsDB;
				storedSpellsAttr = storePowers ? pwList : muList;
				listType = ['muspelll'+level,'itemspell'];
				minLevel = spellsPerLevel.wizard.MU[level].findIndex(num => num > 0);
				question = 'Cast at what level (normal min caster level '+minLevel+'&#41;?';
			} else if (isPR) {
				desc = storePowers ? 'Powers' : 'Stored Priest spells';
				choice = ' a level '+level+' Priest spell',
				rootDB = fields.PR_SpellsDB;
				storedSpellsAttr = storePowers ? pwList : prList;
				listType = ['prspelll'+level,'itemspell'];
				minLevel = spellsPerLevel.priest.PR[level].findIndex(num => num > 0);
				question = 'Cast at what level (normal min caster level '+minLevel+'&#41;?';
			} else {
				return;
			}
			
			args.shift();
			shortCmdStr = [tokenID,item,cmd,level,retMenu].join('|');
			cmdStr = shortCmdStr+'|'+spell;

			if (charCS) {
				setAttr( charCS, fields.Casting_name, charCS.get('name'));
				setAttr( charCS, fields.CastingLevel, minLevel );
				curSpells = attrLookup( charCS, storedSpellsAttr ) || '';
				if (_.isUndefined(attrLookup( charCS, pwList ))) setAttr( charCS, pwList, '' );
				if (_.isUndefined(attrLookup( charCS, pwVals ))) setAttr( charCS, pwVals, '' );
				if (_.isUndefined(attrLookup( charCS, muList ))) setAttr( charCS, muList, '' );
				if (_.isUndefined(attrLookup( charCS, muVals ))) setAttr( charCS, muVals, '' );
				if (_.isUndefined(attrLookup( charCS, prList ))) setAttr( charCS, prList, '' );
				if (_.isUndefined(attrLookup( charCS, prVals ))) setAttr( charCS, prVals, '' );
			}
				
			content = '&{template:'+fields.menuTemplate+'}{{name=Store Spells & Powers}}{{Section='+(msg||'')+'}}'
					+ '{{Section1=**How to use this menu**\nThe [Choose] button selects a spell of the type indicated. It can then be reviewed or stored. *Powerful* items can store Wizard & Priest spells as Powers.'
					+  ' *Spell Storing* items only store spells. To *Remove* a stored spell, select its name and the [Remove] button will appear}}'
					+  '{{'+desc+'=';
			
			curSpells = curSpells.split(',').filter(e=>!!e);
			for (let storedSpell of curSpells) {
				let selected = storedSpell.dbName() === spell.dbName();
				storedSelected = storedSelected || selected;
				content += (selected ? ('<span style='+design.selected_button+'>'+storedSpell.dispName()+'</span>') : ('['+storedSpell.dispName()+'](!magic --button CHOOSE_'+lists+'|'+shortCmdStr+'|'+storedSpell+')'));
			}
			let spellList = getMagicList( rootDB, spTypeLists, listType, senderId );
			content += '}}{{desc=1. [Choose](!magic --button CHOOSE_'+lists+'|'+shortCmdStr+'|&#63;{Choose which spell|'+spellList+'})'+choice+'\n';
					
			if (spell) {
				let trueName = spell;
				if (storePowers) {
					spellObj = findPower( charCS, spell );
					rootDB = spellObj.dB;
					trueName = spellObj.obj ? spellObj.obj[1].name : spell;
				}
				spellObj = getAbility( rootDB, trueName, charCS );
				content += '...Optionally [Review '+spellName+'](!magic --button REVIEW_'+lists+'|'+ cmdStr 
						+  '&#13;'+(spellObj.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+ spellObj.dB +'|'+ (trueName.hyphened()) +'})}}';
			} else {
				content += '...Optionally <span style='+design.grey_button+'>Review choice</span>}}';
			}
					
			content += '{{desc1=2. ';
			if (!isPower && (storeSpells || storeBoth)) {
				content += 'Store '+(spell ? ('**'+spellName+'**') : 'the spell' ) + ' as a ' + (spell ? '[' : ('<span style=' + design.grey_button + '>'))
						+  'stored ' + (!isPR ? 'Wizard' : 'Priest') + ' spell' + (spell ? '](!magic --button ADD_TO_'+lists+'|'+cmdStr+'|&#63;{'+question+'})' : '</span>' );
			}
			if (storePowers || storeBoth) {
				content += ((!isPower && storeBoth ? ' or ' : '') + 'Store '+(storeBoth ? 'it' : (spell ? ('**'+spellName+'**') : 'the spell'))+' '
						+   (spell ? '[' : '<span style=' + design.grey_button + '>')+'as a Power'+(spell ? '](!magic --button ADD_PWR_TO_'+lists+'|'+cmdStr+'|&#63;{Cast how many per day &#40;-1 means unlimited&#41;?}|&#63;{'+question+'})' : '</span>' ));
			}
			if (storedSelected) {
				content += ' or '+(spell ? '[' : '<span style=' + design.grey_button + '>')+'Remove '+(spell ? spellName+'](!magic --button DEL_'+(storePowers ? 'PWR_FROM_' : '')+lists+'|'+cmdStr+')' : 'the spell</span>' );
			}

					content += '}}{{desc2=3. Choose and Store more spells or\n';
			if (isPower) {
				content += 'go to [Wizard](!magic --store-spells '+tokenID+'|'+item+'|MU-ALL|1|'+retMenu+') or [Priest](!magic --store-spells '+tokenID+'|'+item+'|PR-ALL|1|'+retMenu+') spells';
			} else if (isMU) {
				content += 'go to [Level '+(level < 9 ? level+1 : 1)+'](!magic --store-spells '+tokenID+'|'+item+'|MUSPELLS'+(storeBoth?'-ALL':'')+'|'+(level < 9 ? level+1 : 1)+'|'+retMenu+') or go to [Priest](!magic --store-spells '+tokenID+'|'+item+'|PRSPELLS'+(storeBoth?'-ALL':'')+'|1|'+retMenu+') spells'+(!storeBoth && !storePowers ? '' : (' or go to [Powers](!magic --store-spells '+tokenID+'|'+item+'|POWERS-ALL|1|'+retMenu+')'));
			} else if (isPR) {
				content += 'go to [Level '+(level < 7 ? level+1 : 1)+'](!magic --store-spells '+tokenID+'|'+item+'|PRSPELLS'+(storeBoth?'-ALL':'')+'|'+(level < 7 ? level+1 : 1)+'|'+retMenu+') or go to [Wizard](!magic --store-spells '+tokenID+'|'+item+'|MUSPELLS'+(storeBoth?'-ALL':'')+'|1|'+retMenu+') spells'+(!storeBoth && !storePowers ? '' : (' or go to [Powers](!magic --store-spells '+tokenID+'|'+item+'|POWERS-ALL|1|'+retMenu+')'));
			}
			if (retMenu !== 'VIEW-ITEM') {
				content += ' or\n[Return to Add Items Menu](!magic --gm-edit-mi '+tokenID+')';
			} else {
				let miObj = getAbility( fields.MagicItemDB, miName, charCS );
				content += ' or\n[Return to '+item+' Description](!&#13;&#47;w gm &#37;{'+miObj.dB+'|'+(miName.hyphened())+'})';
			}
			content += 'or just do something else}}';
			sendFeedback(content,flags.feedbackName,tokenID,charCS);
			return;
		} catch (e) {
			sendCatchError('MagicMaster',msg_orig[senderId],e);
		}
	}
	
// ------------------------------------------------------------ Menu Button Press Handlers --------------------------------------------

	/**
	 * Handle the selection of an option button on a menu,
	 * usually used to set short or long menus.
	 */
	 
	var handleOptionButton = function( args, senderId ) {
		
		var cmd = args[0].toUpperCase(),
			isView = cmd.includes('VIEW'),
			tokenID = args[1],
			optionValue = args[2].toLowerCase(),
			config = getSetPlayerConfig( senderId ) || {};

		if (!['short','long','alpha','full'].includes(optionValue)) {
			sendError( 'Invalid MagicMaster menuType option.' );
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
		case BT.EDITMARTIAL_OPTION:
		case BT.EDITALLITEMS_OPTION:
			config.editBagType = optionValue;
			getSetPlayerConfig( senderId, config );
			makeEditBagMenu( [(cmd == BT.EDITMI_OPTION ? BT.EDIT_MI :(cmd == BT.EDITMARTIAL_OPTION ? BT.EDIT_MARTIAL : BT.EDIT_ALLITEMS)), tokenID, -1, ''], senderId, 'Using '+optionValue+' Edit MI Bag menu' );
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
		case BT.ALPHALIST_OPTION:
			config.alphaLists = optionValue === 'alpha';
			getSetPlayerConfig( senderId, config );
			let menu = (args[3] || '').toUpperCase();
			let msg = 'Using '+(optionValue ?  'alphabeticised' : 'long')+' item lists';
			switch (menu.toUpperCase()) {
			case BT.EDIT_MI:
			case BT.EDIT_MARTIAL:
			case BT.EDIT_ALLITEMS:
				makeEditBagMenu( [menu, tokenID, -1, ''], senderId, msg);
				break;
			case 'GMONLY':
				makeGMonlyMImenu( ['',tokenID,-1,''], senderId, msg, config.alphaLists );
				break;
			default:
				sendError( 'Invalid MagicMaster option. [Show Help](!magic --help)');
				break;
			}
			break;
		default:
			sendError( 'Invalid MagicMaster option. [Show Help](!magic --help)');
			break;
		};
		return;
	}
	
	/**
	 * Handle specification of a different number of Misc spells 
	 */
	 
	var handleSetMiscSpell = function( args, senderId ) {
		
		var tokenID = args[1],
			spellClass = args[2],
			level = args[3],
			noSpells = args[4] || 0,
			charCS = getCharacter(tokenID);
		
		if (spellClass == 'MU') {
			setAttr( charCS, [fields.MUSpellNo_table[0] + level + fields.MUSpellNo_misc[0],fields.MUSpellNo_misc[1]], noSpells );
		} else {
			setAttr( charCS, [fields.PRSpellNo_table[0] + level + fields.PRSpellNo_misc[0],fields.PRSpellNo_misc[1]], noSpells );
		}
		args = [args[5],args[1],args[3],-1,-1,'',1];
		makeManageSpellsMenu( args, senderId, 'Modified misc = '+noSpells );
		return;
	}

	/**
	* Handle the results of pressing a spell-selection button
	* or a power-selection button
	**/
	
	var handleChooseSpell = function( args, senderId ) {
		
		if (args[3].length == 0 || isNaN(args[3]) || args[4].length == 0 || isNaN(args[4])) {
			sendDebug('handleChooseSpell: invalid row or column');
			sendError('Internal MagicMaster error');
		}

		if (args[0] == BT.MI_SPELL || args[0].toUpperCase().includes('POWER')) {
			var charCS = getCharacter(args[1]),
				storedLevel = attrLookup( charCS, fields.Spells_storedLevel, fields.Spells_table, args[3], args[4] );
			if (storedLevel && storedLevel > 0) {
				setAttr( charCS, fields.CastingLevel, storedLevel );
				setAttr( charCS, fields.MU_CastingLevel, storedLevel );
				setAttr( charCS, fields.PR_CastingLevel, storedLevel );
			}
		}
	
		makeCastSpellMenu( args, senderId );
		return;
				
	}
	
	/**
	 * Handle a selected spell being cast
	 */
 
	var handleCastSpell = function( args, senderId ) {
		
		const setValue = (...a) => libRPGMaster.setAttr(...a);
		
		var tokenID = args[1],
			rowIndex = args[3],
			colIndex = args[4],
			charCS = getCharacter(tokenID),
			db, action,
			delScrollSpell = function ( charCS, spellName, scrollName, nameField, valueField ) {
				spellName = spellName.dbName();
				scrollName = scrollName.replace(/\s/g,'-');
				var muSpellList = (attrLookup( charCS, [nameField[0]+scrollName, nameField[1]] ) || '').split(','),
					nameIndex = _.findIndex( muSpellList, e => e.dbName() == spellName );
				if (nameIndex >= 0) {
					muSpellList.splice( nameIndex, 1 );
					setValue( charCS, [nameField[0]+scrollName, nameField[1]], muSpellList.join(',') );
					muSpellList = (attrLookup( charCS, [valueField[0]+scrollName, valueField[1]] ) || '').split(',');
					muSpellList.splice( nameIndex, 1 );
					setValue( charCS, [valueField[0]+scrollName, valueField[1]], muSpellList.join(',') );
				}
				return !muSpellList.filter(t => t.length).length;
			};
			
		if (!charCS) {
			sendDebug('handleCastSpell: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		if (args[3].length == 0 || isNaN(args[3]) || args[4].length == 0 || isNaN(args[4])) {
			sendDebug('handleCastSpell: invalid row or column');
			sendError('Internal MagicMaster error');
		}
		
		var oldVer = 2.1 > csVer(charCS),
			spellTables = getTable( charCS, fieldGroups.SPELLS, colIndex ),
			spellName = spellTables.tableLookup( fields.Spells_name, rowIndex ).hyphened(),
			spellMsg = spellTables.tableLookup( (oldVer ? fields.Spells_macro : fields.Spells_msg), rowIndex ),
			charName = charCS.get('name'),
			absorb = false,
			miName = '',
			miRowRef;
			
		switch (args[0].toUpperCase()) {
		case BT.CAST_MIPOWER:
			miName = attrLookup( charCS, fields.ItemChosen );
		case BT.USE_POWER:
			db = spellTables.tableLookup( fields.Spells_db, rowIndex );
			if (!db || db == spellName) {
				db = findPower( charCS, spellName ).dB;
				spellTables = spellTables.tableSet( fields.Spells_db, rowIndex, db );
			}
			action = 'using';
			break;
		case BT.CAST_MUSPELL:
			db = fields.MU_SpellsDB;
			action = 'casting';
			absorb = args[5] === 'true';
			break;
		case BT.CAST_PRSPELL:
			db = fields.PR_SpellsDB;
			action = 'casting';
			absorb = args[5] === 'true';
			break;
		case BT.CAST_SCROLL:
		case BT.CAST_MISPELL:
			db = spellTables.tableLookup( fields.Spells_db, rowIndex );
			miName = attrLookup( charCS, fields.ItemChosen );
			action = 'using their magic item to cast';
			spellMsg = '';
			break;
		}
		
		var	spell = getAbility( db, spellName, charCS ),
			spellCost = ((!!spell.ct && ((args[0] == BT.CAST_MUSPELL) || (args[0] == BT.CAST_PRSPELL))) ? spell.obj[1].cost : 0),
			totalLeft,
			content,
			spellValue = parseInt((spellTables.tableLookup( fields.Spells_castValue, rowIndex )),10);
			
		setValue( charCS, fields.SpellToMem, spellName );
		setValue( charCS, fields.Expenditure, spellCost );
		setValue( charCS, fields.SpellRowRef, rowIndex );
		setValue( charCS, fields.SpellColIndex, colIndex );
		
		if (absorb) {
			let level = (parseInt(spell.obj[1].type.match(/\d+/)) || 0),
				itemRow = parseInt(attrLookup( charCS, fields.ItemRowRef ));
			if (isNaN(itemRow)) {
				let Items = getTable( charCS, fieldGroups.MI );
				itemRow = parseInt(Items.tableFind( fields.Items_name, miName ));
			};
			if (!isNaN(itemRow)) {
				Items = Items.tableSet( fields.Items_qty, itemRow, Math.max(parseInt(Items.tableLookup( fields.Items_qty, itemRow ) || 0)-level,0) );
				Items = Items.tableSet( fields.Items_trueQty, itemRow, Math.max(parseInt(Items.tableLookup( fields.Items_trueQty, itemRow ) || 0)-level,0) );
			}
		} else if (spellValue != 0) {
			
			if (apiCommands.attk && apiCommands.attk.exists && spell.obj[1].body.match(/}}\s*tohitdata\s*=\s*\[.*?\]/im)) {
				sendAPI(fields.attackMaster+' '+senderId+' --weapon '+tokenID+'|Take '+spellName+' in-hand as a weapon and then Attack with it||'+miName);
			} else {
				if (spellValue > 0) spellValue--;
				spellTables.tableSet( fields.Spells_castValue, rowIndex, spellValue );
			}
		}
		setValue( charCS, fields.SpellCharges, spellValue );
		if (args[0] == BT.CAST_SCROLL && spellValue == 0) {
			spellTables.addTableRow( rowIndex );	// Blanks this table row
			if (delScrollSpell( charCS, spellName, miName, fields.ItemMUspellsList, fields.ItemMUspellValues ) &&
				delScrollSpell( charCS, spellName, miName, fields.ItemPRspellsList, fields.ItemPRspellValues )) {
				if (!_.isUndefined(miRowRef = attrLookup( charCS, fields.ItemRowRef ))) {
					getTable( charCS, fieldGroups.MI ).addTableRow( miRowRef );	// Blanks this table row
				}
			}
		}
		
		if (spellMsg.length > 0) {
			sendResponse( charCS, spellMsg, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		}
		
		totalLeft = spendMoney( charCS, spellCost );
		content = charName + ' is '+action+' [' + spellName.dispName() + '](!&#13;&#47;w gm &#37;{'+spell.dB+'|'+(spellName.hyphened())+'})'
				+ (parseInt(spellCost || 0) ? (' at a cost of [[' + spellCost + ']]GP (leaving [[' + totalLeft + ']]GP).') : '')
				+ '  Select ' + charName + '\'s token before pressing to see effects.';
		sendFeedback( content, flags.feedbackName, flags.feedbackImg, tokenID, charCS );

		return;
	}
	
	/*
	 * Handle targeting the effects of a spell
	 * Moved to RoundMaster to allow passing of the PlayerID
	 */
	 
	var handleSpellTargeting = function( args, isGM ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			tokenName,
			thac0,
			strHitBonus,
			content,
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleSpellTargeting: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		if (!apiCommands.rounds || !apiCommands.rounds.exists) {
			sendError('RoundMaster API must be loaded for spell targeting to work');
			return;
		}
		
		args.shift();
		tokenName = curToken.get('name');
		thac0 = getTokenValue( curToken, fields.Token_thac0, fields.Thac0_base, fields.MonsterThac0, fields.Thac0_base ).val || 20;
		strHitBonus = attrLookup( charCS, fields.Strength_hit ) || 0;
		content = (isGM ? '/w gm ' : '')+'&{template:'+fields.menuTemplate+'}{{name=Try to Touch Target}}'
				+ '{{desc=**'+tokenName+' hits AC [[( ([['+thac0+']][Thac0]) - ([['+strHitBonus+']][Strength bonus]) - [[1d20]][Dice Roll] )]] with their spell.**}}'
				+ '{{desc1=If hit, [Cast on them](!rounds --target SINGLE|'+tokenID+'|&#64;{target|Who to Attack with this spell?|token_id}|'+args.join('|')+')}}';
		setAbility( charCS, 'To-Hit-Spell', content );
		return;
		
	}
	
	/*
	 * Handle redisplaying the manage spells menu
	 * Used when selecting a spell or slot to memorise,
	 * or when changing level of spell to memorise.
	 */
	 
	var handleRedisplayManageSpells = function( args, senderId ) {
		
		var isPower = args[0].toUpperCase().includes('POWER'),
			msg = '',
			name = getObj('graphic',args[1]).get('name');
		
		if (args[3] > 0 && args[4] > 0 && (!args[5] || !args[5].length)) {
			args[5] = attrLookup( getCharacter(args[1]), fields.Spells_name, fields.Spells_table, args[3], args[4] );
		}

		// Check this is a spell that is of a school that can be memorised
		if (isPower ? !checkValidPower( args, senderId ) : !checkValidSpell( args )) {
			msg=isPower ? ('**Warning:** '+name+' has not gained experience enough to use '+args[5]+' as a granted power')
						: ('**Warning:** '+args[5]+' is not of a school or sphere '+name+' can use');
			args[5] = '';
		} else {
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
		}
		makeManageSpellsMenu( args, senderId, msg );
		return;
	}
	
	/*
	 * Review a chosen spell description
	 */
	 
	var handleReviewSpell = function( args, senderId ) {
		
		var cmd = args[0].toUpperCase(),
			isMU = cmd.includes('MU'),
			isPR = cmd.includes('PR'),
			isMI = cmd.includes('MI'),
			isPower = cmd.includes('POWER'),
			isSpell = cmd.includes('SPELL'),
			isView = !cmd.includes('REVIEW'),
			isGM = args[0].includes('GM'),
			tokenID = args[1],
			followOn,
			msg,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleReviewSpell: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		if (isMI) {
			if (isGM) {
				followOn = 'GM-MImenu';
			} else if (isPower) {
				followOn = (isView ? BT.VIEWMEM_MI_POWERS : BT.EDIT_MIPOWERS);
			} else if (isMU) {
				followOn = (isView ? BT.VIEWMEM_MI_MUSPELLS : BT.EDIT_MIMUSPELLS);
			} else if (isPR) {
				followOn = (isView ? BT.VIEWMEM_MI_PRSPELLS : BT.EDIT_MIPRSPELLS);
			} else if (isSpell) {
				followOn = (isView ? BT.VIEWMEM_MI_SPELLS : BT.EDIT_MIMUSPELLS);
			} else {
				followOn = (isView ? BT.VIEW_MI : (args[0].includes('MARTIAL') ? BT.CHOOSE_MARTIAL_MI : (args[0].includes('ALLITEMS') ? BT.CHOOSE_ALLITEMS_MI : BT.CHOOSE_MI)));
			}
		} else if (isPower) {
			followOn = (isView ? BT.VIEWMEM_POWERS : BT.EDIT_POWERS);
		} else if (isMU) {
			followOn = (isView ? BT.VIEWMEM_MUSPELLS : BT.EDIT_MUSPELLS);
		} else {
			followOn = (isView ? BT.VIEWMEM_PRSPELLS : BT.EDIT_PRSPELLS);
		}
		
		args[0] = followOn;
		msg = '[Return to menu](!magic --button '+args.join('|')+')';
		setTimeout(() => sendResponse( charCS, msg, senderId, flags.feedbackName, flags.feedbackImg, tokenID ),500);
		return;
	}
	
	/*
	 * Handle learning a spell from a spellbook or scroll
	 */
	 
	var handleLearnSpell = function( args, senderId ) {
		
		var cmd = (args[0] || ''),
			tokenID = args[1],
			spell = (args[2] || ''),
			learnt = cmd.toUpperCase().includes('LEARNT'),
			charCS = getCharacter(tokenID),
			spellObj,spellData,level;
			
		spellObj = abilityLookup( fields.MU_SpellsDB, spell, charCS );
		if (!spellObj.obj) {
			sendError('The spell '+spell+' has not been found in any database.',msg_orig[senderId]);
			return;
		}
		spellData = parseData((spellObj.data()[0][0] || {}),reSpellSpecs);
		level = spellData.level;
		if (!level || level < 1 || level > 9) {
			sendError('The spell '+spell+' is of an unrecognised level '+level,msg_orig[senderId]);
			return;
		}
		
		var content = '&{template:RPGMdefault}{{name=Add spell to '+charCS.get('name')+'\'s spellbook}}{{desc=',
			name = getObj('graphic',tokenID).get('name'),
			spellbook = [fields.Spellbook[0]+spellLevels.mu[level].book,fields.Spellbook[1]],
			curList = (attrLookup(charCS,spellbook) || ''),
			saveObj = saveFormat.Checks.Learn_Spell,
			save = parseInt(attrLookup( charCS, saveObj.save ) || 0),
			saveMod = parseInt(attrLookup( charCS, saveObj.mod ) || 0),
			saveAdj = parseInt(attrLookup( charCS, fields.Magic_saveAdj ) || 0),
			saveSpec = checkValidSpell( ['MU',tokenID,'','','',spell] ),
			specMod = saveSpec > 2 ? 15 : (saveSpec > 1 ? -15 : 0),
			learnChance = Math.max(5,Math.min((save-saveMod-saveAdj+specMod),99));
			
		if (!saveSpec) {
			content += 'The spell '+spell+' is of a school and/or level that '+name+' cannot learn!';
		} else if (curList.toLowerCase().includes(spell.toLowerCase())) {
			content += 'The spell '+spell+' is already in '+charCS.get('name')+'\'s spellbook';
		} else if (!learnt) {
			args.shift();
			let checkMacro = '&{template:RPGMdefault}{{name='+name+' Check vs Learn Spell}}{{Check Throw=Rolling [[?{Learn Spell roll|'+saveObj.roll+'}cf<'+(learnChance-1)+'cs>'+learnChance+']] vs. [[0+'+learnChance+']] target}}{{Result=Check Throw<='+learnChance+'}}{{desc=**'+name+'\'s target**[[0+'+save+']] base save vs. Learn_Spell with [[0+'+specMod+']] change from specialism, [[0+'+saveMod+']] improvement from race, class & Magic Items, and [[0+'+saveAdj+']] improvement from current magic effects}}{{successcmd=!magic --button '+BT.LEARNT_MUSPELL+'|'+args.join('|')+'}}';
			setAbility(charCS,'Do-not-use-Learn_Spell-save',checkMacro);
			content += 'Can you learn the spell "'+spell+'"? [Assess your chance](~'+charCS.get('name')+'|Do-not-use-Learn_Spell-save)';
		} else {
			setAttr(charCS,spellbook,((curList+'|'+spell).split('|').sort().join('|')));
			content += 'The spell '+spell+' has been added to '+charCS.get('name')+'\'s spellbook.';
		}
		content += '}}';
		sendResponse(charCS,content,senderId);
		return;
	};
			
			
	
	/*
	 * Return to the spell storing menu after a review
	 */
	 
	var handleRevStore = function( args, senderId ) {	
		let cmd = args.shift().toUpperCase();
		setTimeout( () => sendFeedback( ('[Return to menu](!magic --button '+cmd.replace('REVIEW','CHOOSE')+'|'+args.join('|')+')'), flags.feedbackName ), 500);
	}
	
	/*
	 * Handle memorising a selected spell in a selected slot
	 */
	 
	var handleMemoriseSpell = function( args, senderId ) {
		
		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isPower = args[0].toUpperCase().includes('POWER'),
			isAll = args[0].toUpperCase().includes('ALL'),
			tokenID = args[1],
			level = args[2],
			row = args[3],
			col = args[4],
			spellName = args[5],
			noToMemorise = parseInt((args[6]),10),
			castAsLvl = parseInt((args[7]),10),
			dbCS,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleMemoriseSpell: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		if (args[3].length == 0 || isNaN(args[3]) || args[4].length == 0 || isNaN(args[4])) {
			sendDebug('handleMemoriseSpell: invalid row or column');
			sendError('Internal MagicMaster error');
		}

		if (isNaN(noToMemorise)) {
			sendResponse(charCS, 'You must specify the number of uses as a number', senderId, flags.feedbackName, flags.feedbackImg, tokenID);
			return;
		}
		
		var rootDB = isPower ? fields.PowersDB : (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB),
			spellTables = getTable( charCS, (isPower ? fieldGroups.POWERS : fieldGroups.SPELLS), col ),
			base = spellLevels[(isPower ? (isMI ? 'pm' : 'pw') : (isMI ? 'mi' : (isMU ? 'mu' : 'pr')))][level].base,
			altSpellTable;
			
		if (!isPower) {
			altSpellTable = getLvlTable( charCS, (isMU ? fieldGroups.ALTWIZ : fieldGroups.ALTPRI), level );
		} else if (fields.GameVersion === 'AD&D1e') {
			altSpellTable = getLvlTable( charCS, fieldGroups.ALTPWR );
		};
			
		spellTables = setSpell( charCS, spellTables, altSpellTable, rootDB, spellName, row, col-base, level, undefined, '', [noToMemorise,(isPower ? 0 : noToMemorise)], castAsLvl );
		
		if (isMI && isPower) {
			setAttr( charCS, ['power-'+spellName, 'current'], row );
			setAttr( charCS, ['power-'+spellName, 'max'], col );
		}
		
		var hand = spellTables.tableLookup( fields.Spells_equip, row );
		
		if (spellTables.tableLookup( fields.Spells_weapon, row ) === '1' && (hand)) {
			sendAPI(fields.attackMaster+' --button '+(hand==='2'?BT.BOTH:(hand==='1'?BT.LEFT:(hand==='0'?BT.RIGHT:BT.HAND)))+'|'+tokenID+'|'+row+':'+col+'|'+hand);
		}
		
		if (!isAll) {
			args[3] = -1;
			args[4] = -1;
			args[5] = '';
			args[6] = 1;
			makeManageSpellsMenu( args, senderId, 'Memorised '+spellName );
		}
		return;
	}
	
	/*
	 * Handle memorising all currently valid powers at once
	 */
	 
	async function handleMemAllPowers( args, senderId, silent=false ) {
		
		var cmd = args[0],
			isMU = cmd.toUpperCase().includes('MU'),
			isPower = cmd.toUpperCase().includes('POWER'),
			tokenID = args[1],
			charCS = getCharacter( tokenID ),
			spellTables = [],
			db, type, txt, name, levelSpells;
			
		var memSpell = function(args,charCS,db,isPower,list,i,r,c,senderId) {
			
			return new Promise(resolve => {
				var spellDef, clv = false;
				try {
					for (let j=list.length; j > 0 && !clv; j--) {
						let k = (randomInteger(list.length)-1);
						spellDef = isPower ? findPower( charCS, list.shift() ) : abilityLookup( db, list[k] );
						if (spellDef.obj) {
							args[5] = spellDef.obj[1].name;
							clv = isPower ? checkValidPower( args, senderId ) : (checkValidSpell( args, senderId ) ? i : 0);
							if (!clv && !isPower) list.splice(k,1);
						};
					};
					if (clv) {
						let newArgs = [args[0],args[1],i,r,c,spellDef.obj[1].name,(isPower ? getUsesPerDay(charCS,spellDef.obj[1].name,senderId) : 1),clv];
						handleMemoriseSpell( newArgs, senderId );
					};
				} catch (e) {
					log('MagicMaster memSpell: JavaScript '+e.name+': '+e.message+' while processing sheet '+charCS.get('name'));
					sendDebug('MagicMaster memSpell: JavaScript '+e.name+': '+e.message+' while processing sheet '+charCS.get('name'));
					sendCatchError('MagicMaster',msg_orig[senderId],e);
				} finally {
					setTimeout(() => {
						resolve([list,(clv ? spellDef.obj[1].name : ''),clv]);
					}, 20);
				}
			});
		}

		if (!charCS) return;
		
		if (isPower) {
			type = 'POWER';
			db = fields.PowersDB;
			txt = 'powers';
		} else if (isMU) {
			type = 'MU';
			db = fields.MU_SpellsDB;
			txt = 'wizard spells';
		} else {
			type = 'PR';
			db = fields.PR_SpellsDB;
			txt = 'priest spells';
		}
		levelSpells = shapeSpellbook( charCS, type );
		for (let i = 1; i < levelSpells.length; i++) {
			let r = 0;
			let storeList = false;
			let newList = [];
			let list = (attrLookup(charCS, [fields.Spellbook[0]+levelSpells[i].book, fields.Spellbook[1] ]) || '').split('|').filter(t=>!!t);
			let s = (isPower) ? list.length : levelSpells[i].spells;
			if (s > 0 && (!list || !list.join('').length || list.join('') == '-')) {
				list = _.uniq(getMagicList( db, spTypeLists, (isPower ? 'power' : (isMU ? 'muspelll'+i : 'prspelll'+i)), senderId ).toLowerCase().split(/\,|\|/));
				storeList = true;
			};
			let c = levelSpells[i].base;
			let cellExists = true;
			while (s > 0 || cellExists) {
				c = levelSpells[i].base;
				for (let w = 1; (w <= fields.SpellsCols); w++) {
					let castAsLevel = false;
					if (!spellTables[w]) {
						spellTables[w] = getTable( charCS, fieldGroups.SPELLS, c );
					}
					cellExists = !!spellTables[w].tableLookup( fields.Spells_name, r, false );
					if (s <= 0 && !cellExists) break;
					spellTables[w].addTableRow( r );
					if (s > 0){
						[list,name,castAsLevel] = await memSpell(args,charCS,db,isPower,list,i,r,c,senderId);
						if (castAsLevel && storeList) newList.push(name);
					};
					c++;
					s--;
				}
				r++;
			};
			if (storeList) setAttr( charCS, [fields.Spellbook[0]+levelSpells[i].book, fields.Spellbook[1] ], _.uniq(newList.sort()).join('|'));
			spellTables = [];
		};
		if (silent) {
			sendWait(senderId,0);
			return;
		}
		
		args[3] = -1;
		args[4] = -1;
		args[5] = '';
		args[6] = 1;
		
		makeManageSpellsMenu( args, senderId, 'Memorised all valid '+txt );
		return;
	}
	
	/*
	 * Handle a level change request
	 */
	 
	var handleLevelDrain = function( args, senderId, msg = '' ) {
		
		var tokenID = args[0],
			drainLevels = parseInt(args[1]) || -1,
			fixedClass = args[6] || '',
			classChosen = args[2] || fixedClass,
			totalLevels = parseInt(args[3]) || drainLevels,
			hitPoints = Math.abs(parseInt(args[4]) || 0),
			totalHP = parseInt(args[5]) || 0,
			loopCount = Math.abs(drainLevels),
			charCS = getCharacter(tokenID),
			increment = drainLevels > 0 ? 1 : -1,
			classes = classObjects( charCS, senderId ),
			levelField, hd;
			
		if (classes && classes.length === 1) {
			classChosen = classes[0].base;
			if (!hitPoints) {
				hitPoints = evalAttr(classes[0].classData.hd.replace(/(\d+)(d.+)/i,'(('+String(drainLevels)+'*$1)$2)'));
				loopCount = 1;
			}
		}
		if (!classChosen) {
			makeLevelDrainMenu( args, classes, senderId, msg, totalHP );
			return;
		}
		switch (classChosen.toLowerCase()) {
		case 'wizard':
			levelField = fields.Wizard_level;
			break;
		case 'priest':
			levelField = fields.Priest_level;
			break;
		case 'rogue':
			levelField = fields.Rogue_level;
			break;
		case 'psion':
			levelField = fields.Psion_level;
			break;
		default:
			levelField = fields.Fighter_level;
			if (!attrLookup( charCS, levelField )) {
				levelField = fields.Monster_hitDice;
			}
		}
		setAttr( charCS, levelField, Math.max(0,((parseInt(attrLookup( charCS, levelField ) || 1) || 1) + increment)) );
		setAttr( charCS, fields.HP,((parseInt(attrLookup( charCS, fields.HP ) || 0) || 0) + (hitPoints * increment)) );
		setAttr( charCS, fields.MaxHP, Math.max(0,((parseInt(attrLookup( charCS, fields.MaxHP ) || 0) || 0) + (hitPoints * increment))) );
		totalHP += hitPoints;
		if (--loopCount > 0) {
			handleLevelDrain( [tokenID,(drainLevels-increment),'',totalLevels,0,totalHP,fixedClass], senderId, 'Successfully '+(increment > 0 ? 'boosted' : 'drained')+' '+classChosen+' class by 1 level' );
		} else {
			handleMemAllPowers( [BT.MEMALL_POWERS,tokenID,1,-1,-1,'',''], senderId, true );
			handleCheckWeapons( tokenID, charCS );
			handleCheckSaves( null, null, [getObj('graphic',tokenID)], true );
			let content = '&{template:'+fields.warningTemplate+'}{{title=Change in Level}}{{desc=Successfully '+(increment > 0 ? 'boosted' : 'drained')+' '+classChosen
						+ ' class by '+(fixedClass ? (totalLevels+' levels') : ('one level, which in total makes '+totalLevels+' across all classes'))
						+ ', and recalculated all saves, reassessed all weapon use and reset usable powers.'
						+ ' A total of '+totalHP+'HP have been '+(increment > 0 ? 'gained' : 'lost')+'}}';
			sendResponse( charCS, content );
		}
	}
	
	/*
	 * Handle undertaking a short rest to recover 1st level spells
	 */
	 
	var handleRest = function( args, senderId ) {
		
		var tokenID = args[0],
			isShort = args[1].toLowerCase().includes('short'),
			casterType = (args[2] || 'MU+PR').toUpperCase(),
			r, c, w,
			col, rep;
			
		if (casterType.includes('MI') && casterType.includes('POWER')) {
			return;
		}

		var isMU = casterType.includes('MU'),
			isPR = casterType.includes('PR'),
			isMI = !isShort,
			isPower = !isShort,
			isMIPower = !isShort,
			charCS = getCharacter(tokenID);
			
		updateCharSheets( args, senderId );

		if (!charCS) {
			sendDebug('handleRest: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var levelSpells,
			level,
			levelLimit,
			restType,
			powerQty,
			valueObj,
			spellTables = [];
		
		while (isMU || isPR || isPower || isMIPower) {
			restType = (isMIPower ? 'MIPOWER' : (isPower ? 'POWER' : (isMU ? 'MU' : 'PR' )));
			levelSpells = shapeSpellbook( charCS, restType );
			level = 1;
			levelLimit = isShort ? 2 : levelSpells.length;
			
			while (level < levelLimit && levelSpells[level].spells > 0) {
				r = 0;
				while (levelSpells[level].spells > 0) {
					c = levelSpells[level].base;
					for (w = 1; (w <= fields.SpellsCols) && (levelSpells[level].spells > 0); w++) {
						if (_.isUndefined(spellTables[w])) {
							spellTables[w] = {};
						}
						if (_.isUndefined(spellTables[w][fields.Spells_castValue[0]])) {
							spellTables[w] = getTableField( charCS, spellTables[w], fields.Spells_table, fields.Spells_castValue, c );
						}
						valueObj = spellTables[w].tableLookup( fields.Spells_castValue, r, true, true );
						if (!valueObj) {
							levelSpells[level].spells = 0;
							break;
						}
						if (restType.includes('POWER')) {
							if (_.isUndefined(spellTables[w][fields.Spells_castMax[0]])) {
								spellTables[w] = getTableField( charCS, spellTables[w], fields.Spells_table, fields.Spells_castMax, c, 0 );
							}
							valueObj.set( fields.Spells_castValue[1], spellTables[w].tableLookup( fields.Spells_castMax, r ));
						} else {
							valueObj.set( fields.Spells_castValue[1], 1 );
						}
						c++;
						levelSpells[level].spells--;
					}
					r++;
				}
				spellTables = [];
				level++;
			}

			switch (restType.toUpperCase()) {
			case 'MIPOWER':
				isMIPower = false;
				break;
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
			let miBase = fields.Items_table[1],
				MagicItems = getTable( charCS, fieldGroups.MI );
				
			for (r = miBase; r < (MagicItems.sortKeys.length+miBase); r++) {
				let miSpeedObj = MagicItems.tableLookup( fields.Items_speed, r, true, true ),
					miQtyObj = MagicItems.tableLookup( fields.Items_qty, r, true, true ),
					miTrueName = MagicItems.tableLookup( fields.Items_trueName, r ),
					miType = MagicItems.tableLookup( fields.Items_type, r ),
					miReveal = MagicItems.tableLookup( fields.Items_reveal, r ).toLowerCase(),
					ItemSpecs = abilityLookup( fields.MagicItemDB, miTrueName, charCS );
				if (_.isUndefined(miSpeedObj) || _.isUndefined(miQtyObj)) {break;}
				if (miTrueName && miTrueName != '-') {
					if (miReveal == 'rest') {
						MagicItems = MagicItems.tableSet( fields.Items_name, r, miTrueName );
						MagicItems = MagicItems.tableSet( fields.Items_type, MIrowref, MagicItems.tableLookup( fields.Items_trueType, MIrowref ));
						MagicItems = MagicItems.tableSet( fields.Items_reveal, r, '' );
					}
					if (ItemSpecs.obj && ItemSpecs.obj[1] && !miType.toLowerCase().includes('recharging') && (/{{ammo=/i.test(ItemSpecs.obj[1].body))) {
						miQtyObj.set('max',(miQtyObj.get('current')||0));
					} else if (!miType.toLowerCase().includes('absorbing')) {
						miQtyObj.set('current',(miQtyObj.get('max')||0));
					}
					miSpeedObj.set('current',(miSpeedObj.get('max')||5));
				}
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
		var charDay = parseInt((attrLookup( charCS, fields.CharDay ) || 0),10) + timeSpent,
			today = parseInt((state.moneyMaster.inGameDay || 0),10),
			globalDay = Math.max( today, charDay );
			
		setAttr( charCS, fields.CharDay, globalDay );

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

	var handleViewUseMI = function( args, isSilent, senderId, charges, chargeOverride='' ) {
		
		var action = args[0].toUpperCase(),
			tokenID = args[1],
			MIrowref = parseInt(args[2],10),
			charCS = getCharacter(tokenID),
			inHand, inHandRow, content, miData;
			
		if (!charCS) {
			sendDebug('handleViewUseMI: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var	MItables = getTable( charCS, fieldGroups.MI ),
			MIname = MItables.tableLookup( fields.Items_name, MIrowref ),
			MItrueName = MItables.tableLookup( fields.Items_trueName, MIrowref ),
			MIreveal = MItables.tableLookup( fields.Items_reveal, MIrowref ).toLowerCase();
			
		setAttr( charCS, fields.ItemChosen, MIname );
		setAttr( charCS, fields.ItemRowRef, MIrowref );

		if (action.includes('VIEW')) {
			if (MIreveal == 'view') {
				MIname = MItables.tableLookup( fields.Items_trueName, MIrowref );
				MItables = MItables.tableSet( fields.Items_name, MIrowref, MIname );
				MItables = MItables.tableSet( fields.Items_type, MIrowref, MItables.tableLookup( fields.Items_trueType, MIrowref ));
				MItables = MItables.tableSet( fields.Items_reveal, MIrowref, '' );
			}
			content = '[Return to menu](!magic --button '+BT.CHOOSE_VIEW_MI+'|'+args[1]+'|'+args[2]+')';
			setTimeout(() => sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID ),500);
			checkForBag( charCS, MItrueName, MIrowref );
			return;
		}
		if (isNaN(MIrowref) || (fields.Items_table[1] == 0 && MIrowref < 0)) {
			sendDebug('handleViewUseMI: invalid MIrowref parameter is '+MIrowref);
			sendError('Internal MagicMaster error');
			return;
		}
			
		var charName = charCS.get('name'),
			MIqtyObj = MItables.tableLookup( fields.Items_qty, MIrowref, false, true ),
			MIqty = MIqtyObj.get(fields.Items_qty[1]),
			MImaxQty = MIqtyObj.get(fields.Items_trueQty[1]),
			MItype = chargeOverride || MItables.tableLookup( fields.Items_trueType, MIrowref, 'uncharged' ).toLowerCase(),
			MIdb = getAbility( fields.MagicItemDB, MIname, charCS, null, null, null, MIrowref ),
			MIchangeTo = '',
			MIcVal = 1;
			
		if (MIdb.obj) {
			miData = resolveData( MIname, fields.MagicItemDB, reItemData, charCS, {charges:reSpellSpecs.charges,changeTo:reSpellSpecs.changeTo,zero:reSpellSpecs.zero}, MIrowref ).parsed;
			MIcVal = miData.charges;
			MIchangeTo = miData.changeTo;
		}
		MIcVal = parseInt(MIcVal);
		if (!(_.isUndefined(MIcVal) || isNaN(MIcVal)) && (_.isUndefined(charges) || _.isNull(charges))) {
			charges = MIcVal;
		}
		if (_.isUndefined(charges) || _.isNull(charges)) {
			charges = 1;
		}
		if (MIqty < charges) {
			content = '&{template:'+fields.menuTemplate+'}{{name=Using '+MIname+'}}{{desc='+MIname+' does not have enough charges left to do this}}'
					+'{{desc1=[Show '+MIname+' again](\~'+MIdb.dB+'|'+MIname+') or do something else}}';
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return false;
		}
		
		let item = MIname.replace(/\s/g,'-');
		
		switch (MItype.toLowerCase()) {

		case 'change-each':
		case 'cursed+change-each':
			if (MIchangeTo && MIchangeTo.length && charges > 0) {
				let changeRow = MItables.tableFind( fields.Items_trueName, MIchangeTo );
				if (isNaN(changeRow)) {
					handleStoreMI( ['', tokenID, changeRow, MIchangeTo, charges, 'silent' ], false, senderId );
				} else {
					MItables.tableSet( fields.Items_qty, changeRow, (parseInt(MItables.tableLookup( fields.Items_qty, changeRow ) || 0)+charges) );
					MItables.tableSet( fields.Items_trueQty, changeRow, (parseInt(MItables.tableLookup( fields.Items_trueQty, changeRow ) || 0)+charges) );
				};
			};
		case 'charged':
		case 'perm-charged':
		case 'cursed+charged':
		case 'changing':
		case 'change-last':
		case 'cursed+change-last':
		case 'discharging':
		case 'perm-discharging':
		case 'cursed+discharging':
		case 'rechargeable':
		case 'perm-rechargeable':
		case 'cursed+rechargeable':
			if (MIqty == charges && !MItype.includes('cursed') && !MItype.includes('perm')) {
				if (((MItype.toLowerCase() === 'changing') || (MItype.toLowerCase() === 'change-last')) && MIchangeTo) {
					handleStoreMI( ['',tokenID, MIrowref, MIchangeTo, 0, 'silent' ], false, senderId );
				} else {
					handleRemoveMI( ['',tokenID, MIrowref, MIname], false, senderId, true, false );
				}
			} else {
				MIqtyObj.set('current',(MIqty-charges));
				MIqtyObj.set('max',(MImaxQty-charges));
				addMIspells( charCS, MIdb.obj[1] );
			}
			break;

		case 'selfchargeable':
		case 'cursed+selfchargeable':
			if (MIqty >= charges) {
				MIqtyObj.set('current',(MIqty-charges));
				MIqtyObj.set('max',(MImaxQty-charges));
			}
			if ((MIqty-charges) == 0) {
				sendAPI(fields.attackMaster + ' --blankweapon '+tokenID+'|'+MItrueName+'|silent',senderId);
			}
			break;
			
		case 'recharging':
		case 'cursed+recharging':
		case 'absorbing':
		case 'cursed+absorbing':
			if (MIqty >= charges) {
				MIqtyObj.set('current',(MIqty-charges));
			}
			break;
				
		default:
			charges = 0;
			break;
		}
		
		setAttr( charCS, fields.ItemQty, MIqtyObj.get('current') );
		
		if (MIqty > charges) checkForBag( charCS, MItrueName, MIrowref );
		if ((MIqty - charges == 0) && miData.zero && miData.zero.length) {
			sendAPI( parseStr(miData.zero).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
										   .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'), null, 'magic use-mi');
		}
		if (action.includes('USE') && (MIreveal == 'view' || MIreveal == 'use')) {
			MIname = MItables.tableLookup( fields.Items_trueName, MIrowref );
			MItables = MItables.tableSet( fields.Items_name, MIrowref, MIname );
			MItables = MItables.tableSet( fields.Items_type, MIrowref, MItables.tableLookup( fields.Items_trueType, MIrowref ));
			MItables = MItables.tableSet( fields.Items_reveal, MIrowref, '' );
		}

		if (isSilent) {
			sendWait(senderId,0);
			return true;
		}

		content = '&{template:'+fields.menuTemplate+'}{{name='+charName+' is using '+MIname+'}}'
				+ '{{desc=To see the effects, select '+charName+'\'s token and press ['+MIname+'](!&#13;&#47;w gm &#37;{'+MIdb.dB+'|'+(MIname.hyphened())+'})}}';
		sendFeedback( content, flags.feedbackName, flags.feedbackImg, tokenID, charCS );
		return true;
	}
	
	/*
	 * Handle the selection of a spell to store in
	 * a Magic Item, and the slot in the MI spellbook
	 * to store it in.
	 */
	 
	var handleSelectMIspell = function( args, senderId ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleSelectMIspell: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
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
			spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, spellRow, spellCol ) || '-';
			content += 'Selected '+spellName+' to store';
		}
		if (MIbutton >= 0) {
			col = (fields.SpellsFirstColNum || MIcol != 1) ? MIcol : '';
			spellName = attrLookup( charCS, fields.Spells_name, fields.Spells_table, MIrow, MIcol ) || '-';
			content += (spellButton >= 0 ? '' : 'Selected to store') + ' in the slot for '+spellName;
		}
		makeStoreMIspell( args, senderId, content );
		return;
	}
	
	/*
	 * Handle selecting a magic item power
	 */
	 
	var handleSelectMIpower = function( args, isUse, senderId ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
		if (!charCS) {
			sendDebug('handleSelectMIpower: invalid token_id');
			sendError('Incorrect MagicMaster syntax');
			return;
		}
		
		const dbList = [['PW-',fields.PowersDB],['MU-',fields.MU_SpellsDB],['PR-',fields.PR_SpellsDB],['MI-',fields.MagicItemDB]];
		
		var powerName = args[2] || '',
			itemName = (args[3] || '').split('/'),
			castLevel = args[4],
			charges = parseInt(args[5] || '1'),
			maxChange = parseInt(args[6] || '0'),
			tokenName = getObj('graphic',tokenID).get('name'),
			MIlibrary = charCS,
			powerType = powerName.substring(0,3),
			powerHyphen = powerName.hyphened(),
			itemHyphen, powerObj;
			
		if (_.some(dbList,dB=>dB[0]===powerType.toUpperCase())) {
			powerName = powerName.slice(powerType.length);
			if (!castLevel) castLevel = casterLevel( charCS, powerType.substring(0,2) );
		} else {
			powerType = ''
			if (!castLevel) castLevel = characterLevel( charCS );
		}
			
		for (let i=0; !powerObj && i<itemName.length; i++) {
			itemHyphen = itemName[i].hyphened();
			powerObj = attrLookup( MIlibrary, [fields.MIpowerPrefix[0]+itemHyphen+'-'+powerHyphen, null] );
		};
		if (!powerObj) powerObj = attrLookup( MIlibrary, [fields.MIpowerPrefix[0]+powerHyphen, null] );
		if (!powerObj) {
			sendDebug('handleSelectMIpower: not found item power index attribute for '+itemHyphen+'-'+powerHyphen);
			sendError('Invalid item/power combination');
			return;
		};
			
		var	powerRow = powerObj.get('current'),
			powerCol = powerObj.get('max'),
			magicItem = getAbility( fields.MagicItemDB, itemHyphen, charCS ),
			Powers = getTable( MIlibrary, fieldGroups.POWERS, powerCol ),
			power = Powers.tableLookup( fields.Powers_name, powerRow, '-' ),
			powerDB = Powers.tableLookup( fields.Powers_db, powerRow, '-' ),
			powerCount = Powers.tableLookup( fields.Powers_castValue, powerRow, 0 ),
			toWho = sendToWho(charCS,senderId,false,true),
			content = '',
			powerLib;
			
		if (powerDB != '-' && !powerType) {
			powerLib = abilityLookup( powerDB, power, null, true );
		}
		if (!powerLib || !powerLib.obj) {
			powerLib = findPower( charCS, powerType+power );
		}

		if (!powerLib.obj) {
			sendDebug('handleSelectMIpower: power ability macro not found');
			sendError('Invalid Power definition');
			return;
		}
			
		powerLib = getAbility( powerLib.dB, power, charCS );
		const itemDesc = itemHyphen.replace(/-/g,' '),
			powerDesc = powerName.replace(/-/g,' ');
			
		if (isUse) {
			if (powerCount > 0) {
				if (maxChange) {
					let maxVal = parseInt(Powers.tableLookup( fields.Powers_castMax, powerRow )) - maxChange;
					Powers = Powers.tableSet( fields.Powers_castMax, powerRow, maxVal );
					powerCount = Math.min(maxVal,powerCount-charges)+charges;
				}
				Powers = Powers.tableSet( fields.Powers_castValue, powerRow, powerCount-charges );
			}
			content = charCS.get('name') + ' is using [' + power + '](!&#13;&#47;w gm &#37;{'+powerLib.dB+'|'+(power.hyphened())+'}). '
					+ 'Select ' + charCS.get('name') + '\'s token before pressing to see effects.';
			sendFeedback( content, flags.feedbackName, flags.feedbackImg, tokenID, charCS );
			
		} else if (powerCount == 0) {
			content = '&{template:'+fields.menuTemplate+'}{{name='+itemDesc+'\'s '+powerDesc+' power}}'
					+ '{{desc=You have already used all **'+itemDesc+'\'s** *'+powerDesc+'* charges for today.  '
					+ 'You need to allow '+itemDesc+' to have a long rest so it can regain all its powers}}'
					+ '{{desc1=[Redisplay '+itemDesc+'](~'+magicItem.dB+'|'+itemHyphen+') or just do something else}}';
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		} else {
			setAttr( charCS, fields.SpellToMem, power );
			setAttr( charCS, fields.Casting_name, itemHyphen );
			setAttr( charCS, fields.CastingLevel, castLevel );
			setAttr( charCS, fields.MU_CastingLevel, castLevel );
			setAttr( charCS, fields.PR_CastingLevel, castLevel );
			setAttr( charCS, fields.SpellCharges, (powerCount < 0 ? powerCount : powerCount-charges) );
			
			args.shift();
			content = '&{template:'+fields.menuTemplate+'}{{name='+itemDesc+'\'s '+powerDesc+' power}}'
					+ '{{desc='+tokenName+' is about to use **'+itemDesc+'\'s** '+powerDesc+' power.  Is this correct?}}'
					+ '{{desc1=[Use '+powerDesc+'](!magic --button '+ BT.MI_POWER_USED +'|'+ args.join('|')
					+ '&#13;'+(powerLib.api ? '' : toWho)+'&#37;{'+powerLib.dB +'|'+ (power.hyphened()) +'})'
					+ ' or [Return to '+itemDesc+'](!&#13;'+(magicItem.api ? '' : toWho)+'&#37;{'+magicItem.dB+'|'+itemHyphen+'})\nOr just do something else}}';
			sendResponse(charCS,content,senderId, flags.feedbackName, flags.feedbackImg, tokenID);
		}
		return;
	}
	
	/*
	 * Restore the uses per day of a single power of a magic item 
	 */
	 
	var handleRestoreMIpowers = function( args, senderId ) {
		
		var tokenID = args[0],
			charCS = getCharacter(tokenID);
		if (!charCS) {
			sendDebug('handleRestoreMIpower: invalid token_id');
			sendError('Incorrect MagicMaster syntax');
			return;
		}
		
		var itemName = args[1] || '',
			change = '+-'.includes(args[2][0]),
			charges = parseInt(args[2]),
			powerName = args[3] || '',
			Powers = [],
			itemHyphen = itemName.replace(/\s/g,'-'),
			powersList = (attrLookup( charCS, [fields.ItemPowersList[0]+itemHyphen, fields.ItemPowersList[1]] ) || '').split(','),
			action = ((isNaN(charges) || charges > 0) ? 'regained' : 'used');
			
		if (powerName && powersList.includes(powerName)) {
			powersList = [powerName];
			action += ' its '+powerName+' power';
		} else {
			action += ' all its powers';
		}
		
		_.each(powersList, powerName => {
			
			let	powerHyphen = powerName.replace(/\s/g,'-'),
				powerObj = attrLookup( charCS, [fields.MIpowerPrefix[0]+itemHyphen+'-'+powerHyphen, null] );
			if (!powerObj) powerObj = attrLookup( charCS, [fields.MIpowerPrefix[0]+powerHyphen, null] );
			if (!powerObj) {
				sendDebug('handleRestoreMIpower: not found item power index attribute for '+itemHyphen+'-'+powerHyphen);
				sendError('Invalid item/power combination');
				return;
			};
			
			let	powerRow = powerObj.get('current'),
				powerCol = powerObj.get('max');
				
			if (!Powers[powerCol]) {
				Powers[powerCol] = getTable( charCS, fieldGroups.POWERS, powerCol );
			}

			let	maxCharges = parseInt(Powers[powerCol].tableLookup( fields.Powers_castMax, powerRow, 1 ) || '1'),
				curCharges = parseInt(Powers[powerCol].tableLookup( fields.Powers_castValue, powerRow, 1 ) || '1');
			if (change && maxCharges >= 0 && !isNaN(charges)) {
				Powers[powerCol] = Powers[powerCol].tableSet(fields.Powers_castMax,powerRow,Math.max(0,(charges + maxCharges)));
				Powers[powerCol] = Powers[powerCol].tableSet(fields.Powers_castValue,powerRow,Math.min(curCharges,(charges + maxCharges)));
			} else {
				Powers[powerCol] = Powers[powerCol].tableSet( fields.Powers_castValue, powerRow, (!isNaN(charges) ? charges : maxCharges) );
			}
		});
		
		return;
	}
	
	/*
	 * Handle storing a spell from a characters memorised
	 * spells into a spell-storing magic item.
	 */
	 
	var handleStoreMIspell = function( args, senderId ) {    //split
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleStoreMIspell: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		var isMU = args[0].toUpperCase().includes('MU'),
			isMI = args[0].toUpperCase().includes('MI'),
			isChange = args[0].toUpperCase().includes('ANY') || args[0].toUpperCase().includes('CHANGE'),
			MIbutton = args[2],
			MIrow = args[3],
			MIcol = args[4],
			spellButton = args[5],
			spellRow = args[6],
			spellCol = args[7],
			item = attrLookup( charCS, fields.ItemChosen ) || '-',
			row = attrLookup( charCS, fields.ItemRowRef ) || '',
			itemObj = abilityLookup( fields.MagicItemDB, item, charCS ),
			itemData = parseData((itemObj.data()[0][0] || {}),reSpellSpecs,true,charCS,item,row),
			storeSpells = (itemData.store || 'store').toLowerCase(),
			csv = csVer(charCS),
			msgField = (csv >= 2.1 ? fields.Spells_msg : fields.Spells_macro);
			
		if (isNaN(MIbutton) || MIbutton<0 || isNaN(MIrow) || isNaN(MIcol) || isNaN(spellButton) || spellButton<0 || isNaN(spellRow) || isNaN(spellCol)) {
			sendDebug('handleStoreMIspell: invalid button, row or col parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		isChange = isChange || storeSpells === 'any' || storeSpells === 'change';
			
		var	SpellsTable = getTable( charCS, fieldGroups.SPELLS, spellCol ),
			MIspellsTable = getTable( charCS, fieldGroups.SPELLS, MIcol ),
			spellName = SpellsTable.tableLookup( fields.Spells_name, spellRow ).hyphened(),
			MIspellName = MIspellsTable.tableLookup( msgField, MIrow );
			
		if (!isChange && !stdEqual(spellName, MIspellName )) {
			sendParsedMsg( tokenID, messages.fixedSpell, senderId, getObj('graphic',tokenID).get('name')+'\'s magic item');
			makeStoreMIspell( args, senderId, 'Could not store '+spellName+' in '+getObj('graphic',tokenID).get('name')+'\'s spell storing magic item' );
			return;
		}
		
		var values = MIspellsTable.copyValues(),
			level = attrLookup( charCS, fields.CastingLevel ),
			spellObj = abilityLookup( (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB), spellName, charCS );
			
		if (!spellObj.obj) {
			sendError('Not found spell definition for '+spellName+'. Unable to store this spell');
			return;
		}
		values[fields.Spells_name[0]][fields.Spells_name[1]] = spellName;
		values[fields.Spells_db[0]][fields.Spells_db[1]] = (isMU ? fields.MU_SpellsDB : fields.PR_SpellsDB);
		values[fields.Spells_speed[0]][fields.Spells_speed[1]] = SpellsTable.tableLookup( fields.Spells_speed, spellRow );;
		values[fields.Spells_castValue[0]][fields.Spells_castValue[1]] = 1;
		values[fields.Spells_castMax[0]][fields.Spells_castMax[1]] = 1;
		values[fields.Spells_storedLevel[0]][fields.Spells_storedLevel[1]] = level;
		values[fields.Spells_spellLevel[0]][fields.Spells_spellLevel[1]] = String((spellObj.obj[1].type.match(/\d+/) || 1));
		values[fields.Spells_cost[0]][fields.Spells_cost[1]] = 0;
		values[fields.Spells_msg[0]][fields.Spells_msg[1]] = spellName;
		values[msgField[0]][msgField[1]] = spellName;
		if (csv >= 2.1) values[fields.Spells_macro[0]][fields.Spells_macro[1]] = '%{'+charCS.get('name')+'|'+spellName+'}';
		
		MIspellsTable.addTableRow( MIrow, values );

		if (SpellsTable.tableLookup( fields.Spells_castValue, spellRow ) != 0) {
			SpellsTable = SpellsTable.tableSet( fields.Spells_castValue, spellRow, 0 );
		}
		let muRows = attrLookup( charCS, [fields.MIspellRows[0]+item+'-mu',fields.MIspellRows[1]] ),
			prRows = attrLookup( charCS, [fields.MIspellRows[0]+item+'-pr',fields.MIspellRows[1]] ),
			muCols = attrLookup( charCS, [fields.MIspellCols[0]+item+'-mu',fields.MIspellCols[1]] ),
			prCols = attrLookup( charCS, [fields.MIspellCols[0]+item+'-pr',fields.MIspellCols[1]] ),
			muSpells = attrLookup( charCS, [fields.ItemMUspellsList[0]+item,fields.ItemMUspellsList[1]] ),
			prSpells = attrLookup( charCS, [fields.ItemPRspellsList[0]+item,fields.ItemPRspellsList[1]] ),
			muLevels = attrLookup( charCS, [fields.ItemMUspellValues[0]+item,fields.ItemMUspellValues[1]] ),
			prLevels = attrLookup( charCS, [fields.ItemPRspellValues[0]+item,fields.ItemPRspellValues[1]] );
			
		if ((!!muRows && !!muCols) || (!!prRows && !!prCols)) {
			muRows = (muRows || '').split(',');
			muCols = (muCols || '').split(',');
			muSpells = (muSpells || '').split(',');
			muLevels = (muLevels || '').split(',');
			prRows = (prRows || '').split(',');
			prCols = (prCols || '').split(',');
			prSpells = (prSpells || '').split(',');
			prLevels = (prLevels || '').split(',');
			let index = muRows.findIndex( (e,i) => e == MIrow && muCols[i] == MIcol ),
				muSave = false, prSave = false;
			if (index > -1 && muCols[index] === MIcol) {
				if (!isMU) {
					muRows.splice(index,1);
					muCols.splice(index,1);
					muSpells.splice(index,1);
					muLevels.splice(index,1);
					prRows.push(MIrow);
					prCols.push(MIcol);
					prSpells.push(spellName);
					prLevels.push(level+'.'+level);
					prSave = true;
				} else {
					muRows[index] = MIrow;
					muCols[index] = MIcol;
					muSpells[index] = spellName;
					muLevels[index] = (level+'.'+level);
				};
				muSave = true;
			} else {
				index = prRows.findIndex( (e,i) => e == MIrow && prCols[i] == MIcol );
				if (index > -1 && prCols[index] === MIcol) {
					if (isMU) {
						prRows.splice(index,1);
						prCols.splice(index,1);
						prSpells.splice(index,1);
						prLevels.splice(index,1);
						muRows.push(MIrow);
						muCols.push(MIcol);
						muSpells.push(spellName);
						muLevels.push(level+'.'+level);
						muSave = true;
					} else {
						prRows[index] = MIrow;
						prCols[index] = MIcol;
						prSpells[index] = spellName;
						prLevels[index] = (level+'.'+level);
					};
					prSave = true;
				}
			};
				
			if (muSave) {
				setAttr( charCS, [fields.MIspellRows[0]+item+'-mu',fields.MIspellRows[1]], muRows.join() );
				setAttr( charCS, [fields.MIspellCols[0]+item+'-mu',fields.MIspellCols[1]], muCols.join() );
				setAttr( charCS, [fields.ItemMUspellsList[0]+item,fields.ItemMUspellsList[1]], muSpells.join() );
				setAttr( charCS, [fields.ItemMUspellValues[0]+item,fields.ItemMUspellValues[1]], muLevels.join() );
			}
			if (prSave) {
				setAttr( charCS, [fields.MIspellRows[0]+item+'-pr',fields.MIspellRows[1]], prRows.join() );
				setAttr( charCS, [fields.MIspellCols[0]+item+'-pr',fields.MIspellCols[1]], prCols.join() );
				setAttr( charCS, [fields.ItemPRspellsList[0]+item,fields.ItemPRspellsList[1]], prSpells.join() );
				setAttr( charCS, [fields.ItemPRspellValues[0]+item,fields.ItemPRspellValues[1]], prLevels.join() );
			};
		};
		args[2] = args[5] = -1;
		
		makeStoreMIspell( args, senderId, 'Stored '+spellName+' in '+getObj('graphic',tokenID).get('name')+'\'s spell storing magic item' );
		return;
	}
	
	/*
	 * Add a selected spell or power to a spell-storing item
	 */
	 
	async function handleChangeSpellStore( args, senderId ) {
		
		var del = args[0].toUpperCase().includes('DEL'),
			pwSpell = args[0].toUpperCase().includes('PWR'),
			tokenID = args[1],
			item = args[2].hyphened(),
			cmd = args[3].toUpperCase(),
			level = parseInt(args[4]) || 1,
			retMenu = args[5],
			spell = args[6].hyphened(),
			answer1 = args[7],
			answer2 = args[8] || answer1,
			repSpell = args[9],
			spellRow = args[10],
			spellCol = args[11],
			rep = !!repSpell,
			charCS = getCharacter(tokenID),
			maxVal = 0,
			isMU = cmd.includes('MU'),
			isPR = cmd.includes('PR'),
			isPower = cmd.includes('POWER'),
			
			storedSpellsAttr, storedLevelAttr,
			currentList, currentValues, spellType = 'ALL';
		
		if (isPower || pwSpell) {
			spellType = 'PW';
			storedSpellsAttr = [fields.ItemPowersList[0]+item,fields.ItemPowersList[1]];
			storedLevelAttr  = [fields.ItemPowerValues[0]+item,fields.ItemPowerValues[1]];
			if (isMU && !del) spell = 'MU-'+spell;
			if (isPR && !del) spell = 'PR-'+spell;
		} else if (isMU) {
			spellType = 'MU';
			storedSpellsAttr = [fields.ItemMUspellsList[0]+item,fields.ItemMUspellsList[1]];
			storedLevelAttr  = [fields.ItemMUspellValues[0]+item,fields.ItemMUspellValues[1]];
		} else {
			spellType = 'PR';
			storedSpellsAttr = [fields.ItemPRspellsList[0]+item,fields.ItemPRspellsList[1]];
			storedLevelAttr  = [fields.ItemPRspellValues[0]+item,fields.ItemPRspellValues[1]];
		};
		
		await moveMIspells( senderId, charCS, null, item, spellType );
		
		currentList = (attrLookup( charCS, storedSpellsAttr ) || '').split(',').filter(e=>!!e);
		currentValues = (attrLookup( charCS, storedLevelAttr ) || '').split(',').filter(e=>!!e);
		
		if (del || rep) {
			let index = currentList.findIndex((s,i) => (s === (rep ? repSpell : spell)) && (!rep || currentValues[i].split('.')[0] == 0));
			if (rep) {
				if (index >= 0) {
					currentList[index] = spell;
					currentValues[index] = answer1+'.'+answer2;
				} else {
					currentList.push(spell);
					currentValues.push(answer1+'.'+answer2);
				}
			} else if (index >= 0) {
				currentList.splice(index,1);
				currentValues.splice(index,1);
			}
		} else {
			currentList.push(spell);
			currentValues.push(answer1+'.'+answer2);
		}

		setAttr( charCS, storedSpellsAttr, currentList.join(',') );
		setAttr( charCS, storedLevelAttr, currentValues.join(',') );
		
		await moveMIspells( senderId, null, charCS, item, spellType );

		if (retMenu === 'STORE-MI-SPELL') {
			let SpellsTable = getTable( charCS, fieldGroups.SPELLS, spellCol );
			if (SpellsTable.tableLookup( fields.Spells_castValue, spellRow ) != 0) {
				SpellsTable = SpellsTable.tableSet( fields.Spells_castValue, spellRow, 0 );
			}
			args = [cmd,tokenID,-1,-1,-1,-1,-1,-1];
			makeStoreMIspell( args, senderId, 'Stored spell '+spell.dispName()+' in '+item.dispName() );
		} else {
			args[6] = '';
			makeSpellsMenu( args, senderId, (del ? ('Removed '+spell+' from stored '+(isPower?'powers':'spells')) : ('Added '+spell+' to stored '+(isPower?'powers':'spells'))) );
		}
		return;
	};
	
	/**
	 * handle where somehow the player has been able to select an empty slot
	 **/

	var handlePickupNothing = function( args, pickMI, putSlot, senderId ) {
		
		var tokenID = args[1],
			fromID = args[3],
			toID = args[4],
			fromRow = args[2],
			toRow = args[5],
			fromCS = getCharacter(fromID),
			toCS = getCharacter(toID);
			
		if (!fromCS || !toCS){
			sendDebug('handlePickupNothing: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
			
		var fromName = fromCS.get('name'),
			toName = toCS.get('name'),
			targetID = (tokenID == fromID) ? toID : fromID,
			content = messages.nothingToPick + '{{desc1=Trying to pick up "'+pickMI+'" from '+fromName+' and putting in '+toName+'\'s "'+putSlot+'"}}'
					+ '{{desc2=[Other way round](!magic --button POPsubmit|'+tokenID+'|'+toRow+'|'+toID+'|'+fromID+'|'+fromRow+'|-1)'
					+ ' or [Pick something else](!magic --pickorput '+tokenID+'|'+targetID+')}}';
		sendParsedMsg( tokenID, content, senderId );
		return;		
	};
	
	/**
	* Handle switching to a treasure menu
	**/

	var handleTreasure = function( args, senderId ) {
		
		var tokenID = args[1],
			charCS = getCharacter( tokenID ),
			content = makeLootMenu( senderId, args );
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};
	
	/**
	* handle the failure of an attempt to pick pockets
	**/
	
	var handlePPfailed = function( args, senderId ) {
		
		var tokenID = args[1],
			pickID = args[2],
			putID = args[3],
			ppRoll = parseInt(args[4],10),
			search = putID === tokenID,
			targetID = search ? pickID : putID,
			charCS = getCharacter( tokenID ),
			targetCS = getCharacter( targetID );
			
		if (!tokenID || !targetID || !charCS || !targetCS) {
			sendDebug('handlePPfailure: invalid ID argument passed');
			sendError('Invalid MagicMaster parameter');
			return;
		};
		
		if (isNaN(ppRoll)) {
			sendDebug('handlePPfailure: invalid ppRoll');
			sendError('Invalid MagicMaster parameter');
			return;
		}
		
		var	charName = charCS.get('name'),
			targetName = targetCS.get('name'),
			targetLevel = parseInt(characterLevel( targetCS )),
			content = '&{template:'+fields.menuTemplate+'}{{name=Failed pick pocket attempt by '+charName+'}}';
			
		if (isNaN(targetLevel)) {
			targetLevel = 0;
		}
		
		if (ppRoll > (100-(targetLevel*3))) {
			content += '{{desc='+charName+' tried to pick '+targetName+'\'s pocket unsuccessfully and they noticed.  What will '+targetName+' do about it?}}';
			sendResponse( targetCS, content, null, flags.feedbackName, flags.feedbackImg, targetID );
		} else {
			content += '{{desc='+charName+' tried to pick '+targetName+'\'s pocket, but they did not notice.}}';
			sendFeedback( content, flags.feedbackName, flags.feedbackImg, tokenID, charCS );
		};
		content = '{{desc=Oh dear! Failed! Nothing to see here... now, did anyone notice?}}';
		return content;
	};
	
	/**
	* Handle a character picking or putting away an item to/from a store
	 * args[] is the standard action|charID|fromID|toID|fromRow|toRow|qty|cost
	 * qty -1 means not yet chosen, cost -1 means not yet agreed or no cost
	**/

	async function handlePickOrPut( args, senderId ) { // set

		var tokenID = args[1],
			fromRowRef = args[2],
			fromID = args[3],
			toID = args[4],
			toRowRef = args[5],
			qty = args[6],
			expenditure = args[7],
			newName = (args[8] || '').hyphened(),
			charCS = getCharacter( tokenID ),
			fromCS = getCharacter( fromID ),
			toCS = getCharacter( toID ),
			parseTable = {
				itemName:reSpellSpecs.itemType,
				hide:reSpellSpecs.hide,
				reveal:reSpellSpecs.reveal,
				pick:reSpellSpecs.pick,
				put:reSpellSpecs.put,
			};
		
		if (!charCS || !fromCS || !toCS) {
			sendDebug( 'handlePickOrPut: one or more tokenIDs do not represent valid characters' );
			sendError('Invalid MagicMaster button arguments');
			return;
		}
		if (isNaN(fromRowRef) || fromRowRef<0 || isNaN(toRowRef) || toRowRef<0) {
			sendDebug('handlePickOrPut: invalid row or column parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var toMIbag = getTable( toCS, fieldGroups.MI ),
			fromMIbag = getTable( fromCS, fieldGroups.MI ),
			toSlotName = toMIbag.tableLookup( fields.Items_name, toRowRef, false ),
			toMIvalues = initValues( toMIbag.fieldGroup ),
			toSlotTrueName, toSlotType, toSlotQty, toSlotCharges, toSlotTrueType,
			MIname = fromMIbag.tableLookup( fields.Items_name, fromRowRef ),
			MItrueName = fromMIbag.tableLookup( fields.Items_trueName, fromRowRef ),
			fromTrueName = MItrueName,
			fromSlotType = (fromMIbag.tableLookup( fields.Items_type, fromRowRef ) || '').toLowerCase(),
			fromSlotTrueType = (fromMIbag.tableLookup( fields.Items_trueType, fromRowRef ) || fromSlotType).toLowerCase(),
			MItrueObj = getAbility( fields.MagicItemDB, MItrueName, fromCS ),
			MIdata = resolveData( MItrueName, fields.MagicItemDB, reItemData, fromCS, parseTable, fromRowRef ).parsed,
			showType = parseInt(attrLookup( fromCS, fields.ItemContainerHide )),
			hide = (MIdata.hide.length && MIdata.hide !== 'nohide' && MIdata.hide !== 'reveal') || (!MIdata.hide.length && (MIname === MItrueName) && state.MagicMaster.autoHide && !!MItrueObj.obj && reLooksLike.test(MItrueObj.obj[1].body)),
			rev = hide ? (MIdata.reveal || '') : '',
			pickPutText = (tokenID === fromID) ? 'put away' : 'pick up';
			
		if (hide) MIname = (!MIdata.hide.length || MIdata.hide === 'hide') ? getShownType( MItrueObj, fromRowRef, MIdata.itemType ) : MIdata.hide;
		
		if (!_.isUndefined(toSlotName)) {
			toSlotType = (toMIbag.tableLookup( fields.Items_type, toRowRef ) || fromSlotType).toLowerCase();
			toSlotTrueName = toMIbag.tableLookup( fields.Items_trueName, toRowRef );
			toSlotTrueType = (toMIbag.tableLookup( fields.Items_trueType, toRowRef ) || fromSlotTrueType).toLowerCase();
			toSlotQty = parseInt((toMIbag.tableLookup( fields.Items_qty, toRowRef ) || 0),10);
			toSlotCharges = parseInt((toMIbag.tableLookup( fields.Items_trueQty, toRowRef ) || 0),10);
		} else {
			toSlotName = '-';
			toSlotTrueName = toMIvalues[fields.Items_trueName[0]][fields.Items_trueName[1]];
			toSlotType = toMIvalues[fields.Items_type[0]][fields.Items_type[1]];
			toSlotTrueType = toSlotType;
		}

		var sameMI = (MItrueName.toLowerCase() === toSlotTrueName.toLowerCase()) && (toSlotType === fromSlotType || !toSlotType.dbName()) && (toSlotTrueType === fromSlotTrueType || !toSlotTrueType.dbName()),
			toSlotEmpty = toSlotName === '-';

		if (((toSlotType && toSlotType.includes('cursed')) || (toSlotTrueType && toSlotTrueType.includes('cursed'))) && !sameMI && !toSlotEmpty) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Select another slot](!magic --button '+BT.POP_PICK+'|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|-1)}}', senderId );
			return;
		}
			
		if (((fromSlotType && fromSlotType.includes('cursed')) || (fromSlotTrueType && fromSlotTrueType.includes('cursed'))) && fromID == tokenID) {
			sendParsedMsg( tokenID, messages.cursedItem + '{{desc1=[Select another item](!magic --button '+BT.POP_PICK+'|'+tokenID+'|-1|'+fromID+'|'+toID+'|'+toRowRef+')}}', senderId );
			return;
		}
			
		var	MIqty = parseInt( (fromMIbag.tableLookup( fields.Items_qty, fromRowRef ) || 0), 10),
			MItrueQty = parseInt((fromMIbag.tableLookup( fields.Items_trueQty, fromRowRef) || 0),10),
			MIspeed = fromMIbag.tableLookup( fields.Items_speed, fromRowRef ),
			MItrueSpeed = fromMIbag.tableLookup( fields.Items_trueSpeed, fromRowRef ),
			MItype = fromMIbag.tableLookup( fields.Items_type, fromRowRef ),
			MIcost  = parseFloat( (fromMIbag.tableLookup( fields.Items_cost, fromRowRef ) || 0), 10),
			MIreveal = rev || fromMIbag.tableLookup( fields.Items_reveal, fromRowRef ),
			MItrueType = fromMIbag.tableLookup( fields.Items_trueType, fromRowRef ),
			MItext = MIname,
			slotInc = 1,
			isStackable = (stackable.includes(fromSlotType) && stdEqual( toSlotName, MIname ) && stdEqual( toSlotType, MItype ) && stdEqual( toSlotTrueName, MItrueName )),
			finalQty, finalCharges, pickQty, charges, content, MIobj;
			
		if (showType) {
			MIobj = abilityLookup( fields.MagicItemDB, MIname, fromCS );
			MItext = !MIobj.obj ? MItext : getShownType( MIobj, fromRowRef, MIdata.itemType );
		}
			
		MIqty = isNaN(MIqty) ? 0 : MIqty;
		MIcost = isNaN(MIcost) ? 0 : MIcost;
		toSlotQty = isNaN(toSlotQty) ? 0 : toSlotQty;
		toSlotCharges = isNaN(toSlotCharges) ? 0 : toSlotCharges;
			
		switch (MIqty) {
		case 0:
			if (!splitable.includes(fromSlotType)) {
				qty = pickQty = 0;
				charges = MItrueQty;
			} else {
				handlePickupNothing( args, MItext, toSlotName, senderId );
				return;
			};
			break;
		
		case 1:
			qty = 1;
			pickQty = charges = MItrueQty;
			MIqty = 0;
			break;
			
		default:
			if (!splitable.includes(fromSlotType)) {
				qty = MIqty;
				pickQty = (recharging.includes(fromSlotType)) ? MIqty : MItrueQty;
				charges = MItrueQty;
				MIqty = 0;
			} else if (qty < 0) {
				howMany( args, MItext, fromSlotType, MIqty, senderId );
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
		
		if (isStackable) {
			finalQty = (parseInt(finalQty)||0) + (parseInt(toSlotQty)||0);
			finalCharges = (parseInt(finalCharges)||0) + (parseInt(toSlotCharges)||0);
			slotInc = 0;
		} else if (toSlotType !== '' && (toSlotName !== '-')) {
			content = messages.slotFull;
			content += '{{[Choose another slot](!magic --pickorput|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|-1)}}';
			sendParsedMsg( tokenID, content, senderId );
			return;
		}
		
		if (!_.isUndefined(expenditure)) {
			expenditure = parseFloat(expenditure);
		}
		
		if (_.isUndefined(expenditure) || isNaN(expenditure) || expenditure < 0) {
			expenditure = MIcost * qty;
			if (expenditure && charCS.id != fromCS.id) {
				setAttr( charCS, ['expenditure', 'current'], expenditure );
				content = '&{template:'+fields.menuTemplate+'}{{name=Pay for Goods}}'
						+ '{{desc=The goods you have selected from '+fromCS.get('name')+' have a total cost of '+showCost(expenditure)+'.  Are you happy to pay this?}}'
						+ '{{desc1=[Buy goods](!magic --button POPbuy|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|'+toRowRef+'|'+qty+'|'+expenditure+') or'
						+ '[Choose something else](!magic --pickorput '+tokenID+'|'+fromID+'|'+toID+')}}';
				sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
				return;
			}
		}
		
		if (expenditure != 0) {
			spendMoney( toCS, expenditure, fromCS );
		}
		
		let dupRow = toMIbag.tableFind( fields.Items_name, newName || MIname ) || toMIbag.tableFind( fields.Items_trueName, newName || MItrueName );
			
		if (!isStackable && !_.isUndefined(dupRow) && dupRow !== toRowRef) {
			content = '&{template:'+fields.menuTemplate+'}{{name=Duplicate Item}}'
					+ '{{desc=The item you have selected to '+pickPutText+' is not stackable with an item of the same name already stored}}'
					+ '{{desc1=[Choose a new name](!magic --button POPrename|'+tokenID+'|'+fromRowRef+'|'+fromID+'|'+toID+'|'+toRowRef+'|'+qty+'|'+expenditure+'|?{What new name do you want to give '+MIname+'?}) for '+MIname
					+ ' or [Choose something else](!magic --pickorput '+tokenID+'|'+fromID+'|'+toID+')}}';
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
			return;
		} else if (!_.isUndefined(newName) && newName.length) {
			if (!MIobj || !MIobj.obj) {
				MIobj = abilityLookup( fields.MagicItemDB, MIname, fromCS );
			}
			if (MIname === MItrueName) MItrueName = newName;
			if (MIobj.obj && MIobj.obj[0]) {
				MIobj.obj[0].set('name',newName);
				let key = 'ababzzqqrst',
					oldDispName = MIname.replace(/-/g,' '),
					action = MIobj.obj[1].body.replace(new RegExp(MIname,'img'),key).replace(new RegExp(oldDispName,'img'),args[8]).replace(new RegExp(key,'img'),newName);
				setAbility( toCS, newName, action );
			}
			MIname = newName;
		};
		
		toMIvalues[fields.Items_name[0]][fields.Items_name[1]] = MIname;
		toMIvalues[fields.Items_trueName[0]][fields.Items_trueName[1]] = MItrueName;
		toMIvalues[fields.Items_qty[0]][fields.Items_qty[1]] = finalQty;
		toMIvalues[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = finalCharges;
		toMIvalues[fields.Items_speed[0]][fields.Items_speed[1]] = MIspeed;
		toMIvalues[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = MItrueSpeed;
		toMIvalues[fields.Items_cost[0]][fields.Items_cost[1]] = 0;
		toMIvalues[fields.Items_type[0]][fields.Items_type[1]] = MItype;
		toMIvalues[fields.Items_reveal[0]][fields.Items_reveal[1]] = MIreveal;
		toMIvalues[fields.Items_trueType[0]][fields.Items_trueType[1]] = MItrueType;
		toMIbag.addTableRow( toRowRef, toMIvalues );
		slotCounts[toCS.id] += slotInc;
		
		if (!newName || !newName.length || MItrueName !== MIname) {
			MIobj = abilityLookup( fields.MagicItemDB, fromTrueName, fromCS );
			if (MIobj.obj) {
				setAbility( toCS, MItrueName, MIobj.obj[1].body );
			} else {
				log('handlePickOrPut: storing '+MItrueName+' to '+toCS.get('name')+', ability not found in any database or '+fromCS.get('name'));
			}
		}
		
		let containerType = (parseInt(attrLookup(toCS, fields.ItemContainerType) || 0) || 0);
		containerType = (containerType == 0 ? 1 : (containerType == 2 ? 3 : containerType));
		setAttr( toCS, fields.ItemContainerType, containerType );
		setAttr(charCS, fields.ItemOldContainerType, containerType);
		
		await moveMIspells( senderId, fromCS, toCS, MIname );
		if (!stdEqual(MIname,MItrueName)) {
			await moveMIspells( senderId, fromCS, toCS, MItrueName );
		}
		checkForBag( toCS, MItrueName, toRowRef );
		if (!!MIdata.pick && !!MIdata.pick.length) {
			pickPutCmd( MIdata.pick, toID, toCS, 'magic handlePickOrPut' );
		};
		if (MIqty == 0) {
			if (!!MIdata.put && !!MIdata.put.length) {
				pickPutCmd( MIdata.put, fromID, fromCS, 'magic handlePickOrPut' );
			};
			fromMIbag.addTableRow( fromRowRef );	// Blanks this row of the table
			setTimeout(() => removeMIability( fromCS, MIname, fromMIbag ), 100);		// Only removes ability if does not exist elsewhere in the equipment list
			setTimeout(() => removeMIability( fromCS, MItrueName, fromMIbag ), 100);
		} else {
			fromMIbag.tableSet( fields.Items_trueQty, fromRowRef, (MItrueQty - charges) );
			fromMIbag.tableSet( fields.Items_qty, fromRowRef, (MIqty - qty) );
		};
		
		content = fields.attackMaster + ' --checkac ' + fromID + '|silent||' + senderId
				+ ' --checkac ' + toID + '|silent||' + senderId;
		sendAPI( content, senderId );
		content = fields.initMaster + ' --checkinit ' + fromID + '|silent'
				+ ' --checkinit ' + toID + '|silent';
		sendAPI( content, senderId );

		pickupMessage( args, MIname, MItype, qty, (MItrueQty - qty), finalCharges, senderId );
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
			sendError('Internal MagicMaster error');
			return;
		}
		if (!MItoStore || MItoStore.length == 0) {
			sendDebug('handleSelectMI: invalid Magic Item passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		if (MItoStore.toLowerCase() != 'remove') {
			let itemObj = abilityLookup( fields.MagicItemDB, MItoStore, charCS );
			setAttr( charCS, fields.ItemCastingTime, itemObj.obj[1].ct );
			setAttr( charCS, fields.ItemSelected, 1 );
		};
		
		if (GMonly) {
			makeGMonlyMImenu( args, senderId );
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
			sendError('Internal MagicMaster error');
			return;
		}
		if (!MIrowref || isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleSelectSlot: invalid MI parameter passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var slotItem,
			MagicItems = getTable( charCS, fieldGroups.MI );
			
		if (MIrowref >= MagicItems.sortKeys.length) {
			MagicItems.addTableRow( MIrowref );
		}

		setAttr( charCS, fields.ItemRowRef, MIrowref );
		setAttr( charCS, fields.Expenditure, (MagicItems.tableLookup( fields.Items_cost, MIrowref ) || 0 ) );
		setAttr( charCS, fields.ItemSelected, 1 );
		
		if (GMonly) {
			makeGMonlyMImenu( args, senderId );
		} else {
			makeEditBagMenu( args, senderId, 'Selected slot currently containing '+slotItem );
		}
		return;			
	}
	
	/*
	 * Handle storing an MI in a Magic Item bag.
	 * Can take either a tokenID or a Character ID.
	 * A flag parameter determines if this is a GM-only action
	 */
	 
	async function handleStoreMI( args, GMonly, senderId ) {
		
		var tokenID = args[1],
			MIrowref = String(args[2] || ''),
			MIchosen = args[3],
			MIqty = args[4] || '1',
			silent = (args[5] || '').toUpperCase() === 'SILENT',
			cmd = (args[0].toUpperCase().includes('MARTIAL') ? BT.EDIT_MARTIAL : (args[0].toUpperCase().includes('ALLITEMS') ? BT.EDIT_ALLITEMS : BT.EDIT_MI)),
			charCS = getCharacter( tokenID ),
			queries = args.slice(6);
			
		if (!getObj( 'graphic', tokenID )) {
			tokenID = undefined;
			silent = true;
		}
			
		if (!charCS) {
			sendDebug('handleStoreMI: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		if (queries && queries.length && queries[0].length) _.each( queries, q => setAttr( charCS, [fields.ItemVar[0]+MIchosen.hyphened()+'+'+MIrowref+'-'+q.split('=')[0],fields.ItemVar[1]], (q.split('=') || ['',''])[1] ) );

		var MItables = getTable( charCS, fieldGroups.MI ),
			inHand = MIrowref.dbName().startsWith('inhand'),
			hand = inHand ? parseInt(MIrowref.split('/')[1] || '0') : 0,
			replace = (MIchosen || '').split('/'),
			MIchosen = replace[0],
			MIreplace = replace[1],
			isRing = MIrowref === '=',
			repQty = '0',
			qtyOp = isNaN(parseInt(MIqty[0])) && MIqty[0] !== '=',
			reMIspecs = {
				qty:reSpellSpecs.qty,
				max:reSpellSpecs.maxQty,
				speed:reSpellSpecs.speed,
				type:reSpellSpecs.recharge,
				itemType:reSpellSpecs.itemType,
				hide:reSpellSpecs.hide,
				reveal:reSpellSpecs.reveal,
				pick:reSpellSpecs.pick,
			},
			magicItem = getAbility( fields.MagicItemDB, MIchosen, charCS, null, null, null, (isNaN(MIrowref) ? '' : MIrowref) ),
			miData = resolveData( MIchosen, fields.MagicItemDB, reItemData, charCS, reMIspecs, (isNaN(MIrowref) ? '' : MIrowref) ).parsed,
			MImaxQty = 0;
			
		if (MIqty[0] === '=') MIqty = MIqty.slice(1);
		
		if (MIreplace) {
			MIrowref = MItables.tableFind( fields.Items_trueName, MIreplace );
			if (!MIqty.length && MIreplace !== '-' && _.isUndefined(MIrowref)) return;  // If args[4] === '=' but MIreplace cannot be found (e.g. last dose of a potion) don't create a new entry.
			if (qtyOp || !MIqty.length) repQty = (_.isUndefined(MIrowref) ? '1' : String(MItables.tableLookup( fields.Items_qty, MIrowref )));
		};
		if (inHand && isNaN(parseInt(MIrowref))) MIrowref = MItables.tableFind( fields.Items_trueName, MIchosen );
		if (isNaN(parseInt(MIrowref)) || MIrowref<0) MIrowref = MItables.tableFind( fields.Items_name, '-' );
		if (isNaN(parseInt(MIrowref))) {
			MItables = MItables.addTableRow();
			MIrowref = MItables.sortKeys.length-1;
		}
		MIqty = Math.floor(evalAttr(qtyOp ? repQty+MIqty : (!MIqty.length ? repQty : MIqty)) || 0);
		if (!qtyOp && MIqty == 0) {
			MIqty = (parseInt(evalAttr(miData.qty)) || 0);
		};
		MImaxQty = qtyOp ? MIqty : (parseInt(evalAttr(miData.maxQty)) || MIqty);
		MIqty = Math.min( MIqty, MImaxQty );
		
		var slotName = MItables.tableLookup( fields.Items_name, MIrowref ),
			slotTrueName = MItables.tableLookup( fields.Items_trueName, MIrowref ),
			slotType = MItables.tableLookup( fields.Items_type, MIrowref ),
			containerNo = parseInt(attrLookup( charCS, fields.ItemContainerType )) || 0,
			values = MItables.copyValues();

		if (!magicItem.ct) {
			sendDebug('handleStoreMI: selected magic item speed/type not defined');
			sendError('Selected Magic Item not fully defined');
			return;
		}
		
		var midbCS, MIdisplayName;

		if (!GMonly && slotType.toLowerCase().includes('cursed')) {
			if (!silent) sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!magic --edit-mi '+tokenID+')}}', senderId );
			return;
		}
		await moveMIspells( senderId, charCS, null, slotName );

		if (!stdEqual(slotName,slotTrueName)) await moveMIspells( senderId, charCS, null, slotTrueName );

		if (miData.hide && !['hide','nohide','reveal'].includes(miData.hide)) {
			MIdisplayName = miData.hide;
			getAbility( fields.MagicItemDB, MIdisplayName, charCS, true, true, MIchosen );		
		} else if (GMonly && (state.MagicMaster.autoHide || (miData.hide && miData.hide === 'hide')) && reLooksLike.test(magicItem.obj[1].body)) {
			MIdisplayName = getShownType( magicItem, MIrowref, miData.itemType );
			getAbility( fields.MagicItemDB, MIdisplayName, charCS, true, true, MIchosen );
		} else {
			MIdisplayName = MIchosen;
		}

		values[fields.Items_name[0]][fields.Items_name[1]] = MIdisplayName;
		values[fields.Items_trueName[0]][fields.Items_trueName[1]] = MIchosen;
		values[fields.Items_speed[0]][fields.Items_speed[1]] = miData.speed;
		values[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = miData.speed;
		values[fields.Items_qty[0]][fields.Items_qty[1]] = MIqty;
		values[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = MImaxQty;
		values[fields.Items_cost[0]][fields.Items_cost[1]] = 0;
		values[fields.Items_type[0]][fields.Items_type[1]] = miData.type;
		values[fields.Items_trueType[0]][fields.Items_trueType[1]] = miData.type;
		values[fields.Items_reveal[0]][fields.Items_reveal[1]] = (miData.reveal.toLowerCase() !== 'manual' ? miData.reveal : '');
		
		MItables.addTableRow( MIrowref, values );
		
		if (isRing) {
			let ringHand = ((attrLookup( charCS, fields.Equip_leftTrueRing ) === MIreplace) ? BT.LEFTRING : ((attrLookup( charCS, fields.Equip_rightTrueRing ) === MIreplace) ? BT.RIGHTRING : undefined));
			if (!_.isUndefined(ringHand)) {
				let cmdStr = (fields.attackMaster + ' --button ' + ringHand + (GMonly ? '-NOCURSE' : '') + '|' + tokenID + '|' + MIrowref + '|SILENT');
				sendAPI( cmdStr, senderId );
			}
		};
		
		if (slotName && slotName !== '-') {
			removeMIability( charCS, slotName, MItables );
		}
		
		if (isNaN(containerNo) || (!(containerNo % 2) && (containerNo < 6))) {
			setAttr( charCS, fields.ItemContainerType, (isNaN(containerNo) ? 1 : containerNo+1) );
			setAttr(charCS, fields.ItemOldContainerType, attrLookup(charCS, fields.ItemContainerType));
		}

		await moveMIspells( senderId, null, charCS, MIchosen );
		checkForBag( charCS, MIchosen, MIrowref );
		
		if (!!tokenID) {
			sendAPI( (fields.attackMaster + ' --checkac ' + tokenID + '|Silent||' + senderId), senderId );
			if (!!miData.pick && !!miData.pick.length) {
				pickPutCmd( miData.pick, tokenID, charCS, 'magic handleStoreMI' );
			};
		};

		sendAPI( (fields.initMaster+' --checkinit '+tokenID+'|silent'), senderId );

		if (silent) {
			if (tokenID && inHand && !isRing) sendAPI( (fields.attackMaster + ' --button ' + (['PRIMARY','OFFHAND','BOTH','HAND'][Math.min(hand,3)]) + '-NOCURSE|' + tokenID + '|' + MIchosen + '|' + hand + '||Silent'), senderId );
			sendWait(senderId,0);
			return;
		}
		args = [cmd,tokenID,-1,''];
		
		if (GMonly) {
			makeGMonlyMImenu( args, senderId, MIchosen + ' has been stored in slot '+MIrowref );
		} else {
			makeEditBagMenu( args, senderId, MIchosen+' has overwritten '+slotName );
		}
		return;
	}
	
	/**
	 * Handle renaming an item. Make sure that the new name is unique
	 **/
	 
	var handleRenameItem = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MInewName = (args[4] || '').hyphened(),
			charCS = getCharacter( tokenID ),
			Items = getTable( charCS, fieldGroups.MI ),
			MIoldName = Items.tableLookup( fields.Items_name, MIrowref ),
			MIhyphenOld = MIoldName.hyphened(),
			item = getAbility( fields.MagicItemDB, MInewName, charCS, true );
			
		if (!MInewName || !MInewName.length) {
			sendFeedback( '&{template:'+fields.warningTemplate+'}{{name='+charCS.get('name')+'\'s Magic Item Bag}}{{desc=Can\'t rename '+MIoldName+' to an empty string.  Try a different name.}}{{desc1=[Try another Name](!magic --button '+args.join('|')+')\n[Return to Menu](!magic --gm-edit-mi '+tokenID+')}}' );

		} else if (!item.obj) {
			item = getAbility( fields.MagicItemDB, MIoldName, charCS, null, null, null, MIrowref );			// Check if this should actually be an abilityLookup()
			if (!item.obj) return;
			item.obj[0].set('name',MInewName);
			let key = 'ababzzqqrst',
				oldDispName = MIoldName.replace(/-/g,' '),
				action = item.obj[1].body.replace(new RegExp(MIoldName,'img'),key).replace(new RegExp(oldDispName,'img'),args[4]).replace(new RegExp(key,'img'),MInewName);
			setAbility( charCS, MInewName, action );

			Items = Items.tableSet( fields.Items_name, MIrowref, MInewName );
			Items = Items.tableSet( fields.Items_trueName, MIrowref, MInewName );

			let MUspellObj = attrLookup( charCS, [fields.ItemMUspellsList[0]+MIhyphenOld, null] ),
				PRspellObj = attrLookup( charCS, [fields.ItemPRspellsList[0]+MIhyphenOld, null] ),
				powerObj = attrLookup( charCS, [fields.ItemPowersList[0]+MIhyphenOld, null] );
			if (MUspellObj) {
				MUspellObj.set('name',fields.ItemMUspellsList[0]+MInewName);
				let spellList = MUspellObj.get('current').split(',');
				_.each(spellList,s => {
					let o = attrLookup( charCS, [fields.MIspellPrefix[0]+MIhyphenOld+'-'+s,null] );
					if (!o) {
						o = attrLookup( charCS, [fields.MIspellPrefix[0]+s,null] );
					}
					if (o) o.set('name',fields.MIspellPrefix[0]+MInewName+'-'+s);
				});
			}
			if (PRspellObj) {
				PRspellObj.set('name',fields.ItemPRspellsList[0]+MInewName);
				let spellList = PRspellObj.get('current').split(',');
				_.each(spellList,s => {
					let o = attrLookup( charCS, [fields.MIspellPrefix[0]+MIhyphenOld+'-'+s,null] );
					if (!o) {
						o = attrLookup( charCS, [fields.MIspellPrefix[0]+s,null] );
					}
					if (o) o.set('name',fields.MIspellPrefix[0]+MInewName+'-'+s);
				});
			}
			if (powerObj) {
				powerObj.set('name',fields.ItemPowersList[0]+MInewName);
				let spellList = powerObj.get('current').split(',');
				_.each(spellList,s => {
					let o = attrLookup( charCS, [fields.MIpowerPrefix[0]+MIhyphenOld+'-'+s,null] );
					if (!o) {
						o = attrLookup( charCS, [fields.MIpowerPrefix[0]+s,null] );
					}
					if (o) o.set('name',fields.MIpowerPrefix[0]+MInewName+'-'+s);
				});
			}
			filterObjs( obj => {
				if (obj.get('_type') !== 'attribute' || obj.get('_characterid') !== charCS.id) return false;
				let objName = obj.get('name');
				if (objName.startsWith(fields.ItemVar[0]+MIhyphenOld)+'+'+MIrowref) {
					obj.set('name',objName.replace( MIhyphenOld, MInewName ));
					return true;
				}
				return false;
			});
			makeGMonlyMImenu( ['',tokenID,-1,''], senderId, 'Renamed "'+MIoldName.dispName()+'" as "'+MInewName.dispName()+'"' );

		} else {
			args[4] = '&#63;{What do you want to call '+MIoldName+'?}';
			sendFeedback( '&{template:'+fields.warningTemplate+'}{{name='+charCS.get('name')+'\'s Magic Item Bag}}{{desc=An item called '+MInewName+' already exists.  Try a different name.}}{{desc1=[Try another Name](!magic --button '+args.join('|')+')\n[Return to Menu](!magic --gm-edit-mi '+tokenID+')}}' );
		}
		return;
	};
	
	/*
	 * Handle changing the displayed magic item name to that selected
	 * without changing what it actually is.  Only available to GM
	 */
 
	var handleHideMI = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID),
			Items, newItem;
			
		if (!charCS) {
			sendDebug('handleHideMI: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleHideMI: invalid row reference passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		Items = getTable( charCS, fieldGroups.MI );
		
		Items = Items.tableSet( fields.Items_name, MIrowref, MIchosen );
		Items = Items.tableSet( fields.Items_trueType, MIrowref, Items.tableLookup( fields.Items_type, MIrowref ) );
		
		newItem = abilityLookup( fields.MagicItemDB, MIchosen, charCS );
		if (newItem.obj) Items = Items.tableSet( fields.Items_type, MIrowref, newItem.obj[1].charge );
		
		getAbility( fields.MagicItemDB, MIchosen, charCS, true, playerIsGM(senderId), Items.tableLookup( fields.Items_trueName, MIrowref ), MIrowref );
		
		makeGMonlyMImenu( ['',tokenID,-1,''], senderId, 'Slot '+MIrowref+' is now displayed as '+MIchosen );
		return;
	}
	
	/*
	 * Handle removing an MI from a Magic Item bag.
	 * Use a flag to check if this is being done by the GM.
	 */
 
	async function handleRemoveMI( args, GMonly, senderId, silent=false, delAbility=true ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleRemoveMI: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleRemoveMI: invalid row reference passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var Items = getTable( charCS, fieldGroups.MI ),
			slotType = Items.tableLookup( fields.Items_type, MIrowref ) || '',
			slotTrueType = Items.tableLookup( fields.Items_trueType, MIrowref ) || '',
			slotTrueName = Items.tableLookup( fields.Items_trueName, MIrowref ) || '';
		if (!GMonly && (slotType.toLowerCase().includes('cursed') || slotTrueType.toLowerCase().includes('cursed'))) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!magic --edit-mi '+tokenID+')}}', senderId );
			return;
		}
		var putCmd = resolveData( slotTrueName, fields.MagicItemDB, reItemData, charCS, {put:reSpellSpecs.put}, MIrowref ).parsed.put;
//		log('handleRemoveMI: putCmd exists = '+!!putCmd+' && '+putCmd.length);
		if (!!putCmd && !!putCmd.length) {
//			log('handleRemoveMI: found put command = '+putCmd+'\nWhich parses to '+parseStr(putCmd).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID).replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'));
			pickPutCmd( putCmd, tokenID, charCS, 'magic handleRemoveMI' );
		};
		
		Items.addTableRow( MIrowref );
		await moveMIspells( senderId, charCS, null, slotTrueName, 'ALL', true );
		sendAPI( fields.attackMaster+' --blank-weapon '+tokenID+'|'+MIchosen+' --checkac ' + tokenID + '|Silent||' + senderId);

		if (delAbility) {
			removeMIability( charCS, MIchosen, Items );
			removeMIability( charCS, slotTrueName, Items );
		};
		args[2] = -1;
		args[3] = '';
		
		sendAPI( (fields.initMaster+' --checkinit '+tokenID+'|silent'), senderId );

		if (silent) {
			sendWait(senderId,0);
			return;
		}

		if (GMonly) {
			makeGMonlyMImenu( args, senderId, 'Slot '+MIrowref+' has been blanked' );
		} else {
			makeEditBagMenu( args, senderId, 'Slot '+MIrowref+' has been removed' );
		}
		return;
	};
	
	/*
	 * Handle changing the type of a Magic Item.  Only available to the GM.
	 */
	 
	var handleChangeMItype = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			newType = args[4],
			charCS = getCharacter(tokenID);
		
		if (!charCS) {
			sendDebug('handleChangeMItype: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleChangeMI: invalid row reference passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var Items = getTable( charCS, fieldGroups.MI ),
			MIname = Items.tableLookup( fields.Items_name, MIrowref ),
			MItrueName = Items.tableLookup( fields.Items_trueName, MIrowref );
			
		if (newType === 'removeCurse') {
			Items = Items.tableSet( fields.Items_trueType, MIrowref, Items.tableLookup( fields.Items_type, MIrowref ).replace(/cursed\+/i,'').replace(/cursed/i,'uncharged') );
			newType = Items.tableLookup( fields.Items_type, MIrowref ).replace(/cursed\+/i,'').replace(/cursed/i,'uncharged');
		}
			
		Items = Items.tableSet( fields.Items_type, MIrowref, newType );
		
		if (MIname === MItrueName) {
			Items = Items.tableSet( fields.Items_trueType, MIrowref, newType );
		}
		makeGMonlyMImenu( ['',tokenID,-1,''], senderId, MIname+' has been changed to be type '+newType );

		sendAPI( fields.attackMaster + ' --checkac ' + tokenID + '|quiet||' + senderId, senderId );

		return;
	}
	
	/*
	 * Handle changing the number of charges.  A parameter determines if
	 * the displayed charges, the actual charges or both are set.
	 */
	 
	var handleChangeMIcharges = function( args, changeType, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MInewQty = args[4],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleChangeMIcharges: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleChangeMIcharges: invalid row reference passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var MIname = attrLookup( charCS, fields.Items_name, fields.Items_table, MIrowref ) || '-';

		if (changeType == 'Displayed' || changeType == 'Both') {
			setAttr( charCS, [fields.Items_qty[0], 'current'], MInewQty, fields.Items_table, MIrowref );
		}
		if (changeType == 'Actual' || changeType == 'Both') {
			setAttr( charCS, [fields.Items_qty[0], 'max'], MInewQty, fields.Items_table, MIrowref );
		}
		
		makeGMonlyMImenu( ['',tokenID,-1,''], senderId, MIname+'\'s '+changeType+' quantity has been changed to '+MInewQty );
		return;
	}
	
	/*
	 * Handle change the cost of an MI, to support shops and Inns
	 */
	 
	var handleSetMIcost = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			newMIcost = args[4],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('handleSetMIcost: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleSetMIcost: invalid row reference passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var MIname = attrLookup( charCS, [fields.Items_name[0], 'max'], fields.Items_table, MIrowref ) || '-';

		setAttr( charCS, fields.Items_cost, newMIcost, fields.Items_table, MIrowref );
		
		makeGMonlyMImenu( ['',tokenID,-1,''], senderId, MIname+' now costs '+newMIcost+'GP' );
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

		getTable(charCS, fieldGroups.MI).addTableRow( index );
		
		doButton( args, senderID );
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
			sendError('Internal MagicMaster error');
			return;
		}
		
		var content = '&{template:'+fields.menuTemplate+'}{{name=TOTALLY BLANK THE MI BAG}}'
					+ '{{desc=Are you REALLY sure you want to delete the complete MI Bag with all its contents?}}'
					+ '{{desc1=[Yes](!magic --button GM-ConfirmedBlank|'+tokenID+'|-1|) or [No](!magic --button GM-NoBlank|'+tokenID+'|-1|)}}';
					
		sendFeedback(content,flags.feedbackName,flags.feedbackImg,tokenID,charCS);
		return;
	}
	
	/*
	 * The GM confirmed they want to Blank the MI Bag
	 */
	 
	var handleConfirmedBlank = function( args, senderId ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleConfirmedBlank: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var Items = getTable( charCS, fieldGroups.MI ),
			miNameObj, miSpeedObj, miQtyObj, miCostObj, miTypeObj;
		for (let i=fields.Items_table[1]; i<fields.MIRows; i++) {
			if (_.isUndefined(Items.tableLookup( fields.Items_name, i, false, true ))) break;
			Items.addTableRow( i );
		}
		makeGMonlyMImenu( args, senderId, 'Magic Item Bag has been blanked' );
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
	 
	var handleSetContainerType = function( args, senderId ) {
		
		var tokenID = args[1],
			tokenType = args[4],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleSetContainerType: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
			
		setAttr( charCS, fields.ItemContainerType, tokenType );
		setAttr(charCS, fields.ItemOldContainerType, tokenType);
		makeGMonlyMImenu( args, senderId, 'Container type set' );
		return;
	}
	
	/*
	 * Handle setting the size of a container
	 */
	 
	var handleSetContainerSize = function( args, senderId ) {
		
		var tokenID = args[1],
			tokenSize = args[4],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleSetContainerSize: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
			
		setAttr( charCS, fields.ItemContainerSize, tokenSize );
		makeGMonlyMImenu( args, senderId, 'Container size set to '+tokenSize );
		return;
		
	}
	
	/* Handle toggling whether items in the container are displayed by 
	 * their name or only by their type.
	 */
	 
	var handleSetShownType = function( args, senderId ) {
		
		var tokenID = args[1],
			showTypes = !!parseInt(args[4] || 0),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleSetShownType: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		setAttr( charCS, fields.ItemContainerHide, showTypes ? 0 : 1 );
		makeGMonlyMImenu( args, senderId, 'Container set to display '+(showTypes ?  'Item names' : 'Item types'));
		return;
	}
	
	/*
	 * Handle adding treasure narrative (not actual Gold) to a Character Sheet
	 * Only available to the GM.
	 */
	 
	var handleAddTreasure = function( args, senderId ) {
		
		var tokenID = args[1],
			newTitle = args[2],
			newTreasure = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleAddTreasure: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}
		
		var curTreasure = attrLookup( charCS, fields.Money_treasure ) || '';
		
		setAttr( charCS, fields.Money_treasure, (curTreasure+'{{'+newTitle+'='+newTreasure+'}}') );
		makeEditTreasureMenu( args, senderId, 'Treasure added' );
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
			sendError('Internal MagicMaster error');
			return;
		}
		
		var curTreasure = attrLookup( charCS, fields.Money_treasure ) || '',
			content = '&{template:'+fields.menuTemplate+'}{{name=Editing Treasure for '+charCS.get('name')+'}}{{desc=Select all the text below, copy it (using Ctrl-C) and paste it into the Chat Edit box below (using Ctrl-V).  Then edit the elements **within the {{...} } only** before hitting *Return* to set the new value.}}\n'
					+ '/w gm !setattr --fb-from MI System --fb-header Editing treasure --replace --name '+charCS.get('name')+' --otherval|'+curTreasure;
					
		sendFeedback(content,flags.feedbackName,flags.feedbackImg,tokenID,charCS);
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
			sendError('Internal MagicMaster error');
			return;
		}
		
		var curTreasure = attrLookup( charCS, fields.Money_treasure ) || '',
			content = '&{template:'+fields.menuTemplate+'}{{name=Current Treasure to Delete}}'+curTreasure+'{{desc=Are you sure you want to delete this?}}'
					+ '{{desc1=[Yes](!magic --button GM-DelTreasure|'+tokenID+') or [No](!magic --button GM-NodelTreasure|'+tokenID+')}}';
					
		sendFeedback(content,flags.feedbackName,flags.feedbackImg,tokenID,charCS);
		return;
	}
	
	/*
	 * Handle a confirmed deletion of the treasure text
	 * description/journal
	 */
	 
	var handleConfirmedDelTreasure = function( args, senderId ) {
		 
		var tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		setAttr( charCS, fields.Money_treasure, '' );
		makeEditTreasureMenu( args, senderId, 'Treasure text deleted' );
		return;
	}
	
	/*
	 * Handle a [No] button being pressed
	 */
	 
	var handleNo = function( args, senderId ) {
		
		var noType = args[0],
			tokenID = args[1],
			charCS = getCharacter(tokenID);

		switch (noType.toUpperCase()) {

		case 'GM-NODELTREASURE':
		
			makeEditTreasureMenu(args,senderId,'OK, Treasure not deleted');
			break;
			
		case 'GM-NOBLANK':
		
			makeGMonlyMImenu(args, senderId, 'OK, Magic Item Bag not blanked');
			break;
			
		default:
			break;
		}
		
		return;	
	};
	
	/*
	 * Handle tidying up a character sheet to remove 
	 * unused attributes and abilities
	 */
	 
	async function handleCStidy ( tokenList, silent=false ) {
		
		try {
			var errFlag = false,
				namesList = {},
				objList;
				
			log('handleCStidy: called');

			var getNamesList = function( token, namesList ) {

				return new Promise(resolve => {

					try {
						var Items, i, itemName, charCS, itemList,
							errFlag = false,
							spellsList = '';
							
						charCS = getCharacter(token.id);
						if (!(!charCS || !_.isUndefined(namesList[charCS.id]) || charCS.get('name').toLowerCase().includes('-db'))) {
							Items = getTableField( charCS, {}, fields.Items_table, fields.Items_name );
							Items = getTableField( charCS, Items, fields.Items_table, fields.Items_trueName );
							itemList = [];

							i = Items.table[1]-1;
							while (!_.isUndefined(itemName = Items.tableLookup( fields.Items_name, ++i, false ))) {
								itemList.push(itemName,Items.tableLookup( fields.Items_trueName, i ));
								itemList = itemList.concat((attrLookup( charCS, [fields.ItemMUspellsList[0]+itemName.replace(/\s/g,'-'),fields.ItemMUspellsList[1]] ) || '').split(','),
														   (attrLookup( charCS, [fields.ItemPRspellsList[0]+itemName.replace(/\s/g,'-'),fields.ItemPRspellsList[1]] ) || '').split(','),
														   (attrLookup( charCS, [fields.ItemPowersList[0]+itemName.replace(/\s/g,'-'),fields.ItemPowersList[1]] ) || '').split(','));
							}

							_.each(spellLevels, (caster,k) => {
								_.each(caster, (l,n) => {
									if (l.book != 0) {
										spellsList += (attrLookup( charCS, [fields.Spellbook[0]+l.book,fields.Spellbook[1]] ) || '')+'|';
									}
								});
							});
							itemList = itemList.concat(spellsList.split('|'));
							itemList.push(fields.Prev_round[0]+token.id);

							if (itemList.length) {
								if (_.isUndefined(namesList[charCS.id])) namesList[charCS.id] = [];
								namesList[charCS.id] = _.chain(itemList).filter( n => !!n ).sort().uniq(true).value();
							}
						}
					} catch (e) {
						log('MagicMaster getNamesList: JavaScript '+e.name+': '+e.message+' while doing a tidy');
						sendDebug('MagicMaster getNamesList: JavaScript '+e.name+': '+e.message+' while doing a tidy');
						sendCatchError('MagicMaster',null,e,'MagicMaster error in handleCStidy()');
						namesList = undefined;
					} finally {
						setTimeout(() => {
							resolve(namesList);
						}, 1);
					}
				});
			};
						
			if ((!tokenList || !tokenList.length) && silent) {
				tokenList = filterObjs( obj => {
					if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') return false;
					return (!(!obj.get('represents') || !obj.get('represents').length));
				});
			}
			tokenList = tokenList.filter( n => !!n );
			for (const token of tokenList) {
				namesList = await getNamesList( token, namesList );
				if (_.isUndefined(namesList)) return;
			}
			objList = filterObjs( obj => {
				if (obj.get('type') != 'attribute' && obj.get('type') != 'ability') return false;
				let charID = obj.get('characterid');
				if (_.isUndefined(namesList[charID])) return false;
				let objName = obj.get('name');
				if (obj.get('type') !== 'ability') {
					let foundName = undefined;
					if (objName.startsWith(fields.CastingTimePrefix[0])) foundName = objName.substring(fields.CastingTimePrefix[0].length);
					if (objName.startsWith(fields.ItemMUspellsList[0])) foundName = objName.substring(fields.ItemMUspellsList[0].length);
					if (objName.startsWith(fields.ItemPRspellsList[0])) foundName = objName.substring(fields.ItemPRspellsList[0].length);
					if (objName.startsWith(fields.ItemPowersList[0])) foundName = objName.substring(fields.ItemPowersList[0].length);
					if (objName.startsWith(fields.MIspellPrefix[0])) foundName = objName.substring(fields.MIspellPrefix[0].length);
					if (objName.startsWith(fields.MIpowerPrefix[0])) foundName = objName.substring(fields.MIpowerPrefix[0].length);
					if (objName.startsWith(fields.Prev_round[0])) foundName = objName;
					if (objName.startsWith(fields.ItemVar[0])) foundName = objName.substring(fields.ItemVar[0].length,objName.lastIndexOf('+'));
					return (!!foundName && !namesList[charID].some(elem => foundName.dbName().includes(elem.dbName())));
				} else {
					let dbItem = false;
					let attack = objName.startsWith('Do-not-use');
					let menuCmd = obj.get('istokenaction');
					let owned = namesList[charID].includes(objName);
					objName = (objName || '').dbName();
					if (!menuCmd && !owned && !attack) {
						dbItem = _.some(DBindex, (d) => !_.isUndefined(d[objName]));
					}
					return (attack || (!menuCmd && !owned && dbItem));
				}
			});
			if (!silent) {
				sendFeedback( '&{template:'+fields.messageTemplate+'}{{desc='+objList.length+' objects have been removed from '+_.size(namesList)+' characters.}}' );
			} else {
				log(objList.length+' objects have been removed from '+_.size(namesList)+' characters.');
				sendWait(findTheGM(),0);
			}
			
			for (const obj of objList) {
				obj.remove();
			}
			return;
		} catch (e) {
			sendCatchError('MagicMaster',null,e,'MagicMaster handleCStidy()');
		}
	};
	
	/*
	 * Handle changes to the Strength of a character, which is not 
	 * a linear progression due to Exceptional Strength
	 */
	 
	var handleStrengthChange = function( charCS, field, increment, senderId, silent=true ) {
		
		var curStrength, maxStrength,
			originalData, strData,
			newStr, newExp,
			original = '',
			changeBy = 0,
			change = (isNaN(increment[0]) ? increment[0] : '+');
			
		increment = parseFloat((change === '/' || change === '*') ? increment.slice(1) : increment) || 0;

		curStrength = attrLookup( charCS, [field,'current'] );
		if (!charCS || !field || !curStrength) return;

		maxStrength = attrLookup( charCS, [field,'max'] );
		if (!maxStrength || increment == 0) {
			setAttr( charCS, [field,'max'], (maxStrength = curStrength) );
		}
		if (increment != 0) {
				
			strData = curStrength.match(/(\d+)(?:\((\d+)\))?/);
			strData[1] = parseInt(strData[1]);
			strData[2] = !_.isUndefined(strData[2]) ? (parseInt(strData[2]) || 100) : strData[2];
			originalData = maxStrength.match(/(\d+)(?:\((\d+)\))?/);
			originalData[1] = parseInt( originalData[1] );
			originalData[2] = (!_.isUndefined(originalData[2])) ? (originalData[2] = parseInt(originalData[2]) || 100) : strData[2];
			
			newStr = (change === '*' ? (strData[1] * increment) : ((change === '/') ? (strData[1] / increment) : (strData[1] + increment)));
			newStr = ((change === '*' && increment < 1) || (change === '/' && increment > 1) || increment < 0) ? Math.ceil(newStr) : Math.floor(newStr); 
			if (strData[2]) {
				if (strData[1] == originalData[1] && ((increment < 0 && strData[2] > originalData[2]) || (increment > 0 && strData[2] < originalData[2]))) {
					newStr = originalData[1];
					newExp = originalData[2];
					original = 'back to the original value of ';
				} else if ((change === '*' && increment < 1) || (change === '/' && increment > 1) || increment < 0) newStr++;
			} else {
				if (originalData[2] && ((originalData[1] >= strData[1] && originalData[1] < newStr) || (originalData[1] < strData[1] && originalData[1] >= newStr))) {
					newStr = originalData[1];
					newExp = originalData[2];
					original = 'back to the original value of ';
				} else if ((originalData[1] > strData[1] && originalData[1] < newStr) || (originalData[1] < strData[1] && originalData[1] > newStr)) {
					newStr = originalData[1];
					original = 'back to the original value of ';
				}
			}
			changeBy = newStr - strData[1];
			if (strData[2] && ((change == '*' && increment < 1) || (change == '/' && increment > 1) || increment < 0)) changeBy--;
			if (newExp && ((change == '*' && increment > 1) || (change == '/' && increment < 1) || increment > 0)) changeBy++;
			setAttr( charCS, [field,'current',,true], newStr+(!_.isUndefined(newExp) ? '('+(newExp%100?newExp:'00')+')' : '') );
		}
		if (!silent) {
			let content = '&{template:'+fields.warningTemplate+'}{{name='+charCS.get('name')+'\'s '+field+'}}{{desc='+charCS.get('name')+'\'s '+field
						+ (increment != 0 ? (' has changed by '+changeBy+', to be '+original+newStr+(!_.isUndefined(newExp) ? '('+(newExp%100?newExp:'00')+')' : '')) : (' has been memorised as an original roll')) +'}}';
			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg );
		} else {
			sendWait(senderId,0);
		}
	}
	
	/*
	 * Handle a Show More or Show Less button on a 
	 * spell or item description. Uses a message ID
	 * passed back by the Library output parser
	 * to recall the message text
	 */
	 
	var handleShowMore = function( args, senderId ) {
		
		sendAPI( showMoreObj[args[1]], senderId, '', true );
		showMoreObj[args[1]] = undefined;
	};
		
// ------------------------------------------------------------- Command Action Functions ---------------------------------------------

	/**
	 * Show help message
	 */ 

	var showHelp = function() {

		var handoutIDs = getHandoutIDs();
		var content = '&{template:'+fields.menuTemplate+'}{{title=MagicMaster Help}}{{MagicMaster Help=For help on using MagicMaster, and the !magic commands, [**Click Here**]('+fields.journalURL+handoutIDs.MagicMasterHelp+')}}{{Spells & Magic Items Help=For help on the Spells, Powers and Magic Items databases, [**Click Here**]('+fields.journalURL+handoutIDs.MagicDatabaseHelp+')}}{{Effects Database=For help on using and adding Effects and the Effects Database, [**Click Here**]('+fields.journalURL+handoutIDs.EffectsDatabaseHelp+')}}{{Class Database=For help on using and adding to the Class Database, [**Click Here**]('+fields.journalURL+handoutIDs.ClassRaceDatabaseHelp+')}}{{Character Sheet Setup=For help on setting up character sheets for use with RPGMaster APIs, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterCharSheetSetup+')}}{{RPGMaster Templates=For help using RPGMaster Roll Templates, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterLibraryHelp+')}}';

		sendFeedback(content,flags.feedbackName,flags.feedbackImg); 
	}; 
	
	/*
	 * Handle casting a spell
	 */
	 
	var doCastSpell = function( args, selected, senderId ) {
		
		if (!args) return;
		if (args[0] && !args[1] && selected && selected.length) {
			args[1] = selected[0]._id;
		} else if (args.length < 2) {
			sendDebug('doCastSpell: invalid arguments, missing caster type or token_id');
			sendResponseError(senderId,'Missing caster type or token ID');
			return;
		}
		
		var chargedItem = (!!args[4] && args[4].toLowerCase()=='charged');

		args = setCaster( args, messages.castSpellClass, senderId );
		if (!args) {
			return;
		}

		args[4] = args[3] = args[2] = -1;
		args[5] = chargedItem;
		
		makeCastSpellMenu( args, senderId );
		return;		
	}
	
	/*
	 * Use another charge of the same spell/power/MI
	 * if there are any charges left
	 */
	 
	var doCastAgain = function( args, senderId ) {
		
		if (!args) return;
		
		if (args.length < 2) {
			sendDebug('doCastAgain: invalid arguments, missing caster type or token_id');
			sendResponseError(senderId,'Missing caster type or token ID');
			return;
		}
		var isPower = args[0].toUpperCase().includes('POWER'),
			isMU = args[0].toUpperCase().includes('MU'),
			tokenID = args[1],
			charCS = getCharacter(tokenID),
			spellName = args[2];
			
		if (!charCS) {
			sendDebug('doCastAgain: invalid token_id');
			sendResponseError(senderId,'Invalid token selected');
			return;
		}

		var castingName = attrLookup( charCS, fields.Casting_name ),
			castingLevel = attrLookup( charCS, fields.CastingLevel ),
			spellRow = attrLookup( charCS, fields.SpellRowRef ),
			spellCol = attrLookup( charCS, fields.SpellColIndex ),
			firstColNum = isPower ? fields.PowersFirstColNum : fields.SpellsFirstColNum,
			col = (firstColNum || spellCol != 1) ? spellCol : '',
			rep = (isPower ? fields.Powers_table[0] : fields.Spells_table[0]) + col + '_$' + spellRow + '_',
			spellCharges = parseInt((attrLookup( charCS, fields.Spells_castValue, (isPower ? fields.Powers_table[0] : fields.Spells_table[0]), spellRow, spellCol ) || 0),10);
			
		if (spellCharges <= 0) {
			sendParsedMsg( tokenID, messages.noMoreCharges, senderId );
			return;
		}
		
		if (!spellName || spellName.length == 0) {
			spellName = attrLookup( charCS, fields.SpellToMem ) || '-';
		}
		
		args[0] = isPower ? BT.USE_POWER : (isMU ? BT.CAST_MUSPELL : BT.CAST_PRSPELL);
		args[3] = spellRow;
		args[4] = spellCol;
		args[5] = spellName;
		
		makeCastAgainMenu( args, senderId );
		return;
	}
	
	/*
	 * Target a spell that requires a "to-hit" roll at a token
	 */
	 
	var doTouch = function( args, isGM ) {
		
		if (!args) return;
		
		if (args.length < 4) {
			sendDebug('doTouch: invalid number of arguments');
			sendError('Too few targeting arguments');
			return;
		}
		
		var tokenID = args[0],
			charCS = getCharacter(tokenID);
		
		if (!charCS) {
			sendDebug('doTouch: invalid tokenID parameter');
			sendError('Internal MagicMaster error');
			return;
		}
		handleSpellTargeting( args, isGM );
		return;
	}
	
	/*
	 * Create a menu to change the memorised spells for the day
	 */

	var doMemoriseSpells = function( args, selected, senderId ) {
		
		if (!args) return;
		if (args[0] && !args[1] && selected && selected.length) {
			args[1] = selected[0]._id;
		} else if (args.length < 2) {
			sendDebug('doMemoriseSpells: invalid arguments, missing caster type or token_id');
			sendResponseError(senderId,'Missing caster type or token ID');
			return;
		};
		
		args = setCaster( [args[0],args[1],'','','',args[2]], messages.memSpellClass, senderId );
		if (!args) {
			return;
		}

		var isMU = args[0].toUpperCase().includes('MU'),
			isPR = args[0].toUpperCase().includes('PR'),
			isPower = args[0].toUpperCase().includes('POWER'),
			isMI = args[0].toUpperCase().includes('MI'),
			tokenID = args[1],
			charCS = getCharacter(tokenID);

		args = (isMI) ? [args[0],args[1],-1,-1,-1,-1,-1,-1] : [args[0],args[1],1,-1,-1,''];

		if (isMI && (isMU || isPR)) {
			makeStoreMIspell( args, senderId );
		} else {
			makeManageSpellsMenu( args, senderId );
		}
		return;
	}
	
	/*
	 * Create a menu to see what spells the character has memorised for the day,
	 * and allow selection to see the description of each spell.
	 */
	 
	var doViewMemorisedSpells = function( args, selected, senderId ) {
		
		if (!args) return;
		if (args[0] && !args[1] && selected && selected.length) {
			args[1] = selected[0]._id;
		} else if (args.length < 2) {
			sendDebug('doViewMemorisedSpells: invalid arguments, missing caster type or token_id');
			sendResponseError(senderId,'Missing caster type or token ID');
			return;
		}
		
		args = setCaster( [args[0],args[1],args[3],'','',args[2]], messages.viewSpellClass, senderId );
		if (!args) return;

		args[2] = args[3] = args[4] = -1;
		args[5] = '';

		makeViewMemSpells( args, senderId );
		return;
	}
	
	/*
	 * Attempt to learn a spell from a spellbook or scroll (or any other valid 
	 * magic item that has stored spells
	 */
	 
	var doLearnSpell = function( args, selected, senderId ) {
		
		if (!args) return;
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (args.length < 2) {
			sendDebug('doLearnSpell: invalid arguments, missing token_id or spell name');
			sendError('Missing token ID or spell name when trying to learn a spell',msg_orig[senderId]);
			return;
		}
		var charCS = getCharacter(args[0]);
		if (!charCS) {
			sendError('Invalid character trying to learn a spell',msg_orig[senderId]);
			return;
		}
		args.unshift('');
		handleLearnSpell( args, senderId );
		return;
	};
	
	/*
	 * Function to View or Use a Magic Item
	 * possible actions are BT.VIEW_MI or BT.USE_MI
	 */
	 
	var doViewUseMI = function( args, action, senderId, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doViewUseMI: invalid number of parameters');
			sendResponseError(senderId,'Missing token ID');
			return;
		}
		
		var tokenID = args[0],
			charCS = getCharacter(tokenID);

		if (!charCS) {
			sendDebug('doViewUseMI: invalid token_id');
			sendResponseError(senderId,'Invalid token selected');
			return;
		}
		setAttr( charCS, fields.CastingLevel, casterLevel( charCS, 'MI' ));

		makeViewUseMI( [action, tokenID, -1], senderId );
		return;
		
	}
	
	/*
	 * Specify a power to use from a Magic Item (isUse = false)
	 * or actually use the Magic Item power (isUse = true)
	 */
	 
	var doSelectMIpower = function( args, isUse, senderId ) {
		
		if (!args) return;
		
		if (args.length < 3) {
			sendDebug('doSelectMIpower: invalid number of arguments');
			sendResponseError(senderId,'Incorrect MagicMaster syntax');
			return;
		}
		args.unshift('');
		handleSelectMIpower( args, isUse, senderId );
	
		return;
	}
	
	/*
	 * Restore uses per day of a specific power of a specific magic item
	 */
	 
	var doRestoreMIpowers = function( args, senderId ) {
		
		if (!args) return;
		
		if (args.length < 2) {
			sendDebug('doRestoreMIpowers: invalid number of arguments');
			sendResponseError(senderId,'Incorrect MagicMaster syntax');
			return;
		}
		handleRestoreMIpowers( args, senderId );

		return;
	}
	
	/*
	 * Deal with requests to undertake a rest, either short or long, or
	 * if undetermined, ask the player which to do.  Only enable a
	 * long rest if the DM has enabled it.
	 */

	var doRest = function( args, selected, senderId ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doRest: invalid arguments, missing token_id');
			sendResponseError(senderId,'Token not specified');
			return;
		}

		var tokenID = args[0],
			restType = (args[1] || 'SELECT').toUpperCase(),
			casterType = (args[2] || 'MU+PR').toUpperCase(),
			timeSpent = args[3];
			
		if (casterType.includes('MI') && casterType.includes('POWER')) {
			handleRest( args, senderId );
			return;
		}
		
		var	curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doRest: invalid token_id');
			sendResponseError(senderId,'Invalid token specified');
			return;
		}
		if (_.isUndefined(timeSpent)) {
			timeSpent = parseInt(attrLookup( charCS, fields.Timespent ) || 0);
		}
		
		switch (restType.toUpperCase()) {
			
		case 'LONG':
			if (timeSpent == 0) {
				sendParsedMsg( tokenID, messages.noLongRest, senderId );
				break;
			}
			handleRest( args, senderId );
			setAttr( charCS, fields.Timespent, 0 );
			sendParsedMsg( tokenID, (messages.restHeader + '{{' + inGameDate(handleTimePassing( charCS, timeSpent )) + '=' + messages.longRest), senderId );
			break;
			
		case 'SHORT':
			handleRest( args, senderId );
			sendParsedMsg( tokenID, messages.shortRest, senderId );
			break;
			
		case 'SELECT':
		default:
			makeRestSelectMenu( args, (timeSpent != 0), senderId );
			break;
			
		}
		return;
	}
	
	/*
	 * Reset a single selected MI Bag slot, so that the 
	 * actual name and speed are displayed.
	 */
	 
	var doResetSingleMI = function( args, senderId, selected ) {
		
		var tokenID = args[0],
			MIrowref = args[1],
			reveal = (args[2] || '').toLowerCase(),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			MIname, MItrueName, item, inHandRow;
			
		if (!charCS) {
			charCS = getObj('character',tokenID);
		}
		if (!charCS) {
			sendDebug('doResetSingleMI: invalid tokenID passed');
			sendError('Internal MagicMaster error');
			return;
		}

		var Items = getTable( charCS, fieldGroups.MI ),
			InHand = getTable( charCS, fieldGroups.INHAND );
		
		if (isNaN(MIrowref)) {
			MIname = MIrowref;
			MIrowref = Items.tableFind( fields.Items_name, MIname );
		} else {
			MIname = Items.tableLookup( fields.Items_name, MIrowref );
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('doResetSingleMI: invalid row reference passed');
			sendError('Internal MagicMaster error');
			return;
		}
		MItrueName = Items.tableLookup( fields.Items_trueName, MIrowref, '-' );
		Items = Items.tableSet( fields.Items_name, MIrowref, MItrueName );
		Items = Items.tableSet( fields.Items_speed, MIrowref, Items.tableLookup( fields.Items_speed, MIrowref ));
		Items = Items.tableSet( fields.Items_type, MIrowref, Items.tableLookup( fields.Items_trueType, MIrowref ));
		Items = Items.tableSet( fields.Items_reveal, MIrowref, '' );
		
		if (!_.isUndefined(inHandRow = InHand.tableFind( fields.InHand_trueName, MItrueName ))) {
			InHand = InHand.tableSet( fields.InHand_name, inHandRow, MItrueName );
		}
		if (MItrueName.trueCompare(attrLookup( charCS, fields.Equip_leftTrueRing ))) setAttr( charCS, fields.Equip_leftRing, MItrueName );
		if (MItrueName.trueCompare(attrLookup( charCS, fields.Equip_rightTrueRing ))) setAttr( charCS, fields.Equip_rightRing, MItrueName );
		if (reveal.toLowerCase() !== 'silent') {
			if (reveal && reveal.length) {
				item = abilityLookup( fields.MagicItemDB, MItrueName, charCS );
				doDisplayAbility( [tokenID,item.dB,MItrueName], senderId, selected );
			} else if (curToken) {
				makeGMonlyMImenu( ['',tokenID,-1,''], senderId, MItrueName+' has been reset' );
			}
		}
		removeMIability( charCS, MIname, Items );
		return;
	}
	
	/*
	 * Set a new maximum number of charges for a Magic Item.  This is
	 * mainly used for magic items that regain a variable number of
	 * charges per day.  Command is either ADD (adds value to current charges
	 * and sets as the max charges), SET (overwrites current max charges),
	 * or DEDUCT (deducts charges from the current number of charges).
	 * SELFCHARGE value 0 sets current to max, 01,02,... (note the preceding 0)
	 * or more increments current by the value unless the max is reached.
	 */
	 
	var doChangeCharges = function( args, selected, senderId ) {
		
		sendWait( senderId, 0 );
		if (!args) return;
		if (!args[0] && args[1] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0] || !args[1]) {
			sendDebug('doChangeCharges: invalid arguments, missing token_id, item name or recharges');
			sendError('Missing item name, recharges or token ID');
			return;
		}
		var tokenID = args[0],
			command = args[1][0] == '-' ? 'DEDUCT' : (args[1][0] == '+' ? 'ADD' : (args[1][0] == '0' ? 'SELFCHARGE' : 'SET')),
			MIname = args[2],
			maxCharges = parseInt(args[3]),
			chargeOverride = args[4] || '',
			success = args[5] || '',
			fail = args[6] || '',
			r, i, m, charges,
			charCS = getCharacter(tokenID);
			
		try {
			charges = args[1].match(/[\d\/\*\+\-]+/);
			charges = Math.abs(eval('0'+charges));
		} catch {
			charges = 0;
		}
		if (!charCS || isNaN(charges)) {
			sendDebug('doNewMaxCharges: invalid token_id or charges');
			sendError('Incorrect MagicMaster syntax');
			return;
		}
		
		var Items = getTable( charCS, fieldGroups.MI );

		if (MIname && MIname.length>0) {
			r = Items.tableFind( fields.Items_trueName, MIname );
		}
		if (_.isUndefined(r)) {
			r = attrLookup( charCS, ['MIrowref', 'current'] );
		}
		if (_.isUndefined(r)) {
			sendDebug('doChangeCharges: magic item "'+MIname+'" not found');
			sendError('Magic Item "'+MIname+'" not found in '+charCS.get('name')+'\'s items');
			return;
		}
		
		var MImaxQty = Items.tableLookup( fields.Items_trueQty, r ) || maxCharges,
			MItype = (chargeOverride || Items.tableLookup( fields.Items_trueType, r ) || '').toLowerCase(),
			absorbing = MItype.includes('absorbing'),
			exploding = MItype.includes('exploding');

		switch (command.toUpperCase()) {
		case 'ADD':
			i = (parseInt( Items.tableLookup(fields.Items_qty, r) ) || 0);      // attrLookup( charCS, fields.Items_qty, fields.Items_table, r ) || 0);
			charges = charges + i;
		case 'SET':
			if (absorbing && isNaN(maxCharges)) maxCharges = MImaxQty;
			if (!isNaN(maxCharges) && maxCharges < charges) charges = maxCharges;
			if (absorbing && (charges > MImaxQty)) {
				if (exploding) {
					handleRemoveMI( ['', tokenID, r, MIname], false, senderId, true );
				} else {
					charges = MImaxQty;
				}
				success = '';
			};
			Items.tableSet( (absorbing ? fields.Items_qty : fields.Items_trueQty), r, charges );
			break;
		case 'DEDUCT':
			if (!handleViewUseMI( ['',tokenID,r], true, senderId, charges, chargeOverride )) success = '';
			break;
		case 'SELFCHARGE':
			i = 1+(parseInt( Items.tableLookup(fields.Items_qty, r) ) || 0);
			m = (!isNaN(maxCharges)) ? maxCharges : (parseInt( Items.tableLookup(fields.Items_trueQty, r) ) || 0);
			if (charges != 0 && i < m) {
				sendAPI('!rounds --target-nosave caster|'+tokenID+'|'+MIname+'-recharge|'+charges+'|-1|'+MIname+' is recharging|stopwatch');
			} else {
				i = m;
			}
			Items.tableSet( fields.Items_qty, r, i );
			Items.tableSet( fields.Items_trueQty, r, m );
			break;
		}
//		sendAPI(fields.attackMaster+' --setAmmo '+tokenID+'|'+MIname+'|'+Items.tableLookup( fields.Items_qty, r )+'|'+Items.tableLookup( fields.Items_trueQty, r )+'|silent');
		
		if (success || fail) {
			sendResponse( charCS, '&{template:'+(success ? fields.menuTemplate : fields.warningTemplate)+'}{{name='+MIname.replace(/-/g,' ')+'}}{{desc='+(success || fail)+'}}' );
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
	 
	var doSpellsMenu = function( args, selected, senderId ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doSpellsMenu: invalid arguments, missing token_id');
			sendResponseError(senderId,'No token selected');
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
			sendResponseError(senderId,'No token specified');
			return;
		}
		
		var muLevel = casterLevel( charCS, 'MU' ),
			prLevel = casterLevel( charCS, 'PR' );
			
		if (isMU) {
			if (muLevel > 0) {
				makeMUSpellsMenu( args, senderId );
			} else {
				sendParsedMsg( tokenID, messages.noMUspellbook, senderId );
			}
		} else if (isPR) {
			if (prLevel > 0) {
				makePRSpellsMenu( args, senderId );
			} else {
				sendParsedMsg( tokenID, messages.noPRspellbook, senderId );
			}
		} else if (isPower) {
			makePowersMenu( args, senderId );
		}

		if (!isMU && !isPR && !isPower) {
			if (muLevel > 0 && prLevel > 0) {
				sendParsedMsg( tokenID, messages.chooseSpellMenu, senderId );
			} else if (muLevel > 0) {
				makeMUSpellsMenu( args, senderId );
			} else if (prLevel > 0) {
				makePRSpellsMenu( args, senderId );
			} else {
				sendParsedMsg( tokenID, messages.noSpellbooks, senderId );
			}
		}
	};
	
	/**
	 * Function to allow the DM to add spells to a spell-storing 
	 * magic item (instead of programming in the database)
	 **/
	 
	var doStoreSpells = function( args, senderId ) {
		
		if (!args) return;
		
		if (args.length < 2) {
			sendDebug('doStoreSpells: invalid number of parameters');
			sendResponseError(senderId,'Invalid MagicMaster parameters');
			return;
		}
		
		var tokenID = args[0],
			item = args[1],
			cmd = (args[2] || '').toUpperCase(),
			level = args[3] || 1,
			retMenu = args[4] || 'VIEW-ITEM',
			charCS = getCharacter(tokenID),
			ability, specs, isSpell, isPower;
			
		if (!charCS) {
			sendDebug('doStoreSpells: invalid token_id');
			sendResponseError(senderId,'Invalid token specified');
			return;
		};
		
		ability = getAbility( fields.MagicItemDB, item, charCS );
		if (!ability.obj || !ability.obj.length) {
			sendDebug('doStoreSpells: invalid item name');
			sendResponseError(senderId,'Invalid item specified');
			return;
		};
		
		isSpell = reCastMIspellCmd.test(ability.obj[1].body);
		isPower = reCastMIpowerCmd.test(ability.obj[1].body);
		if (isSpell || isPower) {
			setCaster( ['MI',tokenID,level,item], '', senderId );
			args.unshift((isSpell && isPower) ? 'BOTH' : (isPower ? 'POWERS' : 'SPELLS'));
			if (!cmd) {
				args[3] = (isSpell ? 'MU' : 'POWER') + (isSpell && isPower ? '-ALL' : '');
			}
			args[4] = level;
			args[5] = retMenu;
			args[6] = '';
			makeSpellsMenu( args, senderId );
		} else {
			sendFeedback( '&{template:'+fields.menuTemplate+'}{{name=Invalid Item}}'
						+ '{{desc='+item+' cannot store spells or powers as it lacks a button to use them.  Choose a different item.}}'
						+ '{{desc1=[Return to main menu](!magic --gm-edit-mi '+tokenID+')}}', flags.feedbackName, fields,feedbackImg, tokenID, charCS );
		};
		return;
	}
			
	/**
	* Deal with the character trying to find traps set on any 
	* target. Generally works best with Drag & Drop containers,
	* otherwise asks the GM if there is a trap.
	**/
	
	var doFindTraps = function( args, senderId ) {
		
		if (!args) return;
		
		var msg = args;
		if (args.length != 3) {
			sendDebug('doFindTraps: invalid number of parameters');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		}
		
		var tokenID = args[0],
			pickID = args[1],
			putID = args[2],
			pickToken = getObj('graphic',pickID),
			charCS = getCharacter( tokenID ),
			putCS = getCharacter( putID ),
			pickCS = getCharacter( pickID ),
			content;
			
		if (!charCS || !putCS || !pickToken) {
			sendDebug('doFindTraps: invalid ID arguments');
			sendResponseError(senderId,'One or more invalid tokens specified');
			return;
		};
		var pickName = pickToken.get('name'),
			putName = putCS.get('name');
		setAttr( putCS, ['target-level', 'current'], (pickCS ? characterLevel(pickCS) : 6) );
		setAttr( putCS, ['target-token', 'current'], pickName );
		
		if (pickCS) {
			setAttr( pickCS, ['search-id', 'current'], pickID );
			setAttr( pickCS, fields.Container_pick, pickID );
			setAttr( pickCS, fields.Container_put, putID );
			setAttr( pickCS, fields.GM_Rolls, (state.MagicMaster.gmRolls ? 'GM-Roll-' : '') );
			setAttr( pickCS, fields.Trap_status, (attrLookup( pickCS, fields.Trap_status ) || 'Armed'));
			setAttr( pickCS, fields.Lock_status, (attrLookup( pickCS, fields.Lock_status ) || 'Locked'));
			let findTraps = findObjs({_type:'ability',characterid:pickCS.id,name:'Trap-2'},{caseInsensitive:true});
			if (findTraps && findTraps.length) {
				sendAPImacro( senderId, putID, pickID, findTraps[0].get('name') );
				sendWait(senderId,0);
				if (csVer(pickCS) < 3.5 && ((attrLookup( pickCS, fields.Gender ) || '').dbName() === 'container')) {
					let lock = (attrLookup( pickCS, fields.Container_lock ) || ''),
						trap = (attrLookup( pickCS, fields.Container_trap ) || '');
					sendAPI( fields.commandMaster + ' --button '+BT.LOCKTYPE+'|'+pickID+'|'+lock+'|silent' );
					sendAPI( fields.commandMaster + ' --button '+BT.TRAPTYPE+'|'+pickID+'|'+trap+'|silent' );
					setAttr( pickCS, fields.msVersion, '3.5' );
				}
				return;
			}
		}
		let chance = Math.max((parseInt(attrLookup( charCS, [fields.Find_Traps[0]+fields.Thief_postfix[0],fields.Find_Traps[1]] )) || 5),5);
		content = '&{template:RPGMwarning}{{desc='+putCS.get('name')+' has just attempted to *Find Traps* on '+pickName+' which does not have a *Trap-2* or *Find Traps* macro. '
				+ 'Their *Find/Remove Traps* chance is [['+chance+']]%}}';
		sendFeedback( content );
		let findTrapMacro = (state.MagicMaster.gmRolls ? 'GM-Roll-' : '')+'Magic-FindTrap';
		getAbility( fields.AbilitiesDB, findTrapMacro, charCS );
		getAbility( fields.AbilitiesDB, 'Magic-NoTrap', charCS );
		getAbility( fields.AbilitiesDB, 'Magic-NotFoundTrap', charCS );
		getAbility( fields.AbilitiesDB, 'Magic-FoundTrap', charCS );
		getAbility( fields.AbilitiesDB, 'Magic-RemoveTrap', charCS );
		getAbility( fields.AbilitiesDB, 'Magic-FoundMagicalTrap', charCS );
		getAbility( fields.AbilitiesDB, 'Magic-RemoveMagicalTrap', charCS );
		content = '&{template:RPGMdefault}{{title=Find Traps}}{{desc=Do you want to search '+pickName+' for traps? Your chance of success would appear to be [['+chance+']]%, but that might alter with circumstance}}{{desc1=[Yes]('+(state.MagicMaster.gmRolls ? ('!magic --display-ability gm|'+putID+'|'+putCS.id+'|GM-Roll-Magic-FindTrap|gm{Find Traps Roll? Chance is '+chance+'%/1d100,[[1d100]]/Succeed,[[1d'+chance+']]/Fail,[['+chance+'+1d'+(99-chance)+']]}') : ('~'+putName+'|Magic-FindTrap'))+') or [No](!magic --message '+tokenID+'|Not Finding Traps|OK, having thought about your chance of success, you decide to let someone else have a go...)}}';
		setAttr( charCS, fields.PlayerID, senderId );
		sendResponse( charCS, content, senderId );

	};

	/**
	* Function to deal with a character interacting with a target, either
	* an inanimate chest or other MI store, or with an animate, possibly
	* intelligent creature that might detect their action.  In either case,
	* the target might also be trapped.
	**/
	
	var doSearchForMIs = function( args, senderId ) {
		
		if (!args) return;
		
		var msg = args;
		if (args.length != 3) {
			sendDebug('doSearchForMIs: invalid number of parameters');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		}
		
		var tokenID = args[0],
			pickID = args[1],
			putID = args[2],
			search = (tokenID === putID),
			containerID = search ? pickID : putID,
			charCS = getCharacter( tokenID ),
			putCS = getCharacter( putID ),
			pickToken = getObj('graphic',pickID),
			pickCS = getCharacter( pickID ),
			containerCS = getCharacter( containerID ),
			MIBagSecurity,
			content;
			
		if (!charCS || !putCS) {
			sendDebug('doSearchForMIs: invalid ID arguments');
			sendResponseError(senderId,'One or more invalid tokens specified');
			return;
		};
		
		if (!pickCS && !!pickToken) {
			doFindTraps( args, senderId );
			return;
		}
		
		if (csVer(containerCS) < 3.5 && ((attrLookup( containerCS, fields.Gender ) || '').dbName() === 'container')) {
			let lock = (attrLookup( containerCS, fields.Container_lock ) || ''),
				trap = (attrLookup( containerCS, fields.Container_trap ) || '');
			sendAPI( fields.commandMaster + ' --button '+BT.LOCKTYPE+'|'+containerID+'|'+lock+'|silent' );
			sendAPI( fields.commandMaster + ' --button '+BT.TRAPTYPE+'|'+containerID+'|'+trap+'|silent' );
			setAttr( containerCS, fields.msVersion, '3.5' );
		}
		
		setAttr( charCS, ['target-level', 'current'], characterLevel(pickCS) );
		setAttr( charCS, ['target-token', 'current'], pickCS.get('name') );
		setAttr( containerCS, ['search-id', 'current'], containerID );
		setAttr( containerCS, fields.Container_pick, pickID );
		setAttr( containerCS, fields.Container_put, putID );
		setAttr( containerCS, fields.GM_Rolls, (state.MagicMaster.gmRolls ? 'GM-Roll-' : '') );
		
		MIBagSecurity = parseInt(attrLookup( containerCS, fields.ItemContainerType )) || 0;
		
		let intelligence = Math.max( (parseInt(attrLookup( containerCS, fields.Intelligence )) || 0), (parseInt(attrLookup( containerCS, fields.Monster_int )) || 0)),
			hp = parseInt(attrLookup( containerCS, fields.HP )) || 0;
			
		if (MIBagSecurity === 6) {
			doPickOrPut( msg, senderId );
		} else if (MIBagSecurity === 4 || MIBagSecurity === 5) {
			var trapVersion = (attrLookup( containerCS, ['trap-version', 'current'] ) || 0),
				trapName = 'trap-'+trapVersion,
				trapMacro = findObjs({ _type : 'ability', characterid : containerCS.id, name : trapName }, {caseInsensitive: true});
			if (!trapMacro || trapMacro.length === 0) {
				trapName = 'Check-for-MIBag-'+trapVersion;
				trapMacro = findObjs({ _type : 'ability', characterid : containerCS.id, name : trapName }, {caseInsensitive: true});
			}
			if (!trapMacro || trapMacro.length === 0) {
				trapName = 'trap';
				trapMacro = findObjs({ _type : 'ability', characterid : containerCS.id, name : trapName }, {caseInsensitive: true});
			}
			if (trapMacro && trapMacro.length) {
				sendAPImacro( senderId, tokenID, containerID, trapName );
				sendWait(senderId,0);
			} else {
				sendDebug('doSearchForMIs: Not found trapMacro');
//				log('doSearchForMIs: Not found trapMacro');
				MIBagSecurity = 1;
			}
		}
		if (!search && MIBagSecurity < 0) {
			sendParsedMsg( putID, messages.noStoring, senderId );
			return;
		} else if (MIBagSecurity < 4 && (!search || MIBagSecurity < 2 || hp <= 0 || intelligence <= 0)) {
			doPickOrPut( msg, senderId );
		} else if (MIBagSecurity < 4) {
			// target is a creature that might detect any snooping.
			// A pick pockets roll is necessary
			
			content = '&{template:'+fields.menuTemplate+'}{{name='+charCS.get('name')+' is Picking Pockets}}'
					+ '{{desc=Are you trying to '+(search ? 'pick ' : 'sneak something into ')+containerCS.get('name')+'\'s pocket?\n'
					+ '[Yes](!magic --pickpockets '+tokenID+'|'+pickID+'|'+putID+'|&#91;&#91;?{Roll vs Pick Pockets|1d100}&#93;&#93;)'
					+ ' or [No](!magic --message '+tokenID+'|Pick Pocket|OK, not making the attempt)}}';

			sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		};
		return;
	}
	
	/**
	 * Function to display the Edit MI Bag menu
	 */
	 
	var doEditMIbag = function( args, senderId, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doEditMIbag: invalid number of parameters');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		}
		
		var tokenID = args[0],
			cmd = (_.isUndefined(args[1]) || args[1].toUpperCase() == 'MAGICAL') ? BT.EDIT_MI : (args[1].toUpperCase() == 'MARTIAL' ? BT.EDIT_MARTIAL : BT.EDIT_ALLITEMS),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doEditMIbag: invalid ID arguments');
			sendResponseError(senderId,'Invalid token specified');
			return;
		};
		
		args = [cmd,tokenID,-1,''];
		makeEditBagMenu( args, senderId );
		return;
	}
	
	/**
	* Function to support picking of pockets and trapped chests, using
	* options and ability macros set in the target character sheet.
	**/
	
	var doPickPockets = function( args, senderId ) {
		
		if (!args) return;
		
		if (args.length != 4) {
			sendDebug('doPickPockets: invalid number of parameters');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		}
		
		var	tokenID = args[0],
			pickID = args[1],
			putID = args[2],
			ppRoll = parseInt(args[3],10),
			search = putID === tokenID,
			containerID = search ? pickID : putID,
			charCS = getCharacter( tokenID );
			
		if (!charCS || !containerID) {
			sendDebug('doPickPockets: invalid ID arguments');
			sendResponseError(senderId,'One or more invalid tokens specified');
			return;
		};
		
		if (isNaN(ppRoll)) {
			sendDebug('doPickPockets: invalid dice roll argument');
			sendResponseError(senderId,'Invalid dice roll entered');
			return;
		};
		
		var pick_pockets = (attrLookup( charCS, [fields.Pick_Pockets[0]+fields.Thief_postfix[0], fields.Pick_Pockets[1]] ) || 5),
			pp_target = (Math.min(Math.ceil(Math.max(pick_pockets,0)),96)),
			content = '&{template:'+fields.menuTemplate+'}{{name='+charCS.get('name')+' is Picking Pockets '+(search ? 'for items' : 'to place items')+'}}'
					+ '{{Target=[['+pp_target+']]}}'
					+ '{{Rolled=[[' + ppRoll + ']]}}'
					+ '{{Result=Rolled<=Target}}';
		
		if (ppRoll <= pp_target) {
			content += '{{desc=Press [Succeeded](!magic --pickorput '+tokenID+'|'+pickID+'|'+putID+') to view items to pick from}}';
		} else {
			args.unshift('PPfailed');
			content += handlePPfailed( args, senderId );
		}
		
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	};


	/*
	* Function to display the menu for picking up or putting away Magic Items
	* from one Magic Item bag into another Magic Item bag.
	*/

	var doPickOrPut = function( args, senderId ) {
		
		if (!args) return;
		
		if (args.length < 3 || args.length > 4) {
			sendDebug('doPickOrPut: Invalid number of arguments');
			sendError(senderId,'Invalid MagicMaster command syntax');
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
			sendError(senderId,'One or more invalid tokens specified');
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
			
		setAttr( charCS, fields.ItemRowRef, -1 );
		setAttr( charCS, fields.ItemCastingTime, 0 );
		setAttr( charCS, [fields.Expenditure[0],'current'], 0 );
		setAttr( charCS, [fields.Expenditure[0],'max'], 0 );
		
		args = ['POPmenu',tokenID,-1,pickID,putID,-1];
		
		makeShortPOPmenu( args, senderId );
		
		return;

	};
	
	/*
	 * Add a magic item directly to a creature or container, with 
	 * additional options to replace another item and/or take the
	 * added item in-hand
	 */
	 
	var doAddItem = function( args, senderID, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doEditMIbag: invalid number of parameters');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		}
		
		var tokenID = args[0],
			miRowRef = args[1],
			miChosen = args[2],
			miQty = args[3] || 0,
			miInHand = (args[4] || '='),
			isGM = (args[5] || '').toUpperCase() === 'NOCURSE',
			hand = '',
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doAddItem: invalid ID argument');
			sendResponseError(senderId,'Invalid token specified');
			return;
		};
		
		if (miRowRef.length && isNaN(miRowRef) && miInHand === '=') {
			hand = getTableField( charCS, {}, fields.InHand_table, fields.InHand_trueName ).tableFind( fields.InHand_trueName, miRowRef );
			miInHand = _.isUndefined(hand) ? '' : hand;
			hand = (miRowRef === attrLookup( charCS, fields.Equip_leftTrueRing) || miRowRef === attrLookup( charCS, fields.Equip_rightTrueRing )) ? '=' : '';
		};
		
		args.unshift('');
		args[2] = String(miInHand).length && !isNaN(miInHand) ? 'inhand/'+miInHand : (String(miRowRef).length && !isNaN(miRowRef) ? miRowRef : hand);
		args[3] = String(miRowRef).length && !isNaN(miRowRef) ? miRowRef : miChosen+'/'+miRowRef;
		args.splice(5,2);
		
		handleStoreMI( args, isGM, senderID );
	};
	
	/*
	 * Handle the Config command, to configure the API
	 */
	 
	var doConfig = function( args ) {
		
		if (!args || args.length < 2) {
			makeConfigMenu( args );
			return;
		}
		
		var flag = args[0].toLowerCase(),
			value = args[1].toLowerCase() === 'true',
			msg = '';
		
		switch (flag.toLowerCase()) {
		case 'fancy-menus':
			state.MagicMaster.fancy = value;
			if (!_.isUndefined(state.attackMaster.fancy)) state.attackMaster.fancy = value;
			msg = value ? 'Fancy menus will be used' : 'Plain menus will be used';
			break;
			
		case 'specialist-rules':
			state.MagicMaster.spellRules.specMU = value;
			msg = value ? 'Only rules-based specialists get extra spell' : 'Any specialist gets extra spell';
			break;
			
		case 'spell-num':
			state.MagicMaster.spellRules.strictNum = value;
			msg = value ? 'Spells per level restricted to rules' : 'Misc spells per level supported';
			break;
			
		case 'all-spells':
			state.MagicMaster.spellRules.allowAll = value;
			msg = value ? 'Spell Schools/Spheres not restricted' : 'Spell Schools/Spheres restricted by Class';
			break;
			
		case 'all-powers':
			state.MagicMaster.spellRules.allowAnyPower = value;
			msg = value ? 'Class Powers not restricted by level' : 'Class Powers restricted by level';
			break;
			
		case 'custom-spells':
			state.MagicMaster.spellRules.denyCustom = value;
			msg = value ? 'Custom Spells only from user databases' : 'Distributed custom spells allowed';
			updateDBindex(true);
			break;
			
		case 'auto-hide':
			state.MagicMaster.autoHide = value;
			msg = value ? 'Hideable items hidden automatically' : 'Hideable items hidden manually';
			break;
			
		case 'reveal':
			state.MagicMaster.reveal = value;
			msg = value ? 'Hidden items revealed when used' : 'GM reveals hidden items manually';
			reSpellSpecs.reveal.def = value ? 'use' : '';
			break;
			
		case 'view-action':
			state.MagicMaster.viewActions = value;
			msg = value ? 'Item/Spell action buttons active when viewing' : 'Item/Spell action buttons greyed out when viewing';
			break;
			
		case 'alpha-lists':
			state.MagicMaster.alphaLists = value;
			msg = 'Lists will '+(value ? '' : 'not')+' be alphabeticised';
			break;			
			
		case 'gm-rolls':
			state.MagicMaster.gmRolls = value;
			msg = value ? 'GM rolls skill-based chances' : 'Player rolls skill-based chances';
			break;
			
		default:
			sendError('Invalid Config Command syntax');
			return;
		}
		makeConfigMenu( args, msg );
		return;
	}
	
	/**
	 * Set options for a particular player
	 **/
	 
	var doSetOptions = function( args, senderId ) {
		
		if (!args) return;
		
		if (args.length != 2) {
			sendDebug('doSetOptions: invalid argument pair.  Must be [option|value]');
			sendError('Invalid MagicMaster command syntax');
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
		content = '&{template:'+fields.menuTemplate+'}{{name='+playerName+'\'s MagicMaster options}}';

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
			
		case 'menudisplay':
			value = value.toLowerCase();
			 if (!['images','plain','dark'].includes(value)) {
				sendResponseError( senderId, 'Invalid menuDisplay option.  Use images, plain, or dark.' );
				return;
			}
			config.menuImages = (value === 'images');
			config.menuPlain = (value === 'plain');
			config.menuDark = (value === 'dark');
			config = getSetPlayerConfig(senderId,config);
			doDispConfig(senderId);
			redisplayOutput(senderId);
			break;
		   
		default:
			sendResponseError( senderId, 'Invalid MagicMaster option. [Show Help](!magic --help)');
			break;
		};
		return config;
	};
	
	/**
	 * Present a menu to select player-specific chat display options 
	 **/

	var doDispConfig = function( senderId ) {

		let config = getSetPlayerConfig( senderId ) || {};
		if (!config) config = {menuImages:state.MagicMaster.fancy, menuPlain:!state.MagicMaster.fancy, menuDark:false};
		let player = getObj('player',senderId);
		let content = '/w "' + player.get('_displayname') + '" ' + design.info_msg
					+ '<table>'
					+ '<tr><td>Menu images</td><td><a style= "width: 16px; height: 16px; border: none; background: none" title="Menus with Images" href="!magic --options menudisplay|images">'+(config.menuImages ? '\u2705' : '\u2B1C')+'</a></td></tr>'
					+ '<tr><td>Menu plain</td><td><a style= "width: 16px; height: 16px; border: none; background: none" title="Tabulated Menus" href="!magic --options menudisplay|plain">'+(config.menuPlain ? '\u2705' : '\u2B1C')+'</a></td></tr>'
					+ '<tr><td>Menu dark</td><td><a style= "width: 16px; height: 16px; border: none; background: none" title="Dark Mode Menus" href="!magic --options menudisplay|dark">'+(config.menuDark ? '\u2705' : '\u2B1C')+'</a></td></tr>'
					+ '</table></div>';
		sendAPI( content, senderId, '', true );
		return;
	}
	
	/**
	 * Add or subtract an increment to the Strength value, 
	 * taking into account any Exceptional Strength set
	 **/
	 
	var doStrengthChange = function( args, senderId, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doStrengthChange: Invalid number of arguments');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		};

		var tokenID = args[0],
			increment = args[1],
			field = args[2] || fields.Strength[0],
			silent = (args[3] || 'SILENT').toUpperCase() == 'SILENT',
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doStrengthChange: invalid ID argument');
			sendResponseError(senderId,'One or more invalid tokens specified');
			return;
		};
		handleStrengthChange( charCS, field, increment, senderId, silent );
		return;
	}

	/**
	 * Boost or drain levels from the selected character/creature. The handler 
	 * will ask from which class when multi-class character is selected and 
	 * the class to change is not in the argument list
	 **/
	 
	var doLevelChange = function( args, senderId, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doStrengthChange: Invalid number of arguments');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		};

		var change = (parseInt(args[1]) || -1),
			charCS = getCharacter(args[0]);
			
		if (!charCS) {
			sendDebug('doLevelChange: invalid ID argument');
			sendResponseError(senderId,'One or more invalid tokens specified');
			return;
		};
		if (!change || isNaN(change)) {
			sendDebug('doLevelChange: invalid level change value');
			sendResponseError(senderId,'Level change requested ('+args[1]+') is invalid');
			return;
		};
		
		handleLevelDrain( [args[0],args[1],'','',args[2],'',args[3]], senderId );	
	}

	/**
	 * Present the Magic Item Bag menu for the tokenID passed, if it has one
	 **/

	var doMIBagMenu = function( args, senderId, selected ) {
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doMIBagMenu: Invalid number of arguments');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		};

		var tokenID = args[0],
			curToken = getObj( 'graphic', tokenID );
			
		if (!curToken){
			sendDebug('doMIBagMenu: Invalid tokenID: ' + tokenID);
			sendResponseError(senderId,'Invalid token specified');
			return;
		}
		
		var charID = curToken.get('represents'),
			tokenName = curToken.get('name'),
			ppt, ppTarget, ppTargetMax,
			content, menuType,
			charCS = getObj( 'character', charID ),
			charName = charCS.get('name');

		ppt = (attrLookup( charCS, ['ppt', 'current'] ) || 5);
		ppTarget = Math.min(Math.ceil(1.5*Math.max(ppt,0)),96);
		ppTargetMax = Math.min(Math.ceil(Math.max(ppt,0)),96);
		
		content = '&{template:'+fields.menuTemplate+'} {{name=' + tokenName + '\'s\n'
				+ 'Magic Items menu}}{{desc=[Use a Magic Item](!magic --use-mi '+tokenID+')\n'
				+ '[Find Traps](!magic --find-traps '+tokenID+'|&#64;{target|Search Where?|token_id}|'+tokenID+')\n'
				+ '[Search for Items & Treasure](!magic --search '+tokenID+'|&#64;{target|Search Where?|token_id}|'+tokenID+')\n'
				+ '[Store Items](!magic --search '+tokenID+'|'+tokenID+'|&#64;{target|Store Where?|token_id})\n'
				+ '[Change Your Items](!magic --edit-mi '+tokenID+')\n'
				+ '[View your Item bag](!magic --view-mi '+tokenID+')}}';
				
		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
	};
	
	/*
	 * Call up the GM's Edit MI bag menu, which allows the GM
	 * change MIs to be cursed, hide the real name, reveal items
	 * once identified, change displayed & actual quantities etc.
	 */
	 
	var doGMonlyMImenu = function( args, senderId, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doGMonlyMImenu: Invalid number of arguments');
			sendError('Invalid MagicMaster syntax');
			return;
		};

		var tokenID = args[0];
		
		args.push( tokenID, -1, '' );
		
		makeGMonlyMImenu( args, senderId );
		return;
	}
	
	/*
	 * Set when a hidden item should be revealed to the player. This 
	 * can be when the item is first viewed, first used, after a long 
	 * rest, or only manually by the GM using the GM-edit-MI Reset Single
	 * function.
	 */
	 
	var doSetReveal = function( args, senderId, selected ) {
		
		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doGMonlyMImenu: Invalid number of arguments');
			sendError('Invalid MagicMaster syntax');
			return;
		};

		var tokenID = args[0],
			hiddenItem = args[1] || '',
			revealType = (args[2] || '').toLowerCase(),
			MIrowref = parseInt(args[3]),
			dispMenu = (args[4] || '').toUpperCase() === 'MENU',
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doSetReveal: Invalid tokenID: ' + tokenID);
			sendError('Invalid token specified');
			return;
		}

		if (revealType && !['view','use','rest'].includes(revealType)) {
			sendDebug('doSetReveal: Invalid reveal type: ' + revealType);
			sendError('Invalid reveal type specified');
			return;
		}
		
		var Items = getTable( charCS, fieldGroups.MI );

		if (isNaN(MIrowref)) {
			MIrowref = parseInt(Items.tableFind( fields.Items_trueName, hiddenItem ));
		}
		if (isNaN(MIrowref)) {
			sendDebug('doSetReveal: Item not found: ' + hiddenItem);
			sendError('Invalid Item specified');
			return;
		}
		
		Items.tableSet( fields.Items_reveal, MIrowref, revealType );
		
		if (dispMenu) {
			makeGMonlyMImenu( ['', tokenID, -1, ''], senderId, 'Set '+hiddenItem+' to be revealed '+(!revealType ? 'manually by GM' : ('on '+revealType)) );
		}
		return;
	};
	
	/*
	 * RED: v1.012 A menu to allow players to choose light sources
	 */
	
	var doLightSourcesMenu = function( args, senderId, selected ) {

		if (!args) args=[];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doLightSourcesMenu: Invalid number of arguments');
			sendResponseError(senderId,'Valid token not specified');
			return;
		};

		var tokenID = args[0],
			curToken = getObj( 'graphic', tokenID );
			
		if (!curToken){
			sendDebug('doLightSourcesMenu: Invalid tokenID: ' + tokenID);
			sendResponseError(senderId,'Invalid token specified');
			return;
		}
		
		var charCS = getCharacter( tokenID );
		if (!charCS) {
			sendDebug('doLightSourcesMenu: Invalid tokenID: ' + tokenID);
			sendResponseError(senderId,'Invalid token specified');
			return;
		}

		var lightSource = attrLookup( charCS, fields.LightSource ) || 'None',
			weaponSwitch = (lightSource == 'Weapon') ? ('<td><span style='+design.green_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Weapon)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			torchSwitch = (lightSource == 'Torch') ? ('<td><span style='+design.green_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Torch)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			hoodedSwitch = (lightSource == 'Hooded') ? ('<td><span style='+design.green_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Hooded)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			bullseyeSwitch = (lightSource == 'Bullseye') ? ('<td><span style='+design.green_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Bullseye)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			contLightSwitch = (lightSource == 'ContLight') ? ('<td><span style='+design.green_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|ContLight)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			beaconSwitch = (lightSource == 'Beacon') ? ('<td><span style='+design.green_button+'>On</span></td><td>[Off](!magic --changelight '+tokenID+'|None)</td>')
													 : ('<td>[On](!magic --changelight '+tokenID+'|Beacon)</td><td><span style='+design.grey_button+'>Off</span></td>'),
			
			content = '&{template:'+fields.menuTemplate+'}{{name=Manage '+curToken.get('name')+'\'s Light Sources}}'
					+ '{{desc=Current state indicated by a green button like <span style='+design.green_button+'>On</span>. '
					+ 'Select a red button to turn the current source off and choose a different one.}}'
					+ '{{desc1=In order of illumination<table>'
					+ '<tr><td>Magic Weapon</td><td>5ft</td>'+weaponSwitch+'</tr>'
					+ '<tr><td>Torch</td><td>15ft</td>'+torchSwitch+'</tr>'
					+ '<tr><td>Hooded Lantern</td><td>30ft</td>'+hoodedSwitch+'</tr>'
					+ '<tr><td>Bullseye Lantern</td><td>60ft beam</td>'+bullseyeSwitch+'</tr>'
					+ '<tr><td>Cont-Light gem</td><td>60ft</td>'+contLightSwitch+'</tr>'
					+ '<tr><td>Beacon Lantern</td><td>240ft beam</td>'+beaconSwitch+'</tr>'
					+ '</table>}}';
					

		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );
		return;
	}
	
	var doLightSource = function( args, dispMenu, senderId ) {
		
		if (!args) return;
		
		if (args.length != 2) {
			sendDebug('doLightSource: Invalid number of arguments');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		};

		var tokenID = args[0],
			newSource = args[1],
			curToken = getObj( 'graphic', tokenID );
			
		if (!curToken){
			sendDebug('doLightSource: Invalid tokenID: ' + tokenID);
			sendResponseError(senderId,'Invalid token specified');
			return;
		}
		
		var charCS = getCharacter( tokenID );
		if (!charCS) {
			sendDebug('doLightSource: Invalid tokenID: ' + tokenID);
			sendResponseError(senderId,'Invalid token specified');
			return;
		}

		switch (newSource.toLowerCase()) {
		case 'none':
			curToken.set({emits_bright_light: false, emits_low_light: false,
			bright_light_distance: 0,  low_light_distance: 0,
			has_directional_bright_light: false, has_directional_dim_light: false,
			directional_dim_light_centre: 180, directional_dim_light_total: 360,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
			
		case 'weapon':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 1,  low_light_distance: 5,
			has_directional_bright_light: false, has_directional_dim_light: false,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
			
		case 'torch':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 1,  low_light_distance: 15,
			has_directional_bright_light: false, has_directional_dim_light: false,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
		
		case 'hooded':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 15, low_light_distance: 30,
			has_directional_bright_light: false, has_directional_dim_light: false,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
		
		case 'contlight':
			curToken.set({emits_bright_light: true, emits_low_light: true,
			bright_light_distance: 50, low_light_distance: 60,
			has_directional_bright_light: false, has_directional_dim_light: false,
			directional_bright_light_centre: 180, directional_bright_light_total: 360});
			break;
		
		case 'bullseye':
			curToken.set({emits_bright_light: true, emits_low_light: false, 
			bright_light_distance: 60, low_light_distance: 60,
			has_directional_bright_light: true, has_directional_dim_light: false,
			directional_bright_light_centre: 180, directional_bright_light_total: 19});
			break;
		
		case 'beacon':
			curToken.set({emits_bright_light: true, emits_low_light: false, 
			bright_light_distance: 240, low_light_distance: 240,
			has_directional_bright_light: true, has_directional_dim_light: false,
			directional_bright_light_centre: 180, directional_bright_light_total: 21});
			break;
			
		default:
			sendDebug( 'doLightSource: Invalid light source type '+newSource );
			sendResponseError(senderId,'Invalid light source specified');
			break;
		}
		
		setAttr( charCS, fields.LightSource, newSource );
		
		if (dispMenu) {
			doLightSourcesMenu( args, senderId );
		} else {
			sendWait(senderId,0);
		}
		return;
	}
	
	/*
	 * Display a simple message to the specified range of players
	 */
	 
	var doMessage = function( args, selected, senderId ) {
		
		if (!args) args = [];
		
		if (!args[1] && selected && selected.length) {
			args[1] = selected[0]._id;
		} else if (!args[1]) {
			sendDebug( 'doMessage: tokenID is invalid' );
			sendError( 'No token selected' );
			return;
		}	
		
		if (args.length <=2) {
			sendDebug('doMessage: Invalid number of arguments');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		};

		var cmd = args[0],
			tokenID = args[1],
			charCS = getCharacter(tokenID);
			
		if (!getObj('graphic',tokenID) && !charCS) {
			args.unshift('standard');
			cmd = args[0];
			tokenID = args[1]
			charCS = getCharacter(tokenID);
		}
		
		var msg = '&{template:'+fields.messageTemplate+'}{{name=' + (args[2] || '') + '}}{{desc=' + parseStr(args[3] || '',msgReplacers) + '}}';
		const reAttrs = /\^\^([^\|\^]+)\|?(max|current)?\|?([^\|\^]+)?\^\^/i;
		const attrRes = ( a, v, m = 'current', d = '0' ) => attrLookup( charCS, [v,m,d] ) || '';
		
		while (reAttrs.test(msg)) msg = msg.replace(reAttrs,attrRes);
		
		switch (cmd.toLowerCase()) {
		case 'gm':
			sendFeedback(msg);
			sendWait(senderId,0);
			break;
		case 'whisper':
		case 'w':
			sendResponse(charCS,msg,senderId);
			break;
		case 'character':
		case 'c':
			sendResponse(charCS,msg);
			break;
		case 'standard':
		default:
			msg = sendMsgToWho(charCS,senderId,msg);
		case 'public':
			sendPublic(msg,charCS,senderId);
			break;
		}
		if (args[4] && args[4].length && args[4][0] === '!') {
			sendAPI( parseStr(args[4],msgReplacers), senderId );
		}
	}

	/*
	 * Tidy up a specified character sheet, removing Spell and Magic Item 
	 * attribute and ability objects that are no longer for items held and 
	 * spells no longer in any spell book.  Attack ability objects will all 
	 * be removed.  All of these will be recreated as and when these items, 
	 * spells or attacks are again picked up, added to spell books, or used 
	 * for attacks.
	 */
	 
	var doTidyCS = function( args, selected ) {
		
		var tokenList = [];
		if (args && args[0]) {
			let token = getObj('graphic',args[0]);
			if (!token) {
				sendDebug('doTidyCS: Invalid tokenID argument');
				sendError('Valid token not specified');
				return;
			}
			tokenList.push(token);
		} else if (selected && selected.length) {
			selected.map( s => tokenList.push(getObj('graphic',s._id)));
		}
				
		handleCStidy( tokenList, (args[1] || '').toUpperCase() === 'SILENT' );
		return;
	}
		

	/*
	 * check for correct syntax of a 'write database' command, then
	 * call the function to write the specified character sheet database
	 * to a handout in object format to be cut&pasted to an API
	 */
	 
	var doWriteDB = function(args) {
		
		var dbName = args[0],
			dbVersion = args[1],
			filter = args[2] || '',
			dbHandout;
			
		if (dbVersion && dbVersion.length && (dbVersion !== '=') && isNaN(parseFloat(dbVersion))) {
			sendError( 'Invalid database version number' );
			return;
		};
			
		if (dbName && dbName.length) {
			if (!(dbHandout = saveDBtoHandout( dbName, dbVersion, filter ))) {
				sendError( 'Unable to write db object for '+dbName );
			} else {
				sendFeedback( 'Created db object in handout '+dbHandout.get('name'), flags.feedbackName );
			}
			
		} else {
			sendFeedback('Writing all api databases extracted as character sheets to handouts',flags.feedbackName);
			_.each( dbNames, (db,k) => saveDBtoHandout( k.replace(/_/g,'-'), dbVersion ));
		}
			
		return;
	};
		
	/*
	 * Update databases to latest versions held in API
	 */
 
	async function doUpdateDB(args, senderId, silent) {
		
		try {
			var dbName = args[0],
				forceIndexUpdate = false;
			
			if (dbName && dbName.length) {
				let dbLabel = dbName.replace(/-/g,'_');
				let dbList = Object.keys(dbNames).filter(k => k.startsWith(dbLabel));
				if (dbList && dbList.length > 1) {
					sendFeedback('&{template:'+fields.messageTemplate+'}{{title=Extract Database}}{{desc=Multiple databases start with '+dbName+'. [Select the one you want](!magic --extract-db ?{Choose which to extract|'+dbList.join('|')+'}) }}',senderId);
					return;
				} else if (!dbList || !dbList.length || !dbNames[dbLabel]) {
					sendError('Not found database '+dbName);
				} else {
					log('Updating database '+dbName);
					sendFeedback('Updating database '+dbName,flags.feedbackName,flags.feedbackImg);
					let result = await buildDB( dbName, dbNames[dbLabel], senderId, silent );
					forceIndexUpdate = true;
				}
			} else if (_.some( dbNames, (db,dbName) => db.api.includes('magic') && checkDBver( dbName, db, silent ))) {
				log('Updating all MagicMaster databases');
				sendFeedback(design.info_msg+'Updating all MagicMaster databases</div>',flags.feedbackName,flags.feedbackImg);
				_.each( dbNames, (db,dbName) => {
					if (db.api.includes('magic')) {
						let dbCS = findObjs({ type:'character', name:dbName.replace(/_/g,'-') },{caseInsensitive:true});
						if (dbCS && dbCS.length) {
							setAttr( dbCS[0], fields.dbVersion, 0 );
						}
					}
				});
				for (const name in dbNames) {
					if (dbNames[name].api.includes('magic')) {
						let result = await buildDB( name, dbNames[name], senderId, silent );
					}
				}
				forceIndexUpdate = true;

			};
			apiDBs.magic = true;
			sendAPI('!attk --index-db magic');
			sendAPI('!cmd --index-db magic');
			updateDBindex(forceIndexUpdate);
			return;
		} catch (e) {
			sendCatchError('MagicMaster',(senderId ? msg_orig[senderId] : null),e,('MagicMaster doUpdateDB()'));
		}
	}
	
	/*
	 * Copy ability macros that include API commands that affect or 
	 * use token markers into a user-supplied database to allow 
	 * GMs / game creators to change markers easily
	 */
 
	var doExtractMarkers = function (args) {
		
		var APIdbName = args[0],
			UserDbName = args[1],
			itemClass = args[2] || 'specs',
			result, dbLabel, rootDB;
		
		if (APIdbName && APIdbName.length && UserDbName && UserDbName.length) {
			dbLabel = UserDbName.replace(/-/g,'_');
			if (dbNames[dbLabel]) {
				sendError(UserDbName+' is an API dataabse and cannot be overwritten');
				return;
			}
			sendFeedback('Copying marker commands from '+APIdbName+' and merging with '+UserDbName,flags.feedbackName);
			copyMarkerCSdb( APIdbName, UserDbName, itemClass );
		} else {
			sendError('Invalid parameters');
		};
		
		return;
	}
	
	/*
	 * Set the SpellCharges attribute on the selected character to 
	 * the number of charges left on the specified spell, power or item
	 */
	 
	var doSetCharges = function( args, selected, senderId ) {
		
		if (!args) args=[];
		if ((!args[0] || !args[0].length) && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doSetCharges: Invalid number of arguments');
			sendResponseError(senderId,'Invalid MagicMaster command syntax');
			return;
		};

		var tokenID = args[0],
			type = (args[1] || 'MI').toUpperCase(),
			item = args[2] || '-',
			silent = ((args[3] || '').toLowerCase() === 'silent'),
			charCS = getCharacter(tokenID),
			qty, tables, index;
			
		if (!charCS) {
			sendDebug('doSetCharges: invalid ID argument');
			sendResponseError(senderId,'One or more invalid tokens specified');
			return;
		};
		if (!['MU','PR','POWER','MI','MIPOWER'].includes(type)) {
			sendDebug('doSetCharges: invalid item type '+type+'. Should be one of MU, PR, POWER, or MI');
			sendError('Invalid item type specified');
			return;
		};
		
		if (type === 'MI') {
			tables = getTableField( charCS, {}, fields.Items_table, fields.Items_trueName );
			index = tables.tableFind( fields.Items_trueName, item );
			if (!_.isUndefined(index)) {
				tables = getTableField( charCS, tables, fields.Items_table, fields.Items_qty );
				qty = tables.tableLookup( fields.Items_qty, index, false );
			};
		} else {
			var levelSpells = shapeSpellbook( charCS, type );
			for (let lv=1; lv < levelSpells.length && _.isUndefined(qty); lv++) {
				let c = levelSpells[lv].base;
				let w = 1;
				do {
					tables = getTableField( charCS, {}, fields.Spells_table, fields.Spells_name, c );
					index = tables.tableFind( fields.Spells_name, item );
					if (!_.isUndefined(index)) {
						tables = getTableField( charCS, tables, fields.Spells_table, fields.Spells_castValue, c );
						qty = tables.tableLookup( fields.Spells_castValue, index, false );
					};
					c++;
				} while ((w <= fields.SpellsCols) && _.isUndefined(qty));
			};
		};
		
		setAttr( charCS, fields.SpellCharges, (_.isUndefined(qty) ? '0' : String(qty)) );
		
		if (silent) return qty;
		
		let content = '&{template:'+fields.messageTemplate+'}{{name=Quantity of '+item+'}}{{desc='+(_.isUndefined(qty) ? (item+' has not been found on '+charCS.get('name')) : (charCS.get('name')+' has '+qty+' '+item+'s'))+'}}';
		sendResponse( charCS, content, senderId );
	};
	
	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, senderId, selected ) {

		if (!args) return;
		
		var	handler = args[0].toUpperCase();

		switch (handler) {

		case BT.VIEWMI_OPTION:
		case BT.USEMI_OPTION:
		case BT.EDITMI_OPTION:
		case BT.EDITMARTIAL_OPTION:
		case BT.EDITALLITEMS_OPTION:
		case BT.PICKMI_OPTION:
		case BT.PUTMI_OPTION:
		case BT.ALPHALIST_OPTION:
		
			handleOptionButton( args, senderId );
			break;

		case BT.MU_SPELL :
		case BT.PR_SPELL :
		case BT.MI_SPELL :
		case BT.MI_POWER :
		case BT.POWER :
		
			handleChooseSpell( args, senderId );
			break;
			
		case BT.CAST_MUSPELL :
		case BT.CAST_PRSPELL :
		case BT.CAST_MISPELL :
		case BT.CAST_MIPOWER :
		case BT.CAST_SCROLL :
		case BT.USE_POWER :
		
			handleCastSpell( args, senderId );
			break;
			
		case BT.EDIT_MUSPELLS :
		case BT.EDIT_PRSPELLS :
		case BT.EDIT_POWERS :
		case BT.EDIT_MIPOWERS :
		
			handleRedisplayManageSpells( args, senderId );
			break;
			
		case BT.VIEW_MUSPELL :
		case BT.VIEW_PRSPELL :
		case BT.VIEW_POWER :
		case BT.VIEW_MI_MUSPELL :
		case BT.VIEW_MI_PRSPELL :
		case BT.VIEW_MI_POWER :
		case BT.VIEW_MI_SPELL :
		case BT.REVIEW_MUSPELL :
		case BT.REVIEW_PRSPELL :
		case BT.REVIEW_POWER :
		case BT.REVIEW_MI :
		case BT.REVIEW_MARTIAL_MI :
		case BT.REVIEW_ALLITEMS_MI :
		case BT.REVIEW_MIPOWER :
		case 'GM-REVIEWMI' :
			 
			handleReviewSpell( args, senderId );
			break;
			
		case BT.MEM_MUSPELL :
		case BT.MEM_PRSPELL :
		case BT.MEM_POWER :
		case BT.MEM_MIPOWER :
			 
			handleMemoriseSpell( args, senderId );
			break;
			
		case BT.MEMALL_POWERS :
		
			handleMemAllPowers( args, senderId );
			break;
			
		case BT.VIEWMEM_MUSPELLS :
		case BT.VIEWMEM_PRSPELLS :
		case BT.VIEWMEM_POWERS :
		case BT.VIEWMEM_MI_MUSPELLS :
		case BT.VIEWMEM_MI_PRSPELLS :
		case BT.VIEWMEM_MI_SPELLS :
		case BT.VIEWMEM_MI_POWERS :
		
			makeViewMemSpells( args, senderId );
			break;
			
		case BT.LEARNT_MUSPELL :
		
			handleLearnSpell( args, senderId );
			break;
			
		case BT.EDIT_NOSPELLS:
		
			makeMiscSpellsEdit( args, senderId );
			break;
			
		case BT.MISC_SPELL:
		
			handleSetMiscSpell( args, senderId );
			break;
			
		case BT.CHOOSE_VIEW_MI:
		case BT.CHOOSE_USE_MI:
		
			makeViewUseMI( args, senderId );
			break;
			
		case BT.REDO_CHOOSE_MI:
		case BT.REDO_MARTIAL_MI:
		case BT.REDO_ALLITEMS_MI:
			
			makeEditBagMenu( args, senderId );
			break;
			
		case BT.VIEW_MI:
		case BT.USE_MI:
			handleViewUseMI( args, playerIsGM(senderId), senderId );
			break;
			
		case BT.ADD_MIROW:
			
			handleAddMIrow( args, senderId );
			break;
			
		case BT.MU_TO_STORE:
		case BT.PR_TO_STORE:
		case BT.MU_MI_SLOT:
		case BT.PR_MI_SLOT:
		case BT.MU_TO_STORE_ANY:
		case BT.PR_TO_STORE_ANY:
		case BT.MU_MI_SLOT_ANY:
		case BT.PR_MI_SLOT_ANY:
		case BT.MU_TO_STORE_ADD:
		case BT.PR_TO_STORE_ADD:
		case BT.MU_MI_SLOT_ADD:
		case BT.PR_MI_SLOT_ADD:
		
			handleSelectMIspell( args, senderId );
			break;
			
		case BT.MISTORE_MUSPELL:
		case BT.MISTORE_PRSPELL:
		case BT.MISTORE_MUSPELL_ANY:
		case BT.MISTORE_PRSPELL_ANY:
		case BT.MISTORE_MUSPELL_ADD:
		case BT.MISTORE_PRSPELL_ADD:
		
			handleStoreMIspell( args, senderId );
			break;
			
		case BT.MI_POWER_USED:

			handleSelectMIpower( args, true, senderId );
			break;
			
		case BT.MI_POWER_CHARGE_USED:
		
			handleSelectMIpower( args, false, senderId );
			break;
			
		case BT.LEVEL_CHANGE:
		
			args.shift();
			handleLevelDrain( args, senderId );
			break;
			
		case 'CHOOSE_SPELLS':
		case 'CHOOSE_POWERS':
		case 'CHOOSE_BOTH':
		
			makeSpellsMenu( args, senderId );
			break;
			
		case 'REVIEW_SPELLS':
		case 'REVIEW_POWERS':
		case 'REVIEW_BOTH':
		
			handleRevStore( args, senderId );
			break;
			
		case 'ADD_TO_SPELLS':
		case 'ADD_TO_POWERS':
		case 'ADD_TO_BOTH':
		case 'ADD_PWR_TO_SPELLS':
		case 'ADD_PWR_TO_POWERS':
		case 'ADD_PWR_TO_BOTH':
		case 'DEL_SPELLS':
		case 'DEL_POWERS':
		case 'DEL_BOTH':
		case 'DEL_PWR_FROM_SPELLS':
		case 'DEL_PWR_FROM_POWERS':
		case 'DEL_PWR_FROM_BOTH':
		
			handleChangeSpellStore( args, senderId );
			break;

		case BT.POP_PICK :
		
			makeShortPOPmenu( args, senderId );
			break;
			
		case 'POPQTY' :
		case 'POPBUY' :
		case 'POPRENAME' :
		case 'POPSUBMIT' :
		case BT.POP_STORE :
			
			sendWait( senderId, 1 );
			setTimeout( handlePickOrPut, 10, args, senderId );
			break;
			
		case 'PPFAILED' :
		
			handlePPfailed( args, senderId );
			break;
			
		case 'POPTREASURE' :
		
			handleTreasure( args, senderId );
			break;
			
		case 'GM-MIMENU':
		
			makeGMonlyMImenu( args, senderId );
			break;
			
		case BT.CHOOSE_MI :
		case BT.CHOOSE_MARTIAL_MI:
		case BT.CHOOSE_ALLITEMS_MI:
		case 'GM-MITOSTORE':
		
			handleSelectMI( args, (handler === 'GM-MITOSTORE'), senderId );
			break;
			
		case BT.SLOT_MI :
		case BT.SLOT_MARTIAL_MI:
		case BT.SLOT_ALLITEMS_MI:
		case 'GM-MISLOT':
		
			handleSelectSlot( args, (handler == 'GM-MISLOT'), senderId );
			break;
			
		case BT.STORE_MI :
		case BT.STORE_MARTIAL_MI:
		case BT.STORE_ALLITEMS_MI:
		case 'GM-STOREMI':
		
			handleStoreMI( args, (handler.toUpperCase() == 'GM-STOREMI'), senderId );
			break;
			
		case 'GM-HIDEMI':
		
			handleHideMI( args, senderId );
			break;
			
		case BT.REMOVE_MI :
		case BT.REMOVE_MARTIAL_MI:
		case BT.REMOVE_ALLITEMS_MI:
		case 'GM-DELMI':
		
			handleRemoveMI( args, (handler.toUpperCase() == 'GM-DELMI'), senderId );
			break;
			
		case 'GM-MIALPHAON':
		case 'GM-MIALPHAOFF':
		
			makeGMonlyMImenu( args, senderId, '', (handler === 'GM-MIALPHAON') );
			break;
			
		case 'GM-CHANGEMICOST':
		
			handleChangeMItype( args, senderId );
			break;
			
		case 'GM-CHANGEDISPCHARGES':
		
			handleChangeMIcharges( args, 'Displayed', senderId );
			break;
			
		case 'GM-CHANGEACTCHARGES':
		
			handleChangeMIcharges( args, 'Actual', senderId );
			break;
			
		case 'GM-RESETSINGLEMI':
		
			args.shift();
			doResetSingleMI( args, senderId, selected );
			break;
		
		case 'GM-RENAMEMI':
		
			handleRenameItem( args, senderId );
			break;
			
		case 'GM-CHANGEMITYPE':
			
			handleChangeMItype( args, senderId );
			break;
			
		case 'GM-SETMICOST':
		
			handleSetMIcost( args, senderId );
			break;
			
		case 'GM-SETTOKENTYPE':
		
			handleSetContainerType( args, senderId );
			break;
			
		case 'GM-SETTOKENSIZE':
		
			handleSetContainerSize( args, senderId );
			break;
			
		case 'GM-HIDEASTYPES':
		
			handleSetShownType( args, senderId );
			break;
			
		case 'GM-TREASUREMENU':
		
			makeEditTreasureMenu( args, senderId );
			break;
			
		case 'GM-ADDTREASURE':
		
			handleAddTreasure( args, senderId );
			break;
			
		case 'GM-EDITTREASURE':
		
			handleEditTreasure( args, senderId );
			break;
			
		case 'GM-DELETETREASURE':
		
			handleDeleteTreasure( args, senderId );
			break;
			
		case 'GM-DELTREASURE':
		
			handleConfirmedDelTreasure( args, senderId );
			break;
			
		case 'GM-NOBLANK':			
		case 'GM-NODELTREASURE':
			
			handleNo( args, senderId );
			break;

		case 'GM-BLANKBAG':
		
			handleBlankMIBag( args, senderId );
			break;
		
		case 'GM-CONFIRMEDBLANK':
		
			handleConfirmedBlank( args, senderId );
			break;
			
		case 'SHOWMORE':
		
			handleShowMore( args, senderId );
			break;
		
		default:
		
			sendDebug( 'doButton: invalid button type specified' );
			sendError( 'Invalid MagicMaster button call' );
			return;
		};

	};
	
/* ------------------------------------- Handle handshakes -------------------------------- */
	 
	/**
	 * Handle a database indexing handshake
	 **/
	 
	var doIndexDB = function( args ) {
		
		apiDBs[args[0]] = true;
		updateDBindex();
		sendFeedback('Databases re-indexed');
		return;
	};
		
	/**
	 * Handle handshake request
	 **/
	 
	var doHsQueryResponse = function(args) {
		if (!args) return;
		var from = args[0] || '',
			func = args[1] || '',
			funcTrue = ['spellmenu','mem-spell','view-spell','cast-spell','cast-again','mimenu','edit-mi','view-mi','use-mi','mi-charges','mi-power','touch','rest','gm-edit-mi','search','pickorput','lightsources',
						'light','changelight','help','check-db','debug'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr magic'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
		sendAPI(cmd);
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
		return;
	}

	/**
	 * Handle Pending Requests
	 */

	var doRelay = function(args,senderId) {
		if (!args) return;
		
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
			senderId = findThePlayer(msg.who),
			selected = msg.selected,
			t = 2;
			
		var doMagicCmd = function( e, selected, senderId, isGM ) {
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			try {
				if (!sendGMquery( 'magic', arg, senderId )) {
				
					cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
					argString = (i<0 ? '' : arg.substring(i+1).trim());
					arg = argString.split('|');
				
					switch (cmd.toLowerCase()) {
					// RED: v1.213 If in debugging mode, allow debugger to execute GM
					// type commands
					case 'display-ability':
						doDisplayAbility(arg,selected,senderId,flags.feedbackName,flags.feedbackImg);
						break;
					case 'cast-spell':
						doCastSpell(arg,selected,senderId);
						break;
					case 'cast-again':
						doCastAgain(arg,senderId);
						break;
					case 'mem-spell':
						doMemoriseSpells(arg,selected,senderId);
						break;
					case 'view-spell':
						doViewMemorisedSpells(arg,selected,senderId);
						break;
					case 'learn-spell':
						doLearnSpell(arg,selected,senderId);
						break;
					case 'mem-all-powers':
						handleMemAllPowers([BT.MEMALL_POWERS,arg[0],1,-1,-1,'',''], senderId, true );
						break;
					case 'mem-all-spells':
						arg = [arg[0],arg[1],1,-1,-1,'',''];
						handleMemAllPowers(arg, senderId, true );
						break;
					case 'touch':
						sendWait(senderId,0);
						doTouch(arg,senderId);
						break;
					case 'target':
						sendError('Targeting commands have moved to RoundMaster');
						break;
					case 'spellmenu':
						doSpellsMenu(arg,selected,senderId);
						break;
					case 'rest':
						doRest(arg,selected,senderId);
						break;
					case 'reset-single':
					case 'resetsingle':
						doResetSingleMI(arg,senderId,selected);
						break;
					case 'pickorput':
						doPickOrPut(arg,senderId);
						break;
					case 'addmi':
					case 'add-mi':
						doAddItem(arg,senderId,selected);
						break;
					case 'mimenu':
						doMIBagMenu(arg,senderId,selected);
						break;
					case 'view-mi':
						doViewUseMI(arg,BT.VIEW_MI,senderId,selected);
						break;
					case 'use-mi':
						doViewUseMI(arg,BT.USE_MI,senderId,selected);
						break;
					case 'mi-charges':
						doChangeCharges(arg,selected,senderId);
						break;
					case 'query-qty':
					case 'queryqty':
						doSetCharges(arg,selected,senderId);
						break;
					case 'mi-power':
						doSelectMIpower(arg,false,senderId);
						break;
					case 'mi-rest':
						doRestoreMIpowers(arg,senderId);
						break;
					case 'edit-mi':
						doEditMIbag(arg,senderId,selected);
						break;
					case 'store-spells':
						if (isGM) doStoreSpells(arg,senderId);
						break;
					case 'set-reveal':
						if (isGM) doSetReveal(arg,senderId,selected);
						break;
					case 'search':
						doSearchForMIs(arg,senderId);
						break;
					case 'find-traps':
						doFindTraps(arg,senderId);
						break;
					case 'pickpockets':
						doPickPockets(arg,senderId);
						break;
					case 'gm-edit-mi':
						if (isGM) doGMonlyMImenu(arg,senderId,selected);
						break;
					case 'change-attr':
						doStrengthChange(arg,senderId,selected);
						break;
					case 'level-change':
						doLevelChange(arg,senderId,selected);
						break
					case 'lightsources':
						doLightSourcesMenu(arg,senderId,selected);
						break;
					case 'light':
						doLightSource(arg,false,senderId);
						break;
					case 'changelight':
						doLightSource(arg,true,senderId);
						break;
					case 'tidy':
						doTidyCS(arg,selected);
						break;
					case 'message':
						doMessage(arg,selected,senderId);
						break;
					case 'options':
						doSetOptions(arg,senderId);
						break;
					case 'disp-config':
						doDispConfig(senderId);
						break;
					case 'write-db':
						if (isGM) doWriteDB(arg,senderId);
						break;
					case 'extract-db':
					case 'update-db':
						sendWait( senderId, 0 );
						if (isGM) doUpdateDB(arg,senderId,false);
						break;
					case 'check-db':
						if (isGM) checkDB( arg );
						break;
					case 'index-db':
						if (isGM) doIndexDB(arg,senderId);
						break;
					case 'extract-markers':
						if (isGM) doExtractMarkers(arg,senderId);
						break;
					case 'config':
						if (isGM) doConfig(arg,senderId);
						break;
					case 'update-cs':
						if (isGM) updateCharSheets(arg,senderId);
						break;
					case 'handout':
					case 'handouts':
						if (isGM) updateHandouts(handouts,false,senderId);
						break;
					case 'hsq':
					case 'handshake':
						sendWait( senderId, 0 );
						doHsQueryResponse(arg);
						break;
					case 'hsr':
						sendWait( senderId, 0 );
						doHandleHsResponse(arg);
						break;
					case 'button':
						doButton(arg,senderId,selected);
						break;
					case 'help':
						showHelp(senderId); 
						break;
					case 'relay':
						doRelay(argString,senderId); 
						break;
					case 'debug':
						// RED: v1.207 allow anyone to set debug and who to send debug messages to
						doSetDebug(argString,senderId);
						break;
					default:
						sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>',flags.feedbackName);
						showHelp(isGM); 
						break;
					}
				}
			} catch (err) {
				log('MagicMaster handleChatMsg: JavaScript '+err.name+': '+err.message+' while processing command '+cmd+' '+argString);
				sendDebug('MagicMaster handleChatMsg: JavaScript '+err.name+': '+err.message+' while processing command '+cmd+' '+argString);
				sendCatchError('MagicMaster',msg_orig[senderId],err);
			}
		}
			
		msg_orig[senderId] = msg;

		if (msg.type !== "api") return;
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
		if (args.indexOf('!magic') !== 0 && args.indexOf('!mibag') !== 0)
			{return;}

		sendDebug('MagicMaster called');
		time = Date.now();

		args = args.split(' --');
		let senderMod = args.shift().split(' ');
		if (senderMod.length > 1) senderId = fixSenderId( [senderMod[1]], selected, senderId );
		
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
		
		var isGM = (playerIsGM(senderId) || state.MagicMaster.debug === senderId);
			
		if (!flags.noWaitMsg) sendWait(senderId,50,'magicMaster');
		
		_.each(args, function(e) {
			setTimeout( doMagicCmd, (1*t++), e, selected, senderId, isGM );
		});
	};
	
// -------------------------------------------------------------- Register the API -------------------------------------------

	/*
	 * Register msgicMaster API with the
	 * commandMaster API
	 */
	 
	var cmdMasterRegister = function() {
		var cmd = fields.commandMaster
				+ ' --register Cast_MU_spell|Cast a Wizard spell|magic|~~cast-spell|MU%%`{selected|token_id}'
				+ ' --register Cast_PR_spell|Cast a Priest spell|magic|~~cast-spell|PR%%`{selected|token_id}'
				+ ' --register Cast_spell|Ask for which type of spell to cast|magic|~~cast-spell|MU-PR%%`{selected|token_id}'
				+ ' --register Spells_menu|Open a menu with spell management functions|magic|~~spellmenu|`{selected|token_id}'
				+ ' --register Use_power|Use a Power|magic|~~cast-spell|POWER%%`{selected|token_id}'
				+ ' --register Powers_menu|Open a menu with power management functions|magic|~~spellmenu|`{selected|token_id}%%POWERS'
				+ ' --register Use_magic_item|Use a Magic Item from character\'s bag|magic|~~use-mi|`{selected|token_id}'
				+ ' --register Magic_Item_menu|Open a menu of Magic Item management functions|magic|~~mimenu|`{selected|token_id}'
				+ ' --register Rest|Perform Short or Long rests|magic|~~rest|`{selected|token_id}';
		sendAPI( cmd );
		return;
	};

	/**
	 * Handle a change to the page the Player ribbon is on
	 **/
	 
	var handleChangePlayerPage = function(obj,prev) {
		
		try {
			var page = Campaign().get('playerpageid'),
				tokens = filterObjs( obj => {
					if (obj.get('type') != 'graphic' || obj.get('subtype') != 'token') return false;
					if (obj.get('pageid') != page) return false;
					return (!!obj.get('represents') && !!obj.get('represents').length);
				});
			if (!!tokens && (_.size(tokens) > 0)) {
				handleCStidy( tokens, true );
			}
		} catch (e) {
			sendCatchError('MagicMaster',null,e,'MagicMaster handleChangePlayerPage()');
		}
		return;
	}
	
	/**
	 * Handle a token being added to a page.  Check if this is the
	 * current Player page and, if so, tidy it's character sheet.
	 */
	 
	var handleChangeToken = function(obj,prev) {

		try {
			if (!obj)
				{return;}
				
			if (obj.get('name') == prev['name'])
				{return;}
			
			if (obj.get('_pageid') == Campaign().get('playerpageid') && obj.get('represents') && obj.get('represents').length) {
				handleCStidy( [obj], true );
			}
		} catch (e) {
			sendCatchError('MagicMaster',null,e,'MagicMaster handleChangeToken()');
		}
		return;
	}
	
	/**
	 * Set the magicMaster version of a new character sheet
	 */
	 
	var handleAddCharacter = function(obj) {

		try {
			if (!obj) return;
			setAttr( obj, fields.msVersion, version );
		} catch (e) {
			sendCatchError('MagicMaster',null,e,'MagicMaster handleAddCharacter()');
		}
	}
	
	/**
	 * Set the charType of a dead creature to 6 (dead)
	 */
	 
	var handleTokenDeath = function(obj,prev) {
		try {
			if (!obj) return;
			let charCS = getCharacter( obj.id );
			if (obj.get("status_dead")) {
				// If the token dies and is marked as "dead" by the GM
				// set its container type to 6 (dead).
				setAttr(charCS, fields.ItemOldContainerType, attrLookup(charCS, fields.ItemContainerType));
				setAttr(charCS, fields.ItemContainerType, 6);
			} else {
				setAttr(charCS, fields.ItemContainerType, (attrLookup(charCS, fields.ItemOldContainerType) || 1));
			}
		} catch (e) {
			sendCatchError('RoundMaster',null,e,'RoundMaster handleTokenDeath()');
		}
		return;		
	};
	
	
	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('change:campaign:playerpageid',handleChangePlayerPage);
		on('change:graphic:name',handleChangeToken);
		on('change:graphic:statusmarkers',handleTokenDeath);
		on('add:character',handleAddCharacter);
	};
 
	return {
		init: init,
		registerAPI: registerAPI
	};
 
}());

on("ready", function() {
	'use strict'; 
	MagicMaster.init(); 
	MagicMaster.registerAPI();
});

{try{throw new Error('');}catch(e){API_Meta.MagicMaster.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.MagicMaster.offset);}}
