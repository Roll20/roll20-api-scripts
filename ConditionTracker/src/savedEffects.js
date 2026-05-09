import { DURATION_UNTIL_REMOVED, SAVED_VISIBILITY_GM } from './constants.js';
import { ensureState } from './state.js';
import { createId, isRecord } from './utils.js';

/**
 * @typedef {object} SavedEffect
 * @property {string} id Unique identifier prefixed with "ct_".
 * @property {"public"|"masked"|"gm"} visibility Visibility mode.
 * @property {string} condition Canonical condition type key.
 * @property {string} other Custom effect free-text (for Spell / Ability / Other types).
 * @property {string} targetTokenId Target token id.
 * @property {string} targetCharacterId Target character id (for future relinking).
 * @property {string} sourceTokenId Source token id, may be empty.
 * @property {string} sourceCharacterId Source character id, may be empty.
 * @property {string} subjectTokenId Subject token id, may be empty.
 * @property {object} duration Duration object.
 * @property {string} publicLabel Vague public label shown in Turn Tracker for masked effects.
 * @property {string} gmLabel Full GM-only description.
 * @property {object|null} snooze Active snooze state, or null when not snoozed.
 * @property {string} lastReminderTurnKey Turn signature when the GM reminder was last shown.
 * @property {number} createdAt Creation epoch timestamp.
 * @property {number} updatedAt Last update epoch timestamp.
 */

/**
 * Returns the savedEffects map from state, initialising it if absent.
 *
 * @returns {object} savedEffects map keyed by targetTokenId.
 */
function getSavedEffectsMap() {
  const trackerState = ensureState();
  if (!isRecord(trackerState.savedEffects)) {
    trackerState.savedEffects = {};
  }
  return trackerState.savedEffects;
}

/**
 * Creates a new saved-effect record with all required fields populated.
 *
 * @param {object} fields Effect field overrides.
 * @returns {SavedEffect} Fully initialised saved-effect record.
 */
export function createSavedEffect(fields) {
  const now = Date.now();
  return {
    id: createId(),
    visibility: fields.visibility || SAVED_VISIBILITY_GM,
    condition: fields.condition || 'Other',
    other: fields.other || '',
    targetTokenId: fields.targetTokenId || '',
    targetCharacterId: fields.targetCharacterId || '',
    sourceTokenId: fields.sourceTokenId || '',
    sourceCharacterId: fields.sourceCharacterId || '',
    subjectTokenId: fields.subjectTokenId || '',
    duration: isRecord(fields.duration) ? fields.duration : { type: DURATION_UNTIL_REMOVED },
    publicLabel: fields.publicLabel || '',
    gmLabel: fields.gmLabel || fields.other || '',
    snooze: null,
    lastReminderTurnKey: '',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns all saved effects stored for a specific target token.
 *
 * @param {string} targetTokenId Target token id.
 * @returns {SavedEffect[]} Saved effects for that token.
 */
export function getSavedEffectsForToken(targetTokenId) {
  const list = getSavedEffectsMap()[targetTokenId];
  return Array.isArray(list) ? list : [];
}

/**
 * Returns all saved effects across every token.
 *
 * @returns {SavedEffect[]} All saved effects in state.
 */
export function getAllSavedEffects() {
  const effects = [];
  for (const list of Object.values(getSavedEffectsMap())) {
    if (Array.isArray(list)) {
      effects.push(...list);
    }
  }
  return effects;
}

/**
 * Finds a saved effect by its unique id, searching all token buckets.
 *
 * @param {string} id Saved-effect id.
 * @returns {SavedEffect|null} Matching effect, or null when not found.
 */
export function findSavedEffect(id) {
  for (const list of Object.values(getSavedEffectsMap())) {
    if (!Array.isArray(list)) continue;
    const effect = list.find((e) => e.id === id);
    if (effect) return effect;
  }
  return null;
}

/**
 * Adds a saved effect to persistent state.
 *
 * @param {SavedEffect} effect Saved-effect record.
 * @returns {SavedEffect} The saved effect.
 */
export function addSavedEffect(effect) {
  const map = getSavedEffectsMap();
  const tokenId = effect.targetTokenId;
  if (!Array.isArray(map[tokenId])) {
    map[tokenId] = [];
  }
  map[tokenId].push(effect);
  return effect;
}

/**
 * Applies a partial update to an existing saved effect.
 *
 * @param {string} id Saved-effect id.
 * @param {object} updates Fields to merge onto the existing record.
 * @returns {SavedEffect|null} Updated record, or null when not found.
 */
export function updateSavedEffect(id, updates) {
  const map = getSavedEffectsMap();
  for (const list of Object.values(map)) {
    if (!Array.isArray(list)) continue;
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
      return list[idx];
    }
  }
  return null;
}

/**
 * Removes a saved effect from state by id.
 *
 * @param {string} id Saved-effect id.
 * @returns {SavedEffect|null} The removed record, or null when not found.
 */
export function removeSavedEffect(id) {
  const map = getSavedEffectsMap();
  for (const [tokenId, list] of Object.entries(map)) {
    if (!Array.isArray(list)) continue;
    const idx = list.findIndex((e) => e.id === id);
    if (idx !== -1) {
      const [removed] = list.splice(idx, 1);
      if (list.length === 0) {
        delete map[tokenId];
      }
      return removed;
    }
  }
  return null;
}

/**
 * Removes all saved effects whose target token matches the given id.
 *
 * Called when a token is destroyed so orphaned saved effects are cleaned up.
 *
 * @param {string} tokenId Target token id.
 * @returns {number} Number of effects removed.
 */
export function removeSavedEffectsForToken(tokenId) {
  const map = getSavedEffectsMap();
  const list = map[tokenId];
  if (!Array.isArray(list)) return 0;
  const count = list.length;
  delete map[tokenId];
  return count;
}

/**
 * Clears combat-scoped snoozes from all saved effects.
 *
 * Called when the Turn Tracker becomes empty (combat ends) so effects
 * snoozed for "this combat" resume reminders at the start of the next combat.
 *
 * @returns {number} Number of snoozes cleared.
 */
export function clearCombatSnoozes() {
  let cleared = 0;
  for (const effect of getAllSavedEffects()) {
    if (effect.snooze?.scope === 'combat') {
      updateSavedEffect(effect.id, { snooze: null });
      cleared += 1;
    }
  }
  return cleared;
}
