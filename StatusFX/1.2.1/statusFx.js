/**
 * This script creates FX animations for tokens' active statuses, cycling
 * through each one.
 */
var StatusFX = (function() {

  /**
   * The StatusFX state.
   * @typedef {object} state.StatusFX
   * @property {map<string, namedFx>} statuses
   *           A mapping of status names to their FX.
   * @property {map<uuid, tokenStatusFx>} tokens
   *           A mapping of token IDs to their StatusFX state.
   */

  /**
   * A named special FX.
   * @typedef {object} namedFx
   * @property {string} name
   * @property {vector} direction
   */

  /**
   * A 2D point described by two coordinates [X, Y].
   * @typedef {number[]} point
   */

  /**
   * The saved StatusFX state for a token.
   * @typedef {object} tokenStatusFx
   * @property {string[]} statuses
   *           A list of the currently active status markers for the token.
   * @property {int} index
   *           The current index of the statusMarker to spawn an FX for.
   */

  /**
   * A 2D vector with two components [X, Y].
   * @typedef {number[]} vector
   */

   // A list of all the built-in status marker names.
   var allStatusNames = [
     "red",
     "blue",
     "green",
     "brown",
     "purple",
     "pink",
     "yellow",
     "dead",
     "skull",
     "sleepy",
     "half-heart",
     "half-haze",
     "interdiction",
     "snail",
     "lightning-helix",
     "spanner",
     "chained-heart",
     "chemical-bolt",
     "death-zone",
     "drink-me",
     "edge-crack",
     "ninja-mask",
     "stopwatch",
     "fishing-net",
     "overdrive",
     "strong",
     "fist",
     "padlock",
     "three-leaves",
     "fluffy-wing",
     "pummeled",
     "tread",
     "arrowed",
     "aura",
     "back-pain",
     "black-flag",
     "bleeding-eye",
     "bolt-shield",
     "broken-heart",
     "cobweb",
     "broken-shield",
     "flying-flag",
     "radioactive",
     "trophy",
     "broken-skull",
     "frozen-orb",
     "rolling-bomb",
     "white-tower",
     "grab",
     "screaming",
     "grenade",
     "sentry-gun",
     "all-for-one",
     "angel-outfit",
     "archery-target"
   ];

   function _initState() {
     // Create the state if it's not already created.
     state.StatusFX = state.StatusFX || {
       tokens: {},
       fx: {}
     };

     // Get the FX configurations from the useroptions.
     var useroptions = (globalconfig && (globalconfig.StatusFX || globalconfig.statusfx)) || {
       'red': 'splatter-blood [1,-1]',
       'green': 'bubbling-acid',
       'custom': 'sleep: glow-holy|stars: beam-fire [2,3]',
       'interval': 500
     };

     state.StatusFX.fx = {};

     // Configure built-in status markers.
     _.chain(allStatusNames)
      .filter(function(status) {
        return useroptions[status];
      })
      .each(function(status) {
        _initStatus(status, useroptions);
      });
      state.StatusFX.interval = useroptions.interval || 1000;

      // Configure custom status markers.
      var customList = useroptions.custom.split('|');
      if(customList[0] === '')
        customList = [];
      var customMap = {};
      _.each(customList, function(item) {
        var parts = item.split(':');
        var status = parts[0].trim();
        var fx = parts[1].trim();
        customMap[status] = fx;
      });
      _.chain(customMap)
        .keys()
        .each(function(status) {
          _initStatus(status, customMap);
        });
   }

   /**
    * @private
    */
   function _initStatus(status, statuses) {
     var fxRegex = /^((\S| (?!\[))+) *(\[(.+?),?(.+?)\])?/;
     var match = fxRegex.exec(statuses[status]);
     if(match) {
       log('StatusFX: ' + status + ' -> ' + match[0]);

       var fxName = match[1];
       var direction = [0,1];
       if(match[3] === '[random]')
         direction = 'random';
       else if(match[3]) {
         direction = [
           parseFloat(match[4]),
           parseFloat(match[5])
         ];
       }
       state.StatusFX.fx[status] = {
         name: fxName,
         direction: direction
       };
     }
     else
       state.StatusFX.fx[status] = undefined;
   }

   /**
    * Gets the FX configured for a status.
    * @param {string} status
    *        The status name.
    * @return {namedFx}
    */
   function getStatusFx(status) {
     return state.StatusFX.fx[status];
   }

   /**
    * Gets the StatusFX state for a particular token.
    * @param {graphic} token
    * @return {tokenStatusFX}
    */
   function getTokenStatusFx(token) {
     return state.StatusFX.tokens[token.get('_id')];
   }

  /**
   * Gets a token's next status FX and increments its status FX index.
   * @private
   * @param {graphic} token
   * @return {namedFx}
   */
  function _nextTokenStatusFx(token) {
    var tokenStatus = getTokenStatusFx(token);

    if(tokenStatus) {

      // Only processes statuses that have FX.
      var statuses = _.filter(tokenStatus.statuses, function(status) {
        return state.StatusFX.fx[status];
      });

      // Increment the token's status FX index.
      tokenStatus.index = ((tokenStatus.index + 1)%statuses.length) || 0;

      // Return the current status FX name.
      var status = statuses[tokenStatus.index];
      return getStatusFx(status);
    }
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
   * @private
   */
  function _spawnBuiltInFx(name, pageId, origin, direction) {
    name = _resolveBuiltInFxName(name);

    var p1 = {
      x: origin[0],
      y: origin[1]
    };
    // Is this a beam-like FX?
    if(/^(beam|breath|splatter)/.test(name)) {
      if(direction === 'random')
        direction = [
          Math.random() - 0.5,
          Math.random() - 0.5
        ];
      var p2 = {
        x: origin[0] + direction[0],
        y: origin[1] + direction[1]
      };
      spawnFxBetweenPoints(p1, p2, name, pageId);
    }
    else
      spawnFx(p1.x, p1.y, name, pageId);
  }

  /**
   * Spawns a named built-in or custom FX.
   * @param {string} name
   * @param {uuid} pageId
   * @param {point} origin
   * @param {vector} [direction=[0,1]]
   */
  function spawnNamedFx(name, pageId, origin, direction) {
    direction = direction || [0,1];

    // See if the name is taken by a custom FX first. Custom FX
    // names take priority.
    var custFx = findObjs({
      _type: 'custfx',
      name: name
    })[0];
    if(custFx)
      _spawnSavedFx(custFx, pageId, origin, direction);
    else
      _spawnBuiltInFx(name, pageId, origin, direction);
  }

  /**
   * @private
   */
  function _spawnSavedFx(custFx, pageId, origin, direction) {
    var p1 = {
      x: origin[0],
      y: origin[1]
    };

    // Is this a beam-like FX?
    if(custFx.get('definition').angle === -1) {
      if(direction === 'random')
        direction = [
          Math.random() - 0.5,
          Math.random() - 0.5
        ];
      var p2 = {
        x: origin[0] + direction[0],
        y: origin[1] + direction[1]
      };
      spawnFxBetweenPoints(p1, p2, custFx.get('_id'), pageId);
    }
    else
      spawnFx(p1.x, p1.y, custFx.get('_id'), pageId);
  }

  /**
   * Spawns the next status FX for a token.
   * @param {graphic} token
   */
  function spawnTokenStatusFx(token) {
    var fx = _nextTokenStatusFx(token);
    if(fx) {
      var origin = [
        token.get('left'),
        token.get('top')
      ];
      spawnNamedFx(fx.name, token.get('_pageid'), origin, fx.direction);
    }
  }

  /**
   * Updates the state for a token's tracked statuses.
   * @param {Graphic} token
   */
  function updateTokenState(token) {
    var tokenState = getTokenStatusFx(token);

    // Get the token's current status markers, without the number component.
    var statuses = token.get('statusmarkers');
    if(statuses === '')
      statuses = [];
    else
      statuses = statuses.split(',');
    statuses = _.map(statuses, function(status) {
      return status.replace(/@\d+/, '');
    });

    // If CustomStatusMarkers is installed, get the active custom markers for
    // this token too.
    if(typeof CustomStatusMarkers !== 'undefined') {
      var customStatuses = CustomStatusMarkers.getStatusMarkers(token);
      statuses = statuses.concat(customStatuses);
    }

    // Update the token state's active statuses.
    if(statuses.length > 0) {
      if(!tokenState) {
        tokenState = {
          statuses: [],
          index: 0
        };
        state.StatusFX.tokens[token.get('_id')] = tokenState;
      }
      tokenState.statuses = statuses;
    }

    // If there are no more active statuses, remove the token from the state.
    else if(tokenState)
      delete state.StatusFX.tokens[token.get('_id')];
  }

  // Start the FX spawn interval.
  on('ready', function() {
    _initState();

    setInterval(function() {
      var tokens = findObjs({
        _type: 'graphic',
        _pageid: Campaign().get('playerpageid'),
        layer: 'objects'
      });
      _.each(tokens, function(token) {
        try {
          updateTokenState(token);
          spawnTokenStatusFx(token);
        }
        catch(err) {
          log('StatusFX ERROR: ' + err.message);
        }
      });
    }, state.StatusFX.interval);
  });

  // When a token is deleted, delete its state.
  on('destroy:graphic', function(token) {
    var tokenState = getTokenStatusFx(token);
    if(tokenState)
      delete state.StatusFX.tokens[token.get('_id')];
  });

  return {
    getStatusFx: getStatusFx,
    spawnNamedFx: spawnNamedFx,
    spawnTokenStatusFx: spawnTokenStatusFx,
    updateTokenState: updateTokenState
  };
})();
