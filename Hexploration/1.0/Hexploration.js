var Hexploration = {};

(() => {
  'use strict';

  /**
   * The number of radians in a circle.
   */
  const TAU = Math.PI*2;

  /**
   * Distance between two adjacent unit hexes in a vertical hex arrangement.
   */
  const UNIT_PIXELS_SIDE_V_DIST = 75.198561984460;
  const UNIT_PIXELS_DIAG_V_DIST = 76.799271007752;
  const UNIT_PIXELS_DIAG_V_DX   = 37.599280992230;
  const UNIT_PIXELS_DIAG_V_DY   = 66.965827824268;
  const UNIT_PIXELS_V_START_X   = 75/2;
  const UNIT_PIXELS_V_START_Y   = 88/2;

  /**
   * Distance between two adjacent unit hexes in a horizontal hex arrangement.
   */
  const UNIT_PIXELS_SIDE_H_DIST = 79.688789983504;
  const UNIT_PIXELS_DIAG_H_DIST = 80.185196764184;
  const UNIT_PIXELS_DIAG_H_DX   = 69.585127490377;
  const UNIT_PIXELS_DIAG_H_DY   = 39.844394991752;
  const UNIT_PIXELS_H_START_X   = 94/2;
  const UNIT_PIXELS_H_START_Y   = 81/2;

  /**
   * A Hexagon sized for a page, with no particular center point.
   */
  class HexagonTile {

    /**
     * The x increment between two columns of this kind of tile.
     * @type {number}
     */
    get dx() {
      if(!this._dx) {
        if(this.isVertical)
          this._dx = UNIT_PIXELS_SIDE_V_DIST;
        else
          this._dx = UNIT_PIXELS_DIAG_H_DX;
        this._dx *= this.scale;
      }
      return this._dx;
    }

    /**
     * The y increment between two rows of this kind of tile.
     * @type {number}
     */
    get dy() {
      if(!this._dy) {
        if(this.isVertical)
          this._dy = UNIT_PIXELS_DIAG_V_DY;
        else
          this._dy = UNIT_PIXELS_SIDE_H_DIST;
        this._dy *= this.scale;
      }
      return this._dy;
    }

    /**
     * True if this hex tile is oriented horizontally.
     * @type {boolean}
     */
    get isHorizontal() {
      return !this._isVertical;
    }

    /**
     * True if this hex tile is oriented vertically.
     * @type {boolean}
     */
    get isVertical() {
      return this._isVertical;
    }

    /**
     * The page that this tile describes the hex grid for.
     * @type {Page}
     */
    get page() {
      return this._page;
    }

    /**
     * The radius of the concentric circle whose circumference touches all
     * of this hex's vertices.
     * @type {number}
     */
    get radius() {
      if(!this._radius) {
        if(this._isVertical)
          this._radius = UNIT_PIXELS_V_START_Y;
        else
          this._radius = UNIT_PIXELS_H_START_X;
        this._radius *= this.scale;
      }
      return this._radius;
    }

    /**
     * The page's unit scale.
     * @type {number}
     */
    get scale() {
      return this._scale;
    }

    /**
     * Gets the x offset for the first column of tiles.
     * @type {number}
     */
    get startX() {
      if(!this._startX) {
        if(this.isVertical)
          this._startX = UNIT_PIXELS_V_START_X;
        else
          this._startX = UNIT_PIXELS_H_START_X;
        this._startX *= this.scale;
      }
      return this._startX;
    }

    /**
     * Gets the y offset for the first row of tiles.
     */
    get startY() {
      if(!this._startY) {
        if(this.isVertical)
          this._startY = UNIT_PIXELS_V_START_Y;
        else
          this._startY = UNIT_PIXELS_H_START_Y;
        this._startY *= this.scale;
      }
      return this._startY;
    }

    /**
     * The vertices for this tile, with the center at the origin.
     * @type {vec3[]}
     */
    get vertices() {
      if(!this._vertices) {
        this._vertices = [];
        let angle = 0;
        if(this.isVertical)
          angle = TAU/12;

        // Rotate the radius in 60 degree increments to get all the vertices
        // for the hexagon.
        let pt0 = [this.radius, 0, 1];
        while(angle < TAU) {
          let rotation = MatrixMath.rotate(angle);
          let pt = MatrixMath.multiply(rotation, pt0);
          this._vertices.push(pt);
          angle += TAU/6;
        }
      }
      return this._vertices;
    }

    /**
     * @param {Page} page
     */
    constructor(page) {
      let gridType = page.get('grid_type');
      if(gridType !== 'hex' && gridType !== 'hexr')
        throw new Error(
          `Cannot create HexagonTile for page with grid type ${gridType}.`);

      this._page = page;
      this._isVertical = page.get('grid_type') === 'hex';
      this._scale = page.get('snapping_increment');
    }

    /**
     * Produces a PathMath Polygon for this tile located at some row and column.
     * @param {int} row
     * @param {int} column
     * @return {PathMath.Polygon}
     */
    getHexagon(row, column) {
      let center = this.getCoordinates(row, column);
      let translation = MatrixMath.translate(center);
      let verts = _.map(this.vertices, v => {
        return MatrixMath.multiply(translation, v);
      });
      return new PathMath.Polygon(verts);
    }

    /**
     * Gets the X, Y center coordinates for a hex tile at a particular row
     * and column.
     * @param {int} row
     * @param {int} column
     * @return {vec2}
     */
    getCoordinates(row, column) {
      let x = column * this.dx + this.startX;
      if(this.isVertical && (row % 2) === 1)
        x += this.startX;

      let y = row * this.dy + this.startY;
      if(this.isHorizontal && (column % 2) === 1)
        y += this.startY;

      return [x, y];
    }

    /**
     * Gets the row and column (rounded down) for some X, Y center coordinates.
     * @param {number} x
     * @param {number} y
     * @return {vec2}
     */
    getRowColumn(x, y) {
      let column = (x - this.startX)/this.dx;
      let row = (y - this.startY)/this.dy;

      if(this.isVertical && (Math.round(row) % 2) === 1)
        column -= 0.5;

      if(this.isHorizontal && (Math.round(column) % 2) === 1)
        row -= 0.5;

      return [Math.round(row), Math.round(column)];
    }
  }

  _.extend(Hexploration, {
    HexagonTile
  });
})();

(() => {
  'use strict';

  /**
   * Remove the hex data about some path from the state.
   */
  function deletePath(path) {
    let myState = getState();
    let id = path.get('_id');
    let key = getPageHexKey(path);
    if(key) {
      let [pageId, rowColumn] = key;
      delete myState.pageHexes[pageId][rowColumn];
      delete myState.hexIdMap[id];
    }
  }

  /**
   * Gets the persisted state for this script.
   */
  function getState() {
    if(!state.Hexploration) {
      state.Hexploration = {
        // Persists hexes by their Page ID, then by their <row>x<column>.
        pageHexes: {},

        // Maps hex path IDs to their keys in pageHexes.
        hexIdMap: {}
      };
    }
    return state.Hexploration;
  }

  /**
   * Gets the hex data at some grid location on some page. If the hex data
   * couldn't be found, undefined is returned.
   */
  function getPageHex(page, row, column) {
    let myState = getState();
    let pageId = page.get('_id');
    let pageHexes = myState.pageHexes[pageId];
    if(pageHexes) {
      let key = row + "," + column;
      return pageHexes[key];
    }
  }

  /**
   * Gets the key to a page hex object in the state, given some path.
   * This key consists of a page ID, a row, and a column. If the key
   * could not be found, undefined is returned.
   */
  function getPageHexKey(path) {
    let myState = getState();
    let id = path.get('_id');
    return myState.hexIdMap[id];
  }

  /**
   * Checks if a hex has been persisted.
   */
  function hasPageHex(page, row, column) {
    return !!getPageHex(page, row, column);
  }

  /**
   * Persists data about some hex.
   */
  function persistHex(page, hexPath, row, column) {
    let myState = getState();
    let pageId = page.get('_id');

    if(!myState.pageHexes[pageId])
      myState.pageHexes[pageId] = {};

    let key = row + "," + column;
    let id = hexPath.get('_id');
    myState.pageHexes[pageId][key] = { id };
    myState.hexIdMap[id] = [pageId, key];
  }

  _.extend(Hexploration, {
    _state: {
      deletePath,
      getPageHex,
      getState,
      hasPageHex,
      persistHex
    }
  });
})();

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

    log('⬢⬢⬢ Initialized Hexploration v1.0 ⬢⬢⬢');
  });

  _.extend(Hexploration, {
    fillArea,
    getHexesInArea,
    getHexTile,
    revealHex
  });
})();
