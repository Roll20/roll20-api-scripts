# Status FX

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
