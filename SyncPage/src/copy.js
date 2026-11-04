// Reading, writing and creating copies of objects.

import { IGNORE_FOR_MATCH, NEVER_SYNC_KEYS, PROP_SETS } from './constants.js';
import { expectWrite } from './echo.js';
import { getSetting } from './state.js';
import { keyInList, sameValue, toText } from './utils.js';

/**
 * Cleans an image URL for createObj. Roll20 only accepts its own library
 * images, as the `thumb` size; marketplace images cannot be used at all.
 *
 * @param {*} url Image URL.
 * @returns {{url: string, ok: boolean}} Clean URL, and whether the API can use it.
 */
export function cleanImgsrc(url) {
  const text = toText(url);
  if (!text) {
    return { url: '', ok: false };
  }
  if (/\/marketplace\//i.test(text)) {
    return { url: text, ok: false };
  }
  if (text.startsWith('/')) {
    // Roll20's own pictures, such as the Jumpgate light's torch.
    return { url: text, ok: true };
  }
  const m = text.match(/^(.*\/images\/.*\/)(thumb|med|original|max)(\.[a-z0-9]+)(\?.*)?$/i);
  if (m) {
    return { url: `${m[1]}thumb${m[3]}${m[4] || `?${Date.now()}`}`, ok: true };
  }
  return { url: text, ok: /files\.d20\.io\/images\//i.test(text) };
}

/**
 * Returns an image's identity: its path without the size word or query.
 *
 * @param {*} url Image URL.
 * @returns {string} Identity.
 */
export function imageKey(url) {
  return toText(url)
    .replace(/\?.*$/, '')
    .replace(/\/(thumb|med|original|max)(\.[a-z0-9]+)$/i, '/$2');
}

/**
 * Reads an object's copyable properties.
 *
 * @param {object} obj Roll20 object.
 * @returns {object} Properties (no IDs, no read-only keys).
 */
export function readProps(obj) {
  const json = obj.toJSON ? obj.toJSON() : obj;
  const props = {};
  for (const [key, value] of Object.entries(json)) {
    if (key.startsWith('_') || NEVER_SYNC_KEYS.includes(key)) {
      continue;
    }
    props[key] = value;
  }
  // A Legacy path's shape reads back as the read-only _path but is written as path.
  if (json._type === 'path' && json._path !== undefined) {
    props.path = json._path;
  }
  return props;
}

/**
 * Returns the property keys a group keeps per page.
 *
 * @param {object} group Group.
 * @returns {string[]} Key list (entries ending in * match by start).
 */
export function localKeys(group) {
  const sets = getSetting('localProps', group) || [];
  return sets.flatMap((name) => PROP_SETS[name] || []);
}

/**
 * Picks the properties to mirror from a set of changed keys.
 *
 * @param {object} obj Changed object.
 * @param {string[]} keys Changed keys.
 * @param {object} group Group.
 * @returns {object} Properties to write to the copies.
 */
export function syncableChanges(obj, keys, group) {
  const local = localKeys(group);
  const type = obj.get('_type');
  const out = {};
  for (const key of keys) {
    if (key.startsWith('_') || NEVER_SYNC_KEYS.includes(key) || keyInList(key, local)) {
      continue;
    }
    if (type === 'graphic' && key === 'imgsrc') {
      const img = cleanImgsrc(obj.get('imgsrc'));
      if (!img.ok) {
        continue;
      }
      out.imgsrc = img.url;
      continue;
    }
    out[key] = obj.get(key);
  }
  return out;
}

/**
 * Takes the per-page keys out of a full property set.
 *
 * @param {object} props Properties.
 * @param {object} group Group.
 * @returns {object} Properties without the group's local keys.
 */
export function withoutLocal(props, group) {
  const local = localKeys(group);
  const out = {};
  for (const [key, value] of Object.entries(props)) {
    if (!keyInList(key, local)) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Writes properties that differ, recording them for the echo guard.
 *
 * @param {object} obj Roll20 object.
 * @param {object} props Properties.
 * @returns {number} How many properties changed.
 */
export function applyProps(obj, props) {
  const diff = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'path' && obj.get('_type') === 'path') {
      continue;
    }
    if (!sameValue(obj.get(key), value)) {
      diff[key] = value;
    }
  }
  const n = Object.keys(diff).length;
  if (n > 0) {
    expectWrite(obj.id, diff);
    obj.set(diff);
  }
  return n;
}

/**
 * Creates a copy of an object on a page.
 *
 * @param {string} type Object type.
 * @param {object} props Properties (as from readProps).
 * @param {string} pageId Page ID.
 * @returns {{obj: object|null, reason?: string}} The copy, or why there is none.
 */
export function createCopy(type, props, pageId) {
  const attrs = { ...props, pageid: pageId };
  if (type === 'graphic') {
    const img = cleanImgsrc(props.imgsrc);
    if (!img.ok) {
      return { obj: null, reason: 'image' };
    }
    attrs.imgsrc = img.url;
  }
  let obj = null;
  try {
    obj = createObj(type, attrs) || null;
  } catch (e) {
    log(`SyncPage: could not create a ${type} copy: ${e?.message || e}`);
  }
  return obj ? { obj } : { obj: null, reason: 'create' };
}

/**
 * Takes a snapshot of an object, enough to create it again.
 *
 * @param {object} obj Roll20 object.
 * @returns {{type: string, pageId: string, props: object}} Snapshot.
 */
export function snapshot(obj) {
  return { type: obj.get('_type'), pageId: obj.get('_pageid'), props: readProps(obj) };
}

/**
 * Returns true when the API can create this object again (marketplace images
 * cannot be).
 *
 * @param {string} type Object type.
 * @param {object} props Properties.
 * @returns {boolean} True when it can be recreated.
 */
export function canRecreate(type, props) {
  return type !== 'graphic' || cleanImgsrc(props.imgsrc).ok;
}

const round = (v) => Math.round(Number(v) || 0);

/**
 * Builds an object's fingerprint: what stays the same when Roll20 copies a
 * page (type, layer, place, size, name, image or shape).
 *
 * @param {string} type Object type.
 * @param {object} props Properties.
 * @returns {string} Fingerprint.
 */
export function fingerprint(type, props) {
  const p = props || {};
  switch (type) {
    case 'graphic':
      return [
        'graphic',
        p.layer,
        round(p.left),
        round(p.top),
        round(p.width),
        round(p.height),
        toText(p.name),
        imageKey(p.imgsrc),
      ].join('|');
    case 'text':
      return ['text', p.layer, round(p.left), round(p.top), toText(p.text)].join('|');
    case 'path':
      return [
        'path',
        p.layer,
        round(p.left),
        round(p.top),
        round(p.width),
        round(p.height),
        toText(p.path ?? p._path).length,
      ].join('|');
    case 'pathv2':
      return ['pathv2', p.layer, round(p.x), round(p.y), toText(p.shape), toText(p.points)].join(
        '|'
      );
    case 'door':
    case 'window':
      return [type, round(p.x), round(p.y), JSON.stringify(p.path || {})].join('|');
    default:
      return `${type}|?`;
  }
}

/**
 * Returns the properties that differ between two objects of one type,
 * ignoring the keys Roll20 changes when it copies a page and the group's
 * per-page keys.
 *
 * @param {string} type Object type.
 * @param {object} want Wanted properties.
 * @param {object} have Current properties.
 * @param {object} group Group.
 * @returns {object} Properties to write.
 */
export function drift(type, want, have, group) {
  const local = localKeys(group);
  const ignore = IGNORE_FOR_MATCH[type] || [];
  const out = {};
  for (const [key, value] of Object.entries(want)) {
    if (keyInList(key, local) || ignore.includes(key) || (key === 'path' && type === 'path')) {
      continue;
    }
    if (type === 'graphic' && key === 'imgsrc') {
      if (imageKey(value) !== imageKey(have.imgsrc)) {
        const img = cleanImgsrc(value);
        if (img.ok) {
          out.imgsrc = img.url;
        }
      }
      continue;
    }
    if (!sameValue(value, have[key])) {
      out[key] = value;
    }
  }
  return out;
}
