var bshields = bshields || {};
bshields.animation = (function() {
    'use strict';
    
    var version = 2.3,
        running = false,
        commands = {
            snapshot: function(args, msg) {
                var player = getObj('player', msg.playerid),
                    pageid = Campaign().get('playerpageid'),
                    dlPaths = findObjs({ type: 'path', pageid: pageid, layer: 'walls' }),
                    frames = parseInt(args[0], 10),
                    pathdata = [];
                
                if (running) {
                    sendChat('System', '/w "' + player.get('displayname') + '" You cannot add a frame while the animation is running.');
                    return;
                }
                
                _.each(dlPaths, function(path) {
                    var obj = {
                        id: path.id,
                        top: path.get('top'),
                        left: path.get('left'),
                        rotation: path.get('rotation'),
                        width: path.get('width'),
                        height: path.get('height'),
                        scaleX: path.get('scaleX'),
                        scaleY: path.get('scaleY')
                    };
                    pathdata.push(obj);
                });
                
                state.bshields.animation.frames.push({ data: pathdata, frames: frames });
            },
            reset: function(args, msg) {
                state.bshields.animation.currentFrame = 0;
                state.bshields.animation.frames = [];
            },
            run: function(args, msg) { running = true; },
            stop: function(args, msg) { running = false; },
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
        
        if (!playerIsGM(msg.playerid)) { return; }
        
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
    
    function runAnimationCycle() {
        var frame = state.bshields.animation.currentFrame,
            frameCount = 0;
        
        setInterval(function() {
            if (!running || !state.bshields.animation.frames[frame]) { return; }
            
            frameCount++;
            if (state.bshields.animation.frames[frame].frames <= frameCount) {
                setupFrame(state.bshields.animation.frames[frame].data);
                frameCount -= state.bshields.animation.frames[frame].frames;
                frame++;
                
                if (frame === state.bshields.animation.frames.length) frame = 0;
                state.bshields.animation.currentFrame = frame;
            }
        }, 50);
    }
    
    function setupFrame(pathdata) {
        _.each(pathdata, function(obj) {
            var path = getObj('path', obj.id);
            path.set({
                top: obj.top,
                left: obj.left,
                rotation: obj.rotation,
                width: obj.width,
                height: obj.height,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY
            });
        });
    }
    
    function checkInstall() {
        if (!state.bshields ||
            !state.bshields.animation ||
            !state.bshields.animation.version ||
             state.bshields.animation.version !== version) {
             state.bshields = state.bshields || {};
             state.bshields.animation = {
                 version: version,
                 frames: [],
                 currentFrame: 0
             }
        }
    }
    
    function registerEventHandlers() {
        on('chat:message', handleInput);
    }
    
    return {
        checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers,
        run: runAnimationCycle
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.animation.checkInstall();
    bshields.animation.registerEventHandlers();
    bshields.animation.run();
});