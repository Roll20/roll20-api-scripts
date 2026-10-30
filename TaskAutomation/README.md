# TaskAutomation

A Roll20 Mod that runs automation you describe as data instead of JavaScript: cycle a multi-sided token, remind a player their torch is guttering, react when a token's hit points reach zero, ping the token whose turn it is, fade the music while a door opens, or remind the table every Friday that the session is about to start.

Tasks survive API restarts. Work missed while the sandbox was off is reported and handled the way you choose. Everything runs on one timer, so an idle game costs nothing.

Version 1.0.0 works in Jumpgate and Legacy games and needs no other Mods.

## Installation

1. Upload `TaskAutomation.js` to the game's API Scripts (or install it from the One-Click library when it is listed).
2. Save. On startup the Mod creates two GM-only handouts in the Journal:
   - **TaskAutomation - Dashboard**: what is running, waiting, paused, missed or needs a decision, with buttons.
   - **TaskAutomation - Help**: commands, step types, triggers and the missed-work policies.

## Quick Start

1. Type `!taskautomation` for the menu, or open the dashboard handout.
2. Click **Templates** and add **Adventure montage** (`montage`).
3. Select a multi-sided token (a rollable table token) and click **Start**. It changes side ten times, eight seconds apart.
4. Pause, resume or cancel it from the dashboard.

The templates are the seven worked examples below plus the montage. Add one, look at it with **Show**, and change it to suit your game.

## Concepts

| Term            | Meaning                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task**        | A definition: steps, targets, parameters, triggers, access and policy. Editing changes a draft; **Publish** makes a numbered revision.                    |
| **Run**         | One start of a task, with its own targets, variables and progress. A run keeps the revision it started with; publish again and only new runs change.      |
| **Target**      | Tokens, characters, players or jukebox tracks a task acts on, captured as IDs when it starts (your selection, explicit IDs, the event's object, a query). |
| **Trigger**     | What starts a task: a button or command, a time, an interval, a daily or weekly time, a game event, a signal or chat.                                     |
| **Missed work** | Times that passed while the sandbox was off or a schedule was paused, and runs that could not start. Recorded as incidents on the dashboard.              |
| **Review**      | A run that stopped to ask you something, such as "this message may already have been sent: send it again?". Nothing happens until you decide.             |

## Commands

All commands start with `!taskautomation`. Every reply is whispered; buttons in replies and on the dashboard run these commands for you.

| Command                                                                                                                                                                             | What it does                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `!taskautomation`                                                                                                                                                                   | Menu.                                                                                                                                        |
| `help`                                                                                                                                                                              | Command list.                                                                                                                                |
| `dashboard open` / `refresh` / `view <section> [page]` / `repair`                                                                                                                   | Show, refresh or page the dashboard; `repair` makes it GM-only again.                                                                        |
| `template list` / `template add <id>`                                                                                                                                               | The worked examples.                                                                                                                         |
| `definition list` / `show --id <id>`                                                                                                                                                | Tasks.                                                                                                                                       |
| `definition create --name "<name>" [--id <id>]`                                                                                                                                     | A new empty task (draft).                                                                                                                    |
| `definition validate --id <id>` / `publish --id <id> [--rev n]`                                                                                                                     | Check the draft; publish it as a new revision.                                                                                               |
| `definition enable` / `disable --id <id>`                                                                                                                                           | Allow or stop new runs. Runs already going carry on.                                                                                         |
| `definition clone --id <id> --name "<name>"`                                                                                                                                        | Copy a task.                                                                                                                                 |
| `definition archive` / `purge --id <id> --preview`                                                                                                                                  | Hide a task, or delete it for good (with a confirmation).                                                                                    |
| `definition set --id <id> --field name\|description --value "…"`                                                                                                                    | Edit the draft.                                                                                                                              |
| `definition param` / `binding --id <id> --name <n> --json {…}`                                                                                                                      | Add or replace a parameter or target (`--remove` to delete).                                                                                 |
| `definition access` / `policy --id <id> --json {…}`                                                                                                                                 | Replace the access or policy object.                                                                                                         |
| `definition trigger add --id <id> --json {…}` / `remove --trigger <t>`                                                                                                              | Edit triggers.                                                                                                                               |
| `definition step add --id <id> [--after <s> \| --block <b> --index n] --json {…}`                                                                                                   | Add a step. Blocks: `root`, `<step>/steps`, `<step>/then`, `<step>/else`, `<step>/branch/<b>`.                                               |
| `definition step edit --id <id> --step <s> --json {…}`                                                                                                                              | Patch a step (`null` removes a field).                                                                                                       |
| `definition step remove` / `move --id <id> --step <s> [--block b] [--index n]`                                                                                                      | Remove or move a step.                                                                                                                       |
| `definition export --id <id> [--draft] [--handout]`                                                                                                                                 | Copy a task as JSON (chat pages, or a GM-only handout).                                                                                      |
| `definition import --json {…} [--replace]`                                                                                                                                          | Import a task. Large tasks: `import begin --parts n`, `import part --n i --json …`, `import commit`.                                         |
| `instance start --definition <id> [--bind name=selected\|id,id] [--param k=v]`                                                                                                      | Start a run. Selected tokens become the targets.                                                                                             |
| `instance dry-run --definition <id>`                                                                                                                                                | Check targets, permissions, branches and adapters without doing anything.                                                                    |
| `instance list` / `inspect --id <run>`                                                                                                                                              | Runs.                                                                                                                                        |
| `instance pause` / `resume` / `cancel --id <run> [--rev n]`                                                                                                                         | Control a run (and the runs it owns).                                                                                                        |
| `instance rerun --id <run>`                                                                                                                                                         | Start a fresh run with the same targets and parameters.                                                                                      |
| `instance decide --id <run> --action retry\|skip\|complete\|skipNext\|cancel`                                                                                                       | Decide what a run in review does.                                                                                                            |
| `schedule add --definition <id> --at <time> \| --every 10m [--anchor <time>] [--mode fixedDelay] \| --daily HH:MM --offset +01:00 \| --weekly mon,fri --time HH:MM --offset +00:00` | Schedule a task. Shows the times in UTC; add `--yes` to create it. Options: `--start`, `--end`, `--count`, `--overdue`, `--bind`, `--param`. |
| `schedule list` / `preview` / `pause` / `remove --id <schedule>`                                                                                                                    | Schedules.                                                                                                                                   |
| `schedule resume --id <schedule> [--mode skipPausedRange\|catchUp]`                                                                                                                 | Resume; by default the paused times are skipped.                                                                                             |
| `schedule offset --id <schedule> --offset +01:00`                                                                                                                                   | Change the UTC offset (summer time); previews the next times first.                                                                          |
| `signal <name> [--value v]`                                                                                                                                                         | Send a signal to tasks that wait for it.                                                                                                     |
| `report missed` / `runs` / `audit` / `diagnostics`                                                                                                                                  | Missed work, finished runs, the audit trail, scheduler figures.                                                                              |
| `recovery preview --incident <id> --mode runOnce\|skip` / `apply --token …` / `acknowledge --incident <id>`                                                                         | Deal with missed work.                                                                                                                       |
| `config show` / `config set <key> <value>`                                                                                                                                          | Settings (below).                                                                                                                            |
| `adapter list`                                                                                                                                                                      | Mod adapters.                                                                                                                                |
| `stop-all --preview` / `resume-all`                                                                                                                                                 | Emergency stop: cancel all runs and hold new starts, then allow them again.                                                                  |

Times are ISO 8601 with an offset: `2026-11-01T19:00:00Z` or `2026-11-01T20:00:00+01:00`. Durations are `500ms`, `10s`, `5m`, `2h` or `1d`.

## Writing Tasks

A task is JSON. Here is the montage:

```json
{
  "schemaVersion": 1,
  "id": "montage",
  "name": "Adventure montage",
  "bindings": { "tokens": { "from": "selected", "objectType": "graphic", "max": 5 } },
  "access": { "mode": "gmOnly", "authority": "initiator" },
  "triggers": [{ "id": "manual", "type": "manual" }],
  "policy": { "concurrency": "skipIfRunning", "overdue": { "mode": "skip" } },
  "steps": [
    {
      "id": "frames",
      "type": "loop",
      "mode": "count",
      "count": 10,
      "steps": [
        {
          "id": "advance",
          "type": "token.advanceSide",
          "target": { "binding": "tokens" },
          "delta": 1,
          "wrap": true
        },
        { "id": "hold", "type": "wait", "durationMs": 8000 }
      ]
    }
  ]
}
```

[docs/AUTHORING.md](docs/AUTHORING.md) describes every field, step type, trigger, expression and policy. [schema/task-definition.schema.json](schema/task-definition.schema.json) is the JSON Schema; editors that understand JSON Schema can check tasks as you type.

### Step types

| Flow                                                                                         | Actions                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wait`, `awaitEvent`, `if`, `loop`, `call`, `parallel`, `stop`, `variable.set`, `event.emit` | `chat.send`, `chat.command` (GM), `token.set`, `token.get`, `token.advanceSide`, `token.setSide`, `marker.set`, `attribute.set`, `attribute.adjust`, `attribute.get`, `ping`, `effect.spawn`, `audio.control`, `task.start`, `task.cancel`, `task.pause`, `integration.command` (GM), `integration.call` |

### Triggers

`manual`, `at`, `interval` (fixed rate or fixed delay), `daily`, `weekly`, `event` (`token.add/change/destroy`, `attribute.add/change/destroy`, `turn.change`, `turn.round`, `turnorder.edit`, `tracker.open/close`, `page.change`, `player.online/offline`, `task.started/completed/failed/cancelled`, `signal`, `integration`), `signal` and `chat`. Event triggers have cooldown, debounce (trailing or leading), burst caps and per-object coalescing.

## Worked Examples

| Template            | What it shows                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `torch-reminder`    | Real-world minutes: warn after 50, put the torch out after 10 more. A restart after both passed asks you once instead of sending both.       |
| `hp-zero`           | Bar 1 crossing from above 0 to 0 or less marks the token dead and tells the GM. Staying at 0 does not fire again.                            |
| `turn-response`     | The current turn changes to a token: wait up to 15 s for a `turn-ready` signal, then ping it. Re-sorting initiative is not a new turn.       |
| `parallel-scene`    | Fade a jukebox track and open a door at the same time, join, then chain `scene-cleanup`.                                                     |
| `session-reminder`  | Every Friday at 19:00 at a fixed UTC offset; a reminder missed by a little runs once, one missed by hours is only reported.                  |
| `token-mod-command` | Send an approved TokenMod command with the token's ID. Shown as sent, not as done. Needs TokenMod's `players-can-ids` option to take effect. |
| `door-sequence`     | Wait up to a minute for a `door-open` signal, then open the door or report that it stayed shut.                                              |

Templates that start by themselves (`hp-zero`, `turn-response`, `session-reminder`) are added disabled; enable them when you are ready. [docs/EXAMPLES.md](docs/EXAMPLES.md) walks through each one with the expected chat and dashboard results. The JSON is in [examples/](examples/).

## Missed Work and Restarts

Roll20 stops the API sandbox from time to time, and nothing runs while it is off. On restart TaskAutomation:

- carries on every run from its saved step, with waits ending at their original time;
- applies each schedule's **overdue** policy once: `skip`, `runOnce`, `catchUpBounded`, `review` or `expire`. By default a one-off time missed by more than five minutes asks you, and a recurring schedule runs once for the latest time and reports the rest;
- never repeats an action that may already have happened (a chat message, an attribute adjustment, a side change it cannot confirm): the run goes to **review** and you decide;
- records that events while it was off could not be seen. It never invents them.

It then whispers one summary. [docs/OPERATIONS.md](docs/OPERATIONS.md) explains every decision on the dashboard.

## Players

Tasks are GM-only. A GM can share a task with listed players (`"access": {"mode": "players", "players": ["-playerId"], "capabilities": {"actions": ["marker.set"]}}`). Players can then start it on tokens they control, and inspect, pause or cancel their own runs. They cannot edit tasks, send commands to other Mods or act as the GM. If they lose control of a target, the run stops for review. Turn on **Player View Handout** to give them a handout of the tasks shared with them.

## Settings

| Setting               | Values                | Default | Meaning                                                              |
| --------------------- | --------------------- | ------- | -------------------------------------------------------------------- |
| `dashboardRows`       | 10, 25, 50            | 25      | Rows per dashboard page.                                             |
| `playerView`          | on, off               | off     | Create the TaskAutomation - Player View handout.                     |
| `diagnostics`         | on, off               | off     | Scheduler and recovery details in the API console.                   |
| `graceMs`             | duration              | 250ms   | Lateness that counts as on time.                                     |
| `lateWindowMs`        | duration              | 5m      | Beyond this, the overdue policy decides.                             |
| `checkpointMs`        | duration ≥ 1m, or off | off     | Note "still running" regularly, to estimate outages more closely.    |
| `privateChatTriggers` | on, off               | off     | Let chat triggers marked `private` see whispers.                     |
| `roundAnchor`         | text                  | Round   | A custom turn order entry starting with this text marks a new round. |

## Limitations

- Times are real-world time. Schedules use a fixed UTC offset; update it with `schedule offset` when the clocks change (for example British Summer Time).
- Nothing runs while the sandbox is off, and timings are not exact to the millisecond. The dashboard shows how late things ran.
- Changes to several objects are not all-or-nothing, and cancelling a run does not undo what it already did.
- A command sent to another Mod is "sent", not "done": the other Mod may ignore commands from the API.
- The dashboard is a snapshot; it never ticks by itself. Click **Refresh**.
- Images for `token.advanceSide` and `token.setSide` must be in your Roll20 library; Marketplace images cannot be set by the API.
- `attribute.set` and `attribute.adjust` with `useWorker` start sheet workers but do not wait for them.

## Other Mods

Other Mods can register adapters, raise signals and start GM-service tasks through `TaskAutomation.registerAdapter`, `signal`, `emit` and `start`. See [docs/ADAPTERS.md](docs/ADAPTERS.md).

## Credits

Created by MidNiteShadow7. Issues and suggestions: [GitHub](https://github.com/steverobertsuk).
