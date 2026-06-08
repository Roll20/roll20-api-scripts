# Sequence

A general-purpose keyframe animation engine for Roll20 tokens. Record token movements and attribute changes in real time, then play them back on any token — with smooth interpolation, easing curves, looping, speed control, and expression-driven values.

## Requirements

- Roll20 Pro subscription (API access required)

## Installation

Install from the Roll20 One-Click Script Library, or paste `Sequence.js` into a new API script slot in your game's API settings.

On startup, Sequence creates a **Help: Sequence** handout in your journal with full documentation. Run `!sequence gen-dev-docs` to also generate the extension developer guide.

## Quick Start

1. Select a token and type `!sequence record my-animation`
2. Move the token and change its attributes (position, rotation, bars, colors, etc.)
3. Type `!sequence stop` — the recording saves automatically to a `[Sequence] my-animation` handout
4. Select any token (same or different) and type `!sequence play my-animation`

A playback menu appears in chat with pause, stop, restart, loop, and revert controls.

## Commands

| Command | Description |
|---------|-------------|
| `!sequence record [name] [--attrs a,b,...]` | Start recording selected token(s). Optionally restrict to specific attributes. |
| `!sequence stop` | Stop and save. Auto-saves if a name was given to `record`. |
| `!sequence pause` / `!sequence resume` | Pause/resume recording without losing keyframes. |
| `!sequence save <name> [--force]` | Save an unnamed recording under a name. |
| `!sequence play <name> [flags]` | Play a recording on selected token(s). |
| `!sequence preview <name>` | Play and auto-revert to original state when finished. |
| `!sequence stop-play` / `!sequence pause-play` / `!sequence resume-play` | Control active playback. |
| `!sequence list` | List all saved recordings. |
| `!sequence edit <name>` | Whisper a link to open the recording handout. |
| `!sequence delete <name> [--force]` | Delete a recording. |
| `!sequence add-attribute <name> <attr>` | Add an attribute column to a recording's handout. |
| `!sequence remove-attribute <name> <attr>` | Remove an attribute column. |
| `!sequence add-row <name> <time>` | Add a blank keyframe row at a given time (e.g. `=5000` or `+500`). |
| `!sequence sort <name>` | Re-parse and sort keyframes by time. Run after manually editing timestamps. |
| `!sequence refresh <name>` | Regenerate the handout from cache. |
| `!sequence man [topic]` | In-game help. Topics: `attr`, `func`, `vars`, `easing`, or any attribute/function/namespace name. |
| `!sequence debug` | Show active recording and playback sessions. |
| `!sequence dump-html <name>` | Print raw handout HTML to the API console. |
| `!sequence gen-dev-docs` | Generate the extension developer guide in your journal. |

### Play Flags

| Flag | Description |
|------|-------------|
| `--loop` | Loop indefinitely |
| `--loops <n>` | Loop exactly n times |
| `--speed <x>` | Playback speed multiplier (default: 1.0) |
| `--reverse` | Play in reverse |
| `--offset <ms>` | Start at a time offset |
| `--only <a,b,...>` | Only apply listed attributes |
| `--exclude <a,b,...>` | Exclude listed attributes |
| `--silent` | Suppress playback menus (used by Choreograph) |

## Handout Editor

Each recording is stored in a `[Sequence] name` handout as an HTML table. You can edit keyframe values, times, and easing directly in the handout — Sequence auto-sorts and validates on save.

### Time Column

| Syntax | Meaning |
|--------|---------|
| `=5000` | Absolute — fire at 5000ms |
| `+500` | Relative — fire 500ms after the previous keyframe |
| `=rand(3000,6000)` | Expression — random absolute time |
| `+rand(200,800)` | Expression — random relative gap |

### Value Column

| Syntax | Meaning |
|--------|---------|
| `+70` | Relative delta — add 70 |
| `-70` | Relative delta — subtract 70 |
| `=500` | Absolute — set to 500 |
| `+rand(-140,140)` | Expression — random delta |
| `=clamp(prev+50,orig-200,orig+200)` | Expression with variables |

### Easing Column

Leave blank for linear. Type a curve name for ease-in, or `~name` for ease-out.

| Value | Effect |
|-------|--------|
| `quad` | Ease in (quadratic) |
| `~quad` | Ease out |
| `power(3)` | Parametric ease-in |
| `bezier(0.42,0,0.58,1)` | CSS ease-in-out |
| `step` | Instant jump at end of segment |
| `continuous` | Re-evaluate expression every tick (no lerp). Required for `t`-based animations. |

For ease-in-out: add an empty row at the midpoint with `~curve` as the easing — this switches the curve for subsequent lerps without moving the token.

Available curves: `linear`, `step`, `sine`, `quad`, `cubic`, `quart`, `quint`, `expo`, `circle`, `power(n)`, `bezier(x1,y1,x2,y2)`.

## Expression Variables

Available in value cell expressions:

| Variable | Meaning |
|----------|---------|
| `orig` / `original` | Attribute value at start of playback |
| `prev` / `previous` | Accumulated value at the previous keyframe |
| `curr` / `current` | Current live value on the token (lazy-fetched) |
| `t` | Normalized time (0–1) within the current playback cycle. Requires `continuous` easing. |

Available in time cell expressions:

| Variable | Meaning |
|----------|---------|
| `prev` | Previous resolved timestamp (ms) |

## Constants

| Constant | Value |
|----------|-------|
| `PI` | π (3.14159…) |
| `TAU` | 2π (6.28318…) — one full rotation in radians |

Color constants (`color.red`, `color.blue`, etc.) are also available — run `!sequence man vars` for the full list.

## Built-in Functions

`rand(min, max)`, `randInt(min, max)`, `pick(a, b, ...)`, `freeze(value)`, `clamp(v, lo, hi)`, `abs`, `round`, `floor`, `ceil`, `min`, `max`, `sqrt`, `pow`, `sin`, `cos`, `tan`, `log`, `exp`

**`freeze(value)`** — memoizes its result for the duration of the segment. Use in `continuous` easing to stabilize impure values:
```
=orig + freeze(rand(-50,50)) + cos(t * TAU) * 140
```
This gives a stable random offset with continuous oscillation. The frozen value resets each loop cycle.

**Impure functions** (`rand`, `randInt`, `pick`) are automatically memoized in non-continuous segments (stable for the segment). In `continuous` segments they re-evaluate every tick — wrap in `freeze()` to stabilize.

Color functions (value context only): `color.rgb(r,g,b)`, `color.hsl(h,s,l)`, `color.mix(a,b,t)`, `color.rotateHue(c,deg)`, `color.darken(c,amt)`, `color.lighten(c,amt)`, `color.saturate(c,amt)`

Run `!sequence man func` in chat for the full list with descriptions and examples.

## Continuous Animations

For animations driven by mathematical functions rather than lerp between keyframes, use `continuous` easing with the `t` variable:

| Time | left | left:easing |
|------|------|-------------|
| `=0` | | `continuous` |
| `=3000` | `=orig + cos(t * TAU) * 140` | |

Play with `--loop` for endless orbiting. `t` goes from 0→1 over the segment duration and resets each loop.

## Supported Attributes

All standard graphic token properties: `left`, `top`, `rotation`, `width`, `height`, `bar1_value`–`bar3_value`, `bar1_max`–`bar3_max`, `aura1_radius`, `aura2_radius`, `light_radius`, `light_dimradius`, `light_angle`, `light_losangle`, `tint_color`, `aura1_color`, `aura2_color`, `light_color`, `flipv`, `fliph`, `showname`, `layer`, and more.

Run `!sequence man attr` in chat for the full list.

## Extending Sequence

Other API scripts can register custom attributes, expression functions, constants, and easing curves with Sequence. Run `!sequence gen-dev-docs` to generate the full extension developer guide in your journal.

The extension API entry points:
- `Sequence.registerAttribute(sourceId, struct)`
- `Sequence.registerValueFunction(sourceId, struct)`
- `Sequence.registerTimingFunction(sourceId, struct)`
- `Sequence.registerPlaybackConstant(sourceId, struct)`
- `Sequence.registerEasing(sourceId, struct)`
- `Sequence.generateExtensionHandout(sourceId, opts)`

Extensions should listen for the `!sequence-ready` chat signal before registering, and also register immediately if Sequence is already loaded when they initialise.

## Recordings as Handouts

Recordings are stored in handouts named `[Sequence] <name>` and are fully portable — copy a handout to another campaign to transfer an animation. Recordings are GM-only by default.

## License

MIT
