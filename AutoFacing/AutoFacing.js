// Github:   https://github.com/kkragenbrink/Roll20API/blob/master/AutoFacing/AutoFacing.js
// By:       Kevin Kragenbrink
// Contact:  https://app.roll20.net/users/15313/damnedmage

var BIAS = 45; // Default rotation of your token, in degrees.
var ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315]; // Possible snaps;
var SNAP_TO_GRID = true; // Whether to snap.

var calculateRotation = function (from, to) {
    var deltaY = to.top - from.top;
    var deltaX = to.left - from.left;
    log('to.top=' + to.top + ', to.left=' + to.left);
    log('from.top=' + from.top + ', from.left=' + from.left);
    
    var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    angleInDegrees += BIAS;
    
    if (angleInDegrees >= 360) { angleInDegrees -= 360; }
    if (angleInDegrees < 0) { angleInDegrees += 360; }
    if (SNAP_TO_GRID) { angleInDegrees = closestRotation(angleInDegrees); }
    
    log('angle=' + angleInDegrees);
    return angleInDegrees;
    
}

var closestRotation = function (angle) {
    var current = 720;
    
    var length = ROTATIONS.length;
    while (length--) {
        if (Math.abs(angle - ROTATIONS[length]) < Math.abs(angle - current)) {
            current = ROTATIONS[length];
        }
    }
    
    log('current=' + current);
    return current;
}

var isObjectToken = function (obj) {
    return obj.get('layer') === 'objects';
}

var hasObjectMoved = function (obj, prev) {
    return obj.get('left') != prev['left'] || obj.get('top') != prev['top'];
}

var parseMoves = function (moves) {
    moves = moves.split(',').reverse();
    
    var length = moves.length;
    var parsed = [];
    while (length) {
        parsed.push({
            left: Math.floor(moves[--length]),
            top: Math.floor(moves[--length])
        });
    }
    
    return parsed;
}

on('change:graphic', function (obj, prev) {
    if (isObjectToken(obj) && hasObjectMoved(obj, prev)) {
        var moveList = parseMoves(obj.get('lastmove'));
        moveList.push({
            left: Math.ceil(obj.get('left')),
            top: Math.ceil(obj.get('top'))
        });
        var moves = moveList.length;
        
        var to = moveList[--moves];
        var from = moveList[--moves];

        obj.set('rotation', calculateRotation(from, to));
    }
});
