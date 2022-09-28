// Github: TBD
// By: Richard Dwarfwing
// Contact: https://app.roll20.net/users/8097845/richard-w
// Based on: MutantYearZero by The Aaron, Arcane Scriptomancer

var AlienRpg = AlienRpg || (function() {
    'use strict';

    var version = '2.00',
        lastUpdate = 1643803200,
        schemaVersion = 1.00,
        symbols = {
            baseblank: 'https://github.com/Roll20/roll20-character-sheets/blob/master/Alien%20Roleplaying%20Game/Images/Base-Between.png?raw=true',
            basesuccess: 'https://github.com/Roll20/roll20-character-sheets/blob/master/Alien%20Roleplaying%20Game/Images/Base-Success.png?raw=true',
            stressblank: 'https://github.com/Roll20/roll20-character-sheets/blob/master/Alien%20Roleplaying%20Game/Images/Stress-Between.png?raw=true',
            stresssuccess: 'https://github.com/Roll20/roll20-character-sheets/blob/master/Alien%20Roleplaying%20Game/Images/Stress-Success.png?raw=true',
            stressfail: 'https://github.com/Roll20/roll20-character-sheets/blob/master/Alien%20Roleplaying%20Game/Images/Stress-Fail.png?raw=true',
            push: '&#'+'10150;'
        },
        ArpgBackground = 'https://s3.amazonaws.com/files.d20.io/images/83147486/YCuEWUzaudOcg2mNHbiFCw/max.png?1559667169',
        colors = {
            transparent: 'transparent',
            background: 'rgba( 259 , 259 , 259 , 0.05 )',
            griditem: 'rgba(259, 259, 259, 0.05)',
            border: '#404040',
            yellow: '#ffe600',
            black: '#1d1d1d',
            white: '#F1F1F1',
            bone: '#F7F5F0',
            burgundy: '#cc4c33',
            red: '#a63e2a'
        },
        counts = ["0", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "10th"],
        defaults = {
            css: {     
                button: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em .4em',
                    'color': 'white'
                },
                errorMsg: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-size': '.8rem',
                    'border': '.2em solid #990000',
                    'border-radius': '1em',
                    'background-color': '#cccccc',
                    'margin': '0 .1em',
                    'padding': '.1em .6em',
                    'overflow': 'hidden'
                },
                errorMsgLabel: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-weight': 'bold',
                    'background-color': '#990000',
                    'color': '#ffffff',
                    'display': 'inline-block',
                    'padding': '.1em .6em',
                    'border-radius': '0 0 .75em 0',
                    'margin': '-.1em .2em 0em -.6em'
                },
                optionalMsg: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-size': '1rem',
                    'color': '#F1F1F1',
                    'border': '.1em solid #404040',
                    'border-radius': '0.5em',
                    'background-color': 'rgba(259, 259, 259, 0.05)',
                    'margin': '0.2em',
                    'padding': '0.2em',
                    'overflow': 'hidden'
                },
                optionalMsgLabel: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-weight': 'bold',
                    'background-color': '#202020',
                    'color': '#F1F1F1',
                    'display': 'inline-block',
                    'padding': '0 .6em .1em .4em',
                    'border-radius': '.5em',
                    'margin': '.1em .4em 0.1em .2em'
                },
                optionalMsgText: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'color': '#F1F1F1',
                    'display': 'inline-block',
                    'padding': '0 .6em .1em .4em',
                    'border-radius': '.5em',
                    'margin': '.1em .4em 0.1em .2em',
                    'height': '20px'
                },
                arpgMsg: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-size': '1rem',
                    'border': '.2em solid #404040',
                    'border-radius': '.5em',
                    'background-color': 'rgb(56, 56, 56)',
                    'background-image': 'url('+ArpgBackground+')',
                    'background-repeat': 'no-repeat',
                    'background-position': 'top',
                    'background-size': 'cover',
                    'margin': '0.2em 0',
                    'padding': '.3em',
                    'overflow': 'hidden',
                    'display':'flex'
                },
                arpgMsgLabelContainer: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'float': 'left',
                    'font-size': '1.5rem',
                    'margin-right': '.4em',
                    'min-width':'85px',
                    'vertical-align':'top',
                    'width':'100%',
                    'display':'flex'
                },
                arpgMsgHeaderContainer: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-weight': 'bold',
                    'font-size': '1rem',
                    'background-color': 'rgba(259, 259, 259, 0.05)',
                    'color': '#f1f1f1',
                    'display': 'inline-block',
                    'padding': '.6em .8em .4em .8em',
                    'border-radius': '.25em',
                    'margin':'-0.4em -0.4em .4em 0em',
                    'float': 'left',
                    'width':'10%'
                },
                arpgMsgLabel: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'border': '.1em solid #404040',
                    'border-radius': '.25em',
                    'font-weight': 'normal',
                    'padding': '.1em',
                    'margin-bottom': '.1em',
                    'text-align': 'center',
                },
                arpgMsgResultContainer: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'float': 'left',
                    'font-size': '1.2rem',
                    'margin-right': '.4em',
                    'min-width':'85px',
                    'vertical-align':'top',
                    'display':'inline-block',
                    'width':'100%',
                    'text-align':'center'
                },
                arpgResultLabel: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'border': '.1em solid #404040',
                    'border-radius': '.25em',
                    'font-weight': 'normal',
                    'padding': '.1em',
                    'margin-bottom': '.1em',
                    'text-align': 'center',
                    'width':'45%',
                    'margin-right':'0',
                    'margin-left':'0.2em',
                    'margin-right':'0.2em',
                    'display':'inline-block'
                },
                arpgResultLabelThird: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'border': '.1em solid #404040',
                    'border-radius': '.25em',
                    'font-weight': 'normal',
                    'padding': '.1em',
                    'margin-bottom': '.1em',
                    'text-align': 'center',
                    'width':'25%',
                    'margin-right':'0',
                    'margin-left':'0.2em',
                    'margin-right':'0.2em',
                    'display':'inline-block'
                },
                arpgMsgPushContainer: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'float': 'left',
                    'font-size': '1.2rem',
                    'margin-right': '.4em',
                    'min-width':'85px',
                    'vertical-align':'top',
                    'display':'inline-block',
                    'width':'100%',
                    'text-align':'center'
                },
                arpgPushLabel: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'border': '.1em solid #404040',
                    'border-radius': '.25em',
                    'font-weight': 'normal',
                    'padding': '.2em',
                    'margin': '.2em .2em .1em .2em',
                    'text-align': 'center',
                    'width':'95%'
                },
                arpgMsgDiceContainer: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'float': 'left',
                    'font-size': '1.5rem',
                    'padding': '.3em',
                    'min-width':'85px',
                    'vertical-align':'top',
                    'width':'100%',
                    'display':'flex'
                },
                arpgDie: {
                    'font-family':'Helvetica, Arial, sans-serif',
                    'font-size':'1.25em',
                    'display': 'inline-block',
                    'text-align': 'center',
                    'width': '1.7em',
                    'height': '1.7em',
                    'float': 'left',
                    'margin-right': '.2em',
                    'margin-bottom': '.2em'
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
        templates.cssProperty = _.template(
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
                    'css: _.defaults(css,defaults.css.arpgPushLabel) }) %>'+
                    ' href="<%= command %>">'+
                    '<%= label||"Button" %></a>'
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
                '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.optionalMsgText}) %>>'+
                    '<%= text %>'+
                '</div>'+
            '</div>'
        );

        templates.die = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.arpgDie)}) %> >'+
                '<%= text %>'+
            '</div>'
        );

        templates.outputLabel = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.arpgMsgLabel)}) %> >'+
                '<%= labelText %>'+
            '</div>'
        );

        templates.outputResult = _.template(
            '<span <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.arpgResultLabel)}) %> >'+
                '<%= resultText %>'+
            '</span>'
        );
        templates.outputResultPush = _.template(
            '<span <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.arpgResultLabelThird)}) %> >'+
                '<%= resultText %>'+
            '</span>'
        );

        templates.output = _.template(
            '<div class="api-alienrpg-message" <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsg}) %> >'+
                // Message header (removed, not used in function call)
                //'<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsgHeaderContainer}) %>>'+
                //    '<%= msgTitle %>'+
                // '</div><br/>'+
                // Container with info about roll, character/player and if available roll name
                '<div class="api-alienrpg-info" <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsgLabelContainer}) %>>'+
                    '<%= info %>'+
                '</div>'+
                // Container with dice images              
                '<div class="api-alienrpg-dice" <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsgDiceContainer}) %>>'+
                    '<%= diceImages %>'+ 
                '</div>'+
                // Results
                '<div class="api-alienrpg-results" <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsgResultContainer}) %>>'+
                    '<%= results %>'+
                '</div>'+
                // Push button
                '<div class="api-alienrpg-pushbutton" <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsgPushContainer}) %>>'+
                    '<%= push %>'+
                '</div>'+
                // Optional text               
                '<div class="api-alienrpg-optional" <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.arpgMsgLabelContainer}) %>>'+
                    '<%= optional %>'+
                '</div>'+
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
            if ((o.label == "" || o.label == null) && (o.msg == null || o.msg == "" || o.msg == "&nbsp;")) 
                { return ""; }
            else 
                { return makeOptionalMsg(o.label,o.msg); }
            //return makeOptionalMsg(o.label,o.msg);
        }).join('')+'</div>';
    },

    makeLabel = function(text, backgroundColor, color){
        if ( text == "") {
            return '';
        } else {
            return templates.outputLabel({
                labelText: text,
                templates: templates,
                defaults: defaults,
                css: {
                    color: color,
                    'background-color': backgroundColor
                }
            });
        }
    },    
    makeResult = function(text, backgroundColor, color, push) {
        if ( text == "") {
            return '';
        } else if ( push === 1 ) {
            return templates.outputResultPush({
                resultText: text,
                templates: templates,
                defaults: defaults,
                css: {
                    color: color,
                    'background-color': backgroundColor
                }
            });
        } else {            
            return templates.outputResult({
                resultText: text,
                templates: templates,
                defaults: defaults,
                css: {
                    color: color,
                    'background-color': backgroundColor
                }
            });
        }
    },
    makeOutput = function (info,diceImages,results,push,optional){
        return templates.output({
            msgTitle: 'Alien RPG roll',
            info: info,
            diceImages: diceImages,
            results: results,
            push: push,
            optional: optional,
            templates: templates,
            defaults: defaults,
            css: {}
        });
    },
    makeButton = function(command, label, backgroundColor, color){
        //log("Making a button. Label: " + label + ", Command: "+command+", Background: "+backgroundColor+", color: "+color);
        var output = templates.button({
            command: command,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {
                color: color,
                'background-color': backgroundColor
            }
        });
        //log(`Button output: ${output}`);
        return output; 
    },
    makePushButton = function(baseDiceArray, stressDiceArray, hash, whisper, rollname, optionalStr, pushes) {
       (_.reduce([baseDiceArray,stressDiceArray],
            function(m,dice){ return m+getRollableDiceCount(dice);},0) ?
            makeButton(
                '!alienr'+(whisper?'w':'')+'['+hash+'] '+
                '['+rollname+' (Push'+(pushes > 0 ? (' '+(1+pushes)) : '')+')]'+
                makeRerollExpression(baseDiceArray,'6',0)+
                makeRerollExpression(stressDiceArray,'6',1)+
                (optionalStr ? optionalStr : ''),
                ' Push (Stress +1) '+symbols.push+'&nbsp;',
                (pushes < 1) ? colors.background : ((pushes > 1) ? colors.burgundy : colors.red),
                colors.white
            ) :
            ''
        ); 
        /*  log(`Rollable Dice Count, base dice : ${getRollableDiceCount(baseDiceArray)}`);
        log(`Rollable Dice Count, stress dice : ${getRollableDiceCount(stressDiceArray)}`);
        var commandStr = '!alienr'+(whisper?'w':'')+ch('[')+hash+ch('] ')+ 
                        (rollname ? (ch('[')+'Push '+(1+pushes)+': '+rollname+ch(']')) : '')+                        
                        makeRerollExpression(baseDiceArray,'6', 0)+
                        makeRerollExpression(stressDiceArray,'6', 1)+
                        (optionalStr ? optionalStr : ''); // (rollname ? '['+rollname+']' : '')+
        var buttonStr = 'Push (Stress '+ch('+')+'1) '+symbols.push;
        var backgroundStr = (pushes < 1) ? colors.background : ((pushes > 1) ? colors.burgundy : colors.red);
        log(`Command: ${commandStr}, Button: ${buttonStr}, Background: ${backgroundStr}`);
        var rerollable = _.reduce([baseDiceArray,stressDiceArray], (m,dice) => { return m+getRollableDiceCount(dice); }, 0 );
        log(`push rerollable : ${rerollable}`);
        return ( rerollable > 0 ? makeButton( commandStr, buttonStr, backgroundStr, colors.white) : '' );
        */
    },
    makeResultLabels = function(successes, panic, push) {
        if ( push > 0) {
            return [
                makeResult( 'Success: <br />'+successes+' ', colors.background, colors.bone, 1),
                makeResult( 'Panic:  <br />'+panic+' ', colors.background, colors.bone, 1),
                makeResult( 'Stress:  <br />+'+push+' ', colors.background, colors.bone, 1),
            ].join('');
        } else {
            return [
                makeResult( 'Success: '+successes+' ', colors.background, colors.bone, 0),
                makeResult( 'Panic:  '+panic+' ', colors.background, colors.bone, 0),
            ].join('');
        }

    },

    checkInstall = function() {
        log('-=> Alien Rpg Dice Roller v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'AlienRpg') || state.AlienRpg.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.AlienRpg && state.AlienRpg.version) {
                // Examples of upgrade cases from different version of script (Mutant Year Zero)
                /*
                case 0.0.1:
                    state.AlienRpg.config = {
                        reportMode: 'public'
                    };
                    // break; // intentional drop through 
                    // falls through 

                case 0.2:
                    state.AlienRpg.playerRolls={};
                    state.AlienRpg.sequence=0;
                    // break; // intentional drop through 
                    // falls through 

                case 0.3:
                    state.AlienRpg.config.gmCanPush=false;
                    // break; // intentional drop through 
                    // falls through 

                case 'UpdateSchemaVersion':
                    state.AlienRpg.version = schemaVersion;
                    break;
                */

                default:
                    state.AlienRpg = {
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
			' ' : 'nbsp',
            '+' : 'plus'
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
            state.AlienRpg.config.gmCanPush,
            '!alienr-config --toggle-gm-can-push',
            '<b>GM Can Push</b> determines if the GM is allowed to push a player'+ch("'")+' roll.'
        );
    },

    getConfigOption_ErrorReporting = function() {
        return makeConfigOptionSelection(
            state.AlienRpg.config.reportMode,
            reportingModes,
            '!alienr-config --set-report-mode',
            '<b>Report Mode</b> determines when and how invalid push attempts are reported.'
        );
    },

    getAllConfigOptions = function() {
        return getConfigOption_GMCanPush() + getConfigOption_ErrorReporting();
    },

    showHelp = function(playerid) {
        let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');

        sendChat('','/w "'+who+'" '+
        '<div style="border: 1px solid black; background-color: rgba(204, 217, 207, 1); padding: 3px 3px; color: rgba(0, 139, 139, 1);">'+
            '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%; background-color: black; padding: 4px;">'+
                'Alien RPG Dice Roller v'+version+
            '</div>'+
            '<div style="padding-left:10px;margin-bottom:3px;">'+
                '<p>AlienR script automates the rolling of Base and Stress dice using Alien RPG dice mechanics.</p>'+
            '</div>'+
            '<b>Commands</b>'+
            '<div style="padding-left:10px;">'+
                '<div style="padding-left: 0;padding-right:20px; font-family: Courier new,sans-serif;"><b>'+
                '!alienr</b></div>'+
                '<div style="padding-left: 10px;padding-right:20px;">Performs an Alien RPG Roll.</div>'+
                '<pre style="white-space:normal;word-break:normal;word-wrap:normal;"><b><span style="font-family: Courier new, monospace;">'+
                '!alienr '+ch('<')+ch('[')+'Roll name'+ch(']')+ch('>')+' '+ch('[')+ch('[')+'Base Dice'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'Stress Dice'+ch(']')+ch(']')+' '+ch('<')+'--Label'+ch('|')+'Message'+ch('>')+' ...'+ch('>')+'</span></b></pre>'+
                '<div style="padding-left: 10px;padding-right:20px">'+
                    '<ul>'+
                        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc; color: rgba(0, 139, 139, 1);">'+
                            '<b><span style="font-family: Courier new, monospace;"> Roll name</span></b> <br /> An optional name for the roll, which can be omitted leading to the field not appearing in the script output. Example: '+ch('[')+'Ranged combat'+ch(']')+' or '+ch('[')+'Smart gun fire'+ch(']')+
                        '</li> '+
                        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc; color: rgba(0, 139, 139, 1);">'+
                            '<b><span style="font-family: Courier new, monospace;">Base Dice</span></b> <br /> An inline dice expression rolling the d6s. 6s are counted as a success (crosshair symbol). Example: '+ch('[')+ch('[')+'4d6'+ch(']')+ch(']')+
                        '</li> '+
                        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc; color: rgba(0, 139, 139, 1);">'+
                            '<b><span style="font-family: Courier new, monospace;">Stress Dice</span></b> <br /> An inline dice expression rolling the d6s. 6s are counted as a success (crosshair symbol). 1s on stress dice are counted as Panic (Alien facehugger symbol). Example: '+ch('[')+ch('[')+'2d6'+ch(']')+ch(']')+
                        '</li> '+
                        '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc; color: rgba(0, 139, 139, 1);">'+
                            '<b><span style="font-family: Courier new, monospace;">--Label'+ch('|')+'Message ...</span></b> <br /> An optional set of text with a label and a message (or key and value if you like) to be shown below the dice roll. Label may be omitted to just provide a text field, e.g. " --|This is my message". You can specify as many optional fields as you like, separated by space.'+
                        
                        '</li> '+
                    '</ul>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
                        '<p>Example:</p>'+        
                        '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                            '!alienr '+ch('[')+'Heavy Machinery'+ch(']')+' '+ch('[')+ch('[')+'5d6'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'3d6'+ch(']')+ch(']')+' --Player|Ellen Ripley --Talent|Spaceship Machanic'+
                        '</pre>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div style="padding-left:10px;">'+
                '<div style="padding-left: 0;padding-right:20px; font-family: Courier new,sans-serif;"><b>'+
                '!alienrw</b></div>'+
                '<div style="padding-left: 10px;padding-right:20px;">Performs a whispered Alien RPG Roll.</div>'+
                '<pre style="white-space:normal;word-break:normal;word-wrap:normal;"><b><span style="font-family: Courier new, monospace;">'+
                '!alienrw '+ch('<')+ch('[')+'Roll name'+ch(']')+ch('>')+' '+ch('[')+ch('[')+'Base Dice'+ch(']')+ch(']')+' '+ch('[')+ch('[')+'Stress Dice'+ch(']')+ch(']')+'</span></b></pre>'+
                '<div style="padding-left: 10px;padding-right:20px">'+
                    '<p>Identical to <span style="font-family: Courier new, sans-serif;">!alienr</span> except that the results are whispered to the player rolling and the GM.</p>'+
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
        var rolls = {'1':0,'2':0,'3':0,'4':0,'5':0,'6':0};
        //log("Pre roll dice count"+ JSON.stringify(rolls));
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
        //log("Post roll dice count"+ JSON.stringify(rolls));
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
    makePushedDiceImages = function(dice,face,bgcolor,color) {
        bgcolor=bgcolor||'black';
        color=color||'white';
        return _.map(_.range(dice),function(r){
            return templates.die({
                text: face,
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
        return _.filter(dice,function(v){return (v+'').match(/^\<img class=\"blank\"/);}).length; // <img class="blank"
        // return _.filter(dice,function(v){return (v+'').match(/^\d+$/);}).length; 
    },
    makeRerollExpression = function(dice,sides,mod){
        var cnt = getRollableDiceCount(dice)+(mod||0);
        return ' '+ch('[')+ch('[')+cnt+'d'+sides+ch(']')+ch(']')+' ';
        //return ' [['+cnt+'d'+sides+']] ';
    }, 

    validatePlayerRollHash = function(playerid, hash, base, stress){
        var obj=state.AlienRpg.playerRolls[playerid];
        return (obj && obj.hash === hash &&
            obj.dice.baseDice === base &&
            obj.dice.stressDice === stress   // Plus 1 because pushing increases stress by one.
        );
    },
    getCountsForRoll = function(playerid,hash){
        if(hash && _.has(state.AlienRpg.playerRolls,playerid)){
            return state.AlienRpg.playerRolls[playerid].counts;
        }
        return {
            success: 0,
            panic: 0,
            pushes: 0,
            basesuccesses: 0,
            stresssuccesses: 0,
            stressfails: 0
        };
    },
    getOptionalForRoll = function(playerid,hash){
        if(hash && _.has(state.AlienRpg.playerRolls,playerid)){
            return state.AlienRpg.playerRolls[playerid].optional;
        }
        return [];
    },

    recordPlayerRollHash = function(playerid, obj){
        state.AlienRpg.playerRolls[playerid]=obj;
    },

    reportBadPushCounts = function(playerid){
        var player=getObj('player',playerid);
        switch(state.AlienRpg.config.reportMode){
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
        switch(state.AlienRpg.config.reportMode){
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
        switch(state.AlienRpg.config.reportMode){
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
                        makeErrorMsg('Cannot Push '+owner.get('displayname')+ch("'")+'s roll because <b>GM Can Push</b> is not enabled.  See '+makeButton('!alienr-config','Configuration')+' for details.')
                    );
                } else {
                    sendChat('','/w gm '+makeErrorMsg(player.get('displayname')+' attempted to Push '+owner.get('displayname')+ch("'")+'s roll.'));
                }
                break;

            default:
                break;
        }
    },
    getCharacter = function getCharacter(nameOrId) {
        var character = null;
        // By character ID
        character = getObj('character', nameOrId);
        if (character) { return character; }    
        // From Token
        var token = getObj('graphic', nameOrId);
        if (token) {
          character = getObj('character', token.get('represents'));
          if (character) { return character; }
        }    
        // By character name
        var list = findObjs({
          _type: 'character',
          name: nameOrId
        });
        if (list.length === 1) { return list[0]; }
    
        // Default to null
        return null;
    },
    getCharacterAttribute = function getCharacterAttribute(cid, att) {
        //! getCharacterAttribute
        var attr = findObjs({
            type: 'attribute',
            characterid: cid,
            name: att
        })[0];
        if (attr) {
            return attr.get('current');
        }
        return '';
    },
    setCharacterAttribute = function setCharacterAttribute(charId, attrName, val) {
        //! setCharacterAttribute
        var attr = findObjs({
            type: 'attribute',
            characterid: charId,
            name: attrName
        })[0];
        if (typeof attr === 'undefined' || attr == null) {
            var _attr = createObj('attribute', { name: attrName, characterid: charId, current: parseFloat(val) }); // eslint-disable-line no-unused-vars, no-undef, no-shadow
        } else {
            attr.setWithWorker({
            current: parseFloat(val)
            }); // .set()
        }
    },    
    updateCharacterStress = function(name,count=1) {
        let character = getCharacter(name);
        if (character == null) {
            log('Character does not exist, stress cannot be updated!');
            return;
          }
        let charId = character.get("_id");
        // Test if character exists, if not then break operation with exception
        /* if (charId == null) {
            throw new ParseException('Character does not exist, stress cannot be updated!');
          } */
        //char = (findObjs({_type: 'character', name: name}))[0] || ""; 
        //const charId = char.get("_id"); 
        //log("Character Id: "+ charId);
        let attrStressCheckboxes = Array(10).fill().map((_, index) => `stress_${index +1}`);
        //const attributeStrs = ["stress"].concat(variableAttributeChecks);
        let stress_x = 0;
        _.find(attrStressCheckboxes, (attr) => {
            //log(`Checking attribute ${attr}`);
            //attributeObj.push( findObjs({_type: "attribute", name: attr, _characterid: charId}) );
            //attributeObj = findObjs({_type: "attribute", name: attr, _characterid: charId})[0];
            //strength = findObjs({ type: 'attribute', characterid: character.id, name: 'strength' })[0]; // example
            //var char_stress_x = getAttrByName(charId, attr);
            stress_x = parseInt( getCharacterAttribute(charId, attr), 0);
            //log("Stress value: "+stress_x);
            //log("Object collected is : "+JSON.stringify(attributeObj));
            //attributeVal = parseInt( stress_x, 0 );
            //log("Attribute current value is : "+attributeVal);
            //attributeVal = parseInt( attributeObj.get("current") || 0 );
            //log("Object current value is : "+attributeVal);
            if ( stress_x !== 1 ) {
                //attributeObj.set("current", 1);
                setCharacterAttribute(charId,attr,1);
                // log("Attribute "+attr+" set to 1");
                return true;
            } else return false;
            /* if ( parseInt(attributeObj.get("current")) === 0 ) {
                log("Stress "+attr+" is 0");
            } else if ( parseInt(attributeObj.get("current")) === 1 ) {
                log("Stress "+attr+" is 0");
            } else {
                log("Stress "+attr+" is "+parseInt(attributeObj.get("current")));
            } */
        });
        //attributeObj = findObjs({_type: "attribute", name: "stress", _characterid: char.get("_id")});
        //var char_stress = getAttrByName(char.get("_id"), "stress")[0];
        let stressVal = getCharacterAttribute(charId, "stress");
        //let newval = parseInt( (attributeObj[0]).get("current") )+count;
        let newVal = parseInt(stressVal+count);
        setCharacterAttribute(charId, "stress", newVal);
        //attributeObj[0].set("current", newval);
        //log("Character stress 1: "+ JSON.stringify(attributeObj[0].get("current")));
        //log("Character stress_1: "+ JSON.stringify(attributeObj[1].get("current")));
        //attributeObj = findObjs({_type: "attribute", name: "stress", _characterid: char.get("_id")});
        let char_stress = getAttrByName(charId, "stress");
        log("Character stress after push: "+ char_stress);
    },


    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args,
            optionalStr, // Original optional string for passing on to push
            optional, // Object to hold itemized optional items
            who,

            rollIndices=[],
            baseDice = {'1':0,'2':0,'3':0,'4':0,'5':0,'6':0}, // base dice: black, success on 6
            stressDice = {'1':0,'2':0,'3':0,'4':0,'5':0,'6':0}, // stress dice: yellow, success on 6, panic on 1
            rollname, // The roll name will be displayed under teh roller and above the dice
            roller=msg.who, // The original character/player who rolled
            runas, // Impersonation

            baseDiceArray,
            stressDiceArray,
            pushedBaseSuccessArray,
            pushedStressSuccessArray,
            pushedStressFailArray,

            successes=0,
            panic=0,
            basesuccesses=0,
            stresssuccesses=0,
            stressfails=0,
            pushedValues,
            pushes=0,
            pushingValues,
            pushButton,

            push=false,
            whisper=false,
            cmd,
            hash,
            matches,
            owner,
            output;

        if (msg.type !== "api") {
            return;
        }
        //log("Dice roll message: "+JSON.stringify(msg));

		if(_.has(msg,'inlinerolls')){
            //var myRegexp = /(?!sides:([0-9]+))/g;
            //log('rolls: '+JSON.stringify(msg.inlinerolls.length));
            //log('Inline roll 1: '+JSON.stringify(msg.inlinerolls[0]));
            //log('Inline roll 1 sides: '+JSON.stringify(msg.inlinerolls[0].sides));
            //log('Inline roll 2 sides: '+JSON.stringify(msg.inlinerolls[1].match(/sides:(d+)/g)));
            //rollIndices=_.map(msg.content.match(/\$\[\[(\d+)\]\]/g),function(i){
            rollIndices=_.map(msg.inlinerolls,function(v,k){
                //var j = i.match(/\d+/)[0],
                //l = i.inlinerolls[j].sides+'';
                var diceRegexp = /([0-9]+)(d)([0-9]+)/g;
                //log('Inline roll v expr: '+v.expression); 
                var match = diceRegexp.exec(v.expression);            
                //log('Inline roll rolls: '+match);
                var diceCount = match ? match[1] : 0;
                var sides = match ? match[3] : 6;
                var results = JSON.stringify(v.results.rolls.results);
                //log('Inline roll k: '+k);               
                //log('Inline roll match: '+match);
                //log('Inline roll rgxp1: '+(v.expression).match(diceRegexp)[1]);
                //log('Inline roll rgxp2: '+(v.expression).match(diceRegexp)[3]);
                //log('Inline roll v tot: '+v.results.total);
                //log('Inline roll rolls: '+diceCount);
                //log('Inline roll v results: '+JSON.stringify(v.results.rolls.results));
                //log('Inline roll sides: '+sides);
                //log('Inline roll v json: '+JSON.stringify(v));
                //log('Inline roll sides: '+JSON.stringify(sides));
                //log('Inline roll dice count: '+diceCount);
                //log('Inline roll 1v1: '+JSON.stringify((v.match(/sides:([0-9]+)/g))[1]));                
                return {
                    id: k,
                    rolls: diceCount,
                    results: results,
                    sides: sides
                }
            });
            //log("RollIndices: "+JSON.stringify(rollIndices));
            //log("RollIndices1: "+JSON.stringify(rollIndices[0].id));
            //log("RollIndices2: "+JSON.stringify(rollIndices[1].id));
            //log("RollIndices3: "+JSON.stringify(rollIndices[2].id));
            //log("RollIndices4: "+JSON.stringify(rollIndices[3].id));
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
            //log('Roll indices: '+JSON.stringify(rollIndices));
        let whoami=(getObj('player',msg.playerid));
        //log("Who am i: "+JSON.stringify(whoami));
        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        // Getting the optional items from command
        // First, get the optionals as a string for reuse
        optionalStr = msg.content.match(/(--.*)*$/).shift();
            //log("Optional string (original): "+ JSON.stringify(optionalStr));
        // Then, break the optionals up in a key-value structure
        optional = msg.content.split(/\s+--/);
        //log('Getting Optional: '+JSON.stringify(optional));
        args = optional.shift().split(/\s+/);
        optional = _.map(optional,function(o){
            var s=o.split(/\|/),
                k=s.shift();
                s=s.join('|');
                if ( k === "runas" ) { runas = s; }
                if ( s === "" ) { s = "&nbsp;"; }
                return {
                    label: k,
                    msg: s
                };
        });
        //log('Getting Optional: '+JSON.stringify(optional));

        // Using --runas optional will provide a way to display another name at the top of output (added to variable runas above)
        // This will remove the runas information from the optional info since it will be shown at top instead
        // Underscore omit method has been replaced due to it returning an object while we want to retain an array of objects
        //var optional = _.omit(optional, function(value, key, optional) {
        //    return JSON.stringify(value).startsWith('{\"label\":\"runas\"'); });
        // Iterate backwards over the optional array, and splice out item with runas label
        for ( let i = optional.length-1; i >= 0; i-- ) {
            if ( (JSON.stringify(optional[i])).includes("\"label\":\"runas\"") ) { optional.splice(i, 1); }
        }

        //log('Getting Optional w/o runas: '+JSON.stringify(optional));        
        // In case of Runas impersonation, i.e. when running command to be listed as someone else. Will be used in character sheet. 
        roller = runas ? runas : roller;  
        

        cmd=args.shift();
        matches=cmd.match(/^(!\S+)\[([^\]]+)\]/);
            //matches=cmd.match(/^(!\S+)(.*)\[([^\]]+)\]/);
            //log("Regex matches: "+ JSON.stringify(rollname));
        rollname=msg.content.split(/^(\!alienrw?(\[\d+\])?)(\s+)\[(.*)\]/);
            //log("Regex rollname: "+ JSON.stringify(rollname));
            //log("Regex rollname length: "+ JSON.stringify(rollname.length));
        rollname = !rollname ? "Roll" : (!rollname[rollname.length-2] ? "Roll" : rollname[rollname.length-2]);
            //log("Getting rollname: "+ rollname);
            //log('Matches: '+JSON.stringify(matches));
        
        if(matches){
            cmd=matches[1];
            //log("Getting cmd: "+cmd);
            hash=parseInt(matches[2],10);
            //log("Getting hash: "+hash);
        }

        
            //log('Hash: '+hash);

        switch(cmd) {
            case '!alienrw':
                whisper=true;
                /* break; */ // Intentional drop through
                /* falls through */

            case '!alienr':
                if( 0 === args.length || _.contains(args,'--help')) {
                    showHelp(msg.playerid);
                    return;
                }

                push=!!hash;
                    //log('Push: '+push);
                if( push &&
                    ( _.has(state.AlienRpg.playerRolls,msg.playerid) &&
                        ( hash !== state.AlienRpg.playerRolls[msg.playerid].hash) ) )
                    {
                    owner = _.find(state.AlienRpg.playerRolls,function(v){
                        return hash === v.hash;
                    });
                    if(owner){
                        owner=owner.playerid;
                        if(!(playerIsGM(msg.playerid) && state.AlienRpg.config.gmCanPush)){
                            reportNotAllowed(msg.playerid,owner);
                            return;
                        }
                    } else {
                        reportBadPush(msg.playerid);
                        return;
                    }
                }

                owner = owner || msg.playerid;

                
                _.each(rollIndices,function(v,k,l){
                    switch(v.id) {
                        case 0: 
                            baseDice=getDiceCounts(msg,v.id); 
                            break; //
                        case 1: 
                            stressDice=getDiceCounts(msg,v.id);  
                            break; //
                        default: 
                            //log("Unsupported dice format ("+v.sides+")."); 
                            break;
                    }

                });
                
                if(push &&
                    (
                        _.has(state.AlienRpg.playerRolls,owner) &&
                        ( hash === state.AlienRpg.playerRolls[owner].hash)
                        ) &&
                        !validatePlayerRollHash(owner,hash,
                            getDiceArray(baseDice).length,
                            getDiceArray(stressDice).length-1
                        )
                    ){
                        reportBadPushCounts(msg.playerid);
                        return;
                }
                if(push && runas) {
                    updateCharacterStress(runas,1);
                }
                pushedValues=getCountsForRoll(owner,hash);
                    //log("Pushed values : "+ JSON.stringify(pushedValues));
                    //log("Pushed value panic : "+ JSON.stringify(pushedValues.panic));
                    //log("Pushed value pushes: "+ JSON.stringify(pushedValues.pushes));

                    //log("Stress dice : "+ JSON.stringify(stressDice));
                    //log("Base dice : "+ JSON.stringify(baseDice));

                // Push will add additional stress, increasing the stress die by one.

                successes=pushedValues.success + (baseDice['6']||0) + (stressDice['6']||0);
                panic=pushedValues.panic + (stressDice['1']||0);
                pushes=pushedValues.pushes||0; 
                basesuccesses=pushedValues.basesuccesses||0;
                stresssuccesses=pushedValues.stresssuccesses||0;
                stressfails=pushedValues.stressfails||0;

                optional = (optional.length && optional) || getOptionalForRoll(owner,hash);

                baseDiceArray=_.map(getDiceArray(baseDice),function(v){
                    switch(v){
                        case '6':
                            basesuccesses++; 
                            return '<img class="success" src="'+symbols.basesuccess+'" />';
                        default:
                            return '<img class="blank" src="'+symbols.baseblank+'" />';
                            //return v; // For returning the value and showing the dice face value, i.e 1, 2, 3, 4, 5
                    }
                });
                pushedBaseSuccessArray = _.map(new Array(pushedValues.basesuccesses), (v) => {
                    return '<img class="success" style="opacity: 0.6;" src="'+symbols.basesuccess+'" />';
                });
                stressDiceArray=_.map(getDiceArray(stressDice),function(v){
                    switch(v){
                        case '1':
                            stressfails++;
                            return '<img class="panic" src="'+symbols.stressfail+'" />';
                        case '6':
                            stresssuccesses++; 
                            return '<img class="success" src="'+symbols.stresssuccess+'" />';
                        default:
                            return '<img class="blank" src="'+symbols.stressblank+'" />';
                            //return v; // For returning the value and showing the dice face value, i.e 2, 3, 4, 5
                    }
                });
                pushedStressSuccessArray = _.map(new Array(pushedValues.stresssuccesses), (v) => {
                    return '<img class="success" style="opacity: 0.8;" src="'+symbols.stresssuccess+'" />';
                });
                pushedStressFailArray = _.map(new Array(pushedValues.stressfails), (v) => {
                    return '<img class="success" style="opacity: 0.8;" src="'+symbols.stressfail+'" />';
                });

               // record push data
               hash=(++state.AlienRpg.sequence);
               pushingValues= {
                        hash: hash,
                        playerid: owner,
                        dice: {
                            baseDice: getRollableDiceCount(baseDiceArray),
                            stressDice: getRollableDiceCount(stressDiceArray)
                        },
                        counts: {
                            success: successes,
                            panic: panic,
                            pushes: (pushes+1),
                            basesuccesses: basesuccesses,
                            stresssuccesses: stresssuccesses,
                            stressfails: stressfails
                        },
                        optional: optional
                    };
                //log("Pushing values: "+ JSON.stringify(pushingValues));
                recordPlayerRollHash(owner,pushingValues);
                
                /* */             
                pushButton = (_.reduce([baseDiceArray,stressDiceArray],
                    function(m,dice){ return m+getRollableDiceCount(dice);},0) ?
                    makeButton(
                        '!alienr'+(whisper?'w':'')+'['+hash+'] '+
                        '['+rollname+']'+
                        makeRerollExpression(baseDiceArray,'6',0)+
                        makeRerollExpression(stressDiceArray,'6',1)+
                        (optionalStr ? optionalStr : ''),
                        ' Push (Stress +1) '+symbols.push+'&nbsp;',
                        (pushes < 1) ? colors.background : ((pushes > 1) ? colors.burgundy : colors.red),
                        colors.white
                    ) :
                    ''
                );
                

                // Starting point to build the output, each function using one or more templates to format the output

                output = makeOutput([
                        makeLabel(roller, colors.background, colors.white),
                        makeLabel( (pushes > 0 ? ( pushes > 1 ? `${counts[pushes]} Push: ` : "Push: ") : "")+rollname, colors.background, colors.white),
                    ].join(''),
                    [
                        makeDiceImages(pushedBaseSuccessArray,colors.transparent,colors.white),
                        makeDiceImages(baseDiceArray,colors.transparent, colors.white),
                        makeDiceImages(pushedStressSuccessArray,colors.transparent,colors.black),
                        makeDiceImages(pushedStressFailArray,colors.transparent,colors.black),
                        makeDiceImages(stressDiceArray,colors.transparent, colors.black),
                    ].join(''),
                    [
                        //makeResultLabels(successes, panic, pushedValues.pushes), 
                        makeResult( 'Success: '+successes+' ', colors.background, colors.bone),
                        makeResult( 'Panic:  '+panic+' ', colors.background, colors.bone),
                    ].join(''),
                    [
                        pushButton,
                        //makePushButton(baseDiceArray,stressDiceArray, hash, whisper, rollname, optionalStr, pushes),
                    ].join(''),
                    [
                        makeOptionalText(optional)
                    ].join('')
                );
                //log(`Full output : ${output}`);

                // Based on the chat settings, send chat message whispered or not 
                who=getObj('player',owner).get('displayname');
                if(whisper){
                    sendChat(msg.who, '/w gm '+output);
                    if(!playerIsGM(owner)){
                        sendChat(who, '/w "'+who+'" '+output);
                    }
                } else {
                    sendChat(who, '/direct '+output);
                }

                break;

            // Display only the configuration part, without including the help section
            case '!alienr-config':
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
                    '<div style="border: 1px solid black; background-color: rgba(204, 217, 207, 1); padding: 3px 3px; color: rgba(0, 139, 139, 1);">'+
                        '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%; background-color: black; padding: 4px;">'+
                            'AlienRpg v'+version+
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
                            state.AlienRpg.config.gmCanPush=!state.AlienRpg.config.gmCanPush;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_GMCanPush()+
                                '</div>'
                            );
                            break;
                        
                        case 'set-report-mode':
                            if(_.has(reportingModes,opt[0])){
                                state.AlienRpg.config.reportMode=opt[0];
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

    AlienRpg.CheckInstall();
    AlienRpg.RegisterEventHandlers();
});
