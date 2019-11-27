# GroupCheck

This is an API script meant to run checks for several tokens at once. You can specify the type of check to run and it will roll it once for every selected token. Note that you **will** have to configure the script and import the right types of checks before you can use it.

## Basic usage

Having configured some checks, you can call the script using the following syntax

    !group-check [--options] --Check Command

Here, you can supply zero or more options (see the section on options for specifics) that modify what exactly is rolled. **Check Command** is the command associated to the check you want to run. If no valid **Check Command** is supplied, a list of valid commands (in the form of API buttons) is instead output to chat, allowing you to press them to roll the corresponding check.
**Check Command** will then be rolled once for every selected token that represents a character, and the result will be output to chat.

### Example

Suppose that we are using D&D 5E, and want to roll a Dexterity saving throw for every selected token, outputting the result to the GM only. The command would be

    !group-check --whisper --Dexterity Save

Note that this only works after having imported the right data for the sheet you are using.

If you have two tokens selected, representing the characters **Sarah** and **Mark**, the script will output (with default settings)

**Sarah:** [[d20 + @{Sarah|dexterity\_saving\_throw\_mod}]]

**Mark:** [[d20 + @{Mark|dexterity\_saving\_throw\_mod}]]

Internally, the form of the check is proscribed by a formula; the formula in this case is of the form "[[d20 + @{dexterity\_saving\_throw\_mod}]]", and the script will fill in the right attribute in place of "@{dexterity_saving_throw_mod}".

## Configuration

The script is designed to be easily configured to your specific system's needs. You can configure the script using the **!group-check-config** command. **!group-check-config** accepts the following options:

### Show options

- **!group-check-config --show** will display the current list of checks and the default options for GroupCheck.

### Manipulating the check database

- **!group-check-config --import [Name]** imports a predefined set of checks and adds them to the list. Currently, the available choices for **[Name]** are **5E-Shaped**, **5E-OGL**, **Pathfinder-Official**,**Pathfinder-Community**, and **3.5**.

- **!group-check-config --add [JSON]** adds a check, or several checks, to the list of checks in the database. **[JSON]** must be valid JSON in the following format:

      { "Check Command" : { "name" : "Check Name", "formula" : "FORMULA"} }

  Here, the command will be called by **!group-check --Check Command**, the title of the box appearing in chat will be Check Name, and FORMULA is the formula used to calculate the roll result. Attributes to be filled in in FORMULA need to be specified as \at{name}; inline roll brackets ("[[" or "]]") should be replaced by "\\[", respectively "\\]". For example, to add a check with command Strength that roll a d20 + the character's Strength attribute, you would type

      !group-check-config --add { "Strength" : { "name" : "Strength Test", "formula" : "\[d20 + \at{Strength}\]"} }

- **!group-check-config --delete [Command]** will delete the check called **Command** from the database.

- **!group-check-config --clear** will empty the list of checks in the database.

### Manipulating default options

- **!group-check-config --set option value** will set **option** to **value**. The following options are available: **ro**, **die_adv**, **die_dis**, **fallback**, and **globalmod**. To find out more about what these options do, consult the Options sections.

- **!group-check-config --set option** will set **option** (this is the variant for options which can be either true or false). The following options are available: **showformula**, **hideformula**, **whisper**, **public**, **usecharname**, **usetokenname**, **showpicture**, and **hidepicture**, **direct** and **process**. To find out more about what these options do, consult the Options section.

- **!group-check-config --defaults** will reset all options to the factory defaults.

- **!group-check-config --reset** will both empty the list of checks and reset all options.

## Options

Most of the following options can be supplied in two ways: you can either supply them on the command line, or change the defaults via !group-check-config. Most of the time, it is probably advisable to do the latter.

### Targeting

By default, the script will be run for every selected token. Alternatively, if the **--ids IDs** option is specified, it will instead run for every token in **IDs**, which is supplied in the form of a comma-separated list of token IDs. This shouldn't normally be necessary, but it could be useful for generating GroupCheck commands via an API script.

### List of options

- The options **die_adv**, and **die_dis** control the die substitution for disadvantage and advantage. The first d20 in the roll formula will be replaced by the value of die_adv resp. die_dis if the roll option adv for Advantage or dis for Disadvantage is specified.

- The options **whisper**, resp. **public**, control if rolls are whispered to the GM or output publicly.

- You can use the option **--title [text]** to display **[text]** instead of the normal title of the roll.

- You can use the option **--subheader [text]** to display **[text]** below the title of your roll.

- The options **--direct** and **--process** let GroupCheck use the rolls in two very different ways (you probably want to set this option via !group-check-config permanently instead of specifying it for every roll). **--direct** is the default, and equals the behaviour of GroupCheck prior to version 1.0, in that it simply outputs inline rolls to chat. On the other hand, **--process** lets GroupCheck process the results first to change their appearance and pass on the results to other scripts. Since **--process** has not been tested for many cases yet, this could lead to strange results. Enabling **--process** also changes the appearance of rolls, for example by removing the yellow background, and enables the **--showaverage**, **--button**, and **--send** options.

- The option **--showaverage** (requires **--process**) will add an extra line at the end showing an average of all rolls.

- The option **--button [Name][command]** (requires **--process**) will add an API command button to the end of the roll output with name **[Name]** and command **[Command]**. A tilde (~) inside the command will be replaced by double dashes (--) in order not to interfere with GroupCheck's syntax. You can use the results of the roll inside the command as follows: the string **IDS([sep])** will be replaced by the token ids used in the roll, joined by **[sep]**. The string **RESULTS([sep])** will be replaced by the results of the rolls (first roll for each token only), joined by **[sep]**. For example, if you want a comma-separated list of token ids, use **IDS(,)**.

- The option **--raw [subheader]** will send a second version of the results to chat (always publicly, not whispered), which only shows the dice rolls for the tokens, without modifiers. Optionally, you can specifiy the subheader here, which will work like **--subheader**, except that it is only shown in the raw version. Requires **--process**.

- The option **--send [Command]** option will send **[Command]** to chat as a separate message. It allows the same replacement of **RESULTS** and **IDS** as **--button** does, and is intended for sending API commands containing the results of the roll.

- The option **--input [input0],[input1]...** will allow you to replace parts of a formula on-the-fly (for example, via roll queries). If the string INPUT_i is present in the roll's formula, it will be replaced by your i-th input (undefined INPUT_i will just be removed). This is meant to be able to easily DCs, target numbers, and the like.

- The option **--usecharname**, resp. **--usetokenname**, control if the name of the token or the name of the character is displayed in front of the roll result. You can use e.g. the TokenNameNumber script to give different tokens for the same character different (numbered) names, allowing you to discern which of the tokens rolled which roll, even if there are several tokens representing the same character. This is active by default.

- It is possible to alter the specific way rolls are made. There are 5 options: roll normally, roll with advantage, roll with disadvantage, always roll 2 times for every token, or (for the 5E Shaped sheet only) respect the roll setting on the sheet for selected tokens. You can control this via the option **--ro [Setting]**, where **[Setting]** can be one of roll1, roll2, adv, dis, rollsetting, respectively. If you are not using D&D 5th Edition, you probably want to leave this option on roll1 constantly.

- The option **--globalmod [mod]** will add **[mod]** as a modifier to all rolls made. Here **[mod]** can be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things.

- You can use **--multi [n]** to run every check **[n]** times instead of once, with a minimum of 1 time.

- It is possible to hide the formula for checks and only show the final result of the roll. This is controlled via the options **--showformula** and **--hideformula**.

- You can turn off the display of the token image next to the character name (it will always be displayed if the name is empty). This is controlled via the options **--showpicture** and **--hidepicture** (on by default).

- You can turn off the display of the name next to the token image. This is controlled via the options **--showname** and **--hidename** (on by default).

- You can supply a fallback value. When the option **--fallback [value]** is given, a roll will be made even for tokens not linked to a character; for these tokens, **[value]** will be used instead of the FIRST attribute in a roll, and all other attributes are treated as if they were 0. **[value]** may be any expression that the roll20 dice roller can interpret, such as a number, a die roll, a specific character's attribute, or a sum of these things. If also using **--globalmod**, the global modifier is applied in addition to the fallback mod.

- It is possible to supply a custom roll not present in the checks database. The syntax to do this is **--custom CheckName, formula**. This will roll a check with title **CheckName** and formula **formula** for the roll.
