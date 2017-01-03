# It's A Trap!

###### Updates

_3.1_
* When you open the trap creation wizard for a token, that token is automatically set to be a trap.
* You can now specify whether a trap is actually a trap, a secret door, or some other hidden secret.
* You can now specify which layer individual traps are revealed to (default is map layer). This deprecates the revealTrapsToMap user option.
* Trap activation messages now tell you who is being targeted by the trap.
* Trap properties in the menu now have tooltips to explain them.

_3.0_
* Traps are now modified through a chat menu instead of editing the JSON by hand.
* Traps can now be disabled so that they won't activate but can still be spotted.
* There is now an option to reveal the trap token when it is spotted. This, along with the disable option, can be used to create hidden things that are not necessarily traps such as secret doors.
* The script exposes a TrapTheme base class.
* The script exposes a TrapEffect class.
* Fixed 'revealTrapsToMap' user option bug.
* Fixed 'GM Only' output bug.
* Note: Some things have been deprecated and some interfaces have been changed in this version, which is why I decided to bump up its major version. On that note, TrapThemes created for v2.X are no longer compatible. Please use v3.X TrapThemes with this new version.

This is a script that allows GMs to quickly and very easily set up traps,
secret doors, and other hidden things on the GM layer, and detect when tokens
on the objects layer move over them. This trap detection even works for tokens
moving by waypoints.

Combined with modules called Trap Themes, this script also allows system-specific
automation of trap effects and passive perception used to spot them.

### Creating traps:

Place the token for your trap on the ```GM layer```. Give it the ```cobweb```
<img src="http://game-icons.net/icons/lorc/originals/png/cobweb.png" width="32"> status marker.
Then, select the trap token and activate its 'ItsATrap_trapCreationWizard' token macro.
This will present a menu for setting up the trap's configurations.

### Activating traps:

If a token moves across a trap at ANY point during its movement, the trap will
be activated!

A trap can also be manually activated by clicking the 'Activate Trap' button
in the trap's configuration menu.

### TrapThemes:

TrapThemes are used to provide support for formatting messages for traps and
automating system-specific trap activation and passive search mechanics.

If you are using the One-Click API Library, you can specify which theme to use
in the ```theme``` user option.

By default the ```default``` theme will be used. This is a very basic,
system-agnostic TrapTheme which provides support for the basic TrapEffect properties
and has no passive search mechanics.

Additional system-specific themes will be made available as their own API scripts.
If you would like to implement a TrapTheme for your system, take a look at
the ```default``` or ```5E-OGL``` TrapThemes as an example to get you started.

### Support

If you experience any issues while using this script or the trap themes, or if
you have a neat suggestion for a new feature, please reply to this thread:
https://app.roll20.net/forum/post/3280344/script-its-a-trap-v2-dot-3
