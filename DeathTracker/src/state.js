// Persistent state: state.DeathTracker. Settings, one small record per token
// DeathTracker has judged, PC/NPC choices per character and one-time notices.

import {
  BOOLEAN_SETTINGS,
  DEFAULT_SETTINGS,
  FX_COLOURS,
  FX_TYPES,
  LEGACY_STATE_KEY,
  MARKER_SETTINGS,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  SETTING_CHOICES,
  STATE_KEY,
  STATUS_LIST,
} from './constants.js';
import { getLocale } from './i18n.js';
import { resolveMarker } from './markers.js';
import { clamp, isRecord, parseBoolean, splitList, toNumber, toText } from './utils.js';

/**
 * @typedef {object} TokenRecord
 * @property {string|null} status Last status DeathTracker gave the token.
 * @property {number|null} hp Hit points when last judged.
 * @property {{s: number, f: number}|null} base Sheet death-save counts when the token dropped to 0.
 * @property {{s: number, f: number}|null} saves Death saves counted since then.
 * @property {string[]} markers Marker tags DeathTracker added (only these are ever removed).
 * @property {string|null} tint The token's own tint, kept while DeathTracker tints it.
 * @property {object|null} actions What was done when it died, so `restore` can undo it.
 */

/**
 * Returns a fresh, empty state.
 *
 * @returns {object} State.
 */
export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    tokens: {},
    // GM choices of PC or NPC, by character ID (or token ID for tokens with no character).
    roles: {},
    notices: { useroptions: {}, healthColors: false, migrated: false },
  };
}

/**
 * Cleans one stored token record.
 *
 * @param {*} raw Stored record.
 * @returns {TokenRecord} Clean record.
 */
export function cleanRecord(raw) {
  const r = isRecord(raw) ? raw : {};
  const counts = (c) =>
    isRecord(c)
      ? {
          s: clamp(Math.round(toNumber(c.s) ?? 0), 0, 99),
          f: clamp(Math.round(toNumber(c.f) ?? 0), 0, 99),
        }
      : null;
  return {
    status: STATUS_LIST.includes(r.status) ? r.status : null,
    hp: toNumber(r.hp),
    base: counts(r.base),
    saves: counts(r.saves),
    markers: Array.isArray(r.markers) ? r.markers.map(toText).filter(Boolean) : [],
    tint: typeof r.tint === 'string' ? r.tint : null,
    actions: isRecord(r.actions) ? r.actions : null,
  };
}

/**
 * Carries 0.1.x settings (state.DEATHTRACKER.config) over to 1.0 names.
 *
 * @param {*} legacy The old state branch.
 * @returns {object} Settings found, by 1.0 name.
 */
export function readLegacySettings(legacy) {
  const c = isRecord(legacy) && isRecord(legacy.config) ? legacy.config : null;
  if (!c) {
    return {};
  }
  const out = {};
  const marker = (v) => {
    const s = toText(v);
    return s === '' ? null : s;
  };
  if (marker(c.death_statusmarker)) {
    out.deadMarker = marker(c.death_statusmarker);
  }
  if (marker(c.half_statusmarker)) {
    out.bloodiedMarker = marker(c.half_statusmarker);
  }
  if (marker(c.pc_unconscious_statusmarker)) {
    out.dyingMarker = marker(c.pc_unconscious_statusmarker);
  }
  const bar = toNumber(c.bar);
  if (SETTING_CHOICES.hpBar.includes(bar)) {
    out.hpBar = bar;
  }
  for (const [from, to] of [
    ['change_player_tint', 'tintPlayers'],
    ['change_npc_tint', 'tintNpcs'],
    ['fx', 'hurtFx'],
    ['heal_fx', 'healFx'],
  ]) {
    const b = parseBoolean(c[from]);
    if (b !== null) {
      out[to] = b;
    }
  }
  if (isFxName(c.fx_type)) {
    out.hurtFxType = toText(c.fx_type).toLowerCase();
  }
  if (isFxName(c.heal_fx_type)) {
    out.healFxType = toText(c.heal_fx_type).toLowerCase();
  }
  const command = toText(c.command).replace(/^!/, '').toLowerCase();
  if (command && !/\s/.test(command)) {
    out.legacyCommand = command;
  }
  return out;
}

/**
 * Returns true for a built-in effect name such as "splatter-blood".
 *
 * @param {*} raw Effect name.
 * @returns {boolean} True when Roll20 knows the effect.
 */
export function isFxName(raw) {
  const [type, colour, extra] = toText(raw).toLowerCase().split('-');
  return FX_TYPES.includes(type) && FX_COLOURS.includes(colour) && extra === undefined;
}

/**
 * Cleans a stored state, filling in anything missing.
 *
 * @param {*} raw Stored state.
 * @param {*} [legacy] The 0.1.x state branch, read when there is no 1.0 state yet.
 * @returns {{state: object, fresh: boolean, migrated: boolean}} Clean state, whether it is new, and whether 0.1.x settings were carried over.
 */
export function migrateState(raw, legacy) {
  const base = createDefaultState();
  if (!isRecord(raw)) {
    const old = readLegacySettings(legacy);
    const migrated = Object.keys(old).length > 0;
    const { legacyCommand, ...settings } = old;
    base.settings = { ...base.settings, ...settings };
    if (legacyCommand) {
      base.legacyCommand = legacyCommand;
    }
    base.notices.migrated = migrated;
    return { state: base, fresh: !migrated, migrated };
  }
  const clean = {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) },
    tokens: {},
    roles: {},
    notices: { ...base.notices, ...(isRecord(raw.notices) ? raw.notices : {}) },
  };
  for (const [id, rec] of Object.entries(isRecord(raw.tokens) ? raw.tokens : {})) {
    clean.tokens[id] = cleanRecord(rec);
  }
  for (const [id, role] of Object.entries(isRecord(raw.roles) ? raw.roles : {})) {
    if (role === 'pc' || role === 'npc') {
      clean.roles[id] = role;
    }
  }
  // Anything a hand edit broke goes back to its default.
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!checkSetting(key, clean.settings[key]).ok) {
      clean.settings[key] = DEFAULT_SETTINGS[key];
    }
  }
  for (const key of Object.keys(clean.settings)) {
    if (!(key in DEFAULT_SETTINGS)) {
      delete clean.settings[key];
    }
  }
  return { state: clean, fresh: false, migrated: false };
}

/**
 * Loads and cleans state.DeathTracker.
 *
 * @returns {{fresh: boolean, migrated: boolean}} Whether this is a new install, and whether 0.1.x settings were carried over.
 */
export function initialiseState() {
  const { state: clean, fresh, migrated } = migrateState(state[STATE_KEY], state[LEGACY_STATE_KEY]);
  clean.version = SCRIPT_VERSION;
  state[STATE_KEY] = clean;
  return { fresh, migrated };
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
 * Returns the settings.
 *
 * @returns {object} Settings.
 */
export function getSettings() {
  return getState().settings;
}

/**
 * Returns the GM's language.
 *
 * @returns {string} Locale code.
 */
export function getLang() {
  return getLocale(getSettings().language);
}

/**
 * Checks and cleans a setting value.
 *
 * @param {string} key Setting name.
 * @param {*} value Proposed value.
 * @returns {{ok: boolean, value?: *}} The clean value when accepted.
 */
export function checkSetting(key, value) {
  if (!(key in DEFAULT_SETTINGS)) {
    return { ok: false };
  }
  if (key === 'language') {
    return { ok: true, value: getLocale(value) };
  }
  if (BOOLEAN_SETTINGS.includes(key)) {
    const b = parseBoolean(value);
    return b === null ? { ok: false } : { ok: true, value: b };
  }
  if (key === 'hpBar') {
    const n = toNumber(toText(value).replace(/^bar/i, ''));
    return SETTING_CHOICES.hpBar.includes(n) ? { ok: true, value: n } : { ok: false };
  }
  if (key === 'bloodiedPercent') {
    const n = toNumber(toText(value).replace(/%$/, ''));
    return n === null || n < 0 || n >= 100 ? { ok: false } : { ok: true, value: Math.round(n) };
  }
  if (key in SETTING_CHOICES) {
    const v = toText(value).toLowerCase();
    return SETTING_CHOICES[key].includes(v) ? { ok: true, value: v } : { ok: false };
  }
  if (MARKER_SETTINGS.includes(key)) {
    // Markers are checked against the game's list by the caller; here only
    // the shape is checked. An empty value means "no marker".
    const v = toText(value);
    return /[,\s]/.test(v) ? { ok: false } : { ok: true, value: v };
  }
  if (key === 'hurtFxType' || key === 'healFxType') {
    return isFxName(value) ? { ok: true, value: toText(value).toLowerCase() } : { ok: false };
  }
  if (key === 'successFields' || key === 'failureFields') {
    const list = splitList(value);
    return list.length && list.every((f) => /^[\w-]+$/.test(f))
      ? { ok: true, value: list.join(',') }
      : { ok: false };
  }
  return { ok: false };
}

/**
 * Changes a setting after checking its value.
 *
 * @param {string} key Setting name.
 * @param {*} value New value.
 * @returns {boolean} True when the value was accepted.
 */
export function setSetting(key, value) {
  const checked = checkSetting(key, value);
  if (!checked.ok) {
    return false;
  }
  getSettings()[key] = checked.value;
  return true;
}

/**
 * Finds the One-Click useroptions branch for this Mod. Roll20 keys it by the
 * lower-cased script name.
 *
 * @returns {object|null} The options, or null when there are none.
 */
function oneClickOptions() {
  if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
    return null;
  }
  const key = Object.keys(globalconfig).find(
    (k) => k.toLowerCase().replaceAll(/[^a-z]/g, '') === 'deathtracker'
  );
  const branch = key ? globalconfig[key] : null;
  if (!isRecord(branch)) {
    return null;
  }
  return isRecord(branch.useroptions) ? branch.useroptions : branch;
}

/**
 * Applies the One-Click useroptions the GM has changed since they were last
 * applied, so settings changed in chat survive a restart.
 *
 * @returns {string[]} Settings changed.
 */
export function applyGlobalConfig() {
  const options = oneClickOptions();
  if (!options) {
    return [];
  }
  const s = getState();
  const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
  const changed = [];
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!(key in options)) {
      continue;
    }
    // An unticked checkbox arrives as false; a ticked one as its value string.
    const raw = options[key] === false && BOOLEAN_SETTINGS.includes(key) ? 'off' : options[key];
    if (raw === applied[key]) {
      continue;
    }
    applied[key] = raw;
    const value = MARKER_SETTINGS.includes(key) ? (resolveMarker(raw)?.tag ?? raw) : raw;
    if (setSetting(key, value)) {
      changed.push(key);
    }
  }
  s.notices.useroptions = applied;
  return changed;
}

/**
 * Returns a token's record, creating it when asked.
 *
 * @param {string} id Token ID.
 * @param {boolean} [create=false] Make an empty record when there is none.
 * @returns {TokenRecord|null} Record.
 */
export function getRecord(id, create = false) {
  const tokens = getState().tokens;
  if (!tokens[id] && create) {
    tokens[id] = cleanRecord({});
  }
  return tokens[id] || null;
}

/**
 * Forgets a token.
 *
 * @param {string} id Token ID.
 * @returns {void}
 */
export function dropRecord(id) {
  delete getState().tokens[id];
}

/**
 * Returns the GM's PC/NPC choice for a character or token.
 *
 * @param {string} id Character ID, or token ID for a token with no character.
 * @returns {'pc'|'npc'|null} The choice, or null for "decide automatically".
 */
export function getRole(id) {
  return getState().roles[id] || null;
}

/**
 * Sets or clears the GM's PC/NPC choice.
 *
 * @param {string} id Character or token ID.
 * @param {'pc'|'npc'|null} role Choice, or null to decide automatically.
 * @returns {void}
 */
export function setRole(id, role) {
  if (role === 'pc' || role === 'npc') {
    getState().roles[id] = role;
  } else {
    delete getState().roles[id];
  }
}
