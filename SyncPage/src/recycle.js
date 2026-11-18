// The recycle bin: snapshots of objects SyncPage removed (deletes that
// spread, removed links, repair clean-ups), so they can be put back.

import { canRecreate, createCopy } from './copy.js';
import { setLinkObject } from './groups.js';
import { getSetting } from './state.js';
import { makeId } from './utils.js';

/**
 * @typedef {object} RecycleItem
 * @property {string} linkId Link the object belonged to.
 * @property {string} pageId Page it was on.
 * @property {string} type Object type.
 * @property {object} props Its properties.
 * @property {{layer: string}|null} [hidden] Its hidden state on that page.
 */

/**
 * Adds an entry to a group's recycle bin.
 *
 * @param {object} group Group.
 * @param {string} reason Why the objects went (`delete`, `repair`, `exclude`, `group`).
 * @param {RecycleItem[]} items Snapshots.
 * @returns {string|null} The entry's ID.
 */
export function addToRecycle(group, reason, items) {
  if (!items.length) {
    return null;
  }
  const id = makeId('e');
  group.recycle.unshift({ id, at: Date.now(), reason, items });
  const max = getSetting('recycleSize');
  if (group.recycle.length > max) {
    group.recycle.length = max;
  }
  return id;
}

/**
 * Puts an entry's objects back and links them again.
 *
 * @param {object} group Group.
 * @param {number} [n=0] Entry number, newest first.
 * @returns {{ok: boolean, restored: number, failed: number}} Result.
 */
export function restoreEntry(group, n = 0) {
  const entry = group.recycle[n];
  if (!entry) {
    return { ok: false, restored: 0, failed: 0 };
  }
  let restored = 0;
  let failed = 0;
  for (const item of entry.items) {
    if (
      !group.pages.includes(item.pageId) ||
      !getObj('page', item.pageId) ||
      !canRecreate(item.type, item.props)
    ) {
      failed += 1;
      continue;
    }
    const { obj } = createCopy(item.type, item.props, item.pageId);
    if (!obj) {
      failed += 1;
      continue;
    }
    if (!group.links[item.linkId]) {
      group.links[item.linkId] = { type: item.type, objects: {} };
    }
    setLinkObject(group, item.linkId, item.pageId, obj.id);
    if (item.hidden) {
      group.hidden[item.linkId] = group.hidden[item.linkId] || {};
      group.hidden[item.linkId][item.pageId] = { layer: item.hidden.layer };
    }
    restored += 1;
  }
  group.recycle.splice(n, 1);
  return { ok: true, restored, failed };
}
