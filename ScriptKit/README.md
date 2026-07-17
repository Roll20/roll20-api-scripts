# ScriptKit

Generic framework library for Roll20 API scripts. Provides help/man commands, handout generation, interactive setup guides, state migrations, and initialization coordination.

**Not a standalone script** — other scripts register with ScriptKit to gain these features automatically.

## Requirements

- Roll20 Pro subscription (API access required)

## Installation

Install from the Roll20 One-Click Script Library, or paste `ScriptKit.js` into a new API script slot. Scripts that depend on ScriptKit will detect it automatically via the `!scriptkit-ready` signal.

## For Script Developers

### ⚠️ Text Rendering

**All text in ScriptKit is auto-formatted by default.** This means any string you provide for descriptions, prompts, bodies, item names, motd, etc. will have:
- HTML entities escaped (`<`, `>`, `&`)
- Markdown converted: `` `code` `` → `<code>`, `**bold**` → `<b>`, `*italic*` → `<i>`
- `\n` converted to `<br>`

If you need to pass **raw HTML** (e.g. from `html.bold()`, `html.table()`, or hand-crafted HTML), wrap it in `html.raw(...)`:

```js
body: html.raw(html.bold('Title') + html.br() + html.code('example'))
```

Without `html.raw()`, the HTML tags would be escaped and displayed as literal text.

### Registration

Minimal registration:

```js
ScriptKit.register('MyScript', // the name of your script
{
    command: '!myscript', // the first part of your script's command (the `!` is optional)
    version: '1.0.0',  // Your script's current version
});
```

Full registration with all options:

```js
ScriptKit.register('MyScript', {

    command: '!myscript',
    version: '1.4.6.7',
    newSince: '1.4.5.0', // items with version >= this get [new] badge; otherwise, "new" is auto-calculated based on the 1st and 2nd parts of version (good enough for most)

    tag: 'MS',  // guide handout naming: [MS] source/example-name

    // see "MOTD (Message of the Day)" section below for more info on motd, motdHeader, and motdStyle
    motd: [ /* ... */ ],
    motdHeader: '⚔️ <b>MyScript</b> v1.2.0 "Phoenix"',
    motdStyle: { borderLeft: '3px solid #ff6600' },

    // The keywords users type to access various commands.
    // Override only to: disable commands entirely (null), provide backward compatibility, or prevent conflicts with existing commands.
    // Arrays allow for multiple aliases. The default values for these command aliases are below:
    aliases: {
        help: ['help', '--help'],         // a help command auto-generated from `help.commands`
        man: 'man',                       // a more detailed search-based help command auto-generated from `help.topics`
        examples: 'examples',             // a menu for examples generated from `ScriptKit.MyScript.registerExample`
        whatsnew: 'whatsnew',             // a changelist command that shows anything that is new
        genHelp: 'gen-help',              // regenerates the user help handout
                                          // (sourced from `help.topics` where `topic.handouts == 'usr' || topic.handouts.includes('usr')`)
        genDev: 'gen-dev-docs',           // generates the dev help handout that explains how to extend your api
                                          // (sourced from `help.topics` where `topic.handouts == 'dev' || topic.handouts.includes('dev')`)
        generate: 'example!',             // generates an example handout (usually called via buttons in the examples menu)
        guide: 'guide',                   // starts an example guide by name (usually called via buttons in the examples menu)
        guideContinue: 'guide-continue',  // continues to the next step of a guide (usually called via a button in the guide's current step menu)
        guideBack: 'guide-back',          // goes back to the previous step of a guide (usually called via a button in the guide's current step menu)
        guideCancel: 'guide-cancel',      // cancels a guide (usually called via a button in the guide's current step menu)
        migrate: 'migrate',               // sequentially runs migrations to go from the state's version to match your script's version (required for rollbacks)
    },
    help: { /* see "Registering Help Data" section below */ },
    handout: 'update', // see "Handout modes" in "Registering Help Data" section below
    devHandout: 'update', // same modes as handout, but for the dev docs handout (default: 'update')
});
```

### Consuming in handleInput

```js
const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    if (msg.content.split(' ')[0] !== '!myscript') return;

    // ScriptKit handles help, man, examples, whatsnew, gen-help, gen-dev-docs
    if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;

    // ... your command handling
};
```

### Ready Signal Pattern

When `ScriptKit.register()` is called, it automatically sends `!<command>-ready` to chat. Other scripts can listen for this to know when your script is available (e.g. for direct API calls). Note: registering examples does NOT require waiting for the ready signal — ScriptKit's Proxy queues them automatically regardless of load order.

```js
// Registration function
const registerWithScriptKit = () => {
    // Check to see if ScriptKit has been loaded yet
    if (typeof ScriptKit === 'undefined') return;
    // Register with ScriptKit
    ScriptKit.register('MyScript', { /* ... */ });
    // Also register examples below if you want examples
};

// Attempts to register right away
registerWithScriptKit();
// Setups up registration when ScriptKit is ready in case ScriptKit loads after this script
on('chat:message',(msg) => {
    if (msg.type === 'api' && msg.content === '!scriptkit-ready') registerWithScriptKit();
});
```

### Registering Help Data

The `help` object defines what appears in `!cmd help`, `!cmd man`, `!cmd whatsnew`, and the generated handouts.

```js
help: {
    description: 'Short description shown at the top of help.',
    quickStart: [                    // ordered list shown in handout (optional)
        'Step 1...',
        'Step 2...',
    ],
    changelog: [                     // explicit changelog entries for whatsnew; provided in addition to any items auto-identified as "new".
        { version: '1.0.0', changes: ['Initial release', 'Added feature X'] }
    ],
    commands: [                      // grouped command list
        { group: 'Core', commands: [
            { syntax: 'run <name>', description: 'Run something', version: '1.0.0',
              details: 'Longer explanation shown in handout only.',
              items: [               // sub-items (flags, args) rendered as bullet list
                  { name: '--flag', description: 'A flag', version: '1.0.0' }
              ]
            }
        ]}
    ],
    topics: {                        // detailed help topics for man/handout
        myTopic: {
            title: 'My Topic',
            description: 'Short description for topic list.',
            version: '1.0.0',
            details: 'Shown in handout only (optional).',
            body: 'Main content — string or function returning string.',
            handouts: 'usr',         // 'usr' (default) | 'dev' | ['usr','dev'] | null (man-only)
            items: [
                { name: 'item1', description: 'An item', version: '1.0.0' }
            ]
        }
    }
}
```

**Version badges:** Items with `version >= newSince` get a `[new]` badge. Items under a parent that is already `[new]` don't get redundant badges.

**Handout modes** (`handout` field — controls user help handout):
- `'auto'` (default) — create handout if missing, update on version bump
- `'update'` — only update if handout already exists
- `'manual'` — only via explicit `!cmd gen-help`

**Dev handout mode** (`devHandout` field — controls dev docs handout):
- `'auto'` — create if missing, update on version bump
- `'update'` (default) — only update if handout already exists (dev must run `!cmd gen-dev-docs` once to create)
- `'manual'` — only via explicit `!cmd gen-dev-docs`

### Registering Examples

Examples are interactive demos that users can browse (`!cmd examples`) and generate. They can include a guide (step-by-step wizard), a handout (generated content), or both.

**Who registers examples:**
- **Your own script** registers examples for itself (e.g. Gaslight registers stealth/truesight examples targeting Gaslight)
- **Other scripts** can register examples for your script that showcase integration (e.g. Sequence registers Choreograph examples that use Sequence animations)

**Load order doesn't matter:** ScriptKit uses a Proxy-based namespace (`ScriptKit.MyScript.registerExample(...)`) that queues examples if the target script hasn't registered yet. When the target registers, queued examples drain automatically. This means script A can register examples for script B regardless of which loads first.

**Registration:**

```js
// Register an example targeting MyScript (first arg = who is providing the example)
ScriptKit.MyScript.registerExample('OtherScript', {
    name: 'my-example',
    description: 'What this example does',
    // `guide` — step-by-step wizard. Only required if there is no handout.
    // See "Examples: Guides" section below for more details.
    guide: [
        { prompt: 'Select tokens to use.', select: 'token', as: 'targets', min: 1 },
        { prompt: 'Choose a name.', query: { name: 'exName', default: 'default' } },
        ScriptKit.handout(),
        { prompt: (ctx) => 'Find **' + ctx.handoutName + '** in the journal.' },
    ],
    // `handout` — generated content. Only required if there is no guide.
    // See "Examples: Handouts" section below for more details.
    handout: (ctx) => ({
        notes: 'Content using ' + ctx.params.exName,
        archived: false, // defaults to true
    }),
});
```

**Self-registration** (your script provides its own examples):

```js
ScriptKit.MyScript.registerExample('MyScript', {
    name: 'first-setup',
    description: 'Walk through initial setup (no handout)',
    guide: [
        { prompt: 'Step 1: do this...' },
        { prompt: 'Step 2: do that...' },
    ],
});
```

**Requirements:** Every example must have a `guide`, a `handout`, or both. ScriptKit logs an error and rejects examples that have neither.

**Examples menu:** Users see a list with buttons:
- Has handout, not yet generated → `+ Generate`
- Has handout, already generated → `🔄 Regen` + `[Open]` (+ `🧭 Guide` if guide exists)
- Guide only, no handout → `🧭 Guide`

### Examples: Guides

Guides are interactive multi-step wizards that walk users through setup. Each step shows a prompt and waits for the user to click Continue (or auto-advances if `auto: true`).

**Step fields:**

| Field | Description |
|-------|-------------|
| `prompt` | String or `(ctx) => string`. Supports markdown: `` `code` ``, `**bold**`, `*italic*` |
| `select` | Roll20 `_type` to filter selection: `'token'`, `'card'`, `'pin'`, `'path'` |
| `as` | Key to store selection in `ctx.selections` |
| `min` / `max` | Selection count constraints |
| `query` | Object or array: `{ name, default?, type?, options? }` |
| `onContinue` | `(ctx) => errorString?` — validate before advancing. Return a string to block with an error. |
| `onEnter` | `(ctx, advance) => void` — called when step becomes active. `advance(error?)` to programmatically continue. |
| `onExit` | `(ctx) => void` — called when leaving via Back. Clean up listeners, revert changes. |
| `auto` | `true` = skip without user interaction (not counted in step total) |

**The `ctx` object** passed to callbacks contains:
- `ctx.selections` — stored selections from previous steps (keyed by `as`)
- `ctx.params` — stored query values (keyed by query `name`)
- `ctx.msg` — the original chat message
- `ctx.handoutName` — the computed handout name (available after `ScriptKit.handout()` step)
- `ctx.selected` — the current step's selection (in `onContinue`)

**Visual feedback:** Each step renders with a hue-rotating background color so users can see progression at a glance.

**Error handling:** If `onContinue` returns a string, it's shown as a formatted error (supports markdown) and the step doesn't advance. The user must fix the issue and click Continue again.

**`ScriptKit.waitForCommand(cmd)`** — returns `{ onEnter, onExit }` that auto-advances when the specified command is detected in chat:

```js
{ prompt: 'Run `!reload` to continue.',
  ...ScriptKit.waitForCommand('!reload')
}
```

### Examples: Handouts

The `handout` field on an example defines what gets created in the journal. It can be a static object or a function that receives `ctx` after guide completion.

**Static handout** (generated before guide starts):
```js
handout: {
    notes: 'Handout content here',
    gmnotes: 'GM-only notes',
    archived: false,  // default: true
}
```

**Dynamic handout** (generated after guide collects params):
```js
handout: (ctx) => ({
    notes: 'Content using ' + ctx.params.myParam,
    archived: false,
})
```

**`ScriptKit.handout()` step** — place in the guide to control exactly when generation happens:

```js
guide: [
    { prompt: 'Choose a name.', query: { name: 'exName', default: 'test' } },
    ScriptKit.handout(),  // handout generated here, with access to ctx.params
    { prompt: (ctx) => 'Find **' + ctx.handoutName + '** in the journal.' },
]
```

**Placement rules** (if no explicit `ScriptKit.handout()` step):
- Function handout → generated after last guide step
- Object handout → generated before first guide step

**Handout fields:**

| Field | Description |
|-------|-------------|
| `notes` | Main handout content (HTML or plain text) |
| `gmnotes` | GM-only notes section |
| `avatar` | Handout avatar image URL |
| `archived` | Whether to archive the handout (default: `true`) |
| `inplayerjournals` | Player journal visibility (default: `''`) |

**Naming:** Handouts are named `[tag] source/example-name` where `tag` comes from your registration and `source` is the script that registered the example.

### HTML Helpers

Available via `ScriptKit.html`:

| Helper | Description |
|--------|-------------|
| `escape(str)` | Escape HTML entities + `\n` → `<br>` |
| `format(str)` | Escape + markdown (`` `code` ``, `**bold**`, `*italic*`) |
| `bold(text, style?)` | `<b>` tag |
| `italic(text, style?)` | `<i>` tag |
| `code(text, style?)` | `<code>` with auto-escape |
| `button(label, cmd, style?)` | Clickable command link |
| `table(headers, rows, style?)` | HTML table |
| `list(items)` / `orderedList(items)` | `<ul>` / `<ol>` |
| `handoutLink(text, id)` | Journal link |
| `newBadge()` / `deprecatedBadge()` | Version badges |

### Query Type Coercion

```js
{ query: { name: 'speed', type: Number, default: 2 } }      // coerces to number
{ query: { name: 'enabled', type: Boolean } }                 // 'true'/'false' → boolean
{ query: { name: 'color', type: (v) => {                     // custom validator
    if (!v.startsWith('#')) throw 'Must be a hex color';
    return v;
}}}
```

### State Migrations

ScriptKit manages versioned state migrations so your script's persistent state stays compatible across updates and downgrades.

**Registration:**

```js
ScriptKit.register('MyScript', {
    // ...
    state: state.MyScript,   // reference to your script's persistent state object
    migrations: {
        '1.1.0': {
            up: (s) => { s.newField = []; },
            down: '(s) => { delete s.newField; }'  // string — persisted for rollback
        },
        '1.2.0': {
            up: (s) => { s.config.newOption = true; },
            down: '(s) => { delete s.config.newOption; }'
        },
    },
});
```

**How it works:**

1. On registration, ScriptKit compares the stored state version against your script's `version`.
2. If state is behind → runs `up` functions sequentially (auto-upgrade).
3. If state is ahead (downgrade detected) → warns the user to run `!cmd migrate`.
4. `!cmd migrate` syncs state to match the current script version in either direction.

**Key design decisions:**

- **`up`** is a function — runs during auto-upgrade or manual forward migration.
- **`down`** is a **string** — stored in `state.ScriptKit.migrations` so it survives code replacement. When you downgrade to an older version that doesn't have the rollback code, the stored strings are eval'd to roll back state.
- **Working copy** — all migrations run against a clone of state. If any migration throws, real state is untouched.
- **Failure = throw** — migrations signal failure by throwing. Return values are ignored.
- **No `--rollback` flag** — `!cmd migrate` always targets the current script version. Forward or backward is determined automatically.

**`down` function constraints** (since it's a string that gets eval'd later):
- Must be self-contained — no closures, no references to your script's scope
- Must be a valid arrow function or function expression as a string
- Keep it simple — just delete/reset what `up` added/changed

**Example rollback scenario:**
1. User installs v1.2.0 → `up` functions run, `down` strings stored in state
2. User downgrades to v1.0.0 → ScriptKit warns "state incompatible, run `!myscript migrate`"
3. User runs `!myscript migrate` → stored `down` strings for v1.2.0 and v1.1.0 are eval'd against a working copy
4. All succeed → state committed, version updated to v1.0.0

### MOTD (Message of the Day)

Display a random tip to the GM on sandbox startup. Helps with feature discoverability.

```js
ScriptKit.register('MyScript', {
    // ...
    motd: [
        'Tip: Use `!myscript man <topic>` to search help by keyword.',
        'Try `!myscript examples` to see ready-made setups you can install.',
        'New in v1.2.0: selective sync control with `!myscript sync`.',
    ],
    motdHeader: '⚔️ <b>MyScript</b> v1.2.0 "Phoenix"',  // optional — default: "💡 ScriptName vX.Y.Z"
    motdStyle: { borderLeft: '3px solid #ff6600' },        // optional — merges with default card style
});
```

- `motd` — array of tip strings (supports markdown via `html.format`). Empty array or omitted = no motd.
- `motdHeader` — string or `(version) => string`. Customizes the card header.
- `motdStyle` — object of CSS properties to override the default card appearance.

A random tip is whispered to the GM once per sandbox restart, styled as a compact card.

## Changelog

### v1.0.0
- Initial release
- Help/Man system with grouped commands, searchable topics, version badges
- Handout generation with Quick Start, What's New, examples footer
- Interactive guide engine with selection, queries, type coercion, validation
- State migrations with semver comparison, auto-upgrade, manual rollback
- HTML helpers with markdown formatting
- Ready signal coordination
- `ScriptKit.handout()` for deferred handout generation
- `ScriptKit.waitForCommand()` for auto-advance on chat commands

## License

MIT
