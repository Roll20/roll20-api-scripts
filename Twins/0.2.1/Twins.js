// Github:   https://github.com/shdwjk/Roll20API/blob/master/Twins/Twins.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Twins = Twins || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604278,
        schemaVersion = 0.1,

        props = [
            'left', 'top', 'width', 'height', 'rotation', 'layer', 'isdrawing',
            'flipv', 'fliph', 'bar1_value', 'bar1_max', 'bar1_link',
            'bar2_value', 'bar2_max', 'bar2_link', 'bar3_value', 'bar3_max',
            'bar3_link', 'aura1_radius', 'aura1_color', 'aura1_square',
            'aura2_radius', 'aura2_color', 'aura2_square', 'tint_color',
            'statusmarkers', 'showplayers_name', 'showplayers_bar1',
            'showplayers_bar2', 'showplayers_bar3', 'showplayers_aura1',
            'showplayers_aura2', 'playersedit_name', 'playersedit_bar1',
            'playersedit_bar2', 'playersedit_bar3', 'playersedit_aura1',
            'playersedit_aura2', 'light_radius', 'light_dimradius',
            'light_otherplayers', 'light_hassight', 'light_angle',
            'light_losangle', 'lastmove'
        ],



    checkInstall = function() {
        log('-=> Twins v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Twins') || state.Twins.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Twins = {
                version: schemaVersion,
                twins: {}
            };
        }
    },

    removeTwins = function(id) {
        _.chain(state.Twins.twins)
            .map(function(v,k){
                if(id === k || id === v) {
                    return k;
                }
                return undefined;
            })
            .reject(_.isUndefined)
            .each(function(v){
                sendChat('Twins', '/w gm Removing twins for: '+v);
                delete state.Twins.twins[v];
            });
    },

    handleInput = function(msg) {
        var args,t1,t2;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!twins':
                if(args.length !== 2) {
                   sendChat('Twins', '/w gm Please specify two token IDs as arugment to !twins');
                   return;
                }

                t1 = getObj('graphic', args[0]);
                t2 = getObj('graphic', args[1]);

                if(t1 && t2){
                    removeTwins(args[0]);
                    removeTwins(args[1]);
                    sendChat('Twins', '/w gm Added Twins.');
                    state.Twins.twins[args[0]]=args[1];
                } else {
                    if(!t1) {
                       sendChat('Twins', '/w gm Could not find a token for: '+args[0]);
                    }
                    if(!t2) {
                       sendChat('Twins', '/w gm Could not find a token for: '+args[1]);
                    }
                }

                break;

            case '!not-twins':
                if(args.length !== 1) {
                   sendChat('Twins', '/w gm Please specify one token ID to remove.');
                   return;
                }
                removeTwins(args[0]);
                break;
        }
    },

    handleRemoveToken = function(obj) {
        removeTwins(obj.id);
    },

    handleTwinChange = function(obj) {
        _.find(state.Twins.twins,function(lhs,rhs){
            var twin;
            if(obj.id === lhs){
                twin = getObj('graphic',rhs);
            } else if(obj.id === rhs) {
                twin = getObj('graphic',lhs);
            }
            if(twin) {
                twin.set(_.reduce(props,function(m,p){
                    m[p]=obj.get(p);
                    return m;
                },{}));
                
                return true;
            }
            return false;
        });
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:graphic', handleTwinChange);
        on('destroy:graphic', handleRemoveToken);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on("ready",function(){
	'use strict';

    Twins.CheckInstall();
    Twins.RegisterEventHandlers();
});
