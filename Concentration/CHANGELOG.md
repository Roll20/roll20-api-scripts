# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-11-02

Brings Concentration up to the standard of the other Mods maintained by MidNiteShadow7. Version 1.0 settings, macros and commands keep working.

### Fixed

- Ending concentration posted nothing, so the last line in chat was often the earlier "is now concentrating on …" message, which read as if ending had started it again. Every way concentration ends now says so, and on which spell.
- Players clicking a reminder's Roll or Advantage button started or ended concentration on whatever token they had selected instead of rolling. The buttons now roll for the GM and the token's players.
- Damage was compared as text, so a bar going from 10 to 9 was not seen as damage. Bar values are compared as numbers.
- The One-Click settings on the Mod's page were never read. They now apply on startup when changed.
- Changing the HP Bar needed a restart.
- A failed save on one goblin took the marker off every token made from the same sheet. Unlinked tokens now concentrate on their own.
- Send Reminder To `character` whispered to the first word of the token's name. Whispers now go to the character by its full name, with a copy to the GM.
- 5e OGL spell cards that list `charname` before `name` gave the caster's name as the spell.

### Added

- End messages: "is no longer concentrating on …", "loses concentration on …" after a failed save, and "drops to 0 hit points and loses concentration on …".
- Spell switching: naming a different spell, or casting another concentration spell from a sheet, switches to it and says so.
- Putting the marker on or taking it off by hand starts or ends concentration, with a message.
- **End at 0 HP** setting (on by default): concentration ends without a save at 0 hit points.
- Save DCs stop at 30, as in the 2024 rules.
- `end` and `status` commands, with End buttons on the status card; `help` and `journal`.
- **Concentration - Help** and **Concentration - Command Deck** handouts (GM only).
- Custom token markers can be the Status Marker; changing it moves the marker on concentrating tokens.
- Commands from other Mods (playerid `API`) are accepted, and a `globalThis.Concentration` API (`isConcentrating`, `spellOf`, `start`, `end`, `list`).
- Translations into 24 languages, with a **Language** setting.
- D&D 2024 spell cards use the message's character ID when Roll20 provides it.
- Deleting a concentrating token ends its concentration; new linked tokens of a concentrating character get the marker; pasted marked tokens are tracked.

### Security

- Spell cards only start concentration for characters the sender controls (or from the GM and other Mods); version 1.0 let anyone mark any character by posting a card with its name.

### Changed

- A D&D 2024 card that only mentions concentration in its text can start concentration but no longer counts as casting a concentration spell over an existing one. Repeated cards for the current spell are ignored.

- New chat cards in the same style as the other Mods, with the settings as buttons in one card.
- `reset` asks for confirmation and keeps who is concentrating.
- Source split into ES modules under `src/`, bundled with Rollup; Node tests run the bundle against a Roll20 stub.
- `docs/` folded into `README.md`, `TESTING.md` and `DEVELOPERS.md`.

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
