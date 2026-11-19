// Token markers: Roll20's coloured dots plus every marker in the game's
// token marker sets, custom sets included.

import { COLOUR_MARKERS, SHEET_MARKER_PREFIX } from './constants.js';
import { toText } from './utils.js';

/**
 * Reads the game's token markers. Custom markers have tags like
 * `Heroic::12345`, so they survive being renamed.
 *
 * @returns {{tag: string, name: string, url: string}[]} Markers.
 */
export function readCampaignMarkers() {
  let list = [];
  try {
    list = JSON.parse(Campaign().get('_token_markers') || '[]');
  } catch {
    list = [];
  }
  return (Array.isArray(list) ? list : [])
    .filter((m) => m && typeof m.tag === 'string' && m.tag)
    .map((m) => ({ tag: m.tag, name: toText(m.name) || m.tag, url: toText(m.url) }));
}

/**
 * Lists the markers the GM can choose from. The D&D 2024 sheet's own
 * condition markers are left out, because the sheet sets and clears them.
 *
 * @returns {{tag: string, name: string, url: string}[]} Markers.
 */
export function listMarkers() {
  const colours = COLOUR_MARKERS.map((tag) => ({
    tag,
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    url: '',
  }));
  const seen = new Set(colours.map((m) => m.tag));
  const others = readCampaignMarkers().filter(
    (m) => !m.tag.startsWith(SHEET_MARKER_PREFIX) && !seen.has(m.tag) && seen.add(m.tag)
  );
  return [...colours, ...others];
}

/**
 * Finds a marker by its tag or name, whatever its case.
 *
 * @param {string} text Tag or name.
 * @returns {{tag: string, name: string, url: string}|null} Marker, or null when the game has none by that name.
 */
export function resolveMarker(text) {
  const wanted = toText(text);
  if (!wanted) {
    return null;
  }
  const markers = listMarkers();
  const lower = wanted.toLowerCase();
  return (
    markers.find((m) => m.tag === wanted) ||
    markers.find((m) => m.tag.toLowerCase() === lower) ||
    markers.find((m) => m.name.toLowerCase() === lower) ||
    null
  );
}

/**
 * Returns a readable name for a marker tag.
 *
 * @param {string} tag Marker tag.
 * @returns {string} Name.
 */
export function markerName(tag) {
  return listMarkers().find((m) => m.tag === tag)?.name || toText(tag).split('::')[0];
}
