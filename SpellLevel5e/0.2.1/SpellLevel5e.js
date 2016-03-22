// Github:   https://github.com/shdwjk/Roll20API/blob/master/SpellLevel5e/SpellLevel5e.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var SpellLevel5e = SpellLevel5e || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604265,
        schemaVersion = 0.1,

        attrActions = {
            bard_level: ['cantripDice'],
            cleric_level: ['cantripDice'],
            druid_level: ['cantripDice'],
            paladin_level: ['cantripDice'],
            ranger_level: ['cantripDice'],
            sorcerer_level: ['cantripDice'],
            wizard_level: ['cantripDice']
        },

        attrOperations = {
            cantripDice: function(level) {
                return Math.round( (parseInt(level,10)+4)/6, 0);
            }
        },


    checkInstall = function() {
        log('-=> SpellLevel5e v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        var allAttrs = findObjs({type:'attribute'}),
            attrNames = _.chain(attrActions)
                .map(function(o,k){
                    return _.map(o,function(n){
                        return k.replace(/level$/,n);
                    });
                })
                .flatten()
                .value(),
            charMap = _.chain(allAttrs)
                .filter(function(o) {
                    return _.contains(attrNames,o.get('name'));
                })
                .reduce(function(m,o){
                    if(! _.has(m,o.get('characterid'))){
                        m[o.get('characterid')]={};
                    }
                    m[o.get('characterid')][o.get('name')]=o;
                    return m;
                },{})
                .value();

        log('SpellLevel5e: Checking Spell Level Attributes.');

        _.chain(allAttrs)
            .filter(function(o){
                return _.has(attrActions,o.get('name'));
            })
            .each(function(o){
                var ca = charMap[o.get('characterid')] || {};
                _.each(attrActions[o.get('name')],function(fname){
                    var cai = o.get('name').replace(/level$/,fname),
                        v = (attrOperations[fname] && attrOperations[fname](o.get('current')) ) || 0;
                    if(_.has(ca,cai)){
                        if( ca[cai].get('current') !== v) {
                            log('SpellLevel5e:  ...Updating '+cai+' for Character ID: '+o.get('characterid'));
                            ca[cai].set({current: v});
                        }
                    } else {
                        log('SpellLevel5e:  ...Creating '+cai+' for Character ID: '+o.get('characterid'));
                        createObj('attribute', {
                            characterid: o.get('characterid'),
                            name: cai,
                            current: v,
                            max: ''
                        });
                    }
                });
            });
            
        log('SpellLevel5e: Spell Level Attributes Checked.');
    },
    handleAttributeEvent = function(obj) {
        var name = obj.get('name'),
            attrNames,
            attrMap;
        if(_.has(attrActions, name)){
            attrNames = _.map(attrActions[name],function(n){
                return name.replace(/level$/,n);
            });
            attrMap = _.chain(findObjs({type:'attribute'}))
                .filter(function(o) {
                    return (_.contains(attrNames,o.get('name')) && (o.get('characterid') === obj.get('characterid')) );
                })
                .reduce(function(m,o){
                    m[o.get('name')]=o;
                    return m;
                },{})
                .value();

            _.each(attrActions[name],function(fname){
                var cai = name.replace(/level$/,fname),
                    v = (attrOperations[fname] && attrOperations[fname](obj.get('current')) ) || 0;
                if(_.has(attrMap,cai)){
                    if( attrMap[cai].get('current') !== v) {
                        log('SpellLevel5e: Updating '+cai+' for Character ID: '+obj.get('characterid'));
                        attrMap[cai].set({current: v});
                    }
                } else {
                    log('SpellLevel5e: Creating '+cai+' for Character ID: '+obj.get('characterid'));
                    createObj('attribute', {
                        characterid: obj.get('characterid'),
                        name: cai,
                        current: v,
                        max: ''
                    });
                }
            });

        }
    },

    handleInput = function(msg) {
        var args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!SpellLevel5e':
                break;
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    	on('add:attribute', handleAttributeEvent);
		on('change:attribute:current', handleAttributeEvent);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    SpellLevel5e.CheckInstall();
    SpellLevel5e.RegisterEventHandlers();
});
