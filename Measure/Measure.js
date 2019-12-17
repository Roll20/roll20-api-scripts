// Github:   https://github.com/shdwjk/Roll20API/blob/master/Measure/Measure.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Measure = Measure || (function() {
	'use strict';

	var version = '0.3.3',
	lastUpdate = 1530335089,

	checkInstall = function() {
		log('-=> Measure v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	handleInput = function(msg) {
		var args,
		pageid,
		page,
		measurements,
		whisper = false,
		who;

		if (msg.type !== "api") {
			return;
		}

		args = msg.content.split(/\s+/);
		switch(args.shift()) {
			case '!wmeasure':
				whisper = true;
				who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
				// break; // Intentional fall through

			case '!measure':
				measurements = _.chain(_.union(args,_.pluck(msg.selected,'_id')))
				.uniq()
				.map(function(t){
					return getObj('graphic',t);
				})
				.reject(_.isUndefined)
				.map(function(t){
					pageid=t.get('pageid');
					return {
						name: t.get('name') || "Token @ "+Math.round(t.get('left')/70)+','+Math.round(t.get('top')/70),
						x: t.get('left'),
						y: t.get('top')
					};
				})
				.reduce(function(m,t,k,l){
					_.each(_.rest(l,k+1),function(t2){
						m.push({
							name1: t.name,
							name2: t2.name,
							distance: (Math.sqrt( Math.pow( (t.x-t2.x),2)+Math.pow( (t.y-t2.y),2))/70)
						});
					});
					return m;
				},[])
				.value()
				;
				page=getObj('page',pageid);
				if(page) {
					_.chain(measurements)
					.reduce(function(m,e){
						var d=Math.round(page.get('scale_number')*e.distance,2);
						m.push("<li>"+e.name1+" to "+e.name2+": <b>"+d+" "+page.get('scale_units')+"</b></li>");
						return m;
					},[])
					.join('')
					.tap(function(o){
						sendChat('Measure',(whisper ? '/w "'+who+'"' : '/direct')+' <div><b>Measurements:</b><ul>'+o+'</ul></div>');
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

	Measure.CheckInstall();
	Measure.RegisterEventHandlers();
});
