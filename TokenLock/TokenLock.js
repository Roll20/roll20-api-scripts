// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenLock/TokenLock.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TokenLock = TokenLock || (function() {
    'use strict';

    var version = 0.11,
		schemaVersion = 0.1,

	performLock = function() {
		if( ! state.TokenLock.locked ) {
			state.TokenLock.locked = true;
		}
		sendChat('TokenLock','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Tokens are now <span style="color: #990000; font-weight: bold;">Locked</span>.'
			+'</div>'
		);
	},
	performUnlock = function() {
		if( state.TokenLock.locked ) {
			state.TokenLock.locked = false;
		}
		sendChat('TokenLock','/w gm '
			+'<div style="border: 1px solid #666666; background: #ffffee;">'
				+'Tokens are now <span style="color: #009900; font-weight: bold;">Unlocked</span>.'
			+'</div>'
		);
	},
	showHelp = function() {
		var stateColor = (state.TokenLock.locked) ? ('#990000') : ('#009900'),
		    stateName  = (state.TokenLock.locked) ? ('Locked') : ('Unlocked');

        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'<div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;font-size: 70%;"><span style="color: '+stateColor+'; font-weight:bold; padding: 0px 4px;">'+stateName+'</span></div>'
		+'TokenLock v'+version
		+'<div style="clear: both"></div>'
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>TokenLock allows the GM to selectively prevent players from moving their tokens. '
		+'Since <i><u>change:graphic</u></i> events to not specify who changed the '
		+'graphic, determination of player tokens is based on whether that token '
		+'has an entry in the <b>controlled by</b> field of either the token or '
		+'the character it represents.  If <b>controlled by</b> is empty, the '
		+'GM can freely move the token at any point.  If there is any entry in '
		+'<b>controlled by</b>, the token can only be moved when TokenLock is '
		+'unlocked. </p>'
		+ '<p>Moving of player controlled cards is still permissible. </p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!tl</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'Executing the command with no arguments prints this help.  The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">lock</span></b> -- Locks the player tokens to prevent moving them.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">unlock</span></b> -- Unlocks the player tokens allowing them to be moved.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },

	HandleInput = function(msg) {
		var args;

		if (msg.type !== "api" || !isGM(msg.playerid) ) {
			return;
		}


		args = msg.content.split(" ");
		switch(args[0]) {
            case '!tl':
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

	HandleMove = function(obj,prev) {
		if(state.TokenLock.locked 
			&& 'token' === obj.get('subtype')
			&& ( obj.get('left') !== prev.left || obj.get('top') !== prev.top || obj.get('rotation') !== prev.rotation )
		) {
			if('' !== obj.get('controlledby')) {
				obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});	
			} else if('' !== obj.get('represents') ) {
				var character = getObj('character',obj.get('represents'));
				if( character && character.get('controlledby') ) {
					obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});	
				}
			}
		}
	},

    CheckInstall = function() {    
        if( ! _.has(state,'TokenLock') || state.TokenLock.version !== TokenLock.schemaVersion)
        {
            /* Default Settings stored in the state. */
            state.TokenLock = {
                version: TokenLock.schemaVersion,
				locked: false
			};
		}
	},

	RegisterEventHandlers = function() {
		on('chat:message', HandleInput);
		on('change:graphic', HandleMove);
	};

	return {
		RegisterEventHandlers: RegisterEventHandlers,
		CheckInstall: CheckInstall
	};
}());

on("ready",function(){
	'use strict';

    var Has_IsGM=false;
    try {
        _.isFunction(isGM);
        Has_IsGM=true;
    }
    catch (err)
    {
        log('--------------------------------------------------------------');
        log('TokenLock requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }

    if( Has_IsGM )
    {
        TokenLock.CheckInstall(); 
        TokenLock.RegisterEventHandlers();
    }
});
