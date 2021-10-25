// Github:   https://github.com/shdwjk/Roll20API/blob/master/InitiativeAssistant/InitiativeAssistant.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{};
API_Meta.InitiativeAssistant={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.InitiativeAssistant.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

var InitiativeAssistant = InitiativeAssistant || (function() {
    'use strict';

    var version = '0.1.6';
    API_Meta.InitiativeAssistant.version = version;
    var lastUpdate = 1609295237,
        schemaVersion = 0.2,
        sorters = {
            'None': function(to) {
                return to;
            },
            'Ascending': function(to){
                return _.sortBy(to,function(i){
                    return (i.pr);
                });
            },
            'Descending': function(to){
                return _.sortBy(to,function(i){
                    return (-i.pr);
                });
            }
        },

    checkInstall = function() {
        log('-=> InitiativeAssistant v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'InitiativeAssistant') || state.InitiativeAssistant.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.InitiativeAssistant = {
                version: schemaVersion,
                config: {
                    sortOption: 'None'
                }
            };
        }
    },


	ch = function (c) {
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},

    getConfigOption_SortOptions = function() {
        var text = state.InitiativeAssistant.config.sortOption;
        return '<div>'+
            'Sort Options is currently <b>'+
                text+
            '</b>.'+
            '<div>'+
                _.map(_.keys(sorters),function(so){
                    return '<a href="!init-assist-config --sort-option|'+so+'">'+
                        so+
                    '</a>';
                }).join(' ')+
            '</div>'+
        '</div>';
    },

    showHelp = function(who) {
        sendChat('','/w "'+who+'" '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'InitiativeAssistant v'+version
                +'</div>'
                +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'<p>Provides an easy interface to adding players into the initiative, particularly if they are manually rolling.</p>'
                +'</div>'
                +'<b>Commands</b>'
                +'<div style="padding-left:10px;">'
                    +'<b><span style="font-family: serif;">!init-assist [ [--'+ch('<')+'name fragment'+ch('>')+'|'+ch('<')+'number'+ch('>')+'] ...] | --help</span></b>'
                    +'<div style="padding-left: 10px;padding-right:20px">'
                        +'<p>Adds one or more characters to the initiative order.</p>'
                        +'<ul>'
                            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                                +'<b><span style="font-family: serif;">'+ch('<')+'name fragment'+ch('>')+'</span></b> '+ch('-')+' A part of the name of the character to add.  This can be the full name, or just a few letters.  Case-insensitive.'
                            +'</li> '
                            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                                +'<b><span style="font-family: serif;">'+ch('<')+'number'+ch('>')+'</span></b> '+ch('-')+' A number or inline roll representing the character'+ch("'")+'s initiative score.'
                            +'</li> '
                        +'</ul>'
                    +'</div>'
                +'</div>'
                +getConfigOption_SortOptions()
            +'</div>'
        );
    },


    keyFormat = function(text) {
        return text.toLowerCase().replace(/\s+/g,'');
    },

    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            output='',
            redos={},
            keys=[],
            lookup,
            chars,
            args,
            who,
            to;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }
        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

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

		args = msg.content
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+--/);

        switch(args.shift()) {
            case '!init-assist':
                if( !args.length || _.contains(args,'help')) {
                    showHelp(who);
                    return;
                }

                lookup = _.reduce(args,function(m,p){
                    var parts=p.split(/\|/),
                        key=keyFormat(parts[0]);

                    keys.push(key);

                    m[key]={
                        key: key,
                        input: parts[0],
                        init: parts[1]
                    };
                    return m;
                },{});
                
                chars = _.reduce(
                    filterObjs(function(obj){
                        return ('character' === obj.get('type')) && (_.reduce(keys,function(m,k){
                            return m || (-1 !== keyFormat(obj.get('name')||'').indexOf(k));
                        },false));
                    }),
                    function(m,c){
                        var ckey=keyFormat(c.get('name')||''),
                            key=_.find(keys,function(k){
                                return (-1 !== ckey.indexOf(k));
                            });
                        m[key] = (m[key] ? m[key].push(c) && m[key] : [c]);
                        return m;
                    },
                    {}
                );

                to=JSON.parse(Campaign().get('turnorder')||'[]');
                _.each(keys, function(k){
                    var char;
                    if(chars[k]) {
                        if(1 === chars[k].length) {
                            char = findObjs({
                                type: 'graphic',
                                pageid: Campaign().get('playerpageid'),
                                subtype: 'token',
                                represents: chars[k][0].id
                            })[0];
                            if(char) {
                                to = _.reject(to, function(i){
                                    return char.id === i.id;
                                });
                                to.push({
                                    id: char.id,
                                    pr: lookup[k].init
                                });
                            } else {
                                lookup[k].matches=chars[k];
                                redos.NT=(redos.NT ? redos.NT.push(lookup[k]) && redos.NT : [lookup[k]]);
                            }
                        } else {
                            lookup[k].matches=chars[k];
                            redos.DUP=(redos.DUP ? redos.DUP.push(lookup[k]) && redos.DUP : [lookup[k]]);
                        }
                    } else {
                        redos.NM=(redos.NM ? redos.NM.push(lookup[k]) && redos.NM : [lookup[k]]);
                    }
                });
                Campaign().set({
                    turnorder: JSON.stringify(sorters[state.InitiativeAssistant.config.sortOption](to))
                });

                _.each(redos,function(rs,k){
                    var params=[];
                    switch(k){
                        case 'NT':
                            output+=
                                '<div style="border: 1px solid #999999;">'+
                                    '<h3>Please Add Tokens</h3>'+
                                    '<div>'+
                                        _.map(rs, function(r){
                                            var c = r.matches[0];
                                            params.push('--'+r.key+'|'+r.init);
                                            return '<div>'+
                                                '<img style="background-color: white; border: 1px solid #ccc; max-width: 60px; max-height: 60px; float:left" src="'+c.get("avatar")+'">'+
                                                '<b>'+c.get("name")+'</b>'+
                                                '<div style="clear:both;"></div>'+
                                                '</div>';
                                        }).join(' ')+
                                    '</div>'+
                                    '<p>After adding tokens for the above characters: <a href="!init-assist '+params.join(' ')+'">Add Turn(s)</a></p>'+
                                '</div>';
                            break;
                        case 'DUP':
                            output+=
                                '<div style="border: 1px solid #999999;">'+
                                    '<h3>Which One?</h3>'+
                                    '<div>'+
                                        _.map(rs, function(r){
                                            return '<h4>'+
                                                    r.input+
                                                '<h4>'+
                                                '<div style="margin-left:15px;">'+
                                                    _.map(r.matches,function(c){
                                                        var button='<a style="float:right;" href="!init-assist --'+keyFormat(c.get('name'))+'|'+r.init+'">Pick</a>';
                                                        return '<div>'+
                                                            '<img style="background-color: white; border: 1px solid #ccc; max-width: 60px; max-height: 60px; float:left" src="'+c.get("avatar")+'">'+
                                                            button+
                                                            '<b>'+c.get("name")+'</b>'+
                                                            '<div style="clear:both;"></div>'+
                                                            '</div>';
                                                    }).join('')+
                                                '</div>';
                                        }).join(' ')+
                                    '</div>'+
                                '</div>';
                            break;
                        case 'NM':
                            output+=
                                '<div style="border: 1px solid #999999;">'+
                                    '<h3>No Matching Characters</h3>'+
                                    '<div>'+
                                        _.map(rs, function(r){
                                            return '<div>'+
                                                    r.input+
                                                '</div>';
                                        }).join(' ')+
                                    '</div>'+
                                '</div>';
                            break;
                    }
                });
                if(output){
                    sendChat('Initiative Assistant','/w "'+who+'" '+output);
                }
                
                break;
            case '!init-assist-config':
                if(_.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '
                        +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                                +'InitiativeAssistant v'+version
                            +'</div>'
                            +getConfigOption_SortOptions()
                        +'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/),
                        msg='';
                    switch(opt.shift()) {
                        case 'sort-option':
                            if(sorters[opt[0]]) {
                               state.InitiativeAssistant.config.sortOption=opt[0];
                            } else {
                                msg='<div><b>Error:</b> Not a valid sort method: '+opt[0]+'</div>';
                            }
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +msg
                                    +getConfigOption_SortOptions()
                                +'</div>'
                            );
                            break;

                        default:
                            sendChat('','/w "'+who+'" '
                                +'<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });

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

    InitiativeAssistant.CheckInstall();
    InitiativeAssistant.RegisterEventHandlers();
});

{try{throw new Error('');}catch(e){API_Meta.InitiativeAssistant.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.InitiativeAssistant.offset);}}
