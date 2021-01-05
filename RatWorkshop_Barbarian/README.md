# Barbarian Class Module
This module is an add-on that requires the Dungeon Master Tools.
## Features
* Rage

## API Commands
See the Dungeon Master Tools for a full list of api commands that the full frame provides

## Actions
**!dm-action** barbarian _action_ _options_ - Used to dispatch an action to this class module.

**!dm-action barbarian rage _target_id_ _gender_** - If the target has the rage action, an Rage Item is added to the turn order, the target has the 'rage icon' applied, the 'Rage Damage' global modifier is checked, and a Rage message is sent to Chat 

Macro Example:
```
!dm-action barbarian rage @{selected|character_id} her
```
Set this as a Token Action, then when a user clicks on the action the Rage turn order Item will be added and the Rage Status will be applied to the Barbarian and the global modifier will be checked.