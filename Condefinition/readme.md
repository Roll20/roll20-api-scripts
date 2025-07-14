## Condefinition

### What it does

Condefinition reads incoming roll templates and looks for imposed conditions and saving throws. It displays button(s) in chat that allow you to:

- Quickly apply a corresponding token marker
- Define the condition
- Track concentration
- Roll saving throws
- Apply damage from spells or effects triggered by saving throws

- If the roll template contains a saving throw, it gives a button for the saving throw. Press the button and click on a target to roll the appropriate save. With **GroupCheck** installed, it runs a groupcheck save. If you have [**Apply Damage**](https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153) installed, it also applies damage.

- If the roll template contains an imposed condition, it creates a button to define the condition. If there's a cross-reference in the definition, it creates an inline link. You can hover or whisper/broadcast the text to players.

- You can toggle that condition on selected tokens. Assigning token markers requires **TokenMod**, and for improved function, **LibTokenMarkers**. Default status markers are included, and the configuration handout allows you to customize these.

- If installed via One-Click, this Mod will also auto-install **GroupCheck**, **TokenMod**, and **LibTokenMarkers** if they’re missing. **[Apply Damage](https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153)** must be installed manually.

- In addition to official conditions, it tracks many common features that benefit from markers (e.g., Raging, Hunter's Mark, Hexblade's Curse).

- The Concentration condition marker also tracks concentration and prompts for a Constitution Save when damaged.

- Compatible with Classic and Jumpgate VTT, and the 2014 or 2024 D&D sheets. Advanced configuration requires JavaScript knowledge.

### What it can't do

There are some limitations:

- Primarily designed for GMs and NPCs. Players may see buttons, but full use is GM-facing.
- Conditions are matched to tokens, not character sheets (intentional, for individual instances like multiple goblins).
- Some condition wordings may be missed, especially in non-WotC content.
- Currently, all buttons and definitions are whispered to the controller of the NPC. If needed, this could change based on whisper settings.

### Helper Scripts

- **Required:** `TokenMod`, `libTokenMarkers`
- **Optional/Recommended:** `GroupCheck`, [`Apply Damage`](https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153)

---

## Operation

### **Buttons**

Whenever a condition is implied in chat, or the report function is used on a token, a button is created. Each button has three parts:

- **Middle:** Sends the condition definition to the GM. Some include cross-links to related conditions (e.g., *Unconscious* also includes *Incapacitated*).
- **Left side:** Word balloon icon that sends the condition to all players.
- **Right side:** Toggles the token marker for selected tokens.

![Condition Button Example](https://files.d20.io/images/442935594/yOS7eoRAux8WyT5rvSFaLg/original.png?1748567284)

---

### **List All Common Condition Definitions**

Type `!condef-all` in chat to display all official condition buttons. This does not include extras like *Raging* or *Marked*, just the official conditions.

![All Conditions Screenshot](https://files.d20.io/images/442933995/z7UHtU9JRZgfR0p0vx_H4g/original.png?1748566537)

---

### **Concentration**

When a token takes damage and has a concentration marker, Condefinition calculates and prompts a Constitution Save.

Example: "Morrigan" takes 30 damage while concentrating. The script detects the marker and produces a save button.

Note: This requires **GroupCheck** configured for both 2014 and 2024 sheets.

![Concentration Save Screenshot](https://files.d20.io/images/442936255/oTJKREx0B8Dwp5TQ6VGxyg/original.png?1748567553)

---

### **Report**

Select tokens and run `!condef-report`. The script creates condition buttons for each token with active markers. These buttons only affect the associated token.

![Report Screenshot](https://files.d20.io/images/442937172/myYkaSLzPA8hqYG9xKlu_g/original.png?1748568068)

---

### **Automation of Abilities that Force Saving Throws**

Requires both **GroupCheck** and manually installed [`Apply Damage`](https://app.roll20.net/forum/post/3631602/script-groupcheck-roll-checks-saves-et-cetera-for-many-tokens-at-once/?pageforid=4359153#post-4359153). The spell or ability must be sent to chat with its Description turned on to trigger automation.

![Apply Damage Automation](https://files.d20.io/images/442940114/kWl_PCGDYV8f_9cs_jw_Yw/original.png?1748569736)

The button works like the concentration check: left half rolls saves for all selected tokens, and optionally applies damage.

![Save and Apply Damage Button](https://files.d20.io/images/442941123/VzdgD5qvSLHRqwKBX2rXNw/original.png?1748570402)

---

## Configuration

Supports conditions from both 2014 and 2024 rule sets. Can switch between default token markers or the author's "Easy to Read" marketplace markers.

### The Condefinitions Handout

Use `!condef help` or `!condef config` to access settings.

Condition definitions are stored in a handout named **Condefinitions** and consist of 4-line entries separated by an empty line:

1. **Line 1:** Condition name  
2. **Line 2:** Regex to match keywords (e.g., "poisoned|toxic")  
3. **Line 3:** One-line definition (can include simple HTML)  
4. **Line 4:** Name of the token marker

To update, save the handout and click **Update Conditions** in chat. Use the **Code** style when pasting definitions.

**Tip:** Duplicate the handout before editing, in case you need to roll back.

If you use a custom marketplace set for token markers, feel free to share your config — just ensure clean, plain text and wrap in the `Code` style.

![Configuration Screenshot](https://files.d20.io/images/442943259/dwGOgHA6nb3a8fRJIat8Dw/original.png?1748571846)
