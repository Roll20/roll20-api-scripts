var store_commands = store_commands || {};

store_commands.list = {};

on('chat:message', function(msg) {
    if(msg.type != 'api') return;
    
    var parts = msg.content.split(' ');
    var command = parts.shift().substring(1);
    var id = msg.playerid;
    
    if(!store_commands.list[id]) store_commands.list[id] = { cmds: [], delay: 500 };
    
    switch(command)
    {
        case 'delay':
            store_commands.list[id].delay = parseInt(parts[0], 10);
            break;
        case 'store':
            var delay = 500;
            if(parts[0].indexOf('-') == 0)
                delay = parseInt(parts.shift().substring(1), 10);
            else if(store_commands.list[id].delay)
                delay = store_commands.list[id].delay;
            
            var obj = { text: parts.join(' '), delay: delay };
            store_commands.list[id].cmds.push(obj);
            break;
        case 'clearstore':
            store_commands.list[id].cmds = [];
            break;
        case 'echostore':
            for(var i = 0; i < store_commands.list[id].cmds.length; i++)
            {
                var obj = store_commands.list[id].cmds[i];
                sendChat('Store Commands.js', '/w ' + msg.who + ' {' + obj.delay + 'ms, ' + obj.text + '}');
            }
            break;
        case 'run':
            var count = 0;
            for(var i = 0; i < store_commands.list[id].cmds.length; i++)
            {
                var obj = store_commands.list[id].cmds[i];
                store_commands.echo(id, obj.text, count + obj.delay);
                count += obj.delay;
            }
            break;
        default:
            break;
    }
});

store_commands.echo = function(id, text, delay)
{
    setTimeout(function(){ sendChat('player|'+id, text); }, delay);
};