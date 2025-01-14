Hunter's Mark
=============

A script that lets each character have their own custom Status Marker, which they can use to mark other tokens. There are two settings. If you are a hunter-like character, you can mark only one target at a time. When you mark a new target, the old marker is removed frm all tokens but yourself and the target. This is perfect for abilities like D&D's Hunter's Mark.
The second setting lets you mark any number of characters.

Run this script with `!hunters-mark ` followed by one of the commands below.

Available Commands
==================

* `help`: Shows a detailed help file, and the menu buttons afterwards.
* `add`: Select a character who has exactly one token marker assigned. Then click Add or Hunter, and that character will be added to the list of hunter-like characters, and the marker will be the one they use to mark targets.
* `bard`: exactly as above. Select a character with one status mark assigned. But they rae added to rhe list of bard-like characters, and can assign marks to multiple targets simultaneously. Maybe all characters will be added here, depending on how you use marks.
* `delete`: Delete a character from all displayed lists.
* `show`: Show a list of characters with their markers, and the menu buttons afterwards.
* `menu`: prints a set of buttons, to activate the scripts commands.

Marking or Unmarking a Target
=============================

* `!hunters-mark @{selected|token_id} @{target|token_id}`: To mark or unmark a target, you need to supply your own token id, and the token id of a target. The same command is used to mark or unmark a target.
Important: this has changed with version 0.4 to support bard-like characters. Previous versions used to use `@{selected|character_id}` - but you MUST now use `@{selected|token_id}`. Update any macros (this script's buttons are automatically updated).

Hunter and Bard
===============
The two types of behaviour are classified as Hunter and Bard, because most people will be familiar with D&D. If you can think of alternate terms for these, send then to Gigs on the roll20 forums.

