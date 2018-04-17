(() => {
  'use strict';

  const CMD_FILL = '!hexploration_fillPoly';
  const CMD_FILL_INVERSE = '!hexploration_fillInversePoly';
  const CMD_SHOW_MENU = '!hexploration_showMenuMain';

  /**
   * Fills the area defined by some path with hex tiles.
   * @param {Path} path
   * @return {Path[]}
   */
  function fillArea(path) {
    let page = getObj('page', path.get('_pageid'));

    let hexes = getHexesInArea(path);
    path.remove();
    return _fillHexes(page, hexes);
  }

  /**
   * Fills in the given hexes.
   * @param {Page} page
   * @param {tuple<uint, uint>} hexes
   * @return {Path[]}
   */
  function _fillHexes(page, hexes) {
    let config = Hexploration._state.getConfig();
    let pageId = page.get('_id');
    let tile = new Hexploration.HexagonTile(page);

    let locationMarkers = Hexploration._locations.getMarkers(page);
    let locations = {};
    _.each(locationMarkers, marker => {
      let x = marker.get('left');
      let y = marker.get('top');
      let name = marker.get('name');

      let [row, column] = tile.getRowColumn(x, y);
      locations[row + ',' + column] = [name, marker];
    });

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
          fill: config.fillColor,
          stroke: config.strokeColor,
          stroke_width: config.strokeWidth
        });

        Hexploration._state.persistHex(page, hexPath, row, column);

        // If there was a location marker at the hex's location, give the
        // hex a name and remove the marker.
        let location = locations[row + ',' + column];
        if(location) {
          let [name, marker] = location;
          Hexploration._locations.setHexName(hexPath, name);
          marker.remove();
        }


        return hexPath;
      }
    })
    .compact()
    .value();
  }

  /**
   * Fills the page with hexes, except for in the areas specified by the
   * provided paths.
   * @param {Path[]} paths
   * @return {Path[]}
   */
  function fillInverseArea(paths) {
    let page = getObj('page', paths[0].get('_pageid'));

    let omitHexes = [];
    _.each(paths, path => {
      let hexes = getHexesInArea(path);
      omitHexes = omitHexes.concat(hexes);
      path.remove();
    });

    let hexes = [];
    _.each(_.range(page.get('height')), row => {
      _.each(_.range(page.get('width')), column => {
        let isOmitted = _.find(omitHexes, hex => {
          let [omitRow, omitColumn] = hex;
          return row === omitRow && column === omitColumn;
        });
        if(!isOmitted)
          hexes.push([row, column]);
      });
    });

    return _fillHexes(page, hexes);
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

      if(pageHex.name)
        Hexploration._menus.showDiscovery(pageHex.name);
    }
  }

  /**
   * Reveals the hexes nearby a token, out to the configured reveal distance.
   * @param {Graphic} obj
   */
  function revealHexesAroundToken(obj) {
    let config = Hexploration._state.getConfig();
    let page = getObj('page', obj.get('_pageid'));
    let hexTile = getHexTile(page);
    if(hexTile) {
      let x = obj.get('left');
      let y = obj.get('top');
      let [row, column] = hexTile.getRowColumn(x, y);
      revealHex(page, row, column);

      // Also reveal any nearby hexes, out to the configured reveal distance.
      let nearbyHexes = hexTile.getNearbyHexes(row, column, config.revealDistance);
      _.each(nearbyHexes, hex => {
        let [row, column] = hex;
        revealHex(page, row, column);
      });
    }
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
      else if(argv[0] === CMD_FILL_INVERSE) {
        if(msg.selected && msg.selected.length > 0) {
          let paths = _.map(msg.selected, sel => {
             return getObj('path', sel._id);
          });
          fillInverseArea(paths);
        }
        else
          throw new Error('You must select one or more polygons to be ' +
            'filled with hexes.');
      }
      else if(argv[0] === CMD_SHOW_MENU)
        Hexploration._menus.showMain();
    }
    catch(err) {
      Hexploration._chat.error(err);
    }
  });

  // When a graphic is moved, see if it moved into an area concealed by a hex.
  // If it did, reveal that hex.
  on('change:graphic', (obj, prev) => {
    try {
      // Skip if the token doesn't represent a character.
      if(!obj.get('represents'))
        return;

      revealHexesAroundToken(obj);
    }
    catch(err) {
      Hexploration._chat.error(err);
    }
  });

  // When a hex is deleted, remove its data from the state.
  on('destroy:path', path => {
    try {
      Hexploration._state.deletePath(path);
    }
    catch(err) {
      Hexploration._chat.error(err);
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
      if(playerIsGM(player.get('_id'))) {
        _installMacro(player, 'Hexploration_menu', CMD_SHOW_MENU);
      }
    });

    log('⬢⬢⬢ Initialized Hexploration vSCRIPT_VERSION ⬢⬢⬢');
  });

  _.extend(Hexploration, {
    CMD_FILL,
    CMD_FILL_INVERSE,
    CMD_SHOW_MENU,
    fillArea,
    fillInverseArea,
    getHexesInArea,
    getHexTile,
    revealHex
  });
})();
