# Savage Worlds Status changer

This script makes it easy to assign a status to a set of selected tokens.  Call the script with the appropriate status name and the assigned marker is added to the token or set of tokens.  You can change what status marker is used, as well, to allow access to your custom markers or change which built in marker is used.

## Command Format

__!swstatus [status]__ =>
Toggles this status (on/off) and assigns the appropriate marker to all selected tokens.

*Available codes for [status]:*

- incap,           
- hold,            
- aim,             
- bound,           
- distracted,      
- vulnerable,      
- shaken,          
- climbing,        
- defend,          
- entangled,       
- stunned,         
- flying,          
- wound1,  
- wound2,
- wound3,
- fatigue1,
- fatigue2,
- thedrop

__!swstatus clear__ =>
Clears all status markers on the selected tokens.

__!swstatus current__ =>
Displays in the chat window the current statuses assigned to selected tokens.  If you forget what the icons indicate, this command prints them out in easy to read format.

__!swstatus changemarker [status] [marker system name]__ =>
Assigns a new status marker to one of the status's.  [status] is the same as list above and the [marker system name] is the name that Roll20 stores in the 'statusmarker' field for a token object.  

If you want to install custom tokens, use the UI to assign your status to the token and then use the '!swstatus dump' to get the names of all the markers.  Use the name for your marker (it will look something like 'mymarker::6433').

__!swstatus reset__ =>
Clears all the marker changes made with the 'changemarker' command. The status marker icons are reset to the defaults again.

__!swstatus dump__ =>
Dumps the content of the token's 'statusmarkers' field to the script console and chaty.  Useful for finding the name for your custom markers.  The output is very basic without formatting.

__!swstatus help__ =>
Displays the help text into the chat window.  

## Customizing the codes
If you want to customize the default markers to use modify the STATUSES array.

## Example Macro
This is a sample macro that has the most common statuses setup.  

```
!swstatus  ?{Status|
   Clear,clear|
   Current State,current |
   -------, current |
   Shaken,shaken|
   Dead,incap |
   Distracted,distracted|
   Vulnerable,vulnerable|
   First Wound,wound1|
   Second Wound,wound2|
   Third Wound,wound3 |
   Fatigued,fatigue1 |
   Exhausted,fatigue2}
```
