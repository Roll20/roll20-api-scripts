import { buildRemovalMessage } from "./conditions.js";
import { announceHtml, htmlTable, whisper } from "./chat.js";
import { escapeHtml } from "./utils.js";
import { t } from "./i18n.js";
import { removeMarkerIfUnused } from "./markers.js";
import { getConfig, removeActiveCondition } from "./state.js";
import { removeConditionRow } from "./turnOrder.js";

/**
 * Removes a condition and emits the requested feedback.
 *
 * @param {string} conditionId Active condition id.
 * @param {object} options Removal options.
 * @param {string} options.playerId GM player id for whispers.
 * @param {string} options.reason Cleanup reason.
 * @param {boolean} options.publicAnnounce Whether to announce publicly.
 * @param {boolean} options.whisperResult Whether to whisper details.
 * @param {string} [options.locale] Primary output locale.
 * @param {string} [options.extraLocale] Additional output locale for bilingual mode.
 * @returns {object} Removal result.
 */
export function removeConditionById(conditionId, options) {
  const condition = removeActiveCondition(conditionId);
  if (!condition) {
    return {
      removed: false,
      message: t("ui.msg.conditionNotFound", getConfig().language),
    };
  }

  const rowRemoved = removeConditionRow(condition.id);
  const markerResult = removeMarkerIfUnused(condition);
  const config = getConfig();
  const locale = options.locale || config.language;

  if (options.publicAnnounce) {
    announceHtml(buildRemovalMessage(condition, config.useIcons, locale));
    if (options.extraLocale && options.extraLocale !== locale) {
      announceHtml(
        buildRemovalMessage(condition, config.useIcons, options.extraLocale),
      );
    }
  }

  if (options.whisperResult) {
    whisperRemoval(
      options.playerId,
      condition,
      rowRemoved,
      markerResult,
      options.reason,
      locale,
    );
  }

  return { removed: true, condition, rowRemoved, markerResult };
}

/**
 * Whispers condition removal details to the GM.
 *
 * @param {string} playerId GM player id.
 * @param {object} condition Removed condition.
 * @param {boolean} rowRemoved Whether the turn row was removed.
 * @param {object} markerResult Marker removal result.
 * @param {string} reason Removal reason.
 * @param {string} [locale] Output locale.
 * @returns {void}
 */
export function whisperRemoval(
  playerId,
  condition,
  rowRemoved,
  markerResult,
  reason,
  locale,
) {
  const reasonText = reason || t("ui.removal.manualReason", locale);
  let markerSummary = t("ui.removal.notConfigured", locale);
  if (markerResult.marker) {
    markerSummary = markerResult.removed
      ? t("ui.removal.markerRemoved", locale, {
          marker: escapeHtml(markerResult.marker),
        })
      : t("ui.removal.markerRetained", locale, {
          marker: escapeHtml(markerResult.marker),
        });
  }

  whisper(playerId, t("ui.title.removed", locale), [
    htmlTable(
      [t("ui.col.field", locale), t("ui.col.result", locale)],
      [
        [
          t("ui.removal.conditionField", locale),
          escapeHtml(condition.displayText),
        ],
        [t("ui.removal.reasonField", locale), escapeHtml(reasonText)],
        [
          t("ui.removal.turnRowField", locale),
          rowRemoved
            ? t("ui.removal.rowRemoved", locale)
            : t("ui.removal.rowMissing", locale),
        ],
        [t("ui.removal.markerField", locale), markerSummary],
      ],
    ),
  ]);
}
