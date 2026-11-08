// Persistent state: state.PageFX. v1 kept no state at all; everything lived on
// the PageFX tokens. v2 keeps each effect's settings here, keyed by the ID of
// the token that marks its position and area.

import {
  DEFAULT_INTERVAL_MS,
  DEFAULT_SETTINGS,
  MAX_INTENSITY,
  MAX_FIRE_COUNT,
  MAX_INTERVAL_MS,
  MAX_NAME_LENGTH,
  MAX_SPAWNS_PER_SECOND_LIMIT,
  MIN_INTENSITY,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
  V1_DISABLE_MARKER,
} from './constants.js';
import { describeFx, parseFxSpec } from './fx.js';
import { getLocale } from './i18n.js';
import { clamp, decodeNotes, hasMarker, isRecord, toNumber, toText, truncate } from './utils.js';

/**
 * @typedef {object} Layer
 * @property {import('./fx.js').FxSpec|null} fx What to spawn.
 * @property {[number, number]} interval Shortest and longest time between spawns, in ms.
 * @property {null|'random'|{dx: number, dy: number}} direction End of beam-like effects, in cells.
 * @property {string|null} error Message key when the effect text could not be read.
 */

/**
 * @typedef {object} Effect
 * @property {string} id ID of the token marking the effect.
 * @property {string} name Name shown in menus.
 * @property {boolean} enabled False when turned off.
 * @property {boolean} paused True when held until resumed.
 * @property {number} intensity Rate multiplier.
 * @property {Layer[]} layers What it spawns.
 * @property {string|null} preset Preset its layers came from.
 * @property {object[]} triggers Triggers.
 * @property {'v1'|'chat'} source 'v1' while the token's GM Notes and bars still drive it.
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
    paused: false,
    effects: {},
    nullAreas: {},
    ownedFx: {},
    // Tokens the GM took an effect or no-effect area off. They are not taken
    // over again for being named PageFX or NullFX.
    released: {},
    // Combat round, counted from turn order wraps or read from a "Round" entry.
    round: 1,
    notices: { useroptions: {}, adoptedV1: false },
  };
}

/**
 * Cleans a stored state, filling in anything missing.
 *
 * @param {*} raw Stored state.
 * @returns {{state: object, fresh: boolean}} Clean state and whether it was new.
 */
export function migrateState(raw) {
  if (!isRecord(raw)) {
    return { state: createDefaultState(), fresh: true };
  }
  const base = createDefaultState();
  const clean = {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) },
    effects: isRecord(raw.effects) ? raw.effects : {},
    nullAreas: isRecord(raw.nullAreas) ? raw.nullAreas : {},
    ownedFx: isRecord(raw.ownedFx) ? raw.ownedFx : {},
    released: isRecord(raw.released) ? raw.released : {},
    notices: { ...base.notices, ...(isRecord(raw.notices) ? raw.notices : {}) },
    paused: raw.paused === true,
    round: Math.max(1, Math.round(toNumber(raw.round) ?? 1)),
  };
  for (const [id, effect] of Object.entries(clean.effects)) {
    clean.effects[id] = cleanEffect(effect, id);
  }
  return { state: clean, fresh: false };
}

/**
 * Cleans one stored effect.
 *
 * @param {*} raw Stored effect.
 * @param {string} id Effect ID.
 * @returns {Effect} Effect.
 */
export function cleanEffect(raw, id) {
  const e = isRecord(raw) ? raw : {};
  return {
    id,
    name: truncate(e.name || 'PageFX', MAX_NAME_LENGTH),
    enabled: e.enabled !== false,
    paused: e.paused === true,
    intensity: clampIntensity(e.intensity),
    layers: (Array.isArray(e.layers) ? e.layers : []).map(cleanLayer),
    preset: typeof e.preset === 'string' ? e.preset : null,
    triggers: (Array.isArray(e.triggers) ? e.triggers : [])
      .map(cleanTrigger)
      .filter(Boolean)
      .slice(0, MAX_TRIGGERS),
    source: e.source === 'v1' ? 'v1' : 'chat',
  };
}

export const TRIGGER_EVENTS = ['round', 'turn', 'enter', 'leave'];
export const TRIGGER_ACTIONS = ['start', 'stop', 'toggle', 'fire', 'burst'];
export const TRIGGER_WHO = ['players', 'all', 'named'];
export const DEFAULT_BURST = 5;
export const MAX_TRIGGERS = 8;

/**
 * @typedef {object} Trigger
 * @property {'round'|'turn'|'enter'|'leave'} event What sets it off.
 * @property {'start'|'stop'|'toggle'|'fire'|'burst'} action What it does to the effect.
 * @property {number} count Spawns for a burst.
 * @property {number} every Round triggers: every this many rounds.
 * @property {number|null} round Round triggers: only on this round.
 * @property {string|null} token Turn: whose turn. Enter/leave: the token whose Aura 1
 *   is the area (null: the effect's own area).
 * @property {'players'|'all'|'named'} who Enter/leave: which tokens count.
 * @property {string[]} names Enter/leave with who "named": token names that count.
 * @property {boolean} once Only goes off once.
 * @property {boolean} used A once-only trigger that has gone off.
 */

/**
 * Cleans a stored or typed trigger.
 *
 * @param {*} raw Trigger.
 * @returns {Trigger|null} Trigger, or null when its event or action is unknown.
 */
export function cleanTrigger(raw) {
  if (!isRecord(raw) || !TRIGGER_EVENTS.includes(raw.event)) {
    return null;
  }
  if (!TRIGGER_ACTIONS.includes(raw.action)) {
    return null;
  }
  const count = Math.round(toNumber(raw.count) ?? DEFAULT_BURST);
  const every = Math.round(toNumber(raw.every) ?? 1);
  const round = toNumber(raw.round);
  return {
    event: raw.event,
    action: raw.action,
    count: Math.min(MAX_FIRE_COUNT, Math.max(1, count)),
    every: Math.max(1, every),
    round: round !== null && round >= 1 ? Math.round(round) : null,
    token: toText(raw.token) || null,
    who: TRIGGER_WHO.includes(raw.who) ? raw.who : 'players',
    names: (Array.isArray(raw.names) ? raw.names : [])
      .map((n) => toText(n))
      .filter(Boolean)
      .slice(0, 20),
    once: raw.once === true,
    used: raw.used === true,
  };
}

/**
 * Cleans one stored layer.
 *
 * @param {*} raw Stored layer.
 * @returns {Layer} Layer.
 */
export function cleanLayer(raw) {
  const l = isRecord(raw) ? raw : {};
  return {
    fx: isRecord(l.fx) ? l.fx : null,
    interval: cleanInterval(l.interval),
    direction: cleanDirection(l.direction),
    error: typeof l.error === 'string' ? l.error : null,
  };
}

/**
 * Cleans an interval pair.
 *
 * @param {*} raw [low, high] in ms.
 * @returns {[number, number]} Interval.
 */
export function cleanInterval(raw) {
  const [a, b] = Array.isArray(raw) ? raw : [];
  const low = clamp(toNumber(a) ?? DEFAULT_INTERVAL_MS, 1, MAX_INTERVAL_MS);
  const high = clamp(toNumber(b) ?? low, 1, MAX_INTERVAL_MS);
  return low <= high ? [low, high] : [high, low];
}

/**
 * Cleans a beam direction.
 *
 * @param {*} raw 'random', {dx, dy} or nothing.
 * @returns {null|'random'|{dx: number, dy: number}} Direction.
 */
export function cleanDirection(raw) {
  if (raw === 'random') {
    return 'random';
  }
  if (isRecord(raw)) {
    return { dx: toNumber(raw.dx) || 0, dy: toNumber(raw.dy) || 0 };
  }
  return null;
}

/**
 * Keeps an intensity in range.
 *
 * @param {*} raw Intensity.
 * @returns {number} Intensity between the limits (1 when unreadable).
 */
export function clampIntensity(raw) {
  const n = toNumber(raw);
  return n === null ? 1 : clamp(n, MIN_INTENSITY, MAX_INTENSITY);
}

/**
 * Reads an effect the v1 way, from its token: GM Notes hold the effect, Bar 1
 * value and max the interval range in ms, Bar 2 value and max the end offset
 * of beam-like effects (or "random"), and the interdiction marker turns it off.
 *
 * @param {object} token Roll20 graphic.
 * @returns {{layer: Layer, enabled: boolean}} The token's layer and on/off state.
 */
export function readV1Token(token) {
  const parsed = parseFxSpec(decodeNotes(token.get('gmnotes')));
  const low = toNumber(token.get('bar1_value'));
  const high = toNumber(token.get('bar1_max'));
  const dxRaw = toText(token.get('bar2_value'));
  let direction = null;
  if (dxRaw.toLowerCase() === 'random') {
    direction = 'random';
  } else if (dxRaw !== '' || toText(token.get('bar2_max')) !== '') {
    direction = { dx: toNumber(dxRaw) || 0, dy: toNumber(token.get('bar2_max')) || 0 };
  }
  const lowMs = low && low > 0 ? low : DEFAULT_INTERVAL_MS;
  return {
    layer: {
      fx: parsed.ok ? parsed.fx : null,
      interval: cleanInterval([lowMs, high && high > 0 ? high : lowMs]),
      direction,
      error: parsed.ok ? null : parsed.error,
    },
    enabled: !hasMarker(token, V1_DISABLE_MARKER),
  };
}

/**
 * Builds a new effect from a v1 token.
 *
 * @param {object} token Roll20 graphic.
 * @returns {Effect} Effect.
 */
export function effectFromV1Token(token) {
  const { layer, enabled } = readV1Token(token);
  return cleanEffect(
    {
      name: layer.fx ? describeFx(layer.fx) : toText(token.get('name')) || 'PageFX',
      enabled,
      layers: [layer],
      source: 'v1',
    },
    token.id
  );
}

// ---------------------------------------------------------------------------
// Live state access (Roll20 sandbox only).

/**
 * Loads and cleans state.PageFX.
 *
 * @returns {boolean} True when there was no state before (a new install or a v1 game).
 */
export function initialiseState() {
  const { state: clean, fresh } = migrateState(state[STATE_KEY]);
  clean.version = SCRIPT_VERSION;
  state[STATE_KEY] = clean;
  return fresh;
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
  if (key === 'gmPagePreview') {
    if (typeof value !== 'boolean') {
      return false;
    }
    s.gmPagePreview = value;
    return true;
  }
  if (key === 'intensity') {
    const n = toNumber(value);
    if (n === null) {
      return false;
    }
    s.intensity = clampIntensity(n);
    return true;
  }
  if (key === 'maxSpawnsPerSecond') {
    const n = toNumber(value);
    if (n === null || n < 1) {
      return false;
    }
    s.maxSpawnsPerSecond = clamp(Math.round(n), 1, MAX_SPAWNS_PER_SECOND_LIMIT);
    return true;
  }
  return false;
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
  const branch = globalconfig.pagefx || globalconfig[STATE_KEY] || globalconfig['page fx'];
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

/**
 * Returns every effect.
 *
 * @returns {Record<string, Effect>} Effects by ID.
 */
export function getEffects() {
  return getState().effects;
}

/**
 * Returns one effect.
 *
 * @param {string} id Effect ID.
 * @returns {Effect|undefined} Effect.
 */
export function getEffect(id) {
  return getState().effects[id];
}

/**
 * Stores an effect.
 *
 * @param {Effect} effect Effect.
 * @returns {Effect} The stored effect.
 */
export function putEffect(effect) {
  getState().effects[effect.id] = effect;
  return effect;
}

/**
 * Forgets an effect.
 *
 * @param {string} id Effect ID.
 * @returns {void}
 */
export function deleteEffect(id) {
  delete getState().effects[id];
}

/**
 * Returns the tokens the GM took an effect or area off, keyed by token ID.
 *
 * @returns {Record<string, true>} Released token IDs.
 */
export function getReleased() {
  return getState().released;
}

/**
 * Returns the no-effect areas, keyed by token ID.
 *
 * @returns {Record<string, {source: string}>} Null areas.
 */
export function getNullAreas() {
  return getState().nullAreas;
}
