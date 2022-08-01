# Hero System 6e Heroic: HD Importer
A script for importing characters built in or acquired for HERO Designer into Roll20 Hero System 6e Heroic games. 

HD Importer attempts to translate as much of a [HERO Designer](https://www.herogames.com/store/product/1-hero-designer/) character as possible into a Roll20 [HeroSystem6eHeroic](https://github.com/Roll20/roll20-character-sheets/blob/master/HeroSystem6eHeroic/README.md) character sheet. There will invariably be rules, options, or build styles that do not translate well from HERO Designer into Roll20. Nonetheless, this importer should import most of the details of a character. The main shortcoming is currently the sheet's limit of ten powers. A future update to the character sheet will be needed to allow for more. At present, additional powers are imported as text notes and displayed in the text field below sheet "Complications" section.

This script was tested with the following commercial character packs:
- [Dead Orc Pass](https://www.herogames.com/store/product/910-dead-orc-pass-mini-campaign-book-pdfhdc/)
- [Kazei 5](https://www.herogames.com/store/product/92-kazei-5-character-pack/)
- [Monster Hunter International](https://www.herogames.com/store/product/5-monster-hunter-international-character-pack/)

# Installation:

From the caimpaign's home page go to Mods page via 'Settings -> Mod (API) Scripts.' 

From the Mods page select 'HeroSystem6eHeroic HDImporter' from the Mod Library dropdown list. Alternatively, create new script and copy and paste the contents of HeroSystem6eHeroic_HDImporter.js into the text editing box. Save the script.

Launch the game.

If HD Importer has started correctly the following notification should appear in chat when your Roll20 campaign starts up for the first time:
![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ScriptReady.png)

# Import a Character:

## HERO Designer

1. Download the export format file HeroSystem6eHeroic.hde from this respository and install it into your HERO Designer folder.
2. Create a new character or load a character file into HERO Designer.
3. Change the export format to HeroSystem6eHeroic.hde via the menu item "Current Character->Export->Set Export Format..."
4. Select "Current Character->Export->Export to File..." to save the character as a .txt file.
5. If the character has a profile image, save that as well.

## Text Editor
1. Open the exported character file in your favorite text editor.
2. Copy the entire contents (with cmd-A or ctrl-A).

## Roll20

1. Paste the copied text into the chat window of your Roll20 HeroSystem6eHeroic game.
2. Hit enter. If all goes well you should see a start and finish notification, which for the character "Alena" appears as
![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ImportSuccess.png)

## Notes

Quotation marks are used to indicate JSON data values. Please take care when using quotation marks in Hero Designer text fields. The exporter will attempt to remove them, but this may not be fullproof.

Hero Designer has fields for height, weight, eye color, hair color, a quote, and tactics notes. This information is not imported since the character sheet does not have corresponding fields.

Weapons, armor, and other equipment is imported as text and shown in the text field in the "Gear" page. HD Importer attempts to fill in the appropriate spaces in the sheet with the items it can identify, but HERO items often have additional information to track. Expect this area to require some degree of human attention.

Powers over the ten-power limit will appear in the text field below Complications. Additional perks and talents will appear in the text field below the Perks and Talents section. These items will not count toward the character's cost.

The base costs of powers that modifiy characteristics are added to the "Bonus" points field in the Tally Bar so that they are not counted twice in the character's total cost.

# Help
Access the in-game help menu by entering the command "!hero --help" into the chat window.

![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/HelpMenu.png)

# Configuration Options

The configuration menu is accessible from the Help Screen or via the chat window command "!hero --config". HD Importer offers a number of options to help organize imported characters and to pre-configure campaign options.

![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ConfigMenu.png)

- `Overwrite` : **CAUTION!** If set to true, when importing a new character, HD Importer will overwrite an existing character that has the same name.
- `Prefix` : Adds a text label to the beginning of an imported character's name.
- `Suffix` : Adds a text label to the end of an imporated character's name.
- `In Player Journal` : Presets the imported character's visiblity to players.
- `Player Control` : Presets the player control assigned to the imported character.
- `Use Char Maximums` : Presets the sheet option that figures characteristic maximums into point costs.
- `Literacy Costs CP` : Presets the sheet opttion that literacy costs 1 CP. Most common in Fantasy Hero campaigns.
- `Super-Heroic END` : Presets the option for higher endurance costs for strength.
- `Use Hit Locations` : Presets the sheet option to determine hit locations. 

# Credit
Hero-related code and modifications by [Villain in Glasses](https://app.roll20.net/users/633423/villain-in-glasses) (Discord: Villain#0604).

Based on D&D Beyond Importer by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) (Discord: Atheos#1095), [Matt DeKok](https://app.roll20.net/users/494585/sillvva) (Discord: Sillvva#2532), and [Ammo Goeetsch](https://app.roll20.net/users/2990964/ammo) (Discord: ammo#7063).

# Version history
Version 1.0 -- Initial release on August 1, 2022.
