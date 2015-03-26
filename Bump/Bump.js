// Github:   https://github.com/shdwjk/Roll20API/blob/master/Bump/Bump.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

// Insipired by Stephen S. in: https://app.roll20.net/forum/post/1758461/thinking-about-bump-in-script-dot-dot-dot-for-gms/#post-1761852

var Bump = Bump || (function() {
    'use strict';

    var version = 0.1,
        schemaVersion = 0.1,
        clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',

        regex = {
			colors: /^(transparent|(?:#?[0-9a-fA-F]{6}))$/
        },

        mirroredProps = [
            'name', 'left', 'top', 'width', 'height', 'rotation',
            'flipv', 'fliph', 'bar1_value', 'bar1_max',
            'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max',
            'tint_color', 'statusmarkers', 'lastmove',
            'represents','bar1_link','bar2_link','bar3_link'
        ],

    checkInstall = function() {
        log('-=> Bump v'+version+' <=-');

        if( ! _.has(state,'Bump') || state.Bump.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Bump = {
                version: schemaVersion,
                config: {
                    layerColors: {
                        'gmlayer' : '#008000',
                        'objects' : '#800080'
                    },
                    autoPush: false
                },
                mirrored: {}
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
            if(slave) {
                sendChat('','/w '+who+' '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<b>Error:</b> Slave Token already exists.'
                    +'</div>'
                );
            } else {
                sendChat('','/w '+who+' '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<b>Error:</b> Couldn'+ch("'")+'t find a token for id: '+id
                    +'</div>'
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

    bumpToken = function(id) {
        var pair=getMirroredPair(id);
        if(pair) {
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
        if(pair) {
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

    getConfigOption_GMLayerColor = function() {
        var text = ('transparent' === state.Bump.config.layerColors.gmlayer ? 'transparent' : '&nbsp;');
        return '<div>'
            +'GM Layer (Visible) Color:'
            +'<div style="width: 50px; display: inline-block; background-color: '
                +('transparent' === state.Bump.config.layerColors.gmlayer 
                    ? 'white' 
                    : state.Bump.config.layerColors.gmlayer
                )
            +';">'
                +text
            +'</div> '
            +'<a href="!bump-config --gm-layer-color|?{What aura color for when the master token is visible? (transparent for none, #RRGGBB for a color)|'+state.Bump.config.layerColors.gmlayer+'}">'
                +'Set Color'
            +'</a>'
        +'</div>';
    },
    getConfigOption_ObjectsLayerColor = function() {
        var text = ('transparent' === state.Bump.config.layerColors.objects ? 'transparent' : '&nbsp;');
        return '<div>'
            +'Objects Layer (Invisible) Color: '
            +'<div style="width: 50px; display: inline-block; background-color: '
                +('transparent' === state.Bump.config.layerColors.objects 
                    ? 'white' 
                    : state.Bump.config.layerColors.objects
                )
            +';">'
                +text
            +'</div> '
            +'<a href="!bump-config --objects-layer-color|?{What aura color for when the master token is invisible? (transparent for none, #RRGGBB for a color)|'+state.Bump.config.layerColors.objects+'}">'
                +'Set Color'
            +'</a>'
        +'</div>';
    },
    getConfigOption_AutoPush = function() {
        var text = (state.Bump.config.autoPush ? 'On' : 'Off' );
        return '<div>'
            +'Auto Push is currently <b>'
                +text
            +'</b> '
            +'<a href="!bump-config --toggle-auto-push">'
                +'Toggle'
            +'</a>'
        +'</div>';
        
    },

    getAllConfigOptions = function() {
        return getConfigOption_GMLayerColor() + getConfigOption_ObjectsLayerColor() + getConfigOption_AutoPush();
    },

    showHelp = function(who) {

        sendChat('','/w '+who+' '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'Bump v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>Bump provides a way to invisibly manipulate tokens on the GM Layer from the Objects Layer, and vice versa.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!bump-slave [--push|--help]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Adds an invisible slave token on the other layer.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--push</span></b> '+ch('-')+' If the selected token is on the Objects Layer, it will be pushed to the GM Layer.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
				+'</li> '
			+'</ul>'
		+'</div>'
    +'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!bump [--help]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Swaps the selected Tokens for their counterparts on the other layer.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
				+'</li> '
			+'</ul>'
		+'</div>'
    +'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!bump-config ['+ch('<')+'Options'+ch('>')+'|--help]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Swaps the selected Tokens for their counterparts on the other layer.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'Options'+ch('>')+'</span></b> '+ch('-')+' Any combination of the below:'
                    +'<ul>'
                        +'<li><b><span style="font-family: serif;">--gm-layer-color|'+ch('<')+'html color|transparent'+ch('>')+'</span></b> '+ch('-')+' Set the aura color for the slave token when it is on the GM Layer (i.e.: the '+ch('"')+'Visible'+ch('"')+' color.)</li>'
                        +'<li><b><span style="font-family: serif;">--objects-layer-color|'+ch('<')+'html color|transparent'+ch('>')+'</span></b> '+ch('-')+' Set the aura color for the slave token when it is on the Objects Layer (i.e.: the '+ch('"')+'Invisible'+ch('"')+' color.)</li>'
                        +'<li><b><span style="font-family: serif;">--toggle-autopush</span></b> '+ch('-')+' Sets whether !bump-slave always forces the master token to the GM Layer.</li>'
                    +'</ul>'
				+'</li> '
			+'</ul>'
		+'</div>'
    +'</div>'
    +getAllConfigOptions()
+'</div>'
        );
    },

    handleInput = function(msg) {
        var args, who;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }
        who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!bump':
                if(!msg.selected || _.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                _.each(msg.selected,function(s){
                    bumpToken(s._id);
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
                    sendChat('','/w '+who+' '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'Bump v'+version
	+'</div>'
    +getAllConfigOptions()
+'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/),
                        msg='';
                    switch(opt.shift()) {
                        case '--gm-layer-color':
                            if(opt[0].match(regex.colors)) {
                               state.Bump.config.layerColors.gmlayer=opt[0];
                            } else {
                                msg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
                            }
                            sendChat('','/w '+who+' '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +msg
                                    +getConfigOption_GMLayerColor()
                                +'</div>'
                            );
                            break;

                        case '--objects-layer-color':
                            if(opt[0].match(regex.colors)) {
                               state.Bump.config.layerColors.objects=opt[0];
                            } else {
                                msg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
                            }
                            sendChat('','/w '+who+' '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +msg
                                    +getConfigOption_ObjectsLayerColor()
                                +'</div>'
                            );
                            break;

                        case '--toggle-auto-push':
                            state.Bump.config.autoPush=!state.Bump.config.autoPush;
                            sendChat('','/w '+who+' '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_AutoPush()
                                +'</div>'
                            );
                            break;
                        default:
                            sendChat('','/w '+who+' '
                                +'<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });

                break;
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:graphic', handleTokenChange);
        on('destroy:graphic', handleRemoveToken);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    Bump.CheckInstall();
    Bump.RegisterEventHandlers();
});
