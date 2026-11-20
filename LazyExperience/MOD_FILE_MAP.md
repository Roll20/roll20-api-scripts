# LazyExperience — Mod File Map

A quick reference for where to find each feature in the source.

## Startup and events

| Task                                   | File           | Key function            |
| -------------------------------------- | -------------- | ----------------------- |
| Roll20 event registration              | `src/index.js` | `registerEventHandlers` |
| Startup, migration, handouts, greeting | `src/index.js` | `checkInstall`          |
| TokenMod and DeathTracker hooks        | `src/index.js` | `observeOtherMods`      |
| Public API                             | `src/index.js` | `publishApi`            |
| 0.1 state migration                    | `src/state.js` | `migrateLegacy`         |
| One-Click options                      | `src/state.js` | `applyGlobalConfig`     |

## Commands and cards

| Task                                | File              | Key function                                               |
| ----------------------------------- | ----------------- | ---------------------------------------------------------- |
| Command words and the `!xp` alias   | `src/commands.js` | `activeCommands`, `shortAliasAllowed`                      |
| Parse and route subcommands         | `src/commands.js` | `handleInput`, `run`                                       |
| Which characters a command is for   | `src/commands.js` | `targetCharacters`, `targetTokens`                         |
| Setting checks                      | `src/commands.js` | `validateSetting`, `handleSet`                             |
| Menu, Party, settings, status cards | `src/menu.js`     | `showMainMenu`, `showRoster`, `showSettings`, `showStatus` |

## XP

| Task                             | File             | Key function                      |
| -------------------------------- | ---------------- | --------------------------------- |
| Add to the pool / instant payout | `src/session.js` | `addToPool`                       |
| Bonus XP                         | `src/session.js` | `addBonus`                        |
| Write XP to sheets, level checks | `src/session.js` | `pay`                             |
| End of session                   | `src/session.js` | `endSession`, `previewPayout`     |
| Undo                             | `src/session.js` | `undoLast`                        |
| Party, shares and the split      | `src/roster.js`  | `getRoster`, `shareOf`, `splitXp` |

## Sheets and systems

| Task                       | File             | Key function                                       |
| -------------------------- | ---------------- | -------------------------------------------------- |
| Profiles and detection     | `src/systems.js` | `PROFILES`, `detectProfile`, `profileForCharacter` |
| Pathfinder 1E tracks       | `src/systems.js` | `parseTrackPlan`, `trackNextXp`, `withTrack`       |
| Write the next-level box   | `src/sheets.js`  | `writeNextBox`                                     |
| Read XP, level, next level | `src/sheets.js`  | `readProgress`, `readField`                        |
| Write XP                   | `src/sheets.js`  | `addXp`, `writeXp`, `addLedgerRow`                 |
| Creature XP                | `src/sheets.js`  | `readCreatureXp`                                   |

## Defeats and levels

| Task                       | File            | Key function                                |
| -------------------------- | --------------- | ------------------------------------------- |
| Token change (bar, marker) | `src/kills.js`  | `handleTokenChange`, `defeatSource`         |
| Linked HP attribute        | `src/kills.js`  | `handleAttributeChange`                     |
| DeathTracker status        | `src/kills.js`  | `handleDeathTrackerStatus`                  |
| Prompt, confirm, ignore    | `src/kills.js`  | `noticeDefeat`, `confirmKill`, `ignoreKill` |
| Level-up notices           | `src/levels.js` | `checkLevelUp`, `announceLevel`             |

## Handouts

| Task               | File              | Key function                     |
| ------------------ | ----------------- | -------------------------------- |
| Help, Command Deck | `src/journals.js` | `buildHelpHtml`, `buildDeckHtml` |
| Session Log        | `src/journals.js` | `logSession`, `buildLogHtml`     |
| Install or refresh | `src/journals.js` | `installHandouts`                |
