import { getActorTokenOverride, getConfig } from './state.js';
import { queryObjects, toText } from './utils.js';

/** @type {'pc'} */
export const ACTOR_TYPE_PC = 'pc';
/** @type {'npc'} */
export const ACTOR_TYPE_NPC = 'npc';
/** @type {'ignored'} */
export const ACTOR_TYPE_IGNORED = 'ignored';
/** @type {'unknown'} */
export const ACTOR_TYPE_UNKNOWN = 'unknown';
/** @type {'auto'} */
export const ACTOR_TYPE_AUTO = 'auto';

/** Valid types accepted by --classify (excludes unknown which is auto-detected only). */
export const VALID_ACTOR_CLASSIFY_TYPES = Object.freeze(
  new Set([ACTOR_TYPE_PC, ACTOR_TYPE_NPC, ACTOR_TYPE_IGNORED, ACTOR_TYPE_AUTO]),
);

/** Character attribute name used for explicit character-level overrides. */
export const ACTOR_OVERRIDE_ATTR = 'ct_mod_actor_type';

/**
 * NPC detection adapters keyed by game system id.
 * npcAttr: attribute name; npcValue: value that indicates NPC.
 */
const SHEET_ADAPTERS = {
  dnd5e:        { npcAttr: 'npc',      npcValue: '1' },
  dnd4e:        { npcAttr: 'npc',      npcValue: '1' },
  dnd35:        { npcAttr: 'npc',      npcValue: '1' },
  pathfinder1e: { npcAttr: 'is_npc',   npcValue: '1' },
  pathfinder2e: { npcAttr: 'npc',      npcValue: '1' },
  starfinder:   { npcAttr: 'npc',      npcValue: '1' },
};

/** Common NPC indicator attribute names checked when no adapter matches. */
const GENERIC_NPC_ATTRS = ['npc', 'is_npc', 'npcflag', 'sheet_type', 'character_type'];

const FINAL_TYPES = new Set([ACTOR_TYPE_PC, ACTOR_TYPE_NPC, ACTOR_TYPE_IGNORED]);

/**
 * Returns true when value is a storable final classification.
 *
 * @param {*} value Value to test.
 * @returns {boolean} True for pc, npc, or ignored.
 */
function isFinalType(value) {
  return FINAL_TYPES.has(String(value || '').toLowerCase());
}

/**
 * Returns the current value of the ct_mod_actor_type attribute for a character,
 * or null when the attribute is absent or set to auto.
 *
 * @param {string} characterId Roll20 character id.
 * @returns {string|null} pc, npc, ignored, or null.
 */
export function getCharacterOverrideAttr(characterId) {
  const attrs = queryObjects({
    _type: 'attribute',
    _characterid: characterId,
    name: ACTOR_OVERRIDE_ATTR,
  });
  if (attrs.length === 0) return null;
  const value = toText(attrs[0].get('current')).toLowerCase();
  if (value === ACTOR_TYPE_AUTO) return null;
  return isFinalType(value) ? value : null;
}

/**
 * Creates or updates the ct_mod_actor_type attribute on a character.
 *
 * @param {string} characterId Roll20 character id.
 * @param {string} type Actor type value to store (pc, npc, ignored, or auto).
 * @returns {void}
 */
export function setCharacterOverrideAttr(characterId, type) {
  const attrs = queryObjects({
    _type: 'attribute',
    _characterid: characterId,
    name: ACTOR_OVERRIDE_ATTR,
  });
  if (attrs.length > 0) {
    attrs[0].set('current', type);
  } else {
    createObj('attribute', {
      _characterid: characterId,
      name: ACTOR_OVERRIDE_ATTR,
      current: type,
    });
  }
}

/**
 * Removes the ct_mod_actor_type attribute from a character (resets to auto).
 *
 * @param {string} characterId Roll20 character id.
 * @returns {void}
 */
export function clearCharacterOverrideAttr(characterId) {
  const attrs = queryObjects({
    _type: 'attribute',
    _characterid: characterId,
    name: ACTOR_OVERRIDE_ATTR,
  });
  for (const attr of attrs) {
    attr.remove();
  }
}

/**
 * Returns the explicit classification for a token from overrides, or null when
 * no override is set.
 *
 * Checks token-level state override first (Step 1), then the character's
 * ct_mod_actor_type attribute (Step 2).
 *
 * @param {object} token Roll20 graphic token.
 * @returns {string|null} pc, npc, ignored, or null.
 */
export function getExplicitClassification(token) {
  if (!token) return null;

  const tokenId = token.id;
  if (!tokenId) return null;

  const tokenOverride = getActorTokenOverride(tokenId);
  if (tokenOverride) return tokenOverride;

  const characterId = toText(token.get?.('represents'));
  if (!characterId) return null;

  return getCharacterOverrideAttr(characterId);
}

/**
 * Returns true when a token is eligible for automatic classification.
 *
 * Unlinked tokens (no represents value) default to ignored unless explicitly
 * overridden, so they are ineligible for automatic detection.
 *
 * @param {object} token Roll20 graphic token.
 * @returns {boolean} True when eligible.
 */
export function isAutoEligibleToken(token) {
  if (!token) return false;
  return Boolean(toText(token.get?.('represents')));
}

/**
 * Checks the game-system adapter attribute for the configured system.
 * Returns pc, npc, or null when the attribute is absent.
 *
 * @param {string} characterId Roll20 character id.
 * @param {string} systemId Active game system id.
 * @returns {string|null} pc, npc, or null.
 */
function classifyWithAdapter(characterId, systemId) {
  const adapter = SHEET_ADAPTERS[systemId];
  if (!adapter) return null;

  const attrs = queryObjects({
    _type: 'attribute',
    _characterid: characterId,
    name: adapter.npcAttr,
  });
  if (attrs.length === 0) return null;

  return attrs[0].get('current') === adapter.npcValue
    ? ACTOR_TYPE_NPC
    : ACTOR_TYPE_PC;
}

/**
 * Checks a list of common NPC indicator attributes as a system-agnostic fallback.
 * Returns pc, npc, or null when no matching attribute is found.
 *
 * @param {string} characterId Roll20 character id.
 * @returns {string|null} pc, npc, or null.
 */
function classifyWithGenericAttrs(characterId) {
  for (const attrName of GENERIC_NPC_ATTRS) {
    const attrs = queryObjects({
      _type: 'attribute',
      _characterid: characterId,
      name: attrName,
    });
    if (attrs.length === 0) continue;

    const val = toText(attrs[0].get('current')).toLowerCase();
    if (val === '1' || val === 'true' || val === 'npc') return ACTOR_TYPE_NPC;
    if (val === '0' || val === 'false' || val === 'pc' || val === 'character') {
      return ACTOR_TYPE_PC;
    }
  }
  return null;
}

/**
 * Uses the character's controlledby field as a last resort.
 * Returns pc when a non-GM player controls the character, npc otherwise.
 *
 * @param {object} character Roll20 character object.
 * @returns {string} pc or npc.
 */
function classifyWithControlledBy(character) {
  const controlledBy = toText(character.get('controlledby'));
  if (!controlledBy) return ACTOR_TYPE_NPC;

  const isPlayerControlled = controlledBy
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id && id !== 'all')
    .some((id) => !playerIsGM(id));

  return isPlayerControlled ? ACTOR_TYPE_PC : ACTOR_TYPE_NPC;
}

/**
 * Automatically classifies a linked token using adapter then generic then
 * controlledby detection in order.
 *
 * @param {object} token Roll20 graphic token.
 * @returns {string} pc, npc, ignored, or unknown.
 */
export function classifyAutomatically(token) {
  const characterId = toText(token.get?.('represents'));
  if (!characterId) return ACTOR_TYPE_IGNORED;

  const character = getObj('character', characterId);
  if (!character) return ACTOR_TYPE_UNKNOWN;

  const systemId = getConfig().gameSystem;

  const adapterResult = classifyWithAdapter(characterId, systemId);
  if (adapterResult) return adapterResult;

  const genericResult = classifyWithGenericAttrs(characterId);
  if (genericResult) return genericResult;

  return classifyWithControlledBy(character);
}

/**
 * Classifies a token as pc, npc, ignored, or unknown.
 *
 * Detection order:
 *   1. Token-level state override
 *   2. Character ct_mod_actor_type attribute
 *   3. Automatic eligibility (unlinked → ignored)
 *   4. Game-system adapter attribute
 *   5. Generic NPC attribute scan
 *   6. controlledby fallback
 *
 * @param {object} token Roll20 graphic token.
 * @returns {'pc'|'npc'|'ignored'|'unknown'} Actor classification.
 */
export function classifyToken(token) {
  const explicit = getExplicitClassification(token);
  if (explicit) return explicit;

  if (!isAutoEligibleToken(token)) return ACTOR_TYPE_IGNORED;

  return classifyAutomatically(token);
}

/**
 * Returns classification details for the --classify show diagnostic.
 *
 * @param {object} token Roll20 graphic token.
 * @param {string} tokenName Human-readable token name.
 * @returns {{type: string, source: string, reason: string}} Classification detail.
 */
export function classifyTokenDetail(token, tokenName) {
  if (!token) {
    return { type: ACTOR_TYPE_IGNORED, source: 'eligibility', reason: 'no token object' };
  }

  const tokenId = token.id;
  const name = tokenName || tokenId;

  const tokenOverride = getActorTokenOverride(tokenId);
  if (tokenOverride) {
    return {
      type: tokenOverride,
      source: 'token override',
      reason: `state override for token ${name}`,
    };
  }

  const characterId = toText(token.get?.('represents'));

  if (characterId) {
    const charOverride = getCharacterOverrideAttr(characterId);
    if (charOverride) {
      return {
        type: charOverride,
        source: 'character override',
        reason: `${ACTOR_OVERRIDE_ATTR} attribute on character`,
      };
    }
  }

  if (!characterId) {
    return {
      type: ACTOR_TYPE_IGNORED,
      source: 'eligibility',
      reason: 'unlinked token — no character sheet',
    };
  }

  const character = getObj('character', characterId);
  if (!character) {
    return {
      type: ACTOR_TYPE_UNKNOWN,
      source: 'eligibility',
      reason: 'character record not found',
    };
  }

  const systemId = getConfig().gameSystem;
  const adapter = SHEET_ADAPTERS[systemId];

  if (adapter) {
    const attrs = queryObjects({
      _type: 'attribute',
      _characterid: characterId,
      name: adapter.npcAttr,
    });
    if (attrs.length > 0) {
      const val = attrs[0].get('current');
      const type = val === adapter.npcValue ? ACTOR_TYPE_NPC : ACTOR_TYPE_PC;
      return {
        type,
        source: 'game-system adapter',
        reason: `${adapter.npcAttr}=${val} (${systemId})`,
      };
    }
  }

  for (const attrName of GENERIC_NPC_ATTRS) {
    const attrs = queryObjects({
      _type: 'attribute',
      _characterid: characterId,
      name: attrName,
    });
    if (attrs.length === 0) continue;

    const val = toText(attrs[0].get('current')).toLowerCase();
    if (val === '1' || val === 'true' || val === 'npc') {
      return { type: ACTOR_TYPE_NPC, source: 'generic attribute', reason: `${attrName}=${val}` };
    }
    if (val === '0' || val === 'false' || val === 'pc' || val === 'character') {
      return { type: ACTOR_TYPE_PC, source: 'generic attribute', reason: `${attrName}=${val}` };
    }
  }

  const controlledBy = toText(character.get('controlledby'));
  if (controlledBy) {
    const playerIds = controlledBy
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id && id !== 'all');
    const isPlayerControlled = playerIds.some((id) => !playerIsGM(id));
    const type = isPlayerControlled ? ACTOR_TYPE_PC : ACTOR_TYPE_NPC;
    return {
      type,
      source: 'controlledby fallback',
      reason: `character.controlledby = "${controlledBy}"`,
    };
  }

  return {
    type: ACTOR_TYPE_NPC,
    source: 'final fallback',
    reason: 'linked token, no detection data found',
  };
}
