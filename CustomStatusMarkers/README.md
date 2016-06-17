# Custom Status Markers

_v2.0 Updates_
* Code clean-up.
* Cleaner, expanded, and easy to use exposed API.
* Bug fixes.

##### Dependencies:
* Path Math

Allows users to create custom status markers for tokens.

## Creating status markers

You can create markers either as graphics or as drawn paths. When you've
chosen the graphic/made your drawing for the marker, do the following to
save it:
1) Select the marker's graphic/paths.
2) enter '!saveMarker NAME' in the chat, where NAME is the name you want to
save the custom status marker as.

e.g. '!saveMarker sleep'

When the marker is saved, a confirmation message will be displayed in the chat.

### Setting/toggling status markers on tokens

1) Select one or more tokens to assign the status maker to.
2) In the chat, enter the '!setMarker NAME [COUNT]'.

NAME is the name of the saved custom status marker.
[COUNT] is an optional number badge to put on the status marker.

The status marker will be toggled for each selected token. If count is
specified, the status marker will include count as a text badge.

e.g. '!setMarker sleep' or '!setMarker poison 3'

### Listing status markers

You can view the list of custom status markers saved in your campaign
by entering the command:

!listMarkers

### Deleting status markers

You can delete one of your saved custom status markers by entering the command:

!delMarker {statusName}

e.g. '!delMarker sleep'

### Clearing the Custom Status Markers state

A command is provided for clearing the Custom Status Markers module's state.

!clearMarkersState [tokens]

If a token is selected when the command is entered, only the CSM state for that
token will be cleared (any custom markers on that token will stop following it).
If the 'tokens' option is given, then only the CSM tokens state is cleared.
Otherwise, both the CSM's tokens state and its saved markers are cleared.

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
