# Check It Out

_1.1 Updates_
* D20 themes now support checks for multiple types of skills.
* D20 themes support option to use passive skills.

'Check It Out' provides the GM with capabilities to add descriptive properties to
objects on the VTT's 'objects' layer. The script also provides a macro to the
players so that they can approach and examine those objects to see those descriptions.

The script can also be configured with a theme, which provides extra
object properties and automated system-specific functionality for a selection
of supported character sheets.

For example, in D&D 5 games, Investigation ability check DCs can be assigned to learn more
information about an object. When the player uses this script's macro to examine
the object, it will automatically roll an Investigation check and reveal
information about the object based on the hidden roll's result.

Currently, themes for the following character sheets are supported:
* D&D 3.5E
* D&D 4E
* D&D 5E:
    * Roll20
    * Community
    * Shaped
* Gamma World 7th Edition
* Pathfinder:
    * Roll20
    * Community
    * Simple
* Starfinder:
    * Roll20
    * Simple

## GM Wizard

The GM can set properties for a selected object by using the ```CheckItOut_GM_Wizard```
macro installed by this script. This macro displays a menu in the chat visible
only to the GM for setting up the message displayed when a PC examines the
object, as well as other properties, some of which may be system/character sheet-specific.

Detailed information about these properties is provided when you mouse-over them in the GM wizard.

## Examining Objects

The PCs can examine an object using the ```CheckItOut``` macro. If the GM set
up informational properties for the object, the PC will be informed about them
through a whispered message in the chat. Otherwise, it'll just display the
default message. Additionally, the GM will be informed that that PC tried to
examine the object.

Currently, only things on the ```Objects``` layer can be examined.

## Character Sheet Themes

This script can be configured to use system-specific rules for examining objects
by selecting a supported character sheet from its configurations. These themes
provide extra properties for objects such as automated investigation checks.

Each theme is built to work with a specific character sheet. You can configure which
one you're using from the GM wizard's global properties.

### Writing Custom Themes

If you're familiar with writing API scripts and character sheets, you can write
your own custom theme by extending the CheckItOut.themes.CheckItOutTheme base
class and registering it using the CheckItOut.themes.register(class) function.
Use the implementations included with this script as examples for writing your own.

## Help

If you experience any issues while using this script or the trap themes,
need help using it, or if you have a neat suggestion for a new feature, please
reply to the script's support thread in the Roll20 API forum, or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=new&type=all&publisher=Stephen%20L)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
