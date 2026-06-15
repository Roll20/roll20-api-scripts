# Combat Encounter Director — Developer Guide

## Project Layout

```
CombatEncounterDirector/
├── src/
│   ├── index.js            Entry point: event registration and startup
│   ├── constants.js        All constants (colors, preset data, config keys)
│   ├── state.js            Persistent Roll20 state management
│   ├── utils.js            Pure utility functions
│   ├── chat.js             Chat/whisper UI components
│   ├── tokens.js           Token read/write helpers and record management
│   ├── scaling.js          Party-size scaling logic and validation
│   ├── bosses.js           Boss/minion preset application
│   ├── reinforcements.js   Token duplication and enumeration
│   ├── battlefield.js      Layer management, visibility, position saving
│   ├── reset.js            Token state recovery
│   ├── encounters.js       Encounter template save/load
│   ├── reporting.js        Status journal generation
│   ├── journals.js         Control panel journal HTML generation
│   ├── commands.js         Command routing and sub-handlers
│   ├── i18n.js             Translation lookup (t, normalizeLocale, isRtlLocale)
│   └── locales/
│       ├── metadata.js     24 locale definitions, VALID_LOCALES, LOCALE_ALIASES
│       ├── index.js        TRANSLATIONS map + re-exports
│       └── locale/
│           ├── en-US.js    Master translation file (edit this one first)
│           └── …           23 other locale files (translated via sync-locales)
├── scripts/
│   ├── build.mjs           Rollup build runner
│   ├── bump-version.mjs    Version bumper (called by prebuild)
│   └── sync-locales.mjs    Google Translate locale sync tool
├── CombatEncounterDirector.js  Generated bundle (do not edit)
├── rollup.config.js        Rollup configuration
├── package.json
├── script.json             Roll20 One-Click metadata
├── README.md
├── DEVELOPERS.md
├── TESTING.md
├── CHANGELOG.md
└── MOD_FILE_MAP.md
```

## Module Responsibilities

| Module                    | Responsibility                                                    |
| ------------------------- | ----------------------------------------------------------------- |
| `index.js`                | Roll20 event handlers, startup                                    |
| `constants.js`            | Single source of truth for all config keys, colors, preset data   |
| `state.js`                | All reads/writes to `state.CombatEncounterDirector`               |
| `utils.js`                | Pure functions with no side effects or Roll20 state               |
| `chat.js`                 | HTML builders for whispers and cards                              |
| `tokens.js`               | Token attribute reading/writing; `ensureTokenRecord`              |
| `scaling.js`              | Scaling math and validation                                       |
| `bosses.js`               | Boss preset application                                           |
| `reinforcements.js`       | Token duplication and enumeration                                 |
| `battlefield.js`          | Layer moves, hide/reveal, position save/restore                   |
| `reset.js`                | Restore original token values                                     |
| `encounters.js`           | Encounter template CRUD                                           |
| `reporting.js`            | Build and write the status journal HTML                           |
| `journals.js`             | Build and write the control panel journal HTML                    |
| `commands.js`             | Route `!ced` subcommands; whisper feedback                        |
| `i18n.js`                 | `t()`, `normalizeLocale()`, `isRtlLocale()` — translation lookup  |
| `locales/metadata.js`     | Locale definitions, `VALID_LOCALES`, `LOCALE_ALIASES`             |
| `locales/index.js`        | Assembles `TRANSLATIONS` map from all locale files                |
| `locales/locale/en-US.js` | Master translation file — the single source of truth for all keys |

## State Structure

```javascript
state.CombatEncounterDirector = {
  version: '1.0.0',
  config: {
    hpBar: 'bar1',
    acBar: 'bar2',
    language: 'en-US',
  },
  tokens: {
    '<tokenId>': {
      tokenId: '<tokenId>',
      pageId: '<pageId>',
      original: {
        name: 'Goblin',
        hp: 10,
        maxHp: 10,
        ac: 13,
        layer: 'objects',
        left: 140,
        top: 210,
        width: 70,
        height: 70,
      },
      hpModifier: 150, // percentage of original max HP
      acModifier: 1, // flat AC modifier
      damageModifier: 125, // percentage (metadata only, not written to token)
      preset: 'elite', // boss preset key or null
      savedPosition: { left, top, layer }, // optional
      lastModified: 1700000000000,
      lastOperation: 'boss:elite',
    },
  },
  encounters: {
    'goblin-ambush': {
      name: 'goblin-ambush',
      pageId: '<pageId>',
      savedAt: 1700000000000,
      tokens: [
        /* snapshots */
      ],
    },
  },
};
```

## Build System

This project uses [Rollup](https://rollupjs.org) to bundle ES modules into a single Roll20-compatible script.

```bash
npm install                      # Install dependencies
npm run build                    # Auto-bump patch version, then build
npm run build -- 1.1.0           # Set explicit version, then build
npm run build -- 1.1.0-alpha.1   # Enter prerelease cycle, then build
npm run watch                    # Watch mode — rebuilds on change, no version bump
npm run set-version -- 1.1.0     # Set version only, no build
npm run format                   # Format source with Prettier
```

The build (`scripts/build.mjs`):

1. Calls `scripts/bump-version.mjs` (optionally with an explicit version) to update `script.json` and `package.json`.
2. Rolls up all `src/` modules into a single IIFE-wrapped `CombatEncounterDirector.js`.
3. Injects build metadata (name, version, timestamp) into `constants.js` during transform.
4. Formats output with Prettier.
5. Writes both a root-level copy and a versioned copy under `<version>/CombatEncounterDirector.js`.

Version bumping is done **inside** `build.mjs` rather than via a `prebuild` npm hook.
This is important: a `prebuild` hook would receive no arguments from `npm run build -- 1.1.0`,
causing it to always auto-bump regardless of what version you passed.

### Versioning

`scripts/bump-version.mjs` understands semver prerelease suffixes:

| Current version | Auto-bump result | Notes                               |
| --------------- | ---------------- | ----------------------------------- |
| `1.0.0`         | `1.0.1`          | Standard patch bump                 |
| `1.0.0-alpha.3` | `1.0.0-alpha.4`  | Increments prerelease counter       |
| `1.0.0-alpha`   | `1.0.0-alpha.1`  | Adds counter to bare prerelease tag |

**Releasing from a prerelease cycle:**

```bash
npm run build -- 1.0.0   # Sets version to exactly 1.0.0 and builds
```

## Internationalisation (i18n)

All user-facing strings are translated via `t(key, locale, vars?)` in `src/i18n.js`.

### How it works

1. `src/locales/locale/en-US.js` is the **master** translation file. Every key lives here.
2. `src/locales/metadata.js` declares the 24 supported locales and their aliases.
3. `src/locales/index.js` imports all locale files and assembles the `TRANSLATIONS` map.
4. `t('section.key', lang, { var: value })` looks up `TRANSLATIONS[lang].section.key`, interpolates `{var}` placeholders, and falls back to `en-US` when a key is missing.
5. The active locale is stored in `state.CombatEncounterDirector.config.language` and can be changed at runtime with `!ced config language <code>`.

### Key structure in `en-US.js`

| Top-level key | Contains                                                       |
| ------------- | -------------------------------------------------------------- |
| `titles`      | Card/whisper titles                                            |
| `errors`      | Error messages + `…Hint` counterparts                          |
| `confirm`     | Confirmation messages                                          |
| `labels`      | Row label strings                                              |
| `ui`          | Button labels and section headers in the control panel journal |
| `report`      | Status report column headers and summary labels                |

### Adding a new translation key

1. Add the key and English value to **`src/locales/locale/en-US.js`**.
2. Add the same key (with the English value as placeholder) to any other locale files you want to keep in sync, **or** run `npm run sync-locales` to auto-translate (requires `GOOGLE_API_KEY` in `.env`).
3. Call `t('section.newKey', lang)` in your source file.

### Translating / syncing locales

```bash
# Translate all locales that have keys matching en-US
npm run sync-locales

# Re-translate ALL keys in all locales (overwrites existing translations)
npm run regenerate-locales

# Translate a single locale
npm run sync-locales -- --locale fr
```

The sync script uses Google Translate. Provide a service-account key in `GOOGLE_API_KEY` (env var or `.env` file at the project root).

### Updating the project layout table

```
src/
├── i18n.js             Translation lookup (t, normalizeLocale, isRtlLocale)
└── locales/
    ├── metadata.js     24 locale definitions, VALID_LOCALES, LOCALE_ALIASES
    ├── index.js        TRANSLATIONS map + re-exports
    └── locale/
        ├── en-US.js    Master translation file (edit this one first)
        ├── fr.js
        └── … (23 other locale files)
```

### Locale codes and aliases

| Alias | Canonical |
| ----- | --------- |
| `en`  | `en-US`   |
| `zh`  | `zh-TW`   |
| `pt`  | `pt-PT`   |

All canonical codes are available as `SUPPORTED_LOCALE_LIST` (comma-separated string shown in error hints) and `VALID_LOCALES` (a `Set`).

---

## Adding a New Command

1. Add any constants to `constants.js`.
2. If the command modifies tokens, add the core logic to the appropriate module (`scaling.js`, `bosses.js`, etc.).
3. Add a new `case` in `routeCommand` in `commands.js`.
4. Write a handler function (`handleMyCommand`) that validates inputs, calls the logic module, and whispers feedback.
5. Add the command button to `journals.js` in the relevant section of `buildControlPanelHtml`.
6. Document it in `README.md` and `TESTING.md`.

## Coding Standards

- Modern JavaScript (ES2020+), strict mode via Rollup IIFE wrapper.
- Prettier: single quotes, trailing commas, 2-space indent.
- JSDoc on every exported function.
- No class instances — functional style throughout.
- One concern per module; no circular dependencies.
- All user-facing errors whisper the problem and how to fix it.
- Never log stack traces to chat.

## Error Handling

All command handlers are wrapped in a try-catch in `handleInput`. Validation functions return `{ valid, message }` objects — check `valid` before proceeding and use `whisperError` to report problems.

## Roll20 API Notes

- `state[STATE_KEY]` is the only persistent storage. All other state is session-local.
- `token.set(...)` changes are immediate but not undoable by the GM.
- `createObj('graphic', {...})` requires `_pageid` and `subtype: 'token'`.
- `playerIsGM(msg.playerid)` guards all commands — non-GMs are silently ignored.

## Release Notes For Maintainers

### 1.0.1 Technical Notes

- Command migration:
  - Primary command constant changed to `!ced`.
  - Legacy alias `!director` is still accepted for backwards compatibility.
  - Conflict detection uses `DIRECTOR_CONFLICT_STATE_KEY = 'DIRECTOR_STATE'`; when present, legacy alias usage triggers a GM warning instead of routing under the legacy name.

- i18n updates:
  - Locale hint strings and command examples were updated from `!director` to `!ced` across locale files used in the generated bundle.

- Journal rendering:
  - Command Deck and Status handout HTML now uses an explicit wrapper/background container to prevent white default journal rendering and preserve intended theme styling.

- One-Click metadata and options:
  - `script.json` select-style options were normalized to remove pipe-delimited labels.
  - `language` useroption was changed to a select option containing all supported locale codes.

- Build/versioning pipeline:
  - Build flow now bumps/sets version before loading version-dependent config, preventing stale version output paths.
  - Explicit version builds now write snapshots to the matching `<version>/CombatEncounterDirector.js` directory.
  - Prerelease versions are excluded from `previousversions` history handling.

- Code quality hardening:
  - Source files feeding the generated bundle were refactored to address SonarQube warnings and improve maintainability.
  - JSDoc coverage and placement were reviewed and corrected in source modules.
