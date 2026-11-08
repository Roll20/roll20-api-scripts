// Other Mods: HealthColors, TokenMod, and the 0.1.x observer list that
// CombatMaster, LazyExperience and StatusInfo use.

import { isRecord } from './utils.js';

const observers = [];

/**
 * Says whether HealthColors is installed.
 *
 * @returns {boolean} True when it is.
 */
export function healthColorsInstalled() {
  return typeof HealthColors !== 'undefined' && !!HealthColors;
}

/**
 * Says whether HealthColors is also tracking death saves.
 *
 * @returns {boolean} True when its death save markers are on.
 */
export function healthColorsTracksSaves() {
  return (
    healthColorsInstalled() &&
    typeof state !== 'undefined' &&
    isRecord(state.HealthColors) &&
    state.HealthColors.deathSavesOn === true
  );
}

/**
 * Adds a 0.1.x observer: called with (token, prev) after DeathTracker handles a
 * hit point change.
 *
 * @param {Function} fn Observer.
 * @returns {void}
 */
export function observeTokenChange(fn) {
  if (typeof fn === 'function') {
    observers.push(fn);
  }
}

/**
 * Tells the 0.1.x observers about a change. One failing observer does not stop
 * the others (or DeathTracker).
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
export function notifyObservers(token, prev) {
  for (const fn of observers) {
    try {
      fn(token, prev);
    } catch (e) {
      log(`DeathTracker: a token change observer failed: ${e?.message || e}`);
    }
  }
}
