# Tether

Tether creates persistent visual connections between tokens on the Roll20 VTT. Connect two tokens with a dynamic PathV2 line that follows them as they move.

## Key Features

- **Dynamic Token Connections** — Link two tokens with a line that automatically follows movement
- **Multiple Tethers** — Create any number of simultaneous connections
- **Persistent State** — Tethers survive API restarts
- **Automatic Cleanup** — Removes connections when either token or its path no longer exists
- **Editable Tethers** — Run `!tether` again on an existing connection to update its appearance
- **Custom Styling** — Adjust width, color, layer, and Dynamic Lighting barrier type
- **PathV2 Support** — Uses the latest Roll20 path system

## Getting Started

1. **Install the script** in your campaign
2. **Select exactly two tokens**
3. **Run:** `!tether`
4. Move either token and the tether will automatically follow
5. To remove the connection, select the same two tokens and run:`!untether`


## Options

Tether supports optional parameters in any order.

### Width

*Set the line thickness:*
`!tether width|10`

*Default:*
`width|5`


### Color

Supports named colors or hexadecimal values:

`!tether color|red`
`!tether color|#00ff00`
`!tether color|00ff00`


Hex colors without `#` are automatically corrected.

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


## Examples

*Basic tether:*
`!tether`

*Thick red tether:*
`!tether width|10 color|red`

*Thin green tether:*
`!tether width|2 color|00ff00`

*Dynamic Lighting wall:*
`!tether layer|walls type|wall color|ffffff width|5`


## Perfect For

- Magical connections
- Spell effects
- Chains and restraints
- Leashes
- Creature bonds
- Visual effects between tokens
- Moveable dynamic lighting barriers
- Any situation where two objects need to remain visually linked

## Installation

1. Copy the Tether script into your Roll20 campaign's Scripts section or install via One Click
2. Select two tokens
3. Run `!tether`
4. Begin creating dynamic token connections

## Support

For issues, suggestions, or updates, visit the script repository or contact the author.