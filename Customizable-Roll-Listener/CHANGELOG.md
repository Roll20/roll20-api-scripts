# Changelog

## [2.0.0] – 2026-10-29

A full rewrite by MidNiteShadow7 of Scott C.'s Customizable Roll Listener, which was reported as working on some chat output but not all, especially since Beacon sheets arrived, and is no longer supported.

### Fixed

- Listeners with a roll result (`roll=critical` and so on) no longer fail with "CRL ERROR ||| Ability: … was not parseable". Version 1 crashed on any roll containing a modifier, a group or a comment, and on text without `##`, then skipped the listener and logged the error on every chat message.
- A roll result without text now checks the rolls. Version 1 skipped the check, so such listeners triggered on every message using the template.
- `##` finds inline rolls at any position. Version 1 only found the first ten (`$[[0]]` to `$[[9]]`), so long roll templates were missed, and only converted the first `##` in each piece of text.
- Text is plain text unless a listener asks for a regular expression. Version 1 used it as a regular expression, so text containing `(`, `+`, `?`, `.` and similar characters silently matched something else.
- Dropped dice (advantage, disadvantage, `kh`/`kl`) and rerolled dice no longer count as crits or fumbles.
- Damage dice rolling their highest face are no longer crits when a d20 was rolled (configurable per listener).
- A roll exactly on its target is a success and not also a failure.
- Rollable table results can be matched as text.
- `/roll` results (`rollresult` and `gmrollresult` messages) are read.
- Rolls from Beacon sheets such as D&D 2024 are read: they arrive as `advancedroll` roll cards with no inline rolls or template name, so CRL reads the template, character, title and each roll from the card.
- Inline rolls and roll templates typed into a `!crl` command are kept in the listener's commands instead of being rolled once and lost.
- Multi-line commands are sent one message per line, as a macro would be, instead of as one message.
- Malformed commands, missing listeners and commands from other mods no longer crash the Mod sandbox; problems are whispered to the GM with a hint.
- CRL no longer reacts to its own menus, and a listener that keeps triggering itself is switched off instead of looping.
- Listener names may contain commas, and any field can be cleared.
- GM cards never spill into public chat. Roll20 whispers only the first line of a message and posts the rest publicly, so listener cards with multi-line commands and the inspector's extra message data used to leak; cards are now kept on one line.
- Menus no longer go missing: text shown in chat has `@{…}`, `%{…}`, `[[…]]` and `?{…}` encoded, because Roll20 drops a mod's whole message when it cannot resolve them.
- The help no longer says that `\\config` deletes a listener.
- Upgrading no longer wipes the mod's state when the schema changes.

### Added

- Chat menus with a card per listener and buttons to change every setting, and a **Command Deck** handout.
- **Help** handout, and documentation (README, TESTING, DEVELOPERS, MOD_FILE_MAP), including how to find a sheet's roll template names, the templates of common sheets and links to Roll20's roll template articles.
- New `!crl <command> --option value` syntax. Listeners can be named by name or ID.
- Filters for message types, speakers / characters (including the character in the roll template) and players.
- Roll checks for totals and natural die results (`>=15`, `<=2`, `19-20`), and a choice of which dice to check.
- Placeholders in commands: `${who}`, `${character}`, `${player}`, `${template}`, `${total}`, `${natural}`, `${result}`, `${expression}`, `${table}`, `${listener}` and `${field:name}`.
- Commands can be sent as CRL or as the character who rolled, per listener or as a setting.
- Per-listener on/off switch, cooldown, ordering and "stop after this one".
- `!crl inspect`: explains the next chat message (type, template and fields, every roll with its dice, the text listeners search) and why each listener did or did not trigger. Useful for Beacon sheets such as D&D 2024.
- `!crl test`: runs a listener's commands with sample values.
- Option to ignore chat sent by other mods.
- Listener rules are mirrored into each ability's description, so listeners survive copying the game.
- Public API for other mods: `CRL.analyse`, `CRL.matches`, `CRL.onMatch`.
- Translations into 23 languages, chosen with a language setting.

### Changed

- Text matching ignores upper and lower case.
- `fail` means a target roll with no successes.
- Version 1 listeners are converted automatically; the version 1 `\\create`, `\\edit`, `\\delete`, `\\config` and `\\set` commands still work.
- Source split into ES modules under `src/`, bundled with Rollup and tested with the Node test runner.

## [1.1] – 2020-07-20

- Fixed crit and fumble matching (The Aaron).

## [1.0] – 2016-11-17

- First release by Scott C.
