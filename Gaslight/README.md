# Gaslight

Per-player map perception for Roll20. Split players onto individual copies of a page with tokens synchronized via Anchor and Mirror. Each player can see different things while token movement and properties stay consistent across all copies.

## Requirements

- Roll20 Pro subscription (API access required)
- [Anchor](https://github.com/Roll20/roll20-api-scripts/tree/master/Anchor) (spatial sync)
- [Mirror](https://github.com/Roll20/roll20-api-scripts/tree/master/Mirror) (property sync)
- [ScriptKit](https://github.com/Roll20/roll20-api-scripts/tree/master/ScriptKit) (**≥ 1.4.0** — help system, examples, guides, name generator)
- [RollCapture](https://github.com/Roll20/roll20-api-scripts/tree/master/RollCapture) (optional, roll value extraction for scripting)
- [ZeroFrame](https://github.com/Roll20/roll20-api-scripts/tree/master/ZeroFrame) (needed for the following other required scripts)
- [SelectManager](https://github.com/Roll20/roll20-api-scripts/tree/master/SelectManager) (command relay)
- [APILogic](https://github.com/Roll20/roll20-api-scripts/tree/master/APILogic) (conditional branching in scripts)
- [Fetch](https://github.com/Roll20/roll20-api-scripts/tree/master/Fetch) (access attributes in scripts)

## Use Cases

- **Illusions**: One player sees a bridge, another sees empty air
- **Shapechangers**: A disguised NPC looks different to a player with truesight
- **Stealth/Perception**: Per-player visibility based on perception rolls
- **Madness/Hallucinations**: A player sees enemies that aren't there
- **Secrets**: Information visible to only one player

## Quick Start

**One-command setup** (experimental/Jumpgate sandbox):
1. Create your master page
2. Make one blank page named `GL-SCRATCH`, duplicate it once per player
3. Select party tokens, run: `!gaslight quick` — clones the master onto the scratch pages, configures the group, and splits in one step
4. When done: `!gaslight merge`

**Manual setup** (any sandbox):
1. Create your master page
2. Duplicate it once per player (Roll20's built-in Duplicate Page)
3. Select party tokens, run: `!gaslight setup` (a group name is generated, or provide one)
4. Verify: `!gaslight test <group>`
5. Activate: `!gaslight split <group>`
6. When done: `!gaslight merge`

## Commands

| Command | Description |
|---------|-------------|
| `!gaslight setup [group]` | Quick-configure from duplicate pages (group name optional) |
| `!gaslight quick [group] [players...]` | Configure + split in one step, cloning onto copies/`GL-SCRATCH` pages (experimental sandbox) |
| `!gaslight split <group> [--force]` | Activate group (test-first) |
| `!gaslight merge [group]` | End a split; players return to their previous split (or banner). No arg = most recent split |
| `!gaslight merge-all` | End all active splits at once |
| `!gaslight test <group>` | Dry-run linking resolution |
| `!gaslight stage [--default on\|off] [players...]` | Propagate tokens to player pages |
| `!gaslight link [--default] [name\|new] [ids...]` | Manually link tokens |
| `!gaslight unlink [ids...\|--group <group>]` | Remove links (asymmetric: parent cascades, non-parent detaches) |
| `!gaslight sync [--default] [props\|all\|reset]` | Manage sync whitelist per token |
| `!gaslight desync [--default] [props\|all]` | Exclude props from sync per token |
| `!gaslight var [--silent] [actions...]` | Read/set/unset gl_* variables |
| `!gaslight eval [--all] [--dry-run]` | Evaluate GLS scripts |
| `!gaslight view [master\|off\|<player>]` | Control command relay targeting |
| `!gaslight relay <views...> <!command>` | Relay command to views |
| `!gaslight init [sync\|trim]` | Sync initiative with HUD |
| `!gaslight hud [element] [on\|off\|reset]` | Toggle HUD elements |
| `!gaslight config [relay-add\|relay-remove\|relay-list] [cmds]` | Configure relay |
| `!gaslight group <group> <player\|GM>` | Assign page to group |
| `!gaslight ungroup <group> <player\|GM\|--all>` | Remove page from group |
| `!gaslight status` | Show state |
| `!gaslight --help` | Command reference |

## Token Linking

4-step cascade:
1. **`gaslight_link` in token GM notes** — explicit link ID
2. **`represents` + `name`** — unique pair per page
3. **`represents` + fingerprint** — position + bars for duplicates
4. **No match** — warning to GM

## Sync Behavior

Controlled by `gaslight_sync` in token GM notes (auto-populated from character attribute on token placement/split):
- **Absent** → Anchor (spatial) + Mirror (all non-spatial)
- **Empty** → no sync at all
- **`"base"`** → Anchor only (position, rotation, scale, flip)
- **`"base, bars, light"`** → Anchor + Mirror for bars/light
- **`"!anchor"`** → Mirror everything except spatial
- **`"anchor, !left"`** → Anchor minus left, Mirror nothing extra

### Per-Token Sync Commands

| Command | Description |
|---------|-------------|
| `!gaslight sync` | Show current sync config for selected token(s) |
| `!gaslight sync <props>` | Add props to sync whitelist |
| `!gaslight sync all` | Explicitly sync everything |
| `!gaslight sync reset` | Re-copy from character attribute |
| `!gaslight desync <props>` | Exclude specific props from sync |
| `!gaslight desync all` | Disable all syncing (link preserved) |

### gl_* Variables (`!gaslight var`)

Read, set, or unset `gl_*` variables on tokens (gmnotes) or character sheets. Actions are chainable in a single command. Respects the current view for reads and writes.

**Actions:**

| Action | Description |
|--------|-------------|
| `--get <name>` | Read value (token gmnotes priority, fallback to character attribute) |
| `--set <name> <value>` | Set on token gmnotes |
| `--del <name>` | Remove from token gmnotes |
| `--setch <name> <value>` | Set on character sheet attribute |
| `--delch <name>` | Remove from character sheet attribute |

**Flags:**

| Flag | Description |
|------|-------------|
| `--silent` | Don't trigger script evaluation after setting |

**View behavior (master token selected):**
- `view master` → read/write all linked copies (compact display for `--get`)
- `view <player>` → read/write only that player's copy
- `view off` → read/write master token only

**Examples:**
```
!gaslight var --set stealth_result 15
!gaslight var --get stealth_result
!gaslight var --set stealth_result 20 --setch stealth_dc 12
!gaslight var --del stealth_result --delch stealth_dc
!gaslight var --silent --set stealth_result 25
```

The `gl_` prefix is implicit — `stealth_result` and `gl_stealth_result` both map to `gl_stealth_result`.

## Command Relay

Any API command that references master-page linked tokens (via selection or token IDs in the command) is automatically relayed to all player pages with token IDs replaced by their linked counterparts. This happens transparently — no configuration needed.

### View Modes

Control where commands relay to:

| Command | Effect |
|---------|--------|
| `!gaslight view master` | Relay to all player pages (default on split) |
| `!gaslight view off` | Relay disabled — changes stay on master only |
| `!gaslight view <player>` | Relay only to that player's page |

**Rules:**
- Master-page tokens selected or IDs in command → auto-relay to all player pages
- Player-page tokens involved → only relay if the command is in `relayCommands` list
- Commands already relayed are not re-relayed (loop prevention)

**Manual relay:** `!gaslight relay <views...> <!command>` — explicitly relay to specific views.

**Player auto-relay:** `!gaslight config relay-add !token-mod` — allow player-page commands to relay to other pages.

## Initiative Tracking

Gaslight automatically syncs the turn order across linked tokens:

- **Add**: When a token is added to initiative, all linked copies are added at the same value
- **Remove**: Removing a token removes all linked copies
- **Value sync**: Initiative value changes propagate to all linked copies
- **Auto-skip**: When the turn advances to a non-master linked token, Gaslight skips forward/backward to the next master or unlinked token
- **Sort-aware**: After sorting initiative, groups are reordered with master tokens on top
- **Stage sync**: Staging a token mid-combat automatically adds its linked copies to initiative

The GM only interacts with master-page tokens in the turn tracker. Players see their own copies on their page. Linked children are skipped automatically when advancing turns.

### `!gaslight init`

Sync the Roll20 turn order with the HUD. Needed after plugins add tokens to initiative (since `Campaign().set('turnorder')` is not detected automatically).

| Command | Description |
|---------|-------------|
| `!gaslight init` | Sync + trim (default) |
| `!gaslight init sync` | Add missing linked tokens to turn order |
| `!gaslight init trim` | Remove stale entries for deleted tokens |

## HUD

On-canvas indicators on the master page foreground layer. Toggle with `!gaslight hud [element] [on|off|reset]`.

### Elements

| Element | Description |
|---------|-------------|
| `view` (alias: `relay`) | Shows current relay state: ALL / OFF / player name |
| `initiative` (aliases: `init`, `turn`, `turns`) | Visual initiative tracker with frame, tokens, and current turn indicator |
| `reticle` (aliases: `indicator`, `current`) | Rectangle highlighting the current turn token on the map |

### Initiative HUD Features

- **Frame**: resizable rectangle containing initiative entries
- **Current turn indicator**: rotated diamond showing whose turn it is (movable to set position)
- **Token entries**: mirrored copies of master tokens (syncs name, status, tint)
- **Custom turn entries**: pins with titles for custom initiative entries
- **Overflow**: entries outside the frame are hidden automatically
- **Drag to reorder**: drag a token/pin vertically between others to change initiative order
- **Swipe to change turn**: drag a token/pin horizontally past the frame edge to make it the current turn
- **Round calculation**: custom turn formulas applied when entering the top via rotation
- **Delete entry**: deleting a HUD token/pin removes it from initiative (deleting the frame turns HUD off)
- **Fully customizable**: frame stroke/fill, text color/stroke/font, token size derived from frame width, all positions persist

### Commands

- `!gaslight hud` — toggle all elements
- `!gaslight hud on` — turn all on
- `!gaslight hud off` — turn all off
- `!gaslight hud reset` — reset all to defaults (turns on)
- `!gaslight hud initiative` — toggle initiative
- `!gaslight hud reset view` — reset just view element

## Staging

- `!gaslight stage` — propagate selected tokens to player pages (follows current view; all if view is master/off)
- `!gaslight stage <player>` — propagate to a specific player's page
- `gaslight_stage = 1` character attribute — auto-propagate on placement
- Staged tokens inherit all synced properties via Mirror after linking
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

## Interactive Guides

Gaslight includes interactive guide-only examples that walk you through features step by step. Access them via ScriptKit:

`!gaslight examples`

Available guides:
- **getting-started** - Setup, split, merge walkthrough
- **core-mechanics** - Staging, linking, syncing, token lifecycle
- **initiative-hud** - HUD gestures, customization, reticle
- **relay** - Command relay, view targeting, view HUD
- **scripting** - Build a "winds of magic" GLS script from scratch

Applied script examples (with handout generation):
- **stealth** - Hide/show NPCs per player via passive perception
- **truesight** - Reveal true forms to viewers with truesight
- **madness** - Afflicted players see all tokens as enemies

## Changelog

### v2.3.0
- `!gaslight quick [group] [players...]` — configure + split in one step, cloning the master onto page copies (and reusable `GL-SCRATCH` pages) via `graphic.createCopy` (experimental sandbox)
- Marketplace-safe token staging — stage/clone uses `createCopy` when available, preserving Marketplace `imgsrc` and `sides`
- `!gaslight merge-all` — end all active splits at once
- Nested splits via per-player page stacks — merging a group returns each player to the most recent group they're still in (or the banner page)
- `!gaslight merge` (no arg) now ends the most-recently-activated split (top of the stack) instead of all splits; `merge <group>` targets a specific group anywhere in the stack
- Group name optional for `setup` and `quick` — a readable name (e.g. `arcane-dragon`) is generated via ScriptKit; the first argument is treated as a player unless it doesn't resolve to one
- Auto-stage failures are now reported to the GM instead of failing silently
- Adaptive getting-started guide (quick vs manual by sandbox) plus a standalone manual-setup guide when quick is available
- **New dependency:** ScriptKit ≥ 1.4.0 (for the name generator)

### v2.2.2
- Added version dates to changelog for ScriptKit date-based whatsnew queries

### v2.2.1
- Fix: `!gaslight link` re-establishes links for tokens in active groups
- Fix: `!gaslight stage --default on` checks for marketplace images
- Fix: `!gaslight desync` now applies immediately (parent rebuilds links, child uses surgical Anchor/Mirror)
- Fix: `!gaslight sync` removes !excludes correctly, propagates config to all linked copies
- Fix: HUD hides when turn order is empty, reappears when turns are added
- Fix: HUD text offset no longer corrupts after turn advance
- Fix: Turn reticle updates after pin deletion
- Fix: Custom turns properly deduplicated (immutable key matching)
- Fix: pr=0 no longer displays as empty text in HUD
- Fix: Batch initiative additions no longer lost due to race condition (debounced processing)
- Fix: Fetch compProp resolution now correctly returns token gmnotes value before character attribute fallback
- Tutorial: guide pings on HUD elements and customization step transitions
- QoL: warnings/errors show clickable token images that ping the token's location (requires ScriptKit 1.2.0)
- QoL: `!gaslight test` output condensed to summary + warnings only

### v2.2.0
- Initiative HUD: pin-based turn tracker with gesture controls
- Current turn reticle
- `!gaslight init` command
- `--default` flags for stage, sync, desync
- Interactive guide examples
- ScriptKit integration

## License

MIT
