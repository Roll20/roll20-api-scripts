// The thin Roll20 boundary (plan §3). Every Roll20 global the engine uses is
// reached through here, so the rest of the code reads as plain functions and
// tests can run the bundle in a stub sandbox.

import { SCRIPT_NAME } from './constants.js';
import { isRecord, toText } from './utils.js';

/**
 * Returns the current epoch time. Roll20 has no monotonic clock.
 *
 * @returns {number} Epoch milliseconds.
 */
export function now() {
  return Date.now();
}

/**
 * Sets a timeout. Only the scheduler may call this.
 *
 * @param {Function} fn Callback.
 * @param {number} ms Delay.
 * @returns {*} Handle.
 */
export function setTimer(fn, ms) {
  return setTimeout(fn, ms);
}

/**
 * Clears a timeout. Only the scheduler may call this.
 *
 * @param {*} handle Handle.
 * @returns {void}
 */
export function clearTimer(handle) {
  clearTimeout(handle);
}

/**
 * Returns the persistent state root object.
 *
 * @returns {object} Roll20 `state`.
 */
export function stateRoot() {
  return state;
}

/**
 * Writes a line to the API console.
 *
 * @param {string} text Text.
 * @returns {void}
 */
export function logLine(text) {
  log(`${SCRIPT_NAME}: ${text}`);
}

/**
 * Returns a Roll20 object by type and ID, or null.
 *
 * @param {string} type Object type.
 * @param {string} id Object ID.
 * @returns {object|null} Object.
 */
export function getObject(type, id) {
  if (typeof id !== 'string' || !id) {
    return null;
  }
  return getObj(type, id) || null;
}

/**
 * Finds Roll20 objects.
 *
 * @param {object} filter findObjs filter.
 * @returns {object[]} Objects.
 */
export function findObjects(filter) {
  return findObjs(filter) || [];
}

/**
 * Creates a Roll20 object.
 *
 * @param {string} type Object type.
 * @param {object} attrs Attributes.
 * @returns {object|null} Object.
 */
export function createObject(type, attrs) {
  return createObj(type, attrs) || null;
}

/**
 * Returns the campaign object.
 *
 * @returns {object} Campaign.
 */
export function campaign() {
  return Campaign();
}

/**
 * Returns true when a sender is a real GM. API-origin messages (`playerid`
 * "API") are never GMs, whatever name they claim.
 *
 * @param {string} playerId Player ID from the message.
 * @returns {boolean} True for GMs.
 */
export function isGm(playerId) {
  if (typeof playerId !== 'string' || !playerId || playerId === 'API') {
    return false;
  }
  return Boolean(playerIsGM(playerId));
}

/**
 * Returns the IDs of every GM in the game.
 *
 * @returns {string[]} GM player IDs.
 */
export function gmPlayerIds() {
  return findObjects({ _type: 'player' })
    .filter((player) => isGm(player.id))
    .map((player) => player.id);
}

/**
 * Returns a player's display name.
 *
 * @param {string} playerId Player ID.
 * @returns {string} Name, or the ID.
 */
export function playerName(playerId) {
  return toText(getObject('player', playerId)?.get('displayname')) || toText(playerId);
}

/**
 * Sends a chat message.
 *
 * @param {string} speaker Speaker name.
 * @param {string} text Message text.
 * @param {object} [options] sendChat options.
 * @returns {void}
 */
export function chat(speaker, text, options) {
  sendChat(speaker, text, null, options);
}

/**
 * Returns true when a Roll20 function exists and is not a legacy no-op stub.
 *
 * @param {string} name Global function name.
 * @returns {boolean} True when callable.
 */
export function hasFunction(name) {
  return typeof globalThis[name] === 'function';
}

/**
 * Pings a location.
 *
 * @param {number} left X.
 * @param {number} top Y.
 * @param {string} pageId Page ID.
 * @param {string|null} playerId Who pings (null for the Mod).
 * @param {boolean} moveAll Move everyone's view.
 * @param {string[]|undefined} visibleTo Player IDs who see it.
 * @returns {void}
 */
export function ping(left, top, pageId, playerId, moveAll, visibleTo) {
  sendPing(left, top, pageId, playerId, moveAll, visibleTo);
}

/**
 * Spawns a built-in or custom effect.
 *
 * @param {object} spec {left, top, pageId, fx, to?, definition?}.
 * @returns {void}
 */
export function spawnEffect(spec) {
  if (spec.definition) {
    spawnFxWithDefinition(spec.left, spec.top, spec.definition, spec.pageId);
  } else if (spec.to) {
    spawnFxBetweenPoints(
      { x: spec.left, y: spec.top },
      { x: spec.to.left, y: spec.to.top },
      spec.fx,
      spec.pageId
    );
  } else {
    spawnFx(spec.left, spec.top, spec.fx, spec.pageId);
  }
}

/**
 * Returns the Roll20 One-Click useroptions for this Mod.
 *
 * @param {string} key State key.
 * @returns {object|null} Options.
 */
export function userOptions(key) {
  if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
    return null;
  }
  const branch = globalconfig[key.toLowerCase()] || globalconfig[key];
  if (!isRecord(branch)) {
    return null;
  }
  return isRecord(branch.useroptions) ? branch.useroptions : branch;
}

/**
 * Registers a Roll20 event handler.
 *
 * @param {string} event Event name.
 * @param {Function} fn Handler.
 * @returns {void}
 */
export function onEvent(event, fn) {
  on(event, fn);
}

let jumpgateCache = null;

/**
 * Returns true when the game runs on Jumpgate.
 *
 * @returns {boolean} True for Jumpgate games.
 */
export function isJumpgate() {
  if (jumpgateCache === null) {
    const c = campaign();
    jumpgateCache = toText(c.get('_release') || c.get('release')).toLowerCase() === 'jumpgate';
  }
  return jumpgateCache;
}
