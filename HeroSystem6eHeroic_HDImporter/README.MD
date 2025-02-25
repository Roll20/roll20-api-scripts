# Hero System 6e Heroic: HD Importer
A script for importing characters built in or acquired for HERO Designer into a Roll20 Hero System 6e Heroic game. 

*HD Importer* attempts to translate as much of a [HERO Designer](https://www.herogames.com/store/product/1-hero-designer/) character as possible into a Roll20 [HeroSystem6eHeroic](https://github.com/Roll20/roll20-character-sheets/blob/master/HeroSystem6eHeroic/README.md) character sheet. There will invariably be rules, options, or build styles that do not translate well from HERO Designer into Roll20. Nonetheless, this importer should import most of the details of a character. 

This script was tested with the following commercially available character packs (almost 700 character files):
- [Champions Begins (free)](https://www.herogames.com/store/product/1005-champions-begins-pdfhd/)
- [Dead Orc Pass](https://www.herogames.com/store/product/910-dead-orc-pass-mini-campaign-book-pdfhdc/)
- [Dragon Bestiary 01 - Black Dragon](https://www.herogames.com/store/product/1080-dragon-bestiary-01-black-dragon-pdfhdc/)
- [Extinction Event: Hero Designer Pack](https://www.herogames.com/store/product/1045-extinction-event-hero-designer-pack/)
- [Fantasy Hero 6th Edition Character Pack](https://www.herogames.com/store/product/59-fantasy-hero-6th-edition-character-pack/)
- [Fistful of Fu: Real World Martial Artists](https://www.herogames.com/store/product/1015-fistful-of-fu-real-world-martial-artists-pdf-hdc/)
- [HERO System Bestiary 6th Edition Character Pack](https://www.herogames.com/store/product/79-hero-system-bestiary-6th-edition-character-pack/)
- [HERO System Martial Arts Character Pack](https://www.herogames.com/store/product/85-hero-system-martial-arts-character-pack/)
- [Kazei 5](https://www.herogames.com/store/product/92-kazei-5-character-pack/)
- [Monster Hunter International](https://www.herogames.com/store/product/5-monster-hunter-international-character-pack/)
- [Narosia HERO Designer Pack](https://www.herogames.com/store/product/544-narosia-hero-designer-character-pack/)
- [One-Sheet Encounters - Fallen Angel](https://www.herogames.com/store/product/1044-one-sheet-encounters-fallen-angel-pdf/)
- [Villainy Codex IV](https://www.herogames.com/store/product/898-villainy-codex-iv-–-arcana-whero-designer-files-zip/)

# Installation:

From the campaign's home page go to the Mods page via 'Settings -> Mod (API) Scripts.'

From the Mods page select 'HeroSystem6eHeroic HDImporter' from the Mod Library dropdown list. Version 2.4 is the most recent and recommended version. Alternatively, create a new script and copy and paste the contents of HeroSystem6eHeroic_HDImporter.js into the text editing box. Save the script.

Launch the game.

If *HD Importer* has started correctly the following notification should appear in chat when your Roll20 campaign starts up for the first time:
![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ScriptReady.png)

# Import a Character:

## HERO Designer
1. Download the latest export format file [HeroSystem6eHeroic.hde](https://github.com/Roll20/roll20-api-scripts/blob/master/HeroSystem6eHeroic_HDImporter/2.1/HeroSystem6eHeroic.hde) from this repository and install it into your HERO Designer folder.
2. Create a new character or load a character file into HERO Designer.
3. Select the export format HeroSystem6eHeroic.hde via the menu item "Current Character->Export->Set Export Format..."
4. Select "Current Character->Export->Export to File..." to save the character as a .txt file.
5. If the character has a profile image, save that as well.

## Text Editor
1. Open the exported character file in your favorite text editor (with some exceptions discussed below).
2. Copy the entire contents (with cmd-A or ctrl-A).

## Roll20
1. Paste the copied text into the chat window of your Roll20 HeroSystem6eHeroic game.
2. Hit enter. If all goes well you should see a start and finish notification, which for the character "Alena" appears as
![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ImportSuccess.png)

## Sample Characters
The [release folder](/HeroSystem6eHeroic_HDImporter/2.4/) contains three test and evaluation characters for use in HERO Designer (HDC) and Roll20 (TXT).
- `Sample_Character.hdc` is the fae wizard Darci.
- `Sample_Character_MA.hdc` is the doctor and martial arts swordsman Henkle.
- `Sample_Vehicle.hdc` is the near-future armored personnel carrier *Chariot*.

## Vehicles
While twenty powers is typically sufficient for most heroic characters, it is easy to create vehicles with far more, particularly for science-fiction settings. Sensors, life support systems, and the like can really add up. To avoid running out of space, I suggest following the Star HERO source book's examples, which use Variable Power Pools for sensors and other systems. Some powers can easily be described as custom talents or skills as well. If you want further detail on your vehicle sheet, consider defining various system powers in a VPP as equipment. These will be imported as equipment in the gear section, with power details printed in the adjacent text box.

Another point to make about vehicles is that *HD Importer* ignores the default ground and swimming movement attributes. The sheet refunds these movement attributes by default. That said, HD Importer will count these starting values in the total movement value of ground or swimming powers if added to a vehicle.

## General Notes
Try to avoid double quotation marks, which JSON files use for data values. If you would like to use them in your Hero Designer files, consider using single quotes instead. During the export process, Hero Designer will attempt to remove double quotes, but it may not catch them all.

Characters exported with older versions of HeroSystem6eHeroic.hde (1.0, 2.0, 2.1, 2.2, and 2.3) will work, but those exported with the latest version (2.4) will have more content and may benefit from bug fixes. Version 2.4 is the first to support vehicles.

Hero Designer has entries for eye color and hair color. This information is not imported since the character sheet does not have corresponding fields.

Attack powers and resistant defense powers will be imported as powers *and* as weapons and armor on the gear page. This feature is useful for vehicles, monsters, and superheroic characters that don't rely on equipment.

*HD Importer* attempts to fill in the appropriate spaces in the sheet with the items it can identify, but HERO items often have additional information to track. Details on weapons, armor, and other equipment appear in the text field in the "Gear" page. 

At present, the character sheet has twenty power, ten talent, and ten complication slots. Up to thirty additional powers and ten talents and complications, if found, will be imported as text and displayed in sheet notes fields. None of these overflow items will count in the sheet's automatic character point calculations.

Powers that add (or subtract) characteristics, movement, and perception abilities should be applied in the appropriate modifier fields.

> [!TIP]
> *HD Importer* will recognize the following key phrases if added to a piece of equipment's notes and attempts to automatically apply the values given.

- `(locations x-y, z) or (loc x, y-z)` : If *HD Importer* finds the keyword "locations" it will assign the list "x-y, z" to a piece of armor's locations. End the list with closed parentheses ")" or a semicolon ";".

- `Equipment` : A weapon with the "equipment" keyword will be imported as a piece of equipment, not a weapon. Useful for ordinary items built with attack powers. HD Importer will also copy any power with this keyword as a piece of equipment as well.

- `Max Range: XYZm or max range XYZ` : *HD Importer* will fill in a weapon's maximum range with XYZ.

- `X END/Turn or END/Turn: X` : If your campaign uses the optional rule of applying END costs to armor, *HD Importer* will automatically apply the value X.

# Help

Access the in-game help menu by entering the command "!hero --help" into the chat window.

![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/HelpMenu.png)

# Configuration Options

The configuration menu is accessible from the Help Screen or via the chat window command "!hero --config".* *HD Importer* offers a number of options to help organize imported characters and to pre-configure campaign options.

![HelpMenu](/HeroSystem6eHeroic_HDImporter/images/ConfigMenu.png)

- `Overwrite` : **CAUTION!** If set to true, when importing a new character, *HD Importer* will overwrite an existing character that has the same name. 
- `Prefix` : Adds a text label to the beginning of an imported character's name.
- `Suffix` : Adds a text label to the end of an imported character's name.
- `In Player Journal` : Presets the imported character's visibility to players.
- `Player Control` : Presets the player control assigned to the imported character.
- `Use Char Maximums` : Presets the sheet option that figures characteristic maximums into point costs.
- `Literacy Costs CP` : Presets the sheet option that literacy costs 1 CP. Most common in Fantasy Hero campaigns.
- `Super-Heroic END` : Presets the option for lower endurance costs for strength.
- `Use Hit Locations` : Presets the sheet option to determine hit locations.

# Troubleshooting Import Errors

Notepad++ and potentially other text editors may convert double quotes to pairs of single quotes. Check to see if pairs of single quotes exist in your character files. If they do exist, consider using another text editor or try replacing them with double quotes. Thank you to Jim E. for reporting this issue.

Please submit bug reports, feature requests, and general comments to [Villain in Glasses](https://app.roll20.net/users/633423/villain-in-glasses).

# Credit

Hero related code and modifications by [Villain in Glasses](https://app.roll20.net/users/633423/villain-in-glasses) (Discord: Villain#0604).

Based on *D&D Beyond Importer* by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) (Discord: Atheos#1095), [Matt DeKok](https://app.roll20.net/users/494585/sillvva) (Discord: Sillvva#2532), and [Ammo Goeetsch](https://app.roll20.net/users/2990964/ammo) (Discord: ammo#7063).

Apologies to Darci, who played the role of Duncan Idaho.

# Version history

Version 1.0 -- Initial release on August 1, 2022.

Version 1.1 -- Updated to accommodate the seventeen power slots available on the character sheet (May 4, 2023).

Version 2.0 -- Updated to support additional character sheet features as of sheet version 2.9. Updated version of Hero Designer export format (HeroSystem6eHeroic.hde to version 2.0). Adds support for 20 power slots with ten extra powers imported to text. Complications increased from seven to ten with up to an additional ten sent to text on the sheet. All HD description fields now recognized. Generates armor from Resistant Protection. Recognizes and applies powers that adjust characteristic and movement abilities. Adds more robust input error checking and avoids more quotation character troubles. Additional HD file pack testing. Bug fixes and 60% reduction in code size (April 27, 2024).

Version 2.1 -- Updated to support additional character sheet features as of sheet version 3.16. Updated version of Hero Designer export format (HeroSystem6eHeroic.hde to version 2.1). Expands support for martial arts maneuvers. Recognizes power notes and scans powers for damage advantages. Adds the everyman PS skill. Added a second sample character with martial arts skills. Bug fixes (August 9, 2024).

Version 2.2 -- Fix for compound power import failure. Recognizes Mental Combat Skill Levels and assigns levels and costs. Minor update to HeroSystem6eHeroic.hde (version 2.2). Improved formatting of text in powers, talents, and complications (September 14, 2024).

Version 2.3 -- This version is up to date with Sheet Version 3.80. Adds special intelligence skill types with variable base cost (SPx). Adds "Native +" language skill assignment for native languages updated to imitate dialects. Doubles the number of armor, weapons, and equipment imported to account for the new "A/B" sets feature of the sheet. Recognizes additional copies of weapons purchased with the quantity feature of HD. Adds recognition of the keywords and key phrases "Max Range XYZ" and "Equipment." HeroSystem6eHeroic.hde (version 2.3) updated to 50 equipment slots (November 13, 2024).

Version 2.4 -- Supports vehicles, which were introduced in sheet version 4.42. Vehicle characters have special power sections for up to two endurance reserves and two propulsion systems, which increases imported powers up to 24. While the base capacity for general powers remains twenty, up to thirty more will be imported and displayed in the Talents text box (requires HeroSystem6eHeroic.hde v2.4). Introduces the Size attribute. Supports the expanded general and combat skill capacities of the sheet. Imports armor and weapon-like powers as equipment (February 24, 2025).
