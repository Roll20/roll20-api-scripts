// Github:   https://github.com/shdwjk/Roll20API/blob/master/RandomRotate/RandomRotate.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var RandomRotate = RandomRotate || (function(){
    'use strict';

	var version = 0.1,

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

	showHelp = function() {
        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'RandomRotate v'+version
		+'<div style="clear: both"></div>'
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>Allows the GM to easily randomize the rotation of the selected tokens.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!random-rotate</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'Adjusts the rotation of all the selected tokens to a random angle.'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },


	handleInput = function(msg) {
		var args;
        
		if ( "api" !== msg.type || !isGM(msg.playerid) ) {
			return;
		}

		args = msg.content.split(/\s+/);
		
		switch(args[0]) {
			case '!random-rotate':
				if(!( msg.selected && msg.selected.length > 0 ) ) {
					showHelp();
					return;
				}

				_.chain(msg.selected)
					.map(function (o) {
						return getObj(o._type,o._id);
					})
					.filter(function(o){
						return 'token' === o.get('subtype');
					})
					.each(function(o){
						o.set({rotation: (randomInteger(360)-1)});
					})
					;
				break;

		}

	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

    if("undefined" !== typeof isGM && _.isFunction(isGM)) {
		RandomRotate.RegisterEventHandlers();
    } else {
        log('--------------------------------------------------------------');
        log('RandomRotate requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }
});
