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
    let startCol = Math.floor((bbox.left - tile.startX)/tile.dx);
    let startRow = Math.floor((bbox.top - tile.startY)/tile.dy);
    let endCol = startCol + Math.ceil(bbox.width/tile.dx);
    let endRow = startRow + Math.floor(bbox.height/tile.dy);

    let cols = _.range(startCol, endCol + 1);
    let rows = _.range(startRow, endRow + 1);

    // Create the hexagons inside the polygon.
    let hexagons = [];
    _.each(cols, col => {
      _.each(rows, row => {
        let center = tile.getCoordinates(row, col);
        let hexagon = tile.getHexagon(center);
        hexagons.push(hexagon);
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

  _.extend(Hexploration, {
    getHexagonsInArea
  });
})();
