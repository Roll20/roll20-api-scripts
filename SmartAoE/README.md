# SmartAoE

**SmartAoE** is a Roll20 Mod (API) script for drawing areas of effect on gridded maps and resolving them consistently. Place a control token, aim it at any angle, and SmartAoE decides which squares and creatures are inside using fixed coverage thresholds, so there is no more arguing over the square that is "barely" covered. It can also roll saving throws, apply damage (with resistances, vulnerabilities and immunities), add condition markers and post a results card to chat.

Full original documentation: [Roll20 wiki – SmartAoE](https://wiki.roll20.net/SmartAoE) · Discussion: [Roll20 forum thread](https://app.roll20.net/forum/post/10485883/script-smartaoe-graphical-interface-for-implementing-aoes-on-gridded-maps/?pageforid=10485883#post-10485883)

---

## Features

- **Shapes**: line, square, circle, wall and cones (any angle, Pathfinder `PFcone`, or the 5e triangle `5econe`), plus Pathfinder-style `PFcircle`. Squares and circles can be attached to the caster or float freely.
- **Consistent coverage rules**: a grid square counts when at least `--minGridArea` of it is covered, and a token counts when at least `--minTokArea` of it is inside the AoE.
- **Interactive placement**: move the control token to aim; cones can rotate their origin around the caster's corners and faces.
- **Saves and damage**: per-target saving throws (5e shorthands built in), two damage formulas with damage types, a rule for successful saves (half damage by default) and resistance/vulnerability/immunity checks. 5e Magic Resistance is detected (2014 sheet) and the save is rolled with advantage. Works with both the 2014 and the 2024 (Beacon) D&D sheets.
- **Markers**: status markers for passed saves, failed saves, 0 HP and the caster.
- **Apply now or later**: apply damage and markers automatically, or from buttons on the chat card.
- **Extras**: particle FX on affected squares, jukebox sounds, turn-order entries, tooltips, resource (spell slot) costs, whisper options and a fully styleable results card.
- **Other scripts**: exposes `SmartAoE.ObserveTokenChange` so scripts such as HealthColors can react to the token changes SmartAoE makes.

---

## Installation

1. Install **SmartAoE** from the Roll20 One-Click library (this also installs its dependency, **libInline**), or paste `SmartAoE.js` into **Game Settings → Mod (API) Scripts** with libInline installed.
2. Restart the sandbox. On first start SmartAoE creates:
   - an **`AoEControlToken`** character with a reticle token and a set of ready-made abilities (squares, circles, PF circles, cones, lines and walls of common sizes, plus caster-centred versions);
   - token actions on that character: **CW**, **CCW**, **Trigger-ALL** and **Trigger-Target**;
   - a GM collection macro **`AoEGenerator`** that whispers a chat menu of those abilities;
   - a GM-only **SmartAoE — Help & Reference** handout in the Journal (rebuilt on every start; `!smarthelp` rebuilds it and whispers a link).

To use your own control token image, edit the `AoEControlToken` character's default token, or create another character and pass its name with `--controlTokName`.

---

## How it works

1. Select the caster's token and run `!smartaoe` (from the `AoEGenerator` menu, an ability or your own macro).
2. SmartAoE places a control token linked to the caster and draws the AoE. Move the control token to aim; for cones and lines the AoE runs from the caster towards the control token.
3. Trigger the AoE with `!smarttrigger` (or the **Trigger-ALL** token action). Saves are rolled, FX play and a results card is posted.
4. With `--autoApply|true`, damage and markers are applied at once. Otherwise each row of the card has a button that applies them for that target (`!smartapply`).
5. Delete the control token (or use `--instant`) to remove the AoE.

Results for tokens on the GM layer are always whispered to the GM.

---

## Commands

| Command | Description |
| :------ | :---------- |
| `!smartaoe {{ --param\|value … }}` | Create an AoE for the selected token (or `--selectedID`). Parameters are listed below. |
| `!smarttrigger [controlTokenID]` | Trigger the selected control token's AoE (or the one whose id is given) on everything inside it. Selecting one of the AoE's squares instead of the control token also works. |
| `!smartquery <token_id>` | Trigger only the AoEs that overlap the given token's square, e.g. `!smartquery @{target\|Choose a Target\|token_id}` for start/end-of-turn effects. |
| `!smartrotateorigin cw\|ccw` | Move a cone's origin to the next corner/face of the caster, clockwise or anticlockwise. |
| `!smartremove` | Remove all AoEs and control tokens linked to the selected token. |
| `!smartclearcache` | Clear every AoE link stored for the campaign (tokens and drawings are left in place). Use only if the stored links are corrupted. |
| `!smarthelp` | Rebuild the GM-only **SmartAoE — Help & Reference** handout and whisper a link to it. |
| `!smartapply --args\|…` | Used by the chat card's apply buttons to apply damage and markers to one target. Not normally typed by hand. |

---

## `!smartaoe` parameters

Parameters are case-insensitive. Boolean options accept `true`/`yes`/`1` (and `false`/`no`/`0`).

### Shape and placement

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--aoeType` | `line`, `square`, `circle`, `PFcircle`, `wall`, `cone[, angle]`, `PFcone`, `5econe`. Add `, float` to squares and circles to detach them from the caster. | `line` |
| `--radius` | Number with units (`30ft`, `6u`), a bare number for pixels, or `variable` (no fixed size: the AoE reaches to wherever the control token is). | `variable` |
| `--width` | Wall thickness, in units or pixels (`wall` only). | 1 square |
| `--origin` | `center`, `nearest` (closest corner) or `nearest, face` (corners and sides). | `center` |
| `--offset` | `x, y` offset of the AoE origin from the caster, in grid squares (used for effects that start away from the caster, e.g. a wall). | `0, 0` |
| `--forceIntersection` | Snap the control token to grid intersections. | Automatic for large floating squares/circles |
| `--minGridArea` | Fraction (0–1) of a grid square that must be covered for it to count. | `0.01` |
| `--minTokArea` | Fraction (0–1) of a token that must be inside for it to count. | `0.01` |
| `--instant` | Delete the control token as soon as the AoE is triggered. | `false` |
| `--affectsCaster` | Let the caster's own token be affected. | `false` |
| `--aoeLayer` | Layer to draw on: `objects`/`token`, `gm` or `map`. | `objects` |
| `--selectedID` | Token or character id of the caster, when nothing is selected (e.g. called from another script). | Selected token |
| `--playerID` | Player who may control the control token (for calls from other scripts). | Calling player |

### Control token

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--controlTokName` | Character whose default token is used, or `self` to use the caster as the control token. | `AoEControlToken` |
| `--controlTokSize` | Control token size in squares. | `1` |
| `--controlTokSide` | Side number for a multi-sided (rollable table) token. | Default side |
| `--isDrawing` | Set the control token's *is drawing* flag (also set by `--forceIntersection`). | `false` |
| `--tooltip` | Tooltip text for the control token. | None |

### Appearance and sound

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--aoeColor` | Fill colour `#RRGGBBAA`, or `player` for the player's colour. | `#ff000050` |
| `--aoeOutlineColor` | Outline colour `#RRGGBB`, or `player`. | `#ff0000` |
| `--gridColor` | Grid-line colour `#RRGGBBAA` (alpha `00` hides the lines). | `#000000` |
| `--outlineOnly` | Draw only the outline, without a fill. | `false` |
| `--fx` | Roll20 effect `<type>-<colour>` (e.g. `burn-fire`) spawned on each affected square when triggered. | None |
| `--spawnSound`, `--moveSound`, `--triggerSound`, `--deleteSound` | Jukebox track names played on spawn, move, trigger and delete. | None |
| `--turnorder` | `name, value, formula, linked` — add a turn-order entry, optionally linked to the control token. | Linked |

### Saves

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--dc` | Save DC; a roll equal to or above it succeeds. Accepts an inline roll or attribute. | `0` |
| `--saveFormula` | `5eSTR`, `5eDEX`, `5eCON`, `5eINT`, `5eWIS`, `5eCHA`, or a custom formula. For a roll per target use `<<…>>` instead of `[[…]]` and `a{…}` instead of `@{…}`, e.g. `<<1d20 + a{dexterity_save_bonus}>>`. | None |
| `--noSave` | No saving throw (for healing or unavoidable effects). If neither `--saveFormula` nor `--noSave` is given, the AoE is treated as no save. | `false` |
| `--ignore` | `attrName, value` — characters whose attribute has that value are left out of the results. | None |

### Damage and healing

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--damageFormula1`, `--damageFormula2` | A number, an inline roll (rolled once for all targets) or `<<…>>` (rolled per target). Each formula can be a number or a roll independently; formula 2 can be used on its own. Negative damage heals (a plain negative number such as `-5` is fine). | None |
| `--damageType1`, `--damageType2` | Damage type of each formula, checked against resistances etc. | None |
| `--damageSaveRule` | Operation applied to damage on a successful save. | `*0.5` |
| `--bar` | Bar(s) to change, e.g. `1` or `3,1` (temporary HP in bar 3 first, then bar 1). Damage left over on one bar carries to the next; healing fills each bar to its max before moving on. | `1` |
| `--autoApply` | Apply damage and markers immediately instead of from the chat buttons. | `false` |
| `--resistAttr`, `--vulnerableAttr`, `--immunityAttr` | Attribute(s) listing the target's resistances, vulnerabilities and immunities. | `npc_resistances`, `npc_vulnerabilities`, `npc_immunities` |
| `--resistanceRule`, `--vulnerableRule` | Operation applied for a resistance / vulnerability. Immunity always applies `*0`. | `*0.5`, `*2` |
| `--resource` | `attrName, cost, alias, limit` — spend a resource (e.g. a spell slot) of the caster; the AoE is blocked if there is not enough. Without a limit the value counts **down** (slots left, as on the 2014 sheet). With a limit it counts **up** (slots used) and may not pass the limit: a number, `max` (the resource's own max) or another attribute, e.g. `lvl3_slots_expended, 1, Level 3 slots, lvl3_slots_total` on the 2024 sheet. | Cost `1` |

### Markers

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--conditionFail` | Marker(s) added to targets that fail their save. `@#` adds a number badge. | None |
| `--conditionPass` | Marker(s) added to targets that pass their save. | None |
| `--zeroHPmarker` | Marker(s) added when the last bar in `--bar` reaches 0, and removed when it is healed above 0. | None |
| `--removeAtZero` | Remove the token from the map when the last bar in `--bar` reaches 0. | `false` |
| `--casterCondition` | `marker` (always) or `marker, onFail` (only if at least one target fails) — added to the caster. | None |

Default Roll20 markers are referenced by name (`dead`, `skull`, `red`). Custom token markers need their full `name::id` tag (TokenMod's help handout lists them).

### Chat card

| Parameter | Values | Default |
| :-------- | :----- | :------ |
| `--title`, `--leftSub`, `--rightSub` | Card title and subtitles. | `SmartAoE` |
| `--desc` | Description at the bottom; `%br%` makes a line break. | None |
| `--hideNames` | Show targets as `Target_1`, `Target_2`… | `false` |
| `--whisperAll` | Whisper the whole card (to the player who cast it). | `false` |
| `--whisperResults` | Whisper only the save and damage results. | `false` |
| `--chatAvatarsEnabled` | Set `false` if chat avatars are turned off, to fix the card margin. | `true` |
| Styling | `--titleCardBackground`, `--titleFontFace`, `--titleFontColor`, `--titleFontSize`, `--titleFontLineHeight`, `--titleCardBottomBorder`, `--subtitleFontFace`, `--subtitleFontColor`, `--subtitleFontSize`, `--bodyFontFace`, `--bodyFontSize`, `--tableBGColor`, `--tableBorder`, `--tableBorderRadius`, `--tableShadow`, `--evenRowBackground`, `--oddRowBackground`, `--evenRowFontColor`, `--oddRowFontColor` | See the wiki |

---

## Examples

20 ft cube that floats freely:

```text
!smartaoe {{
  --aoeType|square, float
  --radius|10ft
}}
```

5e cone that can be rotated around the caster:

```text
!smartaoe {{
  --aoeType|5econe
  --radius|30ft
  --minGridArea|0.25
  --origin|nearest, face
}}
```

Ice Storm with a DEX save, damage applied from the chat card and a 0 HP marker:

```text
!smartaoe {{
  --aoeType|circle, float
  --radius|20ft
  --dc|@{selected|spell_save_dc}
  --saveFormula|5eDEX
  --damageFormula1|[[(?{Cast at what level?|4}-2)d8]]
  --damageType1|bludgeoning
  --damageFormula2|[[4d6]]
  --damageType2|cold
  --bar|1
  --zeroHPmarker|dead
  --fx|burst-frost
}}
```

Healing (no save). Roll20 can't start an inline roll with a negative number, hence the `0 +`; a plain number such as `--damageFormula1|-5` needs no workaround:

```text
!smartaoe {{
  --aoeType|circle, float
  --radius|15ft
  --noSave|true
  --damageFormula1|[[0 + [[0 - 2]]d6]]
  --autoApply|true
}}
```

---

## Integration with other scripts

Other Mod scripts can react to the changes SmartAoE makes to tokens (bar values, markers, snapping to the grid). Roll20 does not raise `change:graphic` for changes made by a script, so this is the only way to see them:

```js
on('ready', () => {
  if (typeof SmartAoE !== 'undefined' && SmartAoE.ObserveTokenChange) {
    SmartAoE.ObserveTokenChange((token, prev) => {
      // token: the changed graphic; prev: a plain-object copy of its values before the change
    });
  }
});
```

When SmartAoE applies damage with a 0 HP marker, it adds the marker first and then changes the bar, notifying observers after each step.

`SmartAoE.ZeroHPMarkers()` returns the marker tags SmartAoE has used as `--zeroHPmarker` since the sandbox started, including those of `--instant` AoEs (which are deleted before their damage is applied):

```js
const smartAoeZeroHpTags = (typeof SmartAoE !== 'undefined' && SmartAoE.ZeroHPMarkers) ? SmartAoE.ZeroHPMarkers() : [];
```

**HealthColors** (2.4.0+) uses both: the observer hook to re-colour tokens, and `ZeroHPMarkers()` to leave the 0 HP marker to SmartAoE instead of adding its own.

---

## Jumpgate

SmartAoE's saves, damage and markers work in Jumpgate games, but there is a known **layering problem**: the AoE squares can appear on top of the control token and the tokens inside the AoE, making them hard to select. Roll20 staff traced this to Jumpgate not passing "send to back" changes made by Mod scripts to the browser ([forum report](https://app.roll20.net/forum/post/12193888/script-smartaoe-anyone-using-it-in-a-jumpgate-campaign-successfully)). It has to be fixed by Roll20; a script cannot work around it directly.

Workarounds reported on the forums:

- **Draw the AoE on the map layer:** add `--aoeLayer|map` to your `!smartaoe` macros. The squares then sit below all tokens. Players confirmed this works for circles and lines ([forum thread](https://app.roll20.net/forum/post/12349884/smartaoe-controltoken-spawns-behind-its-colored-squares)). In a legacy (non-Jumpgate) game, test it first: the AoE may end up behind the map image.
- **Refresh the browser**, or select the squares and use *To Back*, after the AoE is placed.
- **Triggering:** clicking the control token often selects one of the squares on top of it instead. `!smarttrigger` (and the **Trigger-ALL** token action) now accepts that: a selected square triggers its own AoE.

### D&D 2024 (Beacon) sheets

The 2024 (Beacon) D&D sheet doesn't store its data as attribute objects. When SmartAoE can't find an attribute the 2014 way, it reads the sheet with Roll20's `getSheetItem`, then tries the custom-attribute form `user.<name>`. This covers `--resource`, `a{…}` references in `--saveFormula` (and the `5eSTR`…`5eCHA` shorthands), `--resistAttr` / `--vulnerableAttr` / `--immunityAttr` and `--ignore`.

- Use the **Mod Script Sandbox v1.5** (the current default). On v1.0, `getSheetItem` can't see Beacon values.
- **Spell slots count up on the 2024 sheet.** `lvl3_slots_expended` holds slots *used* (on the 2014 sheet it holds slots left), so give `--resource` the total as a limit: `--resource|lvl3_slots_expended, 1, Level 3 slots, lvl3_slots_total`. Without the limit SmartAoE subtracts, and with 0 slots used it always says there aren't enough.
- A `--resource` on a Beacon sheet is spent with `setSheetItem`. If the sheet doesn't let scripts change that value, the AoE isn't created and the GM is told why.
- 5e Magic Resistance (save rolled twice) is only detected on 2014 sheets.
- The names must exist on the 2024 sheet. If a value still comes out empty, check the name with a chat roll such as `[[@{selected|dexterity_save_bonus}]]`.

---

## Tips & known limitations

- Fixed-radius squares and circles that are **attached** to the caster (no `float`) don't account for token size and are only accurate for one-square casters.
- Resistance handling is simple: conditional resistances such as "non-magical piercing" aren't recognised.
- Very large AoEs with `--fx` can lag. This is a Roll20 limitation.
- Pathfinder cone and circle templates follow their own grid rules, so use `PFcone` and `PFcircle`.
- If the stored AoE links get out of step with the map (e.g. after copying pages), run `!smartclearcache`. (Trigger-Target no longer stops with a "Cannot read properties of undefined" error because of a stale AoE, but clearing the cache tidies up.)
- **Line lengths** are measured with true (Euclidean) distance, so diagonal lines cover fewer squares than 5e's "every square counts as 5 ft" rule would give. For an exact count, leave out `--radius` and place the control token by hand.
- **Line origins** for casters larger than one square start from the token's centre or nearest corner/face (`--origin`), not from the edge facing the target.
- When SmartAoE is called by another script (ScriptCards, etc.), the call has no selected token and a generic player id. Install **SelectManager** and run `!smconfig +playerid` once, or pass `--selectedID` and `--playerID`.

---

## Development

- The code follows conventions such as: `'use strict'`, section headers, a JSDoc block on every function, one handler per chat command (see `COMMAND_HANDLERS`), and Prettier formatting with the bundled `.prettierrc`.
- Run through [TESTING.md](TESTING.md) in a live game before a release, and copy the root `SmartAoE.js` into the matching version folder (e.g. `1.0.0/`).

---

## Credits

Original Author: David M. ([djmoorehead](https://github.com/djmoorehead)) · [Patreon](https://www.patreon.com/djmoorehead)  
Refactored and Modernized for v1 by MidNiteShadow7.

See [CHANGELOG.md](CHANGELOG.md) for version history.
