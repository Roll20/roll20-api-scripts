// Turns Roll20 drawings into route waypoints. Pure functions only: callers
// pass plain property objects, so the module can be unit tested in Node.
// The geometry is shared with Hexploration v2.
//
// Both kinds of Roll20 path store points relative to their own bounding box
// and are placed by their centre:
//   - Legacy `path`: `_path` is a JSON list of SVG-like commands (M, L, Q, C),
//     placed by left/top, sized by width/height, scaled by scaleX/scaleY.
//   - Jumpgate `pathv2`: `points` is a JSON list of [x, y] pairs interpreted by
//     `shape` (pol, free, rec, eli and others) and placed by x/y. It has no scale.
// Both can be rotated by `rotation` degrees about their centre.

const UNIT_PX = 70;
const ELLIPSE_SEGMENTS = 16;
const CURVE_SEGMENTS = 8;

// Freehand drawings have a point every few pixels. Points closer together
// than this are merged so the route keeps its shape without thousands of legs.
const SIMPLIFY_PX = 10;

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

  // Rectangles and ellipses are closed shapes, so their rings end where they start.
  let ring;
  if (props.shape === 'rec') {
    ring = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
      [0, 0],
    ];
  } else if (props.shape === 'eli') {
    const points = ellipsePoints(width, height);
    ring = [...points, points[0]];
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
 * Drops points that are closer than `minGap` to the previous kept point,
 * always keeping the first and last points.
 *
 * @param {number[][]} points Array of [x, y].
 * @param {number} [minGap=SIMPLIFY_PX] Minimum gap in pixels.
 * @returns {number[][]} Simplified points.
 */
export function simplifyPoints(points, minGap = SIMPLIFY_PX) {
  if (points.length <= 2) {
    return points.map(([x, y]) => [x, y]);
  }
  const kept = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = kept.at(-1);
    if (Math.hypot(points[i][0] - px, points[i][1] - py) >= minGap) {
      kept.push(points[i]);
    }
  }
  const last = points.at(-1);
  const [lx, ly] = kept.at(-1);
  if (kept.length > 1 && Math.hypot(last[0] - lx, last[1] - ly) < minGap) {
    kept.pop();
  }
  kept.push(last);
  return kept.map(([x, y]) => [x, y]);
}

/**
 * Returns the waypoints of a drawing: the first line of the drawing, in the
 * order it was drawn, in page pixels.
 *
 * @param {object} props Path properties including `type` ('path' or 'pathv2').
 * @param {object} [page] Page size in units, for Legacy mapWidth/mapHeight paths.
 * @returns {{points: number[][], closed: boolean}|null} Waypoints and whether
 *          the drawing ends where it starts, or null when it has fewer than two points.
 */
export function drawingWaypoints(props, page) {
  const [ring] = pathToRings(props, page);
  if (!ring || ring.length < 2) {
    return null;
  }
  const points = simplifyPoints(ring);
  if (points.length < 2) {
    return null;
  }
  const first = points[0];
  const last = points.at(-1);
  const closed = points.length > 2 && Math.hypot(first[0] - last[0], first[1] - last[1]) < 1;
  return { points, closed };
}
