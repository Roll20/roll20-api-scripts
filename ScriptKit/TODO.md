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
- [x] `!<plugin> changes` — show the full rendered changelog (not just new stuff)
- [x] `ScriptKit.usage(msg, command?, reason?)` — smart unknown-command handler with fuzzy matching, prefix detection, topic suggestions
- [x] `!<plugin> motd` / `!scriptkit motd [plugin]` — on-demand motd with no-repeat tracking, debounced startup, derived button styling
- [x] MOTD batching: debounced delivery (10s after last registration), single tip from global pool
- [x] Consolidated "What's New" card on startup: shows changes since last seen, dismissable

## Planned Features

### Example Actions
Custom buttons shown in the examples menu for already-generated examples. Allows scripts to provide contextual actions (e.g. Play/Loop for Sequence, Run for Choreograph) directly in the menu without requiring regeneration.

Possible API:
```js
ScriptKit.MyScript.registerExample('MyScript', {
    name: 'my-example',
    actions: (example, handout) => [
        { label: '▶ Play', command: '!sequence play ' + recName },
        { label: '🔁 Loop', command: '!sequence play ' + recName + ' --loop' },
    ],
});
```

Actions render as buttons in the examples menu when the handout already exists, alongside Regen/Open.

### MOTD
- [ ] MOTD configuration menu: per-motd and per-plugin state toggling (A: never, B: per-plugin pool, C: global pool, D: inherit)

### State & Migrations
- [ ] Rollback safety: brainstorm options for downgrade handling (throw, auto-run safe downs, disable handler)
- [ ] State wipe command: `!scriptkit reset <plugin>` to clear state completely

### Version Tagging
- [ ] Multi-script version tagging: allow `version` on items/topics/commands to be string, object `{ scriptName, version }`, or array — lets extension content get proper [new] badges based on the extending script's version

### Other
- [ ] `compareVersion` override in registration opts (custom comparator for [new] badges and migration direction)
