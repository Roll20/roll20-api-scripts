# Portal Script Help

This script manages doors and windows (“portals”), allowing you to:

- Create portals on the map
- Lock / unlock them
- Toggle open/closed state
- Set LOS and light-blocking behavior
- Auto-orient windows by their drawn direction
- Mirror and rotate portals
- Bulk-select and modify portals

**Base Command:** `!portal`

## Conversion Commands

- `--convertwindow` — Convert selected doors or paths into windows.
- `--convertdoor` — Convert selected windows or paths into doors.
- `--convertall` — Apply the same conversion to all similar objects:
  - Doors → all doors of same color
  - Windows → all windows of same color
  - Paths → all paths matching color and barrierType

## Attribute Commands

Format: `--attributeName|value`

Values are case-insensitive. Booleans accept:

- **true:** true, yes, on  
- **false:** false, no, off  
- **flip:** toggles true/false  

### Common Door/Window Attributes

- `--isLocked|true/false/flip`
- `--isOpen|true/false/flip`
- `--isSecret|true/false/flip`
- `--isShuttered|true/false/flip`
- `--color|#rrggbb`
- `--color|default` — sets selected doors or windows to Roll20 defaults
- `--key|string`

### Position Attributes

Use `+` or `−` prefixes for relative moves:

- `--x|100` — set position  
- `--x|+20` — move right 20 units  
- `--x|-20` — move left 20 units  
- `--y|100` — set position  
- `--y|+10` — move down 10 units  

**Note:** All X and Y values use the top-left corner of the map as (0,0), with positive values increasing toward the lower right, matching Roll20’s graphic system.

## Path Handling

- Only paths with exactly two endpoints are converted.
- Paths with more points are skipped and noted in chat.
- Position is taken from the path endpoints.

## General Rules

- All commands are case-insensitive.
- All provided attributes apply to every selected object.
- Missing attributes (e.g., `isSecret` on windows) are ignored.

## Examples

- `!portal --convertwindow`
- `!portal --isLocked|true`
- `!portal --isLocked|flip --isOpen|false`
- `!portal --x|+20 --y|-10`
- `!portal --convertwindow --color|#FF00FF --isLocked|true`
