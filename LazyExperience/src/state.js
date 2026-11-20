// Persistent state: defaults, migration from 0.1.x and One-Click options.

import {
  DEFAULT_CONFIG,
  LEGACY_STATE_KEY,
  MAX_EXTRA_SHARES,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
} from './constants.js';
import { isRecord, parseBoolean, parseStrictInt, toText } from './utils.js';

/**
 * Makes an empty session.
 *
 * @param {number} number Session number.
 * @returns {object} Session record.
 */
export function newSession(number) {
  return {
    number,
    started: Date.now(),
    pool: 0,
    carried: 0,
    bonuses: {},
    kills: {},
    awards: [],
    paid: {},
    levelUps: [],
  };
}

/**
 * Returns the mod's state, creating it when missing.
 *
 * @returns {object} State.
 */
export function getState() {
  if (!isRecord(state[STATE_KEY])) {
    state[STATE_KEY] = freshState();
  }
  return state[STATE_KEY];
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
 * Returns the current session.
 *
 * @returns {object} Session.
 */
export function getSession() {
  return getState().session;
}

/**
 * Returns the stored record for a character, creating it when missing.
 *
 * @param {string} characterId Character ID.
 * @returns {{member: boolean, excluded: boolean, absent: boolean, share: number, level: number|null, notified: number|null}} Record.
 */
export function getCharacterRecord(characterId) {
  const chars = getState().characters;
  if (!isRecord(chars[characterId])) {
    chars[characterId] = {
      member: false,
      excluded: false,
      absent: false,
      share: 1,
      level: null,
      notified: null,
    };
  }
  return chars[characterId];
}

/**
 * Builds a brand-new state.
 *
 * @returns {object} State.
 */
function freshState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    config: { ...DEFAULT_CONFIG },
    characters: {},
    session: newSession(1),
    aliases: [],
    history: [],
    globalconfigCache: { lastsaved: 0 },
    warned: {},
  };
}

/**
 * Converts 0.1.x state into the 1.0 shape. 0.1.x is left in place so a rollback works.
 *
 * @param {object} old The 0.1.x state.
 * @returns {object} New state.
 */
export function migrateLegacy(old) {
  const next = freshState();
  const cfg = isRecord(old.config) ? old.config : {};
  const command = toText(cfg.command).replace(/^!/, '');
  if (command && !['xp', 'lazyxp', 'lazyexperience'].includes(command.toLowerCase())) {
    next.aliases.push(`!${command}`);
  }
  if (toText(cfg.marker) && toText(cfg.marker) !== '-') {
    next.config.marker = toText(cfg.marker);
  }
  const xpName = toText(cfg.experience_attribute_name);
  const npcName = toText(cfg.npc_experience_attribute_name);
  if ((xpName && xpName !== 'experience') || (npcName && npcName !== 'npc_xp')) {
    next.config.system = 'custom';
    next.config.customXp = xpName || DEFAULT_CONFIG.customXp;
    next.config.customNpcXp = npcName || DEFAULT_CONFIG.customNpcXp;
  }
  next.config.payout = cfg.directxp === true ? 'instant' : 'end';
  // 0.1.x only wrote sheets when asked to.
  next.config.updateSheets = cfg.updatesheet === true;
  next.config.extraShares = clampShares(parseStrictInt(old.extra_players) ?? 0);
  next.session.pool = Math.max(0, Math.floor(Number(old.session_experience) || 0));

  const players = isRecord(old.players) ? old.players : {};
  for (const player of Object.values(players)) {
    if (!isRecord(player) || !Array.isArray(player.characters)) {
      continue;
    }
    for (const character of player.characters) {
      if (!isRecord(character) || !toText(character.id)) {
        continue;
      }
      const rec = next.characters[character.id] || {
        member: false,
        excluded: false,
        absent: false,
        share: 1,
        level: null,
        notified: null,
      };
      // 0.1.x "not active" left the player or character out of every share.
      if (player.active === false || character.active === false) {
        rec.excluded = true;
      }
      next.characters[character.id] = rec;
      const extra = Math.floor(Number(character.experience) || 0);
      if (extra > 0) {
        next.session.bonuses[character.id] = (next.session.bonuses[character.id] || 0) + extra;
      }
    }
  }
  next.migratedFrom = '0.1';
  return next;
}

/**
 * Keeps extra shares within limits.
 *
 * @param {number} value Raw value.
 * @returns {number} Clamped value.
 */
function clampShares(value) {
  return Math.min(MAX_EXTRA_SHARES, Math.max(0, Math.floor(Number(value) || 0)));
}

/**
 * Creates or upgrades the state. Returns '0.1' when 0.1.x state was migrated.
 *
 * @returns {string|null} The version migrated from, or null.
 */
export function initialiseState() {
  let migrated = null;
  if (!isRecord(state[STATE_KEY])) {
    if (isRecord(state[LEGACY_STATE_KEY])) {
      state[STATE_KEY] = migrateLegacy(state[LEGACY_STATE_KEY]);
      migrated = '0.1';
    } else {
      state[STATE_KEY] = freshState();
    }
  }
  const s = state[STATE_KEY];
  s.config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
  for (const key of Object.keys(s.config)) {
    if (!(key in DEFAULT_CONFIG)) {
      delete s.config[key];
    }
  }
  if (!isRecord(s.characters)) s.characters = {};
  if (!isRecord(s.session)) s.session = newSession(1);
  const fresh = newSession(s.session.number || 1);
  for (const key of Object.keys(fresh)) {
    if (s.session[key] === undefined) s.session[key] = fresh[key];
  }
  if (!Array.isArray(s.aliases)) s.aliases = [];
  if (!Array.isArray(s.history)) s.history = [];
  if (!isRecord(s.globalconfigCache)) s.globalconfigCache = { lastsaved: 0 };
  if (!isRecord(s.warned)) s.warned = {};
  s.schemaVersion = SCHEMA_VERSION;
  s.version = SCRIPT_VERSION;
  return migrated;
}

/**
 * Coerces a raw setting value to the type of its default. Returns undefined when the
 * value cannot be used.
 *
 * @param {string} key Setting name.
 * @param {*} raw Raw value.
 * @returns {*} Value, or undefined.
 */
export function coerceSetting(key, raw) {
  const fallback = DEFAULT_CONFIG[key];
  if (typeof fallback === 'boolean') {
    return parseBoolean(raw) ?? undefined;
  }
  if (typeof fallback === 'number') {
    const text = toText(raw).replace('%', '');
    const value = Number(text);
    if (!Number.isFinite(value)) {
      return undefined;
    }
    return toText(raw).endsWith('%') ? value / 100 : value;
  }
  return toText(raw);
}

/**
 * Applies One-Click install options when they are newer than the last ones applied,
 * so changes made in game survive restarts (the TokenMod pattern).
 *
 * @param {object} [validate] Function (key, value) => value|undefined that checks a value.
 * @returns {string[]} Keys that changed.
 */
export function applyGlobalConfig(validate = (k, v) => v) {
  const gc = typeof globalconfig === 'object' && globalconfig ? globalconfig : {};
  const branchKey = Object.keys(gc).find(
    (k) => k.toLowerCase().replace(/[^a-z]/g, '') === 'lazyexperience'
  );
  const branch = branchKey ? gc[branchKey] : null;
  const s = getState();
  if (!isRecord(branch) || !(Number(branch.lastsaved) > Number(s.globalconfigCache.lastsaved))) {
    return [];
  }
  const changed = [];
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    if (!(key in branch)) {
      continue;
    }
    // Unticked checkboxes arrive as false; ticked ones as their value text.
    const raw = typeof DEFAULT_CONFIG[key] === 'boolean' ? branch[key] !== false : branch[key];
    const value = validate(key, coerceSetting(key, raw));
    if (value !== undefined && value !== s.config[key]) {
      s.config[key] = value;
      changed.push(key);
    }
  }
  s.globalconfigCache = { lastsaved: Number(branch.lastsaved) };
  return changed;
}
