# Concentration — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover settings validation, the version 1.0 upgrade, One-Click useroptions, spell detection on both sheets, and end-to-end scenarios against a stubbed Roll20 API with controllable dice: starting, switching and ending concentration (including the end messages), hand-made marker changes, saves and DCs, advantage, 0 hit points, Roll and Advantage buttons and who may press them, linked and unlinked tokens, player permissions, Send Reminder To, status, reset and escaping. They cannot check real sheets, Beacon chat output, rendering or what players see, so run the checklist below before release.

The Playwright suite in `playwright-tests` (`tests/mods/concentration.spec.ts`) runs the main checks live in Mod Test Lab.

---

## Test Games

| Game                      | Sheet                       | Needed for                                    |
| ------------------------- | --------------------------- | --------------------------------------------- |
| **Mod Test Lab** 22172105 | D&D 2024 (Beacon), Jumpgate | Everything below except the 2014 sheet checks |
| A 2014 sheet game         | D&D 5e by Roll20 (OGL)      | 5e OGL spell detection and modifier lookup    |

Mod Test Lab has the four 2024 PCs (linked `hp` bars, Seraphina controlled by "Test Player") and Goblin Warriors with unlinked bars. Check each PC's sheet has its hit points first: bar bubble edits only sync when the sheet's Current HP is set.

For the upgrade test, install `1.0.0/Concentration.js`, change some settings (marker `purple`, Auto Roll Save off), give a character advantage and mark a token, then replace the script with 1.1.0.

---

## Setup

- [ ] Install `Concentration.js` and save. The API console shows `-=> Concentration v1.1.0 … <=-`.
- [ ] On a new game the GM gets "Concentration is ready." and the settings card; on later restarts only the greeting.
- [ ] The Journal has **Concentration - Help** and **Concentration - Command Deck**, neither visible to players. Every Deck button works.

## Concentrating

- [ ] Select Atala, `!concentration Web`: the marker goes on, "Atala Dumein is now concentrating on Web."
- [ ] `!concentration Hold Person`: "stops concentrating on Web and is now concentrating on Hold Person."
- [ ] `!concentration` again: marker off, "is no longer concentrating on Hold Person." Nothing says "now concentrating".
- [ ] Put the marker on by hand in the token's marker menu: "is now concentrating." Take it off: "is no longer concentrating."
- [ ] A second Atala token on another page gets and loses the marker with the first.
- [ ] Two goblins: concentrating with one does not mark the other.
- [ ] Changing other markers on a concentrating token changes nothing.

## Saves

- [ ] Type `-3` in a concentrating PC's HP bubble: a Concentration Save card (DC 10, modifier from the sheet) says kept or lost; a failure takes the marker off.
- [ ] `-30`: DC 15. Healing (`+5`) does nothing.
- [ ] Drop a PC to 0 HP: "drops to 0 hit points and loses concentration on …", no save. With End at 0 HP off, a save is rolled instead.
- [ ] Advantage Menu: turn Orkira on, damage her: two dice, the higher kept.
- [ ] Auto Roll Save off: the reminder has Roll and Advantage buttons; each works once; a second press says the button expired.
- [ ] As Test Player: Seraphina's buttons roll; Atala's buttons are refused and still work for the GM.

## Spell Detection

- [ ] D&D 2024 sheet: cast Bless (concentration) from Orkira's sheet: marker on, "now concentrating on Bless". Cast a non-concentration spell: nothing.
- [ ] Casting a different concentration spell switches. Casting the same one again repeats the start message.
- [ ] 2014 sheet: the same with the `spell` template.
- [ ] Debug Mode on: each cast writes a `[Concentration v1.1.0] Spell detection` line; Support Mode Detailed writes more.

## Who Sees It

- [ ] Send Reminder To **Character**: Seraphina's messages and saves are whispered to Test Player and the GM; Atala's (no player) to the GM.
- [ ] **GM**: everything whispered to the GM only.

## Players

- [ ] Test Player selects Seraphina and runs `!concentration Hex`: works. With Atala selected: refused.
- [ ] Test Player runs `!concentration config debug|true`: "Only the GM can use that command."

## Settings

- [ ] Every settings button changes its value and the card comes back with "… is now …".
- [ ] Status Marker to a custom token marker: concentrating tokens swap markers.
- [ ] HP Bar to 2: damage on bar 2 is seen without a restart.
- [ ] Command to `conc`: `!conc` works, `!concentration` does not, handouts' buttons use `!conc`.
- [ ] Language to German and Hebrew: cards and handouts translated; Hebrew right to left. Back to English.
- [ ] `reset` asks first; `reset confirm` restores defaults and keeps who is concentrating.

## Upgrade from 1.0

- [ ] Settings and advantage kept; "Upgraded from version 1.0" in the greeting; marked tokens listed by `status` (without a spell); no settings card.

## Other Mods

- [ ] A ScriptCards or TokenMod-sent `!concentration end <character id>` works.
- [ ] `Concentration.spellOf(tokenId)` from another Mod returns the spell.
