// The movement engine: patrols, followers, locks, combat and recording.
//
// One scheduler wakes every SCHEDULER_TICK_MS and moves each patrol whose due
// time has passed, so every route can run at its own interval. The API does
// not raise change events for moves the API makes, so followers, other Mods
// and Hexploration are told about every move here.

import { whisper } from './chat.js';
import {
  ANCHOR_PAGE,
  LAYER_GM,
  LAYER_TOKEN,
  POSITION_EPSILON,
  SCHEDULER_TICK_MS,
  SCRIPT_NAME,
  TRAIL_LENGTH,
} from './constants.js';
import { getPageContext } from './context.js';
import { bearing, directionZigzags, lateralCoordinate, snapToCell, stepFrom } from './grid.js';
import { t } from './i18n.js';
import { compileTrack, framesOffPage, nextFrame, rotationFor } from './routes.js';
import {
  getConfig,
  getFollows,
  getLocks,
  getPatrols,
  getRecordingForToken,
  getState,
} from './state.js';
import { escapeHtml, isRecord, parseLastMove, setMarker, toText } from './utils.js';

// In-memory caches, rebuilt on demand: compiled tracks per token and the
// recent positions of every leader (for trail following).
const trackCache = new Map();
const trails = new Map();
const observers = [];
let schedulerId = null;

/**
 * Translates a key in the active locale.
 *
 * @param {string} key Translation key.
 * @param {object} [vars] Interpolation variables.
 * @returns {string} Text.
 */
function tr(key, vars) {
  return t(key, getConfig().language, vars);
}

/**
 * Whispers a short notice to every GM.
 *
 * @param {string} key Key under `messages.`.
 * @param {object} [vars] Interpolation variables.
 * @returns {void}
 */
function notifyGm(key, vars) {
  whisper(null, SCRIPT_NAME, `<div>${escapeHtml(tr(`messages.${key}`, vars))}</div>`);
}

/**
 * Returns the current time in milliseconds.
 *
 * @returns {number} Milliseconds.
 */
function now() {
  return Date.now();
}

/**
 * Returns a token's position.
 *
 * @param {object} token Roll20 graphic.
 * @returns {number[]} [x, y].
 */
function positionOf(token) {
  return [Number(token.get('left')) || 0, Number(token.get('top')) || 0];
}

/**
 * Returns true when two points are the same place.
 *
 * @param {number[]} a [x, y].
 * @param {number[]} b [x, y].
 * @returns {boolean} True when equal.
 */
function samePlace(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) < POSITION_EPSILON;
}

// ---------------------------------------------------------------------------
// Observers
// ---------------------------------------------------------------------------

/**
 * Registers a function called whenever TokenController moves a token.
 *
 * @param {(token: object, prev: object) => void} fn Observer.
 * @returns {void}
 */
export function observeTokenChange(fn) {
  if (typeof fn === 'function') {
    observers.push(fn);
  }
}

/**
 * Tells followers, observers and Hexploration that a token moved.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes ({ left, top, rotation, layer }).
 * @param {Set<string>} [visited] Tokens already moved in this chain.
 * @returns {void}
 */
function announceMove(token, prev, visited = new Set()) {
  rememberTrail(token.id, [[prev.left, prev.top]]);
  for (const fn of observers) {
    try {
      fn(token, prev);
    } catch (err) {
      log(`${SCRIPT_NAME}: observer failed: ${err?.message || err}`);
    }
  }
  if (typeof Hexploration !== 'undefined' && typeof Hexploration?.revealAround === 'function') {
    try {
      Hexploration.revealAround(token, { left: prev.left, top: prev.top });
    } catch (err) {
      log(`${SCRIPT_NAME}: Hexploration reveal failed: ${err?.message || err}`);
    }
  }
  moveFollowers(token, visited);
}

// ---------------------------------------------------------------------------
// Moving tokens
// ---------------------------------------------------------------------------

/**
 * Moves a token, turning it to face its direction of travel when enabled,
 * and announces the move.
 *
 * @param {object} token Roll20 graphic.
 * @param {number[]} to [x, y].
 * @param {Set<string>} [visited] Tokens already moved in this chain.
 * @returns {boolean} True when the token moved.
 */
export function moveTokenTo(token, to, visited) {
  const from = positionOf(token);
  if (samePlace(from, to)) {
    return false;
  }
  const prev = { left: from[0], top: from[1], rotation: token.get('rotation') };
  const update = { left: to[0], top: to[1] };
  const facing = getConfig().facing;
  if (facing !== 'off') {
    update.rotation = rotationFor(bearing(to[0] - from[0], to[1] - from[1]), facing);
  }
  token.set(update);
  announceMove(token, prev, visited);
  return true;
}

/**
 * Moves a token between the token layer and the GM layer.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function toggleStealth(token) {
  token.set('layer', token.get('layer') === LAYER_GM ? LAYER_TOKEN : LAYER_GM);
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

/**
 * Returns a patrol's compiled track, compiling it when the route, anchor or
 * page grid has changed.
 *
 * @param {object} patrol Patrol record.
 * @param {object} route Route record.
 * @param {object} ctx Page context.
 * @returns {object[]} Frames.
 */
function trackFor(patrol, route, ctx) {
  const key = JSON.stringify([route, patrol.anchor, ctx.grid]);
  const cached = trackCache.get(key);
  if (cached) {
    return cached;
  }
  const frames = compileTrack(route, ctx.grid, patrol.anchor || [0, 0]);
  if (trackCache.size > 500) {
    trackCache.clear();
  }
  trackCache.set(key, frames);
  return frames;
}

/**
 * Compiles a route for a token without starting it, for previews and checks.
 *
 * @param {object} route Route record.
 * @param {object} token Roll20 graphic.
 * @returns {{frames: object[], offPage: number}|null} Track and how many frames
 *          fall off the page, or null when the token's page is missing.
 */
export function previewTrack(route, token) {
  const ctx = getPageContext(token.get('_pageid'));
  if (!ctx) {
    return null;
  }
  const frames = compileTrack(route, ctx.grid, positionOf(token));
  return { frames, offPage: framesOffPage(frames, ctx.widthPx, ctx.heightPx) };
}

// ---------------------------------------------------------------------------
// Patrols
// ---------------------------------------------------------------------------

/**
 * Returns the interval in force for a route.
 *
 * @param {object} route Route record.
 * @returns {number} Milliseconds.
 */
function intervalFor(route) {
  return route.interval || getConfig().interval;
}

/**
 * Puts a token on a route.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} route Route record.
 * @returns {{ok: true, offPage: number}|{ok: false, reason: string}} Outcome;
 *          reasons match `errors.` keys.
 */
export function startPatrol(token, route) {
  const tokenId = token.id;
  const pageId = token.get('_pageid');
  const s = getState();
  if (s.locks[tokenId]) {
    return { ok: false, reason: 'tokenLocked' };
  }
  if (route.anchor === ANCHOR_PAGE && route.pageId !== pageId) {
    return { ok: false, reason: 'routeOnOtherPage' };
  }
  if (route.start && route.start.pageId !== pageId) {
    return { ok: false, reason: 'startOnOtherPage' };
  }
  const already = Object.entries(s.patrols).filter(
    ([id, p]) => p.routeId === route.id && id !== tokenId
  ).length;
  if (route.maxTokens && already >= route.maxTokens) {
    return { ok: false, reason: 'routeFull' };
  }
  const ctx = getPageContext(pageId);
  if (!ctx) {
    return { ok: false, reason: 'noPage' };
  }

  const origin = s.patrols[tokenId]?.origin || {
    left: Number(token.get('left')) || 0,
    top: Number(token.get('top')) || 0,
    rotation: Number(token.get('rotation')) || 0,
    layer: token.get('layer'),
  };

  if (route.start) {
    token.set({ left: route.start.left, top: route.start.top });
    if (route.start.rotation !== null) {
      token.set('rotation', route.start.rotation);
    }
  }

  const patrol = {
    routeId: route.id,
    pageId,
    index: 0,
    dir: 1,
    anchor: positionOf(token),
    origin,
    dueAt: now() + intervalFor(route),
  };
  const frames = trackFor(patrol, route, ctx);
  if (frames.length < 2) {
    return { ok: false, reason: 'emptyTrack' };
  }
  if (route.randomStart) {
    patrol.index = Math.floor(Math.random() * frames.length);
  }

  // A token stops following when it starts a patrol: one controller at a time.
  delete s.follows[tokenId];
  s.patrols[tokenId] = patrol;
  const first = frames[patrol.index];
  moveTokenTo(token, [first.x, first.y]);
  return { ok: true, offPage: framesOffPage(frames, ctx.widthPx, ctx.heightPx) };
}

/**
 * Takes a token off its route, leaving it where it is.
 *
 * @param {string} tokenId Token ID.
 * @returns {boolean} True when it was on a route.
 */
export function stopPatrol(tokenId) {
  const patrols = getPatrols();
  if (!patrols[tokenId]) {
    return false;
  }
  delete patrols[tokenId];
  return true;
}

/**
 * Takes a token off its route and puts it back where it was when it started.
 *
 * @param {string} tokenId Token ID.
 * @returns {boolean} True when it was on a route.
 */
export function resetPatrol(tokenId) {
  const patrol = getPatrols()[tokenId];
  if (!patrol) {
    return false;
  }
  delete getPatrols()[tokenId];
  const token = getObj('graphic', tokenId);
  if (token && patrol.origin) {
    const update = {
      left: patrol.origin.left,
      top: patrol.origin.top,
      rotation: patrol.origin.rotation,
    };
    if (patrol.origin.layer) {
      update.layer = patrol.origin.layer;
    }
    const prev = { left: token.get('left'), top: token.get('top') };
    token.set(update);
    announceMove(token, prev);
  }
  return true;
}

/**
 * Moves one patrol to its next frame.
 *
 * @param {string} tokenId Token ID.
 * @param {object} patrol Patrol record.
 * @returns {void}
 */
function advancePatrol(tokenId, patrol) {
  const s = getState();
  const token = getObj('graphic', tokenId);
  const route = s.routes[patrol.routeId];
  if (!token || !route) {
    delete s.patrols[tokenId];
    return;
  }
  if (s.locks[tokenId]) {
    return;
  }
  const ctx = getPageContext(token.get('_pageid'));
  if (!ctx) {
    return;
  }
  if (!patrol.anchor) {
    patrol.anchor = positionOf(token);
  }
  const frames = trackFor(patrol, route, ctx);
  if (frames.length < 2) {
    delete s.patrols[tokenId];
    log(`${SCRIPT_NAME}: route "${route.name}" has no moves; stopped ${tokenId}.`);
    return;
  }

  const step = nextFrame(
    frames,
    Math.min(patrol.index, frames.length - 1),
    patrol.dir,
    route.mode,
    getConfig().movement === 'segment'
  );
  patrol.index = step.index;
  patrol.dir = step.dir;
  const target = frames[step.index];

  if (target.stealth) {
    toggleStealth(token);
  } else if (target.face !== undefined) {
    const facing = getConfig().facing;
    if (facing !== 'off') {
      token.set('rotation', rotationFor(target.face, facing));
    }
  } else if (!target.wait) {
    // Frames off the page are skipped; the patrol keeps its place on the track
    // and rejoins it when the route comes back on to the page.
    const onPage =
      target.x >= 0 && target.y >= 0 && target.x <= ctx.widthPx && target.y <= ctx.heightPx;
    if (onPage) {
      moveTokenTo(token, [target.x, target.y]);
    }
  }

  if (step.finished) {
    delete s.patrols[tokenId];
  }
}

/**
 * Moves every patrol that is due, or every patrol when forced.
 *
 * @param {boolean} [force=false] Move all patrols now, ignoring their intervals.
 * @returns {void}
 */
export function runPatrols(force = false) {
  const s = getState();
  const time = now();
  for (const [tokenId, patrol] of Object.entries(s.patrols)) {
    if (!force && patrol.dueAt > time) {
      continue;
    }
    try {
      advancePatrol(tokenId, patrol);
    } catch (err) {
      log(`${SCRIPT_NAME}: patrol ${tokenId} failed: ${err?.message || err}`);
      delete s.patrols[tokenId];
    }
    const route = s.routes[patrol.routeId];
    if (route) {
      patrol.dueAt = time + intervalFor(route);
    }
  }
}

/**
 * Scheduler tick: checks combat, then moves due patrols.
 *
 * @returns {void}
 */
export function tick() {
  const s = getState();
  const inCombat = updateCombatState();
  if (s.paused) {
    return;
  }
  if (inCombat && getConfig().combatBehaviour !== 'ignore') {
    // Patrols wait (pause) or move with the turn order (step).
    return;
  }
  runPatrols(false);
}

/**
 * Starts the scheduler.
 *
 * @returns {void}
 */
export function startScheduler() {
  if (schedulerId !== null) {
    clearInterval(schedulerId);
  }
  schedulerId = setInterval(() => {
    try {
      tick();
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR in scheduler: ${err?.message || err}`);
    }
  }, SCHEDULER_TICK_MS);
}

/**
 * Re-anchors patrols that were migrated from v4 (which kept no anchor) at
 * their tokens' current positions, and drops patrols whose tokens are gone.
 *
 * @returns {number} Number of patrols dropped.
 */
export function preparePatrols() {
  const patrols = getPatrols();
  let dropped = 0;
  for (const [tokenId, patrol] of Object.entries(patrols)) {
    const token = getObj('graphic', tokenId);
    if (!token) {
      delete patrols[tokenId];
      dropped++;
      continue;
    }
    patrol.pageId = token.get('_pageid');
    if (!patrol.anchor) {
      patrol.anchor = positionOf(token);
      patrol.index = 0;
      patrol.dir = 1;
    }
    patrol.dueAt = 0;
  }
  return dropped;
}

/**
 * Forgets cached tracks, for example after a page's grid changes.
 *
 * @returns {void}
 */
export function clearTrackCache() {
  trackCache.clear();
}

// ---------------------------------------------------------------------------
// Combat
// ---------------------------------------------------------------------------

/**
 * Parses the campaign turn order.
 *
 * @param {*} raw turnorder value.
 * @returns {object[]} Entries.
 */
function parseTurnOrder(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }
  try {
    const parsed = JSON.parse(toText(raw) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns true when the turn tracker is open with someone in it.
 *
 * @returns {boolean} True when the tracker shows a fight.
 */
function trackerActive() {
  const campaign = Campaign();
  return (
    campaign.get('initiativepage') !== false &&
    Boolean(campaign.get('initiativepage')) &&
    parseTurnOrder(campaign.get('turnorder')).length > 0
  );
}

/**
 * Returns true when combat is on, by the turn tracker, the GM's switch, or
 * both, depending on the Combat Detection setting.
 *
 * @returns {boolean} True in combat.
 */
export function isCombatActive() {
  const detection = getConfig().combatDetection;
  const manual = getState().combat.manual === true;
  if (detection === 'manual') {
    return manual;
  }
  if (detection === 'tracker') {
    return trackerActive();
  }
  return manual || trackerActive();
}

/**
 * Recomputes the combat state and tells the GM when patrols pause or resume.
 *
 * @returns {boolean} True in combat.
 */
export function updateCombatState() {
  const combat = getState().combat;
  const active = isCombatActive();
  if (active !== combat.active) {
    combat.active = active;
    const behaviour = getConfig().combatBehaviour;
    if (Object.keys(getPatrols()).length > 0 && behaviour !== 'ignore') {
      notifyGm(active ? `combatStarted.${behaviour}` : 'combatEnded');
    }
  }
  return active;
}

/**
 * Handles a turn order change: with Combat Behaviour set to step, every
 * patrol moves once each time the turn passes.
 *
 * @param {object} campaign Roll20 campaign.
 * @returns {void}
 */
export function handleTurnOrderChange(campaign) {
  const combat = getState().combat;
  const active = updateCombatState();
  const [current] = parseTurnOrder(campaign.get('turnorder'));
  const turnId = current ? `${toText(current.id)}|${toText(current.custom)}` : null;
  const advanced = turnId !== null && turnId !== combat.turnId;
  combat.turnId = turnId;
  if (active && advanced && !getState().paused && getConfig().combatBehaviour === 'step') {
    runPatrols(true);
  }
}

// ---------------------------------------------------------------------------
// Locks
// ---------------------------------------------------------------------------

/**
 * Locks a token in place, using the Lock Mode setting.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function lockToken(token) {
  const config = getConfig();
  const marker = config.lockMarker;
  const mode = config.lockMode;
  const native = mode === 'native';
  getLocks()[token.id] = {
    pageId: token.get('_pageid'),
    left: Number(token.get('left')) || 0,
    top: Number(token.get('top')) || 0,
    rotation: Number(token.get('rotation')) || 0,
    marker,
    mode,
    native,
  };
  if (native) {
    token.set('lockMovement', true);
  }
  if (marker !== 'none') {
    setMarker(token, marker, true);
  }
}

/**
 * Unlocks a token.
 *
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True when it was locked.
 */
export function unlockToken(token) {
  const lock = getLocks()[token.id];
  if (!lock) {
    return false;
  }
  delete getLocks()[token.id];
  if (lock.native) {
    token.set('lockMovement', false);
  }
  if (lock.marker && lock.marker !== 'none') {
    setMarker(token, lock.marker, false);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Following
// ---------------------------------------------------------------------------

/**
 * Adds positions to a leader's trail, newest first.
 *
 * @param {string} leaderId Leader token ID.
 * @param {number[][]} positions Positions, newest first.
 * @returns {void}
 */
function rememberTrail(leaderId, positions) {
  const trail = trails.get(leaderId) || [];
  for (const pos of [...positions].reverse()) {
    if (!trail.length || !samePlace(trail[0], pos)) {
      trail.unshift(pos);
    }
  }
  trails.set(leaderId, trail.slice(0, TRAIL_LENGTH));
}

/**
 * Makes tokens follow a leader.
 *
 * @param {object[]} followers Roll20 graphics.
 * @param {object} leader Roll20 graphic.
 * @returns {{started: object[], skipped: object[]}} Tokens that now follow, and
 *          those that could not (the leader itself, or a token the leader follows).
 */
export function followLeader(followers, leader) {
  const follows = getFollows();
  const started = [];
  const skipped = [];
  for (const follower of followers) {
    if (follower.id === leader.id || leadsTo(leader.id, follower.id)) {
      skipped.push(follower);
      continue;
    }
    const [fx, fy] = positionOf(follower);
    const [lx, ly] = positionOf(leader);
    follows[follower.id] = { leaderId: leader.id, offset: [fx - lx, fy - ly] };
    delete getPatrols()[follower.id];
    started.push(follower);
  }
  return { started, skipped };
}

/**
 * Returns true when following the chain of leaders from `fromId` reaches `toId`.
 *
 * @param {string} fromId Token ID to start from.
 * @param {string} toId Token ID to look for.
 * @returns {boolean} True when `fromId` (directly or indirectly) follows `toId`.
 */
function leadsTo(fromId, toId) {
  const follows = getFollows();
  const seen = new Set();
  let current = follows[fromId]?.leaderId;
  while (current && !seen.has(current)) {
    if (current === toId) {
      return true;
    }
    seen.add(current);
    current = follows[current]?.leaderId;
  }
  return false;
}

/**
 * Stops a token following.
 *
 * @param {string} tokenId Token ID.
 * @returns {boolean} True when it was following.
 */
export function unfollow(tokenId) {
  const follows = getFollows();
  if (!follows[tokenId]) {
    return false;
  }
  delete follows[tokenId];
  return true;
}

/**
 * Moves the followers of a token that has just moved. In trail mode the
 * first follower steps into the leader's last position, the second into the
 * one before, and so on. In formation mode each keeps its distance and
 * direction from the leader. Followers of followers move in turn.
 *
 * @param {object} leader Roll20 graphic that moved.
 * @param {Set<string>} visited Tokens already moved in this chain.
 * @returns {void}
 */
function moveFollowers(leader, visited) {
  visited.add(leader.id);
  const s = getState();
  const followers = Object.entries(s.follows).filter(([, f]) => f.leaderId === leader.id);
  if (followers.length === 0) {
    return;
  }
  const trailMode = getConfig().followMode === 'trail';
  const trail = trails.get(leader.id) || [];
  const [lx, ly] = positionOf(leader);
  followers.forEach(([followerId, follow], i) => {
    if (visited.has(followerId) || s.locks[followerId] || s.patrols[followerId]) {
      return;
    }
    const follower = getObj('graphic', followerId);
    if (!follower) {
      delete s.follows[followerId];
      return;
    }
    if (follower.get('_pageid') !== leader.get('_pageid')) {
      return;
    }
    let target;
    if (trailMode) {
      // Followers further back wait until the leader has gone far enough.
      target = trail[i];
    } else if (follow.offset) {
      // Snap so a follower that started between cells still lands in one.
      const grid = getPageContext(leader.get('_pageid'))?.grid;
      const x = lx + follow.offset[0];
      const y = ly + follow.offset[1];
      target = grid ? snapToCell(grid, x, y) : [x, y];
    }
    if (target) {
      moveTokenTo(follower, target, visited);
    }
  });
}

// ---------------------------------------------------------------------------
// Moves made by people
// ---------------------------------------------------------------------------

/**
 * Handles a token changed by a person (the API reports no changes it makes
 * itself): keeps locks, records moves, re-anchors patrols and moves followers.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
export function handleTokenChange(token, prev) {
  if (!isRecord(prev)) {
    return;
  }
  const from = [Number(prev.left) || 0, Number(prev.top) || 0];
  const to = positionOf(token);
  if (samePlace(from, to)) {
    return;
  }
  const s = getState();
  const tokenId = token.id;

  const lock = s.locks[tokenId];
  // Each lock keeps the mode it was made with, whatever the setting is now.
  if (lock?.mode === 'revert') {
    token.set({ left: lock.left, top: lock.top, rotation: lock.rotation });
    return;
  }

  // lastmove holds the start and waypoints of the drag. Trust it only when it
  // starts where the token was.
  const waypoints = parseLastMove(token.get('lastmove'));
  const route = waypoints.length > 0 && samePlace(waypoints[0], from) ? waypoints : [from];

  const recording = getRecordingForToken(tokenId);
  if (recording) {
    for (const [x, y] of [...route.slice(1), to]) {
      recording.entries.push({ x, y });
    }
  }

  const patrol = s.patrols[tokenId];
  if (patrol) {
    if (getConfig().manualMove === 'stop') {
      delete s.patrols[tokenId];
    } else if (patrol.anchor && s.routes[patrol.routeId]?.anchor !== ANCHOR_PAGE) {
      // Carry on along the same route from the new spot.
      patrol.anchor = [patrol.anchor[0] + to[0] - from[0], patrol.anchor[1] + to[1] - from[1]];
    }
  }

  const follow = s.follows[tokenId];
  if (follow && getConfig().followMode === 'formation') {
    // Dragging a follower adjusts its place in the formation.
    const leader = getObj('graphic', follow.leaderId);
    if (leader) {
      const [lx, ly] = positionOf(leader);
      follow.offset = [to[0] - lx, to[1] - ly];
    }
  }

  rememberTrail(tokenId, [...route].reverse());
  moveFollowers(token, new Set());
}

/**
 * Handles a token moved by another Mod that reports its changes (TokenMod).
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
export function handleObservedChange(token, prev) {
  if (!isRecord(prev)) {
    return;
  }
  const from = [Number(prev.left) || 0, Number(prev.top) || 0];
  if (!samePlace(from, positionOf(token))) {
    rememberTrail(token.id, [from]);
    moveFollowers(token, new Set());
  }
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

/**
 * Moves a recorded token one or more cells and records each cell.
 *
 * @param {object} recording Recording record.
 * @param {object} token Roll20 graphic.
 * @param {string} dir Direction key.
 * @param {number} distance Cells.
 * @returns {boolean} True when the page exists.
 */
export function recordStep(recording, token, dir, distance) {
  const ctx = getPageContext(token.get('_pageid'));
  if (!ctx) {
    return false;
  }
  let pos = positionOf(token);
  const ref = directionZigzags(ctx.grid, dir) ? lateralCoordinate(ctx.grid, pos) : null;
  for (let i = 0; i < distance; i++) {
    const next = stepFrom(ctx.grid, pos, dir, ref);
    recording.entries.push({ x: next[0], y: next[1] });
    pos = next;
  }
  moveTokenTo(token, pos);
  return true;
}

/**
 * Removes the last recorded entry, moving the token back when it was a move.
 *
 * @param {object} recording Recording record.
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True when something was undone.
 */
export function recordUndo(recording, token) {
  if (recording.entries.length <= 1) {
    return false;
  }
  const removed = recording.entries.pop();
  if (removed.stealth) {
    toggleStealth(token);
  }
  const lastPlace = [...recording.entries].reverse().find((e) => 'x' in e);
  if ('x' in removed && lastPlace) {
    moveTokenTo(token, [lastPlace.x, lastPlace.y]);
  }
  return true;
}
