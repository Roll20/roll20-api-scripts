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

      moState.version = 'SCRIPT_VERSION';
      MarchingOrder.Macros.installMacros();
      log('--- Initialized Marching Order vSCRIPT_VERSION ---');
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
