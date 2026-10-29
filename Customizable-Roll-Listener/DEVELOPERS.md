# Customizable Roll Listener — Developer Guide

## Project Layout

| Path                      | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| `src/`                    | ES module source. `src/index.js` is the Rollup entry point.        |
| `src/locales/locale/*.js` | Translations. `en-US.js` is the source; the others are generated.  |
| `tests/`                  | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.    |
| `scripts/`                | Build, version bump and locale sync scripts.                       |
| `CRL.js`                  | Generated bundle for the One-Click library. Do not edit.           |
| `<version>/CRL.js`        | Generated snapshot for each released version.                      |
| `1.0/`, `1.1/`            | Scott C.'s original releases, kept for the One-Click version list. |
| `script.json`             | One-Click metadata and useroptions.                                |

The script file keeps version 1's name, `CRL.js`, so One-Click upgrades replace it.

## Building and Testing

```bash
npm install
npm run build -- --no-bump   # build CRL.js and 2.0.0/CRL.js without changing the version
npm test                     # run every suite against src/ and the built bundle
npm run format               # Prettier
```

`npm run build` on its own bumps the patch version first; pass an explicit version (`npm run build -- 2.1.0`) to set one. The root `CRL.js` and the version folder are always written together and must stay byte-identical.

## Module Responsibilities

| Module         | Responsibility                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| `index.js`     | Event registration, startup (`checkInstall`), public `CRL` API.                                                |
| `commands.js`  | `!crl` parsing and routing, option validation, chat menus (main, listener card, settings, help).               |
| `legacy.js`    | Parses version 1 `!crl \\action,key=value \\command` syntax.                                                   |
| `listen.js`    | Chat listener: runs matching listeners, loop protection, inspector, `test`, observers.                         |
| `analyse.js`   | Pure: turns a chat message into a description (type, speaker, character, template fields, text, rolls).        |
| `match.js`     | Pure: listener matching, text terms, comparisons, die-size filters.                                            |
| `actions.js`   | Placeholders, splitting commands into messages, speaker resolution, cooldown and loop counters.                |
| `state.js`     | Persistent state, config, listener normalisation, version 1 state and rules conversion, rules (de)serialising. |
| `store.js`     | The store character and its abilities: sync on startup, adoption, mirroring rules, Journal edit handlers.      |
| `journals.js`  | Help and Command Deck handouts.                                                                                |
| `chat.js`      | Chat cards, buttons, whispers and errors.                                                                      |
| `i18n.js`      | Translation lookup (`t`, `tRaw`), locale normalisation and text direction.                                     |
| `constants.js` | Build placeholders, names, defaults, limits and colours.                                                       |
| `utils.js`     | Small helpers: escaping, parsing, list splitting, GM lookup.                                                   |

`analyse.js`, `match.js`, `legacy.js` and most of `actions.js` must stay free of Roll20 globals so they can be unit tested directly. There are no circular imports.

## Data Model

```text
state.CRL = {
  schemaVersion: 2,
  config: { language, enabled, speaker: 'crl'|'roller', listenToMods },
  characterId,                 // the store character
  listeners: { [abilityId]: rules },
  order: [abilityId, …],       // evaluation order
  notices: { useroptions },    // last applied One-Click options
}
```

A listener is identified by its ability's ID. Its **commands** live only in the ability's `action`. Its **rules** live in `state.CRL.listeners` and are mirrored into the ability's `description` as `{"crl":2, …rules}` (`mirrorRules`), because Roll20 does not copy `state` when a game is copied. On startup `syncListeners` reconciles the two:

- an ability with a state record keeps the state's rules (its name is taken from the ability);
- an ability without one is adopted from its description: version 2 JSON is restored, version 1 JSON (`{txt, templates, roll}`) is converted, anything else becomes a switched-off listener;
- a state record whose ability is gone is dropped.

`change:ability` handles renames and hand-edited JSON in the Journal; `destroy:ability` drops the listener. API changes raise no events, so commands update both sides themselves.

Rules (`normaliseListener`):

| Field       | Type     | Meaning                                        |
| ----------- | -------- | ---------------------------------------------- |
| `name`      | string   | Mirrors the ability name.                      |
| `enabled`   | boolean  |                                                |
| `templates` | string[] | Any of; `none` = no template.                  |
| `types`     | string[] | Any of; empty = every type but `api`.          |
| `text`      | string[] | All of; `##` = inline roll.                    |
| `regex`     | boolean  | Text terms are regular expressions.            |
| `who`       | string[] | Speaker or template character, any of.         |
| `players`   | string[] | Player display names, any of.                  |
| `results`   | string[] | `crit`, `fumble`, `success`, `fail`, any of.   |
| `total`     | string   | Comparison text, e.g. `>=15`, `19-20`.         |
| `natural`   | string   | Comparison text for kept die faces.            |
| `dice`      | string   | `auto`, `any` or a die size.                   |
| `cooldown`  | number   | Seconds.                                       |
| `stop`      | boolean  | Stop evaluating later listeners after a match. |
| `speaker`   | string   | `default`, `crl` or `roller`.                  |

## How Matching Works

`analyseMessage` produces:

- `raw`: content with `$[[n]]` markers (for `/roll` messages, `origRoll = $[[0]]`);
- `text`: markers replaced by totals or table item names, HTML stripped and entities decoded;
- `rolls`: for each inline roll, its total, expression, kept dice (`{sides, value, crit, fumble, success}`), table items and whether it has a success target. Groups are walked recursively; maths, comments and labels are skipped; dropped (`d`) and rerolled (`r`) dice are ignored; table and Fate dice have no crit or fumble.

Beacon sheets (D&D 2024) send `advancedroll` messages with no `inlinerolls` or `rolltemplate`. Their dice come in `msg.rolls`, an object keyed by roll name (`Base`, …) whose values have the inline-roll shape (`expression`, `results.rolls[].results[]` with `isCrit`/`isFumble`); their content is an HTML card read by `beacon.js` for the template (first class, `dnd-2024`), character, title, subcategory, mode and the headline total, which replaces the `Base` roll's dice-only total. `msg.characterId` is used for the roller speaker. When `msg.rolls` is missing, the rolls are read from the card's `rt-formula` blocks.

`matchListener` checks, in order: enabled, type, template, who, player, text, then roll checks, and returns the first failing reason (used by the inspector). Text terms are compiled with `compileTerm`: plain terms are escaped, `##` becomes `\$\[\[\d+\]\]`, and matching is case-insensitive. Terms with `##` are searched in `raw` and the markers inside each hit give the roll scope; other terms are searched in `raw` and then `text`. Roll checks pass when one roll in scope meets every condition. `dice: auto` becomes `20` when a d20 is in scope, otherwise `any`.

## Commands and Speakers

`splitCommands` sends each line separately, but joins lines while a `{{` is unclosed (joined with newlines for `!` commands, spaces otherwise). `fillPlaceholders` only replaces known `${name}` and `${field:key}` placeholders, so `{{ }}` and other mods' syntax are untouched; values have line breaks removed.

`resolveSpeaker('roller')` looks up a character by the template's character name, then the speaker name, and falls back to `player|id`, then `CRL`.

Loop protection: messages from `playerid === 'API'` with speaker `CRL` or the script name are ignored. Every match is recorded; a listener matching more than `LOOP_LIMIT` (20) times in `LOOP_WINDOW_MS` (10 s) is switched off and the GMs are warned.

## Command Text

`restoreCommandText` puts back what Roll20 processed before the API saw a `!crl` command: `$[[n]]` becomes `[[expression]]`, and a stripped `&{template:…}` is re-inserted before the first `{{`. `@{}` and `%{}` cannot be recovered. `parseArguments` treats everything after `--commands` as the commands, then splits the rest on ` --option`. Validation happens on a copy (`applyOptions`) so a command with any error changes nothing.

## Translations

`en-US.js` is the source. The other 23 locale files are complete translations; a missing key falls back to English. When you add or change English text, update every locale. `npm run sync-locales` (one process at a time; Google Translate rate-limits parallel runs) can draft new strings, but review its output: machine translation produced literal errors ("die" as dying, "roll" as bread rolls) and translated text that must stay literal. Keep these exactly as in English: `{braces}` and `${name}` placeholders, `--options`, `!crl` commands with their subcommands, `\\`, `@{}`, `%{}`, and the values users type (`crit`, `fumble`, `on`, `none`, message types and so on). Check that every array has the same number of items as in `en-US.js`.

`tests/parse.test.mjs` checks that every literal key used in `src/` exists in `en-US.js`, and `tests/crl.test.mjs` checks that no whisper shows an untranslated key.

## Releasing

1. Update `CHANGELOG.md` and the version in the docs.
2. `npm run build -- <version>` (updates `script.json`, `package.json`, `CRL.js` and `<version>/CRL.js`).
3. `npm test`, then run the manual checklist in `TESTING.md`.
4. Commit the root script and the version folder together.
