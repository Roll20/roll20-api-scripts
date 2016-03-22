// Github:   https://github.com/shdwjk/Roll20API/blob/master/AnnouncRoll/AnnouncRoll.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var AnnounceRoll = AnnounceRoll || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604233,

    checkInstall = function() {    
        log('-=> AnnounceRoll v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},
    handleInput = function(msg) {
        var rolldata,out=[];

        if (msg.type !== "rollresult") {
            return;
        }

        rolldata = JSON.parse(msg.content);
        _.each(rolldata.rolls,function(r){
            if('R' === r.type && 20 === r.sides) {
                _.each(r.results, function(roll){
                    switch(roll.v) {
                        case 1:
                            out.push('<div style="color: #990000;font-weight: bold">Fumble!</div>');
                            break;
                        case 20:
                            out.push('<div style="color: #009900;font-weight: bold">Critical!</div>');
                            break;
                    }
                });
            }
        });
        if(out.length) {
            sendChat('',out.join(''));
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

    AnnounceRoll.CheckInstall();
    AnnounceRoll.RegisterEventHandlers();
});

