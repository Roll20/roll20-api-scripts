# Worked Examples

Each example is a template (`!taskautomation template add <id>`) and a JSON file in [../examples/](../examples/) that can be imported into any game with `!taskautomation definition import --json …`. The expected results below are checked by `tests/examples.test.mjs` against a stub sandbox; TESTING.md has the live checklist.

## Adventure montage (`montage`)

The plan's fixture. Select up to five multi-sided tokens and start it: each changes side ten times, eight seconds apart, wrapping round. The last change is followed by a final eight-second wait.

- Dashboard: one waiting run with the next deadline.
- Restart part-way: the run carries on from the same frame. Missed frames are not caught up (`overdue: skip`). If a side change was interrupted, the token is checked: if it already shows the intended side the change is confirmed, otherwise the run asks you.
- For a continuous montage, use `"mode": "forever"` with `"policy": {"allowForever": true}` and cancel it from the dashboard.

## Torch reminder (`torch-reminder`)

Select the torchbearer and start it. These are real-world minutes, not game time.

1. After 50 minutes, the GM and the token's controllers are whispered: _Lyra's torch is guttering: about 10 minutes of light left._
2. After 10 more minutes, everyone sees: _Lyra's torch burns out._

If the sandbox is off through both deadlines, the first late wait (`"overdue": "review"`) stops the run for review. You see one decision, not two messages in a burst. **Mark done and continue** sends the warning and starts the last ten minutes; **Skip the next step** skips the warning; **Cancel** ends it.

## HP threshold (`hp-zero`)

Added disabled: `definition enable --id hp-zero`. When any token's bar 1 goes from above 0 to 0 or less, it gets the `dead` marker (other markers are kept) and the GM is whispered _Orc has dropped to 0 HP._

- Changing 0 to −2 does not fire again: only crossings count. Empty or non-numeric bars never count as 0.
- A one-second cooldown stops repeated edits from flooding chat.
- Limit it to a page with `"filter": {"pageIds": ["-page"]}` (`definition trigger remove` / `add`).
- Using an attribute instead of a bar: change the trigger to `"event": "attribute.change"`, `"filter": {"attribute": "hp", "properties": ["current"], "crossing": {"property": "current", "direction": "below", "threshold": 0}}` and bind `"from": "event.characterId"`. There is no built-in idea of hit points; you choose the bar or attribute.

## Turn response (`turn-response`)

Added disabled. When the current turn moves to a token, the run waits up to 15 seconds for `!taskautomation signal turn-ready` (a player or GM macro), then pings the token for the GM and whispers _It is Aria's turn._ Custom entries such as _Round 2_ get _Turn: Round 2_.

- Re-sorting or editing initiative without changing who is first is not a new turn.
- `concurrency: replace`: a new turn cancels the previous turn's run.
- Rounds: add a custom entry starting with _Round_ and trigger on `turn.round`. Moving to the next entry is not a new round by itself.

## Parallel scene (`parallel-scene`, with `scene-cleanup`)

Needs a jukebox track called _Ambience_ (or start with `--param track=Name`). Select a door token (multi-sided) and start it.

- Branch **music** lowers the volume from 50 to 10 in five one-second steps.
- Branch **door** waits three seconds and changes the door's side.
- When both have finished (`join: all`), `scene-cleanup` stops the track and describes the silence.

If the door is not multi-sided, the door branch fails; the music branch still finishes and then the run fails with _not a multi-sided token_. Volume changes already made stay. A volume step failing is skipped (`onError: skip`). To restore things after a failure, add a compensation step that sets values back with `expect` guards, so changes made by people meanwhile are not overwritten.

## Session reminder (`session-reminder`)

Added disabled. Every Friday at 19:00 at UTC+00:00, everyone sees _Session starts in 15 minutes. Grab your dice!_

- When British Summer Time starts: `!taskautomation schedule list`, then `schedule offset --id trigger-N --offset +01:00`. The preview shows the next three times now and after the change (19:00Z → 18:00Z).
- Missed by up to 15 minutes: runs once. Missed by more, but less than two hours (`maxAgeMs`): runs once and the dashboard notes it. Missed by more than two hours: not run; the misses are counted on the dashboard.
- Runs expire after an hour (`lifetimeMs`).

## Other-Mod command (`token-mod-command`)

Needs TokenMod. Select a token and start it: TaskAutomation sends `!token-mod --ids -TokenId --set statusmarkers|+blue`.

- The token ID is inserted exactly; a value with spaces, `--` or `|` would be refused.
- The journal records the step as _sent (not confirmed)_. TaskAutomation cannot know whether TokenMod acted.
- No selection is passed on: the command must name its targets. Commands come from the API, so Mods that only accept commands from players or GMs will ignore them.
- **TokenMod ignores `--ids` in commands from other Mods** unless the GM turns on its option with `!token-mod --config players-can-ids|on` (which also lets players use `--ids`). With TokenMod's defaults the run still completes as _sent (not confirmed)_ and the token does not change, which is exactly why TaskAutomation never reports a command as done. TaskAutomation does not use TokenMod's `--api-as` because that would act as a player.

## Door sequence (`door-sequence`)

Select a multi-sided door and start it. Everyone sees _The heavy door groans…_. Then:

- `!taskautomation signal door-open` within a minute: the door changes side and _The door swings open._
- No signal: _The door stays shut._

If the sandbox restarts while waiting, the wait carries on with its original timeout and the dashboard records that signals sent while it was off could not be seen.
