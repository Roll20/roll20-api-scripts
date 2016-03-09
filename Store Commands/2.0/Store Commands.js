/**
 * Stores a series of commands to be used later, or repeated later.
 * 
 * !delay time :: sets the default delay in milliseconds between commands
 * !store [-time] command :: stores a command, with an optional time overriding the default
 * !clearstore :: clears the stored commands
 * !echostore :: echoes the stored commands to you
 * !run :: runs the series of stored commands      
 */
var bshields = bshields || {};
bshields.storeCommands = (function() {
    'use strict';
    
    var version = 2.0,
        list = {},
        commands = {
            delay: function(args, msg) {
                list[msg.playerid].delay = parseInt(args[0], 10);
            },
            clearstore: function(args, msg) {
                list[msg.playerid].cmds = [];
            },
            store: function(args, msg) {
                var delay = list[msg.playerid].delay || 500,
                    obj;
                
                if (args[0] && args[0].indexOf('-') === 0) {
                    delay = parseInt(args.shift().substring(1), 10);
                }
                
                obj = { text: args.join(' '), delay: delay };
                list[msg.playerid].cmds.push(obj);
            },
            echostore: function(args, msg) {
                _.each(list[msg.playerid].cmds, function(cmd) {
                    sendChat('System', '/w ' + msg.who + ' {' + cmd.delay + 'ms, ' + cmd.text + '}');
                });
            },
            run: function(args, msg) {
                var count = 0;
                _.each(list[msg.playerid].cmds, function(cmd) {
                    echo(msg.playerid, cmd.text, count + cmd.delay);
                    count += cmd.delay;
                })
            }
        };
    
    function echo(id, text, delay) {
        setTimeout(function(){ sendChat('player|'+id, text); }, delay);
    }
    
    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = bshields.splitArgs(msg.content.trim()),
            command, args0, isHelp;
        
        if (!list[msg.playerid]) {
            list[msg.playerid] = { cmds: [], delay: 500 };
        }
        
        if (isApi) {
            command = args.shift().substring(1).toLowerCase();
            arg0 = args.shift();
            isHelp = arg0.toLowerCase() === 'help' || arg0.toLowerCase() === 'h';
            
            if (!isHelp) {
                if (arg0 && arg0.length > 0) {
                    args.unshift(arg0);
                }
                
                if (_.isFunction(commands[command])) {
                    commands[command](args, msg);
                }
            } else if (_.isFunction(commands.help)) {
                commands.help(command, args, msg);
            }
        } else if (_.isFunction(commands['msg_' + msg.type])) {
            commands['msg_' + msg.type](args, msg);
        }
    }
    
    function registerEventHandlers() {
        on('chat:message', handleInput);
    }
    
    return {
        registerEventHandlers: registerEventHandlers
    }
}());

on('ready', function() {
    'use strict';
    
    bshields.storeCommands.registerEventHandlers();
});