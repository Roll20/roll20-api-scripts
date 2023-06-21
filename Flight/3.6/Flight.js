/**
* Edited 14 Jun 2023 by timmaugh
* -- better detection of whether it needs to take action on the message lets it play well with metascripts
* -- added API_Meta information
*/
var API_Meta = API_Meta || {};
API_Meta.Flight = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Flight.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (8)); } }

var bshields = bshields || {};
bshields.flight = (function () {
    'use strict';

    var version = 3.6,
        commands = {
            fly: function (args, msg) {
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
            help: function (command, args, msg) {
                if (_.isFunction(commands[`help_${command}`])) {
                    commands[`help_${command}`](args, msg);
                }
            },
            help_fly: function (args, msg) {
                sendChat(`Flight v${version}`, 'Specify !fly &' + 'lt;number&' + 'gt; to add that number as wings on the selected token.');
            }
        }
    API_Meta.Flight.version = version;

    function markStatus(marker, num, selected) {
        var markerStr = '',
            token, markers;

        if (!selected) return;
        selected = _.reject(selected, (o) => o._type !== 'graphic');
        if (!selected.length) return;

        if (num) {
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
        let flightrx = new RegExp(`^!${Object.keys(commands).join('|')}`, 'i');
        if (msg.type === 'api' && flightrx.test(msg.content)) {
            let args = msg.content.trim().splitArgs();
            let command = args.shift().substring(1).toLowerCase();
            let arg0 = args.shift() || '';
            if (['help', 'h'].includes(arg0.toLowerCase()) || command === 'help') {
                commands.help(command === 'help' ? arg0 : command, args, msg);
            } else {
                if (arg0 && arg0.length > 0) {
                    args.unshift(arg0);
                }

                if (_.isFunction(commands[command])) {
                    commands[command](args, msg);
                }
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

on('ready', function () {
    'use strict';

    bshields.flight.registerEventHandlers();
});
{ try { throw new Error(''); } catch (e) { API_Meta.Flight.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Flight.offset); } }
