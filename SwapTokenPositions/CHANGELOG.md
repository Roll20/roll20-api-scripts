# Changelog

All notable changes to the **SwapTokenPositions** script will be documented in this file.

## [2.1.0] - 2026-05-19 · [Milestone](https://github.com/steverobertsuk/roll20-api-scripts/milestone/4)

### Added

- Explicit token targeting via `--token1 <id|name>` and `--token2 <id|name>` flags.
  - Both flags must be provided together; omitting one produces a clear usage error.
  - Each input resolves by token ID first, then by token name on the active page.
  - Ambiguous name matches (multiple tokens with the same name) are rejected with guidance to use a token ID.
  - Cross-page explicit pairs are rejected the same as cross-page selection pairs.
- `parseFreeStringFlag` parser utility to handle quoted (space-containing) and unquoted string values.
- Explicit token access control via three new GM-only management commands (take effect immediately, no `--save` required):
  - `--token-input-access <gm-only|all-players|selected-users>` — sets who may use `--token1` and `--token2`.
  - `--token-input-users <id|name,...>` — replaces the allow-list with the specified players (resolved by ID then display name).
  - `--token-input-users-remove <id|name,...>` — removes specific players from the allow-list.
  - Default mode is `gm-only`. The GM is always permitted regardless of mode.
  - `--show-settings` now includes `Token Input Access` and (in `selected-users` mode) `Token Input Users`.
- `parseCommaListFlag` parser utility for comma-separated quoted and bare values.

### Developer

- Build process now automatically syncs `package.json` version from `script.json` on each build.
- Build process now auto-increments the trailing build number on pre-release versions (e.g. `2.1.0.beta.0` → `2.1.0.beta.1`) so the version is always up to date after each `npm run build`. Release versions (`major.minor.patch`) are not auto-incremented.
- Versioned archive folder now uses the base semver (`major.minor.patch`) rather than the full pre-release string, so pre-release builds update the same folder in place.

## [2.0.0] - 2026-04-24

### Added

- New staged FX pipeline with explicit origin, travel, and destination phases.
- New FX flags: `--origin-fx`, `--travel-fx`, `--destination-fx`.
- New timing flags: `--origin-time`, `--travel-time`, `--destination-time`, `--swap-delay`, `--destination-delay`.
- New travel visibility flag: `--travel-mode` with values `normal` and `invisible`.
- Preset system with `portal`, `lightning`, `shadow`, `fire`, `magic`, `transport`, and `none`.
- `--instant` flag to force immediate swap.
- Backward-compatibility parsing for legacy flags with deprecation warnings.
- Modular multi-file source structure under `src/`.
- Local build tooling (`rollup`) to generate single-file artifacts for Roll20.
- Build banner metadata in generated output, including build timestamp.
- Explicit same-page validation for selected tokens before swap.
- Delayed pipeline safety checks that cancel gracefully if tokens disappear mid-sequence.

### Changed

- Refactored internal architecture from a monolithic file to source modules with a generated bundle.
- Replaced the v1 mode-centric flow (`--mode` + repeated beam cycle) with a staged pipeline (`origin -> travel -> swap -> destination`) driven by stage FX and timing flags.

### Deprecated

- `--mode` (mapped for compatibility: `beams` -> `--preset lightning`, `transport` -> `--preset transport`)
- `--duration` (replaced by `--swap-delay`)
- `--beam-fx` (replaced by `--travel-fx`)
- `--burst-fx` (replaced by `--destination-fx`)

## [1.0.0] - 2026-04-21

### Added

- Arcane-themed styled messaging for whispers and announcements.
- Persistent state management for GM settings (saves between sessions).
- One-time override support for duration, animation mode, and FX types.
- New `--install-macro` command to automatically create a "SwapTokens" macro.
- "Beams" and "transport" animation modes with customizable beam FX.
- "Transport" animation mode for immediate magical relocation.
- New `none` option for beam and burst FX to allow for silent, instantaneous swaps.
- Strict selection validation with clear feedback on required token counts.
- Silent management commands (Help/Settings) that don't require token selection.
- Improved whisper delivery using reliable player display name resolution.

### Fixed

- None - initial release does not have any reported issues.
