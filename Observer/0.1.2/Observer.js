// Github:   https://github.com/shdwjk/Roll20API/blob/master/Observer/Observer.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Observer = Observer || (function() {
    'use strict';

    var version = '0.1.2',
        lastUpdate = 1476799960,
        schemaVersion = 0.1,
        clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
        updateTokenName = 'Observer Update Token',
        defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em 1em',
                    'color': 'white'
                }
            }
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
    	log('-=> Observer v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Observer') || state.Observer.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Observer = {
                version: schemaVersion,
                observers: [],
                config: {
                    initRestrict: true,
                    initNPCs: true,
                    initTokens: true
                }

            };
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
                text+
                '<div style="float:right;">'+
                    makeButton(command,onOff,color)+
                '</div>'+
                '<div style="clear:both;"></div>'+
            '</div>';
        
    },

    getConfigOption_InitRestrict = function() {
        return makeConfigOption(
            state.Observer.config.initRestrict,
            '!observer-config --toggle-init-restrict',
            '<b>Initiative Restriction</b> causes the visibility of observers to be restricted to just the Token whose turn it is.'
        );
    },
    getConfigOption_InitNPCs = function() {
        return makeConfigOption(
            state.Observer.config.initNPCs,
            '!observer-config --toggle-init-npcs',
            '<b>Initiative NPCs</b> allows the observer to see from the perspective of NPCs when it is their turn and Initiative Restriction is on.  With this setting off, vision will return to a "whole party" view during NPC turns.'
        );
    },
    getConfigOption_InitTokens = function() {
        return makeConfigOption(
            state.Observer.config.initTokens,
            '!observer-config --toggle-init-tokens',
            '<b>Initiative Tokens</b> allows the observer to see from the perspective of Tokens with no Character when it is their turn and Initiative Restriction is on.  With this setting off, vision will return to a "whole party" view during Characterless Token turns.'
        );
    },

    getAllConfigOptions = function() {
        return getConfigOption_InitRestrict() + getConfigOption_InitNPCs() + getConfigOption_InitTokens();
    },

    getObserverPlayers = function() {
        return _.chain(state.Observer.observers)
            .map((o) => getObj('player',o))
            .reject(_.isUndefined)
            .map(p=>'<li>'+p.get('displayname')+' '+makeButton('!observer --remove ?{Delete Observer '+p.get('displayname')+'|No,|Yes,'+p.id+'}','X','#dc143c')+'</li>')
            .join('');
    },

    showHelp = function(who) {

        sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'Observer v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Manages observer players, who are given the visiblilty (and control) of all player characters.  This is useful for both podcasting views and local play on a single player screen. Note that observers will lose their former character associations when they are nolonger observers.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!observe '+ch('[')+'--help'+ch('|')+'--add'+ch('|')+'--del'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--help</span></b> - Shows the Help screen'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--add</span></b> '+ch('<')+'Player Name Fragment'+ch('>')+' '+ch('[')+ch('<')+'Player Name Fragment'+ch('>')+' ...'+ch(']')+' - Adds the matching players as observers.  Partial names should work fine.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--del</span></b> '+ch('<')+'Player Name Fragment'+ch('>')+' '+ch('[')+ch('<')+'Player Name Fragment'+ch('>')+' ...'+ch(']')+' - Removes the matching players as observers.  Partial names should work fine.'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
    '<b>Observer Players</b>'+
        '<ul>'+
        getObserverPlayers()+
        '</ul>'+
	'<b>Configuration</b>'+
    getAllConfigOptions()+
'</div>'
        );
    },




    keyFormat = function(text) {
        return text.toLowerCase().replace(/\s+/,'');
    },

    handleInput = function(msg) {
        var args, who;

        if (msg.type !== "api") {
            return;
        }
        who=getObj('player',msg.playerid).get('_displayname');

        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!observer':
                if(!playerIsGM(msg.playerid)){
                    return;
                }
                if(_.contains(args,'help') || !args.length) {
                    showHelp(who);
                    return;
                }
                _.each(args,function(arg){
                    let cmds=arg.split(/\s+/),
                        op,opname,
                        players=[], playerNames=[];

                    switch(cmds.shift()){
                        case 'add':
                            op=_.union;
                            opname='Adding';
                            /* falls through */

                        case 'del': /* falls through */
                        case 'remove':
                            op = op || _.difference;
                            opname= opname||'Removing';

                            _.each(cmds,function(datum){
                                let key=keyFormat(datum),
                                    pobjs=filterObjs((o)=>{
                                        return o.get('type')==='player' &&
                                            (
                                                (-1 !== keyFormat(o.get('displayname')).indexOf(key)) ||
                                                (o.id === datum)
                                            );
                                        });
                                    players=_.union(players,_.pluck(pobjs,'id'));
                                    playerNames=_.union(playerNames,_.map(pobjs,p=>p.get('displayname')));
                            });

                            removeObservers();
                            state.Observer.observers=op(state.Observer.observers,players);
                            assureObservers();
                            sendChat('Observer',`/w gm ${opname} observers: ${playerNames.join()}`);
                            break;

                        case 'help': /* falls through */
                        default:
                            showHelp(who);
                            break;
                    }
                });
                break;
            case '!observer-config':
                if(!playerIsGM(msg.playerid)){
                    return;
                }
                if(_.contains(args,'help')) {
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'Observer v'+version+
	'</div>'+
    getAllConfigOptions()+
'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/);

                    switch(opt.shift()) {
                        case 'toggle-init-restrict':
                            state.Observer.config.initRestrict=!state.Observer.config.initRestrict;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_InitRestrict()+
                                '</div>'
                            );
                            break;
                        case 'toggle-init-npcs':
                            state.Observer.config.initNPCs=!state.Observer.config.initNPCs;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_InitNPCs()+
                                '</div>'
                            );
                            break;
                        case 'toggle-init-tokens':
                            state.Observer.config.initTokens=!state.Observer.config.initTokens;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_InitTokens()+
                                '</div>'
                            );
                            break;

                        default:
                            sendChat('','/w "'+who+'" '+
                                '<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });
                break;
            case '!eot':
                /* catch popular turn changing commands */
                _.defer(handleChangeTurnOrder);
                break;

        }
    },

    getOrCreateUpdateToken = function(pageid){
        return findObjs({
            type:'graphic',
            name:updateTokenName,
            imgsrc: clearURL,
            pageid: pageid
        })[0] || createObj('graphic',{
			imgsrc: clearURL,
			layer: 'map',
			pageid: pageid,
			width: 70,
			height: 70,
			left: -1000,
			top: -1000,
			name: updateTokenName,
			showname: false
        });
    },

    removeObservers = function(){
        _.each(
            filterObjs((o)=>(_.contains(['character','graphic'],o.get('type')) && o.get('controlledby')!=='') ),
            (c)=>c.set('controlledby', _.difference(c.get('controlledby').split(/,/),state.Observer.observers).join())
        );
    },

    forceUpdateOfVision = function(){
        var pages = _.union(
                [Campaign().get('playerpageid')],
                _.values(_.filter(Campaign().get('playerspecificpages'),(v,k)=>_.contains(state.Observer.observers,k)) )
            ),
            updateTokens = _.map(pages,getOrCreateUpdateToken);
        _.each(updateTokens,(t)=>t.set({left:(-1000+randomInteger(800)),top:(-1000+randomInteger(800))}));
    },
    
    assureObservers = function(){
        _.each(
            filterObjs((o)=>(o.get('type')==='character' && o.get('controlledby')!=='') ),
            (c)=>{c.set('controlledby', _.union(c.get('controlledby').split(/,/),state.Observer.observers).join());}
        );
        forceUpdateOfVision();
    },

    handleChangeCharacterControlledBy = function(obj){
        let cb =obj.get('controlledby');
        if(cb !== '') {
            obj.set('controlledby', _.union(cb.split(/,/),state.Observer.observers).join());
        }
    },

    handleChangeTurnOrder = function(c){
        c=c||Campaign();
        let initp=c.get('initiativepage'),
            to=JSON.parse(c.get('turnorder')||'[]');
        if(state.Observer.config.initRestrict && initp && to.length){
            let t=getObj('graphic',to[0].id),
                c=getObj('character',(t||{get:_.noop}).get('represents'));
            if(t){
                removeObservers();
                if(c){
                    if(state.Observer.config.initNPCs || c.get('controlledby')!==''){
                        c.set('controlledby', _.union(c.get('controlledby').split(/,/),state.Observer.observers).join());
                        forceUpdateOfVision();
                    } else {
                        assureObservers();
                    }
                } else {
                    if(state.Observer.config.initTokens){
                        t.set('controlledby', _.union(t.get('controlledby').split(/,/),state.Observer.observers).join());
                        forceUpdateOfVision();
                    } else {
                        assureObservers();
                    }
                }
                return;
            } 
        }
        assureObservers();
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:character:controlledby',handleChangeCharacterControlledBy);
        on('change:campaign:turnorder', handleChangeTurnOrder);
        on('change:campaign:initiativepage', handleChangeTurnOrder);

        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(handleChangeTurnOrder);
        }

        handleChangeTurnOrder();
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    Observer.CheckInstall();
    Observer.RegisterEventHandlers();
});

