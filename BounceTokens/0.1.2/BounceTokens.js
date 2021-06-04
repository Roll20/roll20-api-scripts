// Github:   https://github.com/shdwjk/Roll20API/blob/master/BounceTokens/BounceTokens.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var BounceTokens = BounceTokens || (function(){
    'use strict';

	var version = '0.1.2',
        lastUpdate = 1523205020,
		schemaVersion = 0.1,
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
            '/w gm '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'BounceTokens v'+version+
		'<div style="clear: both"></div>'+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Allows the GM to toggle bouncing of selected tokens</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;"><b><span style="font-family: serif;">!bounce-start '+ch('[')+'Seconds Per Cycle'+ch(']')+' '+ch('[')+'-- tokenID ...'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'Starts a selected or specified tokens bouncing, optionally with a speed.'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">Seconds Per Cycle</span></b> '+ch('-')+' Specifies the number of seconds for the token to make a full bounce.  <b>Default: '+defaultSecondsPerCycle +'</b></li>'+
				'</li> '+
			'</ul>'+
		'</div>'+
	'</div>'+
	'<div style="padding-left:10px;"><b><span style="font-family: serif;">!bounce-stop '+ch('[')+'-- tokenID ...'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'Stops the selected or specified tokens from bouncing.'+
		'</div>'+
	'</div>'+
'</div>'
            );
    },


	handleInput = function(msg) {
        
		if ( "api" !== msg.type || !playerIsGM(msg.playerid) ) {
			return;
		}

        let parts = msg.content.split(/\s+--\s+/);
		let args = parts[0].split(/\s+/);
        let ids = (parts[1]||'').split(/\s+/).filter((id)=>id.length);

		
		switch(args[0]) {
			case '!bounce-start': {
				if(!( msg.selected && msg.selected.length > 0 ) && ids.length===0) {
					showHelp();
					return;
				}

                let secondsPerCycle = Math.abs(args[1] || defaultSecondsPerCycle);

                ids=[...new Set([...(msg.selected||[]).map((s)=>s._id), ...ids])];
                ids.map((id)=>getObj('graphic',id))
                    .filter((o)=>undefined !== o)
                    .forEach((o)=>{
						state.BounceTokens.bouncers[o.id]={
							id: o.id,
                            top: o.get('top'),
							page: o.get('pageid'),
							rate: (secondsPerCycle*millisecondsPerSecond)
						};
					})
					;
                }
				break;

			case '!bounce-stop': {
				if(!( msg.selected && msg.selected.length > 0 ) && ids.length===0) {
					showHelp();
					return;
				}

                ids=[...new Set([...(msg.selected||[]).map((s)=>s._id), ...ids])];
                ids.map((id)=>getObj('graphic',id))
                    .filter((o)=>undefined !== o)
                    .filter((o)=>state.BounceTokens.bouncers.hasOwnProperty(o.id))
                    .forEach((o)=>{
                        o.set('top',state.BounceTokens.bouncers[o.id].top);
						delete state.BounceTokens.bouncers[o.id];
					})
					;
                }
				break;
		}

	},

    getActivePages = () => _.union([
        Campaign().get('playerpageid')],
        _.values(Campaign().get('playerspecificpages')),
        _.chain(findObjs({
            type: 'player',
            online: true
        }))
        .filter((p)=>playerIsGM(p.id))
        .map((p)=>p.get('lastpage'))
        .value()
    ),

	animateBounce = function() {
		var pages = getActivePages();

		_.chain(state.BounceTokens.bouncers)
			.filter(function(o){
				return _.contains(pages,o.page);
			})
			.each(function(sdata){
				var s = getObj('graphic',sdata.id);

				if(!s) {
					delete state.BounceTokens.bouncers[sdata.id];
				} else {
					s.set({
						top: state.BounceTokens.bouncers[sdata.id].top - (s.get('height')*0.25)*Math.sin(( (Date.now()%sdata.rate)/sdata.rate )*Math.PI)
					});
				}
			});

	},

	handleTokenDelete = function(obj) {
		var found = _.findWhere(state.BounceTokens.bouncers, {id: obj.id});
		if(found) {
			delete state.BounceTokens.bouncers[obj.id];
		}
	},

	handleTokenChange = function(obj) {
		var found = _.findWhere(state.BounceTokens.bouncers, {id: obj.id});
		if(found) {
			state.BounceTokens.bouncers[obj.id].top= obj.get('top');
		}
	},

	checkInstall = function() {
        log('-=> BounceTokens v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'BounceTokens') || state.BounceTokens.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');

            state.BounceTokens = {
				version: schemaVersion,
				bouncers: {}
			};
		}

		setInterval(animateBounce,stepRate);
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
		on('destroy:graphic', handleTokenDelete);
		on('change:graphic', handleTokenChange);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	BounceTokens.CheckInstall();
	BounceTokens.RegisterEventHandlers();
});
