/*
Customizable Roll Listener:
Proto-syntax: !crl \\create,name=Listener Name,text=text to recognize,[template=all roll templates to consider separated by at least one space],[roll=crit/fumble/success] \\Command 1 to execute \\Command 2 to execute \\etc.
*/

var CRL = CRL || (function() {
    'use strict';

    var version = '1.0',
        lastUpdate = 1479414474,
        schemaVersion = 1.0,
        defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    //'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em .1em',
                    'color': 'white'
                }
            }
        },
        templates = {},
        addImage = "https://s3.amazonaws.com/files.d20.io/images/25125216/T5Khlsmk3yp_S9DVWCGbog/original.png",
        deleteImage = "https://s3.amazonaws.com/files.d20.io/images/25125727/M2DhnihuhfrtINL3FYqVAQ/original.png",
        helpLink,
        
    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
            //' ' : '&'+'nbsp'+';',
            '&' : '&'+'amp'+';',
            '<' : '&'+'lt'+';',
            '>' : '&'+'gt'+';',
            "'" : '&'+'#39'+';',
            '@' : '&'+'#64'+';',
            //'{' : '&'+'#123'+';',
            '|' : '&'+'#124'+';',
            '}' : '&'+'#125'+';',
            ',' : '&'+'#44'+';',
            '[' : '&'+'#91'+';',
            ']' : '&'+'#93'+';',
            '"' : '&'+'quot'+';',
            ':' : '&'+'#58'+';',
            '\n': '<br>'
            //'-' : '&'+'mdash'+';'
        },
        re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),
    
    checkInstall = function() {    
        log('-=> Customizable Roll Listener v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'CRL') || state.CRL.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.CRL = {
    			version: schemaVersion
			};
		}
		if(!state.CRL.help || !getObj('character',state.CRL.help)){
		    if(findObjs({type:'character',name:'Customizable Roll Listener'})[0]){
		        state.CRL.help = findObjs({type:'character',name:'Customizable Roll Listener'})[0].id;
		    }else{
		        state.CRL.help = createObj('character',{
		            name:'Customizable Roll Listener',
		            archived:true
		        }).id;
		    }
		}
		state.CRL.listen = state.CRL.listen || 'on';
		generateHelp();
		log('  > Help Character Verified<');
		buildTemplates();
		helpLink = 'https://journal.roll20.net/character/'+state.CRL.help;
	},
	
	outputConfig = function(menu){
	    var listenButton,listenToggle,commandButton,rollButton,textButton,templateButton,addButton,deleteButton,text,template,roll,
        output = '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">',
        ability = findObjs({type:'ability',characterid:state.CRL.help,name:menu})[0],
        conditions;
        if(ability){
            try{
                conditions = JSON.parse(ability.get('description'));
                if(conditions){
                    if(conditions.txt){
                        text = conditions.txt.join(' && ').replace('\\$\\[\\[\\d\\]\\]','##');
                    }
                    if(conditions.templates){
                        template = conditions.templates.join(', ');
                    }
                    if(conditions.roll){
                        roll = conditions.roll.join(', ');
                    }
                }
            }catch(err){
                log('error detected, environ not crashed');
            }
            if(conditions){
                output += version+' CRL<br><b> '+ability.get('name')+' Settings</b></div><div style="padding-left:10px;margin-bottom:3px;"><br>';
                textButton = makeButton('!crl \\\\edit,name='+ability.get('name')+',text=?{Enter the Text this Listener should look for. Separate discrete text blocks with double ampersands and indicate the location of the inline roll in the block with double hashtags|}',
                    text || 'No Text Filtering','transparent','black');
                templateButton = makeButton('!crl \\\\edit,name='+ability.get('name')+',template=?{Enter all the roll templates this listener should respond to, separted by a space|}',
                    template || 'No Template Filtering','transparent','black');
                rollButton = makeButton('!crl \\\\edit,name='+ability.get('name')+',roll=?{Enter all the roll results this listener should look for separated by a space.|}',
                    roll || 'No Roll Result Filtering','transparent','black');
                commandButton = makeButton('!crl \\\\edit,name='+ability.get('name')+' ?{Enter command lines theis listener should execute when parameters are met. Start each command line with a double backslash|}',
                    HE(ability.get('action')) || 'No Commands Entered Yet','transparent','black');
                output += 'This Roll Listener will look for this text:<br><br>'+textButton+'<br><br>In these templates:<br><br>'+templateButton+'<br><br>'
                    +'With these roll results:<br><br>'+rollButton+'<br><br>And will execute these commands:<br><br>'+commandButton+'<br><br>';
            }else{
                return;
            }
        }else{
            output += version+' CRL<br><b> Options</b></div><div style="padding-left:10px;margin-bottom:3px;"><br>';
            //Toggle on/off
            if(state.CRL.listen === 'on'){
                listenToggle = makeButton('!crl \\\\set,listen=off',
                    'ON','green','white');
            }else if(state.CRL.listen === 'off'){
                listenToggle = makeButton('!crl \\\\set,listen=on',
                    'OFF','#D3D3D3','white');
            }
            output += '<b>Roll listening is: </b><div style="float:right;">'+listenToggle+'</div><br><br>Current Roll Listeners:<br><br>';
            //List of Roll Listeners
            _.each(findObjs({type:'ability',characterid:state.CRL.help}),(a)=>{
                listenButton = makeButton('!crl \\\\config,menu='+a.get('name'),
                    a.get('name'),'transparent','black');
                deleteButton = makeImageButton('!crl \\\\delete,name='+a.get('name'),
                    deleteImage,'Delete Listener: '+a.get('name'),'transparent');
                output += listenButton+'<div style="float:right;">'+deleteButton+'</div><br><br>';
            });
            addButton = makeImageButton('!crl \\\\create,name=?{Name the Roll Listener; must be unique among Roll Listeners|}',
                addImage,'Create New Listener','transparent');
            output += '<div style="float:right;">'+addButton+'</div><br><br>';
        }
        //ends the first div
        output += '</div>';
        sendChat('',output);
	},
	
	setPref = function(listen){
	    state.CRL.listen = listen;
	    outputConfig();
	},
	
	generateHelp = function(){
        var help = getObj('character',state.CRL.help),
        playerHelp = '<div style="border: 2px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="border-bottom: 4px solid black;">'
            +'<div style="font-weight: bold;font-size: 130%;">'
            +' Customizable Roll Listening'+version
            +'</div>'
            +'The CRL listens for user defined patterns in chat consisting of what roll template was sent (if any), what the text was (including inline rolls), and what the results of those rolls were (critical,fumble,success,failure). The script expects only a single inline roll in any provided text. Each roll listener is stored as an ability on the attributes & abilities tab of this character.'
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;font-weight: bold;font-size: 110%">'
            +'Basic Syntax'
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'All CRL commands use the same basic syntax. The contents of a command will change based on what you are doing, but the basic format will always look like this:'
            +'<ul><li style=>'
            +'<b><span style="font-family: serif;">!crl \\\\action,name=name of the listener, [specific properties of the listener] \\\\command 1 \\\\command 2 \\\\etc.</span></b> '
            +'<ul>'
            +'&'+'#8226'+'; Action keywords are preceded by a space followed by a double backslash " \\\\". The action keywords are: create,edit, delete, and config.<br>'
            +'&'+'#8226'+'; Action keywords and settings/options are separted by a comma. The option keywords will be described below in their associated action keyword section.<br>'
            +'&'+'#8226'+'; Commands to be executed by the listener can be chained together by making a second (third, fourth, etc) command group. Each command will be placed on a new line in the created listener ability on the CRL character.'
            +'</ul>'
            +'</li></div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<div style="font-weight: bold;font-size: 110%">'
            +'Action Keywords'
            +'</div>'
            +'Commands are shown with all possible settings. If a setting is optional, it will be enclosed in brackets. If only one of a series of settings will '
            +'be accepted, they are separated by a slash "/". The order of options does not matter as long as the action keyword begins the first action group and the command(s) to execute are the following groups.'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<ul><li style="border-top: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">\\\\create/edit,name=Listener Name,[template=Template Name],[text=What text to match including up to a single inline roll],[roll=critical/fumble/success/fail] [\\\\Command line 1 \\\\Command line 2 \\\\etc...]</span></b><br> '
            +'Creates/edits a listener. Editing a listener will overwrite the current values of whatever arguments you pass.'
            +'<ul>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">name - </span></b>What the listener will be called, this will be used for accessing the listener to edit it and for organization in the config screen.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">template - </span></b>The name of the template(s) this listener can react to. Separate template names with a space.'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">text - </span></b>What text must be present in the chat message for the listener to react. Inline roll locations are designated with "##". Multiple separate texts can be defined for a single listener by separating them with "&&". The listener will only respond if all of these texts are present.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">roll - </span></b>What special roll result all matched inline rolls have to have. Options are critical,fumble, success, or fail.<br>'
            +'&'+'#8226'+'; <b><span style="font-family: serif;">command lines- </span></b>The individual commands that will be triggered when the conditions of the listener are met. If you have a multiline command to initiate, enter each line as a new command in order (first line would be command 1, second command 2, etc). If your command has characters or formatting that the chat will parse (e.g. inline rolls or attribute calls) you can enter these manually by entering them in the proper roll listener on the attributes and abilities screen of this character.<br>'
            +'</ul>'
            +'</li></ul>'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">\\\\delete,name=Listener Name</span></b><br> '
            +'Deletes the indicated roll listener.'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">name - </span></b>Same as in create/edit.<br>'
            +'</ul>'
            +'</li></ul>'
            +'<ul><li style="border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">\\\\config,[menu=Menu Name]</span></b><br> '
            +'Deletes the indicated roll listener.'
            +'<ul>'
            +'&'+'#8226'+';<b><span style="font-family: serif;">menu - </span></b>Opens the specified config menu. If not passed, opens the general config menu.<br>'
            +'</ul>'
            +'</li></ul>'
            +'</div>'
            +'</div>';
            help.set({bio:playerHelp});
    },
	
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
    },
    
    makeImageButton = function(command, image, toolTip, backgroundColor){
        return '<a style="background-color: '+backgroundColor+'; padding: 0;" href="'+command+'" title= "'+toolTip+'">'
            +'<div style="width: 16px; height: 16px; '
            +'display:inline-block; margin: 0; border:0; cursor: pointer;padding:0;background-image: url(\''+image+'\');'
            +'background-repeat:no-repeat;"></div></a>';
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
    
    extractListenProp = function(cmdDetails){
    var props = {
                condition:{
                    txt:'',
                    templates:'',
                    roll:''
                },
                act:''
            };
        if(cmdDetails.details.template){
            props.condition.templates = cmdDetails.details.template.split(/\s+/);
        }
        if(cmdDetails.commands){
            props.act = cmdDetails.commands.join('\n');
        }
        if(cmdDetails.details.text){
            props.condition.txt = cmdDetails.details.text.replace('##','\\$\\[\\[\\d\\]\\]').split(/\s*&&\s*/);
        }
        if(cmdDetails.details.roll){
            props.condition.roll = cmdDetails.details.roll.split(/\s+/);
        }
        return props;
    },
    
    createListener = function(cmdDetails){
        var props;
        if(_.every(findObjs({type:'ability',characterid:state.CRL.help}),(a)=>{return(a.get('name')!==cmdDetails.details.name);})){
            props = extractListenProp(cmdDetails);
            createObj('ability',{
                characterid:state.CRL.help,
                name:cmdDetails.details.name,
                description:JSON.stringify(props.condition),
                action:props.act
            });
            outputConfig(cmdDetails.details.name);
        }else{
            //send error: Name must be unique
        }
	},
	
	editListener = function(cmdDetails){
        var props,current = {},
            ability = findObjs({type:'ability',characterid:state.CRL.help,name:cmdDetails.details.name})[0];
            log(ability);
            log(cmdDetails);
            if(!ability){
                return;
            }
            try{
                current = {
                    condition:JSON.parse(ability.get('description')),
                    act:ability.get('action')
                };
            }catch(err){
                log('something went wrong in editListener');
            }
        if(ability){
            props = extractListenProp(cmdDetails);
            log(props);
            props = {
                condition:{
                    txt:props.condition.txt || current.condition.txt,
                    roll:props.condition.roll || current.condition.roll,
                    templates:props.condition.templates || current.condition.templates
                },
                act:props.act || current.act
            };
            if(props.condition){
                ability.set({description:JSON.stringify(props.condition)});
            }
            if(props.act){
                ability.set({action:props.act});
            }
            outputConfig(cmdDetails.details.name);
        }else{
            //send error: Name must be unique
        }
    },
    
    destroyListener = function(name){
        var ability = findObjs({type:'ability',characterid:state.CRL.help,name:name})[0];
        ability.remove();
        outputConfig();
    },
	
    listen = function(msg){
        var abilities = findObjs({type:'ability',characterid:state.CRL.help}),
            conditions,
            rolls = [],
            ro,
            templateMatch = false,
            rollMatch = false,
            textMatch = false,
            comp = {
                '>=':(a,b) => a>=b,
                '<=':(a,b) => a<=b,
                '==':(a,b) => a===b
            },
            iComp = {
                '>=':(a,b) => a<=b,
                '<=':(a,b) => a>=b
            };
        _.each(abilities,(a)=>{
            ro = '';
            rolls = [];
            try{
                conditions = JSON.parse(a.get('description'));
                if(conditions.templates){
                    templateMatch = _.some(conditions.templates,(t)=>{
                        return t === msg.rolltemplate;
                    });
                }else{
                    templateMatch = true;
                }
                textMatch = _.every(conditions.txt,(t)=>{
                    ro=msg.content.match(t);
                    if(ro){
                        rolls=rolls.concat(ro);
                    }
                    return ro;
                });
                if(textMatch && conditions.roll){
                    rollMatch = _.every(rolls,(r)=>{
                        ro = parseInt(r.match(/(?:\$\[\[(\d)\]\])/)[1]);
                        if(ro || ro === 0){
                            return _.some(conditions.roll,(cr)=>{
                                switch(cr){
                                    case 'critical':
                                        return _.some(msg.inlinerolls[ro].results.rolls,(c)=>{
                                            if(_.has(c.mods,'customCrit')){
                                                return _.some(c.mods.customCrit,(crit) => {
                                                    return _.some(c.results,(res) => {
                                                        return comp[crit.comp](res.v,crit.point);
                                                    });
                                                });
                                            }else if(c.results.v === c.sides){
                                                return true;
                                            }else{
                                                return false;
                                            }
                                        });
                                        break;
                                    case 'fumble':
                                        return _.some(msg.inlinerolls[ro].results.rolls,(c)=>{
                                            if(_.has(c.mods,'customFumble')){
                                                return _.some(c.mods.customFumble,(crit) => {
                                                    return _.some(c.results,(res) => {
                                                        return comp[crit.comp](res.v,crit.point);
                                                    });
                                                });
                                            }else if(c.results.v === c.sides){
                                                return true;
                                            }else{
                                                return false;
                                            }
                                        });
                                        break;
                                    case 'success':
                                        return _.some(msg.inlinerolls[ro].results.rolls,(c)=>{
                                            if(_.has(c.mods,'success')){
                                                return _.some(c.results,(res) => {
                                                    return comp[c.mods.success.comp](res.v,c.mods.success.point);
                                                });
                                            }else{
                                                return false;
                                            }
                                        });
                                        break;
                                    case 'fail':
                                        return _.some(msg.inlinerolls[ro].results.rolls,(c)=>{
                                            if(_.has(c.mods,'success')){
                                                return _.some(c.results,(res) => {
                                                    return iComp[c.mods.success.comp](res.v,c.mods.success.point);
                                                });
                                            }else{
                                                return false;
                                            }
                                        });
                                        break;
                                }
                            });
                        }
                        return ro;
                    });
                    textMatch = rollMatch;
                }
                if(textMatch && templateMatch){
                    sendChat('CRL',a.get('action'));
                }
            }catch(err){
                log('  > CRL ERROR ||| Ability: '+a.get('name')+' was not parseable. You may want to remove/update this ability via the config menu.');
            }
        });
    },
	
	showHelp = function(id){
	    sendChat('CRL','/w "'+getObj('player',id).get('displayname')+'"'
	        +'<div style="border: 2px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="border-bottom: 4px solid black;">'
            +'<div style="font-weight: bold;font-size: 130%;">'
            +'Customizable Roll Listener v'+version+' -- Hear the dice, hear the action!'
            +'</div></div>'
            +'For all the details on CRL, please see the <u><b>[Customizable Roll Listener]('+helpLink+')</b></u>.'
	        );
	},
	
	//Proposed command syntaxes:
	//!crl \\create,name=Listener Name,text=TEXT ||/&& TEXT,[template=all roll templates to consider],[roll=crit/fumble/success] \\Command 1 to execute \\Command 2 to execute \\etc
    HandleInput = function(msg_orig) {
    	var msg = _.clone(msg_orig),
			args,cmdDetails;
		args = msg.content.split(/\s+\\\\/);//splits the message contents into discrete arguments
		if(args[0] === '!crl'){
            if(args.length>1 && playerIsGM(msg.playerid)){
                cmdDetails = cmdExtract(_.rest(args,1));
                switch(cmdDetails.action){
                    case 'create':
                        if(cmdDetails.details.name){
                            createListener(cmdDetails);
                        }else{
                            showHelp(msg.playerid);
                        }
                        break;
                    case 'edit':
                        if(cmdDetails.details.name){
                            editListener(cmdDetails);
                        }else{
                            showHelp(msg.playerid);
                        }
                        break;
                    case 'delete':
                        if(cmdDetails.details.name){
                            destroyListener(cmdDetails.details.name);
                        }else{
                            showHelp(msg.playerid);
                        }
                        break;
                    case 'config':
                        outputConfig(cmdDetails.details.menu);
                        break;
                    case 'set':
                        setPref(cmdDetails.details.listen);
                        break;
                    default:
                        showHelp(msg.playerid);
                }
            }else{
                showHelp(msg.playerid);
            }
		}else if(state.CRL.listen === 'on' && msg.who !== 'CRL'){
		    listen(msg);
		}
	},
	
    cmdExtract = function(cmd){
        var cmdSep = {
            details:{}
        },
        vars,
        details;
        details = cmd.shift();
        cmdSep.commands = cmd;
        cmdSep.action = details.match(/create|edit|delete|set|config/)[0];
        _.each(details.replace(cmdSep.action+',','').split(','),(d)=>{
            vars=d.match(/(name|template|text|roll|listen|menu)(?:\:|=)([^,]+)/);
            if(vars){
                cmdSep.details[vars[1]]=vars[2];
            }
        });
        return cmdSep;
	},
    
    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
    };
    
    return {
        CheckInstall: checkInstall,
    	RegisterEventHandlers: RegisterEventHandlers
	};
    
}());


on("ready",function(){
    'use strict';
    
    CRL.CheckInstall();
    CRL.RegisterEventHandlers();
});
