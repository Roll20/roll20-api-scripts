# TokenController — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover grid geometry for every grid type, step-code parsing, track compilation and stepping, drawings, recordings, v4 migration, and end-to-end command, patrol, follow, lock, combat and upgrade scenarios against a stubbed Roll20 API with a controllable clock. They cannot check rendering, real layer behaviour, Roll20's position lock or Jumpgate's grids, so run the manual checklist below in real games before release.

---

## Test Games

| Game         | Engine                         | Needed for                                |
| ------------ | ------------------------------ | ----------------------------------------- |
| **Jumpgate** | Jumpgate, Experimental sandbox | Everything below                          |
| **Legacy**   | Legacy                         | Legacy drawings and grids, the v4 upgrade |

Each game needs:

- Page **Square**: square grid, cell size 1, about 30 × 20.
- Page **Square Half**: square grid, cell size 0.5.
- Page **Hex V** and **Hex H**: hex grids, cell size 1.
- Page **Gridless**: snapping off.
- Pages **Isometric** and **Dimetric**, cell size 1.
- A few NPC tokens, one 2 × 2 token, and a player-controlled token.
- Optionally a player account, to check what players see (`?viewas=<playerId>` in Jumpgate's editor).

For the upgrade test, install TokenController **4.0.1** in the Legacy game first (paste `4.0.1/TokenController.js` with HTML Builder), add paths, start some tokens on paths, lock one, make one follow another and leave a draft unfinished. Note where every token is. Then replace the script with version 5.

---

## Setup

- [ ] Install `TokenController.js` and save. The API console shows `-=> TokenController v5.0.1 … (Jumpgate) <=-` (or `(Legacy)`).
- [ ] The GM receives the "TokenController is ready." whisper.
- [ ] The Journal has **TokenController - Help** and **TokenController - Command Deck**, neither visible to players.
- [ ] Every button in the Command Deck works.
- [ ] A player typing `!tokencontroller` or `!tc` is told only the GM can use it.
- [ ] A command sent by another Mod (for example a ScriptCards `--@tc|stop --ids [*S:t-id]`) works, and its reply is whispered to the GM.

## Grids — do this first

- [ ] On **Square**, add `Box` = `R2D2L2U2`, start a token in a cell centre: it stays on cell centres and returns to its start.
- [ ] Repeat on **Square Half**, **Hex V**, **Hex H** and **Gridless**. On hex pages, `U3D3` and `L3R3` zigzag and come back to the start.
- [ ] Repeat on **Isometric** and **Dimetric**; diagonals (`UR2DL2`) follow the diamonds. (Geometry measured in both engines 2026-10-29; Legacy stores `top` up to half a pixel lower, which does not matter.)
- [ ] Jumpgate: move a page's grid with the map alignment tool; tokens still land on cell centres.
- [ ] If any grid drifts: snap a token to a cell centre, `calibrate`; then two tokens in neighbouring cells of one row (column on Hex H). Note the scale reported so the defaults in `src/grid.js` can be corrected. `calibrate reset` removes it.
- [ ] `status` shows the right grid type and cell size for each page.

## Routes

- [ ] **Examples** adds the example routes; running it again adds none.
- [ ] Step codes with diagonals, `W3`, `S` and `U0` (with Turn Tokens on) behave as described.
- [ ] Bad codes (`U2X4`, `U999`) give a clear error.
- [ ] **From Drawing**: draw a polyline, a polygon, a freehand line, a rectangle and an ellipse; each becomes a route the token walks along. Delete the drawing; the route still works. Starting a drawn route on another page gives an error.
- [ ] **Record**: arrows, Wait, Stealth, Undo and dragging (with Jumpgate waypoints) are all recorded; Save gives a step code on square pages and a waypoint route on hex pages.
- [ ] Route options: mode (loop, back and forth, once), interval, max tokens, random start, fixed start (set with a token selected, then start a token elsewhere on the page).
- [ ] Rename, Copy, Edit Code, Export, Import (into the other game), Remove (asks first).
- [ ] **Bounce Area**: draw a rectangle, a concave polygon and an ellipse; each becomes a bounce route. A token started inside wanders in straight lines and bounces off the edges without leaving the area, on Square, Hex V, Hex H, Isometric and Gridless pages. A token outside is refused unless the route has a random start. Drag a bouncing token out of the area: it heads back in.

## Patrols

- [ ] Several tokens on routes with different intervals each keep their own speed.
- [ ] Movement `segment` moves whole steps; `cell` moves one cell at a time.
- [ ] Back-and-forth routes return exactly to the start after many laps.
- [ ] Change a patrolling token's bar, name or marker: it keeps patrolling.
- [ ] Drag a patrolling token: it carries on from there. With Dragging a Patrol = stop, it stops.
- [ ] Stop (selected), Stop on a route row, Stop All, Reset (selected, route, all), Pause All and Resume.
- [ ] A route that runs off the page warns when started and skips the off-page steps.
- [ ] Resize a page while tokens patrol; they keep moving correctly.
- [ ] Stealth (`S`) hides and shows the token for players.
- [ ] Restart the API sandbox: patrols carry on from where they were.
- [ ] `--ids`: with nothing selected, `!tc start <route> --ids ID1;ID2`, `stop --ids`, `reset --ids`, `lock --ids`, `unlock --ids` and `remove --ids` act on those tokens; `remove --ids` leaves the route in place; an unknown ID is reported.

## Stop Markers

- [ ] `set stopMarkers dead;red`, start two patrols, then add the `dead` marker to one by hand: it stops at once and the GM is told.
- [ ] Add a marker with TokenMod (`!token-mod --set statusmarkers|red`) to the other: it stops within a quarter of a second.
- [ ] Open the turn tracker (patrols pause), mark a token, close the tracker: the marked token does not move again.
- [ ] `set markerAction reset`: a marked token goes back to where it started.
- [ ] A custom marker from the token marker library (by name) and a marker with a number badge both count.
- [ ] A marked follower stops following; when the leader is marked its followers stop.
- [ ] Starting a marked token is refused.

## Walls

- [ ] Jumpgate: draw walls with the Dynamic Lighting wall tool across a route. With Walls = ignore (the default) patrols walk through them, as before.
- [ ] Walls = hold: the patrol waits at the wall. Add a door in the wall: the patrol waits while it is closed and goes through when a player opens it.
- [ ] Walls = turn: the patrol turns back at the wall; a run-once route stops when it is back at its start.
- [ ] A route with `walls ignore` (a ghost) walks through while the others stop.
- [ ] Wall Check = width: a large token cannot squeeze through a gap narrower than itself, but walks along walls on the cell edges.
- [ ] One-Way Walls and See-Through Walls = pass let tokens through those kinds of wall only.
- [ ] Formation followers wait rather than cross a wall.
- [ ] A bounce area with a wall across it: tokens bounce off the wall and stay on their side.
- [ ] Legacy: repeat hold and turn with walls drawn on the Dynamic Lighting layer.

## Following

- [ ] Leader + Follow with three tokens: they walk single file behind a patrolling leader and behind a leader you drag.
- [ ] `follow <name>` works with a token name; an unknown name gives a clear error.
- [ ] Formation: followers keep their place; dragging a follower changes its place.
- [ ] A follower of a follower moves too; following in a circle is refused.
- [ ] With TokenMod installed, `!token-mod --set left|+70` on a leader moves its followers.

## Locks

- [ ] Lock Mode native: players and the GM cannot drag the token; Unlock frees it.
- [ ] Lock Mode revert: dragging the token snaps it back.
- [ ] Lock Mode freeze: the token stops patrolling and following but can be dragged.
- [ ] Lock Marker shows and clears the chosen marker without touching other markers.

## Combat

- [ ] Detection both / tracker: opening the turn tracker with someone in it pauses patrols, and closing it resumes them. The GM is told both times.
- [ ] Detection manual: Combat On / Off pauses and resumes; the turn tracker is ignored.
- [ ] Behaviour step: patrols move once each time the turn passes.
- [ ] Behaviour ignore: patrols keep moving.

## Upgrade from 4.0.1 (Legacy game)

- [ ] On startup the GM sees "Upgraded from version 4" and the menu.
- [ ] Every v4 path is a route; drafts are routes ending in "(draft)".
- [ ] Tokens that were patrolling carry on from where they are; locked tokens stay locked; followers follow.
- [ ] The old "TokenController Usage Guide" handout is gone.
- [ ] The `T-Cntrl_Menu`, `T-Cntrl_Builder` and `T-Cntrl_Follow` macros still work, as do typed `!tc` commands (`!tc tick 3`, `!tc rotate`, `!tc start Square`, `!tc exportpaths`).
- [ ] HTML Builder can be removed without errors.

## One-Click

- [ ] With the Mod installed from One-Click, the version list offers 5.0.1, 5.0.0, 4.0.1, 4.0.0 and older, and installing 4.0.1 and 4.0.0 works (no "No such file" error).
- [ ] The useroptions (Movement, Turn Tokens, Combat Detection, Combat Behaviour, Lock Mode, Follow Mode, Language) apply after saving, and a value changed in chat is not overwritten on restart.

## Languages and Hexploration

- [ ] `set language fr` (or another) translates menus and rebuilds the handouts.
- [ ] With Hexploration v2 installed, a patrolling player token reveals hexes as it moves.
