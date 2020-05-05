var AgoneDice = AgoneDice || (function () {
	'use strict';
	var version = '0.2',
	lastUpdate = 1586019853,

	checkInstall = function() {
		log('### AgoneDice v'+version+' ### ['+(new Date(lastUpdate*1000))+']');
	},

	handleInput = function(msg_orig) {
		var msg = _.clone(msg_orig), args, who, multiplier, dice, result;

		if (msg.type == 'desc' || msg.type == 'api') {
			return;
		}
		
		switch(msg.type) {
			case 'rollresult':
			case 'gmrollresult':
				var diceRoll = JSON.parse(msg.content);
				if (diceRoll.rolls.length === 2 && !_.has(diceRoll.rolls[0], 'mods')) {
					var i = 1;
					if (_.has(diceRoll.rolls[0], 'expr')) {
						if (diceRoll.rolls[0].expr.indexOf('-') > -1) {
							return;
						}
					}
				} else {
					var i = 0;
					if (_.has(diceRoll.rolls[1], 'expr')) {
						if (diceRoll.rolls[1].expr.indexOf('-') > -1) {
							return;
						}
					}
				}
				if (!_.has(diceRoll.rolls[i].mods, 'exploding')) {
					return;
				}
				var diceResult = diceRoll.rolls[i].results[0].v || 0;
				var total = diceRoll.total || 0;
				var prefix = '/r ';
				var person = msg.who;
				if (msg.type == 'gmrollresult') {
					prefix = '/gmroll ';
					person = '';
				}
				if (diceResult === 1) {
					sendChat(person, prefix+total+'-1d10!');
				}
			break;

			case 'emote':
				if (!_.has(msg, 'inlinerolls') || msg.content.indexOf('Fumble') > -1) {
					return;
				}
				var diceRoll = msg.inlinerolls[0].results;
				if (diceRoll.rolls.length === 2 && !_.has(diceRoll.rolls[0], 'mods')) {
					var i = 1;
				} else {
					var i = 0;
				}
				if (!_.has(diceRoll.rolls[i].mods, 'exploding')) {
					return;
				}
				var diceResult = diceRoll.rolls[i].results[0].v || 0;
				var total = diceRoll.total || 0;
				if (diceResult === 1) {
					sendChat(msg.who, '/me Fumble : [['+total+'-1d10!]] !');
				}
			break;

			case 'whisper':
			case 'general':
				if (!_.has(msg, 'inlinerolls') || (!_.has(msg, 'rolltemplate')) || (msg.content.indexOf('Fumble') > -1)) {
					return;
				}
				var diceRoll = msg.inlinerolls[0].results;
				if (diceRoll.rolls.length === 2 && !_.has(diceRoll.rolls[0], 'mods')) {
					var i = 1;
				} else {
					var i = 0;
				}
				if (!_.has(diceRoll.rolls[i].mods, 'exploding')) {
					return;
				}
				var diceResult = diceRoll.rolls[i].results[0].v || 0;
				var total = diceRoll.total || 0;
				var t = msg.content.split('{');
				t = t[2].split('}');
				t = t[0].split('=');
				var name = t[1];
				var prefix = '';
				var person = msg.who;
				if (person.indexOf('GM') > -1) {
					prefix = '/w gm ';
				}
				if (diceResult === 1) {
					sendChat(person, prefix+"&{template:agone-fumble} {{name=@{"+name+"|character_name}}} {{Fumble=[["+total+"-1d10!]]}}");
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


on('ready', function() {
	'use strict';
	AgoneDice.CheckInstall();
	AgoneDice.RegisterEventHandlers();
});
