var bshields = bshields || {};
bshields.raiseCount = (function() {
    'use strict';
    
    var version = 2.5,
        config = {},
        configDefaults = {
            raiseSize: 4,
            outputFormat: 'Roll: {0}, Target: {1}, Raises: {2}'
        },
        commands = {
            rc: function(args, msg) {
                var target = parseInt(args.pop(), 10),
                    roll = args.join(' ');
                
                sendChat('', '[[' + roll + ']]', function(ops) {
                    var inline = _.sortBy(ops[0].inlinerolls, function(rolldata, index) {
                            // Force inline rolls into 0-index array, should work on both prod and dev
                            return index;
                        })[0],
                        expression = inline.expression,
                        total = inline.results.total,
                        raises = Math.floor((total - target) / config.raiseSize),
                        rollOut = '<span title="Rollin ' + expression + ' = ',
                        fail = crit = false;
                    
                    _.each(inline.results.rolls, function(roll) {
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
            },
            help: function(command, args, msg) {
                if (_.isFunction(commands['help_' + command])) {
                    commands['help_' + command](args, msg);
                }
            }
        };
    
    Object.defineProperties(config, {
        raiseSize: {
            get: function() {
                var stRaiseSize = state.bshields.raiseCount.config.raiseSize;
                
                if (!stRaiseSize) {
                    return configDefaults.raiseSize;
                }
                return stRaiseSize;
            }
        },
        outputFormat: {
            get: function() {
                var stOutputFormat = state.bshields.raiseCount.config.outputFormat;
                
                if (!stOutputFormat) {
                    return configDefaults.outputFormat;
                }
                return stOutputFormat;
            }
        }
    });
    
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
    
    function checkInstall() {
        if (!state.bshields ||
            !state.bshields.raiseCount ||
            !state.bshields.raiseCount.version ||
             state.bshields.raiseCount.version !== version) {
            state.bshields = state.bshields || {};
            state.bshields.raiseCount = {
                version: version,
                gcUpdated: 0,
                config: {}
            };
        }
        checkGlobalConfig();
    }
    
    function checkGlobalConfig() {
        var gc = globalconfig && globalconfig.raisecount,
            st = state.bshields.raiseCount;
        
        if (gc && gc.lastsaved && gc.lastsaved > st.gcUpdated) {
            st.gcUpdated = gc.lastsaved;
            st.config.raiseSize = gc['Raise Size'];
            st.config.outputFormat = gc['Output Format'];
        }
    }
    
    return {
        checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.raiseCount.checkInstall();
    bshields.raiseCount.registerEventHandlers();
});