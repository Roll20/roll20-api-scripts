var OneWayDynamicLighting = (() => {
  'use strict';

  const CREATE_WALL_CMD = '!OneWayDynamicLighting_CreateWall';

  /**
   * Creates a one-way dynamic lighting wall, given a polygon defining an
   * area from which characters can see through it.
   * @param {Path} path
   *        The path definining the wall.
   * @param {Path} area
   *        The path defining a closed polygonal area from which characters
   *        can see through the wall.
   */
  function createWall(path, area) {
    let pageId = path.get('_pageid');
    if(!state.OneWayDynamicLighting[pageId])
      state.OneWayDynamicLighting[pageId] = {};

    let pathId = path.get('_id');
    let poly = new PathMath.Polygon(area);
    let wall = {
      area: _.clone(poly.vertices),
      pageId,
      pathId
    };
    state.OneWayDynamicLighting[pageId][pathId] = wall;

    area.remove();
  }

  /**
   * Initializes the state for this script.
   * @private
   */
  function _initState() {
    if(!state.OneWayDynamicLighting)
      state.OneWayDynamicLighting = {};
  }

  /**
   * Updates the one-way dynamic lighting walls for some page.
   * @param {Page} page
   */
  function updateWalls(page) {
    let pageId = page.get('_id');
    let walls = state.OneWayDynamicLighting && state.OneWayDynamicLighting[pageId];
    if(!walls)
      return;

    // Get the player-controlled tokens for this page.
    let tokens = findObjs({
      _pageid: pageId,
      _type: 'graphic'
    });
    let playerTokens = _.filter(tokens, tok => {
      let charId = tok.get('represents');
      let character = getObj('character', charId);

      return character && character.get('controlledby');
    });

    // Update each wall.
    _.each(walls, wall => {
      let path = getObj('path', wall.pathId);
      let area = new PathMath.Polygon(wall.area);

      // We can see through the wall if any player token is in its
      // see-through area.
      let canSeeThrough = !!_.find(playerTokens, token => {
        let pt = [token.get('left'), token.get('top'), 1];
        return area.containsPt(pt);
      });

      path.set('layer', canSeeThrough ? 'gmlayer' : 'walls');
    });
  }

  /**
   * Whispers a chat message to someone.
   * @private
   */
  function _whisper(who, msg) {
    who = who.replace(/\(GM\)/, '').trim();
    sendChat('One Way Dynamic Lighting script', '/w "' + who + '" ' + msg);
  }

  on('ready', () => {
    let macro = findObjs({
      _type: 'macro',
      name: 'OneWayDynamicLighting'
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
          name: 'OneWayDynamicLighting',
          action: CREATE_WALL_CMD,
          istokenaction: true
        });
      });
    }

    _initState();
    log(`→💡→ Initialized One-Way Dynamic Lighting ←💡←`);
  });

  // Update the walls when a token is moved.
  on('change:graphic:lastmove', token => {
    try {
      let pageId = token.get('_pageid');
      let page = getObj('page', pageId);
      updateWalls(page);
    }
    catch(err) {
      log('OneWayDynamicLighting: ' + err.message);
      log(err.stack);
    }
  });

  // If a wall is deleted, remove it from the state.
  on('destroy:path', path => {
    try {
      let pageId = path.get('_pageid');
      let pathId = path.get('_id');
      if(state.OneWayDynamicLighting[pageId] && state.OneWayDynamicLighting[pageId][pathId])
        delete state.OneWayDynamicLighting[pageId][pathId];
    }
    catch(err) {
      log('OneWayDynamicLighting: ' + err.message);
      log(err.stack);
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

      if(msg.content.startsWith(CREATE_WALL_CMD)) {
        // We need a path for the wall and a path for the see-through area.
        let wall, area;
        _.each(selected, s => {
          if(s.get('type') === 'path') {
            let fill = s.get('fill');
            if(fill && fill !== 'transparent')
              area = s;
            else
              wall = s;
          }
        });

        if(!wall)
          _whisper(msg.who, 'You must have a path for the wall selected.');
        else if(!area)
          _whisper(msg.who, 'You must have a filled path for the see-through area selected.');
        else {
          createWall(wall, area);
        }
      }
    }
    catch(err) {
      log('OneWayDynamicLighting: ' + err.message);
      log(err.stack);
    }
  });

  return {
    createWall,
    updateWalls
  };
})();
