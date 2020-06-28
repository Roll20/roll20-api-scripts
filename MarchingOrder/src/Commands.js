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
