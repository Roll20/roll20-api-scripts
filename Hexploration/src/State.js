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
