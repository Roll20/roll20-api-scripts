# It's A Trap!

_v3.13 Updates_

* Can specify 'none' for trap trigger areas.
* Can specify message for when a character notices a trap via passive detection using the 'Detection Message' property.

This is a script that allows GMs to quickly and very easily set up traps,
secret doors, and other hidden things on the GM layer, and detect when tokens
on the objects layer move over them. This trap detection even works for tokens
moving by waypoints.

Combined with modules called Trap Themes, this script also allows system-specific
automation of trap effects and passive perception used to spot them.

## Trap Maker menu
When this script is installed, it installs a macro called **TrapMaker**. When you
select a token that you want to set up as a trap and click this macro, it
displays a **Trap Configuration** menu in the VTT's chat, from which you can
modify the trap's various properties (discussed below).

When you use this menu on a token for the first time, it will be moved
to the **GM layer** and it will be given the **cobweb** status marker. The script
uses these properties to identify which tokens are active as traps.

The GM notes section of the trap's token will be used to hold the JSON data for
the trap's properties. Please do not edit the GM notes for a trap token
manually.

### Enabling the menu macro
This macro is not added to your macro bar automatically, so you'll need to
check the **In Bar** checkbox next to the **TrapMaker** macro to activate it.

## Trap properties
The following subsections go into detail about each of the properties that can
be set and modified for a trap.

### Core properties
These are the basic properties of the trap.

#### Name
This is the name of the trap.

e.g. _'pit trap'_ or _'explosive runes'_

#### Type
The It's A Trap! script, contrary to its name, can be used to automate more kinds of
hidden objects than just traps. By default, the value of this property will just be
_'trap'_, but you could define it to be something like _'hazard'_, _'hidden enemy'_,
or _'concealed item'_ instead. This type will appear in the trap's header when
it is activated.

E.g., the header will read 'IT'S A TRAP!!!' if the type is 'trap', or
'IT'S A HAZARD!!!' if the type is 'hazard'

This property otherwise has no mechanical effect.

#### Message
This message will be displayed when the trap is activated.

e.g. _'You feel a floor sink under your feet as you step on a hidden pressure plate. Behind you, you hear the violent grinding of stone against stone, getting closer. A massive rolling boulder is heading this way!'_

#### Disabled?
This sets whether the trap is currently disabled or not. A trap that is disabled
cannot be triggered.

#### Show GM Only
This sets whether the trap's activation will only be shared with the GM. If this
is set to **yes**, the trap's GM Notes and its theme-based results will be
shared only with the GM. Visible effects of a trap, such as the its message,
sound, Areas of Effect, etc. will be ignored, and the trap will not be revealed.

This property is best used for traps, hazards, and alarms whose effects will
not be readily apparent when they are activated.

e.g. This could be set to 'yes' for a tripwire that alerts monsters in
another room to the party's presence.

#### Secret Notes
These notes are whispered to the GM when the trap is activated. These notes won't be shown to any of the other players.

e.g. _'The tripwire sets off a silent alarm, alerting the mindflayers in the laboratory room to the party's presence.'_

### Trigger properties
These properties all have to do with how the trap is triggered.

#### Trigger Area
This defines the area that a character must move through in order to trigger the
trap. Options include:

* **self - rectangle**: The trap's own token is used as the trigger area, which is treated as a rectangular shape.
* **self - circle**: The trap's own token is used as the trigger area, which is treated as a circular shape.
* **set selected lines**: You must have one or more lines selected on the VTT to use this option. Those lines will be used as the trigger area for the trap.
* **none**: The trap has no trigger area, thus it cannot be triggered. Use this for things like secret doors, which shouldn't activate, but should be noticeable with passive detection.

#### Trigger Collision
This property defines how character tokens collide with the trap's trigger area. Options include:

* **center**: When a character crosses the trap's trigger area, they are moved to the trap token's center. This option only works for traps whose trigger area is *self*.
* **edge**: When a character crosses the trap's trigger area, their movement is stopped at the trigger area's edge.
* **none**: Character tokens are not stopped when they move through the trap's trigger area.

This property is ignored if the Delay Activation property is set.

#### Ignore Token IDs
This property is used to select one or more creature tokens that will not be affected by a trap. Neither can these tokens trigger the trap.

* **none**: No ignored tokens.
* **set selected tokens**: To use this option, you must have one or more tokens selected. These tokens will be ignored by the trap.

#### Affects Flying Tokens
By default, traps will only affect tokens that are not flying. Tokens are treated as 'flying' by this script if they have the **fluffy wing** status marker active.

If this property is set to **yes**, it will affect all tokens, regardless of whether
or not they have the **fluffy wing** status marker active.

Leave this set to **no** for floor-based traps. For traps that affect creatures on
the ground and in the air alike, set this to **yes**.

#### Delay Activation
This property sets a delay, in **seconds**, between when the trap is triggered to
when it actually activates.

As a side-effect, the trap's trigger will be deactivated once this delay is
activated. This is to prevent the delayed trap from triggering multiple times.

### Activation properties
These properties all have to do with what happens when the trap activates.

#### Activation Area
This defines the area in which characters can be affected by the trap when it activates. Options include:

* **self**: The trap's token is used as the activation area.
* **burst**: The trap affects all characters within a certain radius of it.
* **set selected shapes**: To use this option, you must have one or more filled shapes selected. The trap affects all characters inside those shapes.

#### Burst Radius
This property is only visible if **Activation Area** is set to **burst**. This
sets the radius of the burst area.

#### Special FX
This property is used to display a particle effect when the trap activates,
using Roll20's special FX system.

The first prompt asks for the name of the effect that will be displayed. This can
either be the name of a custom special effect you've created, or it can be the
name of a built in effect. Built-in special effects follow the naming convention
**effect-color**. e.g. _explode-fire_ or _beam-acid_

See https://wiki.roll20.net/Custom_FX#Built-in_Effects for more
information on supported built-in effect and color names.

The second prompt allows you to specify an offset of the effect's origin point,
in the format **[X,Y]**. The X,Y offset, relative to the trap's token is measured
in squares. If this is omitted, the trap's token will be used as the effect's
origin point.
e.g. _[3,4]_

The third prompt allows you to specify a vector for the direction of the effect,
in the format **[X,Y]**, with each vector component measured in squares. If this
is omitted, the effect will be directed towards the victims' tokens.
e.g. _[0,-1]_

#### Sound
This property sets a sound from your jukebox to be played when the trap is activated.

#### Chained Trap IDs
This property allows you to set other traps to activate when this one does. Options include:

* **none**: No other traps are activated by this trap.
* **set selected traps**: You must have one or more other trap tokens selected to use this option. When this trap activates, the selected traps will activate too.

#### Delete after Activation?
If this property is set to **yes**, then the trap's token will be deleted after it is activated.

### Detection properties

#### Max Search Distance
This property defines the distance at which a character can attempt to notice a
trap passively. If this is not set, the search distance is assumed to be infinite.

Dynamic lighting walls will block line of sight to a trap, even if the character
is close enough to otherwise try to passively spot it.

e.g. If this is set to 10 ft, then a character must be within 10 ft of the trap in order to passively notice it.

#### Detection Message

By default, when a character notices a trap via passive detection (Perception/Spot/etc.),
the script will just announce the name of the trap that was noticed. Use this property to specify
a custom message to be displayed when a character notices a trap.

e.g. 'The air feels warm and you notice holes greased with oil lining the walls.'

#### Reveal the Trap?
This property determines whether the trap's token will be revealed (moved to a visible layer) when it is activated and/or detected.

The first prompt asks if the trap should be revealed when it is activated (yes or no).

The second prompt asks if the trap should be revealed when it is detected (yes or no).

The third prompt asks which layer the trap token is moved to when it is detected (Just click OK or press enter if you chose **no** for both of the earlier prompts).

### External script properties
These properties are available when you have certain other API scripts installed.

#### API Command
This property can be used to issue an API chat command when the trap activates.
This property supports a couple keywords to support commands involving the trap
and its victims.

The keyword TRAP_ID will be substituted for the ID of the trap's token.

The keyword VICTIM_ID will be substituted for the ID of token for some character
being affected by the trap. If there are multiple victims affected by the trap,
the command will be issued individually for each victim.

The keyword VICTIM_CHAR_ID will be substituted for the ID of the character being
affected by the trap.

e.g. _'!someApiCommand TRAP_ID VICTIM_ID VICTIM_CHAR_NAME'_

For some API commands using special characters, you'll need to escape those
characters by prefixing them with a \ (backslash). These special characters
include: [, ], {, }, and @.

e.g.:

```
!power \{\{
  --name|Spear Launcher
  --leftsub|Trap
  --rightsub|Trigger: Pressure is applied to the floor tile.
  --Attack:|\[\[ 1d20 + 14 \]\] vs AC \@\{VICTIM_CHAR_NAME|ac\}
  --Damage:|\[\[ 2d6 + 6 \]\] piercing
\}\}
```

#### Areas of Effect script
This property is only available if you have the **Areas of Effect** script installed.
It also requires you to have at least one effect saved in that script.
This allows you to have the trap spawn an area of effect graphic when it is triggered.

The first prompt will ask you to choose an area of effect chosen from
those saved in the Areas of Effect script.

The second prompt will ask for a vector in the form **[dx,dy]**, indicating the
direction of the effect. Each component of this vector is measured in squares.
If this vector is omitted, the effect will be directed towards the victims' tokens.

#### KABOOM script
This property is only available if you have the **KABOOM** script
(by Bodin Punyaprateep (PaprikaCC)) installed. This allows you to create a
KABOOM effect centered on the trap's token. This can be handy for pushing tokens
back due to an explosive trap!

The prompts for the property are used to define the properties for the KABOOM effect,
as defined in the KABOOM script's documentation.

#### TokenMod script
This property is only available if you have the **TokenMod** script (by The Aaron)
installed. This allows you to set properties on tokens affected by the trap, using
the API command parameters described in the TokenMod script's documentation.

e.g. _'--set statusmarkers|broken-shield'_

## Trap Themes:
Trap themes are special side-scripts used to provide support for formatting messages for traps and
automating system-specific trap activation and passive search mechanics.

By default the **default** theme will be used. This is a very basic,
system-agnostic theme and has no special properties.

If you install a system-specific trap theme, It's A Trap will automatically
detect and use that theme instead. Additional system-specific themes are
available as their own API scripts.

### Theme-specific properties
Trap themes come with new properties that are added to the Trap Maker menu.
This includes things such as modifiers for the trap's attacks, the trap's
damage, and the dice rolls needed to passively detect the trap.

Documentation for these properties are provided in the script documentation for
the respective trap theme.

## Activating traps:
If a character token moves across a trap's trigger area at ANY point during its
movement, the trap will be activated! Traps are only active while they are
on the GM layer. Moving it to another layer will disable it.

A trap can also be manually activated by clicking the 'Activate Trap' button
in the trap's configuration menu.

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
