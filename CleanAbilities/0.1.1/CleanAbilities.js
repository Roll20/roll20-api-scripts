// Github:   https://github.com/shdwjk/Roll20API/blob/master/CleanAbilities/CleanAbilities.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var CleanAbilities = CleanAbilities || (function() {
    'use strict';

    var version = '0.1.1',
        lastUpdate = 1430365103,
        schemaVersion = 0.1,

    checkInstall = function() {
    	log('-=> CleanAbilities v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'CleanAbilities') || state.CleanAbilities.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.CleanAbilities = {
                version: schemaVersion
            };
        }
    },

    showHelp = function(who) {
        sendChat('','/w '+who+' '+
            'Help goes here.... sorry..'
        );
    },

    handleInput = function(msg) {
        var args,who;

        if (msg.type !== "api" || !playerIsGM(msg.playerid) ) {
            return;
        }
		who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!clean-abilities':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 5)) {
					showHelp(who);
					return;
				}
                _.each(msg.selected,function (o) {
                    var token=getObj(o._type,o._id);
                    _.each(findObjs({
                            type: 'ability',
                            characterid: token.get('represents')
                        }), 
                        function(a){
                            a.remove();
                    });
                });
                
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

    CleanAbilities.CheckInstall();
    CleanAbilities.RegisterEventHandlers();
});
