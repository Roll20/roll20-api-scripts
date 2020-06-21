# Dealer 1.1
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
