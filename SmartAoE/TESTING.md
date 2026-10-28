# SmartAoE Manual Testing

This checklist validates `SmartAoE.js` in a live Roll20 game before release. Run it after every change to the root script; the `X.Y.Z/SmartAoE.js` snapshot must be byte-identical to the root copy before you start. Test in a **Jumpgate** game and, if possible, a **legacy** game.

## Setup

1. Install **libInline** and paste `SmartAoE.js` into the game's Mod (API) Scripts (or install both from the One-Click library). Disable any other copy of SmartAoE.
2. Restart the sandbox and open the API console.
3. On a square-grid page, on the Objects layer, place:
   - a token linked to a **player-controlled** character (a PC);
   - a token linked to an **NPC** character, with HP in bar 1;
   - optionally a second NPC a few squares away (to check the AoE edge).
4. Have a GM chat open, and if possible a player who controls the PC.

## Install and handout

1. Restart the sandbox.
   - Expected: The console logs `SmartAoE v1.0.0 initialized.` and no errors. On a fresh game an `AoEControlToken` character (with CW, CCW, Trigger-ALL, Trigger-Target token actions) and a GM `AoEGenerator` macro are created.
2. Open the Journal.
   - Expected: A **SmartAoE — Help & Reference** handout exists, is not shown to players, shows v1.0.0, and has these sections: Overview, Quick start, Commands, !smartaoe parameters (four groups), Examples, Other scripts, Tips & known limitations.
3. Run `!smarthelp`.
   - Expected: A whisper with a link that opens the handout; no second handout is created.

## Creating and triggering AoEs

1. Select the NPC and run `!smartaoe {{ --aoeType|circle, float --radius|10ft }}`.
   - Expected: A control token (reticle) appears; moving it draws the red squares of a 10 ft circle.
2. Select the control token and run `!smarttrigger` (or the Trigger-ALL token action).
   - Expected: A results card listing the creatures inside.
3. In Jumpgate, click the reticle so that one of the red squares is selected instead, then run `!smarttrigger`.
   - Expected: The AoE still triggers (no "Cannot read properties of undefined" error).
4. Run `!smarttrigger <controlTokenID>` with nothing selected, then `!smarttrigger <controlTokenID> nosuchtoken`.
   - Expected: The first triggers everything in the AoE; the second whispers "Unable to find a target token…".
5. Run `!smarttrigger` with nothing selected.
   - Expected: A whisper asking you to select a control token; no error.
6. Delete the control token.
   - Expected: All its squares disappear.
7. Repeat with `--aoeType|5econe --origin|nearest, face` and use the CW / CCW token actions.
   - Expected: The cone's origin moves around the caster's corners and faces. Only that AoE is redrawn.
8. On a caster larger than one square, create `--aoeType|circle --radius|10ft --origin|nearest` and move the control token around.
   - Expected: The squares along every edge of the circle are drawn, whichever corner is the origin.
9. `--aoeType|circle, float --radius|2ft` with the control token in the middle of a square.
   - Expected: That one square is drawn (before 1.0.0, nothing was drawn).
10. Create two AoEs from the same caster (titles A and B, damage `[[11]]` and `[[22]]`), move both control tokens, then run `!smarttrigger <casterTokenID>`.
    - Expected: Two cards, A with 11 and B with 22 only.
11. `!smartpinggm <tokenID>` and `!smartpinggm nosuchtoken`.
    - Expected: A GM ping on the token; then a whisper that the token doesn't exist.

## Damage and healing

Use `--affectsCaster|true --autoApply|true --instant|true --noSave|true` on an AoE centred on the NPC unless stated otherwise.

1. `--damageFormula1|10 --damageFormula2|[[2*3]]`
   - Expected: The card shows two damage columns (10 and 6) and 16 damage is applied.
2. `--damageFormula2|5 --damageType2|cold` (no formula 1)
   - Expected: The card shows "Dmg:5cold" and 5 damage is applied.
3. `--damageFormula1|[[ {2d6,3d6}kh1 ]]` and `--damageFormula1|[[8d6>4]]`
   - Expected: The rolls are evaluated as written (no `&#123;` or broken totals).
4. `--damageFormula1|-30`
   - Expected: "Healed … by 30".
5. `--damageFormula1|-500`
   - Expected: HP stops at max and the message ends "(@Max)".
6. `--saveFormula|<<1d20>> --dc|1 --damageFormula1|[[2*10]] --conditionPass|blue` (no `--noSave`)
   - Expected: Pass, 10 damage (half), and the `blue` marker is added with no stray commas in the token's markers.
7. `--saveFormula|5eDEX --dc|15 --damageFormula1|[[2*10]]`
   - Expected: A save is rolled and includes the character's DEX save bonus (2014 and 2024 sheets).
8. `--noSave|false --saveFormula|<<1d20>> --dc|10 --damageFormula1|10`
   - Expected: A normal save is rolled (before 1.0.0, `--noSave|false` broke the save formula).
9. `--damageFormula1|[[2d6]]` with **no** `--saveFormula` and **no** `--noSave`
   - Expected: The card is posted and the full damage is applied, as with `--noSave|true` (before 1.0.0 the trigger silently did nothing).

## D&D 2024 (Beacon) sheet

Use a game with the D&D 2024 sheet on Mod Script Sandbox v1.5: a PC caster with spell slots and a Fire Giant (fire immunity) on bar 1. Run the macro from the [Beacon forum report](https://app.roll20.net/forum/post/12842711/script-update-smartaoe/?pageforid=12843607#post-12843607) (Fireball with `--resource|lvl3_slots_expended, 1, Level 3 slots, lvl3_slots_total`, `--saveformula|<<2d20kh1 + a{dexterity_save_bonus}>>` and the `npc_*` resist/vulnerable/immunity attributes).

1. Cast it with the PC selected.
   - Expected: "Level 3 slots: 1 used. Now 1 of N used.", and the sheet shows one more 3rd-level slot used. If the sheet won't let scripts change them: "Could not update …" and no AoE is drawn.
   - Cast until every slot is used, then once more. Expected: "Not enough Level 3 slots! … used = N of N" and no AoE is drawn.
   - Without the limit (`--resource|lvl3_slots_expended`) and no slots used. Expected: "Not enough lvl3_slots_expended!" (the value counts down, as on the 2014 sheet).
2. Trigger it over the Fire Giant.
   - Expected: The save includes the giant's DEX save bonus, the giant is listed as immune, and its HP doesn't change.
3. Repeat 1–2 in a 2014-sheet game.
   - Expected: Same results as before 1.0.0; no "No attribute or sheet field found" errors in the API console.

## Markers and removal

1. Set the NPC to 10 HP, then deal 20 damage with `--zeroHPmarker|pummeled`.
   - Expected: The token gets `pummeled`. With HealthColors installed, it does **not** also get a Red X.
2. Heal it with `--damageFormula1|-30 --zeroHPmarker|pummeled`.
   - Expected: `pummeled` (and any `pummeled@N`) is removed.
3. On a spare token with 5 HP (not linked to a sheet), deal 10 damage with `--removeAtZero|true`.
   - Expected: The token is removed from the map; nearby tokens are untouched.
4. `--conditionFail|red, blue, red` on a token that already has `red@2`.
   - Expected: Only `blue` is added; `red@2` is untouched.

## Trigger-Target and stale links

1. Create a persistent (non-instant) AoE over the NPC and run `!smartquery <NPC token id>`.
   - Expected: Only the AoEs covering that token trigger, for that token only.
2. Delete one of the AoE's squares by hand, then run `!smartquery` again.
   - Expected: Still works (before 1.0.0 this failed with "Cannot read properties of undefined (reading 'get')").
3. Run `!smartclearcache`.
   - Expected: Stored links are cleared; existing drawings stay.

## Calls from other scripts

1. From a ScriptCards or other script, call `!smartaoe` with `--selectedID|<id> --playerID|<id> --aoeColor|#00ff0050`.
   - Expected: The AoE uses the colour passed (before 1.0.0 the player's colour always replaced it).
2. With HealthColors installed, damage a token through SmartAoE.
   - Expected: HealthColors re-colours the token straight away (`SmartAoE.ObserveTokenChange`), and `SmartAoE.ZeroHPMarkers()` lists the 0 HP markers used.

## Error reporting

1. Cause an error (e.g. `!smarttrigger` on a token id that is not an AoE).
   - Expected: A short error whisper in chat and the full stack trace in the API console (`SmartAoE error: …`).
