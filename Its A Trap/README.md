# It's A Trap!

_v3.9 Updates:_
* Implemented delayed activation for traps. See the 'Delay Activation' property.

This is a script that allows GMs to quickly and very easily set up traps,
secret doors, and other hidden things on the GM layer, and detect when tokens
on the objects layer move over them. This trap detection even works for tokens
moving by waypoints.

Combined with modules called Trap Themes, this script also allows system-specific
automation of trap effects and passive perception used to spot them.

## Creating traps:

Place the token for your trap on the ```GM layer```.
Then, select the trap token and activate its 'ItsATrap_trapCreationWizard' token macro.
This will present a menu for setting up the trap's configurations.

## Trap properties

The following subsections go into detail about each of these configurations.

### Core properties

#### Name
This is the name of the trap.

e.g. 'pit trap' or 'explosive runes'

#### Type
The It's A Trap! script, contrary to its name, can be used to automate more kinds of
hidden objects than just traps. By default, the value of this property will just be
'trap', but you could define it to be something like 'hazard', 'hidden enemy',
or 'concealed item' instead. This type will appear in the trap's header when
it is activated.

E.g., the header will read 'IT'S A TRAP!!!' if the type is 'trap', or
'IT'S A HAZARD!!!' if the type is 'hazard'

This property otherwise has no mechanical effect.

#### Message
This message will be displayed when the trap is activated.

e.g. 'You feel a floor sink under your feet as you step on a hidden pressure plate. Behind you, you hear the violent grinding of stone against stone, getting closer. A massive rolling boulder is heading this way!'

#### Disabled
This sets whether the trap is currently disabled or not. A trap that is disabled
will not be activated if it is triggered.

#### GM Only
This sets whether the trap's activation will only be shared with the GM. If this
is set to 'yes', the trap's GM Notes and its theme-based results will be
shared only with the GM. Visible effects of a trap, such as the its message,
sound, Areas of Effect, etc. will be ignored, and the trap will not be revealed.

This property is best used for traps, hazards, and alarms whose effects will
not be readily apparent when they are activated.

e.g. This could be set to 'yes' for a tripwire that alerts monsters in
another room to the party's presence.

#### GM Notes
These notes are whispered to the GM when the trap is activated.

e.g. 'The tripwire sets off a silent alarm, alerting the mindflayers in the laboratory room to the party's presence.'

#### Destroyable
If this is set to 'yes', the trap's token will be deleted after it has been activated.

### Shape properties

#### Affects Flying Tokens
By default, traps will only affect tokens that are not flying. Tokens are treated as 'flying' by this script if they have the 'fluffy wing' status marker active.

If this property is set to 'yes', it will affect all tokens, regardless of whether
or not they have the 'fluffy wing' status marker active.

Leave this set to 'no' for floor-based traps. For traps that affect creatures on
the ground and in the air alike, set this to 'yes'.

#### Blast Distance
This property is only relevant if the trap's 'Trap Shape' property is set to
either 'circle' or 'rectangle'.

By default, a token will only affect creatures overlapping its token when it
is activated. Setting this to a number of units greater than 0 will increase
the size of the trap's activated area.

e.g., Setting this to 10 will make it so that all tokens within 10 ft
(assuming the page's units are measured in feet) of the trap's token will be
affected by it when it activates.

#### Stops Tokens At
This property determines how the trap affects the movement of the token that
triggered it. Options include:

* center (default): The token is dragged into the center of the trap's token. This option only functions if the Trap Shape property is set to either 'circle' or 'rectangle'.
* edge: The token is stopped at the exact spot where they triggered the trap, whether this is at the edge of the trap's token or along one of its triggering paths.
* none: The token's movement is not affected.

This property is ignored if the Delay Activation property is set.

#### Trap Shape
This property determines the shape of the trap's activated area (the area in
which creatures are actually in danger of being hit by the trap). This can be
either the trap's token itself, or it can be defined to be one or more drawn
paths or filled polygons. Options include:

* circle (default): The trap's token is its activated area, using a circular shape. Paired with the Blast Distance property, the radius of this circular area can be extended.
* rectangle: The trap's token is its activated area, treating it as a rectangular shape defined by the token's bounding box. Paired with the Blast Distance property, the size of this rectangular area can be extended.
* set selected paths: To use this option, you must have one or more drawn paths or filled polygons selected. These paths/polygons will be used as the trap's activated area.
* add selected paths: The selected paths/polygons will be added to the trap's activated area.
* remove selected paths: The selected paths/polygons will be removed from the trap's activated area.

### Trigger properties

#### Set trigger
This defines whether the trap is triggered either by a creature crossing its
own token or by crossing a drawn path. Options include:

* self (default): The trap's token is used as the triggering area for the trap. If a creature crosses over the trap's token, the trap will activate.
* set selected paths: To use this option, you must have one or more drawn paths selected. Those paths will be used as the trap's triggering area. If a creature crosses over one of these paths, the trap will activate.
* add selected paths: The selected paths will be added to the trap's triggering area.
* remove selected paths: The selected paths will be removed from the trap's triggering area.

#### Other Traps Triggered
This property is used to set other traps that will be triggered when this trap is activated.

* none (default): No other traps will be triggered by this trap.
* set selected traps: To use this option, you must have one or more trap tokens selected. These traps will be triggered when this trap is activated.
* add selected traps: Add the selected traps to the set of traps that will be triggered when this trap is activated.
* remove selected traps: Remove the selected traps from the set of traps that will be triggered when this trap is activated.

#### Ignore Tokens
This property is used to select one or more creature tokens that will not be affected by a trap. Neither can these tokens trigger the trap.

* none (default): No ignored tokens.
* set selected tokens: To use this option, you must have one or more tokens selected. These tokens will be ignored by the trap.
* add selected tokens: Add the selected tokens to the trap's set of ignored tokens.
* remove selected tokens: Remove the selected tokens from the trap's set of ignored tokens.

#### Delay Activation
This property sets a delay, in seconds, between when the trap is triggered to
when it actually activates.

As a side-effect, the trap's trigger will be deactivated once this delay is
activated. This is to prevent the delayed trap from triggering multiple times.

### Reveal properties

#### Max Search Distance
This property defines the distance at which a character can attempt to notice a
trap passively. This distance is measured in whatever units are used by the page.
If this is not set, the search distance is assumed to be infinite.

Dynamic lighting walls will block line of sight to a trap, even if the character
is close enough to otherwise try to passively spot it.

e.g. If this is set to 10, then a character must be within 10 ft (assuming the page's units are in feet) of the trap in order to passively notice it.

#### When Activated
This property sets whether the trap will be revealed when it is activated. If
set to 'yes', the trap's token will be moved to either the map or objects layer,
as determined by the Layer property, when it is activated. Otherwise, it will
remain hidden on the GM layer.

#### When Spotted
This property sets whether the trap will be revealed when it is passively
spotted. If set to 'yes', the trap's token will be moved to either the map or
objects layer, as determined by the Layer property, when it is spotted. Otherwise,
the trap will be marked with a yellow circle when it is spotted.

Note that if a trap is moved away from the GM layer when it is spotted, it
cannot be triggered until it is moved back.

#### Layer
When the trap is revealed, it will be moved to the layer indicated by this property.

### Special properties

#### API Command
This property can be used to issue an API chat command when the trap activates.
This property supports a couple keywords to support commands involving the trap
and its victims.

The keyword TRAP_ID will be substituted for the ID of the trap's token.

The keyword VICTIM_ID will be substituted for the ID of token for some character
being affected by the trap. If there are multiple victims affected by the trap,
the command will be issued individually for each victim.

e.g. '!someApiCommand TRAP_ID VICTIM_ID'

#### Special FX
This property is used to display a particle effect when the trap activates,
using Roll20's special FX system.

The first prompt asks for the name of the effect that will be displayed. This can
either be the name of a custom special effect you've created, or it can be the
name of a built in effect. Built-in special effects follow the naming convention
'effect-color'. See https://wiki.roll20.net/Custom_FX#Built-in_Effects for more
information on supported built-in effect and color names.

The second prompt allows you to specify an offset of the effect's origin point,
in the format [X,Y]. The X,Y offset, relative to the trap's token is measured
in squares. If this is omitted, the trap's token will be used as the effect's
origin point.

The third prompt allows you to specify a vector for the direction of the effect,
in the format [X,Y], with each vector component measured in squares. If this
is omitted, the effect will be directed towards the victims' tokens.

#### Sound
This property sets a sound from your jukebox to be played when the trap is activated.

### External script properties

#### Areas of Effect script
This property is only available if you have the Areas of Effect script (by me) installed.
It also requires you to have at least one effect saved in that script.
This allows you to have the trap spawn an area of effect graphic when it is triggered.

The first prompt for this property will ask you to choose an area of effect chosen
from those saved in the Areas of Effect script.

The second prompt will ask for a vector in the form [dx,dy], indicating the
direction of the effect. Each component of this vector is measured in squares.
If this vector is omitted, the effect will be directed towards the victims' tokens.

#### KABOOM script
This property is only available if you have the KABOOM script
(by Bodin Punyaprateep (PaprikaCC)) installed. This allows you to create a
KABOOM effect centered on the trap's token. This can be handy for pushing tokens
back due to an explosive trap!

The prompts for the property are used to define the properties for the KABOOM effect,
as defined in the KABOOM script's documentation.

#### TokenMod script
This property is only available if you have the TokenMod script (by The Aaron)
installed. This allows you to set properties on tokens affected by the trap, using
the API command parameters described in the TokenMod script's documentation.

e.g. '--set statusmarkers|broken-shield'

## Trap Themes:

TrapThemes are used to provide support for formatting messages for traps and
automating system-specific trap activation and passive search mechanics.

By default the ```default``` theme will be used. This is a very basic,
system-agnostic TrapTheme which provides support for the basic TrapEffect properties
and has no passive search mechanics.

If you install a system-specific trap theme, then It's A Trap will automatically use
that theme instead.

Additional system-specific themes are available as their own API scripts.
If you would like to implement a TrapTheme for your system, take a look at
the ```default``` or ```5E-OGL``` TrapThemes as an example to get you started.

### Theme-specific properties
These properties available here are specific to whatever trap theme script
is being used for your game system. This includes things such as modifiers
for the trap's attacks, the trap's damage, and the dice rolls needed to passively
spot the trap.

Documentation for these properties are provided in the documentation for their
trap theme script.

## Activating traps:

If a token moves across a trap or its trigger paths at ANY point during its
movement, the trap will be activated!

A trap can also be manually activated by clicking the 'Activate Trap' button
in the trap's configuration menu.

As of version 3.7, traps can be set to have their activation areas be either the
trap tokens themselves or be a set of paths on the GM layer. By default, the trap's
token is still used as the activation area. You can change this by selecting a
set of polygonal or freehand paths from the GM layer, and then setting  
the ```Trap Shape``` property for the trap to ```Paths```. This supports paths
both as lines (no fill color) and polygons (requires fill color).

## Help

If you experience any issues while using this script or the trap themes,
need help using it, or if you have a neat suggestion for a new feature, please reply to this thread:
https://app.roll20.net/forum/post/3280344/script-its-a-trap-v2-dot-3
or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=new&type=all&publisher=Stephen%20L)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
