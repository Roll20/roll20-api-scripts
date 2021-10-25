**From Ken L's original Tracker Jacker script.**

An attempt to modernize Tracker Jacker and add new functionality as it becomes desired.  
  
**Change Log:**  
* 2021-03-02 - v1.25 published to one-click API script list
* 2021-03-01 - Added eotcolor option to -setConfig to change [ EOT ] button color.
* 2021-02-13 - Added -setConfig functionality to modify various fields, flags and design variables.  These changes will be stored in the state so should continue between sessions.  Use detailed below.
* 2020-12-28 - Changed '? Round 1' (which changes to '?? Round 1' when paused) to use a play button image |> and pause button image || instead.
* 2020-12-04 - Added `!itp -purge` alias to remove all statuses
* 2020-12-02 - Some minor code cleanup to make it easier for me to work with.
* 2020-12-02 - Added a command to clear all statuses from a token.  `!itp -dispmultistatusconfig removeall` while the token(s) are selected, or a button appears on the edit message as well.
* 2020-11-23 - Changed references to Tracker Jacker to Initiative Tracker Plus.  I am doing this to differentiate the new and drastically changing codebase from Ken L.'s original codebase so users that are happy with OG Tracker Jacker can continue to use it without confusion.
* 2020-11-23 - Updated initiative round indicator to have Play, Stop and Pause buttons instead of ? and ??
* 2020-11-22 - Added the ability to change the initiative indicator (spinning green thing by default) to any other image.
* 2020-11-22 - The first actor's turn is now announced when starting the tracker.
* 2020-11-18 - Added the ability to save and load favorite.  The save creates a Handout called "ITPFavsJSON", the load looks for that handout and loads the JSON from it.
* 2020-09-25 - Added the ability to display favorites alphabetically, it remains in the first in first out order by default.   To get an alphabetical list change `!itp -listfavs` to `!itp -listfavs 1`  
* 2020-09-20 - Added EOT link to turn indicator  
* 2020-09-20 - Added mouseover text to token marker selector list  
* 2020-09-12 - Added -cleanSlate command (!itp -cleanSlate) to completely wipe all persistent state data should not be used lightly but if effects get stuck in the system this will clear them  
* 2020-09-12 - Updated heavily to pull all token markers enabled in the campaign and make them useable for condition/status effects  


**Commands:**  
  
***`!itp -help`***
Display help message
  
***`!itp -start`***
Start/Pause the tracker. If not started starts; if active pauses; if paused, resumes. Behaves as a toggle.
  
***`!itp -stop`***
Stops the tracker and clears all status effects.
  
***`!itp -clear`***
Stops the tracker as the -stop command, but in addition clears the turnorder
  
***`!itp -pause`***
Pauses the tracker.
  
***`!itp -reset [round#]`***
Reset the tracker's round counter to the given round, if none is supplied, it is set to round 1.
  
***`!itp -addstatus [name]:[duration]:[direction]:[message]`***
Add a status to the group of selected tokens, if it does not have the named status.
**name** name of the status.
**duration** duration of the status (numeric).
**direction** + or - direction (+# or -#) indicating the increase or decrease of the the status' duration when the token's turn comes up.  +0 or -0 for a permanent affect.
**message** optional description of the status. If dice text, ie: 1d4 exist, it'll roll this result when the token's turn comes up.
  
***`!itp -removestatus [name]`***
Remove a status from a group of selected tokens given the name.
  
***`!itp -dispmultistatusconfig removeall`***
Remove all statuses from 1 or more selected tokens.

***`!itp -edit`***
Edit statuses on the selected tokens
  
***`!itp -addfav [name]:[duration]:[direction]:[message]`***
Add a favorite status for quick application to selected tokens later.
  
***`!itp -listfavs`***
Displays favorite statuses with options to apply or edit.
  
***`!itp -listfavs 1`***
Displays favorite statuses (in alphabetical order) with options to apply or edit.
  
***`!eot`***
Ends a player's turn and advances the tracker if the player has control of the current turn's token. Player usable command.
  
***`!itp -saveFavs`***
Save your current Favorites into in the GM notes section of a handout called "ITPFavsJSON". This can be copy/pasted into a handout with the same name in another lobby and then "!itp -loadFavs" can be run to load them there.
  
***`!itp -loadFavs`***
Load Favorites previously saved via "!itp -saveFavs". Requires the handout "ITPFavsJSON" to exist and have properly exported data in the GM notes section.
  
***`!itp -setIndicatorImage`***
Replaces the current initiative indicator with a new image
**Note:** The token will be removed from the field, along with any others with the name 'tracker_image'
* Place the image you wish to use as the indicator image (animated turn indicator) on the play field (any layer).  Please note, rollable tokens can be used for this as well.
* Edit the new token and change it's name to 'tracker_image', save the change
* Pause the tracker if it's currently active
* Use this command
* Unpause the tracker if it was active, else wise the next time the tracker is started your new indicator will be used.
  
***`!itp -defaultIndicatorImage`***
Revert the initiative indicator to the original green one.
* Pause the tracker if it's currently active
* Use this command
* Unpause the tracker if it was active, elsewise the next time the tracker is started the indicator will be the default green one.

***`!itp -setConfig [key]:[value]`***
Changes various configuration values.  Permitted keys and what they expect for values are:
* trackerImgRatio - [2.25] - a decimal number, how much larger than the token it's highlighting that the turn indicator should be
* rotation_degree - [15] - an integer number, how many degrees per step of the indicator animation that it rotates.
* rotation_rate - [250] - an integer number, how many milliseconds between frames of the animation, smaller numbers are a faster animation but will load down roll20 more.
* round_separator_initiative - [-100] - an integer number, displays the "initiative" for the round separator 100 will put it at the top of the round, -100 will put it at the bottom of the round.
* rotation - [true] - true or false, turns the spinning animation for the turn indicator on (true) or off (false)
* show_eot - [true] - true or false, shows or hides the EOT button when announcing actor turns.
* turncolor - [#D8F9FF] - Hex color code, changes the color of the background of the chat message announcing who's turn it is.
* roundcolor - [#363574] - Hex color code, changes the color of the round announcement chat message.
* statuscolor - [#F0D6FF] - Hex color code, changes the color of the text of the chat message announcing statuses of the current actor.
* statusbgcolor - [#897A87] - Hex color code, changes the background color of the chat message announcing statuses of the current actor.
* statusbordercolor [#430D3D] - Hex color code, changes the color of the border of the chat message announcing statuses of the current actor.
* statusargscolor [#FFFFFF] - Hex color code, changes the color of the feedback text when changing the marker for a status.
* eotcolor [#FF0000] - Hex color code, changes the color of the EOT button.




