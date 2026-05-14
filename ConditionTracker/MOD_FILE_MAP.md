# Condition Tracker Mod File Map

This file provides a developer-focused inventory of files in the `ConditionTracker` mod folder.

Scope notes:

| Item                        | Notes                      |
| --------------------------- | -------------------------- |
| Versioned build directories | Summarized as `<version>`. |
| `node_modules`              | Intentionally excluded.    |

## Top-Level Files

### Documentation

| File              | Purpose                                                                         |
| ----------------- | ------------------------------------------------------------------------------- |
| `CHANGELOG.md`    | Release notes and version history.                                              |
| `DEVELOPERS.md`   | Contributor workflow, build process, and release update guidance.               |
| `README.md`       | User-facing documentation, command usage, configuration, and behavior overview. |
| `TESTING.md`      | Manual test checklist for validating behavior in Roll20.                        |
| `MOD_FILE_MAP.md` | This developer file inventory and purpose map.                                  |

### Metadata and Config

| File                | Purpose                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| `script.json`       | Roll20 One-Click metadata: script version, options, permissions, and dependencies. |
| `package.json`      | NPM metadata and scripts (`build`, `watch`, `format`).                             |
| `package-lock.json` | Locked dependency graph for reproducible installs.                                 |
| `rollup.config.js`  | Build config for bundling, metadata injection, and generated output formatting.    |

### Scripts

| File                  | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `ConditionTracker.js` | Generated bundle for Roll20 API sandbox deployment. |

## Build Output Pattern

| Pattern                         | Purpose                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `<version>/ConditionTracker.js` | Versioned generated bundle output (for example `1.0.0.alpha-62/ConditionTracker.js`). |

## Build Scripts

| File                | Purpose                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| `scripts/build.mjs` | Build runner that executes Rollup and writes root plus versioned output artifacts. |

## Source Modules (`src`)

| File                | Purpose                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/index.js`      | Runtime entrypoint. Registers Roll20 event handlers and coordinates install, turn updates, and cleanup flows. |
| `src/constants.js`  | Central constant definitions (commands, defaults, condition sets, metadata placeholders).                     |
| `src/state.js`      | Persistent state schema and helpers for config, runtime bookkeeping, and active condition lists.              |
| `src/commands.js`   | Command routing and top-level operations: apply/remove, prompt UI, config, help, and zero-HP actions.         |
| `src/parser.js`     | Tokenizes chat command strings and collects flag arguments.                                                   |
| `src/validation.js` | Input validation and normalization for command arguments and config values.                                   |
| `src/conditions.js` | Condition normalization and message/display text composition for apply/remove output.                         |
| `src/durations.js`  | Duration parsing and decrement/expiry logic.                                                                  |
| `src/turnOrder.js`  | Turn Tracker row creation, insertion/update/removal, signatures, migration, and lookup helpers.               |
| `src/removal.js`    | Unified condition removal pipeline with row removal, marker cleanup, and messaging.                           |
| `src/cleanup.js`    | Manual reconciliation for stale/orphaned state and Turn Tracker rows.                                         |
| `src/markers.js`    | Marker application/removal helpers with safety checks for shared marker usage.                                |
| `src/macros.js`     | Macro install/update/reinstall logic for GM convenience macros.                                               |
| `src/chat.js`       | Chat rendering primitives for cards, tables, buttons, warnings/errors, and whispers.                          |
| `src/i18n.js`       | Locale normalization, translation lookup, fallback handling, locale direction, and localized language names.  |
| `src/locales/`      | Locale metadata and one translation module per supported Roll20 account language.                             |
| `src/handout.js`    | Generates and installs/updates the localized in-game help handout.                                            |
| `src/handout.html`  | Handout HTML template source.                                                                                 |
| `src/utils.js`      | Shared utility helpers (text conversion, JSON parsing, object lookups, player/GM helpers).                    |
