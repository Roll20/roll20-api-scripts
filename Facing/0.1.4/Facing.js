// Github:   https://github.com/shdwjk/Roll20API/blob/master/Facing/Facing.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Facing = Facing || (function() {
    'use strict';

    var version = '0.1.4',
    lastUpdate = 1559490422,
    schemaVersion = 0.2,
    defaults = {
        image: 'https://s3.amazonaws.com/files.d20.io/images/9183999/XcViJVf7-cGOXcZq1KWp-A/thumb.png?1430541914',
        attributeName: 'facing',
        scale: 2.5
    },

    checkInstall = function() {
        log('-=> Facing v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Facing') || state.Facing.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.Facing && state.Facing.version) {
                
                case 0.1:
                    state.Facing.config.centering = false;
                    /* break; // intentional dropthrough */ /* falls through */


                case 'UpdateSchemaVersion':
                    state.Facing.version = schemaVersion;
                    break;

                default:
                    state.Facing = {
                        version: schemaVersion,
                        config: {
                            image: defaults.image,
                            attributeName: defaults.attributeName,
                            relative: true,
                            scale: defaults.scale,
                            centering: false
                        },
                        ringed: {}
                    };
                    break;
            }
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

    getCleanImgsrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|max)(.*)$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3];
        }
        return;
    },

    getRingedPair = function(id) {
        var ringed;
        _.find(state.Facing.ringed,function(slaveid,masterid){
            if(id === masterid || id === slaveid) {
                ringed = {
                    master: getObj('graphic',masterid),
                    slave: getObj('graphic',slaveid)
                };
                ringed.attribute = findObjs({
                    type: 'attribute',
                    name: state.Facing.config.attributeName,
                    characterid: ringed.master && ringed.master.get('represents')
                })[0] || {set:function(){}};

                return true;
            }
            return false;
        });
        return ringed;
    },

    getRinged = function(id) {
        var ringed;
        _.find(state.Facing.ringed,function(slaveid,masterid){
            if(id === masterid){
                ringed = getObj('graphic',slaveid);
                return true;
            } 
            if(id === slaveid) {
                ringed = getObj('graphic',masterid);
                return true;
            } 
            return false;
        });
        return ringed;
    },


    createRinged = function(id) {
        // get root obj
        var master = getObj('graphic',id),
        slave = getRinged(id),
        layer, dim;

        if(!slave && master) {
            layer=( 'gmlayer' === master.get('layer') ? 'gmlayer' : 'map');
            dim=(Math.max(master.get('height'),master.get('width'))*state.Facing.config.scale);
            slave = createObj('graphic',{
                imgsrc: state.Facing.config.image,
                layer: layer,
                pageid: master.get('pageid'),
                top: master.get('top'),
                left: master.get('left'),
                height: dim,
                width: dim,
                rotation: master.get('rotation')
            });
            master.set({
                rotation: 0
            });

            ( findObjs({
                type: 'attribute',
                name: state.Facing.config.attributeName,
                characterid: master.get('represents')
            })[0] || (master.get('represents') && createObj('attribute',{
                name: state.Facing.config.attributeName,
                characterid: master.get('represents')
            })) || { set: function(){} }).set({
                current: slave.get('rotation')
            });


            if('gmlayer' === layer) {
                toBack(slave);
            } else {
                toFront(slave);
            }
            state.Facing.ringed[master.id]=slave.id;
        }
    },

    removeRinged = function(id) {
        var pair=getRingedPair(id);
        if(pair) {
            if(id === pair.master.id ) {
                pair.slave.remove();
            }
            delete state.Facing.ringed[pair.master.id];
        }
    },

    zeroToken = function(id) {
        var pair=getRingedPair(id);
        if(pair) {
            pair.slave.set({
                rotation: 0
            });
        }
    },

    facingToken = function(id) {
        var pair=getRingedPair(id);
        if(pair) {
            removeRinged(id);
        } else {
            createRinged(id);
        }
    },

    handleRemoveToken = function(obj) {
        // special handling for deleting slaves?
        removeRinged(obj.id);
    },

    handleTokenChange = function(obj,prev) {
        var pair = getRingedPair(obj.id),
        layer,
        dim, rot;
        if(pair) {
            if(pair.master.id === obj.id) {

                let loc = {
                    top: obj.get('top'),
                    left: obj.get('left'),
                    width: obj.get('width'),
                    height: obj.get('height')
                };

                if(state.Facing.config.centering &&
                    ( loc.left !== prev.left || loc.top !== prev.top) &&
                    ( loc.width < 70 || loc.height < 70)
                ){
                    loc.left = loc.left+35-(loc.width/2);
                    loc.top = loc.top+35-(loc.height/2);
                }

                layer=( 'gmlayer' === pair.master.get('layer') ? 'gmlayer' : 'map');
                dim=(Math.max(pair.master.get('height'),pair.master.get('width'))*state.Facing.config.scale);

                rot=pair.master.get('rotation');

                if(rot !== prev.rotation ) {
                    if(state.Facing.config.relative) {
                        rot = (pair.slave.get('rotation') + rot + 360) % 360;
                    } 
                } else {
                    rot = pair.slave.get('rotation');
                }

                pair.attribute.set({
                    current: rot
                });

                pair.slave.set({
                    layer: layer,
                    top: loc.top,
                    left: loc.left,
                    height: dim,
                    width: dim,
                    rotation: rot
                });

                pair.master.set({
                    rotation: 0,
                    top: loc.top,
                    left: loc.left
                });

                if('gmlayer' === layer) {
                    toBack(pair.slave);
                } else {
                    toFront(pair.slave);
                }
            } else {
                pair.slave.set({
                    width: prev.width,
                    height: prev.height,
                    top: prev.top,
                    left: prev.left,
                    layer: prev.layer,
                    flipv: prev.flipv,
                    fliph: prev.fliph
                });

                pair.attribute.set({
                    current: pair.slave.get('rotation')
                });
            }
        }
    },

    getConfigOption_RingImage = function() {
        var text = state.Facing.config.image;
        return '<div>'+
            'Direction Indicator:'+
            '<img src="'+text+'" style="width: 70px; height: 70px;">'+
            '<a href="!facing-config --set-image|&#64;{target|token_id}">'+
                'Pick'+
            '</a>'+
            '<a href="!facing-config --set-image|">'+
                'Default'+
            '</a>'+
        '</div>';
    },
    getConfigOption_AttributeName = function() {
        var text = state.Facing.config.attributeName;
        return '<div>'+
            'Attribute Name to set facing value: <b>'+
                text+
            '</b><a href="!facing-config --set-attribute-name|?{What attribute should the facing be stored in (empty for default):|'+state.Facing.config.attributeName+'}">'+
                'Set Name'+
            '</a>'+
        '</div>';
    },

    getConfigOption_Relative = function() {
        var text = (state.Facing.config.relative ? 'On' : 'Off' );
        return '<div>'+
            'Relative Rotation is currently <b>'+
                text+
            '</b> '+
            '<a href="!facing-config --toggle-relative">'+
                'Toggle'+
            '</a>'+
        '</div>';

    },

    getConfigOption_Scale = function() {
        var text = state.Facing.config.scale;
        return '<div>'+
            'Scale is currently <b>'+
                text+
            '</b> '+
            '<a href="!facing-config --set-scale|?{Scale to adjust Facing Token to (empty for default):|'+state.Facing.config.scale+'}">'+
                'Set'+
            '</a>'+
        '</div>';

    },

    getConfigOption_Centering = function() {
        var text = (state.Facing.config.centering ? 'On' : 'Off' );
        return '<div>'+
            'Centering of small tokens is currently <b>'+
                text+
            '</b> '+
            '<a href="!facing-config --toggle-centering">'+
                'Toggle'+
            '</a>'+
        '</div>';

    },

    getAllConfigOptions = function() {
        return getConfigOption_RingImage()+
            getConfigOption_AttributeName()+
            getConfigOption_Relative()+
            getConfigOption_Scale()+
            getConfigOption_Centering();
    },

    showHelp = function(who) {

        sendChat('','/w "'+who+'" '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Facing v'+version
                +'</div>'
                +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'<p>Facing adds a ring below the selected token with a pointer for the direction the token is facing.  Rotating the token will rotate the ring and then the token will reset to no rotation.  If the token is associated with a character, Facing will maintain an attribute on the character with the current facing stored in it.</p>'
                +'</div>'
            +'<b>Commands</b>'
            +'<div style="padding-left:10px;">'
                +'<b><span style="font-family: serif;">!facing [--help]</span></b>'
                +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Adds or removes the Facing ring below a token.</p>'
                    +'<ul>'
                        +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                            +'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
                        +'</li> '
                    +'</ul>'
                +'</div>'
            +'</div>'
            +'<div style="padding-left:10px;">'
                +'<b><span style="font-family: serif;">!zero [--help]</span></b>'
                +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Aligns the indicator to north.</p>'
                    +'<ul>'
                        +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                            +'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
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

        if (msg.type !== "api" ) {
            return;
        }
        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!facing':
                if(!msg.selected || _.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                _.each(msg.selected,function(s){
                    facingToken(s._id,who);
                });
                break;
            case '!zero':
                if(!msg.selected || _.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                _.each(msg.selected,function(s){
                    zeroToken(s._id,who);
                });
                break;


            case '!facing-config':
                if(!playerIsGM(msg.playerid)) {
                    sendChat('','/w "'+who+'" '
                        +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                            +'<div><b>Error:</b> Only the GM may configure Facing.</div>'
                        +'</div>'
                    );
                    return;
                }
                if(_.contains(args,'--help')) {
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '
                        +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                        +'Facing v'+version
                        +'</div>'
                        +getAllConfigOptions()
                        +'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/),
                    tmp,omsg='';
                    switch(opt.shift()) {

                        case '--set-image':
                            if(opt.length && opt[0].length) {
                                tmp=getObj('graphic',opt[0]);
                                if(tmp && getCleanImgsrc(tmp.get('imgsrc')) ) {
                                    state.Facing.config.image = getCleanImgsrc(tmp.get('imgsrc'));
                                } else {
                                    omsg='<div><b>Error:</b> '+
                                        ( tmp  ? 'Cannot use Marketplace Images.' : 'Not a valid ID: '+opt[0]) +'</div>';
                                }
                            } else {
                                state.Facing.config.image = defaults.image;
                            }
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +omsg
                                    +getConfigOption_RingImage()
                                +'</div>'
                            );
                            break;
                        case '--set-attribute-name':
                            if(opt.length && opt[0].length) {
                                state.Facing.config.attributeName = opt[0];
                            } else {
                                state.Facing.config.attributeName = defaults.attributeName;
                            }
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_AttributeName()
                                +'</div>'
                            );
                            break;

                        case '--toggle-relative':
                            state.Facing.config.relative=!state.Facing.config.relative;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_Relative()
                                +'</div>'
                            );
                            break;

                        case '--toggle-centering':
                            state.Facing.config.centering=!state.Facing.config.centering;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_Centering()
                                +'</div>'
                            );
                            break;

                        case '--set-scale':
                            if(opt.length && opt[0].length) {
                                tmp = parseFloat(opt[0]);
                                if(tmp) {
                                    state.Facing.config.scale = tmp;
                                } else {
                                    omsg='<div><b>Error:</b> Not a valid number: '+opt[0]+'</div>';
                                }
                            } else {
                                state.Facing.config.scale = defaults.scale;
                            }
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +omsg
                                    +getConfigOption_Scale()
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

    Facing.CheckInstall();
    Facing.RegisterEventHandlers();
});


