on("chat:message", function(msg) {
    var message = '';
    // Determine the contents of `message'
 
    var characters = findObjs({_type: 'character'});
    var speaking;
    characters.forEach(function(chr) { if(chr.get('name') == msg.who) speaking = chr; });
 
    if(speaking) sendChat('character|'+speaking.id, message);
    else sendChat('player|'+msg.playerid, message);
});