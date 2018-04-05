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
   * This effectively defines a whole grid of hexes and its geometric properties
   * rather than just one hex.
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
     * Gets the row,column coordinates for the tiles nearby some
     * row,column position.
     * @param {int} row
     * @param {int} column
     * @param {uint} distance
     * @return {tuple<int,int>[]}
     */
    getNearbyHexes(row, column, distance) {
      if(distance === 0)
        return [];

      let set = new Set();

      // Use a queue to explore all adjacent hexes out to the desired distance.
      let workQueue = [[row, column, distance]];
      while(workQueue.length > 0) {
        let [row, column, distance] = workQueue.shift();

        // Get the positions of adjacent hexes.
        let adjHexes = this.getAdjacentHexes(row, column);

        // Add the adjacent hexes to our set and explore them if they're not
        // explored and we still have distance left.
        _.each(adjHexes, hex => {
          let [nextRow, nextColumn] = hex;
          let key = `${nextRow},${nextColumn}`;
          if(!set.has(key) && distance > 1)
            workQueue.push([nextRow, nextColumn, distance - 1]);
          set.add(key);
        });
      }

      // Transform the set into a list of tuples.
      let list = [];
      set.forEach(elem => {
        let parts = elem.split(',');
        let row = parseInt(parts[0]);
        let col = parseInt(parts[1]);
        list.push([row, col]);
      });
      return list;
    }

    /**
     * Gets the positions of the hexes surrounding some particular hex.
     * @param {int} row
     * @param {int} column
     * @return {tuple<int,int>[]}
     */
    getAdjacentHexes(row, column) {
      if(this.isVertical) {
        return [
          [row, column + 1],
          [row - 1, (row % 2) === 1 ? column + 1 : column],
          [row - 1, (row % 2) === 1 ? column : column - 1],
          [row, column - 1],
          [row + 1, (row % 2) === 1 ? column + 1 : column],
          [row + 1, (row % 2) === 1 ? column : column - 1]
        ];
      }
      else {
        return [
          [(column % 2) === 1 ? row + 1 : row, column - 1],
          [(column % 2) === 1 ? row : row - 1, column - 1],
          [row-1, column],
          [(column % 2) === 1 ? row + 1 : row, column + 1],
          [(column % 2) === 1 ? row : row - 1, column + 1],
          [row+1, column]
        ];
      }
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
