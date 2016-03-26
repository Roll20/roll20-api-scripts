// Github:   https://github.com/shdwjk/Roll20API/blob/master/MovePlayers/MovePlayers.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MovePlayers = MovePlayers || (function() {
    'use strict';

	var version = '0.2.1',
        lastUpdate = 1427604257,

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

	checkInstall = function() {
        log('-=> MovePlayers v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	showHelp = function() {
        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'MovePlayers v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>MovePlayers provides facilities for moving your players around at will.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!move-players-to-same-page-as '+ch('<')+'Token ID'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Moves the Players ribbon to the same page as the token identified by <b>Token ID</b>.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' The token_id for the token whose page the players should be moved to.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },
	
	handleInput = function(msg) {
		var args, obj;

		if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
			return;
		}

		args = msg.content.split(" ");
		switch(args[0]) {
			case '!move-players-to-same-page-as':
				if('--help' === args[1] || args.length < 2) {
					showHelp();
					return;
				}

				obj=getObj('graphic',args[1]);

				if(!obj) {
					sendChat('','/w gm No token found for id: '+args[1]);	
				} else {
					Campaign().set({
						playerpageid: obj.get('pageid')
						});
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

	MovePlayers.CheckInstall();
	MovePlayers.RegisterEventHandlers();
});
