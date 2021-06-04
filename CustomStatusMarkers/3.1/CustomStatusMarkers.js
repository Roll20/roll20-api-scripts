var CustomStatusMarkers = (() => {
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

  const PIXELS_PER_SQUARE = 70;
  const MARKER_RADIUS = PIXELS_PER_SQUARE/6;

  /**
   * A persisted template for a custom status marker.
   * @typedef {object} StatusMarkerTemplate
   * @property {string} src
   *           The URL of the marker's image.
   * @property {PathMath.BoundingBox} bbox
   *           The marker image's original bounding box.
   */

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

  const statusListeners = {
    'add': [],
    'change': [],
    'remove': []
  };

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

  class Commands {
    /**
     * Process an API command to clear the Custom Status Markers state.
     * If a token selected, then only the CSM state for that token will be cleared.
     * If the 'tokens' option is specified, then only the CSM's tokens state
     * will be cleared and its saved templates will be left intact.
     * If 'tokens' isn't specified and no token is selected, then this will
     * clear all the CSM state!
     * @param  {ChatMessage} msg
     */
    static clearState(msg) {
      let args = msg.content.split(' ');
      let confirm = args[1];
      if(confirm === 'no')
        return;

      delete state.CustomStatusMarkers;
      Menu.show(msg.playerid);
    }

    /**
     * Processes an API command to clear the CSM state for the selected tokens.
     */
    static clearToken(msg) {
      let tokens = Commands._getGraphicsFromMsg(msg);
      _.each(tokens, t => {
        clearTokenState(t);
      });
    }

    /**
     * Deletes a template for a status marker.
     */
    static delTemplate(msg) {
      let args = msg.content.split(' ');
      let statusName = args[1];
      let confirm = args[2];
      if(confirm === 'no')
        return;

      Templates.delete(statusName);
      _whisper(msg.playerid, 'Deleted status ' + statusName);
      Menu.show(msg.playerid);
    }

    /**
     * Extracts the selected graphics from a chat message.
     * @param {ChatMessage} msg
     * @return {Graphic[]}
     */
    static _getGraphicsFromMsg(msg) {
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
     * Processes an API command to display the list of saved custom status markers.
     */
    static menu(msg) {
      Menu.show(msg.playerid);
    }

    /**
     * Processes an API command to create a custom status from a selected path.
     * @param {ChatMessage} msg
     */
    static saveTemplate(msg) {
      let args = msg.content.split(' ');
      let statusName = args[1];
      if(!statusName)
        return;

      let graphic = Commands._getGraphicsFromMsg(msg)[0];
      Templates.save(statusName, graphic);

      _whisper(msg.playerid, 'Created status ' + statusName);
      Menu.show(msg.playerid);
    }

    /**
     * Processes an API command to change the icon size.
     * @param {ChatMessage} msg
     */
    static setIconSize(msg) {
      let args = msg.content.split(' ');
      let size = parseInt(args[1]);
      if(!isNaN(size))
        setIconSize(size);

      Menu.show(msg.playerid);
    }

    /**
     * Process an API command to set a custom status to the selected tokens.
     * @param {ChatMessage} msg
     */
    static setMarker(msg) {
      let args = msg.content.split(' ');
      let statusName = args[1];

      let selectedTokens = Commands._getGraphicsFromMsg(msg);
      _.each(selectedTokens, token => {
        toggleStatusMarker(token, statusName);
      });
    }

    /**
     * Sets the count badge for a status marker on the selected tokens.
     * @param {ChatMessage} msg
     */
    static setMarkerCount(msg) {
      let args = msg.content.split(' ');
      let statusName = args[1];
      let count = args[2];

      let selectedTokens = Commands._getGraphicsFromMsg(msg);
      _.each(selectedTokens, token => {
        setStatusMarkerCount(token, statusName, count);
      });
    }

    /**
     * Sets the tint for a status marker on the selected tokens.
     * @param {ChatMessage} msg
     */
    static setMarkerTint(msg) {
      let args = msg.content.split(' ');
      let statusName = args[1];
      let tint = args[2];

      let selectedTokens = Commands._getGraphicsFromMsg(msg);
      _.each(selectedTokens, token => {
        setStatusMarkerTint(token, statusName, tint);
      });
    }
  }


  /**
   * Functions for handling Custom Status Markers events.
   */
  class Events {

    /**
     * Fires an 'add' custom status markers event.
     * @param {string} event
     * @param {Graphic} token
     * @param {StatusMarker} marker
     */
    static fireAddEvent(token, marker) {
      let handlers = statusListeners['add'];
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
      let handlers = statusListeners['change'];
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
      let handlers = statusListeners['remove'];
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
  }

  /**
   * functions dealing with the chat menu interface.
   */
  class Menu {
    /**
     * Shows the menu for Custom Status Markers in the chat. This includes
     * a listing of the saved status markers
     */
    static show(playerId) {
      let csmState = getState();

      let markerNames = _.keys(csmState.templates);
      markerNames.sort();

      // List of saved markers
      let html = '';
      let listHtml = '';
      if(markerNames.length > 0) {
        listHtml = '<table style="width: 100%;">';
        _.each(markerNames, name => {
          listHtml += '<tr style="vertical-align: middle;">';

          listHtml += '<td>'
          let tpl = csmState.templates[name];
          let src = _getCleanImgsrc(tpl.src);

          listHtml += '<img src="' + src + '" style="height: 2em;"> ';
          listHtml += '<small style="display: block;">' + name + '</small>';
          listHtml += '</td>';
          listHtml += '<td title="Toggle marker on selected tokens">[Toggle](' + SET_MARKER_CMD + ' ' + name + ')</td>';
          listHtml += '<td title="Set count on selected tokens">[Count](' + SET_MARKER_COUNT_CMD + ' ' + name + ' ?{Count})</td>';
          listHtml += '<td title="Set marker tint">[🎨](' + SET_MARKER_TINT_CMD + ' ' + name + ' ?{Color})</td>';
          if(playerIsGM(playerId))
            listHtml += '<td style="text-align: right;" title="Delete marker">[❌](' + DEL_MARKER_CMD + ' ' + name + ' ?{Delete marker: Are you sure?|yes|no})</td>';
          listHtml += '</tr>';
        });
        listHtml += '</table>';
      }
      else
        listHtml = 'No custom status markers have been created yet.';
      html += Menu.showPanel('Custom Status Markers', listHtml);

      // Script settings menu (GMs only!)
      if(playerIsGM(playerId)) {
        // Options menu
        var optionsHtml = '<table style="width: 100%;">';
        optionsHtml += '<tr style="vertical-align: middle;">';
        optionsHtml += '<td>[Icon Size](' + CHANGE_SIZE_CMD + ' ?{Size in pixels})</td>';
        optionsHtml += '<td>' + getIconSize() + '</td>';
        optionsHtml += '<tr>';
        optionsHtml += '<table>';
        html += Menu.showPanel('Options', optionsHtml);

        // Menu option - Save
        var actionsHtml = '<div style="text-align: center;">[New status marker](' + SAVE_MARKER_CMD + ' ?{Save marker: Name})</div>';
        actionsHtml += '<div style="text-align: center;">[Remove token markers](' + CLEAR_TOKEN_CMD + ')</div>'
        actionsHtml += '<div style="text-align: center;">[Clear State](' + CLEAR_STATE_CMD + ' ?{Are you sure? This will erase all your custom status markers.|yes|no})</div>';
        html += Menu.showPanel('Menu Actions', actionsHtml);
      }

      _whisper(playerId, html);
    }

    /**
     * Displays HTML content in a bordered panel.
     */
    static showPanel(header, content) {
      let html = '<div style="background: #fff; border: solid 1px #000; border-radius: 5px; font-weight: bold; margin-bottom: 1em; overflow: hidden;">';
      html += '<div style="background: #000; color: #fff; text-align: center;">' + header + '</div>';
      html += '<div style="padding: 5px;">' + content + '</div>';
      html += '</div>';
      return html;
    }
  }

  /**
   * Static methods for persisting custom status marker templates.
   */
  class Templates {

    /**
     * Deletes a custom status marker template.
     * @param  {string}   statusName
     */
    static delete(statusName) {
      let csmState = getState();
      delete csmState.templates[statusName];
    }

    /**
     * Loads a StatusMarkerTemplate from the module state.
     * @param  {String}   statusName
     */
    static get(statusName) {
      let csmState = getState();
      return csmState.templates[statusName];
    }

    /**
     * Persists a custom status marker.
     * @param {String} statusName
     * @param {Graphic} icon
     */
    static save(statusName, icon) {
      let csmState = getState();
      let bbox = _getGraphicBoundingBox(icon);
      let src = _getCleanImgsrc(icon.get('imgsrc'));

      csmState.templates[statusName] = { bbox, src };
    }
  }


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
    let statusMarker = { statusName, iconId, tokenId }

    let tokenState = _getTokenState(token);
    tokenState.customStatuses[statusName] = statusMarker;

    // Alert event listeners.
    if(!silent)
      Events.fireAddEvent(token, statusMarker);

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
    let iconSize = getIconSize();
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
    let iconSize = getIconSize();

    //return (statusMarkers.length + index) * iconSize;
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
    //return top + MARKER_RADIUS - (getIconSize()-MARKER_RADIUS);
    return top - getIconSize()/2;
   }

  /**
   * Clears the Custom Status Markers state for a particular token.
   * @param  {Graphic} token
   */
  function clearTokenState(token) {
    removeStatusMarkers(token);

    let csmState = getState();
    let tokenId = token.get('_id');
    delete csmState.tokens[tokenId];
  }

  /**
   * Creates an instance of a status marker and assign it to a token.
   * @private
   * @param {Graphic} token
   * @param {String} name
   */
  function _createStatusMarkerIcon(token, name) {
    let template = Templates.get(name);
    let pageId = token.get('_pageid');
    let tokenId = token.get('_id');

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
    let template = Templates.get(name);
    let page = token.get('_pageid');
    let tokenId = token.get('_id');

    let statusMarker = _getStatusMarker(token, name);
    if(statusMarker.textId) {
      // If the text object for the badge already exists, just update it.
      let text = getObj('text', statusMarker.textId);
      text.set('text', count);
    }
    else {
      // Otherwise, create a new text object for it.
      let text = createObj('text', {
        _pageid: page,
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
   * Reports an error.
   * @private
   * @param {Error} err
   */
  function _error(err) {
    sendChat('Custom Status Markers Error', err.message);
    log('Custom Status Markers ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * Cookbook.getCleanImgsrc
   * https://wiki.roll20.net/API:Cookbook#getCleanImgsrc
   */
  function _getCleanImgsrc(imgsrc) {
    let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
    if(parts)
      return parts[1]+'thumb'+parts[3];
    throw new Error('Only images that you have uploaded to your library ' +
      'can be used as custom status markers. ' +
      'See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions for more information.');
  }

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
   * Gets the configured diameter for status marker icons.
   * @return {int}
   */
  function getIconSize() {
    let options = getOptions();
    return options.iconSize || MARKER_RADIUS*2;
  }

  /**
   * Gets the script's configured options.
   * @return {Object}
   */
  function getOptions() {
    let scriptState = getState();
    if(!scriptState.options)
      scriptState.options = {};
    return scriptState.options;
  }

  /**
   * Returns this module's object for the Roll20 API state.
   * @return {Object}
   */
  function getState() {
    if(!state.CustomStatusMarkers)
      state.CustomStatusMarkers = {
        tokens: {},
        templates: {},
        options: {}
      };

    return state.CustomStatusMarkers;
  }

  /**
   * Gets the names of all the custom status markers on a token.
   * @param {Graphic} token
   * @return {string[]}
   */
  function getStatusMarkers(token) {
    let tokenState = _getTokenState(token);
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
    let iconSize = getIconSize();
    return iconSize/length;
  }

  /**
   * Returns the Custom Status Markers state for a token.
   * @private
   * @param  {Graphic} token
   * @param {boolean} [createBlank: true] If the token state doesn't exist, create it.
   * @return {Object}
   */
  function _getTokenState(token, createBlank) {
    if(createBlank === undefined)
      createBlank = true;

    let csmState = getState();
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
   * Returns the state of a status marker on a token.
   * @private
   * @param {Graphic} token
   * @param {string} statusName
   * @return {StatusMarker}
   */
  function _getStatusMarker(token, statusName) {
    let tokenState = _getTokenState(token, false);
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
    let tokenState = _getTokenState(token, false);
    if(tokenState)
      return tokenState.customStatuses[statusName];
    return false;
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

    let tokenState = _getTokenState(token, false);
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
        Events.fireRemoveEvent(token, statusMarker);
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

    let tokenState = _getTokenState(token, false);
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

    let tokenState = _getTokenState(token, false);
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
   * Changes the size of the status markers.
   * @param {int} size
   */
  function setIconSize(size) {
    log('Custom Status Markers: Changing size of status marker icons to ' + size);

    let scriptState = getState();
    let options = getOptions();
    options.iconSize = size;

    // Resize and reposition all the status markers.
    _.each(scriptState.tokens, (tokenData, tokenId) => {
      let token = getObj('graphic', tokenId);
      if(token) {
        _.each(tokenData.customStatuses, (statusData, statusName) => {
          let template = Templates.get(statusName);
          let marker = getObj('graphic', statusData.iconId);

          if(marker) {
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
      Events.fireChangeEvent(token, statusMarker);
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

    if(tint !== 'transparent' || !tint.startsWith('#'))
      tint = COLORS[tint];
    if(tint === undefined)
      tint = 'transparent';

    let icon = getObj('graphic', statusMarker.iconId);
    icon.set('tint_color', tint);
    statusMarker.tint = tint;
    if(!silent)
      Events.fireChangeEvent(token, statusMarker);
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

  /**
   * @private
   * Whispers a Custom Status Markers message to someone.
   */
  function _whisper(playerId, msg) {
    // var name = who.replace(/\(GM\)/, '').trim();
    const name = (getObj('player', playerId)||{get:()=>'API'}).get('_displayname');
    sendChat('Custom Status Markers', '/w "' + name + '" ' + msg);
  }


  // Event handler for the script's API chat commands.
  on('chat:message', msg => {
    try {
      if(msg.content.startsWith(SAVE_MARKER_CMD))
        Commands.saveTemplate(msg);
      else if(msg.content.startsWith(SET_MARKER_CMD))
        Commands.setMarker(msg);
      else if(msg.content.startsWith(SET_MARKER_COUNT_CMD))
        Commands.setMarkerCount(msg);
      else if(msg.content.startsWith(SET_MARKER_TINT_CMD))
        Commands.setMarkerTint(msg);
      else if(msg.content.startsWith(MENU_CMD))
        Commands.menu(msg);
      else if(msg.content.startsWith(DEL_MARKER_CMD))
        Commands.delTemplate(msg);
      else if(msg.content.startsWith(CLEAR_STATE_CMD))
        Commands.clearState(msg);
      else if(msg.content.startsWith(CLEAR_TOKEN_CMD))
        Commands.clearToken(msg);
      else if(msg.content.startsWith(CHANGE_SIZE_CMD))
        Commands.setIconSize(msg);
    }
    catch(err) {
      _error(err);
    }
  });

  // Event handler for moving custom status markers with their tokens when
  // they are moved.
  on('change:graphic', graphic => {
    try {
      repositionStatusMarkers(graphic);
    }
    catch(err) {
      _error(err);
    }
  });

  // Event handler for destroying a token's custom status markers when the
  // token is destroyed.
  on('destroy:graphic', graphic => {
    try {
      removeStatusMarkers(graphic);
    }
    catch(err) {
      _error(err);
    }
  });

  // When the API is loaded, install the Custom Status Marker menu macro
  // if it isn't already installed.
  on('ready', () => {
    let players = findObjs({
      _type: 'player'
    });

    // Create the macro, or update the players' old macro if they already have it.
    _.each(players, player => {
      let macro = findObjs({
        _type: 'macro',
        _playerid: player.get('_id'),
        name: 'CustomStatusMarkersMenu'
      })[0];

      if(macro)
        macro.set('action', MENU_CMD);
      else {
        createObj('macro', {
          _playerid: player.get('_id'),
          name: 'CustomStatusMarkersMenu',
          action: MENU_CMD
        });
      }
    });

    log('--- Initialized Custom Status Markers ---');
  });

  return {
    Templates,
    addStatusMarker,
    clearTokenState,
    deleteTemplate: Templates.delete,
    getState,
    getStatusMarkers,
    getTemplate: Templates.get,
    hasStatusMarker,
    on: Events.on,
    removeStatusMarker,
    removeStatusMarkers,
    repositionStatusMarkers,
    saveTemplate: Templates.save,
    setStatusMarkerCount,
    setStatusMarkerTint,
    toggleStatusMarker,
    un: Events.un
  };
})();
