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
     * @type {string}
     */
    get api() {
      return this._effect.api;
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
      return this._effect.stopAt;
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
     * The ID of the trap's victim.
     * @type {uuid}
     */
    get victimId() {
      return this._victim && this._victim.get('_id');
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
      let announcer = state.ItsATrap.userOptions.announcer;

      // Display the message to everyone, unless it's a secret.
      if(this.gmOnly) {
        message = '/w gm ' + message;
        sendChat(announcer, message);

        // Whisper any secret notes to the GM.
        if(this.notes)
          sendChat(announcer, '/w gm Trap Notes:<br/>' + this.notes);
      }
      else {
        sendChat(announcer, message);

        // Whisper any secret notes to the GM.
        if(this.notes)
          sendChat(announcer, '/w gm Trap Notes:<br/>' + this.notes);

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
        api = api.split('TRAP_ID').join(this.trapId);
        api = api.split('VICTIM_ID').join(this.victimId);
        sendChat('ItsATrap-api', api);
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

          let aoeGraphic = AreasOfEffect.applyEffect('', this.areaOfEffect.name, path);
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
        sendChat('It\'s A Trap', command);
      }
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

    // Core properties
    content.append('h4', 'Core properties');
    let coreProperties = getCoreProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, coreProperties));

    // Shape properties
    content.append('h4', 'Shape properties', {
      style: { 'margin-top' : '2em' }
    });
    let shapeProperties = getShapeProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, shapeProperties));

    // Trigger properties
    content.append('h4', 'Trigger properties', {
      style: { 'margin-top' : '2em' }
    });
    let triggerProperties = getTriggerProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, triggerProperties));

    // Reveal properties
    content.append('h4', 'Reveal properties', {
      style: { 'margin-top' : '2em' }
    });
    let revealProperties = getRevealProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, revealProperties));

    // Special properties
    content.append('h4', 'Special properties', {
      style: { 'margin-top' : '2em' }
    });
    let specialProperties = getSpecialProperties(trapToken);
    content.append(_displayWizardProperties(MODIFY_CORE_PROPERTY_CMD, specialProperties));

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
    content.append('div', `[Activate Trap](${ItsATrap.REMOTE_ACTIVATE_CMD})`, {
      style: { 'margin-top' : '2em' }
    });

    let menu = _showMenuPanel('Trap Configuration', content);
    _whisper(who, menu.toString(MENU_CSS));
    trapToken.set('status_cobweb', true);
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
        style: { 'font-size': '0.8em' }
      });
    });

    return table;
  }

  /**
   * Fixes msg.who.
   * @param {string} who
   * @return {string}
   */
  function _fixWho(who) {
    return who.replace(/\(GM\)/, '').trim();
  }

  /**
   * Gets a list of the core trap properties for a trap token.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getCoreProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

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
        name: 'Disabled',
        desc: 'A disabled trap will not activate when triggered, but can still be spotted with passive perception.',
        value: trapToken.get('status_interdiction') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'gmOnly',
        name: 'GM Only',
        desc: 'When the trap is activated, should its results only be displayed to the GM?',
        value: trapEffect.gmOnly ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'notes',
        name: 'GM Notes',
        desc: 'Additional secret notes shown only to the GM when the trap is activated.',
        value: trapEffect.notes
      }
    ];
  }

  /**
   * Gets a list of the core trap properties for a trap token dealing
   * with revealing the trap.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getRevealProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'searchDist',
        name: 'Max Search Distance',
        desc: 'How far away can characters passively search for this trap?',
        value: trapToken.get('aura2_radius') || trapEffect.searchDist
      },
      {
        id: 'revealToPlayers',
        name: 'When Activated',
        desc: 'Should this trap be revealed to the players when it is activated?',
        value: trapToken.get('status_bleeding-eye') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'revealWhenSpotted',
        name: 'When Spotted',
        desc: 'Should this trap be revealed to the players when a character notices it by passive searching?',
        value: trapEffect.revealWhenSpotted ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'revealLayer',
        name: 'Layer',
        desc: 'When this trap is revealed, which layer is it revealed on?',
        value: trapEffect.revealLayer || 'map',
        options: ['map', 'objects']
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
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'flying',
        name: 'Affects Flying Tokens',
        desc: 'Should this trap affect flying tokens ' + LPAREN + 'fluffy-wing status ' + RPAREN + '?',
        value: trapToken.get('status_fluffy-wing') ? 'yes' : 'no',
        options: ['yes', 'no']
      },
      {
        id: 'effectDistance',
        name: 'Blast distance',
        desc: 'How far away can the trap affect other tokens?',
        value: trapToken.get('aura1_radius') || 0
      },
      {
        id: 'stopAt',
        name: 'Stops Tokens At',
        desc: 'Does this trap stop tokens that pass through its trigger area?',
        value: trapEffect.stopAt,
        options: ['center', 'edge', 'none']
      },
      {
        id: 'effectShape',
        name: 'Trap shape',
        desc: 'Is the shape of the trap\'s effect circular or square?',
        value: trapToken.get('aura1_square') ? 'square' : 'circle',
        options: [ 'circle', 'square' ]
      },
    ];
  }

  /**
   * Gets a list of the core trap properties for a trap token dealing
   * with special side effects such as FX, sound, and API commands.
   * @param {Graphic} token
   * @return {object[]}
   */
  function getSpecialProperties(trapToken) {
    let trapEffect = (new TrapEffect(trapToken)).json;

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return _.compact([
      {
        id: 'api',
        name: 'API Command',
        desc: 'An API command which the trap runs when it is activated. The constants TRAP_ID and VICTIM_ID will be replaced by the object IDs for the trap and victim.',
        value: trapEffect.api
      },

      // Requires AreasOfEffect script.
      (() => {
        if(typeof AreasOfEffect !== 'undefined')
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
              },
              {
                id: 'direction',
                name: 'AoE Direction',
                desc: 'The direction of the AoE effect. Optional. If omitted, then the effect will be directed toward affected tokens. Format: ' + LBRACE + 'X,Y' + RBRACE
              }
            ]
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
            desc: 'The offset ' + LPAREN + 'in units' + RPAREN + ' of the special FX from the trap\'s center. Format: ' + LBRACE + 'X,Y' + RBRACE
          },
          {
            id: 'direction',
            name: 'FX Direction',
            desc: 'The directional vector for the special FX ' + LPAREN + 'Leave blank to direct it towards characters' + RPAREN + '. Format: ' + LBRACE + 'X,Y' + RBRACE
          }
        ]
      },

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
      {
        id: 'sound',
        name: 'Sound',
        desc: 'A sound from your jukebox that will play when the trap is activated.',
        value: trapEffect.sound
      },
      (() => {
        if(typeof TokenMod !== 'undefined')
          return {
            id: 'tokenMod',
            name: 'TokenMod script',
            desc: 'Modify affected tokens with the TokenMod script by The Aaron.',
            value: trapEffect.tokenMod
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

    let LPAREN = '&#40;';
    let RPAREN = '&#41;';

    let LBRACE = '&#91;';
    let RBRACE = '&#93;';

    return [
      {
        id: 'triggerPaths',
        name: 'Set Trigger',
        desc: 'To set paths, you must also select the paths that trigger the trap.',
        value: trapEffect.triggerPaths || 'self',
        options: ['self', 'paths']
      },
      {
        id: 'triggers',
        name: 'Other Traps Triggered',
        desc: 'A list of the names or token IDs for other traps that are triggered when this trap is activated.',
        value: (() => {
          let triggers = trapEffect.triggers;
          if(_.isString(triggers))
            triggers = [triggers];

          if(triggers)
            return triggers.join(', ');
          else
            return undefined;
        })()
      }
    ];
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
    if(prop === 'api')
      trapEffect.api = params[0];
    if(prop === 'areaOfEffect')
      if(params[0]) {
        trapEffect.areaOfEffect = {};
        trapEffect.areaOfEffect.name = params[0];
        try {
          trapEffect.areaOfEffect.direction = JSON.parse(params[1]);
        } catch(err) {}
      }
      else
        trapEffect.areaOfEffect = undefined;

    if(prop === 'disabled')
      trapToken.set('status_interdiction', params[0] === 'yes');
    if(prop === 'effectDistance')
      trapToken.set('aura1_radius', parseInt(params[0]));
    if(prop === 'effectShape')
      trapToken.set('aura1_square', params[0] === 'square');
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
    if(prop === 'revealLayer')
      trapEffect.revealLayer = params[0];
    if(prop === 'revealToPlayers')
      trapToken.set('status_bleeding-eye', params[0] === 'yes');
    if(prop === 'revealWhenSpotted')
      trapEffect.revealWhenSpotted = params[0] === 'yes';
    if(prop === 'searchDist')
      trapToken.set('aura2_radius', parseInt(params[0]));
    if(prop === 'sound')
      trapEffect.sound = params[0];
    if(prop === 'stopAt')
      trapEffect.stopAt = params[0];
    if(prop === 'tokenMod')
      trapEffect.tokenMod = params[0];
    if(prop === 'triggers')
      trapEffect.triggers = _.map(params[0].split(','), trigger => {
        return trigger.trim();
      });
    if(prop === 'triggerPaths')
      if(params[0] === 'paths' && selected)
        trapEffect.triggerPaths = _.map(selected, path => {
          return path.get('_id');
        });
      else
        trapEffect.triggerPaths = undefined;

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

  /**
   * @private
   * Whispers a Marching Order message to someone.
   */
  function _whisper(who, msg) {
    sendChat('Its A Trap! script', '/w "' + _fixWho(who) + '" ' + msg);
  }

  on('ready', () => {
    let macro = findObjs({
      _type: 'macro',
      name: 'ItsATrap_trapCreationWizard'
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
          name: 'ItsATrap_trapCreationWizard',
          action: DISPLAY_WIZARD_CMD,
          istokenaction: true
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
     * Attempts to force a calculated attribute to be corrected by
     * setting it.
     * @param {Character} character
     * @param {string} attr
     */
    static forceAttrCalculation(character, attr) {
      // Attempt to force the calculation of the save modifier by setting it.
      createObj('attribute', {
        _characterid: character.get('_id'),
        name: attr,
        current: -9999
      });

      // Then try again.
      return TrapTheme.getSheetAttr(character, attr)
      .then(result => {
        if(_.isNumber(result))
          return result;
        else
          log('Could not calculate attribute: ' + attr + ' - ' + result);
      });
    }

    /**
     * Asynchronously gets the value of a character sheet attribute.
     * @param  {Character}   character
     * @param  {string}   attr
     * @return {Promise<any>}
     *         Contains the value of the attribute.
     */
    static getSheetAttr(character, attr) {
      let rollExpr = '@{' + character.get('name') + '|' + attr + '}';
      return TrapTheme.rollAsync(rollExpr)
      .then((roll) => {
        if(roll)
          return roll.total;
        else
          throw new Error('Could not resolve roll expression: ' + rollExpr);
      });
    }

    /**
     * Gets the map of attributes inside of a repeating section row.
     * @param {Character} character
     * @param {string} section
     *        The name of the repeating section.
     * @param {func} rowFilter
     *        A filter function to find the correct row. The argument passed to it is a
     *        map of attribute names (without the repeating section ID part - e.g. "name"
     *        instead of "repeating_skills_-123abc_name") to their actual attributes in
     *        the current row being filtered. The function should return true iff it is
     *        the correct row we're looking for.
     * @return {Promise<any>}
     *         Contains the map of attributes.
     */
    static getSheetRepeatingRow(character, section, rowFilter) {
      // Get all attributes in this section and group them by row.
      let attrs = findObjs({
        _type: 'attribute',
        _characterid: character.get('_id')
      });

      // Group the attributes by row.
      let rows = {};
      _.each(attrs, attr => {
        let regex = new RegExp(`repeating_${section}_(-([0-9a-zA-Z\-_](?!_storage))+?|\$\d+?)_([0-9a-zA-Z\-_]+)`);
        let match = attr.get('name').match(regex);
        if(match) {
          let rowId = match[1];
          let attrName = match[3];
          if(!rows[rowId])
            rows[rowId] = {};

          rows[rowId][attrName] = attr;
        }
      });

      // Find the row that matches our filter.
      return Promise.resolve(_.find(rows, rowAttrs => {
        return rowFilter(rowAttrs);
      }));
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

    /**
     * Asynchronously rolls a dice roll expression and returns the result's total in
     * a callback. The result is undefined if an invalid expression is given.
     * @param  {string} expr
     * @return {Promise<int>}
     */
    static rollAsync(expr) {
      return new Promise((resolve, reject) => {
        sendChat('TrapTheme', '/w gm [[' + expr + ']]', (msg) => {
          try {
            let results = msg[0].inlinerolls[0].results;
            resolve(results);
          }
          catch(err) {
            reject(err);
          }
        });
      });
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
        sendChat('TrapTheme: ' + this.name, '/w gm ' + err.message);
        log(err.stack);
      });
    }

    /**
     * Does a trap's attack roll.
     * @private
     */
    _doTrapAttack(character, effectResults) {
      return Promise.all([
        this.getAC(character),
        TrapTheme.rollAsync('1d20 + ' + effectResults.attack)
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
        return TrapTheme.rollAsync('1d20 + ' + saveBonus);
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
          value: trapEffect.attack
        },
        {
          id: 'damage',
          name: 'Damage',
          desc: `The dice roll expression for the trap's damage.`,
          value: trapEffect.damage
        },
        {
          id: 'hideSave',
          name: 'Hide Save Result',
          desc: 'Show the Saving Throw result only to the GM?',
          value: trapEffect.hideSave ? 'yes' : 'no',
          options: ['yes', 'no']
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
          desc: 'The type of saving throw used by the trap.',
          value: trapEffect.save,
          options: [ 'none', 'str', 'dex', 'con', 'int', 'wis', 'cha' ]
        },
        {
          id: 'saveDC',
          name: 'Saving Throw DC',
          desc: `The DC for the trap's saving throw.`,
          value: trapEffect.saveDC
        },
        {
          id: 'spotDC',
          name: 'Spot DC',
          desc: 'The skill check DC to spot the trap.',
          value: trapEffect.spotDC
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

        // Add the attack roll message.
        if(effectResults.attack) {
          let rollResult = D20TrapTheme.htmlRollResult(effectResults.roll, '1d20 + ' + effectResults.attack);
          content.append('.paddedRow')
            .append('span.bold', 'Attack roll:')
            .append('span', rollResult)
            .append('span', ' vs AC ' + effectResults.ac);
        }

        // Add the saving throw message.
        if(effectResults.save) {
          let rollResult = D20TrapTheme.htmlRollResult(effectResults.roll, '1d20 + ' + effectResults.saveBonus);
          let saveMsg = new HtmlBuilder('.paddedRow');
          saveMsg.append('span.bold', effectResults.save.toUpperCase() + ' save:');
          saveMsg.append('span', rollResult);
          saveMsg.append('span', ' vs DC ' + effectResults.saveDC);

          // If the save result is a secret, whisper it to the GM.
          if(effectResults.hideSave)
            sendChat('Admiral Ackbar', '/w gm ' + saveMsg.toString(TrapTheme.css));
          else
            content.append(saveMsg);
        }

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

      return TrapTheme.htmlTable(content, '#a22', effectResults);
    }

    /**
     * @inheritdoc
     */
    modifyTrapProperty(trapToken, argv) {
      let trapEffect = (new TrapEffect(trapToken)).json;

      let prop = argv[0];
      let params = argv.slice(1);

      log(prop);
      log(params);

      if(prop === 'attack')
        trapEffect.attack = parseInt(params[0]);
      if(prop === 'damage')
        trapEffect.damage = params[0];
      if(prop === 'hideSave')
        trapEffect.hideSave = params[0] === 'yes';
      if(prop === 'missHalf')
        trapEffect.missHalf = params[0] === 'yes';
      if(prop === 'save')
        trapEffect.save = params[0] === 'none' ? undefined : params[0];
      if(prop === 'saveDC')
        trapEffect.saveDC = parseInt(params[0]);
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
          sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
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
            TrapTheme.rollAsync('1d20 + ' + effectResult.attack)
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
        sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
        log(err.stack);
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
          name: 'Attack Bonus',
          desc: `The trap's attack roll bonus vs AC.`,
          value: trapEffect.attack
        },
        {
          id: 'damage',
          name: 'Damage',
          desc: `The dice roll expression for the trap's damage.`,
          value: trapEffect.damage
        },
        {
          id: 'defense',
          name: 'Defense',
          desc: `The defense targeted by the trap's attack.`,
          value: trapEffect.defense,
          options: [ 'none', 'ac', 'fort', 'ref', 'will' ]
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
          name: 'Spot DC',
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

      if(prop === 'attack')
        trapEffect.attack = parseInt(params[0]);
      if(prop === 'damage')
        trapEffect.damage = params[0];
      if(prop === 'defense')
        trapEffect.defense = params[0] === 'none' ? undefined : params[0];
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
