// GIST: https://gist.github.com/shdwjk/42f34ecfd167ec56c9f7

var Emas = Emas || (function() {
    'use strict';

	var version = 0.4,

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
        sendChat('',
            '/w '+who+' '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'Emas v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>Emas provides the <b>!emas</b> command, which looks like /emas but works for everyone, as well as the <b>!as</b> command, which looks like /as but works for everyone.</p>'
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
		+'<b><span style="font-family: serif;">!as '+ch('<')+'message'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Sends a message in the same manner as <i>/as</i> does for GMs.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'message'+ch('>')+'</span></b> '+ch('-')+' The message to output as part of the emote.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },
	
	handleInput = function(msg) {
		var args, who;

		if (msg.type !== "api") {
			return;
		}

		args = msg.content.split(/\s+/);
		who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];
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
		}
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	Emas.RegisterEventHandlers();
});
