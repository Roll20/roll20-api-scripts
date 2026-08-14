# ScriptKit TODO

## Done (v1.3.0)

- [x] Characters within code/pre blocks un-formatted (asterisks and links preserved inside backtick code spans)
- [x] html.table: overflow-x:auto wrapper, white-space:nowrap on headers
- [x] Null topic guard in man command
- [x] `ScriptKit.getHelpHandout(scriptName)` and `ScriptKit.getDevHandout(scriptName)` — cached handout lookup
- [x] `html.handoutLink(text, id, style, anchor)` — optional anchor param for deep-linking to handout sections
- [x] `help` should not inline topics list — replaced with Browse Topics button
- [x] `help` auto-injected commands — now shows whatsnew, gen-help, gen-dev-docs (conditionally)
- [x] `!scriptkit whatsnew [date]` — consolidated whatsnew across all registered plugins with date filtering
- [x] Per-plugin whatsnew accepts date argument
- [x] Version date tracking — changelog dates stored in state, current version auto-stamped
- [x] `man` topics show 📖 link to handout section

## Planned Features

### Help System
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
