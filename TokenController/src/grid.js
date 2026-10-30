// Grid geometry for every Roll20 grid type. Pure functions only: nothing here
// touches the Roll20 API, so the whole module can be unit tested in Node.
//
// A grid answers three questions for the movement engine: where is the
// centre of the cell under a point (snap), where is the next cell in a screen
// direction (step), and how far apart are cells (pitch). Directions are screen
// directions: "U" is always up the screen, whatever the grid.

const SQRT3 = Math.sqrt(3);

export const GRID_SQUARE = 'square';
export const GRID_HEX = 'hex';
export const GRID_ISO = 'iso';

export const HEX_VERTICAL = 'vertical';
export const HEX_HORIZONTAL = 'horizontal';

// Roll20 pages measure everything in 70 px units.
const UNIT_PX = 70;

// Hex spacing of a 1-unit grid. Legacy values were measured from the Legacy
// editor's (slightly stretched) hexes; Jumpgate draws regular hexes 70 px
// across the flats with the first hex's bounding box at the page's top-left.
// These are the same profiles Hexploration v2 verified in both engines.
const HEX_PROFILES = {
  legacy: {
    [HEX_VERTICAL]: {
      colStep: 75.19856198446,
      rowStep: 66.965827824268,
      originX: 37.5,
      originY: 44,
    },
    [HEX_HORIZONTAL]: {
      colStep: 69.585127490377,
      rowStep: 79.688789983504,
      originX: 47,
      originY: 40.5,
    },
  },
  jumpgate: {
    [HEX_VERTICAL]: {
      colStep: UNIT_PX,
      rowStep: (UNIT_PX * SQRT3) / 2,
      originX: UNIT_PX / 2,
      originY: UNIT_PX / SQRT3,
    },
    [HEX_HORIZONTAL]: {
      colStep: (UNIT_PX * SQRT3) / 2,
      rowStep: UNIT_PX,
      originX: UNIT_PX / SQRT3,
      originY: UNIT_PX / 2,
    },
  },
};

// Isometric and dimetric cells are diamonds one unit tall. Isometric ones are
// √3 units wide and dimetric ones 2 units wide. Measured in Jumpgate: with no
// grid offset, a diamond centre sits at (0, ¾ of a diamond height).
const ISO_WIDTH_RATIO = { isometric: SQRT3, dimetric: 2 };

// Screen direction vectors (x right, y down), before scaling.
export const DIRECTIONS = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0],
  UL: [-1, -1],
  UR: [1, -1],
  DL: [-1, 1],
  DR: [1, 1],
};

const CUBE_DIRECTIONS = [
  [1, 0, -1],
  [1, -1, 0],
  [0, -1, 1],
  [-1, 0, 1],
  [-1, 1, 0],
  [0, 1, -1],
];

// Hex neighbours whose bearings differ by less than this are treated as a tie
// (for example "U" on a Hex (V) grid), and the step alternates between them.
const TIE_DEGREES = 5;

/**
 * Builds a grid description for a page.
 *
 * @param {object} options Grid options.
 * @param {string} [options.gridType='square'] Page grid_type.
 * @param {number} [options.snapping=1] Page snapping_increment (cell size in units, 0 = off).
 * @param {boolean} [options.showGrid=true] Page showgrid.
 * @param {boolean} [options.jumpgate=false] True for Jumpgate geometry.
 * @param {number} [options.offsetX=0] Jumpgate page grid_offset_x, in pixels.
 * @param {number} [options.offsetY=0] Jumpgate page grid_offset_y, in pixels, measured upwards.
 * @param {object|null} [options.calibration] Per-page { dx, dy, scale } correction.
 * @returns {object} Grid object.
 */
export function createGrid({
  gridType = 'square',
  snapping = 1,
  showGrid = true,
  jumpgate = false,
  offsetX = 0,
  offsetY = 0,
  calibration = null,
} = {}) {
  const snapValue = Number(snapping);
  const snap = snapValue > 0 && showGrid !== false;
  const scale =
    (snapValue > 0 ? snapValue : 1) *
    (calibration && Number(calibration.scale) > 0 ? Number(calibration.scale) : 1);
  const shiftX = (jumpgate ? Number(offsetX) || 0 : 0) + (Number(calibration?.dx) || 0);
  const shiftY = (jumpgate ? -(Number(offsetY) || 0) : 0) + (Number(calibration?.dy) || 0);

  if (gridType === 'hex' || gridType === 'hexr') {
    const orientation = gridType === 'hex' ? HEX_VERTICAL : HEX_HORIZONTAL;
    const profile = HEX_PROFILES[jumpgate ? 'jumpgate' : 'legacy'][orientation];
    return {
      kind: GRID_HEX,
      snap,
      orientation,
      colStep: profile.colStep * scale,
      rowStep: profile.rowStep * scale,
      originX: profile.originX * scale + shiftX,
      originY: profile.originY * scale + shiftY,
    };
  }

  if (gridType === 'isometric' || gridType === 'dimetric') {
    const height = UNIT_PX * scale;
    const width = height * ISO_WIDTH_RATIO[gridType];
    return {
      kind: GRID_ISO,
      snap,
      width,
      height,
      originX: shiftX,
      originY: (height * 3) / 4 + shiftY,
    };
  }

  const unit = UNIT_PX * scale;
  return {
    kind: GRID_SQUARE,
    snap,
    unit,
    originX: shiftX,
    originY: shiftY,
  };
}

// ---------------------------------------------------------------------------
// Hex helpers
// ---------------------------------------------------------------------------

/**
 * Converts offset coordinates to cube coordinates.
 *
 * @param {object} grid Hex grid.
 * @param {number} row Row.
 * @param {number} col Column.
 * @returns {number[]} [q, r, s].
 */
function offsetToCube(grid, row, col) {
  if (grid.orientation === HEX_VERTICAL) {
    const q = col - (row - (row & 1)) / 2;
    return [q, row, -q - row];
  }
  const r = row - (col - (col & 1)) / 2;
  return [col, r, -col - r];
}

/**
 * Converts cube coordinates to offset coordinates.
 *
 * @param {object} grid Hex grid.
 * @param {number[]} cube [q, r, s].
 * @returns {number[]} [row, col].
 */
function cubeToOffset(grid, [q, r]) {
  if (grid.orientation === HEX_VERTICAL) {
    return [r, q + (r - (r & 1)) / 2];
  }
  return [r + (q - (q & 1)) / 2, q];
}

/**
 * Rounds fractional cube coordinates to the nearest hex.
 *
 * @param {number[]} cube Fractional [q, r, s].
 * @returns {number[]} Integer [q, r, s].
 */
function cubeRound(cube) {
  let q = Math.round(cube[0]);
  let r = Math.round(cube[1]);
  let s = Math.round(cube[2]);
  const dq = Math.abs(q - cube[0]);
  const dr = Math.abs(r - cube[1]);
  const ds = Math.abs(s - cube[2]);
  if (dq > dr && dq > ds) {
    q = -r - s;
  } else if (dr > ds) {
    r = -q - s;
  } else {
    s = -q - r;
  }
  return [q + 0, r + 0, s + 0];
}

/**
 * Returns the pixel centre of a hex.
 *
 * @param {object} grid Hex grid.
 * @param {number} row Row.
 * @param {number} col Column.
 * @returns {number[]} [x, y].
 */
export function hexToPixel(grid, row, col) {
  if (grid.orientation === HEX_VERTICAL) {
    return [
      grid.originX + (col + ((row & 1) === 1 ? 0.5 : 0)) * grid.colStep,
      grid.originY + row * grid.rowStep,
    ];
  }
  return [
    grid.originX + col * grid.colStep,
    grid.originY + (row + ((col & 1) === 1 ? 0.5 : 0)) * grid.rowStep,
  ];
}

/**
 * Returns the hex containing a pixel position.
 *
 * @param {object} grid Hex grid.
 * @param {number} x Pixel x.
 * @param {number} y Pixel y.
 * @returns {number[]} [row, col].
 */
export function pixelToHex(grid, x, y) {
  const colF = (x - grid.originX) / grid.colStep;
  const rowF = (y - grid.originY) / grid.rowStep;
  const q = grid.orientation === HEX_VERTICAL ? colF - rowF / 2 : colF;
  const r = grid.orientation === HEX_VERTICAL ? rowF : rowF - colF / 2;
  return cubeToOffset(grid, cubeRound([q, r, -q - r]));
}

/**
 * Returns a screen bearing in degrees (0 = up, 90 = right) for a vector.
 *
 * @param {number} dx X component.
 * @param {number} dy Y component (down is positive).
 * @returns {number} Bearing in [0, 360).
 */
export function bearing(dx, dy) {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/**
 * Returns the smallest difference between two bearings.
 *
 * @param {number} a Bearing.
 * @param {number} b Bearing.
 * @returns {number} Difference in [0, 180].
 */
function bearingDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Steps one hex in a screen direction. When the direction falls between two
 * neighbours (for example "U" on a Hex (V) grid) the step zigzags: it picks the
 * neighbour closest to the reference line, so a run of steps stays on course
 * and a step back returns to the same hex.
 *
 * @param {object} grid Hex grid.
 * @param {number[]} from [x, y].
 * @param {number[]} vector Direction vector.
 * @param {number|null} ref Lateral coordinate to keep close to (x on Hex (V),
 *        y on Hex (H)); on a tie the neighbour to the left (Hex (V)) or above
 *        (Hex (H)) is picked.
 * @returns {number[]} [x, y] of the neighbour's centre.
 */
function hexStep(grid, from, vector, ref) {
  const [row, col] = pixelToHex(grid, from[0], from[1]);
  const [cx, cy] = hexToPixel(grid, row, col);
  const [q, r, s] = offsetToCube(grid, row, col);
  const want = bearing(vector[0], vector[1]);
  const options = CUBE_DIRECTIONS.map(([dq, dr, ds]) => {
    const [nr, nc] = cubeToOffset(grid, [q + dq, r + dr, s + ds]);
    const [x, y] = hexToPixel(grid, nr, nc);
    const b = bearing(x - cx, y - cy);
    return { x, y, b, diff: bearingDiff(b, want) };
  }).sort((a, b) => a.diff - b.diff);

  const [best, second] = options;
  if (second.diff - best.diff < TIE_DEGREES) {
    const lateral = (p) => (grid.orientation === HEX_VERTICAL ? p.x : p.y);
    if (ref !== null && ref !== undefined) {
      const da = Math.abs(lateral(best) - ref);
      const db = Math.abs(lateral(second) - ref);
      if (Math.abs(da - db) > 0.5) {
        const pick = da < db ? best : second;
        return [pick.x, pick.y];
      }
    }
    // Otherwise lean the same way (left on Hex (V), up on Hex (H)) whichever
    // way the token travels, so stepping back retraces the same hexes.
    const pick = lateral(best) < lateral(second) ? best : second;
    return [pick.x, pick.y];
  }
  return [best.x, best.y];
}

// ---------------------------------------------------------------------------
// Public geometry
// ---------------------------------------------------------------------------

/**
 * Returns the centre of the cell under a point. Gridless pages (no snapping)
 * return the point unchanged.
 *
 * @param {object} grid Grid object.
 * @param {number} x Pixel x.
 * @param {number} y Pixel y.
 * @returns {number[]} [x, y].
 */
export function snapToCell(grid, x, y) {
  if (!grid.snap) {
    return [x, y];
  }
  if (grid.kind === GRID_HEX) {
    const [row, col] = pixelToHex(grid, x, y);
    return hexToPixel(grid, row, col);
  }
  if (grid.kind === GRID_ISO) {
    // Diamond lattice: centres at origin + ((a - b) * w/2, (a + b) * h/2).
    const u = (x - grid.originX) / (grid.width / 2);
    const v = (y - grid.originY) / (grid.height / 2);
    const a = Math.round((u + v) / 2);
    const b = Math.round((v - u) / 2);
    return [grid.originX + ((a - b) * grid.width) / 2, grid.originY + ((a + b) * grid.height) / 2];
  }
  const cx = grid.originX + (Math.floor((x - grid.originX) / grid.unit) + 0.5) * grid.unit;
  const cy = grid.originY + (Math.floor((y - grid.originY) / grid.unit) + 0.5) * grid.unit;
  return [cx, cy];
}

/**
 * Steps one cell from a point in a screen direction.
 *
 * Square and gridless pages move one unit (diagonals one unit on each axis).
 * Hex pages move to a neighbouring hex. Isometric and dimetric pages move
 * along the screen: diagonals cross one diamond edge, straight moves cross a
 * corner.
 *
 * @param {object} grid Grid object.
 * @param {number[]} from [x, y].
 * @param {string} dir Direction key from DIRECTIONS.
 * @param {number|null} [ref=null] Lateral reference for hex zigzags (see lateralCoordinate).
 * @returns {number[]} [x, y].
 */
export function stepFrom(grid, from, dir, ref = null) {
  const vector = DIRECTIONS[dir];
  if (!vector) {
    return [from[0], from[1]];
  }
  if (grid.kind === GRID_HEX) {
    return hexStep(grid, from, vector, ref);
  }
  if (grid.kind === GRID_ISO) {
    const diagonal = vector[0] !== 0 && vector[1] !== 0;
    const fx = diagonal ? grid.width / 2 : grid.width;
    const fy = diagonal ? grid.height / 2 : grid.height;
    return [from[0] + vector[0] * fx, from[1] + vector[1] * fy];
  }
  return [from[0] + vector[0] * grid.unit, from[1] + vector[1] * grid.unit];
}

/**
 * Returns true when a direction falls between two hex neighbours, so steps in
 * it zigzag around a reference line.
 *
 * @param {object} grid Grid object.
 * @param {string} dir Direction key.
 * @returns {boolean} True when the direction zigzags.
 */
export function directionZigzags(grid, dir) {
  if (grid.kind !== GRID_HEX) {
    return false;
  }
  return grid.orientation === HEX_VERTICAL
    ? dir === 'U' || dir === 'D'
    : dir === 'L' || dir === 'R';
}

/**
 * Returns the coordinate a zigzag keeps close to: x on Hex (V), y on Hex (H).
 *
 * @param {object} grid Grid object.
 * @param {number[]} point [x, y].
 * @returns {number} Lateral coordinate.
 */
export function lateralCoordinate(grid, point) {
  return grid.orientation === HEX_VERTICAL ? point[0] : point[1];
}

/**
 * Returns the typical distance between neighbouring cell centres, used to
 * split long waypoint legs into cell-sized steps.
 *
 * @param {object} grid Grid object.
 * @returns {number} Pixels.
 */
export function cellPitch(grid) {
  if (grid.kind === GRID_HEX) {
    return Math.min(grid.colStep, grid.rowStep);
  }
  if (grid.kind === GRID_ISO) {
    return Math.hypot(grid.width / 2, grid.height / 2);
  }
  return grid.unit;
}

/**
 * Returns the axis and spacing used to measure the cell size from two tokens
 * in neighbouring cells: a row for square, Hex (V) and iso grids, a column for
 * Hex (H) grids.
 *
 * @param {object} grid Grid object.
 * @returns {{axis: number, pitch: number}} Axis (0 = x, 1 = y) and pixels per cell.
 */
function calibrationAxis(grid) {
  if (grid.kind === GRID_HEX) {
    return grid.orientation === HEX_VERTICAL
      ? { axis: 0, pitch: grid.colStep }
      : { axis: 1, pitch: grid.rowStep };
  }
  if (grid.kind === GRID_ISO) {
    return { axis: 0, pitch: grid.width };
  }
  return { axis: 0, pitch: grid.unit };
}

/**
 * Derives a page calibration from tokens the GM has snapped to cell centres.
 *
 * One token corrects the grid's position. Two tokens in neighbouring cells of
 * the same row (same column on Hex (H) grids) also correct the cell size.
 *
 * @param {object} options Options used to build the uncalibrated grid (see createGrid).
 * @param {number[][]} points Token centres [[x, y], ...].
 * @returns {{dx: number, dy: number, scale: number}|null} Calibration, or null
 *          when the points cannot be used.
 */
export function calibrateGrid(options, points) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }
  const base = createGrid({ ...options, calibration: null });
  let scale = 1;
  if (points.length >= 2) {
    const { axis, pitch } = calibrationAxis(base);
    const [a, b] = points;
    const along = Math.abs(b[axis] - a[axis]);
    const across = Math.abs(b[1 - axis] - a[1 - axis]);
    const cells = Math.round(along / pitch);
    if (cells < 1 || across > pitch / 4) {
      return null;
    }
    scale = along / (cells * pitch);
  }
  const scaled = createGrid({ ...options, calibration: { scale, dx: 0, dy: 0 }, showGrid: true });
  const forced = { ...scaled, snap: true };
  const [px, py] = points[0];
  const [cx, cy] = snapToCell(forced, px, py);
  return { dx: px - cx, dy: py - cy, scale };
}
