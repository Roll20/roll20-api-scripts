# HealthColors Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] – 2026-04-08

Major modernization and stability refactor of the entire script, consolidating performance improvements, critical bug fixes, and new user control features. This version represents a complete overhaul from the v1.6.x series.

### Added
- **Respect Manual Overrides** — the script now only updates visual properties (Aura 1) when a token's internal health bar actually changes. This allows for manual customization of colors, radii, and shapes via the token settings dialog without script interference during movement.
- **Persistent Default Auras** — tokens at 100% health now default to a clean **Green** Aura 1 (at the configured `AuraSize`) to indicate stability.
- **JSDoc Documentation** — every function is now fully documented with parameter types, return values, and behavioral descriptions to improve maintainability.
- **Centralized Configuration** — all default state values, FX definitions, and internal parameters are now managed via unified constants.

### Changed
- **`_` (Underscore) dependency** — no longer required.
- **`buttonColor` function** — legacy function completely removed after
  verifying no external or internal dependencies; superseded by `nameBtn`.
- **Tautological FX condition** `(UseBlood !== "OFF" || UseBlood !== "NO")`.

### Fixed
- Consistent casing for `checkInstall` and `handleToken` throughout.
- Initialization of `OneOff` state key to prevent `undefined` collisions.
- Corrected logic in `playDeath` to ensure jukebox tracks are properly stopped
  before restarting.
- Page scale calculation and aura radius math standardized for better precision.


---

## [1.6.1] – 2020-08-20

- Maintenance release. Bug fixes and minor state schema updates.

## [1.6.0] – 2020-08-19

- Added per-character `USEBLOOD` attribute support for custom FX colours and
  named custom FX overrides.

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
