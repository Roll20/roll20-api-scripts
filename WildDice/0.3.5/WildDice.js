// Github:   https://github.com/shdwjk/Roll20API/blob/master/WildDice/WildDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const WildDice = (() => { // eslint-disable-line no-unused-vars

    const version = '0.3.5';
    const lastUpdate = 1585662581;

    const ch = (c) => {
        const entities = {
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
            '*' : 'ast',
            '/' : 'sol',
            ' ' : 'nbsp'
        };

        if( entities.hasOwnProperty(c) ){
            return `&${entities[c]};`;
        }
        return '';
    };

    const checkInstall = () => {
        log('-=> WildDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
    };

    const showHelp = (who) => {

        sendChat('','/w "'+who+'" '+
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
    };

    const getDiceCounts = (rolls) => (rolls || [])
        .reduce((m,r) => {
                m[r]=(m[r]||0)+1;
                return m;
            },{});

    const s = {
        failsum: "float:left; background: red; margin-left: 10px; border: 1px solid black; padding: 1px 3px; color: white; font-weight: bold;",
        diceblock: "background: white; border: 1px solid black; padding: 1px 3px; color: black; font-weight: bold;",
        clear: "clear: both;",
        result: ""
    };
    const f = {
        outer: (...t) => `<div>${t.join('')}</div>`,
        diceblock: (t) => `<div style="${s.diceblock}">Dice:<div>${t}</div>${f.clear()}</div>`,
        result: (t) => `<div style="${s.result}">${t}</div>`,
        clear: () => `<div style="${s.clear}"></div>`,
        failsum: (n) => `<div style="${s.failsum}">${n} Crit Fail</div>`
    };

    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }

        let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        let parts = msg.content.split(/\s+--/);
        let args = parts[0].split(/\s+/);
        let w = false;

        switch(args[0]) {
            case '!wwd':
                w=true; 
                /* break; // intentional dropthrough */ /* falls through */
            case '!wd': {
                if(!msg.inlinerolls || _.contains(args,'--help')){
                    showHelp(who);
                    return;
                }

                let rDice = _.pluck( (msg.inlinerolls && msg.inlinerolls[0].results.rolls[0].results) || [], 'v');
                let pips = ((msg.inlinerolls && msg.inlinerolls[0].results.total-_.reduce(rDice,function(m,r){return m+r;},0)) || 0);
                let wildDie = rDice.pop();
                let hasFail = false;
                let markFirstMax = false;
                let sumFail = 0;
                let bonusDice = [];

                switch(wildDie) {
                    case 1: { // critical failure
                            let critFailDice = getDiceCounts(rDice);
                            hasFail = Object.keys(critFailDice).length>0;

                            if(hasFail){
                                --critFailDice[`${_.max(rDice)}`];
                            }
                            sumFail = Object.keys(critFailDice).reduce((m,k) => (m + parseInt(k,10)*critFailDice[k]), 0) + pips;
                            markFirstMax = true;
                        }
                        break;
                    case 6: {  // explode!
                            let errorDie = 6;
                            while(6 === errorDie) {
                                errorDie = randomInteger(6);
                                bonusDice.push(errorDie);
                            }
                        }
                        break;
                }
                let sum = _.reduce(rDice.concat(bonusDice),function(m,r){return m+r;},0) + wildDie + pips;

                let wrapper = (t)=>t;
                if(/^template\b\s/.test(parts[1]||"")){
                    let template = `&{template:${msg.rolltemplate}}${parts[1].replace(/^template\s+/i,'')}`;
                    wrapper = (t) => template.replace(/%%ROLL%%/i,t);
                }

                sendChat( `player|${msg.playerid}`, `${w ? '/w gm ' : ''}${wrapper(f.outer(f.diceblock(
                                _.map(rDice,function(d){
                                        var c = 'white';
                                        if( markFirstMax && d === _.max(rDice) ) {
                                            c = '#666666';
                                            markFirstMax = false;
                                        }
                                        return '<div style="float:left;background-color: '+c+'; border: 1px solid #999999;border-radius: 2px;font-weight:bold;padding:1px 5px; margin:1px 3px;">'+d+'</div>';
                                    }).join('')+
                                    '<div style="float:left; background-color: red; color: white; border: 1px solid #999999;border-radius: 2px;font-weight:bold;padding:1px 5px; margin:1px 3px;">'+wildDie+'</div>'+
                                _.map(bonusDice,function(d){
                                        return '<div style="float:left;background-color: green; color: white; border: 1px solid #999999;border-radius: 2px;font-weight:bold;padding:1px 5px; margin:1px 3px;">'+d+'</div>';
                                    }).join('')+
                                (pips ?
									'<div style="float:left; background-color: yellow; color: black; border: 1px solid #999999;border-radius: 10px;font-weight:bold;padding:1px 5px; margin:1px 8px;"> + '+pips+'</div>' :
									'')
                                ),
                            f.result(
                                ( hasFail ? f.failsum(sumFail) : '') +
                                '<div style="float:left; margin-left: 10px; background: '+( hasFail ? 'orange' : 'green' )+ '; border: 1px solid black; padding: 1px 3px; color: white; font-weight: bold;">'+sum+(hasFail ? ' Complication' : ' Total')+'</div>'+
                                '<div style="clear: both"></div>'
                            )
                        ))}`);

                }
                break;
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });

    return {
    };
    
})();

