// Dynamic lighting barriers that patrols and followers can be kept behind.
//
// Roll20 does not stop tokens that the API moves at walls (its own "restrict
// movement" only applies to people dragging tokens), so the Mod checks each
// move against the page's barriers itself:
//   - walls: `pathv2` (Jumpgate) or `path` (Legacy) drawings on the walls
//     layer, with a barrierType of wall, oneWay or transparent;
//   - doors and windows: `door` and `window` objects, which block only while
//     they are closed. They are placed by x and -y (y measured upwards) with
//     two handles relative to that point, also with y upwards.
//
// The geometry functions are pure, so they can be unit tested in Node.

import { PATH_TYPE_LEGACY, PATH_TYPE_V2 } from './constants.js';
import { pathToRings } from './drawings.js';
import { drawingProps, isRecord, toText } from './utils.js';

export const LAYER_WALLS = 'walls';

// In width mode a token may brush a wall by this share of its half-width, so
// tokens fit corridors whose walls run along the cell edges.
const BODY_RATIO = 0.9;

const EPSILON = 1e-9;

const cache = new Map();

// ---------------------------------------------------------------------------
// Geometry (pure)
// ---------------------------------------------------------------------------

/**
 * Turns rings of points into wall segments.
 *
 * @param {number[][][]} rings Rings in page pixels.
 * @param {string} kind Barrier kind.
 * @returns {{a: number[], b: number[], kind: string}[]} Segments.
 */
export function ringsToSegments(rings, kind) {
  const segments = [];
  for (const ring of rings) {
    for (let i = 1; i < ring.length; i++) {
      const a = ring[i - 1];
      const b = ring[i];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) > EPSILON) {
        segments.push({ a, b, kind });
      }
    }
  }
  return segments;
}

/**
 * Returns the signed area of the triangle a, b, c (twice over).
 *
 * @param {number[]} a Point.
 * @param {number[]} b Point.
 * @param {number[]} c Point.
 * @returns {number} Cross product.
 */
function cross(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/**
 * Returns true when point p, known to be in line with a and b, lies between them.
 *
 * @param {number[]} a Segment start.
 * @param {number[]} b Segment end.
 * @param {number[]} p Point.
 * @returns {boolean} True when on the segment.
 */
function onSegment(a, b, p) {
  return (
    Math.min(a[0], b[0]) - EPSILON <= p[0] &&
    p[0] <= Math.max(a[0], b[0]) + EPSILON &&
    Math.min(a[1], b[1]) - EPSILON <= p[1] &&
    p[1] <= Math.max(a[1], b[1]) + EPSILON
  );
}

/**
 * Returns true when segment ab touches or crosses segment cd.
 *
 * @param {number[]} a First segment start.
 * @param {number[]} b First segment end.
 * @param {number[]} c Second segment start.
 * @param {number[]} d Second segment end.
 * @returns {boolean} True when they meet.
 */
export function segmentsCross(a, b, c, d) {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  if (
    ((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON)) &&
    ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))
  ) {
    return true;
  }
  return (
    (Math.abs(d1) <= EPSILON && onSegment(c, d, a)) ||
    (Math.abs(d2) <= EPSILON && onSegment(c, d, b)) ||
    (Math.abs(d3) <= EPSILON && onSegment(a, b, c)) ||
    (Math.abs(d4) <= EPSILON && onSegment(a, b, d))
  );
}

/**
 * Returns the distance from a point to a segment.
 *
 * @param {number[]} p Point.
 * @param {number[]} a Segment start.
 * @param {number[]} b Segment end.
 * @returns {number} Pixels.
 */
export function pointSegmentDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t =
    length > 0 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/**
 * Returns the shortest distance between two segments.
 *
 * @param {number[]} a First segment start.
 * @param {number[]} b First segment end.
 * @param {number[]} c Second segment start.
 * @param {number[]} d Second segment end.
 * @returns {number} Pixels (0 when they meet).
 */
export function segmentDistance(a, b, c, d) {
  if (segmentsCross(a, b, c, d)) {
    return 0;
  }
  return Math.min(
    pointSegmentDistance(a, c, d),
    pointSegmentDistance(b, c, d),
    pointSegmentDistance(c, a, b),
    pointSegmentDistance(d, a, b)
  );
}

/**
 * Returns the first wall a move runs into.
 *
 * With a radius of 0 only the line between the two centres is checked. With
 * a radius, the token's body must not pass through a wall either; a token
 * that already overlaps a wall may still move away from it.
 *
 * @param {{a: number[], b: number[]}[]} walls Wall segments.
 * @param {number[]} from [x, y] the token moves from.
 * @param {number[]} to [x, y] the token moves to.
 * @param {number} [radius=0] Half the token's width, in pixels.
 * @returns {object|null} The wall in the way, or null.
 */
export function blockingWall(walls, from, to, radius = 0) {
  for (const wall of walls) {
    if (segmentsCross(from, to, wall.a, wall.b)) {
      return wall;
    }
    if (radius > 0 && segmentDistance(from, to, wall.a, wall.b) < radius) {
      const startGap = pointSegmentDistance(from, wall.a, wall.b);
      if (startGap >= radius || pointSegmentDistance(to, wall.a, wall.b) < startGap) {
        return wall;
      }
    }
  }
  return null;
}

/**
 * Returns the radius a token's body is checked with.
 *
 * @param {number} width Token width.
 * @param {number} height Token height.
 * @returns {number} Pixels.
 */
export function bodyRadius(width, height) {
  return (Math.min(Number(width) || 0, Number(height) || 0) / 2) * BODY_RATIO;
}

/**
 * Converts a door's or window's position into a segment in page pixels.
 *
 * @param {object} props { x, y, path } where path holds handle0 and handle1.
 * @returns {number[][]|null} [start, end], or null when the path is missing.
 */
export function portalEnds(props) {
  let path = props.path;
  if (typeof path === 'string') {
    try {
      path = JSON.parse(path);
    } catch {
      return null;
    }
  }
  if (!isRecord(path) || !isRecord(path.handle0) || !isRecord(path.handle1)) {
    return null;
  }
  const x = Number(props.x) || 0;
  const y = Number(props.y) || 0;
  const end = (h) => [x + (Number(h.x) || 0), -(y + (Number(h.y) || 0))];
  return [end(path.handle0), end(path.handle1)];
}

/**
 * Returns true when walls of a kind block movement, given the settings.
 *
 * @param {string} kind wall, oneway, transparent, door or window (lower case).
 * @param {object} config Mod settings.
 * @returns {boolean} True when they block.
 */
export function kindBlocks(kind, config) {
  if (kind === 'oneway') {
    return config.oneWayWalls !== 'pass';
  }
  if (kind === 'transparent') {
    return config.transparentWalls !== 'pass';
  }
  return true;
}

// ---------------------------------------------------------------------------
// Reading barriers (Roll20)
// ---------------------------------------------------------------------------

/**
 * Forgets the barriers read from pages, for example after a wall or door changes.
 *
 * @returns {void}
 */
export function clearWallCache() {
  cache.clear();
}

/**
 * Reads every barrier on a page: walls of any kind and closed doors and windows.
 *
 * @param {string} pageId Page ID.
 * @returns {{a: number[], b: number[], kind: string}[]} Segments.
 */
function readWalls(pageId) {
  const page = getObj('page', pageId);
  const size = {
    width: Number(page?.get('width')) || 0,
    height: Number(page?.get('height')) || 0,
  };
  const segments = [];
  for (const type of [PATH_TYPE_V2, PATH_TYPE_LEGACY]) {
    for (const wall of findObjs({ _type: type, _pageid: pageId, layer: LAYER_WALLS })) {
      const kind = toText(wall.get('barrierType')).toLowerCase() || 'wall';
      segments.push(...ringsToSegments(pathToRings(drawingProps(wall), size), kind));
    }
  }
  for (const type of ['door', 'window']) {
    for (const portal of findObjs({ _type: type, _pageid: pageId })) {
      if (portal.get('isOpen') === true) {
        continue;
      }
      const ends = portalEnds({ x: portal.get('x'), y: portal.get('y'), path: portal.get('path') });
      if (ends) {
        segments.push({ a: ends[0], b: ends[1], kind: type });
      }
    }
  }
  return segments;
}

/**
 * Returns the barriers on a page that block movement with the given settings.
 *
 * @param {string} pageId Page ID.
 * @param {object} config Mod settings.
 * @returns {{a: number[], b: number[], kind: string}[]} Segments.
 */
export function getWalls(pageId, config) {
  if (!cache.has(pageId)) {
    cache.set(pageId, readWalls(pageId));
  }
  return cache.get(pageId).filter((wall) => kindBlocks(wall.kind, config));
}

/**
 * Returns true when a change to a drawing, door or window may change where
 * the walls are.
 *
 * @param {object} obj Roll20 object.
 * @param {object} [prev] Previous attributes.
 * @returns {boolean} True for barriers.
 */
export function isBarrier(obj, prev) {
  const type = obj.get('_type');
  if (type === 'door' || type === 'window') {
    return true;
  }
  return obj.get('layer') === LAYER_WALLS || prev?.layer === LAYER_WALLS;
}
