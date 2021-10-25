# Technical Info

Technical information for contributors.

## To Do

- Add Mocha & Chia testing

## Release

Note any new releases here

### 1.1

@author: Cassie Levett
@version: 1.1
@new: initiative roller now evaluates the wounds toggle. It adds in wounds if its not a matrix character and toggle is on.
@revert: Changed the bars back to their original set. Bar color can be changed in Settings of the VTT. Stun being the most used damage is centered.

### 1.2

@author: Cassie Levett, additional contributions by R. William Morris
@version: 1.04
@new: Complete overhaul of coding documentation to make it easier to read and be understood
@new: Switched the colors/bars for stun and matrix damage; most video games identify health as red and mana as blue, so stun condition monitor is now the bar 2 (blue) and the matrix damage condition monitor is bar 1 (green)
@bugfix: Fixed problem in handleInput function that resulted in the apiMenu firing off whenever anything that wasn't a valid command was typed into chat.
@bugfix: Fixed some spelling errors and vague error responses in handleInput.
@bugfix: Fixed a problem with our Initiative Counter being added to the turnorder array with .unshift instead of .push, leading to a round automatically advancing incorrectly when the next person rolled initiative.
@bugfix: Fixed a formatting issue with the notification that a new Combat Round had begun; it should now match the styling for the rest of the API.
@bugfix: Removed some orphan helper functions that didn't do anything in v.1.03, including d6, getTokenURL, getTokenId, getTokenAttrsFromCharacterID, getIDsFromTokens and getTokenRepresents.
@bugfix: Consolidated sr5HelperFunctions.getCharacterIdFromTokenId function into a single function.
@bugfix: Folded the getSheetType helper function into the Character @class as .type.
@bugfix: Fixed a problem in addInitiativeToTracker where the turnorder wasn't sorted properly when initiative was rolled by more than once person in a turn (for example, when players are encouraged to click the button for their own initiative).
