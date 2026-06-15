/**
 * Returns true when the value is a non-null plain object.
 *
 * @param {*} value Value to test.
 * @returns {boolean} True when value is a plain object.
 */
export function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Coerces a Roll20 attribute value to a string.
 *
 * @param {*} value Raw Roll20 value.
 * @returns {string} String representation.
 */
export function toText(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

/**
 * Escapes HTML special characters to prevent XSS in chat/handout output.
 *
 * @param {string} text Raw text.
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
 * Returns a Roll20 Graphic token object by ID, or null when not found.
 *
 * @param {string} tokenId Roll20 graphic ID.
 * @returns {Graphic|null} Token object or null.
 */
export function getGraphicToken(tokenId) {
  if (!tokenId) {
    return null;
  }
  return getObj('graphic', tokenId) || null;
}

/**
 * Returns the display name of a token, falling back to 'Unknown Token'.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @returns {string} Token name.
 */
export function getTokenName(token) {
  return toText(token?.get('name')) || 'Unknown Token';
}

/**
 * Returns all GM player IDs currently in the campaign.
 *
 * @returns {string[]} Array of GM player IDs.
 */
export function getGmPlayerIds() {
  return findObjs({ type: 'player' })
    .filter((player) => playerIsGM(player.id))
    .map((player) => player.id);
}

/**
 * Parses a numeric value from a raw Roll20 token bar value.
 * Returns 0 for non-finite results.
 *
 * Intentionally uses loose parseInt() — Roll20 bar values sometimes arrive as
 * "12 / 20" strings, and we want the leading integer rather than a parse error.
 * This function is NOT used for user command input; use parseStrictInt() there.
 * For bar reads where blank vs zero matters, use readBarSafe() instead.
 *
 * @param {*} raw Raw bar value from token.get().
 * @returns {number} Parsed integer.
 */
export function parseBarValue(raw) {
  const n = Number.parseInt(toText(raw), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Safely reads a Roll20 token bar value, distinguishing blank/absent from zero.
 *
 * Roll20 returns an empty string ("") when a bar has never been set. This is
 * fundamentally different from a bar explicitly set to 0. Writing any value
 * (including 0) to a previously-blank bar activates it and makes it visible in
 * the token HUD — so callers must check `valid` before writing.
 *
 * @param {*} raw Raw bar value from token.get().
 * @returns {{ valid: boolean, value: number }}
 *   valid = false → bar is blank or unparseable; do NOT write to the bar.
 *   valid = true  → bar has an explicit numeric value (may be 0).
 */
export function readBarSafe(raw) {
  const s = toText(raw).trim();
  if (s === '') {
    return { valid: false, value: 0 };
  }
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? { valid: true, value: n } : { valid: false, value: 0 };
}

/**
 * Strictly parses an integer from a string, rejecting partial matches like "150abc" or "6players".
 * Only strings that consist entirely of an optional sign followed by digits are accepted.
 *
 * @param {*} raw Raw value to parse.
 * @returns {number} Parsed integer, or NaN when the input is not a strict integer string.
 */
export function parseStrictInt(raw) {
  const s = String(raw === undefined || raw === null ? '' : raw).trim();
  if (!/^[+-]?\d+$/.test(s)) {
    return Number.NaN;
  }
  return Number.parseInt(s, 10);
}

/**
 * Clamps a number between min and max.
 *
 * @param {number} value Value to clamp.
 * @param {number} min Minimum bound.
 * @param {number} max Maximum bound.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Rounds a number to the nearest integer, with a minimum of 1.
 *
 * @param {number} value Value to round.
 * @returns {number} Rounded value, at least 1.
 */
export function roundAtLeastOne(value) {
  return Math.max(1, Math.round(value));
}

/**
 * Returns the page ID for a given token.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @returns {string} Page ID.
 */
export function getTokenPageId(token) {
  return toText(token?.get('_pageid'));
}

/**
 * Returns the current page ID viewed by a specific player.
 * Falls back to the first GM's page when no player ID is supplied.
 *
 * Use this instead of getCurrentPageId() when the calling command has access
 * to the GM's player ID — it avoids targeting the wrong page in multi-GM games.
 *
 * @param {string} [playerId] Roll20 player ID.
 * @returns {string} Current page ID.
 */
export function getPlayerPageId(playerId) {
  if (playerId) {
    const player = getObj('player', playerId);
    if (player) {
      return toText(player.get('lastpage')) || toText(Campaign().get('playerpageid'));
    }
  }
  return getCurrentPageId();
}

/**
 * Returns the current page ID viewed by the GM.
 * Prefer getPlayerPageId(playerId) when a player ID is available.
 *
 * @returns {string} Current page ID.
 */
export function getCurrentPageId() {
  const player = findObjs({ type: 'player' }).find((p) => playerIsGM(p.id));
  if (!player) {
    return '';
  }
  return toText(player.get('lastpage')) || toText(Campaign().get('playerpageid'));
}

/**
 * Returns all graphic tokens on the given page (all layers).
 *
 * @param {string} pageId Roll20 page ID.
 * @returns {Graphic[]} Token objects.
 */
export function getTokensOnPage(pageId) {
  if (!pageId) {
    return [];
  }
  return findObjs({ type: 'graphic', _pageid: pageId, subtype: 'token' });
}

/**
 * Converts a Roll20 image URL to the thumb-sized format required by createObj.
 *
 * Roll20's API rejects imgsrc values that are not thumb-sized URLs from the
 * user's library. token.get('imgsrc') often returns a 'med' or 'max' variant;
 * this converts it to 'thumb' so createObj accepts it.
 *
 * If the URL does not match the expected Roll20 image path pattern, the
 * original string is returned unchanged.
 *
 * @param {string} imgsrc Raw imgsrc value from token.get('imgsrc').
 * @returns {string} Thumb-format URL, or the original string when not matched.
 */
export function getCleanImgsrc(imgsrc) {
  if (!imgsrc) {
    return '';
  }
  const imgsrcRe = /(.*\/images\/.*?)(thumb|med|original|max)(\..*?)(\?.*)?$/;
  const parts = imgsrcRe.exec(imgsrc);
  if (parts) {
    return parts[1] + 'thumb' + parts[3] + (parts[4] || '');
  }
  return imgsrc;
}

/**
 * Formats a timestamp as "DD MMM YYYY, HH:MM:SS TZ".
 *
 * The timezone abbreviation is resolved via Intl.DateTimeFormat (e.g. "BST",
 * "EST", "UTC"). If Intl is unavailable the abbreviated name is derived from
 * the parenthesised full name in toTimeString() by taking the first letter of
 * each word (e.g. "British Summer Time" → "BST"). Note: the time reflects the
 * Roll20 server's local timezone, not the GM's browser timezone.
 *
 * @param {number} timestamp Unix timestamp in milliseconds.
 * @returns {string} Formatted date-time string, or 'Never' for falsy input.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Never';
  }

  const d = new Date(timestamp);
  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  // Resolve timezone abbreviation.
  // Prefer Intl.DateTimeFormat which returns named abbreviations (BST, EST…).
  // Fall back to parsing the parenthesised name in toTimeString().
  let tz = 'UTC';
  if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(d);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart) {
      tz = tzPart.value;
    }
  }

  if (tz === 'UTC') {
    const tzNameRe = /\(([^)]+)\)/;
    const match = tzNameRe.exec(d.toTimeString());
    if (match) {
      tz = match[1]
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    }
  }

  return `${day} ${month} ${year}, ${hh}:${mm}:${ss} ${tz}`;
}

/**
 * Converts a percentage modifier to a display string.
 *
 * @param {number} pct Percentage value (100 = no change).
 * @returns {string} e.g. '150%', '100% (base)'
 */
export function formatPct(pct) {
  if (pct === 100) {
    return '100% (base)';
  }
  return `${pct}%`;
}

/**
 * Converts a flat modifier to a signed display string.
 *
 * @param {number} mod Modifier value.
 * @returns {string} e.g. '+2', '0', '-1'
 */
export function formatMod(mod) {
  if (mod === 0) {
    return '0';
  }
  return mod > 0 ? `+${mod}` : String(mod);
}
