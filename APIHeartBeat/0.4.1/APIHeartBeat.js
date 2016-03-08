// Github:   https://github.com/shdwjk/Roll20API/blob/master/APIHeartBeat/APIHeartBeat.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var APIHeartBeat = APIHeartBeat || (function() {
    'use strict';

    var version = '0.4.1',
        lastUpdate = 1427602482,
        schemaVersion = 0.2,
        beatInterval = false,
        beatPeriod = 200,
        devScaleFactor = 5,
        beatCycle = 3000,

    scaleColorRange = function(scale, color1, color2) {
        return _.chain(
            _.zip(
                    _.rest(color1.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/)),
                    _.rest(color2.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/))
                )
            )
            .map(function(d){
                var b1 = parseInt(d[0],16),
                    b2 = parseInt(d[1],16);
                return Math.min(255,Math.max(0,((b2-b1)*scale+b1).toFixed(0))).toString(16);
            })
            .reduce(function(memo,d){
                return memo+(1===d.length ? '0' : '')+d;
            },'#')
            .value();
    },

    animateHeartBeat = function() {
        var cycle = beatCycle * (state.APIHeartBeat.devMode ? 1 : devScaleFactor),
            x = ((Date.now()%cycle)/cycle)*Math.PI*2,
            scale = (Math.sin(x)+1)/2;

        _.chain(state.APIHeartBeat.heartBeaters)
            .map(function(d){
                return {
                    player: getObj('player',d.pid),
                    color1: d.color1,
                    color2: d.color2
                };
            })
            .reject(function(d){
                return !d.player || !d.player.get('online');
            })
            .each(function(d){
                d.player.set({
                    color: scaleColorRange(scale,d.color1,d.color2)
                });
            });
    },

    startStopBeat = function() {
        var userOnline=_.chain(
                    _.keys(state.APIHeartBeat.heartBeaters)
                )
                .map(function(pid){
                    return getObj('player',pid);
                })
                .reject(_.isUndefined)
                .map(function(p){
                    return p.get('online');
                })
                .reduce(function(memo,os){
                    return memo||os;
                },false)
                .value(),
            period=beatPeriod*( state.APIHeartBeat.devMode ? 1 : devScaleFactor );

        if(!beatInterval && _.keys(state.APIHeartBeat.heartBeaters).length && userOnline) {
            beatInterval = setInterval(animateHeartBeat,period);
        } else if(beatInterval && (!_.keys(state.APIHeartBeat.heartBeaters).length || !userOnline) ) {
            clearInterval(beatInterval);
            beatInterval=false;
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
			'/w '+who+' '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'APIHeartBeat v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>APIHeartBeat provides visual feedback that the API is running by changing a user'+ch("'")+'s color periodically.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!api-heartbeat '+ch('<')+'<i>--help</i>|<i>--off</i>|<i>--dev</i>'+ch('>')+' '+ch('[')+ch('<')+'color'+ch('>')+ch(']')+' '+ch('[')+ch('<')+'color'+ch('>')+ch(']')+'</span></b>'

		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This command allows you to turn off and on the monitor, as well as configure it.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'--help'+ch('>')+'</span></b> '+ch('-')+' Displays this help.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'--off'+ch('>')+'</span></b> '+ch('-')+' Turns off the heartbeat for the current player.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'--dev'+ch('>')+'</span></b> '+ch('-')+' Activates development mode. (<b>Warning:</b> This mode updates much more often and could contribute to performance issues, despite being great for script development.)'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'color'+ch('>')+'</span></b> '+ch('-')+' The script alternates between two colors.  If you specify 2 colors, it will use those.  If you specify 1 color, it will use that and your configured color. If you specify no colors, it will go between your configured color and black or red based on brightness.</b>'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
        );
    },

    counterColor = function(color) {
        if(parseInt(
            _.first(
                _.rest(
                    (_.isString(color) ? color : '').match(/^#([0-9a-fA-F]{2})/) || []
                )
            ) || '00',
            16) > 127
        ){
            return '#000000';
        }
        return '#ff0000';
    },

    handleInput = function(msg) {
        var args, errors, player, who, color;

        if (msg.type !== "api" && !playerIsGM(msg.playerid)) {
            return;
        }
        player = getObj('player',msg.playerid);
        who = player && player.get('_displayname').split(' ')[0];

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!api-heartbeat':

                if(_.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }

                if ( _.contains(args,'--off') ) {
                    // turn off
                    if(state.APIHeartBeat.heartBeaters[msg.playerid]) {
                        color = state.APIHeartBeat.heartBeaters[msg.playerid].origColor;
                        delete state.APIHeartBeat.heartBeaters[msg.playerid];
                        startStopBeat();
                        player.set({color: color});
                    }
                    sendChat('APIHeartBeat', '/w '+who+' Off for '+player.get('displayname')+'.');                        
                } else {
                    if ( _.contains(args,'--dev') ) {
                        state.APIHeartBeat.devMode = !state.APIHeartBeat.devMode;
                        clearInterval(beatInterval);
                        beatInterval=false;
                        sendChat('APIHeartBeat', '/w '+who+' Dev Mode is now '+(state.APIHeartBeat.devMode ? 'ON' : 'OFF')+'.');
                        args = _.chain(args).without('--dev').first(2).value();
                        if( ! args.length ) {
                            startStopBeat();
                            return;
                        }
                    }
                    
                    errors=_.reduce(args, function(memo,a){
                            if( ! a.match(/^(?:#?[0-9a-fA-F]{6})$/) ) {
                                memo.push("Invalid color: "+a);
                            }
                            return memo;
                        },[]);

                    if(errors.length) {
                        sendChat('APIHeartBeat', '/w '+who+' Errors: '+errors.join(' '));
                    } else {
                        switch(args.length) {
                            case 2:
                                state.APIHeartBeat.heartBeaters[msg.playerid]= {
                                    pid: msg.playerid,
                                    origColor: player.get('color'),
                                    color1: args[0],
                                    color2: args[1]
                                };
                                break;
                            case 1:
                                state.APIHeartBeat.heartBeaters[msg.playerid]= {
                                    pid: msg.playerid,
                                    origColor: player.get('color'),
                                    color1: player.get('color'),
                                    color2: args[0]
                                };
                                break;
                            default:
                                state.APIHeartBeat.heartBeaters[msg.playerid]= {
                                    pid: msg.playerid,
                                    origColor: player.get('color'),
                                    color1: player.get('color'),
                                    color2: counterColor(player.get('color'))
                                };
                        }
                        sendChat('APIHeartBeat', '/w '+who+' Configured on for '+player.get('displayname')+'.');
                    }
                    startStopBeat();
                }
                break;
        }
    },

    checkInstall = function() {
        log('-=> APIHeartBeat v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'APIHeartBeat') || state.APIHeartBeat.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.APIHeartBeat = {
                version: schemaVersion,
                devMode: false,
                heartBeaters: {}
            };
        }

        startStopBeat();
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:player:_online', startStopBeat);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

	APIHeartBeat.CheckInstall();
	APIHeartBeat.RegisterEventHandlers();
});
