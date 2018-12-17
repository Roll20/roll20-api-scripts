var bshields = bshields || {};
bshields.Collision = (function() {
    'use strict';
    
    var version = 2.2,
        polygonPaths = [],
        behaviors = {
            DONT_MOVE: 1,
            WARN_PLAYER: 2,
            STOP_AT_WALL: 4
        },
        config = {},
        configDefaults = {
            pathColor: '#ff00ff',
            layer: 'walls',
            behavior: behaviors.STOP_AT_WALL | behaviors.WARN_PLAYER
        };
    
    Object.defineProperties(config, {
        pathColor: {
            get: function() {
                var stPathColor = state.bshields.Collision.config.pathColor;
                
                if (!(stPathColor && (stPathColor.length === 6 || stPathColor.length === 7))) {
                    return configDefaults.pathColor;
                }
                
                if (stPathColor.length === 7) {
                    stPathColor = stPathColor.substr(1);
                }
                if (isNaN(parseInt(stPathColor, 16))) {
                    return configDefaults.pathColor;
                }
                return '#' + stPathColor;
            }
        },
        layer: {
            get: function() {
                var stLayer = state.bshields.Collision.config.layer;
                
                if (!stLayer && stLayer !== 'all' && stLayer !== 'walls' && stLayer !== 'gmlayer' && stLayer !== 'objects' && stLayer !== 'map') {
                    return configDefaults.layer;
                }
                return stLayer;
            }
        },
        behavior: {
            get: function() {
                var stBehavior = state.bshields.Collision.config.behavior;
                
                if (!stBehavior) {
                    return configDefaults.behavior;
                }
                
                switch (stBehavior.toLowerCase()) {
                    case 'don\'t move':
                        return behaviors.DONT_MOVE;
                    case 'warn player':
                        return behaviors.WARN_PLAYER;
                    case 'stop at wall':
                        return behaviors.STOP_AT_WALL;
                    
                    case 'don\'t move & warn player':
                        return behaviors.DONT_MOVE | behaviors.WARN_PLAYER;
                    case 'warn player & stop at wall':
                        return behaviors.WARN_PLAYER | behaviors.STOP_AT_WALL;
                    
                    default:
                        return configDefaults.behavior;
                }
            }
        }
    });
    
    function addPath(obj) {
        var path;
        
        if (obj.get('pageid') !== Campaign().get('playerpageid') ||
            obj.get('stroke').toLowerCase() !== config.pathColor ||
            (config.layer !== 'all' && obj.get('layer') !== config.layer)) { return; }
        
        path = JSON.parse(obj.get('path'));
        if (path.length > 1 && path[1][0] !== 'L') { return; }
        polygonPaths.push(obj);
    }
    
    function destroyPath(obj) {
        polygonPaths = _.reject(polygonPaths, function(path) { return path.id === obj.id; });
    }
    
    function changePath(obj, prev) {
        var path;
        
        if (config.layer === 'all') { return; }
        
        if (obj.get('layer') === config.layer && prev.layer !== config.layer) {
            if (obj.get('pageid') !== Campaign().get('playerpageid') ||
                obj.get('stroke').toLowerCase() !== config.pathColor) { return; }
            
            path = JSON.parse(obj.get('path'));
            if (path.length > 1 && path[1][0] !== 'L') { return; }
            polygonPaths.push(obj);
        }
        
        if (obj.get('layer') !== config.layer && prev.layer === config.layer) {
            polygonPaths = _.reject(polygonPaths, function(path) { return path.id === obj.id; });
        }
    }
    
    function changeGraphic(obj, prev) {
        var character, l1 = L(P(prev.left, prev.top), P(obj.get('left'), obj.get('top')));
        
        if (obj.get('subtype') !== 'token' ||
            (obj.get('top') === prev.top && obj.get('left') === prev.left)) { return; }
        
        if (obj.get('represents') !== '') {
            character = getObj('character', obj.get('represents'));
            if (character.get('controlledby') === '') { return; } // GM-only character
        } else if (obj.get('controlledby') === '') { return; } // GM-only token
        
        _.each(polygonPaths, function(path) {
            var x = path.get('left') - path.get('width') / 2,
                y = path.get('top') - path.get('height') / 2,
                parts = JSON.parse(path.get('path')),
                pointA = P(parts[0][1] + x, parts[0][2] + y);
            parts.shift();
            _.each(parts, function(pt) {
                var pointB = P(pt[1] + x, pt[2] + y),
                    l2 = L(pointA, pointB),
                    denom = (l1.p1.x - l1.p2.x) * (l2.p1.y - l2.p2.y) - (l1.p1.y - l1.p2.y) * (l2.p1.x - l2.p2.x),
                    intersect, who, player, vec, norm;
                
                if (denom !== 0) {
                    intersect = P(
                        (l1.p1.x * l1.p2.y - l1.p1.y * l1.p2.x) * (l2.p1.x - l2.p2.x) - (l1.p1.x - l1.p2.x) * (l2.p1.x * l2.p2.y - l2.p1.y * l2.p2.x),
                        (l1.p1.x * l1.p2.y - l1.p1.y * l1.p2.x) * (l2.p1.y - l2.p2.y) - (l1.p1.y - l1.p2.y) * (l2.p1.x * l2.p2.y - l2.p1.y * l2.p2.x)
                    );
                    intersect.x /= denom;
                    intersect.y /= denom;
                    
                    if (isBetween(pointA, pointB, intersect) &&
                        isBetween(l1.p1, l1.p2, intersect)) {
                        // Collision event!
                        if ((config.behavior & behaviors.DONT_MOVE) === behaviors.DONT_MOVE) {
                            obj.set({
                                left: Math.round(l1.p1.x),
                                top: Math.round(l1.p1.y)
                            });
                        }
                        
                        if ((config.behavior & behaviors.WARN_PLAYER) === behaviors.WARN_PLAYER) {
                            if (obj.get('represents')) {
                                character = getObj('character', obj.get('represents'));
                                who = character.get('name');
                            } else if (obj.get('controlledby') === 'all') {
                                who = 'all';
                            } else {
                                player = getObj('player', obj.get('controlledby'));
                                who = player.get('displayname');
                            }
                            
                            if (who !== 'all') {
                                sendChat('System', '/w "' + who + '" You are not permitted to move that token into that area.');
                            } else {
                                sendChat('System', 'Token ' + obj.get('name') + ' is not permitted in that area.');
                            }
                        }
                        
                        if ((config.behavior & behaviors.STOP_AT_WALL) === behaviors.STOP_AT_WALL) {
                            vec = P(l1.p2.x - l1.p1.x, l1.p2.y - l1.p1.y);
                            norm = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
                            vec.x /= norm;
                            vec.y /= norm;
                            
                            obj.set({
                                left: intersect.x - vec.x,
                                top: intersect.y - vec.y
                            });
                        }
                    }
                }
                
                pointA = P(pointB.x, pointB.y);
            });
        });
    }
    
    function P(x, y) { return { x: x, y: y}; }
    function L(p1, p2) { return { p1: p1, p2: p2 }; }
    
    function isBetween(a, b, c) {
        var withinX = (a.x <= c.x && c.x <= b.x) || (b.x <= c.x && c.x <= a.x),
            withinY = (a.y <= c.y && c.y <= b.y) || (b.y <= c.y && c.y <= a.y);
        return withinX && withinY;
    }
    
    function registerEventHandlers() {
        _.each(findObjs({ type: 'path' }), addPath)
        on('add:path', addPath);
        on('destroy:path', destroyPath);
        on('change:path', changePath);
        on('change:graphic', changeGraphic);
    }
    
    function checkInstall() {
        if (!state.bshields ||
            !state.bshields.Collision ||
            !state.bshields.Collision.version ||
             state.bshields.Collision.version !== version) {
            state.bshields = state.bshields || {};
            state.bshields.Collision = {
                version: version,
                gcUpdated: 0,
                config: {}
            }
        }
        checkGlobalConfig();
    }
    
    function checkGlobalConfig() {
        var gc = globalconfig && globalconfig.collisiondetection,
            st = state.bshields.Collision;
        
        if (gc && gc.lastsaved && gc.lastsaved > st.gcUpdated) {
            st.gcUpdated = gc.lastsaved;
            st.config.pathColor = gc['Path Color'];
            st.config.layer = gc.Layer;
            st.config.behavior = gc.Behavior;
        }
    }
    
    return {
        checkInstall: checkInstall,
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.Collision.checkInstall();
    bshields.Collision.registerEventHandlers();
});
