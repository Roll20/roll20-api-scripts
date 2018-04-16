## StatusInfo

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin-k
* Reddit: https://www.reddit.com/user/robinkuiper/

---

StatusInfo works nicely together with [Tokenmod](https://app.roll20.net/forum/post/4225825/script-update-tokenmod-an-interface-to-adjusting-properties-of-a-token-from-a-macro-or-the-chat-area/?pageforid=4225825#post-4225825) and my own [DeathTracker](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/DeathTracker) script.
It shows condition descriptions whenever a statusmarker is set or when the command `!condition` is used, eg: `!condition prone`.

![Prone Description](https://i.imgur.com/UpBHjVh.png "Prone Description")

### Commands

* **!condition help** - Shows the help menu.
* **!condition config** - Shows the config menu.
* **!condition [CONDITION NAME]** - Shows the description of the condition entered.

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

I run this with the following Tokenmod macro:

```
!token-mod ?{Status|Concentrating, --set statusmarkers#!blue|Readying, --set statusmarkers#!stopwatch|-, |Blinded, --set statusmarkers#!bleeding-eye --flip light_hassight|Charmed, --set statusmarkers#!broken-heart|Deafened, --set statusmarkers#!edge-crack|Frightened, --set statusmarkers#!screaming|Grappled, --set statusmarkers#!grab|Invisibility, --set statusmarkers#!ninja-mask|Incapacitated, --set statusmarkers#!interdiction|Paralyzed, --set statusmarkers#!pummeled|Petrified, --set statusmarkers#!frozen-orb|Poisoned, --set statusmarkers#!chemical-bolt|Prone, --set statusmarkers#!back-pain|Restrained, --set statusmarkers#!fishing-net|Stunned, --set statusmarkers#!fist|Unconscious, --set statusmarkers#!sleepy|-, |Blessed, --set statusmarkers#!angel-outfit|Raging, --set statusmarkers#!overdrive|Marked, --set statusmarkers#!archery-target|-, |Dead, --set statusmarkers#=dead|-, |Clear Conditions, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-dead|Clear All, --set statusmarkers#-bleeding-eye#-broken-heart#-edge-crack#-screaming#-grab#-pummeled#-aura#-chemical-bolt#-back-pain#-fishing-net#-fist#-frozen-orb#-interdiction#-sleepy#-ninja-mask#-angel-outfit#-overdrive#-blue#-stopwatch#-archery-target#-dead}
```

Roll20 Thread: https://app.roll20.net/forum/post/6252784/script-statusinfo