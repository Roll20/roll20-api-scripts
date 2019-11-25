// Github:   https://github.com/shdwjk/Roll20API/blob/master/MotD/MotD.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MotD = MotD || (function() {
    'use strict';

    var version = '0.2.4',
    lastUpdate = 1500298280,
    motdNoteId,
    motdNoteName = 'MotD Note',
    motdText,

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

        var motdNote = filterObjs(function(o){
            return ( 'handout' === o.get('type') && motdNoteName === o.get('name') && false === o.get('archived'));
        })[0];
        if(motdNote) {
            motdNoteId = motdNote.id;
            motdNote.get('notes',function(n) {
                loadMotDNote(n);
                callback();
            });
        } else {
            createMotDNote();
            callback();
        }
    },

    handlePlayerLogin = function(obj,prev) {
        if( true === obj.get('online') && false === prev._online ) {
            setTimeout(function(){
                var who=obj.get('displayname');
                sendChat('MotD','/w "'+who+'" '+
                    motdText.replace(/%%NAME%%/g,obj.get('displayname'))
                );
            },10000);
        }
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
