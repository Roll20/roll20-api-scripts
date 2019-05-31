/**
 * Initialize the CheckItOut.utils package.
 */
(() => {
  'use strict';

  /**
   * Creates a deep copy of an object. This object must be a POJO
   * (Plain Old Javascript Object).
   * @param {object} obj
   */
  function deepCopy(obj) {
    let json = JSON.stringify(obj);
    return JSON.parse(json);
  }

  CheckItOut.utils = {
    deepCopy
  };
})();
