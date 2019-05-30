# Check It Out

"Check It Out" provides the GM with capabilities to add descriptive properties to
objects on the VTT's "objects" layer. The script also provides a macro to the
players so that they can examine those objects and read their descriptions.

Optionally, for certain supported systems, the GM can assign additional
descriptive properties to objects requiring a die roll to reveal. For example,
it D&D 5 games, Investigation ability check DCs can be assigned to learn more
information about an object. When the player uses this script's macro to examine
the object, it will automatically roll an Investigation check and reveal
information about the object based on the hidden roll's result.

Currently, the following systems/character sheets are supported for the
automated Investigation check feature:

* D&D 5E:
    * Roll20
    * Community
    * Shaped
* Pathfinder:
    * Roll20
    * Community
    * Simple
* Starfinder:
    * Roll20

## Setting Object Properties

The GM can set properties for a selected object by using the ```CheckItOut_GM_Wizard``` macro installed by this script. This macro displays a menu in the chat visible only to the GM for setting up what message is displayed when a PC examines the object, as well as other properties, some of which may be system/character sheet-specific.

## Examining Objects

The PCs can examine an object using the ```CheckItOut``` macro. If the GM set up informational properties for the object, the PC will be informed about them through a whispered message in the chat. Additionally, the GM will be informed that that PC tried to examine the object.

Currently, only objects on the ```Objects``` layer can be examined.

## Character Sheet Themes

This script can be configured to use system-specific rules for examining objects
by selecting a supported character sheet from its configurations. These themes provide functionality such as being able to set skill checks on objects, which are applied automatically when a character examines the object.

Each theme is built to work with a specific character sheet. You can configure which
one you're using from the GM wizard's global configurations.

### Writing Custom Themes

If you're familiar with writing API scripts and character sheets, you can write your own custom theme by extending the CheckItOut.themes.CheckItOutTheme base class and registering it using the CheckItOut.themes.register(class) function. Use the implementations included with this script as examples for writing your own.

Since Roll20's API system has its own way of determining the order in which scripts are executed, it is up to you to also write any code necessary to make sure your theme implementation is executed after the CheckItOut script is executed. If you have a theme implementation you would like to add to the built-in implementations, please PM me about it.

## Help

If you experience any issues while using this script or the trap themes,
need help using it, or if you have a neat suggestion for a new feature, please reply to this thread:

TODO

or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=new&type=all&publisher=Stephen%20L)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
