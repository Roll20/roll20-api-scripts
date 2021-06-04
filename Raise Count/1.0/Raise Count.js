var raise_count = raise_count || {};

// Raise increment; generalized in case there are cases where it isn't 4
raise_count.RAISE_SIZE = 4;
// Output formatting. %1$s will be replaced with an inline roll. %2$s will be replaced by the user's target input.
// %3$s will be replaced by the number of raises resulting the from roll. change this string if you want the results
// to show up differently in chat.
raise_count.OUTPUT_FORMAT = 'Roll: %1$s, Target: %2$s, Raises: %3$s';

on('chat:message', function(msg) {
    if(msg.type != 'api' || msg.content.indexOf('!rc ')) return;
    
    var roll = msg.content.substring(4, msg.content.indexOf('|'));
    var target = msg.content.substring(msg.content.indexOf('|')+1);
    
    var sendAs = 'system';
    var character = findObjs({_type: 'character', name: msg.who})[0];
    if(character) sendAs = 'character|'+character.id;
    else sendAs = 'player|'+msg.playerid;
    
    sendChat(sendAs, '[['+roll+']]', function(fmsg) {
        var expression = fmsg[0].inlinerolls['1'].expression;
        var total = fmsg[0].inlinerolls['1'].results.total;
        var raises = Math.floor((total - target) / raise_count.RAISE_SIZE);
        
        var rollOut = '<span title="Rolling '+expression+' = ';
        var fail = crit = false;
        for(var i in fmsg[0].inlinerolls['1'].results.rolls)
        {
            var r = fmsg[0].inlinerolls['1'].results.rolls[i];
            if(r['type'] != 'R') continue;
            
            rollOut += '(';
            var max = r['sides'];
            
            for(var k = 0; k < r['results'].length; k++)
            {
                var value = r['results'][k]['v'];
                crit = crit || (value == max);
                fail = fail || (value == 1);
                rollOut += '<span class="basicdiceroll'+(value==max?' critsuccess':(value==1?' critfail':''))+'">';
                rollOut += value+'</span>+';
            }
            rollOut = rollOut.substring(0,rollOut.length - 1)+')+';
        }
        rollOut = rollOut.substr(0, rollOut.length - 1);
        rollOut += '" class="a inlinerollresult showtip tipsy-n';
        rollOut += (crit&&fail?' importantroll':(crit?' fullcrit':(fail?' fullfail':'')))+'">'+total+'</span>';
        
        var message = '/direct '+raise_count.sprintf(raise_count.OUTPUT_FORMAT, rollOut, target, raises);
        sendChat(sendAs, message);
    });
});

/**
 * Really really really super naive implementation of the sprintf function,
 * which will only really work for this script. I should be ashamed for qriting it.
 */
raise_count.sprintf = function(format, arg1, arg2, arg3)
{
    var out = format.replace('%1$s', arg1);
    out = out.replace('%2$s', arg2);
    out = out.replace('%3$s', arg3);
    return out;
};