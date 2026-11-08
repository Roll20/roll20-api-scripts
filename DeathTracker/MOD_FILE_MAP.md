# DeathTracker — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                                | File           | Key function                            |
| ----------------------------------- | -------------- | --------------------------------------- |
| Roll20 event registration, startup  | `src/index.js` | `start`                                 |
| Hit point change from a token event | `src/index.js` | `handleTokenChange`                     |
| Public API (`DeathTracker.*`)       | `src/index.js` | `api`, `check`, `getStatus`             |
| TokenMod changes                    | `src/index.js` | `start` (`TokenMod.ObserveTokenChange`) |
| 0.1 settings migration              | `src/state.js` | `migrateState`, `readLegacySettings`    |
| One-Click options                   | `src/state.js` | `applyGlobalConfig`                     |

## Judging Tokens

| Task                                   | File             | Key function                            |
| -------------------------------------- | ---------------- | --------------------------------------- |
| Judge a token (markers, tint, actions) | `src/tracker.js` | `judge`                                 |
| Status rules                           | `src/status.js`  | `decideStatus`                          |
| PC or NPC                              | `src/tracker.js` | `isPc`                                  |
| What the sheet says (PC/NPC)           | `src/sheet.js`   | `sheetRole`                             |
| Who controls a token                   | `src/sheet.js`   | `tokenControllers`, `playerControllers` |
| Hit points and linked maximum          | `src/hp.js`      | `readHp`                                |
| Massive damage                         | `src/status.js`  | `isMassiveDamage`                       |
| Announcements                          | `src/tracker.js` | `announce`                              |
| Status change listeners                | `src/tracker.js` | `onStatusChange`                        |

## Death Saves

| Task                                  | File                | Key function                                 |
| ------------------------------------- | ------------------- | -------------------------------------------- |
| Read saves (2024 store or checkboxes) | `src/sheet.js`      | `readDeathSaves`                             |
| Clear the sheet's boxes               | `src/sheet.js`      | `clearDeathSaves`                            |
| Count from the drop to 0              | `src/status.js`     | `countSaves`                                 |
| React to sheet changes                | `src/deathsaves.js` | `handleAttributeChange`                      |
| Poll downed PCs                       | `src/deathsaves.js` | `startPoll`, `downedTokens`                  |
| DeathSaves macro and `dsync`          | `src/deathsaves.js` | `installMacro`, `parseSyncArgs`, `syncSaves` |

## Markers, Tint, Effects, Actions

| Task                            | File             | Key function             |
| ------------------------------- | ---------------- | ------------------------ |
| Game's marker list              | `src/markers.js` | `listMarkers`            |
| Marker by name or tag           | `src/markers.js` | `resolveMarker`          |
| Change markers, keeping others' | `src/markers.js` | `applyMarkers`           |
| Tint by hit points              | `src/fx.js`      | `applyTint`, `clearTint` |
| Hurt and heal effects           | `src/fx.js`      | `playFx`                 |
| Move on death, turn order       | `src/actions.js` | `runDeathActions`        |
| Restore                         | `src/actions.js` | `undoDeathActions`       |

## Commands & Output

| Task                                  | File              | Key function                                                        |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Chat command routing                  | `src/commands.js` | `handleChat`, `parseCommand`                                        |
| `set`, `config` and validation        | `src/commands.js` | `changeSetting`; `src/state.js` `checkSetting`                      |
| Judge every tracked token again       | `src/commands.js` | `rejudgeAll`                                                        |
| Menu, status, settings, markers, help | `src/menu.js`     | `showMenu`, `showStatus`, `showSettings`, `showMarkers`, `showHelp` |
| Handouts                              | `src/journals.js` | `installHandouts`, `buildHelpHtml`, `buildDeckHtml`                 |
| Translations                          | `src/i18n.js`     | `t`, `tRaw`                                                         |
