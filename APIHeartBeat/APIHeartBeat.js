// Github:   https://github.com/shdwjk/Roll20API/blob/master/APIHeartBeat/APIHeartBeat.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var APIHeartBeat = APIHeartBeat || (function() {
    'use strict';

    var version = 0.1,
        schemaVersion = 0.1,
        beatInterval = false,
        beatPeriod = 400,
        beatCycle = (beatPeriod * 8),

    animateHeartBeat = function() {
        var x = (Date.now()%beatCycle)*12.5,
            scale = Math.max(0, ( Math.sin( (x-1)/2) - Math.sin(x-(1+(Math.PI/2))))),
	        beatColor = Math.round(0xff*scale).toString(16)+'0000';

        _.chain(state.APIHeartBeat.heartBeaters)
            .map(function(pid){
                return getObj('player',pid);
            })
            .filter(_.isUndefined)
            .each(function(p){
                p.set({
                    color: beatColor
                });
            });
    },

    startStopBeat = function() {
        if(!beatInterval && state.APIHeartBeat.heartBeaters.length) {
            beatInterval = setInterval(animateHeartBeat,beatPeriod);
        } else if(beatInterval && !state.APIHeartBeat.heartBeaters.length) {
            clearInterval(beatInterval);
        }
    },

    handleInput = function(msg) {
        var args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!api-heartbeat':
                if(_.contains(state.APIHeartBeat.heartBeaters, msg.playerid)) {
                    state.APIHeartBeat.heartBeaters=_.without(state.APIHeartBeat.heartBeaters, msg.playerid);
                } else {
                    state.APIHeartBeat.heartBeaters.push(msg.playerid);
                }

                startStopBeat();

                break;
        }
    },

    checkInstall = function() {
        if( ! _.has(state,'APIHeartBeat') || state.APIHeartBeat.version !== schemaVersion) {
            log('APIHeartBeat: Resetting state');
            state.APIHeartBeat = {
                version: schemaVersion,
                heartBeaters: []
            };
        }

        startStopBeat();
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    if("undefined" !== typeof isGM && _.isFunction(isGM)) {
		APIHeartBeat.CheckInstall();
		APIHeartBeat.RegisterEventHandlers();
    } else {
        log('--------------------------------------------------------------');
        log('APIHeartBeat requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }
});
