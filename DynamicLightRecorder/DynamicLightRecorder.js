// Github:    https://github.com/symposion/roll20-api-scripts/   
// By:       Lucian Holland

var DynamicLightRecorder = DynamicLightRecorder || (function() {
    'use strict';

    var version = '0.3',
        schemaVersion = 0.3,
        clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
        
    checkInstall = function() {
        log('-=> DynamicLightRecorder v'+version);
        if( ! _.has(state,'DynamicLightRecorder') || state.DynamicLightRecorder.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.DynamicLightRecorder && state.DynamicLightRecorder.version) {
                case 0.1:
                    _.each(state.DynamicLightRecorder.tilePaths, function(tilePath) {
                        var tileToken = getObj('graphic', tilePath.tileId);
                        if (tileToken) {
                            var controlInfo = _.reduce(tilePath.pathIds, function(controlInfo, pathId) {
                                var path = getObj('path', pathId);
                                if (path && path !== null) {
                                    controlInfo.dlPaths.push(path);
                                }
                            }, { dlPaths: [], doorControl: null});
                            saveControlInfo(tileToken, controlInfo);
                        }
                    });
                    delete state.DynamicLightRecorder.tilePaths;
                case 0.2:
                    state.DynamicLightRecorder.doorControls = {};
                    _.chain(state.DynamicLightRecorder.tileTemplates)
                        .keys()
                        .map(function(imgsrc) {
                            return findObjs({_type: 'graphic', imgsrc:imgsrc, layer:'map', _subtype:'token'});
                        })
                        .flatten()
                        .each(function(graphic) {
                            var cb = graphic.get('controlledby');
                            if (cb && !_.isEmpty(cb)) {
                                var paths = _.chain(cb.split(","))
                                            .map(function(pathId) {
                                                return getObj('path', pathId);
                                            })
                                            .compact()
                                            .value();
                                if (!_.isEmpty(paths)) {
                                    saveControlInfo(graphic, { dlPaths: paths, doorControl: null});
                                }
                            }
                        });
                    state.DynamicLightRecorder.version = schemaVersion3;
                    break;
                default:
                    log('making state object');
                    state.DynamicLightRecorder = {
                        version: schemaVersion,
                        doorControls: {},
                        tileTemplates: {},
                        config: {
                        }
                    };
                    break;
            }
        }
    },
    
    handleInput = function(msg) {
       if (msg.type !== "api" ) {
            return;
        }
        if (msg.content.indexOf('!dl-import') === 0) {
            var restOfString = msg.content.slice('!dl-import'.length).trim();
            var overwrite = false;
            if (restOfString.indexOf('--overwrite') === 0) {
                overwrite = true;
                restOfString = restOfString.slice('--overwrite'.length).trim();
            }
            importTileTemplates(restOfString, overwrite);
            return;
        }
        var args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!dl-attach':
                attach(msg.selected, !_.isEmpty(args) && args.shift() === 'overwrite');
                break;
            case '!dl-door':
                makeDoors(msg.selected);
                break;
            case '!dl-dump':
                sendChat('DynamicLightRecorder', JSON.stringify(state.DynamicLightRecorder));
                break;
            case '!dl-wipe':
                sendChat('DynamicLightRecorder', 'Wiping all data');
                state.DynamicLightRecorder.tilePaths = {};
                state.DynamicLightRecorder.tileTemplates = {};
                state.DynamicLightRecorder.doorControls = {};
                break;
            case '!dl-export':
                var exportObject = {
                    version: schemaVersion,
                    templates: state.DynamicLightRecorder.tileTemplates
                };
                sendChat('DynamicLightRecorder', 'Path export\n' + JSON.stringify(exportObject));
                break;
            default:
            //Do nothing
        }
    },
    
    importTileTemplates = function(jsonString, overwrite) {
        //if(!selection || _.isEmpty(selection) || _.size(selection) !== 1 || selection[0]._type !== 'graphic') {
        //    sendChat('DynamicLightRecorder', 'You must have exactly one token selected to perform an import');
        //    return;
        //}
        //var object = getObj('graphic', selection[0]._id);
        //var jsonString = object.get('gmnotes');
        try {
            var importObject = JSON.parse(jsonString);
            if (!importObject.version || importObject.version !== schemaVersion) {
                sendChat('DynamicLightRecorder', 'Imported templates were generated with schema version [' 
                                                    + importObject.version + '] which is not the same as script schema version ['
                                                    + schemaVersion + ']');
                return;
            }
       
            var overlapKeys = _.chain(importObject.templates)
                        .keys()
                        .intersection(_.keys(state.DynamicLightRecorder.tileTemplates))
                        .value();
            var toImport = overwrite ? importObject.templates : _.omit(importObject.templates, overlapKeys);
            _.extend(state.DynamicLightRecorder.tileTemplates, toImport);
            var message = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">Import completed</div>' +
                            '<p>Total templates in import: <b>' + _.size(importObject.templates) + '</b></p>'
            if (!overwrite) {
                message += '<p> Skipped <b>' + _.size(overlapKeys) + '</b> templates for tiles which already have templates. '
                                                    + 'Rerun with <b>--overwrite</b> to replace these with the imported tiles. '
                                                    + ' See log for more details. </p>';
                log("Skipped template image URLs:");
                _.each(overlapKeys, function(key) { log(key); });
            }
            message += '</div>';
            sendChat('DynamicLightRecorder', message);
           
        }
        catch(e) {
            log(e);
            sendChat('DynamicLightRecorder', 'There was an error trying to read the gmnotes of the selected token - did you paste the JSON text in correctly?');
        }
    },

    makeDoors = function(selection) {
        if (!selection || _.isEmpty(selection)) {
            sendChat('DynamicLightRecord', 'You must have at least one token selected to run !dl-door');
            return;
        }

        _.each(selection, function(object) {
            var object = getObj(object._type, object._id);
            if(object.get('_subtype') === 'token') {
               makeDoor(object); 
            }
        });
        

    },

    makeDoor = function(token) {
        var tokenWidth = token.get('width');
        var dlLineWidth = tokenWidth + 4;
        var centreX = token.get('left');
        var centreY = token.get('top');
        var left = centreX - tokenWidth / 2;

        token.set('layer', 'map');
        var dlPath = createObj('path', {
            pageid: token.get('_pageid'),
            layer: 'walls',
            stroke_width: 1,
            top: centreY,
            left: centreX,
            width: dlLineWidth,
            height: 1,
            path: '[["M",0,0],["L",' + dlLineWidth + ',0]]'
            });
        buildTemplate(token, [dlPath], true);
    },
    
    attach = function(selection, overwrite) {
        
        if (!selection || _.isEmpty(selection) || selection.length < 2) {
            sendChat('DynamicLightRecorder', 'You must have one map tile and at least one path select to run attach');
            return;
        }
        
        
        var objects = _.map(selection, function(object) {
            return getObj(object._type, object._id);
        });
        
        var tiles = [];
        var paths = [];
        _.each(objects, function(object) {
            if(object.get('_type') === 'path') {
                paths.push(object);
            }
            else {
                tiles.push(object);
            }
        });
        
        if (_.isEmpty(tiles) || tiles.length !== 1) {
            sendChat('DynamicLightRecorder', 'You must have exactly one map tile to run attach');
            return;
        }
        
        
        var tile = tiles[0];
        if (tile.get('_subtype') !== 'token' || !tile.get('imgsrc') || tile.get('imgsrc').indexOf('marketplace') === -1 || tile.get('layer') !== 'map') {
            sendChat('DynamicLightRecorder', 'Selected tile must be from marketplace and must be on the map layer.');
            return;
        }
        
        if (state.DynamicLightRecorder.tileTemplates[tile.get('imgsrc')] && !overwrite) {
           sendChat('DynamicLightRecorder', 'Tile already has dynamic lighting paths recorded. Call with --overwrite to replace them');
           return;
        }
        
        buildTemplate(tile, paths, false);
        sendChat("DynamicLightRecorder", "DL paths successfully recorded for map tile");
    },

    buildTemplate = function(tile, paths, isDoor) {
         var template = {
            isDoor: isDoor,  
            top: tile.get('top'),
            left: tile.get('left'),
            width: tile.get('width'),
            height: tile.get('height'),
            flipv: tile.get('flipv'),
            fliph: tile.get('fliph'),
            rotation: tile.get('rotation'),
            paths: _.map(paths, function(path) {
                var savedPath = {
                    path: path.get('_path'),
                    offsetY: path.get('top') - tile.get('top'),
                    offsetX: path.get('left') - tile.get('left'),
                    width: path.get('width'),
                    height: path.get('height'),
                    stroke_width: 1,
                    layer: 'walls'
                };
                path.set('layer', 'walls');
                path.set('stroke_width', 1);
                return savedPath;
            })
        };
        
        state.DynamicLightRecorder.tileTemplates[tile.get('imgsrc')] = template;
        saveTokenPaths(tile, paths);
        if (isDoor) {
            attachDoorControl(tile, template);
        }
    },
    
    attachDoorControl = function(doorToken, template) {
        var tokenWidth = doorToken.get('width');
        var tokenHeight = doorToken.get('height');
        var centreX = doorToken.get('left');
        var centreY = doorToken.get('top');
        var hingeX = centreX - tokenWidth / 2;
        var hingeY = centreY;
        var fliph = (template.fliph !== doorToken.get('fliph'));
        var flipv = (template.flipv !== doorToken.get('flipv'));
        var rotation = doorToken.get('rotation') - template.rotation;
        
        if (fliph || flipv) {
            hingeX = fliph ? tokenWidth - hingeX : hingeX;
            hingeY = fliph ? tokenHeight - hingeY : hingeY;
        }
        
        if (rotation % 360 != 0) {
            var newHinge = rotatePoint([hingeX, hingeY], [centreX, centreY], rotation);
            hingeX = newHinge[0];
            hingeY = newHinge[1];
        }
        
        var control = createObj('graphic', {
            imgsrc: clearURL,
            subtype: 'token',
            pageid: doorToken.get('_pageid'),
            layer: 'objects',
            playersedit_name: false,
            playersedit_bar1: false,
            playersedit_bar2: false,
            playersedit_bar3: false,
            aura1_radius: 0.1,
            rotation:rotation,
            isdrawing:1,
            top:hingeY,
            left: hingeX,
            width: 140,
            height: 140
        });
        var controlInfo = getTokenControlInfo(doorToken);
        controlInfo.doorControl = control;
        saveControlInfo(doorToken, controlInfo);
        state.DynamicLightRecorder.doorControls[control.id] = doorToken.id;
    },
    
    handleNewToken = function(token) {
        var template = state.DynamicLightRecorder.tileTemplates[token.get('imgsrc')];
        if (!template) {
            log('no template found')
            return;
        }
        
        drawTokenPaths(token, template);
        if (template.isDoor) {
            attachDoorControl(token, template);
        }
    },
    
    handleTokenChange = function(token, previous) {
        var template = state.DynamicLightRecorder.tileTemplates[token.get('imgsrc')];
        if (template) {
            deleteTokenPaths(token, function() {
                deleteDoorControls(token);
                drawTokenPaths(token, template);
                if(template.isDoor) {
                    attachDoorControl(token, template)
                }
            }); 
        }
        
        //Check if the changed token is a door control - do we have a door 
        //token keyed off its id in our lookup
        var doorId = state.DynamicLightRecorder.doorControls[token.id];
        var door = getObj('graphic', doorId);
        if (door) {
            var rotation = token.get('rotation') - previous.rotation;
            if (rotation % 360 !== 0) {
                //The control is centred on the hinge of the door
                var hinge = [token.get('left'), token.get('top')];
                var doorCentre = [door.get('left'), door.get('top')];
                var offset = rotatePoint(doorCentre, hinge, rotation);
                
                door.set('left', offset[0]);
                door.set('top', offset[1]);
                door.set('rotation', door.get('rotation') + rotation);
                //Now redraw the door and associate DL paths
                handleTokenChange(door, {});
            }
            //Reset attempts to move the door control away from the door
            else if (token.get('top') !== previous.top || token.get('left') !== previous.left
                    || token.get('width') !== previous.width || token.get('height') !== previous.height) {
                token.set('top', previous.top);
                token.set('left', previous.left);
                token.set('width', previous.width);
                token.set('height', previous.height);
            }
        }
    },
  
    drawTokenPaths = function(token, template) {
        var paths = makeWorkingTemplate(template, token)
            .flip()
            .rotate()
            .scale()
            .buildPaths();
        saveTokenPaths(token, paths);
    },
    
    makeWorkingTemplate = function(template, token) {
        template = _.clone(template);
        template.paths = _.map(template.paths, function(path) {
            path = _.clone(path);
            path.points = JSON.parse(path.path);
            return path;
        });
        
        template.flip = function() {
            var fliph = token.get('fliph'), flipv = token.get('flipv');
            fliph = (fliph !== this.fliph);
            flipv = (flipv !== this.flipv);
            if (fliph || flipv) {
                this.paths = _.map(this.paths, function(path) {
                    path.points = _.map(path.points, function(point) {
                        return [point[0],
                                fliph ? path.width - point[1] : point[1],
                                flipv ? path.height - point[2] : point[2]    
                                ];
                    })
                    path.offsetX = fliph ? 0 - path.offsetX : path.offsetX;
                    path.offsetY = flipv ? 0 - path.offsetY : path.offsetY;
                    return path;
                }.bind(this));
            }
            return this;
        };
        
        template.rotate = function() {
            'use strict';
            var angle = token.get('rotation');
            angle -= this.rotation;
            if (angle % 360 == 0) return this;
            var tokenCentre = [token.get('left'), token.get('top')];
    
            _.each(this.paths, function(path) {
                    
                    var pointsCentre = [path.width/2, path.height/2];
                    
                    var bounds = {
                        xMax: 0,
                        yMax: 0,
                        xMin:Infinity,
                        yMin:Infinity
                    };
                    
                    
                    path.points = _.map(path.points, function(point) {
                            var result = rotatePoint(_.rest(point, 1), pointsCentre, angle);
                            bounds.xMax = Math.max(bounds.xMax, result[0]);
                            bounds.yMax = Math.max(bounds.yMax, result[1]);
                            bounds.xMin = Math.min(bounds.xMin, result[0]);
                            bounds.yMin = Math.min(bounds.yMin, result[1]);
                            result.unshift(point[0]);
                            return result;
                        });
                        
                    _.each(path.points, function(point) {
                            point[1] -= bounds.xMin;
                            point[2] -= bounds.yMin;
                        });
                        
                    path.width = bounds.xMax - bounds.xMin;
                    path.height = bounds.yMax - bounds.yMin;
                    
                    
                    //The bounding box has changed shape, which skews the centre
                    //away from where it would be if we'd just rotated the whole
                    //box as was. Allow for this offset.
                    var newCentreXOffset = (path.width/2 + bounds.xMin)  - pointsCentre[0];
                    var newCentreYOffset = (path.height/2 + bounds.yMin) - pointsCentre[1];
                    
                    var oldCentreRotated = rotatePoint([path.offsetX, path.offsetY], [0,0], angle);
                    
                    path.offsetX = oldCentreRotated[0] + newCentreXOffset;
                    path.offsetY = oldCentreRotated[1] + newCentreYOffset;
                });
            return this;
        };
        
        template.scale = function() {
            var scaleX = token.get('width') / this.width;
            var scaleY = token.get('height') / this.height;
            _.each(this.paths, function(path) {
                path.scaleX = scaleX;
                path.scaleY = scaleY;
                path.offsetX *= scaleX;
                path.offsetY *= scaleY;
            });
            return this;
        }; 
        
        template.buildPaths = function() {
            return _.map(this.paths, function(templatePath) {
                var attributes = _.clone(templatePath);
                attributes.path = JSON.stringify(templatePath.points);
                attributes.pageid = token.get('_pageid');
                attributes.left = token.get('left') + attributes.offsetX;
                attributes.top = token.get('top') + attributes.offsetY;
                return createObj('path', attributes);
            });
        };
        
        template.logme = function() {
            log(this);
            return this;
        };
        
        return template;
    },
    
    rotatePoint = function(point, centre, angle) {
        angle = angle % 360;
        var s = Math.sin(angle * Math.PI / 180.0);
        var c = Math.cos(angle * Math.PI / 180.0);
        // translate point back to origin:
        var x = point[0] - centre[0];
        var y = point[1] - centre[1];
        // rotate point
        var xnew = (x * c) - (y * s);
        var ynew = (x * s) + (y * c);

        // translate point back:
        x = xnew + centre[0];
        y = ynew + centre[1];
        return [x,y];
    },
    
    handleDeleteToken = function(token) {
        deleteTokenPaths(token);
        deleteDoorControls(token);
    },
    
    
    
    getTokenControlInfo = function(token) {
        var controlInfoString = token.get('controlledby');
        var controlInfo = { dlPaths: [], doorControl: null};
        if (controlInfoString && !_.isEmpty(controlInfoString)) {
            var parsedControlInfo = JSON.parse(controlInfoString);
            controlInfo.dlPaths = _.chain(parsedControlInfo.dlPaths)
                .map(function(pathId) {
                    var path = getObj('path', pathId);
                    if (!path) {
                        log('Warning, path with id [' + pathId + '] that should have been attached to token ' + JSON.stringify(token) + ' was not present.');
                    }
                    return path;
                })
                .compact()
                .value();
            
            if (parsedControlInfo.doorControl !== null) {
                var control = getObj('graphic', parsedControlInfo.doorControl);
                   
                if (!control) {
                    log('Warning, control with id [' + parsedControlInfo.doorControl + '] that should have been attached to token ' + JSON.stringify(token) + ' was not present.');
                }
                else {
                    controlInfo.doorControl = control
                }
            }
        }
   
        //Overwrite whatever is in the field in case we've pruned delete paths
        //or the controlInfo was missing.
        saveControlInfo(token, controlInfo);  
       return controlInfo;
    },
    
    
    
    saveTokenPaths = function(token, paths) {
        var controlInfo = getTokenControlInfo(token);
        controlInfo.dlPaths = _.compact(paths);
        saveControlInfo(token, controlInfo);
    },
    
    saveControlInfo = function(token, controlInfo) {
        var json = JSON.stringify(controlInfo, function(key, value) {
            if (key === '') {
                //root object
                return value;
            }
            if (_.isArray(value)) {
                return _.pluck(value, 'id');
            }
            if (typeof value === 'object' && value !== null) {
                return value._id;
            }
            return value;
        });
        token.set("controlledby", json);      
    },
    
    deleteDoorControls = function(token) {
         var controlInfo = getTokenControlInfo(token);
         if (controlInfo.doorControl && !_.isEmpty(controlInfo.doorControl)) {
            controlInfo.doorControl.remove();
            controlInfo.doorControl = null;    
         }     
        saveControlInfo(token, controlInfo);
    },
    
    deleteTokenPaths = function(token, callbackBeforeRemovingFromCanvas) {
        log('deleting paths for token ' + token.id);
        var controlInfo = getTokenControlInfo(token);
        var pathsToDelete =  controlInfo.dlPaths;
        controlInfo.dlPaths = [];
        saveControlInfo(token, controlInfo);
        if (typeof callbackBeforeRemovingFromCanvas === 'function') {
            callbackBeforeRemovingFromCanvas();
        }
        _.invoke(pathsToDelete, 'remove');
    },
    
    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:token', handleTokenChange);
        on('add:token', handleNewToken);
        on('destroy:token', handleDeleteToken);
    };

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall
    };
}());    



on("ready",function(){
    'use strict';

        DynamicLightRecorder.CheckInstall();
        DynamicLightRecorder.RegisterEventHandlers();
});

