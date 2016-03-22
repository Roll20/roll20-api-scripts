var animation = animation || {};

// Set to a list of the user IDs for each GM -- only the GM should be able to stop/start the animation!
// You can find your user ID by checking your userpage on the wiki, or the URL of your profile.
animation.gmIDs = [235259];

animation.running = false;

on('chat:message', function(msg) {
    if(msg.type != 'api') return;
    
    // Only use commands coming from a GM
    var isGM = false;
    var player = getObj('player', msg.playerid);
    _.each(animation.gmIDs, function(n) {
        if(player.get('d20userid') == n)
            isGM = true;
    });
    if(!isGM) return;
    
    var parts = msg.content.split(' ');
    var command = parts.shift().substring(1);
    
    switch(command)
    {
        case 'snapshot':
            if(animation.running)
            {
                sendChat("","/w gm You cannot add a frame while the animation is running.");
                break;
            }
            
            var pageid = Campaign().get('playerpageid');
            var dlPaths = findObjs({_type: 'path', _pageid: pageid, layer: 'walls'});
            var frames = parseInt(parts[0], 10);
            var pathdata = [];
            
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
            state.animation.frames.push({ data: pathdata, frames: frames });
            break;
        case 'reset':
            state.animation.curr_frame = 0;
            state.animation.frames = [];
            break;
        case 'run':
            animation.running = true;
            break;
        case 'stop':
            animation.running = false;
            break;
        default:
            break;
    }
});

on('ready', function() {
    if(!state.animation) state.animation = {};
    if(!state.animation.frames) state.animation.frames = [];
    if(!state.animation.curr_frame) state.animation.curr_frame = 0;
    
    var frame = state.animation.curr_frame;
    var frameCount = 0;
    setInterval(function() {
        if(!animation.running) return;
        if(!state.animation.frames[frame]) return;
        
        frameCount++;
        if(state.animation.frames[frame].frames <= frameCount)
        {
            animation.setupFrame(state.animation.frames[frame].data);
            frameCount -= state.animation.frames[frame].frames;
            frame++;
            if(frame == state.animation.frames.length) frame = 0;
            state.animation.curr_frame = frame;
        }
    }, 50);
});

/**
 * Set the paths on the DL layer to the settings for the current animation frame.
 */
animation.setupFrame = function(pathdata) {
    _.each(pathdata, function(obj) {
        var path = getObj('path', obj.id);log(obj);
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
};