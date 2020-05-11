# Roll20PF2
Pathfinder 2 API utilities for Roll20

This is a set of utilities I found useful for running Pathfinder 2 in Roll20.

To use, currently you must cut and paste the entire `pf2utils.js` file into a new tab on the **API Settings** page.  This requires you to have a Pro Roll20 account.

## Functions

All commands start with `!pf`.

Starting with `!pfs` instead will send the result only to the executing player and the GM. This is not necessary for Secret abilities, which 
are automatically sent only to the GM.

To choose the character(s) or token(s) affected by the command, the following rules are used:

* You can manually specify a target by placing an `@` after the `!pf` giving an initial part of the character name in lower case with spaces removed. For example, a character named *Ed Goblin* would be targeted by `!pf @edgoblin` or just `!pf @edgo`. Tokens that don't represent characters are matched based on their token name.
* You can target all PCs by specifying `!pf @pcs`.
* You can specify several targets by seperating them with commas; eg `!pf @pcs,edgo` will target all PCs and Ed Goblin (assuming Ed Goblin is not a PC)
* If you don't manually specify a target, the selected token(s) are targeted.
* If you don't manually specify a target and no tokens are selected, and you are not the GM, all tokens you control are targeted.

After the target specification (if there is one), should come the command followed by parameters separated by spaces. The available commands are as follows:

* `get <item>` reads the given number from the character sheet. Eg, `!pf @pcs get stealth` will display the Stealth values for all PCs. This can be used for any stat (reading the stat modifier, not the raw score), skill, perception, save, AC or level. The name of the property can be abbreviated as with ability names.
* `best <item>` finds the highest number in listed character sheets and reports who has it. Eg, `!pf @pcs best perception` will find the PC with the best perception and print their score.
* `roll <item>` acts like `get` but adds a d20 roll to the given values. The value printed will include the roll result, 
the highest level standard DC at which it succeeds, and the highest enemy modifier it beats as a DC.
* `rollinit <item>` acts like `roll` but also adds the initiative modifier to the given skill. If `item` is omitted, `perception` is the default.
* `rollinit! <item>` acts like `rollinit` but sends the result(s) to the turn tracker, keeping it in descending order. 
* `ability <ability> <skill>` uses one of the standard Abilities from the Pathfinder 2 core rules. The ability is named in the same way as a target character - the start of the name in lower case, with no spaces.  This will roll the appropriate skill on the target(s), send the roll to the player or the GM if appropriate (the GM only if the ability has the Secret tag), and also print out a summary table of the effects of hitting different success thresholds. If the ability is one where different skills can be specified, the skill to use is specified as the second parameter. For example, if Ed Goblin wants to sneak, you can enter `!pf @edgo ability sneak`. If he's trying to remember a spell, you can enter `!pf @edgo ability recall arcana`.

### Modifier tracking

The script tries to keep a database of active modifiers, to prevent your game being dragged to hell by the mysterious 
imps, known as *didjamembers*, whose names are spoken whenever a large number of modifiers are in play and a roll is 
borderline.

All of the `roll` commands above (including `rollinit` and `ability`), plus the modifers commands below,
can have any number of **roll tags** appended to it as hashtags. `roll`, `rollinit` and `ability` automatically add the 
name of the skill being rolled, and its governing attribute, as hashtags.

* `mod add <name> <type> <value>` adds a modifier to the selected targets, with the given name and value. Type must be 
`c`, `s`, `i` or `u` for Circumstance, Status, Item, or Untyped respectively. Some tags must
also be specified to indicate what rolls are affected; only rolls with **all** the named tags are affected. For example, if all PCs have a +2 status bonus to Fortitude saves 
against fear, you could enter `!pf @pcs mod add bravery s 2 #fortitude #fear`. If a modifier with the same name already 
exists, it is updated instead (even if it affects different targets, it is updated to affect the 
targets you specify)
* `mod list` lists all modifiers in play.
* `mod clear` clears all modifiers in play.
* `mod del <name>` wipes out the named modifier.
* `mod explain` calculates the total of temporary modifiers that would apply to rolls with the given tags on the given 
target, and displays a breakdown of the modifiers involved. For example, you could find every PCs bonuses to fortitude 
saves vs Fear with `!pf @pcs mod explain #fortitude #fear`. Note that this only counts **temporary** modifiers created 
using `mod` commands; the PC's actual Fortitute save value is not counted.

Note: these commands do not currently update the temporary modifier fields on the character sheet because there is no 
way to allow for different combinations of tags when doing so.


## Known Abilities

Most of the abilities from the skills section are included, plus the two "standard" abilities which require skill rolls (*Sense Motive* and *Seek*). Note that abilities that don't require rolls can't be usefully managed and so are not included. This includes *Cover Tracks* which has no actual roll in the book. *Strike* and other attacks are also not included due to their significant modifier stacks. The two different versions of *Perform First Aid* are treated as two different abilities named *Stabilize* and *Stop Bleeding*.

| Ability | Shortest Abbreviation | Note |
| -- | -- | -- |
| Aid | `ai` | Must specify skill | 
| Balance | `bal` | |
| Borrow an Arcane Spell | `bo` | |
| Climb | `cl` | | 
| Coerce | `coe` | |
| Command an Animal | `com` | |
| Conceal an Object | `con` | Secret | 
| Craft | `cra` | |
| Create a Diversion | `createa` |
| Create Forgery | `createf` | Secret |
| Decipher Writing | `dec` | Secret, must specify skill |
| Demoralize | `dem` | |
| Disarm | `disar` | (an opponent, not a trap) |
| Disable Device | `disab` | |
| Earn Income | `ea` | Must specify skill |
| Feint | `fe` | | 
| Force Open | `fo` | | 
| Gather Information | `ga` | |
| Grapple | `gr` | | 
| Hide | `hid` | Secret | 
| High Jump | `hig` | | 
| Identify Alchemy | `identifya` | Secret |
| Identify Creature | `identifyc` | Secret, must specify skill, special case of Recall Knowledge |
| Identify Magic | `identifym` | Secret, must specify skill |
| Impersonate | `im` | Secret |
| Learn A Spell | `le` | Must specify skill |
| Lie | `li` | Secret |
| Long Jump | `lo` | |
| Maneuver in Flight | `m` | |
| Palm an Object | `pa` | |
| Perform | `pe` | |
| Pick a Lock | `pi` | | 
| Recall Knowledge | `reca` | Secret, must specify skill |
| Repair | `rep` | | 
| Request | `req` | |
| Seek | `see` | Secret |
| Sense Direction | `sensed` | Secret |
| Sense Motive | `sensem` | Secret |
| Shove | `sh` | |
| Sneak | `sn` | Secret |
| Squeeze | `sq` | |
| Stabilize | `sta` | |
| Steal | `ste` | |
| Stop Bleeding | `sto` | |
| Subsist | `su` | Must specify skill |
| Swim | `sw` | |
| Track | `trac` | | 
| Treat Disease | `treatd` | |
| Treat Poison | `treatp` | |
| Treat Wounds | `treatw` | |
| Trip | `trip` | | 
| Tumble Through | `tu` | | 

In addition the following non-standard abilities that follow the same model are included.

| Ability | Shortest Abbreviation | Note |
| -- | -- | -- |
| Awesome Blow | `aw` | From Barbarian |
| Battle Assessment | `battlea` | From Rogue, Secret |
| Battle Prayer | `battlep` | Skill Feat from Gods and Magic |
| Delay Trap | `del` | From Rogue |
| Evangelize | `ev` | Skill Feat from Gods and Magic |
| Goblin Song | `go` | From Goblin Ancestry |
| Recognize Spell | `reco` | Skill Feat, Secret, Must specify skill |
| Sabotage | `sab` | From Rogue |
| Sacred Defense | `sac` | Skill Feat from Gods and Magic |
| Scare To Death | `sc` | Skill Feat |
| Train Animal | `trai` | Skill Feat |
| Trick Magic Item | 'tric' | Skill Feat |
| Whirling Throw | `w` | From Monk |

Also, the following custom actions from Adventure Paths are available, but they 
are prefixed by abbreviations indicating the Adventure Path to minimise accidental 
use.

| Ability | Shortest Abbreviation | Note |
| -- | -- | -- |
| AA Befriend A Local | `aab` | From Age of Ashes Player's Guide |
| AA Administer Altaerein | `aaa` | From Age of Ashes 2 |
| AA Organize Labor | `aao` | From Age of Ashes 2 |
| EC Promote the Circus | `ecpr` | From Extinction Curse 1 |
| EC Perform a Trick | `ecpe` | From Extinction Curse 1 |
     