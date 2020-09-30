# One-Way Dynamic Lighting

This script allows you to set up dynamic lighting walls that allow you to
see through one side, but not the other.

### Creating Walls

To create a one-way dynamic lighting wall, you need to create a path for the wall itself and
a filled path representing a area from which characters can see through the wall. Once you have those
two objects created, select both of them, and activate the ```OneWayDynamicLighting``` macro installed
by this script. That's all there is to it!

__Note:__
Due to limitations of the API, if at least one player character is on the visible
side of the wall, then all characters will be able to see through it, even if
your dynamic lighting is set to require line-of-sight. This is because it works by
moving the one-way walls back and forth from the GM layer and the Dynamic Lighting layer,
which at any point in time is the same for everyone.

Also, please note that this script only operates for character tokens that
represent a character controlled by a non-GM player. This is intentional
so that NPCs (particularly enemies) don't mess with the state of the one-way
dynamic lighting walls.

## Help

My scripts are provided 'as-is', without warranty of any kind, expressed or implied.

That said, if you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

When messaging me about an issue, please be sure to include any error messages that
appear in your API Console Log, any configurations you've got set up for the
script in the VTT, and any options you've got set up for the script on your
game's API Scripts page. The more information you provide me, the better the
chances I'll be able to help.

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts,
please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/search?category=itemtype:Art&author=Stephen%20Lindberg|Stephen%20L
