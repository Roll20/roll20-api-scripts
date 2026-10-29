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
 * Escapes text for an HTML attribute, such as a button's command. Roll20
 * syntax is left alone so ?{queries} in buttons still work.
 *
 * @param {*} text Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeAttr(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Escapes text for display. Roll20 syntax characters are encoded too:
 * sendChat resolves @{...} and %{...} and rolls [[...]] even in a mod's
 * whispers, and drops the whole message when a reference cannot be found.
 *
 * @param {*} text Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeHtml(text) {
  return escapeAttr(text)
    .replaceAll('@', '&#64;')
    .replaceAll('%', '&#37;')
    .replaceAll('[', '&#91;')
    .replaceAll(']', '&#93;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');
}

/**
 * Escapes text for use inside a regular expression.
 *
 * @param {string} text Literal text.
 * @returns {string} Escaped pattern.
 */
export function escapeRegExp(text) {
  return String(text).replaceAll(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Decodes the handful of HTML entities Roll20 puts into chat content.
 *
 * @param {string} text Text with entities.
 * @returns {string} Decoded text.
 */
export function decodeEntities(text) {
  return String(text)
    .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replaceAll(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&');
}

/**
 * Parses a whole number, rejecting anything that is not entirely digits
 * (with an optional leading minus sign).
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Parsed integer, or null when invalid.
 */
export function parseStrictInt(raw) {
  const text = toText(raw);
  return /^-?\d+$/.test(text) ? Number(text) : null;
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
  if (['on', 'true', 'yes', '1', 'regex'].includes(text)) {
    return true;
  }
  if (['off', 'false', 'no', '0', 'plain', 'text'].includes(text)) {
    return false;
  }
  return null;
}

/**
 * Splits a list typed by the GM on commas or whitespace, dropping blanks
 * and duplicates.
 *
 * @param {*} raw Raw input.
 * @param {RegExp} [separator] Separator pattern.
 * @returns {string[]} Items.
 */
export function splitList(raw, separator = /[\s,]+/) {
  return [
    ...new Set(
      toText(raw)
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}

/**
 * Returns the IDs of every GM in the game.
 *
 * @returns {string[]} GM player IDs.
 */
export function getGmPlayerIds() {
  return findObjs({ _type: 'player' })
    .filter((player) => playerIsGM(player.id))
    .map((player) => player.id);
}

/**
 * Removes the " (GM)" suffix Roll20 adds to the speaker name of GM messages.
 *
 * @param {*} who Speaker name.
 * @returns {string} Name without the suffix.
 */
export function stripGmSuffix(who) {
  return toText(who).replace(/\s*\(GM\)$/, '');
}
