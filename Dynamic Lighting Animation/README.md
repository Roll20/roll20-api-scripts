## Dynamic Lighting Animation

### Commands
* !snapshot _frames_
* !reset
* !run
* !stop

You can record animation frames with `!snapshot`: set up the Dynamic Lighting as you like it, then use `!snapshot` along with the number of frames to hold that position. The animation runs as 20fps, so `!snapshot 20` will hold the position for 1s.

`!reset` clears the animation buffer, and the commands `!run` and `!stop` predictably play or halt the animation. You cannot snapshot new positions while the animation is running. This script only stores a single animation, so you need to clear it before creating another one.

Each snapshot only looks at the Dynamic Lighting paths on the page that currently has the player bookmark ribbon.