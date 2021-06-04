// Github:   https://github.com/shdwjk/Roll20API/blob/master/MotD/MotD.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MotD = MotD || (function() {
    'use strict';

    var version = '0.2.6',
    lastUpdate = 1521337867,
    schemaVersion = 0.1,
    motdNoteId,
    motdNoteName = 'MotD Note',
    motdText,
    loginSendDelay = 10000, // 10 seconds
    playerOnlineCooldown =  21600000, // 6 hours (6hrs * 60minutes * 60seconds * 1000miliseconds)

    loadMotDNote = function (text) {
        motdText=text;
    },

    createMotDNote = function() {
        var motdNote = createObj('handout',{
            name: motdNoteName
        });
        motdText='Welcome to the Game!';
        motdNote.set('notes',motdText);
        motdNoteId = motdNote.id;
    },

    checkInstall = function(callback) {
        log('-=> MotD v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MotD') || state.MotD.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.MotD && state.MotD.version) {
                case 0.1:
                    /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state.MotD.version = schemaVersion;
                    break;

                default:
                    state.MotD = {
                        version: schemaVersion,
                        playerTimes: {}
                    };
                    break;
            }
        }

        let callback2 = ()=>{
            findObjs({type:'player',_online:true})
                .forEach((p)=>{
                    if( state.MotD.playerTimes[p.id] === undefined ||
                        state.MotD.playerTimes[p.id] < (_.now() - playerOnlineCooldown) 
                    ) {
                        let who = p.get('displayname');
                        sendChat('MotD','/w "'+who+'" '+
                            motdText.replace(/%%NAME%%/g,who)
                        );
                    )
                    state.MotD.playerTimes[p.id] = _.now();
                });
            callback();
        };

        var motdNote = filterObjs(function(o){
            return ( 'handout' === o.get('type') && motdNoteName === o.get('name') && false === o.get('archived'));
        })[0];
        if(motdNote) {
            motdNoteId = motdNote.id;
            motdNote.get('notes',function(n) {
                loadMotDNote(n);
                callback2();
            });
        } else {
            createMotDNote();
            callback2();
        }
    },

    handlePlayerLogin = function(obj) {
        if( true === obj.get('online') && (
            state.MotD.playerTimes[obj.id] === undefined ||
            state.MotD.playerTimes[obj.id] < (_.now() - playerOnlineCooldown) 
        )){
            setTimeout(function(){
                var who=obj.get('displayname');
                sendChat('MotD','/w "'+who+'" '+
                    motdText.replace(/%%NAME%%/g,obj.get('displayname'))
                );
            },loginSendDelay);
        }
        state.MotD.playerTimes[obj.id] = _.now();
    },

    handleNoteChange = function(obj) {
        if(obj.id === motdNoteId) {
            obj.get('notes',function(n) {
                loadMotDNote(n);
            });
        }
    },

    handleNoteDestroy = function(obj) {
        if(obj.id === motdNoteId) {
            createMotDNote();
        }
    },

    registerEventHandlers = function() {
        on('change:player:_online', handlePlayerLogin);
        on('change:handout', handleNoteChange);
        on('destroy:handout', handleNoteDestroy);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready',function() {
    'use strict';

    MotD.CheckInstall(function(){
        MotD.RegisterEventHandlers();
    });
});
