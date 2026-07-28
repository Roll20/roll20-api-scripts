# Tether

Tether creates persistent visual connections between tokens on the Roll20 VTT. Connect two tokens with a dynamic PathV2 line that follows them as they move — and optionally reacts as they drift apart.

## Key Features

- **Dynamic Token Connections** — Link two tokens with a line that automatically follows movement
- **Multiple Tethers** — Create any number of simultaneous connections
- **Persistent State** — Tethers survive API restarts, with retry-based reconciliation so momentary sandbox load delays never wipe out valid tethers
- **Automatic Cleanup** — Removes connections the instant either token is deleted, and prunes any that went stale while the sandbox was offline
- **Editable Tethers** — Run `!tether` again on an existing connection to update its appearance or range settings
- **Custom Styling** — Adjust width, color, layer, and Dynamic Lighting barrier type
- **Range-Aware Behavior** — Optionally set a distance threshold and choose how the tether reacts as tokens approach or exceed it: fade out, auto-remove, change color, or scale opacity/width smoothly with distance
- **Grid-Aware Distance** — Threshold distance is measured using the page's own grid scale and diagonal-counting rule (D&D 5E, Pathfinder/3.5E, Manhattan, or Euclidean), so it stays accurate across differently configured maps
- **Tether by Token ID** — Pair a selected token with one you can't select (e.g. an enemy you don't control) using `target|`
- **Debug Command** — Inspect the exact computed distance and preview a tether's effective color/width before committing to settings
- **PathV2 Support** — Uses the latest Roll20 path system

## Getting Started

1. **Install the script** in your campaign
2. **Select exactly two tokens** (or select one and use `target|` — see below)
3. **Run:** `!tether`
4. Move either token and the tether will automatically follow
5. To remove the connection, select the same two tokens and run: `!untether`

## Options

Tether supports optional parameters in any order.

### Width

*Set the line thickness:*
`!tether width|10`

*Default:*
`width|5`

### Color

Supports hexadecimal values, with or without a leading `#`:

`!tether color|#00ff00`
`!tether color|00ff00`

Hex colors without `#` are automatically corrected. An optional two-digit alpha suffix is also supported (e.g. `color|00ff00cc`) and is used as the tether's base opacity when `threshold`/`exceeds` are in play.

### Layer

Choose where the tether appears:

`!tether layer|objects`

Supported layers:

- `objects`
- `gmlayer`
- `map`
- `walls`
- `foreground`

Default:

`layer|objects`

### Dynamic Lighting Barrier Type

Set the PathV2 barrier type:

`!tether type|wall`

Supported values:

- `transparent`
- `wall`
- `oneWay`

Default:

`type|transparent`

### Threshold

Set a maximum distance for the tether, measured in the page's own scale units (e.g. feet):

`!tether threshold|60`

Distance is measured between the two tokens' centerpoints using the page's actual grid settings — `diagonaltype`, `scale_number`, and `snapping_increment` — so a `threshold|60` on a standard 5ft-per-square D&D page means 60ft/12 squares, correctly accounting for diagonal movement.

If `threshold` isn't set, the tether always renders normally regardless of distance — this is fully backward compatible with tethers created before this option existed.

### Exceeds

Controls what happens once a tether's `threshold` is passed. Only relevant when `threshold` is also set:

`!tether threshold|60 exceeds|attenuate`

| Value | Behavior |
|---|---|
| `off` *(default)* | The line becomes fully transparent past the threshold but the tether stays active; it returns to its normal color the moment the tokens are back in range. |
| `delete` | The tether is automatically removed — as if `!untether` were run — the instant the threshold is exceeded. Other tethers on either token are unaffected. |
| a hex color | The line switches to this color past the threshold, and reverts to the tether's normal color when back in range. |
| `attenuate` | The line's opacity scales smoothly with distance: full opacity when the tokens are within 5 units of each other, fading down to 20% opacity as they approach the threshold, then fully transparent once it's exceeded. Reverses smoothly as they close the distance again. |
| `stretch` | Same distance-based scaling as `attenuate`, but affects line width instead of opacity — full width when close, tapering to a width of 1 at the threshold, then staying at width 1 (fully transparent) once exceeded. |

### Target

Pair your one selected token with another token by ID, instead of selecting both:

`!tether target|-N1abcXYZsomeTokenId`

This is meant to be used with Roll20's Target roll query, which prompts you to click any visible token regardless of whether you control it — letting players tether to tokens they couldn't otherwise select (an NPC, a monster, an object controlled by the GM):

`!tether target|@{target|token_id}`

Requirements:

- Exactly **one** token must be selected on the tabletop; the other endpoint comes from `target|`.
- The target token ID is trusted as given — Tether doesn't check whether you'd normally be allowed to select it. This is intentional, since `@{target|token_id}` already limits you to tokens you can see on the map.
- The target must be a different token than the one selected; pairing a token with itself is rejected with an error.

`target|` works the same way with `!untether` and `!tether-debug` — select one token and pair it with `target|` instead of selecting two.

## Debug

Preview the distance calculation and, optionally, what a threshold/exceeds combination would actually render — without creating a tether:

`!tether-debug`
`!tether-debug threshold|60 exceeds|attenuate color|00ff00`
`!tether-debug target|@{target|token_id}`

Select exactly two tokens (or one token plus `target|`) and run the command; results are whispered privately. Useful for confirming grid math on a page before committing to a threshold value.

## Removing Tethers

`!untether` — remove the tether between exactly two selected tokens (or one selected token plus `target|`)
`!untether selected` — remove every tether involving any of the selected tokens
`!untether all` — remove every tether on the current page

## Examples

*Basic tether:*
`!tether`

*Thick green tether:*
`!tether width|10 color|00ff00`

*Thin green tether:*
`!tether width|2 color|00ff00`

*Dynamic Lighting wall:*
`!tether layer|walls type|wall color|ffffff width|5`

*Leash that snaps once a creature strays too far:*
`!tether threshold|30 exceeds|delete color|ff0000`

*Bond that visibly weakens with distance:*
`!tether threshold|60 exceeds|attenuate color|00aaff width|4`

*Aura link that thins out as range increases:*
`!tether threshold|40 exceeds|stretch color|ffcc00 width|8`

*Tether to a token you don't control:*
`!tether target|@{target|token_id} color|ff00ff`

*Check the math before setting a threshold:*
`!tether-debug threshold|60 exceeds|attenuate color|00ff00`

## Perfect For

- Magical connections
- Spell effects
- Chains and restraints
- Leashes with a maximum range
- Creature bonds that weaken with distance
- Proximity-based traps or wards (`exceeds|delete`)
- Player-cast effects linking to NPC or monster tokens (`target|`)
- Visual effects between tokens
- Moveable dynamic lighting barriers
- Any situation where two objects need to remain visually linked, with or without a range limit

## Installation

1. Copy the Tether script into your Roll20 campaign's Scripts section or install via One Click
2. Select two tokens
3. Run `!tether`
4. Begin creating dynamic token connections

## Support

For issues, suggestions, or updates, visit the script repository or contact the author.