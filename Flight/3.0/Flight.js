var bshields = bshields || {};
bshields.flight = (function() {
    'use strict';
    
    var version = 3.0,
        commands = {
            fly: function(args, msg) {
                var selected = msg.selected,
                    height = parseInt(args[0], 10) || 0;
                
                if (!selected) { return; }
                _.each(selected, function(obj) {
                    var token = getObj('graphic', obj._id),
                        wings = '',
                        digit, markers;
                    
                    if (obj._type !== 'graphic' || !token || token.get('subtype') !== 'token') { return; }
                    token.set('status_fluffy-wing', false);
                    while (height > 0) {
                        // Iterate over digits, from ones on up
                        digit = height / 10;
                        digit -= Math.floor(digit);
                        digit = Math.round(digit * 10);
                        
                        // Shift height
                        height = Math.floor(height / 10);
                        
                        wings += 'fluffy-wing@' + digit + ',';
                    }
                    
                    if (wings.length > 0) {
                        wings = wings.substring(0, wings.length - 1);
                    }
                    
                    markers = token.get('statusmarkers');
                    if (markers !== '') markers += ',';
                    markers += wings;
                    token.set('statusmarkers', markers);
                });
            }
        };
    
    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = bshields.splitArgs(msg.content.trim()),
            command, args0, isHelp;
        
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
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.flight.registerEventHandlers();
});