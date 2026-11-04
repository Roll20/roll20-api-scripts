# Changelog

## 1.0.0 (2026-11-04)

A full rewrite by MidNiteShadow7 of Robin Kuiper's Resizer 0.0.9, which had not been updated since 2018 and did not know about Jumpgate. Every 0.0.9 command still works, and a renamed command is kept.

### Fixed

- Scaling a page (now **zoom**) moves and scales Jumpgate drawings (`pathv2`), dynamic lighting walls, doors and windows with the map. 0.0.9 only knew Legacy drawings, so in Jumpgate the walls stayed where they were and no longer matched the map.
- Zooming keeps the distance per cell. 0.0.9 multiplied the page's scale (5 ft per cell became 10 ft), changing what every ruler, aura and light meant.
- `scale 2 up` grows the page and `scale 2 down` shrinks it. 0.0.9 read the direction word twice, so both shrank the page.
- Legacy drawings are drawn again at their new size. Jumpgate ignores a Mod's change to a Legacy drawing's scale (it resets it on the next load), so 0.0.9's scaled drawings moved but kept their old length.
- The grid cell size comes from each page's snapping increment, and the Jumpgate grid offset is scaled with the page. 0.0.9 assumed 70 px cells for `page`, `fit` and `center`.
- **Fit** with keep ratio centres the graphic on the page; 0.0.9 left it in the top-left corner.
- **Undo** works for every change and keeps the last 10 in the game's state. 0.0.9 could only undo the last resize, kept it in variables lost on a sandbox restart, and could crash or change the wrong object.
- **Centre** sends one reply, not one per selected graphic.
- Page sizes stored as text (as on hex pages) are read correctly.
- Errors and empty selections get a clear message instead of nothing or "contact the developer". The help button no longer links to a GitHub page that has gone.

### Added

- **Zoom** with factors such as `2`, `0.5`, `150%`, `1/2` or `to 140` (cell size in pixels), and `--keep-tokens` (or the **Keep token size when zooming** setting) to move tokens without resizing them.
- **Calibrate**: fit a map to the grid from a rectangle drawn over some of the map's own squares, or from its square size in pixels; `--fit-page` also sizes the page to the map.
- **Creature sizes**: `size tiny` … `size gargantuan`, in the page's grid cells.
- Sizes in pixels, grid cells or page units for `size` and `page`.
- **Batch zoom** over several pages with `--pages` or the **Pick pages** card, undone in one step.
- **History** card and `history clear`.
- `--ids` so other Mods can name objects; commands from other Mods are accepted and answered to the GM.
- Chat menu in the house style, **Resizer - Help** and **Resizer - Command Deck** handouts, settings card, and 24 languages.
- Public API: `Resizer.zoomPage`, `Resizer.undo`, `Resizer.history` and `Resizer.onZoom`, so Mods that store page positions can follow a zoom.

### Changed

- The main menu replaces 0.0.9's separate size, help and config cards. `!rsz` also works.
- 0.0.9's first-start config card is gone; `set command <name>` renames the command.

## 0.0.9 (2018-04-17)

Robin Kuiper's last release, and the version published in the One-Click library until 1.0.0.

### Added

- `!resizer center [h] [v]` and a **Center selected Graphics** menu button, to centre the selected graphics across, down or both.

### Changed

- 2018-04-24: the script was given its `0.0.9/` version folder for the One-Click library. 2018-05-03: links in the script header updated.

## 0.0.8 (2018-04-16)

### Fixed

- Only GMs can use the commands; 0.0.7 answered anyone.

## 0.0.7 (2018-04-15)

### Added

- `!resizer fit keep_ratio` and a keep/deny question on the **Make selected fit to page** button, to fit a graphic to the page without stretching it.

## 0.0.6 (2018-04-15)

First release by Robin Kuiper.

- Resize the selected graphics (`!resizer <width> <height>`) and show their sizes (`!resizer`).
- Show or resize the page in units or pixels (`!resizer page [<width> <height> [pixels]]`).
- Scale a whole page with everything on it (`!resizer scale <amount> up|down`), with an undo button.
- Fit the selected graphics to the page (`!resizer fit`).
- A chat menu, a help card and a config card with a renameable command.
