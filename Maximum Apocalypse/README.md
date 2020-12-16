**APIs to support Maximimum Apocalypse**

**Commands:**  
  
***`!init`***
- Show the initiative tracker window & populate it with initiative values for all character tokens on current page.
- An "<end of phase>" entry with zero initiative will also be added.
- "New Combat Round" will be chatted along with the fact its the first combat phase.
- Use the "Advancing Turn" button as usual.
- Once the "<end of phase>" turn reaches the top the "next phase" (!np) command will automatically be called.
  
***`!np`***
- Move to next action phase by subtracting 5 from all initiative values in tracker.
- Current combat phase will be chatted.
- After action phase 4 the enemy attraction gauge is increased by 5 (gauge will be added to page if not already).
  
***`!sea`***
- Show enemy attraction gauge.
- Currently it appears at a fix location so may need to be moved.

***`!uea <number>`***
- Add <number> to enemy attraction gauge.
- Can be positive or negative.

***`!rea`***
- Reset enemy attraction gauge to zero.
  
**Change Log:**  
* 2020-12-14 - First version with features for showing/populating tracker, action phases, showing/updating enemy attraction gauge
