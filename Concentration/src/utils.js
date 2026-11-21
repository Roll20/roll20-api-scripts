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
 * Escapes text for an HTML attribute such as a button's href. Roll20 queries
 * (?{...}) must survive, so only HTML characters are encoded.
 *
 * @param {*} text Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeAttr(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Escapes text for display. Roll20 syntax characters are encoded too:
 * sendChat resolves @{...} and %{...} and rolls [[...]] even in a Mod's
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
 * Decodes the handful of HTML entities Roll20 puts into chat content.
 *
 * @param {string} text HTML text.
 * @returns {string} Decoded text.
 */
export function decodeEntities(text) {
  return toText(text)
    .replaceAll(/&nbsp;/gi, ' ')
    .replaceAll(/&quot;/gi, '"')
    .replaceAll(/&#0?39;/g, "'")
    .replaceAll(/&lt;/gi, '<')
    .replaceAll(/&gt;/gi, '>')
    .replaceAll(/&amp;/gi, '&');
}

/**
 * Shortens text to a maximum length.
 *
 * @param {*} value Text.
 * @param {number} maxLength Maximum length.
 * @returns {string} Text, cut short with "..." when too long.
 */
export function truncate(value, maxLength) {
  const text = toText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
 * Parses a number from a bar or attribute value.
 *
 * @param {*} raw Raw value.
 * @returns {number|null} Number, or null when it is not one.
 */
export function parseNumber(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  const text = toText(raw);
  if (!/^[+-]?\d+(\.\d+)?$/.test(text)) {
    return null;
  }
  return Number(text);
}

/**
 * Clamps a number into a range.
 *
 * @param {number} value Value.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Cleans a spell name typed into a command: no HTML or Roll20 syntax
 * characters, and a sensible length.
 *
 * @param {*} raw Raw text.
 * @param {number} maxLength Maximum length.
 * @returns {string} Clean spell name (may be empty).
 */
export function cleanSpellName(raw, maxLength) {
  return truncate(
    toText(raw)
      .replaceAll(/[<>|{}[\]@%\\]/g, '')
      .replaceAll(/\s+/g, ' '),
    maxLength
  );
}

/**
 * Returns true when a graphic is a token (not a card or map image).
 *
 * @param {object} obj Roll20 object.
 * @returns {boolean} True for tokens.
 */
export function isToken(obj) {
  return Boolean(obj) && obj.get('_type') === 'graphic' && obj.get('_subtype') === 'token';
}

/**
 * Returns true when a statusmarkers string holds a marker, with or without a
 * number badge (`stopwatch@3`).
 *
 * @param {string} statusmarkers Comma-separated markers.
 * @param {string} marker Marker tag.
 * @returns {boolean} True when present.
 */
export function hasMarkerIn(statusmarkers, marker) {
  return toText(statusmarkers)
    .split(',')
    .some((tag) => tag && tag.split('@')[0] === marker);
}

/**
 * Returns true when a token has a marker.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} marker Marker tag.
 * @returns {boolean} True when present.
 */
export function hasMarker(token, marker) {
  return hasMarkerIn(token?.get('statusmarkers'), marker);
}

/**
 * Adds or removes a status marker, keeping the token's other markers.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} marker Marker tag.
 * @param {boolean} on Add when true, remove when false.
 * @returns {boolean} True when the token changed.
 */
export function setMarker(token, marker, on) {
  if (hasMarker(token, marker) === on) {
    return false;
  }
  const markers = toText(token.get('statusmarkers'))
    .split(',')
    .filter((tag) => tag && tag.split('@')[0] !== marker);
  if (on) {
    markers.push(marker);
  }
  token.set('statusmarkers', markers.join(','));
  return true;
}

/**
 * Returns a token's display name, falling back to its character's name.
 *
 * @param {object|null} token Roll20 graphic.
 * @returns {string} Name (may be empty).
 */
export function tokenName(token) {
  const name = toText(token?.get('name'));
  if (name) {
    return name;
  }
  const characterId = toText(token?.get('represents'));
  const character = characterId ? getObj('character', characterId) : null;
  return toText(character?.get('name'));
}

/**
 * Returns the IDs in a comma-separated controlledby list.
 *
 * @param {*} raw controlledby value.
 * @returns {string[]} Player IDs (and "all").
 */
export function splitControllers(raw) {
  return toText(raw)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}
