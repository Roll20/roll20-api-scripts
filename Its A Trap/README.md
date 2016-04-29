# It's A Trap!

###### Required Scripts
* [Token Collisions](https://github.com/Roll20/roll20-api-scripts/tree/master/Token%20Collisions)
* [Vector Math](https://github.com/Roll20/roll20-api-scripts/tree/master/Vector%20Math)

###### Updates
'''2.2'''
* TrapThemes now supported for system-specific trap automation.

'''2.1'''
* Refactored code.
* ItsATrap now exposes an API for its functions.
* Customizable trap messages via GM notes.

This is a script that allows GMs to quickly and very easily set up traps on
the GM layer, and detect when tokens on the objects layer move over them. This
trap detection even works for tokens moving by waypoints.

### Creating traps:

Place the token for your trap on the ```GM layer```. Give it the ```cobweb``` <img src="http://game-icons.net/icons/lorc/originals/png/cobweb.png" width="32"> status marker.

<br/><br/>
By default, traps will only affect characters on the ground (ones that don't
have a ```wing``` <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or ```angel``` <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker). To have a trap also affect flying
characters, give it the ```wing``` <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or ```angel``` <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker.

<br/><br/>
By default, trap tokens won't appear when they are activated. If you would
like the trap to become visible to the players when it is activated, give it
the ```bleeding eye``` <img src="http://game-icons.net/icons/lorc/originals/png/bleeding-eye.png" width="32"> status marker. When the trap is activated, it will be moved to the ```Objects layer```.

### Customizing trap messages:

By default, when a character activates a trap, it will just display a
generic message that the character activated the trap.

You can specify a custom message, which can include inline
rolls, in the GM notes for the trap. Admiral Ackbar will still dramatically
announce it.

### Activating traps:

If a token moves across a trap at ANY point during its movement, the trap will
be activated!

### TrapThemes:

TrapThemes are used to provide support for displaying messages for traps and
automating system-specific trap activation and passive search mechanics.

If you are using the One-Click API Library, you can specify which theme to use
in the 'theme' user option.

By default the 'default' theme will be used. This is a very basic,
system-agnostic TrapTheme which provides support for the basic TrapEffect properties
and has no passive search mechanics.

Additional system-specific themes will be made available as their own API scripts.
If you would like to implement a TrapTheme for your system, take a look at the
5E-OGL TrapTheme as an example to get you started.

### TrapEffects JSON:

In addition to being able to specify custom messages for traps, you can also define
the effects of a trap using JSON. This allows you to do things with traps beyond
just displaying simple messages such as playing sounds, providing attributes
for use in trap automation with TrapThemes, and even executing API chat commands.

Just enter the JSON definition in for the trap in its GM notes.

The following basic TrapEffect properties are supported:
* api (string): An API chat command that will be executed when the trap is activated. If the constants TRAP_ID and VICTIM_ID are provided, they will be replaced by the IDs for the trap token and the token for the trap's victim, respectively in the API chat command message.
* message (string): This is the message that will be displayed when the trap activates.
* sound (string): The name of a sound that will be played when the trap activates.
* trapId (string): The ID of the trap token. This is set automatically by the script.
* victimId (string): The I of the victim token. This is set automatically by the script.
