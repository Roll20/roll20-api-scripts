# Guidance
API for Roll20 and Starfinder
Version 2.0.0

This is a tool to support the usage of the Starfinder (Simple) character sheets in Roll20\. It has the ability to read a statblock from the GMNotes section of a selected character and fill out the NPC section of the charactersheet. Statblocks from Archives of Nethys and Starjammer SRD are supported. Statblocks from PDFs can be used, but there may be parsing issues.

## THE MAIN COMMANDS

_**!sf_character**_

This imports a Starfinder statblock in the GM Notes section of a character sheet and will out the NPC section of the Starfinder (Simple) character sheet. Furthermore, it configures the token's hit points and give EAC/KAC indicators.

_How to:_

1.  Select and copy a stat block and paste it into the "GM Notes" section of a Character sheet. (Don't worry about removing any formatting)
2.  Click Save.
3.  Select the token that you have [linked to the character sheet](https://wiki.roll20.net/Linking_Tokens_to_Journals).
4.  Type !sf_character. The script attempts to use the statblock to fill out the NPC section of the Starfinder (Simple) character sheet.

The script supports character statblocks from the [Archives of Nethys](https://www.aonsrd.com/Default.aspx) and the [Starjammer SRD](https://www.starjammersrd.com/). <span style="font-style: italic;">Society PDFs, at least in the earlier ones, sometimes present issues. Double check the results after importing a statblock from a PDF.</span>

**!sf_starship**

This imports a Starfinder starship statblock from the GM Notes section of a [linked character sheet](https://wiki.roll20.net/Linking_Tokens_to_Journals) and populates the Starship page of the sheet. Furthermore, It adds gunnery and piloting check macros. If the statblock doesn’t have stats for the pilot/gunner, the script adds prompts so that when you click the macro, you are prompted for the bonus.

This works the same as !sf_character but in practice, statblocks for starships are less consistent across platforms.

_**!sf_token**_

This populates the token with hitpoint, EAC, and KAC information in the event that the NPC sheet is setup, but the token isn't. The token will look like the one produced by !sf_character

_**!sf_clean**_

I've included this for completeness, but be warned - this command will <span style="text-decoration: underline;">**PERMANENTLY ERASE**</span> things from the character sheet so use with caution. As above, this command requires selecting a token that has been [linked to the character sheet](https://wiki.roll20.net/Linking_Tokens_to_Journals).

_How to:_

_**!sf_clean CONFIRM**_ - This will erase ALL stats from the character sheet AND remove ALL formatting from the token. It will not touch the GM Notes section of the character sheet so it can be reimported using !sf_character.

**_!sf_clean ABILITIES_** - This will erase ALL macros from the character sheet.

### OTHER USEFUL COMMANDS

_**!sf_init**_

This rolls group initiative for all selected NPCs. The script refers to the Initiative bonus on the NPC tab of the character sheet to do this.

_**!sf_addtrick**_

This adds a macro to handle Trick Attacks for the NPC. Click over to the main "Character" page, and configure Trick Attacks to make it work.

### The next two commands will require creating a simple macro to run correctly

The macro will look like this.

> !sf_ability ?{textToPaste}

_**!sf_ability**_

This adds a special ability to the NPC character sheet for quick reference. If the macro has been created as described above, a box appears allowing you to paste the full text of a special ability.

_**!sf_addspell**_

This adds a spell to the NPC character sheet as a macro. Similar to sf_ability, when you run the macro to call this, a box appears allowing you to paste the full text of the spell. The script formats the spellblock. Afterwards, I recommend manually editing the macro in the "description" tag to tailor the results of the macro for use in play.

Find other details on the wiki [HERE](https://wiki.roll20.net/Script:Starfinder_-_Guidance_Tools_for_Starfinder_(Simple)_Character_sheet).

Feel free to reach out to me if you find any bug or have any suggestions [HERE](https://app.roll20.net/users/927625/kahn265).