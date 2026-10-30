// Persistent state: global settings and each listener's rules. A listener's
// commands live in an ability on the store character (see store.js), and its
// rules are mirrored into that ability's description so they survive a game
// being copied (Roll20 does not copy the state object).

import {
  DEFAULT_CONFIG,
  DEFAULT_LISTENER,
  LISTENER_SPEAKER_OPTIONS,
  MAX_COOLDOWN_SECONDS,
  MAX_LIST_ITEMS,
  MAX_TEXT_TERMS,
  RESULT_ALIASES,
  RULES_MARKER,
  SCHEMA_VERSION,
  SPEAKER_OPTIONS,
  STATE_KEY,
} from './constants.js';
import { getLocale, normalizeLocale } from './i18n.js';
import { ROLL_PLACEHOLDER } from './match.js';
import { isRecord, parseBoolean, parseStrictInt, toText } from './utils.js';

/**
 * Returns the mod's state branch, creating it when missing.
 *
 * @returns {object} State.
 */
export function getState() {
  if (!isRecord(state[STATE_KEY])) {
    state[STATE_KEY] = {};
  }
  return state[STATE_KEY];
}

/**
 * Brings the state up to the current schema.
 *
 * @returns {number|null} 1 when a version 1 install was upgraded, otherwise null.
 */
export function initialiseState() {
  const s = getState();
  let migratedFrom = null;
  if (s.schemaVersion !== SCHEMA_VERSION) {
    // Version 1 kept {version: 1, help: characterId, listen: 'on'|'off'}.
    if (s.schemaVersion === undefined && ('help' in s || 'listen' in s || 'version' in s)) {
      migratedFrom = 1;
    }
    const config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
    if (migratedFrom === 1) {
      config.enabled = s.listen !== 'off';
    }
    const fresh = {
      schemaVersion: SCHEMA_VERSION,
      config,
      characterId: toText(s.characterId || s.help),
      listeners: isRecord(s.listeners) ? s.listeners : {},
      order: Array.isArray(s.order) ? s.order : [],
      notices: isRecord(s.notices) ? s.notices : {},
    };
    for (const key of Object.keys(s)) {
      delete s[key];
    }
    Object.assign(s, fresh);
  }
  s.config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
  s.config.language = getLocale(s.config.language);
  s.listeners = isRecord(s.listeners) ? s.listeners : {};
  s.order = Array.isArray(s.order) ? s.order.filter((id) => id in s.listeners) : [];
  for (const id of Object.keys(s.listeners)) {
    s.listeners[id] = normaliseListener(s.listeners[id]);
    if (!s.order.includes(id)) {
      s.order.push(id);
    }
  }
  s.notices = isRecord(s.notices) ? s.notices : {};
  return migratedFrom;
}

/**
 * Returns the global settings.
 *
 * @returns {object} Settings.
 */
export function getConfig() {
  return getState().config;
}

/**
 * Validates and stores a global setting.
 *
 * @param {string} key Setting key.
 * @param {*} raw Raw value.
 * @returns {boolean} True when stored, false when the value is invalid.
 */
export function setConfigValue(key, raw) {
  const config = getConfig();
  switch (key) {
    case 'language': {
      const lang = normalizeLocale(raw);
      if (!lang) {
        return false;
      }
      config.language = lang;
      return true;
    }
    case 'enabled':
    case 'listenToMods': {
      const value = parseBoolean(raw);
      if (value === null) {
        return false;
      }
      config[key] = value;
      return true;
    }
    case 'speaker': {
      const value = toText(raw).toLowerCase();
      if (!SPEAKER_OPTIONS.includes(value)) {
        return false;
      }
      config.speaker = value;
      return true;
    }
    default:
      return false;
  }
}

/**
 * Applies the One-Click useroptions when the GM has changed them.
 *
 * @returns {void}
 */
export function applyGlobalConfig() {
  if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
    return;
  }
  const branch =
    globalconfig.crl ||
    globalconfig.CRL ||
    globalconfig['customizable roll listener'] ||
    globalconfig['Customizable Roll Listener'];
  if (!isRecord(branch)) {
    return;
  }
  const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
  const s = getState();
  // useroptions only change when the GM edits them, so remember what was last
  // applied and only re-apply on change; otherwise chat changes would be
  // overwritten on every restart.
  const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
  for (const key of ['speaker', 'listenToMods', 'language']) {
    if (key in options && options[key] !== applied[key]) {
      setConfigValue(key, options[key]);
      applied[key] = options[key];
    }
  }
  s.notices.useroptions = applied;
}

/**
 * Returns a cleaned list of strings.
 *
 * @param {*} value Raw list.
 * @param {number} [limit] Maximum items.
 * @returns {string[]} Items.
 */
function cleanList(value, limit = MAX_LIST_ITEMS) {
  const items = Array.isArray(value) ? value : toText(value) ? [value] : [];
  return [...new Set(items.map(toText).filter(Boolean))].slice(0, limit);
}

/**
 * Returns a listener record with every field present and valid.
 *
 * @param {*} raw Stored or imported rules.
 * @returns {object} Listener rules.
 */
export function normaliseListener(raw) {
  const src = isRecord(raw) ? raw : {};
  const cooldown = Number(src.cooldown);
  const results = cleanList(src.results)
    .map((r) => RESULT_ALIASES[r.toLowerCase()])
    .filter(Boolean);
  return {
    name: toText(src.name),
    enabled: src.enabled !== false,
    templates: cleanList(src.templates),
    types: cleanList(src.types).map((t) => t.toLowerCase()),
    text: cleanList(src.text, MAX_TEXT_TERMS),
    regex: src.regex === true,
    who: cleanList(src.who),
    players: cleanList(src.players),
    results: [...new Set(results)],
    total: toText(src.total),
    natural: toText(src.natural),
    dice: toText(src.dice) || DEFAULT_LISTENER.dice,
    cooldown: Number.isFinite(cooldown) ? Math.min(MAX_COOLDOWN_SECONDS, Math.max(0, cooldown)) : 0,
    stop: src.stop === true,
    speaker: LISTENER_SPEAKER_OPTIONS.includes(src.speaker) ? src.speaker : 'default',
  };
}

/**
 * Converts the rules version 1 kept as JSON in an ability description:
 * {txt, templates, roll}. Version 1 turned the first "##" of each text into
 * the pattern \$\[\[\d\]\] and matched text as a regular expression; text
 * that only holds plain characters becomes plain text, anything else stays
 * a regular expression.
 *
 * @param {object} rules Version 1 rules.
 * @param {string} name Listener name.
 * @returns {object} Listener rules.
 */
export function convertV1Rules(rules, name) {
  const toList = (value) => (Array.isArray(value) ? value : []);
  const text = toList(rules.txt)
    .map((term) => toText(term).replaceAll(String.raw`\$\[\[\d\]\]`, ROLL_PLACEHOLDER))
    .filter(Boolean);
  const regex = text.some((term) =>
    /[\\^$.|?*+()[\]{}]/.test(term.replaceAll(ROLL_PLACEHOLDER, ''))
  );
  return normaliseListener({
    name,
    templates: toList(rules.templates),
    text,
    regex,
    results: toList(rules.roll),
  });
}

/**
 * Reads listener rules from an ability description: version 2 JSON, or the
 * version 1 JSON this mod used to store there.
 *
 * @param {string} description Ability description.
 * @param {string} name Ability name.
 * @returns {{rules: object, version: number}|null} Rules, or null when none are stored.
 */
export function parseStoredRules(description, name) {
  let parsed;
  try {
    parsed = JSON.parse(toText(description));
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  if (parsed[RULES_MARKER] === SCHEMA_VERSION) {
    return { rules: normaliseListener({ ...parsed, name }), version: 2 };
  }
  if ('txt' in parsed || 'templates' in parsed || 'roll' in parsed) {
    return { rules: convertV1Rules(parsed, name), version: 1 };
  }
  return null;
}

/**
 * Serialises listener rules for an ability description.
 *
 * @param {object} listener Listener rules.
 * @returns {string} JSON text.
 */
export function serialiseRules(listener) {
  const { name: _name, ...rules } = listener;
  return JSON.stringify({ [RULES_MARKER]: SCHEMA_VERSION, ...rules });
}

/**
 * Returns every listener in evaluation order.
 *
 * @returns {{id: string, listener: object}[]} Listeners.
 */
export function getListeners() {
  const s = getState();
  return s.order.filter((id) => id in s.listeners).map((id) => ({ id, listener: s.listeners[id] }));
}

/**
 * Returns a listener by ability ID.
 *
 * @param {string} id Ability ID.
 * @returns {object|null} Listener rules.
 */
export function getListener(id) {
  return getState().listeners[id] || null;
}

/**
 * Stores a listener's rules.
 *
 * @param {string} id Ability ID.
 * @param {object} listener Listener rules.
 * @returns {object} Stored rules.
 */
export function putListener(id, listener) {
  const s = getState();
  s.listeners[id] = normaliseListener(listener);
  if (!s.order.includes(id)) {
    s.order.push(id);
  }
  return s.listeners[id];
}

/**
 * Forgets a listener.
 *
 * @param {string} id Ability ID.
 * @returns {void}
 */
export function deleteListener(id) {
  const s = getState();
  delete s.listeners[id];
  s.order = s.order.filter((other) => other !== id);
}

/**
 * Moves a listener one place up or down the evaluation order.
 *
 * @param {string} id Ability ID.
 * @param {number} step -1 to move up, 1 to move down.
 * @returns {boolean} True when it moved.
 */
export function moveListener(id, step) {
  const s = getState();
  const from = s.order.indexOf(id);
  const to = from + step;
  if (from < 0 || to < 0 || to >= s.order.length) {
    return false;
  }
  [s.order[from], s.order[to]] = [s.order[to], s.order[from]];
  return true;
}

/**
 * Parses a cooldown typed by the GM.
 *
 * @param {*} raw Seconds.
 * @returns {number|null} Seconds, or null when invalid.
 */
export function parseCooldown(raw) {
  if (!toText(raw)) {
    return 0;
  }
  const value = parseStrictInt(toText(raw).replace(/s$/i, ''));
  return value === null || value < 0 || value > MAX_COOLDOWN_SECONDS ? null : value;
}
