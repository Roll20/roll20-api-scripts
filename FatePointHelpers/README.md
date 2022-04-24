# FATE Point Helper

## What is it?

This script gives you simple utilities to assist in running a FATE game.

## What does it do?

The has two sets of related functionality.

### Automatic token markers

If the user option 'Token Marker Name' is set, then the script will automatically add a numbered marker to every token in the campaign that represents a Character. This token marker will automatically update with the correct value as it is changed.

Specifically, it update:

* When a ``!fatepointhelper`` command is run.
* When the api is first loaded (``on("ready",...``).
* When the Fate point total on a character sheet is updated.
* When the GM moves the players to a new page.

### Modify FATE Point totals

It gives you commands and macros to increment, decrement, and reset a character or characters Fate Point totals. Resetting observes the FATE rules (based on refresh).

* ``!fatepointhelper add`` adds one fate point to each of the selected character's. Maximum of 9.
* ``!fatepointhelper remove`` removes one fate point from each of the selected character's. Minimum of 0.
* ``!fatepointhelper reset`` resets the selected character/s fate point totals to their refresh or current value, whichever is greater.
* ``!fatepointhelper resetall`` resets the current fate point total of all characters in the campaign.


## User Options

The following options are **must** be configured to match your character sheet. By default they are set to the value used by Evil Hats' official Roll20 FATE Character Sheet (https://github.com/Roll20/roll20-character-sheets/tree/master/Fate).

* _Fate Point Attribute Name_: The name of the attribute representing a character's current Fate Point total.
* _Refresh Attribute Name_: The name of the attribute representing a character's Refresh.

These options can be configured to your liking:

* _Use Macros_: (Default On) If enabled then macros will automatically be created an maintained, one for each of the four commands above. ``add``, ``remove``, and ``reset`` are token macros.
* _GM Only_: (Default On) If enabled then only the GM can use the ``!fatepointhelper`` commands.
* _Players Can Reset_: (Default off) If enabled then players can use the ``reset`` and ``resetall`` commands. Overridden by _GM Only_ setting.
* _Token Marker Name_: (Default blank) If not blank then the specified marker will be used to indicate the current fate point total on character-linked tokens. Supports custom markers. If multiple tokens with the same name exist, the first returned will be used.

## Changelist

### _v1.0_ (2022-04-24)

* Script created