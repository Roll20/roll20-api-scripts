// Hex grid geometry. Pure functions only: nothing here touches the Roll20 API,
// so the whole module can be unit tested in Node.
//
// Hexes are addressed by offset coordinates [row, col], matching the keys v1
// stored in state. "vertical" is Roll20's Hex (V) grid (pointy-top hexes, odd
// rows shifted right by half a hex). "horizontal" is Hex (H) (flat-top hexes,
// odd columns shifted down by half a hex). Internally the maths converts to
// cube coordinates, which make distance, rounding and line drawing exact.

const SQRT3 = Math.sqrt(3);

export const ORIENTATION_VERTICAL = 'vertical';
export const ORIENTATION_HORIZONTAL = 'horizontal';

// Pixel spacing of a 1-unit hex grid.
//
// Legacy values were measured from the Legacy editor's grid by the v1 author
// and are kept exactly so existing v1 hexes stay aligned. Legacy hexes are
// slightly stretched rather than regular.
//
// Jumpgate draws mathematically regular hexes from the 70 px grid unit: the
// distance across the flats is one unit, so the corner radius is 70/√3. The
// first hex's bounding box sits at the page's top-left corner. (Taken from the
// Jumpgate client's hex grid, which builds cells with radius gridCellSize/√3.)
// Pages that still do not line up can be corrected with `!hexploration calibrate`.
const LEGACY_V = { colStep: 75.19856198446, rowStep: 66.965827824268, originX: 37.5, originY: 44 };
const LEGACY_H = { colStep: 69.585127490377, rowStep: 79.688789983504, originX: 47, originY: 40.5 };
const JUMPGATE_UNIT = 70;

export const GRID_PROFILES = {
  legacy: {
    [ORIENTATION_VERTICAL]: LEGACY_V,
    [ORIENTATION_HORIZONTAL]: LEGACY_H,
  },
  jumpgate: {
    [ORIENTATION_VERTICAL]: {
      colStep: JUMPGATE_UNIT,
      rowStep: (JUMPGATE_UNIT * SQRT3) / 2,
      originX: JUMPGATE_UNIT / 2,
      originY: JUMPGATE_UNIT / SQRT3,
    },
    [ORIENTATION_HORIZONTAL]: {
      colStep: (JUMPGATE_UNIT * SQRT3) / 2,
      rowStep: JUMPGATE_UNIT,
      originX: JUMPGATE_UNIT / SQRT3,
      originY: JUMPGATE_UNIT / 2,
    },
  },
};

const CUBE_DIRECTIONS = [
  [1, 0, -1],
  [1, -1, 0],
  [0, -1, 1],
  [-1, 0, 1],
  [-1, 1, 0],
  [0, 1, -1],
];

/**
 * Maps a Roll20 page grid_type to a hex orientation.
 *
 * @param {string} gridType Page grid_type ('hex' or 'hexr').
 * @returns {string|null} Orientation, or null when the grid is not hexagonal.
 */
export function orientationForGridType(gridType) {
  if (gridType === 'hex') {
    return ORIENTATION_VERTICAL;
  }
  if (gridType === 'hexr') {
    return ORIENTATION_HORIZONTAL;
  }
  return null;
}

/**
 * Builds a grid description for a page.
 *
 * @param {object} options Grid options.
 * @param {string} options.gridType Page grid_type.
 * @param {number} [options.scale=1] Page snapping_increment (cell size in units).
 * @param {boolean} [options.jumpgate=false] True for Jumpgate geometry.
 * @param {number} [options.offsetX=0] Jumpgate page grid_offset_x, in pixels.
 * @param {number} [options.offsetY=0] Jumpgate page grid_offset_y, in pixels. Jumpgate
 *        measures it upwards, so a positive value moves the grid up the page.
 * @param {object|null} [options.calibration] Per-page pixel overrides from calibrate.
 * @returns {object|null} Grid object, or null when the page has no hex grid.
 */
export function createGrid({
  gridType,
  scale = 1,
  jumpgate = false,
  offsetX = 0,
  offsetY = 0,
  calibration = null,
}) {
  const orientation = orientationForGridType(gridType);
  if (!orientation) {
    return null;
  }

  const unit = Number(scale) > 0 ? Number(scale) : 1;
  const profile = GRID_PROFILES[jumpgate ? 'jumpgate' : 'legacy'][orientation];
  const grid = {
    orientation,
    colStep: profile.colStep * unit,
    rowStep: profile.rowStep * unit,
    originX: profile.originX * unit + (jumpgate ? Number(offsetX) || 0 : 0),
    originY: profile.originY * unit - (jumpgate ? Number(offsetY) || 0 : 0),
  };

  if (calibration) {
    for (const key of ['colStep', 'rowStep', 'originX', 'originY']) {
      if (Number.isFinite(calibration[key]) && (key.startsWith('origin') || calibration[key] > 0)) {
        grid[key] = calibration[key];
      }
    }
  }

  return grid;
}

/**
 * Returns true when an integer is odd, including negative values.
 *
 * @param {number} n Integer.
 * @returns {boolean} True when odd.
 */
function isOdd(n) {
  return (n & 1) === 1;
}

/**
 * Builds the state key for a hex.
 *
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @returns {string} Key in "row,col" form.
 */
export function hexKey(row, col) {
  return `${row},${col}`;
}

/**
 * Parses a "row,col" hex key.
 *
 * @param {string} key Hex key.
 * @returns {number[]|null} [row, col], or null when malformed.
 */
export function parseHexKey(key) {
  const parts = String(key).split(',');
  if (parts.length !== 2) {
    return null;
  }
  const row = Number(parts[0]);
  const col = Number(parts[1]);
  return Number.isInteger(row) && Number.isInteger(col) ? [row, col] : null;
}

/**
 * Converts offset coordinates to cube coordinates.
 *
 * @param {object} grid Grid object.
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @returns {number[]} [q, r, s].
 */
export function offsetToCube(grid, row, col) {
  let q;
  let r;
  if (grid.orientation === ORIENTATION_VERTICAL) {
    q = col - (row - (row & 1)) / 2;
    r = row;
  } else {
    q = col;
    r = row - (col - (col & 1)) / 2;
  }
  return [q, r, -q - r];
}

/**
 * Converts cube coordinates to offset coordinates.
 *
 * @param {object} grid Grid object.
 * @param {number[]} cube [q, r, s].
 * @returns {number[]} [row, col].
 */
export function cubeToOffset(grid, cube) {
  const [q, r] = cube;
  if (grid.orientation === ORIENTATION_VERTICAL) {
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
export function cubeRound(cube) {
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
  // Normalise -0 so keys never contain "-0".
  return [q + 0, r + 0, s + 0];
}

/**
 * Returns the pixel centre of a hex.
 *
 * @param {object} grid Grid object.
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @returns {number[]} [x, y].
 */
export function hexToPixel(grid, row, col) {
  if (grid.orientation === ORIENTATION_VERTICAL) {
    return [
      grid.originX + (col + (isOdd(row) ? 0.5 : 0)) * grid.colStep,
      grid.originY + row * grid.rowStep,
    ];
  }
  return [
    grid.originX + col * grid.colStep,
    grid.originY + (row + (isOdd(col) ? 0.5 : 0)) * grid.rowStep,
  ];
}

/**
 * Returns the hex containing a pixel position.
 *
 * The grid is treated as a regular hex lattice scaled by colStep and rowStep,
 * so this is exact for both regular (Jumpgate) and stretched (Legacy) hexes.
 *
 * @param {object} grid Grid object.
 * @param {number} x Pixel x.
 * @param {number} y Pixel y.
 * @returns {number[]} [row, col].
 */
export function pixelToHex(grid, x, y) {
  const colF = (x - grid.originX) / grid.colStep;
  const rowF = (y - grid.originY) / grid.rowStep;
  let q;
  let r;
  if (grid.orientation === ORIENTATION_VERTICAL) {
    q = colF - rowF / 2;
    r = rowF;
  } else {
    q = colF;
    r = rowF - colF / 2;
  }
  return cubeToOffset(grid, cubeRound([q, r, -q - r]));
}

/**
 * Returns the number of hex steps between two hexes.
 *
 * @param {object} grid Grid object.
 * @param {number[]} a [row, col].
 * @param {number[]} b [row, col].
 * @returns {number} Distance in hexes.
 */
export function hexDistance(grid, a, b) {
  const ca = offsetToCube(grid, a[0], a[1]);
  const cb = offsetToCube(grid, b[0], b[1]);
  return Math.max(Math.abs(ca[0] - cb[0]), Math.abs(ca[1] - cb[1]), Math.abs(ca[2] - cb[2]));
}

/**
 * Returns the six hexes touching a hex.
 *
 * @param {object} grid Grid object.
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @returns {number[][]} Array of [row, col].
 */
export function neighbours(grid, row, col) {
  const [q, r, s] = offsetToCube(grid, row, col);
  return CUBE_DIRECTIONS.map(([dq, dr, ds]) => cubeToOffset(grid, [q + dq, r + dr, s + ds]));
}

/**
 * Returns every hex within a distance of a hex (excluding the hex itself),
 * nearest first.
 *
 * @param {object} grid Grid object.
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @param {number} radius Distance in hexes.
 * @returns {number[][]} Array of [row, col].
 */
export function hexesWithin(grid, row, col, radius) {
  const result = [];
  const [q, r] = offsetToCube(grid, row, col);
  for (let dist = 1; dist <= radius; dist++) {
    for (let dq = -dist; dq <= dist; dq++) {
      for (let dr = Math.max(-dist, -dq - dist); dr <= Math.min(dist, -dq + dist); dr++) {
        const ds = -dq - dr;
        if (Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds)) === dist) {
          result.push(cubeToOffset(grid, [q + dq, r + dr, -(q + dq) - (r + dr)]));
        }
      }
    }
  }
  return result;
}

/**
 * Returns the hexes on a straight line between two hexes, both ends included.
 *
 * @param {object} grid Grid object.
 * @param {number[]} a [row, col].
 * @param {number[]} b [row, col].
 * @returns {number[][]} Array of [row, col].
 */
export function hexLine(grid, a, b) {
  const n = hexDistance(grid, a, b);
  const ca = offsetToCube(grid, a[0], a[1]);
  const cb = offsetToCube(grid, b[0], b[1]);
  if (n === 0) {
    return [[a[0], a[1]]];
  }

  // A tiny nudge stops the line landing exactly on hex edges, where rounding
  // would otherwise pick a side inconsistently.
  const nudge = [1e-6, 2e-6, -3e-6];
  const result = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const cube = [0, 1, 2].map((k) => ca[k] + nudge[k] + (cb[k] - ca[k]) * t);
    result.push(cubeToOffset(grid, cubeRound(cube)));
  }
  return result;
}

/**
 * Returns the hexes strictly between two hexes on a straight line.
 *
 * @param {object} grid Grid object.
 * @param {number[]} a [row, col].
 * @param {number[]} b [row, col].
 * @returns {number[][]} Array of [row, col].
 */
export function hexesBetween(grid, a, b) {
  return hexLine(grid, a, b).slice(1, -1);
}

/**
 * Returns the hexes crossed by a pixel-space line segment, in travel order.
 *
 * @param {object} grid Grid object.
 * @param {number[]} from [x, y].
 * @param {number[]} to [x, y].
 * @returns {number[][]} Array of [row, col].
 */
export function hexesAlongSegment(grid, from, to) {
  return hexLine(grid, pixelToHex(grid, from[0], from[1]), pixelToHex(grid, to[0], to[1]));
}

/**
 * Returns the six corner points of a hex in pixels.
 *
 * @param {object} grid Grid object.
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @returns {number[][]} Array of six [x, y] points, clockwise.
 */
export function hexCorners(grid, row, col) {
  const [cx, cy] = hexToPixel(grid, row, col);
  const corners = [];
  for (let i = 0; i < 6; i++) {
    if (grid.orientation === ORIENTATION_VERTICAL) {
      const angle = ((30 + 60 * i) * Math.PI) / 180;
      corners.push([
        cx + (Math.cos(angle) / SQRT3) * grid.colStep,
        cy + ((Math.sin(angle) * 2) / 3) * grid.rowStep,
      ]);
    } else {
      const angle = (60 * i * Math.PI) / 180;
      corners.push([
        cx + ((Math.cos(angle) * 2) / 3) * grid.colStep,
        cy + (Math.sin(angle) / SQRT3) * grid.rowStep,
      ]);
    }
  }
  return corners;
}

/**
 * Returns every hex whose centre lies inside a bounding box.
 *
 * @param {object} grid Grid object.
 * @param {object} box Box with left, top, right and bottom in pixels.
 * @returns {number[][]} Array of [row, col].
 */
export function hexesInBox(grid, box) {
  const [r0, c0] = pixelToHex(grid, box.left, box.top);
  const [r1, c1] = pixelToHex(grid, box.right, box.bottom);
  const result = [];
  for (let row = Math.min(r0, r1) - 1; row <= Math.max(r0, r1) + 1; row++) {
    for (let col = Math.min(c0, c1) - 1; col <= Math.max(c0, c1) + 1; col++) {
      const [x, y] = hexToPixel(grid, row, col);
      if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        result.push([row, col]);
      }
    }
  }
  return result;
}

/**
 * Returns every hex needed to cover a page completely, including the partial
 * hexes along its edges.
 *
 * @param {object} grid Grid object.
 * @param {number} widthPx Page width in pixels.
 * @param {number} heightPx Page height in pixels.
 * @returns {number[][]} Array of [row, col].
 */
export function hexesCoveringPage(grid, widthPx, heightPx) {
  // A hex overlaps the page when its centre is within its own half-size of
  // the page edge. Slivers thinner than a quarter pixel are ignored.
  const vertical = grid.orientation === ORIENTATION_VERTICAL;
  const padX = (vertical ? grid.colStep / 2 : (grid.colStep * 2) / 3) - 0.25;
  const padY = (vertical ? (grid.rowStep * 2) / 3 : grid.rowStep / 2) - 0.25;
  return hexesInBox(grid, {
    left: -padX,
    top: -padY,
    right: widthPx + padX,
    bottom: heightPx + padY,
  });
}

/**
 * Returns the hexes a token covers: every hex whose centre lies under the
 * token, plus the hex under its centre.
 *
 * @param {object} grid Grid object.
 * @param {number} x Token centre x.
 * @param {number} y Token centre y.
 * @param {number} width Token width in pixels.
 * @param {number} height Token height in pixels.
 * @returns {number[][]} Array of [row, col], centre hex first.
 */
export function hexesUnderToken(grid, x, y, width, height) {
  const centre = pixelToHex(grid, x, y);
  // Shrink slightly so a token that only touches a neighbour's centre does not claim it.
  const halfW = Math.max(0, width / 2 - 2);
  const halfH = Math.max(0, height / 2 - 2);
  const covered = hexesInBox(grid, {
    left: x - halfW,
    top: y - halfH,
    right: x + halfW,
    bottom: y + halfH,
  });
  const centreKey = hexKey(centre[0], centre[1]);
  return [centre, ...covered.filter(([r, c]) => hexKey(r, c) !== centreKey)];
}

/**
 * Derives a calibration from tokens the GM has snapped to hex centres.
 *
 * One token corrects the grid origin. Two tokens in neighbouring cells of the
 * same row (Hex V) or column (Hex H) also correct the hex spacing, keeping the
 * current ratio between column and row spacing.
 *
 * @param {object} grid Current grid object.
 * @param {number[][]} points Token centres [[x, y], ...].
 * @returns {object|null} Calibration, or null when the points cannot be used.
 */
export function calibrateGrid(grid, points) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  let { colStep, rowStep } = grid;
  if (points.length >= 2) {
    const [a, b] = points;
    const vertical = grid.orientation === ORIENTATION_VERTICAL;
    const along = vertical ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1]);
    const across = vertical ? Math.abs(b[1] - a[1]) : Math.abs(b[0] - a[0]);
    const currentStep = vertical ? colStep : rowStep;
    const steps = Math.round(along / currentStep);
    if (steps < 1 || across > currentStep / 4) {
      return null;
    }
    const ratio = rowStep / colStep;
    if (vertical) {
      colStep = along / steps;
      rowStep = colStep * ratio;
    } else {
      rowStep = along / steps;
      colStep = rowStep / ratio;
    }
  }

  const scaled = { ...grid, colStep, rowStep };
  const [px, py] = points[0];
  const [row, col] = pixelToHex(scaled, px, py);
  const [cx, cy] = hexToPixel(scaled, row, col);
  const calibration = {
    colStep,
    rowStep,
    originX: grid.originX + (px - cx),
    originY: grid.originY + (py - cy),
  };

  // Keep the origin inside the first cell so offsets stay small and stable.
  // Shifting by two rows/columns preserves the odd/even offset pattern.
  const vertical = grid.orientation === ORIENTATION_VERTICAL;
  const wrapX = vertical ? colStep : colStep * 2;
  const wrapY = vertical ? rowStep * 2 : rowStep;
  calibration.originX = ((calibration.originX % wrapX) + wrapX) % wrapX;
  calibration.originY = ((calibration.originY % wrapY) + wrapY) % wrapY;
  return calibration;
}
