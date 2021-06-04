// By:       Matthew Paluch
// Contact:  https://app.roll20.net/users/170911/bad-dm-matthew-p-dot
// Inspired and Aided by the work of The Aaron! Whose Torch and other APIs have added incalcuable value to my games.

var DL = DL || (function() {
    'use strict';

//Global vars

    var version = '0.2',
        lastUpdate = 201809190224,
        schemaVersion = 0.1,

// Function credit to The Aaron from his Torch API
// Convert special characters to "at" codes

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

	showHelp = function(who) {
        sendChat('',
           '/w "'+who+'" '+' Shadow of the Demon Lord API version '+version+' is running!'
          );
    },
	
	handleInput = function(msg) {
//		var args, radius, dim_radius, arc_angle=360, other_players, page, obj, objs=[],who;
		var args;

		if (msg.type !== "api") {
			return;
		}
        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

		args = msg.content.split(" ");
		switch(args[0]) {
			case '!DLstatus':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 5)) {
					showHelp(who);
					return;
				}

// Parse Arguments

//              radius = parseInt(args[1],10) || 40;
//              dim_radius = parseInt(args[2],10) || (radius/2);
//				other_players = _.contains([1,'1','on','yes','true'], args[3] || 1 );

				break;


// Handle rolls that exceed 20 or more with necessary special effects

			case '!DL20plus':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 5)) {
					showHelp(who);
					return;
				}
                
                //

				break;

// Test API for me to debug stuff
// and verify GM only code is working like I expect

			case '!DLtest':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 2)) {
					showHelp(who);
					return;
				}
                
				if(playerIsGM(msg.playerid)) {
					objs=_.chain(args)
						.rest(1)
						.uniq()
						.value();
				}
            
				break;

		}
	},

	checkInstall = function() {
        log('-=> Shadow of the Demon Lord API v'+version+'');
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

	DL.CheckInstall();
	DL.RegisterEventHandlers();
});
