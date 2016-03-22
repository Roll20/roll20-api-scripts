// Github:   https://github.com/shdwjk/Roll20API/blob/master/Tile/Tile.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Tile = Tile || (function() {
    'use strict';

    var version = '0.3.1',
        lastUpdate = 1427604272,
        tileNextMove = false,

    getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|max)(.*)$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3];
        }
        return;
    },

    handleInput = function(msg) {
        var args;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!tile-next-move':
                tileNextMove=true;
                sendChat('Tile', '/w gm Tiling next move on the map layer.');
                break;
        }
    },

    handleMove = function(obj, prev) {
        var img, 
            ax,ay,
            sx,sy,
            cx,cy,
            ix,iy,
            t
            ;

        if( tileNextMove
            && 'map' === obj.get('layer')
            && ( obj.get('left') !== prev.left || obj.get('top') !== prev.top)
        ) {
            img = getCleanImgsrc(obj.get('imgsrc'));
            if(img) {
                ax = prev.left;
                ay = prev.top;
                sx = obj.get('width') * (prev.left < obj.get('left') ? 1 : -1 );
                sy = obj.get('height') * (prev.top < obj.get('top') ? 1 : -1 );
                cx = Math.round(Math.abs((obj.get('left')-prev.left)/sx));
                cy = Math.round(Math.abs((obj.get('top')-prev.top)/sy));
                t = {
                    imgsrc: img,
                    pageid: obj.get('pageid'),
                    layer: 'map',
                    width: prev.width,
                    height: prev.height       
                };
                for(ix=0;ix<=cx;++ix) {
                    for(iy=0;iy<=cy;++iy) {
                        t.left = (ax + (sx * ix) );
                        t.top = (ay + (sy * iy) );
                        if(ix === cx && iy === cy ) {
                            obj.set({
                                left: t.left,
                                top: t.top
                                });
                        } else {
                            createObj('graphic',t);
                        }
                    }
                }

            } else {
                sendChat('Tile','/w gm Can only tile with images in a User Library.');
            }
            tileNextMove = false;
        }
    },

	checkInstall = function() {
        log('-=> Tile v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

    registerEventHandlers = function() {
        on('change:graphic', handleMove);
        on('chat:message', handleInput);
    };

    return {
		CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

	Tile.CheckInstall();
	Tile.RegisterEventHandlers();
});
