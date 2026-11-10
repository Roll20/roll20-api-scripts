# Concentration — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                                   | File              | Key function            |
| -------------------------------------- | ----------------- | ----------------------- |
| Roll20 event registration              | `src/index.js`    | `registerEventHandlers` |
| Startup, migration, handouts, greeting | `src/index.js`    | `checkInstall`          |
| Public API (`Concentration.*`)         | `src/index.js`    | `publishApi`            |
| Catch up with markers on the map       | `src/tracker.js`  | `reconcile`             |
| Warn about a missing marker            | `src/commands.js` | `checkSetup`            |

## Commands

| Task                              | File              | Key function                                              |
| --------------------------------- | ----------------- | --------------------------------------------------------- |
| Handle chat input                 | `src/commands.js` | `handleInput`                                             |
| Route subcommands, permissions    | `src/commands.js` | `routeCommand`                                            |
| `!concentration [spell]`          | `src/commands.js` | `commandToggle`                                           |
| `end`                             | `src/commands.js` | `commandEnd`                                              |
| `config`                          | `src/commands.js` | `commandConfig`, `settingCommand`, `formatValue`          |
| `reset`                           | `src/commands.js` | `commandReset`                                            |
| `roll` / `advantage` buttons      | `src/commands.js` | `commandRoll` → `src/saves.js` `rollPending`              |
| Settings, status, advantage, help | `src/commands.js` | `showMenu`, `showStatus`, `showAdvantageMenu`, `showHelp` |

## Concentration

| Task                            | File             | Key function                            |
| ------------------------------- | ---------------- | --------------------------------------- |
| Character or token key          | `src/tracker.js` | `keyOf`, `tokensFor`                    |
| Start or switch                 | `src/tracker.js` | `startConcentration`                    |
| End (with message)              | `src/tracker.js` | `endConcentration`                      |
| Toggle from a command           | `src/tracker.js` | `toggleConcentration`                   |
| Marker added or removed by hand | `src/tracker.js` | `handleMarkerChange`                    |
| Who may change a token          | `src/tracker.js` | `canControl`                            |
| Who sees messages               | `src/tracker.js` | `audienceFor`, `sendAbout`              |
| Records in state                | `src/state.js`   | `getRecord`, `setRecord`, `clearRecord` |

## Saves

| Task                    | File           | Key function                                          |
| ----------------------- | -------------- | ----------------------------------------------------- |
| Damage on the HP bar    | `src/saves.js` | `handleDamage`                                        |
| DC                      | `src/saves.js` | `saveDc`                                              |
| Modifier from the sheet | `src/saves.js` | `getSaveModifier`                                     |
| Roll and report         | `src/saves.js` | `rollSave`, `buildSaveBody`                           |
| Reminder with buttons   | `src/saves.js` | `sendReminder`                                        |
| Pending buttons         | `src/state.js` | `addPendingRoll`, `getPendingRoll`, `takePendingRoll` |
| Advantage list          | `src/state.js` | `hasAdvantage`, `toggleAdvantage`                     |

## Spell Detection

| Task                     | File             | Key function            |
| ------------------------ | ---------------- | ----------------------- |
| 5e OGL `spell` template  | `src/detect.js`  | `detectLegacySpellCast` |
| D&D 2024 spell cards     | `src/detect.js`  | `detectBeaconSpellCast` |
| Either, with debug notes | `src/detect.js`  | `detectSpellCast`       |
| Find the caster          | `src/detect.js`  | `resolveCaster`         |
| Mark the caster's tokens | `src/tracker.js` | `handleSpellCast`       |

## Settings, Text and Output

| Task                           | File              | Key function                                        |
| ------------------------------ | ----------------- | --------------------------------------------------- |
| Validate a setting             | `src/state.js`    | `validateConfigValue`, `mergeConfig`                |
| One-Click useroptions          | `src/state.js`    | `applyGlobalConfig`                                 |
| Version 1.0 upgrade            | `src/state.js`    | `migrateState`                                      |
| Translations                   | `src/text.js`     | `tr`, `rich`                                        |
| Chat cards and buttons         | `src/chat.js`     | `buildCard`, `buildRow`, `buildButton`, `sendTo`    |
| Help and Command Deck handouts | `src/journals.js` | `buildHelpHtml`, `buildDeckHtml`, `installHandouts` |
| Debug Mode notes               | `src/debug.js`    | `debugLog`                                          |
