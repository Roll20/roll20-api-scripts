# Hero System 6e Heroic: HD Importer
A script for importing characters built in HERO Designer into Roll20 Hero System 6e Heroic games. 

HD Importer attempts to translate as much of a HERO Designer character as possible into a Roll20 HeroSystem6eHeroic character sheet. There will invariably be rules, options, or build styles that do not translate well from HERO Designer into Roll20. Nonetheless, this importer should import most of the details of a character. The main shortcoming is currently the sheet's limit of ten powers. A future update to the character sheet will be needed to allow for more. At present additional powers are imported as text notes and displayed in the text field below sheet "Complications" section.

This script was tested with the following commercial character packs:
- Dead Orc Pass
- Kazei (replicates, zone, droids, Hong Kong, and generic NPCs) 
- Monster Hunter (heroes, villains, and monsters)

# Instructions for use:

## In HERO Designer

1. Download the export format file HeroSystem6eHeroic.hde and install it into your HERO Designer folder.
2. Create a new character or load a character file into HERO Designer.
3. Change the export format to HeroSystem6eHeroic.hde via the menu item "Current Character->Export->Set Export Format..."
4. Select "Current Character->Export->Export to File..." to save the character as a .txt file.

## In a text editor
1. Open the exported character file in your favorite text editor.
2. Copy the entire contents (with cmd-A or ctrl-A).

## In Roll20

1. Paste the copied text into the chat window of your Roll20 HeroSystem6eHeroic game.
2. Hit enter.

## Help
Access the in-game help screen by entering the command "!hero --help" into the chat window.

## Configuration Options

HD Importer offers a number of options to help organize imported characters and to pre-configure them.

## Import Notes

Weapons, armor, and other equipment is imported as text and shown in the text field in the "Gear" page. HD Importer attempts to fill in the appropriate spaces in the sheet with the items it can identify, but HERO items often have additional information to track. Expect this area to require some degree of human attention.

## Credit
This script is based on D&D Beyond Importer by Robin Kuiper, Matt DeKok, and Ammo Goeetsch.
Hero-related modifications by Villain in Glasses.

## Version history
Version 1.0 -- Initial release on July 30, 2022.
