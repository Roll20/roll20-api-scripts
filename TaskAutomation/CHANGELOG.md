# Changelog

## 1.0.0

First release, by MidNiteShadow7.

### Added

- Tasks described as validated JSON, with drafts, numbered published revisions, import/export (including in parts), cloning, archiving and permanent deletion with a confirmation. Runs keep the revision they started with.
- Steps: waits for a duration or until a time, waits for events with a timeout, conditions, counted, `while`, `until` and GM-approved `forever` loops, calls to other tasks (awaited or detached), parallel branches joined by `all`, `anySuccess` or `race` with explicit merge rules, variables, signals and `stop`.
- Actions: chat (say, emote, describe, whisper, GM commands), token properties, multi-sided token sides, status markers (with counters), attributes (set, adjust, read; optional sheet workers), pings, visual effects, jukebox play/stop/volume, starting, pausing and cancelling other runs, commands to other Mods and trusted Mod adapters.
- Triggers: buttons and commands, one-off times, fixed-rate and fixed-delay intervals, daily and weekly times at a fixed UTC offset, token, attribute, turn order, turn tracker, player page and player presence events, task lifecycle events, signals and opt-in chat, with cooldown, debounce, burst caps and per-object coalescing.
- One timer for all work, with bounded draining; an idle game has no timer.
- Restart recovery: runs carry on from their saved step, interrupted actions are confirmed or sent for review instead of being repeated, observation gaps are recorded, and one summary is whispered.
- Missed-work handling with `skip`, `runOnce`, `catchUpBounded`, `review` and `expire`, counted without replaying every missed time, and incidents with previews and single-use confirmations.
- Concurrency policies (`allow`, `skipIfRunning`, `queue`, `replace`), a circuit breaker, ancestry limits and an emergency stop.
- A GM-only dashboard handout with pause, resume, cancel, decision and recovery buttons; an optional player view; a GM-only Help handout.
- GM-only by default; tasks can be shared with listed players, who can only use them on tokens they control.
- `TaskAutomation.registerAdapter`, `registerAction`, `registerTrigger`, `emit`, `signal` and `start` for other Mods, with a reference adapter.
- Seven worked examples plus the montage as templates and JSON files, a JSON Schema, and guides for authoring, operations and adapters.
