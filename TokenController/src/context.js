import { PAGE_UNIT_PX } from './constants.js';
import { createGrid } from './grid.js';
import { getCalibration } from './state.js';
import { isJumpgate } from './utils.js';

/**
 * Returns the createGrid options for a page, without any calibration.
 *
 * @param {object} page Roll20 page.
 * @returns {object} Grid options.
 */
export function pageGridOptions(page) {
  return {
    gridType: page.get('grid_type') || 'square',
    snapping: Number(page.get('snapping_increment')),
    showGrid: page.get('showgrid') !== false,
    jumpgate: isJumpgate(),
    // Set by Jumpgate's map alignment tool.
    offsetX: Number(page.get('grid_offset_x')) || 0,
    offsetY: Number(page.get('grid_offset_y')) || 0,
  };
}

/**
 * Returns everything needed to move tokens on a page. The grid is read from
 * the page every time, so resizing a page or changing its grid takes effect
 * at once.
 *
 * @param {string} pageId Page ID.
 * @returns {{page: object, grid: object, widthPx: number, heightPx: number}|null}
 *          Page context, or null when the page does not exist.
 */
export function getPageContext(pageId) {
  const page = pageId ? getObj('page', pageId) : null;
  if (!page) {
    return null;
  }
  return {
    page,
    grid: createGrid({ ...pageGridOptions(page), calibration: getCalibration(pageId) }),
    widthPx: (Number(page.get('width')) || 0) * PAGE_UNIT_PX,
    heightPx: (Number(page.get('height')) || 0) * PAGE_UNIT_PX,
  };
}
