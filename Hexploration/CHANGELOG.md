# Changelog

## 2.0.2 - 2026-10-30

### Fixed

- Naming a hex no longer stops Jumpgate drawing the tabletop. Name labels were made without a font, which Jumpgate cannot draw, so Roll20 showed "Something Went Wrong" until the page was refreshed, and again whenever the page was opened. Labels now use Arial, and labels made by 2.0.0 and 2.0.1 are given the font on startup or when the page is rescanned.
- Undoing a fill no longer forgets the locations it hid. A token marked with Mark Location went back to the token layer as an ordinary token, so the next fill covered it without hiding it, and finding it was not announced.

### Changed

- The help handout and README explain that Jumpgate draws the GM layer below the foreground layer, so name labels only show over covered hexes when Hex Layer is set to the token layer.

## 2.0.1 - 2026-10-30

### Fixed

- Glimpse works in Jumpgate. Jumpgate ignores `rgb()` and `rgba()` colours on drawn shapes, so glimpsed hexes kept their solid fill. Fill, border and glimpse colours are now converted to `#rrggbb` or `#rrggbbaa` for Jumpgate hexes, so `rgba()` fill colours make see-through hexes too. Hexes left solid by 2.0.0 are repainted the next time a token sees them.
- The colour swatches on the settings card show colours with transparency. Roll20 chat dropped `#rrggbbaa` colours and `rgb()` colours with a fourth value, leaving the swatch empty.

### Changed

- The README lists the colour formats the settings accept and explains how they are used in Jumpgate.
- The help handout, settings descriptions and README explain how Hex Reveal Distance and Line of Sight work together, with a mountain range example. Neither makes a difference with the default Sight Distance of 1, and Hex Reveal Distance only applies to hexes filled after it is set.

## 2.0.0 - 2026-10-29

A full rewrite by MidNiteShadow7 of Ada Lindberg's Hexploration, which no longer worked in Jumpgate games.

### Fixed

- Works in Jumpgate: shapes drawn in Jumpgate (`pathv2`) can be filled, hexes are drawn as `pathv2`, and deleted Jumpgate hexes are forgotten.
- Hexes line up with Jumpgate's regular hex grid. Legacy pages keep the exact version 1 spacing so existing maps stay aligned.
- Hexes on the far right and bottom of the page are now covered by Inverse Fill.
- A token near the edge of a hex is now placed in the correct hex.
- Moving a token on the GM layer, or a monster controlled only by the GM, no longer reveals the map.
- Tokens dragged quickly across the map no longer skip the hexes in between.
- Bar, marker and other non-movement changes no longer trigger reveals.
- No more crashes when a hex, its label or its icon was deleted by hand, when Name Hex is used on something that is not a hex, or when Fill is used with a token selected.
- Location names are HTML-escaped in chat.
- Players can no longer run the commands; they are GM only.
- Large fills are drawn in batches so they do not trip the API's long-running script watchdog.

### Added

- Legacy support continues alongside Jumpgate; the engine is detected automatically.
- Hex Layer setting: draw on the foreground layer (above tokens) or the token layer. Auto tries the foreground layer first and falls back to the token layer.
- Reveal Along Path: the whole route a token is dragged along is revealed, including waypoints.
- Large tokens reveal every hex they cover.
- Tokens That Reveal setting: player tokens (default), character tokens (the version 1 behaviour) or all tokens.
- Glimpse reveal mode: hexes within sight turn see-through and clear when entered.
- Line of Sight can be switched off.
- Mark Location and Unmark commands for hidden location tokens. The version 1 `white-tower` marker still works.
- Announce Discoveries (everyone, GM only, off) and Ping Discoveries settings.
- Hide Covered Tokens: player-visible names, bars and auras of tokens under covered hexes are switched off until they are uncovered, because Roll20 draws them above the hexes.
- Reveal and Conceal for selected hexes, shapes and tokens; Reveal Page; Reset Page; Explore.
- Undo for the last fill, inverse fill or conceal, including the shapes it used.
- Per-page overrides for the reveal settings.
- Rescan: rebuilds a page's hex list after a page or game is copied, re-linking name labels and location tokens.
- Calibrate: lines the hex grid up with tokens snapped to hex centres.
- Status card for the current page.
- Help and Command Deck handouts in the Journal.
- 24 languages.
- `Hexploration.revealAround(token)` API for other Mods, and automatic support for tokens moved by TokenMod.
- Hex Layer, Tokens That Reveal and Language on the One-Click settings page.

### Changed

- Primary command is now `!hexploration` with subcommands. The version 1 `!hexploration_*` commands still work.
- No longer depends on PathMath, MatrixMath, Vector Math or HTML Builder.
- New installs default to dark hexes with a sight distance of 1. Upgraded games keep their settings.
- Version 1 state is migrated automatically; hexes whose paths no longer exist are forgotten on startup.
- Rebuilt with Rollup and Prettier; source split into ES modules with unit and end-to-end tests.

## 1.3 - 2019-03-19

- Fixed a couple of state bugs.

## 1.2 - 2018-10-26

- Maximum reveal distance, line-of-sight enforcement and icons for hexes.

## 1.1 - 2018-04-05

- Chat menu, hex colours, reveal distance, named hexes and inverse fill.

## 1.0 - 2018-03-13

- Initial release.
