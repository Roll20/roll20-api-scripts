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

  /**
   * Gets the HTML-sanitized version of a string.
   * E.g., all '&'s will be changed to '&#38;'.
   * @param {string} str
   * @return {string}
   */
  function sanitizeStr(str) {
    return str.replace(/[^0-9a-zA-Z ]/g, match => {
      return `&#${match[0].charCodeAt(0)};`;
    });
  }

  /**
   * Gets the unsanitized version of an HTML-sanitized string.
   * E.g., all '&#38;'s will be changed to '&'.
   * @param {string} str
   * @return {string}
   */
  function unsanitizeStr(str) {
    return str.replace(/&#(\d+);/g, match => {
      return String.fromCharCode(match[1]);
    });
  }

  CheckItOut.utils = {
    deepCopy,
    sanitizeStr,
    unsanitizeStr
  };
})();
