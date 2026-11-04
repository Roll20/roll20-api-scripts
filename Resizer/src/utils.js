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
 * Rounds a number for messages: at most two decimals, no trailing zeros.
 *
 * @param {number} value Number.
 * @returns {string} Short text.
 */
export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  return String(Math.round(value * 100) / 100);
}

/**
 * Rounds a coordinate so repeated zooms do not pile up float noise
 * (six decimals is far below a pixel).
 *
 * @param {number} value Number.
 * @returns {number} Rounded number.
 */
export function roundCoord(value) {
  return Math.round(value * 1e6) / 1e6;
}
