# WildShapeResizer

A script to automatically resize a Rollable Table Token when a different side
is chosen. It does this by repurposing the “weight” attribute of the Items in
the Rollable Table. It was written with D&D Druid Wild Shape tokens in mind,
but would work for any square rollable table tokens from which players will
choose different sides.

The script listens to token:change events, looks for a table with the same name
as the token, and updates the token size when the side changes, so no other
configuration should be required.

## Known Issues

The token ends up centered on its original location. The script currently
attempts to move it to the original left,top position, but this does nothing.

The chat command to update a token’s list of sides from the table (when new
items are added) has been removed, because the API support required is not
(yet?) there.

## Planned Features

Once moving the token after resize works, I may take some time to make it
smarter, and try to keep from overlapping existing tokens.

## Questions? Comments? Ideas? Bugs?

Feedback is welcome!

## License

All of the code of the API scripts in this repository is released under the MIT
license (see LICENSE file for details). If you contribute a new script or help
improve an existing script, you agree that your contribution is released under
the MIT License as well.
