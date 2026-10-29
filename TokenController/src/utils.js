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
 * Parses a whole number, rejecting anything that is not entirely digits
 * (with an optional leading minus sign).
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Parsed integer, or null when invalid.
 */
export function parseStrictInt(raw) {
  if (typeof raw === 'number') {
    return Number.isInteger(raw) ? raw : null;
  }
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
  if (['on', 'true', 'yes', '1'].includes(text)) {
    return true;
  }
  if (['off', 'false', 'no', '0'].includes(text)) {
    return false;
  }
  return null;
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
 * Splits command text into words, keeping "double quoted" phrases together.
 * Quotes are removed; an unterminated quote runs to the end of the text.
 *
 * @param {string} text Command text.
 * @returns {{text: string, quoted: boolean}[]} Words in order.
 */
export function tokenize(text) {
  const words = [];
  const pattern = /"([^"]*)"?|(\S+)/g;
  for (const match of toText(text).matchAll(pattern)) {
    if (match[1] !== undefined) {
      words.push({ text: match[1].trim(), quoted: true });
    } else {
      words.push({ text: match[2], quoted: false });
    }
  }
  return words;
}

/**
 * Quotes a name for use in a chat button, so names with spaces survive.
 *
 * @param {string} name Name.
 * @returns {string} Quoted name.
 */
export function quoteName(name) {
  return `"${toText(name).replaceAll('"', '')}"`;
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

let jumpgateCache = null;

/**
 * Returns true when the game runs on Jumpgate. Roll20 has exposed this as
 * both `_release` and `release`, so both are checked.
 *
 * @returns {boolean} True for Jumpgate games.
 */
export function isJumpgate() {
  if (jumpgateCache === null) {
    const campaign = Campaign();
    const release = toText(campaign.get('_release') || campaign.get('release')).toLowerCase();
    jumpgateCache = release === 'jumpgate';
  }
  return jumpgateCache;
}

/**
 * Returns the page a player is viewing: a GM's last page, their own page when
 * split from the party, otherwise the player ribbon page.
 *
 * @param {string} playerId Roll20 player ID.
 * @returns {string} Page ID.
 */
export function getPlayerPageId(playerId) {
  const campaign = Campaign();
  if (playerIsGM(playerId)) {
    const lastPage = getObj('player', playerId)?.get('_lastpage');
    if (lastPage) {
      return lastPage;
    }
  }
  const specific = campaign.get('playerspecificpages');
  if (isRecord(specific) && specific[playerId]) {
    return specific[playerId];
  }
  return campaign.get('playerpageid');
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
 * Returns a token's display name, falling back to its ID.
 *
 * @param {object|null} token Roll20 graphic.
 * @param {string} [fallbackId] ID to show when the token or its name is missing.
 * @returns {string} Name.
 */
export function tokenLabel(token, fallbackId = '') {
  return toText(token?.get('name')) || toText(token?.id) || fallbackId;
}

/**
 * Adds or removes a status marker, preserving the token's other markers.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} marker Marker tag.
 * @param {boolean} on Add when true, remove when false.
 * @returns {void}
 */
export function setMarker(token, marker, on) {
  const markers = toText(token.get('statusmarkers'))
    .split(',')
    .filter((tag) => tag && tag.split('@')[0] !== marker);
  if (on) {
    markers.push(marker);
  }
  token.set('statusmarkers', markers.join(','));
}

/**
 * Parses Roll20's `lastmove` ("x1,y1,x2,y2,…") into points.
 *
 * @param {*} raw lastmove value.
 * @returns {number[][]} Array of [x, y].
 */
export function parseLastMove(raw) {
  const numbers = toText(raw)
    .split(',')
    .map((n) => Number(n));
  const points = [];
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    if (Number.isFinite(numbers[i]) && Number.isFinite(numbers[i + 1])) {
      points.push([numbers[i], numbers[i + 1]]);
    }
  }
  return points;
}
