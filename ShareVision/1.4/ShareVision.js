// Github:   https://gist.github.com/Kurohyou/7b0c2485972e15520957d4cf16bdd97a
// By:       Scott C. with extreme help from The Aaron, Arcane Scriptomancer and based on The Aaron's Facing script
// Contact:  https://app.roll20.net/users/459831/scott-c

var ShareVision = ShareVision || (function() {
    'use strict';
    
    var visionURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
    schemaVersion = 1.4,
    lastUpdate = 1430571852,
    version = '0.1.4',
    
    checkInstall = function() {
        log('-=> ShareVision v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        log(state.ShareVision);
        if( ! _.has(state,'ShareVision') || state.ShareVision.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.ShareVision && state.ShareVision.version) {
                case 0:
                default:
                    state.ShareVision = {
                        version: schemaVersion,
                        vision: {}
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

    getVisionPair = function(id) {
        var vision;
        _.find(state.ShareVision.vision,function(slaveid,masterid){
            if(id === masterid || id === slaveid) {
                vision = {
                    master: getObj('graphic',masterid),
                    slave: getObj('graphic',slaveid)
                };
                vision.attribute = findObjs({
                    type: 'attribute',
                    name: 'vision',
                    characterid: vision.master && vision.master.get('represents')
                })[0] || {set:function(){}};

                return true;
            }
            return false;
        });
        return vision;
    },

    getVision = function(id) {
        var vision;
        _.find(state.ShareVision.vision,function(slaveid,masterid){
            if(id === masterid){
                vision = getObj('graphic',slaveid);
                return true;
            } 
            if(id === slaveid) {
                vision = getObj('graphic',masterid);
                return true;
            } 
            return false;
        });
        return vision;
    },


    createVision = function(id, overdrive) {
        // get root obj
        var master = getObj('graphic',id),
            slave = getVision(id),
            layer,
            dim;
            //aura = master.get('status_aura');
        //sendChat('', 'vision created ' + 'status_aura' + aura);
            if(!slave && master) {
                if(overdrive){
                    layer=( 'gmlayer' === master.get('layer') ? 'gmlayer' : 'objects');
                    dim=(Math.max(master.get('height'),master.get('width')));
                    slave = createObj('graphic',{
                        imgsrc: visionURL,
                        layer: layer,
                        pageid: master.get('pageid'),
                        top: master.get('top'),
                        left: master.get('left'),
                        height: dim,
                        width: dim,
                        controlledby: 'all',
                        light_hassight: true,
                        light_radius: master.get('light_radius'),
                        light_dimradius: master.get('light_dimradius')});
            
                    if('gmlayer' === layer || 'objects' === layer) {
                        toBack(master);
                    } else {
                        toFront(master);
                    }
                }else{
                    layer=( 'gmlayer' === master.get('layer') ? 'gmlayer' : 'objects');
                    dim=(Math.max(master.get('height'),master.get('width')));
                    slave = createObj('graphic',{
                        imgsrc: visionURL,
                        layer: layer,
                        pageid: master.get('pageid'),
                        top: master.get('top'),
                        left: master.get('left'),
                        height: dim,
                        width: dim,
                        controlledby: 'all',
                        light_hassight: true});
            
                    if('gmlayer' === layer || 'objects' === layer) {
                        toBack(master);
                    } else {
                        toFront(master);
                    }
                }
                
            state.ShareVision.vision[master.id]=slave.id;
            }
    },

    removeVision = function(id) {
        var pair=getVisionPair(id);
        if(pair) {
            if(id === pair.master.id ) {
                pair.slave.remove();
            }
            delete state.ShareVision.vision[pair.master.id];
        }
    },


    shareVisionToken = function(id) {
        var pair=getVisionPair(id);
        if(pair) {
            removeVision(id);
        } else {
            createVision(id);
        }
    },

    handleRemoveToken = function(obj) {
        // special handling for deleting slaves?
        removeVision(obj.id);
    },
    
    markerState = function(obj){
        var aura = obj.get('status_aura'),
            overdrive = obj.get('status_overdrive');
        if(aura || overdrive){
            createVision(obj.id, overdrive);
        }else {
            removeVision(obj.id);
        }
    },
    
    handleTokenChange = function(obj,prev) {
        var pair = getVisionPair(obj.id),
        layer,
        dim;
            if(pair) {
                if(pair.master.id === obj.id) {
                    layer=( 'gmlayer' === pair.master.get('layer') ? 'gmlayer' : 'objects');
                    dim=(Math.max(pair.master.get('height'),pair.master.get('width')));
                    pair.slave.set({
                        layer: layer,
                        top: pair.master.get('top'),
                        left: pair.master.get('left'),
                        height: dim,
                        width: dim
                    });
                    if('gmlayer' === layer || 'objects' === layer) {
                        toBack(pair.slave);
                    } 
                    else {
                        toFront(pair.slave);
                    }
                } 
                else {
                    pair.slave.set({
                        width: prev.width,
                        height: prev.height,
                        top: prev.top,
                        left: prev.left,
                        layer: prev.layer,
                        flipv: prev.flipv,
                        fliph: prev.fliph
                    });
                }
            }
    },

    registerEventHandlers = function() {
        on('change:graphic:statusmarkers', markerState);
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
    ShareVision.CheckInstall();
    ShareVision.RegisterEventHandlers();
});