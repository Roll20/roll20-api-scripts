*By keithcurtis, based on an original idea by kevin, with assitance and additions by Oosh, GiGs, bretmckee, and the Roll20 Dev Team*

This script creates token action macros for the selected token's character sheet. Tokens must represent character sheets, either PC or NPC. As of 2.0.0, three sheets are supported and auto-detected: D&D Fifth Edition (5e & 5.5e) ("Beacon"), D&D 5e (Classic) ("OGL"), and Pathfinder 2e (Official). Tokens on an unrecognized sheet (including PF2 via Demiplane) are skipped and reported rather than guessed at.

> *0.2.9, the script will also abbreviate common phrases like '(One Handed)' to '-1H'.*
>
> *0.3.3, the ability to protect specific token actions was added (put a period after the name).*
>
> *0.3.4, added support for the new npc bonus action repeating field.*
>
> *0.3.5, numerous fixes*
>
> *0.3.6, Added support for Pathfinder 2 by Roll20 Sheet. Oosh provided better function to allow saves and checks to account for global modifiers*
>
> *0.3.7, Bug fixes for Pathfinder 2 by Roll20 Sheet.*
>
> *2.0.0, merged with the separate "Token Action Builder" script to add full support for the D&D Fifth Edition (5e & 5.5e) ("Beacon") sheet. Sheet type is now auto-detected — you no longer add 'pf2' to the command for a Pathfinder 2e character (the keyword is still accepted, just ignored). Added `!ta sort` / `!sortta` (groups and alphabetizes NPC actions, and PC attacks, by type instead of leaving them in the sheet's own order) and a new `pspells` category (same as `spells`, but prepared spells only). Help is now split per sheet — run `!ta help`.*

**!ta** Creates a full suite of token action macros for the selected token's character. Actions for NPCs and Attacks for PCs. Run with the token(s) selected — macros are created as token actions, visible only when that token is selected.

**!ta [categories]** Create only the specified categories instead of the full default set (singular/plural both accepted). See the category lists below for what's available on each sheet.

**!ta name** Normally, Token Actions are created using the character_id. They will still function even if the character is renamed. However this is not always desireable. If a character is moved to a new game via the Character Vault, it will receive a new character_id, and the token actions will not function. If you intend to move the character, use the 'name' argument in the string and it will call the token actions by name. Can be combined with a category list: `!ta checks name`.

**!ta delete** Will delete unprotected token actions for the selected character. To protect a token action, end its name with a period. 'longsword' will be deleted. 'longsword.' will not. This allows you to keep any custom token actions from being affected by the script.

**!ta deleteall** Will delete ALL token actions for the selected character, whether they were created by this script or not. Use with caution — you'll be asked to confirm first.

**!ta sort** Same as `!ta`, but groups and alphabetizes NPC actions (and PC attacks, on the sheets where that applies) by type, using name prefixes, instead of leaving them in the sheet's own order. See your sheet's section below for the specifics (not recommended on Pathfinder 2e — see its notes).

**!ta help** Shows in-chat help: a short common page covering usage and the categories shared by every sheet, plus a button per sheet for that sheet's own categories and notes.

## Categories available on every sheet

- **spells**: Spellcasting chat menu.
- **pspells**: Same as spells, but only includes prepared spells (cantrips always included). Not part of the default set — run `!ta pspells` explicitly. Beacon and OGL only. On the OGL sheet it's a separate "Prepared-Spells" macro, which falls back to showing everything if the sheet has no spells marked prepared. On the Beacon sheet it writes to the same "Spells" macro as the regular `spells` category, since it's the sheet's own "prepared only" display filter that decides what's shown, not the command — running `spells` and `pspells` together on Beacon just means whichever ran last wins.
- **checks**: Ability and skill checks — dropdown showing each option's current modifier.
- **saves**: Saving throws — dropdown showing each option's current modifier.
- **init**: Initiative roll.

## D&D Fifth Edition (5e & 5.5e) by Roll20 Sheet ("Beacon")

- **attacks**: PC weapon attacks.
- **actions**: NPC actions.
- **trait** (or **feature**): Character features/traits. Not created for PCs unless requested, to keep the token bar manageable.
- **bonus**: NPC bonus actions.
- **reactions**: NPC reactions.
- **legendary**: NPC legendary actions.
- **mythic**: NPC mythic actions.

Notes:
- NPC action types are grouped in the token bar with name prefixes: _B.Bonus Actions, _R.Reactions, _L_Legendary, _M_Mythic.
- `!ta sort` also groups plain NPC actions this way (prefixed _A.), so they cluster together instead of scattering alphabetically among everything else on the token bar.
- Checks, Saves and Init are named with a leading period (.Check/.Save/.Init) so they sort to the top of the list.
- Beacon characters can take a while to process. You'll get a timestamped progress update in chat as each character finishes, and the API console log also records progress along the way — so if it looks stalled, it's usually still working.

## D&D 5e (Classic) by Roll20 Sheet ("OGL")

- **attacks** (or **actions** — same keyword here): PC weapon attacks, plus NPC actions, including legendary and mythic.
- **trait** (or **feature**): Character features/traits. Not created for PCs unless requested, to keep the token bar manageable.
- **bonus**: NPC bonus actions.
- **reactions**: NPC reactions.

Notes:
- NPC legendary/mythic actions are grouped in the token bar with name prefixes: _L_Legendary, _M_Mythic — same convention as Beacon.
- `!ta sort` groups and alphabetizes plain NPC actions and PC attacks (prefixed _A.) and bonus actions (prefixed _B.), also matching Beacon's naming. Reactions, traits, and mythic actions aren't affected by sort.
- Checks, Saves and Init are named with a leading period (.Check/.Save/.Init) so they sort to the top of the list.

## Pathfinder 2e (Official) by Roll20 Sheet

Sheet type is auto-detected — you no longer need to add 'pf2' to the command (the keyword is still accepted for existing macros, just ignored). In cases where there is an action cost, it will be indicated in the button name as `Action<#>`.

- **attacks**: PC weapon attacks, plus NPC melee/ranged strikes. TAM will append a '-M' or '-R' after the name to distinguish melee from ranged. Each attack has two buttons immediately following for Attack 2 and Attack 3, abbreviated using the first two characters from each word in the attack's name. Example: `Silver Dagger` → `SiDa-2` `SiDa-3`.
- **actions**: PC's general actions list.
- **offensive**: NPC offensive abilities.
- **reactive**: NPC reactive abilities.
- **interaction**: NPC interaction abilities.

Notes:
- Ranged strikes get a -R suffix, plus the two extra abbreviated buttons described above.
- `!ta sort` is not recommended for PF2 and has no effect here — alphabetizing would break the Attack-Attack2-Attack3 progression, so unsorted actions are created instead and a warning is shown.
- Checks, Saves and Init are named with a leading period (.Check/.Save/.Init) so they sort to the top of the list.

## Examples

**!ta** will create a full set of NPC or PC macros for the selected token's auto-detected sheet.

**!ta checks saves spells** will create token ability buttons for Checks, Saves, and the spellcasting chat menu only.

**!ta checks name** will create Checks, using the character name in the macro instead of the character id.

## Legacy commands (still recognized)

**!deleteta**, **!deleteallta**, **!sortta** — old command forms, kept working for existing macros.

The 'pf2' keyword is still accepted but ignored — sheet detection is automatic now.