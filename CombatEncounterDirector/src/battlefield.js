import { LAYER_GM, LAYER_MAP, LAYER_TOKEN, VALID_LAYERS } from './constants.js';
import { getTokenRecord, setTokenRecord } from './state.js';
import { ensureTokenRecord, getSelectedTokens } from './tokens.js';
import { getTokenName } from './utils.js';

/**
 * Moves selected tokens to the specified Roll20 layer.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} layer Target layer ('objects', 'gmlayer', or 'map').
 * @returns {{ moved: string[], invalid: boolean }} Result summary.
 */
export function moveSelectedToLayer(msg, layer) {
  if (!VALID_LAYERS.includes(layer)) {
    return { moved: [], invalid: true };
  }

  const tokens = getSelectedTokens(msg);
  const moved = [];

  for (const token of tokens) {
    token.set('layer', layer);
    moved.push(getTokenName(token));
  }

  return { moved, invalid: false };
}

/**
 * Hides selected tokens by moving them to the GM layer.
 * Saves the current layer in the token record so it can be restored.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{ hidden: string[] }} Result summary.
 */
export function hideSelectedTokens(msg) {
  const tokens = getSelectedTokens(msg);
  const hidden = [];

  for (const token of tokens) {
    const record = ensureTokenRecord(token);
    // Only update the record if the token is not already on the GM layer
    if (token.get('layer') !== LAYER_GM) {
      record.lastOperation = 'hide';
      record.lastModified = Date.now();
      setTokenRecord(token.id, record);
      token.set('layer', LAYER_GM);
    }
    hidden.push(getTokenName(token));
  }

  return { hidden };
}

/**
 * Reveals selected tokens by moving them back to the token layer.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{ revealed: string[] }} Result summary.
 */
export function revealSelectedTokens(msg) {
  const tokens = getSelectedTokens(msg);
  const revealed = [];

  for (const token of tokens) {
    token.set('layer', LAYER_TOKEN);
    const record = getTokenRecord(token.id);
    if (record) {
      record.lastOperation = 'reveal';
      record.lastModified = Date.now();
      setTokenRecord(token.id, record);
    }
    revealed.push(getTokenName(token));
  }

  return { revealed };
}

/**
 * Saves the current positions of selected tokens into their state records.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{ saved: string[] }} Result summary.
 */
export function saveSelectedPositions(msg) {
  const tokens = getSelectedTokens(msg);
  const saved = [];

  for (const token of tokens) {
    const record = ensureTokenRecord(token);
    record.savedPosition = {
      left: token.get('left'),
      top: token.get('top'),
      layer: token.get('layer'),
    };
    record.lastOperation = 'position:save';
    record.lastModified = Date.now();
    setTokenRecord(token.id, record);
    saved.push(getTokenName(token));
  }

  return { saved };
}

/**
 * Restores the saved positions of selected tokens from their state records.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{ restored: string[], noSave: string[] }} Result summary.
 */
export function restoreSelectedPositions(msg) {
  const tokens = getSelectedTokens(msg);
  const restored = [];
  const noSave = [];

  for (const token of tokens) {
    const record = getTokenRecord(token.id);
    if (!record?.savedPosition) {
      noSave.push(getTokenName(token));
      continue;
    }
    token.set('left', record.savedPosition.left);
    token.set('top', record.savedPosition.top);
    token.set('layer', record.savedPosition.layer || LAYER_TOKEN);
    record.lastOperation = 'position:restore';
    record.lastModified = Date.now();
    setTokenRecord(token.id, record);
    restored.push(getTokenName(token));
  }

  return { restored, noSave };
}
