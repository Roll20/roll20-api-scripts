<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">
<span style="font-weight: bold; font-size: 125%">AttackMaster v3.024</span>
</div>
<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">
<h1>RoundMaster API for Roll20</h1>
<p>RoundMaster is an API for the Roll20 RPG-DS.  Its purpose is to extend the functionality of the Turn Tracker capability already built in to Roll20.  It is one of several other similar APIs available on the platform that support the Turn Tracker and manage token and character statuses related to the passing of time: the USP of this one is the full richness of its functionality and the degree of user testing that has occurred over a 12 month period.</p>
<p>RoundMaster is based on the much older TrackerJacker API, and many thanks to Ken L. for creating TrackerJacker.  However, roundMaster is a considerable fix and extension to TrackerJacker, suited to many different applications in many different RPG scenarios.  RoundMaster is also the first release as part of the wider RPGMaster series of APIs for Roll20, composed of <b>RoundMaster, CommandMaster, InitiativeMaster, AttackMaster, MagicMaster</b> and <b>MoneyMaster</b> - other than RoundMaster (which is generic) these initially support only the AD&D2e RPG.</p>
<p><b><u>Note:</u></b> For some aspects of the APIs to work, the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs listed above.  This will provide the most immersive game-support environment</p>
<h2>Syntax of RoundMaster calls</h2>
<p>The roundMaster API is called using !rounds, though it reveals its history in that it can also be called using !tj (the command for the TrackerJacker API roundMaster is based on).</p>
<pre>!rounds --start<br>
!tj --start</pre>
<p>Commands to be sent to the roundMaster API must be preceeded by two hyphens ‘--’ as above for the --start command.  Parameters to these commands are separated by vertical bars ‘|’, for example:</p>
<pre>!rounds --addtotracker name|tokenID|3|all|sleeping|sleepy</pre>
<p>If optional parameters are not to be included, but subsequent parameters are needed, use two vertical bars together with nothing between them, e.g.</p>
<pre>!rounds --addtotracker name|tokenID|3|all||sleepy</pre>
<p>Commands can be stacked in the call, for example:</p>
<pre>!rounds --start --addtotracker name|tokenID|3|all|sleeping|sleepy --sort</pre>
<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash ‘/’, meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash ‘/’ is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>
<br>
<h2>Command Index</h2>
<h3>1.	Tracker commands</h3>
<pre>--start<br>
--stop<br>
--pause<br>
--reset [number]<br>
--sort<br>
--clear<br>
--clearonround [OFF/ON]<br>
--clearonclose [OFF/ON]<br>
--sortorder [NOSORT/ATOZ/ZTOA/DESCENDING/ASCENDING]<br>
--addToTracker name|tokenID/-1|priority|[qualifier]|[message]|[detail]<br>
--removefromtracker name|tokenID/-1|[retain]</pre>
<h3>2.	Token Status Marker commands</h3>
<pre>--addstatus status|duration|direction|[message]|[marker]<br>
--addtargetstatus tokenID|status|duration|direction|[message]|[marker]<br>
--edit<br>
--target CASTER|casterID|status|duration|direction|[message]|[marker]<br>
--target SINGLE/AREA|casterID|targetID|status|duration|direction|[message]|[marker]<br>
--aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]<br>
--clean<br>
--removestatus status(es)<br>
--deletestatus statuses<br>
--deltargetstatus tokenID|statuses<br>
--movestatus<br>
--s_marker<br>
--disptokenconfig tokenID<br>
--listfav</pre>
<h3>3.	Other commands</h3>
<pre>–help<br>
–hsq from|[command]<br>
–handshake from|[command]<br>
--debug (ON/OFF)</pre>
<br>
<h2>1.	Tracker Command detail</h2>
<pre>!rounds --start</pre>
<p>This command alternates between starting the automatic functions of the Turn Tracker, and pausing the Tracker.  In its started state, the tracker will follow the current token at the top of the tracker with a highlight graphic, report the token’s turn to all players, and follow the options selected for ‘sortorder’ and ‘clearonround’.  When paused, the Tracker will not highlight the top token, report turns or execute the options.</p>
<pre>!rounds --stop</pre>
<p>Stops the tracker and removes all statuses and status markers from tokens currently held by roundMaster.  This also dumps the tables held in the campaign status object.  It is useful if you want to start a fresh version of a campaign, or if everything goes wrong.</p>
<pre>!rounds --pause</pre>
<p>Pauses the Turn Tracker in its current state without deleting any information, and is the same as using the --start command again having already called it once.  The Turn Tracker can still be moved on, cleared, sorted, and reset, but the highlight graphic is paused.  It can be restarted using --start</p>
<pre>!rounds --reset [number]</pre>
<p>Sets the round in the Turn Order to the number, or to 1 if number is not provided.</p>
<pre>!rounds --sort</pre>
<p>Sorts the Turn Tracker entries according to the previously set sort order, with the default being ascending numeric priority.</p>
<pre>!rounds --clear</pre>
<p>Clears all entries in the Turn Tracker without stopping it.</p>
<pre>!rounds --clearonround [OFF/ON]</pre>
<p>Sets the ‘clear on round’ option.  If set, this option means that when the Tracker is running and reaches the end of the round, all entries in the Turn Tracker are automatically removed ready for players to do initiative for the next round.  Otherwise, the Turn Tracker is not cleared automatically at any point.  Any parameter other than ‘off’ turns clearonround on.  Default on.</p>
<pre>!rounds --clearonclose [OFF/ON]</pre>
<p>Sets the ‘clear on close’ option.  If set, this option means that when the Tracker window is closed, the Turn Tracker is cleared.  Any parameter other than ‘on’ turns clear on close off.  Default off.</p>
<pre>!rounds --sortorder [NOSORT/ATOZ/ZTOA/DESCENDING/ASCENDING]</pre>
<p>This command sets the automatic sort order of the entries in the Turn Tracker.  The Turn Tracker is automatically sorted at the beginning of each round as the Turn Tracker is moved on to the first entry, based on the order set by this option.  Descending and Ascending are numeric sorts based on the Priority number of each entry.  AtoZ and ZtoA are alphabetic sorts based on the name of each entry in the Turn Tracker.  Nosort will mean that no sorting takes place, and the order remains the order in which the entries were made.  The default order is Ascending.</p>
<pre>!rounds --addToTracker name|tokenID/-1|priority|[qualifier]|[message]|[detail]</pre>
<p>This command adds an entry to the TurnTracker.  tokenID can either be the ID of a valid token, or -1 to create a custom entry.  If a custom entry, name is used for the entry in the Turn Tracker with the provided priority, otherwise the token name is used for the entry with the provided priority.  The qualifier can be one of first/last/smallest/largest/all.</p>
<ul><li>First keeps only the first entry made for that name (for custom entries) or token and removes any others, but leaves all entries for other tokens and names in the Tracker</li>
<li>Last keeps only the latest entry for that token or name (i.e. the one now being set)</li>
<li>Smallest keeps only the entry with the lowest numeric priority for that token or name</li>
<li>Largest keeps only the entry with the highest numeric priority for that token or name</li>
<li>All keeps all entries in the list and adds this one to those for that token or name, meaning that the Turn Tracker can have multiple entries for one or more tokens or names</li></ul>
<p>The optional message will be displayed on the turn announcement for this turn when it is reached in the Turn Order.  Generally, the message relates what the player said the character was doing for their initiative.  The optional detail can be the detail of how the initiative priority was calculated or any other additional message you want to show to the Player only when the command is processed.</p>
<p>By using the name, tokenID/-1 and qualifier parameters judiciously, group initiative, individual initiative, or any combination of other types can be created.  When used with the InitiativeMaster API, Players get menus of actions they can take (based on their weapons, powers, memorised spells, magic items, thieving skills etc) which manage the calls to RoundMaster for the desired initiative type, and the DM gets menus to control all RoundMaster functions, and to set the type of initiative to undertake.</p>
<pre>!rounds --removefromtracker name|tokenID/-1|[retain]</pre>
<p>This command removes entries from the Turn Tracker for the specified tokenID or name.  However, if the optional retain number is given, it will retain this number of entries for the specified token or name, and only remove any beyond this number.  The earliest entries made are kept when the retain parameter is set.</p>
<pre>!rounds --viewer on/off/all/tokenID</pre>
<p>This command controls the viewer mode setting for the Player who calls it.  Rather than showing what that Player’s characters can see when Dynamic Lighting is turned on, viewer mode shows that Player what each player-character (even if not theirs) can see as their token reaches the top of the Turn Tracker and it is their turn.  Quite often, this can be a Player ID set up just to be a viewer e.g. for a DM view of what players can see, or for a touchscreen playing surface. The current player-character is defined as the token representing a character sheet controlled by any Player at the top of the Turn Tracker.  As each new token comes to the top of the Turn Tracker, if it is a player-character the display changes to only what it can see.  If it is a token representing an NPC, or when the Turn Order reaches the next round and clears, the map for the Player reverts to showing what all player-characters can see (but not what NPCs can see).</p>
<p>The on option turns on viewer mode for the Player, and off turns it off.  The all option immediately turns on vision for all player-characters, and passing a tokenID as a parameter shows vision for that token (even if it represents an NPC).  Options off, all and tokenID can be used by any Player or the DM to affect the viewer Player’s screen.</p>
<br>
<h2>2.	Token Status Marker commands</h2>
<pre>!rounds --addstatus status|duration|direction|[message]|[marker]</pre>
<p>Adds a status and a marker for that status to the currently selected token(s).  The status has the name given in the status parameter and will be given the duration specified, which will be changed by direction each round.  Thus setting a duration of 8 and direction of -1 will decrement the duration by 1 each round.  If the duration gets to 0 the status and token marker will be removed automatically.  direction can be any number - including a positive one meaning duration will increase.  Each Turn Announcement for the turn of a token with one or more statuses will display the status, the duration and direction, and the message, if specified.  The specified marker (from the default token marker set) will be applied to the token - if it is not specified the option will be given to pick one from a menu in the chat window (which can be declined).</p>
<p>For player-characters, when the duration reaches 9 or less the duration will be counted-down by a number appearing on the marker.  For NPCs this number does not appear (so that Players don’t see the remaining duration for statuses on NPCs), but the remaining duration does appear for DM only on the status message below the Turn Announcement on the NPCs turn.</p>
<p>If a Player other than the DM uses this command, the DM will be asked to confirm the setting of the status and marker.  This allows the DM to make any decisions on effectiveness.</p>
<p>If an Effects database of effect macros exists within the campaign (a character sheet with the name Effects-DB, with Ability Macros named the same as the status status parameter set for markers) the Effects database will be searched in three ways: when a status marker is set, any Ability Macro with the name status-start (where status is the status name specified in the command) is run.  Each round when it is the turn of a token with the status marker set, the Ability Macro with the name status-turn is run.  And when the status ends (duration reaches 0) or the status is removed using --removestatus, or the token has the Dead marker set or is deleted, an Ability Macro with the name status-end is run.  See the Effects database documentation for full information on effect macros and the options and parameters that can be used in them.</p>
<pre>!rounds --addtargetstatus tokenID|status|duration|direction|[message]|[marker]</pre>
<p>This command is identical to addstatus, except for the addition of a tokenID.  Instead of using a selected token or tokens to apply the status to, this applies the status to the specified token.</p>
<pre>!rounds --edit</pre>
<p>This command brings up a menu in the chat window showing the current status(es) set on the selected token(s), with the ability to remove or edit them.  Against each named status, a spanner icon opens another menu to edit the selected status name, duration, direction, message and marker on all the selected token(s), and also allows this status to be set as a favourite.  A bin icon will remove the status from all the selected token(s), and run any status-end macros, if any.</p>
<pre>!rounds --target CASTER|casterID|status|duration|direction|[message]|[marker]<br>
!rounds --target SINGLE/AREA|casterID|targetID|status|duration|direction|[message]|[marker]</pre>
<p>This command targets a status on a token or a series of tokens.  If a version using CASTER is called, it acts identically to the addtargetstatus command, using the casterID as the target token.  If the SINGLE version is called, the targetID is used.  If the AREA version is used, after applying the status to the targetID token, the system asks in the chat window if the status is to be applied to another target and, if confirmed, asks for the next target to be selected, repeating this process after each targeting and application.  In each case, it applies the status, effect macro and marker to the specified token(s) in the same way as addtargetstatus.</p>
<pre>!rounds --aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]</pre>
<table>
	<tr><th scope="row">shape</th><td>[BOLT/ CIRCLE/ CONE/ ELLIPSE/ RECTANGLE/ SQUARE/ WALL]</td></tr>
	<tr><th scope="row">units</th><td>[SQUARES/ FEET/ YARDS/ UNITS]</td></tr>
	<tr><th scope="row">image</th><td>[ACID/ COLD/ DARK/ FIRE/ LIGHT/ LIGHTNING/ MAGIC/ RED/ YELLOW/ BLUE/ GREEN/ MAGENTA/ CYAN/ WHITE/ BLACK]</td></tr>
	<tr><th scope="row">confirmed</th><td>[TRUE / FALSE]</td></tr>
	<tr><th scope="row">range, length & width</th><td>numbers specified in whatever unit was specified as [units]</td></tr>
</table>
<p>This command displays an Area of Effect for an action that has or is to occur, such as a spell.  This quite often can be used before the --target area command to identify targets.  The system will present lists of options for each parameter that is not specified for the Player to select.  On executing this command, if the range is not zero the Player will be given a crosshair to position the effect, and if the range is zero the effect will be centred on the Token (or at its “finger-tips” for directional effects like cones).  The range of the effect will be centred on the TokenID specified and will be displayed as a coloured circle - the crosshair should be positioned within this area (the system does not check).  The Crosshair (or if range is zero, the Token) can be turned to affect the direction of the effect. The effect ‘direction’ will be the direction the token/crosshair is facing.  If Confirmed is false or omitted, the Player will be asked to confirm the positioning of the token/crosshair with a button in the chat window (setting it to true will apply the effect immediately - good for range zero circular effects (i.e. don’t need placing or direction setting).  The effect can have one of the shapes listed:</p>
<ul><li>Bolt is a long rectangle extending away from the crosshair/token for length, and width wide.</li>
<li>Circle is a circle centred on the crosshair/token of diameter length.</li>
<li>Cone is a cone starting at the crosshair/token of length, with an end width.</li>
<li>Ellipse is an ellipse of length extending away, and width wide.</li>
<li>Rectangle is a rectangle of length extending away, and width wide.</li>
<li>Square is a square of sides length parallel with the direction the crosshair/token.</li>
<li>Wall is a rectangle perpendicular to the crosshair or token, i.e. width away and length wide.</li></ul>
<p>For the units, Feet & Yards are obvious and are scaled to the map.  Squares are map squares (whatever scale they are set to), and Units are the map scale units and are not scaled.</p>
<p>Images are set with transparency and sent to the back of the Object layer.  Red/ Yellow/ Blue/ Green/ Magenta/ Cyan/ White/ Black colour the effect area the specified colour, and Acid/ Cold/ Dark/ Fire/ Light/ Lightning/ Magic use textured fills.</p>
<pre>!rounds --clean</pre>
<p>Drops all the status markers on the selected token(s), without removing the status(es) from the campaign status object, meaning live statuses will be rebuilt at the end of the round or the next trigger event.  This deals with situations where token markers have become corrupted for some reason, and should not be needed very often.</p>
<pre>!rounds --removestatus status(es)</pre>
<p>Removes the status, or comma-delimited list of statuses, and their status marker(s) from the selected token(s), and runs any associated status-end Ability Macros in any existing Effects database in the campaign.  See addstatus command and the Effect database documentation for details on effect macros.  Statuses can be ‘all’ which will remove all statuses from the selected token(s).</p>
<pre>!rounds --deletestatus statuses</pre>
<p>Removes the status, or comma-delimited list of statuses, and status marker(s) from the selected token(s), but does not run any associated status-end Ability Macros in any existing Effects database in the campaign.  Statuses can be ‘all’ which will delete all statuses from the selected token(s).</p>
<pre>!rounds --deltargetstatus tokenID|statuses</pre>
<p>Works the same as deletestatus command, except only on the specified tokenID rather than selected tokens.</p>
<pre>!rounds --movestatus</pre>
<p>For each of the selected tokens in turn, searches for tokens in the whole campaign with the same name and representing the same character sheet, and moves all existing statuses and markers from all the found tokens to the selected token (removing any duplicates).  This supports Players moving from one Roll20 map to another and, indeed, roundMaster detects page changes and automatically runs this command for all tokens on the new page controlled by the Players who have moved to the new page.</p>
<pre>!rounds --s_marker</pre>
<p>Shows a display of all markers available in the API to the DM, and also lists which are currently in use.</p>
<pre>!rounds --disptokenconfig tokenID</pre>
<p>Shows the statuses on the specified token to the DM using the same display format as used in the Turn Announcement.</p>
<pre>!rounds --listfav</pre>
<p>Shows statuses to the DM that have been defined as favourites (see the edit command), and provides buttons to allow the DM to apply one or more favourite statuses to the selected token(s), and to edit the favourite statuses or remove them as favourites.</p>
<h2>3.	Other commands</h2>
<pre>!rounds –help</pre>
<p>Displays a listing of RoundMaster commands and their syntax.</p>
<pre>!rounds –hsq from|[command]<br>
!rounds –handshake from|[command]</pre>
<p>Either form performs a handshake with another API, whose call (without the ‘!’) is specified as from in the command parameters.  The command calls the from API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>
Received:	!rounds –hsq magic
Response:	!magic –hsr rounds
<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the command string parameter is added, where command is the RoundMaster command (the ‘--’ text without the ‘--‘).  This will respond with a true/false response: e.g.</p>
Received:	!rounds –hsq init|addtotraker
Response:	!init –hsr rounds|addtotracker|true
<pre>!rounds --debug (ON/OFF)</pre>
<p>Takes one mandatory argument which should be ON or OFF.</p>
<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player – so the DM or a technical advisor can play as a Player and see the debugging messages.</p>
<h2>How to use RoundMaster</h2>
<h3>Who uses RoundMaster calls?</h3>
<p>The vast majority of RoundMaster calls are designed for the DM/GM to use, or to be called from RPGMaster APIs and database macros, rather than being called by the Player directly.  RoundMaster should be hidden from the Players in most circumstances.  It is highly recommended that RoundMaster is used with the other RPGMaster APIs, but especially InitiativeMaster API which uses RoundMaster to create and manage entries in the Roll20 Turn Order Tracker.</p>
<h3>Managing the Turn Order Tracker</h3>
<p>If the InitiativeMaster API is used, it must be accompanied by RoundMaster – it will not work otherwise.  InitiativeMaster provides many menu-driven and data-driven means of controlling RoundMaster, making it far easier for the DM to run their campaign.  The InitiativeMaster --maint command supports the necessary calls to RoundMaster for control of the Turn Order Tracker, and its --menu command uses the data on the Character Sheet to create Turn Order initiative entries with the correct speeds and adjustments.  See the InitiativeMaster API Handout for more information.</p>
<h3>Adding and managing Token Statuses</h3>
<p>The Token status management functions allow the application and management of status markers with durations in rounds passed to tokens.  The easiest way to use status markers is to use the MagicMaster API which runs spell and magic item macros the Player can initiate, which in turn ally the right status markers and statuses with the appropriate durations to the relevant tokens.  See the MagicMaster API handout for more information.</p>
<h3>Status Effects</h3>
<p>RoundMaster comes with a number of status ‘effects’: Roll20 Ability Macros that are automatically run when certain matching statuses are applied to, exist on, and/or removed from a token.  These macros can use commands (typically using APIs like ChatSetAttr API and/or Tokenmod API from the Roll20 API Script Library) to temporarily or permanently alter the characteristics of the Token or the represented Character Sheet, thus impacting the state of play.</p>
<p>If used with the MagicMaster API, its pre-configured databases of spell and magic item macros work well with the Effect macros provided in the Effects Database provided with this API.</p>
<p>For full information on Status Effects, how to use them, and how to add more of your own, see the separate Effects Database handout.</p>
<h3>Token Death and Removal</h3>
<p>If a token is marked as Dead by using the Dead status marker (either via the Roll20 token emoticon menu or any other means), the system will automatically end all statuses, remove all status markers and run all status-end effect macros (if any) for the token.</p>
<p>If a token is deleted on a map and not previously marked as Dead, the API will search for any other token in the Campaign (with a preference to one on the current page) with the same name and representing the same character, and if found the API will transfer all statuses and status markers to the first token found (even if not on the current page).  If no such token is found, all statuses and status markers are removed from the token being deleted, and any corresponding status-end effect macros are run.</p>
<h3>Page Change and Adding Tokens</h3>
<p>If a Player, or all Players, are moved to another Roll20 page in the campaign (i.e. a different map), the API will automatically migrate all current statuses and status markers from the previous page (and all other pages in the Campaign, to support where tokens have come from different pages) to any token on the new page with the same Token Name and representing the same Character.  These statuses and their effects will then continue to apply on the new page for their set durations.</p>
<p>If a token is added to the current map the Players are on, either by dragging a character onto the map or by dragging on a picture and editing its properties to give it a name and optionally a representation, the API will again search for tokens with the same name and representing the same character, and move statuses and markers to the new token.</p>
<p>Of course, either before or after each of these situations, the --edit command can be used to change or remove statuses from any token(s).</p>

