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
    var SAVE_HANDOUT_NAME = 'SavedCustomstatusMarkers';

    /**
     * A class for persisted custom status markers.
     * @param  {String} path
     * @param  {[type]} bbox
     */
    function StatusMarkerTemplate(pathStr, bbox, imgSrc) {
        this.pathStr = pathStr;
        this.bbox = bbox;
        this.imgSrc = imgSrc;
    };

    /**
     * A class encapsulating a Path for a custom status marker, with an optional
     * Text for a number badge.
     * @param {uuid} iconId
     * @param {string} 'path' or 'graphic'
     * @param {uuid} textId
     */
    function StatusMarker(iconId, type, textId) {
        this.iconId = iconId;
        this.type = type;
        this.textId = textId;
    };


    /**
     * @private
     * Calculates the left property for a status marker to be placed on a token.
     * @param  {Graphic} token
     * @param  {int} index
     * @return {number}
     */
    function _calcStatusMarkerLeft(token, index) {
        var leftOffset = _calcStatusMarkerOffset(token, index);
        return token.get('left') + token.get('width')/2 - PIXELS_PER_SQUARE/6 - leftOffset;
    };


    /**
     * @private
     * Calculates the left-offset for a StatusMarker on a token.
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
    };

    /**
     * @private
     * Calculates the top property of a status marker to be placed on a token.
     * @param  {Graphic} token
     * @return {number}
     */
    function _calcStatusMarkerTop(token) {
        return token.get('top') - token.get('height')/2 + PIXELS_PER_SQUARE/6;
    };

    /**
     * Clears the Custom Status Markers state for a particular token.
     * @param  {Graphic} token
     */
    function clearTokenState(token) {
        var csmState = getState();
        var tokenId = token.get('_id');
        delete csmState.tokens[tokenId];
    };


    /**
     * Creates an instance of a status marker to assign to a token,
     * with an optional count badge.
     * @param {Graphic} token
     * @param {String} statusName
     * @param {int} [count]
     */
    function createTokenStatusMarker(token, statusName, count, index) {
        var template = loadTemplate(statusName);
        var pathStr = template.pathStr;
        var imgSrc = template.imgSrc;
        var bbox = template.bbox;

        var width = bbox.width;
        var height = bbox.height;
        var left = _calcStatusMarkerLeft(token, index);
        var top = _calcStatusMarkerTop(token);

        var page = token.get('_pageid');

        var icon;
        var type;
        if(pathStr) {
            icon = _createTokenStatusMarkerPath(pathStr, left, top, width,
                height, page);
            type = 'path';
        }
        else {
            icon = _createTokenStatusMarkerGraphic(imgSrc, left, top, width,
                height, page);
            type = 'graphic';
        }
        var iconId = icon.get('_id');
        toFront(icon);

        var textId;
        if(count) {
            var text = _createTokenStatusMarkerText(count, left, top, page);
            textId = text.get('_id');
            toFront(text);
        }

        var tokenState = getTokenState(token);
        tokenState.customStatuses[statusName] = new StatusMarker(iconId, type,
            textId);
        tokenState.customStatusesCount++;
    };

    /**
     * @private
     * @param  {String} imgSrc
     * @param  {number} left
     * @param  {number}} top
     * @param  {number} width
     * @param  {number} height
     * @return {Graphic}
     */
    function _createTokenStatusMarkerGraphic(imgSrc, left, top, width, height,
      page) {
        var scale = getStatusMarkerIconScale(width, height);

        return createObj('graphic', {
            _pageid: page,
            imgsrc: imgSrc,
            layer: 'objects',
            left: left,
            top: top,
            width: width*scale,
            height: height*scale
        });
    };

    /**
     * @private
     * @param  {String} pathStr
     * @param  {number} left
     * @param  {number} top
     * @param  {number} width
     * @param  {number} height
     * @return {Path}
     */
    function _createTokenStatusMarkerPath(pathStr, left, top, width, height,
      page) {
        var scale = getStatusMarkerIconScale(width, height);

        return createObj('path', {
            _pageid: page,
            _path: pathStr,
            layer: 'objects',
            stroke: 'transparent',
            fill: '#000',
            left: left,
            top: top,
            width: width,
            height: height,
            scaleX: scale,
            scaleY: scale
        });
    };

    /**
     * @private
     * @param  {String} count
     * @param  {number} left
     * @param  {number} top
     * @return {Text}
     */
    function _createTokenStatusMarkerText(count, left, top, page) {
        return createObj('text', {
            _pageid: page,
            layer: 'objects',
            color: '#f00',
            text: count,
            left: left + PIXELS_PER_SQUARE/8,
            top: top + PIXELS_PER_SQUARE/8
        });
    };

    /**
     * Deletes a custom status marker.
     * @param  {string}   statusName
     */
    function deleteStatusMarker(statusName) {
        var csmState = getState();
        delete csmState.templates[statusName];
        sendChat('CustomStatus script', 'Deleted status ' + statusName);
    };


    /**
     * Deletes a custom status marker from a token.
     * @param {Graphic} token
     * @param {String} statusName
     */
    function deleteTokenStatusMarker(token, statusName) {
        var csmState = getState();
        var id = token.get('_id');
        var tokenState = csmState.tokens[id];

        if(tokenState) {
            var statusMarker = tokenState.customStatuses[statusName];
            var type = statusMarker.type;
            var icon = findObjs({
                _page: _getCurPage(),
                _type: type,
                _id: statusMarker.iconId
            })[0];

            icon.remove();

            var text = findObjs({
                _page: _getCurPage(),
                _type: 'text',
                _id: statusMarker.textId
            })[0];
            if(text)
                text.remove();

            delete tokenState.customStatuses[statusName];
            tokenState.customStatusesCount--;
        }
    };

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
    };


    /**
     * @private
     * Gets the current players' page.
     * @return {uuid}
     */
    function _getCurPage() {
        var curPage = Campaign().get("playerpageid");
    };

    /**
     * @private
     * Gets the BoundingBox of a Graphic.
     * @param {Graphic} graphic
     * @return {PathMath.BoundingBox}
     */
    function _getGraphicBoundingBox(graphic) {
        var left = graphic.get('left');
        var top = graphic.get('top');
        var width = graphic.get('width');
        var height = graphic.get('height');

        return new PathMath.BoundingBox(left, top, width, height);
    };


    /**
     * @private
     * Extracts the selected graphics from a chat message.
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
    };

    /**
     * Extracts the selected paths from a chat message.
     * @param {ChatMessage} msg
     * @return {Path[]}
     */
    function _getPathsFromMsg(msg) {
        var result = [];

        var selected = msg.selected;
        if(selected) {
            _.each(selected, function(s) {
                var matches = findObjs({
                    _type: 'path',
                    _id: s._id
                });

                if(matches && matches.length > 0) {
                    result.push(matches[0]);
                }
            });
        }

        return result;
    };

    /**
     * Returns this module's object for the Roll20 API state.
     * @return {Object}
     */
    function getState() {
        if(!state.CustomStatusMarkersModule)
            state.CustomStatusMarkersModule = {
                tokens: {},
                templates: {}
            };
        return state.CustomStatusMarkersModule;
    };


    /**
     * Returns the scale for a status marker's icon.
     * @param {number} width
     * @param {number} height
     * @return {number}
     */
    function getStatusMarkerIconScale(width, height) {
        var length = Math.max(width, height);
        return PIXELS_PER_SQUARE / length / 3;
    };

    /**
     * Returns the Custom Status Markers state for a token.
     * @param  {Graphic} token
     * @param {boolean} [createBlank: true] If the token state doesn't exist, create it.
     * @return {Object}
     */
    function getTokenState(token, createBlank) {
        if(createBlank === undefined)
            createBlank = true;

        var csmState = getState();
        var tokenId = token.get('_id');
        var tokenState = csmState.tokens[tokenId];

        if(!tokenState && createBlank) {
            tokenState = csmState.tokens[tokenId] = {
                customStatuses: {},
                customStatusesCount: 0
            };
        }
        return tokenState;
    };


    /**
     * Loads a StatusMarkerTemplate from the save handout.
     * @param  {String}   statusName
     * @param  {Function(StatusMarkerTemplate)} callback
     */
    function loadTemplate(statusName, callback) {
        var csmState = getState();
        var tpl = csmState.templates[statusName];

        return new StatusMarkerTemplate(tpl.pathStr, tpl.bbox, tpl.imgSrc);
    };

    /**
     * Moves a status marker to its token's current position.
     * @param  {Graphic} token
     * @param  {Object} statusMarker
     * @param  {int} index
     * @return {string} An error message. Undefined if no error.
     */
    function moveTokenStatusMarker(token, statusMarker, index) {
        var left = _calcStatusMarkerLeft(token, index);
        var top = _calcStatusMarkerTop(token);

        var icon = findObjs({
            _page: _getCurPage(),
            _type: statusMarker.type,
            _id: statusMarker.iconId
        })[0];
        if(!icon)
            return 'Icon ' + statusMarker.iconId + ' is missing.';

        icon.set('left', left);
        icon.set('top', top);
        toFront(icon);

        if(statusMarker.textId) {
            var text = findObjs({
                _page: _getCurPage(),
                _type: 'text',
                _id: statusMarker.textId
            })[0];
            if(!text)
                return 'Text ' + statusMarker.textId + ' is missing.';

            text.set('left', left + PIXELS_PER_SQUARE/8);
            text.set('top', top + PIXELS_PER_SQUARE/8);
            toFront(text);
        }
    };

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
            delete state.CustomStatusMarkersModule;
        }
    };

    /**
     * @private
     * Process an API command to delete a saved custom status marker.
     * @param  {ChatMessage} msg
     */
    function _processDelMarkerCmd(msg) {
        var args = msg.content.split(' ');
        var statusName = args[1];

        deleteStatusMarker(statusName);
    };

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
    };

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
        if(paths.length > 0) {
            var bbox = PathMath.getBoundingBox(paths);
            var mergedPathStr = PathMath.mergePathStr(paths);
            saveTemplate(statusName, mergedPathStr, bbox, undefined);
        }

        // Save a graphic-based marker.
        else {
            var bbox = _getGraphicBoundingBox(graphics[0]);
            var imgSrc = graphics[0].get('imgsrc');
            saveTemplate(statusName, undefined, bbox, imgSrc);
        }
    };


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
            toggleStatusToToken(token, statusName, count);
        });
    };


    /**
     * Moves a custom status for a token by deleting it and then recreating it at
     * the token's current location.
     * @param {Graphic} token
     * @param {String} statusName
     * @param {String} count
     */
    function replaceTokenStatusMarker(token, statusName, count, index) {
        deleteTokenStatusMarker(token, statusName);
        createTokenStatusMarker(token, statusName, count, index);
    };


    /**
     * Persists a custom status marker.
     * @param {String} statusName
     * @param {String} pathStr
     * @param {BoundingBox} bbox
     * @param {String} imgSrc
     */
    function saveTemplate(statusName, pathStr, bbox, imgSrc) {
        var csmState = getState();
        if(imgSrc)
            imgSrc = _getCleanImgsrc(imgSrc); //imgSrc.replace(/(max|med)\.png/,'thumb.png');

        csmState.templates[statusName] = new StatusMarkerTemplate(pathStr, bbox, imgSrc);
        sendChat('CustomStatus script', 'Created status ' + statusName);
    };


    /**
     * Toggles a custom status marker on a token, with an optional count badge.
     * @param  {Graphic} token
     * @param  {String} statusName
     * @param  {String} [count]
     */
    function toggleStatusToToken(token, statusName, count) {
        var tokenState = getTokenState(token);

        var statusMarker = tokenState.customStatuses[statusName];
        if(statusMarker) {
            var hasCount = !!statusMarker.textId;
            if(hasCount || count)
                replaceTokenStatusMarker(token, statusName, count, tokenState.customStatusesCount-1);
            else
                deleteTokenStatusMarker(token, statusName);
        }
        else
            createTokenStatusMarker(token, statusName, count, tokenState.customStatusesCount);
    };


    /**
     * Transfers saved Custom Status Marker templates from older versions
     * (which persisted them in Handouts) to
     * the new version (which persists them in the 'state').
     */
    function _transferLegacyMarkers() {
        var saveHandout = findObjs({
            _type: 'handout',
            name: SAVE_HANDOUT_NAME
        })[0];

        // If there are legacy markers, transfer them.
        if(saveHandout) {
            saveHandout.get('notes', function(notes) {
                var oldTemplates = JSON.parse(notes);
                var csmState = getState();

                _.each(oldTemplates, function(oldTpl, name) {
                    var bbox = oldTpl.bbox;
                    var imgSrc = oldTpl.imgSrc;
                    var pathStr = oldTpl.pathStr;

                    var newTpl = new StatusMarkerTemplate (pathStr, bbox, imgSrc);
                    csmState.templates[name] = newTpl;
                });
            });

            // When we're done, delete the old Handout used to persist the
            // legacy markers.
            saveHandout.remove();
        }
    };

    // Automatically transfer any legacy markers.
    on('ready', function() {
        _transferLegacyMarkers();
    });


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
            log(err);
        }
    });

    // Event handler for moving custom status markers with their tokens when
    // they are moved.
    on('change:graphic', function(graphic) {
        var tokenState = getTokenState(graphic, false);

        if(tokenState) {
            var index = 0;

            _.each(tokenState.customStatuses, function(statusMarker, statusName) {
                var errorMsg = moveTokenStatusMarker(graphic, statusMarker, index);

                // If there was an error while moving the marker (e.g.
                // Someone deleted its graphic instead of unsetting it),
                // then remove the status from the token's state and
                // log a warning.
                if(errorMsg) {
                    delete tokenState.customStatuses[statusName];
                    tokenState.customStatusesCount--;

                    log('Custom Status Markers [WARN]: ' + errorMsg);
                }
                index++;
            });
        }
    });

    // Event handler for destroying a token's custom status markers when the
    // token is destroyed.
    on('destroy:graphic', function(graphic) {
        var csmState = getState();
        var tokenState = getTokenState(graphic, false);

        if(tokenState) {
            _.each(tokenState.customStatuses, function(statusMarker, statusName) {
                deleteTokenStatusMarker(graphic, statusName);
                clearTokenState(graphic);
            });
        }
    });

    return {
        StatusMarkerTemplate: StatusMarkerTemplate,
        StatusMarker: StatusMarker,

        clearTokenState: clearTokenState,
        createTokenStatusMarker: createTokenStatusMarker,
        deleteStatusMarker: deleteStatusMarker,
        deleteTokenStatusMarker: deleteTokenStatusMarker,
        getState: getState,
        getTokenState: getTokenState,
        getStatusMarkerIconScale: getStatusMarkerIconScale,
        loadTemplate: loadTemplate,
        replaceTokenStatusMarker: replaceTokenStatusMarker,
        saveTemplate: saveTemplate,
        toggleStatusToToken: toggleStatusToToken
    };
})();
