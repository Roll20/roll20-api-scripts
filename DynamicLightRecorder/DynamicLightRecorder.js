// Github:    https://github.com/symposion/roll20-api-scripts/   
// By:       Lucian Holland

var DynamicLightRecorder = DynamicLightRecorder || (function() {
    'use strict';

    var version = '0.2',
        schemaVersion = 0.2,
        
    checkInstall = function() {
        log('-=> DynamicLightRecorder v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'DynamicLightRecorder') || state.DynamicLightRecorder.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.DynamicLightRecorder && state.DynamicLightRecorder.version) {
                case '0.1':
                    _.each(state.DynamicLightRecorder.tilePaths, function(tilePath) {
                        var tileToken = getObj('graphic', tilePath.tileId);
                        if (tileToken) {
                            tileToken.set('controlledby', tilePath.pathIds.join(','));
                        }
                    });
                    delete state.DynamicLightRecorder.tilePaths;
                    break;
                default:
                    state.DynamicLightRecorder = {
                        version: schemaVersion,
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
        var args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!dl-attach':
                attach(msg.selected, !_.isEmpty(args) && args.shift() === 'overwrite');
                break;
            case '!dl-dump':
                sendChat('DynamicLightRecorder', JSON.stringify(state.DynamicLightRecorder));
                break;
            case '!dl-wipe':
                sendChat('DynamicLightRecorder', 'Wiping all data');
                state.DynamicLightRecorder.tilePaths = {};
                state.DynamicLightRecorder.tileTemplates = {};
                break;
            case '!dump-obj':
                sendChat('', JSON.stringify(_.map(msg.selected, function(obj){ return getObj(obj._type, obj._id)})));
                break;
            default:
            //Do nothing
        }
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
                    layer: 'walls'
                };
                return savedPath;
            })
        };
        state.DynamicLightRecorder.tileTemplates[tile.get('imgsrc')] = template;
        
    },
    
    handleNewToken = function(token) {
        var template = state.DynamicLightRecorder.tileTemplates[token.get('imgsrc')];
        if (!template) {
            log('no template found')
            return;
        }
        
        drawTokenPaths(token, template);   
    },
    
    handleTokenChange = function(token, previous) {
        var template = state.DynamicLightRecorder.tileTemplates[token.get('imgsrc')];
        if (template) {
            deleteTokenPaths(token);
            drawTokenPaths(token, template);
        }
    },
  
    drawTokenPaths = function(token, template) {
        log(token);
        var paths = makeWorkingTemplate(template, token)
            .logme()
            .flip()
            .logme()
            .rotate()
            .logme()
            .scale()
            .logme()
            .buildPaths();
        log(paths);
        token.set("controlledby", _.pluck(paths, 'id').join(','));
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
    },
    
    deleteTokenPaths = function(token) {
         log('deleting paths for token ' + token.id);
        var paths = getPathsForToken(token);
        _.invoke(_.compact(paths), 'remove');
    },
    
    getPathsForToken = function(token) {
        var pathIds = token.get('controlledby').split(',');
        
        var paths = _.map(pathIds, function(pathId) {
            var path = getObj('path', pathId);
            if (!path) {
                log('Warning, path with id [' + pathId + '] that should have been attached to token ' + JSON.stringify(token) + ' was not present.');
            }
            return path;
        });
        return paths;
    },
    
    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:token', handleTokenChange);
        on('add:token', handleNewToken);
        on('destroy:graphic', handleDeleteToken);
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
