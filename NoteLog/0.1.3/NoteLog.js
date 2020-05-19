// Github:   https://github.com/shdwjk/Roll20API/blob/master/NoteLog/NoteLog.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const NoteLog = (() => {

    let version = '0.1.3',
        lastUpdate = 1576528439,
        schemaVersion = 0.1,
        noteLogName = 'Log',
        bulletChar = '&bullet;',

	defaults = {
        expandlinks: true,
        logname: 'Log'
	},

    createNoteLog = function() {
        const noteLog = createObj('handout',{
			name: noteLogName
		});
		noteLog.set('notes', '<h3>Log</h3>');
        return noteLog;
	},

    getNoteLog = function() {
		const noteLog = filterObjs(function(o){
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

	getAsBoolean = function(val,defVal){
		let isTrue = _.isBoolean(val) ? val : _.contains(['on','yes','y','true'],(`${val}`||'true').toLowerCase()),
		isFalse =  _.isBoolean(val) ? !val : _.contains(['off','no','n','false'],(`${val}`||'true').toLowerCase());
		if(isTrue || isFalse){
			return !isFalse;
		}
		return !_.isUndefined(defVal) ? defVal : val;
	},
    getAsText = function(val, defVal) {
        return (_.isString(val) && val.length) ? val : defVal;
    },

	parseOptions = function(cmdOpts){
		return _.chain((cmdOpts||'').replace(/((?:\\.|[^|])*)\|/g,'$1\n').replace(/\\/,'').split(/\n/))
		.filter((a)=>a.length)
		.reduce((m,o)=>{
			let tok=o.split(/(?:%%|:)/),
			c=tok.shift().toLowerCase(),
			a=tok.join(':')||true;
			switch(c){
                case 'logname':
                    a=getAsText(a,defaults[c]);
                    break;
				case 'expandlinks':
					a=getAsBoolean(a,defaults[c]);
					break;
			}

			m[c]=a;
			return m;
		},_.clone(defaults))
		.value();
	},

    handleInput = function(msg_orig) {
        let args,
            nl,
            longtext,
            msg = _.clone(msg_orig);

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
                    let ti=_.reduce(v.results.rolls,function(m2,v2){
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
    
})();

on('ready',function() {
    'use strict';

    NoteLog.CheckInstall();
    NoteLog.RegisterEventHandlers();
});

