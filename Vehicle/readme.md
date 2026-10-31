# Vehicle

Vehicle lets a token carry other tokens. Mark a boat, raft, wagon, flying carpet or mount as a vehicle, and every token on it moves and turns with it, keeping its place on board.

## How It Works

- **Carrying** — When a vehicle is moved or rotated, every token on it is carried along, keeping the same position relative to the vehicle. When the vehicle turns, passengers swing around its center.
- **Facing** — Passengers can also turn to keep their facing relative to the vehicle. This is set per vehicle: top-down art usually wants it, portrait art usually doesn't.
- **Getting off** — Passengers can still be moved on their own, and moving a passenger never moves the vehicle. Drag a token off the vehicle and it is no longer carried.
- **Who counts as aboard** — A token is aboard if enough of it overlaps the vehicle's area: 50% by default, set per vehicle. The rotation of both the vehicle and the token is taken into account.
- **Stacking** — Vehicles are kept behind other tokens so passengers stay visible on top.

Only tokens on the token layer are carried. Vehicles are never carried by other vehicles.

## Getting Started

1. **Install the script** in your campaign.
2. **Select a token and type `!vehicle`** in chat to open the menu.
3. **Click Define.** The token is now a vehicle.
4. **Set its area** if the art has empty space around the edges (see below).
5. **Click the ? button** on any menu for help.

## Area

The area is the part of the vehicle where passengers are. By default it is the whole token. Vehicle art often has empty space around the edges, for shadows or so the art fits the grid. To set a smaller area:

1. On the token layer, draw a rectangle over the part of the vehicle where passengers can be.
2. Select the vehicle and the rectangle together.
3. Click **Set area** in the menu, or **Define** if the token is not a vehicle yet.

The rectangle is deleted once the area is set. The vehicle must be at a right angle (0°, 90°, 180° or 270°) when you do this. If it isn't, the script offers a **Straighten** button that turns it to the nearest right angle.

The area is kept as a percentage of the token, so it stays correct if the vehicle is resized, and it mirrors if the vehicle is flipped.

**Show area** draws a yellow outline of the area. It disappears after 10 seconds unless you move or resize it; click Show area again to remove it. You can adjust the outline, select it with the vehicle and click Set area to use it.

## The Menu

| Tile | What it does |
|---|---|
| **Define** | Makes the selected tokens vehicles and sends them to the back |
| **Define + rotate** | The same, with passenger facing turned on |
| **Remove** | Stops treating the selected tokens as vehicles |
| **Set area** | Sets the area from a rectangle selected with the vehicle |
| **Show area** | Shows or hides an outline of the area |
| **List** | Lists the vehicles on your current page |

## The Vehicle List

`!vehicle --list` shows every vehicle on the page you are viewing, with its picture, name and the number of tokens aboard. Unnamed vehicles are shown as [Unnamed].

- Click a vehicle's **picture** to ping it and pull everyone's view to it.
- Click its **name** to ping it and pull only your own view.
- Click a setting to change it: facing on or off, the overlap percentage, or the area (to show its outline). **clear** returns the area to the whole token.
- Click **×** to stop treating the token as a vehicle.

## Commands

All commands are GM-only and act on the selected tokens unless `--ids` is given.

| Command | What it does |
|---|---|
| `!vehicle` | Shows the menu |
| `!vehicle --define` | Makes the tokens vehicles. Can be combined with the settings below, e.g. `!vehicle --define --rotate on --overlap 75` |
| `!vehicle --remove` | Removes the vehicle tag. The token stays where it is |
| `!vehicle --rotate on\|off` | Sets whether passengers' facing turns with the vehicle |
| `!vehicle --overlap N` | Sets the percentage (1 to 100) of a token that must overlap the area for it to ride |
| `!vehicle --area` | Sets the area from a rectangle selected with the vehicle |
| `!vehicle --area l,t,r,b` | Sets the area by value, in percent inset from each side. One value sets all four sides; two set left and right, then top and bottom |
| `!vehicle --area clear` | Returns the area to the whole token |
| `!vehicle --show` | Shows or hides an outline of the area |
| `!vehicle --straighten` | Turns the vehicle to the nearest right angle |
| `!vehicle --ping` | Pings the vehicle and pulls your view to it; `--ping all` pulls everyone |
| `!vehicle --ids id1,id2` | Targets tokens by ID instead of selection |
| `!vehicle --list` | Lists the vehicles on your current page |
| `!vehicle --help` | Opens the help handout |

Anyone who can move a vehicle carries its passengers.

## The Tooltip Tag

A vehicle is any token whose tooltip contains a `[vehicle]` tag. The script adds and removes the tag for you, but you can also type it by hand. Because the settings live in the tooltip, a vehicle keeps them when the token is copied or saved as a default token.

`[vehicle|rotate|overlap:50|area:5,12,5,20]`

- `rotate` — passengers turn with the vehicle.
- `overlap:N` — the percentage of a token that must overlap the area. Default 50.
- `area:l,t,r,b` — how far in from the left, top, right and bottom edges the area starts, in percent of the token's width and height.

Settings at their default are left out, so a plain vehicle is just `[vehicle]`. Any other tooltip text is left alone. If the tooltip is shown to players, they will see the tag.

## Limits

- Passengers move when the vehicle is dropped, not while it is being dragged.
- Undo (Ctrl-Z) on a vehicle move puts the vehicle back but not its passengers.
- Resizing a vehicle does not move its passengers.
- If passengers are selected and dragged together with the vehicle, they are moved by the drag and not carried a second time.
- After a turn, passengers can sit between grid lines. They are not snapped back to the grid.
- Written for the current Roll20 tabletop (Jumpgate).

## For Script Writers

A vehicle moved by another script with `set()` does not fire Roll20's change event, so its passengers are not carried. Scripts that move tokens can call:

```js
if (typeof Vehicle !== 'undefined') Vehicle.handleMove(token, prev);
```

where `prev` holds the token's previous `left`, `top` and `rotation` (any missing values are taken from the token). It returns the number of tokens carried. `Vehicle.isVehicle(token)` reports whether a token is a vehicle.
