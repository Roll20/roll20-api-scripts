# Changelog

All notable changes to **Condition Tracker** will be documented in this file.

## [1.1.0] - 2026-05-10

### Added

- **Persistent Effects System (Saved Effects)**: Store long-term conditions (curses, diseases, poisons, hidden debuffs) in script state outside the Turn Tracker. Saved effects persist across sessions and can be optionally promoted into the Turn Tracker when combat begins ([#7](https://github.com/steverobertsuk/roll20-api-scripts/issues/7), [#14](https://github.com/steverobertsuk/roll20-api-scripts/issues/14)).
  - **Three visibility modes**: `public` (full label visible in Turn Tracker and chat), `masked` (vague public label shown to players; full details whispered to GM), and `gm` (no Turn Tracker row; GM-whisper only when affected token reaches the top of initiative).
  - **`!condition-tracker --saved` commands**: `--saved` (view list), `--saved add` (guided wizard), `--saved edit <id>`, `--saved remove <id>`, `--saved promote <id> --visibility public|masked|gm`, `--saved snooze <id> --scope turn|rounds|combat --rounds <n>`, `--saved snooze-clear <id>`.
  - **GM reminder system**: When a token with `gm` or `masked` saved effects reaches the top of the Turn Tracker, the GM receives a whispered reminder listing hidden effects with inline action buttons. Duplicate reminders within the same turn are suppressed via a stable turn-key.
  - **Snooze controls**: Suppress GM reminders for this turn, 1 round, 3 rounds, or the remainder of the current combat. Combat snoozes are automatically cleared when the Turn Tracker empties.
  - **Saved promotion**: Copies (does not move) a saved effect into the Turn Tracker. Public and masked entries create visible tracker rows; GM-only entries confirm stored tracking without creating a row.
  - **Token-deletion cleanup**: Removing a token from the board now prunes all associated saved effects in addition to active tracked conditions.
- **Marker picker (`--config marker-pick`)**: Added `!condition-tracker --config marker-pick <condition>` which whispers a visual card showing every campaign token marker as a 28×28 icon button. Clicking any button immediately sets that marker for the given condition — no need to look up marker names manually. The currently configured marker is highlighted in the picker.
- **Marker clear (`--config marker-clear`)**: Added `!condition-tracker --config marker-clear <condition>` to remove a custom marker mapping for a condition, restoring the system default or leaving the slot unset.
- **Custom marketplace marker support**: `--config marker` now resolves custom marketplace marker names (e.g. `005-Unconscious`) to their full `name::id` tag format automatically via `Campaign().get('token_markers')`. Passing the full `name::id` tag form directly is also supported.
- **Full locale support**: All 24 supported languages updated with new translation keys across the 1.1.0 feature set, including saved effects UI, commands, and help handout.
- **`!condition-tracker --report-token` command**: Added GM-only per-token condition reporting for selected tokens, including conditions applied to and conditions sourced by each token ([#8](https://github.com/steverobertsuk/roll20-api-scripts/issues/8)).
- **Multi-system condition profiles**: Added game-system-driven condition lists and default marker mappings with `gameSystem` configuration support (including `dnd5e`, `dnd4e`, `dnd35`, `pathfinder1e`, `pathfinder2e`, `starfinder`, and many additional systems) ([#9](https://github.com/steverobertsuk/roll20-api-scripts/issues/9)).
- **Name-based token references in direct apply commands**: `--source`, `--target`, and `--subject` now accept token ids, exact token names, exact linked character names, and unique partial name matches ([#10](https://github.com/steverobertsuk/roll20-api-scripts/issues/10)).
- **`ConditionTrackerSaved` and `ConditionTrackerClassify` macros**: Auto-installed for all GM players alongside the wizard, multi-target, and report-token macros ([#12](https://github.com/steverobertsuk/roll20-api-scripts/issues/12)).
- **Actor Classification System**: Cross-system token classification engine that reliably identifies PCs, NPCs, and ignored tokens in a deterministic order ([#11](https://github.com/steverobertsuk/roll20-api-scripts/issues/11)).
  - Detection order: token-level state override → character `ct_mod_actor_type` attribute → unlinked-token eligibility check → game-system sheet adapter → generic NPC attribute scan → `controlledby` fallback.
  - Unlinked tokens (map pins, spell templates, scenery) are classified as `ignored` by default and excluded from the wizard token picker.
  - Game-system adapters for `dnd5e`, `dnd4e`, `dnd35`, `pathfinder1e`, `pathfinder2e`, and `starfinder` read the sheet's native NPC attribute for automatic detection.
  - Generic NPC attribute scan checks `npc`, `is_npc`, `npcflag`, `sheet_type`, and `character_type` as a fallback for unsupported sheets.
- **`!condition-tracker --classify` command**: Explicitly override a token's actor type for selected tokens ([#13](https://github.com/steverobertsuk/roll20-api-scripts/issues/13)).
  - `--classify pc|npc|ignored` — mark selected tokens permanently.
  - `--classify auto` — remove the override and restore automatic detection.
  - `--classify show` — diagnostic whisper showing classification, source, and reason for each selected token.
  - `--scope character` (default) — writes the override to the character's `ct_mod_actor_type` attribute; persists across all tokens that share the character sheet.
  - `--scope token` — writes a token-level override to script state; useful for unlinked tokens or per-token overrides on shared sheets.

### Changed

- Name resolution for direct token references is now case-insensitive and exact-match-first, with partial matching used as a fallback.
- Ambiguous name matches now return a clear guidance message listing candidate tokens and recommending a more specific name or token id.
- Help and handout content now include copy-ready examples for name-based direct apply usage.
- `isPlayerToken()` now delegates entirely to the new `classifyToken()` engine, applying override and adapter logic consistently everywhere the function is called (wizard token picker, zero-HP cleanup prompts, token-change events).
- The wizard token picker now excludes `ignored` tokens. Previously, unlinked tokens with names appeared in the NPC column; they are now hidden unless explicitly classified as `pc` or `npc`.
- Added `enablePostApplyMacroButtons` configuration support to optionally show macro-creation action buttons in post-apply GM whispers.

### Developer

- Build pipeline now runs a `prebuild` version bump step (`scripts/bump-version.mjs`) that auto-increments the trailing numeric segment in `script.json` (e.g. `1.1.0.beta-3.4` → `1.1.0.beta-3.5`; plain semver falls back to patch increment). To set an explicit version use `npm run set-version -- <version>` and then build via `node scripts/build.mjs` to skip the auto-bump.
- `scripts/build.mjs` now synchronizes `package.json` version to `script.json` before bundling, keeping package metadata aligned with release metadata.
- Build output formatting is now integrated into the build step: the primary generated bundle is formatted once with Prettier, then copied into the versioned release folder.
- Watch-mode rebuilds now use the same post-build formatting and versioned-copy behavior for consistent generated artifacts.

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
