Shadowrun 5th Edition API
=======================

API helper to be used with the Shadowrun 5th Edition character sheet. To access the menu type !sr5 in the chat.


## Group Initiative

Roll initiative for all the selected tokens and add it to the token tracker.

### Command

!sr5 --rollInit

### Functionality

* Host, Vehicle, Sprites, and tokens with matrix status marker will roll Matrix Initiative.
* Characters with astral marker will roll Astral Initiative.
* All other tokens will roll meat space initiative

### Requirements

* Selected tokens must represent a character sheet.
* Custom token markers named 'astral' & 'matrix' toggles

### Token Markers

Upload a custom token marker named matrix and astral. Two are included in the GitHub for this script.


## Initiative Counter

Adds a initiative turn to the Turn Order that will count up the Combat Rounds and Initiative Passes. Every time this custom entry gets to the top of a round it will reduce initiative by 10 and remove any entries that are less than 1. If it is the only entry in the Turn Order it will increase the round counter.

### Command

!sr5 --initCounter

### Functionality

* Adds Combat Round & Initiative Pass, Round / Pass, entry to the initiative Turn Order
* When Round / Pass reaches the top of the Turn Order it reduces initiative by 10
* When Turn Order entries get below 1 they are remove from the Turn Order
* When Round / Pass reaches the top of the Turn Order if there are still entries in the Turn Order it increase the Initiative Pass counter
* When Round / Pass reaches the top of the Turn Order if Round / Pass is the only entry it increase the Combat Round counter
* When Round counter increases, a chat output announces the new round

### Requirements

* Add Initiative Counter before rolling initiative to avoid it triggering immedately.
* Use arrow at the bottom of Turn Order cycle through turns


## Link Tokens

Setup a number of defaults on a token. Character sheets set to PC will link their stun & physical. Others sheets will only input the values but not link the attributes to the character sheet.

### Command

!sr5 --linkToken

### Functionality

* Populate bar 1 for PC & grunts with stun.
* Populate bar 2 for Vehicle, Hosts, Sprites, and PC or Grunts with 'matrix' token marker with matrix.
* Populate bar 3 for PC, grunt, and vehicles with physical.
* Populate name with character_name.
* Link bar 1 with stun if PC
* Link bar 2 with matrix if 'matrix' token marker is on token
* Link bar 3 with physical if PC
* Toggle on show name
* Toggle on show players bar 1
* Toggle on show players bar 2
* Toggle on show players bar 3
* Set default token on the character sheet


### Requirements

* Select tokens, recommend doing < 10 at a time to avoid timing out API
* Selected tokens must represent a character sheet.

### Token Markers

Upload a custom token marker named matrix. One is included in the GitHub for this script.