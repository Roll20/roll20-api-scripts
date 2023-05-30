# StatusTracker
A helper script for managing timed status effects in the turn tracker and 
associated markers on game tokens. The script allows you to define a timed 
status effect, any token markers for that effect, and add/remove targets for 
those effects. If the status is timed, it will have a count-down place holder in
the turn tracker. If the timer goes to zero, or the effects "owner" is removed
from the turn tracker, the effect will be automatically removed, and associated
markers will be removed from targets of the effect.

The script provides a menu-based command interface allowing Game Masters to 
define a status effect, it's duration, and whether it's visible in the turn 
tracker. Each effect has sub-menu which allows targets for the effect to be 
added or removed: target tokens will have the effects marker placed on
them while the effect is active.

The script will attempt to create a macro to show the initial status tracker 
menu.

## Commands
The intended interface for Status Tracker is the chat menu system. You _can_ 
invoke the individual operations from the command line, but the Status Tracker
commands are expecting object ids and tags that are internal to Roll20, which 
the menus generate. It's possible to do from the command line, but I wouldn't 
recommend it.

`!statustracker showmenu` - Shows the general menu to manage status 
effects.


## Hard Reset
A commandline option to reset the StatusTracker global store exists, though it's 
not available in a menu. The following command will attempt to gracefully remove 
all StatusTracker-maintained objects, but in the end will reset the status 
tracker object in the global game state.

`!statustracker hard_reset`

## Menu System
Status Tracker is easiest to use with a menu system, with selected tokens on the
board being the subject of individual menu commands.

Click on the "Add Status" button with a token selected, or "Add Standalone Status":
![Status Tracker Menu](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen1.jpg "Status Tracker Menu")

![Add Status Name Input](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen2.jpg "Add Status Name Input")

![Add Status Duration Input](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen3.jpg "Add Status Duration Input")

![Add Status Visibility Input](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen4.jpg "Add Status Visibility Input")

![Add Status Marker Selection](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen5.jpg "Add Status Marker Selection")

![Status Submenu](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen6.jpg "Status Submenu")

![Status with Target Marker](https://smjack70-test.s3.eu-west-2.amazonaws.com/roll20/screen7.jpg "Status with Target Marker")