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
 * Escapes text that came from a sheet or a name before it goes to chat. On top of
 * HTML escaping, it stops Roll20 running rolls, attribute calls, macros and queries
 * hidden in the text.
 *
 * @param {*} text Text to escape.
 * @returns {string} Safe text.
 */
export function escapeForChat(text) {
  return escapeHtml(text).replace(/[[\]{}@%?#|~`\\]/g, (ch) => `&#${ch.codePointAt(0)};`);
}

/**
 * Parses a whole number, rejecting anything that is not entirely digits
 * (with an optional leading sign).
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Parsed integer, or null when invalid.
 */
export function parseStrictInt(raw) {
  const text = toText(raw).replaceAll(',', '');
  return /^[-+]?\d+$/.test(text) ? Number(text) : null;
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
 * Reads an XP value from sheet text. Sheets hold numbers, "1,800", "33000 or 41000 in
 * lair", "450 XP" or placeholders such as "---"; the first number wins.
 *
 * @param {*} raw Sheet value.
 * @returns {number|null} Whole XP, or null when there is no number.
 */
export function parseXpText(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : null;
  }
  const match = toText(raw).match(/\d[\d,.\s]*/);
  if (!match) {
    return null;
  }
  let digits = match[0].replace(/[,\s]/g, '').replace(/\.$/, '');
  // "1.800" and "1.800.000" use dots as thousands separators; "2.5" is a decimal.
  digits = /^\d{1,3}(\.\d{3})+$/.test(digits) ? digits.replaceAll('.', '') : digits.split('.')[0];
  const value = Number(digits);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parses a challenge rating such as "1/4", "0.5", "½" or "CR 3".
 *
 * @param {*} raw Sheet value.
 * @returns {number|null} Challenge rating, or null when not a rating.
 */
export function parseChallenge(raw) {
  const text = toText(raw)
    .replace(/^cr\s*/i, '')
    .replace('½', '1/2')
    .replace('¼', '1/4')
    .replace('⅛', '1/8');
  const fraction = text.match(/^(\d+)\s*\/\s*(\d+)/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator > 0 ? Number(fraction[1]) / denominator : null;
  }
  const number = text.match(/^\d+(\.\d+)?/);
  return number ? Number(number[0]) : null;
}

/**
 * Formats a whole number with thousands separators, the same in every sandbox.
 *
 * @param {number} value Number to format.
 * @returns {string} Formatted number.
 */
export function formatNumber(value) {
  const n = Math.round(Number(value) || 0);
  const sign = n < 0 ? '-' : '';
  return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Splits a comma or space separated list, dropping blanks and repeats.
 *
 * @param {*} raw Raw list.
 * @returns {string[]} Items.
 */
export function splitList(raw) {
  return [
    ...new Set(
      toText(raw)
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];
}

/**
 * Returns true when the game runs on Jumpgate.
 *
 * @returns {boolean} True on Jumpgate.
 */
export function isJumpgate() {
  return Campaign()?.get?.('_release') === 'jumpgate';
}

/**
 * Returns the Mod Script sandbox version ("1.0", "1.5") when Roll20 reports it.
 *
 * @returns {string} Sandbox version, or an empty string.
 */
export function getSandboxVersion() {
  return toText(Campaign()?.sandboxVersion);
}

/**
 * Returns true when the sandbox can read and write Beacon sheets.
 *
 * @returns {boolean} True when getSheetItem and setSheetItem work.
 */
export function canUseBeacon() {
  const version = getSandboxVersion();
  return (
    typeof getSheetItem === 'function' &&
    typeof setSheetItem === 'function' &&
    (version === '' || Number(version) >= 1.5)
  );
}

/**
 * Makes a short random ID for awards and prompts.
 *
 * @returns {string} ID.
 */
export function makeId() {
  return Math.random().toString(36).slice(2, 8);
}
