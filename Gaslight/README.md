# Gaslight

Per-player map perception for Roll20. Split players onto individual copies of a page with tokens synchronized via Anchor. Each player can see different things while token movement stays consistent across all copies.

## Requirements

- Roll20 Pro subscription (API access required)
- [Anchor](https://github.com/Roll20/roll20-api-scripts/tree/master/Anchor) (cross-page position sync)

## Use Cases

- **Illusions**: One player sees a bridge, another sees empty air
- **Shapechangers**: A disguised NPC looks different to a player with truesight
- **Stealth/Perception**: A stealthing creature is invisible on most maps, semi-transparent for a perceptive player
- **Madness/Hallucinations**: A player sees enemies that aren't there
- **Secrets**: Information visible to only one player

## Quick Start

1. Create your master page and duplicate it once per player
2. On each page, select a token and assign the page to a group:
   - Master: `!gaslight group mygroup GM`
   - Player pages: `!gaslight group mygroup PlayerName`
3. Dry-run to verify linking: `!gaslight test mygroup`
4. Activate: `!gaslight split mygroup`
5. When done: `!gaslight merge`

## Commands

| Command | Description |
|---------|-------------|
| `!gaslight split <group>` | Activate group (test-first; blocks on errors, prompts on warnings) |
| `!gaslight split <group> --force` | Activate group (skip test, split immediately) |
| `!gaslight merge [group]` | Tear down links, return players to shared page |
| `!gaslight test <group>` | Dry-run linking resolution, report results |
| `!gaslight link [name\|new] [ids...]` | Manually link tokens across pages |
| `!gaslight unlink [ids...]` | Remove gaslight_link from tokens |
| `!gaslight unlink --group <group>` | Remove all links in a group |
| `!gaslight group <group> <player\|GM>` | Assign page to group |
| `!gaslight ungroup <group> <player\|GM\|--all>` | Remove page from group |
| `!gaslight status` | Show configured and active groups |
| `!gaslight --help` | Command reference |

## Token Linking

Gaslight automatically links tokens across pages using a 4-step cascade:

1. **`gaslight_link` in token GM notes** -- Explicit link ID (set via `!gaslight link` or auto-populated from character attribute). No character sheet required.
2. **`represents` + `name`** -- Unique character+name pair per page.
3. **`represents` + fingerprint** -- Position, size, rotation, and bar values for disambiguating duplicates.
4. **No match** -- Warning whispered to GM.

After split, all linked tokens have `gaslight_link` IDs written to their GM notes for instant re-linking on future splits.

## Sync Behavior

- **NPC tokens** (no player controller): Parent on master page, children on player pages. GM moves NPCs from master.
- **Player tokens** (one controller in group): Parent on player's page, children on master + other pages. Player moves their own token.
- **GM override**: GM can move any token on the master page -- propagates to the parent automatically.
- **Sight**: All child tokens have sight stripped. Only the parent (on the player's own page) retains vision.

## Configuration Storage

Group config is stored as text objects on the GM layer of each page (visible when viewing that layer). Format:

```
---GASLIGHT---
group: mygroup
player: GM
```

## License

MIT
