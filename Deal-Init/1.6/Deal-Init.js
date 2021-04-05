// Github:   https://github.com/pelwer1/Deal-Init
// By:       Pat Elwer
// Contact:  https://app.roll20.net/users/8948/pat
// Help:     !deal-init --help

// on deck
// o Once and only once in deal()

//Rev History
// 0.4 minimize chat output
// 0.5 fancy card symbols - thanks Aaron!
// 0.6 skipping tokens that are still On Hold a the end of the round - thanks GV!
//     stopped setting init value of Round counters to -1 - thanks GV!
// 0.7 Fixed bug where hold was being interpreted as a joker - thanks Maetco!
// 0.8 Added verbose mode to track Joker handling
// 0.9 added --onlyTo as means to deal to specified cards from command line. Ignores Hold state  
//     Use if adding a token after dealing or to take someone off hold after dealing.
// 1.0 addded support for --deal2chat and Tactician/Master Tactician Edges from SWADE
// 1.1 added support for Hesitant Hindrance (HH) from SWADE  (thanks to Jeff B!)
// 1.2 added support for 1 click install
// 1.3 added global option for a 4 joker deck
// 1.4 ripped out global config code and made 4 joker deck a new command line option: 4jreset
// 1.5 bug fix for Hesitant Hindrance when first card is a Joker; set fourJokers = 0 when using --reset
// 1.6 added --clearTurnOrder to reset run order after changing pages

// used by jslint tool:  http://www.jslint.com/
/* jslint
   for, fudge, this, white
*/
/* global
   Campaign, sendChat, getObj, getAttrByName
*/
/* property
    CheckInstall, RegisterEventHandlers, addCard, cardCount, cardRank, cards,
    clone, combine, concat, content, custom, deal, draw, edges, floor, get, id,
    indexOf, length, longName, makeDeck, name, parse, playerid, pr, push,
    random, rank, replace, reverse, set, shift, shortName, shortname, shuffle,
    sortBy, splice, split, stringify, substr, toktype, type
*/

/* used by js beautifier https://beautifier.io/
{
  "indent_size": "2",
  "indent_char": " ",
  "max_preserve_newlines": "2",
  "preserve_newlines": true,
  "keep_array_indentation": false,
  "break_chained_methods": false,
  "indent_scripts": "normal",
  "brace_style": "collapse",
  "space_before_conditional": true,
  "unescape_strings": false,
  "jslint_happy": false,
  "end_with_newline": false,
  "wrap_line_length": "0",
  "indent_inner_html": false,
  "comma_first": false,
  "e4x": false,
  "indent_empty_lines": false
}
*/

/* Validation Flow
- Command line options
- Edges
  Qui = Quick
  LH  = Level Headed
  ILH = Improved Level Headed
  TT  = Tactician (cards dealt to chat)
  MTT = Master Tactician (cards dealt to chat)
  HH  = Hesitant Hindrance 
  WCE = Any Joker Activated Wild Card Edge (announced in turn order)

- On Hold
- Joker Events
- Sorting
- Token not associated with characters
- Custom items (non token entry in turn order)
*/
var DealInit = DealInit || (function() {
  'use strict';

  var version = '1.6',
    lastUpdate = '[Last Update: Jan 17, 2021, 5pm Pacific]',
    jokerLastRound = 0,
    jokerInChat = 0,
    fourJokers = 0,
    onlyToString = '',
    dealToChat = 0,
    verboseMode = 0,
    chatOutputLength = 4,
    deck = {},
    hand = {},
    discards = {},
    initEdges = [],

    divStart = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' +
    '<div style="font-weight: bold; border-bottom: 1px solid black;">',
    divEnd = '</div>',

    //-----------------------------------------------------------------------------
    // Card constructor function.
    //-----------------------------------------------------------------------------
    Card = function(cardRank, shortName, longName) {

      this.cardRank = cardRank; //0-55 for init sorting, higher # = higher initiative 
      this.shortName = shortName; // short name for display in turn order e.g. JH 
      this.longName = longName; // long name for human readable messages e.g Jack of Hearts

    },

    //=============================================================================
    // Stack Object
    //=============================================================================

    //-----------------------------------------------------------------------------
    // Stack constructor function.
    //-----------------------------------------------------------------------------

    Stack = function() {

      // Create an empty array of cards.

      this.cards = [];

      this.makeDeck = stackMakeDeck;
      this.shuffle = stackShuffle;
      this.deal = stackDeal;
      this.draw = stackDraw;
      this.addCard = stackAddCard;
      this.combine = stackCombine;
      this.cardCount = stackCardCount;
    },

    //-----------------------------------------------------------------------------
    // stackMakeDeck(n): Initializes a stack using 1 deck of cards.
    //-----------------------------------------------------------------------------
    stackMakeDeck = function() {

      // create array of cards to hold the deck
      this.cards = [];

      // fill card deck array with cards: cardRank, shortName,longName)
      // this.cards[0]  = new Card( 0, "2C,"2 of Clubs" );
      this.cards[0] = new Card(0, "2&" + "clubs;", "2 of Clubs");
      this.cards[1] = new Card(1, "2&" + "diams;", "2 of Diamonds");
      this.cards[2] = new Card(2, "2&" + "hearts;", "2 of Hearts");
      this.cards[3] = new Card(3, "2&" + "spades;", "2 of Spades");
      this.cards[4] = new Card(4, "3&" + "clubs;", "3 of Clubs");
      this.cards[5] = new Card(5, "3&" + "diams;", "3 of Diamonds");
      this.cards[6] = new Card(6, "3&" + "hearts;", "3 of Hearts");
      this.cards[7] = new Card(7, "3&" + "spades;", "3 of Spades");
      this.cards[8] = new Card(8, "4&" + "clubs;", "4 of Clubs");
      this.cards[9] = new Card(9, "4&" + "diams;", "4 of Diamonds");
      this.cards[10] = new Card(10, "4&" + "hearts;", "4 of Hearts");
      this.cards[11] = new Card(11, "4&" + "spades;", "4 of Spades");
      this.cards[12] = new Card(12, "5&" + "clubs;", "5 of Clubs");
      this.cards[13] = new Card(13, "5&" + "diams;", "5 of Diamonds");
      this.cards[14] = new Card(14, "5&" + "hearts;", "5 of Hearts");
      this.cards[15] = new Card(15, "5&" + "spades;", "5 of Spades");
      this.cards[16] = new Card(16, "6&" + "clubs;", "6 of Clubs");
      this.cards[17] = new Card(17, "6&" + "diams;", "6 of Diamonds");
      this.cards[18] = new Card(18, "6&" + "hearts;", "6 of Hearts");
      this.cards[19] = new Card(19, "6&" + "spades;", "6 of Spades");
      this.cards[20] = new Card(20, "7&" + "clubs;", "7 of Clubs");
      this.cards[21] = new Card(21, "7&" + "diams;", "7 of Diamonds");
      this.cards[22] = new Card(22, "7&" + "hearts;", "7 of Hearts");
      this.cards[23] = new Card(23, "7&" + "spades;", "7 of Spades");
      this.cards[24] = new Card(24, "8&" + "clubs;", "8 of Clubs");
      this.cards[25] = new Card(25, "8&" + "diams;", "8 of Diamonds");
      this.cards[26] = new Card(26, "8&" + "hearts;", "8 of Hearts");
      this.cards[27] = new Card(27, "8&" + "spades;", "8 of Spades");
      this.cards[28] = new Card(28, "9&" + "clubs;", "9 of Clubs");
      this.cards[29] = new Card(29, "9&" + "diams;", "9 of Diamonds");
      this.cards[30] = new Card(30, "9&" + "hearts;", "9 of Hearts");
      this.cards[31] = new Card(31, "9&" + "spades;", "9 of Spades");
      this.cards[32] = new Card(32, "10&" + "clubs;", "10 of Clubs");
      this.cards[33] = new Card(33, "10&" + "diams;", "10 of Diamonds");
      this.cards[34] = new Card(34, "10&" + "hearts;", "10 of Hearts");
      this.cards[35] = new Card(35, "10&" + "spades;", "10 of Spades");
      this.cards[36] = new Card(36, "J&" + "clubs;", "Jack of Clubs");
      this.cards[37] = new Card(37, "J&" + "diams;", "Jack of Diamonds");
      this.cards[38] = new Card(38, "J&" + "hearts;", "Jack of Hearts");
      this.cards[39] = new Card(39, "J&" + "spades;", "Jack of Spades");
      this.cards[40] = new Card(40, "Q&" + "clubs;", "Queen of Clubs");
      this.cards[41] = new Card(41, "Q&" + "diams;", "Queen of Diamonds");
      this.cards[42] = new Card(42, "Q&" + "hearts;", "Queen of Hearts");
      this.cards[43] = new Card(43, "Q&" + "spades;", "Queen of Spades");
      this.cards[44] = new Card(44, "K&" + "clubs;", "King of Clubs");
      this.cards[45] = new Card(45, "K&" + "diams;", "King of Diamonds");
      this.cards[46] = new Card(46, "K&" + "hearts;", "King of Hearts");
      this.cards[47] = new Card(47, "K&" + "spades;", "King of Spades");
      this.cards[48] = new Card(48, "A&" + "clubs;", "Ace of Clubs");
      this.cards[49] = new Card(49, "A&" + "diams;", "Ace of Diamonds");
      this.cards[50] = new Card(50, "A&" + "hearts;", "Ace of Hearts");
      this.cards[51] = new Card(51, "A&" + "spades;", "Ace of Spades");
      this.cards[52] = new Card(52, "BJo", "Black Joker");
      this.cards[53] = new Card(53, "RJo", "Red Joker");
      if (fourJokers > 0) {
        this.cards[54] = new Card(54, "SJo", "Silver Joker");
        this.cards[55] = new Card(55, "YJo", "Yellow Joker");
      }
      // note: Tokens on hold are set = 60 to keep them at the top of the init order
    },

    //-----------------------------------------------------------------------------
    // stackShuffle(n): Shuffles a stack of cards 'n' times. 
    //-----------------------------------------------------------------------------

    stackShuffle = function(n) {

      var i, j, k;
      var temp;

      // Shuffle the stack 'n' times.

      for (i = 0; i < n; i += 1) {
        for (j = 0; j < this.cards.length; j += 1) {
          k = Math.floor(Math.random() * this.cards.length);
          temp = this.cards[j];
          this.cards[j] = this.cards[k];
          this.cards[k] = temp;
        }
      }
    },

    //-----------------------------------------------------------------------------
    // stackDeal(): Removes the first card in the stack and returns it.
    //-----------------------------------------------------------------------------

    stackDeal = function() {

      if (this.cards.length > 0) {
        return this.cards.shift();
      } else {
        // jump to shuffle instead of return null?
        sendChat('', '/em Big Trouble - Trying to Draw a Card from an Empty Deck!');
        sendChat('', '/em Please report the conditions that caused this to the developer and restart the API server');
        sendChat('', '/em Contact:  https://app.roll20.net/users/8948/pat');
        return null;

      }

    },

    //-----------------------------------------------------------------------------
    // stackDraw(n): Removes the specified card from the stack and returns it.
    //-----------------------------------------------------------------------------

    stackDraw = function(n) {

      var card;

      if (n >= 0 && n < this.cards.length) {
        card = this.cards[n];
        this.cards.splice(n, 1);
      } else {
        card = null;
      }
      return card;
    },

    //-----------------------------------------------------------------------------
    // stackAdd(card): Adds the given card to the stack.
    //-----------------------------------------------------------------------------
    stackAddCard = function(card) {

      this.cards.push(card);
    },

    //-----------------------------------------------------------------------------
    // stackCombine(stack): Adds the cards in the given stack to the current one.
    // The given stack is emptied.
    //-----------------------------------------------------------------------------

    stackCombine = function(stack) {

      this.cards = this.cards.concat(stack.cards);
      stack.cards = [];
    },

    //-----------------------------------------------------------------------------
    // stackCardCount(): Returns the number of cards currently in the stack.
    //-----------------------------------------------------------------------------
    stackCardCount = function() {

      return this.cards.length;
    },

    //-----------------------------------------------------------------------------
    // createDeck(): creates and shuffles init deck.  Use at start of scene.
    //-----------------------------------------------------------------------------
    createDeck = function(id) {

      deck = new Stack();
      hand = new Stack();
      discards = new Stack();

      deck.makeDeck();

      // var  who=getObj('player',id).get('_displayname').split(' ')[0];
      // sendChat('','/w '+who+" Action Deck reset." );
      shuffle();
      jokerLastRound = 0;
      if (verboseMode) {
        var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
        sendChat('', '/w ' + whoVM + " VERBOSE: CreateDeck Function: JokerLastRound set to 0.");
      }
    },

    //-----------------------------------------------------------------------------
    // shuffle(): Returns shuffled deck
    //-----------------------------------------------------------------------------
    shuffle = function() {

      if (deck === null) {
        return;
      }

      deck.shuffle(1);
      sendChat('', '/em Action Deck shuffled.');
    },

    // Turn Order: from API guide
    // [
    //     {
    //      "id":"36CA8D77-CF43-48D1-8682-FA2F5DFD495F", //The ID of the Graphic object. If this is set, the turn order list will automatically pull the name and icon for the list based on the graphic on the tabletop.
    //      "pr":"0", //The current value for the item in the list. Can be a number or text.
    //      "custom":"" //Custom title for the item. Will be ignored if ID is set to a value other than "-1".
    //     },
    //     {
    //      "id":"-1", //For custom items, the ID MUST be set to "-1" (note that this is a STRING not a NUMBER.
    //      "pr":"12",
    //      "custom":"Test Custom" //The name to be displayed for custom items.
    //     }
    // ]
    //
    // initEdges :
    // [
    //     {  // token that represents a character
    //      "id":"36CA8D77-CF43-48D1-8682-FA2F5DFD495F", //The ID of the Graphic object. If this is set, the turn order list will automatically pull the name and icon for the list based on the graphic on the tabletop.
    //      "edges":"LH,Qu", // or "0" The current value for the item in the list. Can be a number or text.
    //      "name":"Prospero" //Custom title for the item. Will be ignored if ID is set to a value other than "-1".
    //     },
    //     {   // custom item
    //      "id":"-1", //For custom items, the ID MUST be set to "-1" (note that this is a STRING not a NUMBER.
    //      "edges":"SKIP",  // set edges skip to not deal it a card
    //      "name":"Custom Name" //The name to be displayed for custom items.
    //     }
    //     {   // token that doesn't represent a character
    //      "id":"36CA8D77-CF43-48D1-8682-FA2F5DFD495F", //The ID of the Graphic object.
    //      "edges":"0",  // set edges 0 - one card only
    //      "name":"Token name" //The name to be displayed for custom items.
    //     }
    // ]
    //
    // Card = function(cardRank, shortName,longName) {
    //
    //  this.cardRank = cardRank;   //0-53 for init sorting, higher # = higher initiative 
    //  this.shortName = shortName; // short name for display in turn order e.g. JH 
    //  this.longName = longName;   // long name for human readable messages e.g Jack of Hearts

    //-----------------------------------------------------------------------------
    // discard(): moves cards in turn order into the discard pile in preparation for dealing
    //-----------------------------------------------------------------------------
    discard = function() {

      if (!hand.cards) {
        return;
      }

      discards.combine(hand);

    },

    //-----------------------------------------------------------------------------
    // reset(): Moves all cards back into the deck in preparation for shuffle
    //-----------------------------------------------------------------------------
    reset = function() {

      if (!discards.cards) {
        return;
      }

      discards.combine(hand);
      deck.combine(discards);

    },

    //-----------------------------------------------------------------------------
    // display(): sends contents of deck, hand, discard piles to chat
    //-----------------------------------------------------------------------------
    display = function(id) {

      var s, i;
      var who = getObj('player', id).get('_displayname').split(' ')[0];

      if (!deck.cards) {
        sendChat('', '/w ' + who + '  Deck not built!  Run: !deal-init --reset');
        return;

      }

      s = "";
      for (i = 0; i < deck.cardCount(); i += 1) {
        s += deck.cards[i].cardRank + ',' + deck.cards[i].shortName + ',' + deck.cards[i].longName + "<p>";
      }
      sendChat('', '/w ' + who + ' ' + divStart + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
        'DealInit: Deck Cards</div>' + s + divEnd);

      s = "";
      for (i = 0; i < hand.cardCount(); i += 1) {
        s += hand.cards[i].cardRank + ',' + hand.cards[i].shortName + ',' + hand.cards[i].longName + "<p>";
      }
      sendChat('', '/w ' + who + ' ' + divStart + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
        'DealInit: Turn Order</div>' + s + divEnd);

      s = "";
      for (i = 0; i < discards.cardCount(); i += 1) {
        s += discards.cards[i].cardRank + ',' + discards.cards[i].shortName + ',' + discards.cards[i].longName + "<p>";
      }
      sendChat('', '/w ' + who + ' ' + divStart + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
        'DealInit: Discards</div>' + s + divEnd);
    },

    // See code from turn marker - create object called TurnOrder with methods

    // turn order data structure from API guide
    // [
    //     {
    //      "id":"36CA8D77-CF43-48D1-8682-FA2F5DFD495F", //The ID of the Graphic object. If this is set, the turn order list will automatically pull the name and icon for the list based on the graphic on the tabletop.
    //      "pr":"0", //The current value for the item in the list. Can be a number or text.
    //      "custom":"" //Custom title for the item. Will be ignored if ID is set to a value other than "-1".
    //     },
    //     {
    //      "id":"-1", //For custom items, the ID MUST be set to "-1" (note that this is a STRING not a NUMBER.
    //      "pr":"12",
    //      "custom":"Test Custom" //The name to be displayed for custom items.
    //     }
    // ]

    //-----------------------------------------------------------------------------
    // getTurnOrder(): Read Turn Order and load into a hash
    //-----------------------------------------------------------------------------
    // To work with the turn order, you will want to use JSON.parse() to get an object representing the 
    // current turn order state (NOTE: Check to make sure it's not an empty string "" first...if it is, 
    // initialize it yourself with an empty array).
    getTurnOrder = function() {
      var to = Campaign().get("turnorder");
      to = ('' === to ? '[]' : to);
      return JSON.parse(to);
    },

    //-----------------------------------------------------------------------------
    // getInitiativeEdges(): Read Init Edges from characters (if any) and store in hash
    //-----------------------------------------------------------------------------
    // To modify the turn order, edit the current turn order object and then use 
    // JSON.stringify() to change the attribute on the Campaign. Note that the 
    // ordering for the turn order in the list is the same as the order of the array, 
    // so for example push() adds an item onto the end of the list, unshift() adds to the beginning, etc.
    //
    // initEdges :
    // [
    //     {  // token that represents a character
    //      "id":"36CA8D77-CF43-48D1-8682-FA2F5DFD495F", //The ID of the Graphic object. If this is set, the turn order list will automatically pull the name and icon for the list based on the graphic on the tabletop.
    //      "edges":"LH,Qu", // or "0" The current value for the item in the list. Can be a number or text.
    //      "name":"Prospero" //Custom title for the item. Will be ignored if ID is set to a value other than "-1".
    //      "toktype": "pc // Token Type "pc" or "npc", used to control who see which messages
    //     },
    //     {   // custom item
    //      "id":"-1", //For custom items, the ID MUST be set to "-1" (note that this is a STRING not a NUMBER.
    //      "edges":"SKIP",  // set edges skip to not deal it a card
    //      "name":"Custom Name" //The name to be displayed for custom items.
    //      "toktype": "npc // Token Type "pc" or "npc"
    //     }
    //     {   // token that doesn't represent a character
    //      "id":"36CA8D77-CF43-48D1-8682-FA2F5DFD495F", //The ID of the Graphic object.
    //      "edges":"0",  // set edges 0 - one card only
    //      "name":"Token name" //The name to be displayed for custom items.
    //      "toktype": "npc // Token Type "pc" or "npc"
    //     }
    // ]
    getInitiativeEdges = function(id) {

      var char_edges = "";
      var char_name = "";
      var turn_order_name = "";
      var turn_order_short_name = "";
      var turnorder = getTurnOrder();
      var i;
      var s = "";
      var who = getObj('player', id).get('_displayname').split(' ')[0];
      if (!turnorder.length) {
        sendChat('', '/w ' + who + ' ' + divStart + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
          'DealInit: Turn Order is Empty - Bailing Out! </div>' + divEnd);
        return;
      }

      var token_obj = {};
      var char_obj = {};
      var toid, controler, tokenOnHold, tokentype;

      // get associated character from each token in turn order
      for (i = 0; i < turnorder.length; i += 1) {
        // sendChat('',divStart + 'DealInit: TO ID: '+ turnorder[i].id + divEnd );
        toid = turnorder[i].id;
        tokenOnHold = 0;
        if (turnorder[i].pr === "H" || turnorder[i].pr === "h") {
          tokenOnHold = 1;
          char_name = getObj("graphic", toid).get("name");
          sendChat('', '/w gm ' + char_name + ' is On Hold this round!');
        }

        // if the turn order item is a "custom item", mark it as a skip for dealing init
        if (toid === "-1") {
          if (turnorder[i].custom.substr(0, chatOutputLength)) {
            turn_order_short_name = turnorder[i].custom.substr(0, chatOutputLength)
          } else {
            turn_order_short_name = "?"
          }
          initEdges[i] = {
            id: toid,
            edges: "SKIP",
            name: turnorder[i].custom,
            toktype: "npc",
            shortname: turn_order_short_name
          };

        }
        // if the turn order item is a "token that doesn't represent a character", set InitEdges to 0
        else if (!getObj("character", getObj("graphic", toid).get("represents"))) {
          // from the graphic id, get the token object
          token_obj = getObj("graphic", toid);
          // determine who controls the token
          controler = token_obj.get("controlledby");
          if (controler === '' || playerIsGM(controler)) {
            tokentype = 'npc';
          } else {
            tokentype = 'pc';
          }

          char_name = getObj("graphic", toid).get("name");
          // handle the turn marker token
          if (char_name.indexOf('Round') !== -1) {
            char_edges = "SKIP";
          } else if (tokenOnHold === 1) {
            char_edges = "HOLD";
          } else {
            char_edges = "0";
          }
          if (char_name.substr(0, chatOutputLength)) {
            turn_order_short_name = char_name.substr(0, chatOutputLength)
          } else {
            turn_order_short_name = "??"
          }

          initEdges[i] = {
            id: toid,
            edges: char_edges,
            name: char_name,
            toktype: tokentype,
            shortname: turn_order_short_name
          };

          // sendChat('','Player type : '+tokentype+ '<br>Name: '+ initEdges[i].name);
        }
        // turn order item is a "token that represents a character", look for init edges 
        else if (getObj("character", getObj("graphic", toid).get("represents"))) {

          // from the graphic id, get the token object
          token_obj = getObj("graphic", toid);
          // determine who controls the token
          controler = token_obj.get("controlledby");
          // sendChat('','controlled by: '+controler);
          if (controler === '' || playerIsGM(controler)) {
            tokentype = 'npc';
          } else {
            tokentype = 'pc';
          }
          // from the token object, get the character that it reperesents
          char_obj = getObj("character", token_obj.get("represents"));
          // get the name of the character
          char_name = char_obj.get("name");
          turn_order_name = getObj("graphic", toid).get("name");

          char_edges = "0";
          if (char_obj !== "") {
            // the get "current" value of InitEdges, if any
            if (!getAttrByName(char_obj.id, "InitEdges")) {
              char_edges = "0";
              if (!dealToChat) {
                sendChat('', '/w gm No Init Edges for: ' + char_name);
              }
            } else {
              char_edges = getAttrByName(char_obj.id, "InitEdges");
            }
            // turn marker gets here
            // sendChat('', 'looking for round in name: ' + char_name + ' index: ' + char_name.indexOf('Round'));
            if (char_name.indexOf('Round') !== -1) {
              char_edges = "SKIP";
            }
            if (tokenOnHold === 1) {
              char_edges = "HOLD";
            }
          }
          // for --onlyto to work intuitively we must use token names in the initedges array.  
          // Otherwise users are trying to match character names and not token names - token names are displayed in the turnorder
          // initEdges[i] = { id : toid, edges : char_edges, name: char_name, toktype: tokentype, shortname: char_name.substr(0, chatOutputLength)  };
          if (char_name.substr(0, chatOutputLength)) {
            turn_order_short_name = char_name.substr(0, chatOutputLength)
          } else {
            turn_order_short_name = "???"
          }
          initEdges[i] = {
            id: toid,
            edges: char_edges,
            name: turn_order_name,
            toktype: tokentype,
            shortname: turn_order_short_name
          };

        } else {
          // if some script uses a token in turn order that doesn't follow the rules, I initialize the obj to make it safe
          initEdges[i] = {
            id: toid,
            edges: "SKIP",
            name: "unknown",
            toktype: "npc",
            shortname: "????"
          };
        }
        if (verboseMode) {
          var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
          sendChat('', '/w ' + whoVM + " VERBOSE: " + divStart + 'DealInit: Character <p>Name: ' + initEdges[i].name + '<p>Edges: ' + initEdges[i].edges + '<p>ID: ' + initEdges[i].id + '<p>Token Type: ' + initEdges[i].toktype + '<p>Short name: ' + initEdges[i].shortname + divEnd);
        }
      } // next i
      // log(initEdges);

    },

    //-----------------------------------------------------------------------------
    // doTheDeal(): Deals cards to turn order items and sorts
    //-----------------------------------------------------------------------------
    doTheDeal = function(id) {

      var i;
      var who = getObj('player', id).get('_displayname').split(' ')[0];
      var sendto = "";
      var onlyToActive = 0;
      var dealToChatActive = 0;
      var turnorder = getTurnOrder();

      // detect --onlyto usage
      if (onlyToString.length > 0) {
        onlyToActive = 1;
        sendChat('', '/w gm onlyto active.  Looking for string: ' + '<u>' + onlyToString + '</u>');
      }

      // detect --deal2chat usage
      if (dealToChat) {
        dealToChatActive = 1;
      }

      // build deck if needed (ok for --onlyto)
      if (!deck.cards) {
        createDeck(id);
        shuffle();
      }

      // move hand (current turn order) to discard pile
      // if --onlyto or --deal2chat is in use do not disturb the other cards previous dealt for this round
      if (hand.cards && !onlyToActive && !dealToChat) {
        discards.combine(hand);
      }

      // shuffle if deck is empty (ok for --onlyto)
      if (deck.cardCount() === 0) {
        sendChat('', '/em Out of Action Cards - shuffling discards.');
        deck.combine(discards);
        shuffle();
      }

      // shuffle if there was a joker last round
      // if --onlyto or -- deal2chat is in use do not shuffle on joker as the joker round is not over yet
      if (jokerLastRound === 1 && !onlyToActive && !dealToChat) {
        sendChat('', '/em ' + divStart + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
          'Joker Last Round!' + '</div>Reshuffling discard pile...' + divEnd);
        discards.combine(hand);
        deck.combine(discards);
        shuffle();
        jokerLastRound = 0;
        if (verboseMode) {
          var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
          sendChat('', '/w ' + whoVM + " VERBOSE: Deal Function1: JokerLastRound set to 0.");
        }
      }
      // deal and handle init edges
      var nextcard = {};
      for (i = 0; i < turnorder.length; i += 1) {

        // if --onlyto is active, we need to selectively execute this loop for only matching names
        // otherwise execute the loop for every turn order entry -unless dea2chat then execute loop once
        if ((!onlyToActive) || (onlyToActive && initEdges[i].name.indexOf(onlyToString) !== -1) || dealToChat) {

          sendto = "/em "; // send messages to everyone by default
          if (initEdges[i].toktype === 'npc') {
            sendto = "/w gm ";
          }

          // put it in turn order if getting a card
          // turn order and initEdges are in the same array order - counting on this!
          if (initEdges[i].edges === "SKIP") {
            turnorder[i].rank = "-1";
          }

          // give tokens On Hold the highest rank
          // ignore Hold state if --onlyto is active, we will deal over it
          else if (initEdges[i].edges === "HOLD" && !onlyToActive) {
            turnorder[i].rank = "60";
          }

          // deal to chat  xxx
          else if (dealToChat) {
            if (dealToChatActive) {
              if (deck.cardCount() === 0) {
                sendChat('', '/em Out of Action Cards - shuffling discards.');
                deck.combine(discards);
                shuffle();
              }
              // draw a card
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for Chat in Dea2Chat");
              }
              nextcard = deck.deal();
              // send the card drawn to chat
              sendChat('', '/em Deal2Chat:  ' + nextcard.shortName);
              // if a joker was dealt to chat, we need to shuffle
              //	       if( nextcard.cardRank === 52 || nextcard.cardRank === 53 ){  pre 4Joker code
              if (nextcard.cardRank > 51 && nextcard.cardRank < 60) {
                jokerInChat = 1;
              }
            } // end if deal2ChatActive
            // clear deal to chat to only deal 1 time
            dealToChatActive = 0;

          } else { // ! deal2Chat
            // sendChat('','/w '+who+" Deck Card Count: " + deck.cardCount() );
            if (deck.cardCount() === 0) {
              sendChat('', '/em Out of Action Cards - shuffling discards.');
              deck.combine(discards);
              shuffle();
            }
            if (verboseMode) {
              var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
              sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name);
            }
            // draw a card
            nextcard = deck.deal();
            // sendChat('',sendto + '<u>'+initEdges[i].shortname+'...</u> <b>Card: </b>'  + nextcard.shortName );

            // assign card short name to turn order priority
            turnorder[i].pr = nextcard.shortName;
            turnorder[i].rank = nextcard.cardRank;
            // store it in hand
            hand.addCard(nextcard);
            // check for extra card edges - below from PEG forums
            // As stated under Quick, "Characters with both the Level Headed and Quick Edges draw their additional card and 
            // take the best as usual. If that card is a Five or less, the Quick Edge may be used to draw a replacement 
            // until it’s Six or higher." 
            // Meaning they draw 2 cards for Level Headed (or 3 for the Improved version), and then take the higher of 
            // those cards. If that card is still a 5 or less, then they can draw a single new card until they get one of 6 or better. 
            //
            // Level Headed
            if (initEdges[i].edges.indexOf('LH') !== -1) {
              if (deck.cardCount() === 0) {
                sendChat('', '/em Out of Action Cards - shuffling discards.');
                deck.combine(discards);
                shuffle();
              }
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name + " for LH");
              }
              // draw a card
              nextcard = deck.deal();
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: LH Card longName for " + initEdges[i].name + " >> " + nextcard.longName);
                sendChat('', '/w ' + whoVM + " VERBOSE: LH Card cardRank for " + initEdges[i].name + " >> " + nextcard.cardRank);
                sendChat('', '/w ' + whoVM + " VERBOSE: LH Card shortName for " + initEdges[i].name + " >> " + nextcard.shortName);
              }
              sendChat('', sendto + '<u>' + initEdges[i].shortname + '...</u> <b>LH: </b>' + turnorder[i].pr + ', ' + nextcard.shortName);
              if (nextcard.cardRank > turnorder[i].rank) {
                turnorder[i].pr = nextcard.shortName;
                turnorder[i].rank = nextcard.cardRank;
              }
              // store it in hand
              hand.addCard(nextcard);
            } // end Level Headed
            // Improved Level Headed
            if (initEdges[i].edges.indexOf('ILH') !== -1) {
              if (deck.cardCount() === 0) {
                sendChat('', '/em Out of Action Cards - shuffling discards.');
                deck.combine(discards);
                shuffle();
              }
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name + " for ILH");
              }
              // draw a card
              nextcard = deck.deal();
              sendChat('', sendto + '<u>' + initEdges[i].shortname + '...</u> <b>ILH:  </b>' + turnorder[i].pr + ', ' + nextcard.shortName);
              if (nextcard.cardRank > turnorder[i].rank) {
                turnorder[i].pr = nextcard.shortName;
                turnorder[i].rank = nextcard.cardRank;
              }
              // store it in hand
              hand.addCard(nextcard);
            } // end Improved Level Headed

            // Quick
            if (initEdges[i].edges.indexOf('Qui') !== -1) {
              // loop until they have a 6 or better
              while (turnorder[i].rank < 16) {
                if (deck.cardCount() === 0) {
                  sendChat('', '/em Out of Action Cards - shuffling discards.');
                  deck.combine(discards);
                  shuffle();
                }
                if (verboseMode) {
                  var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                  sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name + " for Qui");
                }
                // draw a card
                nextcard = deck.deal();
                if (verboseMode) {
                  var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                  sendChat('', '/w ' + whoVM + " VERBOSE: Qui Card longName for " + initEdges[i].name + " >> " + nextcard.longName);
                  sendChat('', '/w ' + whoVM + " VERBOSE: Qui Card cardRank for " + initEdges[i].name + " >> " + nextcard.cardRank);
                  sendChat('', '/w ' + whoVM + " VERBOSE: Qui Card shortName for " + initEdges[i].name + " >> " + nextcard.shortName);
                }
                sendChat('', sendto + '<u>' + initEdges[i].shortname + '</u> <b>Quick: </b>' + turnorder[i].pr + ', ' + nextcard.shortName);
                if (nextcard.cardRank > turnorder[i].rank) {
                  turnorder[i].pr = nextcard.shortName;
                  turnorder[i].rank = nextcard.cardRank;
                }
                // store it in hand
                hand.addCard(nextcard);
              } // end while
            } // end quick
            // Tactician
            if (initEdges[i].edges.indexOf('TT') !== -1) {
              if (deck.cardCount() === 0) {
                sendChat('', '/em Out of Action Cards - shuffling discards.');
                deck.combine(discards);
                shuffle();
              }
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name + " for TT");
              }
              // draw a card
              nextcard = deck.deal();
              // send the card drawn to chat
              sendChat('', '/em ' + divStart + '<div style="font-weight: bold; border-bottom: 3px solid green;font-size: 100%;">' + '<u>' + initEdges[i].shortname + '...</u> Tactician Card!' + '</div>' + nextcard.shortName + divEnd);

              // if a joker was dealt to chat, we need to shuffle
              //	       if( nextcard.cardRank === 52 || nextcard.cardRank === 53 ){ pre 4Joker change
              if (nextcard.cardRank > 51 && nextcard.cardRank < 60) {
                jokerInChat = 1;
              }
            } // end Tactician
            // Master Tactician
            if (initEdges[i].edges.indexOf('MTT') !== -1) {
              if (deck.cardCount() === 0) {
                sendChat('', '/em Out of Action Cards - shuffling discards.');
                deck.combine(discards);
                shuffle();
              }
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name + " for MTT");
              }
              // draw a card
              nextcard = deck.deal();
              // send the card drawn to chat
              sendChat('', '/em ' + divStart + '<div style="font-weight: bold; border-bottom: 3px solid green;font-size: 100%;">' + '<u>' + initEdges[i].shortname + '...</u> Master Tactician Card!' + '</div>' + nextcard.shortName + divEnd);

              // if a joker was dealt to chat, we need to shuffle
              //	       if( nextcard.cardRank === 52 || nextcard.cardRank === 53 ){ 
              if (nextcard.cardRank > 51 && nextcard.cardRank < 60) {
                jokerInChat = 1;
              }
            } // end Master Tactician

            // Hesitant (Minor)
            if (initEdges[i].edges.indexOf('HH') !== -1) {
              if (deck.cardCount() === 0) {
                sendChat('', '/em Out of Action Cards - shuffling discards.');
                deck.combine(discards);
                shuffle();
              }
              if (verboseMode) {
                var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
                sendChat('', '/w ' + whoVM + " VERBOSE: getting next card for " + initEdges[i].name + " for HH");
              }
              // draw a card
              nextcard = deck.deal();
              sendChat('', sendto + '<u>' + initEdges[i].shortname + '...</u> <b>HH: </b>' + turnorder[i].pr + ', ' + nextcard.shortName);

              // Hesitant gets two cards and is able to keep a joker, but takes the worst card otherwise
              // if first card is a joker and next card is not a better joker, keep first card 
              if ( (turnorder[i].rank > 51) && (nextcard.cardRank < turnorder[i].rank) ) {
                // keep the first card (already stored in turnorder[i])
              }
              // if second card is a joker use the second card  
              else if (nextcard.cardRank > 51) {
                turnorder[i].pr = nextcard.shortName;
                turnorder[i].rank = nextcard.cardRank;
              }
              // Otherwise Hesitant takes the worst card
              else if (nextcard.cardRank < turnorder[i].rank) {
                turnorder[i].pr = nextcard.shortName;
                turnorder[i].rank = nextcard.cardRank;
              }

              // store card in hand
              hand.addCard(nextcard);
            } // end Hesitant (Minor)

          } // end else normal init deal

          // check for jokers
          // if(turnorder[i].rank === 52 || turnorder[i].rank === 53 || jokerInChat ){ pre 4joker
          if ((turnorder[i].rank > 51 && turnorder[i].rank < 60) || jokerInChat) {

            jokerLastRound = 1;
            // tactician and benny cards WILL trigger WCE
            if (initEdges[i].edges.indexOf('WCE') !== -1) {
              // send message to chat regarding wild card edge activation  - should only send this to the "controlled by" list
              sendChat('', sendto + divStart + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
                initEdges[i].name + '</div>Your Joker activates your <b>Wild Card edge!</b>' + divEnd);
            }
            jokerInChat = 0;
            if (verboseMode) {
              var whoVM = getObj('player', id).get('_displayname').split(' ')[0];
              sendChat('', '/w ' + whoVM + " VERBOSE: Deal Function2: JokerLastRound set to 1.");
            }
          }
        } // end if !onlyto || onlyto and matching name
      } // end for i ....

      // clear onlyto match string and deal2chat
      onlyToString = '';
      dealToChat = 0;

      // sort turnorder
      var sortedturnorder = _.sortBy(turnorder, 'rank').reverse();
      // push updated turn order into interface
      Campaign().set("turnorder", JSON.stringify(sortedturnorder));
    }, // end doTheDeal

    //-----------------------------------------------------------------------------
    // dealInitiative(): load turn order with the deal
    //-----------------------------------------------------------------------------
    // every time we deal, we need to
    // o pull turn order tokens
    // o get names, ids, and init edges  
    // o deal cards to hand, accounting for init edges and end of deck and jokers
    // o no cards to custom items in init - set to -1 init to put them at the bottom
    // o on recall and shuffle, don't destroy hand unless new scene/combat (createDeck)
    // o sort the hand high to low
    // o write the hand to turn order
    dealInitiative = function(id) {
      // log('-=> DealInit: Calling [getInitiativeEdges] function <=- ');
      // pulls turn order tokens and fills initEdges object with names,ids,edges
      getInitiativeEdges(id);
      // log('-=> DealInit: back from [getInitiativeEdges] function <=- ');
      doTheDeal(id);
    },

    //-----------------------------------------------------------------------------
    // showHelp(): Display command line help in chat
    //-----------------------------------------------------------------------------
    showHelp = function(id) {

      var who = getObj('player', id).get('_displayname').split(' ')[0];
      sendChat('',
        '/w ' + who + ' ' +
        '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' +
        '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">' +
        'DealInit v' + version +
        '</div>' +
        '<div style="padding-left:10px;margin-bottom:3px;">' +
        '<p>See full ReadMe details here: https://github.com/pelwer1/Deal-Init </p>' +
        '<p>DealInit supports Savage Worlds style card based Inititive by dealing cards to Turn Order and sorting the order by suit. </p>' +
        '<p>It does not, however, utilize the Roll20 deck system.  Instead it manages an array of cards that are reshuffled when the deck runs out or a joker is drawn.</p>' +
        '<p>It also checks Token Attributes for Any SW Inititative Edges and handles them appropriately.</p>' +
        '<p>Initiative Edges must be stored in a comma separated list in an Attribute named InitEdges. (e.g.  Qui,LH)</p>' +
        '<p>The Edge shorthand is as follows:</p>' +
        '<p><b>Qui</b> = Quick</p>' +
        '<p><b>LH</b> = Level Headed</p>' +
        '<p><b>ILH</b> = Improved Level Headed</p>' +
        '<p><b>TT</b> = Tactician (cards dealt to chat window)</p>' +
        '<p><b>MTT</b> = Master Tactician (cards dealt to chat window)</p>' +
        '<p><b>HH</b> = Hesitant Hindrance</p>' +
        '<p><b>WCE</b> = Any Joker Activated Wild Card Edge</p>' +
        '</div>' +
        '<b>Commands</b>' +
        '<div style="padding-left:10px;">' +
        '<b><span style="font-family: serif;">!deal-init ' + '[ <i>--help</i> ] [<i>--reset</i> ] [<i>--show</i> ] [<i>--onlyto --string</i> ] [<i>--deal2chat</i> ]' + '</span></b>' +
        '<div style="padding-left: 10px;padding-right:20px">' +
        '<ul>' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '(<i>no args</i>)' + '</span></b> ' + ' Deals cards to turn order and sorts by suit.' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--help' + '</span></b> ' + ' Displays this help.' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--reset' + '</span></b> ' + ' Reset the deck and shuffle.  Use at the start of a new scene or encounter.' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--clearTurnOrder' + '</span></b> ' + ' Removes all tokens from Turn Order.  Use after moving to a new page.' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--4jreset' + '</span></b> ' + ' Reset the deck with 4 Jokers and shuffle.  Use at the start of a new scene or encounter.' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--show' + '</span></b> ' + ' Show the current contents of the deck, discard pile, and turn order.' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--onlyto --string' + '</span></b> ' + ' deals cards only to names that contain "string". (case sensitive)' +
        '</li> ' +
        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">' +
        '<b><span style="font-family: serif;">' + '--deal2chat' + '</span></b> ' + ' deals one card to chat window (use when player spends a benny to redraw)' +
        '</li> ' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</div>'
      );
    },

    //-----------------------------------------------------------------------------
    // handleInput(): Parse command line args
    //-----------------------------------------------------------------------------
    // possible args
    // !deal-init 
    // --help - show help (showHelp)
    // (no args) - deal cards to items in turn order and sort turn order by suit (dealInitiative)
    // --clearTurnOrder - blanks the turn order, useful after a page change  
    // --reset - creates and shuffles the deck, use at the start of combat/scene (init)
    // --4jreset - creates and shuffles the deck with 4 jokers, use at the start of combat/scene (init)
    // --show - show the cards in turnorder, discard, draw piles (showCards)
    // --onlyto --string- deals cards only to names that contain string (case sensitive)
    // --deal2chat - deal 1 card to chat
    handleInput = function(msg_orig) {

      var msg = _.clone(msg_orig);
      var args = [];

      if (msg.type !== "api") {
        return;
      }

      args = msg.content
        .replace(/<br\/>\n/g, ' ')
        .replace(/(\{\{(.*?)\}\})/g, " $2 ")
        .split(/\s+--/);

      // bail out if api call is not to deal-init
      if (args.shift() !== "!deal-init") {
        // log('-=> DealInit: Not calling [deal-init] exiting... <=- ');
        return;
      }
      // print help
      if (args[0] === "help") {
        // log('-=> DealInit: Calling [showHelp] function <=- ');
        showHelp(msg.playerid);
        return;
      }
      // clear turn order
      if (args[0] === "clearTurnOrder") {
        // log('-=> DealInit: Clearing Turn Order <=- ');
        Campaign().set('turnorder','[]');
        return;
      }
      // reset the deck with 2 Jokers and shuffle 
      if (args[0] === "reset") {
        // log('-=> DealInit: Calling [createDeck] function with 2 Jokers <=- ');
        fourJokers = 0;
        createDeck(msg.playerid);
        return;
      }

      // reset the deck with 4 Jokers and shuffle 
      if (args[0] === "4jreset") {
        // log('-=> DealInit: Calling [createDeck] function with 4 Jokers <=- ');
        fourJokers = 1;
        createDeck(msg.playerid);
        return;
      }

      // print out the contents of turn order, discard, and draw piles
      if (args[0] === "show") {
        // log('-=> DealInit: Calling [display] function <=- ');
        display(msg.playerid);
        return;
      }

      // deal only to tokens where name contains string
      if (args[0] === "onlyto") {
        onlyToString = args[1];
        // do not return - need to flow thru to normal dealing process;
        // log('-=> DealInit: Using [onlyto] option.  Match String is'+ onlyToString  +'<=- ');
      }

      // deal one card to chat (spending bennies or tactician edges )
      if (args[0] === "deal2chat") {
        dealToChat = 1;
        // do not return - need to flow thru to normal dealing process;
        // log('-=> DealInit: Using [deal2chat] option. <=- ');
      }

      // log('-=> DealInit: Calling [dealInitiative] function <=- ');
      dealInitiative(msg.playerid);
      // log('-=> DealInit: Back from [dealInitiative] function <=- ');
      return;

    }, // end handle input

    //-----------------------------------------------------------------------------
    // checkInstall(): Send version info to console log.
    //-----------------------------------------------------------------------------
    checkInstall = function() {
      log('-=> DealInit v' + version + ' <=- ' + lastUpdate);
    },

    //-----------------------------------------------------------------------------
    // registerEventHandlers(): Get command line parser watching chat for DealInit commands
    //-----------------------------------------------------------------------------
    registerEventHandlers = function() {
      on('chat:message', handleInput);
    };

  //-----------------------------------------------------------------------------
  // configure deal init on load
  //-----------------------------------------------------------------------------
  return {
    CheckInstall: checkInstall,
    RegisterEventHandlers: registerEventHandlers
  };

}()); // end DealInit

//-----------------------------------------------------------------------------
// configure deal init on load
//-----------------------------------------------------------------------------
on("ready", function() {
  'use strict';
  DealInit.CheckInstall();
  DealInit.RegisterEventHandlers();
});
