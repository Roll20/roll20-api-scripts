// Github:   https://github.com/shdwjk/Roll20API/blob/master/BashDice/BashDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
 
 var BashDice = BashDice || (function() {
	'use strict';

	var version = '0.2.1',
        lastUpdate = 1427604236,

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
        log('-=> BashDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	getBashRoll = function() {
		var rolls = [randomInteger(6),randomInteger(6)];
		while( 1 === _.uniq(rolls).length ) {
			rolls.push(randomInteger(6));
		}
		return rolls;
	},

	getFormatForDice = function (dice, multiplier,result) {
		var maxroll = 0,
			minroll = 0,
			dicePart = _.chain(dice)
				.map(function(r){
					maxroll += ( 6 === r ? 1 : 0 );
					minroll += ( 1 === r ? 1 : 0 );
					return {
						value: r,
						style: ( 6 === r ? 'critsuccess' : ( 1 === r ? 'critfail' : 'basicdiceroll'))
					};
				})
				.map(function(o){
					return '<span class='+ch('"')+'basicdiceroll '+o.style+ch('"')+'>'+o.value+'</span>';
				})
				.value().join('+'),
			rollOut = '<span style="text-align: center; vertical-align: text-middle; display: inline-block; min-width: 1.75em; border-radius: 5px; padding: 0px 2px; border-width: 2px; border-color: '
				+ ( maxroll && minroll ? '#4A57ED' : ( maxroll ? '#3FB315' : (minroll ? '#B31515' : '') ) )
				+'" title="Rolling Bash HE 2d6 x '+ multiplier + ' = ' 
				+ dicePart 
				+ '" class="a inlinerollresult showtip tipsy-n ' + ( maxroll && minroll ? 'importantroll' : ( maxroll ? 'fullcrit' : (minroll ? 'fullfail' : '') ) )
				+ '">' + result + '</span>';
		return rollOut;
	},

	handleInput = function(msg_orig) {
		var msg = _.clone(msg_orig),
			args, multiplier, dice, result;

		if (msg.type !== "api") {
			return;
		}

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

		args = msg.content.split(/\s+/);
		switch(args[0]) {
			case '!bash':
			case '!bd':
				multiplier = parseInt(args[1],10) || 1;
				dice = getBashRoll();
				result = _.reduce(dice,function(m,d){ return m+d; }, 0) * multiplier;
				sendChat('','Bash Roll: '+getFormatForDice(dice,multiplier,result));
				break;

			case '!gbash':
			case '!gbd':
				multiplier = parseInt(args[1],10) || 1;
				dice = getBashRoll();
				result = _.reduce(dice,function(m,d){ return m+d; }, 0) * multiplier;
				sendChat('','/w gm Bash Roll: '+getFormatForDice(dice,multiplier,result));
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

	BashDice.CheckInstall();
	BashDice.RegisterEventHandlers();
});
