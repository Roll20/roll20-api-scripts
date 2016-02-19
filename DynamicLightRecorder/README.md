# Script to bind default Dynamic Lighting paths to map tiles for Roll20

This script is designed to let you mark up any map tiles you like on Roll20 with Dynamic Lighting paths, and then save these paths. Once you've bound paths to a specific tile, the script will automatically recreate them whenever you drop that tile on the canvas.

## Usage
###Attaching lighting paths
Drop a map tile on the map layer. Using the polygon tool (not any of the others - it won't work properly!), draw in the light blocking paths for that tile, but do it on the map layer (or move them to the map layer after you've drawn them). It probably works best if you scale the tile to the size that you will usually use it before drawing the lighting blocking paths.

Once you have drawn all the paths, select them and the tile they relate to together and run:

```
!dl-attach
```

This will register the connection between that tile and the paths you've set up for it. You can now delete the template tile and paths. When you next drop the same tile from the Art Library, the system will automatically recreate the paths that you previously drew. It will also scale, rotate and move them with the tile.

If you want to redo your light-blocking for a particular tile, drop a copy on your canvas, go to the DL layer, select all the paths that relate to it and move them to the map layer. Edit them as you need, deleting or adding as appropriate. Then select the whole lot and the underlying map tile again, and run:

```
!dl-attach --overwrite
```

This will replace the existing bindings with the new ones. As things stand it will not update any existing tiles with the new light blocking until you move, rotate or scale them, at which point it will redraw.

If it all goes wrong you can run 

```
!dl-wipe
```

... but be very careful, as this will throw away all of your trained paths for all of your tiles. It will not delete any light blocking for existing tiles on the canvas, however.

Ideas for the future:

* Update existing tiles with new light blocking
* Mark some instances of a tile as special, don't redraw with standard template, but just keep the existing light blocking with rotation/scaling/movement support.
* Doors!
* Transmogrifier compatibility
* Import/export for marketplace content so you can share your light-blocking with other Roll20 users!

