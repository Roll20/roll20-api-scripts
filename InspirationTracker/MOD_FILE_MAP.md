# InspirationTracker — Mod File Map

Where to look for each part of the Mod. Line numbers drift; search for the function names.

## Entry Point & Startup

| What                                         | Where                                  |
| -------------------------------------------- | -------------------------------------- |
| Event handlers                               | `src/index.js` `registerEventHandlers` |
| Startup, greeting, first sheet read          | `src/index.js` `checkInstall`          |
| Public API (`globalThis.InspirationTracker`) | `src/index.js` `publishApi`            |
| TokenMod observer                            | `src/index.js` `observeOtherMods`      |
| Error guard for async handlers               | `src/index.js` `guarded`               |

## Command Routing

| What                           | Where                                       |
| ------------------------------ | ------------------------------------------- |
| Prefixes (incl. 0.1.x command) | `src/commands.js` `prefixes`, `handleInput` |
| Parsing, `--ids`, `--party`    | `src/commands.js` `parseCommand`            |
| GM commands                    | `src/commands.js` `handleGm`                |
| Player commands                | `src/commands.js` `handlePlayer`            |
| Result messages                | `src/commands.js` `report`                  |
| Settings, marker change        | `src/commands.js` `handleSet`, `moveMarker` |
| Player token action            | `src/commands.js` `installMacro`            |

## Inspiration

| What                               | Where                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| Give, remove, spend                | `src/actions.js` `give`, `remove`, `spend`                                                      |
| Undo a spend                       | `src/actions.js` `undoSpend`                                                                    |
| Pass on (2024 rules)               | `src/actions.js` `offerPassOn`, `passOn`                                                        |
| Changes made on a sheet            | `src/actions.js` `handleSheetValue`                                                             |
| Marker added or removed on a token | `src/actions.js` `handleMarkerChange`                                                           |
| Markers on every token, effects    | `src/actions.js` `syncTokens`, `playFx`                                                         |
| Announcements                      | `src/actions.js` `announce`, `announceGain`, `announceSpend`                                    |
| One action per character at a time | `src/actions.js` `exclusive`                                                                    |
| Read every sheet                   | `src/actions.js` `syncAll`                                                                      |
| Points pools: give, remove, spend  | `src/actions.js` `poolGive`, `poolRemove`, `poolSpend`                                          |
| Which pool a command works on      | `src/actions.js` `activePool`; `src/commands.js` `targetPool`                                   |
| Pool markers                       | `src/actions.js` `poolMarker`, `syncPool`                                                       |
| Add, delete and change pools       | `src/state.js` `addPool`, `deletePool`, `validatePoolField`; `src/commands.js` `handlePoolEdit` |
| Pools card                         | `src/menu.js` `showPools`                                                                       |

## Sheets, Markers and Party

| What                         | Where                                                 |
| ---------------------------- | ----------------------------------------------------- |
| Which sheet a character uses | `src/sheet.js` `sheetKind`                            |
| Read / write inspiration     | `src/sheet.js` `readInspiration`, `writeInspiration`  |
| Where a pool is kept         | `src/sheet.js` `locatePool`, `poolAttributeName`      |
| Read / write a pool          | `src/sheet.js` `readPool`, `writePool`                |
| 2024 sheet store             | `src/sheet.js` `readStore`, `inspirationFromStore`    |
| Rules edition and wording    | `src/sheet.js` `rulesFor`; `src/actions.js` `termFor` |
| Marker list and lookup       | `src/markers.js`                                      |
| Who controls a character     | `src/party.js` `canControl`, `ownerIds`               |
| Party members                | `src/party.js` `partyMembers`                         |
| Selection and `--ids`        | `src/party.js` `resolveCharacters`                    |

## Menus and Handouts

| What                           | Where                                        |
| ------------------------------ | -------------------------------------------- |
| GM menu, settings              | `src/menu.js` `showMainMenu`, `showSettings` |
| Party overview, player card    | `src/menu.js` `showParty`, `showPlayerCard`  |
| Status, help                   | `src/menu.js` `showStatus`, `showHelp`       |
| Help and Command Deck handouts | `src/journals.js`                            |
| Chat cards and buttons         | `src/chat.js`                                |

## State, Settings and Text

| What                      | Where                                                             |
| ------------------------- | ----------------------------------------------------------------- |
| Defaults and option lists | `src/constants.js`                                                |
| Setting validation        | `src/state.js` `validateConfigValue`                              |
| 0.1.x migration           | `src/state.js` `convertLegacyConfig`, `initialiseState`           |
| One-Click useroptions     | `src/state.js` `applyGlobalConfig`                                |
| Last known values         | `src/state.js` `getKnown`, `setKnown`                             |
| Undo and offers           | `src/state.js` `pushUndo`, `takeUndo`, `createOffer`, `takeOffer` |
| English text              | `src/locales/locale/en-US.js`                                     |
