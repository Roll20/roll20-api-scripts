**APIs to support Maximimum Apocalypse**

Also see the Maximimum Apocalypse character sheet.

** Roll Effects: **

The following types of roll checks will be detected and effects applied:
- Full Dodge: Character's initiative will be reduced by 5
- Riposte: Character's initiative will be reduced by 3

**Commands:**  
  
***`!ma init`***
- Show the initiative tracker window & populate it with initiative values for all character tokens on current page.
- An "&lt;end of phase&gt;" entry with zero initiative will also be added.
- "New Combat Round" will be chatted along with the fact its the first combat phase.
- Use the "Advancing Turn" button as usual.
- Once the "&lt;end of phase&gt;" turn reaches the top the "next phase" (!np) command will automatically be called.
  
***`!ma np`***
- Move to next action phase by subtracting 5 from all initiative values in tracker (min. 0).
- Current combat phase will be chatted.
- After action phase 4 the enemy attraction gauge is increased by 5 (gauge will be added to page if not already) and the next combat turn started.
- If any initiative has been borrowed from the next turn that will be reflected in next turn's initiative values.
  
***`!ma sea`***
- Show enemy attraction gauge.
- Currently it appears at a fix location so may need to be moved.

***`!ma uea <number>`***
- Add &lt;number&gt; to enemy attraction gauge.
- Can be positive or negative.

***`!ma rea`***
- Reset enemy attraction gauge to zero.

***`!ma uh <number>`***
Increment selected players' hunger values by &lt;number&gt; and get chat summary of changes. Hunger changes and whether they are starving/emaciated will be whispered to players. If no players are selected, the increment will apply to all players on current page.

***`!ma acf <number>`***
Apply consumed food, equal to &lt;number&gt; units, to selected players and get chat summary of changes. Hunger changes and whether they are starving/emaciated will be whispered to players. If no players are selected, the increment will apply to all players on current page.

***`!ma roll <roll macro for maxapoc roll template>`***
Perform specified roll and remember it so it can be re-rolled by `!ma lrr` command.

***`!ma lrr`***
Use Luck to Re-Roll the last roll via the `!ma roll` command.

***`!ma config`***
Chat configuration settings/buttons to enable/disable API features.

***`!ma config <config code> <true|false>`***
Enable/disable specific API features.
  
**Change Log:**  
* 2020-12-14 - First version with features for showing/populating tracker, action phases, showing/updating enemy attraction gauge
* 2020-12-31 - Standardise command behind `ma` alias, added hunger, roll, re-roll & config commands. Added automatic initiative reduction for Full Dodge & Riposte rolls.
