var Hexploration = {};

/**
 * This module provides the script's interface for broadcasting/whispering
 * messages in the chat.
 */
(() => {
  'use strict';

  const CHAT_NAME = 'Hexploration';

  /**
   * Displays a message in the chat that is visible to everyone.
   * @param {string} msg
   */
  function broadcast(msg) {
    sendChat(CHAT_NAME, msg);
  }

  /**
   * Reports an error.
   * @param {Error} err
   */
  function error(err) {
    whisper('Error: ' + err.message);
    log('Hexploration ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * Whispers a message to the GM.
   * @param {string} msg
   */
  function whisper(msg) {
    sendChat(CHAT_NAME, `/w gm ${msg}`);
  }

  _.extend(Hexploration, {
    _chat: {
      broadcast,
      error,
      whisper
    }
  });
})();

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
   * Sets the name for a hex.
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
      setHexName
    }
  });
})();

(() => {
  'use strict';

  const CMD_MODIFY_CONFIG = '!hexploration_configModifyProperty';
  const CMD_MODIFY_HEX = '!hexploration_hexModifyProperty';

  const MENU_CSS = {
    'optionsTable': {
      'width': '100%'
    },
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #000',
      'border-radius': '5px',
      'font-weight': 'bold',
      'margin-bottom': '1em',
      'overflow': 'hidden'
    },
    'menuBody': {
      'padding': '5px',
      'text-align': 'center'
    },
    'menuHeader': {
      'background': '#000',
      'color': '#fff',
      'text-align': 'center'
    }
  };

  /**
   * Get the menu data for the current configuration properties.
   */
  function _getConfigProps() {
    let config = Hexploration._state.getState().config;
    return [
      {
        id: 'color',
        name: 'Hex Color',
        desc: 'The fill and stroke colors for the hexes.',
        value: `<div style="background: ${config.strokeColor}; width: 40px; height: 40px;"><div style="display: inline-block; margin: 4px; background: ${config.fillColor}; width: 32px; height: 32px; vertical-align: middle; color: ${config.labelColor}; line-height: 32px;">Label</div></div>`,
        properties: [
          {
            id: 'fillColor',
            name: 'Fill Color',
            desc: 'The hex fill color.'
          },
          {
            id: 'strokeColor',
            name: 'Border Color',
            desc: 'The hex border color.'
          },
          {
            id: 'labelColor',
            name: 'Label Color',
            desc: 'The label color'
          }
        ]
      },
      {
        id: 'strokeWidth',
        name: 'Border Width',
        desc: 'The width of the hexes\' border outlines.',
        value: config.strokeWidth || '0'
      },
      {
        id: 'revealDistance',
        name: 'Reveal Distance',
        desc: 'When you move, hexes this many units from your position will be revealed.',
        value: config.revealDistance || '0'
      }
    ];
  }

  /**
   * Modifies the persisted data for a hex with the given parameters.
   * @param {Path} path
   *        The Path representing the hex.
   * @param {string[]} argv
   *        The first element is the name of the property.
   *        The rest of the elements are the parameters used to modify it.
   */
  function _modifyHex(path, argv) {
    let prop = argv[0];
    let params = argv.slice(1);

    if(prop === 'name') {
      Hexploration._locations.setHexName(path, params[0]);
    }
  }

  /**
   * Modifies a configuration with the given parameters.
   * @param {string[]} argv
   *        The first element is the name of the configuration property.
   *        The rest of the elements are the parameters used to modify it.
   */
  function _modifyConfig(argv) {
    let config = Hexploration._state.getConfig();
    let prop = argv[0];
    let params = argv.slice(1);

    if(prop === 'color') {
      config.fillColor = params[0] || 'black';
      config.strokeColor = params[1] || 'transparent';
      config.labelColor = params[2] || 'white';
    }
    if(prop === 'strokeWidth')
      config.strokeWidth = parseInt(params[0]) || 0;
    if(prop === 'revealDistance')
      config.revealDistance = parseInt(params[0]) || 0;

    showMain();
  }

  /**
   * Displays a stylized announcement in the chat that
   */
  function showDiscovery(name) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', 'Discovered Location');
    menu.append('.menuBody', `<h4>${name}</h4>`);
    Hexploration._chat.broadcast(menu.toString(MENU_CSS));
  }

  /**
   * Shows the script's main menu.
   */
  function showMain() {
    let content = new HtmlBuilder('div');

    content.append('h4', 'Configs');
    let configProps = _getConfigProps();
    let table = content.append('table', undefined, {
      style: {
        'margin-left': 'auto',
        'margin-right': 'auto'
      }
    });
    _.each(configProps, prop => {
      let tr = table.append('tr', undefined, {
        title: prop.desc
      });

      let params = [];
      let paramProperties = prop.properties || [prop];
      _.each(paramProperties, item => {
        let options = '';
        if(item.options)
          options = '|' + item.options.join('|');
        params.push(`?{${item.name}: ${item.desc} ${options}}`);
      });

      tr.append('td', `[${prop.name}](${CMD_MODIFY_CONFIG} ${prop.id}&&${params.join('&&')})`, {
        style: { 'font-size': '0.8em' }
      });

      tr.append('td', `${prop.value || ''}`, {
        style: { 'font-size': '0.8em' }
      });
    });

    content.append('h4', 'Actions', {
      style: { 'margin-top': '1em' }
    });
    content.append('div', `[Fill Polygon](${Hexploration.CMD_FILL})`, {
      title: 'Fill the selected polygons with hexes.'
    });
    content.append('div', `[Inverse Fill](${Hexploration.CMD_FILL_INVERSE})`, {
      title: 'Fill the whole page with hexes, except within the selected polygons.'
    });
    content.append('div', `[Name Hex](${CMD_MODIFY_HEX} name&&?{Pick name})`, {
      title: 'Set a name for a hex. When the hex is revealed, ' +
        'it will declare in the chat that is was discovered.'
    });

    _showMenu('Hexploration Menu', content);
  }

  /**
   * Displays a stylized menu in the chat, whispered to the GM.
   * @param {string} title
   *        The title displayed in the menu header.
   * @param {string} content
   *        The menu's HTML contents.
   */
  function _showMenu(title, content) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', title);
    menu.append('.menuBody', content);
    Hexploration._chat.whisper(menu.toString(MENU_CSS));
  }

  on('chat:message', msg => {
    try {
      if(msg.type !== 'api')
        return;

      let argv = msg.content.split(' ');
      if(argv[0] === CMD_MODIFY_CONFIG) {
        let params = msg.content.replace(CMD_MODIFY_CONFIG + ' ', '').split('&&');
        _modifyConfig(params);
      }
      if(argv[0] === CMD_MODIFY_HEX) {
        if(msg.selected && msg.selected.length === 1) {
          let path = getObj('path', msg.selected[0]._id);
          let params = msg.content.replace(CMD_MODIFY_HEX + ' ', '').split('&&');
          _modifyHex(path, params);
        }
        else
          throw new Error('You must select one hex to be named.');
      }
    }
    catch(err) {
      Hexploration._chat.error(err);
    }
  });

  _.extend(Hexploration, {
    _menus: {
      showDiscovery,
      showMain
    }
  });
})();

(() => {
  'use strict';

  /**
   * The global configurations object for this script.
   * @typedef {object} HexplorationConfig
   * @property {string} fillColor
   *           The fill color for hexes.
   * @property {string} labelColor
   *           The color for name labels.
   * @property {uint} revealDistance
   *           When a token moves, hexes within this distance are revealed.
   * @property {string} strokeColor
   *           The stroke color for hexes.
   * @property {uint} strokeWidth
   *           The stroke width for hexes.
   */

  /**
   * The script's persisted state object.
   * @typedef {object} HexplorationState
   * @property {map<string, string, PageHex>} pageHexes
   *           A mapping of Page IDs to <row>,<column> pairs to PageHexes
   *           containing the persisted information about a hex.
   * @property {map<string, tuple<string, string>>}
   *           A mapping of Path IDs representing hexes to their
   *           [page ID, <row>,<column>] keys into pageHexes.
   * @property {HexplorationConfig} config
   */

  /**
   * Persisted information about a hex.
   * @typedef {object} PageHex
   * @property {string} id
   *           The ID of the hex's Path.
   * @property {string} [name]
   *           The name of the hex. If a named hex is revealed, then its
   *           discovery will be announced in the chat.
   * @property {string} [nameId]
   *           The ID for the Path labelling the named hex on the GM layer.
   */

  /**
   * The first element is the hex's page ID.
   * The second element is the <row>,<column> string for the hex.
   * @typedef {tuple<string, string>} PageHexKey
   */

  /**
   * Remove the hex data about some path from the state.
   * @param {Path} path
   */
  function deletePath(path) {
    let myState = getState();
    let id = path.get('_id');
    let key = getPageHexKey(path);
    if(key) {
      let [pageId, rowColumn] = key;
      let pageHex = myState.pageHexes[pageId][rowColumn];

      // If the hex was named, delete the label for its name.
      if(pageHex.nameId) {
        let namePath = getObj('text', pageHex.nameId);
        namePath.remove();
      }

      delete myState.pageHexes[pageId][rowColumn];
      delete myState.hexIdMap[id];
    }
  }

  /**
   * Returns the configs object.
   * @return {HexplorationConfig}
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Gets the persisted state for this script.
   * @return {HexplorationState}
   */
  function getState() {
    if(!state.Hexploration) {
      state.Hexploration = {
        // Persists hexes by their Page ID, then by their <row>,<column>.
        pageHexes: {},

        // Maps hex Path IDs to their keys in pageHexes.
        hexIdMap: {}
      };
    }
    _.defaults(state.Hexploration, {
      config: {}
    });
    _.defaults(state.Hexploration.config, {
      fillColor: '#FFFF88',
      labelColor: '#333333',
      strokeColor: '#DDDD88',
      strokeWidth: 0,
      revealDistance: 0
    });
    return state.Hexploration;
  }

  /**
   * Gets the hex data at some grid location on some page. If the hex data
   * couldn't be found, undefined is returned.
   * @param {(Page|string)} page
   *        The Page or its ID.
   * @param {int} row
   * @param {int} column
   * @return {PageHex}
   */
  function getPageHex(page, row, column) {
    let myState = getState();

    let pageId = page;
    if(!_.isString(page))
      pageId = page.get('_id');

    let pageHexes = myState.pageHexes[pageId];
    if(pageHexes) {
      let key = row + "," + column;
      return pageHexes[key];
    }
  }

  /**
   * Gets the PageHex object for the hexes represented by the given Path.
   * @param {Path} path
   * @return {PageHex}
   */
  function getPageHexByPath(path) {
    let [pageId, rowColumnKey] = getPageHexKey(path);
    let [row, column] = rowColumnKey.split(',');
    return getPageHex(pageId, row, column);
  }

  /**
   * Gets the key to a page hex object in the state, given some path.
   * This key consists of a page ID, a row, and a column. If the key
   * could not be found, undefined is returned.
   * @param {Path} path
   * @return {PageHexKey}
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
      getConfig,
      getPageHex,
      getPageHexByPath,
      getState,
      hasPageHex,
      persistHex
    }
  });
})();

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

    log('⬢⬢⬢ Initialized Hexploration v1.1 ⬢⬢⬢');
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
