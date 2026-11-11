// What happens to a token when it dies (each optional), and putting it back.

import { toNumber, toText } from './utils.js';

/**
 * Reads the turn order.
 *
 * @returns {object[]} Entries.
 */
export function readTurnOrder() {
  try {
    const list = JSON.parse(Campaign().get('turnorder') || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Writes the turn order.
 *
 * @param {object[]} list Entries.
 * @returns {void}
 */
function writeTurnOrder(list) {
  Campaign().set('turnorder', JSON.stringify(list));
}

/**
 * Runs the on-death actions the GM chose for a token.
 *
 * @param {object} token Roll20 graphic.
 * @param {{deathLayer: string, deathTurnOrder: string}} settings Settings.
 * @returns {object|null} What was done (kept so `restore` can undo it), or null when nothing was.
 */
export function runDeathActions(token, settings) {
  const done = {};
  if (settings.deathLayer !== 'none' && token.get('layer') !== settings.deathLayer) {
    done.layer = token.get('layer');
    token.set('layer', settings.deathLayer);
  }
  if (settings.deathTurnOrder === 'remove') {
    const list = readTurnOrder();
    const index = list.findIndex((e) => e && e.id === token.id);
    if (index >= 0) {
      const entry = list[index];
      done.turn = { pr: entry.pr, custom: toText(entry.custom), index };
      writeTurnOrder(list.filter((e) => !(e && e.id === token.id)));
    }
  }
  return Object.keys(done).length ? done : null;
}

/**
 * Undoes the on-death actions: back to the layer it was on, and back into the
 * turn order with the initiative it had (when it is not there already).
 *
 * @param {object} token Roll20 graphic.
 * @param {object|null} done What runDeathActions did.
 * @returns {{layer: boolean, turn: boolean}} What was put back.
 */
export function undoDeathActions(token, done) {
  const out = { layer: false, turn: false };
  if (!done) {
    return out;
  }
  if (done.layer && token.get('layer') !== done.layer) {
    token.set('layer', done.layer);
    out.layer = true;
  }
  if (done.turn) {
    const list = readTurnOrder();
    if (!list.some((e) => e && e.id === token.id)) {
      const entry = {
        id: token.id,
        pr: done.turn.pr,
        custom: done.turn.custom || '',
        _pageid: token.get('_pageid'),
      };
      const at = Math.max(
        0,
        Math.min(list.length, Math.round(toNumber(done.turn.index) ?? list.length))
      );
      list.splice(at, 0, entry);
      writeTurnOrder(list);
      out.turn = true;
    }
  }
  return out;
}
