# DiscreteWhisper
## Concept

**Abstract**: DiscreteWhisper is a way to send a single whispered message to multiple recipients while simultaneously giving groups of recipients more or less of that message. Buttons (referencing api script command lines, character abilities, or macros) can also be included, and can also be limited to some/all of the recipients.

**Example Use Case**: Larry, Moe, and Curly failed to detect an illusion trap and now need to make a perception check. Larry was the most affected by the trap's illusion spell. The GM wants to send a whispered message to all while giving a slightly altered version to Larry. Moe and Curly should receive the message: "There are five jewels on the table. You find it hard to focus on them." At the same time, Larry should receive the message: "There are five jewels on the table. A small child holds a sixth jewel near the far wall." The player who is playing Larry should not know that s/he has received a different message from the other characters. The GM would enter:

_!w --Larry|Curly|Moe --There are five jewels on the table. {{aside|Moe|Curly}}You find it hard to focus on them.{{aside|Larry}}A small child holds a sixth jewel near the far wall._

## Command Line and Syntax

The following represent the designations of the various parts of a DiscreteWhisper command line:

    !apihandle --characters --message --title (optional) --buttons (optional, requires a title argument)

### API Handle

Out of the box, the DiscreteWhisper script will answer to any of the following handles:  

    !w  
    !discrete  
    !discretewhisper

I say "out of the box" because there is a way to alter what handles the script will listen for (see the section, below, "Altering the API Handles").

### Characters

Include a pipe-separated list of Character identifiers (name, ID, or token-id representing a character) that will comprise the list of characters receiving a whispered message. This list represents the characters receiving anything designated to go to "all" characters. The designation "GM" (any case) can be used to include the GM in the list of recipients.

    --Larry|Moe|Curly

Any character can be pre-pended with an  **{{as}}**  to designate that you wish to whisper as that character. Designating the character as the source of the whisper in this fashion overrides the inclusion of the character as a recipient, so if for some reason you wish to both whisper AS a character and you wish to have that character also receive a whisper, you must include the character twice in the list: once prepended with  **{{as}}**, and once straight.

    --{{as}}Larry|Moe|Curly

...would have Moe and Curly receiving a message from Larry.

If no  **{{as}}**  designation is made, the script uses the chat speaker who entered the API command.

### Message

The message of a whisper can be just straight text. It begins defaulted to be a whisper to all recipients listed in the Characters argument. Asides to characters can be handled with either of the following text patterns inserted into your message:

    {{aside}}  
    {{Aside}}

The difference being that the lowercase 'a' version does not announce that the character is receiving an aside, while the uppercase 'A' version does announce it.

Each of these formations also take list of pipe-separated characters (much like the Characters argument) of those characters who should receive this aside. Separate the list of characters from the 'aside' by use of a pipe:

    {{aside|Character1|Character2|...Charactern}}

To return from an aside to all characters again receiving the next portion of the message, use the pattern:

    {{all}}

'All' does not take a list of characters.

### Title

If you wish to have a flat-text whisper (much like if you typed '/w gm This is the message' into the chat box), then skip this argument and the next. By including a Title argument, you instruct the script to use a "message box" formatted output instead of the flat-text output. For instance, this line:

    !w --{{as}}GM|Prism --You see something shiny on the floor. --PERCEPTION

Produces the following output for the character named Prism:
![enter image description here](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/DiscreteWhisper/Images/templated_output.png)
### Buttons

If you have included a Title (and are therefore using the templated "message box" style output), you can also feed an API button into the output. These can be in the form of:

Label|!apiscript (with any arguments as designated/required by the command line)  
Label|Character|Ability  
Label|Macro

Like the Message argument, buttons can be individually granted by use of the  **{{aside}}**,  **{{Aside}}**, or  **{{all}}**  markers. In fact, to separate multiple buttons to be received by all characters, you MUST separate each by use of  **{{all}}**, otherwise DiscreteWhisper will not know where to separate the buttons.

**Note**: Yes, this does produce a problem for including script command lines that, themselves, make use of the  **{{all}}**  syntax. I am not aware of any (except DiscreteWhisper), though nesting a call to a DiscreteWhisper in the Button argument of another DiscreteWhisper call could trigger this issue. In those sort of cases, consider putting the nested language into a macro or ability and referencing that location as the source for the button, instead.

Here is an example of including a button:

    !w --{{as}}GM|Prism --You see something shiny on the floor. Do you pick it up? --PERCEPTION --Yes|!w --GM --Yes, I pick it up.

Prism receives:
![enter image description here](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/DiscreteWhisper/Images/button_output.png)
Clicking the button would send a flat-text whisper to the GM: Yes, I pick it up.

## Reporting Whispers and Undeliverable Messages

Because API generated whispers do not show in the sender's chat log, and because the output of the given messages are parsed together and potentially numerous, when DiscreteWhisper finishes sending all of the requested messages, it reports back to the sender with a "Delivered Whispers" digest. For the example immediately above, the sender would receive:
![enter image description here](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/DiscreteWhisper/Images/delivered_whispers.png)
Similarly, if the API cannot find a character listed in either the Character argument or an aside, DiscreteWhisper will deliver a second report announcing this to the sender:

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/DiscreteWhisper/Images/undeliverable_alert.png)

If there is no specific message included for the character, the character was included in the Characters argument and received none of the whisper intended for "all" characters. If the un-findable character had been included in an aside, the aside text would have been included to alert you what portion of the message went undelivered.
## Altering the API Handles  

This script includes a beta method to remap the API handles to which this script responds. As mentioned above, a GM might want to reserve this sort of whispering to themselves. Another need for this is that the DiscreteWhisper script parks itself on what might be a very desirable API handle: 'w'. Should there be another script that uses this handle and the developer of that script is unavailable or unwilling to change it, you can instruct DiscreteWhisper to no longer listen to API calls that begin with '!w'.

There are three command structures to handle this:

addapi  
remapi  
getapi

Invoke these utilizing an EXISTING API handle for the script, followed by a  **#**, followed by the above command. For  **addapi**  or  **remapi**, you must also include a pipe, followed by the API handle you wish to affect (or pipe-separated list of handles).

!w#addapi|CarelessWhisper

...would add the text 'CarelessWhisper' to the set of API handles this script would answer.

!CarelessWhisper#remapi|CarelessWhisper

...would remove the same API handle. Note, at that point, the above line would no longer be caught by this script (it wouldn't listen for the CarelessWhisper handle).

**Do not worry about removing your access to the script by virtue of disallowing all API handles.**  You  **cannot** remove the API handle for the overall project: DiscreteWhisper. This handle is explicitly included in addition to whatever other handles are available to the script. Also, DiscreteWhisper is the script-level object (js) that occupies that address in the global namespace -- meaning the only way to have a collision on this API handle is if someone else ALSO named a script/object "DiscreteWhisper" or manually told their script to catch that API handle. In either case, you've got larger issues, and I need to have a conversation with the other developer. =D

So, to say it again, you will ALWAYS have access to the script at the API handle of "DiscreteWhisper", even if you remove all other API handles available to you.

The last API Handle command is the getapi, which will give you a simple read-out of the handles to which this script will listen.

![](https://raw.githubusercontent.com/TimRohr22/Cauldron/master/DiscreteWhisper/Images/getapi.png)

## Features

**Attribute Buttons**  - You can now use an attribute as the source for a button (handy if it has a roll formula in it). To do that, prepend the attribute name with @:

label|character|**@**attribute_name

**Local Buttons**  - You can now use the 'local' keyword in place of a character to have the button rendered using the recipient character's sheet. This formation would look like:

label|**local**|ability_name  
label|**local**|@attribute_name

  

**_Example:_** The character sheet in use in the game has a designated "Perception" attribute (called 'perception_roll_formula'). When the party stumbles from a rainy night into a dimly lit tavern, the GM wants to ask 2 of the characters, Heron and Prism, for perception rolls. The GM sends this message:

!w --{{as}}GM|Heron|Prism --You think you see... something. --ROLL PERCEPTION --Perception|local|@perception_roll_formula

Both of those characters will receive a message like the below:

![](https://github.com/TimRohr22/Cauldron/blob/master/DiscreteWhisper/Images/local_button.png?raw=true)

The button will refer to that individual character's Perception attribute.

**_Example 2_**: In a game where the character sheet didn't have a pre-built Perception attribute, (like WoD), the GM made sure that every character had a "Perception" ability, instead. In that case, the syntax is nearly the same, using the ability 'Perception' (and without the '@' of an attribute:

!w --{{as}}GM|Heron|Prism --You think you see... something. --ROLL PERCEPTION --Perception|local|Perception

The result will appear the same as in the image, above, to the receiving characters, except that the button will trigger the Perception  **_ability_**  for that character.

## Button Formations (Recap)

As of this update, the following button formations are allowed (syntax):

    {{all / aside}}label|!script <<args>>
    {{all / aside}}label|local|ability  
    {{all / aside}}label|local|@attribute  
    {{all / aside}}label|character|ability  
    {{all / aside}}label|character|@attribute  
    {{all / aside}}label|macro

