/**
 * If a player or GM uses the `!flip' command, all graphics they have selected
 * will flip horizontally. Try creating a macro button for this and making it
 * visible to all players!
 * 
 * You can also add any number of parameters which are each either "vertical" or
 * "horizontal" in order to flip the selected graphic in the specified direction
 * in sequence. 
 */
var bshields = bshields || {};
bshields.flip = (function() {
    'use strict';
    
    var version = 2.2,
        commands = {
            flip: function(args, msg) {
                var selected = msg.selected;
                
                if (!selected) { return; }
                
                _.each(selected, function(obj) {
                    var token = getObj('graphic', obj._id);
                    
                    if (token) {
                        if (args.length === 0) {
                            token.set('fliph', !token.get('fliph'));
                        } else {
                            _.each(args, function(arg) {
                                if (arg.toLowerCase() === 'horizontal') {
                                    token.set('fliph', !token.get('fliph'));
                                } else if (arg.toLowerCase() === 'vertical') {
                                    token.set('flipv', !token.get('flipv'));
                                }
                            });
                        }
                    }
                });
            },
            help: function(command, args, msg) {
                if (_.isFunction(commands['help_' + command])) {
                    commands['help_' + command](args, msg);
                }
            }
        };
    
    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = msg.content.trim().splitArgs(),
            command, arg0, isHelp;
        
        if (isApi) {
            command = args.shift().substring(1).toLowerCase();
            arg0 = args.shift() || '';
            isHelp = arg0.toLowerCase() === 'help' || arg0.toLowerCase() === 'h';
            
            if (!isHelp) {
                if (arg0) {
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
    
    bshields.flip.registerEventHandlers();
});