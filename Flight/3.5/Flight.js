var bshields = bshields || {};
bshields.flight = (function() {
    'use strict';

    var version = 3.5,
        commands = {
            fly: function(args, msg) {
                var height = parseInt(args[0]) || 0;
                markStatus('fluffy-wing', height, msg.selected);
            },
            /**
             * To add new command, use this template:
            commandname: function(args, msg) {
                var num = parseInt(args[0]) || 0;
                markStatus('statusmarker-name', num, msg.selected);
            },
             * Statusmarker names are listed at https://wiki.roll20.net/API:Objects#Graphic_.28Token.2FMap.2FCard.2FEtc..29
             * commandname should be ALL LOWER-CASE and CANNOT contain spaces. If commandname includes anything other than a-z0-9_
             * or if it begins with a number, it must be enclosed in quotes, eg:
            'command-name': function...
             */
            help: function(command, args, msg) {
                if (_.isFunction(commands[`help_${command}`])) {
                    commands[`help_${command}`](args, msg);
                }
            },
            help_fly: function(args, msg) {
              sendChat(`Flight v${version}`, 'Specify !fly &'+'lt;number&'+'gt; to add that number as wings on the selected token.');
            }
        };

    function markStatus(marker, num, selected) {
        var markerStr = '',
            token, markers;

        if (!selected) return;
        selected = _.reject(selected, (o) => o._type !== 'graphic');
        if (!selected.length) return;

        if(num) {
            markerStr = _.chain(num.toString().split(''))
                .map((d) => `${marker}@${d}`)
                .value()
                .join(',');
        }

        _.each(selected, (obj) => {
            token = getObj('graphic', obj._id);

            if (token && token.get('subtype') === 'token') {
                token.set(`status_${marker}`, false);

                markers = token.get('statusmarkers');
                markers = markers ? markers.trim() : '';
                markers += (markers.length ? ',' : '') + markerStr;
                token.set('statusmarkers', markers);
            }
        });
    }

    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = msg.content.trim().splitArgs(),
            command, arg0, isHelp;

        if (isApi) {
            command = args.shift().substring(1).toLowerCase();
            arg0 = args.shift() || '';
            isHelp = arg0.toLowerCase() === 'help' || arg0.toLowerCase() === 'h' || command === 'help';

            if (!isHelp) {
                if (arg0 && arg0.length > 0) {
                    args.unshift(arg0);
                }

                if (_.isFunction(commands[command])) {
                    commands[command](args, msg);
                }
            } else if (_.isFunction(commands.help)) {
                commands.help(command === 'help' ? arg0 : command, args, msg);
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
