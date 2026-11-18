# InspirationTracker — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover both sheets (including a 2024 sheet set to 2014 rules and a 2014 sheet with no attribute yet), giving, removing, toggling, spending, undo, the 2024 pass-on rule, changes made on the sheet or a token marker, the party overview for the GM and for players, permissions, custom markers, settings, the 0.1.x upgrade, One-Click useroptions, the player macro, the API for other Mods, and every locale's handouts, against a stubbed Roll20 API. They cannot check the real 2024 sheet, chat buttons or roll queries, so run the checklist below in a real game before release.

The Playwright spec `playwright-tests/tests/inspirationtracker/inspirationtracker.spec.ts` runs the main live checks.

---

## Test Game

Use **Mod Test Lab - InspirationTracker** (a copy of Mod Test Lab): Jumpgate, D&D Fifth Edition (5E & 5.5E) sheet, the four 2024 Ready-to-Play PCs (Seraphina is controlled by Test Player), PlaywrightHarness, TokenMod and libTokenMarkers. For the 2014 OGL sheet use a game with the D&D 5E by Roll20 sheet. For custom markers, add a custom token marker set to the game.

---

## Setup

- [ ] Install `InspirationTracker.js` and save. The API console shows `-=> InspirationTracker v1.0.0 … <=-`.
- [ ] The GM receives the "InspirationTracker is ready." whisper with the number of sheets read.
- [ ] The Journal has **InspirationTracker - Help** and **InspirationTracker - Command Deck**, neither visible to players.
- [ ] Every button in the Command Deck works.

## 2024 Sheet

- [ ] Select a PC token and click **Give**: the sheet's Heroic Inspiration box is ticked, every token for the PC shows the marker, the effect plays, and chat says "… has Heroic Inspiration!" once.
- [ ] Tick and clear the box on the sheet by hand: the marker follows; clearing it posts "… uses Heroic Inspiration." and the GM gets an Undo button.
- [ ] Add and remove the marker on a token by hand: the sheet follows.
- [ ] Set a PC's sheet to the 2014 rules: messages say Inspiration.

## 2014 Sheet

- [ ] Give, remove and spend on a 2014 OGL character, including one whose box has never been ticked.

## Players

- [ ] Run **Player Macro**. As the player, select Seraphina: the **Inspiration** token action spends it, and the GM is told who spent it.
- [ ] As the player, try to spend for a PC they do not control: refused.
- [ ] Undo a spend from the GM's whisper.
- [ ] As the player, `!inspiration` lists only their characters; with **Players See Party** on, `!inspiration party` lists everyone without GM buttons.

## Passing It On

- [ ] Give Seraphina Heroic Inspiration twice: the player is asked who gets it, the buttons list PCs without it, choosing one gives it to them, and the choice cannot be used again.

## Points Pools

The Node tests in `tests/pools.test.mjs` cover pools on both kinds of sheet. By hand, on a D&D 5E by Roll20 (2014 OGL) character with an Other Resource box named Inspiration holding 52:

1. `!inspiration set tracking pool`: the character's tokens show the marker.
2. `!inspiration pool set inspiration cost 2`, select the token, **Boost**, type 4: the box reads 44 and chat says "spends 8 Inspiration for +4 to the roll (52 → 44)". **Undo** in the GM whisper puts 52 back.
3. `!inspiration spend 60`: refused, the box is unchanged.
4. Type 0 into the box on the sheet: the marker goes. Type 5: it comes back.
5. On a D&D 2024 character, `!inspiration give 3`: an `inspiration_pool` attribute holds 3 and the Heroic Inspiration box is untouched.
6. `!inspiration pool add Luck`, `!inspiration give 2 --pool luck`: a `luck_pool` attribute holds 2. `!inspiration party --pool luck` lists it.
7. `!inspiration set tracking flag`: Give and Spend work on the sheet's inspiration box again.

## Markers and Settings

- [ ] Choose a custom marker from the **Marker** drop-down: it moves on every inspired token.
- [ ] Change **Announce** to GM and owners, and Nobody.
- [ ] Change **Language**: handouts and menus change; check a right-to-left language (Hebrew).

## Upgrade from 0.1.4

- [ ] Install 0.1.4 (`0.1.4/InspirationTracker.js`), choose a marker, effect and command name, then replace it with 1.0.0: the settings are kept and the old command still works.

## Other Mods

- [ ] TokenMod `!token-mod --set statusmarkers|+black-flag` gives inspiration.
- [ ] A ScriptCards or `sendChat` call of `!inspiration give --ids <id>` works.
