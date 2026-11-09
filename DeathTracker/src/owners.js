// Who handles the things HealthColors and DeathTracker can both do: death
// saves with the dying, stable and dead markers; health colours; and hurt and
// heal effects. Each is done by one Mod or by neither. The choice is kept in
// state.ModOwners, which HealthColors 2.5 and later reads and writes as well,
// so changing it in either Mod's settings changes it for both.

import { healthColorsInstalled } from './integration.js';
import { isRecord, toText } from './utils.js';

const SELF = 'DeathTracker';

/** The areas both Mods can handle. */
export const OWNER_AREAS = ['deathSaves', 'colours', 'effects'];

/** Who can handle an area: one of the two Mods, or 'off' for neither. */
export const OWNERS = ['DeathTracker', 'HealthColors', 'off'];

/** The settings-card keys for the areas. */
export const OWNER_SETTINGS = {
  deathSavesBy: 'deathSaves',
  coloursBy: 'colours',
  effectsBy: 'effects',
};

/**
 * Who handles an area until the GM chooses: with HealthColors installed,
 * DeathTracker does death saves and HealthColors the colours and effects;
 * otherwise DeathTracker does them all. HealthColors works this out the same
 * way.
 *
 * @param {string} area One of OWNER_AREAS.
 * @returns {string} One of OWNERS.
 */
export function defaultOwner(area) {
  if (!healthColorsInstalled()) {
    return SELF;
  }
  return area === 'deathSaves' ? SELF : 'HealthColors';
}

/**
 * Who handles an area now.
 *
 * @param {string} area One of OWNER_AREAS.
 * @returns {string} One of OWNERS.
 */
export function getOwner(area) {
  const chosen =
    typeof state !== 'undefined' && isRecord(state.ModOwners) ? state.ModOwners[area] : undefined;
  return OWNERS.includes(chosen) ? chosen : defaultOwner(area);
}

/**
 * Says whether DeathTracker handles an area.
 *
 * @param {string} area One of OWNER_AREAS.
 * @returns {boolean} True when it does.
 */
export function owns(area) {
  return getOwner(area) === SELF;
}

/**
 * Reads an owner typed in chat ("healthcolors", "DeathTracker", "off").
 *
 * @param {*} raw Value as typed.
 * @returns {string|null} One of OWNERS, or null when it is none of them.
 */
export function parseOwner(raw) {
  const value = toText(raw).trim().toLowerCase();
  if (['none', 'disabled', 'disable', 'no'].includes(value)) {
    return 'off';
  }
  return OWNERS.find((o) => o.toLowerCase() === value) || null;
}

/**
 * Chooses who handles an area, for both Mods.
 *
 * @param {string} area One of OWNER_AREAS.
 * @param {string} owner One of OWNERS.
 * @returns {void}
 */
export function setOwner(area, owner) {
  if (!isRecord(state.ModOwners)) {
    state.ModOwners = {};
  }
  state.ModOwners[area] = owner;
}

/**
 * Says whether the installed HealthColors reads the shared choice (2.5 and
 * later). Older versions do their own thing whatever is chosen.
 *
 * @returns {boolean} True when it does.
 */
export function healthColorsShares() {
  return healthColorsInstalled() && typeof HealthColors.ownersChanged === 'function';
}

/**
 * Asks HealthColors to bring its tokens up to date after the choice changed.
 *
 * @returns {void}
 */
export function tellHealthColors() {
  if (!healthColorsShares()) {
    return;
  }
  try {
    HealthColors.ownersChanged();
  } catch (e) {
    log(`DeathTracker: HealthColors could not refresh: ${e?.message || e}`);
  }
}
