# Changelog

## 1.0.2

### Added

- The Config section of the Command Deck now has a **Language** button, which opens a drop-down of all 24 languages, and a table of the languages available (flag and code, English name, native name), as in the other MidNite Shadow mods. Its description already said the language could be chosen there.
- README: a Languages section, and the language setting in the configuration table.
- A Preset Reference at the end of the README and of the Command Deck (All and Scaling tabs): tables of every party and boss preset, with what each changes and a worked example (a 40 HP, AC 15 monster that deals 20 damage). The deck builds its tables from the preset data, so they always match.

### Changed

- The Command Deck and Status handouts now look like CED's chat replies: the same card, title bar, buttons and label/value rows. The Status handout's tables no longer pick up Roll20's handout table borders and white background, and minions show their hit points as "= 1" instead of "-999%".

### Fixed

- Auto-number Selected (`!ced reinforce enumerate`) now understands names Roll20's own Advanced Transform > Enumerate Tokens has numbered, such as "Goblin 3 (1)". Before, it kept "(1)" as part of the name and gave "Goblin 3 (1) 1".
- Changing the language with `!ced config language` now rewrites the Command Deck in that language straight away. Before, only chat replies changed until the deck was next rebuilt.

## 1.0.1

### Added

- Legacy command compatibility for `!director` when no conflicting Director mod is detected.

### Changed

- Primary command changed from `!director` to `!ced` to avoid command collisions.
- Localized help and error hints now reference `!ced` in command examples.
- Command Deck and Status handouts now consistently render with the intended dark theme.
- One-Click language configuration is now a select list with all supported locale options.

### Fixed

- If a conflicting Director mod is installed, using `!director` now warns the GM to use `!ced`.

### Developer Notes

- Technical implementation details for 1.0.1 are documented in `DEVELOPERS.md`.

## 1.0.0 (initial release)

### Added

- **Party scaling** — scale HP, AC, and damage by party-size presets (Solo through Massive Table) or custom percentages.
- **Boss tools** — Minion, Elite, Boss, and Legendary presets applied to selected tokens.
- **Reinforcements** — duplicate selected tokens ×2 / ×3 / ×5 / custom with auto-positioning; auto-enumerate selected tokens.
- **Battlefield control** — move selected tokens to Token / GM / Map layer; hide and reveal shortcuts.
- **Position saving** — save and restore token positions per-token.
- **Encounter templates** — save/load/delete named encounter snapshots (positions, layers, HP/AC values).
- **Reset & recovery** — restore any modified token to its original values (selected, page, or all).
- **Status reporting** — generate an HTML status report in the Combat Encounter Director - Status journal; filter by selected or changed tokens.
- **Journal control panel** — all features accessible via the Combat Encounter Director handout with one-click action buttons.
- **Configuration** — configurable HP bar (bar1/bar2/bar3) and AC bar (bar1/bar2/bar3/none) via `!ced config` or Roll20 One-Click useroptions.
- **Internationalisation** — full i18n system with `t(key, locale, vars)` lookup; 24 supported locales (af, ca, zh-TW, cs, da, nl, en-US, fi, fr, de, el, he, hu, it, ja, ko, pl, pt-PT, pt-BR, ru, es, sv, tr, uk); active language configurable at runtime via `!ced config language <code>` or the One-Click `language` useroption; falls back to `en-US` for any missing key.
- **Locale sync script** — `npm run sync-locales` / `npm run regenerate-locales` using Google Translate with placeholder masking to translate all locale files automatically.
