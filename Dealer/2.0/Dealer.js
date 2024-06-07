// Dealer
// Last Updated: 2019-09-03
// A script to deal and take cards to selected users from specified decks.
// Syntax is !deal --[give,take] [number of cards as integer] --[deck name]|[card name]
on('ready', () => {
    const version = '2.0';

    const processInlinerolls = (msg) => {
        if(_.has(msg,'inlinerolls')){
            return _.chain(msg.inlinerolls)
                .reduce(function(m,v,k){
                    let ti=_.reduce(v.results.rolls,function(m2,v2){
                        if(_.has(v2,'table')){
                            m2.push(_.reduce(v2.results,function(m3,v3){
                                m3.push(v3.tableItem.name);
                                return m3;
                            },[]).join(', '));
                        }
                        return m2;
                    },[]).join(', ');
                    m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
                    return m;
                },{})
                .reduce(function(m,v,k){
                    return m.replace(k,v);
                },msg.content)
                .value();
        } else {
            return msg.content;
        }
    };


    log('-=> Dealer v' + version + ' <=-');
    
    //Interface elements
    
    const openReport = `<div style = 'display: block; position:relative;left: -5px; background-color:#888; border-radius:18px; text-decoration:none;color:#000; font-family:Arial; font-size:13px; padding: 8px;'>`;
    const openSection = `<div style = 'background-color:#ccc; color:#111; border: 1px solid black; padding:3px; border-radius:15px;margin-top:10px;'>`
    const openHeader = `<div style = 'display: block; background-color:#333; color: #3b0; font-weight: bold; padding:2px; border-radius:20px; text-align:center;'>`;
    const openSubhead = `<div style = 'background-color:#333; color: #ccc; font-weight: bold; padding:2px; border-radius:20px; text-align:center;'>`;
    const openSubheadMargin = `<div style = 'background-color:#333; color: #ccc; font-weight: bold; padding:2px; border-radius:20px; text-align:center; margin-bottom:5px;'>`;
    const openPageHead = `<div style = 'background-color:#aaa; color: #111; font-weight: bold; padding:2px; margin-bottom:6px; border-radius:20px; text-align:center;'>`;
    const closeReport = `</div>`;
    const dealerHelp = openReport + openHeader +"Dealer v."+ version + "</div>" +
"Dealer deals and takes cards from players sepcified by deck or deck & card. It works on selected tokens or by specifying a player_id.<BR>" +
openSection +openSubhead + "Syntax</div><BR>" +
"<code>!deal --[give,take] [#] --[deck name]|[Card Name] --[ids|Player_id]</code><BR>" +
"If give/take is not specified, it gives a card to the player controlling the selected token If deck name is not specified, it defaults to 'Playing Cards'. If a card name is not specified, it defaults to a random card from the specified deck.<BR>" +
"You can specify a number of cards to give or take. After the action word, type an integer, after a space:<BR>" +
"<code>!deal --give 5 --Playing Cards</code><BR>" +
"You can specify a card to deal by name. If no card exists by that name in that deck, the script will inform the user by chat message. Note that it is possible to give multiple copies of the same card even from a finite deck:<BR>" +
"<code>!deal --give --Playing Cards|Six of Hearts</code><BR>" +
"The script will deal cards to the player from the specified deck so long as there are enough available. If the deck has cycled through all cards, it will automatically shuffle.<BR>" +
"If a token has more than one controller or is controlled by All and one or more players, it will select the first single player in the controlled by list.<BR>" +
"Script will try to let you know if you have not prepared a command or deck properly.<BR>" +
"If deck does not deal a card, you may need to manually shuffle (Roll20 bug). If the deck is shuffled, it may not recognize all cards in hand.<BR>" +
"If you do not wish to select a token, you may specify the plyer by using their player id. Use the optional <BR><code> --ids|[player_id]</code> at the end of a command. You can get a list of player ids in the campaign by using the command <BR><code>!deal --players</code></div>" +
openSection +openSubhead +"Uses:</div><BR>" +
"Games which deal or take playing cards at random from a standard deck<BR>" +
"Awarding inspiration--or Bardic Inspiration from a separate deck.<BR>" +
"Awarding a random potion/scroll/treasure/piece of equipment from a properly prepared deck.</div>" +
openSection +openSubhead +"Examples</div><BR>" +
"<code>!deal --give --Inspiration</code><BR>" +
"This will deal a card from a deck called 'Inspiration' to the player whose token is selected. This would be ideal as a token ability or macro bar macro to allow GMs to award Inspiration to the player of a selected token.<BR>" +
"<BR>" +
"<code>!deal --take --Inspiration</code><BR>" +
"This will take a card from a deck called 'Inspiration' from the hand player whose token is selected. This would be ideal as a token ability to allow players to spend Inspiration<BR>" +
"<BR>" +
"<code>!deal --give</code> or <BR><code>!deal --give --Playing Cards</code><BR>" +
"This will deal a card from the Playing Cards deck to the player whose token is selected.<BR>" +
"<code>!deal --take</code><BR>" +
"This will take a card from the Playing Cards deck from the hand player whose token is selected.</div></div>";
    

            const sendMessage = function(title,theMessage) {
                sendChat ('Dealer','/w gm ' +openSection+openHeader+title+'</div>'+theMessage+closeReport);
                return;
    }

    on('chat:message', (msg) => {
        if ('api' === msg.type && /!deal(\b\s|$)/i.test(msg.content)) {
let playerList = '';
let IDs = '';
const  players=findObjs({_type:'player'});
    _.each(players,function (obj){
        playerList = playerList + ('<b>'+obj.get('displayname')+':</b> '+obj.get('id'))+'<BR>';
    });
    
if (msg.content === '!deal --players'){
    //For when I add multiple players
    //let howToUse = '<BR> To specify a player to send a card to, copy one or more player IDs above. Use them at the end of a command using the format:<BR><code>--ids|ID1,ID2...</code><BR>Be sure to include the dash at the beginning of an id, and to use no spaces in the string.'
    let howToUse = '<BR> To specify a player to send a card to, copy one of the player IDs above. Use it at the end of a command using the format:<BR><code>--ids|ID1</code><BR>Be sure to include the dash at the beginning of the id, and to use no spaces in the string. Currently, Dealer only supports one token or player ID per command.'
    
    //playerList = openSection+openHeader+'Player ID list</div>'+playerList+howToUse+closeReport;
    sendMessage("Player List",playerList+howToUse);
    return;
};

if (msg.content === '!deal --help'){
    //playerList = openSection+openHeader+'Player ID list</div>'+playerList+howToUse+closeReport;
    sendChat("Dealer",dealerHelp);
    return;
};

if (msg.content.includes(' --ids|')){
 IDs = msg.content.split(' --ids|')[1].split(',');
 //For now, we only want the first. We will add the ability to do multiples later.
 IDs = IDs[0];
 msg.content = msg.content.split(' --ids|')[0];}

    else{
      if(!msg.selected){
           sendMessage ("No Player Identified", "You must select a token controlled by a player, or use the --ids command to specify a player ID. Player Id's can be found with the command <code>!deal --players</code>.");
        return;
       } 
 
 
}


            //get parameter and use default of 'give' if parameter is missing or malformed
            const args = processInlinerolls(msg).split(/\s+--/);

            if (args.length < 2) {
                if (args[0] !== '!deal') {
                    sendMessage('Malformed Command', 'Please use !deal --[give/take] --[Deckname] --ids|player_ids.');
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
            let choices = args[2] || 'Playing Cards';


            let deckChoice = choices.split(/\|/)[0] || 'Playing Cards';
            let cardChoice = choices.split(/\|/)[1] || '';



            //getid of deck
            let theDeck = findObjs({
                _type: "deck",
                name: deckChoice
            })[0];

            //test if deck exists
            if (!theDeck) {
                sendMessage('No Such Deck', 'Create a deck named ' + deckChoice + '. If the intent is an Inspiration deck, it must be an infinite deck of one card only.');
                return;
            }


            let deckID = theDeck.id;
            let deckCards = theDeck.get('_currentDeck');



            if (msg.selected){
                
             if (msg.selected.length > 1) {
                sendMessage('Multiple Tokens', 'Please select only one token. It must be controlled by a specific player, or represent a player-controlled character.');
                return;
             }
            }

            if (msg.selected){
            let token = getObj(msg.selected[0]._type, msg.selected[0]._id);

            //assign associated character to a variable
            if (!token.get('represents')) {
                sendMessage('No Player Specified', 'This token does not represent a player character. Only players get cards.');
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
            }

            if (IDs !==''){
                ownerid = IDs;
            }
            if (undefined===ownerid || ownerid===''){
                sendMessage ('No Player ID specified', 'Dealer does not know whom to send this card to.');
                return;
            }

            // give card to player
            // If the ownerid is undefined (no valid controller) explain and exit
            if (!ownerid) {
                sendMessage('Needs a Player Controller', 'If a token represents a character controlled by \'All Players\', an individual player must be also be specified. If there are multiple controllers, only the first will get inspiration.');
                return;
            }

            //If a card is specified by name
            if (cardChoice !== '') {
                let theCard = findObjs({
                    _type: 'card',
                    name: cardChoice,
                    _deckid: deckID
                })[0];
                if (theCard !== undefined) {
                    do {
                        let specificCardID = theCard.id;
                    if (cardAction == 'give') {
                        giveCardToPlayer(specificCardID, ownerid);
                        numCards--;
                    } else {
                        takeCardFromPlayer(ownerid, {cardid: specificCardID})
                        numCards--;                        
                    }
                    }
                    while (numCards > 0);
                    return;
                } else {
                    sendMessage('No Such Card', 'There does not seem to be a card named ' + cardChoice + ' in the deck ' + deckChoice);
                    return;
                }
            }


            //If this is a random card
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
                            sendMessage('Deck Empty', token.get('name') + ' has no cards left to take from the ' + deckName + ' deck.');
                        }

                        break;
                    default:
                        giveCardToPlayer(cardid, ownerid);
                        break;
                }

                numCards--;
            }
            while (numCards > 0);
        }
    });
});
