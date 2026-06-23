import { PARTY_PRESETS, VALID_PARTY_PRESETS } from './constants.js';
import { setTokenRecord } from './state.js';
import { applyAcToToken, applyHpToToken, ensureTokenRecord, getSelectedTokens } from './tokens.js';
import { getTokenName, parseStrictInt } from './utils.js';

/**
 * Resolves a named party preset to a scaling object.
 *
 * @param {string} presetKey Preset key (e.g. 'standard', 'large').
 * @returns {object|null} Preset object or null when not found.
 */
export function resolvePartyPreset(presetKey) {
  return PARTY_PRESETS[presetKey] || null;
}

/**
 * Returns the party preset whose size is nearest to the given party size.
 *
 * @param {number} partySize Number of players.
 * @returns {object} Nearest preset.
 */
export function resolvePartyPresetBySize(partySize) {
  const presets = Object.values(PARTY_PRESETS);
  if (presets.length === 0) {
    return null;
  }

  return presets.reduce((best, preset) => {
    const bestDelta = Math.abs(best.partySize - partySize);
    const thisDelta = Math.abs(preset.partySize - partySize);
    return thisDelta < bestDelta ? preset : best;
  }, presets[0]);
}

/**
 * Applies a scaling profile to one token, updating its state record and token bars.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {{ hp: number, ac: number, damage: number }} profile Scaling values.
 * @param {string} [operation] Description of the operation for the audit log.
 * @returns {object} Updated token record.
 */
export function applyScalingToToken(token, profile, operation) {
  const record = ensureTokenRecord(token);

  record.hpModifier = profile.hp;
  record.acModifier = profile.ac;
  record.damageModifier = profile.damage;
  record.lastModified = Date.now();
  record.lastOperation = operation || 'scale';

  applyHpToToken(token, record);
  applyAcToToken(token, record);

  setTokenRecord(token.id, record);
  return record;
}

/**
 * Applies a scaling profile to all selected tokens.
 *
 * @param {object} msg Roll20 chat message.
 * @param {{ hp: number, ac: number, damage: number }} profile Scaling values.
 * @param {string} [label] Human-readable label for feedback messages.
 * @returns {{ applied: string[], skipped: number }} Result summary.
 */
export function applyScalingToSelected(msg, profile, label) {
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    return { applied: [], skipped: 0 };
  }

  const applied = [];
  for (const token of tokens) {
    applyScalingToToken(token, profile, label || 'scale');
    applied.push(getTokenName(token));
  }

  return { applied, skipped: 0 };
}

/**
 * Parses and validates a party size integer from a string argument.
 * Rejects partial matches such as "6players".
 *
 * @param {string} raw Raw argument value.
 * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
 */
export function parsePartySize(raw) {
  const n = parseStrictInt(raw);
  if (!Number.isFinite(n) || n < 1 || n > 30) {
    return {
      valid: false,
      message: `Party size must be a number between 1 and 30 (got "${raw}").`,
    };
  }
  return { valid: true, value: n };
}

/**
 * Parses and validates an HP percentage from a string argument.
 * A trailing '%' is stripped before parsing. Rejects partial matches.
 *
 * @param {string} raw Raw argument value (e.g. '150' or '150%').
 * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
 */
export function parseHpPercent(raw) {
  const cleaned = String(raw)
    .replace(/^(\d+)%$/, '$1')
    .trim();
  const n = parseStrictInt(cleaned);
  if (!Number.isFinite(n) || n < 1 || n > 1000) {
    return {
      valid: false,
      message: `HP percentage must be between 1 and 1000 (got "${raw}"). Example: 150`,
    };
  }
  return { valid: true, value: n };
}

/**
 * Parses and validates an AC modifier from a string argument.
 * A leading '+' is stripped before parsing. Rejects partial matches.
 *
 * @param {string} raw Raw argument value (e.g. '+2', '-1', '0').
 * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
 */
export function parseAcModifier(raw) {
  const cleaned = String(raw).replace(/^\+/, '').trim();
  const n = parseStrictInt(cleaned);
  if (!Number.isFinite(n) || n < -10 || n > 10) {
    return {
      valid: false,
      message: `AC modifier must be between -10 and +10 (got "${raw}"). Example: +2`,
    };
  }
  return { valid: true, value: n };
}

/**
 * Parses and validates a damage percentage from a string argument.
 * A trailing '%' is stripped before parsing. Rejects partial matches.
 *
 * @param {string} raw Raw argument value.
 * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
 */
export function parseDamagePercent(raw) {
  const cleaned = String(raw)
    .replace(/^(\d+)%$/, '$1')
    .trim();
  const n = parseStrictInt(cleaned);
  if (!Number.isFinite(n) || n < 1 || n > 1000) {
    return {
      valid: false,
      message: `Damage percentage must be between 1 and 1000 (got "${raw}"). Example: 125`,
    };
  }
  return { valid: true, value: n };
}

/**
 * Returns true when the given string is a valid party preset key.
 *
 * @param {string} key Preset key to test.
 * @returns {boolean} True when valid.
 */
export function isValidPartyPreset(key) {
  return VALID_PARTY_PRESETS.has(key);
}
