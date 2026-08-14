# ScriptKit TODO

## Done (v1.3.0)

- [x] Characters within code/pre blocks un-formatted (asterisks and links preserved inside backtick code spans)
- [x] html.table: overflow-x:auto wrapper, white-space:nowrap on headers
- [x] Null topic guard in man command

## Planned Features

### Handout Helpers
- [ ] `ScriptKit.getHelpHandout(scriptName)` and `ScriptKit.getDevHandout(scriptName)` — return the handout object for a given script
- [ ] Extend `html.handoutLink(text, id, style)` to optionally accept a header/anchor name (e.g. `html.handoutLink(text, id, { anchor: 'Filters' })`) and generate an anchored link (`#HeaderName`)

### Help System
- [ ] `help` should not inline topics list — show a button that runs `man` (no args) to display topics separately
- [ ] `help` auto-injected commands incomplete — should also show: whatsnew, changes, motd, gen-help, gen-dev-docs (conditionally based on enabled aliases)
- [ ] `!scriptkit whatsnew` — consolidated whatsnew across all registered plugins
- [ ] `!<plugin> changes` — show the full rendered changelog (not just new stuff)

### MOTD
- [ ] MOTD configuration menu: per-motd and per-plugin state toggling (A: never, B: per-plugin pool, C: global pool, D: inherit)
- [ ] MOTD batching: delay delivery until ~10s after last register, show all at once + consolidated "What's New" card for upgraded plugins
- [ ] `!scriptkit motd [<plugin>]` — show another random motd on demand; button at bottom of each card

### State & Migrations
- [ ] Rollback safety: brainstorm options for downgrade handling (throw, auto-run safe downs, disable handler)
- [ ] State wipe command: `!scriptkit reset <plugin>` to clear state completely

### Version Tagging
- [ ] Multi-script version tagging: allow `version` on items/topics/commands to be string, object `{ scriptName, version }`, or array — lets extension content get proper [new] badges based on the extending script's version

### Other
- [ ] `ScriptKit.MyScript.usage(msg)` — fuzzy-match unknown subcommands and suggest "Did you mean X?"
- [ ] `compareVersion` override in registration opts (custom comparator for [new] badges and migration direction)
