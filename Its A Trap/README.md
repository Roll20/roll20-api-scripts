# It's A Trap!

###### Required Scripts
* [Token Collisions](https://github.com/Roll20/roll20-api-scripts/tree/master/Token%20Collisions)
* [Vector Math](https://github.com/Roll20/roll20-api-scripts/tree/master/Vector%20Math)

###### Updates
'''2.1'''
* Refactored code.
* ItsATrap now exposes an API for its functions.
* Customizable trap messages via GM notes.

This is a script that allows GMs to quickly and very easily set up traps on
the GM layer, and detect when tokens on the objects layer move over them. This
trap detection even works for tokens moving by waypoints.

### Creating traps:

Place the token for your trap on the ```GM layer```. Give it the ```cobweb``` <img src="http://game-icons.net/icons/lorc/originals/png/cobweb.png" width="32"> status marker.

<br/><br/>
By default, traps will only affect characters on the ground (ones that don't
have a ```wing``` <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or ```angel``` <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker). To have a trap also affect flying
characters, give it the ```wing``` <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or ```angel``` <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker.

<br/><br/>
By default, trap tokens won't appear when they are activated. If you would
like the trap to become visible to the players when it is activated, give it
the ```bleeding eye``` <img src="http://game-icons.net/icons/lorc/originals/png/bleeding-eye.png" width="32"> status marker. When the trap is activated, it will be moved to the ```Objects layer```.

### Customizing trap messages:

By default, when a character activates a trap, it will just display a
generic message that the character activated the trap.

You can specify a custom message, which can include inline
rolls, in the GM notes for the trap. Admiral Ackbar will still dramatically
announce it.

### Activating traps:

If a token moves across a trap at ANY point during its movement, the trap will
be activated!
