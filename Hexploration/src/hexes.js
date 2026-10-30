// Creating, removing and maintaining hexes on a page: fill, inverse fill,
// conceal, reset, rescan, calibrate and undo.

import {
  BATCH_SIZE,
  LAYER_GM,
  LAYER_TOKEN,
  LOCATION_MARKER,
  MAX_FILL_HEXES,
  RESCAN_CENTRE_TOLERANCE,
  RESCAN_LABEL_TOLERANCE,
} from './constants.js';
import { buildPageGrid } from './context.js';
import {
  calibrateGrid,
  hexCorners,
  hexesCoveringPage,
  hexesInBox,
  hexKey,
  hexToPixel,
  pixelToHex,
} from './grid.js';
import {
  attachIcon,
  detachIcon,
  findLocationTokens,
  getHexIcon,
  removeLabel,
} from './locations.js';
import {
  createHexPath,
  getPagePaths,
  getPathObject,
  getPathRings,
  readPathProps,
  recreatePath,
  safeRemove,
  setPathStyle,
} from './paths.js';
import { boundingBox, distinctVertices, pointInShape, ringCentre } from './polygon.js';
import {
  deleteHexRecord,
  deletePageData,
  getConfig,
  getPageIds,
  getHex,
  getHexByPathId,
  getLastFill,
  getPageData,
  getPageHexes,
  getPendingLocations,
  putHex,
  setCalibration,
  setLastFill,
  setPendingLocation,
} from './state.js';
import { runInBatches, tokenHasMarker } from './utils.js';

/**
 * Returns the hex style from the current config.
 *
 * @returns {{fill: string, stroke: string, strokeWidth: number, maxDistance: number|null}} Style.
 */
export function currentStyle() {
  const config = getConfig();
  return {
    fill: config.fillColor,
    stroke: config.strokeColor,
    strokeWidth: config.strokeWidth,
    maxDistance: config.maxDistance,
  };
}

/**
 * Draws one hex and stores its record.
 *
 * @param {object} ctx Page context.
 * @param {number} row Hex row.
 * @param {number} col Hex column.
 * @param {object} style Hex style.
 * @param {object} [extra] Extra record fields (name, iconId…).
 * @returns {{hex: object, fellBack: boolean}|null} New record, or null on failure.
 */
export function drawHex(ctx, row, col, style, extra = {}) {
  const created = createHexPath(ctx.pageId, hexCorners(ctx.grid, row, col), style);
  if (!created) {
    return null;
  }
  const hex = { id: created.obj.get('_id'), type: created.obj.get('_type'), row, col, ...extra };
  if (Number.isInteger(style.maxDistance)) {
    hex.maxDistance = style.maxDistance;
  }
  putHex(ctx.pageId, hex);
  return { hex, fellBack: created.fellBack };
}

/**
 * Removes a hex: its record, its path and its name label. Its icon is moved
 * back to the token layer when `showIcon` is true, otherwise left hidden.
 *
 * @param {string} pageId Page ID.
 * @param {string} key "row,col" key.
 * @param {boolean} [showIcon=false] Return the icon to the token layer.
 * @returns {object|null} The removed record.
 */
export function removeHex(pageId, key, showIcon = false) {
  const hex = deleteHexRecord(pageId, key);
  if (!hex) {
    return null;
  }
  removeLabel(hex);
  if (showIcon) {
    detachIcon(hex);
  }
  safeRemove(getPathObject(hex.id, hex.type));
  return hex;
}

/**
 * Returns the cells whose centres lie inside any of the given paths.
 *
 * @param {object} ctx Page context.
 * @param {object[]} paths Roll20 path objects on the page.
 * @returns {number[][]} Array of [row, col], without duplicates.
 */
export function cellsInPaths(ctx, paths) {
  const seen = new Set();
  const cells = [];
  for (const path of paths) {
    const rings = getPathRings(path);
    if (rings.length === 0) {
      continue;
    }
    const box = boundingBox(rings.flat());
    for (const [row, col] of hexesInBox(ctx.grid, box)) {
      const key = hexKey(row, col);
      if (!seen.has(key) && pointInShape(hexToPixel(ctx.grid, row, col), rings)) {
        seen.add(key);
        cells.push([row, col]);
      }
    }
  }
  return cells;
}

/**
 * Returns every cell on the page except those inside the given paths.
 *
 * @param {object} ctx Page context.
 * @param {object[]} paths Roll20 path objects to leave uncovered.
 * @returns {number[][]} Array of [row, col].
 */
export function cellsOutsidePaths(ctx, paths) {
  const omit = new Set(cellsInPaths(ctx, paths).map(([r, c]) => hexKey(r, c)));
  const width = Number(ctx.page.get('width')) * 70;
  const height = Number(ctx.page.get('height')) * 70;
  return hexesCoveringPage(ctx.grid, width, height).filter(([r, c]) => !omit.has(hexKey(r, c)));
}

/**
 * Covers cells with hexes. Existing hexes are restyled rather than replaced,
 * so their names and icons are kept. Location tokens in a covered cell are
 * attached as icons. Work is batched; `onDone` receives a summary.
 *
 * @param {object} ctx Page context.
 * @param {number[][]} cells Cells to cover.
 * @param {object} options Fill options.
 * @param {object[]} [options.sources] Saved properties of the polygons used (for undo).
 * @param {string} options.kind Fill kind for undo ('fill', 'fillInverse', 'conceal').
 * @param {(summary: object) => void} options.onDone Completion callback.
 * @returns {{started: boolean, reason?: string}} Whether the fill started.
 */
export function fillCells(ctx, cells, { sources = [], kind, onDone }) {
  if (cells.length > MAX_FILL_HEXES) {
    return { started: false, reason: 'tooMany' };
  }

  const style = currentStyle();
  const locations = findLocationTokens(ctx);
  const record = {
    pageId: ctx.pageId,
    kind,
    time: Date.now(),
    created: [],
    restyled: [],
    icons: [],
    sources,
  };
  const summary = { created: 0, restyled: 0, icons: 0, failed: 0, fellBack: false };

  runInBatches(
    cells,
    BATCH_SIZE,
    ([row, col]) => {
      const key = hexKey(row, col);
      let hex = getHex(ctx.pageId, key);
      const existingPath = hex ? getPathObject(hex.id, hex.type) : null;

      if (hex && existingPath) {
        record.restyled.push({
          key,
          fill: existingPath.get('fill'),
          stroke: existingPath.get('stroke'),
          strokeWidth: existingPath.get('stroke_width'),
          maxDistance: hex.maxDistance ?? null,
          glimpsed: hex.glimpsed === true,
        });
        setPathStyle(existingPath, {
          fill: style.fill,
          stroke: style.stroke,
          stroke_width: style.strokeWidth,
        });
        delete hex.glimpsed;
        if (Number.isInteger(style.maxDistance)) {
          hex.maxDistance = style.maxDistance;
        } else {
          delete hex.maxDistance;
        }
        summary.restyled++;
      } else {
        if (hex) {
          // The record outlived its path (deleted while the API was off).
          deleteHexRecord(ctx.pageId, key);
        }
        const drawn = drawHex(ctx, row, col, style);
        if (!drawn) {
          summary.failed++;
          return;
        }
        hex = drawn.hex;
        summary.fellBack = summary.fellBack || drawn.fellBack;
        record.created.push({ key, id: hex.id });
        summary.created++;
      }

      const token = locations.get(key);
      if (token && !hex.iconId) {
        record.icons.push({ id: token.get('_id'), layer: token.get('layer') });
        attachIcon(hex, token);
        summary.icons++;
      }
    },
    (errors) => {
      summary.failed += errors;
      setLastFill(record);
      onDone(summary);
    }
  );

  return { started: true };
}

/**
 * Removes every hex on a page, returning icons to the token layer. Page
 * settings and calibration are kept.
 *
 * @param {object} ctx Page context.
 * @param {(count: number) => void} onDone Completion callback.
 * @returns {void}
 */
export function clearPage(ctx, onDone) {
  const keys = getPageHexes(ctx.pageId).map((hex) => hexKey(hex.row, hex.col));
  for (const tokenId of getPendingLocations(ctx.pageId)) {
    setPendingLocation(tokenId, null);
  }
  const last = getLastFill();
  if (last?.pageId === ctx.pageId) {
    setLastFill(null);
  }
  runInBatches(
    keys,
    BATCH_SIZE,
    (key) => removeHex(ctx.pageId, key, true),
    () => onDone(keys.length)
  );
}

/**
 * Reverses the last fill: removes the hexes it created, restores the style
 * of hexes it restyled, returns icons it hid, and redraws the polygons it used.
 *
 * @returns {{ok: boolean, reason?: string, removed?: number, restored?: number, pageId?: string}} Result.
 */
export function undoLastFill() {
  const record = getLastFill();
  if (!record) {
    return { ok: false, reason: 'nothingToUndo' };
  }
  setLastFill(null);
  const page = getObj('page', record.pageId);
  if (!page) {
    return { ok: false, reason: 'noPage' };
  }

  let removed = 0;
  for (const { key, id } of record.created || []) {
    const hex = getHex(record.pageId, key);
    if (hex && hex.id === id) {
      removeHex(record.pageId, key, false);
      removed++;
    }
  }

  let restored = 0;
  for (const prev of record.restyled || []) {
    const hex = getHex(record.pageId, prev.key);
    const path = hex ? getPathObject(hex.id, hex.type) : null;
    if (path) {
      setPathStyle(path, { fill: prev.fill, stroke: prev.stroke, stroke_width: prev.strokeWidth });
      if (Number.isInteger(prev.maxDistance)) {
        hex.maxDistance = prev.maxDistance;
      } else {
        delete hex.maxDistance;
      }
      if (prev.glimpsed) {
        hex.glimpsed = true;
      }
      restored++;
    }
  }

  for (const { id, layer } of record.icons || []) {
    const token = getObj('graphic', id);
    if (token) {
      for (const hex of getPageHexes(record.pageId)) {
        if (hex.iconId === id) {
          delete hex.iconId;
        }
      }
      token.set('layer', layer || LAYER_TOKEN);
    }
  }

  for (const props of record.sources || []) {
    recreatePath(props);
  }

  return { ok: true, removed, restored, pageId: record.pageId };
}

/**
 * Captures the polygons used for a fill so undo can redraw them, then deletes them.
 *
 * @param {object[]} paths Roll20 path objects.
 * @returns {object[]} Saved properties.
 */
export function consumeSourcePaths(paths) {
  // A selected path may itself be a hex; only plain drawings are consumed.
  const drawings = paths.filter((path) => !getHexByPathId(path.get('_id')));
  const sources = drawings.map(readPathProps);
  for (const path of drawings) {
    safeRemove(path);
  }
  return sources;
}

/**
 * Returns the hex a path draws, judged by its shape: a six-cornered polygon
 * centred on a hex cell and roughly the size of a hex.
 *
 * @param {object} ctx Page context.
 * @param {object} path Roll20 path object.
 * @returns {number[]|null} [row, col], or null when the path is not a hex.
 */
function matchHexShape(ctx, path) {
  const rings = getPathRings(path);
  if (rings.length !== 1) {
    return null;
  }
  const vertices = distinctVertices(rings[0]);
  if (vertices.length !== 6) {
    return null;
  }
  const [x, y] = ringCentre(vertices);
  const [row, col] = pixelToHex(ctx.grid, x, y);
  const [cx, cy] = hexToPixel(ctx.grid, row, col);
  if (Math.hypot(x - cx, y - cy) > ctx.grid.colStep * RESCAN_CENTRE_TOLERANCE) {
    return null;
  }
  const actual = boundingBox(vertices);
  const expected = boundingBox(hexCorners(ctx.grid, row, col));
  const ratioW = (actual.right - actual.left) / (expected.right - expected.left);
  const ratioH = (actual.bottom - actual.top) / (expected.bottom - expected.top);
  if (ratioW < 0.75 || ratioW > 1.25 || ratioH < 0.75 || ratioH > 1.25) {
    return null;
  }
  return [row, col];
}

/**
 * Rebuilds a page's hex list from what is actually on the page:
 *  - drops records whose path is gone, and label/icon links that are broken;
 *  - re-files hexes whose cell changed (after calibration);
 *  - adopts hex-shaped paths the mod does not know about (duplicated pages,
 *    Legacy games copied to Jumpgate);
 *  - re-links GM-layer labels and white-tower icons sitting on hexes.
 *
 * @param {object} ctx Page context.
 * @returns {{kept: number, dropped: number, moved: number, adopted: number, labels: number, icons: number}} Counts.
 */
export function rescanPage(ctx) {
  const counts = { kept: 0, dropped: 0, moved: 0, adopted: 0, labels: 0, icons: 0 };
  const pageData = getPageData(ctx.pageId, true);

  // 1. Check existing records.
  for (const hex of Object.values(pageData.hexes)) {
    const key = hexKey(hex.row, hex.col);
    const path = getPathObject(hex.id, hex.type);
    if (!path) {
      removeLabel(hex);
      deleteHexRecord(ctx.pageId, key);
      counts.dropped++;
      continue;
    }
    hex.type = path.get('_type');
    if (hex.nameId && !getObj('text', hex.nameId)) {
      delete hex.nameId;
    }
    if (hex.iconId && !getHexIcon(hex)) {
      delete hex.iconId;
    }
    const cell = matchHexShape(ctx, path);
    if (cell && hexKey(cell[0], cell[1]) !== key && !getHex(ctx.pageId, hexKey(cell[0], cell[1]))) {
      deleteHexRecord(ctx.pageId, key);
      putHex(ctx.pageId, { ...hex, row: cell[0], col: cell[1] });
      counts.moved++;
    } else {
      counts.kept++;
    }
  }

  // 2. Adopt unknown hex-shaped paths.
  for (const path of getPagePaths(ctx.pageId)) {
    const id = path.get('_id');
    if (getHexByPathId(id)) {
      continue;
    }
    const cell = matchHexShape(ctx, path);
    if (!cell || getHex(ctx.pageId, hexKey(cell[0], cell[1]))) {
      continue;
    }
    putHex(ctx.pageId, { id, type: path.get('_type'), row: cell[0], col: cell[1] });
    counts.adopted++;
  }

  // 3. Re-link GM-layer labels sitting on hex centres.
  const linkedLabels = new Set(
    getPageHexes(ctx.pageId)
      .map((hex) => hex.nameId)
      .filter(Boolean)
  );
  for (const text of findObjs({ _type: 'text', _pageid: ctx.pageId, layer: LAYER_GM })) {
    if (linkedLabels.has(text.get('_id'))) {
      continue;
    }
    const x = Number(text.get('left'));
    const y = Number(text.get('top'));
    const [row, col] = pixelToHex(ctx.grid, x, y);
    const [cx, cy] = hexToPixel(ctx.grid, row, col);
    const hex = getHex(ctx.pageId, hexKey(row, col));
    if (hex && !hex.nameId && Math.hypot(x - cx, y - cy) <= RESCAN_LABEL_TOLERANCE) {
      hex.nameId = text.get('_id');
      hex.name = String(text.get('text') || '').trim() || hex.name;
      counts.labels++;
    }
  }

  // 4. Re-link hidden white-tower icons.
  const linkedIcons = new Set(
    getPageHexes(ctx.pageId)
      .map((hex) => hex.iconId)
      .filter(Boolean)
  );
  for (const token of findObjs({ _type: 'graphic', _pageid: ctx.pageId, layer: LAYER_GM })) {
    if (linkedIcons.has(token.get('_id')) || !tokenHasMarker(token, LOCATION_MARKER)) {
      continue;
    }
    const [row, col] = pixelToHex(ctx.grid, token.get('left'), token.get('top'));
    const hex = getHex(ctx.pageId, hexKey(row, col));
    if (hex && !hex.iconId) {
      hex.iconId = token.get('_id');
      counts.icons++;
    }
  }

  return counts;
}

/**
 * Calibrates a page's grid from tokens snapped to hex centres, then rescans
 * so existing hexes are filed under their corrected cells.
 *
 * @param {object} ctx Page context.
 * @param {object[]} tokens One or two Roll20 graphics.
 * @returns {{ok: boolean, calibration?: object, counts?: object}} Result.
 */
export function calibratePage(ctx, tokens) {
  const points = tokens.slice(0, 2).map((t) => [Number(t.get('left')), Number(t.get('top'))]);
  // Calibrate against the uncalibrated profile so repeated calibration does not drift.
  setCalibration(ctx.pageId, null);
  const base = buildPageGrid(ctx.page);
  const calibration = calibrateGrid(base, points);
  if (!calibration) {
    return { ok: false };
  }
  setCalibration(ctx.pageId, calibration);
  const fresh = { ...ctx, grid: buildPageGrid(ctx.page) };
  return { ok: true, calibration, counts: rescanPage(fresh) };
}

/**
 * Clears a page's calibration and rescans.
 *
 * @param {object} ctx Page context.
 * @returns {object} Rescan counts.
 */
export function resetCalibration(ctx) {
  setCalibration(ctx.pageId, null);
  return rescanPage({ ...ctx, grid: buildPageGrid(ctx.page) });
}

/**
 * Removes stored hexes whose paths no longer exist, on every page. Run on
 * startup, since paths deleted while the API was off fire no events.
 *
 * @returns {{dropped: number, pages: number}} Counts.
 */
export function pruneMissingHexes() {
  let dropped = 0;
  let pages = 0;
  for (const pageId of getPageIds()) {
    if (!getObj('page', pageId)) {
      dropped += getPageHexes(pageId).length;
      deletePageData(pageId);
      pages++;
      continue;
    }
    for (const hex of getPageHexes(pageId)) {
      if (!getPathObject(hex.id, hex.type)) {
        deleteHexRecord(pageId, hexKey(hex.row, hex.col));
        dropped++;
      }
    }
  }
  return { dropped, pages };
}
