# TokenController — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                                    | File            | Key function            |
| --------------------------------------- | --------------- | ----------------------- |
| Roll20 event registration               | `src/index.js`  | `registerEventHandlers` |
| Startup, migration, handouts, scheduler | `src/index.js`  | `checkInstall`          |
| Public API (`TokenController.*`)        | `src/index.js`  | `publishApi`            |
| TokenMod move support                   | `src/index.js`  | `observeOtherMods`      |
| Re-anchor migrated patrols              | `src/engine.js` | `preparePatrols`        |

## Command Routing

| Task                                 | File              | Key function                                                             |
| ------------------------------------ | ----------------- | ------------------------------------------------------------------------ |
| Handle chat input (GM only)          | `src/commands.js` | `handleInput`                                                            |
| Route `!tokencontroller` subcommands | `src/commands.js` | `routeCommand`                                                           |
| v4 `!tc` / `!token-control` commands | `src/legacy.js`   | `translateLegacy`                                                        |
| Split words, keeping "quoted" names  | `src/utils.js`    | `tokenize`                                                               |
| Sort the selection                   | `src/commands.js` | `readSelection`                                                          |
| Menu and cards                       | `src/commands.js` | `showMainMenu`, `showRoute`, `showRecording`, `showSettings`, `showHelp` |

## Routes

| Task                             | File              | Key function                                          |
| -------------------------------- | ----------------- | ----------------------------------------------------- |
| Parse a step code                | `src/routes.js`   | `parseCode`                                           |
| Compile a route into a track     | `src/routes.js`   | `compileTrack`                                        |
| Loop / ping-pong / once stepping | `src/routes.js`   | `nextFrame`                                           |
| Recording to code or waypoints   | `src/routes.js`   | `recordingToRoute`                                    |
| Drawing to waypoints             | `src/drawings.js` | `drawingWaypoints`                                    |
| `add`, `edit`, `draw`            | `src/commands.js` | `commandAdd`, `commandEdit`, `commandDraw`            |
| Route options                    | `src/commands.js` | `commandRouteOption`                                  |
| Rename, copy, remove             | `src/commands.js` | `commandRename`, `commandCopy`, `commandRemove`       |
| Export / import / examples       | `src/commands.js` | `commandExport`, `commandImport`, `commandExamples`   |
| Route records                    | `src/state.js`    | `addRoute`, `updateRoute`, `deleteRoute`, `findRoute` |

## Moving Tokens

| Task                                                        | File            | Key function                               |
| ----------------------------------------------------------- | --------------- | ------------------------------------------ |
| Scheduler                                                   | `src/engine.js` | `startScheduler`, `tick`, `runPatrols`     |
| Start / stop / reset a patrol                               | `src/engine.js` | `startPatrol`, `stopPatrol`, `resetPatrol` |
| One step of a patrol                                        | `src/engine.js` | `advancePatrol`                            |
| Move a token and tell everyone                              | `src/engine.js` | `moveTokenTo`, `announceMove`              |
| Stealth                                                     | `src/engine.js` | `toggleStealth`                            |
| Turning tokens                                              | `src/routes.js` | `rotationFor`                              |
| Drags by people (locks, recording, re-anchoring, followers) | `src/engine.js` | `handleTokenChange`                        |
| Moves by TokenMod                                           | `src/engine.js` | `handleObservedChange`                     |

## Following, Locking and Combat

| Task                     | File              | Key function                          |
| ------------------------ | ----------------- | ------------------------------------- |
| Follow / unfollow        | `src/engine.js`   | `followLeader`, `unfollow`            |
| Move followers           | `src/engine.js`   | `moveFollowers`, `rememberTrail`      |
| Leader / follow commands | `src/commands.js` | `commandLeader`, `commandFollow`      |
| Lock / unlock            | `src/engine.js`   | `lockToken`, `unlockToken`            |
| Combat detection         | `src/engine.js`   | `isCombatActive`, `updateCombatState` |
| Turn order stepping      | `src/engine.js`   | `handleTurnOrderChange`               |
| Manual combat switch     | `src/commands.js` | `commandCombat`                       |

## Recording

| Task                   | File              | Key function                                    |
| ---------------------- | ----------------- | ----------------------------------------------- |
| Start / operate / save | `src/commands.js` | `commandRecord`, `runRecordOp`, `saveRecording` |
| Button moves and undo  | `src/engine.js`   | `recordStep`, `recordUndo`                      |
| Dragged moves          | `src/engine.js`   | `handleTokenChange`                             |

## Grids

| Task                 | File              | Key function                          |
| -------------------- | ----------------- | ------------------------------------- |
| Page grid and size   | `src/context.js`  | `getPageContext`, `pageGridOptions`   |
| Grid for a page type | `src/grid.js`     | `createGrid`                          |
| Snap, step and pitch | `src/grid.js`     | `snapToCell`, `stepFrom`, `cellPitch` |
| Hex zigzags          | `src/grid.js`     | `hexStep`, `directionZigzags`         |
| Calibration          | `src/grid.js`     | `calibrateGrid`                       |
| `calibrate` command  | `src/commands.js` | `commandCalibrate`                    |

## State, Settings and Text

| Task                      | File                          | Key function                                        |
| ------------------------- | ----------------------------- | --------------------------------------------------- |
| Load and migrate state    | `src/state.js`                | `initialiseState`, `migrateState`, `migrateV4`      |
| Validate settings         | `src/state.js`                | `validateConfigValue`, `mergeConfig`                |
| Validate route options    | `src/state.js`                | `validateRouteOption`, `normaliseRoute`             |
| One-Click useroptions     | `src/state.js`                | `applyGlobalConfig`                                 |
| `set` command             | `src/commands.js`             | `commandSet`                                        |
| Handouts                  | `src/journals.js`             | `installHandouts`, `buildHelpHtml`, `buildDeckHtml` |
| Remove the v4 usage guide | `src/journals.js`             | `removeLegacyHandout`                               |
| Chat cards and errors     | `src/chat.js`                 | `whisper`, `whisperError`, `whisperWarning`         |
| Translations              | `src/i18n.js`                 | `t`, `tRaw`                                         |
| English text              | `src/locales/locale/en-US.js` |                                                     |
