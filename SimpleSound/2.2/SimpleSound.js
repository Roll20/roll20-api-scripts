/**
 * simplesound.js
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * The goal of this script is to play/stop sound effects from the Roll20 Jukebox
 * via commandline.
 * 
 *      Syntax:
 * 
 *      !splay [sound name] - play the named sound effect
 *      !sstop [sound name] - stop the named sound effect
 *      !swhisper - toggle the GM whisper status
 *      !sstop - stop all tracks currently playing
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Revison History:
 * 
 * 0.2.0 - Added the !swhisper command to endable/disable whispers via command
 * 0.2.1 - Modified !sstop to stop all tracks with no variable
 * 0.2.2 - fixed modification of msg object (affecting other scripts)
 * 
 */
var simpleSound = simpleSound || (function(){
    'use strict';

    var playSound = function(trackname, action) {
        var track = findObjs({type: 'jukeboxtrack', title: trackname})[0];
        if(track) {
            track.set('playing',false);
            track.set('softstop',false);
			if(action == 'play'){
				track.set('playing',true);
			}
        }
        else {
            sendChat('Simple Sound Script', '/w gm No Track Found...');
            log("No track found "+trackname);
        }
    },

    stopAllSounds = function() {
        var tracks = findObjs({type: 'jukeboxtrack', playing: true});
        if(tracks) {
            _.each(tracks, function(sound) {
                sound.set('playing', false);
            });
        }
    },

	handleInput = function(msg_orig) {
    
    var whispers = state.simpleSound.whisper;

    if ( "api" !== msg_orig.type ) {
      return;
    }
    let msg = _.clone(msg_orig);

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

        if(msg.content.indexOf("!splay") !== -1 ) {
            var args = ["!splay", msg.content.replace('!splay','').trim()]
        }
        else if(msg.content.indexOf("!sstop") !== -1) {
            var args = ["!sstop", msg.content.replace('!sstop','').trim()]        
        }
        else if(msg.content.indexOf("!swhisper") !== -1) {
            var args = ["!swhisper".trim()]        
        }
        else {
            return;
        }
		
		if (! state.simpleSound.whisper){state.simpleSound.whisper = false;}

		switch(args[0]) {
			case '!splay': {
                var track_name = args[1] || 0;
                if(track_name) {
    				if(whispers){ sendChat('Simple Sound Script', '/w gm <b>[PLAYING]</b> ' + track_name); }
    				playSound(track_name,'play');
                }
                else {
                    sendChat('Simple Sound Script', '/w gm Syntax: !splay [track name]');
                }
				break;
			}
			case '!sstop': {
			    var track_name = args[1] || 0;
                if(track_name) {
    				if(whispers){ sendChat('Simple Sound Script', '/w gm <b>[STOPPING]</b> ' + track_name); }
    				playSound(track_name,'stop');
                }
                else {
                    if(whispers){ sendChat('Simple Sound Script', '/w gm <b>[STOPPING ALL TRACKS]</b>'); }
                    stopAllSounds();
                }
				break;
			}
			case '!swhisper': {
                if(state.simpleSound.whisper == true) {
    				state.simpleSound.whisper = false;
                }
                else {
                    state.simpleSound.whisper = true;
                }
                var whispers = state.simpleSound.whisper;
                    sendChat('Simple Sound Script', '/w gm Whispers are set to ( <b>' + whispers + '</b> )');
				break;
			}
	  }
	},
	
	checkInstall = function()
	{
	    var script_version = "0.2.1";
        if( ! state.simpleSound ) {
                state.simpleSound = {
                    version: script_version,
                    whisper: false,
                };
            }   
            
		if (! state.simpleSound.whisper){state.simpleSound.whisper = false;}
		
        if (state.simpleSound.version != script_version)
            state.simpleSound.version = script_version;
            
            log("-=> Simple Sound Script v"+state.simpleSound.version+" Initialized <=-")
	},

    	
	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};

}());

on("ready", function() {
    'use strict';
    
	simpleSound.CheckInstall();
	simpleSound.RegisterEventHandlers();        
});
