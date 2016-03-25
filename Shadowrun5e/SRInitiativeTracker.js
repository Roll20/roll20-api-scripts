/**
 * SRInitiativeTracker will handle any iniative rolls which come from the SR5
 * character sheet roll templates. The character being "spoken as" will have
 * their token added to the initiative tracker in sorted order.
 * 
 * This script also provides a '!nextpass' chat command which will automatically
 * subtract 10 from all entries and remove those which have no initiative left.
 * 
 */
 
on('chat:message', function(msg) {
    if(msg.type == 'general' && (msg.rolltemplate.indexOf('sr') == 0) && (msg.content.indexOf('Initiative') > -1)) {
        //script should only respond to template rolls from sr which have 'Initiative' in them somewhere
        
        var initScore = msg.inlinerolls[1].results.total;
        var turnorder;
        var player = getObj("player", msg.playerid);
        //log(player);
        var charId = player.get("speakingas");
        //log(charId);
        charId = charId.slice(charId.indexOf('|')+1);
        //log(charId);
        var character = getObj("character", charId);
        var token = findObjs({_type:"graphic",represents:charId});
        //log(token[0]);
        //log(character);
        if(Campaign().get("turnorder") == "") {
            turnorder = []; 
        } else {
            turnorder = JSON.parse(Campaign().get("turnorder"));
        }

    //Add a new custom entry to the end of the turn order.
        turnorder.push({
            id: token[0].get("_id"),
            pr: initScore
            //custom: character.get("name")
        });
        turnorder.sort(function(a, b) { return b.pr-a.pr; }); //what about ties? ERI
        Campaign().set("turnorder", JSON.stringify(turnorder));
    }
});

on('chat:message', function(msg) {
    if(msg.content == '!nextpass') {

        if(Campaign().get("turnorder") == "") {
            turnorder = []; 
        } else {
            turnorder = JSON.parse(Campaign().get("turnorder"));
        }

        nextPassOrder = [];
        //foreach obj in turnorder
        for(i = 0; i < turnorder.length; i++) {
            //if pr < 10 remove from []
            //otherwise pr = pr-10
            //log("Turn "+i+" "+turnorder[i]);
            if(turnorder[i].pr > 10) {
                turnorder[i].pr = turnorder[i].pr - 10;
                nextPassOrder.push(turnorder[i]);
            }
        }
        nextPassOrder.sort(function(a, b) { return b.pr-a.pr; });
        //sort array desc
        Campaign().set("turnorder", JSON.stringify(nextPassOrder));   
    }

});