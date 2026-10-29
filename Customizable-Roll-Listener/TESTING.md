# Customizable Roll Listener — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover message analysis and matching (crits, fumbles, dropped dice, custom ranges, success targets, totals, natural results, text, `##` at any index, rollable tables, `/roll` results, filters), command and version 1 parsing, placeholders, and end-to-end scenarios against a stubbed Roll20 API: startup, the version 1 upgrade, restoring after a game copy, creating, editing and triggering listeners, bad input, permissions, delete, order and stop, cooldown, loop protection, listening to other mods, the inspector, `test`, Journal edits, useroptions and the public API.

They cannot check what real sheets and Beacon send, chat rendering, or Roll20's handling of `@{}` and `%{}`, so run the checklist below in real games before release.

---

## Test Games

| Game         | Engine / sandbox               | Needed for                                    |
| ------------ | ------------------------------ | --------------------------------------------- |
| **Jumpgate** | Jumpgate, Experimental sandbox | Everything below, including the Beacon tests  |
| **Legacy**   | Legacy, Default sandbox        | The version 1 upgrade, classic roll templates |

Each game needs:

- A character using **D&D 5E by Roll20 (2014)**, with an attack and a skill.
- In the Jumpgate game, a character using **D&D 2024** (Beacon).
- A rollable table **Encounters** with an item **Combat**.
- Optionally a player account and **Roll20 Audio Master** or another mod to call.

For the upgrade test, install version **1.1** in the Legacy game first (paste `1.1/CRL.js`), then:

```
!crl \\create,name=Crit,template=atkdmg,roll=critical \\/em CRIT!
!crl \\create,name=Named,text=Longsword \\/em swings
!crl \\create,name=Fumble,text=r1=##,roll=fumble \\/em fumble
```

Roll a few attacks and note which listeners fire (expect "not parseable" in the API console). Then replace the script with version 2.

---

## Setup

- [ ] Install `CRL.js` and save. The API console shows `-=> Customizable Roll Listener v2.0.0 … <=-` with no errors.
- [ ] The GM receives the "Customizable Roll Listener is ready." whisper.
- [ ] The Journal has **Customizable Roll Listener - Help** and **Customizable Roll Listener - Command Deck**, neither visible to players.
- [ ] The **Customizable Roll Listener** character exists, is archived, and its bio explains what it is.
- [ ] Every button in the Command Deck works.

## Upgrade from Version 1

- [ ] The ready whisper says the listeners were upgraded, and the main menu is shown.
- [ ] Crit, Named and Fumble appear in `!crl`, switched on, with their commands.
- [ ] Each ability's description now starts with `{"crl":2`.
- [ ] Crit fires on a natural 20 attack and not on a 19. No "not parseable" in the console.
- [ ] Named fires on Longsword attacks only, whatever the case of the text.
- [ ] Fumble fires on a natural 1 on the attack roll only.
- [ ] `!crl \\set,listen=off` turns listening off; `!crl \\config` shows the menu.

## Menus and Commands

- [ ] **New Listener** asks for a name and shows the new listener's card.
- [ ] Every **Change** button on the card prompts and saves; empty answers clear the field.
- [ ] **Set Commands** with `!roll20AM --audio,play|Crit \\ /em crits` saves two lines.
- [ ] **Open in Journal** opens the store character.
- [ ] **Test** runs the commands. **Rename** renames the ability too.
- [ ] **Delete** asks first, then removes the listener and its ability.
- [ ] ▲ / ▼ change the order; **Turn Off** / **Turn On** switch a listener.
- [ ] Settings: each setting changes; language shows a list of languages.
- [ ] `!crl new X --commands /em finds [[1t[Encounters]]]` keeps the inline roll in the ability.
- [ ] Bad input (`!crl edit X --total abc`, `!crl frobnicate`, `!crl \\foo`) whispers an error and the sandbox keeps running.
- [ ] A player typing `!crl` is told it is GM only.

## Matching (D&D 5E 2014)

- [ ] `--results crit`: fires on a natural 20 attack, not on maximum damage dice; not on a 20 dropped by disadvantage; fires on a kept 20 with advantage.
- [ ] `--results fumble`: fires on a natural 1.
- [ ] `--templates atkdmg` vs `--templates simple`: only the matching rolls fire. The inspector shows each template's name.
- [ ] `--who Alice`: fires for Alice's rolls, including NPC-style templates showing the character name.
- [ ] `--text Combat`: fires on `/r 1t[Encounters]` and on a template showing the table result.
- [ ] `--total >=20 --text dmg1=##`: fires only when damage is 20 or more.
- [ ] `/r 1d20>15` with `--results success` and `--results fail`.
- [ ] `/em waves` with `--types emote --text waves`.
- [ ] `--speaker roller`: `/em` lines appear as the character who rolled.
- [ ] Placeholders: `/em ${character} rolled ${total} with ${field:rname}`.
- [ ] `--cooldown 10` waits ten seconds between triggers. `--stop on` stops later listeners.
- [ ] A ScriptCards or Group Check output triggers listeners with **Listen to Other Mods** on, and not with it off.
- [ ] A listener whose commands trigger itself (`--text hello --speaker roller --commands /em hello`) is switched off with a warning.

## Beacon (D&D 2024, Jumpgate, Experimental sandbox)

- [ ] **Inspect Next Message**, then roll an attack, a save and a skill from the 2024 sheet. Record what the inspector shows (type, speaker, template, fields, rolls, text) in the results below.
- [ ] `--results crit` fires on a natural 20 attack from the 2024 sheet.
- [ ] `--who <character>` and `--text <attack name>` match 2024 rolls.
- [ ] Note anything the 2024 sheet sends that CRL cannot see.

## Copying a Game

- [ ] Copy the Jumpgate game. In the copy, start the sandbox: the ready whisper says the listeners were restored, and they fire as before.

## Results

| Date       | Game                 | Engine / sandbox | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | -------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-29 | Steve's CRL Test 1   | Jumpgate, v1.5   | Startup, main menu, help, settings, `!crl new`, inspector on `/r`, `test` and `delete … confirm` work. Listener card was dropped by Roll20: its hint text contained `@{...}`/`%{...}`, which `sendChat` tries to resolve. Fixed by encoding Roll20 syntax in all chat text; needs rechecking.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-10-29 | Steve's CRL Test 1   | Jumpgate, v1.5   | Listener card now arrives whole after the escaping fix. D&D 2024 STR and DEX checks inspected: type `advancedroll`, no inline rolls, HTML card (`<rolltemplate class="dnd-2024 dnd-2024--roll">`) with character, title, `data-result` total and `rt-formula` natural die. Beacon parsing added (tests/fixtures/dnd2024-check.html); attacks, damage and advantage not yet captured — sheet attack clicks did not roll from the browser pane.                                                                                                                                                                                                                                                                                               |
| 2026-10-29 | Steve's CRL Test 1   | Jumpgate, v1.5   | 2024 checks read live (template `dnd-2024`, character, total, natural). Messages also carry `msg.rolls` (inline-roll shaped, with `isCrit`/`isFumble`), `characterId`, `action`, `secrecy`; CRL now uses `msg.rolls`. Attack/advantage/damage cards still not captured.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-10-29 | Steve's CRL Test 1   | Jumpgate, v1.5   | 2024 attack (Kekha Greataxe: subcategory Attack, Base 1d20, `action.args` [id, attack]) and damage cards (subcategory Damage, roll named by ID, `1d12+3`, args end `dmg`) read correctly. Damage cards excluded from auto crits. Advantage still not captured (sheet mode buttons could not be clicked from the browser pane).                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-10-29 | Steve's CRL Test 1   | Jumpgate, v1.5   | Advantage captured: `2d20kh1`, dropped die `d: true`, card mode `Advantage`; CRL uses the kept die. Listener `--templates dnd-2024 --text attack` fired on a live Greataxe attack with placeholders filled (`total 10, natural 5, Advantage`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-10-29 | Curse of Strahd Copy | Legacy, v1.5     | Real version 1 upgrade: 47 listeners (sounds, crit/fumble tables, weather, saves, conditions) converted with templates, text, `##` + crit/fumble and multi-line `%{…}` commands intact. Found: cards whose commands or inspector data spanned lines leaked every line after the first into public chat (Roll20 whispers only the first line); fixed and rechecked. D&D 5E 2014 (sheet 4.21): NPC attacks are `npcfullatk`, PC attacks `atkdmg` (advantage as separate `r1`/`r2` rolls), spells `spell`, slot use `simple`. Crit via `cs` range, damage dice ignored by `--dice auto`, `--who`, `dmg1=##` + `--total`, placeholders, `--speaker roller` (character from the template name), cooldown, `/r` success/fail and emotes all work. |
