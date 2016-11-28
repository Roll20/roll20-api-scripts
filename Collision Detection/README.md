## Collision Detection

There are three configuration options available to you:

* `Path Color`: The script only considers paths of a specific color, allowing you to also use paths of other colors which your players will not collide with. By default, this is fuchsia (#ff00ff); the color is specified as a hexadecimal web color, which you can see when selecting a color from the drawing interface. A path's fill color is ignored.
* `Layer`: The script will only look at paths on the specified layer (valid values are "map", "objects", "gmlayer", or "walls"). You can also set this value to "all" and paths on every layer will be considered.
* `Behavior`: You can customize the script's behavior when a collision event is detected.

### Usage Notes

Currently, this script **only** considers **polygons and polylines** as "walls" to collide with, which means no freehand drawings or circles/ovals. Additionally, the math in the script does not handle paths which have been resized or rotated.

Tokens which can only be moved by the GM (no player is assigned to control it, and the token isn't linked to a character sheet which is assigned to any player) do not collide with walls. This will let the GM move things around at will. However, if the GM is assigned as the controlling player for a token, or if the token is linked to a character sheet which has the GM assigned as the controlling player, the token will collide with the walls.

The script will break if you go "warp speed" by holding down an arrow key to move, and the token passes through multiple walls before the script catches up. (If you drag a token through multiple walls, the script will collide at the first one.)

In most cases, the dynamic lighting will not update before the token's position is reset to the correct side of the wall (assuming a relevant behavior is set), meaning the player won't see what's on the other side (if the wall is on the DL layer or there's a similarly-positioned wall on the DL layer). However, sometimes the DL will update first, and the player will catch a glimpse of the other side.