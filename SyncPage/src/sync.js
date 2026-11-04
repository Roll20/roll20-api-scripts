// Mirroring: add, change and destroy events on a group's pages are copied to
// the group's other pages. Page settings are mirrored too.

import { buildButton, buildSecondaryButton, whisper } from './chat.js';
import {
  ADD_DEBOUNCE_MS,
  BATCH_PAUSE_MS,
  BATCH_SIZE,
  COMMAND,
  HIDDEN_LAYER,
  PAGE_NEVER_SYNC,
  PAGE_SETS,
  SYNC_TYPES,
} from './constants.js';
import { applyProps, createCopy, fingerprint, readProps, syncableChanges } from './copy.js';
import { expectRemove, filterEcho, isOwnRemoval } from './echo.js';
import {
  dropLink,
  groupOfPage,
  linkOf,
  markPageOnly,
  newLink,
  pageName,
  removePage,
  unlinkPage,
  unmarkPageOnly,
} from './groups.js';
import { t } from './i18n.js';
import { addToRecycle } from './recycle.js';
import { createRequest } from './requests.js';
import { getLang, getSetting } from './state.js';
import { escapeHtml, keyInList, sameValue } from './utils.js';
import { absorbIntoHidden, hiddenOn } from './visibility.js';

/** @type {Map<string, {type: string, id: string}>} */
const pendingAdds = new Map();
let addTimer = null;
const observers = [];
// Images already reported as not copyable, so the GM is told once each.
const reportedImages = new Set();

/**
 * Runs a job over items, a slice at a time, so a big job does not stop the
 * sandbox. Small jobs run at once.
 *
 * @param {Array} items Items.
 * @param {Function} each Called with each item.
 * @param {Function} [done] Called when every item is done.
 * @returns {void}
 */
export function runJob(items, each, done) {
  if (items.length <= BATCH_SIZE) {
    items.forEach((item) => each(item));
    done?.();
    return;
  }
  let i = 0;
  const step = () => {
    const end = Math.min(i + BATCH_SIZE, items.length);
    for (; i < end; i++) {
      each(items[i]);
    }
    if (i < items.length) {
      setTimeout(step, BATCH_PAUSE_MS);
    } else {
      done?.();
    }
  };
  step();
}

/**
 * Registers a function told about every mirrored change.
 *
 * @param {Function} fn Called with {kind, group, linkId, source, copies}.
 * @returns {void}
 */
export function onSync(fn) {
  if (typeof fn === 'function') {
    observers.push(fn);
  }
}

/**
 * Tells the observers. One failing observer does not stop the others.
 *
 * @param {object} event Event.
 * @returns {void}
 */
function tell(event) {
  for (const fn of observers) {
    try {
      fn(event);
    } catch (e) {
      log(`SyncPage: an onSync observer failed: ${e?.stack || e}`);
    }
  }
}

/**
 * Returns true when objects on this layer are left alone.
 *
 * @param {object} group Group.
 * @param {string} layer Layer.
 * @returns {boolean} True when excluded.
 */
export function layerExcluded(group, layer) {
  return (getSetting('excludeLayers', group) || []).includes(layer);
}

/**
 * Tells the GM once about images the API cannot copy.
 *
 * @param {object} obj Object whose image could not be copied.
 * @returns {void}
 */
function reportImage(obj) {
  const key = String(obj.get('imgsrc') || '');
  if (reportedImages.has(key)) {
    return;
  }
  reportedImages.add(key);
  const lang = getLang();
  whisper(
    null,
    t('titles.warning', lang),
    `<div>${escapeHtml(t('messages.imageNotCopied', lang, { name: obj.get('name') || obj.id, page: pageName(obj.get('_pageid')) }))}</div>`
  );
}

/**
 * Copies a new object to every other page of its group and links the copies.
 *
 * @param {object} group Group.
 * @param {object} obj New object.
 * @returns {{linkId: string|null, created: number, failed: number}} Result.
 */
export function mirrorNew(group, obj) {
  const type = obj.get('_type');
  const pageId = obj.get('_pageid');
  const props = readProps(obj);
  const objects = { [pageId]: obj.id };
  let created = 0;
  let failed = 0;
  for (const p of group.pages) {
    if (p === pageId || !getObj('page', p)) {
      continue;
    }
    const { obj: copy, reason } = createCopy(type, props, p);
    if (copy) {
      objects[p] = copy.id;
      created += 1;
    } else {
      failed += 1;
      if (reason === 'image') {
        reportImage(obj);
      }
    }
  }
  const linkId = newLink(group, type, objects, fingerprint(type, props));
  tell({ kind: 'create', group, linkId, source: obj, copies: objects });
  return { linkId, created, failed };
}

/**
 * Handles a new object after the debounce: copies it unless the group or
 * its settings say otherwise.
 *
 * @param {{type: string, id: string}} ref The object.
 * @returns {void}
 */
function processAdd(ref) {
  const obj = getObj(ref.type, ref.id);
  if (!obj || linkOf(obj.id)) {
    return;
  }
  const pageId = obj.get('_pageid');
  const group = groupOfPage(pageId);
  if (!group || group.paused || layerExcluded(group, obj.get('layer'))) {
    return;
  }
  if (getSetting('newObjects', group) === 'sourceOnly' && pageId !== group.source) {
    markPageOnly(group, obj.id);
    return;
  }
  mirrorNew(group, obj);
}

/**
 * Copies every object waiting since the last add events.
 *
 * @returns {void}
 */
export function flushAdds() {
  addTimer = null;
  const items = [...pendingAdds.values()];
  pendingAdds.clear();
  runJob(items, processAdd);
}

/**
 * Handles add:<type>. New objects are collected for a moment so a paste or
 * a burst is handled together and property changes that follow have landed.
 *
 * @param {object} obj New object.
 * @returns {void}
 */
export function handleAdd(obj) {
  const type = obj?.get('_type');
  if (!SYNC_TYPES.includes(type)) {
    return;
  }
  const group = groupOfPage(obj.get('_pageid'));
  if (!group || group.paused) {
    return;
  }
  pendingAdds.set(obj.id, { type, id: obj.id });
  if (addTimer === null) {
    addTimer = setTimeout(flushAdds, ADD_DEBOUNCE_MS);
  }
}

/**
 * Returns the keys whose values changed.
 *
 * @param {object} obj Changed object.
 * @param {object} prev Previous attributes.
 * @returns {string[]} Keys.
 */
function changedKeys(obj, prev) {
  if (!prev) {
    return Object.keys(readProps(obj));
  }
  const keys = [];
  for (const key of Object.keys(prev)) {
    if (!key.startsWith('_') && !sameValue(prev[key], obj.get(key))) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Removes every copy of a link except the given object, putting them in the
 * recycle bin.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} keepId Object to keep (or none).
 * @param {string} reason Recycle reason.
 * @param {object[]} [items] Snapshots already taken (such as the deleted object).
 * @returns {number} How many copies were removed.
 */
export function removeCopies(group, linkId, keepId, reason, items = []) {
  const link = group.links[linkId];
  if (!link) {
    return 0;
  }
  let n = 0;
  for (const [pageId, objId] of Object.entries(link.objects)) {
    if (objId === keepId) {
      continue;
    }
    const obj = getObj(link.type, objId);
    if (obj) {
      items.push({
        linkId,
        pageId,
        type: link.type,
        props: readProps(obj),
        hidden: hiddenOn(group, linkId, pageId)
          ? { layer: hiddenOn(group, linkId, pageId).layer }
          : null,
      });
      expectRemove(objId);
      obj.remove();
      n += 1;
    }
  }
  for (const [pageId, h] of Object.entries(group.hidden[linkId] || {})) {
    if (h.snapshot) {
      items.push({
        linkId,
        pageId,
        type: link.type,
        props: { ...h.snapshot.props, layer: HIDDEN_LAYER },
        hidden: { layer: h.layer },
      });
    }
  }
  addToRecycle(group, reason, items);
  return n;
}

/**
 * Handles change:<type>: mirrors the changed properties to the linked copies.
 *
 * @param {object} obj Changed object.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
export function handleChange(obj, prev) {
  const type = obj?.get('_type');
  if (!SYNC_TYPES.includes(type)) {
    return;
  }
  const pageId = obj.get('_pageid');
  const group = groupOfPage(pageId);
  if (!group || group.paused) {
    return;
  }
  let keys = filterEcho(obj, changedKeys(obj, prev));
  if (!keys.length) {
    return;
  }
  const found = linkOf(obj.id);
  const layer = obj.get('layer');
  if (!found) {
    // Moved off an excluded layer: it joins the group now.
    if (
      keys.includes('layer') &&
      prev &&
      layerExcluded(group, prev.layer) &&
      !layerExcluded(group, layer) &&
      !group.pageOnly.includes(obj.id)
    ) {
      mirrorNew(group, obj);
    }
    return;
  }
  const { linkId, link } = found;
  if (keys.includes('layer') && layerExcluded(group, layer)) {
    // Moved onto an excluded layer: the copies go and it stays here alone.
    removeCopies(group, linkId, obj.id, 'exclude');
    dropLink(group, linkId);
    return;
  }
  const own = hiddenOn(group, linkId, pageId);
  if (own && keys.includes('layer')) {
    // The GM moved a hidden copy by hand: off the GM layer means show it here.
    if (layer !== HIDDEN_LAYER) {
      delete group.hidden[linkId][pageId];
      if (Object.keys(group.hidden[linkId]).length === 0) {
        delete group.hidden[linkId];
      }
    }
    keys = keys.filter((k) => k !== 'layer');
  }
  const props = syncableChanges(obj, keys, group);
  if (!Object.keys(props).length) {
    return;
  }
  const pages = new Set([...Object.keys(link.objects), ...Object.keys(group.hidden[linkId] || {})]);
  for (const p of pages) {
    if (p === pageId) {
      continue;
    }
    const rest = absorbIntoHidden(group, linkId, p, props);
    const copy = link.objects[p] ? getObj(type, link.objects[p]) : null;
    if (copy && Object.keys(rest).length) {
      applyProps(copy, rest);
    }
  }
  tell({ kind: 'change', group, linkId, source: obj, copies: { ...link.objects }, props });
}

/**
 * Whispers the GM a choice after a delete was kept to one page.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {object} obj Deleted object.
 * @param {string} entry Recycle entry ID.
 * @returns {void}
 */
function askAboutDelete(group, linkId, obj, entry) {
  const lang = getLang();
  const all = createRequest('deleteAll', '', { groupId: group.id, linkId, entry });
  const undo = createRequest('restore', '', { groupId: group.id, entry });
  const name = obj.get('name') || obj.get('text') || t(`types.${obj.get('_type')}`, lang);
  whisper(null, t('titles.deleted', lang), [
    `<div>${escapeHtml(t('messages.deletedAsk', lang, { name, page: pageName(obj.get('_pageid')) }))}</div>`,
    `<div style="margin-top:4px">${buildButton(t('buttons.deleteEverywhere', lang), `${COMMAND} request ${all}`)}${buildSecondaryButton(t('buttons.keepOthers', lang), `${COMMAND} request ${all} keep`)}${buildSecondaryButton(t('buttons.undo', lang), `${COMMAND} request ${undo}`)}</div>`,
  ]);
}

/**
 * Handles destroy:<type>: follows the group's deleteMode.
 *
 * @param {object} obj Deleted object.
 * @returns {void}
 */
export function handleDestroy(obj) {
  const type = obj?.get('_type');
  if (!SYNC_TYPES.includes(type)) {
    return;
  }
  pendingAdds.delete(obj.id);
  if (isOwnRemoval(obj.id)) {
    return;
  }
  const found = linkOf(obj.id);
  if (!found) {
    const group = groupOfPage(obj.get('_pageid'));
    if (group) {
      unmarkPageOnly(group, obj.id);
    }
    return;
  }
  const { group, linkId } = found;
  const pageId = obj.get('_pageid');
  const mine = {
    linkId,
    pageId,
    type,
    props: readProps(obj),
    hidden: hiddenOn(group, linkId, pageId)
      ? { layer: hiddenOn(group, linkId, pageId).layer }
      : null,
  };
  const mode = group.paused ? 'unlink' : getSetting('deleteMode', group);
  if (mode === 'all' || (mode === 'source' && pageId === group.source)) {
    removeCopies(group, linkId, obj.id, 'delete', [mine]);
    dropLink(group, linkId);
    tell({ kind: 'destroy', group, linkId, source: obj, copies: {} });
    return;
  }
  unlinkPage(group, linkId, pageId);
  const entry = addToRecycle(group, 'delete', [mine]);
  if (mode === 'ask' && group.links[linkId]) {
    askAboutDelete(group, linkId, obj, entry);
  }
}

/**
 * Returns the page keys a group keeps per page.
 *
 * @param {object} group Group.
 * @returns {string[]} Keys.
 */
function localPageKeys(group) {
  return (getSetting('localPageSettings', group) || []).flatMap((name) => PAGE_SETS[name] || []);
}

/**
 * Returns the page settings to mirror from a page.
 *
 * @param {object} page Page.
 * @param {string[]} keys Keys to consider.
 * @param {object} group Group.
 * @returns {object} Settings.
 */
export function pageSettingsFrom(page, keys, group) {
  const local = localPageKeys(group);
  const out = {};
  for (const key of keys) {
    if (key.startsWith('_') || PAGE_NEVER_SYNC.includes(key) || keyInList(key, local)) {
      continue;
    }
    out[key] = page.get(key);
  }
  return out;
}

/**
 * Handles change:page: mirrors page settings to the group's other pages.
 *
 * @param {object} page Page.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
export function handlePageChange(page, prev) {
  const group = groupOfPage(page.id);
  if (!group || group.paused || !getSetting('syncPageSettings', group)) {
    return;
  }
  const keys = filterEcho(page, changedKeys(page, prev));
  const props = pageSettingsFrom(page, keys, group);
  if (!Object.keys(props).length) {
    return;
  }
  for (const p of group.pages) {
    const other = p !== page.id ? getObj('page', p) : null;
    if (other) {
      applyProps(other, props);
    }
  }
}

/**
 * Copies the source page's settings to the group's other pages (or one page).
 *
 * @param {object} group Group.
 * @param {object} [options] Options.
 * @param {string} [options.only] Only this page.
 * @param {boolean} [options.dryRun=false] Count without changing anything.
 * @returns {number} How many pages had settings that differed.
 */
export function copyPageSettings(group, { only, dryRun = false } = {}) {
  const source = getObj('page', group.source);
  if (!source || !getSetting('syncPageSettings', group)) {
    return 0;
  }
  const props = pageSettingsFrom(source, Object.keys(source.toJSON()), group);
  let n = 0;
  for (const p of group.pages) {
    if (p === group.source || (only && p !== only)) {
      continue;
    }
    const page = getObj('page', p);
    if (!page) {
      continue;
    }
    const differs = Object.entries(props).some(([k, v]) => !sameValue(page.get(k), v));
    if (differs) {
      n += 1;
      if (!dryRun) {
        applyProps(page, props);
      }
    }
  }
  return n;
}

/**
 * Handles destroy:page: the page leaves its group.
 *
 * @param {object} page Page.
 * @returns {void}
 */
export function handlePageDestroy(page) {
  const group = groupOfPage(page.id);
  if (group) {
    removePage(group, page.id);
  }
}

/**
 * Mirrors a change another Mod made (API changes raise no events).
 *
 * @param {object} obj Changed object.
 * @param {object} [prev] Previous attributes; without them every property is pushed.
 * @returns {boolean} True when the object is linked.
 */
export function notify(obj, prev) {
  if (!obj || !linkOf(obj.id)) {
    return false;
  }
  handleChange(obj, prev);
  return true;
}

/**
 * Forgets runtime queues (tests).
 *
 * @returns {void}
 */
export function resetSyncRuntime() {
  pendingAdds.clear();
  if (addTimer !== null) {
    clearTimeout(addTimer);
  }
  addTimer = null;
  reportedImages.clear();
  observers.length = 0;
}
