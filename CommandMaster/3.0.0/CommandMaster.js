// Github:   https://github.com/Roll20/roll20-api-scripts/tree/master/CommandMaster
// Beta:     https://github.com/DameryDad/roll20-api-scripts/tree/CommandMaster/CommandMaster
// By:       Richard @ Damery
// Contact:  https://app.roll20.net/users/6497708/richard-at-damery

var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.CommandMaster={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.CommandMaster.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-8);}}

/**
 * CommandMaster.js
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
 * This script is the GM control capability for the RedMaster series
 * of APIs for Roll20.  It allows the other RedMaster series APIs to 
 * register with it with their current commands and ability button specs 
 * which are used by CommandMaster to build the GM Maintenance Menu,
 * and to update Character Sheets that use the commands in abilities 
 * with the latest command structures.  It supports other functions 
 * useful to the GM as needed.
 * 
 * v0.001  02/05/2021  Initial creation as a clone of attackMaster
 * v0.002-1.025        Early development. See v2.027 for details.
 * v2.026  27/02/2022  Added Class-DB as a standard database.  Fixed 'Specials' action 
 *                     button & updated command registration.  Fixed command registration errors.
 *                     Added token-setup buttons to add all possible character Powers & Priest 
 *                     spells from Class-DB.
 * v2.027  10/03/2022  Add sychronisation of Database indexing to ensure happens after
 *                     all databases loaded by all APIs before indexing done.  Add
 *                     "Creature" character class. Use AttackMaster version of --check-saves
 *                     to unify character setup. Added token-setup buttons to check who
 *                     controls what Char Sheets & toggle control DM/Player
 * v2.030  28/03/2022  Moved all Table Mgt, Ability Mgt, Chat Mgt, Database Mgt to a
 *                     shared library
 * v2.031  24/04/2022  Moved all game-specific and character sheet-specific data structures
 *                     to the RPGM game-specific library api.
 * v0.2.32 20/07/2022  Converted to use revised internal database structures
 * v0.2.33 17/09/2022  Moved additional common RPGMaster functions to Library. Moved common 
 *                     help handouts to Library. Optionally allow semi-colons as terminators 
 *                     for escaped characters in commands. Improve generating of spell lists 
 *                     for Priest classes, and Power lists for all classes. Change --help to 
 *                     provide a menu of links to help handouts
 * v1.3.00 17/09/2022  First release of RPGMaster APIs with RPG-version-specific Library
 * v1.3.01 04/10/2022  Allow Wizard and Priest spells to be stored as powers
 * v1.3.02 23/10/2022  Fixed error with Specials action button
 * v1.3.03 29/10/2022  Trap initialisation errors. Add All Powers will add race powers from 
 *                     the race database.  Add Race selection to Class menu.
 * v1.3.04 17/11/2022  Added possible creature data attributes, & fixed certain creature 
 *                     setup issues. Added weapon data update after race/class/level change
 *                     to support things like attacks/round improvement
 * v1.4.01 28/11/2022  Added support for the fighting Styles-DB. Fixed help menu. Improved 
 *                     creature attribute dice rolling. Improved creature HD & HP calcs. 
 *                     Added creature attribute dexdef dexterity bonus for ranged attacks. 
 *                     Added use of alpha indexed drop down for selection of creatures.
 *                     Added suppression of power inheritance. Added function to check
 *                     player, speakingas, token & character names for illegal characters.
 * v1.4.02 13/12/2022  Added API button on token & character name checks to support immediate
 *                     correction. Add ability to specify weapons and armour for creatures
 *                     with probability of different sets. Split handling of PC Race specifications
 *                     and Creature specifications, so that Races don't get set up with
 *                     spurious creature specs.
 * v1.4.03 16/01/2023  Added creature attkmsg & dmgmsg attributes to support messages to 
 *                     display with attack and damage rolls respectively. 
 * v1.4.04 24/01/2023  Added support for converting manually created character sheets to 
 *                     RPGMaster format. Added ability to configure the default token bars.
 *                     Added functions to set token bars for all campaign tokens. Added 
 *                     separate Ammo list for Equipment conversion. Tidied up Token-Setup
 *                     menu.
 * v1.4.05 02/03/2023  Non-functional update release to maintain version sequence.
 * v1.4.06 08/04/2023  Added support for when a magic item character sheet is first dragged 
 *                     to the player map, to set it to isdrawing=true and link to the CS.
 * v1.4.07 14/04/2023  Fixed bug stopping Token Setup, Add to Spellbook from working.
 * v1.5.01 19/05/2023  Non-functional version number synchronisation release.
 * v2.1.0  06/06/2023  Made many more functions asynchronous to multi-thread. Parsed a 
 *                     creature's description in its database entry and created a Character
 *                     Sheet Bio from it.
 * v2.2.0  21/07/2023  Implemented The Aaron's API_Meta error handling. Added senderId override 
 *                     capability as id immediately after !magic & before 1st --cmd. Added 
 *                     Drag & Drop containers to the Drag & Drop system, using the 
 *                     Race-DB-Containers & Locks-Traps-DB databases. Made reSpellSpecs, 
 *                     reClassSpecs & reAttr accessible by other APIs from the library.
 *                     Made –initialise command automatic on startup if the defined GM macros 
 *                     have changed. Enhanced parseDesc() to cater for both creatures and 
 *                     containers, locks & traps. Removed potential setTimeout() issues 
 *                     with asynchronous use of variable values – passed as parameters instead.
 *                     Fixed error when cs attribute 'trap-name' is missing or empty.
 * v2.3.0  30/09/2023  Added drag & drop query attribute that adds an extra level of query to 
 *                     drag & drop creature selection and returns variables based on the selection.
 *                     Fixed parsing of {{prefix=...}} in drag & drop creature descriptions.
 *                     Added new maths evaluation function to support new race 'query' variables.
 *                     Add memorisation of random spells for spell-casting drag & drop creatures.
 *                     Added new dice roll evaluator. Moved characterLevel() to library.
 * v2.3.1  19/10/2023  Added "Token Image Quick Copy" --copyimg function. Added ^^gmid^^ field
 *                     for container macros to support TokenMod --api-as parameter. Stop 
 *                     specification of races not in the database for now. Ensured spell names
 *                     in spell books are hyphenated to avoid inconsistencies.
 * v2.3.2  20/10/2023  Added age: attribute as a condition value for Drag & Drop creature items.
 *                     Improved the maths parser to iterate more deeply. Changed how 'GM-Roll' 
 *                     flag builds GM rolls into container macros. Fixed hyphenation of 
 *                     reviewed weapons, spells & powers.
 * v3.0.0  01/10/2023  Added support for other character sheets & game systems.
 *                     Moved parseData() to library.
 */
 
var CommandMaster = (function() {
	'use strict'; 
	var version = '3.0.0',
		author = 'RED',
		pending = null;
	const lastUpdate = 1700058244;

	/*
	 * Define redirections for functions moved to the RPGMaster library
	 */
		
	const getRPGMap = (...a) => libRPGMaster.getRPGMap(...a);
	const getHandoutIDs = (...a) => libRPGMaster.getHandoutIDs(...a);
	const setAttr = (...a) => libRPGMaster.setAttr(...a);
	const attrLookup = (...a) => libRPGMaster.attrLookup(...a);
	const getTableField = (...t) => libRPGMaster.getTableField(...t);
	const getTable = (...t) => libRPGMaster.getTable(...t);
	const getLvlTable = (...t) => libRPGMaster.getLvlTable(...t);
	const initValues = (...v) => libRPGMaster.initValues(...v);
	const setAbility = (...a) => libRPGMaster.setAbility(...a);
	const abilityLookup = (...a) => libRPGMaster.abilityLookup(...a);
	const doDisplayAbility = (...a) => libRPGMaster.doDisplayAbility(...a);
	const getAbility = (...a) => libRPGMaster.getAbility(...a);
	const getDBindex = (...a) => libRPGMaster.getDBindex(...a);
	const updateHandouts = (...a) => libRPGMaster.updateHandouts(...a);
	const findThePlayer = (...a) => libRPGMaster.findThePlayer(...a);
	const findCharacter = (...a) => libRPGMaster.findCharacter(...a);
	const fixSenderId = (...a) => libRPGMaster.fixSenderId(...a);
	const getCharacter = (...a) => libRPGMaster.getCharacter(...a);
	const classObjects = (...a) => libRPGMaster.classObjects(...a);
	const characterLevel = (...a) => libRPGMaster.characterLevel(...a);
	const addMIspells = (...a) => libRPGMaster.addMIspells(...a);
	const getMagicList = (...a) => libRPGMaster.getMagicList(...a);
	const handleCheckSaves = (...a) => libRPGMaster.handleCheckSaves(...a);
	const handleCheckWeapons = (...a) => libRPGMaster.handleCheckWeapons(...a);
	const parseData = (...a) => libRPGMaster.parseData(...a);
	const resolveData = (...a) => libRPGMaster.resolveData(...a);
	const caster = (...a) => libRPGMaster.caster(...a);
	const findPower = (...a) => libRPGMaster.findPower(...a);
	const handleGetBaseThac0 = (...a) => libRPGMaster.handleGetBaseThac0(...a);
	const creatureWeapDefs = (...a) => libRPGMaster.creatureWeapDefs(...a);
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
	
	/*
	 * Handle for reference to character sheet field mapping table.
	 * See RPG library for your RPG/character sheet combination for 
	 * full details of this mapping.  See also the help handout on
	 * RPGMaster character sheet setup.
	 */
	
	var fields = {
		defaultTemplate:    'RPGMdefault',
		warningTemplate:	'RPGMwarning',
		menuTemplate:		'RPGMmenu',
	};

	/*
	 * List of the "standard" RPGMaster databases to support identification of 
	 * custom user databases and db entries to give priority to.
	 */

//	const stdDB = ['MU_Spells_DB','PR_Spells_DB','Powers_DB','MI_DB','MI_DB_Ammo','MI_DB_Armour','MI_DB_Light','MI_DB_Potions','MI_DB_Rings','MI_DB_Scrolls_Books','MI_DB_Wands_Staves_Rods','MI_DB_Weapons','Attacks_DB','Class_DB','Race-DB','Race-DB-Creatures'];
	
	/*
	 * Handle for the Database Index, used for rapid access to the character 
	 * sheet ability fields used to hold database items.
	 */

	var DBindex = {};
	
	/*
	 * Handle for the API Databases in the RPGM Game-specific Library
	 */
	 
	var dbNames = {};

	/*
	 * Handle for the library object used to pass back RPG & character sheet
	 * specific data tables.
	 */

	var RPGMap = {};
	
	/*
	 * CommandMaster related help handout information.
	 */
	
	const handouts = Object.freeze({
	CommandMaster_Help:	{name:'CommandMaster Help',
						 version:3.01,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">CommandMaster Help v3.01</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Command Master API</h1>'
							+'<p>The CommandMaster API is part of the RPGMaster suite of APIs for Roll20, and manages the initialisation of a Campaign to use the RPGMaster APIs, communication and command syntax updates between the APIs and, most importantly for the DM, easy menu-driven setup of Tokens and Character Sheets to work with the APIs.</p>'
							+'<h2>Syntax of CommandMaster calls</h2>'
							+'<p>The CommandMaster API is called using !cmd.</p>'
							+'<pre>!cmd --initialise</pre>'
							+'<p>Commands to be sent to the CommandMaster API must be preceded by two hyphens \'--\' as above for the --initialise command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!cmd --register action|description|api-call|api-command|parameters</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!cmd --initialise --abilities</pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [...] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>'
							+'<h3>Overriding the Controlling Player</h3>'
							+'<p>When a command is sent to Roll20 APIs / Mods, Roll20 tries to work out which player or character sent the command and tells the API its findings. The API then uses this information to direct any output appropriately. However, when it is the API itself that is sending commands, such as from a <i>{{successcmd=...}}</i> or <i>{{failcmd=...}}</i> sequence in a RPGMdefault Roll Template, Roll20 sees the API as the originator of the command and sends output to the GM by default. This is not always the desired result.</p>'
							+'<p>To overcome this, or when output is being misdirected for any other reason, a <b>Controlling Player Override Syntax</b> (otherwise known as a <i>SenderId Override</i>) has been introduced (for RPGMaster Suite APIs only, I\'m afraid), with the following command format:</p>'
							+'<pre>!cmd [sender_override_id] --cmd1 args1... --cmd2 args2...</pre>'
							+'<p>The optional <i>sender_override_id</i> (don\'t include the [...], that\'s just the syntax for "optional") can be a Roll20 player_id, character_id or token_id. The API will work out which it is. If a player_id, the commands output will be sent to that player when player output is appropriate, even if that player is not on-line (i.e. no-one will get it if they are not on-line). If a character_id or token_id, the API will look for a controlling player <i>who is on-line</i> and send appropriate output to them - if no controlling players are on-line, or the token/character is controlled by the GM, the GM will receive all output. If the ID passed does not represent a player, character or token, or if no ID is provided, the API will send appropriate output to whichever player Roll20 tells the API to send it to.</p>'
							+'<br>'
							+'<h2>How CommandMaster Works</h2>'
							+'<p>The CommandMaster API coordinates other APIs in the RPGMaster API series and provides the DM with facilities to set the Campaign up to use them.  It will initialise a Campaign in Roll20 to use the RPGMaster series APIs.  APIs can register their commands with CommandMaster and, should they change in the future, CommandMaster will search all Character Sheets and databases for that command and offer the DM the option to automatically update any or all of those found to the new command structure of that API.  Selected Tokens and their associated Character Sheets can be set up with the correct Token Action Buttons, with spell-users given spells in their spell book, fighters given weapon proficiencies, setting saving throws correctly, and linking token circles to standard Character Sheet fields.</p>'
							+'<h3>Initialising a Campaign</h3>'
							+'<p>Using the <b>--initialise</b> command will add a number of Player Macros for the DM that will run the most-used RPGMater DM commands, which can be flagged to appear in the Macro Bar at the bottom of the DM\'s screen for ease of access.</p>'
							+'<h3>Setting up tokens & character sheets</h3>'
							+'<p>Selecting one or multiple tokens and running the <b>--abilities</b> command will allow token action buttons and RPGMaster API capabilities to be set up for all the represented Character Sheets at the same time, though all Character Sheets will be set up the same way.</p>'
							+'<h3>Registering API commands</h3>'
							+'<p>Any API command can be registered with CommandMaster using the <b>--register</b> command.  This will allow the command registered to be added as a Token Action Button to Character Sheets by the   abilities command, and to be optionally updated in all Character Sheets wherever used should the details of the registration change.</p>'
							+'<h3>Editing Character Sheet abilities</h3>'
							+'<p><b>Danger:</b> this command is very powerful, and can ruin your campaign if mis-used!  The <b>--edit</b> command can be used to change any string in Character Sheet ability macros to any other string, using \'escaped\' characters to replace even the most complex strings.  However, use with care!</p>'
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<h3>1. Campaign setup</h3>'
							+'<pre>--initialise<br>'
							+'--abilities</pre>'
							+'<h3>2. Character Sheet configuration</h3>'
							+'<pre>--conv-spells<br>'
							+'--conv-items<br>'
							+'--token-defaults<br>'
							+'--check-chars<br>'
							+'--class-menu [token_id]<br>'
							+'--add-spells [POWERS/MUSPELLS/PRSPELLS] | [level]<br>'
							+'--add-profs<br>'
							+'--set-prof  [NOT-PROF/PROFICIENT/SPECIALIST/MASTERY] | weapon | weapon-type<br>'
							+'--set-all-prof<br>'
							+'--token-img [token_id]</pre>'
							+'<h3>3. Command and Ability maintenance</h3>'
							+'<pre>--register action|description|api-call|api-command|parameters<br>'
							+'--edit old-string | new-string</pre>'
							+'<h3>4. Other commands</h3>'
							+'<pre>--help<br>'
							+'--debug [ON/OFF]</pre>'
							+'<br>'
							+'<h2>1. Campaign setup</h2>'
							+'<h3>1.1 Initialise for RPGMaster APIs</h3>'
							+'<pre>--initialise</pre>'
							+'<p>This command creates a number of Player Macros which can be found under the Player Macro tab in the Chat window (the tab that looks like three bulleted lines, next to the cog).  These macros hold a number of DM commands that are useful in setting up and running a campaign.  It is recommended that the "Show in Bar" flags for these macros are set, and the "Show Macro Bar" flag is set (the macro bar is standard Roll20 functionality - see Roll20 Help Centre for more information).</p>'
							+'<p>The buttons added are:</p>'
							+'<ul>'
							+'	<li><i>Maint-menu:</i> Runs the <b>!init --maint</b> command</li>'
							+'	<li><i>Token-setup:</i> Runs the <b>!cmd --abilities</b> command</li>'
							+'	<li><i>Add-items:</i> Runs the <b>!magic --gm-edit-mi</b> command</li>'
							+'	<li><i>End-of-Day:</i> Runs the <b>!init --end-of-day</b> command</li>'
							+'	<li><i>Initiative-menu:</i>	Runs the <b>!init --init</b> command</li>'
							+'	<li><i>Check-tracker:</i>	Runs the <b>!init --check-tracker</b> command</li>'
							+'</ul>'
							+'<p>The DM can drag Macro Bar buttons around on-screen to re-order them, or even right-click them to change their name and colour of the button.  Feel free to do this to make the Macro Bar as usable for you as you desire.</p>'
							+'<h3>1.2 Setup Tokens & Character Sheets</h3>'
							+'<pre>--abilities</pre>'
							+'<p>Displays a menu with which one or more selected tokens and the Character Sheets they represent can be set up with the correct Token Action Buttons and data specific to the RPGMaster APIs, to work with the APIs in the best way.  The menu provides buttons to add any command registered with CommandMaster (see <b>--register</b> command) as a Token Action Button, change control of the sheet and set the visibility of the token name to players (which also affects RoundMaster behaviour), set the Character Class and Level of the Character, add spells to spell books, add granted powers, add or change weapon proficiencies and proficiency levels for each weapon, set the correct saving throws based on race, class & level of character / NPC / creature, and optionally clear or set the Token \'circles\' to represent AC (bar 1), base Thac0 (bar 2) and HP (bar 3).  Essentially, using this menu accesses the commands in section 2 without the DM having to run them individually.</p>'
							+'<p>All tokens selected when menu items are used will be set up the same way: exceptions to this are using the Set Saves button (sets saves for each selected token/character sheet correctly for the specifications of that sheet), and the Set All Profs button (sets weapon proficiencies to proficient based on the weapons in each individual token/character sheet\'s item bag).  Different tokens can be selected and set up differently without having to refresh the menu.</p>'
							+'<h2>2. Character Sheet configuration</h2>'
							+'<p>The commands in this section can be accessed using the --abilities command menu.  The individual commands below are used less frequently.</p>'
							+'<h3>2.1 Convert Character Sheet Spells</h3>'
							+'<pre>--conv-spells</pre>'
							+'<p>Works on multiple selected tokens representing several Character Sheets.</p>'
							+'<p>For Character Sheets that have not been created using the commands provided by the <i>!cmd --abilities</i> menu, pre-existing from previous Roll20 campaigns using the Advanced D&D2e Character Sheet, this command does its best to convert all spells in tables on the Character Sheet to RPGMaster format and replace them with spells that exist in the RPGMaster spell databases. Those that the system can\'t automatically match are subsequently displayed in a menu, with additional buttons that list the spells that do exist in the databases that can be used to replace them by selecting both the spell to be replaced and the replacement spell.</p>'
							+'<p>It is possible that not all spells will be able to be replaced, if the Character Sheet reflects campaign experience where bespoke spells or spells from other handbooks have been available. In this case, the spells can be left unconverted, and the DM might add the spells to their own databases using the information provided in the <i>Magic Database Help</i> handout. Until the spells are added to the databases, they will not work, and cannot be memorised for spell use.</p>'
							+'<p>This command can be used on multiple selected tokens, as stated above. All the Character Sheets represented by the selected tokens will be converted, and the displayed list of spells to manually match represents the unmatched spells from all those Character Sheets. As the spells are manually matched, they will be replaced on all of the selected Character Sheets.</p>'
							+'<h3>2.2 Convert Character Sheet Equipment</h3>'
							+'<pre>--conv-items</pre>'
							+'<p>Works on multiple selected tokens representing several Character Sheets.</p>'
							+'<p>As for the <i>--conv-spells</i> command, Character Sheets that have not been created using the commands provided by the <i>!cmd --abilities</i> menu, pre-existing from previous Roll20 campaigns using the Advanced D&D2e Character Sheet, this command does its best to convert all weapons, armour, other items of equipment and magical items such as potions, rings etc, in tables on the Character Sheet to RPGMaster format and replace them with weapons, armour and items that exist in the RPGMaster spell databases. Those that the system can\'t automatically match are subsequently displayed in a menu, with additional buttons that list the items that do exist in the databases that can be used to replace the unknown ones by selecting both the item to be replaced and the replacement item.</p>'
							+'<p>It is possible that not all weapons, armour, equipment and especially magic items will be able to be matched if the Character Sheet reflects campaign experience where bespoke magic items and equipment or equipment from other handbooks have been available. In this case, the items can be left unconverted, and the DM might add the items to their own databases using the information provided in the <i>Weapon & Armour Database Help</i> or <i>Magic Database Help</i> handouts. Until the items of equipment are added to the databases, if they are weapons they cannot be taken in-hand to fight with, armour will not be counted towards armour class calculations, and items that contribute to saving throws will not do so.</p>'
							+'<p>As with the <i>--conv-spells</i> command, this command can be used on multiple selected tokens. All the Character Sheets represented by the selected tokens will be converted, and the displayed list of items to manually match represents the unmatched items from all those Character Sheets. As the items are manually matched, they will be replaced on all of the selected Character Sheets.</p>'
							+'<h3>2.3 Set Default Token Bar mappings</h3>'
							+'<pre>--token-defaults</pre>'
							+'<p>This command uses the selected token as a model to set the default token bar mappings that will be used in future by the RPGMaster APIs.</p>'
							+'<p>The standard defaults distributed with the APIs are for token bar1 to represent AC, bar2 to represent Thac0-base, and bar3 to represent HP. However, alternative mappings can be made. <b>It is highly recommended that HP, AC and Thac0-base are represented in some order</b> because these are the most common values to be affected by spells and circumstances, both in and out of combat situations.</p>'
							+'<p>If no token is selected, or the token selected to be the model does not have any bars linked to a character sheet, an error message will be displayed. If some but not all the bars are linked, then any bars not linked will be automatically matched to some of the recommended Character Sheet fields of AC, Thac0-base, and HP (in that order of priority).</p>'
							+'<p>Once this mapping is done, a menu will be displayed that can be used to map other tokens to the new defaults: either just the selected tokens, or all tokens in the campaign, or just those tokens that have bars currently linked to Character Sheets (i.e. excluding creature mobs with multiple tokens with unlinked bars representing a single character sheet). A button also exists to clear the bar links for all selected tokens to create creature mobs.</p>'
							+'<h3>2.4 Check control of Character Sheets</h3>'
							+'<pre>--check-chars</pre>'
							+'<p>Displays a list of every Character Sheet with a defined Class, Level, or Monster Hit Dice categorised by <i>DM Controlled, Player Controlled PCs & NPCs, Player Controlled Creatures,</i> and <i>Controlled by Everyone.</i>  Each name is shown as a button which, if selected, swaps control of that Character Sheet between DM control and the control of a selected Player (the Player, of course, must be one that has already accepted an invite to join the campaign). A button is also provided at the bottom of this menu to toggle the running of this check whenever the Campaign is loaded.</p>'
							+'<h3>2.5 Set Character Class, Race & Species</h3>'
							+'<pre>--class-menu [token_id]</pre>'
							+'<p>Takes an optional ID for a token representing a character. If not specified, takes the currently selected token</p>'
							+'<p>Displays a menu from which the Race, Class and Level of a Character can be set, or a Creature species can be selected. Setting the Race, Class and Level of a Character (PC or NPC) enables all other capabilities to be used as appropriate for that character sheet in this and other APIs in the <b>RPGMaster API suite</b>, such as spell use, appropriate race & class powers, selection of allowed weapons, and the like. Selecting a Creature species <i>automatically</i> sets up the Character Sheet in an optimal way for the APIs to use it to represent the chosen creature, including saves, armour class, hit dice and rolling of hit points, as well as special attacks such as paralysation & level drain of high level undead, spell use by the likes of Orc Shamen, regeneration powers, and so on. However, it does not automatically give weapons, armour equipment, or magic items to Creatures - if appropriate this still needs to be done by the DM/Game Creator.</p>'
							+'<p>DMs/Game Creatores can add to or amend the Class, Race and Creature definitions. Refer to the appropriate database help handout distributed with the APIs and created as handouts in your campaign for more information.</p>'
							+'<h3>2.6 Add spells to spell book</h3>'
							+'<pre>--add-spells [POWERS/MUSPELLS/PRSPELLS] | [level]</pre>'
							+'<p>Displays a menu allowing spells in the Spells Databases to be added to the Character Sheet(s) represented by the selected Token(s).  If no spell type and/or spell level is specified, the initial menu shown is for Level 1 Wizard spells (MUSPELLS). Buttons are shown on the menu that allow navigation to other levels, spell types and powers.  For <i>Priests</i>, a button is also provided to add every spell allowed for the Priest\'s Class to their spellbooks at all levels (of course, they will only be able to memorise those that their experience level allows them to). For all Character Classes that have <i>Powers</i> (or Power-like capabilities, such as Priestly <i>Turn Undead</i> or Paladin <i>Lay on Hands</i>), there is a button on the <i>Powers</i> menu to add Powers that the character\'s Class can have.</p>'
							+'<p><b>Note:</b> adding spells / powers to a sheet does not mean the Character can immediately use them.  They must be <i>memorised</i> first.  Use the commands in the <b>MagicMaster API</b> to memorise spells and powers.</p>'
							+'<h3>2.7 Choose weapon proficiencies</h3>'
							+'<pre>--add-profs</pre>'
							+'<p>Displays a menu from which to select proficiencies and level of proficiency for any weapons in the Weapon Databases for the Character Sheet(s) represented by the selected tokens.  Also provides a button for making the Character proficient in all weapons carried (i.e. those currently in their Item table).</p>'
							+'<p>All current proficiencies are displayed, with the proficiency level of each, which can be changed or removed.  It is also now possible to select proficiencies in <b>Fighting Styles</b> as introduced by <i>The Complete Fighter\'s Handbook</i>: these can be found under the <i>Choose Style</i> button, and can also be set as Proficient or Specialised.  Selecting a Fighting Style proficiency grants benefits as defined in the Handbook, or as modified by the DM - see the <i>Styles Database Help</i> handout for more information.</p>'
							+'<p><b>Note:</b> this does more than just entering the weapon in the proficiency table.  It adds the <i>weapon group</i> that the weapon belongs to as a field to the table (see weapon database help handouts for details), which is then used by the <b>AttackMaster API</b> to manage <i>related weapon</i> attacks and give the correct proficiency bonuses or penalties for the class and weapon used.</p>'
							+'<h3>2.8 Set weapon proficiencies</h3>'
							+'<pre>--set-prof  [NOT-PROF/PROFICIENT/SPECIALIST/MASTERY] | weapon | weapon-type </pre>'
							+'<p>Sets a specific weapon proficiency to a named level.  If the proficiency level is omitted, PROFICIENT is assumed.  If the weapon already exists in the proficiencies table, the existing proficiency level is updated to that specified.  Otherwise, the weapon (and its weapon group) are added to the table at the specified level.</p>'
							+'<p><b>Note:</b> this does more than just entering the weapon in the proficiency table.  It adds the weapon group that the weapon belongs to as a field to the table (see weapon database help handouts for details), which is then used by the AttackMaster API to manage related weapon attacks and give the correct proficiency bonuses or penalties for the class and weapon used.</p>'
							+'<h3>2.9 Add proficiencies for all carried weapons</h3>'
							+'<pre>--set-all-prof</pre>'
							+'<p>Adds all currently carried weapons (those in the Items table) to PROFICIENT, saving them and their <i>weapon group</i> to the weapon proficiency table.  Those weapons found that are already in the table are reset to PROFICIENT (overwriting any existing different proficiency level).  Any other proficiencies already in the table are not altered.</p>'
							+'<p><b>Note:</b> this command always adds a weapon proficiency called <i>innate</i>.  This proficiency is used for attacks with innate weapons, such as claws and bites, but also for spells that require a <i>touch attack</i>.  Indeed, to make this even more specific, the weapons database distributed with the AttackMaster and MagicMaster APIs includes a weapon called <i>Touch</i>.</p>'
							+'<p><b>Tip:</b> if using the <b>MagicMaster API</b> then running the <b>!magic --gm-edit-mi</b> command and adding weapons before running this command can speed up setting up character sheets.</p>'
							+'<h3>2.10 Change container images & variables</h3>'
							+'<pre>--token-img [token_id]</pre>'
							+'<p>Displays a menu for changing the images and variables used for containers. The optional token_id (defaults to the selected token) must represent a character sheet, and the dialog expects it to be a character sheet of a container, potentially one set up using the <i>Drag & Drop</i> container functionality. Containers set up using <i>Drag & Drop</i> will have information about the use of images and variables in the "Bio" tab of the Character Sheet.</p>'
							+'<h2>3. Command and Ability maintenance</h2>'
							+'<h3>3.1 Register an API command</h3>'
							+'<pre>--register action|description|api-call|api-command|parameters</pre>'
							+'<p>Register an API command with the CommandMaster API to achieve two outcomes: allow the command to be set up as a Token Action Button, and/or automatically maintain & update the syntax of the commands in Character Sheet ability macros and the RPGMaster API databases.</p>'
							+'<p>This is a powerful and potentially hazardous command.  Registry of an API command is remembered by the system in the state variable, which is preserved throughout the life of the Campaign in Roll20.  If a subsequent registration of the same <b>action</b> has different parameters, the system detects this and searches all Character Sheet ability macros for the <i>old version</i> of the command and replaces all of them with the new command.  It also changes the parameters, using a syntax including a range of character \'escapes\' to substitute characters that Roll20 might otherwise interpret as commands itself.  In detail, the --register command takes:</p>'
							+'<table>'
							+'	<tr><th scope="row">action:</th><td>the unique name given to this command in the whole system.  This can be any legal text name including A-Z, a-z, 1-9, -, _ only.  Must start with an alpha.  Case is ignored.</td></tr>'
							+'	<tr><th scope="row">description:</th><td>a short description of the command, which is displayed in the menu that allows the command to be added as a Token Action Button.</td></tr>'
							+'	<tr><th scope="row">api-call:</th><td>the API call <i>without</i> the !, e.g. cmd, or magic, etc</td></tr>'
							+'	<tr><th scope="row">api-command:</th><td>the command to be passed to the specified API, with the hyphens replaced by ~~ or plusses replaced by **, e.g. ~~cast-spell or **menu.</td></tr>'
							+'	<tr><th scope="row">parameters:</th><td>the parameters (or initial parameters) to be passed as part of this command to replace the matching existing command parameters.  This string  is \'escaped\' using the following character replacements:</td></tr>'
							+'</table>'
							+'<table>'
							+'	<tr><th scope="row">Character</th><td>Parameter separator</td><td>?</td><td>[</td><td>]</td><td>&lt;</td><td>&gt;</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td></tr>'
							+'	<tr><th scope="row">Substitute</th><td>%%</td><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td> </td><td> </td><td>`</td><td>~</td><td>&amp;#124;</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td></tr>'
							+'	<tr><th scope="row">Alternative</th><td> \\vbar;</td><td>\\ques;</td><td>\\lbrak;</td><td>\\rbrak;</td><td>\\lt;</td><td>\\gt;</td><td>\\at;</td><td>\\dash;</td><td>\\vbar;</td><td>\\clon;</td><td>\\amp;</td><td>\\lbrc;</td><td>\\rbrc;</td></tr>'
							+'</table>'
							+'<p>Commands cannot have a CR (carrage return/new line) in the middle of them, but CR can separate commands in multi-command sequences.</p>'
							+'<p>If the parameter string ends with $$, this will ensure that a complete command up to the next CR is to be replaced (including everything up to the CR even if not part of the command).  If there is not a $$ on the end of the parameter string, then only the command and parameters that are matched are replaced (using a parameter count of each old and new parameter separated by \'%%\') - the rest of the line (including any remaining parameters not so matched) will be left in place.</p>'
							+'<p>Here are some examples of registration commands:</p>'
							+'<pre>--register Spells_menu|Open a menu with spell management functions|magic|~~spellmenu |\`{selected|token_id}<br>'
							+'--register Use_power|Use a Power|magic|~~cast-spell|POWER%%\`{selected|token_id}<br>'
							+'--register Attack_hit|Do an attack where Roll20 rolls the dice|attk|~~attk-hit|\`{selected|token_id}</pre><br>'
							+'<h3>3.2 Edit ability macros</h3>'
							+'<pre>--edit existing-string | new-string</pre>'
							+'<p style="background-color:yellow;"><b>Danger:</b> use this command with extreme care!  It can destroy your Campaign!  It is recommended that you make a backup copy of your Campaign before using this command.  --register is more controlled, as it has been tested with the RPGMaster command strings, and any future releases that change the API commands will be fully tested before release for their effect on Campaigns, with accompanying release notes.  Using the --edit function directly can have unintended consequences!</p>'
							+'<p>Replaces an existing \'escaped\' string with a new replacement string in all ability macros on all Character Sheets.  These strings both use the same escape sequence replacements as for the <b>--register</b> command (see section 3.1) as in fact <b>--register</b> and <b>--edit</b> use the same functionality.</p>'
							+'<p>Examples of its use are to change API command calls, or Character Sheet field name access in macros should the field names change.</p>'
							+'<br>'
							+'<h2>4. Other Commands</h2>'
							+'<h3>4.1 Display help on these commands</h3>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h3>4.2 Switch on or off Debug mode</h3>'
							+'<pre>--debug (ON/OFF)</pre>'
							+'<p>Takes one mandatory argument which should be ON or OFF.</p>'
							+'<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player - so the DM or a technical advisor can play as a Player and see the debugging messages.</p>'
							+'<br>'
							+'</div>',
						},
	LocksTraps_Help:	{name:'Locks and Traps Help',
						 version:1.03,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">Locks and Traps Help v1.03</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Containers, Locks & Traps Databases</h1>'
							+'<h6><i>for RPGMaster APIs</i></h6>'
							+'<h2>1. General Database information</h2>'
							+'<p>The RPGMaster APIs use a number of databases to hold Macros defining races, creatures, character classes, spells, powers, magic items and their effects, and now containers, locks & traps. The version of these databases distributed with the APIs are held internally to the APIs. However, the AttackMaster or MagicMaster API command <b>--extract-db</b> can be used to extract any or all standard databases to Character Sheets for examination and update. The APIs are distributed with many class, spell, power, magic item and container definitions, and DMs can add their own containers, locks, traps, character classes, spells, items, weapons, ammo and armour to additional databases in their own database character sheets, with new definitions for database items held in Ability Macros. Additional database character sheets should be named as follows:</p>'
							+'<table>'
							+'	<tr><th scope="row">Wizard Spells:</th><td>additional databases: MU-Spells-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Priest Spells:</th><td>additional databases: PR-Spells-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Powers:</th><td>additional databases: Powers-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Magic Items:</th><td>additional databases: MI-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Character Classes:</th><td>additional databases: Class-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Races, Creatures & Containers:</th><td>additional databases: Race-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Locks & Traps:</th><td>additional databases: Locks-Traps-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'	<tr><th scope="row">Attack Calculations:</th><td>additional databases: Attacks-DB-<i>[added name]</i> where <i>[added name]</i> can be replaced with anything you want.</td></tr>'
							+'</table>'
							+'<p><b>However:</b> the system will ignore any database with a name that includes a version number of the form "v#.#" where # can be any number or group of numbers e.g. "MI-DB v2.13" will be ignored.  This is so that the DM can version control their databases, with only the current one (without a version number) being live.</p>'
							+'<p>There can be as many additional databases as you want. Other Master series APIs come with additional databases, some of which overlap - this does not cause a problem as version control and merging unique macros is managed by the APIs.</p>'
							+'<p><b>Important Note:</b> all Character Sheet databases <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  This must be for all databases, both those provided (set by the API) and any user-defined ones.  Otherwise, Players will not be able to run the macros contained in them.</p>'
							+'<p>Each added database has a similar structure, with:</p>'
							+'<ul>'
							+'	<li>Ability Macros named as the class, spell, power, magic item, locks or traps specified, and used to describe and provide effects for classes, containers, spells, powers and magic items using the commands in the RPGMaster APIs;</li>'
							+'	<li>Custom Attributes with the attribute name "ct-ability-macro-name", one per Ability Macro, which defines the casting time and casting cost for spells & powers, and speed and MI type for magic items (not currently used for Class, Race, Container, Lock, Trap or Attack definitions);</li>'
							+'	<li>An entry in a list on the character sheet in the spell book of the relevant Character Sheet tab (Spell Level of the spell defined, Powers tab, or various spell books for different Classes & Magic Items - see Lock and Trap entries below).</li>'
							+'</ul>'
							+'<p>As with other RPGMaster suite databases, the GM need not worry about creating anything other than a correctly formatted macro entry, and then can run the <b>!magic --check-db Database-Name</b> command to check the database formatting, create the custom attributes and list entries, and re-index all database entries so that the new entries can be immediately used in live play.</p>'
							+'<p>Ability Macros can be whatever the DM wants and can be as simple or as complex as desired. Roll Templates are very useful when defining class, spell, power, magic item, trap and lock ability macros.  When a Player or an NPC or Monster views or casts a spell, power or uses a container or magic item the APIs run the relevant Ability Macro from the databases as if it had been run by the Player from the chat window.  All Roll20 functions for macros are available.</p>'
							+'<h3>1.1 Replacing Locks, Traps, Containers, Races, Classes, Spells & Items</h3>'
							+'<p>If you want to replace any Ability Macro provided in any of the databases, you can do so simply by creating an Ability Macro in one of your own databases with exactly the same name as the provided item to be replaced.  The API gives preference to Ability Macros in user-defined databases, so yours will be selected in preference to the one provided with the APIs.</p>'
							+'<br>'
							+'<h2>2. How Container Locks & Traps Work</h2>'
							+'<p><span style="color:red">Important Note:</span> In order for <i>Drag & Drop</i> containers to work, you must have the <b>ChatSetAttr</b> and <b>TokenMod</b> Mods loaded as well as RPGMaster suite APIs <span style="color:red"><i><b>and</b></i></span> ChatSetAttr <u>must</u> have "Players can modify all characters" option ticked, <span style="color:red"><i><b>and</b></i></span> TokenMod <u>must</u> have "Players can use --ids" option ticked.</p>'
							+'<p>Any token representing a character sheet can be a container.  This includes characters, NPCs, and creatures as well as token/character sheet pairs specifically intended to be containers such as chests, barrels, desks, bags and the like. Characters can have equipment such as weapons and armour added to their sheets, and obtain magic items on their quest - this is the character acting as a "container" for these items and equipment. Characters (and NPCs and some creatures) can <i>search</i> containers to find and loot items from them using the <b>!magic --search</b> command (see <i>MagicMaster Help</i> handout) or the <i>MI menu / Search for MIs & Treasure</i> action selection. They can also <i>store</i> items in a container using <b>!magic --pickorput</b> or <i>MI menu / Store MIs</i>. The GM can also store and edit items in any container by using the GM\'s <i>Add Items</i> dialog, which also can configure the number of slots  for items in a container, and the type of a container, as well as many other container and item management functions - see the <i>MagicMaster Help</i> handout for more information on the <b>!magic --gm-edit-mi</b> command (which is what the <i>Add Items</i> button calls).</p>'
							+'<h3>2.1 Container Management</h3>'
							+'<p>When any container is searched by a character (or NPC or creature), depending on the type of container (see below) it will eventually show its contents (if any). The contents can be added by the GM using the GM\'s <i>Add Items</i> dialog, or by characters, NPCs or creatures <i>storing</i> items in the container. The contents of the container are shown to those searching in one of two possible dialogs - one which shows a button for each item or stack of items (long menu), and another which provides a drop-down list of the items (short menu). Either dialog allows the searcher to select items to take from the container and add to their own equipment.</p>'
							+'<p>The GM can use the controls on the <i>Add Items</i> menu to mark any container to either show the exact names of the contents in these dialogs, or only show the type of each item: e.g. <i>Potion of Healing</i> might be shown simply as a <i>Potion</i>, or a <i>Broadsword +2</i> be displayed as a <i>Long Blade</i> i.e. only describing what the character sees.  When the searcher takes the item into their own equipment it might then be listed in that searcher\'s equipment by its true name (unless the GM has also <i>hidden</i> the item as another item or hidden it automatically with the <i>Looks-Like</i> function: see <i>MagicMaster Help</i> and <i>Magic Database Help</i> handouts).</p>'
							+'<p>The GM can also set the maximum number of "slots" that a container has: each unique item or type of item requires a slot to store it in. Once all slots are full, no more items can be stored in the container. Certain types of item can be "stacked": e.g. <i>Flight Arrows</i> can be stacked, with any number of <i>Flight Arrows</i> occupying one slot. However, <i>Flight Arrows</i> and <i>Sheaf Arrows</i> cannot be stacked together, and nor can <i>Flight Arrows</i> and <i>Flight Arrows +1</i>. A wand with multiple charges will perhaps look like a stacked item (as the quantity reflects the number of charges), but another wand of the same type cannot be stacked with it, as each is a unique item. When stacks are looted, a dialog will appear asking how many of the items in the stack want to be taken: alternatively, when a unique item with multiple charges is looted, the whole item will automatically be taken (i.e. a <i>Wand of Missiles</i> with 20 charges cannot be split into two or more with fewer charges).</p>'
							+'<h3>2.2 Types of Container</h3>'
							+'<p>Not all containers will react the same way when searched. How the container reacts is determined by the type of container set on the character sheet by the GM using the <i>Add Items</i> dialog, or automatically when creatures or containers are <i>Dragged & Dropped</i>. The current types are:</p>'
							+'<table>'
							+'<tr><th>Type</th><th>#</th><th>Description</th></tr>'
							+'<tr><td>Empty Inanimate Object</td><td>0</td><td>A simple container that is not a character, NPC or creature, such as a simple chest or a dead body, does not have a lock or trap, but is empty apart (perhaps) for some text-only treasure descriptions.</td></tr>'
							+'<tr><td>Inanimate Container with stuff</td><td>1</td><td>A simple container that is not a character, NPC or creature, does not have a lock or trap, and may contain items and equipment and possibly some text-only treasure descriptions.</td></tr>'
							+'<tr><td>Empty Sentient Creature</td><td>2</td><td>A character, NPC or creature that requires its "pocket to be picked" in order to loot stuff, but is empty (or their items are not pick-able) apart (perhaps) for some text-only treasure descriptions.</td></tr>'
							+'<tr><td>Sentient Creature with Stuff</td><td>3</td><td>A character, NPC or creature that requires its "pocket to be picked" in order to loot stuff, and may possess items and equipment and possibly some text-only treasure descriptions.</td></tr>'
							+'<tr><td>Trapped Container</td><td>4</td><td>A container of any type that may have a lock or trap that must be overcome before items it contains can be looted, and may or may not possess items and equipment and possibly some text-only treasure descriptions.</td></tr>'
							+'</table>'
							+'<p>The default type for a new character sheet just created is 0, an Empty Inanimate Container. However, if a <i>Drag & Drop</i> creature is created, the type is set to 2 (Empty Sentient Creature), or if a trapped or locked <i>Drag & Drop</i> container is created, the type is set to 4 (Trapped Container).  If the <i>Add Items</i> dialog or any character action adds items to an empty container or empty sentient creature, the type is changed to 1 or 3 respectively. As with everything to do with containers, the container type can be changed in the GM\'s <i>Add Items</i> dialog.</p>'
							+'<h3>2.3 Picking Pockets of Sentient Creatures</h3>'
							+'<p>When an attempt is made to search a container with type 2 or 3 (a sentient creature), the API will ask the searcher to make a "Pick Pockets" roll (whether the searcher is a Rogue or otherwise).  The Pick Pockets percentage displayed is that shown on the <i>Rogue</i> tab of the character sheet (minimum 5%). If successful, the looting process is the same as any other container. If failed, the contents are not displayed and, as per the <i>Dungeon Master\'s Guide</i>, the chance of the victim noticing is a percentage equal to 3 x victim\'s experience level. The API notifies the GM with the result of this roll, i.e. whether the victim notices the Pick Pockets attempt or not. The GM can then decide what happens next.</p>'
							+'<h3>2.4 Trapped and Locked Containers</h3>'
							+'<p>Containers of type 4 are seen by the APIs as perhaps being trapped or locked, and instead of displaying their contents the API runs the Ability Macro on the container\'s character sheet with the name "Trap-@{container-name|trap-version}". Generally, when first called, the attribute "trap-version" on the container character sheet will either not exist (the API will default it to a value of 0) or be 0, so the Ability Macro "Trap-0" will be run. If no Ability Macro with the name "Trap-0" exists on the container\'s sheet, the API tries to run one called just "Trap". If neither of these exist, the API just displays the contents of the container as if no trap or lock existed. The value of the "trap-version" attribute can be used to change the behavior of the container as actions occur, with Ability Macros "Trap-1", "Trap-2", etc having different outcomes on future searches of the same container - e.g. a successful removal of a trap may change the trap-version to 1 and the "Trap-1" macro just display the contents without having to overcome the trap again.</p>'
							+'<p>The trap / lock Ability Macros are standard Roll20 macros and can do anything that a standard Roll20 macro can do.  See the Roll20 Help Center for more information on macros. Typically, the "Trap-0" macro will ask the searcher to provide some key, password, combination number or perform some other activity in order to unlock its contents without negative consequences. The macro can call other macros, perhaps via API buttons or Roll Queries (see Roll20 help) which offer choices. For those Game Authors and GMs who are less comfortable coding Ability Macros, the RPGMaster suite offers configurable <i>Drag & Drop</i> containers which do all the hard work for you!</p>'
							+'<h3>2.5 <i>Drag & Drop</i> Containers</h3>'
							+'<p>From v2.2 of RPGMaster suite, <i>Drag & Drop</i> containers are provided with the APIs, alongside a database of Lock & Trap Macros they use to provide their locks and traps. When <i>Dragged & Dropped</i> (in the same way as a <i>Drag & Drop</i> creature: create a new blank character sheet, give it a sensible name, and then just drag it onto the playing surface to drop a token) the <i>Race, Class & Creature</i> dialog pops up, but now also with a new button called [Containers]. Remember to ensure the newly dropped token is selected, then selecting the [Containers] button opens a drop-down list in the centre of the screen allowing you to select a basic container type. Each of these have default images associated with them that will display a token appropriate to the container selected.  Select the one you want and a dialog appears supporting the selection of various pre-programmed locks & traps, the ability to change the images used for the container, and to change the effects of some locks and traps by setting different values.  Once selected, the token is automatically given a representative icon and all necessary aspects of the character sheet are configured for the trapped / locked container. The GM just needs to (optionally) add items to it using their <i>Add Items</i> dialog.</p>'
							+'<p>The description of the container can be looked at (including instructions on configuring it) by opening the "Bio" tab of the container\'s character sheet. Typically, the <i>Drag & Drop</i> container will come with an action button displayed when the container\'s token is selected to close any lock and/or trap without changing its status, so once opened the player characters can close the container and searching it will open it again (often without setting off the trap again!). There is also a new GM <i>Macro Bar</i> macro button added which allows the GM to reset the locks and traps on the container (so you can test the trap/lock and then reset it for others to find) - go to the <i>Collection</i> tab of the Chat Window and enable <i>Reset Container</i> to be in your Macro Bar. The GM\'s [Token Setup] button (or the command <b>!cmd --token-img</b>) can be used to configure the container (give the token new images, choose new locks & traps, and set variables the macros can use to new values). Review the container\'s "Bio" to check what the configuration options are - e.g. how to set a new list of password choices, set a new combination, set the key number that must be possessed, etc.</p>'
							+'<h3>2.6 Images and Image URLs</h3>'
							+'<p>The <i>Drag & Drop</i> Container system supports images to make tokens dynamic, appearing to change state such as opening, being destroyed and becoming a pile of ash, turning into a summoned creature, etc.  To do this it stores image URLs, and the GM can change these images to apear as they desire.</p>'
							+'<p>Image URLs must comply with the Roll20 rules for any token image set by Roll20 Mods and APIs. That includes that they can\'t be Premium Asset images, such as those from the Market Place: they must be from your own image library.  The images provided in the databases are from "Creative Commons" licenced sources. If you wish to replace the images provided, the best way to do so is to select the Container token, use the GM\'s [Token Setup] button to open the Container Configuration dialogue, then drag an image to the playing surface from your "My Library" image library, ensure that newly dropped image is selected and press the appropriate image button on the configuration dialogue. That will save the correctly formatted URL to the container.</p>'
							+'<p>You can add your own images to your "My Library" images using the [Upload] button on the "My Library" tab of the chat. Please source images responsibly.</p>'
							+'<h3>2.7 Who Rolls for Finding Traps?</h3>'
							+'<p>If you read the Player\'s Handbook when it describes Thieving skills, the roll for <i>Find Traps</i> is normally made by the GM. <i>Drag & Drop</i> containers can work in two ways, depending on the configuration settings: the GM can be prompted to make the roll for the Player (the default setting); or the Player can make the roll. In either case, the result of the roll will be handled by the coding of the <i>Drag & Drop</i> container.</p>'
							+'<p>In order to change which of the two options is in operation, use the GM\'s [Config-RPGM] button or the <b>!magic --config</b> command and set the <i>"Thievish Chance"</i> configuration as desired.</p>'
							+'<p>There are other rolls that can be made by Players when encountering locked and/or trapped containers: only the <i>Find Traps</i> roll is set by default to be able to be rolled by either the player or the GM, based on the configuration.  However, the <i>Locks-Traps-DB</i> includes example "GM-Roll-" versions of the macros involved in making <i>Remove Traps, Pick Locks,</i> and <i>Pick Pockets</i> rolls.  The GM or game creator can use these in programming their own containers in their own extensions to the <i>Locks-Traps-DB</i>.</p>'
							+'<h3>2.8 Data Inheritance</h3>'
							+'<p>In order to save time, effort and data space, any Race definition can "inherrit" data values from a "parent" definition, or even a "parent tree". As containers are considered to be a form of "Race" by the APIs, they too can inherrit data values, meaning that "families" of containers can be created where common data settings can be set once in the root definition. Any inherrited data tags can be overwritten with different values, and additional ones specified just by adding them to a data specification of the same name in the inherriting (child) definition. In the case of container definitions, the data is held as RaceData specifications.</p>'
							+'<p>In order to inherrit data, the <i>Specs</i> specification field four (the <i>Supertype</i>) for the inherriting "child" container must name the "parent" to be inherrited from. If the "parent" also has a <i>Specs Supertype</i> field that refers to a "grand-parent" the tree will be followed on upward until a <i>Supertype</i> that does not specify a valid definition of the same database item <i>Class</i> (<i>Specs</i> field two) is encountered: typically in the case of containers the tree would terminate with a database item of <i>Supertype</i> "Container".</p>'
							+'<p><b>Note:</b> this inheritance does not work for Lock and Trap definitions in the <i>Locks-Traps-DB</i> as in those definitions the <i>Supertype</i> specifically refers to the stored ability macro, and cannot refer to a parent database item.</p>'
							+'<h3>2.9 Roll Template Merging</h3>'
							+'<p>Another way of reusing common aspects of database definitions is to use the standard Roll20 macro technique of merging one ability macro specification into another, using the syntax "%{character_name|ability_macro}". However, in the case of use with RPGMaster database entries, the "character_name" can be the name of any internal or external database, or even just a database root name ending in "-DB" (e.g. the root name of the <i>Race-DB-Containers</i> database is <i>Race-DB</i>). This is the case even if the referred to ability is in a database held in code: the merge will occur as if between externally held database macros. As with inheritance, chaining of specifications can occur, and "%{...|...}" entries will be resolved until the point that no unresolved entries remain.</p>'
							+'<p>The way the merge progresses means that uniquely named Roll Template fields will all appear in the final display, but those with the same names will only display the data in <i><b>the last specified field</b></i> of that name in the merged templates, but in the <b><i>position in sequence of the first encountered field</i></b> of that name. Also, Roll Template fields with no data after the "=" will not be included in the display: this is also the case for fields defined as "{{}}" (allowing for bracketing of <i>Specs & Data</i> fields that <i><b>must</b></i> be defined <i><b>between</b></i> template fields in very short templates).</p>'
							+'<p><b><span style="color:red">Important Note:</span></b> The APIs always find the first <i>Specs=</i> and <i>....Data=</i> specifications in any merged database entries. It is best to ensure that the <i>Specs</i> and <i>Data</i> specifications are as early as possible in the specification, ahead of any "%{...|...}, so that it is those from the called database entry are used.</p>'
							+'<h3>2.10 No Whispering</h3>'
							+'<p>As with other RPGMaster database items, when updating the existing Lock & Trap items or creating new ones you should not add Roll20 "whispers", "emotes" etc. The APIs do some fairly special stuff with working out where posts should go, in terms of which players, characters, the GM, and also redirecting output when players are not logged on, and the APIs add their own Roll20 posting commands to ensure the right players see the right information at the right time, and don\'t see what they shouldn\'t.</p>'
							+'<p>That does not stop players from whispering, using emotes and other commands in chat to each other and the GM, or the GM in using "/desc" and other commands as normal.</p>'
							+'<h3>3. <i>Drag & Drop</i> Containers Database</h3>'
							+'<p>The <i>Drag & Drop</i> container system draws on definitions for different types of basic containers that are contained in the Containers Database. As with all other RPGMaster suite databases, this Database is distributed with the APIs in code, but can be extracted to review and copy elements by using the <b>!magic --extract-db Race-DB-Containers</b> command, which will extract the database to a character sheet, where the entries can be seen as ability macros. (It is recommended that you do not keep complete extracted databases, but instead copy those elements you want to use to your own database and then delete the extracted database - this will optimise system performance).</p>'
							+'<p>The Containers databases have names that start with Race-DB-Containers (or, in fact, can just start with <i>Race-DB</i>) and can have anything put at the end, though those with version numbers of the form v#.# as part of the name will be ignored.</p>'
							+'<p>As previously stated, each database definition has 3 parts in the database (see Section 1): an Ability Macro with a name that is unique and describes the type of container, a custom Attribute with the name of the Ability Macro preceded by "ct-", and a listing in the database character sheet of the ability macro name separated by \'|\' along with other container macros. The quickest way to understand these entries is to examine existing entries.  Do extract the root databases and take a look (but remember to delete them after exploring the items in them, so as not to slow the system down unnecessarily).</p>'
							+'<p><b>Note:</b> The DM creating new containers does not need to worry about anything other than the Ability Macro in the database, as running the <b>!magic -check-db < Database name ></b> command will update all other aspects of the database appropriately, as long as the <i>Specs</i> fields are correctly defined.</p>'
							+'<p>Ability macros can be added to a database just by using the [+Add] button at the top of the <i>Abilities</i> column in the <i>Attributes and Abilities</i> tab of the Database Character Sheet, and then using the edit "pencil" icon on the new entry to open it for editing.  Ability macros are standard Roll20 functionality and not dependent on the API.  Refer to the Roll20 Help Center for more information.</p>'
							+'<h3>3.1 Example Container Definition</h3>'
							+'<p>The Containers database includes a number of example container definitions, but the GM or game creator can add to these with their own definitions by following the information in this handout (and their own imagination!). Here is an example of a container definition:</p>'
							+'<h3>Large Chest</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">&{template:RPGMdefault}{{title=Large Chest}}{{subtitle=Container}}<mark style="color:green">Specs=[Large Chest,Container,0H,Container]</mark>{{Size=3ft x 2ft x 2ft, capacity 100lbs}}{{Slots=This chest has stackable 18 slots}}<mark style="color:blue">RaceData=[w:Large Chest, slots:18, lock:No-Lock, trap:No-Trap, attr:ac=4|hp=20, cimg:https://s3.amazonaws.com/files.d20.io/images/163011054/ LD6xZDT2SlYSow0Q5QHb3g/thumb.png?1599509586|105|75, oimg:https://s3.amazonaws.com/files.d20.io/images/352175458/ BYTfuvbA_JvbL0IUjeM0Ug/thumb.png?1690472095|105|105</mark>]{{GM Info=Use the GM\'s [Token Setup] button, or the **!cmd --token-img** command to change the token\'s images, locks & traps, and set variables to vary behaviour. Items can be stored in it by using the GM\'s [Add Items] button, or the **!magic --gm-edit-mi** command}}{{desc=This is an ordinary chest, which can be configured to have locks and traps. When searched, after locks and traps have been overcome, it will open and list its contents. Resetting it closes it again and resets the locks and traps.}}</p>'
							+'<p>There are a number of important aspects to this definition:</p>'
							+'<p><b>Roll Template:</b>The first element of note in this definition is that it is using a <i>Roll Template</i> for formatting the message to the player. Roll Templates are standard Roll20 functionality, generally provided by character sheet authors, but the RPGMaster suite has its own suite of Roll Template definitions, of which RPGMdefault is one. See the <i>RPGMaster Library Help</i> handout for details of RPGMaster Roll Templates</p>'
							+'<p><b>Specs:</b> The next item to note is the <i>Specs</i> field, with a format that is standard across all RPGMaster database entries.</p>'
							+'<pre>Specs=[Large Chest,Container,0H,Container]</pre>'
							+'<p>Slotted between Roll Template fields, the Specs field will not appear to the players, but is only available to the APIs. The first field is always the database item type (or name), the second is the class of database item (in this case a "Container" database item), the third is the handedness of the item (not yet relevant to Container items), and the fourth the Super-type which in the case of Container items is usually "Container": however, if using <i>"Race Definition Inheritance"</i>, the fourth element will be the name of the Container definition that this container inherits its RaceData from (see information on inheritance above).</p>'
							+'<p><b>RaceData:</b> As any character or creature can be a container, chests are part of the Race family that use RaceData specifications. Indeed, the preloaded examples include a sleeping character (who will wake if they detect you picking their pockets...) and a "dead(?)" body that transforms into a Zombie (or any other undead you want). RaceData can be <i>"inherited"</i> from another container definition - set the fourth <i>Specs</i> field to be the name of the Container database entry to inherrit from. See information on "Inheritance" above.</p>'
							+'<p>The elements in the RaceData specification define data that the locks & traps use during game play, that may affect their behaviour. Some of the relevant data tags are:</p>'
							+'<table>'
							+'<tr><th>Tag</th><th>Format</th><th>Default</th><th>Description</th></tr>'
							+'<tr><td>w:</td><td>Text</td><td>\' \'</td><td>The name of the container</td></tr>'
							+'<tr><td>slots:</td><td>#</td><td>18</td><td>The initial maximum number of container slots</td></tr>'
							+'<tr><td>lock:</td><td>Text</td><td>\' \'</td><td>The default Lock for this type of container</td></tr>'
							+'<tr><td>trap:</td><td>Text</td><td>\' \'</td><td>The default Trap for this type of container</td></tr>'
							+'<tr><td>attr:</td><td>Data Tags</td><td>\' \'</td><td>Attribute specifications for the container, typically AC & HP</td></tr>'
							+'<tr><td>cimg:</td><td>< url ></td><td>undefined</td><td>The URL of the image to use for a closed container</td></tr>'
							+'<tr><td>oimg:</td><td>< url ></td><td>undefined</td><td>The URL of the image to use for an open container</td></tr>'
							+'<tr><td>limg#:</td><td>< url >[%%label]</td><td>undefined</td><td>The optional URL of a user-definable image related to locks stored as lock-img# with an optional variable label</td></tr>'
							+'<tr><td>timg#:</td><td>< url >[%%label]</td><td>undefined</td><td>The optional URL of a user-definable image related to traps stored as trap-img# with an optional variable label</td></tr>'
							+'<tr><td>lvar#:</td><td>< text or # >[%%label]</td><td>\' \'</td><td>An initial setting for <i>lock-var#</i> with an optional variable label</td></tr>'
							+'<tr><td>tvar#:</td><td>< text or # >[%%label]></td><td>\' \'</td><td>An initial setting for <i>trap-var#</i> with an optional variable label</td></tr>'
							+'</table>'
							+'<p>The Large Chest container is specified as having 18 slots, no lock (represented by the <i>"No-Lock"</i> lock type), no trap (represented by the <i>"No-Trap"</i> trap type), an Armour Class of 4, 20 hit points, an image URL for a closed container and an image URL for an open container. No lock or trap variables are preset by this container definition.</p>'
							+'<p>Any of the RaceData tags can be inherrited from another container definition as described above, under the description for the <i>Specs</i>. Also, any of these tags can be overwritten by the Locks and/or Traps set for the container (not just the default ones specified in the container definition, but any lock or trap subsequently set).</p>'
							+'<p>The <i>"attr"</i> tag allows certain attributes on the character sheet of the container to be set, in the case of the Large Chest setting an Armour Class (AC) of 4 and 20 Hit Points(HP). The data format is for a pipe-delimited string of "< tag >=< value >|< tag >=< value >| ... ". The full list that can be used can be found at the end of this document, and also in more detail in the <i>Class & Race Database Help</i> handout.</p>'
							+'<p>The Lock and Trap variables (<i>lvar#</i> and <i>tvar#</i>) can be preset with values and variable names. The names for the variables appear on the Container Configuration dialogue to prompt the user to enter appropriate data. Generally, lock and trap variables are set by the lock & trap definitions.</p>'
							+'<p>The Open & Closed Container image URLs must be of the correct format (see above), and are generally set by the container definition (though they can be overwritten by the Lock and Trap definitions if needed). The Open & Closed Container image tags do not accept a name specification, as they are always just those images. Alternate images can be specified for the container, for use by Lock and Trap macros to display when the container enters other states: however, generally speaking, these Lock & Trap images are set by the Lock & Trap definitions.</p>'
							+'<h3>3.5 Lock & Trap Status Attributes</h3>'
							+'<p>There are a number of character sheet attributes that are set by various conditions and by some macros in the <i>Locks-Traps-DB</i> that can be useful to GMs and game creators that are programming their own locks & traps. The table below gives you an idea of what they are and how they are used, but the best way to learn is to extract the database and view some examples. <b>Note:</b> many of these attributes are set by each <i>Trap-#</i> macro when it is run by using the <i>ChatSetAttr</i> !setAttr command (see database for example <i>Trap-#</i> macros). You can add and set others to your own <i>Trap-#</i> macros as you require. Remember, these attributes can be accessed in the lock & trap macros by using the form <b>@{^^chest^^|attribute-name}</b>.</p>'
							+'<table>'
							+'<tr><th>Attribute</th><th>Values</th><th>Description</th></tr>'
							+'<tr><td>trap-version</td><td>#</td><td>The version of the "trap-" macros that will be called if a --search is conducted: initially 0</td></tr>'
							+'<tr><td>trap-status</td><td>Armed or Disarmed</td><td>Flag stating if the trap has already been disarmed</td></tr>'
							+'<tr><td>trap-status|max</td><td>Locked or Unlocked</td><td>Flag stating if the container has already been unlocked</td></tr>'
							+'<tr><td>gm-rolls</td><td>\'GM-Roll-\' or \' \'</td><td>Set to GM-Roll- if the configuration is for GMs to roll for <i>Find Traps</i></td></tr>'
							+'<tr><td>trap-name</td><td>< text ></td><td>The name of the trap on this container</td></tr>'
							+'<tr><td>trap-name|max</td><td>< text ></td><td>The name of the lock on this container</td></tr>'
							+'<tr><td>chest</td><td>token_id</td><td>The token ID of the container</td></tr>'
							+'<tr><td>playerid</td><td>player_id</td><td>The player ID of the player that controls the character that is searching the container</td></tr>'
							+'<tr><td>thief</td><td>token_id</td><td>The token ID of the character searching the container</td></tr>'
							+'<tr><td>charName</td><td>< text ></td><td>The name of the character that is searching the container</td></tr>'
							+'<tr><td>tstr</td><td>#</td><td>The strength score of the character searching the container</td></tr>'
							+'<tr><td>tint</td><td>#</td><td>The intelligence score of the character searching the container</td></tr>'
							+'<tr><td>tdex</td><td>#</td><td>The dexterity score of the character searching the container</td></tr>'
							+'<tr><td>bruteStr</td><td>#</td><td>The "bend-bars" chance of the character searching the container</td></tr>'
							+'<tr><td>openLock</td><td>#</td><td>The "open locks" score of the character searching the container</td></tr>'
							+'<tr><td>remTrap</td><td>#</td><td>The "find/remove traps" score of the character searching the container</td></tr>'
							+'</table>'
							+'<p>The attributes "gm-rolls" & "trap-status" are used in the macros as <i>qualifiers</i> to onward macro calls. For example:</p>'
							+'<pre>!magic --display-ability @{^^chest^^|thief}|^^chestid^^|@{^^chest^^|gm-rolls}Unlocked</pre>'
							+'<p>will either run the macro <code>Unlocked</code> or <code>GM-Roll-Unlocked</code> depending on the current value of "gm-rolls" on that container, where the "Unlocked" macro allows the Player to roll the dice for finding traps, whereas "GM-Roll-Unlocked" has the GM make the roll. And as another example:</p>'
							+'<pre>!magic --display-ability @{^^chest^^|thief}|^^chestid^^|Trap-@{^^chest^^|trap-status}</pre>'
							+'<p>will run either the macro <code>Trap-Armed</code> or <code>Trap-Disarmed</code> depending on the value of "trap-status" with alternative consequences for the party!</p>'
							+'<p>Of course, the ChatSetAttr command !setAttr can be used to change the values of these attributes as the player progresses through the sequence of macros, successfully removing the trap and setting <i>trap-status</i> to "Disarmed", or getting the correct combination and setting the <i>trap-status|max</i> to "Unlocked". Use of these statuses is important when the <b>!magic --find-traps</b> command or the equivalent <i>Items Menu / Find Traps</i> dialog is used, which finds (and possibly removes) the trap before tackling any lock.</p>'
							+'<h2>4. Locks & Traps Database</h2>'
							+'<p>The <i>Drag & Drop</i> container draws upon ability macro definitions in the Locks & Traps Database to configure their traps and locks. As with all other RPGMaster suite databases, this Database is distributed with the APIs in code, but can be extracted to review and copy elements by using the <b>!magic --extract-db Locks-Traps-DB</b> command, which will extract the database to a character sheet, where the entries can be seen as ability macros. (It is recommended that you do not keep complete extracted databases, but instead copy those elements you want to use to your own database and then delete the extracted database - this will optimise system performance).</p>'
							+'<p>The Locks & Traps databases have names that start with Locks-Traps-DB and can have anything put at the end, though those with version numbers of the form v#.# as part of the name will be ignored.</p>'
							+'<p>As previously stated, each database definition has 3 parts in the database (see Section 1): an Ability Macro with a name that is unique and matches the trap/lock action, a custom Attribute with the name of the Ability Macro preceded by "ct-", and a listing in the database character sheet of the ability macro name separated by \'|\' along with other trap/lock macros. The quickest way to understand these entries is to examine existing entries.  Do extract the root databases and take a look (but remember to delete them after exploring the items in them, so as not to slow the system down unnecessarily).</p>'
							+'<p><b>Note:</b> The DM creating new trap/lock macros does not need to worry about anything other than the Ability Macro in the database, as running the <b>!magic -check-db Locks-Traps-DB</b> command will update all other aspects of the database appropriately, as long as the <i>Specs</i> fields are correctly defined.</p>'
							+'<p>Ability macros can be added to a database just by using the [+Add] button at the top of the <i>Abilities</i> column in the <i>Attributes and Abilities</i> tab of the Database Character Sheet, and then using the edit "pencil" icon on the new entry to open it for editing.  Ability macros are standard Roll20 functionality and not dependent on the API.  Refer to the Roll20 Help Center for more information.</p>'
							+'<h3>4.1 Trap-# Ability Macros</h3>'
							+'<p>Here is an example of a Lock & Trap Database entry for a "Trap-0" type macro. Note that Trap-# macros are somewhat different from other Ability Macros in the Locks-Traps-DB, as they set up the trap/lock on first selection of the locked / trapped container.</p>'
							+'<h3>Key Lock</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">&{template:RPGMmessage}{{title=<span style="color:red">^^chest^^</span>}}<mark style="color:green">Specs=[Key-Lock,Lock|Ability,0H,Trap-0]</mark>{{desc=Do you have the key? [Key @{<span style="color:red">^^chest^^</span>|<span style="color:blue">lock-var1</span>}](!magic --display-ability c|<span style="color:red">^^tid^^</span>|<span style="color:red">^^chest^^</span>|Unlocked). If not are you going to try and pick the lock? To do so [Roll 1d100](~<span style="color:red">^^chest^^</span>|Open-Locks) and get less than your Open Locks percentage, which is [[{ {@{selected|olt} },{5} }kh1]]. If neither, then I suppose you can try [Brute Strength](!magic --display-ability c|<span style="color:red">^^tid^^</span>|<span style="color:red">^^chest^^</span>|Smash-the-Lock)?}}<mark style="color:blue">AbilityData=[w:Key Lock, lvar1:53%%Key Number, ns:11],[cl:AB,w:Open+List],[cl:AB,w:Opened-Lock],[cl:AB,w:Pick-a-Lock],[cl:AB,w:Return-Trap-2],[cl:AB,w:Find-Trap-Roll],[cl:AB,w:Return-Trap-3],[cl:AB,w:Find-Remove-Traps],[cl:AB,w:Smash-Lock],[cl:AB,w:Lock-Smash],[cl:AB,w:Not-Smashed],[cl:AB,w:Reset-Trap,action:1]</mark>{{GM desc=A key lock requires the searcher to have in their possession (though the system does not check) a particular key - or alternatively the searcher can try to pick the lock or smash it. If the lock pick fails or a critical fail is made on smashing the lock, any associated trap is triggered.<br>The GM can set the key name and the critical fail roll by selecting the container token and using the GM\'s [Token Setup] button, or the **!cmd --abilities** command.}}<br><span style="color:blue">!setattr --silent --charid <span style="color:red">^^chestid^^</span> --dexterity|@{<span style="color:red">^^cname^^</span>|dexterity} --thief|<span style="color:red">^^tid^^</span> --chest|<span style="color:red">^^targettid^^</span> --bruteStr|@{<span style="color:red">^^cname^^</span>|bendbar} --strength|@{<span style="color:red">^^cname^^</span>|strength} --openLock|@{<span style="color:red">^^cname^^</span>|olt} --remTrap|@{<span style="color:red">^^cname^^</span>|rtt} --intelligence|@{<span style="color:red">^^cname^^</span>|intelligence} --charName|<span style="color:red">^^cname^^</span></span></p>'
							+'<p>There are a number of aspects in common with the Container database entry described in the previous section: it uses a <i>Roll Template</i>, in this case one provided by the RPGMaster suite, it has a <i>Specs</i> specification in common with all RPGMaster database items, and there is a Data specification. However, the Specs and Data specifications have some differences:</p>'
							+'<p><b>Specs:</b> the format that is standard across all RPGMaster database entries:</p>'
							+'<pre>Specs=[Key-Lock,Lock|Ability,0H,Trap-0]</pre>'
							+'<p>Slotted between Roll Template fields, the Specs field will not appear to the players, but is only available to the APIs. The first field is always the database item type (or name), the second is the class of database item (in this case a "Lock|Ability" database item), the third is the handedness of the item (not currently relevant to Lock & Trap items), and the fourth the Super-type which in the case of Lock & Trap items is the name this macro will be stored as in the container character sheet that uses it.</p>'
							+'<p><b><span style="color:red">Important Note:</span></b> Lock & Trap database entry names (both the name of the Ability Macro and the first Specs data field) <b><i>must be different from any Super-type Specs field (the fourth field)</i></b>. This ensures the database & character sheet tidying functions don\'t delete the lock & trap macros from trapped / locked container character sheets. Trapped / locked containers run from Roll20 macros stored on the character sheet - if a --tidy function is executed on a trapped / locked container, any ability macros on the character sheet that have the same name as a Locks-Traps-DB data entry will be deleted (the API assumes that they can be read from the database, but in the case of Locks & Traps they can\'t).</p>'
							+'<p>The database entry <i>class</i> (the second Specs field) can be one of <b>Lock|Ability, Trap|Ability</b>, or just <b>Ability</b>. The (somewhat obvious) meaning is that those with <i>Lock</i> specify types of lock, and those with <i>Trap</i> specify types of trap. Those with just <i>Ability</i> specify steps in the action of a lock or trap. Locks and traps can be mixed for any container, allowing lots of interesting combinations.</p>'
							+'<p><b>AbilityData:</b> AbilityData specifications cannot "inherit" from parent ability definitions, as stated above. The elements in the AbilityData specification define data that the locks & traps use during game play, that may affect their behaviour. The data tags in the <i>AbilityData</i> are very similar to those in <i>RaceData</i> specifications for containers, and will overwrite those in the container definition when selected as a lock or trap for a container. Some of the relevant data tags are:</p>'
							+'<table>'
							+'<tr><th>Tag</th><th>Format</th><th>Default</th><th>Description</th></tr>'
							+'<tr><td>w:</td><td>Text</td><td>\' \'</td><td>The name of the lock/trap</td></tr>'
							+'<tr><td>magical:</td><td>[ 0 | 1 ]</td><td>0</td><td>Only for traps: trap is magical in nature (1), so "Remove Trap" rolls have half the chance they would otherwise</td></tr>'
							+'<tr><td>cimg:</td><td>url</td><td>undefined</td><td>The URL of the image to use for a closed container</td></tr>'
							+'<tr><td>oimg:</td><td>url</td><td>undefined</td><td>The URL of the image to use for an open container</td></tr>'
							+'<tr><td>limg#:</td><td>< url >[%%label]</td><td>undefined</td><td>The optional URL of a user-definable image related to locks stored as lock-img# with an optional variable label</td></tr>'
							+'<tr><td>timg#:</td><td>< url >[%%label]</td><td>undefined</td><td>The optional URL of a user-definable image related to traps stored as trap-img# with an optional variable label</td></tr>'
							+'<tr><td>lvar#:</td><td>< text or # >[%%label]</td><td>\' \'</td><td>An initial setting for <i>lock-var#</i> with an optional variable label</td></tr>'
							+'<tr><td>tvar#:</td><td>< text or # >[%%label]></td><td>\' \'</td><td>An initial setting for <i>trap-var#</i> with an optional variable label</td></tr>'
							+'<tr><td>ns:</td><td>#</td><td>0</td><td>The number of extra data specifications following the first dataset</td></tr>'
							+'<tr><td>cl:</td><td>AB | AC | MI | WP</td><td>\' \'</td><td>The class of the extra dataset. AB = Abilities that form part of this lock/trap</td></tr>'
							+'<tr><td>w:</td><td>Ability name</td><td>undefined</td><td>The name of the data item pointed to by the extra dataset, in this case a lock/trap ability</td></tr>'
							+'<tr><td>action:</td><td>[ 0 / 1 ]</td><td>0</td><td>A flag indicating if the Ability should appear as a token Action Button</td></tr>'
							+'</table>'
							+'<p>The <i>Key Lock</i> is defined as: setting user variable 1 as 53 (in this case predefining an expectation that key 53 opens the chest) with a label of "Key Number"; states there are 11 additional extra datasets; all the extra datasets are of the Abilities class; and each of the extra datasets specifies a macro definition from the Locks-Traps-DB that will be processed and stored in the <i>Dragged & Dropped</i> container.</p>'
							+'<p><b>Dynamic fields:</b> There are a number of <i>Dynamic Fields</i> used in this macro - the fields of the format ^^...^^. These are dynamically replaced at run time with the data they represent, which is dependent on the specific circumstances at that point in time. Most of these are only valid in "Trap-" macros (any macro with a Supertype (Specs field 4) starting "Trap-"):</p>'
							+'<table>'
							+'<tr><th>Dynamic Field</th><th>Validity</th><th>Description</th></tr>'
							+'<tr><td>^^chest^^</td><td>All macros</td><td>The character sheet name of this particular container</td></tr>'
							+'<tr><td>^^chestid^^</td><td>All macros</td><td>The character sheet ID of this particular container</td></tr>'
							+'<tr><td>^^cname^^</td><td>Trap- only</td><td>The character name of the character searching (or storing items in) the container</td></tr>'
							+'<tr><td>^^tname^^</td><td>Trap- only</td><td>The token name of the character searching (or storing items in) the container</td></tr>'
							+'<tr><td>^^cid^^</td><td>Trap- only</td><td>The character sheet ID of the character searching (or storing items in) the container</td></tr>'
							+'<tr><td>^^tid^^</td><td>Trap- only</td><td>The token ID of the character searching (or storing items in) the container</td></tr>'
							+'<tr><td>^^targetchar^^</td><td>Trap- only</td><td>Another way of specifying the character sheet name of the container (but only in Trap- macros)</td></tr>'
							+'<tr><td>^^targettoken^^</td><td>Trap- only</td><td>The token name of the container</td></tr>'
							+'<tr><td>^^targetcid^^</td><td>Trap- only</td><td>The character sheet ID of the container</td></tr>'
							+'<tr><td>^^targettid^^</td><td>Trap- only</td><td>The token ID of the container</td></tr>'
							+'</table>'
							+'<p><b>API buttons:</b> The lock & trap macros run using standard Roll20 functionality, and can contain any legitimate functions that Roll20 supports, as well as API calls to loaded mods (such as the RPGMaster suite itself). To support the player (and GM) interacting with the locks and traps, API buttons are used. API buttons are text enclosed in brackets, followed by commands in parentheses e.g. [Button text](command). These are standard Roll20 macro functionality and help on them can be found in the Roll20 Help Center.</p>'
							+'<p>The most common use in locks & traps is to have the player run the next macro from a choice of possible actions: the next macro can be called using <i>(~^^chest^^|macro-name)</i> or <i>(!magic --display-ability whisper-type|to-token-ID|^^chest^^|macro-name)</i>. The <i>!magic --display-ability</i> command has the advantage of being able to whisper to a character, player, the GM or publicly, whereas the tilde \'~\' macro call is less flexible, but \'~\' can allow 3D dice rolls, whereas <i>!magic --display-ability</i> will not.  See <i>MagicMaster Help</i> handout for more information on the --display-ability command.</p>'
							+'<p><b>Use of !setattr:</b> the call to the ChatSetAttr API (see separate documentation) is used to set several local custom attributes on the container\'s character sheet, so that the values can be accessed as the trap / lock sequence of macros progresses. Each of the values stored may not be otherwise available, as the creature doing the searching may lose the focus, and no longer be the "selected" token which otherwise would cause errors.</p>'
							+'<h3>4.2 Other Lock & Trap Database Macros</h3>'
							+'<p>Ability Macros other than those that represent "Trap-" macros do not have a number of the same features. The <i>Open-Locks</i> macro from the Key Lock sequence is shown below: note that the Ability Macro name in the database is "Pick-a-Lock", following the rule that the database macro name and the Supertype must be different, with the Supertype being the name that will end up in the container:</p>'
							+'<h3>Pick a Lock</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">&{template:RPGMdefault}{{title=<span style="color:red">^^chest^^</span>}}<mark style="color:green">Specs=[Pick-a-Lock,Ability,0H,Open-Locks]</mark>{{desc=You are trying to pick the lock of <span style="color:red">^^chest^^</span>. Your success is determined against your Open Locks percentage}}{{Target=[[{ {5},{@{<span style="color:red">^^chest^^</span>|openLock} } }kh1]]%}}{{Roll=[[?{Roll to Pick the Lock|1d100}]]}}{{Result=Roll<=Target}}{{successcmd=<span style="color:blue">!magic ~~display-ability c¦`{<span style="color:red">^^chest^^</span>¦thief}¦<span style="color:red">^^chest^^</span>¦Unlocked</span>}}{{failcmd=<span style="color:blue">!magic ~~display-ability public¦`{<span style="color:red">^^chest^^</span>¦thief}¦<span style="color:red">^^chest^^</span>¦Triggered</span>}}</p>'
							+'<p>Here it can be seen that the <i>Specs</i> database specifier shows that the database name is "Pick-a-Lock" (the first field), but it is saved in the container character sheet as "Open-Locks" (the 4th field). The macro also uses the value of <i>OpenLock</i>, a custom attribute that was stored using the ChatSetAttr API call in the "Trap-" macro call, as it cannot be guaranteed at this point in the process that the searching character token is still selected. It is also the case that the only dynamic fields available in macros other than the "Trap-" macros are "^^chest^^" and "^^chestid^^", which will always be replaced with the character sheet name and ID (respectively) of the container when it is built by the <i>Drag & Drop</i> process and the ability macros are added to its sheet.</p>'
							+'<p><b>Note:</b> This macro is using some specialised features of the RPGMaster Roll Templates: in this case the <i>Result</i> field tag will actually run a comparison of the numbers in the <i>Roll</i> and <i>Target</i> fields and display a green "Success" bar or a red "Failed" bar, depending on the result. The template will also run either the command string in the "successcmd" field, or the command string in the "failcmd" field, depending on the result, thus automatically affecting the macro sequence.</p>'
							+'<p>The other macros required to make the Key Locked Chest work are defined and used in a similar fashion.  See an extracted database for more examples.</p>'
							+'<h3>4.3 Trap/Lock Variables</h3>'
							+'<p>The author of the container ability macros can, of course, use the ChatSetAttr API command !setattr to store new custom attributes on any character sheet (but most typically the container\'s character sheet) to make changes in behavior. However, up to nine lock variables and nine trap variables exist that can be set using the RPGMaster container management dialog without going into the macro code. The AbilityData specification in any <i>Lock|Ability</i> or <i>Trap|Ability</i> macro can give them initial values and labels (using the syntax "lvar#:value%%label" or "tvar#:value%%label" with the %%label being optional), and those values altered for each individual dropped container to achieve changes in behavior as documented in each container specification. In the Ability Macros, these are then accessed either with @{^^chest^^|lock-var#} or @{^^chest^^|trap-var#}.</p>'
							+'<h3>4.4 Token Images</h3>'
							+'<p>There are up to 20 image URL variables that can be set by the <i>Drag & Drop</i> container system, each of which are paired with values for the width and height to set the token to. Two of these are reserved for the URLs of the images of the <i>closed</i> and <i>open</i> containers, nine are available for use by locks, and another nine for use by traps.</p>'
							+'<table>'
							+'<tr><th>Data Tag</th><th>Image variable</th><th>Width variable</th><th>Height variable</th><th>Used for</th></tr>'
							+'<tr><td>cimg</td><td>closed-img</td><td>closed-img-size</td><td>closed-img-size|max</td><td>The image URL for a closed container</td></tr>'
							+'<tr><td>oimg</td><td>open-img</td><td>open-img-size</td><td>open-img-size|max</td><td>The image URL for an open container</td></tr>'
							+'<tr><td>limg1</td><td>lock-img1</td><td>lock-img1-size</td><td>lock-img1-size|max</td><td>The image URL for the first user-defined lock image</td></tr>'
							+'<tr><td>limg2</td><td>lock-img2</td><td>lock-img2-size</td><td>lock-img2-size|max</td><td>The image URL for the second user-defined lock image</td></tr>'
							+'<tr><td>limg#</td><td>... </td><td>... </td><td>... </td><td>The image URL for the #th user-defined lock image</td></tr>'
							+'<tr><td>limg9</td><td>lock-img9</td><td>lock-img9-size</td><td>lock-img9-size|max</td><td>The image URL for the ninth user-defined lock image</td></tr>'
							+'<tr><td>timg1</td><td>trap-img1</td><td>trap-img1-size</td><td>trap-img1-size|max</td><td>The image URL for the first user-defined trap image</td></tr>'
							+'<tr><td>timg#</td><td>... </td><td>... </td><td>... </td><td>The image URL for the #th user-defined trap image</td></tr>'
							+'<tr><td>timg9</td><td>trap-img9</td><td>trap-img9-size</td><td>trap-img9-size|max</td><td>The image URL for the ninth user-defined trap image</td></tr>'
							+'</table>'
							+'<p>All the variables and the images can be set using RaceData tags in the container specification, can be added to or overwritten by the AbilityData tags in the lock and trap specifications, and altered individually for each dropped container using the GM\'s [Token Setup] button or the <b>!cmd --token-img token_id</b> command. An example of the use of the <i>trap-img1</i> is below:</p>'
							+'<h3>Chest 4 Poison Dart trap</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">&{template:RPGMwarning}{{name=Poison Dart trap}}<mark style="color:green">Specs=[Poison-dart-trap,Trap|Ability,0H,Triggered]</mark>{{desc=Oh no! You\'ve triggered a trap and four poison darts fly out, one from each side of the <span style="color:red">^^chest^^</span>, each doing [[@{<span style="color:red">^^chest^^</span>|<span style="color:blue">trap-var1</span>}]]HP piercing damage and [[@{<span style="color:red">^^chest^^</span>|<span style="color:blue">trap-var2</span>}]]HP poison damage (@{<span style="color:red">^^chest^^</span>|<span style="color:blue">trap-var3</span>})}}<mark style="color:blue">AbilityData=[w:Poison Dart trap, magical:0, tvar1:1%%Dart Damage Roll, tvar2:2d4%%Poison Damage Roll, tvar3:Poison Type C%%Poison Type, timg1:https://s3.amazonaws.com/files.d20.io/images/352954823/u8yGNHOGKcTsoJQB_A3b6Q/thumb.png?1690920737|280%%Dart Ranges, ns:3],[cl:AB,w:Poison-dart-trap-noticed],[cl:AB,w:Remove-Trap-Roll],[cl:AB,w:Reset-trap,action:1]</span>{{GM desc=The poison dart trap will shoot poison darts from the container if triggered. The GM can set the damage done by the darts, the damage done by the poison, the name of the poison type (DMG p73), and set trap image 1 displaying the ranges of the poison darts by selecting the container token and then using the GM\'s [Token Setup] button, or the **!cmd --abilities**.}}<br><span style="color:orange">!token-mod --ignore-selected --ids @{^^chest^^|chest} --set imgsrc|@{^^chest^^|trap-img1} width|@{^^chest^^|trap-img1-size} height|@{^^chest^^|trap-img1-size|max}</span></p>'
							+'<p>The key part of this macro is the <b>!token-mod</b> call to the TokenMod API that changes the <i>imgsrc, width,</i> and <i>height</i> values of the container token, to the image stored in <i>trap-img1</i> which in this case shows the chest with the ranges of the four poisoned darts that are ejected by the trap on this chest.</p>'
							+'<h3>3.4 Types of Container Traps and Locks</h3>'
							+'<p>The container database that comes with the APIs has examples of a number of different types of lock and trap:</p>'
							+'<ul><li>A key lock that asks if those looting have a specific key</li>'
							+'<li>A Password-based lock requiring the right password to open</li>'
							+'<li>A three-digit Combination Lock</li>'
							+'<li>An unlocked spell book to which a trap can be added</li>'
							+'<li>A poison dart trap, with specifiable damage & poison type</li>'
							+'<li>A wizard\'s spell trap, with specifiable spell and area of effect</li>'
							+'<li>An exploding runes trap that turns the container to ash</li>'
							+'<li>A dead body that can "come to life" as any specifiable <i>Drag & Drop</i> creature</li>'
							+'<li>A sleeping character that wakes on an unsuccessful pick-pockets roll</li></ul>'
							+'<p>There may also be more than these - this is the list at the time of writing. And each lock can be matched to any trap (or none) - so matching a combination with "Wake the Dead" and get the combination wrong a Lich is summoned! These can be extracted from the APIs using the command <b>!magic --extract-db Locks-Traps-DB</b> and used as examples.</p>'
							+'<h2>4. Structure of a Locked/Trapped Container</h2>'
							+'<p>As you will recognise if you have reviewed the earlier sections of this document, there are a number of different Roll20 ability macros that are inserted into a container\'s character sheet by the <i>Drag & Drop</i> Container system. The combination of macros inserted to the character sheet is important to make sure the container locks and traps work. It is key that there is a starting point for a character searching and looting the container, and that this starting point leads on to a sequence of macros that lead the character on a journey to either open the container and the ability to loot its items, or to suffer the consequences of a lack of caution.</p>'
							+'<h3>4.1 The Starting Point</h3>'
							+'<p>The starting point is always a macro of database item Supertype (Specs field 4) <i>Trap-#</i> (generally <i>Trap-0</i>) (or just <i>Trap</i>). This macro will include text to describe to the player what they are faced with as a lock &/or trap, in the current state of the lock & trap. The state of the container will be determined by the <i>Trap-version</i> attribute of the container:</p>'
							+'<table>'
							+'<tr><th>Trap-version</th><th>State represented</th></tr>'
							+'<tr><th>0</th><th>Locks & Traps (if any) are in tact and in a locked & set state</th></tr>'
							+'<tr><th>1</th><th>Locks & Traps have all been overcome and the container is easily lootable</th></tr>'
							+'<tr><th>2</th><th>Lock partially overcome, or lock open and awaiting a hunt for traps</th></tr>'
							+'<tr><th>3</th><th>Found a trap and awaiting the removal of the trap</th></tr>'
							+'<tr><th>#</th><th>Other numbers can represent additional states the container can be left in</th></tr>'
							+'</table>'
							+'<p>When a character conducts a search of the container, the RPGMaster APIs will start by calling a macro on the container called <i>Trap-#</i>, where "#" is the current value of the <i>Trap-version</i>. Thus, the character encounters the container in its current state.</p>'
							+'<p>The <i>Trap-0</i> macro is a special case: it not only is an entry point lock macro, but it defines the whole structure of the lock, the other database items that make it up, and the initial state of variables and images. It is always of database item class <b><i>Lock|Ability</i></b>. Its name will be the name of the lock displayed when specifying the lock for the container with the <b>!cmd --token-img</b> command, or the [Token Setup] action. It is the only lock macro to have an <i>AbilityData</i> specification. The AbilityData includes a number of repeating data sets, one for each additional Locks-Traps-DB database item that makes up the lock. Each of these extra data sets is of cl: type "AB" (although they can also include type "AC", "MI" or "WP" to add items, equipment or weapons to the container), and a w: of the database item name (not the Supertype of the item).</p>'
							+'<h3>Other Lock Macros</h3>'
							+'<p>Each of the database items named in the <i>Trap-0</i> macro must have a Specs specification with:</p>'
							+'<ul>'
							+'<li><b>First field:</b> Type (or name) of the database item</li>'
							+'<li><b>Second Field:</b> "Ability"</li>'
							+'<li><b>Third field:</b> Handedness (not yet used for Lock or Trap macros)</li>'
							+'<li><b>Forth field:</b> Supertype - the name the macro will be given in the container sheet</li>'
							+'</ul>'
							+'<p>The Supertypes of the lock must form links via API button calls (or other means of linking) in a meaningful sequence. The paths must lead to a hand-off to the macros that define any trap that is associated with the container. In general, the lock also accepts an interface from the trap macro path to a macro with a Supertype of <i>"Opens-list"</i> which is included in the Lock specification. The lock may also provide macros of Supertypes <i>"Trap-1"</i> and <i>"Trap-2"</i>.</p>'
							+'<h3>Macros Specifying a Trap</h3>'
							+'<p>The trap macros will have entry points of <i>"Triggered"</i> and <i>"Trap-Noticed"</i>. In this case, the special case is the macro of Supertype <i>Triggered</i>, with the database item class <b><i>Trap|Ability</i></b>. This macro is the one who\'s name will be listed when selecting a trap for the container with the <b>!cmd --token-img</b> command, or the [Token Setup] action. It is also the only trap macro to have an <i>AbilityData</i> specification specifying initial states for trap-var# attributes, any token images used by the trap which, like the lock "Trap-0" macro, includes a number of repeating data sets, one for each additional Locks-Traps-DB database item that makes up the trap. Each of these extra data sets is of cl: type "AB", and a w: of the database item name (not the Supertype of the item).</p>'
							+'<h3>Other Trap Macros</h3>'
							+'<p>Each of the database items named in the <i>Triggered</i> macro must have a Specs specification of the same structure as the lock macros. As with locks, the Supertypes of the trap macros must form links via API button calls (or other means of linking) in a meaningful sequence. The paths typically lead to a conclusion that either results in inflicting some sort of penalty on the character trying to loot the container, or the container opening and revealing its contents. The opening is generally by handing off to a macro provided by the lock of Supertype <i>"Opens-list"</i>.</p>'
							+'<p>A macro of Supertype <i>"Trap-Noticed"</i> will be called by the lock macros if a trap has been found by the character, and they want to attempt to remove it. The <i>Trap-Noticed"</i> macro will do what is necessary to determine if the particular trap selected can be removed successfully, or if the trap is actually triggered, calling other macros in sequence as necessary, often including calling the <i>Triggered</i> macro if the trap is not removed successfully.</p>'
							+'<h3>Example Lock/Trap Ability Flow</h3>'
							+'<p>Here is an example of how a lock and a trap, taken from the Locks-Traps-DB, create a sequence of ability macros in the chosen container character sheet. It is based on the Key Lock and Poison Dart Trap already introduced earlier in this help handout.</p>'
							+'<table>'
							+'<tr><td colspan="9" style="background-color:beige">Yellow = A part of the Lock</td><td colspan="10" style="background-color:aquamarine">Green = A part of the Trap</td></tr>'
							+'<tr><td style="background-color:beige">Trap-1</td><td colspan="17">=></td><td rowspan="2" style="background-color:beige">Opens-List</td></tr>'
							+'<tr><td style="background-color:aquamarine">Trap-3</td><td colspan="12">=></td><td rowspan="2" style="background-color:aquamarine">Trap-Noticed</td><td rowspan="2">=></td><td rowspan="2" style="background-color:aquamarine">Unlocked-Remove-Trap</td><td>[Success]</td><td>=></td></tr>'
							+'<tr><td style="background-color:beige">Trap-2</td><td colspan="7">=></td><td rowspan="3" style="background-color:beige">Unlocked</td><td rowspan="3">=></td><td rowspan="3" style="background-color:beige">Unlocked-Find-Trap</td><td>[Success]</td><td>=></td><td>[Fail]</td><td>=></td><td rowspan="6" style="background-color:aquamarine">Triggered</td></tr>'
							+'<tr><td rowspan="6" style="background-color:beige">Trap-0</td><td>[Have Key]</td><td colspan="6">=></td><td rowspan="2">[Fail]</td><td rowspan="2" colspan="6">=></td></tr>'
							+'<tr><td rowspan="2" style="background-color:beige">[Pick the Lock]</td><td rowspan="2">=></td><td rowspan="2" style="background-color:beige">Open-Locks</td><td>[Success]</td><td colspan="3">=></td></tr>'
							+'<tr><td>[Fail]</td><td colspan="13">=></td></tr>'
							+'<tr><td rowspan="3">[Brute Strangth]</td><td rowspan="3">=></td><td rowspan="3" style="background-color:beige">Smash-The-Lock</td><td rowspan="3">=></td><td rowspan="3" style="background-color:beige">Smashed-Lock-Check</td><td>[Success]</td><td>=></td><td style="background-color:beige">Unlocked</td><td>^^^</td><td colspan="8"> </td></tr>'
							+'<tr><td>[Critical Fail]</td><td colspan="11">=></td></tr>'
							+'<tr><td>[Fail]</td><td colspan="11">=></td><td style="background-color:beige">Still-Locked</td></tr>'
							+'</table>'
							+'<h2>5. Specs & Data field values</h2>'
							+'<p>Below are lists of the current possible values for the Lock and Trap database Ability macro sections.</p>'
							+'<h3>5.1 Specs sections</h3>'
							+'<pre>Specs=[Lock Type, Lock|Ability, Handedness, Trap-0 (or Trap)]</pre>'
							+'<pre>Specs=[Lock Type, Ability, Handedness, Supertype]</pre>'
							+'<pre>Specs=[Trap Type, Trap|Ability, Handedness, Triggered]</pre>'
							+'<pre>Specs=[Trap Type, Ability, Handedness, Supertype]</pre>'
							+'<p>If the item class (field 2) is "Lock|Ability", the Supertype must be "Trap-0" or "Trap", and visa-versa.</p>'
							+'<p>If the item class (field 2) is "Trap|Ability", the Supertype must be "Triggered", and visa-versa.</p>'
							+'<p>All fields must be explicitly specified.</p>'
							+'<h4>5.1(a) Lock and Trap Types</h4>'
							+'<p>There is an infinite list of lock types: the type of the "Lock|Ability" macro is the Lock name.</p>'
							+'<p>There is an infinite list of trap types: the type of the "Trap|Ability" macro is the Trap name.</p>'
							+'<h4>5.1(b) Macro Class</h4>'
							+'<p>Classes: One of "Lock|Ability", "Trap|Ability", or just "Ability".  This field is used to add the Lock or Trap name to the right base list for selection by the GM to configure the container.</p>'
							+'<h4>5.1(c) Handedness</h4>'
							+'<p>Handedness for Locks & Traps are not currently restricted or used by the system.  In future, the number of hands specified for a lock or trap might indicate how many hands need to be contributed to enact the opening of a lock or the removal of a trap.</p>'
							+'<h4>5.1(d) Lock & Trap Supertypes</h4>'
							+'<p>The following Supertypes must exist for each defined lock:</p>'
							+'<pre>Trap-0 (or Trap), Opens-list</pre>'
							+'<p>The following Supertypes must be called by each defined lock:</p>'
							+'<pre>Triggered</pre>'
							+'<p>The following Supertypes must exist for each defined trap:</p>'
							+'<pre>Triggered, Trap-Noticed</pre>'
							+'<p>Below is a table of the Supertypes currently provided and used in the Locks-Traps-DB as distributed with the APIs. Each Supertype may be used by several lock or trap sequence macros, each having a slightly different effect for that stage in the sequence. Some Supertypes require different processing for certain Locks/Traps if the Player is rolling for skills as opposed to the GM (set by the <b>!magic --config</b> command) - the appropriate macro will be used depending on the configuration for who rolls for skills at the point the <i>Drag & Drop</i> container is built. <b>Note:</b> changing the configuration after the container is built will not alter the behaviour of the container. The container must be rebuilt if you wish the behaviour to change.</p>'
							+'<table>'
							+'<tr><th rowspan="2">Supertype</th><th colspan="2">Macro Versions</th></tr>'
							+'<tr><th>Player Rolls</th><th>GM Rolls</th></tr>'
							+'<tr><td>Trap-0</td><td colspan="2">Combination-Lock<br>Key-Lock<br>Password-Lock<br>No-Lock<br>Sleeping-Creature<br>Undead-Body</td></tr>'
							+'<tr><td>Triggered</td><td colspan="2">Four-Dart-Trap<br>Destroying-Spell-Trap<br>Single-Poison-Dart-Trap<br>Summon-Undead<br>Summon-Creature<br>Wizard-Spell-Trap<br>Combination-Wrong-No-Trap<br>Explosive-Runes-Trap<br>No-Trap</td></tr>'
							+'<tr><td></td></tr>'
							+'<tr><td>First-Digit-0</td><td colspan="2">First-Digit-Right</td></tr>'
							+'<tr><td>First-Digit-1</td><td colspan="2">First-Digit-Wrong</td></tr>'
							+'<tr><td>Second-Digit-0</td><td colspan="2">Second-Digit-Right</td></tr>'
							+'<tr><td>Second-Digit-1</td><td colspan="2">Second-Digit-Wrong</td></tr>'
							+'<tr><td>Third-Digit-0</td><td colspan="2">Third-Digit-Right</td></tr>'
							+'<tr><td>Third-Digit-1</td><td colspan="2">Third-Digit-Wrong</td></tr>'
							+'<tr><td>Attempt-Right</td><td colspan="2">Password-Right</td></tr>'
							+'<tr><td>Attempt-Wrong</td><td colspan="2">Password-Wrong</td></tr>'
							+'<tr><td>Open-Locks</td><td>Pick-a-Lock<br>Pick-a-Pocket</td><td>GM-Roll-Pick-a-Lock<br>GM-Roll-Pick-a-Pocket</td></tr>'
							+'<tr><td>Lock-Unlocked</td><td colspan="2">Unlocked-Lock</td></tr>'
							+'<tr><td rowspan="2">Unlocked</td><td>Find-Traps</td><td>GM-Roll-Find-Traps</td></tr>'
							+'<tr><td colspan="2">Successful-PP</td></tr>'
							+'<tr><td>Unlocked-Find-Trap</td><td>Find-Trap-Roll</td><td>GM-Roll-Find-Trap-Roll</td></tr>'
							+'<tr><td>Open-Or-Find-Traps</td><td colspan="2">No-Traps-Found</td></tr>'
							+'<tr><td>Unlocked-Remove-Trap</td><td>Remove-Trap-Roll</td><td>GM-Roll-Remove-Trap</td></tr>'
							+'<tr><td>Trap-Not-Removed</td><td colspan="2">Trap-Remains</td></tr>'
							+'<tr><td>Detected-Runes</td><td colspan="2">Detect-Runes</td></tr>'
							+'<tr><td>Smash-the-Lock</td><td>Smash-Lock</td><td>GM-Roll-Smash-Lock</td></tr>'
							+'<tr><td>Smashed-Lock-Check</td><td>Lock-Smash</td><td>GM-Roll-Lock-Smash</td></tr>'
							+'<tr><td>Still-Locked</td><td colspan="2">Not-Smashed</td></tr>'
							+'<tr><td rowspan="2">Trap-Noticed</td><td>Poison-dart-trap-noticed<br>Found-Trap</td><td>GM-Roll-Dart-Trap-Noticed<br>GM-Roll-Found-Trap</td></tr>'
							+'<tr><td colspan="2">No-Trap-Noticed<br>Runes-Trap-Noticed</td></tr>'
							+'<tr><td>No-Lock-Trap</td><td colspan="2">No-Lock-No-Trap<br>No-Lock-Is-Trapped</td></tr>'
							+'<tr><td>Trake-Damage</td><td colspan="2">Taken-Damage</td></tr>'
							+'<tr><td>Opens-List</td><td colspan="2">Open+List<br>Open-the-Spellbook</td></tr>'
							+'<tr><td>Trap-1</td><td colspan="2">Opened-Lock<br>Opened-the-Spellbook</td></tr>'
							+'<tr><td>Trap-2</td><td colspan="2">Return-Trap-2</td></tr>'
							+'<tr><td>Trap-3</td><td colspan="2">Return-Trap-3</td></tr>'
							+'<tr><td>Trap-4</td><td colspan="2">Destroyed-Container<br>Destroyed-the-Spellbook</td></tr>'
							+'<tr><td>Close</td><td colspan="2">Close-Container</td></tr>'
							+'<tr><td>Reset</td><td colspan="2">Reset-Trap</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>5.2 Trap-version Values</h3>'
							+'<table>'
							+'<tr><th>Trap-version</th><th>Mandatory</th><th>State represented</th></tr>'
							+'<tr><td>0 (or none)</td><td>Yes</td><td>Locks & Traps (if any) are in tact and in a locked & set state</td></tr>'
							+'<tr><td>1</td><td>No</td><td>Locks & Traps have all been overcome and remain so and the container is easily lootable</td></tr>'
							+'<tr><td>2</td><td>No</td><td>Lock partially overcome, or lock open and awaiting a hunt for traps</td></tr>'
							+'<tr><td>3</td><td>No</td><td>Found a trap and awaiting the removal of the trap</td></tr>'
							+'<tr><td>#</td><td>No</td><td>Other numbers can represent additional states the container can be left in</td></tr>'
							+'</table>'
							+'<h3>5.3 Data Sections</h3>'
							+'<p>Below are the definitions for each of the possible RaceData fields.</p>'
							+'<p><b>Note:</b> Always refer to the database specification definitions in other sections above for detailed information on the use of these Field specifiers.  Not all specifiers have an obvious use. Square brackets \'[...]\' indicate optional data - don\'t include the brackets when specifying the optional data.</p>'
							+'<table>'
							+'	<thead>'
							+'		<tr>'
							+'			<th scope="col">Field</th>'
							+'			<th scope="col">Format</th>'
							+'			<th scope="col">Default Value</th>'
							+'			<th scope="col">Attribute</th>'
							+'			<th scope="col">Description</th>'
							+'		</tr>'
							+'	</thead>'
							+'	<tr><th scope="row">w:</th><td>< text ></td><td>\' \'</td><td> </td><td>Name of the database item</td></tr>'
							+'	<tr><th scope="row">magical:</td><td>[ 0 | 1 ]</td><td>0</td><td>Only for traps: trap is magical in nature (1), so "Remove Trap" rolls have half the chance they would otherwise</td></tr>'
							+'	<tr><th scope="row">slots:</th><td>#</td><td>18</td><td>container-size</td><td>Number of slots available in the container</td></tr>'
							+'	<tr><th scope="row">lvar#:</th><td>< text ></td><td>undefined</td><td>lock-var#</td><td>Variable used for lock processing. # can be 1 to 9</td></tr>'
							+'	<tr><th scope="row">tvar#:</th><td>< text ></td><td>undefined</td><td>trap-var#</td><td>Variable used for trap processing. # can be 1 to 9</td></tr>'
							+'	<tr><th scope="row">cimg:</th><td>URL [| width [| height ]]</td><td>Image of a closed chest</td><td>closed-img</td><td>URL of image of closed container, in a valid Roll20 format. Can be followed by width and/or height in pixels separated by pipes \'|\'</td></tr>'
							+'	<tr><th scope="row">oimg:</th><td>URL [| width [| height ]]</td><td>Image of an open chest</td><td>open-img</td><td>URL of image of open container, in a valid Roll20 format. Can be followed by width and/or height in pixels separated by pipes \'|\'</td></tr>'
							+'	<tr><th scope="row">limg#:</th><td>URL [| width [| height ]] [%% name]</td><td>undefined</td><td>lock-img#<br>lock-img#-size<br>lock-img#-size|max</td><td>URL of alternate lock image of container, in a valid Roll20 format. Can be followed by width and/or height in pixels separated by pipes \'|\', and a label for the image preceded by %%</td></tr>'
							+'	<tr><th scope="row">timg#:</th><td>URL [| width [| height ]] [%% name]</td><td>undefined</td><td>trap-img#<br>trap-img#-size<br>trap-img#-size|max</td><td>URL of alternate trap image of container, in a valid Roll20 format. Can be followed by width and/or height in pixels separated by pipes \'|\', and a label for the image preceded by %%</td></tr>'
							+'	<tr><th scope="row">ns:</th><td>< # ></td><td>0</td><td> </td><td>Number of repeating data sets</td></tr>'
							+'	<tr><th scope="row">cl:</th><td>< AB | MI | AC | WP ></td><td>\' \'</td><td> </td><td>Type of the repeating data set, AB = Lock / Trap ability</td></tr>'
							+'	<tr><th scope="row">w:</th><td>< text ></td><td>\' \'</td><td> </td><td>In repeating data set, database item name of macro to include in a lock or trap flow</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>5.4 Character Sheet data fields</h3>'
							+'<p>The Character Sheet field mapping to the API script can be altered using the definition of the fields object, the definition for which can be found at the top of the relevant <b>RPGMaster Library</b> API.  You can find the complete mapping for all APIs in the RPGMaster series, with an explanation of each, in a separate document - ask the API Author for a copy.</p>'
							+'</div>',
						},
	});

	/*
	 * Handles for other RPG and Character Sheet specific data tables 
	 * obtained from the RPGMaster Library.
	 */

	var fieldGroups;
	var primeClasses;
	var classLevels;
	var spellLevels;
	var saveLevels;
	var baseSaves;
	var raceSaveMods;
	var clTypeLists;
	var miTypeLists;
	var spTypeLists;
	var reSpellSpecs;
	var reClassSpecs;
	var reAttr;
	var baseThac0table;
	
	const PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	const messages = Object.freeze({
		noChar:	'&{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
		initMsg:'&{template:'+fields.menuTemplate+'} {{name=Initialisation Complete}}{{desc=Initialisation complete.  Command macros created.  Go to Macro tab (next to the cog at the top of the Chat window), and select them to show In Bar, and turn on the Macro Quick Bar.  Then start by dragging some characters on to the map to create tokens, and use Token-setup and Add-Items on each}}',
		waitMsg:'&{template:'+fields.warningTemplate+'} {{name=Please Wait}}{{desc=Gathering data. Please wait for the menu to appear.}}',
		convMsg:'&{template:'+fields.warningTemplate+'} {{name=Sheet Conversion}}{{Section1=You are about to convert the selected sheets to work with RPGMaster. This will move data from current tables and other places where it has previously been entered, and move it to where RPGMaster can make use of it. This means that the Character Sheets will probably become unusable in the way you were previously playing. <span style="color:red">***This cannot be undone!***</span> **It is highly recommended that you make copies of the Character Sheets before converting them** or, even better, make a complete copy of the campaign to use with RPGMaster in case you wish to reload any part from a previous version.}}',
		imgMsg:	'&{template:'+fields.warningTemplate+'}{{name=Can\'t Copy Marketplace Image}}{{desc=Unfortunately, it is not possible to use a token image quick copy to copy an image from a token with a marketplace image. Please select a token with an image from your own image library.}}',
	});
	
	const MenuState = Object.freeze({
		ENABLED: false,
		DISABLED: true,
	});
	
	const Attk = Object.freeze({
		TO_HIT: 'TO_HIT',
		ROLL: 'ROLL',
		TARGET: 'TARGET',
	});
	
	const TwoWeapons = Object.freeze({
		SINGLE: 0,
		PRIMARY: 2,
		SECONDARY: 4,
		NOPENALTY: ['ranger'],
	});
	
	const BT = Object.freeze({
		ALL_PRSPELLS:		'ALL_PRSPELLS',
		ALL_POWERS:			'ALL_POWERS',
		STOREITEM:			'STOREITEM',
		CS_RIGHT:			'CS_PRIMARY',
		CS_LEFT:			'CS_OFFHAND',
		CS_BOTH:			'CS_BOTH',
		CS_HAND:			'CS_HAND',
		CLEAR_CTRL:			'CLEAR_CTRL',
		PLAYER_CTRL:		'PLAYER_CTRL',
		SWITCH_CS_CHECK:	'SWITCH_CS_CHECK',
		CLASS_F:			'CLASS_F',
		CLASS_W:			'CLASS_W',
		CLASS_P:			'CLASS_P',
		CLASS_R:			'CLASS_R',
		CLASS_PSI:			'CLASS_PSI',
		LEVEL_F:			'LEVEL_F',
		LEVEL_W:			'LEVEL_W',
		LEVEL_P:			'LEVEL_P',
		LEVEL_R:			'LEVEL_R',
		LEVEL_PSI:			'LEVEL_PSI',
		RACE:				'RACE',
		CREATURE:			'CREATURE',
		CONTAINER:			'CONTAINER',
		CREATURE_CKD:		'CREATURE_CKD',
		CONTAINER_CKD:		'CONTAINER_CKD',
		RESET_CONTAINER:	'RESET_CONTAINER',
		TRAPTYPE:			'TRAPTYPE',
		LOCKTYPE:			'LOCKTYPE',
		REVIEW_CLASS:		'REVIEW_CLASS',
		REVIEW_RACE:		'REVIEW_RACE',
		REVIEW_STYLE:		'REVIEW_STYLE',
		CHANGE_NAME:		'CHANGE_NAME',
		ABILITY:			'ABILITY',
		AB_PC:				'AB_PC',
		AB_DM:				'AB_DM',
		AB_OTHER:			'AB_OTHER',
		AB_REPLACE: 	    'AB_REPLACE',
		AB_SIMPLE:			'AB_SIMPLE',
		AB_FULL:			'AB_FULL',
		AB_CLASSES:			'AB_CLASSES',
		AB_SAVES:			'AB_SAVES',
		AB_MANAGE_TOKEN:	'AB_MANAGE_TOKEN',
		AB_ASK_TOKENBARS:	'AB_ASK_TOKENBARS',
		AB_SET_TOKENBARS:	'AB_SET_TOKENBARS',
		AB_RESET_TOKENBARS:	'AB_RESET_TOKENBARS',
		AB_TOKEN:			'AB_TOKEN',
		AB_TOKEN_NONE:		'AB_TOKEN_NONE',
		AB_TOKEN_ASK_LINKED:'AB_TOKEN_ASK_LINKED',
		AB_TOKEN_SET_LINKED:'AB_TOKEN_SET_LINKED',
		AB_TOKEN_SET_ALL:	'AB_TOKEN_SET_ALL',
		AB_TOKEN_ASK_ALL:	'AB_TOKEN_ASK_ALL',
		AB_SILENT:			'AB_SILENT',
		STR_REPLACE:		'STR_REPLACE',
		SPELLCONV_MENU:		'SPELLCONV_MENU',
		FROMSPELL:			'FROMSPELL',
		TOSPELL:			'TOSPELL',
		CONVSPELL:			'CONVSPELL',
		REVIEW_SPELL:		'REVIEW_SPELL',
		FROMITEM:			'FROMITEM',
		TOITEM:				'TOITEM',
		STORE_ITEM:			'STORE_ITEM',
		REVIEW_ITEM:		'REVIEW_ITEM',
		ITEMCONV_MENU:		'ITEMCONV_MENU',
		TOKEN_IMG:			'TOKEN_IMG',
	});
		
	/*
	 * Object defining simple RPGMaster series ability actions to 
	 * their respective APIs and registered API actions.
	 */

	const redMaster = Object.freeze({
		init_menu: {api:'init',action:'menu'},
		attk_hit: {api:'attk',action:'attk_hit'},
		attk_roll: {api:'attk',action:'attk_roll'},
		attk_target: {api:'attk',action:'attk_target'},
		attk_menu: {api:'attk',action:'menu'},
		other_actions: {api:'attk',action:'other_actions'},
		cast_mu: {api:'magic',action:'cast_mu_spell'},
		cast_pr: {api:'magic',action:'cast_pr_spell'},
		cast_spell: {api:'magic',action:'cast_spell'},
		spells_menu: {api:'magic',action:'spells_menu'},
		use_power: {api:'magic',action:'use_power'},
		powers_menu: {api:'magic',action:'powers_menu'},
		use_mi: {api:'magic',action:'use_mi'},
		mi_menu: {api:'magic',action:'mi_menu'},
		rest: {api:'magic',action:'rest'},
	});
		
	const reIgnore = /[\s\-\_]*/gi;
	const reInvalid = /[\'\"\[\]\(\)\|\$\%\@\?\{\}\\]/g;
	const reAction = /abilitydata\s*=\s*\[[^\]]*?action:([01]).*?[,\]]/im;
	const reDiceSpec = /(\d+)(?:d(\d+))?([-+]\d+(?:d\d+)?(?:[-+]\d+)?)?(?:r(\d+))?/i;
	const reMod = /([-+]\d+)(?:d(\d+))?([-+]\d+)?/i;
	
	const	replacers = [
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
			[/\\cr;?/g, "\n"],
			[/\\comma;?/g, ","],
		];
		
	const encoders = [
			[/\r?\n/gm,'\\n'],
			[/'/gm,"\\'"],
			[/&/gm,"\\\\amp;"],
			[/>/gm,"\\\\gt;"],
			[/</gm,"\\\\lt;"]
		];

	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;

	const reEquipSpecs = {
		prime:		{field:'prime',def:'',re:/[\[,\s]prime:([\s\w\-\+\:]+?)[,\]]/i},
		offhand:	{field:'offhand',def:'',re:/[\[,\s]offhand:([\s\w\-\+\:]+?)[,\]]/i},
		both:		{field:'both',def:'',re:/[\[,\s]both:([\s\w\-\+\:]+?)[,\]]/i},
		others:		{field:'other',def:'',re:/[\[,\s]others:([\s\w\-\+\:\|]+?)[,\]]/i},
		items:		{field:'items',def:'',re:/[\[,\s]items:([\s\w\-\+\:\|]+?)[,\]]/i},
		hand:		{field:'chance',def:3,re:/[\[,\s]\hand:(\d+)[,\s\]]/i},
		cl:			{field:'spell',def:'',re:/[\[,\s]cl:(PR|MU|PW|WP|AC|MI)[,\s\]]/i},
		sp:			{field:'speed',def:0,re:/[\[,\s]sp:([d\d\+\-]+?)[,\s\]]/i},
		qty:		{field:'qty',def:1,re:/[\[,\s]qty:([d\d\+\-]+?)[,\s\]]/i},
		chance:		{field:'chance',def:1,re:/[\[,\s]%:(\d+)[,\s\]]/i},
		age:		{field:'age',def:0,re:/[\[,\s]age:([d\d\+\-]+?)[,\s\]]/i},
	};
	const std = Object.freeze({
		init_menu:		{api:'init',action:'Do_Initiative'},
		init_mon_menu:  {api:'init',action:'Do_Complex_Monster_Init'},
		attk_hit:		{api:'attk',action:'Attack_hit'},
		attk_roll:		{api:'attk',action:'Attack_roll'},
		attk_target:	{api:'attk',action:'Attack_target'},
		attk_menu:		{api:'attk',action:'Attack_menu'},
		other_actions:	{api:'attk',action:'Other_actions'},
		cast_mu:		{api:'magic',action:'Cast_MU_spell'},
		cast_pr:		{api:'magic',action:'Cast_PR_spell'},
		cast_spell:		{api:'magic',action:'Cast_spell'},
		spells_menu:	{api:'magic',action:'Spells_menu'},
		use_power:		{api:'magic',action:'Use_power'},
		powers_menu:	{api:'magic',action:'Powers_menu'},
		use_mi:			{api:'magic',action:'Use_magic_item'},
		mi_menu:		{api:'magic',action:'Magic_Item_menu'},
		rest:			{api:'magic',action:'Rest'},
		specials:		{api:'attk',action:'Specials'},
		bar:			{api:'init',action:'Bar'},
	});

	const sheetVersionData = Object.freeze ({
		lastStaticTables:	[3,3,1],
		reVersion:			/v(\d+)\.(\d+)\.(\d+)/i,
	});
	
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
		open_img: 'https://s3.amazonaws.com/files.d20.io/images/355714477/jouzZ3bALliE0SV-1NWaNg/thumb.png?1692686089',
		closed_img: 'https://s3.amazonaws.com/files.d20.io/images/355657918/NcpSVNL3LIpQPNxDcCBpog/thumb.png?1692651167|70|50',
		grey_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
		dark_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: black; font-weight: normal;"',
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"'
	};
	
	var flags = {
		feedbackName: 'CommandMaster',
		feedbackImg:  'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		image: false,
		archive: false,
		dice3d: true,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v2.030 determine if missing libraries should be notified
		notifyLibErr: true,
		noWaitMsg: true,
	};
	
	var parsedCmds = false,
		apiCommands = {},
		apiDBs = {magic:false,attk:false},
		registeredCmds = [],
		registeredAPI = {},
		abilities = [],
		asked = [],
		changedAbility = '',
		checkForChangedCmds = false,
		msg_orig = {},
		time = Date.now();
		
	var CommandMaster_tmp = (function() {
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
			if (!state.CommandMaster)
				{state.CommandMaster = {};}
			if (_.isUndefined(state.CommandMaster.CheckChar))
				{state.CommandMaster.CheckChar = false;}
			if (!state.CommandMaster.cmds) {
				state.CommandMaster.cmds = [];
//				state.CommandMaster.cmds[0] = 'Specials|Display special attacks and defences|attk| |\n/w "\\at{selected|character_name}" &{template:RPGMdefault}{{name=Special Attacks & Defences for\n\\at{selected|character_name}}}{{Special Attacks=\\at{selected|monsterspecattacks} }}{{Special Defences=\\at{selected|monsterspecdefenses} }}|';
//				state.CommandMaster.cmds[1] = 'Bar|Add inactive bar as an action button|money| |';
			}
			if (_.isUndefined(state.CommandMaster.debug))
				{state.CommandMaster.debug = false;}
			if (!state.RPGMaster)
				{state.RPGMaster = {};}

			[fields,RPGMap] = getRPGMap();
			fieldGroups = RPGMap.fieldGroups;
			primeClasses = RPGMap.primeClasses;
			classLevels = RPGMap.classLevels;
			spellLevels = RPGMap.spellLevels;
			saveLevels = RPGMap.saveLevels;
			baseSaves = RPGMap.baseSaves;
			raceSaveMods = RPGMap.raceSaveMods;
			clTypeLists = RPGMap.clTypeLists;
			miTypeLists = RPGMap.miTypeLists;
			spTypeLists = RPGMap.spTypeLists;
			reSpellSpecs = RPGMap.reSpellSpecs;
			reClassSpecs = RPGMap.reClassSpecs;
			reAttr = RPGMap.reAttr;
			baseThac0table = RPGMap.baseThac0table;
			dbNames = RPGMap.dbNames;
			DBindex = undefined;
			flags.noWaitMsg = true;
			setTimeout( () => {flags.noWaitMsg = false}, 5000 );

			if (_.isUndefined(state.RPGMaster.tokenFields)) {
				state.RPGMaster.tokenFields = [fields.AC[0],fields.Thac0_base[0],fields.HP[0]];
			};

			doRegistration('Specials|Display special attacks and defences|attk| |\n/w "\\at{selected%%character_name}" &{template:RPGMdefault}{{name=Special Attacks & Defences for\n\\at{selected%%character_name}}}{{Special Attacks=\\at{selected%%monsterspecattacks} }}{{Special Defences=\\at{selected%%monsterspecdefenses} }}|');
				
			setTimeout( () => issueHandshakeQuery('attk'), 20);
			setTimeout( () => issueHandshakeQuery('magic'), 20);
			setTimeout(() => updateHandouts(handouts,true,findTheGM()), 50);
			setTimeout(handleChangedCmds,10000);
			setTimeout( () => updateDBindex(false), 100); // checking the DB indexing
			setTimeout( () => makeCheckNamesMenu( [], true ), 2000);
			setTimeout( doInitialise, 1000, findTheGM() );
			
			if (state.CommandMaster.CheckChar)
				setTimeout(doCheckCharSetup,10000);

			log('-=> CommandMaster v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
		} catch (e) {
			log('CommandMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendDebug('CommandMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendCatchError('CommandMaster',null,e,'CommandMaster initialisation error');
		}
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
	
	// RED 2.050 Chat management functions moved to common library

	/**
	 * RED: v1.207 Send a debugging message if the debugging flag is set
	 */ 

	var sendDebug = function(msg) {
		if (!!state.CommandMaster.debug) {
			var player = getObj('player',state.CommandMaster.debug),
				to;
			if (player) {
				to = '/w "' + player.get('_displayname') + '" ';
			} else 
				{throw ('sendDebug could not find player');}
			if (!msg)
				{msg = 'No debug msg';}
			sendChat('CommandMaster Debug',to + '<span style="color: red; font-weight: bold;">'+msg+'</span>',null,(flags.archive ? null:{noarchive:true})); 
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
			state.CommandMaster.debug = senderId;
			sendResponseError(senderId,'CommandMaster Debug set on for ' + playerName,'CommandMaster Debug');
			sendDebug('Debugging turned on');
		} else {
			sendResponseError(senderId,'CommandMaster Debugging turned off','CommandMaster Debug');
			state.CommandMaster.debug = false;
		}
	};

// -------------------------------------------- utility functions ----------------------------------------------

	/**
	 * Issue a handshake request to check if another API or 
	 * specific API command is present
	 **/
	 
	var issueHandshakeQuery = function( api, cmd ) {
		var handshake = '!'+api+' --hsq cmd'+((cmd && cmd.length) ? ('|'+cmd) : '');
		sendAPI(handshake);
		if (_.isUndefined(apiCommands[api])) apiCommands[api] = {};
		apiCommands[api].exists = false;
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
	
/* ------------------------------------------------ Database & Handout Functions -------------------------------------------- */
	
	/**
	 * Create an internal index of items in the databases 
	 * to make searches much faster.  Index entries indexed by
	 * database root name & short name (name in lower case with 
	 * '-', '_' and ' ' ignored).  index[0] = abilityID,
	 * index[1] = ct-attributeID
	 * v3.051 Check that other database-handling APIs have finished
	 *        updating their databases and performed a handshake
	 **/
	 
	var updateDBindex = function(forceIndexUpdate=false) {
		
		apiDBs.magic = !!apiDBs.magic || ('undefined' === typeof MagicMaster);
		apiDBs.attk = !!apiDBs.attk || ('undefined' === typeof attackMaster);
		
		DBindex = getDBindex(forceIndexUpdate);
		return;
	}
	
/* ------------------------------------------------ Utility Functions -------------------------------------------- */
	
	/*
	 * Function to return an object specifying what APIs have 
	 * registered with CommandMaster.
	 */
	 
	var getRegistrations = function() {
		return registeredAPI;
	}
	
	/*
	 * Escape a string to use as a RegExp
	 */
	
	var escapeRegExp = function(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
	
	/*
	 * Function to replace special characters in a string
	 */
	 
	var parseStr=function(str){
		return replacers.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}

	/*
	 * Function to encode special characters in a string
	 */
	 
	var encodeStr=function(str){
		return encoders.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}

	/*
	 * Clean an image to make it suitable for a token
	 */
	
	var getCleanImgsrc = function (imgsrc) {
		var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
		if(parts) {
			return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
		}
		return '';
	};

	/*
	 * Function to parse a registered API action command to return 
	 * the correct string for the API call.
	 */
	 
	var parseCmd = function( api, action ) {
		var cmdSpec = _.find(registeredCmds,obj => ((obj.api == api) && (obj.action == action)));
		return (cmdSpec ? parseStr('!'+api+' '+cmdSpec.cmd+' '+cmdSpec.params) : 'Undefined');
	}

	/*
	 * Parse a data string for attribute settings
	 */
/*	 
	var parseData = function( attributes, reSpecs, def=true ) {
		
		var parsedData = {},
			val;

		_.each( reSpecs, spec => {
			val = attributes.match(spec.re);
			if (!!val && val.length>1 && val[1].length) {
				parsedData[spec.field] = val[1];
			} else if (!def) {
				parsedData[spec.field] = undefined;
			} else {
				parsedData[spec.field] = spec.def;
			}
		});
		return parsedData;
	}
	
	/*
	 * Find any abilities that match the definition passed in
	 */
	 
	var findAbilities = function( api, action, selected ) {
		
		var cmdStr = parseCmd( api, action ).replace('$$',''),
			searchStr = new RegExp(escapeRegExp(cmdStr)+'\\s*\\)|'+escapeRegExp(cmdStr)+'\\s*$','img'),
			charIDs = [],
			abilityObjs;

		_.each( selected, s => charIDs.push(getObj('graphic',s._id).get('represents')));
		charIDs = charIDs.filter( c => !!c );

		abilityObjs = filterObjs(function(obj) {
			return ((obj.get('type') == 'ability')
						&& charIDs.includes(obj.get('characterid'))
						&& searchStr.test(obj.get('action')));
		});
		return abilityObjs;
	}
	
	/*
	 * Create a list of weapons from the character's magic item bag
	 */
	
	var weaponLookup = function( charCS ) {
		
		var item, itemDef,
			weapProf, weapType,
			MagicItems = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
			weaponList = [],
			i = fields.Items_table[1],
			bagSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRows,
			re = /\[.*?,\s*?(\d+)H\s*?,.*?\]/ig;
			
		do {
			item = MagicItems.tableLookup( fields.Items_name, i, false );
			if (_.isUndefined(item)) {break;}
			itemDef = abilityLookup( fields.WeaponDB, item, charCS );
			if (itemDef.obj) {
				let specs = itemDef.obj[1].body,
					isWeapon = /{{\s*weapon\s*=.*?}}/im.test(specs),
					weaponSpecs = specs.match(/}}\s*specs\s*=(.*?){{/im);
				if (!isWeapon) continue;
				weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w\|]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
				for (let i=0; i<weaponSpecs.length; i++) {
					let types = weaponSpecs[i][1].split('|'),
						superTypes = weaponSpecs[i][4].split('|');
					for (let j=0; j<Math.max(types.length,superTypes.length); j++) {
						weaponList.push({weapon:types[Math.min(j,types.length-1)],weapType:superTypes[Math.min(j,superTypes.length-1)]});
					}
				}
			}
		} while (++i < bagSize);

		return weaponList;
	}
	
	/*
	 * Create a list of Proficiency buttons for the currently selected token.
	 * Selecting a button will call a handler to remove the proficiency.
	 */
	 
	var getProfButtons = function( selected ) {
		
		var	charCS = getCharacter(selected[0]._id, true);
		
		if (!charCS) return {profs:[], types:[]};
		
		var	ProfTable = getTable( charCS, fieldGroups.WPROF ),
			profs = [], 
			types = [],
			row, wpProf, wpName = '';
			
		for (row=ProfTable.table[1]; !_.isUndefined(wpName = ProfTable.tableLookup( fields.WP_name, row, false )); row++) {
			if (wpName && wpName != '-') {
				if (ProfTable.tableLookup( fields.WP_mastery, row ) == '1') {
					wpProf = ' Mastery';
				} else if (ProfTable.tableLookup( fields.WP_specialist, row ) == '1') {
					wpProf = ' Specialist';
				} else {
					wpProf = '';
				}
				profs.push( [wpName,wpProf] );
				wpName = ProfTable.tableLookup( fields.WP_type, row );
				if (wpName && wpName.length) types.push( wpName );
			}
		}
		profs= _.chain(profs)
				.compact()
				.sort((a,b)=>{
					const itemA = a[0].toUpperCase();
					const itemB = b[0].toUpperCase();
					if (itemA < itemB) return -1;
					if (itemA > itemB) return 1;
					return 0;
				})
				.uniq(true)
				.map( item => '['+item[0]+item[1]+'](!cmd --button CHOOSE_PROF|'+item[0]+')')
				.join('')
				.value();

		types= _.chain(types)
				.compact()
				.sort()
				.uniq(true)
				.map( item => '<span style=' + design.grey_button + '>'+item+'</span>')
				.join('')
				.value();
		return {profs:profs, types:types};
	}

	/*
	 * Find and return the powers for a specified class
	 * defined in the Class Databases.
	 */
	 
	var ClassPowers = function( charCS ) {
		
		var powers = [],
			content = '&{template:'+fields.defaultTemplate+'}{{name='+charCS.get('name')+'\'s Powers}}'
					+ '{{desc='+charCS.get('name')+' has been granted the following powers (if any)}}';
		
		for (const c in classLevels) {
			charClass = attrLookup( charCS, classLevels[c][0] ) || '';
			classSpec = abilityLookup( fields.ClassDB, charClass, charCS, true );
			if (!classSpec.obj) {
				charClass = primeClasses[c];
				classSpec = abilityLookup( fields.ClassDB, charClass, charCS );
			}
			if (classSpec.obj) {
				dbCS = findObjs({ type:'character', name:classSpec.dB });
				if (dbCS && dbCS.length) {
					dbCS = dbCS[0];
					charPowers = attrLookup( dbCS, [fields.ItemPowersList[0]+charClass,fields.ItemPowersList[1]] );
					if (charPowers && charPowers.length) {
						powers.push(charPowers.replace(/,/g,'|'));
					}
				}
				content += '{{'+charClass+'='+(charPowers || '').replace(/,/g,', ')+'}}';
			}
		}
		setAttr( charCS, [fields.Spellbook[0]+spellLevels.pw[1].book,fields.Spellbook[1]], powers.join('|') );
		sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		return;
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
	
	/**
	 * Parse the currently stored registered API commands
	 **/
	 
	var parseStoredCmds = function( commands ) {

		_.each( commands, (cmdStr,key) => {
			var args = (cmdStr || '').split('|'),
				action = args.shift(),
				desc = args.shift(),
				api = args.shift(),
				cmd = args.shift();

			registeredCmds.push({
				action:		action,
				desc:		desc,
				api:		api,
				cmd:		cmd,
				params: 	(args || ' ').join('|').replace('%%','|'),
				key:		key,
				changed:	false,
				oldCmdStr: 	'',
			});
			
			registeredAPI[api] = false;
		});
		parsedCmds = true;
		return;
	};
	
	/*
	 * Move all spells named in the various spell tables on the character sheet
	 * to the spellbook field of the appropriate class & level of spell or power,
	 * ready to be checked against the RPGMaster databases.
	 */

	var spells2Convert = function( args, selected ) {
		
		var tokenID,
			charCS,
			names,
			Spells,
			blank = false;
			
		var pushNames = function(Spells, lvl, lvlField, nameField, names) {
			for (let r=Spells.table[1]; r<Spells.sortKeys.length; r++) {
				if ((Spells.tableLookup( lvlField, r ) || lvl) != lvl) continue;
				let name = (Spells.tableLookup( nameField, r ) || '').trim();
				if (!names.includes(name) && name !== '-') {
					names.push(name);
				}
				if (blank) Spells.addTableRow(r);
			};
			return names;
		};
		
		spells2Conv.mu = [];
		spells2Conv.pr = [];
		spells2Conv.pw = [];
		
		_.each( selected, e => {
			tokenID = e._id;
			charCS = getCharacter( tokenID );
			_.each( spellLevels, (levels,castType) => {
				let castObj = caster( charCS, castType );
				_.each( levels, (col, l) => {
					names = [];
					if (!l || !['mu','pr','pw'].includes(castType)) return;
					
					for (let i=0; i<3; i++) {
						Spells = getTable( charCS, fieldGroups.SPELLS, (parseInt(col.base)+i) );
						names = pushNames(Spells,l,fields.Spells_spellLevel,fields.Spells_name,names);
					};
					if (castObj.clv > 0) {
						if (castType === 'mu') {
							Spells = getLvlTable( charCS, fieldGroups.ALTWIZ, l );
							names = pushNames(Spells, l, fields.AltSpells_level, fields.AltSpells_name, names);
						} else if (castType === 'pr') {
							Spells = getLvlTable( charCS, fieldGroups.ALTPRI, l );
							names = pushNames(Spells, l, fields.AltSpells_level, fields.AltSpells_name, names);
						} else if (castType === 'pw' && !_.isUndefined(fieldGroups.ALTPWR)) {
							Spells = getLvlTable( charCS, fieldGroups.ALTPWR, l );
							names = pushNames(Spells, l, fields.AltPowers_level, fields.AltPowers_name, names);
						};
					};
//					let spellbook = (attrLookup( charCS, [fields.Spellbook[0]+col.book,fields.Spellbook[1]] ) || '')
//										.split( /(?:\|\s*|\,\s*|$)/m )
//										.filter(s => !!s)
//										.map(s => s.substring(0,80).trim());
					let spellbook = '';
					setAttr( charCS, [fields.Spellbook[0]+col.book,fields.Spellbook[1]], _.uniq(names.concat(spellbook).sort(),true).join('|') );
					log('spells2convert: setting spellbook '+fields.Spellbook[0]+col.book+' to be '+_.uniq(names.concat(spellbook).sort(),true).join('|'));
				});
			});
		});
	};
	
	/**
	 * Calculate/roll an attribute value that has a range
	 * Always tries to create a 3 dice bell curve for the value
	 **/
	 
	var calcAttr = function( attr='3:18' ) {
		let attrRange = attr.split(':'),
			low = parseInt(attrRange[0]),
			high = parseInt(attrRange[1]);
		if (high && !isNaN(low) && !isNaN(high)) {
			let range = high - (low - 1);
			if (range === 2) {
				return low - 1 + randomInteger(2);
			} else if (range === 3) {
				return low - 2 + randomInteger(2) + randomInteger(2);
			} else if (range === 5) {
				return low - 2 + randomInteger(3) + randomInteger(3);
			} else if ((range-2)%3 === 0) {
				return low - 3 + randomInteger(Math.ceil(range/3)+1) + randomInteger(Math.floor(range/3)+1) + randomInteger(Math.floor(range/3)+1);
			} else if ((range-1)%3 === 0) {
				return low - 3 + randomInteger(Math.ceil(range/3)) + randomInteger(Math.ceil(range/3)) + randomInteger(Math.ceil(range/3));
			} else if ((range)%3 === 0) {
				return low - 3 + randomInteger((range/3)+1) + randomInteger((range/3)+1) + randomInteger(range/3);
			}
		}
		return attr;
	}
	
	/*
	 * Set up container variables
	 */
	
	var setVars = function(charCS,data,field,prefix,total,change=false) {
		var i;
		for (i=1; !_.isUndefined(data[field+i]) && i <= 9; i++) {
			if (change) {
				let v = data[field+i].split('%%');
				setAttr( charCS, [(prefix+i),'current'], parseStr(v[0] || '') );
				setAttr( charCS, [(prefix+i),'max'], parseStr(v[1] || (field+i)) );
			};
		};
		setAttr( charCS, total, i-1 );
	};
	
	/*
	 * Set container images
	 */
	
	var setImgs = function(tokenObj,charCS,parsedData,change=false) {
		
		var parseImgs = function(charCS,data,field,prefix,total,change) {
			var i;
			for (i=1; (!_.isUndefined(data[prefix+i]) && data[prefix+i].trim().length) && i <= 9; i++) {
				if (change) {
					let v = data[prefix+i].split('%%'),
						s = v[0].split('|');
					setAttr( charCS, [(field+i+'-size'),'current'], (s[1] || 70) );
					setAttr( charCS, [(field+i+'-size'),'max'], (s[2] || s[1] || 70) );
					setAttr( charCS, [(field+i),'current'], getCleanImgsrc(s[0]) );
					setAttr( charCS, [(field+i),'max'], (v[1] || ('Alt Image '+i)) );
				};
			};
			setAttr( charCS, total, i-1 );
		};
		
		parseImgs(charCS,parsedData,fields.Lock_imgPrefix[0],fields.Token_lockImgPrefix[0],fields.Lock_imgs,change);
		parseImgs(charCS,parsedData,fields.Trap_imgPrefix[0],fields.Token_trapImgPrefix[0],fields.Trap_imgs,change);
		
		let curClosed = [attrLookup( charCS, fields.Token_closedImg ),attrLookup( charCS, fields.Token_closedImgW ),attrLookup( charCS, fields.Token_closedImgH )],
			curOpen = [attrLookup( charCS, fields.Token_openImg ),attrLookup( charCS, fields.Token_openImgW ),attrLookup( charCS, fields.Token_openImgH )],
			closedImg = (parsedData.cimg || (!curClosed[0] ? design.closed_img : curClosed.join('|'))).split('|'),
			openImg = (parsedData.oimg || (!curOpen[0] ? design.open_img : curOpen.join('|'))).split('|');

		if (change) {
			setAttr( charCS, fields.Token_closedImg, getCleanImgsrc(closedImg[0]) );
			setAttr( charCS, fields.Token_closedImgW, (closedImg[1] || 70) );
			setAttr( charCS, fields.Token_closedImgH, (closedImg[2] || closedImg[1] || 70) );
			setAttr( charCS, fields.Token_openImg, getCleanImgsrc(openImg[0]) );
			setAttr( charCS, fields.Token_openImgW, (openImg[1] || 70) );
			setAttr( charCS, fields.Token_openImgH, (openImg[2] || openImg[1] || 70) );
		} else {
			closedImg = !curClosed[0] ? design.closed_img.split('|') : curClosed;
		}

		if (tokenObj && closedImg[0]) {
			tokenObj.set({width:parseInt(closedImg[1] || 70),
						  height:parseInt(closedImg[2] || closedImg[1] || 70),
						  imgsrc:getCleanImgsrc(closedImg[0]),
						  flipv:true,
						  fliph:true,
						  rotation:180
			});
//			tokenObj.set('width',parseInt(closedImg[1] || 70));
//			tokenObj.set('height',parseInt(closedImg[2] || closedImg[1] || 70));
//			tokenObj.set('imgsrc',getCleanImgsrc(closedImg[0]));
		}
		return closedImg;
	};
	
	/*
	 * Parse the database definitions that make up the race and class 
	 * of a character sheet and, if any, the lock & trap if it is a 
	 * container, and create a Bio tab description.
	 */

	var parseDesc = function( charCS, senderId ) {
		
		var race = attrLookup( charCS, fields.Race ) || 'Human',
			raceObj = getAbility( fields.RaceDB, race, charCS ),
			classObjs = classObjects( charCS, senderId ),
			gender = attrLookup( charCS, fields.Gender ),
			lock = attrLookup( charCS, fields.Container_lock ) || '',
			lockObj = lock ? getAbility( fields.AbilitiesDB, lock, charCS ) : {},
			trap = attrLookup( charCS, fields.Container_trap ) || '',
			trapObj = trap ? getAbility( fields.AbilitiesDB, trap, charCS ) : {},
			bio = '',
			GMbio = '',
			bioPart, GMpart;
			
		var createBio = function( charCS, bioObj, partName, onlyGM=false ) {
			if (!bioObj.obj) return ['',''];

			var descObj = _.object([...bioObj.obj[1].body.replace(/[\r\n]/g,'').matchAll(/\{\{([^{}]+?)=(.*?)\}\}/g)].map(v => v.slice(1))),
				content = '',
				GMcontent = '';
			if (descObj) {
				content += '<h3>'+partName+': '+(onlyGM ? bioObj.obj[1].name : ((descObj.prefix || '')+' '+(descObj.title || '')+' '+(descObj.name || ''))) + '</h3>';
				if (!onlyGM) {
					if (!_.isUndefined(descObj.desc)) content += '<p>'+descObj.desc+'</p>';
					for (let i=1; i<=9; ++i) {
						if (!_.isUndefined(descObj['desc'+i])) content += '<p>'+(descObj['desc'+i].replace(/\*\*\*(.*?)\*\*\*/img,'<b><i>$1</i></b>')
																								  .replace(/\*\*(.*?)\*\*/img,'<b>$1</b>')
																								  .replace(/\*(.*?)\*/img,'<i>$1</i>'))+'</p>';
					};
				};
				_.each(descObj,(t,k) => {
					t = t.replace(/\*\*\*(.*?)\*\*\*/img,'<b><i>$1</i></b>');
					t = t.replace(/\*\*(.*?)\*\*/img,'<b>$1</b>');
					t = t.replace(/\*(.*?)\*/img,'<i>$1</i>');
					descObj[k] = t;
					if (!t || !t.length) return;
					if (!onlyGM && k.toLowerCase().startsWith('section')) {
						if (!t.toLowerCase().includes('description')) {
							if (t.endsWith('</b>')) {
								content += '<h4>' + t + '</h4>';
							} else {
								content += '<p>' + t + '</p>';
							}
						}
					} else if (['gminfo','gmdesc'].includes(k.toLowerCase().replace(/\s/g,''))) {
						GMcontent += '<p>'+t+'</p><br>';
					} else if (!onlyGM) {
						content += (['prefix','name','title','subtitle'].includes(k.toLowerCase().replace(/\s/g,'')) || k.toLowerCase().startsWith('desc')) ? '' : '<p><b>' + k + '</b>: ' + t + '</p>';
					}
				});
			};
			return [content,GMcontent];
		};
			
		charCS.get('bio', bio => {
			bio = (bio.match(/[^]*~~~ Place your own text above this line ~~~/im) || ['~~~ Place your own text above this line ~~~'])[0];
		
			[bioPart,GMpart] = createBio( charCS, raceObj, "Race" );
			bio += bioPart;
			GMbio += GMpart;
			
			_.each( classObjs, cObj => {
				if (cObj.name === 'creature' || cObj.base === 'creature') return;
				[bioPart,GMpart] = createBio( charCS, cObj, "Class" );
				bio += bioPart;
				GMbio += GMpart;
			});
			
			if (lock && lock.length) {
				[bioPart,GMpart] = createBio( charCS, lockObj, "Lock", true );
				GMbio += bioPart + GMpart;
			};
			
			if (trap && trap.length) {
				[bioPart,GMpart] = createBio( charCS, trapObj, "Trap", true );
				GMbio += bioPart + GMpart;
			};

			charCS.set( "bio", bio );
		});

		charCS.get('gmnotes', bio => {
			bio = (bio.match(/[^]*~~~ Place your own text above this line ~~~/im) || ['~~~ Place your own text above this line ~~~'])[0];
			charCS.set( "gmnotes", bio+GMbio );
		})
	}
	
	/**
	 * A function to calculate an internal dice roll
	 */
		
	var rollDice = function( count, dice, reroll ) {
		count = parseInt(count || 1);
		dice = parseInt(dice || 8);
		reroll = parseInt(reroll || 0);
		let total = 0,
			roll;
		for (let d=0; d<count; d++) {
			do {
				roll = randomInteger(dice);
			} while (roll <= (reroll || 0));
			total += roll;
		}
		return total;
	}
	
	/**
	 * Evaluate a numeric attribute value, including rolling dice,
	 * Evaluating ranges, and doing maths using eval()
	 */
	 
	var evalAttr = function(v) { 
		function reRoll(m,n,p,r) { return rollDice(n,p,r); };
		var handoutIDs = getHandoutIDs(),
			orig = v;
		const rePar = /\([\d\+\-\*\/]+?\)/g,
			  reRange = /\d+\:\d+/g,
			  reDice = /(\d+)d(\d+)(?:r(\d+))?/ig,
			  reMinMax = /[Mthmaxin\.\,\(\)\d\+\-\*\/]+/g;
		
		try {
			if (!v || !v.length) {
				return '';
			} else {
				v = v.replace(/;/g,',')
					 .replace(/\^\(/g,'Math.max(')
					 .replace(/v\(/g,'Math.min(')
					 .replace(/\-\-/g,'+')
					 .replace(/\+\-/g,'-');
				do {
					do {
						do{
							while (rePar.test(v)) v = v.replace(rePar,eval).replace(/\-\-/g,'+').replace(/\+\-/g,'-');
							v = v.replace(reRange,calcAttr).replace(/\-\-/g,'+').replace(/\+\-/g,'-');
						} while (rePar.test(v) || reRange.test(v));
						v = v.replace(reDice,reRoll).replace(/\-\-/g,'+').replace(/\+\-/g,'-');
					} while (rePar.test(v) || reRange.test(v) || reDice.test(v));
					v = v.replace(reMinMax,eval).replace(/\-\-/g,'+').replace(/\+\-/g,'-');
				} while (rePar.test(v) || reRange.test(v) || reDice.test(v));
				return v;
			};
		} catch {
			sendError('Invalid attribute value given: calculating "'+orig+'" but only **\'+ - &#42; / ( ) : d ^ v ,\'** can be used. Current evaluation is '+v+'. See **[CommandMaster Help]('+fields.journalURL+handoutIDs.CommandMasterHelp+')** for allowed Creature attribute specification formats.');
			return v;
		};
	};
	
	/**
	 * Set creature/monster attributes if specified in the 
	 * race definition
	 **/

	var setCreatureAttrs = function( cmd, charCS, senderId, creature, token, qualifier=[] ) { 
	
		var raceData, attrData, rawData,
			raceDesc, i,
			tokenObj = getObj('graphic',token._id),
			isReset = cmd.toUpperCase() === BT.RESET_CONTAINER,
			isCreature = !isReset && cmd.toUpperCase() !== BT.CONTAINER;
			
		async function addPowersAndItems( charCS, token, isCreature, senderId ) {
			if (await handleAddAllPowers( [BT.RACE], 'PW', [token], senderId )) {
				handleSetAbility( ['',BT.AB_SILENT,'Use Power',std.use_power.api,std.use_power.action,'2.Use Power','replace'], [token] );
				handleSetAbility( ['',BT.AB_SILENT,'Powers menu',std.powers_menu.api,std.powers_menu.action,'3.Powers Menu','replace'], [token] );
			}
			sendAPI('!magic --mem-all-powers '+token._id);
			if (!isCreature) {
				await handleAddAllPowers( [BT.RACE], 'AB', [token], senderId );
			} else {
				await handleAddAllPowers( [BT.RACE], 'MU', [token], senderId );
				await handleAddAllPowers( [BT.RACE], 'PR', [token], senderId );
				sendAPI('!magic --mem-all-spells ALL_MUSPELLS|'+token._id+' --mem-all-spells ALL_PRSPELLS|'+token._id);
			}
			let content = ((await handleAddAllItems( token._id, charCS, senderId, 'wp' )
						  + await handleAddAllItems( token._id, charCS, senderId, 'ac' )
						  + await handleAddAllItems( token._id, charCS, senderId, 'mi' )) || '').trim();
			if (content && content.length) sendFeedback( '&{template:'+fields.defaultTemplate+'}{{title=Items added to '+charCS.get('name')+'}}' + content );
		}
		
		if (creature && creature.trim().length) {
			
			[raceData,attrData,rawData] = resolveData( creature, fields.RaceDB, /}}\s*?racedata\s*?=\s*\[(.*?)\],?{{/im, qualifier );
			if (!raceData || !attrData) return;
			setAttr( charCS, fields.Race, creature );
		}
		
		if (isCreature) {
			
			if (!creature || !creature.trim().length) return;

			let hd = attrData.hd.match(/(\(.+?\)|\d+)(?:d\d+)?([-+]\d+(?:d\d+)?(?:[-+]\d+)?)?(?:r(\d+))?/i) || ['','1','0',''];
			let hpExtra = (hd[2] || '0').match(/([-+]\d+)(?:d(\d+))?([-+]\d+)?/);
			let age = (attrData.age.split(':') || ['','']);
			setAttr( charCS, fields.Monster_int, evalAttr(attrData.intel) );
			setAttr( charCS, fields.Age, age[0] );
			setAttr( charCS, fields.AgeVal, (_.isUndefined(age[1]) ? age[0] : evalAttr(age[1]) ));
			setAttr( charCS, fields.MonsterAC, evalAttr(parseStr(attrData.cac || '10')) );
			setAttr( charCS, fields.Monster_mov, attrData.mov+(attrData.fly ? ', FL'+attrData.fly : '')+(attrData.swim ? ', SW'+attrData.swim : '') );
			setAttr( charCS, fields.MonsterThac0, evalAttr(attrData.thac0) );
			setAttr( charCS, fields.Thac0_base, evalAttr(attrData.thac0) );
			setAttr( charCS, fields.Monster_size, attrData.size );
			setAttr( charCS, fields.Strength_hit, evalAttr(attrData.tohit) );
			setAttr( charCS, fields.Strength_dmg, evalAttr(attrData.dmg) );
			setAttr( charCS, fields.Dex_acBonus, evalAttr(attrData.dexdef) );
			setAttr( charCS, fields.MonsterCritHit, evalAttr(attrData.crith) );
			setAttr( charCS, fields.MonsterCritMiss, evalAttr(attrData.critm) );
			setAttr( charCS, fields.Monster_dmg1, parseStr(attrData.attk1.replace(/:/g,',')) );
			setAttr( charCS, fields.Monster_dmg2, parseStr(attrData.attk2.replace(/:/g,',')) );
			setAttr( charCS, fields.Monster_dmg3, parseStr(attrData.attk3.replace(/:/g,',')) );
			setAttr( charCS, fields.Monster_attks, (((attrData.attk1 && attrData.attk1.length) ? 1 : 0) + ((attrData.attk2 && attrData.attk2.length) ? 1 : 0) + ((attrData.attk3 && attrData.attk3.length) ? 1 : 0)) );
			setAttr( charCS, fields.Monster_mr, evalAttr(attrData.mr) );
			setAttr( charCS, fields.Attk_specials, parseStr(attrData.attkmsg) );
			setAttr( charCS, fields.Dmg_specials, parseStr(attrData.dmgmsg) );
			setAttr( charCS, fields.Monster_speed, evalAttr(attrData.speed) );
			setAttr( charCS, fields.SpellSpeedOR, evalAttr(attrData.spellspeed) );
			setAttr( charCS, fields.Regenerate, evalAttr(attrData.regen) );
			setAttr( charCS, fields.Monster_spAttk, parseStr(raceData.spattk) || 'Nil' );
			setAttr( charCS, fields.Monster_spDef, parseStr(raceData.spdef) || 'Nil' );
			if (!attrData.hp && hd && hd.length) {
				hd[2] = ((hpExtra && hpExtra.length >= 2 && parseInt(hpExtra[2])) ? (rollDice( hpExtra[1], hpExtra[2], 0 ) + parseInt(hpExtra[3] || 0)) : parseInt(hd[2] || 0));
				attrData.hp = rollDice( evalAttr(hd[1]), 8, hd[3] ) + hd[2];
			}
			setAttr( charCS, fields.Monster_hitDice, (evalAttr(hd[1]||'1')) );
			setAttr( charCS, fields.Monster_hpExtra, (hd[2]||'0') );
			setAttr( charCS, fields.Monster_hdReroll, (hd[3]||'') );
			if (attrData.hp) {
				setAttr( charCS, fields.HP, attrData.hp );
				setAttr( charCS, fields.MaxHP, attrData.hp );
			}
			setAttr( charCS, fields.Fighter_level, '' );
			setAttr( charCS, fields.Wizard_level, '' );
			setAttr( charCS, fields.Priest_level, '' );
			setAttr( charCS, fields.Rogue_level, '' );
			setAttr( charCS, fields.Psion_level, '' );
			if (attrData.lv) {
				let classData = (attrData.cl || 'F:Warrior').split('/').map( c => c.split(':') );
				let levels = attrData.lv.split('/');
				let classField, levelField;
				_.each( classData, (c,k) => {
					switch (c[0].toUpperCase()) {
					case 'MU':
						classField = fields.Wizard_class;
						levelField = fields.Wizard_level;
						handleSetAbility( ['',BT.AB_SILENT,'Cast Spell',std.cast_spell.api,std.cast_spell.action,'2.Cast Spell','replace'], [token] );
						handleSetAbility( ['',BT.AB_SILENT,'Spells menu',std.spells_menu.api,std.spells_menu.action,'3.Spells Menu','replace'], [token] );
						break;
					case 'PR':
						classField = fields.Priest_class;
						levelField = fields.Priest_level;
						handleSetAbility( ['',BT.AB_SILENT,'Cast Spell',std.cast_spell.api,std.cast_spell.action,'2.Cast Spell','replace'], [token] );
						handleSetAbility( ['',BT.AB_SILENT,'Spells menu',std.spells_menu.api,std.spells_menu.action,'3.Spells Menu','replace'], [token] ); 
						break;
					case 'RO':
						classField = fields.Rogue_class;
						levelField = fields.Rogue_level;
						break;
					case 'PS':
						classField = fields.Psion_class;
						levelField = fields.Psion_level;
						break;
					default:
						classField = fields.Fighter_class;
						levelField = fields.Fighter_level;
						break;
					}
					setAttr( charCS, classField, c[1] || '');
					setAttr( charCS, levelField, evalAttr(levels[k]));
				});
				handleAddAllPRspells( ['',BT.ALL_PRSPELLS,0], [token], senderId );
			}
			setAttr( charCS, fields.Race, raceData.name );
			setAttr( charCS, fields.Gender, 'Creature' );
			tokenObj.set('isdrawing',false);
			handleSetAbility( ['',BT.AB_SILENT,'Init menu',std.init_menu.api,std.init_menu.action,'1.Initiative','replace'], [token] );
			handleSetAbility( ['',BT.AB_SILENT,'Attack',std.attk_hit.api,std.attk_hit.action,'2.Attack','replace'], [token] );
			handleSetAbility( ['',BT.AB_SILENT,'Attk menu',std.attk_menu.api,std.attk_menu.action,'3.Attk Menu','replace'], [token] );
			handleSetAbility( ['',BT.AB_SILENT,'Other Actions',std.other_actions.api,std.other_actions.action,'4.Other actions','replace'], [token] );
			handleSetAbility( ['',BT.AB_SILENT,'Specials',std.specials.api,std.specials.action,'5.Specials','replace'], [token] );
			
			creatureWeapDefs( charCS );
			
			charCS.set('controlledby','');

		} else {

			_.each( findObjs({_characterid:charCS.id, _type:'ability'}), ab => {
				ab.set('istokenaction',((ab.get('action').match(reAction) || [0,0])[1] == 1));
			});
			if (creature && creature.trim().length) {
				setAttr( charCS, fields.Container, creature);
				setAttr( charCS, fields.ItemContainerSize, raceData.slots );
				setAttr( charCS, fields.ItemContainerType, (raceData.trap ? 4 : 1));
				if (!isReset) {
					setAttr( charCS, fields.Old_trap, attrLookup( charCS, fields.Container_trap ));
					setAttr( charCS, fields.Old_lock, attrLookup( charCS, fields.Container_lock ));
					setAttr( charCS, fields.Container_lock, raceData.lock );
					setAttr( charCS, fields.Container_trap, raceData.trap );
				}
				setAttr( charCS, fields.Lock_imgs, 0 );
				setAttr( charCS, fields.Trap_imgs, 0 );
//				log('setCreatureAttrs: AC = '+attrData.cac+', hp = '+attrData.hp);
				setAttr( charCS, fields.MonsterAC, calcAttr(parseStr(attrData.cac || '10')) );
				if (attrData.hp) {
					setAttr( charCS, fields.HP, attrData.hp );
					setAttr( charCS, fields.MaxHP, attrData.hp );
				}
				setImgs(tokenObj,charCS,raceData,true);
			}
			setAttr( charCS, fields.Gender, 'Container' );
			setAttr( charCS, fields.Trap_tokenID, token._id );
			setAttr( charCS, fields.Trap_version, 0 );
			setAttr( charCS, fields.Lock_status, 'Locked' );
			setAttr( charCS, fields.Trap_status, 'Armed' );
			
			charCS.set('controlledby','all');

			tokenObj.set('isdrawing',true);
		}
		if (creature && creature.trim().length || isReset) {
			addPowersAndItems( charCS, token, isCreature, senderId );
			if (!isCreature) makeChangeImagesMenu( [tokenObj.id], senderId );
		}
		return;
	}
					  
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/*
	 * Display a menu to add spells and powers to the spellbooks of a character
	 */
	 
	async function makeSpellsMenu( args, selected, senderId, msg ) {
		
		try {
			var cmd = args[0].toUpperCase(),
				level = parseInt(args[1]) || 1,
				spellName = args[2],
				tokenID = selected ? selected[0]._id : undefined,
				charCS = tokenID ? getCharacter(tokenID) : undefined,
				isMU = cmd.includes('MU'),
				isPR = cmd.includes('PR'),
				isPower = cmd.includes('POWER'),
				spell = (spellName || '').hyphened(),
				curSpells = '',
				pwrPrefix = '',
				word = 'spell',
				nextLevel, rootDB, listAttr, listType, spellObj, cmdStr, desc, content;
				
			if (isPower) {
				desc = 'Powers';
				word = 'power';
				cmd = 'POWERS';
				rootDB = fields.PowersDB;
				listAttr = fields.PowersSpellbook;
				listType = 'power';
			} else if (isMU) {
				desc = 'Level '+level+' MU spell book';
				cmd = 'MUSPELLS';
				rootDB = fields.MU_SpellsDB;
				listAttr = [fields.MUSpellbook[0]+spellLevels.mu[level].book,fields.MUSpellbook[1]];
				listType = 'muspelll'+level;
				if (spell) {
					spellObj = abilityLookup( fields.PR_SpellsDB, spell, null, true );
					pwrPrefix = !spellObj.obj ? '' : 'MU-';
				}
			} else {
				desc = 'Level '+level+' PR spell book';
				cmd = 'PRSPELLS';
				rootDB = fields.PR_SpellsDB;
				listAttr = [fields.PRSpellbook[0]+spellLevels.pr[level].book,fields.PRSpellbook[1]];
				listType = 'prspelll'+level;
				if (spell) {
					spellObj = abilityLookup( fields.MU_SpellsDB, spell, null, true );
					pwrPrefix = !spellObj.obj ? '' : 'PR-';
				}
			}
			args[0] = cmd;
			cmdStr = args.join('|');

			if (charCS) {
				setAttr( charCS, fields.Casting_name, charCS.get('name'));
				setAttr( charCS, fields.CastingLevel, characterLevel( charCS ));
				curSpells = (attrLookup( charCS, listAttr ) || '').replace(/\|/g,', ');
			}
			
			let spellList = getMagicList( rootDB, spTypeLists, listType, senderId );
				
			content = '&{template:'+fields.defaultTemplate+'}{{name=Grant Spells}}{{ ='+(msg||'')+'}}{{'+desc+'='+curSpells+'}}'
					+ '{{desc=1. [Choose](!cmd --button CHOOSE_'+cmd+'|'+level+'|&#63;{Choose which spell|'+spellList+'}) a '+word+'\n';
					
			if (spell) {
				spellObj = getAbility( rootDB, spell, charCS );
				content += '...Optionally [Review '+spellName+'](!cmd --button REV_'+cmdStr
						+  '&#13;&#47;w gm &#37;{' + spellObj.dB + '|'+spell.hyphened()+'})';
			} else {
				content += '...Optionally <span style='+design.grey_button+'>Review the chosen '+word+'</span>';
			}
			
			if (isPR && (apiCommands.attk || apiCommands.magic)) {
				content += ' or [Add all valid Priest spells](!cmd --button '+BT.ALL_PRSPELLS+'|'+level+')';
			}
			
			if (isPower && (apiCommands.attk || apiCommands.magic)) {
				content += ' or [Add all Class/Race powers](!cmd --button '+BT.ALL_POWERS+')';
			}
			
			content += '}}{{desc1=2. '+(spell ? '[' : '<span style=' + design.grey_button + '>')+'Add '+(spell ? spellName+'](!cmd --button ADD_'+cmdStr+')' : 'the '+word+'</span>' )
					+  ' to '+(isPower ? 'Powers' : ('level '+level+(isMU ? ' MU' : ' PR')+' spellbook'))
			+  (isPower ? '}}' : '<br>or '+(spell ? '[' : '<span style=' + design.grey_button + '>')+'Add '+(spell ? spellName+'](!cmd --button ADD_POWERS|1|'+pwrPrefix+spell+')' : 'the spell</span>' ) + ' as a Power }}')
					+  '{{desc2=3. Choose and Add more spells or ';
			
			if (isPower) {
				content += 'go to [Wizard](!cmd --add-spells MUSPELLS|1|) or [Priest](!cmd --add-spells PRSPELLS|1|) spells';
			} else if (isMU) {
				content += 'go to [Level '+(level < 9 ? level+1 : 1)+'](!cmd --add-spells MUSPELLS|'+(level < 9 ? level+1 : 1)+'|), [Priest](!cmd --add-spells PRSPELLS|1|) or [Power](!cmd --add-spells POWERS|1|) spells';
			} else {
				content += 'go to [Level '+(level < 7 ? level+1 : 1)+'](!cmd --add-spells PRSPELLS|'+(level < 7 ? level+1 : 1)+'|), [Wizard](!cmd --add-spells MUSPELLS|1|) or [Power](!cmd --add-spells POWERS|1|) spells';
			}
			content += '\n[Return to Main Menu](!cmd --abilities) or just do something else}}';
			sendFeedback(content,flags.feedbackName,flags.feedbackImg);
			return;
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Create a menu to allow the DM to set Character weapon proficiencies
	 */
	 
	async function makeProficienciesMenu( args, selected, senderId, msg ) {
		
		try {
			var tokenID, charCS;
			
			if (selected && selected.length) {
				tokenID = selected[0]._id,
				charCS = getCharacter( tokenID );
			}
			
			if (!charCS) return;
			
			var	weapon = args[1] || '',
				meleeWeapon = args[2] || false,
				weapType = args[3] || '',
				style = (weapType || '').toLowerCase().includes('style'),
				masterRange = apiCommands['attk'].exists ? state.attackMaster.weapRules.masterRange : true,
				buttons, weapObj,
				weapons = getMagicList( fields.WeaponDB, miTypeLists, 'weapon', senderId ),
				styles = getMagicList( fields.StylesDB, miTypeLists, 'style', senderId ),
				content = '&{template:' + fields.defaultTemplate + '}{{name=Grant Weapon Proficiencies}}{{ ='+(msg||'')+'}}'
						+ '{{  =['+((weapon && !style) ? weapon : 'Choose Weapon')+'](!cmd --button CHOOSE_PROF|&#63;{Choose which Weapon?|'+weapons+'})'
						+ 'or ['+((weapon && style) ? weapon+' Style' : 'Choose Style')+'](!cmd --button CHOOSE_PROF|&#63;{Choose which Style?|'+styles+'})'
						+ 'or make [All Owned Weapons](!cmd --set-all-prof PROFICIENT) proficient\n'
						+ 'and optionally ';
						
			if (weapon) {
				let weapObj = getAbility( (style ? fields.StylesDB : fields.WeaponDB), weapon, charCS, true );
				content += '[Review '+weapon+'](!cmd --button '+(style?'REVIEW_STYLE':'REVIEW_PROF')+'|'+weapon
						+  '&#13;&#47;w gm &#37;{' + weapObj.dB + '|'+(weapon.hyphened())+'})}}'
						+  '{{desc=Level of '+weapon+' Proficiency\n'
						+  '[Not Proficient](!cmd --set-prof NOT-PROF|'+weapon+'|'+weapType+')'
						+  '[Proficient](!cmd --set-prof PROFICIENT|'+weapon+'|'+weapType+')'
						+  '[Specialist](!cmd --set-prof SPECIALIST|'+weapon+'|'+weapType+')';
				if (masterRange || meleeWeapon) content += '[Mastery](!cmd --set-prof MASTERY|'+weapon+'|'+weapType+')';
				else content += '<span style=' + design.grey_button + '>Mastery</span>';
			} else {
				content += '<span style=' + design.grey_button + '>Review Weapon</span>}}'
						+  '{{desc=Level of Proficiency\n'
						+  '<span style=' + design.grey_button + '>Not Proficient</span>'
						+  '<span style=' + design.grey_button + '>Proficient</span>'
						+  '<span style=' + design.grey_button + '>Specialist</span>'
						+  '<span style=' + design.grey_button + '>Mastery</span>'
			}
			buttons = getProfButtons( selected );
			content += '}}{{desc1=Weapon Proficiencies\n'
					+  buttons.profs + '\n'
					+  'Related Weapon Types\n'
					+  buttons.types + '}}'
					+ '{{desc2=[Return to Token Menu](!cmd --abilities) or just do something else}}';
			sendFeedback(content,flags.feedbackName,flags.feedbackImg);
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Make a menu to display current class(es) of the selected tokens, check 
	 * if they are classes defined in the Class database, and allow new classes
	 * to be selected.
	 */
	 
	async function makeClassMenu( args, selected, senderId, isGM, msg='' ) {
		
		try {
			var chosen = (args[1] || '').split('%%').shift(),
				base = args[2] || 'Warrior',
				fighter_class='Warrior', fighter_level=0, fighter_default='',
				wizard_class='Wizard', wizard_level=0, wizard_default='',
				priest_class='Priest', priest_level=0, priest_default='',
				rogue_class='Rogue', rogue_level=0, rogue_default='',
				psion_class='Psionicist', psion_level=0, psion_default='',
				race='Human',
				tokenID, charCS;

			if (selected && selected.length) {
				tokenID = selected[0]._id,
				charCS = getCharacter( tokenID );
			}
			
			if (charCS) {
				fighter_class = attrLookup( charCS, fields.Fighter_class ) || fighter_class;
				fighter_level = parseInt(attrLookup( charCS, fields.Fighter_level )) || fighter_level;
				wizard_class = attrLookup( charCS, fields.Wizard_class ) || wizard_class;
				wizard_level = parseInt(attrLookup( charCS, fields.Wizard_level )) || wizard_level;
				priest_class = attrLookup( charCS, fields.Priest_class ) || priest_class;
				priest_level = parseInt(attrLookup( charCS, fields.Priest_level )) || priest_level;
				rogue_class = attrLookup( charCS, fields.Rogue_class ) || rogue_class;
				rogue_level = parseInt(attrLookup( charCS, fields.Rogue_level )) || rogue_level;
				psion_class = attrLookup( charCS, fields.Psion_class ) || psion_class;
				psion_level = parseInt(attrLookup( charCS, fields.Psion_level )) || psion_level;
				race = attrLookup( charCS, fields.Race ) || race;
			}
			
			switch (args[0].toUpperCase()) {
			case BT.CLASS_F:
				fighter_class = args[1];
				break;
			case BT.CLASS_W:
				wizard_class = args[1];
				break;
			case BT.CLASS_P:
				priest_class = args[1];
				break;
			case BT.CLASS_R:
				rogue_class = args[1];
				break;
			case BT.CLASS_PSI:
				psion_class = args[1];
				break;
			default:
				break;
			};
			
			var	fighter_classes = getMagicList( fields.ClassDB, clTypeLists, 'warrior', senderId, 'Warrior|Fighter|Paladin|Ranger', true, 'Specify class' ),
				fighter_def = abilityLookup( fields.ClassDB, fighter_class, charCS, true ),
				wizard_classes = getMagicList( fields.ClassDB, clTypeLists, 'wizard', senderId, 'Wizard|Mage|Abjurer|Conjurer|Diviner|Enchanter|Illusionist|Invoker|Necromancer|Transmuter', true, 'Specify class' ),
				wizard_def = abilityLookup( fields.ClassDB, wizard_class, charCS, true ),
				priest_classes = getMagicList( fields.ClassDB, clTypeLists, 'priest', senderId, 'Priest|Cleric|Druid', true, 'Specify class' ),
				priest_def = abilityLookup( fields.ClassDB, priest_class, charCS, true ),
				rogue_classes = getMagicList( fields.ClassDB, clTypeLists, 'rogue', senderId, 'Rogue|Thief|Bard|Assassin', true, 'Specify class' ),
				rogue_def = abilityLookup( fields.ClassDB, rogue_class, charCS, true ),
				psion_classes = getMagicList( fields.ClassDB, clTypeLists, 'psion', senderId, 'Psionicist|Psion', true, 'Specify class' ),
				psion_def = abilityLookup( fields.ClassDB, psion_class, charCS, true ),
				races = getMagicList( fields.RaceDB, clTypeLists, 'humanoid', senderId, 'Human|Dwarf|Elf|Gnome|Half-Elf|Halfling|Half-Orc', false, 'Specify race' ),
				creatures = getMagicList( fields.RaceDB, clTypeLists, 'creature', senderId, '-', true, 'Specify creature', true ),
				containers = getMagicList( fields.RaceDB, clTypeLists, 'container', senderId, '-' );
	//			race_def = abilityLookup( fields.RaceDB, race, charCS, true );
				
			if (!fighter_level) {
				fighter_class = '<span style='+design.dark_button+'>'+fighter_class+'</span>';
			} else if (!fighter_def.obj) {
				fighter_default = 'Will use Warrior class defaults';
			}
			if (!wizard_level) {
				wizard_class = '<span style='+design.dark_button+'>'+wizard_class+'</span>';
			} else if (!wizard_def.obj) {
				wizard_default = 'Will use Wizard class defaults';
			}
			if (!priest_level) {
				priest_class = '<span style='+design.dark_button+'>'+priest_class+'</span>';
			} else if (!priest_def.obj) {
				priest_default = 'Will use Priest class defaults';
			}
			if (!rogue_level) {
				rogue_class = '<span style='+design.dark_button+'>'+rogue_class+'</span>';
			} else if (!rogue_def.obj) {
				rogue_default = 'Will use Rogue class defaults';
			}
			if (!psion_level) {
				psion_class = '<span style='+design.dark_button+'>'+psion_class+'</span>';
			} else if (!psion_def.obj) {
				psion_default = 'Will use Psionicist class defaults';
			}
			if (!chosen || !chosen.length) {
				chosen = race;
				base = 'Human';
			}
			if (races.includes(chosen)) {
				base = 'Human';
			}
			
			let content = '&{template:'+fields.defaultTemplate+'}{{name=Review & Set\nRace and Classes}}'
						+ (msg ? ('='+msg) : '')
						+ '{{desc=Drop down lists show Races, Creatures, Containers and Classes defined in the Databases.  If not shown in a list, choose "Other" and it can be typed in at the next prompt.  Any class *can* be in any class field (even if not in the list for that field), especially to support multi-class characters.  Classes not found in the Class database will get the defaults for the field: Unrecognised Classes in the *Wizard* or *Priest* lines default to Wizard or Priest spellcasting rules.}}'
						+ '{{desc1=Currently a'+('aeiouAEIOU'.includes(race[0])?'n':'')+' **'+race+'**\nChange to\n'
						+ '<table><tr><td>[Race](!cmd --button '+BT.RACE+'|&#63;{Which Race?|'+races+'})</td>'+(isGM ? ('<td>[Creature](!cmd --button '+BT.CREATURE+'|&#63;{Which Creature?|'+creatures+'})</td><td>[Container](!cmd --button '+BT.CONTAINER+'|&#63;{Which Container?|'+containers+'})</td></tr></table>') : '')+'}}'
						+ '{{desc2=<table>'
						+ '<tr><td>['+fighter_class+'](!cmd --button '+BT.CLASS_F+'|&#63;{Which Warrior Class?|'+fighter_classes+'})</td><td>[Level '+fighter_level+'](!cmd --button '+BT.LEVEL_F+'|&#63;{Which Warrior Level?|'+fighter_level+'})</td><td>'+fighter_default+'</td></tr>'
						+ '<tr><td>['+wizard_class+'](!cmd --button '+BT.CLASS_W+'|&#63;{Which Wizard Class?|'+wizard_classes+'})</td><td>[Level '+wizard_level+'](!cmd --button '+BT.LEVEL_W+'|&#63;{Which Wizard Level?|'+wizard_level+'})</td><td>'+wizard_default+'</td></tr>'
						+ '<tr><td>['+priest_class+'](!cmd --button '+BT.CLASS_P+'|&#63;{Which Priest Class?|'+priest_classes+'})</td><td>[Level '+priest_level+'](!cmd --button '+BT.LEVEL_P+'|&#63;{Which Priest Level?|'+priest_level+'})</td><td>'+priest_default+'</td></tr>'
						+ '<tr><td>['+rogue_class+'](!cmd --button '+BT.CLASS_R+'|&#63;{Which Rogue Class?|'+rogue_classes+'})</td><td>[Level '+rogue_level+'](!cmd --button '+BT.LEVEL_R+'|&#63;{Which Rogue Level?|'+rogue_level+'})</td><td>'+rogue_default+'</td></tr>'
						+ '<tr><td>['+psion_class+'](!cmd --button '+BT.CLASS_PSI+'|&#63;{Which Psion Class?|'+psion_classes+'})</td><td>[Level '+psion_level+'](!cmd --button '+BT.LEVEL_PSI+'|&#63;{Which Psion Level?|'+psion_level+'})</td><td>'+psion_default+'</td></tr>'
						+ (chosen && chosen.length ? ('<tr><td colspan="3">Optionally, review ['+chosen+'](!cmd --button '+(base != 'Human' ? BT.REVIEW_CLASS : BT.REVIEW_RACE)+'|'+chosen+'|'+base+'|true)</td></tr>') : '')
						+ '</table>}}'
						+ (isGM ? '{{desc3=[Return to Token Menu](!cmd --abilities) or just do something else}}' : '');
			
			if (isGM) {
				sendFeedback( content,flags.feedbackName,flags.feedbackImg );
			} else {
				sendResponse( charCS, content, null, flags.feedbackName, flags.feedbackImg, tokenID );
			}
			return;
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Handle a request to review a class definition
	 */
	 
	var makeClassReviewDialogue = function( args, selected, isGM ) {
		
		var chosen = args[1] || '',
			base = args[2] || '',
			classMenu = (args[3] || '') == 'true',
			isClass = base.toLowerCase() != 'human',
			tokenID, charCS,
			content = '';
		
		if (selected && selected.length) {
			tokenID = selected[0]._id,
			charCS = getCharacter( tokenID );
		}

		if (!charCS || !chosen.length) return;
		
		var type = isClass ? 'Class' : 'Race',
			dB = isClass ? fields.ClassDB : fields.RaceDB,
			def = getAbility( dB, chosen, charCS );
			
		if (def.obj) {
			content = def.obj[1].body;
			if (classMenu && isGM) {
				content += '\n/w gm &{template:'+fields.defaultTemplate+'}{{name=Return to '+type+' Menu}}'
						+  '{{desc=[Return to '+type+' Menu](!cmd --button '+BT.AB_CLASSES+')}}';
			};
		} else {
			content = '&{template:'+fields.defaultTemplate+'}{{name='+chosen+'}}'
					+ '{{desc=This '+type+' has not been defined in the API '+dB+'.'
					+ ' It will gain the defaults of the "'+base+'" base class.}}'
					+ '{{desc1=Optionally [Display '+base+' '+type+' Definition](!cmd --button '+(isClass ? BT.REVIEW_CLASS : BT.REVIEW_RACE)+'|'+base+'|'+base+'|'+classMenu+')}}'
					+ (classMenu ? ('{{desc2=[Return to '+type+' Menu](!cmd --button '+BT.AB_CLASSES+')}}') : '');
		};
		if (isGM) {
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		} else {
			sendResponse( charCS, content, null, flags.feedbackName, flags.feedbackImg, tokenID );
		}
		return;
	}
	
	/*
	 * Create a menu to allow the GM to review and change the images of a 
	 * trapped / locked container, including open, closed and alternates
	 */
	 
	var makeChangeImagesMenu = function( args, senderId, msg='' ) {
		
		var tokenID = args[0],
			charCS = getCharacter(args[0]),
			name = charCS.get('name'),
			trapType = attrLookup( charCS, fields.Container_trap ),
			lockType = attrLookup( charCS, fields.Container_lock ),
			trapVars = parseInt(attrLookup( charCS, fields.Trap_vars )) || 0,
			lockVars = parseInt(attrLookup( charCS, fields.Lock_vars )) || 0,
			closedImg = attrLookup( charCS, fields.Token_closedImg ),
			openImg = attrLookup( charCS, fields.Token_openImg ),
			lockImgs = parseInt(attrLookup( charCS, fields.Lock_imgs )) || 0,
			trapImgs = parseInt(attrLookup( charCS, fields.Trap_imgs )) || 0;
			
		var splitVariable = function( remVar ) {
			let splitVar = [];
			remVar = String(remVar);
			while (remVar && remVar.length > 29) {
				splitVar.push(remVar.substring(0,30));
				remVar = remVar.substring(30);
			}
			splitVar.push(remVar);
			return splitVar.join(' ');
		};
		
		var getVars = function( charCS, varCount, prefix ) {
			var varText = '';
			for (let i = 1; i <= varCount; i++) {
				let vObj = attrLookup(charCS, [prefix+i,null]);
				if (!vObj) continue;
				let v = vObj.get('max'), c = vObj.get('current');
				varText += '<tr><td style="text-align:left">['+v+'](!cmd --button '+BT.TOKEN_IMG+'|'+tokenID+'|'+prefix+i+'|?{Enter '+v+'})</td><td style="text-align:left"><b>'+splitVariable(c.trim())+'</b></td></tr>';
			}
			return varText;
		};

		var createImgTable = function( charCS, tokenID ) {

			var getImgs = function( charCS, tokenID, imgCount, cmd, prefix ) {
				let buttons = [];
				for (let i = 1; i <= imgCount; i++) {
					let imgObj = attrLookup(charCS,[prefix+i,null]);
					let sizeObj = attrLookup(charCS,[prefix+i+'-size',null]);
					let height = Math.floor(70 * (sizeObj ? ((parseInt(sizeObj.get('max')) || 70) / (parseInt(sizeObj.get('current')) || 70)) : 1));
					imgObj && imgObj.get('current').trim().length ? imgObj : undefined;
					buttons.push([(imgObj?('['+imgObj.get('max')+'](!cmd --button '+cmd+'|'+tokenID+'|'+prefix+i+')'):' '),(imgObj?('<img src="'+imgObj.get('current')+'" alt="'+imgObj.get('max')+'" width="70" height="'+height+'">') : '')]);
				};
				return buttons;
			};
			
			let imgRows = getImgs( charCS, tokenID, attrLookup( charCS, fields.Lock_imgs ), BT.TOKEN_IMG, fields.Lock_imgPrefix[0] );
				imgRows = imgRows.concat( getImgs( charCS, tokenID, attrLookup( charCS, fields.Trap_imgs ), BT.TOKEN_IMG, fields.Trap_imgPrefix[0] ) );
				
			let tableTxt = '<table>';
			for (let r = 0; r <= (imgRows.length-1); r+=3) {
				tableTxt += '<tr><td>'+(imgRows[r+1]?(imgRows[r+1][0]):' ')+'</td><td>'+(imgRows[r]?(imgRows[r][0]):' ')+'</td><td>'+(imgRows[r+2]?(imgRows[r+2][0]):' ')+'</td></tr>'
						 +  '<tr><td>'+(imgRows[r+1]?(imgRows[r+1][1]):' ')+'</td><td>'+(imgRows[r]?(imgRows[r][1]):' ')+'</td><td>'+(imgRows[r+2]?(imgRows[r+2][1]):' ')+'</td></tr>';
			};
			return tableTxt + '</table>';
		};
		
		if (!trapType) setAttr( charCS, fields.Container_trap, (trapType = 'No-Trap'));
		if (!lockType) setAttr( charCS, fields.Container_lock, (lockType = 'No-Lock'));
				
		var content = '&{template:RPGMdefault}{{name='+name+'\'s Images}}'+(msg ? ('{{Section='+msg+'}}') : '')
					+ '{{subtitle=Change Images}}{{Use=Selecting a button below will change that stored image to be the same as the currently selected token image}}'
					+ '{{Section1=<table><tr><td>[Closed container](!cmd --button '+BT.TOKEN_IMG+'|'+tokenID+'|'+fields.Token_closedImg[0]+')</td><td>[Open container](!cmd --button '+BT.TOKEN_IMG+'|'+tokenID+'|'+fields.Token_openImg[0]+')</td></tr>'
					+ '<tr><td>'+(closedImg ? ('<img src="'+closedImg+'" alt="Closed container">') : '')+'</td>'
					+ '<td>'+(openImg ? ('<img src="'+openImg+'" alt="Open container">') : '')+'</td></tr></table>}}';
					
		if ((lockImgs + trapImgs) > 0) {
			content	+= '{{Section2=**Alternate Images**<br>For use in locked &/or trapped container ability macros where the container wants to look different than open or closed.<br>';
			content += createImgTable(charCS, tokenID );
			content += '}}';
		};
		
		content += '{{Section3=**Trap and Lock Types**<br>Use these buttons to change the trap type and the lock type of the container<br>'
				+  '<table><tr><td>Lock is ['+lockType+'](!cmd --button '+BT.LOCKTYPE+'|'+tokenID+'|?{Choose a lock type (or n0 lock&#41;|'+getMagicList(fields.AbilitiesDB,miTypeLists,'lock',senderId,'None')+'})</td>'
				+  '<td>Trap is ['+trapType+'](!cmd --button '+BT.TRAPTYPE+'|'+tokenID+'|?{Choose a trap type (or no trap&#41;|'+getMagicList(fields.AbilitiesDB,miTypeLists,'trap',senderId,'None')+'})</td></tr></table>}}';
				
		if (trapVars && trapVars != 0) {
			content += '{{Section4=**Trap Variables**<br>For use in macros determining the action needed to open a trapped container. See the description of each container for details of how these should be set.<br>'
					+ '<table style="text-align:left">'+getVars( charCS, trapVars, fields.Trap_varPrefix[0] )+'</table>}}';
		}
		if (lockVars && lockVars != 0) {
			content += '{{Section5=**Lock Variables**<br>For use in macros determining the action needed to open a locked container. See the description of each container for details of how these should be set.<br>'
					+ '<table style="text-align:left">'+getVars( charCS, lockVars, fields.Lock_varPrefix[0] )+'</table>}}';
		}
		content += '{{Section6=[Reset Container to Defaults](!cmd --button '+BT.RESET_CONTAINER+'|'+attrLookup( charCS, fields.Container )+'||'+tokenID+')}}';
		sendFeedback(content);
		return;
	}
		
	/*
	 * Create a menu to allow the user to assign abilities to character sheets 
	 * from the commands registered with CommandMaster.  Two types of menu are 
	 * available: (1) a simple menu using commands registered by REDmaster series 
	 * API scripts; (2) a more complex menu allowing Ability macros to be set 
	 * using commands registered by any API script.
	 */
	 
	var makeAbilitiesMenu = function( args, selected ) {
		
		var menuType = args[0] || BT.AB_SIMPLE,
			regs = registeredAPI,
			cmds,
			content,
			selButton = '<span style=' + design.selected_button + '>',
			pc,
			dm,
			players = findObjs({type: 'player'}).map(p => (p.get('_displayname') + ',' + p.id)),
			charIDs = [],
			buttonType = function( buttonName, buttonCmd, api, action, question, defaultAns ) {
				let abilityObjs = findAbilities( api, action, selected );
				abilities[buttonName] = abilities[buttonName] || (abilityObjs && abilityObjs.length);
				let	buttonText = (abilities[buttonName] ? selButton : '[')
							   + buttonName
							   + (abilities[buttonName] ? '</span>' : '](!cmd --button '+buttonCmd+'|'+menuType+'|'+buttonName+'|'+api+'|'+action+'|&#63;{'+question+'&#124;'+defaultAns+'})');
				return buttonText;
			};
			
		if (!selected || !selected.length) {
			pc = dm = true;
		} else {
			let tokens = selected.map( s => getObj('graphic',s._id) );
			pc = _.some( tokens, t => (!!t.get('showplayers_name') || (!!t.get('represents') && !!getObj('character',t.get('represents')).get('controlledby').trim().length)));
			dm = _.some( tokens, t => (!t.get('showplayers_name') || (!t.get('represents') || !getObj('character',t.get('represents')).get('controlledby').trim().length)));
		}
			
		content = '&{template:'+fields.defaultTemplate+'}{{name=Assign Abilities}}'
				+ '{{desc=Click a button to add an Ability Action Button to the character sheets of the selected tokens.  More than one token can be selected at the same time.}}'
				+ '{{desc1=<table><tr><td style="width:100px;">Ability</td><td>Description</td></tr>';
				
		switch (menuType.toUpperCase()) {
			
		case BT.AB_SIMPLE:
			
			content +=(regs[std.init_menu.api] ? '<tr><td>'+buttonType('Init menu',BT.ABILITY,std.init_menu.api,std.init_menu.action,'Ability name?','1.Initiative')+'</td><td>Initiative Menu, for all classes</td></tr>' : '')
					+ (regs[std.attk_hit.api] ? '<tr><td>'+buttonType('Attack',BT.ABILITY,std.attk_hit.api,std.attk_hit.action,'Ability name?','2.Attack')+'</td><td>Attack ability (Roll20 rolls dice), for all monsters & classes with weapons</td></tr>' : '')
					+ (regs[std.attk_menu.api] ? '<tr><td>'+buttonType('Attack menu',BT.ABILITY,std.attk_menu.api,std.attk_menu.action,'Ability name?','3.Attk menu')+'</td><td>Attack menu for all monsters & classes with weapons</td></tr>' : '')
					+ (regs[std.cast_spell.api] ? '<tr><td>'+buttonType('Cast Spell',BT.ABILITY,std.cast_spell.api,std.cast_spell.action,'Ability name?','2.Cast Spell')+'</td><td>Ability to cast either a Wizard or Priest spell</td></tr>' : '')
					+ (regs[std.spells_menu.api] ? '<tr><td>'+buttonType('Spells menu',BT.ABILITY,std.spells_menu.api,std.spells_menu.action,'Ability name?','3.Spells menu')+'</td><td>Spells menu (both Wizard & Priest)</td></tr>' : '')
					+ (regs[std.use_power.api] ? '<tr><td>'+buttonType('Use Power',BT.ABILITY,std.use_power.api,std.use_power.action,'Ability name?','2.Use Power')+'</td><td>Ability to use Powers</td></tr>' : '')
					+ (regs[std.powers_menu.api] ? '<tr><td>'+buttonType('Powers menu',BT.ABILITY,std.powers_menu.api,std.powers_menu.action,'Ability name?','3.Powers menu')+'</td><td>Powers menu, for all classes</td></tr>' : '')
					+ (regs[std.use_mi.api] ? '<tr><td>'+buttonType('Use MI',BT.ABILITY,std.use_mi.api,std.use_mi.action,'Ability name?','2.Use MI')+'</td><td>Ability to use a Magic Item</td></tr>' : '')
					+ (regs[std.mi_menu.api] ? '<tr><td>'+buttonType('Items menu',BT.ABILITY,std.mi_menu.api,std.mi_menu.action,'Ability name?','3.Item menu')+'</td><td>Item Menu, for all classes</td></tr>' : '')
					+ (regs[std.other_actions.api] ? '<tr><td>'+buttonType('Other Actions',BT.ABILITY,std.other_actions.api,std.other_actions.action,'Ability name?','4.Other Actions')+'</td><td>Other Actions Menu, for all classes</td></tr>' : '')
					+ (regs[std.rest.api] ? '<tr><td>'+buttonType('Rest',BT.ABILITY,std.rest.api,std.rest.action,'Ability name?','5.Rest')+'</td><td>Ability to Rest, for all classes</td></tr>' : '')
					+ (regs[std.specials.api] ? '<tr><td>'+buttonType('Specials',BT.ABILITY,std.specials.api,std.specials.action,'Ability name?','4.Specials')+'</td><td>Display special attacks & defences</td></tr>' : '')
					+ (regs[std.bar.api] ? '<tr><td>'+buttonType('Bar',BT.ABILITY,std.bar.api,std.bar.action,'Ability name?','0._________')+'</td><td>Insert a separator bar</td></tr>' : '')
					+ '</table>}}{{desc2=<div style="text-align: center;"><table width="100%"><tr><td colspan="2">[Access All Abilities](!cmd-master --button '+BT.AB_FULL+')</td></tr>';
			break;
			
		case BT.AB_FULL:
		
			_.each( registeredCmds, c => {
				content += '<tr><td>'+buttonType(c.action,BT.ABILITY,c.api,c.action,'Ability name?',c.action)+'</td><td>'+c.desc+'</td></tr>';
			});
			content	+= '</table>}}{{desc2=<div style="text-align: center;"><table width="100%"><tr><td colspan="2">[Access Simple Abilities](!cmd --button '+BT.AB_SIMPLE+')</td></tr>';
			break;
		
		default:
			sendDebug('makeAbilitiesMenu: invalid menu type given');
			sendError('Internal CommandMaster error');
			return;
		}
		
		content += '<tr><td width="50%">'+(dm ? '[Make' : (selButton + 'Is')) + ' Player-Character' + (dm ? ('](!cmd --button '+BT.AB_PC+'|'+menuType+'|0|&#63;{Whick player will control?|'+players.join('|')+'})') : '</span>')+'</td>'
				+  '<td width="50%">'+(pc ? '[Make' : (selButton + 'Is')) + ' Controlled by DM' + (pc ? ('](!cmd --button '+BT.AB_DM+'|'+menuType+'|0|)') : '</span>')+'</td></tr>'
				+  '<tr><td colspan="2">[Check Who Controls What](!cmd --check-chars)</td></tr>'
				+  '<tr><td width="50%">[Choose Race/Class](!cmd --button '+BT.AB_CLASSES+')</td><td width="50%">[Set Saving Throws](!attk --check-saves |'+menuType+'|0)</td></tr>'
				+  '<tr><td width="50%">[Add to Spellbook](!cmd --add-spells MUSPELLS)</td><td width="50%">[Add to Proficiencies](!cmd --add-profs)</td></tr>'
				+  '<tr><td width="50%">[Copy Token Image](!cmd --copy-img '+selected[0]._id+')</td><td width="50%">[Manage Token Bars](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+menuType+')</td></tr>'
				+  '<tr><td colspan="2">**Convert Character Sheet to RPGMaster**</td></tr>'
				+  '<tr><td width="50%">[Convert Items](!cmd --conv-items)</td><td width="50%">[Convert Spells](!cmd --conv-spells)</td></tr>'
				+  '</table></div>}}';
				
		sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		return;
	}
	
	/*
	 * Simple question menu asking if existing versions 
	 * of action button abilities should be replaced when 
	 * adding action abilities to tokens.
	 */
	 
	var makeAskReplace = function( args ) {
		args.shift();
		var buttonName = args[1],
			content = '&{template:'+fields.defaultTemplate+'}{{name=Replace existing '+buttonName+' Abilities?}}'
					+ '{{desc=The selected ability already exists on one or more of the selected token(s).  Replacing or Removing them is NOT recommended.'
					+ ' Selecting *Do Nothing* will still add the ability to those tokens that do not have it.   Are you sure you want to replace or remove existing abilities?}}'
					+ '{{desc1=[ Replace ]('+fields.commandMaster+' --button '+BT.AB_REPLACE+'|'+args.join('|')+'|replace)'
					+ ' or [ Remove ]('+fields.commandMaster+' --button '+BT.AB_REPLACE+'|'+args.join('|')+'|remove)'
					+ ' or [ Do Nothing ]('+fields.commandMaster+' --button '+BT.AB_REPLACE+'|'+args.join('|')+'|skip)}}';
		sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		return;
	}
	
	/*
	 * Simple question menu asking if existing versions 
	 * of abilities should be replaced when doing a global 
	 * string replace with confirmation set on.
	 */
	 
	var makeCheckReplace = function( args, charName, abilityName ) {
		var content = '&{template:'+fields.defaultTemplate+'}{{name=Replace '+charName+' '+abilityName+' Ability String?}}'
					+ '{{desc=The ability **'+abilityName+'** on character sheet **'+charName+'** has the string '+args[1]+' which will be replaced with '+args[2]+'.'
					+ '  Are you sure you want to replace this string in this ability?}}'
					+ '{{desc1=[ Yes ]('+fields.commandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|true|true)'
					+ ' or [ No ]('+fields.commandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|true|false)}}'
					+ '{{desc2=[Cancel]('+fields.commandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|false|false)'
					+ ' or Repalce [All]('+fields.commandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|false|true) the Rest'
					+ '}}';
		sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		return;
	}
	
	/*
	 * Make a menu displaying issues with names of players, characters,
	 * tokens etc that might cause the APIs to error. Offer the DM
	 * ways of fixing the issues, where possible.
	 */
	 
	async function makeCheckNamesMenu(args,silent=false) {
		
		try {
			var chosen = args[0],
				msg = args[1];

			silent = silent || (args[2] || '').toUpperCase() == 'SILENT';
				
			const errMsgs = {player:'Ask the Player to go into his settings and remove all the illegal characters from their *Display name*',
							 speakingas:'Ask the Player to change their speaking as selection - using the "As" dropdown at the bottom of the Chat window - to something without illegal characters, then change the name of the character/token that they were speaking as to something legal',
							 character:'\\lbrak;Change the character name\\rbrak;\\lpar;^^command^^\\rpar; on the Character Sheet to remove any illegal characters - it may be that any associated token will need its name changing as well',
							 token:'\\lbrak;Change the token name\\rbrak;\\lpar;^^command^^\\rpar; to remove any illegal characters - it may be that any character sheet that the token represents may need its name changing as well',
							};
			
			var listProblemNames = function( args, objType, field, errMsg ) {
				
				var replacements = [[/\"/g,'&#34;'],
									[/\$/g,'&#36;'],
									[/\%/g,'&#37;'],
									[/\'/g,'&#39;'],
									[/\(/g,'&#40;'],
									[/\)/g,'&#41;'],
									[/\?/g,'&#63;'],
									[/\@/g,'&#64;'],
									[/\[/g,'&#91;'],
									[/\\/g,'&#92;'],
									[/\]/g,'&#93;'],
									[/\{/g,'&#123;'],
									[/\|/g,'&#124;'],
									[/\}/g,'&#125;'],
								  ],
					list = findObjs({type:objType}),
					chosen = args[0],
					buttons = '';
				
				_.each( list, o => {
					let name = o.get(field);
					if (name && reInvalid.test(name)) {
						let legal = name.replace(reInvalid,''),
							selected = legal == chosen;
						_.each( replacements, r => name = name.replace(r[0],r[1]) );
						let msg = errMsg.replace('^^command^^',('\\api;cmd ~~button '+BT.CHANGE_NAME+'\\vbar;\\ques;{Set the name to \\vbar;'+legal+'}\\vbar;\\vbar;'+objType+'\\vbar;'+o.id+'\\vbar;'+field));
						buttons += (selected ? ('<span style='+design.selected_button+'>') : '[')
								+  name
								+  (selected ? ('</span>') : ('](!cmd --check-names '+legal+'|'+msg+')'));
					}
				});
				return buttons || 'None';
			}
			
			var illegalPlayers = listProblemNames(args,'player','_displayname',errMsgs.player),
				illegalChars = listProblemNames(args,'character','name',errMsgs.character),
				illegalTokens = listProblemNames(args,'graphic','name',errMsgs.token);
				
			if (silent && illegalPlayers === 'None' && illegalChars ==='None' && illegalTokens === 'None') {
				sendWait(findTheGM(),0);
				return;
			}
			var	content = '&{template:'+fields.defaultTemplate+'}{{name=Detected Possible Problems}}'
						+ '{{Section1=**Player Names**\n'+illegalPlayers+'}}'
						+ '{{Section3=**Character Names**\n'+illegalChars+'}}'
						+ '{{Section4=**Token Names**\n'+illegalTokens+'}}'
						+ '{{Section=The names above (if any) contain characters that might cause the RPGMaster APIs problems, such as \n\' " \\ { } [ ] ( ) | $ % @ ? , : ;\n'
						+ ' It is best to stick to alphanumeric characters (A-Z,a-z,0-9), space, dot, hyphen "-", plus "+" and underscore "_" for all names,'
						+ ' as others can have special meaning for Roll20.}}'
						+ (msg && msg.trim().length ? ('{{Section5=**To correct the selected name:** '+parseStr(msg)+'}}') : '{{Section5=Select any name button to correct it to your own replacement.}}')
						+ '{{Section6=**To correct all to default valid names**\n[Click Here](!cmd --correct-names)}}';
						
			sendFeedback( content );
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Make a menu of items on a legacy Character Sheet that are 
	 * not found in an RPGM database, with options to replace them 
	 * with database items
	 */
	 
	async function makeConvertItemsMenu( args, selected, senderId ) {
		
		try {
			var cmd = args[0] || '',
				toConvert = args[1] || '',
				replaceWith = (args[2] || '').replace(/\s/g,'-'),
				setQty = parseInt(args[3]),
				tokenID, charCS,
				miList = [],
				blank = true,
				msg, content, Items;
				
			var storeItem = function( Items, fromName, toName, speed, qty ) {
				let i = Items.tableFind( fields.Items_name, fromName );
				do {
					if (_.isUndefined(i)) i = Items.tableFind( fields.Items_name, '-' );
					if (_.isUndefined(i)) i = Items.addTableRow().sortKeys.length - 1;
					if (!_.isUndefined(i)) {
						let values = Items.copyValues();
						values[fields.Items_name[0]][fields.Items_name[1]] = values[fields.Items_trueName[0]][fields.Items_trueName[1]] = toName;
						values[fields.Items_speed[0]][fields.Items_speed[1]] = values[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = speed;
						values[fields.Items_qty[0]][fields.Items_qty[1]] = values[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = qty;
						Items = Items.addTableRow( i, values );
					}
					i = Items.tableFind( fields.Items_name, fromName );
				} while ((fromName !== toName) && !_.isUndefined(i));
				return Items;
			};

			_.each( selected, e => {
				tokenID = e._id;
				charCS = getCharacter(tokenID);
				if (!charCS) return;
				Items = getTable( charCS, fieldGroups.MI );
				if (isNaN(setQty)) setQty = 1;
				if (toConvert.length && replaceWith.length && cmd === BT.STORE_ITEM) {
					let r = abilityLookup( fields.MagicItemDB, replaceWith, null, true, false );
					if (r.obj) {
						Items = storeItem( Items, toConvert, replaceWith, r.obj[1].ct, setQty );
						if (toConvert !== replaceWith) {
							let specs = r.specs();
							let Profs = getTable( charCS, fieldGroups.WPROF );
							let row = Profs.tableFind( fields.WP_name, toConvert );
							while (!_.isUndefined(row)) {
								Profs = Profs.tableSet( fields.WP_name, row, replaceWith );
								Profs = Profs.tableSet( fields.WP_type, row, specs[0][4] );
								row = Profs.tableFind( fields.WP_name, toConvert );
							}
						}
					}
					msg = toConvert + ' has been replaced with ' + replaceWith;
					toConvert = replaceWith = '';
					setQty = 1;
	//				sendAPI( '!attk --check-ac '+tokenID+'|' );
					sendAPI( '!attk --check-ac '+tokenID+'|silent' );
				} else if (cmd === BT.FROMITEM) {
					msg = 'Selected to replace '+toConvert;
				} else if (cmd === BT.TOITEM) {
					msg = 'Selected to convert to '+replaceWith;
				};
			});

			if (!cmd.length) {
				_.each( selected, e => {
					tokenID = e._id;
					charCS = getCharacter(tokenID);
					if (!charCS) return;
					Items = getTable( charCS, fieldGroups.MI );
					_.each( ['MELEE','RANGED','DMG','AMMO','WEAP','MONWEAP','GEAR','STORED','DUSTS','SCROLLS','WPROF'], type => {
						let Weaps = getTable( charCS, fieldGroups[type] );
						if (_.isUndefined(Weaps)) return;
						for (let r=Weaps.table[1]; r<Weaps.sortKeys.length; r++) {
							let name = Weaps.tableLookup( fields[Weaps.fieldGroup+'name'], r );
							let def = abilityLookup( fields.MagicItemDB, name, charCS, true, false );
							let qty = (['WEAP','AMMO','GEAR','STORED','DUSTS','SCOLLS'].includes(type)) ? (Weaps.tableLookup( fields[Weaps.fieldGroup+'qty'], r ) || 1) : 1;
							if (name && name !== '-') {
								if (type !== 'WPROF') {
									Items = storeItem( Items, name, name, (def.obj ? def.obj[1].ct : 5), qty );
									if (blank) Weaps = Weaps.addTableRow(r);
								} else if (!!def.obj) {
									let specs = def.specs();
									Weaps = Weaps.tableSet( fields.WP_type, r, specs[0][4] );
								}
							}
						};
					});
				});
			};

			_.each( selected, e => {
				tokenID = e._id;
				charCS = getCharacter(tokenID);
				if (!charCS) return;
				_.each( ['MI','WPROF'], type => {
					Items = getTable( charCS, fieldGroups[type] );
					for (let r=Items.table[1]; r<Items.sortKeys.length; r++) {
						let name = Items.tableLookup( fields[Items.fieldGroup+'name'], r );
						let def = abilityLookup( fields.MagicItemDB, name, charCS, true, false );
						let qty = (type !== 'MI') ? 0 : (Items.tableLookup( fields.Items_qty, r ) || 1);
						if ((!def.obj) && name && name !== '-') {
							miList.push({name:name,qty:qty});
						}
					};
				});
			});
			miList = _.chain(miList.filter(mi => !!mi.name)).sortBy('name').uniq(true).value();

			content = '&{template:'+fields.defaultTemplate+'}{{name=Unknown Items}}';
			if (!miList.length) {
				content += '{{Section1=All equipment is fully specified and supported by the RPGMaster databases. Use *Attk Menu / Change Weapon* dialogue (or *!attk --weapon* command)'
						+  'to take weapons in-hand ready to do attacks.}}';
			} else {
				content += (msg && msg.length ? '{{Section='+msg+'}}' : '')
						+ '{{Section1=The items of equipment listed below have not been found in the RPGMaster databases. Please replace where possible with equivalent database items, so that the APIs deliver you '
						+ 'the best possible game-play experience. Select an item from the list, and a replacement using one of the item type buttons below, then convert it using the [Convert] button. Those left as '
						+ 'unknown items are not guaranteed to work properly with the APIs, and may cause interruptions to game-play. Items can be added to the databases: refer to the database help handouts.}}'
						+ '{{Section2=**Items to replace**\n';
						
				_.each( miList, i => {
					content += (i.name !== toConvert ? ('['+i.qty+' '+i.name+'](!cmd --button '+BT.FROMITEM+'|'+i.name+'|'+replaceWith+'|'+i.qty+')') : ('<span style=' + design.selected_button + '>'+i.qty+' '+i.name+'</span>'));
				});
				content += ('Add Item' !== toConvert ? ('[Add Item](!cmd --button '+BT.FROMITEM+'|Add Item|'+replaceWith+'|0})') : ('<span style=' + design.selected_button + '>Add Item</span>'));

				let weapons = getMagicList(fields.MagicItemDB,miTypeLists,'weapon',senderId),
					ammo = getMagicList(fields.MagicItemDB,miTypeLists,'ammo',senderId),
					armour = getMagicList(fields.MagicItemDB,miTypeLists,'armour',senderId),
					potions = getMagicList(fields.MagicItemDB,miTypeLists,'potion',senderId),
					scrolls = getMagicList(fields.MagicItemDB,miTypeLists,'scroll',senderId),
					rods = getMagicList(fields.MagicItemDB,miTypeLists,'rod',senderId),
					rings = getMagicList(fields.MagicItemDB,miTypeLists,'ring',senderId),
					misc = getMagicList(fields.MagicItemDB,miTypeLists,'miscellaneous',senderId);
				
				content += '}}{{Section4=**Lists of Possible Replacements**}}'
						+ '{{Section5=[Weapon](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Weapon to store|'+weapons+'}|'+setQty+')'
						+ '[Ammo](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Ammunition to store|'+ammo+'}|'+setQty+')'
						+ '[Armour](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Armour to store|'+armour+'}|'+setQty+')'
						+ '[Potions](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Potion to store|'+potions+'}|'+setQty+')'
						+ '[Scrolls & Tomes](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Scroll to store|'+scrolls+'}|'+setQty+')'
						+ '[Rods, Staces, Wands](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Rod Staff Wand to store|'+rods+'}|'+setQty+')'
						+ '[Ring](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Ring to store|'+rings+'}|'+setQty+')'
						+ '[Miscellaneous](!cmd --button '+BT.TOITEM+'|'+toConvert+'|?{Misc Item to store|'+misc+'}|'+setQty+')}}'
						+ '{{Section6='+(replaceWith.length ? ('[Review '+replaceWith+'](!cmd --button '+BT.REVIEW_ITEM+'|'+toConvert+'|'+replaceWith+'|'+setQty+')') : ('<span style='+design.grey_button+'>Review Item</span>'))
						+ (replaceWith.length && toConvert.length ? ('[Convert '+toConvert+' to '+replaceWith+'](!cmd --button '+BT.STORE_ITEM+'|'+toConvert+'|'+replaceWith+'|'+(setQty==0 ? '&#63;{How many to add?}' : setQty)+')') : ('<span style='+design.grey_button+'>Convert Item</span>'))
						+ '}}{{Section7=[Return to TokenEdit menu](!cmd --abilities)}}';
			};
			sendFeedback( content );
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	};
	
	/*
	 * Make a menu to allow the DM to check the spells & powers defined on
	 * a character sheet against the RPGMaster databases, and then replace 
	 * any not found in the databases with appropriate alternatives.
	 */
	
	var spells2Conv = {
		mu: [],
		pr: [],
		pw: [],
	}
	
	async function makeConvertSpellsMenu( args, selected, senderId ) {
		
		try {
			var cmd = args[0] || '',
				castType = args[1] || '',
				fromLevel = parseInt(args[2]) || 1,
				fromName = args[3] || '',
				toType = args[4] || '',
				toLevel = parseInt(args[5]) || 1,
				toName = (args[6] || '').replace(/\s/g,'-'),
				msg = args[7],
				isPower = castType === 'pw',
				isWizard = castType === 'mu',
				powerType = '',
				powerDB = '',
				content, tokenID, charCS;
				
			if (cmd === BT.FROMSPELL) {
				toLevel = fromLevel;
			}
			
			msg = msg || (cmd === BT.FROMSPELL ? ('Selected '+fromName+' to convert') : (cmd === BT.TOSPELL ? ('Selected '+toName+' as a replacement') : (cmd === BT.CONVSPELL ? ('Converting '+fromName+' to '+toName) : '')));

			if (!(spells2Conv.mu.length || spells2Conv.pr.length || spells2Conv.pw.length)) {
				_.each( selected, e => {
					tokenID = e._id;
					charCS = getCharacter( tokenID );
					_.each( spellLevels, (levels,c) => {
						_.each( levels, (col, l) => {
							if (!l || !['mu','pr','pw'].includes(c)) return;
							let def,
								spellbook = (attrLookup( charCS, [fields.Spellbook[0]+col.book,fields.Spellbook[1]] ) || '').split('|');
							_.each(spellbook, spell => {
								if (!spell || !spell.length) return;
								def = ((c === 'pw') ? findPower( charCS, spell, true, false ) : abilityLookup( ((c === 'mu') ? fields.MU_SpellsDB : fields.PR_SpellsDB), spell, null, true, false ));
								if (!def.obj) spells2Conv[c].push({name:spell, dB:def.dB, level:l});
							});
						});
					});
				});
			
				spells2Conv.mu = _.sortBy(spells2Conv.mu,'name');
				spells2Conv.pr = _.sortBy(spells2Conv.pr,'name');
				spells2Conv.pw = _.sortBy(spells2Conv.pw,'name');
			}

			if (toName.startsWith('Level')) {
				toLevel = parseInt(toName.match(/\d+/)) || 1;
				toName = '';
			} else if (fromName.length && toName.length && cmd === BT.CONVSPELL) {
				toName = (isPower && toType !== 'pw') ? (toType.toUpperCase()+'-'+toName) : toName;
				let spellObj = (isPower ? findPower( null, toName, true, false ) : abilityLookup( (isWizard ? fields.MU_SpellsDB : fields.PR_SpellsDB), toName, null, true, false ));
				_.each( selected, e => {
					tokenID = e._id;
					charCS = getCharacter( tokenID );
					let spellbook = '|'+(attrLookup( charCS, [fields.Spellbook[0]+spellLevels[castType][fromLevel].book, fields.Spellbook[1]] ) || '')+'|';
					spellbook = spellbook.replace('|'+fromName+'|',(!isPower && fromLevel !== toLevel ? '|' : '|'+toName+'|'));
					setAttr( charCS, [fields.Spellbook[0]+spellLevels[castType][fromLevel].book, fields.Spellbook[1]], _.uniq(spellbook.split('|').filter(s => !!s).sort(),true).join('|') );
					if (!isPower && fromLevel !== toLevel) {
						spellbook = '|'+(attrLookup( charCS, [fields.Spellbook[0]+spellLevels[castType][toLevel].book, fields.Spellbook[1]] ) || '')+'|';
						if (!spellbook.includes('|'+toName+'|')) {
							spellbook += toName+'|';
						}
						setAttr( charCS, [fields.Spellbook[0]+spellLevels[castType][toLevel].book, fields.Spellbook[1]], spellbook.split('|').filter(s => !!s).sort().join('|') );
					};
					let altTable = getTable( charCS, (isPower ? fieldGroups.ALTPWR : (isWizard ? fieldGroups.ALTWIZ : fieldGroups.ALTPRI )));
					if (altTable) {
						let values = altTable.copyValues();
						if (isPower) {
							values[fields.AltPowers_name[0]][fields.AltPowers_name[1]] = toName;
							values[fields.AltPowers_castValue[0]][fields.AltPowers_castValue[1]] = 0;
							values[fields.AltPowers_castMax[0]][fields.AltPowers_castMax[1]] = 0;
							values[fields.AltPowers_effect[0]][fields.AltPowers_effect[1]] = '!magic --cast-spell POWER|'+tokenID;
						} else {
							values[fields.AltSpells_name[0]][fields.AltSpells_name[1]] = toName;
							values[fields.AltSpells_remaining[0]][fields.AltSpells_remaining[1]] = 0;
							values[fields.AltSpells_memorised[0]][fields.AltSpells_memorised[1]] = 0;
							values[fields.AltSpells_effect[0]][fields.AltSpells_effect[1]] = '!magic --cast-spell MU-PR|'+tokenID;
							if (spellObj.obj) {
								let spellSpecs = spellObj.specs();
								let spellData = spellObj.data();
								spellData = parseData( spellData, reSpellSpecs );
								values[fields.AltSpells_level[0]][fields.AltSpells_level[1]] = toLevel;
								values[fields.AltSpells_school[0]][fields.AltSpells_school[1]] = spellSpecs[0][4];
								values[fields.AltSpells_speed[0]][fields.AltSpells_speed[1]] = spellData.speed;
								values[fields.AltSpells_range[0]][fields.AltSpells_range[1]] = (spellObj.obj[1].body.match(/{{range=(^})}}/i) || ['',''])[1];
								values[fields.AltSpells_aoe[0]][fields.AltSpells_aoe[1]] = (spellObj.obj[1].body.match(/{{aoe=(^})}}/i) || ['',''])[1];
							};
						};
						altTable.addTableRow( altTable.tableFind( fields[altTable.fieldGroup+'name'], fromName ), values );
					};
				});
				spells2Conv[castType] = (!spellObj.obj) ? spells2Conv[castType].map( s => {s.name = ((s.name === fromName) ? toName : s.name); return s;}) : spells2Conv[castType].filter( s => s.name != fromName );
				fromName = toName = toType = '';
				fromLevel = toLevel = 1;
			};

			if (!(spells2Conv.mu.length || spells2Conv.pr.length || spells2Conv.pw.length)) {
				content = '&{template:'+fields.defaultTemplate+'}{{title=All Spells & Powers Converted}}'
						+ '{{desc=All spells and powers have been moved to their spellbooks and checked against the RPGMaster databases for validity. '
						+ 'They now need to memorise (or re-memorise) their spells for the day and their powers using the appropriate menus, dialogues and commands provided by RPGMaster.}}';
				sendFeedback( content );
				return;
			};
			
			content = '&{template:'+fields.defaultTemplate+'}{{name=Unknown Spells}}'
					+ (msg && msg.length ? '{{Section='+msg+'}}' : '')
					+ '{{Section1=The spells listed below have not been found in the RPGMaster databases. Select a spell from the list, and a replacement using the spell '
					+ 'lists.  The spell can be converted using the [Convert] button. Unknown spells are not guaranteed to work with the APIs, '
					+ 'and may cause interruptions to game-play. New spells can be added to the databases using the instructions in the help handouts.\n'
					+ 'Subsequently, spells will need to be memorised using *Spells Menu / Memorise Spells* or *!magic --mem-spell*}}'
					+ '{{Section2=**Wizard spells to replace**\n';
			_.each( ['mu','pr','pw'], c => {
				if (!spells2Conv[c].length) {
					content += 'None to convert - all OK!';
				} else {
					_.each( spells2Conv[c], s => {
						content += s.name !== fromName ? ('['+s.name+'](!cmd --button '+BT.FROMSPELL+'|'+c+'|'+s.level+'|'+s.name+'|'+toType+'|'+toLevel+'|'+toName+')') : ('<span style='+design.selected_button+'>'+s.name+'</span>');
					});
				}
				if (c === 'mu') content += '}}{{Section3=**Priest spells to replace**\n';
				if (c === 'pr') content += '}}{{Section4=**Powers to replace**\n';
			});
			
			let muSpells = getMagicList( fields.MU_SpellsDB, spTypeLists, 'muspelll'+toLevel, senderId ),
				prSpells = getMagicList( fields.PR_SpellsDB, spTypeLists, 'prspelll'+toLevel, senderId ),
				powers = getMagicList( fields.PowersDB, spTypeLists, 'power', senderId );
			
			content += '}}{{Section5=**Spell Database Lists**\n'
					+  '*Can access other levels from drop down lists*\n'
					+  '*Powers can also be chosen from spells*\n'
					+  '[Wizard L'+toLevel+'](!cmd --button '+BT.TOSPELL+'|'+castType+'|'+fromLevel+'|'+fromName+'|mu|'+toLevel+'|&#63;{Which spell is a substitute for '+fromName+'?&#124;'+muSpells+'|Level1|Level2|Level3|Level4|Level5|Level6|Level7|Level8|Level9})'
					+  '[Priest L'+toLevel+'](!cmd --button '+BT.TOSPELL+'|'+castType+'|'+fromLevel+'|'+fromName+'|pr|'+toLevel+'|&#63;{Which spell is a substitute for '+fromName+'?&#124;'+prSpells+'|Level1|Level2|Level3|Level4|Level5|Level6|Level7})'
					+  '[Powers](!cmd --button '+BT.TOSPELL+'|'+castType+'|'+fromLevel+'|'+fromName+'|pw|'+toLevel+'|&#63;{Which spell is a substitute for '+fromName+'?&#124;'+powers+'})'
					+  '}}{{Section6='+(toType && toName ? ('[Review '+toName+'](!cmd --button '+BT.REVIEW_SPELL+'|'+castType+'|'+fromLevel+'|'+fromName+'|'+toType+'|'+toLevel+'|'+toName+')&#13;') : ('<span style='+design.grey_button+'>Review Spell</span>'))
					+  ' or '+(fromName && toName ? ('[Convert '+fromName+' to '+toName+'](!cmd --button '+BT.CONVSPELL+'|'+castType+'|'+fromLevel+'|'+fromName+'|'+toType+'|'+toLevel+'|'+toName+')') : ('<span style='+design.grey_button+'>Convert Spell</span>'))
					+  '}}{{Section7=[Return to TokenEdit menu](!cmd --abilities)}}';
			
			sendFeedback( content );
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	};
	
	/*
	 * Make a simple message confirming a canceled action
	 */
	 
	var makeMsg = function(title,msg) {
		var content = '&{template:'+fields.defaultTemplate+'}{{name='+title+'}}'
					+ '{{desc='+msg+'}}';
	   sendFeedback(content,flags.feedbackName,flags.feedbackImg);
	   return;
	}
	
	/*
	 * Display a menu of actions to manage token bars
	 */
	 
	var makeMngTokenBarsMenu = function( args ) {
		
		var menuType = args[1];
	 
		var content = '&{template:'+fields.defaultTemplate+'}{{name=Manage Token Bars}}'
					+ '{{Section=Use the following buttons to manage the mapping and values represented by token bars}}'
					+ '{{Section1=Current default mappings are:\n'
					+ '<span style="color:green">bar1 (green)</span> = '+state.RPGMaster.tokenFields[0]+'\n'
					+ '<span style="color:blue">bar2 (blue)</span> = '+state.RPGMaster.tokenFields[1]+'\n'
					+ '<span style="color:red">bar3 (red)</span> = '+state.RPGMaster.tokenFields[2]+'}}'
					+ '{{Section2=[Set Default Token Bars for Campaign](!cmd --button '+BT.AB_ASK_TOKENBARS+'|'+menuType+')\n'
					+ '[Set bars on selected Tokens to defaults](!cmd --button '+BT.AB_TOKEN+'|'+menuType+')\n'
					+ '[Clear Bar links for selected Tokens](!cmd --button '+BT.AB_TOKEN_NONE+'|'+menuType+')\n'
					+ '[Set bars on all Tokens to defaults (not mobs)](!cmd --button '+BT.AB_TOKEN_ASK_LINKED+'|'+menuType+')\n'
					+ '[Set bars on all Tokens to defaults (including mobs)](!cmd --button '+BT.AB_TOKEN_ASK_ALL+'|'+menuType+')}}'
					+ '{{desc=[Return to Token Setup menu](!cmd --abilities '+menuType+') or just do something else}}';
					
		sendFeedback( content );
	}
	
	/*
	 * Display a dialogue showing current token bar settings
	 */
	 
	 var makeTokenBarDisplay = function(tokenID,abMenu) {
	 
		var content = '&{template:'+fields.defaultTemplate+'}{{name=Default Token Bars}}{{desc=The following fields have been set as the default fields for the token bars. '
					+ 'These will be set when using the [Set Token Bars] button, and for *Drag & Drop* creatures. Note that previously vacant bars have been set to recommended '
					+ 'values: in order for RPGMaster spell efects to work best (especially for spells vs. creature mobs) , default token bars should include **Thac0_base, AC & HP**.}}'
					+ '{{desc1=<span style="color:green">bar1 (green)</span> = '+state.RPGMaster.tokenFields[0]+'\n'
					+ '<span style="color:blue">bar2 (blue)</span> = '+state.RPGMaster.tokenFields[1]+'\n'
					+ '<span style="color:red">bar3 (red)</span> = '+state.RPGMaster.tokenFields[2]+'}}'
					+ '{{desc2=[Reset to recommended](!cmd --button '+BT.AB_RESET_TOKENBARS+'|'+abMenu+')}}'
					+ '{{desc3=[Return to Token Management menu](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+abMenu+')}}';
				
		sendFeedback( content );
	 };


// --------------------------------------------------------------- Button press Handlers ----------------------------------------------

	/*
	 * Handle reviewing a spell conversion
	 */
	 
	var handleConvSpellReview = function( args ) {
		
		var spellType = args[4] || '',
			spell = args[6] || '',
			dB = (spellType === 'mu' ? fields.MU_SpellsDB : (spellType === 'pr' ? fields.PR_SpellsDB : fields.PowersDB)),
			def = abilityLookup( dB, spell );
			
		if (!!def.obj) {
			args[0] = BT.SPELLCONV_MENU;
			let content = def.obj[1].body
						+ '&#13;&#47;w gm &{template:'+fields.defaultTemplate+'}{{name=Spell convertion menu}}'
						+  '{{desc=[Return to Spell Conversion Menu](!cmd --button '+args.join('|')+')}}';
			sendFeedback( content );
		};
	};

	/*
	 * Handle reviewing an item of equipment conversion
	 */
	 
	var handleConvItemReview = function( args ) {
		
		var item = args[2] || '',
			def = getAbility( fields.MagicItemDB, item, null, false, true );  // rootDB, name, charCS, silent, isGM, trueName
			
		if (!!def.obj) {
			args[0] = BT.ITEMCONV_MENU;
			let content = def.obj[1].body
						+ '{{desc9=[Return to Item Conversion Menu](!cmd --button '+args.join('|')+')}}';
			sendFeedback( content );
		};
	};

	/*
	 * Handle adding a spell to a spellbook
	 */
	 
	async function handleAddSpell( args, selected, senderId ) {
		
		try {
			var cmd = args[0].toUpperCase(),
				level = parseInt(args[1]) || 1,
				spell = args[2],
				isMU = cmd.includes('MU'),
				isPR = cmd.includes('PR'),
				isPower = cmd.includes('POWER'),
				charCS, listAttr, spellList, msg;
				
			if (isPower) {
				msg = 'Added '+spell+' to Powers';
				listAttr = fields.PowersSpellbook;
			} else if (isMU) {
				msg = 'Added '+spell+' to MU Level '+level;
				listAttr = [fields.MUSpellbook[0]+spellLevels.mu[level].book,fields.MUSpellbook[1]];
			} else {
				msg = 'Added '+spell+' to PR Level '+level;
				listAttr = [fields.PRSpellbook[0]+spellLevels.pr[level].book,fields.PRSpellbook[1]];
			}
			_.each( selected, e => {
				charCS = getCharacter(e._id);
				spellList = attrLookup( charCS, listAttr ) || '';
				spellList += (spellList ? '|' : '') + spell.hyphened();
				spellList = spellList.split('|').sort().join('|');
				setAttr( charCS, listAttr, spellList );
			});
			args[2] = '';
			makeSpellsMenu( args, selected, senderId, msg );
			return;
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}

	/*
	 * Handle reviewing a spell, for use before adding it to 
	 * a spellbook
	 */
	 
	var handleReviewSpell = function( args ) {
		
		var cmd = args[0].toUpperCase(),
			isMU = cmd.includes('MU'),
			isPR = cmd.includes('PR'),
			isPower = cmd.includes('POWER'),
			cmdStr,content;

		args[0] = isPower ? 'POWERS' : (isMU ? 'MUSPELLS' : 'PRSPELLS');
		cmdStr = args.join('|');
		content = '&{template:'+fields.defaultTemplate+'}{{name=Return to Menu}}'
				+ '{{desc=[Return to Menu](!cmd --add-spells '+cmdStr+') or do something else}}';
		sendFeedback(content,flags.feedbackName,flags.feedbackImg);
	}
	
	/*
	 * Handle adding all valid Priest spells to a Priest's
	 * known spells, using the lists pf Spheres known in
	 * the Class Database
	 */
	 
	async function handleAddAllPRspells( args, selected, senderId ) {
		
		try {
			var spellBook, extraSpells,
				charCS, specs, classes,
				priestClass, classData,
				majorSpheres, minorSpheres,
				sphere, spell;
			
			_.each( selected, t => {
				spellBook = [];
				majorSpheres = [];
				minorSpheres = [];
				extraSpells = [];
				charCS = getCharacter( t._id );
				classes = classObjects(charCS, senderId);
				for (const c of classes) {
					classData = c.obj[1].body;
					classData = (classData.match(/}}\s*ClassData\s*=(.*?){{/im) || ['',''])[1];
					classData = classData ? [...('['+classData+']').matchAll(/\[[\s\w\-\+\,\:\/\|]+?\]/g)] : [];
					for (const d of classData) {
						let data = parseData( d[0], reClassSpecs ),
							spellType = data.spellLevels ? data.spellLevels.split('|')[3] : '';
						if (!data.cl || !data.cl.length) {
							if ((c.base == 'priest' && spellType != 'MU') || spellType == 'PR') {
								majorSpheres.push(data.sps.dbName());
								minorSpheres.push(data.spm.dbName());
								for (let s=1; s<spellLevels.pr.length; s++) {
									if (data['xspell'+s] && data['xspell'+s].length) {
										if (_.isUndefined(extraSpells[s])) extraSpells[s]=[];
										extraSpells[s].push(data['xspell'+s]);
									}
								}
							}
						}
					}
				}
				majorSpheres = _.uniq(majorSpheres.join('|').split('|').sort(),true);
				minorSpheres = _.uniq(minorSpheres.join('|').split('|').sort(),true);

				_.each( DBindex.pr_spells_db, spellRef => {
					let spellData, spellName;
					if (spellRef[0].length) {
						spell = getObj('ability',spellRef[0]);
						if (spell) {
							spellData = spell.get('action');
							spellName = spell.get('name');
						}
					} else {
						spellData = dbNames[spellRef[2]].db[spellRef[3]].body;
						spellName = dbNames[spellRef[2]].db[spellRef[3]].name;
					}
					if (spellData) {
						spellData = (spellData.match(/}}\s*SpellData\s*=(.*?){{/im) || ['',''])[1];
						spellData = parseData( spellData, reSpellSpecs, false );
						sphere = (spellData.sph+'|any').dbName().split('|');
						if (_.some( sphere, s => (majorSpheres.includes(s) || (spellData.level < 4 && minorSpheres.includes(s))))) {
							if (_.isUndefined(spellBook[spellData.level])) spellBook[spellData.level] = [];
							if (!spellBook[spellData.level].includes(spellName)) {
								spellBook[spellData.level].push(spellName);
							};
						};
					};
				});
				for (let s=1; s<spellLevels.pr.length; s++) {
					if (extraSpells[s] && extraSpells[s].length) {
						extraSpells[s] = _.uniq(extraSpells[s].join('|').split('|').sort(),true);
						if (_.isUndefined(spellBook[s])) spellBook[s] = [];
						spellBook[s] = _.uniq(spellBook[s].concat(extraSpells[s]).sort(),true);
					}
				}
				for (const l in spellLevels.pr) {
					if (l != 0) setAttr( charCS, [fields.Spellbook[0]+spellLevels.pr[l].book,fields.Spellbook[1]], (spellBook[l] || ['']).sort().join('|') );
				}
				sendFeedback( '&{template:'+fields.defaultTemplate+'}{{name='+charCS.get('name')+'\'s priest spells have been set at all levels}}'
							+ '{{Major Spheres=*'+majorSpheres.join(', ')+'*}}{{Minor Spheres=*'+minorSpheres.join(', ')+'*}}',flags.feedbackName,flags.feedbackImg);
			});
			args[2] = '';
			if (args[1] > 0) makeSpellsMenu( args, selected, senderId, ('Spells added to all Priest Levels') );
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	};
	
	/*
	 * Handle adding all standard powers of a particular class 
	 * to a Character Sheet
	 */
	 
	async function handleAddAllPowers( args, type, selected, senderId, silent=false ) {
		
		if (!['MU','PR','PW','AB'].includes(type = type.toUpperCase()))
			{sendError('Invalid type specified when adding powers',msg_orig[senderId]);return;}
			
		var tokenID, tokenObj, charCS, content, found = false,
			classes, race, raceObj, parsedData, parsedAttr, raceData,
			racePowers = [], abAction = [], powers = [[],[]],
			spellType = type.toLowerCase(),
			typeText = {AB:'Actions',PW:'Powers',MU:'Wizard Spells',PR:'Priest Spells'};
			
		var getClassPowers = function( charCS, senderId, powers, type ) { 
			let classes = classObjects(charCS,senderId);	
			for (const c of classes) {
				if (c.dB[0] !== fields.ClassDB[0]) continue;
				for (const d of c.rawData) {
					let power = parseData( d[0], reSpellSpecs );
					if (power.spell.toUpperCase() === type) {
						let level = (type === 'PW') ? 1 : (parseInt(power.level) || 1);
						if (!powers[level]) powers[level] = [];
						powers[level].push(power.name);
					}
				};
				let p = powers;
				if (!silent && powers.length) content += '{{'+c.obj[1].name.dispName()+'='+(_.flatten(p).join(', ') || 'None')+'}}';
			};
			return powers;
		};

		var getRacePowers = function( racePowers, powers, actions, type, raceData, specs ) {
			for (const d of raceData) {
				let power = parseData( d[0], specs );
				if (power.spell.toUpperCase() === type) {
					let level = (type === 'PW') ? 1 : (parseInt(power.level) || 1);
					racePowers.push(power.name);
					if (!powers[level]) powers[level] = [];
					powers[level].push(power.name);
					actions.push(power.action == '1');
					if (type === 'AB' && abilityLookup( fields.AbilitiesDB, 'GM-Roll-'+power.name, charCS, true )) {
						powers[1].push('GM-Roll-'+power.name);
						actions.push(power.action == '1');
					};
				}
			};
			return [racePowers,powers,actions];
		};
		
		var setPowersOrSpells = function(rootDB,charCS,powers,level,type,senderId) {
						
			return new Promise(resolve => {
				try {
					let spells = powers[level].join('|').toLowerCase().dispName().split('|');
					if (spells.includes('random')) {
						let listType = type === 'pw' ? 'power' : (type === 'mu' ? 'muspelll'+level : 'prspelll'+level);
						let spellList = _.uniq(getMagicList( rootDB, spTypeLists, listType, senderId ).toLowerCase().split(/\,|\|/));
						spells = spells.map( s => (s !== 'random' ? s : (!spellList.length ? '' : spellList[randomInteger(spellList.length)])) ).filter(s=>!!s).sort();
					};
					spells = _.uniq(spells.sort(),true);
					powers[level] = spells;
					if (spells.join('').length) setAttr( charCS, [fields.Spellbook[0]+spellLevels[(type)][level].book, fields.Spellbook[1] ], (spells.join('|').hyphened() || '') );
				} catch (e) {
					log('CommandMaster setPowersOrSpells: JavaScript '+e.name+': '+e.message+' while processing sheet '+charCS.get('name'));
					sendDebug('CommandMaster setPowersOrSpells: JavaScript '+e.name+': '+e.message+' while processing sheet '+charCS.get('name'));
					sendCatchError('CommandMaster',msg_orig[senderId],e);
				} finally {
					setTimeout(() => {
						resolve(powers);
					}, 20);
					return powers;
				}
			});
		};
		
		for (const t of selected) {
			tokenID = t._id;
			charCS = getCharacter(tokenID);
			if (!charCS) {sendError('No or invalid token selected when adding powers',msg_orig[senderId]);return;}

			tokenObj = getObj('graphic',tokenID);

			if (!silent) content = '&{template:'+fields.defaultTemplate+'}{{name='+charCS.get('name')+'\'s '+typeText[type]+'}}'
								 + '{{Section1='+charCS.get('name')+' has been granted the following '+typeText[type]+' (if any)}}';
		
			powers = (type !== 'AB') ? getClassPowers( charCS, senderId, powers, type ) : powers;
			race = attrLookup( charCS, fields.Race ) || 'human';
			[parsedData,parsedAttr,raceData] = resolveData( race, fields.RaceDB, /}}\s*RaceData\s*=(.*?){{/im );
			[racePowers,powers,abAction] = getRacePowers( racePowers, powers, abAction, type, raceData, reSpellSpecs );

			if (type === 'AB') {
				let roller = '',   // state.MagicMaster.gmRolls ? 'GM-Roll-' : '',
					lock = attrLookup( charCS, fields.Container_lock ) || parsedData.lock,
					oldLock = attrLookup( charCS, fields.Old_lock ) || lock;
				if (lock) {
					let	lockObj = abilityLookup( fields.AbilitiesDB, lock, charCS );
					if (lockObj.obj) {
						[parsedData,parsedAttr,raceData] = resolveData( lock, fields.AbilitiesDB, /abilitydata=([^\{]*)/im );
						racePowers.push(lock);
						powers[1].push(lock);
						abAction.push(parsedData.action == '1');
						setImgs(tokenObj,charCS,parsedData,(lock !== oldLock));
						setVars(charCS,parsedData,'lvar',fields.Lock_varPrefix[0],fields.Lock_vars,(lock !== oldLock));
						[racePowers,powers,abAction] = getRacePowers( racePowers, powers, abAction, type, raceData, reSpellSpecs );
					};
				};
						
				let trap = attrLookup( charCS, fields.Container_trap ) || parsedData.trap,
					oldTrap = attrLookup( charCS, fields.Old_trap ) || trap;
				roller = '';   // state.MagicMaster.gmRolls ? 'GM-Roll-' : '';
				if (trap) {
					let	trapObj = abilityLookup( fields.AbilitiesDB, trap, charCS );
					if (trapObj.obj) {
						[parsedData,parsedAttr,raceData] = resolveData( roller+trap, fields.AbilitiesDB, /abilitydata=([^\{]*)/im );
						racePowers.push(trap);
						powers[1].push(trap);
						abAction.push(parsedData.action == '1');
						setImgs(tokenObj,charCS,parsedData,(trap !== oldTrap));
						setVars(charCS,parsedData,'tvar',fields.Trap_varPrefix[0],fields.Trap_vars,(trap !== oldTrap));
						setAttr(charCS,fields.Trap_magical,(1+parseInt(parsedData.magical)));
						[racePowers,powers,abAction] = getRacePowers( racePowers, powers, abAction, type, raceData, reSpellSpecs );
					} else {
						log('handleAddAllPowers: not found trap "'+trap+'"');
					}
				};
				
				_.each (powers[1].join('|').split('|'),(ab,i) => {
					if (!!ab) {
						let abObj = abilityLookup( fields.AbilitiesDB, ab, null, true, false );
						if (!abObj.obj) {
							if (!ab.includes('GM-Roll-')) sendError('Specified ability macro "'+ab+'" does not exist in the databases',msg_orig[senderId]);
							return;
						};
						let specs = abObj.specs();
						if (!specs || !specs[0][4]) {sendError('Specified ability macro "'+ab+'" has an incorrectly formatted database entry',msg_orig[senderId]);return;}
						
						setAbility( charCS, specs[0][4], abObj.obj[1].body.replace(/\^\^chest\^\^/img,charCS.get('name'))
																		  .replace(/\^\^chestid\^\^/img,charCS.id)
																		  .replace(/\^\^gmid\^\^/img,senderId),
														 abAction[i] );
					};
				});
			} else {
				if (spellType !== 'pr') _.each( spellLevels[spellType], s => setAttr( charCS, [fields.Spellbook[0]+s.book, fields.Spellbook[1] ], '' ) );
				let rootDB = spellType === 'pw' ? fields.PowersDB : (spellType === 'mu' ? fields.MU_SpellsDB : fields.PR_SpellsDB);
				let spellList = powers;
				for (let k=0; k < powers.length; k++) {
					if (k < spellLevels[spellType].length && !_.isUndefined(powers[k]) && powers[k].length) {
						powers = await setPowersOrSpells(rootDB,charCS,powers,k,spellType,senderId);
					};
				};
			};
			
			let powerList = _.uniq(powers.flat().join('|').split('|').filter(ab=>!!ab));
			let foundThese = !!powerList.length;
			found = found || foundThese;

			if (!silent && foundThese) {
				content += '{{'+race+'='+(_.uniq(type !== 'AB' ? powerList : (racePowers.join('|').split('|').filter(p=>!!p))).join(', ') || 'None')+'}}';
				sendFeedback( content,flags.feedbackName,flags.feedbackImg );
			}
		};
		if (args[0] === BT.ALL_POWERS) {
			args[2] = '';
			makeSpellsMenu( args, selected, senderId, ('All Class & Race powers added') );
		}
		return found;
	};
	
	/*
	 * Handle adding any default weapons specified for a Class or Race 
	 * to the character sheet, and equip if instructed to do so
	 */
	 
	var handleAddAllItems = function( tokenID, charCS, senderId, type='wp' ) {
		
		return new Promise(resolve => {
			try {
				var weapData = [],
					tokenID = findObjs({type:'graphic',represents:charCS.id}),
					content = '';
				
				var getWeaps = function( charCS, dB, name, type ) {
					var parsedData,parsedAttr,rawData,
						age = parseInt(attrLookup( charCS, fields.AgeVal )),
						weapons = [];
					[parsedData,parsedAttr,rawData] = resolveData( name, dB, /}}\s*(?:Class|Race)Data\s*=(.*?){{/im );
					_.each( rawData, d => {
						let weap = parseData( d[0], reEquipSpecs );
//						log('getWeaps: name = '+name+', weap.age = '+weap.age+', age = '+age+', age >= (parseInt(weap.age) || 0) = '+(age >= (parseInt(weap.age) || 0)));
						if (weap.spell.dbName() == type && (!weap.age || !age || age >= (parseInt(weap.age) || 0))) {
							weapons.push(weap);
						}
					});
					return weapons;
				};
				
				var equipWeap = function( Items, weap, hand='item', speed=5 ) {
					const hands = {prime:[0,BT.CS_RIGHT],offhand:[1,BT.CS_LEFT],both:[2,BT.CS_BOTH]};
					let   otherHand = parseInt(hand) || 3;
					if (_.isUndefined(weap) || !weap.length) return Items;
					weap = weap.split('|').map(n => n.split(':'));
					_.each(weap, w => {
						let wObj = abilityLookup( fields.WeaponDB, w[0] );
						if (wObj.obj) {
							speed = wObj.obj[1].ct;
						}
						let index = Items.tableFind( fields.Items_name, w[0] );
						if (_.isUndefined(index)) index = Items.tableFind( fields.Items_name, '-' );
						if (_.isUndefined(index)) index = Items.addTableRow().sortKeys.length - 1;
						let values = Items.copyValues();
						let qty = (w[1] || '1').match(reDiceSpec) || ['','1','0','0',''];
						let qtyMod = (qty[3] || '0').match(reMod);
						qty[3] = ((qtyMod && qtyMod.length >= 2 && parseInt(qtyMod[2])) ? (rollDice( qtyMod[1], qtyMod[2], 0 ) + parseInt(qtyMod[3] || 0)) : parseInt(qty[3] || 0));
						let qtyVal = (parseInt(qty[2] ? rollDice( qty[1], qty[2], qty[4] ) : qty[1]) || 0) + parseInt(qty[3] || 0);
						values[fields.Items_name[0]][fields.Items_name[1]] = values[fields.Items_trueName[0]][fields.Items_trueName[1]] = w[0];
						values[fields.Items_speed[0]][fields.Items_speed[1]] = values[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = speed;
						values[fields.Items_qty[0]][fields.Items_qty[1]] = values[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = qtyVal;
						Items = Items.addTableRow( index, values );
						if (w[0] !== '-' && hand.dbName() !== 'item') {
							let cmd;
							if (_.isUndefined(hands[hand])) {
								hand = otherHand++;
								cmd = BT.CS_HAND;
							} else {
								cmd = hands[hand][1];
								hand = hands[hand][0];
							}
							sendAPI(fields.attackMaster+' --button '+cmd+'|'+charCS.id+'|'+index+'|'+hand+'||silent');
						}
					});
					return Items;
				}
						
				type = type.dbName();
				let typeText = type == 'ac' ? 'armour' : (type == 'mi' ? 'items' : 'equipment');
				
				_.each( classObjects( charCS, senderId ), c => weapData = weapData.concat(getWeaps( charCS, fields.ClassDB, c.name, type )) );
				weapData = weapData.concat(getWeaps( charCS, fields.RaceDB, attrLookup( charCS, fields.Race ), type ));
				
				if (weapData.length) {
					
					let Items = getTable( charCS, fieldGroups.MI );
					let roll = weapData.reduce((t,w) => t+(parseInt(w.chance) || 1),0);
					if (roll > 1) {
						roll = randomInteger(roll);
					}
					let percent = 0;
					weapData = weapData.find(w => {
						percent += (parseInt(w.chance) || 1);
						return roll <= percent;
					});
					let InHand = getTable( charCS, fieldGroups.INHAND );
					for (let r=InHand.table[1]; r < InHand.sortKeys.length; r++) {
						InHand = InHand.addTableRow( r );
					}
					if (weapData.items.length) {
						Items = equipWeap( Items, weapData.items, 'item', weapData.speed );
						content += '{{Added to '+typeText+'='+weapData.items.replace(/\|/g,', ')+'}}';
					}
					if (type === 'wp') {
						if (weapData.prime.length) {
							Items = equipWeap( Items, weapData.prime, 'prime', weapData.speed );
							content += '{{Primary Weapon='+weapData.prime+'}}';
						}
						if (weapData.offhand.length) {
							Items = equipWeap( Items, weapData.offhand, 'offhand', weapData.speed );
							content += '{{Offhand Weapon='+weapData.offhand+'}}';
						}
						if (weapData.both.length) {
							Items = equipWeap( Items, weapData.both, 'both', weapData.speed );
							content += '{{Two Handed Weapon='+weapData.both+'}}';
						}
						if (weapData.other.length) {
							Items = equipWeap( Items, weapData.other, weapData.hand, weapData.speed );
							content += '{{Added to Other hands='+weapData.other.replace(/\|/g,', ')+'}}';
						}
					}
				}
			} catch (e) {
				sendCatchError('CommandMaster',msg_orig[senderId],e);
			} finally {
				setTimeout(() => {
					resolve(content);
				}, 10);
			}
		});
	};
	
	/*
	 * Handle selecting a new lock or trap for a container
	 */
	 
	async function handleChangeLockOrTrap( args, senderId ) {
		
		var cmd = args[0],
			tokenID = args[1],
			value = args[2],
			isLock = cmd !== BT.TRAPTYPE,
			msg = '',
			raceData, attrData,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError('No token selected, or the selected token does not represent a container',msg_orig[senderId]);
			return;
		};
		
		var abObj = abilityLookup( fields.AbilitiesDB, value, charCS );
		if (!abObj.obj) {
			msg = 'The '+(isLock ? 'lock' : 'trap')+' '+value+' does not appear in the databases. Please select a different one';
			sendError(msg);
		} else {
			setAttr( charCS, (isLock ? fields.Old_lock : fields.Old_trap), (isLock ? fields.Container_lock : fields.Container_trap));
			setAttr( charCS, (isLock ? fields.Container_lock : fields.Container_trap), value );
			[raceData,attrData] = resolveData( value, fields.AbilitiesDB, /}}\s*?abilitydata\s*?=\s*\[(.*?)\],?{{/im );
			if (attrData.cac) setAttr( charCS, fields.MonsterAC, calcAttr(parseStr(attrData.cac || '10')) );
			if (attrData.hp) {
				setAttr( charCS, fields.HP, attrData.hp );
				setAttr( charCS, fields.MaxHP, attrData.hp );
			}
			handleSetTokenBars( [BT.AB_TOKEN_NONE], [{_id:tokenID}], senderId, true );
			await handleAddAllPowers(args, 'AB', [{_id:tokenID}], senderId);
			parseDesc( charCS, senderId );
		}
		makeChangeImagesMenu( [tokenID], senderId, msg );
		return;
	};

	/*
	 * Handle choosing a weapon proficiency to add to the 
	 * selected character
	 */
	 
	var handleChooseProf = function( args, selected, senderId ) {
		
		var weapon = args[1],
			weap = abilityLookup( fields.WeaponDB, weapon ),
			weapProf = '',
			melee = false,
			weapType = '',
			weapClass = [];
			
		if (weap.obj) {
			let weaponSpecs = weap.specs();
//				specs = weap.obj[1].body,
//				weaponSpecs = specs.match(/}}\s*specs\s*=(.*?){{/im);
//			weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[-\s\w\|]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
			for (let i=0; i<weaponSpecs.length; i++) {
				weapProf = weapProf || weaponSpecs[i][1];
				melee = melee || weaponSpecs[i][2].toLowerCase().includes('melee');
				weapClass.push( weaponSpecs[i][2] );
				weapType = weapType || weaponSpecs[i][4];
			}
		} else {
			let style = abilityLookup( fields.StylesDB, weapon );
			if (style.obj) {
				let styleSpecs = style.specs();
				weapProf = weapon;
				weapClass = ['style'];
				weapType = styleSpecs[0][4];
			}
		}
		weapClass = weapClass.join('/').replace('|','/');
		makeProficienciesMenu( ['',weapProf,melee,weapType], selected, senderId, 'Chosen '+weapClass+' proficiency \n**'+weapProf+'**\n of type '+weapType );
	}
	
	/*
	 * Handle adding a weapon proficiency to a character sheet
	 */
	 
	var handleAddProf = function( args, selected, senderId ) {
		
		var	weapLevel = args[0],
			weapon = args[1],
			weapType = args[2],
			charCS, row;
			
		_.each( selected, e => {
			charCS = getCharacter( e._id, true );
			if (charCS) {
				let ProfTable = getTable( charCS, fieldGroups.WPROF ),
					StyleTable = getTable( charCS, fieldGroups.STYLES ),
					weapProf = ProfTable.copyValues(),
					styleObj = getAbility( fields.StylesDB, weapon, charCS, true );

				if (_.isUndefined(row = ProfTable.tableFind( fields.WP_name, weapon ))) {
					if (_.isUndefined(row = ProfTable.tableFind( fields.WP_name, '-' ))) {
						row = ProfTable.sortKeys.length;
					}
				}
				if (weapLevel == 'NOT-PROF') {
					ProfTable.addTableRow( row );
					if (styleObj.obj && !_.isUndefined(row = StyleTable.tableFind( fields.Style_name, weapon ))) {
						StyleTable.addTableRow( row );
						sendAPI( fields.attackMaster+' --check-styles '+e._id );
					}
				} else {
					weapProf[fields.WP_name[0]][fields.WP_name[1]] = weapon;
					weapProf[fields.WP_type[0]][fields.WP_type[1]] = weapType;
					weapProf[fields.WP_expert[0]][fields.WP_expert[1]] = '1';
					weapProf[fields.WP_specialist[0]][fields.WP_specialist[1]] = (weapLevel.toUpperCase() == 'SPECIALIST' || weapLevel.toUpperCase() == 'MASTERY') ? '1' : '0';
					weapProf[fields.WP_mastery[0]][fields.WP_mastery[1]] = (weapLevel.toUpperCase() == 'MASTERY') ? '1' : '0';
					ProfTable.addTableRow( row, weapProf );
					
					if (styleObj.obj) {
						if (_.isUndefined(row = StyleTable.tableFind( fields.Style_name, weapon ))) {
							if (_.isUndefined(row = StyleTable.tableFind( fields.Style_name, '-' ))) {
								row = StyleTable.sortKeys.length;
							}
						}
						let styleRow = StyleTable.copyValues();
						styleRow[fields.Style_name[0]][fields.Style_name[1]] = weapon;
						styleRow[fields.Style_current[0]][fields.Style_current[1]] = false;
						styleRow[fields.Style_proficiency[0]][fields.Style_proficiency[1]] = weapLevel.toUpperCase() == 'SPECIALIST' ? 2 : (weapLevel.toUpperCase() == 'MASTERY' ? 3 : 1);
						StyleTable.addTableRow( row, styleRow );
						sendAPI( fields.attackMaster+' --check-styles '+e._id );
					}
				}
			}
		});
		makeProficienciesMenu( [''], selected, senderId, 'Set '+weapon+' as '+weapLevel.toLowerCase() );
	}
	
	/*
	 * Handle adding all a character's weapons as Proficient
	 */
	 
	async function handleAddAllProfs( args, selected, senderId ) {
		
		try {
			var msg = 'No weapons found';
			_.each( selected, e => {
				let charCS = getCharacter( e._id, true );
				if (charCS) {
					let ProfTable = getTable( charCS, fieldGroups.WPROF ),
						weapons = weaponLookup( charCS );

					weapons.push({weapon:'Innate',weapType:'Innate'});

					for (let row = 0; row < weapons.length; row++) {
						handleAddProf( ['PROFICIENT', weapons[row].weapon, weapons[row].weapType], [e] );
						msg = 'Set all weapons as proficient';
					}
				}
			});
			makeProficienciesMenu( [''], selected, senderId, msg );
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}
	
	/*
	 * Handle reviewing the specs of a weapon before adding 
	 * as a proficiency
	 */
	 
	var handleReviewProf = function( args, selected ) {
		
		var cmdStr = args.join('|'),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Return to Menu}}'
				+ '{{desc=[Return to Menu](!cmd --add-profs '+cmdStr+') or do something else}}';
		setTimeout( sendFeedback, 2000, content,flags.feedbackName,flags.feedbackImg );
	}
	
	/*
	 * Handle the selection of a class and level
	 */
	 
	async function handleClassSelection( args, selected, senderId, isGM ) {
		
		try {
			var errFlag = false;
			
			sendWait( senderId, 1 );
			var checkOverwrite = function( tokenID, charCS, args ) {
				args[0] = (args[0] === BT.CREATURE ? BT.CREATURE_CKD : BT.CONTAINER_CKD);
				let content = '&{template:'+fields.warningTemplate+'}{{title=Overwrite '+charCS.get('name')+'?}}'
							+ '{{desc=You are about to overwrite the Character Sheet for '+charCS.get('name')+'. '
							+ 'Are you sure this is what you want to do?\n'
							+ '[Yes Continue](!cmd --button '+args.join('|')+') [No Cancel](!magic --message gm|'+tokenID+'|Cancelled|The operation has been cancelled)}}';
				sendFeedback( content );
				return;
			};
		
 			var setClassAndRace = function( cmd, args, token, value, senderId, qualifier ) {
				
				let errFlag = false;
				return new Promise(resolve => {
					try {
						let charCS = getCharacter( token._id );
							
						if (!charCS) return;
						
						cmd = cmd.toUpperCase();
						
						let baseThac0val,
							container = cmd === BT.CONTAINER,
							isResetContainer = cmd === BT.RESET_CONTAINER;
						
						switch (cmd.toUpperCase()) {
						case BT.CLASS_F:
							setAttr( charCS, fields.Fighter_class, value );
							break;
						case BT.CLASS_W:
							setAttr( charCS, fields.Wizard_class, value );
							break;
						case BT.CLASS_P:
							setAttr( charCS, fields.Priest_class, value );
							break;
						case BT.CLASS_R:
							setAttr( charCS, fields.Rogue_class, value );
							break;
						case BT.CLASS_PSI:
							setAttr( charCS, fields.Psion_class, value );
							break;
						case BT.LEVEL_F:
							setAttr( charCS, fields.Fighter_level, (parseInt(value) || 0) );
							args[1] = attrLookup( charCS, fields.Fighter_class );
							break;
						case BT.LEVEL_W:
							setAttr( charCS, fields.Wizard_level, (parseInt(value) || 0) );
							args[1] = attrLookup( charCS, fields.Wizard_class );
							break;
						case BT.LEVEL_P:
							setAttr( charCS, fields.Priest_level, (parseInt(value) || 0) );
							args[1] = attrLookup( charCS, fields.Priest_class );
							break;
						case BT.LEVEL_R:
							setAttr( charCS, fields.Rogue_level, (parseInt(value) || 0) );
							args[1] = attrLookup( charCS, fields.Rogue_class );
							break;
						case BT.LEVEL_PSI:
							setAttr( charCS, fields.Psion_level, (parseInt(value) || 0) );
							args[1] = attrLookup( charCS, fields.Psion_class );
							break;
						case BT.RACE:
							setAttr( charCS, fields.Race, value );
							args[1] = 'Human';
							break;
						case BT.RESET_CONTAINER:
							setAttr( charCS, fields.Old_lock, '-' );
							setAttr( charCS, fields.Old_trap, '-' );
						case BT.CREATURE:
						case BT.CONTAINER:
							let pc = charCS.get('controlledby').split(',');
							let race = attrLookup( charCS, fields.Race );
							let gender = (attrLookup( charCS, fields.Gender ) || '').dbName();
							let classObjs = classObjects( charCS );
							let defClass = (classObjs.length == 1 && classObjs[0].name == 'creature' && classObjs[0].level == 0);
							if ((race && race.length && gender !== 'container') || !defClass || (pc && (pc.length > 1 || pc[0].length) && !pc.includes('all'))) {
								checkOverwrite( token._id, charCS, args );
								errFlag = true;
								return;
							}
						case BT.CREATURE_CKD:
						case BT.CONTAINER_CKD:
							let currentRace = attrLookup( charCS, fields.Race ) || '';
							let currentClass = classObjects( charCS, senderId );
							let newToken = (currentRace == '' && currentClass.length == 1 && currentClass[0].name == 'creature' && currentClass[0].level == 0);
							setCreatureAttrs( cmd, charCS, senderId, value, token, qualifier );
							if (!newToken && !isResetContainer) break;
							handleSetTokenBars( [''], [token], senderId, true );
							setDefaultTokenForCharacter( charCS, getObj('graphic',token._id) );
							break;
						default:
							sendDebug( 'handleClassSelection: invalid class selection command '+cmd);
							sendError( 'Internal CommandMaster Error' );
							break;
						};
						if (cmd !== BT.CONTAINER && cmd !== BT.CONTAINER_CKD) {
							if (cmd !== BT.CREATURE && cmd !== BT.CREATURE_CKD) {
								handleGetBaseThac0( charCS );
								handleCheckWeapons( token._id, charCS );
							}
							handleCheckSaves( null, senderId, [token], true );
						};
						parseDesc( charCS, senderId );
					} catch (e) {
						sendCatchError('CommandMaster',msg_orig[senderId],e);
						errFlag = true;
					} finally {
						setTimeout(() => {
							resolve(errFlag);
						}, 10);
					};
				});
			};
			
			async function classAndRace( cmd, args, token, value, senderId, selected, msg, qualifier ) {
				let errFlag = await setClassAndRace( cmd, args, token, value, senderId, qualifier );
				if (!errFlag && selected.length === 1) makeClassMenu( args, selected, senderId, true, msg );
			};
			
			if (!args[3] && (!selected || !selected.length)) return;
			
			var cmd = args[0],
				value = args[1],
				tokenID = args[3],
				msg = '',
				ability = true,
				dB = fields.ClassDB,
				valObj,
				qualifier = value.split('%%');
				
			value = qualifier.shift();

			switch (cmd.toUpperCase()) {
			case BT.CLASS_F:
				msg = 'Warrior class '+value+' selected';
				args[2] = 'Warrior';
				break;
			case BT.CLASS_W:
				msg = 'Wizard class '+value+' selected';
				args[2] = 'Wizard';
				break;
			case BT.CLASS_P:
				msg = 'Priest class '+value+' selected';
				args[2] = 'Priest';
				break;
			case BT.CLASS_R:
				msg = 'Rogue class '+value+' selected';
				args[2] = 'Rogue';
				break;
			case BT.CLASS_PSI:
				msg = 'Psion class '+value+' selected';
				args[2] = 'Psionicist';
				break;
			case BT.LEVEL_F:
				msg = 'Warrior level '+(parseInt(value) || 0)+' selected';
				args[2] = 'Warrior';
				ability = false;
				break;
			case BT.LEVEL_W:
				msg = 'Wizard level '+(parseInt(value) || 0)+' selected';
				args[2] = 'Wizard';
				ability = false;
				break;
			case BT.LEVEL_P:
				msg = 'Priest level '+(parseInt(value) || 0)+' selected';
				args[2] = 'Priest';
				ability = false;
				break;
			case BT.LEVEL_R:
				msg = 'Rogue level '+(parseInt(value) || 0)+' selected';
				args[2] = 'Rogue';
				ability = false;
				break;
			case BT.LEVEL_PSI:
				msg = 'Psion level '+(parseInt(value) || 0)+' selected';
				args[2] = 'Psionicist';
				ability = false;
				break;
			case BT.RACE:
				msg = 'Race of '+value+' selected';
				args[2] = 'Human';
				dB = fields.RaceDB;
				break;
			case BT.RESET_CONTAINER:
			case BT.CREATURE:
			case BT.CONTAINER:
			case BT.CREATURE_CKD:
			case BT.CONTAINER_CKD:
				msg = 'Creature type '+(value || 'chest reset')+' selected';
				args[2] = 'Human';
				dB = fields.RaceDB;
				break;
			default:
				sendDebug( 'handleClassSelection: invalid class selection command '+cmd);
				sendError( 'Internal CommandMaster Error' );
				return;
			}
			
			if (ability && value) {
				let abObj = abilityLookup( dB, value );
				if (!abObj.obj) {
					sendError('Class/Race '+value+' not found in any Class or Race database',msg_orig[senderId]);
					return;
				}
			};
		
			if (tokenID) {
				errFlag = await setClassAndRace( cmd, args, {_id:tokenID}, value, senderId, qualifier );
			} else {
				let t=0;
				for(const token of selected) {
					setTimeout( classAndRace, (10000*t++), cmd, args, token, value, senderId, selected, msg, qualifier );
				};
//				if (selected.length === 1) makeClassMenu( args, selected, senderId, isGM, msg );
			}
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
			errFlag = true;
		}
	};
	
	/*
	 * Handle any changed API commands registered with CommandMaster 
	 * by other API scripts.  Search the Ability macros for the 
	 * commands and update them.  This is only successful for API 
	 * commands that are on a line by themselves.
	 */
	 
	var handleChangedCmds = function() {
		
		var searchStrs = [],
			reOld,oldStr,newStr,
			changedAbilities;

		_.each( registeredCmds, function(a) {
			if (a.changed && !_.isUndefined(a.oldCmdStr)) {
				newStr=parseStr('!'+a.api+' '+a.cmd+' '+a.params).replace('$$','');
				if (a.oldCmdStr.endsWith('$$')) {
					oldStr=escapeRegExp(a.oldCmdStr.replace('$$',''));
					reOld=new RegExp(oldStr+'\\)|'+oldStr+'$','img');
				} else {
					reOld=new RegExp(escapeRegExp(a.oldCmdStr),'img');
				};
				searchStrs.push({
					newStr:newStr,
					oldStr:reOld
				});
			}
		});
		if (!searchStrs.length) {
			log('handleChangedCmds nothing changed');
			return;
		}
		changedAbilities = filterObjs(function(obj){
			let changed = false;
			if (obj.get('type') != 'ability') {return changed;}
			let charID=obj.get('characterid');
			if (!charID) {return changed;}
			let charCS=getObj('character',charID);
			if (!charCS) {return changed;}
			let action=obj.get('action');
			_.each(searchStrs,str=>{
				if (str.oldStr.test(action)) {
					log('handleChangedCmds database or character '+charCS.get('name')+' ability '+obj.get('name')+' updated to '+str.newStr);
					obj.set('action',action.replace(str.oldStr,str.newStr));
					changed = true;
				}
			});
			return changed;
		});
		checkForChangedCmds = true;
				
		return changedAbilities;
	}
	
	/*
	 * Handle editing all abilities in the campaign to change 
	 * 'oldStr' to 'newStr', with an optional confirmation 
	 * (default is to confirm every change).
	 */
	
	async function handleEditAbilities( args, firstFind ) {
		
		try {
			var oldStr = args[1],
				newStr = args[2],
				selected = args[3],
				changeNext = args[4],
				endOfSearch = true,
				dbVersion = /v\d+\.\d+/i,
				reOld;
			
			changeNext = (!(_.isUndefined(changeNext) || String(changeNext).toLowerCase() !== 'true'));
			selected = (_.isUndefined(selected) || String(selected).toLowerCase() !== 'false');
			
			if (!changeNext && !selected) {
				makeMsg('Cancelled','OK, cancelled');
				return;
			} else if (!changeNext && selected && !firstFind) {
				makeMsg('Skipping', 'OK, skipped that one');
			}
			
			newStr=parseStr(newStr).replace('$$','');
			oldStr=parseStr(oldStr);
			if (oldStr.endsWith('$$')) {
				oldStr=escapeRegExp(oldStr.replace('$$',''));
				reOld=new RegExp(oldStr+'\\)|'+oldStr+'$','img');
			} else {
				reOld=new RegExp(escapeRegExp(oldStr),'img');
			};

			filterObjs(function(obj){
				let changed = false;
				if (!changeNext && !selected) {return false;}
				if (obj.get('type') != 'ability') {return false;}
				let charID=obj.get('characterid');
				if (!charID) {return false;}
				let charCS=getObj('character',charID);
				if (!charCS) {return false;}
				let action=obj.get('action'),
					charName = charCS.get('name'),
					abilityName = obj.get('name');
				if (dbVersion.test(charName)) {
					dbVersion.test(''); //reset the test to start from beginning of next string
					return false;
				}
				if (reOld.test(action)) {
					reOld.test(''); //reset the test to start from the beginning of the next string;
					if (!changeNext && selected && !asked.includes(obj.id)) {
						makeCheckReplace( args, charName, abilityName );
						endOfSearch=false;
						selected = false;
						asked.push(obj.id);
						return changed;
					} else if (changeNext && !abilities.includes(obj.id)) {
						obj.set('action',action.replace(reOld,newStr));
						if (selected) {
							makeMsg('Changed Ability','Changed ability '+charName+' '+abilityName);
						} else {
							changedAbility += charName + ' ' + abilityName + ', ';
						}
						abilities.push(obj.id);
						changeNext = !selected;
						changed = true;
					} else if (!abilities.includes(obj.id)) {
						abilities.push(obj.id);
					}
				}
				return changed;
			});
			
			if (endOfSearch) {
				makeMsg('Finished','Finished changing abilities: '+changedAbility);
			}
					
			return;
		} catch (e) {
			sendCatchError('CommandMaster',null,e,'CommandMaster handleEditAbilities()');
		}
	}
		
	
	/*
	 * Handle setting ability macros selected in a menu 
	 * for all currently selected tokens.
	 */ 
	 
	var handleSetAbility = function( args, selected ) {
		
		var menuType = args[1],
			buttonName = args[2],
			api = args[3],
			action = args[4],
			ability = args[5],
			replaceAbility = args[6],
			cmdStr = parseCmd( api, action ).replace('$$',''),
			searchStr = new RegExp(escapeRegExp(cmdStr)+'\\s*\\)|'+escapeRegExp(cmdStr)+'\\s*$','img'),
			curToken, charCS,
			abilityObjs,
			charIDs = [];
			
		abilityObjs = findAbilities( api, action, selected );
		_.each( selected, s => charIDs.push(getObj('graphic',s._id).get('represents')));
		charIDs = charIDs.filter( c => !!c );
		
		if (abilityObjs && abilityObjs.length) {
			if (_.isUndefined(replaceAbility)) {
				makeAskReplace( args );
				return;
			}
			_.each(abilityObjs,function(obj) {
				if (replaceAbility.toLowerCase()!='skip') {
					obj.remove();
				} else {
					charIDs.splice(charIDs.indexOf(obj.get('characterid')),1);
				}
				return;
			});
		};
		if (_.isUndefined(replaceAbility) || replaceAbility.toLowerCase()=='replace') {
			_.each(charIDs,function(id) {
				setAbility( getObj('character',id), ability, cmdStr, true );
			});
		}
		abilities[buttonName]=true;
		args.shift();
		if (menuType != BT.AB_SILENT) makeAbilitiesMenu( args, selected );
		return;
	};
	
	/*
	 * Handle the setting of base saving throws based on 
	 * the level(s) of the character - best save wins
	 */
	 
	async function handleSetSaves( args, selected, senderId ) {
		
		try {
			var abMenu = args[1],
				setLevel = parseInt(args[2] || 0),
				raceMods,
				content = '&{template:'+fields.defaultTemplate+'}{{name=Set Base Saves}}'
						+ '{{=Based on their level(s) and race(s), base saves have been set to}}';
			
			_.each( selected, curToken => {
				
				var	tokenID = curToken._id,
					charCS = getCharacter( tokenID );
					
				if (!tokenID || !charCS) {return};
				
				var	tokenName = getObj('graphic',tokenID).get('name'),
					fighterLevel = attrLookup( charCS, fields.Fighter_level ) || 0,
					wizardLevel = attrLookup( charCS, fields.Wizard_level ) || 0,
					priestLevel = attrLookup( charCS, fields.Priest_level ) || 0,
					rogueLevel = attrLookup( charCS, fields.Rogue_level ) || 0,
					race = (attrLookup( charCS, fields.Race ) || 'human').dbName(),
					constitution = attrLookup( charCS, fields.Constitution ) || 0,
					monsterHD = parseInt(attrLookup( charCS, fields.Monster_hitDice )) || 0,
					monsterHPplus = parseInt(attrLookup( charCS, fields.Monster_hpExtra )) || 0,
					monsterIntField = attrLookup( charCS, fields.Monster_int ) || '',
					monsterIntNum = (monsterIntField.match(/\d+/)||["1"])[0],
					monsterInt = monsterIntField.toLowerCase().includes('non') ? 0 : monsterIntNum,
					monsterLevel = Math.ceil((monsterHD + Math.ceil(monsterHPplus/4)) / (monsterInt != 0 ? 1 : 2)),  // Calculation based on p65 of DMG
					warriorSaves = baseSaves.Warrior[saveLevels.Warrior[Math.min(Math.max(fighterLevel,monsterLevel),saveLevels.Warrior.length-1)]],
					wizardSaves = baseSaves.Wizard[saveLevels.Wizard[Math.min(wizardLevel,saveLevels.Wizard.length-1)]],
					priestSaves = baseSaves.Priest[saveLevels.Priest[Math.min(priestLevel,saveLevels.Priest.length-1)]],
					rogueSaves = baseSaves.Rogue[saveLevels.Rogue[Math.min(rogueLevel,saveLevels.Rogue.length-1)]],
					ppdSave = Math.min(warriorSaves[0],wizardSaves[0],priestSaves[0],rogueSaves[0]),
					rswSave = Math.min(warriorSaves[1],wizardSaves[1],priestSaves[1],rogueSaves[1]),
					ppSave = Math.min(warriorSaves[2],wizardSaves[2],priestSaves[2],rogueSaves[2]),
					bSave = Math.min(warriorSaves[3],wizardSaves[3],priestSaves[3],rogueSaves[3]),
					sSave = Math.min(warriorSaves[4],wizardSaves[4],priestSaves[4],rogueSaves[4]);
					
				if (_.isUndefined(raceSaveMods[race])) {
					raceMods = raceSaveMods.human;
				} else {
					raceMods = raceSaveMods[race];
				}

				setAttr( charCS, fields.Saves_monParalysis, ppdSave );
				setAttr( charCS, fields.Saves_monPoison, ppdSave );
				setAttr( charCS, fields.Saves_monDeath, ppdSave );
				setAttr( charCS, fields.Saves_monRod, rswSave );
				setAttr( charCS, fields.Saves_monStaff, rswSave );
				setAttr( charCS, fields.Saves_monWand, rswSave );
				setAttr( charCS, fields.Saves_monPetri, ppSave );
				setAttr( charCS, fields.Saves_monPolymorph, ppSave );
				setAttr( charCS, fields.Saves_monBreath, bSave );
				setAttr( charCS, fields.Saves_monSpell, sSave );
				setAttr( charCS, fields.Saves_paralysis, ppdSave - Math.floor(raceMods.par != 0 ? (constitution/raceMods.par) : 0) );
				setAttr( charCS, fields.Saves_poison, ppdSave - Math.floor(raceMods.poi != 0 ? (constitution/raceMods.poi) : 0) );
				setAttr( charCS, fields.Saves_death, ppdSave - Math.floor(raceMods.dea != 0 ? (constitution/raceMods.dea) : 0) );
				setAttr( charCS, fields.Saves_rod, rswSave - Math.floor(raceMods.rod != 0 ? (constitution/raceMods.rod) : 0) );
				setAttr( charCS, fields.Saves_staff, rswSave - Math.floor(raceMods.sta != 0 ? (constitution/raceMods.sta) : 0) );
				setAttr( charCS, fields.Saves_wand, rswSave - Math.floor(raceMods.wan != 0 ? (constitution/raceMods.wan) : 0) );
				setAttr( charCS, fields.Saves_petrification, ppSave - Math.floor(raceMods.pet != 0 ? (constitution/raceMods.pet) : 0) );
				setAttr( charCS, fields.Saves_polymorph, ppSave - Math.floor(raceMods.pol != 0 ? (constitution/raceMods.pol) : 0) );
				setAttr( charCS, fields.Saves_breath, bSave - Math.floor(raceMods.bre != 0 ? (constitution/raceMods.bre) : 0) );
				setAttr( charCS, fields.Saves_spell, sSave - Math.floor(raceMods.spe != 0 ? (constitution/raceMods.spe) : 0) );
				
				content += '{{'+tokenName+'=<table>'
						+ '<tr><td>[['+ppdSave+']]</td><td>vs. Paralysis, Poison & Death</td></tr>'
						+ '<tr><td>[['+rswSave+']]</td><td>vs. Rod, Staff & Wand</td></tr>'
						+ '<tr><td>[['+ppSave+']]</td><td>vs. Petrification & Polymorph</td></tr>'
						+ '<tr><td>[['+bSave+']]</td><td>vs. Breath</td></tr>'
						+ '<tr><td>[['+sSave+']]</td><td>vs. Spell</td></tr></table>}}';
			});
			content += '{{desc=[Return to Menu](!cmd --button '+abMenu+')}}';
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );

			return;
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	};
	
	/*
	 * Handle setting the visibility of the token name 
	 * to the Players, which effects how RoundMaster
	 * displays the token in the Turn Order and token 
	 * actions when it is their turn.
	 */
	 
	var handleTokenNameVisibility = function( args, selected ) {
		
		var cmd = args[0],
			abMenu = args[1],
			playerID = args[3] || '',
			tokens = [];
		
		_.each( selected, sel => {
			let curToken = getObj('graphic',sel._id);
			curToken.set('showplayers_name',(cmd == BT.AB_PC));
			curToken.set('showplayers_bar3',(cmd == BT.AB_PC));
			let charCS = getObj('character',curToken.get('represents'));
			if (charCS) {
				charCS.set('controlledby',playerID);
				charCS.set('inplayerjournals',playerID);
			}
			tokens.push(curToken.get('name'));
		});
		tokens.filter(t => !!t).sort();
		sendFeedback('&{template:'+fields.defaultTemplate+'}'
					+'{{name=Token Ownership}}'
					+'{{desc=The following tokens are now '+(cmd == BT.AB_PC ? 'Player' : 'DM')+' controlled}}'
					+'{{desc1='+tokens.join(', ')+'}}'
					+'{{desc2=[Return to menu](!cmd --button '+abMenu+')}}',flags.feedbackName,flags.feedbackImg);
		return;
	};
	
	/*
	 * Handle the selection of the default values for the token bars 
	 */
	 
	async function handleSetDefaultBars( args, selected, senderId ) {
	
		try {
			if (!args) args = [];
			if (!selected) selected = [];

			var cmd = args[0] || '',
				abMenu = args[1] || BT.AB_SIMPLE,
				tokenID = (selected && selected.length ? selected[0]._id : ''),
				primaryFields = [fields.AC[0],fields.Thac0_base[0],fields.HP[0]],
				curToken, charCS;
				
			var getBarName = function( token, charCS, bar, setBar=false ) {
				var nameObj = getObj('attribute',token.get(bar+'_link')),
					name;
				if (!!nameObj) {
					name = nameObj.get('name');
					primaryFields = primaryFields.filter( f => f !== name );
				} else {
					name = primaryFields.shift() || '';
					nameObj = attrLookup( charCS, [name,null] );
					if (!!nameObj && setBar) {
						token.set(bar+'_link',nameObj.id);
						token.set(bar+'_value',nameObj.get('current'));
						if (name === fields.HP[0]) token.set(bar+'_max',nameObj.get('max'));
					};
				};
				return name;
			};
			
			curToken = getObj('graphic', tokenID);
			charCS = getCharacter(tokenID);
			if (!charCS) {
				sendFeedback( '&{template:'+fields.warningTemplate+'}{{name=No token selected}}{{desc=You need to select a token that has its bar values set to those you want as defaults. '
							+ 'Select the token and set the bars as you want now, and then rerun this command. In order for RPGMaster magical effects to work best (especially for spells '
							+ 'vs. creature mobs) **it is recommended to map bars to AC, Thac0_base, and HP** so that the Players & DM see the effect of magic that affects these values on the token.}}'
							+ '{{desc1=[Return to Token Mgt menu](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+abMenu+')}}');
				return;
			};
			if (!(curToken.get('bar1_link') || curToken.get('bar2_link') || curToken.get('bar3_link'))) {
				sendFeedback( '&{template:'+fields.warningTemplate+'}}{{name=Unlinked token bars}}{{desc=This token does not have any bars linked to Character Sheet fields. Please link '
							+ 'one or more of the token bars to show how you want the default mappings to be.  In order for RPGMaster spell effects to work best (especially for spells vs. creature mobs) '
							+ '**it is recommended to map bars to AC, Thac0_base, and HP** so that the Players & DM see the effect of magic that affects these values on the token.}}'
							+ '{{desc1=[Return to Token Mgt menu](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+abMenu+')}}');
				return;
			};
			if (cmd === BT.AB_ASK_TOKENBARS) {
				sendFeedback( '&{template:'+fields.defaultTemplate+'}{{name=Set Default Token Bars}}'
							+ '{{desc=You are about to set the default token bars to:\n'
							+ '<span style="color:green">Bar1 (green)</span> = '+getBarName( curToken, charCS, 'bar1' )+'\n'
							+ '<span style="color:blue">Bar2 (blue)</span> = '+getBarName( curToken, charCS, 'bar2' )+'\n'
							+ '<span style="color:red">Bar3 (red)</span> = '+getBarName( curToken, charCS, 'bar3' )+'}}'
							+ '{{desc1=This is based on the selected token, with any unlinked bars set to recommended values. In order for RPGMaster magical effects to work best (especially for spells '
							+ 'vs. creature mobs) **it is recommended to map bars to AC, Thac0_base, and HP** so that the Players & DM see the effect that magic has on these values on the token. '
							+ 'HP is affected by powers such as *Rage*, AC and Thac0 by spells like *Bless* and *Prayer* and conditions such as *Blindness*. In a mob, some tokens may be affected, and '
							+ 'others not affected: in this case clear token bar links but with values of default attributes set in respective token circles.}}'
							+ '{{desc2=[Set default bars](!cmd --button '+BT.AB_SET_TOKENBARS+'|'+abMenu+') or [Return to Menu](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+abMenu+')}}' );
				return;
			}
			
			if (cmd === BT.AB_RESET_TOKENBARS) {
				curToken.set('bar1_link','');
				curToken.set('bar2_link','');
				curToken.set('bar3_link','');
			};
										
			state.RPGMaster.tokenFields[0] = getBarName( curToken, charCS, 'bar1', true );
			state.RPGMaster.tokenFields[1] = getBarName( curToken, charCS, 'bar2', true );
			state.RPGMaster.tokenFields[2] = getBarName( curToken, charCS, 'bar3', true );

			makeTokenBarDisplay(tokenID,abMenu);
		} catch (e) {
			sendCatchError('CommandMaster',msg_orig[senderId],e);
		}
	}

	/*
	 * Handle changing the token bars/circles to the
	 * standard used by the APIs, or all to None, as 
	 * selected by the user 
	 */
	 
	var handleSetTokenBars = function( args, selected, senderId, silent=false ) {
		
		var cmd = args[0],
			abMenu = args[1],
			content = '',
			allTokens = false,
			names = [],
			linked = '',
			not = '',
			setCmd = BT.AB_TOKEN_SET_ALL;
			
		var setBars = function(cmd, senderId, content, token, allTokens, silent) {
			return new Promise(resolve => {
				try {
					var tokenID = token._id || token.id,
						curToken = getObj('graphic',tokenID),
						charCS = getCharacter(tokenID);
						
					if (charCS) {
						let bar1obj, bar2obj, bar3obj;
						
						if (cmd === BT.AB_TOKEN_SET_LINKED) {
							if (!(curToken.get('bar1_link') || curToken.get('bar2_link') || curToken.get('bar3_link'))) return;
						}
						let AC = attrLookup(charCS,[fields.AC[0],null]),
							thac0 = attrLookup(charCS,[fields.Thac0_base[0],null]),
							HP = attrLookup(charCS,[fields.HP[0],null]),
							monsterACval = parseInt(attrLookup(charCS,fields.MonsterAC)),
							ACval = parseInt(attrLookup(charCS,fields.AC)),
							thac0val = parseInt(attrLookup(charCS,fields.Thac0)),
							monsterThac0val = parseInt(attrLookup(charCS,fields.MonsterThac0)),
							baseThac0val = parseInt(attrLookup(charCS,fields.Thac0_base));

						if (isNaN(ACval) || String(ACval).trim() == '') ACval = 10;
						if (isNaN(monsterACval) || String(monsterACval).trim() == '') monsterACval = 10;
						if (isNaN(thac0val) || String(thac0val).trim() == '') thac0val = 20;
						if (isNaN(monsterThac0val) || String(monsterThac0val).trim() == '') monsterThac0val = 20;
						if (isNaN(baseThac0val) || String(baseThac0val).trim() == '') baseThac0val = 20;

						ACval = (!ACval || !monsterACval) ? (ACval + monsterACval) : Math.min(monsterACval,ACval);
						thac0val = Math.min(monsterThac0val,thac0val,baseThac0val,handleGetBaseThac0( charCS ));

						if (AC) {
							AC.set('current',ACval);
						} else {
							AC = createObj('attribute', {characterid:charCS.id, name:fields.AC[0], current:ACval});
						}
						if (thac0) {
							thac0.set('current',thac0val);
						} else {
							thac0 = createObj('attribute', {characterid:charCS.id, name:fields.Thac0_base[0], current:thac0val});
						}
						if (!HP) HP = createObj('attribute', {characterid:charCS.id, name:fields.HP[0], current:1, max:1});
						
						setAttr(charCS,fields.Thac0,thac0val);
					
						bar1obj = attrLookup( charCS, [(state.RPGMaster.tokenFields[0]||''), null] ),
						bar2obj = attrLookup( charCS, [(state.RPGMaster.tokenFields[1]||''), null] ),
						bar3obj = attrLookup( charCS, [(state.RPGMaster.tokenFields[2]||''), null] );

						if (cmd !== BT.AB_TOKEN_SET_ALL || curToken.get('bar1_link') || curToken.get('bar2_link') || curToken.get('bar3_link')) {
							curToken.set('bar1_link',((!!bar1obj && cmd !== BT.AB_TOKEN_NONE) ? bar1obj.id : ''));
							curToken.set('bar2_link',((!!bar2obj && cmd !== BT.AB_TOKEN_NONE) ? bar2obj.id : ''));
							curToken.set('bar3_link',((!!bar3obj && cmd !== BT.AB_TOKEN_NONE) ? bar3obj.id : ''));
						}

						curToken.set({bar1_value:(!!bar1obj ? bar1obj.get('current') : ''),bar1_max:(!!bar1obj ? bar1obj.get('max') : '')});
						curToken.set({bar2_value:(!!bar2obj ? bar2obj.get('current') : ''),bar2_max:(!!bar2obj ? bar2obj.get('max') : '')});
						curToken.set({bar3_value:(!!bar3obj ? bar3obj.get('current') : ''),bar3_max:(!!bar3obj ? bar3obj.get('max') : '')});

						if (!allTokens && !silent) names.push(curToken.get('name'));
						sendAPI( '!attk --check-ac '+tokenID+'|silent' );
						
						setDefaultTokenForCharacter(charCS,curToken);
					}
				} catch (e) {
					sendCatchError('CommandMaster',(senderId ? msg_orig[senderId] : null),e,'CommandMaster handleSetTokenBars()');
				} finally {
					setTimeout(() => {
						resolve(content);
					}, 10);
				}
			});
		};
		
		async function awaitSetBars(cmd, senderId, content, token, allTokens, silent) {
			return await setBars( cmd, senderId, content, token, allTokens, silent );
		}

		if (cmd === BT.AB_TOKEN_ASK_LINKED) {
			linked = 'linked ';
			not = 'not ';
			setCmd = BT.AB_TOKEN_SET_LINKED;
		}
			
		if (cmd === BT.AB_TOKEN_ASK_ALL || cmd === BT.AB_TOKEN_ASK_LINKED) {
			content = '&{template:'+fields.warningTemplate+'}{{name=Setting Token Circles}}'
					+ '{{desc=You have requested to set the token bars of ***All '+linked+'Tokens***, '+not+'including those of mobs (i.e. multiple tokens linked to a single character sheet which normally '
					+ 'do not have linked token bars) to the token bar defaults currently set. Is this what you want to do?}}'
					+'{{desc1=[Yes Please](!cmd --button '+setCmd+'|'+abMenu+') or [No, I don\'t want to do that!](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+abMenu+')}}';
			sendFeedback(content);
			return;
		}
		
		if (!silent) {
			content = '&{template:'+fields.defaultTemplate+'}{{name=Setting Token Circles}}';
			if (cmd === BT.AB_TOKEN_NONE) {
				content += '{{desc=Bar 1, 2 & 3 links set to \"None\"\n'
						+  '<span style="color:green">Bar1 (green)</span> value set to '+state.RPGMaster.tokenFields[0]+'\n'
						+  '<span style="color:blue">Bar2 (blue)</span> value set to '+state.RPGMaster.tokenFields[1]+'\n'
						+  '<span style="color:red">Bar3 (red)</span> value set to '+state.RPGMaster.tokenFields[2]+'\n}}'
						+  '{{desc1=This is best for multi-token Character Sheets e.g. Creature mobs. Most spells will work on mobs where part of the mob is in the area of effect, but not all (e.g. *haste* and *slow*)}}';
			} else {
				content += '{{desc=<span style="color:green">Bar1 (green)</span> linked to '+state.RPGMaster.tokenFields[0]+'\n'
						+  '<span style="color:blue">Bar2 (blue)</span> linked to '+state.RPGMaster.tokenFields[1]+'\n'
						+  '<span style="color:red">Bar3 (red)</span> linked to '+state.RPGMaster.tokenFields[2]+'}}'
						+  '{{desc1=Linking token bars to the character sheet is the preferred setting for PCs, NPCs & creatures. 1-to-1 mapping of tokens and character sheets supports full magical & spell effects.}}';
			}
		};
		
		if (cmd === BT.AB_TOKEN_SET_ALL || cmd === BT.AB_TOKEN_SET_LINKED) {
			selected = findObjs({type:'graphic',subtype:'token'});
			allTokens = true;
			content += '{{desc2=For all tokens';
			if (cmd === BT.AB_TOKEN_SET_LINKED) content += ' with linked bars';
			content += '}}';
			if (silent) sendWait(findTheGM(),0);
		}
		
		_.each( selected, token => {
			content += awaitSetBars( cmd, senderId, content, token, allTokens, silent );
		});
		if (!silent) {
			if (names.length) content += '{{desc8=**Tokens updated**\n' + names.sort().join(', ') + '}}';
			content += '{{desc9=[Return to Menu](!cmd --button '+BT.AB_MANAGE_TOKEN+'|'+abMenu+')}}';
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		}
		return;
	};
	
	/*
	 * Handle switching char sheet control between DM & Players
	 */
	 
	var handleSetCSctrl = function( args, senderId ) {
		
		var charID = args[1],
			playerID = args[2] || '',
			charCS = getObj('character',charID),
			tokens = findObjs({type:'graphic',subtype:'token',represents:charID});
		
		charCS.set('inplayerjournals',playerID);
		charCS.set('controlledby',playerID);
		_.each(tokens,t => t.set('showplayers_name',!!playerID));
		
		doCheckCharSetup(senderId);
	};
	
	/* 
	 * Handle changing all illegal character and token names to valid ones
	 */
	 
	var handleChangeAllNames = function( args ) {
		
		_.each( findObjs({type:'character'}), o => {
			let name = o.get('name');
			if (name && reInvalid.test(name)) {
				o.set('name',name.replace(reInvalid,''));
			};
		});
		_.each( findObjs({type:'graphic'}), o => {
			let name = o.get('name');
			if (name && reInvalid.test(name)) {
				o.set('name',name.replace(reInvalid,''));
			};
		});
		makeCheckNamesMenu( ['',''] );
		return;
	}
		
	/*
	 * Handle changing a name that has been found to be illegal
	 */
	
	var handleChangeObjName = function( args ) {
		
		if (args[2] != 'player') {
			let obj = getObj(args[2],args[3]);
			if (obj) {
				obj.set(args[4],args[0].replace(reInvalid,''));
			}
		}
		makeCheckNamesMenu( args );
		return;
	}
		
	/*
	 * Change the stored images for a trapped/locked container
	 */
	 
	var handleChangeImages = function( args, selected, senderId ) {
		
		if (!args) return;

		var cmd = args[0],
			tokenID = args[1],
			imgType = args[2] || 'closed-img',
			value = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError( 'Invalid container token specified for setting the '+imgType+' image for a trapped / locked container', msg_orig[senderId] );
			return;
		};
		if (!selected || !selected.length) {
			sendFeedback( '&{template:'+fields.warningTemplate+'}{{title=Setting '+imgType+'}}{{desc=You must have an image token selected when setting the '+imgType+' image for a trapped / locked container}}');
			return;
		};
		
		var	curToken = getObj('graphic',selected[0]._id),
			curImg = !!curToken ? curToken.get('imgsrc') : (imgType === 'open-img' ? design.open_img : (imgType === 'closed-img' ? design.closed_img : '')),
			storeMsg = 'The stored '+imgType+' for the trapped / locked container '+charCS.get('name')+' has been successfully changed';
			
		if (imgType.includes('img')) {
			if (curImg.includes('marketplace')) {
				sendFeedback(messages.imgMsg);
				storeMsg = 'Marketplace image selected: unable to use this image';
			} else {
				setAttr( charCS, [imgType,'current'], getCleanImgsrc(curImg) );
				setAttr( charCS, [imgType,'max'], curToken.get('rotation') );
				setAttr( charCS, [imgType+'-size','current'], curToken.get('width') );
				setAttr( charCS, [imgType+'-size','max'], curToken.get('height') );
			}
		} else {
			setAttr( charCS, [imgType,'current'], value );
		};

		args.shift();
		makeChangeImagesMenu( args, senderId, storeMsg);
		return;
	}
	
// ------------------------------------------------------------- Command Action Functions ---------------------------------------------

	/**
	 * Show help message
	 */ 

	var showHelp = function() {
		var handoutIDs = getHandoutIDs();
		var content = '&{template:'+fields.defaultTemplate+'}{{title=CommandMaster Help}}{{CommandMaster Help=For help on using CommandMaster, and the !cmd commands, [**Click Here**]('+fields.journalURL+handoutIDs.CommandMasterHelp+')}}{{Class Database=For help on using and adding to the Class Database, [**Click Here**]('+fields.journalURL+handoutIDs.ClassRaceDatabaseHelp+')}}{{Character Sheet Setup=For help on setting up character sheets for use with RPGMaster APIs, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterCharSheetSetup+')}}{{RPGMaster Templates=For help using RPGMaster Roll Templates, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterLibraryHelp+')}}';

		sendFeedback(content,flags.feedbackName,flags.feedbackImg); 
	};
	
	/*
	 * Register an API with CommandMaster, including specs of 
	 * any commands the API wants made available as Ability macro 
	 * character sheet action buttons.  CommandMaster will compare the 
	 * command syntax with others registered, now and historically, and 
	 * raises any issues with duplication.  If the command syntax has 
	 * changed since the last registration, CommandMaster attempts to 
	 * check all Ability macros and update them.
	 *
	 *	!cmd --register action|Some text explaining action|api-call|api-command|cmd parameters separated by %%replace same chars as ChatSetAttr%%`{selected|token_id}%%`{target|Something|etc1}%%;{etc2}%%...
	 *
	 *	Replace @=`, ?=;, -=~, [=<, ]=>
	 */
	 
	var doRegistration = function(argStr='') {
		
		if (!parsedCmds) {
			parseStoredCmds( state.CommandMaster.cmds );
		}
	
		var args = argStr.split('|');
		if (!args || args.length < 4) {
			sendDebug('doRegistration: Invalid number of arguments');
			sendError('Invalid CommandMaster syntax');
			return;
		};
		
		var action = args.shift(),
			desc = args.shift(),
			api = args.shift(),
			cmd = args.shift(),
			newParams = args.join('|').replace(/%%/g,'|'),
			cmdObj = [];

		registeredAPI[api] = true;

		[cmdObj,registeredCmds] = _.partition(registeredCmds,obj => ((obj.api == api) && (obj.action == action)));
		
		if (!_.isUndefined(cmdObj) && cmdObj.length) {
			cmdObj = cmdObj[0];
			cmdObj.desc = desc;
			cmdObj.changed = (cmdObj.params != newParams) || (cmdObj.cmd != cmd);
			if (cmdObj.changed) {
				log('doRegistration registeredCmds['+api+']['+action+'] changed');
				if (!_.isUndefined(cmdObj.params)) {
					cmdObj.oldCmdStr = parseStr('!'+cmdObj.api+' '+cmdObj.cmd+' '+cmdObj.params);
				}
				cmdObj.params = newParams;
				cmdObj.cmd = cmd;
				state.CommandMaster.cmds[cmdObj.key] = argStr.replace(/%%/g,'|');
			}
		} else {
			cmdObj = {
				action:		action,
				desc:		desc,
				api:		api,
				cmd:		cmd,
				params:		newParams,
				oldCmdStr:	'',
				key:		(state.CommandMaster.cmds.length || 0),
				changed:	false,
			};
			state.CommandMaster.cmds.push(argStr.replace(/%%/g,'|'));
		};
		
		registeredCmds.push(cmdObj);
		
		if (checkForChangedCmds) {
			handleChangedCmds();
		}
		
		return cmdObj.changed;
	};

	/*
	 * Do Initialisation of the Campaign to work with the 
	 * Master series APIs
	 */
	 
	var doInitialise = function(senderID) {
		
		var macro, newMacro, player;

		macro = findObjs({ type: 'macro', name: 'Maint-Menu'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Maint-Menu',action:'!init --maint',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Token-setup'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Token-setup',action:'!cmd --abilities',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Add-Items'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Add-Items',action:'!magic --gm-edit-mi @{selected|token_id}',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'End-of-Day'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'End-of-Day',action:'!init --end-of-day',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Initiative-menu'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Initiative-menu',action:'!init --init',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Check-tracker'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Check-tracker',action:'!init --check-tracker',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Config-RPGM'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Config-RPGM',action:'!magic --config',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Reset-Chest'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			newMacro = createObj('macro',{name:'Reset-Chest',action:'%{selected|Reset}',playerid:senderID});
		}
		if (!!newMacro) {
			player = findObjs({ type: 'player', id: senderID });
			if (player && player[0]) {
				player[0].set('showmacrobar',true);
			} else {
				log('doInitialise: player not found');
			}
			sendFeedback(messages.initMsg,flags.feedbackName,flags.feedbackImg);
		}
		return;
	}

	/*
	 * Display a menu of ability button options
	 */
 
	var doAbilityMenu = function(args, selected, senderId) {
		
		if (!selected || !selected.length) return;
		var tokenID = selected[0]._id,
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError('The selected token does not represent a character sheet',msg_orig[senderId]);
			return;
		};
		if ((attrLookup( charCS, fields.Gender ) || '').toLowerCase() === 'container') {
			doChangeImages( args, selected, senderId );
		} else {
			abilities = [];
			updateDBindex(true);  // Update the database indexes to speed up item searches
			
			args.unshift(BT.AB_SIMPLE);
			makeAbilitiesMenu(args,selected);
		};
		return;
	}
	
	/*
	 * Display a menu of spells to add to spellbooks of the 
	 * selected characters
	 */
 
	var doAddSpells = function(args, selected, senderId) {
		
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			if (!args || args.length < 1) {
				args[0] = 'MUSPELLS';
			};
			
			makeSpellsMenu(args, selected, senderId);
		}
		return;
	}
	
	/*
	 * Set a weapon proficiency to a specified level
	 */
	
	var doSetProf = function(args, selected) {
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			handleAddProf(args, selected);
		}
		return;
	}
	
	/*
	 * Set all owned weapons proficiency as proficient
	 */
	
	var doSetAllProf = function(args, selected, senderId) {
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			handleAddAllProfs(args, selected,senderId);
		}
		return;
	}
	
	/*
	 * Display a menu of weapon proficiencies to 
	 * add to the selected characterSet
	 */
	 
	var doAddProfs = function(args, selected, senderId) {
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			makeProficienciesMenu(args, selected, senderId, '');
		}
		return;
	}

	/*
	 * Change one string for another in all ability macros 
	 * on all character sheets.  You are asked to confirm the 
	 * change, though there is a button to then make the change
	 * to all abilities without asking.
	 */

	var doEditAbilities = function(args) {
		if (!args || args.length < 2) {
			sendDebug('doEditAbilities: Invalid number of arguments');
			sendError('Invalid CommandMaster syntax');
			return;
		};
		
		abilities = [];
		asked = [];
		changedAbility = '';
		
		args.unshift(BT.STR_REPLACE);
		args[3] = true;
		args[4] = false;
		handleEditAbilities( args, true );
		return;
	}
	
	/*
	 * Check all Character Sheets to assess if a PC, NPC, or Creature, and 
	 * whether DM or Player controlled.  Provide the DM with lists of the 
	 * analysis & the options to correct errors.
	 */
	 
	async function doCheckCharSetup(senderId) {
		
		try {
			var dmCtrl			= [],
				playerCtrl		= [],
				allCtrl			= [],
				playerCreature	= [],
				content = '',
				players = [],
				makeButton = function( text, cmd, selected=false ) {
							return ((selected ? ('<span style='+design.selected_button+'>') : '[')
								+ text
								+ (selected ? '</span>' : (']('+cmd+')')));
				};
			
			filterObjs( function(obj) {
				if (obj.get('type') == 'player') {
					players.push(obj.get('_displayname')+','+obj.id);
					return;
				}
				if (obj.get('type') != 'character') return false;
				let name = obj.get('name');
				let level = characterLevel(obj);
				if (!level) return;
				let creature = !!parseInt((attrLookup( obj, fields.Monster_hitDice ) || 0),10);
				let pc = obj.get('controlledby').split(',');
				let allPlayers = pc.includes('all');
				let player = pc && (pc.length > 1 || pc[0].length);
				if (!player) dmCtrl.push([name,obj.id]);
				if (!creature && player && !allPlayers) playerCtrl.push([name,obj.id]);
				if (allPlayers) allCtrl.push([name,obj.id]);
				if (creature && player) playerCreature.push([name,obj.id]);
			});
			players.push('All,all');
			
			content = '&{template:'+fields.defaultTemplate+'}{{name=Character Check}}'
					+ '{{=Listed below are the PC, NPC & Creature Character Sheets in this Campaign, and who controls them.\n'
					+ 'Only Character Sheets with a Character Class, Level or Monster Hit Dice are displayed.\n'
					+ 'Review and correct any using the buttons provided}}'
					+ '{{DM controlled=If wrong, click to add a Player to control.\n';
			_.each( dmCtrl, name => content += makeButton(name[0],'!cmd --button '+BT.PLAYER_CTRL+'|'+name[1]+'|&#63;{Which Player should control '+name[0]+'?|'+players.join('|')+'}'));
			content +='}}{{Player controlled PCs & NPCs=If wrong, click to make DM controlled\n';
			_.each( playerCtrl, name => content += makeButton(name[0],'!cmd --button '+BT.CLEAR_CTRL+'|'+name[1]));
			content +='}}{{Player controlled creatures=If wrong, click to make DM controlled.\n';
			_.each( playerCreature, name => content += makeButton(name[0],'!cmd --button '+BT.CLEAR_CTRL+'|'+name[1]));
			content +='}}{{Controlled by everyone=*Unusual characters - **something possibly wrong**. Click to make DM controlled*\n';
			_.each( allCtrl, name => content += makeButton(name[0],'!cmd --button '+BT.CLEAR_CTRL+'|'+name[1]));
			content +='}}{{desc=['+(state.CommandMaster.CheckChar ? 'Do not show' : 'Show')+' on start-up](!cmd --button '+BT.SWITCH_CS_CHECK+')'
					+ (!state.CommandMaster.CheckChar ? ' Otherwise, access this menu via Token-Setup' : '')+'}}';

			sendFeedback(content,flags.feedbackName,flags.feedbackImg);
			return;
		} catch (e) {
			sendCatchError('CommandMaster',(senderId ? msg_orig[senderId] : null),e,'CommandMaster doCheckCharSetup()');
		}
	};	

	/*
	 * Display a menu of available classes and allow the user to 
	 * review and/or change those shown
	 */

	var doChooseClass = function(args, selected, senderId, isGM) {
		
		var curToken = getObj('graphic',args[0]);
		
		if (curToken) {
			selected = [{_id:args[0]}]
		}
		makeClassMenu(args,selected,senderId,isGM);
		return;
	};
	
	/*
	 * Reset a chest to its original closed condition
	 */
	 
	var doResetChest = function(args, selected, senderId, isGM) {
		
		var tokenID = args[0],
			chestToken = getObj('graphic',tokenID),
			chestCS = getCharacter(tokenID);
			
		if (!chestCS) {
			sendError('The token you requested to reset is not a valid container',msg_orig[senderId]);
			return;
		}
		handleClassSelection( [BT.CONTAINER,'','',tokenID], selected, senderId, isGM );

		let defImg = design.closed_img.split('|'),
			img = attrLookup(chestCS,fields.Token_closedImg) || defImg[0],
			width = attrLookup(chestCS,fields.Token_closedImgW) || defImg[1] || 70,
			height = attrLookup(chestCS,fields.Token_closedImgH) || defImg[2] || width;

		if (chestToken) {
			chestToken.set('width',parseInt(width));
			chestToken.set('height',parseInt(height));
			chestToken.set('imgsrc',getCleanImgsrc(img) );
		}
		setAttr(chestCS,fields.ItemContainerType,4);
		sendWait(senderId,0);
		return;
	}
	
	/*
	 * Copy an image from one token to another
	 */
	 
	var doCopyImage = function( args, selected, senderId ) {
		
		if (!args) return;
		
		var toObj = getObj('graphic',args[0]),
			fromObj = getObj('graphic',args[1]) || getObj('graphic',selected[0]._id);
			
		if (!fromObj || !toObj) {
			sendError( 'Invalid token(s) selected for token image copy. Select the token to receive the new image, use the "Token Setup" command, select the token to take the image from, and then execute the copy command.', msg_orig[senderId] );
			return;
		}
		
		var fromImg = fromObj.get('imgsrc').toLowerCase();
		if (fromImg.includes('marketplace')) {
			sendFeedback(messages.imgMsg);
//			sendFeedback('&{template:'+fields.warningTemplate+'}{{name=Can\'t Copy Marketplace Image}}{{desc=Unfortunately, it is not possible to use a token image quick copy to copy an image from a token with a marketplace image. Please select a token with an image from your own image library.}}');
			return;
		}
		toObj.set('imgsrc',getCleanImgsrc(fromObj.get('imgsrc')));
		toObj.set('width',fromObj.get('width'));
		toObj.set('height',fromObj.get('height'));
		
		var charCS = getCharacter(args[0]);
		if (charCS) {
			setDefaultTokenForCharacter( charCS, toObj );
		}
		return;
	};

	
	/*
	 * Present a menu from which the GM can give a 
	 * trapped / locked container new images to use
	 */
	 
	var doChangeImages = function( args, selected, senderId ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		};
		if (!getCharacter(args[0])) {
			sendError( 'Invalid token selected for setting the '+imgType+' image for a trapped / locked container', msg_orig[senderId] );
		} else {
			makeChangeImagesMenu( args, senderId );
		};
		return;
	}
	
	/*
	 * Display a menu of token bar management buttons
	 */
	 
	var doManageTokenBars = function( args ) {
		makeMngTokenBarsMenu( args );
	}
	
	/*
	 * Display a menu to convert the spells on a legacy character sheet
	 * to a format suitable for use with the APIs
	 */
	 
	var doConvertSpells = function( args, selected, senderId ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		}
		var tokenID = args[0],
			doIt = (args[1] || '') === 'true',
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendFeedback( '&{template:'+warningTemplate+'}{{name=Invalid Token}}{{desc=No token selected or the token does not have an associated Character Sheet}}' );
			return;
		}
		if (!doIt) {
			sendFeedback(messages.convMsg + '{{Section2=Do you wish to continue?\n[Yes Please](!cmd --conv-spells '+args[0]+'|true) or [No I don\'t want to do this!](!cmd --abilities)}}');
		} else {
//			sendFeedback( messages.waitMsg );
			setTimeout( () => {
				spells2Convert( args, selected );
				makeConvertSpellsMenu( [], selected, senderId );
			}, 50);
		};
	};
	
	/*
	 * Display a menu to convert the spells on a legacy character sheet
	 * to a format suitable for use with the APIs
	 */
	 
	var doConvertItems = function( args, selected, senderId ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		}
		var tokenID = args[0],
			doIt = (args[1] || '') === 'true',
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendFeedback( '&{template:'+warningTemplate+'}{{name=Invalid Token}}{{desc=No token selected or the token does not have an associated Character Sheet}}' );
			return;
		}
		if (!doIt) {
			sendFeedback(messages.convMsg + '{{Section2=Do you wish to continue?\n[Yes Please](!cmd --conv-items '+args[0]+'|true) or [No I don\'t want to do this!](!cmd --abilities)}}');
		} else {
//			sendFeedback( messages.waitMsg );
			setTimeout( () => {
				makeConvertItemsMenu( [], selected, senderId );
			}, 50);
		};
	};
	
	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, isGM, selected, senderId ) {
		
		if (! args || args.length < 1) {
			sendDebug('doButton: Invalid number of arguments');
			sendError('Invalid CommandMaster syntax');
			return;
		};
		
		var	handler = args[0];
			
		switch (handler.toUpperCase()) {

		case BT.ABILITY :
		case BT.AB_REPLACE :
		
			handleSetAbility( args, selected );
			break;
			
		case BT.AB_SIMPLE :
		case BT.AB_FULL :
		
			makeAbilitiesMenu( args, selected );
			break;
			
		case BT.AB_PC :
		case BT.AB_DM :

			handleTokenNameVisibility( args, selected );
			break;
			
		case BT.AB_CLASSES :
		
			makeClassMenu( args, selected, senderId, isGM );
			break;
			
		case BT.AB_SAVES :
		
			handleSetSaves( args, selected, senderId );
			break;
			
		case BT.AB_ASK_TOKENBARS :
		case BT.AB_SET_TOKENBARS :
		case BT.AB_RESET_TOKENBARS :
		
			handleSetDefaultBars( args, selected, senderId );
			break;

		case BT.AB_MANAGE_TOKEN :

			makeMngTokenBarsMenu( args, selected );
			break;
			
		case BT.AB_TOKEN :
		case BT.AB_TOKEN_NONE :
		case BT.AB_TOKEN_SET_LINKED :
		case BT.AB_TOKEN_SET_ALL :
		case BT.AB_TOKEN_ASK_LINKED :
		case BT.AB_TOKEN_ASK_ALL :
		
			handleSetTokenBars( args, selected, senderId );
			break;
			
		case BT.STR_REPLACE:
		
			handleEditAbilities( args, false );
			break;
			
		case BT.PLAYER_CTRL:
		case BT.CLEAR_CTRL:
		
			handleSetCSctrl( args, senderId );
			break;
			
		case BT.SWITCH_CS_CHECK:
		
			state.CommandMaster.CheckChar = !state.CommandMaster.CheckChar;
			doCheckCharSetup( senderId );
			break;
			
		case BT.ALL_PRSPELLS:
		
			handleAddAllPRspells( args, selected, senderId );
			break;
			
		case BT.ALL_POWERS:
		
			handleAddAllPowers( args, 'PW', selected, senderId );
			break;
			
		case BT.CLASS_F:
		case BT.CLASS_W:
		case BT.CLASS_P:
		case BT.CLASS_R:
		case BT.CLASS_PSI:
		case BT.LEVEL_F:
		case BT.LEVEL_W:
		case BT.LEVEL_P:
		case BT.LEVEL_R:
		case BT.LEVEL_PSI:
		case BT.RACE:
		case BT.CREATURE:
		case BT.CONTAINER:
		case BT.CREATURE_CKD:
		case BT.CONTAINER_CKD:
		case BT.RESET_CONTAINER:
		
			handleClassSelection( args, selected, senderId, isGM );
			break;
			
		case BT.LOCKTYPE:
		case BT.TRAPTYPE:
		
			handleChangeLockOrTrap( args, senderId );
			break;

		case BT.REVIEW_CLASS:
		case BT.REVIEW_RACE:
		
			makeClassReviewDialogue( args, selected, isGM );
			break;
			
		case BT.TOKEN_IMG:
		
			handleChangeImages( args, selected, senderId );
			break;
			
		case BT.CHANGE_NAME:
		
			args.shift();
			handleChangeObjName( args );
			break;
			
		case BT.STOREITEM:
		
			convertItems( args );
			break;
			
		case BT.SPELLCONV_MENU:
		case BT.FROMSPELL:
		case BT.TOSPELL:
		case BT.CONVSPELL:
		
			makeConvertSpellsMenu( args, selected, senderId );
			break;
			
		case BT.REVIEW_SPELL:
		
			handleConvSpellReview( args );
			break;
			
		case BT.ITEMCONV_MENU:
		case BT.FROMITEM:
		case BT.TOITEM:
		case BT.STORE_ITEM:
		
			makeConvertItemsMenu( args, selected, senderId );
			break;
			
		case BT.REVIEW_ITEM:
		
			handleConvItemReview( args );
			break;
			
		case 'MUSPELLS':
		case 'PRSPELLS':
		case 'POWERS':
		case 'CHOOSE_MUSPELLS':
		case 'CHOOSE_PRSPELLS':
		case 'CHOOSE_POWERS':
		
			makeSpellsMenu( args, selected, senderId );
			break;
			
		case 'REV_MUSPELLS':
		case 'REV_PRSPELLS':
		case 'REV_POWERS':
		
			handleReviewSpell( args );
			break;
			
		case 'ADD_MUSPELLS':
		case 'ADD_PRSPELLS':
		case 'ADD_POWERS':
		
			handleAddSpell( args, selected, senderId );
			break;
			
		case 'CHOOSE_PROF':
		
			handleChooseProf( args, selected, senderId );
			break;
			
		case 'REVIEW_PROF':
		case BT.REVIEW_STYLE:
			
			handleReviewProf( args, selected );
			break;

		case 'ADD_NOT_PROF':
		case 'ADD_PROFICIENT':
		case 'ADD_SPECIALIST':
		case 'ADD_MASTERY':
		
			handleAddProf( args, selected );
			break;
			
		default :
			sendDebug('doButton: Invalid button type');
			sendError('Invalid CommandMaster syntax');
		};

	};
	
/* ------------------------------------- Handle handshakes -------------------------------- */
	 
	/**
	 * Handle a database indexing handshake
	 **/
	 
	var doIndexDB = function( args ) {
		
		apiDBs[args[0]] = true;
		updateDBindex();
		return;
	};
		
	/**
	 * Handle handshake request
	 **/
	 
	var doHsQueryResponse = function(args) {
		if (!args) return;
		var from = args[0] || '',
			func = args[1] || '',
			funcTrue = ['initialise','abilities','add-spells','add-profs','set-prof','set-all-prof','register','edit','debug','help'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr cmd'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
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
			senderId = findThePlayer(msg.who),
			selected = msg.selected,
			isGM = (playerIsGM(senderId) || state.CommandMaster.debug === senderId),
			changedCmds = false,
			t = 0,
			curToken, npc, val;
			
		var doCommandCmd = function( e, selected, senderId, isGM ) {
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
			argString = (i<0 ? '' : arg.substring(i+1).trim());
			arg = argString.split('|');
			
			try {
				switch (cmd.dbName()) {
				case 'displayability':
					doDisplayAbility(arg,selected,senderId,flags.feedbackName,flags.feedbackImg);
					break;
				case 'register':
					doRegistration(argString);
					break;
				case 'abilities':
					if (isGM) doAbilityMenu(arg,selected,senderId);
					break;
				case 'initialise':
				case 'initialize':
					if (isGM) doInitialise(senderId);
					break;
				case 'classmenu':
					doChooseClass(arg, selected, senderId, isGM);
					break;
				case 'resetchest':
					doResetChest(arg, selected, senderId, isGM);
					break;
				case 'checkchars':
					if (isGM) doCheckCharSetup(senderId);
					break;
				case 'edit':
					if (isGM) doEditAbilities(arg);
					break;
				case 'addspells':
					if (isGM) doAddSpells(arg,selected,senderId);
					break;
				case 'addprofs':
					if (isGM) doAddProfs(arg,selected,senderId);
					break;
				case 'setprof':
					if (isGM) doSetProf(arg,selected);
					break;
				case 'setallprof':
					if (isGM) doSetAllProf(arg,selected,senderId);
					break;
				case 'convspells':
					if (isGM) doConvertSpells(arg,selected,senderId);
					break;
				case 'convitems':
					if (isGM) doConvertItems(arg,selected,senderId);
					break;
				case 'tokendefaults':
					if (isGM) doManageTokenBars( arg );
					break;
				case 'tokenimg':
					if (isGM) doChangeImages( arg, selected, senderId );
					break;
				case 'copyimg':
					if (isGM) doCopyImage( arg, selected, senderId );
					break;
				case 'indexdb':
					if (isGM) doIndexDB(arg);
					break;
				case 'checknames':
					if (isGM) makeCheckNamesMenu(arg);
					break;
				case 'correctnames':
					if (isGM) handleChangeAllNames(arg);
					break;
				case 'button':
					doButton(arg,isGM,selected,senderId);
					break;
				case 'handouts':
				case 'handout':
					updateHandouts(handouts,false,senderId);
					break;
				case 'hsq':
				case 'handshake':
					doHsQueryResponse(arg);
					break;
				case 'hsr':
					doHandleHsResponse(arg);
					break;
				case 'help':
					showHelp(); 
					break;
				case 'relay':
					doRelay(argString,senderId); 
					break;
				case 'debug':
					doSetDebug(arg,senderId);
					break;
				default:
					showHelp(); 
					sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>',flags.feedbackName,flags.feedbackImg);
				}
			} catch (err) {
				log('CommandMaster handleChatMsg: JavaScript '+err.name+': '+err.message+' processing cmd '+cmd+' '+argString);
				sendDebug('CommandMaster handleChatMsg: JavaScript '+err.name+': '+err.message+' processing cmd '+cmd+' '+argString);
				sendCatchError('CommandMaster',msg_orig[senderId],err);
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

		if (msg.type !=='api' || args.indexOf('!cmd') !== 0) {
			return;
		}

//		log('cmd chat: called, cmd = '+args);
			
		sendDebug('CommandMaster called');
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
				isGM = true;
			}
		} else {
			sendDebug('senderId is defined as ' + getObj('player',senderId).get('_displayname'));
		};
		
		if (!flags.noWaitMsg) sendWait(senderId,500,'commandMaster');
		
		_.each(args, function(e) {
			setTimeout( doCommandCmd, (1*t++), e, selected, senderId, isGM );
		});
	};
// -------------------------------------------------------------- Register the API -------------------------------------------

	/*
	 * Look out for a new dropped token, with as yet 
	 * undefined class or level or specs for a creature.
	 * If new, then pop up the class/race/creature dialog
	 */

	var handleNewToken = function(obj,prev) {
		
		try {
//			log('cmd handleNewToken: called');
			
			if (!obj)
				{return;}
				
			if (obj.get('name') == prev['name'])
				{return;}
				
			if (obj.get('_subtype') == 'token') {
				let charCS = getCharacter(obj.id);
				if (charCS) {
					let race = attrLookup( charCS, fields.Race );
					let classObjs = classObjects( charCS );
					let defClass = (classObjs.length == 1 && classObjs[0].name == 'creature' && classObjs[0].level == 0);
					let container = (attrLookup(charCS, fields.Gender) || '').dbName() === 'container';
					if ((!race || !race.length) && defClass && !obj.get('isdrawing')) {
						sendAPI(fields.commandMaster+' --class-menu '+obj.id);
					} else if (((race || '').dbName() === 'magicitem') || container) {
						handleSetTokenBars( [BT.AB_TOKEN], [obj], null, true );
						obj.set('isdrawing',true);
					}
				}
			}
		} catch (e) {
			sendCatchError('CommandMaster',null,e,'CommandMaster handleNewToken()');
		}
		return;
	}
	
	/*
	 * Look out for a changed character sheet name on a
	 * container (in the gender field). If a container 
	 * character sheet is renamed, rebuild the container 
	 * ability macros with the new name.
	 */

	var handleChangedChar = function(obj,prev) {
		
		try {
//			log('cmd handleChangedChar: called');
			if (!obj)
				{return;}
				
			if (obj.get('name') == prev['name'])
				{return;}
				
			let charCS = obj;
			if (charCS) {
				let race = attrLookup( charCS, fields.Race );
				let container = (attrLookup(charCS, fields.Gender) || '').dbName() === 'container';
				if (container && prev['name']) {
					let token = findObjs({ _type:'graphic', _subtype:'token', represents:charCS.id});
					if (token && token.length) {
						setCreatureAttrs( BT.CONTAINER, charCS, findTheGM(), race, {_id:token[0].id} );
					};
				};
			};
		} catch (e) {
			sendCatchError('CommandMaster',null,e,'CommandMaster handleChangedChar()');
		}
		return;
	}
	
	/*
	 * Watch for a rotation or change of size of a 
	 * container image / token.
	 */
	 
	var handleRotation = function(obj,prev) {
		
		try {
			if (!obj) return;
			let charCS = getCharacter( obj.id );
			if (!charCS || attrLookup( charCS, fields.Gender ).toLowerCase() !== 'container') return;
			setAttr( charCS, fields.Token_closedRot, obj.get('rotation') );
			setAttr( charCS, fields.Token_openRot, obj.get('rotation') );
		} catch (e) {
			sendCatchError('CommandMaster',null,e,'CommandMaster handleChangedChar()');
		}
		return;
	}
			

	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('change:graphic:name',handleNewToken);
		on('change:graphic:rotation',handleRotation);
		on('change:character:name',handleChangedChar);
	};
 
	return {
		init: init,
		registerAPI: registerAPI
	};
 
}());

on("ready", function() {
	'use strict'; 
	CommandMaster.init(); 
	CommandMaster.registerAPI();
});

{try{throw new Error('');}catch(e){API_Meta.CommandMaster.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.CommandMaster.offset);}}
