# Changelog

## 1.1.0 - 2026-11-19

### Added

- The **Pathfinder 1E track** setting (`pf1Track`): fast, medium or slow, or tracks that change by level, such as `fast 1-3, medium 4-13, slow 14+`. A character advances on the track for the level they are on now. The XP for the next level is written to the sheet's next-level box after each award, so the sheet and the level-up notices agree. `sheet` reads the box as the GM types it instead. The settings card has a track button and a **Mixed** button for tracks by level, and there's a One-Click option.

### Changed

- On Pathfinder 1E sheets the next-level box is now written by the Mod, from the medium track unless the setting says otherwise. Set **Pathfinder 1E track** to `sheet` to keep typing it yourself.
- `!lazyxp show` uses the same XP for the next level as the level-up notices.

### Fixed

- The next-level boxes on the Pathfinder 1E (both sheets) and Starfinder sheets were never read. Roll20 keeps them as the max of the XP attribute, not as attributes of their own, so the level tables were always used.

## 1.0.0 - 2026-11-19

A rewrite of Robin Kuiper's 0.1.14. Existing games are upgraded automatically.

### Added

- Game-system profiles, picked per character from its sheet. Each was tested in Roll20 except where noted, and the README lists them under Supported sheets:
  - D&D 5E 2024 (Beacon, read and written with `getSheetItem`/`setSheetItem`)
  - D&D 5E 2014 and 5e Shaped
  - Pathfinder 1E (Roll20 and Community) and Pathfinder 2E
  - Starfinder, Old-School Essentials, Dungeon Crawl Classics and Dungeon World
  - WFRP 4E (XP ledger rows; partly supported, as the sheet does not recalculate its totals), Shadowrun 5E/6E (karma) and Cypher
  - Savage Worlds, 13th Age, Cosmere (not tested) and Call of Cthulhu, which have no XP: awards are refused with a warning
  - A custom profile with your own field names and level table
- Roll20's own party (Jumpgate's Party Member) as the roster, falling back to characters controlled by players. `party add`/`remove` ticks Party Member from chat.
- Defeated creatures, noticed in the same way as HealthColors:
  - the HP bar dropping to 0 (on the token, on its linked attribute, or through TokenMod)
  - the defeated marker (built-in or custom)
  - DeathTracker 1.0's dead status

  The GM is asked first, or the XP is added automatically. Creature XP comes from the sheet's XP value, the challenge rating, or (Pathfinder 2E) the level difference.

- Fair splits: absent characters (with an Absent share), per-character shares, bonus XP and `give`. XP that doesn't divide evenly carries over.
- Level-up notices from each system's level table or next-level field, sent once per level.
- The LazyExperience - Session Log handout, newest session first, and per-player whispers of each character's XP at the end of a session.
- Help and Command Deck handouts, chat menus for the session, party, settings and status, 24 languages, One-Click options and a public API for other Mods.

### Changed

- The main command is now `!lazyxp` (and `!lazyexperience`). `!xp` still works unless EasyExperience or ExperienceTracker, which also use it, is installed. A custom command from 0.1 keeps working.
- Characters controlled only by "All players" (such as helper tokens) no longer share XP.
- Sheets are updated by default on new installs; upgraded games keep their setting.

### Fixed

- Nothing was written to D&D 2024 sheets.
- Adding XP to a character controlled by "all" or by several players crashed the Mod.
- Characters controlled by "all" were counted once for every player.
- Refreshing characters left gaps in the list, so some characters were skipped.
- Instant XP wasn't rounded and divided by zero when nobody was active. Text in an XP box became NaN.
- The defeated prompt could appear twice, and appeared for player characters.
- Whispers went to the first word of a character's name.
- The player card always showed 0 XP. The help listed two commands, and `show` was titled Help.

## 0.1.14 - 2020-04-20

Bug fixes by The Aaron.

### Fixed

- XP from sheets and chat is read as a number, so text such as "1,800" or a blank field no longer breaks the sum when sheets are updated.
- Code tidy-ups found by a linter: each `case` in the command handler has its own block, missing semicolons were added, unused variables removed, and the other Mods it calls (TokenMod, DeathTracker, StatusInfo) are declared as globals.

## 0.1.13 - 2018-10-10

### Fixed

- Giving XP to a character no longer crashes when its token is not controlled by a player; the GM is told instead.

## 0.1.12 - 2018-05-08

### Added

- Works with StatusInfo: the dead marker set by StatusInfo is noticed.

### Fixed

- The dead-marker check now looks only at the configured marker, so other marker changes no longer trigger it.
- Refreshing players no longer crashes when a player has left the game, and removed players are really removed.

### Changed

- Patreon and PayPal links added to the header.

## 0.1.11 - 2018-04-20

### Changed

- Characters are found by who controls them, including characters controlled by "All players", rather than by journal access.
- Chat cards are no longer kept in the chat archive.

### Fixed

- Giving XP straight away (Give XP Instant) no longer fails.

## 0.1.7 - 2018-04-17

- First release in the Roll20 Mod library: a session XP pool, divided between active players' characters, with a config menu, per-player and per-character settings, extra players and optional sheet updates.
- Earlier builds (from 0.1.5, 2018-04-16) were in Robin Kuiper's own repository and already offered to add a creature's XP when DeathTracker or TokenMod put the dead marker on its token.
