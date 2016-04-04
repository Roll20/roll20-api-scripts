# Path Splitter

###### Required Scripts
* [Matrix Math](https://github.com/Roll20/roll20-api-scripts/tree/master/MatrixMath)
* [Path Math](https://github.com/Roll20/roll20-api-scripts/tree/master/PathMath)
* [Vector Math](https://github.com/Roll20/roll20-api-scripts/tree/master/Vector%20Math)

This script allows players to split up a polygonal path by drawing another
polygonal path on top of it. The original path is split up where it intersects
the splitting path. This script also supports scaled and rotated paths.

## To use:

1) Draw a a polygonal path over the path your want to split up. Set this path to
the splitting path color (by default this is pink: #ff00ff).

2) Select the path you want to split and the splitting path.

3) In the chat, enter the command ```!pathSplit```.

## Changing the splitting path color:

By default, the reserved color for the splitting path is pink (#ff00ff).
To change it, set your splitting path to whichever color you want to use.
Then, select it and enter the command ```!pathSplitColor``` in the chat.
