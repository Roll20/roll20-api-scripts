# Hero System 6e Heroic: HD Importer
A script for importing characters built in HERO Designer into Roll20 Hero System 6e Heroic games. 

HD Importer attempts, with caveats, to translate as much of a HERO Designer character as possible into a Roll20 games. The HeroSystem6eHeroic character sheet attempts to handle as much of the HERO game mathematical structure as possible, but HERO is a such a flexible system that this is difficult task indeed. There will invariably be rules, options, or build styles that do not translate well from HERO Designer. Nonetheless, this importer should import most of the details of a character. The main limitation is currently the limit of ten powers. A future update to the character sheet will be needed to allow for more. At present additional powers are imported as text only and displayed in text field below "Complications."

This script was tested with the following commercial character packs:
- Dead Orc Pass (PCs, NPCs, and monsters)
- Kazei
- Monster Hunter

# Instructions for use:

## In HERO Designer

1. Download the export format file HeroSystem6eHeroic.hde and install it into your export format folder of HERO Designer.
2. Create a new character or load a character file into HERO Designer.
3. Change the export format to HeroSystem6eHeroic.hde via the menu item "Current Character->Export->Set Export Format..."
4. Select "Current Character->Export->Export to File..." to save the character as a .txt file.

## In Roll20

1. Open the character text file in your favorite text editor.
2. Copy the entire contents and paste it into the chat window of your Roll20 Hero System 6e Heroic game.
3. Hit enter.

Access the in-game help screen by entering the command "!hero --help" into the chat window.

## Configuration Options

HD Importer offers a number of options to help organize imported characters and to pre-configure them.

## Import Notes

Weapons, armor, and other equipment is imported as text and shown in the text field in the "Gear" page. HD Importer attempts to fill in the appropriate spaces with the items it can identify. This area is likely the one that will require the most post-import human attention.

## Credit
This script uses the framework used by D&D Beyond Importer by Robin Kuiper, Matt DeKok, and Ammo Goeetsch.
