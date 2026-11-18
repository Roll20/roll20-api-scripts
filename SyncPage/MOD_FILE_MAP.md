# SyncPage — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                               | File             | Key function                            |
| ---------------------------------- | ---------------- | --------------------------------------- |
| Roll20 event registration, startup | `src/index.js`   | `start`                                 |
| Repair when the sandbox starts     | `src/index.js`   | `repairOnStart`                         |
| Public API (`SyncPage.*`)          | `src/index.js`   | `api`                                   |
| TokenMod changes                   | `src/index.js`   | `start` (`TokenMod.ObserveTokenChange`) |
| 0.1 set-up migration               | `src/migrate.js` | `migrateLegacy`                         |
| One-Click options                  | `src/state.js`   | `applyGlobalConfig`                     |

## Mirroring

| Task                                 | File          | Key function                            |
| ------------------------------------ | ------------- | --------------------------------------- |
| New objects (debounced)              | `src/sync.js` | `handleAdd`, `flushAdds`, `processAdd`  |
| Copy a new object to the other pages | `src/sync.js` | `mirrorNew`                             |
| Changes                              | `src/sync.js` | `handleChange`                          |
| Deletes and delete modes             | `src/sync.js` | `handleDestroy`, `removeCopies`         |
| The "Ask" delete card                | `src/sync.js` | `askAboutDelete`                        |
| Page settings                        | `src/sync.js` | `handlePageChange`, `copyPageSettings`  |
| Excluded layers                      | `src/sync.js` | `layerExcluded`                         |
| Echo guard                           | `src/echo.js` | `expectWrite`, `filterEcho`             |
| Properties, images, per-page keys    | `src/copy.js` | `readProps`, `cleanImgsrc`, `localKeys` |

## Groups, Pairing and Repair

| Task                         | File            | Key function                       |
| ---------------------------- | --------------- | ---------------------------------- |
| Groups, links, reverse index | `src/groups.js` | `createGroup`, `newLink`, `linkOf` |
| Joining a page               | `src/pair.js`   | `joinPage`, `pairPage`             |
| Fingerprints and drift       | `src/copy.js`   | `fingerprint`, `drift`             |
| Leftovers                    | `src/pair.js`   | `handleLeftovers`                  |
| Repair                       | `src/repair.js` | `repairGroup`                      |
| Pruning dead IDs             | `src/groups.js` | `prune`                            |

## Visibility and Players

| Task                     | File                | Key function                                   |
| ------------------------ | ------------------- | ---------------------------------------------- |
| Hide and show one copy   | `src/visibility.js` | `hideCopy`, `showCopy`                         |
| Changes to hidden copies | `src/visibility.js` | `absorbIntoHidden`                             |
| Split party              | `src/players.js`    | `readSplit`, `movePlayer`, `movePlayers`       |
| Layout                   | `src/players.js`    | `saveLayout`, `restoreLayout`, `gatherPlayers` |

## Memory

| Task                 | File              | Key function                   |
| -------------------- | ----------------- | ------------------------------ |
| Recycle bin and undo | `src/recycle.js`  | `addToRecycle`, `restoreEntry` |
| Button requests      | `src/requests.js` | `createRequest`, `takeRequest` |
| Last choices per GM  | `src/state.js`    | `gmMemory`                     |

## Chat and Handouts

| Task              | File                          | Key function                                           |
| ----------------- | ----------------------------- | ------------------------------------------------------ |
| Command parsing   | `src/commands.js`             | `handleChat`                                           |
| Cards             | `src/menu.js`                 | `showMenu`, `showGroup`, `showPlayers`, `showSettings` |
| Settings table    | `src/constants.js`            | `SETTINGS`                                             |
| Settings checking | `src/state.js`                | `normaliseSetting`, `setSetting`, `getSetting`         |
| Handouts          | `src/journals.js`             | `installHandouts`                                      |
| Strings           | `src/locales/locale/en-US.js` |                                                        |
