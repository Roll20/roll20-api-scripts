

# ChatSetAttr 
This script is a utility that allows the user to create, modify, or delete character attributes via chat messages or macros. There are several options that determine which attributes are modified, and which characters the attributes are modified for. The script is called by the command **!setattr [--options]** for creating or modifying attributes, or **!delattr [--options]** for deleting attributes. 

## Selecting a target
One of the following options must be specified; they determine which characters are affected by the script.

* **--all** will affect all characters in the game. USE WITH CAUTION. This option will only work for the GM. If you have a large number of characters in your campaign, this will take a while to process all attribute changes.
* **--allgm** will affect all characters which do not have a controlling player set, which typically will be every character that is not a player character. USE WITH CAUTION. This option will only work for the GM. 
* **--charid charid1, charid2, ...** allows you to supply a list of character ids, and will affect characters whose ids come from this list. Non-GM Players can only affect characters that they control.
* **--name name1, name2, ...** allows you to supply a list of character names, and will look for a character with this name to affect. Non-GM Players can only affect characters that they control.
* **--sel** will affect all characters that are represented by tokens you have currently selected.

## Additional options
These options will have no effect on **!delattr**, except for **--silent**.
 
* **--silent** will suppress normal output; error messages will still be displayed.
* **--mute** will suppress normal output as well as error messages (hence **--mute** implies **--silent**).
* **--replace** will replace the characters < , > , ~ , ; , and ` by the characters [,],-,?, and @ in attribute values. This is useful when you do not want roll20 to evaluate your expression in chat before it is parsed by the script.**
* **--nocreate** will change the script's default behaviour of creating a new attribute when it cannot find one; instead, the script will display an error message when it cannot find an existing attribute with the given name.
* **--mod** will add the new value to the existing value instead of replacing it. If the existing value is a number (or empty, which will be treated as 0), the new value will be added to the existing value. If not, an error message will be displayed instead. Try not to apply this option to attributes whose values are not numbers. You can use **!modattr** as a shortcut for **!setattr --mod**.
* **--modb** works like **--mod**, except that the attribute's current value is kept between 0 and its maximum. You can use **!modbattr** as a shortcut for **!setattr --modb**.
* **--reset** will simply reset all entered attribute values to the maximum; the values you enter are ignored. You can use **!resetattr** as a shortcut for **!setattr --reset**.
* **--evaluate** is a GM-only (unless you allow it to be used by players via the configuration) option that will use JavaScript eval() to evaluate the attribute value expressions. This allows you to do math in expressions involving other attributes (see the example below). However, this option is inherently dangerous and prone to errors, so be careful.

## Feedback options
The script accepts several options that modify the feedback messages sent by the script.

* **--fb-public** will send the output to chat publicly, instead of whispering it to the player who sent the command. Note that error messages will still be whispered.
* **--fb-from <NAME>** will modify the name that appears as the sender in chat messages sent by the script. If not specified, this defaults to "ChatSetAttr".
* **--fb-header <STRING>** will replace the title of the message sent by the script - normally, "Setting Attributes" or "Deleting Attributes" - with a custom string.
* **--fb-content <STRING>** will replace the feedback line for every character with a custom string. This will not work with **!delattr**.

You can use the following special character sequences in the values of both **--fb-header** and **--fb-content**. Here, **J** is an integer, starting from 0, and refers to the **J**-th attribute you are changing. They will be dynamically replaced as follows:

* \_NAME**J**\_: will insert the attribute name.
* \_TCUR**J**\_: will insert what you are changing the current value to (or changing by, if you're using **--mod** or **--modb**).
* \_TMAX**J**\_: will insert what you are changing the maximum value to (or changing by, if you're using **--mod** or **--modb**).

In addition, there are extra insertion sequence that only make sense in the value of **--fb-content**:

* \_CHARNAME\_: will insert the character name.
* \_CUR**J**\_: will insert the final current value of the attribute, for this character.
* \_MAX**J**\_: will insert the final maximum value of the attribute, for this character.

## Attribute Syntax
Attribute options will determine which attributes are set to which value (respectively deleted, in case of !delattr). The syntax for these options is **--name|value** or **--name|value|max**. Here, **name** is the name of the attribute (which is parsed case-insensitively), **value** is the value that the current value of the attribute should be set to, and **max** is the value that the maximum value of the attribute should be set to. Instead of the vertical line ('|'), you may also use '#' (for use inside roll queries, for example).
 
* Single quotes (') surrounding **value** or **max** will be stripped, as will trailing spaces. If you need to include spaces at the end of a value, enclose the whole expression in single quotes.
* If you want to use the '|' or '#' characters inside an attribute value, you may escape them with a backslash: use '\|' or '\#' instead.
* If the option is of the form **--name|value**, then the maximum value will not be changed.
* If it is of the form **--name||max**, then the current value will not be changed.
* You can also just supply **--name|** or **--name** if you just want to create an empty attribute or set it to empty if it already exists, for whatever reason.
* **value** and **max** are ignored for **!delattr**.
* If you want to empty the current attribute and set some maximum, use **--name|''|max**.
* The script can deal with repeating attributes, both by id (e.g. **repeating\_prefix\_-ABC123\_attribute**) and by row index (e.g. **repeating\_prefix\_$0\_attribute**). If you want to create a new repeating row in a repeating section with name **prefix**, use the attribute name **repeating\_prefix\_-CREATE\_name**. If you want to delete a repeating row with **!delattr**, use the attribute name **repeating\_prefix\_ID** or **repeating\_prefix\_$rowNumber**.
* You can insert the values of _other_ attributes into the attributes values to be set via %attribute\_name%. For example, **--attr1|%attr2%|%attr2\_max%** will insert the current and maximum value of **attr2** into those of **attr1**.

## Examples
* **!setattr --sel --Strength|15** will set the Strength attribute for 15 for all selected characters.
* **!setattr --name John --HP|17|27 --Dex|10** will set HP to 17 out of 27 and Dex to 10 for the character John (only one of them, if more than one character by this name exists).
* **!delattr --all --gold** will delete the attribute called gold from all characters, if it exists.
* **!setattr --sel --mod --Strength|5** will increase the Strength attribute of all selected characters by 5, provided that Strength is either empty or has a numerical value - it will fail to have an effect if, for example, Strength has the value 'Very big'.
* **!setattr --sel  --Ammo|%Ammo\_max%** will reset the Ammo attribute for the selected characters back to its maximum value.
* If the current value of attr1 is 3 and the current value of attr2 is 2, **!setattr --sel --evaluate --attr3|2*%attr1% + 7 - %attr2%** will set the current value of attr3 to 15.

## Global configuration
There are three global configuration options, _playersCanModify_, _playersCanEvaluate_, and _useWorkers_, which can be toggled either on this page or by entering **!setattr-config** in chat. The former two will give players the possibility of modifying characters they don't control or using the **--evaluate** option. You should only activate either of these if you can trust your players not to vandalize your characters or your campaign. The last option will determine if the script triggers sheet workers on use, and should normally be toggled on.