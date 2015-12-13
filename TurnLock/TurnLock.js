// Github:   https://github.com/anthonytasca/roll20-api-scripts/blob/master/TurnLock/TurnLock.js
// By:       Anthony Tasca
// Contact:  https://app.roll20.net/users/1000007/target

var TurnLock = TurnLock || (function(){
    'use strict';
	var tlocked = false;
	
	function handleChat(msg) {
		if (msg.type !== "api" || !playerIsGM(msg.playerid) ) {
			return;
		}
		if(msg.content == "!tlock"){
			tlocked = true;
		}else if(msg.content == "!tunlock"){
			tlocked = false;
		}
	};
	
	function handleMove(obj, prev) {
		if(tlocked && 'token' === obj.get('subtype')){
			var turnOrder = tOrder.Get();
            var current = _.first(turnOrder);
			if( obj && current && current.id === obj.id ){
				return;
			}else{
				obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});
			}
		}
	};
	
	function registerEventHandlers() {
		on('chat:message', handleChat);
		on('change:graphic', handleMove);
	};

	return {
		RegisterEventHandlers: registerEventHandlers
	};
	
}());

on("ready",function(){
	'use strict';
	TurnLock.RegisterEventHandlers();
});

var tOrder = tOrder || {
    Get: function(){
        var to=Campaign().get("turnorder");
        to=(''===to ? '[]' : to); 
        return JSON.parse(to);
    },
}
