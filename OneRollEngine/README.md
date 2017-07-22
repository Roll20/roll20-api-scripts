One Roll Engine for Roll20
=============

This is a small script to parse matching sets from pools of dice. It is intended to support One Roll Engine games such as Reign and Wild Talents, but could also be used to support any system that requires matching sets of dice from a large pool (eg. Mistborn RPG).

How to use it
============

There are a few ways to use this utility:

### **Roll some d10's**  
Just /roll your pool of d10's. The script will append a list of matching sets in Width x Height format after your results.

__Note:__
If you want to use a different size die, this can be set in the configuration for this script.

### Use the new !sets die roll modifier
You can add this to any simple XdY roll and it will find sets for you. For example: `/roll 8d10 !sets`. You can combine this with any other dice rules, such as sorting or dropping. `/roll 8d10sa !sets` is the best one to use in your macros,
since it puts the dice in a nice sorted group.

### Use the !sets API command
If you use `!sets` followed by a dice pool, it will take care of sorting the dice for you! Great for macros.
