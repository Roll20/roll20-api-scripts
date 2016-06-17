/**
 * Custom Status Markers script
 *
 * ###### Required Scripts
 * [Path Math](https://github.com/Roll20/roll20-api-scripts/tree/master/Path%20Math)
 *
 * Allows users to create custom status markers and set them onto tokens.
 *
 * ### Saving status markers
 *
 * 1) Draw your marker using the polygon or freestyle drawing tools.
 * 2) Select your marker drawing and enter '!saveMarker {statusName}' in the
 * chat, where {statusName} is the name you want to save the custom status marker
 * as.
 *
 * e.g. '!saveMarker sleep'
 *
 * When the marker is saved, a confirmation message will be displayed in the chat.
 *
 * ### Setting/toggling status markers on tokens
 *
 * 1) Select one or more tokens to assign the status maker to.
 * 2) In the chat, enter the '!setMarker {statusName} [{count}]',
 * where {statusName} is the name of the saved custom status marker and [{count}]
 * is an optional number badge to put on the status marker.
 *
 * If the status marker will be toggled for each selected token. If count is
 * specified, the status marker will include count as a text badge.
 */
CustomStatusMarkers = (function() {
    var SAVE_MARKER_CMD = '!saveMarker';
    var SET_MARKER_CMD = '!setMarker';
    var LIST_MARKERS_CMD = '!listMarkers';
    var DEL_MARKER_CMD = '!delMarker';
    var CLEAR_STATE_CMD = '!clearMarkersState';

    var PIXELS_PER_SQUARE = 70;

    /**
     * A persisted template for a custom status marker.
     * @typedef {object} StatusMarkerTemplate
     * @property {string} type
     *           'path' or 'graphic'
     * @property {string} src
     *           For a path-type marker, this is the _path string defining its
     *           Path.
     *           For a graphic-type marker, this is the URL of its image.
     * @property {PathMath.BoundingBox} bbox
     *           The marker's bounding box.
     */

    /**
     * A rendered custom status marker with an optional number badge.
     * @typedef {object} StatusMarker
     * @property {string} name
     *           The name of the status.
     * @property {string} type
     *           'path' or 'graphic'
     * @property {uuid} iconId
     *           The _id of the marker's Path or Graphic.
     * @property {uuid} [textId]
     *           The _id of the Text object for the marker's number badge.
     *           If omitted, then the marker has no badge.
     * @property {uuid} tokenId
     *           The _id of the token the marker is assigned to.
     * @property {int} [count]
     *           The displayed count for the badge.
     */

    var statusListeners = {
      'add': [],
      'change': [],
      'remove': []
    };

     /**
      * Adds a custom status marker to a token, with an optional count badge.
      * @param  {Graphic} token
      * @param  {String} statusName
      * @param  {String} [count]
      * @param {boolean} [silent=false]
      */
     function addStatusMarker(token, statusName, count, silent) {
         removeStatusMarker(token, statusName, true);
         _createTokenStatusMarker(token, statusName, count);
         repositionStatusMarkers(token);

         if(!silent) {
           var statusMarker = _getTokenState(token).customStatuses[statusName];
           _fireAddEvent(token, statusMarker);
         }
     }

    /**
     * Calculates the left property for a status marker to be placed on a token.
     * @private
     * @param  {Graphic} token
     * @param  {int} index
     * @return {number}
     */
    function _calcStatusMarkerLeft(token, index) {
        var leftOffset = _calcStatusMarkerOffset(token, index);
        return token.get('left') + token.get('width')/2 - PIXELS_PER_SQUARE/6 - leftOffset;
    }


    /**
     * Calculates the left-offset for a StatusMarker on a token.
     * @private
     * @param {Graphic} token
     * @param {int} index
     */
    function _calcStatusMarkerOffset(token, index) {
        var statusMarkers = token.get('statusmarkers');
        if(statusMarkers)
            statusMarkers = statusMarkers.split(',');
        else
            statusMarkers = [];

        return (statusMarkers.length + index) * PIXELS_PER_SQUARE/3;
    }

    /**
     * Calculates the top property of a status marker to be placed on a token.
     * @private
     * @param  {Graphic} token
     * @return {number}
     */
    function _calcStatusMarkerTop(token) {
        return token.get('top') - token.get('height')/2 + PIXELS_PER_SQUARE/6;
    }

    /**
     * Clears the Custom Status Markers state for a particular token.
     * @param  {Graphic} token
     */
    function clearTokenState(token) {
        var csmState = getState();
        var tokenId = token.get('_id');
        delete csmState.tokens[tokenId];
    }

    /**
     * Creates an instance of a status marker and assign it to a token.
     * @private
     * @param {Graphic} token
     * @param {String} statusName
     * @param {int} [count]
     *        Number for an optional icon badge.
     */
    function _createTokenStatusMarker(token, statusName, count) {
        var template = getTemplate(statusName);
        var page = token.get('_pageid');

        // Create the icon.
        var icon;
        if(template.type === 'path')
            icon = _createTokenStatusMarkerPath(template, page);
        else
            icon = _createTokenStatusMarkerGraphic(template, page);
        var iconId = icon.get('_id');
        toFront(icon);

        // Create the badge if count was specified.
        var textId;
        if(!_.isUndefined(count)) {
            var text = _createTokenStatusMarkerText(count, page);
            textId = text.get('_id');
            toFront(text);
        }

        var tokenState = _getTokenState(token);
        tokenState.customStatuses[statusName] = {
            name: statusName,
            type: template.type,
            iconId: iconId,
            textId: textId,
            tokenId: token.get('_id'),
            count: count
        };
    }

    /**
     * @private
     */
    function _createTokenStatusMarkerGraphic(template, page) {
        var width = template.bbox.width;
        var height = template.bbox.height;
        var scale = _getStatusMarkerIconScale(width, height);

        return createObj('graphic', {
            _pageid: page,
            imgsrc: template.src,
            layer: 'objects',
            left: -9999,
            top: -9999,
            width: width*scale,
            height: height*scale
        });
    }

    /**
     * @private
     */
    function _createTokenStatusMarkerPath(template, page) {
        var width = template.bbox.width;
        var height = template.bbox.height;
        var scale = _getStatusMarkerIconScale(width, height);

        return createObj('path', {
            _pageid: page,
            _path: template.src,
            layer: 'objects',
            stroke: 'transparent',
            fill: '#000',
            left: -9999,
            top: -9999,
            width: width,
            height: height,
            scaleX: scale,
            scaleY: scale
        });
    }

    /**
     * @private
     */
    function _createTokenStatusMarkerText(count, page) {
        return createObj('text', {
            _pageid: page,
            layer: 'objects',
            color: '#f00',
            text: count,
            left: -9999,
            top: -9999
        });
    }

    /**
     * Deletes a custom status marker template.
     * @param  {string}   statusName
     */
    function deleteTemplate(statusName) {
        var csmState = getState();
        delete csmState.templates[statusName];
        sendChat('CustomStatus script', 'Deleted status ' + statusName);
    }

    /**
     * Fires an 'add' custom status markers event.
     * @private
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    function _fireAddEvent(token, marker) {
      var handlers = statusListeners['add'];
      _.each(handlers, function(handler) {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Fires a 'change' custom status markers event.
     * @private
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    function _fireChangeEvent(token, marker) {
      var handlers = statusListeners['change'];
      _.each(handlers, function(handler) {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Fires a 'remove' custom status markers event.
     * @private
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    function _fireRemoveEvent(token, marker) {
      var handlers = statusListeners['remove'];
      _.each(handlers, function(handler) {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Cookbook.getCleanImgsrc
     * https://wiki.roll20.net/API:Cookbook#getCleanImgsrc
     */
    function _getCleanImgsrc(imgsrc) {
         var parts = imgsrc.match(/(.*\/images\/.*)(thumb|max)(.*)$/);
         if(parts) {
            return parts[1]+'thumb'+parts[3];
         }
         return;
    }

    /**
     * Gets the BoundingBox of a Graphic.
     * @private
     * @param {Graphic} graphic
     * @return {PathMath.BoundingBox}
     */
    function _getGraphicBoundingBox(graphic) {
        var left = graphic.get('left');
        var top = graphic.get('top');
        var width = graphic.get('width');
        var height = graphic.get('height');

        return new PathMath.BoundingBox(left, top, width, height);
    }


    /**
     * Extracts the selected graphics from a chat message.
     * @private
     * @param {ChatMessage} msg
     * @return {Graphic[]}
     */
    function _getGraphicsFromMsg(msg) {
        var result = [];

        var selected = msg.selected;
        if(selected) {
            _.each(selected, function(s) {
                var match = findObjs({
                    _type: 'graphic',
                    _id: s._id
                })[0];

                if(match)
                    result.push(match);
            });
        }

        return result;
    }

    /**
     * Extracts the selected paths from a chat message.
     * @private
     * @param {ChatMessage} msg
     * @return {Path[]}
     */
    function _getPathsFromMsg(msg) {
        var result = [];

        var selected = msg.selected;
        if(selected) {
            _.each(selected, function(s) {
                var match = findObjs({
                    _type: 'path',
                    _id: s._id
                })[0];

                if(match)
                    result.push(match);
            });
        }

        return result;
    }

    /**
     * Returns this module's object for the Roll20 API state.
     * @return {Object}
     */
    function getState() {
        if(!state.CustomStatusMarkers)
            state.CustomStatusMarkers = {
                tokens: {},
                templates: {}
            };
        return state.CustomStatusMarkers;
    }

    /**
     * Gets the names of all the custom status markers on a token.
     * @param {Graphic} token
     * @return {string[]}
     */
    function getStatusMarkers(token) {
      var tokenState = _getTokenState(token);
      if(token) {
        return _.keys(tokenState.customStatuses);
      }
      return [];
    }

    /**
     * Returns the scale for a status marker's icon.
     * @private
     * @param {number} width
     * @param {number} height
     * @return {number}
     */
    function _getStatusMarkerIconScale(width, height) {
        var length = Math.max(width, height);
        return PIXELS_PER_SQUARE / length / 3;
    }

    /**
     * Loads a StatusMarkerTemplate from the module state.
     * @param  {String}   statusName
     * @param  {Function(StatusMarkerTemplate)} callback
     */
    function getTemplate(statusName, callback) {
        var csmState = getState();
        return csmState.templates[statusName];
    }

    /**
     * Returns the Custom Status Markers state for a token.
     * @private
     * @param  {Graphic} token
     * @param {boolean} [createBlank: true] If the token state doesn't exist, create it.
     * @return {Object}
     */
    function _getTokenState(token, createBlank) {
        if(createBlank === undefined)
            createBlank = true;

        var csmState = getState();
        var tokenId = token.get('_id');
        var tokenState = csmState.tokens[tokenId];

        if(!tokenState && createBlank) {
            tokenState = csmState.tokens[tokenId] = {
                customStatuses: {}
            };
        }
        return tokenState;
    }

    /**
     * Checks if a token has the custom status marker with the specified name.
     * @param {graphic} token
     * @param {string} statusName
     * @return {boolean}
     *         True iff the token has the custom status marker active.
     */
    function hasStatusMarker(token, statusName) {
      var tokenState = _getTokenState(token, false);
      if(tokenState) {
        return tokenState.customStatuses[statusName];
      }
      return false;
    }

    /**
     * Registers a Custom Status Markers event handler.
     * Each handler takes a token and a StatusMarker as parameters.
     * The following events are supported: 'add', 'change', 'remove'
     * @param {string} event
     * @param {function} handler
     */
    function onEvent(event, handler) {
      if(statusListeners[event]) {
        statusListeners[event].push(handler);
      }
    }

    /**
     * @private
     * Process an API command to clear the Custom Status Markers state.
     * If a token selected, then only the CSM state for that token will be cleared.
     * If the 'tokens' option is specified, then only the CSM's tokens state
     * will be cleared and its saved templates will be left intact.
     * If 'tokens' isn't specified and no token is selected, then this will
     * clear all the CSM state!
     * @param  {ChatMessage} msg
     */
    function _processClearMarkersStateCmd(msg) {
        var args = msg.content.split(' ');
        var token = _getGraphicsFromMsg(msg)[0];

        if(token) {
            clearTokenState(token);
        }
        else if(args[1] === 'tokens') {
            getState().tokens = {};
        }
        else {
            delete state.CustomStatusMarkers;
        }
    }

    /**
     * @private
     * Process an API command to delete a saved custom status marker.
     * @param  {ChatMessage} msg
     */
    function _processDelMarkerCmd(msg) {
        var args = msg.content.split(' ');
        var statusName = args[1];

        deleteTemplate(statusName);
    }

    /**
     * @private
     * Processes an API command to display the list of saved custom status markers.
     */
    function _processListMarkersCmd() {
        var csmState = getState();
        log(csmState);

        var names = [];
        _.each(csmState.templates, function(tpl, name) {
            names.push(name);
        });
        names.sort();
        names = names.join('<br>');
        sendChat('CustomStatus script', 'Saved markers: <br/>' + names);
    }

    /**
     * @private
     * Processes an API command to create a custom status from a selected path.
     * @param {ChatMessage} msg
     */
    function _processSaveMarkerCmd(msg) {
        var args = msg.content.split(' ');
        var statusName = args[1];

        var curPage = Campaign().get("playerpageid");
        var paths = _getPathsFromMsg(msg);
        var graphics = _getGraphicsFromMsg(msg);

        // Save a path-based marker.
        if(paths.length > 0)
            saveTemplate(statusName, paths);

        // Save a graphic-based marker.
        else
            saveTemplate(statusName, graphics[0]);
    }


    /**
     * @private
     * Process an API command to set a custom status to the selected tokens.
     * @param {ChatMessage} msg
     */
    function _processSetMarkerCmd(msg) {
        var args = msg.content.split(' ');
        var statusName = args[1];
        var count = args[2];

        var selectedTokens = _getGraphicsFromMsg(msg);
        _.each(selectedTokens, function(token) {
            toggleStatusMarker(token, statusName, count);
        });
    }

    /**
     * Deletes a custom status marker from a token.
     * @param {Graphic} token
     * @param {String} statusName
     * @param {boolean} [silent=false]
     *        If true, events won't be fired.
     * @fires change
     * @fires remove
     */
    function removeStatusMarker(token, statusName, silent) {
        var csmState = getState();
        var id = token.get('_id');
        var tokenState = csmState.tokens[id];

        if(tokenState) {
            var statusMarker = tokenState.customStatuses[statusName];
            if(!statusMarker)
                return;

            var type = statusMarker.type;
            var icon = findObjs({
                _pageid: token.get('_pageid'),
                _type: type,
                _id: statusMarker.iconId
            })[0];
            if(icon)
                icon.remove();

            var text = findObjs({
                _pageid: token.get('_pageid'),
                _type: 'text',
                _id: statusMarker.textId
            })[0];
            if(text)
                text.remove();

            delete tokenState.customStatuses[statusName];
            repositionStatusMarkers(token);

            if(!silent)
              _fireRemoveEvent(token, statusMarker);
        }
    }

    /**
     * Removes all custom status markers from a token.
     * @param {Graphic} token
     * @param {boolean} [silent=false]
     *        If true, events won't be fired.
     */
    function removeStatusMarkers(token, silent) {
        var csmState = getState();
        var tokenState = _getTokenState(token, false);

        if(tokenState) {
            _.each(tokenState.customStatuses, function(statusMarker, statusName) {
                removeStatusMarker(token, statusName, silent);
            });
        }
    }

    /**
     * Moves a status marker to its token's current position.
     * @private
     * @param  {Graphic} token
     * @param  {Object} statusMarker
     * @param  {int} index
     * @throws {Error}
     *         An error is thrown if the marker's expected graphic and badge
     *         are not present. (e.g. someone deleted them)
     */
    function _repositionTokenStatusMarker(token, statusMarker, index) {
        var left = _calcStatusMarkerLeft(token, index);
        var top = _calcStatusMarkerTop(token);

        // Move the icon.
        var icon = findObjs({
            _pageid: token.get('_pageid'),
            _type: statusMarker.type,
            _id: statusMarker.iconId
        })[0];
        if(!icon)
            throw new Error('Icon ' + statusMarker.iconId + ' is missing.');

        icon.set('left', left);
        icon.set('top', top);
        toFront(icon);

        // Move the badge, if the icon marker has one.
        if(statusMarker.textId) {
            var text = findObjs({
                _pageid: token.get('_pageid'),
                _type: 'text',
                _id: statusMarker.textId
            })[0];
            if(!text)
                throw new Error('Text ' + statusMarker.textId + ' is missing.');

            text.set('left', left + PIXELS_PER_SQUARE/8);
            text.set('top', top + PIXELS_PER_SQUARE/8);
            toFront(text);
        }
    }

    /**
     * Moves a token's custom status markers to their correct positions.
     * @param {Graphic} token
     */
    function repositionStatusMarkers(token) {
        var tokenState = _getTokenState(token, false);
        if(tokenState) {
            var index = 0;

            _.each(tokenState.customStatuses, function(statusMarker, statusName) {
                try {
                    _repositionTokenStatusMarker(token, statusMarker, index);
                }
                catch(err) {
                    // If there was an error while moving the marker (e.g.
                    // Someone deleted its graphic instead of unsetting it),
                    // then remove the status from the token's state and
                    // log a warning.
                    delete tokenState.customStatuses[statusName];
                    log('Custom Status Markers [WARN]: ' + err.message);
                }
                index++;
            });
        }
    }

    /**
     * Persists a custom status marker.
     * @param {String} statusName
     * @param {(Graphic|Path|Path[])} icon
     */
    function saveTemplate(statusName, icon) {
        var csmState = getState();
        var bbox, src, type;

        // Path-type icons
        if(_.isArray(icon)) {
          type = 'path';
          src = PathMath.mergePathStr(icon);
          bbox = PathMath.getBoundingBox(icon);
        }
        else if(icon.get('_type') === 'path') {
          type = 'path';
          src = PathMath.mergePathStr([icon]);
          bbox = PathMath.getBoundingBox(icon);
        }

        // Graphic-type icons
        else {
          type = 'graphic';
          bbox = _getGraphicBoundingBox(icon);
          src = _getCleanImgsrc(icon.get('imgsrc'));
        }

        csmState.templates[statusName] = {
          type: type,
          bbox: bbox,
          src: src
        };
        sendChat('CustomStatus script', 'Created status ' + statusName);
    }


    /**
     * Toggles a custom status marker on a token, with an optional count badge.
     * @param  {Graphic} token
     * @param  {String} statusName
     * @param  {String} [count]
     * @param {boolean} [silent=false]
     */
    function toggleStatusMarker(token, statusName, count, silent) {
        var tokenState = _getTokenState(token);

        var statusMarker = tokenState.customStatuses[statusName];
        if(statusMarker) {
            var hasCount = !!statusMarker.textId;
            if(hasCount || count) {
                addStatusMarker(token, statusName, count, true);

                if(!silent) {
                  var statusMarker = _getTokenState(token).customStatuses[statusName];
                  _fireChangeEvent(token, statusMarker);
                }
            }
            else
                removeStatusMarker(token, statusName, silent);
        }
        else
            addStatusMarker(token, statusName, count, silent);
    }

    /**
     * Removes a custom status marker event handler.
     * @param {string} event
     * @param {function} handler
     */
    function unEvent(event, handler) {
      var handlers = statusListeners[event];
      if(handlers) {
        var index = handlers.indexOf(handler);
        if(index !== -1)
          handlers.splice(index, 1);
      }
    }


    // Event handler for the script's API chat commands.
    on('chat:message', function(msg) {
        try {
            if(msg.content.indexOf(SAVE_MARKER_CMD) === 0)
                _processSaveMarkerCmd(msg);
            else if(msg.content.indexOf(SET_MARKER_CMD) === 0)
                _processSetMarkerCmd(msg);
            else if(msg.content.indexOf(LIST_MARKERS_CMD) === 0)
                _processListMarkersCmd(msg);
            else if(msg.content.indexOf(DEL_MARKER_CMD) === 0)
                _processDelMarkerCmd(msg);
            else if(msg.content.indexOf(CLEAR_STATE_CMD) === 0)
                _processClearMarkersStateCmd(msg);
        }
        catch(err) {
            sendChat('Custom status markers Error', '/w ' + msg.who + ' bad command: ' + msg.content);
            log('Custom Status Markers ERROR: ' + err.message);
        }
    });

    // Event handler for moving custom status markers with their tokens when
    // they are moved.
    on('change:graphic', function(graphic) {
        repositionStatusMarkers(graphic);
    });

    // Event handler for destroying a token's custom status markers when the
    // token is destroyed.
    on('destroy:graphic', function(graphic) {
        removeStatusMarkers(graphic);
    });

    return {
        addStatusMarker: addStatusMarker,
        clearTokenState: clearTokenState,
        deleteTemplate: deleteTemplate,
        getState: getState,
        getStatusMarkers: getStatusMarkers,
        getTemplate: getTemplate,
        hasStatusMarker: hasStatusMarker,
        on: onEvent,
        removeStatusMarker: removeStatusMarker,
        removeStatusMarkers: removeStatusMarkers,
        repositionStatusMarkers: repositionStatusMarkers,
        saveTemplate: saveTemplate,
        toggleStatusMarker: toggleStatusMarker,
        un: unEvent
    };
})();
