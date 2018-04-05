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
