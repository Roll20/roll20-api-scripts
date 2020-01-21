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

  function deprecationNotice() {
    let scriptState = CustomStatusMarkers.State.getState();

    if (!scriptState._showedDeprecationNotice) {
      scriptState._showedDeprecationNotice = true;

      CustomStatusMarkers.utils.Chat.whisperGM(`<h1 style="color: #800;">Notice:</h1> <p style="color: red;">The <b>Custom Status Markers</b> script has been deprecated. Although it is still functional, it is no longer being maintained or supported in favor of Roll20's built-in custom token markers.</p> <p>See https://app.roll20.net/forum/post/8033593/release-note-for-january-7-2020 for more information on using Roll20's custom token markers.</p> <p>Thank you for using this script in your games prior to 2020!</p>`);
    }
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

    // Bring the icon to the front.
    let controlledBy = token.get('controlledby');
    if (!controlledBy) {
      let charId = token.get('represents');
      if (charId) {
        let character = getObj('character', charId);
        controlledBy = character.get('controlledby');
      }
    }
    icon.set('controlledby', controlledBy);
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
    log('--- Initialized Custom Status Markers vSCRIPT_VERSION ---');

    deprecationNotice();
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
