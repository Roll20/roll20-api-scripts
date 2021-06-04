# Supernotes
*This was about 25% written by keithcurtis, adapted from code written by the Aaron.*

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

*--image[number]* Pulls indexed image from the bio field of the character assigned to a token, if any exist. *--image1* will pull the first image, *--image2* the second and so on. Otherwise returns first image if available. If no images are available, returns notice that no artwork is available.

*--notitle* This option suppresses the title in the chat output. It is useful for times when the GM might wish to show an image or note to the player without clueing them in wha the note is about. For instance, they may wish to reveal an image of a monster without revealing its name. This parameter can be added to any command. It is the only paramater for which this is true. Example *!pcnote --image --notitle* wil pull the first of any images from the token's associate character sheet and send it to the chat without a title. *--notitle* may be added to the command in any order.

*--id* supply this with a token id, and the script will attempt to read the notes associated with a specific token, or the character associate with that token. There is no space between --id and the token id. Only one token id may be passed.

*--help* Displays help.

*--config* Returns a configuration dialog box that allows you to set which sheet's roll template to use, and to toggle the 'Send to Players' footer.


## Configuration

When first installed, Supernotes is configured for the default roll template. It will display a config dialog box at startup that will allow you to choose a roll template based on your character sheet of choice, as well as the option  to toggle whether you want the 'Send to Players' footer button to appear. The footer will appear on a !selfnote whisper, so that the message can be shared with other players if desired.

You will need to edit the code of the script if you wish to create a custom configuration, or contact keithcurtis on the Roll20 forum and request an addition. The pre-installed sheets are:

Default Template, D&D 5th Edition by Roll20, 5e Shaped, Pathfinder by Roll20, Pathfinder Community, Pathfinder 2e by Roll20, Starfinder

## Changelog

0.0.7 Fixed bug where token notes would break on accented characters

0.0.9 Added --notitle

0.0.91 added --id
