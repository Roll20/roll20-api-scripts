
#### Current Releases:

Read what was changed from version to version in the change log at the bottom of this post...
| **Script** | **Version** | **Date** |
|--|--|--|
| [InsertArg Core Engine](https://github.com/TimRohr22/Cauldron/blob/master/InsertArg/InsertArg.js) | 1.5.1 | December 3, 2020 |
IA Core Library | 1.5.1 | December 2, 2020 |
XRay | 1.2 | September 16, 2020 |

**Note:**  As of September 9, 2020, all three scripts have been rolled into one. This should make staying up to date easier as the script moves closer to getting in the R20 repo.

# Video Intro

I recorded  [this video](https://www.youtube.com/watch?v=cU3BBw9qYOo&list=PLog-TsiQzGZblbsoRQvAFaL8lOP5R4RwE&index=2&t=0s) as an introduction to the InsertArg and Xray scripts. This is definitely a script that is easier to  **SEE**  work than it is to READ about. It might pay to watch the video and then read about the particulars (below).

# InsertArg

InsertArg is a script that gives you a way to interact with information in the game and feed it to the chat and/or other scripts, or to build your own output on the fly. It can be a little meta, so let's start with an image. InsertArg is... a script preamp... a script siege engine... a socket set of interchangeable and extensible tools...

On a more concrete level, it's a way to extend other scripts, giving them functionality you might wish they had, and letting you *almost* code in the chat window. It solves many of the headaches of ad hoc necessity... like knowing how many targets to target in a command line (do you write your macro for 4 targets, when you might only need to target 1 NPC during the game?), or having to maintain multiple copies of a macro (one for straight usage, one for nested), or formatting particular character components. And like I said, it is, itself, extensible (more on that in a bit).

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/menu2.png)  

Oh, it's also a menu builder, but that's like... the third or fourth coolest thing it does. It will also xray characters:

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/xray%20base%20call.png)

...and let you walk the sheet...

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/xraysheet.png)

...drilling down on abilities, attributes, or repeating sections...

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/xrayrepeating.png)  

## Files

Though the script began as three distinct files, they have been consolidated into one to make it easier to stay up to date. You'll have to get it from my  [GitHub](https://github.com/TimRohr22/Cauldron/tree/master/InsertArg). The file you need is:

    insertarg.js  =>  the main script engine,
                      the core library of functions,
                      and XRay, a helper script to walk over character sheets
                      and help construct the right calls

## Concept

Here's how it works. InsertArg is an on-the-fly text-replacement and text-insertion script, giving you custom hooks and command-line functions for what to get, where to get it, how to format it, and where/how to output it. In other words, you can build and/or change custom command lines using built in functions in the InsertArg library, either building stand-alone commands or prefilling portions of calls to other commands. We'll break the command syntax down in a bit, but for now let's just start small:

    !ia --whisper# --show#Because it is close to us  
    // whispers: Because it is close to us

But if you had a character named "Leroy", and Leroy had an ability named "Super Spell" that had an action that read:

    !welikethemoon --why#show

...and you modified your call to InsertArg just slightly...

    !ia --whisper#Leroy|Super Spell --show#Because it is close to us

...then the line that would reach the chat would be:

    !welikethemoon --why#Because it is close to us

Leroy's original ability is unchanged, but we fed ad hoc insertions into the command line before it reached the chat. In this case, in the ability we used the hook of "show" as the marker for where to drop our replacement text. We could have used anything, but stayed with "show" since that was in our original example line (we'll get to what text can be used for hooks and built-in special hooks -- like "show" -- soon).

Finally, when you realize that the text we inserted ("Because it is close to us") could be derived at the time of running our call (via our internal function library), you begin to see how flexible and powerful InsertArg can be.

## Syntax and Usage

A call to insertarg begins with !ia, followed by arguments denoted by the double-hyphen.

#### mapArg

The very first argument (called the mapArg), tells insertarg what it's about to do, and where to find the information it needs. The mapArg can be one of these basic sorts:

    chat        ==>    sends output directly to chat, if possible, or load/button if not  
    whisper     ==>    sends output directly to chat as whisper if possible, or load/button if not  
    button      ==>    creates a button to execute the modified command line  
    load        ==>    writes the altered command line to the designated storage object (store argument; default: InsertArg ability)  
    menu        ==>    sends to chat as whispered menu

Others, like handout, log, help, and config, are allowed, but are generally used just for internal house-keeping (like producing a config or help handout). More on those later.

The second half of the mapArg (following a hash) is the source to draw your initial command line from. For chat, whisper, button, and load, you can enter an ability or macro as follows:

    --chat#Cake            ==>    if speaking as a player, this finds an ability on that character's sheet called 'Cake'  
    --chat#macro|orDeath   ==>    this finds a macro named 'orDeath'  
    --chat#Izzard|Cake     ==>    this finds an ability named 'Cake' on the character 'Izzard'

Generally in InsertArg, where a character is called for, you can use any of a character id, character name, or token id provided the token represents a character, and InsertArg will figure out who you're talking about.

If you do not specify a source for one of the four mapArg values mentioned (chat, whisper, button, load), your command line is prefilled with "show"... giving you a hook you can later replace. Looking back to our first example, we replaced the hook "show" with "Because it is close to us".  

#### Hook Arguments

Most of your arguments will take the form of --hook#value, where you want to replace or insert before/after the specified hook with the value you have retrieved. In this way, your hooks are fully customizable, and not limited to anything specified by the InsertArg script, itself.

    // Izzard has an ability named 'Cake' that reads: It's more of a maneuver, really.  
    !ia --whisper#Izzard|Cake --more#less --really#if you know what I mean  
    // produces: It's less of a maneuver, if you know what I mean.

InsertArg defaults to replacing every instance of a hook with the specified value. Since hooks are processed left to right, they are chainable, and can work with what was left to them of the source command line after previous hook argument have processed.

    // Izzard has an ability named 'Cake' that reads: It's more of a maneuver, really.
    !ia --whisper#Izzard|Cake --more#less --less#part  
    // produces: It's part of a maneuver, really.

Hook arguments can be anything you wish except for the following list of special arguments:

    bg        ==>    base background color for buttons  
    css       ==>    free css input for styling buttons  
    store     ==>    where to drop the altered command line, if necessary (default: InsertArg)  
    cmd       ==>    a special hook that represents the entirety of the command line, as it stands when processed

In the case of bg, css, and store, these arguments will be processed before any hook argument, and will not be fed to the internal parser. The special argument cmd will be treated like any other hook, processed in its turn (left to right), except using the entirety of the command line at that point as the hook.

#### Hook Consumption

One last thing to understand before we get to the really good stuff (the internal library of functions available to you), and that's how to handle hooks so that you always know (or can imagine) the state of your command line at any given time.

As I mentioned, InsertArg defaults to complete replacement of every instance of a hook found in the command line at the time of processing that hook. The entire hook is consumed and everything in your value is put in its place... and that happens everywhere we find that particular hook. There are special characters that can alter this behavior.

    --^^hook#value    ==>    inserts value before hook, leaves hook in the command line  
    --hook^^#value    ==>    inserts value after hook, leaves hook in the command line

By not consuming the hook, you gain a way to make additions to your command line, but you also leave the hook to be reusable for future hook arguments. You'll see this more when we build a menu. Also, these before/after constructions, when paired with the special hook 'cmd' (representing the entire command line) can be a way to prepend/append info to your command line.

#### Greedy Hooks, and Lazy Hooks

This one is a bit more esoteric, and it might make more sense after you read about the internal functions to understand the sort of things you can return. Again, the typical behavior is that every instance of a hook receives ALL of the value you have entered (or derived). What if you want to instead spread the return over several instances of the hook, giving each an element from the returned value? Or what if you want to deliver all of the payload to the first hook and only the first hook, leaving other instances of the hook behind? For this you will want a lazy or a greedy hook.

    --hook++#value        ==>    greedy hook; the first instance of the hook will get the value, leaving nothing for other instances of hook  
    --++hook|d#value      ==>    lazy hook; the value will be split on the delimiter (d),
                                 with the first resulting element going to the first hook,
                                 the second to the second, etc

Lazy hooks that are not consumed before the list of returned values is spent remain in the command line. The pipe character ("|") denotes the division of hook and delimiter for a lazy hook, but you may still have pipes in your hook and/or your delimiter; your delimiter may only start with a pipe, however if it is ONLY the pipe character (short of escaping; see edit note below examples). Here are examples:

                            HOOK        DELIM
    --++hook|d        ==>   hook         d  
    --++hook||        ==>   hook         |  
    --++hook||d       ==>   hook|        d  
    --++hook||d|      ==>   hook|        d|

**EDIT:**  If you get the code after 8 o'clock August 21 2020, the delim for a lazy hook can be escaped with paired ticks(``); this syntax is consistent throughout the core library of functions elsewhere delimiters are used.

#### Combining Insert and Greedy/Lazy Hooks

The syntax for combining and greedy/lazy hooks is complementary, so you could have formations like this:

    GREEDY INSERT AFTER
    --hook^^++        ==OR==  
    --hook++^^
    
    GREEDY INSERT BEFORE
    --^^hook++
    
    LAZY INSERT AFTER
    --++hook^^|d
    
    LAZY INSERT BEFORE
    --++^^hook|d     ==OR==
    --^^++hook|d

The order of insertion position versus lazy/greedy does not matter. If you designate something as both lazy AND greedy, lazy wins. If you designate something as inserting before AND after, before wins.

## Internal Functions

Text replacement games are fun, and all, but the real magic of the script is in the library of internal functions you can run. The core library has functions that let you access game components through the chat command line, retrieving data and formatting it as you necessary (and you can add to these functions easily, if you have a need to fill -- more on that later). The functions are fed through a  [recursive process](https://app.roll20.net/forum/post/8963630/recursive-descent-parser-here-goes-nothing-aka-there-and-back-again-a-coders-journey) that detects functions in our library, processes them out to text, and passes them either to a wrapping function (if we are in a recursion) or to the hook (once all internal functions have been resolved). For instance, getsections is a function that will return the repeating sections for a character provided you supply a valid character identifier (name, id, or token_id):

    !ia --whisper --show#getsections{{!!c#Heretic !!d#`, `}}  
    // returns: senses, moves, powers, skills

...but if you wanted to be able to call the same line from several places, or you wanted to give it to one of your players so they could use it without having to edit it, you could instead write the line with the getme function in place of your character's name:

    !ia --whisper --show#getsections{{!!c#getme{{}} !!d#`, `}}  
    // returns: senses, moves, powers, skills

#### Function Syntax

Functions are recognized by their name and then double open-curly brackets that enclose any arguments to the function, followed by double closing curly brackets. Arguments are denoted using double exclamation marks, followed by the argument key, a hash, and then the argument value. Arguments that do not receive a value are assigned the boolean value 'true'. Certain arguments take special syntax for their values. This syntax can be found in the help for each function.

#### Function Help

The easiest way to access the help is to type !ia into the chat to get the IA Config screen. The screen will list all of the functions you have installed and available to you. Each will have a help button if the author has included such information (all of the functions in the core library come with help). You will also see on the IA Config screen the option to make a help handout, which is a document of the same information InsertArg will create in your game if you want it to. This can be a helpful resource to have open while you put together your InsertArg calls.

#### Function Logging

Also on the IA Config screen, you'll see the option to turn logging on or off. The recursive descent parsing engine built into IA is setup to output what every function is receiving and handing off along the way, writing this information to your log. This can be a helpful tool if your command line is not producing the result you think it should. By examining what each function handed off to the next, you can see where in the chain you might have an error.

## Function Example: Nesting Roll Templates

Let's say that for my character, Heretic (Hero System 6E), I wanted to build a query of nicely formatted stat choices that trigger the roll template if I select that stat. The character sheet I'm using has various attributes for these stats, but the ones I'm interested in are named str_roll_formula, dex_roll_formula, con_roll_formula, etc. Each one has a roll template that looks like:

    &{template:hero6template} {{charname=@{character_name}}} {{action=Strength Roll}} {{roll=[[3d6]]}} {{target=12}}

Those characters can break a query, and replacing them can be a pain. You obviously can't store the attribute values for these roll formulas with their characters replaced. But we can use InsertArg to give us the text we need:

    !ia --load --show#getattrs{{!!c#getme{{}} !!op#q !!f#x !!p#Select Stat !!frmt#fr#_roll_formula#``|uc !!efrmt#rslv#character_name#Heretic|n}}

Here we are loading (into our default ability, InsertArg), the result of a getattrs{{}} function call. It is going to output (op) a query (q), using the prompt (p) 'Select Stat.' I derive my list of attributes to include by filtering (f) on executable (x). (These are my only executable stats for this character sheet, but if there had been others I could have further filtered the list.) Since I didn't want to see choices of 'str_roll_formula' and 'dex_roll_formula' in the query, I perform a format (frmt) to do a find/replace (fr), looking for '_roll_formula' and replacing it with nothing (``). In the same format argument, I tell it to be uppercase (uc). Finally, I format the executable side (efrmt) to resolve (rslv) any instances of @{character_name} with Heretic. (Resolve is a special find replace that wraps what you give it it @{} before searching. Last, in that same efrmt argument I tell it to nest (n) the executable string, performing the html entity replacement. The end result is...

    ?{Select Stat|
    STR,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Strength Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=12&#125;&#125;|
    DEX,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Dexterity Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=13&#125;&#125;|
    CON,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Constitution Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=12&#125;&#125;|
    INT,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Intelligence Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=13&#125;&#125;|
    PERCEPTION,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Perception Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=13&#125;&#125; {{base=9&#125;&#125; {{stat=4&#125;&#125;|
    EGO,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Ego Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=14&#125;&#125;|
    PRE,&{template:hero6template&#125; {{charname=Heretic&#125;&#125; {{action=Presence Roll&#125;&#125; {{roll=[[3d6]]&#125;&#125; {{target=11&#125;&#125;}

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/nested%20stat%20query%20output.png)![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/strength%20roll%20worked.png)

## Menus (more Function Examples)

Let's build a menu using the functions available to us and the mapArg menu. Menus can be added to the InsertArg engine (more on that in subsequent posts talking about how to code and expand InsertArg), but it ships with just one: the default menu. The default menu gives you an option for a title, a color, a fade value for an alternate color (not fully implemented yet) and a single hook named 'row.' It also comes with two row elements to choose from (row and elem), which you'll see in a moment. Menus can have any number of possible row types to choose from, so it's up to the menu author to communicate to you your options.

When using a menu, your mapArg value is in the form of:

    --menu#name|color|fade

If nothing is specified for these three options, the default menu (and its default options) will be loaded.

Here are a couple of options for how to construct the menu. This first option (for the same character, Heretic), uses only row types of 'row' (no elem):

    !ia
    --menu
    --title#getme{{!!r#n}}
    --^^row#getrow{{!!t#STATS !!c#ffffff !!s#getattrs{{!!c#getme{{}} !!op#b !!f#f^#_roll_formula !!frmt#fr#_roll_formula#``|fr#ception#``|uc}}}}
    --^^row#getrow{{!!t#SKILLS !!f#.7 !!s#getrepeating{{!!c#getme{{}} !!s#skills !!sfxn#skill_name !!sfxa#skill_roll_formula !!op#b !!f#x}}}}
    --row#getrow{{!!t#POWERS !!c#ffffff !!s#getabils{{!!c#getme{{}} !!op#b !!f#^f#WayOf !!frmt#fr#WayOfThe#``|fr#WayOf#``}}}}

I'll try to expand this write up later for what the script is doing (and why), but it's 1am, so I'll just give you the output:

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/menu2.png)  

  

Note the middle row (SKILLS). I didn't like the way the buttons look rather hodge-podge in this section, so I decided to try with a row type of elem. Elem output is intended for exterior labels with consistent button text. Here is the call, slightly changed:

    !ia  
    --menu  
    --title#getme{{!!r#n}}  
    --^^row#getrow{{!!t#STATS !!c#ffffff !!s#getattrs{{!!c#getme{{}} !!op#b !!f#f^#_roll_formula !!frmt#fr#_roll_formula#``|fr#ception#``|uc}}}}  
    --^^row#getrow{{!!t#SKILLS !!f#.7 !!s#getrow{{!!r#elem !!t#SKILLS !!f#.7 !!s#getrepeating{{!!c#getme{{}} !!s#skills !!sfxn#skill_name !!sfxa#skill_roll_formula !!op#be !!rlbl#Roll !!f#x}}}}}}  
    --row#getrow{{!!t#POWERS !!c#ffffff !!s#getabils{{!!c#getme{{}} !!op#b !!f#^f#WayOf !!frmt#fr#WayOfThe#``|fr#WayOf#``}}}}

And, again, the output...

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/menu1.png)  

If you like the look of my buttons and don't want the Roll20 defaults, here is the config options I have setup:

    --bg#993333  
    --css#margin:2px 0px;height:10px;line-height:10px;background-image:radial-gradient(#f84545 , #aa0000 ); box-shadow:5px 5px 10px #888888; min-width:25px; border-radius: 6px; padding: 6px 8px; font-family:Arial, Calibri, Consolas, cursive;text-align:center;

Run !ia, tell it to make your config file, then open the handout and paste those lines in over the two options that default to being there.

#### Thanks

A big thanks to Aaron, who first suggested the recursive descent parser as the way to solve the concept I was trying to build, and who has been more than generous with his time and knowledge as I inevitably ran into problems in a script this massive!

**EDIT**: Adding XRAY examples

# XRAY (Helper Script)

Xray is a helper script that can tell you a good bit of knowledge about a character sheet, whether for the purposes of building a call to InsertArg, examining a sheet to help you with another script, or just looking up information in game without having to flip over to your character sheet.

Note that Xray requires InsertArg, but InsertArg runs just fine without Xray. However, for certain calls to InsertArg, a bit of knowledge about your character sheet is necessary. For instance, the way repeating sections are constructed (a group of related sub attributes sharing a common id in the middle of their names) requires you to know the sub attribute that provides the name for the element in the repeating section (i.e., the "Magic Missile" spell in your repeating section for spells), and which one provides the value or action/execution text.

The good news is that compared to InsertArg, Xray couldn't be easier to run. Although there are a few constructions that can get you where you want to be immediately, 99% of the time that you would use Xray you'd just start from the top and enter into chat:

    !xray

That's it. That will show you buttons for each of the characters you can control.

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/xray%20base%20call.png)  

Click on a button to continue drilling down on that particular character. Here I'll click on Heretic...

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/xraysheet.png)

...to see a button for Abilities, Attributes, and every repeating section Heretic has an entry for (this samples sections for which the character has an entry, not every section available from the sheet, so certain characters may have more/less sections). Clicking on a button lets you continue to drill down on that section. For Abilities and Attributes, the default number of items to show in a single chat output is 25, and they will be alphabetized. You'll have Next and/or Previous buttons where appropriate to continue stepping through that section.

For the repeating section, the output you will be presented with will be the view of all of the sub-attributes for an element in that section. You'll be asked for what entry to show (a number between 0 and 1 less than the number of elements in that section for that character). Don't worry if you enter one out of scope, you'll be informed what the highest value is. Your output will then look like this:

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/xrayrepeating.png)

...you'll see a Next/Previous button as necessary, letting you walk through the entries in this repeating section. The first column is the suffix of the sub attribute (the full name will be more like repeating_powers_-Mssfn220_sjafdipsf0_power_name). You may also see a series of buttons for a given sub-attribute in this section, as you do for the sub attributes 'use_power_formula' and 'use_power2_formula'. These buttons indicate that the value of the sub attribute was detected to be executable. You can choose to View the text (maybe you want to know what it says to make sure it is the field you're looking for, or you want to know how to hook a replacement for an InsertArg call). You can choose to Exec(ute) the attribute and send it to chat, letting you confirm how it outputs. The last button, Build, will take a cross-sample of the repeating section with the associated sub-attribute as the action/executing script. Meaning, if I click on the Build button for use_power2_formula, I will get an output of buttons for all of the elements in this section (the "powers" section), and for each of them the value sent to chat will be their individual use_power2_formula.

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/repeating%20cross%20section%20(build).png)

In this way, you can identify the naming sub attribute and the action sub-attribute for a call to getrepeating... as that requires sfxn (naming suffix) and sfxa (action suffix) arguments.

For abilities and attributes (simple) output, the "Build" button is replaced with two buttons. "Starts" will give you a filtered list of the attributes/abilities that share the first 5 letters of the name of the associated attribute/ability. "Ends" will filter the list where the attribute/ability matches the last 5 characters.

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/InsertArg/Images/abilities%20starts%20with.png)

If you up-arrow in the chat, you can see that the call producing that output is a call to InsertArg, in this case:

    !ia --whisper --show#msgbox{{!!c#The following abilities were found matching the first 5 characters of the chosen ability. This list can be further refined. !!t#ELEMENTS !!btn#getabils{{!!c#-M4jpPEy0ScLWE54K2gM !!op#b !!f#^f#`WayOf`}} !!send#true !!wto#Heretic}}

...which is a whole lot because the juicy bit is nested in a msgbox function, but if you look in there, the button (btn) argument of the msgbox is:

    getabils{{!!c#-M4jpPEy0ScLWE54K2gM !!op#b !!f#^f#`WayOf`}}

...which is, itself, a discrete function call you can use elsewhere. A common workflow I use is to construct the call to a function and drop it in a chat to myself until I have it right, then insert it where it goes in a larger call. Here, I'll drop the getabils call into a simple line just to see the output:

    !ia --whisper --show#getabils{{!!c#-M4jpPEy0ScLWE54K2gM !!op#b !!f#^f#`WayOf`}}

That would give me just the buttons, without the bounding message box. You can reuse that elsewhere (say, in menu calls). In fact, if I get the chance, I'll expand this message again, later, talking through the workflow of how to build up a call and tweak it into just what you need.

# Changelog

### InsertArg

**v1.5.1** - fixed problem of breaking the sandbox using "load" to drop the command line into an ability that did not yet exist

**[v1.5](https://app.roll20.net/forum/permalink/9163217/)**  - allowed for full width sub-attributes in card output, corrected creating global handout process

**[v1.4](https://app.roll20.net/forum/permalink/9147004/)**  - added card output to getrepeating, as well as a list (l) argument

**v1.31**  - added the ability to use tick marks to denote an empty row title for menu output

**[v1.3](https://app.roll20.net/forum/permalink/9136635/)**  - fixed problem from 1.2 consolidation, added buttons to read-to-chat, protected internal calls to IA within the parser

**[v1.2](https://app.roll20.net/forum/permalink/9123367/)**  - consolidated filter, format and output options to main script to make them available to third party scripts

**v1.11** - fixed typos

**v1.1**  - minor bug fixes and code enhancements invisible to user

### IA Core Library

**v1.5.1** - fixed output (op) as buttons in element rows of table (be); previously these had defaulted to attributes even if you sent abilities

**v1.5** - added 'emptyok' argument to getrepeating, getattrs, and getabils (suppresses 'no object found' message)

**v1.4**  - added list (l) argument to getrepeating, as well as card output options

**v1.3**  - bug fix, implemented protected calls to IA for reading buttons (allowing nested functions bearing future api calls)

**v1.2** - moved filter, format, and output options to main script, exposed version number for reporting on the IA config menu

**v1.1**  - added 'lve' option to output argument, giving label-value output to elem rows in a menu; added 'ef' argument to getattrs, getabils, and getrepeating to allow filtering on the action/exec text (follows the same patterns as the filter argument (f)); added 'sfxrlbl' to getrepeating as an option to provide a unique roll label for buttons produced for elem output to a menu

### Xray

**v1.2**  - changed the ordering of a repeating section to match the order on the sheet (previously it had shown elements in creation order); also added fuller name information in header (repeating_section_rowID), as well as a position (your place in the set of rows in that repeating section); also added a button to get info about a given sub-attribute, including the full name with rowID, the full name using $0 (sheet position) nomenclature, and the individual ID of the sheet object.  

**v1.11**  - fixed bug where xraysheet wasn't getting the config object

**v1.1**  - fixed- character name now at the top of all xray walks




