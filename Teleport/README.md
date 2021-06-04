# Teleport

This script provides a way for GMs or players to teleport tokens within a page or between pages.

## Installation

On installation, a note (*Teleport API*) is created, and help text appears in chat, both of which have buttons which activate the main menu. The note persists, and will not be re-created unless you remove the note, so you can always find and activate the menu button. You can also type ```!teleport --menu``` into chat. 

## Beginning Setup

To set up a teleport pad token, drag a token to the objects layer and then click on the chat button to "Create Teleport Pad" on the main menu. 

* You will be prompted with a naming box, name your teleport pad whatever you like. You can rename it later from the interface. This is for you to read, and is not used by the API to find portal pads, so don't worry about renaming it at any time. 
* The token will be automatically moved to the GM layer and set up with its initializing properties.

Once you do this, the chat menu will pop up a list of teleport pads it detects on the page the **GM** is on currently. You can now use the teleport button on the chat (the emoji button that looks like sparkles, and gives you a tooltip of "teleport token" on mouseover) for that teleport pad to teleport a selected token to this teleport pad. 

To set up auto-teleporting (players able to interact with one teleport pad that automatically moves them to another teleport pad), you need to **link** the first teleport pad you created to a second teleport pad. 

* Create a second teleport pad as you did the first one. 
* Now, go to the gmlayer and select both teleport pads. 
* On the teleport pad list, click the "link" button on either pad. Teleport is smart enough not to link a portal to itself, so it will add the **other** portal to the portal linking button you pressed, and it should list it this way (show the name of the linked portal in its "linked to" label).
* If you want the portals to link to each-other and be a two-way teleport, repeat this for the second portal, so each shows "linked" to the other teleport pad.

Now, on the objects layer, test this by dragging any token over one of the teleport pads. These pads are invisible to your players, so if you want them to find them it is good practice to put a visible marker of the teleport pad on the map layer. You should see the token move to the gm layer, move to the other teleport pad location, and re-appear on the token layer.

## Cross-Page Teleport

To set up cross-page teleport, you must create teleport tokens on each page you want to link by way of teleport, and then use the Global Teleport Pad List to link them, similar to how you did in the **Beginning Setup**. You also must make sure that player tokens for each player you want to teleport exist in the target pages. Preferably, they should be on the GM layer. If you don't have player tokens on the target page, the teleport or auto-teleport will fail. Currently, the API has trouble with creating tokens on target pages (specifically to do with images from the Roll20 Marketplace), so **Teleport** doesn't try and make a player token on the target page at this point.

## Some warnings:

* Linking two pads, then copying one to another page will not work: teleport pads are linked by their unique IDs, and pasting a teleport pad to another page creates a new token with a new ID. It will keep links it has to **other teleport pads** but any links ***to*** it will be broken and will have to be re-set.
* Cross-page teleport tries to spawn a specific page ribbon, and this will happen even if a player is not online - so teleporting player tokens to other pages when they are not online may have unforseen consequences. This is still being tested, and if out of synch can be "fixed" when all players are back online. 

## Creating API buttons from Teleport buttons

Any activation of a button in chat will leave a record of what the command was - so you can press the up-arrow in chat to see the command that was passed to activate teleport.js. All commands are prefixed by !teleport and contain an attribute prefixed by two dashes to direct the command.
