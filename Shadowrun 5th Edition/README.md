Shadowrun 5th Edition API
=======================

API helper to be used with the Shadowrun 5th Edition character sheet. To access the menu type !sr5 in the chat.


## Group Initiative

Roll initiative for all the selected tokens and add it to the token tracker.

![Roll Group Initiative](https://github.com/clevett/roll20-api-scripts/blob/shadowrunv1/Shadowrun%205th%20Edition/imgs/groupinit.png?raw=true)

### Command

!sr5 --rollInit

### Functionality

* Host, vehicle, sprites, and tokens with matrix status marker will roll Matrix Initiative.
* Characters with astral marker will roll Astral Initiative.
* All other tokens will roll meat space Initiative

### Requirements

* Selected tokens must represent a character sheet.
* Custom token markers named 'astral' & 'matrix' toggles

### [Token Markers](https://github.com/clevett/roll20-api-scripts/blob/shadowrunv1/Shadowrun%205th%20Edition/README.md#token-markers-2)

Upload a custom token marker named matrix and astral. Two are included in the GitHub for this script.

![Token Markers](https://github.com/clevett/roll20-api-scripts/blob/shadowrunv1/Shadowrun%205th%20Edition/imgs/groupinitIcons.png?raw=true)

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

![Turn Order arrow](https://github.com/clevett/roll20-api-scripts/blob/shadowrunv1/Shadowrun%205th%20Edition/imgs/counterarrow.png?raw=true)

## Link Tokens

Setup a number of defaults on a token. Character sheets set to PC will link their stun & physical. Others sheets will only input the values but not link the attributes to the character sheet.

### Command

!sr5 --linkToken

### Functionality

* Populate bar 1 for PC & grunts with stun
* Populate bar 2 for vehicle, hosts, sprites, and PC or grunts with 'matrix' token marker with matrix
* Populate bar 3 for PC, grunt, and vehicles with physical
* Populate name with character_name
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

![Represent Tokens](https://github.com/clevett/roll20-api-scripts/blob/shadowrunv1/Shadowrun%205th%20Edition/imgs/linkerrepcharacter.png?raw=true
)

### [Token Markers](https://github.com/clevett/roll20-api-scripts/blob/shadowrunv1/Shadowrun%205th%20Edition/README.md#token-markers-2)

Upload a custom token marker named matrix. One is included in the GitHub for this script.

---

## Token Markers

Upload a custom token marker named [matrix](https://raw.githubusercontent.com/clevett/roll20-api-scripts/shadowrunv1/Shadowrun%205th%20Edition/matrix.png) and [astral](https://raw.githubusercontent.com/clevett/roll20-api-scripts/shadowrunv1/Shadowrun%205th%20Edition/astral.png). Two are included in this GitHub for this script.

![Token Markers](https://raw.githubusercontent.com/clevett/roll20-api-scripts/shadowrunv1/Shadowrun%205th%20Edition/imgs/groupiniTokenMarkers.png)
