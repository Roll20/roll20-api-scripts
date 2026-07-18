# Changelog

All notable changes to GameAssist are documented in this file.

This changelog is intentionally detailed. It records not only visible features, but also implementation locations, replaced behavior, design rationale, compatibility boundaries, state/migration effects, verification evidence, exclusions, and rollback posture. Line references describe the named release artifact and may move in later revisions; MECHSUITS section names are the more stable long-term locator.

---

## Release Ledger

| Revision | Status | Role |
| --- | --- | --- |
| **v0.1.4.7** | Release candidate; automated and Roll20 sandbox verification passed, merge pending | Standalone TokenMod and StatusInfo interoperability |
| **v0.1.4.6** | Merged release | DM-readable system health and troubleshooting status |
| **v0.1.4.5** | Merged release | NPC death-history buckets, handouts, and arc notes |
| **v0.1.4.4** | Merged release | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.2** | Release candidate; automated verification complete, Roll20 smoke confirmation pending | Diagnostic and migration-readiness release |
| **v0.1.4.1** | Preserved rollback baseline | Stability-first repair of the uploaded v0.1.4 baseline |
| **v0.1.4** | Uploaded stable-but-limping baseline | Source used to build v0.1.4.1 |
| **Attempted v0.1.5** | Failed upgrade; never released | Review source for selected fixes only |
| **v0.1.3** | Prior development milestone; supplied notes retained below | Core lifecycle, metrics, helper, and module-hardening work |
| **v0.1.2** | Historical release | Roll20 packaging and initial MECHSUITS structural wrap |
| **v0.1.1.2** | Historical release | CritFumble natural-1 bugfix |
| **v0.1.1.1** | Historical release | Quiet startup and logging improvements |
| **v0.1.1.0** | Initial public release | Original four-module framework |

### Release-history notes

- v0.1.4.2 requires Roll20 API sandbox smoke confirmation before it should be used as a confirmed table build.
- v0.1.4.1 remains available as the rollback script during v0.1.4.2 confirmation.
- The attempted v0.1.5 file was not imported wholesale. Its unsafe or structurally unreliable changes were rejected; only isolated reviewed ideas were ported.
- Older supplied notes used “Unreleased” and “Staging” labels for v0.1.3–v0.1.5 work. Those records are retained below as historical development evidence rather than silently discarded.
- Where the supplied historical record did not establish a release date, this changelog does not invent one.

---

## [Unreleased]

### Immediate release work

- Complete the real Roll20 smoke-test checklist for v0.1.4.2.
  - Confirm the API sandbox saves and reloads without a red console exception.
  - Confirm the core ready whisper reports `0.1.4.2`.
  - Confirm `!ga-status`, `!ga-config modules`, `!ga-config list`, and `!ga-metrics`.
  - Confirm TokenMod-dependent modules report either `confirmed` or the expected `unverifiable` warning.
  - Confirm a real natural-1 attack, concentration workflow, NPC death/revival marker cycle, NPC HP roll, and module disable/re-enable cycle.
- Keep `GameAssist-v0.1.4.1.js` unchanged as the rollback baseline until the v0.1.4.2 smoke test is complete.
- Freeze broad GameAssist core development after v0.1.4.2 is confirmed so the compatibility-first bridge character-sheet project can begin on a stable foundation.

### Deferred work

- Validated configuration/state snapshot import and restoration.
  - Import requires schema validation, migration rules, preview/dry-run behavior, unknown-branch handling, and rollback semantics.
  - v0.1.4.2 intentionally exports configuration only and provides no import command.
- Native Mord character-sheet support.
  - This belongs to the bridge character-sheet project, not the v0.1.4.2 core release.
- Plugin loader or automatic third-party module discovery.
  - Roll20 does not expose a normal filesystem-style plugin directory.
  - Any future extension contract must be explicit and validated.
- Spell-specific concentration detection, spell names, duration tracking, expiration, and reminders.
- Cooldown, encounter, resource, condition, rest/recovery, and location/AoE modules.
- Rollable-table import/export.
- Expanded verbose-mode diagnostics.

### Explicitly not planned as “fixes”

- Do not route every command and event through the queue.
- Do not claim that a watchdog or timeout can terminate running JavaScript or Roll20 operations.
- Do not automatically delete unexpected state branches.
- Do not claim guaranteed external dependency discovery when Roll20 metadata may be unavailable.

---

## [0.1.4.2] – 2026-06-09

### Release definition

v0.1.4.2 is a **diagnostic and migration-readiness release**. It adds conservative state self-healing, an explicit public queue API, three-state dependency diagnostics, versioned configuration-only snapshots, and more truthful health reporting without changing normal bundled-module event execution.

The release was deliberately kept narrow:

- normal command and event handlers remain direct;
- gameplay-module implementations remain byte-for-byte aligned with the v0.1.4.1 module bodies;
- bootstrap changes are limited to state repair and dependency-status handling;
- no roadmap gameplay modules or character-sheet integration were added.

### Release artifacts

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| `GameAssist-v0.1.4.2.js` | Release-candidate script | `AB5E2EC627E9BD969997B9FEA0563ED6A9690BD958DD433A38C83FF7F8A3CB35` |
| `GameAssist-v0.1.4.1.js` | Rollback baseline | `E4072A73BECD73EFF4D185F4F30B4A4594DA21DFF85F2C9319F0DA1A55EB08B5` |
| `README-GameAssist-v0.1.4.2.md` | Long-form user/developer handbook | `180AFC8C12E1BFEEA11A9F1EDBC0FD83C115E1DA47867BD4DC1390DD8184289A` |
| `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md` | Release-specific Roll20 verification checklist | Included with release outputs |

### Version and MECHSUITS metadata

- Advanced the Roll20 header version, MECHSUITS banner `project_version`, and runtime `VERSION` constant to `0.1.4.2`.
  - Roll20 header: `GameAssist-v0.1.4.2.js` line 4.
  - Banner `project_version`: line 83.
  - Runtime `const VERSION = '0.1.4.2'`: line 574.
- Updated only the MECHSUITS sections that received meaningful behavior or contract changes:
  - `[GAMEASSIST:POLICY]`
  - `[GAMEASSIST:APP:UTILS]`
  - `[GAMEASSIST:CORE]`
  - `[GAMEASSIST:CORE:QUEUE]`
  - `[GAMEASSIST:CORE:OBJECT]`
  - `[GAMEASSIST:INTERFACES:COMMANDS]`
  - `[GAMEASSIST:BOOTSTRAP]`
- Preserved literal codename `GAMEASSIST`; no identifier normalization or tag renaming was performed.
- Preserved prior section commentary under `Prior notes` and added `Changed (v0.1.4.2)` records to the changed sections.
- Completed a structural audit for tag pairing, parent nesting, ancestor-only overlap, canonical-tree agreement, metadata presence, and required section footers.

### Added – State self-healing and audit safety

- Added conservative repair for known module state branches in `[GAMEASSIST:APP:UTILS]`.
  - `ensureStateRoot()` begins at line 276 and guarantees the core `state.GameAssist` containers exist.
  - Known module-branch repair logic records whether the missing/malformed item was the branch, `config`, or `runtime` at lines 333, 337, and 341.
  - `auditState()` begins at line 388.
  - `seedDefaults()` begins at line 423 and runs after repair.
- Known branch behavior:
  - If a known module branch is missing or malformed, GameAssist rebuilds a safe branch container.
  - If `config` is missing or malformed, GameAssist restores a valid object.
  - If `runtime` is missing or malformed, GameAssist restores a valid object.
  - Valid existing configuration values are preserved.
  - Repairs are logged and recorded through `recordMetric('state_repair', ...)` at line 414.
- Unknown branch behavior:
  - Unexpected keys are collected and warned about at line 399.
  - Unknown branches are left untouched during startup.
  - No automatic destructive cleanup occurs.
- Rationale:
  - Known GameAssist-owned shapes can be repaired safely.
  - Unknown branches may contain user data, abandoned module data, or future-extension data; deleting them automatically would be unsafe.
  - This state posture is important before character-sheet development because upgrades and new modules will increase persistent-state complexity.

### Added – Explicit state cleanup command

- Added GM-only `!ga-config cleanup` in `[GAMEASSIST:INTERFACES:COMMANDS]` at line 1448.
- Cleanup behavior:
  - Preserves known modules and core branches.
  - Deletes only unknown/orphaned branches after the GM explicitly invokes the command.
  - Reports the removed branch names or confirms that no orphaned branches were found.
- Safety boundary:
  - Cleanup is intentionally not executed during startup.
  - Documentation warns the GM to review state warnings before using cleanup.

### Added – Public opt-in queue API

- Exposed `GameAssist.enqueue(task, options)` in `[GAMEASSIST:CORE:OBJECT]` at line 1096.
- Public API behavior:
  - Requires `task` to be a function.
  - Returns `false` and warns when the task is invalid.
  - Returns `true` when accepted.
  - Accepts optional numeric `priority` and positive `timeout`.
  - Falls back to the established default timeout when no valid timeout is supplied.
  - Higher numeric priority runs first; equal-priority jobs preserve enqueue order.
- Existing queue implementation remains in `[GAMEASSIST:CORE:QUEUE]`:
  - `_enqueue(...)` begins at line 618.
  - The job-id stale-completion guard remains intact.
  - The queue continues to serialize only explicitly submitted work and module lifecycle transitions.
- Async contract:
  - Asynchronous queued work must return a Promise that settles when the queued portion is complete.
  - Merely starting `sendChat()` without returning a Promise would allow the queued task to appear complete too early.
- Timeout contract:
  - A timeout releases queue ownership so later jobs can proceed.
  - A timeout cannot cancel the underlying JavaScript callback, `sendChat()` call, or Roll20 operation.
  - The underlying work may finish later; the stale-job guard prevents that late completion from advancing the queue again.
- Rationale:
  - Future modules gain a supported serialization seam without imposing queue latency or coupling on every Roll20 event.

### Changed – Queue and watchdog truthfulness

- Updated `[GAMEASSIST:CORE:QUEUE]` narrative and footer to state the actual operational limit:
  - queue timeouts release the queue;
  - watchdog recovery releases a stuck busy state;
  - neither mechanism kills running JavaScript or Roll20 work.
- Preserved ordinary command/event execution as direct.
- Added `Queue Mode: explicit opt-in; normal event handlers execute directly` to `!ga-status` at line 1507.
- Rejected the old documentation claim that every inbound Roll20 event was queued and watchdog-controlled.
- Rationale:
  - Roll20 offers no general cancellation primitive for a running callback or pending external operation.
  - Accurate documentation is part of operational safety.

### Added – Three-state dependency diagnostics

- Reworked dependency reporting in `[GAMEASSIST:CORE:OBJECT]` through `_checkDependencies(name)` at line 1033.
- Dependency states:
  - `confirmed`: the dependency is positively known to be available.
  - `missing`: the dependency is positively known to be absent.
  - `unverifiable`: Roll20 did not expose enough script metadata to determine presence.
- `_checkDependencies(...)` returns:
  - `status`
  - `missing`
  - `confirmed`
  - `unverifiable`
  - `verified`
- Runtime behavior:
  - Missing dependencies prevent module enablement or cause startup skip.
  - Unverifiable dependencies produce a warning and allow the module to proceed.
  - Modules with no declared dependencies report confirmed.
- Current declared external dependencies:
  - NPCManager → TokenMod (`dependsOn: ['TokenMod']`, line 2300).
  - ConcentrationTracker → TokenMod (`dependsOn: ['TokenMod']`, line 2817).
  - NPCHPRoller does not require TokenMod.
- Rationale:
  - Earlier binary dependency reporting treated unavailable Roll20 metadata as proof of absence.
  - The tri-state model distinguishes evidence from uncertainty and avoids falsely disabling useful modules.

### Added – Versioned configuration-only snapshots

- Added snapshot identifiers to `[GAMEASSIST:POLICY]`:
  - `configFormat: 'gameassist-config-snapshot'`
  - `configSchemaVersion: 1`
  - Snapshot policy group begins at line 201.
- Updated `!ga-config list` in `[GAMEASSIST:INTERFACES:COMMANDS]` beginning at line 1350.
- Snapshot includes:

  ```json
  {
    "format": "gameassist-config-snapshot",
    "schemaVersion": 1,
    "scope": "configuration-only",
    "generatedAt": "<ISO timestamp>",
    "version": "0.1.4.2",
    "flags": {},
    "globalConfig": {},
    "modules": {}
  }
  ```

- Snapshot includes every bundled module configuration.
- Snapshot excludes:
  - runtime caches;
  - metrics;
  - unknown/orphaned branches;
  - arbitrary full `state.GameAssist` data.
- The `GameAssist Config` handout explicitly labels the snapshot scope as configuration-only.
- No import or automatic restore command was added.
- Rationale:
  - Versioning the export now creates a stable future validation boundary.
  - Import/restore is deferred because unsafe state import could be more damaging than a missing feature.

### Added – Health reporting

- Added `getModuleHealth()` in `[GAMEASSIST:INTERFACES:COMMANDS]` at line 1323.
- Added `formatDependencyStatus()` at line 1337.
- Expanded `!ga-status` at line 1487 to report:
  - command count;
  - event/message count;
  - errors;
  - average explicit queue-task duration;
  - queue length;
  - explicit queue mode statement;
  - last update;
  - total modules;
  - configured modules;
  - running modules;
  - dependency-skipped modules;
  - active listeners;
  - dependency warnings.
- Expanded `!ga-config modules` to show, per module:
  - stored configured state;
  - current runtime state;
  - dependency status.
- Rationale:
  - “Configured” and “running” are not interchangeable.
  - A module can be configured on but skipped, failed, or waiting on dependencies.
  - Health output should reveal that distinction without requiring state-console inspection.

### Changed – Bootstrap order and startup diagnostics

- Updated `[GAMEASSIST:BOOTSTRAP]`, beginning at line 3305.
- Startup order now:
  1. establish core state;
  2. initialize metrics/session timestamp;
  3. clear GameAssist’s internal listener registries;
  4. audit and repair known state;
  5. seed defaults;
  6. deduplicate planned metadata;
  7. run optional compatibility audit;
  8. report core ready;
  9. diagnose dependencies and initialize enabled modules.
- Dependency behavior during startup:
  - missing → warn, disable stored enabled state, leave module inactive;
  - unverifiable → warn and proceed;
  - confirmed → proceed normally.
- Preserved `GameAssist.flags.QUIET_STARTUP = true` default:
  - individual module-ready messages remain suppressed by default;
  - the core-ready message remains visible.

### Documented – Previously hidden commands and configuration

- Documented commands that existed in code but were absent or unclear in older README revisions:
  - `!npc-death-clear` at script line 2237;
  - `!npc-death-audit` at script line 2244;
  - `!ga-config cleanup` at script line 1448;
  - `!ga-metrics [reset]`.
- Documented NPCManager configuration:
  - `autoHide: false` at line 2154;
  - `hideLayer: 'gmlayer'` at line 2155.
- Documented developer metadata and command matching:
  - `dependsOn`
  - `match.caseInsensitive`
  - `match.mode: 'token'`
  - `match.mode: 'prefix'`
- Clarified command behavior:
  - `!npc-death-report` shows recorded deaths;
  - `!npc-death-audit` checks current HP/marker mismatches;
  - `!npc-death-clear` clears the recorded report log;
  - `!critfumblemenu --pid <playerId>` is the internal player-targeted syntax;
  - selected DebugTools tokens are used by omitting `--token`; literal `--token select` is not implemented by the parser;
  - commands are generally case-insensitive; lowercase is not a universal requirement.

### Documentation – Full README reconstruction

- Rebuilt `README-GameAssist-v0.1.4.2.md` as a long-form handbook after the first accurate-but-overly-compact rewrite omitted the original layout and teaching material.
- Restored:
  - numbered sections and table of contents;
  - TL;DR table;
  - architecture explanation and fail-safe table;
  - all six module guides;
  - installation guide;
  - command matrix;
  - configuration reference;
  - developer API;
  - Roll-Table Cookbook;
  - macro recipes;
  - historical benchmark section;
  - detailed troubleshooting;
  - upgrade and rollback paths;
  - contribution guidance;
  - roadmap status;
  - changelog summary;
  - glossary.
- Corrected old claims that described unsuitable, impossible, or unimplemented behavior:
  - removed “zero silent failures” guarantee;
  - removed claim that every event is queued;
  - removed claim that watchdog kills running tasks;
  - removed claim that state audit deletes and reseeds unknown branches;
  - removed guaranteed dependency-discovery claim;
  - corrected `!ga-config list` from full-state backup language to configuration-only snapshot language;
  - corrected startup-message expectations under `QUIET_STARTUP`;
  - corrected defaults, syntax, command purpose, and dependency statements.
- Preserved the old benchmark numbers only as explicitly labeled historical v0.1.3-era evidence, not a v0.1.4.2 performance guarantee.

### Compatibility and behavior boundaries

| Area | v0.1.4.2 Contract |
| --- | --- |
| Roll20 event hooks | Captures native `on` once through `R20_ON`; does not override global `on` or `off`. |
| Normal handlers | Execute directly through initialized/active guards. |
| Queue | Explicit opt-in plus module lifecycle transitions only. |
| Queue timeout | Releases queue; cannot cancel underlying work. |
| Dependency discovery | Best-effort, tri-state, never guaranteed. |
| Unknown state | Warn and preserve until explicit cleanup. |
| Config export | Versioned configuration-only snapshot; no import. |
| Gameplay modules | Preserved from v0.1.4.1; no new gameplay behavior in this release. |
| Character sheet | Not implemented. |

### State and migration impact

- Existing valid module configuration is preserved.
- Known malformed/missing `config` and `runtime` containers are repaired at startup.
- Unknown branches remain intact unless the GM runs `!ga-config cleanup`.
- `!ga-config list` creates a new versioned snapshot shape but does not mutate state.
- No automatic migration removes unknown data.
- No import/restore migration exists.
- Rollback warning:
  - replacing the script with v0.1.4.1 rolls back code;
  - it does not automatically reverse persistent state changes made while v0.1.4.2 was active.

### Explicitly not included

- No implicit queueing of commands/events.
- No cancellation of running JavaScript or Roll20 operations.
- No automatic deletion of unknown state.
- No guaranteed external-script discovery.
- No full-state export/import or snapshot restoration.
- No plugin loader.
- No Rest Manager, encounter tools, cooldown tools, resource tools, condition tools, or location tools.
- No native Mord character-sheet support.
- No new public gameplay command set.

### Automated verification evidence

| Verification | Result | What it established |
| --- | --- | --- |
| JavaScript syntax validation | Passed | Release artifact parses successfully. |
| MECHSUITS structural audit | Passed | No missing parents, invalid overlaps, canonical-tree drift, metadata gaps, or missing footers were detected. |
| Existing command simulation | Passed | Core and bundled command surfaces remained callable without simulation exceptions. |
| Confirmed dependency simulation | Passed | Confirmed dependencies report and initialize correctly. |
| Missing dependency simulation | Passed | Missing dependencies skip/refuse the dependent module. |
| Unverifiable dependency simulation | Passed | Unverifiable dependencies warn and proceed. |
| Known-state repair simulation | Passed | Malformed known `config`/`runtime` containers repair. |
| Valid-config preservation | Passed | Existing valid values survive repair. |
| Unknown-state preservation | Passed | Unknown branches remain untouched at startup. |
| Configuration snapshot generation | Passed | Format, schema version, scope, module configs, and exclusions are correct. |
| Health/status reporting | Passed | Configured/running/skipped counts and warnings appear. |
| Explicit queue serialization | Passed | Explicitly enqueued tasks serialize. |
| Queue-timeout release | Passed | Later task proceeds while underlying timed-out work may finish later. |
| Exact marker/lifecycle regression | Passed | Marker and module lifecycle behavior remained intact. |
| Global event-hook audit | Passed | No global `on`/`off` overrides introduced. |

### Roll20 verification still required

- Paste `GameAssist-v0.1.4.2.js` into a disposable or controlled Roll20 API sandbox.
- Confirm the API sandbox reloads cleanly.
- Run the release smoke test in `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md`.
- Do not retire the v0.1.4.1 rollback baseline until those tests pass.

---

## [0.1.4.1] – 2026-06-08

### Release definition

v0.1.4.1 is a stability-first update built from the uploaded, stable-but-limping v0.1.4 baseline. It preserves v0.1.4 command and bootstrap behavior, incorporates only isolated safe ideas from the failed attempted v0.1.5 upgrade, and aligns the single-file structure with MECHSUITS v1.5.2 requirements without performing a wholesale rewrite.

### Development strategy

- Treated uploaded v0.1.4 as the behavioral baseline.
- Preserved the six-module shape:
  - ConfigUI
  - CritFumble
  - NPCManager
  - ConcentrationTracker
  - NPCHPRoller
  - DebugTools
- Avoided broad bootstrap and interface/event lifecycle restructuring.
- Preserved captured Roll20 `R20_ON` behavior.
- Preserved direct normal handler execution.
- Applied changes at narrow MECHSUITS section granularity.
- Kept a separate rollback copy of v0.1.4.

### Version and MECHSUITS metadata

- Advanced Roll20 header, MECHSUITS `project_version`, and runtime `VERSION` to `0.1.4.1`.
  - Header: `GameAssist-v0.1.4.1.js` line 4.
  - Banner: line 74.
  - Runtime version: line 520.
- Preserved literal codename `GAMEASSIST`.
- Audited:
  - banner order and prose;
  - file-scoped canonical tree;
  - section tags and physical nesting;
  - `mechsuit_section.codename`;
  - section `area`;
  - `last_updated_version`;
  - Changed/Maintenance footer discipline;
  - prior-note preservation;
  - required Notes & Comments footers.
- Did not claim that comment-only inherited sections were meaningfully changed.

### Added – Centralized POLICY ownership

- Added/expanded `[GAMEASSIST:POLICY]` beginning at line 163.
- Centralized existing values without changing defaults:
  - queue default timeout;
  - watchdog interval and multiplier;
  - metrics history/duration limits;
  - runtime cache limits;
  - timestamp sanity window;
  - ConfigUI page size;
  - CritFumble roll delay;
  - unsafe configuration keys.
- Used shallow frozen policy groups to reduce accidental runtime mutation.
- Rationale:
  - Shared knobs previously lived in multiple sections.
  - Central policy ownership makes later changes reviewable and rollbackable.
  - Existing values were preserved to avoid changing runtime behavior during the stability release.

### Added – Time seams and timestamp hardening

- Added shared wall-clock helper `now()` at line 227.
- Added monotonic duration helper `monotonic()` at line 231.
- Routed human-facing local-time formatting through `localTime(...)` at line 246.
- Added `sanitizeTimestamp(raw, fallback)` at line 443.
- Routed queue duration measurement through `monotonic()`.
- Routed stored timestamps through the shared wall-clock seam and timestamp sanitizer.
- Rationale:
  - Wall-clock time is appropriate for human and persistent timestamps.
  - Monotonic time is appropriate for durations and timeout measurement.
  - Sanitization prevents malformed/future timestamps from corrupting ordered runtime caches.

### Added – Shared marker helpers

- Added `normalizeMarkerId(marker)` at line 331.
- Added `tokenHasMarker(token, marker)` at line 335.
- Exact-marker behavior:
  - recognizes a configured marker;
  - recognizes counted Roll20 marker values such as `dead@2`;
  - does not match unrelated marker names such as `deadly`.
- Rationale:
  - Substring-style matching can remove or misreport the wrong marker.
  - Shared top-level helpers are visible to module teardown functions and avoid the ConcentrationTracker scoping failure identified in the attempted upgrade.

### Added – Shared runtime self-healing helpers

- Added `ensureRuntimeObject(modState)` at line 411.
- Added `ensureRuntimeKey(runtime, key, kind)` at line 425.
- Added `ensureModRuntimeKey(modState, key, kind)` at line 438.
- Used shared helpers to keep module runtime caches usable after malformed state or older persisted shapes.
- Rationale:
  - Runtime caches are operational and can be safely repaired to known container types.
  - Shared helpers reduce duplicated and inconsistent repair code.

### Changed – Queue timing and stale-completion protection

- Preserved `_enqueue(...)` in `[GAMEASSIST:CORE:QUEUE]`, beginning at line 564.
- Preserved job-id guards at lines 581 and 593:

  ```js
  if (myId !== _jobId) return;
  ```

- Preserved the timed-out completion guard:

  ```js
  if (timedOut) return;
  ```

- Routed queue timing through POLICY and `monotonic()`.
- Emitted the declared metric name through `recordMetric(POLICY.metrics.queueDurationName, ...)` at line 603.
- Rationale:
  - A timed-out job may still finish later.
  - Without the job-id and timed-out guards, late completion could advance the queue twice or corrupt busy-state accounting.

### Changed – Configuration safety and snapshot completeness

- Updated `!ga-config list` beginning at line 1211 to include:
  - runtime version;
  - global flags;
  - root/global configuration;
  - every bundled module configuration.
- Clarified scope:
  - “complete” means complete configuration snapshot;
  - it does not mean full state, runtime cache, or metrics backup.
- Preserved unsafe-key refusal:
  - `BAD_KEYS` sourced from POLICY at line 1242;
  - refusal check at line 1248.
- Preserved `enabled=true|false` routing through module lifecycle methods rather than directly changing state.
- Rationale:
  - Older snapshot behavior omitted module configs.
  - Config export needed to be useful before versioned import could be considered.
  - Prototype-related keys remain unsafe and are explicitly rejected.

### Changed – Shared linked-character validation

- Preserved/exported `GameAssist.getLinkedCharacter` at line 1139.
- Updated modules to use shared linked-token validation at lines including:
  - NPCManager: lines 2008 and 2096;
  - ConcentrationTracker: lines 2476, 2555, and 2743;
  - NPCHPRoller: lines 2818 and 2865.
- Rationale:
  - Modules should not independently assume that tokens are linked, on the Objects layer, or backed by a valid character.
  - Shared validation keeps invalid/unlinked/PC token handling consistent.

### Changed – NPCManager exact marker behavior

- Updated NPCManager to use exact shared marker matching.
- Preserved:
  - `deadMarker: 'dead'`;
  - TokenMod calls;
  - death log behavior;
  - death audit/report commands;
  - configured-marker teardown.
- Teardown begins near line 2142 and clears only the configured marker from eligible current-page tokens.
- Counted marker values such as `dead@2` are recognized.
- Unrelated values such as `deadly` are preserved.
- Rationale:
  - Disable/teardown should clean up the marker GameAssist owns without damaging unrelated status information.

### Changed – ConcentrationTracker lifecycle and runtime safety

- Preserved configured-marker teardown beginning near line 2659.
- Preserved shared marker matching and runtime self-healing.
- Preserved structured `lastDamage` metadata while remaining compatible with legacy numeric values.
- Preserved existing command language:
  - `!concentration`
  - `!cc`
  - `--damage`
  - `--mode`
  - `--off`
  - `--status`
  - `--last`
  - `--config randomize on|off`
  - `!ga-conc-status`
- Rationale:
  - The attempted upgrade exposed a serious helper-scope risk in teardown.
  - Shared helpers ensure teardown can access the configured-marker logic safely.

### Changed – DebugTools exact marker behavior

- Updated DebugTools marker diagnostics to use shared exact marker normalization.
- Marker diagnostics now understand counted markers.
- Preserved:
  - disabled-by-default posture;
  - dry-run-by-default posture;
  - `--apply` requirement for mutations.
- Section change note appears near line 3116.

### Changed – Captured Roll20 event hooks

- Preserved captured native Roll20 handler:

  ```js
  const R20_ON = ...
  ```

  at line 147.
- Preserved use of `R20_ON` for command/event wrappers and `ready`.
- Did not override global `on` or `off`.
- Rationale:
  - Global event-function overrides introduce script-order-dependent interoperability failures with scripts loaded after GameAssist.
  - Roll20 does not provide a dependable general-purpose `off()` contract for these handlers.

### Intentionally excluded from the attempted v0.1.5 upgrade

- Duplicate trailing script fragment.
  - Rejected because duplicated bootstrap/module code could double-register handlers or fail parsing/execution.
- Changed or normalized codename.
  - Rejected because MECHSUITS v1.5.2 requires literal owner-authoritative identifier preservation.
- Global `on`/`off` overrides.
  - Rejected because they create order-dependent cross-script behavior.
- Weakened queue stale-completion guard.
  - Rejected because late completion after timeout could advance the queue twice.
- Broader command matching.
  - Rejected because it could make neighboring command names accidentally trigger.
- Wholesale bootstrap/dependency/interface restructuring.
  - Rejected because the failed whole-file upgrade did not justify expanding the release’s blast radius.

### Verification evidence

| Verification | Result |
| --- | --- |
| JavaScript syntax validation | Passed |
| MECHSUITS structural audit | Passed; no missing parents, invalid overlaps, canonical-tree drift, metadata issues, or missing footers detected |
| Simulated Roll20 startup | Passed with enabled modules wired |
| Core command simulation | Passed without exceptions |
| Unsafe `__proto__` config write | Refused |
| NPC death-marker add/remove simulation | Passed |
| Exact counted marker handling | Passed |
| Unrelated marker preservation | Passed |
| Module disable/enable simulation | Passed |
| Captured native event-hook strategy | Preserved |

### Rollback posture

- v0.1.4.1 is preserved unchanged as the rollback baseline for v0.1.4.2.
- Rollback requires replacing the script and re-running health/smoke tests.
- Script rollback does not automatically restore persistent state.

---

## [0.1.4] – Uploaded Stable-But-Limping Baseline

### Baseline role

- Served as the source baseline for v0.1.4.1.
- Was treated as stable enough to preserve but not “known-good.”
- Included the six-module structure:
  - ConfigUI
  - CritFumble
  - ConcentrationTracker
  - NPCManager
  - NPCHPRoller
  - DebugTools
- Retained TokenMod-based status changes for NPCManager and ConcentrationTracker.
- Preserved captured `R20_ON` behavior and avoided global `on`/`off` overrides.

### Added

- New **ConfigUI** module providing a GM-only chat control panel:
  - module enable/disable buttons;
  - boolean config toggles;
  - pagination;
  - `!ga-config ui`;
  - `!ga-config-ui`.
- New **DebugTools** module:
  - disabled by default;
  - GM-only;
  - dry-run by default;
  - `!ga-debug damage|marker|save`;
  - mutations require `--apply`.
- Public `GameAssist.renderConfigUI(playerId, options)` helper.

### Changed

- Updated README TL;DR, module guides, command matrix, macro recipes, and configuration reference for ConfigUI and DebugTools.
- Advanced runtime version to 0.1.4.
- Retained queue-guarded module lifecycle hooks.

### Known baseline limitations carried into the repair line

- State repair and dependency diagnostics needed clearer, safer semantics.
- Config snapshot behavior and documentation needed correction.
- Marker matching required exact shared helpers.
- Some commands/configuration existed but were not fully documented.
- README described queue/watchdog/state/dependency guarantees more strongly than the Roll20 environment could support.

> No authoritative shipment date was recorded in the supplied changelog. This entry records baseline provenance.

---

## [0.1.3] – Detailed Historical Development Record

This section preserves the supplied granular v0.1.3-era development record, including implementation locations and replaced behavior. The referenced line numbers belong to the historical artifact described by those notes and are retained for audit value.

### Added – Persisted session metrics

- Added persisted session metrics with GM summary/reset command.
  - Added `GameAssist` lines 288-420 for the metrics store helpers:
    - `createMetricsStore`
    - `ensureStateRoot`
    - `recordMetric`
  - Instrumented wrappers at lines 683-742, 796-844, and 1049-1119 to log:
    - commands;
    - events;
    - queue tasks;
    - module toggles;
    - errors.
  - Exposed `!ga-metrics`.
  - Updated the task queue finalizer at lines 197-214 to retain only the latest durations and feed the metrics ring buffer.
  - Exported `getMetricsStore` and `recordMetric` on the public API at lines 927-932.
- Documentation:
  - README TL;DR, Command Matrix, and Troubleshooting sections documented `!ga-metrics`.
  - `script.json` listed the new command and staged version bump.

### Added – Shared token-to-character resolver

- Introduced a shared resolver so modules validate Roll20 objects before use.
  - Added `GameAssist` lines 343-353:

    ```js
    function getLinkedCharacter(token) { ... return { token, character }; }
    ```

  - Added public export at line 836:

    ```js
    GameAssist.getLinkedCharacter = getLinkedCharacter;
    ```

  - Added module usage at historical lines 1213, 1261, 1540, 1611, 1783, 1839, and 1886 so NPCManager, ConcentrationTracker, and NPCHPRoller consistently gate work on verified tokens.
  - Removed duplicated per-module inline checks from the prior implementation:
    - pre-update line 1156: `const charId = token.get('represents');`
    - pre-update line 1168: `const character = getObj('character', charId);`
    - pre-update line 1362: `const charId = token.get('represents');`

### Added – NPCHPRoller auto-roll on token add

- Added opt-in automatic HP rolling for newly created NPC tokens through `autoRollOnAdd`.
  - Added historical lines 1801-1869 to reuse a shared NPC context resolver.
  - New-token handling silently skips non-NPC or invalid tokens.
  - Automatic rolls are annotated in logs.
  - Added `add:graphic` listener metadata at historical lines 1948-1956.
  - Updated README module/config documentation.
- Default remained `false` to avoid event noise and unintended token mutation.

### Changed – Guard-based module handler lifecycle

- Core handler lifecycle moved from physical `off()` calls to module guard flags.
  - Added historical lines 609-620 to store:
    - `initialized`
    - `active`
    - `dependsOn`
    - `wired`
    - `internal`
  - Added handler guards at historical lines 627 and 646-647:

    ```js
    if (!MODULES[mod]?.initialized || !MODULES[mod]?.active) return;
    ```

  - Preserved the READY gate for normal event handling.
  - Removed prior minimal registration:

    ```js
    MODULES[name] = { initFn, teardown, enabled, initialized: false, events, prefixes };
    ```

  - Removed attempted physical unbinding:

    ```js
    (this._commandHandlers[mod] || []).forEach(h => off(h.event, h.fn));
    (this._listeners[mod] || []).forEach(h => off(h.event, h.fn));
    ```

  - `offCommands` and `offEvents` became logical registry clearing rather than claims of Roll20 listener detachment.

### Changed – Serialized module enable/disable with dependency guards

- Added `_transitioning` checks and queued lifecycle execution across historical lines 718-807.
- Added rollback on initialization failure at historical lines 745-755.
- Added dependency verification helper at historical lines 673-701.
- Added dependency checks inside `enableModule` and bootstrap at historical lines 723-731 and 1945-1955.
- Removed the old eager teardown/clear path:
  - pre-update line 502: `this.offEvents(name);`
  - pre-update line 503: `this.offCommands(name);`
  - pre-update line 504: `clearState(name);`
  - pre-update line 505: `getState(name).config.enabled = true;`
  - removed the analogous disable block at pre-update lines 520-524.

### Changed – State audits became non-destructive

- Added whitelist behavior across historical lines 305-321 so unexpected keys warn without destructive deletion.
- Removed pre-update lines 294-301 that executed:

  ```js
  delete root[k];
  ```

  for unknown or malformed branches.
- This established the safety rule later expanded in v0.1.4.2:
  - known shapes may be repaired;
  - unknown branches are preserved unless explicitly cleaned.

### Changed – State helpers exposed through public API

- Added historical lines 833-835:
  - `GameAssist.getState`
  - `GameAssist.saveState`
  - `GameAssist.clearState`
- Updated module initializers at historical lines 958, 1203, 1324, and 1741 to call `GameAssist.getState(...)`.
- Removed direct internal accessor usage from the previous revision:
  - pre-update line 648: `const modState = getState('CritFumble');`
  - pre-update line 893: `const modState = getState('NPCManager');`
  - pre-update line 996: `const modState = getState('ConcentrationTracker');`
  - pre-update line 1325: `const modState = getState('NPCHPRoller');`

### Changed – Compatibility audit scoring

- Added signature catalog and scoring routine across historical lines 377-518.
- Added summary rows and hints for known/unknown scripts.
- Replaced earlier summary-only logging at pre-update lines 354-357, which reported only known/unknown lists and planned hooks.
- Compatibility output remained gated by `GameAssist.flags.DEBUG_COMPAT`.

### Changed – ConcentrationTracker structured runtime data

- Added structured storage at historical lines 1559-1569.
- Added skipped-token reporting in `handleClear` at historical lines 1600-1624.
- Added `!ga-conc-status` wiring at historical lines 1691-1698.
- Removed previous single-number storage:

  ```js
  modState.runtime.lastDamage[msg.playerid] = damage;
  ```

- Removed silent marker clearing:

  ```js
  if (t) toggleMarker(t, false);
  ```

- Structured metadata included damage, DC, mode, token/character IDs, bonus, player, and timestamp.

### Changed – NPCManager configured-marker teardown

- Added teardown across historical lines 1308-1331.
- Teardown removes the configured marker through TokenMod and reports the number cleared.
- Replaced behavior where disabling NPCManager could leave stale GameAssist-owned death markers on tokens.

### Changed – Chat sanitization and planning utilities

- Added quote escaping at historical line 340:

  ```js
  .replace(/"/g, '&quot;');
  ```

- Added `_dedupePlanned` guard at historical line 667:

  ```js
  if (this._deduped) return;
  ```

- Replaced unconditional deduplication from pre-update lines 493-495.
- Rationale:
  - quoted text should not break Roll20 whisper HTML;
  - planned metadata should not grow repeatedly across reload-like flows.

### Changed – Bootstrap dependency and failure handling

- Added dependency checks and active-flag management at historical lines 1945-1973.
- Set `initialized` and `active` based on actual startup success.
- Removed unconditional initialization loop from pre-update lines 1491-1499:

  ```js
  Object.entries(MODULES).forEach(...)
  ```

- Failed or dependency-blocked modules remain inert instead of appearing active.

### Added – Staged v0.1.3 helper and dependency work

- Added compatibility audit scoring with signature-based hints for:
  - TokenMod
  - ScriptCards
  - APILogic
- Added shared helpers:
  - `GameAssist.createButton(label, command)`
  - `GameAssist.rollTable(tableName)`
- Added GM command `!ga-conc-status`.
- Added declared `dependsOn` checks for module enablement.
- Added structured ConcentrationTracker metadata used by the status report.

### Documentation

- Clarified state-auditor commentary so unexpected branches are documented as warning-only.
- Updated README for:
  - metrics;
  - developer helpers;
  - compatibility scoring;
  - dependency guardrails;
  - `!ga-conc-status`;
  - NPCHPRoller `autoRollOnAdd`.

> No authoritative shipment date was recorded in the supplied development notes.

---

## [0.1.2] – 2025-09-16

### Packaging & Repository Compliance (Roll20 API Repo)

- **Standard Header Added:** Inserted the Roll20-required top-of-file comment containing:
  - name;
  - version;
  - last-updated date;
  - description;
  - syntax/configuration pointers.
- **One-Click Artifacts:** Added:
  - `script.json`;
  - repository-focused `README.md`;
  - `GameAssist/` folder layout suitable for a `roll20-api-scripts` pull request.
- **Dependencies & Tables:** Declared TokenMod usage and documented the exact CritFumble rollable-table names:
  - `CF-Melee`
  - `CF-Ranged`
  - `CF-Thrown`
  - `CF-Spell`
  - `CF-Natural`
  - `Confirm-Crit-Martial`
  - `Confirm-Crit-Magic`

### MECHSUITS v1.5 Structural Wrap (No Runtime Changes)

- **Framing Only:** Introduced:
  - MECHSUITS YAML banner;
  - canonical tree;
  - `[CODENAME:AREA] BEGIN/END` section frames;
  - section notes for maintainability and reviewability.
- **Behavior Parity:** No functional changes; commands and modules remained behaviorally aligned with v0.1.1.2.

### Version & Metadata

- **Version Bump:** Updated version to `0.1.2`.
- **State/Migration:** No migration; `state.GameAssist` structure remained unchanged.

---

## [0.1.1.2] – 2025-06-10

### CritFumble Module

- **Natural 1 Detection Bugfix:**  
  Refactored `hasNaturalOne` to robustly detect natural 1s on d20 attack rolls across template complexity and non-standard inline-roll shapes. This removed `"Cannot read properties of undefined (reading 'r')"` failures and ensured valid attack rolls could be checked without assuming every result contains `.r`.

- **GM Visibility Improvement:**  
  Whispered the **Confirm Critical Miss** confirmation menu to both the GM and the player, rather than only the player, so GM oversight remains consistent.

---

## [0.1.1.1] – 2025-05-30

### Core Framework

- **Quiet Startup Option:**  
  Added `flags.QUIET_STARTUP`, default `true`. Per-module “Ready” chat lines may be suppressed while the core summary remains visible.

- **Logging Improvements:**  
  - Re-implemented `GameAssist.log` for clearer output and log hygiene.
  - Escaped user text.
  - Split multiline output into properly formatted GM whisper content.
  - Preserved message order and formatting.
  - Added `{ startup: true }` metadata so modules can mark suppressible ready messages.

- **Core-Ready Announcement:**  
  The core ready message remains unsuppressed even when quiet startup is enabled.

- **Status Command Update:**  
  - `!ga-status` uses real newline characters.
  - Output remains grouped into one GM whisper.

- **Module Announcements:**  
  - CritFumble, NPCManager, ConcentrationTracker, and NPCHPRoller marked their ready messages with `{ startup: true }`.
  - NPCHPRoller adopted the shared startup-output pattern.

- **Summary:**  
  No intended gameplay changes. Work focused on GM chat quality, reduced startup noise, and clearer diagnostics.

---

## [0.1.1.0] – 2025-05-29

- Initial public release of GameAssist.
- Bundled the core loader with four modules:
  - CritFumble
  - NPCManager
  - ConcentrationTracker
  - NPCHPRoller
- Established the foundation for later modular expansion and customization.

---

## Historical Staging Labels Preserved

The supplied predecessor changelog used these labels before the v0.1.4.1/v0.1.4.2 repair line was created:

- `[Unreleased]` for much of the detailed v0.1.3-era lifecycle, metrics, state, compatibility, and module work.
- `[Staging] 0.1.4 (blocked by 0.1.3 compliance)` for ConfigUI and DebugTools.
- `[Staging] 0.1.3 (MECHSUITS compliance gate)` for compatibility hints, helpers, dependency checks, and structured concentration data.

Those labels are no longer the current release-status statement, but their detailed implementation records have been retained in the relevant sections above. The attempted v0.1.5 upgrade remains explicitly unshipped.

---

*This changelog records implementation history, rationale, limitations, verification, and release posture. Roadmap ideas and failed upgrade attempts are never presented as shipped features.*

---

## Append-Only Maintenance Policy — Adopted 2026-06-10

This section governs changelog entries added after v0.1.4.2.

- Published entries are preserved as historical records and are not silently rewritten.
- Each new release entry is a curated record of changes since the preceding release entry.
- Corrections to an older entry are appended as a dated correction record that identifies the superseded claim.
- Roadmap work belongs in `ROADMAP.md`; installation and troubleshooting procedures belong in `Smoketest.md`.
- An older entry may receive an appended summary after it is at least three major-version releases behind the current release. The original detailed entry remains preserved.
- Release status, verification results, and artifact names are stated as repository facts rather than internal work narration or editorial judgments.

### Corrections to v0.1.3.x–v0.1.4.2 records

The following corrections supersede inaccurate or temporary wording in the preserved entries above:

| Preserved wording or reference | Corrected record |
| --- | --- |
| `GameAssist-v0.1.4.2.js` | The tracked artifact is `GameAssist-v0.1.4.2`. Its SHA-256 is `038B07B292E09981BD56564D83F5900353BDC1BDA0D39FDD4CB63A1DBE80CAC4`. |
| `GameAssist-v0.1.4.1.js` | No v0.1.4.1 script is retained in the repository. Its historical checksum cannot be verified from the repository contents. |
| `README-GameAssist-v0.1.4.2.md` | The tracked handbook is `README.md`. No version-named v0.1.4.2 README is retained. |
| `GameAssist-v0.1.4.2-release-notes-and-smoke-test.md` | The tracked installation and troubleshooting checklist is `Smoketest.md`. The named release-specific file is not retained. |
| “Mocked Roll20 sandbox” | These checks were simulated Roll20-environment checks, not executions inside the Roll20 API sandbox. |
| “Release candidate,” “stable-but-limping,” “attempted upgrade,” and similar labels | These phrases describe development context recorded at the time. They are not current release-status classifications. |
| “Truthful” or “honest” reporting claims | The durable contract is the specific behavior documented by the corresponding entry, such as configured/running/dependency-skipped counts or three-state dependency reporting. |
| v0.1.4.2 Roll20 confirmation language | The recorded v0.1.4.2 sandbox pass exposed the custom concentration-marker recognition failure addressed by v0.1.4.3. No complete passing v0.1.4.2 sandbox result is recorded. |

### Current release index

| Revision | Status | Repository role |
| --- | --- | --- |
| **v0.1.4.5** | Pre-release; automated verification complete, Roll20 smoke confirmation pending | NPC death-history buckets, handouts, and arc notes |
| **v0.1.4.4** | Previous complete script | DM-facing CritFumble help and NPC death-audit readability update |
| **v0.1.4.3** | Previous complete script | Concentration custom-marker recognition and standalone TokenMod interoperability update |
| **v0.1.4.2** | Previous complete script | Diagnostic and migration-readiness release with a known concentration custom-marker limitation |
| **v0.1.4.1** | Historical release; script not retained | Stability-focused repair based on v0.1.4 |
| **v0.1.4** | Historical baseline | Preserved as `GameAssist v0.1.4` |
| **Unreleased v0.1.5 prototype** | Not released | Review source for selected fixes and architecture planning |

---

## [0.1.4.3] – 2026-06-10

### Release definition

v0.1.4.3 improves standalone TokenMod interoperability by resolving configured marker names to the exact marker identities Roll20 stores on tokens. The update focuses on ConcentrationTracker status reporting and marker lifecycle requests while preserving the v0.1.4.x external dependency model.

MarkerService and integrated TokenMod remain assigned to the v0.1.5.x roadmap.

### Release artifacts

| Artifact | Purpose | SHA-256 |
| --- | --- | --- |
| `GameAssist-v0.1.4.3` | Versioned v0.1.4.3 script | `4C95BB9408A86BE45E7F5AC4A2726B932A6D408ADF834E90D5B7A1E161C48971` |
| `GameAssist` | Current repository script; identical to `GameAssist-v0.1.4.3` | `4C95BB9408A86BE45E7F5AC4A2726B932A6D408ADF834E90D5B7A1E161C48971` |
| `GameAssist-v0.1.4.2` | Previous complete script | `038B07B292E09981BD56564D83F5900353BDC1BDA0D39FDD4CB63A1DBE80CAC4` |

### Root cause addressed

- Roll20 stores a custom marker display name such as `Concentrating` as a token marker tag such as `Concentrating::7191835`.
- v0.1.4.2 compared the configured display name directly with the stored tag.
- A token visibly carrying the configured custom marker could therefore be omitted from `!concentration --status`.
- `deps unverifiable (TokenMod)` was not the cause of the status-read failure. Status reporting reads token markers directly; TokenMod is used when GameAssist requests marker mutation.

### Changed — Shared marker identity resolution

- Added a cached reader for Roll20's campaign custom-marker registry in `[GAMEASSIST:APP:UTILS]`.
- Added structured marker resolution for:
  - lowercase built-in marker ids such as `dead`;
  - custom marker display names such as `Concentrating`;
  - exact stored custom marker tags such as `Concentrating::7191835`;
  - counted marker values such as `Concentrating::7191835@3`.
- Preserved lowercase built-in-marker precedence so a custom marker named `dead` does not replace NPCManager's built-in default.
- Allowed a colliding custom marker to be selected by its complete stored tag.
- Updated `tokenHasMarker(...)` to compare exact resolved marker identities.
- Added fast paths for already-resolved custom tags and literal built-in ids.
- Exact stored custom marker tags now resolve before campaign-registry access, so a valid configured tag such as `Concentrating::7191835` remains usable when Roll20's marker registry is unavailable or malformed.
- Simple matching quote pairs are stripped before marker resolution, so chat-configured values such as `"red"` and `'red'` resolve as `red`.
- Returned explicit resolution failures for unrecognized configured markers.

### Changed — ConcentrationTracker status and lifecycle diagnostics

- `!concentration --status` now:
  - lists current-page tokens carrying the resolved configured marker;
  - returns `No tokens concentrating.` when no matching tokens are present;
  - reports when the current player page cannot be determined;
  - reports an unrecognized configured marker and provides configuration repair syntax;
  - logs a warning when a display name matches multiple custom markers.
- Concentration marker add, remove, and teardown requests now send TokenMod the resolved stored marker tag.
- `!concentration --off` reports that marker removal was requested rather than claiming the asynchronous TokenMod operation completed.
- Teardown stops and logs a warning when the configured marker cannot be resolved.

### Changed — NPCManager death-marker mutation

- NPCManager now resolves the configured death marker before TokenMod add, remove, and teardown requests.
- The default built-in `dead` marker still emits `statusmarkers|+dead` and `statusmarkers|-dead`.
- Built-in color markers such as `red` work even when the saved configuration contains simple wrapping quotes.
- A configured custom display name now emits the exact stored custom marker tag when Roll20's marker registry can resolve it.
- A configured exact custom tag, such as `Dead Custom::abc123`, remains usable even when Roll20's marker registry is unavailable or malformed.
- If the configured death marker cannot be resolved, NPCManager warns instead of sending a misleading TokenMod request or logging a death as completed.

### Documentation and changelog maintenance

- Updated `README.md`, `ROADMAP.md`, and `Smoketest.md` for v0.1.4.3 behavior and validation.
- Added focused concentration-marker checks to `Smoketest.md`.
- Separated release records, roadmap plans, and installation/troubleshooting procedures.
- Adopted the append-only changelog policy above.
- Added appended corrections for inaccurate artifact names and temporary development terminology in preserved v0.1.3.x–v0.1.4.2 records.

### MECHSUITS changes

- Advanced the file header, banner `project_version`, prose guarantee, visual version, and runtime `VERSION` to `0.1.4.3`.
- Applied the Meaningful Change Rule to:
  - `[GAMEASSIST:APP]`
  - `[GAMEASSIST:APP:UTILS]`
  - `[GAMEASSIST:CORE]`
  - `[GAMEASSIST:MODULES]`
  - `[GAMEASSIST:MODULES:NPCMANAGER]`
  - `[GAMEASSIST:MODULES:CONCENTRATIONTRACKER]`
- Recorded maintenance-only commentary updates in:
  - `[GAMEASSIST:POLICY]`
  - `[GAMEASSIST:INTERFACES:COMMANDS]`
  - `[GAMEASSIST:MODULES:CRITFUMBLE]`
- Preserved literal codename `GAMEASSIST`, existing section tags, and prior notes.
- Confirmed paired tags, proper nesting, and canonical-tree agreement.

### Compatibility and state impact

| Area | v0.1.4.3 behavior |
| --- | --- |
| TokenMod | Remains a separately installed dependency responsible for requested marker mutations. |
| Marker reads/writes | GameAssist reads token markers directly and resolves built-in ids, custom display names, and stored custom tags before marker-dependent read/write decisions. |
| MarkerService | Not included. |
| Integrated TokenMod | Not included. |
| Public commands | Existing v0.1.4.2 command language is preserved. |
| Persistent state | No migration is required; existing ConcentrationTracker configuration remains valid. |
| Rollback | Replacing the script with `GameAssist-v0.1.4.2` restores the previous marker-name comparison behavior. |

### Verification results

| Verification | Result | Coverage |
| --- | --- | --- |
| JavaScript syntax validation | Passed | The current script parses successfully. |
| Current/versioned script identity | Passed | `GameAssist` and `GameAssist-v0.1.4.3` are byte-identical. |
| MECHSUITS structural audit | Passed | Section pairing, nesting, metadata, footers, and canonical tree agree. |
| Simulated Roll20-environment checks | Passed | Empty status, custom and counted markers, built-in markers, exact custom tags, exact custom tags with registry failures, NPC death-marker add command generation, invalid-marker diagnostics, disabled-module diagnostics, and TokenMod teardown command generation. |
| Roll20 API sandbox | Not recorded | Installation and module validation procedures are documented in `Smoketest.md`. |

### Exclusions

- No MarkerService module.
- No integrated TokenMod or StatusInfo module.
- No change to the v0.1.4.x dependency model.
- No configuration import or full-state restore.
- No new gameplay modules.
- No native Mord character-sheet support.

---

## [0.1.4.4] – 2026-07-17

### Release definition

v0.1.4.4 is a small DM-facing readability release. It preserves the v0.1.4.3 marker-recognition and standalone TokenMod interoperability fixes while improving two chat outputs identified in Issue #21.

### Issue addressed

- [#21](https://github.com/Mord-Eagle/GameAssist/issues/21) — Make CritFumble help and NPC death-audit output human-readable.

### Changed — DM-facing command output

- Revised `!critfumble help` from a command list into a quick reference with an `Open Natural 1 Menu` button, common commands, attack types, and exact setup table names.
- Added `!critfumble menu` as the public CritFumble-family command for opening the guided Natural 1 dialogue.
- Added bare `!critfumble` as a help alias, so entering the feature command without a subcommand opens the guide instead of silently doing nothing.
- Preserved `!critfail` as the direct GM player-picker command.
- Preserved existing CritFumble command syntax:
  - `!critfail`
  - `!critfumble`
  - `!critfumble help`
  - `!critfumble menu`
  - `!critfumble-TYPE`
  - `!confirm-crit-martial`
  - `!confirm-crit-magic`
- Changed `!npc-death-audit` from multiple line-by-line log messages into one grouped GM report.
- Added an audit `Scope` row stating that linked NPC tokens are checked and player characters are not included.
- Grouped audit mismatches by action: `Add Marker` for dead NPCs missing the configured marker, and `Clear Marker` for living NPCs still carrying it.
- Preserved useful mismatch details: NPC name, HP, current markers, and token ID.
- Bounded each audit mismatch detail group while preserving total counts, so crowded pages do not produce one oversized Roll20 chat payload.
- Kept unrelated unlinked-page-item notes as informational context, so party markers, scenery, labels, and props do not read like errors.

### Documentation

- Updated `Smoketest.md` so DMs no longer need to reinterpret the old audit success message.
- Updated the CritFumble smoke test to check the quick-reference help panel, the bare `!critfumble` help alias, the `!critfumble menu` guided dialogue, and the unchanged `!critfail` player picker.
- Updated `README.md` to describe the quick reference, guided menu, direct player picker, and the meaning of a clean NPC death audit.
- Updated `ROADMAP.md` so #21, #22, and #23 precede the #24 standalone-interoperability umbrella, with #32 explicitly deferred after the existing issue queue.

### Review fixes

- Hardened `!critfumble help` and `!critfumble menu` matching so extra internal whitespace is accepted.
- Hardened direct fumble rolls so mixed-case commands such as `!CritFumble-melee` resolve the intended fumble type.
- Added a POLICY-owned `npcAuditDetailLimit` cap for grouped NPC death-audit reports.
- Corrected `script.json` so `script` points to the repository's actual `GameAssist` artifact instead of nonexistent `GameAssist.js`.
- Added `!critfumble help` and `!critfumble menu` to the script metadata command list.

### MECHSUITS records

- Updated `[GAMEASSIST:MODULES:CRITFUMBLE]` because the public help output changed.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` because the public audit success output changed.
- Updated `[GAMEASSIST:POLICY]` because the NPC death-audit detail cap is a runtime behavior knob.
- Updated `[GAMEASSIST:CORE]` because the runtime `VERSION` constant advanced.
- Preserved existing section tags, codename `GAMEASSIST`, and command names.

### Release artifacts

The v0.1.4.3 artifact remains preserved. The current repository script and the new v0.1.4.4 versioned artifact share:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `DB68D6467D698FEF25D416394FFD07F6F44EF2E2361D9DBA9F198A0DAA41D091` |
| `GameAssist-v0.1.4.4` | `DB68D6467D698FEF25D416394FFD07F6F44EF2E2361D9DBA9F198A0DAA41D091` |

### Verification

| Check | Result |
| --- | --- |
| `node --check .\GameAssist` | Passed |
| `GameAssist-v0.1.4.4` syntax via stdin check | Passed |
| `GameAssist` versus `GameAssist-v0.1.4.4` byte identity | Passed |
| `git diff --check` | Passed |

Roll20 API sandbox confirmation is still required for the final release gate.

---

## [0.1.4.5] – 2026-07-17

### Release definition

v0.1.4.5 is an NPCManager usability and campaign-notes release for Issue #22. It keeps the `v0.1.4.x` standalone TokenMod architecture, but changes death history from a single chat-oriented log into hierarchical DM-facing handout buckets: Campaign, Chapter, Section, and Session. It also adds a report writer and curated Arc rosters that sit outside that hierarchy. NPCManager advances to module version `1.1.0` because its state model, report workflow, clear behavior, date handling, and Arc-management surface changed substantially even though the GameAssist project version remains a patch release.

### Issue addressed

- [#22](https://github.com/Mord-Eagle/GameAssist/issues/22) — Add summarized and named NPC death-log pools.

### Changed — scoped NPC death buckets

- Advanced `[GAMEASSIST:MODULES:NPCMANAGER]` independent `module_version` from `0.1.1.0` to `1.0.0` for the bucket-state redesign, then to `1.1.0` for report writing, hierarchical clearing, date rollover, and curated Arc management.
- Added active death-history bucket names under NPCManager config:
  - `campaign`
  - `chapter`
  - `section`
  - `session`
- Default bucket names are intentionally simple:
  - Campaign: `Campaign`
  - Chapter: `Chapter`
  - Section: `Section`
  - Session: current date in `YYYY-MM-DD` form when no saved session name exists.
- Added `!npc-death-buckets` as the GM-facing bucket control panel.
- Added bucket rename support:
  - `!npc-death-buckets --campaign "Name"`
  - `!npc-death-buckets --chapter "Name"`
  - `!npc-death-buckets --section "Name"`
  - `!npc-death-buckets --session "Name"`
  - `!npc-death-buckets --resetSession`
- Changing a bucket name starts or resumes that named bucket. Existing bucket records and handouts are retained instead of being deleted.
- Every newly recorded NPC death is copied into all four active buckets so Session history can be cleared while Chapter, Section, and Campaign history remain available.
- Added a lazy date-boundary check before every NPCManager command and tracked NPC HP event. A date-managed Session moves to the current sandbox/UTC `YYYY-MM-DD` name before new activity is processed; prior dated buckets and handouts remain available.
- Explicitly named Sessions remain active across date changes. `!npc-death-buckets --resetSession` restores the current UTC date and re-enables automatic date-managed rollover.
- Tracked DM-configurable timezone formatting and date boundaries separately in [Issue #35](https://github.com/Mord-Eagle/GameAssist/issues/35). v0.1.4.5 does not reinterpret historical timestamps.

### Changed — death recording and revival handling

- Death recording no longer depends on TokenMod marker-write success.
- When a linked NPC drops below 1 HP:
  - GameAssist records the death in the active buckets;
  - GameAssist requests the configured death marker through TokenMod when the marker is not already present;
  - `autoHide` behavior is preserved.
- Duplicate open death entries are avoided while an NPC already has an unrevived record.
- When a linked NPC rises above 0 HP:
  - GameAssist annotates the most recent matching unrevived death entry;
  - the annotation is applied across stored buckets and arc entries where a matching entry exists;
  - GameAssist requests marker removal through TokenMod when the marker is present.
- Revival annotations are saved even when an invalid marker configuration or failed TokenMod request prevents visual marker removal.
- Revival annotations preserve history instead of silently deleting the death entry.

### Changed — death reports and handouts

- `!npc-death-report` now opens the active Session bucket by default.
- Added bucket scope selection:
  - `!npc-death-report --scope campaign`
  - `!npc-death-report --scope chapter`
  - `!npc-death-report --scope section`
  - `!npc-death-report --scope session`
- Preserved bounded detail views:
  - `!npc-death-report --recent`
  - `!npc-death-report --page N`
  - `!npc-death-report --help`
- Changed `!npc-death-report --write` to open the report writer before any handout is changed.
- Added `!npc-death-write` and the case-insensitive shorthand `!NPC-WR`.
- Added report-writer actions:
  - `!npc-death-write --all` updates all four active bucket handouts;
  - `!npc-death-write --scope campaign|chapter|section|session` updates one active handout;
  - `!npc-death-write --newSection "Name"` starts or resumes a Section, copies only missing current-Session deaths into it, and updates the Section and Session handouts without rewriting Campaign or Chapter.
- Each bucket writes to one handout named by scope and bucket name, for example:
  - `GameAssist Deaths - Campaign - Campaign`
  - `GameAssist Deaths - Chapter - Chapter`
  - `GameAssist Deaths - Section - Section`
  - `GameAssist Deaths - Session - 2026-07-17`
- Existing legacy `runtime.deathLog` entries are backfilled into active buckets when the bucket system first reads old state and no bucket entries exist.
- The legacy `deathLog` array is retained for compatibility and duplicate/open-death detection.

### Changed — audit output

- `!npc-death-audit` remains the current-page HP/marker mismatch checker.
- Chat output is now a short summary with:
  - mismatch count;
  - explicit scope statement;
  - configured marker;
  - count of NPCs needing a marker;
  - count of NPCs needing marker removal;
  - count of ignored unlinked page items.
- Complete audit rows write to the `GameAssist NPC Death Audit` handout.
- Chat retains bounded, grouped token details under `Add Death Marker` and `Remove Death Marker`, including each affected token's HP, current markers, and token ID.
- The audit continues to check linked NPC tokens only; player characters are intentionally excluded.

### Added — manual arc handouts

- Added `!npc-death-arc` as the GM-facing arc help/list panel, keeping the command within NPCManager's `!npc-death-*` naming family.
- Added manual selected-token capture:
  - `!npc-death-arc --name "Arc Name"`
  - selected linked PC and NPC tokens are appended to `GameAssist Arc - Arc Name`.
- Added session import:
  - `!npc-death-arc --name "Arc Name" --session`
  - current Session bucket deaths are appended without duplicating entries already imported into that arc.
- Added optional note support for selected-token entries:
  - `!npc-death-arc --name "Arc Name" --note "Text"`
- Arc buckets are independent story-note handouts; they do not sit inside Campaign, Chapter, Section, or Session.
- Arc entries now deduplicate by linked creature by default. A selected token that later appears in a full Session import remains one entry and may be enriched with the matching death record.
- Added `--allowDuplicates` as an explicit override when repeated Arc entries are intentional.
- Added `!npc-death-arc --name "Arc Name" --manage` with paged entry controls.
- Added one-entry Remove buttons, `--removeSelected` for selected-token cleanup, and `--undo` for the most recent Arc addition or merge.
- Arc corrections change only the Arc roster and handout; they do not alter Campaign, Chapter, Section, or Session history.

### Changed — review hardening

- Removed the unused init-time Session entry from `DEFAULT_BUCKET_NAMES`. Session defaults continue to call `currentSessionDateKey()` when needed, preserving date rollover while avoiding a misleading frozen-date fallback.
- Added opt-in `preserveRuntimeOnDisable` module-registration metadata. Existing modules continue clearing disposable runtime caches by default.
- NPCManager enables runtime retention so disabling marker automation no longer erases saved Campaign, Chapter, Section, Session, or Arc records; configured-marker teardown still runs.
- Open-death deduplication now requires an exact token ID. Legacy name-only entries remain available in reports but cannot suppress a new death for a different same-named NPC.
- Persisted the legacy death-log migration completion flag in NPCManager runtime state so the migration does not repeat on every command.
- Batched legacy migration handout writes to one update per scope after all retained entries are copied.
- Matched current death records by token ID before using the name-only fallback reserved for legacy entries without token IDs. This keeps separate same-named NPC tokens from sharing one death or revival record.
- Preserved open-death detection across retained buckets after a scoped Session clear, preventing a still-dead NPC from being recorded again in Campaign, Chapter, or Section after another below-zero HP edit.
- Preserved an exact selected-token HP value of `0` in arc state instead of treating it as absent.
- Limited arc revival annotations to entries imported from death history. Ordinary selected-token story notes remain unchanged during later positive-HP edits.

### Added — NPCManager start-here help

- Added `!npc-death-help` as the top-level NPCManager help menu.
- The help menu shows:
  - start-here steps for DMs;
  - a plain-language explanation of Campaign, Chapter, Section, and Session;
  - active bucket names and counts;
  - direct buttons for reading, writing, clearing, audit, and Arc workflows;
  - compact expert command examples.
- Rebuilt `!npc-death-report --help` as the central NPCManager guide and made `!npc-death-help` open the same guide.
- The guide explains the four-level hierarchy, active names and counts, report writing, selected-only versus nested clearing, Arc management, and audit scope with direct action buttons.

### Changed — safer bucket clearing

- The default clear target remains Session.
- Every clear confirmation offers the selected bucket alone.
- Campaign, Chapter, and Section confirmations also offer `--nested`, which clears the selected level and every descendant:
  - Campaign and below: Campaign, Chapter, Section, Session;
  - Chapter and below: Chapter, Section, Session;
  - Section and below: Section, Session.
- Parent levels above the selected level are retained.
- Clearing any set that includes Session also clears the retained legacy `deathLog` mirror.
- Adjacent boolean switches now parse independently, so displayed combinations such as `--nested --confirm` and `--session --allowDuplicates` execute as written.

### Documentation

- Updated `README.md` with NPCManager `1.1.0`, bucket hierarchy, handout names, central help guide, report writer, nested clear choices, date rollover, Arc deduplication, and recovery controls.
- Added a Roll20 API repository readiness checklist to `README.md` covering folder/script naming, `script.json`, header, file types, smoke-test language, license, post-merge wiki upkeep, and the extensionless `GameAssist` versus `.js` submission-artifact check.
- Updated `Smoketest.md` so the in-depth NPCManager checks exercise Campaign, Chapter, Section, and Session naming, the report writer, “new Section from Session,” selected-only and nested clearing, Arc deduplication/override/removal/undo, date-boundary expectations, audit output, and handout refreshes.
- Updated `ROADMAP.md` to record Issue #22 as scoped death-history buckets and handouts rather than a summary-only report pass.
- Updated `script.json` to version `0.1.4.5`, add `0.1.4.4` to `previousversions`, identify NPCManager `1.1.0`, and list the report-writer, nested-clear, and Arc-management command surface.

### MECHSUITS records

- Updated `[GAMEASSIST:POLICY]` because the death-report summary/detail caps are runtime behavior knobs.
- Updated `[GAMEASSIST:APP:UTILS]` because adjacent boolean flags no longer consume one another as values.
- Updated `[GAMEASSIST:CORE]` because the runtime `VERSION` constant advanced.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` because the public death-report, writer, help, bucket, audit, Arc, revival, rollover, and hierarchical-clear behavior changed.
- Preserved existing section tags, codename `GAMEASSIST`, and command names.

### Release artifacts

The v0.1.4.4 artifact remains preserved. The current repository script and the new v0.1.4.5 versioned artifact share this repository blob SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `F6D9AAE9906C4ACF5494861032F8CCB50709B3FCA06454EC4116CD6D03577578` |
| `GameAssist-v0.1.4.5` | `F6D9AAE9906C4ACF5494861032F8CCB50709B3FCA06454EC4116CD6D03577578` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.5-pr34-test.js` | `95487BA6297884561CE3F51667E84B13990246151B924D9F9638742AD11C0950` |

### Verification

| Check | Result |
| --- | --- |
| `node --check .\GameAssist` | Passed |
| `script.json` JSON parse | Passed |
| `GameAssist` versus `GameAssist-v0.1.4.5` byte identity | Passed |
| NPCManager review regression checks for migration, same-name tokens, scoped clearing, arc revival eligibility, and zero HP | Passed |
| NPCManager behavioral harness: Arc deduplication/override/removal/undo, selected-only and nested clearing, Section seeding, and simulated date rollover | Passed (22 assertions) |
| Copilot follow-up harness: custom Session retention, date-mode reset/rollover, and revival annotation despite marker-resolution failure | Passed (9 assertions) |
| NPC death-audit chat/handout regression: two named mismatches with HP, markers, and token IDs in chat plus complete handout details | Passed (12 assertions) |
| Five-revision preservation audit: commands, defaults, state repair, queue, dependencies, marker identity, module UX, HP rolling, and NPCManager lifecycle | Passed after correcting NPCManager disable retention |
| Legacy name-only deduplication regression: a retained legacy name does not block a new token-ID-bearing death | Passed |
| MECHSUITS section pairing, nesting, metadata, footers, and canonical-tree agreement | Passed (19 sections) |
| `git diff --cached --check` | Passed |
| Roll20 API sandbox acceptance checklist | Pending DM smoke test |

The Roll20 sandbox checklist remains the release acceptance test for live marker changes, chat rendering, and handout behavior.

---

## [0.1.4.6] – 2026-07-17

### Release definition

v0.1.4.6 is a focused GameAssist status-readability release for Issue #23. It replaces the flat technical `!ga-status` list with a short, action-oriented system check for DMs and retains volatile counters and internal diagnostics in an optional troubleshooting view. It also preserves an enabled module's configured intent when a confirmed missing dependency prevents startup, allowing the status panels to report the skip accurately. It does not change gameplay-module commands, marker behavior, TokenMod communication, StatusInfo interoperability, queue execution, runtime caches, or NPCManager history.

### Issue addressed

- [#23](https://github.com/Mord-Eagle/GameAssist/issues/23) — Make `!ga-status` output easier for DMs to interpret.

### Changed — default system check

- Rebuilt `!ga-status` as a Roll20 default-template panel titled `GameAssist 0.1.4.6 System Check`.
- The first panel now presents four decisions in reading order:
  - overall health and whether the DM needs to act;
  - how many enabled modules are running and how many modules are turned off;
  - errors recorded during the current Roll20 sandbox session;
  - dependency evidence with a plain-language next action.
- Added a separate `GameAssist Actions` whisper immediately below the simple status table with direct buttons for:
  - Troubleshooting Details;
  - Module List;
  - Open Settings.
- Deliberately disabled modules are reported as turned off rather than failures.
- Dependency warnings from disabled modules are excluded from the active health decision.
- Modules skipped during startup for a confirmed missing dependency remain configured, appear as needing attention, and contribute to the dependency-skipped count.

### Added — troubleshooting details

- Added `!ga-status --details`; `!ga-status details` is accepted as an equivalent readable form.
- The details panel preserves the prior diagnostic surface with clearer labels:
  - registered, enabled, running, and dependency-skipped module counts;
  - commands, chat messages, and errors recorded in the current sandbox session;
  - explicit queue length and the reminder that normal Roll20 events execute directly;
  - average duration for explicitly queued tasks;
  - last recorded activity in sandbox-local display time;
  - GameAssist's internally tracked event-hook count.
- The event-hook count explicitly states that it is troubleshooting information rather than a health or pass/fail test.
- Added buttons to refresh details, return to the simple view, open the module list, and view metrics.
- Moved those detailed-view buttons into a separate `Troubleshooting Actions` whisper immediately below the details table.

### Changed — health interpretation

- `Ready - GameAssist is responding and every enabled module is running.` appears when enabled modules are active, no current-sandbox error is recorded, and enabled-module dependencies are confirmed.
- `Ready - enabled modules are running. A marker check is recommended.` appears when Roll20 cannot confirm a dependency but enabled modules are otherwise active.
- `Attention needed - review the items below.` appears when GameAssist has recorded an error, an enabled module is stopped, or an enabled module has a confirmed missing dependency.
- `unverifiable` remains non-fatal. The panel explains that Roll20 may not expose enough metadata and recommends one real death or concentration marker test.
- Confirmed missing dependencies identify the dependency and affected enabled modules, then recommend installing/enabling the dependency or turning off the affected module.
- Startup now checks whether a module was deliberately disabled before diagnosing its dependencies. This prevents optional disabled modules from producing startup dependency warnings.
- Startup no longer rewrites `config.enabled` to `false` when a confirmed missing dependency skips a configured module. Preserving that setting distinguishes the skipped module from one the DM intentionally disabled.
- Manual `!ga-enable <Module>` retries with confirmed missing dependencies now refuse activation without changing the module's existing configuration. Configured-and-skipped modules remain visible as needing attention, while deliberately disabled modules remain disabled.
- `disableModule()` now considers both persistent configuration and runtime state before reporting that a module is already disabled. A configured-but-inactive dependency skip can therefore be turned off through `!ga-disable` or `!ga-config set <Module> enabled=false`, clearing the corresponding status warning.

### Corrected — duration and terminology

- Corrected a live Roll20 rendering failure in which button-only rows inside the default template were omitted. Status navigation now uses ordinary GM whispers while the health information remains in the default-template table.
- Removed the malformed `Avg Task Duration: N/Ams` output.
- When no queued duration exists, the details panel now reads `N/A - no queued task duration has been recorded.`
- Numeric averages use a spaced unit, for example `15.00 ms`.
- Replaced the ambiguous `Active Listeners` label with `GameAssist Event Hooks` and qualified its limited diagnostic meaning.
- Replaced the raw `Last Update` value with `Last Recorded Activity` and a human-readable sandbox-time display.
- Separated health results from session activity counters so changing command/message counts no longer look like fixed installation expectations.

### Compatibility boundaries

- Preserved the six bundled modules and all prior command literals.
- Kept TokenMod as the standalone marker-mutation dependency for the `v0.1.4.x` line.
- Did not implement any of Issue #24's remaining TokenMod or StatusInfo interoperability work.
- Preserved `!ga-config modules` as the detailed per-module configured/runtime/dependency view.
- Preserved `!ga-metrics` as the longer persisted activity history.
- Preserved captured `R20_ON` routing and the refusal to replace Roll20 global `on` or `off`.

### Version and MECHSUITS records

- Advanced the script header, MECHSUITS banner `project_version`, prose guarantee, visible license banner, runtime `VERSION`, README, smoke-test target, and `script.json` to `0.1.4.6`.
- Added `0.1.4.5` to `script.json.previousversions`.
- Updated `[GAMEASSIST:CORE]` because the runtime version changed.
- Updated `[GAMEASSIST:CORE:OBJECT]` because failed dependency enable attempts now preserve the module's existing configured intent.
- Updated `[GAMEASSIST:INTERFACES:COMMANDS]` because `!ga-status` output, health interpretation, dependency scoping, and public `--details` behavior changed.
- Updated `[GAMEASSIST:BOOTSTRAP]` because startup now preserves configured intent for dependency-skipped modules and checks deliberate disables before dependency diagnostics.
- Left POLICY, APP utilities, queue, compatibility, state, event interface, and all six gameplay-module sections unchanged.
- Preserved the literal `GAMEASSIST` codename, all section tags, and the file-scoped canonical tree.

### Documentation

- Updated `README.md` with the simple/details status split, command syntax, health interpretation, troubleshooting workflow, upgrade path, current release posture, and release summary.
- Updated `Smoketest.md` with DM-readable expected output, button checks, details-panel checks, variable-counter guidance, dependency interpretation, and the corrected unavailable-duration display.
- Updated `ROADMAP.md` to move Issue #23 to sandbox verification while leaving Issue #24 planned separately.
- Added a standalone Issue #23 Roll20 test script and concise acceptance checklist outside the repository working tree.

### Release artifacts

The current repository script and versioned artifact share this Git-normalized SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `859FE5A08516EEBE42D7BB2C05733AE28E5DD49E5954045C4A9D4CA7EC44EAEF` |
| `GameAssist-v0.1.4.6` | `859FE5A08516EEBE42D7BB2C05733AE28E5DD49E5954045C4A9D4CA7EC44EAEF` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.6-issue23-test.js` | `233C20EB6AC6011E8BF26AE8828738C6C8B85E8BBDCD072759F2369786FFEF01` |

### Verification

| Check | Result |
| --- | --- |
| JavaScript syntax for repository, versioned, local Roll20, and harness artifacts | Passed |
| `script.json` parse and version/previous-version metadata | Passed |
| Default, detailed, action-strip, confirmed, unverifiable, missing, startup-skipped, refused-enable, skipped-disable, deliberately-disabled, recorded-error, numeric-duration, and command-boundary status scenarios | Passed (57 assertions) |
| `GameAssist`, `GameAssist-v0.1.4.6`, and local Roll20 test copy normalized identity | Passed |
| Unchanged v0.1.4.5 leaf sections: POLICY, APP utilities, queue, compatibility, state, event interface, and all modules | Passed (12 sections) |
| Prior command-literal preservation | Passed |
| MECHSUITS section pairing and proper nesting | Passed (19 sections) |
| Global Roll20 `on`/`off` non-override contract | Passed |
| `git diff --check` | Passed |
| Roll20 chat rendering and button acceptance | Pending DM smoke test |

The Roll20 API sandbox remains the final acceptance environment for default-template rendering and clickable chat buttons.

---

## [0.1.4.7] – 2026-07-17

### Release definition

v0.1.4.7 is the focused standalone-interoperability release for Issue #24 and the final planned implementation pass in the `v0.1.4.x` line. It keeps TokenMod and StatusInfo as separately installed Roll20 Mod/API scripts while strengthening the way GameAssist detects, authorizes, verifies, and explains marker operations.

The release does not embed either upstream script, introduce the future MarkerService architecture, or replace TokenMod marker mutation with direct `token.set('statusmarkers', ...)` calls. NPCManager and ConcentrationTracker continue sending marker work through TokenMod so StatusInfo can receive TokenMod's observer notifications.

### Issue addressed

- [#24](https://github.com/Mord-Eagle/GameAssist/issues/24) — Stabilize standalone TokenMod and StatusInfo interoperability across the `v0.1.4.x` release line.

### Supported standalone baselines

| Script | Supplied baseline | Contract used by GameAssist |
| --- | --- | --- |
| TokenMod | `0.8.88` | `TokenMod.ObserveTokenChange`, `API_Meta.TokenMod.version`, `--api-as`, `--ids`, and `--set statusmarkers` |
| StatusInfo | `0.3.11` | Optional `StatusInfo` public object/version plus its existing subscription to `TokenMod.ObserveTokenChange` |

These versions remain independently authored and licensed upstream. GameAssist does not copy or modify their source in this release.

### Diagnosed — script-originated TokenMod authorization

- GameAssist previously generated commands in this form:

  ```text
  !token-mod --ids <token-id> --set statusmarkers|+dead
  ```

- A command generated through `sendChat('api', ...)` reaches TokenMod with the API pseudo-player rather than a normal GM player id.
- TokenMod `0.8.88` discards `--ids` targets for a non-GM caller unless either:
  - TokenMod's player-facing `players-can-ids` option is enabled; or
  - the script-originated command uses TokenMod's documented `--api-as <player-id>` option to select a GM identity.
- GameAssist now discovers a campaign GM player id and uses the documented `--api-as` path. Internal marker automation therefore no longer depends on enabling `players-can-ids` for players.
- If no GM identity can be found, GameAssist falls back only when TokenMod explicitly reports `playersCanUse_ids=true`; otherwise it refuses the request and gives the GM an actionable warning.

### Added — standalone contract evidence

- Added shared TokenMod evidence collection in `[GAMEASSIST:APP:UTILS]`:
  - confirms the public `ObserveTokenChange` contract when visible;
  - reads the upstream version from `API_Meta.TokenMod.version` when available;
  - reads the TokenMod `playersCanUse_ids` state only as fallback authorization evidence;
  - does not treat stale persistent TokenMod state by itself as proof that the script is currently installed.
- Added optional StatusInfo evidence:
  - confirms the public StatusInfo object and observer contract when visible;
  - reports `StatusInfo.version`;
  - reports whether `state.STATUSINFO.config.showDescOnStatusChange` is enabled, disabled, or unavailable.
- Updated core dependency checks to use confirmed public TokenMod evidence before falling back to Roll20's sometimes-unavailable internal script list.
- Preserved the three dependency states `confirmed`, `missing`, and `unverifiable`; absence of public evidence remains non-fatal when Roll20 cannot expose a definitive script list.

### Added — marker-result verification

- Added one shared standalone TokenMod request helper for NPCManager and ConcentrationTracker.
- Each request:
  - validates the token and resolved stored marker id;
  - avoids sending work when the token already has the requested state;
  - sends the exact built-in id or custom stored tag through TokenMod;
  - uses `--api-as <GM player id>` whenever a GM identity is available;
  - waits one second, then rereads the token's actual `statusmarkers` value;
  - remains quiet when TokenMod reached the requested state;
  - warns the GM when the state did not change as requested.
- Failure warnings name the token, distinguish add from remove failures, and provide a direct command such as:

  ```text
  !token-mod --ids @{selected|token_id} --set statusmarkers|+dead
  ```

- Pending verification is keyed by token and marker. A newer request supersedes an older pending check so a rapid add/remove sequence does not report the stale request as a failure.
- Verification is delayed with `POLICY.standaloneInterop.markerVerificationDelayMs`; normal Roll20 event execution and the explicit queue model are unchanged.

### Changed — NPCManager 1.1.1

- Advanced NPCManager's independent module version from `1.1.0` to `1.1.1`.
- Routed death-marker add, revival-marker removal, and module-teardown removal through the shared verified TokenMod request helper.
- Corrected the NPCHPRoller auto-roll-on-add initialization race:
  - Roll20 can expose blank or zero placeholder HP while a newly added token is still being initialized;
  - NPCManager now opens a two-second, POLICY-owned setup window when NPCHPRoller `autoRollOnAdd=true`;
  - placeholder HP changes during that window do not add the death marker or create death/revival history;
  - an unknown or blank previous HP value is not treated as proof that a living NPC crossed below 1 HP;
  - later known-positive-to-zero and zero-to-positive changes remain ordinary tracked deaths and revivals.
- Preserved death-history behavior independently of visual marker success:
  - a qualifying death is still recorded in Campaign, Chapter, Section, and Session buckets;
  - revival annotations remain independent of marker removal;
  - Arc and handout behavior is unchanged.
- Teardown no longer reports that markers were already cleared immediately after asynchronous TokenMod commands. It now reports how many removals were requested and states that results will be verified.
- The default built-in death marker remains the literal `dead` id.

### Changed — ConcentrationTracker 0.1.0.6

- Advanced ConcentrationTracker's independent module version from `0.1.0.5` to `0.1.0.6`.
- Routed concentration marker add, `--off` removal, failed-save removal, and module-teardown removal through the shared verified TokenMod request helper.
- Preserved exact custom marker behavior from v0.1.4.3:
  - configured display names resolve through the campaign registry;
  - exact stored tags remain usable without registry access;
  - built-in ids remain literal and exact;
  - `!concentration --status` continues reading token markers directly rather than depending on TokenMod.
- Teardown now reports requested removals without claiming completion before marker verification.

### Preserved — StatusInfo observation path

- Token mutation remains inside standalone TokenMod.
- TokenMod continues calling its registered `ObserveTokenChange` handlers after applying token changes.
- StatusInfo `0.3.11` already registers a TokenMod observer and routes those notifications through its status-marker change handler.
- GameAssist does not emit a second condition description or call StatusInfo internals directly.
- `!ga-status --details` reports StatusInfo evidence, but live condition-description behavior remains a Roll20 smoke-test requirement because campaign condition definitions are user-configurable.

### Changed — troubleshooting status

- Added a `Standalone Integrations` row to `!ga-status --details`.
- When evidence is available, the row reports:
  - detected TokenMod version and that authorized marker requests are verified;
  - detected optional StatusInfo version;
  - whether StatusInfo condition descriptions are enabled.
- The default `!ga-status` panel remains short and unchanged in purpose.
- StatusInfo remains optional and does not affect overall GameAssist health.

### Compatibility boundaries

- Preserved all existing GameAssist command literals.
- Preserved standalone TokenMod as the required marker dependency for NPCManager and ConcentrationTracker.
- Preserved standalone StatusInfo as an optional condition-description and menu script.
- Did not add integrated `[GAMEASSIST:MODULES:TOKENMOD]`, `[GAMEASSIST:MODULES:STATUSINFO]`, or `[GAMEASSIST:CORE:MARKERSERVICE]` sections; those remain assigned to the `v0.1.5.x` roadmap.
- Did not modify `state.TokenMod` or `state.STATUSINFO` beyond read-only interoperability diagnostics.
- Did not change GameAssist's persistent state schema or configuration snapshot schema.
- Did not route marker verification through the serialized queue.

### Version and MECHSUITS records

- Advanced the script header, MECHSUITS banner `project_version`, prose guarantee, visible release banner, runtime `VERSION`, README, smoke-test target, and `script.json` to `0.1.4.7`.
- Added `0.1.4.6` to `script.json.previousversions`.
- Updated `[GAMEASSIST:POLICY]` for the marker-verification delay and NPC HP initialization grace period.
- Updated `[GAMEASSIST:APP]` and `[GAMEASSIST:APP:UTILS]` for external evidence, TokenMod authorization, outcome verification, and StatusInfo observer preservation.
- Updated `[GAMEASSIST:CORE]` and `[GAMEASSIST:CORE:OBJECT]` for the release version and public-contract dependency confirmation.
- Updated `[GAMEASSIST:INTERFACES:COMMANDS]` for the new troubleshooting evidence.
- Updated `[GAMEASSIST:MODULES:NPCMANAGER]` for verified marker requests, new-token initialization suppression, and its independent module patch version; updated `[GAMEASSIST:MODULES:CONCENTRATIONTRACKER]` for verified marker requests and its independent module patch version.
- Updated `[GAMEASSIST:BOOTSTRAP]` for the v0.1.4.7 startup version record without changing lifecycle order.
- Preserved the literal `GAMEASSIST` codename, existing tag names, nesting, and file-scoped canonical tree.

### Documentation

- Updated `README.md` with:
  - TokenMod `0.8.88` and StatusInfo `0.3.11` supported baselines;
  - standalone installation boundaries;
  - `players-can-ids` clarification;
  - direct failure-recovery commands;
  - module version updates;
  - v0.1.4.6 to v0.1.4.7 upgrade and rollback guidance.
- Updated `Smoketest.md` with:
  - expected contract-aware dependency results;
  - the new `Standalone Integrations` troubleshooting row;
  - an initial `players-can-ids` OFF-state isolation pass followed, when applicable, by a restored campaign-setting compatibility pass;
  - TokenMod direct-command isolation;
  - optional StatusInfo observer checks;
  - add/remove/teardown and delayed-warning acceptance checks;
  - an NPCHPRoller auto-roll-on-add check that refuses false death/revival history while preserving later gameplay transitions.
- Updated `ROADMAP.md` to move Issue #24 into live Roll20 acceptance while keeping integrated TokenMod, StatusInfo, and MarkerService work in `v0.1.5.x`.

### Roll20 API sandbox acceptance

- Completed the focused v0.1.4.7 acceptance pass with standalone TokenMod `0.8.88` and optional StatusInfo `0.3.11` behavior enabled for the campaign.
- Confirmed GameAssist health and standalone-integration diagnostics respond with the expected module/dependency posture.
- Confirmed NPCManager adds and removes the built-in `dead` marker, records genuine death/revival history, and completes audit/report/teardown workflows.
- Confirmed NPCHPRoller auto-roll-on-add establishes a new NPC's starting HP without flashing the death marker or creating a false death/revival pair.
- Confirmed a later genuine positive-to-zero change on that auto-rolled NPC is still recorded and a later positive-HP change is still annotated as revival.
- Confirmed ConcentrationTracker marker add, direct status reading, removal, and teardown behavior.
- Confirmed StatusInfo continues observing the relevant TokenMod marker changes without duplicate GameAssist condition output.
- Confirmed the marker workflows remain functional after restoring the campaign's normal TokenMod `players-can-ids` setting.

### Release artifacts

The repository script and versioned artifact share this Git-normalized SHA-256:

| Artifact | SHA-256 |
| --- | --- |
| `GameAssist` | `ADBC0F18CD3517E50A91CEBAA05D83ABD531F9595130F2EF3B750548C05D4953` |
| `GameAssist-v0.1.4.7` | `ADBC0F18CD3517E50A91CEBAA05D83ABD531F9595130F2EF3B750548C05D4953` |

Local Roll20 test copy:

| Artifact | SHA-256 |
| --- | --- |
| `outputs/GameAssist-v0.1.4.7-issue24-test.js` | `0E3D0CE9C97B6A9EACB587C3486E2ABC774A876D8160499EF4BF3FF604AF903C` |

### Verification

| Check | Result |
| --- | --- |
| JavaScript syntax for repository, versioned, local Roll20, and both harness artifacts | Passed |
| Existing status/lifecycle regression harness | Passed (57 assertions) |
| Focused TokenMod/StatusInfo interoperability and NPC initialization harness | Passed (31 assertions) |
| Built-in `dead` add/remove with `players-can-ids=false` | Passed in simulation |
| NPCHPRoller auto-roll-on-add placeholder HP suppression | Passed in simulation |
| Genuine post-initialization NPC death/revival tracking | Passed in simulation |
| Custom concentration tag add/remove/status | Passed in simulation |
| NPCManager and ConcentrationTracker teardown marker requests | Passed in simulation |
| Deliberately failed TokenMod mutation and actionable warning | Passed in simulation |
| TokenMod observer notification path used by StatusInfo | Passed in simulation |
| `script.json` parse and version/previous-version metadata | Passed |
| `GameAssist`, `GameAssist-v0.1.4.7`, and local Roll20 test copy normalized identity | Passed |
| MECHSUITS section pairing, proper nesting, metadata, footers, and canonical-tree agreement | Passed (19 sections; 19 canonical-tree entries) |
| Unchanged implementation-section regression | Passed (8 sections) |
| Prior command-literal preservation | Passed (135 unique literals) |
| Global Roll20 `on`/`off` non-override contract | Passed |
| `git diff --check` | Passed |
| Roll20 API sandbox acceptance with TokenMod and optional StatusInfo | Passed |

The Roll20 API sandbox acceptance pass confirmed real `sendChat` routing, TokenMod timing, token marker persistence, StatusInfo condition-description behavior, and NPCHPRoller/NPCManager initialization ordering for this release candidate.
