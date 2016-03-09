/**
 * Set selected tokens flying with !fly height. Clear the flight status markers with !fly.
 */
var bshields = bshields || {};
bshields.flight = (function() {
    'use strict';
    
    var version = 3.2,
        commands = {
            fly: function(args, msg) {
                var selected = msg.selected,
                    height = parseInt(args[0], 10) || 0,
                    wings = '';
                    
                if(height) {
                    wings = _.chain(height.toString().split(''))
                        .map(function(d){
                            return 'fluffy-wing@'+d;
                        })
                        .value()
                        .reverse()
                        .join(',');
                }
                
                if (!selected) { return; }
                _.each(selected, function(obj) {
                    var token = getObj('graphic', obj._id),
                        markers;
                    
                    if (obj._type !== 'graphic' || !token || token.get('subtype') !== 'token') { return; }
                    token.set('status_fluffy-wing', false);
                    
                    markers = token.get('statusmarkers');
                    markers += ( markers ? ',' : '' ) + wings;
                    token.set('statusmarkers', markers);
                });
            },
            help: function(command, args, msg) {
                if (_.isFunction(commands['help_' + command])) {
                    commands['help_' + command](args, msg);
                }
            },
            help_fly: function(args, msg) {
              sendChat('Flight v'+version, 'Specify !fly &'+'lt;number&'+'gt; to add that number as wings on the selected token.' );
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
