**APIs to support Maximimum Apocalypse**

Also see the Maximimum Apocalypse character sheet.

**Commands:**  
  
***`!ma init`***
- Show the initiative tracker window & populate it with initiative values for all character tokens on current page.
- An "&lt;end of phase&gt;" entry with zero initiative will also be added.
- "New Combat Round" will be chatted along with the fact its the first combat phase.
- Use the "Advancing Turn" button as usual.
- Once the "&lt;end of phase&gt;" turn reaches the top the "next phase" (!np) command will automatically be called.
- (GM only)
  
***`!ma np`***
- Move to next action phase by subtracting 5 from all initiative values in tracker (min. 0).
- Current combat phase will be chatted.
- After action phase 4 the enemy attraction gauge is increased by 5 (gauge will be added to page if not already) and the next combat turn started.
- If any initiative has been borrowed from the next turn that will be reflected in next turn's initiative values.
- (GM only)
  
***`!ma sea` or `!ma seag`***
- Show enemy attraction gauge on current player's page.
- Currently it appears at a fixed location (top left).
- (GM only)

***`!ma uea <number>` or `!ma ueag <number>`***
- Add &lt;number&gt; to enemy attraction gauge.
- Can be positive or negative.
- It will be moved to the current player's page, if not there already.
- (GM only)

***`!ma rea` or `!ma reag`***
- Reset enemy attraction gauge to zero.
- It wil be moved to the current player's page, if not there already.
- (GM only)

***`!ma hea` or `!ma heag`***
- Hide the enemy attraction gauge.
- It wil be moved to the current player's page, if not there already.
- (GM only)

***`!ma dea` or `!ma deag`***
- Delete the enemy attraction gauge.
- (GM only)

***`!ma uh <number>`***
- Increment selected players' hunger values by &lt;number&gt; and get chat summary of changes. 
- Hunger changes and whether they are starving/emaciated will be whispered to players. 
- If no players are selected, the increment will apply to all players on current page.
- (GM only)

***`!ma acf <number>`***
- Apply consumed food, equal to &lt;number&gt; units, to selected players and get chat summary of changes.
- The number of food units below a character's food requirement will be added as hunger damage.
- Hunger changes and whether they are starving/emaciated will be whispered to players. 
- If no players are selected, the increment will apply to all players on current page.
- (GM only)

***`!ma roll <roll macro for maxapoc roll template>`***
- Perform specified roll and remember it so re-roll commands can be used.

***`!ma reroll`***
- Re-Roll the last roll via the `!ma roll` command.

***`!ma lrr`***
- Use Luck to Re-Roll the last roll via the `!ma roll` command.
- Character's "luck uses" is reduced by one.

***`!ma rl`***
- Reset luck uses to max value for all player characters.
- (GM only)

***`!ma config`***
- Chat configuration settings/buttons to enable/disable API features.
- (GM only)

***`!ma config <config code> <true|false>`***
- Enable/disable specific API features.
- (GM only)
  
**Change Log:**  
* 2021-02-26 - Fixed EAG commands to show at top left by default & configuration to control if visible to players by default. Add commands to hide & delete EAG.
* 2020-12-14 - First version with features for showing/populating tracker, action phases, showing/updating enemy attraction gauge
* 2020-12-31 - Standardise command behind `ma` alias, added hunger, roll, re-roll & config commands. Added automatic initiative reduction for Full Dodge & Riposte rolls.
* 2021-01-09 - Seperate re-roll & luck re-roll (which noe decrements "luck_uses"). Add reset luck function.