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
    eihwas: 'https://s3.amazonaws.com/files.d20.io/images/146911139/5Eqsro-jfRfonKaJvDT2bA/thumb.png?1593392601',
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
        log('start wyrd');
        const args = msg.content.split(/\s+--/);
        //check to see if third argument specifies a zone other than 'hand', default to 'hand'
        if (!['stun', 'wounds1', 'wounds2', 'wounds3', 'death', 'drain'].includes(args[3])) {
            args[3]='hand';
        }
        //check to see if 4th argument specifies a layer other than 'objects', default to 'objects'
        if (!['gmlayer', 'map'].includes(args[4])) {
            args[4]='objects';
        }
        //getid of character
        let theCharacter = findObjs({
            _type: "character",
            name: args[1]
        })[0];
        //test if character exists
        if (!theCharacter) {
            sendChat('Wyrd', '/w gm Create a character named ' + args[1]);
            return;
        }
        //get the game type, should be rgs2 or rgs3
        let gametype = getAttrByName(theCharacter.id, 'gametype');
        
        //set placement coordinants based on game type
        if (gametype == 'rgs3') {
            var coords = {hand: [0.25, 0.0], stun: [0.45, -0.1], wounds1: [0.28, -0.25], wounds2: [0.22, -0.25], wounds3: [0.16, -0.25], death: [0.04, -0.25], drain: [-0.2, -0.25]};
        } else {
            var coords = {hand: [0.2, 0.2], stun: [0.1, -0.04], wounds1: [0.16, -0.16], wounds2: [-0.05, -0.27], wounds3: [-0.25, -0.42], death: [0.25, -0.27], drain: [0.4, -0.27]};
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
                toFront(cardObj);
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
        
         //getid of character
        let theCharacter = findObjs({
            _type: "character",
            name: args[1]
        })[0];
        //test if character exists
        if (!theCharacter) {
            sendChat('Wyrd', '/w gm Create a character named ' + args[1]);
            return;
        }
        //get the game type, should be rgs2 or rgs3
        let gametype = getAttrByName(theCharacter.id, 'gametype');
        
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
            if (!woundCheck(playmat, card, gametype) && !selectedArray.includes(card.id)) {
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

function woundCheck(playmat, card, gametype) { 
    //checks to see if a rune is in a specific zone of the playmat. Returns true if it is.
    let cardObj = findObjs({
        id: card.id
    })[0];
    let leftBound = playmat.get('left')-playmat.get('width')/2; //set left side of playmat
    let bottomBound = playmat.get('top')+playmat.get('height')/2; //set bottom side of playmat
    let topBound = playmat.get('top')-playmat.get('height')/2; //set top side of playmat
    if (leftBound < cardObj.get('left') &&                      //checks to see if rune is within playmat bounds and at least 60% down the graphic if the gametype is rgs2
    cardObj.get('left') < leftBound + playmat.get('width') &&
    cardObj.get('top') < bottomBound &&
    0.6*playmat.get('height')+topBound < cardObj.get('top') && gametype=='rgs2') {
        return true;
    } else if (leftBound < cardObj.get('left') &&                      //checks to see if rune is within playmat bounds and at least 60% down the graphic
    cardObj.get('left') < leftBound + playmat.get('width') &&
    cardObj.get('top') < bottomBound &&
    0.6*playmat.get('height')+topBound < cardObj.get('top') && 0.2*playmat.get('width')+leftBound < cardObj.get('left')  && gametype=='rgs3') {
        return true;
    } else {
        return false;
    }
}
//End helper functions for cleanup
//End cleanup script

//Begin Ability Update script
//On change of the gametype variable in a character sheet it deletes any previous
//Inflict ability on that character and replace it with an Inflict ability that matches the gametype
on('change:attribute', function(obj) {
    if (obj.get('name') == 'gametype') { 
        log('start update');
        let attribute = obj.get('name'); //get the name of the attribute
        let char = findObjs({ //get the character that changed the attribute
            _id: obj.get('_characterid')
        })[0];
        if (obj.get('current')=='rgs2') {
            let ability = findObjs({ //find any previous Inflict ability
                _type: "ability",
                _characterid: char.id,
                name: "Inflict"
            })[0];
            if (ability) {
                ability.remove(); //Yeet
            }
            createObj('ability', { //make the rgs2 style Inflict ability tied to the created character
               _characterid: char.id,
               _type: "ability",
               name: "Inflict",
               action: "!inflict --@{character_name} --?{Condition|Possession,possession|Taunt,taunt|Curse,curse|Vulnerable,vulnerable|Blind,blind|Degenerate,degenerate|Impeded,impeded|Rage,rage|Shroud,shroud|Aura,aura} --?{Intensity|0,0|1,1|2,2|3,3|4,4} --rgs2",
               istokenaction: true
            });
        } else if (obj.get('current')=='rgs3') {
            let ability = findObjs({ //find any previous Inflict ability
                _type: "ability",
                _characterid: char.id,
                name: "Inflict"
            })[0];
            if (ability) {
                ability.remove(); //Yeet
            }
            createObj('ability', { //make the rgs3 style Inflict ability tied to the created character
               _characterid: char.id,
               _type: "ability",
               name: "Inflict",
               action: "!inflict --@{character_name} --?{Condition|Alertness,alertness|Fury,fury|Possession,possession|Taunt,taunt|Vulnerable,vulnerable|Divine Favour,div favour|Divine Wrath,div wrath|Miracle,miracle|Trance,trance|Blind,blind|Drunk,drunk|Degenerate,degenerate|Impeded,impeded|Rage,rage|Shroud,shroud|Anger,anger|Brave,brave|Fear,fear|Friendly,friendly|Grief,grief|Humiliated,humiliated|Inspired,inspired|Remorse,remorse} --?{Intensity|0,0|1,1|2,2|3,3|4,4} --rgs3",
               istokenaction: true
            });
        } else {
            return;
        }
    } else {
        return;
    }
});

//Begin Build script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!build\b/i.test(msg.content)) {
        log('start build');
        //const section_field = (section, field, id = ':') => `repeating_${section}${id === ':' ? id : `_${id}_`}${section}_${field}`;
        const args = msg.content.split(/\s+--/);
        let bag = [];
        //let i = 0;
        //locate the character if it exists
        let theCharacter = findObjs({
            _type: "character",
            name: args[1]
        })[0];
        
        if (theCharacter) { //if the character exists
            //initialize rune with the first rune in the repeating_actives section
            let runes = getAttrByName(theCharacter.id, 'runeBag');
            //log(runes);
            if (!(_.isArray(runes))) {
                runes = runes.split(/\,\s*/);
                //log(runes);
            }
            for (const rune of runes) { //it's a whole thing, don't ask
                //log(rune);
                if (rune != 'void') { //ignore anything bound to the void rune
                    bag.push(rune); //put the rune in the bag
                }
            }
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
            //log(deckCardIDs);
            deckCardIDs = deckCardIDs.split(/\,\s*/); //split them into an array
            //log(deckCardIDs);
            deckCardIDs.forEach(cardID => { //delete them all
                let card = findObjs({
                    _id: cardID
                })[0];
                //log(card);
                if (card) {card.remove()}; //but only if the card actually exists, 'cause sometimes it doesn't
            });
        }
        //at this point you should have an empty deck (either new or emptied out) and a bag of names
        //log(deck.get('_currentDeck'));
        bag.forEach(rune => { //for each name in the bag
            if (Object.keys(runes).includes(rune)) { //if it is a key in the runes constant
                createObj("card", { //make a card with the name and its designated image and put it in the bag
                    _deckid: deck.get("id"),
                    name: rune,
                    avatar: runes[rune]
                });
                shuffleDeck(deck.id)
            }
        });
        //log(deck.get('currentDeck'));
        shuffleDeck(deck.id) //damned if I know why, but if you don't do this then deck doesn't register the new cards and remove the old ones
        //log(deck.get('currentDeck'));
    }
});

//Begin Alka Script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!alka\b/i.test(msg.content)) {
        log('start alka');
        const args = msg.content.split(/\s+--/); //args are --$alka_type
        let campaign = findObjs({
            _type: "campaign"
        })[0];
        createObj("graphic", { //make a graphic on the active page using the appropriate image
            subtype: 'token',
            pageid: campaign.get('playerpageid'),
            imgsrc: alka[args[1]],
            layer: "objects",
            controlledby: 'all',
            left: 1000,
            top: 1000,
            width: 70,
            height: 70
        });
    }
});

//Begin Inflict Script
on('chat:message', (msg) => {
    if ('api' === msg.type && /!inflict\b/i.test(msg.content)) {
        log('start inflict');
        const args = msg.content.split(/\s+--/); //args are --$character_name --$condition --$new_value --$rgs#
        const rgs2conditions = { //contains relative position of each condition box in percent from left, top
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
        const rgs3conditions = { //contains relative position of each condition box in percent from left, top
            'alertness':'74.5 19', 
            'fury':'74.5 29.5', 
            'possession':'74.5 40',
            'taunt':'74.5 50.5',
            'vulnerable':'77.5 62.5',
            'div favour':'81.5 19',
            'div wrath':'81.5 29.5',
            'miracle':'81.5 40',
            'trance':'81.5 50.5',
            'blind':'88.5 19',
            'drunk':'88.5 29.5',
            'degenerate':'88.5 40',
            'impeded':'88.5 50.5',
            'rage':'88.5 61',
            'shroud':'88.5 71.5',
            'anger':'95.5 19',
            'brave':'95.5 29.5',
            'fear':'95.5 40',
            'friendly':'95.5 50.5',
            'grief':'95.5 61',
            'humiliated':'95.5 71.5',
            'inspired':'95.5 82',
            'remorse':'95.5 92.5'
        }
        let name = args[1]+" playmat "+args[2]; //$character_name playmat $condition
        let campaign = findObjs({
            _type: "campaign"
        })[0];
        log(name);
        let theCharacter = findObjs({
            _type: "character",
            name: args[1]
        })[0];
        if (!theCharacter) {
            sendChat('Inflict', '/w gm Create a character named ' + args[1]);
            return;
        }
        //Playmat graphic must be named $character_name+" playmat". One space and lower case p
        let playmat = findObjs({ //find the playmat for the character
            _type: "graphic",
            name: args[1]+" playmat"
        })[0];
        //Check to make sure the playmat exists
        if (!playmat) {
            sendChat('Inflict', '/w gm You need to name ' + args[1] + ' playmat');
            return;
        }
        //get the game type, should be rgs2 or rgs3
        let gametype = getAttrByName(theCharacter.id, 'gametype');
        if (gametype =='rgs2') {
            var conditions = rgs2conditions;
        } else if (gametype == 'rgs3') {
            var conditions = rgs3conditions;
        } else {
            return;
        }
        let pageID = findObjs({ //get the playmats page
            name: "Playmats"
        })[0].id;
        
        let text = findObjs({ //look for a textbox with the reference in the controlledby feild
            _type: "text",
            _pageid: pageID,
            controlledby: `${name},${'all'}`
        })[0];
        if (text) {
            //If the textbox exists, simply update it with current data
            text.set('text', args[3]);
        } else {
            //If it doesn't...
            let split = conditions[args[2]].split(' '); //get the position info for the condition and split it into left and top
            createObj('text', { //make a textbox object in the proper position, with the new information
               _pageid: pageID,
               text: args[3],
               font_family: "Arial",
               font_size: 32,
               layer: 'objects',
               controlledby: `${name},${'all'}`,
               color: 'rgb(255, 255, 255)',
               top: (playmat.get('top')-0.5*playmat.get('height'))+Number(split[1])/100*playmat.get('height'),
               left: (playmat.get('left')-0.5*playmat.get('width'))+Number(split[0])/100*playmat.get('width')
            });
        }
    }
});

//Begin function to add abilities to newly created characters
on('ready', function() { //this makes it not happen whenever the api server is started
    on('add:character', function(obj) { //this makes it happen whenever a new character is added. obj is the character
        log('new character created')
        log(obj);
        log(obj.id);
        createObj('ability', { //make the Wyrd ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Wyrd",
           action: "!wyrd --@{character_name} --@{Destiny}",
           istokenaction: true
        });
        createObj('ability', { //make the Cleanup ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Cleanup",
           action: "!cleanup --@{character_name}\n!cleanup --@{character_name}",
           istokenaction: true
        });
        createObj('ability', { //make the Inflict ability tied to the created character, this is the rgs2 version
           _characterid: obj.id,
           _type: "ability",
           name: "Inflict",
           action: "!inflict --@{character_name} --?{Condition|Possession,possession|Taunt,taunt|Curse,curse|Vulnerable,vulnerable|Blind,blind|Degenerate,degenerate|Impeded,impeded|Rage,rage|Shroud,shroud|Aura,aura} --?{Intensity|0,0|1,1|2,2|3,3|4,4} --rgs2",
           istokenaction: true
        });
        createObj('ability', { //make the Stun ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Stun",
           action: "!wyrd --@{character_name} --1 --stun",
           istokenaction: true
        });
        createObj('ability', { //make the Initiative ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Initiative",
           action: "/roll 1d100 &{tracker}",
           istokenaction: true
        });
        createObj('ability', { //make the Build ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Build",
           action: "!build --@{character_name}",
           istokenaction: true
        });
        createObj('ability', { //make the Playmats ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Playmats",
           action: "!mc move --target Playmats",
           istokenaction: false
        });
        createObj('ability', { //make the Rejoin ability tied to the created character
           _characterid: obj.id,
           _type: "ability",
           name: "Rejoin",
           action: "!mc rejoin",
           istokenaction: false
        });
        createObj('attribute', {
            _characterid: obj.id,
            _type: "attribute",
            name: "gametype",
            current: 'rgs2'
        });
    });
});

on('chat:message', (msg) => {
    if ('api' === msg.type && /!start\b/i.test(msg.content)) {
        log('start start');
        const args = msg.content.split(/\s+--/); //args are --$campeign_type
        let page = findObjs({
            _type: "page",
            name: "Playmats"
        })[0];
        //log(page.id);
        let campaign = findObjs({
            _type: "campaign"
        })[0];
        if (!page) {
            log('creating page');
            let page = findObjs({
                _type: "page",
                _id: campaign.get('playerpageid')
            })[0];
            page.set({
                name: "Playmats",
                showgrid: false
            });
            log('created page');
        }
        page = findObjs({
            name: "Playmats"
        })[0];
        if (args[1] == 'rgs3') {
            createObj("graphic", { //make a graphic on the active page using the appropriate image
                subtype: 'token',
                pageid: page.id,
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/226419586/mVWbXinw6hz4JymnqjPPYA/thumb.png?1622761963",
                layer: "map",
                controlledby: 'all',
                left: 383,
                top: 281,
                width: 766,
                height: 560
            });
        } else if (args[1] =='rgs2') {
            createObj("graphic", { //make a graphic on the active page using the appropriate image
                subtype: 'token',
                pageid: page.id,
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/203894833/lFymYZsThqwmnam4HItmTQ/thumb.jpg?1614287284",
                layer: "map",
                controlledby: 'all',
                left: 383,
                top: 281,
                width: 560,
                height: 766
            });
        }
    }
});

//Begin script to add a README handout to a campaign
on('add:campaign', (obj) => { //should trigger whenever an api server is started
    on('ready', function() { //But not until after everything is loaded
        let handout = findObjs({ //Check for the existance of a README handout
            _type: "handout",
            name: "README"
        })[0];
        log('start handout');
        if (!handout) { //If there is not currently a README handout, make one
            let text = '<p>Skall! Welcome to the Fate of the Norns Companion Script. This script will enhance the Fate of the Norns character sheet, which it should be used with. You should also download and enable the MapChange script as you will need to move back and forth between your character map and the Playmats map frequently. The first thing you should do if this is a new campaign is to run the !start script. To do this simply type:</p><p>!start --rgs#</p><p>in the chat window. Replace the # with 2 or 3 depending on if you are using RGS2 (Fate of the Norns 2nd edition) or RGS3 (the new system for Children of Eriu). Commands for the FotN Companion should always use lower case letters and a single space between options. The !start script will format and rename the map with the players marker to Playmats and place an appropriate playmat on the maps layer. This playmat can be copied for your players and NPCs. In order for the map to recognize a playmat as belonging to a particular character the playmat needs to be named \"$character_name playmat\". The character name must match one of the characters and must be spelled exactly as it appears in the character name field of that character (including case). That should be followed by a single space and \"playmat\" in lower case. You will need a playmat for each character and they must be on the Playmats map.&nbsp;</p><p>Whenever a new character is created it will automatically have four abilities in the Attributes &amp; Abilities tab. These are: Wyrd, Cleanup, Inflict, and Stun. It would be a good idea to check the \"show in macro bar\" box for these abilities on your character.&nbsp;</p><p>Once you have filled in your character sheet you need to build your rune deck. To do this type the following into the chat:</p><p>!build --$character_name</p><p>This will take the runes you have selected for your Active abilities (except the void rune) and create a deck named after the character based on them. Use the top empty box for your void rune, the red, blue, and green boxes at the bottom will place generic colored runes in your deck (a useful tool for norns building denizens).&nbsp;</p><p>Once you have a deck, you can use the Wyrd ability to play your destiny in runes to the in-hand portion of the playmat. The Stun ability will place a rune directly from your deck to the stun section of the playmat. Cleanup will take runes from the playmat and return them to your deck. Cleanup will automatically ignore runes in Wounds, Death, and Drain. If you wish to leave other runes on the playmat (for instance runes that are maintained) you must have them selected when running the Cleanup command (use shift to select more than one rune). The Inflict ability will prompt you for the condition and value and then mark that value on the playmat.</p><p>You can manually trigger any of the abilities or other scripts by typing their commands into the chat. The format is:</p><p>!wyrd --$character_name --$#_runes --$playmat_zone(optional) --$layer(optional)</p><p>!cleanup --$character_name</p><p>!build --$character_name --$list_of_runes(optional)</p><p>!alka --$type</p><p>For !wyrd the playmat zone can be stun, wounds2, death, or drain. If not specified it will play to in-hand. The layer can be objects, gmlayer, or maps. if not specified it will play to the objects layer. </p><p>For !build, a character that does not exist can be used if and only if a comma separated list of quoted rune names is provided (in case you want to build a deck on the fly). So, </p><p>!build --Bob --\'ing\', \'ehwo\', \'kenaz\'</p><p>would check if a character named Bob exists, and if it doesn\'t it will build a deck named Bob with the ing, ehwo, and kenaz runes in it. !build can accept any of the standard runes as input, as well as \'mental\', \'physical\', and \'spiritual\' I use the rune spelling from the FotN core book. The !build command can be run on a character that already has a rune deck and it will update that deck with their current rune list.</p><p>!alka will play an alka token to the middle of the current player map. The types are fire, ice, or magic.</p><p>Known issues/Bugs:&nbsp;</p><p>1) For some reason the !cleanup command must sometimes be issued twice to work. The ability preloaded into characters does this automatically, but if you are triggering it manually you may need to do it twice.</p><p>2) Occasionally the rune images may become unlinked from their card objects and remain on the playmat after cleanup. You can always manually delete those images from the playmat and it will not affect the deck.</p><p>3) The list of runes on your character sheet actually tracks changes to the list, not the check boxes themselves. If for some reason !build is not accurately building the deck, uncheck all the runes under Actives, got to the Attributes &amp; Abilities tab for that character and delete the current value for runeBag, and then re-check the runes under actives.&nbsp;</p>';
            createObj("handout", {
                name: "README",
                inplayerjournals: "all"
            });
            let newhandout = findObjs({ //I guess you have to set notes after the handout is created?
                _type: "handout",
                name: "README"
            })[0];
            newhandout.set({notes: text});
        }
    });
}); //End README script