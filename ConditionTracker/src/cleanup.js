import { htmlTable, rawHtml, whisper } from "./chat.js";
import { t } from "./i18n.js";
import { removeMarkerIfUnused } from "./markers.js";
import {
  getActiveConditions,
  getConfig,
  setActiveConditions,
} from "./state.js";
import { tokenExists } from "./utils.js";
import {
  conditionRowExists,
  getTurnOrder,
  getTokenRowId,
  removeConditionRows,
  removeOrphanedConditionRows,
} from "./turnOrder.js";

/**
 * Performs manual cleanup and reconciliation.
 *
 * @param {string} playerId GM player id.
 * @returns {object} Cleanup summary.
 */
export function runCleanup(playerId) {
  const turnOrderRows = getTurnOrder();
  const tokenRowIds = buildTokenRowIdSet(turnOrderRows);
  const combatActive = tokenRowIds.size > 0;

  const kept = [];
  const removedConditions = [];
  let orphanedEntries = 0;
  let staleEntries = 0;
  let missingRows = 0;

  for (const condition of getActiveConditions()) {
    const sourceExists = tokenExists(condition.sourceTokenId);
    const targetExists = tokenExists(condition.targetTokenId);
    const rowExists = conditionRowExists(condition.id);
    const targetInTurnOrder =
      !combatActive || tokenRowIds.has(condition.targetTokenId);

    if (sourceExists && targetExists && rowExists && targetInTurnOrder) {
      kept.push(condition);
    } else {
      removedConditions.push(condition);
      if (!sourceExists || !targetExists) {
        orphanedEntries += 1;
      } else if (!targetInTurnOrder) {
        staleEntries += 1;
      }
      if (!rowExists) {
        missingRows += 1;
      }
    }
  }

  removeConditionRows(removedConditions.map((c) => c.id));
  setActiveConditions(kept);
  const unusedMarkers = removeUnusedMarkers(removedConditions);
  const orphanedRows = removeOrphanedConditionRows();
  const locale = getConfig().language;
  whisperCleanupSummary(
    playerId,
    orphanedEntries,
    staleEntries,
    orphanedRows + missingRows,
    unusedMarkers,
    locale,
  );

  return {
    orphanedEntries,
    staleEntries,
    orphanedRows: orphanedRows + missingRows,
    unusedMarkers,
  };
}

/**
 * Removes markers for conditions after state has been reconciled.
 *
 * @param {object[]} conditions Removed condition records.
 * @returns {number} Number of removed markers.
 */
export function removeUnusedMarkers(conditions) {
  let removed = 0;
  for (const condition of conditions) {
    const markerResult = removeMarkerIfUnused(condition);
    if (markerResult.removed) {
      removed += 1;
    }
  }

  return removed;
}

/**
 * Builds a Set of token ids present as real token rows in the turn order.
 *
 * @param {object[]} rows Turn order rows.
 * @returns {Set<string>} Token ids.
 */
function buildTokenRowIdSet(rows) {
  const ids = new Set();
  for (const row of rows) {
    const id = getTokenRowId(row);
    if (id) ids.add(id);
  }
  return ids;
}

/**
 * Whispers cleanup details to the GM.
 *
 * @param {string} playerId GM player id.
 * @param {number} orphanedEntries Removed state entries for deleted tokens.
 * @param {number} staleEntries Removed state entries for tokens no longer in the turn order.
 * @param {number} orphanedRows Removed or missing Turn Tracker rows.
 * @param {number} unusedMarkers Removed markers.
 * @param {string} [locale] Output locale.
 * @returns {void}
 */
export function whisperCleanupSummary(
  playerId,
  orphanedEntries,
  staleEntries,
  orphanedRows,
  unusedMarkers,
  locale,
) {
  whisper(playerId, t("ui.title.cleanup", locale), [
    rawHtml(`<strong>${t("ui.heading.summary", locale)}</strong>`),
    htmlTable(
      [t("ui.col.item", locale), t("ui.col.removed", locale)],
      [
        [t("ui.cleanup.orphaned", locale), String(orphanedEntries)],
        [t("ui.cleanup.stale", locale), String(staleEntries)],
        [t("ui.cleanup.orphanedRows", locale), String(orphanedRows)],
        [t("ui.cleanup.unusedMarkers", locale), String(unusedMarkers)],
      ],
    ),
  ]);
}
