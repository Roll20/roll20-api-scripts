// Github:   https://github.com/shdwjk/Roll20API/blob/master/Escalation/Escalation.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Escalation = Escalation || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604246,
		dieName = 'Escalation Die',
		dieMax = 6,

	checkInstall = function() {
        log('-=> Escalation v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

		if( "" === Campaign().get('turnorder')) {
			Campaign().set({turnorder: '[]'});
		}
		handleEscalationDieReset(Campaign(),{});
	},

	handleEscalationDieReset = function(obj, prev) {
		var to=JSON.parse(obj.get('turnorder')),
			loc=_.find(to,function(e){
			return dieName === e.custom;
		});
        
		if(loc) {
			if(!obj.get('initiativepage')) {
				loc.pr=0;
				loc.forumla='+1';
			} else if (dieMax !== loc.pr && '' === loc.formula) {
			    loc.formula='+1';   
			}
		} else {
			to = _.union([{
				id: '-1',
				pr: 0,
				custom: dieName,
				formula: '+1'}], to);
		}
		obj.set({turnorder: JSON.stringify(to)});
	},


	handleEscalationDieTurn = function(obj, prev) {
        var to,lastto;
    	handleEscalationDieReset(obj,prev);
        
        to=JSON.parse(obj.get('turnorder')) || [];
		lastto=JSON.parse(prev.turnorder) || [];

		if((to[0] !== lastto[0])
			&& _.has(to[0],'custom')
			&& dieName === to[0].custom
			&& dieMax <= to[0].pr) {
			to[0].formula='';
            to[0].pr=dieMax;
		}
        obj.set({turnorder: JSON.stringify(to)});
	},

	registerEventHandlers = function() {
        on("change:campaign:initiativepage", handleEscalationDieReset );
        on("change:campaign:turnorder", handleEscalationDieTurn );
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	Escalation.CheckInstall();
	Escalation.RegisterEventHandlers();
});
