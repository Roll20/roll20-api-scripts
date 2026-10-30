// Permissions (plan §10): GM checks from the real sender ID, narrowly
// published player tasks, effect-time control checks, single-use
// confirmation tokens for destructive operations and per-player rate limits.

import { TIMING } from './constants.js';
import { getObject, isGm, now } from './host.js';
import { findAnyTarget, playerControls } from './objects.js';
import { getLimits, getState, nextTokenCounter } from './state.js';
import { randomToken } from './utils.js';

const commandWindows = new Map();

export { isGm };

/**
 * Returns true when a player may start a definition with the given targets.
 *
 * @param {string} playerId Real sender ID.
 * @param {object} def Definition snapshot.
 * @param {object} [bindings] Resolved bindings.
 * @returns {{ok: boolean, reason?: string}} Decision.
 */
export function canStart(playerId, def, bindings = {}) {
  if (isGm(playerId)) {
    return { ok: true };
  }
  if (!playerId || playerId === 'API') {
    return { ok: false, reason: 'apiDenied' };
  }
  const access = def.access || {};
  if (access.mode !== 'players') {
    return { ok: false, reason: 'gmOnly' };
  }
  const listed =
    Array.isArray(access.players) &&
    (access.players.includes(playerId) || access.players.includes('all'));
  const ids = Object.values(bindings).flat();
  const controlsAll =
    ids.length > 0 &&
    ids.every((id) => {
      const found = findAnyTarget(id);
      return found && playerControls(playerId, found.obj, found.type);
    });
  if (!listed && !(access.controllers && controlsAll)) {
    return { ok: false, reason: 'notShared' };
  }
  // Players may only aim the task at things they control.
  if (ids.length && !controlsAll) {
    return { ok: false, reason: 'notController' };
  }
  const maxTargets = access.capabilities?.maxTargets;
  if (Number.isInteger(maxTargets) && ids.length > maxTargets) {
    return { ok: false, reason: 'tooManyTargets' };
  }
  return { ok: true };
}

/**
 * Returns true when a player may inspect, pause, resume or cancel a run.
 *
 * @param {string} playerId Real sender ID.
 * @param {object} inst Instance.
 * @returns {boolean} True when allowed.
 */
export function canManageRun(playerId, inst) {
  if (isGm(playerId)) {
    return true;
  }
  return (
    Boolean(playerId) &&
    playerId !== 'API' &&
    inst.initiatorPlayerId === playerId &&
    inst.authority === 'initiator'
  );
}

/**
 * Checks, at effect time, that a run may still act on its targets. Player
 * runs lose authority when the player loses control; GM-service runs need
 * the definition to be enabled and published by a GM.
 *
 * @param {object} inst Instance.
 * @param {string[]} targetIds Object IDs the step will change.
 * @param {object} def Definition snapshot.
 * @returns {{ok: boolean, reason?: string, id?: string}} Decision.
 */
export function checkEffectAuthority(inst, targetIds, def) {
  if (inst.authority === 'gmService') {
    return { ok: true };
  }
  const playerId = inst.initiatorPlayerId;
  if (isGm(playerId)) {
    return { ok: true };
  }
  if (!playerId || !getObject('player', playerId)) {
    return { ok: false, reason: 'initiatorGone' };
  }
  const access = def.access || {};
  if (access.mode !== 'players') {
    return { ok: false, reason: 'publicationRevoked' };
  }
  for (const id of targetIds) {
    const found = findAnyTarget(id);
    if (found && !playerControls(playerId, found.obj, found.type)) {
      return { ok: false, reason: 'controlLost', id };
    }
  }
  return { ok: true };
}

/**
 * Applies the per-player command rate limit.
 *
 * @param {string} playerId Player ID.
 * @returns {boolean} True when the command may run.
 */
export function allowCommand(playerId) {
  if (isGm(playerId)) {
    return true;
  }
  const at = now();
  const window = commandWindows.get(playerId) || { start: at, count: 0 };
  if (at - window.start > 60000) {
    window.start = at;
    window.count = 0;
  }
  window.count += 1;
  commandWindows.set(playerId, window);
  return window.count <= getLimits().playerCommandsPerMinute;
}

/**
 * Issues a single-use confirmation token bound to the caller, the operation,
 * the IDs and their revisions.
 *
 * @param {string} playerId Caller.
 * @param {string} op Operation.
 * @param {object} payload Operation details (IDs, revisions, options).
 * @returns {string} Token.
 */
export function issueConfirmation(playerId, op, payload) {
  const s = getState();
  pruneConfirmations();
  const token = randomToken(nextTokenCounter());
  s.confirmations[token] = { playerId, op, payload, expiresAt: now() + TIMING.confirmationTtlMs };
  return token;
}

/**
 * Consumes a confirmation token. Expired, reused or foreign tokens fail.
 *
 * @param {string} token Token.
 * @param {string} playerId Caller.
 * @returns {{ok: boolean, op?: string, payload?: object, reason?: string}} Result.
 */
export function consumeConfirmation(token, playerId) {
  const s = getState();
  const entry = s.confirmations[token];
  if (!entry) {
    return { ok: false, reason: 'confirmationUnknown' };
  }
  delete s.confirmations[token];
  if (entry.expiresAt < now()) {
    return { ok: false, reason: 'confirmationExpired' };
  }
  if (entry.playerId !== playerId) {
    return { ok: false, reason: 'confirmationForeign' };
  }
  return { ok: true, op: entry.op, payload: entry.payload };
}

/**
 * Drops expired confirmations.
 *
 * @returns {void}
 */
export function pruneConfirmations() {
  const s = getState();
  const at = now();
  for (const [token, entry] of Object.entries(s.confirmations)) {
    if (entry.expiresAt < at) {
      delete s.confirmations[token];
    }
  }
}
