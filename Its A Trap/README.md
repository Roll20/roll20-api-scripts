# It's A Trap!

###### Updates

_3.2_
* Fixed 'noticed undefined' bug in passive perception.
* Traps' type property is now a text input instead of a predefined list.

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
