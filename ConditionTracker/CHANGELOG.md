# Changelog

All notable changes to **Condition Tracker** will be documented in this file.

## [1.1.0.beta-3.2] - 2026-05-08

### Added

- **Actor Classification System**: Cross-system token classification engine that reliably identifies PCs, NPCs, and ignored tokens in a deterministic order.
  - Detection order: token-level state override → character `ct_mod_actor_type` attribute → unlinked-token eligibility check → game-system sheet adapter → generic NPC attribute scan → `controlledby` fallback.
  - Unlinked tokens (map pins, spell templates, scenery) are classified as `ignored` by default and excluded from the wizard token picker.
  - Game-system adapters for `dnd5e`, `dnd4e`, `dnd35`, `pathfinder1e`, `pathfinder2e`, and `starfinder` read the sheet's native NPC attribute for automatic detection.
  - Generic NPC attribute scan checks `npc`, `is_npc`, `npcflag`, `sheet_type`, and `character_type` as a fallback for unsupported sheets.
- **`--classify` command**: Explicitly override a token's actor type for selected tokens.
  - `!condition-tracker --classify pc|npc|ignored` — mark selected tokens permanently.
  - `!condition-tracker --classify auto` — remove the override and restore automatic detection.
  - `!condition-tracker --classify show` — diagnostic whisper showing classification, source, and reason for each selected token.
  - `--scope character` (default) — writes the override to the character's `ct_mod_actor_type` attribute; persists across all tokens that share the character sheet.
  - `--scope token` — writes a token-level override to script state; useful for unlinked tokens or per-token overrides on shared sheets.

### Changed

- `isPlayerToken()` now delegates entirely to the new `classifyToken()` engine, applying override and adapter logic consistently everywhere the function is called (wizard token picker, zero-HP cleanup prompts, token-change events).
- The wizard token picker now excludes `ignored` tokens. Previously, unlinked tokens with names appeared in the NPC column; they are now hidden unless explicitly classified as `pc` or `npc`.

## [1.1.0] - 2026-05-06

### Added

- **Saved Effects system**: Store long-term conditions (curses, diseases, poisons, hidden debuffs) in script state outside the Turn Tracker. Saved effects persist across sessions and can be optionally promoted into the Turn Tracker when combat begins.
- **Three visibility modes for saved effects**: `public` (full label visible in Turn Tracker and chat), `masked` (vague public label shown to players; full details whispered to GM), and `gm` (no Turn Tracker row; GM-whisper only when affected token reaches the top of initiative).
- **`!condition-tracker --saved` commands**: `--saved` (view list), `--saved add` (guided wizard), `--saved edit <id>`, `--saved remove <id>`, `--saved promote <id> --visibility public|masked|gm`, `--saved snooze <id> --scope turn|rounds|combat --rounds <n>`, `--saved snooze-clear <id>`.
- **`!condition-tracker --report-token` command**: Added GM-only per-token condition reporting for selected tokens, including conditions applied to and conditions sourced by each token.
- **GM reminder system**: When a token with `gm` or `masked` saved effects reaches the top of the Turn Tracker, the GM receives a whispered reminder listing hidden effects with inline action buttons. Duplicate reminders within the same turn are suppressed via a stable turn-key.
- **Snooze controls**: Suppress GM reminders for this turn, 1 round, 3 rounds, or the remainder of the current combat. Combat snoozes are automatically cleared when the Turn Tracker empties.
- **Saved promotion**: Copies (does not move) a saved effect into the Turn Tracker. Public and masked entries create visible tracker rows; GM-only entries confirm stored tracking without creating a row.
- **`ConditionTrackerSaved` macro**: Auto-installed for all GM players alongside the wizard, multi-target, and report-token macros.
- **Token-deletion cleanup**: Removing a token from the board now prunes all associated saved effects in addition to active tracked conditions.
- **Full locale support**: All 24 supported languages updated with new translation keys for the saved-effects UI, commands, and help handout.

## [1.0.0] - 2026-04-30

### Added

- Initial release of Condition Tracker with token-focused condition and custom-effect tracking for Roll20 Turn Tracker.
- Guided GM workflows: interactive wizard (`--prompt`), multi-target wizard (`--multi-target`), and menu-driven controls for apply/remove/help/config.
- Rich effect modeling: standard conditions plus custom effect types (Spell, Ability, Advantage, Disadvantage, Other) with duplicate prevention and per-target tracking.
- Turn-order integration: stable custom rows, grouped source-based rows for advantage/disadvantage, tracked durations (until removed, end-of-turn anchors, numeric rounds), and efficient row insertion/update handling.
- Automatic lifecycle cleanup: expiry-based removal, zero-HP cleanup prompts/actions, proactive token-deletion pruning (`destroy:graphic`), and manual reconciliation for orphaned/stale entries.
- Marker system: configurable per-condition marker mapping with safe marker application/removal logic that avoids removing markers still required by other active conditions.
- GM tooling: auto-installed `ConditionTrackerWizard` and `ConditionTrackerMultiTarget` macros, plus reinstall support for macros and localized handout content.
- Internationalization support: localized chat/wizard/help/handout content for Roll20 account languages: `af`, `ca`, `zh-TW`, `cs`, `da`, `nl`, `en-US`, `fi`, `fr`, `de`, `el`, `he`, `hu`, `it`, `ja`, `ko`, `pl`, `pt-PT`, `pt-BR`, `ru`, `es`, `sv`, `tr`, and `uk`.
- Locale aliases for common two-letter input: `en` resolves to `en-US`, `zh` resolves to `zh-TW`, and `pt` resolves to `pt-PT`.
- Hebrew right-to-left rendering for chat cards, help tables, and the generated handout.
- Available-translations reference in chat help, invalid-locale warnings, and the generated handout, including accessible flag images and localized language names where available.
- Configuration surface: GM options for marker usage, icon mode, subject prompt bypass, health bar monitoring, marker overrides, and language.
- Performance-focused foundations: precomputed condition-anchor lookups and batch turn-row cleanup passes to reduce repeated rescans in larger combats.
- Developer-ready modular architecture (`src/`) with Rollup build pipeline and generated release artifacts.
