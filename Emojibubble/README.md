# Emojibubble

[Emojibubble Forum Discussion](https://app.roll20.net/forum/post/9605567/script-emojibubble/?pageforid=9605567#post-9605567)

This script provides a way for GMs and players to indicate mood, action, attention, really anything an emoji can communicate on the tabletop. Using either the emojibubble console handout, or the available macros, GMs and players can select an emoji, which causes a small word-balloon with a single emoji adjacent to the selected token's top-right. Only graphic:tokens can be targeted or selected.

## Installation

On installation in one-click, a handout ("Emoji Bubble Console") is created with the default collection of 72 emoji as buttons you can click to add to a selected token, and a reference appears in chat that opens the handout. The handout persists, and will be re-created if you delete it so you and your players can always find and use the console.

It also creates two macros: #Select_Emojibubble and #Target_Emojibubble. These also will be re-created if deleted. #Selected_Emojibubble is available to players, and provides a way to select an emoji from a drop-down instead of the console. #Target_Emojibubble is available to the GM only, and the macro has a target select and the drop-down, meaning a GM doesn't have to select a token beforehand. 

## Using Emojibubble

Select any token on any layer, then either use the console and click the emoji you want to append in the notes section, or fire the #Selected_Emojibubble macro and select an emoji from the drop-down. Provided it is a valid graphic token, Emojibubble will append a drawing object bubble and a text object with a single emoji offset from the token to make it appear like the token is speaking the emoji. To clear an emojibubble, press the "Clear Emoji Bubble" button on the Emojibubble Console, or use the #Select_Emojibubble macro and select the "clear" emoji option. If you select another emojibubble for a token that already has one, the former one is cleared and the new one is appended. You can delete emojibubbles manually without causing an error; but really, Emojibubble will clean up after itself most of the time, including across sessions. 

The #Target_Emojibubble, for GM use only, provides a token-select prompt on being activated, then provides a drop down of all available emoji to select from. This provides a useful shortcut for GMs that may need to quickly target a token to emote without having to select and then use the console. It also has the clear option in its drop-down.

## Adding Emoji to the Emoji List

The GM Notes portion, invisible to the players, is below the main part of the console in the notes. Clicking on "Add Emoji" opens a pop-up where you can paste any emoji you have copied from elsewhere. You then are prompted to provide a name reference to the particular emoji - this is the internal reference index (no two can have the same name, and picking a name of an existing emoji will replace that emoji) and helps if you want to use the API to activate emojibubble directly by calling the emojibubble object from another script. 

A link to a popular emoji listing site is provided for convenience and opens in a new window.

## Removing Emoji from the Emoji List

Also in the GM Notes, there is an array of the same emoji as in the notes, but with a background that is dark gray. Clicking these will remove and emoji from the available list.  

## Resetting the Emoji List

Just in case you might have deleted most of the original emoji, and find you need to get a bunch back in a hurry, or made a mistake in deletion, the reset button sets the collection back to the default 60 that are provided when you first install Emojibubble. Unfortunately, there isn't an "undo" - if you accidentally delete a custom emoji you'll have to add it again. 

## Emojibubble Multi-Select

A GM or player with multiple tokens can select them all simultaneously and either use the macro #Selected_Emojibubble or the Emoji Bubble Console buttons to set multiple tokens to express the same emoji. 
