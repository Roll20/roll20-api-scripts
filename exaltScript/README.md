# exaltScript

exaltScript's function is to automate many tedious aspects of Exalted 3rd edition, especially when it comes to combat. 
It's a kind of general use script for anything Exalted 3e related, where you can pick and choose what functions you want to use.

## Features

### exaltScript can do the following rad stuff:

* Keep better track of initiative by automatically adding an "End Turn" custom initiative token into the Turn Order when opening the Turn Order
* Automatically add motes to all characters in the turn order at the end of a round
* Sort the turn order when the round has ended
* Automatically remove Onslaught markers (Purple status marker) from tokens when their turn rolls around
* Automatically increase token Anima if 5 or more Peripheral Motes are spent in one instance 
(This can be disabled for individual tokens by adding the "ninja-mask" status marker on it.)
* Quickly add five motes or fill all mote pools to capacity with the use of chat commands (Detailed below) 
* Quickly clear Onslaught and Anima status from all tokens on the current player page.

### exaltScript can **NOT** do the following rad stuff:

* Automatically **ADD** Onslaught markers to tokens that have been attacked
* Teach you how to overcome your inner demons, and attain inner peace.
* Grant you infinite riches, and true happiness 

## Chat Commands

* !exaltScript : Main command preamble
* UI : Displays the exaltScript UI to the user. I HIGHLY recommend you make a macro for this command.
* !exaltScript addMotes : Adds 5 motes to every character on player page with mote pools (i.e. the ones that have the "personal-essence" and "peripheral-essence" attributes)
* !exaltScript maxMotes : Fills all mote pools to capacity on the page that the players are on the current page.
* !exaltScript customMotes X: Lets you specify a number of motes to give to the tokens on the current player board. Switch out X for a valid integer.
* !exaltScript settings : Allows you to toggle the followed setting,
	* initiative : Toggles initiative functions, such as automatic sorting, onslaught removal and automatic mote increase
	* anima : Toggles automatic anima increase on removing motes  
	* notifications: Toggles the command notifications display.
* !exaltScript clear : Clears the followed status from all tokens on the current player page.
	* onslaught : Clears onslaught status
	* anima : Clears anima status

As a sidenote, these chat commands are by default restricted to GM only, and can only be changed by modifying the variable "gmOnly" in the code.