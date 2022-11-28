# World Map Discovery

_v1.1 Updates:_
* Location discoveries now display an HTML-formatted message to the chat.
* When locations are discovered, their white-tower status is removed.
* The script now exposes some of its functions through its WorldMapDiscovery object. See the source code for details.

This script allows the GM to set hidden locations on a world map that can be
revealed when a character gets close enough.

### To use:

1. Turn on the landmark's ```white-tower status``` <img src="http://game-icons.net/icons/lorc/originals/png/white-tower.png" width="32" >.
2. Set the landmark's ```aura 1 radius``` to whatever radius you want players to come within to discover the landmark.
3. Put the landmark on the ```GM layer```.

### Discovering landmarks:

When a character token moves within the aura radius of the landmark, the landmark
will appear on the graphics layer and a message will be displayed
telling everyone that the character discovered it. When the landmark is
discovered, its aura1 radius is removed.

## Help

My scripts are provided 'as-is', without warranty of any kind, expressed or implied.

That said, if you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/ada-l

When messaging me about an issue, please be sure to include any error messages that
appear in your API Console Log, any configurations you've got set up for the
script in the VTT, and any options you've got set up for the script on your
game's API Scripts page. The more information you provide me, the better the
chances I'll be able to help.

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts,
please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/publisher/165/ada-lindberg
