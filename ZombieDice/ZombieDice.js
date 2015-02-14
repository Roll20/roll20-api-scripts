// Github:   https://github.com/shdwjk/Roll20API/blob/master/ZombieDice/ZombieDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var ZombieDice = ZombieDice || (function() {
    'use strict';

    var version = 0.1,

    handleInput = function(msg) {
        var args,
            w=false,
            t,
            p,pp,
            n,np,
            s
            ;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!wzd':
                w=true;
                /* break; */ // Intentional drop through
            case '!zd':
                t = parseInt(args[1],10);
                p = ( msg.inlinerolls
                    && msg.inlinerolls[0]
                    && msg.inlinerolls[0].results
                    && msg.inlinerolls[0].results.rolls[0]
                    && msg.inlinerolls[0].results.rolls[0].results
                    && _.map(msg.inlinerolls[0].results.rolls[0].results,function(r){
                        return r.v;
                    }).sort() ) || [];
                n = ( msg.inlinerolls
                    && msg.inlinerolls[1]
                    && msg.inlinerolls[1].results
                    && msg.inlinerolls[1].results.rolls[0]
                    && msg.inlinerolls[1].results.rolls[0].results
                    && _.map(msg.inlinerolls[1].results.rolls[0].results,function(r){
                        return r.v;
                    }).sort() ) || [];
                pp = _.difference(p,n);
                np = _.difference(n,p);
                s = _.filter(pp,function(v){
                    return v<=t;
                });

                sendChat( 'ZombieDice', (w ? '/w gm ' : '/direct ')
                    +'<div>'
                        +'<div style="background: white; border: 1px solid black; padding: 1px 3px; color: black; font-weight: bold;">Positive['+p.length+']: '+pp.join(', ')+(p.length!==pp.length ? (', <strike style="color:red;"><span style="color:#666666;">'+_.difference(p,pp).join(', ')+'</span></strike>') : '' )+'</div>'
                        + (n.length ? ('<div style="background: black; border: 1px solid black; padding: 1px 3px; color: white; bold;">Negative['+n.length+']: '+np.join(', ')+(n.length!==np.length ? (', <strike style="color:red;"><span style="color:#999999;">'+_.difference(n,np).join(', ')+'</span></strike>') : '' )+'</div>') : '')
                        +'<div>'
                            +'<div style="float:left; margin-left: 10px; background: '+(s.length ? 'green' : 'red' )+ '; border: 1px solid black; padding: 1px 3px;; color: white; bold;">'+(s.length ? 'Success' : 'Failure')+'</div>'
                            +(np.length ? ('<div style="float:left; background: orange; margin-left: 10px; border: 1px solid black; padding: 1px 3px; color: red; font-weight: bold;">'+np.length +' Stress</div>') : '')
                            +'<div style="clear: both"></div>'
                        +'</div>'
                    +'</div>');
                
                break;
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    ZombieDice.RegisterEventHandlers();
});
