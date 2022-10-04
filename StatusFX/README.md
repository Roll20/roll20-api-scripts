# Status FX

_v1.2 Updates:_
* Added a user option to set the interval that it cycles through effects.
* Improved the script's ability to detect when status markers change.

This script allows you to assign special FX to appear on a token when status
markers are turned on. When multiple status FX are assigned to a token, it
will cycle through each one. Built-in and Custom FX are supported.

FX are assigned to status markers through the One-Click user options for the
script. For each status marker that you want to assign a special FX to, just
enter the name of the special FX. If it is a beam-like effect (such as beam,
breath, splatter, or a custom effect whose definition has an angle of -1),
also enter the vector for the effect's direction in the form ```[X, Y]```.
Beam-like effects can also be given a random vector with ```[random]```.

Note: For most statuses, this script looks best using custom special FX with a
short range and fewer,smaller particles.

### Examples:

*green* ```bubbling-acid```
Creates green bubbles on the token when the 'green' status marker is on.

*red* ```splatter-blood [1, -2]```
Creates a bleeding effect with blood spurting up and slightly to the right
when the 'red' status marker is on.

*death-zone* ```MyCustomEffect```
Creates some sort of custom effect when the 'death-zone' status marker is on.

*chemical-bolt* ```splatter-holy [random]```
Creates a spark effect fired in a random direction when the 'chemical-bolt'
status marker is on.

*custom* ```sleep: glow-holy|stars: beam-fire [2,3]```
Example of FX for CustomStatusMarkers.
Creates FX for the custom status markers 'sleep' and 'stars'.

## Help

My scripts are provided 'as-is', without warranty of any kind, expressed or implied.

That said, if you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/ada-l

When messaging me about an issue, please be sure to include any error messages that
appear in your API Console Log, any configurations you've got set up for the
script in the VTT, and any options you've got set up for the script on your
game's API Scripts page. The more information you provide me, the better the
chances I'll be able to help.

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts,
please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/publisher/165/ada-lindberg
