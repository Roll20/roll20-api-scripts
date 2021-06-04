# 5E BattleMaster
A roll20 API Script for DND 5e combat across the board, compatible with the 5E OGL character sheet system.

## Current Functionality
1. Handle attack rolls, saving throws, and damage dealing for:
    * Direct Weapon Attacks
    * Direct Spell Attacks
    * AOE Spell Attacks

## User Guide
To begin combat, the GM simply needs to type "!combat start". On each player's turn, they will be prompted with 4 options for actions. The players simply need to click a target if they're using a targeted action (such as a direct spell or a weapon attack) and then click the button of the action they want to accomplish, or simply click the button, in the cases of AOE Spell and Move. Then, every player needs to simply follow the instructions presented to them by the BattleMaster. Health is assumed to be in bar 3.
### AOE Spells
In order to use AOE spells, you must slightly change the "range" variable of the spell card. The range must be the following: "[distance castable or self] [AOE type] [AOE range]". For example, let's look at "Burning Hands". "Burning Hands" is a centered-on-caster spell that applies its effect in a 15 foot cone. Therefore, the range would be "Self Cone 15".

## Planned Functionality
1. Add FX to combat spells based upon spell damage types and characteristics.
2. Improve "understanding" of various rolls and their characteristics.
3. Factor in weapon and spell range to attacks
4. Limit player movement based on bar1 as movement speed
5. Attempt to implement class-specific combat features for all base 5E classes
6. Find a better way to get advantage and disadvantage factored into rolls