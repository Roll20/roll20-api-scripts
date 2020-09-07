# ChatTurnManager

A script to simplify Turn Order Management, and move it into chat.

## Commands

### `!turns-begin` / `!turns-start` (GM Only)

Sort the Turn Counter numerically descending, and add a turn counter to the
top of the order

### `!turns-clear` (GM Only)

Clear the turn order. There is no confirmation, but the GM gets a whisper with
a load command to restore what was just cleared, if done in error.

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

Remove all elements with a counter of 0 (or less).

### `!turns-remove prefix` / `!turns-rm prefix` (GM Only)

Remove the element first with the given prefix.

### `!turns-load <JSON string>` (GM Only)

Load the turn order from a blob of JSON data.

### `!turns-append <JSON string>` (GM Only)

Append the turn order data from a blob of JSON data to the current list.

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
