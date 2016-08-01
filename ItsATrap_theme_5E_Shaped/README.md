# It's A Trap! - 5th Edition (Shapedv2) theme

_v1.1 updates:_
* The theme now supports the 'fx' basic JSON property made available in It's A Trap! v2.3.

This is a D&D 5th edition trap theme for the It's A Trap! script, compatible with
the 5th Edition (Shapedv2) character sheet by Mlenser.

It provides support for D&D 5th edition mechanics to automate resolving trap
attacks, saving throws, and passive searching.

To use this theme for the It's A Trap! script, enter "5E-Shaped" for the ```theme``` user option.

## TrapEffect properties

This TrapTheme supports the following TrapEffect JSON properties in addition
to all the basic TrapEffect JSON properties:
* attack (int): The trap's attack roll bonus. Omit if the trap does not make an attack roll.
* damage (string): The dice roll expression for the trap's damage. Omit if the trap does not deal damage.
* hideSave (boolean): If true, then only the GM will see the saving throw rolled for the trap.
* missHalf (boolean): If true, then the trap deals half damage on a miss.
* notes (string): A reminder about the trap's effects, which will be whispered to the GM.
* save (string): The saving throw for the trap. This can be one of 'str', 'con', 'dex', 'int', 'wis', or 'cha'.
* saveDC (int): The saving throw DC for the trap.
* spotDC (int): The DC to spot the trap with passive wisdom (perception). When a character spots the trap, its trigger area will be circled.

### Example of use:

Here are a couple of trap JSON examples to get you started:

*Attacks vs AC*

```
{
	"attack": 4,
	"damage": "2d8 + 6",
	"message": "A pressure plate gives way and darts fire forth from hidden compartments in the walls!",
	"notes": "If the character is hit, they also become poisoned.",
	"spotDC": 14
}
```
The above example will have the trap make an attack against the victim's AC with a +4 bonus to its attack roll.
On a hit it does 2d8+6 damage.
The "notes" field is a message that is whispered to the GM as a reminder about anything else that happens with the trap.
The "message" is shown to everyone when the trap is triggered to describe what the trap is, and any other flavor text associated with it.
The DC to spot the trap with passive perception is 14.

*Requires Saving Throw*

```
{
	"damage": "8d6 + 8",
	"fx": "explode-fire",
	"message": "A magical glyph flashes to life and then erupts in a whirling storm of fire!",
	"missHalf": true,
	"notes": "The sound of the trap going off alerts the mindflayers in area K26.",
	"save": "dex",
	"saveDC": 16,
	"sound": "explode",
	"spotDC": 20
}
```
The above example will have the victim make a dexterity saving throw against DC 16. For the "save" property, you can specifiy any of the following: "str", "dex", "con", "int", "wis", or "cha".
The trap deals 8d6+8 damage on a hit and has a passive perception DC 20 to spot it.
The "missHalf": true line tells the trap that it still does half damage on a miss.
The "sound" property specifies the same of a sound in your jukebox to play when the trap activates.


## Notes on trap automation:
The theme's automated attacks and saving throws do not account for conditional
modifiers, Advantage, or Disadvantage. Players will need to apply those in an
ad hoc fashion.

If a trap deals damage, the theme will not automatically subtract
the damage from the character's hit points. Players will still need to do that
themselves after applying conditional modifiers to their AC/saves,
applying damage resistance, vulnerability, etc..
