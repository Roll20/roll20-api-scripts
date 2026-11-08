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
// queries and macros. Sheet values and marker names are shown through this.
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
 * Parses a number. Roll20 keeps bar values as numbers or as text ("10"), so
 * everything goes through here. Empty text is not a number (0.1.x read an
 * empty bar as 0 and marked the token dead).
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
  if (['on', 'true', 'yes', '1', 'checked'].includes(text)) {
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
 * Converts a hue (0 red to 120 green) to a hex colour at 75% saturation and
 * 50% lightness, as 0.1.x tinted tokens.
 *
 * @param {number} hue Hue in degrees.
 * @returns {string} Colour such as #df2020.
 */
export function hueToHex(hue) {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = 0.75;
  const l = 0.5;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    let x = t;
    if (x < 0) {
      x += 1;
    }
    if (x > 1) {
      x -= 1;
    }
    if (x < 1 / 6) {
      return p + (q - p) * 6 * x;
    }
    if (x < 1 / 2) {
      return q;
    }
    if (x < 2 / 3) {
      return p + (q - p) * (2 / 3 - x) * 6;
    }
    return p;
  };
  const hex = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${hex(channel(h + 1 / 3))}${hex(channel(h))}${hex(channel(h - 1 / 3))}`;
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
