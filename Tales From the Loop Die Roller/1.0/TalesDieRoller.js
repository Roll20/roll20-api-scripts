// By: Barry Snyder heavily leveraging the MYZ script by The Aaron
// look into adding 3d dice https://wiki.roll20.net/API:Chat

var TalesFromtheLoop = TalesFromtheLoop || (function() {
    'use strict';

    var version = '1',
        lastUpdate = 'April 11th, 2018',
        schemaVersion = 0.1,
        symbols = {
            atom:  '&#'+'x269B;',
            push: '&#'+'10150;'
        },
        skillDie = 'https://i.imgur.com/W1idZHz.png', 
        attrDie = 'https://i.imgur.com/YmhTKsUt.png', 
        itemDie = 'https://i.imgur.com/4S3h10T.png', 
        colors = {
			looporange: '#ED7012', //successes
			white: '#FFFFFF', //base-attribute rolls
            black: '#1d1d1d', //item roll
			loopyellow: '#FBBB1D', //skill rolls
			loopblue: '#128fed' //
        },
        defaults = {
            css: {
                button: {
                    'border': '1px solid #128fed',
                    'border-radius': '.25em',
                    'background-color': '#006dcc',
                    'font-weight': 'bold',
                    'padding': '.225em',
                    'text-align': 'center',
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

                optionalMsg: {						// background and text for optional text message
                    'font-size': '.6em',
                    'border': '.1em solid #1222ed',  // border around entire message
                    'border-radius': '.5em',
                    'background-color': '#a0d2f8', // background of message text
                    'margin': '0 .1em .2em .1em',
                    'padding': '.1em .4em',
                    'overflow': 'hidden'
                },
                optionalMsgLabel: {					// background and text for optional text label
                    'font-weight': 'bold',
                    'background-color': '#006dcc',
                    'color': '#ffffff',				// label text
                    'display': 'inline-block',
                    'padding': '.1em .6em .1em .4em',
                    'border-radius': '0 0 .75em 0',
                    'margin': '-.1em .2em 0em -.4em'
                },

                loopMsg: {							// roll background and border
                    'font-size': '1.25em',
                    'border': '.25em solid #128fed', 
                    'border-radius': '.5em',
                    'background-color': '#5FACFC',
                    'background-repeat': 'no-repeat',
                    'background-position': 'top',
                    'background-size': '100%',
                    'margin': '0 0',
                    'padding': '.3em',
                    'overflow': 'hidden'
                },
                loopMsgLabelContainer: {
                    'max-width': '10em',
                    'float': 'left',
                    'font-size': '1.5em',
                    'margin-right': '.2em'
                },
                loopMsgLabel: {						// Summary of Successes
                    'border': '.1em solid #cccccc',
                    'border-radius': '.25em',
                    'font-weight': 'bold',
                    'padding': '.225em',
                    'margin-bottom': '.225em',
                    'text-align': 'center'
                },
                loopDie: {
                    'display': 'inline-block',
                    'border': '1px solid black',
                    'border-radius': '.3em',
                    'padding': '.2em 0 0 0',
                    'text-align': 'center',
                    'width': '1.4em', 
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
            'gm+player': 'GM & Player',
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
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.loopDie)}) %> >'+
                '<%= text %>'+
            '</div>'
        );

        templates.outputLabel = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.loopMsgLabel)}) %> >'+
                '<%= labelText %>'+
            '</div>'
        );

        templates.output = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.loopMsg}) %> >'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.loopMsgLabelContainer}) %>>'+
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

    makeLabel = function(text,bgcolor,color){
        bgcolor=bgcolor;
        color=color;
        return templates.outputLabel({
            labelText: text,
            templates: templates,
            defaults: defaults,
            css: {
                'background-color': bgcolor,
				'color': color
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
        log('-=> TalesFromtheLoop v'+version+' <=-  ['+(lastUpdate)+']');

        if( ! _.has(state,'TalesFromtheLoop') || state.TalesFromtheLoop.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.TalesFromtheLoop && state.TalesFromtheLoop.version) {
                case 0.1:
                    state.TalesFromtheLoop.config = {
                        reportMode: 'public'
                    };
                    /* break; // intentional drop through */
                    /* falls through */

                case 0.2:
                    state.TalesFromtheLoop.playerRolls={};
                    state.TalesFromtheLoop.sequence=0;
                    /* break; // intentional drop through */
                    /* falls through */

                case 0.3:
                    state.TalesFromtheLoop.config.gmCanPush=false;
                    /* break; // intentional drop through */
                    /* falls through */

                case 'UpdateSchemaVersion':
                    state.TalesFromtheLoop.version = schemaVersion;
                    break;

                default:
                    state.TalesFromtheLoop = {
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
            state.TalesFromtheLoop.config.gmCanPush,
            '!loop-config --toggle-gm-can-push',
            '<b>GM Can Push</b> determines if the GM is allowed to push a player'+ch("'")+' roll.'
        );
    },

    getConfigOption_ErrorReporting = function() {
        return makeConfigOptionSelection(
            state.TalesFromtheLoop.config.reportMode,
            reportingModes,
            '!loop-config --set-report-mode',
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
		'Tales from the Loop v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Tales from the Loop automates the rolling of Attribute, Skill, and Item dice.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!loop '+ch('[')+'Attribute Roll'+ch(']')+' '+ch('[')+'Skill Roll'+ch(']')+' '+ch('[')+'Item Roll'+ch(']')+' '+ch('[')+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Performs a Tales from the Loop Roll.</p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;"><img src='+attrDie+'> Attribute Roll </span></b> '+ch('-')+' An inline dice expression rolling the d6s. 6s are counted as a success ('+symbols.atom+'). Example: '+ch('[')+ch('[')+'2d6'+ch(']')+ch(']')+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;"><img src='+skillDie+'> Skill Roll </span></b> '+ch('-')+' An inline dice expression rolling the d6s. 6s are counted as a success ('+symbols.atom+'). Example: '+ch('[')+ch('[')+'1d6'+ch(']')+ch(']')+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;"><img src='+itemDie+'> Item Roll </span></b> '+ch('-')+' An inline dice expression rolling the d6s ('+symbols.atom+').  Example: '+ch('[')+ch('[')+'2d6'+ch(']')+ch(']')+
				'</li> '+
					'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('[')+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b> '+ch('-')+' An optional set of text to be shown above the die roll. Label may be omitted to just provid a text field.  You can specify as many optional descriptions as you like.'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
                        '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!loop '+ch('[')+ch('[')+'2d6'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'1d6'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'2d6'+ch(']')+ch(']')+' '+' --Name|Billy --Skill|Move (Body) --Item|Nike High Tops'+
                        '</pre>'+
                    '</div>'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!wloop '+ch('[')+'Attribute Roll'+ch(']')+' '+ch('[')+'Skill Roll'+ch(']')+' '+ch('[')+'Item Roll'+ch(']')+' '+ch('[')+'Legend Roll'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Identical to !loop except that the results are whispered to the player rolling and the GM.</p>'+
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
	
    makeRerollExpression = function(dice, dieType='d6'){
        var cnt = getRollableDiceCount(dice);
        return ' '+ch('[')+ch('[')+cnt+dieType+ch(']')+ch(']')+' ';
    },
	
    validatePlayerRollHash = function(playerid,hash,base,skill,item){
        var obj=state.TalesFromtheLoop.playerRolls[playerid];
        return (obj && obj.hash === hash &&
            obj.dice.baseDice === base &&
            obj.dice.skillDice === skill &&
            obj.dice.itemDice === item  
        );
    },
    getCountsForRoll = function(playerid,hash){
        if(hash && _.has(state.TalesFromtheLoop.playerRolls,playerid)){
            return state.TalesFromtheLoop.playerRolls[playerid].counts;
        }
        return {
            success: 0,
            pushes: 0
        };
    },
    getOptionalForRoll = function(playerid,hash){
        if(hash && _.has(state.TalesFromtheLoop.playerRolls,playerid)){
            return state.TalesFromtheLoop.playerRolls[playerid].optional;
        }
        return [];
    },

    recordPlayerRollHash = function(playerid, obj){
        state.TalesFromtheLoop.playerRolls[playerid]=obj;
    },

    reportBadPushCounts = function(playerid){
        var player=getObj('player',playerid);
        switch(state.TalesFromtheLoop.config.reportMode){
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

            case 'gm':
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
        switch(state.TalesFromtheLoop.config.reportMode){
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
        switch(state.TalesFromtheLoop.config.reportMode){
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
                        makeErrorMsg('Cannot Push '+owner.get('displayname')+ch("'")+'s roll because <b>GM Can Push</b> is not enabled.  See '+makeButton('!loop-config','Configuration')+' for details.')
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
            baseDice, // base(attribute): white
            skillDice, // skill: loopyellow
            itemDice, // item: black

            baseDiceArray,
            skillDiceArray,
            itemDiceArray,

            successes=0,
            pushes=0,
            pushedValues,

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
            case '!wforl':
                w=true;
                /* break; */ // Intentional drop through
                /* falls through */

            case '!loop':
                if( 0 === args.length || _.contains(args,'--help')) {
                    showHelp(msg.playerid);
                    return;
                }

                push=!!hash;
                if( push &&
                    ( _.has(state.TalesFromtheLoop.playerRolls,msg.playerid) &&
                        ( hash !== state.TalesFromtheLoop.playerRolls[msg.playerid].hash) )
                ) {
                    owner = _.find(state.TalesFromtheLoop.playerRolls,function(v){
                        return hash === v.hash;
                    });
                    if(owner){
                        owner=owner.playerid;
                        if(!(playerIsGM(msg.playerid) && state.TalesFromtheLoop.config.gmCanPush)){
                            reportNotAllowed(msg.playerid,owner);
                            return;
                        }
                    } else {
                        reportBadPush(msg.playerid);
                        return;
                    }
                }

                owner = owner || msg.playerid;
                baseDice=getDiceCounts(msg,rollIndices[0]);
                skillDice=getDiceCounts(msg,rollIndices[1]);
                itemDice=getDiceCounts(msg,rollIndices[2]);
						
                if(push &&
                    (
                        _.has(state.TalesFromtheLoop.playerRolls,owner) &&
                        ( hash === state.TalesFromtheLoop.playerRolls[owner].hash)
                    ) &&
                    !validatePlayerRollHash(owner,hash,
                        getDiceArray(baseDice).length,
                        getDiceArray(skillDice).length,
                        getDiceArray(itemDice).length
                    )
                ){
                    reportBadPushCounts(msg.playerid);
                    return;
                }
				
                pushedValues=getCountsForRoll(owner,hash);

                successes = pushedValues.success + (baseDice['6']||0) + (skillDice['6']||0) + (itemDice['6']||0); 
				if(push){pushes = pushedValues.pushes+1}; 	// only update if there is a push ... should be at 0 when a roll is first made
					
                optional = (optional.length && optional) || getOptionalForRoll(owner,hash);

                baseDiceArray=_.map(getDiceArray(baseDice),function(v){
                    switch(v){
                        case '6':
                            return symbols.atom;
                        default:
                            return v;
                    }
                });
				
                skillDiceArray=_.map(getDiceArray(skillDice),function(v){
                    switch(v){
                        case '6':
                        case '-6':
                            return symbols.atom;
                        default:
                            return v;
                    }
                });

				
                itemDiceArray=_.map(getDiceArray(itemDice),function(v){
                    switch(v){
                        case '6':
                            return symbols.atom;
                        default:
                            return v;
                    }
                });
							
               // record push
               hash=(++state.TalesFromtheLoop.sequence);
               recordPlayerRollHash(owner,{
                   hash: hash,
                   playerid: owner,
                   dice: {
                       baseDice: getRollableDiceCount(baseDiceArray),
                       skillDice: getRollableDiceCount(skillDiceArray),
                       itemDice: getRollableDiceCount(itemDiceArray)
                    },
                    counts: {
                        success: successes,
                        pushes: pushes
                    },
                    optional: optional
                });

                pushButton = (_.reduce([baseDiceArray,skillDiceArray,itemDiceArray],function(m,dice){ return m+getRollableDiceCount(dice);},0) ?
                    makeButton(
                        '!'+(w?'w':'')+'loop['+hash+'] '+
                        makeRerollExpression(baseDiceArray)+
                        makeRerollExpression(skillDiceArray)+
                        makeRerollExpression(itemDiceArray),
                        symbols.push+' '+pushes
                    ) :
                    ''
                );

                output = makeOutput([ 
                        makeLabel( successes+'  '+symbols.atom, colors.looporange, colors.white),
						pushButton
                    ].join(''),
                    [
                        makeOptionalText(optional),
                        makeDiceImages(baseDiceArray,colors.white, colors.black),
                        makeDiceImages(skillDiceArray,colors.loopyellow, colors.black),
                        makeDiceImages(itemDiceArray,colors.black)
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

            case '!loop-config':
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
		'TalesFromtheLoop v'+version+
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
                            state.TalesFromtheLoop.config.gmCanPush=!state.TalesFromtheLoop.config.gmCanPush;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_GMCanPush()+
                                '</div>'
                            );
                            break;
                        
                        case 'set-report-mode':
                            if(_.has(reportingModes,opt[0])){
                                state.TalesFromtheLoop.config.reportMode=opt[0];
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

    TalesFromtheLoop.CheckInstall();
    TalesFromtheLoop.RegisterEventHandlers();
});
