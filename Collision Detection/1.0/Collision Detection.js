var coldtc = coldtc || {};

coldtc.polygonPaths = [];
coldtc.DONT_MOVE = 1;
coldtc.WARN_PLAYER = 2;
coldtc.STOP_AT_WALL = 4;

/*** SCRIPT SETTINGS ***/
coldtc.pathColor = '#ff00ff'; // Only paths with this color will be used for collisions
coldtc.layer = 'walls'; // Only paths on this layer will be used for collisions; set to 'all' to use all layers
coldtc.behavior = coldtc.STOP_AT_WALL|coldtc.WARN_PLAYER; // behavior for collision events

on('add:path', function(obj) {
    if(obj.get('pageid') != Campaign().get('playerpageid')
        || obj.get('stroke').toLowerCase() != coldtc.pathColor) return;
    if(coldtc.layer != 'all' && obj.get('layer') != coldtc.layer) return;
    
    var path = JSON.parse(obj.get('path'));
    if(path.length > 1 && path[1][0] != 'L') return; // Add fushcia paths on current page's gm layer
    coldtc.polygonPaths.push(obj);
});

on('destroy:path', function(obj) {
    for(var i = 0; i < coldtc.polygonPaths.length; i++)
    {
        if(coldtc.polygonPaths[i].id == obj.id)
        {
            coldtc.polygonPaths = coldtc.polygonPaths.splice(i, 1); // Delete path if they're the same
            break;
        }
    }
});

on('change:path', function(obj, prev) {
    if(coldtc.layer == 'all') return; // changing path layer doesn't matter
    
    if(obj.get('layer') == coldtc.layer && prev.layer != coldtc.layer) // May need to add to list
    {
        if(obj.get('pageid') != Campaign().get('playerpageid')
            || obj.get('stroke').toLowerCase() != coldtc.pathColor) return;
        var path = JSON.parse(obj.get('path'));
        if(path.length > 1 && path[1][0] != 'L') return;
        coldtc.polygonPaths.push(obj);
    }
    if(obj.get('layer') != coldtc.layer && prev.layer == coldtc.layer) // May need to remove from list
    {
        for(var i = 0; i < coldtc.polygonPaths.length; i++)
        {
            if(coldtc.polygonPaths[i].id == obj.id)
            {
                coldtc.polygonPaths = coldtc.polygonPaths.splice(i, 1);
                break;
            }
        }
    }
});

on('change:graphic', function(obj, prev) {
    if(obj.get('subtype') != 'token'
        || (obj.get('top') == prev.top && obj.get('left') == prev.left)) return;
    if(obj.get('represents') != '')
    {
        var character = getObj('character', obj.get('represents'));
        if(character.get('controlledby') == '') return; // GM-only token
    }
    else if(obj.get('controlledby') == '') return; // GM-only token
    
    var l1 = coldtc.L(coldtc.P(prev.left, prev.top), coldtc.P(obj.get('left'), obj.get('top')));
    _.each(coldtc.polygonPaths, function(path) {
        var pointA, pointB;
        var x = path.get('left') - path.get('width') / 2;
        var y = path.get('top') - path.get('height') / 2;
        var parts = JSON.parse(path.get('path'));
        pointA = coldtc.P(parts[0][1] + x, parts[0][2] + y);
        parts.shift();
        _.each(parts, function(pt) {
            pointB = coldtc.P(pt[1] + x, pt[2] + y);
            var l2 = coldtc.L(pointA, pointB);
            var denom = (l1.p1.x - l1.p2.x) * (l2.p1.y - l2.p2.y) - (l1.p1.y - l1.p2.y) * (l2.p1.x - l2.p2.x);
            if(denom != 0) // Parallel
            {
                var intersect = coldtc.P(
                    (l1.p1.x*l1.p2.y-l1.p1.y*l1.p2.x)*(l2.p1.x-l2.p2.x)-(l1.p1.x-l1.p2.x)*(l2.p1.x*l2.p2.y-l2.p1.y*l2.p2.x),
                    (l1.p1.x*l1.p2.y-l1.p1.y*l1.p2.x)*(l2.p1.y-l2.p2.y)-(l1.p1.y-l1.p2.y)*(l2.p1.x*l2.p2.y-l2.p1.y*l2.p2.x)
                );
                intersect.x /= denom;
                intersect.y /= denom;
                
               if(coldtc.isBetween(pointA, pointB, intersect)
                    && coldtc.isBetween(l1.p1, l1.p2, intersect))
                {
                    // Collision event!
                    if((coldtc.behavior&coldtc.DONT_MOVE) == coldtc.DONT_MOVE)
                    {
                        obj.set({
                            left: Math.round(l1.p1.x),
                            top: Math.round(l1.p1.y)
                        });
                    }
                    if((coldtc.behavior&coldtc.WARN_PLAYER) == coldtc.WARN_PLAYER)
                    {
                        var who;
                        if(obj.get('represents'))
                        {
                            var character = getObj('character', obj.get('represents'));
                            who = character.get('name');
                        }
                        else
                        {
                            var controlledby = obj.get('controlledby');
                            if(controlledby == 'all') who = 'all';
                            else
                            {
                                var player =  getObj('player', controlledby);
                                who = player.get('displayname');
                            }
                        }
                        who = who.indexOf(' ') > 0 ? who.substring(0, who.indexOf(' ')) : who;
                        if(who != 'all')
                            sendChat('SYSTEM', '/w '+who+' You are not permitted to move that token into that area.');
                        else
                            sendChat('SYSTEM', 'Token '+obj.get('name')+' is not permitted in that area.');
                    }
                    if((coldtc.behavior&coldtc.STOP_AT_WALL) == coldtc.STOP_AT_WALL)
                    {
                        var vec = coldtc.P(l1.p2.x - l1.p1.x, l1.p2.y - l1.p1.y);
                        var norm = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
                        vec.x /= norm;
                        vec.y /= norm;
                        
                        obj.set({
                            left: intersect.x - vec.x,
                            top: intersect.y - vec.y
                        });
                    }
                }
            }
            
            pointA = coldtc.P(pointB.x, pointB.y);
        });
    });
});

coldtc.P = function(x, y) { return {x: x, y: y}; };
coldtc.L = function(p1, p2) { return {p1: p1, p2: p2}; };
coldtc.isBetween = function(a, b, c) {
    var withinX = (a.x <= c.x && c.x <= b.x) || (b.x <= c.x && c.x <= a.x);
    var withinY = (a.y <= c.y && c.y <= b.y) || (b.y <= c.y && c.y <= a.y);
    return withinX && withinY;
};