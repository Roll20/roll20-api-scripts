// Github:   https://github.com/shdwjk/Roll20API/blob/master/Emas/Emas.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Emas = Emas || (function() {
    'use strict';

	var version = '0.8.2',
        lastUpdate = 1490369005,

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

	checkInstall = function() {
        log('-=> Emas v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	showHelp = function(who) {
        sendChat('',
            '/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'Emas v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
        +'<p>Emas provides the <b>!emas</b> command, which looks like /emas but '
        +'works for everyone, as well as the <b>!as</b> command, which looks like '
        +'/as but works for everyone.  <b>!w</b>, <b>!r</b>, <b>!gr</b> as '
        +'well.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!emas '+ch('<')+'message'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/emas</i> does for GMs.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'message'+ch('>')+'</span></b> '+ch('-')+' The message to output as part of the emote.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!as '+ch('<')+'target'+ch('>')+' '+ch('<')+'message'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/as</i> does for GMs.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'target'+ch('>')+'</span></b> '+ch('-')+' The person to speak as.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'message'+ch('>')+'</span></b> '+ch('-')+' The message to output as part of the emote.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!w '+ch('<')+'target'+ch('>')+' '+ch('<')+'message'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/w</i> does.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'target'+ch('>')+'</span></b> '+ch('-')+' The target of the whisper.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'message'+ch('>')+'</span></b> '+ch('-')+' The message to whisper.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!r '+ch('<')+'expression'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a expression in the same manner as <i>/r</i> does.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'expression'+ch('>')+'</span></b> '+ch('-')+' The dice expression to output.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!gr '+ch('<')+'expression'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/gr</i> does.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'expression'+ch('>')+'</span></b> '+ch('-')+' The dice expression to whisper to the GM (blindly).'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!desc '+ch('<')+'message'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/desc</i> does.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'message'+ch('>')+'</span></b> '+ch('-')+' The message to output as part of the description.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },
	
	handleInput = function(msg_orig) {
		var args, who, msg = _.clone(msg_orig);

		if (msg.type !== "api") {
			return;
		}

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']="[["+v.expression+"]]";
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}


		args = msg.content.split(/\s+/);
		who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
		switch(args[0]) {
			case '!emas':
				if(1 === args.length) {
					showHelp(who);
				} else {
					sendChat('','/emas '+_.rest(args).join(' '));
				}
				break;
			case '!as':
				if(1 === args.length) {
					showHelp(who);
				} else {
					sendChat('','/as '+_.rest(args).join(' '));
				}
				break;
			case '!w':
				if(1 === args.length) {
					showHelp(who);
				} else {
					sendChat(msg.who,'/w "'+who+'" '+_.rest(args,2).join(' '));
					sendChat(msg.who,'/w '+_.rest(args).join(' '));
				}
				break;
			case '!r':
				if(1 === args.length) {
					showHelp(who);
				} else {
					sendChat('','/r '+_.rest(args).join(' '));
				}
				break;
			case '!gr':
				if(1 === args.length) {
					showHelp(who);
				} else {
					sendChat('','/gr '+_.rest(args).join(' '));
				}
				break;
			case '!desc':
				if(1 === args.length) {
					showHelp(who);
				} else {
					sendChat('','/desc '+_.rest(args).join(' '));
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

on("ready",function(){
	'use strict';

	Emas.CheckInstall();
	Emas.RegisterEventHandlers();
});
