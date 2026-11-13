// Sync groups: which pages are kept in step, and which objects are linked.
// A reverse index (object ID → group and link) is rebuilt on start and kept
// up to date, so an event only ever touches its own link.

import { SYNC_TYPES } from './constants.js';
import { getState } from './state.js';
import { makeId, toText } from './utils.js';

/** @type {Map<string, {groupId: string, linkId: string}>} */
const index = new Map();

/**
 * Returns a Roll20 object of one of the synced types.
 *
 * @param {string} type Object type.
 * @param {string} id Object ID.
 * @returns {object|undefined} Object.
 */
export function getSynced(type, id) {
  return id ? getObj(type, id) : undefined;
}

/**
 * Returns every group.
 *
 * @returns {object[]} Groups, by name.
 */
export function listGroups() {
  return Object.values(getState().groups).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Rebuilds the reverse index from state.
 *
 * @returns {void}
 */
export function rebuildIndex() {
  index.clear();
  for (const group of Object.values(getState().groups)) {
    for (const [linkId, link] of Object.entries(group.links)) {
      for (const objId of Object.values(link.objects)) {
        index.set(objId, { groupId: group.id, linkId });
      }
    }
  }
}

/**
 * Returns the group a page belongs to.
 *
 * @param {string} pageId Page ID.
 * @returns {object|null} Group.
 */
export function groupOfPage(pageId) {
  if (!pageId) {
    return null;
  }
  return Object.values(getState().groups).find((g) => g.pages.includes(pageId)) || null;
}

/**
 * Finds a group by ID or name (ignoring case).
 *
 * @param {string} ref ID or name.
 * @returns {object|null} Group.
 */
export function findGroup(ref) {
  const text = toText(ref);
  if (!text) {
    return null;
  }
  const groups = getState().groups;
  if (groups[text]) {
    return groups[text];
  }
  const lower = text.toLowerCase();
  return Object.values(groups).find((g) => g.name.toLowerCase() === lower) || null;
}

/**
 * Returns a page's name.
 *
 * @param {string} pageId Page ID.
 * @returns {string} Name, or the ID when the page is gone.
 */
export function pageName(pageId) {
  const page = getObj('page', pageId);
  return page ? toText(page.get('name')) || pageId : pageId;
}

/**
 * Finds a page by ID or name (ignoring case), optionally within a group.
 *
 * @param {string} ref ID or name.
 * @param {object} [group] Only look at this group's pages.
 * @returns {string|null} Page ID.
 */
export function findPage(ref, group) {
  const text = toText(ref);
  if (!text) {
    return null;
  }
  const ids = group ? group.pages : findObjs({ _type: 'page' }).map((p) => p.id);
  if (ids.includes(text)) {
    return text;
  }
  const lower = text.toLowerCase();
  return ids.find((id) => pageName(id).toLowerCase() === lower) || null;
}

/**
 * Makes a new group from a source page.
 *
 * @param {string} name Group name.
 * @param {string} sourcePageId Source page ID.
 * @returns {object} The group.
 */
export function createGroup(name, sourcePageId) {
  const id = makeId('g');
  const group = {
    id,
    name: toText(name) || pageName(sourcePageId),
    source: sourcePageId,
    pages: [sourcePageId],
    overrides: {},
    links: {},
    hidden: {},
    layout: {},
    recycle: [],
    repairLog: null,
    pageOnly: [],
    paused: false,
  };
  getState().groups[id] = group;
  return group;
}

/**
 * Removes a group. Objects stay on their pages, unlinked.
 *
 * @param {object} group Group.
 * @returns {void}
 */
export function deleteGroup(group) {
  for (const link of Object.values(group.links)) {
    for (const objId of Object.values(link.objects)) {
      index.delete(objId);
    }
  }
  delete getState().groups[group.id];
}

/**
 * Makes a new link.
 *
 * @param {object} group Group.
 * @param {string} type Object type.
 * @param {Record<string, string>} objects Object ID by page ID.
 * @param {string} [print] Fingerprint.
 * @returns {string} Link ID.
 */
export function newLink(group, type, objects, print) {
  const linkId = makeId('l');
  group.links[linkId] = { type, objects: { ...objects }, ...(print ? { print } : {}) };
  for (const objId of Object.values(objects)) {
    index.set(objId, { groupId: group.id, linkId });
    unmarkPageOnly(group, objId);
  }
  return linkId;
}

/**
 * Returns the link an object belongs to.
 *
 * @param {string} objId Object ID.
 * @returns {{group: object, linkId: string, link: object}|null} Link.
 */
export function linkOf(objId) {
  const entry = index.get(objId);
  if (!entry) {
    return null;
  }
  const group = getState().groups[entry.groupId];
  const link = group?.links[entry.linkId];
  if (!link) {
    index.delete(objId);
    return null;
  }
  return { group, linkId: entry.linkId, link };
}

/**
 * Puts an object into a link on a page (replacing any object there).
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} pageId Page ID.
 * @param {string} objId Object ID.
 * @returns {void}
 */
export function setLinkObject(group, linkId, pageId, objId) {
  const link = group.links[linkId];
  if (!link) {
    return;
  }
  const old = link.objects[pageId];
  if (old && old !== objId) {
    index.delete(old);
  }
  link.objects[pageId] = objId;
  index.set(objId, { groupId: group.id, linkId });
  unmarkPageOnly(group, objId);
}

/**
 * Takes a page's object out of a link. Drops the link when nothing is left.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function unlinkPage(group, linkId, pageId) {
  const link = group.links[linkId];
  if (!link) {
    return;
  }
  const objId = link.objects[pageId];
  if (objId) {
    index.delete(objId);
  }
  delete link.objects[pageId];
  if (group.hidden[linkId]) {
    delete group.hidden[linkId][pageId];
    if (Object.keys(group.hidden[linkId]).length === 0) {
      delete group.hidden[linkId];
    }
  }
  if (Object.keys(link.objects).length === 0 && !group.hidden[linkId]) {
    delete group.links[linkId];
  }
}

/**
 * Drops a whole link. Its objects stay, unlinked.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @returns {void}
 */
export function dropLink(group, linkId) {
  const link = group.links[linkId];
  if (!link) {
    return;
  }
  for (const objId of Object.values(link.objects)) {
    index.delete(objId);
  }
  delete group.links[linkId];
  delete group.hidden[linkId];
}

/**
 * Adds a page to a group.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function addPage(group, pageId) {
  if (!group.pages.includes(pageId)) {
    group.pages.push(pageId);
  }
}

/**
 * Takes a page out of a group. Its objects stay, unlinked. When the source
 * goes, the next page becomes the source; a group with no pages left is
 * deleted.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @returns {boolean} True when the group still exists.
 */
export function removePage(group, pageId) {
  for (const linkId of Object.keys(group.links)) {
    unlinkPage(group, linkId, pageId);
  }
  group.pages = group.pages.filter((p) => p !== pageId);
  for (const [playerId, p] of Object.entries(group.layout)) {
    if (p === pageId) {
      delete group.layout[playerId];
    }
  }
  if (group.pages.length === 0) {
    deleteGroup(group);
    return false;
  }
  if (group.source === pageId) {
    group.source = group.pages[0];
  }
  // A link left with one object no longer joins anything, but it is kept: a
  // page added later gets a copy.
  return true;
}

/**
 * Makes a page the group's source.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function setSource(group, pageId) {
  if (group.pages.includes(pageId)) {
    group.source = pageId;
    group.pages = [pageId, ...group.pages.filter((p) => p !== pageId)];
  }
}

/**
 * Marks an object as kept on its own page (never copied, never asked about).
 *
 * @param {object} group Group.
 * @param {string} objId Object ID.
 * @returns {void}
 */
export function markPageOnly(group, objId) {
  if (!group.pageOnly.includes(objId)) {
    group.pageOnly.push(objId);
  }
}

/**
 * Clears the page-only mark.
 *
 * @param {object} group Group.
 * @param {string} objId Object ID.
 * @returns {void}
 */
export function unmarkPageOnly(group, objId) {
  const i = group.pageOnly.indexOf(objId);
  if (i >= 0) {
    group.pageOnly.splice(i, 1);
  }
}

/**
 * Returns every synced-type object on a page.
 *
 * @param {string} pageId Page ID.
 * @returns {object[]} Objects.
 */
export function objectsOnPage(pageId) {
  const out = [];
  for (const type of SYNC_TYPES) {
    out.push(...findObjs({ _type: type, _pageid: pageId }));
  }
  return out;
}

/**
 * Finds a synced-type object by ID without knowing its type.
 *
 * @param {string} id Object ID.
 * @param {string} [type] Type, when known.
 * @returns {object|undefined} Object.
 */
export function findAny(id, type) {
  if (type) {
    return getObj(type, id);
  }
  for (const t of SYNC_TYPES) {
    const obj = getObj(t, id);
    if (obj) {
      return obj;
    }
  }
  return undefined;
}

/**
 * Drops index entries, links, layouts and page-only marks that point at
 * objects, pages or players that no longer exist.
 *
 * @returns {{links: number, pages: number}} What was removed.
 */
export function prune() {
  const removed = { links: 0, pages: 0 };
  for (const group of Object.values(getState().groups)) {
    for (const pageId of [...group.pages]) {
      if (!getObj('page', pageId)) {
        removed.pages += 1;
        if (!removePage(group, pageId)) {
          break;
        }
      }
    }
    if (!getState().groups[group.id]) {
      continue;
    }
    for (const [linkId, link] of Object.entries(group.links)) {
      for (const [pageId, objId] of Object.entries(link.objects)) {
        if (!getObj(link.type, objId)) {
          // A copy hidden by removal has no object on purpose.
          if (group.hidden[linkId]?.[pageId]?.snapshot) {
            continue;
          }
          delete link.objects[pageId];
          index.delete(objId);
        }
      }
      if (Object.keys(link.objects).length === 0 && !group.hidden[linkId]) {
        delete group.links[linkId];
        removed.links += 1;
      }
    }
    group.pageOnly = group.pageOnly.filter((id) => findAny(id));
    for (const playerId of Object.keys(group.layout)) {
      if (!getObj('player', playerId)) {
        delete group.layout[playerId];
      }
    }
  }
  rebuildIndex();
  return removed;
}
