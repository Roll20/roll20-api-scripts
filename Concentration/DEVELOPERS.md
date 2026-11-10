# Concentration — Developer Guide

## Project Layout

| Path                         | Purpose                                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| `src/`                       | ES module source. `src/index.js` is the Rollup entry point.        |
| `src/locales/locale/*.js`    | Translations. `en-US.js` is the source; the others are generated.  |
| `tests/`                     | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.    |
| `scripts/`                   | Build, version bump and locale sync scripts.                       |
| `Concentration.js`           | Generated bundle for the One-Click library. Do not edit.           |
| `<version>/Concentration.js` | Generated snapshot for each released version from 1.1.0.           |
| `0.1.5/` … `1.0.0/`          | Earlier releases, kept for the One-Click version list. Never edit. |
| `script.json`                | One-Click metadata and useroptions.                                |
| `images/`                    | Screenshots of version 1.0, kept for older links.                  |

## Building

```bash
npm install
npm run build              # bump the patch version, then build
npm run build -- 1.2.0     # set a version, then build
npm run build -- --no-bump # build without changing the version
npm test
npm run format
```

The build writes `Concentration.js` and `<version>/Concentration.js`; keep them byte-identical in every commit. `scripts/bump-version.mjs` keeps the last five stable versions in `previousversions`.

## Module Responsibilities

| Module         | Responsibility                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `index.js`     | Event registration, startup (`checkInstall`), public `Concentration` API.                             |
| `commands.js`  | Chat input: spell-card detection hand-off, `!concentration` routing, settings, status, advantage.     |
| `tracker.js`   | Concentration records and markers: start, switch, end, hand-made marker changes, reconcile, audience. |
| `saves.js`     | Damage detection, DC, save modifier lookup, rolling, reminders and Roll/Advantage buttons.            |
| `detect.js`    | Finds concentration spells in 5e OGL (`spell` template) and D&D 2024 (`advancedroll`) chat output.    |
| `state.js`     | Persistent state, settings validation, version 1.0 migration, One-Click useroptions, pending rolls.   |
| `journals.js`  | Help and Command Deck handouts.                                                                       |
| `chat.js`      | Chat cards, buttons, whispers, warnings and errors; keeps every message on one line.                  |
| `text.js`      | Translation helpers bound to the Language setting (`tr`, `rich`, `dirStyle`).                         |
| `debug.js`     | Debug Mode notes in the API console (English only), in Basic or Detailed form.                        |
| `i18n.js`      | Translation lookup (`t`, `tRaw`), locale normalisation and text direction. Shared with other Mods.    |
| `constants.js` | Build placeholders, defaults, limits, help table, default marker list and colours.                    |
| `utils.js`     | Small helpers: HTML escaping, parsing, markers, controllers.                                          |

`detect.js` and `state.js` only touch Roll20 globals inside functions, so `tests/detect.test.mjs` and `tests/state.test.mjs` import them directly. There are no circular imports.

## How Concentration Is Stored

`state.CONCENTRATION.concentrating` maps a **key** to `{ spell, name, since }`:

- A token that represents a character and whose HP Bar is **linked** uses the character ID, so every token of that character (on any page) shares concentration and shows the marker.
- Any other token uses its own token ID, so a pack of goblins made from one sheet concentrate on their own.

The marker on the map and the record are kept in step: `startConcentration` and `endConcentration` change both, the `change:graphic` handler follows markers added or removed by hand, and `reconcile` runs on startup (and after the HP Bar changes) to add records for marked tokens and drop records with no marked token. API changes raise no Roll20 events, so the Mod's own marker changes never loop back.

## Messages

Every start, switch and end goes through `announce` in `tracker.js`, so no path can end concentration silently. Notices have a `NoSpell` variant for concentration without a named spell. `rich()` escapes the translated text and puts each value in bold, so names and spells can never inject HTML or Roll20 syntax (`@{}`, `[[ ]]`), which `sendChat` would otherwise resolve.

Audience comes from Send Reminder To: `''` for everyone, `gm`, or the character's name in quotes plus a GM copy. `chat.oneLine` removes line breaks, because Roll20 only whispers the first line of a message.

## Saves

`handleDamage` compares the HP bar as numbers, ignores healing and tokens that are not concentrating, ends concentration at 0 hit points when End at 0 HP is on, and treats the same change (same before and after) to the same key within one second as one hit, because a linked bar changes every token of a character. Otherwise it works out the DC (`clamp(floor(damage / 2), 10, 30)`), reads the modifier and either rolls (`[[1d20]] [[1d20]]` through `sendChat`, the second die used for advantage) or sends a reminder with buttons. Pending rolls live in state for 10 minutes and work once; `rollPending` checks the clicker controls the token (only the GM once the token is gone) before using one up, and treats a button for concentration that has since ended as expired.

New tokens (`add:graphic`, handled after a short delay because Roll20 fills in a new token's properties afterwards) and changes to a token's bar link or `represents` go through `syncToken`, which marks new linked tokens of a concentrating character and gives marked tokens without a record one, carrying the spell over from the token's other key. Deleting a token ends concentration when it was the token's own, or the character's last token.

`detectBeaconSpellCast` sets `weak` when a card matched only by the word "concentration"; `handleSpellCast` never lets a weak match replace a named spell, and only acts for senders who control the caster.

## Translations

Edit `src/locales/locale/en-US.js`, then run `npm run sync-locales` to translate new or changed keys into the other 23 locales with Google Translate (`--keys a.b,c.d` to redo specific keys, `--dry-run` to preview). Check each locale afterwards for strings left identical to English, and for game terms translated literally. Then update the Help handout text if the README changed.
