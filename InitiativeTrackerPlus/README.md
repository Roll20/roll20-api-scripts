**From Ken L's original Tracker Jacker script.**

An attempt to modernize Tracker Jacker and add new functionality as it becomes desired.  
  
**Change Log:**  
* 2020-09-12 - Updated heavily to pull all token markers enabled in the campaign and make them useable for condition/status effects  
* 2020-09-12 - Added -cleanSlate command (!tj -cleanSlate) to completely wipe all persistent state data should not be used lightly but if effects get stuck in the system this will clear them  
* 2020-09-20 - Added EOT link to turn indicator  
* 2020-09-20 - Added mouseover text to token marker selector list  
* 2020-09-25 - Added the ability to display favorites alphabetically, it remains in the first in first out order by default.   To get an alphabetical list change `!tj -listfavs` to `!tj -listfavs 1`  
* 2020-11-18 - Added the ability to save and load favorite.  The save creates a Handout called "TJFavsJSON", the load looks for that handout and loads the JSON from it.
* 2020-11-22 - The first actor's turn is now announced when starting the tracker.
* 2020-11-22 - Added the ability to change the initiative indicator (spinning green thing by default) to any other image.



**Commands:**  
  
***`!tj -help`***
Display help message
  
***`!tj -start`***
Start/Pause the tracker. If not started starts; if active pauses; if paused, resumes. Behaves as a toggle.
  
***`!tj -stop`***
Stops the tracker and clears all status effects.
  
***`!tj -clear`***
Stops the tracker as the -stop command, but in addition clears the turnorder
  
***`!tj -pause`***
Pauses the tracker.
  
***`!tj -reset [round#]`***
Reset the tracker's round counter to the given round, if none is supplied, it is set to round 1.
  
***`!tj -addstatus [name]:[duration]:[direction]:[message]`***
Add a status to the group of selected tokens, if it does not have the named status.
**name** name of the status.
**duration** duration of the status (numeric).
**direction** + or - direction (+# or -#) indicating the increase or decrease of the the status' duration when the token's turn comes up.  +0 or -0 for a permanent affect.
**message** optional description of the status. If dice text, ie: 1d4 exist, it'll roll this result when the token's turn comes up.
  
***`!tj -removestatus [name]`***
Remove a status from a group of selected tokens given the name.
  
***`!tj -edit`***
Edit statuses on the selected tokens
  
***`!tj -addfav [name]:[duration]:[direction]:[message]`***
Add a favorite status for quick application to selected tokens later.
  
***`!tj -listfavs`***
Displays favorite statuses with options to apply or edit.
  
***`!tj -listfavs 1`***
Displays favorite statuses (in alphabetical order) with options to apply or edit.
  
***`!eot`***
Ends a player's turn and advances the tracker if the player has control of the current turn's token. Player usable command.
  
***`!tj -saveFavs`***
Save your current Favorites into in the GM notes section of a handout called "TJFavsJSON". This can be copy/pasted into a handout with the same name in another lobby and then "!tj -loadFavs" can be run to load them there.
  
***`!tj -loadFavs`***
Load Favorites previously saved via "!tj -saveFavs". Requires the handout "TJFavsJSON" to exist and have properly exported data in the GM notes section.
  
***`!tj -setIndicatorImage`***
Replaces the current initiative indicator with a new image
**Note:** The token will be removed from the field, along with any others with the name 'tracker_image'
* Place the image you wish to use as the indicator image (animated turn indicator) on the play field (any layer).  Please note, rollable tokens can be used for this as well.
* Edit the new token and change it's name to 'tracker_image', save the change
* Pause the tracker if it's currently active
* Use this command
* Unpause the tracker if it was active, else wise the next time the tracker is started your new indicator will be used.
  
***`!tj -defaultIndicatorImage`***
Revert the initiative indicator to the original green one.
* Pause the tracker if it's currently active
* Use this command
* Unpause the tracker if it was active, elsewise the next time the tracker is started the indicator will be the default green one.





