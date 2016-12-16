# Areas of Effect

_v1.2 Updates_
* The menu now includes a burst button for each effect that allows you to spawn the effect as a burst radiating out from a single token.
* Updates to existing menu UI.
* Created shortcut macros for spawning effects.
* Bug fix: Delete button wasn't working after previous update.

_v1.1 Updates_
* The menu now includes an arrow button for each effect that allows you to spawn the effect between two tokens.
* Implemented tooltips for the menu buttons.

GMs, your spellcasting players will love you for this script! It lets you
create graphical areas of effect for various spells and other powers, and then
your players can create these effects by drawing lines specifying their
range, origin, and angle. Areas of effect can be created from any graphic that
you have uploaded to your library.

## AoE menu

When the script is installed, it creates a macro for all GMs of the game to
display its main menu in the chat. This macro is also visible and usable by all players
in the game, but only GMs are allowed to save new areas of effect. Players can
only spawn them.

## Creating Areas of effect

To create an area of effect, follow these steps:
1. Place the graphic you want to create an effect out of onto the VTT.
2. Draw a straight line over it from the origin of the effect to its end/edge.
3. Select both the line and the graphic.
4. Open the Areas of Effect menu using its macro and select ```Save Effect```.
5. Name the effect, and you're done!

The effect will now appear in your list of saved areas of effect. Only GMs
can save areas of effect.

## Viewing/Spawning Areas of Effect

To view the list of saved areas of effect, open the script's menu from its
macro and select ```Apply an Effect```. The list will show each effect with
its name, a preview of its graphic, and GMs will also have a button they can
use to delete effects.

To spawn an area of effect from this list, follow these steps:
1. Draw a straight line from the desired origin of the effect to its desired range.
2. Select the line.
3. Click the effect to apply to the line from the list of saved areas of effect.

OR

1. Select the token the effect originates from.
2. Click the arrow button for the effect.
3. Click the target token for the effect's endpoint.

Both GMs and players can spawn areas of effect!

_Note: Currently it is not possible to create effects from graphics purchased
from the market place due to certain restrictions specified here:
https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions

However, you can download them from your Roll20 purchased assets library and
then upload them to your game in order to make use of them with this script ._
