/**
 * This script allows GMs to create looping effects that are dispersed through
 * an entire page.
 * To use it, just create a token named PageFX. Then set the maximum distance
 * of its effect in its bar1 value, and specify its effect in the
 * gmnotes.
 *
 * Effects will start automatically when you switch to the effect's page or
 * when you enter the ```!pageFX on``` command.
 * You can turn off all the effects on a page with the ```!pageFX off```
 * command.
 */
var PageFX = (function() {
    var PIXELS_PER_UNIT = 70;

    /**
     * A 2D point.
     * @typedef {Object} Point
     * @property {number} x
     * @property {number} y
     */

    /**
     * The currently active effects, mapped by their PageFX tokens' IDs.
     */
    var activeEffects = {};

    /**
     * Activates all PageFX on the active page.
     */
    function activateAllEffects() {
        // deactivate effects from the previous page.
        deactivateAllEffects();

        // Activate each effect on this page.
        var curPageId = Campaign().get("playerpageid");
        var pageEffectTokens = findObjs({
            _type: 'graphic',
            _pageid: curPageId,
            name: 'PageFX'
        });
        _.each(pageEffectTokens, function(token) {
            activateEffect(token);
        });
    }

    /**
     * Activates a specific PageFX token.
     * @param {Graphic} effectToken
     */
    function activateEffect(effectToken) {
        // Don't activate the effect if it is disabled.
        if(effectToken.get('status_interdiction'))
            return;

        var id = effectToken.get('_id');
        var effect = effectToken.get('gmnotes');
        var time = effectToken.get('bar1_value') || 100;

        // Deactivate the old effect.
        deactivateEffect(effectToken);

        // Is this a custom FX?
        if(effect.indexOf('{') === 0)
            throw new Error('Custom FX not yet supported.');

        // Is this one of Roll20's built-in FX?
        else {
            var name = effect.split('-')[0];
            var interval = setInterval(function() {
                var start = _getRandomPagePt(effectToken);
                var dx = effectToken.get('bar2_value') || 0;
                var dy = effectToken.get('bar2_max') || 0;

                if(name === 'beam' || name === 'breath' || name === 'splatter') {
                    var end = {
                        x: start.x + PIXELS_PER_UNIT*dx,
                        y: start.y + PIXELS_PER_UNIT*dy
                    };
                    spawnFxBetweenPoints(start, end, effect);
                }
                else {
                    spawnFx(start.x, start.y, effect);
                }
            }, time);

            activeEffects[id] = {
                interval: interval,
                token: effectToken
            };
        }
    }

    /**
     * Deactivates all PageFX.
     */
    function deactivateAllEffects() {
        _.each(activeEffects, function(effect) {
            clearInterval(effect.interval);
        });
        activeEffects = {};
    }

    /**
     * Deactivates a specific PageFX token.
     * @param {Graphic} effectToken
     */
    function deactivateEffect(effectToken) {
        var id = effectToken.get('_id')
        var activeEffect = activeEffects[id];

        if(activeEffect) {
            clearInterval(activeEffect.interval);
            delete activeEffects[id];
        }
    }

    /**
     * Gets a random point within a PageFX token's bar1 value.
     * @param {Graphic} effectToken
     * @return {Point}
     */
    function _getRandomPagePt(effectToken) {
        var curPageId = Campaign().get("playerpageid");
        var page = findObjs({
            _type: 'page',
            _id: curPageId
        })[0];

        var unitScale = page.get('scale_number');
        var maxDist = effectToken.get('aura1_radius')*PIXELS_PER_UNIT/unitScale || 0;
        var x = effectToken.get('left');
        var y = effectToken.get('top');

        if(effectToken.get('aura1_square')) {
            x += maxDist*Math.random()*2 - maxDist;
            y += maxDist*Math.random()*2 - maxDist;
        }
        else {
            var angle = Math.random()*2*Math.PI;

            // Use a curve to try to more evenly distribute the fx in the
            // circle. Without a curve to the distance, fx could become crowded
            // into the middle of the circle.
            var distCurve = Math.random();
            distCurve = 1 - distCurve*distCurve;
            var dist = distCurve * maxDist;

            x += dist*Math.cos(angle);
            y += dist*Math.sin(angle);
        }

        var pageWidth = page.get('width') * PIXELS_PER_UNIT;
        var pageHeight = page.get('height') * PIXELS_PER_UNIT;
        return {
            x: Math.max(0, Math.min(x, pageWidth)),
            y: Math.max(0, Math.min(y, pageHeight))
        };
    }

    /**
     * Toggles the on/off state of a PageFX token.
     * @param {Graphic} effectToken
     */
    function toggleEffect(effectToken) {
        if(activeEffects[effectToken.get('_id')])
            deactivateEffect(effectToken);
        else
            activateEffect(effectToken);
    }

    // Register the !pageFX on/off commands.
    on('chat:message', function(msg) {
        try {
            if(msg.content === '!pageFX on') {
                activateAllEffects();
            }
            if(msg.content === '!pageFX off') {
                deactivateAllEffects();
            }
        }
        catch(err) {
            log('PageEffects ERROR: ');
            log(err.message);
        }
    });

    // When the player switches the active page, activate the
    // PageFX for the new page.
    on('change:campaign:playerpageid', function() {
        activateAllEffects();
    });

    // When a PageFX token is destroyed, also end its effects.
    on('destroy:graphic', function(obj) {
        if(obj.get('name') === 'PageFX')
            deactivateEffect(obj);
    });

    // Whenever a property of a PageFX token is changed, update its effect.
    on('change:graphic', function(obj) {
        if(obj.get('name') === 'PageFX') {

            // A PageFX token's "interdiction" status marker (the one that
            // looks like a "NO, you can't do this!" sign) can be used to
            // toggle its fx on and off.
            if(obj.get('status_interdiction'))
                deactivateEffect(obj);
            else
                activateEffect(obj);
        }
    });

    return {
        activateAllEffects: activateAllEffects,
        activateEffect: activateEffect,
        deactivateAllEffects: deactivateAllEffects,
        deactivateEffect: deactivateEffect,
        toggleEffect: toggleEffect
    };
})();
