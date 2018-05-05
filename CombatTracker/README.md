## CombatTracker

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin
* Roll20 Thread: https://app.roll20.net/forum/post/6349145/script-combattracker
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

![Turn](https://i.imgur.com/zKG0n9V.png "Turn")

CombatTracker will be a great help in battles. Easily keep tracks of who's turn it is, use a turn timer, let players progress to the next turn by themselves, adding/removing conditions, etc.
It has a lot of customizable configuration options.

### StatusInfo
If you use my [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/StatusInfo) script, it will also add the markers set there automatically to the selected token(s), and it will add a condition to this script if you manually (or through TokenMod/StatusInfo) set a marker that has a condition in StatusInfo.

![Token](https://i.imgur.com/Pbca4fn.png "Token")

### Commands
![Menu](https://i.imgur.com/HLi4wqp.png "Menu")

* **!ct** - Shows the CombatTracker menu.
* **!ct help** - Shows the help menu.
* **!ct config** - Shows the config menu.
* **!ct start** - Starts the combat, if you have tokens selected it will try to roll initiative for them and add them to the tracker.
* **!ct stop** - Stops the combat (closes the turntracker, removes the marker, clears the turnorder list, etc.).
* **!ct next** - Goes to the next turn (a player can also use this if it is his turn).
* **!ct add [condition name] [?duration]** - Adds a condition to the selected token(s) (duration is optionally (how much rounds.)).
* **!ct remove [condition name]** - Removes a condition from the selected token(s).
* **!ct reset conditions** - Resets all conditions.

### Config
![Config](https://i.imgur.com/BhoUdlH.png "Config")

* **Command** - The command used for this script, eg. !ct.
* **Ini. Attribute** - The initiative bonus attribute used in the character sheet that you are using, defaults to `initiative_bonus` used in the 5e OGL sheet.
* **Marker Img.** - Image (url) you want to use as a marker.
* **Stop on Close** - Stop the combat on turnorder close (removes the marker, clears the turnorder list, etc.).
* **Auto Roll Ini.** - If you want to autoroll (and add) the selected tokens' initiative when you start combat.

## Timer Config
![Timer Config](https://i.imgur.com/QZRKy6a.png "Timer Config")

* **Turn Timer** - If you want to use the timer.
* **Time** - The time per turn (in seconds).
* **Show in Chat** - Announce remaining time in chat at intervals.
* **Show on Token** - Show a timer above the current token.
* **Token Font** - The font used for the token timer.
* **Font Size** - The font size used for the token timer.

## Announcement Config
![Announcement Config](https://i.imgur.com/9WatbLp.png "Announcement Config")

* **Announce Turn** - Announces who's turn it is in chat.
* **Announce Round** - Announces the round in chat.
* **Announce Conditions** - If you don't announce the turn, you can choose to only announce conditions in chat.


Roll20 Thread: https://app.roll20.net/forum/post/6349145/script-combattracker

---

#### Changelog

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