// Github:   https://github.com/Roll20/roll20-api-scripts/tree/master/AttackMaster
// Beta:     https://github.com/DameryDad/roll20-api-scripts/tree/AttackMaster/AttackMaster
// By:       Richard @ Damery
// Contact:  https://app.roll20.net/users/6497708/richard-at-damery

var API_Meta = API_Meta||{}; // eslint-disable-line no-var
API_Meta.AttackMaster={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.AttackMaster.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-8);}}

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
 * v0.1.0 to v2.3.3    For change logs see earlier versions
 * v3.0.0  13/11/2023  Added support for other character sheets. Moved parseData() to library.
 *                     Added magical weapon plus weapon speed configuration option and 
 *                     corrected documentation of possible command options.
 * v3.1.0  01/12/2023  Moved the configuration menu to the library. Added the AD&D1e AR Adjust
 *                     table to the weapons tables to support that rule set version.  Added 
 *                     configuration flags for critical hits/misses and natural 20/1 being 
 *                     automatic hits and misses. Undid use of delTableRow for filtering 
 *                     weapons for now as did not seem to work well. Generalised how insertAmmo()
 *                     works for varied rule-sets. Improved scanForArmour() to support new 
 *                     sheets/tokens better.
 * v3.1.1  17/12 2023  Moved reWeapSpecs & reACSpecs to library to support generalisation of 
 *                     resolveData() and allow inheritance for item and spell DB objects.
 *                     Further improvements to scanForArmour() and doCheckAC().
 * v3.1.2  20/12/2023  Use resolveData() to allow weapons, armour & other equipment & MIs
 *                     to use inheritance. Fix AC calculation display so that AC items all 
 *                     use currently selected damage type. Implemented special message for cursed
 *                     rings. Clarified variable names regards specs vs. data. Implemented 
 *                     double-plus (+:++#) for ranged weapons meaning plus applies to both
 *                     to-hit and dmg calculations (otherwise just affect to-hit). Any weapon,
 *                     even if not currently in-hand, can now be made to "leap from a character's
 *                     equipment" and start dancing using the --dance command.
 * v3.2.0  08/02/2024  Enable weapon type and supertype overrides so that swordType queries can 
 *                     set proficiency correctly. New recharge types 'enable' and 'disable' 
 *                     which are uncharged but allow c: charge comparisons to support enable 
 *                     and disable of weapon attack rows. Reintroduce support for effects on 
 *                     '-inhand' in such a way as not to clash with new dancing weapons type.
 * v3.2.1  11/02/2024  Link weapon tables to InHand table by storing the row number. Use this
 *                     to reveal hidden weapons on an attack if "reveal on use" set. Improve
 *                     parseStr() to handle undefined or empty strings without erroring. Fixed
 *                     ad-hoc dancing weapons.
 * v3.3.0  26/02/2024  Fixed weaponQuery to interrogate hidden items correctly to assess if they
 *                     should be in the list. Add new function to build a save wih a custom target.
 *                     Allow filterWeapons() to filter items other than weapons from tables.
 *                     Improve finding of ammo rows when inserting ammo. Allow recovery of 
 *                     cursed ammo. Fix the "Death" button on the Other-Actions menu. Fixed 
 *                     charged powers for hidden in-hand magic items on attack menu.
 * v3.4.0  27/03/2024  Modified reItemData to accept space or comma after a data section. Fix 
 *                     attack macro build for weapons that don't have a +: tohit attribute
 *                     specified. Fixed weapon proficiency with complex innate weapons and spells
 * v3.4.1  17/05/2024  Corrected default ToHit dice spec in getToHitRoll(). Replaced MIrowref
 *                     lookup with itemIndex in attack commands as may be wrong at time of attack.
 * v3.5.0  26/05/2024  Added table for saving throw modifiers to make them more traceable and 
 *                     explainable, along with the --set-savemod command to add, change and 
 *                     remove mods. Corrected default ToHit dice spec in getToHitRoll(). Replaced 
 *                     MIrowref lookup with itemIndex in attack commands as may be wrong at time 
 *                     of attack. Added ^^distPB^^, ^^distS^^, ^^distM^^,  and ^^distL^^ tags to 
 *                     Ranged Weapon attack macro templates to display range distances. Add an 
 *                     optional fail command to saving throw macros, to support targeted saves 
 *                     provided by RoundMaster. Add automatic saves on natural 20 & fail on 1, 
 *                     switchable as a configuration option
 * v3.5.1  20/09/2024  Fixed the attack menu to support powers of magic items that have powers that
 *                     grant magical attacks when the power is used and held in the hand. Fixed 
 *                     some spurious "Gathering Data" messages.
 * v4.0.1  18/12/2024  Expanded scanForArmour() to also scan for Thac0 and HP mods, and changed 
 *                     its name to scanForModifiers().  Added tokenID to Mods table - if blank
 *                     apply mod to character, else only apply mod to token. Added updateHitDmgBonus()
 *                     to convert character sheets to use new mods table as and when GM desires.
 *                     Code tidying and some utility functions moved to library. Improved error
 *                     handling and type conversion. Made scanForModifiers() asynchronous. New dialog
 *                     for displaying what effects and mods impact thac0, dmg, ac & hp. Added functions
 *                     to auto-populate, display, and explain current rogue skill values. Correct item
 *                     speed assessment to use inheritance via resolveData(). Added doSetMod() function
 *                     and commands to support new extended modifiers functionality.
 * v4.0.2  01/04/2025  (Not an April Fool!) Fixed soft error with Drag & drop NPCs with specialisms or
 *                     fighting styles.
 */
 
var attackMaster = (function() {
	'use strict'; 
	var version = '4.0.2',
		author = 'Richard @ Damery',
		pending = null;
    const lastUpdate = 1738351019;

	/*
	 * Define redirections for functions moved to the RPGMaster library
	 */
		
	const getRPGMap = (...a) => libRPGMaster.getRPGMap(...a);
	const getHandoutIDs = (...a) => libRPGMaster.getHandoutIDs(...a);
	const setAttr = (...a) => libRPGMaster.setAttr(...a);
	const attrLookup = (...a) => libRPGMaster.attrLookup(...a);
	const evalAttr = (...a) => libRPGMaster.evalAttr(...a);
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
	const findThePlayer = (...a) => libRPGMaster.findThePlayer(...a);
	const findCharacter = (...a) => libRPGMaster.findCharacter(...a);
	const fixSenderId = (...a) => libRPGMaster.fixSenderId(...a);
	const getCharacter = (...a) => libRPGMaster.getCharacter(...a);
	const characterLevel = (...a) => libRPGMaster.characterLevel(...a);
	const caster = (...a) => libRPGMaster.caster(...a);
	const getTokenValue = (...a) => libRPGMaster.getTokenValue(...a);
	const classObjects = (...a) => libRPGMaster.classObjects(...a);
	const parseClassDB = (...a) => libRPGMaster.parseClassDB(...a);
	const rogueLevelPoints = (...a) => libRPGMaster.rogueLevelPoints(...a);
	const handleCheckThiefMods = (...a) => libRPGMaster.handleCheckThiefMods(...a);
	const handleCheckSaves = (...a) => libRPGMaster.handleCheckSaves(...a);
	const handleSetNPCAttributes = (...a) => libRPGMaster.handleSetNPCAttributes(...a);
	const scanItemMods = (...a) => libRPGMaster.scanItemMods(...a);
	const redisplayOutput = (...a) => libRPGMaster.redisplayOutput(...a);
	const getMagicList = (...a) => libRPGMaster.getMagicList(...a);
	const getShownType = (...a) => libRPGMaster.getShownType(...a);
	const findPower = (...a) => libRPGMaster.findPower(...a);
	const classAllowedItem = (...a) => libRPGMaster.classAllowedItem(...a);
	const parseStr = (...a) => libRPGMaster.parseStr(...a);
	const parseData = (...a) => libRPGMaster.parseData(...a);
	const resolveData = (...a) => libRPGMaster.resolveData(...a);
	const handleGetBaseThac0 = (...a) => libRPGMaster.handleGetBaseThac0(...a);
	const creatureAttkDefs = (...a) => libRPGMaster.creatureAttkDefs(...a);
	const getSetPlayerConfig = (...a) => libRPGMaster.getSetPlayerConfig(...a);
	const makeConfigMenu = (...a) => libRPGMaster.makeConfigMenu(...a);
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
		menuTemplate:		'RPGMmenu',
		targetTemplate:		'RPGMattack',
		weaponTemplate:		'RPGMweapon',
		warningTemplate:	'RPGMwarning',
		CSweaponTemplate:	'2Eattack',
		ClassDB:			'Class-DB',
		RaceDB:				'Race-DB',
	};

	/*
	 * Define various designs for icons, buttons, etc.
	 */

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
						 version:4.01,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">AttackMaster Help v4.01</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Attack Master API v'+version+'</h1>'
							+'<h4>and later</h4>'
							+'<br>'
							+'<h3><span style='+design.selected_button+'>New:</span> in this Help Handout</h3>'
							+'<p><span style='+design.selected_button+'>New:</span> Optional automatic calculation and update of Rogue skills</p>'
							+'<p><span style='+design.selected_button+'>New:</span> Universal mods character sheet table</p>'
							+'<p><span style='+design.selected_button+'>New:</span> --set-mod command to add, change and remove saving throw, AC, Thac0 & HP mods</p>'
							+'<p><span style='+design.selected_button+'>New:</span> --set-mod-priority command to set best selected mods to be saving throw, AC, Thac0 or HP mods</p>'
							+'<p><span style='+design.selected_button+'>New:</span> --check-mods & --check-thieving commands to update these tables automatically</p>'

							+'<p>AttackMaster API provides functions to manage weapons, armour & shields, including taking weapons in hand and using them to attack.  It uses rules (defined in the <b>RPGMaster Library</b>) to the full extent, taking into account: ranged weapon ammo management with ranges varying appropriately and range penalties/bonuses applied; Strength & Dexterity bonuses where appropriate; any magic bonuses to attacks that are in effect (if used with <b>RoundMaster API</b> effects); penalties & bonuses for non-proficiency, proficiency, specialisation & mastery; penalties for non-Rangers attacking with two weapons; use of 1-handed, 2-handed or many-handed weapons and restrictions on the number of weapons & shields that can be held at the same time; support for <i>Fighting Styles</i> as defined in <i>The Complete Fighter\'s Handbook;</i> plus many other features.  This API works best with the databases provided with the RPGMaster series APIs (or added by yourself in custom databases), which hold the data for automatic definition of weapons and armour.  However, some attack commands will generally work with manual entry of weapons onto the character sheet.  The <b>CommandMaster API</b> can be used by the GM to easily manage weapon proficiencies.</p>'
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
							+'[General API Help]'
							+'<h2>How To Use AttackMaster</h2>'
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

							+'<h3><span style='+design.selected_button+'>New:</span> Adjustments to Attack Calculations</h3>'
							+'<p>The APIs automatically calculate the Thac0 they expect a particular character or creature to have. If the Thac0 is also allocated to a Token Circle, the calculated expected Thac0 will be compared to that set on the Token and any differences highlighted by showing a "Thac0 Bar" on the Token. This difference may be due to current magical effects or other circumstantial aspects (the token circle can be altered manually by the player or GM at any time). The difference is highlighted so that the player and GM can investigate the difference.</p>'
							+'<p>When combined with the RPGM MagicMaster and RoundMaster APIs, magical effects of spells and magic items can automatically adjust the calculated expected Thac0 depending on the properties of the spell or item, such as spells like <i>Prayer</i> or magic items like a <i>Luck Stone</i>. To date, these effects have been hidden in the attack calculations. In order to see an explanation of how these modifiers are calculated, and for the GM to manually adjust these modifiers, the AttackMaster API now provides a dialog under the <i>Attk Menu > Check Thac0 & HP Mods</i> action button menu option for each token, or via the <b>!attk --check-mods <tokenID></b> command. This dialog also allows the player to select whether to prioritise the best AC, Thac0 (to-hit likelihood), Damage or HP when selecting which magical effects to apply when conflicts arrise.</p>'

							+'<h3>Ammunition</h3>'
							+'<p>The system handles both Ranged weapons that take ammunition, such as bows and slings, and also "self-ammoed" Ranged weapons like daggers, that can be thrown at a target.  The quantity of ammunition or self-ammoed weapons is managed by the system: as they are used in attacks, the quantity in the Characters Item table decreases.  A menu can be called to recover ammunition, in agreement with the DM - the same menu can be used to add or remove quantities of ammunition for other reasons (such as being purchased).  Some types of ammo always breaks and can\'t be recovered (for example glass arrows) - this is charged ammo.</p>'
							+'<h3>Ranged weapon and ammunition ranges</h3>'
							+'<p>Each type of ammunition has a range with the weapon used to fire it.  These ranges can be different for different types of weapon - thus a longbow can fire an flight arrow further than a short bow, and a sheaf arrow has different ranges than the flight arrow with each.  The ranges that can be achieved by the weapon and ammunition combination are displayed when they are used in an attack, and the Player is asked to select which range to use, which then applies the correct range modifier to the attack roll.</p>'
							+'<h3>Dancing weapons</h3>'
							+'<p>The system can support any weapon becoming a dancing weapon, with qualities that can be the same as or different from a Sword of Dancing.  In the system a dancing weapon does not have to be held in hand in order for it to be available for attacks and, if using the <b>InitiativeMaster API</b>, the weapon is also automatically added to the Turn Order Tracker for its attacks to be performed in battle sequence.  All of this can be achieved automatically if used with the <b>RoundMaster API</b>, with durations of \'warm up\' and \'dancing\' dealt with, as well as magical properties changing as the rounds progress - that function requires some editing of the Effects database to adapt for a particular weapon - see the RoundMaster API Effect Database documentation for details.</p>'
							+'<h3>Fighting Styles</h3>'
							+'<p><i>The Complete Fighter\'s Handbook</i> introduced the concept of Fighters being able to become proficient or a specialist in various styles of fighting, such as with two-handed melee weapons, a weapon and a shield, and such like. These are supported in the RPGMaster APIs via the <b>Styles-DB</b> database, and functions in the <b>CommandMaster API, InitiativeMaster API</b> as well as here in AttackMaster.  Each time weapons & shields in-hand are changed using the <i>Attack Menu / Change Weapons</i> menu, AttackMaster checks what is in-hand against any Fighting Styles the character is proficient or specialised in (as defined via the <b>CommandMaster</b> <i>Token-Setup / Set Proficiencies</i> menu). If any are applicable given what is currently in use, AttackMaster will apply the relevant fighting style benefits to the character and their use of their weapons and armour. The APIs are distributed with rules defined for the four styles defined in <i>The Complete Fighter\'s Handbook</i>, and DMs and game authors can add their own as desired. See the <b>Styles Database Help</b> handout for more information.</p>'
							+'<h3>Armour Class management</h3>'
							+'<p>The system continually checks the Armour Class of each Character / NPC / creature by examining the information on the Character Sheet and the items in the Item table.  Armour and Shields can be placed in the Items table which will be discovered, and the specifications from the Armour database used to calculate the appropriate AC under various conditions and display them to the Player.  The process the system made to achieve the calculated AC will be shown.</p>'
							+'<p>Many magic items have AC qualities, such as Bracers of Defence and Rings of Protection, and if the <b>MagicMaster API</b> is used these are also taken into account - invalid combinations will also be prevented, such as Rings of Protection with magical armour.  If allocated to a Token Circle, the calculated AC is compared to the displayed Token AC and any difference highlighted - this may be due to magical effects currently in place, for instance - the highlight allows the Player to review why this might be.</p>'
							+'<p><span style='+design.selected_button+'>New:</span> When combined with the RPGM MagicMaster and RoundMaster APIs, magical effects of spells and magic items can automatically adjust armour class depending on the properties of the spell or item and these modifications can be viewed in the <i>Attk Menu > Check AC</i> dialog or via the <b>!attk --checkac <tokenID></b> command.</p>'
							+'<h3>Saves</h3>'
							+'<p>The corollary to attacks is saves.  The system provides two menus: one to access, review, update and make saving throws and the appropriate modifiers; and the other to make attribute checks, again with the appropriate modifiers.</p>'
							+'<p>For each menu, the initial menu presented shows the saving throw and attribute tables from the Character Sheet (always the one from the Character tab rather than the Monster Tab - monster saving throws should be copied to both).  Each type of save or attribute check has a button to make the saving throw: the system (or the player - see below) will perform the roll and display the result with an indication of success or failure.  The menu also shows buttons to add a situational adjustment (as per the AD&D 2e PHB) and to modify the saving throw table, either automatically (taking into account race, class, level and magic items) or manually.</p>'
							+'<p>You can change the way the roll is made using the <i>[PC Rolls]</i> and <i>[You Roll]</i> buttons at the bottom of the saving throw and attribute check menus. If <i>[You Roll]</i> is selected, the player will be presented with a Roll20 Roll Query to enter the result of the roll (though just submitting the dice specification displayed will roll the dice). The option chosen is remembered between game sessions within that campaign.</p>'
							+'<p>The easiest way to set the correct saving throws for each type of save, based on class, level & race, is to use the <b>CommandMaster API</b> Character Sheet setup commands.</p>'
							+'<p><span style='+design.selected_button+'>New:</span> When combined with the RPGM MagicMaster and RoundMaster APIs, magical effects of spells and magic items can automatically adjust saving throws depending on the properties of the spell or item, and these adjustments can be seen on the <i>Other Menu > Saving Throws > Auto-check Saving Throws</i> dialog.</p>'
							+'<h3>Rogue Skill Checks</h3>'
							+'<p>In a similar way to <i>saves</i> and <i>attribute checks</i>, it is possible to make checks against Rogue skills, such as picking pockets and climbing walls. The initial dialog presented shows a button for each possible check that can be made, and a current target percentage to roll below for success. Clicking any of the buttons will make the named check. <u><b>However:</b></u> Some of the checks should be made by the GM. The GM can set a configuration item to allow players to make all checks <i>or for the results of certain checks to only go to the GM.</i> If a check only displays the result to the GM, the players will receive a message to this effect.</p>'
							+'<p>Rolls will either be made automatically or once the player enters a dice roll result (see below). Each result, wherever it is displayed, will also describe how it was calculated and what the implications of the result are for the character. The GM can configure a <i>critical success</i> factor to be 5%, 1% or not allowed (see <b>--config</b> command), which will be taken into account in the calculation. If the natural dice roll achieves a critical success, the skill check will automatically succeed, even for characters who would not normally get any chance of success.</p>'
							+'<p>An additional button is provided on the initial dialog to add a <i>situational modifier</i> with various types listed, or just a general value. Select the appropriate modifier and enter any value prompted for. Any entered modifier will apply to only the next skill check roll, and will apply to any roll made regardless of appropriateness.</p>'
							+'<p>Another button, <i>[Manually Update]</i>, will allow the player to check & modify the elements that go to make up each skill check.</p>'
							
							+'<p><span style='+design.selected_button+'>New:</span> A button is also provided to automatically check and update the Rogue Skills values based on the Class, Race, Dexterity, Armour worn and any magical effects in play for the selected token.  This can be used for any character, NPC or creature even if not of a Rogue class. If the <i>Auto-check Skill Scores</i> button is selected, Rogue skills will be continually updated as required, ensuring changes to characteristics such as armour and magical items are continuously taken into account. If the <i>Manually Check</i> button is selected, this will not happen and manually entered values will be preserved.</p>'
							
							+'<p>Finally, as for saving throws and attribute checks, buttons are provided for <i>[PC Rolls]</i> and <i>[You Roll]</i> which have the same effects of allowing an automatic roll to take place or for the player to make each roll.</p>'
							+'<p><b>Note:</b> There are additional commands provided in the <i>MagicMaster API</i> to find traps and to loot containers or other creatures which will prompt "find traps", "remove traps" and "pick pockets" rolls as required. If using these functions on <i>Drag & Drop</i> creatures and containers, the appropriate processes and checks will occur (including asking the GM to make checks as appropriate if the GM has set that RPGMaster configuration) without having to use this dialog.</p>'
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
							+'<h3>5. Armour Class, Saving Throws and Skill Checks</h3>'
							+'<pre>--edit-armour [token_id]<br>'
							+'--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]<br>'
							+'--save [token_id] | [situation-mod]<br>'
							+'--build-save [token_id] | save-type | save-value | [macro-name]<br>'
							+'--attr-check [token_id] | [situation-mod] | [message] | [DCval]<br>'
							+'<span style='+design.selected_button+'>New:</span> --set-mods [token_id]|cmd|name|spell|mod_spec|[mod_count]|[round_count]<br>'
							+'<span style='+design.selected_button+'>New:</span> --set-mod-priority [token_id]|mod_type[|disp_menu]<br>'
							+'<span style='+design.selected_button+'>New:</span> --check-mods [token_id]|[QUIET/SILENT]<br>'
							+'--set-savemod [token_id]|cmd|name|spell|save_spec|[save_count]|[round_count]|[fail_cmd]<br>'
							+'--savemod-count [token_id]|[+/-]count<br>'
							+'--theive [token_id]<br>'
							+'<span style='+design.selected_button+'>New:</span> --check-thieving [token_id]|[SILENT]<br>'
							+'--set-thieving [token_id]</pre>'
							+'<h3>6. Other Commands</h3>'
							+'<pre>--help<br>'
							+'--config [PROF/ALL-WEAPS/WEAP-CLASS/ALL-ARMOUR/MASTER-RANGE/DM-TARGET] | [TRUE/FALSE]<br>'
							+'--check-db [ db-name ]<br>'
							+'--extract-db db-name<br>'
							+'--handshake from | [cmd]<br>'
							+'--hsq from | [cmd]<br>'
							+'--hsr from | [cmd] | [TRUE/FALSE]<br>'
							+'--debug [ ON / OFF ]</pre>'
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
							+'<p>Displays a Chat menu with buttons for: saving throws and saving throw management; ability checks; rogue skill checks; managing character classes and levels (if the <b>CommandMaster API</b> is loaded) and managing light sources for the character\'s token (if Dynamic Lighting is being used) (requires <b>MagicMaster API</b> to work).  If the GM uses the menu, two further options appear: mark the token selected as Dead (which also marks the body as an inanimate object that can be looted); and the ability to adjust damage for the selected token for any arbitrary reason, which can also be noted.</p>'
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
							+'	<tr><th scope="row">Character</th><td>?</td><td>[</td><td>]</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td><td>(</td><td>)</td></tr>'
							+'	<tr><th scope="row">Substitute</th><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td>`</td><td>~</td><td>¦</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td><td>&amp;#40;</td><td>&amp;#41;</td></tr>'
							+'	<tr><th scope="row">Alternative</th><td>\\ques;</td><td>\\lbrak;</td><td>\\rbrak;</td><td>\\at;</td><td>\\dash;</td><td>\\vbar;</td><td>\\clon;</td><td>\\amp;</td><td>\\lbrc;</td><td>\\rbrc;</td><td>\\lpar;</td><td>\\rpar;</td></tr>'
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
							+'<pre>!attk --setammo @{selected|token_id}|Flight-Arrow+1|=|10|silent</pre>'
							+'<p>If the "Silent" parameter is not specified, then the Ammunition Recovery chat menu will display with the amended values once complete, and a message is displayed with the changes that occurred.</p>'
							+'<p><b>Note:</b> if more than one ammo item of the same name is listed in the items table (see [RPGMaster CharSheet Setup] handout), only the first item found will be amended.  If no item of that name is found, nothing happens and no menus or messages are displayed.</p>'
							+'<br>'
							+'<h2>5. Armour Class, Saving Throws and Skill Checks</h2>'
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
							+'<h3>5.4 Build Custom Save</h3>'
							+'<pre>--build-save [token_id] | save-type | save-value | [macro-name]</pre>'
							+'<p>Takes an optional token ID (if not specified uses selected token), a type of save (which can be anything and not restricted to standard save types), not sensitive to case), the value to exceed to succeed the save, and an optional name for the macro to build on the character sheet.</p>'
							+'<p>This command builds an ability macro on the character sheet represented by the supplied or selected token. The macro will be to make the named saving throw (the name has no significance) and the specified value to exceed with a d20 dice roll for the represented character to succeed in making the saving throw. The character sheet ability macro will be named using either the provided macro-name, which if not provided will default to <i>Do-not-use-</i>save-type<i>-save</i>. The saving throw can then simply be run using the chat window command <b>%{character-name|macro-name}</b>.</p>'
							+'<h3>5.5 Attribute Checks</h3>'
							+'<pre>--attr-check [token_id] | [situation-mod] | [message] | [DCval]</pre>'
							+'<p>Takes an optional token ID (defaults to the selected token), an optional situational modifier, an optional message to display as the last action, and an optional "DC value".</p>'
							+'<p>This command presents a menu which can be used to perform attribute checks for the character. The menu displays the character\'s attribute values and the currently applicable modifiers for attribute checks. Each line has a button which will run the Attribute Check roll and display success or failure. As for the Saving Throw table, buttons also exist to set a situational modifier and to check the modifiers against current magic items in use and magic in effect.</p>'
							+'<p>A DC value parameter is provided to emulate attribute check modifiers for D&D 3e and later, though as these checks and modifiers work very differently this is not a direct equivalence. If a DC value is set as a parameter, 10 minus the DC value is added to all the modifiers.</p>'
							
							+'<h3>5.6 <span style='+design.selected_button+'>New:</span> Set AC / Thac0 / Damage / HP Modifiers</h3>'
							+'<pre>--set-mods [token_id]|cmd|name|spell/item|mod_spec|(unused)|[round_count]|[VERBOSE / SILENT]</pre>'
							+'<p>Takes an optional token ID (defaults to the selected token), a mandatory command, a mandatory mod name, a mandatory spell or item name, a mandaroty modifier specification, an optional number of rounds duration, and an optional verbose or silent specifier (defaults to silent).</p>'
							+'<p>Adds, modifies or deletes one or any number of named AC, thac0, damage or HP modifiers that can apply to a limited number of rounds, or just continue indefinately until cancelled.</p>'
							+'<p>The <i>cmd</i> can be one of ADD, DEL, DELSPELL, or DELALL. The <i>mod-spec</i> defines the checks that are affected by the modification - multiple check types can be specified, as mods or overrides. The format is:</p>'
							+'<table>'
								+'<tr><th>+:[=][+/-]#<br>or<br>ac+:[=][+/-]#</th><td>The effect on armour class bonus, + being beneficial and - being a penalty</td></tr>'
								+'<tr><th>thac0+:[=][+/-]#</th><td>The effect on Thac0, + being beneficial and - being a penalty</td></tr>'
								+'<tr><th>dmg+:[=][+/-]#</th><td>The effect on the damage bonus, + being beneficial and - being a penalty</td></tr>'
								+'<tr><th>hp+:[=][+/-]#</th><td>Temporary HP, when ends returns to minimum of starting current HP and ending current HP, + being beneficial and - being a penalty</td></tr>'
								+'<tr><th>hpt+:[=][+/-]#</th><td>Temporary HP, when ends substracted from ending current HP (even to below 0), + being beneficial and - being a penalty</td></tr>'
								+'<tr><th>hpp+:[=][+/-]#</th><td>Semi-permanent HP, when ends returns to minimum of ending current HP and starting maximum HP, + being beneficial and - being a penalty</td></tr>'
							+'</table>'

							+'<h3><span style='+design.selected_button+'>New:</span> 5.7 Set Modifier Priorities</h3>'
							+'<pre>--set-mod-priority [token_id]|mod_type[|CHECKAC / CHECKMODS]</pre>'
							+'<p>Takes an optional token_id (defaults to selected token), a mandatory modifier type specifier, and an optional menu type to display.</p>'
							+'<p>Defines which type of modifier takes priority when automatically assessed. This is relevant when more than one item owned and carried by a character of the same type (e.g. two worn rings, or two miscellaneous items, or similar) have two conflicting effects. The API can be requested to prioritise and take into account mods that favour the best outcome for armour class (AC+), Thac0 (thac0+), Damage (dam+), or HP (hp+). If no conflicts exist, all possible modification effects will be optimised.</p>'
							
							+'<h3>5.8 Set Save Modifiers</h3>'
							+'<pre>--set-savemod [token_id]|cmd|name|spell/item|mod_spec|[mod_count]|[round_count]|[fail_cmd]</pre>'
							+'<p>Takes an optional token ID (defaults to the selected token), a mandatory command, a mandatory mod name, a mandatory spell or item name, a mandaroty save modifier specification, an optional number of saving throw checks, an optional number of rounds duration, and an optional command to execute on saving throw failure.</p>'
							+'<p>Adds, modifies or deletes one or any number of named saving throw or attribute checks that can apply to a specified number of throws and/or a limited number of rounds, or just continue indefinately until cancelled. A command can also be specified to enact if the throw or check fails (saving throws and attribute checks only).</p>'
							+'<p>The <i>cmd</i> can be one of ADD, DEL, DELSPELL, DELALL, or a bespoke command type of YYY=XXX (saving throw mods only), where XXX is the 3-letter short form specifying a type of existing base mod type (par, poi, dea, rod, sta, wan, pet, pol, bre, or spe), and YYY is a new 3-letter specification for the named modifier. This bespoke saving throw type will be based on the base type specified, modified by the save-spec. A button will be added to the creature\'s saving throw table, allowing bespoke saves to be made by the creature. E.g. a <i>Bless</i> spell provides an improved save vs. Fear effects so the spell adds a \'Fear\' button to the saving throw table of each creature Blessed for the duration of the spell.</p>'
							+'<p>The <i>mod-spec</i> defines the checks that are affected by the modification - multiple saving throw, attribute and other check types can be specified, as mods or overrides. The format is:</p>'
							+'<table>'
								+'<tr><th>svXXX:[=][+/-]#</th><td>The effect on various saving throws or attribute checks, specified by XXX, + being beneficial and - being a penalty</td></tr>'
								+'<tr><th>YYY=XXX</th><td>XXX is as above, and YYY is any 3-letter specification (cannot be anything XXX can be)</td></tr>'
								+'<tr><th>XXX</th><td>This can be \'par\', \'poi\', \'dea\', \'rod\', \'sta\', \'wan\', \'pet\', \'pol\', \'bre\', or \'spe\' (or the bespoke 3-letter code) for saves, or \'str\', \'con\', \'dex\', \'int\', \'wis\', or \'chr\' for attributes, or \'sav\' for all saves, \'atr\' for all attributes, or \'all\' for everything</td></tr>'
							+'</table>'

							+'<h3>5.9 Increment/Decrement Save Count</h3>'
							+'<pre>--savemod-count [token_id]|[+/-]count</pre>'
							+'<p>Takes an optional token ID (defaults to the selected token), and a mandatory count preceeded by an optional + or -.</p>'
							+'<p>Saving throw and attribute check modifiers which have durations set using the <i>-set-savemod</i> command have their duration in rounds decremented as the round number increments (requires use of the RoundMaster and InitMaster APIs and the Turn Order tracker, or use of the InitMaster <i>--maint</i> command). The duration in throws/checks reduces as throws/checks are made. However, the number of throws/checks can also be changed using this command. All mods that have a current mod_count specified using the --set-mods or --set-savemod command will have their mod_count impacted by use of this command</p>'

							+'<h3><span style='+design.selected_button+'>New:</span> 5.10 Check Current Modifiers</h3>'
							+'<pre>--check-mods [token_id]|[SILENT / QUIET]</pre>'
							+'<p>Takes an optional token ID (defaults to the selected token), and an optional response qualifier.</p>'
							+'<p>Initiates a check of all possible modifiers currently in effect to set the current AC, Thac0, Damage bonus and current / maximum HP for the specified token. If defined as QUIET will not display any feedback, or if SILENT will only display if there is a change in Thac0.</p>'

							+'<h3>5.11 Make a Rogue Skill Check</h3>'
							+'<pre>--theive [token_id]<br>'
							+'--set-thieving [token_id]</pre>'
							+'<p>Each takes an optional token ID (if not specified uses selected token).'
							+'<p><b>Note:</b> this dialog may best be used by the GM for many of the included rogue skill checks. Check with your GM for the approapriate approach.</p>'
							+'<p>This command provides an alternative route to making a rogue skill check, rather than using the facilities provided on the character sheet. It works in a very similar way to the Attribute Check dialog (see above). Clicking any of the skill buttons will run an appropriate macro to make the check. Alternatively, you can use the dialog to view the required target and roll your own dice.</p>'
							+'<p>The dialog also provides a button to set a modifier to the roll, which might be required by the specific situation the character finds themself in. This modifier will be temporary, only being in effect for the next skill check.</p>'
							+'<p>A button at the bottom of the dialog provides access to another dialog to maintain the rogue skills table on the character sheet (also accessed via the <i>--set-thieving</i> command). Select any of the numbers in the table to change it. The number of "points" usable at the rogue\'s level is automatically maintained and the points used in the table are calculated and checked against the allowed number. <b>Note:</b> this is a very wide dialog (as the table is wide) and it is advised to drag the chat window edge to temporarily make it wider and, when finished, return the chat window to your desired width.</p>'

							+'<h3><span style='+design.selected_button+'>New:</span> 5.12 Check Current Rogue Skills</h3>'
							+'<pre>--check-thieving [token_id]|[SILENT]</pre>'
							+'<p>Takes an optional token ID (defaults to the selected token), and an optional response qualifier.</p>'
							+'<p>Initiates a check of the factors affecting rogue skills for the specified token, such as current class, race, dexterity, armour worn and magical effects. If not SILENT, will then display a dialoge in which the player can set the additional points due to level, with the remaining allowed unallocated points calculated and displayed.</p>'

							+'<br>'
							+'<h2>6.Other commands</h2>'
							+'<h3>6.1 Display help on these commands</h3>'
							+'<pre>--help</pre>'
							+'<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>'
							+'<h3>6.2 Configure API behavior</h3>'
							+'<pre>--config [PROF/ALL-WEAPS/WEAP-CLASS/WEAP-PLUS/ALL-ARMOUR/MASTER-RANGE/DM-TARGET] | [TRUE/FALSE]</pre>'
							+'<p>Takes two optional arguments, the first a switchable flag name, and the second TRUE or FALSE.</p>'
							+'<p>Allows configuration of several API behaviors.  If no arguments given, displays menu for DM to select configuration.  Parameters have the following effects:</p>'
							+'<table>'
							+'	<thead><tr><th>Flag</th><th>True</th><th>False</th></tr></thead>'
							+'  <tr><th scope="row">FANCY-MENUS</th><td>Chat templates will use textured backgrounds</td><td>Chat templates will use plain backgrounds</td></tr>'
							+'	<tr><th scope="row">PROF</th><td>Strictly apply non-proficient weapon penalties as per PHB</td><td>Use the non-proficient weapon penalty displayed on the Character Sheet</td></tr>'
							+'	<tr><th scope="row">ALL-WEAPS</th><td>Allow any character of any class to use and become proficient in any weapon.</td><td>Restrict the use of weapons by class to some degree set by WEAP-CLASS</td></tr>'
							+'	<tr><th scope="row">WEAP-CLASS</th><td>Weapons not allowed to a class get a penalty of -100</td><td>Weapons not allowed to a class get double non-proficient penalty</td></tr>'
							+'	<tr><th scope="row">WEAP-PLUS</th><td>Magical weapons gain a bonus to weapon speed</td><td>Magical weapon plusses do not affect weapon speed</td></tr>'
							+'	<tr><th scope="row">ALL-ARMOUR</th><td>All armour types allowed for all classes</td><td>Armour not allowed to a class not included in AC calculations</td></tr>'
							+'	<tr><th scope="row">MASTER-RANGE</th><td>Ranged weapon Mastery gives double damage at Point Blank range</td><td>Ranged weapon Mastery not allowed, as per PHB</td></tr>'
							+'	<tr><th scope="row">DM-TARGET</th><td>Only the DM can do Targeted Attacks</td><td>All players can use Targeted Attacks</td></tr>'
							+'	<tr><th scope="row">ROGUE-CRIT</th><td>Strict rogue skill checks</td><td>Some level of critical success can apply</td></tr>'
							+'	<tr><th scope="row">ROGUE-CRIT-VAL</th><td>If allowed rogue skill critical success is 1%</td><td>If allowed rogue skill critical success is 5%</td></tr>'
							+'	<tr><th scope="row">GM-ROLLS</th><td>GM makes/sees relevant skill checks</td><td>Player makes/sees relevant skill checks</td></tr>'
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
	var reClassSpecs;
	var reSpellSpecs;
	var reWeapSpecs;
	var reACSpecs;
	var reThiefSpecs;
	var reModSpecs;
	var spellLevels;
	var classLevels;
	var rangedWeapMods;
	var saveLevels;
	var baseSaves;
	var classSaveMods;
	var raceSaveMods;
	var saveFormat;
	var rogueSkills;
	var rogueDexMods;
	var thiefSkillFactors;
	var defaultNonProfPenalty;
	var classNonProfPenalty;
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
        cursedItem: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try putting this away, but it seems to be back where it was...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		PleaseWait: '**Please wait...** - processing is taking a while',
		noneLeft: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Whoops! It seems you have none of these left... Recover some you\'ve used or buy some more.}}',
		targetAttkDisabled: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nWeapons}}{{desc=The DM has not enabled targeted attacks for players.}}',
		cursedWeapon: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try changing weapon, but the previous weapon seems to be back in your hand...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
		cursedRing: '&{template:'+fields.warningTemplate+'}{{name=^^cname^^\'s\nMagic Item Bag}}{{desc=Oh no!  You try changing rings, but the previous ring seems to be back on your finger...  Perhaps you need a *Remove Curse* spell or equivalent to be rid of it!}}',
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
	
	const SkillRoll = Object.freeze({
		PCROLLS: 'PCROLLS',
		YOUROLL: 'YOUROLL',
	});
	
	const BT = Object.freeze({
		MON_ATTACK: 			'MON_ATTACK',
		MON_INNATE: 			'MON_INNATE',
		MON_MELEE:  			'MON_MELEE',
		BACKSTAB:   			'BACKSTAB',
		MELEE:      			'MELEE',
		MW_DMGSM:   			'MW_DMGSM',
		MW_DMGL:    			'MW_DMGL',
		MON_RANGED: 			'MON_RANGED',
		RANGED:     			'RANGED',
		RANGEMOD:   			'RANGEMOD',
		RW_DMGSM:   			'RW_DMGSM',
		RW_DMGL:    			'RW_DMGL',
		MU_SPELL:   			'MU_SPELL',
		PR_SPELL:   			'PR_SPELL',
		POWER:      			'POWER',
		MI_BAG:     			'MI_BAG',
		MI_POWER_USED:			'MI_POWER_USED',
		MI_POWER_CHARGE_USED:	'MI_POWER_CHARGE_USED',
		ADD_MIROW:				'ADD_MIROW',
		EDIT_MI:				'EDIT_MI',
		EDITMI_OPTION:			'EDITMI_OPTION',	
		CHOOSE_MI:				'CHOOSE_MI',
		REDO_CHOOSE_MI:			'REDO_CHOOSE_MI',
		REVIEW_MI:				'REVIEW_MI',
		SLOT_MI:				'SLOT_MI',
		STORE_MI:				'STORE_MI',
		REMOVE_MI:				'REMOVE_MI',
		THIEF:      			'THIEF',
		MOVE:       			'MOVE',
		CHG_WEAP:   			'CHG_WEAP',
		STAND:      			'STAND',
		SPECIFY:    			'SPECIFY',
		CARRY:      			'CARRY',
		SUBMIT:     			'SUBMIT',
		RIGHT:					'PRIMARY',
		LEFT:					'OFFHAND',
		BOTH:					'BOTH',
		HAND:					'HAND',
		CS_RIGHT:				'CS_PRIMARY',
		CS_LEFT:				'CS_OFFHAND',
		CS_BOTH:				'CS_BOTH',
		CS_HAND:				'CS_HAND',
		RIGHT_NOCURSE:			'PRIMARY-NOCURSE',
		LEFT_NOCURSE:			'OFFHAND-NOCURSE',
		BOTH_NOCURSE:			'BOTH-NOCURSE',
		HAND_NOCURSE:			'HAND-NOCURSE',
		LEFTRING:				'LEFTRING',
		RIGHTRING:				'RIGHTRING',
		LEFTRING_NOCURSE:		'LEFTRING-NOCURSE',
		RIGHTRING_NOCURSE:		'RIGHTRING-NOCURSE',
		NOHANDS:				'NOHANDS',
		AUTO_ADD:				'AUTO_ADD',
		AUTO_DELETE:			'AUTO_DELETE',
		AMMO:					'AMMO',
		SAVES:					'SAVES',
		CHECK_SAVES:			'CHECK_SAVES',
		ATTR_CHECK:				'ATTR_CHECK',
		SET_SKILL_ROLL:			'SET_SKILL_ROLL',
		SET_SAVE_ROLL:			'SET_SAVE_ROLL',
		SET_ATTR_ROLL:			'SET_ATTR_ROLL',
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
			[/\\comma;?/g, ","],
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
	const reDiceRollSpec = /(?:^\d+$|\d+d\d+)/i;
	const reWeapon = /}}\s*specs=\s*?(\[.*?(?:melee|ranged|magic).*?\])\s*?{{/im;
	const reWeapData = /weapdata\s*?=\s*?(\[.*?\])/im;
	const reToHitData = /}}\s*ToHitData\s*=(.*?){{/im;
	const reDmgData = /}}\s*DmgData\s*=(.*?){{/im;
	const reAmmoData = /}}\s*?ammodata\s*?=.*?(?:\n.*?)*{{/im;
	const reRangeData = /}}\s*?rangedata\s*?=.*?(?:\n.*?)*{{/im;
	const reACData = /}}\s*acdata\s*=(.*?){{/im;
	const reRingData = /(?:ring|ac)data\s*?=\s*?(\[.*?\])/im;
	const reItemData = /}}[\s\w\-]*?(?<!tohit|dmg|ammo|range)data\s*?=\s*?\[.*?\][\s,]*?{{/im;
	const reSpecsAll = /\[\s*?(\w[-\+\s\w\|]*?)\s*?,\s*?(\w[-\+\s\w\|]*?\w)\s*?,\s*?(\w[\s\w\|]*?\w)\s*?,\s*?(\w[-\+\s\w\|]*?\w)\s*?(?:,\s*?(\w[-\+\s\w\|]*?\w)\s*?)?\]/g;
	const reDataAll = /\[.*?\]/g;
	const reRaceData = /}}\s*?RaceData\s*?=.*?{{/im;
	
	const reRangeMods = Object.freeze ({
		near:		{field:'N',def:'-5',re:/[\[,\s]N:([-\+\d]+?)[,\]]/i},
		pointblank:	{field:'PB',def:'2',re:/[\[,\s]PB:([-\+\d]+?)[,\]]/i},
		short:		{field:'S',def:'0',re:/[\[,\s]S:([-\+\d]+?)[,\]]/i},
		medium:		{field:'M',def:'-2',re:/[\[,\s]M:([-\+\d]+?)[,\]]/i},
		long:		{field:'L',def:'-5',re:/[\[,\s]L:([-\+\d]+?)[,\]]/i},
		far:		{field:'F',def:'-20',re:/[\[,\s]F:([-\+\d]+?)[,\]]/i},
	});
	
	const reStyleData = Object.freeze ({
		prime:		{field:'prime',def:'',re:/[\[,\s]prime:([\s\w\-\+\|\!]+?)[,\s\]]/i},
		offhand:	{field:'offhand',def:'',re:/[\[,\s]offhand:([\s\w\-\+\|\!]+?)[,\s\]]/i},
		twohand:	{field:'twohand',def:'',re:/[\[,\s]twohand:([\s\w\-\+\|\!]+?)[,\s\]]/i},
		weaps:		{field:'weaps',def:'any',re:/[\[,\s]weaps:([\s\w\-\+\|\!]+?)[,\s\]]/i},
		ac:			{field:'ac',def:'0',re:/[\[,\s]ac:([-+]?[\d]+?)[,\s\]]/i},
		oneh:		{field:'oneh',def:'',re:/[\[,\s]1H:(.+?)[,\s\]]/i},
		twoh:		{field:'twoh',def:'',re:/[\[,\s]2H:(.+?)[,\s\]]/i},
		shattk:		{field:'shattk',def:'0',re:/[\[,\s]shattk:([-\+]?[\d]+?)[,\s\]]/i},
		twp:		{field:'twp',def:'2.4',re:/[\[,\s]twp:(\d\.\d)[,\s\]]/i},
		mwsp:		{field:'mwsp',def:'0',re:/[\[,\s]mwsp:([-+]?\d+?)[,\s\]]/i},
		rwsp:		{field:'rwsp',def:'0',re:/[\[,\s]rwsp:([-+]?\d+?)[,\s\]]/i},
		mwn:		{field:'mwn',def:'0',re:/[\[,\s]mwn:([+-]?[\d.\/]+)[,\s\]]/i},
		rwn:		{field:'rwn',def:'0',re:/[\[,\s]rwn:([+-]?[\d.\/]+)[,\s\]]/i},
		mwadj:		{field:'mwadj',def:'0',re:/[\[,\s]mwadj:([-+]?\d+?)[,\s\]]/i},
		rwadj:		{field:'rwadj',def:'0',re:/[\[,\s]rwadj:([-+]?\d+?)[,\s\]]/i},
		mwch:		{field:'mwch',def:'20',re:/[\[,\s]mwch:(\d+?)[,\s\]]/i},
		rwch:		{field:'rwch',def:'20',re:/[\[,\s]rwch:(\d+?)[,\s\]]/i},
		mwcm:		{field:'mwcm',def:'1',re:/[\[,\s]mwcm:(\d+?)[,\s\]]/i},
		rwcm:		{field:'rwcm',def:'1',re:/[\[,\s]rwcm:(\d+?)[,\s\]]/i},
		rwr:		{field:'rwr',def:'',re:/[\[,\s]rwr:(=?[+-]?[\s\w\+\-\d\/]+)[,\s\]]/i},
		rwrm:		{field:'rwrm',def:'0',re:/[\[,\s]rwrm:(=?[+-]?[\s\w\+\-\d\/]+)[,\s\]]/i},
		dmg:		{field:'dmg',def:'0',re:/[\[,\s]dmg:([-\+]?\d+?)[,\s\]]/i},
		dmgsm:		{field:'dmgsm',def:'0',re:/[\[,\s]dmgsm:([-+]?\d+?)[,\s\]]/i},
		dmgl:		{field:'dmgl',def:'0',re:/[\[,\s]dmgl:([-+]?\d+?)[,\s\]]/i},
		ammoadj:	{field:'ammoadj',def:'0',re:/[\[,\s]ammoadj:([-+]?\d+?)[,\s\]]/i},
		ammosm:		{field:'ammosm',def:'0',re:/[\[,\s]ammosm:([-+]?\d+?)[,\s\]]/i},
		ammol:		{field:'ammol',def:'0',re:/[\[,\s]ammol:([-+]?\d+?)[,\s\]]/i},
	});

	const silent = true;

	var apiCommands = {};
	var apiDBs = {magic:false,attk:false};
	var classNonProfPenalty = {};
	var msg_orig = {};

	var flags = {
		feedbackName: 'AttackMaster',
		feedbackImg:  'https://s3.amazonaws.com/files.d20.io/images/52530/max.png?1340359343',
		image: false,
		archive: false,
		dice3d: true,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v2.050 determine if missing libraries should be notified
		notifyLibErr: true,
		noWaitMsg: true,
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
		
		try {
			if (!state.attackMaster)
				{state.attackMaster = {};}
			if (!state.magicMaster)
				{state.magicMaster = {};}
			if (_.isUndefined(state.attackMaster.weapRules))
				{state.attackMaster.weapRules = {prof:true,allowAll:false,classBan:false,criticals:true,naturals:true,allowArmour:false,masterRange:false,dmTarget:false,initPlus:true};}
			if (_.isUndefined(state.attackMaster.fancy))
				{state.attackMaster.fancy = true;}
			if (!state.attackMaster.twoWeapons)
				{state.attackMaster.twoWeapons = {};}
			if (_.isUndefined(state.attackMaster.thieveCrit))
				{state.attackMaster.thieveCrit = 0;}
			if (_.isUndefined(state.attackMaster.attrRoll))
				{state.attackMaster.attrRoll = false;}
			if (!state.MagicMaster.playerConfig)
				{state.MagicMaster.playerConfig={};}
			if (_.isUndefined(state.attackMaster.debug))
				{state.attackMaster.debug = false;}
			if (_.isUndefined(state.attackMaster.gmID))
				{state.attackMaster.gmID = undefined;}
				
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
			rogueSkills = RPGMap.rogueSkills;
			rogueDexMods = RPGMap.rogueDexMods;
			thiefSkillFactors = RPGMap.thiefSkillFactors;
			defaultNonProfPenalty = RPGMap.defaultNonProfPenalty;
			classNonProfPenalty = RPGMap.classNonProfPenalty;
			raceToHitMods = RPGMap.raceToHitMods;
			classAllowedWeaps = RPGMap.classAllowedWeaps;
			classAllowedArmour = RPGMap.classAllowedArmour;
			weapMultiAttks = RPGMap.weapMultiAttks;
			punchWrestle = RPGMap.punchWrestle;
			reClassSpecs = RPGMap.reClassSpecs;
			reSpellSpecs = RPGMap.reSpellSpecs;
			reWeapSpecs = RPGMap.reWeapSpecs;
			reACSpecs = RPGMap.reACSpecs;
			reThiefSpecs = RPGMap.reThiefSpecs;
			reModSpecs = RPGMap.reModSpecs;
			DBindex = undefined;
			flags.noWaitMsg = true;
			setTimeout( () => {flags.noWaitMsg = false}, 5000 );
			
			// Handshake with other APIs to see if they are loaded
			setTimeout( () => issueHandshakeQuery('magic'), 20);
			setTimeout( () => issueHandshakeQuery('money'), 20);
			setTimeout( () => issueHandshakeQuery('cmd'), 20);
			setTimeout( () => updateHandouts(handouts,true,findTheGM()), 30);
			setTimeout( updateHitDmgBonus, 200 );
			setTimeout( cmdMasterRegister, 40 );
			setTimeout( () => updateDBindex(false), 90); // checking the DB indexing

		} catch (e) {
			log('AttackMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendDebug('AttackMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendCatchError('AttackMaster',null,e,'AttackMaster Init()');
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
			if (playerIsGM(state.attackMaster.debug)) {
				log('AttackMaster Debug: '+msg);
			} else {
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
						state.attackMaster.gmID;
	    	            return player.id;
                    }
		        }
            }))) {
                return playerGM.id;
            }
        }
        return state.attackMaster.gmID;
    }
	
/* ------------------------- Character Sheet Database Management ------------------------- */

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
				sendCatchError('AttackMaster',msg_orig[senderId],e);
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
		parseClassDB(forceUpdate);
		checkACvars(false);
		return;
	}
	
/* -------------------------------------------- Utility Functions ------------------------------------------------- */
	
	/*
	 * Function to replace special characters in a string
	 */
/*	 
	var parseStr=function(str='',replaced=replacers){
		return replaced.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}
	
	/*
	 * Function to return the msVersion of the Character Sheet
	 * i.e. which versions of MagicMaster it is matched to
	 */

	var csVer = (charCS) => parseFloat(((attrLookup( charCS, fields.msVersion ) || '1.5').match(/^\d+\.\d+/) || ['1.5'])[0]) || 1.5;

	/* 
	 * Function to set a selected token as args[0]
	 */
	
	var setSelected = function( args, selected ) {
	 
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('setSelected: no token specified');
			sendError('No token selected');
			return undefined;
		}
		return args;
	};
	
	/*
	 * Deal with legacy magical hit and damage bonuses
	 */
	 
	async function updateHitDmgBonus(args) {
		
		try {
			
			if (!args) args = [];
			
			var cmd = (args[0] || '').toLowerCase(),
				senderId = findTheGM(),
				content = '';
			if (_.isUndefined(state.attackMaster.updateMsg)) state.attackMaster.updateMsg = true;
			if (!!cmd.length) state.attackMaster.updateMsg = cmd !== 'hide';
			
			if (!state.roundMaster || !state.roundMaster.dbNames || state.roundMaster.dbNames === 'v6Effects') {
				if (state.attackMaster.updateMsg) {
					let content = '&{template:'+fields.warningTemplate+'}{{title=Upgrade to v7 effects}}'
							+ '{{Section=The new modifiers table for tracking Thac0, Damage, HP & Armour Class modifiers by token, which caters for PC, NPC, creature & mob tokens '
							+ 'works best with the new v7 Effects database. <b><i>However</i></b>, conversion works best when a minimum of current effects are in play. Conversion of existing '
							+ 'Effects that change Thac0, Damage, HP, & Armour Class results in manual modifiers that must be managed by the GM. Where possible, allow all current '
							+ 'Effects to run out before converting.}}'
							+ '{{Section1=[Convert Now](!rounds --set-effectdb v7&#13;!magic --message gm||Converting Effects|Please wait while all tokens are assessed for conversion) '
							+ '[Don\'t Convert Yet](!magic --message gm||Don\'t Convert Effects Yet|You have chosen not to convert running Effects and the Effects database yet.) '
							+ '[Don\'t Show Again](!attk --update-effects hide&#13;!magic --message gm||Don\'t Show Update Dialog|You have chosen not to display the <i>update effects</i> dialog in future. You can redisplay the dialog by using the command <b>!attk ~~update-effects show</b>)}}';
					sendFeedback(content);
				};
				return;
			};
			
			var convertChar = function( obj, charCS, updates, senderId ) {
				return new Promise(resolve => {
					try {	
						let classObj = classObjects( charCS, senderId, {name:reACSpecs.name} );
						if (!classObj || !classObj.length || classObj[0].level <= 0) {
							setAttr( charCS, fields.msVersion, 3.6 );
						} else {
							let updated = false,
								update = [];
	//						log('updateHitDmgBonus: checking character "'+charCS.get('name')+', token '+obj.get('name')+obj.id);
							sendFeedback('Converting '+obj.get('name')+' from page '+getObj('page',obj.get('_pageid')).get('name'));
							let thac0obj = getTokenValue(obj,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base);
							if (thac0obj.name && thac0obj.barName.startsWith('bar')) {
								let	tokenThac0 = parseInt(thac0obj.val),
									thac0base = parseInt(handleGetBaseThac0(charCS)) || 20,
									magicTokenThac0 = (thac0base - tokenThac0);
								if (magicTokenThac0 !== 0) {
									updated = true;
			//						log('updateHitDmgBonus: tokenThac0 = '+tokenThac0+', thac0base = '+thac0base+', doing thac0+:'+magicTokenThac0);
									sendAPI(fields.attackMaster + ' --set-mods '+obj.id+'|Add|Token Thac0|Legacy Mods|thac0+:'+magicTokenThac0);
									update.push('Token Thac0:'+magicTokenThac0);
								}
							};
							let acObj = getTokenValue(obj,fields.Token_AC,fields.AC,fields.MonsterAC);
							if (acObj.name && acObj.barName.startsWith('bar')) {
								let tokenAC = parseInt(acObj.val),
									charAC = parseInt(attrLookup(charCS,fields.Armour_normal) || 10),
									magicTokenAC = (charAC - tokenAC);
								if (magicTokenAC !== 0) {
									updated = true;
			//						log('updateHitDmgBonus: tokenAC = '+tokenAC+', charAC = '+charAC+', doing +:'+magicTokenAC);
									obj.set(acObj.barName+'_value',charAC);
									obj.set(acObj.barName+'_max','');
									sendAPI(fields.attackMaster + ' --set-mods '+obj.id+'|Add|Token AC|Legacy Mods|+:'+magicTokenAC);
									update.push('Token AC:'+magicTokenAC);
								}
							};
							if (csVer(charCS) < 3.6) {
								let	magicHitAdj = parseInt(attrLookup( charCS, fields.Legacy_hitAdj )) || 0,
									magicDmgAdj = parseInt(attrLookup( charCS, fields.Legacy_dmgAdj )) || 0;
								if (magicHitAdj !== 0 || magicDmgAdj !== 0) {
									let vals = [];
									if (magicHitAdj	!== 0) {
										vals.push('thac0+:'+magicHitAdj);
										update.push('Char Hit+:'+magicHitAdj);
									}
									if (magicDmgAdj !== 0) {
										vals.push('dmg+:'+magicDmgAdj);
										update.push('Char Dmg+:'+magicDmgAdj);
									}
				//					log('updateHitDmgBonus: doing '+vals.join(','));
									updated = true;
									sendAPI(fields.attackMaster + ' --set-mods '+charCS.id+'|Add|Character|Legacy Mods|'+vals.join(','));
									setAttr( charCS, fields.Legacy_hitAdj, 0 );
									setAttr( charCS, fields.Legacy_dmgAdj, 0 );
								}
								setAttr( charCS, fields.msVersion, 3.6 );
							};
							if (updated) {
								let eList = [],
									effects = state.roundMaster.effects[obj.id];
								if (effects && effects.length > 0) {
									_.each(effects,e => eList.push(e.name));
									update.push(' effects:' + eList.join(','));
								}
								updates.push(obj.get('name') + ' on page ' + getObj('page',obj.get('_pageid')).get('name') + ': ' + update.join(','));
							}
						};
					} catch (e) {
						log('AttackMaster convertChar: JavaScript '+e.name+': '+e.message+' while converting sheet '+obj.get('name'));
						sendDebug('AttackMaster convertChar: JavaScript '+e.name+': '+e.message+' while converting sheet '+obj.get('name'));
						sendCatchError('AttackMaster',msg_orig[senderId],e);
					} finally {
						setTimeout(() => {
							resolve(updates);
						}, 1);
					};
				});
			};
			
			var updates = [],
				i = 0,
				tokens = [];
			log('Please wait: finding tokens to convert');
			let ref = setTimeout( () => {sendFeedback('Please wait: finding tokens to convert');state.attackMaster.updateMsg = true;}, 1000 );

			filterObjs( obj => {
				if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token' || !obj.get('represents')) return false;
				let charCS = getObj('character',obj.get('represents'));
				if (!charCS) return false;
				tokens.push({tokenObj:obj, charObj:charCS});
				return true;
			});
	//				return ((parseFloat(((attrLookup( charCS, fields.msVersion ) || '1.5').match(/^\d+\.\d+/) || ['1.5'])[0]) || 1.5) < 3.6);
	/*				let charCS = getObj('character',obj.get('represents'));
				if (!charCS) return false;
				return (!_.isUndefined(attrLookup( charCS, fields.msVersion )) && csVer(charCS) < 3.6);  // makes list shorter to check in next loop, if update run before
			});
	*/
			clearTimeout(ref);
			tokens = tokens.filter((token) => (csVer(token.charObj) < 3.6)).map((t) => t.tokenObj);

			log('updateHitDmgBonus: done token list, length = '+tokens.length);
				
			var count = tokens.length;
			if (!tokens.length) {
				if (state.attackMaster.updateMsg) sendFeedback('&{template:'+fields.messageTemplate+'}{{name=All Effects Converted}}{{desc=No tokens require converting}}');
				state.attackMaster.updateMsg = false;
				return;
			}
			
			if (state.attackMaster.updateMsg) {
				sendFeedback('&{template:'+fields.messageTemplate+'}{{name=RPGMaster '+version+' Update}}{{desc=The conversion to the v7 Effects Database will take a little while, especially for more complex campaigns with lots of tokens. Please be patient and wait for the conversion to complete. A message will appear once the conversion is complete.}}');
			};
			
	//		sendFeedback('Found '+count+' tokens to update');

			for (const obj of tokens) {
				let charCS = getObj('character',obj.get('represents'));
	//			if (csVer(charCS) >= 3.6) continue;  // prevents character being updated twice if has multiple tokens
				updates = await convertChar( obj, charCS, updates, senderId );
			};
			
			if (tokens.length > 0) sendFeedback('All tokens are latest version.');

			if (updates.length && state.attackMaster.updateMsg) {
				content = '&{template:'+fields.warningTemplate+'}{{title=RPGMaster '+version+' Update}}'
						+ '{{Section=RPGMaster version 4.0 introduces new tables to hold modifiers that are applied to tokens by temporary effects like spells and powers. '
						+ 'These tables hold each modifier for AC, Thac0, Damage, and Hit Points separately by effect and by token, making effects more accurate, especially against mobs. '
						+ 'The existing *Check AC* and new *Check Thac0, Dmg & HP* dialogs (accessed under the *attk menu*) display any current modifiers that are affecting the selected token. '
						+ 'The tables replace single fields held on character sheets and effects in the Effects Database that directly alter bar values on tokens. '
						+ 'However, it is recognised that some tokens & characters may have these *legacy effects* in operation at the time of update. '
						+ 'To overcome this, tokens and characters listed below have *legacy effects* in operation and have had the resulting modifiers converted to manually controlled table entries.}}'
						+ '{{desc=' + (updates.join('\n') || 'None found') + '}}';
				sendFeedback(content);
				state.attackMaster.updateMsg = false;
			};
		} catch (e) {
			log('AttackMaster updateHitDmgBonus: JavaScript '+e.name+': '+e.message+' while converting sheets');
			sendDebug('AttackMaster updateHitDmgBonus: JavaScript '+e.name+': '+e.message+' while converting sheets');
			sendCatchError('AttackMaster',msg_orig[senderId],e);
		};
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
				content += (mi != '-' ? (qty + ' ' + mi.replace(/\-/g,' ')) : '-');
				if (isView) {
					let miObj = getAbility( fields.MagicItemDB, mi, charCS, null, null, null, i );
					extension = '&#13;'+(miObj.api ? '' : sendToWho(charCS,senderId,false,true))+' &#37;{'+miObj.dB+'|'+(mi.hyphened())+'}';
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
			raceNonProf = parseInt(classNonProfPenalty[(attrLookup( charCS, fields.Race ) || '').dbName()]),
			penalties = _.filter( defaultNonProfPenalty, elem => (0 < (attrLookup(charCS,elem[1]) || 0)));
		if (state.attackMaster.weapRules.prof || _.isUndefined(sheetNonProf)) {
			if (!penalties || !penalties.length) {
				sheetNonProf = raceNonProf || 0;
			} else {
				sheetNonProf = _.map(penalties, elem => (_.isUndefined(classNonProfPenalty[(attrLookup( charCS, elem[0] ) || '').dbName()]) ? elem[2] : parseInt(String(classNonProfPenalty[(attrLookup( charCS, elem[0] ) || '').dbName()])))).reduce((penalty,highest) => Math.max(penalty,highest));
				if (!isNaN(raceNonProf)) sheetNonProf = Math.max(sheetNonProf,raceNonProf);
			}
		}
		return sheetNonProf;
	}
	
	/*
	 * Find the racial weapon mods for a character
	 */
	 
	var raceMods = function( charCS, wt, wst ) {
		var weaponMod,
		    race = (attrLookup( charCS, fields.Race ) || '').dbName(),
    		mods = raceToHitMods[race];
		if (_.isUndefined(mods)) {
			let raceObj = abilityLookup( fields.RaceDB, race, charCS ),
				raceSpecs = raceObj.obj ? raceObj.specs(/}}\s*specs=\s*?(\[.*?\])\s*?{{/im) : [];
			if (raceSpecs && raceSpecs[0]) {
				mods = raceToHitMods[(raceSpecs[0][4] || 'humanoid').dbName()];
			}
		}
		if (_.isUndefined(mods)) {return 0};
		wt = wt.dbName();
		wst = wst.dbName();
		weaponMod = _.find( mods, elem => [wt,wst].includes(elem[0].dbName()));
		if (_.isUndefined(weaponMod)) {return 0;}
		return weaponMod[1];
	}
	
	/*
	 * Check if the item specified by a name, type & supertype is
	 * in the list of allowed itemSpecs
	 */

	var checkItemAllowed = function( wname, wt, wst, allowedItems ) {
		let forceFalse = false;
		allowedItems = allowedItems.dbName().split('|'),
		wt = _.uniq(wt);
		wst = _.uniq(wst);
		return allowedItems.reduce((p,c) => {
			let item = '!+'.includes(c[0]) ? c.slice(1) : c,
				found = item.includes('any') || wt.includes(item) || wst.includes(item) || wname.includes(item);
			forceFalse = (forceFalse || (c[0] === '!' && found)) && !(c[0] === '+' && found);
			return (p || found) && !forceFalse;
		}, false);
	}
		
	/*
	 * Assess In-Hand weapons and armour to check if equipment 
	 * matches any currently proficient fighting style
	 */
	 
	var checkCurrentStyles = function( charCS, InHandTable ) {
		
		var spell, melee, shield, ranged, throwing, twoHanded,
			inHand, inHandDB, inHandObj, inHandSpecs, inHandClass,
			inPrimary = {spell:false,melee:false,ranged:false,shield:false,throwing:false,none:true},
			inBoth = {spell:false,melee:false,ranged:false,shield:false,throwing:false,none:true},
			inOther = {spell:false,melee:false,ranged:false,shield:false,throwing:false,none:true},
			wt = [],
			wst = [],
			weaps = [],
			inHandName, fightStyles, style,
			i=0;

		for (let i=0; !_.isUndefined(inHandName = InHandTable.tableLookup( fields.InHand_name, i, false )); i++) {
			
			inHand = InHandTable.tableLookup( fields.InHand_trueName, i ) || inHandName;
			spell = melee = ranged = shield = throwing = false;
			if (inHand !== '-') {
				inHandDB = InHandTable.tableLookup( fields.InHand_db, i );
				inHandObj = abilityLookup( inHandDB, inHand, charCS );
				if (inHandObj.obj && inHandObj.obj[1]) {
//					spell = melee = ranged = shield = throwing = false;
					twoHanded = InHandTable.tableLookup( fields.InHand_handedness, i ) == 2;
					inHandSpecs = inHandObj.specs(/}}\s*Specs\s*=(.*?){{/im) || [];
					throwing = (/}}\s*tohitdata\s*=/im.test(inHandObj.obj[1].body) && /}}\s*ammodata\s*=/im.test(inHandObj.obj[1].body));
					for (const c of inHandSpecs) {
						inHandClass = c[2].toLowerCase();
						spell = spell || !inHandDB.startsWith(fields.MagicItemDB);
						melee = melee || inHandClass.includes('melee');
						ranged = ranged || inHandClass.includes('ranged');
						shield = shield || inHandClass.includes('shield');
						wt.push(c[1].dbName());
						wst.push(c[4].dbName());
						weaps.push(inHand.dbName());
					}
				}
			}
			if (i == 0) {
				inPrimary = {spell:spell, melee:melee, ranged:ranged, shield:shield, throwing:throwing, none:!(spell || melee || ranged || shield)};
			} else if (i == 2 || twoHanded) {
				inBoth = {spell:inBoth.spell || spell, melee:inBoth.melee || melee, ranged:inBoth.ranged || ranged, shield:inBoth.shield || shield, throwing:inBoth.throwing || throwing};
				inBoth.none = !(inBoth.spell || inBoth.melee || inBoth.ranged || inBoth.shield );
			} else {
				inOther = {spell:inOther.spell || spell, melee:inOther.melee || melee, ranged:inOther.ranged || ranged, shield:inOther.shield || shield, throwing:inOther.throwing || throwing};
				inOther.none = !(inOther.spell || inOther.melee || inOther.ranged || inOther.shield );
			}
		}
		fightStyles = getTable( charCS, fieldGroups.STYLES );
		for (let r=0; !_.isUndefined(style = fightStyles.tableLookup( fields.Style_name, r, false )); r++) {
			let styleObj = abilityLookup( fields.StylesDB, style, charCS, true );
			if (!styleObj.obj) continue;
			let styleData = styleObj.data(/}}\s*styledata\s*=(.*?){{/im);
			if (_.isUndefined( styleData )) continue;
			let styleRow = parseData( styleData[0][0], reStyleData ),
				primeHand = !styleRow.prime   || _.reduce(inPrimary, (valid,weapon,key) => (styleRow.prime.includes(key) ? valid && weapon : valid), true),
				offhand   = !styleRow.offhand || _.reduce(inOther, (valid,weapon,key) => (styleRow.offhand.includes(key) ? valid && weapon : valid), true),
				both      = !styleRow.twohand || _.reduce(inBoth, (valid,weapon,key) => (styleRow.twohand.includes(key) ? valid && weapon : valid), true),
				allowed   = checkItemAllowed( weaps, wt, wst, (styleRow.weaps || 'any'));

			fightStyles.tableSet( fields.Style_current, r, (primeHand && offhand && both && allowed) );
		};
		applyFightingStyle( charCS, InHandTable, fightStyles );
		return;
	}
	
	/*
	 * Set all fighting style modifiers to their default values
	 * ready for establishing fighting style bonuses
	 */
	 
	var setStyleDefaults = function( charCS, styleFieldMap, meleeTable, rangedTable, dmgTable, ammoTable ) {
		
		setAttr( charCS, fields.Armour_styleMod, 0 );
		setAttr( charCS, fields.Init_2ndShield, 0 );
		setAttr( charCS, fields.TwoWeapStylePenalty, 9.9 );
		
		_.each( styleFieldMap, (field,key) => {
			switch (field[0].toUpperCase()) {
			case 'MW':
				meleeTable.tableDefault( field[1] );
				break;
			case 'RW':
				rangedTable.tableDefault( field[1] );
				break;
			case 'DMG':
				dmgTable.tableDefault( field[1] );
				break;
			case 'AMMO':
				ammoTable.tableDefault( field[1] );
				break;
			}
		});
	}
		
	/*
	 * Determine if any proficient style is current and, if so,
	 * if it applies to an attack with the named weapon
	 */
	 
	var applyFightingStyle = function( charCS, InHandTable, fightStyles ) {
		
		var spell, melee, ranged, shield, throwing, prime, both, offhand, inHandName, style,
			meleeTable = getTable( charCS, fieldGroups.MELEE ),
			dmgTable = getTable( charCS, fieldGroups.DMG ),
			rangedTable = getTable( charCS, fieldGroups.RANGED ),
			ammoTable = getTable( charCS, fieldGroups.AMMO ),
			styleBenefits = [];

		const styleFieldMap = Object.freeze ({
			mwsp:		['MW',fields.MW_styleSpeed],
			rwsp:		['RW',fields.RW_styleSpeed],
			mwn:		['MW',fields.MW_styleAttks],
			rwn:		['RW',fields.RW_styleAttks],
			mwadj:		['MW',fields.MW_styleAdj],
			rwadj:		['RW',fields.RW_styleAdj],
			mwch:		['MW',fields.MW_styleCH],
			rwch:		['RW',fields.RW_styleCH],
			mwcm:		['MW',fields.MW_styleCM],
			rwcm:		['RW',fields.RW_styleCM],
			rwr:		['RW',fields.RW_styleRange],
			rwrm:		['RW',fields.RW_styleRangeMods],
			dmg:		['DMG',fields.Dmg_styleAdj],
			dmgsm:		['DMG',fields.Dmg_styleSM],
			dmgl:		['DMG',fields.Dmg_styleL],
			ammoadj:	['AMMO',fields.Ammo_styleAdj],
			ammosm:		['AMMO',fields.Ammo_styleSM],
			ammol:		['AMMO',fields.Ammo_styleL],
			oneh:		['',['','']],
			twoh:		['',['','']],
		});

		var implementStyle = function( charCS, row, weapon, styleBenefits ) {

			var parsedBenefits = parseData( styleBenefits, reStyleData, false );
				
			weapon = weapon.dbName();

			_.each( parsedBenefits, (val,key) => {
				if (_.isUndefined(val) || !styleFieldMap[key]) return;
				let field = styleFieldMap[key][1];
				switch (key.toLowerCase()) {
				case 'oneh':
					if (InHandTable.tableLookup( fields.InHand_handedness, row ) == 1) {
						implementStyle( charCS, row, weapon, '['+val.replace(/=/g,':').replace(/\|/g,',')+']');
					}
					break;
				case 'twoh':
					if (InHandTable.tableLookup( fields.InHand_handedness, row ) != 1) {
						implementStyle( charCS, row, weapon, '['+val.replace(/=/g,':').replace(/\|/g,',')+']');
					}
					break;
				case 'dmg':
				case 'dmgsm':
				case 'dmgl':
					if (!dmgTable) dmgTable = getTable( charCS, fieldGroups.DMG );
					for (let r=dmgTable.table[1]; !_.isUndefined(dmgTable.tableLookup( fields.Dmg_name, r, false )); r++) {
						let rowWeap = dmgTable.tableLookup( fields.Dmg_miName, r );
						if (rowWeap.dbName() == weapon) {
							dmgTable.tableSet( field, r, val );
						}
					}
					break;
				case 'mwsp':
				case 'mwn':
				case 'mwadj':
				case 'mwch':
				case 'mwcm':
					if (!meleeTable) meleeTable = getTable( charCS, fieldGroups.MELEE );
					for (let r=meleeTable.table[1]; !_.isUndefined(meleeTable.tableLookup( fields.MW_name, r, false )); r++) {
						let rowWeap = meleeTable.tableLookup( fields.MW_miName, r );
						if (rowWeap.dbName() == weapon) {
							meleeTable.tableSet( field, r, val );
						}
					}
					break;
				case 'rwsp':
				case 'rwn':
				case 'rwadj':
				case 'rwch':
				case 'rwcm':
				case 'rwr':
				case 'rwrm':
					if (!rangedTable) rangedTable = getTable( charCS, fieldGroups.RANGED );
					for (let r=rangedTable.table[1]; !_.isUndefined(rangedTable.tableLookup( fields.RW_name, r, false )); r++) {
						let rowWeap = rangedTable.tableLookup( fields.RW_miName, r );
						if (rowWeap.dbName() == weapon) {
							rangedTable.tableSet( field, r, val );
						}
					}
					break;
				case 'ammoadj':
				case 'ammosm':
				case 'ammol':
					if (!ammoTable) ammoTable = getTable( charCS, fieldGroups.AMMO );
					for (let r=ammoTable.table[1]; !_.isUndefined(ammoTable.tableLookup( fields.Ammo_name, r, false )); r++) {
						let rowWeap = ammoTable.tableLookup( fields.Ammo_miName, r );
						if (rowWeap.dbName() == weapon) {
							ammoTable.tableSet( field, r, val );
						}
					}
					break;
				}
			});
			return;
		}
		
		setStyleDefaults( charCS, styleFieldMap, meleeTable, rangedTable, dmgTable, ammoTable );
		for (let r=fightStyles.table[1]; !_.isUndefined(style = fightStyles.tableLookup(fields.Style_name,r,false)); r++) {
			if (style != '-' && (fightStyles.tableLookup(fields.Style_current, r) == 'true')) {
				let styleObj = abilityLookup( fields.StylesDB, style, charCS, true );
				if (!styleObj.obj) return;
				let styleData = styleObj.data(/}}\s*styledata\s*=(.*?){{/im);
				if (_.isUndefined( styleData )) return;
				
				let styleProf = (parseInt(fightStyles.tableLookup( fields.Style_proficiency, r ) || 1) || 1);
				if (styleProf) {
					let benefits = styleData[styleProf][0];
					styleBenefits.push(benefits);
					for (let i=0; !_.isUndefined(inHandName = InHandTable.tableLookup( fields.InHand_name, i, false )); i++) {
						let inHand = InHandTable.tableLookup( fields.InHand_trueName, i ) || inHandName;
						spell = melee = ranged = shield = throwing = false;
						if (inHand !== '-') {
							let inHandDB = InHandTable.tableLookup( fields.InHand_db, i );
							let inHandObj = abilityLookup( inHandDB, inHand );
							if (inHandObj.obj && inHandObj.obj[1]) {
								let twoHanded = InHandTable.tableLookup( fields.InHand_handedness, i ) == 2;
								let inHandSpecs = inHandObj.specs(/}}\s*Specs\s*=(.*?){{/im);
								throwing = throwing || (/}}\s*tohitdata\s*=/im.test(inHandObj.obj[1].body) && /}}\s*ammodata\s*=/im.test(inHandObj.obj[1].body));
								let wt = [], wst = [];
								for (const c of inHandSpecs) {
									let inHandClass = c[2].toLowerCase();
									spell = spell || !inHandDB.startsWith(fields.MagicItemDB);
									melee = melee || inHandClass.includes('melee');
									ranged = ranged || inHandClass.includes('ranged');
									shield = shield || inHandClass.includes('shield');
									wt.push(c[1].dbName());
									wst.push(c[4].dbName());
								}
								prime = both = offhand = true;
								let styleDef = parseData( styleData[0][0], reStyleData );
								if (i == 0 && styleDef.prime) {
									prime = (spell && styleDef.prime.includes('spell'))
										 || (melee && styleDef.prime.includes('melee'))
										 || (ranged && styleDef.prime.includes('ranged'))
										 || (shield && styleDef.prime.includes('shield'))
										 || (throwing && styleDef.prime.includes('throwing'));
								} else if ((i == 2 || twoHanded) && styleDef.twohand) {
									both = (spell && styleDef.twohand.includes('spell'))
										 || (melee && styleDef.twohand.includes('melee'))
										 || (ranged && styleDef.twohand.includes('ranged'))
										 || (shield && styleDef.twohand.includes('shield'))
										 || (throwing && styleDef.twohand.includes('throwing'));
								} else if (styleDef.offhand) {
									offhand = (spell && styleDef.offhand.includes('spell'))
										 || (melee && styleDef.offhand.includes('melee'))
										 || (ranged && styleDef.offhand.includes('ranged'))
										 || (shield && styleDef.offhand.includes('shield'))
										 || (throwing && styleDef.offhand.includes('throwing'));
								}
								if (prime && both && offhand && checkItemAllowed([inHand], wt, wst, (styleDef.weaps || 'any'))) {
									implementStyle( charCS, i, inHand, benefits );
								}
							}
						}
					}
				}
			}
		}

		_.each( parseData( styleBenefits.join(), reStyleData ), (val,key) => {
			if (_.isUndefined(val)) return;
			switch (key.toLowerCase()) {
			case 'ac':
				setAttr( charCS, fields.Armour_styleMod, val );
				break;
			case 'shattk':
				setAttr( charCS, fields.Init_2ndShield, val );
				break;
			case 'twp':
				setAttr( charCS, fields.TwoWeapStylePenalty, val );
				break;
			}
		});
		return;
	}
	
	/*
	 * Determine if the character has an item in-hand
	 */
	 
	var itemInHand = function( charCS, itemTrueName ) {
		var inHandTable = getTableField( charCS, {}, fields.InHand_table, fields.InHand_trueName );
		return !_.isUndefined(inHandTable.tableFind( fields.InHand_trueName, itemTrueName ));
	}
	
	/*
	 * Determine if the character has a shield in-hand
	 */
	 
	var shieldInHand = function( charCS, shieldTrueName ) {
		return itemInHand( charCS, shieldTrueName );
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
	 
	async function checkACvars(forceUpdate,senderId='') {
		
		try {
		
			var errFlag, charCS;
			
			var setAC = function( tokenID ) {
				
				return new Promise(resolve => {

					try {
						var errFlag = doCheckAC( [tokenID,'quiet'], findTheGM(), [], true );
					} catch (e) {
						log('AttackMaster checkACvars: JavaScript '+e.name+': '+e.message+' while checking AC for tokenID '+tokenID);
						sendDebug('AttackMaster checkACvars: JavaScript '+e.name+': '+e.message+' while checking AC for tokenID '+tokenID);
						if (senderId) {
							sendCatchError('AttackMaster',msg_orig[senderId],e);
						} else {
							sendCatchError('AttackMaster',null,e,'AttackMaster checkACvars() on initialisation');
						}
						errFlag = true;
					} finally {
						setTimeout(() => {
							resolve(errFlag);
						}, 10);
					};
				});
			};
			
			var tokens = filterObjs( function(obj) {
					if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') return false;
					if (!(charCS = getObj('character',obj.get('represents')))) return false;
					return forceUpdate || _.isUndefined(attrLookup( charCS, fields.SlashAC ));
				});
				
			for (const t of tokens) {
				errFlag = await setAC(t.id);
				if (errFlag) break;
			};
			return;
		} catch (e) {
			sendCatchError('AttackMaster',(senderId ? msg_orig[senderId] : null),e,'AttackMaster checkACvars()');
		}
	};
			
	
	/*
	 * Determine the number of attacks per round for a weapon,
	 * using the type, superType or class (melee/ranged) of 
	 * the weapon.
	 */
	 
	var getAttksPerRound = function( charCS, proficiency, weaponSpecs, weapBase ) {

		var level = Math.max((parseInt(attrLookup( charCS, fields.Fighter_level )) || 0),0),
			charClass = (attrLookup( charCS, fields.Fighter_class ) || 'fighter').dbName(),
			charRace = (attrLookup( charCS, fields.Race ) || 'human').dbName(),
			wt = weaponSpecs[1].dbName(),
			wst = weaponSpecs[4].dbName(),
			wc = weaponSpecs[2].dbName(),
			levelsData = [],
			attksData, raceData,
			boost, raceBoost, newVal, result;
			
		if (_.isUndefined(weapMultiAttks[charClass])) {
			charClass = 'fighter';
		}
		wc = wc.includes('innate') ? 'innate' : (wc.includes('ranged') ? 'ranged' : (wc.includes('melee') ? 'melee' : 'invalid'));
		attksData = proficiency > 0 ? weapMultiAttks.All.Specialist : (weapMultiAttks[charClass] ? weapMultiAttks[charClass].Proficient : {});
		raceData = weapMultiAttks[charRace] ? weapMultiAttks[charRace].Proficient : (_.find(weapMultiAttks, (w,k) => charRace.includes(k)) || {});
		
		if (_.isUndefined(raceBoost = raceData[wt])) {
			if (_.isUndefined(raceBoost = raceData[wst])) {
				raceBoost = raceData[wc];
			}
		}
		if (_.isUndefined(boost = attksData[wt])) {
			if (_.isUndefined(boost = attksData[wst])) {
				if (_.isUndefined(boost = attksData[wc])) {
					if (_.isUndefined(raceBoost)) {
						return weapBase;
					} else {
						boost = raceBoost;
						raceBoost = undefined;
					}
				}
			}
		}
		if ('+-'.includes(weapBase[0])) {
			weapBase = '1' + weapBase;
		}
		levelsData = Array.from(weapMultiAttks[charClass].Levels);
		if (_.isUndefined(levelsData) || !levelsData.length)
			{levelsData = [0];}
		levelsData = levelsData.reverse();
		let addition = (boost[(levelsData.length - 1 - levelsData.findIndex(l => l <= level ))] || boost[boost.length-1]);
		if ('+-'.includes(addition[0])) addition = '0'+addition;
		if (!_.isUndefined(raceBoost)) {
			let raceAdd = (raceBoost[(levelsData.length - 1 - levelsData.findIndex(l => l <= level ))] || raceBoost[boost.length-1]);
			addition = ('+-'.includes(raceAdd[0])) ? addition + raceAdd : raceAdd;
		}
		try {
			newVal = eval('2*('+ weapBase + '+' + addition +')');
			result = (newVal % 2) ? newVal + '/2' : newVal/2;
		} catch {
			result = weapBase;
		} finally {
			return result;
		}
	}
		
	/**
	 * Test a dataset to see if level constraints have 
	 * been set for it
	 **/
	 
	var levelTest = function( charCS, dataset ) {
		
		if (!(dataset.validLevel.length || dataset.castLevel.length || dataset.muLevel.length || dataset.prLevel.length)) return true;
		
		var level = parseInt(characterLevel( charCS )),
			muLevel = Math.max(0,parseInt(caster( charCS, 'MU' ).clv)),
			prLevel = Math.max(0,parseInt(caster( charCS, 'PR' ).clv)),
			castLevel = Math.max(muLevel,prLevel);
			
		if (!Array.isArray(dataset.validLevel)) dataset.validLevel = [dataset.validLevel,''];
		if (!Array.isArray(dataset.castLevel)) dataset.castLevel = [dataset.castLevel,''];
		if (!Array.isArray(dataset.muLevel)) dataset.muLevel = [dataset.muLevel,''];
		if (!Array.isArray(dataset.prLevel)) dataset.prLevel = [dataset.prLevel,''];
			
		if (dataset.validLevel && ((!isNaN(dataset.validLevel[0]) && (level < parseInt(dataset.validLevel[0]))) || (!isNaN(dataset.validLevel[1]) && (level > parseInt(dataset.validLevel[1]))))) return false;
		if (dataset.castLevel && ((!isNaN(dataset.castLevel[0]) && (castLevel < parseInt(dataset.castLevel[0]))) || (!isNaN(dataset.castLevel[1]) && (castLevel > parseInt(dataset.castLevel[1]))))) return false;
		if (dataset.muLevel && ((!isNaN(dataset.muLevel[0]) && (muLevel < parseInt(dataset.muLevel[0]))) || (!isNaN(dataset.muLevel[1]) && (muLevel > parseInt(dataset.muLevel[1]))))) return false;
		if (dataset.prLevel && ((!isNaN(dataset.prLevel[0]) && (prLevel < parseInt(dataset.prLevel[0]))) || (!isNaN(dataset.prLevel[1]) && (prLevel > parseInt(dataset.prLevel[1]))))) return false;
		return true;
	}
	
/* ----------------------------------------------- Weapon Management Functions ----------------------------------------
	
	/*
	 * Create a Roll Query with a list of either 1H or 2H 
	 * weapons from the character's magic item bag
	 */
	
	var weaponQuery = function( charCS, handed, type, senderId, anyHand=0 ) {
		
		return new Promise(resolve => {
			
			try {
				
				var itemName,
					itemTable = getTableField( charCS, {}, fields.Items_table, fields.Items_name ),
					itemTable = getTableField( charCS, itemTable, fields.Items_table, fields.Items_trueName ),
					itemTable = getTableField( charCS, itemTable, fields.Items_table, fields.Items_qty ),
					weaponList = (type == 'ring') ? ['-,-'] : ['-,-','Touch,-2','Punch-Wrestle,-2.5'],
					spellFields = {mu:{table:fields.MUSpellNo_table,spells:fields.MUSpellNo_memable,spec:fields.MUSpellNo_specialist,misc:fields.MUSpellNo_misc},
								   pr:{table:fields.PRSpellNo_table,spells:fields.PRSpellNo_memable,spec:fields.PRSpellNo_wisdom,misc:fields.PRSpellNo_misc}},
					itemList = [],
					rollQuery = '';
					
				if (type !== 'mispells') {
					for (let r = fields.Items_table[1]; !_.isUndefined(itemName = itemTable.tableLookup( fields.Items_name, r, false )); r++) {

						if (itemTable.tableLookup( fields.Items_qty, r, 0 ) <= 0) continue;
						let itemTrueName = itemTable.tableLookup( fields.Items_trueName, r ) || itemName;
						let nameMatch = itemName.dbName();
						if (itemList.includes(nameMatch)) continue;
						let mi = abilityLookup( fields.MagicItemDB, itemTrueName, charCS );
						if (!mi.obj || !mi.obj[1]) continue;
						let specs = mi.obj[1].body;
						if (type == 'ring') {
							let weaponSpecs = mi.hands(/}}\s*Specs=\s*?(\[.*?ring(?:,|\|).*?\])\s*?{{/im) || [];
							if (_.some(weaponSpecs, (w) => {
								return ((!state.attackMaster.weapRules.classBan || classAllowedItem( charCS, itemTrueName, w[1], w[4], 'ac' )))
							})) {
								weaponList.push(itemName+','+r);
								itemList.push(nameMatch);
								continue;
							}
						} else {
							let weaponSpecs = mi.hands(/}}\s*Specs=\s*?(\[.*?[-,\|\s](?:melee|ranged|magic)[-,\|\s].*?\])\s*?{{/im) || [];
							if (_.some(weaponSpecs, (w) => ((w[3]==handed || (anyHand && w[3]>=anyHand && w[3]<=handed))
										&& (!state.attackMaster.weapRules.classBan || classAllowedItem( charCS, itemTrueName, w[1], w[4], 'weaps' ))))) {
								weaponList.push(itemName+','+r);
								itemList.push(nameMatch);
								continue;
							}
							let shieldSpecs = mi.hands(/}}\s*Specs=\s*?(\[.*?shield(?:,|\|).*?\])\s*?{{/im) || [];
							if (_.some(shieldSpecs, (s) => ((s[3]==handed || (anyHand && s[3]>=anyHand && s[3]<=handed))
										&& (state.attackMaster.weapRules.allowArmour || classAllowedItem( charCS, itemTrueName, s[1], s[4], 'ac' ))))) {
								weaponList.push(itemName+','+r);
								itemList.push(nameMatch);
								continue;
							}
							let lightSpecs = mi.hands(/}}\s*Specs=\s*?(\[.*?(?:light|equipment)(?:,|\|).*?\])\s*?{{/im) || [];
							if (_.some(lightSpecs, (s) => (s[3]==handed || (anyHand && s[3]>=anyHand && s[3]<=handed)))) {
								weaponList.push(itemName+','+r);
								itemList.push(nameMatch);
								continue;
							}
						}
					}
				};
				if (type !== 'ring') {
					_.each (spellLevels, (level,k) => {
						if ((type !== 'mispells' && (k === 'mi' || k === 'pm')) ||  (type === 'mispells' && k !== 'mi' && k !== 'pm')) return;
						_.each (level, (l,n) => {
							let totalSpells = 100,
								s = 0;
							if (k == 'mu' || k == 'pr') {
								let noSpells = parseInt(attrLookup(charCS,[spellFields[k].table[0] + n + spellFields[k].spells[0],spellFields[k].spells[1]])) || 0,
									miscSpells = (noSpells && !state.MagicMaster.spellRules.strictNum) ? parseInt(attrLookup(charCS,[spellFields[k].table[0] + n + spellFields[k].misc[0],spellFields[k].misc[1]]) || 0) : 0,
									levelSpec = parseInt(attrLookup(charCS,[spellFields[k].table[0] + n + spellFields[k].spec[0],spellFields[k].spec[1]])) || 0;
								totalSpells = noSpells + miscSpells + levelSpec;
							}
							itemName = '-';
							itemTable = {};
							let items = [],
								lbase = parseInt(l.base);
							for (let r=fields.Spells_table[1]; (s < totalSpells) && !_.isUndefined(itemName); r++) {
								for (let c=0; (c<fields.SpellsCols && s<totalSpells && !_.isUndefined(itemName)); c++) {
									if (!itemTable[c]) {
										itemTable[c] = getTableField( charCS, {}, fields.Spells_table, fields.Spells_name, (c+lbase) );
										itemTable[c] = getTableField( charCS, itemTable[c], fields.Spells_table, fields.Spells_weapon, (c+lbase) );
										itemTable[c] = getTableField( charCS, itemTable[c], fields.Spells_table, fields.Spells_castValue, (c+lbase) );
									}
									itemName = itemTable[c].tableLookup( fields.Spells_name, r, false );
									if (itemName && itemName != '-' && !items.includes(itemName) && !itemList.includes(itemName.dbName()) && itemTable[c].tableLookup( fields.Spells_weapon, r ) === '1' && itemTable[c].tableLookup( fields.Spells_castValue, r ) != 0) {
										weaponList.push(itemName+','+r+':'+(c+l.base));
										items.push(itemName);
									}
									s++;
								}
							}
						});
					});
				};
				rollQuery = '&#63;{Which '+(type == 'ring' ? 'ring' : 'weapon')+'?|'+weaponList.sort().join('|')+'}';
			} catch (e) {
				log('AttackMaster weaponQuery: JavaScript '+e.name+': '+e.message+' while processing weapon '+itemName);
				sendDebug('AttackMaster weaponQuery: JavaScript '+e.name+': '+e.message+' while processing weapon '+itemName);
				sendCatchError('AttackMaster',msg_orig[senderId],e);
				rollQuery = '';

			} finally {
				setTimeout(() => {
					resolve(rollQuery);
				}, 5);
			}
		});
	}
	
	/*
	 * Check for a character's proficiency with a weapon type
	 */

	var proficient = function( charCS, wname, wt, wst ) {
 
		wname = wname ? wname.dbName() : '-';
        wt = wt ? wt.dbName() : '';
        wst = wst ? wst.dbName() : '';
		
		var i = fields.WP_table[1],
			classObjs = classObjects( charCS, findTheGM() ),
			prof = getCharNonProfs( charCS ),
			WeaponProfs = getTable( charCS, fieldGroups.WPROF ),
			allowedWeap = state.attackMaster.weapRules.allowAll || classAllowedItem( charCS, wname, wt, wst, 'weaps' ),
			spec, wpName, wpType,
			isInnate = wt.includes('innate'),
			isType = isInnate, isSuperType=false, isSameName=false, isSpecialist=false, isMastery=false;
			
//		isType = isSuperType = isSameName = isSpecialist = isMastery = false;
		
		if (classObjs[0].base === 'creature') return 0;
		
		if (allowedWeap) {
			do {
				wpName = WeaponProfs.tableLookup( fields.WP_name, i, false );
				wpType = WeaponProfs.tableLookup( fields.WP_type, i );
				if (_.isUndefined(wpName)) {break;}
				wpName = wpName.dbName();
				wpType = (!!wpType ? wpType.dbName() : '');
				
				let typeTest = (wpName && wpName.length && wt.includes(wpName) ),
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
					prof = (prof ||-5) * 2;
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
		weapon = weapon.dbName();
		
        for (const e of tables) {
			if (_.isUndefined(WeaponInfo[e])) continue;
			i = WeaponInfo[e].table[1]-1;
            f = WeaponInfo[e].fieldGroup;
     	    while (!_.isUndefined(WeaponInfo[e].tableLookup( fields[f+'name'], ++i, false ))) {
    	        if (weapon == WeaponInfo[e].tableLookup( fields[f+'miName'], i ).dbName()) {
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

	var filterWeapons = function( tokenID, charCS, InHand, Quiver, Weapons, table, sheathed=[], itemDB=fields.WeaponDB ) {
		
		var i, base, weapTableField, WeaponTable, weapName,
		    curToken = getObj('graphic',tokenID),
			isWeap = false,
		    CheckTable = InHand,
		    checkTableField = fields.InHand_trueName;
			
		switch (table.toUpperCase()) {
		case 'WEAP':
			weapTableField = fields.Weap_miName;
			isWeap = true;
			break;
		case 'MAGIC':
			weapTableField = fields.Magic_miName;
			break;
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
			let innateAttk = isWeap && weapName.length > 0 && /(?:Creature|Innate)\s*(?:Attk|Attack)\s*(\d)\s*(\w)/i.test(WeaponTable.tableLookup(fields.Weap_message, i));
			if (!weapName || !weapName.length || (!innateAttk && _.isUndefined(CheckTable.tableFind( checkTableField, weapName )) && (!isWeap || _.isUndefined(Quiver.tableFind( fields.Quiver_trueName, weapName ))))) {
				WeaponTable = WeaponTable.addTableRow( i );
				if (weapName && weapName.length && !sheathed.includes(weapName)) {
					sheathed.push(weapName);
					sendAPImacro(curToken,'',weapName,'-sheath');
					let weapData = resolveData( weapName, itemDB, reItemData, charCS, {off:reWeapSpecs.off} ).parsed;
					if (weapData && weapData.off) {
						sendAPI( parseStr(weapData.off).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
													   .replace(/@{\s*selected\s*\|\s*character_id\s*}/ig,charCS.id)
													   .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'), null, 'attk filterWeapons');
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
			
			if (_.isUndefined(val)) return;

			if (key == 'dmgType') {
				if (_.isUndefined(fields[group+'slash']) || _.isUndefined(fields[group+'pierce']) || _.isUndefined(fields[group+'bludgeon'])) return;
				let dmgType=val.toUpperCase();
				values[fields[group+'slash'][0]][fields[group+'slash'][1]]=(dmgType.includes('S')?1:0);
				values[fields[group+'pierce'][0]][fields[group+'pierce'][1]]=(dmgType.includes('P')?1:0);
				values[fields[group+'bludgeon'][0]][fields[group+'bludgeon'][1]]=(dmgType.includes('B')?1:0);
			} else {
				if (_.isUndefined(fields[group+key])) return;
				let property = fields[group+key];
				if (_.isUndefined(values[property[0]])) return;
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
	
	var insertAmmo = function( charCS, ammoTrueName, ammoDataArray, rangeDataArray, tableInfo, ammoType, sb, miIndex, dispValues ) {
		
		var ammoData, ammoTest, parsedAmmoData, specType, specSuperType, values, ammoRow, qty, qtySet,
			typeCheck = ammoType.dbName(),
			ammo1e = (_.isUndefined(dispValues) || _.isNull(dispValues));

		if (tableInfo.ammoTypes.includes(ammoTrueName+'-'+ammoType)) {log('insertAmmo: already dealt with, retuning'); return tableInfo;}
		tableInfo.ammoTypes.push(ammoTrueName+'-'+ammoType);
 
		for (let w=0; w<ammoDataArray.length; w++) {
			ammoData = ammoDataArray[w][0];
			specType = (ammoData.match(/[\[,\s]t:([\s\w\-\+\:\|]+?)[,\]]/i) || ['','unknown'])[1].dbName();
			specSuperType = (ammoData.match(/[\[,\s]st:([\s\w\-\+\:\|]+?)[,\]]/i) || ['','unknown'])[1].dbName();
			let clv = ammoData.match(/[\[,\s]clv:([-\+]?\d+?)[,\]]/i),
				mulv = ammoData.match(/[\[,\s]mulv:([-\+]?\d+?)[,\]]/i),
				prlv = ammoData.match(/[\[,\s]prlv:([-\+]?\d+?)[,\]]/i);
				
			ammoTest = (!clv  || (parseInt(attrLookup( charCS, fields.CastingLevel)) || 1) >= parseInt((clv || ['','0'])[1]))
					&& (!mulv || (parseInt(attrLookup( charCS, fields.MU_CastingLevel)) || 1) >= parseInt((mulv || ['','0'])[1]))
					&& (!prlv || (parseInt(attrLookup( charCS, fields.PR_CastingLevel)) || 1) >= parseInt((prlv || ['','0'])[1]));
					
			if ((typeCheck == specType || typeCheck == specSuperType) && ammoTest) {
				let miQty = parseInt(attrLookup( charCS, fields.Items_qty, fields.Items_table, miIndex, '', false, false )),
					miMax = parseInt(attrLookup( charCS, fields.Items_trueQty, fields.Items_table, miIndex, '', false, false ));
				if (isNaN(miQty)) miQty = 1;
				if (isNaN(miMax)) miMax = miQty;

				values = initValues( tableInfo.AMMO.fieldGroup );
				values[fields.Ammo_name[0]][fields.Ammo_name[1]]='Unknown ammo';
				parsedAmmoData = parseData( ammoData, reWeapSpecs, true, charCS, ammoTrueName );
				values = setAttackTableRow( charCS, tableInfo.AMMO.fieldGroup, ammoTrueName, parsedAmmoData, null, values );

				if (!_.isUndefined(tableInfo.WEAP)) {
					if (ammo1e) {
						dispValues = initValues( tableInfo.WEAP.fieldGroup );
						dispValues[fields.Weap_name[0]][fields.Weap_name[1]]='Unknown ammo';
					};
					
					dispValues = setAttackTableRow( charCS, tableInfo.WEAP.fieldGroup, ammoTrueName, resolveData( ammoTrueName, fields.WeaponDB, reAmmoData, charCS, {}, miIndex, [], ammo1e ).parsed, null, dispValues );
				};

				if (!sb) values[fields.Ammo_strBonus[0]][fields.Ammo_strBonus[1]] = 0;
				qtySet=(ammoData.match(/[\[,\s]qty:\s*?=(\d+?)[,\]]/i) || '');
				if (qtySet) {
					qty = parseInt(qtySet[1]);
				} else {
					qty = parseInt(values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]);
				}
				values[fields.Ammo_setQty[0]][fields.Ammo_setQty[1]] = qty ? 1 : 0;
				if (!qty && !qtySet) {
					values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=miQty;
					values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]]=miMax;
				} else {
					values[fields.Ammo_qty[0]][fields.Ammo_qty[1]]=Math.min(qty,miQty);
					values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]] = Math.min(qty,miQty);
				}
				values[fields.Ammo_attkAdj[0]][fields.Ammo_attkAdj[1]]=((rangeDataArray[w] || rangeDataArray[0])[0].match(/[\[,\s]\+:\s*?([+-]?\d+?)\s*?[,\]]/i) || ['',''])[1];
				values[fields.Ammo_range[0]][fields.Ammo_range[1]]=((rangeDataArray[w] || rangeDataArray[0])[0].match(/[\[,\s]r:(=?[+-]?[\s\w\+\-\d\/]+)[,\]]/i) || ['',''])[1];
				values[fields.Ammo_type[0]][fields.Ammo_type[1]]=ammoType;
				values[fields.Ammo_miName[0]][fields.Ammo_miName[1]]=ammoTrueName;
				values[fields.Ammo_miIndex[0]][fields.Ammo_miIndex[1]]=miIndex;
				
				do {
					ammoRow = tableInfo.AMMO.tableFind( fields.Ammo_name, parsedAmmoData.name );
				} while (!_.isUndefined(ammoRow) && (tableInfo.AMMO.tableLookup( fields.Ammo_miName, ammoRow ) !== ammoTrueName));
				if (_.isUndefined(ammoRow)) ammoRow = tableInfo.AMMO.tableFind( fields.Ammo_name, '-' );
				tableInfo.AMMO = tableInfo.AMMO.addTableRow( ammoRow, values );

				if (!_.isUndefined(tableInfo.WEAP)) {
					dispValues[fields.Weap_dmgBonus[0]][fields.Weap_dmgBonus[1]] = dispValues[fields.Weap_adj[0]][fields.Weap_adj[1]];
					dispValues[fields.Weap_ammo[0]][fields.Weap_ammo[1]] = values[fields.Ammo_qty[0]][fields.Ammo_qty[1]];
					dispValues[fields.Weap_ammoMax[0]][fields.Weap_ammoMax[1]] = values[fields.Ammo_maxQty[0]][fields.Ammo_maxQty[1]];
					dispValues[fields.Weap_miName[0]][fields.Weap_miName[1]] = ammoTrueName;
					dispValues[fields.Weap_range[0]][fields.Weap_range[1]]=values[fields.Ammo_range[0]][fields.Ammo_range[1]];
					if (ammo1e) {
						dispValues[fields.Weap_dmgType[0]][fields.Weap_dmgType[1]] = parsedAmmoData.dmgType;
						dispValues[fields.Weap_category[0]][fields.Weap_category[1]] = 'AMMO';
						ammoRow = tableInfo.WEAP.tableFind( fields.Weap_name, [dispValues[fields.Weap_name[0]][fields.Weap_name[1]],'-'] );
					} else {
						ammoRow = tableInfo.WEAP.tableFind( fields.Weap_name, dispValues[fields.Weap_name[0]][fields.Weap_name[1]] );
					};
					tableInfo.WEAP = tableInfo.WEAP.addTableRow( ammoRow, dispValues );
				};
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
            weaponType = weaponType ? weaponType.dbName() : '',
            weaponSuperType = weaponSuperType ? weaponSuperType.dbName() : '',
		    ammoTypeCheck = new RegExp('[\[,\s]t:\\s*?'+weaponType+'\\s*?[,\\]]', 'i'),
			ammoSuperTypeCheck = new RegExp('[\[,\s]st:\\s*?'+weaponSuperType+'\\s*?[,\\]]', 'i'),
			rangeTypeCheck = new RegExp( '[\[,\s]t:\\s*?'+weaponType+'\\s*?[,\\]]','i' ),
		    rangeSuperTypeCheck = new RegExp( '[\[,\s]t:\\s*?'+weaponSuperType+'\\s*?[,\\]]','i' ),
			attrs, sortKeys, ammoName, ammoTrueName, ammo, ammoData, rangeData, t;
			
		while (!_.isUndefined(ammoName = MagicItems.tableLookup(fields.Items_name,++miIndex,false))) {
		    ammoTrueName = MagicItems.tableLookup(fields.Items_trueName,miIndex) || ammoName;
			let ammoMatch;
			ammo = abilityLookup( fields.MagicItemDB, ammoTrueName, charCS );
    		ammoData = rangeData = [];

			if (ammo.obj) {
				ammoMatch = resolveData( ammoTrueName, fields.WeaponDB, reAmmoData, charCS, reWeapSpecs, miIndex ).raw;
				if (ammoMatch && ammoMatch[0] && ammoMatch[0][0]) {
					ammoData = ammoMatch.filter(elem => ammoTypeCheck.test(elem[0].dbName()));
					if (!ammoData.length) {
						ammoData = ammoMatch.filter(elem => ammoSuperTypeCheck.test(elem[0].dbName()));
						t = weaponSuperType;
					} else {
						t = weaponType;
					}
				}
				if (ammoData && ammoData.length) {
					if (!tableInfo.ammoTypes.includes(ammoTrueName+'-'+t)) {
						ammoMatch = resolveData( ammoTrueName, fields.WeaponDB, reRangeData, charCS, reWeapSpecs, miIndex ).raw;
						if (ammoMatch && ammoMatch[0]) {
							rangeData = ammoMatch.filter(elem => rangeTypeCheck.test(elem[0].dbName()));
							if (!rangeData.length) {
																			  
								rangeData = ammoMatch.filter(elem => rangeSuperTypeCheck.test(elem[0].dbName()));
							}
						}
						if (!!rangeData.length) {
							if (inQuiver) {
								blankWeapon( charCS, tableInfo, ['AMMO'], ammoTrueName );
								tableInfo = insertAmmo( charCS, ammoTrueName, ammoData, rangeData, tableInfo, t, sb, miIndex );
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

	var addWeapon = function( charCS, hand, noOfHands, handIndex, dancing, tableInfo, Quiver, InHandTable, weapDef=[] ) {

		var lineNo = InHandTable.tableLookup( fields.InHand_index, handIndex );

		if (isNaN(lineNo) || lineNo < -3) {
			if (!!hand) {
				setAttr( charCS, hand, '' );
			}
			if (lineNo != '-') log('addWeapon: illegal Items table lineNo '+lineNo);
			return [tableInfo,Quiver];
		}
		
		var weaponDB = InHandTable.tableLookup( fields.InHand_db, handIndex ),
			weaponName = InHandTable.tableLookup( fields.InHand_name, handIndex ),
			weaponTrueName = InHandTable.tableLookup( fields.InHand_trueName, handIndex, weaponName ),
			weaponRow = InHandTable.tableLookup( fields.InHand_index, handIndex ),
			weaponAttkCount = InHandTable.tableLookup( fields.InHand_attkCount, handIndex ),
			item = abilityLookup(weaponDB, weaponTrueName, charCS),
			weaponSpecs = item.specs(reWeapon) || [],
			toHitSpecs = resolveData( weaponTrueName, weaponDB, reToHitData, charCS, reWeapSpecs, weaponRow ).raw,
			dmgSpecs = resolveData( weaponTrueName, weaponDB, reDmgData, charCS, reWeapSpecs, weaponRow ).raw,
			ammoSpecs = resolveData( weaponTrueName, weaponDB, reAmmoData, charCS, reWeapSpecs, weaponRow ).raw,
			weapParsed = resolveData( weaponTrueName, weaponDB, reWeapData, charCS, {message:reWeapSpecs.message,cmd:reWeapSpecs.cmd,type:reWeapSpecs.type,superType:reWeapSpecs.superType}, weaponRow ).parsed,
			re = /[\s\-]*?/gi,
			minSpec = parseInt(weapDef[0]) || 0,
			maxSpec = _.isUndefined(weapDef[1]) ? ((_.isUndefined(weapDef[0]) || !weapDef[0] || isNaN(weapDef[0]) || !weapDef[0]) ? weaponSpecs.length : (minSpec+1)) : ((parseInt(weapDef[1]) || (weaponSpecs.length-1))+1),
			tempObj, values, dispValues, group,
			wt = weapParsed.type, wst = weapParsed.superType, 
			dmg, weapRow, weap1e = false,
			dancingProf;
			
		var parseARadj = function( dispVals, vals ) {
			var valArray = vals.aradj.split('|'),
				fillVal = valArray[0] || 0;
			for (let i=valArray.length; i<=10; i++) valArray.unshift(fillVal);
			for (let i=0; i<=10; i++) {
				if (_.isUndefined(dispVals[fields[fields.ThacAdjPrefix[0]+i][0]])) continue;
				dispVals[fields[fields.ThacAdjPrefix[0]+i][0]][fields[fields.ThacAdjPrefix[0]+i][1]] = valArray[i] || 0;
			};
			return dispVals;
		}
		
		blankWeapon( charCS, tableInfo, ['MELEE','RANGED','DMG','AMMO','MAGIC','WEAP'], weaponTrueName );
		
		if (!!hand) {
			setAttr( charCS, hand, weaponName );
		}
		
		for (let i=0; i<Math.min(weaponSpecs.length,toHitSpecs.length); i++) {
			let weapon = weaponSpecs[i];
				
			if ((noOfHands == 0) || (weapon[3].toUpperCase().includes(noOfHands+'H'))) {
				let toHit = toHitSpecs[i][0],
					innate = weapon[2].toLowerCase().includes('innate'),
					weapData = parseData( toHit, reWeapSpecs ),
					attk2H = noOfHands == 2 ? 1 : 0,
					weapType = wt || weapData.type || weapon[1],
					weapSuperType = wst || weapData.superType || weapon[4],
					proficiency = innate ? 0 : proficient( charCS, weaponTrueName, weapType, weapSuperType );
					
				if (!levelTest( charCS, weapData )) continue;
				
				if (!_.isUndefined(tableInfo.WEAP)) {
					dispValues = initValues( tableInfo.WEAP.fieldGroup );
				}
						
				if (weapon[2].toLowerCase().includes('melee') && i >= minSpec && i < maxSpec) {
					values = initValues( tableInfo.MELEE.fieldGroup );
					values[fields.MW_name[0]][fields.MW_name[1]]='Unknown weapon';
					values = setAttackTableRow( charCS, tableInfo.MELEE.fieldGroup, weapon, weapData, proficiency, values );
					if (!_.isUndefined( tableInfo.WEAP )) {
						dispValues = setAttackTableRow( charCS, tableInfo.WEAP.fieldGroup, weapon, weapData, proficiency, dispValues );
					}
					values[fields.MW_miName[0]][fields.MW_miName[1]]=weaponTrueName;
					values[fields.MW_twoHanded[0]][fields.MW_twoHanded[1]]=attk2H;
					values[fields.MW_profLevel[0]][fields.MW_profLevel[1]]=Math.min(proficiency,1);
					values[fields.MW_type[0]][fields.MW_type[1]]=(innate ? 'innate|'+weapType : weapType);
					values[fields.MW_superType[0]][fields.MW_superType[1]]=weapSuperType;
					values[fields.MW_dancing[0]][fields.MW_dancing[1]]=(dancing?1:0);
					values[fields.MW_attkCount[0]][fields.MW_attkCount[1]]=weaponAttkCount;
					values[fields.MW_hand[0]][fields.MW_hand[1]]=handIndex;
					if (!values[fields.MW_message[0]][fields.MW_message[1]]) values[fields.MW_message[0]][fields.MW_message[1]] = weapParsed.message;
					if (!values[fields.MW_cmd[0]][fields.MW_cmd[1]]) values[fields.MW_cmd[0]][fields.MW_cmd[1]] = weapParsed.cmd;
					dancingProf = parseInt(values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.MW_dancingProf[0]][fields.MW_dancingProf[1]]=proficiency;
					} else if (dancing) {
						values[fields.MW_noAttks[0]][fields.MW_noAttks[1]] = getAttksPerRound(charCS, 
														 dancingProf, 
														 weapon,
														 weapData.noAttks );
					}
					if (_.isUndefined( weapRow = tableInfo.MELEE.tableFind( fields.MW_name, '-', false ))) weapRow = tableInfo.MELEE.sortKeys.length;
					tableInfo.MELEE.addTableRow( weapRow, values );
						
					if (dmgSpecs && i<dmgSpecs.length && !_.isUndefined(dmg=dmgSpecs[i][0])) {
						values = setAttackTableRow( charCS, tableInfo.DMG.fieldGroup, weapon, parseData( dmg, reWeapSpecs ), proficiency, initValues( tableInfo.DMG.fieldGroup ) );
						values[fields.Dmg_type[0]][fields.Dmg_type[1]]=innate ? 'innate' : weapType;
						values[fields.Dmg_superType[0]][fields.Dmg_superType[1]]=weapSuperType;
						values[fields.Dmg_miName[0]][fields.Dmg_miName[1]]=weaponTrueName;
						values[fields.Dmg_specialist[0]][fields.Dmg_specialist[1]]=(proficiency>=1)?1:0;
						
						tableInfo.DMG.addTableRow( weapRow, values );
						if (!_.isUndefined( tableInfo.WEAP )) {
							weap1e = true;
							dispValues = setAttackTableRow( charCS, tableInfo.WEAP.fieldGroup, weapon, parseData( dmg, reWeapSpecs, false ), proficiency, dispValues );
							dispValues[fields.Weap_miName[0]][fields.Weap_miName[1]]=weaponTrueName;
							dispValues[fields.Weap_profFlag[0]][fields.Weap_profFlag[1]]=proficiency>=0 ? 0 : 1;
							dispValues[fields.Weap_dmgType[0]][fields.Weap_dmgType[1]]=weapData.dmgType;
							dispValues[fields.Weap_qty[0]][fields.Weap_qty[1]]=1;
							dispValues[fields.Weap_category[0]][fields.Weap_category[1]]='MELEE';
							dispValues = parseARadj( dispValues, weapData );
							tableInfo.WEAP.addTableRow( tableInfo.WEAP.tableFind( fields.Weap_name, '-', false ), dispValues );
						};
					} else {
						sendError('Weapon '+weaponTrueName+' missing damage spec');
					}

				} else if (weapon[2].toLowerCase().includes('ranged') && i >= minSpec && i < maxSpec) {
					values = setAttackTableRow( charCS, tableInfo.RANGED.fieldGroup, weapon, weapData, proficiency, initValues( tableInfo.RANGED.fieldGroup ) );
					values[fields.RW_miName[0]][fields.RW_miName[1]]=weaponTrueName;
					values[fields.RW_twoHanded[0]][fields.RW_twoHanded[1]]=attk2H;
					values[fields.RW_profLevel[0]][fields.RW_profLevel[1]]=Math.min(proficiency,0);
					values[fields.RW_type[0]][fields.RW_type[1]]=innate ? 'innate|'+weapType : weapType;
					values[fields.RW_superType[0]][fields.RW_superType[1]]=weapSuperType;
					values[fields.RW_dancing[0]][fields.RW_dancing[1]]=(dancing?1:0);
					values[fields.RW_attkCount[0]][fields.RW_attkCount[1]]=parseInt(weaponAttkCount || 1) || 1;
					values[fields.RW_hand[0]][fields.RW_hand[1]]=handIndex;
					if (!values[fields.RW_message[0]][fields.RW_message[1]]) values[fields.RW_message[0]][fields.RW_message[1]] = weapParsed.message;
					if (!values[fields.RW_cmd[0]][fields.RW_cmd[1]]) values[fields.RW_cmd[0]][fields.RW_cmd[1]] = weapParsed.cmd;
					dancingProf = parseInt(values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]);
					if (isNaN(dancingProf)) {
						values[fields.RW_dancingProf[0]][fields.RW_dancingProf[1]]=parseInt(proficiency || 0) || 0;
					} else if (dancing) {
						values[fields.RW_noAttks[0]][fields.RW_noAttks[1]] = getAttksPerRound(charCS, 
														 dancingProf, 
														 weapon,
														 weapData.noAttks );
					}

					if (_.isUndefined( weapRow = tableInfo.RANGED.tableFind( fields.RW_name, '-', false ))) weapRow = tableInfo.RANGED.sortKeys.length;
					tableInfo.RANGED.addTableRow( weapRow, values );
					if (!_.isUndefined( tableInfo.WEAP ) && !weap1e && (!ammoSpecs || !ammoSpecs.length)) {
						dispValues = setAttackTableRow( charCS, tableInfo.WEAP.fieldGroup, weapon, weapData, proficiency, dispValues );
						dispValues[fields.Weap_miName[0]][fields.Weap_miName[1]]=weaponTrueName;
						dispValues[fields.Weap_profFlag[0]][fields.Weap_profFlag[1]]=proficiency>=0 ? 0 : 1;
						dispValues[fields.Weap_dmgType[0]][fields.Weap_dmgType[1]]=weapData.dmgType;
						dispValues[fields.Weap_qty[0]][fields.Weap_qty[1]]=1;
						dispValues[fields.Weap_category[0]][fields.Weap_category[1]]='RANGED';
						dispValues = parseARadj( dispValues, weapData );
						tableInfo.WEAP.addTableRow( tableInfo.WEAP.tableFind( fields.Weap_name, '-', false ), dispValues );
					};
					let attkStrBonus = values[fields.RW_strBonus[0]][fields.RW_strBonus[1]];
					if (ammoSpecs && ammoSpecs.length && ammoSpecs[0].length && ammoSpecs[0][0].trim().length) {
						let rangeSpecs = resolveData( weaponTrueName, weaponDB, /}}\s*RangeData\s*=(.*?){{/im, charCS, {}, weaponRow ).raw;
						if (rangeSpecs && rangeSpecs.length) {
							if (!weaponDB.startsWith(fields.WeaponDB)) lineNo = '';
							if (!_.isUndefined( tableInfo.WEAP )) {
								dispValues[fields.Weap_dmgType[0]][fields.Weap_dmgType[1]]=weapData.dmgType;
								dispValues[fields.Weap_profFlag[0]][fields.Weap_profFlag[1]]=proficiency>=0 ? '0' : '1';
							}
							log('addWeapon: self ammoed '+weaponTrueName);
							tableInfo = insertAmmo( charCS, weaponTrueName, ammoSpecs, rangeSpecs, tableInfo, weapType, attkStrBonus, lineNo, dispValues );
							values = initValues( fieldGroups.QUIVER.prefix );
							values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
							values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
							values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo;
							Quiver.addTableRow( Quiver.index, values );
							Quiver.index++;
						}

					} else {
						[tableInfo,Quiver] = addAmmo( charCS, tableInfo, Quiver, weapType, weapSuperType, attkStrBonus, true );
					}
				} else if (weapon[2].toLowerCase().includes('magic')) {
					values = setAttackTableRow( charCS, tableInfo.MAGIC.fieldGroup, weapon, weapData, proficiency, initValues( tableInfo.MAGIC.fieldGroup ) );
					values[fields.Magic_miName[0]][fields.Magic_miName[1]]=weaponTrueName;
					values[fields.Magic_type[0]][fields.Magic_type[1]]=innate ? 'innate' : weapType;
					values[fields.Magic_superType[0]][fields.Magic_superType[1]]=weapSuperType;
//					tableInfo.MAGIC.addTableRow( tableInfo.MAGIC.tableFind( fields.Magic_name, '-', false ), values );
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
			weap = abilityLookup(fields.WeaponDB, weaponName, charCS),
			weaponSpecs = weap.specs(/}}\s*Specs\s*=(.*?){{/im) || [],
			ammoData = resolveData( weaponTrueName, fields.WeaponDB, reAmmoData, charCS, {type:reWeapSpecs.type}, lineNo ).raw,
			toHitData = resolveData( weaponTrueName, fields.WeaponDB, reToHitData, charCS, {type:reWeapSpecs.type}, lineNo ).parsed;
			
		for (let i=0; i<weaponSpecs.length; i++) {
			let weapon = weaponSpecs[i];
			if (weapon[2].toLowerCase().includes('ranged')) {
				if (ammoData && ammoData.length) {
					let values = initValues( Quiver.fieldGroup );
					values[fields.Quiver_name[0]][fields.Quiver_name[1]] = weaponName;
					values[fields.Quiver_trueName[0]][fields.Quiver_trueName[1]] = weaponTrueName;
					values[fields.Quiver_index[0]][fields.Quiver_index[1]] = lineNo
					Quiver.addTableRow( Quiver.index, values );
					Quiver.index++;
				} else {
					[weaponInfo, Quiver] = addAmmo( charCS, weaponInfo, Quiver, (toHitData.type || weapon[1]), weapon[4], 0, false );
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
	 
	var updateAttackTables = function( charCS, senderId, InHandTable, Quiver, weaponInfo, rowInHand, miSelection, handedness, weapDef=[] ) {
	
		return new Promise(resolve => {

			try {
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
						[weaponInfo,Quiver] = addWeapon( charCS, hand, handedness, i, (i>(noHands+base)), weaponInfo, Quiver, InHandTable, weapDef );
					} else {
						if (weapon != '-' && index != '' && index >= -1) {
							Quiver = putAmmoInQuiver( charCS, weaponInfo, Quiver, index );
						}
					}
					i++;
				}
			} catch (e) {
				sendCatchError('AttackMaster',msg_orig[senderId],e);
			} finally {
				setTimeout(() => {
					resolve([weaponInfo,Quiver]);
				}, 10);
			}
		});
	}
	
/* ----------------------------------------- Armour Management Functions ----------------------------------------------- */
	
	/*
	 * Function to scan the magic item bag for any armour, shields or 
	 * protective items and build and return a table of the best versions 
	 * of each type
	 */
	 
	var scanForModifiers = function( tokenID, charCS, scanType='', dmgType='nadj', priority='ac' ) {
		
		var Items = getTableField( charCS, {}, fields.Items_table, fields.Items_trueName ),
			i = Items.table[1]-1,
			totalFlag = false,
			noDex = false,
			armourMsg = [],
			itemName, itemTrueName,
			acValues = {armour:{name:'Clothes',magic:false,specs:['','Clothes','armour','0H','cloth'],data:{ac:10,adj:0,dexBonus:1,madj:0,thac0adj:0,hpadj:0,rules:'',ppa:0,ola:0,rta:0,msa:0,hsa:0,dna:0,cwa:0,rla:0,iba:0}}},
			dexBonus = parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0),
			monsterAC = attrLookup( charCS, fields.MonsterAC, null, null, null, false, false ),
			itemDef, itemSpecs, itemData, itemCharge;
			

		var assessItem = function( itemName, itemTrueName, itemCharge, itemSpecs, itemData ) {
			for (let i=0; i<Math.min(itemSpecs.length,itemData.length); i++) {
				let	acData = parseData( itemData[i][0], reACSpecs, true, charCS, itemTrueName );
				if (!acData.name.length) continue;
				let acRules = acData.rules.toLowerCase().replace(/[_\s]/g,'').split('|').map(r => r.replace(/\-/g,(match,i,s)=>(i>0?'':match))),
					itemType = itemSpecs[i][1].dbName(),
					itemClass = itemSpecs[i][2].dbName(),
					itemHands = itemSpecs[i][3].toUpperCase(),
					itemSuperType = itemSpecs[i][4].dbName(),
					isMod = itemClass.includes('modifiers');
					
				if ((isMod && acData.ac.length) || itemClass.includes('armor') || itemClass.includes('armour')) itemClass = 'armour';
				if (itemClass.includes('shield')) itemClass = 'shield';
				if (itemClass.includes('helm')) itemClass = 'helm';
				
				if (!isMod && !state.attackMaster.weapRules.allowArmour && !classAllowedItem(charCS, itemName, itemType, itemSuperType, 'ac')) {
					armourMsg.push(itemName+' is not of a usable type');
				} else if (itemClass === 'shield' && itemHands != '0H' && !shieldInHand(charCS,itemTrueName)) {
					armourMsg.push(itemName+' is not currently in hand');
				} else if (itemClass.includes('ring') && itemHands != '0H' && !ringOnHand(charCS,itemTrueName)) {
					armourMsg.push(itemName+' is not currently worn');
				} else if (acRules.includes('+inhand') && itemHands != '0H' && !itemInHand(charCS,itemTrueName)) {
					armourMsg.push(itemName+' is not currently in hand');
				} else {
					let ac = parseInt(acData.ac || 10),
						adj = (parseInt(acData.adj || 0) + (dmgType !== 'nadj' ? parseInt(acData[dmgType] || 0) : 0)),
						dexAdj = Math.floor(dexBonus * parseFloat(Math.max(acData.dexBonus,0))),
						thac0adj = parseInt(acData.thac0adj) || 0,
						hpadj = (parseInt(acData.hpadj) || 0) + (parseInt(acData.hptemp) || 0),
						dmgadj = (parseInt(acData.dmgadj) || 0),
						diff;
						
					if (itemSpecs[i][2].includes('totalac')) {
						itemClass = 'armour';
						if (totalFlag) {
							diff = priority === 'thac0' ? (acValues.armour.data.thac0adj - thac0adj) :
								  (priority === 'hp' ? (acValues.armour.data.hpadj + acValues.armour.data.hptemp - hpadj) :
								  (priority === 'dmg' ? (acValues.armour.data.dmgadj - dmgadj) :
								  ((acValues.armour.data.ac - acValues.armour.data.adj - (acValues.armour.data.dexBonus*dexBonus)) - (ac - adj - dexAdj))));
						} else {
							_.each( acValues, e => armourMsg.push(e.name+' is overridden by another item'));
							acValues = {};
							diff = 1;
							totalFlag = true;
						}
						if (diff > 0) noDex = (parseInt(acData.dexBonus) <= 0);
					} else if (!totalFlag) {
						protectionMI: {
							if (acRules.includes('-magic') && acValues.armour.magic) {
								armourMsg.push(itemName+' does not add to magical armour');
								break protectionMI;
							}
							if (acRules.includes('-'+acValues.armour.specs[4].dbName()) || (acRules.includes('-acall') && !acRules.includes('+'+acValues.armour.specs[4].dbName()))) {
								armourMsg.push(itemName+' will not combine with '+acValues.armour.name);
								break protectionMI;
							}
							if (acRules.includes('-shield') && !!acValues.shield) {
								armourMsg.push(itemName+' does not combine with shields of any type');
								break protectionMI;
							}
							
							if (_.isUndefined(acValues[itemClass])) {
								diff = 1;
							} else {
								let data = acValues[itemClass].data,
									itemAC = parseInt(data.ac || 10),
									itemAdj = (parseInt(data.adj || 0) + (dmgType !== 'nadj' ? parseInt(data[dmgType] || 0) : 0));
								diff = priority === 'thac0' ? (data.thac0adj - thac0adj) :
									  (priority === 'hp' ? (data.hpadj + data.hptemp - hpadj) :
									  (priority === 'dmg' ? (data.dmgadj - dmgadj) :
									  ((itemAC - itemAdj - (parseInt(data.dexBonus)*dexBonus)) - (ac - adj - dexAdj))));
							}
						}
					} else {
						armourMsg.push(itemName+' is overridden by another item');
						diff = undefined;
					}
					
					if (!_.isUndefined(diff)) {
						let itemCursed = (itemCharge || '').includes('cursed');
						let classCursed = acValues[itemClass] && (acValues[itemClass].charge || '').includes('cursed');
						if (diff < 0 && (!itemCursed || classCursed)) {
							armourMsg.push(itemName+' is not the best '+itemClass+' available');
						} else if (diff == 0 && (!itemCursed || classCursed)) {
							armourMsg.push(itemName+' is no better than other '+itemClass+'s');
						} else if (acValues[itemClass] && !classCursed && itemCursed && diff <= 0) {
							armourMsg.push('Oh! You do not seem to be wearing '+acValues[itemClass].name+'...');
						} 
						if ((!classCursed && itemCursed) || diff > 0) {
							if (diff > 0 && acValues[itemClass] && acValues[itemClass].name) {
								armourMsg.push(acValues[itemClass].name+' is not the best '+itemClass+' available');
							}
							acValues[itemClass] = {name:itemName, trueName:itemTrueName, row:i, specs:itemSpecs[i], charge:(itemCharge || ''), data:acData};
							
							if (itemClass === 'armour') {
								acValues.armour.magic = parseInt(acData.adj||0)!==0;
							}
							acValues = _.omit( acValues, function(item,iClass) {
								let itemRules = item.data.rules.toLowerCase();
									
								if (itemClass === 'armour' && acValues.armour.magic && item.data.rules.includes('-magic')) {
									armourMsg.push(item.name+' cannot be used alongside magical armour');
									return true;
								}
								if (itemClass === 'armour' && (item.data.rules.includes('-'+itemSuperType) || (item.data.rules.includes('-acall') && !item.data.rules.includes('+'+itemSuperType)))) {
									armourMsg.push(item.name+' cannot be used alongside '+acValues.armour.specs[4]);
									return true;
								}
								if (item.data.rules.includes('-'+itemClass)) {
									armourMsg.push(item.name+' cannot be used alongside '+itemName);
									return true;
								}
								return false;	
							});
						}
					}
				}
			}
			return;
		};
		
		if (monsterAC && monsterAC.length) {
			acValues.armour.name = 'Monster';
			acValues.armour.specs= ['','Monster','armour','0H','skin'];
			acValues.armour.data.ac = parseInt(monsterAC);
		}
		if ((attrLookup( charCS, fields.Gender ) || '').toLowerCase() === 'container') return {acValues: acValues, msgs: armourMsg, dexFlag: !noDex};
		
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_name );
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_type );
		Items = getTableField( charCS, Items, fields.Items_table, fields.Items_trueType );
		while (!_.isUndefined(itemName = Items.tableLookup( fields.Items_name, ++i, false ))) {
//			log('scanForModifiers: scaning item '+itemName);
			itemTrueName = Items.tableLookup( fields.Items_trueName, i ) || itemName;
			if (itemName.length && itemName != '-') {
				itemCharge = (Items.tableLookup( fields.Items_trueType, i ) || Items.tableLookup( fields.Items_type, i ) || '').toLowerCase();
				itemDef = abilityLookup( fields.MagicItemDB, itemTrueName, charCS, true );
				if (itemDef.obj) {
					itemSpecs = itemDef.specs(/}}\s*Specs\s*=(.*?(?:armou?r|shield|helm|barding|protection).*?){{/im) || [];
					itemData = resolveData( itemTrueName, fields.MagicItemDB, reACData, charCS, reACSpecs, i ).raw;
					assessItem( itemName, itemTrueName, itemCharge, itemSpecs, itemData );
//					log('scanForModifiers: assessed item '+itemName+', itemCharge='+itemCharge+', itemSpecs='+itemSpecs);
				}
			}
		}
		let	Mods = getTable( charCS, fieldGroups.MODS );
		
		for (let modRow=Mods.table[1]; modRow<Mods.sortKeys.length; modRow++) {
			let curRound = parseInt(Mods.tableLookup(fields.Mods_curRound,modRow)) || 0,
				toRound = parseInt(Mods.tableLookup(fields.Mods_round,modRow)) || 0,
				diff = state.initMaster.round - curRound;
			if (diff < 0 && !isNaN(toRound) && toRound !== 0) toRound += diff;
			curRound += diff;
			let modTokenID = Mods.tableLookup( fields.Mods_tokenID, modRow ) || tokenID,
				modToken = getObj('graphic',modTokenID);
			if (!modToken) modToken = getObj('graphic',tokenID);
			if (!modToken) continue;
			let hpBar = getTokenValue( modToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ),
				currentHP = parseInt(hpBar.val || 0),
				maxHP = (hpBar.name ? (hpBar.barName.startsWith('bar') ? modToken.get(hpBar.barName+'_max') : (attrLookup(charCS,[hpBar.name,'max']) || 0)) : (attrLookup(charCS,fields.MaxHP) || 0)),
				thac0Bar = getTokenValue(modToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base),
				currentThac0 = parseInt(thac0Bar.val || 20),
				hpBase = 0,
				modType = Mods.tableLookup( fields.Mods_modType, modRow );
			if (modType === 'hp') {
				hpBase = Mods.tableLookup(fields.Mods_baseCount,modRow) || 0;
			};
			
//			log('scanForModifiers: modRow = '+modRow+', curRound = '+curRound+', toRound = '+toRound+', diff = '+diff+', table Mods_round = '+Mods.tableLookup(fields.Mods_round,modRow));
			let specs = Mods.tableLookup( fields.Mods_saveSpec, modRow ),
				adjData = parseData('['+specs+']',reModSpecs);
			
			if (hpBase > currentHP && !adjData.hptemp && !adjData.thac0adj && !adjData.sav.length) {
				Mods.addTableRow(modRow);
//				log('scanForModifiers: hpBase = '+hpBase+', currentHP = '+currentHP+', so deleting row '+modRow);
				continue;
			} else if (!isNaN(toRound) && toRound !== 0 && toRound < state.initMaster.round) {
				currentThac0 -= adjData.thac0adj;
				if (hpBase !== 0 && (hpBase + adjData.hpperm) > maxHP && currentHP > maxHP) {
					currentHP = maxHP;
				}
				if (hpBase !== 0 && (hpBase + adjData.hpadj) > currentHP) {
					currentHP = hpBase;
				} else {
					currentHP -= adjData.hpadj;
				}
				currentHP -= adjData.hptemp;
				if (hpBar.barName.startsWith('bar')) {
					modToken.set(hpBar.barName+'_value',currentHP);
				} else if (hpBar.name) {
					setAttr( charCS, [hpBar.name,'current'], currentHP );
				};
//				if (thac0Bar.barName.startsWith('bar')) {
//					modToken.set(thac0Bar.barName+'_value', currentThac0 );
//				} else if (thac0Bar.name) {
//					setAttr( charCS, [thac0Bar.name,'current'], currentThac0 );
//				};
				Mods.addTableRow(modRow);
//				log('scanForModifiers: round exceeded, processed hp and removing row '+modRow);
				continue;
			} else if (diff !== 0 && !isNaN(toRound) && toRound !== 0) {
				Mods.tableSet(fields.Mods_curRound,modRow,curRound);
				Mods.tableSet(fields.Mods_round,modRow,toRound);
			}
			let modName = Mods.tableLookup( fields.Mods_name, modRow ),
				modSpell = Mods.tableLookup( fields.Mods_spellName, modRow );
				
//			log('scanForModifiers: Mod '+modName+' | '+modSpell+' is for token '+modTokenID+' which is '+(modTokenID != tokenID ? 'not' : '')+' equal to '+tokenID);

			if ((modTokenID.length && modTokenID !== tokenID) || (scanType && modType !== scanType) || !modName.length || modName === '-') continue;
			let modSpecs = [...('['+modName+',Modifiers|'+modName+',0H,'+modSpell+']').matchAll(reSpecsAll)],
				modData = [...('[a:'+modName+','+specs+']').matchAll(reDataAll)];

//			log('scanForModifiers: modName = '+modName+', modTokenID = '+modTokenID+', modType = '+modType+', scanType = '+scanType+', modSpecs = '+modSpecs+', modData = '+modData);

			assessItem( modName, modSpell, 'uncharged', modSpecs, modData );
		};
		
//		_.each( acValues, (v,i) => log('scanForModifiers: acValues contains '+v.name));

		return {acValues: acValues, msgs: armourMsg, dexFlag: !noDex};
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
		var rollSpec = attkMacro.match(/}}\s*Specs\s*=\s*\[\s*\w[\s\|\w\-]*?\s*,\s*\w[\s\|\w\-]*?\w\s*,\s*(\d+d\d+)\s*,\s*\w[\s\|\w\-]*?\w\s*\]/im);
		return rollSpec ? rollSpec[1] : fields.ToHitRoll;
	};
	
	/*
	 * Parse a dice spec to find the max possible roll for defaultStatus
	 */
	 
	var maxDiceRoll = function( diceRoll ) {
		var rollData = diceRoll.match(/(\d+)d(\d+)/i)||fields.ToHitRoll.match(/(\d+)d(\d+)/i)||['1d20',1,20];
		return {min:(parseInt(rollData[1])||1), max:((parseInt(rollData[1]) * parseInt(rollData[2]))||20)};
	};
	
	/*
	 * Slot a damage message into a parsed attack macro, if given
	 */
	 
	var addDmgMsg = function( attkMacro, cmdMsg='', dmgMsg='', weapMsg='' ) {
		if (cmdMsg.length || dmgMsg.length || weapMsg.length) {
			let parts = attkMacro.match(/^([^]*}}[^}{]*?$)([^]*)/);
			if (parts && parts[1]) {
				attkMacro = parts[1] + (weapMsg.trim().length ? ('{{desc7='+parseStr(weapMsg.trim())+'}}') : '') + (dmgMsg.trim().length ? ('{{desc8='+parseStr(dmgMsg.trim())+'}}') : '') + (cmdMsg.trim().length ? ('{{desc9='+parseStr(cmdMsg.trim())+'}}') : '') + (parts[2] || '');
			}
		}
		return attkMacro;
	}
	
	/*
	 * Slot a command message (often an API command for a Targeted
	 * success or failure) into a parsed attack macro, if given
	 */
	 
	var addCommands = function( attkMacro, successCmd='', failCmd='' ) {
		if (successCmd.length || failCmd.length) {
			let parts = attkMacro.match(/^([^]*}}[^}{]*?$)([^]*)/);
			if (parts && parts[1]) {
				attkMacro = parts[1] + (successCmd.trim().length ? ('{{successCmd='+parseStr(successCmd.trim())+'}}') : '') + (failCmd.trim().length ? ('{{failCmd='+parseStr(failCmd.trim())+'}}') : '') + (parts[2] || '');
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
					dmgMsg 	= parseStr(args[5] || attrLookup( charCS, fields.Dmg_specials ) || ''),
					attkMsg = parseStr(args[5] || attrLookup( charCS, fields.Attk_specials ) || ''),
					curToken = getObj('graphic',tokenID),
					tokenName = curToken.get('name'),
					charName = charCS.get('name'),
					raceName = attrLookup( charCS, fields.Race ) || '',
					thac0 = parseInt(attrLookup( charCS, fields.MonsterThac0 ) || 20),
					monsterCritHit = parseInt(attrLookup( charCS, fields.MonsterCritHit ) || 20),
					monsterCritMiss = parseInt(attrLookup( charCS, fields.MonsterCritMiss ) || 1),
					monsterDmg1 = (attrLookup( charCS, fields.Monster_dmg1 ) || '0').split(','),
					monsterDmg2 = (attrLookup( charCS, fields.Monster_dmg2 ) || '0').split(','),
					monsterDmg3 = (attrLookup( charCS, fields.Monster_dmg3 ) || '0').split(','),
					magicHitAdj = parseInt(attrLookup( charCS, fields.Magical_hitAdj ) || 0) + thac0 - parseInt(getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base).val || 20),
					magicDmgAdj = (parseInt(attrLookup( charCS, [fields.Magical_dmgAdj[0]+tokenID,fields.Magical_dmgAdj[1],undefined],null,null,null,null,false) || attrLookup( charCS, fields.Magical_dmgAdj )) || 0)
								+ (parseInt(attrLookup( charCS, fields.Legacy_dmgAdj )) || 0),
					strHit 		= parseInt(attrLookup( charCS, fields.Strength_hit ) || 0),
					strDmg 		= parseInt(attrLookup( charCS, fields.Strength_dmg ) || 0),
					ACnoMods	= '[[0+@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror}]]',
					noModsACtxt = 'No Mods',
					tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, fields.Thac0_base ).barName,
					tokenAC		= (tokenACname ? ('[[0+@{Target|Select Target|'+tokenACname+'}&{noerror}]]') : ''),
					tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ).barName,
					tokenHP		= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'}&{noerror}]]') : ''),
					tokenMaxHP	= (tokenHPname ? ('[[0+@{Target|Select Target|'+tokenHPname+'|max}&{noerror}]]') : ''),
					slashWeap	= true,
					pierceWeap	= true,
					bludgeonWeap= true,
					weapTypeTxt, ACslash, ACpierce, ACbludgeon,
					sACtxt, pACtxt, bACtxt,
					slashACtxt, pierceACtxt, bludgeonACtxt, 				
					attkMacro, attkMacroDef, errFlag=false,
					macroNameRoot, dmgSMmacro, dmgSMmacroName,
					targetStatsName, dmgLmacro, dmgLmacroName, 
					monDmg, monDmg1, monDmg2, monDmg3, monAttk, dmgType, attkPlus;

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
										 .replace( /@{selected\|token_id}/gi , tokenID )
										 .replace( /@{selected\|character_id}/gi , charCS.id )
										 .replace( /{selected\|/gi , '{'+charName+'|' )
										 .replace( /\^\^tname\^\^/gi , tokenName )
										 .replace( /\^\^cid\^\^/gi , charCS.id )
										 .replace( /\^\^tid\^\^/gi , tokenID )
										 .replace( /\^\^pid\^\^/gi , senderId )
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
										 .replace( /\^\^strAttkBonus\^\^/gi , (strHit + attkPlus) )
										 .replace( /\^\^strDmgBonus\^\^/gi , strDmg )
										 .replace( /\^\^monsterDmgMacroSM\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /\^\^monsterDmgMacroL\^\^/gi , (charName+'|'+dmgLmacroName))
										 .replace( /\^\^monsterDmgMacro1\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /\^\^monsterDmgMacro2\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /\^\^monsterDmgMacro3\^\^/gi , (charName+'|'+dmgSMmacroName))
										 .replace( /&#44;/gi , ',' );
					
					return attkMacro;
				};
				
				monDmg1 = reDiceRollSpec.test(monsterDmg1[0]) ? monsterDmg1[0] : (monsterDmg1[1] || '');
				monDmg2 = reDiceRollSpec.test(monsterDmg2[0]) ? monsterDmg2[0] : (monsterDmg2[1] || '');
				monDmg3 = reDiceRollSpec.test(monsterDmg3[0]) ? monsterDmg3[0] : (monsterDmg3[1] || '');
					
				dmgMsg = dmgMsg.split('$$');
				if (dmgMsg.length == 1) dmgMsg[2] = dmgMsg[1] = dmgMsg[0];
				attkMsg = attkMsg.split('$$');
				if (attkMsg.length == 1) attkMsg[2] = attkMsg[1] = attkMsg[0];
				
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
				if (!(errFlag = (!attkMacroDef.obj || !attkMacroDef.obj[1]))) {
					attkMacro = attkMacroDef.obj[1].body;
					dmgSMmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgSM'+qualifier, charCS, silent );
					if (!dmgSMmacroDef.obj) {
						dmgSMmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgSM', charCS );
					}
				}
				if (!(errFlag = errFlag || !dmgSMmacroDef.obj || !dmgSMmacroDef.obj[1])) {
					dmgSMmacro = dmgSMmacroDef.obj[1].body;
					dmgLmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgL'+qualifier, charCS, silent );
					if (!dmgLmacroDef.obj) {
						dmgLmacroDef = abilityLookup( fields.AttacksDB, 'Mon-DmgL', charCS );
					}
				}
				if (!(errFlag = errFlag || !dmgLmacroDef.obj || !dmgLmacroDef.obj[1])) {
					dmgLmacro = dmgLmacroDef.obj[1].body;
				
					macroNameRoot = 'Do-not-use-Monster-';
					
					for (let i=1; i<=3; i++) {
						monAttk = (i==1 ? attk1 : (i==2 ? attk2 : attk3));
						
						if (monAttk) {
							monDmg  = (i==1 ? monDmg1 : (i==2 ? monDmg2 : monDmg3));
							dmgType = (i==1 ? monsterDmg1 : (i==2 ? monsterDmg2 : monsterDmg3 ));
							attkPlus = parseInt(dmgType[4]) || 0;
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
							ACslash		= slashWeap ? '[[(0+(@{Target|Select Target|'+fields.SlashAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
							ACpierce	= pierceWeap ? '[[(0+(@{Target|Select Target|'+fields.PierceAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
							ACbludgeon	= bludgeonWeap ? '[[(0+(@{Target|Select Target|'+fields.BludgeonAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
							sACtxt		= slashWeap ? 'S' : '';
							pACtxt		= pierceWeap ? 'P' : '';
							bACtxt		= bludgeonWeap ? 'B' : '';
							slashACtxt	= slashWeap ? 'Slash' : '';
							pierceACtxt	= pierceWeap ? 'Pierce' : '';
							bludgeonACtxt=bludgeonWeap ? 'Bludgeon' : '';
							if (abilityType == Attk.TARGET) {
								setAbility( charCS, macroNameRoot+'Attk-'+i, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( attkMacro, attkMsg[i-1], dmgMsg[i-1] )));
							} else {
								setAbility( charCS, macroNameRoot+'Attk-'+i, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( attkMacro, attkMsg[i-1] )) );
							}
							setAbility( charCS, dmgSMmacroName, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( dmgSMmacro, dmgMsg[i-1] )));
							setAbility( charCS, dmgLmacroName, parseMonAttkMacro(args, charCS, attkType, addDmgMsg( dmgLmacro, dmgMsg[i-1] )));
						}
					}
				}
			} catch (e) {
				log('AttackMaster buildMonsterAttkMacros: JavaScript '+e.name+': '+e.message+' while processing monster '+charName);
				sendDebug('AttackMaster buildMonsterAttkMacros: JavaScript '+e.name+': '+e.message+' while processing monster '+charName);
				sendCatchError('AttackMaster',msg_orig[senderId],e);
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
					dmgMsg		= parseStr(args[5] || attrLookup( charCS, fields.Dmg_specials ) || ''),
					attkMsg		= parseStr(args[5] || attrLookup( charCS, fields.Attk_specials ) || ''),
					errFlag		= false,
					curToken 	= getObj('graphic',tokenID),
					tokenName 	= curToken.get('name'),
					charName	= charCS.get('name'),
					raceName	= attrLookup( charCS, fields.Race ) || 'human',
					classes		= classObjects( charCS, senderId ),
					thac0		= parseInt(handleGetBaseThac0(charCS)) || 20,
					mwNumber    = mwIndex + (fields.MW_table[1]==0 ? 1 : 2),
					weaponName 	= tableInfo.MELEE.tableLookup( fields.MW_name, mwIndex ),
					miName		= tableInfo.MELEE.tableLookup( fields.MW_miName, mwIndex ),
					miRowref	= attrLookup( charCS, fields.InHand_index, fields.InHand_table, tableInfo.MELEE.tableLookup( fields.MW_hand, mwIndex ) ),
					dancing		= tableInfo.MELEE.tableLookup( fields.MW_dancing, mwIndex ),
					attkAdj 	= (tableInfo.MELEE.tableLookup( fields.MW_adj, mwIndex ) || '0').replace(/^[+-]([+-])/,'$1'),
					attkStyleAdj= tableInfo.MELEE.tableLookup( fields.MW_styleAdj, mwIndex ),
					strBonus 	= tableInfo.MELEE.tableLookup( fields.MW_strBonus, mwIndex ),
					mwType 		= tableInfo.MELEE.tableLookup( fields.MW_type, mwIndex ),
					mwSuperType = tableInfo.MELEE.tableLookup( fields.MW_superType, mwIndex ),
					slashWeap	= parseInt(tableInfo.MELEE.tableLookup( fields.MW_slash, mwIndex )),
					pierceWeap	= parseInt(tableInfo.MELEE.tableLookup( fields.MW_pierce, mwIndex )),
					bludgeonWeap= parseInt(tableInfo.MELEE.tableLookup( fields.MW_bludgeon, mwIndex )),
					touchWeap	= tableInfo.MELEE.tableLookup( fields.MW_touch, mwIndex ) === '1',
					weapCmd		= parseStr((tableInfo.MELEE.tableLookup( fields.MW_cmd, mwIndex ) || ''),replacers),
					weapMsg		= tableInfo.MELEE.tableLookup( fields.MW_message, mwIndex ),
					hitCharges  = tableInfo.MELEE.tableLookup( fields.MW_charges, mwIndex ),
					weapObj		= abilityLookup( fields.WeaponDB, miName, charCS, true ),
					weapCharge  = tableInfo.MELEE.tableLookup( fields.MW_chargeType, mwIndex ) || (weapObj.obj ? weapObj.obj[1].charge.toLowerCase() : '' ),
					weapCharged = (!(['uncharged','cursed','cursed+uncharged','single-uncharged'].includes(weapCharge)) ? weapCharge  : ''),
					weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
					dmgName		= tableInfo.DMG.tableLookup( fields.Dmg_name, mwIndex ) || miName,
					dmgAdj 		= tableInfo.DMG.tableLookup( fields.Dmg_adj, mwIndex ) || '0',
					dmgStyleAdj = tableInfo.DMG.tableLookup( fields.Dmg_styleAdj, mwIndex ),
					dmgSM 		= tableInfo.DMG.tableLookup( fields.Dmg_dmgSM, mwIndex ),
					dmgSMstyle	= tableInfo.DMG.tableLookup( fields.Dmg_styleSM, mwIndex ),
					dmgL 		= tableInfo.DMG.tableLookup( fields.Dmg_dmgL, mwIndex ),
					dmgLstyle	= tableInfo.DMG.tableLookup( fields.Dmg_styleL, mwIndex ),
					dmgStrBonus = (tableInfo.DMG.tableLookup( fields.Dmg_strBonus, mwIndex ) || 1),
					dmgCharges  = tableInfo.DMG.tableLookup( fields.Dmg_charges, mwIndex ),
					dmgCharge	= tableInfo.DMG.tableLookup( fields.Dmg_chargeType, mwIndex ) || (weapObj.obj ? weapObj.obj[1].charge.toLowerCase() : '' ),
					dmgCharged	= (!(['uncharged','cursed','cursed+uncharged','single-uncharged'].includes(dmgCharge)) ? dmgCharge  : ''),
					touchDmg	= tableInfo.DMG.tableLookup( fields.Dmg_touch, mwIndex ) === '1',
					weapDmgCmd	= parseStr(tableInfo.DMG.tableLookup( fields.Dmg_cmd, mwIndex ) || ''),
					weapDmgMsg	= tableInfo.DMG.tableLookup( fields.Dmg_message, mwIndex ),
					strHit 		= attrLookup( charCS, fields.Strength_hit ) || 0,
					strDmg 		= attrLookup( charCS, fields.Strength_dmg ) || 0,
					rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
								+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
					fighterType = attrLookup( charCS, fields.Fighter_class ) || '',
					ranger		= fighterType.toUpperCase() == 'RANGER' || fighterType.toUpperCase() == 'MONSTER' || _.some(classes, c => parseFloat(c.classData.twoWeapPen == 0)),
//					magicHitAdj = parseInt(attrLookup( charCS, fields.Magical_hitAdj ) || 0) + thac0 - parseInt(getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base).val || 20), 

					thac0Bar = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base),
					magicHitAdj = thac0Bar.name && thac0Bar.barName.startsWith('bar') ? (thac0 - thac0Bar.val) : ((attrLookup( charCS, fields.Magical_hitAdj ) || 0) + (attrLookup( charCS, [fields.Magical_hitAdj[0]+tokenID,fields.Magical_hitAdj[1], fields.Magical_hitAdj[2]] ) || 0) + (attrLookup( charCS, fields.Legacy_hitAdj ) || 0)),

					magicDmgAdj = (parseInt(attrLookup( charCS, [fields.Magical_dmgAdj[0]+tokenID,fields.Magical_dmgAdj[1],undefined],null,null,null,null,false) || attrLookup( charCS, fields.Magical_dmgAdj )) || 0)
								+ (parseInt(attrLookup( charCS, fields.Legacy_dmgAdj )) || 0),
					thac0		= parseInt(handleGetBaseThac0( charCS, tableInfo.MELEE.tableLookup( fields.MW_magicThac0, mwIndex ) || thac0)),
					primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
					twPen		= Math.min(parseFloat(attrLookup( charCS, fields.TwoWeapStylePenalty ) || 9.9), classes.map(c => parseFloat(c.classData.twoWeapPen)).reduce((prev,cur) => (Math.min(prev,cur)))),
					twoWeapPenalty = (ranger || primeWeapon < 1) ? 0 : (-1*(((mwIndex*2)+(fields.MW_table[1]==0?1:3)) == primeWeapon ? Math.floor(twPen) : Math.floor((10*twPen)%10))),
					proficiency = dancing != 1 ? proficient( charCS, weaponName, mwType, mwSuperType ) : tableInfo.MELEE.tableLookup( fields.MW_dancingProf, mwIndex ),
					race		= raceMods( charCS, mwType, mwSuperType ),
					arAdjust	= (tableInfo.MELEE.tableLookup( fields.MW_aradj, mwIndex ) || '0|0|0|0|0|0|0|0|0').split('|'),
					arVal 		= '[[0+(@{Target|Select Target|'+fields.BaseAC[0]+(fields.BaseAC[1] === 'max' ? '|max' : '')+'}&{noerror})]]',
					tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, fields.Thac0_base ).barName,
					tokenAC 	= (tokenACname ? ('[[0+(@{Target|Select Target|'+tokenACname+'}&{noerror})]]') : ''),
					tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ).barName,
					tokenHP 	= (tokenHPname ? ('[[0+(@{Target|Select Target|'+tokenHPname+'}&{noerror})]]') : ''),
					tokenMaxHP	= (tokenHPname ? ('[[0+(@{Target|Select Target|'+tokenHPname+'|max}&{noerror})]]') : ''),
					ACnoMods	= '[[0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})]]',
					ACslash		= slashWeap ? '[[(0+(@{Target|Select Target|'+fields.SlashAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
					ACpierce	= pierceWeap ? '[[(0+(@{Target|Select Target|'+fields.PierceAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
					ACbludgeon	= bludgeonWeap ? '[[(0+(@{Target|Select Target|'+fields.BludgeonAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
					noModsACtxt = 'No Mods',
					sACtxt		= slashWeap ? 'S' : '',
					pACtxt		= pierceWeap ? 'P' : '',
					bACtxt		= bludgeonWeap ? 'B' : '',
					slashACtxt	= slashWeap ? 'Slash' : '',
					pierceACtxt	= pierceWeap ? 'Pierce' : '',
					bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
					attkMacro	= '',
					attkMacroDef, dmgMacroDef, qualifier, arTable;
					
//				log('buildMWattkMacros: weapon '+weaponName+' command is '+weapCmd);
					
				var parseMWattkMacro = function( args, charCS, attkType, macro ) {
					
					var	toHitRoll = getToHitRoll( macro ),
						dmgSMroll = dmgSM,
						dmgLroll  = dmgL,
						minMaxRoll= maxDiceRoll(toHitRoll),
						critHit	  = Math.min((tableInfo.MELEE.tableLookup( fields.MW_critHit, mwIndex )||minMaxRoll.max),(tableInfo.MELEE.tableLookup( fields.MW_styleCH, mwIndex )||minMaxRoll.max)),
						critMiss  = Math.max((tableInfo.MELEE.tableLookup( fields.MW_critMiss, mwIndex )||minMaxRoll.min),(tableInfo.MELEE.tableLookup( fields.MW_styleCM, mwIndex )||minMaxRoll.min));

					if (attkType.toUpperCase() == Attk.ROLL) {
						toHitRoll = ('?{Roll To-Hit Dice|'+toHitRoll+'}');
						dmgSMroll = '?{Roll Damage vs TSM|'+dmgSM+'}';
						dmgLroll  = '?{Roll Damage vs LH|'+dmgL+'}';
					}
					macro = macro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,senderId,false) )
										 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,senderId,true) )
										 .replace( /\^\^defaultTemplate\^\^/gi , fields.targetTemplate)
										 .replace( /\^\^cname\^\^/gi , charName )
										 .replace( /\^\^tname\^\^/gi , tokenName )
										 .replace( /\^\^cid\^\^/gi , charCS.id )
										 .replace( /\^\^tid\^\^/gi , tokenID )
										 .replace( /\^\^pid\^\^/gi , senderId )
										 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
										 .replace( /\^\^weapAttkAdj\^\^/gi , attkAdj )
										 .replace( /\^\^weapStyleAdj\^\^/gi , attkStyleAdj )
										 .replace( /\^\^strAttkBonus\^\^/gi , strHit )
										 .replace( /\^\^weapStrHit\^\^/gi , strBonus )
										 .replace( /\^\^profPenalty\^\^/gi , Math.min(proficiency,0) )
										 .replace( /\^\^specProf\^\^/gi , proficiency == 2 ? 1 : 0 )
										 .replace( /\^\^masterProf\^\^/gi , proficiency > 2 ? 1 : 0 )
										 .replace( /\^\^raceBonus\^\^/gi , race )
										 .replace( /\^\^magicAttkAdj\^\^/gi , magicHitAdj )
										 .replace( /\^\^twoWeapPenalty\^\^/gi , twoWeapPenalty )
										 .replace( /\^\^weapDmgAdj\^\^/gi , dmgAdj )
										 .replace( /\^\^weapStyleDmgAdj\^\^/gi , dmgStyleAdj )
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
										 .replace( /\^\^armorRating\^\^/gi , arVal )
										 .replace( /\^\^arAdjVals\^\^/gi , arAdjust )
										 .replace( /\^\^arSlash\^\^/gi , arSlash )
										 .replace( /\^\^arPierce\^\^/gi , arPierce )
										 .replace( /\^\^arBludgeon\^\^/gi , arBludgeon )
										 .replace( /\^\^arTable\^\^/gi , arTable )
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
										 .replace( /\^\^weapStyleDmgSM\^\^/gi , dmgSMstyle )
										 .replace( /\^\^weapStrDmg\^\^/gi , dmgStrBonus )
										 .replace( /\^\^weapDmgL\^\^/gi , dmgLroll )
										 .replace( /\^\^weapStyleDmgL\^\^/gi , dmgLstyle )
										 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
										 .replace( /\^\^targetHP\^\^/gi , tokenHP )
										 .replace( /\^\^targetMaxHP\^\^/gi , tokenMaxHP )
										 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
										 .replace( /\^\^mwSMdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgSM-MW'+mwNumber))
										 .replace( /\^\^mwLHdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgL-MW'+mwNumber))
										 .replace( /&#44;/gi , ',' );

					return macro;
				};
				
				arTable = '<table width="100%"; table-layout="fixed";><tr width="100%" style="border-collapse:collapse; border:medium solid black; text-align:center;">';
				for (let i=2; i<arAdjust.length+2; i++) arTable += '<th style="border-collapse:collapse; border:medium solid black; text-align:center;">'+i+'</th>';
				arTable += '</tr><tr width="100%" style="border-collapse:collapse; border:medium solid black; text-align:center;">';
				for (let i=0; i<arAdjust.length; i++) arTable += '<td style="border-collapse:collapse; border:medium solid black; text-align:center;">'+arAdjust[i]+'</td>';
				arTable += '</tr></table>';
				
				attkMsg = attkMsg.split('$$')[0];
				dmgMsg = dmgMsg.split('$$')[0];
				for (let j=arAdjust.length; j<=10; j++) arAdjust.unshift(arAdjust[0]);
				arAdjust = arAdjust.join('|');

				var attkType = args[2],
					abilityType = attkType.toUpperCase(),
					abilityRoot = 'MW-' + (abilityType == Attk.TARGET ? 'Targeted-Attk' : 'ToHit'),
					arSlash = slashWeap ? ('[[('+arVal+'[AR Adjust='+arAdjust+'])]]') : '',
					arPierce = pierceWeap ? ('[[('+arVal+'[AR Adjust='+arAdjust+'])]]') : '',
					arBludgeon = bludgeonWeap ? ('[[('+arVal+'[AR Adjust='+arAdjust+'])]]') : '';
					
				attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+miName, charCS, silent );
				qualifier = '-'+miName;
				if (!attkMacroDef.obj) {
					qualifier = '-'+_.find( mwType.split('|'), t => {
						attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+t, charCS, silent );
						return !!attkMacroDef.obj;
					});
				}
				if (!attkMacroDef.obj) {
					qualifier = '-'+_.find( mwSuperType.split('|'), t => {
						attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+t, charCS, silent );
						return !!attkMacroDef.obj;
					});
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
					attkMacro = dmgCharged && dmgCharges ? ('\n!magic --mi-charges '+tokenID+'|-'+dmgCharges+'|'+miName+'||'+dmgCharged) : ''; 
					attkMacro += weapDmgCmd ? ('\n' + weapDmgCmd) : '';
					attkMacro += touchDmg ? ('\n!attk --blank-weapon '+tokenID+'|'+miName+'|silent') : '';
				}
				if (!(errFlag = errFlag || !dmgMacroDef.obj || !dmgMacroDef.obj[1])) {
					setAbility( charCS, 'Do-not-use-DmgSM-MW'+mwNumber, (parseMWattkMacro(args, charCS, attkType, addDmgMsg( dmgMacroDef.obj[1].body, dmgMsg, weapDmgMsg ))+attkMacro));
					dmgMacroDef = abilityLookup( fields.AttacksDB, (backstab ? ('MW-Backstab-DmgL'+qualifier) : ('MW-DmgL'+qualifier)), charCS, silent );
					if (!dmgMacroDef.obj) dmgMacroDef = abilityLookup( fields.AttacksDB, (backstab ? 'MW-Backstab-DmgL' : 'MW-DmgL'), charCS );
					attkMacro = dmgCharged && dmgCharges ? ('\n!magic --mi-charges '+tokenID+'|-'+dmgCharges+'|'+miName+'||'+dmgCharged) : ''; 
					attkMacro += weapDmgCmd ? ('\n' + weapDmgCmd) : '';
					attkMacro += touchDmg ? ('\n!attk --blank-weapon '+tokenID+'|'+miName+'|silent') : '';
				}
				if (!(errFlag = errFlag || !dmgMacroDef.obj || !dmgMacroDef.obj[1])) {
					setAbility( charCS, 'Do-not-use-DmgL-MW'+mwNumber, (parseMWattkMacro(args, charCS, attkType, addDmgMsg( dmgMacroDef.obj[1].body, dmgMsg, weapDmgMsg ))+attkMacro));
					hitCharges = (hitCharges == '' ? 1 : hitCharges);
					attkMacro = weapCharged && hitCharges ? ('\n!magic --mi-charges '+tokenID+'|-'+hitCharges+'|'+miName+'||'+weapCharged) : ''; 
					attkMacro += ((weaponName !== miName) && (attrLookup( charCS, fields.Items_reveal, fields.Items_table, miRowref ) || '').toLowerCase() === 'use') ? ('\n!magic --button GM-ResetSingleMI|'+tokenID+'|'+miRowref+'|silent') : '';
					attkMacro += weapCmd ? ('\n' + weapCmd) : '';
					attkMacro += touchWeap ? ('\n!attk --blank-weapon '+tokenID+'|'+miName+'|silent') : '';
					if (abilityType == Attk.TARGET) {
						let dmgMacro = dmgCharged && dmgCharges ? ('!magic --mi-charges '+tokenID+'|-'+dmgCharges+'|'+miName+'||'+dmgCharged+'\n') : ''; 
						weapDmgCmd = weapDmgCmd.replace(/@{target\|.*?\|?token_id}/igm,'@{target|Select Target|token_id}');
						dmgMacro += weapDmgCmd ? (weapDmgCmd + '\n') : '';
						dmgMacro += touchDmg ? ('!attk --blank-weapon '+tokenID+'|'+miName+'|silent\n') : '';
						attkMacro = attkMacro.replace(/@{target\|.*?\|?token_id}/igm,'@{target|Select Target|token_id}');
						setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, (parseMWattkMacro(args, charCS, attkType, addDmgMsg( addCommands(attkMacroDef.obj[1].body, dmgMacro, ''), [attkMsg,weapMsg].join('\n'), (attkMsg !== dmgMsg ? dmgMsg : ''), (weapMsg !== weapDmgMsg ? weapDmgMsg : '') )) + attkMacro));
					} else {
						setAbility( charCS, 'Do-not-use-Attk-MW'+mwNumber, (parseMWattkMacro(args, charCS, attkType, addDmgMsg( attkMacroDef.obj[1].body, attkMsg, weapMsg )) + attkMacro));
					}
				}
			} catch (e) {
				log('AttackMaster buildMWattkMacros: JavaScript '+e.name+': '+e.message+' while building weapon '+miName);
				sendDebug('AttackMaster buildMWattkMacros: JavaScript '+e.name+': '+e.message+' while building weapon '+miName);
				sendCatchError('AttackMaster',msg_orig[senderId],e);
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
	 
	var buildRWattkMacros = function( args, senderId, charCS, tableInfo, ranges ) {
		
		var tokenID 	= args[1],
			attkType 	= args[2],
			abilityType = attkType.toUpperCase(),
			abilityRoot = 'RW-' + (abilityType == Attk.TARGET ? 'Targeted-Attk' : 'ToHit'),
			rwIndex 	= parseInt(args[3]),
			ammoIndex 	= parseInt(args[4]),
			dmgMsg		= parseStr(args[5] || attrLookup( charCS, fields.Dmg_specials ) || ''),
			attkMsg		= parseStr(args[5] || attrLookup( charCS, fields.Attk_specials ) || ''),
			errFlag		= false,
			curToken 	= getObj('graphic',tokenID),
			tokenName 	= curToken.get('name'),
			charName	= charCS.get('name'),
			raceName	= attrLookup( charCS, fields.Race ) || 'human',
			classes		= classObjects( charCS, senderId ),
			thac0		= parseInt(handleGetBaseThac0( charCS ) || 20),
			rwNumber    = rwIndex + (fields.RW_table[1]==0 ? 1 : 2),
			weaponName 	= tableInfo.RANGED.tableLookup( fields.RW_name, rwIndex ),
			miName		= tableInfo.RANGED.tableLookup( fields.RW_miName, rwIndex ),
			miRowref	= attrLookup( charCS, fields.InHand_index, fields.InHand_table, tableInfo.RANGED.tableLookup( fields.RW_hand, rwIndex ) ),
			dancing		= tableInfo.RANGED.tableLookup( fields.RW_dancing, rwIndex ),
			attkAdj 	= tableInfo.RANGED.tableLookup( fields.RW_adj, rwIndex ) || '0',
			weapDmgAdj	= /^[+-][+-]/.test(attkAdj),
			attkStyleAdj= tableInfo.RANGED.tableLookup( fields.RW_styleAdj, rwIndex ),
			weapStrBonus= tableInfo.RANGED.tableLookup( fields.RW_strBonus, rwIndex ),
			weapDexBonus= tableInfo.RANGED.tableLookup( fields.RW_dexBonus, rwIndex ),
			rwType 		= tableInfo.RANGED.tableLookup( fields.RW_type, rwIndex ),
			rwSuperType = tableInfo.RANGED.tableLookup( fields.RW_superType, rwIndex ),
			touchWeap	= tableInfo.RANGED.tableLookup( fields.RW_touch, rwIndex ) === '1',
			weapCmd		= parseStr(tableInfo.RANGED.tableLookup( fields.RW_cmd, rwIndex ) || ''),
			weapMsg		= tableInfo.RANGED.tableLookup( fields.RW_message, rwIndex ),
			hitCharges	= tableInfo.RANGED.tableLookup( fields.RW_charges, rwIndex ),
			styleRangeMods=tableInfo.RANGED.tableLookup(fields.RW_styleRangeMods, rwIndex ),
			weapChgType = tableInfo.RANGED.tableLookup(fields.RW_chargeType, rwIndex ) || 'uncharged',
			weapCharged = !(['uncharged','cursed','cursed+uncharged','single-uncharged'].includes(weapChgType)),
			slashWeap	= parseInt(tableInfo.RANGED.tableLookup( fields.RW_slash, rwIndex )),
			pierceWeap	= parseInt(tableInfo.RANGED.tableLookup( fields.RW_pierce, rwIndex )),
			bludgeonWeap= parseInt(tableInfo.RANGED.tableLookup( fields.RW_bludgeon, rwIndex )),
			weapTypeTxt = (slashWeap?'S':'')+(pierceWeap?'P':'')+(bludgeonWeap?'B':''),
			ammoName    = tableInfo.AMMO.tableLookup( fields.Ammo_name, ammoIndex ),
			ammoMIname  = tableInfo.AMMO.tableLookup( fields.Ammo_miName, ammoIndex ),
			ammoRowref	= tableInfo.AMMO.tableLookup( fields.Ammo_miIndex, ammoIndex ),
			dmgAdj 		= tableInfo.AMMO.tableLookup( fields.Ammo_adj, ammoIndex ),
			dmgStyleAdj = tableInfo.AMMO.tableLookup( fields.Ammo_styleAdj, ammoIndex ),
			dmgSM 		= tableInfo.AMMO.tableLookup( fields.Ammo_dmgSM, ammoIndex ),
			dmgSMstyle	= tableInfo.AMMO.tableLookup( fields.Ammo_styleSM, ammoIndex ),
			dmgL 		= tableInfo.AMMO.tableLookup( fields.Ammo_dmgL, ammoIndex ),
			dmgLstyle	= tableInfo.AMMO.tableLookup( fields.Ammo_styleL, ammoIndex ),
			dmgCharges	= tableInfo.AMMO.tableLookup( fields.Ammo_charges, ammoIndex ),
			ammoStrBonus= tableInfo.AMMO.tableLookup( fields.Ammo_strBonus, ammoIndex ),
			ammoQty		= tableInfo.AMMO.tableLookup( fields.Ammo_qty, ammoIndex ),
			ammoReuse	= tableInfo.AMMO.tableLookup( fields.Ammo_reuse, ammoIndex ),
			touchAmmo	= tableInfo.AMMO.tableLookup( fields.Ammo_touch, ammoIndex ) === '1',
			ammoCmd		= parseStr(tableInfo.AMMO.tableLookup( fields.Ammo_cmd, ammoIndex ) || ''),
			ammoMsg		= tableInfo.AMMO.tableLookup( fields.Ammo_message, ammoIndex ),
			ammoObj		= abilityLookup( fields.WeaponDB, ammoMIname, charCS, true ),
			weapObj		= abilityLookup( fields.WeaponDB, miName, charCS, true ),
			ammoChgType = weapObj.obj ? weapObj.obj[1].charge.toLowerCase() : '',
			ammoCharged	= !(['uncharged','recharging','self-charging'].includes(ammoChgType) || ammoChgType.includes('cursed')),
			strHit 		= parseInt(attrLookup( charCS, fields.Strength_hit ) || 0),
			strDmg 		= parseInt(attrLookup( charCS, fields.Strength_dmg ) || 0),
			dexMissile	= attrLookup( charCS, fields.Dex_missile ) || 0,
			rogueLevel 	= parseInt(attrLookup( charCS, fields.Rogue_level ) || 0)
						+ (((attrLookup( charCS, fields.Wizard_class ) || '').toUpperCase() == 'BARD') ? parseInt(attrLookup( charCS, fields.Wizard_level ) || 0) : 0),
			fighterType = attrLookup( charCS, fields.Fighter_class ) || '',
			ranger		= fighterType.toUpperCase() == 'RANGER' || fighterType.toUpperCase() == 'MONSTER',
//			magicHitAdj = parseInt(attrLookup( charCS, fields.Magical_hitAdj ) || 0) + thac0 - parseInt(getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base).val || 20), 

			thac0Bar = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base),
			magicHitAdj = thac0Bar.name && thac0Bar.barName.startsWith('bar') ? (thac0 - thac0Bar.val) : ((attrLookup( charCS, fields.Magical_hitAdj ) || 0) + (attrLookup( charCS, [fields.Magical_hitAdj[0]+tokenID,fields.Magical_hitAdj[1], fields.Magical_hitAdj[2]] ) || 0) + (attrLookup( charCS, fields.Legacy_hitAdj ) || 0)),

			thac0		= parseInt(handleGetBaseThac0( charCS, tableInfo.RANGED.tableLookup( fields.RW_magicThac0, rwIndex ) || thac0)),
			magicDmgAdj = (parseInt(attrLookup( charCS, [fields.Magical_dmgAdj[0]+tokenID,fields.Magical_dmgAdj[1],undefined],null,null,null,null,false) || attrLookup( charCS, fields.Magical_dmgAdj )) || 0)
						+ (parseInt(attrLookup( charCS, fields.Legacy_dmgAdj )) || 0),
			primeWeapon = attrLookup( charCS, fields.Primary_weapon ) || 0,
			twPen		= Math.min(parseFloat(attrLookup( charCS, fields.TwoWeapStylePenalty ) || 9.9), classes.map(c => parseFloat(c.classData.twoWeapPen)).reduce((prev,cur) => (Math.min(prev,cur)))),
			twoWeapPenalty = (ranger || primeWeapon < 1) ? 0 : (((rwIndex*2)+(fields.RW_table[1]==0?2:4)) == primeWeapon ? Math.floor(twPen) : Math.floor((10*twPen)%10)),
			proficiency = dancing != 1 ? proficient( charCS, weaponName, rwType, rwSuperType ) : tableInfo.RANGED.tableLookup( fields.RW_dancingProf, rwIndex ),
			race		= raceMods( charCS, rwType, rwSuperType ),
			arAdjust	= (tableInfo.RANGED.tableLookup( fields.RW_aradj, rwIndex ) || '0|0|0|0|0|0|0|0|0').split('|'),
			arVal 		= '[[0+(@{Target|Select Target|'+fields.BaseAC[0]+(fields.BaseAC[1] === 'max' ? '|max' : '')+'}&{noerror})]]',
			tokenACname = getTokenValue( curToken, fields.Token_AC, fields.AC, fields.MonsterAC, fields.Thac0_base ).barName,
			tokenAC 	= (tokenACname ? ('[[((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))+((0+(@{Target|Select Target|'+fields.StdAC[0]+'|max}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror}))))]]') : ''),
			tokenHPname = getTokenValue( curToken, fields.Token_HP, fields.HP, null, fields.Thac0_base ).barName,
			tokenHP 	= (tokenHPname ? ('[[0+(@{Target|Select Target|'+tokenHPname+'})]]') : ''),
			tokenMaxHP	= (tokenHPname ? ('[[0+(@{Target|Select Target|'+tokenHPname+'|max}&{noerror})]]') : ''),
			ACnoMods	= '[[0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})]]',
			ACslash		= slashWeap ? '[[(0+(@{Target|Select Target|'+fields.SlashAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
			ACpierce	= pierceWeap ? '[[(0+(@{Target|Select Target|'+fields.PierceAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
			ACbludgeon	= bludgeonWeap ? '[[(0+(@{Target|Select Target|'+fields.BludgeonAC[0]+'}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
			noModsACtxt = 'No Mods',
			slashACtxt	= slashWeap ? 'Slash' : '',
			pierceACtxt	= pierceWeap ? 'Pierce' : '',
			bludgeonACtxt= bludgeonWeap ? 'Bludgeon' : '',
			sACtxt		= slashWeap ? 'S' : '',
			pACtxt		= pierceWeap ? 'P' : '',
			bACtxt		= bludgeonWeap ? 'B' : '',
			missileACnoMods		= '[[(0+(@{Target|Select Target|'+fields.StdAC[0]+'|max}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]',
			missileACslash		= slashWeap ? '[[(0+(@{Target|Select Target|'+fields.SlashAC[0]+'|max}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
			missileACpierce		= pierceWeap ? '[[(0+(@{Target|Select Target|'+fields.PierceAC[0]+'|max}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
			missileACbludgeon	= bludgeonWeap ? '[[(0+(@{Target|Select Target|'+fields.BludgeonAC[0]+'|max}&{noerror}))+((0+(@{Target|Select Target|'+tokenACname+'}&{noerror}))-(0+(@{Target|Select Target|'+fields.StdAC[0]+'}&{noerror})))]]' : '',
			missileACnoModsTxt  = 'No Mods',
			missileACslashTxt	= slashWeap ? 'Slash' : '',
			missileACpierceTxt	= pierceWeap ? 'Pierce' : '',
			missileACbludgeonTxt= bludgeonWeap ? 'Bludgeon' : '',
			missileACsTxt		= slashWeap ? 'S' : '',
			missileACpTxt		= pierceWeap ? 'P' : '',
			missileACbTxt		= bludgeonWeap ? 'B' : '',
			attkMacro, attkMacroDef, qualifier, arTable;

		arTable = '<table width="100%"; table-layout="fixed";><tr width="100%" style="border-collapse:collapse; border:medium solid black; text-align:center;">';
		for (let i=2; i<arAdjust.length+2; i++) arTable += '<th style="border-collapse:collapse; border:medium solid black; text-align:center;">'+i+'</th>';
		arTable += '</tr><tr width="100%" style="border-collapse:collapse; border:medium solid black; text-align:center;">';
		for (let i=0; i<arAdjust.length; i++) arTable += '<td style="border-collapse:collapse; border:medium solid black; text-align:center;">'+arAdjust[i]+'</td>';
		arTable += '</tr></table>';
				
		styleRangeMods = parseData( (styleRangeMods.replace(/=/g,':').replace(/\|/,',') || ''), reRangeMods );
		attkMsg = attkMsg.split('$$')[0];
		dmgMsg = dmgMsg.split('$$')[0];								   
		for (let j=arAdjust.length; j<=10; j++) arAdjust.unshift(arAdjust[0]);
		arAdjust = arAdjust.join('|');
		
		if (weapDmgAdj) attkAdj = attkAdj.slice(1);
		
		var arSlash = slashWeap ? ('[[('+arVal+'[AR Adjust='+arAdjust+'])]]') : '',
			arPierce = pierceWeap ? ('[[('+arVal+'[AR Adjust='+arAdjust+'])]]') : '',
			arBludgeon = bludgeonWeap ? ('[[('+arVal+'[AR Adjust='+arAdjust+'])]]') : '';

		var parseRWattkMacro = function( args, charCS, attkType, range, attkMacro ) {

			var toHitRoll = getToHitRoll( attkMacro ),
				rangeMods = attkMacro.match(/}}\s*RangeMods\s*=\s*(\[[-\w\d\+\,\:]+?\])\s*{{/im),
				dmgSMroll = dmgSM,
				dmgLroll  = dmgL,
				minMaxRoll= maxDiceRoll(toHitRoll),
				critHit   = Math.min((tableInfo.RANGED.tableLookup( fields.RW_critHit, rwIndex )||minMaxRoll.max),(tableInfo.RANGED.tableLookup( fields.RW_styleCH, rwIndex )||minMaxRoll.max)),
				critMiss  = Math.max((tableInfo.RANGED.tableLookup( fields.RW_critMiss, rwIndex )||minMaxRoll.min),(tableInfo.RANGED.tableLookup( fields.RW_styleCM, rwIndex )||minMaxRoll.min)),
				rangeMod;
				
			if (attkType == Attk.ROLL) {
				toHitRoll = '?{Roll To-Hit Dice|'+toHitRoll+'}';
				dmgSMroll = '?{Roll Damage vs TSM|'+dmgSM+'}';
				dmgLroll  = '?{Roll Damage vs LH|'+dmgL+'}';
			}

			rangeMods = parseData( ((rangeMods && !_.isNull(rangeMods)) ? rangeMods[1] : ''), reRangeMods );
			rangeMod = Math.max((attrLookup( charCS, [fields.RWrange_mod[0]+range, fields.RWrange_mod[1]] ) || rangeMods[range]),styleRangeMods[range]);
				
			attkMacro = attkMacro.replace( /\^\^toWho\^\^/gi , sendToWho(charCS,senderId,false) )
								 .replace( /\^\^toWhoPublic\^\^/gi , sendToWho(charCS,senderId,true) )
								 .replace( /\^\^defaultTemplate\^\^/gi , fields.targetTemplate)
								 .replace( /\^\^cname\^\^/gi , charName )
								 .replace( /\^\^tname\^\^/gi , tokenName )
								 .replace( /\^\^cid\^\^/gi , charCS.id )
								 .replace( /\^\^tid\^\^/gi , tokenID )
								 .replace( /\^\^pid\^\^/gi , senderId )
								 .replace( /\^\^toHitRoll\^\^/gi , toHitRoll )
								 .replace( /\^\^weapAttkAdj\^\^/gi , weapDmgAdj ? 0 : attkAdj )
								 .replace( /\^\^weapStyleAdj\^\^/gi , attkStyleAdj )
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
								 .replace( /\^\^ammoDmgAdj\^\^/gi , (dmgAdj + (weapDmgAdj ? attkAdj : '')))
								 .replace( /\^\^ammoStyleDmgAdj\^\^/gi , dmgStyleAdj )
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
								 .replace( /\^\^armorRating\^\^/gi , arVal )
								 .replace( /\^\^arAdjVals\^\^/gi , arAdjust )
								 .replace( /\^\^arSlash\^\^/gi , arSlash )
								 .replace( /\^\^arPierce\^\^/gi , arPierce )
								 .replace( /\^\^arBludgeon\^\^/gi , arBludgeon )
								 .replace( /\^\^arTable\^\^/gi , arTable )
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
								 .replace( /\^\^distPB\^\^/gi , (ranges.length >= 4 ? ranges[0] : Math.min(ranges[0],30) ))
								 .replace( /\^\^distS\^\^/gi , (ranges.length >= 4 ? ranges[1] : ranges[0]) )
								 .replace( /\^\^distM\^\^/gi , (ranges.length >= 4 ? ranges[2] : ranges[Math.min(1,ranges.length-1)]) )
								 .replace( /\^\^distL\^\^/gi , (ranges.length >= 4 ? ranges[3] : ranges[Math.min(2,ranges.length-1)]) )
								 .replace( /\^\^range\^\^/gi , range )
								 .replace( /\^\^rangeN\^\^/gi , (range == 'N' ? 1 : 0) )
								 .replace( /\^\^rangePB\^\^/gi , (range == 'PB' ? 1 : 0) )
								 .replace( /\^\^rangeS\^\^/gi , (range == 'S' ? 1 : 0) )
								 .replace( /\^\^rangeM\^\^/gi , (range == 'M' ? 1 : 0) )
								 .replace( /\^\^rangeL\^\^/gi , (range == 'L' ? 1 : 0) )
								 .replace( /\^\^rangeF\^\^/gi , (range == 'F' ? 1 : 0) )
								 .replace( /\^\^rangeSMLF\^\^/gi , ((range != 'N' && range != 'PB') ? 1 : 0) )
								 .replace( /\^\^ammoName\^\^/gi , ammoName )
								 .replace( /\^\^ammoStrDmg\^\^/gi , ammoStrBonus )
								 .replace( /\^\^ammoDmgSM\^\^/gi , dmgSMroll )
								 .replace( /\^\^ammoStyleDmgSM\^\^/gi , dmgSMstyle )
								 .replace( /\^\^ammoDmgL\^\^/gi , dmgLroll )
								 .replace( /\^\^ammoStyleDmgL\^\^/gi , dmgLstyle )
								 .replace( /\^\^targetHPfield\^\^/gi , tokenHP )
								 .replace( /\^\^targetHP\^\^/gi , tokenHP )
								 .replace( /\^\^targetMaxHP\^\^/gi , tokenMaxHP )
								 .replace( /\^\^HPfield\^\^/gi , tokenHPname )
								 .replace( /\^\^ammoLeft\^\^/gi , ammoReuse > 0 ? ammoQty : (ammoReuse == -2 ? 0 : ammoQty-1))
								 .replace( /\^\^rwSMdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgSM-RW'+rwNumber+'-'+range))
								 .replace( /\^\^rwLHdmgMacro\^\^/gi , (charName+'|Do-not-use-DmgL-RW'+rwNumber+'-'+range))
								 .replace( /&#44;/gi , ',' );
								 
			return(attkMacro);	
		};
		
		var buildAbility = function( abilityType, defMod, dist, toHitMacro, qualifier, ammoReuse ) {
			
			var macroDef, attkMacro,
				errFlag = false;

			if (dist != 'PB' || proficiency > 0) {
				
				macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM'+qualifier+'-'+ammoName, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM'+qualifier, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgSM', charCS );
				if (!macroDef.obj || !macroDef.obj[1]) {
					errFlag = true;
					return;
				}

				attkMacro = (dmgCharges && (dmgCharges != 0)) ? ('\n!attk --setammo '+tokenID+'|'+ammoName+'|-'+dmgCharges+'|'+(ammoCharged ? ('-'+dmgCharges) : '+0')+'|SILENT') : ''; 
				attkMacro += ammoCmd ? ('\n'+ammoCmd) : '';
				attkMacro += touchAmmo ? ('\n!attk --blank-weapon '+tokenID+'|'+miName+'|silent') : '';
				setAbility( charCS, 'Do-not-use-DmgSM-RW'+rwNumber+'-'+dist, parseRWattkMacro(args, charCS, abilityType, dist, addDmgMsg( macroDef.obj[1].body, dmgMsg, ammoMsg ))+attkMacro);

				macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL'+qualifier+'-'+ammoName, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL'+qualifier, charCS, silent );
				if (!macroDef.obj) macroDef = abilityLookup( fields.AttacksDB, 'RW-DmgL', charCS );
				if (!macroDef.obj) {
					errFlag = true;
					return;
				}
				setAbility( charCS, 'Do-not-use-DmgL-RW'+rwNumber+'-'+dist, parseRWattkMacro(args, charCS, abilityType, dist, addDmgMsg( macroDef.obj[1].body, dmgMsg, ammoMsg ))+attkMacro);
				
				if (abilityType == Attk.TARGET) {
					attkMacro = attkMacro.replace(/@{target\|.*?\|?token_id}/igm,'@{target|Select Target|token_id}');
					attkMacro = parseRWattkMacro( args, charCS, abilityType, dist, addDmgMsg( addCommands( toHitMacro.body, attkMacro, '' ), [attkMsg,weapMsg].join('\n'), (attkMsg !== dmgMsg ? dmgMsg : ''), (weapMsg !== ammoMsg ? ammoMsg : '') ));
				} else {
					attkMacro = parseRWattkMacro( args, charCS, abilityType, dist, addDmgMsg( toHitMacro.body, attkMsg, weapMsg ));
				}
				hitCharges = (hitCharges == '' ? 1 : hitCharges);
				switch (ammoReuse) {
				case '-2': 
					attkMacro += '\n!attk --blank-weapon '+tokenID+'|'+miName+'|SILENT'; 
					break;
				case '-1': 
					attkMacro += '\n!attk --setammo '+tokenID+'|'+ammoName+'|-1|=|SILENT';
					break;
				case '1':
					break;
				case '2':
					attkMacro += '\n!attk --quiet-modweap '+tokenID+'|'+miName+'|AMMO|qty:=0 --setammo '+tokenID+'|'+ammoName+'|1|=|SILENT'; 
					break;
				case '3':
					attkMacro += '\n!attk --quiet-modweap '+tokenID+'|'+miName+'|AMMO|qty:+1 --quiet-modweap '+tokenID+'|'+ammoName+'|AMMO|qty:-2';
					break;
				default: 
					attkMacro += '\n!attk --setammo '+tokenID+'|'+ammoName+'|-1|'+(ammoCharged ? '-1' : '+0')+'|SILENT'; 
					break;
				};
				attkMacro += ((weapCharged && hitCharges) ? ('\n!magic --mi-charges '+tokenID+'|-'+hitCharges+'|'+miName+'|'+weapChgType) : ''); 
				if (abilityType === Attk.TARGET) weapCmd = weapCmd.replace(/@{target\|.*?\|?token_id}/igm,'@{target|Select Target|token_id}');
				attkMacro += ((weaponName !== miName) && (attrLookup( charCS, fields.Items_reveal, fields.Items_table, miRowref ) || '').toLowerCase() == 'use') ? ('\n!magic --button GM-ResetSingleMI|'+tokenID+'|'+miRowref+'|silent') : '';
				attkMacro += ((ammoName !== ammoMIname) && (attrLookup( charCS, fields.Items_reveal, fields.Items_table, ammoRowref ) || '').toLowerCase() == 'use') ? ('\n!magic --button GM-ResetSingleMI|'+tokenID+'|'+ammoRowref+'|silent') : '';
				attkMacro += weapCmd ? ('\n'+weapCmd) : '';
				attkMacro += touchWeap ? ('\n!attk --blank-weapon '+tokenID+'|'+miName+'|silent') : '';
				setAbility( charCS, 'Do-not-use-Attk-RW'+rwNumber+'-'+dist, attkMacro );
			}
			return errFlag;
		};
		
		attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+miName, charCS, silent );
		qualifier = '-'+miName;
		if (!attkMacroDef.obj) {
			qualifier = '-'+_.find( rwType.split('|'), t => {
				attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+t, charCS, silent );
				return !!attkMacroDef.obj;
			});
		}
		if (!attkMacroDef.obj) {
			qualifier = '-'+_.find( rwSuperType.split('|'), t => {
				attkMacroDef = abilityLookup( fields.AttacksDB, abilityRoot+'-'+t, charCS, silent );
				return !!attkMacroDef.obj;
			});
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
		if (!(errFlag = errFlag || !attkMacroDef.obj || !attkMacroDef.obj[1])) { 
			_.each(rangedWeapMods, (defMod, dist) => errFlag = errFlag || buildAbility( abilityType, defMod , dist, attkMacroDef.obj[1], qualifier, ammoReuse ));
		}
	}

	/*
	 * Dynamically build the ability macro for a saving throw
	 */
 
	var buildSaveRoll = function( tokenID, charCS, sitMod, DCval, saveType, saveObj, isGM, whoRolls, attr=false, failCmd ) {
		
		var save;
		if (!_.isObject(saveObj)) {
			save = saveObj;
			saveObj = saveFormat.Saves[saveType];
		} else {
			save = parseInt(attrLookup( charCS, saveObj.save ) || 0);
		}
		
//		log('buildSaveRoll: saveType = '+saveType+', failCmd = '+failCmd);
		
		sitMod = parseInt(sitMod);
		var name = getObj('graphic',tokenID).get('name'),
			saveMod = parseInt(attrLookup( charCS, saveObj.mod ) || 0),
			saveAdj = parseInt(attrLookup( charCS, fields.Magic_saveAdj ) || 0),
			calcResult = attr ?  (save+saveMod+sitMod+DCval+saveAdj) : (save-saveMod-sitMod-saveAdj),
			roll = ((whoRolls === SkillRoll.PCROLLS) ? saveObj.roll : '?{Enter the roll result (or submit to roll)|'+saveObj.roll+'}'),
			content = (isGM ? '/w gm ' : '')
					+ '&{template:'+fields.menuTemplate+'}{{name='+name+' Save vs '+saveType.dispName()+'}}'
					+ '{{Saving Throw=Rolling [[([['+roll+'cf<'+(calcResult-1)+'cs>'+calcResult+']][Dice Roll])]] vs. [[([[0+'+calcResult+']][Target])]] target}}'
					+ '{{Result=Saving Throw'+(attr ? '<=' : '>=')+calcResult+'}}'
					+ (failCmd ? ('{{failcmd='+failCmd+'}}{{fumblecmd='+failCmd+'}}') : '')
					+ '{{desc=**'+name+'\'s target**[[0+'+save+']] base save vs. '+saveType+' with [[0+'+saveMod+']] improvement from race, class & Magic Items, '
					+ '[[0+'+saveAdj+']] improvement from current magic effects, and [[0+'+sitMod+']] adjustment for the situation}}'
					+ (!state.attackMaster.weapRules.naturals ? '' : '{{crit_roll=Saving Throw'+(attr ? '<=1' : '>=20')+'}}{{crit=Natural 20!}}')
					+ (!state.attackMaster.weapRules.naturals ? '' : '{{fumble_roll=Saving Throw'+(attr ? '>=20' : '<=1')+'}}{{fumble=Natural 1!}}')
					+ '\n!attk --savemod-count @{selected|token_id}|-1';
		
		setAbility(charCS,'Do-not-use-'+saveType+'-save',content);
		return;
	}
					  
	/*
	 * Dynamically build the ability macro for a saving throw
	 */
	 
	var buildRogueRoll = function( tokenID, charCS, sitMod, skillType, skillObj, isGM, whoRolls ) {
		
		var target;
		if (!_.isObject(skillObj)) {
			target = skillObj;
			skillObj = rogueSkills[skillType];
		} else {
			target = parseInt(attrLookup( charCS, skillObj.save ) || 0);
		}
		
		sitMod = parseInt(sitMod);
		target = Math.max(state.attackMaster.thieveCrit,(sitMod+target));
		var	name = getObj('graphic',tokenID).get('name'),
			roll = ((whoRolls === SkillRoll.PCROLLS || skillObj.gmrolls) ? skillObj.roll : '?{Enter the roll result (or submit to roll)|'+skillObj.roll+'}'),
			skillMods =	skillObj.factors.map((mod,i) => {
							let val = attrLookup( charCS, [mod,'current'] ) || 0;
							return val + ' from ' + thiefSkillFactors[i].toLowerCase();
						}),
			content = ((isGM || (state.MagicMaster.gmRolls && skillObj.gmrolls)) ? '/w gm ' : '')
					+ '&{template:'+fields.menuTemplate+'}{{name='+name+' Skill check vs '+skillObj.name.dispName()+'}}'
					+ '{{Skill Check=Rolling [['+roll+']]<br>vs. [[0+'+target+']] target}}'
					+ '{{Result=Skill Check<='+target+'}}'
					+ (skillObj.success ? '{{Success='+skillObj.success+'}}' : '')
					+ (skillObj.failure ? '{{Failure='+skillObj.failure+'}}' : '') 
					+ '{{desc=**'+name+'\'s target**[[0+'+target+']] made up of '+skillMods.join(', ')+', and [[0+'+sitMod+']] adjustment for the situation.'
					+ ((state.attackMaster.thieveCrit > 0) ? ('<br><b>Note:</b> a critical success roll of '+state.attackMaster.thieveCrit+'% applies to skill checks (set by GM in RPGM config)') : '')
					+ '}}';
			if (!isGM && state.MagicMaster.gmRolls && skillObj.gmrolls) {
				content += '\n&{template:'+fields.messageTemplate+'}'
						+  '{{title='+name+' Skill check<br>vs '+skillObj.name.dispName()+'}}'
						+  '{{desc=The GM is making this roll and will let you know the outcome}}';
			};
		
		setAbility(charCS,'Do-not-use-'+skillObj.name.replace(/_/g,'-')+'-check',content);
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
					lowRange = false,
					wt, wst, wname, dancing,
					weapRangeMod, weapRangeOverride,
					disabled = isNaN(weaponIndex) || isNaN(ammoIndex);

				var adjustRange = function( ranges, rangeMod ) {
					if (!rangeMod || !rangeMod.length) return ranges.split('/');
					var weapRangeMod,
						weapRangeOverride = (rangeMod[0] == '=');
					if (weapRangeOverride) rangeMod = rangeMod.slice(1);
					weapRangeOverride = weapRangeOverride || !ranges || !ranges.length;
					weapRangeMod = (rangeMod[0] == '-' || rangeMod[0] == '+');
			
					ranges = ranges.split('/');
					rangeMod = rangeMod.split('/');
					// Remove any non-numeric entries from the ranges
					ranges = _.reject(ranges, function(dist){return isNaN(parseFloat(dist,10));}).map( r => parseFloat(r,10));
					rangeMod = _.reject(rangeMod, function(dist){return isNaN(parseFloat(dist,10));}).map( r => parseFloat(r,10));
					if (weapRangeOverride) {
						ranges = rangeMod;
					} else if (weapRangeMod) {
						if (ranges.length == 4 && rangeMod.length == 3) rangeMod.unshift(0);
						if (ranges.length == 3 && rangeMod.length == 4) rangeMod.shift();
						for (let i=0; rangeMod.length && i<ranges.length; i++) {
							ranges[i] += rangeMod[Math.min(i,(rangeMod.length-1))];
						}
					}
					return ranges;
				};

				if (!disabled) {
					ranges = tableInfo.AMMO.tableLookup( fields.Ammo_range, ammoIndex );
					lowRange = ranges[0] === '=';
					if (lowRange) ranges = ranges.slice(1);
					wname = tableInfo.RANGED.tableLookup( fields.RW_name, weaponIndex );
					dancing = tableInfo.RANGED.tableLookup( fields.RW_dancing, weaponIndex );
					rangeMod = tableInfo.RANGED.tableLookup( fields.RW_range, weaponIndex );
					wt = tableInfo.RANGED.tableLookup( fields.RW_type, weaponIndex );
					wst = tableInfo.RANGED.tableLookup( fields.RW_superType, weaponIndex );
					proficiency = dancing != 1 ? proficient( charCS, wname, wt, wst ) : tableInfo.RANGED.tableLookup( fields.RW_dancingProf, weaponIndex );
					specialist = proficiency > 0;
					
					ranges = adjustRange( ranges, tableInfo.RANGED.tableLookup( fields.RW_range, weaponIndex ) );
					ranges = adjustRange( ranges.join('/'), tableInfo.RANGED.tableLookup( fields.RW_styleRange, weaponIndex ) );
					
					// Test for if ranges need *10 (assume 1st range (PB or short) is never >= 100 yds or < 10)
					if (ranges[0] < 10 && !lowRange) ranges = ranges.map(x => x * 10);
						
					errFlag = buildRWattkMacros( args, senderId, charCS, tableInfo, ranges );
					
					// Make the range always start with Short (assume 4 or more ranges start with Point Blank)
					if (ranges.length >= 4) {
						specRange = ranges.shift();
					} else {
						specRange = Math.min(specRange,ranges[0]);
					}
				}
				
				weaponIndex += fields.RW_table[1]==0 ? 1 : 2;
				
				content += disabled ? ('<span style='+design.grey_button+'>') : '[';
				farRange = Math.max(1,Math.min(6,(ranges[0]-2),specRange-2));
				content += ranges.length ? ('Near: 0 to '+(farRange-1)) : 'Near';
				content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-N)');

				if (specialist) {
					content += disabled ? ('<span style='+design.grey_button+'>') : '[';
					content += ranges.length ? 'PB: '+farRange+' to '+specRange : 'Point Blank' ;
					farRange = specRange;
					content += disabled ? '</span>' : ('](~'+charName+'|Do-not-use-Attk-RW'+weaponIndex+'-PB)');
				}
				content += disabled ? ('<span style='+design.grey_button+'>') : '[';
				farRange = ranges.length ? (ranges[0]) : farRange;
				content += ranges.length ? ('S: '+Math.min(farRange,(specialist ? (specRange+1) : Math.max(1,Math.min(6,(ranges[0]-2),specRange-2))))+' to '+farRange) : 'Short';
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
				sendCatchError('AttackMaster',msg_orig[senderId],e);
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
		
		try {
			
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
				Items, Magic,
				errFlag = false,
				i, w, title,
				name, miQty,
				Weapons,
				weapButton,
				dancingMeleeWeaps = '',
				dancingRangedWeaps = '',
				magicList = {},
				magicWeaps = '',
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
			
			doCheckAC( [tokenID,'quiet'], senderId, [], true );
			doCheckMods( [tokenID,'quiet'], senderId, [], true );

			var tokenName = curToken.get('name'),
				charName = charCS.get('name'),
				targetStr = (attkType === Attk.TARGET) ? '&#64;{target|Select Opponent|token_id}' : '',
				diceRoll = (attkType === Attk.ROLL) ? ('&#63;{Roll To Hit|'+fields.ToHitRoll+'}') : fields.ToHitRoll,
				content = '&{template:'+fields.menuTemplate+'}{{name=How is ' + tokenName + ' attacking?}}';

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

			// build the Weapon Powers list
			
			weaponIndex = fields.MW_table[1]-1;
			weaponOffset = fields.MW_table[1]==0 ? 1 : 2;
			title = false;
			Weapons = getTableField( charCS, {}, fields.MW_table, fields.MW_name );
			Weapons = getTableField( charCS, Weapons, fields.MW_table, fields.MW_miName );
			Items = getTable( charCS, fieldGroups.MI );
			Magic = getTable( charCS, fieldGroups.MAGIC );
			
			for (let magicIndex = fields.Magic_table[1]; !_.isUndefined(weaponName = Magic.tableLookup( fields.Magic_name, magicIndex, false )); magicIndex++) {
				if (weaponName && weaponName.length && weaponName != '-') {
					let miName = Magic.tableLookup( fields.Magic_miName, magicIndex );
					if (!magicList[miName]) magicList[miName] = {};
					magicList[miName][weaponName] = magicIndex;
				}
			}
			_.each( magicList, (item,miName) => {
				let	itemIndex = Items.tableFind( fields.Items_trueName, miName) || Items.tableFind( fields.Items_name, miName);
				let	weapObj = abilityLookup( fields.MagicItemDB, miName, charCS, true );
				if (!_.isUndefined(itemIndex)) {
					name = Items.tableLookup( fields.Items_name, itemIndex );
					miQty = Items.tableLookup( fields.Items_qty, itemIndex );
				} else {
					name = miName;
					miQty = undefined;
				}
				magicWeaps += '{{' + name.dispName() + ' =';
				_.each( item, (i,power) => {
					let	charges = Magic.tableLookup( fields.Magic_charges, i ) || 1;
					let	weapCharge  = Magic.tableLookup( fields.Magic_chargeType, i ) || (weapObj.obj ? weapObj.obj[1].charge.toLowerCase() : 'uncharged' );
					let	weapCharged = !(['uncharged','cursed','cursed+uncharged','single-uncharged'].includes(weapCharge));
					let	magicPower = Magic.tableLookup( fields.Magic_power, i ) || '';
					let	magicName = Magic.tableLookup( fields.Magic_desc, i ) || magicPower;
					let	castLevel = Magic.tableLookup( fields.Magic_level, i ) || caster( charCS, 'PW' ).clv;
					if (_.isUndefined(miQty)) miQty = charges;
					if (weapCharged && (miQty - charges) < 0) {
						magicWeaps += '<span style=' + design.grey_button + '>' + miQty + ' ' + power + '</span>';
					} else {
						let magicLib, abilityName,
							magicMsg = Magic.tableLookup( fields.Magic_message, i ),
							magicCmd = Magic.tableLookup( fields.Magic_cmd, i );
						magicWeaps += '['+((weapCharged ? miQty+' ' : '')+power)+'](!magic';
						if (magicMsg) magicWeaps += ' --message '+tokenID+'|'+power+'|'+magicMsg;
						if (weapCharged && charges != 0) magicWeaps += ' --mi-charges '+tokenID+'|-'+charges+'|'+miName+'||'+weapCharge;
						if (magicName) {
							magicLib = findPower( charCS, magicName );
							abilityName = magicLib.obj ? magicLib.obj[1].name : magicName;
							magicLib = getAbility( magicLib.dB, abilityName, charCS );
							if (!!magicLib.obj && !!magicLib.obj[1]) setAbility(charCS, abilityName, magicLib.obj[1].body.replace(/@{selected\|(?:mu-|pr-)?casting-level}/img,castLevel));
							let cmdStr = magicPower ? (' --button '+BT.MI_POWER_CHARGE_USED+'|'+tokenID+'|'+magicName+'|'+miName+'|'+castLevel) 
													 : (magicLib.obj ? (' --message gm|'+tokenID+'|'+miName+'|'+charName+' is using the item action ['+power+']\\lpar;!\\cr;&&w gm %%\\lbrc;'+magicLib.dB +'¦'+ magicLib.obj[1].name +'\\rbrc;\\rpar;. Select '+charName+'\'s token before pressing to see the effects') : '');
							magicWeaps += cmdStr;
						}
						if (magicCmd) {
							magicWeaps += '&#13;'+parseStr(magicCmd).replace(/(?:@|&#64;){selected\|MIrowref}/ig,String(itemIndex));
						}
						if (magicName && magicLib.obj && !magicPower) {
							magicWeaps += '&#13;'+((magicLib.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+magicLib.dB +'|'+ (magicLib.obj[1].name.hyphened()) +'}');
						}
						magicWeaps += ') ';
					};
				});
				magicWeaps += '}}';
			});
			
			// Build the Melee Weapons list

			while (!_.isUndefined(weaponName = Weapons.tableLookup( fields.MW_name, ++weaponIndex, false ))) {
				
				if (weaponName && weaponName.length && weaponName != '-') {
					if (!title) {
						tableInfo.MELEE = getTable( charCS, fieldGroups.MELEE ),
						tableInfo.DMG = getTable( charCS, fieldGroups.DMG ),
						title = true;
					}
					let miName = Weapons.tableLookup( fields.MW_miName, weaponIndex ),
						itemIndex = Items.tableFind( fields.Items_trueName, miName),
						charges = tableInfo.MELEE.tableLookup( fields.MW_charges, weaponIndex ),
						weapObj = abilityLookup( fields.WeaponDB, miName, charCS, true ),
						weapCharge  = tableInfo.MELEE.tableLookup( fields.MW_chargeType, weaponIndex ) || (weapObj.obj ? weapObj.obj[1].charge.toLowerCase() : 'uncharged' ),
						weapCharged = !(['uncharged','cursed','cursed+uncharged','single-uncharged'].includes(weapCharge)),
						enabling = ['enable','disable'].includes(weapCharge),
						miQty = Items.tableLookup( fields.Items_qty, itemIndex );
//					if (miQty <= 0 || (!_.isUndefined(itemIndex) && weapCharged && (miQty - (!charges ? 1 : charges)) < 0)) {
					if (!_.isUndefined(itemIndex) && weapCharged && (miQty - (!charges ? 1 : charges)) < 0) {
						meleeWeaps += '<span style=' + design.grey_button + '>' + (enabling ? '' : miQty) + ' ' + weaponName + '</span>';
					} else {
						if (errFlag = await buildMWattkMacros( args, senderId, charCS, tableInfo, weaponIndex, backstab )) return;
						weaponName = ((weapCharged && !enabling) ? miQty+' ' : '')+weaponName;
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
						let	miName = tableInfo.RANGED.tableLookup( fields.RW_miName, weaponIndex ),
							itemIndex = Items.tableFind( fields.Items_trueName, miName),
							charges = tableInfo.RANGED.tableLookup( fields.RW_charges, weaponIndex ),
							weapObj = abilityLookup( fields.WeaponDB, miName, charCS, true ),
							weapCharged = (weapObj.obj ? !(['uncharged','cursed','cursed+uncharged','single-uncharged','enable','disable'].includes(weapObj.obj[1].charge.toLowerCase())) : false),
							miQty = _.isUndefined(itemIndex) ? charges : Items.tableLookup( fields.Items_qty, itemIndex ),
							valid = (!weapCharged || ((miQty-charges) >= 0));
						weapButton = '{{'+(weapCharged ? '**'+miQty+'** ' : '')+weaponName+'=';
						weaponType = tableInfo.RANGED.tableLookup( fields.RW_type, weaponIndex ).dbName();
						weaponSuperType = tableInfo.RANGED.tableLookup( fields.RW_superType, weaponIndex ).dbName();
						ammoIndex = fields.Ammo_table[1]-1;
						while (!_.isUndefined(ammoName = tableInfo.AMMO.tableLookup( fields.Ammo_name, ++ammoIndex, false ))) {
							ammoType = tableInfo.AMMO.tableLookup( fields.Ammo_type, ammoIndex ).dbName();
							if (ammoName != '-' && (!ammoType ? (weaponName.includes((ammoName.split(',')||['none',''])[0])) : (weaponType.split('|').includes(ammoType) || weaponSuperType.split('|').includes(ammoType) || weaponName.dbName().includes(ammoType)))) {
								ammoQty = tableInfo.AMMO.tableLookup( fields.Ammo_qty, ammoIndex );
								weapButton += (weaponIndex == weaponButton && ammoIndex == ammoButton) ? ('<span style=' + design.selected_button + '>')
												: ((ammoQty <= 0 || !valid) ? ('<span style=' + design.grey_button + '>') : '[');
								weapButton += '**'+ammoQty+'** '+ammoName;
								weapButton += (((weaponIndex == weaponButton && ammoIndex == ammoButton) || ammoQty <= 0 || !valid) ? '</span>' 
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
			if (magicWeaps) {
				content += '{{Section2=**Magical Attacks**}}' + magicWeaps;
				setAttr( charCS, fields.Casting_name, tokenName );
			}
			if (meleeWeaps) {
				content += '{{Section3=**Melee Weapons**\n' + meleeWeaps + '}}';
			}
			if (rangedWeaps) {
				content += '{{Section4=**Ranged Weapons**}}' + rangedWeaps;
			}
			if (dancingMeleeWeaps || dancingRangedWeaps) {
				content += '{{Section5=**Dancing Weapons**'
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
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
		}
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
			content = '&{template:'+fields.menuTemplate+'}{{name=Change '+tokenName+'\'s Ammo}}'
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
			reSetQty = /}}\s*?AmmoData.*?[\[,\s]qty:\s*?(=?\d+?)[,\]].*?{{/im,
			reReuse = /}}\s*?AmmoData.*?[\[,\s]ru:\s*?([-\+\d]+?)[,\]].*?{{/im,
			qty, maxQty, title=false,
			ammoName, breakable = false,
			itemIndex = fields.Items_table[1]-1,
			itemTable = fields.Items_table,
			itemName = fields.Items_name,
			itemTrueName = fields.Items_trueName,
			itemQty = fields.Items_qty,
			itemMax = fields.Items_trueQty,
			checkAmmo = false,
			reuse = 0,
			Items,
			content = '&{template:'+fields.menuTemplate+'}{{name=Change '+tokenName+'\'s Ammunition}}'
					+ '{{desc=The current quantity is displayed with the maximum you used to have.'
					+ 'To change the amount of any ammo listed, click the ammo name and enter the *change* (plus or minus).'
					+ 'The maximum will be set to the final current quantity, reflecting your new total. '
					+ 'Unselectable grey buttons represent unrecoverable or self-returning ammo.}}'
					+ '{{desc1=';
		do {
			Items = getTableField( charCS, {}, itemTable, itemName );
			Items = getTableField( charCS, Items, itemTable, itemTrueName );
			Items = getTableField( charCS, Items, itemTable, itemQty );
			Items = getTableField( charCS, Items, itemTable, itemMax );
			while (!_.isUndefined(ammoName = Items.tableLookup(itemName,++itemIndex,false))) {
				if (ammoName === '-') continue;
				let ammoMIname = Items.tableLookup(itemTrueName,itemIndex),
					ammo = abilityLookup( fields.MagicItemDB, ammoMIname, charCS ),
					ammoData = resolveData( ammoMIname, fields.MagicItemDB, reAmmoData, charCS, reWeapSpecs, itemIndex ).parsed,
					ammoMatch;
				if (checkAmmo || !_.isUndefined(ammo.obj) ) {
//					if (ammo.obj && ammo.obj[1]) ammoData = ammo.obj[1].body;
					if (checkAmmo || (ammoData && ammoData.name && ammoData.name.length)) {
						if (!title) {
							content += '<table><tr><td>Now</td><td>Max</td><td>Ammo Name</td></tr>';
							title = true;
						}
						reuse = parseInt(ammoData.reuse) || 0;
//						breakable = (reuse != 0) || (ammo.ct && ammo.ct[0] && ['charged','discharging','change-each','cursed+charged','cursed+discharging','cursed+change-each'].includes((ammo.ct[0].get('max') || '').toLowerCase()));
						breakable = (reuse != 0) || (['charged','discharging','change-each','cursed+charged','cursed+discharging','cursed+change-each'].includes(ammoData.chargeType.toLowerCase()));
						qty = Items.tableLookup(itemQty,itemIndex) || 0;
						maxQty = Items.tableLookup(itemMax,itemIndex) || qty;
						content += '<tr><td>[['+qty+']]</td><td>[['+maxQty+']]</td>'
								+  '<td>'+(breakable ? '<span style=' + design.grey_button + '>' : '[')
								+  ammoName
								+  (breakable ? '</span>' : '](!attk --button '+BT.AMMO+'|'+tokenID+'|'+ammoMIname.replace(/[\(\)]/g,'')+'|?{How many do you recover?|0}|=)') + '</td></tr>';
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
		
			content = '&{template:'+fields.menuTemplate+'}{{name=Change '+tokenName+'\'s Handedness}}'
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
	 
	async function makeChangeWeaponMenu( args, senderId, msg='' ) {
		
		try {
		
			var tokenID = args[1],
				spellsMI = args[4],
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
				ringList = await weaponQuery(charCS,1,'ring',senderId),
				InHandTable = getTable( charCS, fieldGroups.INHAND ),
				handsQuestion = noHands, // ((noHands <= 2) ? 2 : '&#63;{Lend how many hands - (min 2&#41;?|2}'),
				noHands = Math.max( 2, noHands+lentHands ),
				weapList1H = await weaponQuery(charCS,1,(spellsMI ? 'mispells' : 'weap'),senderId),
				weapList2H = await weaponQuery(charCS,noHands,(spellsMI ? 'mispells' : 'weap'),senderId,2),
				inHand, inHandHandedness, content, extraHands, weapListXtra;
				
			InHandTable = checkInHandRows( charCS, InHandTable, noHands );
			left = InHandTable.tableLookup( fields.InHand_name, i++ );
			right = InHandTable.tableLookup( fields.InHand_name, i++ );
			both = InHandTable.tableLookup( fields.InHand_name, i );
			extraHands = InHandTable.tableLookup( fields.InHand_handedness, i++ );
			
			content = '&{template:'+fields.menuTemplate+'}{{name=Change '+tokenName+'\'s weapon}}'
					+ (msg && msg.length ? '{{Section1=**'+msg+'**}}' : '')
					+ '{{Section2=Select Primary or Off Hand to hold a one-handed weapon or shield.'
					+ ' Select Both Hands to hold a two handed weapon and set AC to Shieldless}}'
					+ '{{section3=Weapons\n'
					+ '<table style="text-align:center"><thead><tr><th scope="col" style="text-align:center; max-width:50%">Primary</th><th scope="col" style="text-align:center; max-width:50%">Offhand</th></tr></thead>'
					+ '<tbody style="text-align:center"><tr>'
					+ '<td>[' + (left != '-' ? left : 'Primary Hand') + '](!attk --button '+BT.RIGHT+'|'+tokenID+'|'+weapList1H+'|0)</td>'
					+ '<td>[' + (right != '-' ? right : 'Off-Hand') + '](!attk --button '+BT.LEFT+'|'+tokenID+'|'+weapList1H+'|1)</td></tr>'
					+ '<tr><td colspan="2">[' + (both != '-' ? '2H\: '+both : 'Both Hands') + '](!attk --button '+BT.BOTH+'|'+tokenID+'|'+weapList2H+'|2)</td></tr></tbody></table>}}'
					+ '{{section4=Rings\n'
					+ '<table style="text-align:center"><thead><tr><th scope="col" style="text-align:center; max-width:50%">Primary</th><th scope="col" style="text-align:center; max-width:50%">Offhand</th></tr></thead>'
					+ '<tbody style="text-align:center"><tr>'
					+ '<td>[' + (rRing != '-' ? rRing : 'Primary Ring') + '](!attk --button '+BT.RIGHTRING+'|'+tokenID+'|'+ringList+'|1)</td>'
					+ '<td>[' + (lRing != '-' ? lRing : 'Off-hand Ring') + '](!attk --button '+BT.LEFTRING+'|'+tokenID+'|'+ringList+'|0)</td></tr></tbody></table>}}';
						
			extraHands = noHands -= Math.max(2,extraHands);
			
			if (noHands > 0) {
				content += '{{section5=Extra Hands\n';
				while (noHands > 0) {
					inHand = InHandTable.tableLookup( fields.InHand_name, i );
					noHands -= inHandHandedness = parseInt(inHand != '-' ? InHandTable.tableLookup( fields.InHand_handedness, i ) : 1) || 1;
					hands = (inHandHandedness == 1) ? '' : (inHandHandedness == 2 ? ('+H'+(handNo+1)) : ('-H'+(handNo+inHandHandedness-1)));
					weapListXtra = await weaponQuery(charCS,extraHands,(spellsMI ? 'mispells' : 'weap'),senderId,1);
					content += '['+(inHand != '-' ? ('H'+handNo+hands+'\: '+inHand) : ('Hand '+handNo))+ '](!attk --button '+BT.HAND+'|'+tokenID+'|'+weapListXtra+'|'+i+')';
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
		} catch (e) {
			log('AttackMaster makeChangeWeaponMenu: JavaScript '+e.name+': '+e.message+' while processing weapon '+wname);
			sendDebug('AttackMaster makeChangeWeaponMenu: JavaScript '+e.name+': '+e.message+' while processing weapon '+wname);
			sendCatchError('AttackMaster',msg_orig[senderId],e);
			content = '';

		}
	}
	
	/**
	* Create the Edit Magic Item Bag menu.  Allow for a short version if
	* the Short Menus status flag is set, and highlight selected buttons
	**/
	
	async function makeEditBagMenu(args,senderId,msg='',menuType) {
		
		try {
			var tokenID = args[1],
				MIrowref = args[2],
				itemName = args[3] || '',
				charges = args[4],
				selectedMI = itemName.hyphened(),
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
				content = '&{template:'+fields.menuTemplate+'}{{name=Edit Magic Item Bag}}';

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
				magicItem = getAbility( fields.MagicItemDB, selectedMI, charCS, null, null, null, MIrowref );
				if (_.isUndefined(magicItem)) {log('makeEditBagMenu: magicItem is undefined!'); return;} else
				if (!magicItem.obj) {
					sendResponse( charCS, 'Can\'t find '+itemName+' in the Magic Item database', senderId,flags.feedbackName,flags.feedbackImg,tokenID );
					return;
				}
			}
			
			if (msg && msg.length>0) {
				content += '{{='+msg+'}}';
			}
			
			if (!shortMenu || !selected) {
				let weapons = getMagicList(fields.MagicItemDB,miTypeLists,'weapon',senderId),
					ammo = getMagicList(fields.MagicItemDB,miTypeLists,'ammo',senderId),
					armour = getMagicList(fields.MagicItemDB,miTypeLists,'armour',senderId);
				content += '{{desc=**1.Choose what item to store**\n'
						+  '[Weapon](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Weapon to store|'+weapons+'}|'+charges+')'
						+  '[Ammo](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Ammunition to store|'+ammo+'}|'+charges+')'
						+  '[Armour](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|?{Armour to store|'+armour+'}|'+charges+')'
				if (shortMenu) {
					content +=  '\n**OR**\n'
							+  '[Choose item to Remove](!attk --button '+BT.CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'|'+'Remove) from your MI bag}}'
							+  '{{desc2=[Swap to a long menu](!attk --button '+BT.EDITMI_OPTION+'|'+tokenID+'|'+(shortMenu ? 'long' : 'short')+')}}';
				}
			}
			if (!shortMenu || selected) {
				if (!remove) {
					if (shortMenu) {
						content += '{{desc=**1.Item chosen** ['+itemName+'](!attk --button '+BT.REDO_CHOOSE_MI+'|'+tokenID+'|'+MIrowref+'), click to reselect\n';
					}
					content += '\nOptionally, you can '+(selected ? '[' : '<span style='+design.grey_button+'>')+'Review '+itemName+(selected ? ('](!attk --button '+BT.REVIEW_MI+'|'+tokenID+'|'+MIrowref+'|'+selectedMI+'|&#13;'+(magicItem.api ? '' : sendToWho(charCS,senderId,false,true))+'&#37;{'+magicItem.dB+'|'+selectedMI+'})') : '')+'</span>';
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
							+  'Store '+itemName
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
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
		}
		return;
	}
	
	/*
	 * Return mod prioritisation buttons
	 */
	
	var modScanPriority = (p,t,m) => '{{Section9=Currently prioritising best **'+(p === 'ac' ? 'Armour Class' : (p === 'thac0' ? 'Thac0' : (p === 'dmg' ? 'Damage' : 'HP')))+'**\nPrioritise '
				+   (p !== 'thac0' ? '<a style="background: none; border: none; color:blue;" href="'+fields.attackMaster+' --set-mod-priority '+t+'|thac0|'+m+'">Thac0</a> ' : ' ')
				+   (p !== 'dmg' ? '<a style="background: none; border: none; color:blue;" href="'+fields.attackMaster+' --set-mod-priority '+t+'|dmg|'+m+'">Damage</a> ' : ' ')
				+   (p !== 'hp' ? '<a style="background: none; border: none; color:blue;" href="'+fields.attackMaster+' --set-mod-priority '+t+'|hp|'+m+'">HP</a> ' : ' ')
				+   (p !== 'ac' ? '<a style="background: none; border: none; color:blue;" href="'+fields.attackMaster+' --set-mod-priority '+t+'|ac|'+m+'">Armour</a> ' : ' ')
				+  '}}';
	
	/*
	 * Display current modifiers to Thac0 and HP
	 */
	 
	var makeModsDisplay = function( args, senderId, currentThac0, currentHP, modValues, modMsgs ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter( tokenID ),
			tokenName = curToken.get('name'),
			classObj = classObjects( charCS, senderId ),
			HPbonus = attrLookup( charCS, fields.HPconAdj ) || 0,
			modsPriority = attrLookup( charCS, fields.ModPriority ) || 'ac',
			isGM = playerIsGM( senderId ),
			thac0Bar = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base),
			tokenThac0 = thac0Bar.name && thac0Bar.barName.startsWith('bar') ? thac0Bar.val : currentThac0,
			content = '&{template:'+fields.menuTemplate+'}{{name=Current Thac0 & HP mods for '+tokenName+'}}',
			thac0Mods = '',
			dmgMods = '',
			hpMods = '',
			magicAdj = '',
			legacyMods = false;
			
		content += '{{Section1=';
		if (tokenThac0 != currentThac0) {
			content += '**Current Thac0 is <span style='+design.selected_button+'>'+tokenThac0+'</span>**'
					+  '\n(calculated as <span style='+design.green_button+'>'+currentThac0+'</span>)';
			magicAdj = '{{Magical Adjustment=**'+(currentThac0-tokenThac0 > 0 ? '+' : '')+(currentThac0-tokenThac0)+'** (current - calculated Thac0)}}';
		} else {
			content += 'Current Thac0 is <span style='+design.selected_button+'>'+currentThac0+'</span>';
		};
		content += '\nCurrent HP is **'+currentHP+'**}}';
		content += magicAdj;
		
		_.each(classObj, c => {
			if (!c.obj) return;
			content += '{{'+c.classData.name+' L'+c.level+'=Base Thac0 '+(c.base === 'creature' ? (parseInt(attrLookup( charCS, fields.MonsterThac0 )) || 20) : (parseInt(handleGetBaseThac0(charCS,(c.base+'='+c.base))) || 20))
					+  '\nHit Dice '+c.classData.hd+' per level}}';
		});
		if (HPbonus) {
			content += '{{Constitution=HP bonus '+((HPbonus > 0 && HPbonus[0] !== '+') ? '+' : '')+HPbonus+' per level}}';
		}
		
		_.each( modValues, (e,k) => {
			let modObj = abilityLookup( fields.MagicItemDB, e.name, charCS, silent ),
				thac0Adj = (parseInt(e.data.thac0adj) || 0),
				hpAdj = (parseInt(e.data.hpadj) || 0) + (parseInt(e.data.hptemp) || 0),
				dmgAdj = (parseInt(e.data.dmgadj) || 0),
				isMod = e.specs[2].toLowerCase().includes('modifiers'),
				objType = (modObj.obj ? getShownType( modObj, e.row ) : e.specs[4].replace(/\|/g,'/')).dispName(),
				removeLink = ((isGM && isMod) ? (' <a style="background: none; border: none; color:red;" href="!attk --set-mods '+tokenID+'|del|'+e.name+'|'+e.trueName+'|thac0|||verbose">Remove</a>') : '');
//			log('makeModsDisplay: e.name = '+e.name+', thac0adj = '+thac0Adj+', hpAdj = '+hpAdj+', objType = '+objType);
			if (thac0Adj) thac0Mods += '{{'+objType+'='+e.name.dispName()+(!(/[+-]\d+?/.test(e.name)) ? ((thac0Adj >= 0 ? ' +' : ' ') + thac0Adj) : '') + removeLink +'}}';
			if (dmgAdj) dmgMods += '{{'+objType+' ='+e.name.dispName()+(!(/[+-]\d+?/.test(e.name)) ? ((dmgAdj >= 0 ? ' +' : ' ') + dmgAdj) : '') + removeLink +'}}';
			if (hpAdj) hpMods += '{{'+objType+'  ='+e.name.dispName()+(!(/[+-]\d+?/.test(e.name)) ? ((hpAdj >= 0 ? ' +' : ' ') + hpAdj) : '') + removeLink+'}}';
			legacyMods = legacyMods || objType.dbName() === 'legacymods';
		});
		content += '{{Section2=**Thac0 Modifiers** (\'+\' is beneficial)}}' + (thac0Mods || '{{Section3=None}}');
		content += '{{Section4=**Damage Modifiers** (\'+\' is beneficial)}}' + (dmgMods || '{{Section5=None}}');
		content += '{{Section6=**HP Modifiers** (\'+\' is beneficial)}}' + (hpMods || '{{Section7=None}}');
		content += modScanPriority( modsPriority, tokenID, 'checkmods' );
		
		if (modMsgs && modMsgs.length) {
			content += '{{desc=';
			if (modMsgs && modMsgs.length) {
				content += 'These items have been ignored:\n';
				_.each( modMsgs, msg => content += msg + '\n' );
			}
			content += '}}';
		};
		
		if (legacyMods) {
			content += '{{desc1=';
			let effects = state.roundMaster.effects[curToken.get('_id')];
			if (effects && effects.length > 0) {
				content += 'These effects might have legacy mods:\n'
				_.each( effects, e => content += e.name + ', duration ' + e.duration + '\n' );
			};
			content += '}}';
		}
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
	};
	
	/*
	 * Make a display of the current armour scan results
	 */

	var makeACDisplay = function( args, senderId, finalAC, dmgAdj, acValues, armourMsgs ) {
		
		var tokenID = args[0],
			dmgType = (args[2] || 'nadj').toLowerCase(),
			isNorm = dmgType === 'nadj',
			isSlash = dmgType === 'sadj',
			isPierce = dmgType === 'padj',
			isBash = dmgType === 'badj',
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(tokenID),
			tokenName = curToken.get('name'),
			currentAC = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC,fields.Thac0_base).val,
			AC = getACvalues(tokenID),
			monsterAC = attrLookup( charCS, fields.MonsterAC ) || 10,
			monSpecial = (/\[(.+?)\]/.exec(monsterAC) || ['',''])[1],
			modsPriority = attrLookup( charCS, fields.ModPriority ) || 'ac',
			isGM = playerIsGM( senderId ),
			content = '&{template:'+fields.menuTemplate+'}{{name=Current Armour for '+tokenName+'}}';

		if (currentAC != finalAC) {
			content += '{{AC=<span style='+design.green_button+'>'+finalAC+'</span>'
					+  '\n(<span style='+design.selected_button+'>'+currentAC+'</span> with current magic)';

		} else if (dmgAdj.armoured.sadj != 0 || dmgAdj.armoured.padj != 0 || dmgAdj.armoured.badj != 0) {
			content += '{{AC=';
			args[2]='nadj';
			content += (isNorm?'<span style='+design.selected_button+'>':'[')+'Standard:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj)+(isNorm?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='sadj';
			content += (isSlash?'<span style='+design.selected_button+'>':'[')+'Slash:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj)+(isSlash?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='padj';
			content += (isPierce?'<span style='+design.selected_button+'>':'[')+'Pierce:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj)+(isPierce?'</span>':'](!attk --checkac '+args.join('|')+')');
			args[2]='badj';
			content += (isBash?'<span style='+design.selected_button+'>':'[')+'Bludgeon:'+(finalAC+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj)+(isBash?'</span>':'](!attk --checkac '+args.join('|')+')');
		} else {
			content += '{{AC=<span style='+design.selected_button+'>'+finalAC+'</span>';
		}
		if (monSpecial && monSpecial.length) content += '\n'+monSpecial;
		content += '}}'
				+ (acValues.armour ? '{{Armour='+acValues.armour.name+' AC'+(parseInt(acValues.armour.data.ac||10)-parseInt(acValues.armour.data.adj||0)-parseInt(acValues.armour.data[dmgType]||0))+'}}' : '')
				+ (acValues.shield ? '{{Shield='+acValues.shield.name+'}}' : '');
				
		_.each( acValues, (e,k) => {
			if (k != 'armour' && k != 'shield') {
				let acObj = abilityLookup( fields.MagicItemDB, e.name, charCS, silent ),
					acAdj = (parseInt(e.data.adj) || 0) + (isSlash?(parseInt(e.data.sadj) || 0):(isPierce?(parseInt(e.data.padj) || 0):(isBash?(parseInt(e.data.badj) || 0):0))),
					isMod = e.specs[2].toLowerCase().includes('modifiers');
				if (!!acAdj) {
					content += '{{'+(acObj.obj ? getShownType( acObj, e.row ) : e.specs[4].replace(/\|/g,'/'))+'='+e.name.dispName();
					if (!(/[+-]\d+?/.test(e.name))) content += (acAdj >= 0 ? ' +' : ' ') + acAdj;
					content += ((isGM && isMod) ? (' <a style="background: none; border: none; color:red;" href="!attk --set-mods '+tokenID+'|del|'+e.name+'|'+e.trueName+'|ac|||verbose">Remove</a>') : '');
					content += '}}';
				};
			}
		});
		content += modScanPriority( modsPriority, tokenID, 'checkac' );
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
			msg = args[2] || '',
			saveType = (args[3] || '').dbName(),
			targetArgs = args.slice(4).join('|'),
			curToken = getObj('graphic',tokenID),
			charCS  = getCharacter( tokenID ),
			name =  curToken.get('name'),
			charName = charCS.get('name'),
			isGM = playerIsGM(senderId),
			playerConfig = getSetPlayerConfig( senderId ),
			manUpdate = playerConfig && playerConfig.manualCheckSaves,
			whoRolls = ((!_.isUndefined(playerConfig.skillRoll)) ? playerConfig.skillRoll : SkillRoll.PCROLLS),
			SaveMods = getTable( charCS, fieldGroups.MODS ),
			modName = '-',
			saveCmd = '',
			content = '&{template:'+fields.menuTemplate+'}{{name=Roll a Saving Throw for '+name+'}}'
					+ (msg && msg.length ? '{{Section='+msg+'}}' : '')
					+ '{{desc=<table>'
					+ '<thead>'
						+ '<th width="50%">Save</th><th width="25%">Base</th><th width="25%">Mod</th>'
					+ '</thead>';
					
//		if (!targetArgs || !targetArgs.length) targetArgs = SaveMods.tableLookup( fields.Mods_cmd, SaveMods.tableFind( fields.Mods_cmd, /.+/ ));
		if (targetArgs && targetArgs.length && targetArgs[0] !== '!') targetArgs = '!rounds --gm-target caster|'+tokenID+'|'+targetArgs;
		
		var cmdRow = (SaveMods.tableFind( fields.Mods_saveSpec, 'svsav', true, true ) || []).find( r => (saveCmd = SaveMods.tableLookup( fields.Mods_cmd, r, false )));
		if (_.isUndefined(cmdRow)) {
			cmdRow = (SaveMods.tableFind( fields.Mods_saveSpec, 'svall', true, true ) || []).find( r => (saveCmd = SaveMods.tableLookup( fields.Mods_cmd, r, false )));
		};
		saveCmd = saveCmd || '';
		
//		log('makeSavingThrowMenu: targetArgs = '+targetArgs+', saveMods.saveSpec['+cmdRow+'] = '+saveCmd);

		_.each( saveFormat.Saves, (saveObj,save) => {
			if (saveType && saveType.length && save.dbName() !== saveType) return;
			content += '<tr>'
					+  '<td>['+save+'](~'+charName+'|Do-not-use-'+save+'-save)</td>'
					+  '<td>[[0+'+attrLookup(charCS,saveObj.save)+']]</td>'
					+  '<td>[[0+'+attrLookup(charCS,saveObj.mod)+'+'+sitMod+']]</td>'
					+  '</tr>';
			let modCmd = SaveMods.tableLookup( fields.Mods_cmd, SaveMods.tableFind( fields.Mods_saveSpec, new RegExp('sv'+saveObj.tag, 'i'))) || saveCmd;
			if (modCmd && modCmd.length && modCmd[0] !== 0) modCmd = '!rounds --addTargetStatus '+tokenID+'|'+modCmd;
//			log('makeSavingThrowMenu: loaded modCmd for '+save+', tag sv'+saveObj.tag+', at row '+SaveMods.tableFind( fields.Mods_saveSpec, new RegExp('sv'+saveObj.tag, 'i') )+' as '+modCmd+', and targetArgs are '+targetArgs);
			modCmd = !!modCmd && modCmd.length ? (targetArgs && targetArgs.length ? (modCmd + '&#13;' + targetArgs) : modCmd) : targetArgs;
			buildSaveRoll( tokenID, charCS, sitMod, null, save, saveObj, isGM, whoRolls, false, modCmd );
		});
		for (let modRow = SaveMods.table[1]; !_.isUndefined(modName = SaveMods.tableLookup( fields.Mods_name, modRow, false )); modRow++) {
			let modType = SaveMods.tableLookup( fields.Mods_modType, modRow );
			let modToken = SaveMods.tableLookup( fields.Mods_tokenID, modRow );
//			log('makeSavingThrowMenu: '+name+'|'+SaveMods.tableLookup( fields.Mods_spellName, modRow )+' modType = '+modType+', basis = '+SaveMods.tableLookup( fields.Mods_basis, modRow, false ));
			if (modType.length && modType !== 'save') continue;
			if (modToken.length && modToken != tokenID) continue;
			if (modName === '-' || !SaveMods.tableLookup( fields.Mods_basis, modRow, false )) continue;
			if (saveType && saveType.length && modName.dbName() !== saveType) continue;
			let save = [SaveMods.tableLookup( fields.Mods_saveField, modRow ),'current'],
				mod = [SaveMods.tableLookup( fields.Mods_modField, modRow ),'current'],
				roll = SaveMods.tableLookup( fields.Mods_roll, modRow ),
				modCmd = SaveMods.tableLookup( fields.Mods_cmd, modRow ) || saveCmd;
//			log('makeSavingThrowMenu: modRow '+modRow+', name = '+modName+', targetArgs = '+targetArgs+', modCmd = '+modCmd);
			modCmd = !!modCmd && modCmd.length ? (targetArgs && targetArgs.length ? (modCmd + '&#13;' + targetArgs) : modCmd) : targetArgs;
			content += '<tr>'
					+  '<td>['+modName+'](~'+charName+'|Do-not-use-'+modName.hyphened()+'-save)</td>'
					+  '<td>[[0+'+attrLookup(charCS,save)+']]</td>'
					+  '<td>[[0+'+attrLookup(charCS,mod)+'+'+sitMod+']]</td>'
					+  '</tr>';
			buildSaveRoll( tokenID, charCS, sitMod, null, modName, {save:save,mod:mod,roll:roll}, isGM, whoRolls, false, modCmd );
		};
				
		content += '</table>}}'
				+  '{{desc1=Select a button above to roll a saving throw or '
				+  '[Add Situational Modifier](!attk --save '+tokenID+'|?{What type of attack to save against'
															 +'&#124;Weak Poison,?{Enter DM\'s adjustment for Weak Poison&amp;#124;0&amp;#125;&amp;#124;Weak poison'
															 +'&#124;Dodgeable ranged attack,[[([[0+'+attrLookup(charCS,fields.Dex_acBonus)+']])*-1]]&amp;#124;Dodgeable ranged attack'
															 +'&#124;Mental Attack,'+attrLookup(charCS,fields.Wisdom_defAdj)+'&amp;#124;Mental attack'
															 +'&#124;Physical damage attack,?{Enter your magical armour plusses&amp;#124;0&amp;#125;&amp;#124;Physical attack'
															 +'&#124;Fire or acid attack,?{Enter your magical armour plusses&amp;#124;0&amp;#125;&amp;#124;Fire or acid'
															 +'&#124;DM adjustment,?{Ask DM for value of adjustment&amp;#124;0&amp;#125;&amp;#124;DM adjustment'
															 +'&#124;None of the above,0})'
				+  'such as ***Wisdom adjustment, Dexterity adjustment, fire or acid*** etc. before making the roll}}'
				+  '{{desc2=['+(!manUpdate ? '<span style=' + design.selected_button +'>' : '')+'Auto-check Saving Throws'+(!manUpdate ? '</span>' : '')+'](!attk --button '+BT.CHECK_SAVES+'|'+tokenID+') to set saves using Race, Class, Level & MI data, or\n'
				+  '['+(manUpdate ? '<span style=' + design.selected_button +'>' : '')+'Manually check Saving Throws'+(manUpdate ? '</span>' : '') + '](!attk --setSaves '+tokenID+'|||save) to manually change numbers}}';
					
		let saveNotes = attrLookup( charCS, fields.SaveNotes ),
			argString = args.join('|');
		if (saveNotes) {
			content += '{{desc3=**Notes**\n'+saveNotes+'}}';
		}
		content += '{{desc4=<div style="text-align: center"><table width="100%"><tr><td colspan="2" width="100%">**Change Dice Action**</td></tr><tr>'
				+  '<td width="50%">'+((whoRolls === SkillRoll.PCROLLS) ? ('<span style=' + design.selected_button + '>') : '[') + 'PC rolls' + ((whoRolls === SkillRoll.PCROLLS) ? '</span>' : '](!attk --button '+BT.SET_SAVE_ROLL+'|'+senderId+'|'+SkillRoll.PCROLLS+'|'+argString+')</td>')
				+  '<td width="50%">'+((whoRolls === SkillRoll.YOUROLL) ? ('<span style=' + design.selected_button + '>') : '[') + 'You roll' + ((whoRolls === SkillRoll.YOUROLL) ? '</span>' : '](!attk --button '+BT.SET_SAVE_ROLL+'|'+senderId+'|'+SkillRoll.YOUROLL+'|'+argString+')</td>')
				+  '</tr></table></div>}}';

		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
	}
	
	/*
	 * Make a menu for attribute check throws, and to maintain the 
	 * check throws table
	 
	 attr >= 2*(DC + 5 - roll)
	 
	 */
	 
	var makeAttributeCheckMenu = function( args, senderId ) {
		
		var tokenID = args[0],
			sitMod = (parseInt(((args[1] || '').match(/\d+/) || 0),10) || 0),
			msg = args[2] || '',
			DCval = 10-(parseInt(args[3] || 10) || 10),
			curToken = getObj('graphic',tokenID),
			charCS  = getCharacter( tokenID ),
			name =  curToken.get('name'),
			charName = charCS.get('name'),
			isGM = playerIsGM(senderId),
			playerConfig = getSetPlayerConfig( senderId ),
			manUpdate = playerConfig && playerConfig.manualCheckSaves,
			whoRolls = ((!_.isUndefined(playerConfig.skillRoll)) ? playerConfig.skillRoll : SkillRoll.PCROLLS),
			content = '&{template:'+fields.menuTemplate+'}{{name=Roll an Attribute Check for '+name+'}}'
					+ (msg && msg.length ? '{{Section='+msg+'}}' : '');
					
		var listSaves = function( descNo, title, obj ) {
					
			let txt = '{{desc'+descNo+'=<table>'
					+ '<thead>'
						+ '<th width="50%">'+title+'</th><th width="25%">Base</th><th width="25%">Mod</th>'
					+ '</thead>';
					
			_.each( obj, (saveObj,save) => {
				let mod = parseInt(attrLookup(charCS,saveObj.mod)) || 0;
				let target = parseInt(attrLookup(charCS,saveObj.save)) || 0;
				txt += '<tr>'
					+  '<td>['+save.dispName()+'](~'+charName+'|Do-not-use-'+save+'-save)</td>'
					+  '<td>[['+target+']]</td>'
					+  '<td>[['+mod+'+'+sitMod+'+'+DCval+']]</td>'
					+  '</tr>';
			});
			txt += '</table>}}';
			_.each( obj, (saveObj,saveType) => buildSaveRoll( tokenID, charCS, sitMod, DCval, saveType, saveObj, isGM, whoRolls, true ));
			return txt;
		};
		
		if (state.attackMaster.attrRoll) {
			handleSetNPCAttributes( charCS );
		};

		content += listSaves( 1, 'Attribute', saveFormat.Attributes );
		content += listSaves( 2, 'Check',	  saveFormat.Checks );

		content += '{{desc6=Select a button above to roll an attribute check or '
				+  'optionally ['+(sitMod ? ('Situational Mod = '+sitMod) : 'Add Situational Modifier')+'](!attk --attr-check '+tokenID+'|?{Specify amount, + is beneficial, - is a penalty}|Situational Modifier set|'+(10-DCval)+')'
				+  ' before making the roll}}'
				+  '{{desc7=['+(!manUpdate ? '<span style=' + design.selected_button +'>' : '')+'Auto-check Saving Throws'+(!manUpdate ? '</span>' : '')+'](!attk --button '+BT.CHECK_SAVES+'|'+tokenID+'|'+BT.ATTR_CHECK+') to set saves using Race, Class, Level & MI data, or\n'
				+  '['+(manUpdate ? '<span style=' + design.selected_button +'>' : '')+'Manually check Saving Throws'+(manUpdate ? '</span>' : '') + '](!attk --setSaves '+tokenID+'||||attr-check) to manually change numbers}}';
					
		let saveNotes = attrLookup( charCS, fields.SaveNotes ),
			argString = args.join('|');
		if (saveNotes) {
			content += '{{desc8=**Notes**\n'+saveNotes+'}}';
		}
		content += '{{desc9=<div style="text-align: center"><table width="100%"><tr><td colspan="2" width="100%">**Change Dice Action**</td></tr><tr>'
				+  '<td width="50%">'+((whoRolls === SkillRoll.PCROLLS) ? ('<span style=' + design.selected_button + '>') : '[') + 'PC rolls' + ((whoRolls === SkillRoll.PCROLLS) ? '</span>' : '](!attk --button '+BT.SET_ATTR_ROLL+'|'+senderId+'|'+SkillRoll.PCROLLS+'|'+argString+')</td>')
				+  '<td width="50%">'+((whoRolls === SkillRoll.YOUROLL) ? ('<span style=' + design.selected_button + '>') : '[') + 'You roll' + ((whoRolls === SkillRoll.YOUROLL) ? '</span>' : '](!attk --button '+BT.SET_ATTR_ROLL+'|'+senderId+'|'+SkillRoll.YOUROLL+'|'+argString+')</td>')
				+  '</tr></table></div>}}';

		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
	}
	
	/*
	 * Make a menu for thieving skills
	 */
	 
	var makeRogueCheckMenu = function( args, senderId ) {
		
		var tokenID = args[0],
			sitMod = (parseInt((args[1] || 0),10) || 0),
			msg = args[2] || '',
			curToken = getObj('graphic',tokenID),
			charCS  = getCharacter( tokenID ),
			name =  curToken.get('name'),
			charName = charCS.get('name'),
			isGM = playerIsGM(senderId),
			playerConfig = getSetPlayerConfig( senderId ),
			manUpdate = playerConfig && playerConfig.manualCheckSkills,
			whoRolls = ((!_.isUndefined(playerConfig.skillRoll)) ? playerConfig.skillRoll : SkillRoll.PCROLLS),
			content = '&{template:'+fields.menuTemplate+'}{{name=Roll a Thieving Skill Check for '+name+'}}'
					+ (msg && msg.length ? '{{Section='+msg+'}}' : '')
					+ '{{desc=You may need to ask the GM to make this roll'
					+ '<table>'
					+ '<thead>'
						+ '<th width="50%">Skill</th><th width="25%">Target</th>'
					+ '</thead>';
					
		if (!manUpdate) handleCheckThiefMods( [tokenID], senderId, true );
					
		_.each( rogueSkills, (skillObj) => {
			content += '<tr>'
					+  '<td>['+skillObj.name.dispName()+'](~'+charName+'|Do-not-use-'+skillObj.name.replace(/_/g,'-')+'-check)</td>'
					+  '<td>[[0+'+attrLookup(charCS,skillObj.save)+']]</td>'
					+  '</tr>';
		});
				
		content += '</table>}}'
				+  ((state.attackMaster.thieveCrit > 0) ? ('{{desc1=<b>Note:</b> a critical success roll of '+state.attackMaster.thieveCrit+'% applies to skill checks (set by GM in RPGM config)}}') : '')
				+  '{{desc2=Select a button above to roll a skill check or '
				+  '[Add Situational Modifier](!attk --thieve '+tokenID+'|?{What type of adjustment might be needed? + is beneficial, - is a penalty'
															 +'&#124;Non-Standard Tools,?{Enter DM\'s adjustment for Non-Standard Thieves Tools + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;Non-Standard Tools'
															 +'&#124;Difficult Lock or Trap,?{Enter DM\'s adjustment for lock/trap difficulty + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;Difficult Lock or Trap'
															 +'&#124;Difficulty of Hiding,?{Enter DM\'s adjustment for ease or difficulty of hiding in shadows + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;Difficulty of Hiding'
															 +'&#124;Barriers to Hearing,?{Enter DM\'s adjustment for barriers to Detecting Noise + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;Barriers to Hearing'
															 +'&#124;Difficulty of Climb,?{{Enter DM\'s adjustment for ease or difficulty of climb + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;Difficulty of Climb'
															 +'&#124;Indecipherable Language,?{{Enter DM\'s adjustment for the difficulty of this language + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;Indecipherable Language'
															 +'&#124;DM adjustment,?{Ask DM for value of adjustment + is beneficial - is a penalty&amp;#124;0&amp;#125;&amp;#124;DM adjustment'
															 +'&#124;None of the above,0})'
				+  'currently [['+sitMod+']], '
				+  'such as ***non-standard thieves tools, unusual difficulty of trap/climb*** etc. before making the roll}}'
				+  '{{desc3=['+(!manUpdate ? '<span style=' + design.selected_button +'>' : '')+'Auto-check Skill Scores'+(!manUpdate ? '</span>' : '')+'](!attk --check-thieving '+tokenID+') to set skill Class base, Race, Dexterity, Armour and Items, or\n'
				+  '['+(manUpdate ? '<span style=' + design.selected_button +'>' : '')+'Manually check Skill Scores'+(manUpdate ? '</span>' : '') + '](!attk --set-thieving '+tokenID+'|||save) to manually change numbers'
				+  '}}';
				
		let argString = args.join('|');
					
		content += '{{desc9=<div style="text-align: center"><table width="100%"><tr><td colspan="2" width="100%">**Change Dice Action**</td></tr><tr>'
				+  '<td width="50%">'+((whoRolls === SkillRoll.PCROLLS) ? ('<span style=' + design.selected_button + '>') : '[') + 'PC rolls' + ((whoRolls === SkillRoll.PCROLLS) ? '</span>' : '](!attk --button '+BT.SET_SKILL_ROLL+'|'+senderId+'|'+SkillRoll.PCROLLS+'|'+argString+')</td>')
				+  '<td width="50%">'+((whoRolls === SkillRoll.YOUROLL) ? ('<span style=' + design.selected_button + '>') : '[') + 'You roll' + ((whoRolls === SkillRoll.YOUROLL) ? '</span>' : '](!attk --button '+BT.SET_SKILL_ROLL+'|'+senderId+'|'+SkillRoll.YOUROLL+'|'+argString+')</td>')
				+  '</tr></table></div>}}';

		sendResponse( charCS, content, senderId, flags.feedbackName, flags.feedbackImg, tokenID );

		_.each( rogueSkills, (skillObj,skillType) => buildRogueRoll( tokenID, charCS, sitMod, skillType, skillObj, isGM, whoRolls ));
	}
	
	/*
	 * Make a menu to modify the saving throw table
	 */

	var makeModSavesMenu = function( args, senderId, msg ) {
		
		var tokenID = args[0],
			rollMenu = (args[4] || 'save'),
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter( tokenID ),
			name = curToken.get('name'),
			content = '&{template:'+fields.menuTemplate+'}{{name=Set '+name+'\'s Saving Throws}}'
					+ ((msg && msg.length) ? '{{Section='+msg+'}}' : '')
					+ '{{desc=<table><tr>'
						+ '<td>Save</td><td>Base</td><td>Mod</td>'
					+ '</tr>';
					
		var dispSave = function( type, save, field ) {
			return '<td>['+attrLookup(charCS,field)+'](!attk --setSaves '+tokenID+'|'+save+'|'+type+'|?{Save vs '+save+' '+(type !== 'Save' ? 'modifier' : 'base')+'?|'+attrLookup(charCS,field)+(type !== 'Save' ?'|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10' : '|20|19|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1')+'}|'+rollMenu+')</td>';
		};
		
		if (rollMenu === 'save') {
			_.each( saveFormat.Saves, (saveObj,save) => {
				content += '<tr><th scope="row">' + save + '</th>' + dispSave( 'Save', save, saveObj.save ) + dispSave( 'Mod', save, saveObj.mod ) + '</tr>';
			});
		} else {
			_.each( saveFormat.Attributes, (saveObj,save) => {
				content += '<tr><th scope="row">' + save + '</th><td> </td>' + dispSave( 'Mod', save, saveObj.mod ) + '</tr>';
			});
			content += '</tr></table>}}{{desc1=<table><tr><td>Save</td><td>Base</td><td>Mod</td></tr>';
			_.each( saveFormat.Checks, (saveObj,save) => {
				content += '<tr><th scope="row">' + save + '</th><td> </td>' + dispSave( 'Mod', save, saveObj.mod ) + '</tr>';
			});
		};
		
		content	+= '</tr></table>}}'
				+  '{{desc8=Select a button above to set the Save or Modifyer numbers, or select '
				+  (rollMenu!=='save'?'':'[Adjust save mods](!attk --setSaves '+tokenID+'|Saves|Mod|?{Change in Save modifiers?|0|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10}|'+rollMenu+')')
				+  (rollMenu!=='save'?'[Adjust attribute check mods](!attk --setSaves '+tokenID+'|Attributes|Mod|?{Change in Attribute modifiers?|0|10|9|8|7|6|5|4|3|2|1|0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10}|'+rollMenu+')':'')
				+  '}}{{desc9=Return to [Roll '+(rollMenu==='save'?'Saves':'Attribute Checks')+'](!attk --'+rollMenu+' '+tokenID+') menu}}';
		
		sendResponse(charCS,content,senderId,flags.feedbackName,flags.feedbackImg,tokenID);
	}
	
	/*
	 * Make a menu for updating rogue skills manually
	 */
	 
	var makeModRogueSkillsMenu = function( args, senderId, msg ) {
		
		var tokenID = args[0],
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter( tokenID ),
			name = curToken.get('name'),
			classes = classObjects( charCS, senderId ),
			rogue = _.find( classes, c => c.base === 'rogue' ),
			playerConfig = getSetPlayerConfig( senderId ),
			manUpdate = playerConfig && playerConfig.manualCheckSkills,
			startPts = 0,
			ptsPerLevel = 0,
			levelPoints = 0,
			totalLevelPoints = 0,
			tags = [],
			skillText = '',
			content = '&{template:'+fields.menuTemplate+'}{{name=Set '+name+'\'s Thieving Skills}}'
					+ '{{Section='+((msg && msg.length) ? msg : 'Drag chat window wider to see table')+'}}'
					+ '{{Section1=Current thieve\'s armour is <span style='+design.green_button+'>'+attrLookup(charCS,fields.Armor_name)+'</span>}}'
					+ '{{desc=<table width="100%"; table-layout="fixed";><tr width="100%"><th width="23%">Skill</th>';
					
		var dispSkill = function( skill, type, field ) {
			let val = attrLookup(charCS,field) || 0,
				isLevel = type.dbName() === 'level';
			if (isNaN(val)) val = 0;
			if (isLevel) levelPoints += parseInt(val);
			return ('<td>'+(!manUpdate && !isLevel ? ('<span style='+design.grey_button+'>') : '[')+(attrLookup(charCS,field) || 0)+(!manUpdate && !isLevel ? '</span>' : ('](!attk --set-rogue-skill '+tokenID+'|'+skill+'|'+type+'|'+field[0]+'|?{Check vs '+skill+' '+type+'?|'+val+'})</td>')));
		};
		
		if (!manUpdate) skillText = handleCheckThiefMods( [tokenID], senderId );
		totalLevelPoints = rogueLevelPoints(charCS, classes);

		_.each( thiefSkillFactors, factor => {
			content += '<th width="11%">'+factor+'</th>';
		});
		content += '</tr>';
					
		_.each( rogueSkills, skillObj => {
			if (!tags.includes(skillObj.tag)) {
				content += '<tr><th scope="row">' + skillObj.name.dispName() + '</th>';
				_.each( skillObj.factors, (skillFactor,i) => {
					content += dispSkill( skillObj.name, thiefSkillFactors[i], [skillFactor,'current'] );
				});
				content += '</tr>';
				tags.push(skillObj.tag);
			};
		});
		
		let over = (totalLevelPoints < levelPoints);
		content	+= '</table>}}'
				+  skillText
				+  '{{desc1='+(over ? '<span style='+design.selected_button+'>' : '')+'Total Level points remaining = [['+(totalLevelPoints - levelPoints)+']]'+(over ? '</span>' : '')+'}}'
				+  ((state.attackMaster.thieveCrit > 0) ? ('{{desc2=<b>Note:</b> a critical success roll of '+state.attackMaster.thieveCrit+'% applies to skill checks (set by GM in RPGM config)}}') : '')
				+  '{{desc8=Select a button above to set the Skill Factor}}'
				+  '{{desc9=Return to [Roll Thieving Skill](!attk --thieve '+tokenID+') menu}}';
		
		sendResponse(charCS,content,senderId,flags.feedbackName,flags.feedbackImg,tokenID);
	}
	
	/*
	 * Make a menu for accessing the attack API capabilities
	 */
	 
	var makeAttkActionMenu = function( args, senderId ) {
		
		var tokenID = args[1],
			tokenName = getObj('graphic',tokenID).get('name'),
			charCS = getCharacter(tokenID),
			content = '&{template:'+fields.menuTemplate+'}{{name='+tokenName+'\'s Attack Actions}}'
					+ '{{desc=[Attack (Roll20 rolls)](!attk --attk-menu-hit '+tokenID+')\n'
					+ '[Attack (You roll)](!attk --attk-roll '+tokenID+')\n'
					+ (!state.attackMaster.weapRules.dmTarget || playerIsGM(senderId) ? '[Targeted Attack](!attk --attk-target '+tokenID+')\n' : '')
					+ '[Change Weapon](!attk --weapon '+tokenID+')\n'
					+ '[Recover Ammo](!attk --ammo '+tokenID+')\n'
					+ '[Edit Weapons & Armour]('+((apiCommands.magic && apiCommands.magic.exists) ? '!magic --edit-mi '+tokenID+'|martial' : '!attk --edit-weapons '+tokenID)+')\n' 
					+ '[Check AC](!attk --checkac '+tokenID+')\n'
					+ '[Check Thac0 & HP Mods](!attk --checkmods '+tokenID+')}}'
					
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
			checkForMIbag = attrLookup( charCS, fields.ItemContainerType ) || 1,
			content = '&{template:'+fields.menuTemplate+'}{{name='+tokenName+'\'s Other Actions}}'
					+ '{{subtitle=Maintenance}}'
					+ '{{desc=[Saving Throws](!attk --save '+tokenID+')\n'
					+ '[Attribute Check](!attk --attr-check '+tokenID+')\n'
					+ '[Rogue Skill Check](!attk --thieve '+tokenID+')\n'
					+ ((apiCommands.cmd && apiCommands.cmd.exists) ? ('[Manage Character Class](!cmd --class-menu '+tokenID+')\n') : ('<span style='+design.grey_button+'>Manage Character Class</span>'))
					+ (isGM ? ('[Death](!token-mod --ignore-selected --ids '+tokenID+' --set statusmarkers|dead tint_color|rgb&#40;1.0,1.0,1.0&#41; &#13;'
									  +'!rounds --removetargetstatus '+tokenID+'|ALL &#13;'
									  +'!setattr --fb-header &#64;{selected|token_name} Has Died --fb-content Making _CHARNAME_ as dead --charid '+charCS.id+' --Check-for-MIBag|[&#91;'+checkForMIbag+'%2&#93;])\n') : '')
					+ ((apiCommands.magic && apiCommands.magic.exists) ? ('[Manage Light Sources](!magic --lightsources '+tokenID+')\n') : ('<span style='+design.grey_button+'>Manage Light Sources</span>'))
					+ ((apiCommands.money && apiCommands.money.exists) ? ('[Manage Money](!money --money-menu '+tokenID+')\n') : ('<span style='+design.grey_button+'>Manage Money</span>'))
					+ ((apiCommands.money && apiCommands.money.exists) ? ('[Out-of-Campaign activities](!money --training '+tokenID+')\n') : ('<span style='+design.grey_button+'>Out-of-Campaign activities</span>'))
					+ (isGM ? '[Adjust Damage](!setattr --silent --charid '+charCS.id+' --strengthdmg||&#63;{Damage adjustment?} --strnotes|\'Dmg bonus: &#63;{Damage adjustment?|0} because &#63;{Why?}\'&#13;'
						+ '&#47;w gm **'+tokenName+'\'s new damage adjustment is [&#91;&#63;{Damage adjustment?|0}&#93;] because of &#63;{Why?}.**  Previous damage adjustment was &#91;[0+&#64;{selected|strengthdmg|max}]&#93;.)\n' : '')
					+'}}';
		sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg,tokenID );
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
			if (isNaN(ammoIndex)) ammoIndex = Ammo.tableFind( fields.Ammo_miName, ammoName );
			ammoMIname = Ammo.tableLookup( fields.Ammo_miName, ammoIndex) || ammoMIname;
		} else {
			ammoIndex = Ammo.tableFind( fields.Ammo_miName, ammoName ) || Ammo.tableFind( fields.Ammo_name, ammoName );
		}
		miIndex = MagicItems.tableFind( fields.Items_trueName, ammoMIname ) || MagicItems.tableFind( fields.Items_name, ammoMIname );
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
			
			let change = (miM-maxQty);
			if (MagicItems.tableLookup( fields.Items_type, miIndex ).toLowerCase().startsWith('chang')) {
				let changeTo = resolveData( ammoMIname, fields.MagicItemDB, reItemData, charCS, {changeTo:reWeapSpecs.changeTo}, miIndex ).parsed.changeTo;
				if (changeTo) {
					let changeRow = MagicItems.tableFind( fields.Items_trueName, changeTo );
					if ((change > 0) && _.isUndefined(changeRow)) {
						sendAPI( fields.magicMaster+' --button STORE-MI|'+tokenID+'||'+changeTo+'|'+change+'|silent' );
					} else {
						MagicItems.tableSet( fields.Items_qty, changeRow, (parseInt(MagicItems.tableLookup( fields.Items_qty, changeRow ) || 0)+change) );
						MagicItems.tableSet( fields.Items_trueQty, changeRow, (parseInt(MagicItems.tableLookup( fields.Items_trueQty, changeRow ) || 0)+change) );
					};
				};
			};

			if (maxQty == 0) {
				ammoDef = abilityLookup( fields.WeaponDB, ammoMIname, charCS, true );
				if (ammoDef.obj && ammoDef.obj[1] && (['charged','rechargeable','discharging'].includes((ammoDef.obj[1].charge || '').toLowerCase()))) {
					MagicItems.tableSet( fields.Items_name, miIndex, '-' );
					MagicItems.tableSet( fields.Items_trueName, miIndex, '-' );
				}
			}
			ammoIndex = Ammo.table[1]-1;
			while(!_.isUndefined(miName = Ammo.tableLookup(fields.Ammo_miName, ++ammoIndex, false))) {
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
		} else {
			sendWait(senderId,0);
		}
		return;
	};	
	
	/**
	 * Handle the version of the change weapon command that
	 * passes in a character sheet ID rather than a token ID
	 * to support situations where the token gets changed by
	 * asynchronous processing
	 **/
	 
	var handleCSchangeWeapon = function( args, senderId, silent ) {
		var charID = args[1],
			tokens = findObjs({ type:'graphic', represents:charID });
			
		if (tokens && tokens.length) {
			args[0] = args[0] === BT.CS_RIGHT ? BT.RIGHT : (args[0] === BT.CS_LEFT ? BT.LEFT : (args[0] === BT.CS_BOTH ? BT.BOTH : BT.HAND));
			args[1] = tokens[0].id;
			handleChangeWeapon( args, senderId, silent );
		}
	}
			
	/**
	 * The processing to change weapon is lengthy as it has to do
	 * a lot of searching & updating of tables.  So send a
	 * "please wait..." message to the Player and a time-delayed
	 * call to the processing to allow the screen to update before
	 * hogging the processing power...
	 */
	 
	async function handleChangeWeapon ( args, senderId, silent=false, noCurse=false ) {

		try {
			
			var cmd = (args[0] || '').replace('-NOCURSE',''),
				tokenID = args[1],
				selection = args[2],
				row = args[3],
				handsLent = parseInt(args[4]) || 0,
				silent = silent || (args[5] && args[5].toUpperCase() == 'SILENT'),
				weapDef = [args[6] || '',args[7]],
				twoHanded = cmd == BT.BOTH,
				curToken = getObj('graphic',tokenID),
				charCS = getCharacter(tokenID),
				weaponInfo = {},
				InHandTable = getTable( charCS, fieldGroups.INHAND ),
				Quiver = getTable( charCS, fieldGroups.QUIVER ),
				Items = getTable( charCS, fieldGroups.MI ),
				values = initValues( InHandTable.fieldGroup ),
				noHands = parseInt(attrLookup(charCS,fields.Equip_handedness)) || 2,
				lentHands = parseInt(attrLookup(charCS,fields.Equip_lentHands)) || 0,
				handedness = 1,
				r = parseInt(selection.split(':')[0]),
				c = parseInt(selection.split(':')[1]),
				isGM = playerIsGM(senderId),
				weaponDB = fields.WeaponDB,
				cursed = false,
				weaponSpecs = ['-','-','melee','1','-'],
				lentLeftID, lentRightID, lentBothID,
				weapon, trueWeapon, weaponToHit, weaponQty, weapData,
				item, i, hand, index, sheathed, oldWeaponDB;
				
			weaponInfo.MELEE = getTable( charCS, fieldGroups.MELEE );
			weaponInfo.DMG = getTable( charCS, fieldGroups.DMG );
			weaponInfo.RANGED = getTable( charCS, fieldGroups.RANGED );
			weaponInfo.AMMO = getTable( charCS, fieldGroups.AMMO );
			weaponInfo.MAGIC = getTable( charCS, fieldGroups.MAGIC );
			if (!_.isUndefined( fieldGroups.WEAP )) weaponInfo.WEAP = getTable( charCS, fieldGroups.WEAP );
			weaponInfo.ammoTypes = [];
			
			// Check if selection is a number or a item name
			
			if (selection === '-') {
				r = Items.tableFind( fields.Items_name, '-' );
				if (isNaN(r)) {
					Items = Items.addTableRow();
					r = Items.sortKeys.length - 1;
				}
			}
			if (isNaN(r)) r = Items.tableFind( fields.Items_trueName, selection );
			if (isNaN(r)) throw new Error('handleChangeWeapon: Can\'t find weapon '+selection);
			if (!(/\d+(?::\d+)?/.test(selection))) selection = String(r);
				
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
				if (weaponQty >= 0) Spells.tableSet( fields.Spells_castValue, r, Math.max(weaponQty-1,0) );
			} else {
				weapon = Items.tableLookup( fields.Items_name, r ) || '-';
				trueWeapon = Items.tableLookup( fields.Items_trueName, r ) || weapon;
				weaponQty = parseInt(Items.tableLookup( fields.Items_qty, r ) || 0);
				if (!weaponQty && weapon !== '-') {
					sendParsedMsg(tokenID,messages.noneLeft,senderId);
					return;
				}
			}
			if (!noCurse) {
				if (row < 3) {
					let row0type = Items.tableLookup( fields.Items_trueType, InHandTable.tableLookup( fields.InHand_index, 0 )).toLowerCase(),
						row1type = Items.tableLookup( fields.Items_trueType, InHandTable.tableLookup( fields.InHand_index, 1 )).toLowerCase(),
						row2type = Items.tableLookup( fields.Items_trueType, InHandTable.tableLookup( fields.InHand_index, 2 )).toLowerCase();
					if (row == 0) cursed = (row0type.includes('cursed') || row2type.includes('cursed'));
					if (row == 1) cursed = (row1type.includes('cursed') || row2type.includes('cursed'));
					if (row == 2) cursed = (row0type.includes('cursed') || row1type.includes('cursed') || row2type.includes('cursed'));
				} else {
					let rowType = Items.tableLookup( fields.Items_trueType, InHandTable.tableLookup( fields.InHand_index, row )).toLowerCase();
					cursed = rowType.includes('cursed');
				}
				if (cursed) {
					args[0] += '-NOCURSE';
					sendParsedMsg(tokenID,messages.cursedWeapon + '{{desc9=I have a means to [change it anyway](!attk --button '+args.join('|')+')}}',senderId);
					return;
				}
			}

			if (weapon !== '-') {
				item = abilityLookup(weaponDB, trueWeapon, charCS, true);
				if (!item.obj) {
					sendDebug('handleChangeWeapon not found '+weapon);
					return;
				};
				weaponSpecs = item.specs(/}}\s*Specs\s*=(.*?){{/im);
				weaponToHit = resolveData( trueWeapon, weaponDB, reToHitData, charCS, {name:reWeapSpecs.name}, r).raw;
				weaponSpecs = (weaponToHit && weaponToHit.length) ? weaponSpecs.slice(0,weaponToHit.length) : ['-','-','melee','1','-'];
				handedness = row < 2 ? 1 : weaponSpecs.reduce((hands, weapon) => Math.max( hands, (parseInt(weapon[3])||1) ), 1);
				if (twoHanded) handedness = Math.max(handedness,2);
			}
			
			oldWeaponDB = InHandTable.tableLookup( fields.InHand_db, row ) || fields.WeaponDB;
			
			// Next, blank the quiver table
			
			Quiver = blankQuiver( charCS, Quiver );

			// And reverse any previously lent hands
			
			if (lentBothID.length) {
				setAttr( charCS, fields.Equip_lendBoth, '' );
				setAttr( charCS, fields.Equip_lentHands, 0 );
				sendAPI('!attk --lend-a-hand '+tokenID+'|'+lentBothID+'|'+lentHands+'|'+BT.BOTH, null, 'attk handleChangeWeapon');
			}
			
			// Check if this is a dancing weapon
			
			weapData = resolveData( trueWeapon, weaponDB, reItemData, charCS, {on:reWeapSpecs.on,dancer:reWeapSpecs.dancer}, r ).parsed;

			// Then add the weapon to the InHand table
			
			values[fields.InHand_name[0]][fields.InHand_name[1]] = weapon;
			values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = trueWeapon;
			values[fields.InHand_index[0]][fields.InHand_index[1]] = selection;
			values[fields.InHand_column[0]][fields.InHand_column[1]] = c;
			values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness;
			values[fields.InHand_db[0]][fields.InHand_db[1]] = weaponDB;
			values[fields.InHand_type[0]][fields.InHand_type[1]] = (!item || !item.obj ? weaponSpecs[0][2] : item.obj[1].type);
			values[fields.InHand_dancer[0]][fields.InHand_dancer[1]] = weapData.dancer;
			
			switch (args[0].toUpperCase()) {
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
			
			if (!silent) setTimeout(() => makeChangeWeaponMenu( args, senderId, 'Now using '+weapon+'. ' ), 5);
			
			// Next add the new weapon to the weapon tables and 
			// at the same time check every weapon InHand for ammo to 
			// add to the quiver
			
			if (selection != -3) [weaponInfo,Quiver] = await updateAttackTables( charCS, senderId, InHandTable, Quiver, weaponInfo, row, selection, handedness, weapDef );
			
			// Then remove any weapons or ammo from the weapon tables that 
			// are not currently inHand (in the InHand or Quiver tables)

			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE', [], oldWeaponDB );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED', sheathed, oldWeaponDB );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG', sheathed, oldWeaponDB );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO', sheathed, oldWeaponDB );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MAGIC', sheathed, oldWeaponDB );
			if (!_.isUndefined( weaponInfo.WEAP )) sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'WEAP', sheathed, oldWeaponDB );
			
			if (!weapData.dancer && !weapData.on) {
				sendAPImacro(curToken,'',trueWeapon,'-inhand');	
			} else {
				if (weapData.dancer) {
					sendAPI( fields.roundMaster+' --dancer inhand|'+tokenID+'|'+trueWeapon+'|'+weaponSpecs[0][2]+'|'+weapData.dancer );
				};
				if (weapData.on) {
					setTimeout(() => sendAPI( parseStr(weapData.on).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
																   .replace(/@{\s*selected\s*\|\s*character_id\s*}/ig,charCS.id)
																   .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'),
						null, 'attk handleChangeWeapon 2'), 2000);
				};
			};
			
			// RED v1.038: store name of weapon just taken in hand for later reference as needed
			setAttr( charCS, fields.Equip_takenInHand, weapon );
			setAttr( charCS, fields.Equip_trueInHand, trueWeapon );
			
			checkCurrentStyles( charCS, InHandTable );
			doCheckAC( [tokenID], senderId, [], true );
			doCheckMods( [tokenID], senderId, [], true );
			setAttr( charCS, [fields.Init_hand[0]+'0',fields.Init_hand[1]], '' );
			setAttr( charCS, [fields.Init_hand[0]+'1',fields.Init_hand[1]], '' );
			setAttr( charCS, [fields.Init_hand[0]+'2',fields.Init_hand[1]], '' );
			
			return;
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
		}
	}
	
	/* 
	 * Handle putting on and taking off rings
	 */
	 
	var handleChangeRings = function( args, senderId, silent=false ) {
		
		var noCurse = args[0].toUpperCase().includes('-NOCURSE'),
			cmd = args[0].replace('-NOCURSE',''),
			left = cmd == BT.LEFTRING,
			tokenID = args[1],
			selection = parseInt(args[2]),
			silent = silent || (args[3] || '').toUpperCase() === 'SILENT',
			charCS = getCharacter(tokenID),
			charName = charCS.get('name'),
			ring = attrLookup( charCS, (left ? fields.Equip_leftRing : fields.Equip_rightRing) ) || '-',
			trueRing = attrLookup( charCS, (left ? fields.Equip_leftTrueRing : fields.Equip_rightTrueRing) ) || ring,
			item, trueItem, ringData;
			
		if (ring != '-') {
			if (!noCurse) {
				let Items = getTable( charCS, fieldGroups.MI );
				let ringRow = Items.tableFind( fields.Items_trueName, trueRing );
				if (!_.isUndefined(ringRow)) {
					let ringType = Items.tableLookup( fields.Items_trueType, ringRow );
					if (ringType.toLowerCase().includes('cursed')) {
						args[0] += '-NOCURSE';
						sendParsedMsg(tokenID,messages.cursedRing + '{{desc9=I have a means to [change it anyway](!attk --button '+args.join('|')+')}}',senderId);
						return;
					}
				};
						
				ringData = resolveData( trueRing, fields.MagicItemDB, reRingData, charCS, {}, ringRow, [], false ).parsed;
				if (ringData.off) {
					sendAPI( parseStr(ringData.off).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
												   .replace(/@{\s*selected\s*\|\s*character_id\s*}/ig,charCS.id)
												   .replace(/{\s*selected\s*\|/ig,'{'+charName+'|'), senderId, 'attk handleChangeRings 1');
				};
			};
		};
		if (!isNaN(selection)) {
			ring = attrLookup( charCS, fields.Items_name, fields.Items_table, selection ) || '-';
			trueRing = attrLookup( charCS, fields.Items_trueName, fields.Items_table, selection ) || ring;
			item = getAbility(fields.MagicItemDB, ring, charCS, true, null, null, selection);
			trueItem = getAbility(fields.MagicItemDB, trueRing, charCS, true, null, null, selection);
			if (!item.obj || !trueItem.obj) {
				sendDebug('handleChangeRings not found '+ring+' or '+trueRing);
				return;
			};
			setAttr( charCS, (left ? fields.Equip_leftRing : fields.Equip_rightRing), ring );
			setAttr( charCS, (left ? fields.Equip_leftTrueRing : fields.Equip_rightTrueRing), trueRing );
			ringData = resolveData( trueRing, fields.MagicItemDB, reRingData, charCS, {}, selection, [], false ).parsed;
			if (ringData.on) {
				sendAPI( parseStr(ringData.on).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
											  .replace(/@{\s*selected\s*\|\s*character_id\s*}/ig,charCS.id)
											  .replace(/{\s*selected\s*\|/ig,'{'+charName+'|'), senderId, 'attk handleChangeRings 2');
			};
		} else {
			ring = 'no ring';
			setAttr( charCS, (left ? fields.Equip_leftRing : fields.Equip_rightRing), '-' );
			setAttr( charCS, (left ? fields.Equip_leftTrueRing : fields.Equip_rightTrueRing), '-' );
		}
		args[0] = cmd;
		doCheckAC( [tokenID], senderId, [], true );
		doCheckMods( [tokenID], senderId, [], true );
		if (!silent) setTimeout(() => makeChangeWeaponMenu( args, senderId, 'Now using '+ring+'. ' ), 50);
		return;
	}

	/*
	 * Handle the addition or removal of autonomous weapons, such as 
	 * dancing weapons*/
	 
	async function handleDancingWeapons ( args, senderId, selected ) {
		
		try {
			var isAdd = (args[0] == BT.AUTO_ADD),
				tokenID = args[1],
				weapon = (args[2] || ''),
				lcWeapon = weapon.toLowerCase(),
				curToken = getObj('graphic',tokenID),
				charCS = getCharacter(tokenID),
				noHands = parseInt(attrLookup(charCS,fields.Equip_handedness)) || 2,
				dancing = parseInt(attrLookup(charCS,fields.Equip_dancing)) || 0,
				Items = getTable( charCS, fieldGroups.MI ),
				weaponInfo = {},
				InHandTable = getTable(charCS, fieldGroups.INHAND),
				Quiver = getTable(charCS, fieldGroups.QUIVER),
				i = InHandTable.tableFind( fields.InHand_trueName, weapon ),
				rocket = _.isUndefined(i),
				weaponName, weaponType, weaponIndex, dancer, attkCount,
				slotName, handedness, weap, weaponSpecs, values, msg, sheathed;
				
			weaponInfo.MELEE = getTable( charCS, fieldGroups.MELEE );
			weaponInfo.DMG = getTable( charCS, fieldGroups.DMG );
			weaponInfo.RANGED = getTable( charCS, fieldGroups.RANGED );
			weaponInfo.AMMO = getTable( charCS, fieldGroups.AMMO );
			weaponInfo.ammoTypes = [];

			if (rocket) {
				weaponIndex = Items.tableFind( fields.Items_trueName, weapon );
				weaponName = Items.tableLookup( fields.Items_name, weaponIndex );
				weaponType = Items.tableLookup( fields.Items_type, weaponIndex );
				handedness = 0;
				dancer = resolveData( weapon, fields.WeaponDB, reItemData, charCS, {dancer:reWeapSpecs.dancer}, weaponIndex ).parsed.dancer;
				attkCount = resolveData( weapon, fields.WeaponDB, reToHitData, charCS, {noAttks:reWeapSpecs.noAttks}, weaponIndex ).parsed.noAttks;
			} else {
				weaponIndex = InHandTable.tableLookup( fields.InHand_index, i );
				weaponName = InHandTable.tableLookup( fields.InHand_name, i );
				weaponType = InHandTable.tableLookup( fields.InHand_type, i );
				handedness = InHandTable.tableLookup( fields.InHand_handedness, i );
				dancer = InHandTable.tableLookup( fields.InHand_dancer, i );
				attkCount = InHandTable.tableLookup( fields.InHand_attkCount, i );
			}
			
			if (_.isUndefined(weaponIndex)) {
				sendError('handleDancingWeapons unable to find '+weapon);
				return;
			}
			
			if (!rocket) {
				InHandTable.addTableRow( i );
			}
			
			Quiver = blankQuiver( charCS, Quiver );

			if (!isAdd) {
				setAttr( charCS, fields.Equip_dancing, (dancing-1) );
				i = weaponIndex = handedness = null;
				msg = weapon+' has stopped Dancing. If you have free hands, grab it now.  If not, change weapons next round to take it in hand again}}';
			} else {
				weap = abilityLookup( fields.WeaponDB, weapon, charCS );
				weaponSpecs = weap.specs(/}}\s*Specs\s*=(.*?){{/im);
				values = initValues(fieldGroups.INHAND.prefix),
				values[fields.InHand_handedness[0]][fields.InHand_handedness[1]] = handedness;
				values[fields.InHand_name[0]][fields.InHand_name[1]] = weaponName;
				values[fields.InHand_trueName[0]][fields.InHand_trueName[1]] = weapon;
				values[fields.InHand_index[0]][fields.InHand_index[1]] = weaponIndex;
				values[fields.InHand_db[0]][fields.InHand_db[1]] = fields.WeaponDB;
				values[fields.InHand_type[0]][fields.InHand_type[1]] = weaponType;
				values[fields.InHand_dancer[0]][fields.InHand_dancer[1]] = dancer;
				values[fields.InHand_attkCount[0]][fields.InHand_attkCount[1]] = attkCount;
				
				i = noHands + dancing;
				InHandTable = checkInHandRows( charCS, InHandTable, i+1 );
				
				do {
					slotName = InHandTable.tableLookup( fields.InHand_name, ++i, false );
				} while (!_.isUndefined(slotName) && slotName != '-');
				if (_.isUndefined(slotName)) {
					sendError('Unable to add '+weapon+' as a Dancing weapon' );
				} else {
					InHandTable = InHandTable.addTableRow( i, values );
				}
				setAttr( charCS, fields.Equip_dancing, (dancing+1) );
				if (!rocket) sendPublic( getObj('graphic',tokenID).get('name')+' lets go of their '+weapon+' which continues to fight by itself' );
				msg = weapon+(rocket ? ' leaps out of your equipment and starts attacking by itself!' : ' has started *Dancing!* and will automatically be added to Initiative rolls');
			}
			[weaponInfo,Quiver] = await updateAttackTables( charCS, senderId, InHandTable, Quiver, weaponInfo, i, weaponIndex, handedness );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'MELEE', [] );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'RANGED', sheathed );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'DMG', sheathed );
			sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO', sheathed );
			if (!_.isUndefined( weaponInfo.WEAP )) sheathed = filterWeapons( tokenID, charCS, InHandTable, Quiver, weaponInfo, 'AMMO', sheathed );

			if (isAdd) sendAPImacro(curToken,'',weapon,'-dancing');
			setTimeout(() => (rocket ? doAttk([tokenID,msg],senderId,Attk.USER,selected) : makeChangeWeaponMenu( args, senderId, msg )), 50);
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
		}
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
			weapon = (args[2]||'').dbName(),
			tableName = (args[3]||'').toUpperCase(),
			attributes = parseStr(args[4] || ''),
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
				if ('all' == weapon || miName.dbName() == weapon
									|| attkName.dbName() == weapon
									|| (typeName.dbName().split('|').includes(weapon))
									|| (superType.dbName().includes(weapon))) {

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
		msg = '&{template:'+fields.menuTemplate+'}{{name=Setting Primary Weapon}}'
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
			MIdata, speed;
			
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
//		MIdata = abilityLookup( fields.MagicItemDB, MItoStore, charCS );
		speed = resolveData( MItoStore, fields.MagicItemDB, reItemData, charCS, {speed:reWeapSpecs.speed}, MIrowref ).parsed.speed;

//		setAttr( charCS, fields.ItemCastingTime, ((MIdata.obj && MIdata.obj[1]) ? MIdata.obj[1].ct : 0 ));
		setAttr( charCS, fields.ItemCastingTime, speed );
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
//			magicItem = abilityLookup( fields.MagicItemDB, MIchosen, charCS ),
			MIdata = resolveData( MIchosen, fields.MagicItemDB, reItemData, charCS, {speed:reWeapSpecs.speed,chargeType:reWeapSpecs.chargeType}, MIrowref ).parsed;
			values = MItables.copyValues();
		
//		if (!magicItem.obj) {
//			sendDebug('handleStoreMI: selected magic item speed/type not defined');
//			sendError('Selected Magic Item not fully defined');
//			return;
//		}
		
		var MIspeed = MIdata.speed,
		    MItype = MIdata.chargeType || 'uncharged',
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
		doCheckMods( [tokenID,'Silent','',senderId], senderId, [] );

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
			sendError('Internal attackMaster error');
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
		doCheckMods( [tokenID,'Silent','',senderId], senderId, [] );

		args[2] = -1;
		args[3] = '';
		makeEditBagMenu( args, senderId, 'Slot '+MIrowref+' has been removed' );
		return;
	};
	
	/*
	 * Handle a user selection of who rolls dice for skill and save checks
	 */
	 
	var handleChooseRoller = function( args ) {
		
		var cmd = args[0],
			senderId = args[1],
			whoRolls = args[2],
			playerConfig = getSetPlayerConfig( senderId ),
			args = args.slice(3);
			
		playerConfig.skillRoll = whoRolls;
		getSetPlayerConfig( senderId, playerConfig );
		switch (cmd) {
		case BT.SET_SKILL_ROLL:
			makeRogueCheckMenu( args, senderId );
			break;
		case BT.SET_SAVE_ROLL:
			makeSavingThrowMenu( args, senderId );
			break;
		case BT.SET_ATTR_ROLL:
			makeAttributeCheckMenu( args, senderId );
			break;
		default:
			sendDebug('handleChooseRoller: invalid command '+cmd);
			sendError('Internal attackMaster error');
			break;
		};
	}
	
// ------------------------------------------------------------- Command Action Functions ---------------------------------------------

	/**
	 * Show help message
	 */ 

	var showHelp = function() {
		
		var handoutIDs = getHandoutIDs();
		var content = '&{template:'+fields.menuTemplate+'}{{title=AttackMaster Help}}{{AttackMaster Help=For help on using AttackMaster, and the !attk commands, [**Click Here**]('+fields.journalURL+handoutIDs.AttackMasterHelp+')}}{{Weapons & Armour DB Help=For help on the Weapons, Ammo and Armour databases, [**Click Here**]('+fields.journalURL+handoutIDs.WeaponArmourDatabaseHelp+')}}{{Attacks Database=For help on using and adding Attack Templates and the Attacks Database, [**Click Here**]('+fields.journalURL+handoutIDs.AttacksDatabaseHelp+')}}{{Class Database=For help on using and adding to the Class Database, [**Click Here**]('+fields.journalURL+handoutIDs.ClassRaceDatabaseHelp+')}}{{Character Sheet Setup=For help on setting up character sheets for use with RPGMaster APIs, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterCharSheetSetup+').}}{{RPGMaster Templates=For help using RPGMaster Roll Templates, [**Click Here**]('+fields.journalURL+handoutIDs.RPGMasterLibraryHelp+')}}';
		
		sendFeedback(content,flags.feedbackName,flags.feedbackImg); 
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
						let result = await buildDB( name, dbNames[name], senderId, silent );
					}
				}
				forceIndexUpdate = true;

			};
			apiDBs.attk = true;
			sendAPI('!magic --index-db attk');
			sendAPI('!cmd --index-db attk');
			updateDBindex(forceIndexUpdate);
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
		}
		return;
	}
	
	/*
	 * Display a menu of attack options
	 */
	 
	var doMenu = function(args,senderId,selected) {
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
		
		creatureAttkDefs( charCS );
		
		if (!args[1] && (mAttk = (attrLookup( charCS, fields.Monster_dmg1 ) || '')).length) {
			args[1] = mAttk.split(',');
			args[1] = args[1].length > 1 && reDiceRollSpec.test(args[1][0]) ? args[1][1] : args[1][0];
		}
		if (!args[2] && (mAttk = (attrLookup( charCS, fields.Monster_dmg2 ) || '')).length) {
			args[2] = mAttk.split(',');
			args[2] = args[2].length > 1 && reDiceRollSpec.test(args[2][0]) ? args[2][1] : args[2][0];
		}
		if (!args[3] && (mAttk = (attrLookup( charCS, fields.Monster_dmg3 ) || '')).length) {
			args[3] = mAttk.split(',');
			args[3] = args[3].length > 1 && reDiceRollSpec.test(args[3][0]) ? args[3][1] : args[3][0];
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
			let content = '&{template:'+fields.menuTemplate+'}{{name=Weapon Specification Changed}}'
						+ '{{desc='+getObj('graphic',tokenID).get('name')+'\'s '+weaponName+' has had a modification}}';
			sendResponse( charCS, content, senderId,flags.feedbackName,flags.feedbackImg, tokenID );
		} else {
			sendWait(senderId,0);
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
	 * Check the weapons in-hand against the proficient fighting 
	 * styles
	 */
	 
	var doCheckStyles = function( args, senderId, selected ) {
		
		if (!args) {args = [];}
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doCheckStyles: No token selected');
			sendError('No token selected');
			return;
		}

		var charCS = getCharacter(args[0]);
		
		if (!charCS) {
            sendDebug( 'doCheckStyles: tokenID does not represent a valid character sheet' );
            sendError( 'Invalid token selected' );
            return;
        };

		checkCurrentStyles( charCS, getTable( charCS, fieldGroups.INHAND ) );
	};
	
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
		handleDancingWeapons( args, senderId, selected );
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
		
		weapTable.MAGIC = getTable( charCS, fieldGroups.MAGIC );
		weapTable.MELEE = getTable( charCS, fieldGroups.MELEE );
		weapTable.RANGED = getTable( charCS, fieldGroups.RANGED );
		weapTable.DMG = getTable( charCS, fieldGroups.DMG );
		weapTable.AMMO = getTable( charCS, fieldGroups.AMMO );
		weapTable.INHAND = getTable( charCS, fieldGroups.INHAND );
		weapTable.QUIVER = getTable( charCS, fieldGroups.QUIVER );
		if (!_.isUndefined(fieldGroups.WEAP)) weapTable.WEAP = getTable( charCS, fieldGroups.WEAP );
		
		silent = silent || _.isUndefined(weapTable.INHAND.tableFind( fields.InHand_name, weapon )) || _.isUndefined(weapTable.INHAND.tableFind( fields.InHand_trueName, weapon ));
		
		let inhandRow = weapTable.INHAND.tableFind( fields.InHand_trueName, weapon ) || weapTable.INHAND.tableFind( fields.InHand_name, weapon ),
			itemRow = _.isUndefined(inhandRow) ? undefined : weapTable.INHAND.tableLookup( fields.InHand_index, inhandRow ),
			cmd = resolveData( weapon, fields.MagicItemDB, reItemData, charCS, {off:reWeapSpecs.off}, itemRow ).parsed.off;
			
		silent = silent || _.isUndefined(inhandRow);
		if (!_.isUndefined(inhandRow) && cmd && cmd.length) {
			sendAPI( parseStr(cmd).replace(/@{\s*selected\s*\|\s*token_id\s*}/ig,tokenID)
								  .replace(/@{\s*selected\s*\|\s*character_id\s*}/ig,charCS.id)
								  .replace(/{\s*selected\s*\|/ig,'{'+charCS.get('name')+'|'), senderId, 'attk doBlankWeapon');
		};
		blankWeapon( charCS, weapTable, _.keys(weapTable), weapon );
		
		if (!silent) {
			sendResponse( charCS, '&{template:'+fields.warningTemplate+'}{{name='+charCS.get('name')+'\'s Weapons}}{{desc=The weapon "'+weapon+'" is no longer in-hand.}}', senderId, flags.feedbackName );
		} else {
			sendWait(senderId,0,'attk');
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
	 * Scan the MI bag and Mods table for modifiers to Thac0
	 * or HP and update internal trackers as required. Expire
	 * any Mods that have reached their defined limits (number
	 * of rounds or HP damage taken).
	 */
	 
	async function doCheckMods( args, senderId, selected, silent=false ) {

		try {
			if (!args) args=[];
			
			if (!args[0] && selected && selected.length) {
				args[0] = selected[0]._id;
			}
			
			var tokenID = args[0],
				silentCmd = (args[1] || '').toLowerCase(),
				curToken = getObj('graphic',tokenID),
				charCS = getCharacter( tokenID ), 
				errFlag;
				
			if (!charCS) return false;
			if (!curToken) tokenID = '';
			
			var Mods = getTable( charCS, fieldGroups.MODS ),
				baseThac0 = parseInt(handleGetBaseThac0(charCS)) || 20,
//				fieldIndex = _.isUndefined(state.RPGMaster.tokenFields) ? -1 : state.RPGMaster.tokenFields.indexOf( fields.Thac0_base[0] ),
				currentThac0Field = getTokenValue(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0,fields.Thac0_base),
				currentThac0 = parseInt(currentThac0Field.val) || 20,
				currentThac0Mod = (parseInt(attrLookup( charCS, [fields.Magical_hitAdj[0]+tokenID,fields.Magical_hitAdj[1],fields.Magical_hitAdj[2],fields.Magical_hitAdj[3]])) || 0) + (parseInt(attrLookup( charCS, fields.Legacy_hitAdj )) || 0),
				currentHP = getTokenValue(curToken,fields.Token_HP,fields.HP,fields.HP,fields.Thac0_base).val || 0,
				thac0Mod = 0,
				dmgMod = 0,
				modsInfo = scanForModifiers( tokenID, charCS, '', 'nadj', (attrLookup( charCS, fields.ModPriority ) || 'ac')),
				modValues = modsInfo.acValues,
				modMsgs = modsInfo.msgs;
				
			_.each( modValues, (e,k) => {
				thac0Mod += parseInt(e.data.thac0adj) || 0;
				dmgMod += parseInt(e.data.dmgadj) || 0;
//				log('doCheckMods: found '+e.name+'|'+e.trueName+', with thac0Adj = '+e.data.thac0adj+', so thac0Mod now = '+thac0Mod);
			});
			let newThac0 = (baseThac0 - thac0Mod);
//			log('doCheckMods: baseThac0 = '+handleGetBaseThac0(charCS)+', thac0Mod = '+thac0Mod+', newThac0 = '+newThac0+', currentThac0 = '+currentThac0+', currentMod = '+currentThac0Mod+', attrName = '+currentThac0Field.name+', barName = '+currentThac0Field.barName); 
			if (currentThac0Field.name && currentThac0Field.barName.startsWith('bar')) {
				if ((baseThac0 - currentThac0Mod) === currentThac0) {
					curToken.set((currentThac0Field.barName+'_value'),newThac0);
					curToken.set((currentThac0Field.barName+'_max'),'');
				} else if (newThac0 !== currentThac0) {
					curToken.set((currentThac0Field.barName+'_max'),newThac0);
				} else {
					curToken.set((currentThac0Field.barName+'_max'),'');
				}
			};
			setAttr( charCS, [fields.Magical_hitAdj[0]+tokenID,fields.Magical_hitAdj[1],fields.Magical_hitAdj[2],fields.Magical_hitAdj[3]], thac0Mod );
			setAttr( charCS, [fields.Magical_dmgAdj[0]+tokenID,fields.Magical_dmgAdj[1],fields.Magical_dmgAdj[2],fields.Magical_dmgAdj[3]], dmgMod );

			if ((silentCmd !== 'quiet') && (!silent || newThac0 !== currentThac0)) {
				makeModsDisplay( args, senderId, (baseThac0 - thac0Mod), currentHP, modValues, modMsgs );
			} else {
				sendWait(senderId,0);
			};
			return false;
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
			return true;
		};
		
	};
	
	/*
	 * Scan the MI bag for Armour, Shields and Protective items 
	 * to determine the base AC.  Add any Dex or other bonuses, and 
	 * set the token AC_max as this.  Then look for magical mods
	 * to AC in the Mods table. Then check token effects -
	 * if there are no effects set the AC_current to this, otherwise 
	 * if the two are different turn on the AC bar to indicate difference
	 */
	 
	async function doCheckAC( args, senderId, selected, silent = false ) {
		
		try {
			if (!args) args=[];
			
			if (!args[0] && selected && selected.length) {
				args[0] = selected[0]._id;
			}
			
			var tokenID = args[0],
				silentCmd = args[1] || '',
				dmgType = (args[2] || 'nadj').toLowerCase(),
				noDmgAdj = dmgType == 'nadj',
				curToken = getObj('graphic',tokenID),
				charCS, errFlag;
				
			if (!curToken)
				{throw {name:'AttackMaster error', message:'Invalid token_id provided.'};}
			charCS = getCharacter( tokenID );
			if (!charCS) return false;
			
			if (!['sadj','padj','badj','nadj'].includes(dmgType)) 
				{throw {name:'AttackMaster error', message:'Invalid damage type provided.'};}
			
			var magicItem = ((attrLookup( charCS, fields.Race ) || '').toLowerCase() === 'magic item');
			silent = silent || (silentCmd.toLowerCase().trim() == 'silent');
			senderId = args[3] || senderId;
			
			var armourInfo = scanForModifiers( tokenID, charCS, '', dmgType, (attrLookup( charCS, fields.ModPriority ) || 'ac') ),
				acValues = armourInfo.acValues,
				armourMsgs = armourInfo.msgs,
				dexBonus = !armourInfo.dexFlag ? 0 : parseInt(attrLookup( charCS, fields.Dex_acBonus ) || 0) * -1,
				styleBonus =  parseInt(attrLookup(charCS,fields.Armour_styleMod) || 0),
				baseAC = (parseInt(acValues.armour.data.ac || 10) - parseInt(acValues.armour.data.adj || 0)),
				newAC = isNaN(parseInt(attrLookup( charCS, fields.Armour_normal ))),
				prevAC = parseInt(attrLookup( charCS, fields.Armour_normal ) || 10),
				dmgAdj = {armoured:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0},
						  sless:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0},
						  aless:{adj:0,madj:0,sadj:0,padj:0,badj:0,nadj:0}},
				magicArmour = acValues.armour.magic,
				armouredDexBonus = dexBonus,
				armourlessDexBonus = dexBonus,
				shieldlessDexBonus = dexBonus,
				armourlessAC = 10,
				otherNo = 1,
				is1e = fields.GameVersion === 'AD&D1e',
				ac, currentAC;
				
//			log('doCheckAC: before loop, baseAC = '+baseAC+', newAC = '+newAC+', prevAC = '+prevAC);
				
			_.each( acValues, (e,k) => {
//				log('doCheckAC: assessing '+k+', ac = '+e.data.ac+', adj = '+e.data.adj);
				if (k !== 'armour') {
					dmgAdj.armoured = _.mapObject(dmgAdj.armoured, (d,a) => {return d + parseInt(e.data[a] || 0)});
					armouredDexBonus *= parseFloat(e.data.db || 1);
					if (k === 'shield') {
						dmgAdj.armoured.adj += parseInt(e.data.ac || 1);
					} else {
						dmgAdj.sless = _.mapObject(dmgAdj.sless, (d,a) => {return d + parseInt(e.data[a] || 0)});
						shieldlessDexBonus *= parseFloat(e.data.db || 1);
						dmgAdj.aless = _.mapObject(dmgAdj.aless, (d,a) => {;return d + parseInt(e.data[a] || 0)});
						armourlessDexBonus *= parseFloat(e.data.db || 1);
					};
				}

				if (is1e) {
					switch (k) {
					case 'armour':
					log('doCheckAC: armour is '+e.name);
						setAttr( charCS, fields.Armor_name, e.name );
						setAttr( charCS, [fields.Armor_name[0]+fields.Armor_ac,fields.Armor_name[1]], (e.data.ac || armourlessAC) );
						setAttr( charCS, [fields.Armor_name[0]+fields.Armor_base,fields.Armor_name[1]], (e.data.ar || e.data.ac || armourlessAC) );
						setAttr( charCS, [fields.Armor_name[0]+fields.Armor_magic,fields.Armor_name[1]], (e.data.adj || 0) );
						break;
					case 'shield':
						setAttr( charCS, fields.Armor_shield, e.name );
						setAttr( charCS, [fields.Armor_shield[0]+fields.Armor_ac,fields.Armor_shield[1],'0',true], ('+'+(e.data.ac || 1)) );
						setAttr( charCS, [fields.Armor_shield[0]+fields.Armor_base,fields.Armor_shield[1],'0',true], ('+'+(e.data.ar || e.data.ac || 1)) );
						setAttr( charCS, [fields.Armor_shield[0]+fields.Armor_magic,fields.Armor_shield[1],'0',true], e.data.adj || 0 );
						break;
					case 'helm':
						setAttr( charCS, fields.Armor_helmet, e.name );
						setAttr( charCS, [fields.Armor_helmet[0]+fields.Armor_ac,fields.Armor_helmet[1]], (e.data.ac || 0) );
						setAttr( charCS, [fields.Armor_helmet[0]+fields.Armor_base,fields.Armor_helmet[1]], (e.data.ar || e.data.ac || 0) );
						setAttr( charCS, [fields.Armor_helmet[0]+fields.Armor_magic,fields.Armor_helmet[1]], (e.data.adj || 0) );
						break;
					default:
						let postFix = (otherNo === 1 ? '' : otherNo);
						setAttr( charCS, [fields.Armor_other[0]+postFix,fields.Armor_other[1]], e.name );
						setAttr( charCS, [fields.Armor_other[0]+postFix+fields.Armor_ac,fields.Armor_other[1]], e.data.ac || 0 );
						setAttr( charCS, [fields.Armor_other[0]+postFix+fields.Armor_base,fields.Armor_other[1]], e.data.ar || e.data.ac || 0 );
						setAttr( charCS, [fields.Armor_other[0]+postFix+fields.Armor_magic,fields.Armor_other[1]], e.data.adj || 0 );
						otherNo++;
						break;
					};
				};
			});
			
//			log('doCheckAC: dmgAdj.armoured.adj = '+dmgAdj.armoured.adj+', dmgAdj.armoured['+dmgType+'] = '+dmgAdj.armoured[dmgType]+', baseAC = '+baseAC+'-'+(acValues.armour.data[dmgType] || 0));

			dmgAdj.armoured.adj += dmgAdj.armoured[dmgType];
			dmgAdj.sless.adj += dmgAdj.sless[dmgType];
			baseAC -= parseInt(acValues.armour.data[dmgType] || 0);
			dmgAdj.armoured.madj += parseInt(acValues.armour.data.madj || 0);
			dexBonus = !armourInfo.dexFlag ? 0 : Math.floor(armouredDexBonus * parseFloat(acValues.armour.data.db || 1));
			
			if (dexBonus) {
				acValues.dexBonus = {name:('Dexterity Bonus '+(dexBonus >= 0 ? '+' : '')+dexBonus),specs:['',('Dexterity Bonus '+dexBonus),'Dexterity','0H','Dexterity'],data:{adj:dexBonus}};
			} else if (!armourInfo.dexFlag) {
				armourMsgs.push('Dexterity bonus is blocked by another item');
			}
			if (styleBonus) {
				acValues.styleBonus = {name:('Fighting Style Bonus '+styleBonus),specs:['',('Fighting Style Bonus '+dexBonus),'Style','0H','Style'],data:{adj:styleBonus}};
			}
			setAttr( charCS, fields.BaseAC, (parseInt(acValues.armour.data.ac || 10)) );
			setAttr( charCS, fields.Armour_normal, (baseAC - dmgAdj.armoured.adj - dexBonus - styleBonus) );
			setAttr( charCS, fields.Armour_missile, (baseAC - dmgAdj.armoured.adj - dexBonus - styleBonus - dmgAdj.armoured.madj) );
			setAttr( charCS, fields.Armour_surprised, (baseAC - dmgAdj.armoured.adj) );
			setAttr( charCS, fields.Armour_back, (baseAC - dmgAdj.sless.adj - dmgAdj.sless.madj) );
			setAttr( charCS, fields.Armour_head, (baseAC - dmgAdj.armoured.adj - dexBonus - styleBonus - 4) );
			setAttr( charCS, fields.Shieldless_normal, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - styleBonus) );
			setAttr( charCS, fields.Shieldless_missile, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - styleBonus - dmgAdj.sless.madj) );
			setAttr( charCS, fields.Shieldless_surprised, (baseAC - dmgAdj.sless.adj) );
			setAttr( charCS, fields.Shieldless_back, (baseAC - dmgAdj.sless.adj) );
			setAttr( charCS, fields.Shieldless_head, (baseAC - dmgAdj.sless.adj - shieldlessDexBonus - styleBonus - 4) );
			setAttr( charCS, fields.Armourless_normal, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - styleBonus) );
			setAttr( charCS, fields.Armourless_missile, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - styleBonus - dmgAdj.aless.madj) );
			setAttr( charCS, fields.Armourless_surprised, (armourlessAC - dmgAdj.aless.adj) );
			setAttr( charCS, fields.Armourless_back, (armourlessAC - dmgAdj.aless.adj) );
			setAttr( charCS, fields.Armourless_head, (armourlessAC - dmgAdj.aless.adj - armourlessDexBonus - styleBonus - 4) );
			
			dmgAdj.armoured.sadj += parseInt(acValues.armour.data.sadj || 0);
			dmgAdj.armoured.padj += parseInt(acValues.armour.data.padj || 0);
			dmgAdj.armoured.badj += parseInt(acValues.armour.data.badj || 0);
				
			// set token circles & bars
			
			ac = (baseAC - dmgAdj.armoured.adj - dexBonus - styleBonus);
			currentAC = getTokenValue(curToken,fields.Token_AC,fields.AC,fields.MonsterAC,fields.Thac0_base);
//			log('doCheckAC: baseAC('+baseAC+')-dmgAdj.armoured.adj('+dmgAdj.armoured.adj+')-dexBonus('+dexBonus+')-styleBonus('+styleBonus+') = '+ac);
//			log('doCheckAC: currentAC.val = '+currentAC.val+', newAC = '+newAC+', prevAC = '+prevAC+', so val changed to '+((isNaN(currentAC.val) || newAC) ? ac : (currentAC.val + ac - prevAC)));
			currentAC.val = ((isNaN(currentAC.val) || newAC) ? ac : (currentAC.val + ac - prevAC));
			if (currentAC.barName.startsWith('bar')) {
				if (currentAC.val != ac) {
					curToken.set(currentAC.barName+'_max',ac);
				} else {
					curToken.set(currentAC.barName+'_max','');
				}
				curToken.set(currentAC.barName+'_value',currentAC.val);
			}
			
			setAttr( charCS, fields.StdAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj) );
			setAttr( charCS, fields.SlashAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj) );
			setAttr( charCS, fields.PierceAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj) );
			setAttr( charCS, fields.BludgeonAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj) );
			setAttr( charCS, fields.StdMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.nadj-dmgAdj.armoured.madj) );
			setAttr( charCS, fields.SlashMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.sadj-dmgAdj.armoured.madj) );
			setAttr( charCS, fields.PierceMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.padj-dmgAdj.armoured.madj) );
			setAttr( charCS, fields.BludgeonMissileAC, (ac+dmgAdj.armoured[dmgType]-dmgAdj.armoured.badj-dmgAdj.armoured.madj) );
			
			// set rogue activity percentages
			
			let csVersion = String(attrLookup(charCS,fields.csVersion) || fields.csVersion[2] || 4.17).match(/(\d+)\.?(\d*)/);
			let modTag = (csVersion[1] >= 4 && (!csVersion[2] || csVersion[2] >= 17)) ? fields.Armor_mod_417 : fields.Armor_mod_416;
			
			setAttr( charCS, [fields.Pick_Pockets[0]+modTag,fields.Pick_Pockets[1]], acValues.armour.data.ppa );
			setAttr( charCS, [fields.Open_Locks[0]+modTag,fields.Open_Locks[1]], acValues.armour.data.ola );
			setAttr( charCS, [fields.Find_Traps[0]+modTag,fields.Find_Traps[1]], acValues.armour.data.rta );
			setAttr( charCS, [fields.Move_Silently[0]+modTag,fields.Move_Silently[1]], acValues.armour.data.msa );
			setAttr( charCS, [fields.Hide_in_Shadows[0]+modTag,fields.Hide_in_Shadows[1]], acValues.armour.data.hsa );
			setAttr( charCS, [fields.Detect_Noise[0]+modTag,fields.Detect_Noise[1]], acValues.armour.data.dna );
			setAttr( charCS, [fields.Climb_Walls[0]+modTag,fields.Climb_Walls[1]], acValues.armour.data.cwa );
			setAttr( charCS, [fields.Read_Languages[0]+modTag,fields.Read_Languages[1]], acValues.armour.data.rla );
			setAttr( charCS, [fields.Legend_Lore[0]+modTag,fields.Legend_Lore[1]], acValues.armour.data.iba );
			if (!is1e) {
				setAttr( charCS, fields.Armor_name, (acValues.armour.data.racname || 'No armor'));
				setAttr( charCS, fields.Armor_trueName, (acValues.armour.name || 'No armor'));
			};

			if ((silentCmd !== 'quiet') && (!silent || ((ac != prevAC) && !magicItem))) {
				makeACDisplay( args, senderId, ac, dmgAdj, acValues, armourMsgs );
			} else {
				sendWait(senderId,0,'attk');
			}
			return false;
		} catch (e) {
			sendCatchError('AttackMaster',msg_orig[senderId],e);
			return true;
		};
	};
	
	/*
	 * Handle making a saving throw
	 */
	 
	var doSave = function( args, senderId, selected, attr=false ) {
		
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
		let playerConfig = getSetPlayerConfig( senderId );
		if (!playerConfig || !playerConfig.manualCheckSaves) handleCheckSaves( args, senderId, selected, true );
		if (attr) {
			makeAttributeCheckMenu( args, senderId );
		} else {
			makeSavingThrowMenu( args, senderId );
		}
		return;
	}
	
	/*
	 * Check the saving throw table
	 */
	 
	var doCheckSaves = function( args, senderId, selected ) {
		
		let playerConfig = getSetPlayerConfig(senderId) || {};
		playerConfig.manualCheckSaves = false;
		getSetPlayerConfig(senderId,playerConfig);

		handleCheckSaves( args, senderId, selected );
		sendWait( senderId, 0, 'attk' );
		return;
	}
	
	/*
	 * Handle modification of the saving throw table 
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
			saveType = (args[1] || ''),
			saveField = (args[2] || '').toLowerCase(),
			saveNewVal = (parseInt((args[3] || 0),10) || 0),
			charCS = getCharacter( tokenID ),
			playerConfig = getSetPlayerConfig(senderId) || {},
			name, content = '';
			
		if (!charCS) {
			sendDebug('doModSaves: invalid tokenID passed as args[0]');
			sendError('Invalid attackMaster arguments');
			return;
		}
		
		playerConfig.manualCheckSaves = true;
		getSetPlayerConfig(senderId,playerConfig);

		if (saveField === 'mod' && (saveType === 'All' || saveType === 'Saves' || saveType === 'Attributes')) {
			if (saveType === 'All' || saveType === 'Saves') _.each(saveFormat.Saves, sVal => (sVal.mod ? setAttr( charCS, sVal.mod, (parseInt(attrLookup(charCS,sVal.mod)||0)+saveNewVal) ) : ''));
			if (saveType === 'All' || saveType === 'Attributes') _.each(saveFormat.Attributes, sVal => (sVal.mod ? setAttr( charCS, sVal.mod, (parseInt(attrLookup(charCS,sVal.mod)||0)+saveNewVal) ) : ''));
			content = 'Adjusted all '+(saveType === 'All' ? '' : (saveType === 'Saves' ? 'save' : 'check'))+'modifiers by [['+saveNewVal+']]';
		} else if (saveType && saveFormat.Saves[saveType] && saveFormat.Saves[saveType][saveField]) {
			setAttr( charCS, saveFormat.Saves[saveType][saveField], saveNewVal );
			content = 'Set '+saveType+' save '+(saveField=='mod'?'modifier':'')+' to [['+saveNewVal+']]';
		} else if (saveType && saveFormat.Attributes[saveType] && saveFormat.Attributes[saveType][saveField]) {
			setAttr( charCS, saveFormat.Attributes[saveType][saveField], saveNewVal );
			content = 'Set '+saveType+' check '+(saveField=='mod'?'modifier':'')+' to [['+saveNewVal+']]';
		} else if (saveType && saveFormat.Checks[saveType] && saveFormat.Checks[saveType][saveField]) {
			setAttr( charCS, saveFormat.Checks[saveType][saveField], saveNewVal );
			content = 'Set '+saveType+' check '+(saveField=='mod'?'modifier':'')+' to [['+saveNewVal+']]';
		}
		
		makeModSavesMenu( args, senderId, content );
		return;
	}
	
	/*
	 * Set a temporary mod for a character, e.g. due
	 * to a spell
	 */

	var doSetMod = function( args, selected, senderId, silent=true ) {
		
		var selToken;
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selToken = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doSetMod: no token specified');
			sendError('No token selected');
			return;
		} else if (!getObj('character',args[0]) && selected && selected.length) {
			selToken = selected[0]._id;
		} else {
			selToken = args[0];
		}
		
		var tokenID = args[0],
			cmd = (args[1] || '').toLowerCase(),	// fea=spe
			name = args[2] || '-',					// Fear
			spell = args[3] || '',					// Bless
			spec = parseStr(args[4] || ''),			// svfea:+2
			saves = args[5] || NaN,					//
			rounds = args[6] || NaN,				// 6
			targetCmd = args.slice(7).join('|'),
			silent = (!targetCmd || !targetCmd.length) || targetCmd.toLowerCase() !== 'verbose',			
			curToken = getObj('graphic',tokenID),
			charCS = getCharacter(selToken),
			fieldIndex = _.isUndefined(state.RPGMaster.tokenFields) ? -1 : state.RPGMaster.tokenFields.indexOf( fields.HP[0] ),
			hpField, modRow;
			
//		log('doSetMod: called for '+(!curToken ? 'all tokens' : curToken.get('name')));
			
		if (targetCmd.toLowerCase() === 'verbose') targetCmd = '';
			
		if (silent) sendWait( senderId, 0, 'attk' );
			
		if (!charCS || !cmd) {
			sendError('Invalid AttackMaster command syntax');
			return;
		}
		if (!curToken) {
			tokenID = '';
		} else {
			if (fieldIndex >= 0 && curToken.get('bar'+(fieldIndex+1)+'_link').length) {
				tokenID = '';
			};
		};
//		log('doSetMod: fieldIndex = ' + fieldIndex + ', tokenID = '+tokenID+', bar_link result = '+!!curToken.get('bar'+(fieldIndex+1)+'_link').length);
		
		var Mods = getTable( charCS, fieldGroups.MODS ),
			values = initValues( fieldGroups.MODS.prefix ),
			tokenRows = Mods.tableFindAll( fields.Mods_tokenID, tokenID ),
			type = /(?:sv[a-z0-9]{3}:|save)/i.test(spec) ? 'save' : 
					(spec.toLowerCase().includes('thac0') ? 'thac0' : 
					(spec.toLowerCase().includes('dmg') ? 'dmg' :
					(spec.toLowerCase().includes('hp') ? 'hp' :
					(/(?:ac|\+:)/i.test(spec) ? 'ac' : '')))),
			modType = type,
			saveUpdate = false,
			thac0Update = false,
			dmgUpdate = false,
			acUpdate = false,
			updated = false;
			
		Mods.tableFindAll( fields.Mods_name, name );
			
		if (cmd === 'delall' && (!_.isUndefined(tokenRows))) {
			for (let i=0; i < tokenRows.length; i++) {
				modType = Mods.tableLookup( fields.Mods_modType, tokenRows[i] ) || '';
				if (!modType.length || modType === type) {
					updated = true;
					Mods = Mods.tableSet( fields.Mods_round, tokenRows[i], -1 );
				};
			};
		} else if (cmd === 'delspell' && !_.isUndefined(tokenRows)) {
			for (let i=0; i < tokenRows.length; i++) {
				modType = Mods.tableLookup( fields.Mods_modType, tokenRows[i] ) || '';
				if ((!type.length || !modType.length || modType === type) && Mods.tableLookup( fields.Mods_spellName, tokenRows[i] ) === spell) {
					Mods = Mods.tableSet( fields.Mods_round, tokenRows[i], -1 );
					updated = true;
				};
			};
		} else {
			if (curToken || selToken) {
				if (!curToken) curToken = getObj('graphic',selToken);
			}
			if (!!curToken) {
				hpField = getTokenValue(curToken,fields.Token_HP,fields.HP,fields.HP,fields.Thac0_base);
			}
			if (!_.isUndefined(tokenRows) && tokenRows.length) modRow = tokenRows.find( r => {
//				log('doSetMod: looking for match, row '+r+', name = '+name+', spell = '+spell+', type = '+type+', Mods.name = '+Mods.tableLookup( fields.Mods_name, r )+', Mods.spell = '+Mods.tableLookup( fields.Mods_spellName, r )+', Mod.type = '+(Mods.tableLookup( fields.Mods_modType, r ) || 'save')+', match = '+(Mods.tableLookup( fields.Mods_name, r ) === name && Mods.tableLookup( fields.Mods_spellName, r ) === spell && (!type.length || (Mods.tableLookup( fields.Mods_modType, r ) || 'save') === type)));
				return (Mods.tableLookup( fields.Mods_name, r ) === name && Mods.tableLookup( fields.Mods_spellName, r ) === spell);
			});
//			log('doSetMod: modRow = '+modRow);
			if (_.isUndefined(modRow)) modRow = Mods.tableFind( fields.Mods_name, '-' );
			if (cmd === 'del') {
				modType = type || Mods.tableLookup( fields.Mods_modType, modRow );
				Mods = Mods.tableSet( fields.Mods_round, modRow, -1 );
				updated = true;
			} else {
				let specVals = parseData( '['+spec+']', reModSpecs ),
					hpChange = (parseInt(specVals.hpadj) || 0) + (parseInt(specVals.hptemp) || 0) + (parseInt(specVals.hpperm) || 0);
				if (hpChange) {
//					log('doSetMod: is an hpChange');
					if (!!tokenID && tokenID.length && hpField && hpField.name && hpField.barName.startsWith('bar')) {
						curToken.set(hpField.barName+'_value',(hpField.val + hpChange));
					} else {
						setAttr( charCS, fields.HP, ((parseInt(attrLookup( charCS, fields.HP )) || 0) + hpChange ));
					}
				}

				if (cmd === 'mod' && !_.isUndefined(modRow) && Mods.tableLookup( fields.Mods_name, modRow ) !== '-') {
// For Scintillating Robe effects					
					let existingVals = parseData( '['+Mods.tableLookup( fields.Mods_saveSpec, modRow )+']', reModSpecs ),
						newVals = {};
					_.each( reModSpecs, mod => {
						if (mod.field === 'name' || mod.field === 'rules' || !evalAttr(specVals[mod.field])) return;
						existingVals[mod.field] = String(evalAttr('(' + existingVals[mod.field] + (isNaN(specVals[mod.field][0]) ? '' : '+') + specVals[mod.field] + ')'));
						updated = true;
					});
					Mods.tableSet( fields.Mods_saveSpec, modRow, _.chain(existingVals).omit(v => !v || v == 0).pairs().map(v => reModSpecs[v[0]].tag+':'+v[1]).value().join(',') );
				} else {
					values[fields.Mods_name[0]][fields.Mods_name[1]] = name;
					values[fields.Mods_tokenID[0]][fields.Mods_tokenID[1]] = tokenID;
					values[fields.Mods_modType[0]][fields.Mods_modType[1]] = type;
					values[fields.Mods_spellName[0]][fields.Mods_spellName[1]] = spell;
					values[fields.Mods_saveSpec[0]][fields.Mods_saveSpec[1]] = spec;
					values[fields.Mods_modCount[0]][fields.Mods_modCount[1]] = parseInt(saves) || '';
					values[fields.Mods_modCount[0]][fields.Mods_baseCount[1]] = (specVals.hptemp != 0) ? 0 : (parseInt(hpField.val) || 0);
					values[fields.Mods_round[0]][fields.Mods_round[1]] = Number.isNaN(rounds) ? '' : (state.initMaster.round + parseInt(rounds));
					values[fields.Mods_curRound[0]][fields.Mods_curRound[1]] = Number.isNaN(rounds) ? '' : state.initMaster.round;
					values[fields.Mods_basis[0]][fields.Mods_basis[1]] = '';
					values[fields.Mods_cmd[0]][fields.Mods_cmd[1]] = targetCmd;
					if (cmd.includes('=')) {
						cmd = cmd.split('=');
						let basis = _.find(saveFormat.Saves, f => f.tag === cmd[1]);
						if (basis) {
							values[fields.Mods_basis[0]][fields.Mods_basis[1]] = cmd[1];
							values[fields.Mods_tag[0]][fields.Mods_tag[1]] = cmd[0];
							values[fields.Mods_modField[0]][fields.Mods_modField[1]] = cmd[0]+'mod';
							values[fields.Mods_saveField[0]][fields.Mods_saveField[1]] = basis.save[0];
							values[fields.Mods_index[0]][fields.Mods_index[1]] = basis.index;
							values[fields.Mods_roll[0]][fields.Mods_roll[1]] = basis.roll;
						}
					}
					Mods = Mods.addTableRow( modRow, values );
//					log('doSetMod: character '+(charCS.get('name'))+' adding values to row '+modRow+', name = '+Mods.tableLookup( fields.Mods_name, modRow )+', spec = '+Mods.tableLookup( fields.Mods_saveSpec, modRow )+', cmd = '+Mods.tableLookup( fields.Mods_cmd, modRow ));
				};
				saveUpdate = /(?:sv[a-z0-9]{3}:|save)/i.test(spec);
				thac0Update = spec.toLowerCase().includes('thac0');
				dmgUpdate = spec.toLowerCase().includes('dmg');
				acUpdate = /(?:ac|\+):/i.test(spec);
			};
		}
		let playerConfig = getSetPlayerConfig( senderId );
		if ((updated || saveUpdate) && (!playerConfig || !playerConfig.manualCheckSaves)) handleCheckSaves( [selToken,'','nomenu'], senderId, selected, (silent || modType !== 'save') );
//		log('doSetMod: done handleCheckSaves');
		if (updated || acUpdate) doCheckAC( [selToken,((silent || modType !== 'ac')?'quiet':'')], senderId, [] );
//		log('doSetMod: done doCheckAC');
		if (updated || thac0Update || dmgUpdate) doCheckMods( [selToken,((silent || modType === 'save' || modType === 'ac')?'quiet':'')], senderId, [] );
//		log('doSetMod: done doCheckMods');
//		log('doSetMod: completed for '+(!curToken ? 'all tokens' : curToken.get('name')));

		return;
	};
	
	/*
	 * Switch priority for scanning items between AC, Thac0 & HP
	 * bonuses being considered the best.
	 */
	 
	var doSwitchBestBonus = function( args, selected, senderId ) {
		
		log('doSwitchBestBonus: initial args = '+args+', setSelected = '+setSelected(args,selected));
		args = setSelected(args,selected);
		
		var tokenID = args[0],
			bestMod = (args[1] || 'ac').toLowerCase(),
			dispMenu = (args[2] || '').toLowerCase(),
			charCS = getCharacter(tokenID);
			
		if (!charCS) {
			sendError('Invalid token selected');
			return;
		}
		if (!['ac','thac0','dmg','hp'].includes(bestMod)) {
			sendError('Invalid best mod specified. Must be one of "ac", "thac0", "dmg" or "hp"');
			return;
		}
		setAttr( charCS, fields.ModPriority, bestMod );
		doCheckAC( [tokenID,''], senderId, [], dispMenu !== 'checkac' );
		doCheckMods( [tokenID,''], senderId, [], dispMenu !== 'checkmods' );
		return;
	};
	
	/*
	 * Increment or decrement the number of saves completed
	 * with save mods from the SaveMod table
	 */
	 
	var doIncDecSaveModCount = function( args, selected, senderId ) {
		
		if (!(args = setSelected(args,selected))) return;
		
		sendWait( senderId, 0, 'attk' );
		
		var tokenID = args[0],
			change = parseInt(args[1]) || 0,
			charCS = getCharacter( tokenID ),
			name;
			
		if (!charCS) {
			sendError('Invalid AttackMaster command syntax');
			return;
		}
		var SaveMods = getTableField( charCS, {}, fields.Mods_table, fields.Mods_name ),
			SaveMods = getTableField( charCS, SaveMods, fields.Mods_table, fields.Mods_modCount );
		
		for (let modRow = SaveMods.table[1]; !_.isUndefined( name = SaveMods.tableLookup( fields.Mods_name, modRow, false )); modRow++) {
			let saveCount = SaveMods.tableLookup( fields.Mods_modCount, modRow );
			if (name === '-' || name === '' || saveCount === '' || Number.isNaN(parseInt(saveCount))) continue;
			SaveMods = SaveMods.tableSet( fields.Mods_modCount, modRow, ((parseInt(saveCount) || 0) + change) );
		}
		return;
	}
		
	/*
	 * Make a saving throw macro on the character sheet with
	 * a custom save target.
	 */
	 
	var doBuildCustomSave = function( args, senderId, selected, isGM ) {

		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doBuildCustomSaves: no token specified');
			sendError('No token selected');
			return;
		}
		
		var tokenID = args[0],
			saveType = (args[1] || 'Spell').dbName(),
			saveVal = args[2] || 20,
			targetArgs = args.slice(5).join('|'),
			charCS = getCharacter( tokenID ),
			playerConfig = getSetPlayerConfig( senderId ),
			whoRolls = ((!_.isUndefined(playerConfig.skillRoll)) ? playerConfig.skillRoll : SkillRoll.PCROLLS);
			
		saveType = saveType[0].toUpperCase() + saveType.slice(1);
		
		if (!charCS) {
			sendDebug('doBuildCustomSave: invalid tokenID passed as args[0]');
			sendError('Invalid attackMaster arguments');
			return;
		}
		if (!saveFormat.Saves[saveType] || !parseInt(saveVal)) {
			sendDebug('doBuildCustomSave: invalid save specs');
			sendError('Invalid attackMaster arguments');
			return;
		}
		target = targetArgs.length ? (fields.roundMaster + ' --target caster|'+tokenID+'|'+saveType+'|'+targetArgs) : '';
		
		buildSaveRoll( tokenID, charCS, 0, null, saveType, saveVal, isGM, whoRRolls, false, target );
		sendWait( senderId, 0, 'attk' );
	};
	
	/*
	 * Handle making a rogue skills check
	 */
	 
	var doThieving = function( args, senderId, selected, doCheck='check' ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doThieving: no token specified');
			sendError('No token selected');
			return;
		}
		var tokenID = args[0],
			charCS = getCharacter( tokenID ),
			playerConfig = getSetPlayerConfig( senderId ) || {};
			
		if (!charCS) {
			sendDebug('doThieving: invalid tokenID passed as args[0]');
			sendError('Invalid token selected');
			return;
		}
		if (['manual','auto'].includes(doCheck)) {
			playerConfig.manualCheckSkills = (doCheck !== 'auto');
			getSetPlayerConfig(senderId,playerConfig);
			makeModRogueSkillsMenu( args, senderId );
		} else {
			makeRogueCheckMenu( args, senderId );
		};
		return;
	}
	
	/*
	 * Modify a rogue skill factor
	 */
	 
	var doModThievingSkill = function( args, senderId ) {
		
		var tokenID = args[0],
			skill = args[1] || '',
			type = args[2] || '',
			field = args[3],
			val = args[4],
			charCS = getCharacter(tokenID),
			skillObj = rogueSkills[skill.dbName()],
			modObj, msg;
			
		if (!charCS) {
			sendDebug('doThieving: invalid tokenID passed as args[0]');
			sendError('Invalid token selected');
			return;
		}
		if (_.isUndefined(skillObj)) {
			sendDebug('doModThievingSkill: invalid skill name "'+skill+'" passed as args[1]');
			sendError('Invalid rogue skill name');
			return;
		}
		if (!skillObj.factors.includes(field.toLowerCase())) {
			sendDebug('doModThievingSkill: invalid field name "'+field+'" passed as args[3]');
			sendError('Invalid field name');
			return;
		}
		setAttr( charCS, [field,'current','',true], val );
		makeModRogueSkillsMenu( args, senderId, ('Set '+skill.dispName()+' '+type+' mod to '+val) );
	};
	
	/*
	 * Display a menu to change the number of hands.  If the 'hands' 
	 * value has a '+' or '-' change the number by the value.  Min is 0
	 */
	 
	var doChangeNoHands = function( args, senderId, selected ) {
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
			sendDebug('doChangeNoHands: no token specified');
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

		makeChangeWeaponMenu( ['',tokenID], senderId );
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
			sendResponse( toChar, '&{template:'+fields.messageTemplate+'}{{name=Working Together}}{{desc='+getObj('graphic',fromID).get('name')+' has lent '+noHands+' hand(s) to you so you can work together}}', null,flags.feedbackName,flags.feedbackImg, toID );
			sendResponse( fromChar, '&{template:'+fields.messageTemplate+'}{{name=Working Together}}{{desc=you have lent '+noHands+' hand(s) to '+getObj('graphic',toID).get('name')+' so you can work together}}', senderId,flags.feedbackName,flags.feedbackImg, fromID );
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
						hand = (i==0) ? BT.RIGHT : (i==1 ? BT.LEFT : (i==2 ? BT.BOTH : BT.HAND));
						handleChangeWeapon( [hand,toID,'-',i], senderId, true );
					}
				}
			}
			sendResponse( toChar, '&{template:'+fields.messageTemplate+'}{{name=Working Together}}'
								 +'{{desc='+getObj('graphic',fromID).get('name')+' is no longer lending you their hands'
								 +(droppedWeapons.length ? (', and you have had to drop '+droppedWeapons.join(', ')) : '')+'}}', null,flags.feedbackName,flags.feedbackImg, toID );
			sendResponse( fromChar, '&{template:'+fields.messageTemplate+'}{{name=Working Together}}{{desc=You are no longer lending hand(s) to '+getObj('graphic',toID).get('name')
									+'}}',senderId,flags.feedbackName,flags.feedbackImg,fromID);
		}
		if (noHands == 0) sendWait( senderId, 0, 'attk' );
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
		switch (attkType.toUpperCase()) {
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
		} else {
			sendWait( senderId, 0, 'attk' );
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
		
		switch (flag.toLowerCase()) {
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
			
		case 'weap-plus':
			state.attackMaster.weapRules.initPlus = value;
			msg = value ? 'Weapon magical adjustment alters weapon speed' : 'Weapon speed not affected by magical adjustment';
			break;
			
		case 'criticals':
			state.attackMaster.weapRules.criticals = value;
			msg = value ? 'Force hit/miss on critical hit/fumble roll' : 'Hit success only depends on roll value';
			break;
			
		case 'naturals':
			state.attackMaster.weapRules.naturals = value;
			msg = value ? 'Force hit/miss on natural max/min roll' : 'Hit success only depends on roll value. Ignore naturals';
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
			
		case 'rogue-crit':
			state.attackMaster.thieveCrit = (value ? 1 : 0);
			break;
			
		case 'rogue-crit-val':
			state.attackMaster.thieveCrit = (value ? 5 : 1);
			break;
			
		case 'attr-roll':
			state.attackMaster.attrRoll = value;
			break;
			
		case 'attr-restrict':
			state.attackMaster.attrRestrict = value;
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
        content = '&{template:'+fields.messageTemplate+'}{{name='+playerName+'\'s RPGMaster options}}';

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
		sendAPI( content, senderId, '', true );
		return;
	}

	/*
	 * Handle a button press, and redirect to the correct handler
	 */

	var doButton = function( args, isGM, senderId, selected ) {
		if (!args)
			{return;}

		if (args.length < 1) {
			sendDebug('doButton: Invalid number of arguments');
			sendError('Invalid attackMaster syntax');
			return;
		};

		var	handler = args[0];
			
		switch (handler.toUpperCase()) {
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
			
		case BT.LEFT_NOCURSE :
		case BT.RIGHT_NOCURSE :
		case BT.BOTH_NOCURSE :
		case BT.HAND_NOCURSE :
		
			handleChangeWeapon( args, senderId, false, true );
			break;
			
		case BT.CS_LEFT :
		case BT.CS_RIGHT :
		case BT.CS_BOTH :
		case BT.CS_HAND :
		
			handleCSchangeWeapon( args, senderId );
			break;
			
		case BT.LEFTRING :
		case BT.RIGHTRING :
		case BT.LEFTRING_NOCURSE :
		case BT.RIGHTRING_NOCURSE :
		
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
			
		case BT.CHECK_SAVES:
			args.shift();
			doCheckSaves(args, senderId, selected);
			break;
			
		case BT.ATTR_CHECK :
			args.shift();
			makeAttributeCheckMenu( args, senderId );
			break;
			
		case BT.SET_SKILL_ROLL :
		case BT.SET_SAVE_ROLL :
		case BT.SET_ATTR_ROLL :
			handleChooseRoller( args );
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
			t = 2;
			
		msg_orig[senderId] = msg;
			
		var doAttkCmd = function(e,selected,senderId,isGM) {
			
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			try {
				if (!sendGMquery( 'attk', arg, senderId )) {

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
				
					switch (cmd.toLowerCase()) {
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
					case 'check-saves':
						doCheckSaves(arg, senderId, selected);
						break;
					case 'checkmods':
					case 'check-mods':
						doCheckMods(arg, senderId, selected, false);
						break;
					case 'twoswords':
						doMultiSwords(arg,senderId,selected);
						break;
					case 'weapon':
						doChangeWeapon(arg,senderId,selected);
						break;
					case 'check-styles':
					case 'checkstyles':
						doCheckStyles(arg,senderId,selected);
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
					case 'attr-check':
						doSave(arg,senderId,selected,true);
						break;
					case 'setsaves':
						doModSaves(arg,senderId,selected);
						break;
					case 'build-save':
						doBuildCustomSave(arg,senderId,selected,isGM);
						break;
					case 'set-acmod':
					case 'set-savemod':
					case 'set-thac0mod':
					case 'set-hpmod':
					case 'set-mods':
						doSetMod(arg,selected,senderId);
						break;
					case 'set-mod-priority':
						doSwitchBestBonus( arg, selected, senderId );
						break;
					case 'savemod-count':
						doIncDecSaveModCount(arg,selected,senderId);
						break;
					case 'thieve':
						doThieving(arg,senderId,selected);
						break;
					case 'check-thieving':
						doThieving(arg,senderId,selected,'auto');
						break;
					case 'set-thieving':
						doThieving(arg,senderId,selected,'manual');
						break;
					case 'set-rogue-skill':
						doModThievingSkill(arg,senderId);
						break;
					case 'menu':
						doMenu(arg,senderId,selected);
						break;
					case 'other-menu':
						doOtherMenu(arg,senderId,selected);
						break;
					case 'update-db':
					case 'extract-db':
						doUpdateDB(arg,senderId,false);
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
						if (isGM) checkACvars(true,senderId);
						break;
					case 'set-attk-type':
						doSetAttkType(arg,senderId);
						break;
					case 'update-effects':
						if (isGM) updateHitDmgBonus(arg);
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
						doButton(arg,isGM,senderId,selected);
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
				}
			} catch (err) {
				sendCatchError('AttackMaster',msg_orig[senderId],err,('!attk --'+e));
			}
		};
		
			
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

//		log('attk chat: called, cmd = '+args);
			
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
		if (!flags.noWaitMsg) sendWait(senderId,50,'attkMaster');
		
		_.each(args, function(e) {
			setTimeout( doAttkCmd, (1*t++), e, selected, senderId, isGM );
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
		sendAPI( cmd, null, 'attk cmdMasterRegister' );
		return;
	};
	
	var handleNewToken = function(obj,prev) {
		
		try {
			if (!obj)
				{return;}
				
			if (obj.get('name') == prev['name'])
				{return;}
				
			if (obj.get('_subtype') == 'token' && !obj.get('isdrawing')) {
				let charCS = getCharacter(obj.id);
				if (charCS) {
					let race = attrLookup( charCS, fields.Race );
					let classObjs = classObjects( charCS );
					let defClass = (classObjs.length == 1 && classObjs[0].name == 'creature' && classObjs[0].level == 0);
					if ((race && race.length) || !defClass) {
						doCheckAC( [obj.id], findTheGM(), [], true );
						doCheckMods( [obj.id], findTheGM(), [], true );
					}
				}
			}
		} catch (e) {
			log('AttackMaster handleNewToken: JavaScript '+e.name+': '+e.message+' while dropping a new token');
			sendDebug('AttackMaster handleNewToken: JavaScript '+e.name+': '+e.message+' while dropping a new token');
			sendCatchError('AttackMaster',null,e,'AttackMaster handleNewToken()');
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

{try{throw new Error('');}catch(e){API_Meta.AttackMaster.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.AttackMaster.offset);}}
