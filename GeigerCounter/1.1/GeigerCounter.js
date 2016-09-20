/**
 * This script allows the GM to dynamically create radioactive areas in their
 * maps. Characters that have Geiger counters will be alerted how many rads
 * they are taking.
 *
 * To create a radioactive source object:
 * 1) Create a token representing the source on the GM layer.
 * 2) Set that token's 'radioactive' status marker to on.
 * 3) Set its aura1 radius to the distance at which characters will start
 * taking rads from it.
 * 4) Set the bar1 value to amount of rads/s characters will take at the edge
 * of its aura.
 * 5) Set the bar1 max value to the maximum amount of rads/s characters can take
 * from it.
 *
 * To give a player a Geiger counter:
 * 1) Give them a 'hasGeigerCounter' attribute.
 * 2) Set the attribute to 'true'.
 *
 * If a character moves in a radioactive area and they have a Geiger counter,
 * their Geiger counter will alert everyone how many rads/s they are taking.
 * If a character moves in a radioactive area and they don't have a Geiger
 * counter, only the GM will be alerted how many rads/s they are taking.
 */
var GeigerCounter = (function() {

    /**
     * Computes the apparent brightness of some object, given distance from it
     * and the object's luminosity.
     * @param {number} distance
     * @param {number} luminosity
     * @return {number}
     */
    function getBrightness(distance, luminosity) {
        return luminosity/(4*Math.PI*distance*distance);
    }

    /**
     * Computes the luminosity of some object, given distance from it and the
     * apparent brightness of that object at that distance.
     * @param {number} distance
     * @param {number} brightness
     * @return {number}
     */
    function getLuminosity(distance, brightness) {
        return brightness*4*Math.PI*distance*distance;
    }

    /**
     * Gets the unit scale for an object's page.
     * @param {graphic} The graphic whose page to get the scale for.
     * @return {number}
     */
    function _getPageScale(obj) {
        var page = findObjs({
            _type: 'page',
            _id: obj.get('_pageid')
        })[0];
        return page.get('scale_number');
    }

    /**
     * Gets all the tokens representing radioactive sources on the same map
     * that some other graphic is on.
     * @param {graphic} The graphic whose page to use.
     * @return {graphic[]}
     */
    function getRadioactiveTokens(obj) {
        return findObjs({
            _pageid: obj.get('_pageid'),
            _type: 'graphic',
            layer: 'gmlayer',
            status_radioactive: true
        });
    }

    /**
     * Gets the amount of rads an object is taking from a radioactive token.
     * @param {graphic} A graphic representing a character
     * @param {graphic} A gmlayer graphic representing a radioactive source.
     * @return {int}
     */
    function getRads(obj, radToken) {
        var pageScale = _getPageScale(obj);

        var maxDist = parseInt(radToken.get('aura1_radius')) +
          parseInt(radToken.get('width'))/70*pageScale;
        var minRads = parseInt(radToken.get('bar1_value'));
        var maxRads = parseInt(radToken.get('bar1_max'));
        if(!maxDist || !minRads || !maxRads)
            return 0;

        var x1 = obj.get('left');
        var y1 = obj.get('top');
        var x2 = radToken.get('left');
        var y2 = radToken.get('top');
        var dx = x1-x2;
        var dy = y1-y2;

        var distance = Math.sqrt(dx*dx + dy*dy);
        distance = distance/70*pageScale;
        if(distance === 0)
            return parseInt(maxRads);
        if(distance > maxDist)
            return 0;

        var luminosity = getLuminosity(maxDist, minRads);
        var brightness = getBrightness(distance, luminosity);
        return Math.min(maxRads, brightness);
    }

    /**
     * Checks if a character token has a geiger counter.
     * @param {graphic} A graphic representing a character.
     * @return {boolean}
     */
    function hasGeigerCounter(obj) {
        var charId = obj.get('represents');
        if(!charId)
            return false;

        var geigerAttr = findObjs({
            _type: 'attribute',
            _characterid: charId,
            name: 'hasGeigerCounter'
        })[0];
        return geigerAttr && geigerAttr.get('current');
    }

    function _updateToken(obj) {
        // Only handle this script if the moved object represents a
        // player character.
        if(obj.get('represents')) {

            var character = findObjs({
                _type: 'character',
                _id: obj.get('represents')
            })[0].get('name');

            var radTokens = getRadioactiveTokens(obj);
            var rads = 0;

            // Get the total number of rads/s the character is taking on their
            // page from all radioactive sources.
            _.each(radTokens, function(radToken) {
                if(obj === radToken)
                    return;
                rads += getRads(obj, radToken);
            });

            // Round the total up for display.
            rads = Math.ceil(rads);

            if(rads) {
                // If the player has a Geiger counter, let everyone know that
                // they are taking rads.
                if(hasGeigerCounter(obj))
                    sendChat('☢', character + '\'s Geiger counter is ' +
                        'clicking at ' + rads + ' rads/s.');

                // Otherwise, let only the GM know that they are taking rads.
                else
                    sendChat('☢', '/w GM ' + character + ' is taking ' +
                        rads + ' rads/s.');
            }
        }
    }

    on('change:graphic:lastmove', function(obj) {
        _updateToken(obj);
    });

    // Expose the public functions as an API of this module.
    return {
        getBrightness: getBrightness,
        getLuminosity: getLuminosity,
        getRadioactiveTokens: getRadioactiveTokens,
        getRads: getRads,
        hasGeigerCounter: hasGeigerCounter
    };
})();
