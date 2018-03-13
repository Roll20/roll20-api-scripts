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

      this._isVertical = page.get('grid_type') === 'hex';
      this._scale = page.get('snapping_increment');
    }

    /**
     * Produces a PathMath Polygon for this tile centered at some point.
     * @param {vec2} center
     * @return {PathMath.Polygon}
     */
    getHexagon(center) {
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

      if(this.isVertical && (row % 2) === 1)
        column += 0.5;

      if(this.isHorizontal && (column % 2) === 1)
        row += 0.5;

      return [Math.floor(row), Math.floor(column)];
    }
  }

  _.extend(Hexploration, {
    HexagonTile
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

    log('⬢⬢⬢ Initialized Hexploration v1.0 ⬢⬢⬢');

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
