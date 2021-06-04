/**
 * This module defines and implements the chat commands used by this script.
 */
(() => {
  'use strict';

  const SAVE_MARKER_CMD = '!CustomStatusMarkersSaveMarker';
  const SET_MARKER_CMD = '!CustomStatusMarkersSetMarker';
  const SET_MARKER_COUNT_CMD = '!CustomStatusMarkersSetCountForMarker';
  const SET_MARKER_TINT_CMD = '!CustomStatusMarkersSetTintForMarker';
  const DEL_MARKER_CMD = '!CustomStatusMarkersDelMarker';
  const CONFIRM_DEL_MARKER_CMD = '!CustomStatusMarkers_delMarkerConfirm';
  const CLEAR_STATE_CMD = '!CustomStatusMarkersClearCustomStatusMarkersState';
  const CLEAR_TOKEN_CMD = '!CustomStatusMarkersClearMarkersTokenState';
  const MENU_CMD = '!CustomStatusMarkersShowMenu';
  const CHANGE_SIZE_CMD = '!CustomStatusMarkersOptionsChangeSize';
  const CHANGE_ALIGNMENT_CMD = '!CustomStatusMarkersOptionsChangeAlignment';
  const EXPORT_STATE_CMD = '!CustomStatusMarkersExportState';
  const IMPORT_STATE_CMD = '!CustomStatusMarkersImportState';

  /**
   * Process an API command to clear the Custom Status Markers state.
   * If a token selected, then only the CSM state for that token will be cleared.
   * If the 'tokens' option is specified, then only the CSM's tokens state
   * will be cleared and its saved templates will be left intact.
   * If 'tokens' isn't specified and no token is selected, then this will
   * clear all the CSM state!
   * @param  {ChatMessage} msg
   */
  function clearState(msg) {
    let args = msg.content.split(' ');
    let confirm = args[1];
    if(confirm === 'no')
      return;

    delete state.CustomStatusMarkers;

    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.Wizard.show(player);
  }

  /**
   * Processes an API command to clear the CSM state for the selected tokens.
   */
  function clearToken(msg) {
    let tokens = _getGraphicsFromMsg(msg);
    _.each(tokens, t => {
      CustomStatusMarkers.State.clearTokenState(t);
    });
  }

  /**
   * Deletes a template for a status marker.
   */
  function delTemplate(msg) {
    let args = msg.content.split(' ');
    let statusName = args.slice(1, -1).join(' ');
    let confirm = args[args.length - 1];
    if(confirm === 'no')
      return;

    CustomStatusMarkers.Templates.delete(statusName);

    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.utils.Chat.whisper(player, 'Deleted status ' + statusName);
    CustomStatusMarkers.Wizard.show(player);
  }

  /**
   * Displays the JSON for the script's state.
   */
  function exportState(msg) {
    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.State.exportState(player);
  }

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
   * Imports the script's state from JSON.
   */
  function importState(msg) {
    let argv = msg.content.split(' ');
    let json = argv.slice(1).join(' ');

    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.State.importState(player, json);
  }

  /**
   * Processes an API command to display the list of saved custom status markers.
   */
  function menu(msg) {
    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.Wizard.show(player);
  }

  /**
   * Processes an API command to create a custom status from a selected path.
   * @param {ChatMessage} msg
   */
  function saveTemplate(msg) {
    let args = msg.content.split(' ');
    let statusName = args.slice(1).join(' ');
    if(!statusName)
      return;

    let graphic = _getGraphicsFromMsg(msg)[0];
    CustomStatusMarkers.Templates.save(statusName, graphic);

    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.utils.Chat.whisper(player, 'Created status ' + statusName);
    CustomStatusMarkers.Wizard.show(player);
  }

  /**
   * Process an API command to set the alignment of custom status markers
   * relative to their token.
   * @param {ChatMessage} msg
   */
  function setAlignment(msg) {
    let args = msg.content.split(' ');
    let alignment = args[1];
    CustomStatusMarkers.Config.setAlignment(alignment);

    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.Wizard.show(player);
  }

  /**
   * Processes an API command to change the icon size.
   * @param {ChatMessage} msg
   */
  function setIconSize(msg) {
    let args = msg.content.split(' ');
    let size = parseInt(args[1]);
    if(!isNaN(size))
      CustomStatusMarkers.Config.setIconSize(size);

    let player = getObj('player', msg.playerid);
    CustomStatusMarkers.Wizard.show(player);
  }

  /**
   * Process an API command to set a custom status to the selected tokens.
   * @param {ChatMessage} msg
   */
  function setMarker(msg) {
    let args = msg.content.split(' ');
    let statusName = args.slice(1).join(' ');

    let selectedTokens = _getGraphicsFromMsg(msg);
    _.each(selectedTokens, token => {
      CustomStatusMarkers.toggleStatusMarker(token, statusName);
    });
  }

  /**
   * Sets the count badge for a status marker on the selected tokens.
   * @param {ChatMessage} msg
   */
  function setMarkerCount(msg) {
    let args = msg.content.split(' ');
    let statusName = args.slice(1, -1).join(' ');
    let count = args[args.length - 1];

    let selectedTokens = _getGraphicsFromMsg(msg);
    _.each(selectedTokens, token => {
      CustomStatusMarkers.setStatusMarkerCount(token, statusName, count);
    });
  }

  /**
   * Sets the tint for a status marker on the selected tokens.
   * @param {ChatMessage} msg
   */
  function setMarkerTint(msg) {
    let args = msg.content.split(' ');
    let statusName = args.slice(1, -1).join(' ');
    let tint = args[args.length - 1];

    let selectedTokens = _getGraphicsFromMsg(msg);
    _.each(selectedTokens, token => {
      CustomStatusMarkers.setStatusMarkerTint(token, statusName, tint);
    });
  }


  // Event handler for the script's API chat commands.
  on('chat:message', msg => {
    let argv = msg.content.split(' ');
    try {
      if(argv[0] === SAVE_MARKER_CMD)
        saveTemplate(msg);
      else if(argv[0] === SET_MARKER_CMD)
        setMarker(msg);
      else if(argv[0] === SET_MARKER_COUNT_CMD)
        setMarkerCount(msg);
      else if(argv[0] === SET_MARKER_TINT_CMD)
        setMarkerTint(msg);
      else if(argv[0] === MENU_CMD)
        menu(msg);
      else if(argv[0] === DEL_MARKER_CMD)
        delTemplate(msg);
      else if(argv[0] === CLEAR_STATE_CMD)
        clearState(msg);
      else if(argv[0] === CLEAR_TOKEN_CMD)
        clearToken(msg);
      else if(argv[0] === CHANGE_SIZE_CMD)
        setIconSize(msg);
      else if(argv[0] === CHANGE_ALIGNMENT_CMD)
        setAlignment(msg);
      else if(argv[0] === EXPORT_STATE_CMD)
        exportState(msg);
      else if(argv[0] === IMPORT_STATE_CMD)
        importState(msg);
    }
    catch(err) {
      CustomStatusMarkers.utils.Chat.error(err);
    }
  });

  /**
   * Expose the command constants for use in other modules.
   */
  CustomStatusMarkers.Commands = {
    SAVE_MARKER_CMD,
    SET_MARKER_CMD,
    SET_MARKER_COUNT_CMD,
    SET_MARKER_TINT_CMD,
    DEL_MARKER_CMD,
    CONFIRM_DEL_MARKER_CMD,
    CLEAR_STATE_CMD,
    CLEAR_TOKEN_CMD,
    MENU_CMD,
    CHANGE_SIZE_CMD,
    CHANGE_ALIGNMENT_CMD,
    EXPORT_STATE_CMD,
    IMPORT_STATE_CMD
  };
})();
