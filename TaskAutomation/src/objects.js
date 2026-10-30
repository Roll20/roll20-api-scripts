// Reading Roll20 objects for tasks: binding resolution, targets, allowlisted
// property reads, control checks and multi-sided tokens (plan §4.1).

import {
  ATTRIBUTE_READ_PROPERTIES,
  CHARACTER_READ_PROPERTIES,
  PAGE_READ_PROPERTIES,
  PLAYER_READ_PROPERTIES,
  TOKEN_READ_PROPERTIES,
} from './constants.js';
import { findObjects, getObject, isGm } from './host.js';
import { isRecord, parseMarkers, toText } from './utils.js';

const READABLE = {
  graphic: TOKEN_READ_PROPERTIES,
  attribute: ATTRIBUTE_READ_PROPERTIES,
  character: CHARACTER_READ_PROPERTIES,
  player: PLAYER_READ_PROPERTIES,
  page: PAGE_READ_PROPERTIES,
  jukeboxtrack: ['title', 'playing', 'volume', 'loop'],
};

// Roll20 stores a few properties under other names.
const PROPERTY_ALIASES = {
  pageid: '_pageid',
  represents: 'represents',
  online: '_online',
  currentSide: 'currentSide',
};

/**
 * Returns a Roll20 object of a type, treating graphics that are not tokens
 * (cards, map images) as missing.
 *
 * @param {string} type Object type.
 * @param {string} id Object ID.
 * @returns {object|null} Object.
 */
export function getTarget(type, id) {
  const obj = getObject(type, id);
  if (obj && type === 'graphic' && obj.get('_subtype') !== 'token') {
    return null;
  }
  return obj;
}

/**
 * Finds the type of an object ID among the types tasks use.
 *
 * @param {string} id Object ID.
 * @returns {{type: string, obj: object}|null} Type and object.
 */
export function findAnyTarget(id) {
  for (const type of ['graphic', 'character', 'attribute', 'player', 'page', 'jukeboxtrack']) {
    const obj = getTarget(type, id);
    if (obj) {
      return { type, obj };
    }
  }
  return null;
}

/**
 * Reads an allowlisted property, returning plain data only.
 *
 * @param {object} obj Roll20 object.
 * @param {string} type Object type.
 * @param {string} prop Property.
 * @returns {{found: boolean, value?: *}} Result.
 */
export function readProperty(obj, type, prop) {
  if (prop === 'id') {
    return { found: true, value: obj.id };
  }
  if (!(READABLE[type] || []).includes(prop)) {
    return { found: false };
  }
  let value = obj.get(PROPERTY_ALIASES[prop] || prop);
  if (value === undefined && PROPERTY_ALIASES[prop]) {
    value = obj.get(prop);
  }
  if (value === undefined || value === null) {
    return { found: false };
  }
  if (typeof value === 'object') {
    return { found: false };
  }
  return { found: true, value };
}

/**
 * Takes a compact snapshot of a token's allowlisted properties.
 *
 * @param {object} obj Roll20 object or a plain attribute map.
 * @param {string} type Object type.
 * @returns {object} Snapshot.
 */
export function snapshot(obj, type) {
  const out = {};
  const get = typeof obj?.get === 'function' ? (k) => obj.get(k) : (k) => obj?.[k];
  for (const prop of READABLE[type] || []) {
    let value = get(PROPERTY_ALIASES[prop] || prop);
    if (value === undefined && PROPERTY_ALIASES[prop]) {
      value = get(prop);
    }
    if (value !== undefined && value !== null && typeof value !== 'object') {
      out[prop] = typeof value === 'string' && value.length > 500 ? value.slice(0, 500) : value;
    }
  }
  return out;
}

/**
 * Returns the player IDs that control an object. `all` means everyone.
 * Journal visibility is not control.
 *
 * @param {object} obj Roll20 graphic or character.
 * @param {string} type Object type.
 * @returns {string[]} Controller IDs (may include 'all').
 */
export function controllersOf(obj, type) {
  const split = (raw) =>
    toText(raw)
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  if (type === 'character') {
    return split(obj.get('controlledby'));
  }
  if (type === 'graphic') {
    const own = split(obj.get('controlledby'));
    const charId = toText(obj.get('represents'));
    const character = charId ? getObject('character', charId) : null;
    return [...new Set([...own, ...(character ? split(character.get('controlledby')) : [])])];
  }
  if (type === 'attribute') {
    const character = getObject('character', toText(obj.get('_characterid')));
    return character ? split(character.get('controlledby')) : [];
  }
  return [];
}

/**
 * Returns true when a player may act on an object. GMs control everything.
 *
 * @param {string} playerId Player ID.
 * @param {object} obj Roll20 object.
 * @param {string} type Object type.
 * @returns {boolean} True when controlled.
 */
export function playerControls(playerId, obj, type) {
  if (isGm(playerId)) {
    return true;
  }
  const controllers = controllersOf(obj, type);
  return controllers.includes('all') || controllers.includes(playerId);
}

/**
 * Returns the character an object stands for: the character itself, or the
 * character a token represents.
 *
 * @param {object} obj Roll20 object.
 * @param {string} type Object type.
 * @returns {object|null} Character.
 */
export function characterOf(obj, type) {
  if (type === 'character') {
    return obj;
  }
  if (type === 'graphic') {
    const id = toText(obj.get('represents'));
    return id ? getObject('character', id) : null;
  }
  return null;
}

/**
 * Finds a character's attribute by exact name.
 *
 * @param {string} characterId Character ID.
 * @param {string} name Attribute name.
 * @returns {object|null} Attribute.
 */
export function findAttribute(characterId, name) {
  return findObjects({ _type: 'attribute', _characterid: characterId, name })[0] || null;
}

/**
 * Runs a bounded binding query against the game.
 *
 * @param {object} query Query spec {name, pageId, represents, layer, marker, max}.
 * @param {string} objectType Object type.
 * @returns {string[]} Matching IDs (at most query.max).
 */
export function runQuery(query, objectType) {
  const filter = { _type: objectType };
  if (objectType === 'graphic') {
    filter._subtype = 'token';
  }
  if (query.pageId) {
    filter._pageid = query.pageId;
  }
  if (query.name) {
    filter.name = query.name;
  }
  if (query.represents) {
    filter.represents = query.represents;
  }
  if (query.layer) {
    filter.layer = query.layer;
  }
  let found = findObjects(filter);
  if (query.marker) {
    found = found.filter((o) =>
      parseMarkers(o.get('statusmarkers')).some((m) => m.tag === query.marker)
    );
  }
  return found.slice(0, query.max).map((o) => o.id);
}

/**
 * Resolves the bindings of a definition for a new run.
 *
 * @param {object} def Definition snapshot.
 * @param {object} sources Where values come from.
 * @param {string[]} [sources.selected] Selected IDs from the start command.
 * @param {string|null} [sources.eventObjectId] Object of the triggering event.
 * @param {object} [sources.explicit] Explicit IDs per binding (`--bind name=id,id`).
 * @param {object} [sources.params] Resolved parameters.
 * @param {boolean} [sources.unattended] True for schedule/event starts.
 * @returns {{ok: boolean, bindings?: object, errors?: object[]}} Result.
 */
export function resolveBindings(def, sources) {
  const bindings = {};
  const errors = [];
  for (const [name, spec] of Object.entries(def.bindings || {})) {
    let from = spec.from;
    let ids = [];
    const explicit = sources.explicit?.[name];
    if (explicit !== undefined && explicit !== 'selected') {
      ids = explicit;
      from = 'explicit';
    } else if (from === 'selected' && (sources.unattended || !sources.selected)) {
      if (!spec.alternate) {
        errors.push({ binding: name, code: 'selectionUnavailable' });
        continue;
      }
      from = spec.alternate.from;
      if (from === 'ids') {
        ids = spec.alternate.ids || [];
      }
    }
    switch (from) {
      case 'selected':
        ids = sources.selected || [];
        break;
      case 'ids':
        ids = ids.length ? ids : spec.ids || [];
        break;
      case 'event':
        ids = sources.eventObjectId ? [sources.eventObjectId] : [];
        break;
      case 'param': {
        const value = sources.params?.[spec.param];
        ids = typeof value === 'string' && value ? [value] : [];
        break;
      }
      case 'query':
        // Snapshot at start unless the definition asks for per-step evaluation.
        ids = spec.query.evaluate === 'step' ? [] : runQuery(spec.query, spec.objectType);
        break;
      default:
        break;
    }
    const unique = [...new Set(ids.filter((id) => typeof id === 'string' && id))];
    const valid = [];
    for (const id of unique) {
      const obj = getTarget(spec.objectType, id);
      if (!obj && spec.objectType === 'character' && getTarget('graphic', id)) {
        // A selected token stands for the character it represents.
        const character = characterOf(getTarget('graphic', id), 'graphic');
        if (character) {
          valid.push(character.id);
          continue;
        }
      }
      if (!obj) {
        errors.push({ binding: name, code: 'targetMissing', id });
        continue;
      }
      valid.push(id);
    }
    const max = spec.max ?? 20;
    if (valid.length > max) {
      errors.push({ binding: name, code: 'tooManyTargets', max });
      continue;
    }
    const min =
      spec.min ??
      (from === 'none' || spec.from === 'none' || spec.query?.evaluate === 'step' ? 0 : 1);
    if (valid.length < min) {
      errors.push({ binding: name, code: 'noTargets' });
      continue;
    }
    bindings[name] = [...new Set(valid)];
  }
  return errors.length ? { ok: false, errors } : { ok: true, bindings };
}

/**
 * Parses a token's `sides` into image URLs.
 *
 * @param {object} token Roll20 graphic.
 * @returns {string[]} Side image URLs.
 */
export function tokenSides(token) {
  return toText(token.get('sides'))
    .split('|')
    .filter(Boolean)
    .map((side) => {
      try {
        return decodeURIComponent(side);
      } catch {
        return side;
      }
    });
}

/**
 * Converts a library image URL into the form the API may write to `imgsrc`
 * (the `thumb` size). Marketplace and external images cannot be set by the
 * API, so they return null.
 *
 * @param {string} url Image URL.
 * @returns {string|null} Writable URL, or null.
 */
export function writableImage(url) {
  const match =
    /^(https:\/\/s3\.amazonaws\.com\/files\.d20\.io\/images\/(?:.*?)\/)(?:thumb|med|original|max)([^?]*)(\?[^?]+)?$/.exec(
      toText(url)
    );
  if (!match) {
    const alt =
      /^(https:\/\/files\.d20\.io\/images\/(?:.*?)\/)(?:thumb|med|original|max)([^?]*)(\?[^?]+)?$/.exec(
        toText(url)
      );
    if (!alt) {
      return null;
    }
    return `${alt[1]}thumb${alt[2]}${alt[3] || `?${Date.now()}`}`;
  }
  return `${match[1]}thumb${match[2]}${match[3] || `?${Date.now()}`}`;
}

/**
 * Returns a token's current side as a 0-based index.
 *
 * @param {object} token Roll20 graphic.
 * @returns {number} Index.
 */
export function currentSideIndex(token) {
  const raw = Number(token.get('currentSide'));
  return Number.isInteger(raw) && raw >= 0 ? raw : 0;
}

/**
 * Returns a compact label for an object.
 *
 * @param {string} id Object ID.
 * @returns {string} Name, or the ID.
 */
export function targetLabel(id) {
  const found = findAnyTarget(id);
  if (!found) {
    return id;
  }
  const name = toText(
    found.obj.get(
      found.type === 'player' ? 'displayname' : found.type === 'jukeboxtrack' ? 'title' : 'name'
    )
  );
  return name || id;
}

/**
 * Normalises a recipients spec into whisper names and player IDs.
 *
 * @param {object} to Recipients spec.
 * @param {object} inst Instance (for bindings and initiator).
 * @returns {{gm: boolean, players: string[]}} Recipients.
 */
export function resolveRecipients(to, inst) {
  const result = { gm: Boolean(to?.gm), players: [] };
  if (!isRecord(to)) {
    return result;
  }
  if (Array.isArray(to.players)) {
    result.players.push(...to.players.filter((p) => getObject('player', p)));
  }
  if (to.initiator && inst.initiatorPlayerId) {
    result.players.push(inst.initiatorPlayerId);
  }
  for (const key of ['binding', 'controllers']) {
    if (to[key]) {
      for (const id of inst.bindings?.[to[key]] || []) {
        const found = findAnyTarget(id);
        if (found?.type === 'player') {
          result.players.push(id);
        } else if (found) {
          result.players.push(...controllersOf(found.obj, found.type).filter((p) => p !== 'all'));
        }
      }
    }
  }
  result.players = [...new Set(result.players)];
  return result;
}
