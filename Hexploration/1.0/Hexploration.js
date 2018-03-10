var Hexploration = {};

(() => {
  'use strict';

  /**
   * The number of radians in a circle.
   */
  const TAU = Math.PI*2;

  /**
   * A square unit is 70 pixels^2.
   */
  const UNIT_PIXELS_SQUARE = 70;

  /**
   * Grid hex tiles are just slightly wider from side to side than
   * square tiles are. Thus, there is a small coefficient.
   */
  const UNIT_PIXELS_HEX = UNIT_PIXELS_SQUARE * 1.2;

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
          this._dx = this.verticalDx;
        else
          this._dx = this.verticalDy;
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
          this._dy = this.verticalDy;
        else
          this._dy = this.verticalDx;
      }
      return this._dy;
    }

    /**
     * True if this hex tile is oriented vertically.
     * @type {boolean}
     */
    get isVertical() {
      return this._isVertical;
    }

    /**
     * The radius of the hexagon. I.E. The radius of the circle whose
     * circumference contains all the hexagon's points.
     * @type {number}
     */
    get radius() {
      return this._radius;
    }

    /**
     * The length of one side of the hexagon.
     * @type {number}
     */
    get side() {
      if(!this._side)
        this._side = 2 * this._radius * Math.sin(TAU/12);
      return this._side;
    }

    /**
     * Gets the x offset for the first column of tiles.
     * @type {number}
     */
    get startX() {
      if(!this._startX) {
        if(this.isVertical)
          this._startX = this.width/2;
        else
          this._startX = this.radius;
      }
      return this._startX;
    }

    /**
     * Gets the y offset for the first row of tiles.
     */
    get startY() {
      if(!this._startY) {
        if(this.isVertical)
          this._startY = this.radius;
        else
          this._startY = this.width/2;
      }
      return this._startY;
    }

    /**
     * The amount of horizontal translation between two columns of
     * vertically oriented tiles.
     * @type {number}}
     */
    get verticalDx() {
      return this.width;
    }

    /**
     * The amount of vertical translation between two rows of vertically
     * oriented tiles.
     * @type {number}
     */
    get verticalDy() {
      return this.radius * (1 + Math.sin(TAU/12));
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
     * The width of the tile from one side to the opposite side.
     * @type {number}
     */
    get width() {
      if(!this._width)
        this._width = 2 * this.radius * Math.cos(TAU/12);
      return this._width;
    }

    /**
     * @param {Page} page
     */
    constructor(page) {
      let gridType = page.get('grid_type');
      if(gridType !== 'hex' && gridType !== 'hexr')
        throw new Error(
          `Cannot create HexagonTile for page with grid type ${gridType}.`);

      this._radius = UNIT_PIXELS_HEX/2 * page.get('snapping_increment');
      this._isVertical = page.get('grid_type') === 'hex';
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
      let x = column * this.dx;
      if(this.isVertical && (row % 2) === 0)
        x += this.startX;

      let y = row * this.dy;
      if(!this.isVertical && (column % 2) === 0)
        y += this.startY;

      return [x, y];
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

    log('⬢⬢⬢ Initialized Hexploration v1.0 ⬢⬢⬢');
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
