# It's A Trap! - Pathfinder Generic theme

_3.6 Updates_

* Implemented automatic character sheet detection.
* User can also manually select which character sheet is being used in-game.
* User can specify custom sheet and its attributes in-game.

This is a Pathfinder trap theme built to support all Pathfinder character sheets.
By default, it will automatically detect which character sheet you're using,
but if needed, you can also specify which sheet the script is using from the
theme-specific trap properties.

This currently supports the following Pathfinder character sheets:

* Roll20
* Community
* Simple

## Theme-specific properties
The following trap properties are specific to this trap theme script.

### Character Sheet
Manually specify which character sheet your game is using. By default, this
will try to auto-detect your character sheet.

You can also specify that you are using a custom character sheet. If you do so,
an additional property will appear under this one to specify the attribute
names used for the custom sheet.

### Enable Passive Perception?
Specify whether to globally enable passive perception. Pathfinder doesn't normally
use passive perception, but the option is here for groups that want to use it.
This is set to 'no' by default.

### Attack Roll
This property specifies the trap's attack roll modifier and which type of AC it
targets (normal or touch), if it makes an attack roll.

### Damage
A dice expression for the damage dealt by the trap on a hit. This does not
take any damage resistances or immunities into account.

### Hide Save Result
This property specifies whether the result of the trap's saving throws will be
hidden from the players.

### Miss - Half Damage
This property specifies whether victims of the trap will still take half damage,
even if they avoided the trap. This does not take into account any special
abilities such as Evasion.

### Saving Throw
If the trap allows a saving throw, choose which saving throw it uses with this
property and specify the save DC.

### Spot DC
This property specifies the passive Perecption (10 + Perception skill modifier)
needed for a character to passively spot the trap.

## Trap Spotter ability

For built-in sheets, This Trap Theme supports the Rogue's Trap Spotter talent. It works for any
character that has Trap Spotter in the Class Abilities section of their
character sheet.

When the character approaches within 10' of a trap, they will
automatically get a perception check to try to notice the trap. The results
of this check are sent to the GM. If the Perception check is successful, the
players are also alerted about the trap's presence.

This ability only works with traps whose type is 'trap'. For the character's
Perception check, it uses their Perception skill total on their character sheet,
so it doesn't take into account any situational bonuses. It is the GM's job
to account for any situational bonuses that might contribute to the hidden
Perception check when the result is displayed to them.

## Help

Due to complications with the API reading attributes from certain character sheets,
there have been issues in the past with things such as saving throws or passive perception
not being correct. If this happens, first try adjusting the values for these on
your character sheet or try re-creating the character sheet from scratch to see
if that resolves the problem.

My scripts are provided 'as-is', without warranty of any kind, expressed or implied.

That said, if you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

When messaging me about an issue, please be sure to include any error messages that
appear in your API Console Log, any configurations you've got set up for the
script in the VTT, and any options you've got set up for the script on your
game's API Scripts page. The more information you provide me, the better the
chances I'll be able to help.

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts,
please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/search?category=itemtype:Art&author=Stephen%20Lindberg|Stephen%20L
