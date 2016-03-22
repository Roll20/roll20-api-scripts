var exalted = exalted || {};
 
exalted.sendChat = function(name, id, msg)
{
    var characters = findObjs({_type: 'character'});
    var speaking;
    characters.forEach(function(chr) { if(chr.get('name') == name) speaking = chr; });
    if(speaking) sendChat('character|'+speaking.id, msg);
    else sendChat('player|'+id, msg);
};
 
on('chat:message', function(msg) {
    var json;
    var inline = false;
    try { json = JSON.parse(msg.content); }
    catch(e)
    {
        if(msg.inlinerolls) inline = true;
        else return;
    }
    
    var results = [];
    if(!inline)
    {
        json.rolls.forEach(function(j) {
            if(j.sides != 10) return;
            results.push(j.results);
        });
    }
    else
    {
        json = msg.inlinerolls;
        json.forEach(function(j) {
            var rolls = j.results.rolls;
            rolls.forEach(function(r) {
                if(r.sides != 10) return;
                results.push(r.results);
            });
        });
    }
    
    var successes = 0;
    var botches = 0;
    results.forEach(function(r) {
        r.forEach(function(d) {
            var die = d['v'];
            successes += die >= 7 ? 1 : 0
            successes += die == 10 ? 1 : 0;
            botches += die == 1 ? 1 : 0;
        });
    });
    
    if(successes == 0 && botches != 0)
    {
        exalted.sendChat(msg.who, msg.playerid, botches+' botch'+(botches>1?'es':''));
    }
    else if(successes == 0)
    {
        exalted.sendChat(msg.who, msg.playerid, 'Failure');
    }
    else
    {
        exalted.sendChat(msg.who, msg.playerid, successes+' success'+(successes>1?'es':''));
    }
});