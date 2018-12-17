// Github:   https://github.com/shdwjk/Roll20API/blob/master/SizeLock/SizeLock.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var SizeLock = SizeLock || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604263,
		schemaVersion = 0.1,

	performLock = function() {
		if( ! state.SizeLock.locked ) {
			state.SizeLock.locked = true;
		}
		sendChat('SizeLock','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Token sizes are now <span style="color: #990000; font-weight: bold;">Locked</span>.'
			+'</div>'
		);
	},

	performUnlock = function() {
		if( state.SizeLock.locked ) {
			state.SizeLock.locked = false;
		}
		sendChat('SizeLock','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Token sizes are now <span style="color: #009900; font-weight: bold;">Unlocked</span>.'
			+'</div>'
		);
	},

	showHelp = function() {
		var stateColor = (state.SizeLock.locked) ? ('#990000') : ('#009900'),
		    stateName  = (state.SizeLock.locked) ? ('Locked') : ('Unlocked');

        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'<div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;font-size: 70%;"><span style="color: '+stateColor+'; font-weight:bold; padding: 0px 4px;">'+stateName+'</span></div>'
		+'SizeLock v'+version
		+'<div style="clear: both"></div>'
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>SizeLock allows the GM to toggle the Campaign into a state where '
		+'any time a token is resized, the change is reverted automatically.'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!size-lock</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'Executing the command with no arguments prints this help.  The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">lock</span></b> -- Locks the size of all tokens, reverting any changes automatically.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">unlock</span></b> -- Unlocks the size of all tokens, allowing them to be resized.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },

	handleInput = function(msg) {
		var args;

		if (msg.type !== "api" || !playerIsGM(msg.playerid) ) {
			return;
		}


		args = msg.content.split(" ");
		switch(args[0]) {
            case '!size-lock':
				switch(args[1]) {
					case 'lock':
						performLock();
						break;
					case 'unlock':
						performUnlock();
						break;
					default:
						showHelp();
						break;
				}
                break;
		}

	},

	handleResize = function(obj,prev) {
		if(state.SizeLock.locked 
		&& 'token' === obj.get('subtype')
		&& ( obj.get('width') !== prev.width || obj.get('height') !== prev.height ) ) {
			obj.set({
				width: prev.width,
				height: prev.height,
				top: prev.top,
				left: prev.left
			});
		}
	},

    checkInstall = function() {    
        log('-=> SizeLock v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	
        if( ! _.has(state,'SizeLock') || state.SizeLock.version !== SizeLock.schemaVersion)
            log('  > Updating Schema to v'+schemaVersion+' <');
        {
            /* Default Settings stored in the state. */
            state.SizeLock = {
                version: SizeLock.schemaVersion,
				locked: false
			};
		}
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
		on('change:graphic', handleResize);
	};

	return {
		RegisterEventHandlers: registerEventHandlers,
		CheckInstall: checkInstall
	};
}());

on("ready",function(){
	'use strict';

	SizeLock.CheckInstall(); 
	SizeLock.RegisterEventHandlers();
});
