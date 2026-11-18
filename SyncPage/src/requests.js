// Pending prompts. A button that would carry a lot of data carries only a
// short request ID; the data waits in state. Each button works once, and
// requests expire, so an old button cannot act on stale data.

import { REQUEST_TTL_MS } from './constants.js';
import { getState } from './state.js';
import { makeId } from './utils.js';

/**
 * Stores a request.
 *
 * @param {string} kind What the request is for (`delete`, `leftover`, …).
 * @param {string} gm Player ID of the GM it was made for.
 * @param {*} payload JSON-safe data.
 * @returns {string} Request ID.
 */
export function createRequest(kind, gm, payload) {
  const id = makeId('r');
  getState().requests[id] = { kind, gm: gm || '', at: Date.now(), payload };
  return id;
}

/**
 * Takes a request, removing it.
 *
 * @param {string} id Request ID.
 * @param {string} [kind] Expected kind.
 * @returns {{ok: boolean, kind?: string, payload?: *, reason?: string}} The request's data, or why not.
 */
export function takeRequest(id, kind) {
  const requests = getState().requests;
  const r = requests[id];
  if (!r || (kind && r.kind !== kind)) {
    return { ok: false, reason: 'unknown' };
  }
  delete requests[id];
  if (Date.now() - r.at > REQUEST_TTL_MS) {
    return { ok: false, reason: 'expired' };
  }
  return { ok: true, kind: r.kind, payload: r.payload, gm: r.gm };
}

/**
 * Drops requests long past their expiry. They are kept a while after they
 * expire so a late click is told "expired" rather than "already used".
 *
 * @returns {number} How many were dropped.
 */
export function sweepRequests() {
  const requests = getState().requests;
  let n = 0;
  for (const [id, r] of Object.entries(requests)) {
    if (Date.now() - r.at > REQUEST_TTL_MS * 6) {
      delete requests[id];
      n += 1;
    }
  }
  return n;
}
