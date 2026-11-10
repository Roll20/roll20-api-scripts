// Polygon maths for Roll20 drawn shapes. Pure functions only: callers pass
// plain property objects, so the module can be unit tested in Node.
//
// Both kinds of Roll20 path store points relative to their own bounding box
// and are placed by their centre:
//   - Legacy `path`: `_path` is a JSON list of SVG-like commands (M, L, Q, C),
//     placed by left/top, sized by width/height, scaled by scaleX/scaleY.
//   - Jumpgate `pathv2`: `points` is a JSON list of [x, y] pairs interpreted by
//     `shape` (pol, free, rec, eli) and placed by x/y. It has no scale.
// Both can be rotated by `rotation` degrees about their centre.

const UNIT_PX = 70;
const ELLIPSE_SEGMENTS = 32;
const CURVE_SEGMENTS = 8;

/**
 * Returns the bounding box of a list of points.
 *
 * @param {number[][]} points Array of [x, y].
 * @returns {{left: number, top: number, right: number, bottom: number}} Bounding box.
 */
export function boundingBox(points) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const [x, y] of points) {
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
  return { left, top, right, bottom };
}

/**
 * Tests whether a point lies inside a polygon ring (even-odd rule). The ring
 * is treated as closed whether or not its last point repeats the first.
 *
 * @param {number[]} point [x, y].
 * @param {number[][]} ring Array of [x, y].
 * @returns {boolean} True when inside.
 */
export function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (crosses) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Tests whether a point lies inside any of a shape's rings (even-odd across
 * rings, so a ring drawn inside another makes a hole).
 *
 * @param {number[]} point [x, y].
 * @param {number[][][]} rings Array of rings.
 * @returns {boolean} True when inside.
 */
export function pointInShape(point, rings) {
  let inside = false;
  for (const ring of rings) {
    if (ring.length >= 3 && pointInRing(point, ring)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Builds a transform from path-local coordinates to page pixels.
 *
 * @param {object} t Transform values.
 * @returns {(x: number, y: number) => number[]} Point transform.
 */
function makeTransform({ width, height, cx, cy, scaleX = 1, scaleY = 1, rotation = 0 }) {
  const angle = ((Number(rotation) || 0) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return (x, y) => {
    const lx = (x - width / 2) * scaleX;
    const ly = (y - height / 2) * scaleY;
    return [cx + lx * cos - ly * sin, cy + lx * sin + ly * cos];
  };
}

/**
 * Samples a quadratic Bezier curve.
 *
 * @param {number[]} p0 Start point.
 * @param {number[]} p1 Control point.
 * @param {number[]} p2 End point.
 * @returns {number[][]} Points after the start point.
 */
function sampleQuadratic(p0, p1, p2) {
  const points = [];
  for (let i = 1; i <= CURVE_SEGMENTS; i++) {
    const t = i / CURVE_SEGMENTS;
    const u = 1 - t;
    points.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }
  return points;
}

/**
 * Samples a cubic Bezier curve.
 *
 * @param {number[]} p0 Start point.
 * @param {number[]} p1 First control point.
 * @param {number[]} p2 Second control point.
 * @param {number[]} p3 End point.
 * @returns {number[][]} Points after the start point.
 */
function sampleCubic(p0, p1, p2, p3) {
  const points = [];
  for (let i = 1; i <= CURVE_SEGMENTS; i++) {
    const t = i / CURVE_SEGMENTS;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    points.push([
      a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
      a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    ]);
  }
  return points;
}

/**
 * Converts a Legacy path's command list into rings in path-local coordinates.
 *
 * @param {Array[]} commands Parsed `_path` commands.
 * @returns {number[][][]} Rings.
 */
function legacyCommandsToRings(commands) {
  const rings = [];
  let ring = [];
  let prevType = null;
  for (const cmd of commands) {
    if (!Array.isArray(cmd)) {
      continue;
    }
    const [type, ...args] = cmd;
    const nums = args.map(Number);
    const prev = ring.at(-1);
    if (type === 'M' && prevType !== 'M') {
      if (ring.length > 0) {
        rings.push(ring);
      }
      ring = [[nums[0], nums[1]]];
    } else if (type === 'L' || type === 'M') {
      // Two consecutive Ms are drawn by Roll20 as a line, so treat the second as L.
      ring.push([nums[0], nums[1]]);
    } else if (type === 'Q' && prev) {
      ring.push(...sampleQuadratic(prev, [nums[0], nums[1]], [nums[2], nums[3]]));
    } else if (type === 'C' && prev) {
      ring.push(...sampleCubic(prev, [nums[0], nums[1]], [nums[2], nums[3]], [nums[4], nums[5]]));
    }
    prevType = type;
  }
  if (ring.length > 0) {
    rings.push(ring);
  }
  return rings;
}

/**
 * Returns points approximating an ellipse inside a box.
 *
 * @param {number} width Box width.
 * @param {number} height Box height.
 * @returns {number[][]} Points in box-local coordinates.
 */
function ellipsePoints(width, height) {
  const points = [];
  for (let i = 0; i < ELLIPSE_SEGMENTS; i++) {
    const angle = (i / ELLIPSE_SEGMENTS) * Math.PI * 2;
    points.push([
      width / 2 + (Math.cos(angle) * width) / 2,
      height / 2 + (Math.sin(angle) * height) / 2,
    ]);
  }
  return points;
}

/**
 * Parses a JSON string, returning null on failure.
 *
 * @param {string} text JSON text.
 * @returns {*} Parsed value, or null.
 */
function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Converts a Legacy path's properties into page-space rings.
 *
 * @param {object} props Path properties (_path, left, top, width, height, scaleX, scaleY, rotation).
 * @param {object} [page] Page size in units ({ width, height }) for mapWidth/mapHeight paths.
 * @returns {number[][][]} Rings in page pixels.
 */
export function legacyPathToRings(props, page = {}) {
  const raw = String(props._path || props.path || '')
    .replaceAll('mapWidth', String((Number(page.width) || 0) * UNIT_PX))
    .replaceAll('mapHeight', String((Number(page.height) || 0) * UNIT_PX));
  const commands = safeJson(raw);
  if (!Array.isArray(commands)) {
    return [];
  }
  const transform = makeTransform({
    width: Number(props.width) || 0,
    height: Number(props.height) || 0,
    cx: Number(props.left) || 0,
    cy: Number(props.top) || 0,
    scaleX: Number(props.scaleX) || 1,
    scaleY: Number(props.scaleY) || 1,
    rotation: props.rotation,
  });
  return legacyCommandsToRings(commands).map((ring) => ring.map(([x, y]) => transform(x, y)));
}

/**
 * Converts a Jumpgate pathv2's properties into page-space rings.
 *
 * @param {object} props Path properties (points, shape, x, y, rotation).
 * @returns {number[][][]} Rings in page pixels.
 */
export function pathV2ToRings(props) {
  const parsed = safeJson(props.points);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [];
  }
  const raw = parsed
    .filter((p) => Array.isArray(p) && p.length >= 2)
    .map(([x, y]) => [Number(x), Number(y)])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (raw.length === 0) {
    return [];
  }

  // Points are normalised so the bounding box starts at 0,0.
  const box = boundingBox(raw);
  const local = raw.map(([x, y]) => [x - box.left, y - box.top]);
  const width = box.right - box.left;
  const height = box.bottom - box.top;

  let ring;
  if (props.shape === 'rec') {
    ring = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ];
  } else if (props.shape === 'eli') {
    ring = ellipsePoints(width, height);
  } else {
    ring = local;
  }

  const transform = makeTransform({
    width,
    height,
    cx: Number(props.x) || 0,
    cy: Number(props.y) || 0,
    rotation: props.rotation,
  });
  return [ring.map(([x, y]) => transform(x, y))];
}

/**
 * Converts either kind of path into page-space rings.
 *
 * @param {object} props Path properties including `type` ('path' or 'pathv2').
 * @param {object} [page] Page size in units, for Legacy mapWidth/mapHeight paths.
 * @returns {number[][][]} Rings in page pixels.
 */
export function pathToRings(props, page) {
  if (props.type === 'pathv2') {
    return pathV2ToRings(props);
  }
  return legacyPathToRings(props, page);
}

/**
 * Builds the properties for a closed polygon as either kind of path.
 * Points are made relative to their bounding box, and the path is placed by
 * its centre, matching how Roll20 stores both path types.
 *
 * @param {number[][]} points Polygon corners in page pixels.
 * @param {boolean} jumpgate True to build a pathv2, false for a Legacy path.
 * @returns {object} Geometry properties for createObj.
 */
export function polygonPathProps(points, jumpgate) {
  const box = boundingBox(points);
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const cx = box.left + width / 2;
  const cy = box.top + height / 2;
  const round = (n) => Math.round(n * 1000) / 1000;
  const local = points.map(([x, y]) => [round(x - box.left), round(y - box.top)]);
  const closed = [...local, local[0]];

  if (jumpgate) {
    return {
      shape: 'pol',
      points: JSON.stringify(closed),
      x: cx,
      y: cy,
    };
  }

  const commands = closed.map(([x, y], i) => [i === 0 ? 'M' : 'L', x, y]);
  return {
    _path: JSON.stringify(commands),
    left: cx,
    top: cy,
    width,
    height,
  };
}

/**
 * Returns the centroid of a ring's distinct vertices.
 *
 * @param {number[][]} ring Array of [x, y].
 * @returns {number[]} [x, y].
 */
export function ringCentre(ring) {
  const pts = distinctVertices(ring);
  const sum = pts.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / pts.length, sum[1] / pts.length];
}

/**
 * Returns a ring's vertices with a repeated closing point removed.
 *
 * @param {number[][]} ring Array of [x, y].
 * @returns {number[][]} Distinct vertices.
 */
export function distinctVertices(ring) {
  if (ring.length > 1) {
    const first = ring[0];
    const last = ring.at(-1);
    if (Math.abs(first[0] - last[0]) < 0.01 && Math.abs(first[1] - last[1]) < 0.01) {
      return ring.slice(0, -1);
    }
  }
  return ring;
}
