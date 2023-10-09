# Guidance

API for Roll20 and Pathfinder 2e

This is a tool to support the Pathfinder GMs in Roll20.

Guidance allows you to import stat blocks from Archive of Nethys and PFS Society Modules, into the NPC tab of the
Pathfinder 2 character sheet.

To use Guidance, Click on a token that has been linked to a character sheet and type the command.

### Here are the commands currently available:

**!pf_npc** - When a token has been linked to a character sheet, it will read the statblock from the *GM Notes* section
of the *character sheet* and populate the appropriate values in the NPC tab of the character sheet. It also configures
other details about the linked token: HP, AC, and Name. It will generate token macros for Initiative, Saves, and all
parsed weapon attacks.

**usage**: Click the token that represents the NPC and type `!pf_npc` into chat

**!pf_clean** - This command will erase an entire character sheet. Note that you must type "CONFIRM" to allow it to
delete.

**usage**:   Click the token that represents the NPC and type `!pf_clean CONFIRM` into chat

**!pf_token** - This command configures the NPC token for GM use. It verifies the name and other details can only be
seen by the GM and will link AC and Hitpoints to the token's indicators.

**usage**:  Click the token that represents the NPC and type `!pf_token`  into chat

**!pf_pcbuilder** - ***BETA*** This command allows you to import a player character from PathBuilder. Generate the JSON
as you would for Foundry, and then copy it and put it into the "Bio & Info" section of the character sheet (middle tab).
Then select the token and run this command. I will import the character and do some basic configuration of the Token.

**usage**: Click the token that represents the NPC and type  `!pf_pcbuilder` into chat

**!pf_pctoken** - ***BETA*** The command configures a token for a player character. When you select the token and run
this command, it will fix a number of common problems with the token to make it usable in Roll20 by players. If the
token is not linked to a character sheet, it will put the RED X over the token to make it easy to identify.

**usage**: Click the token that represents the NPC and type `pf_pctoken` into chat

If you find any issues, feel free to reach out to me at russell@theresdev.com.


