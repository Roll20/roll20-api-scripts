var bshields = bshields || {};
bshields.customfx = (function() {
    'use strict';
    
    var version = 0.1,
        definitionKeyOrder = ['angle', 'angleRandom', 'duration', 'emissionRate', 'endColour', 'endColourRandom', 'gravity', 'lifeSpan',
            'lifeSpanRandom', 'maxParticles', 'size', 'sizeRandom', 'speed', 'speedRandom', 'startColour', 'startColourRandom'],
        defaultDefinition = {
            maxParticles: 100,
            emissionRate: 3,
            size: 35,
            sizeRandom: 15,
            lifeSpan: 10,
            lifeSpanRandom: 3,
            speed: 3,
            speedRandom: 1.5,
            gravity: {x: 0.01, y: 0.01},
            angle: 0,
            angleRandom: 180,
            duration: -1,
            startColour: [220, 35, 0, 1],
            startColourRandom: [62, 0, 0, 0.25],
            endColour: [220, 35, 0, 0],
            endColourRandom:[60, 60, 60, 0]
        },
        commands = {
            createfx: function(args, msg) {
                var name = (args.shift() || '').toLowerCase(),
                    fxDefinition = argsToFxDefinition(args);
                
                if (name.length === 0) {
                    error('noname', msg);
                    return;
                }
                
                createObj('custfx', { name: name, definition: _.defaults(fxDefinition, defaultDefinition) });
            },
            previewfx: function(args, msg) {
                var fxDefinition = argsToFxDefinition(args),
                    pos = { x: cma(), y: cma() },
                    page;
                
                if (state.bshields.customfx.previewDefinition) {
                    state.bshields.customfx.previewDefinition = _.defaults(fxDefinition, state.bshields.customfx.previewDefinition);
                } else {
                    state.bshields.customfx.previewDefinition = _.defaults(fxDefinition, defaultDefinition);
                }
                
                if (previewIntervalId > 0) {
                    clearInterval(previewIntervalId);
                }
                
                if (msg.selected) {
                    pos = _.reduce(msg.selected, function(memo, s) {
                        var obj = getObj(s._type, s._id),
                            x = obj.get('left'),
                            y = obj.get('top');
                        
                        page = page ? page : getObj('page', obj.get('pageid'));
                        memo.x.push(x);
                        memo.y.push(y);
                        return memo;
                    }, pos);
                } else {
                    page = getObj('page', Campaign().get('playerpageid'));
                    pos.x.push(page.get('width') * 70);
                    pos.x.push(0);
                    pos.y.push(page.get('height') * 70);
                    pos.y.push(0);
                }
                
                commands.endpreview();
                previewIntervalId = setInterval(showPreview(pos, page.id), 1000);
            },
            savepreview: function(args, msg) {
                var name = (args.shift() || '').toLowerCase();
                
                if (name.length === 0) {
                    error('noname', msg);
                    return;
                }
                commands.endpreview();
                createObj('custfx', { name: name, definition: state.bshields.customfx.previewDefinition });
                delete state.bshields.customfx.previewDefinition;
            },
            endpreview: function(args, msg) {
                if (previewIntervalId) {
                    clearInterval(previewIntervalId);
                } else {
                    return;
                }
                if (previewIntervalId._idleStart > 0) {
                    clearInterval(previewIntervalId._idleStart);
                }
                previewIntervalId = 0;
            },
            help: function(command, args, msg) {
                if (_.isFunction(commands['help_' + command])) {
                    commands['help_' + command](args, msg);
                }
            },
            help_: function(args, msg) {
                var name = getObj('player', msg.playerid).get('displayname');
                
                sendChat('Custom FX.js', '/w "' + name + '" ' + helpFormat('Help: Custom FX', '<p>The Custom FX script facilitates the creation of new FX '
                    + 'objects for use by GMs from the left toolbar, and by players with the /fx command. Four API commands are exposed by this script (click '
                    + 'on a command for more information):<ul style="list-style:none;margin-left:0"><li>' + helpAPICommand('!help createfx', '!createfx')
                    + ' will create new FX objects directly.</li><li>' + helpAPICommand('!help previewfx', '!previewfx') + ' will let you preview changes to '
                    + 'an effect in real time before saving it.</li><li>' + helpAPICommand('!help savepreview', '!savepreview') + ' will save an effect '
                    + 'created with <strong>!previewfx</strong> as an FX object.</li><li>' + helpAPICommand('!help endpreview', '!endpreview') + ' will halt '
                    + 'the looping preview started by <strong>!previewfx</strong>, but it will not erase the properties saved for the preview.</li></ul></p>',
                    'version ' + version));
            },
            help_createfx: function(args, msg) {
                var name = getObj('player', msg.playerid).get('displayname');
                
                sendChat('Custom FX.js', '/w "' + name + '" ' + helpFormat('Help: !createfx', '<p>Creates a new FX object. <strong>name</strong> will be '
                    + 'used to identify the new FX in the GM\'s FX menu, and it will be used by all players in the campaign for the /fx command. '
                    + '<strong>name</strong> is required.</p><p><strong>properties</strong> is a list of FX properties. Each property may be labeled or not. '
                    + 'Labeled properties take the form <strong>propertyName:propertyValue</strong> (property names are case-sentitive). Unlabeled properties '
                    + 'will be assigned in order: angle, angleRandom, duration, emissionRate, endColour, endColourRandom, gravity, lifeSpan, lifeSpanRandom, '
                    + 'maxParticles, size, sizeRandom, speed, speedRandom, startColour, and startColourRandom.</p><p>Properties representing colors '
                    + '(startColour, endColour, startColourRandom, endColourRandom) should be arrays with four elements: <strong>[red, green, blue, '
                    + 'alpha]</strong> (spaces optional). Red, green, and blue values should be an integer in the range 0-255. Alpha values should be a '
                    + 'decimal number in the range 0-1.</p><p>The gravity property must be specified as an object in the form <strong>{ x: <em>number</em>, '
                    + 'y: <em>number</em> }</strong> (x and y order do not matter, spaces optional).</p><p>Any property value containing spaces must be '
                    + 'enclosed in quotes. !createfx example gravity:"{ x: 5, y: 6 }", !createfx example "gravity:{ x: 5, y: 6 }", and !createfx example '
                    + 'gravity:{x:5,y:6} are all valid.</p>', '!createfx &lt;name&gt; [properties]'));
            },
            help_previewfx: function(args, msg) {
                var name = getObj('player', msg.playerid).get('displayname');
                
                sendChat('Custom FX.js', '/w "' + name + '" ' + helpFormat('Help: !previewfx', '<p>Creates a preview of an FX object. '
                    + '<strong>properties</strong> is a list of FX properties; see ' + helpAPICommand('!help createfx', '!createfx') + ' for details on their '
                    + 'syntax.</p><p>When you call !previewfx, an effect with the specified properties (filling in any unspecified properties with default '
                    + 'values) will spawn at the location of your selected object on the tabletop, or the average of all selected objects if you have '
                    + 'multiple selected, or the center of the current map if nothing is selected. The effect will repeat on an endless loop until you call '
                    + helpAPICommand('!help savepreview', '!savepreview') + ' or ' + helpAPICommand('!help endpreview', '!endpreview') + ', or the API sandbox '
                    + 'restarts.</p><p>Each subsequent time you call !previewfx, the FX preview will update its properties, overwriting its existing ones '
                    + 'with the properties you supply in the newest call to the command. Using labeled properties, this makes it easy to incrementally build '
                    + 'the effect you desire, as you can set one property at a time, and see the changes live.</p><p>This command is extra stressful on the '
                    + 'network connection, so it is not recommended for use while other players are in the game. The properties you\'ve set with this command '
                    + 'will persist between sessions, so long as you do not call <strong>!savepreview</strong>.</p>', '!previewfx [properties]'));
            },
            help_savepreview: function(args, msg) {
                var name = getObj('player', msg.playerid).get('displayname');
                
                sendChat('Custom FX.js', '/w "' + name + '" ' + helpFormat('Help: !savepreview', '<p>Saves the preview FX as an FX object. After settling on '
                    + 'an effect you like using ' + helpAPICommand('!help previewfx', '!previewfx') + ', you can save it, giving it a name, using this '
                    + 'command. This will make the effect available from the FX menu for GMs, and it will be available to all players via the /fx command.</p>',
                    '!savepreview &lt;name&gt;'));
            },
            help_endpreview: function(args, msg) {
                var name = getObj('player', msg.playerid).get('displayname');
                
                sendChat('Custom FX.js', '/w "' + name + '" ' + helpFormat('Help: !endpreview', '<p>Ends the looping animation started by '
                    + helpAPICommand('!help previewfx', '!previewfx') + '. This will not erase the properties set to the preview FX object, it simply stops '
                    + 'displaying the preview.</p>', '!endpreview'));
            }
        },
        errors = {
            noname: 'You must give a name to your FX.'
        },
        previewIntervalId;
    
    function showPreview(pos, pageid) {
        return function() {
            spawnFxWithDefinition(pos.x.value, pos.y.value, state.bshields.customfx.previewDefinition, pageid)
        };
    }
    
    function argsToFxDefinition(args) {
        var propertyTypes = _.partition(args, function(a) {
                return (a.indexOf(':') >= 0 && !/\{\s*x\s*:\s*[0-9]*\.?[0-9]+\s*,\s*y\s*:\s*[0-9]*\.?[0-9]+\s*\}/i.test(a)
                                            && !/\{\s*y\s*:\s*[0-9]*\.?[0-9]+\s*,\s*x\s*:\s*[0-9]*\.?[0-9]+\s*\}/i.test(a)) ||
                       /[a-z]+:\{.*\}/i.test(a);
            }),
            unnamedProperties = propertyTypes[1],
            namedProperties = propertyTypes[0],
            fxDefinition = _.reduce(unnamedProperties, function(memo, val, idx) { return (memo[definitionKeyOrder[idx]] = val,memo); }, {});
        
        _.each(namedProperties, function(prop) {
            var propName = prop.substring(0, prop.indexOf(':')).trim(),
                propVal = prop.substring(prop.indexOf(':') + 1);
            
            fxDefinition[propName] = propVal;
        });
        
        _.each(fxDefinition, function(val, key) {
            var asJSON = tryParseJSON(val),
                isObj = /\{\s*(?:[a-z]+\s*:\s*\S+)?(\s*,\s*[a-z]+\s*:\s*\S+)*\s*\}/i.test(val),
                propList;
            
            if (asJSON || asJSON === 0 || val === 'false' || val === 'null') {
                fxDefinition[key] = asJSON;
                return;
            }
            if (isObj) {
                fxDefinition[key] = {};
                val = val.substring(1, val.length - 1).trim();
                propList = val.splitArgs(',');
                _.each(propList, function(prop) {
                    var propName = prop.substring(0, prop.indexOf(':')).trim(),
                        propVal = prop.substring(prop.indexOf(':') + 1);
                    fxDefinition[key][propName] = tryParseJSON(propVal);
                });
            }
        });
        
        return fxDefinition;
    }
    
    function error(errorKey, msg) {
        var name = getObj('player', msg.playerid).get('displayname');
        
        sendChat('Custom FX.js', '/w "' + name + '" ' + errors[errorKey]);
    }
    
    function tryParseJSON(str) {
        var parsed;
        
        try {
            parsed = JSON.parse(str);
        } catch (e) {
            return false;
        }
        
        return parsed;
    }
    
    function helpAPICommand(command, text) {
        return '<strong><a href="' + command + '" style="padding:0;background:transparent;color:#ce0f69;border:none">' + text + '</a></strong>';
    }
    
    function helpBody(text) {
        return '<div style="padding:5px">' + text + '</div>';
    }
    
    function helpSyntax(text) {
        if (!text) return '';
        return '<div style="font-family:consolas;padding:5px;background-color:#f8e8dd">' + text + '</div>';
    }
    
    function helpTitle(text) {
        return '<h3 style="background-color:purple;border-top-left-radius:4px;border-top-right-radius:4px;padding:5px;color:white">' + text + '</h3>';
    }
    
    function helpFormat(title, body, syntax) {
        return '<div style="border-radius:4px;border:1px solid purple;background-color:white">'
            + helpTitle(title) + helpSyntax(syntax) + helpBody(body) + '</div>';
    }
    
    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = msg.content.trim().splitArgs(),
            command, arg0, isHelp;
        
        if (!playerIsGM(msg.playerid)) return;
        
        if (isApi) {
            command = args.shift().substring(1).toLowerCase();
            arg0 = args.shift() || '';
            isHelp = arg0.toLowerCase() === 'help' || arg0.toLowerCase() === 'h' || command === 'help';
            
            if (!isHelp) {
                if (arg0) {
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
    
    function checkInstall() {
        if (!state.bshields ||
            !state.bshields.customfx ||
            !state.bshields.customfx.version ||
             state.bshields.customfx.version !== version) {
            state.bshields = state.bshields || {};
            state.bshields.customfx = {
                version: version,
                gcUpdated: 0,
            }
        }
        checkGlobalConfig();
    }
    
    function checkGlobalConfig() {
        var gc = globalconfig && globalconfig.customfx,
            st = state.bshields.customfx;
        
        if (gc && gc.lastsaved && gc.lastsaved > st.gcUpdated) {
            st.gcUpdated = gc.lastsaved;
        }
    }
    
    function registerEventHandlers() {
        on('chat:message', handleInput);
    }
    
    function cma() {
        var avg = 0,
            n = 0;
        
        return {
            get value() { return avg; },
            get length() { return n; },
            push: function(num) { return (avg = avg + (num - avg) / ++n); }
        };
    }
    
    return {
        checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.customfx.checkInstall();
    bshields.customfx.registerEventHandlers();
});