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
var ItsATrap = (function() {

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
   * @property {string} message
   *           The message that will be sent in the chat by Admiral Ackbar
   *           when the trap activates.
   *           This can include inline rolls and API chat commands.
   * @property {string} notes
   *           This is a reminder about the trap's effects which will be whispered
   *           only to the GM.
   * @property {string} sound
   *           The name of a sound to play from the jukebox when the trap
   *           is activated.
   * @property {string} trapId
   *           The ID of the trap.
   *           This is set automatically.
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
    userOptions: {
      revealTrapsToMap: false
    }
  });

  // Set the theme from the useroptions.
  var useroptions = globalconfig && globalconfig.itsatrap;
  if(useroptions) {
    state.ItsATrap.theme = useroptions['theme'] || 'default';
    state.ItsATrap.userOptions = {
      revealTrapsToMap: useroptions['revealTrapsToMap'] || false
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
    var notes = decodeURIComponent(trap.get('gmnotes')).trim();
    notes = notes.split(/<[/]?.+?>/g).join('');

    // If GM notes are set, interpret those.
    if(notes) {

      // Should the message be interpretted as a JSON object?
      if(notes.indexOf('{') === 0)
        try {
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
   * Gets the message template sent to the chat by a trap.
   * @param  {Graphic} victim
   *         The token that set off the trap.
   * @param  {Graphic} trap
   * @return {string}
   */
  function getTrapMessage(victim, trap) {
    var notes = unescape(trap.get('gmnotes')).trim();
    if(notes) {

      // Should the message be interpretted as a JSON object?
      if(notes.indexOf('{') === 0)
        return JSON.parse(notes).message;
      else
        return notes;
    }

    // Use a default message.
    else {
      var trapName = trap.get("name");
      if(trapName)
        return victim.get("name") + " set off a trap: " + trapName + "!";
      else
        return victim.get("name") + " set off a trap!";
    }
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

    if(range !== '') {
      var otherTokens = findObjs({
        _pageid: pageId,
        _type: 'graphic',
        layer: 'objects'
      });

      var pageScale = getObj('page', pageId).get('scale_number');
      range *= 70/pageScale;
      var squareArea = trap.get('aura1_square');

      var victims = _getTokensInLineOfSight(trap, otherTokens, range, squareArea);
      victims.push(triggerVictim);
      return _.unique(victims);
    }
    else
      return [triggerVictim];
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

      var direction = effect.fx.direction || [
        victim.get('left') - origin[0],
        victim.get('top') - origin[1]
      ];

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
   * When a graphic on the objects layer moves, run the script to see if it
   * passed through any traps.
   */
  on("change:graphic", function(token) {
    // Objects on the GM layer don't set off traps.
    if(token.get("layer") === "objects") {
      try {
        var theme = getTheme();
        if(!theme) {
          log('ERROR - It\'s A Trap!: TrapTheme does not exist - ' + state.ItsATrap.theme + '. Using default TrapTheme.');
          theme = trapThemes['default'];
        }

        // Did the character set off a trap?
        var trap = getTrapCollision(token);
        if(trap) {
          moveTokenToTrap(token, trap);

          // Reveal the trap if it's set to become visible.
          revealTrap(trap);

          // Apply the trap's effects to any victims in its area.
          var victims = getTrapVictims(trap, token);
          _.each(victims, function(victim) {
            var effect = getTrapEffect(victim, trap);
            theme.activateEffect(effect);
          });
        }

        // If no trap was activated and the theme has passive searching,
        // do a passive search for traps.
        else if(theme.passiveSearch && theme.passiveSearch !== _.noop) {
          var searchableTraps = getSearchableTraps(token);
          _.each(searchableTraps, function(trap) {
            theme.passiveSearch(trap, token);
          });
        }
      }
      catch(err) {
        log('ERROR - It\'s A Trap!: ' + err.message);
      }
    }
  });

  // When a trap's token is destroyed, remove it from the set of noticed traps.
  on('destroy:graphic', function(token) {
    var id = token.get('_id');
    if(state.ItsATrap.noticedTraps[id])
      delete state.ItsATrap.noticedTraps[id];
  });

  return {
    executeTrapCommand: executeTrapCommand,
    getTheme: getTheme,
    getTrapCollision: getTrapCollision,
    getTrapEffect: getTrapEffect,
    getTrapsOnPage: getTrapsOnPage,
    getTrapMessage: getTrapMessage,
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
 * The default system-agnostic Admiral Ackbar theme.
 * @implements TrapTheme
 */
ItsATrap.registerTheme({
  name: 'default',

  /**
   * IT'S A TRAP!!!
   * @inheritdoc
   */
  activateEffect: function(effect) {
    var html = '<table style="background-color: #fff; border: solid 1px #000; border-collapse: separate; border-radius: 10px; overflow: hidden; width: 100%;">';
    html += "<thead><tr style='background-color: #000; color: #fff; font-weight: bold;'><th>IT'S A TRAP!!!</th></tr></thead>";
    html += '<tbody>';
    html += this._paddedRow( effect.message);
    html += '</tbody></table>';
    sendChat("Admiral Ackbar", html);

    // If the effect has notes, whisper them to the GM.
    if(effect.notes)
      sendChat('Admiral Ackbar', '/w gm ' + effect.notes);

    // If the effect has a sound, try to play it.
    ItsATrap.playEffectSound(effect);

    // If the effect has fx, play them.
    ItsATrap.playTrapFX(effect);

    // If the effect has an api command, execute it.
    ItsATrap.executeTrapCommand(effect);
  },

  /**
   * Produces HTML for a padded table row.
   * @param  {string} innerHTML
   * @param  {string} style
   * @return {string}
   */
  _paddedRow: function(innerHTML, style) {
    return '<tr><td style="padding: 1px 1em; ' + style + '">' + innerHTML + '</td></tr>';
  },

  /**
   * No trap search mechanics, since this theme is system-agnostic.
   * @inheritdoc
   */
  passiveSearch: _.noop
});


/**
 * A theme used purely for testing.
 * @implements TrapTheme
 */
ItsATrap.registerTheme({
  name: 'test',

  /**
   * Display the raw message and play the effect's sound.
   * @inheritdoc
   */
  activateEffect: function(effect) {
    sendChat("ItsATrap-test", effect.message);

    // If the effect has a sound, try to play it.
    ItsATrap.playEffectSound(effect);

    // If the effect has fx, play them.
    ItsATrap.playTrapFX(effect);

    // If the effect has an api command, execute it.
    ItsATrap.executeTrapCommand(effect);
  },


  /**
   * Display a message if the character is within 5 units of the trap.
   * This is just a bare-bones example what sort of behavior can be done with
   * passiveSearch implementations.
   * @inheritdoc
   */
  passiveSearch: function(trap, charToken) {
    var trapPt = [
      trap.get('left'),
      trap.get('top')
    ];
    var charPt = [
      charToken.get('left'),
      charToken.get('top')
    ];
    if(VecMath.dist(trapPt, charPt) <= 70*5) {
      var name = charToken.get('name');
      ItsATrap.noticeTrap(trap, name + ' notices a trap: ' + trap.get('name'));
    }
  }
});
