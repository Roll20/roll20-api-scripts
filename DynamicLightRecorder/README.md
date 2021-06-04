# Script to bind default Dynamic Lighting paths to map tiles for Roll20

This is a script for use with the Roll20 API. It connects dynamic lighting paths with map graphics, so that you can move your map components around without having to worry about manually re-drawing the dynamic lighting paths. 

##Main Features
* Save dynamic lighting paths for particular map graphics/tiles
* Automatically redraws the DL paths whenever an instance of a linked graphic is dropped on the canvas
* Moves linked DL paths with a graphic whenever the graphic is moved, rotated, flipped or scaled
* Manages user-controllable doors with associated DL paths. Users can rotate doors to see them open.
* Can export/import DL path definitions to allow sharing with other users
* Transmogrifier safe!

## Concepts
* **Template** A template is a set of DL paths for a particular map graphic
* **Global Template** A template that applies, by default, to every instance of a particular map graphic that is dropped on the canvas
* **Local(or Detached) Template** A template attached to an individual graphic on the canvas - will follow this graphic but won't apply to other graphics with the same image
* **Linking** Linking a set of DL paths to a particular map graphic, either globally or locally
* **Indirect Door** A door graphic that sits on the map layer, with a semi-transparent control token on the token layer which can be rotated to open/close the door
* **Direct Door** A door graphic that sits on the token layer and can be rotated directly by the players. Only works with door tokens that are drawn with the hinge in the middle of the token so that they rotate correctly. A clear placeholder image is placed on the map layer as a handle to allow the GM to move the door around.
* **Detaching** Making a local copy of a global template for a particular graphic, so that the DL paths for it remain unaffected by changes to the global template

## Installation
Copy DynamicLightRecorder.js into the API scripts for you campaign. It has no external dependencies.

## Usage
###Linking dynamic lighting paths
Drop a map tile on the map layer. Using the polygon or rectangle tools (not any of the others - it won't work properly!), draw in the light blocking paths for that tile, but do it on the map layer (or move them to the map layer after you've drawn them). It probably works best if you scale the tile to the size that you will usually use it before drawing the lighting blocking paths.

Once you have drawn all the paths, select them and the tile they relate to together and run:

```
!dl-link
```

This will register the connection between that tile and the paths you've set up for it. When you next drop the same tile from the Art Library, the system will automatically recreate the paths that you previously drew. It will also scale, rotate and move them with the tile.

By default, you can't link a tile that already has DL paths linked to it (to prevent you overwriting your work by accident). If you want to redefine the paths for a tile that you've already linked, select it and the new paths and run:,

```
!dl-link --overwrite
```

This will replace the existing bindings with the new ones. It will not update any existing tiles with the new light blocking until you move, rotate or scale them, at which point they will redraw. You can force a redraw for selected tokens, or the whole campaign, by using the `!dl-redraw` command (see below).

###Local templates
In some situations you want DL paths to follow a particular tile as you move it around, but you don't want those paths to apply to every instance of that tile in your campaign. For this you need a local template. To create a local template, follow the same process outlined above, but run:

```
!dl-link --local
```
This will define the template just for the individual tile/graphic. You can even create a local template for a graphic that already has a global template, in which case the local one will take precedence (useful for special-case overrides of standard map tiles).

### Doors
The script can also manage doors for you. Drop the door graphic on the map layer. The script makes some assumptions about door graphics when recording them: 
* the door should be horizontal
* The hinge should be on the left.
* the door should be vertically centred in its graphic
* the door should occupy the full width of the graphic (unless you tell it otherwise - see below)

Move/rotate/flip your door so that it satisfies these conditions. Then select the door and run:

```
!dl-door
```

This will create a lighting path for the door (running through the middle of it), and will also create a magic rotation token centred on the hinge on the token layer. Give control of this token to any player that you want to be able to control the door. When this token is rotated, the door will rotate accordingly, opening and shutting. Naturally this move the DL path for the door as well.

If run on a door token alone, the command will assume that the door occupies the full width of the token. If this is not the case (e.g. for doors that are designed to pivot properly around the centre of their token), you can draw a rectangular path around the part of the token that represents the door itself. Select this along with the token image before running `!dl-door` and the command will position the hinge of the door at the vertical middle of the left hand edge of the path.

One downside of the door system is that the door animates slightly clunkily thanks to the way Roll20 handles token moving. If you have door tokens that already rotate properly around their centre, you can select one and run 

```
dl-directDoor
```

Note that this command also assumes your door's hinge is on the left, so rotate your token appropriately. With this command, instead of creating a transparent control token at the hinge of the door, it makes the door image itself into a control token on the objects layer. This means that players can rotate the door image directly, which means that it will respond directly to player input, rather than updating when it's dropped back on the canvas. Since the door image resides on the token layer, and since the script automatically undoes any attempt to move or scale the door token (other than rotating it), the script creates an identically shaped, linked, clear token on the map layer that matches up with the door token. The GM can use this as a handle to move the door around.

###Local doors
Both the door commands support the --local switch in exactly the same way as the `!dl-link` command, so you can configure individual door tokens rather than campaign-wide bindings if you wish.

###Door angle restrictions
By default, doors can rotate 90 degrees in each direction from the position that you place the map layer token. If you want to change this, edit the bar1_value and bar1_max values for the door graphic before running the `!dl-door` or `!dl-directDoor` command. bar1_value is the maximum counter-clockwise rotation in degrees and should be a negative number. bar1_max is the maximum clockwise rotation in degrees  and should be a positive number. Whenever you move the map layer token for a door, this redefines the zero point against which these limits are calculated. When you or the players rotate the token layer control token, it checks to see if the requested position is within the defined bounds relative to the map token zero point. If not, it positions the door at the closest limit to the angle requested. It's not as complicated as it sounds in practice. 

You may well find that you want to define custom limits for individual doors; to do this, create a local template for the door with the relevant restrictions. I may add some commands to simplify this process at a later point.

### Import/Export
Once you have built up a set of templates for map tiles and doors using the commands above you can export them for others to use. Run
```
!dl-export
```
and the script will dump a big bunch of text out into the chat window. If you have some map tiles selected when you run this command, the export will be limited to these rather than everything the script knows about. Copy this text and share it with your friends on Roll20. They need to type 

```
!dl-import -- <exportedText>
```

replacing <exportedText> with the text that you exported. This will import all your carefully drawn paths into their campaign. Points to note:

* By default this will not overwrite any templates that they've created for the same map tiles. Run
```
!dl-import --overwrite -- <exportedText>
```
 to overwrite any existing definitions with those from the import
* This *will not work* with tiles that you've uploaded to your library, for obvious reasons - the tiles need to be stored at some commonly accessible URL (marketplace content or content referenced directly from the web).

### Redrawing
If you redefine a global template for a graphic, it won't immediately update the DL paths for all the existing instances of that graphic until you move or otherwise adjust them. You can force a redraw of the selected tokens by running:
```
!dl-redraw
```
If you run this with nothing selected, it will redraw the DL paths for ***every tile that it manages*** in the whole campaign. ***Be careful!***

###Turning off auto-linking
If you don't want the script to automatically add DL paths for new graphics that you drop onto the canvas, you can run
```
!dl-config --autoLink false
```
The script will continue to manage existing graphics/doors that it knows about, but won't draw DL paths or make door control tokens for new graphics that are dropped on the canvas. You can re-enable it with
```
!dl-config --autoLink
```

### Reset
If it all goes wrong you can run 

```
!dl-wipe
```

... but be very careful, as this will throw away all of your global templates for all of your tiles and remove all of the corresponding DL paths and door controls. It will not delete local templates or the controls/paths they define. To delete these, simply delete the relevant graphics from the map layer and the script will clean up after itself. For a slightly safer version, select some map tiles/doors before running this command. This works as follows:
* For any graphic that has a local template, it will erase the local template. If there is also a global template for this graphic, this graphic will now use the global templateinstead (so this effectively works like a sort of 'reattach' command
* For any graphic that has no local template, but does have an associated global template, it will wipe the global template and remove on DL paths/door controls that refer to it. 
##Backups and Transmogrification considerations
The way that the tokens link to each other is relatively safe, and can also survive Transmogrification if the correct steps are followed (see below). It should be relatively difficult to lose the relationships between the paths and graphics.  The global templates, however, are stored in the API state for the campaign, which can get corrupted, (possibly by another script), and doesn't get Transmogrified. It is **strongly** recommended that you perform a ``!dl-export`` and save the results somewhere safe if you put a lot of work into defining DL paths with this system. Furthermore, if you Transmogrify stuff from your campaign, you should import the relevant global templates ***before*** you copy any objects into the new campaign. Once you've copied stuff over, you should run:
```
!dl-tmFixup
```
to reattach all the DL paths to their relevant map graphics. This could take a while on a big campaign, so I don't run it automatically on startup or in the background - it's up to you to run this once you've imported everything you need. 

##Debugging
If you find a bug in the script, it would help enormously if you could reproduce it with the logging turned up and then post the log information on the forum. To turn the logging up to maximum, run:
```
!dl-config --logLevel TRACE
```
This will generate a **lot** of logging, so you probably want to turn it off again afterwards:
```
!dl-config --logLevel INFO
```

##Known issues/intended enhancements:
* Overwriting a directDoor global template leaves some orphan paths behind
* Automatically reset attempts to move DL paths
* Find a nice way to show door opening limits graphically (on GM layer?)
* Sometimes the control token for directDoors can be moved once after creation (thanks to the APICREATE cb thing)
* !dl-wipe destroys direct doors completely
* !dl-link on a tile that already has a local template will just overwrite the local template - this is probably right, although I think it should require —overwrite before doing it. I think we need another command, “makeGlobal” to push a local template up to global, which will also need a —overwrite option to ensure you don’t overwrite a global template accidentally.
* Allow setting local template with no paths - perhaps a special command for this?
* Creating a local door out of one that is already global creates an extra orphaned control token
* Very slight bug with rotation thanks to approximation of path height (doesn’t take stroke width into account)


Ideas for the future:
* SVG import/export
