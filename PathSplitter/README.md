# Path Splitter

_Updates:_
_v1.1:_
* Pathsplitter now supports elliptical paths.
* If a splitting path isn't selected, it will display a message in the chat with the current splitting color.
* When the macro boots up, it installs a macro for its ```!pathsplit``` command.

This script allows players to split up a polygonal path by drawing another
polygonal path on top of it. The original path is split up where it intersects
the splitting path. This script also supports scaled and rotated paths.

## To use:

1) Draw a path over the path your want to split up. Set this path to
the splitting path color (by default this is pink: ```#ff00ff```).

2) Select the path you want to split and the splitting path.

3) In the chat, enter the command ```!pathSplit``` or activate the ```Pathsplitter``` macro installed with the script.

## Changing the splitting path color:

By default, the reserved color for the splitting path is pink (```#ff00ff```).
To change it, set your splitting path to whichever color you want to use.
Then, select it and enter the command ```!pathSplitColor``` in the chat.
