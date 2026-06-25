# Combat Encounter Director — Testing Guide

All testing is manual in a Roll20 campaign with API enabled. Run each checklist section in order; earlier sections are prerequisites for later ones.

---

## Setup

- [ ] Upload `CombatEncounterDirector.js` to the campaign's API Scripts and save.
- [ ] Confirm the API console shows: `-=> Combat Encounter Director v1.0.x <=-`
- [ ] Confirm a startup whisper appears in chat for each GM player.
- [ ] Confirm the quick-action menu appears in the whisper.
- [ ] Confirm the **Combat Encounter Director - Command Deck** journal exists.
- [ ] Confirm the **Combat Encounter Director - Status** journal exists.

---

## Baseline: Command Routing

- [ ] `!ced` → shows quick-action menu whisper.
- [ ] `!ced help` → shows full command reference.
- [ ] `!ced unknowncommand` → whispers an error with help hint.
- [ ] Non-GM player typing `!ced` → no response (silently ignored).

---

## Configuration

- [ ] `!ced config` → shows current HP bar, AC bar, and language.
- [ ] `!ced config hp-bar bar2` → updates config; `!ced config` shows bar2.
- [ ] `!ced config hp-bar bar1` → restores bar1.
- [ ] `!ced config ac-bar none` → disables AC scaling.
- [ ] `!ced config ac-bar bar2` → re-enables AC bar.
- [ ] Invalid bar name → whispers an error listing valid options.
- [ ] `!ced config language fr` → confirmation card now appears in French; subsequent commands use French strings.
- [ ] `!ced config language en-US` → restores English.
- [ ] `!ced config language xx` (unknown code) → whispers an error listing all supported locale codes.

---

## Party Scaling — Presets

Place one or more NPC tokens on the token layer with bar1 and bar2 values set.

- [ ] Select a token. Run `!ced scale preset standard` → no change (100% HP, +0 AC).
- [ ] Select a token. Run `!ced scale preset large` → HP bar max increases; AC bar increases by 1.
- [ ] Select a token. Run `!ced scale preset solo` → HP set to 25% of original; AC reduced by 2.
- [ ] Running preset with no tokens selected → shows pending profile and an **Apply** button.
- [ ] Clicking **Apply Scaling to Selected** after selecting tokens → applies the pending profile.

---

## Party Scaling — Custom

- [ ] `!ced scale hp 200` → pending HP set to 200%.
- [ ] `!ced scale ac +3` → pending AC set to +3.
- [ ] `!ced scale damage 150` → pending damage set to 150%.
- [ ] `!ced scale apply` with tokens selected → applies all three.
- [ ] `!ced scale hp 0` → whispers a validation error.
- [ ] `!ced scale ac +15` → whispers a validation error.
- [ ] `!ced scale hp 150abc` → whispers a validation error (partial input rejected).
- [ ] `!ced scale party 6players` → whispers a validation error (partial input rejected).
- [ ] `!ced scale party 6` → whispers nearest preset (Large Party) with Apply button.

---

## Boss Tools

- [ ] Select a token. `!ced boss minion` → HP/max set to 1; AC reduced.
- [ ] Select a token. `!ced boss elite` → HP increased to 150%; AC +1.
- [ ] Select a token. `!ced boss boss` → HP increased to 300%; AC +2.
- [ ] Select a token. `!ced boss legendary` → HP 500%; AC +3.
- [ ] `!ced boss invalid` → whispers an error with valid preset list.
- [ ] No tokens selected → whispers a warning.

---

## Reset & Recovery

(Run immediately after scaling tests above so modified tokens are available.)

- [ ] Select a modified token. `!ced reset selected` → token returns to exact original HP, AC, name.
- [ ] `!ced reset page` → all modified tokens on current page reset; unmodified tokens unaffected.
- [ ] `!ced reset all` → all tracked tokens across all pages reset.
- [ ] `!ced reset selected` with untracked token → whispers "Not tracked" count.

---

## Reinforcements

- [ ] Select a token. `!ced reinforce duplicate 2` → 2 copies created near original; copies have incremented names.
- [ ] `!ced reinforce duplicate 5` → 5 copies created.
- [ ] `!ced reinforce enumerate` with 3 tokens selected → all renamed "Name 1", "Name 2", "Name 3".
- [ ] Duplicate with no tokens selected → whispers a warning.
- [ ] `!ced reinforce duplicate 0` → whispers a validation error.
- [ ] `!ced reinforce duplicate 100` → whispers a validation error (max per-token is 50).
- [ ] `!ced reinforce duplicate 51` → whispers a validation error.
- [ ] `!ced reinforce duplicate 3abc` → whispers a validation error (partial inputs rejected).
- [ ] Select 10 tokens and run `!ced reinforce duplicate 20` → whispers a burst-limit error (200 > 100 limit); no tokens created.
- [ ] Select 2 tokens and run `!ced reinforce duplicate 50` → whispers a burst-limit error (100 > 100 limit); no tokens created.

---

## Layer & Visibility

- [ ] Select tokens. `!ced layer gm` → tokens move to GM layer (invisible to players).
- [ ] `!ced layer token` → tokens move back to token layer.
- [ ] `!ced layer map` → tokens move to map layer.
- [ ] `!ced hide` → selected tokens moved to GM layer.
- [ ] `!ced reveal` → selected tokens moved to token layer.
- [ ] No tokens selected → whispers a warning for each command.

---

## Position Saving

- [ ] Select tokens in a known position. `!ced position save` → positions saved.
- [ ] Move the tokens to a new position.
- [ ] `!ced position restore` → tokens return to saved positions.
- [ ] `!ced position restore` on a token with no saved position → reports "No saved position" count.

---

## Encounter Templates

- [ ] Place several tokens on the current page with custom HP values.
- [ ] `!ced encounter save test-encounter` → confirms token count saved.
- [ ] Move some tokens, change HP.
- [ ] `!ced encounter load test-encounter` → tokens that still exist by their Roll20 ID are restored to their saved positions, layers, and bar values. **Note:** missing tokens (deleted since save) are reported as a count but are NOT recreated — encounter load is a state-restore operation only.
- [ ] `!ced encounter list` → shows "test-encounter" with Load and Delete buttons.
- [ ] `!ced encounter delete test-encounter` → removes the template.
- [ ] `!ced encounter list` → shows "No encounters saved yet."
- [ ] `!ced encounter load nonexistent` → whispers "not found" error.
- [ ] `!ced encounter save "bad name!"` → whispers invalid name error (special characters not allowed).
- [ ] `!ced encounter save ` (empty name) → whispers name required error.

---

## Reporting

- [ ] `!ced report refresh` → status journal updated; shows token count.
- [ ] Open **Combat Encounter Director - Status** → shows summary and table.
- [ ] `!ced report changed` → journal updated with only modified tokens.
- [ ] Select some tokens. `!ced report selected` → journal updated with only selected tokens.
- [ ] `!ced report clear` → journal shows "Report cleared."
- [ ] Changed values appear in amber/gold in the table; unchanged values are muted.

---

## Journal Management

- [ ] `!ced journal rebuild` → both journals regenerated; control panel buttons still work.
- [ ] Delete the **Combat Encounter Director - Command Deck** journal manually, then `!ced journal rebuild` → journal recreated.

---

## Edge Cases

- [ ] Token with bar1_max set to 0 → scaling does not produce NaN or negative HP.
- [ ] Token deleted after being tracked → `reset all` skips the missing token and reports a count.
- [ ] Very large party size: `!ced scale party 30` → uses Massive Table preset.
- [ ] `!ced scale party 31` → whispers a validation error (max is 30).

---

## Localisation

- [ ] `!ced config language de` → all subsequent whisper titles and button labels appear in German.
- [ ] Open the **Combat Encounter Director - Command Deck** journal after `!ced journal rebuild` → section headers are in German.
- [ ] Open the status journal after `!ced report refresh` → summary labels and column headers are in German.
- [ ] `!ced config language en-US` → output returns to English.
- [ ] `!ced config language en` (alias) → accepted as `en-US`.
- [ ] `!ced config language zh` (alias) → accepted as `zh-TW`.
- [ ] Missing translation key (simulated by temporarily commenting out a key in `en-US.js`) → the key path is shown as a string fallback; no crash.

---

## Regression

After completing the above tests:

- [ ] ConditionTracker still responds to `!condition-tracker` commands (if installed).
- [ ] No unexpected error messages appear in the Roll20 API console.
- [ ] Roll20 page performance is not degraded.
