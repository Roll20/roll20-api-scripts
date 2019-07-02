var CustomStatusMarkers = (() => {
  'use strict';

  const PIXELS_PER_SQUARE = 70;
  const MARKER_RADIUS = PIXELS_PER_SQUARE/6;

  /**
   * A rendered custom status marker with an optional number badge.
   * @typedef {object} StatusMarker
   * @property {string} name
   *           The name of the status.
   * @property {uuid} iconId
   *           The _id of the marker's Graphic.
   * @property {uuid} [textId]
   *           The _id of the Text object for the marker's number badge.
   *           If omitted, then the marker has no badge.
   * @property {uuid} tokenId
   *           The _id of the token the marker is assigned to.
   * @property {int} [count]
   *           The displayed count for the badge.
   * @property {string} [tint]
   *           A tint color to apply to the status marker.
   */

  const COLORS = {
    black: '#000000',
    blue: '#0000FF',
    cyan: '#00FFFF',
    gray: '#888888',
    green: '#00FF00',
    grey: '#888888',
    pink: '#FF00FF',
    red: '#FF0000',
    white: '#FFFFFF',
    yellow: '#FFFF00'
  };

  /**
   * Adds a custom status marker to a token, with an optional count badge.
   * @param  {Graphic} token
   * @param  {String} statusName
   * @param {boolean} [silent=false]
   * @fires add
   */
  function addStatusMarker(token, statusName, silent) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
      return;

    if(_getStatusMarker(token, statusName))
      removeStatusMarker(token, statusName, silent);

    let icon = _createStatusMarkerIcon(token, statusName);
    let iconId = icon.get('_id');
    let tokenId = token.get('_id');
    let statusMarker = { statusName, iconId, tokenId };

    let tokenState = CustomStatusMarkers.State.getTokenState(token);
    tokenState.customStatuses[statusName] = statusMarker;

    // Alert event listeners.
    if(!silent)
      CustomStatusMarkers.Events.fireAddEvent(token, statusMarker);

    repositionStatusMarkers(token);
    return statusMarker;
  }

  /**
   * Calculates the left property for a status marker to be placed on a token.
   * @private
   * @param  {Graphic} token
   * @param  {int} index
   * @return {number}
   */
  function _calcStatusMarkerLeft(token, index) {
    let leftOffset = _calcStatusMarkerOffset(token, index);
    let right = token.get('left') + token.get('width')/2;
    let iconSize = CustomStatusMarkers.Config.getIconSize();
    return right - iconSize/2 - leftOffset;
  }

  /**
   * Calculates the left-offset for a StatusMarker on a token.
   * @private
   * @param {Graphic} token
   * @param {int} index
   */
  function _calcStatusMarkerOffset(token, index) {
    let statusMarkers = token.get('statusmarkers');
    if(statusMarkers)
      statusMarkers = statusMarkers.split(',');
    else
      statusMarkers = [];
    let iconSize = CustomStatusMarkers.Config.getIconSize();

    // Get the appropriate offset for the configured alignment.
    let alignment = CustomStatusMarkers.Config.getAlignment();
    if(alignment === 'inline')
      return (statusMarkers.length * MARKER_RADIUS * 2) + (index * iconSize);
    else
      return index*iconSize;
  }

  /**
   * Calculates the top property of a status marker to be placed on a token.
   * @private
   * @param  {Graphic} token
   * @return {number}
   */
  function _calcStatusMarkerTop(token) {
    let top = token.get('top') - token.get('height')/2;

    let alignment = CustomStatusMarkers.Config.getAlignment();
    if(alignment === 'inline')
      return top + MARKER_RADIUS;
    else
      return top - CustomStatusMarkers.Config.getIconSize()/2;
   }

  /**
   * Creates an instance of a status marker and assign it to a token.
   * @private
   * @param {Graphic} token
   * @param {String} name
   */
  function _createStatusMarkerIcon(token, name) {
    let template = CustomStatusMarkers.Templates.get(name);
    let pageId = token.get('_pageid');

    // Create the icon.
    let width = template.bbox.width;
    let height = template.bbox.height;
    let scale = _getStatusMarkerIconScale(width, height);
    let icon = createObj('graphic', {
      _pageid: pageId,
      name: 'CUSTOM_STATUS_MARKER',
      imgsrc: template.src,
      layer: 'objects',
      left: -9999,
      top: -9999,
      width: width*scale,
      height: height*scale
    });
    toFront(icon);
    return icon;
  }

  /**
   * Creates or updates the badge for a status marker.
   * @private
   * @param {Graphic} token
   * @param {String} name
   * @param {int} count
   */
  function _createStatusMarkerBadge(token, name, count) {
    let pageId = token.get('_pageid');

    let statusMarker = _getStatusMarker(token, name);
    if(statusMarker.textId) {
      // If the text object for the badge already exists, just update it.
      let text = getObj('text', statusMarker.textId);
      text.set('text', count);
    }
    else {
      // Otherwise, create a new text object for it.
      let text = createObj('text', {
        _pageid: pageId,
        layer: 'objects',
        color: '#f00',
        text: count,
        left: -9999,
        top: -9999
      });
      toFront(text);
      repositionStatusMarkers(token);

      statusMarker.textId = text.get('_id');
    }
    statusMarker.count = count;
    return statusMarker;
  }

  /**
   * Gets the names of all the custom status markers on a token.
   * @param {Graphic} token
   * @return {string[]}
   */
  function getStatusMarkers(token) {
    let tokenState = CustomStatusMarkers.State.getTokenState(token);
    if(token)
      return _.keys(tokenState.customStatuses);
    return [];
  }

  /**
   * Returns the scale for a status marker's icon.
   * @private
   * @param {number} width
   * @param {number} height
   * @return {number}
   */
  function _getStatusMarkerIconScale(width, height) {
    let length = Math.max(width, height);
    let iconSize = CustomStatusMarkers.Config.getIconSize();
    return iconSize/length;
  }

  /**
   * Returns the state of a status marker on a token.
   * @private
   * @param {Graphic} token
   * @param {string} statusName
   * @return {StatusMarker}
   */
  function _getStatusMarker(token, statusName) {
    let tokenState = CustomStatusMarkers.State.getTokenState(token, false);
    if(tokenState)
      return tokenState.customStatuses[statusName];
  }

  /**
   * Checks if a token has the custom status marker with the specified name.
   * @param {graphic} token
   * @param {string} statusName
   * @return {boolean}
   *         True iff the token has the custom status marker active.
   */
  function hasStatusMarker(token, statusName) {
    let tokenState = CustomStatusMarkers.State.getTokenState(token, false);
    if(tokenState)
      return tokenState.customStatuses[statusName];
    return false;
  }

  /**
   * Refreshes the size and position of all the status marker tokens.
   */
  function refreshSizeAndPositioning() {
    let scriptState = CustomStatusMarkers.State.getState();

    // Resize and reposition all the status markers.
    _.each(scriptState.tokens, (tokenData, tokenId) => {
      let token = getObj('graphic', tokenId);
      if(token) {
        _.each(tokenData.customStatuses, (statusData, statusName) => {
          let marker = getObj('graphic', statusData.iconId);
          if(marker) {
            let template = CustomStatusMarkers.Templates.get(statusName);

            let width = template.bbox.width;
            let height = template.bbox.height;
            let scale = _getStatusMarkerIconScale(width, height);

            marker.set('width', width*scale);
            marker.set('height', height*scale);
          }
        });

        repositionStatusMarkers(token);
      }
    });
  }

  /**
   * Deletes a custom status marker from a token.
   * @param {Graphic} token
   * @param {String} statusName
   * @param {boolean} [silent=false]
   *        If true, events won't be fired.
   * @fires change
   * @fires remove
   */
  function removeStatusMarker(token, statusName, silent) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
       return;

    let tokenState = CustomStatusMarkers.State.getTokenState(token, false);
    if(tokenState) {
      let statusMarker = tokenState.customStatuses[statusName];
      if(!statusMarker)
        return;

      let icon = getObj('graphic', statusMarker.iconId);
      if(icon)
        icon.remove();

      let text = getObj('text', statusMarker.textId);
      if(text)
        text.remove();

      delete tokenState.customStatuses[statusName];
      repositionStatusMarkers(token);

      // Notify event listeners.
      if(!silent)
        CustomStatusMarkers.Events.fireRemoveEvent(token, statusMarker);
    }
  }

  /**
   * Removes all custom status markers from a token.
   * @param {Graphic} token
   * @param {boolean} [silent=false]
   *        If true, events won't be fired.
   */
  function removeStatusMarkers(token, silent) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
       return;

    let tokenState = CustomStatusMarkers.State.getTokenState(token, false);
    if(tokenState) {
      _.each(tokenState.customStatuses, (statusMarker, statusName) => {
        removeStatusMarker(token, statusName, silent);
      });
    }
  }

  /**
   * Moves a status marker to its token's current position.
   * @private
   * @param  {Graphic} token
   * @param  {Object} statusMarker
   * @param  {int} index
   * @throws {Error}
   *         An error is thrown if the marker's expected graphic and badge
   *         are not present. (e.g. someone deleted them)
   */
  function _repositionTokenStatusMarker(token, statusMarker, index) {
    let left = _calcStatusMarkerLeft(token, index);
    let top = _calcStatusMarkerTop(token);

    // Move the icon.
    let icon = getObj('graphic', statusMarker.iconId);
    if(!icon)
      throw new Error('Icon ' + statusMarker.iconId + ' is missing.');

    icon.set('left', left);
    icon.set('top', top);
    toFront(icon);

    // Move the badge, if the icon marker has one.
    if(statusMarker.textId) {
      let text = getObj('text', statusMarker.textId);
      if(!text)
        throw new Error('Text ' + statusMarker.textId + ' is missing.');

      text.set('left', left + PIXELS_PER_SQUARE/8);
      text.set('top', top + PIXELS_PER_SQUARE/8);
      toFront(text);
    }
  }

  /**
   * Moves a token's custom status markers to their correct positions.
   * @param {Graphic} token
   */
  function repositionStatusMarkers(token) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
       return;

    let tokenState = CustomStatusMarkers.State.getTokenState(token, false);
    if(tokenState) {
      let index = 0;

      _.each(tokenState.customStatuses, (statusMarker, statusName) => {
        try {
          _repositionTokenStatusMarker(token, statusMarker, index);
        }
        catch(err) {
          // If there was an error while moving the marker (e.g.
          // Someone deleted its graphic instead of unsetting it),
          // then remove the status from the token's state and
          // log a warning.
          delete tokenState.customStatuses[statusName];
          log('Custom Status Markers [WARN]: ' + err.message);
        }
        index++;
      });
    }
  }



  /**
   * Sets the count badge for a status marker.
   * @param  {Graphic} token
   * @param  {string} statusName
   * @param {string} count
   * @param {boolean} [silent=false]
   * @fires change
   */
  function setStatusMarkerCount(token, statusName, count, silent) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
       return;

    let statusMarker = _getStatusMarker(token, statusName);
    if(!statusMarker)
      addStatusMarker(token, statusName, silent);

    statusMarker = _createStatusMarkerBadge(token, statusName, count);
    repositionStatusMarkers(token);
    if(!silent)
      CustomStatusMarkers.Events.fireChangeEvent(token, statusMarker);
  }

  /**
   * Sets the tint on a status marker's icon.
   * @param  {Graphic} token
   * @param  {string} statusName
   * @param {string} tint
   * @param {boolean} [silent=false]
   * @fires change
   */
  function setStatusMarkerTint(token, statusName, tint, silent) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
       return;

    let statusMarker = _getStatusMarker(token, statusName);
    if(!statusMarker)
      statusMarker = addStatusMarker(token, statusName, silent);

    if(tint !== 'transparent' && !tint.startsWith('#'))
      tint = COLORS[tint];
    if(tint === undefined)
      tint = 'transparent';

    let icon = getObj('graphic', statusMarker.iconId);
    icon.set('tint_color', tint);
    statusMarker.tint = tint;
    if(!silent)
      CustomStatusMarkers.Events.fireChangeEvent(token, statusMarker);
  }

  /**
   * Toggles a custom status marker on a token, with an optional count badge.
   * @param  {Graphic} token
   * @param  {String} statusName
   * @param {boolean} [silent=false]
   */
  function toggleStatusMarker(token, statusName, silent) {
    // Don't continue if the token is a status marker.
    if(token.get('name').startsWith('CUSTOM_STATUS_MARKER'))
      return;

    if(_getStatusMarker(token, statusName))
      removeStatusMarker(token, statusName, silent);
    else
      addStatusMarker(token, statusName, silent);
  }

  // Event handler for moving custom status markers with their tokens when
  // they are moved.
  on('change:graphic', graphic => {
    try {
      repositionStatusMarkers(graphic);
    }
    catch(err) {
      CustomStatusMarkers.utils.Chat.error(err);
    }
  });

  // Event handler for destroying a token's custom status markers when the
  // token is destroyed.
  on('destroy:graphic', graphic => {
    try {
      removeStatusMarkers(graphic);
    }
    catch(err) {
      CustomStatusMarkers.utils.Chat.error(err);
    }
  });

  // When the API is loaded, install the Custom Status Marker menu macro
  // if it isn't already installed.
  on('ready', () => {
    CustomStatusMarkers.Macros.installMacros();
    log('--- Initialized Custom Status Markers v3.3.1 ---');
  });

  return {
    MARKER_RADIUS,
    addStatusMarker,
    getStatusMarkers,
    hasStatusMarker,
    refreshSizeAndPositioning,
    removeStatusMarker,
    removeStatusMarkers,
    repositionStatusMarkers,
    setStatusMarkerCount,
    setStatusMarkerTint,
    toggleStatusMarker,
  };
})();

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

(() => {
  'use strict';

  /**
   * Module for global script configurations.
   */
  CustomStatusMarkers.Config = class {
    /**
     * Gets the configured alignment for status marker icons.
     * @return {string}
     */
    static getAlignment() {
      let options = CustomStatusMarkers.State.getOptions();
      return options.alignment || 'above';
    }

    /**
     * Gets the configured diameter for status marker icons.
     * @return {int}
     */
    static getIconSize() {
      let options = CustomStatusMarkers.State.getOptions();
      return options.iconSize || CustomStatusMarkers.MARKER_RADIUS*2;
    }

    /**
     * Changes the alignment of status markers relative to their tokens.
     * @param {string} alignment
     */
    static setAlignment(alignment) {
      let options = CustomStatusMarkers.State.getOptions();
      options.alignment = alignment;

      CustomStatusMarkers.refreshSizeAndPositioning();
    }

    /**
     * Changes the size of the status markers.
     * @param {int} size
     */
    static setIconSize(size) {
      let options = CustomStatusMarkers.State.getOptions();
      options.iconSize = size;

      CustomStatusMarkers.refreshSizeAndPositioning();
    }
  };
})();

(() => {
  'use strict';

  const statusListeners = {
    'add': [],
    'change': [],
    'remove': []
  };

  /**
   * Functions for handling Custom Status Markers events.
   */
  CustomStatusMarkers.Events = class {
    /**
     * Fires an 'add' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireAddEvent(token, marker) {
      let handlers = statusListeners.add;
      _.each(handlers, handler => {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Fires a 'change' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireChangeEvent(token, marker) {
      let handlers = statusListeners.change;
      _.each(handlers, handler => {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Fires a 'remove' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireRemoveEvent(token, marker) {
      let handlers = statusListeners.remove;
      _.each(handlers, handler => {
        handler(token, _.clone(marker));
      });
    }

    /**
     * Registers a Custom Status Markers event handler.
     * Each handler takes a token and a StatusMarker as parameters.
     * The following events are supported: 'add', 'change', 'remove'
     * @param {string} event
     * @param {function} handler
     */
    static on(event, handler) {
      if(statusListeners[event])
        statusListeners[event].push(handler);
    }

    /**
     * Removes a custom status marker event handler.
     * @param {string} event
     * @param {function} handler
     */
    static un(event, handler) {
      let handlers = statusListeners[event];
      if(handlers) {
        let index = handlers.indexOf(handler);
        if(index !== -1)
          handlers.splice(index, 1);
      }
    }
  };
})();

(() => {
  'use strict';

  /**
   * Gets a macro prompt for the user to choose from the list of saved
   * custom status markers.
   * @return {string}
   */
  function _getEffectNamePrompt() {
    let csmState = CustomStatusMarkers.State.getState();
    let names = _.keys(csmState.templates);
    names.sort();
    return `?{Which custom status marker?|${names.join('|')}}`;
  }

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
  CustomStatusMarkers.Macros = class {


    /**
     * Installs/updates the macros for this script.
     */
    static installMacros() {
      let players = findObjs({
        _type: 'player'
      });

      const Commands = CustomStatusMarkers.Commands;

      // Create the macro, or update the players' old macro if they already have it.
      _.each(players, player => {
        _installMacro(player, 'CustomStatusMarkersMenu', Commands.MENU_CMD);
        _installMacro(player, 'CustomStatusMarkersToggle', Commands.SET_MARKER_CMD + ' ' + _getEffectNamePrompt());
        _installMacro(player, 'CustomStatusMarkersToggleCount', Commands.SET_MARKER_COUNT_CMD + ' ' + _getEffectNamePrompt() + ' ?{count}');
        _installMacro(player, 'CustomStatusMarkersToggleTint', Commands.SET_MARKER_TINT_CMD + ' ' + _getEffectNamePrompt() + ' ?{color}');
      });
    }
  };
})();

(() => {
  'use strict';

  /**
   * This module provides an interface to the script's state.
   */
  CustomStatusMarkers.State = class {
    /**
     * Clears the Custom Status Markers state for a particular token.
     * @param  {Graphic} token
     */
    static clearTokenState(token) {
      CustomStatusMarkers.removeStatusMarkers(token);

      let csmState = CustomStatusMarkers.State.getState();
      let tokenId = token.get('_id');
      delete csmState.tokens[tokenId];
    }

    /**
     * Displays the JSONified state for this script to the chat.
     * @param {Player} player
     * @return {string}
     */
    static exportState(player) {
      let json = CustomStatusMarkers.State.jsonifyState();
      let content = `<div>Below is the JSON for this script's state. Copy-paste it to import it to another campaign.</div>` +
        `<pre>${json}</pre>`;

      let menu = new CustomStatusMarkers.utils.Menu('Export Custom Status Markers', content);
      menu.show(player);
      return json;
    }

    /**
     * Gets the script's configured options.
     * @return {Object}
     */
    static getOptions() {
      let scriptState = CustomStatusMarkers.State.getState();
      if(!scriptState.options)
        scriptState.options = {};
      return scriptState.options;
    }

    /**
     * Returns this module's object for the Roll20 API state.
     * @return {Object}
     */
    static getState() {
      if(!state.CustomStatusMarkers)
        state.CustomStatusMarkers = {
          tokens: {},
          templates: {},
          options: {}
        };

      return state.CustomStatusMarkers;
    }

    /**
     * Returns the Custom Status Markers state for a token.
     * @param  {Graphic} token
     * @param {boolean} [createBlank: true] If the token state doesn't exist, create it.
     * @return {Object}
     */
    static getTokenState(token, createBlank) {
      if(createBlank === undefined)
        createBlank = true;

      let csmState = CustomStatusMarkers.State.getState();
      let tokenId = token.get('_id');
      let tokenState = csmState.tokens[tokenId];

      if(!tokenState && createBlank) {
        tokenState = csmState.tokens[tokenId] = {
          customStatuses: {}
        };
      }
      return tokenState;
    }

    /**
     * Imports the state for this script from JSON.
     * @param {Player} player
     * @param {string} json
     */
    static importState(player, json) {
      let scriptState = CustomStatusMarkers.State.getState();
      _.extend(scriptState, JSON.parse(json));

      CustomStatusMarkers.Wizard.show(player);
    }

    /**
     * Gets the JSON string for this script's state.
     * @return {string}
     */
    static jsonifyState() {
      let scriptState = CustomStatusMarkers.State.getState();
      return JSON.stringify(scriptState);
    }
  };
})();

(() => {
  'use strict';

  /**
   * A persisted template for a custom status marker.
   * @typedef {object} StatusMarkerTemplate
   * @property {string} src
   *           The URL of the marker's image.
   * @property {PathMath.BoundingBox} bbox
   *           The marker image's original bounding box.
   */

  /**
   * Gets the BoundingBox of a Graphic.
   * @private
   * @param {Graphic} graphic
   * @return {PathMath.BoundingBox}
   */
  function _getGraphicBoundingBox(graphic) {
    let left = graphic.get('left');
    let top = graphic.get('top');
    let width = graphic.get('width');
    let height = graphic.get('height');
    return new PathMath.BoundingBox(left, top, width, height);
  }

  /**
   * Static methods for persisting custom status marker templates.
   */
  CustomStatusMarkers.Templates = class {

    /**
     * Deletes a custom status marker template.
     * @param  {string}   statusName
     */
    static delete(statusName) {
      let csmState = CustomStatusMarkers.State.getState();
      delete csmState.templates[statusName];
    }

    /**
     * Loads a StatusMarkerTemplate from the module state.
     * @param  {String}   statusName
     * @return {StatusMarkerTemplate}
     */
    static get(statusName) {
      let csmState = CustomStatusMarkers.State.getState();
      return csmState.templates[statusName];
    }

    /**
     * Persists a custom status marker.
     * @param {String} statusName
     * @param {Graphic} icon
     */
    static save(statusName, icon) {
      let csmState = CustomStatusMarkers.State.getState();
      let bbox = _getGraphicBoundingBox(icon);
      let src = CustomStatusMarkers.utils.getCleanImgsrc(icon.get('imgsrc'));

      csmState.templates[statusName] = { bbox, src };
    }
  };
})();

(() => {
  'use strict';

  /**
   * functions dealing with the chat menu interface.
   */
  CustomStatusMarkers.Wizard = class {
    /**
     * Produces a menu panel for GM-only actions.
     */
    static getGMActionsMenu() {
      const Commands = CustomStatusMarkers.Commands;
      const Menu = CustomStatusMarkers.utils.Menu;

      var actionsHtml = '<div style="text-align: center;">[New status marker](' + Commands.SAVE_MARKER_CMD + ' ?{Save marker: Name})</div>';
      actionsHtml += '<div style="text-align: center;">[Remove token markers](' + Commands.CLEAR_TOKEN_CMD + ')</div>';
      actionsHtml += '<div style="text-align: center;">[&#9167; Export State](' + Commands.EXPORT_STATE_CMD + ')</div>';
      actionsHtml += '<div style="text-align: center;">[&#9888; Import State](' + Commands.IMPORT_STATE_CMD + ' ?{Paste exported state JSON here:})</div>';
      actionsHtml += '<div style="text-align: center;">[Clear State](' + Commands.CLEAR_STATE_CMD + ' ?{Are you sure? This will erase all your custom status markers.|yes|no})</div>';
      return new Menu('Menu Actions', actionsHtml);
    }

    /**
     * Produces a menu panel for GM-only script configurations.
     */
    static getGMOptionsMenu() {
      const Commands = CustomStatusMarkers.Commands;
      const Config = CustomStatusMarkers.Config;
      const Menu = CustomStatusMarkers.utils.Menu;

      var optionsHtml = '<table style="width: 100%;">' +
          '<tr style="vertical-align: middle;">' +
            '<td>[Icon Size](' + Commands.CHANGE_SIZE_CMD + ' ?{Size in pixels})</td>' +
            '<td>' + Config.getIconSize() + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>[Icon Alignment](' + Commands.CHANGE_ALIGNMENT_CMD + ' ?{Icon Alignment:|above|inline})</td>' +
            '<td>' + Config.getAlignment() + '</td>' +
          '</tr>' +
        '</table>';
      return new Menu('Options', optionsHtml);
    }

    /**
     * Produces a menu panel showing a list of the available custom status markers
     * and their action buttons.
     */
    static getListingMenu(player) {
      let playerId = player.get('_id');
      let csmState = CustomStatusMarkers.State.getState();
      const Commands = CustomStatusMarkers.Commands;
      const Menu = CustomStatusMarkers.utils.Menu;

      let markerNames = _.keys(csmState.templates);
      markerNames.sort();

      // List of saved markers
      let listHtml = '';
      if(markerNames.length > 0) {
        listHtml = '<table style="width: 100%;">';
        _.each(markerNames, name => {
          listHtml += '<tr style="vertical-align: middle;">';

          listHtml += '<td>';
          let tpl = csmState.templates[name];
          let src = CustomStatusMarkers.utils.getCleanImgsrc(tpl.src);

          listHtml += '<img src="' + src + '" style="height: 3em;"> ';
          listHtml += '<small style="display: block; max-width: 70px;">' + name + '</small>';
          listHtml += '</td>';
          listHtml += '<td title="Toggle marker on selected tokens">[Toggle](' + Commands.SET_MARKER_CMD + ' ' + name + ')</td>';
          listHtml += '<td title="Set count on selected tokens">[#](' + Commands.SET_MARKER_COUNT_CMD + ' ' + name + ' ?{Count})</td>';
          listHtml += '<td title="Set marker tint">[&#127752;](' + Commands.SET_MARKER_TINT_CMD + ' ' + name + ' ?{Color})</td>';

          // Only GMs get a Delete button.
          if(playerIsGM(playerId))
            listHtml += '<td style="text-align: right;" title="Delete marker">[&#10060;](' + Commands.DEL_MARKER_CMD + ' ' + name + ' ?{Delete marker: Are you sure?|yes|no})</td>';
          listHtml += '</tr>';
        });
        listHtml += '</table>';
      }
      else
        listHtml = 'No custom status markers have been created yet.';
      return new Menu('Custom Status Markers', listHtml);
    }

    /**
     * Shows the menu for Custom Status Markers in the chat. This includes
     * a listing of the saved status markers
     */
    static show(player) {
      let playerId = player.get('_id');

      // Status markers listing (for everyone)
      let listingMenu = CustomStatusMarkers.Wizard.getListingMenu(player);
      let html = listingMenu.html;

      // Script settings menu (GMs only!)
      if(playerIsGM(playerId)) {
        let optionsMenu = CustomStatusMarkers.Wizard.getGMOptionsMenu();
        let actionsMenu = CustomStatusMarkers.Wizard.getGMActionsMenu();
        html += optionsMenu.html + actionsMenu.html;
      }

      // Render the wizard in the chat.
      CustomStatusMarkers.utils.Chat.whisper(player, html);
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

  CustomStatusMarkers.utils = {
    getCleanImgsrc
  };
})();

(() => {
  'use strict';

  const FROM_NAME = 'CustomStatusMarkers';

  /**
   * This module provides chat-related functions.
   */
  CustomStatusMarkers.utils.Chat = class {
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
      log(`CustomStatusMarkers ERROR: ${err.message}`);
      log(err.stack);
      CustomStatusMarkers.utils.Chat.whisperGM(
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
      let cleanName = CustomStatusMarkers.utils.Chat.fixWho(name);
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
  CustomStatusMarkers.utils.Menu = class {
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
      CustomStatusMarkers.utils.Chat.whisper(player, this.html);
    }
  };
})();
