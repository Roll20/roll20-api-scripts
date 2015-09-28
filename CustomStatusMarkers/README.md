# Custom Status Markers

###### Required Scripts
* [Path Math](https://github.com/Roll20/roll20-api-scripts/tree/master/PathMath)

Allows users to create custom status markers and set them onto tokens.

### Saving status markers

1) Draw your marker using the polygon or freestyle drawing tools.
2) Select your marker drawing and enter '!saveMarker {statusName}' in the
chat, where {statusName} is the name you want to save the custom status marker
as.

e.g. '!saveMarker sleep'

When the marker is saved, a confirmation message will be displayed in the chat.

### Setting/toggling status markers on tokens

1) Select one or more tokens to assign the status maker to.
2) In the chat, enter the '!setMarker {statusName} [{count}]',
where {statusName} is the name of the saved custom status marker and [{count}]
is an optional number badge to put on the status marker.

If the status marker will be toggled for each selected token. If count is
specified, the status marker will include count as a text badge.

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
