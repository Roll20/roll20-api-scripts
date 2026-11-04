// Echo guard. SyncPage's own set() calls raise no events for graphics and
// text, but doors and pages come back from the client about a second later
// as change events. Every write is recorded with the values written; an event
// whose changed values all match a recorded write is SyncPage's own echo.

import { ECHO_TTL_MS } from './constants.js';
import { sameValue } from './utils.js';

/** @type {Map<string, {until: number, props: Record<string, *>}>} */
const writes = new Map();
/** @type {Map<string, number>} */
const removals = new Map();

/**
 * Drops records that are too old.
 *
 * @returns {void}
 */
function expire() {
  const now = Date.now();
  for (const [id, w] of writes) {
    if (w.until < now) {
      writes.delete(id);
    }
  }
  for (const [id, until] of removals) {
    if (until < now) {
      removals.delete(id);
    }
  }
}

/**
 * Records values SyncPage is writing to an object.
 *
 * @param {string} id Object ID.
 * @param {Record<string, *>} props Properties written.
 * @returns {void}
 */
export function expectWrite(id, props) {
  expire();
  const w = writes.get(id) || { until: 0, props: {} };
  Object.assign(w.props, props);
  w.until = Date.now() + ECHO_TTL_MS;
  writes.set(id, w);
}

/**
 * Records that SyncPage is removing an object.
 *
 * @param {string} id Object ID.
 * @returns {void}
 */
export function expectRemove(id) {
  expire();
  removals.set(id, Date.now() + ECHO_TTL_MS);
}

/**
 * Returns true (once) when a destroy event is SyncPage's own removal.
 *
 * @param {string} id Object ID.
 * @returns {boolean} True for an own removal.
 */
export function isOwnRemoval(id) {
  expire();
  if (removals.has(id)) {
    removals.delete(id);
    return true;
  }
  return false;
}

/**
 * Removes the keys of a change that SyncPage itself wrote.
 *
 * @param {object} obj Changed object.
 * @param {string[]} keys Changed keys.
 * @returns {string[]} Keys changed by someone else.
 */
export function filterEcho(obj, keys) {
  expire();
  const w = writes.get(obj.id);
  if (!w) {
    return keys;
  }
  const left = [];
  for (const key of keys) {
    if (key in w.props && sameValue(obj.get(key), w.props[key])) {
      continue;
    }
    // Someone changed it again: it is theirs now.
    delete w.props[key];
    left.push(key);
  }
  return left;
}

/**
 * Forgets every record (tests and restarts).
 *
 * @returns {void}
 */
export function resetEcho() {
  writes.clear();
  removals.clear();
}
