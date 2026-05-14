/**
 * Returns true when a value is neither undefined nor null.
 *
 * @param {*} value The value to inspect.
 * @returns {boolean} True when the value exists.
 */
export function hasValue(value) {
  return value !== undefined && value !== null;
}

/**
 * Converts a value to trimmed text.
 *
 * @param {*} value The value to convert.
 * @returns {string} Trimmed text or an empty string.
 */
export function toText(value) {
  if (!hasValue(value)) {
    return "";
  }

  return String(value).trim();
}

/**
 * Escapes text for safe Roll20 chat HTML.
 *
 * @param {*} value The value to escape.
 * @returns {string} Escaped text.
 */
export function escapeHtml(value) {
  return toText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Normalizes a label for case-insensitive comparisons.
 *
 * @param {*} value The label to normalize.
 * @returns {string} A lowercase comparison key.
 */
export function normalizeKey(value) {
  return toText(value).toLowerCase();
}

/**
 * Generates a compact stable-enough Roll20 state identifier.
 *
 * @returns {string} A condition identifier.
 */
export function createId() {
  const randomPart = Math.floor(Math.random() * 0x100000000)
    .toString(36)
    .padStart(7, "0");
  return `ct_${Date.now().toString(36)}_${randomPart}`;
}

/**
 * Converts a Roll20 object name into a useful display value.
 *
 * @param {Graphic} token The Roll20 token object.
 * @returns {string} The token name or a fallback label.
 */
export function getTokenName(token) {
  const name = token?.get ? toText(token.get("name")) : "";
  if (name) {
    return name;
  }

  return "Unnamed Token";
}

/**
 * Safely parses JSON and returns a fallback on failure.
 *
 * @param {string} text JSON text.
 * @param {*} fallback The fallback value.
 * @returns {*} Parsed JSON or the fallback.
 */
export function parseJson(text, fallback) {
  try {
    return JSON.parse(text || "");
  } catch (error) {
    log(`Failed to parse JSON: ${error.message}`);
    return fallback;
  }
}

/**
 * Returns true when the provided value is an object but not an array.
 *
 * @param {*} value The value to inspect.
 * @returns {boolean} True for plain object-like values.
 */
export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Queries Roll20 objects and always returns an array.
 *
 * @param {object} criteria Roll20 findObjs criteria.
 * @returns {object[]} Matching Roll20 objects.
 */
export function queryObjects(criteria) {
  return findObjs(criteria) || [];
}

/**
 * Returns a graphic token by id, or null when missing.
 *
 * @param {*} tokenId Roll20 graphic id.
 * @returns {Graphic|null} Roll20 token object.
 */
export function getGraphicToken(tokenId) {
  return getObj("graphic", toText(tokenId)) || null;
}

/**
 * Returns true when a graphic token id resolves to an existing token.
 *
 * @param {*} tokenId Roll20 graphic id.
 * @returns {boolean} True when the token exists.
 */
export function tokenExists(tokenId) {
  return Boolean(getGraphicToken(tokenId));
}

/**
 * Returns all Roll20 player objects.
 *
 * @returns {object[]} Roll20 player objects.
 */
export function getPlayers() {
  return queryObjects({ _type: "player" });
}

/**
 * Returns all current GM player ids.
 *
 * @returns {string[]} GM player ids.
 */
export function getGmPlayerIds() {
  const gmIds = [];
  const players = getPlayers();

  for (const player of players) {
    const playerId = toText(player.get("_id"));
    if (playerId && playerIsGM(playerId)) {
      gmIds.push(playerId);
    }
  }

  return gmIds;
}
