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
 * Reads a sheet value as inspired or not. The 2014 OGL sheet stores "on" for a
 * ticked box; the 2024 sheet stores 1. Anything else counts as not inspired.
 *
 * @param {*} value Sheet value.
 * @returns {boolean} True when inspired.
 */
export function isInspiredValue(value) {
  if (typeof value === 'number') {
    return value > 0;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const text = toText(value).toLowerCase();
  if (['on', 'true', 'yes'].includes(text)) {
    return true;
  }
  const n = Number(text);
  return text !== '' && Number.isFinite(n) && n > 0;
}

/**
 * Splits command text into words, keeping "double quoted" phrases together.
 * Quotes are removed; an unterminated quote runs to the end of the text.
 *
 * @param {string} text Command text.
 * @returns {string[]} Words in order.
 */
export function tokenize(text) {
  const words = [];
  const pattern = /"([^"]*)"?|(\S+)/g;
  for (const match of toText(text).matchAll(pattern)) {
    words.push(match[1] === undefined ? match[2] : match[1].trim());
  }
  return words;
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
 * Splits a token's status markers into tags, dropping number badges
 * (`red@2` becomes `red`).
 *
 * @param {*} raw statusmarkers value.
 * @returns {string[]} Marker tags.
 */
export function markerTags(raw) {
  return toText(raw)
    .split(',')
    .map((tag) => tag.split('@')[0].trim())
    .filter(Boolean);
}

/**
 * Returns true when a statusmarkers value shows a marker.
 *
 * @param {*} raw statusmarkers value.
 * @param {string} marker Marker tag.
 * @returns {boolean} True when shown.
 */
export function hasMarker(raw, marker) {
  return Boolean(marker) && markerTags(raw).includes(marker);
}

/**
 * Adds or removes a status marker, keeping the token's other markers (and
 * their number badges) as they were.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} marker Marker tag.
 * @param {boolean} on Add when true, remove when false.
 * @returns {boolean} True when the token changed.
 */
export function setMarker(token, marker, on) {
  const raw = toText(token.get('statusmarkers'));
  if (!marker || hasMarker(raw, marker) === on) {
    return false;
  }
  const markers = raw.split(',').filter((tag) => tag && tag.split('@')[0] !== marker);
  if (on) {
    markers.push(marker);
  }
  token.set('statusmarkers', markers.join(','));
  return true;
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
 * Returns true when a player may act as GM: a real GM, or another Mod
 * sending commands with sendChat.
 *
 * @param {string} playerId Roll20 player ID.
 * @param {string} apiId The ID Roll20 gives Mod messages.
 * @returns {boolean} True for GMs and Mods.
 */
export function isGmOrMod(playerId, apiId) {
  return playerId === apiId || playerIsGM(playerId);
}

/**
 * Makes text safe inside a Roll20 roll query option (`?{Q|label,value}`).
 *
 * @param {string} text Text.
 * @returns {string} Text without the characters that end a query option.
 */
export function queryText(text) {
  return toText(text)
    .replaceAll(/[|,{}]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a short random ID for undo entries and offers.
 *
 * @returns {string} ID.
 */
export function shortId() {
  return Math.random().toString(36).slice(2, 8);
}
