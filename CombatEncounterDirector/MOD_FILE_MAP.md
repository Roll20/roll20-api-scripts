# Combat Encounter Director — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                       | File           | Key function            |
| -------------------------- | -------------- | ----------------------- |
| Roll20 event registration  | `src/index.js` | `registerEventHandlers` |
| Startup / install journals | `src/index.js` | `checkInstall`          |

## Command Routing

| Task                     | File              | Key function   |
| ------------------------ | ----------------- | -------------- |
| Handle `!ced` chat input | `src/commands.js` | `handleInput`  |
| Route subcommands        | `src/commands.js` | `routeCommand` |
| Quick-action menu        | `src/commands.js` | `showMainMenu` |
| Help reference card      | `src/commands.js` | `showHelp`     |

## Party Scaling

| Task                             | File              | Key function                                              |
| -------------------------------- | ----------------- | --------------------------------------------------------- |
| Resolve party preset             | `src/scaling.js`  | `resolvePartyPreset`                                      |
| Resolve preset by party size     | `src/scaling.js`  | `resolvePartyPresetBySize`                                |
| Apply scaling to selected tokens | `src/scaling.js`  | `applyScalingToSelected`                                  |
| Validate HP %, AC modifier, etc. | `src/scaling.js`  | `parseHpPercent`, `parseAcModifier`, `parseDamagePercent` |
| Pending scaling session state    | `src/commands.js` | `pendingScaling` (Map)                                    |

## Boss Tools

| Task                      | File            | Key function                |
| ------------------------- | --------------- | --------------------------- |
| Resolve boss preset       | `src/bosses.js` | `resolveBossPreset`         |
| Apply preset to one token | `src/bosses.js` | `applyBossPresetToToken`    |
| Apply preset to selected  | `src/bosses.js` | `applyBossPresetToSelected` |

## Reinforcements

| Task                            | File                    | Key function              |
| ------------------------------- | ----------------------- | ------------------------- |
| Duplicate a token N times       | `src/reinforcements.js` | `duplicateToken`          |
| Duplicate selected tokens       | `src/reinforcements.js` | `duplicateSelectedTokens` |
| Auto-enumerate selected         | `src/reinforcements.js` | `enumerateSelectedTokens` |
| Strip trailing number from name | `src/reinforcements.js` | `stripEnumeration`        |

## Battlefield Control

| Task                            | File                 | Key function               |
| ------------------------------- | -------------------- | -------------------------- |
| Move tokens to layer            | `src/battlefield.js` | `moveSelectedToLayer`      |
| Hide selected (→ GM layer)      | `src/battlefield.js` | `hideSelectedTokens`       |
| Reveal selected (→ token layer) | `src/battlefield.js` | `revealSelectedTokens`     |
| Save positions                  | `src/battlefield.js` | `saveSelectedPositions`    |
| Restore positions               | `src/battlefield.js` | `restoreSelectedPositions` |

## Encounter Templates

| Task                      | File                | Key function              |
| ------------------------- | ------------------- | ------------------------- |
| Save page encounter       | `src/encounters.js` | `saveEncounter`           |
| Load encounter template   | `src/encounters.js` | `loadEncounter`           |
| Delete encounter template | `src/encounters.js` | `deleteEncounterTemplate` |
| List template names       | `src/encounters.js` | `listEncounterNames`      |

## Reset & Recovery

| Task                      | File            | Key function             |
| ------------------------- | --------------- | ------------------------ |
| Reset selected tokens     | `src/reset.js`  | `resetSelectedTokens`    |
| Reset all tokens          | `src/reset.js`  | `resetAllTokens`         |
| Reset current page tokens | `src/reset.js`  | `resetCurrentPageTokens` |
| Restore token from record | `src/tokens.js` | `restoreTokenFromRecord` |

## Reporting

| Task                   | File               | Key function            |
| ---------------------- | ------------------ | ----------------------- |
| Refresh page report    | `src/reporting.js` | `refreshStatusReport`   |
| Report selected tokens | `src/reporting.js` | `reportSelectedTokens`  |
| Report changed tokens  | `src/reporting.js` | `reportChangedTokens`   |
| Clear status journal   | `src/reporting.js` | `clearStatusReport`     |
| Build HTML table       | `src/reporting.js` | `buildStatusReportHtml` |
| Write handout content  | `src/reporting.js` | `updateStatusHandout`   |

## Journals

| Task                          | File              | Key function                 |
| ----------------------------- | ----------------- | ---------------------------- |
| Build control panel HTML      | `src/journals.js` | `buildControlPanelHtml`      |
| Install/update control panel  | `src/journals.js` | `installControlPanelHandout` |
| Install/create status journal | `src/journals.js` | `installStatusHandout`       |

## State Management

| Task                       | File           | Key function                       |
| -------------------------- | -------------- | ---------------------------------- |
| Initialize / migrate state | `src/state.js` | `ensureState`                      |
| Read/write config          | `src/state.js` | `getConfig`, `setConfig`           |
| Import One-Click options   | `src/state.js` | `applyGlobalConfig`                |
| Get/set token record       | `src/state.js` | `getTokenRecord`, `setTokenRecord` |
| Remove token record        | `src/state.js` | `removeTokenRecord`                |
| Get/set encounter template | `src/state.js` | `getEncounter`, `setEncounter`     |

## Token Helpers

| Task                             | File            | Key function            |
| -------------------------------- | --------------- | ----------------------- |
| Read HP from token               | `src/tokens.js` | `readTokenHp`           |
| Read AC from token               | `src/tokens.js` | `readTokenAc`           |
| Write HP to token                | `src/tokens.js` | `writeTokenHp`          |
| Write AC to token                | `src/tokens.js` | `writeTokenAc`          |
| Capture original values snapshot | `src/tokens.js` | `captureOriginalValues` |
| Ensure/create token record       | `src/tokens.js` | `ensureTokenRecord`     |
| Get selected tokens from message | `src/tokens.js` | `getSelectedTokens`     |
| Apply HP modifier                | `src/tokens.js` | `applyHpToToken`        |
| Apply AC modifier                | `src/tokens.js` | `applyAcToToken`        |

## Chat / UI Components

| Task                    | File          | Key function     |
| ----------------------- | ------------- | ---------------- |
| Whisper to player       | `src/chat.js` | `whisper`        |
| Whisper to all GMs      | `src/chat.js` | `whisperGm`      |
| Whisper warning         | `src/chat.js` | `whisperWarning` |
| Whisper error with hint | `src/chat.js` | `whisperError`   |
| Build styled card       | `src/chat.js` | `buildCard`      |
| Build action button     | `src/chat.js` | `buildButton`    |
| Build key-value row     | `src/chat.js` | `buildRow`       |

## Constants & Preset Data

| Data               | File               | Key export                                  |
| ------------------ | ------------------ | ------------------------------------------- |
| Party-size presets | `src/constants.js` | `PARTY_PRESETS`                             |
| Boss presets       | `src/constants.js` | `BOSS_PRESETS`                              |
| Valid HP/AC bars   | `src/constants.js` | `VALID_HP_BARS`, `VALID_AC_BARS`            |
| Roll20 layer names | `src/constants.js` | `LAYER_TOKEN`, `LAYER_GM`, `LAYER_MAP`      |
| Color palette      | `src/constants.js` | `COLOR_*`                                   |
| Primary command    | `src/constants.js` | `COMMAND`                                   |
| State key          | `src/constants.js` | `STATE_KEY`                                 |
| Journal names      | `src/constants.js` | `JOURNAL_PANEL_NAME`, `JOURNAL_STATUS_NAME` |
