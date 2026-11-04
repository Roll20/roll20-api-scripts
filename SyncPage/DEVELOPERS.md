# SyncPage — Developer Guide

## Project Layout

| Path                      | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `src/`                    | ES module source. `src/index.js` is the Rollup entry point.       |
| `src/locales/locale/*.js` | Translations. `en-US.js` is the source; the others are generated. |
| `tests/`                  | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.   |
| `scripts/`                | Build, version bump and locale sync scripts.                      |
| `SyncPage.js`             | Generated bundle for the One-Click library. Do not edit.          |
| `<version>/SyncPage.js`   | Generated snapshot for each released version.                     |
| `0.1.9/`                  | Robin Kuiper's original release. Never edit it.                   |
| `script.json`             | One-Click metadata and useroptions.                               |

## Building and Testing

```bash
npm install
npm run build -- --no-bump   # build without changing the version
npm test
npm run format
```

`npm run build` with no arguments bumps the patch version first; pass `--no-bump` while working, or an explicit version (`npm run build -- 1.0.1`) to release. The build writes both `SyncPage.js` and `<version>/SyncPage.js`.

Translations: edit `en-US.js`, then `npm run sync-locales -- --dry-run` to see what would change and `npm run sync-locales -- --keys a.b,c.d` to re-translate reworded keys. Proofread the results.

## Module Responsibilities

| Module          | Responsibility                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `index.js`      | Startup, event registration, TokenMod observer, repair on start, the global `SyncPage` object.              |
| `sync.js`       | `add`/`change`/`destroy` handlers, the add debounce, delete modes, page settings, `notify`, `onSync`, jobs. |
| `pair.js`       | Joining a page: adopting the source's objects, pairing by fingerprint and by character, leftovers.          |
| `repair.js`     | `repairGroup`: drift, missing copies, source deletes, objects made while not watching, page settings.       |
| `visibility.js` | Per-copy hide and show (GM layer or remove), hidden snapshots, turn order for recreated copies.             |
| `copy.js`       | Reading properties, image clean-up, creating and updating copies, fingerprints, drift.                      |
| `echo.js`       | The echo guard: values SyncPage wrote, so the client's re-save of doors and pages is ignored.               |
| `groups.js`     | Groups, pages, links and the reverse index (object ID → group and link), pruning.                           |
| `players.js`    | Split party (`playerspecificpages`), moving players, saving and restoring the layout.                       |
| `recycle.js`    | Recycle bin entries and restoring them.                                                                     |
| `requests.js`   | Pending button requests: short IDs in buttons, data in state, single use, expiry.                           |
| `migrate.js`    | Carrying over a 0.1 set-up: `_synced` pages, old links, GM Notes flags, custom command.                     |
| `commands.js`   | `!syncpage` parsing and routing.                                                                            |
| `menu.js`       | Chat cards: menu, group, players, settings, status, recycle bin, repair report, help; the command list.     |
| `journals.js`   | Help and Command Deck handouts.                                                                             |
| `state.js`      | Persistent state, the settings table's checking and group overrides, One-Click options, the coerce pass.    |
| `chat.js`       | Chat cards, buttons, whispers and errors.                                                                   |
| `i18n.js`       | Translation lookup (`t`, `tRaw`), locale normalisation and text direction.                                  |
| `constants.js`  | Build placeholders, commands, object types, property sets, the `SETTINGS` table, timings and colours.       |
| `utils.js`      | Small helpers: escaping, parsing, IDs, value comparison.                                                    |

## State

`state.SyncPage`:

```
{
  schemaVersion, version,
  settings: { <setting>: value },                     // from the SETTINGS table
  groups: {
    <groupId>: {
      id, name, source, pages: [source, …],
      overrides: { <group setting>: value },
      links: { <linkId>: { type, objects: { <pageId>: <objId> }, print } },
      hidden: { <linkId>: { <pageId>: { layer, snapshot?: { props, turns } } } },
      layout: { <playerId>: <pageId> },
      recycle: [ { id, at, reason, items: [ { linkId, pageId, type, props, hidden } ] } ],
      repairLog: { at, drifted, recreated, removed, dropped, mirrored, leftovers, pageSettings },
      pageOnly: [ <objId> ],
      paused,
    },
  },
  gm: { <playerId>: { lastGroup, lastPages } },
  requests: { <requestId>: { kind, gm, at, payload } },
  aliases: [ '!custom' ],
  notices: { useroptions, migrated, trueCopy },
}
```

The reverse index (object ID → group and link) is kept in memory and rebuilt on start, so state stays small. `cleanState` coerces every field on start, so a hand-edited or half-written state still loads.

## Platform Notes (Jumpgate, sandbox v1.5, checked 4 November 2026)

- `createObj` and `set()` raise no events for the Mod that made them. But the client saves doors and pages again about a second after an API change, which arrives as `change:door` / `change:page`. `echo.js` drops events whose values match what SyncPage wrote.
- A Legacy path's shape reads back as the read-only `_path` but must be written as `path`.
- Roll20's Duplicate Page fires `add:*` for every object on the new page, gives drawings to the GM (`controlledby`) and recolours doors and windows. Fingerprints and drift checks ignore those keys.
- Jumpgate lights are graphics (`/images/editor/torch.svg`).
- `playerspecificpages` is `false` when no one is split, else an object. Clear it to `false` before writing a new object, or Roll20 does not notice.
- `createObj('graphic')` only takes library images (as `thumb`); marketplace images return nothing.
