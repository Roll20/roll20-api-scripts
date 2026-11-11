# Resizer — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover the geometry of every object kind, zoom factors, fit and centre, calibration (including the Jumpgate grid offset), the 0.0.9 state upgrade and commands, and end-to-end zoom, undo, batch, calibrate, resize, settings and handout scenarios against a stubbed Roll20 API. They cannot check what Roll20 draws, so run the checklist below in a real game before release.

---

## Test Game

A Jumpgate copy of the Mod Test Lab ("Mod Test Lab - Resizer") with pages Walls Lab (walls, one-way and see-through walls, a door, a window, a Legacy wall, text labels), Battle Map, Coast, Docks, Market, Hex (V) and Hex (H). Run the checks on copies of pages you can afford to change, and finish each with **Undo**.

---

## Results (4 November 2026, Jumpgate, sandbox v1.5, game 22183322)

| Check                                                                                                                                                                                                 | Result |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Walls Lab `zoom 2 --pages Walls Lab`: map, tokens, text, walls (all three kinds), the room's walls, door, window and the Legacy wall line up with the art at ×2, drawn straight away without a reload | Passed |
| `undo` after that zoom: every object's geometry identical to before (22 objects compared)                                                                                                             | Passed |
| Menu **Zoom page** button: Jumpgate's "Macro Options" dialogs for the factor and tokens; **Keep their size** kept tokens at 70 px while the map doubled                                               | Passed |
| Menu **Undo: …** button                                                                                                                                                                               | Passed |
| Calibrate on Coast: map shrunk to 80 % (56 px squares) and offset; box over 5 × 3 squares; map back to 2100 × 1400 with its corner on a grid line; box deleted; undo brought both back                | Passed |
| Calibrate on a page with grid offset 30, 20: map corner moved to (30, −20); a dragged token snapped to x ≡ 65, y ≡ 15 (mod 70), confirming the offset directions                                      | Passed |
| Real canvas selection: `size large` on a clicked token; the menu listed it as 140 × 140 px (2 × 2 cells)                                                                                              | Passed |
| Page picker: ticked Docks and Market, **Zoom ticked pages** ×0.5 zoomed both; one undo restored both                                                                                                  | Passed |
| `zoom 1.5 --pages Hex (H)`: hexes drawn 1.5 × larger; undo restored the page                                                                                                                          | Passed |
| Command Deck handout buttons (Zoom ×2)                                                                                                                                                                | Passed |
| 0.0.9 upgrade: state `{config:{command:'rs'}}`, restart: "Upgraded from Resizer 0.0.9" greeting, `!rs page` works                                                                                     | Passed |
| `_lastpage` follows the GM's page change in the page drawer, so the menu and typed commands act on the page the GM is on                                                                              | Passed |

Platform facts found while testing are in `DEVELOPERS.md` (Legacy paths are redrawn; grid offset directions; the GM's client can save a page's old cell size back).

### Playwright (6 November 2026, same game)

`playwright-tests/tests/resizer/resizer.spec.ts` automates the menu, zoom ×2 with an object-by-object undo check, the Zoom page button with Keep their size, `size large`, calibrate from a 4 × 2 box, the page picker batch, `scale 2 down` and history: 8 of 8 passed. It needs PlaywrightHarness 1.8.0 or newer. Run it from `playwright-tests` with `ROLL20_GAME_ID=22183322` (and `PW_PROFILE_DIR` for a copied profile):

```bash
npx playwright test tests/resizer
```

The first runs found that the GM's Jumpgate client saved the old cell size back over 2 of 4 zooms (new width, old `snapping_increment`). With the page guard, 6 zooms and 6 undos in a row all kept the right cell size.

---

## Checklist

### Setup

- [ ] Install `Resizer.js` and save. The API console shows `-=> Resizer v1.0.0 … <=-`.
- [ ] The GM receives the "Resizer is ready." whisper.
- [ ] The Journal has **Resizer - Help** and **Resizer - Command Deck**, neither visible to players.

### Zoom

- [ ] `!resizer zoom 2` on a page with a map, tokens, text, Jumpgate walls of every kind, a door, a window and a Legacy wall: everything lines up at twice the size; `scale_number` unchanged.
- [ ] A token's light and vision still reach the same distance in feet.
- [ ] `undo` puts every object back exactly.
- [ ] `zoom 0.5`, `150%`, `1/2`, `to 140`; `zoom 1` and `zoom banana` are refused.
- [ ] `--keep-tokens` and the **Keep token size** setting; `--scale-tokens` overrides it.
- [ ] A page with a grid offset keeps the map on the grid after a zoom.
- [ ] Hex (V) and Hex (H): tokens still sit in their hexes.

### Batch

- [ ] Page picker: tick two pages, **Zoom ticked pages**, one undo restores both.
- [ ] `zoom 2 --pages Town, Docks`; an unknown name is reported.

### Calibrate

- [ ] Map with its own grid, box over several squares: squares match the page grid, box deleted; undo restores both.
- [ ] `--keep-box`, `--fit-page`, `--cell <px>`.
- [ ] Rotated map and missing box or map are explained.

### Selection

- [ ] Menu with tokens selected lists their sizes.
- [ ] **Resize**, **Creature size**, **Fit to page**, **Centre** from the menu; `--ids` from another Mod.

### Settings and upgrade

- [ ] Language change rebuilds the handouts; Hebrew shows right to left.
- [ ] `set command rs` makes `!rs` work and the handouts use it.
- [ ] Install 0.0.9, rename its command, replace it with 1.0: the renamed command and the 0.0.9 commands work.
