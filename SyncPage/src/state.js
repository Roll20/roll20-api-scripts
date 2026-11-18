// Persistent state: state.SyncPage. Settings, sync groups (pages, links,
// hidden copies, player layout, recycle bin, repair log), each GM's last
// choices, pending button requests and one-time notices.

import {
  LAYERS,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  SETTINGS,
  STATE_KEY,
  SYNC_TYPES,
} from './constants.js';
import { getLocale, normalizeLocale } from './i18n.js';
import { clamp, isRecord, parseBoolean, splitList, toNumber, toText } from './utils.js';

/**
 * @typedef {object} Link
 * @property {string} type Roll20 object type.
 * @property {Record<string, string>} objects Object ID by page ID.
 * @property {string} [print] Fingerprint of the source object when last matched.
 */

/**
 * @typedef {object} Group
 * @property {string} id Group ID.
 * @property {string} name Name the GM gave it.
 * @property {string} source Source page ID (the reference for repair).
 * @property {string[]} pages Page IDs, source first.
 * @property {object} overrides Settings changed for this group only.
 * @property {Record<string, Link>} links Linked objects by link ID.
 * @property {Record<string, Record<string, {layer: string, snapshot?: object}>>} hidden
 *   Hidden copies: by link ID, then page ID.
 * @property {Record<string, string>} layout Remembered page for each player.
 * @property {object[]} recycle Snapshots of removed objects, newest first.
 * @property {object|null} repairLog The last repair.
 * @property {string[]} pageOnly Objects the GM chose to keep on one page.
 * @property {boolean} paused True while mirroring is paused.
 */

/**
 * Returns the default value of every setting.
 *
 * @returns {object} Settings.
 */
export function defaultSettings() {
  const out = {};
  for (const s of SETTINGS) {
    out[s.key] = Array.isArray(s.default) ? [...s.default] : s.default;
  }
  return out;
}

/**
 * Returns a fresh, empty state.
 *
 * @returns {object} State.
 */
export function createDefaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    version: SCRIPT_VERSION,
    settings: defaultSettings(),
    groups: {},
    gm: {},
    requests: {},
    aliases: [],
    notices: { useroptions: {}, migrated: false, trueCopy: false },
  };
}

/**
 * Returns the setting definition for a key.
 *
 * @param {string} key Setting key.
 * @returns {object|undefined} Definition.
 */
export function settingDef(key) {
  return SETTINGS.find((s) => s.key === key);
}

/**
 * Finds a setting key, ignoring case.
 *
 * @param {string} raw Typed key.
 * @returns {string|null} Key, or null when unknown.
 */
export function findSettingKey(raw) {
  const text = toText(raw).toLowerCase();
  return SETTINGS.find((s) => s.key.toLowerCase() === text)?.key || null;
}

/**
 * Checks and converts a setting value.
 *
 * @param {object} def Setting definition.
 * @param {*} raw Raw value. For multi settings, a list (`a,b`), or changes to
 *   `current` such as `+vision -gmnotes`.
 * @param {*} [current] Current value, for multi-setting changes.
 * @returns {{ok: boolean, value?: *}} Result.
 */
export function normaliseSetting(def, raw, current) {
  if (!def) {
    return { ok: false };
  }
  if (def.type === 'boolean') {
    const value = parseBoolean(raw);
    return value === null ? { ok: false } : { ok: true, value };
  }
  if (def.type === 'number') {
    const n = toNumber(raw);
    return n === null ? { ok: false } : { ok: true, value: clamp(Math.round(n), def.min, def.max) };
  }
  if (def.type === 'locale') {
    const value = normalizeLocale(toText(raw));
    return value ? { ok: true, value } : { ok: false };
  }
  if (def.type === 'choice') {
    const text = toText(raw).toLowerCase();
    const value = def.options.find((o) => o.toLowerCase() === text);
    return value ? { ok: true, value } : { ok: false };
  }
  if (def.type === 'multi') {
    const words = Array.isArray(raw)
      ? raw.map(toText)
      : toText(raw)
          .split(/[\s,]+/)
          .filter(Boolean);
    const find = (w) => def.options.find((o) => o.toLowerCase() === w.toLowerCase());
    const relative = words.length > 0 && words.every((w) => /^[+-]/.test(w));
    if (words.length === 1 && ['none', '-', 'clear'].includes(words[0].toLowerCase())) {
      return { ok: true, value: [] };
    }
    const set = new Set(relative && Array.isArray(current) ? current : []);
    for (const w of words) {
      const name = find(w.replace(/^[+-]/, ''));
      if (!name) {
        return { ok: false };
      }
      if (w.startsWith('-')) {
        set.delete(name);
      } else {
        set.add(name);
      }
    }
    return { ok: true, value: def.options.filter((o) => set.has(o)) };
  }
  return { ok: false };
}

/**
 * Cleans a stored settings object, keeping only valid values.
 *
 * @param {*} raw Stored settings.
 * @param {boolean} [partial=false] Keep only keys present (group overrides).
 * @returns {object} Clean settings.
 */
export function cleanSettings(raw, partial = false) {
  const src = isRecord(raw) ? raw : {};
  const out = partial ? {} : defaultSettings();
  for (const def of SETTINGS) {
    if (!(def.key in src)) {
      continue;
    }
    if (partial && def.scope !== 'group') {
      continue;
    }
    const result = normaliseSetting(def, src[def.key]);
    if (result.ok) {
      out[def.key] = result.value;
    }
  }
  return out;
}

/**
 * Cleans one stored group.
 *
 * @param {string} id Group ID.
 * @param {*} raw Stored group.
 * @returns {Group|null} Clean group, or null when it is not usable.
 */
export function cleanGroup(id, raw) {
  if (!isRecord(raw)) {
    return null;
  }
  const pages = Array.isArray(raw.pages) ? [...new Set(raw.pages.map(toText).filter(Boolean))] : [];
  const source = pages.includes(raw.source) ? raw.source : pages[0];
  if (!source) {
    return null;
  }
  const links = {};
  for (const [linkId, link] of Object.entries(isRecord(raw.links) ? raw.links : {})) {
    if (!isRecord(link) || !SYNC_TYPES.includes(link.type) || !isRecord(link.objects)) {
      continue;
    }
    const objects = {};
    for (const [pageId, objId] of Object.entries(link.objects)) {
      if (pages.includes(pageId) && toText(objId)) {
        objects[pageId] = toText(objId);
      }
    }
    links[linkId] = {
      type: link.type,
      objects,
      ...(link.print ? { print: toText(link.print) } : {}),
    };
  }
  const hidden = {};
  for (const [linkId, byPage] of Object.entries(isRecord(raw.hidden) ? raw.hidden : {})) {
    if (!links[linkId] || !isRecord(byPage)) {
      continue;
    }
    for (const [pageId, h] of Object.entries(byPage)) {
      if (!pages.includes(pageId) || !isRecord(h)) {
        continue;
      }
      hidden[linkId] = hidden[linkId] || {};
      hidden[linkId][pageId] = {
        layer: LAYERS.includes(h.layer) ? h.layer : 'objects',
        ...(isRecord(h.snapshot) ? { snapshot: h.snapshot } : {}),
      };
    }
  }
  const layout = {};
  for (const [playerId, pageId] of Object.entries(isRecord(raw.layout) ? raw.layout : {})) {
    if (toText(pageId)) {
      layout[playerId] = toText(pageId);
    }
  }
  return {
    id,
    name: toText(raw.name) || id,
    source,
    pages: [source, ...pages.filter((p) => p !== source)],
    overrides: cleanSettings(raw.overrides, true),
    links,
    hidden,
    layout,
    recycle: Array.isArray(raw.recycle) ? raw.recycle.filter(isRecord) : [],
    repairLog: isRecord(raw.repairLog) ? raw.repairLog : null,
    pageOnly: Array.isArray(raw.pageOnly)
      ? [...new Set(raw.pageOnly.map(toText).filter(Boolean))]
      : [],
    paused: raw.paused === true,
  };
}

/**
 * Coerces a stored state into the current shape, filling defaults. Runs after
 * any stepped schema migration, so a hand-edited or half-written state still
 * loads.
 *
 * @param {*} raw Stored state.
 * @returns {object} Clean state.
 */
export function cleanState(raw) {
  const src = isRecord(raw) ? raw : {};
  const base = createDefaultState();
  const groups = {};
  for (const [id, g] of Object.entries(isRecord(src.groups) ? src.groups : {})) {
    const clean = cleanGroup(id, g);
    if (clean) {
      groups[id] = clean;
    }
  }
  const gm = {};
  for (const [playerId, rec] of Object.entries(isRecord(src.gm) ? src.gm : {})) {
    if (isRecord(rec)) {
      gm[playerId] = {
        lastGroup: toText(rec.lastGroup) || null,
        lastPages: Array.isArray(rec.lastPages) ? rec.lastPages.map(toText).filter(Boolean) : [],
      };
    }
  }
  const requests = {};
  for (const [id, r] of Object.entries(isRecord(src.requests) ? src.requests : {})) {
    if (isRecord(r) && toText(r.kind) && Number.isFinite(r.at)) {
      requests[id] = { kind: r.kind, gm: toText(r.gm), at: r.at, payload: r.payload ?? null };
    }
  }
  const notices = isRecord(src.notices) ? src.notices : {};
  return {
    ...base,
    settings: cleanSettings(src.settings),
    groups,
    gm,
    requests,
    aliases: Array.isArray(src.aliases)
      ? src.aliases.map((a) => toText(a).toLowerCase()).filter((a) => /^![a-z0-9_-]+$/.test(a))
      : [],
    notices: {
      useroptions: isRecord(notices.useroptions) ? notices.useroptions : {},
      migrated: notices.migrated === true,
      trueCopy: notices.trueCopy === true,
    },
  };
}

/**
 * Returns the live state, creating it when missing.
 *
 * @returns {object} State.
 */
export function getState() {
  if (!isRecord(state[STATE_KEY])) {
    state[STATE_KEY] = createDefaultState();
  }
  return state[STATE_KEY];
}

/**
 * Loads and cleans the state on start.
 *
 * @returns {{fresh: boolean}} Whether this is a new install.
 */
export function initialiseState() {
  const fresh = !isRecord(state[STATE_KEY]);
  state[STATE_KEY] = cleanState(state[STATE_KEY]);
  state[STATE_KEY].schemaVersion = SCHEMA_VERSION;
  state[STATE_KEY].version = SCRIPT_VERSION;
  return { fresh };
}

/**
 * Returns the GM-facing language.
 *
 * @returns {string} Locale code.
 */
export function getLang() {
  return getLocale(getState().settings.language);
}

/**
 * Returns a setting's value, using the group's override when there is one.
 *
 * @param {string} key Setting key.
 * @param {Group|string|null} [group] Group or group ID.
 * @returns {*} Value.
 */
export function getSetting(key, group) {
  const s = getState();
  const g = typeof group === 'string' ? s.groups[group] : group;
  if (g && isRecord(g.overrides) && key in g.overrides) {
    return g.overrides[key];
  }
  if (key in s.settings) {
    return s.settings[key];
  }
  return settingDef(key)?.default;
}

/**
 * Changes a setting globally or for one group.
 *
 * @param {string} key Setting key.
 * @param {*} raw Raw value; `default` clears a group override.
 * @param {Group|null} [group] Group, for a group override.
 * @returns {{ok: boolean, value?: *, cleared?: boolean, reason?: string}} Result.
 */
export function setSetting(key, raw, group = null) {
  const def = settingDef(key);
  if (!def) {
    return { ok: false, reason: 'unknownSetting' };
  }
  if (group && def.scope !== 'group') {
    return { ok: false, reason: 'globalOnly' };
  }
  if (group && ['default', 'global', 'inherit'].includes(toText(raw).toLowerCase())) {
    delete group.overrides[key];
    return { ok: true, cleared: true, value: getSetting(key) };
  }
  const result = normaliseSetting(def, raw, getSetting(key, group));
  if (!result.ok) {
    return { ok: false, reason: 'badValue' };
  }
  if (group) {
    group.overrides[key] = result.value;
  } else {
    getState().settings[key] = result.value;
  }
  return { ok: true, value: result.value };
}

/**
 * Restores every setting to its default, globally or for one group.
 *
 * @param {Group|null} [group] Group.
 * @returns {void}
 */
export function resetSettings(group = null) {
  if (group) {
    group.overrides = {};
  } else {
    getState().settings = { ...defaultSettings(), language: getState().settings.language };
  }
}

/**
 * Finds the One-Click useroptions branch for this Mod. Roll20 keys it by the
 * script name.
 *
 * @returns {object|null} The options, or null when there are none.
 */
function oneClickOptions() {
  if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
    return null;
  }
  const key = Object.keys(globalconfig).find(
    (k) => k.toLowerCase().replaceAll(/[^a-z]/g, '') === 'syncpage'
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
  const applied = s.notices.useroptions;
  const changed = [];
  for (const def of SETTINGS) {
    if (!(def.key in options)) {
      continue;
    }
    // An unticked checkbox arrives as false; multi settings arrive as text.
    let raw = options[def.key];
    if (raw === false && def.type === 'boolean') {
      raw = 'off';
    }
    if (def.type === 'multi') {
      raw = splitList(raw).join(',') || 'none';
    }
    if (raw === applied[def.key]) {
      continue;
    }
    applied[def.key] = raw;
    if (setSetting(def.key, raw).ok) {
      changed.push(def.key);
    }
  }
  return changed;
}

/**
 * Returns a GM's remembered choices, creating the record.
 *
 * @param {string} playerId Player ID.
 * @returns {{lastGroup: string|null, lastPages: string[]}} Record.
 */
export function gmMemory(playerId) {
  const s = getState();
  if (!isRecord(s.gm[playerId])) {
    s.gm[playerId] = { lastGroup: null, lastPages: [] };
  }
  return s.gm[playerId];
}
