var WorldMapDiscovery = (function() {

    var PIXELS_PER_SQUARE = 70;
    var VERSION = '1.1';

    /**
     * Causes a location to become discovered.
     * @param {Graphic} location      The location that is being discovered.
     * @param {Graphic} discoverer    The token that discovered the location.
     */
    function discoverLocation(location, discoverer) {
        location.set('layer', 'objects');
        location.set('aura1_radius', '');
        location.set('status_white-tower', false);
        toBack(location);

        var html = '<table style="background-color: #fff; border: solid 1px #000; border-collapse: separate; border-radius: 10px; overflow: hidden; width: 100%;">';
        html += '<thead><tr style="background-color: #000; color: #fff; font-weight: bold;"><th>♜ Location Discovered ♜</th></tr></thead>';
        html += '<tbody><tr><td style="padding: 1px 1em;">';
        html += discoverer.get('name') + ' has discovered ' + location.get('name') + '.';
        html += '</td></tr></tbody></table>';

        sendChat('World Map Discovery', html);
    }

    /**
     * Gets the discovery distance for a location based on its aura's radius.
     * @param {Graphic} location
     * @return {number}
     */
    function getDiscoveryDistance(location) {
        var radiusUnits = location.get('aura1_radius');
        var pageId = location.get('_pageid');
        var page = getObj('page', pageId);
        var pageScale = page.get('scale_number');

        return radiusUnits/pageScale*PIXELS_PER_SQUARE + location.get('width')/2;
    }

    /**
     * Returns the first undiscovered location the token is in range of, or null
     * if the token is not in range of an undiscvered location.
     * @param {Graphic} token
     * @return {Graphic[]}
     */
    function getLocationCollisions(token) {
        var pageId = token.get('_pageid');
        var tokenPt = _getTokenPt(token);

        return _.filter(getLocationTokens(pageId), function(location) {
            var locationPt = _getTokenPt(location);
            var dist = VecMath.dist(tokenPt, locationPt);
            var threshold = getDiscoveryDistance(location);
            return (dist <= threshold);
        });
    }

    /**
     * Returns all location tokens on some page.
     * Undiscovered locations reside on the gm layer.
     * @param {string} pageId
     * @return {Graphic[]}
     */
    function getLocationTokens(pageId) {
        return findObjs({
          _pageid: pageId,
          _type: "graphic",
          'status_white-tower': true,
          layer: "gmlayer"
        });
    }

    /**
     * Gets the location of a token as a point.
     * @private
     * @param {Graphic}
     * @return {vec2}
     */
    function _getTokenPt(token) {
        var x = token.get("left");
        var y = token.get("top");
        return [x, y];
    }

    /**
     * Initialization log
     */
    on('ready', function() {
      log('♜♜♜ Initialized World Map Discovery v' + VERSION + ' ♜♜♜');
    });

    /**
     * When a graphic on the objects layer moves, run the script to see if it
     * passed through any traps.
     */
    on("change:graphic:lastmove", function(obj, prev) {
        var activePage = Campaign().get('playerpageid');

        // Check if the moved token came within range of any locations.
        if(obj.get("layer") === "objects" && obj.get("represents")) {
            var locations = getLocationCollisions(obj);
            _.each(locations, function(location) {
                discoverLocation(location, obj);
            });
        }
    });

    return {
      discoverLocation: discoverLocation,
      getDiscoveryDistance: getDiscoveryDistance,
      getLocationCollisions: getLocationCollisions,
      getLocationTokens: getLocationTokens
    };
})();
