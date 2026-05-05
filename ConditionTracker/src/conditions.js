import {
  CANONICAL_CUSTOM_TYPES,
  CANONICAL_TEXT_CONDITIONS,
  CONDITION_ADVANTAGE,
  CONDITION_DISADVANTAGE,
} from "./constants.js";
import { getConditionLocalData, t } from "./i18n.js";
import { getConfig } from "./state.js";
import { getSystemProfile } from "./systems/index.js";
import { escapeHtml, normalizeKey, toText } from "./utils.js";

/**
 * Returns the system profile for the currently configured game system.
 *
 * @returns {object} Active system profile.
 */
function activeProfile() {
  return getSystemProfile(getConfig().gameSystem);
}

/**
 * Returns true when a condition is any canonical custom effect type.
 * This covers all systems — the wizard limits which types are shown per system.
 *
 * @param {string} condition Canonical condition.
 * @returns {boolean}
 */
export function isCustomEffectType(condition) {
  return CANONICAL_CUSTOM_TYPES.has(condition);
}

/**
 * Returns true when a condition requires free-text details via --other.
 *
 * @param {string} condition Canonical condition.
 * @returns {boolean}
 */
export function isCustomTextCondition(condition) {
  return CANONICAL_TEXT_CONDITIONS.has(condition);
}

/**
 * Returns the canonical condition label for user input.
 * Checks canonical custom types first, then the active system's standard conditions.
 *
 * @param {string} value The condition label from chat.
 * @returns {string} The canonical label or an empty string.
 */
export function getCanonicalCondition(value) {
  const key = normalizeKey(value);

  for (const type of CANONICAL_CUSTOM_TYPES) {
    if (normalizeKey(type) === key) {
      return type;
    }
  }

  for (const condition of activeProfile().STANDARD_CONDITIONS) {
    if (normalizeKey(condition) === key) {
      return condition;
    }
  }

  return "";
}

/**
 * Returns the display name for a condition in the given locale.
 * Checks the system profile's custom-effect label overrides first, then the
 * locale's condNames table, then falls back to the condition key itself.
 *
 * @param {string} condition Canonical condition.
 * @param {object} profile Active system profile.
 * @param {string} locale Locale string.
 * @returns {string} Display name.
 */
export function getConditionDisplayName(condition, profile, locale) {
  const labels = profile?.CUSTOM_EFFECT_LABELS;
  if (labels?.[condition]) return labels[condition];
  const key = `condNames.${condition}`;
  const val = t(key, locale);
  return val === key ? condition : val;
}

/**
 * Returns the past-tense effect text for a condition in the given locale.
 *
 * @param {string} condition The canonical condition.
 * @param {string} locale Locale string.
 * @returns {string} The past-tense effect text.
 */
function getLocalizedPast(condition, locale) {
  const localData = getConditionLocalData(condition, locale);
  if (localData?.past) return localData.past;
  const data = activeProfile().CONDITION_DATA[condition];
  return data ? data.past : toText(condition).toLowerCase();
}

/**
 * Returns the emoji for a condition, used in Turn Tracker and GM whispers.
 *
 * @param {string} condition Canonical condition.
 * @returns {string} Emoji character.
 */
export function getConditionEmoji(condition) {
  const data = activeProfile().CONDITION_DATA[condition];
  return data ? data.emoji : "✨";
}

/**
 * Builds the Turn Tracker display text in the given locale.
 * All values are plain text (no HTML).
 *
 * @param {object} details Display details.
 * @param {string} details.condition Canonical condition.
 * @param {string} details.customText Custom effect text.
 * @param {string} details.sourceName Source token name.
 * @param {string} details.targetName Target token name.
 * @param {boolean} [details.isSelfTarget] Whether source and target are the same token.
 * @param {string} [details.subjectName] Subject name for advantage types.
 * @param {string} [locale] Output locale.
 * @returns {string} Turn Tracker display text.
 */
export function buildDisplayText(details, locale) {
  const emoji = getConditionEmoji(details.condition);

  if (isCustomTextCondition(details.condition)) {
    return t("templates.display.custom", locale, {
      emoji,
      target: details.targetName,
      effect: details.customText,
      source: details.sourceName,
    });
  }

  if (isAdvantageType(details.condition)) {
    const subject = toText(details.subjectName)
      ? ` (${details.subjectName})`
      : "";
    const tplKey =
      details.condition === CONDITION_DISADVANTAGE
        ? "templates.display.disadvantage"
        : "templates.display.advantage";
    return t(tplKey, locale, {
      emoji,
      source: details.sourceName,
      target: details.targetName,
      subject,
    });
  }

  const localData = getConditionLocalData(details.condition, locale);
  const data = localData || activeProfile().CONDITION_DATA[details.condition];

  if (data?.noBy) {
    return t("templates.display.noBy", locale, {
      emoji,
      target: details.targetName,
      past: data.past,
      source: details.sourceName,
    });
  }

  if (details.isSelfTarget) {
    return t("templates.display.self", locale, {
      emoji,
      target: details.targetName,
      past: getLocalizedPast(details.condition, locale),
    });
  }

  return t("templates.display.standard", locale, {
    emoji,
    target: details.targetName,
    past: getLocalizedPast(details.condition, locale),
    source: details.sourceName,
  });
}

/**
 * Builds the public application announcement in the given locale.
 * HTML-unsafe names are wrapped in pre-built HTML spans by the caller;
 * verb/suffix values are passed pre-escaped.
 *
 * @param {object} details Display details.
 * @param {string} details.condition Canonical condition.
 * @param {string} details.customText Custom effect text.
 * @param {string} details.sourceName Source token name.
 * @param {string} details.targetName Target token name.
 * @param {string} [details.sourceTokenId] Source token id.
 * @param {string} [details.targetTokenId] Target token id.
 * @param {string} [details.subjectName] Subject name.
 * @param {boolean} details.useIcons Whether icons are enabled.
 * @param {string} [locale] Output locale.
 * @returns {string} Public chat text.
 */
export function buildApplyMessage(details, locale) {
  const prefix = buildIconPrefix(details.condition, details.useIcons);
  const src = actorSpan(details.sourceName);
  const tgt = actorSpan(details.targetName);

  if (isCustomTextCondition(details.condition)) {
    return (
      prefix +
      t("templates.apply.custom", locale, {
        source: src,
        effect: effectSpan(details.customText),
        target: tgt,
      })
    );
  }

  if (isAdvantageType(details.condition)) {
    const subject = toText(details.subjectName)
      ? ` (${escapeHtml(details.subjectName)})`
      : "";
    const tplKey =
      details.condition === CONDITION_DISADVANTAGE
        ? "templates.apply.disadvantage"
        : "templates.apply.advantage";
    return prefix + t(tplKey, locale, { source: src, target: tgt, subject });
  }

  const localData = getConditionLocalData(details.condition, locale);
  const data = localData || activeProfile().CONDITION_DATA[details.condition];

  if (isSelfTarget(details)) {
    return (
      prefix +
      t("templates.apply.self", locale, {
        target: tgt,
        past: escapeHtml(getLocalizedPast(details.condition, locale)),
      })
    );
  }

  if (data?.suffix) {
    return (
      prefix +
      t("templates.apply.withSuffix", locale, {
        source: src,
        verb: escapeHtml(data.verb),
        target: tgt,
        suffix: escapeHtml(data.suffix),
      })
    );
  }

  return (
    prefix +
    t("templates.apply.standard", locale, {
      source: src,
      verb: escapeHtml(data?.verb || "affects"),
      target: tgt,
    })
  );
}

/**
 * Builds the public removal announcement in the given locale.
 *
 * @param {object} condition Active condition record.
 * @param {boolean} useIcons Whether icons are enabled.
 * @param {string} [locale] Output locale.
 * @returns {string} Public chat text.
 */
export function buildRemovalMessage(condition, useIcons, locale) {
  const prefix = buildIconPrefix(condition.condition, useIcons);
  const src = actorSpan(condition.sourceName);
  const tgt = actorSpan(condition.targetName);

  if (isCustomTextCondition(condition.condition)) {
    return (
      prefix +
      t("templates.remove.custom", locale, {
        target: tgt,
        effect: effectSpan(condition.customText),
      })
    );
  }

  if (isAdvantageType(condition.condition)) {
    const subject = toText(condition.subjectName)
      ? ` (${escapeHtml(condition.subjectName)})`
      : "";
    const tplKey =
      condition.condition === CONDITION_DISADVANTAGE
        ? "templates.remove.disadvantage"
        : "templates.remove.advantage";
    return prefix + t(tplKey, locale, { source: src, target: tgt, subject });
  }

  const localData = getConditionLocalData(condition.condition, locale);
  const data = localData || activeProfile().CONDITION_DATA[condition.condition];

  if (data?.noBy) {
    return (
      prefix +
      t("templates.remove.noBy", locale, {
        target: tgt,
        past: escapeHtml(data.past),
      })
    );
  }

  if (isSelfTarget(condition)) {
    return (
      prefix +
      t("templates.remove.self", locale, {
        target: tgt,
        past: escapeHtml(getLocalizedPast(condition.condition, locale)),
      })
    );
  }

  return (
    prefix +
    t("templates.remove.standard", locale, {
      target: tgt,
      past: escapeHtml(getLocalizedPast(condition.condition, locale)),
      source: src,
    })
  );
}

/**
 * Returns a configured icon prefix when enabled.
 *
 * @param {string} condition The canonical condition.
 * @param {boolean} useIcons Whether icons are enabled.
 * @returns {string} Icon prefix or an empty string.
 */
function buildIconPrefix(condition, useIcons) {
  if (!useIcons) {
    return "";
  }

  const data = activeProfile().CONDITION_DATA[condition];
  if (!data) {
    return "[*] ";
  }

  return `${data.icon} `;
}

/**
 * Returns true for Advantage/Disadvantage conditions.
 *
 * @param {string} condition Canonical condition.
 * @returns {boolean} True for advantage-style effects.
 */
function isAdvantageType(condition) {
  return (
    condition === CONDITION_ADVANTAGE || condition === CONDITION_DISADVANTAGE
  );
}

/**
 * Returns true when a condition source and target are the same token.
 *
 * @param {object} details Display details.
 * @returns {boolean} True for self-targeted condition application.
 */
function isSelfTarget(details) {
  const sourceTokenId = toText(details.sourceTokenId);
  const targetTokenId = toText(details.targetTokenId);
  return Boolean(
    sourceTokenId && targetTokenId && sourceTokenId === targetTokenId,
  );
}

/**
 * Wraps an actor name in a coloured bold span.
 *
 * @param {string} name Actor name.
 * @returns {string} HTML span.
 */
function actorSpan(name) {
  return `<span style="color:#5B21B6;font-weight:bold">${escapeHtml(name)}</span>`;
}

/**
 * Wraps an effect label in a coloured italic span.
 *
 * @param {string} label Effect label.
 * @returns {string} HTML span.
 */
function effectSpan(label) {
  return `<span style="color:#FF4D6D;font-style:italic">${escapeHtml(label)}</span>`;
}
