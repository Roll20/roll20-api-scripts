import {
  ANNOUNCE_OPTIONS,
  DEFAULT_CONFIG,
  HEX_LAYER_OPTIONS,
  MAX_REVEAL_DISTANCE,
  MAX_STROKE_WIDTH,
  PAGE_SETTING_KEYS,
  REVEAL_BY_OPTIONS,
  REVEAL_MODE_OPTIONS,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
} from './constants.js';
import { parseHexKey } from './grid.js';
import { normalizeLocale } from './i18n.js';
import { clamp, isRecord, isValidColor, parseBoolean, parseStrictInt, toText } from './utils.js';

// ---------------------------------------------------------------------------
// Config validation (pure)
// ---------------------------------------------------------------------------

/**
 * Validates one configuration value.
 *
 * @param {string} key Config key.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Result; `value` is the normalised value when valid.
 */
export function validateConfigValue(key, raw) {
  const ok = (value) => ({ valid: true, value });
  const bad = { valid: false };

  switch (key) {
    case 'language': {
      const lang = normalizeLocale(raw);
      return lang ? ok(lang) : bad;
    }
    case 'hexLayer':
      return HEX_LAYER_OPTIONS.includes(raw) ? ok(raw) : bad;
    case 'revealBy':
      return REVEAL_BY_OPTIONS.includes(raw) ? ok(raw) : bad;
    case 'revealMode':
      return REVEAL_MODE_OPTIONS.includes(raw) ? ok(raw) : bad;
    case 'announce':
      return ANNOUNCE_OPTIONS.includes(raw) ? ok(raw) : bad;
    case 'fillColor':
    case 'strokeColor':
    case 'labelColor':
    case 'glimpseColor':
      return isValidColor(raw) ? ok(toText(raw)) : bad;
    case 'strokeWidth': {
      const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
      return n === null || !Number.isFinite(n) || n < 0 ? bad : ok(clamp(n, 0, MAX_STROKE_WIDTH));
    }
    case 'revealDistance': {
      const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
      return n === null || !Number.isFinite(n) || n < 0
        ? bad
        : ok(clamp(n, 0, MAX_REVEAL_DISTANCE));
    }
    case 'maxDistance': {
      if (raw === null || raw === undefined || ['', '-', 'none', 'off'].includes(toText(raw))) {
        return ok(null);
      }
      const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
      return n === null || !Number.isFinite(n) || n < 0
        ? bad
        : ok(clamp(n, 0, MAX_REVEAL_DISTANCE));
    }
    case 'lineOfSight':
    case 'revealPath':
    case 'pingDiscoveries':
    case 'hideCoveredTokens': {
      const b = parseBoolean(raw);
      return b === null ? bad : ok(b);
    }
    default:
      return bad;
  }
}

/**
 * Merges a possibly incomplete or invalid config with defaults.
 *
 * @param {object} config Config to merge.
 * @param {object} [defaults] Defaults to fall back on.
 * @returns {object} Complete config.
 */
export function mergeConfig(config, defaults = DEFAULT_CONFIG) {
  const c = isRecord(config) ? config : {};
  const merged = {};
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    const result = key in c ? validateConfigValue(key, c[key]) : { valid: false };
    merged[key] = result.valid ? result.value : defaults[key];
  }
  return merged;
}

/**
 * Keeps only valid per-page overrides.
 *
 * @param {object} settings Raw page settings.
 * @returns {object} Clean page settings.
 */
function mergePageSettings(settings) {
  const clean = {};
  if (!isRecord(settings)) {
    return clean;
  }
  for (const key of PAGE_SETTING_KEYS) {
    if (key in settings) {
      const result = validateConfigValue(key, settings[key]);
      if (result.valid) {
        clean[key] = result.value;
      }
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// State shape and migration (pure)
// ---------------------------------------------------------------------------

/**
 * Creates an empty v2 state object.
 *
 * @returns {object} Fresh state.
 */
export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    config: { ...DEFAULT_CONFIG },
    pages: {},
    pendingLocations: {},
    lastFill: null,
    coveredTokens: {},
    notices: {},
  };
}

/**
 * Normalises one stored hex record.
 *
 * @param {string} key "row,col" key.
 * @param {object} raw Stored record.
 * @returns {object|null} Clean hex record, or null when unusable.
 */
function normaliseHex(key, raw) {
  const coords = parseHexKey(key);
  if (!coords || !isRecord(raw) || !toText(raw.id)) {
    return null;
  }
  const hex = {
    id: toText(raw.id),
    type: raw.type === 'pathv2' ? 'pathv2' : raw.type === 'path' ? 'path' : null,
    row: coords[0],
    col: coords[1],
  };
  if (toText(raw.name)) {
    hex.name = toText(raw.name);
  }
  if (toText(raw.nameId)) {
    hex.nameId = toText(raw.nameId);
  }
  if (toText(raw.iconId)) {
    hex.iconId = toText(raw.iconId);
  }
  const maxDistance = validateConfigValue('maxDistance', raw.maxDistance);
  if (maxDistance.valid && maxDistance.value !== null) {
    hex.maxDistance = maxDistance.value;
  }
  if (raw.glimpsed === true) {
    hex.glimpsed = true;
  }
  return hex;
}

/**
 * Normalises a page's stored data.
 *
 * @param {object} raw Stored page data.
 * @returns {object} Clean page data.
 */
function normalisePage(raw) {
  const page = { hexes: {}, settings: {}, calibration: null };
  if (!isRecord(raw)) {
    return page;
  }
  if (isRecord(raw.hexes)) {
    for (const [key, value] of Object.entries(raw.hexes)) {
      const hex = normaliseHex(key, value);
      if (hex) {
        page.hexes[`${hex.row},${hex.col}`] = hex;
      }
    }
  }
  page.settings = mergePageSettings(raw.settings);
  if (isRecord(raw.calibration)) {
    const cal = {};
    for (const k of ['colStep', 'rowStep', 'originX', 'originY']) {
      if (Number.isFinite(raw.calibration[k])) {
        cal[k] = raw.calibration[k];
      }
    }
    page.calibration = Object.keys(cal).length === 4 ? cal : null;
  }
  return page;
}

/**
 * Converts any stored state (v1, v2 or damaged) into a clean v2 state.
 *
 * v1 stored hexes in `pageHexes[pageId]["row,col"]` with a parallel `hexIdMap`,
 * and a flat config. Its defaults differed (no reveal distance), so missing
 * v1 values fall back to v1 behaviour rather than the new defaults.
 *
 * @param {*} raw Stored state.
 * @returns {{state: object, migratedFrom: number|null}} Clean state and the
 *          schema it was migrated from (null when no migration was needed).
 */
export function migrateState(raw) {
  const fresh = createDefaultState();
  if (!isRecord(raw)) {
    return { state: fresh, migratedFrom: null };
  }

  if (isRecord(raw.pageHexes) && !isRecord(raw.pages)) {
    const v1Defaults = { ...DEFAULT_CONFIG, revealDistance: 0, strokeWidth: 0 };
    fresh.config = mergeConfig(raw.config, v1Defaults);
    for (const [pageId, hexes] of Object.entries(raw.pageHexes)) {
      const page = normalisePage({ hexes });
      if (Object.keys(page.hexes).length > 0) {
        fresh.pages[pageId] = page;
      }
    }
    return { state: fresh, migratedFrom: 1 };
  }

  fresh.config = mergeConfig(raw.config);
  if (isRecord(raw.pages)) {
    for (const [pageId, page] of Object.entries(raw.pages)) {
      fresh.pages[pageId] = normalisePage(page);
    }
  }
  if (isRecord(raw.pendingLocations)) {
    for (const [tokenId, pageId] of Object.entries(raw.pendingLocations)) {
      if (toText(pageId)) {
        fresh.pendingLocations[tokenId] = toText(pageId);
      }
    }
  }
  if (isRecord(raw.lastFill)) {
    fresh.lastFill = raw.lastFill;
  }
  if (isRecord(raw.coveredTokens)) {
    for (const [tokenId, entry] of Object.entries(raw.coveredTokens)) {
      if (isRecord(entry) && toText(entry.pageId) && isRecord(entry.saved)) {
        fresh.coveredTokens[tokenId] = { pageId: toText(entry.pageId), saved: { ...entry.saved } };
      }
    }
  }
  if (isRecord(raw.notices)) {
    fresh.notices = { ...raw.notices };
  }
  return { state: fresh, migratedFrom: null };
}

// ---------------------------------------------------------------------------
// Persistent state access (Roll20)
// ---------------------------------------------------------------------------

let pathIndex = null;
let lastMigration = null;

/**
 * Loads, migrates and validates the persistent state. Call once on ready.
 *
 * @returns {number|null} The schema migrated from, or null.
 */
export function initialiseState() {
  const { state: clean, migratedFrom } = migrateState(state[STATE_KEY]);
  clean.version = SCRIPT_VERSION;
  state[STATE_KEY] = clean;
  pathIndex = null;
  lastMigration = migratedFrom;
  return migratedFrom;
}

/**
 * Returns the schema version the state was migrated from on startup.
 *
 * @returns {number|null} Schema version, or null when no migration ran.
 */
export function getLastMigration() {
  return lastMigration;
}

/**
 * Returns the persistent state, creating it when missing.
 *
 * @returns {object} State branch.
 */
export function getState() {
  if (!isRecord(state[STATE_KEY]) || state[STATE_KEY].schemaVersion !== SCHEMA_VERSION) {
    initialiseState();
  }
  return state[STATE_KEY];
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
 * Sets one global configuration value.
 *
 * @param {string} key Config key.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Validation result.
 */
export function setConfigValue(key, raw) {
  if (!(key in DEFAULT_CONFIG)) {
    return { valid: false };
  }
  const result = validateConfigValue(key, raw);
  if (result.valid) {
    getState().config[key] = result.value;
  }
  return result;
}

/**
 * Imports Roll20 One-Click useroptions into the persisted config.
 *
 * @returns {void}
 */
export function applyGlobalConfig() {
  if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
    return;
  }
  const branch = globalconfig[STATE_KEY.toLowerCase()] || globalconfig[STATE_KEY];
  if (!isRecord(branch)) {
    return;
  }
  const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
  const s = getState();
  // useroptions only change when the GM edits them, so remember what was last
  // applied and only re-apply on change; otherwise chat changes would be
  // overwritten on every restart.
  const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
  for (const key of ['hexLayer', 'revealBy', 'language']) {
    if (key in options && options[key] !== applied[key]) {
      setConfigValue(key, options[key]);
      applied[key] = options[key];
    }
  }
  s.notices.useroptions = applied;
}

/**
 * Returns a page's stored data.
 *
 * @param {string} pageId Page ID.
 * @param {boolean} [create=false] Create the record when missing.
 * @returns {object|null} Page data.
 */
export function getPageData(pageId, create = false) {
  const s = getState();
  if (!s.pages[pageId] && create) {
    s.pages[pageId] = { hexes: {}, settings: {}, calibration: null };
  }
  return s.pages[pageId] || null;
}

/**
 * Returns the IDs of every page with stored data.
 *
 * @returns {string[]} Page IDs.
 */
export function getPageIds() {
  return Object.keys(getState().pages);
}

/**
 * Removes a page's stored data entirely.
 *
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function deletePageData(pageId) {
  const s = getState();
  const page = s.pages[pageId];
  if (page && pathIndex) {
    for (const hex of Object.values(page.hexes)) {
      pathIndex.delete(hex.id);
    }
  }
  delete s.pages[pageId];
}

/**
 * Returns the settings in force on a page: global config plus page overrides.
 *
 * @param {string} pageId Page ID.
 * @returns {object} Effective settings.
 */
export function getPageSettings(pageId) {
  const page = getPageData(pageId);
  return { ...getConfig(), ...(page ? page.settings : {}) };
}

/**
 * Sets a per-page override.
 *
 * @param {string} pageId Page ID.
 * @param {string} key Setting key (must be in PAGE_SETTING_KEYS).
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Validation result.
 */
export function setPageSetting(pageId, key, raw) {
  if (!PAGE_SETTING_KEYS.includes(key)) {
    return { valid: false };
  }
  const result = validateConfigValue(key, raw);
  if (result.valid) {
    getPageData(pageId, true).settings[key] = result.value;
  }
  return result;
}

/**
 * Clears all per-page overrides.
 *
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function clearPageSettings(pageId) {
  const page = getPageData(pageId);
  if (page) {
    page.settings = {};
  }
}

/**
 * Stores or clears a page's grid calibration.
 *
 * @param {string} pageId Page ID.
 * @param {object|null} calibration Calibration, or null to clear.
 * @returns {void}
 */
export function setCalibration(pageId, calibration) {
  getPageData(pageId, true).calibration = calibration ? { ...calibration } : null;
}

// ---------------------------------------------------------------------------
// Hex records
// ---------------------------------------------------------------------------

/**
 * Builds the in-memory path ID index on first use.
 *
 * @returns {Map<string, string[]>} Map of path ID to [pageId, key].
 */
function getIndex() {
  if (!pathIndex) {
    pathIndex = new Map();
    for (const [pageId, page] of Object.entries(getState().pages)) {
      for (const [key, hex] of Object.entries(page.hexes)) {
        pathIndex.set(hex.id, [pageId, key]);
      }
    }
  }
  return pathIndex;
}

/**
 * Returns a hex record.
 *
 * @param {string} pageId Page ID.
 * @param {string} key "row,col" key.
 * @returns {object|null} Hex record.
 */
export function getHex(pageId, key) {
  return getPageData(pageId)?.hexes[key] || null;
}

/**
 * Returns every hex record on a page.
 *
 * @param {string} pageId Page ID.
 * @returns {object[]} Hex records.
 */
export function getPageHexes(pageId) {
  const page = getPageData(pageId);
  return page ? Object.values(page.hexes) : [];
}

/**
 * Returns the hex record drawn by a path, with its page.
 *
 * @param {string} pathId Path object ID.
 * @returns {{pageId: string, key: string, hex: object}|null} Lookup result.
 */
export function getHexByPathId(pathId) {
  const entry = getIndex().get(pathId);
  if (!entry) {
    return null;
  }
  const [pageId, key] = entry;
  const hex = getHex(pageId, key);
  return hex ? { pageId, key, hex } : null;
}

/**
 * Stores a hex record, replacing any record at the same cell.
 *
 * @param {string} pageId Page ID.
 * @param {object} hex Hex record with row and col.
 * @returns {object} The stored record.
 */
export function putHex(pageId, hex) {
  const key = `${hex.row},${hex.col}`;
  const page = getPageData(pageId, true);
  const old = page.hexes[key];
  if (old && old.id !== hex.id) {
    getIndex().delete(old.id);
  }
  page.hexes[key] = hex;
  getIndex().set(hex.id, [pageId, key]);
  return hex;
}

/**
 * Removes a hex record (not its Roll20 objects).
 *
 * @param {string} pageId Page ID.
 * @param {string} key "row,col" key.
 * @returns {object|null} The removed record.
 */
export function deleteHexRecord(pageId, key) {
  const page = getPageData(pageId);
  const hex = page?.hexes[key];
  if (!hex) {
    return null;
  }
  delete page.hexes[key];
  getIndex().delete(hex.id);
  return hex;
}

// ---------------------------------------------------------------------------
// Pending locations and undo
// ---------------------------------------------------------------------------

/**
 * Returns pending location token IDs on a page (tokens marked as locations
 * before the area under them was filled).
 *
 * @param {string} pageId Page ID.
 * @returns {string[]} Token IDs.
 */
export function getPendingLocations(pageId) {
  return Object.entries(getState().pendingLocations)
    .filter(([, page]) => page === pageId)
    .map(([tokenId]) => tokenId);
}

/**
 * Adds or removes a pending location.
 *
 * @param {string} tokenId Token ID.
 * @param {string|null} pageId Page ID, or null to remove.
 * @returns {void}
 */
export function setPendingLocation(tokenId, pageId) {
  const pending = getState().pendingLocations;
  if (pageId) {
    pending[tokenId] = pageId;
  } else {
    delete pending[tokenId];
  }
}

/**
 * Returns the record of the last fill, used by undo.
 *
 * @returns {object|null} Last fill record.
 */
export function getLastFill() {
  return getState().lastFill;
}

/**
 * Stores or clears the record of the last fill.
 *
 * @param {object|null} record Fill record.
 * @returns {void}
 */
export function setLastFill(record) {
  getState().lastFill = record;
}

/**
 * Returns the saved player-visible properties of tokens hidden under hexes.
 *
 * @returns {object} Map of token ID to { pageId, saved }.
 */
export function getCoveredTokens() {
  return getState().coveredTokens;
}

/**
 * Returns whether a one-time notice has been shown, and marks it shown.
 *
 * @param {string} key Notice key.
 * @returns {boolean} True the first time it is called for a key.
 */
export function takeNotice(key) {
  const notices = getState().notices;
  if (notices[key]) {
    return false;
  }
  notices[key] = true;
  return true;
}
