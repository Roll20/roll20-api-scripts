// VARIABLE & FUNCTION DECLARATION
var TurnOrderAgent = TurnOrderAgent || {};

// AnnounceNewRound - Set to TRUE if you want the script to announce
// the beginning of each new round.
var AnnounceNewRound = true;

on("chat:message", function(msg) {
    // Exit if not an api command
    if (msg.type != "api") return;
    
    // Get the API Chat Command
    msg.who = msg.who.replace(" (GM)", "");
    msg.content = msg.content.replace("(GM) ", "");
    var command = msg.content.split(" ", 1);


    if (command == "!eot") {
        if (!Campaign().get('turnorder')) return;                   // Exit if the turn order tracker is not open
        var turn_order = JSON.parse(Campaign().get('turnorder'));   // Parse the turn order information into JSON
        if (!turn_order.length) return;                             // Exit if there are no tokens on the tracker
        var turn = turn_order.shift();                              // Grab the info for the top of initiative        
        turn_order.push({                                           // Add the info to the bottom of initiative
            id: turn.id,
            pr: turn.pr,
            custom: turn.custom
        });
        Campaign().set("turnorder", JSON.stringify(turn_order));    // Send the turn order back to the tracker
        TurnOrderAgent();
    }
});


on("change:campaign:turnorder", function(obj) {
    TurnOrderAgent();
});

function TurnOrderAgent () {
    if (!Campaign().get("turnorder")) return;
    var turn_order = JSON.parse(Campaign().get("turnorder"));
    if (!turn_order.length) return;
    if (typeof turn_order[0].pr == "string") {
        if (turn_order[0].pr.substring(0, 5) == "Round") {
            var RoundTracker = turn_order[0].pr;
            var CurrentRound = parseInt(RoundTracker.substring(5));
            turn_order[0].pr = "Round " + (CurrentRound + 1);
            Campaign().set({turnorder: JSON.stringify(turn_order)});
            if(AnnounceNewRound == true) {
                sendChat("", "/desc ");
                sendChat("", "/direct <div style='width: 100%; color: #C8DE84; border: 1px solid #91bd09; background-color: #749a02; box-shadow: 0 0 15px #91bd09; display: block; text-align: center; font-size: 20px; padding: 5px 0; margin-bottom: 0.25em; font-family: Garamond;'>" + turn_order[0].pr + "</div>");
            }
        }
    }
    
    // Exit script if custom item on turn order tracker instead of a token...
    if (turn_order[0].id == -1) return;
    
    var current_token = getObj("graphic", turn_order[0].id);
    var initiative_highlighter = findObjs({name: "InitiativeHighlight", pageid: current_token.get("pageid")}, {caseInsensitive: true})[0];
    
    if (initiative_highlighter == undefined) {
        // sendChat("ERROR", "/w gm Cannot find an initiative highlight token on this page.");
        return;
    }
    
    if (initiative_highlighter.get("layer") == "gmlayer" && current_token.get("layer") != "gmlayer") {
        initiative_highlighter.set({
            "top": current_token.get("top"),
            "left": current_token.get("left"),
            "height": current_token.get("height"),
            "width": current_token.get("width")
        });
        setTimeout(function() {
            initiative_highlighter.set({
                "layer": current_token.get("layer")
            });    
        }, 500);
    } else {
        initiative_highlighter.set({
            "layer": current_token.get("layer"),
            "top": current_token.get("top"),
            "left": current_token.get("left"),
            "height": current_token.get("height"),
            "width": current_token.get("width")
        });   
    }
    toFront(current_token);
};