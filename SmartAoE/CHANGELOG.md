# SmartAoE Changelog

All notable changes to this project will be documented in this file.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Dates for 0.25–0.30 are the dates each version was added to the Roll20 One-Click repository.

## [1.0.0] – 2026-10-25

First 1.0 release: SmartAoE has been stable on the One-Click library since 0.25, so this version marks it as released. There are no breaking changes; existing macros and AoEs work as before.

The author's GitHub repository also has an unreleased **0.31 "Jumpgate compatibility beta"** (May 2025) that draws AoEs as `pathv2` objects on the Foreground layer. It never reached the One-Click library and is **not** included here: users reported it did not resolve their errors, and it contains unfinished code (debug logging, a Trigger-Target precision regression). The README's Jumpgate section describes the current workarounds.

### Added

- **Help handout** — a GM-only **SmartAoE — Help & Reference** handout is created in the Journal and rebuilt every time the script loads: overview, quick start, commands, all `!smartaoe` parameters (grouped), example macros, the integration API and tips. `!smarthelp` rebuilds it and whispers a link. Its colours read in both Roll20 light and dark mode.
- **`--resource` limit (count-up resources).** An optional fourth value, `--resource|attrName, cost, alias, limit`, makes the resource count uses up to the limit instead of counting down to 0. The limit is a number, `max` (the resource's own max) or another attribute. The D&D 2024 sheet needs this for spell slots: `lvl3_slots_expended` counts slots used, so use `--resource|lvl3_slots_expended, 1, Level 3 slots, lvl3_slots_total`. Without a limit `--resource` works as before.
- `TESTING.md` — a manual test checklist for live games, and a `.prettierrc` / `.gitignore` matching HealthColors.
- `SmartAoE.ZeroHPMarkers()` — public function returning the marker tags used as `--zeroHPmarker` this session (kept after an AoE is deleted, including `--instant` AoEs, which are removed before their damage is applied), so other scripts can recognise SmartAoE's 0 HP markers.
- Errors caught by the chat handler are also logged with their stack trace in the API console, so a line number is available for diagnosis.
- README: Jumpgate section (layering problem and the `--aoeLayer|map` workaround), 2024-sheet note, and more known limitations collected from the Roll20 forums.

### Changed

- **Code refactored to the HealthColors standard** (no change to how AoEs are drawn or resolved):
  - header banner with authors and a `/* global */` list; `'use strict'`; code grouped under section headers (Constants & state, Observers, Utilities, Chat card output, Saves & inline rolls, Install, AoE links, Tokens & paths, Geometry, Map updates, Event handlers, Roll parsing, Damage & markers, Results output, Help handout, Chat commands, Bootstrap);
  - a JSDoc block on every function;
  - the ~1,400-line chat handler split into one handler per command (`handleCreateAoeCommand`, `handleTriggerCommand`, `handleQueryCommand`, …) driven by a `COMMAND_HANDLERS` table;
  - 35 variables that were never declared, and so leaked into the shared Mod sandbox as globals (`pageGridIncrement`, `originX`, `i`, …), are now declared inside SmartAoE; `var` replaced by `let`/`const`;
  - about 600 lines of commented-out code and four functions that were never called removed; formatted with Prettier (the same `.prettierrc` as HealthColors).
  - The comment-only and formatting steps were checked to leave the parsed code identical; the structural steps were checked with ESLint (no undefined variables), the test suites and a live game.
- **Duplicate and dead code removed** (about 1,400 fewer lines, with no change in behaviour):
  - circles, squares, walls and cones share one cell-clipping routine (`getCoveredCells`) instead of four near-identical copies of about 300 lines each; each shape now only supplies its inside test and edge crossings;
  - the 56 abilities of the `AoEControlToken` character come from one table (`CONTROL_TOKEN_ABILITIES`) instead of 56 separate `createObj` blocks;
  - roll results for damage rolls and targets are formatted by one function (`attachRollResults`) instead of two inline copies;
  - the chat commands find the caller with one `getCaller` helper instead of seven copies of the same block;
  - the chat card's alternating row colours, P/F badge and damage cell are each built in one place;
  - `get5eConePt` (a copy of `getConeEndPt`), `processInlinerolls`, `sendChatNoarchive` and `processDamageMessages` (unused) removed, and `processInlinerolls2` renamed `substituteInlineRolls`;
  - `clearCache` only ever cleared everything, so it is now `resetLinks()`, which install also uses; `makeAoELink` takes the single path id it is always given; the flat-cone angle test spells out the short-way-round angle;
  - unused parameters, variables and return values removed throughout (for example the `obj` parameter of `updateMapWithAoE` and the `hideformula` flags of the chat-card rows).
  - Checked by comparing the old and new code: 28,500 random shape calculations give the same squares, and seven end-to-end scenarios in a mocked game (every shape, saves, resistances, apply buttons, markers, origin rotation, token moves, query, remove, clear-cache) give identical chat output, objects and state.

### Fixed

- **D&D 2024 (Beacon) sheets** ([forum report](https://app.roll20.net/forum/post/12842711/script-update-smartaoe/?pageforid=12843607#post-12843607)). SmartAoE only read legacy attribute objects (`findObjs` / `getAttrByName`), which Beacon sheets don't use, so on a 2024 sheet:
  - `--resource` always said the resource was not found;
  - `a{…}` / `@{…}` references in `--saveFormula` (and the `5eSTR`…`5eCHA` shorthands) became empty, so saves were a bare d20;
  - `--resistAttr` / `--vulnerableAttr` / `--immunityAttr` were never found, so targets took full damage;
  - `--ignore` never matched.

  These now fall back to Roll20's `getSheetItem` (and `user.<name>` for custom attributes) when no legacy attribute is found, and a Beacon resource is spent with `setSheetItem`. If the sheet refuses the change, the AoE isn't created and the GM is told why. 2014-sheet games keep using the attribute objects as before. Magic Resistance detection still needs legacy attributes.
- **Commands with nothing selected (or the wrong thing selected) no longer throw.** `!smarttrigger` on a token that isn't part of an AoE, `!smartquery` and `!smartrotateorigin` with nothing selected, and `!smartremove` with an unknown id now whisper what to do instead of "Cannot read properties of undefined". A target whose character no longer exists is skipped instead of breaking the whole trigger.
- **An AoE with no `--saveFormula` and no `--noSave` no longer does nothing when triggered.** Each target sent an empty roll that Roll20 never answered, so no card was posted and no damage applied, with no error. It is now treated as no save: every target takes full damage. Found during live testing.
- **`--noSave|false` no longer breaks saves.** The `noSave` option had no `break`, so it fell through into `saveFormula` and set the save formula to the text `false`.
- **Explicit colours from other scripts are kept.** When another script called SmartAoE with `--playerID`, `if (getFillColor = true)` (an assignment, not a comparison) always replaced the `--aoeColor` / `--aoeOutlineColor` it passed with the player's colour.
- Names containing a backtick no longer break the chat-card apply buttons (the escape used a regular expression as the replacement text).
- A zero-length wall segment no longer produces `NaN` distances (a lowercase `p` was used for the point `P`).
- `applyMathRule` with an unknown operator returns the value unchanged instead of the previous call's result.
- **`--damageFormula2` now works with plain numbers and in every combination.** A plain number in formula 2 overwrote formula 1's damage, and formula 2 was only rolled when *both* formulas were inline rolls, so a number + roll, roll + number or number + number pair silently lost formula 2. Each formula is now rolled independently, whether it is a number or a roll.
- **Formula 2 shows on the chat card without formula 1.** The card only showed damage when formula 1 had a result; it now shows every damage roll with a non-zero result.
- **Negative plain-number damage (healing)**, e.g. `--damageFormula1|-5`, is now rolled as `[[0 - 5]]`, because Roll20 can't start an inline roll with a negative number. A non-numeric plain value counts as 0 instead of producing a broken `[[NaN]]` roll.
- **Arithmetic and grouping in inline damage rolls**, e.g. `--damageFormula1|[[2*13d6]]` ([forum report](https://app.roll20.net/forum/post/11924759/help-smartaoe-refuses-to-recognise-star-as-a-multiplier-any-ideas)). libInline HTML-encodes roll expressions, and SmartAoE only decoded `[` and `]`, so the formula was re-rolled as `[[2&#42;13d6]]` and dealt `2` damage. `*`, `{…}` groups, `>`/`<` comparisons and quotes now survive.
- **Trigger-Target no longer breaks because of a stale AoE.** If any AoE on the page referred to a square that had been deleted (by hand, by copying pages, etc.), `!smartquery` / Trigger-Target stopped with "Cannot read properties of undefined (reading 'get')" for every target ([reported several times](https://app.roll20.net/forum/post/10485883/script-smartaoe-graphical-interface-for-implementing-aoes-on-gridded-maps/?pagenum=16); the workaround was `!smartclearcache`). Missing squares are now skipped, and an unknown target token or page is handled cleanly.
- **`!smarttrigger` in Jumpgate:** the AoE squares sit on top of the control token in Jumpgate ([forum](https://app.roll20.net/forum/post/12193888/script-smartaoe-anyone-using-it-in-a-jumpgate-campaign-successfully), [forum](https://app.roll20.net/forum/post/12349884/smartaoe-controltoken-spawns-behind-its-colored-squares), [forum](https://app.roll20.net/forum/post/12400598/smartaoe-and-jumpgate)), so clicking the control token often selects one of the squares instead, and the trigger then failed with "Cannot read properties of undefined (reading 'get')". A selected AoE square now triggers its own AoE. Found in live testing.
- **`!smarttrigger <controlTokenID>`** without a target id crashed the same way; it now triggers everything in that AoE. An unknown target id, or nothing usable selected, now gets a clear message instead of an error.
- **`--removeAtZero` now removes tokens.** The 0 HP check compared the array of new bar values to `0`, which is never true, so no token was ever removed (broken since 0.25). It now checks the last bar in `--bar`, the same test `--zeroHPmarker` uses; a temporary-HP bar reaching 0 does not remove the token.
- **"(@Max)" healing note now appears.** The healed message compared two arrays (`newHP===maxHP`), so the note was never shown. It now appears when every healed bar is at its max.
- **Healing that cascades to a second or third bar** now passes on only the leftover healing; before, each later bar received the full heal amount. A heal also no longer lowers a bar that is already above its max (e.g. temporary HP) down to the max.
- **Adding status markers** (`--conditionPass`, `--conditionFail`, `--zeroHPmarker`, `--casterCondition`, chat-button markers):
  - markers in a list are no longer skipped (items were removed from the list while it was being looped over);
  - an existing marker is matched by its whole tag, so `red` no longer counts as present because of `red@2` or `redbeard`;
  - a marker repeated in the list is added once;
  - no stray leading or trailing comma is left in the token's `statusmarkers`;
  - observers (`ObserveTokenChange`) are only notified when a marker was actually added.
- **Removing status markers** now removes markers that carry a number badge (`skull@3` is removed by `skull`) and ignores spaces after commas; observers are only notified when something was removed.
- Adding or removing markers on a token that no longer exists no longer throws.
- **Squares at the edge of an AoE are no longer missed when the origin is off-centre.** For circles, squares and cones from a corner or face of a large token, the area searched for covered squares was shifted by the origin offset, and the vertical offset and size were ignored. Edge squares could be left out. The search now covers the whole shape.
- **A circle smaller than one square now covers that square.** A small circle sitting inside a square never crosses its edges, so no square was marked and the AoE was empty.
- **Two AoEs from the same caster post separate cards.** When a caster's AoEs were triggered together, each card also included the earlier AoEs' damage rows and targets.
- **`!smartrotateorigin` redraws only the AoE it rotates.** It redrew every AoE linked to the token with that AoE's offset, and it no longer throws if the caster token has been deleted.
- **Control token sides:** `--controlTokSide` accepted any number because of an `||` that should have been `&&`, then failed on a side that didn't exist. An invalid side is now reported, and the AoE stops instead of crashing.
- **Deleting old squares no longer clears the AoE being created.** `deleteLinkedPaths` reused the shared `path` variable that AoE creation was still using.
- **Damage maths uses numbers.** Roll results are arrays, so a rule such as `+2` joined them as text (`[5] + 2` gave `52`), and a line with two rolls compared as `NaN`. Damage now uses the line's total and a save uses its first roll. In normal use SmartAoE passes one roll per line, so this is a safeguard.
- `!smartpinggm` / `!smartpingall` are matched properly (the old pattern was a character class, not "gm or all"), and only one command runs per chat message.
- Smaller fixes: a direction between two identical points is 0 instead of `NaN`; control points at angles outside 0–360° are calculated instead of undefined; colours have every non-hex character stripped, not just the first; the collections macro is skipped with a log line if no GM is found, instead of throwing; whispers from token spawning quote the player's name; `&` used where `&&` was meant; and more variables are now local to their functions instead of shared.
- **Startup error reporting:** if creating the default `AoEControlToken` character or `AoEGenerator` macro failed, the error handler itself threw a `ReferenceError` (`charName` was declared inside the `try` block), hiding the real error. The real error is now logged.

## [0.30] – 2024-04-12

### Fixed

- Corrected the names of the `15ft-PF-Circle-Caster` and `20ft-PF-Circle-Caster` abilities on the default `AoEControlToken` character (previously `…-PF-PF-Circle-Caster`).

## [0.29] – 2023-11-20

### Added

- `--aoeLayer` — draw the AoE on the token (`objects`), GM or map layer.
- `--casterCondition` — apply a status marker to the caster, always or only when at least one target fails its save (`marker, onFail`).
- `--affectsCaster` — allow the caster's own token to be affected by the AoE.
- `--outlineOnly` — draw the AoE outline without a fill.

## [0.28] – 2022-11-21

### Added

- Sound effects: `--spawnSound`, `--moveSound`, `--triggerSound` and `--deleteSound` play jukebox tracks when the AoE is spawned, moved, triggered or deleted.
- Whisper options: `--whisperAll` (whisper all output) and `--whisperResults` (whisper only save and damage results).
- `--turnorder` — add a turn-order entry for the AoE (`name, value, formula, linked`), optionally linked to the control token.
- `--tooltip` — set a tooltip on the control token.

### Fixed

- Bug fixes (not itemised in the release).

## [0.25] – 2022-02-14

### Added

- Initial Roll20 One-Click release.
- `--resource` — deduct a resource (e.g. a spell slot) when the AoE is cast, blocking the AoE if there is not enough.

Earlier versions (including 0.21, which began creating the `AoEControlToken` character automatically) were distributed through the [Roll20 forum thread](https://app.roll20.net/forum/post/10485883/script-smartaoe-graphical-interface-for-implementing-aoes-on-gridded-maps/?pageforid=10485883#post-10485883).
