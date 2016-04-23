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
   * being set off.
   * @typedef {object} TrapEffect
   * @property {object} attributes
   *           The trap's system-specific attributes. This might include such
   *           things as passive and active search check DCs, attack rolls,
   *           damage, etc.. It is entirely up to the current TrapTheme how
   *           these properties are interpreted.
   * @property {string} message
   *           The message template that will be sent in the chat by Admiral Ackbar.
   *           This can include inline rolls and API chat commands.
   * @property {string} sound
   *           The name of a sound to play from the jukebox when the trap
   *           is activated.
   * @property {string} trapId
   *           The ID of the trap.
   * @property {string} victimId
   *           The ID of the token that activated the trap.
   */

  state.ItsATrap = state.ItsATrap || {
    theme: 'default'
  };

  var trapThemes = {};

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
    var effect;

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
          effect = {
            message: 'ERROR: invalid TrapEffect JSON.'
          };
        }
      else
        effect = {
          message: notes
        };
    }

    // Use a default message.
    else {
      var trapName = trap.get("name");
      if(trapName)
        effect = {
          message: victim.get("name") + " set off a trap: " + trapName + "!"
        };
      else
        effect = {
          message: victim.get("name") + " set off a trap!"
        };
    }

    // Capture the token and victim's IDs in the effect.
    _.extend(effect, {
      trapId: trap.get('_id'),
      victimId: victim.get('_id')
    });
    return effect;
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
    var charPt = [
      charToken.get('left'),
      charToken.get('top'),
      1
    ];

    var wallPaths = findObjs({
      _type: 'path',
      _pageid: pageId,
      layer: 'walls'
    });
    var wallSegments = PathMath.toSegments(wallPaths);

    var traps = getTrapsOnPage(pageId);
    return _.filter(traps, function(trap) {
      var trapPt = [
        trap.get('left'),
        trap.get('top'),
        1
      ];
      var segToTrap = [charPt, trapPt];

      return !_.find(wallSegments, function(wallSeg) {
        return PathMath.segmentIntersection(segToTrap, wallSeg);
      });
    });
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
   * Determines whether a token is currently flying.
   * @param {Graphic} token
   * @return {Boolean}
   */
  function isTokenFlying(token) {
    return token.get("status_fluffy-wing") || token.get("status_angel-outfit");
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
   * Registers a TrapTheme.
   * @param  {TrapTheme} theme
   */
  function registerTheme(theme) {
    trapThemes[theme.name] = theme;
  }


  /**
   * When a graphic on the objects layer moves, run the script to see if it
   * passed through any traps.
   */
  on("change:graphic", function(token) {
    // Objects on the GM layer don't set off traps.
    if(token.get("layer") === "objects") {
      var theme = getTheme();

      // Did the character set off a trap?
      var trap = getTrapCollision(token);
      if(trap) {
        var effect = getTrapEffect(token, trap);

        moveTokenToTrap(token, trap);
        theme.activateEffect(effect);

        // Reveal the trap if it's set to become visible.
        if(trap.get("status_bleeding-eye")) {
          trap.set("layer","objects");
          toBack(trap);
        }
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
  });

  return {
    getTheme: getTheme,
    getTrapCollision: getTrapCollision,
    getTrapEffect: getTrapEffect,
    getTrapsOnPage: getTrapsOnPage,
    getTrapMessage: getTrapMessage,
    isTokenFlying: isTokenFlying,
    moveTokenToTrap: moveTokenToTrap,
    playEffectSound: playEffectSound,
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
 * The system-specific behavior for a character actively searching for a trap.
 * @function TrapTheme#activeSearch
 * @param {Graphic} trap
 *        The trap's token.
 * @param {Graphic} charToken
 *        The character's token.
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
    var msg = effect.message;

    // Only prepend IT'S A TRAP!!! to the
    if(msg.indexOf('!') !== 0)
      msg = "IT'S A TRAP!!! " + msg;
    sendChat("Admiral Ackbar", msg);

    // If the effect has a sound, try to play it.
    ItsATrap.playEffectSound(effect);
  },

  /**
   * No trap search mechanics, since this theme is system-agnostic.
   * @inheritdoc
   */
  activeSearch: _.noop,

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
    ItsATrap.playEffectSound(effect);
  },

  /**
   * Display a message if the character is within 5 units of the trap.
   * @inheritdoc
   */
  activeSearch: function(trap, charToken) {
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
      sendChat('Admiral Ackbar', name + ' notices a trap: ' + trap.get('name'));
      sendPing(trap.get('left'), trap.get('top'), trap.get('_pageid'));
    }
  },

  /**
   * Display a message if the character is within 5 units of the trap.
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
      sendChat('Admiral Ackbar', name + ' notices a trap: ' + trap.get('name'));
      sendPing(trap.get('left'), trap.get('top'), trap.get('_pageid'));
    }
  }
});
