import {
  DECK_VIEW_KEYS,
  DEFAULT_AC_BAR,
  DEFAULT_DECK_VIEW,
  DEFAULT_HP_BAR,
  DEFAULT_LOCALE,
  SCRIPT_VERSION,
  STATE_KEY,
  VALID_AC_BARS,
  VALID_HP_BARS,
} from './constants.js';
import { normalizeLocale } from './i18n.js';
import { isRecord } from './utils.js';

/**
 * Creates a fresh default deck state object.
 *
 * @returns {object} Default deck state.
 */
export function createDefaultDeck() {
  return { view: DEFAULT_DECK_VIEW };
}

/**
 * Merges a possibly incomplete deck state with defaults, preserving valid values.
 *
 * @param {object} deck Existing deck state to merge.
 * @returns {object} Complete deck state object.
 */
export function mergeDeckState(deck) {
  const d = isRecord(deck) ? deck : {};
  return {
    view: DECK_VIEW_KEYS.includes(d.view) ? d.view : DEFAULT_DECK_VIEW,
  };
}

/**
 * Creates a fresh default configuration object.
 *
 * @returns {object} Default configuration.
 */
export function createDefaultConfig() {
  return {
    hpBar: DEFAULT_HP_BAR,
    acBar: DEFAULT_AC_BAR,
    language: DEFAULT_LOCALE,
  };
}

/**
 * Ensures the persistent Roll20 state exists and has all required fields.
 *
 * @returns {object} The CombatEncounterDirector state branch.
 */
export function ensureState() {
  if (!isRecord(state[STATE_KEY])) {
    state[STATE_KEY] = {};
  }

  const s = state[STATE_KEY];

  if (isRecord(s.config)) {
    s.config = mergeConfig(s.config);
  } else {
    s.config = createDefaultConfig();
  }

  if (!isRecord(s.tokens)) {
    s.tokens = {};
  }

  if (!isRecord(s.encounters)) {
    s.encounters = {};
  }

  if (isRecord(s.deck)) {
    s.deck = mergeDeckState(s.deck);
  } else {
    s.deck = createDefaultDeck();
  }

  if (!Array.isArray(s.lastReinforcementIds)) {
    s.lastReinforcementIds = [];
  }

  s.version = SCRIPT_VERSION;

  return s;
}

/**
 * Merges a possibly incomplete config with defaults, preserving valid values.
 *
 * @param {object} config Existing config to merge.
 * @returns {object} Complete config object.
 */
export function mergeConfig(config) {
  const c = isRecord(config) ? config : {};
  const defaults = createDefaultConfig();

  return {
    hpBar: VALID_HP_BARS.includes(c.hpBar) ? c.hpBar : defaults.hpBar,
    acBar: VALID_AC_BARS.includes(c.acBar) ? c.acBar : defaults.acBar,
    language: normalizeLocale(c.language) || defaults.language,
  };
}

/**
 * Returns the current configuration.
 *
 * @returns {object} Current configuration.
 */
export function getConfig() {
  return ensureState().config;
}

/**
 * Replaces the current configuration with merged values.
 *
 * @param {object} config Partial or full config to apply.
 * @returns {object} The saved configuration.
 */
export function setConfig(config) {
  const s = ensureState();
  s.config = mergeConfig({ ...s.config, ...config });
  return s.config;
}

/**
 * Imports Roll20 One-Click useroptions into persisted config when available.
 *
 * @returns {object} The saved configuration.
 */
export function applyGlobalConfig() {
  if (!isRecord(globalconfig)) {
    return getConfig();
  }

  const branch =
    globalconfig[STATE_KEY.toLowerCase()] ||
    globalconfig['combatencounterdirector'] ||
    globalconfig[STATE_KEY];

  if (!isRecord(branch)) {
    return getConfig();
  }

  const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
  const updates = {};

  if (VALID_HP_BARS.includes(options.hpBar)) {
    updates.hpBar = options.hpBar;
  }
  if (VALID_AC_BARS.includes(options.acBar)) {
    updates.acBar = options.acBar;
  }
  const lang = normalizeLocale(options.language);
  if (lang) {
    updates.language = lang;
  }

  return setConfig(updates);
}

/**
 * Returns the currently stored Command Deck view key.
 *
 * @returns {string} Deck view key.
 */
export function getDeckView() {
  return ensureState().deck.view;
}

/**
 * Saves the active Command Deck view key.
 *
 * @param {string} view Deck view key to persist.
 * @returns {string} The saved view key.
 */
export function setDeckView(view) {
  const s = ensureState();
  s.deck.view = DECK_VIEW_KEYS.includes(view) ? view : DEFAULT_DECK_VIEW;
  return s.deck.view;
}

// ---------------------------------------------------------------------------
// Reinforcement tracking
// ---------------------------------------------------------------------------

/**
 * Returns the Roll20 IDs of tokens created by the most recent duplicate operation.
 * Used by the 'reinforce show' command to move that batch to the token layer.
 *
 * @returns {string[]} Array of token IDs.
 */
export function getLastReinforcementIds() {
  return ensureState().lastReinforcementIds;
}

/**
 * Persists the IDs of a newly created reinforcement batch.
 *
 * @param {string[]} ids Roll20 token IDs to store.
 */
export function setLastReinforcementIds(ids) {
  ensureState().lastReinforcementIds = Array.isArray(ids) ? [...ids] : [];
}

// ---------------------------------------------------------------------------
// Token state
// ---------------------------------------------------------------------------

/**
 * Returns the tracked state record for a token, or null when not tracked.
 *
 * @param {string} tokenId Roll20 graphic ID.
 * @returns {object|null} Token record or null.
 */
export function getTokenRecord(tokenId) {
  const tokens = ensureState().tokens;
  return isRecord(tokens[tokenId]) ? tokens[tokenId] : null;
}

/**
 * Returns all tracked token records as an array.
 *
 * @returns {object[]} Array of token records.
 */
export function getAllTokenRecords() {
  return Object.values(ensureState().tokens).filter(isRecord);
}

/**
 * Returns tracked token records filtered by a predicate.
 *
 * @param {(record: object) => boolean} predicate Filter function.
 * @returns {object[]} Matching token records.
 */
export function filterTokenRecords(predicate) {
  return getAllTokenRecords().filter(predicate);
}

/**
 * Saves or updates a token record in state.
 *
 * @param {string} tokenId Roll20 graphic ID.
 * @param {object} record Token record to save.
 * @returns {object} The saved record.
 */
export function setTokenRecord(tokenId, record) {
  const s = ensureState();
  s.tokens[tokenId] = record;
  return record;
}

/**
 * Removes a token record from state.
 *
 * @param {string} tokenId Roll20 graphic ID.
 * @returns {object|null} The removed record, or null.
 */
export function removeTokenRecord(tokenId) {
  const s = ensureState();
  const record = s.tokens[tokenId] || null;
  delete s.tokens[tokenId];
  return record;
}

/**
 * Creates a new token record capturing original values.
 *
 * @param {string} tokenId Roll20 graphic ID.
 * @param {object} original Snapshot of original token values.
 * @param {string} pageId Page the token belongs to.
 * @returns {object} New token record.
 */
export function createTokenRecord(tokenId, original, pageId) {
  return {
    tokenId,
    pageId,
    original,
    hpModifier: 100,
    acModifier: 0,
    damageModifier: 100,
    preset: null,
    lastModified: Date.now(),
    lastOperation: '',
  };
}

// ---------------------------------------------------------------------------
// Encounter templates
// ---------------------------------------------------------------------------

/**
 * Returns a named encounter template, or null when not found.
 *
 * @param {string} name Encounter template name.
 * @returns {object|null} Encounter template or null.
 */
export function getEncounter(name) {
  const encounters = ensureState().encounters;
  return isRecord(encounters[name]) ? encounters[name] : null;
}

/**
 * Returns all saved encounter templates.
 *
 * @returns {object[]} Array of encounter template objects.
 */
export function getAllEncounters() {
  return Object.values(ensureState().encounters).filter(isRecord);
}

/**
 * Saves an encounter template under a given name.
 *
 * @param {string} name Template name.
 * @param {object} template Encounter template to save.
 * @returns {object} The saved template.
 */
export function setEncounter(name, template) {
  const s = ensureState();
  s.encounters[name] = template;
  return template;
}

/**
 * Deletes a named encounter template.
 *
 * @param {string} name Template name.
 * @returns {boolean} True when the template existed and was deleted.
 */
export function deleteEncounter(name) {
  const s = ensureState();
  if (!isRecord(s.encounters[name])) {
    return false;
  }
  delete s.encounters[name];
  return true;
}
