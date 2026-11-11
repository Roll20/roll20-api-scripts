// Pure geometry: no Roll20 calls, so every rule here is unit-tested.
//
// Page coordinates are pixels from the page's top-left corner, y downwards,
// except Jumpgate doors and windows, whose y is measured upwards (negative on
// the page). Zooms scale about the page's top-left corner, so a point (x, y)
// moves to (x·f, y·f) whatever its kind.

import { PIXELS_PER_UNIT } from './constants.js';
import { roundCoord, toNumber } from './utils.js';

/**
 * Returns a page's grid cell size in pixels.
 *
 * @param {object} page Page attributes (snapping_increment).
 * @returns {number} Cell size in pixels (70 when the page has no increment).
 */
export function cellPixels(page) {
  const snap = toNumber(page?.snapping_increment);
  return PIXELS_PER_UNIT * (snap && snap > 0 ? snap : 1);
}

/**
 * Returns a page's size in pixels.
 *
 * @param {object} page Page attributes (width, height in page units).
 * @returns {{width: number, height: number}} Size in pixels.
 */
export function pagePixels(page) {
  return {
    width: (toNumber(page?.width) ?? 0) * PIXELS_PER_UNIT,
    height: (toNumber(page?.height) ?? 0) * PIXELS_PER_UNIT,
  };
}

/**
 * Page attributes after a zoom. The distance per cell (scale_number) is kept,
 * so rulers, auras and lights still measure the same.
 *
 * @param {object} page Page attributes.
 * @param {number} f Zoom factor.
 * @returns {object} Changed attributes.
 */
export function zoomPage(page, f) {
  const n = (v, fallback = 0) => toNumber(v) ?? fallback;
  return {
    width: roundCoord(n(page.width) * f),
    height: roundCoord(n(page.height) * f),
    snapping_increment: roundCoord(n(page.snapping_increment, 1) * f),
    grid_offset_x: roundCoord(n(page.grid_offset_x) * f),
    grid_offset_y: roundCoord(n(page.grid_offset_y) * f),
  };
}

/**
 * Graphic attributes after a zoom.
 *
 * @param {object} g Graphic attributes (left, top, width, height).
 * @param {number} f Zoom factor.
 * @param {boolean} [keepSize=false] Move only; keep the width and height.
 * @returns {object} Changed attributes.
 */
export function zoomGraphic(g, f, keepSize = false) {
  const out = {
    left: roundCoord((toNumber(g.left) ?? 0) * f),
    top: roundCoord((toNumber(g.top) ?? 0) * f),
  };
  if (!keepSize) {
    out.width = roundCoord((toNumber(g.width) ?? 0) * f);
    out.height = roundCoord((toNumber(g.height) ?? 0) * f);
  }
  return out;
}

/**
 * Text attributes after a zoom. Jumpgate accepts any font size.
 *
 * @param {object} txt Text attributes.
 * @param {number} f Zoom factor.
 * @returns {object} Changed attributes.
 */
export function zoomText(txt, f) {
  const out = {
    left: roundCoord((toNumber(txt.left) ?? 0) * f),
    top: roundCoord((toNumber(txt.top) ?? 0) * f),
    font_size: roundCoord((toNumber(txt.font_size) ?? 16) * f),
  };
  for (const key of ['width', 'height']) {
    const v = toNumber(txt[key]);
    if (v) {
      out[key] = roundCoord(v * f);
    }
  }
  return out;
}

/**
 * Parses a Jumpgate drawing's point list.
 *
 * @param {*} raw The points attribute (JSON text or an array).
 * @returns {number[][]|null} Points, or null when unreadable.
 */
export function parsePoints(raw) {
  let pts = raw;
  if (typeof raw === 'string') {
    try {
      pts = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(pts)) {
    return null;
  }
  return pts.every((p) => Array.isArray(p) && p.length >= 2 && p.every(Number.isFinite))
    ? pts
    : null;
}

/**
 * Jumpgate drawing (pathv2) attributes after a zoom. x and y are the centre of
 * the drawing's box and the points are in the drawing's own frame, so scaling
 * all of them scales the drawing about the page corner.
 *
 * @param {object} p Drawing attributes (x, y, points, stroke_width).
 * @param {number} f Zoom factor.
 * @param {boolean} [scaleStroke=false] Scale the line width too.
 * @returns {object|null} Changed attributes, or null when the points are unreadable.
 */
export function zoomPathV2(p, f, scaleStroke = false) {
  const pts = parsePoints(p.points);
  if (!pts) {
    return null;
  }
  const out = {
    x: roundCoord((toNumber(p.x) ?? 0) * f),
    y: roundCoord((toNumber(p.y) ?? 0) * f),
    points: JSON.stringify(pts.map((pt) => pt.map((v) => roundCoord(v * f)))),
  };
  if (scaleStroke) {
    out.stroke_width = roundCoord((toNumber(p.stroke_width) ?? 0) * f);
  }
  return out;
}

/**
 * Scales the numbers of a Legacy path (SVG-like commands such as ["M",x,y],
 * ["L",x,y], ["Q",cx,cy,x,y], ["C",…]).
 *
 * @param {*} raw The _path attribute (JSON text or an array).
 * @param {number} sx Horizontal factor.
 * @param {number} sy Vertical factor.
 * @returns {string|null} New path JSON, or null when unreadable.
 */
export function scaleLegacyPathData(raw, sx, sy) {
  let cmds = raw;
  if (typeof raw === 'string') {
    try {
      cmds = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(cmds)) {
    return null;
  }
  const out = [];
  for (const cmd of cmds) {
    if (!Array.isArray(cmd) || typeof cmd[0] !== 'string') {
      return null;
    }
    const [op, ...nums] = cmd;
    if (!nums.every((v) => Number.isFinite(Number(v)))) {
      return null;
    }
    // Numbers come in x, y pairs.
    out.push([op, ...nums.map((v, i) => roundCoord(Number(v) * (i % 2 === 0 ? sx : sy)))]);
  }
  return JSON.stringify(out);
}

/**
 * Properties for a Legacy path recreated at a new size. Jumpgate does not
 * redraw a Legacy path whose position or scale an API changes, and resets its
 * scale to 1 on the next load, so a zoomed Legacy path is drawn again with its
 * old scale and the zoom baked into its points.
 *
 * @param {object} p Path attributes (_path, left, top, width, height, scaleX, scaleY).
 * @param {number} f Zoom factor.
 * @param {boolean} [scaleStroke=false] Scale the line width too.
 * @returns {object|null} New attributes for createObj, or null when unreadable.
 */
export function zoomLegacyPath(p, f, scaleStroke = false) {
  const sx = (toNumber(p.scaleX) ?? 1) * f;
  const sy = (toNumber(p.scaleY) ?? 1) * f;
  const data = scaleLegacyPathData(p._path ?? p.path, sx, sy);
  if (data === null) {
    return null;
  }
  const out = {
    _path: data,
    left: roundCoord((toNumber(p.left) ?? 0) * f),
    top: roundCoord((toNumber(p.top) ?? 0) * f),
    width: roundCoord((toNumber(p.width) ?? 0) * sx),
    height: roundCoord((toNumber(p.height) ?? 0) * sy),
    scaleX: 1,
    scaleY: 1,
  };
  if (scaleStroke) {
    out.stroke_width = roundCoord((toNumber(p.stroke_width) ?? 0) * f);
  }
  return out;
}

/**
 * Door or window attributes after a zoom. Their y is measured upwards, which
 * a scale about the corner leaves the right way round.
 *
 * @param {object} d Door or window attributes (x, y, path.handle0/handle1).
 * @param {number} f Zoom factor.
 * @returns {object} Changed attributes.
 */
export function zoomPortal(d, f) {
  const handle = (h) => ({
    x: roundCoord((toNumber(h?.x) ?? 0) * f),
    y: roundCoord((toNumber(h?.y) ?? 0) * f),
  });
  const path = d.path && typeof d.path === 'object' ? d.path : {};
  return {
    x: roundCoord((toNumber(d.x) ?? 0) * f),
    y: roundCoord((toNumber(d.y) ?? 0) * f),
    path: { ...path, handle0: handle(path.handle0), handle1: handle(path.handle1) },
  };
}

/**
 * Size and place for a graphic fitted to the page.
 *
 * @param {object} g Graphic attributes (width, height).
 * @param {object} page Page attributes.
 * @param {boolean} keepRatio Keep the graphic's shape (fit inside, centred).
 * @returns {object} New left, top, width, height.
 */
export function fitToPage(g, page, keepRatio) {
  const { width: pw, height: ph } = pagePixels(page);
  const w = toNumber(g.width) || 1;
  const h = toNumber(g.height) || 1;
  if (!keepRatio) {
    return { left: pw / 2, top: ph / 2, width: pw, height: ph };
  }
  const k = Math.min(pw / w, ph / h);
  return {
    left: roundCoord(pw / 2),
    top: roundCoord(ph / 2),
    width: roundCoord(w * k),
    height: roundCoord(h * k),
  };
}

/**
 * Position for a graphic centred on the page.
 *
 * @param {object} page Page attributes.
 * @param {boolean} horizontal Centre across.
 * @param {boolean} vertical Centre down.
 * @returns {object} Changed attributes.
 */
export function centreOnPage(page, horizontal, vertical) {
  const { width: pw, height: ph } = pagePixels(page);
  const out = {};
  if (horizontal) {
    out.left = pw / 2;
  }
  if (vertical) {
    out.top = ph / 2;
  }
  return out;
}

/**
 * Bounding box of a drawing in page pixels.
 *
 * @param {string} type 'pathv2' or 'path'.
 * @param {object} p Drawing attributes.
 * @returns {{x0: number, y0: number, x1: number, y1: number}|null} Box, or null.
 */
export function drawingBox(type, p) {
  if (type === 'pathv2') {
    const pts = parsePoints(p.points);
    if (!pts || pts.length === 0) {
      return null;
    }
    const xs = pts.map((pt) => pt[0]);
    const ys = pts.map((pt) => pt[1]);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    const cx = toNumber(p.x) ?? 0;
    const cy = toNumber(p.y) ?? 0;
    return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
  }
  const w = (toNumber(p.width) ?? 0) * (toNumber(p.scaleX) ?? 1);
  const h = (toNumber(p.height) ?? 0) * (toNumber(p.scaleY) ?? 1);
  const cx = toNumber(p.left) ?? 0;
  const cy = toNumber(p.top) ?? 0;
  return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
}

/**
 * Positions of the page's grid lines nearest to a point: lines sit at
 * offset + k·cell across, and (cell·k − offset) down because Jumpgate
 * measures the vertical offset upwards.
 *
 * @param {number} v Coordinate.
 * @param {number} cell Cell size.
 * @param {number} offset Grid offset along this axis, already signed for y-down.
 * @returns {number} Nearest grid line.
 */
export function nearestLine(v, cell, offset) {
  return Math.round((v - offset) / cell) * cell + offset;
}

/**
 * Works out how to scale and move a map so the squares drawn on it match the
 * page grid.
 *
 * @param {object} map Map graphic attributes (left, top, width, height).
 * @param {{x0: number, y0: number, x1: number, y1: number}} box Box drawn over the map's squares.
 * @param {number} across Squares across the box.
 * @param {number} down Squares down the box.
 * @param {object} page Page attributes.
 * @param {object} [options] Options.
 * @param {boolean} [options.fitPage=false] Move the map to the page corner and size the page to it.
 * @returns {{ok: boolean, error?: string, map?: object, page?: object, squarePx?: number[], scale?: number[]}}
 *   New map (and page) attributes, the map's square size before, and the scale used.
 */
export function calibrateFromBox(map, box, across, down, page, { fitPage = false } = {}) {
  const bw = box.x1 - box.x0;
  const bh = box.y1 - box.y0;
  if (!(across > 0) || !(down > 0)) {
    return { ok: false, error: 'errors.badCount' };
  }
  if (bw < 4 || bh < 4) {
    return { ok: false, error: 'errors.boxTooSmall' };
  }
  const cell = cellPixels(page);
  const sqx = bw / across;
  const sqy = bh / down;
  const kx = cell / sqx;
  const ky = cell / sqy;
  return placeScaledMap(
    map,
    page,
    kx,
    ky,
    { x: box.x0, y: box.y0 },
    { fitPage, squarePx: [sqx, sqy] }
  );
}

/**
 * Works out how to scale a map whose squares are a known number of pixels.
 *
 * @param {object} map Map graphic attributes.
 * @param {number} squarePx Pixels per square in the map as it is drawn now.
 * @param {object} page Page attributes.
 * @param {object} [options] Options.
 * @param {boolean} [options.fitPage=false] Move the map to the page corner and size the page to it.
 * @returns {object} As calibrateFromBox.
 */
export function calibrateFromSquare(map, squarePx, page, { fitPage = false } = {}) {
  if (!(squarePx >= 2)) {
    return { ok: false, error: 'errors.badSquarePx' };
  }
  const k = cellPixels(page) / squarePx;
  return placeScaledMap(map, page, k, k, null, { fitPage, squarePx: [squarePx, squarePx] });
}

/**
 * Scales a map about its top-left corner and, when an anchor is given, moves it
 * so that anchor (a corner of a drawn square) lands on a grid line.
 *
 * @param {object} map Map attributes.
 * @param {object} page Page attributes.
 * @param {number} kx Horizontal scale.
 * @param {number} ky Vertical scale.
 * @param {{x: number, y: number}|null} anchor Point on the map that must sit on grid lines.
 * @param {object} options Options.
 * @returns {object} As calibrateFromBox.
 */
function placeScaledMap(map, page, kx, ky, anchor, { fitPage, squarePx }) {
  const w = toNumber(map.width) ?? 0;
  const h = toNumber(map.height) ?? 0;
  const left0 = (toNumber(map.left) ?? 0) - w / 2;
  const top0 = (toNumber(map.top) ?? 0) - h / 2;
  const nw = w * kx;
  const nh = h * ky;
  const cell = cellPixels(page);
  const offX = toNumber(page.grid_offset_x) ?? 0;
  const offY = -(toNumber(page.grid_offset_y) ?? 0);
  let nl = left0;
  let nt = top0;
  if (anchor) {
    const ax = left0 + (anchor.x - left0) * kx;
    const ay = top0 + (anchor.y - top0) * ky;
    nl += nearestLine(ax, cell, offX) - ax;
    nt += nearestLine(ay, cell, offY) - ay;
  }
  const out = { ok: true, squarePx, scale: [kx, ky] };
  let pageOut = null;
  if (fitPage) {
    // Slide the map by whole cells (which keeps it on the grid) so its corner
    // is within half a cell of the page corner, then make the page a whole
    // number of cells just big enough for it.
    nl -= Math.round(nl / cell) * cell;
    nt -= Math.round(nt / cell) * cell;
    const snap = cell / PIXELS_PER_UNIT;
    pageOut = {
      width: roundCoord(Math.max(1, Math.ceil((nl + nw) / cell - 1e-6)) * snap),
      height: roundCoord(Math.max(1, Math.ceil((nt + nh) / cell - 1e-6)) * snap),
    };
  }
  out.map = {
    left: roundCoord(nl + nw / 2),
    top: roundCoord(nt + nh / 2),
    width: roundCoord(nw),
    height: roundCoord(nh),
  };
  if (pageOut) {
    out.page = pageOut;
  }
  return out;
}

/**
 * Reads a zoom factor: 2, x2, ×2, 0.5, 50%, 1/2, or "to <px>" for a target
 * cell size.
 *
 * @param {string[]} words Words after "zoom".
 * @param {object} page Page attributes, for "to <px>".
 * @returns {number|null} Factor, or null when unreadable.
 */
export function parseFactor(words, page) {
  const text = words.join(' ').trim().toLowerCase();
  const to = /^to\s+([\d.]+)\s*(px)?$/.exec(text);
  if (to) {
    const px = Number(to[1]);
    return px > 0 ? px / cellPixels(page) : null;
  }
  const m = /^[x×*]?\s*([\d.]+)\s*(%)?$/.exec(text);
  if (m) {
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n <= 0) {
      return null;
    }
    return m[2] ? n / 100 : n;
  }
  const frac = /^([\d.]+)\s*\/\s*([\d.]+)$/.exec(text);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    return a > 0 && b > 0 ? a / b : null;
  }
  return null;
}
