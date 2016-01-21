// Github:   https://github.com/shdwjk/Roll20API/blob/master/DryErase/DryErase.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var DryErase = DryErase || (function() {
    'use strict';

    var version = '0.1.0',
        lastUpdate = 1453338952,
        schemaVersion = 0.2,
        clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',

    checkInstall = function() {
		log('-=> DryErase v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'DryErase') || state.DryErase.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.DryErase = {
                version: schemaVersion,
                config: {
                    report: true,
                    autoHide: true,
                    autoDelete: false
                },
                drawings: {},
                grantedPlayers: []

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

    getConfigOption_Report = function() {
        var text = (state.DryErase.config.report ? 'On' : 'Off' );
        return '<div>'
            +'Report is currently <b>'
                +text
            +'</b> '
            +'<a href="!dry-erase-config --toggle-report">'
                +'Toggle'
            +'</a>'
        +'</div>';
        
    },

    getConfigOption_AutoHide = function() {
        var text = (state.DryErase.config.autoHide ? 'On' : 'Off' );
        return '<div>'
            +'Auto Hide is currently <b>'
                +text
            +'</b> '
            +'<a href="!dry-erase-config --toggle-auto-hide">'
                +'Toggle'
            +'</a>'
        +'</div>';
        
    },

    getConfigOption_AutoDelete = function() {
        var text = (state.DryErase.config.autoDelete ? 'On' : 'Off' );
        return '<div>'
            +'Auto Delete is currently <b>'
                +text
            +'</b> '
            +'<a href="!dry-erase-config --toggle-auto-delete">'
                +'Toggle'
            +'</a>'
        +'</div>';
        
    },
    getAllConfigOptions = function() {
        return getConfigOption_AutoDelete() + getConfigOption_AutoHide() + getConfigOption_Report();
    },
    getPlayerGrantOption = function (player) {
        var p=(_.has(player,'id') ? player : getObj('player',player)),button;
        if(p){
            button = (playerIsGM(p.id) ?
                '<div style="'+
                   'border: 1px solid #666;'+
                   'border-radius: 1em;'+
                   'background-color: #333;'+
                   'margin: 0 .1em;'+
                   'font-weight: bold;'+
                   'padding: .1em 1em;'+
                   'color: red;'+
                   'float:right;'+
                '">GM</div>' :
                ( _.contains(state.DryErase.grantedPlayers,p.id) ?  
                    '<a style="'+
                       'border: 1px solid #ff5200;'+
                       'border-radius: 1em;'+
                       'background-color: #ff9d12;'+
                       'margin: 0 .1em;'+
                       'font-weight: bold;'+
                       'padding: .1em 1em;'+
                       'color: white;'+
                       'float:right;'+
                    '" href="!dry-erase --revoke-playerid '+p.id+'">Revoke</a>'
                    :
                    '<a style="'+
                       'border: 1px solid #0052ff;'+
                       'border-radius: 1em;'+
                       'background-color: #129dff;'+
                       'margin: 0 .1em;'+
                       'font-weight: bold;'+
                       'padding: .1em 1em;'+
                       'color: white;'+
                       'float:right;'+
                    '" href="!dry-erase --grant-playerid '+p.id+'">Grant</a>')
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
                button+
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
            highlight = getObj('graphic',details.highlight);
            path = getObj('path',details.path);
            if(path && 'gmlayer' === path.get('layer')){
                path.set({layer: 'objects'});
            }
            delete state.DryErase.drawings[details.path];
            delete state.DryErase.drawings[details.highlight];
            if(highlight){
                highlight.remove();
            }
        }
    },
    eraseDrawing = function(id){
        var details, path, highlight;
        if(_.has(state.DryErase.drawings,id)){
            details = state.DryErase.drawings[id];
            path = getObj('graphic',details.highlight);
            highlight = getObj('path',details.path);
            if(path ){
                path.remove();
            }
            if(highlight){
                highlight.remove();
            }
            delete state.DryErase.drawings[details.path];
            delete state.DryErase.drawings[details.highlight];
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
        who=getObj('player',msg.playerid).get('_displayname');

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
        return playerIsGM(playerid) || _.contains(state.DryErase.grantedPlayers,playerid);
    },
    
    handlePathDraw = function(path){
        var msg ='',
            playerid=path.get('controlledby').split(/,/)[0],
            player,
            page,
            highlight,
            details={};

        if(!allowedToDraw(playerid)) {
            player=getObj('player',playerid);
            if(state.DryErase.config.autoDelete){
                path.remove();
                msg='<span style="'+
                   'border: 1px solid #666;'+
                   'border-radius: 1em;'+
                   'background-color: #333;'+
                   'margin: 0 .1em;'+
                   'font-weight: bold;'+
                   'padding: 3em;'+
                   'color: red;'+
                '">DELETED</span>';
            } else if(state.DryErase.config.autoHide){
                path.set({layer:'gmlayer'});
                highlight=createObj('graphic',{
                    imgsrc: clearURL,
                    layer: 'gmlayer',
                    pageid: path.get('pageid'),
                    width: path.get('width'),
                    height: path.get('height'),
                    left: path.get('left'),
                    top: path.get('top'),
                    name: 'Created by: '+player.get('displayname'),
                    aura1_color: player.get('color'),
                    aura1_square: true,
                    aura1_radius: 0.000001,
                    showname: true
                });
                details.highlight = highlight.id;
                details.path = path.id;
                details.player = playerid;
                state.DryErase.drawings[path.id]=details;
                state.DryErase.drawings[highlight.id]=details;
                msg='<a style="'+
                   'border: 1px solid #ff5200;'+
                   'border-radius: 1em;'+
                   'background-color: #ff9d12;'+
                   'margin: 0 .1em;'+
                   'font-weight: bold;'+
                   'padding: .1em 1em;'+
                   'color: white;'+
                '" href="!dry-erase --erase '+path.id+'">Erase</a>'+
                '<a style="'+
                   'border: 1px solid #52ff00;'+
                   'border-radius: 1em;'+
                   'background-color: #9dff12;'+
                   'margin: 0 .1em;'+
                   'font-weight: bold;'+
                   'padding: .1em 1em;'+
                   'color: white;'+
                '" href="!dry-erase --allow '+path.id+'">Allow</a>'+
                '<a style="'+
                   'border: 1px solid #0052ff;'+
                   'border-radius: 1em;'+
                   'background-color: #129dff;'+
                   'margin: 0 .1em;'+
                   'font-weight: bold;'+
                   'padding: .1em 1em;'+
                   'color: white;'+
                '" href="!dry-erase --grant-playerid '+playerid+'">Grant Player</a>';
            }
            if(state.DryErase.config.report){
                page=getObj('page',path.get('pageid'));
                sendChat('DryErase','/w gm '+
                    '<div style="'+
                        'border: 1px solid #ccc;'+
                        'border-radius: .5em;'+
                        'padding: .1em .5em;'+
                        'background-color: #eee;'+
                        'font-size: 10px;'+
                        'font-weight: bold;'+
                    '">'+
                        '<span style="color: #933;">'+
                            player.get('displayname')+
                        '</span>'+
                        ' created a drawing on the page '+
                        '<span style="color: #339;">'+
                            page.get('name')+
                        '</span>'+
                        '.'+msg+
                    '</div>'
                );
            }
        }
    },
    handleMoves = function(obj,prev){
        var details, other;
        if(_.has(state.DryErase.drawings,obj.id)){
            if(obj.get('layer') !== prev.layer){
                allowDrawing(obj.id);
            } else {
                details = state.DryErase.drawings[obj.id];
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
