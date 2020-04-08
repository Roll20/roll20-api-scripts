var MarchingOrder = (() => {
  'use strict';

  /**
   * A line segment consisting of 2 vec3s defining its endpoints.
   * @typedef {vec3[]} Segment
   */

  /**
   * A wrapper around a follower token. This includes positioning information
   * for that token's place in its marching formation. For simplicity, think
   * of the du, dv components in this way:
   * Suppose the leader moves in a long, straight line westward, with the
   * leader at the origin and the joined segments of their movement proceeding
   * in the direction of the positive X axis. du would define the follower's
   * position relative to this X axis, while dv would define the follower's
   * position relative to the corresponding Y axis.
   * @typedef {object} FollowerData
   * @property {Graphic} token The follower token wrapped by this object.
   * @property {number} du The projected offset of the token parallel to the
   * leader's movement.
   * @property {number} dv The projected offset of the token orthogonal
   * to the leader's movement.
   */

  // A mapping of cardinal direction names to their unit vectors.
  const CARDINAL_VECTORS = {
    'north': [0, -1, 0],
    'south': [0, 1, 0],
    'east': [1, 0, 0],
    'west': [-1, 0, 0]
  };

  // The maximum number of segments to track in a leader token's movement.
  const MAX_SEGMENTS = 20;

  /**
   * Delete a saved marching formation.
   * @param {string} name The name of the formation.
   */
  function deleteFormation(name) {
    let moState = MarchingOrder.State.getState();
    delete moState.savedFormations[name];
  }

  /**
   * Get the token persisted in the state. Search first by the token's
   * character's ID, then by the token's name.
   * @param {string} id The character ID or token name.
   * return {Graphic}
   */
  function _findPersistedToken(id) {
    // First try to get the token by its character's ID.
    let token;
    let character = findObjs({
      _type: "character",
      name: id
    })[0];
    if (character) {
      let tokens = findObjs({
        _pageid: Campaign().get("playerpageid"),
        _type: "graphic",
        layer: 'objects',
        represents: character.get('_id')
      });
      if (tokens.length === 1)
        return tokens[0];
      else if (tokens.length > 1)
        throw new Error(`Could not find unique token representing the ` +
          `character with name ${id}. Please make sure there aren't any ` +
          `duplicates on the map.`);
    }

    // Next, try to get the token by its name.
    if (!token) {
      let tokens = findObjs({
        _pageid: Campaign().get("playerpageid"),
        _type: "graphic",
        layer: 'objects',
        name: id
      });
      if (tokens.length === 1)
        return tokens[0];
      else if (tokens.length > 1)
        throw new Error(`Could not find unique token with name ${id}. ` +
          `Please make sure there aren't any duplicates on the map.`);
    }
    throw new Error(`Token with name ${id} does not exist.`);
  }

  /**
   * Make a token follow directly behind another outside of a regular formation.
   * This can also be used to chain tokens together in a single-file
   * following order.
   * @param {Graphic} leader
   * @param {Graphic} token
   * @param {int} distance
   */
  function follow(leader, token, distance) {
    // Fail if the leader already has followers.
    if (leader.followers && leader.followers.length > 0)
      throw new Error(`Cannot follow ${leader.get('name')}. They already have followers.`);

    // Have the follower stop following anyone they were previously following.
    unfollow(token);

    // Make the token follow directly behind its leader.
    _initFollowLeader(leader);

    let du = (leader.get('width') + token.get('width'))/2 + distance;
    _setFormationOnToken(leader, token, {du, dv: 0});
    MarchingOrder.utils.Chat.broadcast(
      `${token.get('name')} is following ${leader.get('name')}.`);
  }

  /**
   * Get the token used for persisting a token in a saved formation.
   * Tokens are persisted by their character name or by their token name
   * (in that order).
   * @param {Graphic} token
   * @return {string}
   */
  function _getTokenPersistID(token) {
    let id = token.get('name');
    let character = getObj('character', token.get('represents'));
    if (character)
      id = character.get('name');

    if (!id)
      throw new Error(`Token ${token.get('_id')} does not have a valid ` +
        `persistance identifier (must be a unique character name or ` +
        `token name)`);
    return id;
  }

  /**
   * Gets the point of a marching offset relative to a line segment,
   * where the segment's starting point is closer to the front of the
   * formation and the end point is closer to the rear of the formation.
   * @param {Segment} segment
   * @param {number} du The projected offset parallel to the segment.
   * @param {number} dv The projected offset orthogonal to the segment.
   * @return {vec3}
   */
  function getFollowerOffset(segment, du, dv) {
    let [p1, p2] = segment;
    let u = VecMath.sub(p2, p1);
    let uHat = VecMath.normalize(u);
    let uLen = VecMath.length(u);
    let vHat = VecMath.cross([0, 0, 1], uHat);

    let alpha = du/uLen;

    // Find the token's new position projected parallel to the segment.
    let xy = VecMath.add(p1, VecMath.scale(u, alpha));

    // Then offset it by the token's orthogonal projection.
    return VecMath.add(xy, VecMath.scale(vHat, dv));
  }

  /**
   * Get the token's position as a vector.
   * @param {Graphic} token
   * @return {vec3}
   */
  function _getTokenPt(token) {
    let x = token.get('left');
    let y = token.get('top');
    return [x, y, 1];
  }

  /**
   * Convert a token's lastmove string into a list of line segments, with
   * the points in order from last to first (end of movement to start of
   * movement).
   * @param {Graphic} token The token we're converting the lastmove of.
   * @return {Segment[]}
   */
  function _lastmove2ReverseSegments(token) {
    let lastmove = token.get('lastmove');

    // Parse the coordinands out of the lastmove string.
    let coordinands = _.map(lastmove.split(','), x => {
      return parseInt(x);
    });

    // Append the token's current position.
    coordinands.push(parseInt(token.get('left')));
    coordinands.push(parseInt(token.get('top')));

    // Convert the coordinand pairs into points in homogeneous coordinates, in
    // reverse order.
    let points = _.chain(coordinands)
    .chunk(2)
    .map(pt => {
      return [...pt, 1];
    })
    .reverse()
    .value();

    // Convert the points into a list of segments.
    return _.map(_.range(points.length - 1), i => {
      let start = points[i];
      let end = points[i + 1];
      return [start, end];
    });
  }

  /**
   * Initializes a leader token for a marching formation.
   * @param {Graphic} leader
   */
  function _initFormationLeader(leader) {
    // Have all the tokens involved leave any formation they were previously in.
    unfollow(leader);
    _.each(leader.followers, follower => {
      unfollow(follower.token);
    });

    // Reset the leader's marching properties.
    leader.followers = [];
    leader.moveSegments = [];
  }

  /**
   * Initializes a leader token for a following order.
   * @param {Graphic} leader
   */
  function _initFollowLeader(leader) {
    // Reset the leader's marching properties.
    leader.followers = [];
    leader.moveSegments = [];
  }

  /**
   * Move a leader's followers in formation relative to their
   * leader's last movement.
   * @param {Graphic} leader The leader token.
   */
  function moveInFormation(leader) {
    // Convert the leader's lastmove into a list of line segments and prepend
    // those to an accumulated list.
    let prevSegments = _.clone(leader.moveSegments);
    let curSegments = _lastmove2ReverseSegments(leader);
    leader.moveSegments =
      _.first([...curSegments, ...prevSegments], MAX_SEGMENTS);

    // Compute the total distance of the leader's tracked movement.
    let totalMoveDist = _.reduce(leader.moveSegments, (memo, segment) => {
      let [p1, p2] = segment;
      return memo + VecMath.dist(p1, p2);
    }, 0);

    // Have each follower follow in formation with the leader.
    _.each(leader.followers, follower => {
      let oldXY = [
        follower.token.get('left'),
        follower.token.get('top')
      ];

      // If the projected distance is farther than the total tracked movement
      // distance, then just march the follower relative to the last segment.
      if (follower.data.du >= totalMoveDist) {
        let lastSeg = _.last(leader.moveSegments);
        let lastDist = VecMath.dist(lastSeg[0], lastSeg[1]);

        let relDist = (follower.data.du - totalMoveDist) + lastDist;

        let xy = getFollowerOffset(lastSeg, relDist, follower.data.dv);
        _setNewFollowerPosition(leader, follower.token, xy);
      }

      // Otherwise, find the segment upon which the projected distance would
      // lie, and march the follower relative to that one.
      else {
        let currDist = follower.data.du;

        // Find the segment which the follower's projected distance lies upon.
        _.find(leader.moveSegments, segment => {
          let [p1, p2] = segment;
          let u = VecMath.sub(p2, p1);
          let uLen = VecMath.length(u);

          if (currDist < uLen) {
            let xy = getFollowerOffset(segment, currDist, follower.data.dv);
            _setNewFollowerPosition(leader, follower.token, xy);
            return true;
          }
          else
            currDist -= uLen;
        });
      }

      // If the follower has followers, move them too.
      if (follower.token.followers) {
        follower.token.set('lastmove', `${oldXY[0]},${oldXY[1]}`);
        moveInFormation(follower.token);
      }
    });
  }

  /**
   * Sets the new position for a token in a formation while also doing
   * token collision with dynamic lighting walls.
   * @param {Graphic} leader
   * @param {Graphic} token
   * @param {vec3} newXY
   */
  function _setNewFollowerPosition(leader, token, newXY) {
    // Set the new position based on the formation movement.
    token.set('left', newXY[0]);
    token.set('top', newXY[1]);

    // Check for collisions with dynamic lighting and update the position if
    // necessary.
    token.set('lastmove', leader.get('lastmove'));
    let walls = findObjs({
      _type: 'path',
      _pageid: token.get('_pageid'),
      layer: 'walls'
    });
    let collision =
      TokenCollisions.getCollisions(token, walls, { detailed: true })[0];
    if (collision) {
      token.set('left', collision.pt[0]);
      token.set('top', collision.pt[1]);
    }
  }

  /**
   * Create a marching order formation for the given tokens and set them to
   * follow that formation. Then save it for future use.
   * @param {string} name The name of the new foramtion.
   * @param {Graphic} leader The leader of the formation. When the leader
   * moves, the other tokens will move in that formation.
   * @param {Graphic[]} followers The tokens that will be following the leader.
   * @param {string} direction A cardinal direction (north, south, east, or
   * west) given as the direction the formation is facing at the time it is
   * created.
   */
  function newFormation(name, leader, followers, direction) {
    let dirVector = CARDINAL_VECTORS[direction.toLowerCase()];
    if (!dirVector)
      throw new Error(`${direction} is an invalid cardinal direction.`);

    // Get the vector pointing in the opposition direction from the cardinal
    // direction.
    let uHat = VecMath.scale(dirVector, -1);

    // Remove the leader from the list of followers if it was included there.
    followers = _.reject(followers, follower => {
      return follower === leader;
    });

    // Set up the formation data for the leader and its followers.
    _initFormationLeader(leader);
    _.each(followers, token => {
      // Get the vector from the leader to the follower.
      let tokenXY = _getTokenPt(token);
      let leaderXY = _getTokenPt(leader);
      let a = VecMath.sub(tokenXY, leaderXY);

      // Determine the projected distance (du) of the
      // follower behind the leader.
      let du = VecMath.scalarProjection(uHat, a);

      // Determine the orthogonal projected distance (dv) of the
      // follower behind the leader.
      let vHat = VecMath.cross([0, 0, 1], uHat);
      let dv = VecMath.scalarProjection(vHat, a);

      _setFormationOnToken(leader, token, {du, dv});
    });

    // Save the formation for future use if a name was provided.
    if (name) {
      saveFormation(name, leader);
      MarchingOrder.utils.Chat.broadcast(`Defined new marching formation ` +
        `${name} with ${leader.get('name')} as the leader.`);
    }
    else
      MarchingOrder.utils.Chat.broadcast(`Created ad-hoc marching formation ` +
        `with ${leader.get('name')} as the leader.`);
  }

  /**
   * Persist a marching formation defined by some leader token and its
   * followers.
   * @param {string} name The name of the formation.
   * @param {Graphic} leader The leader token for the formation.
   */
  function saveFormation(name, leader) {
    let myState = MarchingOrder.State.getState();
    if (myState.savedFormations[name])
      throw new Error(`A formation named ${name} already exists!`);

    // Track the leader by either its character's ID, or by its token name
    // (in that order).
    let leaderID = _getTokenPersistID(leader);
    if (!leader.followers)
      throw new Error(`Could not save the formation. The leader token has ` +
        `no followers.`);

    // Convert the followers for persistence.
    let followers = _.map(leader.followers, follower => {
      // Track the follower by their character ID or by their token name
      // (in that order).
      let followerID = _getTokenPersistID(follower.token);
      let imgsrcRaw = follower.token.get('imgsrc');
      let imgsrc = MarchingOrder.utils.getCleanImgsrc(imgsrcRaw);

      return {
        id: followerID,
        imgsrc,
        data: follower.data
      };
    });

    // Persist the formation under the given name.
    let leaderImgSrcRaw = leader.get('imgsrc');
    let leaderImgSrc = MarchingOrder.utils.getCleanImgsrc(leaderImgSrcRaw);
    myState.savedFormations[name] = {
      name,
      leaderID,
      leaderImgSrc,
      followers
    };
    MarchingOrder.utils.Chat.broadcast(`Saved formation "${name}"!`);
  }

  /**
   * Set up a single token to follow its leader with the given formation data.
   * @param {Graphic} leader The leader token.
   * @param {Graphic} token The follower token.
   * @param {object} data An object containing the individual formation data
   * for token.
   */
  function _setFormationOnToken(leader, token, data) {
    if (token.leader)
      unfollow(token);

    token.leader = leader;
    leader.followers.push({token, data});
  }

  /**
   * The given token leaves any marching order formation it is currently
   * following.
   * @param {Graphic} token The token that is leaving its marching formation.
   */
  function unfollow(token) {
    // Unfollow the token from any formation it's part of.
    let leader = token.leader;
    if (leader && leader.followers) {
      // Remove the token from its leader's list of followers.
      leader.followers = _.reject(leader.followers, follower => {
        return follower.token === token;
      });
    }
  }

  /**
   * Make all tokens leave their marching formation.
   */
  function unfollowAll() {
    let allObjs = findObjs({
      _type: 'graphic',
      layer: 'objects'
    });
    _.each(allObjs, obj => {
      obj.leader = undefined;
      obj.followers = undefined;
    });

    MarchingOrder.utils.Chat.broadcast(
      "Ceased all active marching formations.");
  }

  /**
   * Load a persisted formation and apply it to its leader and followers.
   * @param {string} name The name of the formation.
   */
  function useFormation(name) {
    let myState = MarchingOrder.State.getState();
    let formation = myState.savedFormations[name];
    if (!formation)
      throw new Error(`Formation "${name}" doesn't exist.`);

    // Load the token for the leader.
    let leader = _findPersistedToken(formation.leaderID);

    // Load the leader's followers.
    _initFormationLeader(leader);
    _.each(formation.followers, follower => {
      try {
        let token = _findPersistedToken(follower.id);
        _setFormationOnToken(leader, token, follower.data);
      }
      catch (err) {
        // Warn the GM, but skip the token if it isn't available.
        MarchingOrder.utils.Chat.warn(err);
      }
    });
    MarchingOrder.utils.Chat.broadcast(`Using formation "${name}", ` +
      `with ${formation.leaderID} as the leader!`);
  }

  // When the API is loaded, install the Custom Status Marker menu macro
  // if it isn't already installed.
  on('ready', () => {
    try {
      if(!VecMath)
        throw new Error("The new version of the Marching Order script " +
          "requires the Vector Math script. Go install it, or be plagued " +
          "with errors!");
      if (!TokenCollisions)
        throw new Error("The new version of the Marching Order script " +
          "requires the Token Collisions script. Go install it, " +
          "or be plagued with errors!");

      let moState = MarchingOrder.State.getState();
      if (!moState.version)
        MarchingOrder.utils.Chat.broadcast("Hello, friend! The Marching " +
          "Order script has undergone a big update since version 3.0. " +
          "Please check the docs to check out what's new!");

      moState.version = '3.1';
      MarchingOrder.Macros.installMacros();
      log('--- Initialized Marching Order v3.1 ---');
    }
    catch (err) {
      MarchingOrder.utils.Chat.error(err);
    }
  });

  /**
   * Set up an event handler to do the marching order effect when the
   * leader tokens move!
   */
  on("change:graphic:lastmove", obj => {
    try {
      let token = getObj('graphic', obj.get('_id'));

      // If the token was following in some formation, leave the
      // formation.
      if (token.leader)
        unfollow(token);

      // If the token has followers, have them move in formation behind it.
      if (token.followers)
        moveInFormation(token);
    }
    catch(err) {
      MarchingOrder.utils.Chat.error(err);
    }
  });

  return {
    deleteFormation,
    follow,
    getFollowerOffset,
    moveInFormation,
    newFormation,
    saveFormation,
    unfollow,
    unfollowAll,
    useFormation
  };
})();

/**
 * This module defines and implements the chat commands used by this script.
 */
(() => {
  'use strict';

  const MENU_CMD = '!showMarchingOrderMenu';
  const NEW_FORMATION_CMD = '!marchingOrderNewFormation';
  const ANON_FORMATION_CMD = '!marchingOrderAnonFormation';
  const FOLLOW_CMD = '!marchingOrderFollow';
  const STOP_ALL_CMD = '!marchingOrderStopAll';
  const USE_FORMATION_CMD = '!marchingOrderUseFormation';
  const DELETE_FORMATION_CMD = '!marchingOrderDeleteFormation';
  const CLEAR_STATE_CMD = '!marchingOrderClearState';

  /**
   * Process a command to create an ad-hoc formation (one that will be
   * used immediately, but won't be saved).
   * Players can use this one.
   */
  function _cmdAnonFormation(msg) {
    let argv = msg.content.split(' ');
    if (argv.length !== 2)
      throw new Error("ANON_FORMATION_CMD takes 1 parameter: A cardinal direction.");

    let followers = MarchingOrder.utils.Chat.getGraphicsFromMsg(msg);
    let leader = _.find(followers, token => {
      return token.get('status_black-flag') || token.get('status_flying-flag');
    });
    if (!leader)
      throw new Error(`No leader has been selected. The leader token must ` +
        `have the black-flag or flying-flag status icon set.`);
    leader.set('status_black-flag', false);
    leader.set('status_flying-flag', false);

    let direction = argv[1];
    MarchingOrder.newFormation(undefined, leader, followers, direction);
  }

  /**
   * Process an API command to clear the script's state.
   */
  function _cmdClearState(msg) {
    let player = getObj('player', msg.playerid);
    if (playerIsGM(msg.playerid)) {
      let argv = msg.content.split(' ');
      if (argv.length < 2)
        throw new Error("CLEAR_STATE_CMD takes 1 parameter: A confirmation " +
          "for whether you want to delete the script's state.");

      let isSure = (argv[1] === 'yes');
      if (isSure) {
        MarchingOrder.State.clearState();
        MarchingOrder.Wizard.showMainMenu(player);
      }
    }
    else
      MarchingOrder.utils.Chat.tattle(player, 'Clear State');
  }

  /**
   * Delete a saved marching formation.
   */
  function _cmdDeleteFormation(msg) {
    let player = getObj('player', msg.playerid);
    if (playerIsGM(msg.playerid)) {
      let argv = msg.content.split(' ');
      if (argv.length < 2)
        throw new Error("DELETE_FORMATION_CMD takes 2 parameters: The name " +
          "for the formation and a confirmation for whether you want to " +
          "delete the formation.");
      let formationName = argv.slice(1, -1).join(' ');

      let isSure = (_.last(argv) === 'yes');
      if (isSure) {
        MarchingOrder.deleteFormation(formationName);
        MarchingOrder.Wizard.showMainMenu(player);
      }
    }
    else
      MarchingOrder.utils.Chat.tattle(player, 'Delete Saved Formation');
  }

  /**
   * Process an API command to have a token follow directly behind another
   * token that doesn't already have followers. This is done in an ad-hoc,
   * single-file following order that is chainable.
   * Players are allowed to use this one!
   */
  function _cmdFollow(msg) {
    let argv = msg.content.split(' ');
    if (argv.length < 3)
      throw new Error("FOLLOW_CMD takes 3 parameters: The ID of the " +
        "follower token, the ID of the leader token, and an optional " +
        "distance between the two.");

    let follower = getObj('graphic', argv[1]);
    if (!follower)
      throw new Error(`Token with ID ${argv[1]} does not exist.`);

    let leader = getObj('graphic', argv[2]);
    if (!leader)
      throw new Error(`Token with ID ${argv[2]} does not exist.`);

    let distance = parseInt(argv[3]) || 0;

    MarchingOrder.follow(leader, follower, distance);
  }

  /**
   * Process an API command to have tokens follow each other.
   */
  function _cmdNewFormation(msg) {
    let player = getObj('player', msg.playerid);
    if (playerIsGM(msg.playerid)) {
      let argv = msg.content.split(' ');
      if (argv.length < 3)
        throw new Error("NEW_FORMATION_CMD takes 2 parameters: A cardinal direction and a name for the formation.");

      let followers = MarchingOrder.utils.Chat.getGraphicsFromMsg(msg);
      let leader = _.find(followers, token => {
        return token.get('status_black-flag') || token.get('status_flying-flag');
      });
      if (!leader)
        throw new Error(`No leader has been selected. The leader token must ` +
          `have the black-flag or flying-flag status icon set.`);
      leader.set('status_black-flag', false);
      leader.set('status_flying-flag', false);

      let direction = argv[1];
      let name = argv.slice(2).join(' ');
      MarchingOrder.newFormation(name, leader, followers, direction);
      MarchingOrder.Wizard.showMainMenu(player);
    }
    else
      MarchingOrder.utils.Chat.tattle(player, 'New Formation');
  }

  /**
   * Process an API command to use a saved formation.
   */
  function _cmdUseFormation(msg) {
    let player = getObj('player', msg.playerid);
    if (playerIsGM(msg.playerid)) {
      let argv = msg.content.split(' ');
      if (argv.length < 2)
        throw new Error("NEW_FORMATION_CMD takes 1 parameter: The name for the formation.");

      let name = argv.slice(1).join(' ');
      MarchingOrder.useFormation(name);
    }
    else
      MarchingOrder.utils.Chat.tattle(player, 'Use Saved Formation');
  }

  /**
   * Stops all marching orders currently in use.
   */
  function _cmdStopAll(msg) {
    let player = getObj('player', msg.playerid);
    if (playerIsGM(msg.playerid))
      MarchingOrder.unfollowAll();
    else
      MarchingOrder.utils.Chat.tattle(player, 'Stop All Formations');
  }

  /**
   * Processes an API command to display the script's main menu.
   */
  function menu(msg) {
    let player = getObj('player', msg.playerid);
    MarchingOrder.Wizard.showMainMenu(player);
  }

  // Event handler for the script's API chat commands.
  on('chat:message', msg => {
    let argv = msg.content.split(' ');
    try {
      if(argv[0] === MENU_CMD)
        menu(msg);
      else if (argv[0] === NEW_FORMATION_CMD)
        _cmdNewFormation(msg);
      else if (argv[0] === ANON_FORMATION_CMD)
        _cmdAnonFormation(msg);
      else if (argv[0] === FOLLOW_CMD)
        _cmdFollow(msg);
      else if (argv[0] === STOP_ALL_CMD)
        _cmdStopAll(msg);
      else if (argv[0] === USE_FORMATION_CMD)
        _cmdUseFormation(msg);
      else if (argv[0] === DELETE_FORMATION_CMD)
        _cmdDeleteFormation(msg);
      else if (argv[0] === CLEAR_STATE_CMD)
        _cmdClearState(msg);
    }
    catch(err) {
      MarchingOrder.utils.Chat.error(err);
    }
  });

  /**
   * Expose the command constants for use in other modules.
   */
  MarchingOrder.Commands = {
    ANON_FORMATION_CMD,
    CLEAR_STATE_CMD,
    DELETE_FORMATION_CMD,
    FOLLOW_CMD,
    MENU_CMD,
    NEW_FORMATION_CMD,
    STOP_ALL_CMD,
    USE_FORMATION_CMD
  };
})();

(() => {
  'use strict';

  /**
   * Module for global script configurations.
   */
  MarchingOrder.Config = class {

    /**
     * Get the configured default marching order.
     */
    static getDefaultMarchingOrder() {
      return MarchingOrder.State.getState().defaultOrder;
    }

    /**
     * Set the configured default marching order.
     * @param {Graphic} leader
     */
    static setDefaultMarchingOrder(leader) {
      let items = [];
      let next = leader;
      while(next) {
        let represents = next.get('represents');
        if(!represents)
          throw new Error('All tokens in the default marching order must represent a character.');

        items.push({
          represents,
          imgsrc: next.get('imgsrc'),
          name: next.get('name')
        });
        next = next.follower;
      }
      MarchingOrder.State.getState().defaultOrder = items;
    }
  };
})();

(() => {
  'use strict';

  /**
   * Installs/updates a macro for the script.
   * @param {string} name
   * @param {string} action
   */
  function _installMacro(player, name, action) {
    let macro = findObjs({
      _type: 'macro',
      _playerid: player.get('_id'),
      name
    })[0];

    if(macro)
      macro.set('action', action);
    else {
      createObj('macro', {
        _playerid: player.get('_id'),
        name,
        action
      });
    }
  }

  /**
   * This module is responsible for installing and updating the macros
   * used by this script.
   */
  MarchingOrder.Macros = class {

    /**
     * Installs/updates the macros for this script.
     */
    static installMacros() {
      let players = findObjs({
        _type: 'player'
      });

      const Commands = MarchingOrder.Commands;

      // Create the macro, or update the players' old macro if they already have it.
      _.each(players, player => {
        _installMacro(player, 'MarchingOrderMenu', Commands.MENU_CMD);
      });
    }
  };
})();

(() => {
  'use strict';

  /**
   * This module provides an interface to the script's state.
   */
  MarchingOrder.State = class {

    /**
     * Clears the script's state and resets it to its factory defaults.
     */
    static clearState() {
      delete state.marchingOrder;
      MarchingOrder.State.getState();
    }

    /**
     * Displays the JSONified state for this script to the chat.
     * @param {Player} player
     * @return {string}
     */
    static exportState(player) {
      let json = MarchingOrder.State.jsonifyState();
      let content = `<div>Below is the JSON for this script's state. Copy-paste it to import it to another campaign.</div>` +
        `<pre>${json}</pre>`;

      let menu = new MarchingOrder.utils.Menu('Export Marching Order', content);
      menu.show(player);
      return json;
    }

    /**
     * Gets the script's configured options.
     * @return {Object}
     */
    static getOptions() {
      let scriptState = MarchingOrder.State.getState();
      if(!scriptState.options)
        scriptState.options = {};
      return scriptState.options;
    }

    /**
     * Returns this module's object for the Roll20 API state.
     * @return {Object}
     */
    static getState() {
      if(!state.marchingOrder)
        state.marchingOrder = {};

      _.defaults(state.marchingOrder, {
        savedFormations: {}
      });

      return state.marchingOrder;
    }

    /**
     * Imports the state for this script from JSON.
     * @param {Player} player
     * @param {string} json
     */
    static importState(player, json) {
      let scriptState = MarchingOrder.State.getState();
      _.extend(scriptState, JSON.parse(json));

      MarchingOrder.Wizard.show(player);
    }

    /**
     * Gets the JSON string for this script's state.
     * @return {string}
     */
    static jsonifyState() {
      let scriptState = MarchingOrder.State.getState();
      return JSON.stringify(scriptState);
    }
  };
})();

(() => {
  'use strict';

  MarchingOrder.Wizard = class {

    /**
     * Create an instance of the main menu.
     * @param {Player} player
     * @return {MarchingOrder.utils.Menu}
     */
    static getMainMenu(player) {
      let playerId = player.get('_id');
      const Commands = MarchingOrder.Commands;
      const Menu = MarchingOrder.utils.Menu;

      // Menu options
      let actionsHtml = '';

      // Ad-Hoc menu
      actionsHtml += '<h2>Ad-Hoc Formations:</h2>';

      // Follow (Players can use this one)
      actionsHtml += '<div style="text-align: center;" ' +
        'title="Have a selected token follow directly behind another token.">' +
        '[Follow](' + Commands.FOLLOW_CMD + ' &#64;{selected|token_id} ' +
        '&#64;{target|token_id} ?{How far to you want them to follow behind, in pixels?|0})</div>';

      // Anonymous formation (Players can use this one too!)
      actionsHtml += '<div style="padding-top: 1em; text-align: center;" ' +
        'title="Create a one-time-use formation that will not be saved.">' +
        '[Ad-Hoc Formation](' + Commands.ANON_FORMATION_CMD + ' ' +
        '?{Initial Marching Direction|north|south|east|west})' +
        '</div>';

      if(playerIsGM(playerId)) {
        actionsHtml += '<hr/>';

        // Saved formations menu
        actionsHtml += '<h2>Saved Formations:</h2>';

        // New formation
        actionsHtml += '<div style="padding-top: 1em; text-align: center;" ' +
          'title="Create and save a new reusable formation.">' +
          '[New Formation](' + Commands.NEW_FORMATION_CMD + ' ' +
          '?{Initial Marching Direction|north|south|east|west} ' +
          '?{Give the formation a name.})' +
          '</div>';

        // Show saved formations
        actionsHtml += MarchingOrder.Wizard._getFormationsHtml();

        actionsHtml += '<hr/>';

        // Other actions
        actionsHtml += '<h2>Other Actions:</h2>';

        // Stop all following
        actionsHtml += '<div style="padding-top: 1em; text-align: center;" ' +
          'title="Cancel all active formations.">' +
          '[Stop All Following](' + Commands.STOP_ALL_CMD + ')</div>';

        // Clear state
        actionsHtml += '<div style="padding-top: 1em; text-align: center;" ' +
          'title="Clear the state for the Marching Order script. This will delete all your saved formations for the script!">' +
          '[Clear Script State](' + Commands.CLEAR_STATE_CMD +
          ' ?{Are you sure?|yes|no})</div>';
      }

      return new Menu('Marching Order', actionsHtml);
    }

    /**
     * Show the main chat menu for the script to the given player.
     * @param {Player} player
     */
    static showMainMenu(player) {
      let menu = MarchingOrder.Wizard.getMainMenu(player);
      menu.show(player);
    }

    /**
     * Show the formations menu to the given player.
     */
    static _getFormationsHtml() {
      let moState = MarchingOrder.State.getState();
      const Commands = MarchingOrder.Commands;

      if (_.size(moState.savedFormations) === 0) {
        return '<div style="font-size: 0.8em; text-align: center;">' +
          'No marching formations have been saved yet.</div>';
      }

      let actionsHtml = '';
      actionsHtml += '<div style="font-style: italic; font-size: small; ' +
        'color: #aaa;">Previews of formations are shown marching westward.' +
        '</div>';

      // Get the sorted list of formation names.
      let formationNames = _.map(moState.savedFormations, formation => {
        return formation.name;
      });
      formationNames.sort();

      let borderColor = '#c4a';

      // Render each formation and its menu controls.
      _.each(formationNames, name => {
        let formation = moState.savedFormations[name];
        actionsHtml += `<div style="border: solid 1px ${borderColor}; margin-bottom: 0.5em; border-radius: 10px; overflow: hidden;">`;
        actionsHtml += `<h3 style="background: ${borderColor}; color: white; padding-left: 0.5em;">${formation.name}</h3>`;
        actionsHtml += MarchingOrder.Wizard._renderFormationPreview(formation);

        // Render controls for the formation.
        actionsHtml += '<div style="text-align: center;">';
        actionsHtml += '<div style="display: inline-block; padding-top: 1em; text-align: center;" title="Use this formation on the current page.">' +
          '[Use](' + Commands.USE_FORMATION_CMD + ' ' + name + ')</div>';
        actionsHtml += '<div style="display: inline-block; padding-top: 1em; text-align: center;" title="Delete this formation.">' +
          '[Delete](' + Commands.DELETE_FORMATION_CMD + ' ' + name +
          ' ?{Are you sure you want to delete formation ' + name +
          '?|yes|no})</div>';
        actionsHtml += "</div>";

        actionsHtml += '</div>';
      });

      return actionsHtml;
    }

    /**
     * Renders a preview of a formation to be displayed in the chat menu.
     * @param {Formation} formation
     */
    static _renderFormationPreview(formation) {
      let tokens = [{
        id: formation.leaderID,
        imgsrc: formation.leaderImgSrc,
        data: {
          du: 0,
          dv: 0
        }
      }];
      _.each(formation.followers, follower => {
        tokens.push(follower);
      });

      // Get the bounds of the formation.
      let left = _.min(tokens, token => {
        return token.data.du;
      }).data.du;
      let right = _.max(tokens, token => {
        return token.data.du;
      }).data.du;
      let top = _.min(tokens, token => {
        return token.data.dv;
      }).data.dv;
      let bottom = _.max(tokens, token => {
        return token.data.dv;
      }).data.dv;
      let width = right - left + 70;
      let height = bottom - top + 70;

      // Determine the correct scale for the preview container.
      let scale, previewWidth, previewHeight;
      if (width > height) {
        scale = 200/width || 1;
        previewWidth = 200;
        previewHeight = height*scale;
      }
      else {
        scale = 200/height || 1;
        previewWidth = width*scale;
        previewHeight = 200;
      }
      let dia = 70*scale;

      // Render the formation preview.
      let previewHTML = `<div style="text-align: center;"><div style="display: inline-block; position: relative; width: ${previewWidth}px; height: ${previewHeight}px;">`;

      // Render the tokens.
      _.each(tokens, follower => {
        let unitSegment = [[0, 0, 1], [1, 0, 1]];
        let xy = MarchingOrder.getFollowerOffset(unitSegment, follower.data.du, follower.data.dv);
        xy = VecMath.add(xy, [-left, -top, 0]);
        xy = VecMath.scale(xy, scale);

        previewHTML += `<img src="${follower.imgsrc}" title="${follower.id}" style="position: absolute; width: ${dia}px; height: ${dia}px; left: ${xy[0]}px; top: ${xy[1]}px"/>`;
      });
      previewHTML += '</div></div>';

      return previewHTML;
    }
  };
})();

/**
 * utils package
 */
(() => {
  'use strict';

  /**
   * Cookbook.getCleanImgsrc
   * https://wiki.roll20.net/API:Cookbook#getCleanImgsrc
   */
  function getCleanImgsrc(imgsrc) {
    let parts = imgsrc.match(/(.*\/(images|marketplace)\/.*)(thumb|med|original|max)(.*)$/);
    if(parts)
      return parts[1]+'thumb'+parts[4];
    throw new Error('Only images that you have uploaded to your library ' +
      'can be used as custom status markers. ' +
      'See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions for more information. ' +
      'Offending URL: ' + imgsrc);
  }

  MarchingOrder.utils = {
    getCleanImgsrc
  };
})();

(() => {
  'use strict';

  const FROM_NAME = 'MarchingOrder';

  /**
   * This module provides chat-related functions.
   */
  MarchingOrder.utils.Chat = class {
    /**
     * Displays a message in the chat visible to all players.
     * @param {string} message
     */
    static broadcast(message) {
      sendChat(FROM_NAME, message);
    }

    /**
     * Notify GMs about an error and logs its stack trace.
     * @param {Error} err
     */
    static error(err) {
      log(`MarchingOrder ERROR: ${err.message}`);
      log(err.stack);
      MarchingOrder.utils.Chat.whisperGM(
        `ERROR: ${err.message} --- See API console log for details.`);
    }

    /**
     * Fixes the 'who' string from a Message so that it can be reused as a
     * whisper target using Roll20's sendChat function.
     * @param {string} who The player name taken from the 'who' property of a
     * chat:message event.
     * @return {string}
     */
    static fixWho(srcWho) {
      return srcWho.replace(/\(GM\)/, '').trim();
    }

    /**
     * Extracts the selected graphics from a chat message.
     * @param {ChatMessage} msg
     * @return {Graphic[]}
     */
    static getGraphicsFromMsg(msg) {
      var result = [];

      var selected = msg.selected;
      if(selected) {
        _.each(selected, s => {
          let graphic = getObj('graphic', s._id);
          if(graphic)
            result.push(graphic);
        });
      }
      return result;
    }

    /**
     * Publicly shame a player for trying to use a GMs-only part of this script.
     * @param {Player} player
     * @param {string} component A descriptor of the component the player tried
     * to access.
     */
    static tattle(player, component) {
      let name = player.get('_displayname');
      MarchingOrder.utils.Chat.broadcast(`Player ${name} has been caught ` +
        `accessing a GMs-only part of the Marching Order ` +
        `script: ${component}. Shame on them!`);
    }

    /**
     * Notify GMs about a warning.
     * @param {Error} err
     */
    static warn(err) {
      log(`MarchingOrder WARNING: ${err.message}`);
      MarchingOrder.utils.Chat.whisperGM(
        `WARNING: ${err.message}`);
    }

    /**
     * Whispers a message to someoen.
     * @param {Player} player The player who will receive the whisper.
     * @param {string} msg The whispered message.
     */
    static whisper(player, msg) {
      let name = player.get('_displayname');
      let cleanName = MarchingOrder.utils.Chat.fixWho(name);
      sendChat(FROM_NAME, '/w "' + cleanName + '" ' + msg);
    }

    /**
     * Whispers a message to the GM.
     * @param {string} message
     */
    static whisperGM(message) {
      sendChat(FROM_NAME, '/w gm ' + message);
    }
  };
})();

(() => {
  'use strict';

  /**
   * An in-chat menu.
   */
  MarchingOrder.utils.Menu = class {
    /**
     * The HTML for this menu.
     */
    get html() {
      let html = '<div style="background: #fff; border: solid 1px #000; border-radius: 5px; font-weight: bold; margin-bottom: 1em; overflow: hidden;">';
      html += '<div style="background: #000; color: #fff; text-align: center;">' + this._header + '</div>';
      html += '<div style="padding: 5px;">' + this._content + '</div>';
      html += '</div>';
      return html;
    }

    constructor(header, content) {
      this._header = header;
      this._content = content;
    }

    /**
     * Show the menu to a player.
     */
    show(player) {
      MarchingOrder.utils.Chat.whisper(player, this.html);
    }
  };
})();
