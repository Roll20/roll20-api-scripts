# Hexploration — Testing Guide

## Automated Tests

```bash
npm run build -- --no-bump
npm test
```

These cover the hex geometry, path parsing for both path types, and end-to-end command and movement scenarios against a stubbed Roll20 API. They cannot check rendering, real layer behaviour or Jumpgate's grid, so run the manual checklist below in real games before release.

---

## Test Games

| Game                  | Engine                           | Needed for                        |
| --------------------- | -------------------------------- | --------------------------------- |
| **Jumpgate**          | Jumpgate, Experimental sandbox   | Everything below                  |
| **Legacy**            | Legacy                           | Legacy drawing and the v1 upgrade |
| **Legacy → Jumpgate** | Jumpgate copy of the Legacy game | Upgrading a copied game (Rescan)  |

Each game needs:

- Page **Hex V**: Hex (V), cell size 1, about 30 × 20, with a hex map image lined up to the grid.
- Page **Hex H**: Hex (H), cell size 1.
- Page **Hex V Scaled**: Hex (V), cell size 2 (or 0.5).
- Page **Square**: square grid.
- Two PCs controlled by a player, one NPC controlled by nobody, and one player-controlled token that does not represent a character.
- Optionally a player account in the game, to check what players see.

For the Legacy game, install Hexploration **1.3** first (with PathMath, MatrixMath, Vector Math and HTML Builder), fill a few areas, name some hexes and add a `white-tower` location token. Then copy it to Jumpgate before upgrading either game.

---

## Setup

- [ ] Install `Hexploration.js` and save. The API console shows `-=> Hexploration v2.0.1 … (Jumpgate) <=-` (or `(Legacy)`).
- [ ] The GM receives the "Hexploration is ready." whisper.
- [ ] The Journal contains **Hexploration - Help** and **Hexploration - Command Deck**, neither visible to players.
- [ ] Every button in the Command Deck works.
- [ ] A player typing `!hexploration` gets no response.

## Grid Alignment (Jumpgate) — do this first

- [ ] On **Hex V**, draw a rectangle and Fill. Hexes line up with the page grid across the whole map, not just the top-left.
- [ ] Repeat on **Hex H** and **Hex V Scaled**.
- [ ] If hexes drift: snap a token to a hex centre and run `!hexploration calibrate`; then with two tokens in neighbouring hexes of one row (V) or column (H). Note the column and row steps reported so the Jumpgate defaults in `src/grid.js` can be corrected.
- [ ] `!hexploration calibrate reset` restores the default grid.

## Filling

- [ ] Fill a polygon, rectangle, ellipse and freehand shape. Only hexes whose centres are inside are drawn; the shape is removed.
- [ ] Rotated shapes fill correctly.
- [ ] Hexes are on the foreground layer (Hex Layer: Auto) and cover tokens for players.
- [ ] `!hexploration set hexLayer objects`, Fill: new hexes on the token layer.
- [ ] Inverse Fill covers the whole page, including the right and bottom edges, except inside the shape.
- [ ] A full-page Inverse Fill on a large page completes without the API restarting.
- [ ] Filling over existing hexes restyles them and keeps their names.
- [ ] Undo removes the hexes and restores the shape. A second Undo says there is nothing to undo.
- [ ] Fill with nothing selected, or a token selected, whispers an error with a hint.
- [ ] Fill on **Square** whispers "This page does not use a hex grid."

## Revealing

- [ ] Drag a player token: every hex along the route is revealed, plus those within Sight Distance.
- [ ] Drag with waypoints: hexes along each leg are revealed.
- [ ] Move with the arrow keys: the hex moved into is revealed.
- [ ] Moving the NPC, or any token on the GM layer, reveals nothing.
- [ ] `!hexploration set revealBy characters`: the NPC (if it represents a character) now reveals.
- [ ] A 2 × 2 or 3 × 3 token reveals every hex it covers.
- [ ] With Line of Sight on, hexes behind a hex drawn with Hex Reveal Distance 0 stay hidden until it is entered.
- [ ] Glimpse mode: hexes within sight turn see-through; entering them removes them.
- [ ] Repeat glimpse with Glimpse Colour set to `rgba(140,135,122,0.9)`, `rgb(140,135,122,0.9)` and `#8c877ae6`. In Jumpgate all three give the same see-through colour, drawn as `#8c877ae6`.
- [ ] Fill with Fill Colour set to `rgba(255,0,0,0.25)`. The hexes are see-through red in both engines.
- [ ] `!hexploration set` shows a swatch for every colour, including `#rrggbbaa` and `rgba()` colours.
- [ ] `!hexploration explore` with tokens selected reveals around them.
- [ ] An NPC with player-visible name and bars moved under a hex shows neither to players; revealing its hex restores them. `set hideCoveredTokens off` restores every hidden token.
- [ ] A TokenMod move (`!token-mod --set left|+70`) reveals hexes.
- [ ] Reveal, Conceal, Reveal Page and Reset Page (with confirmation) behave as described.
- [ ] Page overrides (`!hexploration page set revealDistance 3`) apply only on that page; `page clear` removes them.

## Locations

- [ ] Mark Location on a token, then Fill over it: the token moves to the GM layer.
- [ ] Mark Location on a token already under a hex hides it immediately.
- [ ] A `white-tower` token is hidden when filled over.
- [ ] Revealing the hex returns the token to the token layer with its name shown and announces it.
- [ ] Name Hex shows a GM-only label; revealing announces the name and removes the label.
- [ ] Announce Discoveries: GM only whispers to the GM; Off sends nothing.
- [ ] Ping Discoveries moves the players' view.
- [ ] A name containing `<b>` appears literally in chat.

## Maintenance

- [ ] Delete a hex by hand; `!hexploration status` count drops; nothing errors.
- [ ] Duplicate a page with hexes, run Rescan on the copy: hexes, labels and locations are picked up; moving a token reveals them.
- [ ] Restart the sandbox after deleting hexes while it was off: the startup whisper reports them as forgotten.

## Upgrading from Version 1 (Legacy game)

- [ ] Replace v1.3 with v2.0.1. The startup whisper says the maps were upgraded.
- [ ] Existing hexes reveal when tokens move; names and location tokens are announced.
- [ ] Colours, border width and reveal distance match the v1 settings.
- [ ] The `Hexploration_menu` macro opens the new menu; the v1 Fill buttons in old macros still work.
- [ ] Removing PathMath, MatrixMath, Vector Math and HTML Builder causes no errors.

## Legacy → Jumpgate Copy

- [ ] In the copy, the startup whisper reports forgotten hexes (their IDs changed).
- [ ] Rescan on each page adopts the hexes and re-links labels and location tokens.
- [ ] New fills in the copy draw `pathv2` hexes that line up with the existing ones (calibrate if not).

## Languages

- [ ] `!hexploration set language fr`: menus, messages and both handouts switch to French.
- [ ] `!hexploration set language he`: handouts read right to left.
- [ ] Setting Language on the One-Click settings page applies on restart and is not re-applied over a later chat change.
