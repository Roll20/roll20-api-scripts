import {
  COMMAND,
  SCRIPT_LAST_UPDATED,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  TOKEN_MARKER_SEPARATOR,
} from "./constants.js";
import {
  applyGlobalConfig,
  ensureState,
  getActiveConditions,
  partitionActiveConditions,
  getConfig,
  setActiveConditions,
  updateTurnRuntime,
} from "./state.js";
import { t } from "./i18n.js";
import { installMacro } from "./macros.js";
import { installHandout } from "./handout.js";
import {
  handleInput,
  isPlayerToken,
  promptZeroHpConditionRemoval,
  removeExpiredConditions,
  showMenu,
} from "./commands.js";
import { buildButton, whisper } from "./chat.js";
import { decrementDuration } from "./durations.js";
import {
  containsMarker,
  getTokenMarkers,
  removeMarkerIfUnused,
} from "./markers.js";
import { getGmPlayerIds, getTokenName, toText } from "./utils.js";
import {
  getCurrentTurnTokenId,
  getConditionRowIdSet,
  getTokenRowIds,
  findMisplacedConditionIds,
  getTurnSignature,
  migrateTurnOrderRows,
  removeConditionRows,
  updateConditionRow,
} from "./turnOrder.js";

/**
 * Initializes state, macros, and runtime turn bookkeeping.
 *
 * @returns {void}
 */
function checkInstall() {
  ensureState();
  applyGlobalConfig();
  migrateTurnOrderRows();
  updateTurnRuntime(
    getCurrentTurnTokenId(),
    getTurnSignature(),
    getTokenRowIds(),
    findMisplacedConditionIds(),
  );
  installMacro();
  installHandout(getConfig().language);
  log(
    `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`,
  );

  const locale = getConfig().language;
  const gmIds = getGmPlayerIds();
  for (const gmId of gmIds) {
    whisper(
      gmId,
      t("ui.title.scriptReady", locale),
      t("ui.msg.scriptReady", locale, {
        name: SCRIPT_NAME,
        version: SCRIPT_VERSION,
      }),
    );
    showMenu(gmId);
  }
}

/**
 * Handles token changes for HP-zero cleanup.
 *
 * @param {Graphic} token Changed token.
 * @param {object} previous Previous token attributes.
 * @returns {void}
 */
function handleTokenChange(token, previous) {
  try {
    if (previous.statusmarkers !== undefined) {
      const prevMarkers = toText(previous.statusmarkers)
        .split(TOKEN_MARKER_SEPARATOR)
        .map((s) => s.trim())
        .filter(Boolean);
      const currMarkers = getTokenMarkers(token);
      if (
        containsMarker(currMarkers, "dead") &&
        !containsMarker(prevMarkers, "dead")
      ) {
        const targetName = getTokenName(token);
        promptZeroHpConditionRemoval(token, targetName, isPlayerToken(token));
        return;
      }
    }

    const config = getConfig();
    const bar = config.healthBar;
    const previousValue = Number(previous[bar]);
    const currentValue = Number(token.get(bar));

    if (!Number.isFinite(currentValue) || currentValue > 0) {
      return;
    }

    if (Number.isFinite(previousValue) && previousValue <= 0) {
      return;
    }

    const targetName = getTokenName(token);
    promptZeroHpConditionRemoval(token, targetName, isPlayerToken(token));
  } catch (error) {
    log(`${SCRIPT_NAME} HP cleanup error: ${error.message}`);
  }
}

/**
 * Removes conditions bound to a deleted token.
 *
 * Prunes conditions where the deleted token was either source or target,
 * removes matching turn-order rows in a single pass, and clears markers from
 * surviving target tokens when they are no longer needed.
 *
 * @param {Graphic} token Deleted token.
 * @returns {void}
 */
function handleTokenDestroy(token) {
  try {
    const tokenId = token?.id || "";
    if (!tokenId) {
      return;
    }

    const { matched: removed, unmatched: kept } = partitionActiveConditions(
      (condition) =>
        condition.sourceTokenId === tokenId ||
        condition.targetTokenId === tokenId,
    );

    if (removed.length === 0) {
      return;
    }

    setActiveConditions(kept);
    removeConditionRows(removed.map((condition) => condition.id));
    for (const condition of removed) {
      removeMarkerIfUnused(condition);
    }
  } catch (error) {
    log(`${SCRIPT_NAME} token cleanup error: ${error.message}`);
  }
}

/**
 * Handles Turn Tracker changes for duration expiration.
 *
 * @returns {void}
 */
function handleTurnOrderChange() {
  try {
    const trackerState = ensureState();
    const currentSignature = getTurnSignature();
    if (currentSignature === trackerState.runtime.previousTurnSignature) {
      return;
    }

    const previousFirstTurnId = trackerState.runtime.previousFirstTurnId;
    const previousTokenIds = trackerState.runtime.previousTokenIds || [];
    const previousMisplacedIds =
      trackerState.runtime.previousMisplacedConditionIds || [];
    const currentFirstTurnId = getCurrentTurnTokenId();
    const currentTokenIds = getTokenRowIds();
    reconcileActiveConditionsWithTurnOrder();
    const currentMisplacedIds = findMisplacedConditionIds();
    updateTurnRuntime(
      currentFirstTurnId,
      currentSignature,
      currentTokenIds,
      currentMisplacedIds,
    );

    if (
      shouldPromptConditionReorder(
        previousTokenIds,
        currentTokenIds,
        previousMisplacedIds,
        currentMisplacedIds,
      )
    ) {
      promptConditionReorder(getPrimaryGmId(), currentMisplacedIds.length);
    }

    if (!previousFirstTurnId || previousFirstTurnId === currentFirstTurnId) {
      return;
    }

    const { expired, decremented } =
      collectExpiredConditions(previousFirstTurnId);
    for (const condition of decremented) {
      updateConditionRow(condition);
    }
    removeExpiredConditions(getPrimaryGmId(), expired);
  } catch (error) {
    log(`${SCRIPT_NAME} duration error: ${error.message}`);
  }
}

/**
 * Returns true when a turn-order change should prompt the GM to reorder
 * condition rows.
 *
 * @param {string[]} previousTokenIds Token ids from the previous turn order snapshot.
 * @param {string[]} currentTokenIds Token ids from the current turn order.
 * @param {string[]} previousMisplacedIds Previously misplaced condition ids.
 * @param {string[]} currentMisplacedIds Currently misplaced condition ids.
 * @returns {boolean} True when a reorder prompt should be whispered.
 */
function shouldPromptConditionReorder(
  previousTokenIds,
  currentTokenIds,
  previousMisplacedIds,
  currentMisplacedIds,
) {
  if (currentMisplacedIds.length === 0) {
    return false;
  }

  const previousMisplacedSet = new Set(previousMisplacedIds);
  const newlyMisplaced = currentMisplacedIds.some(
    (id) => !previousMisplacedSet.has(id),
  );
  if (!newlyMisplaced) {
    return false;
  }

  if (isSingleTurnAdvance(previousTokenIds, currentTokenIds)) {
    return false;
  }

  return true;
}

/**
 * Returns true when token rows changed by the normal next-turn rotation.
 *
 * @param {string[]} previousIds Token ids from the previous turn order snapshot.
 * @param {string[]} currentIds Token ids from the current turn order.
 * @returns {boolean} True for a one-step left rotation.
 */
function isSingleTurnAdvance(previousIds, currentIds) {
  if (previousIds.length < 2 || previousIds.length !== currentIds.length) {
    return false;
  }

  const rotated = previousIds.slice(1).concat(previousIds[0]);
  return arraysEqual(rotated, currentIds);
}

/**
 * Returns true when two string arrays have the same values in the same order.
 *
 * @param {string[]} a First array.
 * @param {string[]} b Second array.
 * @returns {boolean} True when arrays match.
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

/**
 * Whispers a GM prompt asking whether to reorder displaced condition rows.
 *
 * @param {string} gmId GM player id.
 * @param {number} count Number of misplaced condition rows detected.
 * @returns {void}
 */
function promptConditionReorder(gmId, count) {
  const locale = getConfig().language;
  whisper(gmId, t("ui.title.conditionReorder", locale), [
    t("ui.msg.conditionReorder", locale, { count }),
    buildButton(
      t("ui.btn.reorderConditions", locale),
      `${COMMAND} --reorder-conditions`,
    ),
  ]);
}

/**
 * Removes active conditions whose custom Turn Tracker rows no longer exist.
 *
 * @returns {number} Number of removed state entries.
 */
function reconcileActiveConditionsWithTurnOrder() {
  const rowConditionIds = getConditionRowIdSet();
  const { matched: kept, unmatched: removed } = partitionActiveConditions(
    (condition) => rowConditionIds.has(condition.id),
  );

  if (removed.length === 0) {
    return 0;
  }

  setActiveConditions(kept);
  for (const condition of removed) {
    removeMarkerIfUnused(condition);
  }

  return removed.length;
}

/**
 * Collects conditions that expired or decremented when an anchor token turn ended.
 *
 * @param {string} endedTurnTokenId Token id whose turn ended.
 * @returns {{ expired: object[], decremented: object[] }} Expired and decremented condition records.
 */
function collectExpiredConditions(endedTurnTokenId) {
  const expired = [];
  const decremented = [];

  for (const condition of getActiveConditions()) {
    const anchored = isAnchoredTo(condition, endedTurnTokenId);
    if (decrementDuration(condition, endedTurnTokenId)) {
      expired.push(condition);
    } else if (anchored) {
      decremented.push(condition);
    }
  }

  return { expired, decremented };
}

/**
 * Returns true when a condition's duration is anchored to the given token.
 *
 * @param {object} condition Active condition record.
 * @param {string} tokenId Token id to check against.
 * @returns {boolean} True when anchored.
 */
function isAnchoredTo(condition, tokenId) {
  const d = condition.duration;
  return d?.anchor === tokenId;
}

/**
 * Returns a GM player id for automated whispers.
 *
 * @returns {string} GM player id or an empty string.
 */
function getPrimaryGmId() {
  return getGmPlayerIds()[0] || "";
}

/**
 * Registers Roll20 event handlers.
 *
 * @returns {void}
 */
function registerEventHandlers() {
  on("ready", checkInstall);
  on("chat:message", handleInput);
  on("change:graphic", handleTokenChange);
  on("destroy:graphic", handleTokenDestroy);
  on("change:campaign:turnorder", handleTurnOrderChange);
}

registerEventHandlers();
