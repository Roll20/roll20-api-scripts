# Savage Worlds Raise Roller

## Introduction
This script makes a standard Savage Worlds roll (Acing and exploding dice) and then displays a table of different target numbers and if the value rolled is a success or success with raise(s).  This makes it easier to quickly see what the result of a roll is without doing any math.  

## Syntax

```
!swrr [extra] DIE MODIFIER
```
- extra - This is an optional flag that indicates the roll is for an extra and do not use the wild die.
- DIE - the number of sides for the die to roll (for example, 10 is d10, 6 is d6)
- MODIFIER - the bonus or penalty to add to the roll.


__examples__
```
!swrr extra 8
```
Roll a d8 for an extra (no wild die) with no bonuses.
```
!swrr 10 2
```
Roll a d10 for a wild card with +2 modifier

## Output

Output from the script is pretty printed format in the chat window but contains information similar to this example:


__Player Name__<br>
Rolling __1d10 +2__ = ___[8]___

4: Success with raise<br>
5: Success <br>
6: Success <br>
7: Success <br>
8: Success
