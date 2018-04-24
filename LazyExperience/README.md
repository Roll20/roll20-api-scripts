## LazyExperience

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin-k
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://www.patreon.com/robinkuiper

---

LazyExperience is a script to record experience during a game (the idea comes from [EasyExperience](https://app.roll20.net/forum/post/3309609/script-easy-experience/?pageforid=3506293#post-3506293)).
Biggest difference is that it has an option to reward experience directly, and keeps track on statusmarker changes on tokens.

### Config

The first time you add this script you get a first time config menu in chat.

![Config Menu](https://i.imgur.com/sx8JMgU.png "Config Menu")

* **Command** - The command you want to use with this script, eg. !xp.
* **Marker** - The `dead` marker you want to use to give an option to reward experience when something dies.
* **Player XP Attribute** - The player's experience attribute in the sheet you are using, this is defaulted to the 5e OGL sheet (experience).
* **NPC XP Attribute** - The npc's experience attribute in the sheet you are using, this is defaulted to the 5e OGL sheet (npc_xp).
* **Extra Players** - This can be used to add to the experience divisors (eg. for npc under no one's control, etc).
* **Give XP Instant** - If you want to instantly give experience to the players when you reward it, otherwise it will be rewarded at the end of the session.
* **Update Sheets** - If you want to update the characters sheets when experience is rewarded.
* **Refresh Players** - Refresh the player list (eg. when a new player joins or someone leaves).
* **Reset Experience** - Resets the experience back to 0.
* **Reset Config** - Resets the config options to default.

#### Player Config
![Player Config](https://i.imgur.com/1ldnSc2.png "Player Config")

* **Active Toggles** - Sets the player/character active (or not). A player/character who is not active will not be rewarded xp at the end of the session and will not be in the LazyExperience menu list.
* **Add Experience** - Reward experience to (one of) the player's character(s).
* **Back** - Back to the config menu.
* **Remove** - Removes the player entirely from the LazyExperience config.

### Commands

* **!xp help** - Shows the help menu.
* **!xp config** - Shows the config menu.
* **!xp menu** - Shows the LazyExperience menu (more below).
* **!xp add session [XP]** - Adds (or gives if you want to give instantly) experience to the session experience threshold, where [XP] is the amount of experience.
* **!xp add [characterid] [XP]** - Adds (or gives if you want to give instantly) experience to the character experience threshold, where [characterid] is the character's id and [XP] is the amount of experience.
* **!xp end** - Ends the session, reset experience, and rewards experience to the players (if you didn't reward it instantly).

#### LazyExperience Menu
![Menu](https://i.imgur.com/2EwXsCf.png "Menu")

This menu shows the current experience in the session threshold. It also show the amount it will be divised with when rewarded.
A list of active players with there active characters is also shown here, and experience can be rewarded.

#### Statusmarker Dead
![Dead](https://i.imgur.com/5bpZgHj.png "Dead")

When a token is given the statusmarker you have set up in the config (`dead` by default), you will get the question if you want to add the experience to the session experience threshold.
This works great with [TokenMod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825) statusmarker changes and with my [DeathTracker](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/DeathTracker) script.

Roll20 Thread: https://app.roll20.net/forum/post/6275681/script-lazyexperience/?pageforid=6275681#post-6275681