// Github:   https://github.com/shdwjk/Roll20API/blob/master/MonsterHitDice5e/MonsterHitDice5e.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var globalConfig = globalConfig || undefined;
var MonsterHitDice5e = MonsterHitDice5e || (function() {
    'use strict';

    var version = '0.3.1',
        lastUpdate = 1457421795,
        schemaVersion = 0.1,
        tokenIds = [],

    checkGlobalConfig = function(){
        var s=state.MonsterHitDice5e,
            g=globalConfig && globalConfig.monsterhitdice5e;
        if(g && g.lastsaved && g.lastsaved > s.globalConfigCache.lastsaved
        ){
           log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');
           s.config.bar = parseInt(g.Bar.match(/\d+/)[0]);
            switch(g.Sheet){
                case "DnD 5e - Community Contributed":
                    s.config.hitDiceAttribute = 'npc_HP_hit_dice';
                    s.config.useConBonus = true;
                    s.config.conBonusAttribute = 'npc_constitution';
                    s.config.conBonusIsStat = true;
                    break;

                case "DnD 5e - Shaped v2":
                    s.config.hitDiceAttribute = 'npc_HP_hit_dice';
                    s.findSRDFormula = true;
                    s.config.useConBonus = false;
                    s.config.conBonusAttribute = '';
                    s.config.conBonusIsStat = false;
                    break;

                case "DnD 5e - OGL by roll20":
                    s.config.hitDiceAttribute = 'npc_hdformula';
                    s.config.useConBonus = false;
                    s.config.conBonusAttribute = '';
                    s.config.conBonusIsStat = false;
                    break;

                case "Custom - (Use settings below)":
                    s.config.hitDiceAttribute = g['HitDice Attribute'];
                    s.findSRDFormula = 'findSRDFormula' === g['SRD Embedded Formula'];
                    s.config.useConBonus = 'useSeparateCon' === g['Separate Constitution Modifier'];
                    s.config.conBonusAttribute = g['Constitution Attribute'];
                    s.config.conBonusIsStat = 'conIsStat' === g['Constitution is Stat'];
                    break;
            }
            state.MonsterHitDice5e.globalConfigCache=globalConfig.monsterhitdice5e;
        }
    },
    checkInstall = function() {
    	log('-=> MonsterHitDice5e v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MonsterHitDice5e') || state.MonsterHitDice5e.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.MonsterHitDice5e = {
                version: schemaVersion,
                globalConfigCache: {lastsaved:0},
                config: {
                    bar: 3,
                    hitDiceAttribute: 'npc_HP_hit_dice',
                    findSRDFormula: false,
                    useConBonus: true,
                    conBonusAttribute: 'npc_constitution',
                    conBonusIsStat: true
                }
            };
        }
        checkGlobalConfig();
    },

    handleInput = function(msg) {
        var args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!mhd5e':
                break;
        }
    },

    findSRDRoll = function(txt){
        return txt.match(/\d+d\d+(\+\d+)?/)[0]||0;
    },

    rollHitDice = function(obj) {
        var sets = {},
        bar = 'bar'+state.MonsterHitDice5e.config.bar,
        hdAttrib,
        conAttrib,
        hdExpression = 0,
        conExpression = 0,
        bonus = 0
        ;

        if(_.contains(tokenIds,obj.id)){
            tokenIds=_.without(tokenIds,obj.id);

            if( 'graphic' === obj.get('type') &&
            'token'   === obj.get('subtype') &&
            ''        !== obj.get('represents')
            ) {
                if( obj && '' === obj.get(bar+'_link') ) {
                    hdAttrib = findObjs({
                        type: 'attribute', 
                        characterid: obj.get('represents'),
                        name: state.MonsterHitDice5e.config.hitDiceAttribute
                    })[0];
                    conAttrib = findObjs({
                        _type: 'attribute', 
                        _characterid:obj.get('represents'),
                        name: state.MonsterHitDice5e.config.conBonusAttribute
                    })[0];

                    if( hdAttrib ) {
                        hdExpression = state.MonsterHitDice5e.config.findSRDFormula ?
                        findSRDRoll(hdAttrib.get('current')) :
                        hdAttrib.get('current') ;

                        if( state.MonsterHitDice5e.config.useConBonus && conAttrib ) {
                            conExpression = state.MonsterHitDice5e.config.conBonusIsStat ?
                            Math.round((conAttrib.get('current')-10)/2) :
                            conAttrib.get('current') ;

                            bonus = conExpression * _.reduce(hdExpression.get('current').match(/(\d+)d\d+/g),function(m,die){
                                m+=parseInt(die.match(/(\d+)d\d+/)[1],10);
                                return m;
                            },0);
                        }

                        sendChat('','/r '+hdExpression+'+'+bonus,function(r){
                            var hp=0;
                            _.each(r,function(subr){
                                var val=JSON.parse(subr.content);
                                if(_.has(val,'total'))
                                {
                                    hp+=val.total;
                                }
                            });
                            sets[bar+"_value"] = hp||1;
                            sets[bar+"_max"] = hp||1;
                            obj.set(sets);
                        });
                    }
                }
            }
        }
    },

    saveTokenId = function(obj){
        tokenIds.push(obj.id);

        setTimeout((function(id){
            return function(){
                var token=getObj('graphic',id);
                if(token){
                    rollHitDice(token);
                }
            };
        }(obj.id)),100);
    },


    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('add:graphic', saveTokenId);
        on('change:graphic', rollHitDice);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    MonsterHitDice5e.CheckInstall();
    MonsterHitDice5e.RegisterEventHandlers();
});

