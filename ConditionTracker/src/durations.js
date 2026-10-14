import {
  DURATION_ROUNDS,
  DURATION_TURN_END,
  DURATION_TURN_START,
  DURATION_UNTIL_REMOVED,
} from './constants.js';
import { t } from './i18n.js';
import { getConfig } from './state.js';
import { normalizeKey, toText } from './utils.js';

/**
 * Parses a duration label into a stored duration object.
 *
 * @param {string} label User-provided duration label.
 * @param {object} context Duration context.
 * @param {string} context.sourceTokenId Source token id.
 * @param {string} context.targetTokenId Target token id.
 * @param {string} context.currentTurnTokenId Current first turn token id.
 * @returns {object} Parse result.
 */
export function parseDuration(label, context) {
  const locale = getConfig().language;
  const text = toText(label) || 'Until removed';
  const key = normalizeKey(text);

  if (key === 'until removed') {
    return validDuration({
      type: DURATION_UNTIL_REMOVED,
      remaining: null,
      anchor: null,
    });
  }

  if (key === 'end of target next turn' || key === "end of target's next turn") {
    return validDuration(createTurnEndDuration(context.targetTokenId, context.currentTurnTokenId));
  }

  if (key === 'end of source next turn' || key === "end of source's next turn") {
    return validDuration(createTurnEndDuration(context.sourceTokenId, context.currentTurnTokenId));
  }

  if (key === 'start of source next turn' || key === "start of source's next turn") {
    return validDuration(createTurnStartDuration(context.sourceTokenId));
  }

  const rounds = parseRoundCount(key);
  if (rounds > 0) {
    return validDuration(
      createRoundDuration(rounds, context.targetTokenId, context.currentTurnTokenId)
    );
  }

  if (key === 'other') {
    return invalidDuration(t('ui.msg.otherDurationRequiresRounds', locale));
  }

  return invalidDuration(t('ui.msg.invalidDuration', locale));
}

/**
 * Creates a turn-end duration.
 *
 * @param {string} anchorTokenId Anchor token id.
 * @param {string} currentTurnTokenId Current first turn token id.
 * @returns {object} Stored duration.
 */
export function createTurnEndDuration(anchorTokenId, currentTurnTokenId) {
  return {
    type: DURATION_TURN_END,
    remaining: anchorTokenId === currentTurnTokenId ? 2 : 1,
    anchor: anchorTokenId,
  };
}

/**
 * Creates a duration that expires when the anchor token's next turn starts.
 *
 * @param {string} anchorTokenId Anchor token id.
 * @returns {object} Stored duration.
 */
export function createTurnStartDuration(anchorTokenId) {
  return {
    type: DURATION_TURN_START,
    remaining: 1,
    anchor: anchorTokenId,
  };
}

/**
 * Creates a round-count duration anchored on the target turn.
 *
 * @param {number} rounds Round count.
 * @param {string} targetTokenId Target token id.
 * @param {string} currentTurnTokenId Current first turn token id.
 * @returns {object} Stored duration.
 */
export function createRoundDuration(rounds, targetTokenId, currentTurnTokenId) {
  const extraCurrentTurn = targetTokenId === currentTurnTokenId ? 1 : 0;
  return {
    type: DURATION_ROUNDS,
    remaining: rounds + extraCurrentTurn,
    anchor: targetTokenId,
  };
}

/**
 * Parses a round-count duration key.
 *
 * @param {string} key Normalized duration key.
 * @returns {number} Positive round count or zero.
 */
export function parseRoundCount(key) {
  const match = /^(\d+)\s*(?:round|rounds)?$/.exec(key);
  if (!match) {
    return 0;
  }

  return Number(match[1]);
}

/**
 * Decrements a condition duration when its anchor turn ends.
 *
 * @param {object} condition Active condition record.
 * @param {string} endedTurnTokenId Token id whose turn just ended.
 * @returns {boolean} True when the condition expired.
 */
export function decrementDuration(condition, endedTurnTokenId) {
  const duration = condition.duration;
  if (
    !duration ||
    duration.type === DURATION_UNTIL_REMOVED ||
    duration.type === DURATION_TURN_START ||
    duration.anchor !== endedTurnTokenId
  ) {
    return false;
  }

  duration.remaining -= 1;
  return duration.remaining <= 0;
}

/**
 * Returns true when a start-of-turn duration expires because its anchor's turn began.
 *
 * @param {object} condition Active condition record.
 * @param {string} startedTurnTokenId Token id whose turn just started.
 * @returns {boolean} True when the condition expired.
 */
export function expiresAtTurnStart(condition, startedTurnTokenId) {
  const duration = condition.duration;
  return Boolean(
    duration &&
    duration.type === DURATION_TURN_START &&
    startedTurnTokenId &&
    duration.anchor === startedTurnTokenId
  );
}

/**
 * Creates a valid duration result.
 *
 * @param {object} duration Stored duration.
 * @returns {object} Valid parse result.
 */
export function validDuration(duration) {
  return { valid: true, duration };
}

/**
 * Creates an invalid duration result.
 *
 * @param {string} message Error message.
 * @returns {object} Invalid parse result.
 */
export function invalidDuration(message) {
  return { valid: false, message };
}
