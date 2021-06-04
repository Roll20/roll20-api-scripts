## InspirationTracker

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

InspirationTracker keeps track of inspiration and adds a statusmarker to the characters token(s). You can also easily toggle inspiration with the command `!inspiration` when you have token(s) selected.
Works great with my [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts/tree/master/StatusInfo) script.

Adding the selected statusmarker manually or through TokenMod will also handle inspiration on the sheet.

### Commands

* **!inspiration** - Toggles inspiration on the selected token(s), or shows the config menu when nothing is selected.
* **!inspiration config** - Shows the config menu.

### Config
[Config Menu](https://i.imgur.com/E4W9Gkc.png "Config Menu")

* **Command** - The command uou want to use for this script.
* **Statusmarker** - The statusmarker you want to use to show inspiration.
* **Special Effect** - If you want to use a special effect when the character gets inspiration.
* **Special Effect Type** - The type of the effect you want, see below.

#### Special Effects
[FX](https://i.imgur.com/wt6SvCc.png "FX")

This comes directly from the Roll20 API wiki:

``` For built-in effects type should be a string and be one of the following:beam-color, bomb-color, breath-color, bubbling-color, burn-color, burst-color, explode-color, glow-color, missile-color, nova-color, splatter-color

Where "color" in the above is one of: acid, blood, charm, death, fire, frost, holy, magic, slime, smoke, water

For custom effects, type should be the ID of the custfx object for the custom effect. ```

#### Changelog
**v0.1.4 - 29-04-2018**
* Adding the selected statusmarker manually or through TokenMod will now also add an inspiration to the sheet.
* Added an option to show a special effect when a character gets inspiration.
* Added a way to toggle Inspiration by using the `!inspiration` command.

**v0.1.2 - 28-04-2018**
* Fixed a bug were giving inspiration could cause an error.