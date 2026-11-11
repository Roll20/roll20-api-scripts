// Area maths. Everything here is pure: it takes plain numbers and records, so
// it can be tested in Node without the Roll20 sandbox.

import { PIXELS_PER_UNIT } from './constants.js';
import { toNumber } from './utils.js';

/**
 * @typedef {object} PageMetrics
 * @property {number} cellPx Pixels in one grid cell.
 * @property {number} pxPerUnit Pixels in one measurement unit (feet, metres...).
 * @property {number} widthPx Page width in pixels.
 * @property {number} heightPx Page height in pixels.
 */

/**
 * @typedef {object} Area
 * @property {number} x Centre x in pixels.
 * @property {number} y Centre y in pixels.
 * @property {number} r Radius (circle) or half-side (square) in pixels.
 * @property {boolean} square True for a square area.
 */

/**
 * Works out a page's sizes. A grid cell is 70 px times the snapping increment
 * and measures `scale_number` units; page width and height are in 70 px units.
 * Verified in Jumpgate on 4 November 2026.
 *
 * @param {{width:*, height:*, snapping_increment:*, scale_number:*}} page Page values.
 * @returns {PageMetrics} Page metrics.
 */
export function pageMetrics(page) {
  const snap = toNumber(page.snapping_increment);
  const cellPx = PIXELS_PER_UNIT * (snap && snap > 0 ? snap : 1);
  const scale = toNumber(page.scale_number);
  return {
    cellPx,
    pxPerUnit: cellPx / (scale && scale > 0 ? scale : 1),
    widthPx: (toNumber(page.width) || 0) * PIXELS_PER_UNIT,
    heightPx: (toNumber(page.height) || 0) * PIXELS_PER_UNIT,
  };
}

/**
 * Works out a token's Aura 1 area. Roll20 measures auras from the token's edge,
 * so half the token's larger side is added to the radius. A token with no aura
 * covers just itself.
 *
 * @param {{left:*, top:*, width:*, height:*, aura1_radius:*, aura1_square:*}} token Token values.
 * @param {PageMetrics} metrics Page metrics.
 * @returns {Area} Area.
 */
export function tokenArea(token, metrics) {
  const radius = Math.max(0, toNumber(token.aura1_radius) || 0);
  const size = Math.max(toNumber(token.width) || 0, toNumber(token.height) || 0);
  return {
    x: toNumber(token.left) || 0,
    y: toNumber(token.top) || 0,
    r: radius * metrics.pxPerUnit + size / 2,
    square: token.aura1_square === true || token.aura1_square === 'true',
  };
}

/**
 * Picks a uniformly distributed point in an area.
 *
 * v1 used `1 - u²` for the distance, which still bunched effects towards the
 * centre; `√u` spreads them evenly over the circle.
 *
 * @param {Area} area Area.
 * @param {() => number} [random=Math.random] Random source in [0, 1).
 * @returns {{x: number, y: number}} Point.
 */
export function randomPointIn(area, random = Math.random) {
  if (area.square) {
    return {
      x: area.x + (random() * 2 - 1) * area.r,
      y: area.y + (random() * 2 - 1) * area.r,
    };
  }
  const angle = random() * 2 * Math.PI;
  const dist = Math.sqrt(random()) * area.r;
  return { x: area.x + dist * Math.cos(angle), y: area.y + dist * Math.sin(angle) };
}

/**
 * Returns true when a point lies in an area (edges included).
 *
 * @param {{x: number, y: number}} pt Point.
 * @param {Area} area Area.
 * @returns {boolean} True when inside.
 */
export function isInArea(pt, area) {
  const dx = pt.x - area.x;
  const dy = pt.y - area.y;
  if (area.square) {
    return Math.abs(dx) <= area.r && Math.abs(dy) <= area.r;
  }
  return dx * dx + dy * dy <= area.r * area.r;
}

/**
 * Keeps a point on the page.
 *
 * @param {{x: number, y: number}} pt Point.
 * @param {PageMetrics} metrics Page metrics.
 * @returns {{x: number, y: number}} Point inside the page.
 */
export function clampToPage(pt, metrics) {
  return {
    x: Math.min(Math.max(pt.x, 0), metrics.widthPx),
    y: Math.min(Math.max(pt.y, 0), metrics.heightPx),
  };
}

/**
 * Works out where a beam-like effect ends. A fixed direction is in grid cells
 * (v1's Bar 2 value and max); "random" picks any direction up to one cell long.
 *
 * @param {{x: number, y: number}} start Start point.
 * @param {null|'random'|{dx: number, dy: number}} direction Direction.
 * @param {PageMetrics} metrics Page metrics.
 * @param {() => number} [random=Math.random] Random source.
 * @returns {{x: number, y: number}} End point.
 */
export function beamEnd(start, direction, metrics, random = Math.random) {
  if (direction === 'random') {
    const angle = random() * 2 * Math.PI;
    const length = (0.25 + random() * 0.75) * metrics.cellPx;
    return { x: start.x + length * Math.cos(angle), y: start.y + length * Math.sin(angle) };
  }
  const dx = direction?.dx || 0;
  const dy = direction?.dy || 0;
  return { x: start.x + dx * metrics.cellPx, y: start.y + dy * metrics.cellPx };
}

/**
 * Picks a delay between two spawns.
 *
 * @param {[number, number]} interval Shortest and longest interval in ms.
 * @param {number} intensity Rate multiplier (2 = twice as often).
 * @param {number} minDelay Shortest delay allowed.
 * @param {() => number} [random=Math.random] Random source.
 * @returns {number} Delay in ms.
 */
export function nextDelay(interval, intensity, minDelay, random = Math.random) {
  const [low, high] = interval;
  const base = low + random() * (Math.max(low, high) - low);
  return Math.max(minDelay, base / (intensity > 0 ? intensity : 1));
}
