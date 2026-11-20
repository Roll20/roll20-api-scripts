# PageFX Recipes

Ready-made effects to copy into your game, grouped by setting. Each recipe is a handful of chat commands: select the token it names, then type the commands one at a time. Change the colours, numbers and names to suit your map.

| Setting                      | Recipes                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| [Fantasy](fantasy.md)        | Ballista bolt, arrow volley, fire bolt that flies, dragon breath, dart trap, warding glyph, haunted forge |
| [Science fiction](sci-fi.md) | Broadside between two ships, missiles that fly, laser turret, point defence, damaged console, steam leak  |
| [Horror](horror.md)          | Haunted room, blood spatter, spirit lash, lightning flicker, graveyard mist                               |
| [Modern](modern.md)          | Tracer fire, sniper shot, mortar round, smoke grenade, sprinklers, live wires                             |

Have a recipe to share? Open an issue or a pull request on GitHub, or post it in the Roll20 Mod forum.

## Before You Start

- Put the effect's token on the GM layer so players do not see it. The token is where the effect starts.
- Effects only run on pages with players on them. To try a recipe on your own, turn on **GM Page Preview** in `!pagefx settings`, or select the token and type `!pagefx fire`.
- Every command can also be done from the menu: type `!pagefx`, click **Edit** on the effect, and use the buttons on its card.

## The Parts of a Recipe

### Where it spawns

- `!pagefx area <radius> [circle|square]` sets the token's Aura 1, in page units (feet, metres...). Each spawn appears at a random point in it.
- `!pagefx area 0` makes the area just the token itself, so every spawn starts in the same place.

### What it spawns

- `!pagefx fx <type>-<colour>` uses one of Roll20's built-in effects.
  - Types: `beam`, `bomb`, `breath`, `bubbling`, `burn`, `burst`, `explode`, `glow`, `missile`, `nova`, `splatter`.
  - Colours: `acid`, `blood`, `charm`, `death`, `fire`, `frost`, `holy`, `magic`, `slime`, `smoke`, `water`.
- `!pagefx fx <name>` uses a custom FX saved in your game, and `!pagefx fx {...}` a custom FX definition pasted as JSON.
- `!pagefx preset <id>` gives the token a ready-made set of layers, such as `sparks` or `fog`. `!pagefx presets` lists them.
- `!pagefx layer add <effect>` adds another layer, so one token spawns several things. Add `--layer 2` to a command to change the second layer.

### How often

- `!pagefx interval <shortest> <longest>` waits a random time between the two, in milliseconds, before each spawn. 1000 is one second.
- `!pagefx off` stops the timed spawns, so the effect only goes off from a trigger or `!pagefx fire`.

### Effects that go somewhere

Roll20 has two kinds of effect that cross the map.

**Beams** (`beam`, `breath` and `splatter`, or a custom FX with `"angle": -1`) are drawn as a line from where they start to where they end.

- `!pagefx direction <across> <down>` sets where each one ends, in grid cells from where it starts. Negative numbers go left or up: `20 0` is 20 cells right, `-20 0` 20 cells left, `0 -10` 10 cells up, `15 10` down and to the right.
- `!pagefx direction random` points each one a different way, up to a cell long.
- An end that would land off the page is moved back to the edge, which bends the line. Count the cells so it ends on the map.
- Roll20 draws a beam along its whole line at once; it does not fly.

**Particles that travel** are custom FX whose particles are thrown one way. They fly across the map, and are the nearest thing Roll20 has to a missile. In the definition:

- `angle` is the way they fly, in degrees: 0 right, 90 down, 180 left, 270 up. For a diagonal, 45 is down and to the right, 135 down and to the left, 225 up and to the left, 315 up and to the right.
- `angleRandom` is how far they may stray from it. Keep it at 0 to 3 for a straight shot.
- `speed` (pixels each frame) times `lifeSpan` (frames) is how far they go, in pixels. A grid cell is 70 pixels, so `"speed": 10, "lifeSpan": 70` flies about 10 cells. Roll20 runs about 25 frames a second, so that takes about three seconds.
- Send a clump of about 10 particles at once (`"maxParticles":10,"emissionRate":10,"duration":10`), each 30 to 40 pixels across, or it is hard to see. `speedRandom` of about 1 stretches the clump into a short trail.
- `direction` does nothing for these; the angle is the direction.
- After you change a custom FX, wait a few seconds before firing it: until the change reaches everyone's browser, the old one (or nothing) is drawn.

### When

- `!pagefx trigger add round fire every=2` fires once every second round. `round=3` fires in round 3 only.
- `!pagefx trigger add turn fire --ids <effect token ID>`, with a creature's token selected, fires on that creature's turn.
- `!pagefx trigger add enter fire` fires when a player's token walks into the effect's area. Add `area=selected` (with another token selected and the effect given with `--ids`) to watch that token's Aura 1 instead, `who=all` to count every token, and `once` to go off only the first time.
- Use `burst count=5` instead of `fire` to spawn several at once, and `start`, `stop` or `toggle` to switch the timed spawns on and off.
- The **Each round**, **On a turn**, **Token enters** and **Token leaves** buttons on the effect's card add the same triggers without IDs: select the other token first, then click the button.
- Shots always come from the effect's token and go the way it is set. PageFX cannot yet aim at a token.

To find a token's ID, select it and type `@{selected|token_id}` in chat.
