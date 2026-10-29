# Writing Tasks

A task definition is a JSON object. TaskAutomation checks it when you publish or import it, and again while it runs. [../schema/task-definition.schema.json](../schema/task-definition.schema.json) is the JSON Schema; the validator in the Mod also checks unique step IDs, references, loop safety, call cycles and limits.

## Top level

| Field           | Required | Meaning                                                                                                                                                                                           |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schemaVersion` | yes      | Always `1`.                                                                                                                                                                                       |
| `id`            | yes      | Letters, digits, `-` and `_`, up to 48. Never shown as a name.                                                                                                                                    |
| `name`          | yes      | Up to 100 characters.                                                                                                                                                                             |
| `revision`      |          | Set by the Mod when you publish.                                                                                                                                                                  |
| `enabled`       |          | `false` imports the task disabled.                                                                                                                                                                |
| `description`   |          | Up to 2,000 characters.                                                                                                                                                                           |
| `parameters`    |          | Values given at start: `{"name": {"type": "number", "default": 3, "min": 1, "max": 10}}`. Types: `number`, `string` (`maxLength`, `enum`), `boolean`, `id`. `required: true` makes one mandatory. |
| `bindings`      |          | Targets (below).                                                                                                                                                                                  |
| `access`        |          | Who may start it and with whose rights (below).                                                                                                                                                   |
| `triggers`      |          | What starts it (below). Without triggers it can only be started by a call.                                                                                                                        |
| `policy`        |          | Concurrency, errors, missed work and restarts (below).                                                                                                                                            |
| `steps`         | yes      | The program.                                                                                                                                                                                      |

Unknown fields are refused everywhere, so typos are caught.

## Targets (`bindings`)

```json
"bindings": {
  "door":   { "from": "selected", "objectType": "graphic", "max": 1 },
  "guards": { "from": "query", "objectType": "graphic", "query": { "name": "Guard", "pageId": "-page", "max": 10, "evaluate": "step" } },
  "hero":   { "from": "event", "objectType": "graphic" },
  "boss":   { "from": "ids", "objectType": "character", "ids": ["-Abc123"] }
}
```

| `from`     | Targets are                                                                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selected` | What the person starting it has selected. Not available to schedules or events unless you add `"alternate": {"from": "ids", "ids": [...]}`.                                                   |
| `ids`      | Fixed IDs. `--bind name=-id1,-id2` on `instance start` or `schedule add` overrides them (GM only).                                                                                            |
| `event`    | The object of the triggering event (the token that moved, the token whose turn it is).                                                                                                        |
| `param`    | The ID held by a parameter: `"param": "who"`.                                                                                                                                                 |
| `query`    | Tokens matching `name`, `pageId`, `represents`, `layer` and `marker`, at most `max` (≤ 20). `evaluate: "start"` (default) keeps the IDs found at start; `"step"` searches again at each step. |
| `none`     | No targets.                                                                                                                                                                                   |

`objectType` is `graphic` (tokens only), `character`, `player`, `jukeboxtrack` or `page`. A selected token can fill a `character` binding with the character it represents. `max` defaults to 20; `min` defaults to 1 (0 for `none`, `query` with `evaluate: "step"`).

Names are only a convenience: everything is stored and acted on by ID.

## Access

```json
"access": { "mode": "gmOnly", "authority": "initiator" }
```

| Field            | Meaning                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`           | `gmOnly` (default) or `players`.                                                                                                                                                                                                                  |
| `players`        | With `players`: the player IDs who may start it, or `["all"]`.                                                                                                                                                                                    |
| `controllers`    | With `players`: also let anyone who controls all the chosen targets start it.                                                                                                                                                                     |
| `authority`      | `initiator`: the run acts with the rights of whoever started it, checked before every action. `gmService`: the run acts for the GM. Tasks with time, event or chat triggers must use `gmService`; tasks shared with players must use `initiator`. |
| `capabilities`   | With `players`: `actions` (step types allowed, from the player-safe list), `maxTargets`, `signals` (let players send the signals its runs wait for).                                                                                              |
| `selfTrigger`    | Let changes made by TaskAutomation itself trigger this task (off by default; ancestry and burst limits still apply).                                                                                                                              |
| `detachChildren` | Let runs start runs that carry on by themselves (GM runs only).                                                                                                                                                                                   |

Player-safe step types: flow steps, `variable.set`, `event.emit`, `chat.send`, `token.set` (not `layer` or `name`), `token.get`, `token.advanceSide`, `token.setSide`, `attribute.get`, `marker.set`, `ping` (without `moveView`), `effect.spawn` (built-in effects), `task.cancel`, `task.pause`.

## Policy

| Field           | Default           | Meaning                                                                                                                                                                                                         |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `concurrency`   | `skipIfRunning`   | `allow` (up to `maxConcurrent`), `skipIfRunning`, `queue` (up to `maxQueue`, each entry may expire after `queueExpiryMs`), `replace` (cancel the running one). Queued starts keep their targets and parameters. |
| `maxConcurrent` | 1 (5 for `allow`) | Runs at once.                                                                                                                                                                                                   |
| `onError`       | `fail`            | When a step fails: `fail`, `skip`, `retry` or `review`. Steps can override it.                                                                                                                                  |
| `retry`         |                   | `{"maxAttempts": 3, "baseDelayMs": 1000, "maxDelayMs": 30000, "jitterMs": 0}`. Only temporary problems are retried; a step that may have happened is never retried automatically.                               |
| `overdue`       | see below         | Missed work: `{"mode": "skip", "graceMs": 250, "windowMs": 300000, "maxAgeMs": …, "catchUp": {"max": 10, "maxAgeMs": 86400000, "spacingMs": 1000}}`.                                                            |
| `restart`       | `reconcile`       | After an API restart: `reconcile` (carry on, checking interrupted actions), `review` (ask), `fail`.                                                                                                             |
| `timeoutMs`     |                   | Fail runs that take longer.                                                                                                                                                                                     |
| `lifetimeMs`    |                   | Expire runs that are older.                                                                                                                                                                                     |
| `allowForever`  | false             | Allow `loop` with `mode: "forever"`.                                                                                                                                                                            |
| `recursion`     |                   | `{"allow": true, "maxDepth": 3}` lets a task call itself, up to the depth.                                                                                                                                      |
| `circuit`       | 60 a minute       | `{"admissionsPerMinute": n}`: a task started more often is disabled and reported.                                                                                                                               |

## Triggers

Every trigger has an `id` and a `type`; `"enabled": false` turns one off.

```json
{ "id": "manual", "type": "manual" }
{ "id": "once", "type": "at", "at": "2026-11-01T19:00:00Z" }
{ "id": "tick", "type": "interval", "every": "10m", "anchor": "2026-11-01T19:00:00Z", "mode": "fixedRate" }
{ "id": "daily", "type": "daily", "time": "18:30", "offset": "+00:00" }
{ "id": "fri", "type": "weekly", "days": ["fri"], "time": "19:00", "offset": "+01:00", "end": "2027-06-01T00:00:00Z", "maxCount": 30 }
{ "id": "hp", "type": "event", "event": "token.change", "filter": { "properties": ["bar1_value"], "crossing": { "property": "bar1_value", "direction": "below", "threshold": 0 } }, "bind": { "binding": "token" } }
{ "id": "bell", "type": "signal", "name": "bell", "players": true }
{ "id": "words", "type": "chat", "match": { "contains": "open sesame" }, "channels": ["general"] }
```

- **Intervals**: `fixedRate` times are counted from the anchor and do not drift; `fixedDelay` waits `every` after each run ends (one run at a time). The shortest interval is one second.
- **Daily and weekly** use a fixed UTC offset. The Mod has no timezone database: when your clocks change, update the offset (`schedule offset` previews the effect).
- Time triggers accept `start`, `end`, `maxCount` and `overdue`.
- Time triggers on a task become schedules when you publish or enable it. `schedule add` creates more, with their own targets and parameters.
- **Event triggers** accept `cooldownMs`, `debounceMs` (with `leading: true` the first event fires and the rest are ignored until it is quiet), `burst: {"count": 20, "windowMs": 10000}`, `coalesce: "objectId"` (separate cooldown and debounce per object), `selfTrigger` and `reconcile` (below).
- **Chat triggers** see ordinary messages only, never API commands. Whispers and rolls are ignored unless the trigger has `"private": true` and the GM turned on `privateChatTriggers`. Only the text of matching messages is kept.

### Event types

| Event                                                             | Object, name, value                                                    | `old` / `new`                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| `token.add`, `token.change`, `token.destroy`                      | token; token name; —                                                   | token properties; `changed` lists what changed |
| `attribute.add`, `attribute.change`, `attribute.destroy`          | attribute; attribute name; `characterId` set                           | `{current, max}`                               |
| `turn.change`                                                     | the token whose turn it is (none for custom entries); name; initiative | `{tokenId, custom, pr}`                        |
| `turn.round`                                                      | —; the custom entry text; its value                                    | as above                                       |
| `turnorder.edit`                                                  | —; —; number of entries                                                | `{count}`                                      |
| `tracker.open`, `tracker.close`                                   | `pageId` when opened                                                   | —                                              |
| `page.change`                                                     | the new player page                                                    | `{pageid}`                                     |
| `player.online`, `player.offline`                                 | player; display name                                                   | —                                              |
| `signal`                                                          | —; signal name; its value; `actor` is the sender                       | —                                              |
| `task.started`, `task.completed`, `task.failed`, `task.cancelled` | run; definition ID; status                                             | —                                              |
| `integration`                                                     | —; event name; value; `adapter` set                                    | —                                              |

Changes made by TaskAutomation itself are announced internally (Roll20 does not raise events for API changes). They only trigger tasks that set `access.selfTrigger` and the trigger's `selfTrigger`.

A turn is a change of the **current** (first) entry. Sorting or editing initiative without changing it is `turnorder.edit`. Rounds need an anchor: a custom entry whose text starts with `Round` (setting `roundAnchor`).

### Filters

```json
"filter": {
  "objectIds": ["-a"], "pageIds": ["-p"], "characterIds": ["-c"], "names": ["Orc"],
  "attribute": "hp",
  "properties": ["bar1_value"],
  "changedTo": { "layer": "gmlayer" }, "changedFrom": { "layer": "objects" },
  "crossing": { "property": "bar1_value", "direction": "below", "threshold": 0 },
  "signal": "door-open", "definitionId": "other-task", "adapter": "reference",
  "binding": "door",
  "condition": { "op": "gt", "left": { "ref": "event.new.bar1_value", "as": "number" }, "right": 10 }
}
```

`crossing` below means the old value was above the threshold and the new one is at or below it; staying below does not fire again. Text that is not a number never counts. `binding` (in `awaitEvent`) matches only the run's own targets. `condition` is an expression with `event`, `param`, `var`, `run` and `now`.

### Reconciling offline changes

With `"reconcile": true` and a `filter.objectIds` list, the Mod remembers the watched properties of those objects. After a restart it compares them and, if something changed, raises one event with `source: "reconciled"`. It cannot know intermediate values, so a bar that went 5 → 0 → 5 while the sandbox was off is not seen.

## Steps

Every step has a unique `id` and a `type`. Any step can have `onError` (`fail`, `skip`, `retry`, `review`), `retry`, `timeoutMs` (adapters) and `saveAs` (store the result in a variable).

### Flow

| Type           | Fields                                                                                         | Notes                                                                                                                                                                                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wait`         | `durationMs` (expression, ≥ 100 ms) or `until` (epoch ms or ISO time); `overdue`               | `overdue`: when the wait ends much later than due (after downtime): `continue` (default), `review`, `expire`, `skipNext`.                                                                                                                                                                             |
| `awaitEvent`   | `event`, `filter`, `timeoutMs` (required, ≤ 7 days)                                            | Stores `{matched, timedOut, event}` in `var.<saveAs or id>`. Matches while paused are not kept.                                                                                                                                                                                                       |
| `if`           | `condition`, `then`, `else`                                                                    | The choice is stored, so a restart resumes the same branch. A missing value is false.                                                                                                                                                                                                                 |
| `loop`         | `mode`: `count` (`count`), `while`/`until` (`condition`), `forever`; `maxIterations`; `steps`  | `while` checks before each pass, `until` after. Counted loops stop at 100. `forever` needs `policy.allowForever` and a wait on every pass. `run.iteration` is the pass number.                                                                                                                        |
| `call`         | `definition`, `revision`, `await` (default true), `params`, `bindings`, `onChildFail`          | Runs another task. Awaited calls store `{runId, status, vars}`. Unawaited calls carry on by themselves (GM runs only).                                                                                                                                                                                |
| `parallel`     | `join`: `all`, `anySuccess`, `race`; `branches: [{id, steps}]` (2–10); `cancelLosers`; `merge` | Branches take turns; they are not simultaneous. Each starts with a copy of the variables. Results go to `var.<saveAs or id>.<branch>`; `merge: [{"name": "total", "reducer": "sum"}]` combines a variable from every successful branch (`sum`, `min`, `max`, `first`, `last`, `count`, `all`, `any`). |
| `stop`         | `outcome` (`completed`, `failed`, `cancelled`), `message`                                      | Ends the run.                                                                                                                                                                                                                                                                                         |
| `variable.set` | `name`, `value`                                                                                | Variables belong to the branch.                                                                                                                                                                                                                                                                       |
| `event.emit`   | `signal`, `value`                                                                              | Raises a `signal` event for other tasks.                                                                                                                                                                                                                                                              |

### Actions

| Type                        | Fields                                                                                     | Replay after a restart                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `chat.send`                 | `text` (template), `mode`: `say`, `emote`, `desc` (GM), `whisper`; `to` (recipients); `as` | Never repeated automatically.                                             |
| `chat.command`              | `text` (template; may start with `/`), `as`. GM only.                                      | Never repeated automatically.                                             |
| `token.set`                 | `target`, `set: {prop: expr}`, `expect: {prop: expr}`                                      | Re-applied (same values) unless `expect` is used.                         |
| `token.get`                 | `target`, `property`                                                                       | Read.                                                                     |
| `token.advanceSide`         | `target`, `delta` (default 1), `wrap` (default true)                                       | Confirmed if the token shows the intended side; otherwise review.         |
| `token.setSide`             | `target`, `side` (1-based)                                                                 | As above.                                                                 |
| `marker.set`                | `target`, `marker`, `op`: `add`, `remove`, `toggle`, `set`, `adjust`; `count`              | `add`/`remove`/`set` re-applied; `toggle`/`adjust` reviewed.              |
| `attribute.set`             | `target`, `attribute`, `field` (`current`/`max`), `value`, `expect`, `create`, `useWorker` | Re-applied unless `expect` is used.                                       |
| `attribute.adjust`          | `target`, `attribute`, `field`, `by`, `min`, `max`, `useWorker`                            | Confirmed if the new value is there; otherwise review. Never added twice. |
| `attribute.get`             | `target`, `attribute`, `field`                                                             | Read.                                                                     |
| `ping`                      | `target` or `at: {left, top, page}`, `to` (recipients), `moveView` (GM)                    | Skipped.                                                                  |
| `effect.spawn`              | `target` or `at`, `fx` (`burst-fire`, `beam-acid`… or a custom effect name, GM), `to`      | Skipped.                                                                  |
| `audio.control`             | `track` (title or ID, template), `op`: `play`, `stop`, `volume`; `volume`, `loop`. GM.     | Re-applied.                                                               |
| `task.start`                | `definition`, `params`, `bindings`                                                         | —                                                                         |
| `task.cancel`, `task.pause` | `scope`: `children` (default) or `run` with `run` (run ID expression)                      | —                                                                         |
| `integration.command`       | `command` (template starting with `!`), `args: {name: expr}`. GM only.                     | Never repeated automatically; shown as sent.                              |
| `integration.call`          | `adapter`, `action`, `input: {name: expr}`, `timeoutMs`                                    | The adapter's status lookup decides; otherwise review.                    |

Targets are `{"binding": "door"}`, `{"ids": ["-a", "-b"]}` or `{"ref": "var.picked"}`. Steps act on at most 20 targets at a time and carry on with the rest after a short pause. Before every change the run checks the target still exists and that it may still act on it.

Recipients: `{"gm": true}`, `{"players": ["-p1"]}`, `{"initiator": true}`, `{"controllers": "binding"}` (players who control the binding's objects), `{"binding": "players"}` (a `player` binding).

`token.set` can set `left`, `top`, `rotation`, `bar1_value`…`bar3_max`, `tint_color`, `fliph`, `flipv`, `showname`, and with GM authority `layer` and `name`.

## Expressions

Expressions are JSON, never code.

| Form                                                            | Meaning                                                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `3`, `"text"`, `true`, `null`                                   | A literal.                                                                                     |
| `{"value": [1, 2]}`                                             | A literal of any JSON value.                                                                   |
| `{"ref": "event.new.bar1_value", "as": "number", "default": 0}` | A reference, optionally converted (`number`, `string`, `boolean`) with a default when missing. |
| `{"op": "lte", "left": …, "right": …}`                          | An operator.                                                                                   |

Operators: comparison `eq`, `ne`, `lt`, `lte`, `gt`, `gte`; arithmetic `add`, `sub`, `mul`, `div`, `mod`, `neg`, `abs`, `round`, `floor`, `ceil`, `min`, `max`; logic `all`, `any`, `not`, `if` (`cond`, `then`, `else`), `coalesce`, `exists`; conversion `number`, `string`, `boolean`; text `concat`, `lower`, `upper`, `trim`, `length`, `contains`, `startsWith`, `endsWith`, `in`; game `hasMarker` (statusmarkers, tag), `crossBelow` / `crossAbove` (old, new, threshold), `randomInt` (min, max). Binary operators use `left`/`right`, unary `arg`, the rest `args`.

**Missing values stay missing.** A reference that does not exist, or text that is not a number when you ask for a number, is _missing_: comparisons with it are false and arithmetic with it is missing. Bars and attributes are text in Roll20, so use `"as": "number"`. Comparing `"3"` with `3` without conversion is false.

### References

| Root       | Examples                                                                            | Meaning                                                    |
| ---------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `param`    | `param.track`                                                                       | Parameters.                                                |
| `var`      | `var.lever.matched`, `var.scene.door.status`                                        | The branch's variables.                                    |
| `event`    | `event.objectId`, `event.old.bar1_value`, `event.value`                             | The event that started the run (a snapshot taken then).    |
| `target`   | `target.door.name`, `target.door.bar1_value`, `target.door.count`, `target.door.id` | The first target of a binding, read **now**, or the count. |
| `bindings` | `bindings.guards`, `bindings.guards.count`                                          | All IDs of a binding.                                      |
| `run`      | `run.id`, `run.iteration`, `run.intendedDueAt`, `run.missedCount`, `run.initiator`  | The run.                                                   |
| `now`      | `now`                                                                               | Current time (epoch ms).                                   |

Readable token properties: `name`, `left`, `top`, `width`, `height`, `rotation`, `layer`, `pageid`, `represents`, `bar1_value`…`bar3_max`, `statusmarkers`, `tint_color`, `currentSide`, `controlledby`, `fliph`, `flipv`, `showname`. Characters: `name`, `controlledby`; attributes: `name`, `current`, `max`; players: `displayname`, `online`.

### Templates

Text fields (`text`, `message`, `command`, `track`) take `{{ref}}` placeholders with the same references. Values are flattened to one line, cannot start a command (`/`, `!`) and are HTML-escaped in chat. In `integration.command`, `{{args.name}}` inserts an argument, which may only contain letters, digits and `_-.:#@+`.

## Limits

| Limit                                               | Value                                   |
| --------------------------------------------------- | --------------------------------------- |
| Tasks                                               | 100                                     |
| Active runs                                         | 100                                     |
| Branches per run                                    | 10                                      |
| Nesting depth                                       | 8                                       |
| Passes of a counted/conditional loop                | 100                                     |
| Steps without waiting                               | 500                                     |
| Queue per task                                      | 100                                     |
| Catch-up runs per incident                          | 10                                      |
| Shortest interval / wait                            | 1 s / 100 ms                            |
| Targets per chunk                                   | 20                                      |
| Command or JSON payload                             | 32 KiB (imports in parts up to 256 KiB) |
| Stored state                                        | about 1 MiB                             |
| Finished runs / audit entries / open incidents kept | 200 / 1,000 / 100                       |

These are product limits, not Roll20 guarantees.
