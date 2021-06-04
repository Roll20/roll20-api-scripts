on('ready', () => {
  on('chat:message', function(msg) {
    if( msg.type==='api' 
      && msg.content.match(/^!nextpass/) 
      && playerIsGM(msg.playerid) //< ensure only run by GM
    ) {
      let turnorder = JSON.parse(Campaign().get('turnorder')||"[]");
      let nextPassOrder = [];

      //foreach obj in turnorder
      turnorder.forEach(entry => {
        //if pr < 10 remove from []
        //otherwise pr = pr-10
        if(entry.pr > 10) {
          entry.pr = entry.pr - 10;
          nextPassOrder.push(entry);
        } else if(entry.pr<0){
          nextPassOrder.push(entry);
        }
      });
      nextPassOrder.sort(function(a, b) { return b.pr-a.pr; });
      //sort array desc
      Campaign().set("turnorder", JSON.stringify(nextPassOrder));
    }
  });
});
