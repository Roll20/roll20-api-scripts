// Github:   https://github.com/shdwjk/Roll20API/blob/master/ManualAttribute/ManualAttribute.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var ManualAttribute = ManualAttribute || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604252,
        autoCalcStatName = 'hp-current',
        manualStatName   = 'manual_HP',
        barNumber        = 3,

	checkInstall = function() {
        log('-=> ManualAttribute v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

    setupManualAttribute = function(token) {
        var attr = findObjs({type: 'attribute', characterid: token.get('represents'), name: manualStatName })[0],
            srcHP = getAttrByName(token.get('represents'), autoCalcStatName, 'max'),
            up = {};
           
        if(!attr) {
            attr=createObj('attribute', {
                name: manualStatName,
                characterid: token.get('represents'),
                current: srcHP,
                max: srcHP
                });
        } else {
            attr.set({
                current: srcHP,
                max: srcHP
            });
        }
        up["bar"+barNumber+"_link"] = attr.id
        token.set(up);
    },

    handleInput = function(msg) {
        var args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
		switch(args.shift()) {
			case '!setup-manual':
                _.chain(msg.selected)
                    .map(function(o){
                        return getObj('graphic',o._id);
                    })
                    .reject(_.isUndefined)
                    .reject(function(t){
                        return undefined === t.get('represents');
                    })
                    .each(setupManualAttribute)
                    ;
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

    ManualAttribute.CheckInstall();
    ManualAttribute.RegisterEventHandlers();
});
