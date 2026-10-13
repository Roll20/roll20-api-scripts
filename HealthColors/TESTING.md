# HealthColors Manual Testing

This checklist validates `HealthColors.js` in a live Roll20 VTT game before release. Run it after every change to the root script; the `X.Y.Z/HealthColors.js` snapshot must be byte-identical to the root copy before you start.

## Setup

1. Paste `HealthColors.js` into the game's Mod (API) Scripts, or install it from the One-Click library.
2. Restart the API sandbox and open the API console.
3. Prepare on the active page, all on the Objects layer:
   - one token linked to a **player-controlled** character (a PC), with its HP bar linked to the sheet's HP attribute;
   - one token linked to an **NPC** character (no controller);
   - one unlinked token (represents nothing) with a value and max in the health bar.
4. Give every token a non-empty `max` in the health bar (default `bar1`).
5. Create at least one custom FX in the Effects menu (e.g. `Blood Spray`) and note its name.
6. Add at least one jukebox track (e.g. `Funeral`).
7. Open chat as GM and, if possible, as a non-GM player who controls the PC.

## Baseline

1. Restart the sandbox.
   - Expected: The console logs `-=> HealthColors vX.Y.Z [Updated: …] <=-` and the GM receives a **Script Ready** whisper with a ⚙ Settings button.
2. Check the Effects menu.
   - Expected: `-DefaultHurt` and `-DefaultHeal` custom FX exist (created on first run, with a "Creating Default … FX" whisper).
3. Run `!aura`.
   - Expected: The interactive GM menu is whispered, showing every setting as a button, including Heal FX, Hurt FX, FX List, and the Death Save Integration block.
4. Run `!aura settings`.
   - Expected: A read-only settings panel is posted to public chat with the same values as pills.
5. Change any setting from the menu (e.g. `!aura size 1`).
   - Expected: An `UPDATING TOKENS...` whisper, then the menu is re-whispered with the new value.

## Health Colouring (Aura Mode)

1. Set the PC token to full HP.
   - Expected: Aura 1 is green at the configured radius (default `0.35` ft) and visible to players.
2. Reduce HP to about 75 %, 50 %, 25 %.
   - Expected: Aura shifts green → yellow → orange/red along the gradient.
3. Set HP to 0.
   - Expected: Aura is black and the dead (Red X) status marker is applied.
4. Heal above 0.
   - Expected: Dead marker is removed and the aura colour returns.
5. Set HP above max (temporary HP).
   - Expected: Aura is blue.
6. Clear the health bar `max` on a token.
   - Expected: Aura and tint are cleared until a max is set again.
7. Run `!aura bar 2` then move HP into `bar2`.
   - Expected: Whisper `Health bar set to bar2. Forcing sync...`; colouring follows bar 2. Run `!aura bar 1` to restore.
8. Run `!aura bar 7`.
   - Expected: Invalid-bar whisper; the setting is unchanged.
9. Run `!aura forceall`.
   - Expected: `Refreshing N Tokens` then `Finished Refreshing Tokens`; every token's colour is re-evaluated.
10. Select one token and run `!aura update`.
    - Expected: Only that token is refreshed and its name is whispered.

## Tint Mode

1. Run `!aura tint`.
   - Expected: Health colour moves to the token tint; Aura 1 set by HealthColors is cleared on every token.
2. Manually set Aura 1 on a token, then change its HP.
   - Expected: Your manual Aura 1 is left untouched; only the tint changes.
3. Run `!aura tint` again.
   - Expected: Tint is cleared to transparent and Aura 1 shows the health colour again.

## Thresholds, Palette, and Per-Character Colour Opt-Out

1. Run `!aura perc 50 100`.
   - Expected: PC tokens show colour only at or below 50 % HP; NPC tokens always show it.
2. Run `!aura perc 0 0`.
   - Expected: No living token shows a health colour; 0 HP still shows the dead marker.
3. Restore with `!aura perc 100 100`.
4. Run `!aura palette colorblind`.
   - Expected: Tokens refresh immediately with cyan / orange / magenta; `!aura palette default` restores green / yellow / red.
5. Run `!aura size 3` and `!aura size 0.35`.
   - Expected: Aura radius changes on the next refresh; the menu shows the new value.
6. On a character sheet, set the `USECOLOR` attribute to `NO`.
   - Expected: That character's tokens stop being coloured; `YES` (or deleting the attribute) restores it.

## PC / NPC Toggles and Nameplates

1. Run `!aura pc`.
   - Expected: PC tokens lose their health colour; NPC tokens keep theirs. Run `!aura pc` again to restore.
2. Run `!aura npc` and restore it the same way.
3. Run `!aura deadPC`, set the PC to 0 HP.
   - Expected: No dead marker on the PC; the aura still turns black. Restore with `!aura deadPC`.
4. Run `!aura dead` and repeat with the NPC.
5. Run `!aura gmpc No`, `!aura gmnpc No`.
   - Expected: GM no longer sees PC/NPC nameplates after the next refresh.
6. Run `!aura pcpc No`, `!aura pcnpc No`.
   - Expected: Players no longer see nameplates.
7. Set each nameplate option to `Off`.
   - Expected: HealthColors stops touching nameplate visibility; manual changes persist.
8. Restore all four to `Yes`.
9. Run `!aura on` / `!aura off`.
   - Expected: `off` stops all processing (no colour changes on HP edits); `on` resumes.

## One-Off Tokens

1. With `One Offs: No`, change the unlinked token's HP.
   - Expected: No colouring.
2. Run `!aura oneoff` and change its HP again.
   - Expected: The unlinked token is coloured and gets the dead marker at 0 HP.

## Heal and Hurt FX

1. With `FX: Yes` and default colours, damage the PC.
   - Expected: A red particle burst at the token, sized by the damage amount and the token size.
2. Heal the PC.
   - Expected: A gold (`FDDC5C`) burst.
3. Run `!aura hurt 00FF00` then damage the PC.
   - Expected: The burst is green; the `-DefaultHurt` FX definition in the Effects menu now carries that colour.
4. Run `!aura heal glow-holy` then heal the PC.
   - Expected: Roll20's built-in `glow-holy` effect plays at the token (fixed size). The menu shows `glow-holy` as the Heal FX label instead of a swatch.
5. Run `!aura hurt explode-blood` and damage the PC.
   - Expected: The built-in `explode-blood` effect plays.
6. Run `!aura hurt splatter-blood` and damage the PC.
   - Expected: The directional `splatter-blood` effect plays at the token without errors.
7. Run `!aura heal Blood Spray` (your custom FX name) and heal the PC.
   - Expected: Your custom FX plays, scaled by token size and heal amount. The setting shows the FX's exact name.
8. Run `!aura listfx`.
   - Expected: A whisper listing every custom FX with its id and **Heal** / **Hurt** buttons, plus the built-in type and colour lists. Clicking **Hurt** on a row sets that FX as the hurt effect.
9. Run `!aura heal not-a-thing`.
   - Expected: ⚠ "Unknown heal FX" whisper; the previous setting is kept.
10. Run `!aura heal default` and `!aura hurt default`.
    - Expected: Colours return to `FDDC5C` / `FF0000`.
11. Run `!aura fx`.
    - Expected: `FX: No`; no effects play on HP changes. Run `!aura fx` again to restore.
12. Run `!aura deadfx Funeral`, then set a token to 0 HP.
    - Expected: The jukebox track plays once. `!aura deadfx None` disables it.
13. Change HP via the character sheet (linked attribute) rather than the token bar.
    - Expected: Exactly one FX per change (no doubled bursts from the attribute and token listeners).

### Per-character overrides

1. On the PC's sheet, set `USEBLOOD` to `OFF`.
   - Expected: No hurt **or** heal FX for that character. Other tokens are unaffected.
2. Set `USEBLOOD` to `0000FF` and damage the PC.
   - Expected: A blue burst for that character only.
3. Set `USEBLOOD` to `splatter-blood, Blood Spray` and damage the PC.
   - Expected: Both effects play.
4. Set `USEBLOOD` to `DEFAULT`.
   - Expected: The global hurt setting applies again.
5. Set `USEHEAL` to `OFF` and heal the PC.
   - Expected: No heal FX; hurt FX still plays.
6. Set `USEHEAL` to `burst-magic` and heal the PC.
   - Expected: The `burst-magic` effect plays for that character only. Set it back to `DEFAULT`.
7. Set `USEBLOOD` to a custom FX name that does not exist, then damage the PC twice.
   - Expected: The default hurt burst plays, and the GM is whispered **once** that the FX was not found, naming the character and the `USEBLOOD` attribute. The API console logs the fallback each time.
8. Delete the custom FX that `!aura heal` currently points to, then heal.
   - Expected: The default heal burst plays and the GM is whispered once to fix it with `!aura heal`.

## Death Save Integration

Use the PC token. Defaults target the D&D sheets (`deathsave_succ1..3` / `deathsave_fail1..3`).

1. Run `!aura deathsaves on`.
   - Expected: Confirmation whisper; a ⚠ follows only if the dying or stable marker tag is not a marker in this game.
2. Drop the PC to 0 HP.
   - Expected: The dying marker (default `skull`) is applied instead of the Red X.
3. Tick death-save successes on the sheet up to 3.
   - Expected: Marker changes to the stable marker (default `green`).
4. Clear successes and tick 3 failures.
   - Expected: Red X (dead) is applied and the death sound plays once if `deadfx` is set.
5. Heal above 0.
   - Expected: Dying, stable, and dead markers are all cleared.
6. Run `!aura deathsaves markers`.
   - Expected: A table of campaign markers with their exact tags and **Dying** / **Stable** set buttons.
7. Run `!aura deathsaves dyingmarker <tag>` with a custom `Name::id` tag from that list, drop the PC to 0 HP.
   - Expected: The custom marker renders. Restore with `!aura deathsaves dyingmarker skull`.
8. Run `!aura deathsaves dyingmarker not-a-marker`.
   - Expected: ⚠ warning that the tag will not render.
9. Select the PC token and run `!aura deathsaves debug`.
   - Expected: Per-token diagnostic with HP, marker state, resolved watched values, the Mod Script Sandbox version (`v1.0` or `v1.5`, matching the startup banner), and sheet-item API availability.
10. Select the PC and run `!aura deathsaves sync`.
    - Expected: Markers are reconciled immediately from the current death-save values.
11. With the PC selected, run `!aura deathsaves watch`, then `!aura deathsaves watchstatus`, then `!aura deathsaves attrs death`.
    - Expected: Watch status, the watched fields, and the matching legacy attributes are whispered without parser errors or "Unable to find" noise.
12. Run `!aura deathsaves off`.
    - Expected: Dying and stable markers are removed from all tokens; a downed PC shows the Red X again.

### D&D 2024 (Beacon) sheet

1. Set **Game Settings → Mod (API) Scripts → Mod Script Sandbox** to **v1.0 (Legacy)**, restart, enable the integration and down a PC.
   - Expected: The startup log line ends `Mod Script Sandbox v1.0`, the GM menu's Death Save Integration block carries a note ending `this game: v1.0`, and a one-time GM notice says the game runs v1.0 and live death-save reads need v1.5.
2. Switch to **v1.5 (Latest)** and restart (verify the banner says `Sandbox [v1.5 …]`), then repeat steps 2–5 above.
   - Expected: The log says `v1.5`, the GM menu shows no sandbox note, no sandbox notice is whispered, and markers follow the sheet within about 3 seconds of ticking a box.

## One-Click Install Options

1. Install from the One-Click library with non-default options (e.g. `auraBar` = `bar2`, `FX` unticked, `HealFX` = `glow-holy`, `colorPalette` = `colorblind`).
   - Expected: On the first sandbox start the GM is whispered **Applied One-Click options** listing each change, tokens refresh, and `!aura` shows the chosen values.
2. Change a setting in-game (e.g. `!aura bar 1`) and restart the sandbox.
   - Expected: The in-game value survives; no One-Click whisper appears.
3. Re-save the One-Click dialog (even without changes) and restart.
   - Expected: One-Click values are applied again (or "no settings changed" is whispered).
4. Enter an invalid value in a text option (e.g. `HurtFX` = `nonsense`).
   - Expected: ⚠ "Unknown hurt FX" whisper at startup; the previous setting is kept.
5. Run `!aura reset-all`.
   - Expected: Defaults are restored, default FX rebuilt, tokens refreshed, and the One-Click values re-applied.

## Third-Party Compatibility

1. With TokenMod installed, run `!token-mod --set bar1_value|-5` on the PC.
   - Expected: Colour and dead marker update and exactly one FX plays.
2. With ChatSetAttr or AlterBars installed, change the HP attribute through that script.
   - Expected: The token colour updates even though the token bar was not edited directly.
3. Drag a new token from the journal onto the page.
   - Expected: It is coloured shortly after it appears (about half a second), without FX.
4. Place a token whose health bar has a value but no max, then set the max (type it into the bar, or link the bar to the HP attribute in token settings).
   - Expected: The aura or tint appears as soon as the max is set, without toggling any setting and without FX.
5. On a sheet that calculates HP max from the sheet (e.g. 5e Shaped), create a new character, place its token with the bar linked to HP while the max is still blank, then fill in the sheet so HP max is computed.
   - Expected: The token is coloured when the max arrives, without `!aura tint` or `!aura forceall`.
6. Place a token that represents no character, then set **Represents Character** in token settings to a character whose HP bar is populated.
   - Expected: The token is coloured once the character is assigned.

## Reset and Recovery

1. Delete `-DefaultHeal` from the Effects menu and run `!aura reset-fx`.
   - Expected: `Recreating Default Hurt/Heal FX`; both default FX exist again with the current colours.
2. Run `!aura reset`.
   - Expected: `STATE RESET`; settings return to defaults (then to One-Click values if installed that way).
3. Run `!aura reset-all` after changing several settings.
   - Expected: Settings, default FX, and token visuals are all restored.

## Permissions

1. As a non-GM, run `!aura`, `!aura on`, `!aura heal glow-holy`, and `!aura deathsaves on`.
   - Expected: Each is answered with a whisper that the command is GM-only and nothing changes.
2. As a non-GM, change your own PC's HP.
   - Expected: Colouring, markers, and FX still apply (they are driven by the token change, not the command).
