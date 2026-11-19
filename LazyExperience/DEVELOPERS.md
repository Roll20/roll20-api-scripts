# LazyExperience — Developer Guide

## Project layout

| Path                          | Purpose                                                           |
| ----------------------------- | ----------------------------------------------------------------- |
| `src/`                        | ES module source. `src/index.js` is the Rollup entry point.       |
| `src/locales/locale/*.js`     | Translations. `en-US.js` is the source; the others are generated. |
| `tests/`                      | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.   |
| `scripts/`                    | Build, version bump and locale sync scripts.                      |
| `LazyExperience.js`           | Generated bundle for the One-Click library. Do not edit.          |
| `<version>/LazyExperience.js` | Generated snapshot for each release (byte-identical to the root). |
| `0.1.11/` … `0.1.14/`         | Robin Kuiper's releases, kept for the One-Click version history.  |
| `script.json`                 | One-Click metadata and useroptions.                               |

## Build and test

```bash
npm install
npm run build -- --no-bump   # or npm run build -- 1.0.1 to set a version
npm test
npm run format
npm run sync-locales          # translate new or changed en-US strings
```

## Modules

| Module        | Responsibility                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `index.js`    | Event registration, startup, TokenMod and DeathTracker observers, public `LazyExperience` API. |
| `commands.js` | Command words and aliases, parsing (`--ids`, `--xp`, quoted text), routing, setting checks.    |
| `menu.js`     | Main, Party, settings, status and language cards.                                              |
| `session.js`  | Pool, bonuses, awards, `pay`, undo, end of session, announcements.                             |
| `roster.js`   | Roll20 party / players / manual roster, shares and the split.                                  |
| `kills.js`    | Defeat detection (bar, linked attribute, marker, DeathTracker), prompts and dedupe.            |
| `levels.js`   | Level-up notices.                                                                              |
| `sheets.js`   | Reading and writing XP: Beacon (`getSheetItem`/`setSheetItem`) and legacy attributes.          |
| `systems.js`  | Game-system profiles, detection, XP tables and CR → XP.                                        |
| `state.js`    | Persistent state, 0.1 migration, One-Click options.                                            |
| `journals.js` | Help, Command Deck and Session Log handouts.                                                   |
| `chat.js`     | Chat cards, buttons, whispers and announcements.                                               |
| `i18n.js`     | Translation lookup, locale normalisation and text direction.                                   |
| `utils.js`    | Escaping, number and challenge parsing, sandbox detection.                                     |

## State (`state.LazyExperience`)

```js
{
  schemaVersion: 1,
  version: '1.0.0',
  config: { ...DEFAULT_CONFIG },
  characters: { [characterId]: { member, excluded, absent, share, level, notified } },
  session: { number, started, pool, carried, bonuses, kills, awards, paid, levelUps },
  history: [/* ended sessions, newest first, at most 50 */],
  aliases: ['!exp'],           // custom 0.1 command names
  globalconfigCache: { lastsaved },
  warned: { sandbox },
}
```

`state.LAZYEXPERIENCE` (0.1) is read once by `migrateLegacy` and left in place so a rollback to 0.1.14 still works.

## Adding a game system

Add a profile to `PROFILES` in `src/systems.js`:

- `sheets`: exact sheet names, which are the option values of `select[name=charsheettype]` on the game's Game Settings page (`/campaigns/campaignsettings/<id>`), for example `ogl5e` or `pathfinderneceros`. Characters report the same value as `_charactersheetname`, but characters made with `createObj` report a blank one, so `Campaign().sheetName` is the fallback. `roll20Name` is the sheet's name in that list, shown in the Help handout. `fingerprint` lists attributes only that sheet has, used for copies of a sheet. `match` (a regular expression) is supported but not used: loose patterns caught the wrong sheets.
- `access`: `beacon` or `legacy`. Beacon profiles must only list fields the sheet defines: `getSheetItem` logs an error that can't be caught for an unknown name.
- `pc.xp`, `pc.level`, `pc.next` (next-level XP field), `npc.xp`, `npc.cr`, `npc.level`: field names, tried in order.
- `levels` (XP for each level, with `firstLevel` when it isn't 1), or `nextXp(level)`.
- `crXp(cr)` or `creatureXp(level, partyLevel)`.
- Write variations: `write: { kind: 'repeatingRow', … }` (ledger sheets), `alsoAdd` (running totals), `xpless` (systems without XP).
- `levelUpHint`: which note goes under a level-up notice.
- `verified`: `live`, `partial`, `source` or `none`, shown in the Help handout. TESTING.md describes how a sheet is tested in a test game.

Add a test in `tests/systems.test.mjs`.

## Platform notes

- The D&D 2024 sheet has only a handful of legacy attributes (`store`, `builder`, `appState`, …). XP is `experience` (writable), level `level` (read-only), creature XP `npc_xp` (a number, text such as "33000 or 41000 in lair", or "---"), CR `npc_challenge`.
- `setSheetItem(id, 'experience', 0)` is ignored by the 2024 sheet; `setComputed` does nothing.
- `character.get('inParty')` is Roll20's Party Member box (Jumpgate). The API can set it, and ticking it fires `change:character`.
- API changes raise no events, so changes made by other Mods are seen through TokenMod's `ObserveTokenChange` and DeathTracker's `onStatusChange`.
- Values from sheets and names are passed through `escapeForChat` before they go to chat.
- Legacy attributes are written as text with `setWithWorker`: the D&D 5E (Classic) sheet's `sanitizeXP` worker calls `.trim()` and fails on numbers.
- A sheet input named `attr_xp_max` is saved as the **max of the `xp` attribute**, not as an attribute called `xp_max`. `readField` falls back to the base attribute's max for names ending in `_max`. Before 1.1.0 this was missed, so the Pathfinder 1E and Starfinder next-level boxes were never read and the level tables were always used.
- Neither Pathfinder 1E sheet works out its next-level box (the official sheet starts it at 2000; the Community sheet leaves it blank). With a track or plan in `pf1Track`, `withTrack` swaps the profile's level table for one built from the plan, stops reading the box and makes `addXp` write it (`writeNextBox`) after each award. `pf1Track sheet` keeps reading the box.
