const runes = {
    dagaz: 'https://s3.amazonaws.com/files.d20.io/images/130871534/IAC5VQjvAaYbquX-UjpONg/thumb.png?1588550687', 
    ing: 'https://s3.amazonaws.com/files.d20.io/images/130885907/yOo2hnxeVjz4kiQqfAW_EA/thumb.png?1588553393', 
    claguz: 'https://s3.amazonaws.com/files.d20.io/images/130871479/D1b9ZEBTyM5LZR7lu-q5eQ/thumb.png?1588550675', 
    gebgift: 'https://s3.amazonaws.com/files.d20.io/images/130885838/BKUYgFD01qJuSrkbMSxsxA/thumb.png?1588553376', 
    elhaz: 'https://s3.amazonaws.com/files.d20.io/images/130885599/3PrA5oNWg53_-SgQDR7HHA/thumb.png?1588553342', 
    fehu: 'https://s3.amazonaws.com/files.d20.io/images/130885681/QncATjQ8A6aVLClGr8P8fw/thumb.png?1588553359', 
    berkano: 'https://s3.amazonaws.com/files.d20.io/images/130885527/DOODWOhwP9JkfoR8yOVxcg/thumb.png?1588553327', 
    cansuz: 'https://s3.amazonaws.com/files.d20.io/images/130871412/iK3B9OHcsl2Zoiy7XYnyjg/thumb.png?1588550663', 
    raidho: 'https://s3.amazonaws.com/files.d20.io/images/140431526/sMjItpIZ8Xy6ixpndQYOlw/thumb.png?1591147828', 
    wunjo: 'https://s3.amazonaws.com/files.d20.io/images/136845799/FS6V1bqcLNKnG2HC81ZePg/thumb.png?1590091504', 
    mann: 'https://s3.amazonaws.com/files.d20.io/images/136845612/jRnEaR51O9Hn5MH7tclCBA/thumb.png?1590091464', 
    pertho: 'https://s3.amazonaws.com/files.d20.io/images/136845350/ce8q5GvrfOpifBJ841It1A/thumb.png?1590091401', 
    naudhneed: 'https://s3.amazonaws.com/files.d20.io/images/136672031/hDSuKRh-hacV2QRNyZdjsA/thumb.png?1590032383', 
    othala: 'https://s3.amazonaws.com/files.d20.io/images/136844416/5Lao08l6EB29hOefD1gMuw/thumb.png?1590091198', 
    uruz: 'https://s3.amazonaws.com/files.d20.io/images/136844482/rEhsEpY6z3Tddp0Mgt8XjA/thumb.png?1590091216', 
    isaice: 'https://s3.amazonaws.com/files.d20.io/images/138499614/pgwWPZlUzhoHWutGaRlSTA/thumb.png?1590537047', 
    tiwaz: 'https://s3.amazonaws.com/files.d20.io/images/138499528/B0EG9zrHFOMlyStmQfcvFQ/thumb.png?1590537021', 
    ehwo: 'https://s3.amazonaws.com/files.d20.io/images/138498927/jRF0E1Px7jFIvCHzTl7fwA/thumb.png?1590536859', 
    hagalaz: 'https://s3.amazonaws.com/files.d20.io/images/136845101/bNGSLWk32Wfis9IxLhjCIQ/thumb.png?1590091360', 
    jethe: 'https://s3.amazonaws.com/files.d20.io/images/136671856/xcug-wNgJKcjJRvZABeJAA/thumb.png?1590032305', 
    sowsun: 'https://s3.amazonaws.com/files.d20.io/images/120545329/f8RwcSZMu8hwmUi6FcYIkQ/thumb.png?1586552839', 
    thurisaz: 'https://s3.amazonaws.com/files.d20.io/images/120494433/ebMrXKEikstujwLCujS6SQ/thumb.png?1586547638', 
    kenaz: 'https://s3.amazonaws.com/files.d20.io/images/146909842/_IXpLU-fUWZpDzw4rwokSg/thumb.png?1593392207',
    Eihwas: 'https://s3.amazonaws.com/files.d20.io/images/146911139/5Eqsro-jfRfonKaJvDT2bA/thumb.png?1593392601',
    mental: 'https://s3.amazonaws.com/files.d20.io/images/147024983/HKKRlmtef_ypAToobJDk3g/thumb.jpg?1593452592',
    physical: 'https://s3.amazonaws.com/files.d20.io/images/147025001/tscpoUdwCsZMKyMbiYKHBA/thumb.jpg?1593452599',
    spiritual: 'https://s3.amazonaws.com/files.d20.io/images/147025012/ffTI2xttaSZ8AVGWZcDcUw/thumb.jpg?1593452605',
    denizen1: 'https://s3.amazonaws.com/files.d20.io/images/108986617/Myluy44iVy6OXbIYeqWmfA/thumb.png?1584581839',
    denizen2: 'https://s3.amazonaws.com/files.d20.io/images/108986692/egU31MtlkRh70OPWDm-qKg/thumb.png?1584581863',
    denizen3: 'https://s3.amazonaws.com/files.d20.io/images/108986775/9g2AYqV5XS8QcbKmyOTtJQ/thumb.png?1584581886',
    denizen4: 'https://s3.amazonaws.com/files.d20.io/images/108986840/T_wyV-_1j6zcYI_4TyYsTw/thumb.png?1584581905',
    denizen5: 'https://s3.amazonaws.com/files.d20.io/images/108987685/KOXvOWjMKieBpkF0iwPXfQ/thumb.png?1584582074',
    denizen6: 'https://s3.amazonaws.com/files.d20.io/images/108987808/xqpWGXVQogK3xa9Q19fKrg/thumb.png?1584582111',
    denizen7: 'https://s3.amazonaws.com/files.d20.io/images/147024815/GnXVno950RsiXefR4Ep3vQ/thumb.png?1593452530',
    denizen8: 'https://s3.amazonaws.com/files.d20.io/images/147024789/3PgUMRqHMSHCzXx_M5obCw/thumb.png?1593452520',
    denizen9: 'https://s3.amazonaws.com/files.d20.io/images/147024768/mN0NEyRAD54bl7PY6XaEmg/thumb.png?1593452511',
    denizen10: 'https://s3.amazonaws.com/files.d20.io/images/147024750/4hdzptqs2DT4j5Ws81FlHw/thumb.png?1593452505',
    dweller1: 'https://s3.amazonaws.com/files.d20.io/images/147026223/El5k130hK1v3NkN9_Zk4kw/thumb.png?1593453045',
    dweller2: 'https://s3.amazonaws.com/files.d20.io/images/147026244/Fb2IJ1PKsvWzku_Af1I5Ug/thumb.png?1593453051',
    dweller3: 'https://s3.amazonaws.com/files.d20.io/images/147026263/alf6yIoV_kS_Hw9PjeYEog/thumb.png?1593453057',
    dweller4: 'https://s3.amazonaws.com/files.d20.io/images/147026276/Y_w_BVv9X1j3ZqCNX7FVVg/thumb.png?1593453063',
    dweller5: 'https://s3.amazonaws.com/files.d20.io/images/147026307/PgbkyShHgni7Y3RDq2BSOA/thumb.png?1593453070',
    dweller6: 'https://s3.amazonaws.com/files.d20.io/images/147026433/1ieMPGyEbrsO75G-gGA4Vg/thumb.png?1593453076'
};

const alka = {
    fire: 'https://s3.amazonaws.com/files.d20.io/images/148217109/pMM1cephkZVJ8ChYfHHmqw/thumb.png?1593911455',
    ice: 'https://s3.amazonaws.com/files.d20.io/images/148217123/hBZxHmB3nVU7hZV1yJXwlQ/thumb.png?1593911463',
    magic: 'https://s3.amazonaws.com/files.d20.io/images/148216807/5jnDpFeUX98dBoPp6F7QgA/thumb.png?1593911345'
};

//Begin wyrd script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!wyrd\b/i.test(msg.content)) {
        //these are the placement coordinants for the various zones on the playmat
        const coords = {hand: [0.2, 0.2], stun: [0.1, -0.04], wounds1: [0.16, -0.16], wounds2: [-0.05, -0.27], wounds3: [-0.25, -0.42], death: [0.25, -0.27], drain: [0.4, -0.27]};
        const args = msg.content.split(/\s+--/);
        //check to see if third argument specifies a zone other than 'hand', default to 'hand'
        if (!['stun', 'wounds1', 'wounds2', 'wounds3', 'death', 'drain'].includes(args[3])) {
            args[3]='hand';
        }
        //check to see if 4th argument specifies a layer other than 'objects', default to 'objects'
        if (!['gmlayer', 'map'].includes(args[4])) {
            args[4]='objects';
        }
        //getid of deck
        //deck must have the same name as the character
        let theDeck = findObjs({
            _type: "deck",
            name: args[1]
        })[0];
        //test if deck exists
        if (!theDeck) {
            sendChat('Wyrd', '/w gm Create a deck named ' + args[1]);
            return;
        }
        //Playmat graphic must be named $character_name+" playmat"
        let playmat = findObjs({
            _type: "graphic",
            name: args[1]+" playmat"
        })[0];
        //Check to make sure the playmat exists
        if (!playmat) {
            sendChat('Wyrd', '/w gm You need to name ' + args[1] + ' playmat');
            return;
        }
        let pageID = findObjs({
            name: "Playmats"
        })[0].id;
        // Get the deck ID and list of cards in it
        let deckID = theDeck.id;
        let deckCards = theDeck.get('_currentDeck');
        var i;
        // Do a number of times equal to the character's destiny
        for (i = 0; i < args[2]; i++) {
            //If the number of cards in the deck isn't zero
            if (cardInfo({type: "deck", deckid: theDeck.id}).length) {
                //Draw a card
                let card = findObjs({
                    _id: drawCard(deckID)
                })[0];
                //Put the card on the playmat, will stagger cards so they don't all stack on top of eachother
                //These numbers are scaled to put the cards into the in hand area on my playmat. If you change
                //the playmat size you will need to change them
                playCardToTable(card.id, {left: playmat.get("left")+i*20-coords[`${args[3]}`][0]*playmat.get('width'),top: playmat.get("top")-coords[`${args[3]}`][1]*playmat.get('height'), pageid: pageID, layer: args[4]});
                //I don't know why this works, but it seems necessary to change the "controlledby" property
                let cardObj = findObjs({
                    cardid: card.id
                })[0];
                //Make it so that anyone can control the cards. If you change "all" to args[1] it should limit
                //control to the initiating player
                cardObj.set("controlledby", "all");
            } else {
                //If the deck is empty send a message to the player and exit
                sendChat('Wyrd', '/w '+args[1]+' your bag is empty');
                return;
            }
        }
    }
});
//End wyrd script

//Begin cleanup script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!cleanup\b/i.test(msg.content)) {
        const args = msg.content.split(/\s+--/);
        let theDeck = findObjs({
            _type: "deck",
            name: args[1]
        })[0];
        //test if deck exists
        if (!theDeck) {
            sendChat('cleanup', '/w gm Create a deck named ' + args[1]);
            return;
        }
        //Playmat graphic must be named $character_name+" playmat"
        let playmat = findObjs({
            _type: "graphic",
            name: args[1]+" playmat"
        })[0];
        //Check to make sure the playmat exists
        if (!playmat) {
            sendChat('Cleanup', '/w gm You need to name ' + args[1] + ' playmat');
            return;
        }
        //get the info for cards in play
        let cards = cardInfo({type: "play", deckid: theDeck.id})
        //get an array of IDs of selected cards
        let selectedArray = []
        if (msg.selected) {
            selectedArray = msg.selected.map(getID);
        } else {
            selectedArray = [];
        }
        if (cards) {
            //get an array of IDs of cards in play
            let cardIDs = cards.map(getID);
        } else {
            sendChat('Cleanup', '/w '+args[1]+' You dont have any cards in play');
            return;
        }
        //for each card
        for (let card of cards) {
            //if it isn't in wounded and isn't selected
            if (!woundCheck(playmat, card) && !selectedArray.includes(card.id)) {
                //pick up the card
                pickUpCard(card.cardid);
            } 
        }
        //return all the picked up cards and shuffle
        recallCards(theDeck.id, 'hand');
        shuffleDeck(theDeck.id);
    }
});

//Begin helper functions for cleanup
function getID(value) { //returns the id
    if (value._id) {
        return value._id;
    } else if (value.id) {
        return value.id
    }
}

function woundCheck(playmat, card) { 
    //checks to see if a rune is in a specific zone of the playmat. Returns true if it is.
    let cardObj = findObjs({
        id: card.id
    })[0];
    let leftBound = playmat.get('left')-playmat.get('width')/2; //set left side of playmat
    let bottomBound = playmat.get('top')+playmat.get('height')/2; //set bottom side of playmat
    let topBound = playmat.get('top')-playmat.get('height')/2; //set top side of playmat
    if (leftBound < cardObj.get('left') &&                      //checks to see if rune is within playmat bounds and at least 60% down the graphic
    cardObj.get('left') < leftBound + playmat.get('width') &&
    cardObj.get('top') < bottomBound &&
    0.6*playmat.get('height')+topBound < cardObj.get('top')) {
        return true;
    } else {
        return false;
    }
}
//End helper functions for cleanup
//End cleanup script

//Begin Condition Update script
//On change of a condition in the character sheet it updates the playmat with the new info
//Will create a text box on the playmat to hold info if one is not present
//Works with standard FotN playmat of any size, so long as the proportions remain the same
on('change:attribute', function(obj) {
    const conditions = { //contains relative position of each condition box in percent from left, top
        'blind':'92.0 6.3', 
        'degen':'80.0 15.4', 
        'curse':'93.9 16.2',
        'taunt':'91.1 29.9',
        'impeded':'93.2 37.1',
        'shroud':'94.0 48.1',
        'possession':'92.5 60.7',
        'rage':'91.4 71.3',
        'vulnerable':'91.4 80.0',
        'aura':'91.4 94.4'
    };
    if (Object.keys(conditions).includes(obj.get('name'))) { //if the attribute registered is contained as a key in the conditions variable
        let attribute = obj.get('name'); //get the name of the attribute
        let pageID = findObjs({ //get the page id for the playmats
            name: "Playmats"
        })[0].id;
        let char = findObjs({ //get the character that changed the attribute
            _id: obj.get('_characterid')
        })[0];
        let name = char.get('name')+"_"+attribute //make a reference formatted "$charName_attributeName"
        let text = findObjs({ //look for a textbox with the reference in the controlledby feild
            _type: "text",
            _pageid: pageID,
            controlledby: name
        })[0];
        if (text) {
            //If the textbox exists, simply update it with current data
            text.set('text', obj.get('current'));
        } else {
            //If it doesnt...
            let playmat =  findObjs({ //find the playmat for the activating character
                _type: "graphic",
                name: char.get('name')+" playmat"
            })[0];
            let split = conditions[attribute].split(' '); //get the position info for the condition and split it into left and top
            createObj('text', { //make a textbox object in the proper position, with the new information
               _pageid: pageID,
               text: obj.get('current'),
               font_family: "Arial",
               font_size: 32,
               layer: 'objects',
               controlledby: name,
               color: 'rgb(255, 255, 255)',
               top: (playmat.get('top')-0.5*playmat.get('height'))+Number(split[1])/100*playmat.get('height'),
               left: (playmat.get('left')-0.5*playmat.get('width'))+Number(split[0])/100*playmat.get('width')
            });
        }
    } else {
        return;
    }
});

//Begin Build script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!build\b/i.test(msg.content)) {
        log('start');
        const section_field = (section, field, id = ':') => `repeating_${section}${id === ':' ? id : `_${id}_`}${section}_${field}`;
        const args = msg.content.split(/\s+--/);
        let bag = [];
        let i = 0;
        //locate the character if it exists
        let theCharacter = findObjs({
            _type: "character",
            name: args[1]
        })[0];
        
        if (theCharacter) { //if the character exists
            //initialize rune with the first rune in the repeating_actives section
            let rune = getAttrByName(theCharacter.id, `repeating_actives_$${i}_rune`);
            while (true) { //it's a whole thing, don't ask
                if (rune != 'void') { //ignore anything bound to the void rune
                    bag.push(rune); //put the rune in the bag
                }
                i++; //index rune
                rune = getAttrByName(theCharacter.id, `repeating_actives_$${i}_rune`); //get the next rune
                if (i>23) {break}; //do this 24 times because that's the maximum runes you can have in your bag. I know this is kludgy
                                    //I'm working on it
            };
        } else if (args[2]) { //if the character doesn't exist, but a list has been provided
            bag = args[2].split(/\,\s*/); //split the list into an array and put it in the bag
        } else {
            sendChat('Build', 'You must either provide a valid character name or a comma seperated list');
            return; //you done screwed things up if you get this
        }
        let deck = findObjs({ //get a deck with the name provided if one exists
            _type: "deck",
            name: args[1]
        })[0];
        if (!deck) { //if it doesn't exist, make it exist
            deck = createObj("deck", {
                name: args[1],
                avatar: "https://s3.amazonaws.com/files.d20.io/images/130886049/C2RPrAcXPokKekATxvHngg/thumb.png?1588553418",
                defaultwidth: 20,
                defaultheight: 30
            });
        } else { //if it does exist
            let deckCardIDs = deck.get('_currentDeck'); //get a string of the current card IDs
            deckCardIDs = deckCardIDs.split(','); //split them into an array
            deckCardIDs.forEach(cardID => { //delete them all
                let card = findObjs({
                    _id: cardID
                })[0];
                if (card) {card.remove()}; //but only if the card actually exists, 'cause sometimes it doesn't
            });
        }
        //at this point you should have an empty deck (either new or emptied out) and a bag of names
        bag.forEach(rune => { //for each name in the bag
            if (Object.keys(runes).includes(rune)) { //if it is a key in the runes constant
                createObj("card", { //make a card with the name and its designated image and put it in the bag
                    _deckid: deck.get("id"),
                    name: rune,
                    avatar: runes[rune]
                });
            }
        });
        shuffleDeck(deck.id) //damned if I know why, but if you don't do this then deck doesn't register the new cards and remove the old ones
    }
});

//Begin Alka Script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!alka\b/i.test(msg.content)) {
        const args = msg.content.split(/\s+--/);
        let campaign = findObjs({
            _type: "campaign"
        })[0];
        createObj("graphic", {
            subtype: 'token',
            pageid: campaign.get('playerpageid'),
            imgsrc: alka[args[1]],
            layer: "objects",
            left: 1000,
            top: 1000,
            width: 70,
            height: 70
        });
    }
});