// Github:   https://github.com/shdwjk/Roll20API/blob/master/MapSnap/MapSnap.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MapSnap = MapSnap || (function() {
    'use strict';

    var version = '0.1.3',
        lastUpdate = 1435116180,
        schemaVersion = 0.1,

    checkInstall = function() {
		log('-=> MapSnap v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MapSnap') || state.MapSnap.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.MapSnap = {
                version: schemaVersion,
                snap: true,
                config: {
                    map: true,
                    object: true,
                    gmlayer: true
                }
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
        sendChat('','/w '+who+' '+
            '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                    'MapSnap v'+version+
                        '<div style="float:right;"><a href="!map-snap --toggle">'+
                            ( state.MapSnap.snap ? 'ON' :'OFF') +
                        '</a></div>'+
                '</div>'+
                '<div style="padding-left:10px;margin-bottom:3px;">'+
                    '<p>MapSnap provides a mode durning which any created graphics will be aligned to the grid automatically.</p>'+
                '</div>'+
                '<b>Commands</b>'+
                '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">!map-snap [--on|--off|--toggle|--help]</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
                        '<p>Provides a way to turn on and off the snapping of created graphics.</p>'+
                        '<ul>'+
                            '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                                '<b><span style="font-family: serif;">--on</span></b> '+ch('-')+' Turns snapping on.'+
                            '</li> '+
                            '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                                '<b><span style="font-family: serif;">--off</span></b> '+ch('-')+' Turns snapping off.'+
                            '</li> '+
                            '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                                '<b><span style="font-family: serif;">--toggle</span></b> '+ch('-')+' Toggles snapping.'+
                            '</li> '+
                            '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                                '<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Displays the help and configuration options.'+
                            '</li> '+
                        '</ul>'+
                    '</div>'+
                '</div>'+
            '</div>'
        );
    },

    handleInput = function(msg) {
        var args,who;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }
        who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!map-snap':
                switch(args.shift()){
                    case '--on':
                        state.MapSnap.snap=true;
                        break;
                    case '--off':
                        state.MapSnap.snap=false;
                        break;
                    case '--toggle':
                        state.MapSnap.snap=!state.MapSnap.snap;
                        break;
                    default:
                        showHelp(who);
                        return;
                }
                sendChat('MapSnap','/w '+who+' MapSnap is currently: <b>'+(state.MapSnap.snap ? 'ON' : 'OFF')+'</b>');
                break;
        }
    },

    handleAddGraphic = function(obj) {
        if(state.MapSnap.snap) {
            obj.set({
                top: (Math.round((obj.get('top')-(obj.get('height')/2))/70)*70)+(obj.get('height')/2),
                left: (Math.round((obj.get('left')-(obj.get('width')/2))/70)*70)+(obj.get('width')/2)
            });
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('add:graphic', handleAddGraphic);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    MapSnap.CheckInstall();
    MapSnap.RegisterEventHandlers();
});
