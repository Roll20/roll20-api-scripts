// Github:   https://github.com/shdwjk/Roll20API/blob/master/WildDice/WildDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var WildDice = WildDice || (function() {
    'use strict';

    var version = '0.3.1',
        lastUpdate = 1435721274,

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
        log('-=> WildDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
    },

    showHelp = function(who) {

        sendChat('','/w '+who+' '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'WildDice v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>WildDice implements the rolling mechanics for WildDice systems.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!wd '+ch('[')+ch('<')+'Dice Expression'+ch('>')+ch('|')+'--help'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Rolls the WildDice expression and diplays the results. <b>!wwd</b> can be used in place of <b>!wd</b> to whisper the results to the GM.</p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'Dice Expression'+ch('>')+'</span></b> '+ch('-')+' An inline dice expression, something akin to '+ch('[')+ch('[')+'5d6+8'+ch(']')+ch(']')+' which will then be parsed for the roll result.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
'</div>'
        );
    },




    getDiceCounts = function(rolls) {
        return ( _.reduce(rolls || [], function(m,r){
                m[r]=(m[r]||0)+1;
                return m;
            },{}));
    },

    getDiceArray = function(c) {
        return _.reduce(c,function(m,v,k){
            _.times(v,function(){m.push(k);});
            return m;
        },[]);
    },

    handleInput = function(msg) {
        var args, who,
            w=false,
            rDice, wildDie, errorDie,
            bonusDice = [],
            critFailDice = [],
            markFirstMax = false,
            sum = 0, sumFail = 0,
            pips = 0
            ;

        if (msg.type !== "api") {
            return;
        }

        who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!wwd':
                w=true;
                /* break; */ // Intentional drop through
            case '!wd':
                if(!msg.inlinerolls || _.contains(args,'--help')){
                    showHelp(who);
                    return;
                }

                rDice = _.pluck( (msg.inlinerolls && msg.inlinerolls[0].results.rolls[0].results) || [], 'v');
                pips = ((msg.inlinerolls && msg.inlinerolls[0].results.total-_.reduce(rDice,function(m,r){return m+r;},0)) || 0);
                wildDie = rDice.pop();
                switch(wildDie) {
                    case 1:  // critical failure
                        critFailDice = getDiceCounts(rDice);
                        if(critFailDice.length){
                            critFailDice[_.max(rDice)]--;
                            critFailDice = getDiceArray(critFailDice);
                        }
                        sumFail=_.reduce(critFailDice,function(m,r){return parseInt(m,10) + parseInt(r,10);},0) + wildDie + pips;
                        markFirstMax = true;
                        break;
                    case 6:  // explode!
                        errorDie = 6;
                        while(6 === errorDie) {
                            errorDie = randomInteger(6);
                            bonusDice.push(errorDie);
                        }
                        break;
                }
                sum = _.reduce(rDice.concat(bonusDice),function(m,r){return m+r;},0) + wildDie + pips;

                sendChat( 'WildDice', (w ? '/w gm ' : '/direct ')
                    +'<div>'
                        +'<div style="background: white; border: 1px solid black; padding: 1px 3px; color: black; font-weight: bold;">Dice:'
                            +'<div>'
                                +_.map(rDice,function(d){
                                        var c = 'white';
                                        if( markFirstMax && d === _.max(rDice) ) {
                                            c = '#666666';
                                            markFirstMax = false;
                                        }
                                        return '<div style="float:left;background-color: '+c+'; border: 1px solid #999999;border-radius: 2px;font-weight:bold;padding:1px 5px; margin:1px 3px;">'+d+'</div>';
                                    }).join('')
                                    +'<div style="float:left; background-color: red; color: white; border: 1px solid #999999;border-radius: 2px;font-weight:bold;padding:1px 5px; margin:1px 3px;">'+wildDie+'</div>'
                                +_.map(bonusDice,function(d){
                                        return '<div style="float:left;background-color: green; color: white; border: 1px solid #999999;border-radius: 2px;font-weight:bold;padding:1px 5px; margin:1px 3px;">'+d+'</div>';
                                    }).join('')
                                +(pips
                                    ? '<div style="float:left; background-color: yellow; color: black; border: 1px solid #999999;border-radius: 10px;font-weight:bold;padding:1px 5px; margin:1px 8px;"> + '+pips+'</div>'
                                    : '')
                                +'<div style="clear: both"></div>'
                            +'</div>'
                        +'</div>'
                        +'<div>'
                            +(critFailDice.length ? ('<div style="float:left; background: red; margin-left: 10px; border: 1px solid black; padding: 1px 3px; color: white; font-weight: bold;">'+ sumFail +' Crit Fail</div>') : '')
                            +'<div style="float:left; margin-left: 10px; background: '+(critFailDice.length ? 'orange' : 'green' )+ '; border: 1px solid black; padding: 1px 3px; color: white; font-weight: bold;">'+sum+(critFailDice.length ? ' Complication' : ' Total')+'</div>'
                            +'<div style="clear: both"></div>'
                        +'</div>'
                    +'</div>');
                
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

    WildDice.CheckInstall();
    WildDice.RegisterEventHandlers();
});
