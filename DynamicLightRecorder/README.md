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

This will replace the existing bindings with the new ones. As things stand it will not update any existing tiles with the new light blocking until you move, rotate or scale them, at which point it will redraw. You can force a redraw for selected tokens, or the whole campaign, by using the `!dl-redraw` command (see below).

### Doors

The script can also manage doors for you. Drop the door graphic on the map layer. The script makes some assumptions about door graphics: 
* the door should be horizontal
* The hinge should be on the left.
* the door should be vertically centred in its graphic

Move/rotate/flip your door so that it satisfies these conditions. Then select the door and run:

```
!dl-door
```

This will create a lighting path for the door (running through the middle of it), and will also create a magic rotation token centred on the hinge. Give control of this token to any player that you want to be able to control the door. When this token is rotated, the door will rotate accordingly, opening and shutting. Naturally this move the DL path for the door as well.

If run on a door token alone, the command will assume that the door occupies the full width of the token. If this is not the case (e.g. for doors that are designed to pivot properly around the centre of their token), you can draw a rectangular path around the part of the token that represents the door itself. Select this along with the token image before running `!dl-door` and the command will position the hinge of the door at the vertical middle of the left hand edge of the path.

One downside of the door system is that the door animates slightly clunkily thanks to the way Roll20 handles token moving. If you have door tokens that already rotate properly around their centre, you can select one and run 

```
dl-directDoor
```

Note that this command also assumes your door's hinge is on the left, so rotate your token appropriately. With this command, instead of creating a transparent control token at the hinge of the door, it makes the door image itself into a control token on the objects layer. This means that players can rotate the door image directly, which means that it will respond directly to player input, rather than updating when it's dropped back on the canvas. Since the door image resides on the token layer, and since the script automatically undoes any attempt to move or scale the door token (other than rotating it), the script creates an identically shaped, linked, clear token on the map layer that matches up with the door token. The GM can use this as a handle to move the door around.

### Import/Export

Once you have built up a set of templates for map tiles and doors using the `dl-attach` command you can export them for others to use. Run
```
!dl-export
```
and the script will dump a big bunch of text out into the chat window. Copy this text and share it with your friends on Roll20. They need to type 

```
!dl-import -- <exportedText>
```

replacing <exportedText> with the text that you exported. This will import all your carefully drawn paths into their campaign. Points to note:

* By default this will not overwrite any templates that they've created for the same map tiles. Add --overwrite to overwrite any existing definitions with those from the import
* This *will not work* with tiles that you've uploaded to your library, for obvious reasons - the tiles need to be stored at some commonly accessible URL (marketplace content or content referenced directly from the web).

### Redrawing

If you redefine the template paths for a particular map tile, it won't immediately update the DL paths for all the existing instances of that tile until you move or otherwise adjust them. You can force a redraw of the selected tokens by running:
```
!dl-redraw
```
If you run this with nothing selected, it will redraw the DL paths for ***every tile that it has a template for*** in the whole campaign. ***Be careful!***

### Reset
If it all goes wrong you can run 

```
!dl-wipe
```

... but be very careful, as this will throw away all of your trained paths for all of your tiles. It will not delete any light blocking for existing tiles on the canvas, however.

Ideas for the future:

* Mark some instances of a tile as special, don't redraw with standard template, but just keep the existing light blocking with rotation/scaling/movement support.
* Transmogrifier compatibility
* Selective export - only export templates for selected tokens
* SVG import/export

