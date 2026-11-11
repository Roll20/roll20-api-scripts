// Status markers: the game's marker list, finding a marker by name or tag, and
// changing a token's markers without touching ones DeathTracker did not add.

import { BUILTIN_MARKERS, COLOUR_MARKERS } from './constants.js';
import { toText } from './utils.js';

/**
 * @typedef {object} MarkerInfo
 * @property {string} tag What goes in statusmarkers (custom markers look like Name::1234).
 * @property {string} name Name shown to people.
 */

/**
 * Lists every marker in the game: libTokenMarkers' list when it is installed,
 * otherwise the campaign's token_markers plus the coloured dots.
 *
 * @returns {MarkerInfo[]} Markers.
 */
export function listMarkers() {
  const seen = new Map();
  const add = (tag, name) => {
    const t = toText(tag);
    if (t && !seen.has(t)) {
      seen.set(t, { tag: t, name: toText(name) || t });
    }
  };
  try {
    if (
      typeof libTokenMarkers !== 'undefined' &&
      typeof libTokenMarkers.getOrderedList === 'function'
    ) {
      for (const m of libTokenMarkers.getOrderedList()) {
        add(m.tag, m.name);
      }
    }
  } catch {
    // Fall back to the campaign's own list.
  }
  if (!seen.size) {
    for (const tag of COLOUR_MARKERS) {
      add(tag, tag);
    }
    let custom = [];
    try {
      custom = JSON.parse(Campaign().get('token_markers') || '[]');
    } catch {
      custom = [];
    }
    for (const m of Array.isArray(custom) ? custom : []) {
      add(m?.tag, m?.name);
    }
    for (const tag of BUILTIN_MARKERS) {
      add(tag, tag);
    }
  }
  return [...seen.values()];
}

/**
 * Finds a marker by tag or name. Tags are matched exactly first, then without
 * regard to case; names without regard to case. A leading "status_" is ignored.
 *
 * @param {*} raw What the GM typed.
 * @param {MarkerInfo[]} [markers] Marker list (read from the game when omitted).
 * @returns {{tag: string, known: boolean}|null} The tag ('' for none), whether the game has it; null when nothing was typed.
 */
export function resolveMarker(raw, markers = listMarkers()) {
  const text = toText(raw).replace(/^status_/, '');
  if (!text) {
    return null;
  }
  if (['none', 'off', '-'].includes(text.toLowerCase())) {
    return { tag: '', known: true };
  }
  const lower = text.toLowerCase();
  const hit =
    markers.find((m) => m.tag === text) ||
    markers.find((m) => m.tag.toLowerCase() === lower) ||
    markers.find((m) => m.name.toLowerCase() === lower) ||
    markers.find((m) => m.tag.split('::')[0].toLowerCase() === lower);
  return hit ? { tag: hit.tag, known: true } : { tag: text, known: false };
}

/**
 * Returns the name of a marker for menus.
 *
 * @param {string} tag Marker tag.
 * @param {MarkerInfo[]} [markers] Marker list.
 * @returns {string} Name, or the tag when the game has no such marker.
 */
export function markerName(tag, markers = listMarkers()) {
  if (!tag) {
    return '';
  }
  return markers.find((m) => m.tag === tag)?.name || tag;
}

/**
 * Splits a token's statusmarkers into entries (tag with any @badge).
 *
 * @param {object} token Roll20 graphic.
 * @returns {string[]} Entries.
 */
export function markerEntries(token) {
  return toText(token.get('statusmarkers'))
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
}

/**
 * Returns true when a token shows a marker.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} tag Marker tag.
 * @returns {boolean} True when present.
 */
export function hasMarker(token, tag) {
  return !!tag && markerEntries(token).some((m) => m.split('@')[0] === tag);
}

/**
 * Works out a token's new statusmarkers.
 *
 * @param {string[]} entries Current entries.
 * @param {string[]} add Tags to show.
 * @param {string[]} remove Tags to take away.
 * @returns {string[]} New entries.
 */
export function editEntries(entries, add, remove) {
  const out = entries.filter((m) => !remove.includes(m.split('@')[0]));
  for (const tag of add) {
    if (tag && !out.some((m) => m.split('@')[0] === tag)) {
      out.push(tag);
    }
  }
  return out;
}

/**
 * Shows the wanted markers and takes away the ones DeathTracker added before
 * that are no longer wanted. Markers the GM or other Mods put on are left.
 *
 * @param {object} token Roll20 graphic.
 * @param {string[]} owned Tags DeathTracker added earlier.
 * @param {string[]} wanted Tags that should show now.
 * @returns {string[]} Tags DeathTracker owns afterwards.
 */
export function applyMarkers(token, owned, wanted) {
  const entries = markerEntries(token);
  const want = wanted.filter(Boolean);
  const remove = owned.filter((tag) => !want.includes(tag));
  const add = want.filter((tag) => !entries.some((m) => m.split('@')[0] === tag));
  const next = editEntries(entries, add, remove);
  if (next.join(',') !== entries.join(',')) {
    token.set('statusmarkers', next.join(','));
  }
  // Only what DeathTracker put there itself is its to take away later.
  return [...new Set([...owned.filter((tag) => want.includes(tag)), ...add])];
}
