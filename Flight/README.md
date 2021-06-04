## Flight

Adds copies of the `fluffy-wing` status icon to the selected tokens with numbers indicating how high the token is flying.

Use `!fly height` (where _height_ is a number) while selecting one or more tokens. If _height_ is 0 or is omitted, the wings will be removed. Any integer number can be used, although any digits of the number which are 0 will show up as wings without a number.

![Flying High](https://wiki.roll20.net/images/3/3e/Flight_Example.jpg)

### Editing the commands

As of v3.4, if you _import_ this script, you can easily edit the statusmarker used or the !command required, including adding additional !commands. Creating a new command is simply a matter of copying 4 lines near the top of the script (lines 7-10 when unmodified) and changing 2 of them (the copied line 7 to change the !command required and the copied line 9 to change the marker used).