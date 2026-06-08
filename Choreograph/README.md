# Choreograph

A meta-sequencer for Roll20 tokens. Define scenes in handouts — filter tokens, compute per-token timing, and fire commands at the right moments.

Choreograph doesn't animate anything itself. It's a scheduler that orchestrates other scripts (like Sequence) by deciding who does what, and when.

## Requirements

- Roll20 Pro subscription (API access required)
- SelectManager (dependency)
- Sequence (recommended, for animation playback)

## Installation

Install from the Roll20 One-Click Script Library, or paste `Choreograph.js` into a new API script slot. Ensure SelectManager is installed.

## Quick Start

1. Type `!choreograph new my-scene` to create a blank scene handout
2. Open the handout and define your scene table (filter, delay, command)
3. Select tokens and type `!choreograph run my-scene`

## Commands

| Command | Description |
|---------|-------------|
| `!choreograph run <name> [flags]` | Execute a scene |
| `!choreograph new <name>` | Create blank scene handout |
| `!choreograph list` | List all scenes |
| `!choreograph edit <name>` | Open scene handout |
| `!choreograph delete <name> [--force]` | Delete a scene |
| `!choreograph stop [name]` | Stop running scene(s) |
| `!choreograph refresh <name>` | Regenerate handout from cache |

### Run Flags

| Flag | Description |
|------|-------------|
| `--id <token_ids...>` | Populate cast from explicit IDs |
| `ignore-selected` | Don't include selected tokens in cast |

## Scene Handout Structure

Scenes are stored in `[Scene] <name>` handouts containing a parameter table and a scene table.

### Parameter Table

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cast | token[] | selected | Tokens to run the scene on (built-in) |
| speed | number | 140 | Propagation speed in px/ms |
| anim | text | pulse | Recording name to play |

### Scene Table

| Filter | Delay (ms) | Command | Notes |
|--------|-----------|---------|-------|
| `*` | `propagate(distance(orig), speed)` | `!sequence play ${anim} ignore-selected ${tokenId}` | Main wave |
| `layer=gm` | `INF` | | Skip GM tokens |

## Filters

| Syntax | Meaning |
|--------|---------|
| `*` | All tokens |
| `layer=X` | On layer X |
| `name=X*` | Name glob match |
| `role=X` | Has role X in cast |
| `status=X` | Has status marker X |
| `!prefix` | Negation |

## Delay Expressions

Evaluated per-token. Must return a number (ms) or `INF`/`SKIP`.

### Token Variables

`left`, `top`, `name`, `layer`, `width`, `height`, `count`, `INF`, `SKIP`

### Functions

`rank(attr)`, `distance(x, y)`, `propagate(dist, speed)`, `stagger(rank, interval)`, `rand(min, max)`, `randInt(min, max)`, `clamp(v, lo, hi)`, plus math functions.

## Command Templates

Use `${expr}` for substitutions:

```
!sequence play ${anim} ignore-selected ${tokenId}
```

## License

MIT
