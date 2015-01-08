## Collision Detection

There are three configuration options available to you:

* `config.pathColor`: The script only considers paths of a specific color, allowing you to also use paths of other colors which your players will not collide with. By default, this is fuchsia (#ff00ff); the color is specified as a hexadecimal web color, which you can see when selecting a color from the drawing interface. A path's fill color is ignored.
* `config.layer`: The script will only look at paths on the specified layer (valid values are "map", "objects", "gmlayer", or "walls"). You can also set this value to "all" and paths on every layer will be considered.
* `config.behavior`: You can customize the script's behavior when a collision event is detected.