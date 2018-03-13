(() => {
  'use strict';

  const CMD_FILL = '!hexploration_fillPoly';

  /**
   * Reports an error.
   * @private
   * @param {Error} err
   */
  function _error(err) {
    sendChat('Hexploration Error', err.message);
    log('Hexploration ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * Gets the list of hexagons inside of some filled path.
   * @param {Path} path
   * @return {PathMath.Polygon[]}
   */
  function getHexagonsInArea(path) {
    let page = getObj('page', path.get('_pageid'));
    let tile = new Hexploration.HexagonTile(page);

    let poly = new PathMath.Polygon(path);
    let bbox = poly.getBoundingBox();

    // Determine the bounding rows and columns for the polygon.
    let startRowCol = tile.getRowColumn(bbox.left, bbox.top);
    let endRowCol = tile.getRowColumn(bbox.right, bbox.bottom);

    let rows = _.range(startRowCol[0], endRowCol[0] + 1);
    let cols = _.range(startRowCol[1], endRowCol[1] + 1);

    // Create the hexagons inside the polygon.
    let hexagons = [];
    _.each(cols, col => {
      _.each(rows, row => {
        let center = tile.getCoordinates(row, col);

        if(poly.containsPt(center)) {
          let hexagon = tile.getHexagon(center);
          hexagons.push(hexagon);
        }
      });
    });
    return hexagons;
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

  function _testFillHexAt(row, col) {
    let pageId = Campaign().get("playerpageid");
    let page = getObj('page', pageId);
    let hexTile = new Hexploration.HexagonTile(page);
    let center = hexTile.getCoordinates(row, col);
    let hexagon = hexTile.getHexagon(center);
    let hexPath = hexagon.render(pageId, 'objects', {
      fill: '#FFFF88',
      stroke: '#DDDD88',
      stroke_width: 0
    });
  }

  function _testHex() {
    _testFillHexAt(0, 0);
    _testFillHexAt(1, 1);
    _testFillHexAt(4, 4);
    _testFillHexAt(4, 1);
  }


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

    //_testHex();
  });

  on('chat:message', msg => {
    try {
      if(msg.type !== 'api')
        return;

      let argv = msg.content.split(' ');
      if(argv[0] === CMD_FILL) {
        if(msg.selected && msg.selected.length > 0) {
          _.each(msg.selected, sel => {
            let path = getObj('path', sel._id);
            let pageId = path.get('_pageid');

            let hexagons = getHexagonsInArea(path);
            _.each(hexagons, hex => {
              let hexPath = hex.render(pageId, 'objects', {
                fill: '#FFFF88',
                stroke: '#DDDD88',
                stroke_width: 0
              });
              //toFront(hexPath);
            });
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

  on('change:graphic', (obj, prev) => {
    log('Test dx, dy, dist');
    log(prev);
    let dx = obj.get('left') - prev.left;
    log(dx);
    let dy = obj.get('top') - prev.top;
    log(dy);
    let dist = Math.sqrt(dx*dx + dy*dy);
    log(dist);
  });

  _.extend(Hexploration, {
    getHexagonsInArea
  });
})();
