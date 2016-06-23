# Custom Status Markers

_2.1 Updates_
* Chat-based menu. Users no longer need to interact with this script using chat commands.

_v2.0 Updates_
* Code clean-up.
* Cleaner, expanded, and easy to use exposed API.
* Bug fixes.

##### Dependencies:
* Path Math

This script allows users to create custom status markers for tokens.
When this script is installed, it creates a 'CustomStatusMarkers' macro for
displaying the script's menu.

## Opening the menu

To open the script's menu, just run the 'CustomStatusMarkers' macro installed
by this script.

## Creating status markers

You can create markers either as graphics or as drawn paths. When you've
chosen the graphic/made your drawing for the marker, do the following to
save it:
1) Select the marker's graphic/paths.
2) Click the 'New Status Marker' button in the menu.

### Setting/toggling status markers on tokens

To give a token a custom status marker or to remove a custom status marker from
a token, do the following:
1) Select one or more tokens to assign the status maker to.
2) Click the status marker button in the menu.

You can also add a number to the status marker by clicking the '#' next to it
in the menu.

### Deleting status markers

You can delete one of your saved custom status markers by clicking the 'del'
button next to it in the menu.

### Clearing the Custom Status Markers state

A command is provided for clearing the Custom Status Markers module's state.
Warning: This will delete all your saved custom status markers!

### API documentation
The following classes and functions are exposed through the CustomStatusMarkers
object:

```
/**
 * Adds a custom status marker to a token, with an optional count badge.
 * @param  {Graphic} token
 * @param  {String} statusName
 * @param  {String} [count]
 */
function addStatusMarker(token, statusName, count)

/**
 * Clears the Custom Status Markers state for a particular token.
 * @param  {Graphic} token
 */
function clearTokenState(token)

/**
 * Deletes a custom status marker template.
 * @param  {string}   statusName
 */
function deleteTemplate(statusName)

/**
 * Returns this module's object for the Roll20 API state.
 * @return {Object}
 */
function getState()

/**
 * Gets the names of all the custom status markers on a token.
 * @param {Graphic} token
 * @return {string[]}
 */
function getStatusMarkers(token)

/**
 * Loads a StatusMarkerTemplate from the module state.
 * @param  {String}   statusName
 * @param  {Function(StatusMarkerTemplate)} callback
 */
function getTemplate(statusName, callback)

/**
 * Checks if a token has the custom status marker with the specified name.
 * @param {graphic} token
 * @param {string} statusName
 * @return {boolean}
 *         True iff the token has the custom status marker active.
 */
function hasStatusMarker(token, statusName)

/**
 * Registers a Custom Status Markers event handler.
 * Each handler takes a token and a StatusMarker as parameters.
 * The following events are supported: 'add', 'change', 'remove'
 * @param {string} event
 * @param {function} handler
 */
function on(event, handler)

/**
 * Deletes a custom status marker from a token.
 * @param {Graphic} token
 * @param {String} statusName
 */
function removeStatusMarker(token, statusName)

/**
 * Removes all custom status markers from a token.
 * @param {Graphic} token
 */
function removeStatusMarkers(token)

/**
 * Moves a token's custom status markers to their correct positions.
 * @param {Graphic} token
 */
function repositionStatusMarkers(token)

/**
 * Saves a custom status marker template.
 * @param {String} statusName
 * @param {(Graphic|Path|Path[])} icon
 */
function saveTemplate(statusName, icon)

/**
 * Toggles a custom status marker on a token, with an optional count badge.
 * @param  {Graphic} token
 * @param  {String} statusName
 * @param  {String} [count]
 */
function toggleStatusMarker(token, statusName, count)

/**
 * Removes a custom status marker event handler.
 * @param {string} event
 * @param {function} handler
 */
function un(event, handler)
```
