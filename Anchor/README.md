# Anchor

Attach child tokens to an anchor token so they automatically follow its position, rotation, scale, layer, and flip. When the anchor moves or transforms, all anchored children update to maintain their stored relative transform. Anchor chains are supported — a child can itself be an anchor to grandchildren.

**Requires:** [MatrixMath](https://github.com/Roll20/roll20-api-scripts/tree/master/MatrixMath)

---

## Installation

1. Install **MatrixMath** first (available in the Roll20 one-click library).
2. Install **Anchor** from the one-click library, or paste `anchor.js` into a new script tab.
3. **Required setup:** Upload a small transparent PNG to your Roll20 image library, then set its thumb URL via the API Scripts page useroptions field or:
   ```
   !anchor config default-anchor-imgsrc https://s3.amazonaws.com/files.d20.io/images/<id>/<hash>/thumb.png?<timestamp>
   ```
   Without a valid image URL, auto-created anchor tokens will exist in the data model but will be invisible and unselectable.

---

## Quick Start

Select one or more tokens and run:

```
!anchor
```

An invisible anchor token is auto-created at the first selected token's position on the GM layer. Move the anchor — the children follow.

To use an existing token as the anchor instead:

```
!anchor <anchor_token_id>
```

---

## Commands

All commands accept `[ignore-selected]` to skip the current token selection, and `[child_id...]` to specify tokens explicitly by ID.

### Anchoring

```
!anchor [anchor_id] [component flags] [ignore-selected] [child_id...]
```

Anchor selected/listed tokens to `anchor_id`. If `anchor_id` is omitted or not a valid token, an invisible anchor token is auto-created at the first child's position. The auto-created token is destroyed automatically when its last child is removed. Add `persist` to keep it even when childless.

**Default components** (when no flags given): position, rotation, scale, width, height, layer, flipv, fliph.

**Component flags** — long form or short alias:

| Long form | Short alias | Components |
|-----------|-------------|------------|
| `anchor-all` | `-all` | Everything including z-order |
| `anchor` | *(bare flag)* | All defaults (no z-order) |
| `anchor-position` | `-pos` | x + y |
| `anchor-x` | `-x` | x position only |
| `anchor-y` | `-y` | y position only |
| `anchor-rotation` | `-rot` | rotation |
| `anchor-scale` | `-scale` | width + height |
| `anchor-width` | `-w` | width only |
| `anchor-height` | `-h` | height only |
| `anchor-layer` | `-layer` | layer |
| `anchor-flip` | `-flip` | flipv + fliph |
| `anchor-flipv` | `-flipv` | vertical flip |
| `anchor-fliph` | `-fliph` | horizontal flip |
| `anchor-z` | `-z` | z-order (relative stacking) |

**Examples:**
```
!anchor                          -- anchor selected token(s), all default components
!anchor -x -rot -layer           -- anchor x-position, rotation, and layer only
!anchor anchor-all               -- anchor everything including z-order
!anchor -OtyABCDEF123            -- anchor to an existing token
!anchor persist                  -- auto-create anchor and keep it when childless
```

When z-order anchoring (`-z` / `anchor-z`) is active, call `Anchor.updateZOrder(anchorObj)` from another script (e.g. EasyReZorder) after moving the anchor in z-order to propagate the new stack to children.

---

### Removing

```
!anchor remove [ignore-selected] [child_id...]
```

Remove the anchor relationship from tokens. Does not delete the anchor token itself.

---

### Locking and Unlocking

```
!anchor lock [component flags] [ignore-selected] [child_id...]
!anchor unlock [component flags] [ignore-selected] [child_id...]
```

**Lock** freezes components — manual moves are undone every poll tick, and anchor changes to those components are ignored. With no component flags, locks all components.

**Unlock** releases components. With no component flags, unlocks everything.

Components can be locked before they are tracked ("pre-locked") — they will activate automatically when tracking is added via `track`.

---

### Tracking

```
!anchor track [component flags] [ignore-selected] [child_id...]
!anchor untrack [component flags] [ignore-selected] [child_id...]
!anchor retrack [component flags] [ignore-selected] [child_id...]
```

Modify which components are tracked on existing relationships without disturbing other stored offsets.

- **`track`** — add components, recording the current relative state as the offset.
- **`untrack`** — remove components. Does not affect locked state.
- **`retrack`** — replace the tracked set entirely. No flags = default set.

---

### Other Commands

```
!anchor center [ignore-selected] [child_id...]
```
Snap children to anchor centre (offset 0,0, rotation 0°, scale 1:1).

```
!anchor update [ignore-selected] [child_id...]
```
Force an immediate transform sync for children.

```
!anchor info [ignore-selected] [child_id...]
```
Whisper anchor state to the caller. Shows tracked components with stored values, lock status (🔒), and pre-locked untracked components. With no tokens selected or specified, shows all anchored tokens on the current page.

```
!anchor --help
```
Whisper the command reference.

---

## Configuration

```
!anchor config
```
Show current configuration values.

```
!anchor config <key> <value>
!anchor config reset
```
Set a runtime config value (persists across sandbox restarts). `reset` reverts all runtime overrides to the API Scripts page settings or built-in defaults.

| Key | Default | Description |
|-----|---------|-------------|
| `poll-interval` | `1000` | Polling interval in ms (min: 100). Restart sandbox after changing. |
| `default-anchor-layer` | `gmlayer` | Layer for auto-created anchor tokens: `gmlayer`, `objects`, or `map` |
| `default-anchor-size` | `35` | Size in pixels of auto-created anchor tokens |
| `default-anchor-name` | `Anchor` | Name of auto-created anchor tokens |
| `default-anchor-imgsrc` | *(see below)* | Thumb URL of transparent PNG from your Roll20 library |
| `default-anchor-aura-color` | `#00ffff` | GM-only aura colour on auto-created anchors |
| `default-anchor-aura-visible` | `true` | Show GM aura on auto-created anchors |
| `allow-player-use` | `false` | Allow players to use lock/unlock/update/center/info |

All keys are also available as **useroptions** on the API Scripts page for point-and-click configuration.

### Setting the anchor image URL

Auto-created anchor tokens require a transparent PNG image from your own Roll20 library. Roll20 restricts `imgsrc` to images uploaded by the installing user — no shared or built-in image works around this requirement.

1. Upload any small transparent PNG to your Roll20 image library.
2. Open browser dev tools → Network tab, filter for `files.d20.io`, find the thumb URL.
3. Set it: `!anchor config default-anchor-imgsrc https://s3.amazonaws.com/files.d20.io/images/<id>/<hash>/thumb.png?<timestamp>`

The URL must begin with `https://s3.amazonaws.com/files.d20.io/images/` and use the `thumb.png` size. A warning is logged to the API console on startup if no valid URL is configured.

---

## Scripting API

Anchor exposes a public API for use by other scripts. After `on('ready')` fires, access it via the `Anchor` global:

```js
// Returns the anchor graphic object for a child, or undefined if not anchored.
Anchor.getAnchor(objId)

// Returns an array of child graphic objects anchored to objId.
Anchor.getChildren(objId)

// Programmatically anchor a child to an existing anchor.
// components: optional { left: true, rotation: true, ... } — defaults to all default components.
Anchor.anchorObj(childId, anchorId, components)

// Auto-create an invisible anchor token for obj and establish the relationship.
// Equivalent to the GM running !anchor from chat.
// components: optional — defaults to DEFAULT_COMPONENTS (no z-order).
// persist: optional bool — if true, anchor survives becoming childless.
// Returns the new anchor graphic object, or undefined on failure.
Anchor.createAnchorFor(obj, components, persist)

// Remove the anchor relationship from a child.
Anchor.removeAnchor(childId)

// Force immediate transform sync after moving an anchor programmatically.
Anchor.updateObj(anchorObj)

// Restack z-order-tracked children after moving anchor in z-order.
// Call this after using toFront/toBack or EasyReZorder on an anchor.
Anchor.updateZOrder(anchorObj)

// Get/set position in anchor-local coordinates [left, top].
Anchor.getPosition(obj)
Anchor.setPosition(obj, left, top)

// Get/set rotation in anchor-local degrees.
Anchor.getRotation(obj)
Anchor.setRotation(obj, degrees)

// Get/set scale relative to anchor [widthRatio, heightRatio].
Anchor.getScale(obj)
Anchor.setScale(obj, widthRatio, heightRatio)
```

---

## Lock / Unlock Semantics

| State | Behaviour |
|-------|-----------|
| **Unlocked** (default) | Child follows anchor on change events. Moving child manually updates its stored offset. |
| **Locked** | Anchor changes to locked components are ignored. Manual moves are undone every poll tick. |
| **Pre-locked** (locked but not tracked) | No effect until tracking is added via `!anchor track`. |

---

## Upgrade Notes

### v1.0.0 → v2.x

State is migrated automatically on first startup. Existing anchor relationships are preserved. Locked tokens will have all components locked (matching v1 behaviour where lock applied to everything).

The public API changed:

| v1 | v2 |
|----|----|
| `Anchor.updatePosition(obj, [x, y])` | `Anchor.setPosition(obj, x, y); Anchor.updateObj(obj)` |
| `Anchor.updateRotation(obj, deg)` | `Anchor.setRotation(obj, deg); Anchor.updateObj(obj)` |
| `Anchor.anchorObj(id)` *(auto-create)* | `Anchor.createAnchorFor(obj)` |
| `Anchor.getAnchor(id) === null` | `!Anchor.getAnchor(id)` |
| `Anchor.removeAnchorFromObj(id)` | `Anchor.removeAnchor(id)` |

---

## Changelog

### v2.1.0
- Rewrite with full ES6 modernisation (IIFE module pattern, `const`/`let`, arrow functions)
- Added component flags system with short aliases (`-x`, `-rot`, `-z`, etc.)
- Added `anchor-all` / `-all` for all components including z-order
- Added `anchor-flip` / `-flip` for both flips at once
- Added z-order anchoring (`anchor-z` / `-z`) with relative front/back stacking
- Added flip mirroring: when fliph/flipv are tracked, position offsets mirror across the axis
- Added per-component lock/unlock with pre-lock support
- Added `track`, `untrack`, `retrack` commands
- Added auto-created anchor tokens (invisible, GM-only aura, auto-destroy when childless)
- Added `persist` flag to keep auto-created anchors when childless
- Added `allowPlayerUse` permission gating
- Added `globalconfig` / `useroptions` integration with runtime `!anchor config` override
- Added public scripting API (`Anchor.createAnchorFor`, `Anchor.updateZOrder`, etc.)
- Added v1→v2 automatic state migration
- Fixed: `imgsrc` handling — Roll20 requires a library image for token visibility
- Fixed: `createObj` timing race via `pendingAnchors` queue

### v1.0.0
- Initial release