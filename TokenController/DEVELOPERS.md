# TokenController — Developer Guide

## Project Layout

| Path                           | Purpose                                                                |
| ------------------------------ | ---------------------------------------------------------------------- |
| `src/`                         | ES module source. `src/index.js` is the Rollup entry point.            |
| `src/locales/locale/*.js`      | Translations. `en-US.js` is the source; the others are generated.      |
| `tests/`                       | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.        |
| `scripts/`                     | Build, version bump and locale sync scripts.                           |
| `TokenController.js`           | Generated bundle for the One-Click library. Do not edit.               |
| `<version>/TokenController.js` | Generated snapshot for each released version.                          |
| `1.0.0/` … `4.0.1/`            | Developesque's original releases, kept for the One-Click version list. |
| `script.json`                  | One-Click metadata and useroptions.                                    |

### Version folders

Every version in `script.json`'s `version` and `previousversions` must have a folder with the script in it, or One-Click installs of that version fail. Version 4.0.1 was published without its folder, and 4.2.0 code had been written over `4.0.0/`. Version 5 restored `4.0.0/` to the code released as 4.0.0 (commit `e53c26bf`) and added `4.0.1/` with the code released as 4.0.1 (commit `72dcd80b`). Never edit an old version folder.

## Module Responsibilities

| Module         | Responsibility                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `index.js`     | Event registration, startup (`checkInstall`), public `TokenController` API, TokenMod observer.         |
| `commands.js`  | `!tokencontroller` parsing and routing, chat menus, route/recording/settings cards.                    |
| `legacy.js`    | Translates v4 `!tc` / `!token-control` subcommands into v5 commands.                                   |
| `engine.js`    | Scheduler, patrols, followers, locks, combat, recording moves, observers and Hexploration hand-off.    |
| `routes.js`    | Pure route maths: step-code parsing, track compilation, next-frame logic, recordings to routes.        |
| `grid.js`      | Pure grid geometry for square, hex, isometric/dimetric and gridless pages; calibration.                |
| `drawings.js`  | Pure maths turning Legacy `path` and Jumpgate `pathv2` drawings into waypoints.                        |
| `context.js`   | Builds a page's grid (with calibration) and size from the Roll20 page.                                 |
| `state.js`     | Persistent state, config and route validation, v4 migration, accessors.                                |
| `journals.js`  | Help and Command Deck handouts; removal of the v4 usage guide.                                         |
| `chat.js`      | Chat cards, buttons, whispers and errors.                                                              |
| `i18n.js`      | Translation lookup (`t`, `tRaw`), locale normalisation and text direction.                             |
| `constants.js` | Build placeholders, command names, defaults, limits, help table, examples and colours.                 |
| `utils.js`     | Small helpers: HTML escaping, parsing, quoting-aware tokenizer, markers, `lastmove`, engine detection. |

`grid.js`, `routes.js` and `drawings.js` must stay free of Roll20 globals so they can be unit tested directly. There are no circular imports.

## How Movement Works

A route compiles into a **track**: the list of positions (frames) a token visits, starting where it starts. Every frame is one cell; frames that end a step of the route are marked `end`.

- **Step codes** are compiled by stepping cell by cell through `grid.stepFrom` from the token's anchor position.
- **Waypoint routes** split each leg into steps about one cell long. Drawn routes are anchored to their page; recorded routes are relative to where the token starts.
- `nextFrame` walks the track: forwards then wrap (loop), forwards then backwards (ping-pong), or forwards then finish (once). In `segment` movement it skips to the next `end` frame. Closed loops skip frame 0 so they do not pause on it.

Because ping-pong walks the same frames backwards, a token always retraces exactly the cells it came along (v4 recomputed reversed directions and drifted).

Patrols store `index`, `dir` and `anchor`, never the track itself; tracks are compiled on demand and cached in memory by route, anchor and grid. Editing a route or a page's grid therefore takes effect on the next step.

### Hex zigzags

Directions with no matching hex neighbour (up/down on Hex (V), left/right on Hex (H)) pick between the two nearest neighbours, keeping close to a reference line set when the zigzag starts and kept until a sideways move. Ties lean the same way (left on Hex (V), up on Hex (H)) whichever way the token travels, so stepping back retraces the same hexes.

### Scheduling

One `setInterval` runs every `SCHEDULER_TICK_MS` (250 ms). Each patrol has a `dueAt` time and moves when it has passed, so every route keeps its own interval. The scheduler also re-checks combat on each tick.

## State Structure

`state.TokenController`:

```js
{
  schemaVersion: 5,
  version: '5.0.0',
  config: { language, interval, movement, facing, combatDetection, combatBehaviour,
            lockMode, lockMarker, followMode, manualMove, buttonStep },
  routes: {
    [id]: { id, name, kind: 'code'|'waypoints', code?, anchor?: 'page'|'token', pageId?,
            points?: [{ x, y } | { wait } | { stealth: true }],
            mode: 'loop'|'pingpong'|'once', interval, maxTokens, randomStart,
            start: null | { pageId, left, top, rotation } },
  },
  nextId: 1,                       // shared by routes (r#) and recordings (d#)
  patrols: { [tokenId]: { routeId, pageId, index, dir, anchor: [x, y] | null,
                          origin: { left, top, rotation, layer }, dueAt } },
  locks: { [tokenId]: { pageId, left, top, rotation, marker, mode, native } },
  follows: { [tokenId]: { leaderId, offset: [dx, dy] | null } },
  leaders: { [playerId]: tokenId }, // set by `leader`
  recordings: { [id]: { id, name, tokenId, pageId, entries: [...] } },
  calibrations: { [pageId]: { dx, dy, scale } },
  combat: { manual, active, turnId },
  paused: false,
  notices: { useroptions: {...}, migratedV4?: { routes, patrols, unitPx } },
}
```

### v4 migration

v4 kept `storedVariables` with arrays keyed by name: `paths`, `activeTokenPaths`, `tokenMemory`, `pathDrafts` and its settings. `migrateState()` converts them on startup:

- Paths become code routes. `isCycle` → `loop`/`pingpong` (worked out from the code when missing, as v4 did), `runOnce` → `once`, and the 4.x options carry over. A 4.0.0 path whose `path` held the whole record is repaired.
- Active paths become patrols with `anchor: null`, re-anchored at the token's position on startup. Only the first path per token is kept.
- Locked tokens become `revert` locks with the red marker (each lock keeps the mode it was made with); following tokens become trail followers.
- Drafts with steps become routes named "<name> (draft)".
- Settings map to `interval`, `movement`, `facing` (`down`, v4's angles), `combatBehaviour` and `buttonStep`. A non-default `unitPx` triggers a notice pointing to `calibrate`.

The v4 "TokenController Usage Guide" handout (visible to all players) is removed after migration.

## Build System

```bash
npm install
npm run build                  # bump patch version, then build
npm run build -- 5.1.0         # set an explicit version, then build
npm run build -- --no-bump     # rebuild without changing the version
npm test                       # unit and end-to-end tests (build first)
npm run format
```

`scripts/build.mjs` writes `TokenController.js` and `<version>/TokenController.js`. `rollup.config.js` replaces `__SCRIPT_NAME__`, `__BUILD_VERSION__` and `__BUILD_DATE__` in `constants.js` and wraps the bundle in `const TokenControllerMod = (() => { … })();`. The public API is published on `globalThis.TokenController` from `index.js`.

### Versioning

`scripts/bump-version.mjs` updates `script.json` and `package.json` and keeps the last five stable versions in `previousversions`. When that drops an old version from the list its folder must stay, so existing installs keep working.

## Tests

- `tests/grid.test.mjs`, `tests/routes.test.mjs` and `tests/state.test.mjs` import the pure modules directly.
- `tests/tokencontroller.test.mjs` loads the built bundle into `tests/roll20-stub.mjs`, a minimal Roll20 sandbox with objects, events, chat, timers and a controllable clock (`advance(ms)` runs the scheduler). It fails if the Mod logs an error.

The stub does not reproduce Roll20 rendering, layers, the native position lock or permissions; use `TESTING.md` in real games for those.

## Internationalisation (i18n)

- `t(key, locale, vars)` returns a string with `{placeholder}` interpolation; `tRaw` returns arrays (used for handout lists). Both fall back to en-US.
- Add new keys to `src/locales/locale/en-US.js` only, then run:

```bash
npm run sync-locales            # translate missing keys in every locale
npm run regenerate-locales      # re-translate everything (slow)
node scripts/sync-locales.mjs --locale=fr --yes   # one locale
```

The sync script uses Google Translate with placeholder masking. Review generated text before release.

## Adding a New Command

1. Add a handler in `commands.js` and a `case` in `routeCommand`.
2. Add `help.<key>` (and any `messages.`, `errors.`, `hints.` keys) to `en-US.js`.
3. Add it to `HELP_COMMANDS` in `constants.js` (used by `help` and the Help handout), the README and `MOD_FILE_MAP.md`.
4. If it replaces a v4 command, map it in `legacy.js`.
5. Add a button to the menu and Command Deck if it is a common action.
6. Add an end-to-end test.

## Coding Standards

- Modern JavaScript (ES2020+), strict mode via the Rollup IIFE wrapper.
- Prettier: single quotes, trailing commas (ES5), 100-character lines.
- JSDoc on every function.
- Functional style; no classes.
- One concern per module; no circular imports.
- All user-facing errors whisper the problem and how to fix it. Stack traces go to the API console only.
- Everything a GM types is validated; everything shown in chat or handouts is HTML-escaped.
- Event handlers and the scheduler are wrapped so an exception is logged rather than stopping the sandbox.

## Roll20 API Notes

- `state.TokenController` is the only persistent storage.
- API changes do not raise `change:` events. TokenController announces its own moves to followers, observers (`TokenController.ObserveTokenChange`) and `Hexploration.revealAround`. TokenMod's `ObserveTokenChange` is used to follow tokens TokenMod moves.
- `lastmove` holds the start and waypoints of the latest drag. It is only trusted when it starts at the token's previous position.
- Graphics cannot be moved between pages by the API, so fixed starts and drawn routes check the token's page.
- `lockMovement` is Roll20's own "lock position" flag; the API can still move a locked token.
- Page `width` and `height` are in 70 px units whatever the cell size; `snapping_increment` is the cell size in units (0 when snapping is off).
- In Jumpgate, `grid_offset_y` is measured upwards.
- `initiativepage` is falsy when the turn tracker is closed.
