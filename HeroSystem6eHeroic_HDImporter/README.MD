# Hero System 6e Heroic: HD Importer
A script for importing characters built in or acquired for HERO Designer into Roll20 Hero System 6e Heroic games. 

HD Importer attempts to translate as much of a [HERO Designer](https://www.herogames.com/store/product/1-hero-designer/) character as possible into a Roll20 [HeroSystem6eHeroic](https://github.com/Roll20/roll20-character-sheets/blob/master/HeroSystem6eHeroic/README.md) character sheet. There will invariably be rules, options, or build styles that do not translate well from HERO Designer into Roll20. Nonetheless, this importer should import most of the details of a character. The main shortcoming is currently the sheet's limit of ten powers. A future update to the character sheet will be needed to allow for more. At present, additional powers are imported as text notes and displayed in the text field below sheet "Complications" section.

This script was tested with the following commercial character packs:
- [Dead Orc Pass](https://www.herogames.com/store/product/910-dead-orc-pass-mini-campaign-book-pdfhdc/)
- [Kazei 5](https://www.herogames.com/store/product/92-kazei-5-character-pack/)
- [Monster Hunter International](https://www.herogames.com/store/product/5-monster-hunter-international-character-pack/)

# Instructions:

## HERO Designer

1. Download the export format file HeroSystem6eHeroic.hde from this respository and install it into your HERO Designer folder.
2. Create a new character or load a character file into HERO Designer.
3. Change the export format to HeroSystem6eHeroic.hde via the menu item "Current Character->Export->Set Export Format..."
4. Select "Current Character->Export->Export to File..." to save the character as a .txt file.

## Text Editor
1. Open the exported character file in your favorite text editor.
2. Copy the entire contents (with cmd-A or ctrl-A).

## Roll20

1. Paste the copied text into the chat window of your Roll20 HeroSystem6eHeroic game.
2. Hit enter.

## Notes

Weapons, armor, and other equipment is imported as text and shown in the text field in the "Gear" page. HD Importer attempts to fill in the appropriate spaces in the sheet with the items it can identify, but HERO items often have additional information to track. Expect this area to require some degree of human attention.

# Help
Access the in-game help menu by entering the command "!hero --help" into the chat window.

![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/HelpMenu.png)

# Configuration Options

The configuration menu is accessible from the Help Screen or via the chat window command "!hero --config". HD Importer offers a number of options to help organize imported characters and to pre-configure campaign options.

![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ConfigMenu.png)

- __Overwrite__ 
    If true, HD Importer will overwrite an existing character with the same name if present. Take care when using this option.
- __Prefix__ 
    - Adds a text label to the beginning of an imported character's name.
- __Suffix__ 
    - Adds a text label to the end of an imporated character's name.
- __In Player Journal__ 
    - Presets the imported character's visiblity to players.
- __Player Control__ 
    - Presets the player control assigned to the imported character.
- __Use Char Maximums__ 
    - Presets the sheet option that figures characteristic maximums into point costs.
- __Literacy Costs CP__ 
    - Presets the sheet opttion that literacy costs 1 CP. Most common in Fantasy Hero campaigns.
- __Super-Heroic END__ 
    - Presets the option for higher endurance costs for strength.
- __Use Hit Locations__ 
    - Presets the sheet option to determine hit locations. 

# Credit
This script is based on D&D Beyond Importer by Robin Kuiper, Matt DeKok, and Ammo Goeetsch.

Hero-related code and modifications by Villain in Glasses.

# Version history
Version 1.0 -- Initial release on July 30, 2022.
