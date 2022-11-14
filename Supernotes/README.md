# Supernotes
*by keithcurtis, based on original code written by the Aaron.*

This script pulls the contents from a token's GM Notes field and sends them to chat, based on a user-selectable roll template. If the token represents a character, you can optionally pull in the Bio or GM notes from the character. Options also exist to pull in images referenced by the token or its associated character. The user can decide whether to whisper the notes to the GM or broadcast them to all players. Finally, there is the option to add a footer to notes whispered to the GM. This footer creates a chat button to give the option of sending the notes on to the players.

This script as written is optimized for the D&D 5th Edition by Roll20 sheet, but can be adapted easily suing the Configuration section below.


## Commands:

**!gmnote** whispers the note to the GM

**!pcnote** sends the note to all players

**!selfnote** whispers the note to to the sender


## Paramaters

*--token* Pulls notes from the selected token's gm notes field. This is optional. If it is missing, the script assumes --token

*--charnote* Pulls notes from the gm notes field of the character assigned to a token.

*--bio* Pulls notes from the bio field of the character assigned to a token.

*--avatar* Pulls the image from the avatar field of the character assigned to a token.

*--image* Pulls first image from the bio field of the character assigned to a token, if any exists. Otherwise returns notice that no artwork is available

*--images* Pulls all images from the bio field of the character assigned to a token, if any exist. Otherwise returns notice that no artwork is available

*--tokenimage* Pulls the token image images from the token.

*--image[number]* Pulls indexed image from the bio field of the character assigned to a token, if any exist. *--image1* will pull the first image, *--image2* the second and so on. Otherwise returns first image if available. If no images are available, returns notice that no artwork is available.

*--notitle* This option suppresses the title in the chat output. It is useful for times when the GM might wish to show an image or note to the player without clueing them in wha the note is about. For instance, they may wish to reveal an image of a monster without revealing its name. This parameter can be added to any command. It is the only paramater for which this is true. Example *!pcnote --image --notitle* wil pull the first of any images from the token's associate character sheet and send it to the chat without a title. *--notitle* may be added to the command in any order.

*--id* supply this with a token id, and the script will attempt to read the notes associated with a specific token, or the character associate with that token. There is no space between --id and the token id. Only one token id may be passed.

*--handout|Handoutname|* If this is present in the arguments, the note will be sent to a handout instead of chat. This can allow a note to remain usable without scrolling through the chat. It can also be used as a sort of floating palette. Notes in handouts can be updated. Running the macro again will regenerate the note. The string in between pipes will be used as the name of the note handout. If no handout by that name exists, Supernotes will create one and post a link in chat to open it. The title must be placed between two pipes. *handout|My Handout|* will work. *handout|My Handout* will fail. A note handout automatically creates a horizontal rule at the top of the handout. Anything typed manually above that rule will be persistent. Supernotes will not overwrite this portion. You can use this area to create Journal Command Buttons to generate new notes or to give some context to the existing note. All updates are live.

*--template[templatename]* Instead of using the configured sheet roll template, you can choose from between more than 10 custom templates that cover most common genres. Add the template command directly after the main prompt, followed by any of the regular parameters above. The current choices are:

- **generic.** Just the facts, ma'am. Nothing fancy here.

- **dark.** As above, but in reverse.

- **crt.** Retro greenscreen for hacking and cyberpunk. Or for reports on that xenomorph hiding on your ship.

- **notebook.** You know, for kids. Who like to ride bikes. Maybe they attend a school and fight vampires or rescue lost extraterrestrials

- **gothic.** Classic noire horror for contending with Universal monsters or maybe contending with elder gods.

- **apoc.** Messages scrawled on a wall. Crumbling and ancient, like the world that was.

- **scroll.** High fantasy. Or low fantasy—we don't judge.

- **lcars.** For opening hailing frequencies and to boldly split infinitives that no one has split before!

- **faraway.** No animated title crawl, but still has that space wizard feel.

- **steam.** Gears and brass have changed my life.

- **western.** Return with us now to those thrilling days of yesteryear!

*--help* Displays help.

*--config* Returns a configuration dialog box that allows you to set which sheet's roll template to use, and to toggle the 'Send to Players' footer.


## Configuration

When first installed, Supernotes is configured for the default roll template. It will display a config dialog box at startup that will allow you to choose a roll template based on your character sheet of choice, as well as the option  to toggle whether you want the 'Send to Players' footer button to appear. The footer will appear on a !selfnote whisper, so that the message can be shared with other players if desired.

You will need to edit the code of the script if you wish to create a custom configuration, or contact keithcurtis on the Roll20 forum and request an addition. The pre-installed sheets are:

Default Template, D&D 5th Edition by Roll20, 5e Shaped, Pathfinder by Roll20, Pathfinder Community, Pathfinder 2e by Roll20, Starfinder, Call of Cthulhu 7th Edition by Roll20

## Changelog

- 0.0.7 Fixed bug where token notes would break on accented characters
- 0.0.9 Added `--notitle`
- 0.0.91 added `--id`
- 1.1.0 added  Improved Pathfinder template usage
- 1.1.1 added `--tokenimage`, updated semantic versioning
- 1.1.2 Added Handout Feature
- 1.1.3 Added support for Call of Cthulhu 7th Edition by Roll20
- 1.1.4 Added better coordination with Reporter. Handouts can now support a Reporter report and display the desired notes in the same handout.
- 0.2.0 Added custom templates, and configured base script to return in-line text links instead of Roll20 Big Pink Buttons.
