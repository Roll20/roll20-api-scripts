// Carrying a 0.1.x set-up over: pages named "<name>_synced" become a group
// named <name>, 0.1.x's object links are kept where both objects still
// exist, and its show/hide flags in GM Notes become per-copy visibility.

import { COMMAND_ALIASES, LEGACY_STATE_KEY, SYNC_TYPES } from './constants.js';
import { createGroup, findAny, groupOfPage, linkOf, newLink, setLinkObject } from './groups.js';
import { adoptPage, pairPage } from './pair.js';
import { fingerprint, readProps } from './copy.js';
import { getState, setSetting } from './state.js';
import { isRecord, toText } from './utils.js';
import { hideCopy } from './visibility.js';

const SUFFIX = /_synced$/i;
const FLAG_TEXT = /(%3Cbr%3E|<br\s*\/?>)?(show|hide)_(here|others)(undefined)?/gi;

/**
 * Reads 0.1.x's flags from a token's GM Notes.
 *
 * @param {string} notes GM Notes.
 * @returns {Set<string>} Flags such as `hide_here`.
 */
function readFlags(notes) {
  const out = new Set();
  const text = toText(notes);
  for (const m of text.matchAll(/(show|hide)_(here|others)/gi)) {
    out.add(`${m[1].toLowerCase()}_${m[2].toLowerCase()}`);
  }
  return out;
}

/**
 * Removes 0.1.x's flags (and the "undefined" its bug wrote) from GM Notes.
 *
 * @param {string} notes GM Notes.
 * @returns {string} Clean notes.
 */
export function stripFlags(notes) {
  return toText(notes)
    .replaceAll(FLAG_TEXT, '')
    .replace(/^(%3Cbr%3E)+/i, '');
}

/**
 * Migrates 0.1.x's set-up once.
 *
 * @returns {{groups: number, links: number, hidden: number, trueCopy: boolean}|null}
 *   What was carried over, or null when there was nothing (or it was done before).
 */
export function migrateLegacy() {
  const s = getState();
  if (s.notices.migrated) {
    return null;
  }
  const legacy = isRecord(state[LEGACY_STATE_KEY]) ? state[LEGACY_STATE_KEY] : null;
  const pages = findObjs({ _type: 'page' });
  const copies = pages.filter((p) => SUFFIX.test(toText(p.get('name'))));
  if (!legacy && !copies.length) {
    s.notices.migrated = true;
    return null;
  }
  const result = { groups: 0, links: 0, hidden: 0, trueCopy: false };
  const config = isRecord(legacy?.config) ? legacy.config : {};
  const command = toText(config.command).toLowerCase();
  if (command && !COMMAND_ALIASES.includes(`!${command}`) && /^[a-z0-9_-]+$/.test(command)) {
    s.aliases.push(`!${command}`);
  }
  if (config.refresh_sync === false) {
    setSetting('repairOnStart', 'off');
  }
  if (config.true_copy === true) {
    result.trueCopy = true;
    s.notices.trueCopy = true;
  }

  // Groups: "<name>_synced" pages joined to the page called exactly <name>.
  const byBase = new Map();
  for (const copy of copies) {
    const base = toText(copy.get('name')).replace(SUFFIX, '').trim();
    const original = pages.find(
      (p) =>
        toText(p.get('name')).toLowerCase() === base.toLowerCase() &&
        !SUFFIX.test(toText(p.get('name')))
    );
    if (!original || groupOfPage(copy.id)) {
      continue;
    }
    if (!byBase.has(original.id)) {
      byBase.set(original.id, { base, original, copies: [] });
    }
    byBase.get(original.id).copies.push(copy);
  }

  for (const { base, original, copies: list } of byBase.values()) {
    const group = groupOfPage(original.id) || createGroup(base, original.id);
    result.groups += 1;
    for (const copy of list) {
      if (!group.pages.includes(copy.id)) {
        group.pages.push(copy.id);
      }
    }
    // 0.1.x's own links, where every object still exists.
    const old = isRecord(legacy?.synced_pages) ? legacy.synced_pages[base.toLowerCase()] : null;
    for (const ids of Array.isArray(old) ? old : []) {
      if (!Array.isArray(ids)) {
        continue;
      }
      const objs = ids
        .map((id) => findAny(toText(id)))
        .filter(
          (o) =>
            o &&
            SYNC_TYPES.includes(o.get('_type')) &&
            group.pages.includes(o.get('_pageid')) &&
            !linkOf(o.id)
        );
      const first = objs.find((o) => o.get('_pageid') === original.id);
      if (!first) {
        continue;
      }
      const objects = {};
      for (const o of objs) {
        if (!objects[o.get('_pageid')] && o.get('_type') === first.get('_type')) {
          objects[o.get('_pageid')] = o.id;
        }
      }
      if (Object.keys(objects).length > 1) {
        newLink(
          group,
          first.get('_type'),
          objects,
          fingerprint(first.get('_type'), readProps(first))
        );
        result.links += 1;
      }
    }
    // Everything else is matched the 1.0 way. Copies 0.1.x rebuilt on every
    // start sit where their originals are, so they pair by fingerprint.
    adoptPage(group, original.id);
    for (const copy of list) {
      pairPage(group, copy.id, { copyMissing: true });
    }

    // GM Notes flags become per-copy visibility.
    for (const [linkId, link] of Object.entries(group.links)) {
      for (const [pageId, objId] of Object.entries({ ...link.objects })) {
        const obj = getObj(link.type, objId);
        if (!obj || link.type !== 'graphic') {
          continue;
        }
        const notes = toText(obj.get('gmnotes'));
        const flags = readFlags(notes);
        if (!flags.size) {
          continue;
        }
        const targets = [];
        if (flags.has('hide_here')) {
          targets.push(pageId);
        }
        if (flags.has('hide_others') && !flags.has('show_here')) {
          targets.push(...group.pages.filter((p) => p !== pageId));
        }
        for (const p of targets) {
          if (hideCopy(group, linkId, p).ok) {
            result.hidden += 1;
          }
        }
        obj.set('gmnotes', stripFlags(notes));
      }
    }
  }
  // Links the loops above may have made point at objects from every page.
  for (const group of Object.values(s.groups)) {
    for (const [linkId, link] of Object.entries(group.links)) {
      for (const [pageId, objId] of Object.entries(link.objects)) {
        setLinkObject(group, linkId, pageId, objId);
      }
    }
  }
  s.notices.migrated = true;
  return result;
}
