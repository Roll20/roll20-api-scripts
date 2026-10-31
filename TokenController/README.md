# TokenController

A Roll20 Mod that moves tokens for you: guards walk their rounds, carts follow their drivers and statues stay where you put them.

**Version 5.0.0 is a full rewrite that works in Jumpgate and Legacy games.** It no longer needs HTML Builder. Version 4 paths, patrolling tokens, locks, followers, the `T-Cntrl_` macros and the `!tc` commands keep working.

## Installation

1. Install **TokenController** from the Roll20 One-Click library, or upload `TokenController.js` to the game's API Scripts.
2. Save. On startup the Mod creates two GM-only handouts in the Journal:
   - **TokenController - Help**: full instructions.
   - **TokenController - Command Deck**: one-click buttons for every action.

If you are upgrading from version 4, you can remove HTML Builder unless another Mod uses it. The old **TokenController Usage Guide** handout, which every player could see, is removed.

## Quick Start

1. Type `!tokencontroller` for the menu, or open the Command Deck.
2. Click **Examples** to add ready-made routes, or **Step Code** and type one, for example `U2R2D2L2`.
3. Select one or more tokens and click **Start** next to a route.
4. Select a token and click **Stop** to stop it where it is, or **Reset** to send it back to where it started.

## Making Routes

There are four ways to make a route.

### Step codes

A step code is a list of moves. It is not tied to a place on the map, so the same route works anywhere.

| Code                | Meaning                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `U` `D` `L` `R`     | Move up, down, left or right one cell.                            |
| `UL` `UR` `DL` `DR` | Move diagonally.                                                  |
| `U3`, `R10`         | A number after a direction moves that many cells (up to 100).     |
| `U0`                | Turn to face up without moving (needs **Turn Tokens**).           |
| `W`, `W3`           | Wait one step, or that many steps.                                |
| `S`                 | Stealth: move the token between the token layer and the GM layer. |

Spaces and commas are allowed: `UR2 W DL2`. Version 4 codes such as `U3U0WWR2R0WWL4WWR2D3WW` work unchanged.

### From a drawing

Draw a line, polygon or freehand shape with Roll20's drawing tools, select it and click **From Drawing** (or `!tokencontroller draw <name>`). Tokens walk along the drawing, on that page. Rectangles and ellipses work too. You can delete the drawing afterwards.

### Recording

Select a token and click **Record** (or `!tokencontroller record <name>`). Move the token with the arrow buttons, or drag it on the map; Roll20 waypoints are followed. Add waits and stealth toggles with the buttons, then click **Save**. On square grids the recording is saved as a step code you can edit later; on other grids it is saved as waypoints.

### Bounce area

Draw a closed shape around an area (a polygon, rectangle, ellipse or freehand loop), select it and click **Bounce Area** (or `!tokencontroller bounce <name>`). Tokens started on the route wander inside the area: they travel in straight lines and bounce off its edges like a ball in Pong, turning a little at random each time so their path does not repeat. On a grid they step from cell to cell along their line; on gridless pages they move a cell's width at a time. Walls and closed doors inside the area are bounced off too, unless the route's `walls` option is `ignore`. A token must be inside the area to start, unless the route has a random start, which puts it in a random cell of the area. You can delete the drawing afterwards.

### Route options

| Option     | Values                              | Meaning                                                                                                             |
| ---------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `mode`     | `loop`, `pingpong`, `once`          | Start again, walk back the way it came, or stop at the end.                                                         |
| `interval` | milliseconds, or `0`                | This route's speed. `0` uses the global **Interval**.                                                               |
| `max`      | number, or `0`                      | The most tokens on the route at once.                                                                               |
| `random`   | `on`, `off`                         | Each token starts at a random point along the route.                                                                |
| `walls`    | `ignore`, `hold`, `turn`, `default` | How this route treats walls: walk through them (for ghosts), wait at them, turn back, or use the **Walls** setting. |
| `start`    | `set`, `clear`                      | `set` makes tokens jump to the selected token's position when they start.                                           |

New routes that end where they start loop; others go back and forth. Click **⋯** next to a route in the menu to see and change its options.

## Controlling Tokens

- **Start** puts the selected tokens on a route. A token follows one route at a time.
- **Stop** leaves tokens where they are and stops them following. `stop <route>` stops every token on a route; `stop all` stops every patrol.
- **Reset** returns tokens to where they were before they started, on their original layer.
- **Pause All** / **Resume** stop and restart every patrol at once.
- **Lock** holds a token in place. Locked tokens do not patrol or follow until unlocked. **Lock Mode** chooses how: Roll20's own position lock (the default), undoing any move, or simply holding still.
- **Follow**: select the leader and click **Leader**, then select the followers and click **Follow**. Or type the leader's name: `!tokencontroller follow Goblin Boss`. **Follow Mode** chooses between single file (followers walk in the leader's footsteps) and formation (followers keep their place around the leader; drag a follower to change its place). Followers can follow other followers.
- Dragging a patrolling token carries its patrol on from where you drop it, unless **Dragging a Patrol** is set to `stop`.
- **Stop Markers**: list status markers such as `dead;red` with `!tokencontroller set stopMarkers dead;red`. A patrolling token that gets one leaves its route (**Stop Marker Action** chooses whether it stays where it is or goes back to where it started), marked tokens stop following, and the followers of a marked leader stop too. The markers are checked every quarter of a second, even while patrols are paused for combat, so markers added by other Mods count. Number badges are ignored and custom markers match by name.
- **Walls**: Roll20 does not stop tokens that Mods move at walls, so TokenController checks every move itself. With **Walls** set to `hold`, patrols wait at dynamic lighting walls and closed doors and windows (and carry on when a door opens); with `turn` they turn back. Followers wait rather than cross a wall. Open doors and windows let tokens through. **Wall Check** chooses whether only a token's centre or its whole width must stay clear, and **One-Way Walls** and **See-Through Walls** whether those kinds block. Give a route its own `walls` option to override the setting, for example `ignore` for a ghost.

## Commands

Only GMs, and other Mods (see [Working with Other Mods](#working-with-other-mods)), can use these commands. Routes can be named, or referred to by the `#id` the menu buttons use. Put a name in "quotes" when a command takes two names and the first has spaces.

| Command                                           | What it does                                                                                                                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `!tokencontroller`                                | Show the menu.                                                                                                                                                                                |
| `!tokencontroller start <route>`                  | Put the selected tokens on a route.                                                                                                                                                           |
| `!tokencontroller stop [<route>\|all]`            | Stop the selected tokens (patrols and following), a route's tokens, or all.                                                                                                                   |
| `!tokencontroller reset [<route>\|all]`           | Return tokens to where they started and stop them.                                                                                                                                            |
| `!tokencontroller pause` / `resume`               | Pause or resume every patrol.                                                                                                                                                                 |
| `!tokencontroller lock` / `unlock`                | Hold the selected tokens in place, or release them.                                                                                                                                           |
| `!tokencontroller leader`                         | Choose the selected token as the leader.                                                                                                                                                      |
| `!tokencontroller follow [<leader>]`              | Make the selected tokens follow the leader, or a token given by name or ID.                                                                                                                   |
| `!tokencontroller unfollow`                       | Stop the selected tokens following.                                                                                                                                                           |
| `!tokencontroller add <name> <code>`              | Create a route from a step code.                                                                                                                                                              |
| `!tokencontroller edit <route> <code>`            | Change a route's step code.                                                                                                                                                                   |
| `!tokencontroller draw <name>`                    | Create a route that follows the selected drawing.                                                                                                                                             |
| `!tokencontroller bounce <name>`                  | Create a route on which tokens bounce around inside the selected closed drawing.                                                                                                              |
| `!tokencontroller record <name>`                  | Record a route by moving the selected token.                                                                                                                                                  |
| `!tokencontroller route <route> <option> <value>` | Change a route option.                                                                                                                                                                        |
| `!tokencontroller show <route>`                   | Show a route's details and buttons.                                                                                                                                                           |
| `!tokencontroller rename <route> <new name>`      | Rename a route.                                                                                                                                                                               |
| `!tokencontroller copy <route> <new name>`        | Copy a route.                                                                                                                                                                                 |
| `!tokencontroller remove <route>`                 | Remove a route (asks first).                                                                                                                                                                  |
| `… --ids <id;id;…>`                               | With `start`, `stop`, `reset`, `lock`, `unlock` or `remove`: act on the tokens with these IDs instead of the selection. `remove --ids` takes them off their routes and never removes a route. |
| `!tokencontroller list [routes\|tokens]`          | List routes, or the tokens being controlled.                                                                                                                                                  |
| `!tokencontroller examples`                       | Add the example routes.                                                                                                                                                                       |
| `!tokencontroller export [<route>]`               | Show routes as text to copy into another game.                                                                                                                                                |
| `!tokencontroller import <text>`                  | Add routes from export text (version 4 `exportpaths` text works too).                                                                                                                         |
| `!tokencontroller combat on\|off`                 | Switch combat on or off by hand.                                                                                                                                                              |
| `!tokencontroller set [<setting> <value>]`        | Change a setting, or show all settings.                                                                                                                                                       |
| `!tokencontroller calibrate` / `calibrate reset`  | Line the grid up with tokens snapped to cell centres, or remove the calibration.                                                                                                              |
| `!tokencontroller status`                         | Show what the Mod is doing and how it sees the current page.                                                                                                                                  |
| `!tokencontroller journal rebuild`                | Rebuild the Help and Command Deck handouts.                                                                                                                                                   |
| `!tokencontroller help`                           | List the commands.                                                                                                                                                                            |

### Version 4 commands

`!tc` and `!token-control` accept every version 4 command, so existing macros and old chat buttons keep working. They also accept the version 5 commands.

| Version 4                               | Version 5                                                      |
| --------------------------------------- | -------------------------------------------------------------- |
| `!tc` / `!token-control`                | `!tokencontroller`                                             |
| `!tc set <path> <code>`                 | `!tokencontroller edit <route> <code>`                         |
| `!tc setstart` / `clearstart <path>`    | `!tokencontroller route <route> start set\|clear`              |
| `!tc build`, `!tc draft`                | `!tokencontroller record`                                      |
| `!tc tick <ms>`                         | `!tokencontroller set interval <ms>`                           |
| `!tc unit <n>`                          | `!tokencontroller set buttonStep <n>`                          |
| `!tc rotate` / `combat` / `substeps`    | `!tokencontroller set facing` / `combatBehaviour` / `movement` |
| `!tc pathinterval` / `maxtokens`        | `!tokencontroller route <route> interval` / `max`              |
| `!tc runonce` / `cycle` / `randomstart` | `!tokencontroller route <route> mode` / `random`               |
| `!tc duplicate`                         | `!tokencontroller copy`                                        |
| `!tc exportpaths` / `importpaths`       | `!tokencontroller export` / `import`                           |
| `!tc follow <follower> <leader>`        | `!tokencontroller follow <leader>`                             |
| `!tc unitpx`                            | Not needed: the cell size comes from each page.                |

## Grids

- TokenController reads each page's grid type, cell size and (in Jumpgate) grid offset every time it moves a token, so different pages can use different grids and resizing a page takes effect at once.
- **Square** and **gridless** pages move one cell (70 px × the cell size) per step. Pages with snapping off move without lining up to a grid.
- **Hex (V)** and **Hex (H)** pages move to a neighbouring hex. Directions with no matching neighbour (up and down on Hex (V), left and right on Hex (H)) zigzag and stay on course.
- **Isometric** and **dimetric** pages move along the screen: diagonals cross one diamond edge, straight moves cross a corner.
- If tokens drift off the grid, snap a token to a cell centre, select it and run `!tokencontroller calibrate`. Select two tokens in neighbouring cells of one row (one column on Hex (H)) to correct the cell size too.
- Steps that would leave the page are skipped; the token rejoins its route when it comes back on to the page.

## Combat

- **Combat Detection**: `tracker` (the turn tracker is open with someone in it), `manual` (the **Combat On** / **Combat Off** buttons) or `both` (the default).
- **Combat Behaviour**: `pause` (the default), `step` (every patrol moves once each time the turn passes) or `ignore` (patrols keep moving).
- The GM is told when patrols pause and resume.

## Settings

| Key                | Setting            | Default    | Description                                                                                         |
| ------------------ | ------------------ | ---------- | --------------------------------------------------------------------------------------------------- |
| `interval`         | Interval           | `2000`     | Milliseconds between steps (250 to 600000). Values under 10 are seconds.                            |
| `movement`         | Movement           | `cell`     | `cell` moves one cell per step; `segment` moves a whole step such as `U3` at once.                  |
| `facing`           | Turn Tokens        | `off`      | `off`, or the way the token art faces: `up`, `down`, `left` or `right`.                             |
| `combatDetection`  | Combat Detection   | `both`     | `tracker`, `manual` or `both`.                                                                      |
| `combatBehaviour`  | Combat Behaviour   | `pause`    | `pause`, `step` or `ignore`.                                                                        |
| `lockMode`         | Lock Mode          | `native`   | `native` (Roll20's position lock), `revert` (undo moves) or `freeze`.                               |
| `lockMarker`       | Lock Marker        | `none`     | A status marker shown on locked tokens, or `none`. Players can see markers.                         |
| `followMode`       | Follow Mode        | `trail`    | `trail` (single file) or `formation`.                                                               |
| `manualMove`       | Dragging a Patrol  | `continue` | `continue` (carry on from where it is dropped) or `stop`.                                           |
| `stopMarkers`      | Stop Markers       | `none`     | Status markers, separated by semicolons, that take a token off its route and stop it following.     |
| `markerAction`     | Stop Marker Action | `stop`     | `stop` (stay where it is) or `reset` (go back to where it started).                                 |
| `wallMode`         | Walls              | `ignore`   | `ignore` (walk through walls), `hold` (wait at them) or `turn` (turn back). Routes can override it. |
| `wallCheck`        | Wall Check         | `centre`   | `centre` (the token's centre must stay clear of walls) or `width` (its whole width must).           |
| `oneWayWalls`      | One-Way Walls      | `block`    | `block` or `pass`.                                                                                  |
| `transparentWalls` | See-Through Walls  | `block`    | `block` or `pass`.                                                                                  |
| `buttonStep`       | Cells per Click    | `1`        | How far the recording arrows move a token.                                                          |
| `language`         | Language           | `en-US`    | One of 24 languages. `!tokencontroller set language` lists them.                                    |

**Movement**, **Turn Tokens**, **Combat Detection**, **Combat Behaviour**, **Lock Mode**, **Follow Mode** and **Language** can also be set on the Mod's settings page in the API Scripts screen.

Games upgraded from version 4 keep their interval, sub-step, rotation, combat patrol and units-per-click settings, and use undo-moves locks with the red marker, as version 4 did.

## Working with Other Mods

- Other Mods can send TokenController commands, for example ScriptCards with `--@tc|stop --ids [*S:t-id]`. Replies are whispered to the GM. Other Mods cannot select tokens, so they name them with `--ids` followed by token IDs separated by semicolons: `!tc stop --ids -Mabc123;-Mdef456`, `!tc start "Guard Walk" --ids -Mabc123`.
- Followers move with leaders moved by **TokenMod**. Other Mods' moves are invisible to the Roll20 API.
- Every move TokenController makes is passed to **Hexploration** v2, so patrolling and following tokens reveal hexes as if they had been dragged (Hexploration's **Tokens That Reveal** setting still decides which tokens count).
- Other Mods can use the API:

```js
// Be told whenever TokenController moves a token (same shape as TokenMod's).
TokenController.ObserveTokenChange((token, prev) => {
  /* prev.left, prev.top */
});
TokenController.start(tokenId, 'Guard Walk'); // true when started
TokenController.stop(tokenId);
TokenController.reset(tokenId);
TokenController.routeOf(tokenId); // "Guard Walk" or null
TokenController.version; // "5.0.0"
```

## Upgrading from Version 4

- Paths become routes with the same names. Patrolling tokens carry on from where they are. Locks and followers are kept. Unfinished drafts become routes ending in "(draft)".
- A token now follows one route at a time; version 4 tokens on several paths keep the first.
- Version 4 replied to every action with the whole menu; version 5 sends a short reply, and menus are not saved in the chat archive.
- The Pixels Per Unit setting is gone. If your tokens do not line up, use `calibrate`.

## Credits

Original Mod by [Developesque](https://app.roll20.net/users/6975764) ([Patreon](https://www.patreon.com/Developesque)).

Version 5 maintained by [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7) ([GitHub](https://github.com/steverobertsuk)).

If you find a bug or have an idea, post in the Roll20 Mod forum or open an issue on GitHub, and include any messages from the API console log.

## License

This script is licensed under the MIT License.
