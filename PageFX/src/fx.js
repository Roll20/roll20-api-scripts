// Effect specs: parsing what the GM types (or what v1 kept in GM Notes), and
// turning a spec into something Roll20 can spawn.
//
// Jumpgate draws spawnFxWithDefinition() in white only, whatever colours the
// definition holds, but draws saved custom FX objects in their colours. So a
// custom definition is kept in a custom FX object PageFX owns, and spawned by
// its ID (checked in Jumpgate on 4 November 2026).

import {
  BEAM_ANGLE,
  BEAM_TYPES,
  BUILTIN_COLOURS,
  BUILTIN_TYPE_ALIASES,
  BUILTIN_TYPES,
  CUSTOM_FX_DEFAULTS,
  OWNED_FX_PREFIX,
} from './constants.js';
import { isRecord, toText, truncate } from './utils.js';

/**
 * @typedef {{kind: 'builtin'|'saved'|'custom', value: *}} FxSpec
 */

/**
 * @typedef {{ok: true, fx: FxSpec} | {ok: false, error: string, vars?: object}} FxParse
 */

/**
 * Parses an effect: a built-in "type-colour", a saved custom FX name, or a
 * custom FX definition in JSON.
 *
 * @param {*} raw Text typed by the GM or read from v1 GM Notes.
 * @returns {FxParse} Parsed spec, or an error key for the messages.
 */
export function parseFxSpec(raw) {
  const text = toText(raw);
  if (text === '') {
    return { ok: false, error: 'fx.empty' };
  }
  if (text.startsWith('{')) {
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      return { ok: false, error: 'fx.badJson' };
    }
    if (!isRecord(value)) {
      return { ok: false, error: 'fx.badJson' };
    }
    return { ok: true, fx: { kind: 'custom', value: completeDefinition(value) } };
  }
  const builtin = parseBuiltin(text);
  if (builtin) {
    return builtin;
  }
  return { ok: true, fx: { kind: 'saved', value: text } };
}

/**
 * Parses a built-in "type-colour" name, accepting v1's aliases and any case.
 *
 * @param {string} text Effect text.
 * @returns {FxParse|null} Parsed built-in, an error for a known type with an
 *   unknown colour, or null when the text is not a built-in name.
 */
function parseBuiltin(text) {
  const match = /^([a-z]+)-([a-z]+)$/i.exec(text);
  if (!match) {
    return null;
  }
  const lowered = match[1].toLowerCase();
  const type = BUILTIN_TYPE_ALIASES[lowered] || lowered;
  const colour = match[2].toLowerCase();
  if (!BUILTIN_TYPES.includes(type)) {
    return null;
  }
  if (!BUILTIN_COLOURS.includes(colour)) {
    return {
      ok: false,
      error: 'fx.unknownColour',
      vars: { colour, colours: BUILTIN_COLOURS.join(', ') },
    };
  }
  return { ok: true, fx: { kind: 'builtin', value: `${type}-${colour}` } };
}

/**
 * Copies colour keys between Roll20's two spellings, so a definition works
 * whichever spelling the engine reads ("Colour" is documented, but the custom
 * FX Roll20's own editor and other Mods save carry "Color" too).
 *
 * @param {object} def Custom FX definition.
 * @returns {object} Definition with both spellings.
 */
export function normaliseDefinition(def) {
  const out = { ...def };
  // Legacy draws nothing for a negative angle other than -1 (beam); Jumpgate takes either.
  // -90 (up) becomes 270, which both draw the same.
  if (typeof out.angle === 'number' && out.angle < 0 && out.angle !== BEAM_ANGLE) {
    out.angle = ((out.angle % 360) + 360) % 360;
  }
  for (const base of ['start', 'end']) {
    for (const suffix of ['', 'Random']) {
      const british = `${base}Colour${suffix}`;
      const american = `${base}Color${suffix}`;
      if (british in out && !(american in out)) {
        out[american] = out[british];
      } else if (american in out && !(british in out)) {
        out[british] = out[american];
      }
    }
  }
  return out;
}

/**
 * Fills in the values a custom FX definition leaves out, then gives its
 * colours both spellings. A colour given in either spelling counts as given.
 *
 * @param {object} def Custom FX definition.
 * @returns {object} Complete definition.
 */
export function completeDefinition(def) {
  const out = { ...def };
  for (const [key, value] of Object.entries(CUSTOM_FX_DEFAULTS)) {
    const american = key.replace('Colour', 'Color');
    if (!(key in out) && !(american in out)) {
      out[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  return normaliseDefinition(out);
}

/**
 * Returns true when a built-in effect is drawn between two points.
 *
 * @param {string} name Built-in "type-colour" name.
 * @returns {boolean} True for beam-like effects.
 */
export function isBeamBuiltin(name) {
  return BEAM_TYPES.includes(String(name).split('-')[0]);
}

/**
 * Describes a spec in a few words for menus and status.
 *
 * @param {FxSpec} fx Spec.
 * @returns {string} Short description.
 */
export function describeFx(fx) {
  if (!fx) {
    return '';
  }
  if (fx.kind === 'custom') {
    return fx.shared ? truncate(fx.shared, 40) : 'JSON';
  }
  return truncate(fx.value, 40);
}

/**
 * @typedef {object} ResolvedFx
 * @property {string} id What to pass to spawnFx: a built-in name or a custom FX ID.
 * @property {boolean} beam True when drawn between two points.
 */

/**
 * Finds a saved custom FX by name: exact first, then ignoring case.
 *
 * @param {string} name Custom FX name.
 * @returns {object|undefined} Roll20 custfx.
 */
export function findSavedFx(name) {
  const exact = findObjs({ _type: 'custfx', name });
  if (exact.length > 0) {
    return exact[0];
  }
  const lower = name.toLowerCase();
  return findObjs({ _type: 'custfx' }).find((f) => toText(f.get('name')).toLowerCase() === lower);
}

/**
 * Reads a custom FX object's definition, which the API returns as an object
 * (or, in older games, as JSON text).
 *
 * @param {object} custfx Roll20 custfx.
 * @returns {object} Definition, empty when unreadable.
 */
export function readDefinition(custfx) {
  const def = custfx.get('definition');
  if (isRecord(def)) {
    return def;
  }
  try {
    const parsed = JSON.parse(toText(def));
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Makes or updates the custom FX object PageFX owns for a custom definition.
 *
 * @param {object} owned Map of owner key to custfx ID (kept in state).
 * @param {string} key Owner key (effect ID and layer number).
 * @param {string} label Name shown in Roll20's FX list, after the prefix.
 * @param {object} definition Custom FX definition.
 * @returns {object|null} Roll20 custfx, or null when it could not be made.
 */
export function ensureOwnedFx(owned, key, label, definition) {
  const name = `${OWNED_FX_PREFIX}${truncate(label, 80)}`;
  const json = JSON.stringify(definition);
  let custfx = owned[key] ? getObj('custfx', owned[key]) : undefined;
  if (custfx) {
    if (JSON.stringify(readDefinition(custfx)) !== json) {
      custfx.set('definition', definition);
    }
    if (custfx.get('name') !== name) {
      custfx.set('name', name);
    }
    return custfx;
  }
  custfx = createObj('custfx', { name, definition });
  if (!custfx) {
    return null;
  }
  owned[key] = custfx.id;
  return custfx;
}

/**
 * Removes the custom FX objects PageFX owns for an effect.
 *
 * @param {object} owned Map of owner key to custfx ID (kept in state).
 * @param {string} effectId Effect ID.
 * @returns {void}
 */
export function removeOwnedFx(owned, effectId) {
  for (const key of Object.keys(owned)) {
    if (key.split('#')[0] === effectId) {
      getObj('custfx', owned[key])?.remove();
      delete owned[key];
    }
  }
}

/**
 * Turns a spec into something to spawn.
 *
 * @param {FxSpec} fx Spec.
 * @param {{owned: object, key: string, label: string}} owner Where a custom definition is kept.
 * @returns {{ok: true, fx: ResolvedFx} | {ok: false, error: string, vars?: object}} Result.
 */
export function resolveFx(fx, owner) {
  if (fx.kind === 'builtin') {
    return { ok: true, fx: { id: fx.value, beam: isBeamBuiltin(fx.value) } };
  }
  if (fx.kind === 'saved') {
    const saved = findSavedFx(fx.value);
    if (!saved) {
      return { ok: false, error: 'fx.savedMissing', vars: { name: fx.value } };
    }
    return { ok: true, fx: { id: saved.id, beam: readDefinition(saved).angle === BEAM_ANGLE } };
  }
  if (fx.kind === 'custom') {
    // Completed again here so definitions saved before a default was added still draw.
    const def = completeDefinition(fx.value);
    // Preset layers share one custom FX per definition, however many effects use them.
    const custfx = fx.shared
      ? ensureOwnedFx(owner.owned, sharedKey(def), fx.shared, def)
      : ensureOwnedFx(owner.owned, owner.key, owner.label, def);
    if (!custfx) {
      return { ok: false, error: 'fx.cannotCreate' };
    }
    return { ok: true, fx: { id: custfx.id, beam: fx.value.angle === BEAM_ANGLE } };
  }
  return { ok: false, error: 'fx.empty' };
}

/**
 * Spawns one effect on a page. The page must always be given: without it
 * Roll20 draws the effect on the player ribbon page, which is why v1 never
 * showed anything to a split party.
 *
 * @param {ResolvedFx} fx Resolved effect.
 * @param {{x: number, y: number}} start Where it appears (or starts).
 * @param {{x: number, y: number}|null} end Where a beam-like effect ends.
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function spawn(fx, start, end, pageId) {
  if (fx.beam && end) {
    spawnFxBetweenPoints(start, end, fx.id, pageId);
  } else {
    spawnFx(start.x, start.y, fx.id, pageId);
  }
}

/**
 * Removes custom FX objects PageFX owns for an effect's layers that no longer
 * need one: layers that were deleted, or that now use a built-in or saved FX.
 *
 * @param {object} owned Map of owner key to custfx ID (kept in state).
 * @param {{id: string, layers: Array<{fx: FxSpec|null}>}} effect Effect.
 * @returns {void}
 */
export function pruneOwnedFx(owned, effect) {
  for (const key of Object.keys(owned)) {
    const [effectId, index] = key.split('#');
    if (effectId !== effect.id) {
      continue;
    }
    if (effect.layers[Number(index)]?.fx?.kind !== 'custom') {
      getObj('custfx', owned[key])?.remove();
      delete owned[key];
    }
  }
}

/**
 * Returns true when a spec is drawn between two points, so it has a direction.
 *
 * @param {FxSpec|null} fx Spec.
 * @returns {boolean} True for beam-like effects.
 */
export function isBeamSpec(fx) {
  if (!fx) {
    return false;
  }
  if (fx.kind === 'builtin') {
    return isBeamBuiltin(fx.value);
  }
  if (fx.kind === 'custom') {
    return fx.value.angle === BEAM_ANGLE;
  }
  const saved = findSavedFx(fx.value);
  return !!saved && readDefinition(saved).angle === BEAM_ANGLE;
}

/**
 * Returns the names of the game's own saved custom FX, without the ones
 * PageFX made for itself, sorted.
 *
 * @returns {string[]} Names.
 */
export function listSavedFxNames() {
  return findObjs({ _type: 'custfx' })
    .map((f) => toText(f.get('name')))
    .filter((name) => name !== '' && !name.startsWith(OWNED_FX_PREFIX))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Hashes text into a short key (djb2, base 36).
 *
 * @param {string} text Text.
 * @returns {string} Hash.
 */
function hashText(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

/**
 * Returns the owner key of the custom FX shared by every layer with this
 * definition.
 *
 * @param {object} def Complete custom FX definition.
 * @returns {string} Owner key.
 */
export function sharedKey(def) {
  return `shared:${hashText(JSON.stringify(def))}`;
}

/**
 * Removes shared custom FX objects that no effect layer uses any more.
 *
 * @param {object} owned Map of owner key to custfx ID (kept in state).
 * @param {object[]} effects Every effect.
 * @returns {void}
 */
export function pruneSharedFx(owned, effects) {
  const used = new Set();
  for (const effect of effects) {
    for (const layer of effect.layers) {
      if (layer.fx?.kind === 'custom' && layer.fx.shared) {
        used.add(sharedKey(completeDefinition(layer.fx.value)));
      }
    }
  }
  for (const key of Object.keys(owned)) {
    if (key.startsWith('shared:') && !used.has(key)) {
      getObj('custfx', owned[key])?.remove();
      delete owned[key];
    }
  }
}
