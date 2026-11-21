// Debug Mode: notes in the API console for support requests. They stay in
// English so they can be shared on the forums.

import { SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import { getConfig } from './state.js';
import { decodeEntities, truncate } from './utils.js';

const FIELD_LABELS = {
  source: 'Detection Path',
  messageType: 'Message Type',
  template: 'Roll Template',
  spellName: 'Spell',
  caster: 'Caster',
  status: 'Result',
  preview: 'Message Preview',
  reason: 'Reason',
  warning: 'Warning',
  characterId: 'Character ID',
  characterName: 'Character Name',
  attribute: 'Attribute',
  value: 'Value',
  error: 'Error',
  pageId: 'Page ID',
  scope: 'Scope',
  represents: 'Represents',
  tokenId: 'Token ID',
  pendingRollId: 'Pending Roll ID',
};

const REASON_LABELS = {
  'not-legacy-spell-rolltemplate': 'Not a legacy spell card message',
  'legacy-spell-not-concentration': 'Legacy spell card found, but concentration was not marked',
  'legacy-spell-missing-character-or-spell':
    'Legacy spell card was missing character or spell details',
  'legacy-spell-detected': 'Legacy spell card already matched',
  'not-beacon-advancedroll': 'Not a Beacon advanced roll message',
  'advancedroll-does-not-look-like-spell-card': 'Advanced roll did not look like a spell card',
  'beacon-spell-not-concentration': 'Beacon spell card found, but concentration was not marked',
  'beacon-spell-missing-spell-name': 'Beacon spell card was missing spell name',
  'beacon-spell-missing-character': 'Beacon spell card was missing caster details',
};

// Fields shown in Basic support mode, in order.
const BASIC_KEYS = [
  'reason',
  'warning',
  'error',
  'spellName',
  'caster',
  'characterName',
  'attribute',
  'value',
];

/**
 * Turns markup into short readable text.
 *
 * @param {*} value Text or HTML.
 * @param {number} [maxLength] Maximum length.
 * @returns {string} Plain text.
 */
export function plainText(value, maxLength = 240) {
  const text = decodeEntities(String(value ?? '').replaceAll(/<[^>]*>/g, ' '))
    .replaceAll(/\s+/g, ' ')
    .trim();
  return truncate(text || '(empty)', maxLength);
}

/**
 * Makes a slug such as "missing-player" readable.
 *
 * @param {*} value Slug.
 * @returns {string} Words.
 */
function humanise(value) {
  return String(value ?? '')
    .replaceAll(/[_-]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Describes one field value.
 *
 * @param {string} key Field key.
 * @param {*} value Field value.
 * @returns {string} Text.
 */
function describe(key, value) {
  if (value === null || value === undefined || value === '') {
    return 'n/a';
  }
  if (key === 'source') {
    return { legacy: 'Legacy sheet', beacon: 'Beacon sheet' }[value] || 'No match';
  }
  if (key === 'status') {
    return value === 'detected'
      ? 'Concentration spell detected'
      : `Skipped: ${describe('reason', value)}`;
  }
  if (key === 'reason') {
    return String(value)
      .split(';')
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => REASON_LABELS[r] || humanise(r))
      .join('; ');
  }
  if (key === 'warning') {
    return humanise(value);
  }
  if (Array.isArray(value)) {
    return truncate(value.map((v) => describe('', v)).join(', '), 200);
  }
  if (typeof value === 'object') {
    return '[details]';
  }
  return plainText(value, 200);
}

/**
 * Formats a details object for the log.
 *
 * @param {string} label Event label.
 * @param {*} data Details.
 * @param {boolean} detailed Detailed support mode.
 * @returns {string} Text.
 */
export function formatDetails(label, data, detailed) {
  if (data === undefined) {
    return '';
  }
  if (typeof data !== 'object' || data === null) {
    return plainText(data, detailed ? 240 : 140);
  }
  if (!detailed && label === 'Spell detection') {
    if (data.status === 'detected') {
      return [
        'Concentration spell detected',
        data.spellName ? `Spell: ${describe('spellName', data.spellName)}` : '',
        data.caster ? `Caster: ${describe('caster', data.caster)}` : '',
        data.source ? `Path: ${describe('source', data.source)}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
    }
    return `Skipped: ${describe('reason', data.status)}`;
  }
  let keys = Object.keys(data);
  if (!detailed) {
    const preferred = BASIC_KEYS.filter((key) => Object.hasOwn(data, key));
    keys = preferred.length > 0 ? preferred : keys.slice(0, 2);
  }
  return keys
    .map((key) => `${FIELD_LABELS[key] || humanise(key)}: ${describe(key, data[key])}`)
    .join(' | ');
}

/**
 * Writes a debug note to the API console when Debug Mode is on.
 *
 * @param {string} label What happened.
 * @param {*} [data] Details.
 * @returns {void}
 */
export function debugLog(label, data) {
  const config = getConfig();
  if (!config.debug) {
    return;
  }
  let details = '';
  try {
    details = formatDetails(label, data, config.support_mode === 'detailed');
  } catch (err) {
    details = `(could not format details: ${err?.message || err})`;
  }
  log(`[${SCRIPT_NAME} v${SCRIPT_VERSION}] ${label}${details ? `: ${details}` : ''}`);
}
