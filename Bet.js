// Github:   https://github.com/shdwjk/Roll20API/blob/master/Bet/Bet.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Bet = Bet || (function() {
    'use strict';

    var version = '0.1.0',
        lastUpdate = 1445002463,
        schemaVersion = 0.1,

    checkInstall = function() {
		log('-=> Bet v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Bet') || state.Bet.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Bet = {
                version: schemaVersion,
                bets: {}
            };
        }
    },

    handleInput = function(msg) {
        var args, betamt, who;

        if (msg.type !== "api") {
            return;
        }
		who = getObj('player',msg.playerid).get('_displayname');

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!bet':
                betamt = parseInt(args[1],10) || 0;
                state.Bet.bets[msg.playerid] = {
                    bet: betamt,
                    name: msg.who
                };
                sendChat('Bets','/w "'+who+'" You have placed a bet for '+betamt);
                break;

            case '!show':
                if(playerIsGM(msg.playerid)){
                    sendChat('','<div style="border:1px solid #999; border-radius: 1em; padding: .5em; background-color: #ccc;">'+
                        '<div style="text-align: center; font-size: 1.3em; font-weight:bold; border-bottom: 2px solid #999; margin:.5em;">'+
                            'All Bets Revealed'+
                        '</div>'+
                        _.reduce(state.Bet.bets,function(m,bd){
                            return m+'<div>'+
                            '<div style="float:left;font-weight:bold;margin-right: 1em;">'+bd.name+':</div>'+
                            bd.bet+
                        '</div>';
                        },'')+
                    '</div>'
                    );
                    state.Bet = {};
                }
                break;
        }
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

    Bet.CheckInstall();
    Bet.RegisterEventHandlers();
});
