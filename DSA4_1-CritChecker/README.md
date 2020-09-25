Description
===========
This Script is a helper for users of the "Das Schwarze Auge 4.1" Character Sheet.
In the character sheet there is no possibility to tell if a talent, liturgy or spell roll was a critical fumble or success. This script analyzes roll of these types and writes a chat message
if the roll was a critical success or failure. Also it points out if the roll was a success even if the TaP* are negative (through to 2 1s at the start of the roll) and the same for failures with positive TaP*.
The chat message send by the script is only send to the GM if the original send was a gm roll. If not it is send to all players in the game.

This script is save to use as it doesn't use manipulating APIs. 