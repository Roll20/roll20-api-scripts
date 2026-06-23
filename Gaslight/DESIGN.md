# Gaslight - Design Document

## Concept

Gaslight makes it easy to give each player their own perception of the same map. One command splits players onto individual copies of a page, and tokens are automatically synchronized across all copies so movement stays consistent -- but each player can see different things (different token art, different names, hidden/revealed tokens, etc.).

## Use Cases

- **Illusions**: One player sees a bridge, another sees empty air
- **Shapechangers**: A disguised NPC looks different to a player with truesight
- **Stealth**: A rogue is visible on their own map but absent from others
- **Madness/Hallucinations**: A player sees enemies that aren't there
- **Stealth/Perception**: A stealthing creature is invisible on most player maps, semi-transparent for a player who rolled high perception, and fully visible for a player with truesight — all on the same "map" simultaneously
- **Secrets**: An NPC whispers something -- only one player sees the speech bubble token

## Core Features

### 1. Page Split

Two modes:

**On-demand mode** (`!gaslight split`):
- Clones the current page (everything: tokens, paths, DL walls, text) once per player
- Original becomes the master page (GM stays here)
- Each player is assigned to their own copy via `playerspecificpages`
- Gaslit tokens are linked via Anchor

**Pre-setup mode** (`!gaslight split <group>`):
- Pages are pre-configured with gaslight group metadata (stored in page GM notes)
- Group config specifies: shared group ID, player-to-page assignments, designated master page
- One page can belong to multiple gaslight groups (different player assignments per group)
- On activation: moves party tokens to their assigned pages, sets up Anchor links
- Does NOT copy or modify the map -- assumes GM has already prepared per-player differences
- If party tokens already exist on target pages, does not duplicate them
- **Test-first behavior** (default):
  - Runs linking resolution before splitting
  - If errors (e.g. duplicate link IDs): blocks split, shows results, no proceed option
  - If warnings/info only: shows results + a clickable `[Proceed]` button in chat
  - If clean (no issues): splits immediately without prompting
- `--force` flag skips the test and splits immediately regardless of warnings/errors

**Merge** (`!gaslight merge`):
- Returns all players to the master page
- Tears down Anchor links / peer sync
- **On-demand splits**: deletes cloned pages (they were ad-hoc)
- **Pre-setup splits**: preserves pages, only unlinks sync (GM prepared these intentionally)
- A page property (in GM notes metadata) tracks whether it is ad-hoc or pre-setup

### 2. Token Sync

Two sync modes, auto-detected per token based on how many players *in the active gaslight group* can control it:

**Anchor mode** (0 or 1 controlling player in group):
- **NPC tokens (0 controllers)**: Parent on master page. GM moves on master, Anchor propagates to all player pages.
- **Single-player tokens (1 controller)**: Parent on that player's page. Player moves their token, Anchor propagates to master + other player pages.

**Peer mode** (2+ controlling players in group):
- No Anchor parent/child relationship. Gaslight's own `change:graphic` listener handles sync.
- Movement on any page where a controller lives is authoritative and propagates to all other pages.
- Use case: shared torches, vehicles, objects multiple players can interact with.

**GM override** (both modes): If the GM moves a token copy on the master page, Gaslight detects this and propagates to the parent (Anchor mode) or all peers (peer mode). This allows GM to move any token from master (teleportation, forced movement, etc.).

### 3. Master Page

- Always separate -- no player is ever assigned to the master page
- GM's control surface for the gaslit encounter
- NPC parents live here (GM moves NPCs from master)
- Player token children live here (sync from player pages, GM-movable via override)
- Future possibilities:
  - Toggle views: macro buttons to cycle between player perspectives without switching pages
  - Diff display: show per-player differences in the GM/foreground layer
  - Staging area: set up new tokens and "commit" them to player pages

### 4. Token Linking Resolution

All tokens with a `represents` value (character sheet) are candidates for cross-page linking. Tokens without a character sheet are page-local and never linked.

Linking is resolved per-token from the authoritative page (master for NPCs, player's page for player tokens) to each other page, using the following cascade:

**Step 1: Token GM notes — `gaslight_link` ID**
If a token's GM notes contain a `gaslight_link: <id>` entry, it links to any other token on another page with the same `gaslight_link` ID in its GM notes. This is per-token, does not require `represents` or a character sheet at all, and works for any object type. Set manually via `!gaslight link`, or auto-populated from a `gaslight_link` character attribute when the token is placed or split runs.

**Step 2: `represents` + `name`**
For tokens with a `represents` value: if there is exactly one token with this character+name pair on each page, link them. If a page has multiple tokens with the same `represents` + `name`, those tokens fall through to step 3.

**Step 3: `represents` + position + bars (fingerprint)**
For tokens not resolved by steps 1-2, attempt exact match by: `represents`, `left`, `top`, `width`, `height`, `rotation`, `bar1_value`, `bar1_max`, `bar2_value`, `bar2_max`, `bar3_value`, `bar3_max`. This disambiguates duplicate creatures (e.g. multiple goblins) that were placed identically across pages.

**Step 4: No link — warn GM**
If no unique match is found, the token is not linked. Gaslight whispers warnings to the GM with varying urgency:

1. **Info** — A token with `gaslight_link` is missing from some (but not all) group pages. Likely intentional per-player difference.
2. **Warning** — A token with `gaslight_link` exists on only one page. Likely a setup mistake.
3. **Warning** — A `represents` token on the master page failed to link to at least one player page. Master is source of truth; unlinked master tokens are likely unintentional.
4. **Error** — Duplicate `gaslight_link` ID found on the same page. Link resolution will not work correctly for these tokens. Must be fixed.

Suggestions for near-matches are a v2 feature.

### Order of Operations

Linking runs in passes across ALL tokens, not per-token:

1. First pass: attempt step 1 (gmnotes link ID) for every token on all pages.
2. Second pass: attempt step 2 (represents + name) for every still-unlinked token.
3. Third pass: attempt step 3 (fingerprint) for every still-unlinked token.
4. Final: report step 4 warnings for anything still unlinked.

**Critical rule**: A token that has already been linked (matched as a target in a previous step/pass) is excluded from being matched again. This prevents a single token from being claimed by multiple sources and ensures each link is unique.

### Auto-population from character attribute

If a character has a `gaslight_link` attribute, its value is automatically written into the `gmnotes` of any token representing that character when:
- The token is first placed on a gaslit page
- `!gaslight split` runs

This allows GMs to set linking at the character level for simple cases (unique NPCs) while retaining per-token override for duplicates.

### 5. Manual Linking

`!gaslight link [<name>|new] [--ignore-selected] [<token_ids>...]`

Writes a shared `gaslight_link` ID into the GM notes of all specified/selected tokens.

- `<name>` — Use this as the link ID. Tokens with the same link ID across pages will be linked.
- `new` — Auto-generate a unique link ID.
- No name argument — use the existing link ID from the first token (for adding tokens to an existing link group).
- `--ignore-selected` — Skip selected tokens, only use explicit IDs.

Examples:
- `!gaslight link goblin-shaman` — selected tokens all get `gaslight_link: goblin-shaman`
- `!gaslight link new` — selected tokens get a generated unique ID
- `!gaslight link new -AbC123 -DeF456` — explicitly link two tokens by ID

`!gaslight unlink [--ignore-selected] [<token_ids>...]` — Remove the `gaslight_link` entry from tokens' GM notes.

### 6. Test Command

`!gaslight test <group>` — Dry-run the linking resolution. Reports:
- Tokens that would link (and by which step)
- Tokens that are ambiguous (with suggested matches)
- Tokens that have no match

No state changes are made. Use before `split` to verify setup.

### 6. Sync Properties

**Always sync** (hardcoded): left, top, rotation, width, height

### Configurable Sync Properties

Controlled by the `gaslight_sync` character attribute (v2):

- **No attribute present** → sync `base` (default behavior)
- **Attribute present, empty value** → sync nothing (linked for identity tracking only, effectively excluded from sync)
- **Attribute with values** → sync only the listed properties (comma-separated)

Available sync properties:
- `base` -- shorthand for left, top, rotation, width, height
- `left`, `top`, `rotation`, `width`, `height` -- individual position/size
- `side` -- multi-sided token current side index (`currentSide`)
- `light` -- light emission (radius, dimradius, angle, otherplayers)
- `statusmarkers` -- conditions (all-or-nothing in v1; per-marker in v2+)
- `bar1`, `bar2`, `bar3` -- HP/resource values
- `layer` -- visibility layer
- `opacity` -- token opacity (baseOpacity)

Example: `gaslight_sync = "base, light, opacity"` syncs position + light + opacity.

**Sight rules** (hardcoded logic):
- Child/peer tokens have sight stripped by default
- Exception: sight is preserved if the parent/source has sight AND the player assigned to that page can control the character
- This ensures each player only sees through their own token's eyes, not from copies

### 7. Lights and Torches

Roll20 has no dedicated "light" object type -- lights are just graphic tokens with `light_radius`/`light_dimradius` properties. Gaslight treats them the same as any other token.

Multi-controller torches (controlled by multiple players in the gaslight group) automatically use peer sync mode, allowing any of those players to move the light on their page and have it propagate.

### 8. Reactions (Token Triggers)

When Gaslight propagates movement, reaction tokens on non-authoritative pages would fire duplicate reactions. Gaslight suppresses this:

**v1 (default)**: Only the authoritative page fires reactions.
- Player moves their token → reactions fire on their page only
- GM moves from master → reactions fire on master only
- On non-authoritative pages, Gaslight watches for `change:graphic:interactionTriggered` and resets it (`interactionTriggered = false`) to suppress duplicate firing

**v2 (configurable)**: Per-reaction-token control via attribute (e.g. `gaslight_reaction`): `source-only` (default), `master-only`, `all`, `suppress`.

**API mechanism**: The `interactionTriggered` property on graphic objects fires a `change:graphic:interactionTriggered` event when a reaction activates. Gaslight can intercept and reset this on non-authoritative pages.

### 9. New Tokens After Split

- Auto-commit (configurable via script.json useroptions, toggleable at runtime):
  - When ON: new gaslit tokens placed on master auto-clone to player pages with Anchor links
  - When OFF: GM uses `!gaslight commit` to manually push new tokens to player pages
- Non-gaslit tokens placed on any page stay local (that's the point)

### 10. Party Detection

Priority order:
1. Selected tokens (default)
2. Party-tagged characters (fallback -- uses Roll20's `tags` property from Define Party)
3. No further fallback -- if neither is available, error

## Gaslight Group Config (Text object on GM layer)

Config is stored as text objects on the GM layer of each page -- one text object per gaslight group. This keeps config physically tied to the page, visible to the GM, and portable when pages are duplicated.

Master page format:
```
---GASLIGHT---
group: haunted-mansion
player: GM
```

Player page format:
```
---GASLIGHT---
group: haunted-mansion
player: Kenan Millet
playerid: -ABC123
```

Storage rules:
- Text object on `gmlayer`, content starts with `---GASLIGHT---` header
- One text object per group membership (a page in two groups has two text objects)
- `player: GM` designates the master page for that group (set when arg is `GM`, `gm`, or `master`, or if the resolved player is a GM)
- For player pages: `player` stores display name (human-readable), `playerid` stores the player object ID (used for reliable lookups, handles duplicate display names)
- `adhoc` field only on master page -- indicates the group was created by on-demand split (v2)
- Commands create/update these text objects automatically
- On page duplication (manual copy): Gaslight detects duplicated config text, clears player assignment, whispers a warning to the GM
- v2: config to toggle visibility

### Split/Merge Edge Cases

**Adhoc merge with multi-group child page:**
- Delete the gaslight text object for the merged group only
- If no other gaslight text objects remain on the page, delete the page
- If other groups still reference the page, leave it alive

**Adhoc split when child pages already exist for the group:**
- Auto-assign to existing pages where a matching `player:` field exists
- Create new child pages (clone from master) only for players that don't have an existing page
- Existing child pages whose `player:` is not in the current selection/party are left dormant
- GM can add dormant players to the active split by calling split again with them selected
- Currently-assigned players remain on their page (not reassigned or disrupted)

## Commands (Draft)

| Command | Description |
|---------|-------------|
| `!gaslight split <group>` | Activate group (test-first; blocks on errors, prompts on warnings) |
| `!gaslight split <group> --force` | Activate group (skip test, split immediately) |
| `!gaslight merge [group]` | Tear down links, return players |
| `!gaslight test <group>` | Dry-run linking resolution, report results |
| `!gaslight link [<name>|new] [ids...]` | Manually link tokens across pages |
| `!gaslight unlink [ids...]` | Remove gaslight_link from tokens |
| `!gaslight group <group> <player|GM>` | Assign page to group (GM/gm/master = master page) |
| `!gaslight ungroup <group> <player|GM|--all>` | Remove page from group |
| `!gaslight status` | Show current gaslight state |
| `!gaslight --help` | Command reference |

Player resolution for `group`/`ungroup`:
- `GM`, `gm`, `master` → designates master page
- Player display name → resolves to player object, stores name + ID
- If two players share a display name → whispers disambiguation buttons showing each player's controlled characters, GM clicks the correct one
- Buttons embed the player ID internally (users never need to type IDs)
- If arg starts with `-` (Roll20 ID format) → treated as player ID directly (used by disambiguation button callbacks)

## Dependencies

- **Anchor** (cross-page position sync via parent/child)

## Architecture Notes

- Uses `Campaign().set('playerspecificpages', {...})` to assign per-player pages
- Page duplication (on-demand): `createObj("page", {...})`, then clone all graphics/paths/text/DL/doors/windows onto it
- Anchor handles position sync for single-controller tokens (unidirectional parent→child)
- Gaslight's own `change:graphic` listener handles peer sync (multi-controller) and GM override
- Recursion guard needed for all sync listeners (flag during propagation)
- Config stored as text object on GM layer per page (searchable by `---GASLIGHT---` prefix)
- On manual page copy: detect duplicated config text, clear player fields, warn GM
- State storage: `state.Gaslight` tracks active splits, runtime config, active sync mappings
- Party detection: selected → `tags` (Define Party) → error

## Open Questions

(None remaining — all feasibility confirmed)

## Confirmed Feasibility

- ✅ Anchor works cross-page (tested)
- ✅ Pages can be created via `createObj("page", {...})`
- ✅ Text objects on GM layer can store per-page config
- ✅ `currentSide` property exists for multi-sided token sync
- ✅ `interactionTriggered` property exists for reaction suppression

## Known Limitations

- `imgsrc` restriction: API can only use images already in the user's Roll20 library. On-demand cloning is fine since source tokens are already uploaded. Only matters if trying to set external URLs (Gaslight won't do this).
- Page creation via API creates a blank page -- all objects must be individually cloned onto it.

## V1 MVP Scope

### Included

1. **Pre-setup split** (`!gaslight split <group>`) — activate a prepared group, assign players to their pre-configured pages, move party tokens, set up Anchor links
2. **Merge** (`!gaslight merge`) — tear down Anchor links, unassign players from pages, preserve all pages
3. **Anchor-mode sync** — NPC tokens: parent on master, children on player pages. Player tokens: parent on their own page, children on master + other player pages.
4. **GM override** — GM moves a child token on master → Gaslight propagates upstream to the parent → Anchor propagates to all other children
5. **Token linking resolution** — 4-step cascade: `gaslight_link` attribute → `represents`+name → `represents`+position+bars fingerprint → warn GM
6. **Manual linking** (`!gaslight link <id1> <id2>`) — explicit override for ambiguous tokens
7. **Test command** (`!gaslight test <group>`) — dry-run linking, report matches/ambiguities
8. **Sight stripping** — all Anchor children have sight stripped unconditionally
9. **Config storage** — text objects on GM layer, one per group per page, `---GASLIGHT---` header
10. **Page resolution** — selected token's page (default) or `--page "name"` argument
11. **Party detection** — selected tokens (default) → party-tagged characters (fallback) → error
12. **`!gaslight group <group> <player|GM>`** — assign page to group; stores player name + ID for reliable lookup; GM/gm/master designates master page
13. **`!gaslight ungroup <group> <player|GM|--all>`** — remove page from group
14. **`!gaslight status`** — show all configured and active groups
15. **`!gaslight --help`** — command reference
16. **Startup warning** — whispers to GM about dangling groups (no master)
17. **Idempotent split** — re-running split with new players adds them without disrupting existing assignments
18. **Recursion guard** — flag during propagation to prevent echo loops

### Not Included (v2+)

- On-demand split (page cloning)
- Peer sync mode (multi-controller tokens)
- Configurable sync properties (`gaslight_sync`)
- Reaction suppression
- Auto-commit / `!gaslight commit`
- `!gaslight link` / `!gaslight unlink` (manual attribute commands)
- `!gaslight config` (runtime settings)

## V2+ Roadmap

### On-Demand Split (Page Cloning)
- `!gaslight split` (no group) clones current page N times
- `!gaslight test` (no group) dry-runs an ad-hoc split from the current page, showing what would be cloned and how tokens would link
- Adds `adhoc: true` to master config text
- Merge deletes adhoc child pages (unless they belong to another group)
- Requires: clone logic for all object types (graphics, paths, text, DL walls, doors, windows)
- **Changes to v1 systems**: Merge needs to check `adhoc` flag and conditionally delete pages. Split needs a no-arg path that creates pages instead of just assigning existing ones.

### Peer Sync Mode
- Auto-detected: if 2+ players in the active group control a token, use peer sync instead of Anchor
- Gaslight's own `change:graphic` listener propagates movement from any controller's page to all others
- No parent/child — all copies are equal peers
- **Changes to v1 systems**: Sight stripping rule becomes conditional — children in Anchor mode still get stripped, but peer tokens preserve sight if the player on that page controls the character. Split logic needs to detect multi-controller tokens and skip Anchor setup for them.

### Configurable Sync Properties
- `gaslight_sync` character attribute (comma-separated): `side`, `light`, `statusmarkers`, `bar1`, `bar2`, `bar3`, `layer`
- `change:graphic` listener checks which properties changed and only propagates configured ones
- **Changes to v1 systems**: The sync listener (currently only handling GM override) expands to also propagate configurable properties on any authoritative change.

### Reaction Suppression
- On non-authoritative pages, watch `change:graphic:interactionTriggered` and reset to suppress duplicate reactions
- Default: source-only (only authoritative page fires)
- Per-token override via `gaslight_reaction` attribute: `source-only`, `master-only`, `all`, `suppress`
- **Changes to v1 systems**: Adds a new event listener. No changes to existing sync logic, but needs access to the "which page is authoritative for this move" context that the sync system already tracks.

### Auto-Commit
- Configurable via `useroptions` and `!gaslight config auto-commit on/off`
- When ON: new gaslit tokens on master auto-clone to player pages with Anchor links
- `!gaslight commit` for manual push when auto-commit is OFF
- **Changes to v1 systems**: Adds `add:graphic` listener on master page. Commit logic reuses the same token-cloning code that split uses for initial setup.

### Link/Unlink Commands
- `!gaslight link <group>` — set gaslight attribute on selected tokens' characters
- `!gaslight unlink` — remove gaslight attribute
- Convenience only — GM can always set attributes manually
- **Changes to v1 systems**: None — purely additive commands.

### Additional V2 Ideas
- Per-status-marker sync granularity
- Master page view toggling (cycle between player perspectives via macro buttons)
- Master page diff display (show per-player differences on GM layer)
- Config visibility toggle (hide gaslight text in HTML comment)
- Choreograph/Sequence integration (lifecycle hooks for gaslight events)
