// !init <# of steps> <token name>
// !init 3 Jackie Chan
// If no step value is set, the standard 3 steps are removed. If no token name is specified steps are removed from the top initiative in the tracker. If neither are specified 3 steps are removed from the top initiative.

on('chat:message', function(msg) {
    if (msg.type == 'api' && msg.content.indexOf('!init') !== -1) {
        var char; 
        var steps = 3; 
        var pieces = msg.content.split(" ");
        if (pieces.length > 2) {
            var char = pieces.slice(2, pieces.length).join(" ");
            // char = findObjs({_type: "character", name: char_name}, {caseInsensitive: true});
        }
        if (pieces.length > 1) {
            steps = pieces[1] && !isNaN(parseInt(pieces[1],10)) ? parseInt(pieces[1],10) : 3;
        }
        do_steps(steps, char);
    };
});

var do_steps = function(steps, char) {
    // GET TURN ORDER
    var currentTurnOrder = Campaign().get("turnorder") === "" || Campaign().get("turnorder") === "[]" ? currentTurnOrder = [] : JSON.parse(Campaign().get("turnorder"));

    // CHANGE STEPS
    if (!char) {
        currentTurnOrder[0]["pr"] = currentTurnOrder[0]["pr"] - steps > 0 ? currentTurnOrder[0]["pr"] - steps : 0;
    }
    else {
        _.each(currentTurnOrder, function(turn) {
            var graphic = getObj("graphic", turn.id);
            if(graphic && graphic.get("name") && graphic.get("name").toLowerCase() === char.toLowerCase()) {
                turn.pr = turn.pr - steps > 0 ? turn.pr - steps : 0;
            }
        });
    }
    
    // SORT TURN ORDER
    currentTurnOrder = _.sortBy(currentTurnOrder, function(turnitem) {
        if (typeof turnitem.pr === "string") {
            return -(parseInt(turnitem.pr, 10));
        }
        else {
            return -(turnitem.pr);
        }
    });
    
    // SAVE TURN ORDER
    Campaign().set({
        turnorder: JSON.stringify(currentTurnOrder)
    });
};