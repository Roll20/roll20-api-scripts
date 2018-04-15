## BeyondImporter

* Skype: RobinKuiper.eu
* Discord: Atheos#1095
* Roll20: https://app.roll20.net/users/1226016/robin-k
* Reddit: https://www.reddit.com/user/robinkuiper/

---

```
NOTICE: The commands are changed since the last update, read the description below.
```

Beyond Importer let's you import a character sheet from DNDBeyond into Roll20.
There are 2 versions of the Beyond Importer, one for the [5e Shaped Sheet](https://bitbucket.org/mlenser/5eshaped/wiki/Home) and one for the [5e OGL sheet](https://wiki.roll20.net/5th_Edition_OGL_by_Roll20).

**Both version work the same.**

At the moment this is still in development. But the main import is working, let me know if you find any errors or if you have any suggestions.

### How it works
Go to the character page on DNDBeyond and put '/json' after the url, eg:

```
https://www.dndbeyond.com/profile/Atheos/characters/1307201/json
```

Copy the entire content of that page, and go to Roll20.
In the Roll20 chat type the command `!beyond import` and paste the copied contents after that, eg:

```
!beyond import {"character":{"id":1307201,"name":"Qroohk","player":"Atheos","age":null,"hair":null,"eyes":null,"skin":null,"height":null,"weight":null,"size":"Medium","alignment":"Lawful Good" ..........
```

Your character will be imported now!

### Commands

* **!beyond help** - Shows the help menu.
* **!beyond config** - Shows the config menu.
* **!beyond import [CHARACTER JSON]** - Imports a character from the DNDBeyond json.

![Config Menu](https://i.imgur.com/WLb76Uy.png "Config Menu")

Roll20 Thread: https://app.roll20.net/forum/post/6248700/script-beta-beyondimporter-import-dndbeyond-character-sheets