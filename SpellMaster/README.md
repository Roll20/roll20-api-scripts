![pic](TazekaPage.PNG)

# SpellMaster
SpellMaster is a high-performance total-replacement for the Spells page of the OGL player character sheet with several additional key features that go beyond the default spells page.

It is an [Airbag](https://app.roll20.net/forum/post/7289686/script-airbag-api-crash-handler)-compatible script specifically built to be expandable and to allow DMs to add homebrew content.  The SRD spells are all provided.  To add additional spells, make use of the Export feature.

## Features

- **Instant Import:** Instantly add any spell (even homebrew!) in your master spell list to a character's spellbook.  Additionally, you can import a class's entire spell list to a spellbook during setup so your poor Druids and Clerics don't die of old age in Session 0.  SpellMaster also provides suggestions, should you mistype a spell name.
- **Class List Perusing:** Peruse all spells your character could know and easily swap them in and out.
- **Filtering:** filter by VSM, Ritual, Concentration, Preparedness, Slots Remaining, and the inverse of all of these.  General string search and cast time filtering are also provided.
- **Preparation Lists:** Create and configure independent lists of prepared spells for every scenario.
- **Permanent Preparation:** Supports spells that are both conditionally prepared and always prepared, even those that can be used a finite number of times a day without expending slots.
- **Performance:** SpellMaster is built to support games with hundreds of spells in play without slowing to a crawl.  My own game features 730, compared to the SRD's 319 or Stock's 456.
- **Compendium Interface:** SpellMaster has a semi-automated system to allow you to import spells from your purchased compendium expansions and then export them into your private spell list.
- **Homebrew Support:** Utilizing the same export system, you can add or update house spells.
- **Macro Support:** Macros of the commands SpellMaster uses are valid.
- **Casting & Slot Tracking:** This would hardly be a spell manager if you couldn't cast or track slots.
- **Sorcery Point Tracking:** This tool handles sorcery point conversions.
- **Magic Item Tacking:** SpellMaster allows creation of magic items that run on charges.

## Setup
1. Click Install below, as you would with any other script.
2. If you have a lot of homebrewed or purchased compendium spells, skip down to the **Export** section of this and return here when you're done.
3. Create a Handout with a unique name of your choice, such as "Tazeka's Spells."  Give Tazeka's player control of the handout.  This handout will become Tazeka's spellbook, fully replacing all need for the 5e OGL character sheet's spell page.
4. Run the following command to bring up the base SpellMaster menu: `!SpellMaster`
5. In the chat menu, a simple gui will appear.  Press **[Create Spellbook]**.  You will be prompted for some basic information.  Fill out the prompts.
6. Navigate to the handout and see that it has been populated!  Tazeka now has a dedicated spellbook!
7. I recommend going to Tazeka's main character sheet's **Bio & Info** tab and creating a link to her spells handout.  In our example above, you would simply write `[Tazeka's Spells]`.  When you save, Roll20 will convert that into a link to the handout.  

The player will have full edit power over the spellbook.

## Operation
The below section will go through the various features of SpellMaster in the same order they appear within the sheet.

### Filtering
At the top of the sheet, you'll see the ability to filter by the presence (or absence!) of VSM components, as well as Cast Time, Concentration, Preparation, Ritual, Slots Remaining, Cast Time, and a general string search that can be used for other fields such as the description or Range.

### Tools
- **Long Rest:** This will refill all slots and sorcery points to their maximum, and trigger a recharge on any magical items, as tracked by SpellMaster.  SpellMaster uses an independent resource tracking system (due to the **Cache**), so this will not alter the base character sheet in any way.
- **Level-Up:** This flushes the cache and reconstructs the maximum slot counts for spell levels.  Press this once upon level-up.  It supports full-casters, half-casters, third-casters, pact magic, and any combination of the above.  Note that this does not update your sheet's *current* slots, only the maximums.  Some GMs allow level-up immediately in combat, so I wished to allow that behavior.
- **Refresh Cache:** SpellMaster's performance is *heavily* reliant on an internal data cache that keeps things running smoothly.  Simply put, the sheer volume of data SpellMaster manages would easily fill up a third of your game's maximum memory size and bog your game to a crawl if it was not carefully managed.  As it is, SpellMaster is designed to run more powerfully and efficiently than the stock OGL sheet.  In practice, what this means for you is that the first time you perform an action with a spellbook per game, the user will experience a mild hitch, with much better performance thereafter.  This button is for cases where you *must* flush the cache, such as when changing your spellcasting modifier (which is the reason Level Up automatically flushes your sheet).

### Sorcery Points
By default, this is 0/0, but you can click the links to update them.  Then, once you have done so, you may use the **[Compose Slot]** link here to generate spell slots, as well as the **[Decompose]** buttons down below to convert spell slots back into sorcery points.

### Prepared Tracking
The preparedness tracker will make its best effort to track spells, even across several classes.  It also does not restrict the user from over-preparation, and should be treated as a guideline.  It does not treat permanently prepared spells as counting against its computed maximum prepared spells.

![pic](StaffOfPower.PNG)

###  Items
New in SpellMaster 2.000, magic items allow you to track spell enchantments on magic items.  Generally, items function similarly to spells (detailed below), but they have a few additional features of their own.  The below section references the above image.
- **[X] Staff of Power - [3] / [20] - [-]**
    - **[X]**: The staff is currently attuned.  Click to toggle.
    - **Staff of Power**: Click to rename.
    - **[3] / [20]**: The item has 3 of 20 maximum charges.  Click a number to change it.  Upon activation, charges are automatically consumed.
    -  **[-]**: Will collapse the item's details.
- **Requires Attunement**: This allows you to control whether the item requires attunement or not.  If it requires attunement and is not attuned, its enchantments deactivate.
- **Appearance**: Describe the appearance of the item.  This is a flavor field and has no mechanical effect.
- **Effect**: Describe the effect of the item.  This is a flavor field and has no mechanical effect.
- **Enchantments**: The list of enchantments.  By pressing **[+]** on an enchantment, you can expand it.
    - **[3] Fireball [-]**: The enchantment is a fireball enchantment that will consume 3 charges upon activation.  Click the charge count to change it or click the enchantment name to cast it.  If an enchantment requires more charges than are presently available, its activation link will be disabled.  When you attempt to activate an item, if you can upcast the enchantment, you will be prompted to specify at what tier you wish to employ the item.
    - **DC**: You can specify the DC or the ability score to use for casting a particular effect.
    - **Upcast Cost**: Set the cost for upcasting the enchantment, presuming it can be upcast.  Click **Upcast Cost** to set if it can be upcast and the number itself to set the upcast cost per tier/level.
- **Add Spell Enchantment**: Currently, only spell enchantments are supported.  A future release will enable custom enchantments that trigger effects of your design.  Until then, you can always create a new homebrew spell with the effect and enchant with that.
- **Recharge Rate**: Set the recharge rate.  This supports both constants and die rolls using Roll20's roll engine.

![pic](AOO.png)

### Spells
Spells appear within their level in alphabetical order.

- **Level 1 Spells - [4] / [4] - [...]**: The initial line denotes the spell level and current spell slots.  Click on a number to change it.  Currents *can* be higher than maximums, though Long Rest will reset them back to the maximum.  Pressing `[...]` will display all knowable spells for your character given your classes and spell lists at the specified level in the chat where you can add or remove them at your liesure.
- **[_] Azdregath's Opulent Ooze (R) - [-]**: The line with the spell's name on it has several features.
    - **[_]**: Clicking this empty checkbox will fill it with an X to mark it as prepared.  Cantrips are always checked.
    - **Azdregath's Opulent Ooze**: Clicking this will cast the spell.  See the casting details below.
    - **(R)**: This marks the spell as a ritual.  Concentration spells will be marked with `(C)`.
    - **[-]**: As elsewhere, this will compress or expand the spell details.
- **[0] / [0]**: Should you have a spell you can cast a finite number of times a day without expending a spell slot, you can edit its individual "slots" here.  If these are non-zero, they will appear in the name-line of the spell, allowing you to view them at a glance.
- **Manually Prepared**: If you have a spell that is always prepared, you can lock it as automatically prepared here.  This can be useful for classes with permanently-known spells or spells with lists of auto-prepared spells.  A permanently-prepared spell is marked with a **[O]** in its preparedness checkbox.
- **Description**: The next several lines simply provide the details of the spell.  The description is automatically parsed for indicators of saving throws, spell attacks, and upcasting.  When a spell is cast, this is then accounted for.
- **Ability**: Clicking on this will allow you to set the spellcasting ability of the spell.  If you select **Manual DC**, you will be presented with the ability to set that value manually as well.  Note that any spell attack will have a modifier 8 lower than the DC you specify.
- **Notes**: This field allows you to insert custom notes for a given spell.  These notes will be displayed at cast-time.  You can add custom rolls into this field if you wish by including something such as `[[1d4+1]]`, which will be evaluated by the roll engine.
- **Classes**: This is the list of classes that learn this spell.
- **Delete**: As with all deletes, this requires a confirmation dialog.

At the bottom of any spell level, you will find a **[+]**.  Press it to bring up a dialog to add a new spell.  You **MUST** type the name correctly.  If you cannot remember the precise name or spelling, it is often easier to use the **[...]** chat menu.

![pic](PrepLists.PNG)

### Preparation Lists
These function as radio buttons.  Press the checkbox for the spell preparation list of your choice and then make any preparation selections.  These will automatically be saved. should you create a new preparation list and switch to it.  Permanently Prepared spells are global to the spellbook and do not change between preparation lists.  The parenthetical number is the number of spells in that list.  

Press **[-]** to delete a list and **[+]** to create a new one.

## Casting with SpellMaster
Whenever you cast a spell or activate an item enchantment, you'll be presented with the opportunity to upcast the spell if you can.  If you cannot, or after your selection, the spell card will be printed to the chat log.  If a spell has individual slots, they will be consumed before your main slots.  The spell will be parsed to detect spell attacks or saving throws.  If there is no attack roll, the fields that host those values will default to 0.

## Spell Export
If you homebrew or purchased compendium content, the steps below dictate how to replace the stock SRD spell list with your own.
1. Create a **NEW** character sheet (the process will overwrite the character sheet).  I'll call it **House Spells**.  Navigate to its spell page.  This is the last time you'll use this page for your PCs in your game, thanks to SpellMaster.
2. Open your compendium.  Filter by spells.
3. Begin the (admittedly slow) process of dragging and dropping all those spells into House Spells, ignoring those in the SRD.  For each, you **MUST** manually fill out the Class field with the list of classes (ie `Druid, Warlock, Wizard`) because Roll20 has a bug that prevents it.
4. Add any additional homebrew spells you allow at your table.  If you have any special alterations to existing spells, include those as well.  Just **MAKE SURE** the name is unchanged, and the exporter will take your new version and ignore the stock version.  If you wish to **Rename** or **Ban** a spell at your table, name the spell either `RENAME|Old Name|New Name` or `DELETE|Banned Name`.
5. Once you're done, bring up the spellmaster menu with `!SpellMaster` and press **[Export Homebrew]**.  This will bring up a dialog option in which you type in the name of the character sheet.  Begin export.
6. The export process will begin in the background.  It is *processor-intensive* on the server, and SpellMaster is forced to throttle itself, lest the API watchdog kill it.  As a result, the process, depending on the number of spells, can take seconds to minutes to complete.  You will be notified when it completes through a chat message.
7. Open **House Spells** and navigate to the **Bio & Info** tab.  There, you'll find yourself face-to-face with an enormous javascript file containing all your spells in the format SpellMaster reads.  Copy all code there.
8. Navigate to your campaign's API page and create a custom script.  Call it something like `SpellList.js` and paste in the copied code.
9. Save the script.  This will trigger an API reboot.  When the API comes back up, it will prioritize your list over its internal SRD list.

Your players will thereafter be able to add your custom spells to their character sheets.

## Performance
SpellMaster was largely born out of a dissatisfaction with the performance of existing tools and character sheets.
- The master spell list is stored in an API script and the exports are handled through a character sheet, which have a significantly higher data cap than the game state.  SpellMaster's data, were it to be stored in state would eat about a third of it.
- Expensive operations are cached, so only part of the page is regenerated at a time.  Without a cache, certain operations take >300ms.  With it, they take <5ms.
- Spellbooks are in handouts rather than the main character sheet because loading a character sheet can take a painfully long time at higher levels, and SpellMaster is designed to be performant at *all* levels of play.  For your convenience, however, the top of the spellbook contains a link to the main character sheet.

## Known Bugs
### Roll Clone
- **Summary**: When whispering to the rolls to both the GM and the player privately, the whispered rolls do not match.
- **Workaround**: Configure player rolls to not be whispered to the GM or give the GM ownership of all player characters.  I do not mean merely give **All Players** control.  I mean give the DM themselves control.
- **Resolution**: The Aaron and GiG have recently informed me of a means of dodging this bug, which is relatively simple
- **Roadmap**: I would like to get to this within the next few versions.

## Zero-Zero
- **Summary**: The HTML template that is currently used does not support no attack roll value, which is why they currently default to zero.
- **Workaround**: Ignore it.  It hurts nothing except your eyes.
- **Resolution**: I'll need to build my own roll template or find another mechanism.  For instance, if I were to integrate with PowerCards, that would resolve the issue, though I would need assistance from that script's developer(s).
- **Roadmap**: No imminent plans to resolve this, though I would like to eventually.

## Releases
- 1.0: Initial Release
    - 1.1: Add whisper inheritance, add manual DCs
    - 1.2: Advanced Caching and Homebrew Export
    - 1.3: Export now handles all levels automatically for you.
        - 1.3.1: Fixed a minor spell preparation bug for Druids and Clerics.
    - 1.4 Add cast time filtering, add rename and delate to export.
    - 1.5: Add knowables printing, improve spell slot count algorithm.
    - 1.6: Add sorcery points.
    - 1.7: Fix sorcery point migration bug.
    - 1.8: Add auto-population solution for paladins.
    - 1.9: Add range searching to general string search.
- 2.000: Magic Items, one-click install, new version number system
    - 2.001: Enabled auto-rolling of rolled item charges.
    - 2.002: Damerau-Levenshtein distance suggestions for mistyped spells, item sorting

## Future Work
### Usability
- **Bug Fixes**: Obviously, bug hunting is always desirable.
- **Regex Searching**: It's handy!
- **Shaped Sheet Compatibility**: Support for this is a looooooooong way off, but hey, it'd be nice!
### Features
- **Custom Item Enchantments**: I plan for this, which will likely be the next release.
- **Improved NPC Support**: Currently, SpellMaster only supports PC characters.  I *definitely* want this feature, so it is a priority.
- **Short Rest Recharge**: Certainly, I can't *fully* support everything that might happen on a short rest, but I can at least add something.  Most notably, Pact Magic and custom spell enchantments recharge would be nice.
- **Ritual Casting**: I would like to enable ritual casting as a dropdown option for such spells.  Currently, the user would have to manually give themselves a slot back.  Not a *huge* pain, but still annoying.
- **Slotless Casting**: I would like to see some sort of damage ticking system that rerolls the description sheet, though I've yet to come up with a good solution.  I welcome suggestions.

## Contact

Feel free to contact me at any of the following for comments, suggestions, or bug reports.
- [github](https://github.com/VoltCruelerz)
- [Roll20](https://app.roll20.net/users/1583758/gm-michael)
- [Forums](https://app.roll20.net/forum/post/8109696/script-spellmaster-2-dot-0-5e-ogl-magic-handler-thread-3)