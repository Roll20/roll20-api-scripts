**Reporter** reads the tokens on the board that are associated with character sheets and builds a report of them in the chat or to a handout, returning selected values from  the token settings or the character sheets they are associated with.

Reporter has specific support for the _D&D 5th Edition by Roll20_, _D&D5E Shaped_, _Pathfinder First Edition by Roll20_, and _Pathfinder Second Edition by Roll20_ sheet. There is an option to choose *other* for the sheet, which will disable the few sheet-specific shortcuts. It should work with most any sheet or no sheet at all. The first time you run the script, it will ask you to choose which sheet you are using. You can change this behavior with `!report --config|sheet`

You can either select a set of tokens to work with, or if you select no tokens, it will assume all tokens on the Object/Token layer. This behavior can be altered using keywords, described below. The basic syntax is:

`!report --[queries] ---[buttonline] ----[keywords]`
****

### Queries

Queries are constructed using

`t|attribute` to poll a token attribute

`c|attribute` to poll a character sheet attribute

**Examples**

`--t|name` would return a report of all selected token names

`--c|strength` would return a report of all strength values on the character sheets of the selected tokens

For character sheets, the script will try to pull a value from the character journal first, and if that does not exist, the installed character sheet.

### Dividers

You may not always want each attribute reported on its own line. You can add a code after the attribute name(not the alias) to use something either than a line return between attributes

**comma (`,`)** Adds three non-breaking spaces between this attribute and the next, keeping them on the same line when possible.

**period (`.`)** Adds a vertical pipe between this attribute and the next, keeping them on the same line when possible.

**dash (`-`)** Adds a thin gray horizontal rule between this attribute and the next.

**Hashtag (`#`)** Adds a bit of horizontal space between this attribute and the next.

_Examples:_

`!report --t|emits_bright_light,|Bright-Light t|bright_light_distance|Distance t|emits_low_light,|Low-Light t|low_light_distance|Distance ---light`
will return this Bright Light and Distance on the first line of each record amd Low-Light and its Distance on the second, instead of each value taking up its own line


### Aliases

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

`--vision` as the Query will replace any declared query line with one designed to report most vision situations. It will give values for whether the token has sight, night vision and what the distance of any night vision is.

`---vision` as the Buttonline will replace any declared button line with a buttonline designed to handle most cases of vision and darkvision.

`--light` as the Query will replace any declared query line with one designed to report most lighting situations. It will give values for the amount of light, distance and what type.

`---light` as the Buttonline will replace any declared button line with a buttonline designed to handle most cases of lighting.

`---actions` as the Buttonline will replace any declared button line with a buttonline made up of the token action buttons associate with the character. This is designed for synergy with the Token Action Maker script, but is not essential. Not that the token actions created by this command cannot contain roll templates and will not convert the {selected|commandname} structure where it might appear in an ability. This requires very careful parsing and is best avoided. It should work flawlessly with Token Action Maker commands, with the exception of the "Check" and "Save" buttons (which it will skip), for the reasons just mentioned.



### Keywords

keywords change the overall appearance or scope of the report. They are separated from the rest of the report by four dashes and must come at the end.

`layer|[gmlayer|objects|map|walls|tracker|all]` will constrain the report to a particular layer or all layers at once, so long as no tokens are selected. If any tokens are selected, Reporter will default to the layer the selected tokens are on. This makes it easier for instance to check the vision settings of tokens on the token layer and the gmlayer simultaneously, or to ping pull to note tokens on the gm layer without switching manually to that layer.  

If the layer keyword all is used the report will be on all token/character pairs on all layers. In this case, a layer character will appear on each subhead line of the report to let you know which layer the token is on. 

If the layer keyword tracker is used the report will be on all token/character pairs on the Turn Tracker as if it were a layer. In this case, a layer character will appear on each subhead line of the report to let you know which layer the token is on. If you click on the layer token, it will switch the token from the GM/Notes layer to the  Token/Objects layer and back.

`compact|[true|false]` _(default=false):_ The compact mode shows the token image at half size, and eliminates the second line of the report subhead, since it is not always desired. You may have a very large report you want to see better, or you may be using a sheet that does not support the default values. Currently the second line of the subhead only references the _D&D 5th Edition by Roll20_  and _Pathfinder Second Edition by Roll20_ Sheets. 

`showheader|[true|false]` _(default=true):_ This will control whether the header will display at the top of the report. 

`showfooter|[true|false]` _(default=true):_ This will control whether the footer will display at the bottom of the report. 

`printbutton|[true|false]` _(default=true):_ This will control whether the print button will display on each line of the report. 

`notesbutton|[true|false]` _(default=false):_ This will control whether a notes button will display on each line of the report. This notes button will return the token notes for the token on that line. The visibility of the notes button is controlled by the visibility keyword. If the visibility is "gm", it will use a !gmnote command, if the If the visibility is "whisper", it will use a !selftnote command, and if the visibility is "all", it will use a !pcnote command. 

`visibility|[gm|whisper|all]` _(default=gm):_ This will determine how the report is presented. "gm" is whispered to the gm, "whisper" is whispered to the user who sent the command, "all" is posted openly for all to see. 

`showfooter|[true|false]` _(default=true):_ This will control whether the footer will display at the bottom of the report. 

`source|[true|false]` _(default=true):_ if source is set to false, the C and T characters that show whether an attribute comes fromthe token or the sheet will not be displayed. Use this is they are a distraction. 

`charactersheetlink|[true|false]` _(default=true):_ if this keyword is set to false, the link to open the token's corresponding character sheet will not display 

`subtitle|[true|false]` _(default=true):_ if this keyword is set to false, the line directly below the character name will not display. (This is also the default in Compact mode). This may be desirable if not using the _D&D 5th Edition by Roll20_  or _Pathfinder Second Edition by Roll20_ Sheets. 

`ignoreselected|[true|false]` _(default=false):_ if this keyword is set to true, the search will not be preset to whichever tokens are selected. The report will run as if no tokens were selected, following whatever layer criteria might have been specified. 

`npcsubstitutions[true|false]` _(default=true):_ if this keyword is set to false, the script will not automatically substitute npc attributes for their PC counterparts (ex: npc_senses for passive_wisdom).This is good for sheets that are not the _D&D 5th Edition by Roll20_  or _Pathfinder Second Edition by Roll20_ Sheets. 

`sort|attribute` _(default is the raw order):_ This keyword will sort the final list. Most of the sorts are confined to the token attributes, since they require internal code and if they refer to a sheet may return poor or no results if the sheet does not have the proper attributes. Currently the following values can be sorted on:  

- charName: character name. Sheet must have a "name" attribute.
- charNameI: character name, inverse order. Sheet must have a "name" attribute.
- tokenName: token name
- tokenNameI: token name, inverse order.
- bar1: token bar1 value
- bar1I: token bar1 value, inverse order.
- bar2: token bar2 value
- bar2I: token bar2 value, inverse order.
- bar3: token bar3 value
- bar3I: token bar3 value, inverse order.
- cr - Challenge Rating. D&D 5th Edition by Roll20 Sheet only
- crI - Challenge Rating, inverse order. D&D 5th Edition by Roll20 Sheet only

`title|Title|` If this is present in the keywords, the string in between pipes will be placed at the top of the report. If you only want the custom title to display, be sure turn off the header with showheader|false. The title must be placed between two pipes. title|My Title| will work. title|My Title will break.

`handout|Handoutname|` If this is present in the keywords, the report will be sent to a handout instead of chat. This can allow a report to remain usable without scrolling through the chat. It can also be used as a sort of floating palette. Reports in handouts can be updated. Running the macro again will regenerate the table, as will pressing the Repeat button. The string in between pipes will be used as the name of the report handout. If no handout by that name exists, Reporter will create one and post a link in chat to open it. The title must be placed between two pipes. *handout|My Handout|* will work. *handout|My Handout* will break.

A report Handout automatically creates a horizontal rule at the top of the handout. Anything typed manually above that rule will be persistent. Reporter will not overwrite it. You can use this area to create Journal Command Buttons to generate new reports or to give some context to the existing report. All updates are live.

**Supernotes Buttons**

These are small buttons that will appear on each line of the report that call up Supernotes commands. These buttons require Supernotes to be installed (Available in the Roll20 One Click installed. If Supernotes is not installed, the buttons will still display but will have no effect. If the report is in the Chat tab, the notes will display in the chat tab, and if the report is set to be in a handout, the notes will in the handout, directly below the report. This can be used to create a handout that can run a report and display notes below. An example use could be a handout that can read map pins and display the notes for each map pin, making an interactive city guide. 

`tokennotesbutton|[true|false]` _(default=false):_  If this keyword is set to true, the report will place a small shortcut button to return the contents of the reported token's GM Notes field.

`charnotesbutton|[true|false]` _(default=false):_  If this keyword is set to true, the report will place a small shortcut button to return the contents of the GM Notes field of the character assigned to the reported token.

`biobutton|[true|false]` _(default=false):_  If this keyword is set to true, the report will place a small shortcut button to return the contents of the Bio Notes field of the character assigned to the reported token.

`avatarbutton|[true|false]` _(default=false):_  If this keyword is set to true, the report will place a small shortcut button to return the Avatar of the character assigned to the reported token.

`tooltipbutton|[true|false]` _(default=false):_  If this keyword is set to true, the report will place a small shortcut button to return contents of the reported token's Tooltips field.

`imagebutton|[true|false]` _(default=false):_  If this keyword is set to true, the report will place a small shortcut button to return images from the Bio field of the character assigned to the reported token.

See this thread in the Roll20 Forums for more details [Reporter Feedback thread](https://app.roll20.net/forum/post/10381135/script-reporter-1-dot-x)
