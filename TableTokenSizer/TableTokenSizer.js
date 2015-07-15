// Github:   https://github.com/shdwjk/Roll20API/blob/master/TableTokenSizer/TableTokenSizer.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TableTokenSizer = TableTokenSizer || (function() {
    'use strict';

	var version  = 0.1,
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

	registerEventHandlers = function() {
		on('add:graphic', sizeTableToken);
	};

	return {
		RegisterEventHandlers: registerEventHandlers
	};
}());


on("ready",function(){
	'use strict';

	TableTokenSizer.RegisterEventHandlers();
});
