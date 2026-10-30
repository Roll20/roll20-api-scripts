# TaskAutomation — Mod File Map

A quick reference for where to find each feature in the source.

## Entry Point & Startup

| Task                            | File              | Key function                                     |
| ------------------------------- | ----------------- | ------------------------------------------------ |
| `ready` and command handlers    | `src/index.js`    | `registerEventHandlers`                          |
| Startup and recovery order      | `src/index.js`    | `checkInstall`                                   |
| Hooks between services          | `src/index.js`    | `wireHooks`                                      |
| Public API (`TaskAutomation.*`) | `src/index.js`    | `publishApi`                                     |
| Load and migrate state          | `src/state.js`    | `initialiseState`, `migrateState`                |
| Boot record and recovery        | `src/recovery.js` | `startBoot`, `recoverState`, `releaseAdmissions` |
| Recover one run                 | `src/executor.js` | `recoverInstance`, `reconcileEntry`              |

## Scheduling

| Task                        | File               | Key function                           |
| --------------------------- | ------------------ | -------------------------------------- |
| The single timer            | `src/scheduler.js` | `createScheduler` (`arm`, `wake`)      |
| Heap                        | `src/heap.js`      | `heapPush`, `heapPop`, `jobBefore`     |
| Job handlers and hooks      | `src/runtime.js`   | `onJob`, `schedule`, `provide`, `call` |
| Maintenance and checkpoints | `src/recovery.js`  | `armMaintenance`                       |

## Definitions

| Task                             | File                 | Key function                                           |
| -------------------------------- | -------------------- | ------------------------------------------------------ |
| Validate a definition            | `src/schema.js`      | `validateDefinition`                                   |
| Compile blocks                   | `src/schema.js`      | `compileDefinition`                                    |
| Forever-loop safety, call cycles | `src/schema.js`      | `blockAlwaysSuspends`, `findCallCycle`                 |
| Step catalogue                   | `src/catalogue.js`   | `STEP_SPECS`, `replayClass`                            |
| Drafts, publish, enable          | `src/definitions.js` | `updateDraft`, `publish`, `setEnabled`, `validateBody` |
| Clone, archive, purge            | `src/definitions.js` | `cloneRecord`, `archiveRecord`, `purgeRecord`          |
| Import, export                   | `src/definitions.js` | `importDefinition`, `exportDefinition`                 |
| Templates                        | `src/templates.js`   | `TEMPLATES`                                            |

## Running Tasks

| Task                          | File                 | Key function                                                     |
| ----------------------------- | -------------------- | ---------------------------------------------------------------- |
| Admission and concurrency     | `src/executor.js`    | `admitRun`, `enqueue`, `drainQueue`, `checkCircuit`              |
| Step loop                     | `src/executor.js`    | `runBranch`, `execStep`, `popFrame`, `loopContinues`             |
| Waits and awaited events      | `src/executor.js`    | `execWait`, `execAwait`, `deliverEvent`                          |
| Calls and parallel joins      | `src/executor.js`    | `execCall`, `execParallel`, `onSubBranchTerminal`                |
| Actions through the journal   | `src/executor.js`    | `execAction`, `actionContext`, `startAsync`                      |
| Errors, retries, review       | `src/executor.js`    | `handleStepError`, `enterReview`, `decideReview`                 |
| Pause, resume, cancel, finish | `src/executor.js`    | `pauseRun`, `resumeRun`, `cancelRun`, `finalize`                 |
| References and templates      | `src/executor.js`    | `resolveRef`, `evalExpr`, `render`                               |
| Expressions                   | `src/expressions.js` | `evaluate`, `validateExpression`, `renderTemplate`               |
| Built-in actions              | `src/actions.js`     | `ACTIONS`                                                        |
| Targets and object reads      | `src/objects.js`     | `resolveBindings`, `readProperty`, `tokenSides`, `writableImage` |

## Triggers and Schedules

| Task                              | File                | Key function                                                      |
| --------------------------------- | ------------------- | ----------------------------------------------------------------- |
| Native subscriptions              | `src/triggers.js`   | `registerNativeHandlers`                                          |
| Route an event                    | `src/triggers.js`   | `routeEvent`, `deliverToAwaits`, `handleTrigger`                  |
| Filters                           | `src/triggers.js`   | `matchFilter`                                                     |
| Debounce, cooldown, burst         | `src/triggers.js`   | `handleTrigger`, `debounce`, `onDebounce`                         |
| Turn order changes                | `src/triggers.js`   | `onTurnOrder`, `parseTurnOrder`                                   |
| Signals                           | `src/triggers.js`   | `raiseSignal`, `playerSignals`                                    |
| Echo suppression, internal events | `src/triggers.js`   | `noteOwnWrite`, `emitInternal`                                    |
| Offline reconciliation            | `src/triggers.js`   | `reconcileBaselines`                                              |
| Schedule arithmetic               | `src/recurrence.js` | `nextAtOrAfter`, `countBetween`, `normaliseSpec`                  |
| Schedule records and occurrences  | `src/schedules.js`  | `addSchedule`, `syncDefinitionSchedules`, `admitOccurrence`       |
| Overdue policies                  | `src/schedules.js`  | `handleOverdue`, `recoverSchedules`                               |
| Pause/resume, offsets, recovery   | `src/schedules.js`  | `pauseSchedule`, `resumeSchedule`, `applyOffset`, `applyRecovery` |

## Permissions and Integrations

| Task                       | File                  | Key function                                                            |
| -------------------------- | --------------------- | ----------------------------------------------------------------------- |
| Who may start or manage    | `src/permissions.js`  | `canStart`, `canManageRun`                                              |
| Effect-time authority      | `src/permissions.js`  | `checkEffectAuthority`                                                  |
| Confirmations, rate limits | `src/permissions.js`  | `issueConfirmation`, `consumeConfirmation`, `allowCommand`              |
| Adapters                   | `src/integrations.js` | `registerAdapter`, `drainRegistrationQueue`, `registerReferenceAdapter` |

## Commands, Dashboard and Text

| Task                      | File                          | Key function                                       |
| ------------------------- | ----------------------------- | -------------------------------------------------- |
| Handle chat input         | `src/commands.js`             | `handleInput`, `route`, `parseOptions`             |
| Definition commands       | `src/commands.js`             | `commandDefinition`, `editStep`, `importCommand`   |
| Run commands              | `src/commands.js`             | `commandInstance`, `startCommand`, `decideCommand` |
| Schedule commands         | `src/commands.js`             | `commandSchedule`, `addScheduleCommand`            |
| Recovery, stop-all        | `src/commands.js`             | `commandRecovery`, `commandStopAll`                |
| Dashboard rendering       | `src/dashboard.js`            | `renderDashboard`, `renderPlayerView`              |
| Dashboard writes          | `src/dashboard.js`            | `markDirty`, `flushDashboard`, `ensureDashboard`   |
| GM notices                | `src/dashboard.js`            | `noticeGm`                                         |
| Help handout              | `src/journals.js`             | `installHelpHandout`, `buildHelpHtml`              |
| Incidents, history, audit | `src/audit.js`                | `createIncident`, `recordHistory`, `audit`         |
| Chat cards and errors     | `src/chat.js`                 | `whisper`, `whisperError`                          |
| English text              | `src/locales/locale/en-US.js` |                                                    |
