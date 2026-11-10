# Customizable Roll Listener — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                                   | File           | Key function            |
| -------------------------------------- | -------------- | ----------------------- |
| Roll20 event registration              | `src/index.js` | `registerEventHandlers` |
| Startup, migration, handouts, greeting | `src/index.js` | `checkInstall`          |
| Public API (`CRL.*`)                   | `src/index.js` | `publishApi`            |
| Chat dispatch (commands, then listen)  | `src/index.js` | `handleChat`            |

## Commands & Menus

| Task                                  | File              | Key function                                             |
| ------------------------------------- | ----------------- | -------------------------------------------------------- |
| Recognise `!crl`, GM check            | `src/commands.js` | `handleCommand`                                          |
| Restore inline rolls / templates      | `src/commands.js` | `restoreCommandText`                                     |
| Split sub-command, target and options | `src/commands.js` | `parseArguments`                                         |
| Route `!crl` sub-commands             | `src/commands.js` | `routeCommand`                                           |
| Validate options on a copy            | `src/commands.js` | `applyOptions`                                           |
| Create / edit / delete                | `src/commands.js` | `createListener`, `editListener`, `removeListener`       |
| Commands typed with `\\` separators   | `src/commands.js` | `commandLines`                                           |
| Menus and cards                       | `src/commands.js` | `showMainMenu`, `showListener`, `showConfig`, `showHelp` |
| Change buttons and their queries      | `src/commands.js` | `changeCommand`, `textQuery`, `choiceQuery`              |
| Global settings                       | `src/commands.js` | `changeConfig`                                           |
| Version 1 syntax                      | `src/legacy.js`   | `isLegacyCommand`, `parseLegacyCommand`                  |
| Run version 1 actions                 | `src/commands.js` | `routeLegacy`                                            |

## Listening

| Task                              | File            | Key function                     |
| --------------------------------- | --------------- | -------------------------------- |
| Check a message against listeners | `src/listen.js` | `handleChatMessage`              |
| Ignore CRL's own messages         | `src/listen.js` | `isOwnMessage`                   |
| Loop protection                   | `src/listen.js` | `stopLoop` (with `recordFire`)   |
| Inspector                         | `src/listen.js` | `setInspector`, `sendInspection` |
| Test button                       | `src/listen.js` | `testListener`                   |
| Observers for other mods          | `src/listen.js` | `addObserver`                    |

## Message Analysis & Matching

| Task                                    | File             | Key function                   |
| --------------------------------------- | ---------------- | ------------------------------ |
| Describe a chat message                 | `src/analyse.js` | `analyseMessage`               |
| Describe a roll (dice, tables, targets) | `src/analyse.js` | `describeRoll`, `collectPart`  |
| Roll template fields                    | `src/analyse.js` | `parseTemplateFields`          |
| Replace `$[[n]]` with results           | `src/analyse.js` | `expandMarkers`                |
| Match a listener                        | `src/match.js`   | `matchListener`                |
| Text terms and `##`                     | `src/match.js`   | `compileTerm`, `matchText`     |
| Comparisons and die sizes               | `src/match.js`   | `parseComparison`, `parseDice` |
| Invalid regular expressions             | `src/match.js`   | `findInvalidTerm`              |

## Running Commands

| Task                        | File             | Key function                  |
| --------------------------- | ---------------- | ----------------------------- |
| Placeholder values          | `src/actions.js` | `buildPlaceholderValues`      |
| Replace placeholders        | `src/actions.js` | `fillPlaceholders`            |
| Split into chat messages    | `src/actions.js` | `splitCommands`               |
| Who commands are sent as    | `src/actions.js` | `resolveSpeaker`              |
| Cooldown and firing history | `src/actions.js` | `isCoolingDown`, `recordFire` |
| Send                        | `src/actions.js` | `runCommands`                 |

## State & Storage

| Task                                   | File           | Key function                                     |
| -------------------------------------- | -------------- | ------------------------------------------------ |
| Schema upgrade (incl. version 1 state) | `src/state.js` | `initialiseState`                                |
| Settings and One-Click options         | `src/state.js` | `setConfigValue`, `applyGlobalConfig`            |
| Listener defaults and cleaning         | `src/state.js` | `normaliseListener`                              |
| Version 1 rules                        | `src/state.js` | `convertV1Rules`                                 |
| Rules in ability descriptions          | `src/state.js` | `parseStoredRules`, `serialiseRules`             |
| Listener records and order             | `src/state.js` | `getListeners`, `putListener`, `moveListener`    |
| Store character                        | `src/store.js` | `getStoreCharacter`, `prepareStoreCharacter`     |
| Reconcile abilities on startup         | `src/store.js` | `syncListeners`, `adoptAbility`                  |
| Mirror rules into a description        | `src/store.js` | `mirrorRules`                                    |
| Journal edits and deletions            | `src/store.js` | `handleAbilityChanged`, `handleAbilityDestroyed` |

## Handouts, Chat & Text

| Task                      | File                          | Key function                                                   |
| ------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Help handout              | `src/journals.js`             | `buildHelpHtml`                                                |
| Command Deck handout      | `src/journals.js`             | `buildDeckHtml`                                                |
| Create / refresh handouts | `src/journals.js`             | `installHandouts`                                              |
| Chat cards and buttons    | `src/chat.js`                 | `whisper`, `buildCard`, `buildButton`, `buildRow`, `buildCode` |
| Errors and warnings       | `src/chat.js`                 | `whisperError`, `whisperWarning`                               |
| Translations              | `src/i18n.js`                 | `t`, `tRaw`, `getLocale`                                       |
| English text              | `src/locales/locale/en-US.js` | —                                                              |

## Tests

| Suite                  | Covers                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `tests/match.test.mjs` | Analysis and matching: crits, fumbles, dropped dice, targets, text, tables, filters. |
| `tests/parse.test.mjs` | Command parsing, version 1 syntax and rules, placeholders, translation keys.         |
| `tests/crl.test.mjs`   | The built bundle end to end in `tests/roll20-stub.mjs`.                              |
