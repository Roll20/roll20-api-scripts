// Github:    https://github.com/symposion/roll20-api-scripts/   
// By:       Lucian Holland

//Who the hell thought that it was a good idea to use  % as "remainder" 
//instead of modulus like every other sensible programming language? That's
//two hours of my life I'll never get back.
var mod = function(n, m) {
    return ((n%m)+m)%m;
};

var DynamicLightRecorder = DynamicLightRecorder || (function() {
    'use strict';
    
    var version = '1.0.2',
    schemaVersion = 0.8,
    clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
    myState = state.DynamicLightRecorder,
    booleanValidator = function(value) {
        var converted = value === 'true' || (value === 'false' ? false : value);
        return {
                valid:(typeof value === 'boolean') || value ==='true' || value === 'false',
                converted:converted
        };
    },
    imageKey = function(imgsrc){
        return (`${imgsrc}`.match(/^.*\/((?:images|marketplace)\/[^/]*\/[^/]*)\/.*$/)||[])[1];
    },
    newAdds={},
    
    //All the main functions sit inside a module object so that I can 
    //wrap them for log tracing purposes
    module = {
        handleInput: function(msg) {
           if (msg.type !== "api" ) {
                return;
            }
            try {
                var args = msg.content.split(/\s+--/);
                var command = args.shift();
                switch(command) {
                    case '!dl-link':
                        this.link(this.processSelection(msg, {
                            graphic: {min:1, max:1},
                            path: {min:1, max:Infinity}
                        }), this.makeOpts(args, this.templateOptionsSpec));
                        break;
                    case '!dl-detach':
                        this.detach(this.processSelection(msg, {
                            graphic: {min:1, max:Infinity}
                        }).graphic);
                        break;
                    case '!dl-door':
                        var objects = this.processSelection(msg, {
                            graphic: {min:1, max:1},
                            path: {min: 0, max:1}
                        });
                        this.makeDoor(objects.graphic, objects.path, this.makeOpts(args, this.templateOptionsSpec));
                        break;
                    case '!dl-directDoor':
                        this.makeDirectDoor(this.processSelection(msg, {
                            graphic: {min:1, max:1}
                        }).graphic, this.makeOpts(args, this.templateOptionsSpec));
                        break;
                    case '!dl-wipe':
                        this.wipe(this.processSelection(msg, {
                            graphic: {min:0, max:Infinity}
                        }).graphic, this.makeOpts(args, this.wipeOptionsSpec));
                        break;
                    case '!dl-import':
                        if(!_.isEmpty(args)) {
                            logger.info(args);
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
                    case '!dl-config':
                        this.configure(this.makeOpts(args, this.configOptionsSpec));
                        break;
                    case '!dl-tmFixup':
                        this.transmogrifierFixup();
                        break;
                    case '!dl-loglevel':
                        if(args.length){
                            let level=`${args[0]}`.toUpperCase(),
                                logLevels=['OFF','ERROR','WARN','INFO','DEBUG','TRACE'];

                            if(_.contains(logLevels,level)){
                                myState.config.logLevel= level;
                            } else {
                                report(`Valid log levels are: ${logLevels.join(', ')}`);
                            }
                        }
                        report(`loglevel at ${myState.config.logLevel}`);
                        break;
                    default:
                        if(command.indexOf('!dl') === 0) {
                            if(command.length > 20) {
                                command = command.slice(0,18) + '...';
                            }
                            report('Unrecognised command: "' + command + '". Maybe you forgot a "--"?');
                        }
                }
            }
            catch(e) {
                if (typeof e === 'string') {
                    report('An error occurred: ' + e);
                    logger.error("Error: $$$", e);
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
        
        wipeOptionsSpec: {
            confirm: booleanValidator
        },
        
        configOptionsSpec: {
            logLevel: function(value) {
                var converted = value.toUpperCase();
                return {valid:_.has(logger, converted), converted:converted};
            },
            autoLink: booleanValidator
        },
            
        templateOptionsSpec: {
            local:booleanValidator,
            overwrite:booleanValidator
        },
        
        makeOpts: function(args, spec) {
            return _.reduce(args, function(options, arg) {
                var parts = arg.split(/\s+/);
                if (parts.length <= 2) {
                    //Allow for bare switches
                    var value = parts.length == 2 ? parts[1] : true;
                    var validator = spec[parts[0]];
                    if (validator) {
                        var result = validator(value);
                        if (result.valid) {
                            options[parts[0]] = result.converted;
                            return options;
                        }
                    }
                }
                logger.error('Unrecognised or poorly formed option [$$$]', arg);
                report('ERROR: unrecognised or poorly formed option --' + arg + '');
                return options;
            }, {});
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
    
    /////////////////////////////////////////
    // Command handlers    
    /////////////////////////////////////////
        configure: function(options) {
            _.each(options, function(value, key) {
                logger.info('Setting configuration option $$$ to $$$',key, value);
                myState.config[key] = value;
            });
            
            report('Configuration is now: ' + JSON.stringify(myState.config));
        },
    
        wipe: function(graphics, options) {
            var module = this;
            if (graphics) {
                var results = {
                        global:0,
                        local:0
                    };
                _.each(graphics, function(graphic) {
                    var controlInfo = module.getControlInfoObject(graphic);
                    
                    controlInfo.wipeTemplate(results);
                });
                report('Wiped ' + results.local + ' local templates and ' + results.global + ' global templates');
            }
            else if (!options.confirm){
                report('You are about to wipe all of your stored templates, are you *really* sure you want to do this? [Confirm](!dl-wipe --confirm)');
            }
            else {
                var removeCount = this.globalTemplateStorage().removeAll();
                report('' + removeCount + ' global dynamic lighting templates have been wiped');
            }
        },
        
        export: function(graphics) {
            /* var module = this;*/
            var exportObject = {
                version: schemaVersion,
                templates: this.globalTemplateStorage().load(graphics)
            };
            
            
            report(JSON.stringify(exportObject));        
        },
        
        redraw: function(objects) {
            var module = this;
            if (!_.isEmpty(objects)) {
                _.chain(objects)
                    .filter(function(object) {
                        return module.tokenStorage(object).get('template');
                    })
                    .each(function(tile) {
                        module.handleTokenChange(tile);
                    });
            }
            else {
                _.chain(module.globalTemplateStorage().load())
                        .map(function(template) {
                            return findObjs({_type: 'graphic', imgsrc:template.imgsrc, _subtype:'token'});
                        })
                        .flatten()
                        .each(function(graphic) {
                            module.handleTokenChange(graphic);    
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
           
                var importCount = this.globalTemplateStorage().importTemplates(importObject.templates);
                var message = '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">Import completed</div>' +
                                '<p>Total templates in import: <b>' + _.size(importObject.templates) + '</b></p>';
                if (!overwrite) {
                    var skipCount = _.size(importObject.templates) - importCount;
                    message += '<p> Skipped <b>' + skipCount + '</b> templates for tiles which already have templates. '
                                                        + 'Rerun with <b>--overwrite</b> to replace these with the imported tiles. '
                                                        + ' See log for more details. </p>';
                }
                message += '</div>';
                report(message);
               
            }
            catch(e) {
                logger.error(e.toString());
                report('There was an error trying to read the supplied JSON text, see the log for more details');
            }
        },
        
        link: function(selection, options) {
            var tile = selection.graphic;
            if (tile.get('_subtype') !== 'token' || tile.get('layer') !== 'map') {
                report('Selected tile must be on the map layer.');
                return;
            }
            
            var template = this.buildTemplate(tile, selection.path, options, '!dl-link');
            if (!template) return;
            this.getControlInfoObject(tile, _.extend(options, {template: template})).onAdded();
            
            report("DL paths successfully linked for map tile");
        },
        
        //Make a normal door with a transparent control token
        makeDoor: function(doorToken, doorBoundsPath, options) {
            var doorBoundingBox = doorBoundsPath ? this.makeBoundingBox(doorBoundsPath) : this.makeBoundingBox(doorToken);
            var template = this.makeDoorTemplate(doorToken, doorBoundingBox, options, '!dl-door');
            if(!template) return;
            var hinge = [doorBoundingBox.left - (doorBoundingBox.width/2), doorBoundingBox.top];
            var hingeOffset = [hinge[0] - doorToken.get('left'), hinge[1] - doorToken.get('top')];

            template.doorDetails.type = 'indirect';
            template.doorDetails.offset = hingeOffset;
            doorToken.set('layer', 'map');
            
            this.getControlInfoObject(doorToken,  _.extend(options, {template: template})).onAdded();
            
            if (doorBoundsPath) {
                doorBoundsPath.remove();
            }
            report('Door created successfully');
        },
        
        makeDirectDoor: function(token, options) {
            var doorBoundingBox = {
                left: token.get('left') + (token.get('width')/4),
                top: token.get('top'),
                width: token.get('width')/2,
                height: token.get('height')
            };
            
            var template = this.makeDoorTemplate(token, doorBoundingBox, options, '!dl-directDoor');
            if (!template) return;
            template.doorDetails.type = 'direct';
            
            this.getControlInfoObject(token,  _.extend(options, {template: template})).onAdded();
            
            report('Direct control door created successfully');
        },
        
        detach: function(graphics) {
            var module = this;
            _.chain(graphics)
                .map(function(graphic) {
                    return module.getControlInfoObject(graphic);    
                })
                .invoke('detach');
            report('Detach complete');
        },
        
        transmogrifierFixup: function() {
            var module = this;
            var graphicCount = 0;
            _.chain(findObjs({_type:'path', layer:'walls'}))
                .map(function(path) {
                    var graphicId = path.get('controlledby');
                    if(graphicId) {
                        var graphic = getObj('graphic', graphicId);
                        if (graphic) {
                            if(!_.contains(module.tokenStorage(graphic).get('dlPaths'), path.id)) {
                                path.remove();
                                return graphic;
                            }
                        }
                    }
                })
                .uniq()
                .compact()
                .each(function(graphic) {
                    graphicCount++;
                    module.getControlInfoObject(graphic).onChange();
                });
            report('Deleted orphaned DL paths for ' + graphicCount + ' graphics and redrew.');
        },
       
        
    /////////////////////////////////////////////////        
    // Event Handlers        
    /////////////////////////////////////////////////
    
        handleNewToken: function(token) {
            newAdds[token.id]=true;
            _.delay(()=>(delete newAdds[token.id]),200);

            logger.debug('Got new token $$$', token);
            if(token.get('name') === 'DynamicLightRecorder') {
                //This can only happen when this token is being added by the transmogrifier, AFAICT
                //In any case, if the token is already set up, we have nothing to do
                return;
            }
            
            
            if (myState.config.autoLink) {
                this.getControlInfoObject(token).onAdded();
            }
        },

        handleTokenChange: function(token, previous) {
            logger.debug('Changed token $$$ from $$$', token, previous);            
            if(_.isEqual(_.omit(token.attributes, '_fbpath'), previous) || token.get('gmnotes') === 'APICREATE' || newAdds[token.id]) {
                //this is a spurious change event generated by the API creating an object,
                //we can safely ignore it.
                return;
            }

            newAdds[token.id]=true;
            _.delay(()=>(delete newAdds[token.id]),200);

            if (previous && previous.gmnotes.indexOf('DynamicLightData') === 0 && previous.gmnotes !== token.get('gmnotes')) {
                logger.debug('Resetting changed gmnotes');
                token.set('gmnotes', previous.gmnotes);
            }

            this.getControlInfoObject(token).onChange(previous);
        },
        
        handleDeleteToken: function(token) {
            /* var controlInfo = */ this.getControlInfoObject(token).onDelete();
        },
        
        handlePathChange: function(path, previous) {
            if (previous.controlledby && previous.layer === 'walls') {
                var graphic = getObj('graphic', previous.controlledby);
                if (graphic && graphic.get('name') === 'DynamicLightRecorder') {
                    path.set('top', previous.top);
                    path.set('left', previous.left);
                    path.set('width', previous.width);
                    path.set('height', previous.height);
                    path.set('scaleX', previous.scaleX);
                    path.set('scaleY', previous.scaleY);
                    path.set('rotation', previous.rotation);
                    path.set('controlledby', previous.controlledby);
                }
            }
        },
        
        
        
        ///////////////////////////////////////////////
        //Template handling
        ///////////////////////////////////////////////
        
        //Make a DL template for a tile
        //using a set of paths
        buildTemplate: function(tile, paths, options, cmd) {
            if (tile.get('imgsrc') === clearURL) {
                report("You are trying to define a template for the clear placeholder image. This isn't a good plan.");
                return;
            }
            
            if (this.globalTemplateStorage().load(tile) && !options.overwrite && !options.local) {
               report('Tile already has a global template defined. Do you want to [Overwrite](' + cmd + ' --overwrite) it?');
               return;
            }
            else if(this.tokenStorage(tile).get('template', true) && !options.overwrite && options.local) {
                report('Tile already has a local template defined. Do you want to [Overwrite](' + cmd + ' --overwrite --local) it?');
                return;
            }
            
            var template = {
                imgsrc : tile.get('imgsrc'),
                top: tile.get('top'),
                left: tile.get('left'),
                width: tile.get('width'),
                height: tile.get('height'),
                flipv: tile.get('flipv'),
                fliph: tile.get('fliph'),
                rotation: tile.get('rotation') % 360,
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
            logger.debug('Created new template $$$', template);
            //These will get redrawn on the walls layer later.
            _.invoke(paths, 'remove');
            return template;
        },
        
        /////////////////////////////////////////
        //Door templates
        /////////////////////////////////////////
        makeBoundingBox: function(object) {
            return {
                left: object.get('left'),
                top: object.get('top'),
                width: object.get('width'),
                height: object.get('height')
            };
        },
        
        makeDoorTemplate: function(token, doorBoundingBox, options, cmd) {
            var doorWidth = doorBoundingBox.width;
            var dlLineWidth = doorWidth + 4;
            
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
            var template = this.buildTemplate(token, [dlPath], options, cmd);
            if (!template) {
                dlPath.remove();
                return;
            }
            
            var minRotation = mod(+(token.get('bar1_value') || -90) + template.rotation, 360);
            var maxRotation = mod(+(token.get('bar1_max') || 90) + template.rotation, 360);
            token.set('bar1_value', '');
            token.set('bar1_max', '');
            template.doorDetails = {minRotation: minRotation, maxRotation:maxRotation};
            return template;
        },
        
    
        ///////////////////////////////////////////////
        //A control info object wraps a token
        //and abstracts away all the handling of
        //interrelated controls (for doors) and the relationship
        //to a set of DL paths.
        ////////////////////////////////////////////////
        
        getControlInfoObject: function(token, options) {
            options = options || {};
            var storage = this.tokenStorage(token);
             _.defaults(options, {
                    doorControl:storage.get('doorControl'),
                    door:storage.get('door'),
                    type:storage.get('type')
             });
            
            if(options.template) {
                options.type = this.getTypeFromTemplate(options.template);
            }
        
            switch (options.type) {
                case 'directDoorPlaceholder':
                    if (options.doorControl) {
                        storage.setTemplateStorage(this.tokenStorage(options.doorControl));
                    }
                    break;
                case 'doorControl':
                    if(options.door) {
                        storage.setTemplateStorage(this.tokenStorage(options.door));
                    }
                    break;
                default:
                    //leave as supplied token
            }
            
            if(options.local) {
                logger.debug('Using local template storage');
                storage.detachTemplate();
            }
            
            
            //Perhaps we can work out the type from a global template
            //now that we have wired up the storage to delegate to it
            //But if autoLinking is turned off we shouldn't do this as
            //this could be a newly dropped tile that we're supposed to be 
            //ignoring
            if(!options.type && myState.config.autoLink) {
                options.type = this.getTypeFromTemplate(storage.get('template'));
            }
            
            
            //Only set values in the token storage if this is a token
            //we recognise or have been given a new type for, otherwise
            //we might end up spamming random other tokens with our GM notes!
            if(options.type) {
                _.each(options, function(value, key) {
                    if(value){
                        storage.set(key, value);
                    }
                });
            }
             
            return this.makeControlInfoObject(token, storage);
        },
    
        getTypeFromTemplate: function(template) {
            if (!template) return undefined;
            return template.doorDetails ? ((template.doorDetails.type === 'direct') ? 'directDoor' : 'indirectDoor') : 'mapTile';
        },

        getDummyControlInfo: function(token) {
            return {
                    onChange:function(){},
                    onDelete:function(){},
                    onAdded:function(){},
                    updateDoorControl:function(){},
                    wipeTemplate:function(){},
                    detach:function(){},
                    getImageURL: function(){ return ''; },
                    logWrap: false,
                    toJSON: function() {
                        return "Dummy controlInfo object for token " + (token && token.id);
                    }
                };
        },

        ////////////////////////////////////////////////////
        // This is the beast method that actually defines the
        // core of the control info object, along with all of 
        // its functions. There's a bunch of internal functions
        // first, and then the public interface at the bottom
        ////////////////////////////////////////////////////
        makeControlInfoObject: function(token, tokenStorage) {
            if (!_.contains(['directDoorPlaceholder','directDoor', 'indirectDoor', 'doorControl', 'mapTile'], tokenStorage.get('type'))) {
                //This isn't a token we manage, return a null object for it
                return this.getDummyControlInfo(token);
            }
            
            
            var module = this,
            type = tokenStorage.get('type'),
            updateDLPaths = function(templatePaths) {
                var old = tokenStorage.get('dlPaths');
                tokenStorage.set('dlPaths', _.map(templatePaths, function(path) {
                    return path.draw(token);
                }));
                _.invoke(old, 'remove');
            },
            
            moveDoorControl = function(hingeOffset) {
                logger.debug('Moving door control to offset $$$ from token centre: [$$$,$$$]', hingeOffset, token.get('left'), token.get('top'));
                var control = tokenStorage.get('doorControl');
                var type = tokenStorage.get('type');
                if(!control) {
                    //This shouldn't happen, but if it does we can fix it
                    //in the case of an indirectDoor
                    logger.error('Door control somehow deleted for map token $$$. Will attempt to recreate.', token.id);
                    if(type === 'indirectDoor') {
                        tokenStorage.set('doorControl', module.makeDoorControl(token, hingeOffset));
                    }
                    return;
                }
                
                control.set('rotation', token.get('rotation'));
                if(type =='directDoorPlaceholder') {
                    //Move control token to match placeholder - they are 
                    //the same size and shape so this is easy
                    control.set('top', token.get('top'));
                    control.set('left', token.get('left'));
                    control.set('width', token.get('width'));
                    control.set('height', token.get('height'));
                    control.set('fliph', token.get('fliph'));
                    control.set('flipv', token.get('flipv'));
                    //Redraw DLpaths
                    module.getControlInfoObject(control).onChange();
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
           
            rotateDoor = function(templateWrapper) {
                var door = tokenStorage.get('door');
                var rotationLimits = templateWrapper.getDoorRotationLimits(door);
                var controlRotation = token.get('rotation') % 360;
                controlRotation = module.limitAngle(controlRotation, rotationLimits[0], rotationLimits[1]);
                token.set('rotation', controlRotation);
                
                var doorOffset = templateWrapper.getNewDoorOffset(token);
                logger.debug('Moving door to offset : $$$', doorOffset);
                
                door.set('rotation', token.get('rotation'));
                logger.debug('Setting new door position to [$$$,$$$]', token.get('left') + doorOffset.x(), token.get('top') + doorOffset.y());
                door.set('left', token.get('left') + doorOffset.x());
                door.set('top', token.get('top') + doorOffset.y());
                module.getControlInfoObject(door).onChange();
            },
            
            removeDependentObject = function(name) {
                logger.debug('Removing dependent object: $$$', name);
                var object = tokenStorage.get(name); 
                if (object) {
                    object.set('controlledby', 'APIREMOVE');
                    object.remove();
                    object.remove(name);
                }
            },
            
            detach = function() {
                tokenStorage.detachTemplate();
            },
            
            onChange = function(previous) {
                var tw = module.getTemplateWrapper(tokenStorage.get('template'));
                if (!tw) {
                    //this token is no longer attached to any template,
                    //make sure we clean up any dependencies
                    _.invoke(tokenStorage.get('dlPaths'), 'remove');
                            tokenStorage.remove('dlPaths');
                    switch(tokenStorage.get('type')) {
                        case 'directDoor':
                            removeDependentObject('door');
                            break;
                        case 'indirectDoor':
                            removeDependentObject('doorControl');
                            break;
                    }
                    return;
                }
                var transformations = tw.getTransformations(token);
                switch(type) {
                    case 'directDoor':
                        //Either this an internal trigger from the placeholder being
                        //created or moved, or it's the first move immediately after placement 
                        //thanks to grid snapping. In either case we should process the move and
                        //update the DL paths. Otherwise it's the user moving the door control on
                        //the tokens layer, so we snap it back to match the map layer graphic.
                        if(!previous || previous.controlledby === 'JUST_ADDED') {
                            updateDLPaths(_.reduce(transformations, function(result, transformation) {
                                return _.map(result, transformation);
                            }, tw.getDLTemplatePaths()));
                        }
                        //Drop through
                        /*eslint-diable no-fallthrough */
                    case 'doorControl':
                        /*eslint-enable no-fallthrough */
                        logger.debug('Door control has been moved');
                        if(previous) {
                            undoMove(previous);
                            rotateDoor(tw);
                        }
                        break;
                    case 'indirectDoor':
                        moveDoorControl(_.reduce(transformations, function(result, transformation) {
                            return transformation(result);
                        }, tw.getHingeOffset()));
                        updateDLPaths(_.reduce(transformations, function(result, transformation) {
                            return _.map(result, transformation);
                        }, tw.getDLTemplatePaths()));
                        break;
                    case 'directDoorPlaceholder':
                        logger.debug('Door has been moved');
                        moveDoorControl(_.reduce(transformations, function(result, transformation) {
                            return transformation(result);
                        }, tw.getHingeOffset()));
                        if (previous) { //User initiated move of the token itself rather than update from control moving etc
                            //Record the current rotation as the base value from which limits
                            //are applied.
                            token.set('bar1_value', token.get('rotation') % 360);
                        }
                        break;
                    case 'mapTile':
                        updateDLPaths(_.reduce(transformations, function(result, transformation) {
                            return _.map(result, transformation);
                        }, tw.getDLTemplatePaths()));
                        
                }
            },
            
            onDelete = function() {
                var door = tokenStorage.get('door') /*,
                    doorControl = tokenStorage.get('doorControl') */ ;
                switch(type) {
                    case 'directDoor':
                        if (token.get('controlledby') === 'APIREMOVE') {
                            _.invoke(tokenStorage.get('dlPaths'), 'remove');
                            tokenStorage.remove('dlPaths');
                        }
                        else {
                            //This is a real problem, we can't redraw it because of Roll20 imgsrc restrictions,
                            //for the time being we'll just leave everything as it is with the placeholder and
                            //the DLPaths. Perhaps consider moving to the token layer to highlight?
                            logger.warn("Direct door control with id $$$ has been deleted, can't recreate", token.id);
                        }
                        break;
                    case 'doorControl':
                        if(door && token.get('controlledby') !== 'APIREMOVE') {
                            //Force a redraw, we don't want this deleted!
                            module.getControlInfoObject(door).onAdded();
                        }
                        break;
                    case 'directDoorPlaceholder':
                        if (token.get('controlledby') !== 'APIREMOVE') {
                            removeDependentObject('doorControl');
                        }
                        break;
                    case 'indirectDoor':
                        removeDependentObject('doorControl');
                        //Intentional drop through
                        /*eslint-diable no-fallthrough */
                    case 'mapTile':
                        /*eslint-enable no-fallthrough */
                        _.invoke(tokenStorage.get('dlPaths'), 'remove');
                        tokenStorage.remove('dlPaths');
                }
            },
            
            onAdded = function() {
                var tw = module.getTemplateWrapper(tokenStorage.get('template'));
                if (!tw) return;
                token.set('name', 'DynamicLightRecorder');
                switch(tokenStorage.get('type')) {
                    case 'directDoor':
                        //Tidy up any previous placeholder
                        removeDependentObject('door');
                        var placeholder = module.makePlaceholder(token);
                        token.set('layer', 'objects');
                        token.set('aura1_radius', 0.1);
                        token.set('isdrawing', 1);
                        token.set('controlledby', 'JUST_ADDED');
                        tokenStorage.set('door', placeholder);
                        onChange();
                        break;
                    case 'indirectDoor':
                        //Remove previous door control if any
                        removeDependentObject('doorControl');
                        var control = module.makeDoorControl(token, tw.getHingeOffset());
                        tokenStorage.set('doorControl', control);
                        //Drop through.
                        /*eslint-diable no-fallthrough */
                    case 'mapTile':
                        /*eslint-enable no-fallthrough */
                        onChange();
                }
            },
            
            wipeTemplate = function(results) {
                tokenStorage.wipeTemplate(results);
            };
            
            return {
                onChange: onChange,
                onDelete: onDelete,
                onAdded: onAdded,
                wipeTemplate: wipeTemplate,
                detach: detach,
                getImageURL: function() { var template = tokenStorage.get('template'); return template && template.imgsrc; },
                logWrap: 'controlInfoObject',
                toJSON: function() {
                    return tokenStorage.toJSON();
                }
            };

        },
  
        makePlaceholder: function(token) {
            
           var placeholder = createObj('graphic', {
                    imgsrc: clearURL,
                    subtype: 'token',
                    pageid: token.get('_pageid'),
                    layer: 'map',
                    playersedit_name: false,
                    playersedit_bar1: false,
                    playersedit_bar2: false,
                    playersedit_bar3: false,
                    name:'DynamicLightRecorder',
                    gmnotes:'APICREATE',
                    rotation:token.get('rotation'),
                    isdrawing:1,
                    top:token.get('top'),
                    left: token.get('left'),
                    width: token.get('width'),
                    height: token.get('height'),
                    bar1_value: token.get('rotation') % 360
                });
            
            var storage = this.tokenStorage(placeholder);
            storage.set('type', 'directDoorPlaceholder');
            storage.set('doorControl', token);
            return placeholder;
        },
        
        makeDoorControl: function(token, offset) {
            var control = createObj('graphic', {
                imgsrc: clearURL,
                subtype: 'token',
                pageid: token.get('_pageid'),
                layer: 'objects',
                name:'DynamicLightRecorder',
                playersedit_name: false,
                playersedit_bar1: false,
                playersedit_bar2: false,
                playersedit_bar3: false,
                aura1_radius: 0.1,
                rotation:token.get('rotation'),
                gmnotes:'APICREATE',
                isdrawing:1,
                top: token.get('top') + offset.y(),
                left: token.get('left') + offset.x(),
                width: 70,
                height: 70
            });
            
            var storage = this.tokenStorage(control);
            storage.set('type', 'doorControl');
            storage.set('door', token);
            return control;
        },
        
        
        globalTemplateStorage: function() {
            var module = this;
            return {
            
                save: function(template) {
                    logger.debug('saving template $$$ to state storage', template);
                    let imgkey=imageKey(template.imgsrc);
                    myState.tileTemplates[imgkey] = template;
                },
                
                load: function(key) {
                    if (!key) {
                        return _.clone(myState.tileTemplates);
                    }
                    if (_.isArray(key)) {
                        return _.chain(key)
                                .map(this.load.bind(this))
                                .compact()
                                .value();
                    }
                    var imgsrc = (typeof key === 'object') ? module.getControlInfoObject(key).getImageURL() : key;
                    let imgkey=imageKey(imgsrc);
                    logger.debug('Retrieving template $$$ from state storage', myState.tileTemplates[imgkey], imgsrc);
                    return myState.tileTemplates[imgkey];
                },
                
                remove: function(imgsrc) {
                    let imgkey=imageKey(imgsrc);
                    if (myState.tileTemplates[imgkey]) {
                        delete myState.tileTemplates[imgkey];
                        _.each(findObjs({_type:'graphic', imgsrc:imgsrc}), function(graphic) {
                            module.getControlInfoObject(graphic).onChange();
                        });
                        return true;
                    }
                    return false;
                },
                
                removeAll: function() {
                    var removeCount = _.size(myState.tileTemplates);
                    _.chain(myState.tileTemplates)
                    .keys()
                    .each(this.remove);
                    return removeCount;
                },
                
                importTemplates: function(templates, overwrite) {
                    var overlapKeys = _.chain(templates)
                                .keys()
                                .intersection(_.keys(myState.tileTemplates))
                                .value();
                    if (overwrite) {
                        _.extend(myState.tileTemplates, templates);
                        return _.size(templates);
                    }
                    else {
                        _.extend(myState.tileTemplates, _.omit(templates, overlapKeys));
                        logger.info("Skipped template image URLs: $$$", overlapKeys);
                        return _.size(templates) - _.size(overlapKeys);
                    }
                },
                
                asTokenStorageFor: function(token) {
                    var global = this,
                    imgsrc = token.get('imgsrc');
                    return {
                        set: function(key, template) {
                            if (key === 'template') {
                                if (imgsrc === template.imgsrc) {
                                     return global.save(template);
                                }
                                else {
                                    logger.error('Attempting to save template against a token with non-matching imgsrc. Token imgsrc: $$$, template: $$$', 
                                                    imgsrc,
                                                    template);
                                }
                            }
                            else {
                                logger.warn('templateStorage wrapper for token $$$ asked to save non-template key $$$', token.id, key);
                            }
                        },
                        get: function(key) {
                            if (key === 'template') {
                                return global.load(imgsrc);
                            }
                            else {
                                logger.warn('templateStorage wrapper for token $$$ asked to get non-template key $$$', token.id, key);
                            }
                        },
                        
                        remove: function(key) {
                            if (key === 'template') {
                                return global.remove(imgsrc);
                            }
                        },
                        
                        wipeTemplate: function(results) {
                            global.remove(imgsrc) && results.global++;
                        },
                        
                        detachTemplate: function(callback) {
                            callback && callback(global.load(imgsrc));
                        },
                        
                        logWrap: 'templateStorageWrapper',
                        toJSON: function() { return 'templateStorageWrapper for token with id ' + token.id; }
                        
                    };
                },
                
                logWrap: 'globalTemplateStorage',
                toJSON: function() { return myState.tileTemplates; }
            };
        },
        
        tokenStorage: function(token) {
            var properties = {
                template: _.identity,
                doorControl: getObjectMapper('graphic', function(id) {
                                logger.warn('Warning, control with id [$$$] that should have been attached to token $$$ was not present.', id, token);
                             }),
                door: getObjectMapper('graphic', function(id) {
                                logger.warn('Warning, door with id [$$$] that should have been attached to token $$$ was not present.', id, token);
                            }),
                dlPaths: function(dlPaths) {
                    return _.chain(dlPaths)
                            .map(getObjectMapper('path', function(pathId) {
                                    logger.warn('Warning, path with id [$$$] that should have been attached to token $$$ was not present.', pathId, token);
                                }))
                            .compact()
                            .value();
                },
                type: _.identity
            };
            
            var noWarnKeys = ['local', 'overwrite'];
            
            var gmn = token.get('gmnotes'),
                data = {}, 
                module=this,
                templateStorage,
                previousTemplateStorage,
                persist = function() {
                    var string = JSON.stringify(data, function(key, value) {
                        if (typeof value === 'object' && _.isEmpty(value)) return undefined;
                        if (key === 'dlPaths') {
                            return _.chain(value).compact().pluck('id').value();
                        }
                        if (_.contains(['door', 'doorControl'], key) && value !== null) {
                            return value._id || value.id;
                        }
                        return value;
                    });
                    logger.debug("Persisting token info $$$ on token with id $$$ as string $$$", data, token.id, string);
                    token.set('gmnotes', 'DynamicLightData:' + string);
                },
                storage = {
                    set: function(key, value) {
                        if (!properties[key]) {
                            if (!_.contains(noWarnKeys, key)) {
                                logger.warn('Unrecognised token property key $$$, ignoring', key);
                            }
                            return;
                        }
                        
                        if(key === 'template' && templateStorage) {
                            return templateStorage.set(key, value);
                        }
                 
                 
                        if (value !== data[key]) {
                            data[key] = value;
                            persist();
                        }
                    },
                    
                    get: function(key, localOnly) {
                        if (key === 'template' && templateStorage && !localOnly) {
                            return templateStorage.get(key);
                        }
                        return data[key];
                    },
                    
                    remove: function(key) {
                        if (key === 'template' && templateStorage) {
                            return templateStorage.remove(key);
                        }
                        if (data[key]) {
                            delete data[key];
                            persist();
                            return true;
                        }
                        return false;
                    },
                    
                    setTemplateStorage: function(newTemplateStorage) {
                        previousTemplateStorage = templateStorage;
                        templateStorage = newTemplateStorage;
                        //If we are delegating to different template storage
                        //then we should wipe our own template
                        if(templateStorage !== undefined) {
                            data.template = undefined;
                            persist();
                        }
                    },
                    
                    detachTemplate: function( /* callback */) {
                        if (templateStorage) {
                            templateStorage.detachTemplate(function(template) {
                                data.template = template;
                                previousTemplateStorage = templateStorage;
                                templateStorage = undefined;
                                persist();
                            });
                        }
                    },
                    
                    wipeTemplate: function(results) {
                        if(!templateStorage) {
                            logger.debug('Wiping local template $$$ and resetting template storage to $$$', data.template, previousTemplateStorage);
                            data.template = undefined;
                            results.local++;
                            templateStorage = previousTemplateStorage;
                            persist();
                            module.getControlInfoObject(token).onChange();
                            
                        }
                        else {
                            templateStorage.wipeTemplate(results);
                        }
                    },
                    
                    logWrap:'tokenTemplateStorage',
                    toJSON: function() {
                        return data;
                    }
                };
                
            var changedValues = false;
            if (gmn.indexOf('DynamicLightData:') === 0) {
                data = _.chain(JSON.parse(gmn.slice('DynamicLightData:'.length)))
                    .pick(_.functions(properties))
                    .reduce(function(result, value, key) {
                        
                        logger.debug("Transforming parsed GM Notes data, property name : $$$, property value $$$", key, value);
                        var transformed = properties[key](value);
                        logger.debug("Transformed value: $$$", transformed);
                        if (transformed) {
                            result[key] = transformed;
                        }
                        else if(value) {
                            changedValues = true;
                        }
                        
                        return result;
                    }, {})
                    .value();
            }
            
            templateStorage = data.template ? undefined : this.globalTemplateStorage().asTokenStorageFor(token);
            previousTemplateStorage = data.template ? this.globalTemplateStorage().asTokenStorageFor(token) : undefined;
     
            if (changedValues) {
                persist();
            }
            
            return storage;
        },
        
        getTemplateWrapper: function(template) {
            if (!template) return;
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
                func.toJSON = function() { return spec; };
                return func;
            };
            return {
                getTransformations: function(token) {
                    // var transformations = [];
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
                
                getDoorRotationLimits: function(door) {
                    var baseRotation = door.get('bar1_value') || template.rotation;
                    if(template.doorDetails) {
                        var min = template.doorDetails.minRotation || -180;
                        var max = template.doorDetails.maxRotation || 180;
                        return [mod(baseRotation + min,360), 
                                mod(baseRotation + max, 360)];
                    }
                    return [0, 360];
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
                    logger.error('Requested hingeOffset but no doorDetails on template');
                },
                
                logWrap: 'templateWrapper',
                toJSON: function() {
                    return template;
                }
            };
        },
        
        limitAngle: function(angle, min, max) {
            var diffMax = mod((max - angle) + 180, 360) - 180;
            var diffMin = mod((angle - min) + 180,360) - 180;
            logger.debug("DiffMin: $$$, DiffMax: $$$", diffMin, diffMax);
            if (diffMax >= 0 && diffMin >= 0) {
                return angle;
            }
            return Math.abs(diffMax) > Math.abs(diffMin) ? min : max;
        },
        
        //Immutable point object 'constructor'
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
                
                logWrap: 'point',
                
                toJSON: function() {
                    return{x:x, y:y};
                }
            };
        },
        
        //Immutable path object 'constructor'
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
                        .value();
                            
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
                        controlledby: relativeToToken.id, //Help survive the transmogrifier
                        path: JSON.stringify(_.map(points, function(point, index) {
                            return point.asPathPoint(index === 0);
                        }))
                    };
                    logger.debug("Drawing path for token $$$ with properties: $$$", relativeToToken, attributes);
                    
                    return createObj('path', attributes);
                },
                
                logWrap: 'path',
                
                toJSON: function() {
                    return{
                        points:points,
                        offset:offset,
                        width:width,
                        height:height
                    };
                }
            };
            
        },
        
        checkInstall: function() {
            var module=this;
            logger.info('-=> DynamicLightRecorder v$$$ <=-', version);
            if( ! _.has(state,'DynamicLightRecorder') || myState.version !== schemaVersion) {
                logger.info('  > Updating Schema to v$$$ from $$$<', schemaVersion, myState && myState.version);
                logger.info('Preupgrade state: $$$', myState);
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
                        /*eslint-diable no-fallthrough */
                    case 0.2:
                        /*eslint-enable no-fallthrough */
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
                        /*eslint-diable no-fallthrough */
                    case 0.3:
                        /*eslint-enable no-fallthrough */
                        _.each(myState.tileTemplates, function(template) {
                            if (template.isDoor) {
                                delete template.isDoor;
                                var hingeOffset = [-(template.width/2), 0];
                                template.doorDetails = { type:'indirect', offset:hingeOffset};
                            }
                        });
                        /*eslint-diable no-fallthrough */
                    case 0.4:
                        /*eslint-enable no-fallthrough */
                        myState.config.logLevel = 'INFO';
                        /*eslint-diable no-fallthrough */
                    case 0.5:
                        /*eslint-enable no-fallthrough */
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
                                /* eslint-disable no-empty */
                                catch(e) {}
                                /* eslint-enable no-empty */
                            });
                        /*eslint-diable no-fallthrough */
                    case 0.6:
                        /*eslint-enable no-fallthrough */
                        myState.config.autoLink = true;
                        myState.config.logLevel = 'INFO';
                        logger.info('Upgrading existing tokens with transmogrifier-protection');
                        _.each(myState.tileTemplates, function(template, key) {
                            template.imgsrc = key;
                            _.each(findObjs({type:'graphic', imgsrc:template.imgsrc}), function(graphic) {
                                var gmn = graphic.get('gmnotes');
                                if (gmn.indexOf('DynamicLightData:') === 0) {
                                    graphic.set('name', 'DynamicLightRecorder');
                                    var tokenStorage = module.tokenStorage(graphic);
                                    var dlPaths = tokenStorage.get('dlPaths');
                                    _.each(dlPaths, function(dlPath) {
                                        dlPath.set('controlledby', graphic.id);
                                    });
                                    var doorControl = tokenStorage.get('doorControl');
                                    var door = tokenStorage.get('door');
                                    doorControl && doorControl.set('name', 'DynamicLightRecorder');
                                    door && door.set('name', 'DynamicLightRecorder');
                                }
                            });
                        });
                        /*eslint-diable no-fallthrough */
                    case 0.7:{
                        /*eslint-enable no-fallthrough */
                            let temps={};
                            _.each(myState.tileTemplates, function(template,key){
                                temps[imageKey(key)]=template;
                            });
                            myState.tileTemplates=temps;
                        }

                        myState.version = schemaVersion;
                        break;
                    default:
                        if (!myState) {
                            state.DynamicLightRecorder = {
                                version: schemaVersion,
                                tileTemplates: {},
                                config: {
                                    logLevel: 'INFO',
                                    autoLink: true
                                }
                            };
                            myState = state.DynamicLightRecorder;
                            logger.info('Making new state object $$$', myState);
                        }
                        else {
                            logger.fatal('Unknown schema version for state $$$', myState);
                            report('Serious error attempting to upgrade your global state, please see log for details. '
                                    +'DynamicLightRecorder will not function correctly until this is fixed');
                            myState = undefined;
                        }
                        break;
                }
                logger.info('Upgraded state: $$$', myState);
            }
        },
        
        logWrap: 'module'
    };
    
    /////////////////////////////
    // General helpers
    /////////////////////////////
    
    var report = function(msg) {
        //Horrible bug with this at the moment - seems to generate spurious chat
        //messages when noarchive:true is set
        //sendChat('DynamicLightRecorder', '' + msg, null, {noarchive:true});
        sendChat('DynamicLightRecorder', '/w gm ' + msg);
    },
    
    getObjectMapper = function(type, notFoundCallback) {
        return function(id) {
            if (!id) return;
            var object = getObj(type, id);
            if (!object && (typeof notFoundCallback ==='function')) notFoundCallback(id, type);
            return object;
        };
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
            var result = (typeof object === 'string') ? object : JSON.stringify(object);
            if (result) result = result.replace(/"/g, '');
            return result;
        };
        
        var shouldLog = function(level) {
            var logLevel = logger.INFO;
            if (myState && myState.config && myState.config.logLevel !== undefined) {
                logLevel = logger[myState.config.logLevel];
            }
            
            return level <= logLevel;
        };
        
        var outputLog = function(level, message) {
            
            if(!shouldLog(level)) return;
            
            var args = arguments.length > 2 ? _.toArray(arguments).slice(2) : [];
            message = stringify(message);
            if (message) {
                message = message.replace(/\$\$\$/g, function() {
                    return stringify(args.shift());
                });
            }
            log('DynamicLightRecorder ' + Date.now() 
                + ' ' + logger.getLabel(level) + ' : '
                + (shouldLog(logger.TRACE) ? logger.prefixString : '') 
                +  message);
        };
        
        _.each(logger, function(level, levelName) {
            logger[levelName.toLowerCase()] = _.partial(outputLog.bind(logger), level);
        });
        
        logger.wrapModule = function(modToWrap) {
            if (shouldLog(logger.TRACE)) {
                _.chain(modToWrap)
                    .functions()
                    .each(function(funcName){
                        var origFunc = modToWrap[funcName];
                        modToWrap[funcName] = logger.wrapFunction(funcName, origFunc, modToWrap.logWrap);
                    });
                modToWrap.isLogWrapped = true;
            }
        };
        
        logger.wrapFunction = function(name, func, moduleName) {
            if (shouldLog(logger.TRACE)) {
                if (name === 'toJSON') { return func; }
                return function() {
                    logger.trace('$$$.$$$ starting with args $$$', moduleName, name, arguments);
                    logger.prefixString = logger.prefixString + '  ';
                    var retVal = func.apply(this, arguments);
                    logger.prefixString = logger.prefixString.slice(0, -2);
                    logger.trace('$$$.$$$ ending with return value $$$', moduleName, name, retVal);
                    if (retVal && retVal.logWrap && !retVal.isLogWrapped) {
                        logger.wrapModule(retVal, retVal.logWrap);
                    }
                    return retVal;
                };
            }
            return func;
        };
        return logger;
    })(),
    
    registerEventHandlers = function() {
        on('chat:message', module.handleInput.bind(module));
        on('change:token', module.handleTokenChange.bind(module));
        on('change:path', module.handlePathChange.bind(module));
        on('add:token', module.handleNewToken.bind(module));
        on('destroy:token', module.handleDeleteToken.bind(module));

        /*global ChangeTokenImg */
        if('undefined' !== typeof ChangeTokenImg && ChangeTokenImg.ObserveTokenChange){
            ChangeTokenImg.ObserveTokenChange(module.handleTokenChange.bind(module));
        }
        /*eslint-disable no-undef */
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





