## StatusInfo

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin-k
* Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo
* Roll20 Wiki: https://wiki.roll20.net/Script:StatusInfo
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

```
LATEST UPDATE: It now allows you to create and edit conditions, export/import the config, and add/remove/toggle condition(s) to/from token(s), see below.
```

StatusInfo works nicely together with [Tokenmod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825) and my own [DeathTracker](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/DeathTracker) and [InspirationTracker](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/InspirationTracker) scripts.
It shows condition descriptions whenever a statusmarker is set or when the command `!condition` is used, eg: `!condition prone`.

![Prone Description](https://i.imgur.com/UpBHjVh.png "Prone Description")

### Commands

* **!condition help** - Shows the help menu.
* **!condition config** - Shows the config menu.
* **!condition** - Shows the condition menu, where you can easily toggle conditions on selected token(s). If you have (a) token(s) selected when you use this command it will show the current conditions.
* **!condition [CONDITION NAME]** - Shows the description of the condition entered.

* **!condition add [Condition Name(s)]** - Adds the condition(s) given to the selected token(s), eg. `!condition add prone paralyzed`.
* **!condition remove [Condition Name(s)]** - Removes the condition(s) given from the selected token(s).
* **!condition toggle [Condition Name(s)]** - Toggles the condition(s) given from the selected token(s).

* **!condition config export** - Exports the config (with conditions), also possible through the config menu.
* **!condition config import [Exported Content]** - Imports the config (with conditions), also possible through the config menu.

### Config
![Config](https://i.imgur.com/y9DlZB6.png "Config")

* **Command** - The command used by this script, eg. `!condition`.
* **Only to GM** - Send the condition info only to the gm.
* **Show on Status Change** - Send the condition info when the statusmarkers change.
* **Display icon in chat** - Shows the icon next to the condition title in the chat condition descriptions.
* **Conditions Config** - Configure the conditions you want to use.

![Config Conditions](https://i.imgur.com/Ssb4EcW.png "Config Conditions")
* **Change** - Change the condition settings.
* **Add Condition** - Add a new condition.

![Blinded Config](https://i.imgur.com/ENFgQmF.png "Blinded Config")
`Basic HTML is allowed in the description.`

### Default Statusmarkers
It uses the following condition/statusmarker list by default (but you can always change this in the code):

* Blinded, bleeding-eye
* Charmed, broken-heart
* Deafened, edge-crack
* Frightened, screaming
* Grappled, grab
* Invisibility, ninja-mask
* Incapacitated, interdiction
* Paralyzed, pummeled
* Petrified, frozen-orb
* Poisoned, chemical-bolt
* Prone, back-pain
* Restrained, fishing-net
* Stunned, fist
* Unconscious, sleepy

### Tokenmod Macro
I run this with the following Tokenmod macro:

```
!token-mod ?{Status|Concentrating, --set statusmarkers#!stopwatch|Readying, --set statusmarkers#!stopwatch|-, |Blinded, --set statusmarkers#!bleeding-eye --flip light_hassight|Charmed, --set statusmarkers#!broken-heart|Deafened, --set statusmarkers#!edge-crack|Frightened, --set statusmarkers#!screaming|Grappled, --set statusmarkers#!grab|Invisibility, --set statusmarkers#!ninja-mask|Incapacitated, --set statusmarkers#!interdiction|Paralyzed, --set statusmarkers#!pummeled|Petrified, --set statusmarkers#!frozen-orb|Poisoned, --set statusmarkers#!chemical-bolt|Prone, --set statusmarkers#!back-pain|Restrained, --set statusmarkers#!fishing-net|Stunned, --set statusmarkers#!fist|Unconscious, --set statusmarkers#!sleepy|-, |Blessed, --set statusmarkers#!angel-outfit|Raging, --set statusmarkers#!overdrive|Marked, --set statusmarkers#!archery-target|-, |Dead, --set statusmarkers#=dead|-, |Clear Conditions, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-dead|Clear All, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-angel-outfit#-overdrive#-blue#-stopwatch#-archery-target#-dead}
```

Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo

---

#### Changelog

* **v0.3.4 - 24-04-2018**
Fixed a "huge" bug that wouldn't send conditions to chat on statusmarker change.