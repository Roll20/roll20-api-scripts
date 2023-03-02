# autoButtons API script for Roll20

*IMPORTANT: This script requires tokenMod to apply damage & healing to tokens. I could recreate the functions for all that but.... surely the Venn diagram of "people installing API scripts" and "people without tokenMod" is just two distant, lonely circles?*

For documentation and support please visit Roll20:
### [autoButtons thread on Roll20](https://app.roll20.net/forum/permalink/10766392/)

## v0.8.x:
### Changes:
- Added API meta data
- Cleaned up code
- Submitted to one-click

## v0.7.x:
### Features:
- Queries can be used to perform a final operation on results before applying to token
- Buttons can be cloned and renamed
- Loads of new 5e buttons added, existing buttons given a facelift
- Button facade redesign, there are now 3 layers of content & style that can be applied
- Dark Mode can now be switched on
- Multiattack can be switched on for NPC's
- Allow Negatives: by default, negative values will now be ignored (preventing damage from causing healing, or vice versa)
- Autohide will hide buttons where no value is found (doesn't work for 5e crits due to roll template design)
- Report - simple reporting can be sent to chat to log the HP change (this is done by TokenMod)

### Changes:
- Two of the default buttons were renamed - this should be resolved in the upgrade path, requiring no action
- Added prompts for some actions, like deleting buttons from the UI
- New layers have been added to buttons, but won't effect existing custom buttons
- Buttons are now enabled upon creation, instead of hidden
- Numerous CSS tweaks and changes

### Bugfixes:
- Fixed bug preventing queries from working in internal buttons
- Fixed hldmg issue where it couldn't be used in custom buttons for 5e
