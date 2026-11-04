# Resizer

A Roll20 Mod that resizes tokens, maps and pages, zooms a whole page with everything on it, and lines maps up with the grid.

**Version 1.0.0 is a full rewrite for Jumpgate and Legacy games.** Zooming a page now takes Jumpgate drawings, dynamic lighting walls, doors and windows with it, keeps the distance per grid cell, and can be undone. Every 0.0.9 command still works.

## Installation

1. Install **Resizer** from the Roll20 One-Click library, or upload `Resizer.js` to the game's API Scripts. If 0.0.9 is installed, replace it (do not run both).
2. Save. On startup the Mod creates two GM-only handouts in the Journal:
   - **Resizer - Help**: full instructions.
   - **Resizer - Command Deck**: buttons for every action.

## Quick Start

1. Type `!resizer` for the menu, or open the Command Deck.
2. To resize tokens, select them and click **Resize** (width and height) or **Creature size** (Tiny to Gargantuan).
3. To zoom a page, go to it and click **Zoom page**: `2` doubles everything, `0.5` halves it.
4. To fit a map to the grid, draw a rectangle over a few of the map's own squares, select it and the map, and click **Calibrate map**.
5. Changed your mind? Click **Undo**.

## Zooming Pages

`!resizer zoom <factor>` scales the page you are on, and everything on it, about the page's top-left corner:

- the page's width, height, grid cell size (snapping increment) and Jumpgate grid offset;
- tokens and other graphics, including the map;
- Jumpgate drawings (`pathv2`) and Legacy drawings (`path`);
- text, including its font size;
- dynamic lighting walls (one-way and see-through too), doors and windows.

**Distances stay true.** Each cell still stands for the same distance (`scale_number`, such as 5 ft), so rulers, auras, token lights and vision measure the same on the zoomed page. (0.0.9 multiplied the distance as well, so a 5 ft cell became a 10 ft cell.)

| Factor       | Meaning                      |
| ------------ | ---------------------------- |
| `2`, `x2`    | Twice as big.                |
| `0.5`, `1/2` | Half the size.               |
| `150%`       | One and a half times as big. |
| `to 140`     | Make the cells 140 px.       |

Options:

- `--keep-tokens` moves tokens with the map but keeps their size (or turn on the **Keep token size when zooming** setting; `--scale-tokens` overrides it). Tokens are graphics on the Tokens and GM layers.
- `--pages all`, `--pages picked`, `--pages current`, or page names and IDs separated by commas (`--pages Town, Docks`) zoom several pages in one go. **Pick pages** in the menu shows every page with a tick box; tick some and click **Zoom ticked pages**.

Line widths of drawings scale with the page unless **Scale drawing line widths** is off; walls keep their width. Jumpgate does not redraw a Legacy drawing that a Mod changes, so Legacy drawings are drawn again at the new size and get new IDs.

## Fitting a Map to the Grid

Many battle maps have their own grid printed on them, at their own size. **Calibrate** scales the map so its squares match the page's cells and moves it so the lines meet:

1. Put the map on the page. Draw a rectangle with any drawing tool over a few of the map's squares, from line to line.
2. Select the map and the rectangle together (Shift-click).
3. Click **Calibrate map** (or type `!resizer calibrate <across> <down>`) and say how many squares the box covers.
4. The map is scaled and moved so those squares fit the page grid exactly. The box is deleted (turn off **Delete the calibration box**, or add `--keep-box`, to keep it).

A bigger box (more squares) gives a more exact fit. **Calibrate and fit page** (`--fit-page`) also moves the map to the page corner and resizes the page to fit it. **Calibrate by pixels** (`!resizer calibrate --cell <px>`) skips the box: give the size of the map's squares in pixels as it is drawn now. The map must be square to the page (rotated 0°, 90°, 180° or 270°).

## Resizing Selected Objects

| Command                                                      | What it does                                                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `!resizer`                                                   | The menu. With objects selected it lists their sizes in pixels and cells.      |
| `!resizer size <width> <height> [px\|cells\|units]`          | Resize the selected graphics. Pixels by default; `cells` uses the page's grid. |
| `!resizer size tiny\|small\|medium\|large\|huge\|gargantuan` | Creature sizes: ½, 1, 1, 2, 3 and 4 cells across.                              |
| `!resizer fit [--keep-ratio]`                                | Fit the selected graphics to the page, centred.                                |
| `!resizer center [both\|h\|v]`                               | Centre the selected graphics or text on the page.                              |
| `!resizer page`                                              | Show the page's size.                                                          |
| `!resizer page <width> <height> [units\|cells\|px]`          | Resize the page (not what is on it). Page units (70 px) by default.            |

Other Mods cannot select objects, so they name them with `--ids` followed by IDs separated by commas: `!resizer size large --ids -Mabc123,-Mdef456`.

## Undo

Every change (resize, fit, centre, calibrate, page size, zoom) can be undone with `!resizer undo` or the menu's **Undo** button. The last 10 changes are kept with the game, so they survive a Mod sandbox restart; `!resizer history` lists them and `!resizer history clear` forgets them. A batch zoom over several pages is one change. Objects deleted since a change are reported and skipped. Very large changes may be too big to keep; Resizer says so.

## Commands

| Command                                                              | What it does                              |
| -------------------------------------------------------------------- | ----------------------------------------- |
| `!resizer`                                                           | Menu.                                     |
| `!resizer size …`, `fit`, `center`                                   | Resize, fit or centre the selection.      |
| `!resizer calibrate [across] [down] [--fit-page] [--keep-box]`       | Fit a map to the grid from a drawn box.   |
| `!resizer calibrate --cell <px> [--fit-page]`                        | Fit a map from its square size in pixels. |
| `!resizer page [<width> <height> [units\|cells\|px]]`                | Show or resize the page.                  |
| `!resizer zoom <factor> [--pages …] [--keep-tokens\|--scale-tokens]` | Zoom pages with everything on them.       |
| `!resizer pages`, `!resizer pick <page>\|all\|none`                  | Page picker.                              |
| `!resizer undo`, `!resizer history [clear]`                          | Undo and history.                         |
| `!resizer settings`, `!resizer set <setting> <value>`                | Settings.                                 |
| `!resizer reset`                                                     | Put the settings back to their defaults.  |
| `!resizer journal rebuild`                                           | Rebuild the handouts.                     |
| `!resizer help`                                                      | Command list.                             |

`!rsz` works as well as `!resizer`, and so does a name you choose with `!resizer set command <name>`.

## Settings

| Key                    | Setting                      | Default   | Description                                            |
| ---------------------- | ---------------------------- | --------- | ------------------------------------------------------ |
| `language`             | Language                     | `en-US`   | One of 24 languages. Also on the Mod's settings page.  |
| `command`              | Command                      | `resizer` | An extra name for the command.                         |
| `keepTokenSize`        | Keep token size when zooming | `off`     | Zoom moves tokens but keeps their size.                |
| `scaleStrokes`         | Scale drawing line widths    | `on`      | Zoom scales drawings' line widths (walls keep theirs). |
| `deleteCalibrationBox` | Delete the calibration box   | `on`      | Calibrate deletes the box it measured.                 |

## Working with Other Mods

- Other Mods can send Resizer commands (for example from ScriptCards); replies are whispered to the GM. Without `--pages`, their commands act on the player ribbon page.
- Mods that remember positions on a page (patrol routes, token homes, saved areas) are not moved by a zoom unless they follow it. They can use the API:

```js
Resizer.onZoom((pageId, factor) => {
  /* scale your stored positions by factor */
}); // also called with 1/factor when a zoom is undone
Resizer.zoomPage(pageId, 2, { keepTokens: false }); // { ok, objects }
Resizer.undo(); // { ok, what }
Resizer.history(); // [{ what, at }]
Resizer.version; // "1.0.0"
```

## Upgrading from 0.0.9

Replace the old script with this one. Your renamed command (if any) is kept, and the old commands do what the new ones do:

| 0.0.9                            | 1.0                          |
| -------------------------------- | ---------------------------- |
| `!resizer 50 50`                 | `!resizer size 50 50 px`     |
| `!resizer page 30 20`            | `!resizer page 30 20 units`  |
| `!resizer page 2100 1400 pixels` | `!resizer page 2100 1400 px` |
| `!resizer scale 2 up`            | `!resizer zoom 2`            |
| `!resizer scale 2 down`          | `!resizer zoom 1/2`          |
| `!resizer fit keep_ratio`        | `!resizer fit --keep-ratio`  |
| `!resizer center h v`            | `!resizer center both`       |
| `!resizer config command\|name`  | `!resizer set command name`  |

`scale` no longer changes the distance per cell, and `scale 2 up` now zooms in: 0.0.9 read the direction word twice, so `up` and `down` both shrank the page and only `scale 2` with no direction grew it.

## Credits

Original Mod by [Robin Kuiper](https://app.roll20.net/users/1226016/robin) ([forum thread](https://app.roll20.net/forum/post/6285519/script-resizer/), [Patreon](https://www.patreon.com/robinkuiper)).

Version 1 rewritten and maintained by [MidNiteShadow7](https://app.roll20.net/users/16506286/midniteshadow7) ([GitHub](https://github.com/steverobertsuk)).

If you find a bug or have an idea, post in the forum thread or open an issue on GitHub, and include any messages from the API console log.

## License

This script is licensed under the MIT License.
