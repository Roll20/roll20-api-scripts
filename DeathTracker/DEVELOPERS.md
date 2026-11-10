# DeathTracker — Developer Guide

## Project Layout

| Path                        | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `src/`                      | ES module source. `src/index.js` is the Rollup entry point.       |
| `src/locales/locale/*.js`   | Translations. `en-US.js` is the source; the others are generated. |
| `tests/`                    | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.   |
| `scripts/`                  | Build, version bump and locale sync scripts.                      |
| `DeathTracker.js`           | Generated bundle for the One-Click library. Do not edit.          |
| `<version>/DeathTracker.js` | Generated snapshot for each released version.                     |
| `0.1.4/` … `0.1.8/`         | Robin Kuiper's original releases. Never edit them.                |
| `script.json`               | One-Click metadata and useroptions.                               |

## Building and Testing

```bash
npm install
npm run build -- --no-bump   # build without changing the version
npm test
npm run format
```

`npm run build` with no arguments bumps the patch version first; pass `--no-bump` while working, or an explicit version (`npm run build -- 1.0.1`) to release. The build writes both `DeathTracker.js` and `<version>/DeathTracker.js`.

## Module Responsibilities

| Module           | Responsibility                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `index.js`       | Startup, event registration, TokenMod observer, the global `DeathTracker` object.                                          |
| `tracker.js`     | `judge`: reads HP, works out PC/NPC and death saves, applies markers, tint, effects, on-death actions, announcements.      |
| `status.js`      | Pure rules: `decideStatus`, `countSaves` (baseline counting), `isMassiveDamage`, `tintHue`.                                |
| `sheet.js`       | Character reads and writes: the 2024 `store` attribute, checkbox fields, PC/NPC from the sheet, controllers.               |
| `deathsaves.js`  | Attribute-change handler, the 3-second poll of downed PCs, the DeathSaves macro and `dsync`.                               |
| `hp.js`          | Hit points from the chosen bar, linked maximum fallback.                                                                   |
| `markers.js`     | Marker list (libTokenMarkers or the campaign), name/tag lookup, editing `statusmarkers` without touching others' markers.  |
| `actions.js`     | On-death layer move and turn-order removal, and undoing them.                                                              |
| `fx.js`          | Tint by hit points and hurt/heal effects.                                                                                  |
| `integration.js` | HealthColors detection, the 0.1 `ObserveTokenChange` observer list.                                                        |
| `owners.js`      | Who handles death saves, colours and effects (`state.ModOwners`, shared with HealthColors 2.5+), and telling HealthColors. |
| `commands.js`    | `!deathtracker` parsing and routing, settings changes, 0.1 `config`.                                                       |
| `menu.js`        | Chat cards: menu, status, settings, markers, help; the command list.                                                       |
| `journals.js`    | Help and Command Deck handouts and their icon.                                                                             |
| `state.js`       | Persistent state, setting validation, 0.1 migration, One-Click options, token records, PC/NPC choices.                     |
| `chat.js`        | Chat cards, buttons, whispers and errors.                                                                                  |
| `i18n.js`        | Translation lookup (`t`, `tRaw`), locale normalisation and text direction.                                                 |
| `constants.js`   | Build placeholders, command names, defaults, choices, markers, effects and colours.                                        |
| `utils.js`       | Small helpers: escaping, number parsing, lists, colours.                                                                   |

## State

`state.DeathTracker`:

```js
{
  schemaVersion: 1,
  version: '1.0.0',
  settings: { /* DEFAULT_SETTINGS keys */ },
  tokens: {
    [tokenId]: { status, hp, base: {s, f}, saves: {s, f}, markers: [tags DT added], tint, actions: {layer, turn} },
  },
  roles: { [characterId or tokenId]: 'pc' | 'npc' },
  notices: { useroptions: {}, healthColors: false, migrated: false },
  legacyCommand: 'dead', // only when 0.1 had a custom command
}
```

## Platform Notes (Jumpgate, sandbox v1.5, 4 November 2026)

- Bar bubble edits and the 2024 sheet's Damage/Heal boxes fire `change:graphic` for the linked token on the page the GM has loaded only; linked tokens on other pages keep their old value in the API.
- The 2024 sheet keeps its data in a legacy attribute named `store` (an object). `store.hitpoints.deathSaves` is `{successes, failures, open}`; ticking a box or rolling fires `change:attribute` for `store`. Writing a modified copy back with `set('current', copy)` clears the sheet's boxes.
- The sheet never clears death saves on healing, and a natural 1 adds two failures (counts can exceed 3).
- `setSheetItem(id, 'hp', n)` never resolves and logs a sheet worker error. Do not use it.
- NPC sheets have `store.settings.layoutState === 'Stat Block'` and an `appState` attribute of `npc`; PCs have `Compact` and `sheet`. `getSheetItem(id, 'npc')` was 0 for a Lich, so it is not used.
- API changes to bars, markers and the turn order raise no events.

## Locales

Edit `src/locales/locale/en-US.js`, then run `npm run sync-locales` (only new and changed strings are sent to the translator). Use `--keys a.b,c.d` to re-translate particular strings and `--dry-run` to see what would change. After a sync, compare each locale with en-US for strings left in English, and remove any zero-width spaces.

## Releasing

1. `npm run build -- <version>`; check `<version>/DeathTracker.js` matches `DeathTracker.js`.
2. Update `CHANGELOG.md`, `README.md` and the Help handout strings.
3. `script.json`: `version`, `previousversions`, `useroptions` (every setting), `modifies`.
4. `npm test`, then the live checks in `TESTING.md`.
