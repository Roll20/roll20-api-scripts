# It's A Trap! - Pathfinder Generic theme

_3.5 Updates_
* Added support for Roll20's official Pathfinder sheet.

This is a Pathfinder trap theme built to support all Pathfinder character sheets and Pathfinder characters
who use plain attributes instead of character sheets.

This trap theme provides built-in support for Roll20's official Pathfinder sheet; Samuel Marino, Nibrodooh,
Vince, Samuel Terrazas, chris-b, Magik, and James W.'s community Pathfinder sheet; and for
my own Pathfinder 'Simple' sheet.

Other sheets, custom sheets, and characters based upon plain attributes are also supported.
For those, just fill in the names for the character attributes in the user options for
this script.

## Theme-specific properties
The following trap properties are specific to this trap theme script.

### Attack Bonus
The modifier for the trap's attack roll, if it makes an attack roll.

### Attack vs
This property specifies whether the trap's attack roll is against its victim's
AC, touch AC, or CMD.

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
property.

### Saving Throw DC
This property specifies the DC for the above saving throw.

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

If you continue to experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature, please reply to this thread:
https://app.roll20.net/forum/post/3280344/script-its-a-trap-v2-dot-3
or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=newest&type=all&genre=all&author=Stephen%20Lindberg)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
