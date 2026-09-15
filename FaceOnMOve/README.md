# FaceOnMOve

Automatically rotates and/or flips tokens to face their direction of movement.

When a token moves, FaceOnMOve turns it to face the way it went — rotating toward the movement angle (clamped, with optional snap-to-horizontal), flipping single-image tokens left/right, or swapping to dedicated side art on rollable tokens (including separate up/down art for steep movement).

## Requirements

- Roll20 Pro subscription (API access required)
- [ScriptKit](https://github.com/Roll20/roll20-api-scripts/tree/master/ScriptKit) (provides help, man, whatsnew, and handout generation)

## Installation

Install from the Roll20 One-Click Script Library, or paste `FaceOnMOve.js` into a new API script slot. ScriptKit must also be installed; FaceOnMOve detects it automatically via the `!scriptkit-ready` signal.

## Getting Started

Select one or more tokens and run `!fomo` (or `!fomo menu`) to open the config menu:

- **Global** tab — factory defaults applied to every token.
- **Token** tab — overrides for the selected token(s).
- **Character** tab — overrides for the selected token(s)' characters.

For most single-image tokens, the only setting that matters is **Facing** (Left/Right). Rollable tokens (with multiple "sides") additionally get a visual side picker so you can choose which side image represents facing right, left, up, or down.

## How Facing Works

- **Single-image tokens** face by horizontal flip. Set **Facing: Right** if the art is drawn facing right, **Left** if drawn facing left.
- **Rollable tokens** can swap to dedicated side art. Set `rightSide`/`leftSide` to the side index for each horizontal direction (or `-1` to fall back to flipping), and optionally `upSide`/`downSide` for steep vertical movement.
- Tokens rotate toward their movement, clamped to **Max Angle**, with optional **Snap Angle** to keep near-horizontal movement flat.

## Commands

| Command | Description |
|---------|-------------|
| `!fomo` / `!fomo menu` | Open the config menu (GM; uses selection or global) |
| `!fomo help` | Show the command reference |
| `!fomo enable` / `!fomo disable` | Enable/disable facing for selected tokens |
| `!fomo on` / `!fomo off` | Global master switch (must be ON for any facing) (GM) |
| `!fomo toggle` | Flip the global master switch (GM) |
| `!fomo face [<id>\|default] <left\|right\|inherit>` | Set default facing; `inherit` clears an override (GM) |
| `!fomo set <key> <value>` | Set a global default (GM) |
| `!fomo set-token [<id>] <key> <value>` | Set a token-level override (GM) |
| `!fomo set-char [<id>] <key> <value>` | Set a character-level override (GM) |
| `!fomo reset-token [<id>]` | Clear token-level overrides (id form GM-only) |
| `!fomo reset-char [<id>]` | Clear character-level overrides (GM) |
| `!fomo reset-all [--force]` | Reset ALL tokens to defaults (GM) |
| `!fomo reset-global [--force]` | Restore global defaults to factory values (GM) |

Most configuration is done through the menu; the `set` commands are the underlying primitives the menu buttons call.

## Configuration Keys

Set via the menu or `!fomo set <key> <value>`:

| Key | Description |
|-----|-------------|
| `enabled` | Whether tokens face their movement direction |
| `layers` | Only process tokens on these layers |
| `excludeStatuses` | Tokens with these status markers won't rotate |
| `maxAngle` | Max tilt (degrees from horizontal) when moving diagonally |
| `snapAngle` | If within this many degrees of horizontal, snap flat (0 = disabled) |
| `steepAngle` | Angle threshold for steep vertical movement (negative = use maxAngle) |
| `minDistance` | Minimum pixels moved before rotation triggers |
| `groupWaypoints` | Use waypoints to find the nearest viable step for direction |
| `inPlaceFacing` | Waypoint + drop in place to face without moving |
| `idleResetTime` | Seconds before resetting to horizontal (0 = disabled) |
| `horizontalAngle` | Base rotation when facing perfectly left/right |
| `rightSide` / `leftSide` | Side index when facing right/left (negative = use flip) |
| `upSide` / `downSide` | Side index for steep up/down movement (negative = no change) |
| `idleSide` | Side to reset to on idle (negative = falls back to right then left) |

## License

MIT
