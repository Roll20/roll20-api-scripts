// Github:   https://github.com/shdwjk/Roll20API/blob/master/TotalMana/TotalMana.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TotalMana = TotalMana || (function() {
    'use strict';

    var version = '0.1.3',
        lastUpdate = 1444830577,
        schemaVersion = 0.1,

    checkInstall = function() {
		log('-=> TotalMana v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'TotalMana') || state.TotalMana.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.TotalMana = {
                version: schemaVersion
            };
        }
    },

    handleInput = function(msg) {
        var args,
            page,
            totals;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!total-mana':
                if(msg.selected){
                    page=_.chain(msg.selected)
                            .map(function(o){
                                return getObj(o._type,o._id);
                            })
                            .reject(_.isUndefined)
                            .first()
                            .value()
                            .get('pageid');

                } else {
                    page=Campaign().get('playerpageid');
                }

                totals = _.reduce(findObjs({
                    pageid: page,
                    type: 'graphic',
                    isdrawing: false,
                    layer: 'objects'
                }),function(m,o){
                    m.bar1+=parseFloat(o.get('bar1_value'),10) || 0;
                    m.bar2+=parseFloat(o.get('bar2_value'),10) || 0;
                    m.bar3+=parseFloat(o.get('bar3_value'),10) || 0;
                    return m;
                },{ bar1: 0, bar2: 0, bar3: 0 });

                sendChat('','<div style="border:1px solid #999; border-radius: 1em; padding: .5em; background-color: #ccc;">'+
                    '<div style="text-align: center; font-size: 1.3em; font-weight:bold; border-bottom: 2px solid #999; margin:.5em;">'+
                        'Mana Totals'+
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Bar1:</div>'+
                        totals.bar1 +
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Bar2:</div>'+
                        totals.bar2 +
                    '</div>'+
                    '<div>'+
                        '<div style="float:left;font-weight:bold;margin-right: 1em;">Bar3:</div>'+
                        totals.bar3 +
                    '</div>'+
                '</div>'
                );

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

    TotalMana.CheckInstall();
    TotalMana.RegisterEventHandlers();
});
