// Github:   https://github.com/shdwjk/Roll20API/blob/master/Bump/Bump.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var globalconfig = globalconfig || undefined;
var Bump = Bump || (function() {
    'use strict';

    var version = '0.2.10',
        lastUpdate = 1457563083,
        schemaVersion = 0.4,
        clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
        checkerURL = 'https://s3.amazonaws.com/files.d20.io/images/16204335/MGS1pylFSsnd5Xb9jAzMqg/med.png?1455260461',

        regex = {
    		colors: /(transparent|(?:#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?))/
        },

        mirroredProps = [
            'name', 'left', 'top', 'width', 'height', 'rotation',
            'flipv', 'fliph', 'bar1_value', 'bar1_max',
            'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max',
            'tint_color', 'lastmove',
            'represents','bar1_link','bar2_link','bar3_link'
        ],
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
    
	cleanupObjectReferences = function(){
		var inverse = _.invert(state.Bump.mirrored),
            ids = _.union(_.keys(state.Bump.mirrored),_.keys(inverse));
		filterObjs(function(o){
			ids=_.without(ids,o.id);
			return false;
		});
        _.each(ids,function(id){
            var obj;
            if(_.has(state.Bump.mirrored,id)){
                if(!_.contains(ids,state.Bump.mirrored[id])){
                    obj=getObj('graphic',state.Bump.mirrored[id]);
                    if(obj){
                        obj.remove();
                    }
                }
                delete state.Bump.mirrored[id];
            } else {
                delete state.Bump.mirrored[inverse[id]];
                if(!_.contains(ids,inverse[id])){
                    createMirrored(inverse[id], false, 'gm');
                }
            }
        });
    },

	checkGlobalConfig = function(){
		var s=state.Bump,
		g=globalconfig && globalconfig.bump,
		parsedDots;
		if(g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved
		){
			log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');

			if(g['Visible Color'].match(regex.colors)) {
                s.config.layerColors.gmlayer =g['Visible Color'].match(regex.colors)[1];
			}
			if(g['Invisible Color'].match(regex.colors)) {
                s.config.layerColors.objects=g['Invisible Color'].match(regex.colors)[1];
			}

			s.config.autoPush = 'autoPush' === g['Auto Push'];
			s.config.autoSlave = 'autoSlave' === g['Auto Slave'];

			state.Bump.globalconfigCache=globalconfig.bump;
		}
	},
    checkInstall = function() {
        log('-=> Bump v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Bump') || state.Bump.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.Bump && state.Bump.version) {
                case 0.1:
                    state.Bump.config.autoSlave = false;

                /* falls through */
				case 0.2:
				case 0.3:
                  delete state.Bump.globalConfigCache;
                  state.Bump.globalconfigCache = {lastsaved:0};

                /* falls through */
                case 'UpdateSchemaVersion':
                    state.Bump.version = schemaVersion;
                    break;

                default:
                    state.Bump = {
                        version: schemaVersion,
                        globalconfigCache: {lastsaved:0},
                        config: {
                            layerColors: {
                                'gmlayer' : '#008000',
                                'objects' : '#800080'
                            },
                            autoPush: false,
                            autoSlave: false
                        },
                        mirrored: {}
                    };
                    break;
            }
        }
        buildTemplates();
        cleanupObjectReferences();
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


    getMirroredPair = function(id) {
        var mirrored;
        _.find(state.Bump.mirrored,function(slaveid,masterid){
            if(id === masterid || id === slaveid) {
                mirrored = {
                    master: getObj('graphic',masterid),
                    slave: getObj('graphic',slaveid)
                };
                return true;
            }
            return false;
        });
        return mirrored;
    },

    getMirrored = function(id) {
        var mirrored;
        _.find(state.Bump.mirrored,function(slaveid,masterid){
            if(id === masterid){
                mirrored = getObj('graphic',slaveid);
                return true;
            } 
            if(id === slaveid) {
                mirrored = getObj('graphic',masterid);
                return true;
            } 
            return false;
        });
        return mirrored;
    },


    createMirrored = function(id, push, who) {
        // get root obj
        var master = getObj('graphic',id),
            slave = getMirrored(id),
            baseObj,
            layer;

        if(!slave && master) {
            layer=((state.Bump.config.autoPush || push || 'gmlayer' === master.get('layer')) ? 'objects' : 'gmlayer');
            if(state.Bump.config.autoPush || push) {
                master.set({layer: 'gmlayer'});
            }
            baseObj = {
                imgsrc: clearURL,
                layer: layer,
                pageid: master.get('pageid'),
                aura1_color: state.Bump.config.layerColors[layer],
                aura1_square: true,
                aura1_radius: 0.000001
            };
            _.each(mirroredProps,function(p){
                baseObj[p]=master.get(p);
            });
            slave = createObj('graphic',baseObj);
            state.Bump.mirrored[master.id]=slave.id;
        } else {
            if(!slave) {
                sendChat('','/w "'+who+'" '+
                    '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                        '<b>Error:</b> Couldn'+ch("'")+'t find a token for id: '+id+
                    '</div>'
                );
            }
        }
    },

    setMasterLayer = function (obj,layer){
        obj.set({
            layer: layer
        });
    },

    setSlaveLayer = function (obj,layer){
        obj.set({
            layer: layer,
            aura1_color: state.Bump.config.layerColors[layer]
        });
    },

    bumpToken = function(id,who) {
        var pair=getMirroredPair(id);
        if(pair && pair.master && pair.slave) {
            switch(pair.master.get('layer')){
                case 'gmlayer':
                    setMasterLayer(pair.master,'objects');
                    setSlaveLayer(pair.slave,'gmlayer');
                    break;

                default:
                    setMasterLayer(pair.master,'gmlayer');
                    setSlaveLayer(pair.slave,'objects');
                    break;
            }
        } else if(state.Bump.config.autoSlave) {
            createMirrored(id, false, who);
        }
    },

    removeMirrored = function(id) {
        var pair=getMirroredPair(id);
        if(pair) {
            if(id === pair.master.id ) {
                pair.slave.remove();
            }
            delete state.Bump.mirrored[pair.master.id];
        }
    },


    handleRemoveToken = function(obj) {
        // special handling for deleting slaves?
        removeMirrored(obj.id);
    },
    
    handleTokenChange = function(obj,prev) {
        var pair = getMirroredPair(obj.id);
        if(pair && obj) {
            (pair.master.id === obj.id ? pair.slave : pair.master).set(_.reduce(mirroredProps,function(m,p){
                m[p]=obj.get(p);
                return m;
            },{}));
            if(obj.get('layer') !== prev.layer) {
                if(pair.master.id === obj.id) {
                    setSlaveLayer(pair.slave,prev.layer);
                } else {
                    setMasterLayer(pair.master,prev.layer);
                    setSlaveLayer(pair.slave,obj.get('layer'));
                }
            }
        }
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

    makeConfigOptionColor = function(config,command,text) {
        var color = ('transparent' === config ? "background-image: url('"+checkerURL+"');" : "background-color: "+config+";"),
            buttonText ='<div style="border:1px solid #1d1d1d;width:40px;height:40px;display:inline-block;'+color+'">&nbsp;</div>';
        return '<div style="'+
                'border: 1px solid #ccc;'+
                'border-radius: .2em;'+
                'background-color: white;'+
                'margin: 0 1em;'+
                'padding: .1em .3em;'+
            '">'+
                '<div style="float:right;">'+
                    makeButton(command,buttonText)+
                '</div>'+
                text+
                '<div style="clear:both;"></div>'+
            '</div>';
    },

    getConfigOption_GMLayerColor = function() {
        return makeConfigOptionColor(
            state.Bump.config.layerColors.gmlayer,
            '!bump-config --gm-layer-color|?{What aura color for when the master token is visible? (transparent for none, #RRGGBB for a color)|'+state.Bump.config.layerColors.gmlayer+'}',
            '<b>GM Layer (Visible) Color</b> is the color the overlay turns when it is on the GM Layer, thus indicating that the Bumped token is visible to the players on the Object Layer.'
        );

    },

    getConfigOption_ObjectsLayerColor = function() {
        return makeConfigOptionColor(
            state.Bump.config.layerColors.objects,
            '!bump-config --objects-layer-color|?{What aura color for when the master token is invisible? (transparent for none, #RRGGBB for a color)|'+state.Bump.config.layerColors.objects+'}',
            '<b>Objects Layer (Invisible) Color</b> is the color the overlay turns when it is on the Objects Layer, thus indicating that the Bumped token is invisible to the players on the GM Layer.'
        );
    },

    getConfigOption_AutoPush = function() {
        return makeConfigOption(
            state.Bump.config.autoPush,
            '!bump-config --toggle-auto-push',
            '<b>Auto Push</b> automatically moves a bumped token to the GM Layer when it gets added to Bump.'
        );
    },

    getConfigOption_AutoSlave = function() {
        return makeConfigOption(
            state.Bump.config.autoSlave,
            '!bump-config --toggle-auto-slave',
            '<b>Auto Slave</b> causes tokens that are not in Bump to be put into Bump when ever !bump is run with them selected.'
        );
    },

    getAllConfigOptions = function() {
        return getConfigOption_GMLayerColor() +
            getConfigOption_ObjectsLayerColor() +
            getConfigOption_AutoPush() +
            getConfigOption_AutoSlave();
    },

    showHelp = function(who) {

        sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'Bump v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Bump provides a way to invisibly manipulate tokens on the GM Layer from the Objects Layer, and vice versa.</p>'+
        '<p>When a token is added to Bump a slave token is created that mimics everything about to master token.  The slave token is only visible to the GM and has a color on it to show if the master token is on the GM Layer or the Objects layer.  Moving the slave token will move the master token and vice versa.  The slave token represents the same character as the master token and changes on the slave token will be reflected on the master token.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!bump-slave [--push|--help]</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Adds the selected tokens to Bump, creating their slave tokens.</p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--push</span></b> '+ch('-')+' If the selected token is on the Objects Layer, it will be pushed to the GM Layer.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!bump [--help]</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Using !bump on a token in Bump causes it to swap with it'+ch("'")+' counterpart on the other layer.</p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'+
				'</li> '+
			'</ul>'+
		'</div>'+
    '</div>'+
	'<b>Configuration</b>'+
    getAllConfigOptions()+
'</div>'
        );
    },

    handleInput = function(msg) {
        var args, who;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }
        who=getObj('player',msg.playerid).get('_displayname');

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!bump':
                if(!msg.selected || _.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                _.each(msg.selected,function(s){
                    bumpToken(s._id,who);
                });
                break;

            case '!bump-slave':
                if(!msg.selected || _.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                _.each(msg.selected,function(s){
                    createMirrored(s._id,_.contains(args,'--push'), who);
                });
                break;


            case '!bump-config':
                if(_.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '+
                        '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                            '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                                'Bump v'+version+
                            '</div>'+
                            getAllConfigOptions()+
                        '</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/),
                        omsg='';
                    switch(opt.shift()) {
                        case '--gm-layer-color':
                            if(opt[0].match(regex.colors)) {
                               state.Bump.config.layerColors.gmlayer=opt[0];
                            } else {
                                omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
                            }
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    omsg+
                                    getConfigOption_GMLayerColor()+
                                '</div>'
                            );
                            break;

                        case '--objects-layer-color':
                            if(opt[0].match(regex.colors)) {
                               state.Bump.config.layerColors.objects=opt[0];
                            } else {
                                omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
                            }
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    omsg+
                                    getConfigOption_ObjectsLayerColor()+
                                '</div>'
                            );
                            break;

                        case '--toggle-auto-push':
                            state.Bump.config.autoPush=!state.Bump.config.autoPush;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_AutoPush()+
                                '</div>'
                            );
                            break;
                        
                        case '--toggle-auto-slave':
                            state.Bump.config.autoSlave=!state.Bump.config.autoSlave;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_AutoSlave()+
                                '</div>'
                            );
                            break;

                        default:
                            sendChat('','/w "'+who+'" '+
                            '<div><b>Unsupported Option:</div> '+a+'</div>');
                    }
                            
                });

                break;
        }
    },
    
    handleTurnOrderChange = function() {
         Campaign().set({
            turnorder: JSON.stringify(
                _.map(JSON.parse( Campaign().get('turnorder') || '[]'), function(turn){
                    _.find(state.Bump.mirrored,function(slaveid,masterid){
                        if(slaveid === turn.id) {
                            turn.id = masterid;
                            return true;
                        }
                        return false;
                    });
                    return turn;
                })
            )
        });
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:graphic', handleTokenChange);
        on('destroy:graphic', handleRemoveToken);
        on('change:campaign:turnorder', handleTurnOrderChange);

        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(handleTurnOrderChange);
        }
    };

    return {
        CheckInstall: checkInstall,
        Notify_TurnOrderChange: handleTurnOrderChange,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    Bump.CheckInstall();
    Bump.RegisterEventHandlers();
});

