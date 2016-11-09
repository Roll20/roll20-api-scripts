// Github:   https://github.com/shdwjk/Roll20API/blob/master/Tagmar/Tagmar.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Tagmar = Tagmar || (function() {
    'use strict';

    var version = '0.1.1',
        lastUpdate = 1478701973,
        schemaVersion = 0.1,
        colorNameLookup = ['green','white','yellow','orange','red','blue','indigo','grey'],
        colorValueLookup = ['#009933','#ffffff','#FFFB00','#FE9901','#FF2500','#3399FF','#014586','#014586'],
		resultNameLookup = ['F','E','25%','50%','75%','100%','125%','C'],
        skillLookup = {
            "-7":[0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,3,4,5,7],
            "-6":[0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,3,4,5,7],
            "-5":[0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,3,3,4,5,7],
            "-4":[0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,3,3,4,5,7],
            "-3":[0,0,0,1,1,1,1,1,1,1,2,2,2,2,3,3,3,4,5,7],
            "-2":[0,0,1,1,1,1,1,1,1,1,2,2,2,2,3,3,4,4,5,7],
            "-1":[0,0,1,1,1,1,1,1,1,2,2,2,2,3,3,3,4,4,5,7],
             "0":[0,0,1,1,1,1,1,1,1,2,2,2,2,3,3,4,4,4,5,7],
             "1":[0,1,1,1,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5,7],
             "2":[0,1,1,1,1,1,1,1,2,2,2,2,3,3,3,4,4,5,5,7],
             "3":[0,1,1,1,1,1,1,2,2,2,2,3,3,3,3,4,4,5,5,7],
             "4":[0,1,1,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5,5,7],
             "5":[0,1,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5,7],
             "6":[0,1,1,1,1,1,2,2,2,2,3,3,3,4,4,4,5,5,5,7],
             "7":[0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5,5,7],
             "8":[0,1,1,1,1,2,2,2,2,3,3,3,4,4,4,4,5,5,5,7],
             "9":[0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,7],
            "10":[0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5,5,5,7],
            "11":[0,1,1,2,2,2,2,3,3,3,3,3,4,4,4,5,5,5,6,7],
            "12":[0,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,6,7],
            "13":[0,1,2,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5,6,7],
            "14":[0,1,2,2,2,2,3,3,3,3,3,4,4,4,5,5,5,5,6,7],
            "15":[0,2,2,2,2,3,3,3,3,3,3,4,4,4,5,5,5,6,6,7],
            "16":[0,2,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5,6,6,7],
            "17":[0,2,2,2,3,3,3,3,3,3,4,4,4,4,5,5,5,6,6,7],
            "18":[0,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5,5,6,6,7],
            "19":[0,2,2,3,3,3,3,3,3,4,4,4,4,5,5,5,6,6,6,7],
            "20":[0,2,3,3,3,3,3,3,3,4,4,4,5,5,5,5,6,6,6,7]
        },

    checkInstall = function() {
		log('-=> Tagmar v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Tagmar') || state.Tagmar.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Tagmar = {
                version: schemaVersion
            };
        }
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

    showHelp = function(who) {

        sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'Tagmar v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Provides a lookup for rolls in the Tagmar RPG.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!tagmar '+ch('<')+'skill'+ch('>')+' '+ch('<')+'roll'+ch('>')+' '+ch('[')+'descriptive text'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'skill'+ch('>')+'</b> - The value of the skill from -7 to 20.  You can use inline rolls or attribute references to fill this in.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'roll'+ch('>')+'</b> - The roll value.  You will likely use an inline roll for this.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('[')+'descriptive text'+ch(']')+'</b> - The rest of the command will be presented as a description of the roll.'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!wtagmar '+ch('<')+'skill'+ch('>')+' '+ch('<')+'roll'+ch('>')+' '+ch('[')+'descriptive text'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
            '<p>Identical to !tagmar but whispered to the player.</p>'+
        '</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!gtagmar '+ch('<')+'skill'+ch('>')+' '+ch('<')+'roll'+ch('>')+' '+ch('[')+'descriptive text'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
            '<p>Identical to !tagmar but the result is only whispered to the gm and the player.</p>'+
        '</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!btagmar '+ch('<')+'skill'+ch('>')+' '+ch('<')+'roll'+ch('>')+' '+ch('[')+'descriptive text'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
            '<p>Identical to !tagmar but the result is only whispered to the gm while the group only sees ???.</p>'+
        '</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!bwtagmar '+ch('<')+'skill'+ch('>')+' '+ch('<')+'roll'+ch('>')+' '+ch('[')+'descriptive text'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
            '<p>Identical to !tagmar but the result is only whispered to the gm while the player only sees ???.</p>'+
        '</div>'+
    '</div>'+
'</div>'
        );
    },

    formulaFromArg = function(arg,msg){
        var index = parseInt( (arg||'').match(/\$\[\[\d+\]\]/) && (arg||'').replace(/^.*\$\[\[(\d+)\]\].*$/,'$1'),10);
        if(!_.isNaN(index)){
            return msg.inlinerolls[index].expression;
        }
        return false;
    },

    formatRoll=function(result,color,formulae,desc){
        return '<div style="border:1px solid #aaa; border-radius: 1em; padding:.25em; background-color: white;padding-left:2em;">'+
            `<div class="inlinerollresult showtip tipsy" title="${formulae}" style="display:inline-block;min-width:1em;width: 3em; text-align:center;border: 3px solid black; border-radius: 1em; margin: .2em;margin-left: -2em; margin-top: -.25em; font-weight: bold; padding: .2em; color:black;text-shadow:-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; font-size: 1.5em; background-color:${color};">${result}</div>`+
            desc+
        '</div>';
    },

    handleInput = function(msg) {
        var args,
            dispMode,
            who, formula1, formula2;

        if (msg.type !== "api") {
            return;
        }


        args = msg.content.split(/\s+/);
        formula1 = formulaFromArg(args[1],msg);
        formula2 = formulaFromArg(args[2],msg);

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
                    var ti=_.reduce(v.results.rolls,function(m2,v2){
                        if(_.has(v2,'table')){
                            m2.push(_.reduce(v2.results,function(m3,v3){
                                m3.push(v3.tableItem.name);
                                return m3;
                            },[]).join(', '));
                        }
                        return m2;
                    },[]).join(', ');
					m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}

        who=getObj('player',msg.playerid).get('_displayname');
        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!btagmar':
                dispMode=dispMode||'blind';
                /* falls through */
            case '!bwtagmar':
                dispMode=dispMode||'blindwhisper';
                /* falls through */
            case '!gtagmar':
                dispMode=dispMode||'gm';
                /* falls through */
            case '!wtagmar':
                dispMode=dispMode||'whisper';
                /* falls through */
            case '!tagmar':
                dispMode=dispMode||'normal';
                if( args.length < 2 || _.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }

                let skillArg=args.shift(),
                    rollArg=args.shift(),
                    skill=Math.min(20,Math.max(-7,parseInt(skillArg,10))),
                    roll=Math.min(20,Math.max(1,parseInt(rollArg,10))),
                    result=skillLookup[skill||0][(roll||1)-1],
                    colorName=colorNameLookup[result],
                    colorValue=colorValueLookup[result],
					resultName=resultNameLookup[result],
                    desc = args.join(' '),
                    formulae = `Skill: ${formula1?formula1+' = ':''}${skill} &lt;br&gt; Roll: ${formula2?formula2+' = ':''}${roll} &lt;br&gt; Result: ${result} [${colorName}]`,
                    blindFormulae = `Skill: ${formula1?formula1+' = ':''}${skill}`,
                    formattedRoll = formatRoll(resultName, colorValue, formulae, desc),
                    blindRoll = formatRoll('???', '#000000', blindFormulae, desc);

                if(_.isNaN(skill) || _.isNaN(roll)){
                    sendChat(`Tagmar`,`/w "${who}" <div style="padding: .1em; border-radius: .2em; border:1px solid red; background-color: #ffeeee; color: red; font-size: .8em;"><strong>Invalid arguments:</strong> <div><code>!tagmar ${skillArg} ${rollArg}</code></div>  Make sure the first 2 arguments resolve to a number.</div>`);
                    showHelp(who);
                    return;
                }

                switch(dispMode){
                    case 'blindwhisper':
                        sendChat(`Tagmar: ${who}`,`/w gm ${formattedRoll}`);
                        sendChat(`Tagmar: ${who}`,`/w "${who}" ${blindRoll}`);
                        break;

                    case 'blind':
                        sendChat(`Tagmar: ${who}`,`/w gm ${formattedRoll}`);
                        sendChat(`Tagmar: ${who}`,`${blindRoll}`);
                        break;

                    case 'gm':
                        sendChat(`Tagmar: ${who}`,`/w gm ${formattedRoll}`);
                        sendChat(`Tagmar: ${who}`,`/w "${who}" ${formattedRoll}`);
                        break;

                    case 'whisper':
                        sendChat(`Tagmar: ${who}`,`/w "${who}" ${formattedRoll}`);
                        break;

                    default:
                    case 'normal':
                        sendChat(`Tagmar: ${who}`,`${formattedRoll}`);
                        break;
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

    Tagmar.CheckInstall();
    Tagmar.RegisterEventHandlers();
});
