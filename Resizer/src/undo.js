// Undo history. Each command records what it changed in one entry, across
// every page it touched; the last UNDO_DEPTH entries are kept in state, so
// they survive a sandbox restart.
//
// Entry: { id, label, vars, at, pages: [{id, before}], changed: [{type, id, before}],
//          created: [{type, id}], removed: [{type, props}], zooms: [{pageId, factor}] }

import { MAX_UNDO_CHARS, UNDO_DEPTH } from './constants.js';
import { notifyZoom } from './hooks.js';
import { GEOMETRY_KEYS, legacyPathProps, snapshot } from './objects.js';
import { getState } from './state.js';

/**
 * Starts recording a change. Make every change through the recorder, then
 * call commit().
 *
 * @param {string} label Message key describing the change (history.*).
 * @param {object} [vars] Values for the label.
 * @returns {object} Recorder.
 */
export function startChange(label, vars = {}) {
  const entry = {
    id: `u${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    label,
    vars,
    at: Date.now(),
    pages: [],
    changed: [],
    created: [],
    removed: [],
    zooms: [],
  };
  const seen = new Set();
  const seenPages = new Set();
  let count = 0;

  return {
    entry,
    /** Number of objects changed so far. */
    get count() {
      return count;
    },
    /**
     * Changes an object, remembering its old geometry the first time.
     *
     * @param {string} type Object type.
     * @param {object} obj Roll20 object.
     * @param {object} attrs New attributes.
     */
    set(type, obj, attrs) {
      if (!seen.has(obj.id)) {
        seen.add(obj.id);
        entry.changed.push({ type, id: obj.id, before: snapshot(type, obj) });
      }
      obj.set(attrs);
      count++;
    },
    /**
     * Changes a page, remembering its old size and grid the first time.
     *
     * @param {object} page Roll20 page.
     * @param {object} attrs New attributes.
     */
    setPage(page, attrs) {
      if (!seenPages.has(page.id)) {
        seenPages.add(page.id);
        entry.pages.push({ id: page.id, before: snapshot('page', page) });
      }
      page.set(attrs);
    },
    /**
     * Draws a Legacy path again with new properties and removes the old one.
     *
     * @param {object} obj Roll20 path.
     * @param {object} changes Properties that differ.
     * @returns {object|null} The new path.
     */
    redrawPath(obj, changes) {
      const props = legacyPathProps(obj);
      const made = createObj('path', { ...props, ...changes });
      if (!made) {
        return null;
      }
      entry.removed.push({ type: 'path', id: obj.id, props });
      entry.created.push({ type: 'path', id: made.id });
      obj.remove();
      count++;
      return made;
    },
    /**
     * Notes a page zoom so undo can tell other Mods.
     *
     * @param {string} pageId Page ID.
     * @param {number} factor Zoom factor.
     */
    zoomed(pageId, factor) {
      entry.zooms.push({ pageId, factor });
    },
    /**
     * Saves the entry to the history.
     *
     * @returns {{stored: boolean}} False when the change was too big to keep for undo.
     */
    commit() {
      if (count === 0 && entry.pages.length === 0) {
        return { stored: false, empty: true };
      }
      return pushEntry(entry);
    },
  };
}

/**
 * Adds an entry to the history, dropping the oldest when there are too many
 * or they take too much room.
 *
 * @param {object} entry Entry.
 * @returns {{stored: boolean}} False when the entry alone is too big.
 */
export function pushEntry(entry) {
  const s = getState();
  const size = JSON.stringify(entry).length;
  if (size > MAX_UNDO_CHARS) {
    return { stored: false };
  }
  s.undo.push(entry);
  while (s.undo.length > UNDO_DEPTH) {
    s.undo.shift();
  }
  while (s.undo.length > 1 && JSON.stringify(s.undo).length > MAX_UNDO_CHARS) {
    s.undo.shift();
  }
  return { stored: true };
}

/**
 * Returns the history, newest first.
 *
 * @returns {object[]} Entries.
 */
export function listHistory() {
  return [...getState().undo].reverse();
}

/**
 * Forgets the history.
 *
 * @returns {number} Entries forgotten.
 */
export function clearHistory() {
  const s = getState();
  const n = s.undo.length;
  s.undo = [];
  return n;
}

/**
 * Undoes the newest change.
 *
 * @returns {{ok: boolean, entry?: object, restored?: number, missing?: number}} Result.
 */
export function undoLast() {
  const s = getState();
  const entry = s.undo.pop();
  if (!entry) {
    return { ok: false };
  }
  let restored = 0;
  let missing = 0;
  for (const { type, id } of entry.created || []) {
    getObj(type, id)?.remove();
  }
  for (const { type, id, props } of entry.removed || []) {
    const made = createObj(type, props);
    if (made) {
      restored++;
      // Older entries know the drawing by its old ID.
      if (id) {
        relink(s.undo, id, made.id);
      }
    } else {
      missing++;
    }
  }
  for (const { type, id, before } of entry.changed || []) {
    const obj = getObj(type, id);
    if (obj) {
      obj.set(before);
      restored++;
    } else {
      missing++;
    }
  }
  for (const { id, before } of entry.pages || []) {
    const page = getObj('page', id);
    if (page) {
      page.set(pickKeys(before, GEOMETRY_KEYS.page));
    } else {
      missing++;
    }
  }
  for (const { pageId, factor } of [...(entry.zooms || [])].reverse()) {
    if (factor) {
      notifyZoom(pageId, 1 / factor);
    }
  }
  return { ok: true, entry, restored, missing };
}

/**
 * Points older entries at a drawing's new ID after undo drew it again.
 *
 * @param {object[]} entries Entries still in the history.
 * @param {string} oldId ID the drawing had.
 * @param {string} newId ID it has now.
 * @returns {void}
 */
function relink(entries, oldId, newId) {
  for (const e of entries) {
    for (const list of [e.created || [], e.changed || [], e.removed || []]) {
      for (const item of list) {
        if (item.id === oldId) {
          item.id = newId;
        }
      }
    }
  }
}

/**
 * Copies the listed keys that are present.
 *
 * @param {object} obj Source.
 * @param {string[]} keys Keys.
 * @returns {object} Copy.
 */
function pickKeys(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (obj && key in obj) {
      out[key] = obj[key];
    }
  }
  return out;
}
