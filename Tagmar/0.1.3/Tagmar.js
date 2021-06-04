// Github:   https://github.com/shdwjk/Roll20API/blob/master/Tagmar/Tagmar.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const Tagmar = (() => { // eslint-disable-line no-unused-vars
    const version = '0.1.3';
    const lastUpdate = 1585191893;
    const schemaVersion = 0.1;
    const colorNameLookup = ['green','white','yellow','orange','red','blue','indigo','grey'];
    const colorValueLookup = ['#009933','#ffffff','#FFFB00','#FE9901','#FF2500','#3399FF','#014586','#014586'];
    const resultNameLookup = ['F','E','25%','50%','75%','100%','125%','C'];
    const skillLookup = {
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
    };

    const registry = {};
    const getId = (()=>{
        let nextID = 0;
        return () => nextID++;
    })();

    const checkInstall = () => {
		log('-=> Tagmar v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('Tagmar') || state.Tagmar.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Tagmar = {
                version: schemaVersion
            };
        }
    };

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

    const showHelp = (who) => {

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
					`<b><span style="font-family: serif;">${ch('<')}roll${ch('>')}</b> - The roll value.  You can use an inline roll here.  If you do, you${ch("'")}ll see the output immediately.  If you use a formula, like <code>1d20</code>, you${ch("'")}ll see 3d dice roll (where appropriate) if you have them turned on.`+
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
    };

    const formulaFromArg = (arg,msg) => {
        var index = parseInt( (arg||'').match(/\$\[\[\d+\]\]/) && (arg||'').replace(/^.*\$\[\[(\d+)\]\].*$/,'$1'),10);
        if(!Number.isNaN(index)){
            return msg.inlinerolls[index].expression;
        }
        return false;
    };

    const formatRoll = (result,color,formulae,desc) =>
        '<div style="border:1px solid #aaa; border-radius: 1em; padding:.25em; background-color: white;padding-left:2em;">'+
            `<div class="inlinerollresult showtip tipsy" title="${formulae}" style="display:inline-block;min-width:1em;width: 3em; text-align:center;border: 3px solid black; border-radius: 1em; margin: .2em;margin-left: -2em; margin-top: -.25em; font-weight: bold; padding: .2em; color:black;text-shadow:-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; font-size: 1.5em; background-color:${color};">${result}</div>`+
            desc+
        '</div>';

    const processInlinerolls = (msg) => {
        if(_.has(msg,'inlinerolls')){
            return _.chain(msg.inlinerolls)
                .reduce(function(m,v,k){
                    let ti=_.reduce(v.results.rolls,function(m2,v2){
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
        } else {
            return msg.content;
        }
    };

    const handleRemainingWork = (data)=>{

        let skill = Math.min(20,Math.max(-7,parseInt(data.skillArg,10)));
        let roll = Math.min(20,Math.max(1,parseInt(data.rollArg,10)));
        let result = skillLookup[skill||0][(roll||1)-1];
        let colorName = colorNameLookup[result];
        let colorValue = colorValueLookup[result];
        let resultName = resultNameLookup[result];

        let formulae = `Skill: ${data.formula1?data.formula1+' = ':''}${skill} &lt;br&gt; Roll: ${data.formula2?data.formula2+' = ':''}${roll} &lt;br&gt; Result: ${result} [${colorName}]`;
        let blindFormulae = `Skill: ${data.formula1?data.formula1+' = ':''}${skill}`;
        let formattedRoll = formatRoll(resultName, colorValue, formulae, data.desc);
        let blindRoll = formatRoll('???', '#000000', blindFormulae, data.desc);

        if(Number.isNaN(skill) || Number.isNaN(roll)){
            sendChat(`player|${data.playerid}`,`/w "${data.who}" <div style="padding: .1em; border-radius: .2em; border:1px solid red; background-color: #ffeeee; color: red; font-size: .8em;"><strong>Invalid arguments:</strong> <div><code>!tagmar ${data.skillArg} ${data.rollArg}</code></div>  Make sure the first 2 arguments resolve to a number.</div>`);
            showHelp(data.who);
            return;
        }

        switch(data.dispMode){
            case 'blindwhisper':
                sendChat(`player|${data.playerid}`,`/w gm ${formattedRoll}`);
                sendChat(`player|${data.playerid}`,`/w "${data.who}" ${blindRoll}`);
                break;

            case 'blind':
                sendChat(`player|${data.playerid}`,`/w gm ${formattedRoll}`);
                sendChat(`player|${data.playerid}`,`${blindRoll}`);
                break;

            case 'gm':
                sendChat(`player|${data.playerid}`,`/w gm ${formattedRoll}`);
                sendChat(`player|${data.playerid}`,`/w "${data.who}" ${formattedRoll}`);
                break;

            case 'whisper':
                sendChat(`player|${data.playerid}`,`/w "${data.who}" ${formattedRoll}`);
                break;

            default:
            case 'normal':
                sendChat(`player|${data.playerid}`,`${formattedRoll}`);
                break;
        }
    };

    const handlePassbackMessage = (msg) => {
        try {
            let rec = JSON.parse(processInlinerolls(msg).replace(/<[^>]*>/g,''));
            if(rec.hasOwnProperty("src") && "TAGMAR" === rec.src ){
                let data = registry[rec.id];
                if(data){
                    data.rollArg = parseInt(rec.roll);
                    delete registry[rec.id];
                    handleRemainingWork(data);
                }
            }
        } catch (e) {
            // not a message for Tagmar
        }
    };

    const handleInput = (msg) => {
        if ("api" !== msg.type) {
            if(["general","whisper"].includes(msg.type) && "API" === msg.playerid) {
                handlePassbackMessage(msg);
            }
            return;
        }

        let match = msg.content.match(/^!(b|bw|g|w|)tagmar(?:\b\s|$)/i);
        if(!match){
            return;
        }

        let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        let args = msg.content.split(/\s+/);
        if( args.length < 2 || args.includes('--help')) {
            showHelp(who);
            return;
        }

        let dispMode = "normal";
        switch(match[1].toLowerCase()){
            case "b":  dispMode = "blind";        break;
            case "bw": dispMode = "blindwhisper"; break;
            case "g":  dispMode = "gm";           break;
            case "w":  dispMode = "whisper";      break;
        }

        let formula1 = formulaFromArg(args[1],msg);
        let formula2 = formulaFromArg(args[2],msg);

        let content = processInlinerolls(msg);
        let args2 = content.split(/\s+/);
        let desc = args2.slice(3).join(' ');

        let skillArg = args2[1];
        let rollArg = args[2];


        let data = {playerid: msg.playerid, who,dispMode,formula1,formula2,desc,skillArg,rollArg};

        if(/^\$\[\[\d+\]\]$/.test(rollArg)){
            data.rollArg = args2[2];
            handleRemainingWork(data);
        } else {
            let registeredID = getId();
            data.formula2 = rollArg;
            registry[registeredID] = data;
            let output = '';
            switch(dispMode){
                case "blind":
                case "blindwhisper":
                    output = "/w gm ";
                    break;
                case "gm":
                case "whisper":
                    output = `/w "${who}"`;
                    break;
            }
            
            sendChat(
                `player|${msg.playerid}`,
                `${output}<div style="display:none;">{"id":"${registeredID}","src":"TAGMAR","roll":"[[${rollArg}]]"}</div>`,
                null,
                {use3d:true,noarchive:true}
            );
        }


    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready',() => {
        checkInstall();
        registerEventHandlers();
    });

    return {
    };
    
})();

