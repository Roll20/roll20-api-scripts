# Token Collisions

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
 * @param {Graphic[]} others
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
 * @param {Graphic[]} others
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
