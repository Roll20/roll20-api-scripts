import { TOKEN_MARKER_SEPARATOR } from './constants.js';
import { ensureState } from './state.js';
import { toText } from './utils.js';

/**
 * Applies a marker to a token if needed.
 *
 * @param {Graphic} token Target token.
 * @param {string} marker Marker name or tag.
 * @returns {boolean} True when the marker was added.
 */
export function applyMarker(token, marker) {
  const markerText = toText(marker);
  if (!token || !markerText) {
    return false;
  }

  const markers = getTokenMarkers(token);
  if (containsMarker(markers, markerText)) {
    return false;
  }

  markers.push(markerText);
  setTokenMarkers(token, markers);
  return true;
}

/**
 * Removes a marker if no remaining active condition needs it.
 *
 * @param {object} condition Condition being removed.
 * @returns {object} Marker removal result.
 */
export function removeMarkerIfUnused(condition) {
  const marker = toText(condition.marker);
  if (!marker) {
    return { removed: false, marker: '' };
  }

  if (isMarkerStillRequired(condition.targetTokenId, marker, condition.id)) {
    return { removed: false, marker };
  }

  const token = getObj('graphic', condition.targetTokenId);
  if (!token) {
    return { removed: false, marker };
  }

  const markers = getTokenMarkers(token);
  const nextMarkers = removeMarkerFromList(markers, marker);
  const removed = nextMarkers.length !== markers.length;
  if (removed) {
    setTokenMarkers(token, nextMarkers);
  }

  return { removed, marker };
}

/**
 * Returns true when another active condition still requires a marker.
 *
 * @param {string} targetTokenId Target token id.
 * @param {string} marker Marker name or tag.
 * @param {string} ignoredConditionId Condition id being removed.
 * @returns {boolean} True when the marker is still needed.
 */
export function isMarkerStillRequired(targetTokenId, marker, ignoredConditionId) {
  for (const condition of ensureState().active) {
    const sameTarget = condition.targetTokenId === targetTokenId;
    const sameMarker = condition.marker === marker;
    const differentCondition = condition.id !== ignoredConditionId;
    if (sameTarget && sameMarker && differentCondition) {
      return true;
    }
  }

  return false;
}

/**
 * Reads a token status marker list.
 *
 * @param {Graphic} token Token object.
 * @returns {string[]} Marker list.
 */
export function getTokenMarkers(token) {
  const text = toText(token.get('statusmarkers'));
  if (!text) {
    return [];
  }

  const markers = [];
  const parts = text.split(TOKEN_MARKER_SEPARATOR);
  for (const part of parts) {
    const marker = toText(part);
    if (marker) {
      markers.push(marker);
    }
  }

  return markers;
}

/**
 * Saves a token status marker list.
 *
 * @param {Graphic} token Token object.
 * @param {string[]} markers Marker list.
 * @returns {void}
 */
export function setTokenMarkers(token, markers) {
  token.set('statusmarkers', markers.join(TOKEN_MARKER_SEPARATOR));
}

/**
 * Returns true when a marker item matches a target marker name or tag.
 *
 * Handles badged markers (e.g. "grab@2") by comparing the base name.
 *
 * @param {string} item Marker item from a token's marker list.
 * @param {string} marker Marker name or tag to compare against.
 * @returns {boolean} True when the item matches.
 */
function matchesMarker(item, marker) {
  return item === marker || getMarkerBase(item) === marker;
}

/**
 * Returns true when a marker list already contains a marker.
 *
 * @param {string[]} markers Marker list.
 * @param {string} marker Marker name or tag.
 * @returns {boolean} True when present.
 */
export function containsMarker(markers, marker) {
  for (const item of markers) {
    if (matchesMarker(item, marker)) {
      return true;
    }
  }

  return false;
}

/**
 * Removes one marker from a marker list.
 *
 * @param {string[]} markers Marker list.
 * @param {string} marker Marker name or tag.
 * @returns {string[]} Marker list without the marker.
 */
export function removeMarkerFromList(markers, marker) {
  const nextMarkers = [];
  for (const item of markers) {
    if (!matchesMarker(item, marker)) {
      nextMarkers.push(item);
    }
  }

  return nextMarkers;
}

/**
 * Returns the marker name without a numeric badge suffix or a custom-marker
 * set id (the "::id" suffix Roll20 appends to marketplace marker tags).
 *
 * @param {string} marker Marker text.
 * @returns {string} Marker base.
 */
export function getMarkerBase(marker) {
  return toText(marker).split('@')[0].split('::')[0];
}

/**
 * Resolves a marker name to its full Roll20 tag.
 *
 * Roll20 custom (marketplace) markers must be referenced as "name::id" when
 * setting statusmarkers on a token. Default markers use just the name. This
 * function looks up the correct tag via Campaign().get('token_markers') so
 * the caller never has to worry about the difference.
 *
 * If the name already contains "::" it is returned unchanged. If no match is
 * found in the campaign data the original name is returned as a fallback.
 *
 * @param {string} name Marker name as the user provided it.
 * @returns {string} Full marker tag (e.g. "005-Unconscious::12345"), or the
 *   original name when no campaign match is found.
 */
export function resolveMarkerTag(name) {
  const text = toText(name);
  if (!text || text.includes('::')) {
    return text;
  }

  try {
    const raw = toText(Campaign().get('token_markers'));
    if (!raw) {
      return text;
    }
    const markers = JSON.parse(raw);
    if (!Array.isArray(markers)) {
      return text;
    }
    const found = markers.find((m) => m.name === text);
    return found ? toText(found.tag) || text : text;
  } catch (error) {
    log(`resolveMarkerTag error: ${error.message}`);
    return text;
  }
}
