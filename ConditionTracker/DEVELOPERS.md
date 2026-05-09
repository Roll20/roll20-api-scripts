# Condition Tracker Developer Guide

This guide is for contributors who want to edit source files and regenerate the bundled script used by Roll20.

## What You Need

- Node.js 20.x LTS recommended
- npm
- Git
- A code editor

Check your versions:

```bash
node -v
npm -v
git --version
```

## Project Layout

- `src/` is the source of truth for script logic.
- `src/locales/locale/<locale>.js` contains one translation module per supported locale.
- `src/locales/metadata.js` defines supported locale codes, display names, aliases, direction, flag labels, and source file references.
- `ConditionTracker.js` is generated output.
- `<version>/ConditionTracker.js` is generated output for release/version tracking.
- `script.json` controls script metadata and the versioned output folder name.
- [MOD_FILE_MAP.md](MOD_FILE_MAP.md) is the complete developer inventory of project files and module responsibilities.

Do not hand-edit generated bundle files.

## First-Time Setup

From the `ConditionTracker` directory:

```bash
npm install
```

## Build Commands

One-time build:

```bash
npm run build
```

Watch mode:

```bash
npm run watch
```

The build bundles `src/index.js` and writes both root and versioned output files.

The build does not regenerate locale files. Run `npm run sync-locales` for incremental locale updates or `npm run regenerate-locales` to retranslate everything, optionally with `-- --locale=<code>` or a positional locale argument (for example `npm run regenerate-locales uk`).

Format source and docs:

```bash
npm run format
```

## Contributor Workflow

1. Edit files in `src/`.
2. Run `npm run format`.
3. Run `npm run build`.
4. Paste `ConditionTracker.js` into Roll20 and restart the sandbox.
5. Run the smoke and regression checks in `TESTING.md`.
6. Commit source, docs, metadata, and generated artifacts together.

## Locale Updates

When adding or editing translations:

1. If the locale is incomplete, run `npm run sync-locales` first. Use `npm run regenerate-locales` when you want every string refreshed, or target one locale with `-- --locale=<code>` or a positional locale argument.
2. Update the relevant file under `src/locales/locale/`.
3. Keep translation keys aligned with `src/locales/locale/en-US.js`, which is the fallback when a key is missing.
4. For incorrect translated output, edit the matching section:
   - `conditions`, `condNames`, and `templates` for Turn Tracker text and apply/remove announcements.
   - `ui` for chat cards, menus, buttons, warnings, config, and help messages.
   - `handout` for the generated help handout and help-card tables that reuse handout content.
   - `languageNames` for the available-translations list when that locale is active.
5. Update `src/locales/metadata.js` only if the locale list, aliases, text direction, flag label, or translation file path changes.
6. Run `npm run format` and `npm run build`.
7. In Roll20, verify `!condition-tracker --config language <locale>`, `!condition-tracker --help`, and `!condition-tracker --reinstall-handout`.

## Saved Effects Architecture

The saved-effects feature is split into two source files to keep state CRUD separate from command/UI concerns.

### `src/savedEffects.js` — State layer

Owns all reads and writes to `state.ConditionTracker.savedEffects`, which is a plain object keyed by `targetTokenId`. Each value is an array of saved-effect records with this shape:

```js
{
  id,               // "ct_<8-char hex>" — unique across all effects
  visibility,       // "public" | "masked" | "gm"
  condition,        // condition type string (e.g. "Curse", "Disease")
  other,            // free-form description
  targetTokenId,    // Roll20 token id of the affected token
  targetCharacterId,
  sourceTokenId,
  publicLabel,      // shown to players in masked mode
  gmLabel,          // full GM-only description
  snooze,           // null | { scope, snoozedOnTurnKey, roundsRemaining }
  lastReminderTurnKey,
  createdAt,
  updatedAt,
}
```

Key exported functions: `createSavedEffect`, `getSavedEffectsForToken`, `getAllSavedEffects`, `findSavedEffect`, `addSavedEffect`, `updateSavedEffect`, `removeSavedEffect`, `removeSavedEffectsForToken`, `clearCombatSnoozes`.

### `src/savedEffectsCommands.js` — Command and UI layer

Handles all `--saved` sub-commands and the GM reminder system.

- `handleSaved(msg, args)` — main dispatcher; parses the subcommand from `args.saved`
- `showSavedMenu(playerId, tokenId, tokenName)` — lists saved effects with inline action buttons
- `processSavedEffectReminders(tokenId, tokenName, turnKey)` — called from `handleTurnOrderChange()` in `index.js` each time a new token reaches the top of initiative; suppresses duplicates via `shouldShowReminder()`

**Promotion** copies a saved effect into the Turn Tracker by calling `buildActiveConditionFromSaved()`, which mirrors `buildConditionRecord()` in `commands.js` but is local to `savedEffectsCommands.js` to avoid a circular import (`commands.js` imports `handleSaved`; `savedEffectsCommands.js` must not import back into `commands.js`).

**Snooze logic** (`shouldShowReminder`):

- `scope: "turn"` — stores the current turn key; clears when the key changes.
- `scope: "rounds"` — stores a remaining-rounds counter; decrements each new-first-turn tick.
- `scope: "combat"` — persists until `clearCombatSnoozes()` is called when the Turn Tracker empties.

### Integration points

| Location                                 | What was added                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/state.js` `ensureState()`           | Initializes `savedEffects: {}` on first run                                                            |
| `src/index.js` `handleTurnOrderChange()` | Calls `processSavedEffectReminders` on new-first-turn; calls `clearCombatSnoozes` when tracker empties |
| `src/index.js` `handleTokenDestroy()`    | Calls `removeSavedEffectsForToken`                                                                     |
| `src/commands.js` `routeCommand()`       | Routes `args.saved` to `handleSaved`                                                                   |
| `src/commands.js` `showMenu()`           | Adds Saved Effects button to the main menu                                                             |
| `src/macros.js`                          | Adds `ConditionTrackerSaved` to `MACRO_DEFINITIONS`                                                    |

## Updating Version Metadata

If behavior changes for a release:

1. Update `script.json` version.
2. Update `package.json` version.
3. Update `CHANGELOG.md`.
4. Run `npm run build`.
5. Confirm output appears in the new version folder.
