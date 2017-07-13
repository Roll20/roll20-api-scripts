# exaltScript

exaltScript is the first Roll20 API script that I made from scratch. Its main function is to automate many tedious aspects of Exalted 3rd edition, especially when it comes to combat. 
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

### exaltScript can **NOT** do the following rad stuff:

* Automatically **ADD** Onslaught markers to tokens that have been attacked
* Teach you how to overcome your inner demons, and attain inner peace.
* Grant you infinite riches, and true happiness 

## Chat Commands

* !exaltScript : Main command preamble
* addMotes : Adds 5 motes to every character on player page with mote pools (i.e. the ones that have the "personal-essence" and "peripheral-essence" attributes)
* maxMotes : Fills all mote pools to capacity on the page that the players are on the current page.
* initiativeToggle : Toggles initiative functions, such as automatic sorting, onslaught removal and automatic mote increase
* animaToggle : Toggles automatic anima increase on removing motes  

As a sidenote, these chat commands are restricted to GM only. I highly recommend running this "toolbox" macro for ease of use. 

`/w gm &{template:default}{{name=exaltScript}}{{Add Motes=[5 motes](!exaltScript addMotes) [Max Motes](!exaltScript maxMotes)}}{{Toggle Functions=[Initiative](!exaltScript initiativeToggle) [Anima](!exaltScript animaToggle)}}`

## Known issues

Adding several tokens at the same time to the initiative tracker, where one or more are not represented by characters, **WILL** crash the script and require a reload.