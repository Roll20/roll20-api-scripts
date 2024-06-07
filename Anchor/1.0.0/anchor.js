var Anchor = Anchor || (function()
{
    'use strict';
    
    var script = {};
    script.info =
    {
        name: 'Anchor',
        version: '0.0.1',
        token: '!anchor'
    };
    
    var reply = function(msg, tagOrText, text)
    {
        var tag = '';
        if(text === undefined)
        {
            text = tagOrText;
        }
        else
        {
            tag = ' [' + tagOrText + ']';
        }
        var recipient = msg.who.split(' ')[0];
        sendChat(script.info.name+tag, '/w ' + recipient + ' ' + text);
    },
    
    usage = function(msg)
    {
        reply(msg, "Usage", script.info.token + ' <anchor_id> [ignore-selected <child_id>] [<children_ids>...]');
        reply(msg, "Usage",'anchor_id: The id of the token to be used as the anchor token.');
        reply(msg, "Usage",'ignore-selected (optional): Provide this argument to not anchor the selected token to the anchor token.');
        reply(msg, "Usage",'child_id (required with ignore-selected): The id of the token you want to anchor to the anchor token.');
        reply(msg, "Usage",'children_ids (optional): Any additional token ids which you want to anchor to the anchor token. Note that this can be used even if ignore-selected is not provided.');
    },



    isValidId = function(objId)
    {
        return getObj('graphic', objId) ? true : false;
    },
    
    newAnchorInfo = function(anchor_id, child_id, anchor_left, anchor_top, anchor_rotation)
    {
        var anchor = getObj('graphic', anchor_id);
        var child = getObj('graphic', child_id);
        
        if (anchor && child)
        {
            var anchorTransform = MatrixMath.identity(3);
            anchorTransform = MatrixMath.multiply(
                anchorTransform,
                MatrixMath.translate([anchor.get('left'), anchor.get('top')])
            );
            anchorTransform = MatrixMath.multiply(
                anchorTransform,
                MatrixMath.rotate(anchor.get('rotation')*Math.PI/180)
            );
            
            var childTransform = MatrixMath.identity(3);
            childTransform = MatrixMath.multiply(
                childTransform,
                MatrixMath.translate([child.get('left'), child.get('top')])
            );
            childTransform = MatrixMath.multiply(
                childTransform,
                MatrixMath.rotate(child.get('rotation')*Math.PI/180)
            );
            
            var childRelativeTransform = MatrixMath.identity(3);
            childRelativeTransform = MatrixMath.multiply(
                childRelativeTransform,
                MatrixMath.rotate((360-anchor.get('rotation'))*Math.PI/180)
            );
            childRelativeTransform = MatrixMath.multiply(
                childRelativeTransform,
                MatrixMath.translate([childTransform[2][0]-anchorTransform[2][0], childTransform[2][1]-anchorTransform[2][1]])
            );
            
            var d_left = childRelativeTransform[2][0];
            var d_top = childRelativeTransform[2][1];
            var d_rot = child.get('rotation') - anchor.get('rotation');
            while (d_rot < 0) d_rot += 360;
            
            var anchorInfo = { id: child_id, anchor_id: anchor_id };
            
            if (anchor_left) anchorInfo.left = d_left;
            if (anchor_top) anchorInfo.top = d_top;
            if (anchor_rotation) anchorInfo.rotation = d_rot;
            
            return anchorInfo;
        }
        
        return undefined;
    },
    
    updObjState = function(obj, objState)
    {
        if (objState === undefined)
        {
            objState = addObjState(obj.get('id'));
        }
        objState.left = obj.get('left');
        objState.top = obj.get('top');
        objState.rotation = obj.get('rotation');
    },
    
    newObjState = function(obj_id)
    {
        var obj = getObj('graphic', obj_id);
        if (obj !== undefined)
        {
            var objState = {};
            updObjState(obj, objState);
            return objState;
        }
        return undefined;
    },
    
    addObjState = function(obj_id)
    {
        if (obj_id !== undefined)
        {
            return state.Anchor.objectStates[obj_id] = state.Anchor.objectStates[obj_id] || newObjState(obj_id);
        }
        return undefined;
    },
    
    updateAnchor = function(child_id, anchor_id, anchor_left, anchor_top, anchor_rotation)
    {
        if (child_id === anchor_id || anchor_id === undefined)
        {
            delete state.Anchor.lockedObjects[child_id];
        }
        if (!(child_id in state.Anchor.lockedObjects) || state.Anchor.anchorInfoByChildId[child_id] === undefined || state.Anchor.anchorInfoByChildId[child_id].anchor_id != anchor_id)
        {
            if (state.Anchor.anchorInfoByChildId[child_id] !== undefined)
            {
                var oldAnchorId = state.Anchor.anchorInfoByChildId[child_id].anchor_id;
                if (oldAnchorId != anchor_id && oldAnchorId in state.Anchor.anchorChildrenByAnchorId)
                {
                    delete state.Anchor.anchorChildrenByAnchorId[oldAnchorId][child_id];
                    if (_.keys(state.Anchor.anchorChildrenByAnchorId[oldAnchorId]).length == 0)
                    {
                        delete state.Anchor.anchorChildrenByAnchorId[oldAnchorId];
                        if (!(oldAnchorId in state.Anchor.anchorInfoByChildId))
                        {
                            delete state.Anchor.objectStates[oldAnchorId];
                        }
                    }
                }
            }
            if (child_id === anchor_id || anchor_id === undefined)
            {
                delete state.Anchor.anchorInfoByChildId[child_id];
                if (!(child_id in state.Anchor.anchorChildrenByAnchorId))
                {
                    delete state.Anchor.objectStates[child_id];
                }
            }
            else
            {
                var anchorInfo = state.Anchor.anchorInfoByChildId[child_id] = newAnchorInfo(anchor_id, child_id, anchor_left, anchor_top, anchor_rotation);
                var anchorChildren = state.Anchor.anchorChildrenByAnchorId[anchor_id] = state.Anchor.anchorChildrenByAnchorId[anchor_id] || {};
                anchorChildren[child_id] = child_id;
            }
        }
    },
    
    updateAnchors = function(anchor_id, child_ids, anchor_left, anchor_top, anchor_rotation)
    {
        addObjState(anchor_id);
        _.each(child_ids, (child_id => addObjState(child_id)));
        _.each(child_ids, (child_id => updateAnchor(child_id, anchor_id, anchor_left, anchor_top, anchor_rotation)));
    },
    
    updateObjectImmediate = function(obj, objState)
    {
        updateObject(obj, objState, true);
    },
    
    updateObject = function(obj, objState, childImmediateUpdate=false)
    {
        if (obj === undefined) return;
        var obj_id = obj.get('id');
        if (obj_id in state.Anchor.anchorInfoByChildId)
        {
            var anchorInfo = state.Anchor.anchorInfoByChildId[obj_id];
            if (anchorInfo === undefined)
            {
                updateAnchor(obj_id, undefined);
                return;
            }
            var anchor_id = anchorInfo.anchor_id;
            var anchor_left = ('left' in anchorInfo);
            var anchor_top = ('top' in anchorInfo);
            var anchor_rotation = ('rotation' in anchorInfo);
            
            if (childImmediateUpdate) updateAnchor(obj_id, anchor_id, anchor_left, anchor_top, anchor_rotation);
            else setTimeout(() => updateAnchor(obj_id, anchor_id, anchor_left, anchor_top, anchor_rotation));
        }
        if (obj_id in state.Anchor.anchorChildrenByAnchorId)
        {
            _.each(state.Anchor.anchorChildrenByAnchorId[obj_id], (child_id => updateChildObject(child_id)));
        }
        updObjState(obj, objState);
    },
    
    updateChildObject = function(child_id)
    {
        var anchorInfo = state.Anchor.anchorInfoByChildId[child_id];
        if (anchorInfo === undefined)
        {
            updateAnchor(child_id, undefined);
            return;
        }
        
        var child = getObj('graphic', child_id);
        var anchor = getObj('graphic', anchorInfo.anchor_id);
        
        if (anchor === undefined)
        {
            updateAnchor(child_id, undefined);
            return;
        }
        if (child === undefined)
        {
            updateAnchor(child_id, undefined);
            return;
        }
        
        var anchorTransform = MatrixMath.identity(3);
        anchorTransform = MatrixMath.multiply(
            anchorTransform,
            MatrixMath.translate([anchor.get('left'), anchor.get('top')])
        );
        anchorTransform = MatrixMath.multiply(
            anchorTransform,
            MatrixMath.rotate(anchor.get('rotation')*Math.PI/180)
        );
        var childTransform = MatrixMath.multiply(
            anchorTransform,
            MatrixMath.translate([(anchorInfo.left || 0), (anchorInfo.top || 0)])
        );
        
        if ('left' in anchorInfo) child.set('left', childTransform[2][0]);
        if ('top' in anchorInfo) child.set('top', childTransform[2][1]);
        if ('rotation' in anchorInfo) child.set('rotation', (anchor.get('rotation') + anchorInfo.rotation) % 360);
        updObjState(child);
        if (child_id in state.Anchor.anchorChildrenByAnchorId)
        {
            _.each(state.Anchor.anchorChildrenByAnchorId[child_id], (grandchild_id => updateChildObject(grandchild_id)));
        }
    },
    
    onDestroyObject = function(obj)
    {
        var obj_id = obj.get('id');
        if (obj_id in state.Anchor.anchorInfoByChildId)
        {
            var anchor_id = state.Anchor.anchorInfoByChildId[obj_id].anchor_id;
            if (anchor_id in state.Anchor.anchorChildrenByAnchorId)
            {
                delete state.Anchor.anchorChildrenByAnchorId[anchor_id][obj_id];
                if (_.keys(state.Anchor.anchorChildrenByAnchorId[anchor_id]).length == 0)
                {
                    delete state.Anchor.anchorChildrenByAnchorId[anchor_id];
                    if (!(anchor_id in state.Anchor.anchorInfoByChildId))
                    {
                        delete state.Anchor.objectStates[anchor_id];
                    }
                }
            }
        }
        if (obj_id in state.Anchor.anchorChildrenByAnchorId)
        {
            _.each(state.Anchor.anchorChildrenByAnchorId[obj_id], (child_id => updateAnchor(child_id)));
            delete state.Anchor.anchorChildrenByAnchorId[obj_id];
        }
        delete state.Anchor.objectStates[obj_id];
    },
    
    pollUpdates = function()
    {
        _.each(state.Anchor.lockedObjects, function(objId)
        {
            if (objId in state.Anchor.anchorInfoByChildId)
            {
                updateChildObject(objId);
            }
        });
        _.each(state.Anchor.objectStates, function(objState, objId)
        {
            var obj = getObj('graphic', objId);
            if (obj === undefined)
            {
                delete state.Anchor.objectStates[objId];
            }
            else if (obj.get('left') != objState.left || obj.get('top') != objState.top || obj.get('rotation') != objState.rotation)
            {
                updateObject(obj, objState);
            }
        });
    },
    
    showAnchorInfo = function(msg, id)
    {
        var output = { id: id, anchor_id: 'None' };
        const isChild = (id in state.Anchor.anchorInfoByChildId);
        if (isChild)
        {
            const anchorInfo = state.Anchor.anchorInfoByChildId[id];
            output = { ...output, ...anchorInfo };
            output.locked = (id in state.Anchor.lockedObjects);
        }
        const isAnchor = (id in state.Anchor.anchorChildrenByAnchorId);
        if (isAnchor)
        {
            const childIds = { child_ids: _.keys(state.Anchor.anchorChildrenByAnchorId[id]) };
            output = { ...output, ...childIds };
        }
        
        var outputStr = `
            id: ${output.id}
            anchor_id: ${output.anchor_id}`;
        if (isChild)
        {
            const anchor_left = _.get(output, 'left', 'Not Anchored');
            const anchor_top = _.get(output, 'top', 'Not Anchored');
            const anchor_rotation = _.get(output, 'rotation', 'Not Anchored');
            outputStr += `
            left: ${anchor_left}
            top: ${anchor_top}
            rotation: ${anchor_rotation}
            locked: ${output.locked}`;
        }
        if (isAnchor)
        {
            outputStr += '\nchild_ids:\n| ' + output.child_ids.join('\n| ');
        }
        
        reply(msg, "Info", '{{'+outputStr+'\n}}');
    },
    
    cleanOutInvalids = function()
    {
        let toDelete = [];
        
        _.each(state.Anchor.anchorChildrenByAnchorId, (_, id)=>{ if (!isValidId(id)) toDelete.push(id); });
        _.each(toDelete, (id)=>delete state.Anchor.anchorChildrenByAnchorId[id]);
        toDelete = [];
        
        _.each(state.Anchor.anchorChildrenByAnchorId, (childIds) =>
        {
            toDelete = [];
            _.each(childIds, (id)=>{ if (!isValidId(id)) toDelete.push(id); });
            _.each(toDelete, (id)=>delete childIds[id]);
        });
        toDelete = [];
        
        _.each(state.Anchor.anchorInfoByChildId, (anchorInfo, id)=>
        {
            if (!isValidId(id) ||
                anchorInfo && (
                    !isValidId(anchorInfo.anchor_id) ||
                    !(anchorInfo.anchor_id in state.Anchor.anchorChildrenByAnchorId) ||
                    !(id in state.Anchor.anchorChildrenByAnchorId[anchorInfo.anchor_id]))
            ) toDelete.push(id);
        });
        _.each(toDelete, (id)=>delete state.Anchor.anchorInfoByChildId[id]);
        toDelete = [];
        
        _.each(state.Anchor.lockedObjects, (_, id)=>{ if (!isValidId(id)) toDelete.push(id); });
        _.each(toDelete, (id)=>delete state.Anchor.lockedObjects[id]);
        toDelete = [];
        
        _.each(state.Anchor.objectStates, (_, id)=>{ if (!isValidId(id) || !(id in state.Anchor.anchorInfoByChildId) && !(id in state.Anchor.anchorChildrenByAnchorId)) toDelete.push(id); });
        _.each(toDelete, (id)=>delete state.Anchor.objectStates[id]);
        toDelete = [];
    },


    
    handleInput = function(msg)
    {
        if(msg.type == 'api' && msg.content.indexOf(script.info.token) !== -1)
        {
            var parseOutArgs = function(argsArrayToParse)
            {
                let parsedOutArgs = {};
                let otherArgs = [...argsArrayToParse];
                const [, ...argsToParseOut] = arguments;
                _.each(argsToParseOut, function(arg)
                {
                    let idx = otherArgs.indexOf(arg);
                    if (idx != -1)
                    {
                        parsedOutArgs[arg] = true;
                        otherArgs.splice(idx, 1);
                    }
                });
                return [parsedOutArgs, otherArgs];
            };
            
            var args = msg.content.replace(script.info.token, '').split(' ').filter(arg=>arg);
            if (args.length >= 1)
            {
                const [{'ignore-selected': ignore_selected, ...commands}, other_args] =
                    parseOutArgs(args,
                                    'usage',
                                    'anchor', 'anchor-x', 'anchor-y', 'anchor-position', 'anchor-rotation',
                                    'remove',
                                    'lock',
                                    'unlock',
                                    'center',
                                    'update',
                                    'info',
                                    'ignore-selected');
                
                const commands_conflicting_with_remove = _.omit(commands, 'remove');
                if (commands.usage ||
                    commands.remove && !_.isEmpty(commands_conflicting_with_remove) ||
                    commands.lock && commands.unlock)
                {
                    usage(msg);
                    return;
                }
                
                const new_anchor = ('anchor' in commands ||
                                    'anchor-x' in commands ||
                                    'anchor-y' in commands ||
                                    'anchor-position' in commands ||
                                    'anchor-rotation' in commands ||
                                    _.isEmpty(commands));
                
                var anchor_points = {};
                if (_.isEmpty(commands) || 'anchor' in commands || 'anchor-position' in commands || 'anchor-x' in commands) anchor_points.left = true;
                if (_.isEmpty(commands) || 'anchor' in commands || 'anchor-position' in commands || 'anchor-y' in commands) anchor_points.top = true;
                if (_.isEmpty(commands) || 'anchor' in commands || 'anchor-rotation' in commands) anchor_points.rotation = true;
                
                
                const min_args_size = (new_anchor ? 1 : 0) + (ignore_selected ? 1 : 0);
                if (other_args.length >= min_args_size)
                {
                    const arg_ids = new_anchor ? other_args.slice(1) : other_args;
                    const child_ids = ((ignore_selected ? [] : _.map(msg.selected, (obj=>obj._id))).concat(arg_ids)).filter(objId=>isValidId(objId));
                    
                    if (new_anchor)
                    {
                        if (isValidId(other_args[0]))
                        {
                            var anchor_left = ('left' in anchor_points);
                            var anchor_top = ('top' in anchor_points);
                            var anchor_rotation = ('rotation' in anchor_points);
                            updateAnchors(other_args[0], child_ids, anchor_left, anchor_top, anchor_rotation);
                        }
                    }
                    else if(commands.remove)
                    {
                        updateAnchors(undefined, child_ids);
                    }
                    
                    if (commands.center)
                    {
                        _.each(child_ids, function(id)
                        {
                            if (id in state.Anchor.anchorInfoByChildId)
                            {
                                var anchorInfo = state.Anchor.anchorInfoByChildId[id];
                                if ('left' in anchorInfo) anchorInfo.left = 0;
                                if ('top' in anchorInfo) anchorInfo.top = 0;
                                if ('rotation' in anchorInfo) anchorInfo.rotation = 0;
                                updateChildObject(id);
                            }
                        });
                    }
                    
                    if (commands.update)
                    {
                        _.each(child_ids, (id=>updateObjectImmediate(getObj('graphic', id))));
                    }
                    
                    if (commands.unlock)
                    {
                        _.each(child_ids, (id=>delete state.Anchor.lockedObjects[id]));
                    }
                    else if (commands.lock)
                    {
                        _.each(child_ids, (id=>(state.Anchor.lockedObjects[id] = id)));
                    }
                    
                    if (commands.info)
                    {
                        _.each(child_ids, (id=>showAnchorInfo(msg, id)));
                    }
                    return;
                }
            }
            usage(msg);
        }
    },

    checkInstall = function()
    {
        log("-=> "+script.info.name+" v"+script.info.version+" Initialized <=-");
    },

    initialize = function()
    {
        state.Anchor = state.Anchor || {};
        state.Anchor.anchorChildrenByAnchorId = state.Anchor.anchorChildrenByAnchorId || {};
        state.Anchor.anchorInfoByChildId = state.Anchor.anchorInfoByChildId || {};
        state.Anchor.objectStates = state.Anchor.objectStates || {};
        state.Anchor.lockedObjects = state.Anchor.lockedObjects || {};
        cleanOutInvalids();
    },
    
    registerEventHandlers = function()
    {
        on('chat:message', handleInput);
        on('change:graphic:left', updateObject);
        on('change:graphic:top', updateObject);
        on('change:graphic:rotation', updateObject);
        on('destroy:graphic', onDestroyObject);
        
        const pollIntervalMs = 1000;
        setInterval(pollUpdates, pollIntervalMs);
    };
    
    
    
    var getCleanImgsrc = function(imgsrc)
    {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts)
        {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };
    
    var copyAttributes = function(type, id, attributes)
    {
        var obj = getObj(type, id);
        var copiedAttributes = {};
        _.each(attributes, function(attr) { copiedAttributes[attr] = obj.get(attr); });
        return copiedAttributes;
    },
    
    copyGraphicAttributes = function(id)
    {
        return copyAttributes('graphc', id, ['compact_bar',
            'imgsrc','bar1_link','bar2_link','bar3_link','represents','left','top','width','height','rotation',
            'layer','isdrawing','flipv','fliph','name','gmnotes','controlledby','bar1_value','bar2_value',
            'bar3_value','bar1_max','bar2_max','bar3_max','aura1_radius','aura2_radius','aura1_color',
            'aura2_color','aura1_square','aura2_square','tint_color','statusmarkers','token_markers',
            'showname','showplayers_name','showplayers_bar1','showplayers_bar2','showplayers_bar3',
            'showplayers_aura1','showplayers_aura2','playersedit_name','playersedit_bar1','playersedit_bar2',
            'playersedit_bar3','playersedit_aura1','playersedit_aura2','light_radius','light_dimradius',
            'light_otherplayers','light_hassight','light_angle','light_losangle','lastmove','light_multiplier',
            'adv_fow_view_distance','light_sensitivity_multiplier','night_vision_effect','bar_location']);
    };
    
    var defaultAnchorObjAttributes = function()
    {
        return {
            width:35,
            height:35,
            aura1_radius:'0',aura1_color:'#00ffff',aura1_square:true,aura1_options:'square',playersedit_aura1:false,
            imgsrc:'https://s3.amazonaws.com/files.d20.io/images/58010319/4S4xdTsHxQGVttCDSPsmnw/max.png?1531339299',
            name:'Anchor'
        };
    };
    
    
    
    var ApiImpl = {};
    
    ApiImpl.getAnchor = function(objId)
    {
        if (isValidId(objId) && objId in state.Anchor.anchorInfoByChildId)
        {
            var anchorId = state.Anchor.anchorInfoByChildId[objId].anchor_id;
            return getObj('graphic', anchorId);
        }
        return undefined;
    };
    
    ApiImpl.getChildren = function(objId)
    {
        if (isValidId(objId) && objId in state.Anchor.anchorChildrenByAnchorId)
        {
            var childIds = state.Anchor.anchorChildrenByAnchorId[objId];
            return _.map(childIds, (childId => getObj('graphic', childId)));
        }
        return [];
    };
    
    ApiImpl.anchorObj = function(objId, anchorId, newAnchor)
    {
        if (!isValidId(objId)) return undefined;
        
        var obj = getObj('graphic', objId);
        
        var newAnchor_is_object = (typeof newAnchor === 'object' && !Array.isArray(newAnchor) && newAnchor !== undefined);
        var newAnchorAttributes = newAnchor_is_object ? newAnchor : {};
        
        newAnchor = newAnchor || (anchorId === undefined);

        if (newAnchor)
        {
            if ('page_id' in newAnchorAttributes)
            {
                newAnchorAttributes.pageid = newAnchorAttributes.page_id;
                delete newAnchorAttributes.page_id;
            }
            
            var attributes = (anchorId !== undefined) ? copyGraphicAttributes(anchorId) : defaultAnchorObjAttributes();
            var childObjAttributes = {left:obj.get('left'), top:obj.get('top'), layer:'gmlayer', pageid:obj.get('_pageid')};
            attributes = { ...attributes, ...childObjAttributes, ...newAnchorAttributes };
            if ('imgsrc' in attributes) attributes.imgsrc = getCleanImgsrc(attributes.imgsrc);
            anchorId = createObj('graphic', attributes).get('id');
        }
        addObjState(anchorId);
        addObjState(objId);
        updateAnchor(objId, anchorId);
        return getObj('graphic', anchorId);
    };
    
    ApiImpl.removeAnchorFromObj = function(objId)
    {
        if (isValidId(objId)) updateAnchor(objId);
    };
    
    ApiImpl.updateObj = function(obj) { updateObjectImmediate(obj); };
    
    ApiImpl.updateChildren = function(obj)
    {
        var objId = obj.get('id');
        if (objId in state.Anchor.anchorChildrenByAnchorId)
        {
            _.each(state.Anchor.anchorChildrenByAnchorId[objId], (childId => updateChildObject(childId)));
            updObjState(obj);
        }
    };
    
    ApiImpl.getPosition = function(obj)
    {
        var objId = obj.get('id');
        if (objId in state.Anchor.anchorInfoByChildId)
        {
            var anchorInfo = state.Anchor.anchorInfoByChildId[objId];
            return [anchorInfo.left, anchorInfo.top];
        }
        else
        {
            return [obj.get('left'), obj.get('top')];
        }
    };
    
    ApiImpl.setPosition = function(obj, position)
    {
        var objId = obj.get('id');
        if (objId in state.Anchor.anchorInfoByChildId)
        {
            var anchorInfo = state.Anchor.anchorInfoByChildId[objId];
            var anchor = getObj('graphic', anchorInfo.anchor_id);
            
            if ('left' in anchorInfo) anchorInfo.left = position[0];
            if ('top' in anchorInfo) anchorInfo.top = position[1];
            
            var anchorTransform = MatrixMath.identity(3);
            anchorTransform = MatrixMath.multiply(
                anchorTransform,
                MatrixMath.translate([anchor.get('left'), anchor.get('top')])
            );
            anchorTransform = MatrixMath.multiply(
                anchorTransform,
                MatrixMath.rotate(anchor.get('rotation')*Math.PI/180)
            );
            var childTransform = MatrixMath.multiply(
                anchorTransform,
                MatrixMath.translate([(anchorInfo.left || position[0]), (anchorInfo.top || position[1])])
            );
            
            obj.set('left', childTransform[2][0]);
            obj.set('top', childTransform[2][1]);
        }
        else
        {
            obj.set('left', position[0]);
            obj.set('top', position[1]);
        }
    };
    
    ApiImpl.updatePosition = function(obj, position)
    {
        ApiImpl.setPosition(obj, position);
        ApiImpl.updateChildren(obj);
    };
    
    ApiImpl.getRotation = function(obj)
    {
        var objId = obj.get('id');
        if (objId in state.Anchor.anchorInfoByChildId)
        {
            var anchorInfo = state.Anchor.anchorInfoByChildId[objId];
            return anchorInfo.rotation;
        }
        else
        {
            return obj.get('rotation');
        }
    };
    
    ApiImpl.setRotation = function(obj, degrees)
    {
        var objId = obj.get('id');
        if (objId in state.Anchor.anchorInfoByChildId)
        {
            var anchorInfo = state.Anchor.anchorInfoByChildId[objId];
            var anchor = getObj('graphic', anchorInfo.anchor_id);
            if ('rotation' in anchorInfo) anchorInfo.rotation = degrees;
            obj.set('rotation', (anchor.get('rotation') + (anchorInfo.rotation || degrees)) % 360);
        }
        else
        {
            obj.set('rotation', degrees % 360);
        }
    };
    
    ApiImpl.updateRotation = function(obj, degrees)
    {
        ApiImpl.setRotation(obj, degrees);
        ApiImpl.updateChildren(obj);
    };
    
    
    
    var API = {
        // Returns the anchor (as a Roll20 obj) of the object.
        // If the object is not anchored or the objId is invalid, returns undefined.
        getAnchor: function(objId) { return ApiImpl.getAnchor(objId); },
        
        // Returns a list of all objects which are anchored to the object.
        // If the object is not an anchor or the objId is invalid, this list will be empty.
        getChildren: function(objId) { return ApiImpl.getChildren(objId); },
        
        // Establishes an object as being anchored to another object.
        // If anchorId is provided, it will be used to identify the anchor object.
        // When anchorId is provided, the functionality differs depending on the value
        //   of newAnchor:
        //     undefined (not provided as an argument):
        //       The existing object identified as the anchor object will be used as the anchor.
        //     false:
        //       Same as undefined
        //     true:
        //       A copy of the anchor object will be created and uses as the anchor instead
        //         of the original anchor object.
        //     {...} (object):
        //       Same as true, except the object will be used to set attributes of the anchor
        //         upon creation.
        // If anchorId is not provided or is set to undefined, a new anchor token will be created on the
        //   same page and position as the object, but on the gm layer and with a rotation of 0. When setting anchorId to
        //   undefined, newAnchor may be set to an object and will operate the same way as it does when
        //   set to an object while anchorId is provided.
        // Returns the anchor object (as a Roll20 obj) regardless of whether a new one was created or not.
        // Returns undefined if objId is invalid.
        anchorObj: function(objId, anchorId /*optional*/, newAnchor/*optional*/) { return ApiImpl.anchorObj(objId, anchorId, newAnchor); },
        
        // Removes the anchor from an child object.
        removeAnchorFromObj: function(objId) { ApiImpl.removeAnchorFromObj(objId); },
        
        // Updates an object's position and rotation relative to its anchor.
        // Also updates the object's children if the object itself is and anchor.
        // Call this whenever your plugin changes the position or rotation of an anchor or child of an anchor.
        updateObj: function(obj) { ApiImpl.updateObj(obj); },
        
        // Gets the object's position [left, top] relative to its anchor's position and rotation.
        // If the object is not anchored to another object, will simply return the object's [left, top] relative to the map.
        getPosition: function(obj) { return ApiImpl.getPosition(obj); },
        
        // Sets the object's position ([left, top]) relative to its anchor's psoition and rotation.
        setPosition: function(obj, position) { ApiImpl.setPosition(obj, position); },
        
        // Equivalent to calling setPosition followed by calling updateChildren.
        updatePosition: function(obj, position) { ApiImpl.updatePosition(obj, position); },
        
        // Gets the object's rotation (in degrees) relative to its anchor's rotation.
        // If the object is not anchored to another object, will simply return the object's rotation relative to the map.
        getRotation: function(obj) { return ApiImpl.getRotation(obj); },
        
        // Sets the object's rotation relative to its anchor's rotation.
        setRotation: function(obj, degrees) { ApiImpl.setRotation(obj, degrees); },
        
        // Equivalent to calling setRotation followed by calling updateChildren.
        updateRotation: function(obj, degrees) { ApiImpl.updateRotation(obj, degrees); }
    };
    
    
    
    return {
        CheckInstall: checkInstall,
        Initialize: initialize,
        RegisterEventHandlers: registerEventHandlers,
        API: API
    };
}());

on("ready", function() {
    'use strict';
    
    Anchor.CheckInstall();
    Anchor.Initialize();
    Anchor.RegisterEventHandlers();
    Anchor = Anchor.API;
});