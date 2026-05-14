import {
  BOOLEAN_TEXT,
  CONDITION_OTHER,
  VALID_HEALTH_BARS,
} from "./constants.js";
import {
  getCanonicalCondition,
  isCustomEffectType,
  isCustomTextCondition,
} from "./conditions.js";
import { normalizeLocale, SUPPORTED_LOCALE_LIST, t } from "./i18n.js";
import { getConfig } from "./state.js";
import { getGraphicToken, toText } from "./utils.js";

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
  const sourceToken = getGraphicToken(args.source);
  if (!sourceToken) {
    return invalid(t("ui.msg.sourceTokenNotFound", locale));
  }

  const condition = getCanonicalCondition(args.condition);
  if (!condition) {
    return invalid(t("ui.msg.invalidCondition", locale));
  }

  const subjectRaw = toText(args.subject);
  const subjectId = subjectRaw === "__none__" ? "" : subjectRaw;
  if (subjectId && !isCustomEffectType(condition)) {
    return invalid(t("ui.msg.subjectOnlyCustom", locale));
  }

  const subjectToken = subjectId ? getGraphicToken(subjectId) : null;
  if (subjectId && !subjectToken) {
    return invalid(t("ui.msg.subjectTokenNotFound", locale));
  }

  const targetId = toText(args.target);
  const targetToken = getGraphicToken(targetId);
  if (!targetToken) {
    return invalid(t("ui.msg.targetTokenNotFound", locale));
  }

  const customText = toText(args.other);
  if (isCustomTextCondition(condition) && !customText) {
    return invalid(t("ui.msg.customDetailsRequired", locale, { condition }));
  }

  return {
    valid: true,
    sourceToken,
    subjectToken,
    targetToken,
    condition,
    customText: isCustomTextCondition(condition) ? customText : "",
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
    return invalid(t("ui.msg.markerPredefinedRequired", locale));
  }

  if (!toText(marker)) {
    return invalid(t("ui.msg.markerNameRequired", locale));
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
    return invalid(t("ui.msg.expectedBoolean", locale));
  }

  return { valid: true, value: text === "true" };
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
    return invalid(t("ui.msg.invalidHealthBar", locale));
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
      t("ui.msg.invalidLocale", locale, {
        locales: SUPPORTED_LOCALE_LIST,
      }),
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
