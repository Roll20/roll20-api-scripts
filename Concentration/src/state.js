// Persistent state: settings, who is concentrating on what, advantage and
// pending save buttons.

import {
  BAR_OPTIONS,
  DEFAULT_CONFIG,
  MAX_ATTRIBUTE_LENGTH,
  MAX_PENDING_ROLLS,
  MAX_SPELL_LENGTH,
  PENDING_ROLL_TTL_MS,
  SCHEMA_VERSION,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  SEND_TO_OPTIONS,
  STATE_KEY,
  SUPPORT_MODE_OPTIONS,
  TOGGLE_KEYS,
  USEROPTION_KEYS,
} from './constants.js';
import { normalizeLocale } from './i18n.js';
import { cleanSpellName, isRecord, parseBoolean, toText, truncate } from './utils.js';

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
  const option = (list) => {
    const text = toText(raw).toLowerCase();
    const found = list.find((o) => String(o).toLowerCase() === text);
    return found === undefined ? bad : ok(found);
  };

  if (TOGGLE_KEYS.includes(key)) {
    const value = parseBoolean(raw);
    return value === null ? bad : ok(value);
  }

  switch (key) {
    case 'language': {
      const lang = normalizeLocale(raw);
      return lang ? ok(lang) : bad;
    }
    case 'command': {
      const text = toText(raw).replace(/^!/, '');
      return /^[A-Za-z0-9_-]{1,32}$/.test(text) ? ok(text) : bad;
    }
    case 'statusmarker': {
      const text = toText(raw);
      return /^[\w:-]{1,80}$/.test(text) ? ok(text) : bad;
    }
    case 'bar': {
      const text = toText(raw).replace(/^bar\s*/i, '');
      return BAR_OPTIONS.map(String).includes(text) ? ok(Number(text)) : bad;
    }
    case 'send_reminder_to':
      return option(SEND_TO_OPTIONS);
    case 'support_mode':
      return option(SUPPORT_MODE_OPTIONS);
    case 'bonus_attribute': {
      const text = toText(raw);
      return /^[\w.-]{1,80}$/.test(text) ? ok(truncate(text, MAX_ATTRIBUTE_LENGTH)) : bad;
    }
    default:
      return bad;
  }
}

/**
 * Merges a possibly incomplete or invalid config with defaults.
 *
 * @param {object} config Config to merge.
 * @returns {object} Complete config.
 */
export function mergeConfig(config) {
  const c = isRecord(config) ? config : {};
  const merged = {};
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    const result = key in c ? validateConfigValue(key, c[key]) : { valid: false };
    merged[key] = result.valid ? result.value : DEFAULT_CONFIG[key];
  }
  return merged;
}

/**
 * Creates a fresh state branch.
 *
 * @returns {object} State.
 */
export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    config: { ...DEFAULT_CONFIG },
    concentrating: {},
    advantages: {},
    pendingRolls: {},
    notices: {},
  };
}

/**
 * Cleans one concentration record.
 *
 * @param {*} raw Stored record.
 * @returns {object|null} Record, or null when it is not valid.
 */
function normaliseRecord(raw) {
  if (!isRecord(raw)) {
    return null;
  }
  return {
    spell: cleanSpellName(raw.spell, MAX_SPELL_LENGTH),
    name: truncate(raw.name, 100),
    since: Number.isFinite(raw.since) ? raw.since : 0,
  };
}

/**
 * Brings stored state up to the current schema. Version 1.0 had no schema
 * number; its settings and advantage list are kept.
 *
 * @param {*} raw Stored state.
 * @returns {{state: object, migratedFrom: number|null}} Clean state and the old schema, if any.
 */
export function migrateState(raw) {
  const clean = createDefaultState();
  if (!isRecord(raw) || Object.keys(raw).length === 0) {
    return { state: clean, migratedFrom: null };
  }
  const migratedFrom = raw.schemaVersion === SCHEMA_VERSION ? null : raw.schemaVersion || 1;

  clean.config = mergeConfig(raw.config);
  if (isRecord(raw.advantages)) {
    for (const [id, on] of Object.entries(raw.advantages)) {
      if (on === true) {
        clean.advantages[id] = true;
      }
    }
  }
  if (isRecord(raw.concentrating)) {
    for (const [key, record] of Object.entries(raw.concentrating)) {
      const value = normaliseRecord(record);
      if (value) {
        clean.concentrating[key] = value;
      }
    }
  }
  if (isRecord(raw.pendingRolls)) {
    clean.pendingRolls = raw.pendingRolls;
  }
  if (isRecord(raw.notices)) {
    clean.notices = raw.notices;
  }
  // Version 1.0 showed its menu on the first start and remembered it here.
  if (migratedFrom === 1 && isRecord(raw.config) && 'firsttime' in raw.config) {
    clean.notices.welcomed = true;
  }
  return { state: clean, migratedFrom };
}

/**
 * Loads, migrates and validates the persistent state. Call once on ready.
 *
 * @returns {number|null} The schema migrated from, or null.
 */
export function initialiseState() {
  const { state: clean, migratedFrom } = migrateState(state[STATE_KEY]);
  clean.version = SCRIPT_VERSION;
  state[STATE_KEY] = clean;
  return migratedFrom;
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
 * Puts every setting back to its default and forgets advantage and pending
 * saves. Who is concentrating is kept, since their markers stay on the map.
 *
 * @returns {void}
 */
export function resetState() {
  const s = getState();
  const concentrating = s.concentrating;
  const fresh = createDefaultState();
  fresh.concentrating = concentrating;
  fresh.notices.welcomed = true;
  state[STATE_KEY] = fresh;
}

/**
 * Returns the configuration.
 *
 * @returns {object} Config.
 */
export function getConfig() {
  return getState().config;
}

/**
 * Sets one configuration value.
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
 * Imports Roll20 One-Click useroptions into the stored config. Options are
 * only applied again when the GM changes them, so chat changes survive restarts.
 *
 * @returns {void}
 */
export function applyGlobalConfig() {
  if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
    return;
  }
  const branch = globalconfig[SCRIPT_NAME.toLowerCase()] || globalconfig[SCRIPT_NAME];
  if (!isRecord(branch)) {
    return;
  }
  const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
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

// ---------------------------------------------------------------------------
// Concentration records, keyed by character ID (or token ID for tokens that
// represent no character)
// ---------------------------------------------------------------------------

/**
 * Returns every concentration record.
 *
 * @returns {Object<string, {spell: string, name: string, since: number}>} Records by key.
 */
export function getRecords() {
  return getState().concentrating;
}

/**
 * Returns the record for a key.
 *
 * @param {string} key Character or token ID.
 * @returns {{spell: string, name: string, since: number}|null} Record, or null.
 */
export function getRecord(key) {
  return getRecords()[key] || null;
}

/**
 * Stores who is concentrating on what.
 *
 * @param {string} key Character or token ID.
 * @param {string} spell Spell name (may be empty).
 * @param {string} name Name shown in chat.
 * @returns {void}
 */
export function setRecord(key, spell, name) {
  getRecords()[key] = {
    spell: cleanSpellName(spell, MAX_SPELL_LENGTH),
    name: truncate(name, 100),
    since: Date.now(),
  };
}

/**
 * Forgets a record.
 *
 * @param {string} key Character or token ID.
 * @returns {object|null} The record that was removed, or null.
 */
export function clearRecord(key) {
  const records = getRecords();
  const record = records[key] || null;
  delete records[key];
  return record;
}

// ---------------------------------------------------------------------------
// Advantage
// ---------------------------------------------------------------------------

/**
 * Returns true when a character rolls concentration saves with advantage.
 *
 * @param {string} characterId Character ID.
 * @returns {boolean} True with advantage.
 */
export function hasAdvantage(characterId) {
  return Boolean(characterId) && getState().advantages[characterId] === true;
}

/**
 * Switches advantage for a character.
 *
 * @param {string} characterId Character ID.
 * @returns {boolean} The new setting.
 */
export function toggleAdvantage(characterId) {
  const advantages = getState().advantages;
  if (advantages[characterId]) {
    delete advantages[characterId];
    return false;
  }
  advantages[characterId] = true;
  return true;
}

// ---------------------------------------------------------------------------
// Pending saves (Roll and Advantage buttons)
// ---------------------------------------------------------------------------

/**
 * Forgets pending saves that have expired, and the oldest when there are too many.
 *
 * @returns {void}
 */
export function prunePendingRolls() {
  const pending = getState().pendingRolls;
  const now = Date.now();
  for (const [id, roll] of Object.entries(pending)) {
    if (
      !isRecord(roll) ||
      !Number.isFinite(roll.createdAt) ||
      now - roll.createdAt > PENDING_ROLL_TTL_MS
    ) {
      delete pending[id];
    }
  }
  const ids = Object.keys(pending).sort((a, b) => pending[a].createdAt - pending[b].createdAt);
  for (const id of ids.slice(0, Math.max(0, ids.length - MAX_PENDING_ROLLS))) {
    delete pending[id];
  }
}

/**
 * Stores a save to be rolled from a button.
 *
 * @param {object} roll Save details.
 * @returns {string} ID for the buttons.
 */
export function addPendingRoll(roll) {
  prunePendingRolls();
  const id = `pr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  getState().pendingRolls[id] = { ...roll, createdAt: Date.now() };
  return id;
}

/**
 * Returns a pending save without using it up.
 *
 * @param {string} id Pending save ID.
 * @returns {object|null} Save details, or null when unknown or expired.
 */
export function getPendingRoll(id) {
  prunePendingRolls();
  const pending = getState().pendingRolls;
  return /^pr_\d+_[a-z0-9]+$/.test(toText(id)) && pending[id] ? pending[id] : null;
}

/**
 * Takes a pending save, so each button works once.
 *
 * @param {string} id Pending save ID.
 * @returns {object|null} Save details, or null when unknown or expired.
 */
export function takePendingRoll(id) {
  prunePendingRolls();
  const pending = getState().pendingRolls;
  if (!/^pr_\d+_[a-z0-9]+$/.test(toText(id)) || !pending[id]) {
    return null;
  }
  const roll = pending[id];
  delete pending[id];
  return roll;
}
