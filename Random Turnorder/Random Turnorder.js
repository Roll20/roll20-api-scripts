/**
 * The `!shuffleturnorder' command will add all selected tokens to the turnorder
 * window (if not already present), and then shuffle all items in the turn order.
 */
var bshields = bshields || {};
bshields.shuffleturnorder = (function() {
    'use strict';
    
    var version = 1.0,
        commands = {
            shuffleturnorder: function(args, msg) {
                var selected = msg.selected,
                    turnorder = [],
                    turnorderTokenids = [];
                
                if (Campaign().get('turnorder')) {
                    turnorder = JSON.parse(Campaign().get('turnorder'));
                    turnorderTokenids = _.pluck(turnorder, 'id');
                }
                
                if (selected) {
                    _.each(selected, function(token) {
                        if (!_.contains(turnorderTokenids, token._id)) {
                            // Selected token is not in turn order
                            turnorder.push({
                                id: token._id,
                                pr: '0',
                                custom: ''
                            });
                        }
                    });
                }
                
                turnorder = _.shuffle(turnorder);
                Campaign().set('turnorder', JSON.stringify(turnorder));
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
        
        if (!isGM(msg.playerid)) { return; }
        
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
    
    bshields.shuffleturnorder.registerEventHandlers();
});