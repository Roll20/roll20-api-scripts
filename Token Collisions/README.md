# Token Collisions

This script provides a small library for checking for collisions between
tokens. It provides no functionality by itself, but it is used by other
scripts such as ```It's A Trap``` and ```World Map Discovery```.

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
