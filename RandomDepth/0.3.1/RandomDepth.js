// Github:   https://github.com/shdwjk/Roll20API/blob/master/RandomDepth/RandomDepth.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var RandomDepth = RandomDepth || (function() {
    'use strict';

    var version = '0.3.1',
        lastUpdate = 1427604261,

	checkInstall = function() {
        log('-=> RandomDepth v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	randomToFrontList = function (l) {
		if( l.length ) {
			var i = randomInteger(l.length)-1;
			toFront(l[i]);
			if( l.length > 1) {
				setTimeout(_.partial(randomToFrontList,_.without(l,l[i])),5);
			}
		}
	},
    
    handleMessages = function(msg)
    {
		if('api' !== msg.type ) {
			return;
		}

		var args = msg.content.split(/\s+/),
			objs;

		switch(args.shift())
		{
			case '!random-depth':
				objs = _.chain(msg.selected)
					.map(function(o){
						return getObj(o._type,o._id);
					})
					.reject(_.isUndefined)
					.value();

				randomToFrontList(objs);
				break;
		}
    },

    registerEventHandlers = function(){
        on('chat:message',handleMessages);
    };

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
    
}());

on('ready',function(){
	'use strict';

    RandomDepth.CheckInstall();
    RandomDepth.RegisterEventHandlers();
});
