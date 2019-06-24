# Kyburn's Mass Combat

The official companion script for the [Kyburn's Mass Combat](https://docs.google.com/document/d/1-56AC-p57x-vr_BzszksjC55kTFK4d67XOzcIb1pWCY/edit?usp=sharing) ruleset.

This script supports automatically converting prototype creatures into formations as well as combat operations and a host of utility functions.

- Author: [Michael Greene (Volt Cruelerz)](https://app.roll20.net/users/1583758/michael-g)
- Forum Thread: [Mass Combat Companion Script](https://app.roll20.net/forum/post/7075696/mass-combat-companion-script)
- Github: [Link](https://github.com/VoltCruelerz/Mass-Combat)

## Setup

1. Create a macro button for `!mc -overview` called something like [Mass Combat].
2. For each formation, start with a basic NPC creature’s character sheet and duplicate it.
3. Drag a token of the duplicate onto the board and select it.
4. Press your [Mass Combat] macro button.  A menu will appear in the log (see thread for details of each function).
5. At the bottom of the menu, you’ll find a button named [Make Formation].  Press it and fill out the popups.
6. Wait a few seconds as the script transforms the duplicate into a brand new character sheet for a formation.  You will be presented with status messages along the way.

## Commands

### Utility & Admin
- `!mc -overview` Brings up the main menu, which has buttons for all the rest of these.
- `!mc -makeFormation [NUMBER OF UNITS] [Levied|Manufactured|Mercenary] [Infantry|Cavalry|Archers|Scouts|Mages]` Converts a selected token and its character sheet into a formation.  Once a token has been turned into a formation, the red bar is health, the yellow bar is chaos points, and the blue bar is fatality points.  The bars are not permanently bound to underlying stats in the formation character sheet, so you can create duplicates without them sharing a health pool.  Once created, DO NOT RENAME IT without using the Rename command.  DO NOT MANUALLY ALTER BARS.  Use the damage/heal/recover/revert buttons.  The commands will account for fatality points and chaos points.  Manually altering them will not be detected and math errors usually results in the Long Rest thinking more people died than actually did. :(  EXAMPLE: `!mc -makeFormation 100 Levied Infantry`
- `!mc -rename ^[NEW NAME]^` Renames the selected formation to the new name.  I use carets instead of quotes because quotes could reasonably show up in a character name.
- `!mc -history` Displays the operational history with revert buttons.
- `!mc -battleRating` Displays the total Battle Rating of the selected formations.  If you also select hero units, they will be listed separately.
- `!mc -upkeep` Displays the total upkeep of the selected formations.
- `!mc -saveInitiative` Saves the current initiative order, in case you wish to zoom in on an encounter for a hero.  Warning: using this more than once will overwrite the previous save.
- `!mc -loadInitiative` Loads the saved initiative order.

### Statistics
All these operations require a selected formation token.
- `!mc -resize [NUMBER OF UNITS]` Resizes the selected formation to the new size, adjusting hit points and action damage.  This is implicitly performed by the Long Rest and Make Formation commands.
- `!mc -setInt [NEW INT MODIFIER]` Sets the commander's intelligence modifier to the specified value, which is used for attack modifiers.
- `!mc -ac` Displays the AC of the selected formation.
- `!mc -speed` Displays the speed of the selected formation.
- `!mc -morale` Brings up the Morale menu with lots of configuration options for the selected formation.  The menu also includes a Leadership check roll.

### Battle
All these operations require a selected formation token.  Those operations that add an icon can be altered manually, so you can undo it manually, but again, the history menu can revert any battle operation.  If you drop a formation to 50%, it'll gain an aura.  See compatibility with HealthColors below for details.
#### Damage
- `!mc -damage [Battle|Chaos|Fatality] [AMOUNT]` Deals damage of the assigned type to the formation.  Chaos and Fatality points are automatically calculated.  :)
- `!mc -scaledDamage [Battle|Chaos|Fatality] [AMOUNT] [SCALE]` Deals scaled damage.  For instance, Fireball has a scale of 6 (2 + 40ft/10ft), so a Fireball dealing 24 damage would be `!mc -scaledDamage Battle 24 6`.
#### Disorganize
- `!mc -disorganize [NEW DISORGANIZATION SCALE|false]` Sets the disorganization level to the provided scale.  A value of `false` will turn off disorganization entirely.  This is stored as status icons.  If you want double-digit disorganization, you MUST go through the API because there's no way on the Roll20 UI to have the same icon twice.  I can cheat with the API though. ;)
- `!mc -popDisorganize yes` Pops all current disorganization levels.  This has a confirmation parameter so that a user of the main menu does not accidentally press it (this feature came before history reversion).
#### Recovery
- `!mc -startRecover` Marks a token with an icon to symbolize recovery has started.
- `!mc -recover` Removes the icon and converts chaos points into hit points.
#### Restore
- `!mc -heal [HEAL POINTS]` Attempts to heal a formation by the provided value.  It will be capped by the presence of fatality and chaos points.
- `!mc -longrest yes` Performs the long rest operation on the selected formations.  This will first convert chaos points to hit points, and then reduce the maximum hit points by fatality points and downscale the formation to account for fatalities.  The user is presented with the number of dead and survivors.  Action damage will automatically be scaled down to account for this.  Like pop disorganization, this has a confirmation parameter for UI usability.
#### Stance
- `!mc -guard` Toggles the Guarding status icon for guarding formations.
- `!mc -defend` Toggles the Defending status icon for defending formations.
- `!mc -cooldown` Toggles the Cooldown status icon for mages that have already spent their burst damage.
#### Route
- `!mc -route [-1,0,1,2,3]` n=-1: not routed.  n=0: routed, but no failures.  n>0: routed with that number of failures.
- `!mc -routeDamage` Deals a tick of route damage that formations experience at the beginning of their turn.

## Operation
Make a macro button for the overview command, and then just use the menu.  It's so much simpler. T.T

So, how do you use this?  After doing the setup steps above, you're basically set.  Set up a battlefield by dragging in formations.  Roll initiative for them, do combat, use initiative save/load as needed, and resolve combat.  Once you're done, perform the long rest operation on any formations you wish to persistently track.

## Verison History

- 0.7: First public release.  No longer available.
- 0.9: Includes automated morale handling.
- 1.0: Formations can now be created automatically. 

## Conflicts
So, it should come as no surprise that this script is pretty large and affects a lot.  Having said that, I've worked to make it as compatible as possible with other scripts.  

### HealthColors
I do not know of any scripts that it directly conflicts with, but Mass Combat does have interaction with [HealthColors](https://github.com/dxwarlock/Roll20/blob/master/Public/HeathColors).  I *love* HealthColors, but it does not detect when the API changes a token...so I made Mass Combat do it.  When you drop a formation to 50%, because being diminished is so important, it'll gain a yellow aura which will turn to red as you drop in health.  I've used the default colors that script utilizes, so this shouldn't cause any conflicts unless you special colors.  Having said that, you can dig into my source and look for `setTokenAura()`.  Essentially, it just ramps up the green parameter, so the RGB code goes from `FFFF00` to `FF0000` as you approach 0 hp.

### Alters
- `state.MassCombat` ...do I need to explain why I do this?
- `token.status_*` I deliberately used a list for the status icons that did not conflict with Robin Kuiper's [StatusInfo](https://github.com/RobinKuiper/Roll20APIScripts) script. The ones I use are... Routed: "status_chained-heart", Guard: "status_sentry-gun", Defend: "status_bolt-shield", Cooldown: "status_half-haze", Disorganized: "status_rolling-bomb", Recovering: "status_half-heart", Dead: "status_dead".
- `token.bar*` Again, shouldn't be a huge surprise that I alter the three bars of the tokens.
- `char.[stat]` I alter a lot of stats when the make formation is performed.  Check out the `AttrEnum` object for full details.  
- `char.traits` Ugh, so at the time of this writing, there's a sporadic bug with this, but it is NOT on my end.  My code still works fine and the data stored in the traits *is* there, but it doesn't display correctly when you look at the character sheet.  When you risk running into this, I print out a message to the GM explaining in greater detail.
- `char.actions` Any attacks will be parsed to the script's best ability, as well as any description fields, which will look for `[[YOUR DICE ROLL HERE]]` and calculate it.  If you have some exotic ability references, that attack will abort and the script will prompt you to go do that one manually.