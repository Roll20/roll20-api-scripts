# ChatTurnManager

A script to simplify Turn Order Management, and move it into chat.

## Commands

### `!turns-begin` / `!turns-start`

Sort the Turn Counter numerically descending, and add a turn counter to the
top of the order

### `!turns-clear`

Clear the turn order. **NOTE:** _THERE IS NO CONFIRMATION._

### `!turns-down <n> [--<before|after> prefix] name`

Add an item to the list that counts down from n. By default this is added to
the current end of the order. If `--before` or `--after` is provided, the
argument is used as a prefix search for a name to put the item before or
after.

### `!turns-up <n> [--<before|after> prefix] name`

Add an item to the list that counts up from n. By default this is added to the
current end of the order. If `--before` or `--after` is provided, the argument
is used as a prefix search for a name to put the item before or after.

### `!turns-clean`

Remove all elements with a counter of 0.

## Permission Notes

Clearing, loading, and starting the encounter is limited to GMs. Adding
counters is open to anyone. YMMV if this is a bug or a feature.

## Questions? Comments? Ideas? Bugs?

Feedback is welcome!

## License

All of the code of the API scripts in this repository is released under the MIT
license (see LICENSE file for details). If you contribute a new script or help
improve an existing script, you agree that your contribution is released under
the MIT License as well.
