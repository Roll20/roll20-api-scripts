# World Map Discovery

###### Required Scripts
* [Vector Math](https://github.com/Roll20/roll20-api-scripts/tree/master/Vector%20Math)

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
