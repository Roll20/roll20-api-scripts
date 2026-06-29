# Sequence — TODO / Deferred

## Post-Release Enhancements

- [ ] `!sequence tutorial` — interactive in-chat quick start guiding user through first recording
- [ ] Handout row selection — bulk easing change for selected rows/columns (include "select all")
- [ ] Handout preview button — should work without pre-selected token (show playback menu that uses selection at click-time)

---

## Deferred: Token Create/Destroy

Token creation and destruction are not currently supported. Two design approaches:

**Approach A — Per-token keyframe types (`create`/`destroy`)**
Add `create` and `destroy` as keyframe types. On playback of `create`, call `createObj`. On `destroy`, call `obj.remove()`.

**Approach B — Page-level recording**
A single handout captures an entire scene: one track per token, each starting/ending when that token existed.

**Status:** Deferred. Choreograph handles multi-token orchestration but doesn't address single-recording create/destroy.

---

## Deferred: Sync Keyframe Type (Multi-Token Barrier)

Choreograph provides multi-token sync at the orchestration layer. Sequence-level sync (within a single recording across multiple tokens playing the same recording) is a narrower use case. No concrete need identified.

---

## Done (v1.0.0)

- [x] Built-in examples (spin, hover, pulse, orbit, shake, torch-flicker, rgb-cycle, boss-phase-2)
- [x] Per-attribute lerp segments (engine fix)
- [x] Flat keyframe format (multi-track removed)
- [x] String lerp (levenshtein) — `registerString` type for name, tooltip, gmnotes
- [x] UDL lighting attrs (bright_light_distance, low_light_distance, night_vision_distance, dim_light_opacity)
- [x] Batch `obj.set({})` for all core attrs per tick (fixes lighting visual updates)
- [x] Color constant/expression fixes (prototype preservation in _wrapNode, duck-typed coercion)
- [x] `get("attrName")` expression function (cross-attribute access)
- [x] `cell(n)` / `unit(n)` expression functions (grid/map-scale conversion)
- [x] `round(x, step)` / `floor(x, step)` / `ceil(x, step)` — optional step argument
- [x] Duration derived from last resolved keyframe time (not stored)
- [x] Default easing: `step` (faithful recorded playback)
- [x] Attribute groups (`registerAttributeGroup` API with join option)
- [x] Snapshot button in recording menu (captures identity at time, prunes on save)
- [x] `registerAttribute` requires namespace, description, valueType
- [x] Identity default: `(obj) => ({ abs: reg.get(obj) })` if not provided
- [x] Play/Loop/[open] buttons in save messages, example output, stopped playback menu
- [x] [open] link in playback menu
- [x] Example namespacing (source/name keys)
- [x] Archived example handouts
- [x] `registerColor` parse detects expressions
- [x] `registerString` parse detects expressions, supports `+suffix` delta and `=""` empty
- [x] `parseFloat` numeric initialState values
- [x] Complete JSDoc docstrings for all registration functions
- [x] Recording Struct + registerExample documented in gen-dev-docs
- [x] MovementAnimations parity (orbit, spin, hover, wave stagger, freeze/clear)
- [x] Choreograph integration (lifecycle hooks, sync participant, examples)
- [x] `--silent` flag for programmatic invocation
- [x] Expression deltas round-trip through handout HTML
- [x] `t` variable, `continuous` easing, `freeze()`, PI/TAU
