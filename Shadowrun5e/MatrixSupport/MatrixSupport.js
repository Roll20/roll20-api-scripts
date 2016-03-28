on('chat:message', function (msg) {
    if(msg.content.indexOf('roll_header=Matrix Action') >= 0) {
        log('message: ');  
        log(msg);
        var player = getObj("player", msg.playerid);
        log('player: ');
        log(player);
        var charId = player.get("speakingas");
        log('charId: '+charId);
        charId = charId.slice(charId.indexOf('|')+1);
        var attribs = findObjs({_type:"attribute", _characterId:charId});
        log('atrriibs: ');
        log(attribs);
    }
   
});