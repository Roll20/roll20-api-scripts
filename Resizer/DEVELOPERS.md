# Resizer — Developer Guide

## Project Layout

| Path                      | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `src/`                    | ES module source. `src/index.js` is the Rollup entry point.       |
| `src/locales/locale/*.js` | Translations. `en-US.js` is the source; the others are generated. |
| `tests/`                  | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.   |
| `scripts/`                | Build, version bump and locale sync scripts.                      |
| `Resizer.js`              | Generated bundle for the One-Click library. Do not edit.          |
| `<version>/Resizer.js`    | Generated snapshot for each released version.                     |
| `0.0.9/`                  | Robin Kuiper's original release, kept for the One-Click list.     |
| `script.json`             | One-Click metadata and useroptions.                               |

## Building and Testing

```bash
npm install
npm run build -- --no-bump   # or npm run build -- 1.0.1 to set a version
npm test
```

`npm run build` with no arguments bumps the patch version first. The build writes `Resizer.js` and `<version>/Resizer.js`; keep them identical in every commit.

## Module Responsibilities

| Module          | Responsibility                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `index.js`      | Event registration, startup (`checkInstall`), public `Resizer` API.                                |
| `commands.js`   | `!resizer` parsing (`parseArgs`), 0.0.9 syntax (`translateLegacy`), routing and replies.           |
| `operations.js` | Zoom, resize, creature size, page size, fit, centre and calibrate, each recorded for undo.         |
| `geometry.js`   | Pure maths: cell size, every object kind's zoom, fit, centre, drawing boxes, calibration, factors. |
| `objects.js`    | Which objects a page holds, the selection (`path`/`pathv2`), undo snapshots.                       |
| `undo.js`       | The change recorder, the history in state, undo and Legacy-path re-linking.                        |
| `pages.js`      | Current page, `--pages` lists, the page picker.                                                    |
| `hooks.js`      | `Resizer.onZoom` listeners.                                                                        |
| `pageguard.js`  | Puts a page's new size and grid back if the GM's client saves the old ones over them.              |
| `menu.js`       | Main menu, history, page picker, settings and help cards; Roll20 query helpers.                    |
| `state.js`      | Persistent state (`state.RESIZER`), 0.0.9 migration, settings, command names, useroptions.         |
| `journals.js`   | Help and Command Deck handouts.                                                                    |
| `chat.js`       | Chat cards, buttons, whispers and errors.                                                          |
| `i18n.js`       | Translation lookup (`t`, `tRaw`, `_one` forms), locale normalisation and text direction.           |
| `constants.js`  | Build placeholders, command names, limits, creature sizes, defaults, command list and colours.     |
| `utils.js`      | HTML escaping, number parsing and rounding.                                                        |

`geometry.js` must stay free of Roll20 globals so it can be unit tested directly.

## How a Zoom Works

A zoom by factor f scales the page and everything on it about the page's top-left corner, so a point (x, y) moves to (x·f, y·f):

- **Page**: `width`, `height` (page units of 70 px), `snapping_increment` (cell size in page units) and `grid_offset_x/y` (pixels) are multiplied. `scale_number` is not, so each cell keeps its distance.
- **Graphics and text**: `left`, `top`, `width`, `height` (and `font_size`).
- **Jumpgate drawings (`pathv2`)**: `x`/`y` is the centre of the drawing's box and `points` are in the drawing's own frame, so `x`, `y` and every point are multiplied. Walls keep their `stroke_width`.
- **Legacy drawings (`path`)**: `_path` is read-only, and Jumpgate neither redraws a Legacy path whose `left`/`top`/`scaleX` a Mod changes nor keeps the scale after a reload (found live, 4 November 2026). Each one is drawn again with `createObj('path')`, the old scale and the zoom baked into its points, and the old one removed. Undo stores the old properties and its ID; when undo draws a path again, older history entries are re-linked to the new ID.
- **Doors and windows**: `x`, `y` (y measured upwards, so negative on the page) and the `path.handle0/handle1` offsets.

Light, vision and aura distances are in page units, so they need no change.

Pages are set through `setPageGuarded` (`pageguard.js`). Straight after a Mod changes a page, the GM's Jumpgate client can save the page back with some of its old settings: in a live check (6 November 2026) 2 of 4 zooms kept the new width but got the old `snapping_increment` back, so the page had twice the squares and every distance doubled. Such a client save does raise `change:page`, so for 10 seconds after Resizer sets a page, a change that undoes part of it while keeping Resizer's width and height is set right again. A change to the page size itself is taken as the GM's own and left alone. Undo goes through the same guard.

## Calibration

Given the map's box (left, top, width, height) and a drawn box over N × M of its squares:

1. The map's square size is box width ÷ N (and height ÷ M); the scale is the page's cell size ÷ that, per axis.
2. The map is scaled about its own top-left corner.
3. It is then moved so the box's top-left corner lands on the nearest grid line. Grid lines sit at `grid_offset_x + k·cell` across and `k·cell − grid_offset_y` down, because Jumpgate measures the vertical offset upwards (checked live by dragging a token on an offset page: it snapped to x ≡ 65, y ≡ 15 mod 70 with offsets 30 and 20).
4. With `--fit-page` the map is slid by whole cells to the page corner and the page is resized to a whole number of cells that holds it.

## Undo History

`startChange(label, vars)` returns a recorder. Operations change objects only through it (`set`, `setPage`, `redrawPath`), so the first value of every changed attribute is saved. `commit()` pushes the entry into `state.RESIZER.undo`, keeping the last `UNDO_DEPTH` (10) and under `MAX_UNDO_CHARS` in total; an entry that alone is bigger is not stored, and the GM is warned.

## State

```js
state.RESIZER = {
  schemaVersion: 2,
  version: '1.0.0',
  settings: { language, command, keepTokenSize, scaleStrokes, deleteCalibrationBox },
  undo: [/* entries, newest last */],
  picked: [/* page IDs ticked in the picker */],
  notices: { useroptions: {}, upgradedFrom: null },
};
```

0.0.9 stored `{ config: { command, firsttime } }` in the same branch; a branch without `schemaVersion` is upgraded, keeping `command`.

## Translations

Every user-facing string is in `src/locales/locale/en-US.js`. After adding or rewording strings:

```bash
npm run sync-locales                       # translate missing strings
node scripts/sync-locales.mjs --keys a.b   # re-translate reworded keys
node scripts/sync-locales.mjs --dry-run    # list what would change
```

Proofread the results: command words, setting keys and placeholders must stay as they are. A key ending in `_one` is used when `vars.count` is 1.

## Release Checklist

1. Update `CHANGELOG.md`, `README.md` and the Help handout strings together.
2. `npm run build -- <version>` and `npm test`.
3. Check `script.json` (`version`, `previousversions`, `modifies`).
4. Run the manual checks in `TESTING.md` in a Jumpgate game.
