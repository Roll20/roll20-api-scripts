import {
  CONDITION_ADVANTAGE,
  CONDITION_DISADVANTAGE,
  DURATION_UNTIL_REMOVED,
  EMPTY_TURN_ORDER,
  TURN_ORDER_PREFIX,
} from "./constants.js";
import { ensureState } from "./state.js";
import { parseJson, toText } from "./utils.js";

/**
 * Gets the current Campaign turn order as an array.
 *
 * @returns {object[]} Current turn order rows.
 */
export function getTurnOrder() {
  const campaign = Campaign();
  const rows = parseJson(campaign.get("turnorder") || EMPTY_TURN_ORDER, []);
  return Array.isArray(rows) ? rows : [];
}

/**
 * Saves the Campaign turn order.
 *
 * @param {object[]} rows Turn order rows.
 * @returns {void}
 */
export function setTurnOrder(rows) {
  Campaign().set("turnorder", JSON.stringify(rows));
}

/**
 * Returns the first token id in the current turn order.
 *
 * @returns {string} Current first token id or an empty string.
 */
export function getCurrentTurnTokenId() {
  const rows = getTurnOrder();
  if (rows.length === 0) {
    return "";
  }

  return getTokenRowId(rows[0]);
}

/**
 * Returns the pr value for a condition row based on its duration.
 *
 * @param {object|null} duration Stored duration object.
 * @returns {string} Remaining count as a string, or empty for untimed durations.
 */
function buildTurnOrderPr(duration) {
  if (!duration || duration.type === DURATION_UNTIL_REMOVED) {
    return "";
  }
  return String(duration.remaining);
}

/**
 * Creates a custom Turn Tracker row for a condition.
 *
 * @param {object} condition Active condition record.
 * @returns {object} Turn order row.
 */
export function createConditionRow(condition) {
  return {
    id: "-1",
    pr: buildTurnOrderPr(condition.duration),
    custom: condition.displayText,
    _ct: condition.id,
  };
}

/**
 * Updates the pr value of an existing condition row after a duration decrement.
 *
 * @param {object} condition Active condition record.
 * @returns {void}
 */
export function updateConditionRow(condition) {
  const rows = getTurnOrder();
  let changed = false;

  for (const row of rows) {
    if (getConditionIdFromRow(row) === condition.id) {
      row.pr = buildTurnOrderPr(condition.duration);
      changed = true;
      break;
    }
  }

  if (changed) {
    setTurnOrder(rows);
  }
}

/**
 * Inserts a condition row after the target token and existing target conditions.
 *
 * @param {object} condition Active condition record.
 * @returns {object} Insert result.
 */
export function insertConditionRow(condition) {
  const rows = getTurnOrder();
  const anchorTokenId = getConditionAnchorTokenId(condition);
  const anchorLookup = getConditionAnchorLookup();
  const insertIndex = getInsertIndex(rows, anchorTokenId, anchorLookup);
  const conditionRow = createConditionRow(condition);
  rows.splice(insertIndex.index, 0, conditionRow);
  setTurnOrder(rows);
  return { appended: insertIndex.appended };
}

/**
 * Inserts multiple condition rows in a single turn-order read-write cycle.
 *
 * All conditions must already be added to active state before calling this so
 * the anchor lookup is complete. Rows are spliced sequentially so each
 * insertion sees the positions from prior insertions.
 *
 * @param {object[]} conditions Active condition records.
 * @returns {{ appended: boolean }[]} Per-condition insert results in the same order.
 */
export function insertConditionRows(conditions) {
  if (!conditions || conditions.length === 0) {
    return [];
  }

  const rows = getTurnOrder();
  const anchorLookup = getConditionAnchorLookup();
  const results = [];

  for (const condition of conditions) {
    const anchorTokenId = getConditionAnchorTokenId(condition);
    const insertIndex = getInsertIndex(rows, anchorTokenId, anchorLookup);
    rows.splice(insertIndex.index, 0, createConditionRow(condition));
    results.push({ appended: insertIndex.appended });
  }

  setTurnOrder(rows);
  return results;
}

/**
 * Returns the token id used to anchor a condition row in Turn Tracker.
 *
 * Advantage and Disadvantage are grouped under the source token so they read
 * with the creature granting or imposing the effect.
 *
 * @param {object} condition Active condition record.
 * @returns {string} Anchor token id.
 */
export function getConditionAnchorTokenId(condition) {
  if (
    condition?.condition === CONDITION_ADVANTAGE ||
    condition?.condition === CONDITION_DISADVANTAGE
  ) {
    return toText(condition.sourceTokenId);
  }

  return toText(condition?.targetTokenId);
}

/**
 * Finds the insertion point for a target condition row.
 *
 * @param {object[]} rows Current turn order rows.
 * @param {string} targetTokenId Target token id.
 * @param {Map<string, string>} [anchorLookup] Optional condition-id to anchor-token lookup.
 * @returns {object} Insert index details.
 */
export function getInsertIndex(rows, targetTokenId, anchorLookup) {
  let targetIndex = -1;

  for (let index = 0; index < rows.length; index += 1) {
    if (getTokenRowId(rows[index]) === targetTokenId) {
      targetIndex = index;
      break;
    }
  }

  if (targetIndex < 0) {
    return { index: rows.length, appended: true };
  }

  return {
    index: findAfterExistingTargetConditions(
      rows,
      targetIndex + 1,
      targetTokenId,
      anchorLookup,
    ),
    appended: false,
  };
}

/**
 * Finds the first row after existing Condition Tracker rows for a target.
 *
 * @param {object[]} rows Current turn order rows.
 * @param {number} startIndex Initial index after the target token.
 * @param {string} anchorTokenId Target token id.
 * @param {Map<string, string>} [anchorLookup] Optional condition-id to anchor-token lookup.
 * @returns {number} Insert index.
 */
export function findAfterExistingTargetConditions(
  rows,
  startIndex,
  anchorTokenId,
  anchorLookup,
) {
  const lookup = anchorLookup || getConditionAnchorLookup();
  let index = startIndex;
  while (
    index < rows.length &&
    isConditionRowForTarget(rows[index], anchorTokenId, lookup)
  ) {
    index += 1;
  }

  return index;
}

/**
 * Returns true when a row belongs to a target condition.
 *
 * @param {object} row Turn order row.
 * @param {string} targetTokenId Target token id.
 * @param {Map<string, string>} [anchorLookup] Optional condition-id to anchor-token lookup.
 * @returns {boolean} True for a matching condition row.
 */
export function isConditionRowForTarget(row, targetTokenId, anchorLookup) {
  const conditionId = getConditionIdFromRow(row);
  if (!conditionId) {
    return false;
  }

  const lookup = anchorLookup || getConditionAnchorLookup();
  return lookup.get(conditionId) === targetTokenId;
}

/**
 * Removes a token's own turn order row by token id.
 *
 * @param {string} tokenId Roll20 graphic token id.
 * @returns {boolean} True when a row was removed.
 */
export function removeTokenRow(tokenId) {
  const rows = getTurnOrder();
  const remaining = [];
  let removed = false;

  for (const row of rows) {
    if (getTokenRowId(row) === tokenId) {
      removed = true;
    } else {
      remaining.push(row);
    }
  }

  if (removed) {
    setTurnOrder(remaining);
  }

  return removed;
}

/**
 * Removes a condition row by condition id.
 *
 * @param {string} conditionId Condition id.
 * @returns {boolean} True when a row was removed.
 */
export function removeConditionRow(conditionId) {
  const rows = getTurnOrder();
  const remaining = [];
  let removed = false;

  for (const row of rows) {
    if (getConditionIdFromRow(row) === conditionId) {
      removed = true;
    } else {
      remaining.push(row);
    }
  }

  if (removed) {
    setTurnOrder(remaining);
  }

  return removed;
}

/**
 * Removes one or more condition rows by condition id.
 *
 * Uses a single pass over turn order rows to avoid repeated rescans when
 * cleaning up multiple conditions.
 *
 * @param {Iterable<string>} conditionIds Condition ids to remove.
 * @returns {number} Number of removed rows.
 */
export function removeConditionRows(conditionIds) {
  const ids = new Set();
  for (const id of conditionIds || []) {
    const text = toText(id);
    if (text) {
      ids.add(text);
    }
  }

  if (ids.size === 0) {
    return 0;
  }

  const rows = getTurnOrder();
  const remaining = [];
  let removed = 0;

  for (const row of rows) {
    const conditionId = getConditionIdFromRow(row);
    if (conditionId && ids.has(conditionId)) {
      removed += 1;
    } else {
      remaining.push(row);
    }
  }

  if (removed > 0) {
    setTurnOrder(remaining);
  }

  return removed;
}

/**
 * Removes orphaned condition rows without active state records.
 *
 * @returns {number} Number of removed rows.
 */
export function removeOrphanedConditionRows() {
  const rows = getTurnOrder();
  const activeIds = getActiveConditionIds();
  const remaining = [];
  let removed = 0;

  for (const row of rows) {
    const conditionId = getConditionIdFromRow(row);
    if (conditionId && !activeIds[conditionId]) {
      removed += 1;
    } else {
      remaining.push(row);
    }
  }

  if (removed > 0) {
    setTurnOrder(remaining);
  }

  return removed;
}

/**
 * Returns true when a condition row currently exists.
 *
 * @param {string} conditionId Condition id.
 * @returns {boolean} True when the row exists.
 */
export function conditionRowExists(conditionId) {
  const rows = getTurnOrder();
  for (const row of rows) {
    if (getConditionIdFromRow(row) === conditionId) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts a Condition Tracker id from a row.
 *
 * @param {object} row Turn order row.
 * @returns {string} Condition id or an empty string.
 */
export function getConditionIdFromRow(row) {
  if (row && row._ct) {
    return toText(row._ct);
  }

  // Backward compat: older rows stored the id in the formula field.
  const formula = toText(row && row.formula);
  if (formula.startsWith(TURN_ORDER_PREFIX)) {
    return formula.slice(TURN_ORDER_PREFIX.length);
  }

  return "";
}

/**
 * Returns a token id from a normal token turn row.
 *
 * @param {object} row Turn order row.
 * @returns {string} Token id or an empty string.
 */
export function getTokenRowId(row) {
  const id = toText(row && row.id);
  if (!id || id === "-1") {
    return "";
  }

  return id;
}

/**
 * Builds a signature for turn-order change detection.
 *
 * @returns {string} Turn signature.
 */
export function getTurnSignature() {
  const rows = getTurnOrder();
  if (rows.length === 0) {
    return "";
  }

  // Track all row fields that can affect condition bookkeeping.
  return rows
    .map((row) =>
      [
        toText(row?.id),
        toText(row?.custom),
        toText(row?.pr),
        toText(row?.formula),
        toText(row?._ct),
      ].join("|"),
    )
    .join("\n");
}

/**
 * Rewrites any existing Turn Tracker rows that use the old formula-based
 * identifier to the new _ct field, clearing the formula so Roll20 stops
 * trying to evaluate it as a dice expression.
 *
 * @returns {void}
 */
export function migrateTurnOrderRows() {
  const rows = getTurnOrder();
  let changed = false;

  for (const row of rows) {
    const formula = toText(row.formula);
    if (formula.startsWith(TURN_ORDER_PREFIX)) {
      const conditionId = formula.slice(TURN_ORDER_PREFIX.length);
      if (row._ct !== conditionId) {
        row._ct = conditionId;
      }
      // Roll20 expects formula to be numeric/math; clear legacy metadata values.
      row.formula = "";
      changed = true;
    }
  }

  if (changed) {
    setTurnOrder(rows);
  }
}

/**
 * Builds a lookup object of active condition ids.
 *
 * @returns {object} Lookup object.
 */
export function getActiveConditionIds() {
  const lookup = {};
  for (const condition of ensureState().active) {
    lookup[condition.id] = true;
  }

  return lookup;
}

/**
 * Returns the ids of all token rows (non-custom rows) in turn order sequence.
 *
 * @returns {string[]} Token ids in current turn order.
 */
export function getTokenRowIds() {
  return getTurnOrder()
    .map((row) => getTokenRowId(row))
    .filter(Boolean);
}

/**
 * Returns condition ids whose rows appear after the wrong anchor token.
 *
 * A condition row is misplaced when the most recent token row before it in the
 * tracker is not the condition's anchor token, and the anchor token IS present
 * somewhere in the turn order.
 *
 * @returns {string[]} Misplaced condition ids.
 */
export function findMisplacedConditionIds() {
  const rows = getTurnOrder();
  const anchorLookup = getConditionAnchorLookup();
  const tokenIdSet = new Set(rows.map((r) => getTokenRowId(r)).filter(Boolean));
  const misplaced = [];
  let currentTokenId = null;

  for (const row of rows) {
    const tokenId = getTokenRowId(row);
    if (tokenId) {
      currentTokenId = tokenId;
    } else {
      const conditionId = getConditionIdFromRow(row);
      if (conditionId) {
        const expectedAnchor = anchorLookup.get(conditionId);
        if (
          expectedAnchor &&
          tokenIdSet.has(expectedAnchor) &&
          expectedAnchor !== currentTokenId
        ) {
          misplaced.push(conditionId);
        }
      }
    }
  }

  return misplaced;
}

/**
 * Strips all condition rows from the turn order and re-inserts them
 * immediately after their anchor tokens in a single read-write cycle.
 *
 * @returns {void}
 */
export function reorderAllConditionRows() {
  const rows = getTurnOrder();
  const anchorLookup = getConditionAnchorLookup();
  const activeConditions = ensureState().active;

  const workingRows = rows.filter((row) => !getConditionIdFromRow(row));

  for (const condition of activeConditions) {
    const anchorTokenId = getConditionAnchorTokenId(condition);
    const insertIndex = getInsertIndex(
      workingRows,
      anchorTokenId,
      anchorLookup,
    );
    workingRows.splice(insertIndex.index, 0, createConditionRow(condition));
  }

  setTurnOrder(workingRows);
}

/**
 * Returns a Set of all condition ids that currently have a Turn Tracker row.
 *
 * Builds the Set in a single pass so callers avoid O(n) per-condition scans.
 *
 * @returns {Set<string>} Condition ids with an existing row.
 */
export function getConditionRowIdSet() {
  const ids = new Set();
  for (const row of getTurnOrder()) {
    const id = getConditionIdFromRow(row);
    if (id) ids.add(id);
  }
  return ids;
}

/**
 * Builds a condition-id to anchor-token lookup from active state.
 *
 * @returns {Map<string, string>} Condition anchor lookup.
 */
export function getConditionAnchorLookup() {
  const lookup = new Map();
  for (const condition of ensureState().active) {
    lookup.set(condition.id, getConditionAnchorTokenId(condition));
  }

  return lookup;
}
