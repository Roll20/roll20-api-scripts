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
 * v0.002-1.042        Early development - see previous version files
 * v2.043  26/02/2022  Added one character able to "lend a hand" to another character to 
 *                     cooperate on using weapons (or other objects) that require more than 2 hands.
 *                     Added Class-DB to expose all rules relating to
 *                     a character's class, and allow them to be altered or new classes defined.
 * v2.044  02/03/2022  Created the Attacks-DB to expose attack calculations and enable DMs and game
 *                     creators to alter them as needed for their campaigns and rule sets.
 *                     Added full AC and Attack support for damage types Slash, Pierce & Bludgeon.
 *                     Added support for v. fast & v. slow weapon types.  Fixed proficiency calculation
 *                     for weapons with multiple types & supertypes.
 * v2.045  06/03/2022  Added saving throw data to Class specs using method that can also apply
 *                     to other database items.  Updated --check-saves function to include MIs
 *                     that affect saves.  Make database updates asynchronous to avoid invalid
 *                     "infinite loop" errors.  Synchronised DB indexing between APIs to ensure
 *                     all DBs loaded before indexed. Added Creature character class.
 *                     Fixed handling of manual Character Sheet table entries.
 * v2.046  29/03/2022  Some weapon updates (e.g. Oil Flask & Shortsword).
 *                     Updated Help text. Ignore '()' in item names. Added a 'dark text' version of
 *                     a grayed out button. Optimised tableSet() & setAttr(). Added process to ensure
 *                     all characters have AC vs. dmg type from first load. Improved table fieldGroup
 *                     handling. Fixed ammo handling for multi-class & innate ranged weapons. Made
 *                     attack macro build asynchronous. Fixed handling of breakable ammo. Fixed
 *                     intermittent addTableRow() issue if not using getTable(). Fixed taking
 *                     a multi-class weapon in-hand.  Fixed item cost lookup processing.
 * v2.047  04/04/2022  Fixed weapon lists that could sometimes include ammo as a weapon that can 
 *                     be taken in-hand. 
 * v2.048  26/04/2022  Fixed error introduced by v2.047 which ignored oil flasks as a weapon
 * v2.049  22/05/2022  Added float values as possible arguments for --mod-weapon
 * v2.050  28/03/2022  Moved all Table Mgt, Ability Mgt, Chat Mgt, Database Mgt to a
 *                     shared library
 * v2.051  25/04/2022  Fixed all errors found in 2.050, and moved all game-specific and 
 *                     character sheet specific data structures to RPG-specific shared library
 * v2.052  16/05/2022  Added management of rings on hands to Change Weapon menu.  Fixed class
 *                     proficiency in Innate weapons to always be true.
 * v2.060  31/05/2022  Introduced RPGM template processing in library functions
 * v2.061  12/07/2022  Extensive re-engineering to support flexible game rules
 * v0.2.62 18/07/2022  Converted to use revised internal database structures
 * v0.2.63 16/09/2022  Added optional use of a semi-colon to terminate escaped characters in 
 *                     commands. Added preinit flag for weapons that get an attack before initiative.
 *                     Added msg option to weapon database definitions. Added twp option to Class 
 *                     to specify calss two weapon penalty. Changed table management to use table 
 *                     objects and methods from RPGM Library. Fixed error handling in spawned 
 *                     processes. Added Punch & Wrestle attacks. Change --help to 
 *                     provide a menu of links to help handouts
 * v1.3.00 17/09/2022  First release of RPGMaster AttackMaster using the RPGMaster Library.
 * v1.3.01 04/10/2022  Fixed bugs in rings that execute 'on:' and 'off:' commands
 * v1.3.02 14/10/2022  Added support for "weaponised" spells - spells that act exactly 
 *                     like weapons (and spells). Fixed regular expressions for database 
 *                     Specs parsing.
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = '1.3.02',
		author = 'Richard @ Damery',
		pending = null;
    const lastUpdate = 1664899979;

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
	const initValues = (...v) => libRPGMaster.initValues(...v);
	const checkDBver = (...a) => libRPGMaster.checkDBver(...a);
	const saveDBtoHandout = (...a) => libRPGMaster.saveDBtoHandout(...a);
	const buildCSdb = (...a) => libRPGMaster.buildCSdb(...a);
	const checkCSdb = (...a) => libRPGMaster.checkCSdb(...a);
	const getDBindex = (...a) => libRPGMaster.getDBindex(...a);
	const updateHandouts = (...a) => libRPGMaster.updateHandouts(...a);
	const getCharacter = (...a) => libRPGMaster.getCharacter(...a);
	const getTokenValue = (...a) => libRPGMaster.getTokenValue(...a);
	const classObjects = (...a) => libRPGMaster.classObjects(...a);
	const handleCheckSaves = (...a) => libRPGMaster.handleCheckSaves(...a);
	const redisplayOutput = (...a) => libRPGMaster.redisplayOutput(...a);
	const getMagicList = (...a) => libRPGMaster.getMagicList(...a);
	
	/*
	 * Handle for reference to character sheet field mapping table.
	 * See RPG library for your RPG/character sheet combination for 
	 * full details of this mapping.  See also the help handout on
	 * RPGMaster character sheet setup.
	 */
	
	var fields = {
		defaultTemplate:    'RPGMdefault',
		targetTemplate:		'RPGMattack',
		weaponTemplate:		'RPGMweapon',
		warningTemplate:	'RPGMwarning',
		CSweaponTemplate:	'2Eattack',
		ClassDB:			'Class-DB',
	};

	/*
	 * List of the "standard" RPGMaster databases to support identification of 
	 * custom user databases and db entries to give priority to.
	 */

	const stdDB = ['MU_Spells_DB','PR_Spells_DB','Powers_DB','MI_DB','MI_DB_Ammo','MI_DB_Armour','MI_DB_Light','MI_DB_Potions','MI_DB_Rings','MI_DB_Scrolls_Books','MI_DB_Wands_Staves_Rods','MI_DB_Weapons','Attacks_DB','Class_DB'];
	
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
	 * AttackMaster related help handout information.
	 */

	const handouts = Object.freeze({
	AttackMaster_Help:	{name:'AttackMaster Help',
						 version:2.02,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">AttackMaster Help v2.02</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Attack Master API v'+version+'</h1>'
							+'<h4>and later</h4>'
							+'<p>AttackMaster API provides functions to manage weapons, armour & shields, including taking weapons in hand and using them to attack.  It uses rules (defined in the <b>RPGMaster Library</b>) to the full extent, taking into account: ranged weapon ammo management with ranges varying appropriately and range penalties/bonuses applied; Strength & Dexterity bonuses where appropriate; any magic bonuses to attacks that are in effect (if used with <b>RoundMaster API</b> effects); penalties & bonuses for non-proficiency, proficiency, specialisation & mastery; penalties for non-Rangers attacking with two weapons; use of 1-handed, 2-handed or many-handed weapons and restrictions on the number of weapons & shields that can be held at the same time; plus many other features.  This API works best with the databases provided with the RPGMaster series APIs (or added by yourself in custom databases), which hold the data for automatic definition of weapons and armour.  However, some attack commands will generally work with manual entry of weapons onto the character sheet.  The <b>CommandMaster API</b> can be used by the GM to easily manage weapon proficiencies.</p>'
							+'<p>Specification for weapons, armour & shields are implemented as ability macros in specific database character sheets.  This API comes with a wide selection of weapon and armour macros, held in databases in the RPGMaster Library for the specific game version you are playing.  If the <b>MagicMaster API</b> is also loaded, it provides many more specifications for standard and magic items that are beneficial to melee actions and armour class.  The GM can add to the provided items in the databases using standard Roll20 Character Sheet editing, following the instructions provided in the relevant Database Help handout.</p>'
							+'<p><b><u>Note:</u></b> For some aspects of the APIs to work, the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs: <b>RoundMaster, InitiativeMaster, MagicMaster and CommandMaster</b> as well as the mandatory game version specific <b>RPGMaster Library</b>.  This will provide the most immersive game-support environment</p>'
							+'<h2>Syntax of AttackMaster calls</h2>'
							+'<p>The AttackMaster API is called using !attk.</p>'
							+'<pre>!attk --help</pre>'
							+'<p>Commands to be sent to the AttackMaster API must be preceded by two hyphens <b>\'--\'</b> as above for the <b>--help</b> command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!attk --attk-hit token_id | [message] | [monster weap1] | [monster weap2] | [monster weap3]</pre>'
							+'<p>If optional parameters are not to be included, but subsequent parameters are needed, use two vertical bars together with nothing between them, e.g.</p>'
							+'<pre>!attk --checkac token_id || [SADJ / PADJ / BADJ]</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!attk --checkac token_id | [ SILENT ] | [SADJ / PADJ / BADJ] --weapon token_id</pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>'
							+'<br>'
							+'<h2>Using Character Sheet Ability/Action buttons</h2>'
							+'<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>'
							+'<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: <b>--menu</b> and <b>--other-menu</b>.  From these, most other commands can be accessed.  If using the <b>CommandMaster API</b>, its character sheet setup functions can be used to add the necessary Ability Macros and Token Action Buttons to any Character Sheet.</p>'
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<h3>1. Menus</h3>'
							+'<pre>--menu [token_id]<br>'
							+'--other-menu [token_id]</pre>'
							+'<h3>2. Attacking commands</h3>'
							+'<pre>--attk-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-roll [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-target [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--twoswords [token_id]|[prime-weapon]</pre>'
							+'<h3>3. Weapon Management</h3>'
							+'<pre>--weapon [token_id]<br>'
							+'--dance [token_id] | weapon  | [ STOP ]<br>'
							+'--mod-weapon [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>'
							+'--quiet-modweap [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>'
							+'--edit-weapons [token_id]<br>'
							+'--blank-weapon [token_id] | weapon | [ SILENT ]</pre>'
							+'<h3>4. Ammunition Management</h3>'
							+'<pre>--ammo [token_id]<br>'
							+'--setammo [token_id] | ammo_name | [ [+/-]cur_qty / = ] | [ [+/-]max_qty / = ] | [ SILENT ]</pre>'
							+'<h3>5. Armour Class and Saving Throws</h3>'
							+'<pre>--edit-armour [token_id]<br>'
							+'--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]<br>'
							+'--save [token_id] | [situation-mod]</pre>'
							+'<h3>6. Other Commands</h3>'
							+'<pre>--help<br>'
							+'--config [PROF/ALL-WEAPS/WEAP-CLASS/ALL-ARMOUR/MASTER-RANGE/SPECIALIST-RULES/SPELL-NUM] | [TRUE/FALSE]<br>'
							+'--check-db [ db-name ]<br>'
							+'--extract-db db-name<br>'
							+'--handshake from | [cmd]<br>'
							+'--hsq from | [cmd]<br>'
							+'--hsr from | [cmd] | [TRUE/FALSE]<br>'
							+'--debug [ ON / OFF ]</pre>'
							+'<h3>7. How To Use AttackMaster</h3>'
							+'<pre>Specifying a token<br>'
							+'Who can make AttackMaster API command calls<br>'
							+'Weapons that can be used<br>'
							+'Allocating weapons to a Character<br>'
							+'Selecting weapons to attack with<br>'
							+'Making attacks<br>'
							+'Ammunition<br>'
							+'Ranged weapon and ammunition ranges<br>'
							+'Dancing weapons<br>'
							+'Armour Class management<br>'
							+'Saves</pre>'
							+'<br>'
							+'<h2>Command details</h2>'
							+'<h2>1. Menus</h2>'
							+'<h3>1.1 Display a menu to do actions relating to attacks</h3>'
							+'<pre>--menu [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token</p>'
							+'<p>Displays a Chat menu with buttons for: Attacking, with Roll20 rolling a dice or the Player entering a dice roll result, or the Player selecting a target and getting the result of an attack (if allowed by the DM in setting the API options); changing what is in the Character\'s (or NPC\'s) hands; to recover spent ammo; and to check the current Armour Class for the Character under various circumstances.</p>'
							+'<h3>1.2 Display a menu of other actions</h3>'
							+'<pre>--other-menu [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token</p>'
							+'<p>Displays a Chat menu with buttons for: saving throws and saving throw management; managing character classes and levels (if the <b>CommandMaster API</b> is loaded) and managing light sources for the character\'s token (if Dynamic Lighting is being used) (requires <b>MagicMaster API</b> to work).  If the GM uses the menu, two further options appear: mark the token selected as Dead (which also marks the body as an inanimate object that can be looted); and the ability to adjust damage for the selected token for any arbitrary reason, which can also be noted.</p>'
							+'<h2>2. Attacking Commands</h2>'
							+'<h3>2.1 Attack an opponent with a weapon</h3>'
							+'<pre>--attk-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-menu-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-roll [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>'
							+'--attk-target [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]</pre>'
							+'<p>Each takes an optional token ID (if not specified uses selected token), an optional formatted message to include with the attack damage, and up to three optional names for each of the monster attacks that are displayed on the attack menu.</p>'
							+'<p>Each of these three commands present a menu of currently possible attacks, using the weapons and ammo in-hand or, for monsters using the Monster tab on the AD&D 2e Character Sheet, up to 3 types of monster attacks.  Ranged weapon attacks will prompt the Player to specify which range to fire at. Selecting one of the possible attacks has different outcomes based on the command used:</p>'
							+'<dl><dt>--attk-hit</dt><dd>displays a menu of current possible attacks with buttons the Player or GM can use to change the type of attack that will be done (Roll20 rolls, Player rolls, or Targeted attack, default Roll20 rolls) which is remembered for each Player and carried between campaign sessions.</dd>'
							+'<dl><dt>--attk-menu-hit</dt><dd>prompts Roll20 to make an attack roll, using 3D dice if they are enabled, displays the AC hit with supporting information on how this was calculated and displays buttons to roll for damage if the attack is successful.</dd>'
							+'<dt>--attk-roll</dt><dd>displays an entry field to allow the Player to enter the value of their own dice roll (for those that prefer to roll their own dice) though the default entry will also roll the dice for the player.  Subsequently, the process is the same as --attk-hit.</dd>'
							+'<dt>--attk-target</dt><dd>asks the Player to select a target token for the attack.  It then displays the AC the attack roll will hit and the AC of the selected target.  It also automatically rolls damage for Small/Medium and Large targets, and displays the relative proportion of Hit Points for the targeted token at the time of the attack.  Recommended only for the DM, as it reveals information about the target, but can be enabled for Players using the <b>--config</b> command.</dd></dl>'
							+'<p>The attack menu also has buttons that allow the Player or GM to change the default attack type made: Roll20 rolls, Player rolls, or a targeted attack.  It also has a button to turn 3D dice on or off. This configuration is held by Player for each Campaign, and preserved between sessions of game play.</p>'
							+'<p>The optional message is displayed as part of the display of the damage done on a successful hit.  If a monster, the message can be three concatenated messages separated by \'$$\'.  The message can include API Buttons if needed.  The following characters must be replaced (escaped) using these replacements:</p>'
							+'<table>'
							+'	<tr><th scope="row">Character</th><td>?</td><td>[</td><td>]</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td></tr>'
							+'	<tr><th scope="row">Substitute</th><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td>`</td><td>~</td><td>&amp;#124;</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td></tr>'
							+'	<tr><th scope="row">Alternative</th><td>\\ques;</td><td>\\lbrak;</td><td>\\rbrak;</td><td>\\at;</td><td>\\dash;</td><td>\\vbar;</td><td>\\clon;</td><td>\\amp;</td><td>\\lbrc;</td><td>\\rbrc;</td></tr>'
							+'</table>'
							+'<br>'
							+'<h3>2.2 Use two weapons to attack</h3>'
							+'<pre>--twoswords [token_id]|[prime-weapon]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token) and an optional weapon name.</p>'
							+'<p>This command sets the system up to apply the correct penalties / bonuses when using two weapons to attack. For example, under AD&D 2e rules only types of Fighter & Rogue can use 2 weapons at a time to attack in a round, and only Rangers do so without penalty.  Using this command with the name of a <i>prime-weapon</i> specified will mark that weapon as the Primary which will get the smaller penalty of the two and will also be allowed multiple attacks per round (if using <b>InitiativeMaster API</b>).  Use of any other weapon during the current or subsequent rounds will incur a larger penalty and be restricted to one attack per round regardless of type of weapon, level & proficiency.  Penalties are adjusted by the Dexterity Reaction Adjustment.  See AD&D 2e PHB p96 for full explanation of rules applied if using the AD&D 2e RPGMaster Library rule set.</p>'
							+'<p>Calling this command without a prime-weapon specified will terminate two-weapon mode and no penalties will be applied for the current and subsequent rounds.</p>'
							+'<br>'
							+'<h2>3. Weapon Management</h2>'
							+'<h3>3.1 Change weapons currently in hand</h3>'
							+'<pre>--weapon [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>This command displays a chat menu displaying what is currently in the Character\'s (or NPC or creature\'s) hands, and allowing the Player to change what is held to any weapon, shield, or light source that they have in their items, or for spell casters any weaponised spell (a spell that requires an attack roll, either in Melee combat or at range) they have menorised.  Subsequent attacks will then use the newly specified weapon(s) or weaponised spell(s).  When selecting a ranged weapon that uses ammunition, the appropriate ammunition held in their on-person items is also loaded into the character\'s "quiver".</p>'
							+'<p>Selecting a hand (either Left or Right) will display any 1-handed items and spells that can be used for selection in a list.  Selecting the Both Hands button will display all the 2-handed items (including bows) that can be used for selection in a list.  Some weapons can be used either 1-handed or 2-handed, and the appropriate stats will be given based on the selection made.</p>'
							+'<p>A button is also shown to allow the Character to "lend" their hands to another Character: this will allow the receiving Character to use weapons and devices that require more than 2 hands, such as large siege engines and windlasses on ships.  If the donating Character selects to take any new weapon in-hand, the "lent" hands will be removed from the receiving Character and any device needing more hands than are left will be dropped.  Multiple Characters can lend hands to a receiving Character so that very large devices (such as a Battering Ram) can be used.</p>'
							+'<p>Buttons are also provided to set the rings worn on each hand. Rings affecting armour class and/or saves will only take effect in the system if worn.</p>'
							+'<p>If being used by the GM, the menu also has an option to change the number of hands the creature has, which will then allow the creature to hold (and attack with) more than two items, or to hold items that require more than two hands.</p>'
							+'<p><b>Note:</b> this function is dependent on the weapon, shield, light source and spell definitions including certain key information in a specified format: see the [Weapon & Armour Database Help] or [Magic Database Help] for details.</p>'
							+'<h3>3.2 Manage a dancing weapon</h3>'
							+'<pre>--dance [token_id] | weapon  | [ STOP ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and an optional STOP command.</p>'
							+'<p>This command marks the named weapon as "dancing" which means it will no longer occupy a hand, but will still appear in the list of possible attacks when an attack is made.  When started, the --weapon command is automatically run so that an additional weapon can be taken in the freed-up hand.</p>'
							+'<p>Appending the "STOP" command will un-mark the weapon as dancing.  The Player will have to take the no-longer dancing weapon back in hand, if they so desire, using the --weapon command.</p>'
							+'<p><b>Note:</b> the most effective use of the --dance command is when combined with the RoundMaster effect management system, to count down rounds of use, automatically call the --dance command at the appropriate time, and stop the dancing automatically after the appropriate duration.</p>'
							+'<h3>3.3 Manage weapon statistics</h3>'
							+'<pre>--mod-weapon [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>'
							+'--quiet-modweap [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments</pre>'
							+'<p>Each command takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and a mandatory data type.</p>'
							+'<p>These commands allow the specifications of any weapon currently in-hand to be adjusted programmatically.  E.g. the magical plus on to-hit and damage can be adjusted round by round (as for a Sword of Dancing).  The type of data to be adjusted must be identified using the data type parameter: MELEE & RANGED alter To-Hit data, and DMG & AMMO alter Damage.</p>'
							+'<p>The weapon parameter can name a specific weapon name, a type of weapon (e.g. bow, long-blade, club etc), a changed weapon name (previously changed by this command), or even \'all\' for all currently held weapons.  All data of the specified data type for all weapons that match the weapon parameter may then be altered, using the comma-separated adjustments parameter.  Each adjustment is of the format <i><pre>field_id:[=][+/-]value</pre></i> where the field_ids are:</p>'
							+'<table><tr><td>w:</td><td>weapon name</td><td>t:</td><td>weapon type</td><td>st:</td><td>weapon super-type</td></tr>'
							+'<tr><td>sb:</td><td>strength bonus</td><td>db:</td><td>dexterity bonus</td><td>+:</td><td>magical plus</td></tr>'
							+'<tr><td>n:</td><td>number of attacks per round</td><td>pl:</td><td>proficiency level</td><td>pd:</td><td>dancing proficiency level</td></tr>'
							+'<tr><td>ch:</td><td>critical hit roll</td><td>cm:</td><td>critical miss roll</td><td>sz:</td><td>size</td></tr>'
							+'<tr><td>r:</td><td>range (can be #/#/#)</td><td>ty:</td><td>damage type</td><td>sp:</td><td>speed in segments</td></tr>'
							+'<tr><td>sm:</td><td>damage vs small & medium</td><td>l:</td><td>damage vs large</td></tr></table>'
							+'<br>'
							+'<p>Numeric values can be preceeded by + or -, which will adjust rather than replace the current value.  To set a value as negative, precede the minus by an equals thus =-value.  For attributes that are relevant to multiple data types, only the specified data type will be adjusted.  Multiple attributes can be adjusted using one command call by concatenating comma-delimited adjustments. E.g. </p>'
							+'<pre>--mod-weap @{selected|token_id}|Sword-of-Dancing|MELEE|sb:0,+:+1,sp:-1</pre>'
							+'<p>If the weapon is not found, the GM receives an error message, but no other issues occur.</p>'
							+'<h3>3.4 Adding & removing weapons and ammunition</h3>'
							+'<pre>--edit-weapons [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>The very best way for the Character, NPC or creature to acquire weapons (or any other items including magic items) is to use the <b>MagicMaster API</b> and its commands and databases.  However, AttackMaster provides a small subset of those facilities to allow the DM and/or Players to add weapons, ammo & armour to their Character Sheet item bags.  Once added, these items can be taken \'in-hand\' by the Character (using the <b>--weapon</b> command) and then used to attack.</p>'
							+'<p>The advantage of doing this over just typing the item names into the Character Sheet tables is that the items are assured to exist in the weapon, ammo & armour databases that come with the API and so all other aspects of the API will work properly.</p>'
							+'<p>This command and <b>--edit-armour</b> are identical, and call the same menu.</p>'
							+'<h3>3.5 Blanking a weapon from attack tables</h3>'
							+'<pre>--blank-weapon [token_id] | weapon | [ SILENT ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), the mandatory name of a weapon, and an optional "SILENT" command.</p>'
							+'<p>This command will programmatically remove the named weapon, and any associated ammunition for ranged weapons, from all attack tables on the character sheet, and from the system in-hand table and quiver, on the Character Sheet associated with the specified or selected token.  This is especially useful for "weaponised" spells that need to be immediately removed once cast and attacked with.</p>'
							+'<br>'
							+'<h2>4. Ammunition Management</h2>'
							+'<h3>4.1 Ammunition recovery</h3>'
							+'<pre>--ammo [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>This command displays a chat menu of ammunition that the Character has on their person (not just the ammo that they have in their quiver or in-hand) including any ammunition that has run-out but might still be recoverable.  The Player can ask the DM if they can retrieve any ammunition of the types displayed that they have recently used and, once the DM responds with the amount recovered, click on the type of ammunition in the list and enter the amount recovered.  Both the amount on their person, and any amount in their quiver or in-hand are updated.</p>'
							+'<p><b>Note:</b> enter the amount recovered <em>not</em> the new total.  The amount entered will be added to the current amount held, and then this new value set as the new maximum.  A negative amount can also be entered, which will be removed from the current quantity and will also set the new maximum.</p>'
							+'<p><b>Note:</b> after a Long Rest (see <b>MagicMaster API</b>) all ammunition maximum totals are set to current quantities at that time.  It is assumed that during the period of a long rest, some creature will have found any loose ammo, or it will otherwise have been broken or lost.</p>'
							+'<p><b>Note:</b> ammunition that has the item-type of <i>\'charged\'</i> will appear on the menu with a grey box which cannot be selected, indicating that the ammo cannot be recovered - such ammunition always breaks on contact: e.g. glass arrows.</p>'
							+'<h3>4.2 Ammunition quantity amendment</h3>'
							+'<pre>--setammo [token_id] | ammo_name | [ [+/-]cur_qty / = ] | [ [+/-]max_qty / = ] | [ SILENT ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), the unique name of the ammunition, an optional value for the current quantity, optionally preceded by +/- or replaced by an =, an optional value for the maximum quantity with the same +/- & = possibilities, and an optional parameter of "Silent" (case insensitive).</p>'
							+'<p>This command allows programmatic or macro alteration of the quantity of a type of ammo:</p>'
							+'<ul><li>The current quantity and/or the maximum held (i.e. the amount to which ammunition can be recovered up to - see section 4.1 Ammunition Recovery, above) can be set to absolute values just by entering numbers for the parameters.</li>'
							+'<li>Either parameter can be preceded by a + or -, in which case the parameter will modify the corresponding current value, rather than replacing it.</li>'
							+'<li>Either parameter can be an = by itself.  In this instance, the corresponding value is set to the other corresponding value (after any modification) i.e. putting = for cur_qty sets the current quantity held to be the maximum possible, or putting = for max_qty sets the maximum possible to be the current quantity.  Putting = for both does nothing.</li>'
							+'<li>No value can go below 0, and the current quantity will be constrained at or below the maximum quantity.</li></ul>'
							+'<p>So, for example, this command will set the maximum quantity to 10 and set the current quantity to be equal to it:</p>'
							+'<pre>!attk -setammo @{selected|token_id}|Flight-Arrow+1|=|10|silent</pre>'
							+'<p>If the "Silent" parameter is not specified, then the Ammunition Recovery chat menu will display with the amended values once complete, and a message is displayed with the changes that occurred.</p>'
							+'<p><b>Note:</b> if more than one ammo item of the same name is listed in the items table (see [RPGMaster CharSheet Setup] handout), only the first item found will be amended.  If no item of that name is found, nothing happens and no menus or messages are displayed.</p>'
							+'<br>'
							+'<h2>5. Armour Class and Saving Throws</h2>'
							+'<h3>5.1 Edit Armour</h3>'
							+'<pre>--edit-armour [token_id]<br>'
							+'--edit-armor [token_id]</pre>'
							+'<p>Takes an optional token ID - if not specified uses selected token.</p>'
							+'<p>The very best way for the Character, NPC or creature to acquire armour (or any other items including magic items) is to use the <b>MagicMaster API</b> and its commands and databases.  However, AttackMaster provides a small subset of those facilities to allow the DM and/or Players to add weapons, ammo & armour to their Character Sheet item bags.  Once added, these items can be taken \'in-hand\' by the Character (using the <b>--weapon</b> command), and improve the Armour Class of the Character appropriately.</p>'
							+'<p>The advantage of doing this over just typing the item names into the Character Sheet tables is that the items are assured to exist in the weapon, ammo & armour databases that come with the API and so all other aspects of the API will work properly (e.g. see section 5.2 below).</p>'
							+'<p>This command is identical to the <b>--edit-weapons</b> command and uses the same menu.</p>'
							+'<h3>5.2 Review Armour Class</h3>'
							+'<pre>--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), an optional "Silent" command, and an optional damage type which can be "SADJ", "PADJ" or "BADJ" (the "Silent" and damage type parameters are not case sensitive).</p>'
							+'<p>This command analyses the items in the Character\'s items table (see [RPGMaster CharSheet Setup] handout) using the information in the various item databases supplied / created by the API(s), and taking into account the current Dexterity bonuses calculates the current Armour Class of the Character.  It then displays a chat message with its results and an explanation of how it came to them.  If the optional damage type is provided, the calculation takes this into account.</p>'
							+'<p>The system can use the information in the databases to take into account magical armour plusses, combined effects of armour that can work together (like Armour and Shields), exclude combinations that are not allowed (like Rings of Protection with magical armour), and the armour types allowed for various character classes and races including specialist variations.</p>'
							+'<p>The system automatically updates this information any time the Character changes what is in their hands (e.g. if they pick up or put down a shield) using the <b>--weapon</b> command.  If using the InitMaster API, the command is also run every time the character does an Initiative roll.  If using the MagicMaster API, the command is also run any time items are looted from a chest or NPC, or stored away or given to another character.</p>'
							+'<p>The system remembers on the Character Sheet what its calculations are each time.  If the most recent calculation results in a change in Armour Class for the character, the character\'s token AC (if displayed) will be modified by the difference between the old and new values.  This modified value will be shown on the Armour Class Review message in the chat window if it is different from the calculated value.</p>'
							+'<p><b>Note:</b> the token displayed AC is only modified by the difference between the previous and current calculations.  This allows magical and other effects (such as those managed by the RoundMaster API) to alter the token displayed AC and not be overwritten by a change in calculated AC, but still take into account the change.  The token AC can be manually updated at any time without impact on this functionality, to overcome any errors.</p>'
							+'<p><b>Note:</b> if the token is configured following the Master Series API standard (see CommandMaster API documentation), the token bar for the displayed AC is normally hidden.  if the calculated AC and token displayed AC are different (see above) then the AC token bar appears, representing the difference between the two.  This acts as a visual reminder to the DM and Player that the token is the subject of some effect on AC - it also helps to identify if there is a difference in error, so that this can be manually rectified (by manually altering the token displayed AC).  Once the two are again the same and the <b>-check-ac</b> command run, the token AC bar will again be hidden.</p>'
							+'<h3>5.3 Saving Throws</h3>'
							+'<pre>--save [token_id] | [ situation-mod ]<br>'
							+'--save [token_id] | [ situation-mod ] | save-type | saving-throw</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), and different forms of the command take an optional situational modifier to the saving throw, a type of save (which can be one of \'paralysis\', \'poison\', \'death\', \'rod\', \'staff\', \'wand\', \'petrification\', \'polymorph\', \'breath\', or \'spell\', not sensitive to case), and the base, unmodified saving throw achieved on a dice.</p>'
							+'<p>This command can either display a menu from which to display and manage the saving throw table, and make saving throws or, in its second form, to make a saving throw and check the result against the saving throw table.</p>'
							+'<p>The first form shows all the possible saves that can be made, the saving throw that needs to be achieved to make the save, and any modifiers that apply to this particular character.  There are buttons to modify the saving throw table and the modifiers, to apply a "situational modifier" to immediate saving throws (the "situational modifier" only applies to current rolls and is not remembered), and/or to check the current saving throw table automatically (taking into account race, class, level, and magic items on their person).  Also, each type of saving throw can actually be made by clicking the buttons provided.  Doing so effectively runs the second form of the command.</p>'
							+'<p>The situational modifier can optionally be passed in as a value with the command call if so desired, instead of selecting via the button on the menu.</p>'
							+'<p>Running the second form of the command (or selecting to make a saving throw from the first form\'s menu) will execute the saving throw (as a dice roll if this is specified instead of a straight value) of the specified type, using the data in the character\'s saving throw table to assess success or failure, displaying the outcome and the calculation behind it in the chat window.</p>'
							+'<br>'
							+'<h2>6.Other commands</h2>'
							+'<h3>6.1 Display help on these commands</h3>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h3>6.2 Configure API behavior</h3>'
							+'<pre>--config [PROF/ALL-WEAPS/WEAP-CLASS/ALL-ARMOUR/MASTER-RANGE/SPECIALIST-RULES/SPELL-NUM] | [TRUE/FALSE]</pre>'
							+'<p>Takes two optional arguments, the first a switchable flag name, and the second TRUE or FALSE.</p>'
							+'<p>Allows configuration of several API behaviors.  If no arguments given, displays menu for DM to select configuration.  Parameters have the following effects:</p>'
							+'<table>'
							+'	<thead><tr><th>Flag</th><th>True</th><th>False</th></tr></thead>'
							+'  <tr><th scope="row">FANCY-MENUS</th><td>Chat templates will use textured backgrounds</td><td>Chat templates will use plain backgrounds</td></tr>'
							+'	<tr><th scope="row">PROF</th><td>Strictly apply non-proficient weapon penalties as per PHB</td><td>Use the non-proficient weapon penalty displayed on the Character Sheet</td></tr>'
							+'	<tr><th scope="row">ALL-WEAPS</th><td>Allow any character of any class to use and become proficient in any weapon.</td><td>Restrict the use of weapons by class to some degree set by WEAP-CLASS</td></tr>'
							+'	<tr><th scope="row">WEAP-CLASS</th><td>Weapons not allowed to a class get a penalty of -100</td><td>Weapons not allowed to a class get double non-proficient penalty</td></tr>'
							+'	<tr><th scope="row">ALL-ARMOUR</th><td>All armour types allowed for all classes</td><td>Armour not allowed to a class not included in AC calculations</td></tr>'
							+'	<tr><th scope="row">MASTER-RANGE</th><td>Ranged weapon Mastery gives double damage at Point Blank range</td><td>Ranged weapon Mastery not allowed, as per PHB</td></tr>'
							+'	<tr><th scope="row">SPECIALIST-RULES</th><td>Only Specialist Wizards specified in the PHB get an extra spell per spell level</td><td>Any non-Standard Wizard gets an extra spell per spell level</td></tr>'
							+'	<tr><th scope="row">SPELL-NUM</th><td>Spellcaster spells per level restricted to PHB rules</td><td>Spellcaster spells per level alterable using Misc Spells button</td></tr>'
							+'	<tr><th scope="row">ALL-SPELLS</th><td>Spellcaster spell schools are unrestricted</td><td>Spellcaster spell schools are restricted by class rules</td></tr>'
							+'</table>'
							+'<h3>6.3 Check database completeness & integrity</h3>'
							+'<pre>--check-db [ db-name ]</pre>'
							+'<p>Takes an optional database name or part of a database name: if a partial name, checks all character sheets with the provided text in their name that also have \'-db\' as part of their name.  If omitted, checks all character sheets with \'-db\' in the name.  Not case sensitive.  Can only be used by the GM.</p>'
							+'<p>This command finds all databases that match the name or partial name provided (not case sensitive), and checks them for completeness and integrity.  The command does not alter any ability macros, but ensures that the casting time (\'ct-\') attributes are correctly created, that the item lists are sorted and complete, and that any item-specific power & spell specifications are correctly built and saved.</p>'
							+'<p>This command is very useful to run after creating/adding new items as ability macros to the databases (see Database-specific handouts).  It does not check if the ability macro definition itself is valid, but if it is then it ensures all other aspects of the database consistently reflect the new ability(s).</p>'
							+'<h3>6.4 Extract database for Editing</h3>'
							+'<pre>--extract-db [db-name]</pre>'
							+'<p>Takes an optional database name or part of a database name: if a partial name, checks all character sheets with the provided text in their name that also have \'-db\' as part of their name.  If omitted, checks all character sheets with \'-db\' in the name.  Not case sensitive.  Can only be used by the GM.</p>'
							+'<p>Extracts a named database or all provided databases from the loaded RPGMaster Library, and builds the database in a Character Sheet format: see the Database specific help handouts for further details of this format.  This allows editing of the standard items in the databases, adding additional items to the databases, or for items to be copied into the GM\'s own databases.  Unlike with previous versions of the Master Series APIs, these extracted databases will not be overwritten by the system. <b>However:</b> using extracted databases will slow the system down - the use of the internal API databases held in memory is much faster. The best use for these extracts is to examine how various items have been programmed so that the GM can create variations of the standard items in their own databases by copying and making small alterations to the definitions, and then the extracted databases can be deleted.</p>'
							+'<p><b>Important:</b> Once a Character Sheet database is changed or deleted, run the <b>--check-db</b> command against any database (especially a changed one) to prompt the APIs to re-index the objects in all databases.</p>'
							+'<h3>6.5 Handshake with other APIs</h3>'
							+'<pre>-hsq from|[command]<br>'
							+'-handshake from|[command]</pre>'
							+'<p>Either form performs a handshake with another API, whose call (without the \'!\') is specified as <i>from</i> in the command parameters (the response is always an <b>-hsr</b> command).  The command calls the <i>from</i> API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>'
							+'<dl><dt>Received:</dt><dd><i>!attk -hsq init</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr attk</i></dd></dl>'
							+'<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the <i>command</i> string parameter is added, where <i>command</i> is the RoundMaster command (the \'--\' text without the \'--\').  This will respond with a <i>true/false</i> response: e.g.</p>'
							+'<dl><dt>Received:</dt><dd><i>!attk -handshake init|menu</i></dd>'
							+'<dt>Response:</dt><dd><i>!init -hsr attk|menu|true</i></dd></dl>'
							+'<h3>6.6 Switch on or off Debug mode</h3>'
							+'<pre>--debug (ON/OFF)</pre>'
							+'<p>Takes one mandatory argument which should be ON or OFF.</p>'
							+'<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player - so the DM or a technical advisor can play as a Player and see the debugging messages.</p>'
							+'<br>'
							+'<h2>7. How To Use AttackMaster</h2>'
							+'<h3>Specifying a token</h3>'
							+'<p>Most of the AttackMaster API commands need to know the token_id of the token that represents the character, NPC or creature that is to be acted upon.  This ID can be specified in two possible ways:</p>'
							+'<ol><li>explicitly in the command call using either a literal Roll20 token ID or using @{selected|token_id} or @{target|token_id} in the command string to read the token_id of a selected token on the map window,<br>or</li>'
							+'<li>by having a token selected on the map window, not specifying the token_id in the command call, and allowing the API to discover the selected token_id.</li></ol>'
							+'<p>In either case, if more than one token is selected at the time of the call then using either @{selected|token_id} to specify the token in the command call, or allowing the command to find a selected token, is likely (but not guaranteed) to take the first token that was selected.  To avoid ambiguity, it is generally recommended to make command calls with only one token selected on the map window.</p>'
							+'<h3>Who can make AttackMaster API command calls</h3>'
							+'<p>The majority of API command calls can be made by both the GM and all Players.  The typical means for command calls to be made is via Character Sheet Token Action Buttons (standard Roll20 functionality - see Roll20 Help Centre for information) which trigger Ability macros on the Character Sheet which simply make the API command call.  The Character Sheets can be controlled by the GM or Players.  The API knows if it is a GM or a Player that has triggered the call, and reacts accordingly.</p>'
							+'<h3>Weapons that can be used</h3>'
							+'<p>Any weapon in the Weapons tables on the Character Sheet can be used for attacks.  However, the very best approach is to use the functions in this and other RPGMaster APIs to manage weapon choice.  Weapon definitions are held in weapon databases: see Database-specific handouts for details.  All standard weapons are included, as well as many magic variations.</p>'
							+'<h3>Allocating weapons to a Character</h3>'
							+'<p>Weapons and ammunition are held in the Items table, which holds data on all items that the Character / NPC / creature has on their person - see the Character Sheet setup help handout regarding where the Item table is on the Character Sheet and the data that is held in it.  The added weapon must have a listing in the Weapons database.</p>'
							+'<p>The easiest way to enter the correct data into the Items table is to use the <b>MagicMaster API</b>, which supports finding and looting weapons e.g. from a chest or a dead body, or just the DM or Player choosing weapons from a menu.  If a Ranged Weapon that uses ammunition is added, a quantity of the respective ammunition (or multiple types of ammunition) must also be added to the Items table.</p>'
							+'<p>Multiple weapons of many different types can be added, including those with magical properties.  The system will take all the weapon statistics into account using the information in the associated databases.</p>'
							+'<h3>Selecting weapons to attack with</h3>'
							+'<p>Each Character / NPC / creature has a defined number of hands (which can be different from 2), and AttackMaster provides a menu to take any weapon(s) in hand.  Doing so enters all the correct information from the weapons database into the Weapons, Damage and Ranged Weapons tables, and the correct ammunition type(s) held in the Items table into the Ammo table.</p>'
							+'<h3>Making attacks</h3>'
							+'<p>Several different attack approaches are supported by the API.</p>'
							+'<table><tr><th scope="row">Roll20 rolls:</th><td>the system makes an attack dice roll and modifies it using the data on the Character Sheet, then displays the results to the Player.  Hovering the mouse over the displayed values of AC (armour class) hit and the Adjustments will display information explaining the values.  Buttons are displayed to make Damage rolls which can be used if the attack was deemed successful (the target\'s AC was the same or worse than the AC hit).</d></tr>'
							+'<tr><th scope="row">Player rolls:</th><td>the system prompts for the Player to roll a dice and enter the result, and then modifies the roll entered using the data on the Character Sheet and displays the result to the Player.  As above, hovering the mouse over the displayed results will explain how the amounts were calculated.  Buttons to make Damage rolls are also displayed, which will also prompt the user to make a dice roll (showing the dice that should be rolled).</td></tr>'
							+'<tr><th scope="row">Targeted attack:</th><td>Option under DM --config control. The DM can, if they choose, make targeted attacks available which prompts the Player to select the target.  The system then rolls the Attack dice and the Damage dice and displays all possible results, and also displays the AC and the HP status of the target for quick analysis.</td></tr></table>'
							+'<h3>Ammunition</h3>'
							+'<p>The system handles both Ranged weapons that take ammunition, such as bows and slings, and also "self-ammoed" Ranged weapons like daggers, that can be thrown at a target.  The quantity of ammunition or self-ammoed weapons is managed by the system: as they are used in attacks, the quantity in the Characters Item table decreases.  A menu can be called to recover ammunition, in agreement with the DM - the same menu can be used to add or remove quantities of ammunition for other reasons (such as being purchased).  Some types of ammo always breaks and can\'t be recovered (for example glass arrows) - this is charged ammo.</p>'
							+'<h3>Ranged weapon and ammunition ranges</h3>'
							+'<p>Each type of ammunition has a range with the weapon used to fire it.  These ranges can be different for different types of weapon - thus a longbow can fire an flight arrow further than a short bow, and a sheaf arrow has different ranges than the flight arrow with each.  The ranges that can be achieved by the weapon and ammunition combination are displayed when they are used in an attack, and the Player is asked to select which range to use, which then applies the correct range modifier to the attack roll.</p>'
							+'<h3>Dancing weapons</h3>'
							+'<p>The system can support any weapon becoming a dancing weapon, with qualities that can be the same as or different from a Sword of Dancing.  In the system a dancing weapon does not have to be held in hand in order for it to be available for attacks and, if using the <b>InitiativeMaster API</b>, the weapon is also automatically added to the Turn Order Tracker for its attacks to be performed in battle sequence.  All of this can be achieved automatically if used with the <b>RoundMaster API</b>, with durations of \'warm up\' and \'dancing\' dealt with, as well as magical properties changing as the rounds progress - that function requires some editing of the Effects database to adapt for a particular weapon - see the RoundMaster API Effect Database documentation for details.</p>'
							+'<h3>Armour Class management</h3>'
							+'<p>The system continually checks the Armour Class of each Character / NPC / creature by examining the information on the Character Sheet and the items in the Item table.  Armour and Shields can be placed in the Items table which will be discovered, and the specifications from the Armour database used to calculate the appropriate AC under various conditions and display them to the Player.  The process the system made to achieve the calculated AC will be shown.</p>'
							+'<p>Many magic items have AC qualities, such as Bracers of Defence and Rings of Protection, and if the <b>MagicMaster API</b> is used these are also taken into account - invalid combinations will also be prevented, such as Rings of Protection with magical armour.  If allocated to a Token Circle, the calculated AC is compared to the displayed Token AC and any difference highlighted - this may be due to magical effects currently in place, for instance - the highlight allows the Player to review why this might be.</p>'
							+'<h3>Saves</h3>'
							+'<p>The corollary to attacks is saves.  The system provides a menu to access, review, update and make saving throws and the appropriate modifiers.</p>'
							+'<p>The initial menu presented shows the saving throw table from the Character Sheet (always the one from the Character tab rather than the Monster Tab - monster saving throws should be copied to both).  Each type of save has a button to make the saving throw: the system will perform the roll and display the result with an indication of success or failure.  The menu also shows buttons to add a situational adjustment (as per the AD&D 2e PHB) and to modify the saving throw table, either automatically (taking into account race, class, level and magic items) or manually.</p>'
							+'<p>The easiest way to set the correct saving throws for each type of save, based on class, level & race, is to use the <b>CommandMaster API</b> Character Sheet setup commands.</p>'
							+'</div>',
						},
	});
	
	/*
	 * Handles for other RPG and Character Sheet specific data tables.
	 */

	var fieldGroups;
	var miTypeLists;
	var clTypeLists;
	var spTypeLists;
	var spellLevels;
	var classLevels;
	var rangedWeapMods;
	var saveLevels;
	var baseSaves;
	var classSaveMods;
	var raceSaveMods;
	var saveFormat;
	var defaultNonProfPenalty;
	var raceToHitMods;
	var classAllowedWeaps;
	var classAllowedArmour;
	var weapMultiAttks;
	var punchWrestle;

	/*
	 * AttackMaster specific global data tables and variables.
	 */

	const PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});
	
	const messages = Object.freeze({
		noChar: '/w "gm" &{template:'+fields.warningTemplate+'}{{name=^^tname^^\'s\nMagic Items Bag}}{{desc=^^tname^^ does not have an associated Character Sheet, and so cannot attack}}',
		cursedSlot: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh what a shame.  No, you can\'t overwrite a cursed item with a different item.  You\'ll need a *Remove Curse* spell or equivalent to be rid of it!}}',
        cursedItem: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try putting this away, but is seems to be back where it was...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		PleaseWait: '**Please wait...** - processing is taking a while',
		noneLeft: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Whoops! It seems you have none of these left... Recover some you\'ve used or buy some more.}}',
		targetAttkDisabled: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nWeapons}}{{desc=The DM has not enabled targeted attacks for players.}}',
	});
	
	const MenuState = Object.freeze({
		ENABLED: false,
		DISABLED: true,
	});
	
	const Attk = Object.freeze({
		TO_HIT: 'TO_HIT',
		ROLL: 'ROLL',
		TARGET: 'TARGET',
		USER: 'USER',
		ROLL_3D: 'ROLL_3D',
	});
	
	const TwoWeapons = Object.freeze({
	    SINGLE: 0,
	    PRIMARY: 2,
	    SECONDARY: 4,
	    NOPENALTY: ['ranger'],
	});
	
	const BT = Object.freeze({
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
		ADD_MIROW:	'ADD_MIROW',
		EDIT_MI:	'EDIT_MI',
		EDITMI_OPTION:'EDITMI_OPTION',	
		CHOOSE_MI:	'CHOOSE_MI',
		REDO_CHOOSE_MI:'REDO_CHOOSE_MI',
		REVIEW_MI:	'REVIEW_MI',
		SLOT_MI:	'SLOT_MI',
		STORE_MI:	'STORE_MI',
		REMOVE_MI:	'REMOVE_MI',
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
		HAND:		'HAND',
		LEFTRING:	'LEFTRING',
		RIGHTRING:	'RIGHTRING',
		NOHANDS:	'NOHANDS',
		AUTO_ADD:	'AUTO_ADD',
		AUTO_DELETE:'AUTO_DELETE',
		AMMO:		'AMMO',
		SAVES:		'SAVES',
	});

	const reIgnore = /[\s\-\_\(\)]*/gi;
	
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
		];
		
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
		];

	const reRepeatingTable = /^(repeating_.*)_\$(\d+)_.*$/;
	
	const reSpecs = /\[\s*?(\w[-\+\s\w\|]*?)\s*?,\s*?(\w[-\s\w\|]*?\w)\s*?,\s*?(\w[\s\w]*?\w)\s*?,\s*?(\w[-\+\s\w\|]*?\w)\s*?\]/g;
    const reHands = /\[\s*?(\w[\s\|\w\-\+]*?)\s*?,\s*?(\w[\s\|\w-]*?\w)\s*?,\s*?(\d+)H\s*?,\s*?(\w[\s\|\w\-\+]*?\w)\s*?\]/ig;

	const reWeapSpecs = Object.freeze ({
		name: 		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+\:\|]+?)[,\]]/i},
		type: 		{field:'type',def:'',re:/[\[,\s]t:([\s\w\-\+\:\|]+?)[,\]]/i},
		superType: 	{field:'superType',def:'',re:/[\[,\s]st:([\s\w\-\+\:\|]+?)[,\]]/i},
		strBonus:	{field:'strBonus',def:'0',re:/[\[,\s]sb:([01])/i},
		dexBonus:	{field:'dexBonus',def:'1',re:/[\[,\s]db:([01])/i},
		adj:		{field:'adj',def:0,re:/[\[,\s]\+:(=?[+-]?\d+?[d.]?\d*?)[,\]]/i},
		noAttks:	{field:'noAttks',def:1,re:/[\[,\s]n:([+-]?[\d.\/]+)[,\]]/i},
		profLevel:	{field:'profLevel',def:0,re:/[\[,\s]pl:(=?[+\-]?[+\-\d\/]+)[,\]]/i},
		dancingProf:{field:'dancingProf',def:0,re:/[\[,\s]dp:(=?[+-]?[\d\/]+)[,\]]/i},
		preInit:	{field:'preInit',def:0,re:/[\[,\s]pre:([01])/i},
		critHit:	{field:'critHit',def:20,re:/[\[,\s]ch:([+-]?\d+?)[,\]]/i},
		critMiss:	{field:'critMiss',def:1,re:/[\[,\s]cm:([+-]?\d+?)[,\]]/i},
		size:		{field:'size',def:'',re:/[\[,\s]sz:([tsmlh])/i},
		level:		{field:'level',def:'',re:/[\[,\s]lv:(\d*):?(\d*)/i},
		castLevel:	{field:'castLevel',def:'',re:/[\[,\s]clv:(\d*):?(\d*)/i},
		muLevel:	{field:'muLevel',def:'',re:/[\[,\s]mulv:(\d*):?(\d*)/i},
		prLevel:	{field:'prLevel',def:'',re:/[\[,\s]prlv:(\d*):?(\d*)/i},
		range:		{field:'range',def:'',re:/[\[,\s]r:(=?[+-]?[\s\w\+\-\d\/]+)[,\]]/i},
		dmgType:	{field:'dmgType',def:'',re:/[\[,\s]ty:([spb]+)[,\]]/i},
		speed:		{field:'speed',def:0,re:/[\[,\s]sp:(=?[+-]?[d\d\+\-]+?)[,\]]/i},
		dmgSM:		{field:'dmgSM',def:0,re:/[\[,\s]sm:(=?[+-]?.*?)[,\]]/i},
		dmgL:		{field:'dmgL',def:0,re:/[\[,\s]l:(=?[+-]?.*?)[,\]]/i},
		weight:		{field:'weight',def:1,re:/[\[,\s]wt:(\d+?)[,\]]/i},	
		allowed:	{field:'allowed',def:'',re:/[\[,\s]allow:([\d,\s]+?)[,\]]/i},
		banned:		{field:'banned',def:'',re:/[\[,\s]ban:([\d,\s]+?)[,\]]/i},
		message:	{field:'message',def:'',re:/[\[,\s]msg:(.+?)[,\]]/i},
		on:			{field:'on',def:'',re:/[\[,\s]on:(.+?)[,\]]/i},
		off:		{field:'off',def:'',re:/[\[,\s]off:(.+?)[,\]]/i},
	});
	
	const reACSpecs = Object.freeze ({
		name: 		{field:'name',def:'',re:/[\[,\s]a:([\s\w\-\+\,\:]+?)[,\]]/i},
		type: 		{field:'type',def:'',re:/[\[,\s]t:([\s\w\-\+\,\:]+?)[,\]]/i},
		superType: 	{field:'superType',def:'',re:/[\[,\s]st:([\s\w\-\+\,\:]+?)[,\]]/i},
		dexBonus:	{field:'dexBonus',def:0,re:/[\[,\s]db:([01])/i},
		ac:			{field:'ac',def:'',re:/[\[,\s]ac:(\d+?)[,\s\]]/i},
		adj:		{field:'adj',def:0,re:/[\[,\s]\+:(=?[+-]?\d+?)[,\s\]]/i},
		size:		{field:'size',def:'',re:/[\[,\s]sz:([tsmlh])/i},
		madj:		{field:'madj',def:0,re:/[\[,\s]\+m:(=?[+-]?\d+?)[,\]]/i},
		sadj:		{field:'sadj',def:0,re:/[\[,\s]\+s:(=?[+-]?\d+?)[,\]]/i},
		padj:		{field:'padj',def:0,re:/[\[,\s]\+p:(=?[+-]?\d+?)[,\]]/i},
		badj:		{field:'badj',def:0,re:/[\[,\s]\+b:(=?[+-]?\d+?)[,\]]/i},
		weight:		{field:'weight',def:1,re:/[\[,\s]wt:(\d+?)[,\]]/i},												 
		allowed:	{field:'allowed',def:'',re:/[\[,\s]allow:([\d,\s]+?)[,\]]/i},
		banned:		{field:'banned',def:'',re:/[\[,\s]ban:([\d,\s]+?)[,\]]/i},
	});
	
	const reSpellSpecs = Object.freeze ({
		name:		{field:'name',def:'-',re:/[\[,\s]w:([\s\w\-\+]+?)[,\]]/i},
		type:		{field:'spell',def:'',re:/[\[,\s]cl:(PR|MU|PW)[,\s\]]/i},
		speed:		{field:'speed',def:0,re:/[\[,\s]sp:([d\d\+\-]+?)[,\s\]]/i},
		level:		{field:'level',def:1,re:/[\[,\s]lv:(\d+?)[,\s\]]/i},
		perDay:		{field:'perDay',def:1,re:/[\[,\s]pd:(\d+?)[,\s\]]/i},
		cost:		{field:'cost',def:0,re:/[\[,\s]gp:(\d+?\.?\d*?)[,\s\]]/i},
		recharge:	{field:'type',def:'uncharged',re:/[\[,\s]rc:([-\w]+?)[,\s\]]/i},
		on:			{field:'on',def:'',re:/[\[,\s]on:(.+?)[,\]]/i},
		off:		{field:'off',def:'',re:/[\[,\s]off:(.+?)[,\]]/i},
		allowed:	{field:'allowed',def:'',re:/[\[,\s]allow:([\d,\s]+?)[,\]]/i},
		banned:		{field:'banned',def:'',re:/[\[,\s]ban:([\d,\s]+?)[,\]]/i},
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
		attklevels:	{field:'attkLevels',def:'0',re:/[\[,\s]attkl:([-\s\d\|]+?)[,\]]/i},
		attkmelee:	{field:'attkMelee',def:'0',re:/[\[,\s]attkm:([-.\s\d\|\/]+?)[,\]]/i},
		attkranged:	{field:'attkRanged',def:'0',re:/[\[,\s]attkr:([-.\s\d\|\/]+?)[,\]]/i},
		nonprofpen:	{field:'nonProfPen',def:'',re:/[\[,\s]npp:([-\s\d]+?)[,\]]/i},
		twoweappen:	{field:'twoWeapPen',def:'2.4',re:/[\[,\s]twp:([-\s\d\.]+?)[,\]]/i},
	});
	
	const reRangeMods = Object.freeze ({
		near:		{field:'N',def:'-5',re:/[\[,\s]N:([-\+\d]+?)[,\]]/i},
		pointblank:	{field:'PB',def:'2',re:/[\[,\s]PB:([-\+\d]+?)[,\]]/i},
		short:		{field:'S',def:'0',re:/[\[,\s]S:([-\+\d]+?)[,\]]/i},
		medium:		{field:'M',def:'-2',re:/[\[,\s]M:([-\+\d]+?)[,\]]/i},
		long:		{field:'L',def:'-5',re:/[\[,\s]L:([-\+\d]+?)[,\]]/i},
		far:		{field:'F',def:'-20',re:/[\[,\s]F:([-\+\d]+?)[,\]]/i},
	});
		
	
	const design = Object.freeze ({
		turncolor: '#D8F9FF',
		roundcolor: '#363574',
		statuscolor: '#F0D6FF',
		statusbgcolor: '#897A87',
		statusbordercolor: '#430D3D',
		edit_icon: 'https://s3.amazonaws.com/files.d20.io/images/11380920/W_Gy4BYGgzb7jGfclk0zVA/thumb.png?1439049597',
		delete_icon: 'https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579',
		settings_icon: 'https://s3.amazonaws.com/files.d20.io/images/11920672/7a2wOvU1xjO-gK5kq5whgQ/thumb.png?1440940765', 
		apply_icon: 'https://s3.amazonaws.com/files.d20.io/images/11407460/cmCi3B1N0s9jU6ul079JeA/thumb.png?1439137300',
		info_msg: '<div style="color:green;font-weight:bold;border:2px solid black;background-color:white;border-radius:1em;padding:1em;">',
		grey_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;"',
		dark_button: '"display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: black; font-weight: normal;"',
		selected_button: '"display: inline-block; background-color: white; border: 1px solid red; padding: 4px; color: red; font-weight: bold;"',
		green_button: '"display: inline-block; background-color: white; border: 1px solid lime; padding: 4px; color: darkgreen; font-weight: bold;"',
		boxed_number: '"display: inline-block; background-color: yellow; border: 1px solid blue; padding: 2px; color: black; font-weight: bold;"'
	});
	
	const silent = true;

	var apiCommands = {};
	var apiDBs = {magic:false,attk:false};
	var classNonProfPenalty = {};

	var flags = {
		feedbackName: 'AttackMaster',
		feedbackImg:  'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
		image: false,
		archive: false,
		dice3d: true,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v2.050 determine if missing libraries should be notified
		notifyLibErr: true
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
		if (!state.magicMaster)
			{state.magicMaster = {};}
		if (_.isUndefined(state.attackMaster.weapRules))
			{state.attackMaster.weapRules = {prof:true,allowAll:false,classBan:false,allowArmour:false,masterRange:false,dmTarget:false};}
		if (_.isUndefined(state.attackMaster.fancy))
		    {state.attackMaster.fancy = true;}
		if (!state.attackMaster.twoWeapons)
		    {state.attackMaster.twoWeapons = {};}
		if (!state.magicMaster.playerConfig)
			{state.magicMaster.playerConfig={};}
		if (_.isUndefined(state.attackMaster.debug))
		    {state.attackMaster.debug = false;}
			
        log('-=> AttackMaster v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
		
		[fields,RPGMap] = getRPGMap();
		dbNames = RPGMap.dbNames;
		fieldGroups = RPGMap.fieldGroups;
		miTypeLists = RPGMap.miTypeLists;
		clTypeLists = RPGMap.clTypeLists;
		spTypeLists = RPGMap.spTypeLists;
		spellLevels = RPGMap.spellLevels;
		classLevels = RPGMap.classLevels;
		rangedWeapMods = RPGMap.rangedWeapMods;
		saveLevels = RPGMap.saveLevels;
		baseSaves = RPGMap.baseSaves;
		classSaveMods = RPGMap.classSaveMods;
		raceSaveMods = RPGMap.raceSaveMods;
		saveFormat = RPGMap.saveFormat;
		defaultNonProfPenalty = RPGMap.defaultNonProfPenalty;
		raceToHitMods = RPGMap.raceToHitMods;
		classAllowedWeaps = RPGMap.classAllowedWeaps;
		classAllowedArmour = RPGMap.classAllowedArmour;
		weapMultiAttks = RPGMap.weapMultiAttks;
		punchWrestle = RPGMap.punchWrestle;
		DBindex = undefined;
		
		// Handshake with other APIs to see if they are loaded
		setTimeout( () => issueHandshakeQuery('magic'), 20);
		setTimeout( () => issueHandshakeQuery('money'), 20);
		setTimeout( () => issueHandshakeQuery('cmd'), 20);
		setTimeout( () => updateHandouts(handouts,true,findTheGM()), 30);
		setTimeout( cmdMasterRegister, 40 );
		
		setTimeout( () => updateDBindex(false), 90); // checking the DB indexing
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
	 * Send a request to run an effect macro to RoundMaster
	**/
	var sendAPImacro = function(curToken,msg,effect,macro) {

		if (!curToken || !macro || !effect) {
			sendDebug('sendAPImacro: a parameter is null');
			return;
		}
		
		var cmd = fields.roundMaster + ' --effect '+curToken.id+'|'+msg+'|'+effect+'|'+macro;
		
		sendAPI( cmd );
		return;
	}

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
		    	{throw {name:'attackMaster Error',message:'sendDebug could not find player'};}
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
			{throw {name:'attackMaster Error',message:'doSetDebug could not find player: ' + args};}
	    if (!!args && args.indexOf('off') != 0) {
    	    state.attackMaster.debug = senderId;
            sendResponseError(senderId,'attackMaster Debug set on for ' + playerName,'attackMaster Debug');
	        sendDebug('Debugging turned on');
	    } else {
    	    sendResponseError(senderId,'attackMaster Debugging turned off','attackMaster Debug');
	        state.attackMaster.debug = false;
	    }
	};

// -------------------------------------------- utility functions ----------------------------------------------

	/**
	 * Issue a handshake request to check if another API or 
	 * specific API command is present
	 **/
	 
	var issueHandshakeQuery = function( api, cmd ) {
		var handshake = '!'+api+' --hsq attk'+((cmd && cmd.length) ? ('|'+cmd) : '');
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
		
	
/* ------------------------- Character Sheet Database Management ------------------------- */

	/*
	 * Check the version of a Character Sheet database and, if 
	 * it is earlier than the static data held in this API, update 
	 * it to the latest version.
	 */
	 
	var buildDB = function( dbFullName, dbObj, silent ) {
		
		return new Promise(resolve => {
			
			try {
				const dbName = dbFullName.toLowerCase(),
					  typeList = dbObj.type.includes('spell') ? spTypeLists : (dbObj.type.includes('class') ? clTypeLists : miTypeLists);
					  
				var	errFlag = buildCSdb( dbFullName, dbObj, typeList, silent );
			} catch (e) {
				log('AttackMaster buildDB: JavaScript '+e.name+': '+e.message+' while building updated databases');
				sendDebug('AttackMaster buildDB: JavaScript '+e.name+': '+e.message+' while building updated databases');
				sendError('AttackMaster JavaScript '+e.name+': '+e.message);
				var errFlag = true;
			} finally {
				setTimeout(() => {
					resolve(errFlag);
				}, 10);
			}
		});
	};
	
	/*
	 * Check a character sheet database and update/create the 
	 * required attributes from the definitions.  This should 
	 * be run after updating or adding item or spell definitions.
	 */
	 
	var checkDB = function( args ) {
		
		checkCSdb( args[0] );
		
		apiDBs.attk = true;
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
		
		apiDBs.magic = !!apiDBs.magic || ('undefined' === typeof MagicMaster);

		DBindex = getDBindex(forceUpdate);
		parseClassDB();
		checkACvars(false);
		return;
	}
	
	/*
	 * Parse the Class Databases to update internal rule tables with 
	 * any changes held for specific Class definitions
	 */
	 
	var parseClassDB = function(silent=true) {
		
		for (const ClassName in DBindex.class_db) {
			let classDef = abilityLookup(fields.ClassDB, ClassName).obj[1].body,
				classData = classDef.match(/}}\s*?ClassData\s*?=(.*?){{/im);
			if (classData && !_.isNull(classData)) {
				classData = [...('['+classData[0]+']').matchAll(/\[.+?\]/g)];
				for (let r=0; r<classData.length; r++) {
					let rowData = classData[r][0],
						parsedData = parseData( rowData, reClassSpecs, false );
					let	name = (parsedData.name || 'Other').toLowerCase().replace(reIgnore,'');
					if (parsedData.attkLevels || parsedData.attkMelee || parsedData.attkRanged) {
						if (_.isUndefined(weapMultiAttks[name])) {
							weapMultiAttks[name] = {};
							weapMultiAttks[name].Levels = new Array(weapMultiAttks.fighter.Levels);
							weapMultiAttks[name].Proficient = Object.create(weapMultiAttks.fighter.Proficient);
						}
						if (parsedData.attkLevels) weapMultiAttks[name].Levels = parsedData.attkLevels.split('|');
						if (parsedData.attkMelee) weapMultiAttks[name].Proficient.melee = parsedData.attkMelee.split('|');
						if (parsedData.attkRanged) weapMultiAttks[name].Proficient.ranged = parsedData.attkRanged.split('|');
					};
					if (parsedData.nonProfPen) {
						classNonProfPenalty[name] = parsedData.nonProfPen;
					};
					let rowArray = rowData.toLowerCase().replace(reIgnore,'').replace(/\[/g,'').replace(/\]/g,'').split(','),
						svlArray = rowArray.filter(elem => elem.startsWith('svl'));
					if (svlArray && svlArray.length) {
						svlArray.sort((a,b)=>{parseInt((a.match(/svl(\d+):/)||[0,0])[1])-parseInt((b.match(/svl(\d+):/)||[0,0])[1]);});
						saveLevels[name] = [];
						baseSaves[name] = [];
						let oldLevel = 0,
							baseIndex = 0;
						svlArray.forEach(svl => {
							let sv = svl.match(/svl(\d+):([\d\|]+)/),
								level = parseInt(sv[1] || 0),
								saves = (sv[2] || '20|20|20|20|20').split('|');
							saveLevels[name].length = level+1;
							saveLevels[name].fill(baseIndex,oldLevel,level+1);
							if (baseIndex == 0 && level != 0) {
								baseSaves[name].push([16,18,17,20,19]);
								baseIndex++;
							}
							saves.length = 5;
							baseSaves[name].push(saves);
							baseIndex++
							oldLevel = level+1;
						});	
					};
					svlArray = rowArray.filter(elem => {return /^sv[a-z]{3}:/.test(elem);});
					if (svlArray && svlArray.length) {
						classSaveMods[name] = {att:'con',par:0,poi:0,dea:0,rod:0,sta:0,wan:0,pet:0,pol:0,bre:0,spe:0};
						svlArray.forEach(svm => {
							let sv = svm.match(/sv([a-z]{3}):\s*([-\+]?\d+|\w{3})/);
							if (sv[1] == 'all') {
								classSaveMods[name] = _.mapObject(classSaveMods[name], (v,k) => {return k != 'att' ? v + (parseInt(sv[2] || 0) || 0) : v;});
							} else {
								classSaveMods[name][sv[1]] = (sv[1] != 'att') ? (parseInt(sv[2] || 0) || 0) : (sv[2] || 'con').toLowerCase().replace(reIgnore,'');
							}
						});
					};
				};
			};
		};	
		return;
	};

/* -------------------------------------------- Utility Functions ------------------------------------------------- */
	
	/*
	 * Function to replace special characters in a string
	 */
	 
	var parseStr=function(str,replaced=replacers){
		return replaced.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}

	/**
	 * Get the configuration for the player who's ID is passed in
	 * or, if the config is passed back in, set it in the state variable
	 **/
	 
	var getSetPlayerConfig = function( playerID, configObj ) {
		
		if (!_.isUndefined(configObj)) {
		    if (!state.MagicMaster.playerConfig[playerID]) {
		        state.MagicMaster.playerConfig[playerID]={};
		    }
			state.MagicMaster.playerConfig[playerID] = configObj;
		}
		return state.MagicMaster.playerConfig[playerID];
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
		
        AC.sh = {};
        AC.sl = {};
        AC.al = {};

		AC.sh.n = {c:(attrLookup(charCS,fields.Armour_normal) || 10),m:(attrLookup(charCS,[fields.Armour_normal[0],'max']) || 10)};
		AC.sh.m = {c:(attrLookup(charCS,fields.Armour_missile) || 10),m:(attrLookup(charCS,[fields.Armour_missile[0],'max']) || 10)};
		AC.sh.s = {c:(attrLookup(charCS,fields.Armour_surprised) || 10),m:(attrLookup(charCS,[fields.Armour_surprised[0],'max']) || 10)};
		AC.sh.b = {c:(attrLookup(charCS,fields.Armour_back) || 10),m:(attrLookup(charCS,[fields.Armour_back[0],'max']) || 10)};
		AC.sh.h = {c:(attrLookup(charCS,fields.Armour_head) || 10),m:(attrLookup(charCS,[fields.Armour_head[0],'max']) || 10)};
		
		AC.sl.n = {c:(attrLookup(charCS,fields.Shieldless_normal) || 10),m:(attrLookup(charCS,[fields.Shieldless_normal[0],'max']) || 10)};
		AC.sl.m = {c:(attrLookup(charCS,fields.Shieldless_missile) || 10),m:(attrLookup(charCS,[fields.Shieldless_missile[0],'max']) || 10)};
		AC.sl.s = {c:(attrLookup(charCS,fields.Shieldless_surprised) || 10),m:(attrLookup(charCS,[fields.Shieldless_surprised[0],'max']) || 10)};
		AC.sl.b = {c:(attrLookup(charCS,fields.Shieldless_back) || 10),m:(attrLookup(charCS,[fields.Shieldless_back[0],'max']) || 10)};
		AC.sl.h = {c:(attrLookup(charCS,fields.Shieldless_head) || 10),m:(attrLookup(charCS,[fields.Shieldless_head[0],'max']) || 10)};
		
		AC.al.n = {c:(attrLookup(charCS,fields.Armourless_normal) || 10),m:(attrLookup(charCS,[fields.Armourless_normal[0],'max']) || 10)};
		AC.al.m = {c:(attrLookup(charCS,fields.Armourless_missile) || 10),m:(attrLookup(charCS,[fields.Armourless_missile[0],'max']) || 10)};
		AC.al.s = {c:(attrLookup(charCS,fields.Armourless_surprised) || 10),m:(attrLookup(charCS,[fields.Armourless_surprised[0],'max']) || 10)};
		AC.al.b = {c:(attrLookup(charCS,fields.Armourless_back) || 10),m:(attrLookup(charCS,[fields.Armourless_back[0],'max']) || 10)};
		AC.al.h = {c:(attrLookup(charCS,fields.Armourless_head) || 10),m:(attrLookup(charCS,[fields.Armourless_head[0],'max']) || 10)};
		
		return AC;
	}

	/*
	 * Create a list of Magic Items in an MI bag, able
	 * to be used to select one from.  A flag determines
	 * whether empty slots '-' are included
	 */

	var makeMIlist = function( charCS, includeEmpty=true, include0=true ) {
	
		var mi, qty, rows, maxSize,
			i = fields.Items_table[1],
			miList = '',
			Items = getTableField( charCS, {}, fields.Items_table, fields.Items_name );
			
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_qty );
		rows = i+((Items && Items.sortKeys) ? Items.sortKeys.length : 0);
		maxSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRows;
		
		while (i < rows) {
			if (i<0) {
				mi = attrLookup( charCS, fields.Items_name );
				qty = attrLookup( charCS, fields.Items_qty ) || 0;
			} else {
			    mi = Items.tableLookup( fields.Items_name, i );
			    qty = Items.tableLookup( fields.Items_qty, i );
			}
			if (_.isUndefined(mi)) {break;}
			if (mi.length > 0 && (includeEmpty || mi != '-')) {
				if (include0 || qty > 0) {
    				miList += '|' + qty + ' ' + mi + ',' + i;
				}
			}
			i++;
		}
		if (i < maxSize && i < fields.MIRows && includeEmpty) {
		    miList += '|0 -,'+i;
		}
		return miList;
	}
	
	/*
	 * Create buttons to select Magic Item slots from. Highlight
	 * any button with the index of MIrowref.  A flag determines
	 * whether empty slots '-' are included.
	 */

	var makeMIbuttons = function( senderId, tokenID, miField, qtyField, cmd, extension='', MIrowref, disable0=true, includeEmpty=false, pickID ) {
		
		var charCS = getCharacter(tokenID),
		    isView = extension == 'viewMI',
			i = fields.Items_table[1],
			isGM = playerIsGM(senderId),
		    qty, mi, type, viewCmd, makeGrey, Items, rows, maxSize, content = '';
		
		if (!_.isUndefined(pickID)) {
			charCS = getCharacter(pickID);
			if (!charCS) {
				charCS = getCharacter(tokenID);
			}
		}
		
		if (_.isUndefined(MIrowref)) MIrowref = -1;

		Items = getTableField( charCS, {}, fields.Items_table, fields.Items_name );
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_qty );
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_type );

		rows = i+((Items && Items.sortKeys) ? Items.sortKeys.length : 0);
		maxSize = attrLookup( charCS, fields.ItemContainerSize ) || fields.MIRows;
		
		while (i < rows) {
			mi = Items.tableLookup( fields.Items_name, i, false, ['',miField] );
			qty = Items.tableLookup( fields.Items_qty, i, true, ['',miField] );
			type = Items.tableLookup( fields.Items_type, i ).toLowerCase();
			makeGrey = (type != 'selfchargeable' && disable0 && qty == 0);
			if (_.isUndefined(mi)) {break;}
			if (mi.length > 0 && (includeEmpty || mi != '-')) {
				content += (i == MIrowref || makeGrey) ? ('<span style=' + (i == MIrowref ? design.selected_button : design.grey_button) + '>') : '['; 
				content += (mi != '-' ? (qty + ' ') : '') + mi;
				if (isView) {
					let miObj = getAbility( fields.MagicItemDB, mi, charCS );
					extension = '&#13;'+(miObj.api ? '' : sendToWho(charCS,senderId,false,true))+miObj.dB+'|'+mi+'}';
				}
				content += (i == MIrowref || makeGrey) ? '</span>' : '](!attk '+viewCmd+' --button '+cmd+'|' + tokenID + '|' + i + extension + ')';
			};
			i++;
		};
		if (i < maxSize && i < fields.MIRows && includeEmpty) {
			content += i == MIrowref ? ('<span style=' + design.selected_button +'>' ) : '['; 
			content += '-';
			content += i == MIrowref  ? '</span>' : '](!attk --button '+BT.ADD_MIROW+'|'+cmd+'|' + tokenID + '|' + i + extension + ')';
		}
		return content;
	}
	
	/*
	 * Determine the non-weapon proficiency penalty for the class or classes 
	 * of the character
	 */
	 
	var getCharNonProfs = function( charCS ) {
		
		var sheetNonProf = attrLookup( charCS, fields.NonProfPenalty ),
			penalties = _.filter( defaultNonProfPenalty, elem => (0 < (attrLookup(charCS,elem[1]) || 0)));
		if (!state.attackMaster.weapRules.prof && !_.isUndefined(sheetNonProf)) {
			return sheetNonProf;
		} else if (!penalties || !penalties.length) {
		    return 0;
		} else {
		    return _.map(penalties, elem => classNonProfPenalty[(attrLookup( charCS, elem[0] ) || '').toLowerCase().replace(reIgnore,'')] || elem[2])
					.reduce((penalty,highest) => Math.max(penalty,highest));
		}
	}
	
	/*
	 * Find the racial weapon mods for a character
	 */
	 
	var raceMods = function( charCS, wt, wst ) {
		var weaponMod,
		    race = attrLookup( charCS, fields.Race ) || '',
    		mods = _.find( raceToHitMods, (elem,r) => {return (race.toLowerCase().includes(r.toLowerCase()));});
		if (_.isUndefined(mods)) {return 0;}
		weaponMod = _.find( mods, elem => {return [wt.toLowerCase(),wst.toLowerCase()].includes(elem[0].toLowerCase());});
		if (_.isUndefined(weaponMod)) {return 0;}
		return weaponMod[1];
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
				parsedData[spec.field] = val.length == 3 ? [val[1],val[2]] : val[1];
			} else if (!def) {
				parsedData[spec.field] = undefined;
			} else {
				parsedData[spec.field] = spec.def;
			}
		});
		return parsedData;
	}
	
	/*
	 * Determine if a particular item type or superType is an 
	 * allowed type for a specific class.
	 */
	 
	var classAllowedItem = function( charCS, wname, wt, wst, allowedItemsByClass ) {
		
        wt = wt ? wt.toLowerCase().replace(reIgnore,'') : '-';
        wst = wst ? wst.toLowerCase().replace(reIgnore,'') : '-';
        wname = wname ? wname.toLowerCase().replace(reIgnore,'') : '-';
		allowedItemsByClass = allowedItemsByClass.toLowerCase().replace(reIgnore,'');
		
		var typeDefaults = {weaps:'any',ac:'any',sps:'any',spm:'',spb:'',align:'any',race:'any'},
			itemType = !_.isUndefined(typeDefaults[allowedItemsByClass]) ? allowedItemsByClass : 'weaps';
			
		var value = classObjects( charCS ).some( elem => {
				if ([wt,wst].includes('innate')) return true;

				if (!elem.obj) return false;
 				let allowedItems = (elem.classData[itemType] || typeDefaults[itemType]).split('|');
                return _.some( allowedItems, item => {
					return item.includes('any') || wt.includes(item) || wst.includes(item) || (wt=='-' && wst=='-' && wname.includes(item));
				}); 
			});
		return value;
	};
	
	/*
	 * Determine if the character has a shield in-hand
	 */
	 
	var shieldInHand = function( charCS, shieldTrueName ) {
		var inHandTable = getTableField( charCS, {}, fields.InHand_table, fields.InHand_trueName );
		return !_.isUndefined(inHandTable.tableFind( fields.InHand_trueName, shieldTrueName ));
	}
	
	/*
	 * Determine if the character is wearing a particular ring
	 */
	 
	var ringOnHand = function( charCS, ringTrueName ) {
		var leftRing = attrLookup( charCS, fields.Equip_leftTrueRing ) || '-',
			rightRing = attrLookup( charCS, fields.Equip_rightTrueRing ) || '-';
		return [leftRing,rightRing].includes(ringTrueName);
	}

	/*
	 * Check all Character Sheets represented by Tokens to ensure 
	 * that they have Slash, Pierce & Bludgeon AC fields created.
	 * This is necessary for Targeted Attacks to not cause errors 
	 * when used on an opponent and the opponent's AC vs. damage 
	 * type is read and displayed.
	 */
	 
	async function checkACvars(forceUpdate) {
		
		var errFlag, charCS;
		
		var setAC = function( tokenID ) {
			
			return new Promise(resolve => {

				try {
					var errFlag = doCheckAC( [tokenID], findTheGM(), [], true );
				} catch (e) {
					log('AttackMaster checkACvars: JavaScript '+e.name+': '+e.message+' while checking AC for tokenID '+tokenID);
					sendDebug('AttackMaster checkACvars: JavaScript '+e.name+': '+e.message+' while checking AC for tokenID '+tokenID);
					sendError('AttackMaster JavaScript '+e.name+': '+e.message);
					errFlag = true;
				} finally {
					setTimeout(() => {
						resolve(errFlag);
					}, 10);
				}
			});
		};
		
		var tokens = filterObjs( function(obj) {
				if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') return false;
				if (!(charCS = getObj('character',obj.get('represents')))) return false;
				return forceUpdate || _.isUndefined(attrLookup( charCS, fields.SlashAC ));
			});
			
		for (const t of tokens) {
			errFlag = await setAC(t.id);
		};
		return;
	};
			
	
	/*
	 * Determine the number of attacks per round for a weapon,
	 * using the type, superType or class (melee/ranged) of 
	 * the weapon.
	 */
	 
	var getAttksPerRound = function( charCS, proficiency, weaponSpecs, weapBase ) {

		var level = Math.max((parseInt(attrLookup( charCS, fields.Fighter_level )) || 0),0),
			charClass = (attrLookup( charCS, fields.Fighter_class ) || 'fighter').toLowerCase().replace(reIgnore,''),
			wt = weaponSpecs[1].toLowerCase().replace(reIgnore,''),
			wst = weaponSpecs[4].toLowerCase().replace(reIgnore,''),
			wc = weaponSpecs[2].toLowerCase().replace(reIgnore,''),
			levelsData = [],
			boost, newVal, result, attksData;
			
		if (_.isUndefined(weapMultiAttks[charClass])) {
			charClass = 'fighter';
		}
		attksData = proficiency > 0 ? weapMultiAttks.All.Specialist : weapMultiAttks[charClass].Proficient;
		if (_.isUndefined(boost = attksData[wt])) {
			if (_.isUndefined(boost = attksData[wst])) {
				if (_.isUndefined(boost = attksData[wc])) {
					return weapBase;
				}
			}
		}
		if (weapBase[0] === '+' || weapBase[0] === '-') {
			weapBase = '1' + weapBase;
		}
		levelsData = Array.from(weapMultiAttks[charClass].Levels);
		if (_.isUndefined(levelsData) || !levelsData.length)
			{levelsData = [0];}
		levelsData = levelsData.reverse();
		let addition = (boost[(levelsData.length - 1 - levelsData.findIndex(l => l <= level ))] || boost[boost.length-1]);
		try {
			newVal = eval('2*('+ weapBase + '+' + addition +')');
			result = (newVal % 2) ? newVal + '/2' : newVal/2;
		} catch {
			result = weapBase;
		}
		return result;
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
	
	/**
	 * Test a dataset to see if level constraints have 
	 * been set for it
	 **/
	 
	var levelTest = function( charCS, dataset ) {
		
		if (!(dataset.level.length || dataset.castLevel.length || dataset.muLevel.length || dataset.prLevel.length)) return true;
		
		var level = parseInt(characterLevel( charCS )) || -1,
			castLevel = parseInt(attrLookup( charCS, fields.CastingLevel )) || -1,
			muLevel = parseInt(attrLookup( charCS, fields.MU_CastingLevel )) || -1,
			prLevel = parseInt(attrLookup( charCS, fields.PR_CastingLevel )) || -1;
			
		if (dataset.level && ((dataset.level[0] && (level < (parseInt(dataset.level[0]) || 0))) || (dataset.level[1] && (level > (parseInt(dataset.level[1]) || 100))))) return false;
		if (dataset.castLevel && ((dataset.castLevel[0] && (castLevel < (parseInt(dataset.catLevel[0]) || 0))) || (dataset.castLevel[1] && (castLevel > (parseInt(dataset.castLevel[1]) || 100))))) return false;
		if (dataset.muLevel && ((dataset.muLevel[0] && (muLevel < (parseInt(dataset.muLevel[0]) || 0))) || (dataset.muLevel[1] && (muLevel > (parseInt(dataset.muLevel[1]) || 100))))) return false;
		if (dataset.prLevel && ((dataset.prLevel[0] && (prLevel < (parseInt(dataset.prLevel[0]) || 0))) || (dataset.prLevel[1] && (prLevel > (parseInt(dataset.prLevel[1]) || 100))))) return false;
		return true;
	}
	
/* ----------------------------------------------- Weapon Management Functions ----------------------------------------
	
	/*
	 * Create a Roll Query with a list of either 1H or 2H 
	 * weapons from the character's magic item bag
	 */
	
	var weaponQuery = function( charCS, handed, type, anyHand=0 ) {
		
		var itemName,
			itemTable = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
			itemTable = getTableField( charCS, itemTable, fields.Items_table, fields.Items_qty ),
			weaponList = (type == 'ring') ? ['-,-'] : ['-,-','Touch,-2','Punch-Wrestle,-2.5'];
			
		for (let r = fields.Items_table[1]; !_.isUndefined(itemName = itemTable.tableLookup( fields.Items_name, r, false )); r++) {
			if (itemTable.tableLookup( fields.Items_qty, r, 0 ) <= 0) continue;
			let nameMatch = itemName.toLowerCase().replace(reIgnore,'');
			let mi = abilityLookup( fields.MagicItemDB, itemName, charCS );
			if (!mi.obj) continue;
			let specs = mi.obj[1].body;
			if (type == 'ring') {
				let weaponSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?ring(?:,|\|).*?\])\s*?{{/im);
				weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(reHands)] : [];
				if (_.some(weaponSpecs, (w) => {
					return ((!state.attackMaster.weapRules.classBan || classAllowedItem( charCS, nameMatch, w[1], w[4], 'ac' )))
				})) {
					weaponList.push(itemName+','+r);
					continue;
				}
			} else {
				let weaponSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?(?:melee|ranged)(?:,|\|).*?\])\s*?{{/im);
				weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(reHands)] : [];
				if (_.some(weaponSpecs, (w) => ((w[3]==handed || (anyHand && w[3]>=anyHand && w[3]<=handed))
							&& (!state.attackMaster.weapRules.classBan || classAllowedItem( charCS, nameMatch, w[1], w[4], 'weaps' ))))) {
					weaponList.push(itemName+','+r);
					continue;
				}
				let shieldSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?shield(?:,|\|).*?\])\s*?{{/im);
				shieldSpecs = shieldSpecs ? [...('['+shieldSpecs[0]+']').matchAll(reHands)] : [];
				if (_.some(shieldSpecs, (s) => ((s[3]==handed || (anyHand && s[3]>=anyHand && s[3]<=handed))
							&& (state.attackMaster.weapRules.allowArmour || classAllowedItem( charCS, nameMatch, s[1], s[4], 'ac' ))))) {
					weaponList.push(itemName+','+r);
					continue;
				}
				let lightSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?light(?:,|\|).*?\])\s*?{{/im);
				lightSpecs = lightSpecs ? [...('['+lightSpecs[0]+']').matchAll(reHands)] : [];
				if (_.some(lightSpecs, (s) => (s[3]==handed || (anyHand && s[3]>=anyHand && s[3]<=handed)))) {
					weaponList.push(itemName+','+r);
					continue;
				}
			}
		};
		if (type !== 'ring') {
			_.each (spellLevels, (level,k) => {
				_.each (level, (l,n) => {
					itemName = '-';
					itemTable = {};
					for (let r=fields.Spells_table[1]; !_.isUndefined(itemName); r++) {
						for (let c=0; (c<fields.SpellsCols && !_.isUndefined(itemName)); c++) {
							if (!itemTable[c]) {
								itemTable[c] = getTableField( charCS, {}, fields.Spells_table, fields.Spells_name, (c+l.base) );
								itemTable[c] = getTableField( charCS, itemTable[c], fields.Spells_table, fields.Spells_weapon, (c+l.base) );
								itemTable[c] = getTableField( charCS, itemTable[c], fields.Spells_table, fields.Spells_castValue, (c+l.base) );
							}
							itemName = itemTable[c].tableLookup( fields.Spells_name, r, false );
							if (itemName && itemName != '-' && itemTable[c].tableLookup( fields.Spells_weapon, r ) === '1' && itemTable[c].tableLookup( fields.Spells_castValue, r ) > 0) {
								weaponList.push(itemName+','+r+':'+(c+l.base))
							}
						}
					}
				});
			});
		};
		return '&#63;{Which '+(type == 'ring' ? 'ring' : 'weapon')+'?|'+weaponList.sort().join('|')+'}';
	}
	
	/*
	 * Check for a character's proficiency with a weapon type
	 */

	var proficient = function( charCS, wname, wt, wst ) {
 
		wname = wname ? wname.toLowerCase().replace(reIgnore,'') : '-';
        wt = wt ? wt.toLowerCase().replace(reIgnore,'') : '';
        wst = wst ? wst.toLowerCase().replace(reIgnore,'') : '';
        
		var i = fields.WP_table[1],
			prof = getCharNonProfs( charCS ),
			WeaponProfs = getTable( charCS, fieldGroups.WPROF ),
			allowedWeap = state.attackMaster.weapRules.allowAll || classAllowedItem( charCS, wname, wt, wst, 'weaps' ),
			spec, wpName, wpType,
			isType, isSuperType, isSameName, isSpecialist, isMastery;

		isType = isSuperType = isSameName = isSpecialist = isMastery = false;
			
		if (allowedWeap) {
			do {
				wpName = WeaponProfs.tableLookup( fields.WP_name, i, false );
				wpType = WeaponProfs.tableLookup( fields.WP_type, i );
				if (_.isUndefined(wpName)) {break;}
				wpName = wpName.toLowerCase().replace(reIgnore,'');
				wpType = (!!wpType ? wpType.toLowerCase().replace(reIgnore,'') : '');
				
				let typeTest = (wpName && wpName.length && wt.includes(wpName)),
					superTypeTest = (wpType && (wst.includes(wpType))),
					nameTest = (wpName && wpName.length && wname.includes(wpName)) || false;
					
				isType = isType || typeTest;
				isSuperType = isSuperType || superTypeTest;
				isSameName = isSameName || nameTest;
				
				if (typeTest || (!superTypeTest && nameTest)) {
					spec = WeaponProfs.tableLookup( fields.WP_specialist, i );
					isSpecialist = isSpecialist || (spec && spec != 0);
					spec = WeaponProfs.tableLookup( fields.WP_mastery, i );
					isMastery = isMastery || (spec && spec != 0);
				}
				i++;
			} while (!_.isUndefined(wpName));
		}
		if (isType || (!isSuperType && isSameName)) {
			prof = isMastery ? 3 : (isSpecialist ? 2 : 0);
		} else {
			setAttr( charCS, fields.NonProfPenalty, prof );
			if (isSuperType) {
				prof = Math.floor(prof/2);
				setAttr( charCS, fields.RelWeapPenalty, prof );
			}
			if (!allowedWeap) {
				if (state.attackMaster.weapRules.classBan) {
					prof = -100;
				} else {
					prof *= 2;
				}
			}
		}
		return prof;
	};
	
	/*
	 * Blank the quiver, ready to be updated with what ammo 
	 * you have in hand at the moment.
	 */
	 
	var blankQuiver = function( charCS, Quiver ) {
		
		var i = Quiver.table[1]-1;
		while(!_.isUndefined(Quiver.tableLookup( fields.Quiver_name, ++i, false ))) {
			Quiver = Quiver.tableSet( fields.Quiver_name, i, '-' );
			Quiver = Quiver.tableSet( fields.Quiver_trueName, i, '-' );
		}
		Quiver.index = Quiver.table[1];
		return Quiver;
	}
	
	/*
	 * Remove the specified weapon from the attack weapon tables
	 */
	 
	var blankWeapon = function( charCS, WeaponInfo, tables, weapon ) {
	    
        var i, f;
		
        for (const e of tables) {
			i = WeaponInfo[e].table[1]-1;
            f = WeaponInfo[e].fieldGroup;
     	    while (!_.isUndefined(WeaponInfo[e].tableLookup( fields[f+'name'], ++i, false ))) {
    	        if (weapon == WeaponInfo[e].tableLookup( fields[f+'miName'], i )) {
    	            WeaponInfo[e].addTableRow( i );
    	        }
    	    }
        }
	    return WeaponInfo;
	}
	
	/*
	 * Filter the specified weapon table, to remove all but the
	 * weapons InHand and in Quiver
	 */

	var filterWeapons = function( tokenID, charCS, InHand, Quiver, Weapons, table, sheathed=[] ) {
		
		var i, base, weapTableField, WeaponTable, weapName,
		    curToken = getObj('graphic',tokenID),
		    CheckTable = InHand,
		    checkTableField = fields.InHand_trueName;

		switch (table.toUpperCase()) {
		case 'MELEE':
			weapTableField = fields.MW_miName;
			break;
		case 'RANGED':
			weapTableField = fields.RW_miName;
			break;
		case 'DMG':
			weapTableField = fields.Dmg_miName;
			break;
		case 'AMMO':
			weapTableField = fields.Ammo_miName;
			CheckTable = Quiver;
			checkTableField = fields.Quiver_trueName;
			break;
		}
				
		WeaponTable = Weapons[table];
		i = WeaponTable.table[1]-1;
		while(!_.isUndefined(weapName = WeaponTable.tableLookup( weapTableField, ++i, false ))) {
			if (weapName && weapName.length && weapName != '-' && _.isUndefined(CheckTable.tableFind( checkTableField, weapName ))) {
				WeaponTable.addTableRow( i );
				if (!sheathed.includes(weapName)) {
					sheathed.push(weapName);
					sendAPImacro(curToken,'',weapName,'-sheath');
					let weapon = getAbility(fields.MagicItemDB, weapName, charCS, false),
						weapData = (weapon.obj ? (weapon.obj[1].body.match(/weapdata\s*?=\s*?(\[.*?\])/im)) : undefined);
					if (weapData) {
						weapData = parseData(weapData[1], reSpellSpecs, false);
						if (weapData.off) {
							sendAPI( parseStr(weapData.off).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
														   .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'));
						};
					};
				};
			};
		};
		return sheathed;
	};
	
	/*
	 * Set up attack table row data using parsed attributes
	 */
	 
	var setAttackTableRow = function( charCS, group, weapon, weapData, proficiency, values ) {
		
		_.each( weapData, (val,key) => {

			if (key == 'dmgType') {
				if (_.isUndefined(fields[group+'slash']) || _.isUndefined(fields[group+'pierce']) || _.isUndefined(fields[group+'bludgeon'])) return;
				let dmgType=val.toUpperCase();
				values[fields[group+'slash'][0]][fields[group+'slash'][1]]=(dmgType.includes('S')?1:0);
				values[fields[group+'pierce'][0]][fields[group+'pierce'][1]]=(dmgType.includes('P')?1:0);
				values[fields[group+'bludgeon'][0]][fields[group+'bludgeon'][1]]=(dmgType.includes('B')?1:0);
			} else {
				if (_.isUndefined(fields[group+key])) return;
				let property = fields[group+key];
				if (key != 'noAttks') {
					values[property[0]][property[1]]=val;
				} else {
					values[property[0]][property[1]] = getAttksPerRound(charCS, proficiency, weapon, val );
				}
			}
		});
		return values;
	}
	
	/*
	 * Insert ammo that has been found into the Ammo table
	 * but avoid duplicates by searching tableInfo ammoTypes
	 */
	
	var insertAmmo = function( charCS, ammoTrueName, ammoSpecs, rangeSpecs, tableInfo, ammoType, sb, miIndex ) {
 
		var ammoData, ammoTest, specType, specSuperType, values, rowAmmo, ammoRow, qty,
			typeCheck = ammoType.toLowerCase().replace(reIgnore,'');
        if (tableInfo.ammoTypes.includes(ammoTrueName+'-'+ammoType)) {return tableInfo;}
		tableInfo.ammoTypes.push(ammoTrueName+'-'+ammoType);
        blankWeapon( charCS, tableInfo, ['AMMO'], ammoTrueName );
 
		for (let w=0; w<ammoSpecs.length; w++) {
			ammoData = ammoSpecs[w][0];
			specType = (ammoData.match(/[\[,\s]t:([\s\w\-\+\:]+?)[,\]]/i) || ['','unknown'])[1].toLowerCase().replace(reIgnore,'');
			specSuperType = (ammoData.match(/[\[,\s]st:([\s\w\-\+\:]+?)[,\]]/i) || ['','unknown'])[1].toLowerCase().replace(reIgnore,'');
			ammoTest = ((parseInt(attrLookup( charCS, fields.CastingLevel)) || 0) >= parseInt((ammoData.match(/[\[,\s]clv:([-\+]?\d+?)[,\]]/i) || ['','0'])[1]))
					&& ((parseInt(attrLookup( charCS, fields.MU_CastingLevel)) || 0) >= parseInt((ammoData.match(/[\[,\s]mulv:([-\+]?\d+?)[,\]]/i) || ['','0'])[1]))
					&& ((parseInt(attrLookup( charCS, fields.PR_CastingLevel)) || 0) >= parseInt((ammoData.match(/[\[,\s]prlv:([-\+]?\d+?)[,\]]/i) || ['','0'])[1]));
			if ((typeCheck == specType || typeCheck == specSuperType) && ammoTest) {
				let miQty = parseInt(attrLookup( charCS, fields.Items_qty, fields.Items_table, miIndex )),
					miMax = parseInt(attrLookup( charCS, fields.Items_trueQty, fields.Items_table, miIndex ));
				if (isNaN(miQty)) miQty = 1;
				if (isNaN(miMax)) miMax = miQty;
				values = initValues( tableInfo.AMMO.fieldGroup );
				values[fields.Ammo_name[0]][fields.Ammo_name[1]]=(ammoData.match(/[\[,\s]w:([\s\w\-\+\,\:]+?)[,\]]/i) || ['','Unknown ammo'])[1];
				values[fields.Ammo_strBonus[0]][fields.Ammo_strBonus[1]]=(sb ? (ammoData.match(/[\[,\s]sb:\s*?([01])\s*?[,\]]/i) || [0,0])[1] : 0);
				values[fields.Ammo_adj[0]][fields.Ammo_adj[1]]=(ammoData.match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || [0,0])[1];
				values[fields.Ammo_reuse[0]][fields.Ammo_reuse[1]]=(ammoData.match(/[\[,\s]ru:\s*?([+-]?[01])\s*?[,\]]/i) || [0,0])[1];
				values[fields.Ammo_dmgSM[0]][fields.Ammo_dmgSM[1]]=(ammoData.match(/[\[,\s]sm:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
				values[fields.Ammo_dmgL[0]][fields.Ammo_dmgL[1]]=(ammoData.match(/[\[,\s]l:(.*?\d+?d\d+?)[,\]]/i) || [0,0])[1];
				qty=parseInt((ammoData.match(/[\[,\s]qty:\s*?(\d+?)[,\]]/i) || [0,0])[1]);
				values[fields.Ammo_setQty[0]][fields.Ammo_setQty[1]] = qty ? 1 : 0;
				values[fields.Ammo_message[0]][fields.Ammo_message[1]]=(ammoData.match(/[\[,\s]msg:(.+?)[,\]]/i) || ['',''])[1];
				if (!qty) {
					values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=miQty;
					values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]]=miMax;
				} else {
					values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=Math.min(qty,miQty);
					values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]] = Math.min(qty,miQty);
				}
				values[fields.Ammo_attkAdj[0]][fields.Ammo_attkAdj[1]]=(rangeSpecs[0][0].match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || ['',''])[1];
				values[fields.Ammo_range[0]][fields.Ammo_range[1]]=(rangeSpecs[0][0].match(/[\[,\s]r:\s*?([-\d\/]+)/i) || ['',''])[1];
				values[fields.Ammo_type[0]][fields.Ammo_type[1]]=ammoType;
				values[fields.Ammo_miName[0]][fields.Ammo_miName[1]]=ammoTrueName;
				
				tableInfo.AMMO.addTableRow( tableInfo.AMMO.tableFind( fields.Ammo_name, '-' ), values );
			}
		}
		return tableInfo;
	}

	/*
	 * Find ammo for the specified ranged weapon type, and
	 * add it to the ammo table
	 */

	var addAmmo = function( charCS, tableInfo, Quiver, weaponType, weaponSuperType, sb, inQuiver ) {
		
		var miIndex = fields.Items_table[1]-1,
			MagicItems = getTableField( charCS, {}, fields.Items_table, fields.Items_trueName ),
			MagicItems = getTableField( charCS, MagicItems, fields.Items_table, fields.Items_name ),
            weaponType = weaponType ? weaponType.toLowerCase().replace(reIgnore,'') : '',
            weaponSuperType = weaponSuperType ? weaponSuperType.toLowerCase().replace(reIgnore,'') : '',
		    ammoTypeCheck = new RegExp('[\[,\s]t:\\s*?'+weaponType+'\\s*?[,\\]]', 'i'),
			ammoSuperTypeCheck = new RegExp('[\[,\s]st:\\s*?'+weaponSuperType+'\\s*?[,\\]]', 'i'),
			rangeTypeCheck = new RegExp( '[\[,\s]t:\\s*?'+weaponType+'\\s*?[,\\]]','i' ),
		    rangeSuperTypeCheck = new RegExp( '[\[,\s]t:\\s*?'+weaponSuperType+'\\s*?[,\\]]','i' ),
			attrs, sortKeys, ammoName, ammoTrueName, ammo, ammoSpecs, rangeSpecs, t;
			
		while (!_.isUndefined(ammoName = MagicItems.tableLookup(fields.Items_name,++miIndex,false))) {
		    ammoTrueName = MagicItems.tableLookup(fields.Items_trueName,miIndex) || ammoName;
			let ammoData, ammoMatch;
			ammo = abilityLookup( fields.MagicItemDB, ammoTrueName, charCS );
    		ammoSpecs = rangeSpecs = [];

			if (ammo.obj && ammo.obj[1]) {
			    ammoData = ammo.obj[1].body;
			    if (ammoData && ammoData.length) {
					ammoMatch = [...(' '+ammoData.match(/}}\s*?ammodata\s*?=.*?(?:\n.*?)*{{/im)).matchAll(/\[.*?\]/g)];
					if (ammoMatch && ammoMatch[0] && ammoMatch[0][0]) {
						ammoSpecs = ammoMatch.filter(elem => ammoTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
						if (!ammoSpecs.length) {
							ammoSpecs = ammoMatch.filter(elem => ammoSuperTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
							t = weaponSuperType;
						} else {
    						t = weaponType;
						}
					}
					if (ammoSpecs && ammoSpecs.length) {
						if (!tableInfo.ammoTypes.includes(ammoTrueName+'-'+t)) {
							ammoMatch = [...(' '+ammoData.match(/}}\s*?rangedata\s*?=.*?(?:\n.*?)*{{/im)).matchAll(/\[.*?\]/g)];
							if (ammoMatch && ammoMatch[0]) {
																			
								rangeSpecs = ammoMatch.filter(elem => rangeTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
								if (!rangeSpecs.length) {
																				  
									rangeSpecs = ammoMatch.filter(elem => rangeSuperTypeCheck.test(elem[0].toLowerCase().replace(reIgnore,'')));
								}
							}
							if (!!rangeSpecs.length) {
								if (inQuiver) {
									tableInfo = insertAmmo( charCS, ammoTrueName, ammoSpecs, rangeSpecs, tableInfo, t, sb, miIndex );
								}
								let values = initValues( Quiver.fieldGroup );
								values[fields.Quiver_name[0]][fields.Quiver_name[1]] = ammoName;
								values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = ammoTrueName;
								values[fields.Quiver_index[0]][fields.Quiver_index[1]] = miIndex;
								Quiver.addTableRow( Quiver.index, values );
								Quiver.index++;
							}
						}
					}
				} else {
				    log('addAmmo no ammo defined for '+ammoTrueName);
					sendDebug('addAmmo no ammo defined for '+ammoTrueName);
				}
			} else {
			    log('addAmmo not found MI definition for '+ammoTrueName);
				sendDebug('addAmmo not found MI definition for '+ammoTrueName);
			}
		}
		return [tableInfo, Quiver];
	}
	
	/*
	 * Add a weapon to the weapon tables.  Get the full specs from 
	 * the magic item database.  If it is a ranged weapon, also 
	 * search for matching ammo.  Use a returned array to ensure 
	 * ammo duplications don't occur
	 */

	var addWeapon = function( charCS, hand, noOfHands, i, dancing, tableInfo, Quiver, InHandTable ) {
		
		var lineNo = InHandTable.tableLookup( fields.InHand_index, i );

		if (isNaN(lineNo) || lineNo < -3) {
			if (!!hand) {
				setAttr( charCS, hand, '' );
			}
			return [tableInfo,Quiver];
		}
		
		var weaponDB = InHandTable.tableLookup( fields.InHand_db, i ),
			weaponName = InHandTable.tableLookup( fields.InHand_name, i ),
			weaponTrueName = InHandTable.tableLookup( fields.InHand_trueName, i, weaponName ),
			item = abilityLookup(weaponDB, weaponTrueName, charCS),
			specs = item.obj[1].body,
			weaponSpecs = specs.match(/}}\s*Specs=\s*?(\[.*?(?:melee|ranged).*?\])\s*?{{/im),
			toHitSpecs = specs.match(/}}\s*ToHitData\s*=(.*?){{/im),
			dmgSpecs = specs.match(/}}\s*DmgData\s*=(.*?){{/im),
			ammoSpecs = specs.match(/}}\s*AmmoData\s*=(.*?){{/im),
			re = /[\s\-]*?/gi,
			tempObj, values, group,
			wt, wst, dmg,
			rowWeap, weapRow,
			dancingProf;
			
		blankWeapon( charCS, tableInfo, ['MELEE','RANGED','DMG','AMMO'], weaponTrueName );
		
		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(reSpecs)] : [];
		toHitSpecs = toHitSpecs ? [...('['+toHitSpecs[0]+']').matchAll(/\[.+?\]/g)] : []; // [\s\w\-\+\*\/\,\:]
		dmgSpecs = dmgSpecs ? [...('['+dmgSpecs[0]+']').matchAll(/\[.+?\]/g)] : [];       // [\s\w\-\+\*\/\,\:]
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[.+?\]/g)] : [];    // [\s\w\-\+\*\/\,\:]

		if (!!hand) {
			setAttr( charCS, hand, weaponName );
		}
		
		for (let i=0; i<Math.min(weaponSpecs.length,toHitSpecs.length); i++) {
			let weapon = weaponSpecs[i],
				toHit = toHitSpecs[i][0],
				innate = weapon[2].toLowerCase().includes('innate'),
				proficiency = innate ? 0 : proficient( charCS, weaponTrueName, weapon[1], weapon[4] ),
				attk2H = weapon[3]=='2H' ? 1 : 0;
			
			if ((noOfHands == 0) || (noOfHands ==  (attk2H+1))) {
			
				let weapData = parseData( toHit, reWeapSpecs );
				
				if (!levelTest( charCS, weapData )) continue;
				
				if (weapon[2].toLowerCase().includes('melee')) {

					values = initValues( tableInfo.MELEE.fieldGroup );
					values[fields.MW_name[0]][fields.MW_name[1]]='Unknown weapon';
					
					values = setAttackTableRow( charCS, tableInfo.MELEE.fieldGroup, weapon, weapData, proficiency, values );
					values[fields.MW_miName[0]][fields.MW_miName[1]]=weaponTrueName;
					values[fields.MW_twoHanded[0]][fields.MW_twoHanded[1]]=attk2H;
					values[fields.MW_profLevel[0]][fields.MW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.MW_type[0]][fields.MW_type[1]]=innate ? 'innate' : weapon[1];
					values[fields.MW_superType[0]][fields.MW_superType[1]]=weapon[4];
					values[fields.MW_dancing[0]][fields.MW_dancing[1]]=(dancing?1:0);
					dancingProf = parseInt(values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] = getAttksPerRound(charCS, 
														 dancingProf, 
														 weapon,
														 values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] );
					}
					if (_.isUndefined( weapRow = tableInfo.MELEE.tableFind( fields.MW_name, '-', false ))) weapRow = tableInfo.MELEE.sortKeys.length;
					tableInfo.MELEE.addTableRow( weapRow, values );
						
					if (dmgSpecs && i<dmgSpecs.length && !_.isUndefined(dmg=dmgSpecs[i][0])) {
						values = setAttackTableRow( charCS, tableInfo.DMG.fieldGroup, weapon, parseData( dmg, reWeapSpecs ), proficiency, initValues( tableInfo.DMG.fieldGroup ) );
						values[fields.Dmg_type[0]][fields.Dmg_type[1]]=innate ? 'innate' : weapon[1];
						values[fields.Dmg_superType[0]][fields.Dmg_superType[1]]=weapon[4];
						values[fields.Dmg_miName[0]][fields.Dmg_miName[1]]=weaponTrueName;
						values[fields.Dmg_specialist[0]][fields.Dmg_specialist[1]]=(proficiency>=1)?1:0;
						
						tableInfo.DMG.addTableRow( weapRow, values );
					} else {
						sendError('Weapon '+weaponTrueName+' missing damage spec');
					}
				} else if (weapon[2].toLowerCase().includes('ranged')) {

					values = setAttackTableRow( charCS, tableInfo.RANGED.fieldGroup, weapon, weapData, proficiency, initValues( tableInfo.RANGED.fieldGroup ) );
					values[fields.RW_miName[0]][fields.RW_miName[1]]=weaponTrueName;
					values[fields.RW_twoHanded[0]][fields.RW_twoHanded[1]]=attk2H;
					values[fields.RW_profLevel[0]][fields.RW_profLevel[1]]=Math.min(proficiency,0);
					values[fields.RW_type[0]][fields.RW_type[1]]=innate ? 'innate' : weapon[1];
					values[fields.RW_superType[0]][fields.RW_superType[1]]=weapon[4];
					values[fields.RW_dancing[0]][fields.RW_dancing[1]]=(dancing?1:0);
					dancingProf = parseInt(values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] = getAttksPerRound(charCS, 
														 dancingProf, 
														 weapon,
														 values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] );
					}

					if (_.isUndefined( weapRow = tableInfo.RANGED.tableFind( fields.RW_name, '-', false ))) weapRow = tableInfo.RANGED.sortKeys.length;
					tableInfo.RANGED.addTableRow( weapRow, values );

					let attkStrBonus = values[fields.RW_strBonus[0]][fields.RW_strBonus[1]];
					if (ammoSpecs && ammoSpecs.length) {
						let rangeSpecs = [...('['+specs.match(/}}\s*RangeData\s*=(.*?){{/im)[0]+']').matchAll(/\[[\s\w\-\+\,\:\/]+?\]/g)];
						if (rangeSpecs && rangeSpecs.length) {
							if (!weaponDB.startsWith(fields.WeaponDB)) lineNo = NaN;
							tableInfo = insertAmmo( charCS, weaponTrueName, ammoSpecs, rangeSpecs, tableInfo, weapon[1], attkStrBonus, lineNo );
							values = initValues( fieldGroups.QUIVER.prefix );
							values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
							values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
							values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo;
							Quiver.addTableRow( Quiver.index, values );
							Quiver.index++;
						}
					} else {
						[tableInfo,Quiver] = addAmmo( charCS, tableInfo, Quiver, weapon[1], weapon[4], attkStrBonus, true );
					}
				}
			}
		}
		return [tableInfo,Quiver];
	};

	/*
	 * Search for ammo associated with a weapon at line lineNo in 
	 * the character's MI Bag, and add it to the Quiver table (representing 
	 * ammo 'in hand').  This is then used to compare to the Ammo table,
	 * and any lines with ammo that do not appear in the Quiver are
	 * removed.
	 */

	var putAmmoInQuiver = function( charCS, weaponInfo, Quiver, lineNo ) {

		if (isNaN(lineNo) || lineNo < -1) {
			return Quiver;
		}
		var weaponName = attrLookup( charCS, fields.Items_name, fields.Items_table, lineNo ),
			weaponTrueName = attrLookup( charCS, fields.Items_trueName, fields.Items_table, lineNo ) || weaponName,
			specs = abilityLookup(fields.WeaponDB, weaponName, charCS).obj[1].body,
			weaponSpecs = specs.match(/}}\s*Specs\s*=(.*?){{/im),
			ammoSpecs = specs.match(/}}\s*ammodata\s*=(.*?){{/im);
			
		weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(reSpecs)] : [];
		ammoSpecs = ammoSpecs ? [...('['+ammoSpecs[0]+']').matchAll(/\[.+?\]/g)] : [];

		for (let i=0; i<weaponSpecs.length; i++) {
			let weapon = weaponSpecs[i];
			if (weapon[2].toLowerCase().includes('ranged')) {
				if (ammoSpecs && ammoSpecs.length) {
					let values = initValues( Quiver.fieldGroup );
					values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
					values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
					values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo
					Quiver.addTableRow( Quiver.index, values );
					Quiver.index++;
				} else {
					[weaponInfo, Quiver] = addAmmo( charCS, weaponInfo, Quiver, weapon[1], weapon[4], 0, false );
				}
			}
		}
		return Quiver;
	};

	/*
	 * Find the named weapons in the character's Magic Item 
	 * bag and return their current index.
	 */

	var findWeapon = function( charCS, ...weapons ) {
		
		var i = fields.Items_table[1],
			MagicItems = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
		    itemName,
			index = [];
			
		index.length = weapons.length;
		index.fill(NaN);
		
		while (!_.isUndefined(itemName = MagicItems.tableLookup( fields.Items_name, i, false ))) {
			index[weapons.indexOf(itemName)] = i;
			i++;
		}
		return index;
	}
	
	/*
	 * Function to check the number of rows in the weapons InHand table 
	 * matches the number of hands that the character has, and if necessary 
	 * add more rows.
	 */
	 
	var checkInHandRows = function( charCS, InHandTables, hands ) {
		
		var values = initValues( fieldGroups.INHAND.prefix ),
		    rows = Math.max(3,((parseInt(hands)||0)+1)),
		    i;
		
		for (i=0; i<rows; i++) {
			if (_.isUndefined(InHandTables.tableLookup( fields.InHand_name, i, false ))) {
				InHandTables.addTableRow( i, values );
			};
		};
		return InHandTables;
	}
	
	/*
	 * Function to promote InHand weapons to the character sheet 
	 * weapons in use & attack tables
	 */
	 
	var updateAttackTables = function( charCS, InHandTable, Quiver, weaponInfo, rowInHand, miSelection, handedness ) {
	
        var base = fields.InHand_table[1],
			i = base,
			lentHands = parseInt(attrLookup( charCS, fields.Equip_lentHands )) || 0,
			noHands = Math.max(((parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2) + lentHands), 2),
			weapon, hand, index;

		while ((!_.isUndefined(weapon = InHandTable.tableLookup( fields.InHand_name, i, false )))) {
            index = InHandTable.tableLookup( fields.InHand_index, i, false );
		    if (i == rowInHand) {
		        index = parseFloat(miSelection);
    		    hand = (i==base ? fields.Equip_leftHand : (i==base+1 ? fields.Equip_rightHand : (i==base+2 ? fields.Equip_bothHands : null)));
				[weaponInfo,Quiver] = addWeapon( charCS, hand, handedness, i, (i>(noHands+base)), weaponInfo, Quiver, InHandTable );
		    } else {
				if (weapon != '-' && index != '' && index >= -1) {
					Quiver = putAmmoInQuiver( charCS, weaponInfo, Quiver, index );
				}
            }
			i++;
		}
		return [weaponInfo,Quiver];
	}
	
/* ----------------------------------------- Armour Management Functions ----------------------------------------------- */
	
	/*
	 * Function to scan the magic item bag for any armour, shields or 
	 * protective items and build and retun a table of the best versions 
	 * of each type
	 */
	 
	var scanForArmour = function( charCS ) {
		
		var Items = getTableField( charCS, {}, fields.Items_table, fields.Items_trueName ),
			i = Items.table[1]-1,
			totalFlag = false,
			armourMsg = [],
			itemName, itemTrueName,
			acValues = {armour:{name:'Clothes',magic:false,specs:['','Clothes','armour','0H','cloth'],data:{ac:10,adj:0,madj:0}}},
			dexBonus = parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0),
			itemDef, itemDesc, itemSpecs, itemData;
			
		if ((attrLookup( charCS, fields.MonsterAC ) || '').length) {
			let monsterAC = attrLookup( charCS, fields.MonsterAC );
			acValues = {armour:{name:'Monster',magic:false,specs:['','Monster','armour','0H','skin'],data:{ac:monsterAC,adj:0,madj:0}}};
		}
		
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_name );
		while (!_.isUndefined(itemName = Items.tableLookup( fields.Items_name, ++i, false ))) {
			itemTrueName = Items.tableLookup( fields.Items_trueName, i ) || itemName;
			if (itemName.length && itemName != '-') {
				itemDef = abilityLookup( fields.MagicItemDB, itemTrueName, charCS );
				if (itemDef.obj) {
					itemDesc = itemDef.obj[1].body;
					itemSpecs = itemDesc.match(/}}\s*Specs\s*=(.*?(?:armou?r|shield|protection).*?){{/im);
					itemData = itemDesc.match(/}}\s*a?c?data\s*=(.*?){{/im);
					
					if (itemData && itemSpecs) {
						itemSpecs = [...('['+itemSpecs[0]+']').matchAll(reSpecs)];
						itemData = [...('['+itemData[0]+']').matchAll(/\[.+?\]/g)];
						for (let i=0; i<Math.min(itemSpecs.length,itemData.length); i++) {
							let	acData = parseData( itemData[i][0], reACSpecs );
							if (!acData.name.length) continue;
							let itemType = itemSpecs[i][1].toLowerCase().replace(reIgnore,''),
								itemClass = itemSpecs[i][2].toLowerCase().replace(reIgnore,''),
								itemHands = itemSpecs[i][3].toUpperCase(),
								itemSuperType = itemSpecs[i][4].toLowerCase().replace(reIgnore,'');
							if (itemClass == 'armor') itemClass = 'armour';
							if (!state.attackMaster.weapRules.allowArmour && !classAllowedItem(charCS, itemName, itemType, itemSuperType, 'ac')) {
								armourMsg.push(itemName+' is not of a usable type');
							} else if (itemClass == 'shield' && itemHands != '0H' && !shieldInHand(charCS,itemTrueName)) {
								armourMsg.push(itemName+' is not currently in hand');
							} else if (itemClass.includes('ring') && itemHands != '0H' && !ringOnHand(charCS,itemTrueName)) {
								armourMsg.push(itemName+' is not currently worn');
							} else {
								let ac = parseInt(acData.ac || 10),
									adj = ((parseInt(acData.adj || 0) + parseInt(acData.madj || 0) + parseInt(acData.sadj || 0) + parseInt(acData.padj || 0) + parseInt(acData.badj || 0))/5),
									dexAdj = Math.floor(dexBonus * parseFloat(acData.db || 1)),
									diff;
								if (itemClass == 'totalac') {
									itemClass = 'armour';
									if (totalFlag) {
										diff = (acValues.armour.data.ac - acValues.armour.data.adj - (acValues.armour.data.db*dexBonus)) - (ac - adj - dexAdj);
									} else {
										_.each( acValues, e => armourMsg.push(e.name+' is overridden by another item'));
										acValues = {};
										diff = 1;
										totalFlag = true;
									}
								} else if (!totalFlag) {
									if (itemClass.includes('protection') && acValues.armour.magic) {
										armourMsg.push(itemName+' does not add to magical armour');
									} else if (_.isUndefined(acValues[itemClass])) {
										diff = 1;
									} else {
										let data = acValues[itemClass].data,
											itemAdj = (parseInt(data.adj || 0) + parseInt(data.madj || 0) + parseInt(data.sadj || 0) + parseInt(data.padj || 0) + parseInt(data.badj || 0))/5;
										diff = (parseInt(data.ac || 10) - itemAdj - (parseFloat(data.db || 1)*dexBonus)) - (ac - adj - dexAdj);
									}
									
								} else {
									armourMsg.push(itemName+' is overridden by another item');
									diff = undefined;
								}
								
								if (!_.isUndefined(diff)) {
									if (diff < 0) {
										armourMsg.push(itemName+' is not the best '+itemSpecs[i][2]+' available');
									} else if (diff == 0) {
										armourMsg.push(itemName+' is no better than other '+itemSpecs[i][2]+'s');
									} else {
										if (acValues[itemClass] && acValues[itemClass].name) {
											armourMsg.push(acValues[itemClass].name+' is not the best '+itemSpecs[i][2]+' available');
										}
										acValues[itemClass] = {};
										acValues[itemClass].name = itemName;
										acValues[itemClass].specs = itemSpecs[i];
										acValues[itemClass].data = acData;
										
										if (itemClass == 'armour') {
											acValues.armour.magic = parseInt(acData.adj||0)!=0;
											if (acValues.armour.magic) {
												acValues = _.omit( acValues, function(item,iClass) {
													if (iClass.toLowerCase().includes('protection')) {
														armourMsg.push(item.name+' cannot be used alongside magical armour');
														return true;
													}
													return false;
												});
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return {acValues: acValues, msgs: armourMsg};
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
	 * Get the "to-hit" dice roll specification from the passed attack macro object
	 */
	 
	var getToHitRoll = function( attkMacro ) {
		var rollSpec = attkMacro.match(/}}\s*Specs\s*=\s*\[\s*\w[\s\|\w\-]*?\s*?,\s*?\w[\s\|\w\-]*?\w\s*?,\s*?(\d+d\d+)\s*?,\s*?\w[\s\|\w\-]*?\w\s*?\]/im);
		return rollSpec ? rollSpec[1] : fields.toHitRoll;
	};
	
	/*
	 * Slot a damage message into a parsed attack macro, if given
	 */
	 
	var addDmgMsg = function( attkMacro, cmdMsg='', dmgMsg='', weapMsg='' ) {
		if (cmdMsg.length || dmgMsg.length || weapMsg.length) {
			let parts = attkMacro.match(/^([^]*}}[^}{]*?$)([^]*)/);
			if (parts && parts[1]) {
				attkMacro = parts[1] + (weapMsg.length ? ('{{desc7='+parseStr(weapMsg)+'}}') : '') + (dmgMsg.length ? ('{{desc8='+parseStr(dmgMsg)+'}}') : '') + (cmdMsg.length ? ('{{desc9='+parseStr(cmdMsg)+'}}') : '') + (parts[2] || '');
			}
		}
		return attkMacro;
	}
	
	/*
	 * Create the macros for monster attacks
	 */
	 
	var buildMonsterAttkMacros = function( args, senderId, charCS, attk1, attk2, attk3 ) {
		
		return new Promise(resolve => {
			
			try {
				
				var tokenID = args[1],
					attkType = args[2],
					msg = parseStr(args[5] || attrLookup( charCS, fields.Attk_specials ) || ''),
					curToken = getObj('graphic',tokenID),
					tokenName = curToken.get('name'),
					charName = charCS.get('name'),
					raceName = attrLookup( charCS, fields.Race ) || '',
					thac0 = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0,fields.Thac0_base).val || 20,
					monsterCritHit = attrLookup( charCS, fields.MonsterCritHit ) || 20,
					monsterCritMiss = attrLookup( charCS, fields.MonsterCritMiss ) || 1,
					monsterDmg1 = (attrLookup( charCS, fields.Monster_dmg1 ) || '0').split(','),
					monsterDmg2 = (attrLookup( charCS, fields.Monster_dmg2 ) || '0').split(','),
					monsterDmg3 = (attrLookup( charCS, fields.Monster_dmg3 ) || '0').split(','),
					magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0,
					magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
					strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
					strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
					ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]',
					noModsACtxt = 'No Mods',
					tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, fields.Thac0_base ).barName,
					tokenAC		= (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]') : ''),
					tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ).barName,
					tokenHP		= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'} &{noerror}]]') : ''),
					tokenMaxHP	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'|max} &{noerror}]]') : ''),
					slashWeap	= true,
					pierceWeap	= true,
					bludgeonWeap= true,
					weapTypeTxt, ACslash, ACpierce, ACbludgeon,
					sACtxt, pACtxt, bACtxt,
					slashACtxt, pierceACtxt, bludgeonACtxt, 				
					attkMacro, attkMacroDef, errFlag=false,
					macroNameRoot, dmgSMmacro, dmgSMmacroName,
					targetStatsName, dmgLmacro, dmgLmacroName, 
					monDmg, monDmg1, monDmg2, monDmg3, monAttk, dmgType;

				var parseMonAttkMacro = function( args, charCS, attkType, attkMacro ) {
					
					var	toHitRoll = getToHitRoll( attkMacro ),
						monDmgRoll = monDmg;
						
					if (attkType.toUpperCase() == Attk.ROLL) {
							toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
							monDmgRoll = '?{Roll Damage|'+monDmg+'}';
					}
					attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,senderId,false) )
										 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,senderId,true) )
										 .replace( /\^\^defaultTemplate\^\^/gi , fields.targetTemplate )
										 .replace( /\^\^cname\^\^/gi , charName )
										 .replace( /\^\^tname\^\^/gi , tokenName )
										 .replace( /\^\^cid\^\^/gi , charCS.id )
										 .replace( /\^\^tid\^\^/gi , tokenID )
										 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
										 .replace( /\^\^attk\^\^/gi , monAttk )
										 .replace( /\^\^attk1\^\^/gi , monAttk )
										 .replace( /\^\^attk2\^\^/gi , monAttk )
										 .replace( /\^\^attk3\^\^/gi , monAttk )
										 .replace( /\^\^monsterCritHit\^\^/gi , monsterCritHit )
										 .replace( /\^\^monsterCritMiss\^\^/gi , monsterCritMiss )
										 .replace( /\^\^thac0\^\^/gi , thac0 )
										 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
										 .replace( /\^\^weapType\^\^/gi , weapTypeTxt )
										 .replace( /\^\^ACvsNoMods\^\^/gi , ACnoMods )
										 .replace( /\^\^ACvsSlash\^\^/gi , ACslash )
										 .replace( /\^\^ACvsPierce\^\^/gi , ACpierce )
										 .replace( /\^\^ACvsBludgeon\^\^/gi , ACbludgeon )
										 .replace( /\^\^ACvsNoModsTxt\^\^/gi , noModsACtxt )
										 .replace( /\^\^ACvsSlashTxt\^\^/gi , slashACtxt )
										 .replace( /\^\^ACvsPierceTxt\^\^/gi , pierceACtxt )
										 .replace( /\^\^ACvsBludgeonTxt\^\^/gi , bludgeonACtxt )
										 .replace( /\^\^ACvsSTxt\^\^/gi , sACtxt )
										 .replace( /\^\^ACvsPTxt\^\^/gi , pACtxt )
										 .replace( /\^\^ACvsBTxt\^\^/gi , bACtxt )
										 .replace( /\^\^targetACfield\^\^/gi , tokenAC )
										 .replace( /\^\^targetAC\^\^/gi , tokenAC )
										 .replace( /\^\^ACfield\^\^/gi , tokenACname )
										 .replace( /\^\^monsterDmg\^\^/gi , monDmgRoll )
										 .replace( /\^\^monsterDmgSM\^\^/gi , monDmgRoll )
										 .replace( /\^\^monsterDmgL\^\^/gi , monDmgRoll )
										 .replace( /\^\^monsterDmg1\^\^/gi , monDmgRoll )
										 .replace( /\^\^monsterDmg2\^\^/gi , monDmgRoll )
										 .replace( /\^\^monsterDmg3\^\^/gi , monDmgRoll )
										 .replace( /\^\^magicDmgAdj\^\^/gi , magicDmgAdj )
										 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
										 .replace( /\^\^targetHP\^\^/gi , tokenHP )
										 .replace( /\^\^targetMaxHP\^\^/gi , tokenMaxHP )
										 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
										 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
										 .replace( /\^\^strDmgBonus\^\^/gi , strDmg )
										 .replace( /\^\^monsterDmgMacroSM\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /\^\^monsterDmgMacroL\^\^/gi , (charName+'|'+dmgLmacroName))
										 .replace( /\^\^monsterDmgMacro1\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /\^\^monsterDmgMacro2\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /\^\^monsterDmgMacro3\^\^/gi , (charName+'|'+dmgSMmacroName));
					
					return attkMacro;
				};
					
				monDmg1 = monsterDmg1[(monsterDmg1.length > 1 ? 1 : 0)];
				monDmg2 = monsterDmg2[(monsterDmg2.length > 1 ? 1 : 0)];
				monDmg3 = monsterDmg3[(monsterDmg3.length > 1 ? 1 : 0)];
				
				msg = msg.split('$$');
				
				var attkType = args[2],
					abilityType = attkType.toUpperCase(),
					abilityRoot = 'Mon-' + (abilityType == Attk.TARGET ? 'Targeted-Attk' : 'Attk'),
					qualifier = '-'+charName,
					dmgSMmacroDef, dmgLmacroDef;
								   
				attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+qualifier, charCS, silent );
				if (!attkMacroDef.obj) {
					qualifier = '-'+raceName;
					attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+qualifier, charCS, silent );
				}
				if (!attkMacroDef.obj) {
					qualifier = '';
					attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot, charCS );
				}
				if (!(errFlag = !attkMacroDef.obj)) {
					attkMacro = attkMacroDef.obj[1].body;
					dmgSMmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgSM'+qualifier, charCS, silent );
					if (!dmgSMmacroDef.obj) {
						dmgSMmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgSM', charCS );
					}
				}
				if (!(errFlag = errFlag || !dmgSMmacroDef.obj)) {
					dmgSMmacro = dmgSMmacroDef.obj[1].body;
					dmgLmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgL'+qualifier, charCS, silent );
					if (!dmgLmacroDef.obj) {
						dmgLmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgL', charCS );
					}
				}
				if (!(errFlag = errFlag || !dmgLmacroDef.obj)) {
					dmgLmacro = dmgLmacroDef.obj[1].body;
				
					macroNameRoot = 'Do-not-use-Monster-';
					
					for (let i=1; i<=3; i++) {
						monAttk = (i==1 ? attk1 : (i==2 ? attk2 : attk3));
						
						if (monAttk) {
							monDmg  = (i==1 ? monDmg1 : (i==2 ? monDmg2 : monDmg3));
							dmgType = (i==1 ? monsterDmg1 : (i==2 ? monsterDmg2 : monsterDmg3 ));
							dmgSMmacroName = macroNameRoot+'DmgSM-'+i;
							dmgLmacroName = macroNameRoot+'DmgL-'+i;
							if (dmgType.length > 3) {
								slashWeap	= dmgType[3].toUpperCase().includes('S');
								pierceWeap	= dmgType[3].toUpperCase().includes('P');
								bludgeonWeap= dmgType[3].toUpperCase().includes('B');
							} else {
								slashWeap = pierceWeap = bludgeonWeap = true;
							}
							weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':'');
							ACslash		= slashWeap ? '[[([[0+@{Target|Select Target|'+fields.SlashAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '';
							ACpierce	= pierceWeap ? '[[([[0+@{Target|Select Target|'+fields.PierceAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '';
							ACbludgeon	= bludgeonWeap ? '[[([[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '';
							sACtxt		= slashWeap ? 'S' : '';
							pACtxt		= pierceWeap ? 'P' : '';
							bACtxt		= bludgeonWeap ? 'B' : '';
							slashACtxt	= slashWeap ? 'Slash' : '';
							pierceACtxt	= pierceWeap ? 'Pierce' : '';
							bludgeonACtxt=bludgeonWeap ? 'Bludgeon' : '';
							if (abilityType == Attk.TARGET) {
								setAbility( charCS, macroNameRoot+'Attk-'+i, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( attkMacro, msg[i-1] )));
							} else {
								setAbility( charCS, macroNameRoot+'Attk-'+i, parseMonAttkMacro(args, charCS, attkType, attkMacro) );
							}
							setAbility( charCS, dmgSMmacroName, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( dmgSMmacro, msg[i-1] )));
							setAbility( charCS, dmgLmacroName, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( dmgLmacro, msg[i-1] )));
						}
					}
				}
			} catch (e) {
				log('AttackMaster buildMonsterAttkMacros: JavaScript '+e.name+': '+e.message+' while processing monster '+charName);
				sendDebug('AttackMaster buildMonsterAttkMacros: JavaScript '+e.name+': '+e.message+' while processing monster '+charName);
				sendError('AttackMaster JavaScript '+e.name+': '+e.message);
				errFlag = true;
			} finally {
				setTimeout(() => {
					resolve(errFlag);
				}, 5);
			}
		});
	}
	
	/*
	 * Build melee weapon attack macro
	 */
	 
	var buildMWattkMacros = function( args, senderId, charCS, tableInfo, mwIndex, backstab=false ) {
		
		return new Promise(resolve => {
			
			try {
				
				var tokenID		= args[1],
					attkType	= args[2],
					msg			= parseStr(args[5] || attrLookup( charCS, fields.Attk_specials ) || ''),
					errFlag		= false,
					curToken 	= getObj('graphic',tokenID),
					tokenName 	= curToken.get('name'),
					charName	= charCS.get('name'),
					raceName	= attrLookup( charCS, fields.Race ) || 'human',
					classes		= classObjects( charCS ),
					thac0		= getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0,fields.Thac0_base).val || 20,
					mwNumber    = mwIndex + (fields.MW_table[1]==0 ? 1 : 2),
					weaponName 	= tableInfo.MELEE.tableLookup( fields.MW_name, mwIndex ),
					weapTrueName= tableInfo.MELEE.tableLookup( fields.MW_miName, mwIndex ),
					dancing		= tableInfo.MELEE.tableLookup( fields.MW_dancing, mwIndex ),
					attkAdj 	= tableInfo.MELEE.tableLookup( fields.MW_adj, mwIndex ),
					strBonus 	= tableInfo.MELEE.tableLookup( fields.MW_strBonus, mwIndex ),
					mwType 		= tableInfo.MELEE.tableLookup( fields.MW_type, mwIndex ),
					mwSuperType = tableInfo.MELEE.tableLookup( fields.MW_superType, mwIndex ),
					critHit 	= tableInfo.MELEE.tableLookup( fields.MW_critHit, mwIndex ) || 20,  // Temp fix for Efriiti corruption
					critMiss 	= tableInfo.MELEE.tableLookup( fields.MW_critMiss, mwIndex ),
					slashWeap	= parseInt(tableInfo.MELEE.tableLookup( fields.MW_slash, mwIndex )),
					pierceWeap	= parseInt(tableInfo.MELEE.tableLookup( fields.MW_pierce, mwIndex )),
					bludgeonWeap= parseInt(tableInfo.MELEE.tableLookup( fields.MW_bludgeon, mwIndex )),
					weapMsg		= tableInfo.MELEE.tableLookup( fields.MW_message, mwIndex ),
					weapObj		= abilityLookup( fields.WeaponDB, weapTrueName, charCS ),
					weapCharged = (weapObj.obj ? !(['uncharged','cursed'].includes(weapObj.obj[1].charge.toLowerCase())) : false),
					weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
					dmgAdj 		= tableInfo.DMG.tableLookup( fields.Dmg_adj, mwIndex ),
					dmgSM 		= tableInfo.DMG.tableLookup( fields.Dmg_dmgSM, mwIndex ),
					dmgL 		= tableInfo.DMG.tableLookup( fields.Dmg_dmgL, mwIndex ),
					dmgStrBonus = (tableInfo.DMG.tableLookup( fields.Dmg_strBonus, mwIndex ) || 1),
					dmgMsg		= tableInfo.DMG.tableLookup( fields.Dmg_message, mwIndex ),
					strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
					strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
					rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
								+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
					fighterType = attrLookup( charCS, fields.Fighter_class ) || '',
					ranger		= fighterType.toUpperCase() == 'RANGER' || fighterType.toUpperCase() == 'MONSTER' || _.some(classes, c => parseFloat(c.classData.twoWeapPen == 0)),
					magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0, 
					magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
					primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
					twPen		= classes.map(c => parseFloat(c.classData.twoWeapPen)).reduce((prev,cur) => (Math.min(prev,cur))),
					twoWeapPenalty = (ranger || primeWeapon < 1) ? 0 : (-1*(((mwIndex*2)+(fields.MW_table[1]==0?1:3)) == primeWeapon ? Math.floor(twPen) : Math.floor((10*twPen)%10))),
					proficiency = dancing != 1 ? proficient( charCS, weaponName, mwType, mwSuperType ) : tableInfo.MELEE.tableLookup( fields.MW_dancingProf, mwIndex ),
					race		= raceMods( charCS, mwType, mwSuperType ),
					tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, fields.Thac0_base ).barName,
					tokenAC 	= (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]') : ''),
					tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ).barName,
					tokenHP 	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'} &{noerror}]]') : ''),
					tokenMaxHP	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'|max} &{noerror}]]') : ''),
					ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]',
					ACslash		= slashWeap ? '[[([[0+@{Target|Select Target|'+fields.SlashAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
					ACpierce	= pierceWeap ? '[[([[0+@{Target|Select Target|'+fields.PierceAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
					ACbludgeon	= bludgeonWeap ? '[[([[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
					noModsACtxt = 'No Mods',
					sACtxt		= slashWeap ? 'S' : '',
					pACtxt		= pierceWeap ? 'P' : '',
					bACtxt		= bludgeonWeap ? 'B' : '',
					slashACtxt	= slashWeap ? 'Slash' : '',
					pierceACtxt	= pierceWeap ? 'Pierce' : '',
					bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
					attkMacro, attkMacroDef, dmgMacroDef, qualifier;
					
				var parseMWattkMacro = function( args, charCS, attkType, attkMacro ) {
					
					var	toHitRoll = getToHitRoll( attkMacro ),
						dmgSMroll = dmgSM,
						dmgLroll  = dmgL;

					if (attkType.toUpperCase() == Attk.ROLL) {
						toHitRoll = ('?{Roll To-Hit Dice|'+toHitRoll+'}');
						dmgSMroll = '?{Roll Damage vs TSM|'+dmgSM+'}';
						dmgLroll  = '?{Roll Damage vs LH|'+dmgL+'}';
					}
					attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,senderId,false) )
										 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,senderId,true) )
										 .replace( /\^\^defaultTemplate\^\^/gi , fields.targetTemplate)
										 .replace( /\^\^cname\^\^/gi , charName )
										 .replace( /\^\^tname\^\^/gi , tokenName )
										 .replace( /\^\^cid\^\^/gi , charCS.id )
										 .replace( /\^\^tid\^\^/gi , tokenID )
										 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
										 .replace( /\^\^weapAttkAdj\^\^/gi , attkAdj )
										 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
										 .replace( /\^\^weapStrHit\^\^/gi , strBonus )
										 .replace( /\^\^profPenalty\^\^/gi , Math.min(proficiency,0) )
										 .replace( /\^\^specProf\^\^/gi , proficiency == 2 ? 1 : 0 )
										 .replace( /\^\^masterProf\^\^/gi , proficiency > 2 ? 1 : 0 )
										 .replace( /\^\^raceBonus\^\^/gi , race )
										 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
										 .replace( /\^\^twoWeapPenalty\^\^/gi , twoWeapPenalty )
										 .replace( /\^\^weapDmgAdj\^\^/gi , dmgAdj )
										 .replace( /\^\^magicDmgAdj\^\^/gi , magicDmgAdj )
										 .replace( /\^\^strDmgBonus\^\^/gi , strDmg )
										 .replace( /\^\^backstab\^\^/gi , backstab ? 1 : 0 )
										 .replace( /\^\^rogueLevel\^\^/gi , rogueLevel )
										 .replace( /\^\^weapon\^\^/gi , weaponName )
										 .replace( /\^\^thac0\^\^/gi , thac0 )
										 .replace( /\^\^weapCritHit\^\^/gi , critHit )
										 .replace( /\^\^weapCritMiss\^\^/gi , critMiss )
										 .replace( /\^\^slashWeap\^\^/gi , slashWeap )
										 .replace( /\^\^pierceWeap\^\^/gi , pierceWeap )
										 .replace( /\^\^bludgeonWeap\^\^/gi , bludgeonWeap )
										 .replace( /\^\^weapType\^\^/gi , weapTypeTxt )
										 .replace( /\^\^ACvsNoMods\^\^/gi , ACnoMods )
										 .replace( /\^\^ACvsSlash\^\^/gi , ACslash )
										 .replace( /\^\^ACvsPierce\^\^/gi , ACpierce )
										 .replace( /\^\^ACvsBludgeon\^\^/gi , ACbludgeon )
										 .replace( /\^\^ACvsNoModsTxt\^\^/gi , noModsACtxt )
										 .replace( /\^\^ACvsSlashTxt\^\^/gi , slashACtxt )
										 .replace( /\^\^ACvsPierceTxt\^\^/gi , pierceACtxt )
										 .replace( /\^\^ACvsBludgeonTxt\^\^/gi , bludgeonACtxt )
										 .replace( /\^\^ACvsSTxt\^\^/gi , sACtxt )
										 .replace( /\^\^ACvsPTxt\^\^/gi , pACtxt )
										 .replace( /\^\^ACvsBTxt\^\^/gi , bACtxt )
										 .replace( /\^\^ACfield\^\^/gi , tokenACname )
										 .replace( /\^\^targetACfield\^\^/gi , tokenAC )
										 .replace( /\^\^targetAC\^\^/gi , tokenAC )
										 .replace( /\^\^weapDmgSM\^\^/gi , dmgSMroll )
										 .replace( /\^\^weapStrDmg\^\^/gi , dmgStrBonus )
										 .replace( /\^\^weapDmgL\^\^/gi , dmgLroll )
										 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
										 .replace( /\^\^targetHP\^\^/gi , tokenHP )
										 .replace( /\^\^targetMaxHP\^\^/gi , tokenMaxHP )
										 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
										 .replace( /\^\^mwSMdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgSM-MW'+mwNumber))
										 .replace( /\^\^mwLHdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgL-MW'+mwNumber));

					return attkMacro;
				};
				
				var attkType = args[2],
					abilityType = attkType.toUpperCase(),
					abilityRoot = 'MW-' + (abilityType == Attk.TARGET ? 'Targeted-Attk' : 'ToHit');
					
				msg = msg.split('$$')[0];
								   
				attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+weapTrueName, charCS, silent );
				qualifier = '-'+weapTrueName;
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+mwType, charCS, silent );
					qualifier = '-'+mwType;
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+mwSuperType, charCS, silent );
					qualifier = '-'+mwSuperType;
				}
				if (!attkMacroDef.obj) {
					qualifier = '-' + _.find( classes, c => {
						attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+c.name, charCS, silent );
						return !_.isUndefined(attkMacroDef.obj);
					});
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+raceName, charCS, silent );
					qualifier = '-'+raceName;
				}
				if (!attkMacroDef.obj) {
					attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot, charCS );
					qualifier = '';
				}
				if (!(errFlag = !attkMacroDef.obj)) {
					dmgMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgSM'+qualifier) : ('MW-DmgSM'+qualifier)), charCS, silent );
					if (!dmgMacroDef.obj) dmgMacroDef = abilityLookup( fields.AttacksDB, (backstab ? 'MW-Backstab-DmgSM' : 'MW-DmgSM'), charCS );
				}
				if (!(errFlag = errFlag || !dmgMacroDef.obj)) {
					setAbility( charCS, 'Do-not-use-DmgSM-MW'+mwNumber, parseMWattkMacro(args, charCS, attkType, addDmgMsg( dmgMacroDef.obj[1].body, msg, dmgMsg )));
					dmgMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgL'+qualifier) : ('MW-DmgL'+qualifier)), charCS, silent );
					if (!dmgMacroDef.obj) dmgMacroDef = abilityLookup( fields.AttacksDB, (backstab ? 'MW-Backstab-DmgL' : 'MW-DmgL'), charCS );
				}
				if (!(errFlag = errFlag || !dmgMacroDef.obj)) {
					setAbility( charCS, 'Do-not-use-DmgL-MW'+mwNumber, parseMWattkMacro(args, charCS, attkType, addDmgMsg( dmgMacroDef.obj[1].body, msg, dmgMsg )));
					attkMacro = weapCharged ? ('!magic --mi-charges '+tokenID+'|-1|'+weapTrueName+'\n') : ''; 
					if (abilityType == Attk.TARGET) {
						setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, (attkMacro + parseMWattkMacro(args, charCS, attkType, addDmgMsg( attkMacroDef.obj[1].body, msg, dmgMsg, weapMsg ))));
					} else {
						setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, (attkMacro + parseMWattkMacro(args, charCS, attkType, addDmgMsg( attkMacroDef.obj[1].body, '', weapMsg ))));
					}
				}
			} catch (e) {
				log('AttackMaster buildMWattkMacros: JavaScript '+e.name+': '+e.message+' while building weapon '+weapTrueName);
				sendDebug('AttackMaster buildMWattkMacros: JavaScript '+e.name+': '+e.message+' while building weapon '+weapTrueName);
				sendError('AttackMaster JavaScript '+e.name+': '+e.message);
				errFlag = true;

			} finally {
				setTimeout(() => {
					resolve(errFlag);
				}, 5);
			}
		});
	}
	
	/*
	 * Build ranged weapon attack macro, one for each 
	 * of the 6 possible ranges: Near, PB, S, M, L, Far
	 */
	 
	var buildRWattkMacros = function( args, senderId, charCS, tableInfo ) {
		
		var tokenID 	= args[1],
			attkType 	= args[2],
			abilityType = attkType.toUpperCase(),
			abilityRoot = 'RW-' + (abilityType == Attk.TARGET ? 'Targeted-Attk' : 'ToHit'),
			rwIndex 	= parseInt(args[3]),
			ammoIndex 	= parseInt(args[4]),
			msg			= parseStr(args[5] || attrLookup( charCS, fields.Attk_specials ) || ''),
			errFlag		= false,
			curToken 	= getObj('graphic',tokenID),
			tokenName 	= curToken.get('name'),
			charName	= charCS.get('name'),
			raceName	= attrLookup( charCS, fields.Race ) || 'human',
			classes		= classObjects( charCS ),
			thac0		= getTokenValue(curToken,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0,fields.Thac0_base).val || 20,
			rwNumber    = rwIndex + (fields.RW_table[1]==0 ? 1 : 2),
			weaponName 	= tableInfo.RANGED.tableLookup( fields.RW_name, rwIndex ),
			weapTrueName= tableInfo.RANGED.tableLookup( fields.RW_miName, rwIndex ),
			dancing		= tableInfo.RANGED.tableLookup( fields.RW_dancing, rwIndex ),
			attkAdj 	= tableInfo.RANGED.tableLookup( fields.RW_adj, rwIndex ),
			weapStrBonus= tableInfo.RANGED.tableLookup( fields.RW_strBonus, rwIndex ),
			weapDexBonus= tableInfo.RANGED.tableLookup( fields.RW_dexBonus, rwIndex ),
			rwType 		= tableInfo.RANGED.tableLookup( fields.RW_type, rwIndex ),
			rwSuperType = tableInfo.RANGED.tableLookup( fields.RW_superType, rwIndex ),
			critHit 	= tableInfo.RANGED.tableLookup( fields.RW_critHit, rwIndex ),
			critMiss 	= tableInfo.RANGED.tableLookup( fields.RW_critMiss, rwIndex ),
			weapMsg		= tableInfo.RANGED.tableLookup( fields.RW_message, rwIndex ),
			slashWeap	= parseInt(tableInfo.RANGED.tableLookup( fields.RW_slash, rwIndex )),
			pierceWeap	= parseInt(tableInfo.RANGED.tableLookup( fields.RW_pierce, rwIndex )),
			bludgeonWeap= parseInt(tableInfo.RANGED.tableLookup( fields.RW_bludgeon, rwIndex )),
			weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
			ammoName    = tableInfo.AMMO.tableLookup( fields.Ammo_name, ammoIndex ),
			ammoMIname  = tableInfo.AMMO.tableLookup( fields.Ammo_miName, ammoIndex ),
			dmgAdj 		= tableInfo.AMMO.tableLookup( fields.Ammo_adj, ammoIndex ),
			dmgSM 		= tableInfo.AMMO.tableLookup( fields.Ammo_dmgSM, ammoIndex ),
			dmgL 		= tableInfo.AMMO.tableLookup( fields.Ammo_dmgL, ammoIndex ),
			ammoStrBonus= tableInfo.AMMO.tableLookup( fields.Ammo_strBonus, ammoIndex ),
			ammoQty		= tableInfo.AMMO.tableLookup( fields.Ammo_qty, ammoIndex ),
			ammoReuse	= tableInfo.AMMO.tableLookup( fields.Ammo_reuse, ammoIndex ),
			ammoMsg		= tableInfo.AMMO.tableLookup( fields.Ammo_message, ammoIndex ),
			strHit 		= parseInt(attrLookup( charCS, fields.Strength_hit ) || 0),
			strDmg 		= parseInt(attrLookup( charCS, fields.Strength_dmg ) || 0),
			dexMissile	= attrLookup( charCS, fields.Dex_missile ) || 0,
			rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
						+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
			fighterType = attrLookup( charCS, fields.Fighter_class ) || '',
			ranger		= fighterType.toUpperCase() == 'RANGER' || fighterType.toUpperCase() == 'MONSTER',
			magicHitAdj = attrLookup( charCS, fields.Magic_hitAdj ) || 0, 
			magicDmgAdj = attrLookup( charCS, fields.Magic_dmgAdj ) || 0,
			primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
			twoWeapPenalty = (ranger || primeWeapon < 1) ? 0 : (((rwIndex*2)+(fields.RW_table[1]==0?2:4)) == primeWeapon ? -2 : -4),
			proficiency = dancing != 1 ? proficient( charCS, weaponName, rwType, rwSuperType ) : tableInfo.RANGED.tableLookup( fields.RW_dancingProf, rwIndex ),
			race		= raceMods( charCS, rwType, rwSuperType ),
			tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, fields.Thac0_base ).barName,
			tokenAC 	= (tokenACname ? ('[[([[0+@{Target|Select Target|'+tokenACname+'}]]+([[0+@{Target|Select Target|'+fields.StdAC[0]+'|max} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]') : ''),
			tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ).barName,
			tokenHP 	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}]]') : ''),
			tokenMaxHP	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'|max} &{noerror}]]') : ''),
			ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]',
			ACslash		= slashWeap ? '[[([[0+@{Target|Select Target|'+fields.SlashAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
			ACpierce	= pierceWeap ? '[[([[0+@{Target|Select Target|'+fields.PierceAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
			ACbludgeon	= bludgeonWeap ? '[[([[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
			noModsACtxt = 'No Mods',
			slashACtxt	= slashWeap ? 'Slash' : '',
			pierceACtxt	= pierceWeap ? 'Pierce' : '',
			bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
			sACtxt		= slashWeap ? 'S' : '',
			pACtxt		= pierceWeap ? 'P' : '',
			bACtxt		= bludgeonWeap ? 'B' : '',
			missileACnoMods		= '[[([[0+@{Target|Select Target|'+fields.StdAC[0]+'|max} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]',
			missileACslash		= slashWeap ? '[[([[0+@{Target|Select Target|'+fields.SlashAC[0]+'|max} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
			missileACpierce		= pierceWeap ? '[[([[0+@{Target|Select Target|'+fields.PierceAC[0]+'|max} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
			missileACbludgeon	= bludgeonWeap ? '[[([[0+@{Target|Select Target|'+fields.BludgeonAC[0]+'|max} &{noerror}]]+([[0+@{Target|Select Target|'+tokenACname+'} &{noerror}]]-[[0+@{Target|Select Target|'+fields.StdAC[0]+'} &{noerror}]]))]]' : '',
			missileACnoModsTxt  = 'No Mods',
			missileACslashTxt	= slashWeap ? 'Slash' : '',
			missileACpierceTxt	= pierceWeap ? 'Pierce' : '',
			missileACbludgeonTxt= bludgeonWeap ? 'Bludgeon' : '',
			missileACsTxt		= slashWeap ? 'S' : '',
			missileACpTxt		= pierceWeap ? 'P' : '',
			missileACbTxt		= bludgeonWeap ? 'B' : '',
			attkMacro, attkMacroDef, qualifier;

		var parseRWattkMacro = function( args, charCS, attkType, range, attkMacro ) {

			var toHitRoll = getToHitRoll( attkMacro ),
				rangeMods = attkMacro.match(/}}\s*RangeMods\s*=\s*(\[[-\w\d\+\,\:]+?\])\s*{{/im),
				dmgSMroll = dmgSM,
				dmgLroll  = dmgL,
				rangeMod;
				
			if (attkType == Attk.ROLL) {
				toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
				dmgSMroll = '?{Roll Damage vs TSM|'+dmgSM+'}';
				dmgLroll  = '?{Roll Damage vs LH|'+dmgL+'}';
			}
			rangeMods = parseData( ((rangeMods && !_.isNull(rangeMods)) ? rangeMods[1] : ''), reRangeMods );
			rangeMod = attrLookup( charCS, [fields.RWrange_mod[0]+range, fields.RWrange_mod[1]] ) || rangeMods[range];
				
			attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,senderId,false) )
								 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,senderId,true) )
								 .replace( /\^\^defaultTemplate\^\^/gi , fields.targetTemplate)
								 .replace( /\^\^cname\^\^/gi , charName )
								 .replace( /\^\^tname\^\^/gi , tokenName )
								 .replace( /\^\^cid\^\^/gi , charCS.id )
								 .replace( /\^\^tid\^\^/gi , tokenID )
								 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
								 .replace( /\^\^weapAttkAdj\^\^/gi , attkAdj )
								 .replace( /\^\^dexMissile\^\^/gi , dexMissile )
								 .replace( /\^\^weapDexBonus\^\^/gi , weapDexBonus )
								 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
								 .replace( /\^\^weapStrHit\^\^/gi , weapStrBonus )
								 .replace( /\^\^profPenalty\^\^/gi , Math.min(proficiency,0) )
								 .replace( /\^\^specProf\^\^/gi , proficiency == 2 ? 1 : 0 )
								 .replace( /\^\^masterProfPB\^\^/gi , (range == 'PB' && state.attackMaster.weapRules.masterRange && proficiency > 2) ? 1 : 0 )
								 .replace( /\^\^raceBonus\^\^/gi , race )
								 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
								 .replace( /\^\^twoWeapPenalty\^\^/gi , twoWeapPenalty )
								 .replace( /\^\^rangeMod\^\^/gi , rangeMod )
								 .replace( /\^\^ammoDmgAdj\^\^/gi , dmgAdj )
								 .replace( /\^\^magicDmgAdj\^\^/gi , magicDmgAdj )
								 .replace( /\^\^strDmgBonus\^\^/gi , strDmg )
								 .replace( /\^\^weapon\^\^/gi , weaponName )
								 .replace( /\^\^thac0\^\^/gi , thac0 )
								 .replace( /\^\^weapCritHit\^\^/gi , critHit )
								 .replace( /\^\^weapCritMiss\^\^/gi , critMiss )
								 .replace( /\^\^slashWeap\^\^/gi , slashWeap )
								 .replace( /\^\^pierceWeap\^\^/gi , pierceWeap )
								 .replace( /\^\^bludgeonWeap\^\^/gi , bludgeonWeap )
								 .replace( /\^\^weapType\^\^/gi , weapTypeTxt )
								 .replace( /\^\^ACvsNoMods\^\^/gi , ACnoMods )
								 .replace( /\^\^ACvsSlash\^\^/gi , ACslash )
								 .replace( /\^\^ACvsPierce\^\^/gi , ACpierce )
								 .replace( /\^\^ACvsBludgeon\^\^/gi , ACbludgeon )
								 .replace( /\^\^ACvsNoModsTxt\^\^/gi , noModsACtxt )
								 .replace( /\^\^ACvsSTxt\^\^/gi , sACtxt )
								 .replace( /\^\^ACvsPTxt\^\^/gi , pACtxt )
								 .replace( /\^\^ACvsBTxt\^\^/gi , bACtxt )
								 .replace( /\^\^ACvsSlashTxt\^\^/gi , slashACtxt )
								 .replace( /\^\^ACvsPierceTxt\^\^/gi , pierceACtxt )
								 .replace( /\^\^ACvsBludgeonTxt\^\^/gi , bludgeonACtxt )
								 .replace( /\^\^ACvsNoModsMissile\^\^/gi , missileACnoMods )
								 .replace( /\^\^ACvsSlashMissile\^\^/gi , missileACslash )
								 .replace( /\^\^ACvsPierceMissile\^\^/gi , missileACpierce )
								 .replace( /\^\^ACvsBludgeonMissile\^\^/gi , missileACbludgeon )
								 .replace( /\^\^ACvsNoModsMissileTxt\^\^/gi , missileACnoModsTxt )
								 .replace( /\^\^ACvsSlashMissileTxt\^\^/gi , missileACslashTxt )
								 .replace( /\^\^ACvsPierceMissileTxt\^\^/gi , missileACpierceTxt )
								 .replace( /\^\^ACvsBludgeonMissileTxt\^\^/gi , missileACbludgeonTxt )
								 .replace( /\^\^ACvsSmissileTxt\^\^/gi , missileACsTxt )
								 .replace( /\^\^ACvsPmissileTxt\^\^/gi , missileACpTxt )
								 .replace( /\^\^ACvsBmissileTxt\^\^/gi , missileACbTxt )
								 .replace( /\^\^ACfield\^\^/gi , tokenACname )
								 .replace( /\^\^targetACfield\^\^/gi , tokenAC )
								 .replace( /\^\^targetAC\^\^/gi , tokenAC )
								 .replace( /\^\^targetACmissile\^\^/gi , missileACnoMods )
								 .replace( /\^\^range\^\^/gi , range )
								 .replace( /\^\^rangeN\^\^/gi , (range == 'N' ? 1 : 0) )
								 .replace( /\^\^rangePB\^\^/gi , (range == 'PB' ? 1 : 0) )
								 .replace( /\^\^rangeS\^\^/gi , (range == 'S' ? 1 : 0) )
								 .replace( /\^\^rangeM\^\^/gi , (range == 'M' ? 1 : 0) )
								 .replace( /\^\^rangeL\^\^/gi , (range == 'L' ? 1 : 0) )
								 .replace( /\^\^rangeF\^\^/gi , (range == 'F' ? 1 : 0) )
								 .replace( /\^\^rangeSMLF\^\^/gi , ((range != 'N' && range != 'PB') ? 1 : 0) )
								 .replace( /\^\^ammoName\^\^/gi , ammoName )
								 .replace( /\^\^ammoDmgSM\^\^/gi , dmgSMroll )
								 .replace( /\^\^ammoStrDmg\^\^/gi , ammoStrBonus )
								 .replace( /\^\^ammoDmgL\^\^/gi , dmgLroll )
								 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
								 .replace( /\^\^targetHP\^\^/gi , tokenHP )
								 .replace( /\^\^targetMaxHP\^\^/gi , tokenMaxHP )
								 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
								 .replace( /\^\^ammoLeft\^\^/gi , ammoReuse != 1 ? ammoQty-1 : ammoQty )
								 .replace( /\^\^rwSMdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgSM-RW'+rwNumber+'-'+range))
								 .replace( /\^\^rwLHdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgL-RW'+rwNumber+'-'+range));
								 
			return(attkMacro);	
		};
		
		var buildAbility = function( abilityType, defMod, dist, toHitMacro, qualifier ) {
			
			var macroDef, attkMacro,
				errFlag = false;

			if (dist != 'PB' || proficiency > 0) {
				
				macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM'+qualifier+'-'+ammoName, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM'+qualifier, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM', charCS );
				if (!macroDef.obj) {
					errFlag = true;
					return;
				}
				setAbility( charCS, 'Do-not-use-DmgSM-RW'+rwNumber+'-'+dist, parseRWattkMacro(args, charCS, abilityType, dist, addDmgMsg( macroDef.obj[1].body, msg, ammoMsg )));

				macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL'+qualifier+'-'+ammoName, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL'+qualifier, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL', charCS );
				if (!macroDef.obj) {
					errFlag = true;
					return;
				}
				setAbility( charCS, 'Do-not-use-DmgL-RW'+rwNumber+'-'+dist, parseRWattkMacro(args, charCS, abilityType, dist, addDmgMsg( macroDef.obj[1].body, msg, ammoMsg )));
				
				attkMacro = ((ammoReuse <= 0) ? ('!attk --setammo '+tokenID+'|'+ammoName+'|-1|'+(ammoReuse < 0 ? '=' : '+0')+'|SILENT') : '') + '\n';
				if (abilityType == Attk.TARGET) {
					attkMacro += parseRWattkMacro( args, charCS, abilityType, dist, addDmgMsg( toHitMacro.body, msg, ammoMsg, weapMsg ));
				} else {
					attkMacro += parseRWattkMacro( args, charCS, abilityType, dist, addDmgMsg( toHitMacro.body, '', weapMsg ));
				}
				setAbility( charCS, 'Do-not-use-Attk-RW'+rwNumber+'-'+dist, attkMacro );
			}
			return errFlag;
		};
		
		attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+weapTrueName, charCS, silent );
		qualifier = '-'+weapTrueName;
		if (!attkMacroDef.obj) {
			attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+rwType, charCS, silent );
			qualifier = '-'+rwType;
		}
		if (!attkMacroDef.obj) {
			attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+rwSuperType, charCS, silent );
			qualifier = '-'+rwSuperType;
		}
		if (!attkMacroDef.obj) {
			qualifier = '-'+_.find( classes, c => {
				attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+c.name, charCS, silent );
				return !_.isUndefined(attkMacroDef.obj);
			});
		}
		if (!attkMacroDef.obj) {
			attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+raceName, charCS, silent );
			qualifier = '-'+raceName;
		}
		if (!attkMacroDef.obj) {
			attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot, charCS );
			qualifier = '';
		}
		_.each(rangedWeapMods, (defMod, dist) => errFlag = errFlag || buildAbility( abilityType, defMod , dist, attkMacroDef.obj[1], qualifier ));

	}

	/*
	 * Dynamically build the ability macro for a saving throw
	 */
	 
	var buildSaveRoll = function( tokenID, charCS, sitMod, saveType, saveObj, isGM ) {
		
		sitMod = parseInt(sitMod);
		var curToken = getObj('graphic',tokenID),
			name = curToken.get('name'),
			save = parseInt(attrLookup( charCS, saveObj.save ) || 0),
			saveMod = parseInt(attrLookup( charCS, saveObj.mod ) || 0),
			saveAdj = parseInt(attrLookup( charCS, fields.Magic_saveAdj ) || 0),
			calcResult = save-saveMod-sitMod-saveAdj,
			content = (isGM ? '/w gm ' : '')
					+ '&{template:'+fields.defaultTemplate+'}{{name='+name+' Save vs '+saveType+'}}'
					+ '{{Saving Throw=Rolling [['+fields.SaveRoll+'cf<'+(calcResult-1)+'cs>'+calcResult+']] vs. [[0+'+calcResult+']] target}}'
					+ '{{Result=Saving Throw>='+calcResult+'}}'
					+ '{{desc=**'+name+'\'s target**[[0+'+save+']] base save vs. '+saveType+' with [[0+'+saveMod+']] improvement from race, class & Magic Items, [[0+'+saveAdj+']] improvement from current magic effects, and [[0+'+sitMod+']] adjustment for the situation}}';
		
		setAbility(charCS,'Do-not-use-'+saveType+'-save',content);
		return;
	}
					  
// ---------------------------------------------------- Make Menus ---------------------------------------------------------

	/**
	 * Create range buttons for a ranged weapon attack to add into a menu.
	**/

	var makeRangeButtons = function( args, senderId, charCS, tableInfo, diceRoll, targetStr ) {

		return new Promise(resolve => {
			
			try {
			
				var tokenID = args[1],
					attkType = args[2],
					weaponIndex = parseInt(args[3]),
					ammoIndex = parseInt(args[4]),
					charName = charCS.get('name'),
					specRange = 30,
					specRangeMod = 0,
					farRange = 0,
					content = '',
					ranges = [],
					rangeMod = [],
					proficiency,
					specialist = true,
					errFlag = false,
					wt, wst, wname, dancing,
					weapRangeMod, weapRangeOverride,
					disabled = isNaN(weaponIndex) || isNaN(ammoIndex);

				if (!disabled) {
					ranges = tableInfo.AMMO.tableLookup( fields.Ammo_range, ammoIndex );
					wname = tableInfo.RANGED.tableLookup( fields.RW_name, weaponIndex );
					dancing = tableInfo.RANGED.tableLookup( fields.RW_dancing, weaponIndex );
					rangeMod = tableInfo.RANGED.tableLookup( fields.RW_range, weaponIndex );
					wt = tableInfo.RANGED.tableLookup( fields.RW_type, weaponIndex );
					wst = tableInfo.RANGED.tableLookup( fields.RW_superType, weaponIndex );
					proficiency = dancing != 1 ? proficient( charCS, wname, wt, wst ) : tableInfo.RANGED.tableLookup( fields.RW_dancingProf, weaponIndex );
					specialist = proficiency > 0;
					
					errFlag = buildRWattkMacros( args, senderId, charCS, tableInfo );
					
					if (weapRangeOverride = (rangeMod[0] == '=')) rangeMod.slice(1);
					weapRangeOverride = weapRangeOverride || !ranges || !ranges.length;
					weapRangeMod = (rangeMod[0] == '-' || rangeMod[0] == '+');
			
					ranges = ranges.split('/');
					rangeMod = rangeMod.split('/');
					// Remove any non-numeric entries from the ranges
					ranges = _.reject(ranges, function(dist){return isNaN(parseInt(dist,10));}).map( r => parseInt(r,10));
					rangeMod = _.reject(rangeMod, function(dist){return isNaN(parseInt(dist,10));}).map( r => parseInt(r,10));
					if (weapRangeOverride) {
						ranges = rangeMod;
					} else if (weapRangeMod) {
						for (let i=0; rangeMod.length && i<ranges.length; i++) {
							ranges[i] += rangeMod[Math.min(i,(rangeMod.length-1))];
						}
					}

					// Test for if ranges need *10 (assume 1st range (PB or short) is never >= 100 yds or < 10)
					if (ranges[0] < 10) ranges = ranges.map(x => x * 10);
						
					// Make the range always start with Short (assume 4 or more ranges start with Point Blank)
					if (ranges.length >= 4) {
						specRange = ranges.shift();
					}
				}
				
				weaponIndex += fields.RW_table[1]==0 ? 1 : 2;
				
				content += disabled ? ('<span style='+design.grey_button+'>') : '[';
				farRange = 6;
				content += ranges.length ? 'Near: 0 to 5' : 'Near';
				content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-N)');

				if (specialist) {
					content += disabled ? ('<span style='+design.grey_button+'>') : '[';
					farRange = specRange;
					content += ranges.length ? 'PB: 6 to '+farRange : 'Point Blank' ;
					content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-PB)');
				}
				content += disabled ? ('<span style='+design.grey_button+'>') : '[';
				farRange = ranges.length ? (ranges[0]) : farRange;
				content += ranges.length ? ('S: '+(specialist ? (specRange+1) : '6')+' to '+farRange) : 'Short';
				content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-S)');

				if (ranges.length != 1) {
					content += disabled ? ('<span style='+design.grey_button+'>') : '[';
					farRange = ranges.length ? (ranges[1]) : farRange;
					content += ranges.length ? ('M: '+((ranges[0])+1)+' to '+farRange) : 'Medium';
					content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-M)');
				}
				if (!ranges.length || ranges.length > 2) {
					content += disabled ? ('<span style='+design.grey_button+'>') : '[';
					farRange = ranges.length ? (ranges[2]) : farRange;
					content += ranges.length ? ('L: '+((ranges[1])+1)+' to '+farRange) : 'Long';
					content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-L)');
				}
				content += disabled ? ('<span style='+design.grey_button+'>') : '[';
				content += ranges.length ? ('Far: beyond '+(farRange)) : 'Far';
				content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-F)');
				
			} catch (e) {
				log('AttackMaster makeRangeButtons: JavaScript '+e.name+': '+e.message+' while processing weapon '+wname);
				sendDebug('AttackMaster makeRangeButtons: JavaScript '+e.name+': '+e.message+' while processing weapon '+wname);
				sendError('AttackMaster JavaScript '+e.name+': '+e.message);
				content = '';

			} finally {
				setTimeout(() => {
					resolve(content);
				}, 5);
			}
		});
	}


    /*
    * Create the standard weapon Attack menu.  If the optional monster attack parameters are passed,
	* also display the monster attacks.
    */

	async function makeAttackMenu( args, senderId, submitted ) {
		
		var backstab = (args[0] == BT.BACKSTAB),
			tokenID = args[1],
			attkType = args[2],
			weaponButton = args[3] || null,
			ammoButton = args[4] || null,
			msg = args[5] || '',
			monsterAttk1 = args[6],
			monsterAttk2 = args[7],
			monsterAttk3 = args[8],
			curToken,
			charID,
			charCS,
			tableInfo = {},
			Items,
			errFlag = false,
			i, w, title,
			Weapons,
			weapButton,
			dancingMeleeWeaps = '',
			dancingRangedWeaps = '',
			meleeWeaps = '',
			rangedWeaps = '',
			rangeButtons = '',
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
	   
		let playerConfig = getSetPlayerConfig( senderId );

		if (attkType == Attk.USER) {
			args[2] = attkType = (playerConfig && playerConfig.attkType) ? playerConfig.attkType : Attk.TO_HIT;
		}

		var tokenName = curToken.get('name'),
			charName = charCS.get('name'),
			targetStr = (attkType === Attk.TARGET) ? '&#64;{target|Select Opponent|token_id}' : '',
			diceRoll = (attkType === Attk.ROLL) ? ('&#63;{Roll To Hit|'+fields.ToHitRoll+'}') : fields.ToHitRoll,
			content = '&{template:'+fields.defaultTemplate+'}{{name=How is ' + tokenName + ' attacking?}}';

		if ( monsterAttk1 || monsterAttk2 || monsterAttk3 ) {

			if (await buildMonsterAttkMacros( args, senderId, charCS, monsterAttk1, monsterAttk2, monsterAttk3 )) return;
			content += 	'{{Section1=**Monster Attacks**\n';
			if (monsterAttk1) {
				content += '[' + monsterAttk1 + '](~'+charName+'|Do-not-use-Monster-Attk-1)';
			}
			if (monsterAttk2) {
				content += '[' + monsterAttk2 + '](~'+charName+'|Do-not-use-Monster-Attk-2)';
			}
			if (monsterAttk3) {
				content += '[' + monsterAttk3 + '](~'+charName+'|Do-not-use-Monster-Attk-3)';
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
		
		weaponIndex = fields.MW_table[1]-1;
		weaponOffset = fields.MW_table[1]==0 ? 1 : 2;
		title = false;
		Weapons = getTableField( charCS, {}, fields.MW_table, fields.MW_name );
		Weapons = getTableField( charCS, Weapons, fields.MW_table, fields.MW_miName );
		Items = getTable( charCS, fieldGroups.MI );

		while (!_.isUndefined(weaponName = Weapons.tableLookup( fields.MW_name, ++weaponIndex, false ))) {
			
			if (weaponName != '-') {
				let itemIndex = Items.tableFind( fields.Items_name, Weapons.tableLookup( fields.MW_miName, weaponIndex ));
				if (!_.isUndefined(itemIndex) && Items.tableLookup( fields.Items_qty, itemIndex ) <= 0) {
					meleeWeaps += '<span style=' + design.grey_button + '>' + weaponName + '</span>';
				} else {
					if (!title) {
						tableInfo.MELEE = getTable( charCS, fieldGroups.MELEE ),
						tableInfo.DMG = getTable( charCS, fieldGroups.DMG ),
						title = true;
					}
					if (errFlag = await buildMWattkMacros( args, senderId, charCS, tableInfo, weaponIndex, backstab )) return;
					if (tableInfo.MELEE.tableLookup( fields.MW_dancing, weaponIndex ) == '1') {
						dancingMeleeWeaps += '['+weaponName+'](~'+charName+'|Do-not-use-Attk-MW'+(weaponIndex+weaponOffset)+') ';
					} else {
						meleeWeaps += '['+weaponName+'](~'+charName+'|Do-not-use-Attk-MW'+(weaponIndex+weaponOffset)+') ';
					}
				}
			}
		};
		
		if (!backstab) {

			// build the character Ranged Weapons list

			weaponIndex = fields.RW_table[1]-1;
			title = false;
			Weapons = getTableField( charCS, {}, fields.RW_table, fields.RW_name );
			while (!_.isUndefined(weaponName = Weapons.tableLookup( fields.RW_name, ++weaponIndex, false ))) {
				if (weaponName != '-') {
					if (!title) {
						tableInfo.RANGED = getTable( charCS, fieldGroups.RANGED ),
						tableInfo.AMMO = getTable( charCS, fieldGroups.AMMO ),
						title = true;
					}
					weapButton = '{{'+weaponName+'=';
					weaponType = tableInfo.RANGED.tableLookup( fields.RW_type, weaponIndex ).toLowerCase().replace(reIgnore,'');
					weaponSuperType = tableInfo.RANGED.tableLookup( fields.RW_superType, weaponIndex ).toLowerCase().replace(reIgnore,'');
					ammoIndex = fields.Ammo_table[1]-1;
					while (!_.isUndefined(ammoName = tableInfo.AMMO.tableLookup( fields.Ammo_name, ++ammoIndex, false ))) {
						ammoType = tableInfo.AMMO.tableLookup( fields.Ammo_type, ammoIndex ).toLowerCase().replace(reIgnore,'');
						if (ammoName != '-' && (ammoType == weaponType || ammoType == weaponSuperType) || ammoType == weaponName.toLowerCase().replace(reIgnore,'')) {
							ammoQty = tableInfo.AMMO.tableLookup( fields.Ammo_qty, ammoIndex );
							weapButton += (weaponIndex == weaponButton && ammoIndex == ammoButton) ? ('<span style=' + design.selected_button + '>')
											: (ammoQty <= 0 ? ('<span style=' + design.grey_button + '>') : '[');
							weapButton += '**'+ammoQty+'** '+ammoName;
							weapButton += (((weaponIndex == weaponButton && ammoIndex == ammoButton) || ammoQty <= 0) ? '</span>' 
											: '](!attk --button ' + BT.RANGED + '|' + tokenID + '|' + attkType + '|' + weaponIndex + '|' + ammoIndex + '|' + msg + ')');
						}
					}
					weapButton += '}}';
					if (tableInfo.RANGED.tableLookup( fields.RW_dancing, weaponIndex ) == '1') {
						dancingRangedWeaps += weapButton;
					} else {
						rangedWeaps += weapButton;
					}
				}
			}

			// add the range selection buttons (disabled until ranged weapon selected)

			if (title) {
				rangeButtons = await makeRangeButtons( args, senderId, charCS, tableInfo, diceRoll, targetStr );
				if (!rangeButtons || !rangeButtons.length) return;
				rangeButtons  = '{{desc=**Range selection**\n' + rangeButtons + '}}';
			}
		}
		
		if (meleeWeaps) {
			content += '{{Section2=**Melee Weapons**\n' + meleeWeaps + '}}';
		}
		if (rangedWeaps) {
			content += '{{Section3=**Ranged Weapons**}}' + rangedWeaps;
		}
		if (dancingMeleeWeaps || dancingRangedWeaps) {
			content += '{{Section4=**Dancing Weapons**'
					+  (dancingMeleeWeaps ? ('\n'+dancingMeleeWeaps) : '')
					+  '}}'	+ dancingRangedWeaps;
		}
		if (rangeButtons) {
			content += rangeButtons;
		}
		
		let argString = args.join('|');
		let target = !state.attackMaster.weapRules.dmTarget || playerIsGM(senderId);
		let width = target ? '33%' : '50%';
		content += '{{desc1=<div style="text-align: center"><table width="100%"><tr><td colspan="3" width="100%">**Change Dice Action**</td></tr><tr>'
				+  '<td width="'+width+'">'+((attkType == Attk.TO_HIT) ? ('<span style=' + design.selected_button + '>') : '[') + 'PC rolls' + ((attkType == Attk.TO_HIT) ? '</span>' : '](!attk --set-attk-type '+senderId+'|'+Attk.TO_HIT+'|'+argString+')</td>')
				+  '<td width="'+width+'">'+((attkType == Attk.ROLL) ? ('<span style=' + design.selected_button + '>') : '[') + 'You roll' + ((attkType == Attk.ROLL) ? '</span>' : '](!attk --set-attk-type '+senderId+'|'+Attk.ROLL+'|'+argString+')</td>')
				+  (target ? ('<td width="'+width+'">'+((attkType == Attk.TARGET) ? ('<span style=' + design.selected_button + '>') : '[') + 'Targeted' + ((attkType == Attk.TARGET) ? '</span>' : '](!attk --set-attk-type '+senderId+'|'+Attk.TARGET+'|'+argString+')</td>')) : '')
				+  '</tr></table></div>}}';

		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	};
	
	/*
	 * Make a message about changes in the amount of ammo
	 * that the character has.
	 */
	 
	var makeAmmoChangeMsg = function( senderId, tokenID, ammo, oldQty, newQty, oldMax, newMax ) {
		
		var curToken = getObj('graphic',tokenID),
			tokenName = curToken.get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Ammo}}'
					+ '{{desc='+tokenName+' did have [['+oldQty+']] ***'+ammo+'***, and now has [['+newQty+']]}}'
					+ '{{desc1=A possible total [['+newMax+']] ***'+ammo+'*** are now available}}';

		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	};
	
	/*
	 * Make a menu to recover or add (or otherwise change)
	 * ammunition, both in the ammo table and in the 
	 * magic item bag (which is the default)
	 */
	 
	var makeAmmoMenu = function( args, senderId ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID),
			tokenName = getObj('graphic',tokenID).get('name'),
			reAmmo = /}}\s*?AmmoData\s*?=/im,
			reSetQty = /}}\s*?AmmoData.*?[\[,\s]qty:\s*?(\d+?)[,\]].*?{{/im,
			reReuse = /}}\s*?AmmoData.*?[\[,\s]ru:\s*?([-\+\d]+?)[,\]].*?{{/im,
			qty, maxQty, title=false,
			ammoName, breakable = false,
			itemIndex = fields.Items_table[1]-1,
			itemTable = fields.Items_table,
			itemName = fields.Items_name,
			itemQty = fields.Items_qty,
			itemMax = fields.Items_trueQty,
			checkAmmo = false,
			reuse = 0,
			Items,
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Ammunition}}'
					+ '{{desc=The current quantity is displayed with the maximum you used to have.'
					+ 'To change the amount of any ammo listed, click the ammo name and enter the *change* (plus or minus).'
					+ 'The maximum will be set to the final current quantity, reflecting your new total. '
					+ 'Unselectable grey buttons represent unrecoverable or self-returning ammo.}}'
					+ '{{desc1=';
		do {
			Items = getTableField( charCS, {}, itemTable, itemName );
			Items = getTableField( charCS, Items, itemTable, itemQty );
			Items = getTableField( charCS, Items, itemTable, itemMax );
			while (!_.isUndefined(ammoName = Items.tableLookup(itemName,++itemIndex,false))) {
				let ammo = abilityLookup( fields.MagicItemDB, ammoName, charCS ),
					ammoData, ammoMatch;
				if (checkAmmo || !_.isUndefined(ammo.obj)) {
					if (ammo.obj && ammo.obj[1]) ammoData = ammo.obj[1].body;
					if (checkAmmo || (ammoData && ammoData.length && reAmmo.test(ammoData))) {
						if (!title) {
							content += '<table><tr><td>Now</td><td>Max</td><td>Ammo Name</td></tr>';
							title = true;
						}
						if (ammoData && ammoData.length) {
							reuse = parseInt((ammoData.match(reReuse) || [0,0])[1]);
							breakable = (reuse < 0) || (ammo.ct && ammo.ct[0] && (ammo.ct[0].get('max') || '').toLowerCase() == 'charged');
						}
						qty = Items.tableLookup(itemQty,itemIndex) || 0;
						maxQty = Items.tableLookup(itemMax,itemIndex) || qty;
						content += '<tr><td>[['+qty+']]</td><td>[['+maxQty+']]</td>'
								+  '<td>'+(breakable ? '<span style=' + design.grey_button + '>' : '[')
								+  ammoName
								+  (breakable ? '</span>' : '](!attk --button '+BT.AMMO+'|'+tokenID+'|'+ammoName.replace(/[\(\)]/g,'')+'|?{How many do you recover?|0}|=)') + '</td></tr>';
					}
				}
			}
			if (!title) {
				itemIndex = fields.Ammo_table[1]-1;
				itemTable = fields.Ammo_table;
				itemName = fields.Ammo_name;
				itemQty = fields.Ammo_qty;
				itemMax = fields.Ammo_maxQty;
				checkAmmo = !checkAmmo;
			}
		} while (!title && checkAmmo);
		if (!title) {
			content += 'You do not appear to have any ammo in your bag!}}';
		} else {
			content += '</table>}}';
		}
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	};
	
	/*
	 * Make a menu to specify the "handedness" of a character or 
	 * monster.  The default is 2 hands, Right Handed, but can 
	 * be any number of hands (more makes the system slower) and
	 * left, right, ambidextrous or neither handed.  This is a 
	 * GM-only function.
	 */
 
	var makeHandednessMenu = function( args ) {
		
		var tokenID = args[1],
			charCS = getCharacter(tokenID),
			handedness = attrLookup( charCS, fields.Equip_handedness ) || 'Right Handed',
			hands = args[2] || (parseInt(handedness) || 2),
			prefHand = args[3] || (handedness.match(/Left Handed|Right Handed|Ambidextrous|Neither Handed/i) || 'Right Handed'),
			tokenName = getObj('graphic',tokenID).get('name'),
			handedness = (hands == 2 ? '' : (hands + ' ')) + prefHand,
		
			content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s Handedness}}'
					+ '{{desc=You can change the number of hands to any number, which affects the number of weapons that can be wielded.  Handedness can also be set, but currently has little effect}}'
					+ '{{desc1=**'+tokenName+' currently is '+handedness+'**\n'
					+ '[Number of Hands](!attk --button '+BT.NOHANDS+'|'+tokenID+'|?{Number of Hands}|'+prefHand+')'
					+ '[Preferred Hand](!attk --button '+BT.NOHANDS+'|'+tokenID+'|'+hands+'|?{Preferred hand|Right Handed|Left Handed|Ambidextrous|Neither Handed|Every Handed})}}'
					+ '{{desc2=Return to [Change Weapons](!attk --weapon '+tokenID+') menu}}';
		
		checkInHandRows( charCS, getTable( charCS, fieldGroups.INHAND ), hands );
		sendFeedback( content,flags.feedbackName,flags.feedbackImg,tokenID,charCS );
		setAttr( charCS, fields.Equip_handedness, handedness );
		return;
	}
	
	/*
	 * Make the "Change Weapon" menu, that populates the 
	 * weapon tables from items in the character's magic item bag 
	 * that are specified as being some type of weapon.
	 */
	 
	var makeChangeWeaponMenu = function( args, senderId, msg='' ) {
		
		var tokenID = args[1],
			left = '',
			right = '',
			both = '',
			hands,
			handNo = 3,
			auto = false,
			isGM = playerIsGM(senderId),
			i = fields.InHand_table[1],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			noHands = parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2,
			lentHands = parseInt(attrLookup( charCS, fields.Equip_lentHands )) || 0,
			lRing = attrLookup( charCS, fields.Equip_leftRing ) || '-',
			rRing = attrLookup( charCS, fields.Equip_rightRing ) || '-',
			ringList = weaponQuery(charCS,1,'ring'),
			InHandTable = getTable( charCS, fieldGroups.INHAND ),
			weapList1H = weaponQuery(charCS,1,'weap'),
			handsQuestion = noHands, // ((noHands <= 2) ? 2 : '&#63;{Lend how many hands - (min 2&#41;?|2}'),
			inHand, inHandHandedness, content, extraHands;
			
		noHands = Math.max( 2, noHands+lentHands );
		InHandTable = checkInHandRows( charCS, InHandTable, noHands );
		left = InHandTable.tableLookup( fields.InHand_name, i++ );
		right = InHandTable.tableLookup( fields.InHand_name, i++ );
		both = InHandTable.tableLookup( fields.InHand_name, i );
		extraHands = InHandTable.tableLookup( fields.InHand_handedness, i++ );
		
		content = '&{template:'+fields.defaultTemplate+'}{{name=Change '+tokenName+'\'s weapon}}'
				+ (msg && msg.length ? '{{Section1=**'+msg+'**}}' : '')
				+ '{{Section2=Select Left or Right Hand to hold a one-handed weapon or shield.'
				+ ' Select Both Hands to hold a two handed weapon and set AC to Shieldless}}'
				+ '{{section3=Weapons\n'
				+ '<table style="text-align:center"><thead><tr><th scope="col" style="text-align:center; max-width:50%">Left</th><th scope="col" style="text-align:center; max-width:50%">Right</th></tr></thead>'
				+ '<tbody style="text-align:center"><tr>'
				+ '<td>[' + (left != '-' ? left : 'Left Hand') + '](!attk --button '+BT.LEFT+'|'+tokenID+'|'+weapList1H+'|0)</td>'
				+ '<td>[' + (right != '-' ? right : 'Right Hand') + '](!attk --button '+BT.RIGHT+'|'+tokenID+'|'+weapList1H+'|1)</td></tr>'
				+ '<tr><td colspan="2">[' + (both != '-' ? '2H\: '+both : 'Both Hands') + '](!attk --button '+BT.BOTH+'|'+tokenID+'|'+weaponQuery(charCS,noHands,'weap',2)+'|2)</td></tr></tbody></table>}}'
				+ '{{section4=Rings\n'
				+ '<table style="text-align:center"><thead><tr><th scope="col" style="text-align:center; max-width:50%">Left</th><th scope="col" style="text-align:center; max-width:50%">Right</th></tr></thead>'
				+ '<tbody style="text-align:center"><tr>'
				+ '<td>[' + (lRing != '-' ? lRing : 'Left Ring') + '](!attk --button '+BT.LEFTRING+'|'+tokenID+'|'+ringList+'|0)</td>'
				+ '<td>[' + (rRing != '-' ? rRing : 'Right Ring') + '](!attk --button '+BT.RIGHTRING+'|'+tokenID+'|'+ringList+'|1)</td></tr></tbody></table>}}';
					
		extraHands = noHands -= Math.max(2,extraHands);
		if (noHands > 0) {
			content += '{{section5=Extra Hands\n';
			while (noHands > 0) {
				inHand = InHandTable.tableLookup( fields.InHand_name, i );
				noHands -= inHandHandedness = parseInt(inHand != '-' ? InHandTable.tableLookup( fields.InHand_handedness, i ) : 1) || 1;
				hands = (inHandHandedness == 1) ? '' : (inHandHandedness == 2 ? ('+H'+(handNo+1)) : ('-H'+(handNo+inHandHandedness-1)));
				content += '['+(inHand != '-' ? ('H'+handNo+hands+'\: '+inHand) : ('Hand '+handNo))+ '](!attk --button '+BT.HAND+'|'+tokenID+'|'+weaponQuery(charCS,extraHands,'weap',1)+'|'+i+')';
				extraHands -= inHandHandedness;
				handNo += inHandHandedness;
				i += inHandHandedness;
			}
			content += '}}';
		}
		content += '{{desc=<div style="text-align:center">or '+((!lentHands) ? '[' : ('<span style='+((lentHands<0) ? design.selected_button : design.grey_button)+'>'))
				+  'Lend hands to somebody'
				+  ((lentHands) ? '</span>' : ('](!attk --button '+BT.BOTH+'|'+tokenID+'|-3|2|'+handsQuestion+' --lend-a-hand '+tokenID+'|&#64;{target|Who to lend a hand to?|token_id}|'+handsQuestion+'|'+BT.BOTH+')'))
				+  '</div>}}';

		if (isGM) {
			content += '{{desc3=<div style="text-align:center">'+tokenName+' has '+(parseInt(attrLookup( charCS, fields.Equip_handedness )) || 2)+' hands. [Change number of Hands](!attk --button '+BT.NOHANDS+'|'+tokenID+')</div>}}';
		}
		while (!_.isUndefined((inHand = InHandTable.tableLookup( fields.InHand_name, i++, false )))) {
		    if (inHand != '-') {
    			if (!auto) {
    				content += '{{desc4=<div style="text-align:center">And these weapons are dancing\n'
    						+  '<span style='+design.green_button+'>'+inHand+'</span>';
    				auto = true;
    			} else {
    				content += '<span style='+design.green_button+'>'+inHand+'</span>';
    			}
		    }
		}
		if (auto) {content += '</div>}}';}
		
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	}
	
	/**
	* Create the Edit Magic Item Bag menu.  Allow for a short version if
	* the Short Menus status flag is set, and highlight selected buttons
	**/
	
	var makeEditBagMenu = function(args,senderId,msg='',menuType) {
	    
		var tokenID = args[1],
			MIrowref = args[2],
			selectedMI = args[3] || '',
			charges = args[4],
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug( 'makeEditMImenu: Invalid character ID passed' );
			sendError( 'Invalid attackMaster argument' );
			return;
		}
		
        var qty, mi, playerConfig, magicItem, removeMI,
			selected = !!selectedMI && selectedMI.length > 0,
			remove = (selectedMI.toLowerCase() == 'remove'),
			bagSlot = !!MIrowref && MIrowref >= 0,
			content = '&{template:'+fields.defaultTemplate+'}{{name=Edit Magic Item Bag}}';

		if (!menuType) {
			playerConfig = getSetPlayerConfig( senderId );
			if (playerConfig && playerConfig.editBagType) {
				menuType = playerConfig.editBagType;
			} else {
			    menuType = 'long';
			}
		}
		var shortMenu = menuType == 'short';

		if (selected && !remove) {
			magicItem = getAbility( fields.MagicItemDB, selectedMI, charCS );
			if (!magicItem.obj) {
				sendResponse( charCS, 'Can\'t find '+selectedMI+' in the Magic Item database', senderId,flags.feedbackName,flags.feedbackImg,tokenID );
				return;
			}
		}
		
		if (msg && msg.length>0) {
			content += '{{='+msg+'}}';
		}
		
		if (!shortMenu || !selected) {
			content += '{{desc=**1.Choose what item to store**\n'
					+  '[Weapon](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Weapon to store|'+getMagicList(fields.MagicItemDB,miTypeLists,'weapon')+'}|'+charges+')'
					+  '[Armour](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Armour to store|'+getMagicList(fields.MagicItemDB,miTypeLists,'armour')+'}|'+charges+')'
			if (shortMenu) {
				content +=  '\n**OR**\n'
						+  '[Choose item to Remove](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|'+'Remove) from your MI bag}}'
						+  '{{desc2=[Swap to a long menu](!attk --button '+BT.EDITMI_OPTION+'|'+tokenID+'|'+(shortMenu ? 'long' : 'short')+')}}';
			}
		}
		if (!shortMenu || selected) {
			if (!remove) {
				if (shortMenu) {
					content += '{{desc=**1.Item chosen** ['+selectedMI+'](!attk --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'), click to reselect\n';
				}
    			content += '\nOptionally, you can '+(selected ? '[' : '<span style='+design.grey_button+'>')+'Review '+selectedMI+(selected ? ('](!attk --button '+BT.REVIEW_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|&#13;'+(magicItem.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+magicItem.dB+'|'+selectedMI+'})') : '')+'</span>';
            } else {
				content += '{{desc=**1.Action chosen** ***Remove***, [click](!attk --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+') to change';
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
				content += '[Select slot](!attk --button '+BT.SLOT_MI+'|'+tokenID+'|?{Which slot?'+makeMIlist( charCS, true )+'}|'+selectedMI+')';
			} else {
				content += makeMIbuttons( senderId, tokenID, 'current', fields.Items_qty[1], BT.SLOT_MI, '|'+selectedMI, MIrowref, false, true );
			}
			
			content += '}}';
		} else if (shortMenu && bagSlot) {
			removeMI = mi = attrLookup( charCS, [fields.Items_name[0], 'current'], fields.Items_table, MIrowref );
		    
		    content += '{{desc1=**2.Selected** ['+qty+' '+mi+'](!attk --button '+BT.SLOT_MI+'|'+tokenID+'|?{Which other slot?'+makeMIlist( charCS, true )+'}|'+selectedMI+'|)'
					+  ' as slot to '+(remove ? 'remove' : 'store it in')+', click to change}}';
		}
		
		if (!shortMenu || (selected && bagSlot)) {

			menuType = (shortMenu ? 'long' : 'short');
			content += '{{desc2=**3.';
			if (!remove) {
				content += ((selected && bagSlot) ? '[' : ('<span style='+design.grey_button+'>'))
						+  'Store '+selectedMI
						+  ((selected && bagSlot && !remove) ? ('](!attk --button '+BT.STORE_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|?{Quantity?|'+qty+'+1})') : '</span>')
						+  ' in your MI Bag**'+(!!removeMI ? (', overwriting **'+removeMI) : '')+'**\n\n'
						+  'or ';
			}
			content += (bagSlot ? '[' : ('<span style='+design.grey_button+'>'))
					+  'Remove '+(!!removeMI ? removeMI : 'item')
					+  (bagSlot ? ('](!attk --button '+BT.REMOVE_MI+'|'+tokenID+'|'+MIrowref+'|'+removeMI+')') : '</span>')
					+  ' from your MI Bag\n\n'
					+  'or [Swap to a '+menuType+' menu](!attk --button '+BT.EDITMI_OPTION+'|'+tokenID+'|'+menuType+')}}';
		}
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	}
	
	/*
	 * Make a display of the current armour scan results
	 */

	var makeACDisplay = function( args, senderId, finalAC, dmgAdj, acValues, armourMsgs ) {
		
		var tokenID = args[0],
			dmgType = (args[2] || 'nadj').toLowerCase(),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			tokenName = curToken.get('name'),
			currentAC = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC,fields.Thac0_base).val,
			AC = getACvalues(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Current Armour for '+tokenName+'}}';

		if (currentAC != finalAC) {
			content += '{{AC=<span style='+design.green_button+'>'+finalAC+'</span>'
					+  '\n(<span style='+design.selected_button+'>'+currentAC+'</span> with current magic)';

		} else if (dmgAdj.armoured.sadj != 0 || dmgAdj.armoured.padj != 0 || dmgAdj.armoured.badj != 0) {
			content += '{{AC=';
			args[2]='nadj';
			content += (dmgType == 'nadj'?'<span style='+design.selected_button+'>':'[')+'Standard:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj)+(dmgType=='nadj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='sadj';
			content += (dmgType == 'sadj'?'<span style='+design.selected_button+'>':'[')+'Slash:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj)+(dmgType=='sadj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='padj';
			content += (dmgType == 'padj'?'<span style='+design.selected_button+'>':'[')+'Pierce:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj)+(dmgType=='padj'?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='badj';
			content += (dmgType == 'badj'?'<span style='+design.selected_button+'>':'[')+'Bludgeon:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj)+(dmgType=='badj'?'</span>':'](!attk --checkac '+args.join('|')+')');
		} else {
			content += '{{AC=<span style='+design.selected_button+'>'+finalAC+'</span>';
		}

		content += '}}'
				+ (acValues.armour ? '{{Armour='+acValues.armour.name+' AC'+(parseInt(acValues.armour.data.ac||10)-parseInt(acValues.armour.data.adj||0)-parseInt(acValues.armour.data[dmgType]||0))+'}}' : '')
				+ (acValues.shield ? '{{Shield='+acValues.shield.name+'}}' : '');
				
		_.each( acValues, (e,k) => {
			if (k != 'armour' && k != 'shield') {
				content += '{{'+e.specs[2]+'='+e.name+'}}';
			}
		});
		if (armourMsgs && armourMsgs.length) {
			content += '{{desc=These items have been ignored:\n';
			_.each( armourMsgs, msg => content += msg + '\n' );
			content += '}}';
		}

		content += '{{desc1=<table>'
				+ '<tr>'
					+ '<td style="min-width:35px"></td><td style="min-width:25px">Armor + Shield</td><td style="min-width:25px">No Shield</td><td style="min-width:25px">No Armour</td>'
				+ '</tr><tr>'
					+ '<td>Normal</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.n.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.n.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.n.c+'</span></td>'
				+ '</tr><tr>'
					+ '<td>Missile</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.m.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.m.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.m.c+'</span></td>'
				+ '</tr><tr>'	
					+ '<td>Surprised</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.s.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.s.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.s.c+'</span></td>'
				+ '</tr><tr>'
					+ '<td>Back</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.b.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.b.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.b.c+'</span></td>'
				+ '</tr><tr>'
					+ '<td>Head</td>'
					+ '<td><span style='+design.green_button+'>'+AC.sh.h.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.sl.h.c+'</span></td>'
					+ '<td><span style='+design.green_button+'>'+AC.al.h.c+'</span></td>'
				+ '</tr></table>}}'
				+ '{{desc2=To change your armour state, use *Change Weapon* to change your shield,'
				    + ' or change the items you have equipped}}';

		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	}
	
	/*
	 * Make a menu for saving throws, and to maintain the 
	 * saving throws table
	 */
	 
	var makeSavingThrowMenu = function( args, senderId ) {
		
		var tokenID = args[0],
			sitMod = (parseInt((args[1] || 0),10) || 0),
			curToken = getObj('graphic',tokenID),
			charCS  = getCharacter( tokenID ),
			name =  curToken.get('name'),
			charName = charCS.get('name'),
			isGM = playerIsGM(senderId),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Roll a Saving Throw for '+name+'}}{{desc=<table>'
					+ '<thead>'
						+ '<th width="50%">Save</th><th width="25%">Base</th><th width="25%">Mod</th>'
					+ '</thead>';
					
		_.each( saveFormat, (saveObj,save) => {
			content += '<tr>'
					+  '<td>['+save+'](~'+charName+'|Do-not-use-'+save+'-save)</td>'
					+  '<td>[[0+'+attrLookup(charCS,saveObj.save)+']]</td>'
					+  '<td>[[0+'+attrLookup(charCS,saveObj.mod)+']]</td>'
					+  '</tr>';
		});
				
		content += '</table>}}'
				+  '{{desc1=Select a button above to roll a saving throw or '
				+  '[Add Situational Modifier](!attk --save '+tokenID+'|?{What type of attack to save against'
															 +'&#124;Weak Poison,?{Enter DM\'s adjustment for Weak Poison&amp;#124;0&amp;#125;'
															 +'&#124;Dodgeable ranged attack,([[([[0+'+attrLookup(charCS,fields.Dex_acBonus)+']])*-1]]&#41;'
															 +'&#124;Mental Attack,'+attrLookup(charCS,fields.Wisdom_defAdj)
															 +'&#124;Physical damage attack,?{Enter your magical armour plusses&amp;#124;0&amp;#125;'
															 +'&#124;Fire or acid attack,?{Enter your magical armour plusses&amp;#124;0&amp;#125;'
															 +'&#124;DM adjustment,?{Ask DM for value of adjustment&amp;#124;0&amp;#125;'
															 +'&#124;None of the above,0})'
				+  'such as Wisdom adjustment, Dexterity adjustment, etc. before making the roll}}'
				+  '{{desc2=[Auto-check Saving Throws](!attk --check-saves '+tokenID+') to set saves using Race, Class, Level & MI data, or\n'
				+  '[Update Saving Throw table](!attk --setSaves '+tokenID+') to manually change numbers}}';
					
		let saveNotes = attrLookup( charCS, fields.SaveNotes );
		if (saveNotes) {
			content += '{{desc3=**Notes**\n'+saveNotes+'}}';
		}

		_.each( saveFormat, (saveObj,saveType) => buildSaveRoll( tokenID, charCS, sitMod, saveType, saveObj, isGM ));
					
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
	}
	
	/*
	 * Make a menu to modify the saving throw table
	 */

	var makeModSavesMenu = function( args, senderId, msg ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter( tokenID ),
			name = curToken.get('name'),
			content = '&{template:'+fields.defaultTemplate+'}{{name=Set '+name+'\'s Saving Throws}}'
					+ ((msg && msg.length) ? '{{ ='+msg+'}}' : '')
					+ '{{desc=<table><tr>'
						+ '<td>Save</td><td>Base</td><td>Mod</td>'
					+ '</tr><tr>'
						+ '<td>**Paralysation**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_paralysis)+'](!attk --setSaves '+tokenID+'|Paralysis|Save|?{Save vs Paralysation base?|'+attrLookup(charCS,fields.Saves_paralysis)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modParalysis)+'](!attk --setSaves '+tokenID+'|Paralysis|Mod|?{Paralysation Save modifier?|'+attrLookup(charCS,fields.Saves_modParalysis)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Poison**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_poison)+'](!attk --setSaves '+tokenID+'|Poison|Save|?{Save vs Poison base?|'+attrLookup(charCS,fields.Saves_poison)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modPoison)+'](!attk --setSaves '+tokenID+'|Poison|Mod|?{Poison Save modifier?|'+attrLookup(charCS,fields.Saves_modPoison)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Death**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_death)+'](!attk --setSaves '+tokenID+'|Death|Save|?{Save vs Death base?|'+attrLookup(charCS,fields.Saves_death)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modDeath)+'](!attk --setSaves '+tokenID+'|Death|Mod|?{Death Save modifier?|'+attrLookup(charCS,fields.Saves_modDeath)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Rod**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_rod)+'](!attk --setSaves '+tokenID+'|Rod|Save|?{Save vs Rod base?|'+attrLookup(charCS,fields.Saves_rod)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modRod)+'](!attk --setSaves '+tokenID+'|Rod|Mod|?{Rod Save modifier?|'+attrLookup(charCS,fields.Saves_modRod)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Staff**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_staff)+'](!attk --setSaves '+tokenID+'|Staff|Save|?{Save vs Staff base?|'+attrLookup(charCS,fields.Saves_staff)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modStaff)+'](!attk --setSaves '+tokenID+'|Staff|Mod|?{Staff Save modifier?|'+attrLookup(charCS,fields.Saves_modStaff)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Wand**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_wand)+'](!attk --setSaves '+tokenID+'|Wand|Save|?{Save vs Wand base?|'+attrLookup(charCS,fields.Saves_wand)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modWand)+'](!attk --setSaves '+tokenID+'|Wand|Mod|?{Wand Save modifier?|'+attrLookup(charCS,fields.Saves_modWand)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Petrification**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_petrification)+'](!attk --setSaves '+tokenID+'|Petrification|Save|?{Save vs Petrification base?|'+attrLookup(charCS,fields.Saves_petrification)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modPetrification)+'](!attk --setSaves '+tokenID+'|Petrification|Mod|?{Petrification Save modifier?|'+attrLookup(charCS,fields.Saves_modPetrification)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Polymorph**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_polymorph)+'](!attk --setSaves '+tokenID+'|Polymorph|Save|?{Save vs Polymorph base?|'+attrLookup(charCS,fields.Saves_polymorph)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modPolymorph)+'](!attk --setSaves '+tokenID+'|Polymorph|Mod|?{Polymorph Save modifier?|'+attrLookup(charCS,fields.Saves_modPolymorph)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Breath**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_breath)+'](!attk --setSaves '+tokenID+'|Breath|Save|?{Save vs Breath base?|'+attrLookup(charCS,fields.Saves_breath)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modBreath)+'](!attk --setSaves '+tokenID+'|Breath|Mod|?{Breath Save modifier?|'+attrLookup(charCS,fields.Saves_modBreath)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr><tr>'
						+ '<td>**Spell**</td>'
						+ '<td>['+attrLookup(charCS,fields.Saves_spell)+'](!attk --setSaves '+tokenID+'|Spell|Save|?{Save vs Spell base?|'+attrLookup(charCS,fields.Saves_spell)+'|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1})</td>'
						+ '<td>[ '+attrLookup(charCS,fields.Saves_modSpell)+'](!attk --setSaves '+tokenID+'|Spell|Mod|?{Spell Save modifier?|'+attrLookup(charCS,fields.Saves_modSpell)+'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})</td>'
					+ '</tr></table>}}'
					+ '{{desc1=Select a button above to set the Save or Modifyer numbers, or select [Adjust all mods](!attk --setSaves '+tokenID+'|All|Mod|?{Change in all Save modifiers?|0|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10})}}'
					+ '{{desc2=Return to [Roll Saves](!attk --save '+tokenID+') menu}}';
		
		sendResponse(charCS,content,senderId,flags.feedbackName,flags.feedbackImg,tokenID);
	}
	
	/*
	 * Make a menu for accessing the attack API capabilities
	 */
	 
	var makeAttkActionMenu = function( args, senderId ) {
		
		var tokenID = args[1],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name='+tokenName+'\'s Attack Actions}}'
					+ '{{desc=[Attack (Roll20 rolls)](!attk --attk-menu-hit '+tokenID+')\n'
					+ '[Attack (You roll)](!attk --attk-roll '+tokenID+')\n'
					+ (!state.attackMaster.weapRules.dmTarget || playerIsGM(senderId) ? '[Targeted Attack](!attk --attk-target '+tokenID+')\n' : '')
					+ '[Change Weapon](!attk --weapon '+tokenID+')\n'
					+ '[Recover Ammo](!attk --ammo '+tokenID+')\n'
					+ '[Edit Weapons & Armour]('+((apiCommands.magic && apiCommands.magic.exists) ? '!magic --edit-mi '+tokenID+'|martial' : '!attk --edit-weapons '+tokenID)+')\n' 
					+ '[Check AC](!attk --checkac '+tokenID+')}}';
					
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	}
	
	/*
	 * Make a menu that covers other actions
	 */
	 
	var makeOtherActionsMenu = function( args, senderId ) {
		
		var tokenID = args[1],
			isGM = playerIsGM(senderId),
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.defaultTemplate+'}{{name='+tokenName+'\'s Other Actions}}'
					+ '{{subtitle=Maintenance}}'
					+ '{{desc=[Saves](!attk --save '+tokenID+')\n'
					+ ((apiCommands.cmd && apiCommands.cmd.exists) ? ('[Manage Character Class](!cmd --class-menu '+tokenID+')\n') : ('<span style='+design.grey_button+'>Manage Character Class</span>'))
					+ (isGM ? ('[Death](!setattr --fb-header &#64;{selected|token_name} Has Died --fb-content Making _CHARNAME_ as dead --charid &#64;{selected|character_id} --Check-for-MIBag|[&#91;&#64;{selected|Check-for-MIBag}%2&#93;]&#13;'
									+ '!token-mod --ignore-selected --ids &#64;{selected|token_id} --set statusmarkers|dead)\n') : '')
					+ ((apiCommands.magic && apiCommands.magic.exists) ? ('[Manage Light Sources](!magic --lightsources &#64;{selected|token_id})\n') : ('<span style='+design.grey_button+'>Manage Light Sources</span>'))
					+ ((apiCommands.money && apiCommands.money.exists) ? ('[Manage Money](!money --money-menu &#64;{selected|token_id})\n') : ('<span style='+design.grey_button+'>Manage Money</span>'))
					+ ((apiCommands.money && apiCommands.money.exists) ? ('[Out-of-Campaign activities](!money --training &#64;{selected|token_id})\n') : ('<span style='+design.grey_button+'>Out-of-Campaign activities</span>'))
					+ (isGM ? '[Adjust Damage](!setattr --silent --charid &#64;{selected|character_id} --strengthdmg||&#63;{Damage adjustment?} --strnotes|\'Dmg bonus: &#63;{Damage adjustment?|0} because &#63;{Why?}\'&#13;'
						+ '&#47;w gm **&#64;{Selected|Token_name}\'s new damage adjustment is [&#91;&#63;{Damage adjustment?|0}&#93;] because of &#63;{Why?}.**  Previous damage adjustment was &#91;[0+&#64;{selected|strengthdmg|max}]&#93;.)\n' : '')
					+'}}';
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	}
	
	/*
	 * Make a configuration menu to allow the DM to select:
	 * - strict mode: follow the rules precisely,
	 * - house rules mode: follow "old fogies" house rules
	 * - no restrictions: allow anything goes
	 */
	 
	var makeConfigMenu = function( args, msg='' ) {
		
		var configButtons = function( flag, txtOn, cmdOn, txtOff, cmdOff ) {
			var	buttons = '<td>'
						+ (flag ? ('['+txtOn+']('+cmdOn+')</td><td><span style='+design.selected_button+'>'+txtOff+'</span>')
								 : ('<span style='+design.selected_button+'>'+txtOn+'</span></td><td>['+txtOff+']('+cmdOff+')'))
						+ '</td>';
				return buttons;
			};
					
		var content = '&{template:'+fields.defaultTemplate+'}{{name=Configure RPGMaster}}{{subtitle=AttackMaster}}'
					+ (msg.length ? '{{ ='+msg+'}}' : '')
					+ '{{desc=Select which configuration you wish for this campaign using the toggle buttons below.}}'
					+ '{{desc1=<table>';
				
		content += '<tr><td>Menus</td>'+configButtons(state.MagicMaster.fancy, 'Plain menus', '!magic --config fancy-menus|false', 'Fancy menus', '!magic --config fancy-menus|true')+'</tr>'
				+  '<tr><td>Player Targeted Attks</td>'+configButtons(!state.attackMaster.weapRules.dmTarget, 'Not Allowed', '!attk --config dm-target|true', 'Allowed by All', '!attk --config dm-target|false')+'</tr>'
				+  '<tr><td>Allowed weapons</td>'+configButtons(state.attackMaster.weapRules.allowAll, 'Restrict Usage', '!attk --config all-weaps|false', 'All Can Use Any', '!attk --config all-weaps|true')+'</tr>'
				+  (state.attackMaster.weapRules.allowAll ? '' : ('<tr><td>Restrict weapons</td>'+configButtons(!state.attackMaster.weapRules.classBan, 'Strict Denial', '!attk --config weap-class|true', 'Apply Penalty', '!attk --config weap-class|false')+'</tr>'))
				+  '<tr><td>Allowed Armour</td>'+configButtons(state.attackMaster.weapRules.allowArmour, 'Strict Denial', '!attk --config all-armour|false', 'All Can Use Any', '!attk --config all-armour|true')+'</tr>'
				+  '<tr><td>Non-Prof Penalty</td>'+configButtons(!state.attackMaster.weapRules.prof, 'Class Penalty', '!attk --config prof|true', 'Character Sheet', '!attk --config prof|false')+'</tr>'
				+  '<tr><td>Ranged Mastery</td>'+configButtons(state.attackMaster.weapRules.masterRange, 'Not Allowed', '!attk --config master-range|false', 'Mastery Allowed', '!attk --config master-range|true')+'</tr>';
		if (apiCommands['magic']) {
			content += '<tr><td>Specialist Wizards</td>'+configButtons(!state.MagicMaster.spellRules.specMU, 'Specified in Rules', '!magic --config specialist-rules|true', 'Allow Any Specialist', '!magic --config specialist-rules|false')+'</tr>'
					+  '<tr><td>Spells per Level</td>'+configButtons(!state.MagicMaster.spellRules.strictNum, 'Strict by Rules', '!magic --config spell-num|true', 'Allow to Set Misc', '!magic --config spell-num|false')+'</tr>'
					+  '<tr><td>Spell Schools</td>'+configButtons(state.MagicMaster.spellRules.allowAll, 'Strict by Rules', '!magic --config all-spells|false', 'All Can Use Any', '!magic --config all-spells|true')+'</tr>';
		}
		content += '</table>}}';
		sendFeedback( content,flags.feedbackName,flags.feedbackImg );
		return;
	}
		
// --------------------------------------------------------------- Button press Handlers ----------------------------------------------

	/*
	 * Handle changing the amount of Ammo held.  Update 
	 * both the Ammo table and the related Magic Item with
	 * the current amount and/or the maximum amount specified,
	 * or modify it if a + or - precedes the amount.
	 */
 
	var handleAmmoChange = function( args, senderId ) {
		
		var isMI = args[0].includes(BT.AMMO),
			tokenID = args[1],
			ammoName = args[2],
			silent = ((args[5] || '').toUpperCase() == 'SILENT'),
			charCS = getCharacter(tokenID),
			ammoMIname = ammoName,
			changeQty = '+-'.includes((args[3]||[+0])[0]),
			changeMax = '+-'.includes((args[4]||[+0])[0]),
			qtyToMax = '=' == args[3],
			maxToQty = '=' == args[4],
			useAmmoQty = false,
			Ammo, ammoIndex, ammoDef,
			ammoQ, ammoM,
			setQty, setMax,
			MagicItems, miIndex, miName,
			miQ, miM, maxQty, qty;
			
		if (qtyToMax && maxToQty) {return;}
			
		try {
			setQty = parseInt(eval(args[3]));
		} catch {
			setQty = NaN;
		}
		try {
			setMax = parseInt(eval(args[4]));
		} catch {
			setMax = NaN;
		}
			
		Ammo = getTable(charCS,fieldGroups.AMMO);
		MagicItems = getTable(charCS,fieldGroups.MI);

		if (!isMI) {
			ammoIndex = Ammo.tableFind( fields.Ammo_name, ammoName );
			ammoMIname = Ammo.tableLookup( fields.Ammo_miName, ammoIndex) || ammoMIname;
		} else {
			ammoIndex = Ammo.tableFind( fields.Ammo_miName, ammoName ) || Ammo.tableFind( fields.Ammo_name, ammoName );
		}
		miIndex = MagicItems.tableFind( fields.Items_name, ammoMIname );
		if (!isNaN(ammoIndex)) useAmmoQty = Ammo.tableLookup( fields.Ammo_setQty, ammoIndex ) != 0;
			
		ammoQ = parseInt(Ammo.tableLookup( fields.Ammo_qty, ammoIndex )) || 0;
		ammoM = parseInt(Ammo.tableLookup( fields.Ammo_maxQty, ammoIndex )) || ammoQ;
		
		if (isNaN(miIndex)) {
			miQ = ammoQ;
			miM = ammoM;
		} else {
			miQ = parseInt(MagicItems.tableLookup( fields.Items_qty, miIndex )) || 0;
			miM = parseInt(MagicItems.tableLookup( fields.Items_trueQty, miIndex )) || miQ;
		}
		maxQty = isNaN(setMax) ? miM : (changeMax ? Math.max(miM + setMax,0) : setMax);
		qty = isNaN(setQty) ? (qtyToMax ? maxQty : Math.min(miQ,maxQty)) : ((!changeQty) ? (maxToQty ? setQty : Math.min(setQty,maxQty)) : (maxToQty ? Math.max(miQ + setQty,0) : Math.min(Math.max(miQ + setQty,0),maxQty)));
		if (maxToQty) {
			maxQty = qty;
		}

		if (!useAmmoQty) {
			ammoQ = qty;
			ammoM = maxQty;
		} else {
			ammoQ = Math.min(ammoM,Math.max(0,(qty - miQ + ammoQ)));
		}

		if (!isNaN(miIndex)) {
			MagicItems.tableSet( fields.Items_qty, miIndex, qty );
			MagicItems.tableSet( fields.Items_trueQty, miIndex, maxQty );
			miName = MagicItems.tableLookup( fields.Items_name, miIndex );
		
			if (maxQty == 0) {
				ammoDef = abilityLookup( fields.WeaponDB, ammoMIname, charCS );
				if (ammoDef.obj && ammoDef.obj[1] && (ammoDef.obj[1].charge || '').toLowerCase() == 'charged') {
					MagicItems.tableSet( fields.Items_name, miIndex, '-' );
					MagicItems.tableSet( fields.Items_trueName, miIndex, '-' );
				}
			}
			ammoIndex = Ammo.table[1]-1;
			while(!_.isUndefined(ammoMIname = Ammo.tableLookup(fields.Ammo_miName, ++ammoIndex, false))) {
				if (ammoMIname == miName) {
					Ammo.tableSet( fields.Ammo_qty, ammoIndex, ammoQ );
					Ammo.tableSet( fields.Ammo_maxQty, ammoIndex, ammoM );
				}
			}
		} else if (!isNaN(ammoIndex) && ammoIndex >= -1) {
			Ammo.tableSet( fields.Ammo_qty, ammoIndex, ammoQ );
			Ammo.tableSet( fields.Ammo_maxQty, ammoIndex, ammoM );
		}
		if (!silent) {
			makeAmmoMenu( args, senderId );
			makeAmmoChangeMsg( senderId, tokenID, args[2], miQ, qty, miM, maxQty );
		}
		return;
	};	
			
	/**
	 * The processing to change weapon is lengthy as it has to do
	 * a lot of searching & updating of tables.  So send a
	 * "please wait..." message to the Player and a time-delayed
	 * call to the processing to allow the screen to update before
	 * hogging the processing power...
	 */
	 
	var handleChangeWeapon = function( args, senderId, silent=false ) {
		
		var tokenID = args[1],
			selection = args[2],
			row = args[3],
			handsLent = parseInt(args[4]) || 0,
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			weaponInfo = {},
			InHandTable = getTable( charCS, fieldGroups.INHAND ),
			Quiver = getTable( charCS, fieldGroups.QUIVER ),
			values = initValues( InHandTable.fieldGroup ),
			noHands = parseInt(attrLookup(charCS,fields.Equip_handedness)) || 2,
			lentHands = parseInt(attrLookup(charCS,fields.Equip_lentHands)) || 0,
			handedness = 1,
			r = parseInt(selection.split(':')[0]),
			c = parseInt(selection.split(':')[1]),
			isGM = playerIsGM(senderId),
			lentLeftID, lentRightID, lentBothID,
			weapon, trueWeapon, weaponSpecs, weaponQty, weapData, weaponDB,
			item, i, hand, index, sheathed;
			
		weaponInfo.MELEE = getTable( charCS, fieldGroups.MELEE );
		weaponInfo.DMG = getTable( charCS, fieldGroups.DMG );
		weaponInfo.RANGED = getTable( charCS, fieldGroups.RANGED );
		weaponInfo.AMMO = getTable( charCS, fieldGroups.AMMO );
		weaponInfo.ammoTypes = [];
			
		// First, check there are enough rows in the InHand table
		
		InHandTable = checkInHandRows( charCS, InHandTable, row );

		// See if any hands are currently lent to anyone else
		
		lentLeftID = (attrLookup( charCS, fields.Equip_lendLeft ) || '');
		lentRightID = (attrLookup( charCS, fields.Equip_lendRight ) || '');
		lentBothID = (attrLookup( charCS, fields.Equip_lendBoth ) || '');

		// Find the weapon items
		
		if (selection == -2) {
			weapon = trueWeapon = 'Touch';
		} else if (selection == -2.5) {
			weapon = trueWeapon = 'Punch-Wrestle';
		} else if (selection == -3) {
			weapon = trueWeapon = 'Lend-a-Hand';
			handedness = Math.min(Math.max(handsLent,2), noHands);
			setAttr( charCS, fields.Equip_lentHands, (lentHands - handedness) );
		} else if (selection.includes(':')) {
			
			let Spells = getTable( charCS, fieldGroups.SPELLS, c );
			weapon = trueWeapon = Spells.tableLookup( fields.Spells_name, r );
			weaponQty = parseInt(Spells.tableLookup( fields.Spells_castValue, r ));
			weaponDB = Spells.tableLookup( fields.Spells_db, r );
			selection = r;
			if (!weaponDB || (!weaponQty && weapon !== '-')) {
				sendParsedMsg(tokenID,messages.spellCast,senderId);
				return;
			}
			Spells.tableSet( fields.Spells_castValue, r, Math.max(weaponQty-1,0) );
		} else {
			weapon = attrLookup( charCS, fields.Items_name, fields.Items_table, r ) || '-';
			trueWeapon = attrLookup( charCS, fields.Items_trueName, fields.Items_table, r ) || weapon;
			weaponQty = parseInt(attrLookup( charCS, fields.Items_qty, fields.Items_table, r ) || 0);
			weaponDB = fields.WeaponDB;
			if (!weaponQty && weapon !== '-') {
				sendParsedMsg(tokenID,messages.noneLeft,senderId);
				return;
			}
		}
		if (weapon !== '-') {
			item = abilityLookup(weaponDB, trueWeapon, charCS, true);
			if (!item.obj) {
				log('handleChangeWeapon not found '+weapon);
				sendDebug('handleChangeWeapon not found '+weapon);
				return;
			};
			weaponSpecs = item.obj[1].body.match(/}}\s*Specs\s*=(.*?){{/im);
			weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(reSpecs)] : [];
			handedness = (parseInt(weaponSpecs[0][3]) || 1);
		}
		
		// Next, blank the quiver table
		
		Quiver = blankQuiver( charCS, Quiver );

		// And reverse any previously lent hands
		
		if (lentBothID.length) {
			setAttr( charCS, fields.Equip_lendBoth, '' );
			setAttr( charCS, fields.Equip_lentHands, 0 );
			sendAPI('!attk --lend-a-hand '+tokenID+'|'+lentBothID+'|'+lentHands+'|'+BT.BOTH);
		}

		// Then add the weapon to the InHand table
		
	    values[fields.InHand_name[0]][fields.InHand_name[1]] = weapon;
	    values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = trueWeapon;
	    values[fields.InHand_index[0]][fields.InHand_index[1]] = selection;
	    values[fields.InHand_column[0]][fields.InHand_column[1]] = c;
	    values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness;
	    values[fields.InHand_db[0]][fields.InHand_db[1]] = weaponDB;
		
		switch (args[0]) {
		case BT.BOTH:
		    InHandTable.tableSet( fields.InHand_name, 0, '-');
		    InHandTable.tableSet( fields.InHand_trueName, 0, '');
		    InHandTable.tableSet( fields.InHand_index, 0, '');
		    InHandTable.tableSet( fields.InHand_name, 1, '-');
		    InHandTable.tableSet( fields.InHand_trueName, 1, '');
		    InHandTable.tableSet( fields.InHand_index, 1, '');
			break;
		case BT.HAND:
			break;
		default:
		    InHandTable.tableSet( fields.InHand_name, 2, '-');
		    InHandTable.tableSet( fields.InHand_trueName, 2, '');
		    InHandTable.tableSet( fields.InHand_index, 2, '');
		    InHandTable.tableSet( fields.InHand_handedness, 2, 0);
		    break;
		}
        InHandTable.addTableRow( row, values );
		
		// If weapon requires more than 1 hand, blank the following rows that
		// represent hands holding this weapon
		
		i = handedness;
		hand = row;
		while (i>1) {
			InHandTable.addTableRow( ++hand );
			i--;
		}
		
		// Next add the new weapon to the weapon tables and 
		// at the same time check every weapon InHand for ammo to 
		// add to the quiver
		
		if (selection != -3) [weaponInfo,Quiver] = updateAttackTables( charCS, InHandTable, Quiver, weaponInfo, row, selection, handedness );
		
		// Then remove any weapons or ammo from the weapon tables that 
		// are not currently inHand (in the InHand or Quiver tables)

		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE', [] );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED', sheathed );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG', sheathed );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO', sheathed );
		
		sendAPImacro(curToken,'',trueWeapon,'-inhand');
		
		if (item && item.obj) {
			weapData = item.obj[1].body.match(/weapdata\s*?=\s*?(\[.*?\])/im);
			if (weapData) {
				weapData = parseData(weapData[1], reSpellSpecs, false);
				if (weapData.on) {
					sendAPI( parseStr(weapData.on).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
												  .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'));
				};
			};
		};
		
		// RED v1.038: store name of weapon just taken in hand for later reference as needed
		setAttr( charCS, fields.Equip_takenInHand, weapon );
		setAttr( charCS, fields.Equip_trueInHand, trueWeapon );
		
		doCheckAC( [tokenID], senderId, [], true );
		if (!silent) makeChangeWeaponMenu( args, senderId, 'Now using '+weapon+'. ' );
		
        return;
	}
	
	/* 
	 * Handle putting on and taking off rings
	 */
	 
	var handleChangeRings = function( args, senderId, silent=false ) {
		
		var left = args[0] == BT.LEFTRING,
			tokenID = args[1],
			selection = args[2],
			charCS = getCharacter(tokenID),
			charName = charCS.get('name'),
			ring = attrLookup( charCS, (left ? fields.Equip_leftRing : fields.Equip_rightRing) ) || '-',
			trueRing = attrLookup( charCS, (left ? fields.Equip_leftTrueRing : fields.Equip_rightTrueRing) ) || oldRing,
			item, trueItem, ringData;
			
		if (ring != '-') {
			trueItem = getAbility(fields.MagicItemDB, trueRing, charCS, false);
			ringData = trueItem.obj[1].body.match(/(?:ring|ac)data\s*?=\s*?(\[.*?\])/im);
			if (ringData) {
				ringData = parseData(ringData[1], reSpellSpecs, false);
				if (ringData.off) {
					sendAPI( parseStr(ringData.off).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
												   .replace(/{\s*selected\s*\|/ig,'{'+charName+'|'));
				};
			};
		};
		if (!isNaN(selection)) {
			ring = attrLookup( charCS, fields.Items_name, fields.Items_table, selection ) || '-';
			trueRing = attrLookup( charCS, fields.Items_trueName, fields.Items_table, selection ) || ring;
			item = getAbility(fields.MagicItemDB, ring, charCS, true);
			trueItem = getAbility(fields.MagicItemDB, trueRing, charCS, true);
			if (!item.obj || !trueItem.obj) {
				sendDebug('handleChangeRings not found '+ring+' or '+trueRing);
				return;
			};
			setAttr( charCS, (left ? fields.Equip_leftRing : fields.Equip_rightRing), ring );
			setAttr( charCS, (left ? fields.Equip_leftTrueRing : fields.Equip_rightTrueRing), trueRing );
			ringData = trueItem.obj[1].body.match(/(?:ring|ac)data\s*?=\s*?(\[.*?\])/im);
			if (ringData) {
				ringData = parseData(ringData[1], reSpellSpecs, false);
				if (ringData.on) {
					sendAPI( parseStr(ringData.on).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
												  .replace(/{\s*selected\s*\|/ig,'{'+charName+'|'));
				};
			};
		} else {
			ring = 'no ring';
			setAttr( charCS, (left ? fields.Equip_leftRing : fields.Equip_rightRing), '-' );
			setAttr( charCS, (left ? fields.Equip_leftTrueRing : fields.Equip_rightTrueRing), '-' );
		}
		doCheckAC( [tokenID], senderId, [], true );
		if (!silent) makeChangeWeaponMenu( args, senderId, 'Now using '+ring+'. ' );
		return;
	}

	/*
	 * Handle the addition or removal of autonomous weapons, such as 
	 * dancing weapons*/
	 
	var handleDancingWeapons = function( args, senderId ) {
		
		var isAdd = (args[0] == BT.AUTO_ADD),
			tokenID = args[1],
			weapon = (args[2] || ''),
			lcWeapon = weapon.toLowerCase(),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			noHands = parseInt(attrLookup(charCS,fields.Equip_handedness)) || 2,
			dancing = parseInt(attrLookup(charCS,fields.Equip_dancing)) || 0,
			MagicItems = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
            weaponInfo = {},
			InHandTable = getTable(charCS, fieldGroups.INHAND),
			Quiver = getTable(charCS, fieldGroups.QUIVER),
			i = InHandTable.tableFind( fields.InHand_name, weapon ),
			weaponIndex = MagicItems.tableFind( fields.Items_name, weapon ),
			slotName, handedness, specs, weaponSpecs, values, msg, sheathed;

		weaponInfo.MELEE = getTable( charCS, fieldGroups.MELEE );
		weaponInfo.DMG = getTable( charCS, fieldGroups.DMG );
		weaponInfo.RANGED = getTable( charCS, fieldGroups.RANGED );
		weaponInfo.AMMO = getTable( charCS, fieldGroups.AMMO );
		weaponInfo.ammoTypes = [];

		if (_.isUndefined(weaponIndex)) {
			log('handleDancingWeapons unable to find '+weapon);
			sendDebug('handleDancingWeapons unable to find '+weapon);
			return;
		}
		if (!_.isUndefined(i)) {
			InHandTable.addTableRow( i );
		}
		
		Quiver = blankQuiver( charCS, Quiver );

		if (!isAdd) {
			setAttr( charCS, fields.Equip_dancing, (dancing-1) );
			i = weaponIndex = handedness = null;
			msg = weapon+' has stopped Dancing. If you have free hands, grab it now.  If not, change weapons next round to take it in hand again}}';
		} else {
			specs = abilityLookup( fields.WeaponDB, weapon, charCS );
			weaponSpecs = specs.obj[1].body.match(/}}\s*Specs\s*=(.*?){{/im);
			weaponSpecs = weaponSpecs ? [...('['+weaponSpecs[0]+']').matchAll(reSpecs)] : [];
			values = initValues(fieldGroups.INHAND.prefix),
			values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness = (parseInt(weaponSpecs[0][3]) || 1);
			values[fields.InHand_name[0]][fields.InHand_name[1]] = weapon;
			values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = (attrLookup( charCS, fields.Items_trueName, fields.Items_table, weaponIndex ) || weapon);
			values[fields.InHand_index[0]][fields.InHand_index[1]] = weaponIndex;
			
			InHandTable = checkInHandRows( charCS, InHandTable, noHands+dancing+1 );
			
			i = InHandTable.sortKeys.length;
			do {
				slotName = InHandTable.tableLookup( fields.InHand_name, --i );
			} while (slotName != '-' && i > fields.InHand_table[1] );
			if (slotName != '-') {
				sendError('Unable to add '+weapon+' as a Dancing weapon' );
			} else {
				InHandTable.addTableRow( i, values );
			}
			setAttr( charCS, fields.Equip_dancing, (dancing+1) );
			sendPublic( getObj('graphic',tokenID).get('name')+' lets go of their '+weapon+' which continues to fight by itself' );
			msg = weapon+' has started *Dancing!* and will automatically be added to Initiative rolls';
    	}
		[weaponInfo,Quiver] = updateAttackTables( charCS, InHandTable, Quiver, weaponInfo, i, weaponIndex, handedness );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE', [] );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED', sheathed );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG', sheathed );
		sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO', sheathed );

   		if (isAdd) sendAPImacro(curToken,'',weapon,'-dancing');
		makeChangeWeaponMenu( args, senderId, msg );

		return;
	}
		
	/*
	 * Handle a command for changing the specifications of a weapon,
	 * given the weapon name, the attribute to change, and the value.
	 * prefix of +/- modifies, none or = sets
	 */
	 
	var handleModWeapon = function( args, silent ) {
		
	// --modWeapon tokenID|weaponName|table|attributes:values
	//  table: Melee,Dmg,Ranged,Ammo
	//  attribute: w,t,st,+,sb,db,n,r,sp,sz,ty,sm,l,
	
		var tokenID = args[1],
			weapon = (args[2]||'').toLowerCase().replace(reIgnore,''),
			tableName = (args[3]||'').toUpperCase(),
			attributes = args[4],
			charCS = getCharacter(tokenID),
			weapData = parseData( ','+attributes+',', reWeapSpecs, false ),
			table = getTable( charCS, fieldGroups[tableName] ),
			group = table.fieldGroup,
			i = table.table[1]-1,
			weapIndex = null,
			typeName = '',
			superType = '',
			miName, attkName, newVal;
			
		do {
			attkName = table.tableLookup( fields[group+'name'], ++i, false );
			if (!_.isUndefined(attkName)) {
				miName = table.tableLookup( fields[group+'miName'], i );
				if (['MELEE','RANGED','DMG'].includes(tableName)) {
					typeName = table.tableLookup( fields[group+'type'], i );
					superType = table.tableLookup( fields[group+'superType'], i );
				}
				if ('all' == weapon || miName.toLowerCase().replace(reIgnore,'') == weapon 
									|| attkName.toLowerCase().replace(reIgnore,'') == weapon
									|| typeName.toLowerCase().replace(reIgnore,'') == weapon
									|| superType.toLowerCase().replace(reIgnore,'') == weapon) {
					weapIndex = i;
					_.each( weapData, (val,key) => {
						var oldVal, ranges, rangeMod;
						if (!_.isUndefined(val) && !_.isUndefined(fields[group+key])) {
							if (key != 'dmgType') {
								if (val.length > 1 && ((val[0]=='-') || (val[0]=='+'))) {
									oldVal = table.tableLookup( fields[group+key], weapIndex );
									if (key != 'range') {
										try {
											newVal = eval('(2*'+(oldVal || '0')+')+(2*'+val+')');
											newVal = (newVal%2) ? (newVal + '/2') : (newVal/2);
										} catch {
											newVal = (oldVal || 0) + val;
										}
									} else {
										//deal with range mods
										ranges = (oldVal || '0').split('/');
										rangeMod = val.split('/');
										// Remove any non-numeric entries from the ranges
										ranges = _.reject(ranges, function(dist){return isNaN(parseInt(dist,10));}).map(r => parseInt(r,10));
										rangeMod = _.reject(rangeMod, function(dist){return isNaN(parseInt(dist,10));}).map(r => parseInt(r,10));
										// Reduce the number of mod ranges to match the weapon ranges
										while (rangeMod.length > 1 && rangeMod.length > ranges.length) {
											rangeMod.shift();
										}
										for (let i=0; rangeMod.length && i<ranges.length; i++) {
											ranges[i] += rangeMod[Math.min(i,(rangeMod.length-1))];
										}
										newVal = ranges.join('/');
									}
								} else if (val[0]=='\=') {
									newVal = val.slice(1);
								} else {
									newVal = val;
								}
								table.tableSet( fields[group+key], weapIndex, newVal );
							} else {
								let dmgType =val.toUpperCase();
								table.tableSet( fields[group+'slash'], weapIndex, (dmgType.includes('S')?1:0) );
								table.tableSet( fields[group+'pierce'], weapIndex, (dmgType.includes('P')?1:0) );
								table.tableSet( fields[group+'bludgeon'], weapIndex, (dmgType.includes('B')?1:0) );
							};
						};
					});
				}
			}
		} while (!_.isUndefined(attkName));
		
		if (_.isNull(weapIndex) && !silent) {
			sendError('Weapon '+weapon+' not found to amend');
		}
		return;
	}
	
	/**
	 * Set or clear the primary weapon for two weapon attacks
	 **/
	 
	var handleSetPrimaryWeapon = function( args, senderId ) {
		
		var tokenID = args[0],
			weapon = args[1],
			silent = (args[2] || '').toLowerCase() == 'silent',
			charCS = getCharacter(tokenID),
			MeleeWeapons = getTableField( charCS, {}, fields.MW_table, fields.MW_name ),
			MeleeWeapons = getTableField( charCS, MeleeWeapons, fields.MW_table, fields.MW_miName ),
			RangedWeapons = getTableField( charCS, {}, fields.RW_table, fields.RW_name ),
			RangedWeapons = getTableField( charCS, RangedWeapons, fields.RW_table, fields.RW_miName ),
			msg, index;
			
		if (!weapon || !weapon.length) {
			setAttr( charCS, fields.Primary_weapon, -1 );
			setAttr( charCS, fields.Prime_weapName, '' );
			msg = 'No longer wielding two weapons';
		} else {
			index = MeleeWeapons.tableFind(fields.MW_name, weapon );
			if (_.isUndefined(index)) index = MeleeWeapons.tableFind( fields.MW_miName, weapon );
			if (!_.isUndefined(index)) {
				index = ((index*2)+(fields.MW_table[1]==0?1:3));
			} else {
				index = RangedWeapons.tableFind( fields.RW_name, weapon );
				if (_.isUndefined(index)) index = RangedWeapons.tableFind( fields.RW_miName, weapon );
				if (!_.isUndefined(index)) {
					index = ((index*2)+(fields.RW_table[1]==0?2:4));
				}
			}
			if (!_.isUndefined(index)) {
				setAttr( charCS, fields.Primary_weapon, index );
				setAttr( charCS, fields.Prime_weapName, weapon );
				msg = 'Primary attack set to be with '+weapon+'. Using any other weapon might incur a penalty';
			} else {
				setAttr( charCS, fields.Primary_weapon, -1 );
				setAttr( charCS, fields.Prime_weapName, '' );
				msg = 'Weapon '+weapon+' not found, so no primary weapon set';
			}
		}
		msg = '&{template:'+fields.defaultTemplate+'}{{name=Setting Primary Weapon}}'
			+ '{{desc='+msg+'.}}';
		sendResponse(charCS,msg,senderId,flags.feedbackName,flags.feedbackImg,tokenID);
		return;
	}

	/**
	 * Handle the selection of an option button on a menu,
	 * usually used to set short or long menus.
	 */
	 
	var handleOptionButton = function( args, senderId ) {
		
		var tokenID = args[1],
			optionValue = args[2].toLowerCase(),
	        config = getSetPlayerConfig( senderId ) || {};

		if (!['short','long'].includes(optionValue)) {
			sendError( 'Invalid attackMaster menuType option.  Use short or long' );
			return;
		}
		config.editBagType = optionValue;
		getSetPlayerConfig( senderId, config );
		makeEditBagMenu( [BT.EDIT_MI, tokenID, -1, ''], senderId, 'Using '+optionValue+' Edit MI Bag menu' );
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
	 * Handle selecting a magic item to store in the
	 * displayed magic item bag.
	 */
 
	var handleSelectMI = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MItoStore = args[3],
			charCS = getCharacter(tokenID),
			MIdata;
			
		if (!charCS) {
			sendDebug('handleSelectMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (!MItoStore || MItoStore.length == 0) {
			sendDebug('handleSelectMI: invalid Magic Item passed');
			sendError('Internal miMaster error');
			return;
		}
		MIdata = abilityLookup( fields.MagicItemDB, MItoStore, charCS );
		setAttr( charCS, fields.ItemCastingTime, ((MIdata.obj && MIdata.obj[1]) ? MIdata.obj[1].ct : 0 ));
		setAttr( charCS, fields.ItemSelected, 1 );
		
		makeEditBagMenu( args, senderId, 'Selected '+MItoStore+' to store' );
		return;
	};

	/*
	 * Review a chosen spell description
	 */
	 
	var handleReviewMI = function( args, senderId ) {
		
		var tokenID = args[1],
			msg,
			charCS = getCharacter(tokenID);
			
		args.shift();
		msg = '[Return to menu](!attk --button CHOOSE_MI|'+args.join('|')+')';
		sendResponse( charCS, msg, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
		return;
	}
	
	/*
	 * Handle selecting a slot in the displayed MI bag
	 */
	 
	var handleSelectSlot = function( args, senderId ) {

		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleSelectSlot: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (!MIrowref || isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleSelectSlot: invalid MI parameter passed');
			sendError('Internal miMaster error');
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
		
		makeEditBagMenu( args, senderId, 'Selected slot currently containing '+slotItem );
		return;			
	}
	
	/*
	 * Handle storing an MI in a Magic Item bag.
	 * A flag parameter determines if this is a GM-only action
	 */
	 
	var handleStoreMI = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			MIqty = args[4],
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug('handleStoreMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleStoreMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
				
		if (MIqty.length == 0 || MIqty.length > 5) {
			MIqty = 0;
		} else {
			try {
				MIqty = eval(MIqty) || 0;
			} catch {
				MIqty = 0;
			}
		}
		var MItables = getTable( charCS, fieldGroups.MI ),
			slotName = MItables.tableLookup( fields.Items_name, MIrowref ),
			slotType = MItables.tableLookup( fields.Items_type, MIrowref ),
			containerNo = attrLookup( charCS, fields.ItemContainerType ),
			magicItem = abilityLookup( fields.MagicItemDB, MIchosen, charCS ),
			values = MItables.values;
		
		if (!magicItem.obj) {
			sendDebug('handleStoreMI: selected magic item speed/type not defined');
			sendError('Selected Magic Item not fully defined');
			return;
		}
		
		var MIspeed = magicItem.obj[1].ct,
		    MItype = magicItem.obj[1].charge,
		    midbCS;
			
		if (!playerIsGM(senderId) && slotType.toLowerCase().includes('cursed')) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!attk --edit-mi '+tokenID+')}}', senderId );
			return;
		}
		values[fields.Items_name[0]][fields.Items_name[1]] = MIchosen;
		values[fields.Items_trueName[0]][fields.Items_trueName[1]] = MIchosen;
		values[fields.Items_speed[0]][fields.Items_speed[1]] = MIspeed;
		values[fields.Items_trueSpeed[0]][fields.Items_trueSpeed[1]] = MIspeed;
		values[fields.Items_qty[0]][fields.Items_qty[1]] = MIqty;
		values[fields.Items_trueQty[0]][fields.Items_trueQty[1]] = MIqty;
		values[fields.Items_cost[0]][fields.Items_cost[1]] = 0;
		values[fields.Items_type[0]][fields.Items_type[1]] = MItype;
		
		MItables.addTableRow( MIrowref, values );

		if (!(containerNo % 2)) {
			setAttr( charCS, fields.ItemContainerType, (isNaN(containerNo) ? 1 : containerNo+1) );
		}
		
		// RED: v2.037 calling checkAC command to see if 
		//             there has been any impact on AC.
		doCheckAC( [tokenID,'Silent','',senderId], senderId, [] );

		makeEditBagMenu( ['',tokenID,-1,''], senderId, MIchosen+' has overwritten '+slotName );
		return;
	}
	
	/*
	 * Handle removing an MI from a Magic Item bag.
	 * Use a flag to check if this is being done by the GM.
	 */
	 
	var handleRemoveMI = function( args, senderId ) {
		
		var tokenID = args[1],
			MIrowref = args[2],
			MIchosen = args[3],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('handleRemoveMI: invalid tokenID passed');
			sendError('Internal miMaster error');
			return;
		}
		if (isNaN(MIrowref) || MIrowref<0) {
			sendDebug('handleRemoveMI: invalid row reference passed');
			sendError('Internal miMaster error');
			return;
		}
		
		var slotType = attrLookup( charCS, fields.Items_type, fields.Items_table, MIrowref ) || '';
		if (!playerIsGM(senderId) && slotType.toLowerCase().includes('cursed')) {
			sendParsedMsg( tokenID, messages.cursedSlot + '{{desc1=[Return to menu](!attk --edit-mi '+tokenID+')}}', senderId );
			return;
		}
		getTable( charCS, fieldGroups.MI ).addTableRow( MIrowref );	// Blanks this table row
		
		// RED: v2.037 calling attackMaster checkAC command to see if 
		//             there has been any impact on AC.
		doCheckAC( [tokenID,'Silent','',senderId], senderId, [] );

		args[2] = -1;
		args[3] = '';
		makeEditBagMenu( args, senderId, 'Slot '+MIrowref+' has been removed' );
		return;
	};
	
// ------------------------------------------------------------- Command Action Functions ---------------------------------------------

	/**
	 * Show help message
	 */ 

	var showHelp = function() {
		
		var handoutIDs = getHandoutIDs();
		var content = '&{template:'+fields.defaultTemplate+'}{{title=AttackMaster Help}}{{AttackMaster Help=For help on using AttackMaster, and the !attk commands, [**Click Here**]('+fields.journalURL+handoutIDs.AttackMasterHelp+')}}{{Weapons & Armour DB Help=For help on the Weapons, Ammo and Armour databases, [**Click Here**]('+fields.journalURL+handoutIDs.WeaponsArmourDatabaseHelp+')}}{{Attacks Database=For help on using and adding Attack Templates and the Attacks Database, [**Click Here**]('+fields.journalURL+handoutIDs.AttacksDatabaseHelp+')}}{{Class Database=For help on using and adding to the Class Database, [**Click Here**]('+fields.journalURL+handoutIDs.ClassDatabaseHelp+')}}{{Character Sheet Setup=For help on setting up character sheets for use with RPGMaster APIs, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterCharSheetSetup+').}}{{RPGMaster Templates=For help using RPGMaster Roll Templates, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterTemplatesHelp+')}}';
		
		sendFeedback(content,flags.feedbackName,flags.feedbackImg); 
	};
	
	/*
	 * Update databases to latest versions held in API
	 */
 
	async function doUpdateDB(args, silent) {
		
		var dbName = args[0],
			forceIndexUpdate = false;
			
		if (dbName && dbName.length) {
			let dbLabel = dbName.replace(/-/g,'_');
			if (!dbNames[dbLabel]) {
				sendError('Not found database '+dbName);
			} else {
				log('Updating database '+dbName);
				sendFeedback('Updating database '+dbName,flags.feedbackName,flags.feedbackImg);
				let result = await buildDB( dbName, dbNames[dbLabel], silent );
				forceIndexUpdate = true;
			}
		} else if (_.some( dbNames, (db,dbName) => db.api.includes('attk') && checkDBver( dbName, db, silent ))) {
			log('Updating all AttackMaster databases');
			sendFeedback(design.info_msg+'Updating all AttackMaster databases</div>',flags.feedbackName,flags.feedbackImg);
			_.each( dbNames, (db,dbName) => {
				if (db.api.includes('attk')) {
					let dbCS = findObjs({ type:'character', name:dbName.replace(/_/g,'-') },{caseInsensitive:true});
					if (dbCS && dbCS.length) {
						setAttr( dbCS[0], fields.dbVersion, 0 );
					}
				}
			});
			for (const name in dbNames) {
				if (dbNames[name].api.includes('attk')) {
					let result = await buildDB( name, dbNames[name], silent );
				}
			}
			forceIndexUpdate = true;

		};
		apiDBs.attk = true;
		sendAPI('!magic --index-db attk');
		sendAPI('!cmd --index-db attk');
		updateDBindex(forceIndexUpdate);
		
		return;
	}
	
	/*
	 * Display a menu of attack options
	 */
	 
	var doMenu= function(args,senderId,selected) {
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doMenu: no token specified');
			sendError('No token selected');
			return;
		}
			
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doMenu: specified token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		makeAttkActionMenu(args,senderId);
		return;
	}

	/*
	 * Display a menu of other actions
	 */
	 
	var doOtherMenu= function(args,senderId,selected) {
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doOtherMenu: no token specified');
			sendError('No token selected');
			return;
		}
			
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doOtherMenu: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		makeOtherActionsMenu(args,senderId);
		return;
	}

	/*
	* Function to display the menu for attacking with physical melee, ranged or innate weapons
	*/

	var doAttk = function(args,senderId,attkType,selected) {
		if (!args) args = [];
			
		if (!_.contains(Attk,attkType.toUpperCase())) {
			sendDebug('doAttk: Invalid attkType '+attkType+' specified');
			sendError('Invalid AttackMaster parameter');
			return;
		}

		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doAttk: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		
		if (args.length < 1 || args.length > 5) {
			sendDebug('doAttk: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		var tokenID = args.shift(),
		    charCS = getCharacter( tokenID ),
		    mAttk;
	
		if (!charCS) {
            sendDebug( 'doAttackMenu: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		if (args[0]) {
			const encoders = [[/&/g,"\\amp"],[/\(/g,"\\lpar"],[/\)/g,"\\rpar"],[/\|/g,"\\vbar"]];
			args[0] = encoders.reduce((m, rep) => m.replace(rep[0], rep[1]), args[0]);
		}
		
		if (!args[1] && (mAttk = (attrLookup( charCS, fields.Monster_dmg1 ) || '')).length) {
			args[1] = mAttk.split(',')[0];
		}
		if (!args[2] && (mAttk = (attrLookup( charCS, fields.Monster_dmg2 ) || '')).length) {
			args[2] = mAttk.split(',')[0];
		}
		if (!args[3] && (mAttk = (attrLookup( charCS, fields.Monster_dmg3 ) || '')).length) {
			args[3] = mAttk.split(',')[0];
		}
		args = ['',tokenID,attkType,null,null].concat(args);
		makeAttackMenu( args, senderId, MenuState.ENABLED );
		return;
    };
	
	/*
	 * Modify an attribute of a weapon in one of 
	 * the weapon attack tables
	 * Syntax: --modWeapon tokenID|weaponName|table|attributes:values
	 * table: Melee,Dmg,Ranged,Ammo
	 * attribute: w,t,st,+,sb,db,n,c,m,r,sp,sz,ty,sm,l
	 */
	 
	var doModWeapon = function( args, senderId, silent, selected ) {

		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doModWeapon: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		if (args.length < 4) {
			sendDebug('doModWeapon: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
			weaponName = args[1],
			table = args[2],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doModWeapon: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		if (!['MELEE','RANGED','DMG','AMMO'].includes(table.toUpperCase())) {
            sendDebug( 'doModWeapon: table type '+table+' is invalid' );
            sendError( 'Invalid attackMaster call syntax' );
            return;
        };

		args.unshift('');
		handleModWeapon( args, silent );
		if (!silent) {
			let content = '&{template:'+fields.defaultTemplate+'}{{name=Weapon Specification Changed}}'
						+ '{{desc='+getObj('graphic',tokenID).get('name')+'\'s '+weaponName+' has had a modification}}';
			sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg, tokenID );
		}
		return;
	}
	
	/*
	 * Modify the amount of a specified type of ammo.
	 * This sets both the ammo line (if current) and 
	 * the corresponding Magic Item.
	 */
	 
	var doSetAmmo = function( args, senderId, selected ) {
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doSetAmmo: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		
		if (args.length < 4) {
			sendDebug('doSetAmmo: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doSetAmmo: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		handleAmmoChange( args, senderId );
		return;
	}
	
	/*
	 * Display a menu to allow the player to recover or 
	 * change ammunition quantities.
	 */
	 
	var doAmmoMenu = function( args, senderId, selected ) {

		if (!args) args = [];

		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doAmmoMenu: tokenID not specified');
			sendError('No token selected');
			return;
		};
		
		var tokenID = args[0],
		    charCS = getCharacter( tokenID );
	
		if (!charCS) {
            sendDebug( 'doAmmoMenu: tokenID does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		args.unshift('');
		makeAmmoMenu( args, senderId );
		return;
	}
	
	/*
	 * Specify that the next attack will be using 
	 * multiple weapons 
	 */
	
	var doMultiSwords = function( args, senderId, selected ) {
		
		if (!args) {args = [];}
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug( 'doMultiSwords: tokenID is invalid' );
            sendError( 'No token selected' );
            return;
 		}	
		if (!getCharacter(args[0])) {
            sendDebug( 'doMultiSwords: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
			
		handleSetPrimaryWeapon( args, senderId );
		return;
	}
	
	/*
	 * Display a menu to allow the Player to change the weapon(s)
	 * that a character is wielding, selecting them from the MI Bag,
	 * and create them in the weapon tables.  For ranged weapons,
	 * also search the MI Bag for ammo for that type of ranged weapon.
	 */
	 
	var doChangeWeapon = function( args, senderId, selected ) {
		
		if (!args) {args = [];}

		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doChangeWeapon: Token not specified');
			sendError('No token selected');
			return;
		};
		
		if (!getCharacter(args[0])) {
            sendDebug( 'doChangeWeapon: token does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };

        args.unshift('');
		makeChangeWeaponMenu( args, senderId, args[2] );
		return;
	}
	
	/*
	 * Manage the starting and stopping of a dancing weapon, or 
	 * other form of auto-attacking weapon that does not use a 
	 * character's hand
	 */
	 
	var doDancingWeapon = function( args, senderId, selected ) {

		if (!args) {args = [];}
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doDancingWeapon: No token selected');
			sendError('No token selected');
			return;
		}

		if (args.length < 2) {
			sendDebug('doDancingWeapon: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};
		
		if (!getCharacter(args[0])) {
            sendDebug( 'doDancingWeapon: tokenID does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };

        args.unshift((args[2] || '').toUpperCase()=='STOP' ? BT.AUTO_DELETE : BT.AUTO_ADD);
		handleDancingWeapons( args, senderId );
		return;
	}
	
	/**
	 * Function to blank a named weapon from all weapon tables on 
	 * the specified sheet as well as the InHand and Quiver tables
	 **/
	 
	var doBlankWeapon = function( args, selected, senderId ) {
		
		if (!args) {args = [];}
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doBlankWeapon: No token selected');
			sendError('No token selected');
			return;
		}

		var tokenID = args[0],
			weapon = args[1],
			silent = (args[2] || '').toUpperCase() === 'SILENT',
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
           sendDebug( 'doBlankWeapon: tokenID does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };
		
		if (!weapon || !weapon.length) {
           sendDebug( 'doBlankWeapon: invalid weapon '+args[1]+' specified' );
            sendError( 'Invalid weapon specified' );
            return;
        };
		
		var weapTable = {};
		
		weapTable.MELEE = getTable( charCS, fieldGroups.MELEE );
		weapTable.RANGED = getTable( charCS, fieldGroups.RANGED );
		weapTable.DMG = getTable( charCS, fieldGroups.DMG );
		weapTable.AMMO = getTable( charCS, fieldGroups.AMMO );
		weapTable.INHAND = getTable( charCS, fieldGroups.INHAND );
		weapTable.QUIVER = getTable( charCS, fieldGroups.QUIVER );
		
		blankWeapon( charCS, weapTable, _.keys(weapTable), weapon );
		
		if (!silent) {
			sendResponse( charCS, '&{template:'+fields.warningTemplate+'}{{name='+charCS.get('name')+'\'s Weapons}}{{desc=The weapon "'+weapon+'" is no longer in-hand.}}', senderId, flags.feedbackName );
		}
		return;
	}
	
	/**
	 * Function to display the Edit Item Bag menu
	 */
	 
	var doEditMIbag = function( args, selected, senderId ) {
		
		if (!args) args = [];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doEditMIbag: No token selected');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendDebug('doEditMIbag: invalid ID arguments');
			sendError('Invalid attackMaster parameters');
			return;
		};
		
		args = [BT.EDIT_MI,tokenID,-1,''];
		makeEditBagMenu( args, senderId );
		return;
	}
	
	/*
	 * Scan the MI bag for Armour, Shields and Protective items 
	 * to determine the base AC.  Add any Dex or other bonuses, and 
	 * set the token AC_max as this.  Then check token effects -
	 * if there are no effects set the AC_current to this, otherwise 
	 * if the two are different turn on the AC bar to indicate difference
	 */
	 
	var doCheckAC = function( args, senderId, selected, silent = false ) {
		
		if (!args) args=[];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		}
		
		var tokenID = args[0],
			silentCmd = args[1] || '',
			dmgType = (args[2] || 'nadj').toLowerCase(),
			noDmgAdj = dmgType == 'nadj',
			curToken = getObj('graphic',tokenID),
			charCS;
			
		if (!curToken)
			{throw {name:'AttackMaster error', message:'Invalid token_id provided.'};}
		charCS = getCharacter( tokenID );
		if (!charCS) return false;
		
		if (!['sadj','padj','badj','nadj'].includes(dmgType)) {
			throw {name:'attackMaster error', message:'Invalid damage type provided.'};
		}
		
		silent = silent || (silentCmd.toLowerCase().trim() == 'silent');
		senderId = args[3] || senderId;
		
		var armourInfo = scanForArmour( charCS ),
			acValues = armourInfo.acValues,
			armourMsgs = armourInfo.msgs,
			dexBonus = parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0) * -1,
			baseAC = (parseInt(acValues.armour.data.ac || 10) - parseInt(acValues.armour.data.adj || 0)),
            prevAC = parseInt(attrLookup( charCS, fields.Armour_normal )),
			dmgAdj = {armoured:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0},
					  sless:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0},
					  aless:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0}},
			magicArmour = acValues.armour.magic,
			armouredDexBonus = dexBonus,
			armourlessDexBonus = dexBonus,
			shieldlessDexBonus = dexBonus,
			armourlessAC = 10,
			ac, currentAC;

		_.each( acValues, (e,k) => {
			if (k == 'armour') return;
			if (!k.toLowerCase().includes('protection') || !magicArmour) {
				
				dmgAdj.armoured = _.mapObject(dmgAdj.armoured, (d,a) => {return d + parseInt(e.data[a] || 0)});
				armouredDexBonus *= parseFloat(e.data.db || 1);
				if (k == 'shield') {
					dmgAdj.armoured.adj += parseInt(e.data.ac || 1);
				} else {
					dmgAdj.sless = _.mapObject(dmgAdj.sless, (d,a) => {return d + parseInt(e.data[a] || 0)});
					shieldlessDexBonus *= parseFloat(e.data.db || 1);
				}
			}
			if (k != 'shield') {
				dmgAdj.aless = _.mapObject(dmgAdj.aless, (d,a) => {;return d + parseInt(e.data[a] || 0)});
				armourlessDexBonus *= parseFloat(e.data.db || 1);
			}
		});
		dmgAdj.armoured.adj += dmgAdj.armoured[dmgType];
		dmgAdj.sless.adj += dmgAdj.sless[dmgType];
		baseAC -= parseInt(acValues.armour.data[dmgType] || 0);
		dmgAdj.armoured.madj += parseInt(acValues.armour.data.madj || 0);
		dexBonus = Math.floor(armouredDexBonus * parseFloat(acValues.armour.data.db || 1));
		
		if (dexBonus) {
			acValues.dexBonus = {name:('Dexterity Bonus '+dexBonus),specs:['',('Dexterity Bonus '+dexBonus),'Dexterity','0H','Dexterity'],data:{adj:dexBonus}};
		}

        setAttr( charCS, fields.Armour_normal, (baseAC - dmgAdj.armoured.adj - dexBonus) );
		setAttr( charCS, fields.Armour_missile, (baseAC - dmgAdj.armoured.adj - dexBonus - dmgAdj.armoured.madj) );
		setAttr( charCS, fields.Armour_surprised, (baseAC - dmgAdj.armoured.adj) );
		setAttr( charCS, fields.Armour_back, (baseAC - dmgAdj.sless.adj - dmgAdj.sless.madj) );
		setAttr( charCS, fields.Armour_head, (baseAC - dmgAdj.armoured.adj - dexBonus - 4) );
		setAttr( charCS, fields.Shieldless_normal, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus) );
		setAttr( charCS, fields.Shieldless_missile, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - dmgAdj.sless.madj) );
		setAttr( charCS, fields.Shieldless_surprised, (baseAC - dmgAdj.sless.adj) );
		setAttr( charCS, fields.Shieldless_back, (baseAC - dmgAdj.sless.adj) );
		setAttr( charCS, fields.Shieldless_head, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - 4) );
		setAttr( charCS, fields.Armourless_normal, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus) );
		setAttr( charCS, fields.Armourless_missile, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - dmgAdj.aless.madj) );
		setAttr( charCS, fields.Armourless_surprised, (armourlessAC - dmgAdj.aless.adj) );
		setAttr( charCS, fields.Armourless_back, (armourlessAC - dmgAdj.aless.adj) );
		setAttr( charCS, fields.Armourless_head, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - 4) );
		
		dmgAdj.armoured.sadj += parseInt(acValues.armour.data.sadj || 0);
		dmgAdj.armoured.padj += parseInt(acValues.armour.data.padj || 0);
		dmgAdj.armoured.badj += parseInt(acValues.armour.data.badj || 0);
			
		// set token circles & bars
		
        ac = (baseAC - dmgAdj.armoured.adj - dexBonus);
		currentAC = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC,fields.Thac0_base);
//		log('doCheckAC: ac='+ac+', val='+currentAC.val+', name='+currentAC.name+', barName='+currentAC.barName+', prevAC='+prevAC);
		currentAC.val = (isNaN(currentAC.val) || isNaN(prevAC)) ? ac : currentAC.val + ac - prevAC;
//		log('doCheckAC: (isNaN(currentAC.val) || isNaN(prevAC)) = '+(isNaN(currentAC.val) || isNaN(prevAC))+', currentAC.val + ac - prevAC = '+currentAC.val+'+'+ac+'-'+prevAC+' = '+(currentAC.val + ac - prevAC));
		if (fields.Token_MaxAC[0].length) {
			if (currentAC.val != ac) {
//				log('doCheckAC: setting maxAC to '+(((ac*currentAC.val)<0)?currentAC.val:ac)+' because ((ac*currentAC.val)<0) is '+((ac*currentAC.val)<0));
				curToken.set(fields.Token_MaxAC[0]+'_'+fields.Token_MaxAC[1],((ac*currentAC.val)<0)?currentAC.val:ac);
			} else {
//				log('doCheckAC: setting maxAC to blank');
				curToken.set(fields.Token_MaxAC[0]+'_'+fields.Token_MaxAC[1],'');
			}
		}
		if (fields.Token_AC[0].length) {
//				log('doCheckAC: setting current AC to '+currentAC.val);
			curToken.set(fields.Token_AC[0]+'_'+fields.Token_AC[1],currentAC.val);
		}
		
		setAttr( charCS, fields.StdAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj) );
		setAttr( charCS, fields.SlashAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj) );
		setAttr( charCS, fields.PierceAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj) );
		setAttr( charCS, fields.BludgeonAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj) );
		setAttr( charCS, fields.StdMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj-dmgAdj.armoured.madj) );
		setAttr( charCS, fields.SlashMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj-dmgAdj.armoured.madj) );
		setAttr( charCS, fields.PierceMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj-dmgAdj.armoured.madj) );
		setAttr( charCS, fields.BludgeonMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj-dmgAdj.armoured.madj) );

		if (!silent || (ac != prevAC)) {
			makeACDisplay( args, senderId, ac, dmgAdj, acValues, armourMsgs );
		}
		return false;
	}
	
	/*
	 * Handle making a saving throw
	 */
	 
	var doSave = function( args, senderId, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doSave: no token specified');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			charCS = getCharacter( tokenID );
			
		if (!charCS) {
			sendDebug('doSave: invalid tokenID passed as args[0]');
			sendError('Invalid token selected');
			return;
		}
		
		makeSavingThrowMenu( args, senderId );
		return;
	}
	
	/*
	 * Check the saving throw table
	 */
	 
	var doCheckSaves = function( args, senderId, selected ) {
		
		handleCheckSaves( args, senderId, selected );
		return;
	}
	
	/*
	 * Handle madification of the saving throw table 
	 */
	 
	var doModSaves = function( args, senderId, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doModSaves: no token specified');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			saveType = (args[1] || '').toLowerCase(),
			saveField = (args[2] || '').toLowerCase(),
			saveNewVal = (parseInt((args[3] || 0),10) || 0),
			charCS = getCharacter( tokenID ),
			name, content = '';
			
		if (!charCS) {
			sendDebug('doModSaves: invalid tokenID passed as args[0]');
			sendError('Invalid attackMaster arguments');
			return;
		}
			
		if (saveType == 'all') {
			_.each(saveFormat, sVal => (sVal[saveField] ? setAttr( charCS, sVal[saveField], saveNewVal ) : ''));
			content = 'Set all save'+(saveField=='mod'?' modifiers':'s')+' to [['+saveNewVal+']]';
		} else if (saveType && saveFormat[saveType] && saveFormat[saveType][saveField]) {
			setAttr( charCS, saveFormat[saveType][saveField], saveNewVal );
			content = 'Set '+saveType+' save '+(saveField=='mod'?'modifier':'')+' to [['+saveNewVal+']]';
		}
		makeModSavesMenu( args, senderId, content );
		return;
	}
	
	/*
	 * Display a menu to change the number of hands.  If the 'hands' 
	 * value has a '+' or '-' change the number by the value.  Min is 0
	 */
	 
	var doChangeNoHands = function( args, senderId, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doModSaves: no token specified');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			hands = args[1] || '+0',
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError('Invalid AttackMaster command syntax');
			return;
		}
		
		var	handedness = (attrLookup( charCS, fields.Equip_handedness ) || '2 Right Handed').split(' '),
			curHands = handedness.shift(),
			handedness = handedness.join(' ');
			
		if (hands[0] === '+' || hands[0] === '-') {
			hands = (parseInt(curHands) || 2) + (parseInt(hands) || 0);
		}
		setAttr( charCS, fields.Equip_handedness, Math.max(hands,0)+' '+handedness );

		args = ['',tokenID];
		makeChangeWeaponMenu( args, senderId );
	}
	
	/*
	 * Handle the Lend-a-Hand command, so multiple characters can 
	 * work together to man a weapon requiring more than 2 hands
	 */
	 
	var doLendAHand = function( args, senderId ) {
		
		if (!args || args.length < 3) {
			sendDebug('doLendAHand: invalid number of parameters for Lend-a-Hand');
			sendError('Invalid AttackMaster arguments');
			return;
		}
		
		var fromID = args[0],
			toID = args[1],
			noHands = parseInt(args[2] || 2),
			hand = args[3] || BT.HAND,
			fromChar = getCharacter(fromID),
			toChar = getCharacter(toID),
			currentHands;
			
		if (!fromChar || !toChar) {
			sendDebug('doLendAHand: invalid character tokens selected');
			sendError('Invalid AttackMaster arguments');
			return;
		}
		if (noHands > 0) {
			switch (hand.toUpperCase()) {
			case BT.LEFT:
				setAttr( fromChar, fields.Equip_lendLeft, toID );
				break;
			case BT.RIGHT:
				setAttr( fromChar, fields.Equip_lendRight, toID );
				break;
			case BT.BOTH:
			case BT.HAND:
				setAttr( fromChar, fields.Equip_lendBoth, toID );
				break;
			default:
				sendDebug('doLendAHand: invalid hand specified');
				sendError('Invalid AttackMaster arguments');
				return;
			}
		}
		currentHands = Math.max(((parseInt(attrLookup( toChar, fields.Equip_lentHands )) || 0) + noHands), 0);
		setAttr( toChar, fields.Equip_lentHands, currentHands );
		if (noHands > 0) {
			sendResponse( toChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}{{desc='+getObj('graphic',fromID).get('name')+' has lent '+noHands+' hand(s) to you so you can work together}}', null,flags.feedbackName,flags.feedbackImg, toID );
			sendResponse( fromChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}{{desc=you have lent '+noHands+' hand(s) to '+getObj('graphic',toID).get('name')+' so you can work together}}', senderId,flags.feedbackName,flags.feedbackImg, fromID );
		}
		if (noHands < 0) {
			currentHands += (parseInt(attrLookup( toChar, fields.Equip_handedness )) || 2);
			let InHandTable = getTableField( toChar, {}, fields.InHand_table, fields.InHand_handedness ),
				droppedWeapons = [],
				weapon;
			InHandTable = getTableField( toChar, InHandTable, fields.InHand_table, fields.InHand_name );
			for (let i=fields.InHand_table[1]; !_.isUndefined(weapon = InHandTable.tableLookup(fields.InHand_name, i, false)); i++) {
				if (weapon && weapon != '-') {
					noHands = parseInt(InHandTable.tableLookup( fields.InHand_handedness, i)) || 0;
					currentHands -= noHands;
					if (currentHands < 0) {
						droppedWeapons.push( weapon );
						hand = (i==0) ? BT.LEFT : (i==1 ? BT.RIGHT : (i==2 ? BT.BOTH : BT.HAND));
						handleChangeWeapon( [hand,toID,'-',i], senderId, true );
					}
				}
			}
			sendResponse( toChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}'
								 +'{{desc='+getObj('graphic',fromID).get('name')+' is no longer lending you their hands'
								 +(droppedWeapons.length ? (', and you have had to drop '+droppedWeapons.join(', ')) : '')+'}}', null,flags.feedbackName,flags.feedbackImg, toID );
			sendResponse( fromChar, '&{template:'+fields.defaultTemplate+'}{{name=Working Together}}{{desc=You are no longer lending hand(s) to '+getObj('graphic',toID).get('name')
									+'}}',senderId,flags.feedbackName,flags.feedbackImg,fromID);
		}
		return;
	}
	
	/*
	 * Handle setting the attack dice roll and targeting by user
	 */
	 
	var doSetAttkType = function( args, senderId ) {
		
		var senderId = args.shift() || senderId,
			attkType = args.shift() || Attk.TO_HIT,
			playerConfig = getSetPlayerConfig( senderId );
			
		if (!_.contains(Attk,attkType)) {
			sendError('Invalid AttackMaster syntax');
			return;
		}
		if (!playerConfig) {
			playerConfig = {};
		}
		switch (attkType) {
		case Attk.TO_HIT:
		case Attk.ROLL:
		case Attk.TARGET:
			playerConfig.attkType = attkType;
			break;
		case Attk.ROLL_3D:
			playerConfig.roll3D = !playerConfig.roll3D;
			break;
		default:
			playerConfig.attkType = Attk.TO_HIT;
			playerConfig.roll3D = false;
		}
		getSetPlayerConfig( senderId, playerConfig );
		if (args.length) {
			if (attkType != Attk.ROLL_3D) args[2] = attkType;
			makeAttackMenu( args, senderId, false );
		}
		return;
	}
	
	/*
	 * Handle the Config command, to configure the API
	 */
 
	var doConfig = function( args, senderId ) {

		if (!args || args.length < 2) {
			makeConfigMenu( args );
			return;
		}
		
		var flag = args[0].toLowerCase(),
			value = args[1].toLowerCase() == 'true',
			msg = '';
		
		switch (flag) {
		case 'fancy-menus':
			state.attackMaster.fancy = value;
			if (!_.isUndefined(state.MagicMaster.fancy)) state.MagicMaster.fancy = value;
			msg = value ? 'Fancy menus will be used' : 'Plain menus will be used';
			break;
			
		case 'prof':
			state.attackMaster.weapRules.prof = value;
			msg = value ? 'Non-Proficient weapon penalty set as per rules' : 'Non-Proficienct weapon penalty uses Character Sheet field value';
			break;
			
		case 'all-weaps':
			state.attackMaster.weapRules.allowAll = value;
			msg = value ? 'All classes can be proficient in all weapons' : 'Class weapons restricted to some degree';
			break;
			
		case 'weap-class':
			state.attackMaster.weapRules.classBan = value;
			msg = value ? 'Classes strictly restricted to allowed weapons' : 'Classes can use restricted weapons at increased penalty';
			break;
			
		case 'all-armour':
			state.attackMaster.weapRules.allowArmour = value;
			msg = value ? 'All classes can use any armour' : 'Class armour restricted to rules';
			break;
			
		case 'master-range':
			state.attackMaster.weapRules.masterRange = value;
			msg = value ? 'Ranged weapons can be Mastered' : 'Only Melee weapons can be Mastered';
			break;
			
		case 'dm-target':
			state.attackMaster.weapRules.dmTarget = value;
			msg = value ? 'Players are not allowed to use Targeted attacks' : 'Players can use Targeted attacks';
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
	        sendError('Invalid AttackMaster parameters');
	    }
	
	    var opt = args[0],
	        value = args[1],
	        player = getObj('player',senderId),
	        playerName, content,
	        config = getSetPlayerConfig( senderId ) || {};
	        
        if (player) {
            playerName = player.get('_displayname');
        } else {
            playerName = 'GM';
        }
        content = '&{template:'+fields.defaultTemplate+'}{{name='+playerName+'\'s RPGMaster options}}';

        switch (opt.toLowerCase()) {
        
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
            sendResponseError( senderId, 'Invalid RPGMaster option. [Show Help](!magic --help)');
            break;
        };
	    return config;
	};
	
	/**
	 * Present a menu to select player-specific chat display options 
	 **/

	var doDispConfig = function( senderId ) {
		let config = getSetPlayerConfig( senderId ) || {menuImages:state.MagicMaster.fancy, menuPlain:!state.MagicMaster.fancy, menuDark:false};
		let player = getObj('player',senderId);
		let content = '/w "' + player.get('_displayname') + '" ' + design.info_msg
					+ '<table>'
					+ '<tr><td>Menu images</td><td><a style= "width: 16px; height: 16px; border: none; background: none" title="Menus with Images" href="!attk --options menudisplay|images">'+(config.menuImages ? '\u2705' : '\u2B1C')+'</a></td></tr>'
					+ '<tr><td>Menu plain</td><td><a style= "width: 16px; height: 16px; border: none; background: none" title="Tabulated Menus" href="!attk --options menudisplay|plain">'+(config.menuPlain ? '\u2705' : '\u2B1C')+'</a></td></tr>'
					+ '<tr><td>Menu dark</td><td><a style= "width: 16px; height: 16px; border: none; background: none" title="Dark Mode Menus" href="!attk --options menudisplay|dark">'+(config.menuDark ? '\u2705' : '\u2B1C')+'</a></td></tr>'
					+ '</table></div>';
		sendAPI( content, senderId );
		return;
	}

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, isGM, senderId ) {
		if (!args)
			{return;}

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
		
			makeAttackMenu( args, senderId, false );
			break;
			
		case BT.RANGEMOD :
		
			makeAttackMenu( args, senderId, true );
			break;

		case BT.AMMO :
		    args[3]=('+-'.includes(args[3][0])?args[3]:'+'+args[3]);
			handleAmmoChange( args, senderId );
			break;
			
		case BT.LEFT :
		case BT.RIGHT :
		case BT.BOTH :
		case BT.HAND :
		
			handleChangeWeapon( args, senderId );
			break;
			
		case BT.LEFTRING :
		case BT.RIGHTRING :
		
			handleChangeRings( args, senderId );
			break;
			
		case BT.NOHANDS :
		
			makeHandednessMenu( args );
			break;
			
		case BT.ADD_MIROW:
		    
		    handleAddMIrow( args, senderId );
		    break;
			
		case BT.EDITMI_OPTION:
		
			handleOptionButton( args, senderId );
			break;

		case BT.CHOOSE_MI :
		
			handleSelectMI( args, senderId );
			break;
			
		case BT.REDO_CHOOSE_MI:
		    
		    makeEditBagMenu( args, senderId );
		    break;
			
		case BT.REVIEW_MI :
			 
			handleReviewMI( args, senderId );
			break;
			
		case BT.SLOT_MI :
		
			handleSelectSlot( args, senderId );
			break;
			
		case BT.STORE_MI :
		
			handleStoreMI( args, senderId );
			break;

		case BT.REMOVE_MI :
		
			handleRemoveMI( args, senderId );
			break;
			
		case BT.SAVES :
			args.shift();
			makeSavingThrowMenu( args, senderId );
			break;
			
		default :
			sendDebug('doButton: Invalid button type');
			sendError('Invalid attackMaster syntax');
		};

	};


/* ----------------------------------- Handle handshakes ------------------------------ */
	 
	/**
	 * Handle a database indexing handshake
	 **/
	 
	var doIndexDB = function( args ) {
		
		apiDBs[args[0]] = true;
		updateDBindex();
		return;
	};
	
	var doRollTest = function() {
		
		sendChat( "Richard", "/roll 1d20", null, {use3d:true});
		
	}
		
	/**
	 * Handle handshake request
	 **/
	 
	var doHsQueryResponse = function(args) {
		if (!args) return;
		var from = args[0] || '',
			func = args[1] || '',
			funcTrue = ['menu','other-menu','attk-hit','attk-roll','attk-target','weapon','dance','mod-weapon','quiet-modweap','ammo','setammo','checkac','save','help','check-db','debug'].includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr attk'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
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
			isGM = (playerIsGM(senderId) || state.attackMaster.debug === senderId),
			t = 0;;
			
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

		if (msg.type !='api' || args.indexOf('!attk') !== 0)
			{return;}

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
				arg = argString.split('"');
				if (arg.length > 1) {
					arg = arg.flatMap((a,j,l) => {
						if (j%2) return a;
						a = a.trim().split('|');
						if (j==0 && a.length) a.pop();
						else if (j==(l.length-1) && a.length) a.shift();
						else {a.pop();a.shift()}
						return a;
					});
				} else {
					arg = argString.split('|');
				}
				
				try {
					switch (cmd) {
					case 'display-ability':
						doDisplayAbility(arg,selected,senderId,flags.feedbackName,flags.feedbackImg);
						break;
					case 'attk-hit':
						doAttk(arg,senderId,Attk.USER,selected);
						break;
					case 'attk-menu-hit':
						doAttk(arg,senderId,Attk.TO_HIT,selected);
						break;
					case 'attk-roll':
						doAttk(arg,senderId,Attk.ROLL,selected);
						break;
					case 'attk-target':
						if (!state.attackMaster.weapRules.dmTarget || isGM) {
							doAttk(arg,senderId,Attk.TARGET,selected);
						} else if (arg[0] || (selected && selected.length)) {
							sendParsedMsg((arg[0] || selected[0]._id),messages.targetAttkDisabled,senderId);
						}
						break;
					case 'ammo':
						doAmmoMenu(arg,senderId,selected);
						break;
					case 'setammo':
					case 'set-ammo':
						doSetAmmo(arg,senderId,selected);
						break;
					case 'checkac':
					case 'check-ac':
						doCheckAC(arg, senderId, selected, false);
						break;
					case 'twoswords':
						doMultiSwords(arg,senderId,selected);
						break;
					case 'weapon':
						doChangeWeapon(arg,senderId,selected);
						break;
					case 'lend-a-hand':
						doLendAHand(arg, senderId);
						break;
					case 'change-hands':
						doChangeNoHands(arg,senderId,selected);
						break;
					case 'dance':
						doDancingWeapon(arg,senderId,selected);
						break;
					case 'mod-weapon':
						doModWeapon(arg,senderId,false,selected);
						break;
					case 'quiet-modweap':
						doModWeapon(arg,senderId,true,selected);
						break;
					case 'blank-weapon':
					case 'blankweapon':
						doBlankWeapon(arg,selected,senderId);
						break;
					case 'edit-weapons':
					case 'edit-armour':
					case 'edit-armor':
						doEditMIbag(arg,selected,senderId);
						break;
					case 'save':
						doSave(arg,senderId,selected);
						break;
					case 'check-saves':
						doCheckSaves(arg, senderId, selected);
						break;
					case 'setsaves':
						doModSaves(arg,senderId,selected);
						break;
					case 'menu':
						doMenu(arg,senderId,selected);
						break;
					case 'other-menu':
						doOtherMenu(arg,senderId,selected);
						break;
					case 'update-db':
					case 'extract-db':
						doUpdateDB(arg, false);
						break;
					case 'check-db':
						if (isGM) checkDB(arg);
						break;
					case 'index-db':
						if (isGM) doIndexDB(arg);
						break;
					case 'disp-config':
						doDispConfig(senderId);
						break;
					case 'options':
						doSetOptions(arg,senderId);
						break;
					case 'config':
						if (isGM) doConfig(arg, senderId);
						break;
					case 'set-all-ac':
						if (isGM) checkACvars(true);
						break;
					case 'set-attk-type':
						doSetAttkType(arg,senderId);
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
						if (isGM) updateHandouts(handouts,false,senderId);
						break
					case 'button':
						doButton(arg,isGM, senderId);
						break;
					case 'help':
						showHelp();
						break;
					case 'relay':
						if (isGM) doRelay(argString,senderId);
						break;
					case 'debug':
						// RED: v1.207 allow anyone to set debug and who to send debug messages to
						doSetDebug(argString,senderId);
						break;
					default:
						showHelp(); 
						sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>',flags.feedbackName,flags.feedbackImg);
					}
				} catch (e) {
					log('attackMaster JavaScript '+e.name+': '+e.message+' while processing cmd '+cmd+' '+argString);
					sendDebug('attackMaster handleChatMsg: JavaScript '+e.name+': '+e.message+' while processing cmd '+cmd+' '+argString);
					sendError('attackMaster JavaScript '+e.name+': '+e.message);
				}
			}, (300*t++), e);
    	});
		return;
	};

	 
// -------------------------------------------------------------- Register the API -------------------------------------------

	/*
	 * Register attackMaster API with the
	 * commandMaster API
	 */
	 
	var cmdMasterRegister = function() {
		var cmd = fields.commandMaster
				+ ' --register Attack_hit|Do an attack where Roll20 rolls the dice|attk|~~attk-hit|`{selected|token_id}'
				+ ' --register Attack_roll|Do an attack where player rolls the dice|attk|~~attk-roll|`{selected|token_id}'
				+ ' --register Attack_target|Do an attack with full target statistics (GM-only)|attk|~~attk-target|`{selected|token_id}'
				+ ' --register Attack_menu|Display a menu of attack functions|attk|~~menu|`{selected|token_id}'
				+ ' --register Other_actions|Display a menu of Other Actions|attk|~~other-menu|`{selected|token_id}'
				+ ' --register Ammo|Retrieve or acquire ammo|attk|~~ammo|`{selected|token_id}'
				+ ' --register Save|Make and maintain saving throws|attk|~~save|`{selected|token_id}'
				+ ' --register Change_weapon|Change weapons in-hand|attk|~~weapon|`{selected|token_id}'
				+ ' --register Check_armour|Check and display current armour class|attk|~~checkac|`{selected|token_id}'
				+ ' --register Edit_weapons|Add and remove weapons owned|attk|~~edit-weapons|`{selected|token_id}'
				+ ' --register Edit_armour|Add and remove armour owned|attk|~~edit-armour|`{selected|token_id}';
		sendAPI( cmd );
		return;
	};
	
	var handleNewToken = function(obj,prev) {
		
		if (!obj)
			{return;}
			
		if (obj.get('name') == prev['name'])
		    {return;}
		
		if (obj.get('_subtype') == 'token' && !obj.get('isdrawing')) {
			doCheckAC( [obj.id], findTheGM(), [], true );
		}
		return;
	}

	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('change:graphic:name',handleNewToken);
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