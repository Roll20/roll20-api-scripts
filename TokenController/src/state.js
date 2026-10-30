import {
  ANCHOR_PAGE,
  ANCHOR_TOKEN,
  COMBAT_BEHAVIOUR_OPTIONS,
  COMBAT_DETECTION_OPTIONS,
  DEFAULT_CONFIG,
  FACING_OPTIONS,
  FOLLOW_MODE_OPTIONS,
  LOCK_MODE_OPTIONS,
  MANUAL_MOVE_OPTIONS,
  MAX_BUTTON_STEP,
  MAX_INTERVAL,
  MAX_NAME_LENGTH,
  MAX_TOKENS_PER_ROUTE,
  MIN_INTERVAL,
  MOVEMENT_OPTIONS,
  ROUTE_KIND_CODE,
  ROUTE_KIND_WAYPOINTS,
  ROUTE_MODE_OPTIONS,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
  USEROPTION_KEYS,
} from './constants.js';
import { normalizeLocale } from './i18n.js';
import { parseCode, stepsReturnToStart } from './routes.js';
import { clamp, isRecord, parseBoolean, parseStrictInt, toText } from './utils.js';

// ---------------------------------------------------------------------------
// Value validation (pure)
// ---------------------------------------------------------------------------

/**
 * Parses an interval in milliseconds. Values under 10 are taken as seconds,
 * as v4 did.
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Interval in ms, or null when invalid.
 */
export function parseInterval(raw) {
  const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
  if (n === null || !Number.isFinite(n) || n < 1) {
    return null;
  }
  return clamp(n < 10 ? n * 1000 : n, MIN_INTERVAL, MAX_INTERVAL);
}

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
    const found = list.find((o) => o.toLowerCase() === text);
    return found ? ok(found) : bad;
  };

  switch (key) {
    case 'language': {
      const lang = normalizeLocale(raw);
      return lang ? ok(lang) : bad;
    }
    case 'interval': {
      const ms = parseInterval(raw);
      return ms === null ? bad : ok(ms);
    }
    case 'movement':
      return option(MOVEMENT_OPTIONS);
    case 'facing':
      return option(FACING_OPTIONS);
    case 'combatDetection':
      return option(COMBAT_DETECTION_OPTIONS);
    case 'combatBehaviour':
      return option(COMBAT_BEHAVIOUR_OPTIONS);
    case 'lockMode':
      return option(LOCK_MODE_OPTIONS);
    case 'followMode':
      return option(FOLLOW_MODE_OPTIONS);
    case 'manualMove':
      return option(MANUAL_MOVE_OPTIONS);
    case 'lockMarker': {
      const text = toText(raw);
      if (!text || ['none', 'off', '-'].includes(text.toLowerCase())) {
        return ok('none');
      }
      return /^[\w:-]{1,60}$/.test(text) ? ok(text) : bad;
    }
    case 'buttonStep': {
      const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
      return n === null || n < 1 ? bad : ok(clamp(n, 1, MAX_BUTTON_STEP));
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
 * Cleans a route name: trims it, drops characters that break chat buttons and
 * limits its length.
 *
 * @param {*} raw Raw name.
 * @returns {string} Clean name (may be empty).
 */
export function cleanName(raw) {
  return toText(raw)
    .replaceAll(/["|{}[\]\\]/g, '')
    .replaceAll(/\s+/g, ' ')
    .slice(0, MAX_NAME_LENGTH)
    .trim();
}

/**
 * Validates one route option.
 *
 * @param {string} key Option: mode, interval, maxTokens or randomStart.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Result.
 */
export function validateRouteOption(key, raw) {
  const text = toText(raw).toLowerCase();
  const off = ['', '0', 'off', 'none', 'default', '-'].includes(text);
  switch (key) {
    case 'mode':
      return ROUTE_MODE_OPTIONS.includes(text) ? { valid: true, value: text } : { valid: false };
    case 'interval': {
      if (off) {
        return { valid: true, value: null };
      }
      const ms = parseInterval(raw);
      return ms === null ? { valid: false } : { valid: true, value: ms };
    }
    case 'maxTokens': {
      if (off) {
        return { valid: true, value: null };
      }
      const n = parseStrictInt(raw);
      return n === null || n < 1
        ? { valid: false }
        : { valid: true, value: Math.min(n, MAX_TOKENS_PER_ROUTE) };
    }
    case 'randomStart': {
      const b = parseBoolean(raw);
      return b === null ? { valid: false } : { valid: true, value: b };
    }
    default:
      return { valid: false };
  }
}

/**
 * Normalises a stored waypoint list.
 *
 * @param {*} raw Stored points.
 * @returns {object[]} Clean points.
 */
function normalisePoints(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const points = [];
  for (const p of raw) {
    if (isRecord(p) && Number.isFinite(p.x) && Number.isFinite(p.y)) {
      points.push({ x: p.x, y: p.y });
    } else if (isRecord(p) && Number.isInteger(p.wait) && p.wait > 0) {
      points.push({ wait: p.wait });
    } else if (isRecord(p) && p.stealth === true) {
      points.push({ stealth: true });
    }
  }
  return points;
}

/**
 * Normalises a fixed start position.
 *
 * @param {*} raw Stored start.
 * @returns {object|null} { pageId, left, top, rotation } or null.
 */
function normaliseStart(raw) {
  if (!isRecord(raw) || !toText(raw.pageId)) {
    return null;
  }
  const left = Number(raw.left);
  const top = Number(raw.top);
  if (!Number.isFinite(left) || !Number.isFinite(top)) {
    return null;
  }
  return {
    pageId: toText(raw.pageId),
    left,
    top,
    rotation: Number.isFinite(Number(raw.rotation)) ? Number(raw.rotation) : null,
  };
}

/**
 * Normalises one stored route, or returns null when it is unusable.
 *
 * @param {*} raw Stored route.
 * @returns {object|null} Clean route.
 */
export function normaliseRoute(raw) {
  if (!isRecord(raw) || !toText(raw.id) || !cleanName(raw.name)) {
    return null;
  }
  const route = {
    id: toText(raw.id),
    name: cleanName(raw.name),
    kind: raw.kind === ROUTE_KIND_WAYPOINTS ? ROUTE_KIND_WAYPOINTS : ROUTE_KIND_CODE,
    mode: ROUTE_MODE_OPTIONS.includes(raw.mode) ? raw.mode : 'pingpong',
    interval: validateRouteOption('interval', raw.interval ?? '').value ?? null,
    maxTokens: validateRouteOption('maxTokens', raw.maxTokens ?? '').value ?? null,
    randomStart: raw.randomStart === true,
    start: normaliseStart(raw.start),
  };
  if (route.kind === ROUTE_KIND_CODE) {
    if (!parseCode(raw.code).ok) {
      return null;
    }
    route.code = toText(raw.code);
  } else {
    route.anchor = raw.anchor === ANCHOR_PAGE ? ANCHOR_PAGE : ANCHOR_TOKEN;
    route.points = normalisePoints(raw.points);
    if (route.anchor === ANCHOR_PAGE) {
      route.pageId = toText(raw.pageId);
    }
    if (route.points.filter((p) => 'x' in p).length < 2) {
      return null;
    }
  }
  return route;
}

// ---------------------------------------------------------------------------
// State shape and migration (pure)
// ---------------------------------------------------------------------------

/**
 * Creates an empty v5 state object.
 *
 * @returns {object} Fresh state.
 */
export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    config: { ...DEFAULT_CONFIG },
    routes: {},
    nextId: 1,
    patrols: {},
    locks: {},
    follows: {},
    leaders: {},
    recordings: {},
    calibrations: {},
    combat: { manual: false, active: false, turnId: null },
    paused: false,
    notices: {},
  };
}

/**
 * Normalises a saved token position.
 *
 * @param {*} raw Stored position.
 * @returns {object|null} { left, top, rotation, layer? } or null.
 */
function normalisePosition(raw) {
  if (!isRecord(raw)) {
    return null;
  }
  const left = Number(raw.left);
  const top = Number(raw.top);
  if (!Number.isFinite(left) || !Number.isFinite(top)) {
    return null;
  }
  const pos = { left, top, rotation: Number(raw.rotation) || 0 };
  if (toText(raw.layer)) {
    pos.layer = toText(raw.layer);
  }
  return pos;
}

/**
 * Normalises one stored patrol.
 *
 * @param {*} raw Stored patrol.
 * @param {object} routes Clean routes by ID.
 * @returns {object|null} Clean patrol.
 */
function normalisePatrol(raw, routes) {
  if (!isRecord(raw) || !routes[raw.routeId]) {
    return null;
  }
  const anchor =
    Array.isArray(raw.anchor) && raw.anchor.length === 2 && raw.anchor.every(Number.isFinite)
      ? [raw.anchor[0], raw.anchor[1]]
      : null;
  return {
    routeId: raw.routeId,
    pageId: toText(raw.pageId),
    index: Number.isInteger(raw.index) && raw.index >= 0 ? raw.index : 0,
    dir: raw.dir === -1 ? -1 : 1,
    anchor,
    origin: normalisePosition(raw.origin),
    dueAt: Number(raw.dueAt) || 0,
  };
}

/**
 * Converts v4 state (`storedVariables`) into a clean v5 state.
 *
 * v4 kept everything in arrays keyed by name: `paths` (name, path code,
 * isCycle and the 4.x options), `activeTokenPaths` (tokens on paths, by path
 * name), `tokenMemory` (locked and following tokens) and `pathDrafts`
 * (unfinished paths built with the menu buttons). Drafts with any steps are
 * kept as routes so no work is lost.
 *
 * @param {object} vars v4 storedVariables.
 * @returns {object} Clean v5 state.
 */
function migrateV4(vars) {
  const fresh = createDefaultState();
  const v4Interval = parseInterval(vars.interval);
  fresh.config = {
    ...DEFAULT_CONFIG,
    interval: v4Interval ?? 5000,
    movement: vars.subStepMovement === true ? 'cell' : 'segment',
    facing: vars.rotateTokens === true ? 'down' : 'off',
    combatBehaviour: vars.combatPatrol === true ? 'step' : 'pause',
    combatDetection: 'tracker',
    lockMode: 'revert',
    lockMarker: 'red',
    followMode: 'trail',
    buttonStep: validateConfigValue('buttonStep', vars.unitPerClick).value ?? 1,
  };

  const byName = {};
  const addRoute = (route) => {
    const clean = normaliseRoute({ ...route, id: `r${fresh.nextId}` });
    if (!clean || byName[clean.name.toLowerCase()]) {
      return null;
    }
    fresh.nextId++;
    fresh.routes[clean.id] = clean;
    byName[clean.name.toLowerCase()] = clean;
    return clean;
  };

  for (const p of Array.isArray(vars.paths) ? vars.paths : []) {
    if (!isRecord(p)) {
      continue;
    }
    // 4.0.0 could store the path record itself in `path` by mistake.
    const code = typeof p.path === 'string' ? p.path : toText(p.path?.path);
    // v4 worked out isCycle when a path was first started if it was missing.
    const parsed = parseCode(code);
    const cycles = p.isCycle ?? (parsed.ok && stepsReturnToStart(parsed.steps));
    addRoute({
      name: p.name,
      kind: ROUTE_KIND_CODE,
      code,
      mode: p.runOnce === true ? 'once' : cycles ? 'loop' : 'pingpong',
      interval: p.intervalOverride,
      maxTokens: p.maxTokens,
      randomStart: p.randomStart === true,
      start:
        p.fixedStart === true
          ? {
              pageId: p.startPageId,
              left: p.startLeft,
              top: p.startTop,
              rotation: p.startRotation,
            }
          : null,
    });
  }

  for (const d of Array.isArray(vars.pathDrafts) ? vars.pathDrafts : []) {
    if (isRecord(d) && toText(d.path)) {
      const code = toText(d.path);
      const parsed = parseCode(code);
      addRoute({
        name: `${cleanName(d.name)} (draft)`,
        kind: ROUTE_KIND_CODE,
        code,
        mode: parsed.ok && stepsReturnToStart(parsed.steps) ? 'loop' : 'pingpong',
      });
    }
  }

  for (const tp of Array.isArray(vars.activeTokenPaths) ? vars.activeTokenPaths : []) {
    const route = isRecord(tp) ? byName[cleanName(tp.pathName).toLowerCase()] : null;
    const tokenId = toText(tp?.tokenId);
    // v4 allowed several paths per token; v5 keeps the first.
    if (!route || !tokenId || fresh.patrols[tokenId]) {
      continue;
    }
    fresh.patrols[tokenId] = {
      routeId: route.id,
      pageId: toText(tp.pageId),
      index: 0,
      dir: 1,
      // Re-anchored at the token's current position on startup.
      anchor: null,
      origin: normalisePosition({
        left: tp.initialLeft,
        top: tp.initialTop,
        rotation: tp.initialRotation,
      }),
      dueAt: 0,
    };
  }

  for (const tm of Array.isArray(vars.tokenMemory) ? vars.tokenMemory : []) {
    const tokenId = toText(tm?.tokenId);
    if (!tokenId) {
      continue;
    }
    if (tm.isLocked === true) {
      const pos = normalisePosition(tm);
      if (pos) {
        fresh.locks[tokenId] = {
          pageId: toText(tm.pageId),
          ...pos,
          marker: 'red',
          mode: 'revert',
          native: false,
        };
      }
    } else if (tm.isFollowing === true && toText(tm.followingTokenId)) {
      fresh.follows[tokenId] = { leaderId: toText(tm.followingTokenId), offset: null };
    }
  }

  fresh.notices.migratedV4 = {
    routes: Object.keys(fresh.routes).length,
    patrols: Object.keys(fresh.patrols).length,
    unitPx: Number(vars.unitPx) || 70,
  };
  return fresh;
}

/**
 * Converts any stored state (v4, v5 or damaged) into a clean v5 state.
 *
 * @param {*} raw Stored state.
 * @returns {{state: object, migratedFrom: number|null}} Clean state and the
 *          major version it was migrated from (null when no migration was needed).
 */
export function migrateState(raw) {
  if (!isRecord(raw)) {
    return { state: createDefaultState(), migratedFrom: null };
  }
  if (isRecord(raw.storedVariables) && raw.schemaVersion !== SCHEMA_VERSION) {
    return { state: migrateV4(raw.storedVariables), migratedFrom: 4 };
  }

  const fresh = createDefaultState();
  fresh.config = mergeConfig(raw.config);
  fresh.nextId = Number.isInteger(raw.nextId) && raw.nextId > 0 ? raw.nextId : 1;
  if (isRecord(raw.routes)) {
    for (const value of Object.values(raw.routes)) {
      const route = normaliseRoute(value);
      if (route) {
        fresh.routes[route.id] = route;
        const n = Number(route.id.replace(/^r/, ''));
        if (Number.isInteger(n) && n >= fresh.nextId) {
          fresh.nextId = n + 1;
        }
      }
    }
  }
  if (isRecord(raw.patrols)) {
    for (const [tokenId, value] of Object.entries(raw.patrols)) {
      const patrol = normalisePatrol(value, fresh.routes);
      if (patrol) {
        fresh.patrols[tokenId] = patrol;
      }
    }
  }
  if (isRecord(raw.locks)) {
    for (const [tokenId, value] of Object.entries(raw.locks)) {
      const pos = normalisePosition(value);
      if (pos) {
        fresh.locks[tokenId] = {
          pageId: toText(value.pageId),
          ...pos,
          marker: toText(value.marker) || 'none',
          // Locks saved before modes were stored undo moves, unless native.
          mode: LOCK_MODE_OPTIONS.includes(value.mode)
            ? value.mode
            : value.native === true
              ? 'native'
              : 'revert',
          native: value.native === true,
        };
      }
    }
  }
  if (isRecord(raw.follows)) {
    for (const [tokenId, value] of Object.entries(raw.follows)) {
      if (isRecord(value) && toText(value.leaderId) && value.leaderId !== tokenId) {
        const offset =
          Array.isArray(value.offset) && value.offset.every(Number.isFinite)
            ? [value.offset[0], value.offset[1]]
            : null;
        fresh.follows[tokenId] = { leaderId: toText(value.leaderId), offset };
      }
    }
  }
  if (isRecord(raw.leaders)) {
    for (const [playerId, tokenId] of Object.entries(raw.leaders)) {
      if (toText(tokenId)) {
        fresh.leaders[playerId] = toText(tokenId);
      }
    }
  }
  if (isRecord(raw.recordings)) {
    for (const [id, rec] of Object.entries(raw.recordings)) {
      if (
        isRecord(rec) &&
        toText(rec.tokenId) &&
        cleanName(rec.name) &&
        Array.isArray(rec.entries)
      ) {
        fresh.recordings[id] = {
          id,
          name: cleanName(rec.name),
          tokenId: toText(rec.tokenId),
          pageId: toText(rec.pageId),
          entries: normalisePoints(rec.entries),
        };
      }
    }
  }
  if (isRecord(raw.calibrations)) {
    for (const [pageId, cal] of Object.entries(raw.calibrations)) {
      if (isRecord(cal) && [cal.dx, cal.dy, cal.scale].every(Number.isFinite) && cal.scale > 0) {
        fresh.calibrations[pageId] = { dx: cal.dx, dy: cal.dy, scale: cal.scale };
      }
    }
  }
  if (isRecord(raw.combat)) {
    fresh.combat = {
      manual: raw.combat.manual === true,
      active: raw.combat.active === true,
      turnId: toText(raw.combat.turnId) || null,
    };
  }
  fresh.paused = raw.paused === true;
  if (isRecord(raw.notices)) {
    fresh.notices = { ...raw.notices };
  }
  return { state: fresh, migratedFrom: null };
}

// ---------------------------------------------------------------------------
// Persistent state access (Roll20)
// ---------------------------------------------------------------------------

/**
 * Loads, migrates and validates the persistent state. Call once on ready.
 *
 * @returns {number|null} The major version migrated from, or null.
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
 * Imports Roll20 One-Click useroptions into the persisted config. Options are
 * only re-applied when the GM changes them, so chat changes survive restarts.
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
// Routes
// ---------------------------------------------------------------------------

/**
 * Returns every route, sorted by name.
 *
 * @returns {object[]} Routes.
 */
export function listRoutes() {
  return Object.values(getState().routes).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

/**
 * Finds a route by `#id` or by name (case-insensitive).
 *
 * @param {string} ref Route reference.
 * @returns {object|null} Route.
 */
export function findRoute(ref) {
  const text = toText(ref);
  if (!text) {
    return null;
  }
  const routes = getState().routes;
  if (text.startsWith('#')) {
    return routes[text.slice(1)] || null;
  }
  const lower = cleanName(text).toLowerCase();
  return Object.values(routes).find((r) => r.name.toLowerCase() === lower) || null;
}

/**
 * Adds a route, giving it a new ID.
 *
 * @param {object} fields Route fields (name, kind, code or points, options).
 * @returns {object|null} The stored route, or null when invalid.
 */
export function addRoute(fields) {
  const s = getState();
  const route = normaliseRoute({ ...fields, id: `r${s.nextId}` });
  if (!route) {
    return null;
  }
  s.nextId++;
  s.routes[route.id] = route;
  return route;
}

/**
 * Replaces a route's fields, keeping its ID.
 *
 * @param {string} id Route ID.
 * @param {object} fields Fields to change.
 * @returns {object|null} The updated route, or null when the result is invalid.
 */
export function updateRoute(id, fields) {
  const s = getState();
  const current = s.routes[id];
  if (!current) {
    return null;
  }
  const route = normaliseRoute({ ...current, ...fields, id });
  if (route) {
    s.routes[id] = route;
  }
  return route;
}

/**
 * Removes a route and any patrols on it.
 *
 * @param {string} id Route ID.
 * @returns {string[]} IDs of tokens that were on the route.
 */
export function deleteRoute(id) {
  const s = getState();
  delete s.routes[id];
  const stopped = [];
  for (const [tokenId, patrol] of Object.entries(s.patrols)) {
    if (patrol.routeId === id) {
      delete s.patrols[tokenId];
      stopped.push(tokenId);
    }
  }
  return stopped;
}

// ---------------------------------------------------------------------------
// Patrols, locks, follows and recordings
// ---------------------------------------------------------------------------

/**
 * Returns all patrols keyed by token ID.
 *
 * @returns {object} Patrols.
 */
export function getPatrols() {
  return getState().patrols;
}

/**
 * Returns all locks keyed by token ID.
 *
 * @returns {object} Locks.
 */
export function getLocks() {
  return getState().locks;
}

/**
 * Returns all follows keyed by follower token ID.
 *
 * @returns {object} Follows.
 */
export function getFollows() {
  return getState().follows;
}

/**
 * Returns all recordings keyed by ID.
 *
 * @returns {object} Recordings.
 */
export function getRecordings() {
  return getState().recordings;
}

/**
 * Creates a recording session.
 *
 * @param {string} name Route name to save as.
 * @param {string} tokenId Token being recorded.
 * @param {string} pageId Token's page.
 * @param {number[]} start [x, y] start position.
 * @returns {object} Recording.
 */
export function addRecording(name, tokenId, pageId, start) {
  const s = getState();
  const id = `d${s.nextId++}`;
  s.recordings[id] = {
    id,
    name,
    tokenId,
    pageId,
    entries: [{ x: start[0], y: start[1] }],
  };
  return s.recordings[id];
}

/**
 * Finds a recording by `#id` or by name (case-insensitive).
 *
 * @param {string} ref Recording reference.
 * @returns {object|null} Recording.
 */
export function findRecording(ref) {
  const text = toText(ref);
  const recordings = getState().recordings;
  if (text.startsWith('#')) {
    return recordings[text.slice(1)] || null;
  }
  const lower = cleanName(text).toLowerCase();
  return Object.values(recordings).find((r) => r.name.toLowerCase() === lower) || null;
}

/**
 * Returns the recording a token is being recorded in.
 *
 * @param {string} tokenId Token ID.
 * @returns {object|null} Recording.
 */
export function getRecordingForToken(tokenId) {
  return Object.values(getState().recordings).find((r) => r.tokenId === tokenId) || null;
}

/**
 * Returns a page's grid calibration.
 *
 * @param {string} pageId Page ID.
 * @returns {object|null} Calibration.
 */
export function getCalibration(pageId) {
  return getState().calibrations[pageId] || null;
}

/**
 * Stores or clears a page's grid calibration.
 *
 * @param {string} pageId Page ID.
 * @param {object|null} calibration Calibration, or null to clear.
 * @returns {void}
 */
export function setCalibration(pageId, calibration) {
  const calibrations = getState().calibrations;
  if (calibration) {
    calibrations[pageId] = { ...calibration };
  } else {
    delete calibrations[pageId];
  }
}

/**
 * Forgets everything stored about a token.
 *
 * @param {string} tokenId Token ID.
 * @returns {void}
 */
export function forgetToken(tokenId) {
  const s = getState();
  delete s.patrols[tokenId];
  delete s.locks[tokenId];
  delete s.follows[tokenId];
  for (const [followerId, follow] of Object.entries(s.follows)) {
    if (follow.leaderId === tokenId) {
      delete s.follows[followerId];
    }
  }
  for (const [playerId, leaderId] of Object.entries(s.leaders)) {
    if (leaderId === tokenId) {
      delete s.leaders[playerId];
    }
  }
  for (const [id, rec] of Object.entries(s.recordings)) {
    if (rec.tokenId === tokenId) {
      delete s.recordings[id];
    }
  }
}
