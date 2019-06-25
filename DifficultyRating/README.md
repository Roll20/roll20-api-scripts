# Difficulty Rating

A 5th Edition Dungeons & Dragons encounter calculator.  It is compatible with the OGL and 5e-Shaped character sheets.

## Setup

Once installed, upon API startup, Difficulty Rating will prompt the user in the chat to configure it for either OGL or 5e-Shaped character sheets (this can be changed later).

## Commands

- `!dr` will show the menu and has buttons corresponding to the other commands.
- `!dr --setMode [OGL|5e-Shaped]` will reconfigure Difficulty Rating for a different character sheet type.
- `!dr --addPlayer [level] ^[player name]^` will add the player with the level to the default party list.
- `!dr --calculate` will calculate the difficulty of an encounter between the default party and any selected NPC tokens.

## Operation

After initial setup, simply add your player characters to the default party, drag some NPCs onto the board, select them, and click the Calculate button.

## Links

### Credits

- Author: [Michael G.](https://app.roll20.net/users/1583758/michael-g)/[VoltCruelerz](https://github.com/VoltCruelerz)
- Designer: [Wolf Thunderspirit](https://app.roll20.net/users/2762597)

### Sourcing

- [Github](https://github.com/Roll20/roll20-api-scripts/tree/master/DifficultyRating)
- [Forums](https://app.roll20.net/forum/post/7542136/script-difficulty-rating-5e-encounter-calculator)

## Version History

- 1.00: Initial Release
- 1.03: Improve 5e-Shaped compatibility