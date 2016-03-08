// Github:   https://github.com/shdwjk/Roll20API/blob/master/DarknessClosingIn/DarknessClosingIn.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var DarknessClosingIn = DarknessClosingIn || (function() {
	'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604242,
		schemaVersion = 0.1,

	checkInstall = function() {
        log('-=> DarknessClosingIn v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
		
        if( ! _.has(state,'DarknessClosingIn') || state.DarknessClosingIn.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.DarknessClosingIn = {
				version: schemaVersion,
				gettingDarker: false
			};
		}
	},

	handleInput = function(msg) {
		var args;

		if (msg.type !== "api" || ! playerIsGM(msg.playerid) ) {
			return;
		}

		args = msg.content.split(/\s+/);
		switch(args[0]) {
			case '!DarknessClosingIn':
				state.DarknessClosingIn.gettingDarker = ! state.DarknessClosingIn.gettingDarker;
				sendChat('','/w gm ' + ( state.DarknessClosingIn.gettingDarker ? 'Darkness is now closing in.' : 'Darkness is no longer closing in.' ) ); 
				break;
		}
    },
	
	gettingDarker = function(obj, prev) {
		if( state.DarknessClosingIn.gettingDarker
			&& ( 
				obj.get("left") !== prev.left
				|| obj.get("top") !== prev.top
			)
		) {
			obj.set({
				light_radius: Math.floor(obj.get("light_radius") * 0.90)
			});
		}
	},


	registerEventHandlers = function() {
		on('chat:message', handleInput);
		on("change:token", gettingDarker);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
    
}());

on('ready',function() {
	'use strict';

	DarknessClosingIn.CheckInstall();
	DarknessClosingIn.RegisterEventHandlers();
});
