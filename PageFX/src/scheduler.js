// Runs effects: one timer chain per layer of each running effect.

import { MIN_DELAY_MS, RATE_WINDOW_MS } from './constants.js';
import { resolveFx, spawn } from './fx.js';
import {
  beamEnd,
  clampToPage,
  isInArea,
  nextDelay,
  pageMetrics,
  randomPointIn,
  tokenArea,
} from './geometry.js';
import { getLivePages } from './pages.js';
import { getEffect, getEffects, getNullAreas, getSettings, getState } from './state.js';
import { now } from './utils.js';

/** @type {Map<string, {pageId: string, timers: Array<*>, resolved: Array<*>}>} */
const running = new Map();
/** @type {Map<string, Array<{error: string, vars?: object}|null>>} */
const problems = new Map();
/** @type {Map<string, number[]>} */
const recentSpawns = new Map();

let onThrottle = () => {};
let onProblem = () => {};

/**
 * Sets callbacks for things the GM should hear about.
 *
 * @param {object} hooks Callbacks.
 * @param {(pageId: string) => void} [hooks.throttle] A page hit the spawn rate cap.
 * @param {(effectId: string, problem: object) => void} [hooks.problem] An effect layer cannot run.
 * @returns {void}
 */
export function setSchedulerHooks({ throttle, problem } = {}) {
  onThrottle = throttle || (() => {});
  onProblem = problem || (() => {});
}

/**
 * Reads the values the area maths needs from a token.
 *
 * @param {object} token Roll20 graphic.
 * @returns {object} Token values.
 */
export function tokenValues(token) {
  return {
    left: token.get('left'),
    top: token.get('top'),
    width: token.get('width'),
    height: token.get('height'),
    aura1_radius: token.get('aura1_radius'),
    aura1_square: token.get('aura1_square'),
  };
}

/**
 * Reads the values the area maths needs from a page.
 *
 * @param {object} page Roll20 page.
 * @returns {object} Page values.
 */
export function pageValues(page) {
  return {
    width: page.get('width'),
    height: page.get('height'),
    snapping_increment: page.get('snapping_increment'),
    scale_number: page.get('scale_number'),
  };
}

/**
 * Returns the no-effect areas on a page.
 *
 * @param {string} pageId Page ID.
 * @param {import('./geometry.js').PageMetrics} metrics Page metrics.
 * @returns {import('./geometry.js').Area[]} Areas.
 */
function nullAreasOn(pageId, metrics) {
  const areas = [];
  for (const id of Object.keys(getNullAreas())) {
    const token = getObj('graphic', id);
    if (token && token.get('_pageid') === pageId) {
      areas.push(tokenArea(tokenValues(token), metrics));
    }
  }
  return areas;
}

/**
 * Takes one spawn from a page's budget.
 *
 * @param {string} pageId Page ID.
 * @returns {boolean} True when the page may spawn now.
 */
function takeSpawnBudget(pageId) {
  const t = now();
  const list = (recentSpawns.get(pageId) || []).filter((s) => t - s < RATE_WINDOW_MS);
  if (list.length >= getSettings().maxSpawnsPerSecond) {
    recentSpawns.set(pageId, list);
    onThrottle(pageId);
    return false;
  }
  list.push(t);
  recentSpawns.set(pageId, list);
  return true;
}

/**
 * Returns the page an effect's token is on, or null when the token is gone.
 *
 * @param {string} effectId Effect ID.
 * @returns {string|null} Page ID.
 */
export function effectPageId(effectId) {
  const token = getObj('graphic', effectId);
  return token ? token.get('_pageid') : null;
}

/**
 * Works out whether an effect should be running now.
 *
 * @param {import('./state.js').Effect} effect Effect.
 * @param {Set<string>} live Live page IDs.
 * @returns {boolean} True when it should run.
 */
function shouldRun(effect, live) {
  const pageId = effectPageId(effect.id);
  return (
    !!pageId &&
    live.has(pageId) &&
    effect.enabled &&
    !effect.paused &&
    !getState().paused &&
    effect.layers.length > 0
  );
}

/**
 * Spawns one effect for a layer, then queues the next.
 *
 * @param {string} effectId Effect ID.
 * @param {number} index Layer number.
 * @returns {void}
 */
function tick(effectId, index) {
  const run = running.get(effectId);
  const effect = getEffect(effectId);
  const token = getObj('graphic', effectId);
  if (!run || !effect || !token || !effect.layers[index]) {
    stopEffect(effectId);
    return;
  }
  const layer = effect.layers[index];
  const page = getObj('page', token.get('_pageid'));
  if (page) {
    const metrics = pageMetrics(pageValues(page));
    const pt = clampToPage(randomPointIn(tokenArea(tokenValues(token), metrics)), metrics);
    const blocked = nullAreasOn(page.id, metrics).some((area) => isInArea(pt, area));
    if (!blocked && takeSpawnBudget(page.id)) {
      const fx = run.resolved[index];
      const end = fx.beam ? clampToPage(beamEnd(pt, layer.direction, metrics), metrics) : null;
      spawn(fx, pt, end, page.id);
    }
  }
  queue(effectId, index);
}

/**
 * Queues a layer's next spawn.
 *
 * @param {string} effectId Effect ID.
 * @param {number} index Layer number.
 * @returns {void}
 */
function queue(effectId, index) {
  const run = running.get(effectId);
  const effect = getEffect(effectId);
  if (!run || !effect) {
    return;
  }
  const delay = nextDelay(
    effect.layers[index].interval,
    effect.intensity * getSettings().intensity,
    MIN_DELAY_MS
  );
  run.timers[index] = setTimeout(() => {
    try {
      tick(effectId, index);
    } catch (err) {
      log(`PageFX ERROR in effect ${effectId}: ${err?.message || err}`);
      recordProblem(effectId, index, {
        error: 'fx.spawnFailed',
        vars: { message: String(err?.message || err) },
      });
      if (run.timers) {
        run.timers[index] = null;
      }
    }
  }, delay);
}

/**
 * Records why a layer cannot run.
 *
 * @param {string} effectId Effect ID.
 * @param {number} index Layer number.
 * @param {{error: string, vars?: object}} problem Problem.
 * @returns {void}
 */
function recordProblem(effectId, index, problem) {
  const list = problems.get(effectId) || [];
  list[index] = problem;
  problems.set(effectId, list);
  onProblem(effectId, problem);
}

/**
 * Starts an effect's timers.
 *
 * @param {string} effectId Effect ID.
 * @returns {boolean} True when at least one layer started.
 */
export function startEffect(effectId) {
  stopEffect(effectId);
  const effect = getEffect(effectId);
  const pageId = effectPageId(effectId);
  if (!effect || !pageId) {
    return false;
  }
  problems.delete(effectId);
  const run = { pageId, timers: [], resolved: [] };
  running.set(effectId, run);
  const owned = getState().ownedFx;
  effect.layers.forEach((layer, index) => {
    if (!layer.fx) {
      if (layer.error) {
        recordProblem(effectId, index, { error: layer.error });
      }
      return;
    }
    const result = resolveFx(layer.fx, {
      owned,
      key: `${effectId}#${index}`,
      label: `${effect.name} ${index + 1}`,
    });
    if (!result.ok) {
      recordProblem(effectId, index, { error: result.error, vars: result.vars });
      return;
    }
    run.resolved[index] = result.fx;
    queue(effectId, index);
  });
  if (run.resolved.filter(Boolean).length === 0) {
    running.delete(effectId);
    return false;
  }
  return true;
}

/**
 * Stops an effect's timers.
 *
 * @param {string} effectId Effect ID.
 * @returns {boolean} True when it was running.
 */
export function stopEffect(effectId) {
  const run = running.get(effectId);
  if (!run) {
    return false;
  }
  for (const timer of run.timers) {
    if (timer) {
      clearTimeout(timer);
    }
  }
  running.delete(effectId);
  return true;
}

/**
 * Stops everything.
 *
 * @returns {void}
 */
export function stopAll() {
  for (const id of [...running.keys()]) {
    stopEffect(id);
  }
}

/**
 * Starts the effects that should run and stops the rest. Called whenever
 * the live pages, an effect or the global pause change.
 *
 * @returns {{started: number, stopped: number}} Counts.
 */
export function syncEffects() {
  const live = getLivePages(getSettings().gmPagePreview);
  lastLiveKey = [...live].sort().join('|');
  let started = 0;
  let stopped = 0;
  for (const id of [...running.keys()]) {
    const effect = getEffect(id);
    if (!effect || !shouldRun(effect, live) || running.get(id).pageId !== effectPageId(id)) {
      stopEffect(id);
      stopped++;
    }
  }
  for (const effect of Object.values(getEffects())) {
    if (!running.has(effect.id) && shouldRun(effect, live) && startEffect(effect.id)) {
      started++;
    }
  }
  return { started, stopped };
}

let lastLiveKey = '';
let watchTimer = null;

/**
 * Checks the live pages every few seconds and resyncs when they changed.
 * Roll20 raises no change event when another Mod moves the ribbon or splits
 * the party through the API, so events alone would miss those moves.
 *
 * @param {number} ms Check interval.
 * @param {() => void} [extra] Another check to run each time.
 * @returns {void}
 */
export function watchLivePages(ms, extra) {
  if (watchTimer) {
    clearTimeout(watchTimer);
  }
  const check = () => {
    const key = [...getLivePages(getSettings().gmPagePreview)].sort().join('|');
    try {
      if (key !== lastLiveKey) {
        syncEffects();
      }
      extra?.();
    } catch (err) {
      log(`PageFX ERROR in the regular check: ${err?.message || err}`);
    }
    watchTimer = setTimeout(check, ms);
  };
  watchTimer = setTimeout(check, ms);
}

/**
 * Restarts one effect after its settings changed (or stops it if it should no longer run).
 *
 * @param {string} effectId Effect ID.
 * @returns {void}
 */
export function refreshEffect(effectId) {
  stopEffect(effectId);
  syncEffects();
}

/**
 * Returns true when an effect is running.
 *
 * @param {string} effectId Effect ID.
 * @returns {boolean} True when running.
 */
export function isRunning(effectId) {
  return running.has(effectId);
}

/**
 * Returns the IDs of running effects.
 *
 * @returns {string[]} Effect IDs.
 */
export function runningIds() {
  return [...running.keys()];
}

/**
 * Returns why an effect's layers cannot run.
 *
 * @param {string} effectId Effect ID.
 * @returns {Array<{error: string, vars?: object}|null>} Problems per layer.
 */
export function getProblems(effectId) {
  return problems.get(effectId) || [];
}

/**
 * Spawns an effect once now, wherever it is (for testing an effect).
 *
 * @param {string} effectId Effect ID.
 * @param {number} [count=1] How many times.
 * @returns {number} Spawns made.
 */
export function fireOnce(effectId, count = 1) {
  const effect = getEffect(effectId);
  const token = getObj('graphic', effectId);
  const page = token && getObj('page', token.get('_pageid'));
  if (!effect || !page) {
    return 0;
  }
  const metrics = pageMetrics(pageValues(page));
  const owned = getState().ownedFx;
  let made = 0;
  effect.layers.forEach((layer, index) => {
    if (!layer.fx) {
      return;
    }
    const result = resolveFx(layer.fx, {
      owned,
      key: `${effectId}#${index}`,
      label: `${effect.name} ${index + 1}`,
    });
    if (!result.ok) {
      return;
    }
    for (let i = 0; i < count; i++) {
      const pt = clampToPage(randomPointIn(tokenArea(tokenValues(token), metrics)), metrics);
      const end = result.fx.beam
        ? clampToPage(beamEnd(pt, layer.direction, metrics), metrics)
        : null;
      spawn(result.fx, pt, end, page.id);
      made++;
    }
  });
  return made;
}
