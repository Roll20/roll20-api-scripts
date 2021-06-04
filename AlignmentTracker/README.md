## AlignmentTracker

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

With AlignmentTracker you can keep track of a players alignment. It makes a new handout with the characters name and a table inside.

![Alignment Table](https://i.imgur.com/XvffypE.png "Alignment Table")

### Commands

* **!alignment** - Shows the config menu.
* **!alignment config** - Shows the config menu.

* **!alignment create** - Creates the alignment table in a new handout (needs tokens selected).
* **!alignment change-alignment** - Changes the alignment (and table) of the selected token(s), eg. `!alignment change-alignment LG`.
* **!alignment change** - Change the alignment with numbers, eg. `!alignment change -2 3`.
* **!alignment get** - Shows the alignments of the selected token(s).

![Alignment List](https://i.imgur.com/j4Hsq9R.png "Alignment List")

### Config

![Alignment Config](https://i.imgur.com/xtaROrg.png "Alignment Config")

* **Command** - The command used for this script.
* **Attribute** - The alignment attribute, depends on which sheet you use.
* **Show Players** - Show the alignment handout to the corresponding player.

---

[![Become a Patron](https://c5.patreon.com/external/logo/become_a_patron_button.png "Become a Patron")](https://www.patreon.com/bePatron?u=10835266)

---

#### Changelog
**v0.1.2**
* Reordered the alignment table slightly.
* Added "Neutral" to the alignment possibilities.

**v0.1.1**
* Fixed a bug where a character with no alignment crashed the API.