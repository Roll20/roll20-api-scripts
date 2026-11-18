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

// Characters Roll20's chat would act on: rolls, attribute and ability calls,
// queries and macros. Page, token and group names are shown through this.
const CHAT_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
  '[': '&#91;',
  ']': '&#93;',
  '{': '&#123;',
  '}': '&#125;',
  '@': '&#64;',
  '%': '&#37;',
  '?': '&#63;',
  '#': '&#35;',
  '|': '&#124;',
  '`': '&#96;',
  '~': '&#126;',
};

/**
 * Escapes text so Roll20's chat shows it as written instead of running it.
 *
 * @param {*} text Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeForChat(text) {
  return String(text).replaceAll(/[&<>"'[\]{}@%?#|`~]/g, (c) => CHAT_ENTITIES[c]);
}

/**
 * Makes text safe as a roll-query option or default: Roll20 splits queries
 * on `|`, `,` and `}`.
 *
 * @param {*} text Text.
 * @returns {string} Text with those characters replaced.
 */
export function queryText(text) {
  return toText(text)
    .replaceAll(/[|,}{]/g, ' ')
    .replaceAll('"', "'");
}

/**
 * Parses a number.
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
 * Splits a comma-separated list, dropping blanks.
 *
 * @param {*} raw List text.
 * @returns {string[]} Items.
 */
export function splitList(raw) {
  return toText(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
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
 * Compares two Roll20 property values. Objects (door paths) are compared by
 * their JSON.
 *
 * @param {*} a First value.
 * @param {*} b Second value.
 * @returns {boolean} True when equal.
 */
export function sameValue(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a === 'object' || typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

/**
 * Deep-copies a JSON-safe value.
 *
 * @param {*} value Value.
 * @returns {*} Copy.
 */
export function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

let idCounter = 0;

/**
 * Makes a short ID: a prefix, the time in base 36 and a counter.
 *
 * @param {string} prefix Prefix such as `g` (group), `l` (link) or `r` (request).
 * @returns {string} ID.
 */
export function makeId(prefix) {
  idCounter = (idCounter + 1) % 1296;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36).padStart(2, '0')}${Math.floor(
    Math.random() * 1296
  )
    .toString(36)
    .padStart(2, '0')}`;
}

/**
 * Returns true when a key matches a key list in which entries ending in `*`
 * match every key with that start.
 *
 * @param {string} key Property key.
 * @param {string[]} list Key list.
 * @returns {boolean} True when listed.
 */
export function keyInList(key, list) {
  return list.some((entry) =>
    entry.endsWith('*') ? key.startsWith(entry.slice(0, -1)) : key === entry
  );
}

/**
 * Splits chat command text into words, keeping "double quoted" phrases whole.
 *
 * @param {string} text Command text.
 * @returns {string[]} Words.
 */
export function splitWords(text) {
  const words = [];
  const re = /"([^"]*)"|(\S+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    words.push(m[1] !== undefined ? m[1] : m[2]);
  }
  return words;
}
