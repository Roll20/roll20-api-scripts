# Token Collisions

_v1.5 Updates:_
* Collisions with Paths and arbitrary polygons are now supported. Paths with non-transparent fills are treated as polygons.
* All collisions are now entirely pixel-perfect.

_v1.4 Updates:_
* getCollisions and getFirstCollision now accept an options object parameter. See the CollisionOptions typedef jsdoc for supported properties.

_v1.3 Updates:_
* Supports circle-to-rectangle token collisions.
* Added isOverlapping() function.

This script provides a small library for checking for collisions between
tokens. It provides no functionality by itself, but it is used by other
scripts such as ```It's A Trap``` and ```World Map Discovery```.

## Rectangular tokens

By default, all tokens are assumed to be circular with a diameter equal to their
width. You can set a token to be rectangular for this script by setting its
Aura1 to a square.

## API Documentation:

The following functions are exposed by the ```TokenCollisions``` object:

```
/**
 * Returns the list of other tokens that some token collided with during
 * its last movement.
 * The tokens are sorted in the order they are collided with.
 * @param {Graphic} token
 * @param {(Graphic|Path|PathMath.Polygon)[]} others
 * @return {Graphic[]}
 */
function getCollisions(token, others)
```

```
/**
 * Returns the first token, from some list of tokens, that a token has
 * collided with during its last movement, or undfined if there was
 * no collision.
 * @param {Graphic} token
 * @param {(Graphic|Path|PathMath.Polygon)[]} others
 * @return {Graphic}
 */
function getFirstCollision(token, others)
```

```
/**
 * Checks if a non-moving token is currently overlapping another token.
 * This supports circular and rectangular tokens.
 * Tokens are considered to be rectangular if their aura1 is a square.
 * @param  {Graphic}  token
 * @param  {Graphic}  other
 * @param {boolean} [collideOnEdge=false]
 *        Whether tokens should count as overlapping even if they are only
 *        touching on the very edge.
 * @return {Boolean}
 */
function isOverlapping(token, other, collideOnEdge)
```

## Help

If you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature, please
post to the script's thread in the API forums or shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, and maintaining my API scripts, consider buying one of my art packs from the Roll20 marketplace (https://marketplace.roll20.net/browse/search/?keywords=&sortby=newest&type=all&genre=all&author=Stephen%20Lindberg)
or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
