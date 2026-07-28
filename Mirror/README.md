# Mirror

Flat property syncing between Roll20 tokens. No transforms, no offsets — when a property changes on one token, the same value is copied to linked tokens.

## Requirements

- Roll20 Pro subscription (API access required)

## Features

- **Unidirectional links** — source token drives targets (hard-lock by default)
- **Bidirectional chains** — any token in the ring can drive the others
- **Property groups** — sync all, spatial, bars, light, or individual props
- **Dynamic property discovery** — new Roll20 properties detected automatically
- **Recursive propagation** — changes cascade through link trees
- **Hard/soft lock** — hard (default) reverts child changes; soft allows divergence
- **Global excludes** — configure properties that never sync via the `all` group
- **Anchor-aware** — `--exclude anchor` group for tokens also using Anchor

## Commands

| Command | Description |
|---------|-------------|
| `!mirror link [--soft] [--align] [--exclude props] [props] [ids...]` | Unidirectional link |
| `!mirror unlink [props] [ids...]` | Remove link or add excludes |
| `!mirror chain [--align] [--exclude props] [props] [ids...]` | Bidirectional chain |
| `!mirror unchain [props] [ids...]` | Remove chain or add excludes |
| `!mirror align [--up\|--down] [--linked\|--unlinked] [--if-linked] [props]` | Align tokens |
| `!mirror config [exclude\|include\|reset] [props]` | Global excludes |
| `!mirror status` | Show links for selected tokens |
| `!mirror help` | Command reference (via ScriptKit) |
| `!mirror man <query>` | Search help topics (via ScriptKit) |
| `!mirror gen-dev-docs` | Generate developer API handout (via ScriptKit) |

## Property Groups

| Group | Properties |
|-------|-----------|
| `all` | Dynamic — all known properties minus global excludes |
| `spatial` | left, top, rotation, width, height |
| `position` | left, top |
| `size` | width, height |
| `bars` | bar1-4 value + max + link, bar_location, compact_bar, showplayers/playersedit/num_permission |
| `name` | name, showname, showplayers_name, playersedit_name |
| `light` | UDL emission (bright/low/directional/color) + legacy (radius, dimradius, angle, etc.) |
| `sight` | UDL vision (bright_light_vision, night_vision, field of vision limits) |
| `auras` | aura1-2 radius, color, square, options, showplayers, playersedit |
| `tooltip` | tooltip, show_tooltip, gm_only_tooltip |
| `reactions` | interactionTriggered, interactionManualReset, fadeOnOverlap, fadeOpacity |
| `flip` | flipv, fliph |
| `anchor` | spatial + flip + layer (for `--exclude` when using Anchor) |

## Flags

| Flag | Description |
|------|-------------|
| `--soft` | Don't revert child changes (link only) |
| `--align` | Align on creation |
| `--exclude <props>` | Exclude from group |
| `--up` | Align to parent first |
| `--down` | Cascade from current value |
| `--linked` | Only operate on linked tokens (align) |
| `--unlinked` | Only operate on unlinked tokens (align) |
| `--if-linked` | Only align props that are actually linked |

## API

```javascript
Mirror.link(ids, props, soft, excludes)
Mirror.chainLink(ids, props, excludes)
Mirror.unlink(ids, props)
Mirror.unchain(ids, props)
Mirror.addToChain(existingId, newIds)
Mirror.removeFromChain(tokenId)
Mirror.align(sourceId, { up, ifLinked, props })
Mirror.getLinks(tokenId)
Mirror.getParent(childId)
Mirror.getChildren(parentId)
Mirror.getChainMembers(tokenId)
Mirror.getGlobalExcludes()
Mirror.setGlobalExcludes(arr)
Mirror.getKnownProps()
Mirror.ALL_PROPS
Mirror.PROP_GROUPS
```

## Using with Anchor

Mirror and Anchor complement each other — Anchor handles spatial transforms (position, rotation, scale with offsets), Mirror handles flat property copying (bars, status, light, etc.).

To avoid conflicts on tokens that use both:

```
!mirror chain --exclude anchor
```

This syncs everything *except* what Anchor manages (left, top, rotation, width, height, flipv, fliph, layer).

**API equivalent of `Anchor.updateObj`:**
```javascript
Mirror.align(tokenId, { ifLinked: true })  // push linked props to dependents
```

## Changelog

### v1.2.0
- ScriptKit integration: `help`, `man`, `whatsnew`, `gen-dev-docs` commands via ScriptKit
- Auto-generated user help handout
- Added properties: `sides`, `interactionTriggered`, `interactionManualReset`, `renderAsDarkness`, `gm_only_tooltip`, `night_vision_tint`
- New property groups: `tooltip` (expanded with `gm_only_tooltip`), `reactions`
- Removed legacy `--help` handler (now handled by ScriptKit alongside `help`)

### v1.1.1
- Comprehensive `ALL_PROPS` update: bar4, bar links, visibility/edit permissions, tooltip, UDL directional light, UDL vision limits, foreground layer props, lockMovement, isdrawing, aura options
- Split `light` group into `light` (emission only) and `sight` (vision only)
- New groups: `name`, `tooltip`, `sight`
- `bars` group now includes links, location, compact_bar, visibility, permissions

### v1.1.0
- `--ignore-selected` flag: skip current selection, use only explicit IDs
- Auto `lockMovement` when left+top are hard-linked on a child token
- `lockMovement` cleared when unlinked or left/top removed from link

### v1.0.0
- Initial release

## License

MIT
