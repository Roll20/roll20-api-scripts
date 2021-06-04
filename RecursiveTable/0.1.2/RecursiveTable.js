// Github:   https://github.com/shdwjk/Roll20API/blob/master/RecursiveTable/RecursiveTable.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var RecursiveTable = RecursiveTable || (function() {
    'use strict';

    var version = '0.1.2',
        lastUpdate = 1453302547,
        schemaVersion = 0.1,
        maxParseDepth = 10,

    checkInstall = function() {
    	log('-=> RecursiveTable v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'RecursiveTable') || state.RecursiveTable.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.RecursiveTable = {
                version: schemaVersion
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


    showHelp = function(who) {

        sendChat('','/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'RecursiveTable v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>RecursiveTable provides a way to expand the results of Rollable Tables which have inline rolls within them.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!rt [--help| ... ]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Performs all inline rolls, then continues to expand inline rolls (to a maximum depth of around 10).</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">...</span></b> '+ch('-')+' Anything following !rt will be expanded, then sent to to the chat.'
				+'</li> '
			+'</ul>'
		+'</div>'
    +'</div>'
+'</div>'
        );
    },

    parseMessage = function(msgs, context ){
        var msg = msgs.shift();
		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
                    var ti=_.reduce(v.results.rolls,function(m2,v2){
                        if(_.has(v2,'table')){
                            m2.push(_.reduce(v2.results,function(m3,v3){
                                m3.push(v3.tableItem.name);
                                return m3;
                            },[]).join(', '));
                        }
                        return m2;
                    },[]).join(', ');
					m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}
        if(context.depth < maxParseDepth && msg.content.match(/\[\[.+\]\]/)){
            ++context.depth;
            sendChat('',msg.content,function(msg){parseMessage(msg,context);});
        } else {
            sendChat(context.who, (context.rolltemplate ? '&{template:'+context.rolltemplate+'} ':'')+msg.content.replace(/%%SLASH%%/,'/'));
        }
    },

    handleInput = function(msg_orig) {
		var msg = _.clone(msg_orig),
            args, who;

        if (msg.type !== "api") {
            return;
        }
        who=getObj('player',msg.playerid).get('_displayname');

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!rt':
                if('--help' === args[1]){
                    showHelp(who);
                } else {
                    msg.content = msg.content.replace(/^!rt\s+/,'').replace(/\//,'%%SLASH%%');
                    parseMessage([msg],{
                        depth: 0,
                        who: msg.who,
                        rolltemplate: msg.rolltemplate
                    });
                }
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

    RecursiveTable.CheckInstall();
    RecursiveTable.RegisterEventHandlers();
});

