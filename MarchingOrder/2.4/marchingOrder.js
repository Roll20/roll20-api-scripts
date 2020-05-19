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
    log('--- Initialized Marching Order v2.4 ---');
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

/**
 * This module defines and implements the chat commands used by this script.
 */
(() => {
  'use strict';

  const MENU_CMD = '!showMarchingOrderMenu';
  const FOLLOW_CMD = '!marchingOrderFollow';
  const STOP_ALL_CMD = '!marchingOrderStopAll';
  const DEFAULT_USE_CMD = '!marchingOrderUseDefault';
  const DEFAULT_SET_CMD = '!marchingOrderSetDefault';

  /**
   * Extracts the selected graphics from a chat message.
   * @param {ChatMessage} msg
   * @return {Graphic[]}
   */
  function _getGraphicsFromMsg(msg) {
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
   * Process an API command to have tokens follow each other.
   */
  function _cmdFollow(msg) {
    let argv = msg.content.split(' ');
    let dirMatch = argv[1].match(/(north|south|east|west)/);
    if(dirMatch) {
      let selected = _getGraphicsFromMsg(msg);
      MarchingOrder.followAllDirection(selected, dirMatch[0]);
    }
    else {
      let follower = getObj('graphic', argv[1]);
      let leader = getObj('graphic', argv[2]);
      if(follower && leader)
        MarchingOrder.followAllToken(follower, leader);
      else
        throw new Error(`Invalid arguments given for FOLLOW_CMD: ${argv.slice(1)}`);
    }
  }

  /**
   * Process an API command to set the default marching order.
   */
  function _cmdSetDefaultMarchingOrder(msg) {
    let argv = msg.content.split(' ');
    let leader = getObj('graphic', argv[1]);
    if (leader) {
      MarchingOrder.Config.setDefaultMarchingOrder(leader);
      menu(msg);
    }
    else
      throw new Error(`Leader token not found for DEFAULT_SET_CMD: ${argv.slice(1)}`);
  }

  function _cmdUnfollowAll(msg) {
    _.noop(msg);
    MarchingOrder.unfollowAll();
  }

  /**
   * Process an aPI command to use the default marching order.
   */
  function _cmdUseDefaultMarchingOrder(msg) {
    _.noop(msg);
    MarchingOrder.useDefaultMarchingOrder();
  }

  /**
   * Processes an API command to display the script's main menu.
   */
  function menu(msg) {
    let player = getObj('player', msg.playerid);
    MarchingOrder.Wizard.show(player);
  }

  // Event handler for the script's API chat commands.
  on('chat:message', msg => {
    let argv = msg.content.split(' ');
    try {
      if(argv[0] === MENU_CMD)
        menu(msg);
      else if (argv[0] === DEFAULT_SET_CMD)
        _cmdSetDefaultMarchingOrder(msg);
      else if (argv[0] === DEFAULT_USE_CMD)
        _cmdUseDefaultMarchingOrder(msg);
      else if (argv[0] === FOLLOW_CMD)
        _cmdFollow(msg);
      else if (argv[0] === STOP_ALL_CMD)
        _cmdUnfollowAll(msg);
    }
    catch(err) {
      MarchingOrder.utils.Chat.error(err);
    }
  });

  /**
   * Expose the command constants for use in other modules.
   */
  MarchingOrder.Commands = {
    DEFAULT_SET_CMD,
    DEFAULT_USE_CMD,
    FOLLOW_CMD,
    MENU_CMD,
    STOP_ALL_CMD
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
        defaultOrder: []
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
      let moState = MarchingOrder.State.getState();
      const Commands = MarchingOrder.Commands;
      const Menu = MarchingOrder.utils.Menu;

      // Menu options
      let actionsHtml = '<div style="text-align: center;">[Follow](' + Commands.FOLLOW_CMD + ' &#64;{selected|token_id} &#64;{target|token_id})</div>';

      if(playerIsGM(playerId)) {
        // Cardinal directions (GM only)
        actionsHtml += '<div style="text-align: center;">March in order:</div>';
        actionsHtml += '<div><table style="width: 100%;">';
        actionsHtml += '<tr><td></td><td>[North](' + Commands.FOLLOW_CMD + ' north)</td><td></td></tr>';
        actionsHtml += '<tr><td>[West](' + Commands.FOLLOW_CMD + ' west)</td><td></td><td>[East](' + Commands.FOLLOW_CMD + ' east)</td></tr>';
        actionsHtml += '<tr><td></td><td>[South](' + Commands.FOLLOW_CMD + ' south)</td><td></td></tr>';
        actionsHtml += '</table></div>';

        // Stop all following
        actionsHtml += '<div style="padding-top: 1em; text-align: center;">[Stop All Following](' + Commands.STOP_ALL_CMD + ')</div>';

        // Default marching order
        actionsHtml += '<div style="padding-top: 1em; text-align: center;">Default Marching Order:</div>';
        if(moState.defaultOrder.length > 0) {
          actionsHtml += '<div style="text-align: center; vertical-allign: middle;">';
          _.each(moState.defaultOrder, (item, index) => {
            actionsHtml += '<span style="display: inline-block;">';
            if(index !== 0)
              actionsHtml += ' &#9664; ';
            actionsHtml += `<img src="${item.imgsrc}" title="${item.name}" style="height: 35px; vertical-align: middle; width: 35px;"></span>`;
          });
          actionsHtml += '</div>';
          actionsHtml += '<div style="text-align: center;">[Use Default](' + Commands.DEFAULT_USE_CMD + ') [Set Default](' + Commands.DEFAULT_SET_CMD + ' &#64;{selected|token_id})</div>';
        }
        else {
          actionsHtml += '<div style="font-size: 0.8em; text-align: center;">No default order has been set.</div>';
          actionsHtml += '<div style="text-align: center;">[Set Default](' + Commands.DEFAULT_SET_CMD + ' &#64;{selected|token_id})';
        }
      }

      return new Menu('Marching Order', actionsHtml);
    }

    static show(player) {
      let menu = MarchingOrder.Wizard.getMainMenu(player);
      menu.show(player);
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
    let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
    if(parts)
      return parts[1]+'thumb'+parts[3];
    throw new Error('Only images that you have uploaded to your library ' +
      'can be used as custom status markers. ' +
      'See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions for more information.');
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
