/**
 * Counts raises for Savage Worlds. Use !rc roll-expression target-number
 * 
 * Customize output with config.outputFormat, and customize raise size with config.raiseSize  
 */
var bshields = bshields || {};
bshields.raiseCount = (function() {
    'use strict';
    
    var version = 2.1,
        config = {
            raiseSize: 4,
            outputFormat: 'Roll: {0}, Target: {1}, Raises: {2}'
        },
        commands = {
            rc: function(args, msg) {
                var target = parseInt(args.pop(), 10),
                    roll = args.join(' ');
                
                sendChat('', '[[' + roll + ']]', function(ops) {
                    var expression = ops[0].inlinerolls[1].expression,
                        total = ops[0].inlinerolls[1].results.total,
                        raises = Math.floor((total - target) / config.raiseSize),
                        rollOut = '<span title="Rollin ' + expression + ' = ',
                        fail = crit = false;
                    
                    _.each(ops[0].inlinerolls[1].results.rolls, function(roll) {
                        var max = roll.sides;
                        
                        if (roll.type !== 'R') { return; }
                        
                        rollOut += '(';
                        _.each(roll.results, function(result) {
                            var value = result.v;
                            crit = crit || (value === max);
                            fail = fail || (value === 1);
                            rollOut += '<span class="basicdiceroll' + (value === max ? ' critsuccess' : (value === 1 ? ' critfail' : '')) + '">';
                            rollOut += value + '</span>+';
                        });
                        rollOut = rollOut.substring(0, rollOut.length - 1) + ')+';
                    });
                    
                    rollOut = rollOut.substr(0, rollOut.length - 1);
                    rollOut += '" class="a inlinerollresult showtip tipsy-n';
                    rollOut += (crit && fail ? ' importantroll' : (crit ? ' fullcrit' : (fail ? ' fullfail' : ''))) + '">' + total + '</span>';
                    
                    bshields.sendChat(msg, '/direct ' + format(config.outputFormat, rollOut, target, raises));
                });
            }
        };
    
    function format(formatString) {
        var args = arguments.slice(1);
        _.each(args, function(arg, index) {
            formatString = formatString.replace('{' + index + '}', arg);
        });
        return formatString;
    }
    
    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = msg.content.trim().splitArgs(),
            command, arg0, isHelp;
        
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
    
    bshields.raiseCount.registerEventHandlers();
});