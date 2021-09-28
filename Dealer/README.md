# Dealer 1.2
Deals and takes cards from players by deck

Syntax is:
`!deal --[give,take] [#] --[deck name]|[Card Name]`

If give/take is not specified, it gives a card to the player controlling the selected token If deck name is not specified, it defaults to "Playing Cards". If a card name is not specified, it defaults to a random card from the specified deck.

You can specify a number of cards to give or take. After the action word, type an integer, after a space:

`!deal --give 5 --Playing Cards`

You can specify a card to deal by name. If no card exists by that name in that deck, the script will inform the user by chat message. Note that it is possible to give multiple copies of the same card even from a finite deck:

`!deal --give --Playing Cards|Six of Hearts`

The script will deal cards to the player from the specified deck so long as there are enough available. If the deck has cycled through all cards, it will automatically shuffle.

If a token has more than one controller or is controlled by All and one or more players, it will select the first single player in the controlled by list.

Script will try to let you know if you have not prepared a command or deck properly.

If deck does not deal a card, you may need to manually shuffle (Roll20 bug). If the deck is shuffled, it may not recognize all cards in hand.

Uses:
Games which deal or take playing cards at random from a standard deck

Awarding inspiration--or Bardic Inspiration from a separate deck.

Awarding a random potion/scroll/treasure/piece of equipment from a properly prepared deck.

### Examples

`!deal --give --Inspiration`

This will deal a card from a deck called "Inspiration" to the player whose token is selected. This would be ideal as a token ability or macro bar macro to allow GMs to award Inspiration to the player of a selected token.


`!deal --take --Inspiration`

This will take a card from a deck called "Inspiration" from the hand player whose token is selected. This would be ideal as a token ability to allow players to spend Inspiration


`!deal --give`

or

`!deal --give --Playing Cards`

This will deal a card from the Playing Cards deck to the player whose token is selected.

`!deal --take`

This will take a card from the Playing Cards deck from the hand player whose token is selected.
