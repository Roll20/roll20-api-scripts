// Github:   https://github.com/shdwjk/Roll20API/blob/master/RandomRotate/RandomRotate.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var RandomRotate = RandomRotate || (function(){
	'use strict';

	var version = '0.2.3',
        lastUpdate = 1565053927,

	checkInstall = function(){
          log('-=> RandomRotate v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
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
	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!random-spread</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'Adjusts the location of the selected tokens to a random location within the bounds of the current token positions.'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },


	handleInput = function(msg) {
		var args, tok,
			lx = 100000,
			ly = 100000,
			hx = 0,
			hy = 0,
			optionRotate = false,
			optionGrid = false;

		if ( "api" !== msg.type || !playerIsGM(msg.playerid) ) {
			return;
		}

		args = msg.content.split(/\s+/);

		switch(args[0]) {
			case '!random-spread':
				if(!( msg.selected && msg.selected.length > 0 ) ) {
					showHelp();
					return;
				}
				args = msg.content.split(/\s+--/);
				args.shift();
				while(args.length) {
					tok = args.shift().split(/\s+/);
					switch(tok[0]) {
						case 'rotate':
							optionRotate = true;
							break;
						
						case 'grid':
							optionGrid = true;
							break;
					}
				}

				_.chain(msg.selected)
					.map(function (o) {
						return getObj(o._type,o._id);
					})
					.filter(function(o){
						return 'token' === o.get('subtype');
					})
					.map(function(o){
						lx=Math.min(lx,o.get('left')) || 0;
						ly=Math.min(ly,o.get('top')) || 0;
						hx=Math.max(hx,o.get('left')) || 0;
						hy=Math.max(hy,o.get('top')) || 0;
						return o;
					})
					.each(function(o){
						var x = (randomInteger(hx-lx)+lx),
							y = (randomInteger(hy-ly)+ly),
							mod = { 
								top: y, 
								left: x
							};
						if(optionRotate) {
							mod.rotation  = (randomInteger(360)-1);
						}
						o.set(mod);
					})
					;
				break;            

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
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	RandomRotate.CheckInstall();
	RandomRotate.RegisterEventHandlers();
});
