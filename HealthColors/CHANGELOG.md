# HealthColors Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.1.1] – 2026-05-07 · [Milestone](https://github.com/steverobertsuk/roll20-api-scripts/milestone/1)

### Added
- Added version 1.7.1 (sourced from the Roll20 forums, never previously submitted to the GitHub repository) so it appears as a selectable previous version in the Roll20 Mod Script Console.

### Fixed
- Fixed aura visibility threshold (`Percentage PC/NPC`): tokens at or above the configured HP threshold were incorrectly shown a green default aura instead of having the aura hidden. Changed comparison from `>=` to `>` and replaced `applyDefaultAura()` with `clearAuras()` in the above-threshold branch so the aura correctly disappears when a token's HP is not below the threshold. Also added a guard so a threshold of `0` clears the aura rather than treating it as "always show". ([#1](https://github.com/steverobertsuk/roll20-api-scripts/issues/1))
- Fixed `!aura` settings menu after a change: clicking a button and submitting the dialog caused a non-interactive read-only panel (using `<span>` pills) to appear in public chat instead of re-displaying the interactive GM-whispered menu. Root cause was `handleInput` calling `showSettingsInGameChat()` on every setting change instead of `showMenu()`. The interactive GM menu is now always shown after a change; the read-only public snapshot remains available via the explicit `!aura settings` command. ([#3](https://github.com/steverobertsuk/roll20-api-scripts/issues/3), [#4](https://github.com/steverobertsuk/roll20-api-scripts/issues/4))
- Fixed `!aura perc` not refreshing tokens already on the map: changing the HP threshold now immediately re-evaluates all existing tokens via `menuForceUpdate()`, so tokens that were visible under the old threshold are correctly cleared (or revealed) without requiring a token move.
- Fixed "No FX with name" GM whisper appearing repeatedly when a character's `USEBLOOD` attribute is set to a custom custfx name that no longer exists in the campaign (e.g. after a campaign reset or character import). The error message now identifies the character by name so the GM knows which `USEBLOOD` attribute to correct. The script also falls back to `-DefaultHurt` so a visual effect still plays instead of silently doing nothing. ([#2](https://github.com/steverobertsuk/roll20-api-scripts/issues/2))

### Changed
- Removed orphaned `applyDefaultAura` function — it was superseded by `clearAuras()` in the threshold fix but never deleted.
- Removed unused `changedSetting` variable from `handleInput` — it was assigned in ~20 places but never read, as `showMenu()` was always called unconditionally at the end of the function.
- Token refresh progress messages updated: sender changed from a hardcoded string to `SCRIPT_NAME`; text changed from `"Fixing N Tokens"` / `"Finished Fixing Tokens"` to `"Refreshing N Tokens"` / `"Finished Refreshing Tokens"`.
- `handleInput` command dispatch refactored — 27 switch cases reduced to 5 dispatch-table lookups (`TOGGLES`, `STRINGS`, `FLOATS`, `SHAPES`, `HEXES`) plus a 13-case switch for commands with unique behaviour, removing ~100 lines of repetitive boilerplate.
- `showSettingsInGameChat` refactored to reduce cognitive complexity: extracted `boolPill` and `namePill` module-level helpers (read-only counterparts to the existing `toggleBtn`/`nameBtn`), replacing 8 repeated inline ternary expressions and an inline `pickNameStyle` closure.
- JSDoc corrections: removed stale `@param [update]` from `applyAuraAndDead` (parameter was removed in an earlier refactor); corrected `spawnDefaultFxById` description which falsely claimed to tighten particle profile settings; corrected `boolPill` description (background colour, not text colour); corrected `registerEventHandlers` listing `change:token` instead of `change:graphic`; documented the missing British/American colour-key variants on `FX_PARAM_DEFAULTS`; removed stale `pColor` return-type entry from `resolveTypeConfig`.

---

## [2.1.0] – 2026-05-01

### Added
- Added a palette system for health colors with `default` and `colorblind` options.
- Added `!aura palette ?{Palette|default|colorblind}` command and matching menu control (palette switching forces existing tokens to refresh immediately).

### Changed
- Switched health color mapping from a fixed red/green calculation to palette-based low/mid/high interpolation.
- Added an explicit `dead` color stop to each palette and mapped exactly 0% HP to black (`#000000`).
- Updated default `AuraSize` from `0.7` to `0.35` and aligned docs/menu wording to describe radius in feet from token edge.
- Updated menu/settings output to include the active palette.

### Fixed
- Fixed dead-state visuals at 0 HP so dead color behavior remains consistent.
- Fixed missed updates when tokens are resized by treating width/height changes as a visual refresh trigger.

## [2.0.1] – 2026-04-20

### Fixed
- Corrected behavior for tokens with health below zero to ensure the "dead" marker is applied consistently.
- Clamped negative health values to zero for accurate color mapping and consistent visual feedback.
- Refactored `applyAuraAndDead` to separate dead-marker logic from aura updates, ensuring proper handling of edge cases.

### Changed
- Updated `percentToHex` to normalize input values, preventing invalid color calculations.
- Improved code readability and maintainability by restructuring health percentage calculations.

---

## [2.0.0] – 2026-04-08

Major modernization and stability refactor of the entire script, consolidating performance improvements, critical bug fixes, and new user control features. This version represents a complete overhaul from the v1.6.x series.

### Added
- **Respect Manual Overrides** — the script now only updates visual properties (Aura 1) when a token's internal health bar actually changes. This allows for manual customization of colors, radii, and shapes via the token settings dialog without script interference during movement.
- **Persistent Default Auras** — tokens at 100% health now default to a clean **Green** Aura 1 (at the configured `AuraSize`) to indicate stability.
- **JSDoc Documentation** — every function is now fully documented with parameter types, return values, and behavioral descriptions to improve maintainability.
- **Centralized Configuration** — all default state values, FX definitions, and internal parameters are now managed via unified constants.
- **FX Recovery Commands** — added `!aura reset-fx` (rebuild default heal/hurt custom FX objects) and `!aura reset-all` (restore all settings to defaults + rebuild default FX + force update).
- **Public Settings Snapshot** — added `!aura settings` to post a read-only settings panel to game chat on demand.
- **Aura Detail Commands** — added `!aura a1shape`, `!aura a1tint`, `!aura a2size`, `!aura a2shape`, and `!aura a2tint` to adjust displayed Aura 1/Aura 2 detail values from chat.

### Changed
- **`_` (Underscore) dependency** — no longer required.
- **`buttonColor` function** — legacy function completely removed after
  verifying no external or internal dependencies; superseded by `nameBtn`.
- **Tautological FX condition** `(UseBlood !== "OFF" || UseBlood !== "NO")`.
- **`!aura on/off` semantics** — now explicitly sets global enabled state instead of toggling on `on`.
- **Schema version** — bumped to `1.1.0` to reflect incremental state/data migration changes in the v2.0.0 line.

### Fixed
- Consistent casing for `checkInstall` and `handleToken` throughout.
- Initialization of `OneOff` state key to prevent `undefined` collisions.
- Corrected logic in `playDeath` to ensure jukebox tracks are properly stopped before restarting.
- Page scale calculation and aura radius math standardized for better precision.
- Heal and hurt FX color assignment now resolves `startColour`/`startColor` and `endColour`/`endColor` consistently, preventing gray/white fallback artifacts.
- Default heal/hurt FX random color channels are explicitly neutralized during spawn preparation to preserve configured color fidelity.
- Added a fallback spawn path that updates and triggers default custom FX by id (`spawnFx`) when definition-based spawning renders colors inconsistently.
- Tuned default heal/hurt particle profile values for clearer saturation and reduced washed-out appearance in experimental sandboxes.
- `!aura bar` now validates `1|2|3`, whispers confirmation on change, and immediately runs a full sync to apply the new bar selection.
- Tokens with no `max` value on the configured bar now have aura/tint cleared, preventing stale health indicators.
- Configuration output now explicitly includes Aura 2 detail rows in both the GM menu and public settings snapshot.
- Prevented duplicate settings output: setting-changing commands re-display the GM menu instead of posting to both GM and public chat.
- Aura 2 output values are now sourced from state-backed defaults (`Aura2Size`, `Aura2Shape`, `Aura2Color`) instead of hardcoded labels.
- Added Aura 1 Shape/Tint rows to settings output and backed them with default state values (`Aura1Shape`, `Aura1Color`).
- Default heal/hurt custom FX definitions are now synchronized proactively on install/reset and when FX colors change, preventing delayed/stale visual updates after color edits or token lifecycle events.

---

## [1.7.1] – 2025-02-16

> **Note:** This version was sourced from a [Roll20 forum post](https://app.roll20.net/forum/permalink/12236299/) by [Surok](https://app.roll20.net/users/335573). It was never submitted to the Roll20 GitHub API scripts repository.

### Added
- Added `LISTFX` command/button that displays a graphical menu listing custom FX objects with their IDs.

### Changed
- Updated FX effects: damage/healing FX now use the simpler DeathTracker approach — damage uses the `HurtFX` type (default `splatter-blood`) and healing uses the `HealFX` type (default `glow-holy`).

---

## [1.6.1] – 2020-08-20

- Maintenance release. Bug fixes and minor state schema updates.

## [1.6.0] – 2020-08-19

- Added per-character `USEBLOOD` attribute support for custom FX colours and named custom FX overrides.

## [1.5.1] – Earlier

- Added `USECOLOR` per-character attribute to disable aura/tint on individual
  tokens.

## [1.4.1] – Earlier

- Added heal FX support (`-DefaultHeal` custom FX, `HealFX` colour setting).

## [1.3.2] – Earlier

- Aura size setting (`AuraSize`) and `OneOff` mode added.

## [1.3.1] – Earlier

- Death sound FX (`auraDeadFX`) introduced.

## [1.3.0] – Earlier

- NPC/PC split for dead marker and aura percentage threshold.

## [1.2.0] – Earlier

- Initial public release. Basic red-to-green aura/tint health indicator with
  GM menu via `!aura`.
