// Github:   https://github.com/shdwjk/Roll20API/blob/master/DryErase/DryErase.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var DryErase = DryErase || (function() {
    'use strict';

    var version = '0.1.8',
        lastUpdate = 1490368977,
        schemaVersion = 0.3,
        clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
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

	parseExistingPaths = function(){
		_.each(filterObjs(function(o){
			return 'path'===o.get('type') && !_.has(state.DryErase.drawings,o.id) && 'objects' === o.get('layer');
		}),handlePathDraw);
	},

	cleanupObjectReferences = function(){
		var ids = _.keys(state.DryErase.drawings);
		filterObjs(function(o){
			ids=_.without(ids,o.id);
			return false;
		});
		_.each(ids,eraseDrawing);
	},

    checkInstall = function() {
		log('-=> DryErase v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'DryErase') || state.DryErase.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
			switch(state.DryErase && state.DryErase.version) {
				case 0.2:
					state.DryErase.config.labelGranted = false;
                    /* break; // intentional dropthrough */
					
                case 'UpdateSchemaVersion':
                    state.DryErase.version = schemaVersion;
                    break;

                default:
					state.DryErase = {
						version: schemaVersion,
						config: {
							report: true,
							autoHide: true,
							autoDelete: false,
							labelGranted: false
						},
						drawings: {},
						grantedPlayers: []

					};
					break;
			}
        }
        buildTemplates();
		cleanupObjectReferences(); 
		parseExistingPaths();
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

    getConfigOption_Report = function() {
        return makeConfigOption(
            state.DryErase.config.report,
            '!dry-erase-config --toggle-report',
            '<b>Report</b> notifies the GM via a whisper when a player that has not been granted drawing permission makes a drawing. '
        );
        
    },

    getConfigOption_LabelGranted = function() {
        return makeConfigOption(
            state.DryErase.config.labelGranted,
            '!dry-erase-config --toggle-label-granted',
            '<b>Label Granted Player Drawings</b> adds a GM Layer highlight with the player name to drawings made by granted players.'
        );
    },

    getConfigOption_AutoHide = function() {
        return makeConfigOption(
            state.DryErase.config.autoHide,
            '!dry-erase-config --toggle-auto-hide',
            '<b>Auto Hide</b> automatically moves to the GM Layer any drawings by players that have not been granted drawing permission.'
        );
    },

    getConfigOption_AutoDelete = function() {
        return makeConfigOption(
            state.DryErase.config.autoDelete,
            '!dry-erase-config --toggle-auto-delete',
            '<b>Auto Delete</b> automatically deletes drawings by players that have not been granted drawing permission.'
        );
    },
    getAllConfigOptions = function() {
        return getConfigOption_AutoDelete() + getConfigOption_AutoHide() + getConfigOption_Report() + getConfigOption_LabelGranted();
    },
    getPlayerGrantOption = function (player) {
        var p=(_.has(player,'id') ? player : getObj('player',player)),button;
        if(p){
            button = (playerIsGM(p.id) 
                ? makeButton('','GM','black','red')
                : ( _.contains(state.DryErase.grantedPlayers,p.id)
                    ? makeButton('!dry-erase --revoke-playerid '+p.id,'Revoke','#faa732')
                    : makeButton('!dry-erase --grant-playerid '+p.id, 'Grant')
                  )
                );
            return '<div style="'+
                    'border: 1px solid #ccc;'+
                    'border-radius: .2em;'+
                    'background-color: white;'+
                    'margin: 0 1em;'+
                    'padding: .1em .3em;'+
                '"><b>'+
                p.get('displayname')+
                '</b>'+
				'<div style="float:right;">'+
					button+
				'</div>'+
                '<div style="clear:both;"></div>'+
            '</div>';
        }
        return '';
    },
    getAllPlayerGrantOptions = function(){
        return '<div>'+
            _.map(findObjs({
                type: 'player'
            }),getPlayerGrantOption).join('')+
            '</div>';
    },

    showHelp = function(who) {

        sendChat('','/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'DryErase v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>DryErase gives you control over how your players are drawing on your maps.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!dry-erase [--help]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Shows the help as well as the configuration and player options.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
				+'</li> '
			+'</ul>'
		+'</div>'
    +'</div>'
	+'<b>Player Permissions</b>'
    +getAllPlayerGrantOptions()
	+'<b>Configuration</b>'
    +getAllConfigOptions()
+'</div>'
        );
    },

    allowDrawing = function(id){
        var details, path, highlight;
        if(_.has(state.DryErase.drawings,id)){
            details = state.DryErase.drawings[id];
            path = getObj('path',details.path);
            highlight = getObj('graphic',details.highlight);
            if(path && 'gmlayer' === path.get('layer')){
                path.set({layer: 'objects'});
            }
			if(!state.DryErase.config.labelGranted){
				delete state.DryErase.drawings[details.highlight];
				if(highlight){
					highlight.remove();
				}
			}
        }
    },

    eraseDrawing = function(id){
        var details, path, highlight;
        if(_.has(state.DryErase.drawings,id)){
            details = state.DryErase.drawings[id];
            path = getObj('path',details.path);
            highlight = getObj('graphic',details.highlight);

			if(details.path === id){
				if(path){
					path.remove();
				}
				if(highlight){
					highlight.remove();
				}
				delete state.DryErase.drawings[details.path];
				delete state.DryErase.drawings[details.highlight];
			} else {
				if(highlight){
					highlight.remove();
				}
				delete state.DryErase.drawings[details.highlight];

				if(path && 'gmlayer' === path.get('layer')){
					path.remove();
					delete state.DryErase.drawings[details.path];
				} else {
					delete details.highlight;
				}
			}
        }
    },
    grantPlayer = function(id){
        state.DryErase.grantedPlayers = _.union( state.DryErase.grantedPlayers, [id]);
        sendChat('','/w gm '+getPlayerGrantOption(id));
    },
    revokePlayer = function(id){
        state.DryErase.grantedPlayers = _.without( state.DryErase.grantedPlayers, id);
        sendChat('','/w gm '+getPlayerGrantOption(id));
    },

    handleInput = function(msg) {
        var args,
            who;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }
		who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!dry-erase':
                if(0 === args.length || _.contains(args,'help')) {
                    showHelp(who);
                    return;
                } 
                _.each(args,function(arg){
                    var params=arg.split(/\s+/);
                    switch(params.shift()){
                        case 'erase':
                            _.each(params,eraseDrawing);
                            break;
                        case 'allow':
                            _.each(params,allowDrawing);
                            break;

                        case 'grant-playerid':
                            _.each(params,grantPlayer);
                            break;

                        case 'revoke-playerid':
                            _.each(params,revokePlayer);
                            break;
                        }
                });
                break;

            case '!dry-erase-config':
                if(_.contains(args,'help')) {
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'DryErase v'+version
	+'</div>'
    +getAllConfigOptions()
+'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/);

                    switch(opt.shift()) {
                        case 'toggle-auto-delete':
                            state.DryErase.config.autoDelete=!state.DryErase.config.autoDelete;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_AutoDelete()
                                +'</div>'
                            );
                            break;

                        case 'toggle-label-granted':
                            state.DryErase.config.labelGranted=!state.DryErase.config.labelGranted;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_LabelGranted()
                                +'</div>'
                            );
                            break;

                        case 'toggle-auto-hide':
                            state.DryErase.config.autoHide=!state.DryErase.config.autoHide;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_AutoHide()
                                +'</div>'
                            );
                            break;

                        case 'toggle-report':
                            state.DryErase.config.report=!state.DryErase.config.report;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_Report()
                                +'</div>'
                            );
                            break;


                        default:
                            sendChat('','/w "'+who+'" '
                                +'<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });

                break;
        }
    },

    allowedToDraw = function(playerid){
        return playerIsGM(playerid) || _.contains(state.DryErase.grantedPlayers,playerid) || _.contains(['all',''],playerid);
    },

	makeHighlight = function(path,player){
		return createObj('graphic',{
			imgsrc: clearURL,
			layer: 'gmlayer',
			pageid: path.get('pageid'),
			width: path.get('width'),
			height: path.get('height'),
			left: path.get('left'),
			top: path.get('top'),
			name: 'Created by: '+((player && player.get && player.get('displayname')) || 'UNKNOWN'),
			aura1_color: (player && player.get && player.get('color')) || '#ff0000',
			aura1_square: true,
			aura1_radius: 0.000001,
			showname: true
		});
	},
    
    handlePathDraw = function(path){
        var msg ='',
            playerid=path.get('controlledby').split(/,/)[0],
            player,
            page,
            highlight,
            details={
                path: path.id,
                player: playerid
			};

		if(_.has(state.DryErase.drawings, path.id) || 'objects' !== path.get('layer')){
			return;
		}
		player=getObj('player',playerid);

        if(!allowedToDraw(playerid)) {
            if(state.DryErase.config.autoDelete){
                path.remove();
                msg='<span style="'+
                   'border: 1px solid #666;'+
                   'border-radius: 1em;'+
                   'background-color: #333;'+
                   'margin: 0 .1em;'+
                   'font-weight: bold;'+
                   'padding: .2em 1em;'+
                   'color: red;'+
                '">DELETED</span>';
            } else if(state.DryErase.config.autoHide){
                path.set({layer:'gmlayer'});
                highlight=makeHighlight(path,player);
				details.highlight = highlight.id;
                state.DryErase.drawings[path.id]=details;
                state.DryErase.drawings[highlight.id]=details;
                
                msg += makeButton(
                    '!dry-erase --erase '+path.id,
                    'Erase',
                    '#faa732'
                );
                msg += makeButton(
                    '!dry-erase --allow '+path.id,
                    'Allow',
                    '#5bb75b'
                );
                msg += makeButton(
                    '!dry-erase --grant-playerid '+playerid,
                    'Grant Player'
                );
            }
            if(state.DryErase.config.report){
                page=getObj('page',path.get('pageid'));
                sendChat('DryErase','/w gm '+
                    '<div style="'+
                        'margin-left: -40px;'+
                        'border: 1px solid #ccc;'+
                        'border-radius: .5em;'+
                        'padding: .1em .5em;'+
                        'background-color: #eee;'+
                        'font-size: 10px;'+
                        'font-weight: bold;'+
                    '">'+
                        '<span style="color: #933;">'+
                            ((player && player.get && player.get('displayname')) || 'UNKNOWN')+
                        '</span>'+
                        ' created a drawing on the page '+
                        '<span style="color: #339;">'+
                            page.get('name')+
                        '</span>'+
                        '. '+msg+
                    '</div>'
                );
            }
        } else {
            if(state.DryErase.config.labelGranted && _.contains(state.DryErase.grantedPlayers,playerid) ){
                highlight=makeHighlight(path,player);
				details.highlight = highlight.id;
                state.DryErase.drawings[highlight.id]=details;
			}
			state.DryErase.drawings[path.id]=details;
        }
    },

    handleMoves = function(obj,prev){
        var details, other;
        if(_.has(state.DryErase.drawings,obj.id)){
			details=state.DryErase.drawings[obj.id];

            if(obj.get('layer') !== prev.layer){
                allowDrawing(obj.id);
            } 

			if (_.has(details,'highlight')) {
                other = (details.path === obj.id ? getObj('graphic',details.highlight) : getObj('path',details.path) );
                if(other){
                    other.set({
                        width: prev.width,
                        height: prev.height,
                        top: obj.get('top'),
                        left: obj.get('left')
                    });
                }
            }
        } else if ('path' === obj.get('type') && 'objects' === obj.get('layer')){
			handlePathDraw(obj);
		}
    },
    handleDeletes = function(obj){
        eraseDrawing(obj.id);
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('add:path', handlePathDraw);
        on('destroy:path', handleDeletes);
        on('destroy:graphic', handleDeletes);
        on('change:path', handleMoves);
        on('change:graphic', handleMoves);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';
    DryErase.CheckInstall();
    DryErase.RegisterEventHandlers();
});
