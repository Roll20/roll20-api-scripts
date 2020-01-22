# Marching Order

_v2.4 Updates_
* Code refactored into modules.

This script allows you to select tokens and tell them to follow each other
in some specified marching order.

### To set one token to follow another

Select the token that will be the follower.
From the menu, click the 'Follow' button. You will then be prompted to click
the token that will be the leader.

You can use this method consecutively for pairs of leader/follower
tokens to specify a chain of tokens to be in some marching order.

### To specify several tokens making up a marching order

Arrange the tokens in order from west to east, east to west, south to north,
or north to south.

Select all the tokens that will be in the marching order.

In the menu, click 'North', 'East', South', or 'West'.

For 'North', the northmost token will be the leader in the marching order
and the southmost token will be the caboose. The same pattern follows for
the other cardinal directions.

### To make tokens stop following each other

Just manually drag-and-drop the token out of the marching order.
They will step out of line in the marching order, but the rest of the
marching order will be unaffected. If a token was following the token
that stepped out of line, they will instead follow the token that the token
which stepped out of line was following.

To stop all tokens from following each other, click the Stop All Following
button in the menu.

### Default marching order

From the menu, you can also set a reusable default marching order and apply it
to the current players' page.

To set a default marching order, select the leader token in an active
marching order and click the Set Default button from the menu. Each token
in the marching order must represent a character.

To apply the saved default marching order to the current player ribbon page,
click the Use Default button from the menu. If a character from the default
order is missing from the current page, they will be skipped, but the rest
of the marching order will be applied.

## Help

If you experience any issues while using this script or the trap themes,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/stephen-l
or create a help thread on the Roll20 API forum

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts, please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/search?category=itemtype:Art&author=Stephen%20Lindberg|Stephen%20L

or, simply leave a thank you note in the script's thread on the Roll20 forums.
Either is greatly appreciated! Happy gaming!
