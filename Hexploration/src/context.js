import { createGrid } from './grid.js';
import { getPageData } from './state.js';
import { isJumpgate } from './utils.js';

/**
 * Builds the hex grid for a page, including any calibration.
 *
 * @param {object} page Roll20 page.
 * @returns {object|null} Grid object, or null when the page has no hex grid.
 */
export function buildPageGrid(page) {
  const pageId = page.get('_id');
  return createGrid({
    gridType: page.get('grid_type'),
    // snapping_increment is 0 when snapping is off; the grid is still drawn at 1 unit.
    scale: Number(page.get('snapping_increment')) || 1,
    jumpgate: isJumpgate(),
    // Set by Jumpgate's map alignment tool.
    offsetX: Number(page.get('grid_offset_x')) || 0,
    offsetY: Number(page.get('grid_offset_y')) || 0,
    calibration: getPageData(pageId)?.calibration || null,
  });
}

/**
 * Returns everything needed to work on a page's hexes.
 *
 * @param {string} pageId Page ID.
 * @returns {{ok: true, pageId: string, page: object, grid: object}|{ok: false, reason: string}}
 *          Context, or the reason it is unavailable ('noPage' or 'notHex').
 */
export function getPageContext(pageId) {
  const page = pageId ? getObj('page', pageId) : null;
  if (!page) {
    return { ok: false, reason: 'noPage' };
  }
  const grid = buildPageGrid(page);
  if (!grid) {
    return { ok: false, reason: 'notHex' };
  }
  return { ok: true, pageId, page, grid };
}
