import { getConfig, createTokenRecord, getTokenRecord, setTokenRecord } from './state.js';
import { getGraphicToken, getTokenPageId, readBarSafe, roundAtLeastOne } from './utils.js';

// ---------------------------------------------------------------------------
// Bar ownership helpers
//
// This mod ONLY manages the bars configured as HP and AC. Writing to any other
// bar — even writing 0 — activates it in the Roll20 token HUD and makes it
// visible. These helpers centralise the ownership check so every write path is
// guarded automatically.
// ---------------------------------------------------------------------------

/**
 * Returns the set of bar names actively managed by this mod.
 * Only the configured HP bar and (when not 'none') the configured AC bar are managed.
 *
 * @param {{ hpBar: string, acBar: string }} config Current mod config.
 * @returns {Set<string>} e.g. Set { 'bar1', 'bar2' }
 */
export function getManagedBars(config) {
  const bars = new Set([config.hpBar]);
  if (config.acBar !== 'none') {
    bars.add(config.acBar);
  }
  return bars;
}

/**
 * Returns true when the named bar is managed by this mod under the given config.
 *
 * @param {string} barName e.g. 'bar1', 'bar2', 'bar3'.
 * @param {{ hpBar: string, acBar: string }} config
 * @returns {boolean}
 */
export function isManagedBar(barName, config) {
  return getManagedBars(config).has(barName);
}

/**
 * Writes a value (and optionally a max) to a specific token bar, but ONLY when
 * the bar is managed by this mod. Silently skips unmanaged bars to prevent
 * accidental HUD activation.
 *
 * Pass `config` to enforce ownership. Omit it only when the caller has already
 * validated the bar name (e.g. inside writeTokenHp / writeTokenAc).
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {string} barName e.g. 'bar1'.
 * @param {number} value Bar value to write.
 * @param {number|undefined} [max] Bar max to write (omit to leave max unchanged).
 * @param {{ hpBar: string, acBar: string }|undefined} [config] Ownership check.
 * @returns {boolean} True when the write occurred.
 */
export function setTokenBarValue(token, barName, value, max, config) {
  if (config && !isManagedBar(barName, config)) {
    return false;
  }
  token.set(`${barName}_value`, value);
  if (max !== undefined) {
    token.set(`${barName}_max`, max);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Bar read/write — configured bars only
// ---------------------------------------------------------------------------

/**
 * Reads the current HP values from a token using the configured HP bar.
 *
 * Returns null for a bar field when the bar has never been set (blank string).
 * Callers must check for null before using the value — writing null back would
 * activate a previously-blank bar and make it visible in the token HUD.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @returns {{ hp: number|null, maxHp: number|null }}
 *   null = bar is blank; number = bar has an explicit value (may be 0).
 */
export function readTokenHp(token) {
  const { hpBar } = getConfig();
  const hp = readBarSafe(token.get(`${hpBar}_value`));
  const maxHp = readBarSafe(token.get(`${hpBar}_max`));
  return {
    hp: hp.valid ? hp.value : null,
    maxHp: maxHp.valid ? maxHp.value : null,
  };
}

/**
 * Reads the current AC value from a token using the configured AC bar.
 *
 * Returns null when AC bar is 'none' or the bar is blank.
 * A null return means the caller must not write an AC value to the token.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @returns {number|null} AC value, or null when unavailable.
 */
export function readTokenAc(token) {
  const { acBar } = getConfig();
  if (acBar === 'none') {
    return null;
  }
  const result = readBarSafe(token.get(`${acBar}_value`));
  return result.valid ? result.value : null;
}

/**
 * Writes HP values to a token using the configured HP bar.
 *
 * No-op when either hp or maxHp is null — a null value means the bar was
 * blank before tracking began and must not be activated by a write.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {number|null} hp Current HP value to set.
 * @param {number|null} maxHp Max HP value to set.
 * @returns {boolean} True when the write occurred.
 */
export function writeTokenHp(token, hp, maxHp) {
  if (hp === null || maxHp === null) {
    return false;
  }
  const { hpBar } = getConfig();
  token.set(`${hpBar}_value`, hp);
  token.set(`${hpBar}_max`, maxHp);
  return true;
}

/**
 * Writes an AC value to a token using the configured AC bar.
 *
 * No-op when AC bar is 'none' or ac is null.
 * A null ac means the bar was blank before tracking began.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {number|null} ac AC value to set.
 * @returns {boolean} True when the write occurred.
 */
export function writeTokenAc(token, ac) {
  if (ac === null) {
    return false;
  }
  const { acBar } = getConfig();
  if (acBar === 'none') {
    return false;
  }
  token.set(`${acBar}_value`, ac);
  return true;
}

// ---------------------------------------------------------------------------
// Token record helpers
// ---------------------------------------------------------------------------

/**
 * Captures a snapshot of a token's original values for recovery.
 *
 * HP and AC are stored as null when the configured bar is blank — this signals
 * to all restore/scale paths that the bar must not be written to.
 *
 * Only the configured HP and AC bars are read. bar3 (or any unconfigured bar)
 * is intentionally ignored to prevent accidental activation.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @returns {object} Original value snapshot.
 */
export function captureOriginalValues(token) {
  const { hp, maxHp } = readTokenHp(token);
  return {
    name: token.get('name') || '',
    hp, // null = HP bar was blank when first tracked
    maxHp, // null = HP bar max was blank when first tracked
    ac: readTokenAc(token), // null = AC bar blank or acBar is 'none'
    layer: token.get('layer') || 'objects',
    left: token.get('left') || 0,
    top: token.get('top') || 0,
    width: token.get('width') || 70,
    height: token.get('height') || 70,
  };
}

/**
 * Ensures a token has a state record, creating one from current values when absent.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @returns {object} Existing or newly created token record.
 */
export function ensureTokenRecord(token) {
  const tokenId = token.id;
  const existing = getTokenRecord(tokenId);
  if (existing) {
    return existing;
  }
  const original = captureOriginalValues(token);
  const pageId = getTokenPageId(token);
  const record = createTokenRecord(tokenId, original, pageId);
  setTokenRecord(tokenId, record);
  return record;
}

/**
 * Applies HP scaling to a token based on the stored record's modifiers.
 *
 * Skipped when:
 *   - original.maxHp is null (HP bar was blank when captured)
 *   - original.maxHp <= 0 (can't derive a sensible scaled value from zero or negative max)
 *
 * New HP = round(originalMaxHp × (hpModifier / 100)), min 1.
 * Current HP is scaled proportionally to preserve the damage state.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {object} record Token state record.
 * @returns {boolean} True when the write occurred.
 */
export function applyHpToToken(token, record) {
  const { hpModifier, original } = record;

  // Guard: blank bar or zero/negative max HP — do not activate an unused bar.
  if (original.maxHp === null || original.maxHp <= 0) {
    return false;
  }

  const newMax = roundAtLeastOne((original.maxHp * hpModifier) / 100);

  // Preserve the damage ratio: if the token was at 50% HP, keep it at 50%.
  const hpRatio = original.hp !== null && original.hp > 0 ? original.hp / original.maxHp : 1;
  const newHp = roundAtLeastOne(newMax * hpRatio);

  writeTokenHp(token, Math.min(newHp, newMax), newMax);
  return true;
}

/**
 * Applies AC scaling to a token based on the stored record's AC modifier.
 *
 * Skipped when original.ac is null (AC bar was blank or acBar is 'none').
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {object} record Token state record.
 * @returns {boolean} True when the write occurred.
 */
export function applyAcToToken(token, record) {
  const { acModifier, original } = record;
  if (original.ac === null) {
    return false;
  }
  writeTokenAc(token, original.ac + acModifier);
  return true;
}

/**
 * Restores all original values to a token from its state record.
 *
 * Only writes to bars that had explicit values when the record was created.
 * Null values are skipped — they indicate the bar was blank before tracking
 * began, and restoring null would activate the bar unnecessarily.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {object} record Token state record.
 * @returns {void}
 */
export function restoreTokenFromRecord(token, record) {
  const { original } = record;
  writeTokenHp(token, original.hp, original.maxHp);
  writeTokenAc(token, original.ac);
  token.set('name', original.name);
  token.set('layer', original.layer);
  token.set('left', original.left);
  token.set('top', original.top);
}

/**
 * Extracts selected token objects from a chat message.
 * Returns an empty array when no tokens are selected.
 *
 * @param {object} msg Roll20 chat message object.
 * @returns {Graphic[]} Array of selected token objects.
 */
export function getSelectedTokens(msg) {
  if (!Array.isArray(msg.selected) || msg.selected.length === 0) {
    return [];
  }
  return msg.selected
    .map((sel) => getGraphicToken(sel._id))
    .filter((token) => token !== null && token.get('subtype') === 'token');
}
