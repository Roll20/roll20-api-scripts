// Github:   https://github.com/shdwjk/Roll20API/blob/master/FateDots/FateDots.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var FateDots = FateDots || (function(){
    'use strict';

    var version = '0.2.2',
        lastUpdate = 1487692335,
        schemaVersion = 0.3,
		regex = {
			statuses: /^(?:red|blue|green|brown|purple|pink|yellow|skull|sleepy|half-heart|half-haze|interdiction|snail|lightning-helix|spanner|chained-heart|chemical-bolt|death-zone|drink-me|edge-crack|ninja-mask|stopwatch|fishing-net|overdrive|strong|fist|padlock|three-leaves|fluffy-wing|pummeled|tread|arrowed|aura|back-pain|black-flag|bleeding-eye|bolt-shield|broken-heart|cobweb|broken-shield|flying-flag|radioactive|trophy|broken-skull|frozen-orb|rolling-bomb|white-tower|grab|screaming|grenade|sentry-gun|all-for-one|angel-outfit|archery-target)$/
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

	showHelp = function() {
        sendChat('',
            '/w gm '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'FateDots v'+version+
		'<div style="clear: both"></div>'+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Allows statues to be used like Fate stress boxes by repeating them.</p>'+
		'<p>By default, Blue and Red will be treated specially.  Assigning a number to them will cause them to be duplicated that many times, and numbered in decreasing order.  Changing the number will change the number of pips that appear.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;"><b><span style="font-family: serif;">!fate-dots '+ch('<')+ch('[')+'+'+ch('|')+'-'+ch(']')+'Status Marker'+ch('>')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'Adds or removes a status to be treated as a multibox.'+
		'</div>'+
			'<p><u>Available Status Markers:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">red</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">blue</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">green</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">brown</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">purple</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">pink</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">yellow</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">skull</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">sleepy</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">half-heart</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">half-haze</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">interdiction</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">snail</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">lightning-helix</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">spanner</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">chained-heart</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">chemical-bolt</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">death-zone</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">drink-me</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">edge-crack</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">ninja-mask</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">stopwatch</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fishing-net</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">overdrive</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">strong</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fist</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">padlock</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">three-leaves</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fluffy-wing</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">pummeled</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">tread</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">arrowed</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">back-pain</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">black-flag</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bleeding-eye</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bolt-shield</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">broken-heart</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">cobweb</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">broken-shield</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">flying-flag</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">radioactive</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">trophy</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">broken-skull</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">frozen-orb</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">rolling-bomb</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">white-tower</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">grab</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">screaming</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">grenade</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">sentry-gun</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">all-for-one</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">angel-outfit</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">archery-target</div>'+

			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Adding purple and skull, removing blue.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!fate-dots +purple +skull -blue'+
				'</pre>'+
			'</div>'+
	'</div>'+
'</div>'
            );
    },


	handleInput = function(msg) {
		var args;
        
		if ( "api" !== msg.type || !playerIsGM(msg.playerid) ) {
			return;
		}


		args = msg.content.split(/\s+/);
		
		switch(args.shift()) {
			case '!fate-dots':
				if( !args.length ) {
					showHelp();
					return;
				}

				_.each(args,function(s){
						var op = s[0],
						st = s.substring(1);
						if(st.match(regex.statuses)) {
							switch(op) {
								case '+':
									state.FateDots.statuses=_.union( state.FateDots.statuses,[st] );
									break;

								case '-':
									state.FateDots.statuses=_.without( state.FateDots.statuses, st );
									break;

							}
						}
					});

				break;
		}

	},
	statusmarkersToObject = function(stats) {
		return _.reduce(stats.split(/,/),function(memo,st){
			var parts=st.split(/@/),
				num=parseInt(parts[1]||'0',10);
			if(parts[0].length) {
				memo[parts[0]]=Math.max(num,memo[parts[0]]||0);
			}
			return memo;
		},{});
	},

	statusChangeHandler = function(obj) {
    
        var nstat = statusmarkersToObject(obj.get('statusmarkers')),
			rstat = _.reduce(nstat,function(m,c,s){
				if(_.contains(state.FateDots.statuses,s)) {
					m.push(_.reduce(_.range(1,c+1),function(m2,n){
						m2.push(s+'@'+n);
                        return m2;
					},[]).join(','));
				} else {
					m.push('dead' === s ? s : s+'@'+c);
				}
                return m;
			},[]).join(',');
        obj.set({
            statusmarkers: rstat
        });
	},


	checkInstall = function() {
        log('-=> FateDots v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'FateDots') || state.FateDots.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');

            state.FateDots = {
				version: schemaVersion,
				statuses: ['blue','red']
			};
		}
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
		on('change:graphic:statusmarkers',statusChangeHandler);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	FateDots.CheckInstall();
	FateDots.RegisterEventHandlers();
});
