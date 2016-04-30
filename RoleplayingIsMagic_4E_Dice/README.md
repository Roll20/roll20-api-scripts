# Roleplaying is Magic 4E dice

*Dependencies*
* Roleplaying Is Magic 4E character sheet - v1.1+

*v1.1 Updates*
* The script now has an API.
* Compatible with the It's A Trap! MLP-RIM-4 theme.
* Requires v1.1 of the Roleplaying is Magic 4E character sheet.

This is a script for rolling dice checks checks for the
[Roleplaying is Magic: Season 4 edition](http://roleplayingismagic.com/),
a popular fan-created tabletop RPG system based upon the world of
My Little Pony: Friendship is Magic and developed by Roan Arts.

## Character sheet

This script is codependent with the [Roleplaying is Magic 4E character sheet](https://github.com/Cazra/roll20-character-sheets/tree/master/RoleplayingIsMagic_4E).
It can be used either by using the chat command documented in the script or
with the dice rolling buttons the character sheet's Skills section.

## Using it as a chat command

You can use this script to roll dice checks for the RiM 4 system using the
following chat command:

```
!r {skill name} [+/- ad hoc Advantages/Drawbacks] ["Any ad hoc notes about the skill roll"]
```

e.g. ```!r Stealth +1 "+2 if hiding in a wooded area"```

The skill name is case-insensitive and supports shortened names. For example
instead of rolling ```!r Spellcasting```, you can roll ```!r spell```.

*Important:* In order to roll a skill check for a character, you must be currently
speaking as that character in the chat.
