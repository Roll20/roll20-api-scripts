README.txt

This archive contains a character sheet and companion script for Fate of the Norns: Ragnarok to be used with roll20.net. This is a BETA implimentation and is not guranteed to be stable, use at your own risk. This README assumes you already have some familiarity with the roll20 environment.

Instructions:
1) You must be a Roll20 Pro subscriber and you must be the owner of the Roll20 game page

2) From your game home page, go to Settings --> Game Settings
3) Under "Character Sheet Template" select "Custom"
4) Open FotN.html and FotN.css in a text editor (note, best to use a text editor like notepad and not a word processor like Word)
5) Copy the entire text of FotN.html and paste into the "HTML Layout" tab under "Character Sheet Template"
6) Copy the entire text of FotN.css and paste into the "CSS Styling" tab under "Character Sheet Template"
7) Press the "Save Changes" button
8) Open FotN Companion.js in a text editor (notepad)
9) From your game home page, go to Settings --> API Scripts
10) From the "Script Library" tab, search for MapChange and press the "Add Script" button if you just want to use the script (recommended) or the "Import" button if you think you might want to modify it (if you need me to explain this, you probably shouldn't try)
11) Copy the entire text of FotN Companion.js and paste it under the "New Script" tab
12) Change the name of the script to "FotN Companion.js" and press the "Save Script" button
13) If you have any previous scripts for FotN ("wyrd" or "cleanup") you should deactivate or delete them now.
14) You are now ready to set up your game
15) From your game home page, press "Launch Game"
16) In your game, make a map called "Playmats" (capitalized)
17) Drop a number of Playmat.png tokens equal to your number of players on to the Maps & Background layer. Arrange them as convenient and resize them until they are resonably sized. The size doesn't specifically matter (just the proportions), but if they are too small the text will overlap
18) For each playmat, edit them so that the Name is "$charName playmat" where $charName is the name of the character who will be using the playmat. That's one space and a lowercase "p" in playmat. It is a good idea to drop a textbox on the playmat with the name of the character, so you know who's it is
19) Under Macros, make a macro called playmat with the action text "!mc move --target Playmats" and select the "In Bar" checkbox
20) Make a macro called rejoin with the action text "!mc rejoin" and select the "In Bar" checkbox. These are the macros your players will use to switch between viewing the playmats and viewing the normal map
21) For each character, under the Attributes & Abilities tab make two abilities called "wyrd" and "cleanup"
22) The action text under "wyrd" should be: 
!wyrd --@{character_name} --@{Destiny}
23) The action text under "cleanup" should be:
!cleanup --@{character_name}
!cleanup --@{character_name}
24) Yes, make sure the command is repeated twice for cleanup. Select the "Show in Macro Bar" and "Show as Token Action" checkboxes as you wish
25) Under Decks, make a deck for each character and name that deck with the character's name (case matters)
26) Set each of the decks to a card size of 20px X 30px (default settings are ok for everything else)
27) Add cards equal to the number of runes the character has and upload the appropriate graphic from the images folder. <!IMPORTANT!>Upload the files from your computer, do not use files already uploaded to your roll20 assets. I don't know why images from your roll20 assets don't work, but they don't.
28) Choose an appropriate card back and save
29) You should now be ready to play. At a minimum, your characters will need to have the destiny field filled out on their character sheet for the wyrd program to work. Use the "Current" tab in the character sheet to keep track of conditions (playmats should automatically update). Use the rest of the character sheet as you see fit.

Description of API scripts:
The wyrd command will draw your destiny in runes and play them to the In-Hand portion of the playing character's playmat. Runes played by wyrd will stagger so that they don't overlap. A second instance of wyrd will overlap with a previous one
The cleanup command will remove runes to the deck and shuffle it. It will ignore runes in wounds, death, drain, and any selected runes (use shift-select to select multiple runes). It will NOT ignore runes in stun, so select them if you want to keep them out

Known Issues:
Using cleanup will cause "Card was not on the table." to be logged to the console. Ignore it.
If you change multiple conditions in rapid succession then sometimes one or more of them will not be caught and updated on the playmat. For best practices, update one condition at a time and either close the character sheet or switch to the Character tab between updates. If the playmat does fail to update, changing the condition and then changing it back should force an update with correct information.
Sometimes a rune graphic will become unlinked from the card object such that the image remains on the playmat while the deck regesters that all runes are in the deck. In this circumstance it is fine to delete the image from the playmat.

Troubleshooting:
If any of the scripts stop working, check the API console and if it shows and error, restart it. If wyrd stops working, manually recall and shuffle the decks. If that doesn't work, check the decks and make sure that all of them have a linked graphic for the cards. 