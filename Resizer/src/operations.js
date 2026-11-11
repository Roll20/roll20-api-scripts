// The changes Resizer makes. Each records itself for undo and returns a
// result the commands turn into a reply. Nothing here talks to chat.

import {
  CREATURE_SIZES,
  MAX_PAGE_UNITS,
  MAX_ZOOM,
  MIN_ZOOM,
  PIXELS_PER_UNIT,
} from './constants.js';
import {
  calibrateFromBox,
  calibrateFromSquare,
  cellPixels,
  centreOnPage,
  drawingBox,
  fitToPage,
  zoomGraphic,
  zoomLegacyPath,
  zoomPage,
  zoomPathV2,
  zoomPortal,
  zoomText,
} from './geometry.js';
import { notifyZoom } from './hooks.js';
import { attrsOf, isToken, pageObjects } from './objects.js';
import { getSettings } from './state.js';
import { startChange } from './undo.js';
import { roundCoord, toNumber } from './utils.js';

/**
 * Returns a page's attributes as plain values.
 *
 * @param {object} page Roll20 page.
 * @returns {object} Attributes.
 */
function pageAttrs(page) {
  return attrsOf(page);
}

/**
 * Checks a zoom before anything changes, so a batch is all or nothing.
 *
 * @param {object[]} pages Roll20 pages.
 * @param {number} f Zoom factor.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function checkZoom(pages, f) {
  if (!Number.isFinite(f) || f < MIN_ZOOM || f > MAX_ZOOM) {
    return { ok: false, error: 'errors.badFactor', vars: { min: MIN_ZOOM, max: MAX_ZOOM } };
  }
  if (f === 1) {
    return { ok: false, error: 'errors.factorOne' };
  }
  for (const page of pages) {
    const next = zoomPage(pageAttrs(page), f);
    if (
      Math.max(next.width, next.height) > MAX_PAGE_UNITS ||
      Math.min(next.width, next.height) < 1
    ) {
      return {
        ok: false,
        error: 'errors.pageTooBig',
        vars: { page: page.get('name'), max: MAX_PAGE_UNITS },
      };
    }
  }
  return { ok: true };
}

/**
 * Zooms pages with everything on them. The distance per cell is kept, so a
 * 5 ft cell is still 5 ft, only bigger or smaller on screen.
 *
 * @param {object[]} pages Roll20 pages.
 * @param {number} f Zoom factor.
 * @param {object} [options] Options.
 * @param {boolean} [options.keepTokens] Move tokens without changing their size.
 * @returns {{ok: boolean, error?: string, vars?: object, counts?: object, stored?: boolean}} Result.
 */
export function zoomPages(pages, f, options = {}) {
  const check = checkZoom(pages, f);
  if (!check.ok) {
    return check;
  }
  const settings = getSettings();
  const keepTokens = options.keepTokens ?? settings.keepTokenSize;
  const strokes = settings.scaleStrokes;
  const rec = startChange(pages.length === 1 ? 'history.zoom' : 'history.zoomPages', {
    factor: roundCoord(f),
    page: pages[0]?.get('name') || '',
    count: pages.length,
  });
  const counts = { objects: 0, skipped: 0, pages: pages.length };
  for (const page of pages) {
    rec.setPage(page, zoomPage(pageAttrs(page), f));
    for (const { type, obj } of pageObjects(page.id)) {
      const changed = zoomObject(rec, type, obj, f, { keepTokens, strokes });
      if (changed) {
        counts.objects++;
      } else {
        counts.skipped++;
      }
    }
    rec.zoomed(page.id, f);
  }
  const { stored } = rec.commit();
  for (const page of pages) {
    notifyZoom(page.id, f);
  }
  return { ok: true, counts, stored };
}

/**
 * Zooms one object.
 *
 * @param {object} rec Undo recorder.
 * @param {string} type Object type.
 * @param {object} obj Roll20 object.
 * @param {number} f Zoom factor.
 * @param {object} options Options (keepTokens, strokes).
 * @returns {boolean} True when the object was changed.
 */
function zoomObject(rec, type, obj, f, { keepTokens, strokes }) {
  const a = attrsOf(obj);
  // Walls are lines for lighting, so their width stays readable at any zoom.
  const stroke = strokes && a.layer !== 'walls';
  switch (type) {
    case 'graphic':
      rec.set(type, obj, zoomGraphic(a, f, keepTokens && isToken(obj)));
      return true;
    case 'text':
      rec.set(type, obj, zoomText(a, f));
      return true;
    case 'pathv2': {
      const next = zoomPathV2(a, f, stroke);
      if (!next) {
        return false;
      }
      rec.set(type, obj, next);
      return true;
    }
    case 'path': {
      const next = zoomLegacyPath(a, f, stroke);
      return Boolean(next && rec.redrawPath(obj, next));
    }
    case 'door':
    case 'window':
      rec.set(type, obj, zoomPortal(a, f));
      return true;
    default:
      return false;
  }
}

/**
 * Converts a typed size to pixels.
 *
 * @param {number} value Size.
 * @param {string} unit px, cells or units.
 * @param {object} page Page attributes.
 * @returns {number} Pixels.
 */
export function toPixels(value, unit, page) {
  if (unit === 'cells') {
    return value * cellPixels(page);
  }
  if (unit === 'units') {
    return value * PIXELS_PER_UNIT;
  }
  return value;
}

/**
 * Resizes graphics, keeping their centres.
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects.
 * @param {number} width New width.
 * @param {number} height New height.
 * @param {string} unit px, cells or units.
 * @returns {{ok: boolean, error?: string, count?: number, skipped?: number, stored?: boolean}} Result.
 */
export function resizeGraphics(items, width, height, unit) {
  if (!(width > 0) || !(height > 0)) {
    return { ok: false, error: 'errors.badSize' };
  }
  const graphics = items.filter((i) => i.type === 'graphic');
  if (graphics.length === 0) {
    return { ok: false, error: 'errors.noGraphics' };
  }
  const rec = startChange('history.size', { count: graphics.length });
  for (const { obj } of graphics) {
    const page = getObj('page', obj.get('_pageid'));
    const pa = page ? pageAttrs(page) : {};
    rec.set('graphic', obj, {
      width: roundCoord(toPixels(width, unit, pa)),
      height: roundCoord(toPixels(height, unit, pa)),
    });
  }
  const { stored } = rec.commit();
  return { ok: true, count: graphics.length, skipped: items.length - graphics.length, stored };
}

/**
 * Resizes graphics to a creature size, in grid cells of their page.
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects.
 * @param {string} size tiny … gargantuan.
 * @returns {object} As resizeGraphics.
 */
export function sizeToCreature(items, size) {
  const cells = CREATURE_SIZES[size];
  if (!cells) {
    return { ok: false, error: 'errors.badCreatureSize' };
  }
  const result = resizeGraphics(items, cells, cells, 'cells');
  return result;
}

/**
 * Resizes a page (not what is on it).
 *
 * @param {object} page Roll20 page.
 * @param {number} width New width.
 * @param {number} height New height.
 * @param {string} unit units (0.0.9's default), cells or px.
 * @returns {{ok: boolean, error?: string, width?: number, height?: number, stored?: boolean}} Result.
 */
export function resizePage(page, width, height, unit) {
  const pa = pageAttrs(page);
  const toUnits = (v) => toPixels(v, unit, pa) / PIXELS_PER_UNIT;
  const w = roundCoord(toUnits(width));
  const h = roundCoord(toUnits(height));
  if (!(w >= 1) || !(h >= 1) || w > MAX_PAGE_UNITS || h > MAX_PAGE_UNITS) {
    return { ok: false, error: 'errors.badPageSize', vars: { max: MAX_PAGE_UNITS } };
  }
  const rec = startChange('history.page', { page: page.get('name'), width: w, height: h });
  rec.setPage(page, { width: w, height: h });
  const { stored } = rec.commit();
  return { ok: true, width: w, height: h, stored };
}

/**
 * Fits graphics to their page.
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects.
 * @param {boolean} keepRatio Keep each graphic's shape.
 * @returns {{ok: boolean, error?: string, count?: number, stored?: boolean}} Result.
 */
export function fitGraphics(items, keepRatio) {
  const graphics = items.filter((i) => i.type === 'graphic');
  if (graphics.length === 0) {
    return { ok: false, error: 'errors.noGraphics' };
  }
  const rec = startChange('history.fit', { count: graphics.length });
  for (const { obj } of graphics) {
    const page = getObj('page', obj.get('_pageid'));
    if (page) {
      rec.set('graphic', obj, fitToPage(attrsOf(obj), pageAttrs(page), keepRatio));
    }
  }
  const { stored } = rec.commit();
  return { ok: true, count: graphics.length, stored };
}

/**
 * Centres graphics and text on their page.
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects.
 * @param {boolean} horizontal Centre across.
 * @param {boolean} vertical Centre down.
 * @returns {{ok: boolean, error?: string, count?: number, stored?: boolean}} Result.
 */
export function centreItems(items, horizontal, vertical) {
  const movable = items.filter((i) => i.type === 'graphic' || i.type === 'text');
  if (movable.length === 0) {
    return { ok: false, error: 'errors.noGraphics' };
  }
  const rec = startChange('history.centre', { count: movable.length });
  for (const { type, obj } of movable) {
    const page = getObj('page', obj.get('_pageid'));
    if (page) {
      rec.set(type, obj, centreOnPage(pageAttrs(page), horizontal, vertical));
    }
  }
  const { stored } = rec.commit();
  return { ok: true, count: movable.length, stored };
}

/**
 * Picks the map and the calibration box out of a selection: the box is a
 * drawing, the map the biggest graphic (preferring the Map layer).
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects.
 * @returns {{map: object|null, box: {type: string, obj: object}|null}} Map and box.
 */
export function pickMapAndBox(items) {
  const graphics = items.filter((i) => i.type === 'graphic').map((i) => i.obj);
  const area = (o) => (toNumber(o.get('width')) || 0) * (toNumber(o.get('height')) || 0);
  graphics.sort(
    (a, b) =>
      Number(b.get('layer') === 'map') - Number(a.get('layer') === 'map') || area(b) - area(a)
  );
  const box = items.find((i) => i.type === 'pathv2' || i.type === 'path') || null;
  return { map: graphics[0] || null, box };
}

/**
 * Scales and moves a map so the squares drawn on it match the page grid.
 *
 * @param {Array<{type: string, obj: object}>} items Selected objects (a map, and a box
 *   unless squarePx is given).
 * @param {object} options Options.
 * @param {number} [options.across] Squares across the box.
 * @param {number} [options.down] Squares down the box.
 * @param {number} [options.squarePx] Pixels per square on the map now (no box needed).
 * @param {boolean} [options.fitPage] Size the page to the map.
 * @param {boolean} [options.keepBox] Keep the box afterwards.
 * @returns {object} Result with the map's old square size and the scale.
 */
export function calibrateMap(items, options) {
  const { map, box } = pickMapAndBox(items);
  if (!map) {
    return { ok: false, error: 'errors.noMap' };
  }
  const rotation = (((toNumber(map.get('rotation')) || 0) % 360) + 360) % 360;
  if (rotation % 180 !== 0) {
    return { ok: false, error: 'errors.mapRotated' };
  }
  const page = getObj('page', map.get('_pageid'));
  if (!page) {
    return { ok: false, error: 'errors.noPage' };
  }
  const pa = pageAttrs(page);
  const ma = attrsOf(map);
  let plan;
  if (options.squarePx) {
    plan = calibrateFromSquare(ma, options.squarePx, pa, { fitPage: options.fitPage });
  } else {
    if (!box) {
      return { ok: false, error: 'errors.noBox' };
    }
    const b = drawingBox(box.type, attrsOf(box.obj));
    if (!b) {
      return { ok: false, error: 'errors.boxUnreadable' };
    }
    const across = options.across ?? 1;
    const down = options.down ?? across;
    plan = calibrateFromBox(ma, b, across, down, pa, { fitPage: options.fitPage });
  }
  if (!plan.ok) {
    return plan;
  }
  if (plan.page && (plan.page.width > MAX_PAGE_UNITS || plan.page.height > MAX_PAGE_UNITS)) {
    return {
      ok: false,
      error: 'errors.pageTooBig',
      vars: { page: page.get('name'), max: MAX_PAGE_UNITS },
    };
  }
  const name = map.get('name') || '';
  const rec = startChange(name ? 'history.calibrate' : 'history.calibrateUnnamed', { name });
  rec.set('graphic', map, plan.map);
  if (plan.page) {
    rec.setPage(page, plan.page);
  }
  let boxRemoved = false;
  if (box && !options.squarePx && !options.keepBox && getSettings().deleteCalibrationBox) {
    // Recorded as removed, so undo draws it again.
    rec.entry.removed.push({ type: box.type, id: box.obj.id, props: boxProps(box.obj) });
    box.obj.remove();
    boxRemoved = true;
  }
  const { stored } = rec.commit();
  return {
    ok: true,
    stored,
    boxRemoved,
    squarePx: plan.squarePx,
    scale: plan.scale,
    page: plan.page || null,
    cell: cellPixels(pa),
  };
}

/**
 * Properties to draw a removed calibration box again on undo.
 *
 * @param {object} obj Roll20 drawing.
 * @returns {object} Properties for createObj.
 */
function boxProps(obj) {
  const all = attrsOf(obj);
  const out = {};
  for (const [key, value] of Object.entries(all)) {
    if (!['_id', '_type', '_fbpath', '_zorder'].includes(key)) {
      out[key] = value;
    }
  }
  return out;
}
