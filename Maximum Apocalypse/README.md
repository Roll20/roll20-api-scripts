**APIs to support Maximimum Apocalypse**
 
**Change Log:**  
* 2020-12-14 - First version with features for showing/populating tracker, action phases, showing/updating enemy attraction gauge


**Commands:**  
  
***`!init`***
Show the initiative tracker window & populate it with initiative values for all character tokens on current page.
"New Combat Round" will be chatted along with the fact its the first combat phase.
  
***`!np`***
Move to next action phase by subtracting 5 from all initiative values in tracker.
Current combat phase will be chatted.
After action phase 4 the enemy attraction gauge is increased by 5 (gauge will be added to page if not already).
  
***`!sea`***
Show enemy attraction gauge.

***`!uea <number>`***
Add <number> to enemy attraction gauge.

***`!rea`***
Reset enemy attraction gauge to zero.