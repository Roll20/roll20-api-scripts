# Page FX

_v1.2 Updates_
* There is now support for beam-like saved FX.
* Beam-like effects can now be given a random vector.

##### Dependencies:
* None

This script allows GMs to set up environmental special effects for their maps by producing customizable, randomly distributed fx over some area. This can be used to produce various sorts of atmospheric effects like rain, geysers, steam, bubbling magma, sparks, etc.

This script also exposes a ```PageFX``` object to allow script writers to use it programmatically.

## Creating effects

All the effects created with this script are centered around PageFX tokens which designate the effect's center, their area, their spawn rate, and the type of effect that is produced. To create an effect:

1. Create a token named "PageFX".
2. In its ```GM Notes``` property, specify the type of effect to produce. E.g. "explode-fire".
3. In its ```Bar 1 value``` property specify the spawn rate (in milliseconds) of the effect.
4. In its ```Aura 1``` property, specify the area of effect either as a circle or square with the desired radius.
5. If the effect is a beam-like effect ("beam", "breath", or "splatter"), specify the X and Y offsets (in units) of the effect's end point using the ```Bar 2 value``` and ```Bar 2 max``` properties, respectively. This can be set to "random" to make the effect fire in a random direction.

PageFX will start automatically when they are created and when the page is changed. When the active page is changed, all currently active effects will end and the new page's effects will begin automatically.

## Disabling effects

An effect can be disabled by setting its ```interdiction``` <img src="http://game-icons.net/icons/lorc/originals/png/interdiction.png" width="32"> status marker. (The one that looks like this: http://game-icons.net/icons/lorc/originals/png/interdiction.png)

## NullFX Areas

NullFX areas can be used to prevent PageFX from being spawned in a square or
circular area. To create a NullFX area:

1. Create a token named "NullFX".
2. In its ```Aura 1``` property, specify the area of effect either as a circle or square with the desired radius.

## Chat commands

#### Turn on all PageFX

The ```!pageFX on``` command can be used to reactivate all the PageFX on the current page, except those that are disabled.

#### Turn off all PageFX

The ```!pageFX off``` command can be used to deactivate all the PageFX.

## Known issues:
* If the Roll20 game's tab becomes inactive, PageFX will continue to run because there currently isn't a way from the API to tell whether the Roll20 tab has become inactive. This can cause some significant lag when the user returns to the tab, especially for PageFX with a fast spawn rate.
