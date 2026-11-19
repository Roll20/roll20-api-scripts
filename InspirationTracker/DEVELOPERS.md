# InspirationTracker — Developer Guide

## Project Layout

```
InspirationTracker/
├── InspirationTracker.js   Built bundle (generated; do not edit)
├── 1.0.0/                  Snapshot of the bundle for One-Click (generated)
├── 0.1.2/, 0.1.4/          Robin Kuiper's releases; never edit
├── src/                    Source modules (ES modules, bundled by Rollup)
├── src/locales/            Translations: locale/<code>.js and metadata.js
├── scripts/                build, bump-version and sync-locales
├── tests/                  node:test tests and the Roll20 stub
└── script.json             One-Click metadata (version written by bump-version)
```

The build writes the same bundle to `InspirationTracker.js` and `<version>/InspirationTracker.js`; keep them byte-identical in every commit.

## Module Responsibilities

| Module         | Job                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `index.js`     | Event handlers, startup, the public API, the TokenMod observer.                                        |
| `commands.js`  | Parses `!inspiration …` and sends it to the GM or player handlers.                                     |
| `actions.js`   | give, remove, spend, undo, pass on; token markers, effects and announcements; sheet and marker events. |
| `sheet.js`     | Reads and writes inspiration on both sheets; works out the rules edition.                              |
| `markers.js`   | Lists and resolves token markers from the campaign's marker sets.                                      |
| `party.js`     | Who controls a character, who is in the party, selection and `--ids` resolution.                       |
| `menu.js`      | Chat menus: GM menu, settings, party overview, player card, status, help.                              |
| `journals.js`  | The Help and Command Deck handouts.                                                                    |
| `state.js`     | Persistent state, settings validation, 0.1.x migration, undo entries, pass-on offers.                  |
| `chat.js`      | Chat cards, whispers, and the card parts: section labels, item titles, notes, rows and button grids.   |
| `i18n.js`      | Translation lookup with en-US fallback.                                                                |
| `constants.js` | Names, defaults, option lists, colours; build placeholders.                                            |

## How the Sheets Work

- **2014 OGL sheet**: a checkbox attribute `inspiration`, `"on"` when ticked and `"0"` when cleared. The sheet only creates it the first time the box is ticked, so `writeInspiration` creates it when missing. `change:attribute` and `add:attribute` report changes made in the sheet.
- **D&D 2024 sheet (Beacon)**: `getSheetItem(id, 'inspiration')` returns 0 or 1 (it is on/off, not a count). `setSheetItem` accepts 1, 0, true and false; the string `'on'` becomes 0. The value lives in the character's `store` attribute at `store.inspiration.isInspired`, and the rules edition at `store.settings.newRules` (true = 2024).
- **Points pools** (`state.InspirationTracker.pools`, the default pool first) are kept as plain numbers. `locatePool` in `sheet.js` looks for an attribute whose name contains `resource` and ends in `_name` and whose value is the pool's name (the 2014 OGL sheet's `class_resource_name`, `other_resource_name` and `repeating_resource_<id>_resource_left_name` / `_right_name`); the points are in the attribute of the same name without `_name`. Otherwise, and always on the 2024 sheet, the points are in a plain attribute, `<pool id>_pool`. A sheet box is written as text, as the sheet itself writes it (checked live on the D&D 5E (Classic) sheet, 2026-11-18); the plain attribute holds a number. The 2024 sheet's own resources live in `store.resources` and are not written: changing `store` from a Mod does not update an open sheet safely. Plain attributes can be created on 2024 characters with `createObj` (checked live).
- The `tracking` setting decides what commands that name no pool work on: `flag` is the sheet's inspiration box, `pool` the default pool. `--pool` always addresses a pool. The Marker setting belongs to the sheet's inspiration box, and every pool has a `marker` of its own (empty for None, which is how a pool starts); `trackedMarker()` gives the one in use. While a pool is tracked, its marker shows "has points", sheet-box changes are only recorded, and a marker changed by hand is put back. Two pools cannot share a marker, and a pool other than the default one cannot use the Marker setting's.
- Every 2024 sheet change, including one made by `setSheetItem`, raises `change:attribute` for `store`, **but the "previous" value it passes already holds the new value**. So the Mod keeps the last value it saw for each character in `state.InspirationTracker.known` and compares with that. Writes record the new value first (`store()` in `actions.js`), so the event that follows the Mod's own write is ignored. The first value seen for a character is only recorded, never announced.

These were checked live in Jumpgate on 2026-11-04.

## State Structure

```js
state.InspirationTracker = {
  schemaVersion: 1,
  version: '1.0.0',
  config: { language, marker, wording, announce, fx, fxType, playerSpend, playerOverview, passOn },
  legacyCommand: '', // 0.1.x command name, answered as well as !inspiration
  known: { [charId]: true }, // last value seen per character
  party: { include: [], exclude: [] },
  undo: [{ id, charId, playerId, at }], // last 30 spends
  offers: { [id]: { charId, at } }, // pass-on choices, 1 hour
  notices: { useroptions: {}, macroHint: true },
};
```

### 0.1.x migration

When `state.InspirationTracker` does not exist and `state.INSPIRATIONTRACKER` does, `statusmarker`, `fx` and `fx_type` are copied, and a `command` other than `inspiration` becomes `legacyCommand`. The old state is left in place so 0.1.4 still works after a downgrade.

## Build System

```bash
npm install
npm run build -- --no-bump   # build without changing the version
npm run build                # bump the patch version, then build
npm run build -- 1.1.0       # set the version, then build
npm test
npm run format
```

## Tests

`tests/roll20-stub.mjs` loads the built bundle into a `vm` context with fake `findObjs`, `createObj`, `sendChat`, `getSheetItem`, `setSheetItem` and `spawnFx`. `api.beacon()` and `api.legacy()` make characters on either sheet; `tickSheet` and `editMarkers` act like a person changing the sheet or a token. `settle()` lets the Mod's async handlers finish. Build before testing: the tests read `InspirationTracker.js`.

## Internationalisation (i18n)

All text is in `src/locales/locale/en-US.js`. Other locales fall back to English for missing keys.

```bash
npm run sync-locales                     # translate strings missing from any locale
npm run sync-locales -- --keys a.b,c.d   # translate reworded keys again
npm run sync-locales -- --dry-run        # list what would change
```

Always proofread the results, and compare each locale with en-US for strings left in English. Keep "GM", "Mod", `!inspiration` and setting names as they are.

## Adding a New Command

1. Add the handler in `commands.js` (`handleGm`, and `handlePlayer` if players may use it).
2. Add it to `HELP_COMMANDS` in `constants.js` and a `help.<key>` string in en-US.
3. Add a button to the menu and the Command Deck if it is common.
4. Add a test, update README.md and the Help handout strings, then run sync-locales.

## Coding Standards

- Prettier (`.prettierrc.json`), JSDoc on every function, British English in text.
- Never put a literal `[[…]]` in chat text: Roll20 tries to roll it.
- Character names and other user text are escaped with `escapeHtml` before going into chat.

## Roll20 API Notes

- Changes made by a Mod raise no change events, so this Mod's own marker changes are not mistaken for a person's, and TokenMod's changes are seen only through `TokenMod.ObserveTokenChange`.
- Chat from other Mods has `playerid` `"API"`, treated as the GM.
- `Campaign().get('_token_markers')` lists `{tag, name, url}`; custom markers have tags like `Name::12345`. Roll20's coloured dots are not listed, so they are added by hand.
