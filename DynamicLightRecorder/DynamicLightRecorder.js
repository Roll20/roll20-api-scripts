// Github:    https://github.com/symposion/roll20-api-scripts/   
// By:       Lucian Holland

var DynamicLightRecorder = DynamicLightRecorder || (function() {
    'use strict';
    
    var version = '0.9',
    schemaVersion = 0.6,
    clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
    dummyDoorURL = 'https://s3.amazonaws.com/files.d20.io/images/16153846/MUP9-gWjKpFgoUwFCRy8Vg/thumb.png?1455099323',
    myState = state.DynamicLightRecorder,
    getObjectMapper = function(type, notFoundCallback) {
        return function(id) {
            if (!id) return;
            var object = getObj(type, id);
            if (!object && (typeof notFoundCallback ==='function')) notFoundCallback(id, type);
            return object;
        };
    },
    
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
                                                .map(getObjectMapper('path'))
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
                    case 0.5:
                        _.each(myState.doorControls, function(doorId, controlId) {
                            var door = getObj('graphic', doorId);
                            var control = getObj('graphic', controlId);
                            if (door && control) {
                                var type = control.get('imgsrc') === clearURL ? 'doorControl' : 'directDoorl';
                                control.set('gmnotes'), 'DynamicLightData:' + JSON.stringify({type:type, door:doorId});
                            }
                        });
                        delete myState.doorControls;
                        _.chain(myState.tileTemplates)
                            .keys()
                            .map(function(imgsrc) {
                                return findObjs({_type:'graphic', layer:'map', imgsrc:imgsrc});
                            })
                            .tap(function(tokens) {
                                tokens.push(findObjs({type:'graphic', layer:'map', imgsrc:clearURL}));
                            })
                            .flatten()
                            .each(function(token) {
                                var cb = token.get('controlledby');
                                try {
                                    var controlInfo = JSON.parse(cb);
                                    if (controlInfo && controlInfo.dlPaths) {
                                        var newData = {dlPaths:controlInfo.dlPaths, type:'mapTile'};
                                        if (controlInfo.doorControl) {
                                            newData.type = (token.get('imgsrc') === clearURL) ? 'directDoorPlaceholder' : 'indirectDoor';
                                            newData.doorControl = controlInfo.doorControl;
                                        }
                                        token.set('gmnotes', 'DynamicLightData:' + JSON.stringify(newData));
                                        token.set('controlledby', '');
                                    }
                                }
                                catch(e) {}
                            });
                        myState.version = schemaVersion;
                        break;
                    default:
                        state.DynamicLightRecorder = {
                            version: schemaVersion,
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
                        this.wipe(this.processSelection(msg, {
                            graphic: {min:0, max:Infinity}
                        }).graphic, args.shift() === 'confirm');
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
                        report("Log level is now " + logger.getLabel(myState.config.logLevel));
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
        
        wipe: function(graphics, confirm) {
            var module = this;
            if (graphics) {
                _.each(graphics, function(graphic) {
                    var controlInfo = module.getControlInfoObject(graphic);
                    if (controlInfo) {
                        controlInfo.wipeTemplate();
                    }
                });
            }
            else if (!confirm){
                report('You are about to wipe all of your stored templates, are you *really* sure you want to do this? [Confirm](!dl-wipe --confirm)');
            }
            else {
                myState.tileTemplates = {};
                report('All your dynamic lighting templates have been wiped');
            }
        },
        
        export: function(graphics) {
            var module = this;
            var exportObject = {
                version: schemaVersion,
                templates: myState.tileTemplates
            };
            
            if (graphics && !_.isEmpty(graphics)) {
                exportObject.templates = _.pick(exportObject.templates, 
                                                _.map(graphics, function(graphic) {
                                                    var controlInfo = module.getControlInfoObject(graphic);
                                                    return controlInfo.getImageURL();
                                                })
                                            );
            }
            report(JSON.stringify(exportObject));        
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
            this.getControlInfoObject(tile).onAdded();
            
            report("DL paths successfully recorded for map tile");
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
            
            this.getControlInfoObject(doorToken).onAdded();
            
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
            this.getControlInfoObject(token).onAdded();
            
            report('Direct control door created successfully');
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
                    return {
                        path: path.get('_path'),
                        offsetY: path.get('top') - tile.get('top'),
                        offsetX: path.get('left') - tile.get('left'),
                        width: path.get('width'),
                        height: path.get('height'),
                        stroke_width: 1,
                        layer: 'walls'
                    };
                })
            };
            
            myState.tileTemplates[tile.get('imgsrc')] = template;
            //These will get redrawn on the walls layer later.
            _.invoke(paths, 'remove');
            return template;
        },
        
        
     
        handleNewToken: function(token) {
            logger.debug('New token: $$$', token);
            var controlInfo = this.getControlInfoObject(token);
            if (!controlInfo) {
                return;
            }
            controlInfo.onAdded();
        },
        
        
        
        handleTokenChange: function(token, previous) {
            logger.debug('Changed token $$$ from $$$', token, previous);
            if (previous && previous.gmnotes.indexOf('DynamicLightData') === 0 && previous.gmnotes !== token.get('gmnotes')) {
                token.set('gmnotes', previous.gmnotes);
            }
            var controlInfo = this.getControlInfoObject(token);
            if (!controlInfo) return;
            controlInfo.onChange(previous);
        },
        
        handleDeleteToken: function(token) {
            var controlInfo = this.getControlInfoObject(token);
            if (!controlInfo) return;
            controlInfo.onDelete();
        },
        
        
        getControlInfoObject: function(token) {
            var controlInfoString = token.get('gmnotes');
            var controlInfo;
            var imgsrc = token.get('imgsrc');
            if (controlInfoString.indexOf('DynamicLightData:') !== 0) {
                if(myState.tileTemplates[imgsrc]) {
                   return this.configureNewControl(token);
                }
            }
            else {
               return this.loadControlInfo(token, controlInfoString.slice('DynamicLightData:'.length));
            }
            return;
        },
        
        loadControlInfo: function(token, controlInfoString) {
            var controlInfo = JSON.parse(controlInfoString);
            return this.makeBaseControlInfoObject(token, 
                        controlInfo.type, 
                        _.chain(controlInfo.dlPaths)
                            .map(getObjectMapper('path', function(pathId) {
                                    logger.warn('Warning, path with id [$$$] that should have been attached to token $$$ was not present.', pathId, token);
                                }))
                            .compact()
                            .value(),            
                        getObjectMapper('graphic', function() {
                                logger.warn('Warning, control with id [$$$] that should have been attached to token $$$ was not present.', controlInfo.doorControl, token);
                             })(controlInfo.doorControl),
                        getObjectMapper('graphic', function() {
                                logger.warn('Warning, door with id [$$$] that should have been attached to token $$$ was not present.', controlInfo.door, token);
                            })(controlInfo.door)
                        );
        },

        configureNewControl: function(token) {
            var template = myState.tileTemplates[token.get('imgsrc')];
            var tw = this.getTemplateWrapper(template);
            var type = "mapTile";
            var control;
            var placeholder;
            if (template.doorDetails) {
                var offset = tw.getHingeOffset();
                type = (template.doorDetails.type === 'direct') ? 'directDoor' : 'indirectDoor';
                if (type === 'directDoor') {
                    token.set('layer', 'objects');
                    token.set('aura1_radius', 0.1);
                    token.set('isdrawing', 1);
            
                    placeholder = createObj('graphic', {
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
                            height: token.get('height')
                        });
                    
                    var placeholderControlInfo = this.makeBaseControlInfoObject(placeholder, 'directDoorPlaceholder', [], token)
                    placeholderControlInfo.onAdded();
                }
                else {
                    control = createObj('graphic', {
                            imgsrc: clearURL,
                            subtype: 'token',
                            pageid: token.get('_pageid'),
                            layer: 'objects',
                            playersedit_name: false,
                            playersedit_bar1: false,
                            playersedit_bar2: false,
                            playersedit_bar3: false,
                            aura1_radius: 0.1,
                            rotation:token.get('rotation'),
                            isdrawing:1,
                            top: token.get('top') + offset.y(),
                            left: token.get('left') + offset.x(),
                            width: 140,
                            height: 140
                        });
                        var controlControlInfo = this.makeBaseControlInfoObject(control, 'doorControl', [], undefined, token);
                        controlControlInfo.onAdded();
                }
            }
            var controlInfo = this.makeBaseControlInfoObject(token, type, [], control, placeholder);
            return controlInfo;
        },

        makeBaseControlInfoObject: function(token, type, dlPaths, doorControl, door) {
            if (!_.contains(['directDoorPlaceholder','directDoor', 'indirectDoor', 'doorControl', 'mapTile'], type)) {
                logger.error('unknown token type: ' + type);
                return;
            }
            
            var module = this,
            data = {
                type: type,
                doorControl:doorControl,
                door:door,
                dlPaths:dlPaths
            },
            
            getImgSrc = function() {
                var imgSrcObject;
                switch(type) {
                    case 'directDoorPlaceholder':
                        imgSrcObject = doorControl;
                        break;
                    case 'doorControl':
                        imgSrcObject = door;
                        break;
                    default:
                        imgSrcObject = token;
                }
                return imgSrcObject.get('imgsrc');
            },
            
            getTemplate = function() {
                var template = myState.tileTemplates[getImgSrc()];
                if(!template) {
                    logger.warn('Could not find template information for token $$$ using imgsrc $$$', token, getImgSrc());
                }
                return template;
            },
            
            save = function() {
                token.set('gmnotes', 'DynamicLightData:' + JSON.stringify(data, function(key, value) {
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
                    }));
            },
            
            updateDLPaths = function(templatePaths) {
                var old = data.dlPaths;
                data.dlPaths = _.map(templatePaths, function(path) {
                    return path.draw(token);
                });
                _.invoke(old, 'remove');
            },
            
            moveDoorControl = function(hingeOffset) {
                logger.debug('Moving door control to offset $$$ from token centre: [$$$,$$$]', hingeOffset, token.get('left'), token.get('top'));
                var control = data.doorControl;
                control.set('rotation', token.get('rotation'));
                if(data.type =='directDoorPlaceholder') {
                    //Move control token to match placeholder - they are 
                    //the same size and shape so this is easy
                    control.set('top', token.get('top'));
                    control.set('left', token.get('left'));
                    control.set('width', token.get('width'));
                    control.set('height', token.get('height'));
                    control.set('fliph', token.get('fliph'));
                    control.set('flipv', token.get('flipv'));
                }
                else {
                    control.set('top', token.get('top') + hingeOffset.y());
                    control.set('left', token.get('left') + hingeOffset.x());   
                }
            },
            
            undoMove = function(previous) {
                if (token.get('controlledby') === 'JUST_ADDED') {
                    token.set('controlledby', '');
                    return;
                }
                logger.debug('Undoing move of token $$$, setting back to $$$', token,previous);
                token.set('top', previous.top);
                token.set('left', previous.left);
                token.set('width', previous.width);
                token.set('height', previous.height);
                token.set('fliph', previous.fliph);
                token.set('flipv', previous.flipv);
            },
            
           
            moveDoor = function(doorOffset) {
                logger.debug('Moving door to offset : $$$', doorOffset);
                data.door.set('rotation', token.get('rotation'));
                logger.debug('Setting new door position to [$$$,$$$]', token.get('left') + doorOffset.x(), token.get('top') + doorOffset.y());
                data.door.set('left', token.get('left') + doorOffset.x());
                data.door.set('top', token.get('top') + doorOffset.y());
                module.getControlInfoObject(data.door).onChange();
            };
            
            return {
                onChange: function(previous) {
                    var template = getTemplate();
                    if (!template) {
                        return;
                    }
                    var tw = module.getTemplateWrapper();
                    
                    switch(data.type) {
                        case 'directDoor':
                        case 'doorControl':
                            logger.debug('Door control has been moved');
                            if(previous) {
                                undoMove(previous);
                            }
                            moveDoor(tw.getNewDoorOffset(token));
                            return;
                        case 'directDoorPlaceholder':
                        case 'indirectDoor':
                            logger.debug('Door has been moved');
                            var transformations = tw.getTransformations(token);
                            moveDoorControl(_.reduce(transformations, function(result, transformation) {
                                return transformation(result);
                            }, tw.getHingeOffset()));
                            //Intentional drop through
                        case 'mapTile':
                            updateDLPaths(_.reduce(transformations, function(result, transformation) {
                                return _.map(result, transformation);
                            }, tw.getDLTemplatePaths()));
                            
                    }
                    save();
                },
                onDelete: function() {
                    switch(data.type) {
                        case 'directDoor':
                            //This is a real problem, we can't redraw it because of Roll20 imgsrc restrictions,
                            //for the time being we'll just have to delete everything. I think the proper way 
                            //to do this would be to put another placeholder image in on the objects layer, but
                            //that relies on us having tiles with their own individual template, which we don't
                            //support yet.
                            module.getControlInfoObject(data.door).onDelete();
                            data.door.remove();
                            break;
                        case 'doorControl':
                            var attributes = _.reduce(token.attributes, function(result, value, key){
                                result[key.replace('_','')] = value;
                                return result;
                            }, {});
                            var newControl = createObj('graphic', attributes);
                            module.getControlInfoObject(data.door).updateDoorControl(newControl);
                            break;
                        case 'directDoorPlaceholder':
                        case 'indirectDoor':
                            data.doorControl && data.doorControl.remove();
                            //Intentional drop through
                        case 'mapTile':
                            _.invoke(data.dlPaths, 'remove');
                    }
                },
                onAdded: function() {
                    var tw = module.getTemplateWrapper(getTemplate());
                    if(_.contains(['mapTile', 'directDoorPlaceholder', 'indirectDoor'], data.type)) {
                         updateDLPaths(tw.getDLTemplatePaths());
                    }
                    else if(data.type === 'directDoor') {
                        token.set('controlledby', 'JUST_ADDED');
                    }
                    save();    
                },
                updateDoorControl: function(newDoorControl) {
                    data.doorControl = newDoorControl;
                    save();
                },
                
                getImageURL: getImgSrc,
                
                wipeTemplate: function() {
                    var template = getTemplate();
                    if (template) {
                        delete myState.tileTemplates[getImgSrc()];
                        report("Wiped template for image URL: " + getImgSrc());
                    }
                    else {
                        report("No templates found that correspond to the selected token with image URL: " + getImgSrc());
                    }
                },
                
                logWrap: true,
                
                toJSON: function() {
                    return _.extend({token:token},data);
                }
            };

        },
  
        
        
        getTemplateWrapper: function(template) {
            var layout =  _.chain(template)
                .clone()
                .pick(['fliph', 'flipv', 'height', 'width', 'top', 'left', 'rotation'])
                .value(),
                module = this;
            var makeTransform = function(spec) {
                var func = function(object) {
                    logger.debug('Performing transformation $$$ on $$$', spec, object);
                    var result = object[spec.name].apply(object, spec.args);
                    logger.debug('Transformation result: $$$', result);
                    return result;
                };
                func.toJSON = function() { return spec };
                return func;
            };
            return {
                getTransformations: function(token) {
                    var transformations = [];
                    var scaleX = token.get('width') / layout.width;
                    var scaleY = token.get('height') / layout.height;
                    var fliph = (token.get('fliph') !== layout.fliph);
                    var flipv = (token.get('flipv') !== layout.flipv);
                    var angle = token.get('rotation') - layout.rotation;
                    return _.map([  {name: 'scale', args: [scaleX, scaleY]},
                                        {name: 'flip', args: [fliph, flipv]},
                                        {name: 'rotate', args:[angle]}
                                     ], makeTransform);
                },
                
                getNewDoorOffset: function(token) {
                    return this.getHingeOffset().flipOrigin().rotate(token.get('rotation') - template.rotation);
                },
                
                getDLTemplatePaths: function() {
                    return _.map(template.paths, function(path) {
                        return module.path(JSON.parse(path.path), path.offsetX, path.offsetY, path.width, path.height);
                    });
                },
                
                getHingeOffset: function() {
                    if (template.doorDetails) {
                        if (template.doorDetails.type === 'direct') {
                            return module.point(0,0);
                        }
                        else {
                            return module.point(template.doorDetails.offset[0], template.doorDetails.offset[1]);
                        }
                    }
                    return;
                },
                
                logWrap: true,
                toJSON: function() {
                    return {templateWrapper:{template:template}};
                }
            };
        },
          
        point: function(x,y) {
            var module = this;
            //Already a point object
            if (typeof x === 'object' && !_.isArray(x)) {
                return x;
            }
            //Roll20 path point, convert it
            else if (_.isArray(x) && _.contains(['L','M'], x[0])) {
                return module.point(x[1], x[2]);
            }
            
            return {
                flip: function(horizontal, vertical, width, height) {
                    if (!horizontal && !vertical) return this;
                    width = width || 0;
                    height = height || 0;
                    return module.point(horizontal ? width - x : x,
                        vertical ? height - y : y);
                },
                
                rotate: function(angle, centre) {
                    if (angle % 360 === 0) return this;
                    centre = centre || [0,0];
                    angle = angle % 360;
                    logger.debug('Rotating [$$$,$$$] around $$$ by $$$ degrees', x,y,centre,angle);
                    var s = Math.sin(angle * Math.PI / 180.0);
                    var c = Math.cos(angle * Math.PI / 180.0);
                    // translate point back to origin:
                    var xTranslated = x - centre[0];
                    var yTranslated = y - centre[1];
                    logger.debug('Point translated with centre at origin: [$$$,$$$]', xTranslated, yTranslated);
                    // rotate point
                    var xNew = (xTranslated * c) - (yTranslated * s);
                    var yNew = (xTranslated * s) + (yTranslated * c);
            
                    // translate point back:
                    return module.point(xNew + centre[0], yNew + centre[1]);
                },
                
                flipOrigin: function() {
                   return module.point(-x,-y); 
                },
                
                scale: function(scaleX, scaleY) {
                    if (scaleX === 1 && scaleY ===1) return this;
                    return module.point(x * scaleX, y * scaleY);
                },
                
                translate: function(xOffset, yOffset) {
                    if (xOffset === 0 && yOffset === 0) return this;
                    return module.point(x+xOffset, y+yOffset);
                },
                
                asPathPoint: function(first) {
                    return [first ? 'M' : 'L', x, y];
                },
                
                x: function() {
                    return x;
                },
                
                y: function() {
                    return y;
                },
                
                logWrap: true,
                
                toJSON: function() {
                    return{x:x, y:y};
                }
            };
        },
        
        path: function(inPoints, offsetX, offsetY, width, height) {
            var module = this;
            var points = _.map(inPoints, function(point) {
                //Ensure that we have proper point objects, this method
                //can be called with roll20 path points as well.
                return module.point(point);
            });
            var offset = module.point(offsetX, offsetY);
            return {
                rotate: function(angle) {
                     if (angle % 360 === 0) return this;
                    var pointsCentre = [width/2, height/2];
                        
                    var bounds = {
                        xMax: 0,
                        yMax: 0,
                        xMin:Infinity,
                        yMin:Infinity
                    };
                        
                        
                    var newPoints = _.chain(points)
                        .map(function(myPoint) {
                            var result = myPoint.rotate(angle, pointsCentre);
                            bounds.xMax = Math.max(bounds.xMax, result.x());
                            bounds.yMax = Math.max(bounds.yMax, result.y());
                            bounds.xMin = Math.min(bounds.xMin, result.x());
                            bounds.yMin = Math.min(bounds.yMin, result.y());
                            return result;
                        })
                        .map(function(myPoint) {
                            return myPoint.translate(-bounds.xMin, -bounds.yMin);
                        })
                        .value()
                            
                    var newWidth = bounds.xMax - bounds.xMin;
                    var newHeight = bounds.yMax - bounds.yMin;
                        
                        
                    //The bounding box has changed shape, which skews the centre
                    //away from where it would be if we'd just rotated the whole
                    //box as was. Allow for this offset.
                    var newCentreXOffset = (newWidth/2 + bounds.xMin)  - pointsCentre[0];
                    var newCentreYOffset = (newHeight/2 + bounds.yMin) - pointsCentre[1];
                        
                    var oldCentreRotated = offset.rotate(angle);
                        
                    var newOffset = oldCentreRotated.translate(newCentreXOffset, newCentreYOffset);
                    return module.path(newPoints, newOffset.x(), newOffset.y(), newWidth, newHeight);
                },
                
                flip: function(horizontal, vertical) {
                    if (!horizontal && !vertical) return this;
                    var newPoints = _.map(points, function(point) {
                        return point.flip(horizontal, vertical, width, height);
                    });
                    
                    var newOffset = offset.flip(horizontal, vertical, 0,0);
                    return module.path(newPoints, newOffset.x(), newOffset.y(), width, height);
                },
                
                scale: function(scaleX, scaleY) {
                    if (scaleX === 1 && scaleY === 1) return this;
                    var newPoints = _.map(points, function(point) {
                        return point.scale(scaleX, scaleY);
                    });
                    var newOffset = offset.scale(scaleX, scaleY);
                    
                    return module.path(newPoints, newOffset.x(), newOffset.y(), width * scaleX, height * scaleY);
                },
                
                draw:function(relativeToToken) {
                    var attributes = {
                        width: width,
                        height: height,
                        stroke_width: 1,
                        layer: 'walls',
                        pageid: relativeToToken.get('_pageid'),
                        left: relativeToToken.get('left') + offset.x(),
                        top: relativeToToken.get('top') + offset.y(),
                        path: JSON.stringify(_.map(points, function(point, index) {
                            return point.asPathPoint(index === 0);
                        }))
                    };
                    logger.debug("Drawing path for token $$$ with properties: $$$", relativeToToken, attributes)
                    return createObj('path', attributes);
                },
                
                logWrap: true,
                
                toJSON: function() {
                    return{
                        points:points,
                        offset:offset,
                        width:width,
                        height:height
                    };
                }
            };
            
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
        
        logger.getLabel = function(logLevel) {
            var logPair = _.chain(this).pairs().find(function(pair) { return pair[1] === logLevel;}).value();
            return logPair ? logPair[0] : 'UNKNOWN';
        };
        
        var stringify = function(object) {
            if (typeof object === 'undefined') return object;
            return (typeof object === 'string' ? object : JSON.stringify(object).replace(/"/g, ''));
        }
        
        var outputLog = function(level, message) {
            
            if(level > myState.config.logLevel) return;
            
            var args = arguments.length > 2 ? _.toArray(arguments).slice(2) : [];
            message = stringify(message);
            if (message) {
                message = message.replace(/\$\$\$/g, function() {
                    return stringify(args.shift());
                });
            }
            log('DynamicLightRecorder ' + Date.now() 
                + ' ' + logger.getLabel(level) + ' : '
                + (myState.config.logLevel == logger.TRACE ? logger.prefixString : '') 
                +  message);
        };
        
        _.each(logger, function(level, levelName) {
            logger[levelName.toLowerCase()] = _.partial(outputLog.bind(logger), level);
        });
        
        logger.wrapModule = function(modToWrap) {
            if (myState.config.logLevel == logger.TRACE) {
                _.chain(modToWrap)
                    .functions()
                    .each(function(funcName){
                        var origFunc = modToWrap[funcName];
                        modToWrap[funcName] = logger.wrapFunction(funcName, origFunc);
                    });
                modToWrap.isLogWrapped = true;
            }
        };
        
        logger.wrapFunction = function(name, func) {
            if (myState.config.logLevel == logger.TRACE) {
                if (name === 'toJSON') { return func };
                return function() {
                    logger.trace(name + ' starting with args $$$', arguments);
                    logger.prefixString = logger.prefixString + '  ';
                    var retVal = func.apply(this, arguments);
                    logger.prefixString = logger.prefixString.slice(0, -2);
                    logger.trace(name + ' ending with return value $$$', retVal);
                    if (retVal && retVal.logWrap && !retVal.isLogWrapped) {
                        logger.wrapModule(retVal);
                    }
                    return retVal;
                };
            }
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



