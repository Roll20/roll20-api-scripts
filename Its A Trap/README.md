# It's A Trap!

###### Required Scripts
* [Token Collisions](https://github.com/Roll20/roll20-api-scripts/tree/master/Token%20Collisions)
* [Vector Math](https://github.com/Roll20/roll20-api-scripts/tree/master/Vector%20Math)

This is a script that allows GMs to quickly and very easily set up traps on
the GM layer, and detect when tokens on the objects layer move over them. This
trap detection even works for tokens moving by waypoints.

### Creating traps:

Place the token for your trap on the GM layer. Give it the cobweb status marker <img src="http://game-icons.net/icons/lorc/originals/png/cobweb.png" width="32">.

<br/><br/>
By default, traps will only affect characters on the ground (ones that don't
have a wing or angel status marker). To have a trap also affect flying
characters (their tokens have the <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> icon), give it the wing <img src="http://game-icons.net/icons/lorc/originals/png/fluffy-wing.png" width="32"> or angel <img src="http://game-icons.net/icons/lorc/originals/png/angel-outfit.png" width="32"> status marker.

<br/><br/>
By default, trap tokens won't appear when they are activated. If you would
like the trap to become visible to the players when it is activated, give it
the bleeding eye <img src="http://game-icons.net/icons/lorc/originals/png/bleeding-eye.png" width="32"> status marker.

### Activating traps:

If a token moves across a trap at ANY point during its movement, the trap will
be activated!
