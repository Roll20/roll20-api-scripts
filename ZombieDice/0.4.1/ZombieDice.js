// Github:   https://github.com/shdwjk/Roll20API/blob/master/ZombieDice/ZombieDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var ZombieDice = ZombieDice || (function() {
    'use strict';

    var version = '0.4.1',
        lastUpdate = 1427604281,

	checkInstall = function() {
        log('-=> ZombieDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

    getDiceCounts = function(msg,idx) {
        return ( msg.inlinerolls
            && msg.inlinerolls[idx]
            && msg.inlinerolls[idx].results
            && msg.inlinerolls[idx].results.rolls[0]
            && msg.inlinerolls[idx].results.rolls[0].results
            && (_.reduce(_.map(msg.inlinerolls[idx].results.rolls[0].results, function(r){
                return r.v;
            }).sort()  || [], function(m,r){
                m[r]=(m[r]||0)+1;
                return m;
            },{})));
    },

    getDiceArray = function(c) {
        return _.reduce(c,function(m,v,k){
            _.times(v,function(){m.push(k);});
            return m;
        },[]);
    },

    handleInput = function(msg) {
        var args,
            w=false,
            t,
            p,pp,
            n,np,
            c={},
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
                p = getDiceCounts(msg,0);
                n = getDiceCounts(msg,1);

                pp = _.clone(p);
                np = _.clone(n);

                _.reduce(np,function(m,r,k,l){
                    var ps = m[k] || 0;
                    m[k] = Math.max(ps-r,0);
                    l[k] = Math.max(r-ps,0);
                    c[k] = ps-m[k];

                    if(!l[k]) {
                        delete l[k];
                    }
                    if(!m[k]) {
                        delete m[k];
                    }
                    if(!c[k]) {
                        delete c[k];
                    }
                    return m;
                },pp);

                p=getDiceArray(p);
                n=getDiceArray(n);
                pp=getDiceArray(pp);
                np=getDiceArray(np);
                c=getDiceArray(c);

                s = _.filter(pp,function(v){
                    return v<=t;
                });

                sendChat( 'ZombieDice', (w ? '/w gm ' : '/direct ')
                    +'<div>'
                        +'<div style="background: white; border: 1px solid black; padding: 1px 3px; color: black; font-weight: bold;">Positive['+p.length+']: '
                            +pp.join(', ')
                            +( (pp.length && c.length) ? ', ' : '')
                            +( c.length ? ('<strike style="color:red;"><span style="color:#666666;">'+c.join(', ')+'</span></strike>') : '' )
                        +'</div>'
                        + (n.length ? ('<div style="background: black; border: 1px solid black; padding: 1px 3px; color: white; bold;">Negative['+n.length+']: '
                            +np.join(', ')
                            +( (np.length && c.length) ? ', ' : '')
                            + (c.length ? ('<strike style="color:red;"><span style="color:#666666;">'+c.join(', ')+'</span></strike>') : '' )
                        +'</div>') : '')
                        +'<div>'
                            +'<div style="float:left; margin-left: 10px; background: '+(s.length ? 'green' : 'red' )+ '; border: 1px solid black; padding: 1px 3px; color: white; font-weight: bold;">'+(s.length ? ''+s.length+' Success' : 'Failure')+'</div>'
                            +(np.length ? ('<div style="float:left; background: orange; margin-left: 10px; border: 1px solid black; padding: 1px 3px; color: red; font-weight: bold;">'+np.length +' Stress</div>') : '')
                            +'<div style="float:right; margin-right: 10px; background: yellow; border: 1px solid black; padding: 1px 3px; color: black; font-weight: bold;">vs '+t+'</div>'
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
		CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    ZombieDice.CheckInstall();
    ZombieDice.RegisterEventHandlers();
});
