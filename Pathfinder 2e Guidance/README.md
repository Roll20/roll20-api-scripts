# Guidance

API for Roll20 and Pathfinder 2e Grab it and try it!

This is a tool to support the Pathfinder GMs in Roll20.

Guidance allows you to import stat blocks from Archive of Nethys and PFS Society Modules, into the NPC tab of the
Pathfinder 2 character sheet.

Guidance provides 2 primary functions. Click on a token that has been linked to a character sheet.

!sf_populate - When a token has been linked to a character sheet, it will read the statblock from the *GM Notes* section
of the *character sheet* and populate the appropriate values in the NPC tab of the character sheet. It also configures
other details about the linked token: HP, AC, and Name. It will generate token macros for Initiative, Saves, and all
parsed weapon attacks.

**usage**:  `!sf_populate`

!sf_clean - This command will erase an entire character sheet. Note that you must type "CONFIRM" to allow it to delete.
The parameter "ABILITIES" will clear out all abiltiies on the character sheet including token macros.

**usage**:  `!sf_clean CONFIRM`

If you find any issues, feel free to reach out to me at russell@theresdev.com.