# Sequence — Deferred / TODO

## Deferred: Token Create/Destroy

Token creation and destruction are not currently supported. Two design approaches are worth considering:

**Approach A — Per-token keyframe types (`create`/`destroy`)**
Add `create` and `destroy` as keyframe types on a single-token recording. On playback of `create`, call `createObj` using identity data (imgsrc, size, layer, etc.) stored at record time. On playback of `destroy`, call `obj.remove()`.

**Approach B — Page-level recording**
A single handout captures an entire scene: one track per token, each track starting/ending at the timestamps when that token existed.

**Status:** Still deferred. Choreograph handles multi-token orchestration but doesn't address single-recording create/destroy.

---

## Deferred: Command Keyframe — Token Selection

**Update:** SelectManager's `{& select id1, id2}` syntax solves this for API commands. Sequence command keyframes can include `{& select {{tokenId}}}` in the command string to inject selection. No engine-level change needed.

For the simple case, `{{tokenId}}` substitution in the command string is sufficient. The `sel-command` type or `--select` flag may still be useful as sugar, but is no longer a blocker.

---

## Deferred: Sync Keyframe Type (Multi-Token Barrier)

**Update:** Choreograph provides multi-token sync at the orchestration layer. Sequence-level sync (within a single recording across multiple tokens playing the same recording) is a separate, narrower use case. Still deferred — no concrete need identified.

---

## Note: Command Side Effects and Double-Recording

Roll20's `change:graphic` events are **only fired for player/GM-initiated changes**. API-initiated `obj.set()` calls do NOT trigger change events. No double-recording problem for core attributes.

For virtual attributes, two approaches documented for future implementation:
1. Command prefix registration (suppress `notifyChange` during command execution)
2. Last-command introspection API (`Sequence.getLastCommand()`)

---

## Closed: Parameterized Recordings / `!sequence generate`

**Resolution:** Parameters belong in Choreograph, not Sequence. Choreograph handles per-token customization via scene parameters (`--speed 140`, `--anim pulse`). Sequence stays focused on individual token animation — if you need parameterized behavior, use Choreograph to orchestrate.

Example recordings (scatter, pulse, orbit) are generated via Choreograph's example system with `onGenerate` callbacks.

---

## Closed: MovementAnimations Parity

**Resolution:**
- **Orbit** — done via `t` + `continuous` easing: `=orig + cos(t * TAU) * distance`
- **Spin** — simple recording: `rotation: +360` over duration, play with `--loop accumulate`
- **Hover** — simple recording: `top` delta with ease-in-out, play with `--loop reset`
- **Wave stagger** — done via Choreograph: `stagger(rank("left"), interval)` or `wave(left, wavelength, duration)`
- **Freeze/Unfreeze** — `!sequence pause-play` / `!sequence resume-play`
- **Clear** — `!sequence stop-play`

All parity achieved between Sequence + Choreograph.

---

## Done: `t` Variable, `continuous` Easing, `freeze`, PI/TAU

Fully implemented and tested. See README for documentation.

---

## Done: Expression Deltas Round-Trip Through Handout HTML

`generateHandoutHtml` renders `{ expr, mode }` deltas. Continuous recordings can be saved as handouts and hand-edited.

---

## Done: `--silent` Flag

Suppresses playback menus when Sequence is invoked programmatically (by Choreograph or other scripts). Set via `--silent` flag or automatically when `msg.sceneInfo` is present.

---

## Done: Choreograph Integration

Sequence registers with Choreograph on `!choreograph-ready`:
- Lifecycle hooks (start/stop/pause/resume) for `!sequence` commands
- Sync participant (waits for playback to finish)
- Constants (PI, TAU)
- Example scenes (scatter, wave) with `onGenerate` callbacks
