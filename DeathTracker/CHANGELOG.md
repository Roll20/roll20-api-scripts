# Changelog

## 1.0.0 (2026-11-04)

A full rewrite by MidNiteShadow7 of Robin Kuiper's DeathTracker 0.1.8, which had not changed since 2018. Version 0.1 settings are carried over and `!dead` still works.

### Fixed

- Clearing a token's hit point bar marked it dead (an empty bar was read as 0). Empty bars, and bars that do not hold a number, are now left alone.
- A token with no maximum hit points got a broken tint (`#NaNNaNNaN`). Tint now needs a maximum, and a linked bar with no maximum reads it from the linked attribute.
- Tokens controlled by more than one player, or by "all", were wrongly treated as NPCs or PCs, because the whole `controlledby` list was checked as one player.
- Only Roll20's old built-in markers could be chosen. Any marker in the game can now be used, including custom marker sets and the D&D 2024 sheet's condition markers, found by name or tag.
- Changing the hit point bar said the sandbox had to be restarted. It does not, and the message is gone.
- The "half dead" marker set to none wrote a junk `status_none` property onto tokens.
- At full hit points the tint was set to transparent, wiping a tint the GM (or another Mod) had set. The token's own tint now comes back.
- Settings typed in chat were stored without checking (`bar|7`, `true` as text). Bad values are now refused with a message.
- One Mod's failing `ObserveTokenChange` handler stopped DeathTracker and every later handler. Handlers are now called one at a time, and failures are logged.

### Added

- **Death saves** for player characters, as in HealthColors: a PC at 0 is **Dying**; three successes make it **Stable**, three failures **Dead**. On the D&D 2024 sheet they are read from the sheet as boxes are ticked or saves rolled; on the 2014 sheet and others, from checkbox fields set in Settings. A **DeathSaves** token action (`!deathtracker macro`) covers sheets that cannot be read. Saves are counted from the drop to 0, because sheets keep old ticks; **Clear sheet boxes** clears them at the drop and on healing, and on the D&D 2024 sheet shows the death save boxes when a PC drops to 0 from the token bar (the sheet only shows them by itself after its own Damage box).
- **Who is a PC**: player-controlled tokens or characters, or (by default) characters whose sheet is not an NPC sheet, plus **Make PC** / **Make NPC** per character.
- **Bloodied** threshold setting (50% by default, 0.1's "half dead").
- **When a token dies** (each off by default): move it to the GM layer or the Map layer, and remove it from the turn order, for NPCs or for everyone. **Restore** puts selected tokens back, into the turn order with the initiative they had.
- **Massive damage** option for PCs.
- Announcements to the GM and the PC's players when a PC goes down, becomes stable, dies or gets back up.
- A chat menu, a settings card with buttons for every setting, `status`, `check`, `stable`, `clear`, `restore`, `markers` and `--ids`.
- **DeathTracker - Help** and **DeathTracker - Command Deck** handouts, in 24 languages.
- One-Click options for every setting.
- A public API: `check`, `getStatus`, `onStatusChange`, `isManagingDeathSaves`, alongside 0.1's `ObserveTokenChange`.
- Commands from other Mods (player "API") are accepted.

### Changed

- The main command is `!deathtracker` (also `!dt`); `!dead`, `!dead config key|value` and `!dead reset` still work.
- Settings live in `state.DeathTracker`; 0.1's `state.DEATHTRACKER` is read once and left in place.
- The PC Unconscious marker is now the Dying marker.
- With HealthColors installed, a new install starts with DeathTracker's tint and effects off.

## 0.1.8

- Tint config expanded.

## 0.1.7

- TokenMod support by The Aaron.

## 0.1.6

- Optionally FX on HP gain (heal).

## 0.1.5

- Optionally adjust tint colour on HP loss/gain.
- Optionally FX on HP loss.
