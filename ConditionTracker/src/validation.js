import { getCanonicalCondition, isCustomEffectType, isCustomTextCondition } from './conditions.js';
import { BOOLEAN_TEXT, CONDITION_OTHER, VALID_HEALTH_BARS } from './constants.js';
import { normalizeLocale, SUPPORTED_LOCALE_LIST, t } from './i18n.js';
import { getConfig } from './state.js';
import { VALID_GAME_SYSTEMS } from './systems/index.js';
import { getGraphicToken, normalizeKey, queryObjects, toText } from './utils.js';

/**
 * Returns true when a value looks like a Roll20 object id.
 *
 * Roll20 ids are URL-safe tokens that commonly start with '-'. This heuristic
 * intentionally prefers avoiding false positives for normal creature names.
 *
 * @param {string} value Candidate reference text.
 * @returns {boolean} True when the value looks like an id.
 */
function looksLikeRoll20Id(value) {
  const text = toText(value);
  return /^-[A-Za-z0-9_-]{8,}$/.test(text);
}

/**
 * Returns a token's display name, preferring token name and falling back to
 * linked character name when available.
 *
 * @param {Graphic} token Roll20 token.
 * @returns {string} Display name or empty string.
 */
function getTokenDisplayName(token) {
  const tokenName = toText(token?.get?.('name'));
  if (tokenName) return tokenName;

  const characterId = toText(token?.get?.('represents'));
  if (!characterId) return '';

  const character = getObj('character', characterId);
  return character ? toText(character.get('name')) : '';
}

/**
 * Returns a token's linked character name, or an empty string.
 *
 * @param {Graphic} token Roll20 token.
 * @returns {string} Character name.
 */
function getLinkedCharacterName(token) {
  const characterId = toText(token?.get?.('represents'));
  if (!characterId) return '';
  const character = getObj('character', characterId);
  return character ? toText(character.get('name')) : '';
}

/**
 * Returns token candidates from active play context.
 *
 * Default behavior searches player page + current turn order. When allPages is
 * true, searches all token graphics as a fallback for name-based lookup.
 *
 * @param {boolean} [allPages] Whether to include all token pages.
 * @returns {Graphic[]} Candidate tokens.
 */
function getCandidateTokens(allPages = false) {
  const seen = new Set();
  const candidates = [];

  /**
   * Adds a token to the candidate list once.
   *
   * @param {Graphic|null|undefined} token Candidate token.
   * @returns {void}
   */
  const pushIfToken = (token) => {
    if (!token || seen.has(token.id)) return;
    seen.add(token.id);
    candidates.push(token);
  };

  if (allPages) {
    for (const token of queryObjects({ _type: 'graphic', _subtype: 'token' })) {
      pushIfToken(token);
    }
    return candidates;
  }

  const playerPageId = toText(Campaign().get('playerpageid'));
  if (playerPageId) {
    for (const token of queryObjects({
      _type: 'graphic',
      _subtype: 'token',
      _pageid: playerPageId,
    })) {
      pushIfToken(token);
    }
  }

  const turnOrder = JSON.parse(toText(Campaign().get('turnorder')) || '[]');
  for (const row of Array.isArray(turnOrder) ? turnOrder : []) {
    const tokenId = toText(row?.id);
    if (!tokenId || tokenId === '-1') continue;
    pushIfToken(getGraphicToken(tokenId));
  }

  return candidates;
}

/**
 * Resolves a token reference by id, exact name, or partial name.
 *
 * Matching is case-insensitive. Exact token/character-name matches take
 * precedence over partial matches.
 *
 * @param {*} rawRef User-provided token ref.
 * @param {'source'|'target'|'subject'} role Token role for messages.
 * @param {string} locale Output locale.
 * @returns {{valid: boolean, token?: Graphic, message?: string}}
 */
export function resolveTokenReference(rawRef, role, locale) {
  const ref = toText(rawRef);
  const byId = getGraphicToken(ref);
  if (byId) {
    return { valid: true, token: byId };
  }

  // If the user provided something that looks like an id, do not
  // run name matching. Treat it as an id-only lookup failure.
  if (looksLikeRoll20Id(ref)) {
    return { valid: false, message: t(`ui.msg.${role}TokenNotFound`, locale) };
  }

  const key = normalizeKey(ref);
  if (!key) {
    return { valid: false, message: t(`ui.msg.${role}TokenNotFound`, locale) };
  }

  let candidates = getCandidateTokens();
  const exactMatches = candidates.filter((token) => {
    const tokenName = normalizeKey(token.get('name'));
    const charName = normalizeKey(getLinkedCharacterName(token));
    return tokenName === key || charName === key;
  });

  if (exactMatches.length === 1) {
    return { valid: true, token: exactMatches[0] };
  }

  if (exactMatches.length > 1) {
    const listed = exactMatches
      .slice(0, 6)
      .map((token) => `${getTokenDisplayName(token) || token.id} [${token.id}]`)
      .join(', ');
    return {
      valid: false,
      message: t('ui.msg.tokenRefAmbiguous', locale, {
        role,
        value: ref,
        matches: listed,
      }),
    };
  }

  let partialMatches = candidates.filter((token) => {
    const tokenName = normalizeKey(token.get('name'));
    const charName = normalizeKey(getLinkedCharacterName(token));
    return tokenName.includes(key) || charName.includes(key);
  });

  // If the active-context search finds nothing, broaden to all token pages.
  if (exactMatches.length === 0 && partialMatches.length === 0) {
    candidates = getCandidateTokens(true);

    const globalExactMatches = candidates.filter((token) => {
      const tokenName = normalizeKey(token.get('name'));
      const charName = normalizeKey(getLinkedCharacterName(token));
      return tokenName === key || charName === key;
    });

    if (globalExactMatches.length === 1) {
      return { valid: true, token: globalExactMatches[0] };
    }

    if (globalExactMatches.length > 1) {
      const listed = globalExactMatches
        .slice(0, 6)
        .map((token) => `${getTokenDisplayName(token) || token.id} [${token.id}]`)
        .join(', ');
      return {
        valid: false,
        message: t('ui.msg.tokenRefAmbiguous', locale, {
          role,
          value: ref,
          matches: listed,
        }),
      };
    }

    partialMatches = candidates.filter((token) => {
      const tokenName = normalizeKey(token.get('name'));
      const charName = normalizeKey(getLinkedCharacterName(token));
      return tokenName.includes(key) || charName.includes(key);
    });
  }

  if (partialMatches.length === 0) {
    return {
      valid: false,
      message: t('ui.msg.tokenRefNotFound', locale, {
        role,
        value: ref,
      }),
    };
  }

  if (partialMatches.length > 1) {
    const listed = partialMatches
      .slice(0, 6)
      .map((token) => `${getTokenDisplayName(token) || token.id} [${token.id}]`)
      .join(', ');
    return {
      valid: false,
      message: t('ui.msg.tokenRefAmbiguous', locale, {
        role,
        value: ref,
        matches: listed,
      }),
    };
  }

  return { valid: true, token: partialMatches[0] };
}

/**
 * Returns true when a chat sender is a GM.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {boolean} True for GM senders.
 */
export function isGmMessage(msg) {
  return Boolean(msg && playerIsGM(msg.playerid));
}

/**
 * Resolves and validates token-based apply arguments.
 *
 * @param {object} args Parsed command arguments.
 * @returns {object} Validation result.
 */
export function validateApplyArgs(args) {
  const locale = getConfig().language;
  const sourceResult = resolveTokenReference(args.source, 'source', locale);
  if (!sourceResult.valid) {
    return invalid(sourceResult.message);
  }
  const sourceToken = sourceResult.token;

  const condition = getCanonicalCondition(args.condition);
  if (!condition) {
    return invalid(t('ui.msg.invalidCondition', locale));
  }

  const subjectRaw = toText(args.subject);
  const subjectId = subjectRaw === '__none__' ? '' : subjectRaw;
  if (subjectId && !isCustomEffectType(condition)) {
    return invalid(t('ui.msg.subjectOnlyCustom', locale));
  }

  let subjectToken = null;
  if (subjectId) {
    const subjectResult = resolveTokenReference(subjectId, 'subject', locale);
    if (!subjectResult.valid) {
      return invalid(subjectResult.message);
    }
    subjectToken = subjectResult.token;
  }

  const targetResult = resolveTokenReference(args.target, 'target', locale);
  if (!targetResult.valid) {
    return invalid(targetResult.message);
  }
  const targetToken = targetResult.token;

  const customText = toText(args.other);
  if (isCustomTextCondition(condition) && !customText) {
    return invalid(t('ui.msg.customDetailsRequired', locale, { condition }));
  }

  return {
    valid: true,
    sourceToken,
    subjectToken,
    targetToken,
    condition,
    customText: isCustomTextCondition(condition) ? customText : '',
  };
}

/**
 * Validates a marker configuration value.
 *
 * @param {string} condition Condition label.
 * @param {string} marker Marker name or tag.
 * @returns {object} Validation result.
 */
export function validateMarkerConfig(condition, marker) {
  const locale = getConfig().language;
  const canonical = getCanonicalCondition(condition);
  if (!canonical || canonical === CONDITION_OTHER) {
    return invalid(t('ui.msg.markerPredefinedRequired', locale));
  }

  if (!toText(marker)) {
    return invalid(t('ui.msg.markerNameRequired', locale));
  }

  return { valid: true, condition: canonical, marker: toText(marker) };
}

/**
 * Validates a boolean configuration value.
 *
 * @param {string} value Boolean text.
 * @returns {object} Validation result.
 */
export function validateBoolean(value) {
  const locale = getConfig().language;
  const text = toText(value).toLowerCase();
  if (!BOOLEAN_TEXT.has(text)) {
    return invalid(t('ui.msg.expectedBoolean', locale));
  }

  return { valid: true, value: text === 'true' };
}

/**
 * Validates a health bar setting.
 *
 * @param {string} value Health bar property.
 * @returns {object} Validation result.
 */
export function validateHealthBar(value) {
  const locale = getConfig().language;
  const text = toText(value);
  if (!VALID_HEALTH_BARS.includes(text)) {
    return invalid(t('ui.msg.invalidHealthBar', locale));
  }

  return { valid: true, value: text };
}

/**
 * Validates a game system id.
 *
 * @param {string} value Game system id string.
 * @returns {object} Validation result.
 */
export function validateGameSystem(value) {
  const text = toText(value).trim();
  if (!VALID_GAME_SYSTEMS.has(text)) {
    return invalid(t('ui.msg.invalidGameSystem', getConfig().language));
  }
  return { valid: true, value: text };
}

/**
 * Validates a locale string.
 *
 * @param {string} value Locale string.
 * @returns {object} Validation result.
 */
export function validateLocale(value) {
  const locale = getConfig().language;
  const text = normalizeLocale(value);
  if (!text) {
    return invalid(
      t('ui.msg.invalidLocale', locale, {
        locales: SUPPORTED_LOCALE_LIST,
      })
    );
  }
  return { valid: true, value: text };
}

/**
 * Creates an invalid validation result.
 *
 * @param {string} message Error message.
 * @returns {object} Invalid result.
 */
export function invalid(message) {
  return { valid: false, message };
}
