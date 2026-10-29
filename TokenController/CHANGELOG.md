# Changelog

## 5.0.0

A full rewrite by MidNiteShadow7 of Developesque's TokenController, which was reported as not working in Jumpgate and no longer supported.

### Fixed

- One-Click installs work again. Version 4.0.1 was published without its `4.0.1/` folder, so installing it failed; the `4.0.0/` folder had also been overwritten with later code. Both folders now hold the code that was released under those numbers.
- Changing anything on a patrolling token (a bar, a marker, its name) no longer takes it off its route.
- Back-and-forth (non-cycling) routes walk back exactly the way they came. Version 4 skipped the last and first steps on the way back, so tokens drifted further away on every lap.
- Out-of-bounds checks use the token's centre and the page's current size. Version 4 treated the centre as the top-left corner and remembered each page's size the first time it was used, so tokens near the right or bottom edge, or on resized pages, could only move in some directions. Steps off the page are now skipped without the token losing its place on the route.
- The cell size comes from each page's grid (including cell sizes other than 1 and Jumpgate grid offsets) instead of one global Pixels Per Unit setting.
- Reset on a single path's row only resets that path's tokens, and puts tokens back on the layer they started on instead of always the token layer.
- A fixed start on another page reports the problem instead of failing silently (the API cannot move tokens between pages).
- `!tc list` without arguments no longer throws an error. Path names with spaces work everywhere, including the menu buttons and drafts.
- Paths made only of waits or stealth toggles, such as the built-in `S` Blinker, can be added.
- The usage guide handout is GM-only. Version 4 created it visible to every player and rewrote it on every restart.
- Lock no longer takes over the red status marker or teleports locked tokens every tick.
- Combat detection no longer misses the first creature added to the turn order, and is remembered across API restarts.
- Followers no longer stack on top of the leader when it patrols, and a token can no longer be made to follow itself or follow in a circle.
- Chat is no longer flooded: actions get a short whispered reply instead of the whole menu, and menus are not stored in the chat archive.
- Errors are reported to the GM with a hint, and logged to the API console without stopping the sandbox.

### Added

- Works in Jumpgate and Legacy games; the engine is detected automatically. No longer needs HTML Builder.
- Routes can be made from drawings on the map (Jumpgate `pathv2` and Legacy `path`: lines, polygons, freehand, rectangles and ellipses).
- Routes can be recorded by moving a token with buttons or by dragging it, following Roll20 waypoints. On square grids recordings become editable step codes.
- Diagonal steps (`UL`, `UR`, `DL`, `DR`), steps without a number (one cell) and counted waits (`W3`) in step codes.
- Square, hex (V and H), isometric, dimetric and gridless pages, with a `calibrate` command for maps whose grid does not line up.
- Movement setting: one cell per step (smooth) or a whole step at once (as version 4).
- Each route runs at its own interval exactly; version 4 rounded route intervals to multiples of the global tick.
- Combat Detection setting (turn tracker, GM switch or both) and Combat Behaviour setting (pause, move each turn or keep moving), with Combat On/Off buttons.
- Lock Mode setting: Roll20's own position lock, undoing moves, or holding still; and a Lock Marker setting.
- Follow Mode setting: single file or formation. Leaders can be chosen with the Leader button or by name, so `@{target}` is no longer needed. Followers move with tokens dragged by hand, patrolling tokens and tokens moved by TokenMod.
- Dragging a patrolling token carries the patrol on from there (or stops it, if preferred).
- Pause All and Resume.
- Rename, show and per-route option buttons; removing a route asks first.
- Turn Tokens supports token art facing any direction.
- Status card showing what the Mod is doing and how it sees the current page's grid.
- Public API for other Mods: `TokenController.ObserveTokenChange`, `start`, `stop`, `reset` and `routeOf`. Moves are passed to Hexploration v2 so patrols reveal hexes.
- Help and Command Deck handouts in the Journal.
- 24 languages.

### Changed

- The main command is `!tokencontroller`. `!tc` and `!token-control` still accept every version 4 command.
- A token follows one route at a time; starting another route replaces the first.
- Version 4 state is migrated on startup: paths, patrols, locks, followers, unfinished drafts and settings are kept.
- The default interval for new games is 2 seconds, moving one cell per step.

## 4.0.1

Metascript support: event handlers are registered when the game is ready. (The `4.0.1/` folder was missing from the release, so One-Click installs of this version failed until 5.0.0.)

## 4.0.0

Bug fixes and safety improvements, plus the features its code labels 4.1.0 and 4.2.0: fixed start per path, live tick changes, stale token clean-up, sub-step movement, per-path interval, run once, duplicate, export and import, maximum tokens, cycle toggle, random start step and bounds warnings.

## 3.0.0

Pixel unit size fix, rotate tokens, combat detection and combat patrol, rebuilt following, stealth toggle.

## 2.2.0

Paths reverse automatically at the end.

## 2.1.3

Pixels Per Unit setting.

## 2.1.1

Path builder and reversals.

## 1.0.0

First release.
