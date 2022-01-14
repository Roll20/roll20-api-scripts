<h1>Initiative Master API</h1>
<p>This API supports initiative for RPGs using the Turn Order and the Tracker window.  The InitiativeMaster API provides functions dealing with all aspects of: managing how initiative is done; rolling for initiative; for “group” and “individual” initiative types providing Character action selection to determine the speed and number of attacks of weapons, the casting time of spells & the usage speed of magic items; supporting initiative for multiple attacks with one or multiple weapons per round; supporting and tracking actions that take multiple rounds; managing the resulting Turn Order; as well as performing the “End of Day” activity.  It works very closely with the RoundMaster API to the extent that InitiativeMaster cannot work without RoundMaster (though the reverse is possible).  InitiativeMaster also works closely with AttackMaster API and MagicMaster API and uses the data configured on the Character Sheet by these other APIs, although it can use manually completed Character Sheets once correctly configured.</p>
<h2>Syntax of InitiativeMaster calls</h2>
<p>The InitiativeMaster API is called using !init.</p> 
<pre>!init --help</pre>
<p>Commands to be sent to the InitiativeMaster API must be preceded by two hyphens ‘--’ as above for the --help command.  Parameters to these commands are separated by vertical bars ‘|’, for example:</p>
<pre>!init --init [party-roll]|[foes-roll]</pre>
<p>If optional parameters are not to be included, but subsequent parameters are needed, just leave out the optional parameter bu leave the vertical bars in, e.g.</p>
<pre>--init  | [foes-roll]</pre>
<p>Commands can be stacked in the call, for example:</p>
<pre>!init --doCharList  ALL  --init </pre>
<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash ‘/’, meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash ‘/’ is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).<\p>
Using Character Sheet Ability/Action buttons
<p>The most common approach for the Player to run these commands is to use Ability macros on their Character Sheets which are flagged to appear as Token Action Buttons: Ability macros & Token Action Buttons are standard Roll20 functionality, refer to the Roll20 Help Centre for information on creating and using these.</p>
<p>In fact, the simplest configuration is to provide only Token Action Buttons for the menu commands: --menu and   monmenu.  From these, most other commands can be accessed.</p>
<h2>Command Index</h2>
<p>All commands are preceded by !init unless otherwise stated.</p>
<h3>1. Manage Initiative type, rolls & party</h3
<pre>--init [party-roll]|[foes-roll]<br>
--type < STANDARD / GROUP / INDIVIDUAL ></pre>
<h3>2. Show group / individual Initiative menus</h3>
<pre>--menu token-id<br>
--monmenu token-id</pre>
<h3>3. Show action-specific Initiative menus</h3>
<pre>--weapon token-id<br>
--monster token-id<br>
--complex token-id<br>
--muspell token-id<br>
--prspell token-id<br>
--power token-id<br>
--mibag token-id<br>
--thief token-id<br>
--other token-id</pre>
<h3>4. Maintain the Turn Order and Rounds</h3>
<pre>--maint<br>
--check-tracker<br>
--list-pcs  ALL / MAP / REPALCE / ADD</pre>
<h3>5. End of Day processing</h3>
<pre>--end-of-day [cost]</pre>
<h3>6. Other commands</h3>
<pre>--help<br>
--handshake from | [cmd]<br>
--hsq from | [cmd]<br>
--hsr from | [cmd] | [TRUE/FALSE]<br>
--debug ON/OFF</pre>
<h3>7. How to use the InitiativeMaster API</h3>
<br>
<h2>Detail of Commands</h2>
<h3>1. Manage Initiative type, rolls & party</h3>
<h4>1.1 Manage the Initiative process</h4>
<pre>--init [party-roll]|[foes-roll]</pre>
<p>DM Only command.  Takes an optional dice roll result for the Party, and an optional dice roll result for the foes.</p>
<p>This command displays a chat menu to specify:</p>
<ul>
	<li>the type of initiative to do (standard, group or individual),</li>
	<li>the initiative rolls for the Party and the Foes (for standard and group initiative),</li>
	<li>who is in the Party,</li>
	<li>to check if everyone has selected their action for the next round (for group and individual initiative),</li>
	<li>and whether to show this menu automatically as each new round starts.</li></ul>
<p>The different types of AD&D2e Initiative process are explained in the DMG p55, and consist of “standard”, “group”, and “initiative”:</p>
<table>
	<tr><th scope="row">Standard:</th><td>the Party and the Foes (DM) each roll 1d10, and all of whichever gets the lowest roll goes first.  The system supports taking the two rolls, and putting entries in the Turn Order for all defined Party members, and one entry for the Foes.</td></tr>
	<tr><th scope="row">Group:</th><td>the Party and the Foes (DM) each roll 1d10, and then all Party members and all Foes choose what actions they will perform during the next round.  The speed/casting time of the Character’s / Foes selected action will then be added to the relevant roll to define the Character’s / Foes initiative(s) which are added to the Turn Order.</td></tr>
	<tr><th scope="row">Individual:</th><td>each individual Character & Foe chooses what action they will do each round, and the speed/casting time of that action is added to an individual system-rolled 1d10 for that Character / Foe resulting in each Character’s initiative(s) which are all added to the Turn Order.</td></tr>
</table>
<p>The type of initiative selected persists between game sessions.</p>
<p>Who is in the party can be defined by using API Buttons on the menu to do one of: search all maps in the Campaign for tokens controlled by Players; search just the map the Players are on for tokens controlled by Players; select a number of tokens on any map and add them to the list; or replace the whole list with the selected tokens.</p>
<p>Another API button checks to see if the Turn Order contains entries for every token listed as being in the Party, i.e. that everybody has selected their actions for the next round.</p>
<p>This menu can appear automatically as each completed round finishes if RoundMaster API is managing the Turn Order and Rounds.  This is useful for standard and group initiative, as the first thing that needs to happen is for the Party & Foe initiative dice rolls to be entered.  It is less useful for this menu to appear for individual initiative, and it can be turned off with another API Button.</p>
<h4>1.2 Set the type of Initiative being used in the Campaign</h4>
<pre>--type < standard / group / individual ></h4>
<p>Takes a mandatory initiative type which must be one of those shown.</p>
<p>This command sets the initiative type to the specified type without bringing up the complete --init menu.  The type of initiative specified persists between game sessions.</p>
<br>
<h3>2. Show Group / Individual initiative action selection menus</h3>
<h4>2.1 Display a menu of possible actions for the selected Character / NPC</h4>
<pre>--menu token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>This command displays a chat menu of buttons for types of action that the Character / NPC / creature can perform.  Each of these buttons may take the Player to a more detailed list of specific action buttons.  Selecting any of the buttons will add the speed/casting time and correct number of instances of the selected action to the group or individual initiative dice roll (1d10) and enter the result in the Turn Order using the RoundMaster API – ‘individual’-type initiative dice rolls are performed in the background by the API and there is currently no option for the Player to do the roll instead.  The system records the action selected and the speed of that action along with any modifiers as a message to display when the Character’s / NPCs / creature’s turn comes around.</p>
<p>For multiple actions per round, those subsequent to the first action with the same item have speeds in the Turn Order incremented from each other by the speed of the action: thus multiple attacks with a Longbow (2 per round, speed 8, after an initiative roll of 5 on a 1d10, will happen at priority 13 & 21.  For attacks by a Fighter with two weapons, such as a Longsword (sp 5) in their left hand and a Short sword (sp 3) in their right hand, after an initiative roll of 5, the Short sword will get a Turn Order priority of 8 and the Longsword 10 – that is they are consecutive not sequential.</p>
<p>See the individual menu explanations for more detail on each type of action.</p>
<h4>2.2 Display a menu of possible actions for the selected creature</h4>
<pre>--monmenu token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>This produces a slightly simpler form of the initiative action menu for creatures.  Otherwise, all actions result in similar processing as per the normal action selection.</p>
<p>If the creature is very simple (only uses the simple attack lines on the Monster tab of the AD&D2e Character Sheet), then it might be sensible to use the –monster command instead: see below.</p>
<br>
<h3>3. Action specific Initiative menus</h3>
<h4>3.1 Display initiative actions to attack with the weapons ‘in-hand’</h4>
<pre>--weapon token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a chat menu listing all the weapons that the Character / NPC / creature has ‘in-hand’ (i.e. that are currently in the Weapon and Ranged tables), with additional options as appropriate to the Character Sheet.  Rogue class characters will get a ‘Backstab’ option which will apply the Rogue backstab multiplier as appropriate.  Fighter & Rogue classes will get an option to choose two weapons (if there are two one-handed weapons in-hand) which presents the option of selecting a Primary and a Secondary weapon to do initiative for.</p>
<p>If the Character / NPC / creature has Powers or Magic Items they can use, buttons also appear on the menu to go to the menus to select these instead of doing a weapon initiative – see the –power and –mibag commands.  There is also a button for ‘Other’ actions, such as Moving, Changing Weapon (which takes a round), doing nothing, or Player-specified actions – see the –other command.</p>
<h4>3.2 Display initiative actions for a simple creature to attack</h4>
<pre>--monster token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a chat menu only listing innate monster attacks from the Monster tab of the AD&D2e Character Sheet.</p>
<p>Creatures using the Innate Monster Attack fields on the AD&D2e Character Sheet Monster tab benefit from an extended syntax for entries in these fields: each field can take [<Attack name>,]<damage dice roll>[,<speed>] for example Claw,1d8,2 and Sword+1,2d4+1,5.  These will result in possible initiative actions for that creature for Claw and Sword+1.  If Attack Name is omitted, the dice roll is displayed as the action name instead.  If the speed is omitted, the Innate attack speed field value is used instead.  The speed will then be used to calculate the Turn Order priority.</p>
<h4>3.3 Display initiative actions for a weapon-wielding creature to attack</h4>
<pre>--complex token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a more complex monster attack menu, with both ‘Innate’ attacks from the Monster tab as well as weapon attacks from the Character tab weapons tables (the API does not use the recently introduced Weapon table for Monsters on the Monster tab so that the AttackMaster API only has to deal with one set of tables).  If the creature has powers or magic items, it will also offer action menu buttons for those.  The selected attack or weapon speed will then be used to calculate the Turn Order priority.</p>
<h4>3.4 Display initiative actions for Wizard spells</h4>
<pre>--muspell token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a menu of Wizard spells that the Character / NPC has memorised (see the MagicMaster API documentation for memorising spells).  Any spell that is still memorised can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.</p>
<h4>3.5 Display initiative actions for Priest spells</h4>
<pre>--prspell token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a menu of Priest spells that the Character / NPC has memorised (see the MagicMaster API documentation for memorising spells).  Any spell that is still memorised can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.<p>
<h4>3.6 Display initiative actions for powers</h4>
<pre>--power token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a menu of Powers that the Character / NPC has been granted (see the MagicMaster API documentation for managing powers).  Any power that has not been consumed can be selected for initiative, and the relevant casting time will be used to calculate the Turn Order priority.</p>
<h4>3.7 Display initiative actions for Magic Items</h4>
<pre>--mibag token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a menu of Magic Items and non-magical equipment that the Character / NPC / creature has on their person.  Selecting an item for initiative uses the speed of action of that item to calculate the Turn Order priority.</p>
<h4>3.8 Display initiative actions for Thieves</h4>
<pre>--thief token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a menu of Thievish actions (with current percentage proficiencies of each).  Selecting one for initiative uses the speed of action of that item to calculate the Turn Order priority.</p>
<h4>3.9 Display other actions </h4>
<pre>--other token-id</pre>
<p>Takes a mandatory token ID.</p>
<p>Displays a menu of other (non-attacking) actions that the Character / NPC / creature can take, namely: Moving (speed 0 as it is an innate ability); Changing Weapon (also speed 0 but takes all round); Doing Nothing (obviously speed 0); and one that allows the Player to enter a description and specify a speed for that action (presumably with the agreement of the DM).</p>
<br>
<h3>4. Maintain the Turn Order and Rounds</h3>
<h4>4.1 Display the DM’s round maintenance menu</h4>
<pre>--maint</pre>
<p>DM Only command.  Does not take any parameters.</p>
<p>Displays a chat menu of action API Buttons to control the Turn Order Tracker window using commands sent to the RoundMaster API.  The key one is Start/Pause, which initialises RoundMaster and starts it managing the Turn Order, or pauses it so that stepping through the Turn Order does not trigger any RoundMaster actions (such as counting down token status timers or initiating Effects).  The full list of functions is:</p>
<table>
	<thead>
		<th scope="col">Maintenance Menu Button</th>
		<th scope="col">RoundMaster !rounds command (unless otherwise stated)</th>
		<th scope="col">Description</th>
	</thead>
	<tr><td>Start / Pause</td><td>--start</td><td>Starts / Pauses RoundMaster functioning</td></tr>
	<tr><td>Start Melee</td><td>--clearonround on<br>--clear</td><td>Causes the Turn Order to automatically clear at the end of each round (once all actions have completed) ready for Players to select actions for their Characters</td></tr>
	<tr><td>Stop Melee</td><td>--clearonround off</td><td>Stops the Turn Order from automatically clearing at the end of each round, so that the Turn Order is preserved.  Can be useful when just wanting to cycle around a list of Characters selected in the !init –init menu command and running ‘Standard’ initiative.</td></tr>
	<tr><td>Re-start</td><td>--sort</td><td>Re-sorts the current Turn Order, effectively re-starting the round.  Useful if the DM accidentally starts the next round by moving the Turn Order on before all Players have completed their initiative actions – allow new actions to be selected and then use Re-start</td></tr>
	<tr><td>Set Round Number</td><td>--reset #</td><td>Sets the current Round number to #.  If # is larger than the current round, all token status counters will advance by the number of rounds difference, ending if they reach 0 with the consequential Effects triggered</td></tr>
	<tr><td>Clear Turn Order</td><td>--clear</td><td>Clears the Turn Order of all entries (except the round number)</td></tr>
	<tr><td>Remove Tokens from Tracker</td><td>--removefromtracker</td><td>Removes all the selected tokens from the Turn Order and the Tracker window.  Multiple tokens can be selected and removed all at the same time.</td></tr>
	<tr><td>Edit Selected Tokens</td><td>--edit</td><td>Displays the status markers on all the selected tokens, and offers options to edit or delete them.  The “spanner” icon edits the status, and the “bin” icon deletes it.</td></tr>
	<tr><td>Move Token Status</td><td>--moveStatus</td><td>For each of the selected tokens in turn, searches for tokens in the whole campaign with the same name and representing the same character sheet, and moves all existing statuses and markers from all the found tokens to the selected token (removing any duplicates).  This supports Players moving from one Roll20 map to another and, indeed, roundMaster detects page changes and automatically runs this command for all tokens on the new page controlled by the Players who have moved to the new page.</td></tr>
	<tr><td>Clean Selected Tokens</td><td>--clean</td><td>Drops all status markers from the selected token, whether they have associated effects or time left, or are just manually applied markers.  Useful when there might have been corruption, or everyone is just confused!  The token statuses still exist, and associated markers will be correctly rebuilt at the start of the next round or the next trigger event (but not manually added ones).</td></tr>
	<tr><td>Enable Long Rest for PCs</td><td>–end-of-day <cost></td><td>Run the normal initMaster end-of-day command</td></tr>
	<tr><td>Enable Long Rest for selected tokens</td><td>–enable-rest</td><td>Enable a long rest only for the characters / NPCs / creatures represented by the selected tokens.  See the MagicMaster API documentation for information on Long Rests</td></tr>
	<tr><td>Set Date</td><td> </td><td>Currently not implemented – future expansion</td></tr>
	<tr><td>Set Campaign</td><td> </td><td>Currently not implemented – future expansion</td></tr>
	<tr><td>Update Selected Tokens</td><td>!cmd --abilities</td><td>Use the CommandMaster API function to setup and maintain Character ability action buttons, weapon proficiencies, spell books & granted powers, saving throws, token “bar & circle” assignment etc.  See CommandMaster API documentation on the –abilities command.</td></tr>
	<tr><td>Emergency Stop!</td><td>--stop</td><td>After confirmation, performs a Full Stop and re-start of the RoundMaster API, dropping all internal tables of statuses & effects, token markers, timers etc.  Use with care!</td></tr>
</table>
<h4>4.2 Display those characters that have not yet had initiative actions selected</h4>
<pre>--check-tracker</pre>
<p>DM Only command.  Does not take any parameters.</p>
<p>Uses the Player Character name list created & maintained in the –init menu or with the –list-pcs command, and checks that all of the Character’s named have completed initiative selection to the point where their token name is in the Turn Order at least once, and appears in the Tracker window.  Names those that have not in a message to the DM, or states that initiative is complete.</p>
<h4>4.3 Change the list of characters in the Party</h4>
<pre>--list-pcs < all / map / replace / add ></pre>
<p>DM Only command.  Takes a specifier for the tokens to have in the Player Character list which must be one of those listed.</p>
<p>Updates the internally held list of Characters that are controlled by Players (and others that the DM can add at will).  This list is displayed on the –init menu, and is used by –check-tracker and –end-of-day commands.  The list persists between sessions of game-play.  The following parameters have the following effects:</p>
<table>
	<tr><th scope="row">all:</th><td>looks across all tokens in the campaign and creates a new list composed of those representing Character Sheets controlled by a Player (standard Roll20 Character Sheet functionality – refer to the Help Centre for information on setting Players to control Character Sheets and their tokens).</td></tr>
	<tr><th scope="row">map:</th><td>creates a new list that only has Characters represented by tokens on the current Player map that are controlled by Players.  (See Roll20 Help Centre on how to select the current Player map).</td></tr>
	<tr><th scope="row">replace:</th><td>creates a new list including all the currently selected token(s) (whomever controls them), and no others.</td></tr>
	<tr><th scope="row">add:</th><td>adds the currently selected token(s) (whomever controls them) to the existing list leaving all the others unchanged.</td></tr>
</table>
<br>
<h3>5. End of Day processing</h3>
<h4>5.1 Initiate End of Day processing</h4>
<pre>--end-of-day [=][cost]</pre>
<p>DM Only command.  Takes an optional cost parameter, optionally preceded by an ‘=’ character.</p>
<p>This command performs the ‘End-of-Day’ processing for the campaign.  This consists of enabling Long Rests for all Characters / NPCs / creatures to regain their spells and powers, and for recharging Magic Items to regain their charges (see MagicMaster API documentation for information on Long Rests).  It also removes spent ammunition from quivers that has not been recovered, as it is assumed to be lost, broken or taken by other creatures during the period of the night (see AttackMaster API documentation about recovery of ammunition and its loss over a Long Rest).</p>
<p>Each day can cost or earn the members of the Party money, perhaps depending on where they stay overnight, whether they eat just camp rations or lavish meals, use an Inn and drink too much, or earn money doing a job.  The optional cost parameter can be set to a positive cost to the party which will be deducted from every member, or a negative quantity which will be earned (a negative cost).  Preceding the cost with ‘=’ will not run the ‘End-of-Day’, but instead will set the standard cost for each night if no parameter is given.</p>
<p>Each time the command is run, the DM is asked to confirm if they wish the cost to be deducted from/earned by all the Characters listed.  If No is selected, nothing is deducted or earned.</p>
<p>If the ‘=’ is followed by a Roll Query (see Roll20 Help Centre for information on Roll Queries), the Roll Query will be run each time the –end-of-day command is run without a parameter, allowing (for instance) the DM to select from a list of possible daily costs or earnings.</p>
<br>
<h3>6. Other Commands</h3>
<h4>6.1 Display help on these commands</h4>
<pre>--help</pre>
<p>This command does not take any arguments.  It displays a very short version of this document, showing the mandatory and optional arguments, and a brief description of each command.</p>
<h4>6.2 Handshake with other APIs</h4>
<pre>--hsq from|[command]<br>
--handshake from|[command]</pre>
<p>Either form performs a handshake with another API, whose call (without the ‘!’) is specified as from in the command parameters (the response is always an –hsr command).  The command calls the from API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>
<p><i>Received:	!rounds –hsq magic<br>
Response:	!magic –hsr rounds</i></p>
<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the command string parameter is added, where command is the RoundMaster command (the ‘--’ text without the ‘--‘).  This will respond with a true/false response: e.g.</p>
<p><i>Received:	!rounds –handshake init|addtotraker<br>
Response:	!init –hsr rounds|addtotracker|true</i></p>
<h4>6.3 Switch on or off Debug mode</h4>
<pre>--debug (ON/OFF)</pre>
<p>Takes one mandatory argument which should be ON or OFF.</p>
<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player – so the DM or a technical advisor can play as a Player and see the debugging messages.</p>
<br>
<h2>How Initiative Master API works</h2>
<p>The Initiative Master API (‘InitMaster’) provides commands that allow the DM to set and manage the type of initiative to be used in the campaign, and for Players to undertake initiative rolls.  The API uses data on the Character Sheet represented by an selected token to show menus of actions that can be taken: these commands are often added to the Character Sheet as Ability Macros that can be shown as Token Actions (see Roll20 Help Centre for how to achieve this, or the CommandMaster API documentation).  The API displays resulting Turn Order token names with action priorities in the Turn Order Tracker window (standard Roll20 functionality – see Roll20 documentation & Help Centre).</p>
<p>The API (as with other APIs in the RPGMaster series) is distributed configured for the AD&D 2e Character Sheet from Peter B.  The API can be easily modified to work with other character sheets by changing the fields object in the API to map the internal names for fields to the character sheet field names – see the Character Sheet Setup handout.</p>
<h3>Types of Initiative System</h3>
<p>The API supports AD&D2e methods for initiative: ‘standard’, ‘group’ and ‘individual’, selectable by the DM in-game and changeable during game play, if desired.</p>
<p>‘Standard’ AD&D2e initiative just requires a ‘Party’ initiative dice roll and a ‘Foe’ initiative dice roll to be entered, and the Turn Order entries are set appropriately.</p>
<p>For ‘Group’ initiative, the same rolls are entered but, in addition, the action of each character / NPC / creature (each token) taking part specifies what actions they are going to perform that round and the speed of that action is added to the relevant group dice roll to create the Turn Order priority for that token.</p>
<p>For ‘Individual’ initiative, each character / NPC / creature makes its own individual dice roll as well as specifying their action, with the individual dice roll and speed of action being combined to give the Turn Order priority.</p>
<h3>Monster Attack Initiatives</h3>
<p>Creatures using the Innate Monster Attack fields on the AD&D2e Character Sheet Monster tab benefit from an extended syntax for entries in these fields: each field can take</p>
<pre>[Attack name],damage dice roll,[speed] </pre>
<p>for example Claw,1d8,2 and Sword+1,2d4+1,5.  These will result in possible initiative actions for that creature for Claw and Sword+1.  If Attack Name is omitted, the dice roll is displayed as the action name instead.  If the Speed is omitted, the Innate attack speed field value is used instead.</p>
<h3>Effect of Magic on Initiative</h3>
<p>The system can take into account various modifiers applied by spells and/or magic items (e.g. Haste and Slow spells), and the spell, power & magic item macros provided with the MagicMaster API use this functionality.  Section 8 states which Character Sheet fields to enter the modifiers into in order for them to be taken into account.  RoundMaster API spell effects (if implemented) will also often update these fields for you.</p>
<h3>Multi-attack Initiatives</h3>
<p>The system can also create multiple initiative turns for weapons that achieve multiple attacks per round, like bows and daggers, as well as by the class, level and proficiency of the character or any combination of the three as per the AD&D rules, including 3 attacks per 2 rounds, or 5 per 2 (more attacks on even-numbered rounds).  Also Fighter classes using 2 weapons are catered for, even with those weapons possibly having multiple attacks themselves – the weapon specified by the character as the Primary will achieve its multiple attacks, whereas the secondary weapon will only get 1 attack, as per the rules for multiple attacks.</p>
<h3>Multi-round Initiatives</h3>
<p>Multi-round initiatives are also supported e.g. for spells like Chant which takes 2 rounds.  Any Character Sheet entry that has a speed of longer than 10 segments (1/10ths of a round), when chosen by a player, will add an entry for that action not only in the current round but also in the following and subsequent rounds as appropriate.  Each new round, the Player of that character (or the DM for a Foe) is asked if they want to continue with the action or has it been interrupted: if interrupted or stopped by choice the player can choose another action for that character.</p>
<h3>Changing an Initiative Action</h3>
<p>If using ‘Group’ or ‘Individual’ initiative and a Player has completed selecting an initiative action for a Character (or the DM for a Foe) and changes their mind about what they are doing before the DM starts the round, the Player can select the token and rerun the relevant command (use the relevant token action button) to do initiative again (presuming the DM’s agreement).  The system will warn the Player that initiative has already been completed for the Character and present a new button to redo initiative if the Player wants to (this is so that accidental selection of the redo command is prevented) – all entries for the token name will be removed from the Turn Order and the relevant menus presented again to the Player.</p>
<p>Selecting any particular action for initiative does not force that to be the action the Player takes on their turn.  When that Character’s / NPC’s / creature’s turn comes up in the Turn Order, a message is displayed to all Players and the DM stating the action that was selected for initiative for that token.  The Player can then take that action, or do something else entirely (presumably with the DM’s agreement) for instance if circumstances have changed (e.g. the foe being attacked has died prior to an ‘Attack’ action).</p>
<h3>In Summary</h3>
<p>InitMaster manages the whole of this process seamlessly, and in addition will support actions that result in more than one Turn Order entry (such as firing a bow that can make two shots per round), automatically taking into account character class to allow two-weapon attack actions, supporting initiative for ‘dancing’ weapons (when used with the AttackMaster and MagicMaster APIs), and other complex aspects of initiative.</p>
<p>The easiest way to set up Character Sheets for InitMaster operation is by using the rest of the APIs in the Master series:</p>
<p>RoundMaster API is required for the operation of InitMaster.  It manages all aspects of interaction with the Turn Order Tracker window in Roll20, and the management of token statuses and Effects.</p>
<p>CommandMaster API will add the relevant DM Macro Bar buttons, and Token Action Buttons to a Character Sheets for all commands needed for each of the APIs.  It will also support initial setup and on-going maintenance of Weapon Proficiencies (including Specialisation & Mastery/Double Specialisation), Spell Books (both Wizard & Priest), and Powers (innate character/creature abilities, such as a Priest’s ability to Turn Undead, or a Vampire’s power to change to Gaseous Form).</p>
<p>MagicMaster API will support entering the correct data on the sheet for all sorts of weapons, magic items, spells and powers, through looting chests & bodies, learning & memorising spells and being granted powers.  It can also allow the DM & Players to enter the data through menus.  It also manages light sources for Characters, dynamically changing Token light settings as required (requires Roll20 Dynamic Lighting to be enabled).</p>
<p>AttackMaster API will use the data from MagicMaster to arm the character by taking weapons and/or shields ‘in hand’.  It will also support making attacks with all the relevant modifiers, changing the weapons in-hand, managing ammunition for ranged weapons, selecting the correct range for ranged weapons and applying the right modifiers, supporting magical weapons and artifacts, and also dealing with armour & armour classes.</p>
<p>Token setup for use with the Master series of APIs is simple (to almost non-existent) and explained in the Character Sheet Setup handout.</p>
