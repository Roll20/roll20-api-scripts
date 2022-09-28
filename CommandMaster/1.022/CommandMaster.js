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
 * v0.002  04/05/2021  Fixes completed to Abilities menu and Registration.
 * v0.003  05/05/2021  As is working for characters with tokens, changed
 *                     ability updates on registration to scan and update 
 *                     all ability objects (as is originally intended).
 * v0.004  13/05/2021  Added the monster initiative menu to the ability
 *                     buttons menu.
 * v0.005  15/05/2021  Added the detailed actions menu, which pops up all 
 *                     Ability Action buttons that have been passed to 
 *                     CommandMaster (as opposed to the simple menu,
 *                     that just pops up the common ones)
 * v0.006  20/05/2021  Added --editAbilities command to change a string in
 *                     all ability macros to another string
 * v0.007  07/06/2021  Take into account the new !attk --other-menu command
 *                     to replace the hard-coded one in previous versions.
 * v0.008  12/06/2021  Add a function to the Update Token menu to set 
 *                     the correct base saving throws
 * v0.009  19/06/2021  Add a function to set the token circles to represent 
 *                     the correct standard fields of AC, Thac0 & HP
 * v1.010  28/06/2021  Adapted chat message handling to have a try/catch strategy 
 *                     for error capture and prevent the API falling over.
 *                     Formally defined as a release.
 * v1.011  14/07/2021  Added the ability to add MU, PR & POWER spellbooks
 * v1.012  25/08/2021  sendResponse() for tokens controlled by All Players now sends message
 *                     to all players, including the GM.
 * v1.013  29/08/2021  Fixed Token Setup: Set Token Circles to be more accurate
 *                     in choosing AC & Thac0 based on the Character Sheet
 * v1.014  09/09/2021  Added setting up proficiencies to Token Setup
 * v1.015  20/10/2021  Fixed error in calculation of saves
 * v1.016  24/10/2021  Started coding of database files
 * v1.017  12/11/2021  Highlight existing abilities when running the 
 *                     --abilities command
 * v1.018  15/11/2001  Reduced fields object to only include fields used in 
 *                     CommandMaster API
 * v1.019  29/11/2021  Fixed issues with API command registration & update
 * v1.020  06/12/2022  Added multi-type & multi-supertype weapon proficiency support
 *                     Added indexing of database Ability objects to improve performance
 * v1.021  16/01/2022  Fixed bug of handling undefined API command registrations
 *                     Fixed overrun on PR spellbook setup
 * v1.022  23/01/2022  Fixed illegal characters not rendered by One-Click install
 */
 
var CommandMaster = (function() {
	'use strict'; 
	var version = 1.022,
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
	
	const fields = Object.freeze({
		feedbackName:       'CommandMaster',
		feedbackImg:        'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		defaultTemplate:    '&{template:2Edefault}',
		CommandMaster:      '!cmd',
		ToHitRoll:			'1d20',
		MagicItemDB:        'MI-DB',
		WeaponDB:			'MI-DB',
		MUSpellsDB:			'MU-Spells-DB',
		PRSpellsDB:			'PR-Spells-DB',
		PowersDB:			'Powers-DB',
		dbVersion:			['db-version','current'],
		SheetVersion:		['character_sheet','current'],
		Race:               ['race','current'],
		Fighter_class:      ['class1','current'],
		Wizard_class:		['class2','current'],
		Priest_class:		['class3','current'],
		Rogue_class:		['class4','current'],
		Psion_class:		['class5','current'],
		Total_level:        ['level-total','current'],
		Fighter_level:      ['level-class1','current'],
		Wizard_level:       ['level-class2','current'],
		Priest_level:       ['level-class3','current'],
		Rogue_level:        ['level-class4','current'],
		Psion_level:        ['level-class5','current'],
		Constitution:		['constitution','current'],
		Monster_hitDice:	['hitdice','current'],
		Monster_hpExtra:	['monsterhpextra','current'],
		Monster_int:		['monsterintelligence','current'],
		HP:					['HP','current'],
		MonsterAC:			['monsterarmor','current'],
		Thac0:              ['thac0','current'],
		Thac0_base:			['thac0-base','current'],
		MonsterThac0:		['monsterthac0','current'],
		AC:					['AC','current'],
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
		MW_table:           ['repeating_weapons',0],
		Dmg_table:			['repeating_weapons-damage',0],
		RW_table:           ['repeating_weapons2',0],
		Ammo_table:         ['repeating_ammo',0],
		WP_table:           ['repeating_weaponprofs',0],
		WP_name:            ['weapprofname','current','-'],
		WP_type:            ['weapprofname','max',''],
		WP_expert:			['expert','current','0'],
		WP_specialist:      ['specialist','current','0'],
		WP_mastery:         ['mastery','current','0'],
		MUSpellbook:		['spellmem','current',''],
		PRSpellbook:		['spellmem','current',''],
		Spells_table:       ['repeating_spells',false],
		Casting_level:      ['casting-level','current'],
		Casting_name:       ['casting-name','current'],
		PowersSpellbook:	['spellmem23','current',''],
		Powers_table:       ['repeating_spells',false],
		Items_table:		['repeating_potions',0],
		Items_name:			['potion','current','-'],
		ItemContainerSize:	['container-size','current'],
		ItemWeaponList:		['spellmem','current'],
	});

	const stdDB = ['MU-Spells-DB','PR-Spells-DB','Powers-DB','MI-DB','MI-DB-Ammo','MI-DB-Armour','MI-DB-Light','MI-DB-Potions','MI-DB-Rings','MI-DB-Scrolls-Books','MI-DB-Wands-Staves-Rods','MI-DB-Weapons'];
	
	const PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	const messages = Object.freeze({
		noChar: '/w "gm" &{template:2Edefault} {{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
		initMsg: '/w gm &{template:2Edefault} {{name=Initialisation Complete}}{{desc=Initialisation complete.  Command macros created.  Go to Macro tab (next to the cog at the top of the Chat window), and select them to show In Bar, and turn on the Macro Quick Bar.  Then start by dragging some characters on to the map to create tokens, and use Token-setup and Add-Items on each}}',
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
	
	const handouts = Object.freeze({
	CommandMaster_Help:	{name:'CommandMaster Help',
						 version:1.03,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">CommandMaster Help v1.03</span>'
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
							+'<pre>--add-spells [POWERS/MUSPELLS/PRSPELLS] | [level]<br>'
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
							+'</ul>'
							+'<p>The DM can drag Macro Bar buttons around on-screen to re-order them, or even right-click them to change their name and colour of the button.  Feel free to do this to make the Macro Bar as usable for you as you desire.</p>'
							+'<h3>1.2 Setup Tokens & Character Sheets</h3>'
							+'<pre>--abilities</pre>'
							+'<p>Displays a menu with which one or more selected tokens and the Character Sheets they represent can be set up with the correct Token Action Buttons and data specific to the RPGMaster APIs, to work with the APIs in the best way.  The menu provides buttons to add any command registered with CommandMaster (see <b>--register</b> command) as a Token Action Button, add spells to spell books, add granted powers, add or change weapon proficiencies and proficiency levels for each weapon, set the correct saving throws based on race, class & level of character / NPC / creature, and optionally clear or set the Token \'circles\' to represent AC (bar 1), base Thac0 (bar 2) and HP (bar 3).  Essentially, using this menu accesses the commands in section 2 without the DM having to run them individually.</p>'
							+'<p>All tokens selected when menu items are used will be set up the same way: exceptions to this are using the Set Saves button (sets saves for each selected token/character sheet correctly for the specifications of that sheet), and the Set All Profs button (sets weapon proficiencies to proficient based on the weapons in each individual token/character sheet\'s item bag).  Different tokens can be selected and set up differently without having to refresh the menu.</p>'
							+'<h2>2. Character Sheet configuration</h2>'
							+'<p>The commands in this section can be accessed using the --abilities command menu.  The individual commands below are used less frequently.</p>'
							+'<h3>2.1 Add spells to spell book</h3>'
							+'<pre>--add-spells [POWERS/MUSPELLS/PRSPELLS] | [level]</pre>'
							+'<p>Displays a menu allowing spells in the Spells Databases to be added to the Character Sheet(s) represented by the selected Token(s).  If no spell type and/or spell level is specified, the initial menu shown is for Level 1 Wizard spells (MUSPELLS). Buttons are shown on the menu that allow navigation to other levels, spell types and powers.</p>'
							+'<p><b>Note:</b> adding spells / powers to a sheet does not mean the Character can immediately use them.  They must be <i>memorised</i> first.  Use the commands in the <b>MagicMaster API</b> to memorise spells and powers.</p>'
							+'<h3>2.2 Choose weapon proficiencies</h3>'
							+'<pre>--add-profs</pre>'
							+'<p>Displays a menu from which to select proficiencies and level of proficiency for any weapons in the Weapon Databases.  Also provides a button for making the Character proficient in all weapons carried (i.e. those currently in their Item table).</p>'
							+'<p>All current proficiencies are displayed, with the proficiency level of each, which can be changed or removed.</p>'
							+'<p><b>Note:</b> this does more than just entering the weapon in the proficiency table.  It adds the <i>weapon group</i> that the weapon belongs to as a field to the table (see weapon database help handouts for details), which is then used by the <b>AttackMaster API</b> to manage <i>related weapon</i> attacks and give the correct proficiency bonuses or penalties for the class and weapon used.</p>'
							+'<h3>2.3 Add weapon proficiencies</h3>'
							+'<pre>--set-prof  [NOT-PROF/PROFICIENT/SPECIALIST/MASTERY] | weapon | weapon-type </pre>'
							+'<p>Sets a specific weapon proficiency to a named level.  If the proficiency level is omitted, PROFICIENT is assumed.  If the weapon already exists in the proficiencies table, the existing proficiency level is updated to that specified.  Otherwise, the weapon (and its weapon group) are added to the table at the specified level.</p>'
							+'<p><b>Note:</b> this does more than just entering the weapon in the proficiency table.  It adds the weapon group that the weapon belongs to as a field to the table (see weapon database help handouts for details), which is then used by the AttackMaster API to manage related weapon attacks and give the correct proficiency bonuses or penalties for the class and weapon used.</p>'
							+'<h3>2.4 Add proficiencies for all carried weapons</h3>'
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
							+'	<tr><th scope="row">Alternative<br>(no ; )</th><td> \\vbar</td><td>\\ques</td><td>\\lbrak</td><td>\\rbrak</td><td>\\lt</td><td>\\gt</td><td>\\at</td><td>\\dash</td><td>\\vbar</td><td>\\clon</td><td>\\amp</td><td>\\lbrc</td><td>\\rbrc</td></tr>'
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
							+'<p>Replaces an existing \'escaped\' string with a new replacement string in all ability macros on all Character Sheets including the API character sheet databases.  These strings both use the same escape sequence replacements as for the <b>--register</b> command (see section 3.1) as in fact <b>--register</b> and <b>--edit</b> use the same functionality.</p>'
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
		POWER:      	'POWER',
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
		ABILITY:		'ABILITY',
		AB_OTHER:		'AB_OTHER',
		AB_REPLACE:     'AB_REPLACE',
		AB_SIMPLE:		'AB_SIMPLE',
		AB_FULL:		'AB_FULL',
		AB_SAVES:		'AB_SAVES',
		AB_TOKEN:		'AB_TOKEN',
		AB_TOKEN_NONE:	'AB_TOKEN_NONE',
		STR_REPLACE:    'STR_REPLACE',
	});
		
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
		
	/*
	 * Table definitions mapping field prescripts to repeating tables 
	 */

	const tableIntro = Object.freeze({
		MELEE:['MW_',fields.MW_table],
		DMG:['Dmg_',fields.Dmg_table],
		RANGED:['RW_',fields.RW_table],
		AMMO:['Ammo_',fields.Ammo_table],
		WPROF:['WP_',fields.WP_table],
		MI:['Items_',fields.Items_table],
		SPELL:['Spells_',fields.Spells_table],
		POWER:['Powers_',fields.Powers_table],
	});
	
	const reIgnore = /[\s\-\_]*/gi;
	
	const replacers = [
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
		
	const encoders = [
			[/\r?\n/gm,'\\n'],
			[/'/gm,"\\'"],
			[/&/gm,"\\\\amp"],
			[/>/gm,"\\\\gt"],
			[/</gm,"\\\\lt"]
		];

		
	const classLevels=[[fields.Fighter_class,fields.Fighter_level],
					   [fields.Wizard_class,fields.Wizard_level],
					   [fields.Priest_class,fields.Priest_level],
					   [fields.Rogue_class,fields.Rogue_level],
					   [fields.Psion_class,fields.Psion_level]];
	
	/*
	 * Object defining simple redMaster series ability actions to 
	 * their respective APIs and registered API actions.
	 */

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
	
	const spellLevels = Object.freeze({ 
		mu: [{ spells: 0, base: 0,  book: 0 },
		     { spells: 0, base: 1,  book: '' },
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
		pw:	[{ spells: 0, base: 0,  book: 0 },
			 { spells: 9, base: 67, book: 23}],
		mi:	[{ spells: 0, base: 0,  book: 0 },
			 { spells: 0, base: 64, book: 22}],
		pm:	[{ spells: 0, base: 0,  book: 0 },
			 { spells: 0, base: 61, book: 21}],
	});

	const rangedWeapMods = Object.freeze({
		N	: -5,
		PB	: 2,
		S	: 0,
		M	: -2,
		L	: -5,
		F	: -20,
	});
	
	const classNonProfPenalty = [[fields.Fighter_level,-2],
                              [fields.Wizard_level,-5],
	                          [fields.Priest_level,-3],
	                          [fields.Rogue_level,-3]];
	
	const raceToHitMods = Object.freeze({
		elf: [['bow',1],['longsword',1],['shortsword',1]],
		halfling: [['sling',1],['thrown-blade',1]],
	});
	
	const saveLevels = Object.freeze ({
		Warrior: 	[0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9],
		Wizard:		[0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5],
		Priest:		[0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7],
		Rogue:		[0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6],
	});
	
	const baseSaves = Object.freeze ({
		Warrior:	[[16,18,17,20,19],[14,16,15,17,17],[13,15,14,16,16],[11,13,12,13,14],[10,12,11,12,13],[8,10,9,9,11],[7,9,8,8,10],[5,7,6,5,8],[4,6,5,4,7],[3,5,4,4,6]],
		Wizard:		[[16,18,17,20,19],[14,11,13,15,12],[13,9,11,13,10],[11,7,9,11,8],[10,5,7,9,6],[8,3,5,7,4]],
		Priest:		[[16,18,17,20,19],[10,14,13,16,15],[9,13,12,15,14],[7,11,10,13,12],[6,10,9,12,11],[5,9,8,11,10],[4,8,7,10,9],[2,6,5,8,7]],
		Rogue:		[[16,18,17,20,19],[13,14,12,16,15],[12,12,11,15,13],[11,10,10,14,11],[10,8,9,13,9],[9,6,8,12,7],[8,4,7,11,5]],
	});
	
	const raceSaveMods = Object.freeze ({
		dwarf:		{par:0,poi:3.5,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},
		elf:		{par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		gnome:		{par:0,poi:0,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},
		halfelf:	{par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		halfling:	{par:0,poi:3.5,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},
		halforc:	{par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
		human:		{par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0},
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
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"'
	};
	
	var DBindex = {
		mu_spells_db:	{},
		pr_spells_db:	{},
		powers_db:		{},
		mi_db:			{}
	};
	
	var flags = {
		image: false,
		archive: false,
		dice3d: true,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
	};
	
	var parsedCmds = false,
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
		if (!state.CommandMaster.attrsToCreate)
			{state.CommandMaster.attrsToCreate = {};}
		if (!state.CommandMaster.cmds) {
	        state.CommandMaster.cmds = [];
			state.CommandMaster.cmds[0] = 'Specials|Display special attacks and defences|attk|\n/w "`{selected|character_name}" &{template:2Edefault}{{name=Special Attacks & Defences for\n`{selected|character_name}}}{{Special Attacks=`{selected|monsterspecattacks} }}{{Special Defences=`{selected|monsterspecdefenses} }}|';
			state.CommandMaster.cmds[1] = 'Bar|Add inactive bar as an action button|money| |';
		}
		if (!state.CommandMaster.debug)
		    {state.CommandMaster.debug = false;}
			
		setTimeout(() => updateHandouts(true,findTheGM()), 5000);
		setTimeout(handleChangedCmds,10000);

		log(`-=> CommandMaster v${version} <=-`);

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
     * Send API command to chat
     */

    var sendCommandAPI = function(msg, senderId) {
        var as;
		if (!msg) {
		    sendDebug('sendCommandAPI: no msg');
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
		var handshake = '!'+api+' --hsq cmd'+((cmd && cmd.length) ? ('|'+cmd) : '');
		sendInitAPI(handshake);
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
			if (_.isUndefined(attrDef)) {log('setAttr attrDef corrupted:'+attrDef);return undefined;}
			sendDebug( 'setAttr: character ' + character.get('name') + ' attribute ' + attrDef[0] + ' ' + attrDef[1] + ' set to ' + attrValue );
			if (attrDef[3]) {
				attrObj.setWithWorker( attrDef[1], String(attrValue) );
			} else {
				attrObj.set( attrDef[1], String(attrValue) );
			}
		}
		return attrObj;
	}
	
	/**
	* Create any pending attributes in attrsToCreate using ChatSetAttr
	* rather than build a function myself - though this will only
	* handle simple attributes, not repeating tables
	**/
/*	
	var createAttrs = function( silent, replace ) {
		
		if (state.magicMaster.attrsToCreate) {
			_.each( state.magicMaster.attrsToCreate, function( attrs, charID ) {
				let setVars = '!setattr ' + ( silent ? '--silent ' : '' ) + ( replace ? '--replace ' : '' ) + '--charid ' + charID;
					setVars += attrs;
				sendDebug( 'createAttrs: creating attributes for ' + getAttrByName( charID, 'character_name' ));
				sendMagicAPI( setVars );
			});
			state.magicMaster.attrsToCreate = {};
		};
	};
	
/* -------------------------------------------------------------- Ability Management ----------------------------------------
	
	/**
	 * Find an ability macro with the specified name in any 
	 * macro database with the specified root name, returning
	 * the database name, and the matching "ct-" object.
	 * If can't find a matching ability macro or "ct-" object
	 * then return undefined objects
	 **/
	 
	var abilityLookup = function( rootDB, abilityName, silent=false ) {
	    
        abilityName = abilityName.toLowerCase().replace(reIgnore,'');
        if (!abilityName || abilityName.length==0) {
			return {dB: rootDB, obj: undefined, ct: undefined};
        }
		
		var charID, obj, dBname,
			abilityObj = [],
			ctObj = [],
	        rDB = rootDB.toLowerCase().replace(/-/g,'_'),
			objIndex = DBindex[rDB][abilityName];
	    
		if (!objIndex) {
			log('Not found ability '+abilityName);
			if (!silent) sendError('Not found ability '+abilityName);
			return {dB: rootDB, obj: undefined, ct: undefined};
		} else {
			obj = getObj('ability',objIndex[0]);
			charID = obj.get('characterid');
			dBname = getObj('character',charID).get('name');
			abilityObj[0] = obj;
			ctObj[0] = getObj('attribute',objIndex[1]);
			if (!ctObj || ctObj.length === 0 || !ctObj[0]) {
				log('Can\'t find ct-'+abilityName+' in '+dBname);
				if (!silent) sendError('Can\'t find ct-'+abilityName+' in '+dBname);
				return {dB: rootDB, obj: undefined, ct: undefined};
			};
		};
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
	
/* ------------------------------------------------ Utility Functions -------------------------------------------- */
	
	
	/**
	 * Update or create the help handouts
	 **/
	 
	var updateHandouts = function(silent,senderId) {
		
		_.each(handouts,(obj,k) => {
			let dbCS = findObjs({ type:'handout', name:obj.name },{caseInsensitive:true});
			if (!dbCS || !dbCS[0]) {
			    log(obj.name+' not found.  Creating version '+obj.version);
				if (!silent) sendFeedback(obj.name+' not found.  Creating version '+obj.version);
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
	 * Create an internal index of items in the databases 
	 * to make searches much faster.  Index entries indexed by
	 * database root name & short name (name in lower case with 
	 * '-', '_' and ' ' ignored).  index[0] = abilityID,
	 * index[1] = ct-attributeID
	 **/
	 
	var updateDBindex = function() {
		
		var rootDB, magicDB, validDB,
			dbName, shortName, attrName;
		
		filterObjs( function(obj) {
			if (obj.get('type') != 'ability') return false;
			if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
			dbName = magicDB.get('name').replace(/-/g,'_');
			if (/\s*v\d*\.\d*/i.test(dbName)) return false;
			let validDB = false;
			for (let rDB in DBindex) {
			    if (dbName.toLowerCase().startsWith(rDB)) {
			        validDB = true;
			        rootDB = rDB;
			    }
			}
			if (!validDB) return false;
			let shortName = obj.get('name');
			if (shortName != '-') shortName = shortName.toLowerCase().replace(reIgnore,'');
			if (_.isUndefined(DBindex[rootDB][shortName]) || !stdDB.includes(dbName)) {
				DBindex[rootDB][shortName] = [obj.id,''];
			}
			return true;
		});
		filterObjs( function(obj) {
			if (obj.get('type') != 'attribute') return false;
			attrName = obj.get('name');
			if (!attrName.startsWith('ct-')) return false;
			if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
			dbName = magicDB.get('name').replace(/-/g,'_');
			if (/\s*v\d*\.\d*/i.test(dbName)) return false;
			let validDB = false;
			for (let rDB in DBindex) {
			    if (dbName.toLowerCase().startsWith(rDB)) {
			        validDB = true;
			        rootDB = rDB;
			    }
			}
			if (!validDB) return false;
			let shortName = attrName.toLowerCase().replace(reIgnore,'').substring(2);
			if (!DBindex[rootDB][shortName]) return false;
			if (!stdDB.includes(dbName) || !DBindex[rootDB][shortName][1].length) {
				DBindex[rootDB][shortName][1] = obj.id;
			};
		});

		return;
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
			sendError('Invalid CommandMaster arguments');
			return undefined;
		};

		curToken = getObj( 'graphic', tokenID );

		if (!curToken) {
			sendDebug('getCharacter: tokenID is not a token');
			sendError('Invalid CommandMaster arguments');
			return undefined;
		};
			
		charID = curToken.get('represents');
			
		if (!charID) {
			sendDebug('getCharacter: charID is invalid');
			sendError('Invalid CommandMaster arguments');
			return undefined;
		};

		charCS = getObj('character',charID);

		if (!charCS) {
			sendDebug('getCharacter: charID is not for a character sheet');
			sendError('Invalid CommandMaster arguments');
			return undefined;
		};
		return charCS;

	};
	
	/*
	 * Function to return an object specifying what APIs have 
	 * registered with CommandMaster.
	 */
	 
	var getRegistrations = function() {
//		var r = {};
//		_.each(state.CommandMaster.cmds,(e,k)=>r[k]=e.registered );
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
	
	/**
	 * String together the value of the specified attribute from
	 * all macro databases with the specified root name, separated
	 * by |.  This is used to get a complete list of available
	 * magic spell or item macros across all databases of a
	 * specific type.
	 **/
	 
	var getMagicList = function( rootDB, listAttr ) {
		
		var magicList = [];
		filterObjs( function(objs) {
			let name = objs.get('name'),
			    newList;
			if (objs.get('type') !== 'character' || !name.startsWith(rootDB)) {return false};
			if (/\s*v\d*\.\d*/i.test(name)) {return false};
			magicList.push((attrLookup( objs, listAttr ) || '').trim());
			return true;
		});
		return magicList.filter( list => !!list ).join('|').split('|').sort().join('|');
	}

	/*
	 * Create a list of weapons from the character's magic item bag
	 */
	
	var weaponLookup = function( charCS ) {
		
		var item, itemDef,
			weapProf, weapType,
			MagicItems = getTable( charCS, {}, fields.Items_table, fields.Items_name ),
			weaponList = [],
			i = fields.Items_table[1],
			bagSize = attrLookup( charCS, fields.ItemContainerSize ),
			re = /\[.*?,\s*?(\d+)H\s*?,.*?\]/ig;
			
		do {
			item = tableLookup( MagicItems, fields.Items_name, i, false );
			if (_.isUndefined(item)) {break;}
			itemDef = abilityLookup( fields.WeaponDB, item );
			if (itemDef.obj) {
				let specs = itemDef.obj[0].get('action'),
					weaponSpecs = specs.match(/{{\s*weapon\s*=(.*?){{/im);
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
		
		var	charCS = getCharacter(selected[0]._id);
		
		if (!charCS) return;
		
		var	ProfTable = getAllTables( charCS, 'WPROF' )['WPROF'],
			profs = [], 
			types = [],
			row, wpName = '';
			
		for (row=ProfTable.table[1]; !_.isUndefined(wpName = tableLookup( ProfTable, fields.WP_name, row, false )); row++) {
            if (wpName && wpName != '-') {
    			if (tableLookup( ProfTable, fields.WP_mastery, row ) == '1') {
    				wpName += ' Mastery';
    			} else if (tableLookup( ProfTable, fields.WP_specialist, row ) == '1') {
    				wpName += ' Specialist';
    			}
    			profs.push( wpName );
    			wpName = tableLookup( ProfTable, fields.WP_type, row );
    			if (wpName && wpName.length) types.push( wpName );
            }
		}
		profs= _.chain(profs)
				.compact()
				.sort()
				.uniq(true)
				.map( item => '['+item+'](!cmd --button CHOOSE_PROF|'+item.split(' ')[0]+')')
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
                  + parseInt((attrLookup( charCS, fields.Psion_level ) || 0),10);
		}
        return level;
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
		    charCS = selected ? getCharacter(selected[0]._id) : undefined,
			isMU = cmd.includes('MU'),
			isPR = cmd.includes('PR'),
			isPower = cmd.includes('POWER'),
			curSpells = '',
			nextLevel, rootDB, listAttr, spellObj, cmdStr, desc, content;
			
		if (isPower) {
			desc = 'Powers';
			cmd = 'POWERS';
			rootDB = fields.PowersDB;
			listAttr = fields.PowersSpellbook;
		} else if (isMU) {
			desc = 'Level '+level+' MU spell book';
			cmd = 'MUSPELLS';
			rootDB = fields.MUSpellsDB;
			listAttr = [fields.MUSpellbook[0]+spellLevels.mu[level].book,fields.MUSpellbook[1]];
		} else {
			desc = 'Level '+level+' PR spell book';
			cmd = 'PRSPELLS';
			rootDB = fields.PRSpellsDB;
			listAttr = [fields.PRSpellbook[0]+spellLevels.pr[level].book,fields.PRSpellbook[1]];
		}
		args[0] = cmd;
		cmdStr = args.join('|');

		if (charCS) {
			setAttr( charCS, fields.Casting_name, charCS.get('name'));
			setAttr( charCS, fields.Casting_level, characterLevel( charCS ));
			curSpells = attrLookup( charCS, listAttr ) || '';
		}
			
		content = fields.defaultTemplate+'{{name=Grant Spells}}{{ ='+(msg||'')+'}}{{'+desc+'='+curSpells+'}}'
				+ '{{desc=1. [Choose](!cmd --button CHOOSE_'+cmd+'|'+level+'|&#63;{Choose which spell|'+getMagicList( rootDB, listAttr )+'}) a spell\n';
				
		if (spell) {
			spellObj = abilityLookup( rootDB, spell );
			content += '...Optionally [Review '+spell+'](!cmd --button REV_'+cmdStr
			        +  '\n&#37;{' + spellObj.dB + '|'+spell+'})}}';
		} else {
			content += '...Optionally <span style='+design.grey_button+'>Review the chosen spell</span>}}';
		}
				
		content += '{{desc1=2. '+(spell ? '[' : '<span style=' + design.grey_button + '>')+'Add '+(spell ? spell+'](!cmd --button ADD_'+cmdStr+')' : 'the spell</span>' )
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
		sendFeedback(content);
		return;
	}
	
	/*
	 * Create a menu to allow the DM to set Character weapon proficiencies
	 */
	 
	var makeProficienciesMenu = function( args, selected, msg ) {
		
		var	weapon = args[1] || '',
			meleeWeapon = args[2] || false,
			weapType = args[3] || '',
			weapObj, buttons,
    		content = fields.defaultTemplate + '{{name=Grant Weapon Proficiencies}}{{ ='+(msg||'')+'}}'
    				+ '{{  =['+((weapon) ? weapon : 'Choose Weapon')+'](!cmd --button CHOOSE_PROF|&#63;{Choose which Weapon?|'+getMagicList( fields.WeaponDB, fields.ItemWeaponList )+'})'
					+ 'or make [All Owned Weapons](!cmd --set-all-prof PROFICIENT) proficient\n'
    				+ 'and optionally ';
		
		if (weapon) {
			weapObj = abilityLookup( fields.WeaponDB, weapon );
			content += '[Review '+weapon+'](!cmd --button REVIEW_PROF|'+weapon
					+  '\n&#37;{' + weapObj.dB + '|'+weapon+'})}}'
					+  '{{desc=Level of '+weapon+' Proficiency\n'
					+  '[Not Proficient](!cmd --set-prof NOT-PROF|'+weapon+'|'+weapType+')'
					+  '[Proficient](!cmd --set-prof PROFICIENT|'+weapon+'|'+weapType+')'
					+  '[Specialist](!cmd --set-prof SPECIALIST|'+weapon+'|'+weapType+')';
			if (meleeWeapon) content += '[Mastery](!cmd --set-prof MASTERY|'+weapon+'|'+weapType+')';
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
				+ '{{desc2=[Return to Main Menu](!cmd --abilities) or just do something else}}';
		sendFeedback(content);
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
			charIDs = [],
			buttonType = function( buttonName, buttonCmd, api, action, question, defaultAns ) {
				let abilityObjs = findAbilities( api, action, selected );
				abilities[buttonName] = abilities[buttonName] || (abilityObjs && abilityObjs.length);
				let	buttonText = (abilities[buttonName] ? '<span style=' + design.selected_button + '>' : '[')
							   + buttonName
							   + (abilities[buttonName] ? '</span>' : '](!cmd --button '+buttonCmd+'|'+menuType+'|'+buttonName+'|'+api+'|'+action+'|&#63;{'+question+'&#124;'+defaultAns+'})');
				return buttonText;
			};
			
		content = fields.defaultTemplate+'{{name=Assign Abilities}}'
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
					+ '</table>}}{{desc2=[Access All Abilities](!cmd-master --button '+BT.AB_FULL+')';
			break;
			
		case BT.AB_FULL:
		
			_.each( registeredCmds, c => {
				content += '<tr><td>'+buttonType(c.action,BT.ABILITY,c.api,c.action,'Ability name?',c.action)+'</td><td>'+c.desc+'</td></tr>';
			});
			content	+= '</table>}}{{desc2=[Access Simple Abilities](!cmd --button '+BT.AB_SIMPLE+')';
			break;
		
		default:
			sendDebug('makeAbilitiesMenu: invalid menu type given');
			sendError('Internal CommandMaster error');
			return;
		}
		
		content += ' or [Set base Saving Throws](!cmd --button '+BT.AB_SAVES+'|'+menuType+'|0)'
		        +  '[Add to Spellbook](!cmd --add-spells MUSPELLS)'
				+  '[Add to Proficiencies](!cmd --add-profs)'
				+  '[Set Token Circles](!cmd --button '+BT.AB_TOKEN+'|'+menuType+'|0)'
				+  '[Clear Token Circles](!cmd --button '+BT.AB_TOKEN_NONE+'|'+menuType+'|0)}}';
				
		sendFeedback( content );
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
			content = fields.defaultTemplate+'{{name=Replace existing '+buttonName+' Abilities?}}'
					+ '{{desc=The selected ability already exists on one or more of the selected token(s).  Replacing or Removing them is NOT recommended.'
					+ ' Selecting *Do Nothing* will still add the ability to those tokens that do not have it.   Are you sure you want to replace or remove existing abilities?}}'
					+ '{{desc1=[ Replace ]('+fields.CommandMaster+' --button '+BT.AB_REPLACE+'|'+args.join('|')+'|replace)'
					+ ' or [ Remove ]('+fields.CommandMaster+' --button '+BT.AB_REPLACE+'|'+args.join('|')+'|remove)'
					+ ' or [ Do Nothing ]('+fields.CommandMaster+' --button '+BT.AB_REPLACE+'|'+args.join('|')+'|skip)}}';
		sendFeedback( content );
		return;
	}
	
	/*
	 * Simple question menu asking if existing versions 
	 * of abilities should be replaced when doing a global 
	 * string replace with confirmation set on.
	 */
	 
	var makeCheckReplace = function( args, charName, abilityName ) {
		var content = fields.defaultTemplate+'{{name=Replace '+charName+' '+abilityName+' Ability String?}}'
					+ '{{desc=The ability **'+abilityName+'** on character sheet **'+charName+'** has the string '+args[1]+' which will be replaced with '+args[2]+'.'
					+ '  Are you sure you want to replace this string in this ability?}}'
					+ '{{desc1=[ Yes ]('+fields.CommandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|true|true)'
					+ ' or [ No ]('+fields.CommandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|true|false)}}'
					+ '{{desc2=[Cancel]('+fields.CommandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|false|false)'
					+ ' or Repalce [All]('+fields.CommandMaster+' --button '+BT.STR_REPLACE+'|'+args[1]+'|'+args[2]+'|false|true) the Rest'
					+ '}}';
		sendFeedback( content );
		return;
	}
	
	/*
	 * Make a simple message confirming a cancelled action
	 */
	 
	var makeMsg = function(title,msg) {
	    var content = fields.defaultTemplate+'{{name='+title+'}}'
	                + '{{desc='+msg+'}}';
	   sendFeedback(content);
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
		content = fields.defaultTemplate+'{{name=Return to Menu}}'
				+ '{{desc=[Return to Menu](!cmd --add-spells '+cmdStr+') or do something else}}';
		sendFeedback(content);
	}

	/*
	 * Handle choosing a weapon proficiency to add to the 
	 * selected character
	 */
	 
	var handleChooseProf = function( args, selected ) {
		
		var weapon = args[1],
			weap = abilityLookup( fields.WeaponDB, weapon ),
			weapProf = false,
			meleeWeap = false,
			weapType = false;
			
		if (weap.obj && weap.obj[0]) {
			let specs = weap.obj[0].get('action'),
				weaponSpecs = specs.match(/{{\s*weapon\s*=(.*?){{/im);
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
			charCS = getCharacter( e._id );
			if (charCS) {
				let ProfTable = getAllTables( charCS, 'WPROF' )['WPROF'],
					weapProf = ProfTable.values;
				if (_.isUndefined(row = tableFind( ProfTable, fields.WP_name, weapon ))) {
    				if (_.isUndefined(row = tableFind( ProfTable, fields.WP_name, '-' ))) {
    				    row = ProfTable.sortKeys.length;
    				}
				}
				if (weapLevel == 'NOT-PROF') {
					ProfTable = addTableRow( ProfTable, row );
				} else {
					weapProf[fields.WP_name[0]][fields.WP_name[1]] = weapon;
					weapProf[fields.WP_type[0]][fields.WP_type[1]] = weapType;
					weapProf[fields.WP_expert[0]][fields.WP_expert[1]] = '1';
					weapProf[fields.WP_specialist[0]][fields.WP_specialist[1]] = (weapLevel.toUpperCase() == 'SPECIALIST' || weapLevel.toUpperCase() == 'MASTERY') ? '1' : '0';
					weapProf[fields.WP_mastery[0]][fields.WP_mastery[1]] = (weapLevel.toUpperCase() == 'MASTERY') ? '1' : '0';
					ProfTable = addTableRow( ProfTable, row, weapProf );
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
			let charCS = getCharacter( e._id );
			if (charCS) {
				let ProfTable = getAllTables( charCS, 'WPROF' )['WPROF'],
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
			content = fields.defaultTemplate+'{{name=Return to Menu}}'
				+ '{{desc=[Return to Menu](!cmd --add-profs '+cmdStr+') or do something else}}';
		sendFeedback(content);
	}

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
					log('handleChangedCmds character '+charCS.get('name')+' ability '+obj.get('name')+' updated to '+str.newStr);
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
			tokenIDs = [],
			raceMods,
			content = fields.defaultTemplate+'{{name=Set Base Saves}}'
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

//		dwarf:		{par:0,poi:3.5,dea:0,rod:3.5,sta:3.5,wan:3.5,pet:0,pol:0,bre:0,spe:3.5},

			
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
		sendFeedback( content );

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
				
			content = fields.defaultTemplate+'{{name=Setting Token Circles for '+curToken.get('name')+'}}{{desc=';
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
				if (isNaN(thac0val) || String(thac0val).trim() == '') thac0val = 20;
				if (isNaN(monsterThac0val) || String(monsterThac0val).trim() == '') monsterThac0val = 20;
				if (isNaN(baseThac0val) || String(baseThac0val).trim() == '') baseThac0val = 20;

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
			sendFeedback( content );
		});
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
					+ '<span style="font-weight: bold; font-size: 125%">CommandMaster v'+version+'</span>'
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
			newParams = args.join('|').replace('%%','|'),
			cmdObj = [];

   		registeredAPI[api] = true;

		[cmdObj,registeredCmds] = _.partition(registeredCmds,obj => ((obj.cmd == cmd) && (obj.action == action)));
		
		if (!_.isUndefined(cmdObj) && cmdObj.length) {
			cmdObj = cmdObj[0];
			cmdObj.desc = desc;
			cmdObj.changed = (cmdObj.params != newParams) || (cmdObj.cmd != cmd);
			if (cmdObj.changed) {
				log('doRegistration registeredCmds['+api+']['+action+'] changed');
				if (!_.isUndefined(cmdObj.params)) {
					cmdObj.oldCmdStr = parseStr('!'+cmdObj.api+' '+cmdObj.cmd+' '+cmdObj.params);;
				}
				cmdObj.params = newParams;
				cmdObj.cmd = cmd;
				state.CommandMaster.cmds[cmdObj.key] = argStr;
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
			state.CommandMaster.cmds.push(argStr);
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
		player = findObjs({ type: 'player', id: senderID });
		if (player && player[0]) {
			player[0].set('showmacrobar','true');
		} else {
			log('doInitialise: player not found');
		}
		sendFeedback(messages.initMsg);
		return;
	}

	/*
	 * Display a menu of ability button options
	 */
 
	var doAbilityMenu = function(args, selected) {

		abilities = [];
		updateDBindex();  // Update the database indexes to speed up item searches
		
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
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, playerId, selected ) {

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
			funcTrue = ['initialise','abilities','add-spells','add-profs','set-prof','set-all-prof','register','edit','debug','help'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr cmd'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
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
			isGM = (playerIsGM(senderId) || state.CommandMaster.debug === senderId),
			changedCmds = false;
			
		if (msg.type !=='api' || args.indexOf('!cmd') !== 0)
			{return;}

        sendDebug('CommandMaster called');
		state.CommandMaster.attrsToCreate = {};

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
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
			argString = (i<0 ? '' : arg.substring(i+1).trim());
			arg = argString.split('|');
			
			try {
				switch (cmd) {
				case 'register':
					doRegistration(argString);
					break;
				case 'abilities':
					doAbilityMenu(arg,selected);
					break;
				case 'initialise':
					doInitialise(senderId);
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
				case 'handouts':
				case 'handout':
					updateHandouts(false,senderId);
					break;
				case 'hsq':
				case 'handshake':
					doHsQueryResponse(arg);
					break;
				case 'hsr':
					doHandleHsResponse(arg);
					break;
				case 'button':
					doButton(arg,senderId,selected);
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
					sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
				}
			} catch (e) {
				sendDebug('CommandMaster handleChatMsg: JavaScript '+e.name+': '+e.message);
				sendError('CommandMaster JavaScript '+e.name+': '+e.message);
			}
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