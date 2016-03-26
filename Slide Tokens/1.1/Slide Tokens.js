var bshields = bshields || {};
bshields.translateToken = (function() {
    'use strict';
    
    var version = 1.1,
        directions = {
            '': { flip1: false, flip2: false },
            absolute: { flip1: false, flip2: false },
            a: { flip1: false, flip2: false },
            x: { flip1: false, flip2: false },
            y: { flip1: false, flip2: false },
            xy: { flip1: false, flip2: false },
            top: { flip1: false, flip2: false },
            t: { flip1: false, flip2: false },
            left: { flip1: false, flip2: false },
            l: { flip1: false, flip2: false },
            'top-left': { flip1: false, flip2: false },
            tl: { flip1: false, flip2: false },
            bottom: { flip1: true, flip2: false },
            b: { flip1: true, flip2: false },
            right: { flip1: true, flip2: false },
            r: { flip1: true, flip2: false },
            'bottom-left': { flip1: true, flip2: false },
            bl: { flip1: true, flip2: false },
            'bottom-right': { flip1: true, flip2: true },
            br: { flip1: true, flip2: true },
            'top-right': { flip1: false, flip2: true },
            tr: { flip1: false, flip2: true }
        },
        consts = {
            SQUARES: 0,
            UNITS: 1,
            ABSOLUTE: 2,
            MODE_STRINGS: ['SQUARES', 'UNITS', 'ABSOLUTE']
        },
        moveQueue = {},
        pathCache = [],
        commands = {
            movetok: function(args, msg) {
                var caller = getObj('player', msg.playerid).get('displayname'),
                    tokens = [];
                
                if (msg.selected) {
                    tokens = _.chain(msg.selected)
                        .map(function(item) {
                            if (item._type !== 'graphic') {
                                return null;
                            }
                            return getObj('graphic', item._id);
                        }).filter(function(item) {
                            return item !== null;
                        }).value();
                }
                
                if (tokens.length === 0) {
                    sendChat('System', '/w "' + caller + '" No token(s) selected.');
                    return;
                }
                
                _.each(args, function(arg) {
                    var argType = '',
                        colonIndex = arg.indexOf(':'),
                        commaIndex, coord1 = 0, coord2 = 0;
                    
                    if (colonIndex >= 0) {
                        argType = arg.substring(0, colonIndex);
                        arg = arg.substring(colonIndex + 1);
                    }
                    
                    commaIndex = arg.indexOf(',');
                    if (commaIndex >= 0) {
                        coord1 = parseFloat(arg.substring(0, commaIndex), 10);
                        coord2 = parseFloat(arg.substring(commaIndex + 1), 10);
                    } else {
                        coord1 = parseFloat(arg, 10);
                    }
                    
                    if (!directions[argType]) {
                        sendChat('System', '/w "' + caller + '" Direction "' + argType + '" unknown');
                        return;
                    } else {
                        if (directions[argType].flip1) {
                            coord1 = -coord1;
                        }
                        if (directions[argType].flip2 && coord2) {
                            coord2 = -coord2;
                        }
                    }
                    
                    switch (argType) {
                        case 'a':
                        case 'absolute':
                            moveTokensTo(tokens, coord1, coord2);
                            break;
                        case 'x':
                        case 'left':
                        case 'l':
                        case 'right':
                        case 'r':
                            moveTokensBy(tokens, coord1, 0);
                            break;
                        case 'y':
                        case 'top':
                        case 't':
                        case 'bottom':
                        case 'b':
                            moveTokensBy(tokens, 0, coord1);
                            break;
                        case '':
                        case 'xy':
                        case 'top-left':
                        case 'tl':
                        case 'top-right':
                        case 'tr':
                        case 'bottom-left':
                        case 'bl':
                        case 'bottom-right':
                        case 'br':
                            moveTokensBy(tokens, coord1, coord2);
                            break;
                    }
                });
                
                executeMoveQueue(true);
            },
            mode: function(args, msg) {
                var caller = getObj('player', msg.playerid).get('displayname');
                
                if (!playerIsGM(msg.playerid)) {
                    sendChat('System', '/w "' + caller + '" The !mode command requires GM permissions.');
                    return;
                }
                
                switch ((args[0] || '').toLowerCase()) {
                    case 's':
                    case 'sq':
                    case 'square':
                    case 'squares':
                        state.bshields.translateToken.mode = consts.SQUARES;
                        sendChat('System', '/w "' + caller + '" The mode is now '
                            + consts.MODE_STRINGS[state.bshields.translateToken.mode]);
                        break;
                    case 'u':
                    case 'un':
                    case 'unit':
                    case 'units':
                        state.bshields.translateToken.mode = consts.UNITS;
                        sendChat('System', '/w "' + caller + '" The mode is now '
                            + consts.MODE_STRINGS[state.bshields.translateToken.mode]);
                        break;
                    case 'a':
                    case 'abs':
                    case 'absolute':
                        state.bshields.translateToken.mode = consts.ABSOLUTE;
                        sendChat('System', '/w "' + caller + '" The mode is now '
                            + consts.MODE_STRINGS[state.bshields.translateToken.mode]);
                        break;
                    default:
                        sendChat('System', '/w "' + caller + '" The current mode is '
                            + consts.MODE_STRINGS[state.bshields.translateToken.mode]);
                        break;
                }
            },
            help: function(command, args, msg) {
                if (_.isFunction(commands['help_' + command])) {
                    commands['help_' + command](args, msg);
                }
            }
        };
    
    function moveTokensBy(tokens, x, y) {
        var page = getObj('page', tokens[0].get('pageid')),
            gridSize = page.get('snapping_increment'),
            gridScale = page.get('scale_number');
        
        _.each(tokens, function(tok) {
            var queueEntry = moveQueue[tok.id],
                queueList = queueEntry ? queueEntry.moves : [{
                    top: tok.get('top'),
                    left: tok.get('left')
                }],
                top = queueList[queueList.length - 1].top,
                left = queueList[queueList.length - 1].left;
            
            switch (state.bshields.translateToken.mode) {
                case consts.SQUARES:
                    top += y * 70 * gridSize;
                    left += x * 70 * gridSize;
                    break;
                case consts.UNITS:
                    top += y / gridScale * 70;
                    left += x / gridScale * 70;
                    break;
                case consts.ABSOLUTE:
                    top += y;
                    left += x;
                    break;
            }
            pushMoveQueue(tok, left, top);
        });
    }
    
    function moveTokensTo(tokens, x, y) {
        var page = getObj('page', tokens[0].get('pageid')),
            gridSize = page.get('snapping_increment'),
            gridScale = page.get('scale_number');
        
        _.each(tokens, function(tok) {
            var left, top;
            
            switch(state.bshields.translateToken.mode) {
                case consts.SQUARES:
                    top = y * 70 * gridSize;
                    left = x * 70 * gridSize;
                    break;
                case consts.UNITS:
                    top = y / gridScale * 70;
                    left = x / gridScale * 70;
                    break;
                case consts.ABSOLUTE:
                    top = y;
                    left = x;
                    break;
            }
            pushMoveQueue(tok, left, top);
        });
    }
    
    function pushMoveQueue(tok, x, y) {
        if (moveQueue[tok.id]) {
            moveQueue[tok.id].moves.push({
                top: y,
                left: x
            });
        } else {
            moveQueue[tok.id] = {
                token: tok,
                moves: [{
                    top: y,
                    left: x
                }],
                waypoints: []
            };
        }
    }
    
    function executeMoveQueue(drawPath) {
        var tokensChanged = false,
            pageid = _.values(moveQueue)[0].token.get('pageid');
        
        if (drawPath) {
            // Draw the path we're going to move the token along
            _.each(moveQueue, function(mvData) {
                var tok = mvData.token,
                    tokPosition = {
                        top: tok.get('top'),
                        left: tok.get('left')
                    },
                    allPoints = _.union(mvData.moves, [tokPosition]),
                    pathBounds = {
                        top: _.min(allPoints, function(pos) { return pos.top; }).top,
                        right: _.max(allPoints, function(pos) { return pos.left; }).left,
                        bottom: _.max(allPoints, function(pos) { return pos.top; }).top,
                        left: _.min(allPoints, function(pos) { return pos.left; }).left
                    },
                    path = [
                        ['M', tokPosition.left - pathBounds.left, tokPosition.top - pathBounds.top]
                    ];
                
                tok.set('lastmove', '');
                
                _.each(mvData.moves, function(pos, index, list) {
                    var waypointPath = [
                        ['M', 0, 5],
                        ['C', 0, 2.5, 2.5, 0, 5, 0],
                        ['C', 7.5, 0, 10, 2.5, 10, 5],
                        ['C', 10, 7.5, 7.5, 10, 5, 10],
                        ['C', 2.5, 10, 0, 7.5, 0, 5]
                    ];
                    
                    if (index < list.length - 1) {
                        pathCache.push(fixedCreateObj('path', {
                            _pageid: pageid,
                            _path: JSON.stringify(waypointPath),
                            fill: '#ffff00',
                            stroke: '#ffff00',
                            stroke_width: 4,
                            rotation: 0,
                            layer: 'objects',
                            width: 10,
                            height: 10,
                            top: pos.top,
                            left: pos.left
                        }));
                    }
                    
                    path.push(['L', pos.left - pathBounds.left, pos.top - pathBounds.top]);
                });
                
                pathCache.push(fixedCreateObj('path', {
                    _pageid: pageid,
                    _path: JSON.stringify(path),
                    fill: 'transparent',
                    stroke: '#ffff00',
                    stroke_width: 4,
                    rotation: 0,
                    layer: 'objects',
                    width: pathBounds.right - pathBounds.left,
                    height: pathBounds.bottom - pathBounds.top,
                    top: pathBounds.top + (pathBounds.bottom - pathBounds.top) / 2,
                    left: pathBounds.left + (pathBounds.right - pathBounds.left) / 2
                }));
            });
        }
        
        _.each(moveQueue, function(mvData) {
            var nextPosition = mvData.moves.shift();
            
            if (nextPosition) {
                // Move the token to the next waypoint
                tokensChanged = true;
                mvData.waypoints.push({
                    top: mvData.token.get('top'),
                    left: mvData.token.get('left')
                });
                mvData.token.set(nextPosition);
            }
        });
        
        if (tokensChanged) {
            // If we moved the token, wait 600ms before going to the next waypoint
            setTimeout(executeMoveQueue, 600);
        } else {
            // We're done moving, so clean up
            _.each(moveQueue, function(mvData) {
                var lastmove = [];
                
                _.each(mvData.waypoints, function(pos) {
                    lastmove.push(pos.left);
                    lastmove.push(pos.top);
                });
                
                mvData.token.set('lastmove', lastmove.join(','));
            });
            moveQueue = {};
            
            _.each(pathCache, function(path) {
                var w = path.get('width'),
                    h = path.get('height');
                
                // object.remove only available on dev currently
                //path.remove();
                path.set({
                    top: 70,
                    left: 70,
                    scaleX: w > 70 ? 70 / path.get('width') : 1,
                    scaleY: h > 70 ? 70 / path.get('height') : 1,
                    layer: 'gmlayer'
                });
            })
            pathCache = [];
        }
    }
    
    function fixedCreateObj() {
		var obj = createObj.apply(this, arguments);
		if (obj && !obj.fbpath) {
			obj.fbpath = obj.changed._fbpath.replace(/([^\/]*\/){4}/, "/");
		}
		return obj;
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
    
    function checkInstall() {
        if (!state.bshields ||
            !state.bshields.translateToken ||
            !state.bshields.translateToken.version ||
             state.bshields.translateToken.version !== version) {
             state.bshields = state.bshields || {};
             state.bshields.translateToken = {
                version: version,
                mode: consts.SQUARES
             };
        }
    }
    
    function registerEventHandlers() {
        on('chat:message', handleInput);
    }
    
    return {
        checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.translateToken.checkInstall();
    bshields.translateToken.registerEventHandlers();
});