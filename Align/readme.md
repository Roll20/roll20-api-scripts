# Align Script for Roll20

**Align** is a visual alignment and positioning tool for the Roll20 VTT. It gives GMs (and, if the GM allows, players) a clickable chat menu to align, distribute, space, snap, stack, tile, scatter, rotate, face, swap and shuffle tokens, without typing macros or entering coordinates.

Arrange a battlefield, a marching order, a ring of cultists or a grid of map tiles with a click or two. Most moves can be undone and redone.

Align doesn't care which sheet you are using. It only knows tokens and graphics; it ignores paths. Built and tested on Jumpgate.

---

## Features

- **Align:** line up selected tokens by left, right, top, bottom, center, or horizontal/vertical center.
- **Distribute:** spread tokens evenly between the first and last token, by edge or center.
- **Spacing:** equal gaps between tokens, or a fixed gap of any number of grid squares along one axis.
- **To Grid:** lay tokens out in rows or columns from the top-left of the page, or snap each token to the grid where it already is.
- **Stack:** reorder token layering from any corner.
- **Tile:** place map images edge to edge.
- **Scatter:** place tokens at random over the page or the area they cover, without overlapping each other or other tokens.
- **Formations:** grid blocks by number of rows, circles and arcs (optionally facing the center or outward, optionally snapped to the grid).
- **Rotate:** turn a whole arrangement 90°, 45° or 180°, keeping or turning each token's facing. On a grid, blocks don't drift with repeated turns. A setting chooses whether 45° turns keep the block's exact formation (default) or keep every token in a square.
- **Face:** set every selected token to face up, down, left or right, or copy the facing of a leader token.
- **Swap and Shuffle:** swap two tokens, or move every selected token into a spot another one held. Players can use a macro to swap places with a target token.
- **Undo and Redo:** up to 10 steps per player.
- **Selection memory:** the tabletop often drops the selection after tokens move. If you run another command within a few seconds, Align uses the same tokens again.
- **Edge protection:** To Grid asks before wrapping tokens to a new row or enlarging the page.
- **Settings:** a GM settings card for token art facing, selection memory time, player access, block rotation, quiet mode and the legacy Token Page button.

---

## Usage

Type `!align` in chat to open the menu, select tokens, and click the buttons. Click **?** in the menu title bar to open the help handout, which documents every command. The GM also sees a gear button for Settings. **↩** and **↪** in the title bar are Undo and Redo.

Commands can also be typed or used in macros. Arguments can be written `--key|value` or `--key value`.

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

`center` moves tokens along the line from the first token to the last, on both axes.

### Spacing and Gap
```
!align --distributespacing|horizontal
!align --distributespacing|vertical
!align --gap|horizontal|1
!align --gap|vertical|0.5
```

`--distributespacing` makes the gaps equal, keeping the outer tokens in place. `--gap` sets a fixed gap in grid squares; the leftmost (or topmost) token stays put and only that axis changes.

### To Grid
```
!align --snap|horizontal|1
!align --snap|vertical|2
!align --snapinplace
```

`--snap` lays tokens out from the top-left of the page with 1 (or more) empty squares between them, wrapping at the page edge. It asks before wrapping or enlarging the page; only the GM can enlarge it. `--snapinplace` puts each token on the grid where it is; tokens smaller than one square are centered in their square.

### Stack
```
!align --zindex|top-left
!align --zindex|top-right
!align --zindex|bottom-left
!align --zindex|bottom-right
```

Tokens nearer the named corner are drawn on top.

### Tile
```
!align --tile
```

Place map images in rough rows first. The top-left image stays put and the rest are laid out edge to edge from it.

### Scatter
```
!align --scatter|page|snap
!align --scatter|area|snap
!align --scatter|page|nosnap
!align --scatter|area|nosnap
```

- Page: the whole page. Area: the rectangle the selected tokens cover.
- Tokens don't overlap each other or other tokens on the token layer.

### Formations
```
!align --block|3|0
!align --circle||center|no
!align --arc|180|up|3|no|yes
```

- `--block|ROWS|SQUARES`: rows of equal length, back row shorter (10 tokens in 3 rows gives 4, 4, 2).
- `--circle|RADIUS|TURN|SNAP` and `--arc|SPAN|TOWARD|RADIUS|TURN|SNAP`: radius in grid squares (blank for the smallest that fits), TURN is `no`, `center` or `out`, SNAP is `yes` or `no`. TOWARD is the side the middle of the arc is on.

### Rotate
```
!align --rotate|90
!align --rotate|-45
!align --rotate|180|turn
```

Positive angles are clockwise. Add `|turn` to turn each token by the same angle.

On a grid, 90° and 180° turns keep the block on the grid. For 45° turns, the **Block rotation** setting chooses between **Keep formation** (default: the block turns as a rigid shape, so tokens sit between squares until the next 45° turn) and **Keep on grid** (every token stays in a square, but the shape changes). Turning back to an earlier orientation always restores the exact earlier layout.

### Face
```
!align --face|up
!align --leader
```

`--leader` records the selected tokens and whispers a **Pick leader** button; click it and then the token whose facing the group should copy.

### Swap and Shuffle
```
!align --swap
!align --swap|@{target|Swap with|token_id}
!align --shuffle
```

The second form is a player macro: select your own token, run it, and click the token to trade places with. It works for players even when Align is set to GM only.

### Undo and Redo
```
!align --undo
!align --redo
```

### Settings (GM)
```
!align --settings
!align --set|facing|down
!align --set|selectionSeconds|10
!align --set|access|all
!align --set|quiet|true
!align --set|blockRotation|grid
```

---

## Token Page Commands (legacy)

The Token Page commands from earlier versions (grouping tokens into labeled boxes) are kept for existing games and have moved to a submenu, under the **Token Page Commands** button. `!tokenpage` still works. A dedicated Token Manager script is under development.

```
!align --tpmenu
!align --group --label|Bandits
!align --definebox
!align --definelabel
!align --definelabelpos|above
!align --updateboxes
```

---

## Help

Click **?** in the Align menu to open the help handout, which covers every command in detail.
