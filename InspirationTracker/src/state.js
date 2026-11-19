import {
  ANNOUNCE_OPTIONS,
  DEFAULT_CONFIG,
  DEFAULT_POOL,
  FX_COLOURS,
  FX_TYPES,
  LEGACY_STATE_KEY,
  MAX_POINTS,
  MAX_POOLS,
  MAX_UNDO,
  OFFER_LIFETIME_MS,
  POOL_SOURCES,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  STATE_KEY,
  TRACKING_OPTIONS,
  USEROPTION_KEYS,
  WORDING_OPTIONS,
} from './constants.js';
import { normalizeLocale } from './i18n.js';
import { isRecord, parseBoolean, shortId, toText } from './utils.js';

// ---------------------------------------------------------------------------
// Value validation (pure)
// ---------------------------------------------------------------------------

/**
 * Returns true when text names a built-in special effect ("nova-holy") or
 * looks like the ID of a custom one.
 *
 * @param {string} text Effect name.
 * @returns {boolean} True when usable with spawnFx.
 */
export function isFxType(text) {
  const [type, colour, extra] = text.split('-');
  if (extra === undefined && FX_TYPES.includes(type) && FX_COLOURS.includes(colour)) {
    return true;
  }
  // Custom effects are referred to by their custfx object ID.
  return /^-[\w-]{6,}$/.test(text);
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
  const flag = () => {
    const b = parseBoolean(raw);
    return b === null ? bad : ok(b);
  };

  switch (key) {
    case 'language': {
      const lang = normalizeLocale(raw);
      return lang ? ok(lang) : bad;
    }
    case 'marker': {
      // An empty marker means the GM chose None: no marker is put on tokens.
      const text = toText(raw);
      return text === '' || /^[^,@\s][^,@]{0,99}$/.test(text) ? ok(text) : bad;
    }
    case 'tracking':
      return option(TRACKING_OPTIONS);
    case 'wording':
      return option(WORDING_OPTIONS);
    case 'announce':
      return option(ANNOUNCE_OPTIONS);
    case 'fxType': {
      const text = toText(raw);
      return isFxType(text) ? ok(text) : bad;
    }
    case 'fx':
    case 'playerSpend':
    case 'playerOverview':
    case 'passOn':
      return flag();
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
 * Converts 0.1.x settings into the new config. Its command name is kept as
 * an extra command, so the GM's macros keep working.
 *
 * @param {object} legacy state.INSPIRATIONTRACKER.
 * @returns {{config: object, command: string}} Converted settings.
 */
export function convertLegacyConfig(legacy) {
  const old = isRecord(legacy?.config) ? legacy.config : {};
  const config = mergeConfig({
    marker: old.statusmarker,
    fx: old.fx,
    fxType: old.fx_type,
  });
  const command = toText(old.command).replace(/^!/, '');
  return {
    config,
    command: /^[\w-]{1,40}$/.test(command) && command !== 'inspiration' ? command : '',
  };
}

// ---------------------------------------------------------------------------
// Persistent state
// ---------------------------------------------------------------------------

/**
 * Builds empty state.
 *
 * @returns {object} State.
 */
function freshState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    config: { ...DEFAULT_CONFIG },
    legacyCommand: '',
    known: {},
    pools: [{ ...DEFAULT_POOL }],
    points: {},
    party: { include: [], exclude: [] },
    undo: [],
    offers: {},
    notices: {},
  };
}

/**
 * Returns the Mod's state, creating it when missing.
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
 * Returns the current configuration.
 *
 * @returns {object} Config.
 */
export function getConfig() {
  return getState().config;
}

/**
 * Creates, repairs or upgrades the state. 0.1.x settings are copied the first
 * time; the old state is left in place so a downgrade still works.
 *
 * @returns {{migrated: boolean, command: string}} Whether 0.1.x settings were taken over.
 */
export function initialiseState() {
  const existing = state[STATE_KEY];
  let migrated = false;
  if (!isRecord(existing)) {
    const s = freshState();
    if (isRecord(state[LEGACY_STATE_KEY])) {
      const converted = convertLegacyConfig(state[LEGACY_STATE_KEY]);
      s.config = converted.config;
      s.legacyCommand = converted.command;
      migrated = true;
    }
    state[STATE_KEY] = s;
  }
  const s = state[STATE_KEY];
  const base = freshState();
  for (const key of Object.keys(base)) {
    if (key === 'config') {
      continue;
    }
    const wantsArray = Array.isArray(base[key]);
    const ok = wantsArray ? Array.isArray(s[key]) : typeof s[key] === typeof base[key];
    if (!ok || (!wantsArray && typeof base[key] === 'object' && !isRecord(s[key]))) {
      s[key] = base[key];
    }
  }
  if (!Array.isArray(s.party.include)) {
    s.party.include = [];
  }
  if (!Array.isArray(s.party.exclude)) {
    s.party.exclude = [];
  }
  s.config = mergeConfig(s.config);
  s.pools = repairPools(s.pools);
  s.schemaVersion = SCHEMA_VERSION;
  s.version = SCRIPT_VERSION;
  pruneOffers();
  return { migrated, command: s.legacyCommand };
}

/**
 * Sets one configuration value.
 *
 * @param {string} key Config key.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Validation result.
 */
export function setConfigValue(key, raw) {
  const result = validateConfigValue(key, raw);
  if (result.valid) {
    getConfig()[key] = result.value;
  }
  return result;
}

/**
 * Puts every setting back to its default, keeping the language.
 *
 * @returns {void}
 */
export function resetConfig() {
  const s = getState();
  s.config = { ...DEFAULT_CONFIG, language: s.config.language };
}

/**
 * Applies One-Click useroptions that changed since they were last applied, so
 * a GM's later chat changes are not overwritten on every restart.
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

// ---------------------------------------------------------------------------
// Last known values. The 2024 sheet's change event already carries the new
// value as "previous", so changes are found by comparing with these.
// ---------------------------------------------------------------------------

/**
 * Returns the last inspiration value seen for a character.
 *
 * @param {string} charId Character ID.
 * @returns {boolean|undefined} Last value, or undefined when not seen yet.
 */
export function getKnown(charId) {
  const value = getState().known[charId];
  return typeof value === 'boolean' ? value : undefined;
}

/**
 * Records the inspiration value seen for a character.
 *
 * @param {string} charId Character ID.
 * @param {boolean|undefined} inspired Value, or undefined to forget it.
 * @returns {void}
 */
export function setKnown(charId, inspired) {
  if (inspired === undefined) {
    delete getState().known[charId];
  } else {
    getState().known[charId] = Boolean(inspired);
  }
}

/**
 * Forgets everything kept about a character that was deleted.
 *
 * @param {string} charId Character ID.
 * @returns {void}
 */
export function forgetCharacter(charId) {
  const s = getState();
  delete s.known[charId];
  for (const values of Object.values(s.points)) {
    if (isRecord(values)) {
      delete values[charId];
    }
  }
  s.party.include = s.party.include.filter((id) => id !== charId);
  s.party.exclude = s.party.exclude.filter((id) => id !== charId);
  for (const [id, offer] of Object.entries(s.offers)) {
    if (offer.charId === charId) {
      delete s.offers[id];
    }
  }
}

// ---------------------------------------------------------------------------
// Points pools
// ---------------------------------------------------------------------------

/**
 * Turns a pool name into its ID: lower-case letters, digits and hyphens.
 *
 * @param {string} name Pool name.
 * @returns {string} ID, or an empty string when the name has no letters or digits.
 */
export function poolId(name) {
  return toText(name)
    .toLowerCase()
    .normalize('NFKD')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 30);
}

/**
 * Validates one field of a pool.
 *
 * @param {string} field name | source | cost | max | marker.
 * @param {*} raw Raw value.
 * @returns {{valid: boolean, value?: *}} Result; `value` is the normalised value when valid.
 */
export function validatePoolField(field, raw) {
  const ok = (value) => ({ valid: true, value });
  const bad = { valid: false };
  const text = toText(raw);
  const whole = /^\d{1,4}$/.test(text) ? Number(text) : NaN;
  switch (field) {
    case 'name':
      return /^[^<>{}|@[\]]{1,40}$/.test(text) && poolId(text) ? ok(text) : bad;
    case 'source': {
      const found = POOL_SOURCES.find((o) => o === text.toLowerCase());
      return found ? ok(found) : bad;
    }
    case 'cost':
      return whole >= 1 && whole <= 100 ? ok(whole) : bad;
    case 'max':
      return whole >= 0 && whole <= MAX_POINTS ? ok(whole) : bad;
    case 'marker':
      return text === '' || /^[^,@\s][^,@]{0,99}$/.test(text) ? ok(text) : bad;
    default:
      return bad;
  }
}

/**
 * Repairs the stored pools: valid fields, unique IDs, and the default pool
 * first.
 *
 * @param {*} pools Stored pools.
 * @returns {object[]} Pools.
 */
export function repairPools(pools) {
  const repaired = [];
  for (const raw of Array.isArray(pools) ? pools : []) {
    if (!isRecord(raw) || repaired.length >= MAX_POOLS) {
      continue;
    }
    const name = validatePoolField('name', raw.name);
    const id = poolId(raw.id) || (name.valid ? poolId(name.value) : '');
    if (!name.valid || !id || repaired.some((p) => p.id === id)) {
      continue;
    }
    const pool = { ...DEFAULT_POOL, id, name: name.value };
    for (const field of ['source', 'cost', 'max', 'marker']) {
      const result = validatePoolField(field, raw[field]);
      if (result.valid) {
        pool[field] = result.value;
      }
    }
    repaired.push(pool);
  }
  if (repaired.length === 0) {
    repaired.push({ ...DEFAULT_POOL });
  }
  return repaired;
}

/**
 * Returns every pool, the default pool first.
 *
 * @returns {object[]} Pools.
 */
export function getPools() {
  return getState().pools;
}

/**
 * Returns the default pool: the one used by commands that name no pool while
 * Tracking is set to a points pool.
 *
 * @returns {object} Pool.
 */
export function defaultPool() {
  return getPools()[0];
}

/**
 * Finds a pool by its ID or its name, whatever the case.
 *
 * @param {string} text Pool ID or name.
 * @returns {object|undefined} Pool.
 */
export function findPool(text) {
  const wanted = toText(text).toLowerCase();
  const id = poolId(text);
  return getPools().find((p) => p.id === wanted || p.name.toLowerCase() === wanted || p.id === id);
}

/**
 * Adds a pool.
 *
 * @param {string} name Pool name.
 * @returns {{status: string, pool?: object}} added | invalid | exists | full.
 */
export function addPool(name) {
  const result = validatePoolField('name', name);
  if (!result.valid) {
    return { status: 'invalid' };
  }
  if (findPool(result.value)) {
    return { status: 'exists' };
  }
  const pools = getPools();
  if (pools.length >= MAX_POOLS) {
    return { status: 'full' };
  }
  const pool = { ...DEFAULT_POOL, id: poolId(result.value), name: result.value };
  pools.push(pool);
  return { status: 'added', pool };
}

/**
 * Deletes a pool. The default pool stays. The points on the sheets are left
 * as they are.
 *
 * @param {object} pool Pool.
 * @returns {boolean} True when deleted.
 */
export function deletePool(pool) {
  const s = getState();
  const index = s.pools.indexOf(pool);
  if (index <= 0) {
    return false;
  }
  s.pools.splice(index, 1);
  delete s.points[pool.id];
  return true;
}

/**
 * Returns the points last seen for a character in a pool.
 *
 * @param {string} id Pool ID.
 * @param {string} charId Character ID.
 * @returns {number} Points, 0 when not seen yet.
 */
export function getPoints(id, charId) {
  const value = getState().points[id]?.[charId];
  return typeof value === 'number' ? value : 0;
}

/**
 * Records the points seen for a character in a pool.
 *
 * @param {string} id Pool ID.
 * @param {string} charId Character ID.
 * @param {number} value Points.
 * @returns {void}
 */
export function setPoints(id, charId, value) {
  const points = getState().points;
  if (!isRecord(points[id])) {
    points[id] = {};
  }
  if (value > 0) {
    points[id][charId] = value;
  } else {
    delete points[id][charId];
  }
}

// ---------------------------------------------------------------------------
// Party membership chosen by the GM
// ---------------------------------------------------------------------------

/**
 * Adds a character to the party, or takes it out.
 *
 * @param {string} charId Character ID.
 * @param {boolean} member True to add.
 * @returns {void}
 */
export function setPartyMember(charId, member) {
  const party = getState().party;
  party.include = party.include.filter((id) => id !== charId);
  party.exclude = party.exclude.filter((id) => id !== charId);
  (member ? party.include : party.exclude).push(charId);
}

/**
 * Returns the GM's party choices.
 *
 * @returns {{include: string[], exclude: string[]}} Choices.
 */
export function getPartyChoices() {
  return getState().party;
}

// ---------------------------------------------------------------------------
// Undo for spends
// ---------------------------------------------------------------------------

/**
 * Remembers a spend so the GM can undo it.
 *
 * @param {string} charId Character ID.
 * @param {string} playerId Who spent it.
 * @param {number} now Current time.
 * @param {{poolId: string, amount: number}} [points] The pool and points spent, for a pool spend.
 * @returns {string} Undo ID.
 */
export function pushUndo(charId, playerId, now, points) {
  const s = getState();
  const id = shortId();
  s.undo.push({ id, charId, playerId, at: now, ...(points || {}) });
  while (s.undo.length > MAX_UNDO) {
    s.undo.shift();
  }
  return id;
}

/**
 * Takes an undo entry, so each can be used once.
 *
 * @param {string} id Undo ID.
 * @returns {object|null} The entry, or null when unknown.
 */
export function takeUndo(id) {
  const s = getState();
  const index = s.undo.findIndex((entry) => entry.id === id);
  return index < 0 ? null : s.undo.splice(index, 1)[0];
}

// ---------------------------------------------------------------------------
// Offers to pass Heroic Inspiration on (2024 rules)
// ---------------------------------------------------------------------------

/**
 * Opens an offer for a character's owner to give Heroic Inspiration away.
 *
 * @param {string} charId Character that would have gained it.
 * @param {number} now Current time.
 * @returns {string} Offer ID.
 */
export function createOffer(charId, now) {
  const id = shortId();
  getState().offers[id] = { charId, at: now };
  return id;
}

/**
 * Takes an open offer, so each can be used once.
 *
 * @param {string} id Offer ID.
 * @param {number} now Current time.
 * @returns {object|null} The offer, or null when unknown or expired.
 */
export function takeOffer(id, now) {
  const offers = getState().offers;
  const offer = offers[id];
  delete offers[id];
  return offer && now - offer.at <= OFFER_LIFETIME_MS ? offer : null;
}

/**
 * Puts back an offer that could not be used yet.
 *
 * @param {string} id Offer ID.
 * @param {object} offer Offer.
 * @returns {void}
 */
export function restoreOffer(id, offer) {
  getState().offers[id] = offer;
}

/**
 * Drops expired offers.
 *
 * @param {number} [now] Current time.
 * @returns {void}
 */
export function pruneOffers(now = Date.now()) {
  const offers = getState().offers;
  for (const [id, offer] of Object.entries(offers)) {
    if (!isRecord(offer) || now - offer.at > OFFER_LIFETIME_MS) {
      delete offers[id];
    }
  }
}

/**
 * Returns true the first time it is called for a key, so a hint is shown once.
 *
 * @param {string} key Notice key.
 * @returns {boolean} True the first time.
 */
export function takeNoticeOnce(key) {
  const notices = getState().notices;
  if (notices[key]) {
    return false;
  }
  notices[key] = true;
  return true;
}
