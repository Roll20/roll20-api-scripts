// Persistent state (plan §3.2): namespaced JSON under state.TaskAutomation,
// sequential migrations with a bounded backup, ID counters, configuration
// and size estimates. Live objects, timers and indexes never go in here.

import {
  DASHBOARD_ROW_OPTIONS,
  DEFAULT_CONFIG,
  DEFAULT_LIMITS,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
  USEROPTION_KEYS,
} from './constants.js';
import { normalizeLocale } from './i18n.js';
import { stateRoot, userOptions } from './host.js';
import {
  clone,
  estimateSize,
  isRecord,
  parseBoolean,
  parseDuration,
  parseStrictInt,
} from './utils.js';

const BACKUP_KEY = `${STATE_KEY}Backup`;
const MAX_BACKUP_BYTES = 256 * 1024;

// Map branches every valid state must have, with their empty values.
const BRANCHES = {
  definitions: () => ({}),
  schedules: () => ({}),
  triggerState: () => ({}),
  instances: () => ({}),
  queues: () => ({}),
  incidents: () => ({}),
  history: () => [],
  audit: () => [],
  confirmations: () => ({}),
  imports: () => ({}),
  circuit: () => ({}),
  baselines: () => ({}),
  notices: () => ({}),
};

// Sequential migrations: MIGRATIONS[n] turns schema n into schema n + 1.
// Schema 1 is the first release, so there are none yet; the loop and its
// backup/rollback are exercised by tests with a synthetic migration.
export const MIGRATIONS = {};

/**
 * Returns a fresh state.
 *
 * @param {number} at Creation time.
 * @returns {object} State.
 */
export function createState(at) {
  const fresh = {
    schemaVersion: SCHEMA_VERSION,
    releaseVersion: SCRIPT_VERSION,
    createdAt: at,
    boot: { id: null, at: null, count: 0, lastObservedAt: null },
    config: { ...DEFAULT_CONFIG },
    counters: { id: 1, token: 1 },
    halted: null,
    dashboard: {
      handoutId: null,
      playerHandoutId: null,
      helpHandoutId: null,
      view: 'overview',
      page: 1,
      lastHash: null,
      playerHash: null,
      recreatedAt: 0,
      drift: null,
    },
    stats: {
      admitted: 0,
      rejected: 0,
      suppressed: 0,
      dropped: 0,
      coalesced: 0,
      completed: 0,
      failed: 0,
    },
  };
  for (const [key, make] of Object.entries(BRANCHES)) {
    fresh[key] = make();
  }
  return fresh;
}

/**
 * Checks the shape of stored state without changing it.
 *
 * @param {*} raw Stored value.
 * @returns {{ok: boolean, error?: string}} Result.
 */
export function checkStateShape(raw) {
  if (!isRecord(raw)) {
    return { ok: false, error: 'notObject' };
  }
  if (!Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 1) {
    return { ok: false, error: 'badSchemaVersion' };
  }
  for (const [key, make] of Object.entries(BRANCHES)) {
    if (raw[key] !== undefined && Array.isArray(make()) !== Array.isArray(raw[key])) {
      return { ok: false, error: `bad:${key}` };
    }
    if (raw[key] !== undefined && !Array.isArray(raw[key]) && !isRecord(raw[key])) {
      return { ok: false, error: `bad:${key}` };
    }
  }
  return { ok: true };
}

/**
 * Fills in branches added since the state was written, keeping data.
 *
 * @param {object} s State.
 * @param {number} at Current time.
 * @returns {object} The same state.
 */
function fillDefaults(s, at) {
  const fresh = createState(at);
  for (const key of Object.keys(fresh)) {
    if (s[key] === undefined) {
      s[key] = fresh[key];
    }
  }
  s.config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
  s.dashboard = { ...fresh.dashboard, ...(isRecord(s.dashboard) ? s.dashboard : {}) };
  s.stats = { ...fresh.stats, ...(isRecord(s.stats) ? s.stats : {}) };
  s.counters = { ...fresh.counters, ...(isRecord(s.counters) ? s.counters : {}) };
  return s;
}

/**
 * Migrates stored state in place to the current schema. Never overwrites
 * state from a newer version or state that is not recognisable: the Mod
 * stops instead and tells the GM.
 *
 * @param {*} raw Stored value (undefined on a new game).
 * @param {number} at Current time.
 * @param {object} [migrations] Migration table (tests pass their own).
 * @param {number} [target] Schema to migrate to (tests pass their own).
 * @returns {{status: 'fresh'|'ok'|'migrated'|'newer'|'corrupt'|'migrationFailed', state?: object, from?: number, error?: string}}
 *          Outcome.
 */
export function migrateState(raw, at, migrations = MIGRATIONS, target = SCHEMA_VERSION) {
  if (raw === undefined || raw === null) {
    return { status: 'fresh', state: createState(at) };
  }
  const shape = checkStateShape(raw);
  if (!shape.ok) {
    return { status: 'corrupt', error: shape.error };
  }
  if (raw.schemaVersion > target) {
    return { status: 'newer', from: raw.schemaVersion };
  }
  if (raw.schemaVersion === target) {
    return { status: 'ok', state: fillDefaults(raw, at) };
  }
  const from = raw.schemaVersion;
  let working = clone(raw);
  try {
    while (working.schemaVersion < target) {
      const step = migrations[working.schemaVersion];
      if (typeof step !== 'function') {
        return { status: 'migrationFailed', from, error: `noMigration:${working.schemaVersion}` };
      }
      working = step(working);
      const check = checkStateShape(working);
      if (!check.ok) {
        return { status: 'migrationFailed', from, error: check.error };
      }
    }
  } catch (err) {
    return { status: 'migrationFailed', from, error: String(err?.message || err) };
  }
  return { status: 'migrated', from, state: fillDefaults(working, at) };
}

let disabled = null;

/**
 * Loads, validates and migrates the persistent state. On failure the
 * original data is left untouched and the Mod runs no tasks.
 *
 * @param {number} at Current time.
 * @returns {{status: string, from?: number, error?: string}} Outcome.
 */
export function initialiseState(at) {
  const root = stateRoot();
  const raw = root[STATE_KEY];
  let backupMade = false;
  if (isRecord(raw) && Number.isInteger(raw.schemaVersion) && raw.schemaVersion < SCHEMA_VERSION) {
    if (estimateSize(raw) <= MAX_BACKUP_BYTES) {
      root[BACKUP_KEY] = clone(raw);
      backupMade = true;
    }
  }
  const result = migrateState(raw, at);
  if (!result.state) {
    disabled = result;
    return result;
  }
  result.state.releaseVersion = SCRIPT_VERSION;
  root[STATE_KEY] = result.state;
  if (backupMade) {
    delete root[BACKUP_KEY];
  }
  disabled = null;
  return result;
}

/**
 * Returns the reason the Mod is disabled, or null.
 *
 * @returns {object|null} Failed migration outcome.
 */
export function disabledReason() {
  return disabled;
}

/**
 * Returns the persistent state.
 *
 * @returns {object} State branch.
 */
export function getState() {
  return stateRoot()[STATE_KEY];
}

/**
 * Returns the global configuration.
 *
 * @returns {object} Config.
 */
export function getConfig() {
  return getState().config;
}

/**
 * Returns the effective limits. Limits are product defaults; they live in
 * code so a crafted import cannot raise them.
 *
 * @returns {object} Limits.
 */
export function getLimits() {
  return DEFAULT_LIMITS;
}

/**
 * Allocates a new ID with a prefix, e.g. `run-42`.
 *
 * @param {string} prefix Prefix.
 * @returns {string} ID.
 */
export function nextId(prefix) {
  const s = getState();
  const id = `${prefix}-${s.counters.id}`;
  s.counters.id += 1;
  return id;
}

/**
 * Returns the next value of the confirmation-token counter.
 *
 * @returns {number} Counter.
 */
export function nextTokenCounter() {
  const s = getState();
  s.counters.token += 1;
  return s.counters.token;
}

/**
 * Validates a configuration value.
 *
 * @param {string} key Config key.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Result.
 */
export function validateConfigValue(key, raw) {
  switch (key) {
    case 'language': {
      const value = normalizeLocale(String(raw ?? ''));
      return value ? { valid: true, value } : { valid: false };
    }
    case 'dashboardRows': {
      const value = parseStrictInt(raw);
      return DASHBOARD_ROW_OPTIONS.includes(value) ? { valid: true, value } : { valid: false };
    }
    case 'playerView':
    case 'diagnostics':
    case 'privateChatTriggers': {
      const value = parseBoolean(raw);
      return value === null ? { valid: false } : { valid: true, value };
    }
    case 'roundAnchor': {
      const value = String(raw ?? '').trim();
      return value && value.length <= 40 ? { valid: true, value } : { valid: false };
    }
    case 'checkpointMs': {
      if (String(raw) === '0' || String(raw).toLowerCase() === 'off') {
        return { valid: true, value: 0 };
      }
      const value = typeof raw === 'number' ? raw : parseDuration(raw);
      return value !== null && value >= 60000 ? { valid: true, value } : { valid: false };
    }
    case 'graceMs':
    case 'lateWindowMs': {
      const value = typeof raw === 'number' ? raw : parseDuration(raw);
      const min = key === 'graceMs' ? 0 : 1000;
      return value !== null && value >= min ? { valid: true, value } : { valid: false };
    }
    default:
      return { valid: false };
  }
}

/**
 * Sets one configuration value.
 *
 * @param {string} key Config key.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Result.
 */
export function setConfigValue(key, raw) {
  if (!(key in DEFAULT_CONFIG)) {
    return { valid: false };
  }
  const result = validateConfigValue(key, raw);
  if (result.valid) {
    getConfig()[key] = result.value;
  }
  return result;
}

/**
 * Imports One-Click useroptions. Options are only re-applied when the GM
 * changes them on the Mod page, so chat changes survive restarts.
 *
 * @returns {void}
 */
export function applyGlobalConfig() {
  const options = userOptions(STATE_KEY);
  if (!options) {
    return;
  }
  const s = getState();
  const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
  for (const key of USEROPTION_KEYS) {
    if (key in options && options[key] !== applied[key]) {
      setConfigValue(key, options[key]);
      applied[key] = options[key];
    }
  }
  s.notices.useroptions = applied;
}

/**
 * Estimates the stored size of the state.
 *
 * @returns {number} Approximate bytes.
 */
export function stateSize() {
  return estimateSize(getState());
}

let sizeCache = { at: -Infinity, bytes: 0 };

/**
 * Returns true when the state is close to its size budget; new admissions
 * are refused while history and incidents keep their headroom. The size is
 * re-measured at most every ten seconds.
 *
 * @param {number} at Current time.
 * @returns {boolean} True when nearly full.
 */
export function stateNearlyFull(at) {
  if (at - sizeCache.at > 10000) {
    sizeCache = { at, bytes: stateSize() };
  }
  return sizeCache.bytes > getLimits().stateBytes * 0.9;
}
