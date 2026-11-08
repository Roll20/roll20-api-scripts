// Tint by hit points and the hurt and heal effects (0.1.x features, fixed).

import { BEAM_FX_TYPES } from './constants.js';
import { tintHue } from './status.js';
import { hueToHex, toNumber } from './utils.js';

/**
 * Tints a token from green (full) to red (0), or gives it back its own tint
 * when it is at full hit points again.
 *
 * @param {object} token Roll20 graphic.
 * @param {import('./state.js').TokenRecord} record Token record (its own tint is kept here).
 * @param {number} hp Hit points.
 * @param {number|null} max Maximum.
 * @returns {void}
 */
export function applyTint(token, record, hp, max) {
  if (!max) {
    return;
  }
  if (hp >= max) {
    clearTint(token, record);
    return;
  }
  if (record.tint === null) {
    record.tint = token.get('tint_color') || 'transparent';
  }
  const colour = hueToHex(tintHue(hp, max));
  if (token.get('tint_color') !== colour) {
    token.set('tint_color', colour);
  }
}

/**
 * Gives a token back the tint it had before DeathTracker tinted it.
 *
 * @param {object} token Roll20 graphic.
 * @param {import('./state.js').TokenRecord} record Token record.
 * @returns {void}
 */
export function clearTint(token, record) {
  if (record.tint === null) {
    return;
  }
  if (token.get('tint_color') !== record.tint) {
    token.set('tint_color', record.tint);
  }
  record.tint = null;
}

/**
 * Plays a built-in effect on a token, on the token's own page.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} type Effect name such as "splatter-blood".
 * @returns {void}
 */
export function playFx(token, type) {
  const x = toNumber(token.get('left'));
  const y = toNumber(token.get('top'));
  if (x === null || y === null || !type) {
    return;
  }
  const pageId = token.get('_pageid');
  if (BEAM_FX_TYPES.includes(type.split('-')[0])) {
    spawnFxBetweenPoints({ x, y }, { x, y }, type, pageId);
  } else {
    spawnFx(x, y, type, pageId);
  }
}
