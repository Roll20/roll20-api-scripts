// Github:   https://github.com/shdwjk/Roll20API/blob/master/NoteLog/NoteLog.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var NoteLog = NoteLog || (function() {
    'use strict';

    var version = '0.1.1',
        lastUpdate = 1434428711,
        schemaVersion = 0.1,
        noteLogName = 'Log',
        bulletChar = '&bullet;',

    createNoteLog = function() {
    	var noteLog = createObj('handout',{
			name: noteLogName
		});
		noteLog.set('notes', '<h3>Log</h3>');
        return noteLog;
	},

    getNoteLog = function() {
		var noteLog = filterObjs(function(o){
			return ( 'handout' === o.get('type') && noteLogName === o.get('name') && false === o.get('archived'));
		})[0];

		if(noteLog) {
			return noteLog;
		} 
        return createNoteLog();
    },

    checkInstall = function() {
		log('-=> NoteLog v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'NoteLog') || state.NoteLog.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.NoteLog = {
                version: schemaVersion
            };
        }
    },

    handleInput = function(msg) {
        var args, nl;

        if (msg.type !== "api" && !playerIsGM(msg.playerid)) {
            return;
        }

        args = msg.content.split(/\s/);
        switch(args.shift()) {
            case '!note-log':
                nl = getNoteLog();
                nl.get('notes', function(n){
                    if(!_.isNull(n)){
                    setTimeout(function(){
                        var text=n+'<br>'+bulletChar+' '+args.join(' ');
                        nl.set('notes',text);                        
                    },0);
                });
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

on('ready',function() {
    'use strict';

    NoteLog.CheckInstall();
    NoteLog.RegisterEventHandlers();
});

