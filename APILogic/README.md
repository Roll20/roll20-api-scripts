# APILogic
APILogic introduces logical structures to Roll20 command lines: things like IF, ELSEIF, and ELSE. It can test sets of conditions and, depending on the result, include or exclude parts of the command line that actually reaches the chat processor. For example, given the statement:

    !somescript {& if a = a} true stuff {& else} default stuff {& end}
...results in the following reaching the chat:

    !somescript true stuff

APILogic exploits a peculiarity of the way many of the scripts reach the chat interface (a peculiarity first discovered by -- who else? -- The Aaron) to give it the ability to intercept the chat message ***before*** it reaches other scripts, no matter if it is installed before or after them in the script library. It also uses a separate bit of script magic to let it retain ownership of the message even when otherwise asynchronous chat calls would be going.

(The method APILogic utilizes has been tested and shown to work with a large number of scripts. If you find that it doesn't, you should be reminded that the most foolproof way to ensure proper timing of script execution is to load APILogic in your script library before the other script. But hopefully you'll find that you don't need to do that!)

Although it requires the API, it is not only for API messages. You can use these logic structures with basic chat messages, too. This document will show you how.
## Triggering and Usage
You won't invoke APILogic directly by using a particular handle and a line dedicated for the APILogic to detect. Instead, any API call (beginning with an exclamation point: '!')  that also includes either an IF or DEFINE tag somewhere in the line will trigger APILogic to examine and parse the message before handing it off to other scripts.

As mentioned, you are not limited to using APILogic only for calls that are intended for other scripts. There are mechanisms built into the logic that let you output a simple chat message (no API) once you've processed all of the logic structures. That means you can use the logic structures in a simple message that was never intended to be picked up by a script, and also in a message that, depending on the conditions provided, might need to be picked up by another script, or alternatively flattened to a simple message to hit the chat log.

## The Basic Structures: IF, ELSEIF, ELSE, and END
An IF begins a logical test, providing conditions that are evaluated. It can be followed by any number of ELSEIF tags, followed by zero or 1 ELSE tag. Finally, an IF block must be terminated with an END tag. Each of these are identified by the `{& ... }` formation. A properly structured IF block might look like this:

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
For abilities, the text (or action) of the ability will be returned; for attributes and repeating attributes, the current value. To retrieve the "max" value of an attribute or repeating attribute, see **Special Tests and Returning "max"**, below.

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
**MAX:** To return the max value, utilize an `max` in the same position, with or without other special tests.

    {& if @intmax|Bob the Slayer|weaponsmith > 10 }

The above tests the existence of the `weaponsmith` attribute for Bob the Slayer, whether the `max` value is an integer, and whether that `max` value is over 10.
**NAME:** Sometimes (especially for a repeating item), it is helpful to return the name of the thing on the sheet. Used in a definition, this give you an easy way to retrieve the value of a repeating item in other scripts. To get the name of a field from a repeating element, include `name` in the same position.

    {& define *name|Bob the Slayer|resources|[resource_name="arrows"]|resource_name }

The above would return, for example:

    repeating_resources_-M5sYfPs0x3LgGSdmXC1_resource_name

...representing the attribute for `resource_name` where the resource represented "arrows". The name returned is the name of the field referenced as the last element in the structure, whatever that is. So the following would return the name of the `resource_quantity` attribute for the same "arrows" resource:
    {& define *name|Bob the Slayer|resources|[resource_name="arrows"]|resource_quantity }


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

The above would store the result of the condition (whether Bob the Slayer's sanity was over 10) as `sanitycheck`, available to be used later in the command line.

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

(See **Advanced Usage** for more ways to leverage the DEFINE tag.)

### Difference Between Definition and Named Group
As mentioned in the section on using named groups, although the syntax for defining a `term` is very similar to naming a group, the two structures are different. If you placed the entirety of a group as a `definition`, you would be replicating that text anywhere you referenced the associated `term`, but each time that text was encountered, the group would be evaluated anew. Declaring the name for the group in an IF tag, where that name represents a set of conditions, ensures that those conditions are only evaluated once.

## Escaping Text (Deferring Processing)
You can use `\` characters to break up text formations that the Roll20 parser might otherwise recognize and try to process before you are ready. The escape character is removed before the message is released to other scripts.

For instance, referencing an attribute that does not exist might normally through the parser and have an error report to the chat output. In that case, you could use escaping to mask the evaluation of the referenced attribute, and only include it in the command line if the attribute exists:

    !somescript {& if @|Bob the Slayer|smooth_jazz } @\{Bob the Slayer|smooth_jazz} {& end}
The escape character prevents the Roll20 parser from recognizing the request for the `smooth_jazz` attribute until we've determined whether the attribute exists in the first place. If it doesn't exist, that portion of the line never survives to be included in the final output.

Here's another example where that potentially non-existent value would be the basis for the number of dice in an inline roll. In this case, both the attribute detection ***and *** the inline roll need to be deferred;

    \[\[ @\{Bob the Slayer|smooth_jazz}d10 \]\]

### Timing
APILogic gets the message **after** the Roll20 parser has already handled things like requests for sheet items, roll queries, and inline rolls. Then it processes the DEFINE tag, followed by the logical constructs. After all of that work is finished, it un-escapes characters and uses a bit of script magic to invoke the whole process again (including Roll20 parsers to handle the "newly created" detectable items as well as the APILogic test for "newly created" DEFINE blocks or IF blocks) before releasing the message to other scripts.
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

    ![& if @|Bob the Slayer|slogan]@\{Bob the Slayer|slogan}[& end] For tomorrow we dine in hell.[& simple]

If Bob the Slayer has a slogan, this will include that and tack on the extra. Otherwise, it would just output the last portion as a simple chat message.
### Obfuscating the API Handle
Since we are interrupting other scripts answering the API message and reconstructing the command line that they see, we can preempt the API handle that would trigger another script to pick up the message. We did this, above, when we had a SIMPLE tag embedded in an IF construct. If we are going to drop the resulting message to a simple chat statement, we probably wouldn't want the API handle to some other script to be included, so we make its inclusion dependent on the result of some conditions.

    !{& if @|Bob the Slayer|smooth_jazz}somescript arg1 arg2{&else} Sorry, speaker doesn't have the smooth_jazz attribute{&simple}{&end}
If `smooth_jazz` exists for Bob the Slayer, the above example will run the `somescript` script. If it does not exist, the api handle for that script is dropped, but the `{& simple}` tag is included, ensuring that a readable message is sent to the chat window.
## Development Path:

 - Including token items as conditions
 - MAX/MIN tag
 - SWITCH/CASE tag
 - Levenshtein Distance for approximate names
 - Other special tests for sheet items

## Change Log:

**Version 1.0.0** - Initial Release

