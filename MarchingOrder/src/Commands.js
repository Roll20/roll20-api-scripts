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
