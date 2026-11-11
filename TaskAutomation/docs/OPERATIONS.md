# Running TaskAutomation: Recovery and Operations

## The dashboard

**TaskAutomation - Dashboard** is GM-only and rebuilt by the Mod; anything typed into it is overwritten. It is written at most every two seconds, half a second after a change, and only when its content changes. It is a snapshot: remaining times are as of when it was generated. Click **Refresh** (or reopen the handout) to update it.

Sections: **Overview** (counts, runs needing a decision, open incidents, next times, warnings), **Tasks**, **Runs**, **Queue**, **Missed work**, **History** and **Integrations** (adapters and scheduler figures). Navigation changes the view for every GM, because a handout has one shared view; use `instance inspect` in chat for a private look.

Every button carries the revision of what it acts on. If the run changed after the dashboard was drawn, the button is refused with _has changed since that button was made_: refresh and try again.

If the dashboard is shared with players, the Mod stops updating it and tells you. `!taskautomation dashboard repair` makes it GM-only again. If you delete it, it is recreated (at most once a minute).

## Statuses

| Status                                   | Meaning                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| running / waiting                        | Working, or waiting for a time, event, child run, branches or an adapter.                 |
| paused                                   | Paused by you. Relative waits keep their remaining time; waits for a time keep that time. |
| needs a decision                         | In review (below).                                                                        |
| completed / failed / cancelled / expired | Finished. The 20 most recent stay inspectable; history keeps 200 summaries.               |

## Decisions (review)

A run stops for review instead of guessing:

| Reason                                    | What happened                                                                                   | Choices                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| a wait ended long after it was due        | The sandbox was off past a wait marked `overdue: review`.                                       | Mark done and continue · Skip the next step · Cancel                  |
| an action may or may not have happened    | The sandbox stopped during a message, adjustment or adapter call, or an adapter did not answer. | Mark done · Retry (asks again: it could happen twice) · Skip · Cancel |
| objects changed while the sandbox was off | An interrupted side or attribute change does not match what the task intended.                  | Mark done · Retry · Skip · Cancel                                     |
| the player no longer controls a target    | A player's run reached a step for a token they no longer control.                               | Retry · Skip · Cancel                                                 |
| the task is no longer shared              | The GM withdrew the task from players.                                                          | Retry · Skip · Cancel                                                 |
| an adapter is not installed               | The task calls an adapter that is not registered. When it registers you are told.               | Retry · Skip · Cancel                                                 |
| a step failed                             | A step with `onError: review` failed.                                                           | Retry · Skip · Cancel                                                 |

**Mark done** records the action as done and carries on. **Skip** carries on without it. **Retry** runs the step again.

## Missed work

| Cause                                     | Meaning                                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Sandbox was off                           | Scheduled times passed while nothing could run. The outage is estimated from the last time the Mod was seen working; it is not exact. |
| Ran late                                  | A time was handled late while running.                                                                                                |
| Schedule was paused                       | Times passed while you had paused the schedule.                                                                                       |
| Already running                           | `skipIfRunning` skipped a start (recorded as resolved).                                                                               |
| Queue full / waited too long in the queue | Starts that never happened.                                                                                                           |
| Too many events at once                   | A trigger hit its burst cap; the number dropped is counted.                                                                           |
| Events missed while the sandbox was off   | Runs were waiting for events while it was off; those events cannot be replayed.                                                       |
| Started too often                         | The circuit breaker disabled a task.                                                                                                  |

Repeats of the same cause for the same schedule or run are combined into one incident with a count and a time range. **Acknowledge** marks it seen and runs nothing. For missed schedule times, **Run once…** and **Skip…** show a preview with a single-use confirmation that expires after five minutes.

### Overdue modes

| Mode             | After the late window (default five minutes)                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `skip`           | Note the missed times and continue with the next future one. Default for recurring schedules.                           |
| `runOnce`        | One run for the latest missed time, with `run.missedCount` set. `maxAgeMs` skips it when too old.                       |
| `catchUpBounded` | Run the oldest missed times within `catchUp.maxAgeMs`, at most `catchUp.max` (≤ 10), `spacingMs` apart; count the rest. |
| `review`         | Ask the GM. Default for one-off times.                                                                                  |
| `expire`         | Drop them.                                                                                                              |

Within the late window a recurring schedule always runs once for its latest time and summarises older ones. Lateness up to `graceMs` (250 ms) counts as on time.

## Restart sequence

1. Load and check the saved data. If it is from a newer version or unreadable, nothing runs and nothing is overwritten; the GM is told and the console has the reason.
2. Upgrade older data, keeping a backup while upgrading.
3. Start a new boot and estimate the outage.
4. Check every unfinished run: interrupted actions are confirmed, re-applied (absolute values) or sent to review; adapter calls from before the restart are checked with the adapter or reviewed; finished children and branches release their parents.
5. Apply each schedule's overdue policy once.
6. Rebuild timers, then start listening to game events (so the objects Roll20 loads at startup are not mistaken for new ones).
7. Allow new starts, refresh the dashboard and whisper one summary.

## Emergency stop

`!taskautomation stop-all --preview` shows how many runs and queued starts would be stopped and gives a confirmation button. Stopping cancels every run (their children too), empties the queues and refuses new starts until `!taskautomation resume-all`. Messages and changes already made stay.

## Exporting and copying tasks

`definition export --id <id>` whispers the JSON in pages of 1,500 characters; copy them into one line after `definition import --json`. `--handout` writes it into a GM-only handout instead; anyone you share that handout with can read it. The sandbox cannot save files.

## Diagnostics

`!taskautomation report diagnostics` and the **Integrations** section show scheduled jobs, the next deadline, wake counts, budget yields, the longest wake, clock jumps noticed, stored size and the boot. `config set diagnostics on` writes scheduler and recovery details to the API console.
