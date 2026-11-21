// Finds concentration spells in sheet chat output: the 5e OGL (2014) `spell`
// roll template and D&D 2024 (Beacon) `advancedroll` spell cards.

import { debugLog, plainText } from './debug.js';
import { decodeEntities, toText, truncate } from './utils.js';

/**
 * @typedef {object} SpellCast
 * @property {'legacy'|'beacon'} sheetType Sheet output that matched.
 * @property {string|null} characterName Caster's name, when the card shows it.
 * @property {string|null} characterId Caster's character ID, when known.
 * @property {string} spellName Spell name.
 * @property {boolean} [weak] Matched only by the word "concentration" in the card.
 */

/**
 * Returns the first capture group any pattern finds.
 *
 * @param {string} content Text to search.
 * @param {RegExp[]} patterns Patterns with one capture group.
 * @returns {string|null} Decoded match, or null.
 */
function firstMatch(content, patterns) {
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return decodeEntities(match[1]) || null;
    }
  }
  return null;
}

/**
 * Looks for a concentration spell on the 5e OGL `spell` roll template.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{spellCast: SpellCast|null, reason: string|null}} Result.
 */
export function detectLegacySpellCast(msg) {
  if (msg?.rolltemplate !== 'spell' || !msg?.content) {
    return { spellCast: null, reason: 'not-legacy-spell-rolltemplate' };
  }
  if (!msg.content.includes('{{concentration=1}}')) {
    return { spellCast: null, reason: 'legacy-spell-not-concentration' };
  }
  const characterName = firstMatch(msg.content, [/charname=([^\n{}]*[^"\n{}])/i]);
  // "name=" also appears inside "charname=", so the field's own braces come first.
  const spellName = firstMatch(msg.content, [
    /\{\{name=([^\n{}]*[^"\n{}])/i,
    /(?<!char)name=([^\n{}]*[^"\n{}])/i,
  ]);
  if (!characterName || !spellName) {
    return { spellCast: null, reason: 'legacy-spell-missing-character-or-spell' };
  }
  return {
    spellCast: { sheetType: 'legacy', characterName, characterId: null, spellName },
    reason: null,
  };
}

/**
 * Looks for a concentration spell on a D&D 2024 (Beacon) spell card.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{spellCast: SpellCast|null, reason: string|null}} Result.
 */
export function detectBeaconSpellCast(msg) {
  if (msg?.type !== 'advancedroll' || !msg?.content) {
    return { spellCast: null, reason: 'not-beacon-advancedroll' };
  }
  const content = msg.content;
  const looksLikeSpellCard = [
    /header__title/i,
    /header__subtitle/i,
    /meta__character/i,
    /data-character-name/i,
    /spell/i,
  ].some((pattern) => pattern.test(content));
  if (!looksLikeSpellCard) {
    return { spellCast: null, reason: 'advancedroll-does-not-look-like-spell-card' };
  }
  // A concentration chip or data attribute is a sure match; the bare word is
  // weak, as feat cards such as War Caster mention concentration too.
  const strong = [
    /data-chip\s*=\s*["']?concentration["']?/i,
    /data-[a-z-]*\s*=\s*["']?concentration["']?/i,
  ].some((pattern) => pattern.test(content));
  const weak = !strong && /\bconcentration\b/i.test(content);
  if (!strong && !weak) {
    return { spellCast: null, reason: 'beacon-spell-not-concentration' };
  }
  const spellName = firstMatch(content, [
    /header__title[^>]*>\s*([^<]+?)\s*</i,
    /data-title\s*=\s*["']([^"']+)["']/i,
    /aria-label\s*=\s*["']([^"']+)["']/i,
  ]);
  const characterName = firstMatch(content, [
    /meta__character[^>]*>\s*([^<]+?)\s*</i,
    /data-character-name\s*=\s*["']([^"']+)["']/i,
  ]);
  // Beacon messages carry the character's ID; older cards only had it in the markup.
  const characterId =
    toText(msg.characterId) ||
    toText(msg.rolledByCharacterId) ||
    firstMatch(content, [
      /data-character-id\s*=\s*["']([^"']+)["']/i,
      /data-characterid\s*=\s*["']([^"']+)["']/i,
      /characterid\s*=\s*["']([^"']+)["']/i,
    ]);
  if (!spellName) {
    return { spellCast: null, reason: 'beacon-spell-missing-spell-name' };
  }
  if (!characterName && !characterId) {
    return { spellCast: null, reason: 'beacon-spell-missing-character' };
  }
  return {
    spellCast: {
      sheetType: 'beacon',
      characterName,
      characterId: characterId || null,
      spellName,
      weak,
    },
    reason: null,
  };
}

/**
 * Looks for a concentration spell in any supported sheet output, writing
 * what it found to the log in Debug Mode.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {SpellCast|null} The spell cast, or null.
 */
export function detectSpellCast(msg) {
  const legacy = detectLegacySpellCast(msg);
  const beacon = legacy.spellCast
    ? { spellCast: null, reason: 'legacy-spell-detected' }
    : detectBeaconSpellCast(msg);
  const spellCast = legacy.spellCast || beacon.spellCast;

  // Skip unrelated chat so the log stays readable.
  if (spellCast || msg?.rolltemplate === 'spell' || msg?.type === 'advancedroll') {
    let source = 'none';
    if (legacy.spellCast) {
      source = 'legacy';
    } else if (beacon.spellCast) {
      source = 'beacon';
    }
    debugLog('Spell detection', {
      source,
      messageType: msg?.type || null,
      template: msg?.rolltemplate || null,
      spellName: spellCast?.spellName || null,
      caster: spellCast?.characterName || spellCast?.characterId || null,
      status: spellCast ? 'detected' : [legacy.reason, beacon.reason].filter(Boolean).join('; '),
      preview: plainText(msg?.content, 160),
    });
  }
  return spellCast;
}

/**
 * Finds the character who cast a spell: by ID first, then by exact name.
 *
 * @param {SpellCast} spellCast Spell cast.
 * @returns {{character: object|null, warning: string|null}} Character, and a note when unsure.
 */
export function resolveCaster(spellCast) {
  let warning = null;
  let character = null;
  if (spellCast.characterId) {
    character = getObj('character', spellCast.characterId) || null;
    if (!character) {
      warning = `character-id-not-found: ${truncate(spellCast.characterId, 80)}`;
    }
  }
  if (!character && spellCast.characterName) {
    const matches = findObjs({ _type: 'character', name: spellCast.characterName });
    if (matches.length > 1) {
      warning = `duplicate-character-name: ${truncate(spellCast.characterName, 80)}`;
    }
    character = matches[0] || null;
  }
  return { character, warning };
}
