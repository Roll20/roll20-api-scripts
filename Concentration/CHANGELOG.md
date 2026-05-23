# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-23

### Added

- Dedicated legacy and Beacon spell-detection paths.
- Support Mode for debug output with two levels:
  - Basic: short support-friendly diagnostics.
  - Detailed: structured diagnostics for troubleshooting.
- Pending roll ID flow for Roll and Advantage buttons.
- Pending roll cleanup for expired entries.
- Guarded CON save modifier lookup helper.
- Documentation set for compatibility and testing:
  - `docs/beacon-compatibility.md`
  - `docs/troubleshooting.md`
  - `docs/testing-checklist.md`

### Changed

- Updated script and package versioning to `1.0.0`.
- Hardened Beacon matching heuristics for concentration spell cards.
- Improved character resolution using character ID first, then exact-name fallback.
- Preferred represented tokens on the caster's current page before global fallback.
- Refreshed README and metadata for current Roll20/Beacon behavior.
- Refactored API input handling into dedicated parse/dispatch helpers.
- Refactored HP-loss concentration flow into focused reminder/button/tracking helpers.
- Added JSDoc typedefs and function docs for core detection, command, roll, and config flows.

### Fixed

- Fixed selected-token manual toggle whisper targeting for character mode.
- Prevented brittle regex indexing assumptions on unmatched spell content.
- Improved marker-change loop protection using tracking keys.
- Added safer marker removal behavior for represented and unlinked tokens.
- Improved handling of missing or expired pending roll IDs.

### Security

- Validates API command and config input values before applying state changes.
- Escapes dynamic chat-rendered values to reduce markup injection risk.

## [0.2.0] - 2024-06-02

### Changed

- Updated script behavior to work with Beacon sheets.

## [0.1.14]

### Changed

- Updated autoroll advantage behavior.

### Fixed

- Fixed crash when processing very high damage values.

## [0.1.13]

### Added

- Optional autoroll with advantage.
- Optional roll button when autoroll is disabled.

## [0.1.12]

### Added

- `!concentration` accepts an additional spell-name argument.
- Players can use `!concentration` for characters they control.

## [0.1.11]

### Changed

- `!concentration` with selected tokens toggles the concentration status marker.

## [0.1.10]

### Fixed

- When autoroll is enabled and the save fails, the concentration marker is removed automatically.

## [0.1.9]

### Added

- Optional auto-roll saves.

## [0.1.8] - 2018-05-01

### Fixed

- Bugfix.

## [0.1.7] - 2018-04-28

### Fixed

- Removes status marker from all represented objects when concentration is removed.

## [0.1.5] - 2018-04-25

### Fixed

- Correct whisper target on spell-cast concentration check.
