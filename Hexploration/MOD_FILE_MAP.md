# Hexploration — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                                     | File           | Key function                                 |
| ---------------------------------------- | -------------- | -------------------------------------------- |
| Roll20 event registration                | `src/index.js` | `registerEventHandlers`                      |
| Jumpgate-only events                     | `src/index.js` | `registerEngineHandlers`                     |
| Startup, migration, pruning, handouts    | `src/index.js` | `checkInstall`                               |
| Public API (`Hexploration.revealAround`) | `src/index.js` | `publishApi`                                 |
| TokenMod move support                    | `src/index.js` | `observeOtherMods`                           |
| Hand-deleted hexes and pages             | `src/index.js` | `handlePathDestroyed`, `handlePageDestroyed` |

## Command Routing

| Task                              | File              | Key function                                             |
| --------------------------------- | ----------------- | -------------------------------------------------------- |
| Handle chat input (GM only)       | `src/commands.js` | `handleInput`                                            |
| Route `!hexploration` subcommands | `src/commands.js` | `routeCommand`                                           |
| v1 commands                       | `src/commands.js` | `routeLegacy`                                            |
| Sort the selection                | `src/commands.js` | `readSelection`                                          |
| Menu, settings, status, help      | `src/commands.js` | `showMainMenu`, `showSettings`, `showStatus`, `showHelp` |

## Filling and Maintenance

| Task                          | File           | Key function                        |
| ----------------------------- | -------------- | ----------------------------------- |
| Cells inside / outside shapes | `src/hexes.js` | `cellsInPaths`, `cellsOutsidePaths` |
| Draw hexes in batches         | `src/hexes.js` | `fillCells`, `drawHex`              |
| Remove a hex                  | `src/hexes.js` | `removeHex`                         |
| Reset page                    | `src/hexes.js` | `clearPage`                         |
| Undo last fill                | `src/hexes.js` | `undoLastFill`                      |
| Rescan a page                 | `src/hexes.js` | `rescanPage`                        |
| Calibrate                     | `src/hexes.js` | `calibratePage`, `resetCalibration` |
| Startup clean-up              | `src/hexes.js` | `pruneMissingHexes`                 |

## Revealing

| Task                          | File            | Key function                                 |
| ----------------------------- | --------------- | -------------------------------------------- |
| Token change event            | `src/reveal.js` | `handleTokenChange`                          |
| Which tokens reveal           | `src/reveal.js` | `tokenReveals`                               |
| Route and footprint           | `src/reveal.js` | `travelledCells`                             |
| Sight, line of sight, glimpse | `src/reveal.js` | `revealFromCells`, `isBlocked`, `glimpseHex` |
| Reveal one hex / announce     | `src/reveal.js` | `revealHex`, `announceDiscovery`             |
| Reveal page                   | `src/reveal.js` | `revealPage`                                 |

## Hiding Covered Tokens

| Task                             | File           | Key function                     |
| -------------------------------- | -------------- | -------------------------------- |
| Hide / restore one token         | `src/cover.js` | `refreshToken`, `restoreDetails` |
| Refresh a whole page             | `src/cover.js` | `refreshPage`                    |
| Restore all (setting turned off) | `src/cover.js` | `restoreAll`                     |

## Locations

| Task                      | File               | Key function                       |
| ------------------------- | ------------------ | ---------------------------------- |
| Name a hex / GM label     | `src/locations.js` | `setHexName`, `removeLabel`        |
| Mark and unmark tokens    | `src/locations.js` | `markLocations`, `unmarkLocations` |
| Tokens waiting for a fill | `src/locations.js` | `findLocationTokens`               |
| Attach / detach an icon   | `src/locations.js` | `attachIcon`, `detachIcon`         |

## Geometry

| Task                                | File             | Key function                                          |
| ----------------------------------- | ---------------- | ----------------------------------------------------- |
| Grid profiles (Legacy / Jumpgate)   | `src/grid.js`    | `GRID_PROFILES`, `createGrid`                         |
| Pixel ↔ hex                         | `src/grid.js`    | `hexToPixel`, `pixelToHex`                            |
| Distance, neighbours, ranges, lines | `src/grid.js`    | `hexDistance`, `neighbours`, `hexesWithin`, `hexLine` |
| Page coverage, token footprint      | `src/grid.js`    | `hexesCoveringPage`, `hexesUnderToken`                |
| Calibration maths                   | `src/grid.js`    | `calibrateGrid`                                       |
| Shape outlines (path / pathv2)      | `src/polygon.js` | `pathToRings`                                         |
| Hex path geometry                   | `src/polygon.js` | `polygonPathProps`                                    |
| Page grid and context               | `src/context.js` | `buildPageGrid`, `getPageContext`                     |

## Roll20 Paths

| Task                       | File           | Key function                    |
| -------------------------- | -------------- | ------------------------------- |
| Find a path of either type | `src/paths.js` | `getPathObject`                 |
| Draw a hex, layer fallback | `src/paths.js` | `createHexPath`, `getHexLayer`  |
| Read / recreate a shape    | `src/paths.js` | `readPathProps`, `recreatePath` |

## State & Config

| Task                       | File           | Key function                                            |
| -------------------------- | -------------- | ------------------------------------------------------- |
| Load and migrate state     | `src/state.js` | `initialiseState`, `migrateState`                       |
| Validate settings          | `src/state.js` | `validateConfigValue`, `mergeConfig`                    |
| One-Click useroptions      | `src/state.js` | `applyGlobalConfig`                                     |
| Page overrides             | `src/state.js` | `getPageSettings`, `setPageSetting`                     |
| Hex records and path index | `src/state.js` | `getHex`, `putHex`, `deleteHexRecord`, `getHexByPathId` |

## Journals, Chat and Text

| Task                  | File                          | Key function                                        |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| Help and Command Deck | `src/journals.js`             | `installHandouts`, `buildHelpHtml`, `buildDeckHtml` |
| Chat cards and errors | `src/chat.js`                 | `whisper`, `whisperError`, `buildCard`              |
| Translations          | `src/i18n.js`                 | `t`, `tRaw`                                         |
| English strings       | `src/locales/locale/en-US.js` | —                                                   |
