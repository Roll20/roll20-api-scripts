*By keithcurtis, based on original code by kevin, with assitance and additions by Oosh, GiGs, and bretmckee*

This script creates token actions on selected tokens for the D&D 5e by Roll20 sheet. Tokens must represent character sheets, either PC or NPC.

> *0.2.9, the script will also abbreviate common phrases like "(One Handed)" to "-1H".*
> 
> *0.3.3, the ability to protect specific token actions was added (put a period after the name).*
> 
> *0.3.4, added support for the new npc bonus action repeating field.*
> 
> *0.3.5, numerous fixes*
> 
> *0.3.6, Added support for Pathfinder 2 by Roll20 Sheet. Oosh provided better function to allow saves and checks to account for global modifiers*

**!ta** This command will create a full suite of token action buttons for a selected character. Actions for NPCs and Attacks for PCs.

**!sortta** This command functions identically to !ta, but will prepend "a-" to NPC actions, and "la-" to NPC Legendary Actions. This is for users who like to alphebetize Token Actions. This is not recommended for the PF2 sheet, as it breaks the logical progression of Attack-Attack2-Attack3.

**!deleteta** will delete unprotected token actions for the selected character. To protect a token action, end its name with a period. "longsword" will be deleted. "longsword." will not. This allows you to keep any custom token actions from being affected by the script.

**!deleteallta** will delete ALL token actions for the selected character, whether they were created by this script or not. Use with caution.

## D&D 5th Edition by Roll20 Sheet
You can create specific classes of abilities by using the following arguments separated by spaces:
- **attacks** Creates a button for each attack. In the case of NPCs, this includes all Actions. (PC/NPC)
- **trait**s Creates a button for each trait. PCs can have quite a number of these, so it is not recommended to run this command on PCs. (PC*/NPC)
- **pc** creates full suite of buttons for everything but traits. Although this will also work on npcs, the intent is to not include trait buttons for pcs, which can get rather numerous. 
- **bonusactions** Creates a button for each bonus action. This will be ignored on PCs since only NPC sheets have a repeating attribute for bonus actions. (NPC)
- **reactions** Creates a button for each reaction. This will be ignored on PCs since only NPC sheets have a repeating attribute for reactions. (PC)
- **spells** Creates a button that calls up a chat menu of all spells the character can cast. (PC/NPC)
- **checks** Creates a drop down menu of all Ability and Skill (Ability) checks. Recommended for NPCs, as PC checks and Saves can be affected by many different abilities as levels progress, that this script cannot account for. (PC*/NPC)
- **saves** Creates a dropdown menu of all saving throws. Recommended for NPCs, as PC checks and Saves can be affected by many different abilities as levels progress, that this script cannot account for. (PC*/NPC)
- **init** Creates a button that rolls initiative for the selected token (PC/NPC)
- **name** Normally, Token Actions are created using the character_id. They will still function even if the character is renamed. However this is not always desireable. If a character is moved to a new game via the Character Vault, it will receive a new character_id, and the token actions will not function. If you intend to move the character, use the "name" argument in the string and it will call the token actions by name.
- **help** Calls up this help documentation

Examples:

**!ta saves checks** will create token ability buttons for Ability Checks and Saving Throws.

**!ta name** will create alltoken ability buttons and identify them by name, rather than character_id.

## Pathfinder Second Edition by Roll20 Sheet
All PF2 use requires adding the argument "pf2" to the argument list. Otherwise the script will try to create Token Actions for the 5e sheet. Until all sheets have a uniform sheet identifier attribute, this is necessary. In cases where there is an action cost, it will be indicated in the button name as `Action<#>`.
You can create specific classes of abilities by using the following arguments separated by spaces:
- **pf2** *Required on all PF2 commands*
- **attacks** Creates a button for each attack. TAM will append a '-M' or '-R' after the name to distinguish melee from ranged. Each Attack will have a two buttons immediately following for Attack 2 and Attack 3. These will be abbreviated using the first two characters from each word in the Attack. Example `Silver Dagger` `SiDa-2` `SiDa-3` (PC/NPC)
- **reactive**  Creates a button for each reaction (NPC)
- **offensive**  Creates a button for each offensive ability (PC/NPC)
- **spells** Creates a button that calls up a chat menu of all spells the character can cast. These are separated by innate, focus, cantrips and normal spells. Normal Spells are separated by level. (PC/NPC)
- **actions** Creates a button for each normal action (NPC)
- **checks** Creates a drop down menu of all Skill check (PC/NPC)
- **saves** Creates a dropdown menu of all saving throws (PC/NPC)
- **init** Creates a button that rolls initiative for the selected token, obeying the skill chosen on the character sheet. The skill cannot be chosen without API interaction, so it will need to be manually chosen. (PC/NPC)
- **name** Normally, Token Actions are created using the character_id. They will still function even if the character is renamed. However this is not always desireable. If a character is moved to a new game via the Character Vault, it will receive a new character_id, and the token actions will not function. If you intend to move the character, use the "name" argument in the string and it will call the token actions by name.

Examples:

**!ta pf2** will generate a full suite of token actions For PCs, this would be the same as typing `!ta pf2 checks saves attacks offensive reactive interaction spells`. For PCs, this would be the same as typing `!ta pf2 checks saves attacks offensive spells`.

**!ta pf2 saves checks** will create token ability buttons for Skill Checks and Saving Throws.

**!ta pf2 name** will create all token ability buttons and identify them by name, rather than character_id.
