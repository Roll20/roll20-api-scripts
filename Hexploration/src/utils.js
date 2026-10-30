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
 * Returns true when a value is a colour Roll20 accepts for path fill and stroke:
 * #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), transparent, or a CSS colour name.
 *
 * @param {*} raw Colour text.
 * @returns {boolean} True when valid.
 */
export function isValidColor(raw) {
  const text = toText(raw);
  return (
    /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text) ||
    /^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*[\d.]+%?\s*)?\)$/i.test(text) ||
    /^[a-z]{3,20}$/i.test(text)
  );
}

/**
 * Parses a hex, rgb() or rgba() colour into its channels.
 *
 * @param {*} raw Colour text.
 * @returns {{r: number, g: number, b: number, a: number}|null} Channels 0–255 and alpha 0–1, or null for other colours such as names.
 */
function parseColor(raw) {
  const text = toText(raw);

  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
  if (hex) {
    const digits = hex[1].length <= 4 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
    const [r, g, b, a = 255] = digits.match(/../g).map((pair) => parseInt(pair, 16));
    return { r, g, b, a: a / 255 };
  }

  const fn =
    /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+%?)\s*)?\)$/i.exec(
      text
    );
  if (!fn) {
    return null;
  }
  const channel = (v) =>
    clamp(v.endsWith('%') ? (parseFloat(v) * 255) / 100 : parseFloat(v), 0, 255);
  const alpha =
    fn[4] === undefined ? 1 : fn[4].endsWith('%') ? parseFloat(fn[4]) / 100 : parseFloat(fn[4]);
  return { r: channel(fn[1]), g: channel(fn[2]), b: channel(fn[3]), a: clamp(alpha, 0, 1) };
}

/**
 * Converts a colour to the #rrggbb or #rrggbbaa form Jumpgate's pathv2 objects
 * accept. Jumpgate silently ignores rgb(), rgba() and short hex colours, so a
 * hex keeps its old colour. Colour names are returned unchanged.
 *
 * @param {*} raw Colour text.
 * @returns {string} Colour for a pathv2 fill or stroke.
 */
export function toPathV2Color(raw) {
  const color = parseColor(raw);
  if (!color) {
    return toText(raw);
  }
  const hex = (n) => Math.round(n).toString(16).padStart(2, '0');
  const rgb = `#${hex(color.r)}${hex(color.g)}${hex(color.b)}`;
  return color.a >= 1 ? rgb : `${rgb}${hex(color.a * 255)}`;
}

/**
 * Converts a colour to a form Roll20 chat keeps in inline styles. Chat drops
 * #rrggbbaa colours and rgb() with an alpha value, leaving the style empty;
 * #rrggbb and rgba() survive. Colour names are returned unchanged.
 *
 * @param {*} raw Colour text.
 * @returns {string} Colour for chat HTML.
 */
export function toChatColor(raw) {
  const color = parseColor(raw);
  if (!color) {
    return toText(raw);
  }
  if (color.a >= 1) {
    return toPathV2Color(raw);
  }
  const [r, g, b] = [color.r, color.g, color.b].map(Math.round);
  return `rgba(${r},${g},${b},${Math.round(color.a * 100) / 100})`;
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
 * Returns the page a player is viewing: their own page when split from the
 * party, otherwise the player ribbon page.
 *
 * @param {string} playerId Roll20 player ID.
 * @returns {string} Page ID.
 */
export function getPlayerPageId(playerId) {
  const campaign = Campaign();
  if (playerIsGM(playerId)) {
    const player = getObj('player', playerId);
    const lastPage = player?.get('_lastpage');
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
 * Returns the player IDs who control a token, directly or through the
 * character it represents.
 *
 * @param {Graphic} token Roll20 token.
 * @returns {string[]} Controller IDs (may include 'all').
 */
export function getTokenControllers(token) {
  const ids = new Set();
  const add = (list) => {
    for (const id of toText(list).split(',')) {
      if (id.trim()) {
        ids.add(id.trim());
      }
    }
  };
  add(token.get('controlledby'));
  const characterId = token.get('represents');
  if (characterId) {
    add(getObj('character', characterId)?.get('controlledby'));
  }
  return [...ids];
}

/**
 * Returns true when a token carries a status marker, matching both plain
 * markers ("white-tower") and numbered ones ("white-tower@2").
 *
 * @param {Graphic} token Roll20 token.
 * @param {string} marker Marker tag.
 * @returns {boolean} True when the marker is present.
 */
export function tokenHasMarker(token, marker) {
  return toText(token.get('statusmarkers'))
    .split(',')
    .some((tag) => tag.split('@')[0] === marker);
}

/**
 * Splits work into batches run on successive event-loop turns, so large jobs
 * do not trip the API sandbox's long-running script watchdog.
 *
 * @param {Array} items Items to process.
 * @param {number} size Batch size.
 * @param {(item: *, index: number) => void} work Called for each item.
 * @param {(errors: number) => void} [done] Called once every item has been
 *        processed, with the number of items whose work threw.
 * @returns {void}
 */
export function runInBatches(items, size, work, done) {
  let index = 0;
  let errors = 0;
  // Errors are caught per item: an exception thrown from a timer callback
  // would otherwise stop the whole API sandbox.
  const step = () => {
    const end = Math.min(items.length, index + size);
    for (; index < end; index++) {
      try {
        work(items[index], index);
      } catch (err) {
        errors++;
        log(`Hexploration: batch item failed: ${err?.message || err}`);
      }
    }
    if (index < items.length) {
      setTimeout(step, 0);
    } else if (done) {
      try {
        done(errors);
      } catch (err) {
        log(`Hexploration: batch completion failed: ${err?.message || err}`);
      }
    }
  };
  step();
}
