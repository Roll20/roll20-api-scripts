# Marching Order

_3.1 Updates_
* Added button for creating ad-hoc formations that aren't saved.
* Added button for making one token follow another at some set distance as an ad-hoc formation.
* Reorganized the menu a little bit.
* Formations will only look for their tokens on the objects layer when they are applied.

_v3.0 Updates_
* The script has been reworked entirely. Marching orders now work based upon formations formed when you tell a group of tokens to follow a leader.
* You can now save multiple formations and load them up to be used later.

This script allows you to select tokens and tell them to follow each other
in some specified marching formation. Marching orders are defined by formations,
where there is a leader token and one or more follower tokens. When you set
tokens to follow a leader, it will record their position relative to the
leader in that formation, and they'll maintain that position as the leader
moves. This formation is maintained even when the leader travels around corners.

## Chat Menu

When the script is installed, it will create a macro called
'MarchingOrderMenu'. This macro will display a menu in the chat that provides
the user interface for the script.

Below is documentation for each of the menu items:

### Ad-Hoc Formations

The following menu items allow you to create one-time-use marching formations.

#### Ad-Hoc Formations -> Follow

This button allows you to have a token simply follow behind another.

First, select the token that you want to be the follower, then click the Follow
button. Next, click the token you want them to follow. Then in the prompt that
appears, enter how far behind you want them to follow (leave as 0 to follow
directly behind them).

Be advised of the following gotchas:
* A token can't follow behind another if the other token already has followers.

#### Ad-Hoc Formations -> Ad-Hoc Formation

To form a one-time-use formation, use this button.

To create a new marching order formation, select a group of tokens, with one
of them having either the black-flag or flying-flag status marker active. That
token will be the leader of the formation. (See Moving in Formation below)

Then click the Ad-Hoc Formation button in the chat menu. It will ask you to enter
which direction the formation is facing at the time you've created it.
This marching formation will be applied to the selected tokens.

Be advised of the following gotchas:
* You must have one of the selected tokens have either the 'black-flag' or 'flying flag' status marker. This is used to designate the leader of the formation.

### Saved Formations

Under this section of the chat menu, you can view the formations you have
previously created. The formations each displayed in a boxed area with their name,
a preview of the formation, and some buttons to either use the formation or
delete it. The previews display the marching orders proceeding westward.

### Saved Formations - > New formation

This button allows you to create a formation and save it for future use.

To create a new marching order formation, select a group of tokens, with one
of them having either the black-flag or flying-flag status marker active. That
token will be the leader of the formation. (See Moving in Formation below)

Then click the New Formation button in the chat menu. It will ask you to enter
which direction the formation is facing at the time you've created it, and it
will ask you to give a name for the new formation. This marching formation will
be applied to the selected tokens and it will also be saved for future use
(See Saved Formations).

Be advised of the following gotchas:
* You must have one of the selected tokens have either the 'black-flag' or 'flying flag' status marker. This is used to designate the leader of the formation.
* Each new formation must have a unique name.

#### Saved Formations -> Use

Click this button to use the previously saved marching formation. It will be
applied to the relevant tokens on the page that currently has the
players ribbon.

Be advised of the following gotchas:
* All of the tokens in the formation must be on the current page. If a token is missing, the script will yell at you for it, but the rest of the tokens will be allowed to move in formation.
* There can't be duplicates of any tokens in the formation on the current page.

#### Saved Formations -> Delete

Click this button to delete the previously saved marching formation.

### Other Actions

#### Other Actions -> Stop Following

To stop all the active marching formations, click the Stop All Following button
in the chat menu.

#### Other Actions -> Clear Script State

If you'd like to start afresh with a whole blank state for the Marching Order
script, you can click the Clear Script State button to reset the script
to its factory settings.

## Moving in Formation

When a marching formation is applied, all the tokens relevant to the formation
will begin following their leader in that formation. When the leader moves,
the other tokens in the formation will move along with them, according to
their position in the formation.

## Stepping out of Formation

You can remove a token from an active formation at any time by just moving it
manually. That token will no longer move along with the other tokens in that
formation.

## But I liked the old version of this script!

You can still use the old version of this script by reverting back to
version 2.4. However, do so with the understanding that I won't be providing
any further technical support on versions prior to 3.0.

## Help

My scripts are provided 'as-is', without warranty of any kind, expressed or implied.

That said, if you experience any issues while using this script,
need help using it, or if you have a neat suggestion for a new feature,
please shoot me a PM:
https://app.roll20.net/users/46544/stephen-l

When messaging me about an issue, please be sure to include any error messages that
appear in your API Console Log, any configurations you've got set up for the
script in the VTT, and any options you've got set up for the script on your
game's API Scripts page. The more information you provide me, the better the
chances I'll be able to help.

## Show Support

If you would like to show your appreciation and support for the work I do in writing,
updating, maintaining, and providing tech support my API scripts,
please consider buying one of my art packs from the Roll20 marketplace:

https://marketplace.roll20.net/browse/search?category=itemtype:Art&author=Stephen%20Lindberg|Stephen%20L
