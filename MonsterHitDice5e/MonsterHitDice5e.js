// Github:   https://github.com/shdwjk/Roll20API/blob/master/MonsterHitDice5e/MonsterHitDice5e.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

// TODO: Add rerolls on copy.

on('ready', function() {
    "use strict";

    var bar = 'bar3',
        hdAttr = 'npc_HP_hit_dice',
        conAttr = 'npc_constitution';


    on('add:graphic',function(obj) {
        var sets = {};

        if( 'graphic' === obj.get('type') 
            && 'token'   === obj.get('subtype') 
            && ''        !== obj.get('represents')) {

            setTimeout(_.bind(function(id){
                var obj=getObj('graphic',id),
                    hdAttrib, conAttrib, bonus = 0;
               
                if( obj && '' === obj.get(bar+'_link') ) {
                    hdAttrib = findObjs({
                        _type: 'attribute', 
                        _characterid:obj.get('represents'),
                        name: hdAttr
                    })[0];
                    conAttrib = findObjs({
                        _type: 'attribute', 
                        _characterid:obj.get('represents'),
                        name: conAttr
                    })[0];

                    if( hdAttrib ) {
                        if( conAttrib ) {
                            bonus = _.reduce(hdAttrib.get('current').match(/(\d+)d\d+/g),function(m,die){
                                m+=parseInt(die.match(/(\d+)d\d+/)[1],10);
                                return m;
                            },0)*((conAttrib.get('current')-10)/2);
                        }

                        sendChat('','/r '+hdAttrib.get('current')+'+'+bonus,function(r){
                            var hp=0;
                            _.each(r,function(subr){
                                var val=JSON.parse(subr.content);
                                if(_.has(val,'total'))
                                {
                                    hp+=val.total;
                                }
                            });
                            sets[bar+"_value"] = hp;
                            sets[bar+"_max"] = hp;
                            obj.set(sets);
                        });
                    }
                }
                
            },this,obj.id), 100);
        }
    });
});
