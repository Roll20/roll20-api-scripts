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
        var time = effectToken.get('bar1_value') || 100;

        // URI-escape the notes and remove the HTML elements.
        var effect = decodeURIComponent(effectToken.get('gmnotes')).trim();
        effect = effect.split(/<[/]?.+?>/g).join('');

        // Deactivate the old effect.
        deactivateEffect(effectToken);

        // Build the FX spawner function.
        var spawnFunc;
        if(effect.indexOf('{') === 0)
            spawnFunc = _createSpawnerCustom(effectToken, effect);
        else if(effect.indexOf('-') !== -1)
            spawnFunc = _createSpawnerBuiltIn(effectToken, effect);
        else
            spawnFunc = _createSpawnerSaved(effectToken, effect);

        // Start up and register the effect interval.
        var interval = setInterval(spawnFunc, time);
        activeEffects[id] = {
            interval: interval,
            token: effectToken
        };
    }

    /**
     * Creates a spawner function for a built-in FX.
     * @param  {Graphic} effectToken
     * @param  {string} effect
     * @return {function}
     */
    function _createSpawnerBuiltIn(effectToken, effect) {
        effect = _resolveBuiltInFxName(effect);
        var name = effect.split('-')[0];
        return function() {
            var start = _getRandomPagePt(effectToken);
            if(isPointInNullFX(start, effectToken))
              return;

            var dx = effectToken.get('bar2_value') || 0;
            var dy = effectToken.get('bar2_max') || 0;
            if(dx === 'random') {
              dx = Math.random() - 0.5;
              dy = Math.random() - 0.5;
            }

            if(name === 'beam' || name === 'breath' || name === 'splatter') {
                var end = {
                    x: start.x + PIXELS_PER_UNIT*dx,
                    y: start.y + PIXELS_PER_UNIT*dy
                };
                spawnFxBetweenPoints(start, end, effect);
            }
            else
              spawnFx(start.x, start.y, effect);
        };
    }

    /**
     * Creates a spawner function for a custom FX JSON defintion.
     * @param  {Graphic} effectToken
     * @param  {string} effect
     * @return {function}
     */
    function _createSpawnerCustom(effectToken, effect) {
        try {
            effect = JSON.parse(effect);
            return function() {
                var start = _getRandomPagePt(effectToken);
                if(isPointInNullFX(start, effectToken))
                  return;

                spawnFxWithDefinition(start.x, start.y, effect);
            };
        }
        catch(err) {
            throw new Error('Invalid FX JSON: <br/>' + effect);
        }
    }

    /**
     * Creates a spawner function for a saved custom FX.
     * @param  {Graphic} effectToken
     * @param  {string} effect
     * @return {function}
     */
    function _createSpawnerSaved(effectToken, effect) {
        var savedFx = findObjs({ _type: 'custfx', name: effect })[0];
        if(savedFx) {
            var fxId = savedFx.get('_id');
            return function() {
                var start = _getRandomPagePt(effectToken);
                if(isPointInNullFX(start, effectToken))
                  return

                // Is this a beam-like FX?
                if(savedFx.get('definition').angle === -1) {
                  var dx = parseFloat(effectToken.get('bar2_value')) || 0;
                  var dy = parseFloat(effectToken.get('bar2_max')) || 0;

                  if(dx === 'random') {
                    dx = Math.random() - 0.5;
                    dy = Math.random() - 0.5;
                  }
                  var end = {
                    x: start.x + dx,
                    y: start.y + dy
                  };
                  log('vector');
                  log(start);
                  log(end);
                  spawnFxBetweenPoints(start, end, fxId);
                }
                else
                  spawnFx(start.x, start.y, fxId);
                spawnFx(start.x, start.y, fxId);
            };
        }
        else {
            throw new Error('Could not find saved FX: "' + effect + '".');
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
     * Get the NullFX tokens on the same page as a PageFX token.
     * @param  {Graphic} effectToken
     * @return {Graphic[]}
     */
    function getNullFx(effectToken) {
        var pageId = effectToken.get('_pageid');
        return findObjs({
            _type: 'graphic',
            _pageid: pageId,
            name: 'NullFX'
        });
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
        maxDist += effectToken.get('width')/2;
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
     * Checks if some point on the page is within the area of a NullFX token.
     * @param  {Point}  pt
     * @param  {Graphic}  effectToken
     *         The effectToken that the point was spawned relative to.
     * @return {Boolean}
     */
    function isPointInNullFX(pt, effectToken) {
        var nullTokens = getNullFx(effectToken);
        var curPageId = effectToken.get("_pageid");
        var page = findObjs({
            _type: 'page',
            _id: curPageId
        })[0];

        return !!_.find(nullTokens, function(nullToken) {
            var unitScale = page.get('scale_number');
            var maxDist = nullToken.get('aura1_radius') *PIXELS_PER_UNIT/unitScale || 0;
            maxDist += effectToken.get('width')/2;
            var x = nullToken.get('left');
            var y = nullToken.get('top');
            var dx = pt.x - x;
            var dy = pt.y - y;

            if(nullToken.get('aura1_square')) {
                return Math.abs(dx) <= maxDist && Math.abs(dy) <= maxDist;
            }
            else
                return dx*dx + dy*dy <= maxDist*maxDist
        });
    }

    /**
     * Resolves a user-inputted built-in FX name to its canonical name.
     * @private
     * @param {string} name
     * @return {string}
     */
    function _resolveBuiltInFxName(name) {
      var parts = name.split('-');
      var type = parts[0].toLowerCase();
      var color = parts[1].toLowerCase();

      var convertTypes = {
        'explosion': 'explode'
      };
      if(convertTypes[type])
        type = convertTypes[type];

      return type + '-' + color;
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

    /**
     * Catches and logs PageFX errors in a try-catch block.
     * @private
     * @param  {function} func
     *         The try block body.
     */
    function _try(func) {
        try {
            func();
        }
        catch(err) {
            log('PageFX ERROR: ');
            log(err.message);
        }
    }

    // Register the !pageFX on/off commands.
    on('chat:message', function(msg) {
        _try(function() {
            if(msg.content === '!pageFX on')
                activateAllEffects();
            if(msg.content === '!pageFX off')
                deactivateAllEffects();
        });
    });

    // When the player switches the active page, activate the
    // PageFX for the new page.
    on('change:campaign:playerpageid', function() {
        _try(function() {
            activateAllEffects();
        });
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
                _try(function() {
                    activateEffect(obj);
                });
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
