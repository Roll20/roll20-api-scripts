# Hexploration — Developer Guide

## Project Layout

| Path                        | Purpose                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `src/`                      | ES module source. `src/index.js` is the Rollup entry point.               |
| `src/locales/locale/*.js`   | Translations. `en-US.js` is the source; the others are generated.         |
| `tests/`                    | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.           |
| `scripts/`                  | Build, version bump and locale sync scripts.                              |
| `Hexploration.js`           | Generated bundle for the One-Click library. Do not edit.                  |
| `<version>/Hexploration.js` | Generated snapshot for each released version.                             |
| `1.0/` … `1.3/`             | Ada Lindberg's original releases, kept for the One-Click version history. |
| `script.json`               | One-Click metadata and useroptions.                                       |

## Module Responsibilities

| Module         | Responsibility                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `index.js`     | Event registration, startup (`checkInstall`), public `Hexploration` API, TokenMod observer.     |
| `commands.js`  | `!hexploration` and v1 command parsing and routing, chat menus and cards.                       |
| `constants.js` | Build placeholders, command names, defaults, limits and colours.                                |
| `state.js`     | Persistent state, config validation, v1 migration, hex records and the in-memory path index.    |
| `grid.js`      | Pure hex geometry: offset/cube conversion, pixel lookup, distance, lines, ranges, calibration.  |
| `polygon.js`   | Pure path maths: Legacy `path` and Jumpgate `pathv2` to page-space rings, point-in-polygon.     |
| `paths.js`     | Roll20 path I/O for both path types, hex drawing and layer fallback.                            |
| `context.js`   | Builds a page's grid (with calibration) and the page context used by commands.                  |
| `hexes.js`     | Fill, inverse fill, conceal, reset, undo, rescan, calibrate and startup pruning.                |
| `reveal.js`    | Which tokens reveal, route and footprint calculation, line of sight, glimpse and announcements. |
| `locations.js` | Named hexes, GM labels, hidden location tokens and pending locations.                           |
| `cover.js`     | Hides player-visible names, bars and auras of tokens under covered hexes, and restores them.    |
| `journals.js`  | Help and Command Deck handouts.                                                                 |
| `chat.js`      | Chat cards, buttons, whispers and errors.                                                       |
| `i18n.js`      | Translation lookup (`t`, `tRaw`), locale normalisation and text direction.                      |
| `utils.js`     | Small helpers: HTML escaping, parsing, colour validation, engine detection, batching.           |

`grid.js` and `polygon.js` must stay free of Roll20 globals so they can be unit tested directly.

## State Structure

`state.Hexploration`:

```js
{
  schemaVersion: 2,
  version: '2.0.2',
  config: { language, hexLayer, fillColor, strokeColor, labelColor, glimpseColor,
            strokeWidth, maxDistance, revealDistance, lineOfSight, revealPath,
            revealBy, revealMode, announce, pingDiscoveries },
  pages: {
    [pageId]: {
      hexes: { 'row,col': { id, type, row, col, name?, nameId?, iconId?, maxDistance?, glimpsed? } },
      settings: { /* per-page overrides, PAGE_SETTING_KEYS only */ },
      calibration: null | { colStep, rowStep, originX, originY },
    },
  },
  pendingLocations: { [tokenId]: pageId },
  coveredTokens: { [tokenId]: { pageId, saved: { showplayers_name, showplayers_bar1, … } } },
  lastFill: null | { pageId, kind, time, created: [{ key, id }], restyled: [...], icons: [...], sources: [...] },
  notices: { useroptions: { /* last applied One-Click values */ } },
}
```

The path ID → hex lookup is an in-memory `Map` rebuilt from `pages` on first use, so it can never drift from the stored hexes.

### v1 migration

v1 stored `pageHexes[pageId]['row,col'] = { id, name, nameId, iconId, maxDistance }`, a parallel `hexIdMap`, and a flat `config`. `migrateState()` converts this on startup, keeping the v1 colours, border width and reveal distance (v1 defaulted to 0). Hex keys keep the same meaning because Legacy grid spacing is unchanged.

## Hex Geometry

Hexes use offset coordinates `[row, col]`, matching v1's keys:

- **Hex (V)** (`grid_type: 'hex'`): pointy-top hexes, odd rows shifted right by half a column.
- **Hex (H)** (`grid_type: 'hexr'`): flat-top hexes, odd columns shifted down by half a row.

The grid is a regular hex lattice scaled by `colStep` and `rowStep`, so conversion, rounding, distance and line drawing are done exactly in cube coordinates for both Legacy's stretched hexes and Jumpgate's regular ones.

| Profile  | Hex (V) colStep / rowStep / origin | Hex (H) colStep / rowStep / origin |
| -------- | ---------------------------------- | ---------------------------------- |
| Legacy   | 75.199 / 66.966 / (37.5, 44)       | 69.585 / 79.689 / (47, 40.5)       |
| Jumpgate | 70 / 60.622 / (35, 40.415)         | 60.622 / 70 / (40.415, 35)         |

Legacy values are v1's measurements. Jumpgate values come from the Jumpgate client's hex grid: regular hexes 70 px across the flats (corner radius 70/√3), with the first hex's bounding box at the page's top-left corner. Jumpgate pages also have `grid_offset_x` / `grid_offset_y` (set by the map alignment tool); the x offset moves the grid right and the y offset moves it **up** (Jumpgate's engine y axis points up). Per-page calibration overrides all four values.

All values are multiplied by the page's `snapping_increment` (1 when snapping is off).

## Paths in Jumpgate and Legacy

- Jumpgate draws `pathv2` (`shape`, `points`, `x`, `y`, `rotation`). Points are relative to their bounding box, which is centred on `x`,`y`. `rec` and `eli` store two corner points.
- Legacy draws `path` (`_path`, `left`, `top`, `width`, `height`, `scaleX`, `scaleY`, `rotation`). `_path` may contain `M`, `L`, `Q` and `C` commands and the `mapWidth`/`mapHeight` placeholders.
- The engine is read from `Campaign().get('_release')` (falling back to `release`).
- Hexes are drawn as closed six-point `pol` paths (`pathv2`) or `M`/`L` paths (`path`).
- `destroy:pathv2` is only registered in Jumpgate games, after `ready`.

## Build System

```bash
npm install
npm run build                  # bump patch version, then build
npm run build -- 2.1.0         # set an explicit version, then build
npm run build -- --no-bump     # rebuild without changing the version
npm test                       # unit and end-to-end tests (build first)
npm run format
```

`scripts/build.mjs` writes `Hexploration.js` and `<version>/Hexploration.js`. `rollup.config.js` replaces `__SCRIPT_NAME__`, `__BUILD_VERSION__` and `__BUILD_DATE__` in `constants.js` and wraps the bundle in `const HexplorationMod = (() => { … })();`. The public API is published on `globalThis.Hexploration` from `index.js`.

### Versioning

`scripts/bump-version.mjs` updates `script.json` and `package.json` and keeps the last five stable versions in `previousversions`. Prerelease versions are never added to the history.

## Tests

- `tests/grid.test.mjs` and `tests/polygon.test.mjs` import the pure modules directly.
- `tests/hexploration.test.mjs` loads the built bundle into `tests/roll20-stub.mjs`, a minimal Roll20 sandbox (objects, events, chat, timers), and drives real commands and token moves. It fails if the Mod logs an error.

The stub does not reproduce Roll20 rendering, layer behaviour or permissions; use `TESTING.md` in a real game for those.

## Internationalisation (i18n)

- `t(key, locale, vars)` returns a string with `{placeholder}` interpolation; `tRaw` returns arrays and objects (used for handout lists). Both fall back to en-US.
- Add new keys to `src/locales/locale/en-US.js` only, then run:

```bash
npm run sync-locales            # translate missing keys in every locale
npm run regenerate-locales      # re-translate everything (slow)
```

The sync script uses Google Translate with placeholder masking. Review generated text before release.

## Adding a New Command

1. Add a handler in `commands.js` and a `case` in `routeCommand`.
2. Add `help.<key>` (and any `messages.`, `errors.`, `hints.` keys) to `en-US.js`.
3. Add it to `showHelp`, the handout command table in `journals.js`, the README and `MOD_FILE_MAP.md`.
4. Add a button to the menu and Command Deck if it is a common action.
5. Add an end-to-end test.

## Coding Standards

- Modern JavaScript (ES2020+), strict mode via the Rollup IIFE wrapper.
- Prettier: single quotes, trailing commas (ES5), 100-character lines.
- JSDoc on every function.
- Functional style; no classes.
- One concern per module; no circular imports (`context.js` exists to keep `hexes.js` and `locations.js` independent).
- All user-facing errors whisper the problem and how to fix it. Stack traces go to the API console only.
- Everything a GM types is validated; everything shown in chat or handouts is HTML-escaped.
- Event handlers are wrapped so an exception is logged rather than stopping the sandbox. Batched work catches per item, because an exception in a timer callback would stop the sandbox.

## Roll20 API Notes

- `state.Hexploration` is the only persistent storage.
- API changes do not raise `change:` events, so moves made by other Mods are invisible. TokenMod's `ObserveTokenChange` is used when present; other Mods can call `Hexploration.revealAround`.
- `lastmove` holds the start point and waypoints of the latest drag. It is only trusted when it starts at the token's previous position.
- Creating an object on an unsupported layer may silently put it elsewhere, so the created object's layer is checked after `createObj`.
- Large fills are drawn `BATCH_SIZE` hexes per event-loop turn.
- Roll20 draws nameplates, bars and auras above the foreground layer, so `cover.js` switches a covered token's `showplayers_*` flags off and saves them in `coveredTokens`. Pages are refreshed after every fill, reveal, undo, rescan, calibration and hand-deleted hex; single tokens on move, layer change and `add:graphic`.
