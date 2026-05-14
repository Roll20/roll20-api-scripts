# Condition Tracker Manual Testing

This checklist validates `ConditionTracker.js` in a live Roll20 VTT game before submission.

## Setup

1. Run `npm run build` from `ConditionTracker`.
2. Paste `ConditionTracker.js` into Roll20 Mod scripts.
3. Restart the API sandbox.
4. Prepare at least two tokens on the active page and add the target token to the Turn Tracker.
5. Open chat as GM and, if possible, as a non-GM player.

## Baseline

1. Restart sandbox.
   - Expected: API console logs readiness and GMs receive a ready whisper.
2. Run `!condition-tracker --help`.
   - Expected: Help is whispered, no token selection is required, and the available translations table is present without a translation-file column.
3. Confirm both the `ConditionTrackerWizard` and `ConditionTrackerMultiTarget` macros exist.
4. Run `!condition-tracker --reinstall-macro`.
   - Expected: Both macros are recreated and a confirmation whisper is sent to the GM.
5. Confirm the localized help handout exists and opens.
   - Expected: A single `Condition Tracker — Help & Reference` handout is present and reflects the current configured language.
6. Run `!condition-tracker --reinstall-handout`.
   - Expected: The handout is recreated or updated, duplicates are cleaned up if present, and a confirmation whisper is sent to the GM.

## Apply Conditions

1. Run the macro, choose Grappled, choose a source token, then choose a target token.
   - Expected: Target gets the configured marker, a Turn Tracker row appears below target, and public chat announces the application.
2. Run the macro, choose Advantage or Disadvantage, choose a subject (or None), choose a source token, then choose a target token.
   - Expected: Turn Tracker row is grouped under the source token row.
3. Apply Other with `Booming Blade`.
   - Expected: Turn Tracker text is target-first and chat says the source applies the effect to the target.
4. Apply Other with empty text.
   - Expected: GM receives a warning and no row is added.
5. Repeat the exact same source, target, condition, and custom text.
   - Expected: Duplicate warning and no extra row.
6. Apply the same condition from a different source.
   - Expected: A separate row is allowed.
7. Run `!condition-tracker --config subjectPromptBypass true`, then launch the prompt UI for Spell, Ability, or Other.
   - Expected: The Subject step is skipped, Subject is treated as None, and the apply flow continues without prompting for a subject token.
8. Run `!condition-tracker --prompt --condition Spell --subjectPromptBypass false`.
   - Expected: The one-off override restores the Subject step for that command even if the saved config bypass is enabled.

## Removal

1. Run `!condition-tracker --menu remove`.
   - Expected: GM sees remove buttons for active conditions.
2. Click a remove button.
   - Expected: Row is removed, public chat announces removal, and GM receives cleanup details.
3. Confirm a marker remains when another active condition on the same target still uses it.

## Duration

1. Apply `End of target's next turn`.
   - Expected: Condition expires when the target's next tracked turn ends.
2. Apply `End of source's next turn`.
   - Expected: Condition expires when the source's next tracked turn ends.
3. Apply `2 rounds`.
   - Expected: Condition expires after two target turn endings.
4. Change Turn Tracker values without advancing the first token.
   - Expected: Duration does not over-trigger.

## HP Cleanup

1. Apply multiple conditions to one target.
2. Set the configured health bar to 0 or below.
   - Expected: A zero-HP prompt appears for the GM instead of silently mutating state.
3. Use a player-controlled target and choose **Remove All Conditions**.
   - Expected: All target conditions are removed, rows are removed, markers are cleaned safely, public removal messages appear, and GM receives cleanup whispers.
4. Use a player-controlled target and choose **Mark as Incapacitated**.
   - Expected: An Incapacitated condition is applied once, inserted into the Turn Tracker, and duplicate Incapacitated applications are prevented.
5. Use an NPC target and choose **Remove from Turn Order**.
   - Expected: The NPC token row is removed from initiative and the GM receives the follow-up move-to-map-layer prompt.
6. Click the move-to-map-layer button for that NPC.
   - Expected: The token moves to the map layer and a confirmation whisper is sent.
7. Change the HP value while it is already 0 or below.
   - Expected: No repeated cleanup noise.

## Multi-Target Wizard

1. Select two or more named tokens on the board.
2. Run `!condition-tracker --multi-target`.
   - Expected: GM receives a confirmation card listing the selected tokens.
3. Click **Confirm target list**, then choose a condition and duration.
   - Expected: The condition is applied to every token in the list, each with its own chat announcement and GM summary whisper.

## Config and Cleanup

1. Run `!condition-tracker --config`.
   - Expected: Current settings and marker mappings are shown.
2. Run `!condition-tracker --config useMarkers false` and apply a condition.
   - Expected: No marker is added.
3. Run `!condition-tracker --config icons true` and apply a condition.
   - Expected: Chat and Turn Tracker output include simple icon prefixes.
4. Run `!condition-tracker --config healthBar bar2_value`.
   - Expected: HP cleanup uses `bar2_value`.
5. Run `!condition-tracker --config language fr`.
   - Expected: Confirmation whisper is sent in French; subsequent messages arrive in French.
6. Run `!condition-tracker --config language en`.
   - Expected: The language is accepted and saved as `en-US`.
7. Run `!condition-tracker --config language zh`.
   - Expected: The language is accepted and saved as `zh-TW`; help/menu/handout text uses Traditional Chinese.
8. Run `!condition-tracker --config language pt`.
   - Expected: The language is accepted and saved as `pt-PT`.
9. Run `!condition-tracker --config language he`.
   - Expected: Chat/help output uses Hebrew labels and right-to-left layout.
10. Open the generated handout after switching to Hebrew.
    - Expected: The handout uses right-to-left layout and the translations list shows accessible flag images.
11. Run `!condition-tracker --config language made-up-locale`.
    - Expected: A warning is whispered with the same two-column available-translations table used by help.
12. Run `!condition-tracker --config language en-US` to restore defaults.
13. Apply a condition with `--lang fr` appended.

- Expected: Two public announcements appear — one in English and one in French.

14. Run `!condition-tracker --config reset` after changing multiple settings.

- Expected: Config values and marker mappings return to defaults, and the help handout is regenerated in the default language.

15. Delete a source or target token with active tracked conditions.

- Expected: Related active conditions are removed immediately and corresponding custom Turn Tracker rows disappear without running cleanup.

16. Manually delete a custom Condition Tracker row from the Turn Tracker without using the remove menu, then cause a turn-order change.

- Expected: The stale state entry is reconciled automatically, its marker is cleaned up when safe, and the removal menu no longer lists the missing row.

17. Run `!condition-tracker --cleanup` after deletion.

- Expected: No additional stale entries remain for the deleted token; summary should not report newly discovered orphaned conditions from that deletion.

## Permissions

1. Run apply, remove, cleanup, and config commands as a non-GM.
   - Expected: Access denied whisper.
2. Run help as a non-GM.
   - Expected: Help is whispered.
