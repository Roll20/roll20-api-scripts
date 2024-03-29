# Clock Tokens

## What is it?

This script gives you an easy way to manage multi-sided tokens which are being used to represent [progress clocks](http://bladesinthedark.com/progress-clocks), or any other kind of incrementing timer or countdown.

## What does it do?

The script changes the token image of currently selected tokens based on the command given:

* ``!clocktokens next`` changes to the next 'side' of a multi-sided token. If already on the last side, no change.
* ``!clocktockens prev`` changes to the previous 'side' of a multi-sided token. If already on the first side, no change.
* ``!clocktockens first`` changes to the first 'side' of a multi-sided token. If already on the first side, no change.
* ``!clocktockens last`` changes to the last 'side' of a multi-sided token. If already on the last side, no change.

## User Options

* _GM Only_: (Default On) If enabled then only the GM can use the ``!clocktokens`` commands.
* _Use Macros_: (Default On) If enabled then token macros will automatically be created an maintained, one for each of the four commands above.

## Why use this over other token scripts?

This script was designed specifically for handling the large number of _Forged In The Dark_ and _Powered By The Apocolpyse_ games that I run. Multi-sided tokens take far too many clicks to move between sides, and there is no way to change multiple at once.

There are other token scripts with far more functionality, and if you feel you'll benefit from them then I recommend using those instead. However if you only want to flip multi-sided tokens back and forth in sequence then there's no need to bloat your game with a larger, more complicated script.

## Changelist

### _v1.0_ (2021-01-01)

* Script created

### _v1.1_ (2021-05-09)

* Changed logic to accomodate multi-GM games or games where the creator is not a GM.

### _v1.2_ (2022-04-24)

* Removed chat reporting of blocked commands, and fixed the issue where ClockTokens would report on commands sent to other scripts. Also corrected .readme file.

## _v1.2.1_ (2022-04-24)

* Fixed longstanding issue where useroptions were not being read correctly.