var MarchingOrder = (() => {
  'use strict';

  /**
   * Makes a token's followers move to the token's previous position.
   * @param {Graphic} leader
   */
  function _doFollowMovement(leader) {
    let follower = leader.follower;
    follower.prevLeft = follower.get("left");
    follower.prevTop = follower.get("top");
    follower.prevRotation = follower.get("rotation");

    follower.set("left",leader.prevLeft);
    follower.set("top",leader.prevTop);
    follower.set("rotation", leader.prevRotation);

    if(typeof CustomStatusMarkers !== 'undefined')
      CustomStatusMarkers.repositionStatusMarkers(follower);
  }

  /**
   * Makes a single token follow another token.
   * @param {Graphic} leader
   * @param {Graphic} follower
   */
  function follow(leader, follower) {
    if(!leader || !follower)
      return;

    // unbind all of follower's following links.
    unfollow(follower);

    let prevFollower = leader.follower;
    follower.leader = leader;
    follower.follower = prevFollower;

    leader.follower = follower;
    if(prevFollower)
      prevFollower.leader = follower;
  }

  /**
   * Makes tokens follow each other in order of some compass direction.
   * @param {Graphic[]} tokens
   * @param {String} direction
   */
  function followAllDirection(tokens, direction) {
    tokens.sort((a,b) => {
      let aX = parseFloat(a.get("left"));
      let bX = parseFloat(b.get("left"));
      let aY = parseFloat(a.get("top"));
      let bY = parseFloat(b.get("top"));

      if(direction === "north")
        return (aY - bY);
      else if(direction === "south")
        return (bY - aY);
      else if(direction === "west")
        return (aX - bX);
      else // east
        return (bX - aX);
    });
    setMarchingOrder(tokens);
  }

  /**
   * Makes a chain of tokens follow some other token.
   * @param {Graphic} follower
   * @param {Graphic} leader
   */
  function followAllToken(follower, leader) {
    // Can't follow self.
    if(follower === leader)
      return;

    // Include the follower's previous followers in the marching order.
    let tokens = [follower];
    let next = follower.follower;
    while(next) {
      if(next === leader)
        throw new Error('Cyclical marching orders are not allowed!');
      tokens.push(next);
      next = next.follower;
    }
    tokens.unshift(leader);
    setMarchingOrder(tokens);
  }



  /**
   * Sets a marching order for an array of tokens, with the token at index 0
   * being the leader.
   * @param {Graphic[]}
   */
  function setMarchingOrder(tokens) {
    _.each(_.range(tokens.length-1), i => {
      let leader = tokens[i];
      let follower = tokens[i+1];

      MarchingOrder.utils.Chat.broadcast(follower.get("name") + " is following " + leader.get("name"));
      follow(leader, follower);
    });
  }

  /**
   * Makes a token stop following other tokens.
   * @param {Graphic} token
   */
  function unfollow(token) {
      if(token.leader)
        token.leader.follower = token.follower;
      if(token.follower)
        token.follower.leader = token.leader;
      token.leader = null;
      token.follower = null;
  }

  /**
   * Makes all tokens stop following each other.
   */
  function unfollowAll() {
    let allObjs = findObjs({
      _type: 'graphic',
      layer: 'objects'
    });
    _.each(allObjs, obj => {
      unfollow(obj);
    });

    MarchingOrder.utils.Chat.broadcast("Tokens are no longer following each other.");
  }

  /**
   * Applies the default marching order to the page that currently has the
   * player ribbon.
   */
  function useDefaultMarchingOrder() {
    let playerpageid = Campaign().get('playerpageid');
    let tokens = [];
    let defaultOrder = MarchingOrder.Config.getDefaultMarchingOrder();
    _.each(defaultOrder, item => {
      let token = findObjs({
        _type: 'graphic',
        _pageid: playerpageid,
        represents: item.represents
      })[0];
      if(token)
        tokens.push(token);
    });
    setMarchingOrder(tokens);
  }


  // When the API is loaded, install the Custom Status Marker menu macro
  // if it isn't already installed.
  on('ready', () => {
    MarchingOrder.Macros.installMacros();
    log('--- Initialized Marching Order vSCRIPT_VERSION ---');
  });

  /**
   * Set up an event handler to do the marching order effect when the
   * leader tokens move!
   */
  on("change:graphic", (obj, prev) => {
    try {
      let leader = obj;
      leader.prevLeft = prev["left"];
      leader.prevTop = prev["top"];
      leader.prevRotation = prev["rotation"];

      // Only move the followers if there was a change in either the leader's
      // left or top attributes.
      if(leader.get("left") !== leader.prevLeft || leader.get("top") !== leader.prevTop) {

        // We stepped out of line. Stop following the guy in front of us.
        if(leader.leader)
          unfollow(leader);

        // move everyone to the previous position of the token in front of them.
        while(leader.follower) {
          _doFollowMovement(leader);
          leader = leader.follower;

          // avoid cycles.
          if(leader === obj)
             return;
        }
      }
    }
    catch(err) {
      MarchingOrder.utils.Chat.error(err);
    }
  });

  return {
    follow: follow,
    followAllDirection,
    followAllToken,
    set: setMarchingOrder,
    unfollow,
    unfollowAll,
    useDefaultMarchingOrder
  };
})();
