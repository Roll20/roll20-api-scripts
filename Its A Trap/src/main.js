/**
 * The main interface and bootstrap script for It's A Trap.
 */
var ItsATrap = (() => {
  'use strict';

  const REMOTE_ACTIVATE_CMD = '!itsATrapRemoteActivate';

  // The collection of registered TrapThemes keyed by name.
  let trapThemes = {};

  // The installed trap theme that is being used.
  let curTheme = 'default';

  /**
   * Activates a trap.
   * @param {Graphic} trap
   * @param {Graphic} [activatingVictim]
   *        The victim that triggered the trap.
   */
  function activateTrap(trap, activatingVictim) {
    let theme = getTheme();

    // Apply the trap's effects to any victims in its area and to the
    // activating victim, using the configured trap theme.
    let victims = getTrapVictims(trap, activatingVictim);
    if(victims.length > 0)
      _.each(victims, victim => {
        let effect = new TrapEffect(trap, victim);
        theme.activateEffect(effect);
      });
    else {
      // In the absence of any victims, activate the trap with the default
      // theme, which will only display the trap's message.
      let defaultTheme = trapThemes['default'];
      let effect = new TrapEffect(trap);
      defaultTheme.activateEffect(effect);
    }
  }

  /**
   * Checks if a token passively searched for any traps during its last
   * movement.
   * @private
   * @param {TrapTheme} theme
   * @param {Graphic} token
   */
  function _checkPassiveSearch(theme, token) {
    if(theme.passiveSearch && theme.passiveSearch !== _.noop) {
      _.chain(getSearchableTraps(token))
      .filter(trap => {
        // Only search for traps that are close enough to be spotted.
        let effect = new TrapEffect(trap, token);
        let dist = getSearchDistance(token, trap);
        let searchDist = trap.get('aura2_radius') || effect.searchDist;
        return (!searchDist || dist < searchDist);
      })
      .each(trap => {
        theme.passiveSearch(trap, token);
      });
    }
  }

  /**
   * Checks if a token activated or passively spotted any traps during
   * its last movement.
   * @private
   * @param {Graphic} token
   */
  function _checkTrapInteractions(token) {
    // Objects on the GM layer don't set off traps.
    if(token.get("layer") === "objects") {
      try {
        let theme = getTheme();
        if(!theme) {
          log('ERROR - It\'s A Trap!: TrapTheme does not exist - ' + curTheme + '. Using default TrapTheme.');
          theme = trapThemes['default'];
        }

        // Did the character set off a trap?
        _checkTrapActivations(theme, token);

        // If the theme has passive searching, do a passive search for traps.
        _checkPassiveSearch(theme, token);
      }
      catch(err) {
        log('ERROR - It\'s A Trap!: ' + err.message);
        log(err.stack);
      }
    }
  }

  /**
   * Checks if a token activated any traps during its last movement.
   * @private
   * @param {TrapTheme} theme
   * @param {Graphic} token
   */
  function _checkTrapActivations(theme, token) {
    let collisions = getTrapCollisions(token);
    _.find(collisions, collision => {
      let trap = collision.other;

      // Skip if the trap is disabled.
      if(trap.get('status_interdiction'))
        return false;

      let trapEffect = (new TrapEffect(trap, token)).json;
      trapEffect.stopAt = trapEffect.stopAt || 'center';

      // Figure out where to stop the token.
      if(trapEffect.stopAt === 'edge' && !trapEffect.gmOnly) {
        let x = collision.pt[0];
        let y = collision.pt[1];

        token.set("lastmove","");
        token.set("left", x);
        token.set("top", y);
      }
      else if(trapEffect.stopAt === 'center' && !trapEffect.gmOnly) {
        let x = trap.get("left");
        let y = trap.get("top");

        token.set("lastmove","");
        token.set("left", x);
        token.set("top", y);
      }

      // Apply the trap's effects to any victims in its area.
      if(collision.triggeredByPath)
        activateTrap(trap);
      else
        activateTrap(trap, token);

      // Stop activating traps if this trap stopped the token.
      return (trapEffect.stopAt !== 'none');
    });
  }

  /**
   * Gets the point for a token.
   * @private
   * @param {Graphic} token
   * @return {vec3}
   */
  function _getPt(token) {
    return [token.get('left'), token.get('top'), 1];
  }

  /**
   * Gets all the traps that a token has line-of-sight to, with no limit for
   * range. Line-of-sight is blocked by paths on the dynamic lighting layer.
   * @param  {Graphic} charToken
   * @return {Graphic[]}
   *         The list of traps that charToken has line-of-sight to.
   */
  function getSearchableTraps(charToken) {
    let pageId = charToken.get('_pageid');
    let traps = getTrapsOnPage(pageId);
    return LineOfSight.filterTokens(charToken, traps);
  }

  /**
   * Gets the distance between two tokens in their page's units.
   * @param {Graphic} token1
   * @param {Graphic} token2
   * @return {number}
   */
  function getSearchDistance(token1, token2) {
    let p1 = _getPt(token1);
    let p2 = _getPt(token2);
    let r1 = token1.get('width')/2;
    let r2 = token2.get('width')/2;

    let page = getObj('page', token1.get('_pageid'));
    let scale = page.get('scale_number');
    let pixelDist = Math.max(0, VecMath.dist(p1, p2) - r1 - r2);
    return pixelDist/70*scale;
  }

  /**
   * Gets the theme currently being used to interpret TrapEffects spawned
   * when a character activates a trap.
   * @return {TrapTheme}
   */
  function getTheme() {
    return trapThemes[curTheme];
  }

  /**
   * Returns the list of all traps a token would collide with during its last
   * movement. The traps are sorted in the order that the token will collide
   * with them.
   * @param  {Graphic} token
   * @return {TokenCollisions.Collision[]}
   */
  function getTrapCollisions(token) {
    let pageId = token.get('_pageid');
    let traps = getTrapsOnPage(pageId);

    // A llambda to test if a token is flying.
    let isFlying = x => {
      return x.get("status_fluffy-wing");
    };

    let pathsToTraps = {};

    // Some traps don't affect flying tokens.
    traps = _.chain(traps)
    .filter(trap => {
      return !isFlying(token) || isFlying(trap);
    })

    // Use paths for collisions if trigger paths are set.
    .map(trap => {
      let effect = new TrapEffect(trap);
      if(effect.triggerPaths) {
        return _.map(effect.triggerPaths, id => {
          if(pathsToTraps[id])
            pathsToTraps[id].push(trap);
          else
            pathsToTraps[id] = [trap];

          return getObj('path', id) || trap;
        });
      }
      else
        return trap;
    })
    .flatten()
    .value();

    // Get the collisions.
    return _.chain(TokenCollisions.getCollisions(token, traps, {detailed: true}))
    .map(collision => {

      // Convert path collisions back into trap token collisions.
      if(collision.other.get('_type') === 'path') {
        let pathId = collision.other.get('_id');
        return _.map(pathsToTraps[pathId], trap => {
          return {
            token: collision.token,
            other: trap,
            pt: collision.pt,
            dist: collision.dist,
            triggeredByPath: true
          };
        });
      }
      else
        return collision;
    })
    .flatten()
    .value();
  }

  /**
   * Gets the list of all the traps on the specified page.
   * @param  {string} pageId
   * @return {Graphic[]}
   */
  function getTrapsOnPage(pageId) {
    return findObjs({
      _pageid: pageId,
      _type: "graphic",
      status_cobweb: true,
      layer: "gmlayer"
    });
  }

  /**
   * Gets the list of victims within an activated trap's area of effect.
   * @param  {Graphic} trap
   * @param  {Graphic} triggerVictim
   * @return {Graphic[]}
   */
  function getTrapVictims(trap, triggerVictim) {
    let range = trap.get('aura1_radius');
    let pageId = trap.get('_pageid');

    let victims = [triggerVictim];
    if(range !== '') {
      let otherTokens = findObjs({
        _pageid: pageId,
        _type: 'graphic',
        layer: 'objects'
      });

      let pageScale = getObj('page', pageId).get('scale_number');
      range *= 70/pageScale;
      let squareArea = trap.get('aura1_square');

      victims = victims.concat(LineOfSight.filterTokens(trap, otherTokens, range, squareArea));
    }
    return _.chain(victims)
    .unique()
    .compact()
    .value();
  }

  /**
   * Marks a trap with a circle and a ping.
   * @private
   * @param  {Graphic} trap
   */
  function _markTrap(trap) {
    let radius = trap.get('width')/2;
    let x = trap.get('left');
    let y = trap.get('top');
    let pageId = trap.get('_pageid');

    // Circle the trap's trigger area.
    let circle = new PathMath.Circle([x, y, 1], radius);
    circle.render(pageId, 'objects', {
      stroke: '#ffff00', // yellow
      stroke_width: 5
    });

    sendPing(x, y, pageId);
  }

  /**
   * Marks a trap as being noticed by a character's passive search.
   * @param {Graphic} trap
   * @param {string} noticeMessage A message to display when the trap is noticed.
   * @return {boolean}
   *         true if the trap has not been noticed yet.
   */
  function noticeTrap(trap, noticeMessage) {
    let id = trap.get('_id');
    let effect = new TrapEffect(trap);
    let announcer = state.ItsATrap.userOptions.announcer;

    if(!state.ItsATrap.noticedTraps[id]) {
      state.ItsATrap.noticedTraps[id] = true;
      sendChat(announcer, noticeMessage);

      if(effect.revealWhenSpotted)
        revealTrap(trap);
      else
        _markTrap(trap);
      return true;
    }
    else
      return false;
  }

  /**
   * Registers a TrapTheme.
   * @param  {TrapTheme} theme
   */
  function registerTheme(theme) {
    log('It\'s A Trap!: Registered TrapTheme - ' + theme.name + '.');
    trapThemes[theme.name] = theme;
    curTheme = theme.name;
  }

  /**
   * Reveals a trap to the objects or map layer.
   * @param  {Graphic} trap
   */
  function revealTrap(trap) {
    let effect = new TrapEffect(trap);

    if(effect.revealLayer === 'objects') {
      trap.set('layer', 'objects');
      toBack(trap);
    }
    else {
      trap.set('layer', 'map');
      toFront(trap);
    }
    sendPing(trap.get('left'), trap.get('top'), trap.get('_pageid'));
  }

  /**
   * Removes a trap from the state's collection of noticed traps.
   * @private
   * @param {Graphic} trap
   */
  function _unNoticeTrap(trap) {
    let id = trap.get('_id');
    if(state.ItsATrap.noticedTraps[id])
      delete state.ItsATrap.noticedTraps[id];
  }

  // Create macro for the remote activation command.
  on('ready', () => {
    let numRetries = 3;
    let interval = setInterval(() => {
      let theme = getTheme();
      if(theme) {
        log(`☒☠☒ Initialized It's A Trap! using theme '${getTheme().name}' ☒☠☒`);
        clearInterval(interval);
      }
      else if(numRetries > 0)
        numRetries--;
      else
        clearInterval(interval);
    }, 1000);
  });

  // Handle macro commands.
  on('chat:message', msg => {
    try {
      if(msg.content === REMOTE_ACTIVATE_CMD) {
        let theme = getTheme();
        _.each(msg.selected, item => {
          let trap = getObj('graphic', item._id);
          activateTrap(trap);
        });
      }
    }
    catch(err) {
      log(`It's A Trap ERROR: ${err.msg}`);
      log(err.stack);
    }
  });

  /**
   * When a graphic on the objects layer moves, run the script to see if it
   * passed through any traps.
   */
  on("change:graphic:lastmove", function(token) {
    try {
      // Check for trap interactions if the token isn't also a trap.
      if(!token.get('status_cobweb'))
        _checkTrapInteractions(token);
    }
    catch(err) {
      log(`It's A Trap ERROR: ${err.msg}`);
      log(err.stack);
    }
  });

  // If a trap is moved back to the GM layer, remove it from the set of noticed traps.
  on('change:graphic:layer', token => {
    if(token.get('layer') === 'gmlayer')
      _unNoticeTrap(token);
  });

  // When a trap's token is destroyed, remove it from the set of noticed traps.
  on('destroy:graphic', function(token) {
    _unNoticeTrap(token);
  });

  return {
    activateTrap,
    getSearchDistance,
    getTheme,
    getTrapCollisions,
    getTrapsOnPage,
    noticeTrap,
    registerTheme,
    revealTrap,
    REMOTE_ACTIVATE_CMD
  };
})();
