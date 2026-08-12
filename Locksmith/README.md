# Locksmith

Automatic lock-picking and Knock spell resolution for D&D 5e in Roll20 - works with both the legacy (5e) and Beacon (5.5e) character sheets.

Roll20 has no native trigger for "a player clicks a locked door," so lock-picking has always meant manual GM adjudication. Locksmith closes that gap: set a difficulty on a door or window once, and from then on a player's own Thieves' Tools roll - or a Knock spell - is automatically checked against the nearest locked door/window in range. No extra command on the player's side.

## Features

- **Automatic pick resolution** - Thieves' Tools rolls are detected and compared against the nearest locked door/window in range, on both the legacy and Beacon sheets. Success posts an Unlock button; failure never reveals the DC.
- **Knock spell support** - detected automatically, no roll involved, and can bypass Magic-only locks that mundane picking can't.
- **No custom data storage for lock state** - the difficulty is encoded directly into the door/window's own color property, so it survives page duplication, copy/paste, and everything else Roll20 already does to that property.
- **GM setup menu** (`!lock`) - set a DC, mark a lock Unpickable or Magic-only, and toggle on-map status labels (which turn yellow if a key-holder is already on the map).
- **Keys and keyrings** - hand a key to a token directly, or generate a self-service loot macro for treasure. Each character's `!keyring` report lets them Use (toggle), Give, or Drop a key, plus a "Try all Keys" button that finds the nearest match automatically.
- **One-click token action** - `!keyring` can be added as a token action, so players never type a command.
- **In-game help** - `!lock --help` builds a full handout (GM and player sections, screenshots, jump links) right in your game.

## Installation

Install via Roll20's One-Click API script installer (search "Locksmith"), or copy `Locksmith.js` into a new API script in your game's API Scripts page.

## Getting Started

1. Select a door or window on your map.
2. Run `!lock` to open the setup menu.
3. Use the **Set** row to give it a DC, or mark it Unpickable/Magic.

From there, players just make Thieves' Tools checks or cast Knock as normal - Locksmith handles the rest. Run `!lock --help` at any time for the full documentation, including a player-facing section you can point your table to directly.

## Commands

| Command | Who | What it does |
|---|---|---|
| `!lock` | GM | Opens the setup menu (select doors/windows first for per-lock options) |
| `!lock --report-dc` | GM | Lists every selected door/window's status, or the whole page if nothing is selected |
| `!lock --help` | Anyone | Creates or refreshes the help handout |
| `!keyring` (or `!lock --keyring`) | Anyone | Reports the selected token's keys - requires a token to be selected |

Everything else - setting a DC, marking a lock Unpickable/Magic, granting or looting a key, giving/dropping a key, toggling map labels, creating the `!keyring` token action - is reached through buttons in the menu and reports above, not additional typed commands.

## Notes

- A door or window needs *both* a DC/Unpickable/Magic setting *and* Roll20's own locked state turned on before a pick attempt or Knock will do anything with it.
- Manually changing the color of a door/window Locksmith manages can break its ability to track that lock - use the menu to reconfigure it instead.
- All key-related output (granting, looting, keyring reports, Use/Give/Drop) is private to the GM and whoever ran the command - it's never broadcast to the table, unlike pick-attempt and Knock outcomes, which might be public, depending on sheet settings.

## Changelog

**1.0.0** - Debut release.
