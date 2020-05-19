// By: Barry Snyder heavily leveraging the MYZ script courtesy of The Aaron
// Version 3.1

            
var WrathAndGlory = WrathAndGlory || (function() {
    'use strict';

    var version = '3.1',
        lastUpdate = 'May 20th, 2020',
        schemaVersion = 0.1,
        symbols = { 
            iconsymbol:  "<img src='https://i.imgur.com/GOA0o3s.png'>", 
            exaltedsymbol:  "<img src='https://i.imgur.com/VjSiyZL.png'>", 
            ruinsymbol: "<img src='https://i.imgur.com/XtJ1j2x.png'>", 
			blackicon: "<img src='https://i.imgur.com/94YUvsN.png'>",
			blackexalted: "<img src='https://i.imgur.com/W7ldWiC.png'>",
			blackruin: "<img src='https://i.imgur.com/zA1plx9.png'>",
			critical:  "<img src='https://i.imgur.com/3xkPL4y.png'>", // '&#'+'128165;'
            rerollsymbol: '&#'+'127922;' 
        },
        wagBackground = 'https://i.imgur.com/vnvGWET.jpg', 
        colors = {
            white: '#FFFFFF', 
            red: '#cc0000', 
            yellow: '#ffcc00', 
            black: '#000000', 
            gold: '#ffcc00' 
        },
        defaults = {
            css: {
                button: {
                    'display': 'block', 
                    'margin': '0em 0em 0.2em 0em', 
                    'border': '1px solid #000000',
                    'border-radius': '.3em',
                    'background-color': '#003399',
                    'font-weight': 'normal', 
                    'color': 'white',
                    'text-decoration': 'none !important', //CUSTOM
                    'text-align': 'right'
                },
                errorMsg: {
                    'font-size': '.8em',
                    'border': '.2em solid #000000',
                    'border-radius': '1em',
                    'background-color': '#ffcc00',
                    'margin': '0 .1em',
                    'padding': '.1em .6em',
                    'overflow': 'hidden'
                },
                errorMsgLabel: {
                    'font-weight': 'bold',
                    'background-color': '#cc0000',
                    'color': '#FFFFFF',
                    'display': 'inline-block',
                    'padding': '.1em .6em',
                    'border-radius': '0 0 .75em 0',
                    'margin': '-.1em .1em 0em -.6em'
                },

                optionalMsg: {                      // background and text for optional text message
                    'font-weight': 'bold',  
                    'font-size': '.9em',
                    'text-align': 'left',  
                    'border': '.1em solid #000000',  
                    'border-radius': '.5em',
                    'background-color': '#e6e6e6', 
                    'color': '#000000',
                    'margin': '0em 0.2em 0.4em 0em', 
                    //'padding': '0.2em', 
                    'overflow': 'hidden'
                },
                optionalMsgLabel: {                 // background and text for optional text label
                    'float': 'left',  
                    'text-align': 'left', 
                    'font-weight': 'normal', 
                    'font-size': '.9em',
                    'background-color': '#404040',
                    'color': '#ffffff',
                    'display': 'inline-block',
                    'padding': '0.2em 0.4em 0.2em 0.2em', 
                    'border-radius': '0 0 .75em 0',
                    'margin': '-0.2em 0.4em 0em -0.2em' 
                },

                wagMsg: {                           // roll background and border
                    'font-size': '1em',
                    'border': '.2em solid #000000', 
                    'border-radius': '.5em',
                    'background-color': '#2c2119',
                    'background-image': 'url('+wagBackground+')',
                    'background-repeat': 'no-repeat',
                    'background-position': 'top',
                    'background-size': '100%',
                    'margin': '0 0',
                    'padding': '.3em',
                    'overflow': 'hidden',
                    'max-width': '24em' 
                },
                wagMsgLabelContainer: {
                    'max-width': '10em',
                    'float': 'right', 
                    'font-size': '1.5em',
                    'margin-left': '.2em' 
                },
                wagMsgLabel: {                      // border around dice result summary
                    'border': '.1em solid #000000',
                    'border-radius': '.25em',
                    'font-weight': 'normal',
                    'padding': '.1em',
                    'margin': '0em 0em 0.2em 0em', 
                    'text-align': 'center'
                },
                wagDie: {
                    'display': 'inline-block', 
                    'border': '1px solid #000000',
                    'border-radius': '.3em',
                    'padding': '.2em 0 0 0',
                    'text-align': 'center',
                    'width': '1.5em', // was 1.6
                    'height': '1.5em', // was 1.3
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
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.wagDie)}) %> >'+
                '<%= text %>'+
            '</div>'
        );

        templates.outputLabel = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.wagMsgLabel)}) %> >'+
                '<%= labelText %>'+
            '</div>'
        );

        templates.output = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.wagMsg}) %> >'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.wagMsgLabelContainer}) %>>'+
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

    makeOptionalText = function (optional,damage,successes,wrathoutcome){
        return '<div>'+_.map(optional,function(o){
			var optmsg=o.msg;
			// if the optional text is Damage set msg to be DR + Successes
			if(o.label=="Damage"){
				damage = (successes*1) + (o.msg*1);
				damage=damage+'&nbsp;('+o.msg+'+'+successes+')';
				optmsg=damage;
			};
			
			// new line set the wrath die label
			if(o.label=="Wrath Die"){ 
				// cocatenate wrath results for multiple wrath dice
				optmsg=wrathoutcome; 
			}; 
			
			
            return makeOptionalMsg(o.label,optmsg);
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
        log('-=> WrathAndGlory v'+version+' <=-  ['+(lastUpdate)+']');

        if( ! _.has(state,'WrathAndGlory') || state.WrathAndGlory.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.WrathAndGlory && state.WrathAndGlory.version) {
                case 0.1:
                    state.WrathAndGlory.config = {
                        reportMode: 'public'
                    };
                    /* break; // intentional drop through */
                    /* falls through */

                case 0.2:
                    state.WrathAndGlory.playerRolls={};
                    state.WrathAndGlory.sequence=0;
                    /* break; // intentional drop through */
                    /* falls through */

                case 0.3:
                    state.WrathAndGlory.config.gmCanReroll=false;
                    /* break; // intentional drop through */
                    /* falls through */

                case 'UpdateSchemaVersion':
                    state.WrathAndGlory.version = schemaVersion;
                    break;

                default:
                    state.WrathAndGlory = {
                        version: schemaVersion,
                        config: {
                            reportMode: 'public',
                            gmCanReroll: false
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

    getConfigOption_GMCanReroll = function() {
        return makeConfigOption(
            state.WrathAndGlory.config.gmCanReroll,
            '!wag-config --toggle-gm-can-reroll',
            '<b>GM Can reroll</b> determines if the GM is allowed to reroll a player'+ch("'")+' roll.'
        );
    },

    getConfigOption_ErrorReporting = function() {
        return makeConfigOptionSelection(
            state.WrathAndGlory.config.reportMode,
            reportingModes,
            '!wag-config --set-report-mode',
            '<b>Report Mode</b> determines when and how invalid reroll attempts are reported.'
        );
    },

    getAllConfigOptions = function() {
        return getConfigOption_GMCanReroll() + getConfigOption_ErrorReporting();
    },

    showHelp = function(playerid) {
        let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');

        sendChat('','/w "'+who+'" '+
    '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
    '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
        'Wrath & Glory v'+version+
    '</div>'+
    '<div style="padding-left:10px;margin-bottom:3px;">'+
        '<p>Wrath & Glory automates the rolling of dice tests.</p>'+
    '</div>'+
    '<b>Reading Results</b>'+
    '<div style="padding-left:10px;">'+
        '<p>The macro presents a column of results on the left with labels and dice on the right. The following is a list of dice symbols:<br>'+
		'<ul>'+
		'<li>'+symbols.blackicon+' = Icon'+
		'<li>'+symbols.blackexalted+' = Exalted Icon'+
		'<li>'+symbols.critical+' = Critical Hit'+
		'<li>'+symbols.blackruin+' = Ruin Icon (complication)'+
		'</ul>'+  
		
		'<p>The results are listed in sequence as follows:<br>'+
		'<ul>'+
		'<li>Total successes (Total)'+
		'<li>Total <b>Icons</b> rolled ('+symbols.blackicon+')</li>'+
		'<li>Total <b>Exalted Icons</b> rolled ('+symbols.blackexalted+')</li>'+
		'<li>Total Ruin('+symbols.blackruin+')</li>'+
		'<li>Reroll button ('+symbols.rerollsymbol+') to reroll all failed dice.</li>'+
		'</ul>'+
    '<b>Commands</b>'+
    '<div style="padding-left:10px;">'+
        '<b><span style="font-family: serif;">!wag '+ch('[')+'dice pool'+ch(']')+' '+ch('[')+'wrath die'+ch(']')+' '+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px">'+
            '<p>Performs a Wrath & Glory test.</p>'+
            '<ul>'+
                '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                    '<b><span style="font-family: serif;">'+ch('[')+'dice pool'+ch(']')+'</span></b> '+ch('-')+' An inline dice expression rolling the d6s. This is the pool of dice less one for the Wrath die if a wrath die is part of the test. Example: '+ch('[')+ch('[')+'3d6'+ch(']')+ch(']')+
                '</li> '+
                '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                    '<b><span style="font-family: serif;">'+ch('[')+'wrath die'+ch(']')+'</span></b> '+ch('-')+' An inline dice expression rolling a d6 for wrath; leave blank if there is not a wrath die. Example: '+ch('[')+ch('[')+'1d6'+ch(']')+ch(']')+
                '</li> '+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
    '<b><span style="font-family: serif;">'+ch('[')+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b> '+ch('-')+' An optional set of text to be shown above the die roll. Label may be omitted to just provide a text field.  You can specify as many optional descriptions as you like.  <br><br> <b><i>Setting Die Modifier:</b></i> To set a die modifier (adds to the die roll) for cases such as Soak and Brutal weapons add Modifier|#. <br><br> <b><i>Determining Wrath Outcome:</b></i> To have the API return the outcome - Glory, Ruin, Complication, Critical - add --Wrath Die|Test for tests and --Wrath Die|Attack for attack rolls.<br><br>'+
                    '<div style="padding-left: 10px;padding-right:20px">Example with Wrath:'+
                        '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!wag '+ch('[')+ch('[')+'6d6'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'1d6'+ch(']')+ch(']')+' --Player|Sever --Skill|Athletics (Strength) --Modifier|0 --Wrath Die|Test'+
                        '</pre>'+
                    '</div>'+
                    '<div style="padding-left: 10px;padding-right:20px">Example without Wrath:'+
                        '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!wag '+ch('[')+ch('[')+'6d6'+ch(']')+ch(']')+' '+' --Player|Sever --Skill|Soak (Toughness) --Modifier|1'+
                        '</pre>'+
                    '</div>'+
                '</li> '+
            '</ul>'+
        '</div>'+
    '</div>'+
    '<div style="padding-left:10px;">'+
        '<b><span style="font-family: serif;">!wwag '+ch('[')+'dice pool'+ch(']')+' '+ch('[')+'wrath die'+ch(']')+' '+'--'+ch('<')+'Label'+ch('>')+ch('|')+ch('<')+'Message'+ch('>')+' ...'+ch(']')+'</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px">'+
            '<p>Identical to !wag except that the results are whispered to the player rolling and the GM.</p>'+
        '</div>'+
    '</div>'+
    ( playerIsGM(playerid) ?
        '<b>Configuration</b>' + getAllConfigOptions() :
        ''
    )+
'</div>'
        );
    },

    getDiceCounts = function(msg,idx,dmod) {
        var rolls = {};
        if( msg.inlinerolls &&
            msg.inlinerolls[idx] &&
            msg.inlinerolls[idx].results &&
            msg.inlinerolls[idx].results.rolls[0]
        ) {
            _.each(msg.inlinerolls[idx].results.rolls,function(res){
                rolls=_.reduce(_.map(res.results,function(r){   
                    // modify the roll with the die modifier passed through before sorting and returning results
                    r.v = r.v + dmod; // add diemod to r.v
                    r.v = Math.max(1,r.v); // r.v cannot be less than 1
                    r.v = Math.min(6,r.v); // r.v cannot be greater than 6
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
    
    validatePlayerRollHash = function(playerid, hash, base, wrath){
        var obj=state.WrathAndGlory.playerRolls[playerid];
        return (obj && obj.hash === hash &&
            obj.dice.baseDice === base &&
            obj.dice.wrathDice === wrath
        );
    },
    getCountsForRoll = function(playerid,hash){
        if(hash && _.has(state.WrathAndGlory.playerRolls,playerid)){
            return state.WrathAndGlory.playerRolls[playerid].counts;
        }
        return {
            success: 0,
            icon: 0,
            exalted: 0,
            ruin: 0,
            rerolls: 0
        };
    },
    getOptionalForRoll = function(playerid,hash){
        if(hash && _.has(state.WrathAndGlory.playerRolls,playerid)){
            return state.WrathAndGlory.playerRolls[playerid].optional;
        }
        return [];
    },

	getOutcomeForRoll = function(playerid,hash){
			return state.WrathAndGlory.playerRolls[playerid].wrathoutcome;
    },

    recordPlayerRollHash = function(playerid, obj){	
        state.WrathAndGlory.playerRolls[playerid]=obj;
    },

    reportBadRerollCounts = function(playerid){
        var player=getObj('player',playerid);
        switch(state.WrathAndGlory.config.reportMode){
            case 'public':
                    sendChat(player.get('displayname'),'/direct '+
                        makeErrorMsg('Attempting to reroll with modified dice counts.')
                    );
                break;
            case 'gm+player':
                if(!playerIsGM(playerid)){
                    sendChat('','/w "'+player.get('displayname')+'" '+
                       makeErrorMsg('Do not adjust the number of dice when rerolling.')
                    );
                }
                /* falls through */
                /* break; // intentional drop thru */

            case 'gm':
                if(playerIsGM(playerid)){
                    sendChat('','/w gm '+
                        makeErrorMsg('Cannot adjust the number of dice in a reroll attempt.')
                    );
                } else {
                    sendChat('','/w gm '+
                        makeErrorMsg(player.get('displayname')+' attempted to reroll with an altered number of dice.')
                    );
                }
                break;

            default:
                break;
        }
    },

    reportBadReroll = function(playerid){
        var player=getObj('player',playerid);
        switch(state.WrathAndGlory.config.reportMode){
            case 'public':
                    sendChat(player.get('displayname'),'/direct '+
                        makeErrorMsg('Cannot reroll old rolls.  Please use the current result'+ch("'")+'s reroll button.')
                    );
                break;
            case 'gm+player':
                if(!playerIsGM(playerid)){
                    sendChat('','/w "'+player.get('displayname')+'" '+
                        makeErrorMsg('Cannot reroll old rolls.  Please use the current result'+ch("'")+'s reroll button.')
                    );
                }
                /* break; // intentional drop thru */
                /* falls through */

            case 'gm':
                if(playerIsGM(playerid)){
                    sendChat('','/w gm '+makeErrorMsg('Cannot reroll old rolls.'));
                } else {
                    sendChat('','/w gm '+makeErrorMsg(player.get('displayname')+' attempted to reroll from an old roll.'));
                }
                break;

            default:
                break;
        }
    },

    reportNotAllowed = function(playerid,ownerid){
        var player=getObj('player',playerid),
            owner=getObj('player',ownerid);
        switch(state.WrathAndGlory.config.reportMode){
            case 'public':
                    sendChat(player.get('displayname'),'/direct '+
                        makeErrorMsg('Cannot reroll '+owner.get('displayname')+ch("'")+'s roll.')
                    );
                break;
            case 'gm+player':
                if(!playerIsGM(playerid)){
                    sendChat('','/w "'+player.get('displayname')+'" '+
                        makeErrorMsg('Cannot reroll '+owner.get('displayname')+ch("'")+'s roll.')
                    );
                }
                /* break; // intentional drop thru */
                /* falls through */

            case 'gm':
                if(playerIsGM(playerid)){
                    sendChat('','/w gm '+
                        makeErrorMsg('Cannot reroll '+owner.get('displayname')+ch("'")+'s roll because <b>GM Can reroll</b> is not enabled.  See '+makeButton('!wag-config','Configuration')+' for details.')
                    );
                } else {
                    sendChat('','/w gm '+makeErrorMsg(player.get('displayname')+' attempted to reroll '+owner.get('displayname')+ch("'")+'s roll.'));
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
            baseDice, // base die: black
            wrathDice, // wrath die: red

            wrathDiceArray,
            baseDiceArray,

            successes=0,
            icons=0,
            exaltedicons=0,
            ruins=0,
            rerolls=0,
            diemod=0, 
            rerolledValues,
			basedmg=0,
			pen=0,
			damage=0,
			rolltype=0, 
			wrathoutcome="", 
			wrathroll=0, 
			
            reroll=false,
            rerollButton,
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

        // pull out the modifier and set to a number            
        _.each(optional,function(a){
            if(a.label=="Modifier"){
                diemod=a.msg*1;
            };
        });
		

		// pull out the Damage and set to a number            
        _.each(optional,function(a){
            if(a.label=="Damage"){
                basedmg=a.msg*1;
            };
        });
		
		// Set rolltype to wrath label as wrath label will be overwritten - added with 3.0      
        _.each(optional,function(a){ 
            if(a.label=="Wrath Die"){ 
                if(a.msg=="Combat") {
					rolltype=1; 
				} else {
					rolltype=0; 
				};
            }; 
        }); 
		
        cmd=args.shift();
        matches=cmd.match(/^(!\S+)\[([^\]]+)\]/);
        if(matches){
            cmd=matches[1];
            hash=parseInt(matches[2],10);
        }

        switch(cmd) {
            case '!wwag':
                w=true;
                /* break; */ // Intentional drop through
                /* falls through */

            case '!wag':
                if( 0 === args.length || _.contains(args,'--help')) {
                    showHelp(msg.playerid);
                    return;
                }

                reroll=!!hash

                if( reroll &&
                    ( _.has(state.WrathAndGlory.playerRolls,msg.playerid) &&
                        ( hash !== state.WrathAndGlory.playerRolls[msg.playerid].hash) )
                ) {
                    owner = _.find(state.WrathAndGlory.playerRolls,function(v){
                        return hash === v.hash;
                    });
                    if(owner){
                        owner=owner.playerid;
                        if(!(playerIsGM(msg.playerid) && state.WrathAndGlory.config.gmCanReroll)){
                            reportNotAllowed(msg.playerid,owner);
                            return;
                        }
                    } else {
                        reportBadReroll(msg.playerid);
                        return;
                    }
                }
                
                owner = owner || msg.playerid;
                
                baseDice=getDiceCounts(msg,rollIndices[0],diemod);  // added diemod to getDiceCounts
                wrathDice=getDiceCounts(msg,rollIndices[1],diemod); // added diemod to getDiceCounts     
				
                if(reroll &&
                    (
                        _.has(state.WrathAndGlory.playerRolls,owner) &&
                        ( hash === state.WrathAndGlory.playerRolls[owner].hash)
                    ) &&
                    !validatePlayerRollHash(owner,hash,
                        getDiceArray(baseDice).length,
                        getDiceArray(wrathDice).length
                    )
                ){
                    reportBadRerollCounts(msg.playerid);
                    return;
                }
                
                rerolledValues=getCountsForRoll(owner,hash);

                successes = rerolledValues.success + (baseDice['4']||0) + (baseDice['5']||0) + (baseDice['6']||0) + (baseDice['6']||0) + (wrathDice['4']||0) + (wrathDice['5']||0) + (wrathDice['6']||0) + (wrathDice['6']||0); 
                icons = rerolledValues.icon + (baseDice['4']||0) + (baseDice['5']||0) + (wrathDice['4']||0) + (wrathDice['5']||0);
                exaltedicons = rerolledValues.exalted + (baseDice['6']||0) + (wrathDice['6']||0);
                ruins = rerolledValues.ruin + (wrathDice['1']||0);
			
                if(reroll){rerolls = rerolledValues.rerolls+1};     // only update if there is a reroll ... should be at 0 when a roll is first made
                if(reroll){wrathoutcome = getOutcomeForRoll(owner,hash)}; // added with 3.0 to determine if you need to reset outcome with reroll

				optional = (optional.length && optional) || getOptionalForRoll(owner,hash);             
                baseDiceArray=_.map(getDiceArray(baseDice),function(v){
                    switch(v){
                        case '4':
                            return symbols.iconsymbol;
                        case '5':
                            return symbols.iconsymbol;
                        case '6':
                            return symbols.exaltedsymbol;
                        default:
                            return v;
                    }
                });

                wrathDiceArray=_.map(getDiceArray(wrathDice),function(v){
                    switch(v){ 
                        case '1':
							wrathoutcome=wrathoutcome+symbols.blackruin;
							wrathroll=v;
                            return symbols.ruinsymbol;
                       case '4':
							wrathoutcome=wrathoutcome+symbols.blackicon;
							wrathroll=v;
                          return symbols.iconsymbol;
                        case '5':
							wrathoutcome=wrathoutcome+symbols.blackicon;
							wrathroll=v;
                          return symbols.iconsymbol;
                        case '6':
							if(rolltype==0) {
								if(playerIsGM(owner)){
									wrathoutcome=wrathoutcome+symbols.blackexalted; //'&nbsp;'+'(Ruin)'
								} else {
									wrathoutcome=wrathoutcome+symbols.blackexalted+'(Glory)';
								}
							} else {
								if(playerIsGM(owner)){
									wrathoutcome=wrathoutcome+symbols.blackexalted+symbols.critical;//+'(Ruin/Critical)'
								} else {
									wrathoutcome=wrathoutcome+symbols.blackexalted+symbols.critical;//+'(Glory/Critical)'
								}								
							}
							wrathroll=v;
							return symbols.exaltedsymbol;
                        default:
							wrathoutcome=""+wrathoutcome;
                            return v;
                    }
                });
				
		
				// record reroll
               hash=(++state.WrathAndGlory.sequence);
               recordPlayerRollHash(owner,{
                   hash: hash,
                   playerid: owner,
				   wrathoutcome: wrathoutcome, 
				   wrathroll: wrathroll, 
                   dice: {
                       baseDice: getRollableDiceCount(baseDiceArray),
                       wrathDice: getRollableDiceCount(wrathDiceArray)
                    },
                    counts: {
                        success: successes,
                        icon: icons,
                        exalted: exaltedicons,
                        ruin: ruins,
                        rerolls: rerolls
                    },
                    optional: optional
                });
				

                rerollButton = (_.reduce([baseDiceArray,wrathDiceArray],function(m,dice){ return m+getRollableDiceCount(dice);},0) ?
                    makeButton(
                        '!'+(w?'w':'')+'wag['+hash+'] '+
                        makeRerollExpression(baseDiceArray)+
                        makeRerollExpression(wrathDiceArray), 
                        '<span style="font-size: 0.5em">Reroll</span>&nbsp;'+symbols.rerollsymbol 
                    ) :
                    ''
                );

                output = makeOutput([  
                        makeLabel( '<span style="font-size: 0.5em">Total</span>&nbsp;&nbsp;&nbsp;'+successes, colors.black, colors.white),
                        makeLabel( symbols.iconsymbol+'&nbsp;&nbsp;&nbsp;'+icons, colors.black, colors.white),      
                        makeLabel( symbols.exaltedsymbol+'&nbsp;&nbsp;&nbsp;'+exaltedicons, colors.black, colors.white),
                        makeLabel( symbols.ruinsymbol+'&nbsp;&nbsp;&nbsp;'+ruins, colors.red, colors.white), 
                        rerollButton
                    ].join(''),
                    [
                        makeOptionalText(optional,damage,successes,wrathoutcome),
                        "<div>",  //needed to prevent the dice to overflow in a nasty way under the floating results div	
                        makeDiceImages(baseDiceArray,colors.black, colors.white),
                        makeDiceImages(wrathDiceArray,colors.red, colors.white),
                        '</div>'
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

            case '!wag-config':
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
        'WrathAndGlory v'+version+
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

                        case 'toggle-gm-can-reroll':
                            state.WrathAndGlory.config.gmCanReroll=!state.WrathAndGlory.config.gmCanReroll;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_GMCanReroll()+
                                '</div>'
                            );
                            break;
                        
                        case 'set-report-mode':
                            if(_.has(reportingModes,opt[0])){
                                state.WrathAndGlory.config.reportMode=opt[0];
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

    WrathAndGlory.CheckInstall();
    WrathAndGlory.RegisterEventHandlers();
});
