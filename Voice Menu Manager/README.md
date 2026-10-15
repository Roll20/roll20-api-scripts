# Voice Menu Manager

By **Kingkiller546** · version 1.0.0 · MIT licence

Build and maintain Roll20 voice menus through chat. A setup wizard creates private macros and voice tables; GMs can then add kingdoms, settlements, characters and recording entries without editing JavaScript or nested query escaping.

This is a standalone script. It has no dependency on ScriptCards, TokenMod, a table manager, or another voice script. It uses existing Jukebox audio and does not generate, upload or distribute recordings.

## Install and begin

1. Add the contents of `VoiceMenuManager.js` as one Mod script in your game's script editor and save it.
2. As a GM, enter `!vmm` in chat.
3. Choose **Create a menu** and pick a structure:
   - **Settlements → NPCs** for a region without kingdom grouping.
   - **Kingdoms → Settlements → NPCs** for a grouped region.
   - **Narration** for Session Intros, Scenes, Dreams and Visions.
4. Enter the menu name and macro name, then review and save.
5. For NPC menus, add kingdoms and settlements. For narration, add your characters.
6. Open **Recordings** to add your recording labels and keys, or use your preferred rollable-table editor. Select **Regenerate** afterwards.
7. Add the generated macro to your macro bar from Collections. It is private to its GM owner by default.

The wizard saves a draft per GM. Cancelling setup does not create a macro, table or menu. GMs share the campaign configuration, while generated macro copies are tracked separately for each GM. Another GM can generate a private copy using **Regenerate**.

## Audio and table entries

The default Jukebox naming convention is `voice_<key>`:

| Jukebox title | Table item | Direct command |
| --- | --- | --- |
| `voice_captainvale` | `Captain Vale::captainvale` | `!vmm play captainvale` |
| `voice_captainvale` | `Captain Vale::voice_captainvale` | `!vmm play voice_captainvale` |

Both bare keys and full prefixed titles work. Lookup ignores case and outer whitespace, but otherwise spelling and punctuation must match. Duplicate Jukebox titles are reported rather than choosing an arbitrary track.

Selecting a recording stops other Jukebox tracks whose titles start with the configured voice prefix, then plays the selected track with looping disabled. Music and ambience outside that prefix are left alone. Selecting the track already playing does not deliberately restart it. Rapid requests supersede earlier pending playback requests.

All menu dropdowns include **Cancel** at the bottom. Cancel leaves current and pending playback alone. Empty menus contain a no-entries placeholder and Cancel, which prevents Roll20 treating a single option as an editable text default.

### Entry restrictions

Use `Display Name::trackkey` for ordinary recordings. Structured character entries described below use three fields.

Labels support spaces, apostrophes, hyphens, commas and ampersands. They cannot contain pipes, braces, line breaks, angle brackets, `#`, `[[` or `::`, and each label field is limited to 140 characters. Track keys are limited to 200 characters and reject query/control characters. Cancel and Regenerate menus are reserved display labels. Macro names use letters, numbers, hyphens and underscores, with a maximum of 80 characters.

If an entry is invalid or duplicate labels would make a dropdown ambiguous, regeneration reports the problem and retains the previous macro contents. Fix the table entry and regenerate again.

## NPC menu management

A menu can represent a continent, country, campaign, region or any other collection. Each menu has its own macro and Regenerate option.

- **Add kingdom / Add settlement:** create the menu structure through chat. Adding a settlement creates a private empty table automatically.
- **Rename:** change the displayed kingdom, settlement or menu name.
- **Move kingdom:** move a settlement to another kingdom within the same grouped menu.
- **Link existing table:** pick an existing table from an alphabetical, paginated list. Linking does not merge or alter either table.
- **New table:** create a replacement empty table for a location or narration category. Any previous table is retained.
- **Detach settlement:** remove the location from the menu while retaining its table and all recording entries. A confirmation is required.
- **Remove kingdom:** remove an empty kingdom. Move or detach its settlements first.
- **Archive menu:** hide the menu and disable its generated playback macros. Tables, entries and macro objects remain available. Restore it from **Archived menus**.

Table references use Roll20 IDs, so you can rename a linked table without breaking regeneration. Macro references also use IDs; renaming a generated macro does not prevent updates or create a second copy. **Default macro name** changes the name used for future macro creation, while existing macro names are retained.

If a linked table is deleted in Roll20, its menu reports that it is missing. Link another table or create a replacement; the script does not silently substitute a same-named table. If an untracked macro already uses the desired default name, the script refuses to overwrite it.

## Narration menus

Narration creates four empty, ID-linked tables:

- **Session Intros:** a naturally sorted recording list. Use `Prequel 01`, `Session 01`, `Session 02`, etc.; written number words are not interpreted as numbers.
- **Scenes:** a naturally sorted recording list.
- **Dreams:** Character → Recording.
- **Visions:** Character → Recording.

Add your own characters through **Manage**. No campaign characters or recordings are preloaded. Each character receives its full name and a short first-name prefix by default. **Prefixes** lets you change the accepted prefixes, separated by semicolons. Renaming a character retains the previous full name as an alias so existing entries continue to match.

For grouped narration, the most explicit format is:

```text
Morgan Reed::01 - The Forest::voice_forest
```

Alternatively, use a character prefix:

```text
Morgan 01::voice_forest
Morgan Reed 01 - The Forest::voice_forest
Morgan - The Forest::voice_forest
```

These are alternative ways to label one recording; do not add duplicate entries for the same recording. The character prefix is removed from the final recording label because the character has already been selected. Numbered titles sort naturally, so 2 comes before 10, with zero-padded titles also supported.

Matching is case-insensitive. Spaced hyphens, en dashes and em dashes are accepted between a character prefix and title. If a short prefix matches more than one character, the recording appears under **Unassigned**. Unrecognised or removed character names also appear there; their recordings are not hidden or deleted. Use a full name or adjust prefixes to resolve ambiguity. **Unassigned** is reserved for that fallback group and cannot be a character name.

The built-in recording editor offers separate character, title and key fields for Dreams and Visions. Leave Character blank to use the prefix format instead.

## Recording editor

**Recordings** provides paginated Add, Edit and Remove actions. Add and Edit use a short wizard with a review step. Removing a table item requires confirmation and does not delete its Jukebox audio. Weights are ignored when building menus; the editor creates new entries with weight 1 and retains existing weights when editing.

Changing entries in this editor or another table editor does not automatically rebuild the macros. Regenerate when ready. Changes to menu structure, table links or characters automatically attempt a rebuild; a rebuild error is reported without overwriting working macro contents.

## Commands

Most commands are generated by the chat buttons. These are the useful entry points:

| Command | Purpose |
| --- | --- |
| `!vmm` | Open the menu manager. |
| `!vmm wizard` | Start setup. |
| `!vmm help` | Show in-game help. |
| `!vmm settings` | Configure the track prefix and player playback. |
| `!vmm play key` | Play a matching prefixed Jukebox track. |
| `!vmm play TableName` | Roll a weighted table, then play its selected item. |
| `!vmm regenerate --menu MENU_ID` | Rebuild one menu and its existing GM macro copies. |
| `!vmm audit --menu MENU_ID` | Check table validity, missing tracks and duplicate track titles. |

Menu IDs are stored by the script and included in its generated chat links; users normally do not need to type them. This script deliberately uses **`!vmm`**, not `!voice`, so it does not register another handler for an existing voice script. Running multiple audio scripts can still cause them to stop tracks sharing the same prefix; use only one playback system at a time when testing.

Weighted table playback accepts plain keys as legacy table items, as well as the two- and three-field formats above. It ignores zero/negative weights. Duplicate table names are rejected for name-based weighted playback. Menus use table IDs, so duplicate table names do not affect their lookup.

## Settings and permissions

Configuration, table editing and regeneration are GM-only. Player playback is also GM-only by default. **Settings → Allow players** enables players to use direct playback and generated menu commands; it does not grant configuration access or automatically share private macros.

Changing the prefix requires confirmation. A prefix is non-empty, starts with a letter and contains up to 32 letters, numbers, underscores or hyphens. Existing track titles and keys are not renamed. Use a distinctive prefix to keep voices separate from music. Keys entered without a prefix use the current prefix; full keys using an old prefix must be updated when the prefix changes.

Management messages and playback notices are whispered to GMs. Chat contains no audio generation, external requests or remote dependencies. Configuration is stored in `state.VoiceMenuManager`; tables, table items, macros and Jukebox tracks use their normal Roll20 objects. Back up campaign data before deliberately removing the script state. Copying tables into another campaign does not transfer this script's relationships; run setup there and link the copied tables.

## Testing this candidate

This package is a publication candidate, not a claim of Roll20 acceptance. Automated tests run in a mock Roll20 environment and cannot verify the live client, audio delivery or its exact query rendering.

In a clean test game:

1. Add Jukebox tracks such as `voice_captainvale` and `voice_forest`.
2. Install this script alone and run `!vmm`.
3. Create a grouped NPC menu, a kingdom and a settlement. Add `Captain Vale::voice_captainvale` using Recordings.
4. Regenerate and use the macro. Check playback, the single-recording dropdown and Cancel.
5. Rename the table in Collections, regenerate and confirm it still works. Rename the macro and confirm its ID is reused.
6. Create narration, add a character and a Dream recording; test Character → Recording.
7. Check empty menus, moving/detaching settlements, table relinking, and archive/restore.
8. Confirm Check tracks reports a deliberate typo and that music without the voice prefix continues playing.

Run automated tests with Node.js 18 or newer, from this folder:

```sh
node --test tests/VoiceMenuManager.test.cjs
node tests/validate-package.cjs
```

The metadata validator uses the included copy of Roll20's official schema. The author's numeric Roll20 user ID is supplied in `script.json`. Before submission, run:

```sh
node tests/validate-package.cjs --release
```

## Repository package

The folder name matches the script name in `script.json`. The root script and `1.0.0/VoiceMenuManager.js` are identical. The package includes the README, MIT licence, metadata, automated tests and third-party schema attribution. See `PUBLICATION.md` for author-reported live test results and remaining submission steps.
