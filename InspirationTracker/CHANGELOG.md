# Changelog

## 1.0.0 (2026-11-04)

A rewrite by MidNiteShadow7 of Robin Kuiper's InspirationTracker, which was reported as not working with the D&D 2024 sheet.

### Fixed

- Inspiration on the D&D Fifth Edition (5E & 5.5E, 2024) sheet is now read and written. 0.1.4 looked for an `inspiration` attribute with `findObjs`, which cannot see Beacon sheets, so every toggle answered "Could not find attribute named: inspiration", markers added by hand never reached the sheet, and ticking the box on the sheet never showed the marker. The 2024 sheet is now read and written with `getSheetItem` and `setSheetItem`, and changes on the sheet are noticed through its `store` attribute.
- A 2014 OGL character whose Inspiration box had never been ticked has no `inspiration` attribute yet; giving it inspiration now creates the attribute instead of failing.
- Tokens on every page get the marker and the special effect, and the effect plays on the page the token is on.
- The marker list was fixed in the code; it now comes from the game's own token marker sets.

### Added

- **Player spending**: players spend inspiration for characters they control with a **Spend** button or the **Inspiration** token action (`!inspiration macro`). The GM is told who spent it, with an **Undo** button. Clearing the box on a sheet or taking the marker off a token counts as a spend too.
- **Heroic Inspiration wording**: characters on the 2024 rules say Heroic Inspiration, those on the 2014 rules say Inspiration, following each D&D 2024 sheet's rules setting. The **Wording** setting can force either.
- **Passing it on (2024 rules)**: a character who would gain Heroic Inspiration while having it can give it to a party member who does not have it.
- **Party overview** (`!inspiration party`) with Give, Remove and Spend buttons, and `party add` / `party remove` to change who is in it. Players can be allowed to see it.
- **Points pools**: set **Tracking** to **Points pool** to track inspiration as points that build up and are spent a few at a time, with `give`, `remove` and `spend <points>`, and **Boost** (`boost <bonus>`) to spend points for a bonus to a roll at the pool's cost per +1. The points are kept in the sheet's resource box that has the pool's name, or in a plain attribute, so pools work on any sheet. The GM can rename the default pool and add more (`!inspiration pools`), for hero points, luck and the like, used with `--pool <name>`.
- **Custom token markers**: any marker from the game's marker sets, stored by tag.
- `give`, `remove`, `toggle`, `spend`, `undo`, `sync`, `status`, `set`, `reset`, `help` and `journal rebuild` commands, and `--ids` to act on tokens or characters by ID.
- Settings for who sees announcements, player spending, the player overview and passing on.
- Help and Command Deck handouts, and menus, messages and handouts in 24 languages.
- Commands from other Mods, and an API: `InspirationTracker.give`, `spend`, `remove`, `isInspired`, `points`, `givePoints`, `spendPoints` and `ObserveTokenChange`.

### Changed

- The command is always `!inspiration`. A command name chosen in 0.1.x keeps working alongside it.
- Settings live in `state.InspirationTracker`. The marker, special effect and effect type are copied from 0.1.x, whose state is left in place.

## 0.1.4 (2018-04-29)

Robin Kuiper. Adding the marker by hand or with TokenMod gives inspiration; optional special effect; `!inspiration` toggles inspiration on the selected tokens.

## 0.1.2 (2018-04-28)

Robin Kuiper. Fixed an error when giving inspiration.
