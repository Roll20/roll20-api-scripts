# Choreograph — TODO

## Remaining

- [ ] Expression fallback in filters (boolean expressions as filter conditions)
- [ ] `wave()` function
- [ ] `!choreograph bake` (bake scene timing into Sequence recording)
- [ ] Row-level variable assignment (`set` command)
- [ ] Flow control (if/break/goto — design TBD)
- [ ] Mid-run actor addition
- [ ] `--id-only` flag for scripting (whisper just instance ID)
- [ ] `!choreograph example list` / `!choreograph example <name>` — built-in example scenes

## Known Issues

- `actors()` function not available in delay expressions despite being in scope (needs investigation — may be an eval scope issue with function closures)

## Done

- [x] `--page` token source
- [x] Cast system (`[Cast]` handouts, roles, cast commands)
- [x] Computed variables (metadata-level)
- [x] `actors()` / `actor_ids()` functions
- [x] Scene chaining / `self` / `--parent` / `--depth`
- [x] Looping (`--loop` / `--loop N` / `--loop N --sync`)
- [x] Pause / resume commands
- [x] Sync system / sync participants
- [x] Lifecycle hooks (start/stop/pause/resume with command matching)
- [x] Extension API (registerFunction, registerTokenVariable, registerParameterType, registerConstant, registerLifecycleHook, registerSyncParticipant, generateExtensionHandout)
- [x] `!choreograph man` / `gen-dev-docs`
- [x] Handout change detection / auto-validation
- [x] `!choreograph status`
- [x] `!choreograph help` / `--help`
- [x] Human-readable instance names
- [x] Status card with playback controls
- [x] Sequence ↔ Choreograph integration
