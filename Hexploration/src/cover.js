// Hiding tokens' player-visible details while they are under a hex.
//
// Hexes hide the token image, but Roll20 draws nameplates, bars and auras
// above the foreground layer, so a monster under a hex would still give its
// position away. While a token's centre is under a covered (not glimpsed) hex,
// its player-visible flags are switched off; the saved values are restored
// when it is uncovered, moved out, or the setting is turned off.

import { COVERED_TOKEN_PROPS, LAYER_TOKEN } from './constants.js';
import { getPageContext } from './context.js';
import { hexKey, pixelToHex } from './grid.js';
import { getConfig, getCoveredTokens, getHex } from './state.js';

/**
 * Returns true when a token's centre is under a covered hex.
 *
 * @param {object} ctx Page context.
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True when covered.
 */
function isCovered(ctx, token) {
  if (token.get('layer') !== LAYER_TOKEN || token.get('_subtype') !== 'token') {
    return false;
  }
  const [row, col] = pixelToHex(ctx.grid, Number(token.get('left')), Number(token.get('top')));
  const hex = getHex(ctx.pageId, hexKey(row, col));
  return !!hex && !hex.glimpsed;
}

/**
 * Switches a token's player-visible details off, saving their values.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
function hideDetails(token) {
  const covered = getCoveredTokens();
  const id = token.get('_id');
  if (covered[id]) {
    return;
  }
  const saved = {};
  const updates = {};
  for (const prop of COVERED_TOKEN_PROPS) {
    saved[prop] = token.get(prop) === true;
    updates[prop] = false;
  }
  covered[id] = { pageId: token.get('_pageid'), saved };
  token.set(updates);
}

/**
 * Restores a token's saved player-visible details.
 *
 * @param {string} tokenId Token ID.
 * @returns {void}
 */
export function restoreDetails(tokenId) {
  const covered = getCoveredTokens();
  const entry = covered[tokenId];
  if (!entry) {
    return;
  }
  delete covered[tokenId];
  const token = getObj('graphic', tokenId);
  if (token) {
    token.set({ ...entry.saved });
  }
}

/**
 * Keeps a covered token's details hidden when the GM switches one on while it
 * is covered: the new value is saved for when the token is uncovered.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous property values.
 * @returns {void}
 */
export function handleCoveredChange(token, prev) {
  const entry = getCoveredTokens()[token.get('_id')];
  if (!entry || !prev) {
    return;
  }
  const updates = {};
  for (const prop of COVERED_TOKEN_PROPS) {
    if (token.get(prop) === true && prev[prop] !== true) {
      entry.saved[prop] = true;
      updates[prop] = false;
    }
  }
  if (Object.keys(updates).length > 0) {
    token.set(updates);
  }
}

/**
 * Hides or restores one token's details to match whether it is covered.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function refreshToken(token) {
  const ctx = getPageContext(token.get('_pageid'));
  if (getConfig().hideCoveredTokens && ctx.ok && isCovered(ctx, token)) {
    hideDetails(token);
  } else {
    restoreDetails(token.get('_id'));
  }
}

/**
 * Hides or restores the details of every token on a page.
 *
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function refreshPage(pageId) {
  const ctx = getPageContext(pageId);
  const enabled = getConfig().hideCoveredTokens && ctx.ok;
  const covered = getCoveredTokens();
  for (const token of findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' })) {
    if (enabled && isCovered(ctx, token)) {
      hideDetails(token);
    } else if (covered[token.get('_id')]) {
      restoreDetails(token.get('_id'));
    }
  }
  // Forget tokens that were deleted while hidden.
  for (const [tokenId, entry] of Object.entries(covered)) {
    if (entry.pageId === pageId && !getObj('graphic', tokenId)) {
      delete covered[tokenId];
    }
  }
}

/**
 * Restores every hidden token in the game (used when the setting is turned off).
 *
 * @returns {void}
 */
export function restoreAll() {
  for (const tokenId of Object.keys(getCoveredTokens())) {
    restoreDetails(tokenId);
  }
}
