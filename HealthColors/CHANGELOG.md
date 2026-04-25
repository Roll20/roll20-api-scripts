# HealthColors Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

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
- **Public Settings Snapshot** — setting-changing `!aura` commands now post a read-only settings panel to game chat for table visibility.
- **Aura Detail Commands** — added `!aura a1shape`, `!aura a1tint`, `!aura a2size`, `!aura a2shape`, and `!aura a2tint` to adjust displayed Aura 1/Aura 2 detail values from chat.
- **Settings Output Command** — added `!aura settings` to post the current settings snapshot to game chat on demand.

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
- Prevented duplicate settings output: setting-changing commands now publish a single game-chat snapshot instead of both GM and public panels.
- Aura 2 output values are now sourced from state-backed defaults (`Aura2Size`, `Aura2Shape`, `Aura2Color`) instead of hardcoded labels.
- Added Aura 1 Shape/Tint rows to settings output and backed them with default state values (`Aura1Shape`, `Aura1Color`).
- Default heal/hurt custom FX definitions are now synchronized proactively on install/reset and when FX colors change, preventing delayed/stale visual updates after color edits or token lifecycle events.


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
