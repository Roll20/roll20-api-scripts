// Github:   https://github.com/shdwjk/Roll20API/blob/master/MutantYearZero/MutantYearZero.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MutantYearZero = MutantYearZero || (function() {
    'use strict';

    var version = '0.1.11',
        lastUpdate = 1549423753,
        schemaVersion = 0.4,
        symbols = {
            biohazard: '&#'+'9763;',
            radioactive: '&#'+'9762;',
            explosion:  '&#'+'128165;',
            // alternate explosion character
            // explosion:  '<img src="http://www.roll20api.net/shared/myzExplosion.png" style="height: .8em; display: inline-block;">',
            push: '&#'+'10150;'
        },
        myzBackground = 'https://s3.amazonaws.com/files.d20.io/images/16289834/HuG1AuH9EWsSI2tLJZubBA/original.png?1455490062',
        colors = {
            green: '#3ea62a',
            lightGreen: '#89D878',
            yellow: '#ddcf43',
            lightYellow: '#FFF699',
            black: '#1d1d1d',
            lightBlack: '#8F8E8E'
        },
        defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em .4em',
                    'color': 'white'
                },
                errorMsg: {
                    'font-size': '.8em',
                    'border': '.2em solid #990000',
                    'border-radius': '1em',
                    'background-color': '#cccccc',
                    'margin': '0 .1em',
                    'padding': '.1em .6em',
                    'overflow': 'hidden'
                },
                errorMsgLabel: {
                    'font-weight': 'bold',
                    'background-color': '#990000',
                    'color': '#ffffff',
                    'display': 'inline-block',
                    'padding': '.1em .6em',
                    'border-radius': '0 0 .75em 0',
                    'margin': '-.1em .2em 0em -.6em'
                },

                optionalMsg: {
                    'font-size': '.6em',
                    'color': '#000000',
                    'border': '.1em solid #a2521f',
                    'border-radius': '.5em',
                    'background-color': '#c3701b',
                    'margin': '0 .1em .2em .1em',
                    'padding': '.1em .4em',
                    'overflow': 'hidden'
                },
                optionalMsgLabel: {
                    'font-weight': 'bold',
                    'background-color': '#a2521f',
                    'color': '#ffffff',
                    'display': 'inline-block',
                    'padding': '.1em .6em .1em .4em',
                    'border-radius': '0 0 .75em 0',
                    'margin': '-.1em .2em 0em -.4em'
                },

                myzMsg: {
                    'font-size': '1.25em',
                    'border': '.2em solid #8b3f1f',
                    'border-radius': '.5em',
                    'background-color': '#2c2119',
                    'background-image': 'url('+myzBackground+')',
                    'background-repeat': 'no-repeat',
                    'background-position': 'top',
                    'background-size': '100%',
                    'margin': '0 0',
                    'padding': '.3em',
                    'overflow': 'hidden'
                },
                myzMsgLabelContainer: {
                    'max-width': '10em',
                    'float': 'left',
                    'font-size': '1.5em',
                    'margin-right': '.2em'
                },
                myzMsgLabel: {
                    'border': '.1em solid #a2521f',
                    'border-radius': '.25em',
                    'font-weight': 'normal',
                    'padding': '.1em',
                    'margin-bottom': '.1em',
                    'text-align': 'right'
                },
                myzDie: {
                    'display': 'inline-block',
                    'border': '1px solid black',
                    'border-radius': '.3em',
                    'padding': '.2em 0 0 0',
                    'text-align': 'center',
                    'width': '1.3em',
                    'height': '1.1em',
                    'float': 'left',
                    'margin-right': '.1em',
                    'margin-bottom': '.1em'
                }
            }
        },
        reportingModes = {
            'off': 'None',
            'gm': 'GM',
            'gm+player': 'GM &amp; Player',
            'public': 'Public'
        }, 
        templates = {},

    buildTemplates = function() {
        templates.cssProperty =_.template(
            '<%=name %>: <%=value %>;'
        );

        templates.style = _.template(
            'style="<%='+
                '_.map(css,function(v,k) {'+
                    'return templates.cssProperty({'+
                        'defaults: defaults,'+
                        'templates: templates,'+
                        'name:k,'+
                        'value:v'+
                    '});'+
                '}).join("")'+
            ' %>"'
        );

        templates.button = _.template(
            '<a <%= templates.style({'+
                'defaults: defaults,'+
                'templates: templates,'+
                'css: _.defaults(css,defaults.css.button)'+
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
        );

        templates.errorMsg = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.errorMsg}) %>>'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.errorMsgLabel}) %>>'+
                    '<%= label %>'+
                '</div>'+
                '<%= text %>'+
            '</div>'
        );
        templates.optionalMsg = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.optionalMsg}) %>>'+
                '<% if(label){ %>'+
                    '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.optionalMsgLabel}) %>>'+
                        '<%= label %>'+
                    '</div>'+
                '<% } %>'+
                '<%= text %>'+
            '</div>'
        );

        templates.die = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.myzDie)}) %> >'+
                '<%= text %>'+
            '</div>'
        );

        templates.outputLabel = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.myzMsgLabel)}) %> >'+
                '<%= labelText %>'+
            '</div>'
        );

        templates.output = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.myzMsg}) %> >'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.myzMsgLabelContainer}) %>>'+
                    '<%= results %>'+
                '</div>'+
                '<%= diceImages %>'+
            '</div>'
        );

    },
    makeErrorMsg = function(msg){
        return templates.errorMsg({
            text: msg,
            label: 'Error',
            templates: templates,
            defaults: defaults,
            css: {}
        });
    },
    makeOptionalMsg = function(label,msg){
        return templates.optionalMsg({
            text: msg,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {}
        });
    },

    makeOptionalText = function (optional){
        return '<div>'+_.map(optional,function(o){
            return makeOptionalMsg(o.label,o.msg);
        }).join('')+'</div>';
    },

    makeLabel = function(text,color){
        return templates.outputLabel({
            labelText: text,
            templates: templates,
            defaults: defaults,
            css: {
                'background-color': color
            }
        });
    },
    makeOutput = function (results,diceImages){
        return templates.output({
            results: results,
            diceImages: diceImages,
            templates: templates,
            defaults: defaults,
            css: {}
        });
    },
    makeButton = function(command, label, backgroundColor, color){
        return templates.button({
            command: command,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {
                color: color,
                'background-color': backgroundColor
            }
        });
    },

    checkInstall = function() {
        log('-=> MutantYearZero v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MutantYearZero') || state.MutantYearZero.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.MutantYearZero && state.MutantYearZero.version) {
                case 0.1:
                    state.MutantYearZero.config = {
                        reportMode: 'public'
                    };
                    /* break; // intentional drop through */
                    /* falls through */

                case 0.2:
                    state.MutantYearZero.playerRolls={};
                    state.MutantYearZero.sequence=0;
                    /* break; // intentional drop through */
                    /* falls through */

                case 0.3:
                    state.MutantYearZero.config.gmCanPush=false;
                    /* break; // intentional drop through */
                    /* falls through */

                case 'UpdateSchemaVersion':
                    state.MutantYearZero.version = schemaVersion;
                    break;

                default:
                    state.MutantYearZero = {
                        version: schemaVersion,
                        config: {
                            reportMode: 'public',
                            gmCanPush: false
                        },
                        sequence: 0,
                        playerRolls: {}
                    };
                    break;
            }
        }
        buildTemplates();
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


    makeConfigOption = function(config,command,text) {
        var onOff = (config ? 'On' : 'Off' ),
            color = (config ? '#5bb75b' : '#faa732' );
        return '<div style="'+
                'border: 1px solid #ccc;'+
                'border-radius: .2em;'+
                'background-color: white;'+
                'margin: 0 1em;'+
                'padding: .1em .3em;'+
            '">'+
                '<div style="float:right;">'+
                    makeButton(command,onOff,color)+
                '</div>'+
                text+
                '<div style="clear:both;"></div>'+
            '</div>';
        
    },

    makeConfigOptionSelection = function(config,values,command,text) {
        var buttons=_.map(values,function(v,k){
                return makeButton(
                    command+' '+k,
                    v,
                    (config === k ? '#5bb75b' : '#faa732' )
                );
            });
        return '<div style="'+
                'border: 1px solid #ccc;'+
                'border-radius: .2em;'+
                'background-color: white;'+
                'margin: 0 1em;'+
                'padding: .1em .3em;'+
            '">'+
                text+
                '<div style="float:right;text-align:right;">'+
                    buttons.join('') +
                '</div>'+
                '<div style="clear:both;"></div>'+
            '</div>';
    },

    getConfigOption_GMCanPush = function() {
        return makeConfigOption(
            state.MutantYearZero.config.gmCanPush,
            '!myz-config --toggle-gm-can-push',
            '<b>GM Can Push</b> determines if the GM is allowed to push a player'+ch("'")+' roll.'
        );
    },

    getConfigOption_ErrorReporting = function() {
        return makeConfigOptionSelection(
            state.MutantYearZero.config.reportMode,
            reportingModes,
            '!myz-config --set-report-mode',
            '<b>Report Mode</b> determines when and how invalid push attempts are reported.'
        );
    },

    getAllConfigOptions = function() {
        return getConfigOption_GMCanPush() + getConfigOption_ErrorReporting();
    },

    showHelp = function(playerid) {
        let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');

        sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'MutantYearZero v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>MutantYearZero automates the rolling of Skill, Base (Stat), and Gear dice using Mutant: Year Zero dice mechanics.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!myz '+ch('[')+'Skill Roll'+ch(']')+' '+ch('[')+'Base Roll'+ch(']')+' '+ch('[')+'Gear Roll'+ch(']')+' '+ch('[')+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Performs a Mutant Year Zero Roll.</p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('[')+'Skill Roll'+ch(']')+'</span></b> '+ch('-')+' An inline dice expression rolling the d6s. 6s are counted as a success ('+symbols.radioactive+'). Example: '+ch('[')+ch('[')+'3d6'+ch(']')+ch(']')+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('[')+'Base Roll'+ch(']')+'</span></b> '+ch('-')+' An inline dice expression rolling the d6s. 6s are counted as a success ('+symbols.radioactive+'). 1s are counted as Trama ('+symbols.biohazard+'). Example: '+ch('[')+ch('[')+'4d6'+ch(']')+ch(']')+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('[')+'Gear Roll'+ch(']')+'</span></b> '+ch('-')+' An inline dice expression rolling the d6s ('+symbols.radioactive+').  1s are counted as Gear Degradation ('+symbols.explosion+'). Example: '+ch('[')+ch('[')+'2d6'+ch(']')+ch(']')+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('[')+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b> '+ch('-')+' An optional set of text to be shown above the die roll. Label may be omitted to just provid a text field.  You can specify as many optional descriptions as you like.'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
                        '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!myz '+ch('[')+ch('[')+'5d6'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'3d6'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'4d6'+ch(']')+ch(']')+' --Player|Buzzard --Skill|Know the Zone (Wits)'+
                        '</pre>'+
                    '</div>'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!wmyz '+ch('[')+'Skill Roll'+ch(']')+' '+ch('[')+'Base Roll'+ch(']')+' '+ch('[')+'Gear Roll'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Identical to !myz except that the results are whispered to the player rolling and the GM.</p>'+
		'</div>'+
    '</div>'+
    ( playerIsGM(playerid) ?
        '<b>Configuration</b>' + getAllConfigOptions() :
        ''
    )+
'</div>'
        );
    },

    getDiceCounts = function(msg,idx) {
        var rolls = {};
        if( msg.inlinerolls &&
            msg.inlinerolls[idx] &&
            msg.inlinerolls[idx].results &&
            msg.inlinerolls[idx].results.rolls[0]
        ) {
            _.each(msg.inlinerolls[idx].results.rolls,function(res){
                rolls=_.reduce(_.map(res.results,function(r){
                    return r.v;
                }).sort()  || [], function(m,r){
                    m[r]=(m[r]||0)+1;
                    return m;
                },rolls);
            });
        }
        return rolls;
    },

    getDiceArray = function(c) {
        return _.reduce(c,function(m,v,k){
			_.times(v,function(){m.push(k);});
            return m;
        },[]);
    },

    makeDiceImages = function(dice,bgcolor,color){
        bgcolor=bgcolor||'black';
        color=color||'white';
        return _.map(dice,function(r){
            return templates.die({
                text: r,
                templates:templates,
                defaults:defaults,
                css: {
                    'background-color': bgcolor,
                    'color': color
                }
            });
        }).reverse().join('');
    },
    getRollableDiceCount = function(dice){
        return _.filter(dice,function(v){return (v+'').match(/^\d+$/);}).length;
    },
    makeRerollExpression = function(dice){
        var cnt = getRollableDiceCount(dice);
        return ' '+ch('[')+ch('[')+cnt+'d6'+ch(']')+ch(']')+' ';
    },
    validatePlayerRollHash = function(playerid, hash, skill,base,gear){
        var obj=state.MutantYearZero.playerRolls[playerid];
        return (obj && obj.hash === hash &&
            obj.dice.skillDice === skill &&
            obj.dice.baseDice === base &&
            obj.dice.gearDice === gear 
        );
    },
    getCountsForRoll = function(playerid,hash){
        if(hash && _.has(state.MutantYearZero.playerRolls,playerid)){
            return state.MutantYearZero.playerRolls[playerid].counts;
        }
        return {
            success: 0,
            trauma: 0,
            damage: 0,
            pushes: 0
        };
    },
    getOptionalForRoll = function(playerid,hash){
        if(hash && _.has(state.MutantYearZero.playerRolls,playerid)){
            return state.MutantYearZero.playerRolls[playerid].optional;
        }
        return [];
    },

    recordPlayerRollHash = function(playerid, obj){
        state.MutantYearZero.playerRolls[playerid]=obj;
    },

    reportBadPushCounts = function(playerid){
        var player=getObj('player',playerid);
        switch(state.MutantYearZero.config.reportMode){
            case 'public':
                    sendChat(player.get('displayname'),'/direct '+
                        makeErrorMsg('Attempting to push with modified dice counts.')
                    );
                break;
            case 'gm+player':
                if(!playerIsGM(playerid)){
                    sendChat('','/w "'+player.get('displayname')+'" '+
                       makeErrorMsg('Do not adjust the number of dice when pushing.')
                    );
                }

			/* falls through */
			/* break; // intentional drop thru */
			/* eslint-disable no-fallthrough */
            case 'gm':
			/* eslint-enable no-fallthrough */
                if(playerIsGM(playerid)){
                    sendChat('','/w gm '+
                        makeErrorMsg('Cannot adjust the number of dice in a Push attempt.')
                    );
                } else {
                    sendChat('','/w gm '+
                        makeErrorMsg(player.get('displayname')+' attempted to Push with an altered number of dice.')
                    );
                }
                break;

            default:
                break;
        }
    },

    reportBadPush = function(playerid){
        var player=getObj('player',playerid);
        switch(state.MutantYearZero.config.reportMode){
            case 'public':
                    sendChat(player.get('displayname'),'/direct '+
                        makeErrorMsg('Cannot Push old rolls.  Please use the current result'+ch("'")+'s Push button.')
                    );
                break;
            case 'gm+player':
                if(!playerIsGM(playerid)){
                    sendChat('','/w "'+player.get('displayname')+'" '+
                        makeErrorMsg('Cannot Push old rolls.  Please use the current result'+ch("'")+'s Push button.')
                    );
                }
                /* break; // intentional drop thru */
                /* falls through */

            case 'gm':
                if(playerIsGM(playerid)){
                    sendChat('','/w gm '+makeErrorMsg('Cannot Push old rolls.'));
                } else {
                    sendChat('','/w gm '+makeErrorMsg(player.get('displayname')+' attempted to Push from an old roll.'));
                }
                break;

            default:
                break;
        }
    },

    reportNotAllowed = function(playerid,ownerid){
        var player=getObj('player',playerid),
            owner=getObj('player',ownerid);
        switch(state.MutantYearZero.config.reportMode){
            case 'public':
                    sendChat(player.get('displayname'),'/direct '+
                        makeErrorMsg('Cannot Push '+owner.get('displayname')+ch("'")+'s roll.')
                    );
                break;
            case 'gm+player':
                if(!playerIsGM(playerid)){
                    sendChat('','/w "'+player.get('displayname')+'" '+
                        makeErrorMsg('Cannot Push '+owner.get('displayname')+ch("'")+'s roll.')
                    );
                }
                /* break; // intentional drop thru */
                /* falls through */

            case 'gm':
                if(playerIsGM(playerid)){
                    sendChat('','/w gm '+
                        makeErrorMsg('Cannot Push '+owner.get('displayname')+ch("'")+'s roll because <b>GM Can Push</b> is not enabled.  See '+makeButton('!myz-config','Configuration')+' for details.')
                    );
                } else {
                    sendChat('','/w gm '+makeErrorMsg(player.get('displayname')+' attempted to Push '+owner.get('displayname')+ch("'")+'s roll.'));
                }
                break;

            default:
                break;
        }
    },


    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args,
            optional,
            who,

            rollIndices=[],
            skillDice, // skill: green
            baseDice, // base(stat): yellow, trauma on 1s
            gearDice, // gear: black, degradation on 1s

            skillDiceArray,
            baseDiceArray,
            gearDiceArray,

            successes=0,
            trauma=0,
            gearDamage=0,
            pushedValues,
            pushes,

            push=false,
            pushButton,
            w=false,
            cmd,
            hash,
            matches,
            owner,
            output;

        if (msg.type !== "api") {
            return;
        }

		if(_.has(msg,'inlinerolls')){
            rollIndices=_.map(msg.content.match(/\$\[\[(\d+)\]\]/g),function(i){
                return i.match(/\d+/)[0];
            });
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

        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        optional = msg.content.split(/\s+--/);
        args = optional.shift().split(/\s+/);
        optional = _.map(optional,function(o){
            var s=o.split(/\|/),
                k=s.shift();
                s=s.join('|');
            return {
                label: k,
                msg: s
            };
        });

        cmd=args.shift();
        matches=cmd.match(/^(!\S+)\[([^\]]+)\]/);
        if(matches){
            cmd=matches[1];
            hash=parseInt(matches[2],10);
        }

        switch(cmd) {
            case '!wmyz':
                w=true;
                /* break; */ // Intentional drop through
                /* falls through */

            case '!myz':
                if( 0 === args.length || _.contains(args,'--help')) {
                    showHelp(msg.playerid);
                    return;
                }

                push=!!hash;
                if( push &&
                    ( _.has(state.MutantYearZero.playerRolls,msg.playerid) &&
                        ( hash !== state.MutantYearZero.playerRolls[msg.playerid].hash) )
                ) {
                    owner = _.find(state.MutantYearZero.playerRolls,function(v){
                        return hash === v.hash;
                    });
                    if(owner){
                        owner=owner.playerid;
                        if(!(playerIsGM(msg.playerid) && state.MutantYearZero.config.gmCanPush)){
                            reportNotAllowed(msg.playerid,owner);
                            return;
                        }
                    } else {
                        reportBadPush(msg.playerid);
                        return;
                    }
                }

                owner = owner || msg.playerid;
                skillDice=getDiceCounts(msg,rollIndices[0]);
                baseDice=getDiceCounts(msg,rollIndices[1]);
                gearDice=getDiceCounts(msg,rollIndices[2]);

                
                if(push &&
                    (
                        _.has(state.MutantYearZero.playerRolls,owner) &&
                        ( hash === state.MutantYearZero.playerRolls[owner].hash)
                    ) &&
                    !validatePlayerRollHash(owner,hash,
                        getDiceArray(skillDice).length,
                        getDiceArray(baseDice).length,
                        getDiceArray(gearDice).length
                    )
                ){
                    reportBadPushCounts(msg.playerid);
                    return;
                }
                pushedValues=getCountsForRoll(owner,hash);

                successes=pushedValues.success + (skillDice['6']||0) + (baseDice['6']||0) + (gearDice['6']||0) ;
                trauma = pushedValues.trauma + (baseDice['1']||0);
                gearDamage = pushedValues.damage + (gearDice['1']||0);
                pushes = pushedValues.pushes+1;

                optional = (optional.length && optional) || getOptionalForRoll(owner,hash);


                skillDiceArray=_.map(getDiceArray(skillDice),function(v){
                    switch(v){
                        case '6':
                        case '-6':
                            return symbols.radioactive;
                        default:
                            return v;
                    }
                });

                baseDiceArray=_.map(getDiceArray(baseDice),function(v){
                    switch(v){
                        case '1':
                            return symbols.biohazard;
                        case '6':
                            return symbols.radioactive;
                        default:
                            return v;
                    }
                });
                gearDiceArray=_.map(getDiceArray(gearDice),function(v){
                    switch(v){
                        case '1':
                            return symbols.explosion;
                        case '6':
                            return symbols.radioactive;
                        default:
                            return v;
                    }
                });

               // record push
               hash=(++state.MutantYearZero.sequence);
               recordPlayerRollHash(owner,{
                   hash: hash,
                   playerid: owner,
                   dice: {
                       skillDice: getRollableDiceCount(skillDiceArray),
                       baseDice: getRollableDiceCount(baseDiceArray),
                       gearDice: getRollableDiceCount(gearDiceArray)
                    },
                    counts: {
                        success: successes,
                        trauma: trauma,
                        damage: gearDamage,
                        pushes: pushes
                    },
                    optional: optional
                });

                pushButton = (_.reduce([skillDiceArray,baseDiceArray,gearDiceArray],function(m,dice){ return m+getRollableDiceCount(dice);},0) ?
                    makeButton(
                        '!'+(w?'w':'')+'myz['+hash+'] '+
                        makeRerollExpression(skillDiceArray)+
                        makeRerollExpression(baseDiceArray)+
                        makeRerollExpression(gearDiceArray),
                        symbols.push+' '+pushes
                    ) :
                    ''
                );

                output = makeOutput([
                        makeLabel( successes+' '+symbols.radioactive, colors.lightGreen),
                        makeLabel( trauma+' '+symbols.biohazard, colors.lightYellow),
                        makeLabel( gearDamage+' '+symbols.explosion, colors.lightBlack),
                        pushButton
                    ].join(''),
                    [
                        makeOptionalText(optional),
                        makeDiceImages(skillDiceArray,colors.green),
                        makeDiceImages(baseDiceArray,colors.yellow, colors.black),
                        makeDiceImages(gearDiceArray,colors.black)
                    ].join('')
                );



                who=getObj('player',owner).get('displayname');
                if(w){
                    sendChat(msg.who, '/w gm '+output);
                    if(!playerIsGM(owner)){
                        sendChat(who, '/w "'+who+'" '+output);
                    }
                } else {
                    sendChat(who, '/direct '+output);
                }

                break;

            case '!myz-config':
                if(!playerIsGM(msg.playerid)){
                    return;
                }
                args = _.rest(msg.content.split(/\s+--/));
                if(_.contains(args,'help')) {
                    showHelp(msg.playerid);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'MutantYearZero v'+version+
	'</div>'+
    '<b>Configuration</b>'+
    getAllConfigOptions()+
'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\s+/);
                    switch(opt.shift()) {

                        case 'toggle-gm-can-push':
                            state.MutantYearZero.config.gmCanPush=!state.MutantYearZero.config.gmCanPush;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_GMCanPush()+
                                '</div>'
                            );
                            break;
                        
                        case 'set-report-mode':
                            if(_.has(reportingModes,opt[0])){
                                state.MutantYearZero.config.reportMode=opt[0];
                                sendChat('','/w "'+who+'" '+
                                    '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                        getConfigOption_ErrorReporting()+
                                    '</div>'
                                );
                            } else {
                                sendChat('','/w "'+who+'" '+
                                    '<div><b>Unsupported Reporting Mode Option:</div> '+opt[0]+'</div>'
                                );
                            }
                            break;

                        default:
                            sendChat('','/w "'+who+'" '+
                                '<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });

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

    MutantYearZero.CheckInstall();
    MutantYearZero.RegisterEventHandlers();
});




