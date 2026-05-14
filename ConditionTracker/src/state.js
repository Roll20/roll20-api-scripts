import {
  DEFAULT_LOCALE,
  DEFAULT_MARKERS,
  SCRIPT_VERSION,
  STATE_KEY,
  VALID_HEALTH_BARS,
} from "./constants.js";
import { normalizeLocale } from "./i18n.js";
import { isRecord } from "./utils.js";

const GLOBAL_CONFIG_KEY = STATE_KEY.toLowerCase();

/**
 * Creates a fresh default configuration object.
 *
 * @returns {object} Default configuration.
 */
export function createDefaultConfig() {
  return {
    useMarkers: true,
    useIcons: false,
    subjectPromptBypass: false,
    healthBar: VALID_HEALTH_BARS[0],
    language: DEFAULT_LOCALE,
    markers: { ...DEFAULT_MARKERS },
  };
}

/**
 * Creates a new runtime bookkeeping object.
 *
 * @returns {object} Runtime bookkeeping state.
 */
export function createRuntimeState() {
  return {
    previousFirstTurnId: "",
    previousTurnSignature: "",
    previousTokenIds: [],
    previousMisplacedConditionIds: [],
  };
}

/**
 * Ensures the persistent Roll20 state exists and has required fields.
 *
 * @returns {object} The Condition Tracker state branch.
 */
export function ensureState() {
  const existing = state[STATE_KEY];
  if (
    isRecord(existing) &&
    existing.version === SCRIPT_VERSION &&
    isRecord(existing.config) &&
    Array.isArray(existing.active) &&
    isRecord(existing.runtime)
  ) {
    return existing;
  }

  if (!isRecord(state[STATE_KEY])) {
    state[STATE_KEY] = {};
  }

  const trackerState = state[STATE_KEY];
  trackerState.version = SCRIPT_VERSION;

  if (!isRecord(trackerState.config)) {
    trackerState.config = createDefaultConfig();
  }

  trackerState.config = mergeConfig(trackerState.config);

  if (!Array.isArray(trackerState.active)) {
    trackerState.active = [];
  }

  if (!isRecord(trackerState.runtime)) {
    trackerState.runtime = createRuntimeState();
  }

  return trackerState;
}

/**
 * Merges a possibly incomplete config object with defaults.
 *
 * @param {object} config The current config.
 * @returns {object} A complete config.
 */
export function mergeConfig(config) {
  const defaults = createDefaultConfig();
  const nextConfig = isRecord(config) ? config : {};
  const markers = isRecord(nextConfig.markers) ? nextConfig.markers : {};

  return {
    useMarkers:
      typeof nextConfig.useMarkers === "boolean"
        ? nextConfig.useMarkers
        : defaults.useMarkers,
    useIcons:
      typeof nextConfig.useIcons === "boolean"
        ? nextConfig.useIcons
        : defaults.useIcons,
    subjectPromptBypass:
      typeof nextConfig.subjectPromptBypass === "boolean"
        ? nextConfig.subjectPromptBypass
        : defaults.subjectPromptBypass,
    healthBar: VALID_HEALTH_BARS.includes(nextConfig.healthBar)
      ? nextConfig.healthBar
      : defaults.healthBar,
    language: normalizeLocale(nextConfig.language) || defaults.language,
    markers: { ...defaults.markers, ...markers },
  };
}

/**
 * Returns the current configuration.
 *
 * @returns {object} The current configuration.
 */
export function getConfig() {
  return ensureState().config;
}

/**
 * Replaces the current configuration.
 *
 * @param {object} config The next config.
 * @returns {object} The saved config.
 */
export function setConfig(config) {
  const trackerState = ensureState();
  trackerState.config = mergeConfig(config);
  return trackerState.config;
}

/**
 * Imports Roll20 One-Click useroptions into persisted config when available.
 *
 * Supports both the common direct branch format and branches that nest values
 * under a useroptions object.
 *
 * @returns {object} The saved config.
 */
export function applyGlobalConfig() {
  const options = getGlobalConfigOptions();
  if (!options) {
    return getConfig();
  }

  const config = getConfig();
  const nextConfig = { ...config };

  nextConfig.useMarkers = parseBooleanOption(
    options.useMarkers,
    config.useMarkers,
  );
  nextConfig.useIcons = parseBooleanOption(options.useIcons, config.useIcons);
  nextConfig.subjectPromptBypass = parseBooleanOption(
    options.subjectPromptBypass,
    config.subjectPromptBypass,
  );

  if (VALID_HEALTH_BARS.includes(options.healthBar)) {
    nextConfig.healthBar = options.healthBar;
  }

  const language = normalizeLocale(options.language);
  if (language) {
    nextConfig.language = language;
  }

  const nextMarkers = { ...config.markers };
  Object.keys(DEFAULT_MARKERS).forEach((condition) => {
    const markerValue = getMarkerOption(options, condition);
    nextMarkers[condition] = parseMarkerOption(
      markerValue,
      nextMarkers[condition] || DEFAULT_MARKERS[condition],
    );
  });
  nextConfig.markers = nextMarkers;

  return setConfig(nextConfig);
}

/**
 * Returns the Condition Tracker One-Click options branch when present.
 *
 * @returns {object|null} One-Click options or null.
 */
function getGlobalConfigOptions() {
  if (!isRecord(globalconfig)) {
    return null;
  }

  const branch = globalconfig[GLOBAL_CONFIG_KEY] || globalconfig[STATE_KEY];
  if (!isRecord(branch)) {
    return null;
  }

  if (isRecord(branch.useroptions)) {
    return branch.useroptions;
  }

  return branch;
}

/**
 * Normalizes Roll20 checkbox-style option values to booleans.
 *
 * @param {*} value Option value.
 * @param {boolean} fallback Value to use when the option is absent/invalid.
 * @returns {boolean} Parsed boolean option.
 */
function parseBooleanOption(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === undefined || value === null) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "checked", "on", "yes"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "", "off", "no"].includes(normalized)) {
    return false;
  }

  return fallback;
}

/**
 * Reads marker overrides from One-Click option keys.
 *
 * Supports several key formats for compatibility with prior local builds.
 *
 * @param {object} options One-Click options object.
 * @param {string} condition Condition/effect name.
 * @returns {*} Raw option value.
 */
function getMarkerOption(options, condition) {
  if (!isRecord(options)) {
    return undefined;
  }

  const keyVariants = [
    `marker${condition}`,
    `marker.${condition}`,
    `markers.${condition}`,
  ];

  for (const key of keyVariants) {
    if (Object.hasOwn(options, key)) {
      return options[key];
    }
  }

  return undefined;
}

/**
 * Normalizes marker option values.
 *
 * @param {*} value Option value.
 * @param {string} fallback Value to use when absent/invalid.
 * @returns {string} Parsed marker name.
 */
function parseMarkerOption(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const marker = value.trim();
  if (marker) {
    return marker;
  }

  return fallback;
}

/**
 * Adds an active condition to persistent state.
 *
 * @param {object} condition The condition record to add.
 * @returns {object} The saved condition record.
 */
export function addActiveCondition(condition) {
  const trackerState = ensureState();
  trackerState.active.push(condition);
  return condition;
}

/**
 * Returns the current active condition list.
 *
 * @returns {object[]} Active conditions.
 */
export function getActiveConditions() {
  return ensureState().active;
}

/**
 * Returns active conditions matching a predicate.
 *
 * @param {(condition: object) => boolean} predicate Match function.
 * @returns {object[]} Matching active conditions.
 */
export function filterActiveConditions(predicate) {
  return getActiveConditions().filter(predicate);
}

/**
 * Returns true when any active condition matches a predicate.
 *
 * @param {(condition: object) => boolean} predicate Match function.
 * @returns {boolean} True when a matching condition exists.
 */
export function someActiveCondition(predicate) {
  return getActiveConditions().some(predicate);
}

/**
 * Splits active conditions into kept and matched groups.
 *
 * @param {(condition: object) => boolean} predicate Match function.
 * @returns {{ matched: object[], unmatched: object[] }} Partitioned conditions.
 */
export function partitionActiveConditions(predicate) {
  const matched = [];
  const unmatched = [];

  for (const condition of getActiveConditions()) {
    if (predicate(condition)) {
      matched.push(condition);
    } else {
      unmatched.push(condition);
    }
  }

  return { matched, unmatched };
}

/**
 * Finds an active condition by id.
 *
 * @param {string} conditionId The condition id.
 * @returns {object|null} The matching condition or null.
 */
export function findActiveCondition(conditionId) {
  return (
    filterActiveConditions((condition) => condition.id === conditionId)[0] ||
    null
  );
}

/**
 * Replaces the active condition list.
 *
 * @param {object[]} active The next active list.
 * @returns {object[]} The saved active list.
 */
export function setActiveConditions(active) {
  const trackerState = ensureState();
  trackerState.active = Array.isArray(active) ? active : [];
  return trackerState.active;
}

/**
 * Removes one active condition by id.
 *
 * @param {string} conditionId The condition id to remove.
 * @returns {object|null} The removed condition or null.
 */
export function removeActiveCondition(conditionId) {
  const trackerState = ensureState();
  const remaining = [];
  let removed = null;

  for (const condition of trackerState.active) {
    if (condition.id === conditionId) {
      removed = condition;
    } else {
      remaining.push(condition);
    }
  }

  trackerState.active = remaining;
  return removed;
}

/**
 * Returns all active conditions for one target token.
 *
 * @param {string} targetTokenId The target token id.
 * @returns {object[]} Matching active conditions.
 */
export function getActiveByTarget(targetTokenId) {
  return filterActiveConditions(
    (condition) => condition.targetTokenId === targetTokenId,
  );
}

/**
 * Updates runtime turn tracker bookkeeping.
 *
 * @param {string} firstTurnId The current first turn id.
 * @param {string} signature The current turn signature.
 * @param {string[]} [tokenIds] Ordered token ids from the current turn order.
 * @param {string[]} [misplacedConditionIds] Condition ids currently misplaced in the turn order.
 * @returns {void}
 */
export function updateTurnRuntime(
  firstTurnId,
  signature,
  tokenIds,
  misplacedConditionIds,
) {
  const runtime = ensureState().runtime;
  runtime.previousFirstTurnId = firstTurnId || "";
  runtime.previousTurnSignature = signature || "";
  runtime.previousTokenIds = Array.isArray(tokenIds) ? tokenIds : [];
  runtime.previousMisplacedConditionIds = Array.isArray(misplacedConditionIds)
    ? misplacedConditionIds
    : [];
}
