# It's A Trap! - Roleplaying is Magic 4E theme

_v1.1 updates:_
* The theme now supports the 'fx' basic JSON property made available in It's A Trap! v2.3.

This is a My Little Pony: Roleplaying is Magic 4th edition theme for the It's A Trap! script,
built for use with the Roleplaying is Magic 4E character sheet.

It provides support for automated passive perception of traps using a passive
Perception skill roll, and it allows automated skill rolls to avoid activated traps.

To use this theme for the It's A Trap! script, enter "MLP-RIM-4" for the ```theme``` user option.

## TrapEffect properties

This TrapTheme supports the following TrapEffect JSON properties in addition
to all the basic TrapEffect JSON properties:
* damage (string): The dice roll expression for the trap's damage. Omit if the trap does not deal damage.
* missHalf (boolean): If true, then the trap deals half damage on a miss.
* skill (object)
  * attr (string): The skill's primary attribute (used if the character is not trained in the skill).
  * dif (int): The difficulty for the skill check.
  * name (string): The name of the skill.
* spotDif (int): The difficulty to spot the trap with a passive Perception skill check.

*Example JSON*

Here's an example of how to use the trap JSON for this theme:

```
{
  "damage": "2d6 + 5",
  "fx": "explode-fire",
  "message": "Spectral spears suddenly launch out of the ground!",
  "missHalf": true,
  "skill": {
    "name": "dodge",
    "attr": "body",
    "dif": 10
  },
  "spotDif": 8
}
```

This trap makes the character roll a dodge skill check when it is activated
(if they don't have that skill, the character rolls a Body check instead).
The difficulty for the skill check is 10. On a hit, the trap deals 2d6 + 5 damage.
On a miss, the trap deals half damage.

### Note about passive Perception

The Roleplaying is Magic 4E system doesn't actually have any defined rolls for
passive skill checks. For the purpose of this script, a character's passive Perception is
calculated as follows:

```
4 + (total Advantage/Disadvantage modifier) + Mind + (3 if trained) + (2 if improved) + (1 if greater) + (total Misc modifiers)
```

So for example, a character not trained in Perception with a Mind of 2 would
have a passive Perception of 6. A character trained in Perception with a Mind
of 4 would have a passive Perception of 11.

## Notes on trap automation:
The theme's automated attacks and saving throws do not account for conditional
modifiers. Players will need to apply those in an ad hoc fashion.

If a trap deals damage, the theme will not automatically subtract
the damage from the character's Fortitude or Willpower. Players will still need to do that
themselves after applying conditional modifiers to skill check,
applying damage resistance, vulnerability, etc..
