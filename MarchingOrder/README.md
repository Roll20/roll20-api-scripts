# Marching Order

_v2.1 Updates_
* The script now has a chat menu interface accessible through the 'showMarchingOrderMenu' macro.

This script allows you to select tokens and tell them to follow each other
in some specified marching order.

### To set one token to follow another

Select the token that will be the follower.
From the menu, click the 'Follow' button. In the prompt, enter the name of
the token you want to follow.

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
