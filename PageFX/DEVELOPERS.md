# PageFX — Developer Guide

## Project Layout

| Path                      | Purpose                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `src/`                    | ES module source. `src/index.js` is the Rollup entry point.       |
| `src/locales/locale/*.js` | Translations. `en-US.js` is the source; the others are generated. |
| `tests/`                  | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.   |
| `scripts/`                | Build, version bump and locale sync scripts.                      |
| `PageFX.js`               | Generated bundle for the One-Click library. Do not edit.          |
| `<version>/PageFX.js`     | Generated snapshot for each released version.                     |
| `1.0/` to `1.3/`          | Ada Lindberg's original releases. Never edit them.                |
| `PageFX.gif`              | Ada's version 1 demo, linked from the Help handout.               |
| `script.json`             | One-Click metadata and useroptions.                               |

## Building and Testing

```bash
npm install
npm run build -- --no-bump   # build without changing the version
npm test
npm run format
```

`npm run build` with no arguments bumps the patch version first (and adds the old version to `previousversions` in `script.json`); pass `--no-bump` while working, or an explicit version (`npm run build -- 2.0.1`) to release. The build writes both `PageFX.js` and `<version>/PageFX.js`.

Translations: edit `en-US.js`, then `npm run sync-locales -- --dry-run` to see what would change and `npm run sync-locales -- --keys a.b,c.d` to re-translate reworded keys. Proofread the results. Preset IDs and command words stay in English; preset names are translated.

## Module Responsibilities

| Module         | Responsibility                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `index.js`     | Startup, event registration, the live page watch, scheduler hooks (rate warnings, problems), the global `PageFX` object.     |
| `effects.js`   | Effect lifecycle: taking over version 1 tokens, `create`, release, edits from chat, areas, no-effect areas, token events.    |
| `scheduler.js` | One timer chain per layer of each running effect; which effects run; the per-page spawn budget; `fireOnce`.                  |
| `pages.js`     | Live pages: the ribbon page, every `playerspecificpages` page, and GM pages with GM Page Preview.                            |
| `geometry.js`  | Pure area maths: page metrics, token areas, even random points, clamping, beam ends, delays.                                 |
| `fx.js`        | Effect specs: parsing built-in, saved and JSON effects; completing definitions; PageFX's own and shared custom FX; spawning. |
| `presets.js`   | The preset library and packs, `registerPreset`, preset names.                                                                |
| `triggers.js`  | Round, turn, enter and leave triggers: reading the turn order, round counting, area membership, acting.                      |
| `commands.js`  | `!pagefx` parsing and routing, `--ids`, `--layer` and the menu back flags.                                                   |
| `menu.js`      | Chat cards: main menu, effect card, presets, settings, status; roll query helpers.                                           |
| `journals.js`  | Help and Command Deck handouts; the command list.                                                                            |
| `state.js`     | Persistent state, cleaning on start, version 1 migration of GM Notes and bars, settings, One-Click options.                  |
| `chat.js`      | Chat cards, buttons, whispers and errors.                                                                                    |
| `i18n.js`      | Translation lookup (`t`, `tRaw`), locale normalisation and text direction.                                                   |
| `constants.js` | Build placeholders, commands, built-in FX types and colours, custom FX defaults, limits, timings and colours.                |
| `utils.js`     | Small helpers: escaping, parsing, markers, GM Notes decoding.                                                                |

## State

`state.PageFX`:

```
{
  schemaVersion, version,
  settings: { language, gmPagePreview, intensity, maxSpawnsPerSecond },
  paused,                                   // Pause all
  effects: {
    <tokenId>: {
      id, name, enabled, paused, intensity, preset,
      source,                               // 'v1' while GM Notes and bars drive it, then 'chat'
      layers: [ { fx, interval: [shortest, longest], direction, error } ],
      triggers: [ { event, action, count, every, round, token, who, names, once, used } ],
    },
  },
  nullAreas: { <tokenId>: { source } },
  ownedFx: { '<effectId>#<layer>' | 'shared:<hash>': <custfxId> },
  released: { <tokenId>: true },            // effects taken off; not taken over again by name
  round,                                    // combat round, for round triggers
  notices: { useroptions, adoptedV1 },
}
```

`migrateState` and the `clean*` functions coerce every field on start, so a hand-edited or half-written state still loads. Running timers, the live page set and trigger area membership are kept in memory and rebuilt on start.

## Custom FX

Jumpgate draws `spawnFxWithDefinition` in white, whatever the colours. Saved custom FX spawned by ID keep their colours, and the API can create them. So:

- A JSON definition typed into the menu becomes a custom FX named `PageFX: <effect> <layer>`, keyed `<effectId>#<layer>` in `ownedFx`, and is removed when that layer changes or the effect goes.
- Preset layers share one custom FX per definition, keyed `shared:<hash>` (a djb2 hash of the definition), removed when the last effect using it goes.
- `completeDefinition` fills every missing particle value from `CUSTOM_FX_DEFAULTS` and writes both `Color` and `Colour` keys. An incomplete custom FX draws as black squares that never fade.
- The GM's own saved custom FX are used as they are, by name.

## Platform Notes (Jumpgate, sandbox v1.5, checked 4–6 November 2026)

- `spawnFx`, `spawnFxBetweenPoints` and `spawnFxWithDefinition` draw only on the page given as their last argument; without it they draw nothing for players on other pages (the reported version 1 bug). Players see FX only on the page they are on.
- Aura radius in pixels is `aura1_radius × 70 × snapping_increment / scale_number + size / 2`.
- `playerspecificpages` is `false` when no one is split, else an object of player ID to page ID. Changes made by other Mods, and to `turnorder` by other Mods, raise no events, so PageFX checks the live pages and the turn order every 3 seconds.
- Dragging a token raises `change:graphic` with the old `left` and `top`; area triggers use it. Moves made by other Mods raise nothing, hence `PageFX.checkToken`.
- Hex pages can report `width` and `height` as text; every page, bar and aura value goes through `toNumber`.
- Particle tuning, on a light map at 100% zoom: an emitter with `duration` under about 10 frames draws next to nothing; particles under about 5 px, or living under about 30 frames, are barely seen; particles blend brightly, so soft clouds want an alpha of 0.25 to 0.5. Angle 0 is right, 90 down, 270 up.
- **Legacy draws nothing for a negative particle angle** other than -1 (beams); Jumpgate takes -90 as up. Presets use 270, and `normaliseDefinition` turns other negative angles positive (checked 7 November 2026).
- Right-to-left handouts reorder the `!` of a command to its end unless the command is laid out left to right on its own: the handout `code` style is `direction:ltr` in an inline block.
- A GM client held 60 fps at 60 spawns a second across one page and dropped to 39 fps at 120, so the default cap is 30 a page, up to 60.
- Roll query buttons carry the selected tokens. Option text with `,`, `|` and `}` must be written as HTML entities, escaped once more inside the button (`queryOption`).
