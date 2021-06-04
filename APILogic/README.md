# APILogic
**File Location:** [APILogic.js](https://github.com/TimRohr22/Cauldron/tree/master/APILogic) (submitted to the one-click, but until then, find it in my personal repo)
**Script Dependency:** [libInline.js](https://github.com/TimRohr22/Cauldron/tree/master/libInline) (also submitted to the one-click)
APILogic introduces logical structures (things like IF, ELSEIF, and ELSE) as well as real-time inline math operations, and variable muling to Roll20 command lines. It can test sets of conditions and, depending on the result, include or exclude parts of the command line that actually reaches the chat processor. For example, given the statement:

    !somescript {& if a = a} true stuff {& else} default stuff {& end}
...results in the following reaching the chat:

    !somescript true stuff

APILogic exploits a peculiarity of the way many of the scripts reach the chat interface (a peculiarity first discovered by -- who else? -- The Aaron) to give it the ability to intercept the chat message ***before*** it reaches other scripts, no matter if it is installed before or after them in the script library. It also uses a separate bit of script magic to let it retain ownership of the message even when otherwise asynchronous chat calls would be going.

**Caveat:** The method APILogic utilizes has been tested and shown to work with a large number of scripts. If you find that it doesn't, you should be reminded that the most foolproof way to ensure proper timing of script execution is to load APILogic in your script library before the other script. But hopefully you'll find that you don't need to do that!)

Also, although it requires the API, it is not only for API messages. You can use these logic structures with basic chat messages, too. This document will show you how.

**Credits:** Many thanks to The Aaron for lending his expertise on questions I had, and to the other members of the House of Mod for sounding out and working through ideas.

## Triggering and Usage
You won't invoke APILogic directly by using a particular handle and a line dedicated for the APILogic to detect. Instead, any API call (beginning with an exclamation point: '!')  that also includes any IF, DEFINE, MULE,  EVAL, EVAL-, or MATH tag somewhere in the line will trigger APILogic to examine and parse the message before handing it off to other scripts.

As mentioned, you are not limited to using APILogic only for calls that are intended for other scripts. There are mechanisms built into the logic that let you output a simple chat message (no API) once you've processed all of the logic structures. That means you can use the logic structures in a simple message that was never intended to be picked up by a script, and also in a message that, depending on the conditions provided, might need to be picked up by another script, or alternatively flattened to a simple message to hit the chat log.

## The Basic Structures: IF, ELSEIF, ELSE, and END
An IF begins a logical test, providing conditions that are evaluated. It can be followed by any number of ELSEIF tags, followed by zero or 1 ELSE tag. Finally, an IF block must be terminated with an END tag. Each of these are identified by the `{& type ... }` formation. For instance:
{& if ... }
{& elseif ...}
{& else}
{& end}
A properly structured IF block might look like this:

    {& if (conditions) } true text {& elseif (conditions) } alt text {& else } default text {& end}
Each IF and ELSEIF tag include conditions to be evaluated (discussed in a moment). If an IF's conditions evaluate as `true`, the subsequent text is included in the command line. While nested IF blocks embedded within that included text are detected and evaluated, no further sibling tags to the initial IF tag are evaluated until the associated END tag. On the other hand, if an IF evaluates to false, evaluation moves to the next logical structure (ELSEIF, ELSE, or END). ELSEIFs are evaluated just as IFs are, with processing passing forward if we find a false set of conditions. If we ever reach an ELSE, that text is included.
### Nesting IF Blocks
You can nest IF blocks in other portions of the line to prompt a new set of evaluation for the enclosed text. They can occur in another IF, in an ELSEIF, or in an ELSE. If the outer logic structure passes validation so that the contents are evaluated, the nested IF block will be evaluated. Each IF must have an END, therefore the first END to follow the last IF belongs to that IF. Similarly, all ELSEIF and ELSE tags that follow an IF (until an END is detected) belong to that IF.

    {& if } ... {& elseif } ... {& if } ... {& elseif } ... {& end } ... {& else } ... {& end}

In the example, an IF-ELSEIF-END block exists in the first ELSEIF of the outer IF block. it will only be evaluated (and can only be included) if the outer IF block fails validation and the ELSEIF passes.
### Conditions
Each IF and ELSEIF must have at least one condition to evaluate. A condition can be either binary (i.e., a = b), or unary (i.e., c), and each element of a condition (the a, b, or c) can be a sheet item, text, inline roll, or a previously evaluated condition set (more on this in a moment).
#### Logical Comparisons
The following logical comparisons are allowed for comparing two items (binary operations):

    a = b	// equals
    a != b	// does not equal
    a > b	// is greater than
    a >= b	// is greater than or equal
    a < b	// is less than
    a <= b	// is less than or equal
    a ~ b	// includes
    a !~ b	// does not include

#### Sheet Items
APILogic currently can retrieve and evaluate attributes, repeating items, and abilities from a character sheet.

    @|Character Name|attribute
    %|Character Name|ability
    *|Character Name|list|[pattern]|rpt_item_suffix

In each example, where the character's name is referenced, you can substitute the character's ID or the token ID of a token that represents that character.
For abilities, the text (or action) of the ability will be returned; for attributes and repeating attributes, the current value. To retrieve the "max" value of an attribute or repeating attribute, see **Special Tests and Returning "max" or "name"**, below.

    {& if @|Bob the Hirsuite|health > 18 }
    {& if %|-M4qbDlLf8x7lYHaZ4tt|Blast ~ power }
##### Repeating Items
Repeating items are accessed by a list name, a pattern that helps to narrow down which item on that list should be returned, and then a suffix to a repeating item as the value to return. For example, Bob the Slayer has a spell list on his character sheet, where every item on that list has sub-attributes of `name`, `spell_level`, and `prepared`. He has the spell "Disintegrating Blast" entered on that list at level 1, 2, and 3. The following call would return the `spell_level` of the `prepared` "Disintegrating Blast":

    *|Bob the Slayer|spells|[name = "Disintegrating Blast" prepared]|spell_level
Patterns are like the conditions of an IF tag for only the sub-attributes of a repeating item -- with two minor differences. First, there is no connective `&&` or `||` between each condition; the conditions are **all** considered to be required for the pattern to detect a repeating element (in other words, they all default to `AND` relationships). Second, while each test can be binary or unary, a unary test (like, "prepared", just above) implicitly tests for a truthy value from the field beyond just whether it exists. This typically represents an option button or checkbox on a character sheet.

Last, note that if there is space in the text provided as the right hand side of a comparison, you should enclose it in single quotes, double quotes, or tick marks (see **Text as Condition**, below).

If you don't know the suffixes of the sub-attributes for a repeating list, I suggest you utilize a script like [XRay](https://app.roll20.net/forum/post/9097236/script-insertarg-script-preamp-siege-engine-menu-maker-command-line-constructor/) (part of the InsertArg script) to help identify the naming parts you need.
##### Sheet Item Reminder
Remember, Roll20 will parse standard calls to sheet items before the message is handed off to the API, so if you *know* an attribute exists, for instance, it could be simpler for you to use the standard syntax to trigger the Roll20 parser to derive the value. On the other hand, using the APILogic syntax to access the sheet item provides an implicit test for whether the item exists at all. Rather than derailing the message, that condition simply evaluates as false, and processing continues.
##### Special Tests and Returning "max" or "name"
Part of the implicit test performed on a sheet item is whether it exists (it's hard for an attribute to be 3-or-greater if it doesn't exist in the first place). Therefore, to test whether an item exists, you need only include it as a unary test in a condition set:

    {& if @|Bob the Slayer|weaponsmith }
Other tests can be identified by including characters between the `@, %,` or `*` and the `|`. For instance, to also test whether the `weaponsmith` attribute is an integer, include an `int`:

    {& if @int|Bob the Slayer|weaponsmith }
The current special tests are:

    int	=>	integer
    num	=>	number
There are also special pieces of data that can be returned, utilizing this same position (with or without the special tests).
**MAX:** To return the max value for an attribute, use `max`.

    {& if @intmax|Bob the Slayer|weaponsmith > 10 }

The above tests the existence of the `weaponsmith` attribute for Bob the Slayer, whether the `max` value is an integer, and whether that `max` value is over 10.
**NAME:** Sometimes (especially for a repeating item), it is helpful to return the name of the thing on the sheet. Used in a definition, this give you an easy way to retrieve the value of a repeating item in other scripts. To get the name of a field from a repeating element, include `name` in the same position.

    {& define ([arrowsattr] *name|Bob the Slayer|resources|[resource_name="arrows"]|resource_name ) }

The above would return, for example:

    repeating_resources_-M5sYfPs0x3LgGSdmXC1_resource_name

...representing the attribute for `resource_name` where the resource represented "arrows". The name returned is the name of the field referenced as the last element in the structure, whatever that is. So the following would return the name of the `resource_quantity` attribute for the same "arrows" resource:

    {& define ([arrowsleft] *name|Bob the Slayer|resources|[resource_name="arrows"]|resource_quantity ) }
For more information on using definitions, see **Using DEFINE Tag**, below.

**ROW:** Roll20 lets you use a "rowID shorthand" ($0, $1, etc.) to reference items in a repeating set based on their sorted order. To get the ordinal/sorted position, use `row`.

    *row|Bob the Slayer|resources|[resource_name=arrows]|resource_name

The above would return the rowID shorthand, for instance, $0. Using this method, you could manage a left/right resource list and keep the items in sync. If the elements were in the $2 position in both lists, you could extract and define the rowID in a DEFINE tag, then use it elsewhere in the command line for references to the left or right resource list.

**ROWNAME:** Much like `row`, `rowname` leverages the rowID of the repeating item, but instead returns the full name of the attribute using that rowID. To get the name of the item in the repeating set using the rowID, use `rowname`.

    *rowname|Bob the Slayer|resources|[resource_name=arrows|resource_name

The above would return something like:

    repeating_resources_$0_resource_name

#### Text as Condition
If you need to include space in a bit of text to include as one side of a comparison operation, you should enclose the entire text string in either single quotes, double quotes, or tick marks. With three options available, you should have an option available even if the text you need to include might, itself have an instance of one of those characters. For instance, the following would not evaluate properly, because of the presence of the apostrophe in the word "don't":

    @|Bob the Slayer|slogan ~ 'don't go'

Instead, wrap it in another option for denoting the text:

    @|Bob the Slayer|slogan ~ "don't go"
This is good to remember if you intend to use Roll20 parsing to retrieve something. For instance, if you want to use the name of the character associated with the Selected token as a condition, you should wrap that in some form of quotes if there is a chance that name will include a space.

    "@{selected|token_name}" ~ Slayer
	    // will reach the API after Roll20 parsing as...
    "Bob the Slayer" ~ Slayer

### Chaining Conditions (AND/OR) and Grouping
Multiple conditions can be used for each IF or ELSEIF tag. Use `&&` to denote and AND case, and use `||` to denote an OR case.

    {& if a = b && c = d }

Conditions are evaluated left to right by default. Use parentheses to enclose groups to force those conditions to evaluate as a group before being compared to sibling conditions:

    {& if a = b && ( c = d || e != f) }

Multiple levels of grouping can be used, provided each sibling element (whether group or condition) is connected with `&&` or `||`:

    {& if ( a = b && ( c = d || e != f ) ) || ( d > b && g ) }

#### Naming and Reusing Groups
The reasoning behind why you would want to include a part of your command line might be needed at several times in your command line. In that case, you should name your condition group so that you can simply refer to that name later. Name a group by including a bracketed word (no space) after the opening parentheses, before any non-whitespace character:

    {& if ([sanitycheck] @|Bob the Slayer|sanity > 10 ) }

The above would store the result of the condition (whether Bob the Slayer's sanity was over 10) as `sanitycheck`, available to be used later in the command line, including in future, deferred processing (disucssed later).

    {& if ([sanitycheck] @|Bob the Slayer|sanity > 10 ) } conditionally included text {& end} always included text {& if sanitycheck } conditionally included text {& end}
**BE AWARE** that conditions are ONLY evaluated for IF and ELSEIF tags which reach the parser. If your group is defined in a portion of the command line that is not evaluated because the IF or ELSEIF was never reached, the group will never be evaluated and the test will never be stored.

    {& if a = !a } true case text {& if ([sanitycheck] @|Bob the Slayer|sanity > 10 ) } true case for nested if {& end } {& end } always included text {& if sanitycheck} ...{& end}
In that case, the first condition `a = !a` does not pass validation, so the subsequent text is never evaluated (including the IF tag where the `sanitycheck` is defined).

If you find yourself in this position, you can either investigate a definition (see **Using DEFINE Tag**, below), or using a root-level IF tag with a single space of dependent text (that is, providing little alteration to your command line, regardless of if it passes).

    !somescript {& if ([sanitycheck] @|Bob the Slayer|sanity > 10 ) } {& end} ...
Because the END tag follows nearly immediately on the IF tag, no important text is included or excluded from the command line, no matter the result of the test. The IF tag is there simply to force the group to be evaluated and the result stored. This would be a better solution than using a definition if the group was particularly complex since the definition is a simple text replacement operation. Using a named group ensures that the group is only being retrieved and evaluated once (read more in **Using DEFINE Tag**).
### Negation
Negation can be applied to any element of a condition or to any group by use of the `!` character. This can be handy to test for the non-existence of a sheet item:

    !@|Bob the Slayer|weaponsmith

...or to reverse the evaluation of a group:

    !( @|Bob the Slayer|weaponsmith > 4 && @|Bob the Slayer|impromptu_poetry > 2 )

...or to get the opposite result from a named group:

    {& if !sanitycheck }

Note that if you use negation at the same time you are naming a group, the group will evaluate and the result will be stored as with the name. Negation will then return the opposite of the stored value:

    ! ( [sanitycheck] a = a )

...will store `true` as the value of the `sanitycheck` group, but return `false` because of the negation. Referring to the `sanitycheck` group later will retrieve the initial `true` value.
## Using DEFINE Tag
A DEFINE tag is a way to provide definitions for terms that you will then use in text replacements throughout your command line. A DEFINE tag can come anywhere in your command line, and is parsed out before any processing of logical constructs occurs. A DEFINE tag is structured like this:

    {& define ([term1] definition1) ([term2] definition2) ... }

The `term` refers to what you will use, elsewhere in the command line, to represent the `definition`. Since the `definition` is terminated by a parentheses, you do NOT need to enclose it in some form of quotation marks UNLESS you need to include leading or trailing spaces.

Since DEFINE replacements are simple text replacement operations, these can be a way to save typing (providing a short `term` to represent a long `definition` that will need to be utilized a number of times in a command line). It also provides a way of minimizing work should a `definition` need to change -- giving you only one place to change it instead of many. This means you could define a `([speaker] Bob the Slayer)` term, and use `speaker` anywhere you would refer to the character; then, if you passed that macro language to a fellow player, they would only have to replace the name with their character in one place.

**EDIT v1.1.0 & v1.1.1**: DEFINE tags will now process sheet items, returning the value of the requested thing. Use the syntax as described elsewhere in this post (for instance, @|Bob|smooth_jazz to get the smooth_jazz attribute for the character 'Bob'). Also, special returns are allowed. Instead of returning the value of the item, name will return the name of the item, row will return the rowID of a repeating element, and rowname will return the rowID version of a repeating element's name.

    TERM    | EXAMPLE                                                    | EXAMPLE RETURN
    --------|------------------------------------------------------------|-------------------------------------------------------
    name    | *name|Bob|skills|[skill_name=Bowling]|skill_roll_target    | repeating_skills_-M1234567890abcdef_skill_roll_target
    row     | *row|Bob|skills|[skill_name=Bowling]|skill_roll_target     | $2
    rowname | *rowname|Bob|skills|[skill_name=Bowling]|skill_roll_target | repeating_skills_$2_skill_roll_target

(See **Advanced Usage** for more ways to leverage the DEFINE tag.)

### Difference Between Definition and Named Group
As mentioned in the section on using named groups, although the syntax for defining a `term` is very similar to naming a group, the two structures are different. If you placed the entirety of a group as a `definition`, you would be replicating that text anywhere you referenced the associated `term`, but each time that text was encountered, the group would be evaluated anew. Declaring the name for the group in an IF tag, where that name represents a set of conditions, ensures that those conditions are only evaluated once.

## Using the EVAL and EVAL- Tags
EVAL tags are new to version 1.2.0, and represent a way to plug more processing power into the inline parsing engine of APILogic. EVAL tags can run plugin scriptlets (or even other scripts) from your existing command line. The advantage of plugging the scriptlet into APILogic is that it can sub the returned data into your command line in real time!

Although APILogic includes a library with a few built-in functions, the real strength of the EVAL tag is that 3rd-party scripters (or even you) can write plugable scriptlets to allow this real-time return of game data to your command line. Need a PageID? Write a script and plug it in. Need the closest X number of tokens to a given token? Or all of the tokens within some given range? Write a script! (Or buy your local scripter a coffee and have them write it for you!)

EVAL tags are represented by `{& eval} ... {& /eval}`, while EVAL- tags are represented by `{& eval-} ... {& /eval-}`. The difference between them is only one of timing: the EVAL tag runs after MULE tags but before DEFINE tags, while the EVAL- tag runs after the DEFINE tags but before the IF tags (see **Order of Operations**, below, for a fuller discussion of the order of parsing). A full EVAL block would be structured like this:

    {& eval} scriptname(arguments for script){& /eval}
    OR
    {& eval} scriptname arguments for script{& /eval}
    OR
    {& eval} !scriptname arguments for script{& /eval}
The `scriptname` can represent one of the library of plugin scriptlets, or it could be another script in the game. Everything between the parentheses is passed to that script as arguments.

Use the first form when you want to access a plug-in designed to return information to the line. Plug-ins are built very similarly to normal scripts, and in fact a fully-fledged script can be co-opted to return a value, if the developer wishes. More on building plugins is in **APPENDIX I**.

The last two forms are functionally the same as each other (the third line simply includes the leading exclamation point), but they differ from the first form in that they do not return anything to the command line. These forms are intended solely for launching other scripts (not plugins) that have nothing to do with returning a value to the command line. The EVAL tag will launch the other script and consume itself, leaving a zero-length footprint behind.

---
**EXAMPLE: All tokens in range**
Your character has an attack spell that affects anyone within some given range. Your scripter friend writes a script that returns the IDs of all tokens within that range, telling you that to use it, you would use a command syntax of:

    !withinrange range source delimiter

So a typical call might be:

    !withinrange 3 -M1234567890abcdef ,

...returning a comma-separated list of tokens within 3 units of the given source token. Your scripter friend also tells you that they have built it as a plug-in for APILogic, so now you can use the same scriptlet in-line with another command to substitute in that comma-separated list:

    !some-other-script --targets|{& eval}withinrange(3 -M1234567890abcdef ,){& /eval} --damage|tons

By the time `some-other-script` picks up the message, the EVAL tag has been evaluated and now contains the comma-separated list of tokens within the given 3 unit range.

---
### Nest-able
EVAL tags are nest-able, and are processed from inside-out, allowing you to use one EVAL tag to return a piece of data that would be used as an argument in an enclosing EVAL tag:

    {& eval}withinrange({& eval}getsheetitem(*|Bob the Slayer|spells|[spell_name=Supernova]|spell_lvl){& /eval} -M1234567890abcdef ,{& /eval}

In that example, the `spell_lvl` of the Supernova spell is the range. The inner EVAL tag block retrieves the data by use of the built-in `getsheetitem` scriptlet, and passes it to the outer EVAL block's `withinrange` scriptlet.

### Available Built-In Scriptlet Functions
At the time of writing this, there are two built-in functions, with more coming:
- **getDiceByVal()** will retrieve dice from an inline roll that match a given set of value parameters (i.e., 2|5-6|>=10). Output options are a count of the dice, a total of the dice, or a list separated by a delimiter of your choice. More info on the syntax is in Appendix II.
- **getDiceByPos()** will retrieve dice from an inline roll based on the position of the dice based on a set of position parameters (i.e., 2|5-6|>=10). Output options are a count of the dice, a total of the dice, or a list separated by a delimiter of your choice. More info on the syntax is in **APPENDIX II**.

### Installing 3rd Party Scriptlets
If you or your local scripter has written a scriptlet to plug into APILogic (which is easy enough to do -- see **APPENDIX I**, below), you only need to install it as you would any other script. Provided the script author implemented the syntax to register that scriptlet with APILogic, it will be available to you as soon as your sandbox restarts.
## Using the MULE Tag (get/set variables)
Mules are abilities on a character sheet that can help you track information across rolls, game sessions, or even, since they are stored on the sheet, campaigns. This could be an inventory, a series of condition mods, roll history, or even tables from a game system. You can have as many mules as you want on any character, and you can access any mule on any character you control.

You can create a mule ability yourself, though if APILogic detects that the mule you have created doesn't exist, it will try to create it. Mules are formatted as lines of `variable=value`:

    initMod=4
    FavTeamMember=Mo the Raging
    LeastFavoriteTeamMember=Lizzie PurePants

Any lines that do not follow this format are not included in the set of parsed variables, so you if you wanted to add add in headers or grouping, you can:

    === MODS ===
    initMod=4
    === TEAM DYNAMICS ===
    FavTeamMember=Mo the Raging
    LeastFavoriteTeamMember=Lizzie PurePants
But be aware that if a variable does not exist, APILogic will create it, and it will create it at the bottom of the list. You can move it later without causing a problem, or you can leave it there. In fact, maybe you want an `=== UNCATEGORIZED ===` section. It's up to you.

### Naming
Obviously, since a Mule is a character sheet ability, it cannot contain a space in the name. Variable names may not contain spaces or an equals, though the value of the variable is free to be whatever you can fit on one line. Later, you will see how APILogic uses dot-notation to refer to `character.mule.variable`. You can continue this notation within your mule if you wanted to store similarly-named variables in the same mule but differentiate them from each other. For instance, if you wanted a table of EncumbranceMods (with the Encumbrance a character is carrying related as 0, 1, 2, etc.) in the same Mule as you wanted to store a table of FatigueMods (also in 0, 1, 2, etc.), you might use dot-notation in the names:

    EncMods.0=0
    EncMods.1=0
    EncMods.2=-1
    EncMods3=-1.5
    ...etc.
    FtgMods.0=1
    FtgMods.1=1
    FtgMods.2=1.1
    ...etc.
Though it might make more sense to store this information in separate Mules.
### Loading a Mule
Use the `{& mule ... }` tag to load Mules and make their variables available for you in your command line. Mule retrieval happens before variable retrieval, so it doesn't matter where in your line you put your Mule statement.

    !somescript --stuff {& mule ModMule} --tacos

You can load multiple Mules in the same statement just by separating them with a space.  Also, APILogic uses a "least common reference" (LCR) to identify the Mules to load... meaning that if you control two characters who each have a Mule named "ModMule", *both* will be loaded by the above statement (see below how to reference their variables independently). To load a "ModMule" Mule from only one character, use the dot notation:

    {& mule Viper.ModMule}
### Getting a Variable
Once you have one or more Mules loaded, you can use a `get.varname` to retrieve it in your command:

    !somescript --mod|get.initMod {& mule Viper.ModMule}

The `get` statement can take these forms:

    get.varname
    get.mulename.varname
    get.character.mulename.varname

When a variable is loaded from a Mule, it takes over the location for that variable name, that mule.variable name, and that character.mule.variable name. That means that the least specific reference (`get.varname`) will always be filled with the *last* variable of that name to be found, and the `get.mulename.varname` version will always be filled with that variable from the last mule of that name to be found.

**EXAMPLE: Naming Precedence**
You load the Mule "MyLittleMule" using the statement:

    {& mule MyLittleMule}

However, you have two characters, Viper and Jester, who each have a MyLittleMule attribute. Viper's looks like this:

    initMod=4
    EncMod=5
    motto=There's no time to think!
    bestrecent=20
Jester's looks like this:

    initMod=3
    EncMod=3
    Motto=Where'd who go?
If Viper loads before Jester, the map of variable reference would look like this:

    VARIABLE REFERENCE                 |  CHAR  | VALUE
    -----------------------------------|--------|-----------------------------
    get.initMod                        | Jester | 3
    get.EncMod                         | Jester | 3
    get.motto                          | Viper  | There's no time to think!
    get.Motto                          | Jester | Where'd who go?
    get.bestrecent                     | Viper  | 20
    get.MyLittleMule.initMod           | Jester | 3
    get.MyLittleMule.EncMod            | Jester | 3
    get.MyLittleMule.motto             | Viper  | There's no time to think!
    get.MyLittleMule.Motto             | Jester | Where'd who go?
    get.MyLittleMule.bestrecent        | Viper  | 20
    get.Jester.MyLittleMule.initMod    | Jester | 3
    get.Jester.MyLittleMule.EncMod     | Jester | 3
    get.Jester.MyLittleMule.Motto      | Jester | Where'd who go?
    get.Viper.MyLittleMule.initMod     | Viper  | 4
    get.Viper.MyLittleMule.EncMod      | Viper  | 5
    get.Viper.MyLittleMule.motto       | Viper  | There's no time to think!
    get.Viper.MyLittleMule.bestrecent  | Viper  | 20

Note that the variables are case-sensitive ("motto" vs "Motto"), and that it is only when you arrive at a unique piece of identifying data (in this case, the character name) that you are able to differentiate between the similarly named (and/or similarly-muled) variables. The point is, you should use the LCR guaranteed to get you the variable you intend to retrieve, but if you have only one Mule, you can use the simplest form for every variable.
### Setting a Variable's Value
Set a variable's value using the text formation `set.varname = value /set`. The implication of the LCR during setting is that all less-specific references to the variable are set, across all Mules, and among the available ways of referencing that variable. In the above example (Jester and Viper having similarly named Mules), the following statement:

    set.initMod = 8

...will set the initMod variable in both Mules to be the same value, 8. In fact, using the Mule name in the set statement would still result in both Mules being updated, since the name is shared between them. The only way to set only one of the variables would be to fully qualify the name with the character's name:

    set.Viper.MyLittleMule.initMod = 8
In setting that value, the less specific ways of referring to the variable (`get.initMod` and `get.MyLittleMule.initMod`) are also set, so that further references to these during this cycle of APILogic evaluating the command line will retrieve the new value. Although setting variables comes at the end of the cycle of operations, remember that the APILogic process is a loop, so there can be further references when the whole thing starts again (see both **Escaping Text (Deferring Processing)** and **Order of Operations**).
## Using the MATH Tag
Using the MATH tag, you can drop real-time, inline math calculations into your macro command to have the value rendered before the message is handed off to the intended script.

The MATH tag is denoted by the `{& math ... }` formation, where the equation to evaluate follows the tag name:

    {& math (2+3)/4}

The above would output 1.25.

You can use numbers, parentheses, known constants, mule variables, inline rolls or roll markers, and math functions as operands in + , - , * , / , and % (modulo) operations (exponentiation is handled in a function):

    {& math round(sin(90) * pi, 2) / randb(0,4) }
The above rounds (to 2 decimal places), the sine of 90 multiplied by pi, then divides that by a random number between 0 and 4.

### Mule Variables
All variables from all loaded mules are made available to the math processor directly, without the need of using the `get` statement. Of course, since mules are loaded (and variables retrieved) before equations are handed off to the math processor, using the `get` statement will still work. You just don't have to use it in a MATH tag's equation. If you have a variable named 'ArmorMod, then the following are functionally equivalent:

    {& math ArmorMod + 4}
    {& math get.ArmorMod + 4}
### Functions
Most of the javascript Math functions are exposed for you, as well as some that were added to answer common requirements. These include things like round (with a decimal places argument), ceiling, floor, min, max, random, random between, random among, absolute value, square root, cube root, and more. To use them, include the specified name followed by an open parentheses and any arguments as necessary before supplying a closing parentheses. Functions are nestable.

For a full list of functions included in the math processor, see **APPENDIX III**.
### Constants
The following constants are available as part of the math processor:
- **e** - Euler's number (javascript: Math.E)
- **pi** - Pi (javascript: Math.PI)
- **lntwo** - Natural log of 2 (javascript: Math.LN2)
- **lnten** - Natural log of 10 (javascript: Math.LN10)
- **logtwoe** - Base 2 log of e (javascript: Math. LOG2E)
- **logtene** - Base 10 log of e (javascript: Math.LOG10E)
Constants take priority over Mule variables of the same name, therefore if you have reason to store a variable under the name 'pi', for instance, you can only reach it within the math processor by a more specific LCR -- including the Mule or Character.Mule information.
## Escaping Text (Deferring Processing)
You can use `\` characters to break up text formations that the Roll20 parser might otherwise recognize and try to process before you are ready. The escape character is removed before the message is released to other scripts.

For instance, referencing an attribute that does not exist might normally throw an error to the chat output. In that case, you could use escaping to mask the evaluation of the referenced attribute, and only include it in the command line if the attribute exists:

    !somescript {& if @|Bob the Slayer|smooth_jazz } @\{Bob the Slayer|smooth_jazz} {& end}
The escape character prevents the Roll20 parser from recognizing the request for the `smooth_jazz` attribute until we've determined whether the attribute exists in the first place. If it doesn't exist, that portion of the line never survives to be included in the final output.

Here's another example where that potentially non-existent value would be the basis for the number of dice in an inline roll. In this case, both the attribute detection ***and *** the inline roll need to be deferred;

    \[\[ @\{Bob the Slayer|smooth_jazz}d10 \]\]

### Timing
APILogic gets the message **after** the Roll20 parser has already handled things like requests for sheet items, roll queries, and inline rolls. APILogic processes EVAL, MULE, MATH, DEFINE, EVAL-, and IF tags before finally setting any variable values. After all of that work is finished, it un-escapes characters and uses a bit of script magic to invoke the whole process again (including Roll20 parsers to handle the "newly created" detectable items as well as the APILogic test for "newly created" blocks to trigger further processing) before releasing the message to other scripts. See **Order of Operations**, below, for a fuller breakdown of the sequence.
### Caveat
Removing the escape characters happens automatically for any chat message that triggers APILogic to examine the command line (meaning an API call where you used either an IF or DEFINE tag). Because of this, for any message where you would use the IF and/or DEFINE tags and you also need to actually include a `\` character, you will need to escape the escape character: `\\`. Multiple levels of escaping require the same number of escapes for any slash you wish to keep.
## Post Processing Tags: STOP and SIMPLE
Once all of the other processing is handled (escape characters, definition processing, logical construct processing, rebuilding the command line), APILogic performs one last check of the command line, looking for either the STOP or SIMPLE tags.

    {& stop}
    {& simple}

If detected, these tags trigger special behavior for APILogic.

The STOP tag tells APILogic not to release the message. In other words, nothing would reach the chat window. Conversely, the SIMPLE tag tells APILogic to release the message only after it has converted it from an api-call (prepended with the `!`) into a simple chat message (and removing any SIMPLE tags it finds). Embedding these tags within IF blocks give you a way to provide different results for different branches of your condition evaluation.

    !{&define ([speaker] Bob the Slayer) }{& if @|speaker|smooth_jazz}somescript {&else} Sorry, speaker doesn't have the smooth_jazz attribute{&simple}{&end}
If the `smooth_jazz` attribute doesn't exist for Bob the Slayer, then the portion of the command line that gets included *also* includes the SIMPLE tag, which sends a simple message reporting that fact.

    Sorry, Bob the Slayer doesn't have the smooth_jazz attribute

 (Notice, we also used a DEFINE tag to define `speaker` and re-use it later. Also see if you can spot the other trick we used; the method is discussed in the **Advanced Usage** section.)
## Inline Rolls
### Nesting Inline Rolls
APILogic takes advantage of its loop to give you the ability to nest your reused inline rolls. For instance, we know that the first inline roll detected by the Roll20 parser can be reused in the command line by using the `$[[0]]` marker. However, using that marker nested inside another inline roll would break the Roll20 parser and throw an error:

    [[ $[[0]]d10 ]]

*(this breaks in a normal chat call!)*
If APILogic detects a nested inline roll, it will drop the marker out and substitute in the value of the roll. To make it work, you should escape the outer roll brackets.

    \[\[ $[[0]]d10 \]\]
That way, by the time the Roll20 parsers see the outer roll structure, APILogic will have replaced the inner roll marker with the value of the roll.

Nest multiple levels of inner rolls by using 1-more escape character for each outer wrapping of inline roll structure. 
### Getting the Value of an Inline Roll
As mentioned just above, any inline roll detected as nested in another inline roll is automatically converted to its resulting value. This also happens for any inline roll included as part of an IF or ELSEIF's condition. There may, however, be other times you wish to extract the value of another inline roll in a message being processed by APILogic. When that need arises, you can append `.value` to the closing double bracket structure to have APILogic substitute the resulting value from the roll in place of the roll marker.

    !somescript {& define ([boneroll] [[1d10]].value) }{& if boneroll > 3} ... {& end}

You can append the `.value` to an inline roll (`[[1d10]].value`) or to an inline roll marker (`$[[0]].value`). **Note** that if you use the `.value` to extract the result value from a roll marker, the referenced roll must exist at the time that the value is extracted, or else it will be replaced by 0.

This is important to remember when deferring the processing of inline rolls. The `.value` text is detected several times during each pass of the APILogic parsing. Therefore, the roll marker must not be recognized until the referenced, deferred roll has occurred.

This command line will work:

    !somescript {& if [[1d10]] > 3 } $[[0]].value {& end}

...because the `$[[0]]` roll is available when the value is extracted from it. This command (below), on the other hand, will not work:

    !somescript {& if @|Bob the Slayer|basket_weaving} \[\[ @\{Bob the Slayer|basket_weaving}d10\]\] {& end} $[[0]].value
APILogic will try to extract the value from the `0` roll in the roll array on the first pass of the parser. At that time, the inline roll hasn't resolved or occurred, yet. It is only after the command line is unescaped and reexamined by the Roll20 parser that the inline roll is detected. In this case, the roll marker should be deferred, too (`$\[\[0\]\].value` or `$[[0]]\.value`).

Also note that any/all inline rolls are executed and caught by the Roll20 parser if they are recognized with the Roll20 parsing is invoked (as many times as necessary). These all exists, whether or not they are a part of text that will ultimately be included in the final command line. However, if you defer an inline roll in a section of command line that will never be parsed (for instance, it is in a `false` branch of the IF block), that text will never be unescaped, so that roll will never exist.

Remember that APILogic is helping you construct the command line based on conditional checks, and if you would normally feed the resulting roll structure in the command line to an API call to another script, the chances are good that the receiving script already knows how to handle the inline rolls and roll markers. Most of the time, then, you shouldn't have to extract the result value for roll that is part of a command line that will ultimately be picked up by another script.
## Order of Operations
Once APILogic detects that it needs to do work on the message, it performs a loop of processing until it no longer detects that any further parsing is required. The order looks like this:

    User sends command
    ===== BEGIN LOOP =====
    Roll20 parses (inline rolls, selected/target calls, sheet calls, etc.)
    APILogic picks up the message (if necessary)
    Inline rolls are collected
    MULE (load/get): Mules loaded, variables retrieved
    MATH: Math operations are run
    EVAL: Early eval scriptlets launched
    DEFINE: Definitions created
    EVAL-: Late eval scriptlets launched
    IF: Logical processing
    MULE (set): Variables are set
    ===== END LOOP =====
    STOP/SIMPLE: Prior to releasing the message, these tags are evaluated for intended behaviors
    MESSAGE RELEASED
The loop is where the importance of deferring parts of the processing becomes apparent.

**Note:** after the first trip through the loop, other things will contribute to telling APILogic to continue processing. In addition to automatically continuing if it sees an IF, DEFINE, EVAL, EVAL-, MULE, or MATH tag, after the second pass APILogic will also continue if it detects a new inline roll and/or a Mule `get` or a `set` statement (any of which would have been deferred to have been only detected at this point).
## Advanced Usage and Tricks
### Defining Inline Rolls
Knowing which inline roll marker (i.e., `$[[0]]`) refers to which inline roll can sometimes be confusing, especially for rolls containing rolls in a message that has other rolls containing rolls, or for branches of the logic that don't exists anymore, or where you deferred an inline roll with escape characters in part of the command line that was never processed.

A rough description is that Roll20 processes (and numbers) the rolls from innermost-leftmost to outermost-rightmost. Like I said, that can be confusing, especially when you add in APILogic letting  you nest roll markers. In that case, the second pass of roll indices will start where the first pass left off, from innermost-leftmost to outermost-rightmost.

You can shortcut having to parse all of that by using an inline roll in a DEFINE tag `definition`, at the proper level of escape for when the roll should process. That way, when the roll in this definition resolves:

    {& define ([chaosdice] [[2d10!]] ) }

...the `chaosdice` `term` will be filled with the appropriate roll marker `definition`. In effect, APILogic sees:

    {& define ([chaosdice] $[[0]] ) }

...and uses that `definition` anywhere it sees the `chaosdice` `term` else where in the command line.
### Table Result Recursion
The normal process of replacing a roll with its value (for instance with the `.value` command or by nesting it in a deferred inline roll) will return the table entry for a rollable table. Obviously, you may need to verify through straight input into the chat that the roll you enter will return a table entry instead of a number. For instance, `[[ 1t[Armor] ]]` will return the item from the table, while `[[ 2t[Armor] ]]` will return the result of only the first roll against the table, and `[[ 1t[Armor] + 2 ]]` will return `2`.

This, paired with the fact that APILogic searches for newly-formed inline roll formations during each pass of the parsing, means you can leverage this behavior to handle recursive rolls based on table entries. If the `Armor` table has entries of:

    [[1d10]]
    [[1d10+3]]
    [[2d10r<2-3]]
    [[2d10r<2]]

...and the following text is encountered in your command line:

    [[ 1t[Armor] ]].value

Then whatever result is obtained from rolling against that table will insert another inline roll into the command line, which will be detected and rolled by the Roll20 quantum roller.

Be aware that the resulting roll will, itself be wrapped in an inline roll marker (`$[[0]]`), so if you need to obtain the value from it (and it is not nested in another deferred inline roll) you will need another `.value`. Obviously, if that value is another table entry, and the table entry points to another inline roll, the process will continue.

### Conditional non-API Calls (Basic Chat Messages)
If you want to just want to leverage logical structures for your simple chat message, so you don't want to end up with an API call at all, put a SIMPLE tag outside of any logical structure (in text that will always be included in the final, reconstructed command line). In that case, simply begin your message (or your first IF or DEFINE tag) after the `!`.

    !{& if @|Bob the Slayer|slogan}@\{Bob the Slayer|slogan}{& end} For tomorrow we dine in hell.{& simple}

If Bob the Slayer has a slogan, this will include that and tack on the extra. Otherwise, it would just output the last portion as a simple chat message.
### Obfuscating the API Handle
Since we are interrupting other scripts answering the API message and reconstructing the command line that they see, we can preempt the API handle that would trigger another script to pick up the message. We did this, above, when we had a SIMPLE tag embedded in an IF construct. If we are going to drop the resulting message to a simple chat statement, we probably wouldn't want the API handle to some other script to be included, so we make its inclusion dependent on the result of some conditions.

    !{& if @|Bob the Slayer|smooth_jazz}somescript arg1 arg2{&else} Sorry, speaker doesn't have the smooth_jazz attribute{&simple}{&end}
If `smooth_jazz` exists for Bob the Slayer, the above example will run the `somescript` script. If it does not exist, the api handle for that script is dropped, but the `{& simple}` tag is included, ensuring that a readable message is sent to the chat window.
### Mules as Static Access Tables
Rollable tables on Roll20 do a lot to provide random results from weighted entries, which can be good for things like random encounters or the like, but which aren't as helpful for times when you know the value from which you need to derive the result. For instance, if a given level of a character's Stamina has a direct correlation to a mod applied to their activities, you don't need a randomized result... you need the result directly tied to what the character's Stamina is when you consult the table. Similarly, some systems have charts built for how rolls map an attack roll to damage. A Mule can fill this gap.

Construct your Mule as the entries of the table, with the various states of the referenced input as the variable names. For an Encumbrance Mod table that would return a modifier to rolls based on the weight of the items the character was carrying, that might look like:

    0=0
    1=0
    2=-1
    3=-1
    4=-1
    5=-2
    ...etc...
If the Mule were named "EncumbranceTable", you can reference that using the character's CarryWeight attribute like so:

    ... {& mule EncumbranceTable} ... get.@{selected|CarryWeight} ...
Using a Mule this way, you can also leverage a MATH tag, if the input number needs to be altered at all:

    get\.{& math @{selected|CarryWeight} + 2*(20-@{selected|Stamina}) }

The above adds twice the value that the character's Stamina is below 20 to the CarryWeight before determining which row to retrieve. Also note that since MATH tags are evaluated *after* `get` statements, the `get` had to be deferred for one cycle of the loop.

## Development Path:

- Numeric Ranges as Mule Variable Names (i.e., 1-10)
 - Including token items as conditions
 - SWITCH/CASE tag
 - ~~MAX/MIN tag~~
 ~~- Levenshtein Distance for approximate names~~
 - ~~Other special tests for sheet items~~
 ~~- EVAL tag~~

## Change Log:

**Version 1.0.0** - Initial Release
**Version 1.0.1** ([link](https://app.roll20.net/forum/permalink/9772610/)) - minor bug fix related to inline table resolution
**Version 1.1.0** ([link](https://app.roll20.net/forum/permalink/9787044/)) - changed special tests for sheet items to be `int` and `max` instead of `i` and `m`; changed DEFINE tags to evaluate sheet items; added the ability to return the `name` of a sheet item
**Version 1.1.1** ([link](https://app.roll20.net/forum/permalink/9797691/)) - Minor bug fix, added rowname and row returns for repeating items
**Version 1.1.2** ([link](https://app.roll20.net/forum/permalink/9818971/)) - Bug fix in the logic engine where numeric conditions were not always properly detected
**Version 1.1.3** ([link](https://app.roll20.net/forum/permalink/9836244/)) - Bug fix where inline rolls in a condition were not accessed correctly
**Version 1.2.0** (link) - added EVAL tag; added rule registration for scriptlet plugins; added `row` and `rowname` as retrievable things for repeating sheet items; added MATH tag for inline math calculations; added MULE tag (and get/set language) to handle variable storage
# APPENDICES
## APPENDIX I - Writing a 3rd-Party Script Plugin
The EVAL tag allows for anyone with a little coding experience to provide an infinite number of extensible features. The EVAL tag will run the script as designated, looking first in its bank of registered plugins. If the script isn't found there, APILogic will send the script call to the chat to have the script fire that way.

**Remember**, only plugins registered to APILogic are handled in sequence, with their result substituted into the command line. If nothing is returned, an empty string will be substituted in place of the EVAL block. Only after the plugin code finishes does APILogic take over again. Calls to outside scripts, on the other hand, are not guaranteed to finish before APILogic moves on.

So, how do you write a scriptlet and register it to APILogic?
### Accept a Message
A plug-in for APILogic should accept a message object, just as any function that answers a chat event (i.e., handleInput). In fact, your script can *also* answer a chat event if you like (more on that under **Who Called?**). The message object will be identical to a message that would be received from a user -- it will have properties of `who`, `playerid`, `content`, etc. If there were any inline rolls, it will have an `inlinerolls` array. This will be a ***copy*** of the message data that is in APILogic, with the `content` replaced to be the reconstructed command line that the user would have sent had they invoked your script directly from chat.

In other words, the `withinrange` script might require a command line like the following, if it were to be invoked from the chat interface: 

    !withinrange 3 -M1234567890abcdef ,

When a user places that in an EVAL tag block, they would write:

    {& eval}withinrange(3 -M1234567890abcdef ,){& /eval}

If APILogic detects `withinrange` as a registered plugin in that game, it will hand off a message with the former command line.

Accepting a message might look like this:

    const withinrange = (m) => {
    	log(m.who); // logs who sent the message
    };

### Parse the content String
As you would with any script, parse the command line to extract the data you require to perform your calculations. If you intend to allow the scriptlet to be called from the command line, make sure that you verify ownership of the message, as well. This might look like:

    const withinrange = (m) => {
	    // verify ownership
	    if (m.type !== 'api' || !/^!withinrange\s/.test(m.content)) return;
    	// parse arguments
    	let [range, sourcetoken, delim] = m.content.split(' ').slice(1);
    	log(range);
    	log(sourcetoken);
    	log(delim);
    };

### Perform Calculations and Return
Code as you normally would to calculate and arrive at the data you are looking for. When you are done, if you want something to be substituted into the original command line (where APILogic called your plugin), return a string, number, bigint, or boolean. Anything else (included no return or an undefined return) will be replaced with an empty string.
#### Who Called?
A message that comes from APILogic to a plugin scriptlet will have one property that a chat-interface-generated or API-generated call will not have: `apil`. If you want your script to answer both a straight invocation as well as an APILogic invocation, you can differentiate your return based on if you detect this property.

For instance, if a user invokes `withinrange` from the chat interface, maybe we want to display a small panel of information regarding the tokens that are in the specified range -- including their image, name, etc. However, if the call comes from APILogic, you only want to return the token IDs in a delimited string. In that case, once you have arrived at the data, you could test for existence of the `apil` property, and return accordingly:

    let tokens = getTheTokens();
    if (m.apil) return tokens.join(delim);
    // if the code continues, you're dealing with a direct invocation
    // so proceed to build the panel output...
### Register to APILogic
The step that turns your script into an APILogic plugin is when your script implements the APILogic.RegisterRule() function in an `on('ready'...)` block. Here is an example:

    on('ready', () => {
        try {
            APILogic.RegisterRule(withinrange);
        } catch (error) {
            log(error);
        }
    });
The RegisterRule() function can take any number of functions as parameters, so tack on as many plugins as you've written:

    APILogic.RegisterRule(withinrange, getclosest, getpageforchar);
## APPENDIX II - Included Script Plugins
The following Script Plugins are included as a part of the APILogic script. If you find a script plugin that you use to be quite helpful, it can be rolled into the included library of plugins for a future release of APILogic.
### getDiceByVal
Retrieves a subset of dice from an inline roll based on testing them against a series of pipe-separated value ranges. Outputs either a count of the number of dice (the default), or a total of the dice, or a delimited list of the dice values (delimiter default is a comma).

    ===== EXAMPLE SYNTAX =====
    getDiceByVal( $[[0]] <=2|6-7|>10 total)
The above would retrieve dice from the first inline roll ($[[0]]) that were either less-than-or-equal-to 2, between 6 and 7 (inclusive), or greater than 10. It would output the total of those dice.

If you choose a list output, the default delimiter is a comma. You can alter this by using a pipe character followed by the delimiter you wish to include. If your delimiter includes a space, you must enclose it in either single-quotation marks, double-quotation marks, or tick characters.

    getDiceByVal( $[[1]] 1|3|5|7|9 list)

The above would output a comma-separated list of odd value die results from the second inline roll ($[[1]]). The following table shows how the delimiter changes based on altering the 'list' argument:

    ARG			|	EXAMPLE OUTPUT
    ------------|---------------------
    list		|	3,7,5,9
    list|", "	|	3, 7, 5, 9
    list|+		|	3+7+5+9
    list|` + `	|	3 + 7 + 5 + 9
    list|		|	3759

### getDiceByPos
Retrieves a subset of dice from an inline roll based on testing them against a series of pipe-separated position ranges. Outputs either the total of the number of dice (the default), or a count of the dice (seems pointless, but it's available), or a delimited list of the dice values (delimiter default is a comma). Dice position is 0-based, so the first die is in position 0, the second in position 1, etc.

    ===== EXAMPLE SYNTAX =====
    getDiceByPos( $[[0]] <=2|6)
The above would retrieve dice from the first inline roll ($[[0]]) that were in positions 0, 1, 2, or 6. It would output the total of those dice.

The same guidelines apply for the list delimiter as for the *getDiceByVal* plugin, above.

## APPENDIX III - Included Math Functions
The following functions are available as part of the Math processor. Feel free to suggest others if you think one would be helpful.
- **abs(x)** Returns the absolute value of *x*
- **acos(x)** Returns the arc-cosine of *x*
- **asin(x)** Returns the arc-sine of *x*
- **asinh(x)** Returns the hyperbolic arc-sine of *x*
- **atan(x)** Returns the arc-tangent of *x*
- **atanh(x)** Returns the hyperbolic arc-tangent of *x*
- **atantwo(x, y)** Returns the arc-tangent of the quotient of the arguments (*x*, *y*)
- **cbrt(x)** Returns the cube root of *x*
- **ceiling(x)** Returns the smallest integer larger than *x*
	- -2.1 => -2
	- 2.1 => 3
- **cos(x)** Returns the cosine of *x*
- **cosh(x)** Returns the hyperbolic cosine of *x*
- **exp(x)** Returns Euler's constant (*e*), the base of the natural log, raised to *x*
- **expmone(x)** Returns 1 subtracted from the value of Euler's constant (*e*) raised to *x*
- **floor(x)** Returns the largest integer less than *x*
	- -2.1 => -3
	- 2.1 => 2
- **hypot(x[, y [, ...]])** Returns the square root of the sum of the squares of its arguments
- **log(x)** Returns the natural logarithm of *x*
- **logonep(x)** Returns the natural logarithm of 1 + *x*
- **logten(x)** Returns the base-10 logarithm of *x*
- **logtwo(x)** Returns the base-2 logarithm of *x*
- **min([x[, y[, ...]]])** Returns the smallest value of 0 or more numbers
- **max([x[, y[, ...]]])** Returns the largest value of 0 or more numbers
- **pow(x, y)** Returns the value of *x* raised to the *y* power
- **rand()** Returns a pseudo-random number between 0 and 1
- **randa(x[, y[, ...]])** Returns a random element from a list of 1 or more numbers
- **randb(x, y)** Returns a pseudo-random number between *x* (inclusive) and *y* (inclusive)
- **randib(x, y)** Returns a pseudo-random integer between *x* and *y*, where the lesser value is inclusive and the larger value is exclusive
- **round(x, y)** Returns *x* rounded to *y* decimal places
- **sin(x)** Returns the sine of *x*
- **sinh(x)** Returns the hyperbolic sine of *x*
- **sqrt(x)** Returns the square root of *x*
- **tan(x)** Returns the tangent of *x*
- **tanh(x)** Returns the hyperbolic tangent of *x*
- **trunc(x)** Returns the integer portion of *x*
	- -2.1 => -2
	- 2.1 => 2











