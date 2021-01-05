# Paladin Class Module
This module is an add-on that requires the Dungeon Master Tools.
## Features
* Lay on Hands

## API Commands
See the Dungeon Master Tools for a full list of api commands that the full frame provides

## Actions
**!dm-action** paladin _action_ _options_ - Used to dispatch an action to this class module.

**!dm-action paladin lay-on-hands _paladin_id_ _target_id_ _amount_ _gender_** - If the paladin has the Lay on hands action and the target is a valid Token, then the target is healed up to the amount.  Checks are done to make sure the Paladin has the asked amount available and the target needs that amount healed.  For instance if the amount is 10 and the Paladin only has 9 Lay on Hands available then the target is only healed for 9; like wise if the target only needs for 7, then only 7 Lay on hands will be expended.

Macro Example:
```
!dm-action paladin lay-on-hands @{selected|character_id} @{target|character_id} ?{How much?|1} his
```

Set this as a Token Action, then when a user clicks on the action they will be prompt to select a Target and then asked how much to heal. 