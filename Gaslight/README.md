# Gaslight

Per-player map perception for Roll20. Split players onto individual copies of a page with tokens synchronized via Anchor and Mirror. Each player can see different things while token movement and properties stay consistent across all copies.

## Requirements

- Roll20 Pro subscription (API access required)
- [Anchor](https://github.com/Roll20/roll20-api-scripts/tree/master/Anchor) (spatial sync)
- [Mirror](https://github.com/Roll20/roll20-api-scripts/tree/master/Mirror) (property sync)
- [SelectManager](https://github.com/Roll20/roll20-api-scripts/tree/master/SelectManager) (command relay)
- [RollCapture](https://github.com/Roll20/roll20-api-scripts/tree/master/RollCapture) (optional, roll value extraction for scripting)

## Use Cases

- **Illusions**: One player sees a bridge, another sees empty air
- **Shapechangers**: A disguised NPC looks different to a player with truesight
- **Stealth/Perception**: Per-player visibility based on perception rolls
- **Madness/Hallucinations**: A player sees enemies that aren't there
- **Secrets**: Information visible to only one player

## Quick Start

1. Create your master page
2. Duplicate it once per player (Roll20's built-in Duplicate Page)
3. Select party tokens, run: `!gaslight setup mygroup`
4. Verify: `!gaslight test mygroup`
5. Activate: `!gaslight split mygroup`
6. When done: `!gaslight merge`

## Commands

| Command | Description |
|---------|-------------|
| `!gaslight setup <group>` | Quick-configure from duplicate pages |
| `!gaslight split <group> [--force]` | Activate group (test-first) |
| `!gaslight merge [group]` | Tear down links, return players |
| `!gaslight test <group>` | Dry-run linking resolution |
| `!gaslight link [name\|new] [ids...]` | Manually link tokens |
| `!gaslight unlink [ids...\|--group <group>]` | Remove links |
| `!gaslight group <group> <player\|GM>` | Assign page to group |
| `!gaslight ungroup <group> <player\|GM\|--all>` | Remove page from group |
| `!gaslight stage [players...]` | Propagate tokens to player pages |
| `!gaslight view [player\|master]` | Switch relay view |
| `!gaslight relay <views...> <!command>` | Relay command to views |
| `!gaslight config [relay-add\|relay-remove\|relay-list] [cmds]` | Configure relay |
| `!gaslight status` | Show state |
| `!gaslight --help` | Command reference |

## Token Linking

4-step cascade:
1. **`gaslight_link` in token GM notes** — explicit link ID
2. **`represents` + `name`** — unique pair per page
3. **`represents` + fingerprint** — position + bars for duplicates
4. **No match** — warning to GM

## Sync Behavior

Controlled by `gaslight_sync` character attribute:
- **Absent** → Anchor (spatial) + Mirror (all non-spatial)
- **Empty** → no sync at all
- **`"base"`** → Anchor only (position, rotation, scale, flip)
- **`"base, bars, light"`** → Anchor + Mirror for bars/light
- **`"!anchor"`** → Mirror everything except spatial
- **`"anchor, !left"`** → Anchor minus left, Mirror nothing extra

## Command Relay

Any API command that references master-page linked tokens (via selection or token IDs in the command) is automatically relayed to all player pages with token IDs replaced by their linked counterparts. This happens transparently — no configuration needed.

**Rules:**
- Master-page tokens selected or IDs in command → auto-relay to all player pages
- Player-page tokens involved → only relay if the command is in `relayCommands` list
- Commands already relayed are not re-relayed (loop prevention)

**Manual relay:** `!gaslight relay <views...> <!command>` — explicitly relay to specific views.

**Player auto-relay:** `!gaslight config relay-add !token-mod` — allow player-page commands to relay to other pages.

## Staging

- `!gaslight stage` — propagate selected tokens to all player pages
- `gaslight_stage = 1` character attribute — auto-propagate on placement
- Linked tokens cascade-delete when removed

## Configuration Storage

Group config stored as text objects on GM layer per page:
```
---GASLIGHT---
group: mygroup
player: GM
```

## Scripting

Reactive per-player automation. Scripts stored in handouts evaluate per-viewer per-target, firing API commands conditionally based on captured roll values or token properties.

### Setup

1. Create a handout with your script
2. Place a pin on the master page and link it to the handout
3. Add config to the pin's GM notes:
```
---GASLIGHT-SCRIPT---
scope: token
filter: has gl_stealth_result
```

### Script Example

```
// Hide NPC from players who can't beat its stealth
!token-mod --ids @(target.token_id) --set {& if (any(@(viewer.passive_wisdom)) >= @(target.gl_stealth_result))} layer|objects {& else} layer|gmlayer {& end}
```

### Variables

- `@(target.*)` — the NPC token being evaluated (resolved per viewer page)
- `@(target.gl_*)` — captured values (token gmnotes override, character attribute fallback)

### Aggregate Functions (required for viewer.*/gm.*)

- `any(@(viewer.field)) op value` — true if any viewer token passes
- `all(@(viewer.field)) op value` — true if all pass
- `max(@(viewer.field))` — highest value (via MathOps)
- `min(@(viewer.field))` — lowest value (via MathOps)
- `join(@(viewer.token_id))` — space-separated IDs for `--ids` targeting

### Triggers

Scripts auto-detect triggers from `@(target.gl_*)` references. Override in pin GM notes:
- `trigger: on change gl_stealth_result` — explicit trigger
- `trigger: manual only` — only fires via `!gaslight eval`

### Evaluation

- `!gaslight eval` — evaluate selected pins
- `!gaslight eval --all` — all pins in active groups
- `!gaslight eval <handout name>` — all pins linked to that handout
- Add `--dry-run` to preview without executing

## License

MIT
