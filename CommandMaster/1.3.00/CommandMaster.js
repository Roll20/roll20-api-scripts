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
 */
 
var CommandMaster = (function() {
	'use strict'; 
	var version = '1.3.00',
		author = 'RED',
		pending = null;
    const lastUpdate = 1663353439;

	/*
	 * Define redirections for functions moved to the RPGMaster library
	 */
		
	const getRPGMap = (...a) => libRPGMaster.getRPGMap(...a);
	const getHandoutIDs = (...a) => libRPGMaster.getHandoutIDs(...a);
	const setAttr = (...a) => libRPGMaster.setAttr(...a);
	const attrLookup = (...a) => libRPGMaster.attrLookup(...a);
	const getTableField = (...t) => libRPGMaster.getTableField(...t);
	const getTable = (...t) => libRPGMaster.getTable(...t);
	const initValues = (...v) => libRPGMaster.initValues(...v);
	const setAbility = (...a) => libRPGMaster.setAbility(...a);
	const abilityLookup = (...a) => libRPGMaster.abilityLookup(...a);
	const doDisplayAbility = (...a) => libRPGMaster.doDisplayAbility(...a);
	const getAbility = (...a) => libRPGMaster.getAbility(...a);
	const getDBindex = (...a) => libRPGMaster.getDBindex(...a);
	const updateHandouts = (...a) => libRPGMaster.updateHandouts(...a);
	const getCharacter = (...a) => libRPGMaster.getCharacter(...a);
	const classObjects = (...a) => libRPGMaster.classObjects(...a);
	const addMIspells = (...a) => libRPGMaster.addMIspells(...a);
	const getMagicList = (...a) => libRPGMaster.getMagicList(...a);
	
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

	const stdDB = ['MU_Spells_DB','PR_Spells_DB','Powers_DB','MI_DB','MI_DB_Ammo','MI_DB_Armour','MI_DB_Light','MI_DB_Potions','MI_DB_Rings','MI_DB_Scrolls_Books','MI_DB_Wands_Staves_Rods','MI_DB_Weapons','Attacks_DB','Class_DB'];
	
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
						 version:2.01,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">CommandMaster Help v2.01</span>'
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
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<h3>1. Campaign setup</h3>'
							+'<pre>--initialise<br>'
							+'--abilities</pre>'
							+'<h3>2. Character Sheet configuration</h3>'
							+'<pre>--check-chars<br>'
							+'--add-spells [POWERS/MUSPELLS/PRSPELLS] | [level]<br>'
							+'--add-profs<br>'
							+'--set-prof  [NOT-PROF/PROFICIENT/SPECIALIST/MASTERY] | weapon | weapon-type<br>'
							+'--set-all-prof</pre>'
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
							+'<h3>2.1 Check control of Character Sheets</h3>'
							+'<pre>--check-chars</pre>'
							+'<p>Displays a list of every Character Sheet with a defined Class, Level, or Monster Hit Dice categorised by <i>DM Controlled, Player Controlled PCs & NPCs, Player Controlled Creatures,</i> and <i>Controlled by Everyone.</i>  Each name is shown as a button which, if selected, swaps control of that Character Sheet between DM control and the control of a selected Player (the Player, of course, must be one that has already accepted an invite to join the campaign). A button is also provided at the bottom of this menu to toggle the running of this check whenever the Campaign is loaded.</p>'
							+'<h3>2.2 Add spells to spell book</h3>'
							+'<pre>--add-spells [POWERS/MUSPELLS/PRSPELLS] | [level]</pre>'
							+'<p>Displays a menu allowing spells in the Spells Databases to be added to the Character Sheet(s) represented by the selected Token(s).  If no spell type and/or spell level is specified, the initial menu shown is for Level 1 Wizard spells (MUSPELLS). Buttons are shown on the menu that allow navigation to other levels, spell types and powers.  For <i>Priests</i>, a button is also provided to add every spell allowed for the Priest\'s Class to their spellbooks at all levels (of course, they will only be able to memorise those that their experience level allows them to). For all Character Classes that have <i>Powers</i> (or Power-like capabilities, such as Priestly <i>Turn Undead</i> or Paladin <i>Lay on Hands</i>), there is a button on the <i>Powers</i> menu to add Powers that the character\'s Class can have.</p>'
							+'<p><b>Note:</b> adding spells / powers to a sheet does not mean the Character can immediately use them.  They must be <i>memorised</i> first.  Use the commands in the <b>MagicMaster API</b> to memorise spells and powers.</p>'
							+'<h3>2.3 Choose weapon proficiencies</h3>'
							+'<pre>--add-profs</pre>'
							+'<p>Displays a menu from which to select proficiencies and level of proficiency for any weapons in the Weapon Databases for the Character Sheet(s) represented by the selected tokens.  Also provides a button for making the Character proficient in all weapons carried (i.e. those currently in their Item table).</p>'
							+'<p>All current proficiencies are displayed, with the proficiency level of each, which can be changed or removed.</p>'
							+'<p><b>Note:</b> this does more than just entering the weapon in the proficiency table.  It adds the <i>weapon group</i> that the weapon belongs to as a field to the table (see weapon database help handouts for details), which is then used by the <b>AttackMaster API</b> to manage <i>related weapon</i> attacks and give the correct proficiency bonuses or penalties for the class and weapon used.</p>'
							+'<h3>2.4 Set weapon proficiencies</h3>'
							+'<pre>--set-prof  [NOT-PROF/PROFICIENT/SPECIALIST/MASTERY] | weapon | weapon-type </pre>'
							+'<p>Sets a specific weapon proficiency to a named level.  If the proficiency level is omitted, PROFICIENT is assumed.  If the weapon already exists in the proficiencies table, the existing proficiency level is updated to that specified.  Otherwise, the weapon (and its weapon group) are added to the table at the specified level.</p>'
							+'<p><b>Note:</b> this does more than just entering the weapon in the proficiency table.  It adds the weapon group that the weapon belongs to as a field to the table (see weapon database help handouts for details), which is then used by the AttackMaster API to manage related weapon attacks and give the correct proficiency bonuses or penalties for the class and weapon used.</p>'
							+'<h3>2.5 Add proficiencies for all carried weapons</h3>'
							+'<pre>--set-all-prof</pre>'
							+'<p>Adds all currently carried weapons (those in the Items table) to PROFICIENT, saving them and their <i>weapon group</i> to the weapon proficiency table.  Those weapons found that are already in the table are reset to PROFICIENT (overwriting any existing different proficiency level).  Any other proficiencies already in the table are not altered.</p>'
							+'<p><b>Note:</b> this command always adds a weapon proficiency called <i>innate</i>.  This proficiency is used for attacks with innate weapons, such as claws and bites, but also for spells that require a <i>touch attack</i>.  Indeed, to make this even more specific, the weapons database distributed with the AttackMaster and MagicMaster APIs includes a weapon called <i>Touch</i>.</p>'
							+'<p><b>Tip:</b> if using the <b>MagicMaster API</b> then running the <b>!magic --gm-edit-mi</b> command and adding weapons before running this command can speed up setting up character sheets.</p>'
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
							+'<h2>5. How CommandMaster Works</h2>'
							+'<p>The CommandMaster API coordinates other APIs in the RPGMaster API series and provides the DM with facilities to set the Campaign up to use them.  It will initialise a Campaign in Roll20 to use the RPGMaster series APIs.  APIs can register their commands with CommandMaster and, should they change in the future, CommandMaster will search all Character Sheets and databases for that command and offer the DM the option to automatically update any or all of those found to the new command structure of that API.  Selected Tokens and their associated Character Sheets can be set up with the correct Token Action Buttons, with spell-users given spells in their spell book, fighters given weapon proficiencies, setting saving throws correctly, and linking token circles to standard Character Sheet fields.</p>'
							+'<h3>Initialising a Campaign</h3>'
							+'<p>Using the <b>--initialise</b> command will add a number of Player Macros for the DM that will run the most-used RPGMater DM commands, which can be flagged to appear in the Macro Bar at the bottom of the DM\'s screen for ease of access.</p>'
							+'<h3>Setting up tokens & character sheets</h3>'
							+'<p>Selecting one or multiple tokens and running the <b>--abilities</b> command will allow token action buttons and RPGMaster API capabilities to be set up for all the represented Character Sheets at the same time, though all Character Sheets will be set up the same way.</p>'
							+'<h3>Registering API commands</h3>'
							+'<p>Any API command can be registered with CommandMaster using the <b>--register</b> command.  This will allow the command registered to be added as a Token Action Button to Character Sheets by the   abilities command, and to be optionally updated in all Character Sheets wherever used should the details of the registration change.</p>'
							+'<h3>Editing Character Sheet abilities</h3>'
							+'<p><b>Danger:</b> this command is very powerful, and can ruin your campaign if mis-used!  The <b>--edit</b> command can be used to change any string in Character Sheet ability macros to any other string, using \'escaped\' characters to replace even the most complex strings.  However, use with care!</p>'
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
	
	const PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	const messages = Object.freeze({
		noChar: '/w "gm" &{template:'+fields.warningTemplate+'} {{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
		initMsg: '/w gm &{template:'+fields.menuTemplate+'} {{name=Initialisation Complete}}{{desc=Initialisation complete.  Command macros created.  Go to Macro tab (next to the cog at the top of the Chat window), and select them to show In Bar, and turn on the Macro Quick Bar.  Then start by dragging some characters on to the map to create tokens, and use Token-setup and Add-Items on each}}',
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
		MON_ATTACK: 	'MON_ATTACK',
		MON_INNATE: 	'MON_INNATE',
		MON_MELEE:  	'MON_MELEE',
		BACKSTAB:   	'BACKSTAB',
		MELEE:      	'MELEE',
		MW_DMGSM:   	'MW_DMGSM',
		MW_DMGL:    	'MW_DMGL',
		MON_RANGED: 	'MON_RANGED',
		RANGED:     	'RANGED',
		RANGEMOD:   	'RANGEMOD',
		RW_DMGSM:   	'RW_DMGSM',
		RW_DMGL:    	'RW_DMGL',
		MU_SPELL:   	'MU_SPELL',
		PR_SPELL:   	'PR_SPELL',
		ALL_PRSPELLS:	'ALL_PRSPELLS',
		POWER:      	'POWER',
		ALL_POWERS:		'ALL_POWERS',
		MI_BAG:     	'MI_BAG',
		THIEF:      	'THIEF',
		MOVE:       	'MOVE',
		CHG_WEAP:   	'CHG_WEAP',
		STAND:      	'STAND',
		SPECIFY:    	'SPECIFY',
		CARRY:      	'CARRY',
		SUBMIT:     	'SUBMIT',
		LEFT:			'LEFT',
		RIGHT:			'RIGHT',
		BOTH:			'BOTH',
		AMMO:			'AMMO',
		CLEAR_CTRL:		'CLEAR_CTRL',
		PLAYER_CTRL:	'PLAYER_CTRL',
		SWITCH_CS_CHECK:'SWITCH_CS_CHECK',
		CLASS_F:		'CLASS_F',
		CLASS_W:		'CLASS_W',
		CLASS_P:		'CLASS_P',
		CLASS_R:		'CLASS_R',
		CLASS_PSI:		'CLASS_PSI',
		LEVEL_F:		'LEVEL_F',
		LEVEL_W:		'LEVEL_W',
		LEVEL_P:		'LEVEL_P',
		LEVEL_R:		'LEVEL_R',
		LEVEL_PSI:		'LEVEL_PSI',
		REVIEW_CLASS:	'REVIEW_CLASS',
		ABILITY:		'ABILITY',
		AB_PC:			'AB_PC',
		AB_DM:			'AB_DM',
		AB_OTHER:		'AB_OTHER',
		AB_REPLACE:     'AB_REPLACE',
		AB_SIMPLE:		'AB_SIMPLE',
		AB_FULL:		'AB_FULL',
		AB_CLASSES:		'AB_CLASSES',
		AB_SAVES:		'AB_SAVES',
		AB_TOKEN:		'AB_TOKEN',
		AB_TOKEN_NONE:	'AB_TOKEN_NONE',
		STR_REPLACE:    'STR_REPLACE',
	});
		
	/*
	 * Object defining simple redMaster series ability actions to 
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
	
	const replacers = [
			[/\\lbrc;?/g, "{"],
			[/\\rbrc;?/g, "}"],
			[/\\gt;?/gm, ">"],
			[/\\lt;?/gm, "<"],
			[/<<|«/g, "["],
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
		
	const encoders = [
			[/\r?\n/gm,'\\n'],
			[/'/gm,"\\'"],
			[/&/gm,"\\\\amp;"],
			[/>/gm,"\\\\gt;"],
			[/</gm,"\\\\lt;"]
		];

	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;

	const reSpellSpecs = Object.freeze ({
		name:		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+]+?)[,\]]/i},
		type:		{field:'spell',def:'',re:/[\[,\s]cl:(PR|MU|PW)[,\s\]]/i},
		speed:		{field:'speed',def:0,re:/[\[,\s]sp:([d\d\+\-]+?)[,\s\]]/i},
		level:		{field:'level',def:1,re:/[\[,\s]lv:(\d+?)[,\s\]]/i},
		perDay:		{field:'perDay',def:1,re:/[\[,\s]pd:(\d+?)[,\s\]]/i},
		cost:		{field:'cost',def:0,re:/[\[,\s]gp:(\d+?\.?\d*?)[,\s\]]/i},
		recharge:	{field:'type',def:'uncharged',re:/[\[,\s]rc:([\-\w]+?)[,\s\]]/i},
		spheres:	{field:'sph',def:'',re:/[\[,\s]sph:([\s\w\-\|\d]+?)[,\]]/i},
	});
	
	const reClassSpecs = Object.freeze ({
		name:		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+]+?)[,\]]/i},
		alignment:	{field:'align',def:'any',re:/[\[,\s]align:([\s\w\-\+\|]+?)[,\s\]]/i},
		hitdice:	{field:'hd',def:'1d10',re:/[\[,\s]hd:([d\d\+\-]+?)[,\s\]]/i},
		race:		{field:'race',def:'any',re:/[\[,\s]race:([\s\w\-\|]+?)[,\s\]]/i},
		weapons:	{field:'weaps',def:'any',re:/[\[,\s]weaps:([\s\w\-\+\|]+?)[,\s\]]/i},
		armour:		{field:'ac',def:'any',re:/[\[,\s]ac:([\s\w\-\+\|]+?)[,\s\]]/i},
		majorsphere:{field:'sps',def:'any',re:/[\[,\s]sps:([\s\w\-\|]+?)[,\s\]]/i},
		minorsphere:{field:'spm',def:'',re:/[\[,\s]spm:([\s\w\-\|]+?)[,\]]/i},
		bannedsphere:{field:'spb',def:'',re:/[\[,\s]spb:([\s\w\-\|]+?)[,\]]/i},
		extralevel1:{field:'xspell1',def:'',re:/[\[,\s]sp1:([\s\w\-\|]+?)[,\]]/i},
		extralevel2:{field:'xspell2',def:'',re:/[\[,\s]sp2:([\s\w\-\|]+?)[,\]]/i},
		extralevel3:{field:'xspell3',def:'',re:/[\[,\s]sp3:([\s\w\-\|]+?)[,\]]/i},
		extralevel4:{field:'xspell4',def:'',re:/[\[,\s]sp4:([\s\w\-\|]+?)[,\]]/i},
		extralevel5:{field:'xspell5',def:'',re:/[\[,\s]sp5:([\s\w\-\|]+?)[,\]]/i},
		extralevel6:{field:'xspell6',def:'',re:/[\[,\s]sp6:([\s\w\-\|]+?)[,\]]/i},
		extralevel7:{field:'xspell7',def:'',re:/[\[,\s]sp7:([\s\w\-\|]+?)[,\]]/i},
		spelllevels:{field:'spellLevels',def:'',re:/[\[,\s]slv:([\s\w\-\|]+?)[,\]]/i},
		powerdef:	{field:'cl',def:'',re:/[\[,\s]cl:([\s\w]+?)[,\]]/i},
		numpowers:	{field:'numpowers',def:0,re:/[\[,\s]ns:([\d\w]+?)[,\s\]]/i},
	});
	
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
		notifyLibErr: true
	};
	
	var parsedCmds = false,
		apiCommands = {},
		apiDBs = {magic:false,attk:false},
		registeredCmds = [],
		registeredAPI = {},
		abilities = [],
	    asked = [],
	    changedAbility = '',
		checkForChangedCmds = false;
		
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
		if (!state.CommandMaster)
			{state.CommandMaster = {};}
		if (_.isUndefined(state.CommandMaster.CheckChar))
			{state.CommandMaster.CheckChar = false;}
		if (!state.CommandMaster.cmds) {
	        state.CommandMaster.cmds = [];
			state.CommandMaster.cmds[0] = 'Specials|Display special attacks and defences|attk| |\n/w "\\at{selected|character_name}" &{template:RPGMdefault}{{name=Special Attacks & Defences for\n\\at{selected|character_name}}}{{Special Attacks=\\at{selected|monsterspecattacks} }}{{Special Defences=\\at{selected|monsterspecdefenses} }}|';
			state.CommandMaster.cmds[1] = 'Bar|Add inactive bar as an action button|money| |';
		}
		if (_.isUndefined(state.CommandMaster.debug))
		    {state.CommandMaster.debug = false;}

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
		dbNames = RPGMap.dbNames;
		DBindex = undefined;

		doRegistration('Specials|Display special attacks and defences|attk| |\n/w "\\at{selected%%character_name}" &{template:RGPMdefault}{{name=Special Attacks & Defences for\n\\at{selected%%character_name}}}{{Special Attacks=\\at{selected%%monsterspecattacks} }}{{Special Defences=\\at{selected%%monsterspecdefenses} }}|');
			
		setTimeout( () => issueHandshakeQuery('attk'), 20);
		setTimeout( () => issueHandshakeQuery('magic'), 20);
		setTimeout(() => updateHandouts(handouts,true,findTheGM()), 50);
		setTimeout(handleChangedCmds,10000);
		
		if (state.CommandMaster.CheckChar)
			setTimeout(doCheckCharSetupDelayed,10000);

        log('-=> CommandMaster v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

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

    const sendToWho = (...m) => libRPGMaster.sendToWho(...m);
    const sendPublic = (...m) => libRPGMaster.sendPublic(...m);
    const sendAPI = (...m) => libRPGMaster.sendAPI(...m);
    const sendFeedback = (...m) => libRPGMaster.sendFeedback(...m);
    const sendResponse = (...m) => libRPGMaster.sendResponse(...m);
    const sendResponsePlayer = (...p) => libRPGMaster.sendResponsePlayer(...p);
    const sendResponseError = (...e) => libRPGMaster.sendResponseError(...e);
    const sendError = (...e) => libRPGMaster.sendError(...e);
    const sendParsedMsg = (...m) => libRPGMaster.sendParsedMsg(...m);

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
	
	/**
	 * Find the player's ID, or if no player name provided, return the GM's ID
	 **/
	 
	var findThePlayer = function(who) {
		let playerObjs = findObjs({_type:'player',_displayname:who});
		return (!playerObjs || !playerObjs.length) ? findTheGM() : playerObjs[0].id;
	};
		
	
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
				weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
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
	
	/**
     * Find and return total level of a character
     **/
    
    var characterLevel = function( charCS ) {
        var level = parseInt((attrLookup( charCS, fields.Total_level ) || 0),10);
		if (!level) {
			level = parseInt((attrLookup( charCS, fields.Fighter_level ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Wizard_level ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Priest_level ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Rogue_level ) || 0),10)
                  + parseInt((attrLookup( charCS, fields.Psion_level ) || 0),10)
				  + (parseInt((attrLookup( charCS, fields.Monster_hitDice ) || 0),10)
					+ ((parseInt((attrLookup( charCS, fields.Monster_hpExtra ) || 0),10) >= 3) ? 1 : 0));
		}
        return level;
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

					  
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/*
	 * Display a menu to add spells and powers to the spellbooks of a character
	 */
	 
	var makeSpellsMenu = function( args, selected, msg ) {
		
		var cmd = args[0].toUpperCase(),
			level = parseInt(args[1]) || 1,
			spell = args[2],
			tokenID = selected ? selected[0]._id : undefined,
		    charCS = tokenID ? getCharacter(tokenID) : undefined,
			isMU = cmd.includes('MU'),
			isPR = cmd.includes('PR'),
			isPower = cmd.includes('POWER'),
			curSpells = '',
			nextLevel, rootDB, listAttr, listType, spellObj, cmdStr, desc, content;
			
		if (isPower) {
			desc = 'Powers';
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
		} else {
			desc = 'Level '+level+' PR spell book';
			cmd = 'PRSPELLS';
			rootDB = fields.PR_SpellsDB;
			listAttr = [fields.PRSpellbook[0]+spellLevels.pr[level].book,fields.PRSpellbook[1]];
			listType = 'prspelll'+level;
		}
		args[0] = cmd;
		cmdStr = args.join('|');

		if (charCS) {
			setAttr( charCS, fields.Casting_name, charCS.get('name'));
			setAttr( charCS, fields.CastingLevel, characterLevel( charCS ));
			curSpells = (attrLookup( charCS, listAttr ) || '').replace(/\|/g,', ');
		}
			
		content = '&{template:'+fields.defaultTemplate+'}{{name=Grant Spells}}{{ ='+(msg||'')+'}}{{'+desc+'='+curSpells+'}}'
				+ '{{desc=1. [Choose](!cmd --button CHOOSE_'+cmd+'|'+level+'|&#63;{Choose which spell|'+getMagicList( rootDB, spTypeLists, listType )+'}) a spell\n';
				
		if (spell) {
			spellObj = getAbility( rootDB, spell, charCS );
			content += '...Optionally [Review '+spell+'](!cmd --button REV_'+cmdStr
			        +  '&#13;&#47;w gm &#37;{' + spellObj.dB + '|'+spell+'})';
		} else {
			content += '...Optionally <span style='+design.grey_button+'>Review the chosen spell</span>';
		}
		
		if (isPR && (apiCommands.attk || apiCommands.magic)) {
			content += ' or [Add all valid Priest spells](!cmd --button '+BT.ALL_PRSPELLS+'|'+level+')';
		}
		
		if (isPower && (apiCommands.attk || apiCommands.magic)) {
			content += ' or [Add all Class powers](!cmd --button '+BT.ALL_POWERS+')';
		}
		
		content += '}}{{desc1=2. '+(spell ? '[' : '<span style=' + design.grey_button + '>')+'Add '+(spell ? spell+'](!cmd --button ADD_'+cmdStr+')' : 'the spell</span>' )
				+  ' to '+(isPower ? 'Powers' : ('level '+level+(isMU ? ' MU' : ' PR')+' spellbook'))+'}}'
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
	}
	
	/*
	 * Create a menu to allow the DM to set Character weapon proficiencies
	 */
	 
	var makeProficienciesMenu = function( args, selected, msg ) {
		
		var	weapon = args[1] || '',
			meleeWeapon = args[2] || false,
			weapType = args[3] || '',
			masterRange = apiCommands['attk'].exists ? state.attackMaster.weapRules.masterRange : true,
			buttons, weapObj,
    		content = '&{template:' + fields.defaultTemplate + '}{{name=Grant Weapon Proficiencies}}{{ ='+(msg||'')+'}}'
    				+ '{{  =['+((weapon) ? weapon : 'Choose Weapon')+'](!cmd --button CHOOSE_PROF|&#63;{Choose which Weapon?|'+getMagicList( fields.WeaponDB, miTypeLists, 'weapon' )+'})'
					+ 'or make [All Owned Weapons](!cmd --set-all-prof PROFICIENT) proficient\n'
    				+ 'and optionally ';
		
		if (weapon) {
			let weapObj = getAbility( fields.WeaponDB, weapon, charCS );
			content += '[Review '+weapon+'](!cmd --button REVIEW_PROF|'+weapon
					+  '&#13;&#47;w gm &#37;{' + weapObj.dB + '|'+weapon+'})}}'
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
	}
	
	/*
	 * Make a menu to display current class(es) of the selected tokens, check 
	 * if they are classes defined in the Class database, and allow new classes
	 * to be selected.
	 */
	 
	var makeClassMenu = function( args, selected, isGM, msg='' ) {
		
		var chosenClass = args[1] || '',
			baseClass = args[2] || 'Warrior',
			fighter_class='Warrior', fighter_level=0, fighter_default='',
			wizard_class='Wizard', wizard_level=0, wizard_default='',
			priest_class='Priest', priest_level=0, priest_default='',
			rogue_class='Rogue', rogue_level=0, rogue_default='',
			psion_class='Psionicist', psion_level=0, psion_default='',
			tokenID, charCS;

		if (selected && selected.length) {
			tokenID = selected[0]._id,
			charCS = getCharacter( tokenID );
		}
		
		if (charCS) {
			fighter_class = attrLookup( charCS, fields.Fighter_class ) || 'Warrior';
			fighter_level = parseInt(attrLookup( charCS, fields.Fighter_level )) || 0;
			wizard_class = attrLookup( charCS, fields.Wizard_class ) || 'Wizard';
			wizard_level = parseInt(attrLookup( charCS, fields.Wizard_level )) || 0;
			priest_class = attrLookup( charCS, fields.Priest_class ) || 'Priest';
			priest_level = parseInt(attrLookup( charCS, fields.Priest_level )) || 0;
			rogue_class = attrLookup( charCS, fields.Rogue_class ) || 'Rogue';
			rogue_level = parseInt(attrLookup( charCS, fields.Rogue_level )) || 0;
			psion_class = attrLookup( charCS, fields.Psion_class ) || 'Psionicist';
			psion_level = parseInt(attrLookup( charCS, fields.Psion_level )) || 0;
		}
		
		var	fighter_classes = getMagicList( fields.ClassDB, clTypeLists, 'warrior', 'Warrior|Fighter|Paladin|Ranger', true, 'Specify class' ),
			fighter_def = abilityLookup( fields.ClassDB, fighter_class, charCS, true ),
			wizard_classes = getMagicList( fields.ClassDB, clTypeLists, 'wizard', 'Wizard|Mage|Abjurer|Conjurer|Diviner|Enchanter|Illusionist|Invoker|Necromancer|Transmuter', true, 'Specify class' ),
			wizard_def = abilityLookup( fields.ClassDB, wizard_class, charCS, true ),
			priest_classes = getMagicList( fields.ClassDB, clTypeLists, 'priest', 'Priest|Cleric|Druid', true, 'Specify class' ),
			priest_def = abilityLookup( fields.ClassDB, priest_class, charCS, true ),
			rogue_classes = getMagicList( fields.ClassDB, clTypeLists, 'rogue', 'Rogue|Thief|Bard|Assassin', true, 'Specify class' ),
			rogue_def = abilityLookup( fields.ClassDB, rogue_class, charCS, true ),
			psion_classes = getMagicList( fields.ClassDB, clTypeLists, 'psion', 'Psionicist|Psion', true, 'Specify class' ),
			psion_def = abilityLookup( fields.ClassDB, psion_class, charCS, true );
			
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
		
		let content = '&{template:'+fields.defaultTemplate+'}{{name=Review & Set Classes}}'
					+ (msg ? ('='+msg) : '')
					+ '{{desc=Drop down lists show Classes defined in the Class Databases.  If a class is not shown in a list, choose "Other" and it can be typed in at the next prompt.  Any class *can* be in any class field (even if not in the list for that field), especially to support multi-class characters.  Classes not found in the Class database will get the defaults for the field: Unrecognised Classes in the *Wizard* line default to Wizard spellcasting rules.  Unrecognised Classes in the *Priest* line default to Priest spellcasting rules.}}'
					+ '{{desc1=<table>'
					+ '<tr><td>['+fighter_class+'](!cmd --button '+BT.CLASS_F+'|&#63;{Which Warrior Class?|'+fighter_classes+'})</td><td>[Level '+fighter_level+'](!cmd --button '+BT.LEVEL_F+'|&#63;{Which Warrior Level?|'+fighter_level+'})</td><td>'+fighter_default+'</td></tr>'
					+ '<tr><td>['+wizard_class+'](!cmd --button '+BT.CLASS_W+'|&#63;{Which Wizard Class?|'+wizard_classes+'})</td><td>[Level '+wizard_level+'](!cmd --button '+BT.LEVEL_W+'|&#63;{Which Wizard Level?|'+wizard_level+'})</td><td>'+wizard_default+'</td></tr>'
					+ '<tr><td>['+priest_class+'](!cmd --button '+BT.CLASS_P+'|&#63;{Which Priest Class?|'+priest_classes+'})</td><td>[Level '+priest_level+'](!cmd --button '+BT.LEVEL_P+'|&#63;{Which Priest Level?|'+priest_level+'})</td><td>'+priest_default+'</td></tr>'
					+ '<tr><td>['+rogue_class+'](!cmd --button '+BT.CLASS_R+'|&#63;{Which Rogue Class?|'+rogue_classes+'})</td><td>[Level '+rogue_level+'](!cmd --button '+BT.LEVEL_R+'|&#63;{Which Rogue Level?|'+rogue_level+'})</td><td>'+rogue_default+'</td></tr>'
					+ '<tr><td>['+psion_class+'](!cmd --button '+BT.CLASS_PSI+'|&#63;{Which Psion Class?|'+psion_classes+'})</td><td>[Level '+psion_level+'](!cmd --button '+BT.LEVEL_PSI+'|&#63;{Which Psion Level?|'+psion_level+'})</td><td>'+psion_default+'</td></tr>'
					+ (chosenClass && chosenClass.length ? ('<tr><td colspan="3">Optionally, review ['+chosenClass+'](!cmd --button '+BT.REVIEW_CLASS+'|'+chosenClass+'|'+baseClass+'|true)</td></tr>') : '')
					+ '</table>}}'
					+ (isGM ? '{{desc2=[Return to Token Menu](!cmd --abilities) or just do something else}}' : '');
		
		if (isGM) {
			sendFeedback( content,flags.feedbackName,flags.feedbackImg, tokenID, charCS );
		} else {
			sendResponse( charCS, content, null, flags.feedbackName, flags.feedbackImg, tokenID );
		}
		return;
	}
	
	/*
	 * Handle a request to review a class definition
	 */
	 
	var makeClassReviewDialogue = function( args, selected, isGM ) {
		
		var chosenClass = args[1] || '',
			baseClass = args[2] || '',
			classMenu = (args[3] || '') == 'true',
			tokenID, charCS, classDef,
			content = '';
		
		if (selected && selected.length) {
			tokenID = selected[0]._id,
			charCS = getCharacter( tokenID );
		}
		if (!charCS || !chosenClass.length) return;
		
		classDef = getAbility( fields.ClassDB, chosenClass, charCS );
		if (classDef.obj) {
			content = classDef.obj[1].body;
			if (classMenu && isGM) {
				content += '\n/w gm &{template:'+fields.defaultTemplate+'}{{name=Return to Class Menu}}'
						+  '{{desc=[Return to Class Menu](!cmd --button '+BT.AB_CLASSES+')}}';
			};
		} else {
			content = '&{template:'+fields.defaultTemplate+'}{{name='+chosenClass+'}}'
					+ '{{desc=This class has not been defined in the API Class-DB.'
					+ ' It will gain the defaults of the '+baseClass+' base class.}}'
					+ '{{desc1=Optionally [Display '+baseClass+' Class Definition](!cmd --button '+BT.REVIEW_CLASS+'|'+baseClass+'|'+baseClass+'|'+classMenu+')}}'
					+ (classMenu ? ('{{desc2=[Return to Class Menu](!cmd --button '+BT.AB_CLASSES+')}}') : '');
		};
		if (isGM) {
			sendFeedback( content,flags.feedbackName,flags.feedbackImg, tokenID, charCS );
		} else {
			sendResponse( charCS, content, null, flags.feedbackName, flags.feedbackImg, tokenID );
		}
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
		
		var menuType = args[0],
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
				
		switch (menuType) {
			
		case BT.AB_SIMPLE:
			
			content +=(regs[std.init_menu.api] ? '<tr><td>'+buttonType('Init menu',BT.ABILITY,std.init_menu.api,std.init_menu.action,'Ability name?','1.Initiative')+'</td><td>Initiative Menu, for all classes</td></tr>' : '')
					+ (regs[std.attk_hit.api] ? '<tr><td>'+buttonType('Attack',BT.ABILITY,std.attk_hit.api,std.attk_hit.action,'Ability name?','2.Attack')+'</td><td>Attack ability (Roll20 rolls dice), for all monsters & classes with weapons</td></tr>' : '')
					+ (regs[std.attk_menu.api] ? '<tr><td>'+buttonType('Attack menu',BT.ABILITY,std.attk_menu.api,std.attk_menu.action,'Ability name?','3.Attk menu')+'</td><td>Attack menu for all monsters & classes with weapons</td></tr>' : '')
					+ (regs[std.cast_spell.api] ? '<tr><td>'+buttonType('Cast Spell',BT.ABILITY,std.cast_spell.api,std.cast_spell.action,'Ability name?','2.Cast Spell')+'</td><td>Ability to cast either a Wizard or Priest spell</td></tr>' : '')
					+ (regs[std.spells_menu.api] ? '<tr><td>'+buttonType('Spells menu',BT.ABILITY,std.spells_menu.api,std.spells_menu.action,'Ability name?','3.Spells menu')+'</td><td>Spells menu (both Wizard & Priest)</td></tr>' : '')
					+ (regs[std.use_power.api] ? '<tr><td>'+buttonType('Use Power',BT.ABILITY,std.use_power.api,std.use_power.action,'Ability name?','2.Use Power')+'</td><td>Ability to use Powers</td></tr>' : '')
					+ (regs[std.powers_menu.api] ? '<tr><td>'+buttonType('Powers menu',BT.ABILITY,std.powers_menu.api,std.powers_menu.action,'Ability name?','3.Powers menu')+'</td><td>Powers menu, for all classes</td></tr>' : '')
					+ (regs[std.use_mi.api] ? '<tr><td>'+buttonType('Use MI',BT.ABILITY,std.use_mi.api,std.use_mi.action,'Ability name?','2.Use MI')+'</td><td>Ability to use a Magic Item</td></tr>' : '')
					+ (regs[std.mi_menu.api] ? '<tr><td>'+buttonType('MI menu',BT.ABILITY,std.mi_menu.api,std.mi_menu.action,'Ability name?','3.MI menu')+'</td><td>Magic Item Menu, for all classes</td></tr>' : '')
					+ (regs[std.other_actions.api] ? '<tr><td>'+buttonType('Other Actions',BT.ABILITY,std.other_actions.api,std.other_actions.action,'Ability name?','4.Other Actions')+'</td><td>Other Actions Menu, for all classes</td></tr>' : '')
					+ (regs[std.rest.api] ? '<tr><td>'+buttonType('Rest',BT.ABILITY,std.rest.api,std.rest.action,'Ability name?','5.Rest')+'</td><td>Ability to Rest, for all classes</td></tr>' : '')
					+ (regs[std.specials.api] ? '<tr><td>'+buttonType('Specials',BT.ABILITY,std.specials.api,std.specials.action,'Ability name?','4.Specials')+'</td><td>Display special attacks & defences</td></tr>' : '')
					+ (regs[std.bar.api] ? '<tr><td>'+buttonType('Bar',BT.ABILITY,std.bar.api,std.bar.action,'Ability name?','0._________')+'</td><td>Insert a separator bar</td></tr>' : '')
					+ '</table>}}{{desc2=<table width="100%" style="text-align: center;"><tr><td colspan="2">[Access All Abilities](!cmd-master --button '+BT.AB_FULL+')</td></tr>';
			break;
			
		case BT.AB_FULL:
		
			_.each( registeredCmds, c => {
				content += '<tr><td>'+buttonType(c.action,BT.ABILITY,c.api,c.action,'Ability name?',c.action)+'</td><td>'+c.desc+'</td></tr>';
			});
			content	+= '</table>}}{{desc2=<table width="100%" style="text-align: center;"><tr><td colspan="2">[Access Simple Abilities](!cmd --button '+BT.AB_SIMPLE+')</td></tr>';
			break;
		
		default:
			sendDebug('makeAbilitiesMenu: invalid menu type given');
			sendError('Internal CommandMaster error');
			return;
		}
		
		content += '<tr><td width="50%">'+(dm ? '[Make' : (selButton + 'Is')) + ' Player-Character' + (dm ? ('](!cmd --button '+BT.AB_PC+'|'+menuType+'|0|&#63;{Whick player will control?|'+players.join('|')+'})') : '</span>')+'</td>'
				+  '<td width="50%">'+(pc ? '[Make' : (selButton + 'Is')) + ' DMs Token' + (pc ? ('](!cmd --button '+BT.AB_DM+'|'+menuType+'|0|)') : '</span>')+'</td></tr>'
				+  '<tr><td colspan="2">[Check Who Controls What](!cmd --check-chars)</td></tr>'
				+  '<tr><td width="50%">[Choose Class(es)](!cmd --button '+BT.AB_CLASSES+')</td><td width="50%">[Set base Saving Throws](!attk --check-saves |'+menuType+'|0)</td></tr>'
		        +  '<tr><td width="50%">[Add to Spellbook](!cmd --add-spells MUSPELLS)</td><td width="50%">[Add to Proficiencies](!cmd --add-profs)</td></tr>'
				+  '<tr><td width="50%">[Set Token Circles](!cmd --button '+BT.AB_TOKEN+'|'+menuType+'|0)</td><td width="50%">[Clear Token Circles](!cmd --button '+BT.AB_TOKEN_NONE+'|'+menuType+'|0)</td></tr>'
				+  '</table>}}';
				
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
	 * Make a simple message confirming a cancelled action
	 */
	 
	var makeMsg = function(title,msg) {
	    var content = '&{template:'+fields.defaultTemplate+'}{{name='+title+'}}'
	                + '{{desc='+msg+'}}';
	   sendFeedback(content,flags.feedbackName,flags.feedbackImg);
	   return;
	}

// --------------------------------------------------------------- Button press Handlers ----------------------------------------------

	/*
	 * Handle adding a spell to a spellbook
	 */
	 
	var handleAddSpell = function( args, selected ) {
		
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
			spellList += (spellList ? '|' : '') + spell;
			spellList = spellList.split('|').sort().join('|');
			setAttr( charCS, listAttr, spellList );
		});
		args[2] = '';
		makeSpellsMenu( args, selected, msg );
		return;
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
	 
	var handleAddAllPRspells = function( args, selected ) {
		
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
			classes = classObjects(charCS);
			for (const c of classes) {
				classData = c.obj[1].body;
				classData = (classData.match(/}}\s*ClassData\s*=(.*?){{/im) || ['',''])[1];
				classData = classData ? [...('['+classData+']').matchAll(/\[[\s\w\-\+\,\:\/\|]+?\]/g)] : [];
				for (const d of classData) {
					let data = parseData( d[0], reClassSpecs ),
						spellType = data.spellLevels ? data.spellLevels.split('|')[3] : '';
					if (!data.cl || !data.cl.length) {
						if ((c.base == 'priest' && spellType != 'MU') || spellType == 'PR') {
							majorSpheres.push(data.sps.toLowerCase().replace(reIgnore,''));
							minorSpheres.push(data.spm.toLowerCase().replace(reIgnore,''));
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
					sphere = (spellData.sph+'|any').toLowerCase().replace(reIgnore,'').split('|');
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
		makeSpellsMenu( args, selected, ('Spells added to all Priest Levels') );
	};
	
	/*
	 * Handle adding all standard powers of a particular class 
	 * to a Character Sheet
	 */
	 
	var handleAddAllPowers = function( args, selected ) {
		
		var charCS, powers, content, classes, className, spellSet;

		_.each( selected, t => {
			charCS = getCharacter(t._id);
			if (!charCS) {sendFeedback('No or invalid token selected',flags.feedbackName,flags.feedbackImg);return;}
			powers = [],
			content = '&{template:'+fields.defaultTemplate+'}{{name='+charCS.get('name')+'\'s Powers}}'
					+ '{{='+charCS.get('name')+' has been granted the following powers (if any)}}';
		
			classes = classObjects(charCS);	

			for (const c of classes) {
				if (c.obj) {
					className = c.obj[1].name;
					spellSet = addMIspells( charCS, c.obj[1] );
					if (spellSet.PW[0].length) {
						powers.push(spellSet.PW[0].join('|'));
					}
					content += '{{'+className+'='+(spellSet.PW[0].join(', ') || 'None')+'}}';
				}
			}
			setAttr( charCS, [fields.Spellbook[0]+spellLevels.pw[1].book,fields.Spellbook[1]], powers.join('|') );
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		});
		args[2] = '';
		makeSpellsMenu( args, selected, ('All Class powers added') );
		return;
	}

	/*
	 * Handle choosing a weapon proficiency to add to the 
	 * selected character
	 */
	 
	var handleChooseProf = function( args, selected ) {
		
		var weapon = args[1],
			weap = abilityLookup( fields.WeaponDB, weapon, charCS ),
			weapProf = false,
			meleeWeap = false,
			weapType = false;
			
		if (weap.obj) {
			let specs = weap.obj[1].body,
				weaponSpecs = specs.match(/}}\s*specs\s*=(.*?){{/im);
			weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(/\[\s*?(\w[\s\|\w\-]*?)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[\s\|\w\-]*?\w)\s*?\]/g)] : [];
			for (let i=0; i<weaponSpecs.length; i++) {
                weapProf = weapProf || weaponSpecs[i][1];
				meleeWeap = meleeWeap || weaponSpecs[i][2].toLowerCase();
				weapType = weapType || weaponSpecs[i][4];
			}
		}
		makeProficienciesMenu( ['',weapProf,(meleeWeap == 'melee'),weapType], selected, 'Chosen '+meleeWeap+' proficiency \n**'+weapProf+'**\n of type '+weapType );
	}
	
	/*
	 * Handle adding a weapon proficiency to a character sheet
	 */
	 
	var handleAddProf = function( args, selected ) {
		
		var	weapLevel = args[0],
			weapon = args[1],
			weapType = args[2],
			charCS, row;
			
		_.each( selected, e => {
			charCS = getCharacter( e._id, true );
			if (charCS) {
				let ProfTable = getTable( charCS, fieldGroups.WPROF ),
					weapProf = ProfTable.values;
				if (_.isUndefined(row = ProfTable.tableFind( fields.WP_name, weapon ))) {
    				if (_.isUndefined(row = ProfTable.tableFind( fields.WP_name, '-' ))) {
    				    row = ProfTable.sortKeys.length;
    				}
				}
				if (weapLevel == 'NOT-PROF') {
					ProfTable.addTableRow( row );
				} else {
					weapProf[fields.WP_name[0]][fields.WP_name[1]] = weapon;
					weapProf[fields.WP_type[0]][fields.WP_type[1]] = weapType;
					weapProf[fields.WP_expert[0]][fields.WP_expert[1]] = '1';
					weapProf[fields.WP_specialist[0]][fields.WP_specialist[1]] = (weapLevel.toUpperCase() == 'SPECIALIST' || weapLevel.toUpperCase() == 'MASTERY') ? '1' : '0';
					weapProf[fields.WP_mastery[0]][fields.WP_mastery[1]] = (weapLevel.toUpperCase() == 'MASTERY') ? '1' : '0';
					ProfTable.addTableRow( row, weapProf );
				}
			}
		});
		makeProficienciesMenu( [''], selected, 'Set '+weapon+' as '+weapLevel.toLowerCase() );
	}
	
	/*
	 * Handle adding all a character's weapons as Proficient
	 */
	 
	var handleAddAllProfs = function( args, selected ) {
		
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
		makeProficienciesMenu( [''], selected, msg );
	}
	
	/*
	 * Handle reviewing the specs of a weapon before adding 
	 * as a proficiency
	 */
	 
	var handleReviewProf = function( args, selected ) {
		
		var cmdStr = args.join('|'),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Return to Menu}}'
				+ '{{desc=[Return to Menu](!cmd --add-profs '+cmdStr+') or do something else}}';
		sendFeedback(content,flags.feedbackName,flags.feedbackImg);
	}
	
	/*
	 * Handle the selection of a class and level
	 */
	 
	var handleClassSelection = function( args, selected, isGM ) {
		
		if (!selected || !selected.length) return;
		
		var cmd = args[0],
			value = args[1],
			tokenID = selected[0]._id,
			charCS = getCharacter( tokenID ),
			msg = '';
			
		if (!charCS) return;
		
		switch (cmd) {
		case BT.CLASS_F:
			setAttr( charCS, fields.Fighter_class, value );
			msg = 'Warrior class '+value+' selected';
			args[2] = 'Warrior';
			break;
		case BT.CLASS_W:
			setAttr( charCS, fields.Wizard_class, value );
			msg = 'Wizard class '+value+' selected';
			args[2] = 'Wizard';
			break;
		case BT.CLASS_P:
			setAttr( charCS, fields.Priest_class, value );
			msg = 'Priest class '+value+' selected';
			args[2] = 'Priest';
			break;
		case BT.CLASS_R:
			setAttr( charCS, fields.Rogue_class, value );
			msg = 'Rogue class '+value+' selected';
			args[2] = 'Rogue';
			break;
		case BT.CLASS_PSI:
			setAttr( charCS, fields.Psion_class, value );
			msg = 'Psion class '+value+' selected';
			args[2] = 'Psionicist';
			break;
		case BT.LEVEL_F:
			setAttr( charCS, fields.Fighter_level, (parseInt(value) || 0) );
			msg = 'Warrior level '+(parseInt(value) || 0)+' selected';
			args[1] = attrLookup( charCS, fields.Fighter_class );
			args[2] = 'Warrior';
			break;
		case BT.LEVEL_W:
			setAttr( charCS, fields.Wizard_level, (parseInt(value) || 0) );
			msg = 'Wizard level '+(parseInt(value) || 0)+' selected';
			args[1] = attrLookup( charCS, fields.Wizard_class );
			args[2] = 'Wizard';
			break;
		case BT.LEVEL_P:
			setAttr( charCS, fields.Priest_level, (parseInt(value) || 0) );
			msg = 'Priest level '+(parseInt(value) || 0)+' selected';
			args[1] = attrLookup( charCS, fields.Priest_class );
			args[2] = 'Priest';
			break;
		case BT.LEVEL_R:
			setAttr( charCS, fields.Rogue_level, (parseInt(value) || 0) );
			msg = 'Rogue level '+(parseInt(value) || 0)+' selected';
			args[1] = attrLookup( charCS, fields.Rogue_class );
			args[2] = 'Rogue';
			break;
		case BT.LEVEL_PSI:
			setAttr( charCS, fields.Psion_level, (parseInt(value) || 0) );
			msg = 'Psion level '+(parseInt(value) || 0)+' selected';
			args[1] = attrLookup( charCS, fields.Psion_class );
			args[2] = 'Psionicist';
			break;
		default:
			sendDebug( 'handleClassSelection: invalid class selection command '+cmd);
			sendError( 'Internal CommandMaster Error' );
			break;
		}
		
		makeClassMenu( args, selected, isGM, msg );
		return;
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
				
		if (!changedAbilities.length) log('handleChangedCmds no characters or databases need updating');
		return changedAbilities;
	}
	
	/*
	 * Handle editing all abilities in the campaign to change 
	 * 'oldStr' to 'newStr', with an optional confirmation 
	 * (default is to confirm every change).
	 */
	
	var handleEditAbilities = function( args, firstFind ) {
		
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
		makeAbilitiesMenu( args, selected );
		return;
	};
	
	/*
	 * Handle the setting of base saving throws based on 
	 * the level(s) of the character - best save wins
	 */
	 
	var handleSetSaves = function( args, selected ) {
		
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
				race = (attrLookup( charCS, fields.Race ) || 'human').toLowerCase().replace(reIgnore,''),
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
	 * Handle changing the token bars/circles to the
	 * standard used by the APIs, or all to None, as 
	 * selected by the user 
	 */
	 
	var handleSetTokenBars = function( args, selected ) {
		
		var cmd = args[0],
		    abMenu = args[1];
		
		_.each( selected, token => {
			var tokenID = token._id,
				curToken = getObj('graphic',tokenID),
				charCS = getCharacter(tokenID),
				content;
				
			content = '&{template:'+fields.defaultTemplate+'}{{name=Setting Token Circles for '+curToken.get('name')+'}}{{desc=';
			if (!charCS)
				content += 'Token does not represent a character\n';
			else if (cmd.toUpperCase() == BT.AB_TOKEN_NONE) {
				curToken.set('bar1_link','');
				curToken.set('bar2_link','');
				curToken.set('bar3_link','');
				content += 'Bar 1, 2 & 3 set to \"None\"';
			} else {
				let AC = attrLookup(charCS,[fields.AC[0],null]),
				    thac0 = attrLookup(charCS,[fields.Thac0_base[0],null]),
				    HP = attrLookup(charCS,[fields.HP[0],null]),
					monsterACval = parseInt(attrLookup(charCS,fields.MonsterAC) || 10),
					ACval = parseInt(attrLookup(charCS,fields.AC) || 10),
					thac0val = parseInt(attrLookup(charCS,fields.Thac0) || 20),
					monsterThac0val = parseInt(attrLookup(charCS,fields.MonsterThac0) || 20),
					baseThac0val = parseInt(attrLookup(charCS,fields.Thac0_base) || 20);
				
				if (isNaN(ACval) || String(ACval).trim() == '') ACval = 10;
				if (isNaN(monsterACval) || String(monsterACval).trim() == '') monsterACval = 10;
				if (!thac0val || isNaN(thac0val) || String(thac0val).trim() == '') thac0val = 20;
				if (!monsterThac0val || isNaN(monsterThac0val) || String(monsterThac0val).trim() == '') monsterThac0val = 20;
				if (!baseThac0val || isNaN(baseThac0val) || String(baseThac0val).trim() == '') baseThac0val = 20;

				ACval = Math.min(monsterACval,ACval),
				thac0val = Math.min(monsterThac0val,thac0val,baseThac0val);
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
				
				curToken.set('bar1_link',(AC ? AC.id : ''));
				curToken.set('bar2_link',(thac0 ? thac0.id : ''));
				curToken.set('bar3_link',(HP ? HP.id : ''));
				
				content += 'Bar 1 set to '+(AC ? AC.get('name') : 'undefined')+', '
						+  'Bar 2 set to '+(thac0 ? thac0.get('name') : 'undefined')+', '
						+  'Bar 3 set to '+(HP ? HP.get('name') : 'undefined');
			}
			content += '}}{{desc1=[Return to Menu](!cmd --button '+abMenu+')}}';
			sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		});
		return;
	}
	
	/*
	 * Handle switching char sheet control between DM & Players
	 */
	 
	var handleSetCSctrl = function( args ) {
		
		var charID = args[1],
			playerID = args[2] || '',
			charCS = getObj('character',charID),
			tokens = findObjs({type:'graphic',subtype:'token',represents:charID});
		
		charCS.set('inplayerjournals',playerID);
		charCS.set('controlledby',playerID);
		_.each(tokens,t => t.set('showplayers_name',!!playerID));
		
		doCheckCharSetup();
	};
	
// ------------------------------------------------------------- Command Action Functions ---------------------------------------------

	/**
	 * Show help message
	 */ 

	var showHelp = function() {
		var handoutIDs = getHandoutIDs();
		var content = '&{template:'+fields.defaultTemplate+'}{{title=CommandMaster Help}}{{CommandMaster Help=For help on using CommandMaster, and the !cmd commands, [**Click Here**]('+fields.journalURL+handoutIDs.CommandMasterHelp+')}}{{Class Database=For help on using and adding to the Class Database, [**Click Here**]('+fields.journalURL+handoutIDs.ClassDatabaseHelp+')}}{{Character Sheet Setup=For help on setting up character sheets for use with RPGMaster APIs, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterCharSheetSetup+')}}{{RPGMaster Templates=For help using RPGMaster Roll Templates, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterTemplatesHelp+')}}';

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
		
		var macro, player;

		macro = findObjs({ type: 'macro', name: 'Maint-Menu'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			macro = createObj('macro',{name:'Maint-Menu',action:'!init --maint',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Token-setup'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			macro = createObj('macro',{name:'Token-setup',action:'!cmd --abilities',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Add-Items'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			macro = createObj('macro',{name:'Add-Items',action:'!magic --gm-edit-mi @{selected|token_id}',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'End-of-Day'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			macro = createObj('macro',{name:'End-of-Day',action:'!init --end-of-day',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Initiative-menu'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			macro = createObj('macro',{name:'Initiative-menu',action:'!init --init',playerid:senderID});
		}
		macro = findObjs({ type: 'macro', name: 'Check-tracker'},{caseInsensitive:true});
		if (!macro || !macro.length || !macro[0]) {
			macro = createObj('macro',{name:'Check-tracker',action:'!init --check-tracker',playerid:senderID});
		}
		player = findObjs({ type: 'player', id: senderID });
		if (player && player[0]) {
			player[0].set('showmacrobar','true');
		} else {
			log('doInitialise: player not found');
		}
		sendFeedback(messages.initMsg,flags.feedbackName,flags.feedbackImg);
		return;
	}

	/*
	 * Display a menu of ability button options
	 */
 
	var doAbilityMenu = function(args, selected) {

		abilities = [];
		updateDBindex(true);  // Update the database indexes to speed up item searches
		
		args.unshift(BT.AB_SIMPLE);
		makeAbilitiesMenu(args,selected);
		return;
	}
	
	/*
	 * Display a menu of spells to add to spellbooks of the 
	 * selected characters
	 */
 
	var doAddSpells = function(args, selected) {
		
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			if (!args || args.length < 1) {
				args[0] = 'MUSPELLS';
			};
			
			makeSpellsMenu(args, selected);
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
	
	var doSetAllProf = function(args, selected) {
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			handleAddAllProfs(args, selected);
		}
		return;
	}
	
	/*
	 * Display a menu of weapon proficiencies to 
	 * add to the selected characterSet
	 */
	 
	var doAddProfs = function(args, selected) {
		if (!selected || !selected.length) {
			sendError('No tokens selected');
		} else {
			makeProficienciesMenu(args, selected, '');
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
	 * Checking Character Sheet setup takes some time, as it scans 
	 * all the character sheets, so pop up a please wait message.
	 */
	 
	var doCheckCharSetup = function() {
		sendFeedback('Checking Character Sheet data.  Please wait...',flags.feedbackName,flags.feedbackImg);
		setTimeout(doCheckCharSetupDelayed,0);
		return;
	}
	
	/*
	 * Check all Character Sheets to assess if a PC, NPC, or Creature, and 
	 * whether DM or Player controlled.  Provide the DM with lists of the 
	 * analysis & the options to correct errors.
	 */
	 
	var doCheckCharSetupDelayed = function() {
		
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
	};	

	/*
	 * Display a menu of available classes and allow the user to 
	 * review and/or change those shown
	 */

	var doChooseClass = function(args, selected, isGM) {
		
		var curToken = getObj('graphic',args[0]);
		
		if (curToken) {
			selected = [{_id:args[0]}]
		}
		makeClassMenu(args,selected,isGM);
		return;
	};
	
	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, isGM, selected ) {

	if (! args || args.length < 1) {
			sendDebug('doButton: Invalid number of arguments');
			sendError('Invalid CommandMaster syntax');
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
		
			handleChangeWeapon( args );
			break;

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
		
			makeClassMenu( args, selected, isGM );
			break;
			
		case BT.AB_SAVES :
		
			handleSetSaves( args, selected );
			break;
			
		case BT.AB_TOKEN :
		case BT.AB_TOKEN_NONE :
		
			handleSetTokenBars( args, selected );
			break;
			
		case BT.STR_REPLACE:
		
			handleEditAbilities( args, false );
			break;
			
		case BT.PLAYER_CTRL:
		case BT.CLEAR_CTRL:
		
			handleSetCSctrl( args );
			break;
			
		case BT.SWITCH_CS_CHECK:
		
			state.CommandMaster.CheckChar = !state.CommandMaster.CheckChar;
			doCheckCharSetup( args );
			break;
			
		case BT.ALL_PRSPELLS:
		
			handleAddAllPRspells( args, selected );
			break;
			
		case BT.ALL_POWERS:
		
			handleAddAllPowers( args, selected );
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
		
			handleClassSelection( args, selected, isGM );
			break;
			
		case BT.REVIEW_CLASS:
		
			makeClassReviewDialogue( args, selected, isGM );
			break;
			
		case 'MUSPELLS':
		case 'PRSPELLS':
		case 'POWERS':
		case 'CHOOSE_MUSPELLS':
		case 'CHOOSE_PRSPELLS':
		case 'CHOOSE_POWERS':
		
			makeSpellsMenu( args, selected );
			break;
			
		case 'REV_MUSPELLS':
		case 'REV_PRSPELLS':
		case 'REV_POWERS':
		
			handleReviewSpell( args );
			break;
			
		case 'ADD_MUSPELLS':
		case 'ADD_PRSPELLS':
		case 'ADD_POWERS':
		
			handleAddSpell( args, selected );
			break;
			
		case 'CHOOSE_PROF':
		
			handleChooseProf( args, selected );
			break;
			
        case 'REVIEW_PROF':
            
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
			t = 0;
			
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

		if (msg.type !=='api' || args.indexOf('!cmd') !== 0)
			{return;}

        sendDebug('CommandMaster called');

		args = args.split(' --');
		args.shift();

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
			setTimeout( () => {
				var arg = e, i=arg.indexOf(' '), cmd, argString;
				sendDebug('Processing arg: '+arg);
				
				cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
				argString = (i<0 ? '' : arg.substring(i+1).trim());
				arg = argString.split('|');
				
				try {
					if (cmd == 'class-menu') {
						doChooseClass(arg, selected, isGM);
						return;
					}
					if (!isGM) {
						return;
					}
					switch (cmd) {
					case 'display-ability':
						doDisplayAbility(arg,selected,senderId,flags.feedbackName,flags.feedbackImg);
						break;
					case 'register':
						doRegistration(argString);
						break;
					case 'abilities':
						doAbilityMenu(arg,selected);
						break;
					case 'initialise':
						doInitialise(senderId);
						break;
					case 'check-chars':
						doCheckCharSetup();
						break;
					case 'edit':
						doEditAbilities(arg);
						break;
					case 'add-spells':
						doAddSpells(arg,selected);
						break;
					case 'add-profs':
						doAddProfs(arg,selected);
						break;
					case 'set-prof':
						doSetProf(arg,selected);
						break;
					case 'set-all-prof':
						doSetAllProf(arg,selected);
						break;
					case 'index-db':
						doIndexDB(arg);
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
					case 'button':
						doButton(arg,isGM,selected);
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
				} catch (e) {
					log('CommandMaster handleChatMsg: JavaScript '+e.name+': '+e.message+' processing cmd '+cmd+' '+argString);
					sendDebug('CommandMaster handleChatMsg: JavaScript '+e.name+': '+e.message+' processing cmd '+cmd+' '+argString);
					sendError('CommandMaster JavaScript '+e.name+': '+e.message);
				}
			}, (300*t++), e);
    	});
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
	CommandMaster.init(); 
	CommandMaster.registerAPI();
});