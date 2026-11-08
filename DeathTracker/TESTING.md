# DeathTracker — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover every 0.1.8 defect fixed in 1.0.0, the status rules, death saves on the 2024 and 2014 sheets (including counting from the drop to 0, clearing the sheet's boxes and the poll), PC detection, markers, on-death actions and restore, massive damage, migration from 0.1.8, commands, One-Click options, observers and TokenMod, against a stubbed Roll20 API. They cannot check rendering, Roll20's sheet or real events, so run the live checks below before release.

## Live Tests

Live tests use the Playwright harness (`P:/Code/Dnd-Roll20/playwright-tests`, PlaywrightHarness Mod installed in the game) in **Mod Test Lab - DeathTracker** (22182976), a copy of Mod Test Lab: Jumpgate, D&D 2024 sheet, sandbox v1.5. Its Battle Map page has the four 2024 PCs (Seraphina is controlled by the player account "Test Player"; the others by nobody), four Goblin Warriors (unlinked bars), an Ogre and a Lich (linked bar).

The specs are in `playwright-tests/tests/deathtracker/`. Run them against the copy with its own browser profile:

```bash
ROLL20_GAME_ID=22182976 PW_PROFILE_DIR=P:/Code/Dnd-Roll20/.dt-auth/gm PW_PLAYER_PROFILE_DIR=P:/Code/Dnd-Roll20/.dt-auth/pl npx playwright test tests/deathtracker
```

### Checklist

- [ ] Install `DeathTracker.js`; the console shows `-=> DeathTracker v1.0.0 … <=- Mod Script Sandbox v1.5` and the GM gets "DeathTracker is ready."
- [ ] The Journal has **DeathTracker - Help** and **DeathTracker - Command Deck**, neither visible to players; every Command Deck button works.
- [ ] NPC: bubble to half → Bloodied marker and tint; to 0 → Dead marker.
- [ ] PC with no controller (sheet says PC): bubble to 0 → Dying marker and a GM announcement.
- [ ] Player-controlled PC to 0: the player gets the announcement too.
- [ ] Tick three successes on the 2024 sheet → Stable; three failures (or a natural 1 twice) → Dead.
- [ ] Roll a death save with the sheet's Roll button → counted.
- [ ] Heal through the bubble → markers go, the sheet's death save boxes are cleared.
- [ ] Settings card: every button; a marker query (pick **Unconscious**) changes the marker on downed tokens at once.
- [ ] On death: GM layer, Map layer, turn order removal; **Restore** puts the token back with its initiative.
- [ ] TokenMod `--set bar1_value|0` → Dead.
- [ ] HealthColors installed with death saves on → one warning.
- [ ] Restart the sandbox: downed PCs stay Dying/Stable and keep their counts.
- [ ] Upgrade: install 0.1.8, set its config, replace with 1.0.0 → settings carried over, `!dead` works.

## Results

Live results, 4 November 2026, Mod Test Lab - DeathTracker (22182976), Jumpgate, sandbox v1.5, HealthColors switched off unless noted.

| Check                                                                                                                                                                               | How           | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------ |
| Install, ready whisper, console banner `Mod Script Sandbox v1.5`                                                                                                                    | by hand       | Pass   |
| NPC bubble 3/10 → Bloodied (red) and tint; 0 → Dead                                                                                                                                 | by hand, spec | Pass   |
| Cleared bar does not kill                                                                                                                                                           | spec          | Pass   |
| Kildrak (no controller, sheet PC) bubble 0 → Dying (sleepy) and GM announcement                                                                                                     | by hand       | Pass   |
| Ticking three successes on the 2024 sheet → Stable, counts 1, 2, 3                                                                                                                  | by hand       | Pass   |
| Bubble heal → healthy, "back on their feet", sheet boxes cleared                                                                                                                    | by hand       | Pass   |
| GM layer + turn order removal; Restore puts layer and initiative back                                                                                                               | by hand, spec | Pass   |
| TokenMod `--set bar1_value\|0` → Dead                                                                                                                                               | spec          | Pass   |
| Settings card renders; marker query → Unconscious (`sheet-unconscious`) applied to a dying PC at once                                                                               | by hand, spec | Pass   |
| Menu card renders (summary, PCs down, buttons, sandbox)                                                                                                                             | by hand, spec | Pass   |
| Help and Command Deck handouts                                                                                                                                                      | spec          | Pass   |
| 2024 sheet dropped to 0 from the bar shows its death save boxes (DeathTracker sets `deathSaves.open`); three failures → Dead; heal → normal Hit Points panel, boxes cleared (6 Nov) | by hand, spec | Pass   |
| Player-controlled PC to 0: the player is told too                                                                                                                                   | spec          | Pass   |
| Build with all 24 languages installed and starts; switching language not yet checked live                                                                                           | by hand       | Pass   |

Spec runs, 6 November 2026: 9 of 10 passed in one run (`three failures kill a PC` timed out in its `beforeEach` while snapshotting all pages on a slow machine) and passed on its own afterwards. A full run takes about 30 minutes.

Not tested live: HealthColors 2.5.0 alongside DeathTracker (Node smoke test only), a D&D 2014 sheet game, sandbox v1.0, the upgrade from an installed 0.1.8, massive damage, sandbox restart with PCs down.
