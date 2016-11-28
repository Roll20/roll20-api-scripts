## Slide Tokens

Emulate the results of moving a token through waypoints manually by using an API command.

### Commands
* !movetok _args_
* !mode _mode_

_mode_ may be one of **squares**, **units**, or **absolute**, or an alias for one of the modes (s, sq, square, u, un, unit, a, abs). _mode_ is not case-sensitive. If _mode_ is omitted or not a legal value, the current mode will be whispered back to you.

The !mode command can only be used by GMs.

_args_ is a space-separated list of changes to the selected token(s) position. Each argument is in the form [_direction_:]_coordinate_[,_coordinate_].

Each _coordinate_ is a number (which may be a fractional number or negative), and the second one is optional. _direction_ is optional, and may be one of:

* absolute (alias: a)
* left (alias: l, x)
* top (alias: t, y)
* right (alias: r)
* bottom (alias: b)
* top-left (alias: tl, xy)
* top-right (alias: tr)
* bottom-left (alias: bl)
* bottom-right (alias: br)

If _direction_ is "absolute", the coordinates will be treated as absolute coordinates on the map, with (0,0) being the top-left corner. All other directions are relative to the token.

The directions top, right, bottom, and left will all ignore the second coordinate if it is supplied. All of the other directions will treat the second coordinate as 0 if it is not supplied.

A positive coordinate given for left (the x-coordinate) will move the token to the right, and a positive coordinate given for top (the y-coordinate) will move the token down; this may be unintuitive for some users. The directions right and bottom will move the token in the opposite direction to left and top if given the same coordinate.

Coordinates are in terms of grid squares if the mode is SQUARES, in terms of the map measurement units if the mode is UNITS, or in pixels if the mode is ABSOLUTE. (If the page's grid size is set to 1 unit, then each grid square is equal to 70 pixels.) Note that if the map's grid size is 0 units (for example, if the grid is turned off), movement using SQUARES will not function.