# LazyExperience — Testing Guide

## Automated tests

```bash
npm run build -- --no-bump
npm test
```

`tests/lazyexperience.test.mjs` covers:

- commands and aliases
- the split (absent share, bonus, extra shares, remainder)
- payout modes, undo and the Roll20 party
- defeats (bar, linked attribute, marker, TokenMod, DeathTracker, prompt and automatic modes)
- level-ups
- the D&D 2024 and 2014 sheets, sandbox 1.0, migration from 0.1.14, settings, One-Click options, escaping and every card

`tests/systems.test.mjs` covers each game-system profile, and `tests/tracks.test.mjs` the Pathfinder 1E track setting (single tracks, tracks by level, `sheet`, the next-level box on both Pathfinder 1E sheets, Starfinder's box, `show` and the settings card).

The stub keeps an `attr_<name>_max` sheet field as the max of `<name>`, as Roll20 does.

The tests run against a stubbed Roll20 API. Beacon sheets are faked, so check the live list below in a real game before release.

## Test game

**Mod Test Lab - LazyExperience** (22183309) is a copy of Mod Test Lab: Jumpgate, Mod sandbox v1.5, D&D Fifth Edition (2024) sheet. It has four 2024 PCs, one of them (Seraphina) controlled by Test Player, and 2024 monsters (Goblin Warrior, Ogre, Lich and others). TokenMod is installed. The build is installed as the Mod script "LazyExperience v1 Test".

The tests were driven with the playwright-tests harness on copied browser profiles (GM and Test Player).

## Playwright spec — 6 November 2026

`tests/lazyexperience/lazyexperience.spec.ts` in the playwright-tests project repeats the main live checks in the test game's Battle Map page. Each test starts from the default settings, an empty session and the four PCs in Roll20's party, and puts every page back afterwards.

```bash
ROLL20_GAME_ID=22183309 npx playwright test tests/lazyexperience
```

All 12 passed. The milestone-mode test was removed with the feature, leaving 11:

1. `!lazyxp` opens the menu, and `!xp` is an alias.
2. Add XP asks for the XP and a reason and splits it between the party.
3. A creature typed down to 0 HP prompts the GM, and Add puts its XP in the session.
4. TokenMod setting HP to 0 is noticed, and Ignore adds nothing.
5. The dead marker counts as a defeat once only.
6. Other Amount adds the XP typed in.
7. An absent character gets no share, and bonus XP goes to one character.
8. Undo takes back the last award.
9. End Session writes the 2024 sheets, announces the session and whispers Test Player. The XP is then taken off again with a negative `give`.
10. A settings button makes defeats add their XP straight away.
11. The Party card's Share button sets a half share.

The game is slow for about half a minute after it opens, while old chat loads, so the spec waits until the page answers quickly before each test.

The spec found that the menu rounded shares, showing a half share in a party of four as "Shares 4" rather than 3.5. Shares are now shown to two decimal places.

## Live results — 4 November 2026, Jumpgate, sandbox v1.5

| #   | Check                                                                                                                  | Result |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Startup line, GM greeting listing `!lazyxp !lazyexperience !xp`, TokenMod observed                                     | Pass   |
| 2   | `!xp` alias active when no other XP Mod is installed                                                                   | Pass   |
| 3   | Roll20 party (Party Member ticked by API and in the character window) is the roster                                    | Pass   |
| 4   | TokenMod `--set bar1_value\|0` on an Ogre: prompt with 450 XP read from the 2024 sheet's `npc_xp`                      | Pass   |
| 5   | HP set to 0 from the client (as a GM bar edit): prompt for Goblin 1 with 50 XP                                         | Pass   |
| 6   | `dead` marker put on from the client: prompt for Goblin 2                                                              | Pass   |
| 7   | Prompt buttons: Add, Other Amount (Roll20 query, answered 75) and Ignore                                               | Pass   |
| 8   | End Session from the menu button (Yes/No query) and by command                                                         | Pass   |
| 9   | 2024 sheets written with `setSheetItem`: Kildrak 1 → 226 → 326 → 393; the sheet shows "Exp: 326/300"                   | Pass   |
| 10  | Level-up notices at 300 XP for both PCs, once each, with the sheet's Level Up hint                                     | Pass   |
| 11  | Absent (Atala unchanged), bonus 30 for Kildrak, Seraphina added with `party add` and paid; 1 XP remainder carried over | Pass   |
| 12  | Session Log handout made and updated, newest session first                                                             | Pass   |
| 13  | Test Player sees the public summary and a whisper with Seraphina's XP and total                                        | Pass   |
| 14  | Milestone mode (removed before release: levelling is left to the sheets and Roll20's Charactermancer)                  | —      |
| 15  | Help and Command Deck handouts and the menu, Party, settings and status cards render in the chat panel                 | Pass   |
| 16  | German chat cards and menu; Hebrew Help handout reads right to left                                                    | Pass   |

## Sheet tests — 5 November 2026, Jumpgate, sandbox v1.5

Game: **Mod Test Lab - Sheets** (22183801), a new empty Jumpgate game with LazyExperience and a probe Mod. For each sheet, the game's Character Sheet Template was switched in Game Settings and the sandbox restarted. Then:

1. A PC (ticked as Party Member) and a creature with a token were made.
2. Their fields were filled in through the sheet's own inputs, so the sheet saved them as if a player had typed them.
3. LazyExperience ran `add` and `end`. The saved attributes were read back.
4. The creature's HP bar was set to 0 from the GM's client.

The option values in the Game Settings sheet list are the sheet names Mods see (`ogl5e`, `pathfinderneceros`, …). The profiles use them.

| Sheet                    | Before → after award                      | Sheet's own calculations                  | Level-up notice             | Creature defeated                       |
| ------------------------ | ----------------------------------------- | ----------------------------------------- | --------------------------- | --------------------------------------- |
| `ogl5e`                  | `experience` 250 → 350                    | `showleveler` 0 → 1 (Level Up button)     | Level 2                     | CR 2 → sheet's `npc_xp` 450, prompt 450 |
| `dnd5eshaped2`           | `xp` 200 → 300                            | —                                         | Level 2                     | CR 2 → sheet's `xp` 450, prompt 450     |
| `pathfinderofficial`     | `xp` 1950 → 2050                          | `level` from `class1_level`               | Level 2 (medium track)      | CR ½ → prompt 200                       |
| `pathfinderneceros`      | `experience` 1950 → 2050                  | —                                         | — (run before the fallback) | CR 1 → prompt 400                       |
| `pathfinder2eofficial`   | `xp` 950 → 1050                           | —                                         | Level 2, "take 1,000 off"   | Level 3 vs party 1 → prompt 80          |
| `starfinder`             | `xp` 1250 → 1350                          | `character_level` from `class_1_level`    | — (run before the fallback) | CR ½ → prompt 200                       |
| `oldschoolessentialsaac` | `XP` 1950 → 2050 (`Next` 2000)            | —                                         | Level 2                     | No XP: prompt asks for an amount        |
| `dccofficial`            | `xp` 5 → 15                               | —                                         | Level 1 (from 0)            | No XP: prompt asks for an amount        |
| `dungeonworldofficial`   | `xp` 7 → 8                                | —                                         | Level 2 (level + 7)         | No XP: prompt asks for an amount        |
| `wfrp4official`          | new `repeating_experience` row, amount 50 | `total_xp` and `current_xp` stayed 0      | —                           | No XP: prompt asks for an amount        |
| `shadowrun5thedition`    | `karma` 3 → 8, `total karma` 20 → 25      | —                                         | —                           | —                                       |
| `shadowrun6world`        | `karma` 3 → 8, `total_karma` 20 → 25      | —                                         | —                           | —                                       |
| `cypherstemsr20`         | `xp` 2 → 4                                | —                                         | —                           | —                                       |
| `savageworldsofficial`   | not written; warning; summary "No XP"     | —                                         | —                           | —                                       |
| `official13thage`        | not written; warning                      | —                                         | —                           | —                                       |
| `coc7e`                  | not written; warning                      | —                                         | —                           | —                                       |
| `cosmereofficial`        | not tested                                | Roll20 kept the previous sheet when saved | —                           | —                                       |

### Found while testing sheets, and fixed

- The D&D 5E (Classic) sheet's `sanitizeXP` worker calls `.trim()` on the XP. LazyExperience wrote a number, so the worker crashed and the sheet never saw the change. Legacy sheets are now written with text, as a player would type it.
- The guessed sheet names were wrong for most sheets (for example `5eshaped` instead of `dnd5eshaped2`), and a loose name pattern took `pathfinderneceros` for Pathfinder 1E. Profiles now use the exact names from the Game Settings list. Copies are recognised by their attributes.
- Pathfinder and Starfinder only store `xp_max` when it differs from the sheet's default. A blank value gave no level-up notice, so Pathfinder now falls back to the medium track and Starfinder to its own table. A sheet's next-level value, when there is one, always comes first.
- A character on a system without XP (Savage Worlds and others) was listed in the session summary as paid. It isn't any more.

### Sheet facts

- Characters made by a Mod with `createObj` report a blank `_charactersheetname`, so the game's sheet (`Campaign().sheetName`) is used.
- The sandbox only learns the game's new sheet after it restarts.
- After the game was switched to `pathfinder2eofficial`, saving Game Settings with another sheet (Cosmere, WFRP) left it on Pathfinder 2e.

## Pathfinder 1E tracks — 19 November 2026, Jumpgate, sandbox v1.5

Game "Mod Test Lab - LazyExperience PF1" (22232975, Pathfinder by Roll20 sheet, `pathfinderofficial`) with LazyExperience 1.1.0 and a probe that logged the character's attributes. Values were typed into the sheet's own boxes.

| Step                                                                                   | Result                                                                             |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Type XP 1900 and next level 3000 on the sheet (Additional tab)                         | Saved as one attribute, `xp` = 1900 with max 3000. There is no `xp_max` attribute. |
| `set pf1Track sheet`, `give 200`                                                       | 2100 XP, no level-up notice (the box says 3000); box left at 3000                  |
| `give 1000`                                                                            | 3100 XP, "has enough XP for level 2"                                               |
| `set pf1Track fast`, `give 100`                                                        | `xp` = 3200 / 1300; the reopened sheet shows Points 3200, Next Level 1300          |
| Class level 4 on the sheet, `set pf1Track fast 1-3, medium 4-13, slow 14+`, `give 100` | `xp` = 3300 / 15000; `show` says "Level 4 • next level at 15,000"                  |
| Settings card                                                                          | Pathfinder 1E track row: "Fast 1–3 · Medium 4–13 · Slow 14+" and a Mixed button    |

Found while testing: a sheet opened straight after reloading the game showed blank boxes until the character's attributes had loaded. The values were saved; reopening the sheet showed them.

## Translations

The 23 translations were written by Claude (Google Translate refused the sync with HTTP 429) and checked by script against en-US: same keys and list lengths, every `{placeholder}` and command kept, and no characters that would break a Roll20 query. The few strings still identical to English are words that are the same in that language (Session, Version, Menu, Status) or names kept on purpose (Mod sandbox). They have not been proofread by native speakers.

## Found live and fixed

- The Party card's three buttons wrapped beside each name in the narrow chat panel. They now sit on a line under the name.
- Game-system labels with commas would split the settings card's Roll20 query options. They're now cleaned.

## Platform facts found while testing

- `setSheetItem(id, 'experience', 0)` is ignored by the 2024 sheet, so a Mod can't take a 2024 character back to 0 XP. LazyExperience warns instead.
- `setComputed` didn't change `experience`.
- `npc_xp` on the 2024 sheet can be text ("33000 or 41000 in lair") or "---" on PCs.
- The computed `npc` flag is 0 even for monsters. LazyExperience goes by who controls the character instead.

## Not yet tested live

- Cosmere RPG (Roll20 would not switch the test game to it), and Pathfinder Community and Starfinder level-up notices with the fallback tables (added after their runs; covered by tests).
- WFRP 4E totals: the ledger row is added, but the sheet did not recalculate `total_xp` and `current_xp`.
- Sheets in a game that has used them for a while (the tests used new characters).
- DeathTracker 1.0's `onStatusChange` (DeathTracker 1.0 is still being written).
- Upgrading a live game that has 0.1.14 state (covered by tests only).
- Mod sandbox v1.0 with the 2024 sheet (covered by tests only).
- Legacy (non-Jumpgate) engine.
- One-Click install options.

## Manual checklist for a sheet

1. Make a game with the sheet, two PCs controlled by players and one monster.
2. `!lazyxp status`: the expected game system is listed.
3. `!lazyxp add 100`, `!lazyxp end`: each PC's XP field goes up by 50.
4. Drop the monster's HP bar to 0: the prompt shows its XP (or asks for an amount).
5. Give enough XP to pass a level: one notice per character.
