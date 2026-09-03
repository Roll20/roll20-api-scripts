Rollable Table Manager

A GM-only Roll20 Mod script for finding, rolling, and maintaining large collections of rollable tables without relying on Roll20's native table-list order.

It is designed for campaigns with hundreds or thousands of tables.

## Features

- Alphabetical table browser, grouped by `0-9`, `A-Z`, and `Other`
- 25 tables per page
- GM-only menus and GM-only table results
- Weighted rolls using the table items and weights already stored in Roll20
- A chat-based table-item editor: add, change, or delete items
- Personal favorites for each GM, saved in the campaign's API-script state
- Optional ScriptCards result panels, selectable separately by each GM
- Native Roll20 whisper output remains available at all times

## Requirements

- A Roll20 game with Mod/API Script access
- The **Rollable Table Manager** script installed in the game's API Scripts page
- **ScriptCards** is optional. Install it only if you want the formatted ScriptCards output style.

## Installation

1. In Roll20, open the game’s **API Scripts** page.
2. Create a new script and paste in `RollableTableManager.js`.
3. Save the script and confirm that the API sandbox reports that the script is ready.
4. As a GM, enter `!tables` in chat.

The script sends its menus to GMs only. Players cannot open the menu or use its controls.

## Using the table browser

Enter:

```text
!tables
```

The first menu provides:

- **Favorites**: opens the current GM’s own starred-table list.
- **Native**: selects the built-in GM-whisper result panel.
- **ScriptCards**: selects the formatted ScriptCards result panel, when ScriptCards is installed.
- **Letter buttons**: opens tables beginning with that letter or number.

Each letter group is sorted alphabetically and split into pages of 25 tables.

For every table, the menu provides:

- **Roll**: makes one weighted roll from that table.
- **Edit**: opens the table-item editor.
- **Favorite / Unfavorite**: adds or removes the table from that GM’s personal favorites.

## Editing a table

The editor is also GM-only and displays items alphabetically, 25 per page.

- **Add item** prompts for an item name and weight.
- **Change** prompts for replacement text and a new weight.
- **Delete** asks for confirmation before removing an item.

The script changes the same Roll20 table items used by the native Rollable Tables interface. It does not change Roll20’s native table-list display order, because Roll20’s API does not expose a table-list position field.

## Output styles

### Native

The default. A roll is sent as a private GM whisper containing the table name and result.

### ScriptCards

If ScriptCards is installed, choose **ScriptCards** from the opening `!tables` menu. The result is then sent as one GM-only ScriptCards panel, with both the table title and result private.

Choose **Native** at any time to switch that GM back to the built-in panel.

The output choice is personal to each GM and is stored with that campaign’s script data.

## Notes and limits

- Favorites are personal per GM; one GM’s favorites do not change another GM’s list.
- Deleting a Roll20 table outside this script can leave a harmless stale favorite behind; it is automatically ignored.
- ScriptCards is optional. Leave the output setting on **Native** in games where ScriptCards is not installed.
- The script is intentionally button-driven after the initial `!tables` command, so table names do not need to be typed manually.

## Suggested repository files

```text
Rollable Table Manager/
├── RollableTableManager.js
├── README.md
└── script.json