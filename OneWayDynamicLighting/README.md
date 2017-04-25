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

Alas, there are some paradigms I've considered when implementing this script that
would allow each character to have their own perspective of the dynamic lighting.
Unfortunately, this would only be possible if it were implemented in Roll20's
dynamic lighting system itself using some WebGL magic involving stencil buffers
and lighting polygon unions.

A while ago, I presented an algorithm for
implementing one-way dynamic lighting in the dynamic lighting system detailed in
my post here: https://app.roll20.net/forum/post/4804351/questions-roll20-roundtable-hour-number-1-q1-2017/?pageforid=4806305#post-4806305
If it's compatible with their current system, maybe the Roll20 developers can make use of it.
For the time being though, I hope that this humble script will suffice for everyone's
one-way dynamic lighting needs.

### Help

If you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature, please
post to the script's thread in the API forums or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

### Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=newest&type=all&genre=all&author=Stephen%20Lindberg)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
