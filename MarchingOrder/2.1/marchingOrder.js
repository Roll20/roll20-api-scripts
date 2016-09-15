/**
 * A script with a command for specifying tokens to follow other tokens.
 * Simply select the tokens in the marching order and enter the "!follow"
 * commandwith either a direction for the marching order of the selected tokens
 * or the name of a token for the selected tokens to follow behind.
 *
 * E.G. "!follow west" will make the selected tokens follow each other in order
 * from east to west, with the westmost token being the leader and the eastmost
 * token being the caboose.
 * Alternatively if we want the selected tokens to follow a character named
 * "Drizt", enter the command "!follow Drizt".
 *
 * !follow [north|south|east|west|name of leader token]
 *
 * To make a token stop following the token in front of it, just manually move
 * the token anywhere.
 */
var MarchingOrder = (function() {

  var MENU_CMD = '!showMarchingOrderMenu';
  var FOLLOW_CMD = '!marchingOrderFollow';


  /**
   * Makes tokens follow each other in order of some compass direction.
   * @param {Graphic[]} tokens
   * @param {String} direction
   */
  var _cmdFollowDirection = function(tokens, direction) {
      tokens.sort(function(a,b) {
          var aX = parseFloat(a.get("left"));
          var bX = parseFloat(b.get("left"));
          var aY = parseFloat(a.get("top"));
          var bY = parseFloat(b.get("top"));

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
  };

  /**
   * Makes the tokens follow a token with the specified name.
   * The tokens behind the leader form a line in no particular order.
   * @param {Graphic[]} tokens
   * @param {String} leaderName
   */
  var _cmdFollowNamedToken = function(tokens, leaderName) {
      var curPageID = Campaign().get("playerpageid");
      var leader = findObjs({
          name: leaderName,
          _pageid: curPageID
      })[0];
      if(leader) {
          tokens.unshift(leader);
          setMarchingOrder(tokens);
      }
  };

  /**
   * Makes a token's followers move to the token's previous position.
   * @param {Graphic} leader
   */
  var _doFollowMovement = function(leader) {
      var follower = leader.follower;
      follower.prevLeft = follower.get("left");
      follower.prevTop = follower.get("top");
      follower.prevRotation = follower.get("rotation")

      follower.set("left",leader.prevLeft);
      follower.set("top",leader.prevTop);
      follower.set("rotation", leader.prevRotation);
  };

  /**
   * Makes a token follow another token.
   * @param {Graphic} leader
   * @param {Graphic} follower
   */
  var follow = function(leader, follower) {
      if(!leader || !follower)
          return;

      // unbind all of follower's following links.
      unfollow(follower);

      var prevFollower = leader.follower;
      follower.leader = leader;
      follower.follower = prevFollower;

      leader.follower = follower;
      if(prevFollower) {
          prevFollower.leader = follower;
      }
  };

  /**
   * Gets the argument of the API command.
   * @param {Msg} msg
   * @return {String}
   */
  var _getCmdArg = function(msg) {
      var msgTxt = msg.content;
      var index = msgTxt.indexOf(' ');
      if(index >= 0) {
          index++;
          return msgTxt.substring(index);
      }
      else {
          return null;
      }
  };

    /**
     * Returns a list of the tokens selected by the player.
     * @param {Msg} msg
     * @return {Graphic[]}
     */
    var _getSelectedTokens = function(msg) {
        var tokens = [];

        var curPageID = Campaign().get("playerpageid");
        var selected = msg.selected; // Not actually tokens.

        for(var i=0; i<selected.length; i++) {
          var token = findObjs({
              _id: selected[i]._id,
              _pageid: curPageID
          })[0];

          if(token)
              tokens.push(token);
        }

        return tokens;
    };

    /**
     * Checks if the chat message starts with some API command.
     * @param {Msg} msg   The chat message for the API command.
     * @param {String} cmdName
     * @return {Boolean}
     */
    var _msgStartsWith = function(msg, cmdName) {
        var msgTxt = msg.content;
        return (msg.type == 'api' && msgTxt.indexOf(cmdName) !== -1);
    };

    /**
     * Tries to parse an API command argument as a compass direction.
     * @param {String} msgTxt
     * @return {String} The compass direction, or null if it couldn't be parsed.
     */
    var _parseDirection = function(msgTxt) {
        if(msgTxt.indexOf("north") !== -1) {
            return "north";
        }
        else if(msgTxt.indexOf("south") !== -1) {
            return "south";
        }
        else if(msgTxt.indexOf("west") !== -1) {
            return "west";
        }
        else if(msgTxt.indexOf("east") !== -1) {
            return "east";
        }
        else {
            return null;
        }
    };

    /**
     * Sends a message back to the player who used the command about how to
     * use this script.
     * @param {Msg} msg
     */
    var _replyHowToMessage = function(msg) {
        var playerName = msg.who;
        if(playerName.indexOf(" ") !== -1) {
            playerName = playerName.substring(0, playerName.indexOf(" "));
        }

        _whisper(playerName, " Invalid " +
                "command. After the command enter either north, south," +
                " east, or west for the direction of the marching order, " +
                "or the name of a character to follow.");
    };

    /**
     * Sets a marching order for an array of tokens, with the token at index 0
     * being the leader.
     * @param {Graphic[]}
     */
    var setMarchingOrder = function(tokens) {
        for(var i=0; i<tokens.length - 1; i++) {
            var leader = tokens[i];
            var follower = tokens[i+1];

            sendChat("Marching Order", follower.get("name") + " is following " + leader.get("name"));
            follow(leader, follower);
        }
    };

    /**
     * Shows the menu for Marching Order in the chat.
     */
    function _showMenu(who, playerId) {
      // List of saved markers
      var html = '';

      // Menu options
      var actionsHtml = '<div style="text-align: center;">[Follow](' + FOLLOW_CMD + ' ?{Follow: Who should I follow?})</div>';

      // Cardinal directions (GM only)
      if(playerIsGM(playerId)) {
        actionsHtml += '<div style="text-align: center;">March in order:</div>'
        actionsHtml += '<div><table style="width: 100%;">';
        actionsHtml += '<tr><td></td><td>[North](' + FOLLOW_CMD + ' north)</td><td></td></tr>';
        actionsHtml += '<tr><td>[West](' + FOLLOW_CMD + ' west)</td><td></td><td>[East](' + FOLLOW_CMD + ' east)</td></tr>';
        actionsHtml += '<tr><td></td><td>[South](' + FOLLOW_CMD + ' south)</td><td></td></tr>';
        actionsHtml += '</table></div>';
      }

      html += _showMenuPanel('Menu Actions', actionsHtml);

      _whisper(who, html);
    }

    function _showMenuPanel(header, content) {
      var html = '<div style="background: #fff; border: solid 1px #000; border-radius: 5px; font-weight: bold; margin-bottom: 1em; overflow: hidden;">';
      html += '<div style="background: #000; color: #fff; text-align: center;">' + header + '</div>';
      html += '<div style="padding: 5px;">' + content + '</div>';
      html += '</div>';
      return html;
    }

    /**
     * Makes a token stop following other tokens.
     * @param {Graphic} token
     */
    var unfollow = function(token) {
        if(token.leader) {
            token.leader.follower = token.follower;
        }
        if(token.follower) {
            token.follower.leader = token.leader;
        }

        token.leader = null;
        token.follower = null;
    };

    /**
     * @private
     * Whispers a Custom Status Markers message to someone.
     */
    function _whisper(who, msg) {
      sendChat('Marching Order', '/w ' + who + ' ' + msg);
    }

    // When the API is loaded, install the Custom Status Marker menu macro
    // if it isn't already installed.
    on('ready', function() {
      var macro = findObjs({
        _type: 'macro',
        name: 'MarchingOrderMenu'
      })[0];

      if(!macro) {
        var players = findObjs({
          _type: 'player'
        });
        var gms = _.filter(players, function(player) {
          return playerIsGM(player.get('_id'));
        });

        _.each(gms, function(gm) {
          createObj('macro', {
            _playerid: gm.get('_id'),
            name: 'MarchingOrderMenu',
            action: MENU_CMD
          });
        });
      }
    });

    /**
     * Set up our chat command handler.
     */
    on("chat:message", function(msg) {
        if(_msgStartsWith(msg, FOLLOW_CMD)) {
            var arg = _getCmdArg(msg);
            var tokens = _getSelectedTokens(msg);
            var direction = _parseDirection(arg);

            if(direction)
                _cmdFollowDirection(tokens, direction);
            else if(arg)
                _cmdFollowNamedToken(tokens, arg);
            else
                _replyHowToMessage(playerName);
        }
        else if(_msgStartsWith(msg, MENU_CMD)) {
            _showMenu(msg.who, msg.playerid);
        }
    });

    /**
     * Set up an event handler to do the marching order effect when the
     * leader tokens move!
     */
    on("change:graphic", function(obj, prev) {
        var leader = obj;
        leader.prevLeft = prev["left"];
        leader.prevTop = prev["top"];
        leader.prevRotation = prev["rotation"];

        // Only move the followers if there was a change in either the leader's
        // left or top attributes.
        if(leader.get("left") != leader.prevLeft || leader.get("top") != leader.prevTop) {

            // We stepped out of line. Stop following the guy in front of us.
            if(leader.leader) {
                unfollow(leader);
            }

          // move everyone to the previous position of the token in front of them.
          while(leader.follower) {
              _doFollowMovement(leader);
              leader = leader.follower;

              // avoid cycles.
              if(leader == obj) {
                 return;
              }
          }
        }
    });

    // The exposed API.
    return {
        follow: follow,
        set: setMarchingOrder,
        unfollow: unfollow
    };
})();
