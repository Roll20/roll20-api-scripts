# TaskAutomation — Developer Guide

## Project Layout

| Path                          | Purpose                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| `src/`                        | ES module source. `src/index.js` is the Rollup entry point.            |
| `src/locales/locale/*.js`     | Translations. `en-US.js` is the source.                                |
| `tests/`                      | Node test runner suites (`*.test.mjs`) and the Roll20 API stub.        |
| `scripts/`                    | Build, version bump, locale sync, examples and JSON Schema generators. |
| `examples/`                   | Generated JSON of every template (`npm run examples`).                 |
| `schema/`                     | Generated JSON Schema for task definitions (`npm run schema`).         |
| `docs/`                       | Authoring, examples, operations and adapter guides.                    |
| `TaskAutomation.js`           | Generated bundle for the One-Click library. Do not edit.               |
| `<version>/TaskAutomation.js` | Generated snapshot for each released version.                          |
| `script.json`                 | One-Click metadata and useroptions.                                    |

## Architecture

Dependencies flow inward: Roll20 globals are only touched by `host.js` (and the `state` root through it); the core modules are pure and unit-tested directly.

```
commands ─┬─ definitions ── schema ── catalogue, expressions, recurrence
          ├─ executor ───── actions ── objects ── host
          ├─ schedules ──── executor
          ├─ triggers ───── executor
          ├─ recovery ───── executor, schedules, triggers
          └─ dashboard ──── executor, schedules
runtime (scheduler + hooks) and state are shared by all.
```

Services that would otherwise import each other in a circle call through **hooks** in `runtime.js` (`provide`/`call`/`maybeCall`), wired in `index.js`: `dashboardDirty`, `emitEvent`, `noteOwnWrite`, `awaitsChanged`, `definitionChanged`, `removeSchedule`, `runTerminal`, `adapterKnown`, `adapterStatus`, `adapterRegistered`, `notifyGm`. There are no circular imports.

### Module Responsibilities

| Module            | Responsibility                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`        | Startup (`checkInstall`), hook wiring, public `TaskAutomation` API, `ready` and command handlers.                                              |
| `host.js`         | The Roll20 boundary: objects, chat, pings, effects, timers, clock, GM check, useroptions.                                                      |
| `runtime.js`      | The scheduler instance, job handler registry, hooks, admission gate flags, diagnostics.                                                        |
| `heap.js`         | Pure binary min-heap ordered by (dueAt, priority, sequence).                                                                                   |
| `scheduler.js`    | Pure single-timeout scheduler: keyed jobs, lazy cancellation, generation guards, clamping, bounded draining.                                   |
| `state.js`        | Persistent state shape, migrations with backup, config validation, IDs, size estimate.                                                         |
| `catalogue.js`    | Pure step catalogue: fields, replay classes, player safety; event and trigger types.                                                           |
| `expressions.js`  | Pure safe expressions: validation, evaluation with MISSING, templates.                                                                         |
| `recurrence.js`   | Pure schedule arithmetic: once, intervals, daily/weekly at a fixed offset, counts without enumeration.                                         |
| `schema.js`       | Pure definition validator and compiler (block keys), forever-loop safety, call cycles.                                                         |
| `definitions.js`  | Drafts, publish (immutable revisions), enable/disable, clone, archive, purge, import/export, step editing helpers.                             |
| `objects.js`      | Roll20 reads: bindings, allowlisted properties, control, characters, attributes, token sides, recipients.                                      |
| `permissions.js`  | Start/manage checks, effect-time authority, rate limits, confirmation tokens.                                                                  |
| `actions.js`      | Built-in actions with chunking, prepare-before-write and typed errors.                                                                         |
| `errors.js`       | Typed task errors (code, reason, transient, uncertain).                                                                                        |
| `executor.js`     | Admission and concurrency, instances, frames, flow steps, journal, async adapters, joins, pause/resume/cancel, review, restart reconciliation. |
| `triggers.js`     | Native subscriptions, event envelopes, filters, cooldown/debounce/burst, awaits, signals, echo suppression, baselines.                         |
| `schedules.js`    | Schedule records, cursors, occurrence keys, overdue policies, pause/resume, offsets, recovery.                                                 |
| `recovery.js`     | Boot record, recovery protocol, maintenance and checkpoint jobs.                                                                               |
| `audit.js`        | Audit trail, run history, incidents with grouping and overflow.                                                                                |
| `integrations.js` | Adapter registry, registration queue, reference adapter.                                                                                       |
| `dashboard.js`    | Dashboard and player view rendering, throttled writes, permission drift, GM notices.                                                           |
| `journals.js`     | Help handout.                                                                                                                                  |
| `commands.js`     | `!taskautomation` grammar, option parsing, all command handlers and chat cards.                                                                |
| `templates.js`    | The montage fixture and seven worked examples.                                                                                                 |
| `chat.js`         | Chat cards, buttons, whispers and errors (shared style with the other Mods).                                                                   |
| `i18n.js`         | Translation lookup.                                                                                                                            |
| `constants.js`    | Build placeholders, names, statuses, job kinds, limits, timing, config defaults, colours.                                                      |
| `utils.js`        | Pure helpers: escaping, parsing, tokenizer, plain-data checks, hashing, markers.                                                               |

## How It Works

### The one timer

`scheduler.js` keeps every job in a heap and arms **one** `setTimeout` for the earliest deadline. Jobs are continuations, retries, wait timeouts, schedule occurrences, debounce flushes, queue expiry, dashboard writes, maintenance and checkpoints. Keyed jobs replace each other (`run:<id>:<branch>`, `sched:<id>`, `dashboard`). Cancelling is lazy; the heap is compacted when cancelled entries dominate. Each arm captures a generation, so a callback queued before `clearTimeout` does nothing. Waits longer than 2,147,000,000 ms are clamped and re-checked. A wake runs at most 25 jobs or 15 ms of work, then yields 10 ms. Nothing else in the Mod calls `setTimeout` or `setInterval`; the tests fail if more than one timer is ever live.

Persistent records are the authority: on startup the heap is rebuilt from instance waits, schedule cursors, debounce state and queue entries.

### Runs

A run (`state.instances[id]`) pins a definition revision and has branches. Each branch has a stack of **frames** `{block, index, owner, loop, choice}`; block keys come from `compileDefinition` (`root`, `<step>/steps`, `<step>/then`, `<step>/else`, `<step>/branch/<b>`). The executor never relies on the JavaScript call stack across a wait: a wait advances the frame index, records `branch.wait`, bumps `branch.gen` and schedules a job carrying `{runId, branchId, gen, bgen}`. A job whose generations no longer match is ignored.

`runBranch` executes at most 50 steps per job and fails a branch after 500 steps without suspending (the runaway breaker behind the validator's forever-loop check).

Parallel branches are cooperative: each has its own frames and copied variables; the parent waits with `{kind: 'join'}` and `onSubBranchTerminal` decides `all`, `anySuccess` or `race`.

### The action journal

Each non-pure action attempt has a journal entry keyed `branch/step/iterationPath/attempt`. It is written as `prepared` with the intended values (`ctx.prepare`, e.g. `resolvedSide`, attribute old/new) before any write, then `confirmed` or `dispatched`. On restart `recoverInstance` reconciles `prepared` entries by replay class: confirmed by comparing live objects, re-applied for absolute writes without `expect`, skipped for ephemeral effects, otherwise review. Async adapter calls from an earlier boot are checked with the adapter's `status` or reviewed.

### Triggers

Native handlers are registered once after ready. Events are normalised to `{id, type, observedAt, source, objectType, objectId, pageId, characterId, name, value, actor, old, new, changed, correlation}` with only allowlisted properties. Awaiting runs are matched first, then triggers from an index by event type (rebuilt when definitions change). Writes by the Mod are announced as internal events via a queued job and noted for echo suppression; internal events of game types only reach definitions that opt in.

### Schedules

Each time trigger (or `schedule add`) is a record with a normalised spec, a revision and a cursor. An occurrence's key is `(schedule, revision, intendedDueAt)`, kept in a short ledger. `handleOverdue` counts misses with `countBetween` (arithmetic, never enumeration) and applies the overdue mode once.

## State Structure

`state.TaskAutomation`:

```js
{
  schemaVersion: 1, releaseVersion: '1.0.0', createdAt,
  boot: { id, at, count, previousId, previousObservedAt, lastObservedAt },
  config: { language, dashboardRows, playerView, diagnostics, checkpointMs, privateChatTriggers,
            roundAnchor, graceMs, lateWindowMs },
  counters: { id, token },
  halted: null | { at, by },
  definitions: { [id]: { id, name, rev, enabled, archived, disabledReason, draft, current,
                         revisions: { [n]: definition }, createdAt, createdBy, updatedAt,
                         publishedAt, publishedBy } },
  schedules: { [trigger-N]: { id, definitionId, triggerId, source, spec, revision, rev, paused,
                              pausedAt, ended, overdue, bindings, params,
                              cursor: { nextDueAt, lastDueAt, count, waitingRun, admitted: [keys] } } },
  triggerState: { ['def/trigger[:object]']: { cooldownUntil, burst, debounce, suppressed, dropped, fired } },
  instances: { [run-N]: { id, revision, generation, definitionId, definitionRevision, name, status,
                          initiatorPlayerId, authority, params, bindings, event, trigger, occurrence,
                          parentId, parentBranchId, parentStepId, owned, children, correlation,
                          rerunOf, createdAt, startedAt, completedAt, intendedDueAt, latenessMs,
                          branches: { [id]: { id, label, parentId, stepId, status, frames, variables,
                                              wait, gen, consecutive, attempts, error } },
                          nextBranch, journal, timeline, pause, review, outcome, error, effects, bootId } },
  queues: { [definitionId]: [{ id, definitionId, revision, admittedAt, expiresAt, opts }] },
  incidents: { [incident-N]: { id, group, kind, cause, evidence, range, count, definitionId,
                               scheduleId, runId, policy, proposal, status, createdAt, updatedAt, resolution } },
  history: [ run summaries ], audit: [ entries ],
  confirmations: { [token]: { playerId, op, payload, expiresAt } },
  imports: { [playerId]: { parts, received, expiresAt } },
  circuit: { [definitionId]: { start, count } },
  baselines: { ['def/trigger']: { [objectId]: values } },
  dashboard: { handoutId, playerHandoutId, helpHandoutId, view, page, lastHash, playerHash,
               helpHash, lastWriteAt, recreatedAt, drift },
  stats: { admitted, rejected, suppressed, dropped, coalesced, completed, failed },
  notices: { useroptions },
}
```

`instances` keeps every active run and the 20 most recent finished ones; `history` keeps summaries.

### Migrations

`MIGRATIONS[n]` turns schema `n` into `n + 1`. `initialiseState` keeps a backup under `state.TaskAutomationBackup` while migrating (when under 256 KiB) and deletes it on success. State from a newer schema, or state that is not recognisable, is left untouched and the Mod runs nothing (`runtime.disabled`).

## Build System

```bash
npm install
npm run build -- 1.0.0         # set the version and build
npm run build -- --no-bump     # rebuild without changing the version
npm test                       # all tests (build first)
npm run examples               # regenerate examples/*.json from src/templates.js
npm run schema                 # regenerate schema/task-definition.schema.json
npm run format
```

`scripts/build.mjs` writes `TaskAutomation.js` and `<version>/TaskAutomation.js`, wrapped in `const TaskAutomationMod = (() => { … })();`. The public API is published on `globalThis.TaskAutomation` from `index.js`. `scripts/bump-version.mjs` keeps the last five stable versions in `script.json`'s `previousversions`; every listed version needs its folder.

## Tests

| Suite                 | Covers                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheduler.test.mjs`  | Heap order, single timer, re-arming, stale callbacks, clamping, budgets, clock jumps.                                                       |
| `core.test.mjs`       | Tokenizer, parsing, plain-data checks, expressions, recurrence, validator.                                                                  |
| `jsonschema.test.mjs` | The generated JSON Schema accepts the examples, rejects bad input and is up to date.                                                        |
| `examples.test.mjs`   | The montage and the seven worked examples end to end, including restarts.                                                                   |
| `engine.test.mjs`     | Flow steps, concurrency, pause/resume, stale links, children, joins, adapters, triggers, schedules, circuit breaker, stop-all, drafts.      |
| `recovery.test.mjs`   | Restarts during waits, pauses, actions, adapter calls, joins and loops; unreadable and newer state; migrations.                             |
| `security.test.mjs`   | Command prefix, API-origin denial, injection, prototype pollution, player access, signals, confirmations, dashboard privacy and throttling. |
| `load.test.mjs`       | 100 definitions and runs and a 1,000-job burst on one timer.                                                                                |

`tests/roll20-stub.mjs` runs the bundle in a `vm` context with fake objects, events, chat, timers and a clock (`advance`, `jump`, `restart`). The stub cannot reproduce rendering, permissions, sheet workers, real handout links or Roll20's event quirks: see `TESTING.md`.

## Adding a Step Type

1. Add its fields, replay class and `playerSafe`/`gmOnly` to `STEP_SPECS` in `catalogue.js`.
2. Implement it in `ACTIONS` (`actions.js`): resolve targets with `ctx.targets`, call `ctx.authorise`, `ctx.prepare` before writing, throw `taskError`s, return `{result}` (or `{async}` for adapters).
3. If it can be interrupted, teach `reconcileEntry` in `executor.js` how to confirm it.
4. Add `stepTypes.<type>` and any `runErrors` keys to `en-US.js`, document it in `docs/AUTHORING.md`, run `npm run schema`, and add a test.

## Adding a Command

1. Add the handler in `commands.js` (with `parseOptions` allowlists) and route it.
2. Add `help.<key>` and messages to `en-US.js`, and the row to `HELP_COMMANDS` in `constants.js` (used by `help` and the Help handout) and the README.
3. Mutating commands from links take `--rev`; destructive ones use `issueConfirmation`/`consumeConfirmation`.
4. Add an end-to-end test.

## Internationalisation (i18n)

`t(key, locale, vars)` and `tRaw` fall back to en-US. Version 1.0.0 ships en-US only. To add a language, add it to `LOCALE_DEFINITIONS` in `src/locales/metadata.js`, copy `en-US.js` to `<code>.js`, import it in `src/locales/index.js`, then run `npm run sync-locales -- --locale=<code> --yes` and review the text.

## Coding Standards

- Modern JavaScript (ES2020+), strict mode via the Rollup IIFE wrapper.
- Prettier: single quotes, trailing commas (ES5), 100-character lines.
- JSDoc on every function.
- Functional style; no classes.
- One concern per module; no circular imports; Roll20 globals only through `host.js`.
- Everything typed is validated against an allowlist; everything shown is escaped for its context.
- Every user-facing failure says what went wrong and how to fix it; stack traces go to the API console only.
- No timers outside `scheduler.js`.

## Roll20 API Notes

- `state` persists between sandbox runs, with no flush acknowledgement: checkpoints reduce ambiguity, they do not guarantee durability.
- API writes do not raise `change:` events; the Mod announces its own changes.
- `ready` fires after Roll20 has replayed `add:` events for existing objects; native handlers are registered afterwards.
- `msg.playerid` is the only trustworthy sender; `'API'` is another script.
- Selection exists only on the incoming command message.
- Handout `notes`/`gmnotes` are written with `set`; reading them needs a callback, which the Mod never needs because state is the source of truth.
- Token sides are URL-encoded in `sides`; `imgsrc` must be a library `thumb` URL.
