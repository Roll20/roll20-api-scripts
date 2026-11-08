// Hit points from the bar the GM chose. A linked bar whose maximum is empty
// gets its maximum from the linked attribute.

import { findAttribute } from './sheet.js';
import { toNumber, toText } from './utils.js';

/**
 * @typedef {object} HitPoints
 * @property {number|null} value Current hit points, or null when the bar is empty or not a number.
 * @property {number|null} max Maximum, or null when unknown.
 * @property {string} link Name or ID of the attribute the bar is linked to ('' when not linked).
 */

/**
 * Reads a token's hit points.
 *
 * @param {object} token Roll20 graphic.
 * @param {number} bar Bar number (1 to 3).
 * @returns {HitPoints} Hit points.
 */
export function readHp(token, bar) {
  const value = toNumber(token.get(`bar${bar}_value`));
  let max = toNumber(token.get(`bar${bar}_max`));
  const link = toText(token.get(`bar${bar}_link`));
  if ((max === null || max <= 0) && link) {
    max = linkedMax(token, link);
  }
  return { value, max: max !== null && max > 0 ? max : null, link };
}

/**
 * Reads the maximum of the attribute a bar is linked to. Legacy sheets link by
 * attribute ID; the 2024 sheet links by name.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} link Bar link.
 * @returns {number|null} Maximum.
 */
function linkedMax(token, link) {
  const byId = getObj('attribute', link);
  if (byId) {
    return toNumber(byId.get('max'));
  }
  const characterId = toText(token.get('represents'));
  if (!characterId) {
    return null;
  }
  const attr = findAttribute(characterId, link);
  return attr ? toNumber(attr.get('max')) : null;
}

/**
 * Returns the bar value a change event saw before, as a number.
 *
 * @param {object|null} prev Previous attributes from a change event.
 * @param {number} bar Bar number.
 * @returns {number|null} Previous hit points.
 */
export function previousHp(prev, bar) {
  return prev ? toNumber(prev[`bar${bar}_value`]) : null;
}
