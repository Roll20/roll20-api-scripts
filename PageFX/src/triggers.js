// Triggers: things that happen in the game and start, stop or fire an effect.
//
// - round: a new combat round begins. Roll20 keeps no round number, so a
//   round begins when the turn order is advanced from its last entry back to
//   its first (the new top entry has a higher initiative than the old one),
//   or when a custom entry named "Round" changes value.
// - turn: a chosen token's turn begins (it reaches the top of the turn order).
// - enter / leave: a token moves into or out of an area: the effect's own
//   area, or another token's Aura 1.
//
// Roll20 raises no event when another Mod changes the turn order or moves a
// token, so the turn order is also checked every few seconds, and other Mods
// can call PageFX.checkToken(token) after moving one.

import { isInArea, pageMetrics, tokenArea } from './geometry.js';
import { fireOnce, pageValues, refreshEffect, tokenValues } from './scheduler.js';
import { getEffects, getNullAreas, getState } from './state.js';
import { isRecord, toNumber, toText } from './utils.js';

/** @typedef {import('./state.js').Trigger} Trigger */

// ---------------------------------------------------------------------------
// Turn order (pure).

/**
 * Reads Roll20's turn order.
 *
 * @param {*} raw Campaign turnorder value (JSON text).
 * @returns {Array<{id: string, pr: *, custom: string}>} Entries.
 */
export function readTurnOrder(raw) {
  let list = raw;
  if (typeof raw === 'string') {
    try {
      list = raw.trim() === '' ? [] : JSON.parse(raw);
    } catch {
      list = [];
    }
  }
  return (Array.isArray(list) ? list : []).filter(isRecord).map((e) => ({
    id: toText(e.id),
    pr: e.pr,
    custom: toText(e.custom),
  }));
}

/**
 * Finds a custom "Round" entry.
 *
 * @param {Array<{id: string, pr: *, custom: string}>} list Turn order.
 * @returns {{id: string, pr: *, custom: string}|undefined} Entry.
 */
function roundEntry(list) {
  return list.find((e) => e.id === '-1' && /^round$/i.test(e.custom.trim()));
}

/**
 * Works out what a turn order change means.
 *
 * @param {Array<{id: string, pr: *, custom: string}>} prev Turn order before.
 * @param {Array<{id: string, pr: *, custom: string}>} cur Turn order now.
 * @returns {{turn: string|null, newRound: boolean, roundValue: number|null, cleared: boolean}}
 *   Whose turn began (token ID, null when the top did not change), whether a new round
 *   began, the "Round" entry's value when there is one, and whether the order was emptied.
 */
export function readTurnChange(prev, cur) {
  const result = { turn: null, newRound: false, roundValue: null, cleared: false };
  if (cur.length === 0) {
    result.cleared = prev.length > 0;
    return result;
  }
  if (prev.length > 0 && cur[0].id === prev[0].id && cur[0].custom === prev[0].custom) {
    // The top did not change, but a Round entry may have been edited.
  } else if (prev.length > 0) {
    result.turn = cur[0].id;
  }
  const before = roundEntry(prev);
  const after = roundEntry(cur);
  if (after) {
    const value = toNumber(after.pr);
    result.roundValue = value;
    if (before && value !== null && toNumber(before.pr) !== value) {
      result.newRound = true;
    }
    return result;
  }
  // An advance moves the old top entry to the bottom. It wraps to a new round
  // when the new top entry has a higher initiative than the old one.
  const advanced = prev.length > 1 && cur.length === prev.length && cur.at(-1).id === prev[0].id;
  if (advanced) {
    const was = toNumber(prev[0].pr);
    const now = toNumber(cur[0].pr);
    result.newRound = was !== null && now !== null && now > was;
  }
  return result;
}

/**
 * Returns true when a round trigger goes off in a round.
 *
 * @param {Trigger} trigger Trigger.
 * @param {number} round Round that began.
 * @returns {boolean} True when it goes off.
 */
export function roundMatches(trigger, round) {
  if (trigger.round !== null) {
    return round === trigger.round;
  }
  return round % trigger.every === 0;
}

// ---------------------------------------------------------------------------
// Live game.

/** @type {Map<string, Set<string>>} Tokens inside each area trigger's area. */
const inside = new Map();
let lastTurnOrder = null;

/**
 * Does what a trigger says to its effect.
 *
 * @param {object} effect Effect.
 * @param {Trigger} trigger Trigger.
 * @returns {void}
 */
function act(effect, trigger) {
  if (trigger.once) {
    if (trigger.used) {
      return;
    }
    trigger.used = true;
  }
  switch (trigger.action) {
    case 'start':
      effect.enabled = true;
      effect.paused = false;
      refreshEffect(effect.id);
      return;
    case 'stop':
      effect.enabled = false;
      refreshEffect(effect.id);
      return;
    case 'toggle':
      effect.enabled = !effect.enabled;
      refreshEffect(effect.id);
      return;
    case 'fire':
      fireOnce(effect.id, 1);
      return;
    case 'burst':
      fireOnce(effect.id, trigger.count);
      return;
    default:
  }
}

/**
 * Calls a function for every trigger with one of the given events.
 *
 * @param {string[]} events Events.
 * @param {(effect: object, trigger: Trigger, index: number) => void} fn Callback.
 * @returns {void}
 */
function eachTrigger(events, fn) {
  for (const effect of Object.values(getEffects())) {
    effect.triggers.forEach((trigger, index) => {
      if (events.includes(trigger.event)) {
        fn(effect, trigger, index);
      }
    });
  }
}

/**
 * Follows a turn order change, from Roll20's event or the regular check.
 *
 * @param {*} raw Campaign turnorder value.
 * @returns {void}
 */
export function handleTurnOrder(raw) {
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw ?? []);
  if (text === lastTurnOrder) {
    return;
  }
  const prev = readTurnOrder(lastTurnOrder ?? text);
  const first = lastTurnOrder === null;
  lastTurnOrder = text;
  if (first) {
    return;
  }
  const cur = readTurnOrder(text);
  const change = readTurnChange(prev, cur);
  const s = getState();
  if (change.cleared) {
    s.round = 1;
    return;
  }
  if (prev.length === 0) {
    s.round = 1;
  }
  if (change.newRound) {
    s.round = change.roundValue ?? (s.round || 1) + 1;
    eachTrigger(['round'], (effect, trigger) => {
      if (roundMatches(trigger, s.round)) {
        act(effect, trigger);
      }
    });
  } else if (change.roundValue !== null) {
    s.round = change.roundValue;
  }
  if (change.turn) {
    eachTrigger(['turn'], (effect, trigger) => {
      if (trigger.token && trigger.token === change.turn) {
        act(effect, trigger);
      }
    });
  }
}

/**
 * Starts following the turn order from its current value, without acting on it.
 *
 * @returns {void}
 */
export function resetTurnOrder() {
  lastTurnOrder = null;
  handleTurnOrder(Campaign().get('turnorder') || '');
}

/**
 * Returns true when a token is controlled by a player who is not a GM, or by
 * everyone, directly or through the character it represents.
 *
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True for player tokens.
 */
function isPlayerToken(token) {
  const controllers = [toText(token.get('controlledby'))];
  const character = token.get('represents') && getObj('character', token.get('represents'));
  if (character) {
    controllers.push(toText(character.get('controlledby')));
  }
  return controllers
    .join(',')
    .split(',')
    .map((id) => id.trim())
    .some((id) => id === 'all' || (id !== '' && !playerIsGM(id)));
}

/**
 * Returns true when a token counts for an area trigger.
 *
 * @param {object} token Roll20 graphic.
 * @param {Trigger} trigger Trigger.
 * @returns {boolean} True when it counts.
 */
function counts(token, trigger) {
  if (token.get('layer') !== 'objects' || getEffects()[token.id] || getNullAreas()[token.id]) {
    return false;
  }
  if (trigger.token === token.id) {
    return false;
  }
  if (trigger.who === 'all') {
    return true;
  }
  if (trigger.who === 'named') {
    const name = toText(token.get('name')).toLowerCase();
    return trigger.names.some((n) => n.toLowerCase() === name);
  }
  return isPlayerToken(token);
}

/**
 * Returns an area trigger's area, or null when its token is gone.
 *
 * @param {object} effect Effect.
 * @param {Trigger} trigger Trigger.
 * @returns {{area: object, pageId: string}|null} Area and page.
 */
function triggerArea(effect, trigger) {
  const token = getObj('graphic', trigger.token || effect.id);
  const page = token && getObj('page', token.get('_pageid'));
  if (!page) {
    return null;
  }
  return { area: tokenArea(tokenValues(token), pageMetrics(pageValues(page))), pageId: page.id };
}

/**
 * Returns true when a token's centre is in an area on its page.
 *
 * @param {object} token Roll20 graphic.
 * @param {{area: object, pageId: string}} where Area and page.
 * @returns {boolean} True when inside.
 */
function isInside(token, where) {
  return (
    token.get('_pageid') === where.pageId &&
    isInArea(
      { x: toNumber(token.get('left')) || 0, y: toNumber(token.get('top')) || 0 },
      where.area
    )
  );
}

/**
 * Returns the set of tokens inside an area trigger's area, filling it from the
 * map the first time (without acting) so tokens already there do not count as
 * entering.
 *
 * @param {object} effect Effect.
 * @param {Trigger} trigger Trigger.
 * @param {number} index Trigger number.
 * @returns {Set<string>} Token IDs inside.
 */
function insideSet(effect, trigger, index, exclude = null) {
  const key = `${effect.id}#${index}`;
  if (!inside.has(key)) {
    const set = new Set();
    const where = triggerArea(effect, trigger);
    if (where) {
      for (const token of findObjs({ _type: 'graphic', _pageid: where.pageId })) {
        if (token.id !== exclude && counts(token, trigger) && isInside(token, where)) {
          set.add(token.id);
        }
      }
    }
    inside.set(key, set);
  }
  return inside.get(key);
}

/**
 * Checks whether a token has entered or left any trigger area, and acts.
 * Called when Roll20 reports a move, and by other Mods after moving tokens.
 *
 * @param {object} token Roll20 graphic.
 * @returns {number} Triggers that went off.
 */
export function checkToken(token) {
  let fired = 0;
  eachTrigger(['enter', 'leave'], (effect, trigger, index) => {
    if (!counts(token, trigger)) {
      return;
    }
    // Normally filled already; if not, the token being checked counts as
    // having been outside, so a move into the area is seen as entering.
    const set = insideSet(effect, trigger, index, token.id);
    const where = triggerArea(effect, trigger);
    const now = !!where && isInside(token, where);
    const was = set.has(token.id);
    if (now === was) {
      return;
    }
    if (now) {
      set.add(token.id);
    } else {
      set.delete(token.id);
    }
    if ((now && trigger.event === 'enter') || (!now && trigger.event === 'leave')) {
      act(effect, trigger);
      fired++;
    }
  });
  return fired;
}

/**
 * Follows a token change: a move may set off an area trigger. A token that is
 * itself an area moving makes its trigger look again at what is inside.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} [prev={}] Previous values.
 * @returns {void}
 */
export function handleTokenMoved(token, prev = {}) {
  const moved = ['left', 'top', '_pageid', 'layer'].some(
    (k) => k in prev && prev[k] !== token.get(k)
  );
  if (!moved) {
    return;
  }
  // An area that moves starts again from what is inside it now.
  eachTrigger(['enter', 'leave'], (effect, trigger, index) => {
    if ((trigger.token || effect.id) === token.id) {
      inside.delete(`${effect.id}#${index}`);
      insideSet(effect, trigger, index);
    }
  });
  checkToken(token);
}

/**
 * Forgets what is inside the areas, for example after triggers changed.
 *
 * @param {string} [effectId] Only this effect's triggers (default: all).
 * @returns {void}
 */
export function forgetInside(effectId) {
  for (const key of [...inside.keys()]) {
    if (!effectId || key.split('#')[0] === effectId) {
      inside.delete(key);
    }
  }
}

/**
 * Notes what is inside each area now, without acting, so only later moves
 * count as entering or leaving. Called at startup and when triggers change.
 *
 * @param {string} [effectId] Only this effect's triggers (default: all).
 * @returns {void}
 */
export function primeInside(effectId) {
  forgetInside(effectId);
  eachTrigger(['enter', 'leave'], (effect, trigger, index) => {
    if (!effectId || effect.id === effectId) {
      insideSet(effect, trigger, index);
    }
  });
}

/**
 * Forgets a deleted token wherever it was inside an area.
 *
 * @param {string} tokenId Token ID.
 * @returns {void}
 */
export function forgetToken(tokenId) {
  for (const set of inside.values()) {
    set.delete(tokenId);
  }
  forgetInside(tokenId);
}
