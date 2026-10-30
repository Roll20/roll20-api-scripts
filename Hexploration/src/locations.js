// Named hexes and hidden location tokens.
//
// A hex can carry a name (shown to the GM as a label on the GM layer) and an
// icon (a token hidden on the GM layer). Both are announced when the hex is
// revealed, and the icon is moved back to the token layer.

import {
  LABEL_FONT_FAMILY,
  LABEL_FONT_SIZE,
  LAYER_GM,
  LAYER_TOKEN,
  LOCATION_MARKER,
  MAX_NAME_LENGTH,
} from './constants.js';
import { hexKey, hexToPixel, pixelToHex } from './grid.js';
import {
  getConfig,
  getHex,
  getPageHexes,
  getPendingLocations,
  setPendingLocation,
} from './state.js';
import { tokenHasMarker, toText } from './utils.js';

/**
 * Returns the token attached to a hex as its icon, if it still exists.
 *
 * @param {object} hex Hex record.
 * @returns {object|null} Roll20 graphic.
 */
export function getHexIcon(hex) {
  return hex.iconId ? getObj('graphic', hex.iconId) || null : null;
}

/**
 * Returns the name announced when a hex is discovered: the icon's name, or
 * the hex's own name.
 *
 * @param {object} hex Hex record.
 * @returns {string} Discovery name (empty when the hex is unnamed).
 */
export function getDiscoveryName(hex) {
  const icon = getHexIcon(hex);
  return toText(icon?.get('name')) || toText(hex.name);
}

/**
 * Removes a hex's GM-layer name label.
 *
 * @param {object} hex Hex record.
 * @returns {void}
 */
export function removeLabel(hex) {
  if (hex.nameId) {
    getObj('text', hex.nameId)?.remove();
    delete hex.nameId;
  }
}

/**
 * Gives a name label a font Jumpgate can draw. A text created through the API
 * without one gets the font "unset", and Jumpgate stops drawing the whole
 * tabletop ("Something Went Wrong") when it meets it. Labels made by 2.0.0 and
 * 2.0.1 have that font.
 *
 * @param {object} text Roll20 text object.
 * @returns {boolean} Whether the font was changed.
 */
export function repairLabelFont(text) {
  const font = toText(text.get('font_family'));
  if (font && font !== 'unset') {
    return false;
  }
  text.set('font_family', LABEL_FONT_FAMILY);
  return true;
}

/**
 * Repairs the font of every name label Hexploration knows about.
 *
 * @param {string[]} pageIds Pages with hexes.
 * @returns {number} Number of labels repaired.
 */
export function repairLabelFonts(pageIds) {
  let count = 0;
  for (const pageId of pageIds) {
    for (const hex of getPageHexes(pageId)) {
      const text = hex.nameId ? getObj('text', hex.nameId) : null;
      if (text && repairLabelFont(text)) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Sets or clears a hex's name and redraws its GM-layer label.
 *
 * @param {object} ctx Page context.
 * @param {object} hex Hex record.
 * @param {string} name New name (empty to clear).
 * @returns {void}
 */
export function setHexName(ctx, hex, name) {
  removeLabel(hex);
  const clean = toText(name).slice(0, MAX_NAME_LENGTH);
  if (!clean) {
    delete hex.name;
    return;
  }
  hex.name = clean;
  const [x, y] = hexToPixel(ctx.grid, hex.row, hex.col);
  const label = createObj('text', {
    _pageid: ctx.pageId,
    layer: LAYER_GM,
    left: x,
    top: y,
    text: clean,
    color: getConfig().labelColor,
    font_family: LABEL_FONT_FAMILY,
    font_size: LABEL_FONT_SIZE,
  });
  if (label) {
    hex.nameId = label.get('_id');
  }
}

/**
 * Attaches a token to a hex as its hidden icon.
 *
 * @param {object} hex Hex record.
 * @param {object} token Roll20 graphic.
 * @returns {string} The token's layer before it was hidden (for undo).
 */
export function attachIcon(hex, token) {
  const previousLayer = token.get('layer');
  hex.iconId = token.get('_id');
  token.set('layer', LAYER_GM);
  setPendingLocation(hex.iconId, null);
  return previousLayer;
}

/**
 * Detaches a hex's icon and returns it to the token layer.
 *
 * @param {object} hex Hex record.
 * @param {boolean} [show=true] Move the icon back to the token layer.
 * @returns {void}
 */
export function detachIcon(hex, show = true) {
  const icon = getHexIcon(hex);
  if (icon && show) {
    icon.set('layer', LAYER_TOKEN);
  }
  delete hex.iconId;
}

/**
 * Returns the hex records on a page keyed by the ID of their icon.
 *
 * @param {string} pageId Page ID.
 * @returns {Map<string, object>} Map of icon ID to hex record.
 */
function hexesByIcon(pageId) {
  const map = new Map();
  for (const hex of getPageHexes(pageId)) {
    if (hex.iconId) {
      map.set(hex.iconId, hex);
    }
  }
  return map;
}

/**
 * Returns location tokens waiting for a hex on a page, keyed by hex cell:
 * tokens marked with `mark`, plus (as in v1) tokens with the white-tower
 * status marker. Tokens already attached to a hex are ignored.
 *
 * @param {object} ctx Page context.
 * @returns {Map<string, object>} Map of "row,col" to Roll20 graphic.
 */
export function findLocationTokens(ctx) {
  const attached = hexesByIcon(ctx.pageId);
  const tokens = new Map();
  const consider = (token) => {
    if (!token || attached.has(token.get('_id'))) {
      return;
    }
    const [row, col] = pixelToHex(ctx.grid, token.get('left'), token.get('top'));
    tokens.set(hexKey(row, col), token);
  };

  for (const tokenId of getPendingLocations(ctx.pageId)) {
    const token = getObj('graphic', tokenId);
    if (token) {
      consider(token);
    } else {
      setPendingLocation(tokenId, null);
    }
  }
  for (const token of findObjs({ _type: 'graphic', _pageid: ctx.pageId })) {
    if (tokenHasMarker(token, LOCATION_MARKER)) {
      consider(token);
    }
  }
  return tokens;
}

/**
 * Marks tokens as hidden locations. A token already under a hex is attached
 * immediately; otherwise it waits for the next fill that covers it.
 *
 * @param {object} ctx Page context.
 * @param {object[]} tokens Roll20 graphics.
 * @returns {{attached: number, pending: number}} Counts.
 */
export function markLocations(ctx, tokens) {
  const attached = hexesByIcon(ctx.pageId);
  let attachedCount = 0;
  let pendingCount = 0;
  for (const token of tokens) {
    if (attached.has(token.get('_id'))) {
      continue;
    }
    const [row, col] = pixelToHex(ctx.grid, token.get('left'), token.get('top'));
    const hex = getHex(ctx.pageId, hexKey(row, col));
    if (hex && !hex.iconId) {
      attachIcon(hex, token);
      attachedCount++;
    } else {
      setPendingLocation(token.get('_id'), ctx.pageId);
      pendingCount++;
    }
  }
  return { attached: attachedCount, pending: pendingCount };
}

/**
 * Stops tokens being hidden locations. Attached tokens return to the token layer.
 *
 * @param {object} ctx Page context.
 * @param {object[]} tokens Roll20 graphics.
 * @returns {number} Number of tokens unmarked.
 */
export function unmarkLocations(ctx, tokens) {
  const attached = hexesByIcon(ctx.pageId);
  const pending = new Set(getPendingLocations(ctx.pageId));
  let count = 0;
  for (const token of tokens) {
    const id = token.get('_id');
    const hex = attached.get(id);
    if (hex) {
      detachIcon(hex);
      count++;
    } else if (pending.has(id)) {
      setPendingLocation(id, null);
      count++;
    }
  }
  return count;
}
