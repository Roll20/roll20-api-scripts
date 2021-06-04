# Geiger Counter

This script allows the GM to dynamically create radioactive areas in their
maps. Characters that have Geiger counters will be alerted how many rads
they are taking.

## To create a radioactive source object:
1. Create a token representing the source on the GM layer.
2. Set that token's 'radioactive' <img src="http://game-icons.net/icons/lorc/originals/png/radioactive.png" width="32"> status marker to on.
3. Set its ```aura1 radius``` to the distance at which characters will start
taking rads from it.
4. Set the ```bar1``` value to amount of rads/s characters will take at the edge
of its aura.
5. Set the ```bar1 max value``` to the maximum amount of rads/s characters can take
from it.

## To give a player a Geiger counter:
1. Give them a ```'hasGeigerCounter' attribute```.
2. Set the attribute to ```true```.

If a character moves in a radioactive area and they have a Geiger counter,
their Geiger counter will alert everyone how many rads/s they are taking.
If a character moves in a radioactive area and they don't have a Geiger
counter, only the GM will be alerted how many rads/s they are taking.
