# Choreograph — TODO

## Remaining

- [ ] `!choreograph bake` (bake scene timing into Sequence recording)
- [ ] Row-level variable assignment (`set` command)
- [ ] Flow control (if/break/goto — design TBD)
- [ ] Mid-run actor addition
- [ ] `--id-only` flag for scripting

## Known Issues

(none currently)

## Done

- [x] MVP (run, new, list, edit, delete, stop, refresh, add-row, dump-html)
- [x] `--page` token source
- [x] Cast system (`[Cast]` handouts, roles, cast commands)
- [x] Computed variables (metadata-level)
- [x] `actors()` / `actor_ids()` functions
- [x] Scene chaining / `self` / `--parent` / `--depth`
- [x] Looping (`--loop` / `--loop N` / `--loop N --sync`)
- [x] Pause / resume commands
- [x] Sync system / sync participants
- [x] Lifecycle hooks (start/stop/pause/resume with command matching)
- [x] Extension API (registerFunction, registerTokenVariable, registerParameterType, registerConstant, registerLifecycleHook, registerSyncParticipant, registerExample, generateExtensionHandout)
- [x] Expression fallback in filters (boolean expressions)
- [x] `wave()` function
- [x] `!choreograph man` / `gen-dev-docs` / `help`
- [x] Handout change detection / auto-validation
- [x] `!choreograph status`
- [x] Human-readable instance names
- [x] Status card with playback controls
- [x] Sequence ↔ Choreograph integration
- [x] `!choreograph example list` / `!choreograph example <name>` with onGenerate
- [x] Multi-command cells (split on `<p>` boundaries)
- [x] SelectManager integration (conditional `{& select}` for `!` commands)
- [x] `dispatchCommands` helper (shared by executeChunk and resumeScene)
- [x] `buildHookContext` / `sceneInfo` msg-shaped context
- [x] Source-based dedup on lifecycle/sync registration
- [x] `--silent` flag in Sequence for suppressing menus
- [x] Expression round-trip in Sequence handouts
