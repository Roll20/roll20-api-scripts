// Github:   https://github.com/shdwjk/Roll20API/blob/master/MapLock/MapLock.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global TokenMod */
var MapLock = MapLock || (function() {
    'use strict';

    var version = '0.4.6',
        lastUpdate = 1590190691,
        schemaVersion = 0.4,

    checkInstall = function() {
        log('-=> MapLock v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MapLock') || state.MapLock.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.MapLock = {
                version: schemaVersion,
                highlighting: false,
                locked: {}
            };
        }
    },

    ch = function (c) {
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},

	showHelp = function(who) {
        sendChat('',
            '/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'MapLock v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>MapLock provides a way to lock individual graphics in place.  This prevents them from being moved, resized, or rotated by reverting any of those changes that are made to them.  It also provides tinting of locked items.</p>'
        +'<p><b>Note:</b> Even though it'+ch("'")+'s called MapLock, it works for any graphics on any layers.'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!map-lock '+ch('<')+' <i>lock</i> '+ch('|')+' <i>unlock</i> '+ch('|')+' <i>toggle</i> '+ch('|')+' <i>toggle-highlight</i> '+ch('|')+' <i>--help</i> '+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Adjusts locking options for selected graphics.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">lock</span></b> '+ch('-')+' Adds these graphics to the list of locked items.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">unlock</span></b> '+ch('-')+' Removes these graphics from the list of locked items.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">toggle</span></b> '+ch('-')+' Switched the selected graphics from locked to unlocked or vice versa.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">toggle-highlight</span></b> '+ch('-')+' Turns on or off the red tinting of locked graphics.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the help.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },

    msgPlayer = function(who,msg) {
        sendChat('MapLock','/w "'+who+'" '+
			'<div style="font-weight:bold;font-size: 90%; border: 1px solid #999999; background-color: #ffcccc;">'+
                msg +
            '</div>'
        );
    },
    tintGraphics = function(gids, highlight) {
        _.chain(gids)
            .map(function(id){
                return getObj('graphic',id);
            })
            .reject(_.isUndefined)
            .each(function(o){
                var t = state.MapLock.locked[o.id];
                o.set({
                    tint_color: ( highlight ? '#ff0000' : t || 'transparent')
                });
            });
    },

    handleInput = function(msg) {
        var args,who,ids,cnt=0;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!map-lock':
				who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
                ids=_.pluck(msg.selected,'_id');
                switch(args.shift()) {
                    case 'toggle':
                        if(ids) {
                            _.each(ids,function(id){
                                var o=getObj('graphic',id);
                                ++cnt;
                                if( o && !_.has(state.MapLock.locked,id) ){
                                    state.MapLock.locked[id]=o.get('tint_color');
                                    tintGraphics([id], state.MapLock.highlighting);
                                } else {
                                    tintGraphics([id], false);
                                    delete state.MapLock.locked[id];
                                }
                            });
                            msgPlayer(who, 'Toggled '+cnt+' token'+(1 === cnt ? '' : 's'));

                        } else {
                            msgPlayer(who, '<span style="font-color: #ff0000;">ERROR:</span> Nothing selected.');
                        }
                        break;
                    case 'lock':
                        if(ids) {
                            _.each(ids,function(id){
                                var o=getObj('graphic',id);
                                if( o && !_.has(state.MapLock.locked,id) ){
                                    ++cnt;
                                    state.MapLock.locked[id]=o.get('tint_color');
                                }
                            });
                            tintGraphics(ids, state.MapLock.highlighting);
                            msgPlayer(who, 'Locked '+cnt+' token'+(1 === cnt ? '' : 's'));
                        } else {
                            msgPlayer(who, '<span style="font-color: #ff0000;">ERROR:</span> Nothing selected.');
                        }
                        break;

                    case 'unlock':
                        if(ids) {
                            ids=_.intersection(ids,_.keys(state.MapLock.locked));
                            tintGraphics(ids, false);
                            _.each(ids,function(id){
                                delete state.MapLock.locked[id];
                                ++cnt;
                            });
                            msgPlayer(who, 'Unlocked '+cnt+' token'+(1 === cnt ? '' : 's'));
                        } else {
                            msgPlayer(who, '<span style="font-color: #ff0000;">ERROR:</span> Nothing selected.');
                        }
                        break;

                    case 'toggle-highlight':
                        state.MapLock.highlighting = !state.MapLock.highlighting;
                        tintGraphics(_.keys(state.MapLock.locked), state.MapLock.highlighting);
                        break;

                    case '--help':
                    default:
                        showHelp(who);
                        break;
                }
                break;
        }
    },

	HandleMove = function(obj,prev) {

		if(_.has(state.MapLock.locked, obj.id)
			&& (
                obj.get('left') !== prev.left
                || obj.get('top') !== prev.top
                || obj.get('height') !== prev.height
                || obj.get('width') !== prev.width
                || obj.get('rotation') !== prev.rotation 
            )
		) {
            obj.set({
                left: prev.left,
                top: prev.top,
                height: prev.height,
                width: prev.width,
                rotation: prev.rotation
                });	
		}
	},

    registerEventHandlers = function() {
        on('chat:message', handleInput);
		on('change:graphic', HandleMove);

        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(HandleMove);
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

	MapLock.CheckInstall();
	MapLock.RegisterEventHandlers();
});

