// Bounce routes: a token wanders inside a drawn area, travelling in straight
// lines and bouncing off the area's edges (and walls) like a ball in Pong.
// Pure functions only, so the module can be unit tested in Node.
//
// On pages with a grid the token steps from cell to cell, choosing each time
// the neighbour that keeps it closest to its line of travel, so it moves at
// an angle like a line drawn on squared paper. On gridless pages it moves a
// cell's width along its heading. At an edge its heading is reflected off the
// edge and turned by a few random degrees, so its path does not repeat.

import { bearing, cellPitch, DIRECTIONS, directionZigzags, snapToCell, stepFrom } from './grid.js';
import { segmentsCross } from './walls.js';

// Each bounce turns the reflected heading by up to this many degrees either way.
const JITTER_DEGREES = 20;

// How many random points to try when picking a random cell inside an area.
const RANDOM_TRIES = 200;

/**
 * Returns a unit vector for a screen bearing (0 = up, 90 = right).
 *
 * @param {number} degrees Bearing.
 * @returns {number[]} [x, y] with y down.
 */
export function headingVector(degrees) {
  const radians = (degrees * Math.PI) / 180;
  return [Math.sin(radians), -Math.cos(radians)];
}

/**
 * Returns true when a point is inside a polygon (even-odd rule).
 *
 * @param {number[]} point [x, y].
 * @param {number[][]} polygon Corners, in order.
 * @returns {boolean} True when inside.
 */
export function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Returns the polygon's edges as segments.
 *
 * @param {number[][]} polygon Corners.
 * @returns {{a: number[], b: number[]}[]} Edges, including the closing one.
 */
export function polygonEdges(polygon) {
  return polygon.map((a, i) => ({ a, b: polygon[(i + 1) % polygon.length] }));
}

/**
 * Returns the polygon's centroid (the average of its corners).
 *
 * @param {number[][]} polygon Corners.
 * @returns {number[]} [x, y].
 */
export function polygonCentre(polygon) {
  const sum = polygon.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / polygon.length, sum[1] / polygon.length];
}

/**
 * Reflects a heading off a segment.
 *
 * @param {number} heading Bearing in degrees.
 * @param {{a: number[], b: number[]}} edge The edge it hits.
 * @returns {number} The reflected bearing.
 */
export function reflectHeading(heading, edge) {
  const [vx, vy] = headingVector(heading);
  const ex = edge.b[0] - edge.a[0];
  const ey = edge.b[1] - edge.a[1];
  const length = Math.hypot(ex, ey) || 1;
  const nx = -ey / length;
  const ny = ex / length;
  const dot = vx * nx + vy * ny;
  return bearing(vx - 2 * dot * nx, vy - 2 * dot * ny);
}

/**
 * Picks a random cell centre inside an area.
 *
 * @param {object} grid Grid object.
 * @param {number[][]} polygon Area corners.
 * @param {() => number} random Random number source in [0, 1).
 * @returns {number[]|null} [x, y], or null when no cell was found.
 */
export function randomPointInArea(grid, polygon, random) {
  const xs = polygon.map((p) => p[0]);
  const ys = polygon.map((p) => p[1]);
  const [left, right, top, bottom] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  for (let i = 0; i < RANDOM_TRIES; i++) {
    const x = left + random() * (right - left);
    const y = top + random() * (bottom - top);
    const point = snapToCell(grid, x, y);
    if (pointInPolygon(point, polygon)) {
      return point;
    }
  }
  return null;
}

/**
 * Returns the first edge a move crosses.
 *
 * @param {number[]} from [x, y].
 * @param {number[]} to [x, y].
 * @param {{a: number[], b: number[]}[]} edges Edges.
 * @returns {object|null} The nearest edge crossed, or null.
 */
function firstEdgeCrossed(from, to, edges) {
  let best = null;
  let bestDistance = Infinity;
  for (const edge of edges) {
    if (segmentsCross(from, to, edge.a, edge.b)) {
      const mid = [(edge.a[0] + edge.b[0]) / 2, (edge.a[1] + edge.b[1]) / 2];
      const distance = Math.hypot(mid[0] - from[0], mid[1] - from[1]);
      if (distance < bestDistance) {
        best = edge;
        bestDistance = distance;
      }
    }
  }
  return best;
}

/**
 * Returns the cells (or, on gridless pages, the point) a token could move to
 * next along a line, best first.
 *
 * @param {object} grid Grid object.
 * @param {number[]} pos Token position.
 * @param {number[]} origin A point on the line of travel.
 * @param {number} heading Bearing in degrees.
 * @returns {number[][]} Candidate positions.
 */
function candidates(grid, pos, origin, heading) {
  const [ux, uy] = headingVector(heading);
  if (!grid.snap) {
    const pitch = cellPitch(grid);
    return [[pos[0] + ux * pitch, pos[1] + uy * pitch]];
  }
  return Object.keys(DIRECTIONS)
    .filter((dir) => !directionZigzags(grid, dir))
    .map((dir) => stepFrom(grid, pos, dir))
    .map((next) => {
      const progress = (next[0] - pos[0]) * ux + (next[1] - pos[1]) * uy;
      // Distance of the cell from the line of travel.
      const offLine = Math.abs((next[0] - origin[0]) * uy - (next[1] - origin[1]) * ux);
      return { next, progress, offLine };
    })
    .filter((c) => c.progress > 1e-6)
    .sort((a, b) => a.offLine - b.offLine || b.progress - a.progress)
    .map((c) => c.next);
}

/**
 * Works out a bouncing token's next move.
 *
 * @param {object} options Options.
 * @param {object} options.grid Grid object.
 * @param {number[]} options.pos Token position.
 * @param {number} options.heading Current bearing in degrees.
 * @param {number[]} options.origin Where the current line of travel started.
 * @param {number[][]} options.polygon Area corners.
 * @param {(from: number[], to: number[]) => object|null} [options.blockedBy]
 *        Returns the wall (with a and b) in the way of a move, or null.
 * @param {() => number} [options.random] Random number source in [0, 1).
 * @returns {{to: number[]|null, heading: number, origin: number[]}} Where to
 *          move (null to stay put this time), and the line to follow next.
 */
export function nextBounce({
  grid,
  pos,
  heading,
  origin,
  polygon,
  blockedBy = () => null,
  random = Math.random,
}) {
  const edges = polygonEdges(polygon);
  const outside = !pointInPolygon(pos, polygon);
  if (outside) {
    // Dragged out of its area: head back towards the middle of it.
    const centre = polygonCentre(polygon);
    heading = bearing(centre[0] - pos[0], centre[1] - pos[1]);
    origin = pos;
  }

  const obstacle = (to) => {
    const wall = blockedBy(pos, to);
    if (wall) {
      return wall;
    }
    if (outside) {
      return null;
    }
    return firstEdgeCrossed(pos, to, edges) || (pointInPolygon(to, polygon) ? null : edges[0]);
  };

  let current = heading;
  let line = origin;
  for (let attempt = 0; attempt < 3; attempt++) {
    const options = candidates(grid, pos, line, current);
    const to = options.find((next) => !obstacle(next));
    const hit = options.length > 0 ? obstacle(options[0]) : null;
    // The first time, a cell that is in the way means a bounce rather than a
    // slide along the edge.
    if (to && (!hit || attempt > 0)) {
      return { to, heading: current, origin: line };
    }
    // Bounce off what is in the way: reflect, turn a little at random and
    // start a new line from here. If that fails too, go straight back.
    const jitter = (random() * 2 - 1) * JITTER_DEGREES;
    current =
      attempt === 0 && hit
        ? (reflectHeading(current, hit) + jitter + 360) % 360
        : (current + 180 + jitter + 360) % 360;
    line = pos;
  }
  return { to: null, heading: current, origin: pos };
}
