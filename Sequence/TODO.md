# Sequence — Deferred / TODO

## Deferred: Token Create/Destroy

Token creation and destruction are not currently supported. Two design approaches are worth considering:

**Approach A — Per-token keyframe types (`create`/`destroy`)**
Add `create` and `destroy` as keyframe types on a single-token recording. On playback of `create`, call `createObj` using identity data (imgsrc, size, layer, etc.) stored at record time. On playback of `destroy`, call `obj.remove()`. Recording would capture token deletion via `destroy:graphic` and token creation via an `add:graphic` listener (or `--create [n]` flag). Simple extension of the current model but awkward when multiple tokens are involved.

**Approach B — Page-level recording**
A single handout captures an entire scene: one track per token, each track starting/ending at the timestamps when that token existed. Token appearance and disappearance fall out naturally from track start/end times rather than explicit keyframe types. Better fit for cutscene-style multi-token animations but requires a significant rethink of playback targeting (currently one recording plays on one token).

**Why deferred:** Choreograph will introduce multi-token orchestration and may clarify which approach fits better. Revisit after Choreograph is implemented.

---

## Deferred: Command Keyframe — Token Selection

When firing a command keyframe during playback, there is currently no mechanism to select the playback target token so that receiving scripts can act on it via `msg.selected`.

**Design sketch:**
- Add a `sel-command` keyframe type (or `selectToken: true` flag) to indicate the playback target should be "selected" when the command fires
- `!sequence command --select` records with this flag set
- `!sequence add-command --select` sets it on a saved recording
- On playback, construct the outgoing message with the token ID injected into `selected` (or use SelectManager's forwarding mechanism if the target script reads `msg.selected` directly)
- Selection must happen before the command fires

**Multi-selection note:** Some scripts behave differently (or require) multiple tokens in `msg.selected` simultaneously. If combined with a `sync` keyframe, all tokens in the playback group could be injected into `selected` for the subsequent command. This overlaps with the sync/barrier design below.

**Why deferred:** Most scripts can use `{{tokenId}}` substitution instead. Defer until there's a concrete script that requires `msg.selected`.

---

## Deferred: Sync Keyframe Type (Multi-Token Barrier)

When the same recording plays on multiple tokens simultaneously, a `sync` keyframe type would act as a general-purpose barrier: all tokens in the playback group pause at the sync point until everyone arrives, then all proceed together.

**Design sketch:**
- Add `sync` as a keyframe type (alongside `change` and `command`)
- Sessions started from the same `!sequence play` invocation share a playback group ID
- When a session reaches a `sync` row, it pauses until all sessions in the group have reached (or passed) the same sync point
- Configurable timeout with "proceed anyway" fallback to avoid deadlocks
- Whatever follows the sync row (command, change, etc.) benefits from the coordination without needing special flags

**Use cases:**
- Grouped commands: `sync` row followed by `command` row — all tokens are coordinated before the command fires
- Synchronized motion: `sync` before a position change ensures tokens move in unison despite non-deterministic timing earlier
- Combined with token selection: at a sync point, all group members could be injected into `msg.selected` for the next command

**Why deferred:** Requires the "playback group" concept (sessions sharing a group ID). No concrete use case yet. Revisit after Choreograph.

---

## Note: Command Side Effects and Double-Recording

Roll20's `change:graphic` events are **only fired for player/GM-initiated changes**. API-initiated `obj.set()` calls do NOT trigger change events. This means if a command keyframe fires during recording and the receiving script modifies the token via `obj.set()`, Sequence will not capture those changes as duplicate keyframes — there is no double-recording problem for core attributes.

The only scenario where double-recording could occur is with **virtual attributes** where an extension calls `Sequence.notifyChange()` directly in response to a command. Two approaches to handle this without burdening extension authors:

1. **Command prefix registration** — extensions register the prefix strings their commands start with (e.g. `"!myscript"`). When Sequence is about to invoke a recorded command matching that prefix, it temporarily unlinks that extension's `notifyChange` calls until the command's effects settle.

2. **Last-command introspection API** — expose `Sequence.getLastCommand()` or similar, returning the last recorded command and its invocation timestamp. Extensions can check this themselves if they want to conditionally skip `notifyChange` calls triggered by a Sequence-fired command.

Either approach (or both) makes the system safe for virtual attributes without requiring extension authors to manually track suppression state.

---

## Done: `t` Variable in Expressions (Orbit / Cycle Animations)

Normalized time variable `t` (0–1, representing elapsed fraction of the current playback cycle) is available in value expressions:

```
left: =orig + cos(t * TAU) * 140
top:  =orig + sin(t * TAU) * 140
```

`t` is 0 at the first frame, 1 at the last frame, and resets each loop cycle. Requires `continuous` easing on the segment.

---

## Done: `continuous` Easing, Function Memoization, and `freeze`

**Continuous easing:** Setting a segment's easing to `continuous` causes the expression to re-evaluate every tick rather than evaluating once and lerping. This is required for `t`-based animations.

**Function classification:** Functions can be registered with `continuous: true` (non-deterministic, e.g. `rand`, `randInt`, `pick`). In a non-continuous segment, these are memoized per call-site so they produce a stable value for the duration of the segment. In a continuous segment they re-evaluate freely each tick.

**`freeze(value)`:** A special function that always memoizes its result per call-site, even in a continuous segment. Use to stabilize non-deterministic values: `=orig + freeze(rand(-50,50)) + cos(t * TAU) * 140` gives a stable random offset with continuous oscillation. Cache resets each loop cycle.

**`PI` and `TAU` constants:** `PI` (π) and `TAU` (2π) are available in all expressions.

**`_wrapNode` fix:** Primitives (numbers, booleans) in `EXPR_SCOPE` are now passed through correctly instead of being wrapped as empty objects.

---

## Deferred: Parameterized Recordings / `!sequence generate`

Rather than a `generate` command that creates handouts from parameters, a better approach may be parameterized recordings — handouts where expressions reference parameters supplied at play time (e.g. `--param distance=140`). This would allow shipping pre-built templates (spin, hover, orbit) that users can customize without editing the handout.

However, Choreograph already has a `{{paramName}}` substitution system and is the natural place for per-token parameter customization. Designing Sequence's parameter system before Choreograph exists risks duplication or conflict.

**Plan:** Implement `t` (normalized loop time) in Sequence now. Defer full parameter substitution until Choreograph clarifies the boundary between the two systems. Ship example handouts (spin, hover, orbit using `t`) after `t` is implemented.

---

## Planned: MovementAnimations Parity

Spin and hover are straightforward with current Sequence. Orbit requires the `t` variable or Choreograph. Wave stagger offsets (the 8 sort orders from MovementAnimations) belong in Choreograph.
