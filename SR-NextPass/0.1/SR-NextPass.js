on('chat:message', function(msg) {
    if( msg.type==='api' 
        && msg.content.match(/^!nextpass/) 
        && playerIsGM(msg.playerid) //< ensure only run by GM
    ) {
        let turnorder = JSON.parse(Campaign().get('turnorder'))||[];
        let nextPassOrder = [];

        //foreach obj in turnorder
        for(i = 0; i < turnorder.length; i++) {
            //if pr < 10 remove from []
            //otherwise pr = pr-10
            if(turnorder[i].pr > 10) {
                turnorder[i].pr = turnorder[i].pr - 10;
                nextPassOrder.push(turnorder[i]);
            } else if(turnorder[i].pr<0){
                nextPassOrder.push(turnorder[i]);
            }
        }
        nextPassOrder.sort(function(a, b) { return b.pr-a.pr; });
        //sort array desc
        Campaign().set("turnorder", JSON.stringify(nextPassOrder));
    }
});
