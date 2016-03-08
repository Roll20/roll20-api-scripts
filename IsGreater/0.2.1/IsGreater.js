// Github:   https://github.com/shdwjk/Roll20API/blob/master/IsGreater/IsGreater.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var IsGreater = IsGreater || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604251,

	checkInstall = function() {
        log('-=> IsGreater v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	handleInput = function(msg) {
		var args;

		if (msg.type !== "api") {
			return;
		}

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']=v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}

		args = msg.content.split(/\s+/);
		switch(args[0]) {

            case '!isgreater':
				if(args[1] > args[2]) {
					sendChat('','Result: Success');
				} else {
					sendChat('','Result: Failure');
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

on("ready",function(){
	'use strict';

	IsGreater.CheckInstall();
	IsGreater.RegisterEventHandlers();
});
