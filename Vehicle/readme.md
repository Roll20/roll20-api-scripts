# Vehicle

Vehicle lets a token carry other tokens. Mark a boat, raft, wagon, flying carpet or mount as a vehicle, and every token aboard moves and turns with it, keeping its place on board.

## How It Works

- **Carrying** — When a vehicle is moved or rotated, its passengers are carried along, keeping the same position relative to the vehicle. When the vehicle turns, passengers swing around its center.
- **Facing** — Passengers can also turn to keep their facing relative to the vehicle. This is set per vehicle: top-down art usually wants it, portrait art usually doesn't.
- **Getting off** — Passengers can still be moved on their own, and moving a passenger never moves the vehicle. Drag a token off the vehicle and it is no longer carried.
- **Stacking** — Vehicles are kept behind other tokens so passengers stay visible on top.

Passengers are carried when the vehicle is dropped, not while it is being dragged.

## Passengers

Each vehicle keeps a list of its passengers. Only tokens on the token layer can be passengers.

- **Boarding** — A token boards a vehicle when it is moved onto it: at least the vehicle's overlap percentage of the token (50% by default) ends up on the vehicle's area. The rotation of both the vehicle and the token is taken into account. A token dragged in from the journal or pasted on top of a vehicle also boards it.
- **Leaving** — A token leaves when it is moved off the vehicle.
- **Passing over** — A vehicle does not pick up tokens it moves over. A horse ridden through a crowd leaves the crowd behind.
- **New vehicles** — When a token is made a vehicle, everything on it at that moment becomes a passenger. The same happens when a vehicle is copied, dropped in from the journal, or tagged by hand.
- **Set Passengers** — Makes everything on the vehicle now its passengers, and drops everything else. Useful after setup, or after a script moved tokens without Vehicle knowing.

## Vehicles on Vehicles

A vehicle can be a passenger of another vehicle, such as a lifeboat on a ship. When the ship moves or turns, the lifeboat moves and turns with it, whatever the ship's facing setting, and the lifeboat carries its own passengers.

A token rides only the smallest vehicle it is on, so a sailor in the lifeboat is the lifeboat's passenger, not the ship's. Overlapping vehicles are stacked by size, with the largest at the back.

## Getting Started

1. **Install the script** in your campaign.
2. **Select a token and type `!vehicle`** in chat to open the menu.
3. **Click Define.** The token is now a vehicle, and anything on it is aboard.
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
- Click **N aboard** to open its passenger list.
- Click a setting to change it: facing on or off, the overlap percentage, or the area (to show its outline). **clear** returns the area to the whole token.
- Click **×** to stop treating the token as a vehicle.

## The Passenger List

The passenger list shows the vehicle at the top, then each passenger's picture and name.

- Click a passenger's **name** to ping it and pull only your own view.
- A passenger that is a vehicle shows its own **N aboard**, which opens its passenger list.
- A passenger that is no longer on the vehicle is marked *off the vehicle*, and is dropped at the vehicle's next move.
- Click **×** to take a passenger off the list without moving it, for a token that should stay behind when the vehicle leaves.
- **Set Passengers** makes everything on the vehicle now its passengers. **Back** returns to the vehicle list.

## Commands

All commands are GM-only and act on the selected tokens unless `--ids` is given.

| Command | What it does |
|---|---|
| `!vehicle` | Shows the menu |
| `!vehicle --define` | Makes the tokens vehicles. Can be combined with the settings below, e.g. `!vehicle --define --rotate on --overlap 75` |
| `!vehicle --remove` | Removes the vehicle tag. The token stays where it is, and its passengers board whatever they are now on, if anything |
| `!vehicle --rotate on\|off` | Sets whether passengers' facing turns with the vehicle |
| `!vehicle --overlap N` | Sets the percentage (1 to 100) of a token that must overlap the area for it to board |
| `!vehicle --area` | Sets the area from a rectangle selected with the vehicle |
| `!vehicle --area l,t,r,b` | Sets the area by value, in percent inset from each side. One value sets all four sides; two set left and right, then top and bottom |
| `!vehicle --area clear` | Returns the area to the whole token |
| `!vehicle --show` | Shows or hides an outline of the area |
| `!vehicle --straighten` | Turns the vehicle to the nearest right angle |
| `!vehicle --passengers` | Lists the vehicle's passengers |
| `!vehicle --set-passengers` | Makes everything on the vehicle now its passengers |
| `!vehicle --unboard tokenID` | Takes that token off the vehicle's passenger list without moving it |
| `!vehicle --ping` | Pings the vehicle and pulls your view to it; `--ping all` pulls everyone |
| `!vehicle --ids id1,id2` | Targets tokens by ID instead of selection |
| `!vehicle --list` | Lists the vehicles on your current page |
| `!vehicle --help` | Opens the help handout |

Anyone who can move a vehicle carries its passengers.

## The Tooltip Tag

A vehicle is any token whose tooltip contains a `[vehicle]` tag. The script adds and removes the tag for you, but you can also type `[vehicle]` by hand; the script fills in the passenger list.

`[vehicle|rotate|overlap:50|area:5,12,5,20|aboard:...]`

- `rotate` — passengers turn with the vehicle.
- `overlap:N` — the percentage of a token that must overlap the area. Default 50.
- `area:l,t,r,b` — how far in from the left, top, right and bottom edges the area starts, in percent of the token's width and height.
- `aboard:` — the IDs of the passengers. The script keeps this; there is no need to edit it.

Settings at their default are left out. Any other tooltip text is left alone. Because everything lives in the tooltip, a vehicle keeps its settings when the token is copied or saved as a default token. If the tooltip is shown to players, they will see the tag.

## Other Scripts

Moves made by **TokenMod** and **ScriptCards** are handled like moves by hand: a vehicle moved by them carries its passengers, and a token moved by them boards or leaves.

Tokens moved or created by other scripts are not seen by Vehicle unless that script calls it. Such a token does not board or leave until it is next moved by hand, and a passenger moved off a vehicle this way is dropped at the vehicle's next move. **Set Passengers** brings a vehicle's list up to date.

## Limits

- Resizing a vehicle does not move its passengers.
- After a turn, passengers can sit between grid lines. They are not snapped back to the grid.
- Written for the current Roll20 tabletop (Jumpgate).

## For Script Writers

Scripts that move or rotate tokens with `set()` do not fire Roll20's change event. To have Vehicle handle such a move, call:

```js
if (typeof Vehicle !== 'undefined') Vehicle.handleMove(token, prev);
```

where `prev` holds the token's previous `left`, `top` and `rotation` (any missing values are taken from the token). If the token is a vehicle, its passengers are carried; any token boards or leaves vehicles as if it had been moved by hand. Passing `{}` as `prev` for a newly created token lets it board whatever it was placed on.

Also available:

- `Vehicle.isVehicle(token)` — whether a token is a vehicle.
- `Vehicle.passengers(vehicle)` — the vehicle's passengers, as token objects.
