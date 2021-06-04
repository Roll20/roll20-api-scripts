/**
 * Initialize the state for the It's A Trap script.
 */
(() => {
  'use strict';

  /**
   * The ItsATrap state data.
   * @typedef {object} ItsATrapState
   * @property {object} noticedTraps
   *           The set of IDs for traps that have been noticed by passive perception.
   * @property {string} theme
   *           The name of the TrapTheme currently being used.
   */
  state.ItsATrap = state.ItsATrap || {};
  _.defaults(state.ItsATrap, {
    noticedTraps: {},
    userOptions: {}
  });
  _.defaults(state.ItsATrap.userOptions, {
    revealTrapsToMap: false,
    announcer: 'Admiral Ackbar'
  });

  // Set the theme from the useroptions.
  let useroptions = globalconfig && globalconfig.itsatrap;
  if(useroptions) {
    state.ItsATrap.userOptions = {
      revealTrapsToMap: useroptions.revealTrapsToMap === 'true' || false,
      announcer: useroptions.announcer || 'Admiral Ackbar'
    };
  }
})();

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
    let effect = new TrapEffect(trap);
    if(effect.delay) {
      // Set the interdiction status on the trap so that it doesn't get
      // delay-activated multiple times.
      effect.trap.set('status_interdiction', true);

      // Activate the trap after the delay.
      setTimeout(() => {
        _activateTrap(trap);
      }, 1000*effect.delay);

      // Let the GM know that the trap has been triggered.
      if(activatingVictim)
        ItsATrap.Chat.whisperGM(`The trap ${effect.name} has been ` +
          `triggered by ${activatingVictim.get('name')}. ` +
          `It will activate in ${effect.delay} seconds.`);
      else
        ItsATrap.Chat.whisperGM(`The trap ${effect.name} has been ` +
          `triggered. It will activate in ${effect.delay} seconds.`);
    }
    else
      _activateTrap(trap, activatingVictim);
  }

  /**
   * Helper for activateTrap.
   * @param {Graphic} trap
   * @param {Graphic} [activatingVictim]
   *        The victim that triggered the trap.
   */
  function _activateTrap(trap, activatingVictim) {
    let theme = getTheme();
    let effect = new TrapEffect(trap);

    // Apply the trap's effects to any victims in its area and to the
    // activating victim, using the configured trap theme.
    let victims = getTrapVictims(trap, activatingVictim);
    if(victims.length > 0)
      _.each(victims, victim => {
        effect = new TrapEffect(trap, victim);
        theme.activateEffect(effect);
      });
    else {
      // In the absence of any victims, activate the trap with the default
      // theme, which will only display the trap's message.
      let defaultTheme = trapThemes['default'];
      defaultTheme.activateEffect(effect);
    }

    // If the trap is destroyable, delete it after it has activated.
    if(effect.destroyable)
      trap.remove();
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

        // Check the distance to the trap itself.
        let dist = getSearchDistance(token, trap);

        // Also check the distance to any path triggers.
        let triggerDist = Number.POSITIVE_INFINITY;
        if (_.isArray(effect.triggerPaths)) {
          triggerDist = _.chain(effect.triggerPaths)
          .map(pathId => {
            let path = getObj('path', pathId);
            if(path)
              return getSearchDistance(token, path);
            else
              return Number.POSITIVE_INFINITY;
          })
          .min()
          .value();
        }

        let searchDist = trap.get('aura2_radius') || effect.searchDist;
        return (!searchDist || Math.min(dist, triggerDist) < searchDist);
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
    if(token.iatIgnoreToken)
      return;

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

      let trapEffect = new TrapEffect(trap, token);

      // Skip if the trap is disabled or if it has no activation area.
      if(trap.get('status_interdiction'))
        return false;

      // Should this trap ignore the token?
      if(trapEffect.ignores && trapEffect.ignores.includes(token.get('_id')))
        return false;

      // Figure out where to stop the token.
      if(trapEffect.stopAt === 'edge' && !trapEffect.gmOnly) {
        let x = collision.pt[0];
        let y = collision.pt[1];

        token.set("lastmove","");
        token.set("left", x);
        token.set("top", y);
      }
      else if(trapEffect.stopAt === 'center' && !trapEffect.gmOnly &&
      ['self', 'burst'].includes(trapEffect.effectShape)) {
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
   * @param {(Graphic|Path)} token2
   * @return {number}
   */
  function getSearchDistance(token1, token2) {
    let p1 = _getPt(token1);
    let page = getObj('page', token1.get('_pageid'));
    let scale = page.get('scale_number');
    let pixelDist;

    if(token2.get('_type') === 'path') {
      let path = token2;
      pixelDist = PathMath.distanceToPoint(p1, path);
    }
    else {
      let p2 = _getPt(token2);
      let r1 = token1.get('width')/2;
      let r2 = token2.get('width')/2;
      pixelDist = Math.max(0, VecMath.dist(p1, p2) - r1 - r2);
    }
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

      // Skip the trap if it has no trigger.
      if (effect.triggerPaths === 'none')
        return undefined;

      // Trigger is defined by paths.
      else if(_.isArray(effect.triggerPaths)) {
        return _.chain(effect.triggerPaths)
        .map(id => {
          if(pathsToTraps[id])
            pathsToTraps[id].push(trap);
          else
            pathsToTraps[id] = [trap];

          return getObj('path', id);
        })
        .compact()
        .value();
      }

      // Trigger is the trap token itself.
      else
        return trap;
    })
    .flatten()
    .compact()
    .value();

    // Get the collisions.
    return _getTrapCollisions(token, traps, pathsToTraps);
  }

  /**
   * Returns the list of all traps a token would collide with during its last
   * movement from a list of traps.
   * The traps are sorted in the order that the token will collide
   * with them.
   * @private
   * @param  {Graphic} token
   * @param {(Graphic[]|Path[])} traps
   * @return {TokenCollisions.Collision[]}
   */
  function _getTrapCollisions(token, traps, pathsToTraps) {
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
    let pageId = trap.get('_pageid');

    let effect = new TrapEffect(trap);
    let victims = [];
    let otherTokens = findObjs({
      _pageid: pageId,
      _type: 'graphic',
      layer: 'objects'
    });

    // Case 1: One or more closed paths define the blast areas.
    if(effect.effectShape instanceof Array) {
      _.each(effect.effectShape, pathId => {
        let path = getObj('path', pathId);
        if(path) {
          _.each(otherTokens, token => {
            if(TokenCollisions.isOverlapping(token, path))
              victims.push(token);
          });
        }
      });
    }

    // Case 2: The trap itself defines the blast area.
    else {
      victims = [triggerVictim];

      let range = trap.get('aura1_radius');
      let squareArea = trap.get('aura1_square');
      if(range !== '') {
        let pageScale = getObj('page', pageId).get('scale_number');
        range *= 70/pageScale;
      }
      else
        range = 0;

      victims = victims.concat(LineOfSight.filterTokens(trap, otherTokens, range, squareArea));
    }

    return _.chain(victims)
    .unique()
    .compact()
    .reject(victim => {
      return effect.ignores.includes(victim.get('_id'));
    })
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

    let effect = new TrapEffect(trap);

    let toOrder = toFront;
    let layer = 'map';
    if(effect.revealLayer === 'objects') {
      toOrder = toBack;
      layer = 'objects';
    }
    _revealTriggers(trap);
    _revealActivationAreas(trap);
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

    if(!state.ItsATrap.noticedTraps[id]) {
      state.ItsATrap.noticedTraps[id] = true;
      ItsATrap.Chat.broadcast(noticeMessage);

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
   * Reveals the paths defining a trap's activation area, if it has any.
   * @param {Graphic} trap
   */
  function _revealActivationAreas(trap) {
    let effect = new TrapEffect(trap);
    let layer = 'map';
    let toOrder = toFront;
    if(effect.revealLayer === 'objects') {
      toOrder = toBack;
      layer = 'objects';
    }

    if(effect.effectShape instanceof Array)
      _.each(effect.effectShape, pathId => {
        let path = getObj('path', pathId);
        if (path) {
          path.set('layer', layer);
          toOrder(path);
        }
        else {
          ItsATrap.Chat.error(new Error(`Could not find activation area shape ${pathId} for trap ${effect.name}. Perhaps you deleted it? Either way, please fix it through the trap's Activation Area property.`));
        }
      });
  }

  /**
   * Reveals a trap to the objects or map layer.
   * @param  {Graphic} trap
   */
  function revealTrap(trap) {
    let effect = new TrapEffect(trap);

    let toOrder = toFront;
    let layer = 'map';
    if(effect.revealLayer === 'objects') {
      toOrder = toBack;
      layer = 'objects';
    }

    // Reveal the trap token.
    trap.set('layer', layer);
    toOrder(trap);
    sendPing(trap.get('left'), trap.get('top'), trap.get('_pageid'));

    // Reveal its trigger paths and activation areas, if any.
    _revealActivationAreas(trap);
    _revealTriggers(trap);
  }

  /**
   * Reveals any trigger paths associated with a trap, if any.
   * @param {Graphic} trap
   */
  function _revealTriggers(trap) {
    let effect = new TrapEffect(trap);
    let layer = 'map';
    let toOrder = toFront;
    if(effect.revealLayer === 'objects') {
      toOrder = toBack;
      layer = 'objects';
    }

    if(_.isArray(effect.triggerPaths)) {
      _.each(effect.triggerPaths, pathId => {
        let path = getObj('path', pathId);
        if (path) {
          path.set('layer', layer);
          toOrder(path);
        }
        else {
          ItsATrap.Chat.error(new Error(`Could not find trigger path ${pathId} for trap ${effect.name}. Perhaps you deleted it? Either way, please fix it through the trap's Trigger Area property.`));
        }
      });
    }
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
        log(`--- Initialized It's A Trap! v3.13, using theme '${getTheme().name}' ---`);
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
      let argv = msg.content.split(' ');
      if(argv[0] === REMOTE_ACTIVATE_CMD) {
        let theme = getTheme();

        let trapId = argv[1];
        let trap = getObj('graphic', trapId);
        if (trap)
          activateTrap(trap);
        else
          throw new Error(`Could not activate trap ID ${trapId}. It does not exist.`);
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
  on("change:graphic:lastmove", token => {
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
    try {
      if(token.get('layer') === 'gmlayer')
        _unNoticeTrap(token);
    }
    catch(err) {
      log(`It's A Trap ERROR: ${err.msg}`);
      log(err.stack);
    }
  });

  // When a trap's token is destroyed, remove it from the set of noticed traps.
  on('destroy:graphic', token => {
    try {
      _unNoticeTrap(token);
    }
    catch(err) {
      log(`It's A Trap ERROR: ${err.msg}`);
      log(err.stack);
    }
  });

  // When a token is added, make it temporarily unable to trigger traps.
  // This is to prevent a bug related to dropping default tokens for characters
  // to the VTT, which sometimes caused traps to trigger as though the dropped
  // token has move.
  on('add:graphic', token => {
    token.iatIgnoreToken = true;
    setTimeout(() => {
      delete token.iatIgnoreToken;
    }, 1000);
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

/**
 * The configured JSON properties of a trap. This can be extended to add
 * additional properties for system-specific themes.
 */
var TrapEffect = (() => {
  'use strict';

  const DEFAULT_FX = {
    maxParticles: 100,
    emissionRate: 3,
    size: 35,
    sizeRandom: 15,
    lifeSpan: 10,
    lifeSpanRandom: 3,
    speed: 3,
    speedRandom: 1.5,
    gravity: {x: 0.01, y: 0.01},
    angle: 0,
    angleRandom: 180,
    duration: -1,
    startColour: [220, 35, 0, 1],
    startColourRandom: [62, 0, 0, 0.25],
    endColour: [220, 35, 0, 0],
    endColourRandom:[60, 60, 60, 0]
  };

  return class TrapEffect {
    /**
     * An API chat command that will be executed when the trap is activated.
     * If the constants TRAP_ID and VICTIM_ID are provided,
     * they will be replaced by the IDs for the trap token and the token for
     * the trap's victim, respectively in the API chat command message.
     * @type {string[]}
     */
    get api() {
      return this._effect.api || [];
    }

    /**
     * Specifications for an AreasOfEffect script graphic that is spawned
     * when a trap is triggered.
     * @typedef {object} TrapEffect.AreaOfEffect
     * @property {String} name      The name of the AoE effect.
     * @property {vec2} [direction] The direction of the effect. If omitted,
     *                              it will be extended toward the triggering token.
     */

    /**
     * JSON defining a graphic to spawn with the AreasOfEffect script if
     * it is installed and the trap is triggered.
     * @type {TrapEffect.AreaOfEffect}
     */
    get areaOfEffect() {
      return this._effect.areaOfEffect;
    }

    /**
     * The delay for the trap in seconds. If undefined or 0, the trap
     * activates instantly when triggered.
     * @type {uint}
     */
    get delay() {
      return this._effect.delay;
    }

    /**
     * Whether the trap should be destroyed after it activates.
     * @type {boolean}
     */
    get destroyable() {
      return this._effect.destroyable;
    }

    /**
     * A custom message that is displayed when a character notices a trap via
     * passive detection.
     * @type {string}
     */
    get detectMessage() {
      return this._effect.detectMessage;
    }

    /**
     * The shape of the trap's activated area. This could be an area where the
     * trap token itself is the center of the effect (square or circle), or
     * it could be a list of path IDs which define the activated areas.
     * @type {(string[]|string)}
     */
    get effectShape() {
      if (this._trap.get('aura1_radius'))
        return 'burst';
      else if (['circle', 'rectangle', 'square'].includes(this._effect.effectShape))
        return 'self';
      else
        return this._effect.effectShape || 'self';
    }

    /**
     * Configuration for special FX that are created when the trap activates.
     * @type {object}
     * @property {(string | FxJsonDefinition)} name
     *           Either the name of the FX that is created
     *           (built-in or user-made), or a custom FX JSON defintion.
     * @property {vec2} offset
     *           The offset of the special FX, in units from the trap's token.
     * @property {vec2} direction
     *           For beam-like FX, this specifies the vector for the FX's
     *           direction. If left blank, it will fire towards the token
     *           that activated the trap.
     */
    get fx() {
      return this._effect.fx;
    }

    /**
     * Whether the trap should only be announced to the GM when it is activated.
     * @type {boolean}
     */
    get gmOnly() {
      return this._effect.gmOnly;
    }

    /**
     * A list of IDs for tokens that this trap ignores. These tokens will neither
     * trigger nor be affected by the trap.
     * @type {string[]}
     */
    get ignores() {
      return this._effect.ignores || [];
    }

    /**
     * Gets a copy of the trap's JSON properties.
     * @readonly
     * @type {object}
     */
    get json() {
      return _.clone(this._effect);
    }

    /**
     * JSON defining options to produce an explosion/implosion effect with
     * the KABOOM script.
     * @type {object}
     */
    get kaboom() {
      return this._effect.kaboom;
    }

    /**
     * The flavor message displayed when the trap is activated. If left
     * blank, a default message will be generated based on the name of the
     * trap's token.
     * @type {string}
     */
    get message() {
      return this._effect.message || this._createDefaultTrapMessage();
    }

    /**
     * The trap's name.
     * @type {string}
     */
    get name() {
      return this._trap.get('name');
    }

    /**
     * Secret notes for the GM.
     * @type {string}
     */
    get notes() {
      return this._effect.notes;
    }

    /**
     * The layer that the trap gets revealed to.
     * @type {string}
     */
    get revealLayer() {
      return this._effect.revealLayer;
    }

    /**
     * Whether the trap is revealed when it is spotted.
     * @type {boolean}
     */
    get revealWhenSpotted() {
      return this._effect.revealWhenSpotted;
    }

    /**
     * The name of a sound played when the trap is activated.
     * @type {string}
     */
    get sound() {
      return this._effect.sound;
    }

    /**
     * This is where the trap stops the token.
     * If "edge", then the token is stopped at the trap's edge.
     * If "center", then the token is stopped at the trap's center.
     * If "none", the token is not stopped by the trap.
     * @type {string}
     */
    get stopAt() {
      return this._effect.stopAt || 'center';
    }

    /**
     * Command arguments for integration with the TokenMod script by The Aaron.
     * @type {string}
     */
    get tokenMod() {
      return this._effect.tokenMod;
    }

    /**
     * The trap this TrapEffect represents.
     * @type {Graphic}
     */
    get trap() {
      return this._trap;
    }

    /**
     * The ID of the trap.
     * @type {uuid}
     */
    get trapId() {
      return this._trap.get('_id');
    }

    /**
     * A list of path IDs defining an area that triggers this trap.
     * @type {string[]}
     */
    get triggerPaths() {
      return this._effect.triggerPaths;
    }

    /**
     * A list of names or IDs for traps that will also be triggered when this
     * trap is activated.
     * @type {string[]}
     */
    get triggers() {
      return this._effect.triggers;
    }

    /**
     * The name for the trap/secret's type displayed in automated messages.
     * @type {string}
     */
    get type() {
      return this._effect.type;
    }

    /**
     * The victim who activated the trap.
     * @type {Graphic}
     */
    get victim() {
      return this._victim;
    }

    /**
     * The ID of the trap's victim's token.
     * @type {uuid}
     */
    get victimId() {
      return this._victim && this._victim.get('_id');
    }

    /**
     * The name of the trap's victim's character.
     * @type {uuid}
     */
    get victimCharName() {
      if (this._victim) {
        let char = getObj('character', this._victim.get('represents'));
        if (char)
          return char.get('name');
      }
      return undefined;
    }

    /**
     * @param {Graphic} trap
     *        The trap's token.
     * @param {Graphic} [victim]
     *        The token for the character that activated the trap.
     */
    constructor(trap, victim) {
      let effect = {};

      // URI-escape the notes and remove the HTML elements.
      let notes = trap.get('gmnotes');
      try {
        notes = decodeURIComponent(notes).trim();
      }
      catch(err) {
        notes = unescape(notes).trim();
      }
      if(notes) {
        try {
          notes = notes.split(/<[/]?.+?>/g).join('');
          effect = JSON.parse(notes);
        }
        catch(err) {
          effect.message = 'ERROR: invalid TrapEffect JSON.';
        }
      }
      this._effect = effect;
      this._trap = trap;
      this._victim = victim;
    }

    /**
     * Activates the traps that are triggered by this trap.
     */
    activateTriggers() {
      let triggers = this.triggers;
      if(triggers) {
        let otherTraps = ItsATrap.getTrapsOnPage(this._trap.get('_pageid'));
        let triggeredTraps = _.filter(otherTraps, trap => {
          // Skip if the trap is disabled.
          if(trap.get('status_interdiction'))
            return false;

          return triggers.indexOf(trap.get('name')) !== -1 ||
                 triggers.indexOf(trap.get('_id')) !== -1;
        });

        _.each(triggeredTraps, trap => {
          ItsATrap.activateTrap(trap);
        });
      }
    }

    /**
     * Announces the activated trap.
     * This should be called by TrapThemes to inform everyone about a trap
     * that has been triggered and its results. Fancy HTML formatting for
     * the message is encouraged. If the trap's effect has gmOnly set,
     * then the message will only be shown to the GM.
     * This also takes care of playing the trap's sound, FX, and API command,
     * they are provided.
     * @param  {string} [message]
     *         The message for the trap results displayed in the chat. If
     *         omitted, then the trap's raw message will be displayed.
     */
    announce(message) {
      message = message || this.message;

      // Display the message to everyone, unless it's a secret.
      if(this.gmOnly) {
        ItsATrap.Chat.whisperGM(message);

        // Whisper any secret notes to the GM.
        if(this.notes)
          ItsATrap.Chat.whisperGM(`Trap Notes:<br/>${this.notes}`);
      }
      else {
        ItsATrap.Chat.broadcast(message);

        // Whisper any secret notes to the GM.
        if(this.notes)
          ItsATrap.Chat.whisperGM(`Trap Notes:<br/>${this.notes}`);

        // Reveal the trap if it's set to become visible.
        if(this.trap.get('status_bleeding-eye'))
          ItsATrap.revealTrap(this.trap);

        // Produce special outputs if it has any.
        this.playSound();
        this.playFX();
        this.playAreaOfEffect();
        this.playKaboom();
        this.playTokenMod();
        this.playApi();

        // Allow traps to trigger each other using the 'triggers' property.
        this.activateTriggers();
      }
    }

    /**
     * Creates a default message for the trap.
     * @private
     * @return {string}
     */
    _createDefaultTrapMessage() {
      if(this.victim) {
        if(this.name)
          return `${this.victim.get('name')} set off a trap: ${this.name}!`;
        else
          return `${this.victim.get('name')} set off a trap!`;
      }
      else {
        if(this.name)
          return `${this.name} was activated!`;
        else
          return `A trap was activated!`;
      }
    }

    /**
     * Executes the trap's API chat command if it has one.
     */
    playApi() {
      let api = this.api;
      if(api) {
        let commands;
        if(api instanceof Array)
          commands = api;
        else
          commands = [api];

        // Run each API command.
        _.each(commands, cmd => {
          cmd = cmd.replace(/TRAP_ID/g, this.trapId)
            .replace(/VICTIM_ID/g, this.victimId)
            .replace(/VICTIM_CHAR_NAME/g, this.victimCharName)
            .replace(/\\\[/g, '[')
            .replace(/\\\]/g, ']')
            .replace(/\\{/g, '{')
            .replace(/\\}/g, '}')
            .replace(/\\@/g, '@')
            .replace(/(\t|\n|\r)/g, ' ')
            .replace(/\[\[ +/g, '[[')
            .replace(/ +\]\]/g, ']]');
          sendChat('ItsATrap-api', `${cmd}`);
        });
      }
    }

    /**
     * Spawns the AreasOfEffect graphic for this trap. If AreasOfEffect is
     * not installed, then this has no effect.
     */
    playAreaOfEffect() {
      if(typeof AreasOfEffect !== 'undefined' && this.areaOfEffect) {
        let direction = (this.areaOfEffect.direction && VecMath.scale(this.areaOfEffect.direction, 70)) ||
        (() => {
          if(this._victim)
            return [
              this._victim.get('left') - this._trap.get('left'),
              this._victim.get('top') - this._trap.get('top')
            ];
          else
            return [0, 0];
        })();
        direction[2] = 0;

        let p1 = [this._trap.get('left'), this._trap.get('top'), 1];
        let p2 = VecMath.add(p1, direction);
        if(VecMath.dist(p1, p2) > 0) {
          let segments = [[p1, p2]];
          let pathJson = PathMath.segmentsToPath(segments);
          let path = createObj('path', _.extend(pathJson, {
            _pageid: this._trap.get('_pageid'),
            layer: 'objects',
            stroke: '#ff0000'
          }));

          // Construct a fake player object to create the effect for.
          // This will correctly set the AoE's controlledby property to ''
          // to denote that it is controlled by no one.
          let fakePlayer = {
            get: function() {
              return '';
            }
          };

          // Create the AoE.
          let aoeGraphic = AreasOfEffect.applyEffect(fakePlayer, this.areaOfEffect.name, path);
          aoeGraphic.set('layer', 'map');
          toFront(aoeGraphic);
        }
      }
    }

    /**
     * Spawns built-in or custom FX for an activated trap.
     */
    playFX() {
      var pageId = this._trap.get('_pageid');

      if(this.fx) {
        var offset = this.fx.offset || [0, 0];
        var origin = [
          this._trap.get('left') + offset[0]*70,
          this._trap.get('top') + offset[1]*70
        ];

        var direction = this.fx.direction || (() => {
          if(this._victim)
            return [
              this._victim.get('left') - origin[0],
              this._victim.get('top') - origin[1]
            ];
          else
            return [ 0, 1 ];
        })();

        this._playFXNamed(this.fx.name, pageId, origin, direction);
      }
    }

    /**
     * Play FX using a named effect.
     * @private
     * @param {string} name
     * @param {uuid} pageId
     * @param {vec2} origin
     * @param {vec2} direction
     */
    _playFXNamed(name, pageId, origin, direction) {
      let x = origin[0];
      let y = origin[1];

      let fx = name;
      let isBeamLike = false;

      var custFx = findObjs({ _type: 'custfx', name: name })[0];
      if(custFx) {
        fx = custFx.get('_id');
        isBeamLike = custFx.get('definition').angle === -1;
      }
      else
        isBeamLike = !!_.find(['beam-', 'breath-', 'splatter-'], type => {
          return name.startsWith(type);
        });

      if(isBeamLike) {
        let p1 = {
          x: x,
          y: y
        };
        let p2 = {
          x: x + direction[0],
          y: y + direction[1]
        };

        spawnFxBetweenPoints(p1, p2, fx, pageId);
      }
      else
        spawnFx(x, y, fx, pageId);
    }

    /**
     * Produces an explosion/implosion effect with the KABOOM script.
     */
    playKaboom() {
      if(typeof KABOOM !== 'undefined' && this.kaboom) {
        let center = [this.trap.get('left'), this.trap.get('top')];
        let options = {
          effectPower: this.kaboom.power,
          effectRadius: this.kaboom.radius,
          type: this.kaboom.type,
          scatter: this.kaboom.scatter
        };

        KABOOM.NOW(options, center);
      }
    }

    /**
     * Plays a TrapEffect's sound, if it has one.
     */
    playSound() {
      if(this.sound) {
        var sound = findObjs({
          _type: 'jukeboxtrack',
          title: this.sound
        })[0];
        if(sound) {
          sound.set('playing', true);
          sound.set('softstop', false);
        }
        else {
          let msg = 'Could not find sound "' + this.sound + '".';
          sendChat('ItsATrap-api', msg);
        }
      }
    }

    /**
     * Invokes TokenMod on the victim's token.
     */
    playTokenMod() {
      if(typeof TokenMod !== 'undefined' && this.tokenMod && this._victim) {
        let victimId = this._victim.get('id');
        let command = '!token-mod ' + this.tokenMod + ' --ids ' + victimId;

        // Since playerIsGM fails for the player ID "API", we'll need to
        // temporarily switch TokenMod's playersCanUse_ids option to true.
        if(!TrapEffect.tokenModTimeout) {
          let temp = state.TokenMod.playersCanUse_ids;
          TrapEffect.tokenModTimeout = setTimeout(() => {
            state.TokenMod.playersCanUse_ids = temp;
            TrapEffect.tokenModTimeout = undefined;
          }, 1000);
        }

        state.TokenMod.playersCanUse_ids = true;
        sendChat('ItsATrap-api', command);
      }
    }

    /**
     * Saves the current trap effect properties to the trap's token.
     */
    save() {
      this._trap.set('gmnotes', JSON.stringify(this.json));
    }
  };
})();

/**
 * A small library for checking if a token has line of sight to other tokens.
 */
var LineOfSight = (() => {
  'use strict';

  /**
   * Gets the point for a token.
   * @private
   * @param {Graphic} token
   * @return {vec3}
   */
  function _getPt(token) {
    return [token.get('left'), token.get('top'), 1];
  }

  return class LineOfSight {

    /**
     * Gets the tokens that a token has line of sight to.
     * @private
     * @param  {Graphic} token
     * @param  {Graphic[]} otherTokens
     * @param  {number} [range=Infinity]
     *         The line-of-sight range in pixels.
     * @param {boolean} [isSquareRange=false]
     * @return {Graphic[]}
     */
    static filterTokens(token, otherTokens, range, isSquareRange) {
      if(_.isUndefined(range))
        range = Infinity;

      let pageId = token.get('_pageid');
      let tokenPt = _getPt(token);
      let tokenRW = token.get('width')/2-1;
      let tokenRH = token.get('height')/2-1;

      let wallPaths = findObjs({
        _type: 'path',
        _pageid: pageId,
        layer: 'walls'
      });
      let wallSegments = PathMath.toSegments(wallPaths);

      return _.filter(otherTokens, other => {
        let otherPt = _getPt(other);
        let otherRW = other.get('width')/2;
        let otherRH = other.get('height')/2;

        // Skip tokens that are out of range.
        if(isSquareRange && (
          Math.abs(tokenPt[0]-otherPt[0]) >= range + otherRW + tokenRW ||
          Math.abs(tokenPt[1]-otherPt[1]) >= range + otherRH + tokenRH))
          return false;
        else if(!isSquareRange && VecMath.dist(tokenPt, otherPt) >= range + tokenRW + otherRW)
          return false;

        let segToOther = [tokenPt, otherPt];
        return !_.find(wallSegments, wallSeg => {
          return PathMath.segmentIntersection(segToOther, wallSeg);
        });
      });
    }
  };
})();

/**
 * A module that presents a wizard for setting up traps instead of
 * hand-crafting the JSON for them.
 */
var ItsATrapCreationWizard = (() => {
  'use strict';
  const DISPLAY_WIZARD_CMD = '!ItsATrap_trapCreationWizard_showMenu';
  const MODIFY_CORE_PROPERTY_CMD = '!ItsATrap_trapCreationWizard_modifyTrapCore';
  const MODIFY_THEME_PROPERTY_CMD = '!ItsATrap_trapCreationWizard_modifyTrapTheme';

  const MENU_CSS = {
    'optionsTable': {
      'width': '100%'
    },
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #000',
      'border-radius': '5px',
      'font-weight': 'bold',
      'margin-bottom': '1em',
      'overflow': 'hidden'
    },
    'menuBody': {
      'padding': '5px',
      'text-align': 'center'
    },
    'menuHeader': {
      'background': '#000',
      'color': '#fff',
      'text-align': 'center'
    }
  };

  const LPAREN = '&#40;';
  const RPAREN = '&#41;';

  const LBRACKET = '&#91;';
  const RBRACKET = '&#93;';

  const LBRACE = '&#123;';
  const RBRACE = '&#125;';

  const ATSIGN = '&#64;';

  // The last trap that was edited in the wizard.
  let curTrap;

  /**
   * Displays the menu for setting up a trap.
   * @param {string} who
   * @param {string} playerid
   * @param {Graphic} trapToken
   */
  function displayWizard(who, playerId, trapToken) {
    curTrap = trapToken;
    let content = new HtmlBuilder('div');

    if(!trapToken.get('status_cobweb')) {
      trapToken.set('status_cobweb', true);
      trapToken.set('name', 'A cunning trap');
      trapToken.set('aura1_square', true);
      trapToken.set('gmnotes', getDefaultJson());
    }

    // Core properties
    content.append('h4', 'Core properties');
    let coreProperties = getCoreProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, coreProperties));

    // Trigger properties
    content.append('h4', 'Trigger properties', {
      style: { 'margin-top' : '2em' }
    });
    let triggerProperties = getTriggerProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, triggerProperties));

    // Activation properties
    content.append('h4', 'Activation properties', {
      style: { 'margin-top' : '2em' }
    });
    let shapeProperties = getShapeProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, shapeProperties));

    // Reveal properties
    content.append('h4', 'Detection properties', {
      style: { 'margin-top' : '2em' }
    });
    let revealProperties = getRevealProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, revealProperties));

    // Script properties
    content.append('h4', 'External script properties', {
      style: { 'margin-top': '2em' }
    });
    let scriptProperties = getScriptProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, scriptProperties));

    // Theme properties
    let theme = ItsATrap.getTheme();
    if(theme.getThemeProperties) {
      content.append('h4', 'Theme-specific properties', {
        style: { 'margin-top' : '2em' }
      });
      let properties = theme.getThemeProperties(trapToken);
      content.append(_displayWizardProperties(MODIFY_THEME_PROPERTY_CMD, properties));
    }

    // Remote activate button
    content.append('div', `[Activate Trap](${ItsATrap.REMOTE_ACTIVATE_CMD} ${curTrap.get('_id')})`, {
      style: { 'margin-top' : '2em' }
    });

    let menu = _showMenuPanel('Trap Configuration', content);
    ItsATrap.Chat.whisperGM(menu.toString(MENU_CSS));
  }

  /**
   * Creates the table for a list of trap properties.
   * @private
   */
  function _displayWizardProperties(modificationCommand, properties) {
    let table = new HtmlBuilder('table');
    _.each(properties, prop => {
      let row = table.append('tr', undefined, {
        title: prop.desc
      });

      // Construct the list of parameter prompts.
      let params = [];
      let paramProperties = prop.properties || [prop];
      _.each(paramProperties, item => {
        let options = '';
        if(item.options)
          options = '|' + item.options.join('|');
        params.push(`?{${item.name} ${item.desc} ${options}}`);
      });

      row.append('td', `[${prop.name}](${modificationCommand} ${prop.id}&&${params.join('&&')})`, {
        style: { 'font-size': '0.8em' }
      });

      row.append('td', `${prop.value || ''}`, {
        style: { 'font-size': '0.8em', 'min-width': '1in' }
      });
    });

    return table;
  }

  /**
   * Gets a list of the core trap properties for a trap token.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getCoreProperties(trapToken) {
    let trapEffect = new TrapEffect(trapToken);

    return [
      {
        id: 'name',
        name: 'Name',
        desc: 'The name of the trap',
        value: trapToken.get('name')
      },
      {
        id: 'type',
        name: 'Type',
        desc: 'Is this a trap, or some other hidden secret?',
        value: trapEffect.type || 'trap'
      },
      {
        id: 'message',
        name: 'Message',
        desc: 'The message displayed when the trap is activated.',
        value: trapEffect.message
      },
      {
        id: 'disabled',
        name: 'Disabled?',
        desc: 'A disabled trap will not activate when triggered, but can still be spotted with passive perception.',
        value: trapToken.get('status_interdiction') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'gmOnly',
        name: 'Show GM Only?',
        desc: 'When the trap is activated, should its results only be displayed to the GM?',
        value: trapEffect.gmOnly ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'notes',
        name: 'Secret Notes',
        desc: 'Additional secret notes shown only to the GM when the trap is activated.',
        value: trapEffect.notes || '-'
      }
    ];
  }

  /**
   * Produces JSON for default trap properties.
   * @return {string}
   */
  function getDefaultJson() {
    return JSON.stringify({
      effectShape: 'self',
      stopAt: 'center'
    });
  }

  /**
   * Gets a list of the core trap properties for a trap token dealing
   * with revealing the trap.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getRevealProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    return [
      {
        id: 'searchDist',
        name: 'Max Search Distance',
        desc: 'How far away can characters passively search for this trap?',
        value: (() => {
          let page = getObj('page', trapToken.get('_pageid'));
          let units = page.get('scale_units');
          let dist = trapToken.get('aura2_radius') || trapEffect.searchDist;

          if (dist)
            return `${dist} ${units}`;
          else
            return '-';
        })()
        //value: trapToken.get('aura2_radius') || trapEffect.searchDist || '-'
      },
      {
        id: 'detectMessage',
        name: 'Passive Detection Message',
        desc: 'What message is displayed when a character notices the trap with passive detection?',
        value: trapEffect.detectMessage || '-'
      },
      {
        id: 'revealOpts',
        name: 'Reveal the Trap?',
        desc: 'Whether the trap should be revealed when the trap is activated and/or spotted, or if not, whether the trap troken is deleted after it activates.',
        value: (() => {
          let onActivate = trapToken.get('status_bleeding-eye');
          let onSpotted = trapEffect.revealWhenSpotted;
          let layer = trapEffect.revealLayer || 'map';

          if (onActivate && onSpotted)
            return `Reveal to ${layer} layer when activated or spotted.`;
          else if (onActivate)
            return `Reveal to ${layer} layer when activated.`;
          else if (onSpotted)
            return `Reveal to ${layer} layer when spotted.`;
          else
            return 'Do not reveal.';
        })(),
        properties: [
          {
            id: 'onActivate',
            name: 'Reveal when activated?',
            desc: 'Should the trap be revealed when it is activated?',
            options: ['yes', 'no']
          },
          {
            id: 'onSpotted',
            name: 'Reveal when spotted?',
            desc: 'Should the trap be revealed when it is spotted?',
            options: ['yes', 'no']
          },
          {
            id: 'layer',
            name: 'Reveal Layer',
            desc: 'Which layer should the trap be moved to when it is revealed?',
            options: ['map', 'objects']
          }
        ]
      }
    ];
  }

  /**
   * Gets a list of the core trap properties for a trap token defining
   * the shape of the trap.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getShapeProperties(trapToken) {
    let trapEffect = new TrapEffect(trapToken);

    return _.compact([
      {
        id: 'effectShape',
        name: 'Activation Area',
        desc: `The area of the trap that actually affects tokens after it is triggered. To set paths, you must also select one or more paths defining the trap's blast area. A fill color must be set for tokens inside the path to be affected.`,
        value: trapEffect.effectShape || 'self',
        options: [ 'self', 'burst', 'set selected shapes']
      },
      (() => {
        if (trapEffect.effectShape === 'burst')
          return {
            id: 'effectDistance',
            name: 'Burst Radius',
            desc: `The radius of the trap's burst activation area.`,
            value: (() => {
              let radius = trapToken.get('aura1_radius') || 0;
              let page = getObj('page', trapToken.get('_pageid'));
              let units = page.get('scale_units');
              return `${radius} ${units}`;
            })()
          };
      })(),
      {
        id: 'fx',
        name: 'Special FX',
        desc: 'What special FX are displayed when the trap is activated?',
        value: (() => {
          let fx = trapEffect.fx;
          if(fx) {
            let result = fx.name;
            if(fx.offset)
              result += '; Offset: ' + fx.offset;
            if(fx.direction)
              result += '; Direction: ' + fx.direction;
            return result;
          }
          else
            return 'None';
        })(),
        properties: [
          {
            id: 'name',
            name: 'FX Name',
            desc: 'The name of the special FX.'
          },
          {
            id: 'offset',
            name: 'FX Offset',
            desc: 'The offset ' + LPAREN + 'in units' + RPAREN + ' of the special FX from the trap\'s center. Format: ' + LBRACKET + 'X,Y' + RBRACKET
          },
          {
            id: 'direction',
            name: 'FX Direction',
            desc: 'The directional vector for the special FX ' + LPAREN + 'Leave blank to direct it towards characters' + RPAREN + '. Format: ' + LBRACKET + 'X,Y' + RBRACKET
          }
        ]
      },
      {
        id: 'sound',
        name: 'Sound',
        desc: 'A sound from your jukebox that will play when the trap is activated.',
        value: trapEffect.sound || '-',
        options: (() => {
          let tracks = findObjs({
            _type: 'jukeboxtrack'
          });
          let trackNames = _.map(tracks, track => {
            return _htmlEncode(track.get('title'));
          });
          trackNames.sort();
          return ['none', ...trackNames];
        })()
      },
      {
        id: 'triggers',
        name: 'Chained Trap IDs',
        desc: 'A list of the names or token IDs for other traps that are triggered when this trap is activated.',
        value: (() => {
          let triggers = trapEffect.triggers;
          if(_.isString(triggers))
            triggers = [triggers];

          if(triggers)
            return triggers.join(', ');
          else
            return 'none';
        })(),
        options: ['none', 'set selected traps']
      },
      {
        id: 'destroyable',
        name: 'Delete after Activation?',
        desc: 'Whether to delete the trap token after it is activated.',
        value: trapEffect.destroyable ? 'yes': 'no',
        options: ['yes', 'no']
      }
    ]);
  }

  /**
   * Gets a a list of the trap properties for a trap token dealing with
   * supported API scripts.
   */
  function getScriptProperties(trapToken) {
    let trapEffect = new TrapEffect(trapToken);

    return _.compact([
      {
        id: 'api',
        name: 'API Command',
        desc: 'An API command which the trap runs when it is activated. The constants TRAP_ID and VICTIM_ID will be replaced by the object IDs for the trap and victim. Multiple API commands are now supported by separating each command with &quot;&#59;&#59;&quot;. Certain special characters must be escaped. See README section about the API Command property for details.',
        value: (() => {
          if (trapEffect.api.length > 0) {
            let result = '';
            _.each(trapEffect.api, cmd => {
              result += cmd.replace(/\\\[/g, LBRACKET)
                .replace(/\\\]/g, RBRACKET)
                .replace(/\\{/g, LBRACE)
                .replace(/\\}/g, RBRACE)
                .replace(/\\@/g, ATSIGN) + "<br/>";
            });
            return result;
          }
          else
            return '-';


        })()
      },

      // Requires AreasOfEffect script.
      (() => {
        if(typeof AreasOfEffect !== 'undefined') {
          let effectNames = _.map(AreasOfEffect.getEffects(), effect => {
            return effect.name;
          });

          return {
            id: 'areaOfEffect',
            name: 'Areas of Effect script',
            desc: 'Specifies an AoE graphic to be spawned by the trap.',
            value: (() => {
              let aoe = trapEffect.areaOfEffect;
              if(aoe) {
                let result = aoe.name;
                if(aoe.direction)
                  result += '; Direction: ' + aoe.direction;
                return result;
              }
              else
                return 'None';
            })(),
            properties: [
              {
                id: 'name',
                name: 'AoE Name',
                desc: 'The name of the saved AreasOfEffect effect.',
                options: ['none', ...effectNames]
              },
              {
                id: 'direction',
                name: 'AoE Direction',
                desc: 'The direction of the AoE effect. Optional. If omitted, then the effect will be directed toward affected tokens. Format: ' + LBRACKET + 'X,Y' + RBRACKET
              }
            ]
          };
        }
      })(),

      // Requires KABOOM script by PaprikaCC (Bodin Punyaprateep).
      (() => {
        if(typeof KABOOM !== 'undefined')
          return {
            id: 'kaboom',
            name: 'KABOOM script',
            desc: 'An explosion/implosion generated by the trap with the KABOOM script by PaprikaCC.',
            value: (() => {
              let props = trapEffect.kaboom;
              if(props) {
                let result = props.power + ' ' + props.radius + ' ' + (props.type || 'default');
                if(props.scatter)
                  result += ' ' + 'scatter';
                return result;
              }
              else
                return 'None';
            })(),
            properties: [
              {
                id: 'power',
                name: 'Power',
                desc: 'The power of the KABOOM effect.'
              },
              {
                id: 'radius',
                name: 'Radius',
                desc: 'The radius of the KABOOM effect.'
              },
              {
                id: 'type',
                name: 'FX Type',
                desc: 'The type of element to use for the KABOOM FX.'
              },
              {
                id: 'scatter',
                name: 'Scatter',
                desc: 'Whether to apply scattering to tokens affected by the KABOOM effect.',
                options: ['no', 'yes']
              }
            ]
          };
      })(),

      // Requires the TokenMod script by The Aaron.
      (() => {
        if(typeof TokenMod !== 'undefined')
          return {
            id: 'tokenMod',
            name: 'TokenMod script',
            desc: 'Modify affected tokens with the TokenMod script by The Aaron.',
            value: trapEffect.tokenMod || '-'
          };
      })()
    ]);
  }

  /**
   * Gets a list of the core trap properties for a trap token.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getTriggerProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    return _.compact([
      {
        id: 'triggerPaths',
        name: 'Trigger Area',
        desc: 'The trigger area for the trap. Characters that pass through this area will cause the trap to activate. To set paths, you must also select the paths that trigger the trap.',
        value: (() => {
          if (trapEffect.triggerPaths)
            return trapEffect.triggerPaths;
          else {
            if (trapToken.get('aura1_square'))
              return 'self - rectangle';
            else
              return 'self - circle';
          }
        })(),
        options: ['self - rectangle', 'self - circle', 'set selected lines', 'none']
      },
      ...(() => {
        if (trapEffect.triggerPaths === 'none')
          return [];
        else {
          return [
            {
              id: 'stopAt',
              name: 'Trigger Collision',
              desc: 'Does this trap stop tokens that pass through its trigger area?',
              value: (() => {
                let type = trapEffect.stopAt || 'center';
                if (type === 'center')
                  return 'Move to center of trap token.';
                else if (type === 'edge')
                  return 'Stop at edge of trigger area.';
                else
                  return 'None';
              })(),
              options: ['center', 'edge', 'none']
            },
            {
              id: 'ignores',
              name: 'Ignore Token IDs',
              desc: 'Select one or more tokens to be ignored by this trap.',
              value: trapEffect.ignores || 'none',
              options: ['none', 'set selected tokens']
            },
            {
              id: 'flying',
              name: 'Affects Flying Tokens?',
              desc: 'Should this trap affect flying tokens ' + LPAREN + 'fluffy-wing status ' + RPAREN + '?',
              value: trapToken.get('status_fluffy-wing') ? 'yes' : 'no',
              options: ['yes', 'no']
            },
            {
              id: 'delay',
              name: 'Delay Activation',
              desc: 'When the trap is triggered, its effect is delayed for the specified number of seconds. For best results, also be sure to set an area effect for the trap and set the Stops Tokens At property of the trap to None.',
              value: (() => {
                if (trapEffect.delay)
                  return trapEffect.delay + ' seconds';
                else
                  return '-';
              })()
            }
          ];
        }
      })()
    ]);
  }

  /**
   * HTML-decodes a string.
   * @param {string} str
   * @return {string}
   */
  function _htmlDecode(str) {
    return str.replace(/#(\d+);/g, (match, code) => {
      return String.fromCharCode(code);
    });
  }

  /**
   * HTML-encodes a string, making it safe to use in chat-based action buttons.
   * @param {string} str
   * @return {string}
   */
  function _htmlEncode(str) {
    return str.replace(/[{}()\[\]<>!@#$%^&*\/\\'"+=,.?]/g, match => {
      let charCode = match.charCodeAt(0);
      return `#${charCode};`;
    });
  }

  /**
   * Changes a property for a trap.
   * @param {Graphic} trapToken
   * @param {Array} argv
   * @param {(Graphic|Path)[]} selected
   */
  function modifyTrapProperty(trapToken, argv, selected) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let prop = argv[0];
    let params = argv.slice(1);

    if(prop === 'name')
      trapToken.set('name', params[0]);
    if(prop === 'type')
      trapEffect.type = params[0];
    if(prop === 'api') {
      if(params[0])
        trapEffect.api = params[0].split(";;");
      else
        trapEffect.api = [];
    }
    if(prop === 'areaOfEffect') {
      if(params[0] && params[0] !== 'none') {
        trapEffect.areaOfEffect = {};
        trapEffect.areaOfEffect.name = params[0];
        try {
          trapEffect.areaOfEffect.direction = JSON.parse(params[1]);
        } catch(err) {}
      }
      else
        trapEffect.areaOfEffect = undefined;
    }
    if(prop === 'delay')
      trapEffect.delay = params[0] || undefined;
    if(prop === 'destroyable')
      trapEffect.destroyable = params[0] === 'yes';
    if (prop === 'detectMessage')
      trapEffect.detectMessage = params[0];
    if(prop === 'disabled')
      trapToken.set('status_interdiction', params[0] === 'yes');

    if(prop === 'effectDistance')
      trapToken.set('aura1_radius', parseInt(params[0]) || '');

    if(prop === 'effectShape') {
      if (params[0] === 'self') {
        trapEffect.effectShape = 'self';
        trapToken.set('aura1_radius', '');
      }
      else if (params[0] === 'burst') {
        trapEffect.effectShape = 'burst';
        trapToken.set('aura1_radius', 10);
      }
      else if(params[0] === 'set selected shapes' && selected) {
        trapEffect.effectShape = _.map(selected, path => {
          return path.get('_id');
        });
        trapToken.set('aura1_radius', '');
      }
      else
        throw Error('Unexpected effectShape value: ' + params[0]);
    }
    if(prop === 'flying')
      trapToken.set('status_fluffy-wing', params[0] === 'yes');
    if(prop === 'fx') {
      if(params[0]) {
        trapEffect.fx = {};
        trapEffect.fx.name = params[0];
        try {
          trapEffect.fx.offset = JSON.parse(params[1]);
        }
        catch(err) {}
        try {
          trapEffect.fx.direction = JSON.parse(params[2]);
        }
        catch(err) {}
      }
      else
        trapEffect.fx = undefined;
    }
    if(prop === 'gmOnly')
      trapEffect.gmOnly = params[0] === 'yes';
    if(prop === 'ignores')
      if(params[0] === 'set selected tokens' && selected)
        trapEffect.ignores = _.map(selected, token => {
          return token.get('_id');
        });
      else
        trapEffect.ignores = undefined;
    if(prop === 'kaboom')
      if(params[0])
        trapEffect.kaboom = {
          power: parseInt(params[0]),
          radius: parseInt(params[1]),
          type: params[2] || undefined,
          scatter: params[3] === 'yes'
        };
      else
        trapEffect.kaboom = undefined;
    if(prop === 'message')
      trapEffect.message = params[0];
    if(prop === 'notes')
      trapEffect.notes = params[0];

    if (prop === 'revealOpts') {
      trapToken.set('status_bleeding-eye', params[0] === 'yes');
      trapEffect.revealWhenSpotted = params[1] === 'yes';
      trapEffect.revealLayer = params[2];
    }

    if(prop === 'searchDist')
      trapToken.set('aura2_radius', parseInt(params[0]) || '');
    if(prop === 'sound')
      trapEffect.sound = _htmlDecode(params[0]);
    if(prop === 'stopAt')
      trapEffect.stopAt = params[0];
    if(prop === 'tokenMod')
      trapEffect.tokenMod = params[0];
    if(prop === 'triggers') {
      if (params[0] === 'set selected traps' && selected) {
        trapEffect.triggers = _.map(selected, token => {
          let tokenId = token.get('_id');
          if (tokenId !== trapToken.get('_id'))
            return token.get('_id');
        });
      }
      else
        trapEffect.triggers = undefined;
    }
    if(prop === 'triggerPaths') {
      if (params[0] === 'self - circle') {
        trapEffect.triggerPaths = undefined;
        trapToken.set('aura1_square', false);
      }
      else if (params[0] === 'self - rectangle') {
        trapEffect.triggerPaths = undefined;
        trapToken.set('aura1_square', true);
      }
      else if (params[0] === 'set selected lines' && selected) {
        trapEffect.triggerPaths = _.map(selected, path => {
          return path.get('_id');
        });
        trapToken.set('aura1_square', false);
      }
      else if (params[0] === 'none') {
        trapEffect.triggerPaths = 'none';
        trapToken.set('aura1_square', false);
      }
      else {
        trapEffect.triggerPaths = undefined;
        trapToken.set('aura1_square', false);
      }
    }

    trapToken.set('gmnotes', JSON.stringify(trapEffect));
  }

  /**
   * Displays one of the script's menus.
   * @param {string} header
   * @param {(string|HtmlBuilder)} content
   * @return {HtmlBuilder}
   */
  function _showMenuPanel(header, content) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', header);
    menu.append('.menuBody', content);
    return menu;
  }



  on('ready', () => {
    // Delete the 3.9.4 version of the macro.
    let oldMacros = findObjs({
      _type: 'macro',
      name: 'ItsATrap_trapCreationWizard'
    });
    if (oldMacros.length > 0) {
      ItsATrap.Chat.whisperGM(`<h2>Notice: It's A Trap v3.10</h2>` +
        `<p>The old It's A Trap macro has been replaced with a shorter ` +
        `version named "TrapMaker". Please re-enable it on your macro ` +
        `settings. By popular demand, it no longer appears as a token ` + `action.</p> ` +
        `<p>Please note that some of the trap menu properties have ` +
        `been regrouped or condensed together in order to present a cleaner ` +
        `and hopefully more intuitive interface. This should have no effect ` +
        `on your existing traps. They should work just as they did before ` +
        `this update.</p>` +
        `<p>Please read the script's updated documentation for more ` +
        `details.</p>`);
    }
    _.each(oldMacros, macro => {
      macro.remove();
    });

    // Create the 3.10 version of the macro.
    let macro = findObjs({
      _type: 'macro',
      name: 'TrapMaker'
    })[0];
    if(!macro) {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'TrapMaker',
          action: DISPLAY_WIZARD_CMD
        });
      });
    }
  });

  on('chat:message', msg => {
    try {
      // Get the selected tokens/paths if any.
      let selected;
      if(msg.selected) {
        selected = _.map(msg.selected, sel => {
          return getObj(sel._type, sel._id);
        });
      }

      if(msg.content.startsWith(DISPLAY_WIZARD_CMD)) {
        let trapToken = getObj('graphic', msg.selected[0]._id);
        displayWizard(msg.who, msg.playerId, trapToken);
      }
      if(msg.content.startsWith(MODIFY_CORE_PROPERTY_CMD)) {
        let params = msg.content.replace(MODIFY_CORE_PROPERTY_CMD + ' ', '').split('&&');
        modifyTrapProperty(curTrap, params, selected);
        displayWizard(msg.who, msg.playerId, curTrap);
      }
      if(msg.content.startsWith(MODIFY_THEME_PROPERTY_CMD)) {
        let params = msg.content.replace(MODIFY_THEME_PROPERTY_CMD + ' ', '').split('&&');
        let theme = ItsATrap.getTheme();
        theme.modifyTrapProperty(curTrap, params, selected);
        displayWizard(msg.who, msg.playerId, curTrap);
      }
    }
    catch(err) {
      log('ItsATrapCreationWizard: ' + err.message);
      log(err.stack);
    }
  });

  return {
    displayWizard,
    DISPLAY_WIZARD_CMD,
    MODIFY_CORE_PROPERTY_CMD,
    MODIFY_THEME_PROPERTY_CMD
  };
})();

/**
 * Base class for trap themes: System-specific strategies for handling
 * automation of trap activation results and passive searching.
 * @abstract
 */
var TrapTheme = (() => {
  'use strict';

  /**
   * The name of the theme used to register it.
   * @type {string}
   */
  return class TrapTheme {

    /**
     * A sample CSS object for trap HTML messages created with HTML Builder.
     */
    static get css() {
      return {
        'bold': {
          'font-weight': 'bold'
        },
        'critFail': {
          'border': '2px solid #B31515'
        },
        'critSuccess': {
          'border': '2px solid #3FB315'
        },
        'hit': {
          'color': '#f00',
          'font-weight': 'bold'
        },
        'miss': {
          'color': '#620',
          'font-weight': 'bold'
        },
        'paddedRow': {
          'padding': '1px 1em'
        },
        'rollResult': {
          'background-color': '#FEF68E',
          'cursor': 'help',
          'font-size': '1.1em',
          'font-weight': 'bold',
          'padding': '0 3px'
        },
        'trapMessage': {
          'background-color': '#ccc',
          'font-style': 'italic'
        },
        'trapTable': {
          'background-color': '#fff',
          'border': 'solid 1px #000',
          'border-collapse': 'separate',
          'border-radius': '10px',
          'overflow': 'hidden',
          'width': '100%'
        },
        'trapTableHead': {
          'background-color': '#000',
          'color': '#fff',
          'font-weight': 'bold'
        }
      };
    }

    get name() {
      throw new Error('Not implemented.');
    }

    /**
     * Activates a TrapEffect by displaying the trap's message and
     * automating any system specific trap mechanics for it.
     * @abstract
     * @param {TrapEffect} effect
     */
    activateEffect(effect) {
      throw new Error('Not implemented.');
    }

    /**
     * Gets a list of a trap's theme-specific configured properties.
     * @param {Graphic} trap
     * @return {TrapProperty[]}
     */
    getThemeProperties(trap) {
      return [];
    }

    /**
     * Displays the message to notice a trap.
     * @param {Character} character
     * @param {Graphic} trap
     */
    static htmlNoticeTrap(character, trap) {
      let content = new HtmlBuilder();
      let effect = new TrapEffect(trap, character);

      content.append('.paddedRow trapMessage', character.get('name') + ' notices a ' + (effect.type || 'trap') + ':');
      if (effect.detectMessage)
        content.append('.paddedRow', effect.detectMessage);
      else
        content.append('.paddedRow', trap.get('name'));

      return TrapTheme.htmlTable(content, '#000', effect);
    }

    /**
     * Sends an HTML-stylized message about a noticed trap.
     * @param {(HtmlBuilder|string)} content
     * @param {string} borderColor
     * @param {TrapEffect} [effect]
     * @return {HtmlBuilder}
     */
    static htmlTable(content, borderColor, effect) {
      let type = (effect && effect.type) || 'trap';

      let table = new HtmlBuilder('table.trapTable', '', {
        style: { 'border-color': borderColor }
      });
      table.append('thead.trapTableHead', '', {
        style: { 'background-color': borderColor }
      }).append('th', 'IT\'S A ' + type.toUpperCase() + '!!!');

      table.append('tbody').append('tr').append('td', content, {
        style: { 'padding': '0' }
      });
      return table;
    }

    /**
     * Changes a theme-specific property for a trap.
     * @param {Graphic} trapToken
     * @param {Array} params
     */
    modifyTrapProperty(trapToken, argv) {
      // Default implementation: Do nothing.
    }

    /**
     * The system-specific behavior for a character passively noticing a trap.
     * @abstract
     * @param {Graphic} trap
     *        The trap's token.
     * @param {Graphic} charToken
     *        The character's token.
     */
    passiveSearch(trap, charToken) {
      throw new Error('Not implemented.');
    }
  };
})();

/**
 * A base class for trap themes using the D20 system (D&D 3.5, 4E, 5E, Pathfinder, etc.)
 * @abstract
 */
var D20TrapTheme = (() => {
  'use strict';

  return class D20TrapTheme extends TrapTheme {

    /**
     * @inheritdoc
     */
    activateEffect(effect) {
      let character = getObj('character', effect.victim.get('represents'));
      let effectResults = effect.json;

      // Automate trap attack/save mechanics.
      Promise.resolve()
      .then(() => {
        effectResults.character = character;
        if(character) {
          if(effectResults.attack)
            return this._doTrapAttack(character, effectResults);
          else if(effectResults.save && effectResults.saveDC)
            return this._doTrapSave(character, effectResults);
        }
        return effectResults;
      })
      .then(effectResults => {
        let html = D20TrapTheme.htmlTrapActivation(effectResults);
        effect.announce(html.toString(TrapTheme.css));
      })
      .catch(err => {
        ItsATrap.Chat.error(err);
      });
    }

    /**
     * Does a trap's attack roll.
     * @private
     */
    _doTrapAttack(character, effectResults) {
      return Promise.all([
        this.getAC(character),
        CharSheetUtils.rollAsync('1d20 + ' + effectResults.attack)
      ])
      .then(tuple => {
        let ac = tuple[0];
        let atkRoll = tuple[1];

        ac = ac || 10;
        effectResults.ac = ac;
        effectResults.roll = atkRoll;
        effectResults.trapHit = atkRoll.total >= ac;
        return effectResults;
      });
    }

    /**
     * Does a trap's save.
     * @private
     */
    _doTrapSave(character, effectResults) {
      return this.getSaveBonus(character, effectResults.save)
      .then(saveBonus => {
        saveBonus = saveBonus || 0;
        effectResults.saveBonus = saveBonus;
        return CharSheetUtils.rollAsync('1d20 + ' + saveBonus);
      })
      .then((saveRoll) => {
        effectResults.roll = saveRoll;
        effectResults.trapHit = saveRoll.total < effectResults.saveDC;
        return effectResults;
      });
    }

    /**
     * Gets a character's AC.
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getAC(character) {
      throw new Error('Not implemented.');
    }

    /**
     * Gets a character's passive wisdom (Perception).
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getPassivePerception(character) {
      throw new Error('Not implemented.');
    }

    /**
     * Gets a character's saving throw bonus.
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getSaveBonus(character, saveName) {
      throw new Error('Not implemented.');
    }

    /**
     * @inheritdoc
     */
    getThemeProperties(trapToken) {
      let trapEffect = (new TrapEffect(trapToken)).json;

      let LPAREN = '&#40;';
      let RPAREN = '&#41;';

      let LBRACE = '&#91;';
      let RBRACE = '&#93;';

      return [
        {
          id: 'attack',
          name: 'Attack Bonus',
          desc: `The trap's attack roll bonus vs AC.`,
          value: trapEffect.attack || '-'
        },
        {
          id: 'damage',
          name: 'Damage',
          desc: `The dice roll expression for the trap's damage.`,
          value: trapEffect.damage || '-'
        },
        {
          id: 'missHalf',
          name: 'Miss - Half Damage',
          desc: 'Does the trap deal half damage on a miss?',
          value: trapEffect.missHalf ? 'yes' : 'no',
          options: ['yes', 'no']
        },
        {
          id: 'save',
          name: 'Saving Throw',
          desc: `The trap's saving throw.`,
          value: (() => {
            let gmOnly = trapEffect.hideSave ? '(hide results)' : '';
            if (trapEffect.save)
              return `${trapEffect.save} save DC ${trapEffect.saveDC}` +
                `${trapEffect.hideSave ? ' (hide results)' : ''}`;
            else
              return 'none';
          })(),
          properties: [
            {
              id: 'save',
              name: 'Saving Throw',
              desc: 'Which saving throw does the trap use?',
              options: [ 'none', 'str', 'dex', 'con', 'int', 'wis', 'cha' ]
            },
            {
              id: 'dc',
              name: 'Save DC',
              desc: 'What is the DC for the saving throw?'
            },
            {
              id: 'hideSave',
              name: 'Hide Save Result',
              desc: 'Show the Saving Throw result only to the GM?',
              options: ['no', 'yes']
            }
          ]
        },
        {
          id: 'spotDC',
          name: 'Passive Perception DC',
          desc: 'The passive skill check DC to detect the trap.',
          value: trapEffect.spotDC || '-'
        }
      ];
    }

    /**
     * Produces HTML for a faked inline roll result for d20 systems.
     * @param  {int} result
     * @param  {string} tooltip
     * @return {HtmlBuilder}
     */
    static htmlRollResult(result, tooltip) {
      let d20 = result.rolls[0].results[0].v;

      let clazzes = ['rollResult'];
      if(d20 === 20)
        clazzes.push('critSuccess');
      if(d20 === 1)
        clazzes.push('critFail');
      return new HtmlBuilder('span.' + clazzes.join(' '), result.total, {
        title: tooltip
      });
    }

    /**
     * Produces the HTML for a trap activation message for most d20 systems.
     * @param {object} effectResults
     * @return {HtmlBuilder}
     */
    static htmlTrapActivation(effectResults) {
      let content = new HtmlBuilder('div');

      // Add the flavor message.
      content.append('.paddedRow trapMessage', effectResults.message);

      if(effectResults.character) {
        var row = content.append('.paddedRow');
        row.append('span.bold', 'Target:');
        row.append('span', effectResults.character.get('name'));

        var hasHitResult = false;

        // Add the attack roll message.
        if(effectResults.attack) {
          let rollResult = D20TrapTheme.htmlRollResult(effectResults.roll, '1d20 + ' + effectResults.attack);
          content.append('.paddedRow')
            .append('span.bold', 'Attack roll:')
            .append('span', rollResult)
            .append('span', ' vs AC ' + effectResults.ac);
          hasHitResult = true;
        }

        // Add the saving throw message.
        if(effectResults.save) {
          if (!effectResults.saveDC)
            throw new Error(`You forgot to set the trap's save DC!`);

          let rollResult = D20TrapTheme.htmlRollResult(effectResults.roll, '1d20 + ' + effectResults.saveBonus);
          let saveMsg = new HtmlBuilder('.paddedRow');
          saveMsg.append('span.bold', effectResults.save.toUpperCase() + ' save:');
          saveMsg.append('span', rollResult);
          saveMsg.append('span', ' vs DC ' + effectResults.saveDC);

          // If the save result is a secret, whisper it to the GM.
          if(effectResults.hideSave)
            ItsATrap.Chat.whisperGM(saveMsg.toString(TrapTheme.css));
          else
            content.append(saveMsg);

          hasHitResult = true;
        }

        if (hasHitResult) {
          // Add the hit/miss message.
          if(effectResults.trapHit === 'AC unknown') {
            content.append('.paddedRow', 'AC could not be determined with the current version of your character sheet. For the time being, please resolve the attack against AC manually.');
            if(effectResults.damage)
              content.append('.paddedRow', 'Damage: [[' + effectResults.damage + ']]');
          }
          else if(effectResults.trapHit) {
            let row = content.append('.paddedRow');
            row.append('span.hit', 'HIT! ');
            if(effectResults.damage)
              row.append('span', 'Damage: [[' + effectResults.damage + ']]');
            else
              row.append('span', 'You fall prey to the ' + (effectResults.type || 'trap') + '\'s effects!');
          }
          else {
            let row = content.append('.paddedRow');
            row.append('span.miss', 'MISS! ');
            if(effectResults.damage && effectResults.missHalf)
              row.append('span', 'Half damage: [[floor((' + effectResults.damage + ')/2)]].');
          }
        }
      }

      return TrapTheme.htmlTable(content, '#a22', effectResults);
    }

    /**
     * @inheritdoc
     */
    modifyTrapProperty(trapToken, argv) {
      let trapEffect = (new TrapEffect(trapToken)).json;

      let prop = argv[0];
      let params = argv.slice(1);

      if(prop === 'attack') {
        trapEffect.attack = parseInt(params[0]);
        trapEffect.save = undefined;
        trapEffect.saveDC = undefined;
      }
      if(prop === 'damage')
        trapEffect.damage = params[0];
      if(prop === 'missHalf')
        trapEffect.missHalf = params[0] === 'yes';
      if(prop === 'save') {
        trapEffect.save = params[0] === 'none' ? undefined : params[0];
        trapEffect.saveDC = parseInt(params[1]) || 0;
        trapEffect.hideSave = params[2] === 'yes';
        trapEffect.attack = undefined;
      }
      if(prop === 'spotDC')
        trapEffect.spotDC = parseInt(params[0]);

      trapToken.set('gmnotes', JSON.stringify(trapEffect));
    }

    /**
     * @inheritdoc
     */
    passiveSearch(trap, charToken) {
      let effect = (new TrapEffect(trap, charToken)).json;
      let character = getObj('character', charToken.get('represents'));

      // Only do passive search for traps that have a spotDC.
      if(effect.spotDC && character) {

        // If the character's passive perception beats the spot DC, then
        // display a message and mark the trap's trigger area.
        return this.getPassivePerception(character)
        .then(passWis => {
          if(passWis >= effect.spotDC) {
            let html = TrapTheme.htmlNoticeTrap(character, trap);
            ItsATrap.noticeTrap(trap, html.toString(TrapTheme.css));
          }
        })
        .catch(err => {
          ItsATrap.Chat.error(err);
        });
      }
    }
  };
})();

/**
 * Base class for TrapThemes using D&D 4E-ish rules.
 * @abstract
 */
var D20TrapTheme4E = (() => {
  'use strict';

  return class D20TrapTheme4E extends D20TrapTheme {

    /**
     * @inheritdoc
     */
    activateEffect(effect) {
      let character = getObj('character', effect.victim.get('represents'));
      let effectResult = effect.json;

      Promise.resolve()
      .then(() => {
        effectResult.character = character;

        // Automate trap attack mechanics.
        if(character && effectResult.defense && effectResult.attack) {
          return Promise.all([
            this.getDefense(character, effectResult.defense),
            CharSheetUtils.rollAsync('1d20 + ' + effectResult.attack)
          ])
          .then(tuple => {
            let defenseValue = tuple[0];
            let attackRoll = tuple[1];

            defenseValue = defenseValue || 0;
            effectResult.defenseValue = defenseValue;
            effectResult.roll = attackRoll;
            effectResult.trapHit = attackRoll.total >= defenseValue;
            return effectResult;
          });
        }
        return effectResult;
      })
      .then(effectResult => {
        let html = D20TrapTheme4E.htmlTrapActivation(effectResult);
        effect.announce(html.toString(TrapTheme.css));
      })
      .catch(err => {
        ItsATrap.Chat.error(err);
      });
    }

    /**
     * Gets the value for one of a character's defenses.
     * @param {Character} character
     * @param {string} defenseName
     * @return {Promise<int>}
     */
    getDefense(character, defenseName) {
      throw new Error('Not implemented.');
    }

    /**
     * @inheritdoc
     */
    getThemeProperties(trapToken) {
      let trapEffect = (new TrapEffect(trapToken)).json;
      return [
        {
          id: 'attack',
          name: 'Attack Roll',
          desc: `The trap's attack roll bonus vs AC.`,
          value: (() => {
            let atkBonus = trapEffect.attack;
            let atkVs = trapEffect.defense;

            if (atkVs)
              return `+${atkBonus} vs ${atkVs}`;
            else
              return 'none';
          })(),
          properties: [
            {
              id: 'bonus',
              name: 'Attack Bonus',
              desc: 'What is the attack roll modifier?'
            },
            {
              id: 'vs',
              name: 'Defense',
              desc: 'What defense does the attack target?',
              options: ['ac', 'fort', 'ref', 'will']
            }
          ]
        },
        {
          id: 'damage',
          name: 'Damage',
          desc: `The dice roll expression for the trap's damage.`,
          value: trapEffect.damage
        },
        {
          id: 'missHalf',
          name: 'Miss - Half Damage',
          desc: 'Does the trap deal half damage on a miss?',
          value: trapEffect.missHalf ? 'yes' : 'no',
          options: ['yes', 'no']
        },
        {
          id: 'spotDC',
          name: 'Perception DC',
          desc: 'The skill check DC to spot the trap.',
          value: trapEffect.spotDC
        }
      ];
    }

    /**
     * Creates the HTML for an activated trap's result.
     * @param  {object} effectResult
     * @return {HtmlBuilder}
     */
    static htmlTrapActivation(effectResult) {
      let content = new HtmlBuilder('div');

      // Add the flavor message.
      content.append('.paddedRow trapMessage', effectResult.message);

      if(effectResult.character) {

        // Add the attack roll message.
        if(_.isNumber(effectResult.attack)) {
          let rollHtml = D20TrapTheme.htmlRollResult(effectResult.roll, '1d20 + ' + effectResult.attack);
          let row = content.append('.paddedRow');
          row.append('span.bold', 'Attack roll: ');
          row.append('span', rollHtml + ' vs ' + effectResult.defense + ' ' + effectResult.defenseValue);
        }

        // Add the hit/miss message.
        if(effectResult.trapHit) {
          let row = content.append('.paddedRow');
          row.append('span.hit', 'HIT! ');
          if(effectResult.damage)
            row.append('span', 'Damage: [[' + effectResult.damage + ']]');
          else
            row.append('span', effectResult.character.get('name') + ' falls prey to the trap\'s effects!');
        }
        else {
          let row = content.append('.paddedRow');
          row.append('span.miss', 'MISS! ');
          if(effectResult.damage && effectResult.missHalf)
            row.append('span', 'Half damage: [[floor((' + effectResult.damage + ')/2)]].');
        }
      }

      return TrapTheme.htmlTable(content, '#a22', effectResult);
    }

    /**
     * @inheritdoc
     */
    modifyTrapProperty(trapToken, argv) {
      let trapEffect = (new TrapEffect(trapToken)).json;

      let prop = argv[0];
      let params = argv.slice(1);

      if(prop === 'attack') {
        let bonus = parseInt(params[0]);
        let defense = params[1];

        if (!bonus && bonus !== 0) {
          trapEffect.attack = undefined;
          trapEffect.defense = undefined;
        }
        else {
          trapEffect.attack = bonus;
          trapEffect.defense = defense;
        }
      }
      if(prop === 'damage')
        trapEffect.damage = params[0];
      if(prop === 'missHalf')
        trapEffect.missHalf = params[0] === 'yes';
      if(prop === 'spotDC')
        trapEffect.spotDC = parseInt(params[0]);

      trapToken.set('gmnotes', JSON.stringify(trapEffect));
    }
  };
})();

/**
 * The default system-agnostic Admiral Ackbar theme.
 * @implements TrapTheme
 */
(() => {
  'use strict';

  class DefaultTheme {

    /**
     * @inheritdoc
     */
    get name() {
      return 'default';
    }

    /**
     * @inheritdoc
     */
    activateEffect(effect) {
      let content = new HtmlBuilder('div');

      var row = content.append('.paddedRow');
      if(effect.victim) {
        row.append('span.bold', 'Target:');
        row.append('span', effect.victim.get('name'));
      }

      content.append('.paddedRow', effect.message);

      let table = TrapTheme.htmlTable(content, '#a22', effect);
      let tableView = table.toString(TrapTheme.css);
      effect.announce(tableView);
    }

    /**
     * @inheritdoc
     */
    passiveSearch(trap, charToken) {
      // Do nothing.
    }
  }

  ItsATrap.registerTheme(new DefaultTheme());
})();

ItsATrap.Chat = (() => {
  'use strict';

  /**
   * Broadcasts a message spoken by the script's configured announcer.
   * This message is visible to everyone.
   */
  function broadcast(msg) {
    let announcer = getAnnouncer();
    sendChat(announcer, msg);
  }

  /**
   * Log an error and its stack trace and alert the GM about it.
   * @param {Error} err The error.
   */
  function error(err) {
    whisperGM(err.message + "<br/>Check API console logs for details.");
    log(err.stack);
  }

  /**
   * Get the name of the script's announcer (for users who don't like
   * Admiral Ackbar).
   * @return {string}
   */
  function getAnnouncer() {
    return state.ItsATrap.userOptions.announcer || 'Admiral Ackbar';
  }

  /**
   * Whisper a message from the API to the GM.
   * @param {string} msg The message to be whispered to the GM.
   */
  function whisperGM(msg) {
    sendChat('Its A Trap! script', '/w gm ' + msg);
  }

  return {
    broadcast,
    error,
    getAnnouncer,
    whisperGM
  };
})();
