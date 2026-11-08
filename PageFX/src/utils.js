/**
 * Returns true when a value is a plain non-null, non-array object.
 *
 * @param {*} value Value to test.
 * @returns {boolean} True when the value is a record.
 */
export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Converts a value to trimmed text, treating null and undefined as empty.
 *
 * @param {*} value Value to convert.
 * @returns {string} Trimmed string.
 */
export function toText(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

/**
 * Escapes HTML special characters.
 *
 * @param {*} text Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Parses a number. Roll20 stores bar values, aura radii and some page sizes as
 * text (hex pages report widths such as "27.93"), so everything goes through here.
 *
 * @param {*} raw Raw value.
 * @returns {number|null} Finite number, or null when the value is empty or not a number.
 */
export function toNumber(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  const text = toText(raw);
  if (text === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(text)) {
    return null;
  }
  return Number(text);
}

/**
 * Parses a yes/no style value.
 *
 * @param {*} raw Raw input.
 * @returns {boolean|null} Parsed boolean, or null when not recognised.
 */
export function parseBoolean(raw) {
  if (typeof raw === 'boolean') {
    return raw;
  }
  const text = toText(raw).toLowerCase();
  if (['on', 'true', 'yes', '1'].includes(text)) {
    return true;
  }
  if (['off', 'false', 'no', '0'].includes(text)) {
    return false;
  }
  return null;
}

/**
 * Clamps a number to a range.
 *
 * @param {number} value Value.
 * @param {number} min Lower bound.
 * @param {number} max Upper bound.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Turns a token's GM Notes into plain text. Roll20 stores GM Notes URI-encoded
 * and wrapped in HTML; v1 read effect names and JSON from there.
 *
 * @param {*} raw GM Notes value.
 * @returns {string} Plain text.
 */
export function decodeNotes(raw) {
  let text = toText(raw);
  try {
    text = decodeURIComponent(text);
  } catch {
    // Keep the text as it is when it is not URI-encoded.
  }
  return text
    .replaceAll(/<br\s*\/?>/gi, ' ')
    .replaceAll(/<\/?[^>]+>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .trim();
}

/**
 * Returns a token's status markers as a list of names (without badges).
 *
 * @param {object} token Roll20 graphic.
 * @returns {string[]} Marker names.
 */
export function getMarkers(token) {
  return toText(token.get('statusmarkers'))
    .split(',')
    .map((m) => m.split('@')[0].trim())
    .filter(Boolean);
}

/**
 * Returns true when a token carries a status marker.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} marker Marker name.
 * @returns {boolean} True when present.
 */
export function hasMarker(token, marker) {
  return getMarkers(token).includes(marker) || token.get(`status_${marker}`) === true;
}

/**
 * Shortens text to a maximum length.
 *
 * @param {*} text Text.
 * @param {number} max Maximum length.
 * @returns {string} Text, cut with an ellipsis when too long.
 */
export function truncate(text, max) {
  const s = toText(text);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/**
 * Returns the current time in milliseconds.
 *
 * @returns {number} Milliseconds since the epoch.
 */
export function now() {
  return Date.now();
}
