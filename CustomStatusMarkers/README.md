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
