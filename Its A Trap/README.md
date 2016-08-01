# It's A Trap!

###### Updates
_2.5_
* The script's API now exposes a announceTrap method for handling all universally supported trap output (messages, sounds, FX, etc.).
* Trap JSON now supports a "gmOnly" property that displays the trap's message only to the GM.
* Trap JSON now supports a "stopAt" property to make traps stop tokens at their center, edge, or not at all.

_2.4_
* Offsets and directions can be specified for beam-like special FX in the trap JSON.
* A user option is provided for revealed traps to be sent to the map layer instead of the objects layer.
* Traps can now have areas of effect beyond their trigger.

_2.3_
* Trap JSON now supports special FX. This is specified through the 'fx' property.

_2.2_
* TrapThemes now supported for system-specific trap automation.

_2.1_
* Refactored code.
* ItsATrap now exposes an API for its functions.
* Customizable trap messages via GM notes.

This is a script that allows GMs to quickly and very easily set up traps on
the GM layer, and detect when tokens on the objects layer move over them. This
trap detection even works for tokens moving by waypoints.

### Creating traps:

Place the token for your trap on the ```GM layer```. Give it the ```cobweb``` <img src="http://game-icons.net/icons/lorc/originals/png/cobweb.png" width="32"> status marker.

#### Flying tokens
By default, traps will only affect characters on the ground (ones that don't
have a ```wing``` <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or ```angel``` <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker). To have a trap also affect flying
characters, give it the ```wing``` <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or ```angel``` <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker.

#### Revealing traps
If you would like the trap to become visible to the players when it is activated, give it
the ```bleeding eye``` <img src="http://game-icons.net/icons/lorc/originals/png/bleeding-eye.png" width="32"> status marker.
If you checked the ```revealTrapsToMap``` option for this script, then the trap will be moved to the ```Map layer```.
Otherwise, it will be moved to the ```Objects layer```.

#### Area of effect
You can specify an area of effect for a trap by setting its ```Aura 1``` property.
When the trap is activated, all tokens within that area will be affected by the
trap. Trap areas can be square or circular.

#### Customizing trap messages:

When a character activates a trap, it will display a
generic message to tell everyone that the character activated the trap.

You can specify a custom message in the GM notes for the trap. This message
can include inline rolls.

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
"default" or "5E-OGL" TrapThemes as an example to get you started.

### TrapEffects JSON:

In addition to being able to specify custom messages for traps, you can also define
the effects of a trap using JSON. This allows you to do things with traps beyond
just displaying simple messages such as playing sounds, providing attributes
for use in trap automation with TrapThemes, and even executing API chat commands.

Just enter the JSON definition in for the trap in its GM notes.

The following basic TrapEffect properties are supported:
* api (string): An API chat command that will be executed when the trap is activated. If the constants TRAP_ID and VICTIM_ID are provided, they will be replaced by the IDs for the trap token and the token for the trap's victim, respectively in the API chat command message.
* fx (string, FX definition JSON, or object): The name of a special FX object or a definition for custom special FX.
 * fx.name (string or FX definition JSON): The name of a special FX object or a definition for custom special FX.
 * fx.offset (2-number array): The offset of the trap's FX, relative to the trap's token.
 * fx.direction (2-number array): For beam-like FX, this is the vector for the FX's direction.
* gmOnly (boolean): If true, then the trap's message is only displayed to the GM.
* message (string): This is the message that will be displayed when the trap activates.
* sound (string): The name of a sound that will be played when the trap activates.
* stopAt (string): This is where the trap stops the token. If "edge", then the token is stopped at the trap's edge. If "center", then the token is stopped at the trap's center. If "none", the token is not stopped by the trap. Default: "center".
* trapId (string): The ID of the trap token. This is set automatically by the script.
* victimId (string): The I of the victim token. This is set automatically by the script.
