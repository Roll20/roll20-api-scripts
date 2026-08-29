# Language Access Manager v1.0.0

Language Access Manager provides permanent and temporary language permissions, rules-aware Comprehend Languages and Tongues effects, generated GM/player macros, and non-destructive setup for Roll20. It ships with a standard D&D registry, a Tal'Tamaira preset, and safe custom-language commands.

## Why I built this

I originally built Language Access Manager for my own Tal'Tamaira campaign, where I use a full set of custom languages rather than treating language as a simple line on a character sheet. Each language has its own hidden Roll20 character sheet, and controlling that sheet acts as membership of the language group. When the GM whispers a translation to that hidden sheet, only the players whose characters understand the language receive it.

That system made languages feel meaningful in play, but managing it manually became increasingly awkward. Granting Comprehend Languages could mean adding one player to more than twenty language sheets and then removing them all later without accidentally taking away languages the character already knew. Tongues introduced a different problem because it affects spoken communication without granting the ability to read inscriptions. Permanent language changes, temporary magical effects, player-specific language menus, and custom campaign terminology all needed to coexist without damaging existing permissions.

Language Access Manager grew from that need. It keeps the hidden-sheet approach, automates the repetitive permission work, distinguishes spoken and written understanding, and restores temporary changes safely. I later expanded it with a standard language preset, configurable registries, setup tools, and generated macros so other GMs can use the same system without first building the entire structure by hand.

## Install

1. Open the campaign's Mod/API Scripts page.
2. Create a new script named `LanguageAccessManager`.
3. Paste in the complete contents of `LanguageAccessManager.js`, save it, and confirm the API console reports `Language Access Manager v1.0.0 ready`.
4. Run `!lang setup`, choose a registry preset, create missing sheets, grant GM access, and rebuild the GM macros.

All commands are GM-only. Put names containing spaces in straight quotation marks.

## Commands

```text
!lang help
!lang list
!lang grant "Player Display Name" all
!lang grant "Player Display Name" Elvish
!lang grant "Player Display Name" "Elvish, Deep Speech"
!lang restore "Player Display Name"
!lang status "Player Display Name"
!lang setup
!lang setup validate
!lang setup create-sheets
!lang setup grant-gm
!lang rebuildmacros
!lang playermacro "Player or Character"
!lang manage "Player or Character"
!lang permanent add "Player or Character" "Elvish"
!lang permanent remove "Player or Character" "Elvish"
!lang comprehend "Player or Character"
!lang tongues "Player or Character"
!lang end "Player or Character" comprehend
!lang end "Player or Character" tongues
!lang registry preset standard
!lang registry preset tal-tamaira
!lang registry add "Display Language" "Exact Sheet Name"
!lang registry remove "Display Language"
```

An exact character name may replace the player name when that character has exactly one controller. If it resolves to several players—including a GM who also controls it—the command stops and asks for an exact player display name.

## Safe first test

1. Choose one test player and note one hidden sheet they permanently control and one they do not.
2. Run `!lang list` and confirm the hidden sheets are found.
3. Run `!lang status "Test Player"` and save the reported current access.
4. Run `!lang grant "Test Player" all`.
5. Run `!lang status "Test Player"`; all found languages should now be accessible.
6. Optionally run the same grant again. It must not replace the original baseline.
7. Run `!lang restore "Test Player"`.
8. Run `!lang status "Test Player"`. The access list should match step 3, including the permanently known language.

Test in a copy of the campaign first. JavaScript syntax checking cannot prove Roll20 sandbox behaviour.

## Architecture and extension points

- `REGISTRY`: display-language to hidden-sheet mapping, isolated from the permission engine.
- `state.LanguageAccessManager.sessions[playerId]`: persistent per-player session containing each touched sheet ID and its exact original `controlledby` value.
- Resolver layer: exact player ID/display-name or exact character-name resolution, rejecting ambiguous recipients.
- Permission layer: snapshot-once grant and exact restore, independent for every player.
- Command/UI layer: native `sendChat()` feedback with no ScriptCards dependency.

## Setup and generated GM macros

New installations default to the 16-language standard D&D preset. The standard sheet names are `Common Language`, `Elvish Language`, `Deep Speech Language`, and so on. Selecting another preset changes only the registry: it never deletes or renames sheets, macros, or player permissions.

Custom additions are persistent. Removing a registry entry does not delete its character sheet. After any registry change, validate sheets and rebuild the generated macros.

`!lang setup` opens a native GM-only setup card. Validation is read-only. **Create missing sheets** creates only registry sheets whose exact names do not exist; it never edits an existing sheet. New sheets are controlled by the GM who invokes creation and have blank `inplayerjournals` fields.

`!lang setup grant-gm` safely adds the invoking GM to all existing language sheets while preserving every existing player controller and journal-visibility setting. This is useful for sheets created by an earlier version.

`!lang rebuildmacros` creates or updates these two macros owned by the GM who runs the command:

- `Language-Spoken-GM`
- `Language-Inscription-GM`

Both language menus are generated from the registry. Existing macros owned by other users are not touched. If the invoking GM owns duplicate macros with one of these names, the script reports the ambiguity without changing them.

## Optional player macro

After assigning a player to their permanent language sheets, run:

```text
!lang playermacro "Ayla Ytger"
```

This creates or updates `Language-Speak`, owned by the resolved player. Its language query contains only that player's permanently assigned languages. If the player currently has a temporary grant, the generator reads the saved pre-grant snapshot so temporary languages are not added to the macro. Run the command again whenever permanent language assignments change.

When a player knows exactly one language, the generated macro whispers directly to that language sheet instead of presenting a one-option language query.

The command refuses to create an empty macro, refuses to proceed while registry sheets are missing or duplicated, and does not change duplicate same-name macros owned by the target player.

## Player language management

`!lang manage "Player or Character"` opens a GM-only card showing permanent languages, add/remove buttons, temporary-session status, and controls to rebuild the player's macro, grant all temporarily, restore, or refresh the card.

Permanent changes are safe during an active temporary grant. The script updates the saved baseline: adding a permanent language ensures it remains after restore, while removing one prevents restore from reinstating it. The player macro is rebuilt only when the GM clicks its button, allowing several language changes to be made first.

Remaining planned phases are marked as TODOs in the source: a state-backed configurable registry and an optional bulk player-macro rebuild command.
