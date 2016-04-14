# Custom Status Markers

###### Required Scripts
* [Path Math](https://github.com/Roll20/roll20-api-scripts/tree/master/PathMath)

Allows users to create custom status markers and set them onto tokens.

## Creating status markers

You can create markers either as graphics or as drawn paths. When you've
chosen the graphic/made your drawing for the marker, do the following to
save it:
1) Select the marker's graphic/drawing paths.
2) enter '!saveMarker NAME' in the chat, where NAME is the name you want to
save the custom status marker as.

e.g. '!saveMarker sleep'

When the marker is saved, a confirmation message will be displayed in the chat.

## Setting/toggling status markers on tokens

1) Select one or more tokens to assign the status maker to.
2) In the chat, enter the '!setMarker NAME [COUNT]'.

NAME is the name of the saved custom status marker.
[COUNT] is an optional number badge to put on the status marker.

The status marker will be toggled for each selected token. If count is
specified, the status marker will include count as a text badge.

e.g. '!setMarker sleep' or '!setMarker poison 3'

## Listing status markers

You can view the list of custom status markers saved in your campaign
by entering the command:

!listMarkers

## Deleting status markers

You can delete one of your saved custom status markers by entering the command:

!delMarker {statusName}

e.g. '!delMarker sleep'

## Clearing the Custom Status Markers state

A command is provided for clearing the Custom Status Markers module's state.

!clearMarkersState [tokens]

If a token is selected when the command is entered, only the CSM state for that
token will be cleared (any custom markers on that token will stop following it).
If the 'tokens' option is given, then only the CSM tokens state is cleared.
Otherwise, both the CSM's tokens state and its saved markers are cleared.

## Known issues:

* Elliptical paths are not supported. As a work-around, you can approximate a
circle or ellipse using the polygon or freehand path tools.
* Negatively scaled (flipped) paths are not supported. This is due to a bug in
the API that causes it to return the magnitude, but not the sign of a path's
scale transform components.
