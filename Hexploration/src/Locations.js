(() => {
  'use strict';

  /**
   * Gets the objects representing locations on a page.
   * @param {Page} page
   * @return {Graphic[]}
   */
  function getMarkers(page) {
    return findObjs({
      _type: 'graphic',
      _pageid: page.get('_id'),
      'status_white-tower': true
    });
  }

  /**
   * Sets the icon and name for a hex.
   * @param {Path} path
   *        The path representing the hex.
   * @param {Graphic} icon
   *        The icon containing the graphic and name for the hex when it is
   *        revealed.
   */
  function setHexIcon(path, icon) {
    let pageHex = Hexploration._state.getPageHexByPath(path);
    if(!pageHex)
      throw new Error('Could not find PageHex data for path ' + path.get('_id'));

    pageHex.iconId = icon.get('_id');
    icon.set('layer', 'gmlayer');
  }

  /**
   * Sets the name for a hex, without assigning it an icon.
   * @param {Path} path
   *        The Path representing the hex.
   * @param {string} name
   */
  function setHexName(path, name) {
    let config = Hexploration._state.getConfig();

    let pageHex = Hexploration._state.getPageHexByPath(path);
    if(!pageHex)
      throw new Error('Could not find PageHex data for path ' + path.get('_id'));

    // Remove the previous name.
    if(pageHex.nameId) {
      let namePath = getObj('text', pageHex.nameId);
      namePath.remove();
      pageHex.nameId = undefined;
    }

    // Set the new name and create a text object for it.
    pageHex.name = name;
    if(pageHex.name) {
      let namePath = createObj('text', {
        _pageid: path.get('_pageid'),
        layer: 'gmlayer',
        left: path.get('left'),
        top: path.get('top'),
        text: name,
        color: config.labelColor
      });
      pageHex.nameId = namePath.get('_id');
    }
  }

  _.extend(Hexploration, {
    _locations: {
      getMarkers,
      setHexIcon,
      setHexName
    }
  });
})();
