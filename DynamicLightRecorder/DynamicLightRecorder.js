// Github:    https://github.com/symposion/roll20-api-scripts/   
// By:       Lucian Holland

var DynamicLightRecorder = DynamicLightRecorder || (function() {
    'use strict';
    
    var version = '0.7',
    schemaVersion = 0.5,
    clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
    myState = state.DynamicLightRecorder,
    module = {
        checkInstall: function() {
            logger.info('-=> DynamicLightRecorder v$$$ <=-', version);
            if( ! _.has(state,'DynamicLightRecorder') || state.DynamicLightRecorder.version !== schemaVersion) {
                logger.info('  > Updating Schema to v$$$ <', schemaVersion);
                switch(myState && myState.version) {
                    case 0.1:
                        _.each(myState.tilePaths, function(tilePath) {
                            var tileToken = getObj('graphic', tilePath.tileId);
                            if (tileToken) {
                                var controlInfo = _.reduce(tilePath.pathIds, function(controlInfo, pathId) {
                                    var path = getObj('path', pathId);
                                    if (path && path !== null) {
                                        controlInfo.dlPaths.push(path);
                                    }
                                }, { dlPaths: [], doorControl: null});
                                this.saveControlInfo(tileToken, controlInfo);
                            }
                        });
                        delete myState.tilePaths;
                    case 0.2:
                        myState.doorControls = {};
                        _.chain(myState.tileTemplates)
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
                                        this.saveControlInfo(graphic, { dlPaths: paths, doorControl: null});
                                    }
                                }
                            });
                    case 0.3:
                        _.each(myState.tileTemplates, function(template) {
                            if (template.isDoor) {
                                delete template.isDoor;
                                var hingeOffset = [-(template.width/2), 0];
                                template.doorDetails = { type:'indirect', offset:hingeOffset};
                            }
                        });
                    case 0.4:
                        myState.config.logLevel = logger.INFO;
                        myState.version = schemaVersion;
                        break;
                    default:
                        state.DynamicLightRecorder = {
                            version: schemaVersion,
                            doorControls: {},
                            tileTemplates: {},
                            config: {
                                logLevel: logger.INFO
                            }
                        };
                        myState = state.DynamicLightRecorder;
                        logger.info('Making new state object $$$', myState);
                        break;
                }
            }
        },
        
        handleInput: function(msg) {
           if (msg.type !== "api" ) {
                return;
            }
            try {
                var args = msg.content.split(/\s+--/);
                switch(args.shift()) {
                    case '!dl-import':
                        if(!_.isEmpty(args)) {
                            var overwrite = (args[0] === 'overwrite');
                            args = overwrite ? args.slice(1) : args;
                            if(!_.isEmpty(args)) {
                                //Just in case the import string happens to contain a -- that has
                                //been accidentially split :-(
                                this.importTileTemplates(args.join(' --'), overwrite);
                                return;
                            }
                        }
                        report('No import JSON specified');
                        break;
                    case '!dl-attach':
                        this.attach(this.processSelection(msg, {
                            graphic: {min:1, max:1},
                            path: {min:1, max:Infinity}
                        }), !_.isEmpty(args) && args.shift() === 'overwrite');
                        break;
                    case '!dl-door':
                        var objects = this.processSelection(msg, {
                            graphic: {min:1, max:1},
                            path: {min: 0, max:1}
                        });
                        this.makeDoor(objects.graphic, objects.path);
                        break;
                    case '!dl-directDoor':
                        this.makeDirectDoor(this.processSelection(msg, {
                            graphic: {min:1, max:1}
                        }).graphic);
                        break;
                    case '!dl-dump':
                        logger.info(myState);
                        //sendChat('DynamicLightRecorder', JSON.stringify(state.DynamicLightRecorder));
                        break;
                    case '!dl-wipe':
                        report('Wiping all data');
                        myState.tileTemplates = {};
                        myState.doorControls = {};
                        break;
                    case '!dl-export':
                        this.export(this.processSelection(msg, {
                            graphic: {min:0, max:Infinity}
                        }).graphic);
                        break;
                    case '!dl-redraw':
        				this.redraw(this.processSelection(msg, {
                            graphic: {min:0, max:Infinity}
                        }).graphic);
        				break;
                    case '!dl-setLogLevel':
                        var newLogLevel = logger[args.shift()];
                        myState.config.logLevel = newLogLevel || myState.config.logLevel;
                    default:
                    //Do nothing
                }
            }
            catch(e) {
                if (typeof e === 'string') {
                    report('An error occurred: ' + e);
                    logger.error("Error: $$$", e)
                }
                else {
                    logger.error('Error: ' +  e.toString());
                    report('An error occurred. Please see the log for more details.');
                }
            }
            finally {
                logger.prefixString = '';
            }
        },
        
        processSelection: function(msg, constraints) {
            var selection = msg.selected ? msg.selected : [];
            return _.reduce(constraints, function(result, constraintDetails, type) {
                var objects = _.chain(selection)
                                    .where({_type: type})
                                    .map(function(selected) {
                                        return getObj(selected._type, selected._id);
                                    })
                                    .compact()
                                    .value();
                if (_.size(objects) < constraintDetails.min || _.size(objects) > constraintDetails.max) {
                    throw ('Wrong number of objects of type [' + type + '] selected, should be between ' + constraintDetails.min + ' and ' + constraintDetails.max);
                }
                switch(_.size(objects)) {
                    case 0:
                        break;
                    case 1:
                        if (constraintDetails.max === 1) {
                            result[type] = objects[0];
                        }
                        else {
                            result[type] = objects;
                        }
                        break;
                    default:
                        result[type] = objects;
                }
                return result;
            }, {});
        },
        
        export: function(graphics) {
            var exportObject = {
                version: schemaVersion,
                templates: myState.tileTemplates
            };
            
            if (graphics && !_.isEmpty(graphics)) {
                exportObject.templates = _.pick(exportObject.templates, 
                                                _.map(graphics, function(graphic) {
                                                    return graphic.get('imgsrc');
                                                })
                                            );
            }
            report('Path export\n' + JSON.stringify(exportObject));        
        },
        
        redraw: function(objects) {
            if (!_.isEmpty(objects)) {
    		    _.chain(objects)
    				.filter(function(object) {
    					return object.get('layer') === 'map' && myState.tileTemplates[object.get('imgsrc')];
    				})
    				.each(function(tile) {
    					this.handleTokenChange(tile);
    				});
    		}
    		else {
    			_.chain(myState.tileTemplates)
    	                .keys()
    	                .map(function(imgsrc) {
    	                    return findObjs({_type: 'graphic', imgsrc:imgsrc, _subtype:'token'});
    	                })
    	                .flatten()
    	                .each(function(graphic) {
    				    	this.handleTokenChange(graphic);	
    				    });
    		}
    	},
    
        importTileTemplates: function(jsonString, overwrite) {
            try {
                var importObject = JSON.parse(jsonString);
                if (!importObject.version || importObject.version !== schemaVersion) {
                    report('Imported templates were generated with schema version [' 
                            + importObject.version + '] which is not the same as script schema version ['
                                + schemaVersion + ']');
                    return;
                }
           
                var overlapKeys = _.chain(importObject.templates)
                            .keys()
                            .intersection(_.keys(myState.tileTemplates))
                            .value();
                var toImport = overwrite ? importObject.templates : _.omit(importObject.templates, overlapKeys);
                _.extend(myState, toImport);
                var message = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">Import completed</div>' +
                                '<p>Total templates in import: <b>' + _.size(importObject.templates) + '</b></p>'
                if (!overwrite) {
                    message += '<p> Skipped <b>' + _.size(overlapKeys) + '</b> templates for tiles which already have templates. '
                                                        + 'Rerun with <b>--overwrite</b> to replace these with the imported tiles. '
                                                        + ' See log for more details. </p>';
                    logger.info("Skipped template image URLs: $$$", overlapKeys);
                }
                message += '</div>';
                report(message);
               
            }
            catch(e) {
                logger.error(e);
                report('There was an error trying to read the supplied JSON text, see the log for more details');
            }
        },
        
        makeBoundingBox: function(object) {
            return {
                left: object.get('left'),
                top: object.get('top'),
                width: object.get('width'),
                height: object.get('height')
            };
        },
        
        //Make a normal door with a transparent control token
        makeDoor: function(doorToken, doorBoundsPath) {
            var doorBoundingBox = doorBoundsPath ? this.makeBoundingBox(doorBoundsPath) : this.makeBoundingBox(doorToken);
            var template = this.makeDoorTemplate(doorToken, doorBoundingBox);
            var hinge = [doorBoundingBox.left - (doorBoundingBox.width/2), doorBoundingBox.top];
            var hingeOffset = [hinge[0] - doorToken.get('left'), hinge[1] - doorToken.get('top')];
            template.doorDetails = {type: 'indirect', offset: hingeOffset};
            
            this.makeTemplateWrapper(template, doorToken).setUpNewDoorControls();
            if (doorBoundsPath) {
                doorBoundsPath.remove();
            }
            report('Door created successfully');
        },
        
        makeDirectDoor: function(token) {
            var doorBoundingBox = {
                left: token.get('left') - (token.get('width')/4),
                top: token.get('top'),
                width: token.get('width')/2,
                height: token.get('height')
            };
            
            var template = this.makeDoorTemplate(token, doorBoundingBox);
            template.doorDetails = {type: 'direct'};
            
            this.setupDirectDoorPlaceholder(token);
            report('Direct control door created successfully');
        },
        
        setupDirectDoorPlaceholder: function(token) {
            //With a direct door, the original graphic becomes the control
            //token and we place a placeholder on the map layer instead
            token.set('layer', 'objects');
            token.set('aura1_radius', 0.1);
            token.set('isdrawing', 1);
            
            var placeholder = createObj('graphic', {
                    imgsrc: clearURL,
                    subtype: 'token',
                    pageid: token.get('_pageid'),
                    layer: 'map',
                    playersedit_name: false,
                    playersedit_bar1: false,
                    playersedit_bar2: false,
                    playersedit_bar3: false,
                    rotation:token.get('rotation'),
                    isdrawing:1,
                    top:token.get('top'),
                    left: token.get('left'),
                    width: token.get('width'),
                    height: token.get('height'),
                    controlledby: token.get('controlledby')
                });
           
            token.set('controlledby', '');
            var controlInfo = this.getTokenControlInfo(placeholder);
            controlInfo.doorControl = token;
            this.saveControlInfo(placeholder, controlInfo);
            myState.doorControls[token.id] = placeholder.id;    
        },
    
        makeDoorTemplate: function(token, doorBoundingBox) {
            var doorWidth = doorBoundingBox.width;
            var dlLineWidth = doorWidth + 4;
            
            token.set('layer', 'map');
            var dlPath = createObj('path', {
                pageid: token.get('_pageid'),
                layer: 'walls',
                stroke_width: 1,
                top: doorBoundingBox.top,
                left: doorBoundingBox.left,
                width: dlLineWidth,
                height: 1,
                path: '[["M",0,0],["L",' + dlLineWidth + ',0]]'
                });
            return this.buildTemplate(token, [dlPath]);
        },
        
        attach: function(selection, overwrite) {
            
            var tile = selection.graphic;
            if (tile.get('_subtype') !== 'token' || !tile.get('imgsrc') || tile.get('imgsrc').indexOf('marketplace') === -1 || tile.get('layer') !== 'map') {
                report('Selected tile must be from marketplace and must be on the map layer.');
                return;
            }
            
            if (myState.tileTemplates[tile.get('imgsrc')] && !overwrite) {
               report('Tile already has dynamic lighting paths recorded. Call with --overwrite to replace them');
               return;
            }
            
            this.buildTemplate(tile, selection.path);
            report("DL paths successfully recorded for map tile");
        },
    
        buildTemplate: function(tile, paths) {
             var template = {
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
            
            myState.tileTemplates[tile.get('imgsrc')] = template;
            this.saveTokenPaths(tile, paths);
            return template;
        },
        
        
     
        handleNewToken: function(token) {
            var template = myState.tileTemplates[token.get('imgsrc')];
            if (!template) {
                return;
            }
            
            this.makeTemplateWrapper(template,token)
                .reDrawDLPaths()
                .setUpNewDoorControls();
            
        },
        
        
        
        handleTokenChange: function(token, previous) {
            var template = myState.tileTemplates[token.get('imgsrc')];
            
            if (template) {
                if (template.doorDetails && template.doorDetails.type === 'direct') {
                    //With direct doors, it's the actual door graphic that
                    //sits on the token layer and acts as the control directly
                    //Door controls should only be rotated, never moved, so process
                    //accordingly
                    var placeholderId = myState.doorControls[token.id];
                    var placeholder = getObj('graphic', placeholderId);
                    if(!previous) {
                        //Triggered as part of a global redraw, don't need
                        //to deal with the door control moving, but we should
                        //redraw all the DL paths
                        this.makeTemplateWrapper(template, placeholder).reDrawDLPaths();
                    }
                    else {
                        this.doorControlMoved(token, placeholder, previous);
                    }
                }
                else {
                    //This is a map token (indirect door or normal map tile)
                    //that has moved, we need to update the DL paths and move
                    //any corresponding door controls.
                    this.makeTemplateWrapper(template, token)
                        .reDrawDLPaths()
                        .positionDoorControls(); 
                }
                
            }
            else if (token.get('imgsrc') === clearURL){
                //This might either be an indirect door control token,
                //or a placeholder on the map layer for a direct door.
                
                var doorId = myState.doorControls[token.id];
                var door = getObj('graphic', doorId);
                if (door) {
                    if (token.get('layer') !== 'objects') {
                        throw "Error, found a door control that wasn't on the objects layer! " + JSON.stringify(token);
                    }
                    template = myState.tileTemplates[door.id];
                    this.doorControlMoved(token, door, previous);
                    
                }
                else if (token.get('layer') === 'map') {
                    //This might be a placeholder for a direct door
                    var controlInfo = this.getTokenControlInfo(token);
                    if (controlInfo) {
                        if (controlInfo.doorControl) {
                            template = myState.tileTemplates[controlInfo.doorControl.get('imgsrc')];
                            this.makeTemplateWrapper(template, token)
                                .reDrawDLPaths()
                                .positionDoorControls(); 
                        }
                    }
                }
                
                
            }
    
        },
      
        doorControlMoved: function(control, door, previous) {
            
            var rotation = control.get('rotation') - previous.rotation;
            if (rotation % 360 !== 0) {
                //The control is centred on the hinge of the door
                var hinge = [control.get('left'), control.get('top')];
                var doorCentre = [door.get('left'), door.get('top')];
                var offset = this.rotatePoint(doorCentre, hinge, rotation);
                
                door.set('left', offset[0]);
                door.set('top', offset[1]);
                door.set('rotation', door.get('rotation') + rotation);
                //Now redraw the door and associate DL paths
                this.handleTokenChange(door);
            }
            //Reset attempts to move the door control away from the door
            else if (control.get('top') !== previous.top || control.get('left') !== previous.left
                    || control.get('width') !== previous.width || control.get('height') !== previous.height
                    || control.get('fliph') !== previous.fliph || control.get('flipv') !== previous.flipv) {
                control.set('top', previous.top);
                control.set('left', previous.left);
                control.set('width', previous.width);
                control.set('height', previous.height);
                control.set('fliph', previous.fliph);
                control.set('flipv', previous.flipv);
            }
        },
        
        makeTemplateWrapper: function(template, token) {
            template = _.clone(template);
            template.paths = _.map(template.paths, function(path) {
                path = _.clone(path);
                path.points = JSON.parse(path.path);
                return path;
            });
            template.doorDetails = _.clone(template.doorDetails);
            if(template.doorDetails) {
                template.doorDetails.offset = _.clone(template.doorDetails.offset);
            }
            
            var module = this,
            flip = function() {
                var fliph = token.get('fliph'), flipv = token.get('flipv');
                fliph = (fliph !== template.fliph);
                flipv = (flipv !== template.flipv);
                if (fliph || flipv) {
                    template.paths = _.map(template.paths, function(path) {
                        path.points = _.map(path.points, function(point) {
                            return [point[0],
                                    fliph ? path.width - point[1] : point[1],
                                    flipv ? path.height - point[2] : point[2]    
                                    ];
                        })
                        path.offsetX = fliph ? 0 - path.offsetX : path.offsetX;
                        path.offsetY = flipv ? 0 - path.offsetY : path.offsetY;
                        return path;
                    }.bind(template));
                    if (template.doorDetails && template.doorDetails.offset) {
                        template.doorDetails.offset[0] = fliph ? 0 - template.doorDetails.offset[0] : template.doorDetails.offset[0];
                        template.doorDetails.offset[1] = fliph ? 0 - template.doorDetails.offset[1] : template.doorDetails.offset[1];
                    }
                    template.fliph = fliph;
                    template.flipv = flipv;
                }
            },
            
            rotate = function() {
                'use strict';
                var angle = token.get('rotation');
                angle -= template.rotation;
                if (angle % 360 == 0) return;
                
                _.each(template.paths, function(path) {
                        
                        var pointsCentre = [path.width/2, path.height/2];
                        
                        var bounds = {
                            xMax: 0,
                            yMax: 0,
                            xMin:Infinity,
                            yMin:Infinity
                        };
                        
                        
                        path.points = _.map(path.points, function(point) {
                                var result = module.rotatePoint(_.rest(point, 1), pointsCentre, angle);
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
                        
                        var oldCentreRotated = module.rotatePoint([path.offsetX, path.offsetY], [0,0], angle);
                        
                        path.offsetX = oldCentreRotated[0] + newCentreXOffset;
                        path.offsetY = oldCentreRotated[1] + newCentreYOffset;
                    });
                    
                if (template.doorDetails && template.doorDetails.offset) {
                    template.doorDetails.offset = module.rotatePoint(template.doorDetails.offset, [0, 0], angle);
                }
                template.rotation = token.get('rotation');
            },
            
            scale = function() {
                var scaleX = token.get('width') / template.width;
                var scaleY = token.get('height') / template.height;
                
                _.each(template.paths, function(path) {
                    _.each(path.points, function(point) {
                        point[1] *= scaleX;
                        point[2] *= scaleY;
                    });
                    
                    path.offsetX *= scaleX;
                    path.offsetY *= scaleY;
                    path.width *= scaleX;
                    path.height *= scaleY;
                });
                
                if (template.doorDetails && template.doorDetails.offset) {
                    template.doorDetails.offset[0] *= scaleX;
                    template.doorDetails.offset[1] *= scaleY;
                }
                
                template.width = token.get('width');
                template.height = token.get('height');
            },
            
            buildPaths = function() {
                return _.map(template.paths, function(templatePath) {
                    var attributes = _.clone(templatePath);
                    attributes.path = JSON.stringify(templatePath.points);
                    attributes.pageid = token.get('_pageid');
                    attributes.left = token.get('left') + attributes.offsetX;
                    attributes.top = token.get('top') + attributes.offsetY;
                    return createObj('path', attributes);
                });
            },
            
            alignWithToken = function() {
                logger.debug('Adjusting template wrapper to match token $$$', token);
                logme();
                scale();
                logme();
                flip();
                logme();
                rotate();
                logme();
                logger.debug('Done adjusting template wrapper');
            },
            
            reDrawDLPaths = function() {
                alignWithToken();
                module.deleteTokenPaths(token, function(){
                    var paths = buildPaths();
                    module.saveTokenPaths(token, paths);
                });
                return this;
            },
            
            positionDoorControls = function() {
                alignWithToken();
                if (!template.doorDetails) return;
                if (template.doorDetails.type === 'direct') {
                    //Move control token to match placeholder - they are 
                    //the same size and shape so this is easy
                    var placeholder = token;
                    var controlInfo = getTokenControlInfo(placeholder);
                    var control = controlInfo.doorControl;
        
                    control.set('width', placeholder.get('width'));
                    control.set('height', placeholder.get('height'));
                    control.set('rotation', placeholder.get('rotation'));
                    control.set('top', placeholder.get('top'));
                    control.set('left', placeholder.get('left'));
                    control.set('fliph', placeholder.get('fliph'));
                    control.set('flipv', placeholder.get('flipv'));
                }
                else {
                    //Easier just to redraw and start again in this case
                    module.deleteDoorControls(token);
                    this.setUpNewDoorControls();
                }
            },
            
            setUpNewDoorControls = function() {
                alignWithToken();
                if(template.doorDetails) {
                    if (template.doorDetails.type === 'direct') {
                        module.setupDirectDoorPlaceholder(token);
                    }
                    else {
                        var control = createObj('graphic', {
                            imgsrc: clearURL,
                            subtype: 'token',
                            pageid: token.get('_pageid'),
                            layer: 'objects',
                            playersedit_name: false,
                            playersedit_bar1: false,
                            playersedit_bar2: false,
                            playersedit_bar3: false,
                            aura1_radius: 0.1,
                            rotation:template.rotation,
                            isdrawing:1,
                            top: token.get('top') + template.doorDetails.offset[1],
                            left: token.get('left') + template.doorDetails.offset[0],
                            width: 140,
                            height: 140
                        });
                        var controlInfo = module.getTokenControlInfo(token);
                        controlInfo.doorControl = control;
                        module.saveControlInfo(token, controlInfo);
                        myState.doorControls[control.id] = token.id;
                    }
                }
            },
    
            
            logme = function() {
                logger.debug(template);
            };
            
            template.setUpNewDoorControls = logger.wrapFunction('setUpNewDoorControls',setUpNewDoorControls);
            template.positionDoorControls = logger.wrapFunction('positionDoorControls',positionDoorControls);
            template.reDrawDLPaths = logger.wrapFunction('reDrawDLPaths',reDrawDLPaths);
            
            return template;
        },
        
        rotatePoint: function(point, centre, angle) {
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
        
        handleDeleteToken: function(token) {
            if (myState.tileTemplates[token.get('imgsrc')]) {
                this.deleteTokenPaths(token);
                this.deleteDoorControls(token);
            }   
        },
        
        
        
        getTokenControlInfo: function(token) {
            var controlInfoString = token.get('controlledby');
            var controlInfo = { dlPaths: [], doorControl: null};
            if (controlInfoString && !_.isEmpty(controlInfoString)) {
                var parsedControlInfo = JSON.parse(controlInfoString);
                controlInfo.dlPaths = _.chain(parsedControlInfo.dlPaths)
                    .map(function(pathId) {
                        var path = getObj('path', pathId);
                        if (!path) {
                            logger.warn('Warning, path with id [$$$] that should have been attached to token $$$ was not present.', pathId, token);
                        }
                        return path;
                    })
                    .compact()
                    .value();
                
                if (parsedControlInfo.doorControl !== null) {
                    var control = getObj('graphic', parsedControlInfo.doorControl);
                       
                    if (!control) {
                        log.warn('Warning, control with id [$$$] that should have been attached to token $$$ was not present.', parsedControlInfo.doorControl, token);
                    }
                    else {
                        controlInfo.doorControl = control
                    }
                }
            }
       
            //Overwrite whatever is in the field in case we've pruned delete paths
            //or the controlInfo was missing.
            this.saveControlInfo(token, controlInfo);  
           return controlInfo;
        },
        
        
        
        saveTokenPaths: function(token, paths) {
            var controlInfo = this.getTokenControlInfo(token);
            controlInfo.dlPaths = _.compact(paths);
            this.saveControlInfo(token, controlInfo);
        },
        
        saveControlInfo: function(token, controlInfo) {
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
        
        deleteDoorControls: function(token) {
             var controlInfo = this.getTokenControlInfo(token);
             if (controlInfo.doorControl && !_.isEmpty(controlInfo.doorControl)) {
                controlInfo.doorControl.remove();
                controlInfo.doorControl = null;    
             }     
           this.saveControlInfo(token, controlInfo);
        },
        
        deleteTokenPaths: function(token, callbackBeforeRemovingFromCanvas) {
            var controlInfo = this.getTokenControlInfo(token);
            var pathsToDelete =  controlInfo.dlPaths;
            controlInfo.dlPaths = [];
            this.saveControlInfo(token, controlInfo);
            if (typeof callbackBeforeRemovingFromCanvas === 'function') {
                callbackBeforeRemovingFromCanvas.call(this);
            }
            _.invoke(pathsToDelete, 'remove');
        }
    };
    
    
    var report = function(msg) {
        //Horrible bug with this at the moment - seems to generate spurious chat
        //messages when noarchive:true is set
        //sendChat('DynamicLightRecorder', '' + msg, null, {noarchive:true});
        sendChat('DynamicLightRecorder', '/w gm ' + msg);
    },
    
    logger = (function() {
        var logger = {
            OFF: 0,
            ERROR: 1,
            WARN:2,
            INFO:3,
            DEBUG: 4,
            TRACE: 5,
            prefixString: ''
        };
        
        var stringify = function(object) {
            return (typeof object === 'string' ? object : JSON.stringify(object));
        }
        
        var outputLog = function(level, message) {
            
            if(level > myState.config.logLevel) return;
            
            var args = arguments.length > 2 ? _.toArray(arguments).slice(2) : [];
            message = stringify(message);
    
            message = message.replace(/\$\$\$/g, function() {
                return stringify(args.shift());
            });
            log('DynamicLightRecorder ' + Date.now() + ': ' + (myState.config.logLevel == logger.TRACE ? logger.prefixString : '') +  message);
        };
        
        _.each(logger, function(level, levelName) {
            logger[levelName.toLowerCase()] = _.partial(outputLog.bind(logger), level);
        });
        
        logger.wrapModule = function(module) {
            _.chain(module)
                .functions()
                .each(function(funcName){
                    var origFunc = module[funcName];
                    module[funcName] = this.wrapFunction(funcName, origFunc);
                }.bind(this));
        };
        
        logger.wrapFunction = function(name, func) {
            return function() {   
                
                logger.trace(name + ' starting with args $$$', arguments);
                logger.prefixString = logger.prefixString + '  ';
                var retVal = func.apply(this, arguments);
                logger.prefixString = logger.prefixString.slice(0, -2);
                logger.trace(name + ' end');
                
                return retVal;
            };    
        };
        return logger;
    })(),
    
    registerEventHandlers = function() {
        on('chat:message', module.handleInput.bind(module));
        on('change:token', module.handleTokenChange.bind(module));
        on('add:token', module.handleNewToken.bind(module));
        on('destroy:token', module.handleDeleteToken.bind(module));
    };
    
    logger.wrapModule(module);
    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: module.checkInstall.bind(module)
    };
}());    



on("ready",function(){
    'use strict';
        DynamicLightRecorder.CheckInstall();
        DynamicLightRecorder.RegisterEventHandlers();
});




