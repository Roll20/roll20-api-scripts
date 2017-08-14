Exalted 3rd Edition Dice Roller
===============================

This is a more robust dice rolling script for use with the Exalted Third Edition game system. It is capable of not only counting 10s as two successes (or not, at the user's discretion), but also keeping track of other doubled successes as the result of charms, as well as handling rerolls.

The script's API command is `!exr`. For a complete command reference, type `!exr -help`.


Basic Syntax
============

The form a basic roll command takes is as follows: `!exr [no. of dice]#`. The user does not have to specify the success threshold, as it's always 7 in Exalted. This should cover the vast majority of rolls in Exalted 3rd Edition.

Full Syntax
===========

If you need extra functionality, the full syntax is `!exr [no. of dice]# [command1] [arg1],[arg2],[..] [command2] [arg3],[arg4],[...]`. A detailed description of the commands and their arguments follows:
* `-d`: The script will double 10s (that is, count 10s as two successes) by default, but if the user needs to double other number values, they can use the `-d` command (case sensitive; see below), followed by a comma-delimited list of die results to double (in addition to 10, which, again, is already counted).
* `-D`: If the user needs to _prevent_ the script from doubling 10s, they can pass `-D`, followed by a list of any values they would like to double. The `-d` and `-D` commands behave almost identically, save that the first automatically doubles 10s, and the other does not.
* `l[number]`: If the player needs to limit the number of doubled results they may accrue (as in the descriptions of some charms), they can attach `l` to the end of either double command, immediately followed by the maximum number of doubles from which they can benefit (e.g., `-Dl5 9,7` to get a roll that does not double 10s, but doubles 9s and 7s, and of which the script will only count up to 5 doubled results).
* `-r`: Some other charms in Exalted award the player rerolls. Most of these rerolls allow dice of a specified value to be rerolled once, and many allow the keeping of the higher result. This is the default behavior of the reroll command `-r`. Like the double command, this should be followed by a comma-delimited list of results to be rerolled.
* `-R`: Some other effects award a _recursive_ reroll, which allows the player to "reroll [x]s until [x]s fail to appear." This is accomplished with the `-R` command, which functions identically to the other version, save that it will continue to reroll the passed values until there are no more left among the results.
* `l`: The reroll commands also have an `l` modifier, but this one is used in conjunction with the `-r` command to force the script to keep the newer result, regardless of which result is higher (e.g., `-rl 6,5` to reroll 6s and 5s once each, and keep the new result, regardless of whether or not it is lower than the first).
I'll continue to try to add new features as I playtest this with my group, but that's all for now! Enjoy!

Macro
=====

It's a little clunky, but for my own game I did build a macro, which I released to all players, that simplifies the command entry process somewhat. It's a little long, but the defaults are set such that if one doesn't need anything fancy, you can fill in the number of dice you want to roll and just click through the rest. I've pasted the text of the macro below, for your convenience:

`!exr ?{How many dice?|0}# ?{Double 10s?|Yes, -d|No, -D} ?{Results to double? (e.g. "9,7")|} ?{Rerolls?|No, |Standard, -r|Recursive, -R} ?{Results to reroll? (e.g., "1,3")|}`

I called it "#General_Roll," but you can obviously call it whatever you want.


License
=======

Per the Roll20 Github README.md, this contribution to the user-generated script library is released under the MIT license (see the LICENSE file in the parent directory for details).
