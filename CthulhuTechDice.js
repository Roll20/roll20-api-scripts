// Github:   https://github.com/shdwjk/Roll20API/blob/master/CthulhuTechDice/CthulhuTechDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var CthulhuTechDice = CthulhuTechDice || (function() {
    'use strict';

    var version = '0.1.6',
        lastUpdate = 1434814969,
        schemaVersion = 0.1,

    checkInstall = function() {
    	log('-=> CthulhuTechDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'CthulhuTechDice') || state.CthulhuTechDice.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.CthulhuTechDice = {
                version: schemaVersion
            };
        }
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



    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args,
            diceCounts,
            maxSingle=0,
            maxMultiple=0,
            maxRun=0,
            diceArray,
			bonus,
            result,
            w=false;

        if (msg.type !== "api") {
            return;
        }

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']=v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!wct':
                w=true;
                /* break; */ // Intentional drop through
            case '!ct':

				if(args.length>1){
					bonus = parseInt(args[1],10);
                    bonus = _.isNaN(bonus) ? undefined : bonus;
				}

                diceCounts=getDiceCounts(msg,0);
                if(!diceCounts){
                    return;
                }
                diceArray=getDiceArray(diceCounts);

                maxMultiple=_.chain(diceCounts)
                    .map(function(c,r){
                        return {
                            label: 'Best Set',
                            roll: r,
                            count: c,
                            total: (r*c)
                        };
                    })
                    .sortBy('total')
                    .reverse()
                    .first()
                    .value();

                maxRun=_.chain(_.keys(diceCounts))
                    .map(function(r){
                        return parseInt(r,10);
                    })
                    .tap(function(s){
                        var m=_.max(s);
                        maxSingle={
                                label: 'High Roll',
                                roll: m,
                                count: 1,
                                total: m
                            };
                    })
                    .reduce(function(m,r){
                        if(0 === _.last(m).length) {
                            _.last(m).push(r);
                        } else if( r === _.last(_.last(m))+1) {
                            _.last(m).push(r);
                        } else {
                            m.push([r]);
                        }
                        return m;
                    },[[]])
                    .map(function(r){
                        return {
                            label: 'Best Run',
                            run: r,
                            total: _.reduce(r,function(m,v){return m+v;},0)
                        };
                    })
					.filter(function(o){
						return o.run.length>2;
					})
                    .sortBy('total')
                    .reverse()
                    .first()
                    .value();

                result=_.reduce([maxMultiple,maxRun],function(m,e){
                    return ( (e && m && e.total>m.total ) ? e : m);
                },maxSingle);


                sendChat( msg.who, (w ? '/w gm ' : '/direct ')+
                    '<div style="'+
                        'background-color:#746E6E;'+
                        'padding: 5px;'+
                        'margin-left: -45px;'+
                        'text-align: center;'+
                    '">'+
                        '<div style="'+
                                'background: #000000 url(http://www.cthulhutech.com/images/bg.jpg) repeat-y left top;'+
                                'color: #757779;'+
                                'padding: 8px;'+
                                'padding-left: 30px;'+
                                'border: solid #323132 1px;'+
                                'font-family: Verdana, Arial, Helvetica, sans-serif;'+
                            '">'+
                            '<div style="'+
                                'background: #161617 url(http://www.cthulhutech.com/images/textbox.jpg) repeat-y right top;'+
                                'padding: 8px;'+
                                'float:right;'+
                                'border: solid #323132 1px;'+
                                'width: 100px;'+
                                'text-align: center;'+
                                'margin-left: 8px;'+
                            '">'+
                                '<div style="'+
                                    'font-size: large;'+
                                    'color: #ab1e23;'+
                                    'font-weight: bold;'+
                                    
                                '">'+
                                    'Result'+
                                '</div>'+
                                '<div style="'+
                                    'font-size: 2em;'+
                                    'font-weight: bold;'+
                                    'margin-top: 8px;'+
                                    'margin-bottom: 12px;'+
                                '">'+
                                    (result.total+(bonus||0))+
                                '</div>'+
								(!_.isUndefined(bonus)
									? (
										'<span style="'+
											'margin-top:8px;'+
											'padding: 1px 0px 1px .3em;'+
											//'border: solid #323132 1px;'+
											'border: solid #746e6e 1px;'+
											'border-radius: 1em;'+
											'background-color: #ab1e23;'+
											'font-weight: bold;'+
										'">'+
											'<span>'+
												result.total+
											'</span>'+
											' + '+
											'<span style="'+
												'border: solid #746e6e 1px;'+
												'border-radius: 1em;'+
												'padding: 1px .5em;'+
												'background-color: #323132;'+
												'color: white;'+
												'font-weight: normal;'+
											'">'+
												bonus+
											'</span>'+
										'</span>'
									)
									: ''
								)+
                            '</div>'+
                            '<div style="'+
                                'background: #161617 url(http://www.cthulhutech.com/images/textbox.jpg) repeat-y right top;'+
                                'padding: 8px;'+
                                'margin-right: 138px;'+
                                'border: solid #323132 1px;'+
                                'text-align:center;'+
                            '">'+
                                '<div>'+
                                    _.map(diceArray,function(r){
                                        return '<span style="'+
                                                'display:inline-block;'+
                                                'border-radius: 1em;'+
                                                'color: #757779;'+
                                                'border:1px solid #757779;'+
                                                'background-color: #ab1e23;'+
                                                'padding:1px 5px;'+
                                                'margin: 1px 1px;'+
                                            '">'+r+'</span>';
                                    }).join('') +
                                '</div>'+
                                '<div style="'+
                                    'margin-top:8px;'+
                                    'padding-top:8px;'+
                                    'border-top: solid #323132 1px;'+
                                '">'+
                                    '<span style="'+
                                        'font-weight: bold;'+
                                    '">'+
                                        result.label+
                                        ' :: '+
                                    '</span>'+
                                     
                                    _.map(
                                        ( _.has(result,'count')
                                            ? (function(r,c){
                                                    var d={};
                                                    d[r]=c;
                                                    return getDiceArray(d);
                                                }(result.roll,result.count)) 
                                            : result.run
                                        ) ,function(r){
                                        return '<span style="'+
                                                'display:inline-block;'+
                                                'border-radius: 1em;'+
                                                'color: #ab1e23;'+
                                                'border:1px solid #ab1e23;'+
                                                'background-color: #757779;'+
                                                'padding:1px 5px;'+
                                                'margin: 1px 1px;'+
                                            '">'+r+'</span>';
                                    }).join('') +
                                '</div>'+
                            '</div>'+
                            '<div style="clear:both;"></div>'+
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

    CthulhuTechDice.CheckInstall();
    CthulhuTechDice.RegisterEventHandlers();
});
