(() => {
  'use strict';

  const CMD_FILL = '!hexploration_fillPoly';

  /**
   * Reports an error.
   * @private
   * @param {Error} err
   */
  function _error(err) {
    _sendChat('Error: ' + err.message);
    log('Hexploration ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * Fills the area defined by some path with hex tiles.
   * @param {Path} path
   * @return {Path[]}
   */
  function fillArea(path) {
    let page = getObj('page', path.get('_pageid'));
    let pageId = page.get('_id');
    let tile = new Hexploration.HexagonTile(page);

    let hexes = getHexesInArea(path);
    path.remove();
    return _.chain(hexes)
    .map(hex => {
      let [row, column] = hex;

      // Skip if there's already a hex here.
      if(Hexploration._state.hasPageHex(page, row, column))
        return undefined;

      // Create the hex.
      else {
        let hexagon = tile.getHexagon(row, column);
        let hexPath = hexagon.render(pageId, 'objects', {
          fill: '#FFFF88',
          stroke: '#DDDD88',
          stroke_width: 0
        });

        Hexploration._state.persistHex(page, hexPath, row, column);
        return hexPath;
      }
    })
    .compact()
    .value();
  }

  /**
   * Gets the row, column pairs for hexes contained in some area.
   * @param {Path} path
   * @return {vec2[]}
   */
  function getHexesInArea(path) {
    let page = getObj('page', path.get('_pageid'));
    let tile = new Hexploration.HexagonTile(page);

    let poly = new PathMath.Polygon(path);
    let bbox = poly.getBoundingBox();

    // Determine the bounding rows and columns for the polygon.
    let startRowCol = tile.getRowColumn(bbox.left, bbox.top);
    let endRowCol = tile.getRowColumn(bbox.right, bbox.bottom);

    let rows = _.range(startRowCol[0], endRowCol[0] + 1);
    let cols = _.range(startRowCol[1], endRowCol[1] + 1);

    // Get a list of the hex coordinates that fit in the area.
    let hexes = [];
    _.each(rows, row => {
      _.each(cols, col => {
        let center = tile.getCoordinates(row, col);
        if(poly.containsPt(center))
          hexes.push([row, col]);
      });
    });
    return hexes;
  }

  /**
   * Gets a HexagonTile for a page or an object residing on the page.
   * @param {(Page|Path|Graphic)} obj
   * @return {Hexploration.HexagonTile}
   */
  function getHexTile(obj) {
    let type = obj.get('_type');
    let page;
    if(type === 'page')
      page = getObj('page', obj.get('_id'));
    else
      page = getObj('page', obj.get('_pageid'));

    try {
      return new Hexploration.HexagonTile(page);
    }
    catch(err) {
      return undefined;
    }
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
   * Removes a hex from a page, given its row and column.
   * @param {Page} page
   * @param {int} row
   * @param {int} column
   */
  function revealHex(page, row, column) {
    let pageHex = Hexploration._state.getPageHex(page, row, column);
    if(pageHex) {
      let hexPath = getObj('path', pageHex.id);
      Hexploration._state.deletePath(hexPath);
      hexPath.remove();

      if(pageHex.name) {
        _sendChat("Discovered " + pageHex);
      }
    }
  }

  /**
   * Sends a message to the chat using the script's name.
   * @param {string} msg
   */
  function _sendChat(msg) {
    sendChat('Hexploration', msg);
  }

  // Interpret chat commands.
  on('chat:message', msg => {
    try {
      if(msg.type !== 'api')
        return;

      let argv = msg.content.split(' ');
      if(argv[0] === CMD_FILL) {
        if(msg.selected && msg.selected.length > 0) {
          _.each(msg.selected, sel => {
            let path = getObj('path', sel._id);
            fillArea(path);
          });
        }
        else
          throw new Error('You must select one or more polygons to be ' +
            'filled with hexes.');
      }
    }
    catch(err) {
      _error(err);
    }
  });

  // When a graphic is moved, see if it moved into an area concealed by a hex.
  // If it did, reveal that hex.
  on('change:graphic', (obj, prev) => {
    try {
      // Skip if the token doesn't represent a character.
      if(!obj.get('represents'))
        return;

      let page = getObj('page', obj.get('_pageid'));
      let hexTile = getHexTile(page);
      if(hexTile) {
        let x = obj.get('left');
        let y = obj.get('top');
        let [row, column] = hexTile.getRowColumn(x, y);
        revealHex(page, row, column);
      }
    }
    catch(err) {
      _error(err);
    }
  });

  // When a hex is deleted, remove its data from the state.
  on('destroy:path', path => {
    try {
      Hexploration._state.deletePath(path);
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
      if(playerIsGM(player.get('_id')))
        _installMacro(player, 'Hexplorer_fillArea', CMD_FILL);
    });

    log('⬢⬢⬢ Initialized Hexploration vSCRIPT_VERSION ⬢⬢⬢');
  });

  _.extend(Hexploration, {
    fillArea,
    getHexesInArea,
    getHexTile,
    revealHex
  });
})();
