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

The build does not regenerate locale files. Run `npm run sync-locales` for incremental locale updates or `npm run regenerate-locales` to retranslate everything. Both commands support targeting a single locale with `-- --locale=<code>` or a positional locale argument (for example `npm run sync-locales -- --locale=es` or `npm run regenerate-locales uk`).

Both commands prompt for confirmation before making translation requests. Use `-- --yes` (or `-y`) to skip the prompt in automated/non-interactive runs.

Estimated timing shown before confirmation:

- Sync mode: usually several minutes. Estimated minimum is `4 x number of targeted locales`; estimated maximum is `7 x targeted locales that still need translation`.
- Regenerate mode: `30-60` minutes per targeted locale.

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

1. If the locale is incomplete, run `npm run sync-locales` first. Use `npm run regenerate-locales` when you want every string refreshed, or target one locale with `-- --locale=<code>` or a positional locale argument. Add `-- --yes` if you need to skip the confirmation prompt.
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

## Source File Guide

### Core Module: `src/index.js`

Entry point that registers Roll20 event handlers and coordinates install, turn updates, saved-effect reminders, and token cleanup.

### Actor Classification: `src/actorClassification.js`

Determines token type (pc, npc, ignored, unknown) for condition tracking purposes.

**Key exports:**

- `classifyToken(token)` — Main classification function; applies detection in priority order
- `getExplicitClassification(token)` — Checks state and character overrides
- `classifyAutomatically(token)` — Runs adapter → generic → controlledby detection
- `classifyTokenDetail(token, tokenName)` — Returns detailed diagnosis for `--classify show`
- `setCharacterOverrideAttr()` / `clearCharacterOverrideAttr()` — Manage `ct_mod_actor_type` character attribute

**Detection order:**

1. Token-level state override
2. Character `ct_mod_actor_type` attribute
3. Automatic eligibility (ignores objects layer and unlinked tokens)
4. Game-system adapter (e.g., dnd5e `npc` attribute)
5. Generic NPC attributes (fallback scan for common attribute names)
6. Character `controlledby` field

### Chat Output: `src/chat.js`

Formats and sends chat messages to players and GMs.

**Utilities:**

- `whisper(playerId, title, body)` — Private message to a player
- `whisperGms(title, body)` — Private message to all GMs
- `whisperWarning()`, `whisperError()` — Styled error/warning messages
- `announce(message)`, `announceHtml(html)` — Public chat messages
- `buildBox(title, lines)` — Styled box for lists and tables
- `buildButton(label, command)` — Generates clickable chat buttons
- `htmlTable(headers, rows)` — Generates formatted HTML tables

Handles color theming, HTML escaping, and Roll20 chat API.

### Command Routing & Menus: `src/commands.js`

Implements all `!condition-tracker` command handling and menu/wizard rendering.

**Major handlers:**

- `routeCommand(msg, args)` — dispatches sub-commands
- `handleApply()` / `handleRemove()` — apply and remove active conditions
- `handleConfig()` / `handleClassify()` — configuration and actor classification controls
- `showPromptUi()` / `showMenu()` / `showHelp()` — GM chat UI entry points
- `handleReportToken()` — per-token condition/source report
- `handleCreateMacroLast()` — creates a GM macro from the last successful apply payload; triggered by the **Create Macro** buttons in the apply confirmation whisper when `enablePostApplyMacroButtons` is enabled
- `removeExpiredConditions()` — turn-based expiry cleanup

Also contains zero-HP action handlers and reinstall command handlers for macros/handout.

### Conditions: `src/conditions.js`

Condition type definitions, system profiles, and condition metadata.

**Key exports:**

- `isCustomEffectType(condition)` — Checks if condition is a custom/free-form type
- `isCustomTextCondition(condition)` — Checks if a custom type requires free text
- `getCanonicalCondition(value)` — Canonical condition id normalization
- `buildDisplayText()`, `buildApplyMessage()`, `buildRemovalMessage()` — localized output builders

Contains logic for condition aliases, templates, and system-specific condition lists.

### Configuration & State: `src/state.js`

Manages script state and persistent configuration.

**State structure:**

```
state.ConditionTracker = {
  gameSystem,           // Active game system id
  language,             // Active locale code
  globalconfig,         // User settings (markers, health bars, etc.)
  activeConditions,     // Turn order conditions by token id
  savedEffects,         // Saved effect records by token id
  tokenOverrides,       // Actor type overrides by token id
  turnRuntime,          // Runtime state (current turn, turn key, etc.)
}
```

**Key exports:**

- `getConfig()` — Returns current game system and locale
- `getActiveConditions()` — Returns all Turn Tracker conditions
- `getActorTokenOverride(tokenId)` — Retrieves token-level actor type override
- `ensureState()` — Initializes state on first run
- `applyGlobalConfig(obj)` — Applies user settings from one-click config

### Duration Tracking: `src/durations.js`

Interprets and decrements condition durations.

**Duration types:**

- `untilRemoved` — Persists until manually removed
- `turnEnd` — Expires when the anchor token's turn count reaches zero
- `rounds` — Counts down on target-anchor turn ticks

Exports parser/build helpers (`parseDuration`, `createTurnEndDuration`, `createRoundDuration`) plus `decrementDuration(condition, endedTurnTokenId)`.

### Help & Installation: `src/handout.js`

Generates and manages the built-in help handout.

**Functions:**

- `installHandout()` — Creates or updates the help handout in the campaign
- `buildHandoutContent()` — Generates HTML from locale strings

Driven by `npm run regenerate-locales` for locale updates.

### Localization: `src/i18n.js`

Translation system and locale management.

**Key exports:**

- `t(key, locale, substitutions)` — Translation lookup with optional substitutions
- `tRaw(key, locale)` — Raw lookup for structured translation nodes
- `normalizeLocale(code)` — Resolves locale aliases
- `getConditionLocalData(condition)` — Returns translated condition metadata
- `getLocalizedLanguageName()` / `isRtlLocale()` — locale-name and direction helpers

Imports locale modules from `src/locales/locale/<code>.js` on demand. Supports fallback to en-US when keys are missing.

### Macros: `src/macros.js`

Installs and reconciles GM macros.

**Default macros:**

- `ConditionTrackerWizard` — Opens prompt wizard
- `ConditionTrackerMultiTarget` — Opens multi-target flow
- `ConditionTrackerReportToken` — Runs token report
- `ConditionTrackerSaved` — Opens saved effects menu for current token
- `ConditionTrackerClassify` — Opens actor classification diagnostics

Macro definitions stored in `MACRO_DEFINITIONS` object.

### Status Markers: `src/markers.js`

Manages token status markers (icons) that display conditions visually.

**Key exports:**

- `getTokenMarkers(token)` — Fetches all markers currently on a token
- `containsMarker(markers, marker)` — Checks if marker is in use
- `removeMarkerIfUnused(token, marker)` — Removes marker only if no conditions use it

Handles marker-to-condition mappings and prevents accidental marker removal.

### Parsing: `src/parser.js`

Parses chat message text and command arguments.

**Exports:**

- `parseCommand(content)` — Parses message content into canonical args
- `tokenize(text)` — Splits text into quoted/unquoted tokens
- `collectFlags(tokens)` — Converts CLI-style tokens to argument object

Handles quoted values, multi-word values, and partial key matching.

### Condition Removal: `src/removal.js`

Handles active-condition removal side effects and reporting.

**Functions:**

- `removeConditionById(conditionId, options)` — Removes one active condition and associated row/marker state
- `whisperRemoval(...)` — GM-facing removal details

Formats removal messages and handles both public and private announcements.

### Saved Effects: `src/savedEffects.js`

State layer for persistent/between-combat effects.

**Key exports:**

- `createSavedEffect(data)` — Creates a new saved effect record
- `getSavedEffectsForToken(tokenId)` — Retrieves all saved effects for a token
- `addSavedEffect()`, `updateSavedEffect()`, `removeSavedEffect()` — CRUD operations
- `clearCombatSnoozes()` — Called when Turn Tracker empties to reset snooze counters

Manages visibility (public/masked/gm) and snooze scope (turn/rounds/combat).

### Saved Effects UI: `src/savedEffectsCommands.js`

Command and UI layer for saved effects feature.

**Key handlers:**

- `handleSaved(msg, args)` — Main dispatcher for `--saved` sub-commands
- `showSavedMenu(playerId, tokenId, tokenName)` — Lists saved effects with action buttons
- `processSavedEffectReminders(tokenId, tokenName, turnKey)` — Checks snooze conditions and reminds GM

Integrates with Turn Tracker tick events and coordinate with `src/savedEffects.js` for data access.

### Turn Order Management: `src/turnOrder.js`

Manages condition rows in the Roll20 Turn Tracker (initiative list).

**Key exports:**

- `getTurnOrder()` — Fetches current Turn Tracker rows
- `updateConditionRow(condition)` — Syncs a row from a condition record
- `insertConditionRow()` / `insertConditionRows()` — Adds new condition rows beneath anchors
- `removeConditionRows(conditionIds)` — Removes condition rows
- `getCurrentTurnTokenId()` — Gets the token id of the top Turn Tracker row
- `migrateTurnOrderRows()` — Called on startup to clean up stale rows from previous runs

Handles row id parsing, condition anchoring (to source or target), and row bookkeeping.

### Utilities: `src/utils.js`

General-purpose helper functions.

**Key exports:**

- `toText(value)` — Coerces values to string safely (handles undefined, null, objects)
- `normalizeKey(text)` — Normalizes text for case-insensitive matching
- `queryObjects(criteria)` — Wrapper around Roll20 `findObjs()`
- `getGraphicToken(tokenId)` — Fetches a graphic token by id
- `getTokenName(token)` — Returns display name for a token
- `getGmPlayerIds()` — Returns all GM player ids
- `escapeHtml(text)` — HTML-safe escaping

Reduces repetitive Roll20 API patterns.

### Input Validation: `src/validation.js`

Validates user input for commands and config.

**Key exports:**

- `resolveTokenReference(rawRef, role, locale)` — id/name/partial token resolution
- `validateApplyArgs(args)` — apply-command validation and normalization
- `validateMarkerConfig()`, `validateBoolean()`, `validateHealthBar()` — config validators
- `validateGameSystem()`, `validateLocale()` — system and locale validators

Returns error messages when validation fails.

### Game Systems: `src/systems/`

System-specific profiles for different game systems.

**Each system profile includes:**

- NPC detection attribute names
- Condition definitions and templates
- System-specific UI defaults
- Translations keyed to system id

**Profiles included:**

- `dnd5e.js` — D&D 5e via Shaped Sheet and Roll20 Official
- `pathfinder2e.js` — Pathfinder 2e
- Plus others for dnd4e, starfinder, cypher, etc.

Loaded via `getSystemProfile(systemId)` from `src/systems/index.js`.
