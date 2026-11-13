# Changelog

## 1.0.0 (2026-11-04)

A full rewrite by MidNiteShadow7 of Robin Kuiper's SyncPage 0.1.9, which had not changed since 2018. The 0.1 set-up is carried over and `!sync` still works.

### Fixed

- Jumpgate drawings and walls (`pathv2`), doors and windows were never mirrored.
- An object made on any page was copied to every page whose name contained that page's name ("Town" → "Town Hall", "Old Town"), even with no `_synced` pages at all.
- Deleting anything on a page that was not synced threw an error in the API console.
- Every sandbox start emptied and rebuilt every copy, so object IDs changed (turn order, TokenHome and other Mods lost track), hides on copies were lost and players' tokens were recreated.
- Links were wiped on every start (`setDefaults` checked the wrong key), so with Reload Refresh off nothing stayed linked.
- The original page was found with `split('_')`, so "Forest_Road_synced" linked to "Forest", and names were matched case-sensitively.
- When the original page was missing, syncing stopped until the next restart.
- Show/Hide wrote the text "undefined" into GM Notes, and moved the source token's layer as well as the copies'.
- A token whose picture could not be copied crashed the copy, or got a placeholder picture.
- Page settings went only from the original to one `_synced` page, missed every Jumpgate lighting setting, and archiving the original archived the copy.
- Read-only properties were passed to `createObj`, and GM Notes were never copied.
- Changes made by other Mods were never mirrored and could not be repaired.
- Renaming a page to end in `_synced` wiped and rebuilt it without warning.

### Added

- **Named sync groups**, made from the menu or with `group create` / `group add`, stored by page ID so renaming a page is safe. Any number of pages per group, with a source page as the reference.
- **Pairing**: a page made with Roll20's Duplicate Page is matched object by object (marketplace art kept), and anything missing is copied. Objects that match nothing are handled by a setting: ask, copy or leave.
- **Per-copy hiding** kept in state, in two modes: GM layer, or remove and recreate (nothing left for players to find; turn order kept).
- **Players card**: who is on which page, buttons to move each player (split party), gather everyone and restore the layout, and a show/hide grid for selected tokens.
- **Repair** with a preview, **Pause/Resume**, **Undo** and a **Recycle bin** per group.
- Settings, each with every option, globally and per group: delete mode, hide mode, leftovers, new objects, token properties and page settings kept per page, layers not synced, page settings on/off, repair on start, player card, recycle bin size, language.
- TokenMod changes are mirrored; a public API (`getGroup`, `getLinked`, `notify`, `isHidden`, `onSync`, `repair`) for other Mods.
- **SyncPage - Help** and **SyncPage - Command Deck** handouts, in 24 languages. One-Click options for every setting.

### Changed

- The main command is `!syncpage`; `!sync` and 0.1's custom command still work.
- State lives in `state.SyncPage`; 0.1's `state.SYNCPAGE` is read once and left in place.
- **True Copy** is gone: Roll20's Duplicate Page does it better.

## 0.1.9 (2018-04-29)

By Robin Kuiper. The only version released in the Roll20 Mod library.

- Added **True Copy** (a config option, on by default): when a page is duplicated, every token, drawing and text on the original is copied onto the page whose name ends in "(Copy)".
- Later fixes in the Roll20 repository, with no change of version: the script.json config was corrected (Jeffrey Lamb, 2018-05-08), and misplaced entries and wrong types in script.json were fixed (Aaron C. Meadows, 2021-02-05).

## 0.1.8 (2018-04-28)

By Robin Kuiper. The first beta, on Robin's GitHub only.

- Show and hide tokens per page: **Show Here**, **Hide Here**, **Show on Other pages** and **Hide on Other pages** in the `!sync` menu, stored as flags in the token's GM Notes. "Here" flags win over "other pages" flags.
- **Reload Refresh** (on by default): rebuild every synced page when the sandbox starts.
- Help menu changed; the folder was renamed from "SyncPage - WIP" to "SyncPage".

## 0.1.0 (2018-04-25)

By Robin Kuiper. Work in progress, on Robin's GitHub only ("SyncPage - WIP").

- A page named like another page with `_synced` added is kept in step with it: tokens and text created, changed or removed on one are done on the other, and the original's page settings are copied.
- Drawings (paths) were added on 2018-04-26.
- A config menu (`!sync config`) to change the command, and `!sync reset`.
