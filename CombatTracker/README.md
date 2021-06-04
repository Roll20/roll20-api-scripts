## CombatTracker

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* My Discord Server: https://discord.gg/AcC9VME
* Roll20: https://app.roll20.net/users/1226016/robin
* Roll20 Thread: https://app.roll20.net/forum/post/6349145/script-combattracker
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

![Turn](https://i.imgur.com/rqfiZZD.png "Turn")

CombatTracker will be a great help in battles. Easily keep tracks of who's turn it is, use a turn timer, let players progress to the next turn by themselves, adding/removing conditions, etc.
It has a lot of customizable configuration options.

### StatusInfo
If you use my [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/StatusInfo) script, it will also add the markers set there automatically to the selected token(s), and it will add a condition to this script if you manually (or through TokenMod/StatusInfo) set a marker that has a condition in StatusInfo.

![Token](https://i.imgur.com/Pbca4fn.png "Token")

### Commands
![Menu](https://i.imgur.com/I1VJz91.png "Menu")

* **!ct** - Shows the CombatTracker menu.
* **!ct config** - Shows the config menu.
* **!ct favorites** - Shows the favorites menu.
* **!ct conditions** - Shows a list of known conditions from StatusInfo and favorites.
* **!ct show** - Shows a list of conditions on selected tokens.
* **!ct start** - Starts the combat, if you have tokens selected it will try to roll initiative for them and add them to the tracker.
* **!ct stop** - Stops the combat (closes the turntracker, removes the marker, clears the turnorder list, etc.).
* **!ct next** - Goes to the next turn (a player can also use this if it is his turn).
* **!ct prev** - Goes to the previous turn (gm only).
* **!ct add [condition name] [?duration] [?direction] [?message]** - Adds a condition to the selected token(s) (duration is optionally (how much rounds.)).
    * **[?duration]** - Optional duration, set `0` for no duration.
    * **[?direction]** - The direction per turn, eg. `-1`, `-3`, `+1`, `+3`.
    * **[?message]** - A message that will be visible.
* **!ct remove [condition name]** - Removes a condition from the selected token(s).
* **!ct reset conditions** - Resets all conditions.
* **!ct st** - Stops the timer for this turn.
* **!ct pt** - Pause timer toggle for this turn.

### Conditions

![Show](https://i.imgur.com/02XejFv.png "Show")

#### Commands
* **!ct conditions** - Shows a list of known conditions from StatusInfo and favorites.
* **!ct show** - Shows a list of conditions on selected tokens.
* **!ct add [condition name] [?duration] [?direction] [?message]** - Adds a condition to the selected token(s) (duration is optionally (how much rounds.)).
    * **[?duration]** - Optional duration, set `0` for no duration.
    * **[?direction]** - The direction per turn, eg. `-1`, `-3`, `+1`, `+3`.
    * **[?message]** - A message that will be visible.
* **!ct remove [condition name]** - Removes a condition from the selected token(s).
* **!ct reset conditions** - Resets all conditions.

![Known Conditions](https://i.imgur.com/2lJxMOi.png "Known Conditions")

### Favorites
![Favorites](https://i.imgur.com/nQqPpNJ.png "Favorites")

Here you can create, add and edit favorite conditions. By clicking on the name it will be added to the selected token(s).
* **Name** - The name of the condition.
* **Duration** - How long the condition lasts (0 for no duration).
* **Direction** - The direction the duration will go to, eg. `-1`, `-3`, `+1`, `+3`.
* **Message** - A small message that will be visible when it's the characters turn.

![Edit Condition1](https://i.imgur.com/4qX4U3P.png "Edit Condition1")
![Edit Condition2](https://i.imgur.com/u2HYbtz.png "Edit Condition2")

### Config
![Config](https://i.imgur.com/C16pRgV.png "Config")

* **Command** - The command used for this script, eg. !ct.
* **Ini. Attribute** - The initiative bonus attribute used in the character sheet that you are using, defaults to `initiative_bonus` used in the 5e OGL sheet.
* **Marker Img.** - Image (url) you want to use as a marker.
* **Stop on Close** - Stop the combat on turnorder close (removes the marker, clears the turnorder list, etc.).
* **Auto Pull Map** - If you want to pull the page to the token (same as `shift + hold left click`). Works only for the GM due to API limitations.

## Turnorder Config
![Turnorder Config](https://i.imgur.com/40s1DxS.png "Turnorder Config")

* **Auto Roll Ini.** - If you want to autoroll (and add) the selected tokens' initiative when you start combat.
* **Reroll Ini. p. Round** - Reroll initiative on every round.
* **Auto Sort** - Toggle the auto sorting of the turnorder.
* **Skip Custom Items** - Automatically skip custom items in the tracker.

## Timer Config
![Timer Config](https://i.imgur.com/dMvjkoO.png "Timer Config")

* **Turn Timer** - If you want to use the timer.
* **Time** - The time per turn (in seconds).
* **Auto Skip** - Toggle if we should auto skip the turn when the timer hits zero.
* **Show in Chat** - Announce remaining time in chat at intervals.
* **Show on Token** - Show a timer above the current token.
* **Token Font** - The font used for the token timer.
* **Font Size** - The font size used for the token timer.

## Announcement Config
![Announcement Config](https://i.imgur.com/DIL89VN.png "Announcement Config")

* **Announce Turn** - Announces who's turn it is in chat.
* **Announce Round** - Announces the round in chat.
* **Announce Conditions** - If you don't announce the turn, you can choose to only announce conditions in chat.
* **Shorten Long Name** - If you want to shorten a long name in chat.
* **Use FX** - If you want to use some special effect with the turn change.
    * **FX Type** - The name-color of the FX you want to use, for custom FX use the id.

## Macro Config
![Macro Config](https://i.imgur.com/dI74TaC.png "Macro Config")

_The macro (ability) should be in the characters abilities tab._

![Abilities Example](https://i.imgur.com/PkXtrMi.png "Abilities Example")

* **Run Macro** - Toggle if we should run the macro on a characters turn.
* **Macro Name** - The name of the macro.


Roll20 Thread: https://app.roll20.net/forum/post/6349145/script-combattracker

---

[![Become a Patron](https://c5.patreon.com/external/logo/become_a_patron_button.png "Become a Patron")](https://www.patreon.com/bePatron?u=10835266)

---

#### Changelog
**v0.2.5**
* Fixed a "bug" where the marker wouldn't show on the first turn when initiative is not rolled with CT.
* Toggle auto skip turn when timer runs out.
* Optionally show auto initiative roll in chat.
* !ct next bugfix.

**v0.2.4**
* Changed config menu, turnorder settings now in seperate menu.
* Optionally run a character macro (ability) on the characters turn.
* Optionally turn off auto sorting turnorder.
* Optionally reroll initiative every round.
* FX will now not show when a token is on the gmlayer.

**v0.2.3**
* Optionally whisper turns to gm.
* Bugfix where StatusInfo conditions got the same duration.

**v0.2.2**
* Optionally skip custom items.
* Improved condition show menu, with button to show custom messages or StatusInfo descriptions.

**v0.2.1**
* Some fixes and improvements by The Aaron
* Bugfixes

**v0.2.0**
* Optionally auto Pull (Works only for DM due to API limitations)
* Optionally use FX on turn change.
* Fixed condition round counter.
* Logical shit & bugfixes.

**v0.1.13**
* Bugfixes

**v0.1.12**
* Show a list of conditions on selected tokens, `!ct show`.
* Show a list of known conditions (from StatusInfo and favorites), `!ct conditions`.

**v0.1.11**
* !ct menu expanded.
* Players can see Round number now.
* Save and use favorite conditions.
* Possibility to add a custom message to a condition.
* Possibility to add a direction to the duration of a condition, eg. `+1`, `+3`, `-1`, `-3`.
* Possibility to pause the timer, `!ct pt` will toggle the pause. There also is a button in the menu, `!ct menu` or `!ct`.
* Possibility to shorten a long name in the chat announcements.
* Possibility to go to the previous turn.
* Fixed initiative attribute config option.

**v0.1.10**
* Fixed a bug were conditions with StatusInfo support didn't get the duration provided (needs StatusInfo update to).
* Fixed a bug were selecting tokens by dragging caused an error.
* Some small fixes.

**v0.1.9 - 02-05-2018**
* Good connection with [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/StatusInfo)
* Add/remove conditions.
* Whisper hidden turns to gm.
* Better initiative calculations.
* Changed config menu.
* Changed some styling.
* Bugfixes

**v0.1.4 - 27-04-2018**
* Fixed a bug were manually going further in the turnorder list didn't work.
* Added the option to stop combat on turnorder list close.