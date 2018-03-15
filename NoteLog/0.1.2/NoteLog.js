// Github:   https://github.com/shdwjk/Roll20API/blob/master/NoteLog/NoteLog.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var NoteLog = NoteLog || (function() {
    'use strict';

    var version = '0.1.2',
        lastUpdate = 1476642083,
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

    handleInput = function(msg_orig) {
        var args,
            nl,
            longtext,
            msg = _.clone(msg_orig);

        if (msg.type !== "api" && !playerIsGM(msg.playerid)) {
            return;
        }

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
                    var ti=_.reduce(v.results.rolls,function(m2,v2){
                        if(_.has(v2,'table')){
                            m2.push(_.reduce(v2.results,function(m3,v3){
                                m3.push(v3.tableItem.name);
                                return m3;
                            },[]).join(', '));
                        }
                        return m2;
                    },[]).join(', ');
					m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}

        args = msg.content.split(/\s/);

        switch(args.shift()) {
            case '!note-text': 
                longtext=msg.content
                    .replace(/^!note-text\b\s*/,'')
                    .replace(/(\{\{([\s\S]*?)\}\})/g," $2 ")
                    .trim();

                nl = getNoteLog();
                nl.get('notes', function(n){
                    if(!_.isNull(n)){
                        setTimeout(function(){
                            let text=n+'<br>'+longtext;
                            nl.set('notes',text);                        
                        },0);
                    }
                });
                break;

            case '!note-log':
                nl = getNoteLog();
                nl.get('notes', function(n){
                    if(!_.isNull(n)){
                        setTimeout(function(){
                            let text=n+'<br>'+bulletChar+' '+args.join(' ');
                            nl.set('notes',text);                        
                        },0);
                    }
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

