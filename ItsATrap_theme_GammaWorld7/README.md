# It's A Trap! - Gamma World 7E theme

_v1.1 updates:_
* The theme now supports the 'fx' basic JSON property made available in It's A Trap! v2.3.

This is a trap theme to support the Gamma World 7E character sheet.

It provides support for D&D 5th edition mechanics to automate resolving trap
attacks, saving throws, and passive searching.

To use this theme for the It's A Trap! script, enter "GammaWorld7" for the ```theme``` user option.

## TrapEffect properties

This TrapTheme supports the following TrapEffect JSON properties in addition
to all the basic TrapEffect JSON properties:
* attack (int): The trap's attack roll bonus. Omit if the trap does not make an attack roll.
* damage (string): The dice roll expression for the trap's damage. Omit if the trap does not deal damage.
* missHalf (boolean): If true, then the trap deals half damage on a miss.
* notes (string): A reminder about the trap's effects, which will be whispered to the GM.
* defense (string): The defense targeted by the trap's attack. This can be one of "ac", "fort", "ref", or "will".
* spotDC (int): The DC to spot the trap with passive perception. When a character spots the trap, its trigger area will be circled.

### Example of use:

Here is a trap JSON example to get you started:

```
{
	"attack": 4,
	"damage": "2d8 + 6",
  "defense": "ac",
	"fx": "explode-fire",
	"message": "A pressure plate gives way and darts fire forth from hidden compartments in the walls!",
	"notes": "If the character is hit, they also become poisoned.",
	"spotDC": 14
}
```
The above example will have the trap make an attack against the victim's AC defense with a +4 bonus to its attack roll.
On a hit it does 2d8+6 damage.
The "notes" field is a message that is whispered to the GM as a reminder about anything else that happens with the trap.
The "message" is shown to everyone when the trap is triggered to describe what the trap is, and any other flavor text associated with it.
The DC to spot the trap with passive perception is 14.

## Notes on trap automation:
The theme's automated attacks and saving throws do not account for conditional
modifiers, Advantage, or Disadvantage. Players will need to apply those in an
ad hoc fashion.

If a trap deals damage, the theme will not automatically subtract
the damage from the character's hit points. Players will still need to do that
themselves after applying conditional modifiers to their AC/saves,
applying damage resistance, vulnerability, etc..
