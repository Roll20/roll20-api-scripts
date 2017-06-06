on('chat:message', function(msg) {
    if(msg.content == '!nextpass') {
        //TODO: ensure only run by GM?
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
