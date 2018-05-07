## Treasure

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

Just a simple script to generate a treasure in chat with the DnD 5e Dungeon Master Guide random treasure rules.

![Treasure](https://i.imgur.com/cMIDRJb.png "Treasure")

### Commands

* **!treasure config** - Shows the config menu.
* **!treasure [?type] [cr] [?amount]** - This will generate the treasure. See some examples below.
* **!treasure s [?type]** - Will create a treasure from the tokens selected.

#### Examples
![T2](https://i.imgur.com/O2cgHcW.png "T2")

* **!treasure 5** - Will generate a `individual` for 1 CR 5 creature.
* **!treasure individual 5** - Same as above.
* **!treasure 3 5** - Will generate an `individual` treasure for 5 CR 3 creatures.
* **!treasure hoard 3** - Will generate a CR 3 `hoard` treasure.
* **!treasure s** - Will generate an individual treasure from a combination of the challenge ratings of the selected tokens.
* **!treasure s individual** - Same as above.
* **!treasure s hoard** - Will creature a treasure hoard from the average of the selected token(s) challenge ratings.

### Config
![Config](https://i.imgur.com/IbRgwJA.png "Config")

* **Command** - The command you want to use for this script.
* **CR Attribute** - The CR attribute in the sheet you are using, defaulted to `5e OGL`.
* **Treasure Target** - Send treasure to everyone or only GM.
* **Magic Items Target** - Send magic items to everyone or only GM.

![TR](https://i.imgur.com/hjz2Trx.png "TR")

##### Credits
[Jeff Bennet](https://github.com/jfflbnntt) - The table idea.

---

#### Changelog
**0.1.6**
* Create treasure from selected tokens.

**0.1.5**
* Show last hidden treasure in normal chat.
* Change normal treasure and magic item treasure targets (to everyone or to gm).

**0.1.4**
* Fixed a bug were currency value where the same everytime.
* Added values to gems and arts.
* Fixed a bug where magic item tables weren't calculated correctly.
