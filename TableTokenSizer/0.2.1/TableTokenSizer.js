// Github:   https://github.com/shdwjk/Roll20API/blob/master/TableTokenSizer/TableTokenSizer.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TableTokenSizer = TableTokenSizer || (function() {
    'use strict';

	var version  = '0.2.1',
        lastUpdate = 1427604269,
		gridSize = 70,
		scaleSize = 3,

	sizeTableToken = function(obj, prev) {
		if(obj.get('sides')) {
			if( (gridSize * scaleSize) !== obj.get('width') ) {
				obj.set({
					width: (gridSize * scaleSize),
					height: (gridSize * scaleSize),
					isdrawing: false
				});
			}
		}
	},

	checkInstall = function() {
        log('-=> TableTokenSizer v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	registerEventHandlers = function() {
		on('add:graphic', sizeTableToken);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());


on("ready",function(){
	'use strict';

	TableTokenSizer.CheckInstall();
	TableTokenSizer.RegisterEventHandlers();
});
