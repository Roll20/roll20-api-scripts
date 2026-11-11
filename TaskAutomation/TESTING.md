# TaskAutomation — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

The suites cover the scheduler and its single-timer invariant, expressions, recurrence, the validator and JSON Schema, state migrations, every worked example end to end, restarts at every action boundary, permissions and injection, and the dashboard. They run the built bundle in a stubbed Roll20 sandbox with a controllable clock. They cannot check what only a real game can, so run the checklist below in real games before release and record the results (date, engine, sandbox version).

---

## Test Games

| Game         | Engine                         | Needed for                               |
| ------------ | ------------------------------ | ---------------------------------------- |
| **Jumpgate** | Jumpgate, Experimental sandbox | Everything below                         |
| **Legacy**   | Legacy, Default sandbox        | Host compatibility (sections 1, 2, 4, 7) |

Each game needs: a GM and a player account (use a second browser), a page with a few NPC tokens, one token the player controls, a multi-sided (rollable table) token whose sides are images from your library, a character with an `hp` attribute, a jukebox track called _Ambience_, and TokenMod installed.

---

## 1. Host proofs (do these first)

- [ ] Install `TaskAutomation.js` and save. The console shows `-=> TaskAutomation v1.0.0 … <=-`; the GM gets _TaskAutomation is ready._ and the menu.
- [ ] The Journal has **TaskAutomation - Dashboard** and **TaskAutomation - Help**; the player cannot see either.
- [ ] **Handout links**: every button on the dashboard runs its command (Tasks, Runs, pages, Refresh, Stop all…). Note any button that does not, and the exact `href` the handout shows.
- [ ] **One timer**: `report diagnostics` shows `armed: no` and no jobs in an idle game after the first ten minutes.
- [ ] **Restart**: start the montage, then restart the sandbox (save the script). It carries on at the right side and timing.
- [ ] **Token sides**: the montage changes the multi-sided token's image. A token with a Marketplace image gives a clear _not an image the API can set_ error.
- [ ] **Events**: moving a token, editing a bar, editing an attribute, changing the turn order, opening and closing the tracker, moving the player ribbon and a player logging in each reach a task (use `config set diagnostics on`).
- [ ] **No false events at startup**: restarting the sandbox does not start `token.add` tasks for existing tokens.

## 2. Worked examples

- [ ] `montage`, `torch-reminder` (use `wait` 1 minute copies to save time), `hp-zero`, `turn-response`, `parallel-scene` (with `scene-cleanup`), `session-reminder` (schedule a copy a few minutes ahead with the right offset), `token-mod-command`, `door-sequence`: each behaves as described in `docs/EXAMPLES.md`.
- [ ] `torch-reminder` restart case: start it, stop the sandbox past both waits (or use a 1-minute copy and disable the script for 3 minutes), restart: one review, no burst of messages.
- [ ] `session-reminder` DST: `schedule offset --id … --offset +01:00` shows both sets of times; applying it moves the next run an hour earlier in UTC.

## 3. Dashboard

- [ ] Runs, waits, deadlines and remaining times look right; clicking **Refresh** updates them (reopen the handout if Roll20 does not redraw it).
- [ ] Pausing a run from the dashboard, then clicking the old **Pause** link again, says the button is stale.
- [ ] 50 quick token moves with an event task do not flood handout writes (watch the dashboard update about every two seconds at most).
- [ ] Two GMs paging the dashboard change it for both (expected: one shared view).
- [ ] Share the dashboard with a player: the GM is told and it stops updating. `dashboard repair` fixes it.
- [ ] Delete the dashboard: it comes back on the next update.
- [ ] `config set playerView on`: **TaskAutomation - Player View** appears only for players a task is shared with and shows no GM tasks.

## 4. Missed work and recovery

- [ ] Schedule `--every 1m`, disable the script for five minutes, enable it: one run, the rest reported as missed.
- [ ] One-off `--at` a minute ahead, disable the script for ten minutes: the dashboard offers **Run once…**; the confirmation button works once only.
- [ ] Pause a schedule for three occurrences and resume: they are reported, not run. `--mode catchUp` follows the overdue policy.
- [ ] An adapter call to `reference` `silent` goes to review after its timeout.

## 5. Permissions and safety

- [ ] The player cannot run `!taskautomation definition list`, `schedule`, `stop-all` or decide reviews.
- [ ] Share a task with the player (`access.mode: players`): they can start it on their token, not on an NPC; they can pause and cancel only their own run.
- [ ] Take control of the token away while the player's run waits: the run stops for review.
- [ ] A token named `<b>x</b>` shows literally on the dashboard and in chat.
- [ ] A chat trigger does not see whispers or rolls unless `privateChatTriggers` is on and the trigger is `private`.
- [ ] `!taskautomation stop-all --preview` → confirm: all runs cancel, new starts are refused until `resume-all`.

## 6. Integrations

- [ ] `token-mod-command` with TokenMod's defaults: the run shows _sent (not confirmed)_ and the token does not change (TokenMod drops `--ids` from other Mods). With `!token-mod --config players-can-ids|on` the token gets the blue marker.
- [ ] A second Mod that pushes an adapter spec onto `globalThis.TaskAutomationQueue` before TaskAutomation loads is listed by `adapter list`.
- [ ] `TaskAutomation.signal('door-open')` from another Mod releases `door-sequence`.

## 7. Install, upgrade and export

- [ ] Clean install in a new game works without other Mods.
- [ ] Export a task (`definition export`), import it into the other game, run it.
- [ ] Large import in parts (`import begin/part/commit`) works; parts out of order are refused.
- [ ] Restart the sandbox repeatedly with runs active: no duplicate messages, no errors in the console.
- [ ] Measure: with 100 tasks and 100 waiting runs, note the longest wake in `report diagnostics` and the stored size.
