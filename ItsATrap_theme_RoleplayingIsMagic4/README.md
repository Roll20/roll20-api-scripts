# It's A Trap! - 5th Edition OGL theme

This is a D&D 5th edition trap theme for the It's A Trap! script, compatible with
the 5th Edition (OGL by Roll20) character sheet.

It provides support for D&D 5th edition mechanics to automate resolving trap
attacks, saving throws, and passive searching.

To use this theme for the It's A Trap! script, enter "5E-OGL" for the ```theme``` user option.

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

## Notes on trap automation:
The theme's automated attacks and saving throws do not account for conditional
modifiers, Advantage, or Disadvantage. Players will need to apply those in an
ad hoc fashion.

If a trap deals damage, the theme will not automatically subtract
the damage from the character's hit points. Players will still need to do that
themselves after applying conditional modifiers to their AC/saves,
applying damage resistance, vulnerability, etc..
