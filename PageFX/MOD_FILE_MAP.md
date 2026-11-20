# PageFX — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                               | File             | Key function                            |
| ---------------------------------- | ---------------- | --------------------------------------- |
| Roll20 event registration, startup | `src/index.js`   | `checkInstall`, `registerEventHandlers` |
| Public API (`PageFX.*`)            | `src/index.js`   | `publishApi`                            |
| Rate warnings and effect problems  | `src/index.js`   | `installSchedulerHooks`                 |
| Version 1 tokens taken over        | `src/effects.js` | `adoptToken`, `rescanTokens`            |
| Version 1 GM Notes and bars        | `src/state.js`   | `readV`, `effectFromV`                  |
| State cleaning                     | `src/state.js`   | `migrateState`, `cleanEffect`           |
| One-Click options                  | `src/state.js`   | `applyGlobalConfig`                     |

## Running Effects

| Task                                | File               | Key function                                 |
| ----------------------------------- | ------------------ | -------------------------------------------- |
| Live pages (ribbon, split, preview) | `src/pages.js`     | `computeLivePages`, `getLivePages`           |
| Watching for page changes           | `src/scheduler.js` | `watchLivePages`, `syncEffects`              |
| Starting and stopping               | `src/scheduler.js` | `startEffect`, `stopEffect`, `refreshEffect` |
| One spawn per layer tick            | `src/scheduler.js` | `tick`, `queue`                              |
| Per-page spawn cap                  | `src/scheduler.js` | `takeSpawnBudget`                            |
| No-effect areas when spawning       | `src/scheduler.js` | `nullAreasOn`                                |
| Spawn now                           | `src/scheduler.js` | `fireOnce`                                   |
| Areas, random points, beam ends     | `src/geometry.js`  | `tokenArea`, `randomPointIn`, `beamEnd`      |
| Time between spawns                 | `src/geometry.js`  | `nextDelay`                                  |

## Effects and FX

| Task                              | File             | Key function                                                          |
| --------------------------------- | ---------------- | --------------------------------------------------------------------- |
| Make, release and edit effects    | `src/effects.js` | `createEffect`, `releaseEffect`, `markEdited`                         |
| Area and no-effect areas          | `src/effects.js` | `setArea`, `createNullArea`, `removeNullArea`                         |
| Token moves, copies and deletes   | `src/effects.js` | `handleGraphicChange`, `handleGraphicAdded`, `handleGraphicDestroyed` |
| Parsing what the GM types         | `src/fx.js`      | `parseFxSpec`                                                         |
| Filling in custom FX definitions  | `src/fx.js`      | `completeDefinition`, `normaliseDefinition`                           |
| PageFX's own and shared custom FX | `src/fx.js`      | `ensureOwnedFx`, `pruneOwnedFx`, `sharedKey`, `pruneSharedFx`         |
| Spawning                          | `src/fx.js`      | `resolveFx`, `spawn`                                                  |

## Presets and Triggers

| Task                     | File              | Key function                                        |
| ------------------------ | ----------------- | --------------------------------------------------- |
| Preset library and packs | `src/presets.js`  | `BUILTIN_PRESETS`, `PRESET_PACKS`                   |
| Applying presets         | `src/presets.js`  | `getPreset`, `presetLayers`                         |
| Presets from other Mods  | `src/presets.js`  | `registerPreset`                                    |
| Turn order and rounds    | `src/triggers.js` | `readTurnChange`, `roundMatches`, `handleTurnOrder` |
| Enter and leave          | `src/triggers.js` | `checkToken`, `handleTokenMoved`, `primeInside`     |
| Trigger cleaning         | `src/state.js`    | `cleanTrigger`                                      |

## Chat and Handouts

| Task               | File                          | Key function                                                                  |
| ------------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| Command parsing    | `src/commands.js`             | `handleInput`, `parseArgs`, `parseTriggerOptions`                             |
| Cards              | `src/menu.js`                 | `showMainMenu`, `showEffectCard`, `showPresets`, `showSettings`, `showStatus` |
| Roll query buttons | `src/menu.js`                 | `query`, `queryOption`                                                        |
| Settings           | `src/state.js`                | `setSetting`, `getSettings`                                                   |
| Handouts           | `src/journals.js`             | `installHandouts`, `buildHelpHtml`, `buildDeckHtml`                           |
| Strings            | `src/locales/locale/en-US.js` |                                                                               |
