## SyncPage

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin
* Github: https://github.com/RobinKuiper/Roll20APIScripts
* Reddit: https://www.reddit.com/user/robinkuiper/
* Patreon: https://patreon.com/robinkuiper
* Paypal.me: https://www.paypal.me/robinkuiper

---

``` I got asked by someone if it was possible to show/hide certain tokens for certain players. I came up with this. This is the first Beta release, and is probably still prone to bugs. Let me know if you have any troubles/suggestions. ```

SyncPage gives you a way to sync pages. If an object is created, changed or removed on one of the synced pages, it will also be on the others.
It also has commands to hide/show specific tokens on different synced pages, which gives you a way to hide/show certain tokens for players by dragging a player to another synced page.

Due to API limitations, only tokens with an image that is in your library will be added with that image on the synced page(s), tokens with images not in your library will get the default token image.

### How It Works
``` NOTE: I wanted to do this automatically, but at the moment Roll20 doesn't allow the creation of pages through the API. ```

You create a new page with exactly the same name as the page you want to sync, and give it a '_synced' prefix, eg.:

![Page Sync Demo](https://i.imgur.com/VAPEBy4.png "Page Sync Demo")

The initial page will be synced (with all objects on it) to the newly created page, and everything that changes on one of the pages will now also change on the other pages.
After this you can bring up the `SyncPage Menu` by using the `!sync` command, eg.:

![Menu](https://i.imgur.com/ZvAtEtM.png "Menu")

With this menu you can hide/show specific tokens on the different synced pages.

``` NOTE: A token with the "Show Here" or "Hide Here" flag will always go before doing "Show on Other pages" or "Hide on Other pages" ```

Now you can drag specific players to one of the synced maps to show them only the things they need to see.

![Player Demo](https://i.imgur.com/o1cCyEZ.png "Player Demo")

### Config
![Config Menu](https://i.imgur.com/SxLZPWr.png "Config Menu")

* **Command** - The command you want to use for this script.
* **Reload Refresh** - Refresh the synced pages on a reload.
* **True Copy** - Will really duplicate the page, with all tokens, drawings, texts, etc. If enabled it will trigger on duplicating a page.

### Commands

* **!sync** - Shows the SyncPage Menu.
* **!sync config** - Shows the config menu.
* **!sync show** - Sets the `show here` flag to the selected token(s).
* **!sync hide** - Sets the `hide here` flag to the selected token(s).
* **!sync show others** - Sets the `show others` flag to the selected token(s).
* **!sync hide others** - Sets the `hide others` flag to the selected token(s).

#### Changelog
**28-04-2018 - 0.1.9**
* Added a "true copy" feature. Pages can be really duplicated now.