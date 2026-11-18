// Reading and writing inspiration on both D&D 5e sheets.
//
// The 2014 OGL sheet keeps a checkbox attribute, `inspiration`, which
// findObjs can see. The D&D 2024 sheet is a Beacon sheet: its values are not
// attribute objects, so 0.1.x never found them. Beacon values are read and
// written with getSheetItem/setSheetItem; the sheet also keeps them in a
// `store` attribute, which is read when those functions are not available.

import {
  BEACON_ITEM,
  BEACON_STORE_ATTRIBUTE,
  LEGACY_ATTRIBUTE,
  POOL_ATTRIBUTE_SUFFIX,
  RULES_2014,
  RULES_2024,
  SCRIPT_NAME,
} from './constants.js';
import { getConfig } from './state.js';
import { isInspiredValue, isRecord, toText } from './utils.js';

/**
 * Finds a character's attribute by name, whatever its case.
 *
 * @param {string} charId Character ID.
 * @param {string} name Attribute name.
 * @returns {object|undefined} Roll20 attribute.
 */
export function findAttribute(charId, name) {
  const wanted = name.toLowerCase();
  return findObjs({ _type: 'attribute', _characterid: charId }).find(
    (attr) => toText(attr.get('name')).toLowerCase() === wanted
  );
}

/**
 * Returns the parsed `store` of a Beacon character, or null for other sheets.
 *
 * @param {string|object} charOrAttr Character ID, or the store attribute itself.
 * @returns {object|null} Store contents.
 */
export function readStore(charOrAttr) {
  const attr =
    typeof charOrAttr === 'string' ? findAttribute(charOrAttr, BEACON_STORE_ATTRIBUTE) : charOrAttr;
  if (!attr) {
    return null;
  }
  let value = attr.get('current');
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return isRecord(value) ? value : null;
}

/**
 * Reads inspiration from a Beacon store.
 *
 * @param {object|null} store Store contents.
 * @returns {boolean|undefined} Value, or undefined when the store has none.
 */
export function inspirationFromStore(store) {
  const value = store?.inspiration?.isInspired;
  return value === undefined ? undefined : isInspiredValue(value);
}

/**
 * Says which kind of sheet holds a character's inspiration.
 *
 * @param {string} charId Character ID.
 * @returns {'legacy'|'beacon'|'none'} Sheet kind.
 */
export function sheetKind(charId) {
  if (findAttribute(charId, LEGACY_ATTRIBUTE)) {
    return 'legacy';
  }
  return findAttribute(charId, BEACON_STORE_ATTRIBUTE) ? 'beacon' : 'none';
}

/**
 * Reads whether a character has inspiration.
 *
 * @param {string} charId Character ID.
 * @returns {Promise<{kind: string, inspired: boolean}>} Sheet kind and value.
 */
export async function readInspiration(charId) {
  const kind = sheetKind(charId);
  if (kind === 'legacy') {
    return {
      kind,
      inspired: isInspiredValue(findAttribute(charId, LEGACY_ATTRIBUTE).get('current')),
    };
  }
  if (kind === 'beacon') {
    if (typeof getSheetItem === 'function') {
      try {
        const value = await getSheetItem(charId, BEACON_ITEM);
        if (value !== undefined && value !== null) {
          return { kind, inspired: isInspiredValue(value) };
        }
      } catch (err) {
        log(`${SCRIPT_NAME}: getSheetItem failed for ${charId}: ${err?.message || err}`);
      }
    }
    return { kind, inspired: inspirationFromStore(readStore(charId)) === true };
  }
  return { kind, inspired: false };
}

/**
 * Sets or clears a character's inspiration.
 *
 * A 2014 sheet only creates its attribute when the box is first ticked, so a
 * character with neither attribute nor store gets the attribute created.
 *
 * @param {string} charId Character ID.
 * @param {boolean} inspired New value.
 * @returns {Promise<{ok: boolean, kind: string, error?: string}>} Result.
 */
export async function writeInspiration(charId, inspired) {
  const kind = sheetKind(charId);
  if (kind === 'beacon') {
    if (typeof setSheetItem !== 'function') {
      return { ok: false, kind, error: 'setSheetItem is not available' };
    }
    try {
      await setSheetItem(charId, BEACON_ITEM, inspired ? 1 : 0, 'current', { allowThrow: true });
      return { ok: true, kind };
    } catch (err) {
      const error = String(err?.message || err);
      log(`${SCRIPT_NAME}: setSheetItem failed for ${charId}: ${error}`);
      return { ok: false, kind, error };
    }
  }
  const value = inspired ? 'on' : '0';
  const attr = findAttribute(charId, LEGACY_ATTRIBUTE);
  if (attr) {
    attr.set('current', value);
  } else {
    createObj('attribute', { characterid: charId, name: LEGACY_ATTRIBUTE, current: value });
  }
  return { ok: true, kind: 'legacy' };
}

// ---------------------------------------------------------------------------
// Points pools
//
// A pool is kept in the sheet's resource box that carries the pool's name
// (the 2014 OGL sheet's Class Resource, Other Resource and added resource
// boxes: an attribute such as `other_resource`, named by `other_resource_name`),
// or in a plain attribute, `<pool id>_pool`. The D&D 2024 sheet keeps its
// resources inside its `store`, which a Mod cannot change safely, so its
// characters always use the plain attribute.
// ---------------------------------------------------------------------------

/**
 * Returns the name of a pool's plain attribute.
 *
 * @param {object} pool Pool.
 * @returns {string} Attribute name, such as `inspiration_pool`.
 */
export function poolAttributeName(pool) {
  return `${pool.id.replaceAll('-', '_')}${POOL_ATTRIBUTE_SUFFIX}`;
}

/**
 * Returns true when an attribute name could hold a pool: a resource box, its
 * name, or a pool's plain attribute.
 *
 * @param {string} name Attribute name.
 * @returns {boolean} True when worth checking.
 */
export function isPoolAttributeName(name) {
  const text = toText(name).toLowerCase();
  return text.includes('resource') || text.endsWith(POOL_ATTRIBUTE_SUFFIX);
}

/**
 * Finds where a character keeps a pool.
 *
 * @param {string} charId Character ID.
 * @param {object} pool Pool.
 * @returns {{where: 'resource'|'attribute', name: string, attr: object|undefined}} Where it is kept, the attribute's name, and the attribute when it exists.
 */
export function locatePool(charId, pool) {
  const attrs = findObjs({ _type: 'attribute', _characterid: charId });
  const named = (name) =>
    attrs.find((attr) => toText(attr.get('name')).toLowerCase() === name.toLowerCase());
  if (pool.source === 'resource') {
    const wanted = pool.name.toLowerCase();
    const label = attrs.find((attr) => {
      const name = toText(attr.get('name')).toLowerCase();
      return (
        name.includes('resource') &&
        name.endsWith('_name') &&
        toText(attr.get('current')).trim().toLowerCase() === wanted
      );
    });
    if (label) {
      const name = toText(label.get('name')).slice(0, -'_name'.length);
      return { where: 'resource', name, attr: named(name) };
    }
  }
  const name = poolAttributeName(pool);
  return { where: 'attribute', name, attr: named(name) };
}

/**
 * Reads a character's points in a pool.
 *
 * @param {string} charId Character ID.
 * @param {object} pool Pool.
 * @returns {{where: string, exists: boolean, value: number}} Where it is kept, whether anything is stored yet, and the points.
 */
export function readPool(charId, pool) {
  const { where, attr } = locatePool(charId, pool);
  const n = Math.floor(Number(attr?.get('current')));
  return { where, exists: Boolean(attr), value: Number.isFinite(n) && n > 0 ? n : 0 };
}

/**
 * Writes a character's points in a pool, creating the attribute when needed.
 *
 * @param {string} charId Character ID.
 * @param {object} pool Pool.
 * @param {number} value Points.
 * @returns {{where: string}} Where it was written.
 */
export function writePool(charId, pool, value) {
  const { where, name, attr } = locatePool(charId, pool);
  // A sheet's own boxes hold text ("52"), so they are written the way the sheet writes them.
  const current = where === 'resource' ? String(value) : value;
  if (attr) {
    attr.set('current', current);
  } else {
    createObj('attribute', { characterid: charId, name, current });
  }
  return { where };
}

/**
 * Returns the rules edition used for a character: the GM's choice, or the
 * 2024 sheet's own setting, or 2014 for the 2014 OGL sheet.
 *
 * @param {string} charId Character ID.
 * @returns {string} RULES_2014 or RULES_2024.
 */
export function rulesFor(charId) {
  const wording = getConfig().wording;
  if (wording === RULES_2014 || wording === RULES_2024) {
    return wording;
  }
  const store = readStore(charId);
  if (!store) {
    return RULES_2014;
  }
  return store.settings?.newRules === false ? RULES_2014 : RULES_2024;
}
