import {
  DEFAULT_MACRO_BODY,
  DEFAULT_MULTI_TARGET_MACRO_BODY,
  MACRO_NAME,
  MACRO_NAME_MULTI_TARGET,
  SCRIPT_NAME,
} from "./constants.js";
import { getGmPlayerIds, queryObjects } from "./utils.js";

const MACRO_DEFINITIONS = [
  { name: MACRO_NAME, body: DEFAULT_MACRO_BODY },
  { name: MACRO_NAME_MULTI_TARGET, body: DEFAULT_MULTI_TARGET_MACRO_BODY },
];

/**
 * Installs or updates all GM-facing macros for all current GMs.
 *
 * @returns {void}
 */
export function installMacro() {
  const gmIds = getGmIds();
  if (!gmIds.length) {
    log(
      `${SCRIPT_NAME} macro install skipped: no GM player id is currently available.`,
    );
    return;
  }

  const gmIdSet = new Set(gmIds);
  let createdCount = 0;
  let updatedCount = 0;
  let removedCount = 0;

  for (const macroDef of MACRO_DEFINITIONS) {
    const macrosByOwner = groupMacrosByOwner(
      queryObjects({ _type: "macro", name: macroDef.name }),
    );

    for (const gmId of gmIds) {
      const result = syncGmMacro(
        gmId,
        macrosByOwner.get(gmId) || [],
        gmId,
        macroDef,
      );
      createdCount += result.created;
      updatedCount += result.updated;
      removedCount += result.removed;
    }

    removedCount += removeOrphanedMacros(macrosByOwner, gmIdSet);
  }

  logInstallResult(createdCount, updatedCount, removedCount);
}

/**
 * Groups existing macros by their owner player id.
 *
 * @param {object[]} macros Roll20 macro objects.
 * @returns {Map<string, object[]>} Macros keyed by owner player id.
 */
function groupMacrosByOwner(macros) {
  const byOwner = new Map();
  for (const macro of macros) {
    const ownerId = macro.get("playerid") || "";
    if (!byOwner.has(ownerId)) {
      byOwner.set(ownerId, []);
    }
    byOwner.get(ownerId).push(macro);
  }
  return byOwner;
}

/**
 * Creates or updates one named macro for a GM, removing any duplicates.
 *
 * @param {string} gmId GM player id.
 * @param {object[]} ownerMacros Existing macros owned by this GM for this definition.
 * @param {string} visibleTo Comma-separated GM ids for visibility.
 * @param {{name: string, body: string}} macroDef Macro name and action body.
 * @returns {{created: number, updated: number, removed: number}} Counts.
 */
function syncGmMacro(gmId, ownerMacros, visibleTo, macroDef) {
  if (ownerMacros.length === 0) {
    createObj("macro", {
      playerid: gmId,
      name: macroDef.name,
      action: macroDef.body,
      visibleto: visibleTo,
      istokenaction: false,
    });
    return { created: 1, updated: 0, removed: 0 };
  }

  const [primaryMacro, ...duplicates] = ownerMacros;
  primaryMacro.set({
    action: macroDef.body,
    visibleto: visibleTo,
    istokenaction: false,
  });

  for (const duplicate of duplicates) {
    duplicate.remove();
  }

  return { created: 0, updated: 1, removed: duplicates.length };
}

/**
 * Removes macros owned by players who are no longer GMs.
 *
 * @param {Map<string, object[]>} macrosByOwner Macros keyed by owner player id.
 * @param {Set<string>} gmIdSet Current GM player ids.
 * @returns {number} Number of macros removed.
 */
function removeOrphanedMacros(macrosByOwner, gmIdSet) {
  let removed = 0;
  for (const [ownerId, orphans] of macrosByOwner) {
    if (gmIdSet.has(ownerId)) continue;
    for (const orphan of orphans) {
      orphan.remove();
      removed += 1;
    }
  }
  return removed;
}

/**
 * Logs the result of a macro install/update pass.
 *
 * @param {number} createdCount Macros created.
 * @param {number} updatedCount Macros updated.
 * @param {number} removedCount Macros removed.
 * @returns {void}
 */
function logInstallResult(createdCount, updatedCount, removedCount) {
  const cleanupNote =
    removedCount > 0 ? ` Cleaned up ${removedCount} duplicate macro(s).` : "";
  if (createdCount > 0) {
    log(
      `${SCRIPT_NAME}: Macros installed (created ${createdCount}).${cleanupNote}`,
    );
  } else {
    log(
      `${SCRIPT_NAME}: Macros updated (updated ${updatedCount}).${cleanupNote}`,
    );
  }
}

/**
 * Returns true when at least one Condition Tracker macro exists.
 *
 * @returns {boolean} True when present.
 */
export function macroExists() {
  return MACRO_DEFINITIONS.some(
    (def) => queryObjects({ _type: "macro", name: def.name }).length > 0,
  );
}

/**
 * Builds a Roll20 visibleto string for all current GMs.
 *
 * @returns {string} Comma-separated GM player ids.
 */
export function getGmVisibleTo() {
  return getGmIds().join(",");
}

/**
 * Returns all current GM player ids.
 *
 * @returns {string[]} GM player ids.
 */
export function getGmIds() {
  return getGmPlayerIds();
}
