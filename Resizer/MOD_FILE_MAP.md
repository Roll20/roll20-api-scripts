# Resizer — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                             | File           | Key function            |
| -------------------------------- | -------------- | ----------------------- |
| Roll20 event registration        | `src/index.js` | `registerEventHandlers` |
| Startup, migration, handouts     | `src/index.js` | `checkInstall`          |
| Public API (`Resizer.*`)         | `src/index.js` | `publishApi`            |
| 0.0.9 state upgrade              | `src/state.js` | `migrateState`          |
| One-Click useroptions (language) | `src/state.js` | `applyGlobalConfig`     |

## Command Routing

| Task                                 | File              | Key function                    |
| ------------------------------------ | ----------------- | ------------------------------- |
| Handle chat input (GM and Mods)      | `src/commands.js` | `handleInput`                   |
| Route subcommands                    | `src/commands.js` | `routeCommand`, `HANDLERS`      |
| 0.0.9 syntax                         | `src/commands.js` | `translateLegacy`               |
| Flags (`--ids`, `--pages`, `--cell`) | `src/commands.js` | `parseArgs`                     |
| Command names (`!resizer`, renamed)  | `src/state.js`    | `getCommandNames`, `getCommand` |
| Selection and `--ids`                | `src/objects.js`  | `targetObjects`, `findObject`   |
| Pages for a command                  | `src/pages.js`    | `currentPage`, `resolvePages`   |

## Changes

| Task                          | File                | Key function                       |
| ----------------------------- | ------------------- | ---------------------------------- |
| Zoom pages                    | `src/operations.js` | `zoomPages`, `zoomObject`          |
| Zoom limits                   | `src/operations.js` | `checkZoom`                        |
| Resize, creature size         | `src/operations.js` | `resizeGraphics`, `sizeToCreature` |
| Resize the page               | `src/operations.js` | `resizePage`                       |
| Fit, centre                   | `src/operations.js` | `fitGraphics`, `centreItems`       |
| Calibrate a map               | `src/operations.js` | `calibrateMap`, `pickMapAndBox`    |
| Units (px, cells, page units) | `src/operations.js` | `toPixels`                         |

## Geometry (pure)

| Task                       | File              | Key function                                                                        |
| -------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| Cell and page size         | `src/geometry.js` | `cellPixels`, `pagePixels`                                                          |
| Zoom each kind of object   | `src/geometry.js` | `zoomPage`, `zoomGraphic`, `zoomText`, `zoomPathV2`, `zoomLegacyPath`, `zoomPortal` |
| Fit and centre             | `src/geometry.js` | `fitToPage`, `centreOnPage`                                                         |
| Drawing bounding box       | `src/geometry.js` | `drawingBox`                                                                        |
| Calibration and grid lines | `src/geometry.js` | `calibrateFromBox`, `calibrateFromSquare`, `nearestLine`                            |
| Zoom factor text           | `src/geometry.js` | `parseFactor`                                                                       |

## Undo

| Task                        | File           | Key function                  |
| --------------------------- | -------------- | ----------------------------- |
| Record a change             | `src/undo.js`  | `startChange`                 |
| Keep the history small      | `src/undo.js`  | `pushEntry`                   |
| Undo, re-link redrawn paths | `src/undo.js`  | `undoLast`, `relink`          |
| History list and clear      | `src/undo.js`  | `listHistory`, `clearHistory` |
| Zoom listeners              | `src/hooks.js` | `onZoom`, `notifyZoom`        |

## Menus & Handouts

| Task                      | File              | Key function                                        |
| ------------------------- | ----------------- | --------------------------------------------------- |
| Main menu                 | `src/menu.js`     | `showMainMenu`                                      |
| Page picker               | `src/menu.js`     | `showPagePicker`                                    |
| History card              | `src/menu.js`     | `showHistory`, `describeEntry`                      |
| Settings card             | `src/menu.js`     | `showSettings`                                      |
| Help card                 | `src/menu.js`     | `showHelp`                                          |
| Roll20 queries in buttons | `src/menu.js`     | `choiceQuery`, `textQuery`                          |
| Help and Command Deck     | `src/journals.js` | `buildHelpHtml`, `buildDeckHtml`, `installHandouts` |
| Chat cards and buttons    | `src/chat.js`     | `whisper`, `buildButton`, `whisperError`            |
| Translations              | `src/i18n.js`     | `t`, `tRaw`                                         |
