# Choreograph

A meta-sequencer for Roll20 tokens. Define scenes in handouts — filter tokens, compute per-token timing, and fire commands at the right moments.

Choreograph doesn't animate anything itself. It's a scheduler that orchestrates other scripts (like Sequence) by deciding who does what, and when.

## Requirements

- Roll20 Pro subscription (API access required)
- SelectManager (dependency — handles token selection injection)
- Sequence (recommended, for animation playback)

## Installation

Install from the Roll20 One-Click Script Library, or paste `Choreograph.js` into a new API script slot. Ensure SelectManager is installed.

## Quick Start

1. Type `!choreograph new my-scene` to create a blank scene handout
2. Open the `[Scene] my-scene` handout and define your scene table
3. Select tokens and type `!choreograph run my-scene`

## Commands

| Command | Description |
|---------|-------------|
| `!choreograph run <name> [flags]` | Execute a scene |
| `!choreograph new <name>` | Create blank scene handout |
| `!choreograph list [query]` | List scenes (fuzzy search) |
| `!choreograph edit <name>` | Open scene handout |
| `!choreograph delete <name> [--force]` | Delete a scene |
| `!choreograph stop [name]` | Stop running scene(s) |
| `!choreograph pause [name]` | Pause running scene(s) |
| `!choreograph resume [name]` | Resume paused scene(s) |
| `!choreograph status` | Show all running scenes |
| `!choreograph refresh <name>` | Regenerate handout from cache |
| `!choreograph add-row <name>` | Add a blank row to scene table |
| `!choreograph dump-html <name>` | Dump raw handout HTML to console |
| `!choreograph cast ...` | Manage casts (see Cast System) |
| `!choreograph echo <text>` | Debug: whisper text with timestamp |

### Run Flags

| Flag | Description |
|------|-------------|
| `--id <token_ids...>` | Populate cast from explicit IDs |
| `--page [page_id]` | Populate cast from all tokens on a page |
| `--cast <cast_name>` | Populate cast from a saved cast |
| `ignore-selected` | Don't include selected tokens in cast |
| `--loop` | Loop indefinitely (sync between cycles) |
| `--loop N` | Loop N times (immediate restart) |
| `--loop N --sync` | Loop N times (sync between cycles) |
| `--depth N` | Max chaining depth (default: 10) |
| `--sync-timeout <ms>` | Sync timeout (default: 30000) |
| `--<param> <value>` | Bind a scene parameter |

## Scene Handout Structure

Scenes are stored in `[Scene] <name>` handouts with three tables:

### Parameter Table

| Name | Type | Default | Description |
|------|------|---------|-------------|
| cast | token[] | selected | Tokens to run the scene on (built-in, cannot be removed) |
| speed | number | 140 | Propagation speed in px/ms |
| anim | text | pulse | Recording name to play |
| orig | token | | Origin token for distance() |

**Types:** `number`, `text`, `boolean`, `token`, `path`, `sequence`, `scene`, `role`. Any type can be an array with `[]` suffix.

### Variables Table

| Variable | Expression |
|----------|------------|
| dist | distance(orig.left, orig.top) |
| delay | propagate(dist, speed) |

Computed once per token before execution. Later variables can reference earlier ones.

### Scene Table

| Filter | Delay (ms) | Command | Notes |
|--------|-----------|---------|-------|
| `*` | `stagger(rank("left"), 200)` | `!sequence play ${anim} ignore-selected ${tokenId}` | Main wave |
| `layer=gm` | `INF` | | Skip GM tokens |
| `role=hero` | `0` | `!sequence play charge ignore-selected ${tokenId}` | Heroes react immediately |
| `*` | `sync` | | Wait for all participants |

## Filters

| Syntax | Meaning |
|--------|---------|
| `*` | All tokens |
| `layer=X` | On layer X |
| `name=X*` | Name glob match (supports `*` wildcard) |
| `id=-ABC123` | Specific token ID |
| `role=X` | Has role X in the cast |
| `status=X` | Has status marker X |
| `!prefix` | Negation (e.g. `!layer=gm`) |
| *(empty)* | No tokens match (row is a no-op) |

Space-separated conditions within a cell are AND. Multiple rows provide OR.

## Delay Expressions

Evaluated per-token. Must return a number (ms), `INF`/`SKIP` (skip this token), or `sync` (wait for all participants before continuing).

### Token Variables

| Variable | Description |
|----------|-------------|
| `left` | Token center X (px) |
| `top` | Token center Y (px) |
| `name` | Token display name |
| `layer` | Token layer |
| `width` | Token width (px) |
| `height` | Token height (px) |
| `count` | Tokens passing this row's filter |
| `INF` / `SKIP` | Infinity — skip this token |
| `self` | Current scene name |
| `tokenId` | Token ID |
| `tokenName` | Token display name |

All scene parameters and computed variables are also in scope.

### Built-in Functions

| Function | Description |
|----------|-------------|
| `rank("attr")` | Token's sort position within filtered set |
| `distance(x, y)` | Distance from (x,y) to this token. `distance(orig)` is sugar for `distance(orig.left, orig.top)` |
| `propagate(dist, speed)` | `dist / speed` |
| `stagger(rank, interval)` | `rank * interval` |
| `rand(min, max)` | Random number |
| `randInt(min, max)` | Random integer |
| `clamp(v, lo, hi)` | Clamp value |
| `actors(filter?)` | Tokens sorted by distance from current token |
| `actor_ids(filter?)` | Token IDs sorted by distance |
| `abs`, `round`, `floor`, `ceil`, `min`, `max`, `sqrt`, `pow`, `sin`, `cos` | Math |

Constants: `PI`, `TAU`

## Command Templates

Use `${expr}` for substitutions — evaluated as JS template literals:

```
!sequence play ${anim} ignore-selected ${tokenId}
${counter > 1 ? "!choreograph run " + self + " --counter " + (counter - 1) : ""}
```

All token variables, parameters, computed variables, and functions are available.

## Cast System

Casts are named groups of tokens with optional roles, stored in `[Cast] <name>` handouts.

### Cast Commands

| Command | Description |
|---------|-------------|
| `!choreograph cast add <name> [--role <role>]` | Add selected tokens to cast |
| `!choreograph cast remove <name> [--role <role>]` | Remove tokens (without --role: removes entirely) |
| `!choreograph cast list` | List all casts |
| `!choreograph cast show <name>` | Show cast contents |
| `!choreograph cast delete <name> [--force]` | Delete a cast |

### Using Casts

```
!choreograph run my-scene --cast my-encounter
```

Filter by role in scene tables: `role=hero`, `role=minion`, etc.

## Scene Chaining and Recursion

Scenes can call other scenes (or themselves) via the command column:

```
!choreograph run other-scene --id ${actor_ids("role=minion").join(" ")}
!choreograph run ${self} --counter ${counter - 1}
```

- `self` resolves to the current scene name
- `--parent` and `--depth` are auto-injected by the engine
- At depth 0, child scene spawns are silently skipped
- Child scenes cannot loop (`--loop` is top-level only)

## Sync

Use `sync` as a delay value to wait for all registered sync participants to signal completion before continuing. Useful for waiting on animations to finish before the next phase of a scene.

## Looping

- `--loop` — repeat indefinitely, syncing before each restart
- `--loop 5` — repeat 5 times, immediate restart between cycles
- `--loop 5 --sync` — repeat 5 times, sync between cycles

Expressions re-evaluate fresh each cycle.

## SelectManager Integration

Every command fired by Choreograph automatically has `{& select <ids>}` appended, telling SelectManager to set the matching tokens as selected. Receiving scripts see them in `msg.selected` without extra work.

## Extension API

Choreograph emits `!choreograph-ready` on startup. Extensions can register:

```javascript
Choreograph.registerFunction(sourceId, struct)
Choreograph.registerTokenVariable(sourceId, struct)
Choreograph.registerConstant(sourceId, struct)
Choreograph.registerParameterType(sourceId, struct)
Choreograph.registerLifecycleHook(sourceId, struct)
Choreograph.registerSyncParticipant(sourceId, struct)
Choreograph.generateExtensionHandout(sourceId, opts)
```

All registrations are source-deduplicated — calling the same registration from the same `sourceId` twice is a silent no-op.

### Lifecycle Hooks

Register with `commands: [/regex/]` to filter which commands trigger your hooks:

```javascript
Choreograph.registerLifecycleHook('MyScript', {
    commands: [/^!myscript\b/],
    start:  (ctx) => { /* direct invocation instead of sendChat */ },
    stop:   (ctx) => { /* cleanup */ },
    pause:  (ctx) => { /* pause work */ },
    resume: (ctx) => { /* resume work */ },
});
```

The `start` hook receives a msg-shaped context (bypassing chat):

```javascript
// ctx shape for start/stop/pause/resume:
{
    type: 'api',
    content: '!myscript ...',       // the command string
    who: 'PlayerName (GM)',         // raw msg.who
    playerid: '-ABC123',            // original player ID
    selected: [{ _id, _type }],    // tokens for this command
    sceneInfo: {                    // Choreograph metadata
        instanceId: 'Choreograph-1-...',
        sceneName: 'my-scene',
        instanceName: 'swift-wolf-1',
    },
}
```

### Sync Participants

```javascript
Choreograph.registerSyncParticipant('MyScript', {
    commands: [/^!myscript\b/],
    waiting: (ctx) => {
        // ctx.entries — array of msg-shaped contexts (filtered to your commands)
        // ctx.sceneInfo — scene metadata
        // ctx.done() — call when finished (idempotent)
    },
});
```

Each participant only receives entries matching their registered command patterns. If none match, the participant is not called.

## License

MIT
