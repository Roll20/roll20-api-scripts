# Align Script for Roll20

**Align**  is a visual alignment and positioning tool for the Roll20 VTT. It provides GMs and players with a convenient, clickable menu to precisely align, distribute, snap, stack, and scatter tokens — all without typing out macros or entering coordinates manually.

This script was built to provide fine control over token layout with safeguards like edge detection and undo support. Arrange a battlefield, a city block, or a grid of NPCs with a quick click or two.

This script works with Classic or Jumpgate and doesn't care which sheet you are using. It only knows tokens. It ignores paths.

---

## Features

- Align Tokens: Line up selected tokens by left, right, top, bottom, center, or axis-based center.
- Distribute Tokens: Spread tokens evenly across a chosen axis.
- Distribute Spacing: Equal gaps between tokens based on grid units.
- Snap to Grid: Automatically snap tokens with configurable grid gaps.
- Z-Index Stacking: Reorder token layering from any corner (top-left, etc.).
- Scatter Tokens: Randomly spread tokens across the page or within their current area.
- Undo: Revert the last position change per player.
- Interactive Menu: Clean, styled chat menu with buttons for each function.
- Edge Protection: Tokens won’t overflow off the page — After a confirmation dialog, the script auto-wraps or expands the page as needed.

---

## Usage

Type `!align` in chat to open the full interactive menu. From there, click buttons to perform actions on your selected tokens.

![Menu](https://files.d20.io/images/446536354/ZcErtHUDuROwGFr58CM40w/original.png?1750997487)

You can also use commands directly:

### Align
```
!align --align|left
!align --align|right
!align --align|top
!align --align|bottom
!align --align|center
!align --align|center-x
!align --align|center-y
```

### Distribute
```
!align --distribute|left
!align --distribute|right
!align --distribute|top
!align --distribute|bottom
!align --distribute|center
!align --distribute|center-x
!align --distribute|center-y
```

### Distribute Spacing
```
!align --distributespacing|horizontal
!align --distributespacing|vertical
```

### Snap to Grid
```
!align --snap|horizontal|1
!align --snap|vertical|2
```

Snaps tokens with 1 (or more) empty grid square(s) between them. Prevents overflow. Page auto-expands if needed.

### Stack Z-Index
```
!align --zindex|top-left
!align --zindex|top-right
!align --zindex|bottom-left
!align --zindex|bottom-right
```

Stacks selected tokens visually from the specified corner (front to back).

### Scatter Tokens

With Snap:
```
!align --scatter|page|snap
!align --scatter|area|snap
```

Without Snap:
```
!align --scatter|page|nosnap
!align --scatter|area|nosnap
```

- Page: Distribute across the entire page area.
- Area: Distribute within the bounding box of currently selected tokens.
- Prevents overlaps and edge clipping.

### Undo
```
!align --undo
```

Restores the last position change you made.

---

## Help

Click the question mark button in the top-right of the Align menu for an in-game summary of all commands and what they do.
