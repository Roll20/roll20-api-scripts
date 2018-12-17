/**
 * This script allows the GM to set hidden locations on a world map that can be
 * revealed when a character gets close enough.
 *
 * To use:
 * 1) Turn on the landmark's white-tower status (The one that looks like a tower).
 * 2) Set the landmark's aura 1 radius to whatever radius you want players to come
 * within to discover the landmark.
 * 3) Put the landmark on the GM layer.
 *
 * When a character token moves within the aura radius of the landmark, the
 * landmark will appear on the graphics layer and a message will be displayed
 * telling everyone that the character discovered it. When the landmark is
 * discovered, its aura1 radius is removed.
 *
 * Depends on:
 *    VecMath
 */
var WorldMapDiscovery = (function() {

    var PIXELS_PER_SQUARE = 70;

    /**
     * Returns the first undiscovered location the token is in range of, or null
     * if the token is not in range of an undiscvered location.
     * @param {Graphic} token
     * @return {Graphic}
     */
    var getLocationCollisions = function(token) {
        var allLocations = getLocationTokens();
        var tokenPt = getTokenPt(token);

        return _.filter(allLocations, function(location) {
            var locationPt = getTokenPt(location);
            var dist = VecMath.dist(tokenPt, locationPt);
            var threshold = getDiscoveryDistance(location);
            return (dist <= threshold);
        });
    };

    /**
     * Returns all location tokens on the players' page.
     * Undiscovered locations reside on the gm layer.
     * @return {Graphic[]}
     */
    var getLocationTokens = function() {
        var currentPageId = Campaign().get("playerpageid");
        return findObjs({_pageid: currentPageId,
                                _type: "graphic",
                                'status_white-tower': true,
                                layer: "gmlayer"});
    };


    /**
     * Gets the location of a token as a point.
     * @param {Graphic}
     * @return {vec2}
     */
    var getTokenPt = function(token) {
        var x = token.get("left");
        var y = token.get("top");
        return [x, y];
    };


    /**
     * Causes a location to become discovered.
     * @param {Graphic} location      The location that is being discovered.
     * @param {Graphic} discoverer    The token that discovered the location.
     */
    var discoverLocation = function(location, discoverer) {
    //    log('WorldMapDiscover DEBUG ');
    //    log(getDiscoveryDistance(location));
        var tokenPt = getTokenPt(discoverer);
    //    log('Discoverer: ');
    //    log(discoverer);
    //    log(tokenPt);
        var locationPt = getTokenPt(location);
    //    log('Location: ');
    //    log(location);
    //    log(locationPt);
        var dist = VecMath.dist(tokenPt, locationPt);
    //    log(dist);

        location.set('layer', 'objects');
        location.set('aura1_radius', '');
        toBack(location);

        sendChat('MAP', discoverer.get('name') + " has discovered " + location.get('name') + ".");
    };


    /**
     * Gets the discovery distance for a location based on its aura's radius.
     */
    var getDiscoveryDistance = function(location) {
        var radiusUnits = location.get('aura1_radius');

        var currentPageId = Campaign().get("playerpageid");
        var page = findObjs({_id: currentPageId, _type: "page"})[0];
        var pageScale = page.get('scale_number');

        return radiusUnits/pageScale*PIXELS_PER_SQUARE + location.get('width')/2;
    };


    /**
     * When a graphic on the objects layer moves, run the script to see if it
     * passed through any traps.
     */
    on("change:graphic:lastmove", function(obj, prev) {
        var activePage = Campaign().get('playerpageid');

        if(obj && obj.get('status_white-tower') == true) {
            var locationPt = getTokenPt(obj);
        }

        // Objects on the GM layer don't set off traps.
        if(obj.get("layer") === "objects" && obj.get("represents") && obj.get('_pageid') == activePage) {
            var locations = getLocationCollisions(obj);

            _.each(locations, function(location) {
                discoverLocation(location, obj);
            });
        }
    });
})();
