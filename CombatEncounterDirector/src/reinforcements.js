import { MAX_TOTAL_DUPLICATES } from './constants.js';
import { createTokenRecord, setTokenRecord } from './state.js';
import { captureOriginalValues, getSelectedTokens } from './tokens.js';
import { getCleanImgsrc, getTokenPageId, parseStrictInt } from './utils.js';

/**
 * Duplicates a single token N times, placing copies offset from the original.
 *
 * Each copy is placed 70px (one grid square) to the right of the previous,
 * wrapping after 5 copies to avoid running off screen.
 *
 * @param {Graphic} token Roll20 Graphic object to duplicate.
 * @param {number} count Number of copies to create.
 * @param {number} [startIndex=1] Index offset for enumerating names.
 * @returns {Graphic[]} Newly created token objects (may be fewer than count when
 *   Roll20 rejects the imgsrc for non-library images).
 */
export function duplicateToken(token, count, startIndex) {
  const copies = [];
  const baseName = stripEnumeration(token.get('name') || 'Token');
  const baseLeft = token.get('left') || 0;
  const baseTop = token.get('top') || 0;
  const width = token.get('width') || 70;
  const pageId = getTokenPageId(token);

  // Collect the properties we want to copy.
  // imgsrc is included so that tokens backed by the user's own Roll20 Library
  // get their image copied. Roll20 requires imgsrc to be present and valid for
  // createObj to succeed — omitting it causes creation to fail for all tokens.
  // For non-library images (marketplace, compendium) Roll20 logs a console error
  // and createObj returns undefined; these are counted as failures by the caller.
  const copyProps = [
    'imgsrc',
    'layer',
    'width',
    'height',
    'bar1_value',
    'bar1_max',
    'bar2_value',
    'bar2_max',
    'bar3_value',
    'bar3_max',
    'represents',
    'statusmarkers',
    'tint_color',
    'aura1_radius',
    'aura1_color',
    'aura1_square',
    'aura2_radius',
    'aura2_color',
    'aura2_square',
    'showname',
    'showplayers_name',
    'showplayers_bar1',
    'showplayers_bar2',
    'showplayers_bar3',
    'light_radius',
    'light_dimradius',
    'light_hassight',
    'light_angle',
    'light_losangle',
    'light_multiplier',
  ];

  const tokenProps = {};
  for (const prop of copyProps) {
    tokenProps[prop] = token.get(prop);
  }

  // Convert the imgsrc to the thumb format Roll20's createObj requires.
  if (tokenProps.imgsrc) {
    tokenProps.imgsrc = getCleanImgsrc(tokenProps.imgsrc);
  }

  // Reinforcement duplicates are placed on the GM layer so the GM can review
  // and position them before revealing to players. Use the 'Reveal on Token Layer'
  // button in the confirmation whisper to move them when ready.
  tokenProps.layer = 'gmlayer';

  const idx = startIndex ?? 1;

  for (let i = 0; i < count; i++) {
    const copyNumber = idx + i;
    const colOffset = copyNumber % 5;
    const rowOffset = Math.floor(copyNumber / 5);

    const newToken = createObj('graphic', {
      ...tokenProps,
      _pageid: pageId,
      subtype: 'token',
      name: `${baseName} ${copyNumber + 1}`,
      left: baseLeft + (colOffset + 1) * width,
      top: baseTop + rowOffset * width,
    });

    if (newToken) {
      const original = captureOriginalValues(newToken);
      const record = createTokenRecord(newToken.id, original, pageId);
      record.lastOperation = `reinforce:duplicate`;
      setTokenRecord(newToken.id, record);
      copies.push(newToken);
    }
  }

  return copies;
}

/**
 * Duplicates each selected token N times.
 *
 * The total number of new tokens is capped at MAX_TOTAL_DUPLICATES to prevent
 * accidental bursts when many tokens are selected.
 *
 * @param {object} msg Roll20 chat message.
 * @param {number} count Number of copies per selected token.
 * @returns {{ created: number, createdIds: string[], names: string[], failedNames: string[], failedCount: number, limitHit: boolean }}
 *   created     — total tokens actually placed on the map.
 *   createdIds  — Roll20 IDs of every successfully created token, used by the
 *                 caller to store a reference for the "Reveal on Token Layer" command.
 *   names       — display strings for tokens that were duplicated successfully.
 *   failedNames — display strings (with copy count) for tokens that produced
 *                 zero copies (Roll20 rejected the imgsrc — image not in the
 *                 user's library).
 *   failedCount — total number of copies that were attempted but not created.
 */
export function duplicateSelectedTokens(msg, count) {
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    return {
      created: 0,
      createdIds: [],
      names: [],
      failedNames: [],
      failedCount: 0,
      limitHit: false,
    };
  }

  const totalRequested = tokens.length * count;
  if (totalRequested > MAX_TOTAL_DUPLICATES) {
    return {
      created: 0,
      createdIds: [],
      names: [],
      failedNames: [],
      failedCount: 0,
      limitHit: true,
      limit: MAX_TOTAL_DUPLICATES,
      requested: totalRequested,
    };
  }

  const names = [];
  const failedNames = [];
  const createdIds = [];
  let totalCreated = 0;
  let totalFailed = 0;

  for (const token of tokens) {
    const copies = duplicateToken(token, count);
    const baseName = stripEnumeration(token.get('name') || 'Token');
    if (copies.length > 0) {
      totalCreated += copies.length;
      for (const copy of copies) {
        createdIds.push(copy.id);
      }
      names.push(`${baseName} (×${copies.length})`);
    } else {
      // createObj returned undefined for every attempt — Roll20 rejected the
      // imgsrc (not in the user's library). No tokens were placed on the map.
      totalFailed += count;
      failedNames.push(`${baseName} (×${count})`);
    }
  }

  return {
    created: totalCreated,
    createdIds,
    names,
    failedNames,
    failedCount: totalFailed,
    limitHit: false,
  };
}

/**
 * Auto-numbers all selected tokens using a shared base name.
 *
 * Strips any existing trailing number from each token name, then renames
 * all selected tokens as "Name 1", "Name 2", etc., using the name of the
 * first selected token as the base.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{ renamed: string[] }} Result summary.
 */
export function enumerateSelectedTokens(msg) {
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    return { renamed: [] };
  }

  const baseName = stripEnumeration(tokens[0].get('name') || 'Token');
  const renamed = [];

  for (let i = 0; i < tokens.length; i++) {
    const newName = `${baseName} ${i + 1}`;
    tokens[i].set('name', newName);
    renamed.push(newName);
  }

  return { renamed };
}

/**
 * Strips trailing enumeration (numbers and spaces) from a token name.
 *
 * Example: "Goblin 3" → "Goblin", "Orc Warrior 12" → "Orc Warrior"
 *
 * @param {string} name Token name.
 * @returns {string} Base name without trailing number.
 */
export function stripEnumeration(name) {
  return name.replace(/\s+\d+$/, '').trim();
}

/**
 * Parses and validates a duplication count from a string argument.
 * Rejects partial matches such as "3copies".
 *
 * @param {string} raw Raw argument value.
 * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
 */
export function parseDuplicateCount(raw) {
  const n = parseStrictInt(raw);
  if (!Number.isFinite(n) || n < 1 || n > 50) {
    return {
      valid: false,
      message: `Duplicate count must be between 1 and 50 (got "${raw}"). Example: 3`,
    };
  }
  return { valid: true, value: n };
}
