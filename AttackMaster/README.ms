<h1>Attack Master API</h1>
<p>AttackMaster API provides functions to manage weapons, armour & shields, including taking weapons in hand and using them to attack.  It uses standard AD&D 2e rules to the full extent, taking into account: ranged weapon ammo management with ranges varying appropriately and range penalties/bonuses applied; Strength & Dexterity bonuses where appropriate; any magic bonuses to attacks that are in effect (if used with <b>RoundMaster API</b> effects); penalties & bonuses for non-proficiency, proficiency, specialisation & mastery; penalties for non-Rangers attacking with two weapons; use of 1-handed, 2-handed or many-handed weapons and restrictions on the number of weapons & shields that can be held at the same time; plus many other features.  This API works best with the databases provided with this API, which hold the data for automatic definition of weapons and armour.  However, some attack commands will generally work with manual entry of weapons onto the character sheet.  The <b>CommandMaster API</b> can be used by the GM to easily manage weapon proficiencies.</p>
<p>Specification for weapons, armour & shields are implemented as ability macros in specific database character sheets.  This API comes with a wide selection of weapon and armour macros, held in databases that are created and updated automatically when the API is run.  If the <b>MagicMaster API</b> is also loaded, it provides many more specifications for standard and magic items that are beneficial to melee actions and armour class.  The GM can add to the provided items in the databases using standard Roll20 Character Sheet editing, following the instructions provided in the relevant Database Help handout.</p>
<p><b><u>Note:</u></b> For some aspects of the APIs to work, the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs: <b>RoundMaster, InitiativeMaster, MagicMaster and CommandMaster</b>.  This will provide the most immersive game-support environment</p>
<h2>Syntax of AttackMaster calls</h2>
<p>The AttackMaster API is called using !attk.</p>
<pre>!attk --help</pre>
<p>Commands to be sent to the AttackMaster API must be preceded by two hyphens <b>‘--’</b> as above for the <b>--help</b> command.  Parameters to these commands are separated by vertical bars ‘|’, for example:</p>
<pre>!attk --attk-hit token_id | [message] | [monster weap1] | [monster weap2] | [monster weap3]</pre>
<p>If optional parameters are not to be included, but subsequent parameters are needed, use two vertical bars together with nothing between them, e.g.</p>
<pre>!attk --checkac token_id || [SADJ / PADJ / BADJ]</pre>
<p>Commands can be stacked in the call, for example:</p>
<pre>!attk --checkac token_id | [ SILENT ] | [SADJ / PADJ / BADJ] –weapon token_id</pre>
<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash ‘/’, meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash ‘/’ is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>
<br>
<h2>Using Character Sheet Ability/Action buttons</h2>
<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>
<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: <b>--menu</b> and <b>--other-menu</b>.  From these, most other commands can be accessed.  If using the <b>CommandMaster API</b>, its character sheet setup functions can be used to add the necessary Ability Macros and Token Action Buttons to any Character Sheet.</p>
<br>
<h2>Command Index</h2>
<h3>1. Menus</h3>
<pre>--menu [token_id]<br>
--other-menu [token_id]</pre>
<h3>2. Attacking commands</h3>
<pre>--attk-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>
--attk-roll [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>
--attk-target [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>
--twoswords [token_id]|[prime-weapon]</pre>
<h3>3. Weapon Management</h3>
<pre>--weapon [token_id]<br>
--dance [token_id] | weapon  | [ STOP ]<br>
--mod-weapon [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>
--quiet-modweap [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>
--edit-weapons [token_id]</pre>
<h3>4. Ammunition Management</h3>
<pre>--ammo [token_id]<br>
--setammo [token_id] | ammo_name | [ [+/-]cur_qty / = ] | [ [+/-]max_qty / = ] | [ SILENT ]</pre>
<h3>5. Armour Class and Saving Throws</h3>
<pre>--edit-armour [token_id]<br>
--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]<br>
--save [token_id] | [situation-mod]</pre>
<h3>6. Other Commands</h3>
<pre>--help<br>
--check-db [ db-name ]<br>
--handshake from | [cmd]<br>
--hsq from | [cmd]<br>
--hsr from | [cmd] | [TRUE/FALSE]<br>
--debug [ ON / OFF ]</pre>
<h3>7. How To Use AttackMaster</h3>
<pre>Specifying a token<br>
Who can make AttackMaster API command calls<br>
Weapons that can be used<br>
Allocating weapons to a Character<br>
Selecting weapons to attack with<br>
Making attacks<br>
Ammunition<br>
Ranged weapon and ammunition ranges<br>
Dancing weapons<br>
Armour Class management<br>
Saves</pre>
<br>
<h2>Command details</h2>
<h2>1. Menus</h2>
<h3>1.1 Display a menu to do actions relating to attacks</h3>
<pre>--menu [token_id]</pre>
<p>Takes an optional token ID – if not specified uses selected token</p>
<p>Displays a Chat menu with buttons for: Attacking, with either Roll20 rolling a dice, or the Player entering a dice roll result; changing what is in the Character’s (or NPC’s) hands; to recover spent ammo; and to check the current Armour Class for the Character under various circumstances.  If the GM uses the menu, an additional button for a Targeted Hit appears, which allows the GM to select both the attacker and the target and get full specs on the hit and damage done, and the AC & current hit Points of the target.</p>
<h3>1.2 Display a menu of other actions</h3>
<pre>--other-menu [token_id]</pre>
<p>Takes an optional token ID – if not specified uses selected token</p>
<p>Displays a Chat menu with buttons for: saving throws and saving throw management; and managing light sources for the character’s token (if Dynamic Lighting is being used) (requires <b>MagicMaster API</b> to work).  If the GM uses the menu, two further options appear: mark the token selected as Dead (which also marks the body as an inanimate object that can be looted); and the ability to adjust damage for the selected token for any arbitrary reason, which can also be noted.</p>
<h2>2. Attacking Commands</h2>
<h3>2.1 Attack an opponent with a weapon</h3>
<pre>--attk-hit [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>
--attk-roll [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]<br>
--attk-target [token_id] | [message] | [monster weap1] | [monster weap2] | [monster weap3]</pre>
<p>Each takes an optional token ID (if not specified uses selected token), an optional formatted message to include with the attack damage, and up to three optional names for each of the monster attacks that are displayed on the attack menu.</p>
<p>Each of these three commands present a menu of currently possible attacks, using the weapons and ammo in-hand or, for monsters using the Monster tab on the AD&D 2e Character Sheet, up to 3 types of monster attacks.  Ranged weapon attacks will prompt the Player to specify which range to fire at. Selecting one of the possible attacks has different outcomes based on the command used:</p>
<dl><dt>--attk-hit</dt><dd>prompts Roll20 to make an attack roll, using 3D dice if they are enabled, displays the AC hit with supporting information on how this was calculated and displays buttons to roll for damage if the attack is successful.</dd>
<dt>--attk-roll</dt><dd>displays an entry field to allow the Player to enter the value of their own dice roll (for those that prefer to roll their own dice) though the default entry will also roll the dice for the player.  Subsequently, the process is the same as --attk-hit.</dd>
<dt>--attk-target</dt><dd>is only available to the GM.  It asks the GM to select a target token for the attack.  It then displays the AC the attack roll will hit and the AC of the selected target.  It also automatically rolls damage for Small/Medium and Large targets, and displays the current Hit Points for the targeted token.</dd></dl>
<p>The optional message is displayed as part of the display of the damage done on a successful hit.  If a monster, the message can be three concatenated messages separated by ‘$$’.  The message can include API Buttons if needed.  The following characters must be replaced (escaped) using these replacements:</p>
<table>
	<tr><th scope="row">Character</th><td>?</td><td>[</td><td>]</td><td>@</td><td>-</td><td>|</td><td>:</td><td>&</td><td>{</td><td>}</td></tr>
	<tr><th scope="row">Substitute</th><td>^</td><td>&lt;&lt;</td><td>&gt;&gt;</td><td>`</td><td>~</td><td>¦</td><td> </td><td>&amp;amp;</td><td>&amp;#123;</td><td>&amp;#125;</td></tr>
	<tr><th scope="row">Alternative</th><td>\\ques</td><td>\\lbrak</td><td>\\rbrak</td><td>\\at</td><td>\\dash</td><td>\\vbar</td><td>\\clon</td><td>\\amp</td><td>\\lbrc</td><td>\\rbrc</td></tr>
</table>
<br>
<h3>2.2 Use two weapons to attack</h3>
<pre>--twoswords [token_id]|[prime-weapon]</pre>
<p>Takes an optional token ID (if not specified uses selected token) and an optional weapon name.</p>
<p>This command sets the system up to apply the correct penalties / bonuses when using two weapons to attack.  Under AD&D 2e rules, only types of Fighter & Rogue can use 2 weapons at a time to attack in a round, and only Rangers do so without penalty.  Using this command with the name of a <i>prime-weapon</i> specified will mark that weapon as the Primary which will get the smaller penalty of the two and will also be allowed multiple attacks per round (if using <b>InitiativeMaster API</b>).  Use of any other weapon during the current or subsequent rounds will incur a larger penalty and be restricted to one attack per round regardless of type of weapon, level & proficiency.  Penalties are adjusted by the Dexterity Reaction Adjustment.  See AD&D 2e PHB p96 for full explanation of rules applied.</p>
<p>Calling this command without a prime-weapon specified will terminate two-weapon mode and no penalties will be applied for the current and subsequent rounds.</p>
<br>
<h2>3. Weapon Management</h2>
<h3>3.1 Change weapons currently in hand</h3>
<pre>--weapon [token_id]</pre>
<p>Takes an optional token ID – if not specified uses selected token.</p>
<p>This command displays a chat menu displaying what is currently in the Character’s (or NPC or creature’s) hands, and allowing the Player to change what is held to any weapon or shield that they have in their backpack.  Subsequent attacks will then use the newly specified weapon(s).  Selecting a ranged weapon that uses ammunition, the appropriate ammunition held in their backpack is also loaded into the character’s “quiver”.</p>
<p>Selecting a hand (either Left or Right) will display any 1-handed weapons that can be used for selection in a list.  Selecting the Both Hands button will display all the 2-handed weapons (including bows) that can be used for selection in a list.  Some weapons can be used either 1-handed or 2-handed, and the appropriate stats will be given based on the selection made.</p>
<p>If being used by the GM, the menu also has an option to change the number of hands the creature has, which will then allow the creature to hold (and attack with) more than two items, or to hold items that require more than two hands.</p>
<p><b>Note:</b> this function is dependent on the weapon and shield definitions including certain key information in a specified format: see section 8 below.</p>
<h3>3.2 Manage a dancing weapon</h3>
<pre>--dance [token_id] | weapon  | [ STOP ]</pre>
<p>Takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and an optional STOP command.</p>
<p>This command marks the named weapon as “dancing” which means it will no longer occupy a hand, but will still appear in the list of possible attacks when an attack is made.  When started, the --weapon command is automatically run so that an additional weapon can be taken in the freed-up hand.</p>
<p>Appending the “STOP” command will un-mark the weapon as dancing.  The Player will have to take the no-longer dancing weapon back in hand, if they so desire, using the --weapon command.</p>
<p><b>Note:</b> the most effective use of the --dance command is when combined with the RoundMaster effect management system, to count down rounds of use, automatically call the --dance command at the appropriate time, and stop the dancing automatically after the appropriate duration.</p>
<h3>3.3 Manage weapon statistics</h3>
<pre>--mod-weapon [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments<br>
--quiet-modweap [token_id] | weapon | MELEE / RANGED / DMG / AMMO | adjustments</pre>
<p>Each command takes an optional token ID (if not specified uses selected token), a mandatory weapon name, and a mandatory data type.</p>
<p>These commands allow the specifications of any weapon currently in-hand to be adjusted programmatically.  E.g. the magical plus on to-hit and damage can be adjusted round by round (as for a Sword of Dancing.  The type of data to be adjusted must be identified using the data type parameter: MELEE & RANGED alter To-Hit data, and DMG & AMMO alter Damage.</p>
<p>The weapon parameter can name a specific weapon name, a type of weapon (e.g. bow, long-blade, club etc), a changed weapon name (previously changed by this command), or even ‘all’ for all currently held weapons.  All data of the specified data type for all weapons that match the weapon parameter may then be altered, using the comma-separated adjustments parameter.  Each adjustment is of the format <i><pre>field_id:[=][+/-]value</pre></i> where the field_ids are:</p>
<table><tr><td>w:</td><td>weapon name</td><td>t:</td><td>weapon type</td><td>st:</td><td>weapon super-type</td></tr>
<tr><td>sb:</td><td>strength bonus</td><td>db:</td><td>dexterity bonus</td><td>+:</td><td>magical plus</td></tr>
<tr><td>n:</td><td>number of attacks per round</td><td>pl:</td><td>proficiency level</td><td>pd:</td><td>dancing proficiency level</td></tr>
<tr><td>ch:</td><td>critical hit roll</td><td>cm:</td><td>critical miss roll</td><td>sz:</td><td>size</td></tr>
<tr><td>r:</td><td>range (can be #/#/#)</td><td>ty:</td><td>damage type</td><td>sp:</td><td>speed in segments</td></tr>
<tr><td>sm:</td><td>damage vs small & medium</td><td>l:</td><td>damage vs large</td></tr></table>
<br>
<p>Numeric values can be preceeded by + or -, which will adjust rather than replace the current value.  To set a value as negative, precede the minus by an equals thus =-value.  For attributes that are relevant to multiple data types, only the specified data type will be adjusted.  Multiple attributes can be adjusted using one command call by concatenating comma-delimited adjustments. E.g. </p>
<pre>--mod-weap @{selected|token_id}|Sword-of-Dancing|MELEE|sb:0,+:+1,sp:-1</pre>
<p>If the weapon is not found, the GM receives an error message, but no other issues occur.</p>
<h3>3.4 Adding & removing weapons and ammunition</h3>
<pre>--edit-weapons [token_id]</pre>
<p>Takes an optional token ID – if not specified uses selected token.</p>
<p>The very best way for the Character, NPC or creature to acquire weapons (or any other items including magic items) is to use the <b>MagicMaster API</b> and its commands and databases.  However, AttackMaster provides a small subset of those facilities to allow the DM and/or Players to add weapons, ammo & armour to their Character Sheet item bags.  Once added, these items can be taken ‘in-hand’ by the Character (using the <b>--weapon</b> command) and then used to attack.</p>
<p>The advantage of doing this over just typing the item names into the Character Sheet tables is that the items are assured to exist in the weapon, ammo & armour databases that come with the API and so all other aspects of the API will work properly.</p>
<p>This command and <b>--edit-armour</b> are identical, and call the same menu.</p>
<br>
<h2>4. Ammunition Management</h2>
<h3>4.1 Ammunition recovery</h3>
<pre>--ammo [token_id]</pre>
<p>Takes an optional token ID – if not specified uses selected token.</p>
<p>This command displays a chat menu of ammunition that the Character has on their person (not just the ammo that they have in their quiver or in-hand) including any ammunition that has run-out but might still be recoverable.  The Player can ask the DM if they can retrieve any ammunition of the types displayed that they have recently used and, once the DM responds with the amount recovered, click on the type of ammunition in the list and enter the amount recovered.  Both the amount on their person, and any amount in their quiver or in-hand are updated.</p>
<p><b>Note:</b> enter the amount recovered <em>not</em> the new total.  The amount entered will be added to the current amount held, and then this new value set as the new maximum.  A negative amount can also be entered, which will be removed from the current quantity and will also set the new maximum.</p>
<p><b>Note:</b> after a Long Rest (see <b>MagicMaster API</b>) all ammunition maximum totals are set to current quantities at that time.  It is assumed that during the period of a long rest, some creature will have found any loose ammo, or it will otherwise have been broken or lost.</p>
<p><b>Note:</b> ammunition that has the item-type of <i>‘charged’</i> will appear on the menu with a grey box which cannot be selected, indicating that the ammo cannot be recovered – such ammunition always breaks on contact: e.g. glass arrows.</p>
<h3>4.2 Ammunition quantity amendment</h3>
<pre>--setammo [token_id] | ammo_name | [ [+/-]cur_qty / = ] | [ [+/-]max_qty / = ] | [ SILENT ]</pre>
<p>Takes an optional token ID (if not specified uses selected token), the unique name of the ammunition, an optional value for the current quantity, optionally preceded by +/- or replaced by an =, an optional value for the maximum quantity with the same +/- & = possibilities, and an optional parameter of “Silent” (case insensitive).</p>
<p>This command allows programmatic or macro alteration of the quantity of a type of ammo:</p>
<ul><li>The current quantity and/or the maximum held (i.e. the amount to which ammunition can be recovered up to – see section 4.1 Ammunition Recovery, above) can be set to absolute values just by entering numbers for the parameters.</li>
<li>Either parameter can be preceded by a + or -, in which case the parameter will modify the corresponding current value, rather than replacing it.</li>
<li>Either parameter can be an = by itself.  In this instance, the corresponding value is set to the other corresponding value (after any modification) i.e. putting = for cur_qty sets the current quantity held to be the maximum possible, or putting = for max_qty sets the maximum possible to be the current quantity.  Putting = for both does nothing.</li>
<li>No value can go below 0, and the current quantity will be constrained at or below the maximum quantity.</li></ul>
<p>So, for example, this command will set the maximum quantity to 10 and set the current quantity to be equal to it:</p>
<pre>!attk –setammo @{selected|token_id}|Flight-Arrow+1|=|10|silent</pre>
<p>If the “Silent” parameter is not specified, then the Ammunition Recovery chat menu will display with the amended values once complete, and a message is displayed with the changes that occurred.</p>
<p><b>Note:</b> if more than one ammo item of the same name is listed in the backpack table (see section 7 on Character Sheet Setup), only the first item found will be amended.  If no item of that name is found, nothing happens and no menus or messages are displayed.</p>
<br>
<h2>5. Armour Class and Saving Throws</h2>
<h3>5.1 Edit Armour</h3>
<pre>--edit-armour [token_id]<br>
--edit-armor [token_id]</pre>
<p>Takes an optional token ID – if not specified uses selected token.</p>
<p>The very best way for the Character, NPC or creature to acquire armour (or any other items including magic items) is to use the <b>MagicMaster API</b> and its commands and databases.  However, AttackMaster provides a small subset of those facilities to allow the DM and/or Players to add weapons, ammo & armour to their Character Sheet item bags.  Once added, these items can be taken ‘in-hand’ by the Character (using the <b>--weapon</b> command), and improve the Armour Class of the Character appropriately.</p>
<p>The advantage of doing this over just typing the item names into the Character Sheet tables is that the items are assured to exist in the weapon, ammo & armour databases that come with the API and so all other aspects of the API will work properly (see section 5.2 below).</p>
<p>This command is identical to the <b>--edit-weapons</b> command and uses the same menu.</p>
<h3>5.2 Review Armour Class</h3>
<pre>--checkac [token_id] | [ SILENT ] | [SADJ / PADJ / BADJ]</pre>
<p>Takes an optional token ID (if not specified uses selected token), an optional “Silent” command, and an optional damage type which can be “SADJ”, “PADJ” or “BADJ” (the “Silent” and damage type parameters are not case sensitive).</p>
<p>This command analyses the items in the Character’s backpack table (see section 7 on Character Sheet Setup) using the information in the various item databases supplied / created by the API(s), and taking into account the current Dexterity bonuses calculates the current Armour Class of the Character.  It then displays a chat message with its results and an explanation of how it came to them.  If the optional damage type is provided, the calculation takes this into account.</p>
<p>The system can use the information in the databases to take into account magical armour plusses, combined effects of armour that can work together (like Armour and Shields), exclude combinations that are not allowed (like Rings of Protection with magical armour), and the armour types allowed for various character classes and races including specialist variations.</p>
<p>The system automatically updates this information any time the Character changes what is in their hands (e.g. if they pick up or put down a shield) using the <b>--weapon</b> command.  If using the InitMaster API, the command is also run every time the character does an Initiative roll.  If using the MagicMaster API, the command is also run any time items are looted from a chest or NPC, or stored away or given to another character.</p>
<p>The system remembers on the Character Sheet what its calculations are each time.  If the most recent calculation results in a change in Armour Class for the character, the character’s token AC (if displayed) will be modified by the difference between the old and new values.  This modified value will be shown on the Armour Class Review message in the chat window if it is different from the calculated value.</p>
<p><b>Note:</b> the token displayed AC is only modified by the difference between the previous and current calculations.  This allows magical and other effects (such as those managed by the RoundMaster API) to alter the token displayed AC and not be overwritten by a change in calculated AC, but still take into account the change.  The token AC can be manually updated at any time without impact on this functionality, to overcome any errors.</p>
<p><b>Note:</b> if the token is configured following the Master Series API standard (see CommandMaster API documentation), the token bar for the displayed AC is normally hidden.  if the calculated AC and token displayed AC are different (see above) then the AC token bar appears, representing the difference between the two.  This acts as a visual reminder to the DM and Player that the token is the subject of some effect on AC – it also helps to identify if there is a difference in error, so that this can be manually rectified (by manually altering the token displayed AC).  Once the two are again the same and the <b>–check-ac</b> command run, the token AC bar will again be hidden.</p>
<h3>5.3 Saving Throws</h3>
<pre>--save [token_id] | [ situation-mod ]<br>
--save [token_id] | [ situation-mod ] | save-type | saving-throw</pre>
<p>Takes an optional token ID (if not specified uses selected token), and different forms of the command take an optional situational modifier to the saving throw, a type of save (which can be one of ‘paralysis’, ‘poison’, ‘death’, ‘rod’, ‘staff’, ‘wand’, ‘petrification’, ‘polymorph’, ‘breath’, or ‘spell’, not sensitive to case), and the base, unmodified saving throw achieved on a dice.</p>
<p>This command can either display a menu from which to display and manage the saving throw table, and make saving throws or, in its second form, to make a saving throw and check the result against the saving throw table.</p>
<p>The first form shows all the possible saves that can be made, the saving through that needs to be achieved to make the save, and any modifiers that apply to this particular character.  There are buttons to modify the saving throw table and the modifiers, and/or to apply a “situational modifier” to immediate saving throws (the “situational modifier” only applies to current rolls and is not remembered).  Also, each type of saving throw can actually be made by clicking the buttons provided.  Doing so effectively runs the second form of the command.</p>
<p>The situational modifier can optionally be passed in as a value with the command call if so desired, instead of selecting via the button on the menu.</p>
<p>Running the second form of the command (or selecting to make a saving throw from the first form’s menu) will execute the saving throw (as a dice roll if this is specified instead of a straight value) of the specified type, using the data in the character’s saving throw table to assess success or failure, displaying the outcome and the calculation behind it in the chat window.</p>
<br>
<h2>6.Other commands</h2>
<h3>6.1 Display help on these commands</h3>
<pre>--help</pre>
<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>
<h3>6.2 Check database completeness & integrity</h3>
<pre>--check-db [ db-name ]</pre>
<p>Takes an optional database name or part of a database name: if a partial name, checks all character sheets with the provided text in their name that also have ‘-db’ as part of their name.  If omitted, checks all character sheets with ‘-db’ in the name.  Not case sensitive.  Can only be used by the GM.</p>
<p>This command finds all databases that match the name or partial name provided (not case sensitive), and checks them for completeness and integrity.  The command does not alter any ability macros, but ensures that the casting time (‘ct-‘) attributes are correctly created, that the item lists are sorted and complete, and that any item-specific power & spell specifications are correctly built and saved.</p>
<p>This command is very useful to run after creating/adding new items as ability macros to the databases (see section 8 below).  It does not check if the ability macro definition itself is valid, but if it is then it ensures all other aspects of the database consistently reflect the new ability(s).</p>
<h3>6.3 Handshake with other APIs</h3>
<pre>–hsq from|[command]<br>
–handshake from|[command]</pre>
<p>Either form performs a handshake with another API, whose call (without the ‘!’) is specified as <i>from</i> in the command parameters (the response is always an <b>–hsr</b> command).  The command calls the <i>from</i> API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>
<dl><dt>Received:</dt><dd><i>!attk –hsq init</i></dd>
<dt>Response:</dt><dd><i>!init –hsr attk</i></dd></dl>
<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the <i>command</i> string parameter is added, where <i>command</i> is the RoundMaster command (the ‘--’ text without the ‘--‘).  This will respond with a <i>true/false</i> response: e.g.</p>
<dl><dt>Received:</dt><dd><i>!attk –handshake init|menu</i></dd>
<dt>Response:</dt><dd><i>!init –hsr attk|menu|true</i></dd></dl>
<h3>6.4 Switch on or off Debug mode</h3>
<pre>--debug (ON/OFF)</pre>
<p>Takes one mandatory argument which should be ON or OFF.</p>
<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player – so the DM or a technical advisor can play as a Player and see the debugging messages.</p>
<br>
<h2>How To Use AttackMaster</h2>
<h3>Specifying a token</h3>
<p>Most of the AttackMaster API commands need to know the token_id of the token that represents the character, NPC or creature that is to be acted upon.  This ID can be specified in two possible ways:</p>
<ol><li>explicitly in the command call using either a literal Roll20 token ID or using @{selected|token_id} or @{target|token_id} in the command string to read the token_id of a selected token on the map window,<br>or</li>
<li>by having a token selected on the map window, not specifying the token_id in the command call, and allowing the API to discover the selected token_id.</li></ol>
<p>In either case, if more than one token is selected at the time of the call then using either @{selected|token_id} to specify the token in the command call, or allowing the command to find a selected token, is likely (but not guaranteed) to take the first token that was selected.  To avoid ambiguity, it is generally recommended to make command calls with only one token selected on the map window.</p>
<h3>Who can make AttackMaster API command calls</h3>
<p>The majority of API command calls can be made by both the GM and all Players.  The typical means for command calls to be made is via Character Sheet Token Action Buttons (standard Roll20 functionality – see Roll20 Help Centre for information) which trigger Ability macros on the Character Sheet which simply make the API command call.  The Character Sheets can be controlled by the GM or Players.  The API knows if it is a GM or a Player that has triggered the call, and reacts accordingly.</p>
<h3>Weapons that can be used</h3>
<p>Any weapon in the Weapons tables on the Character Sheet can be used for attacks.  However, the very best approach is to use the functions in this and other RPGMaster APIs to manage weapon choice.  Weapon definitions are held in weapon databases: see section  8 for details.  All standard weapons from the AD&D 2e Players Handbook are included, as well as many magic variations.</p>
<h3>Allocating weapons to a Character</h3>
<p>Weapons and ammunition are held in the Items table, which holds data on all items that the Character / NPC / creature has on their person- see section 7 regarding where the Item table is on the Character Sheet and the data that is held in it.  The added weapon must have a listing in the Weapons database.</p>
<p>The easiest way to enter the correct data into the Items table is to use the <b>MagicMaster API</b>, which supports finding and looting weapons e.g. from a chest or a dead body, or just the DM or Player choosing weapons from a menu.  If a Ranged Weapon that uses ammunition is added, a quantity of the respective ammunition (or multiple types of ammunition) must also be added to the Items table.</p>
<p>Multiple weapons of many different types can be added, including those with magical properties.  The system will take all the weapon statistics into account using the information in the associated databases.</p>
<h3>Selecting weapons to attack with</h3>
<p>Each Character / NPC / creature has a defined number of hands (which can be different from 2), and AttackMaster provides a menu to take any weapon(s) in hand.  Doing so enters all the correct information from the weapons database into the Weapons, Damage and Ranged Weapons tables, and the correct ammunition type(s) held in the Items table into the Ammo table.</p>
<h3>Making attacks</h3>
<p>Several different attack approaches are supported by the API.</p>
<table><tr><th scope="row">Roll20 rolls:</th><td>the system makes an attack dice roll and modifies it using the data on the Character Sheet, then displays the results to the Player.  Hovering the mouse over the displayed values of AC (armour class) hit and the Adjustments will display information explaining the values.  Buttons are displayed to make Damage rolls which can be used if the attack was deemed successful (the target’s AC was the same or worse than the AC hit).</d></tr>
<tr><th scope="row">Player rolls:</th><td>the system prompts for the Player to roll a dice and enter the result, and then modifies the roll entered using the data on the Character Sheet and displays the result to the Player.  As above, hovering the mouse over the displayed results will explain how the amounts were calculated.  Buttons to make Damage rolls are also displayed, which will also prompt the user to make a dice roll (showing the dice that should be rolled).</td></tr>
<tr><th scope="row">Targeted attack:</th><td>DM only option.  The DM can, if they choose, make a targeted attack, which prompts the DM to select the target.  The system then rolls the Attack dice and the Damage dice and displays all possible results, and also displays the AC and HP of the target for quick analysis.</td></tr></table>
<h3>Ammunition</h3>
<p>The system handles both Ranged weapons that take ammunition, such as bows and slings, and also “self-ammoed” Ranged weapons like daggers, that can be thrown at a target.  The quantity of ammunition or self-ammoed weapons is managed by the system: as they are used in attacks, the quantity in the Characters Item table decreases.  A menu can be called to recover ammunition, in agreement with the DM - the same menu can be used to add or remove quantities of ammunition for other reasons (such as being purchased).  Some types of ammo always breaks and can’t be recovered (for example glass arrows) – this is charged ammo.</p>
<h3>Ranged weapon and ammunition ranges</h3>
<p>Each type of ammunition has a range with the weapon used to fire it.  These ranges can be different for different types of weapon - thus a longbow can fire an flight arrow further than a short bow, and a sheaf arrow has different ranges than the flight arrow with each.  The ranges that can be achieved by the weapon and ammunition combination are displayed when they are used in an attack, and the Player is asked to select which range to use, which then applies the correct range modifier to the attack roll.</p>
<h3>Dancing weapons</h3>
<p>The system can support any weapon becoming a dancing weapon, with qualities that can be the same as or different from a Sword of Dancing.  In the system a dancing weapon does not have to be held in hand in order for it to be available for attacks and, if using the <b>InitiativeMaster API</b>, the weapon is also automatically added to the Turn Order Tracker for its attacks to be performed in battle sequence.  All of this can be achieved automatically if used with the <b>RoundMaster API</b>, with durations of ‘warm up’ and ‘dancing’ dealt with, as well as magical properties changing as the rounds progress - that function requires some editing of the Effects database to adapt for a particular weapon - see section 8 of the RoundMaster API documentation for details.</p>
<h3>Armour Class management</h3>
<p>The system continually checks the Armour Class of each Character / NPC / creature by examining the information on the Character Sheet and the items in the Item table.  Armour and Shields can be placed in the Items table which will be discovered, and the specifications from the Armour database used to calculate the appropriate AC under various conditions and display them to the Player.  The process the system made to achieve the calculated AC will be shown.</p>
<p>Many magic items have AC qualities, such as Bracers of Defence and Rings of Protection, and if the <b>MagicMaster API</b> is used these are also taken into account - invalid combinations will also be prevented, such as Rings of Protection with magical armour.  If allocated to a Token Circle, the calculated AC is compared to the displayed Token AC and any difference highlighted - this may be due to magical effects currently in place, for instance - the highlight allows the Player to review why this might be.</p>
<h3>Saves</h3>
<p>The corollary to attacks is saves.  The system provides a menu to access, review, update and make saving throws and the appropriate modifiers.</p>
<p>The initial menu presented shows the saving throw table from the Character Sheet (always the one from the Character tab rather than the Monster Tab - monster saving throws should be copied to both).  Each type of save has a button to make the saving throw: the system will perform the roll and display the result with an indication of success or failure.  The menu also shows buttons to add a situational adjustment (as per the AD&D 2e PHB) and to modify the saving throw table.</p>
<p>The easiest way to set the correct saving throws for each type of save, based on class, level & race, is to use the <b>CommandMaster API</b> Character Sheet setup commands.</p>
