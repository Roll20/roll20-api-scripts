// Github:   https://github.com/shdwjk/Roll20API/blob/master/SpinTokens/SpinTokens.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var SpinTokens = SpinTokens || (function(){
    'use strict';

	var version = '0.4.1',
        lastUpdate = 1427604266,
		schemaVersion = 0.1,
		spinInterval = false,
		stepRate = 200,
		defaultSecondsPerCycle = 20,
        millisecondsPerSecond = 1000,

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

	showHelp = function() {
        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'SpinTokens v'+version
		+'<div style="clear: both"></div>'
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>Allows the GM to toggle spinning of selected tokens</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!spin-start '+ch('[')+'Seconds Per Cycle'+ch(']')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'Starts a selected token spinning, optionally with a speed.'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">Seconds Per Cycle</span></b> '+ch('-')+' Specifies the number of seconds for the token to make a full rotation.  Using a negative number causes the object to spin counter-clockwise. <b>Default: '+defaultSecondsPerCycle +'</b></li>'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;"><b><span style="font-family: serif;">!spin-stop</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'Stops the selected tokens from spinning.'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },


	handleInput = function(msg) {
		var args,
            secondsPerCycle;
        
		if ( "api" !== msg.type || !playerIsGM(msg.playerid) ) {
			return;
		}

		args = msg.content.split(/\s+/);
		
		switch(args[0]) {
			case '!spin-start':
				if(!( msg.selected && msg.selected.length > 0 ) ) {
					showHelp();
					return;
				}

                secondsPerCycle = args[1] || defaultSecondsPerCycle;
				_.chain(msg.selected)
					.map(function (o) {
						return getObj(o._type,o._id);
					})
					.filter(function(o){
						return 'token' === o.get('subtype');
					})
					.each(function(o){
						state.SpinTokens.spinners[o.id]={
							id: o.id,
							page: o.get('pageid'),
							rate: (secondsPerCycle*millisecondsPerSecond)
						};
					})
					;
				break;

			case '!spin-stop':
				if(!( msg.selected && msg.selected.length > 0 ) ) {
					showHelp();
					return;
				}

				_.chain(msg.selected)
					.map(function (o) {
						return getObj(o._type,o._id);
					})
					.filter(function(o){
						return 'token' === o.get('subtype');
					})
					.each(function(o){
						delete state.SpinTokens.spinners[o.id];
					})
					;
				break;
		}

	},

	animateRotation = function() {
		var pages = _.union([Campaign().get('playerpageid')], _.values(Campaign().get('playerspecificpages')));

		_.chain(state.SpinTokens.spinners)
			.filter(function(o){
				return _.contains(pages,o.page);
			})
			.each(function(sdata){
				var s = getObj('graphic',sdata.id);

				if(!s) {
					delete state.SpinTokens.spinners[sdata.id];
				} else {
					s.set({
						rotation: (( (Date.now()%sdata.rate)/sdata.rate )*360)
					});
				}
			});

	},

	handleTokenDelete = function(obj) {
		var found = _.findWhere(state.SpinTokens.spinners, {id: obj.id});
		if(found) {
			delete state.SpinTokens.spinners[obj.id];
		}
	},


	checkInstall = function() {
        log('-=> SpinTokens v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'SpinTokens') || state.SpinTokens.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');

            state.SpinTokens = {
				version: schemaVersion,
				spinners: {}
			};
		}

		spinInterval = setInterval(animateRotation,stepRate);
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
		on('destroy:graphic', handleTokenDelete);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	SpinTokens.CheckInstall();
	SpinTokens.RegisterEventHandlers();
});
