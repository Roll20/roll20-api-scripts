// Hiding and showing one page's copy of a linked object. Hidden copies are
// recorded in state, so changes from other pages never undo a hide.
//   gmlayer: the copy moves to the GM layer; its wanted layer is remembered.
//   remove:  the copy is deleted and kept as a snapshot, and created again on show.

import { HIDDEN_LAYER } from './constants.js';
import { applyProps, canRecreate, createCopy, readProps } from './copy.js';
import { expectRemove } from './echo.js';
import { setLinkObject } from './groups.js';
import { getSetting } from './state.js';
import { isRecord } from './utils.js';

/**
 * Returns a copy's hidden record.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} pageId Page ID.
 * @returns {{layer: string, snapshot?: object}|null} Record.
 */
export function hiddenOn(group, linkId, pageId) {
  return group.hidden[linkId]?.[pageId] || null;
}

/**
 * Reads the turn order.
 *
 * @returns {object[]} Entries.
 */
function readTurnOrder() {
  try {
    const raw = Campaign().get('turnorder');
    const list = typeof raw === 'string' && raw ? JSON.parse(raw) : raw;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Takes an object's entries out of the turn order.
 *
 * @param {string} objId Object ID.
 * @returns {object[]} The entries removed, with their places.
 */
function takeTurns(objId) {
  const list = readTurnOrder();
  const taken = [];
  list.forEach((entry, i) => {
    if (isRecord(entry) && entry.id === objId) {
      taken.push({ index: i, entry });
    }
  });
  if (taken.length) {
    Campaign().set(
      'turnorder',
      JSON.stringify(list.filter((e) => !(isRecord(e) && e.id === objId)))
    );
  }
  return taken;
}

/**
 * Puts turn order entries back for a recreated object.
 *
 * @param {object[]} taken Entries from takeTurns.
 * @param {string} newId The new object's ID.
 * @returns {void}
 */
function returnTurns(taken, newId) {
  if (!Array.isArray(taken) || !taken.length) {
    return;
  }
  const list = readTurnOrder();
  for (const { index, entry } of taken) {
    list.splice(Math.min(index, list.length), 0, { ...entry, id: newId });
  }
  Campaign().set('turnorder', JSON.stringify(list));
}

/**
 * Hides one page's copy of a link.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} pageId Page ID.
 * @returns {{ok: boolean, mode?: string, fallback?: boolean, reason?: string}} Result.
 */
export function hideCopy(group, linkId, pageId) {
  const link = group.links[linkId];
  if (!link) {
    return { ok: false, reason: 'notLinked' };
  }
  if (hiddenOn(group, linkId, pageId)) {
    return { ok: true, mode: 'already' };
  }
  const obj = link.objects[pageId] ? getObj(link.type, link.objects[pageId]) : null;
  if (!obj) {
    return { ok: false, reason: 'noCopy' };
  }
  const layer = obj.get('layer') || 'objects';
  group.hidden[linkId] = group.hidden[linkId] || {};
  let mode = getSetting('hideMode', group);
  let fallback = false;
  if (mode === 'remove' && !canRecreate(link.type, readProps(obj))) {
    mode = 'gmlayer';
    fallback = true;
  }
  if (mode === 'remove') {
    const props = readProps(obj);
    const turns = takeTurns(obj.id);
    group.hidden[linkId][pageId] = { layer, snapshot: { props, turns } };
    delete link.objects[pageId];
    expectRemove(obj.id);
    obj.remove();
    return { ok: true, mode };
  }
  group.hidden[linkId][pageId] = { layer };
  if (layer !== HIDDEN_LAYER) {
    applyProps(obj, { layer: HIDDEN_LAYER });
  }
  return { ok: true, mode, fallback };
}

/**
 * Shows one page's hidden copy again.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} pageId Page ID.
 * @returns {{ok: boolean, reason?: string}} Result.
 */
export function showCopy(group, linkId, pageId) {
  const link = group.links[linkId];
  const h = hiddenOn(group, linkId, pageId);
  if (!link || !h) {
    return { ok: true };
  }
  if (h.snapshot) {
    const { obj, reason } = createCopy(link.type, { ...h.snapshot.props, layer: h.layer }, pageId);
    if (!obj) {
      return { ok: false, reason };
    }
    setLinkObject(group, linkId, pageId, obj.id);
    returnTurns(h.snapshot.turns, obj.id);
  } else {
    const obj = link.objects[pageId] ? getObj(link.type, link.objects[pageId]) : null;
    if (obj) {
      applyProps(obj, { layer: h.layer });
    }
  }
  delete group.hidden[linkId][pageId];
  if (Object.keys(group.hidden[linkId]).length === 0) {
    delete group.hidden[linkId];
  }
  return { ok: true };
}

/**
 * Applies changes from another page to a hidden copy: the layer becomes its
 * wanted layer, and a removed copy's snapshot is updated.
 *
 * @param {object} group Group.
 * @param {string} linkId Link ID.
 * @param {string} pageId Page ID.
 * @param {object} props Changed properties.
 * @returns {object} The properties still to write to a GM-layer copy.
 */
export function absorbIntoHidden(group, linkId, pageId, props) {
  const h = hiddenOn(group, linkId, pageId);
  if (!h) {
    return props;
  }
  const rest = { ...props };
  if ('layer' in rest) {
    h.layer = rest.layer;
    delete rest.layer;
  }
  if (h.snapshot) {
    Object.assign(h.snapshot.props, rest);
    return {};
  }
  return rest;
}
