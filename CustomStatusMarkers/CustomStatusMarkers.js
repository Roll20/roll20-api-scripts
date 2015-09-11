CustomStatusMarkers = (function() {
    var SAVE_MARKER_CMD = '!saveMarker';
    var SET_MARKER_CMD = '!setMarker'

    var PIXELS_PER_SQUARE = 70;
    var SAVE_HANDOUT_NAME = 'SavedCustomstatusMarkers';

    /**
     * A class for persisted custom status markers.
     * @param  {String} path
     * @param  {[type]} bbox
     */
    function StatusMarkerTemplate(pathStr, bbox) {
        this.pathStr = pathStr;
        this.bbox = bbox;
    };

    /**
     * A class encapsulating a Path for a custom status marker, with an optional
     * Text for a number badge.
     * @param {Path} path
     * @param {Text} text
     */
    function StatusMarker(path, text) {
        this.path = path;
        this.text = text;
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
     * Creates an instance of a status marker to assign to a token,
     * with an optional count badge.
     * @param {Graphic} token
     * @param {String} statusName
     * @param {int} [count]
     */
    function createTokenStatusMarker(token, statusName, count, index) {
        var curPage = Campaign().get("playerpageid");

        loadTemplate(statusName, function(savedStatus) {
            var pathStr = savedStatus.pathStr;
            var bbox = savedStatus.bbox;

            var width = bbox.width;
            var height = bbox.height;
            var left = _calcStatusMarkerLeft(token, index);
            var top = _calcStatusMarkerTop(token);
            var scale = PIXELS_PER_SQUARE / height / 3;

            var path = _createTokenStatusMarkerPath(pathStr, left, top, width, height);
            toFront(path);

            var text;
            if(count) {
                text = _createTokenStatusMarkerText(count, left, top);
                toFront(text);
            }

            token.customStatuses[statusName] = new StatusMarker(path, text);
            token.customStatusesCount++;
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
    function _createTokenStatusMarkerPath(pathStr, left, top, width, height) {
        var curPage = Campaign().get("playerpageid");
        var scale = PIXELS_PER_SQUARE / height / 3;

        return createObj('path', {
            _pageid: curPage,
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
    function _createTokenStatusMarkerText(count, left, top) {
        var curPage = Campaign().get("playerpageid");

        return createObj('text', {
            _pageid: curPage,
            layer: 'objects',
            color: '#f00',
            text: count,
            left: left + PIXELS_PER_SQUARE/8,
            top: top + PIXELS_PER_SQUARE/8
        });
    };


    /**
     * @private
     * Creates the handout used to persist the custom icons.
     * @return {Handout}
     */
    function _createSaveHandout() {
        return createObj('handout', {
            name: SAVE_HANDOUT_NAME
        });
    };


    /**
     * Deletes a custom status marker from a token.
     * @param {Graphic} token
     * @param {String} statusName
     */
    function deleteTokenStatusMarker(token, statusName) {
        var statusMarker = token.customStatuses[statusName];
        statusMarker.path.remove();
        if(statusMarker.text)
            statusMarker.text.remove();

        delete token.customStatuses[statusName];
        token.customStatusesCount--;
    };


    /**
     * @private
     * Extracts the selected graphics from a chat message.
     * @param {ChatMessage} msg
     * @return {Graphic[]}
     */
    function _getGraphicsFromMsg(msg) {
        var result = [];
        var curPage = Campaign().get("playerpageid");

        var selected = msg.selected;
        if(selected) {
            _.each(selected, function(s) {
                var match = findObjs({
                    _pageid: curPage,
                    _type: 'graphic',
                    _id: s._id
                })[0];

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
        var curPage = Campaign().get("playerpageid");

        var selected = msg.selected;
        if(selected) {
            _.each(selected, function(s) {
                var matches = findObjs({
                    _pageid: curPage,
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
     * Loads a StatusMarkerTemplate from the save handout.
     * @param  {String}   statusName
     * @param  {Function(StatusMarkerTemplate)} callback
     */
    function loadTemplate(statusName, callback) {
        var saveHandout = findObjs({
            _type: 'handout',
            name: SAVE_HANDOUT_NAME
        })[0];

        saveHandout.get('notes', function(notes) {
            var statusMarkers = JSON.parse(notes);
            var sm = statusMarkers[statusName];

            callback(new StatusMarkerTemplate(sm.pathStr, sm.bbox));
        });
    };

    function moveTokenStatusMarker(token, statusMarker, index) {
        var left = _calcStatusMarkerLeft(token, index);
        var top = _calcStatusMarkerTop(token);

        statusMarker.path.set('left', left);
        statusMarker.path.set('top', top);
        toFront(statusMarker.path);

        if(statusMarker.text) {
            statusMarker.text.set('left', left + PIXELS_PER_SQUARE/8);
            statusMarker.text.set('top', top + PIXELS_PER_SQUARE/8);
            toFront(statusMarker.text);
        }
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
        var bbox = PathMath.getBoundingBox(paths);

        var mergedPathStr = PathMath.mergePathStr(paths);
        saveTemplate(statusName, mergedPathStr, bbox);
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
     */
    function saveTemplate(statusName, pathStr, bbox) {
        var saveHandout = findObjs({
            _type: 'handout',
            name: SAVE_HANDOUT_NAME
        })[0];

        if(!saveHandout)
            saveHandout = _createSaveHandout();

        saveHandout.get('notes', function(notes) {
            var savedMarkers = {};
            if(notes !== 'null')
                savedMarkers = JSON.parse(notes);

            savedMarkers[statusName] = new StatusMarkerTemplate(pathStr, bbox);
            saveHandout.set('notes', JSON.stringify(savedMarkers));
            sendChat('CustomStatus script', 'Created status ' + statusName);
        });
    };


    /**
     * Toggles a custom status marker on a token, with an optional count badge.
     * @param  {Graphic} token
     * @param  {String} statusName
     * @param  {String} [count]
     */
    function toggleStatusToToken(token, statusName, count) {
        if(!token.customStatuses) {
            token.customStatuses = {};
            token.customStatusesCount = 0;
        }

        var statusMarker = token.customStatuses[statusName];
        if(statusMarker) {
            var hasCount = !!statusMarker.text;
            if(hasCount || count)
                replaceTokenStatusMarker(token, statusName, count, token.customStatusesCount-1);
            else
                deleteTokenStatusMarker(token, statusName);
        }
        else
            createTokenStatusMarker(token, statusName, count, token.customStatusesCount);
    };


    // Event handler for the script's API chat commands.
    on('chat:message', function(msg) {
        try {
            if(msg.content.indexOf(SAVE_MARKER_CMD) === 0)
                _processSaveMarkerCmd(msg);
            else if(msg.content.indexOf(SET_MARKER_CMD) === 0)
                _processSetMarkerCmd(msg);
        }
        catch(err) {
            sendChat('Custom status markers Error', '/w ' + msg.who + ' bad command: ' + msg.content);
            log(err);
        }
    });

    // Event handler for moving custom status markers with their tokens when
    // they are moved.
    on('change:graphic', function(graphic) {
        if(graphic.customStatuses) {
            var index = 0;
            _.each(graphic.customStatuses, function(statusMarker, statusName) {
                moveTokenStatusMarker(graphic, statusMarker, index);
                index++;
            });
        }
    });

    // Event handler for destroying a token's custom status markers when the
    // token is destroyed.
    on('destroy:graphic', function(graphic) {
        if(graphic.customStatuses) {
            _.each(graphic.customStatuses, function(statusMarker, statusName) {
                deleteTokenStatusMarker(graphic, statusName);
            });
        }
    });

    return {
        StatusMarkerTemplate: StatusMarkerTemplate,
        StatusMarker: StatusMarker,

        createTokenStatusMarker: createTokenStatusMarker,
        deleteTokenStatusMarker: deleteTokenStatusMarker,
        loadTemplate: loadTemplate,
        replaceTokenStatusMarker: replaceTokenStatusMarker,
        saveTemplate: saveTemplate,
        toggleStatusToToken: toggleStatusToToken
    };
})();
