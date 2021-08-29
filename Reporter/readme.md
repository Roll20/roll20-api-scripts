Reporter is a script that reads the tokens on the board that are associated with character sheets and builds a report of them in the chat, returning selected values from either the token settings or the character sheets they are associated with. You can either select a set of tokens to work with, or if you select no tokens, it will assume all tokens on the Object/Token layer. This behavior can be altered using keywords, described below. The basic syntax is:

`!report --[queries] ---[buttonline] ----[keywords]`
****

**Queries**

Queries are constructed using

**t|attribute** to poll a token attribute

**c|attribute** to poll a character sheet attribute

**Examples**

**--t|name** would return a report of all selected token names

**--c|strength** would return a report of all strength values on the character sheets of the selected tokens

For character sheets, the script will try to pull a value from the character journal first, and if that does not exist, the installed character sheet.

**Dividers**

You may not always want each attribute reported on its own line. You can add a code after the attribute name(not the alias) to use something either than a line return between attributes

**comma (,)** Adds three non-breaking spaces between this attribute and the next, keeping them on the same line when possible.

**period (.)** Adds a vertical pipe between this attribute and the next, keeping them on the same line when possible.

**dash (-)** Adds a thin gray horizontal rule between this attribute and the next.

**Hashtag (#)** Adds a bit of horizontal space between this attribute and the next.

_Examples:_

`!report --t|emits_bright_light,|Bright-Light t|bright_light_distance|Distance t|emits_low_light,|Low-Light t|low_light_distance|Distance ---light`
will return this Bright Light and Distance on the first line of each record amd Low-Light and its Distance on the second, instead of each value taking up its own line




**Aliases**

There are times in the report when you would not like 'has_bright_light_vision' in the report. You can substitute an alias for the attribute name that will display in chat. For this, just add another pipe after the query and type an alias.



For example, if a token has 60 feet of Night Vision:

`t|night_vision_distance`

might produce:

T: night_vision_distance = 60

but

`t|night_vision_distance?NV`

would yield:

T: NV= 60



### Buttonline

The buttonline is a string containing text and Ability or API Command buttons. These are formed using the normal syntax for such things with a few exceptions.

In order to keep the Roll20 parser from resolving queries and attribute calls before the script gets them, they need to be written slightly differently.

_Examples:_

**@{token|name}** is written as **A{token|name}**

**?{question|default_answer}** is written as Q**{question|default_answer}**



Further, for a handful of scripts, the Reporter API will attempt to parse the code so that each buttonline refers to the specific token being reported on. Currently **Token Mod**, **ChatSetAttr**, and **Supernotes** are supported.



### Filters

There are four types of operator.

`+` only includes the token/character pairs that matches the query

`-` excludes any token/character pair that exactly matches the query

`~` only includes any character that is a partial match for the query

`^` excludes any character that is a partial match for the query

thus:

`!report||-|c|name|Goblin` will return all tokens that are not represented by the Goblin character sheet.

`!report||~|c|name|Goblin` will return any tokens that are represented by the Goblin or Hobgoblin character sheet.

`!report||-|c|npc|1||+|t| has_night_vision|true` will exclude all NPCs (leaving only PCs), and then only return those that have nightvision set.

Filters do not support an alias, because they are never displayed in the final report.

Filters are executed sequentially, with each filter working on the result from the last, so some logic is required for best results.

Filters are case insensitive.

There is as yet, no way to test for an empty, or undefined value, however, the keyword `hideempty|true` will cause the report to suppress the display of empty values.



### Special Codes

Reporter contains a few special codes for common cases, to make macro writing easier. You can put thes in place of normal commands:

--visionas the Query will replace any declared query line with one designed to report most vision situations. It will give values for whether the token has sight, night vision and what the distance of any night vision is.

---vision as the Buttonline will replace any declared button line with a buttonline designed to handle most cases of vision and darkvision.

--light as the Query will replace any declared query line with one designed to report most lighting situations. It will give values for the amount of light, distance and what type.

---light as the Buttonline will replace any declared button line with a buttonline designed to handle most cases of lighting.

---actions as the Buttonline will replace any declared button line with a buttonline made up of the token action buttons associate with the character. This is designed for synergy with the Token Action Maker script, but is not essential. Not that the token actions created by this command cannot contain roll templates and will not convert the selected|commandname structure. this requires very careful parsing and is best avoided. It should work flawlessly with Token Action Maker commands, with the exception of the "Check" and "Save" buttons, for the reasons just mentioned.



### Keywords

keywords change the overall appearance or scope of the report. They are separated from the rest of the report by four dashes and must come at the end.

layer|[gmlayer|objects|map|walls|tracker|all] will constrain the report to a particular layer or all layers at once, so long as no tokens are selected. If any tokens are selected, Reporter will default to the layer the selected tokens are on. This makes it easier for instance to check the vision settings of tokens on the token layer and the gmlayer simultaneously, or to ping pull to note tokens on the gm layer without switching manually to that layer.  

If the layer keyword all is used the report will be on all token/character pairs on all layers. In this case, a layer character will appear on each subhead line of the report to let you know which layer the token is on. 

If the layer keyword tracker is used the report will be on all token/character pairs on the Turn Tracker as if it were a layer. In this case, a layer character will appear on each subhead line of the report to let you know which layer the token is on. If you click on the layer token, it will switch the token from the GM/Notes layer to the  Token/Objects layer and back.

compact|[true|false] (default=false): The compact mode shows the token image at half size, and eliminates the second line of the report subhead, since it is not always desired. You may have a very large report you want to see better, or you may be using a sheet that does not support the default values. Currently the second line of the subhead only references the D&D 5th Edition by Roll20 Sheet. 

showheader|[true|false] (default=true): This will control whether the header will display at the top of the report. 

showfooter|[true|false] (default=true): This will control whether the footer will display at the bottom of the report. 

printbutton|[true|false] (default=true): This will control whether the print button will display on each line of the report. 

notesbutton|[true|false] (default=false): This will control whether a notes button will display on each line of the report. This notes button will return the token notes for the token on that line. The visibility of the notes button is controlled by the visibility keyword. If the visibility is "gm", it will use a !gmnote command, if the If the visibility is "whisper", it will use a !selftnote command, and if the visibility is "all", it will use a !pcnote command. 

visibility|[gm|whisper|all] (default=gm): This will determine how the report is presented. "gm" is whispered to the gm, "whisper" is whispered to the user who sent the command, "all" is posted openly for all to see. 

showfooter|[true|false] (default=true): This will control whether the footer will display at the bottom of the report. 

source|[true|false] (default=true): if source is set to false, the C and T characters that show whether an attribute comes fromthe token or the sheet will not be displayed. Use this is they are a distraction. 

charactersheetlink|[true|false] (default=true): if this keyword is set to false, the link to open the token's corresponding character sheet will not display 

subtitle|[true|false] (default=true): if this keyword is set to false, the line directly below the character name will not display. (This is also the default in Compact mode). This may be desirable if not using the D&D 5th Edition by Roll20 Sheet. 

ignoreselected|[true|false] (default=false): if this keyword is set to true, the search will not be preset to whichever tokens are selected. The report will run as if no tokens were selected, following whatever layer criteria might have been specified. 

npcsubstitutions[true|false] (default=true): if this keyword is set to false, the script will not automatically substitute npc attributes for their PC counterparts (ex: npc_senses for passive_wisdom).This is good for sheets that are not the D&D 5th Edition by Roll20 Sheet. 

sort|attribute (default is the raw order): This keyword will sort the final list. Most of the sorts are confined to the token attributes, since they require internal code and if they refer to a sheet may return poor or no results if the sheet does not have the proper attributes. Currently the following values can be sorted on:  

charName: character name. Sheet must have a "name" attribute.

charNameI: character name, inverse order. Sheet must have a "name" attribute.

tokenName: token name

tokenNameI: token name, inverse order.

bar1: token bar1 value

bar1I: token bar1 value, inverse order.

bar2: token bar2 value

bar2I: token bar2 value, inverse order.

bar3: token bar3 value

bar3I: token bar3 value, inverse order.

cr - Challenge Rating. D&D 5th Edition by Roll20 Sheet only

crI - Challenge Rating, inverse order. D&D 5th Edition by Roll20 Sheet only



title|Title| If this is present in the keywords, the string in between pipes will be placed at the top of the report. If you only want the custom title to display, be sure turn off the header with showheader|false. The title must be placed between two pipes. title|My Title| will work. title|My Title will break.
