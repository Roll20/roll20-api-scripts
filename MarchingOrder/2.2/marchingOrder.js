var MarchingOrder = (() => {
  'use strict';

  const MENU_CMD = '!showMarchingOrderMenu';
  const FOLLOW_CMD = '!marchingOrderFollow';


  /**
   * Makes tokens follow each other in order of some compass direction.
   * @param {Graphic[]} tokens
   * @param {String} direction
   */
  function _cmdFollowDirection(tokens, direction) {
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
   * Makes the tokens follow a token with the specified name.
   * The tokens behind the leader form a line in no particular order.
   * @param {Graphic[]} tokens
   * @param {Graphic} leader
   */
  function _cmdFollowTargetToken(playerid, follower, leader) {
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
   * Makes a token follow another token.
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
   * Tries to parse an API command argument as a compass direction.
   * @param {String} msgTxt
   * @return {String} The compass direction, or null if it couldn't be parsed.
   */
  function _parseDirection(msgTxt) {
    if(msgTxt.includes('north'))
      return "north";
    else if(msgTxt.includes('south'))
      return "south";
    else if(msgTxt.includes('west'))
      return "west";
    else if(msgTxt.includes('east'))
      return "east";
    else
      return null;
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

      sendChat("Marching Order", follower.get("name") + " is following " + leader.get("name"));
      follow(leader, follower);
    });
  }

  /**
   * Shows the menu for Marching Order in the chat.
   */
  function _showMenu(playerId) {
    let html = '';

    // Menu options
    let actionsHtml = '<div style="text-align: center;">[Follow](' + FOLLOW_CMD + ' &#64;{selected|token_id} &#64;{target|token_id})</div>';

    // Cardinal directions (GM only)
    if(playerIsGM(playerId)) {
      actionsHtml += '<div style="text-align: center;">March in order:</div>';
      actionsHtml += '<div><table style="width: 100%;">';
      actionsHtml += '<tr><td></td><td>[North](' + FOLLOW_CMD + ' north)</td><td></td></tr>';
      actionsHtml += '<tr><td>[West](' + FOLLOW_CMD + ' west)</td><td></td><td>[East](' + FOLLOW_CMD + ' east)</td></tr>';
      actionsHtml += '<tr><td></td><td>[South](' + FOLLOW_CMD + ' south)</td><td></td></tr>';
      actionsHtml += '</table></div>';
    }

    html += _showMenuPanel('Menu Actions', actionsHtml);
    _whisper(playerId, html);
  }

  function _showMenuPanel(header, content) {
    let html = '<div style="background: #fff; border: solid 1px #000; border-radius: 5px; font-weight: bold; margin-bottom: 1em; overflow: hidden;">';
    html += '<div style="background: #000; color: #fff; text-align: center;">' + header + '</div>';
    html += '<div style="padding: 5px;">' + content + '</div>';
    html += '</div>';
    return html;
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
   * @private
   * Whispers a Marching Order message to someone.
   */
  function _whisper(playerId, msg) {
    let name = (getObj('player', playerId)||{get:()=>'API'}).get('_displayname');
    sendChat('Marching Order', '/w "' + name + '" ' + msg);
  }

  // When the API is loaded, install the Custom Status Marker menu macro
  // if it isn't already installed.
  on('ready', () => {
    let macro = findObjs({
      _type: 'macro',
      name: 'MarchingOrderMenu'
    })[0];

    if(!macro) {
      let players = findObjs({
        _type: 'player'
      });

      _.each(players, player => {
        createObj('macro', {
          _playerid: player.get('_id'),
          name: 'MarchingOrderMenu',
          action: MENU_CMD
        });
      });
    }

    log('→→→ Initialized Marching Order →→→');
  });

  /**
   * Set up our chat command handler.
   */
  on("chat:message", msg => {
    try {
      if(msg.content.startsWith(FOLLOW_CMD)) {
        let argv = msg.content.split(' ');
        let dirMatch = argv[1].match(/(north|south|east|west)/);
        if(dirMatch) {
          let selected = [];
          _.each(msg.selected, item => {
            if(item._type === 'graphic') {
              let token = getObj('graphic', item._id);
              selected.push(token);
            }
          });
          _cmdFollowDirection(selected, dirMatch[0]);
        }
        else {
          log(argv);

          let follower = getObj('graphic', argv[1]);
          let leader = getObj('graphic', argv[2]);
          if(follower && leader)
            _cmdFollowTargetToken(msg.playerid, follower, leader);
        }
      }
      else if(msg.content.startsWith(MENU_CMD))
        _showMenu(msg.playerid);
    }
    catch(err) {
      log(err.message);
      log(err.stack);
      _whisper(msg.playerid, 'ERROR: ' + err.message);
    }
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
      if(leader.get("left") != leader.prevLeft || leader.get("top") != leader.prevTop) {

        // We stepped out of line. Stop following the guy in front of us.
        if(leader.leader)
          unfollow(leader);

        // move everyone to the previous position of the token in front of them.
        while(leader.follower) {
          _doFollowMovement(leader);
          leader = leader.follower;

          // avoid cycles.
          if(leader == obj)
             return;
        }
      }
    }
    catch(err) {
      log(err.message);
      log(err.stack);
      _whisper(msg.playerid, 'ERROR: ' + err.message);
    }
  });

  // The exposed API.
  return {
    follow,
    set: setMarchingOrder,
    unfollow
  };
})();
