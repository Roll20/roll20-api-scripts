// Persistent state: state.RESIZER. 0.0.9 stored { config: { command,
// firsttime } } there; 1.0 upgrades that in place, keeping a renamed command.

import {
  DEFAULT_COMMAND_NAME,
  DEFAULT_SETTINGS,
  MAX_COMMAND_NAME_LENGTH,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
} from './constants.js';
import { getLocale } from './i18n.js';
import { isRecord, parseBoolean, toText } from './utils.js';

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
    // Newest change last. See undo.js.
    undo: [],
    // Page IDs ticked in the page picker.
    picked: [],
    notices: { useroptions: {}, upgradedFrom: null },
  };
}

/**
 * Cleans a command name: no "!", letters, digits, "-" and "_" only.
 *
 * @param {*} raw Name typed by the GM.
 * @returns {string} Clean name, or an empty string when nothing usable is left.
 */
export function cleanCommandName(raw) {
  return toText(raw)
    .replace(/^!+/, '')
    .replaceAll(/[^A-Za-z0-9_-]/g, '')
    .slice(0, MAX_COMMAND_NAME_LENGTH)
    .toLowerCase();
}

/**
 * Cleans a stored state, filling in anything missing and upgrading 0.0.9.
 *
 * @param {*} raw Stored state.
 * @returns {{state: object, fresh: boolean, upgraded: boolean}} Clean state, whether it
 *   was new, and whether it came from 0.0.9.
 */
export function migrateState(raw) {
  if (!isRecord(raw)) {
    return { state: createDefaultState(), fresh: true, upgraded: false };
  }
  const base = createDefaultState();
  if (raw.schemaVersion === undefined) {
    // 0.0.9: only the command name is worth keeping.
    const config = isRecord(raw.config) ? raw.config : {};
    const command = cleanCommandName(config.command) || DEFAULT_COMMAND_NAME;
    base.settings.command = command;
    base.notices.upgradedFrom = '0.0.9';
    return { state: base, fresh: false, upgraded: true };
  }
  const settings = { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) };
  settings.command = cleanCommandName(settings.command) || DEFAULT_COMMAND_NAME;
  settings.language = getLocale(settings.language);
  for (const key of ['keepTokenSize', 'scaleStrokes', 'deleteCalibrationBox']) {
    settings[key] = typeof settings[key] === 'boolean' ? settings[key] : DEFAULT_SETTINGS[key];
  }
  const clean = {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    settings,
    undo: Array.isArray(raw.undo) ? raw.undo.filter(isRecord) : [],
    picked: Array.isArray(raw.picked) ? raw.picked.filter((id) => typeof id === 'string') : [],
    notices: { ...base.notices, ...(isRecord(raw.notices) ? raw.notices : {}) },
  };
  return { state: clean, fresh: false, upgraded: false };
}

/**
 * Loads (and upgrades) the persistent state.
 *
 * @returns {{fresh: boolean, upgraded: boolean}} Whether it was new or came from 0.0.9.
 */
export function initialiseState() {
  const { state: clean, fresh, upgraded } = migrateState(state[STATE_KEY]);
  clean.version = SCRIPT_VERSION;
  state[STATE_KEY] = clean;
  return { fresh, upgraded };
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
 * Returns the commands Resizer answers to: !resizer, !rsz and a renamed one.
 *
 * @returns {string[]} Commands, lower case, with "!".
 */
export function getCommandNames() {
  const custom = `!${cleanCommandName(getSettings().command) || DEFAULT_COMMAND_NAME}`;
  return [...new Set(['!resizer', '!rsz', custom])];
}

/**
 * Returns the command buttons and help use (the renamed one when there is one).
 *
 * @returns {string} Command with "!".
 */
export function getCommand() {
  return `!${cleanCommandName(getSettings().command) || DEFAULT_COMMAND_NAME}`;
}

/**
 * Changes a setting after checking its value.
 *
 * @param {string} key Setting name.
 * @param {*} value New value.
 * @returns {boolean} True when the value was accepted.
 */
export function setSetting(key, value) {
  const s = getSettings();
  if (key === 'language') {
    s.language = getLocale(value);
    return true;
  }
  if (key === 'command') {
    const name = cleanCommandName(value);
    if (!name) {
      return false;
    }
    s.command = name;
    return true;
  }
  if (key in DEFAULT_SETTINGS && typeof DEFAULT_SETTINGS[key] === 'boolean') {
    const b = parseBoolean(value);
    if (b === null) {
      return false;
    }
    s[key] = b;
    return true;
  }
  return false;
}

/**
 * Puts every setting back to its default (the undo history is kept).
 *
 * @returns {void}
 */
export function resetSettings() {
  getState().settings = { ...DEFAULT_SETTINGS };
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
  const branch = globalconfig.resizer || globalconfig.Resizer || globalconfig[STATE_KEY];
  if (!isRecord(branch)) {
    return;
  }
  const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
  const s = getState();
  // useroptions only change when the GM edits them, so remember what was last
  // applied; otherwise chat changes would be overwritten on every restart.
  const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
  for (const key of ['language']) {
    if (key in options && options[key] !== applied[key]) {
      setSetting(key, options[key]);
      applied[key] = options[key];
    }
  }
  s.notices.useroptions = applied;
}
