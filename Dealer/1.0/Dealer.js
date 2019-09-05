// Dealer
// Last Updated: 2019-08-16
// A script to deal and take cards to selected users from specified decks.
// Syntax is !deal --[give,take] [number of cards as integer] --[deck name]

on('ready',()=>{
const version = '1.0.0';
log('-=> Dealer v' + version + ' <=-');

on('chat:message', (msg) => {
    if ('api' === msg.type && /!deal\b/i.test(msg.content) && msg.selected) {


        //get parameter and use default of 'give' if parameter is missing or malformed
        const args = msg.content.split(/\s+--/);

        if (args.length < 2) {
            if (args[0] !== '!deal') {
                sendChat('Deal', '/w gm Malformed command. Please use !deal --[give/take] --[Deckname].');
                return;
            } else {
                args[1] = 'give';
            }
        }
        let action = args[1].split(/\s+/)[0];


        let numCards = args[1].split(/\s+/)[1];
        numCards = Number((Number.isInteger(Number(numCards))) ? numCards : 1);

        const actions = ['give', 'take'];
        let cardAction = 'give';
        if (action && actions.includes(action)) {
            cardAction = action;
        }
        let deckChoice = args[2] || 'Playing Cards';

        //getid of deck
        let theDeck = findObjs({
            _type: "deck",
            name: deckChoice
        })[0];

        //test if deck exists
        if (!theDeck) {
            sendChat('Deal', '/w gm Create a deck named ' + deckChoice + '. If the intent is an Inspiration deck, it must be an infinite deck of one card only.');
            return;
        }


        let deckID = theDeck.id;
        let deckCards = theDeck.get('_currentDeck');

        if (msg.selected.length > 1) {
            sendChat('Deal', '/w gm Please select only one token. It must represent player-controlled character.');
            return;
        }

        let token = getObj(msg.selected[0]._type, msg.selected[0]._id);

        //assign associated character to a variable
        if (!token.get('represents')) {
            sendChat('Deal', '/w gm This token does not represent a player character. Only players get cards.');
            return;
        }
        let character = getObj("character", token.get('represents'));

        //Get owner IDs of each -- Not needed at this point
        // If the token represents a character, get the character's controller, otherwise the token's
        let ownerids = (token.get('controlledby').split(','));


        if (character) {
            ownerids = (character.get('controlledby').split(','));
        }
        //reduces to one ownerid that is not ['all']
        ownerid = ownerids.filter(s => s !== 'all')[0];


        // give card to player
        // If the ownerid is undefined (no valid controller) explain and exit
        if (!ownerid) {
            sendChat('deal', '/w gm If a token represents a character controlled by \'All Players\', an individual player must be also be specified. If there are multiple controllers, only the first will get inspiration.');
            return;
        }


        do {

            //get id of card
            let cardid = drawCard(deckID);

            if (!cardid) {
                shuffleDeck(deckID);
                cardid = drawCard(deckID);
            }
            // get playerId of Token controller
            //assign selected token to a variable

            switch (cardAction) {
                case 'take':

                    let hand = findObjs({
                        type: 'hand',
                        parentid: ownerid
                    })[0];
                    let theHand = hand.get('currentHand');

                    cardid = (theHand.split(',').filter(x => deckCards.split(',').includes(x)))[0];

                    if (theHand.length !== 0 && cardid !== undefined) {

                        takeCardFromPlayer(ownerid, {
                            cardid: cardid
                        });
                    } else {
                        let deckName = theDeck.get('name');
                        sendChat('deal', '/w gm ' + token.get('name') + ' has no cards left to take from the ' + deckName + ' deck.');
                    }

                    break;
                default:
                    giveCardToPlayer(cardid, ownerid);
                    break;
            }

            numCards--;
            log("numCards = " + numCards)
        }
        while (numCards > 0);
    }
});
});
