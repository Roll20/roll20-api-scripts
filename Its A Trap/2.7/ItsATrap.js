/**
 * A script that checks the interpolation of a token's movement to detect
 * whether they have passed through a square containing a trap.
 *
 * A trap can be any token on the GM layer for which the cobweb status is
 * active. Flying tokens (ones with the fluffy-wing status or angel-outfit
 * status active) will not set off traps unless the traps are also flying.
 *
 * This script works best for square traps equal or less than 2x2 squares or
 * circular traps of any size.
 */
var ItsATrap = (() => {
  'use strict';

  let REMOTE_ACTIVATE_CMD = '!itsATrapRemoteActivate';

  /**
   * A message describing the chat message and other special effects for a trap
   * being set off. All fields are optional.
   * @typedef {object} TrapEffect
   * @property {string} api
   *           An API chat command that will be executed when the trap activates.
   *           The command may contain the template values TRAP_ID and
   *           VICTIM_ID. These will be replaced by the values for trapId
   *           and victimId, respectively in the API chat command message.
   * @property {(string|FXDefinition|FXConfig)} fx
   *           A special FX that is spawned from the trap when it is activated.
   * @property {boolean} gmOnly
   *           If true, the trap's message will only be shown to the GM.
   * @property {string} message
   *           The message that will be sent in the chat by Admiral Ackbar
   *           when the trap activates.
   *           This can include inline rolls and API chat commands.
   * @property {string} notes
   *           This is a reminder about the trap's effects which will be whispered
   *           only to the GM.
   * @property {number} searchDist
   *           The maximum distance away a character can be to passively search
   *           for the trap. This is measured in the current page's units.
   * @property {string} sound
   *           The name of a sound to play from the jukebox when the trap
   *           is activated.
   * @property {string} stopAt
   *           This is where the trap should stop the token. This can be one of
   *           "edge", "center" (default), or "none".
   *           If this is set to "edge", then the token will be stopped just
   *           inside the edge of the trap's triggering area.
   *           If this is set to "center", then the token will be stopped at the
   *           center of the trap's triggering area.
   *           If this is set to "none", then the token's movement will not be
   *           stopped by the trap. As a result, it is possible to trigger other
   *           traps after that one.
   * @property {string} trapId
   *           The ID of the trap.
   *           This is set automatically.
   * @property {(string|string[])} triggers
   *           A list of names or IDs for other traps that this trap sets off. This
   *           could be useful for setting up a trap that is merely the trigger
   *           area for another trap.
   * @property {string} victimId
   *           The ID of the token that activated the trap.
   *           This is set automatically.
   */

  /**
   * A custom FX configuration for a trap.
   * @typedef {object} FXConfig
   * @property {(string|FXDefinition|TrapFX)} name
   *           The name or defintion of the FX to spawn.
   * @property {vec2} offset
   *           The offset from the trap's center where the FX is spawned.
   * @property {vec2} direction
   *           The direction vector for a beam-like FX. By default,
   *           the vector towards the trap's victim will be used.
   */

  /**
   * A degree-2 vector, which is used to represent a point or direction.
   * @typedef {Number[]} vec2
   */

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
    theme: 'default',
    userOptions: {}
  });
  _.defaults(state.ItsATrap.userOptions, {
    revealTrapsToMap: false,
    announcer: 'Admiral Ackbar'
  });

  // Set the theme from the useroptions.
  var useroptions = globalconfig && globalconfig.itsatrap;
  if(useroptions) {
    state.ItsATrap.theme = useroptions['theme'] || 'default';
    state.ItsATrap.userOptions = {
      revealTrapsToMap: useroptions['revealTrapsToMap'] || false,
      announcer: useroptions.announcer || 'Admiral Ackbar'
    };
  }

  // The collection of registered TrapThemes keyed by name.
  var trapThemes = {};

  var defaultFx = {
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

  /**
   * Activates a trap without any primary victim.
   * @param {TrapTheme} theme
   * @param {Graphic} trap
   */
  function activateTrapManually(theme, trap) {
    // Activate the trap with the default theme, which will only display
    // the trap's message.
    let defaultTheme = trapThemes['default'];
    let anonVictim = {
      get: () => {
        return undefined;
      }
    };
    let effect = getTrapEffect(anonVictim, trap);
    defaultTheme.activateEffect(effect);

    // Reveal the trap if it's set to become visible.
    revealTrap(trap);

    // Apply the trap's effects to any victims in its area, using the configured
    // trap theme.
    var victims = getTrapVictims(trap, undefined);
    _.each(victims, function(victim) {
      var effect = getTrapEffect(victim, trap);
      theme.activateEffect(effect);
    });
  }

  /**
   * Announces a message for a trap.
   * This should be called by TrapThemes to inform everyone about a trap
   * that has been triggered and its results. Fancy HTML formatting for
   * the message is encouraged. If the trap's effect has gmOnly set,
   * then the message will only be shown to the GM.
   * This also takes care of playing the trap's sound, FX, and API command,
   * they are provided.
   * @param  {TrapEffect} effect
   * @param  {string} message
   */
  function announceTrap(effect, message) {
    let theme = getTheme();
    var effectTrap = getObj('graphic', effect.trapId);

    // Display the message to everyone, unless it's a secret.
    if(effect.gmOnly)
      message = '/w gm ' + message;

    var announcer = state.ItsATrap.userOptions.announcer;
    sendChat(announcer, message);

    // Whisper any secret notes to the GM.
    if(effect.notes)
      sendChat(announcer, '/w gm Trap Notes:<br/>' + effect.notes);

    // If the effect has a sound, try to play it.
    playEffectSound(effect);

    // If the effect has fx, play them.
    playTrapFX(effect);

    // If the effect has an api command, execute it.
    executeTrapCommand(effect);

    // Allow traps to trigger each other using the 'triggers' property.
    if(effect.triggers) {
      if(!_.isArray(effect.triggers))
        effect.triggers = [effect.triggers];

      let otherTraps = getTrapsOnPage(effectTrap.get('_pageid'));
      let triggeredTraps = _.filter(otherTraps, trap => {
        return effect.triggers.indexOf(trap.get('name')) !== -1 ||
          effect.triggers.indexOf(trap.get('_id')) !== -1;
      });

      _.each(triggeredTraps, trap => {
        activateTrapManually(theme, trap);
      });
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
          let effect = getTrapEffect(token, trap);
          let dist = _getPassiveSearchDistance(token, trap);
          return (!effect.searchDist || dist < effect.searchDist);
        })
        .each(trap => {
          theme.passiveSearch(trap, token);
        });
    }
  }

  /**
   * Checks if a token activated any traps during its last movement.
   * @private
   * @param {TrapTheme} theme
   * @param {Graphic} token
   */
  function _checkTrapActivations(theme, token) {
    var collisions = getTrapCollisions(token);
    _.find(collisions, function(collision) {
      var trap = collision.other;
      var trapEffect = getTrapEffect(token, trap);
      trapEffect.stopAt = trapEffect.stopAt || 'center';

      if(trapEffect.stopAt === 'edge') {
        var x = collision.pt[0];
        var y = collision.pt[1];

        token.set("lastmove","");
        token.set("left", x);
        token.set("top", y);
      }
      else if(trapEffect.stopAt === 'center')
        moveTokenToTrap(token, trap);

      // Reveal the trap if it's set to become visible.
      revealTrap(trap);

      // Apply the trap's effects to any victims in its area.
      var victims = getTrapVictims(trap, token);
      _.each(victims, function(victim) {
        var effect = getTrapEffect(victim, trap);
        theme.activateEffect(effect);
      });

      // Stop activating traps if this trap stopped the token.
      return (trapEffect.stopAt !== 'none');
    });
  }


  /**
   * Creates a default message for a TrapEffect.
   * @private
   * @param  {Graphic} victim
   * @param  {Graphic} trap
   * @return {string}
   */
  function _createDefaultTrapMessage(victim, trap) {
    var trapName = trap.get("name");
    if(trapName)
      return victim.get("name") + " set off a trap: " + trapName + "!";
    else
      return victim.get("name") + " set off a trap!";
  }

  /**
   * Executes an API chat command involving a trap.
   * @param  {TrapEffect} effect
   */
  function executeTrapCommand(effect) {
    if(effect.api) {
      effect.api = effect.api.split('TRAP_ID').join(effect.trapId);
      effect.api = effect.api.split('VICTIM_ID').join(effect.victimId);
      try {
        sendChat('ItsATrap-api', effect.api);
      }
      catch(err) {
        log('ItsATrap api command ERROR: ' + err.message);
      }
    }
  }

  /**
   * Gets the distance between two tokens in their page's units.
   * @param {Graphic} token1
   * @param {Graphic} token2
   * @return {number}
   */
  function _getPassiveSearchDistance(token1, token2) {
    let p1 = [
      token1.get('left'),
      token1.get('top')
    ];
    let p2 = [
      token2.get('left'),
      token2.get('top')
    ];
    let r1 = token1.get('width')/2;
    let r2 = token2.get('width')/2;

    let page = getObj('page', token1.get('_pageid'));
    let scale = page.get('scale_number');
    let pixelDist = Math.max(0, VecMath.dist(p1, p2) - r1 - r2);
    return pixelDist/70*scale;
  }

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
  function _getTokensInLineOfSight(token, otherTokens, range, isSquareRange) {
    if(_.isUndefined(range))
      range = Infinity;

    var pageId = token.get('_pageid');
    var tokenPt = [
      token.get('left'),
      token.get('top'),
      1
    ];
    var tokenRW = token.get('width')/2-1;
    var tokenRH = token.get('height')/2-1;

    var wallPaths = findObjs({
      _type: 'path',
      _pageid: pageId,
      layer: 'walls'
    });
    var wallSegments = PathMath.toSegments(wallPaths);

    return _.filter(otherTokens, function(other) {
      var otherPt = [
        other.get('left'),
        other.get('top'),
        1
      ];
      var otherRW = other.get('width')/2;
      var otherRH = other.get('height')/2;

      // Skip tokens that are out of range.
      if(isSquareRange && (
        Math.abs(tokenPt[0]-otherPt[0]) >= range + otherRW + tokenRW ||
        Math.abs(tokenPt[1]-otherPt[1]) >= range + otherRH + tokenRH))
        return false
      else if(!isSquareRange && VecMath.dist(tokenPt, otherPt) >= range + tokenRW + otherRW)
        return false;

      var segToOther = [tokenPt, otherPt];
      return !_.find(wallSegments, function(wallSeg) {
        return PathMath.segmentIntersection(segToOther, wallSeg);
      });
    });
  }

  /**
   * Gets all the traps that a token has line-of-sight to, with no limit for
   * range. Line-of-sight is blocked by paths on the dynamic lighting layer.
   * @param  {Graphic} charToken
   * @return {Graphic[]}
   *         The list of traps that charToken has line-of-sight to.
   */
  function getSearchableTraps(charToken) {
    var pageId = charToken.get('_pageid');
    var traps = getTrapsOnPage(pageId);
    return _getTokensInLineOfSight(charToken, traps);
  }

  /**
   * Gets the theme currently being used to interpret TrapEffects spawned
   * when a character activates a trap.
   * @return {TrapTheme}
   */
  function getTheme() {
    return trapThemes[state.ItsATrap.theme];
  }

  /**
   * Returns the first trap a token collided with during its last movement.
   * If it didn't collide with any traps, return false.
   * @deprecated
   * @param {Graphic} token
   * @return {Graphic || false}
   */
  function getTrapCollision(token) {
    var pageId = token.get('_pageid');
    var traps = getTrapsOnPage(pageId);

    // Some traps don't affect flying tokens.
    traps = _.filter(traps, function(trap) {
      return !isTokenFlying(token) || isTokenFlying(trap);
    });
    return TokenCollisions.getFirstCollision(token, traps);
  };

  /**
   * Returns the list of all traps a token would collide with during its last
   * movement. The traps are sorted in the order that the token will collide
   * with them.
   * @param  {Graphic} token
   * @return {TokenCollisions.Collision[]}
   */
  function getTrapCollisions(token) {
    var pageId = token.get('_pageid');
    var traps = getTrapsOnPage(pageId);

    // Some traps don't affect flying tokens.
    traps = _.filter(traps, function(trap) {
      return !isTokenFlying(token) || isTokenFlying(trap);
    });
    return TokenCollisions.getCollisions(token, traps, {detailed: true});
  };

  /**
   * Gets the effect for a trap set off by a character's token defined in the
   * trap's GM notes.
   * If the GM notes property is not set, then it will generate a default
   * message using the trap and victim's names.
   * @param  {Graphic} victim
   *         The token that set off the trap.
   * @param  {Graphic} trap
   * @return {TrapEffect}
   */
  function getTrapEffect(victim, trap) {
    var effect = {};

    // URI-escape the notes and remove the HTML elements.
    var notes = trap.get('gmnotes');
    try {
        notes = decodeURIComponent(notes).trim();
    }
    catch(err) {
        notes = unescape(notes).trim();
    }

    // If GM notes are set, interpret those.
    if(notes) {

      // Should the message be interpretted as a JSON object?
      if(notes.indexOf('{') === 0)
        try {
          notes = notes.split(/<[/]?.+?>/g).join('');
          effect = JSON.parse(notes);
        }
        catch(err) {
          effect.message = 'ERROR: invalid TrapEffect JSON.';
        }
      else
        effect.message = notes;
    }

    // Use a default message if one wasn't provided.
    if(!effect.message)
      effect.message = _createDefaultTrapMessage(victim, trap);

    // Capture the token and victim's IDs in the effect.
    _.extend(effect, {
      trapId: trap.get('_id'),
      victimId: victim.get('_id')
    });
    return effect;
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
    var range = trap.get('aura1_radius');
    var pageId = trap.get('_pageid');

    let victims = [triggerVictim];
    if(range !== '') {
      var otherTokens = findObjs({
        _pageid: pageId,
        _type: 'graphic',
        layer: 'objects'
      });

      var pageScale = getObj('page', pageId).get('scale_number');
      range *= 70/pageScale;
      var squareArea = trap.get('aura1_square');

      victims = victims.concat(_getTokensInLineOfSight(trap, otherTokens, range, squareArea));
    }
    return _.chain(victims)
      .unique()
      .compact()
      .value();
  }

  /**
   * @private
   */
  function _getUserOption(opName) {
    return state.ItsATrap.userOptions[opName];
  }

  /**
   * Determines whether a token is currently flying.
   * @param {Graphic} token
   * @return {Boolean}
   */
  function isTokenFlying(token) {
    return token.get("status_fluffy-wing") || token.get("status_angel-outfit");
  }

  /**
   * Marks a trap with a circle and a ping.
   * @private
   * @param  {Graphic} trap
   */
  function _markTrap(trap) {
    var radius = trap.get('width')/2;
    var x = trap.get('left');
    var y = trap.get('top');
    var pageId = trap.get('_pageid');

    // Circle the trap's trigger area.
    var circle = PathMath.createCircleData(radius);
    createObj('path', _.extend(circle, {
      layer: 'objects',
      left: x,
      _pageid: pageId,
      stroke_width: 10,
      top: y
    }));
    createObj('path', _.extend(circle, {
      layer: 'objects',
      left: x,
      _pageid: pageId,
      stroke: '#ffff00', // yellow
      stroke_width: 5,
      top: y
    }));

    sendPing(x, y, pageId);
  }

  /**
   * Moves the specified token to the same position as the trap.
   * @param {Graphic} token
   * @param {Graphic} trap
   */
  function moveTokenToTrap(token, trap) {
    var x = trap.get("left");
    var y = trap.get("top");

    token.set("lastmove","");
    token.set("left", x);
    token.set("top", y);
  }

  /**
   * Marks a trap as being noticed by a character's passive search.
   * Does nothing if the trap has already been noticed.
   * @param  {Graphic} trap
   * @param {string} A message to display when the trap is noticed.
   * @return {boolean}
   *         true if the trap has not been noticed yet.
   */
  function noticeTrap(trap, noticeMessage) {
    var id = trap.get('_id');
    if(!state.ItsATrap.noticedTraps[id]) {
      state.ItsATrap.noticedTraps[id] = true;
      sendChat('Admiral Ackbar', noticeMessage);
      _markTrap(trap);
      return true;
    }
    else
      return false;
  }

  /**
   * Plays a TrapEffect's sound, if it has one.
   * @param  {TrapEffect} effect
   */
  function playEffectSound(effect) {
    if(effect.sound) {
      var sound = findObjs({
        _type: 'jukeboxtrack',
        title: effect.sound
      })[0];
      if(sound) {
        sound.set('playing', true);
        sound.set('softstop', false);
      }
      else
        log('ERROR: Could not find sound "' + effect.sound + '".');
    }
  }

  /**
   * Spawns existing or custom FX for an activated trap.
   * @param  {TrapEffect} effect
   */
  function playTrapFX(effect) {
    var trap = getObj('graphic', effect.trapId);
    var victim = getObj('graphic', effect.victimId);
    var pageId = trap.get('_pageid');

    if(effect.fx) {
      var offset = effect.fx.offset || [0, 0];
      var origin = [
        trap.get('left') + offset[0]*70,
        trap.get('top') + offset[1]*70
      ];

      var direction = effect.fx.direction || (() => {
        if(victim)
          return [
            victim.get('left') - origin[0],
            victim.get('top') - origin[1]
          ];
        else
          return [ 0, 1 ];
      })();

      // FX name
      if(_.isString(effect.fx))
        _playTrapFXNamed(effect.fx, pageId, origin, direction);

      // FXConfig
      else if(effect.fx.name)
        if(_.isString(effect.fx.name))
          _playTrapFXNamed(effect.fx.name, pageId, origin, direction);
        else
          _playTrapFXDefinition(effect.fx.name, pageId, origin);

      // FX Definition
      else
        _playTrapFXDefinition(effect.fx, pageId, origin);
    }
  }

  /**
   * Play FX using a custom definition.
   * @private
   */
  function _playTrapFXDefinition(definition, pageId, origin) {
    var x = origin[0];
    var y = origin[1];

    _.defaults(definition, defaultFx);
    if(definition === -1)
      definition = 25;
    spawnFxWithDefinition(x, y, definition, pageId);
  }

  /**
   * Play FX using a named effect.
   * @private
   */
  function _playTrapFXNamed(name, pageId, origin, direction) {
    var x = origin[0];
    var y = origin[1];

    var fx;
    var isBeamLike = false;

    var custFx = findObjs({ _type: 'custfx', name: name })[0];
    if(custFx) {
      fx = custFx.get('_id');
      isBeamLike = custFx.get('definition').angle === -1;
    }
    else {
      fx = name;
      isBeamLike = !!_.find(['beam', 'breath', 'splatter'], function(type) {
        return name.indexOf(type) !== -1;
      });
    }

    if(isBeamLike) {
      var p1 = {
        x: x,
        y: y
      };
      var p2 = {
        x: x + direction[0],
        y: y + direction[1]
      };

      spawnFxBetweenPoints(p1, p2, fx, pageId);
    }
    else {
      spawnFx(x, y, fx, pageId);
    }
  }

  /**
   * Registers a TrapTheme.
   * @param  {TrapTheme} theme
   */
  function registerTheme(theme) {
    log('It\'s A Trap!: Registered TrapTheme - ' + theme.name + '.');
    trapThemes[theme.name] = theme;
  }

  /**
   * Reveals a trap with the bleeding-eye status to either the back of the
   * objects layer, or the front of the map layer, depending on the user
   * configurations.
   * @param  {Graphic} trap
   */
  function revealTrap(trap) {
    if(trap.get("status_bleeding-eye")) {
      if(_getUserOption('revealTrapsToMap')) {
        trap.set("layer","map");
        toFront(trap);
      }
      else {
        trap.set("layer","objects");
        toBack(trap);
      }
    }
  }

  /**
   * Checks if a token activated or passively spotted any traps during
   * its last movement.
   * @private
   * @param {Graphic} token
   */
  function _updateToken(token) {
    // Objects on the GM layer don't set off traps.
    if(token.get("layer") === "objects") {
      try {
        var theme = getTheme();
        if(!theme) {
          log('ERROR - It\'s A Trap!: TrapTheme does not exist - ' + state.ItsATrap.theme + '. Using default TrapTheme.');
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

  // Create macro for the remote activation command.
  on('ready', () => {
    let macro = findObjs({
      _type: 'macro',
      name: 'ItsATrap_manuallyActivateTrap'
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
          name: 'ItsATrap_manuallyActivateTrap',
          action: REMOTE_ACTIVATE_CMD,
          istokenaction: true
        });
      });
    }
  });

  // Handle macro commands.
  on('chat:message', msg => {
    if(msg.content === REMOTE_ACTIVATE_CMD) {
      let theme = getTheme();
      _.each(msg.selected, item => {
        let trap = getObj('graphic', item._id);
        activateTrapManually(theme, trap);
      });
    }
  });

  /**
   * When a graphic on the objects layer moves, run the script to see if it
   * passed through any traps.
   */
  on("change:graphic:lastmove", function(token) {
    _updateToken(token);
  });

  // When a trap's token is destroyed, remove it from the set of noticed traps.
  on('destroy:graphic', function(token) {
    var id = token.get('_id');
    if(state.ItsATrap.noticedTraps[id])
      delete state.ItsATrap.noticedTraps[id];
  });

  return {
    announceTrap: announceTrap,
    executeTrapCommand: executeTrapCommand,
    getTheme: getTheme,
    getTrapCollision: getTrapCollision,
    getTrapCollisions: getTrapCollisions,
    getTrapEffect: getTrapEffect,
    getTrapsOnPage: getTrapsOnPage,
    isTokenFlying: isTokenFlying,
    moveTokenToTrap: moveTokenToTrap,
    noticeTrap: noticeTrap,
    playEffectSound: playEffectSound,
    playTrapFX: playTrapFX,
    registerTheme: registerTheme
  }
})();






// TrapTheme interface definition:

/**
 * An interface for objects that function as interpreters for TrapEffects
 * produced by It's A Trap when a character activates a trap.
 * TrapTheme implementations can be used to automate the mechanics for traps
 * in various systems or produce specialized output to announce the trap.
 * @interface TrapTheme
 */

/**
 * Activates a TrapEffect by displaying the trap's message and
 * automating any system specific trap mechanics for it.
 * @function TrapTheme#activateEffect
 * @param {TrapEffect} effect
 */

/**
 * The name of the theme used to register it.
 * @property {string} TrapTheme#name
 */

/**
 * The system-specific behavior for a character passively noticing a trap.
 * @function TrapTheme#passiveSearch
 * @param {Graphic} trap
 *        The trap's token.
 * @param {Graphic} charToken
 *        The character's token.
 */





/**
 * TrapThemeHelper is a library of functions I've been using and reusing
 * in all my TrapTheme scripts.
 */
var TrapThemeHelper = (() => {
  'use strict';

  /**
   * @typdef {TrapEffectD20} TrapEffectResultD20
   * @property {int} ac
   * @property {InlineRollResult} roll
   * @property {Character} character
   * @property {int} saveBonus
   * @property {boolean} trapHit
   */

  return class TrapThemeHelper {
    /**
     * A sample CSS object for trap HTML messages created with HTML Builder.
     */
    static get THEME_CSS() {
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

    /**
     * Asynchronously gets the value of a character sheet attribute.
     * @param  {Character}   character
     * @param  {string}   attr
     * @return {Promise<any>}
     *         Contains the value of the attribute.
     */
    static getSheetAttr(character, attr) {
      let rollExpr = '@{' + character.get('name') + '|' + attr + '}';
      return TrapThemeHelper.rollAsync(rollExpr)
      .then((roll) => {
        if(roll)
          return roll.total;
        else
          throw new Error('Could not resolve roll expression: ' + rollExpr);
      });
    }

    /**
     * Produces the HTML for a trap activation message for most d20 systems.
     * @param {TrapEffectResultD20} effect
     */
    static htmlActivateTrapD20(effect) {
      let content = new HtmlBuilder('div');

      // Add the flavor message.
      content.append('.paddedRow trapMessage', effect.message);

      if(effect.character) {

        // Add the attack roll message.
        if(effect.attack) {
          let rollResult = TrapThemeHelper.htmlRollResultD20(effect.roll, '1d20 + ' + effect.attack);
          content.append('.paddedRow')
            .append('span.bold', 'Attack roll:')
            .append('span', rollResult)
            .append('span', ' vs AC ' + effect.ac);
        }

        // Add the saving throw message.
        if(effect.save) {
          let rollResult = TrapThemeHelper.htmlRollResultD20(effect.roll, '1d20 + ' + effect.saveBonus);
          let saveMsg = new HtmlBuilder('.paddedRow');
          saveMsg.append('span.bold', effect.save.toUpperCase() + ' save:');
          saveMsg.append('span', rollResult);
          saveMsg.append('span', ' vs DC ' + effect.saveDC);

          // If the save result is a secret, whisper it to the GM.
          if(effect.hideSave)
            sendChat('Admiral Ackbar', '/w gm ' + saveMsg.toString(THEME_CSS));
          else
            content.append(saveMsg);
        }

        // Add the hit/miss message.
        if(effect.trapHit === 'AC unknown') {
          content.append('.paddedRow', 'AC could not be determined with the current version of your character sheet. For the time being, please resolve the attack against AC manually.');
          if(effect.damage)
            content.append('.paddedRow', 'Damage: [[' + effect.damage + ']]');
        }
        else if(effect.trapHit) {
          let row = content.append('.paddedRow')
          row.append('span.hit', 'HIT! ');
          if(effect.damage)
            row.append('span', 'Damage: [[' + effect.damage + ']]');
          else
            row.append('span', effect.character.get('name') + ' falls prey to the trap\'s effects!');
        }
        else {
          let row = content.append('.paddedRow');
          row.append('span.miss', 'MISS! ');
          if(effect.damage && effect.missHalf)
            row.append('span', 'Half damage: [[floor((' + effect.damage + ')/2)]].');
        }
      }

      return TrapThemeHelper.htmlTable(content, '#a22');
    }

    /**
     * Displays the message to notice a trap.
     * @param {Character} character
     * @param {Graphic} trap
     */
    static htmlNoticeTrap(character, trap) {
      let content = new HtmlBuilder();
      content.append('.paddedRow trapMessage', character.get('name') + ' notices a trap:');
      content.append('.paddedRow', trap.get('name'));

      return TrapThemeHelper.htmlTable(content, '#000');
    }

    /**
     * Produces HTML for a faked inline roll result for d20 systems.
     * @param  {int} result
     * @param  {string} tooltip
     * @return {HtmlBuilder}
     */
    static htmlRollResultD20(result, tooltip) {
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
     * Sends an HTML-stylized message about a noticed trap.
     * @param {(HtmlBuilder|string)} content
     * @param {string} borderColor
     * @return {HtmlBuilder}
     */
    static htmlTable(content, borderColor) {
      let table = new HtmlBuilder('table.trapTable', '', {
        style: { 'border-color': borderColor }
      });
      table.append('thead.trapTableHead', '', {
        style: { 'background-color': borderColor }
      }).append('th', 'IT\'S A TRAP!!!');
      table.append('tbody').append('tr').append('td', content, {
        style: { 'padding': '0' }
      });
      return table;
    }

    /**
     * Asynchronously rolls a dice roll expression and returns the result's total in
     * a callback. The result is undefined if an invalid expression is given.
     * @param  {string} expr
     * @return {Promise<int>}
     */
    static rollAsync(expr) {
      return new Promise((resolve, reject) => {
        sendChat('TrapThemeHelper', '/w gm [[' + expr + ']]', (msg) => {
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
 * The default system-agnostic Admiral Ackbar theme.
 * @implements TrapTheme
 */
(() => {
  'use strict';

  ItsATrap.registerTheme({
    name: 'default',

    /**
     * IT'S A TRAP!!!
     * @inheritdoc
     */
    activateEffect: function(effect) {
      let content = new HtmlBuilder('.paddedRow', effect.message);
      let table = TrapThemeHelper.htmlTable(content, '#a22');
      ItsATrap.announceTrap(effect, table.toString(TrapThemeHelper.THEME_CSS));
    },

    /**
     * No trap search mechanics, since this theme is system-agnostic.
     * @inheritdoc
     */
    passiveSearch: _.noop
  });
})();
