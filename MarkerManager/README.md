# Marker Manager
A helper script to make adding markers to tokens easier. A chat-based menu
system presents as list of all markers defined in a game, by name. The user
selects the marker to be added, and Marker Manager 

The script will attempt to create a macro to show the initial marker manager 
menu.

## Commands
The intended interface for Marker Manager is the chat menu system. You _can_ 
invoke the individual operations from the command line, but Marker Manager
commands are expecting object ids that are internal to Roll20, which the menu
generates. 

'!markermgr showmenu' - Shows the entry point menu.

On load, Marker Manager will create a Macro button to print the command menu in
chat. This menu is whispered to the GM.

## Menu System
Marker Manager is easiet to use with a chat-based menu system, with selected 
tokens on the board being the target of individual commands.

Click on "Add Marker to Token" to add an marker to the token.

Click on "Remove a Marker from Token" to remove the first instance of that marker
from the token.

Click "Clear" to remove all markers from a token.