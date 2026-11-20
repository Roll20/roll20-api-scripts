import { whisper } from './chat.js';
import { handleInput } from './commands.js';
import {
  LIVE_PAGE_CHECK_MS,
  SCRIPT_LAST_UPDATED,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import {
  createEffect,
  forgetEffect,
  handleGraphicAdded,
  handleGraphicChange,
  handleGraphicDestroyed,
  markEdited,
  releaseEffect,
  rescanTokens,
} from './effects.js';
import { isBeamSpec, parseFxSpec } from './fx.js';
import { allPresets, presetName, registerPreset } from './presets.js';
import {
  checkToken,
  forgetToken,
  handleTokenMoved,
  handleTurnOrder,
  primeInside,
  resetTurnOrder,
} from './triggers.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import {
  fireOnce,
  getProblems,
  isRunning,
  refreshEffect,
  setSchedulerHooks,
  stopAll,
  syncEffects,
  watchLivePages,
} from './scheduler.js';
import {
  applyGlobalConfig,
  clampIntensity,
  cleanDirection,
  cleanInterval,
  cleanLayer,
  getEffect,
  getEffects,
  getLang,
  getSettings,
  getState,
  initialiseState,
} from './state.js';
import { escapeHtml } from './utils.js';

let ready = false;
const warned = new Set();

/**
 * Runs a handler, logging instead of crashing the sandbox on errors.
 *
 * @param {string} label Handler name for the log.
 * @param {Function} fn Handler.
 * @returns {Function} Wrapped handler.
 */
function guarded(label, fn) {
  return (...args) => {
    if (!ready) {
      return;
    }
    try {
      fn(...args);
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
    }
  };
}

/**
 * Tells the GM once per session about things they should fix.
 *
 * @returns {void}
 */
function installSchedulerHooks() {
  setSchedulerHooks({
    throttle(pageId) {
      if (warned.has(`rate:${pageId}`)) {
        return;
      }
      warned.add(`rate:${pageId}`);
      const lang = getLang();
      const page = getObj('page', pageId)?.get('name') || pageId;
      whisper(
        null,
        SCRIPT_NAME,
        `<div>${escapeHtml(t('messages.throttled', lang, { page, max: getSettings().maxSpawnsPerSecond }))}</div>`
      );
    },
    problem(effectId, problem) {
      const key = `problem:${effectId}:${problem.error}`;
      if (warned.has(key)) {
        return;
      }
      warned.add(key);
      const lang = getLang();
      const name = getEffect(effectId)?.name || effectId;
      const reason = t(problem.error, lang, problem.vars || {});
      whisper(
        null,
        SCRIPT_NAME,
        `<div>${escapeHtml(t('messages.problem', lang, { name, reason }))}</div>`
      );
    },
  });
}

/**
 * Returns the effect ID for a token or ID.
 *
 * @param {object|string} tokenOrId Roll20 graphic or its ID.
 * @returns {string} Effect ID.
 */
function idOf(tokenOrId) {
  return typeof tokenOrId === 'string' ? tokenOrId : tokenOrId?.id || tokenOrId?.get?.('_id');
}

/**
 * Changes one effect from the API.
 *
 * @param {object|string} tokenOrId Roll20 graphic or its ID.
 * @param {(effect: object) => void} change Change.
 * @returns {boolean} True when the effect exists.
 */
function changeEffect(tokenOrId, change) {
  const effect = ready && getEffect(idOf(tokenOrId));
  if (!effect) {
    return false;
  }
  change(effect);
  refreshEffect(effect.id);
  return true;
}

/**
 * Makes a token an effect from another Mod.
 *
 * @param {object|string} tokenOrId Roll20 graphic or its ID.
 * @param {object} [options] What the effect does.
 * @param {string} [options.name] Name shown in menus.
 * @param {string|string[]} [options.fx] Effect for each layer: "type-colour", a saved
 *   custom FX name, or JSON.
 * @param {[number, number]|number} [options.interval] Time between spawns, in ms.
 * @param {'random'|{dx: number, dy: number}} [options.direction] End of beam-like effects.
 * @param {number} [options.intensity] Rate multiplier.
 * @returns {{ok: boolean, id?: string, error?: string}} Result; error is a message key.
 */
function createFromApi(tokenOrId, options = {}) {
  const token = ready && getObj('graphic', idOf(tokenOrId));
  if (!token) {
    return { ok: false, error: 'errors.selectToken' };
  }
  const specs = [options.fx ?? []].flat();
  const parsed = specs.map((spec) => parseFxSpec(spec));
  const bad = parsed.find((p) => !p.ok);
  if (bad) {
    return { ok: false, error: bad.error };
  }
  const { effect } = createEffect(token, options.name);
  if (parsed.length > 0) {
    const interval =
      options.interval === undefined
        ? effect.layers[0]?.interval
        : cleanInterval([options.interval].flat());
    effect.layers = parsed.map((p) =>
      cleanLayer({
        fx: p.fx,
        interval,
        direction:
          options.direction === undefined
            ? isBeamSpec(p.fx)
              ? 'random'
              : null
            : cleanDirection(options.direction),
      })
    );
  }
  if (options.intensity !== undefined) {
    effect.intensity = clampIntensity(options.intensity);
  }
  markEdited(effect);
  refreshEffect(effect.id);
  return { ok: true, id: effect.id };
}

/**
 * Publishes the API other Mods can call. v1 published a global PageFX object
 * with five functions; they keep their names and now work on every live page.
 *
 * @returns {void}
 */
function publishApi() {
  const setGlobalPause = (paused) => {
    if (ready) {
      getState().paused = paused;
      syncEffects();
    }
  };
  globalThis.PageFX = Object.freeze({
    version: SCRIPT_VERSION,
    /** Starts every effect on the live pages (v1 `!pageFX on`). */
    activateAllEffects: () => setGlobalPause(false),
    /** Stops every effect until activated again (v1 `!pageFX off`). */
    deactivateAllEffects: () => setGlobalPause(true),
    /** Turns one effect on. */
    activateEffect: (token) =>
      changeEffect(token, (e) => {
        e.enabled = true;
        e.paused = false;
      }),
    /** Turns one effect off. */
    deactivateEffect: (token) =>
      changeEffect(token, (e) => {
        e.enabled = false;
      }),
    /** Turns one effect on or off. */
    toggleEffect: (token) =>
      changeEffect(token, (e) => {
        e.enabled = !e.enabled;
      }),
    start: (token) =>
      changeEffect(token, (e) => {
        e.enabled = true;
        e.paused = false;
      }),
    stop: (token) =>
      changeEffect(token, (e) => {
        e.enabled = false;
      }),
    pause: (token) =>
      changeEffect(token, (e) => {
        e.paused = true;
      }),
    resume: (token) =>
      changeEffect(token, (e) => {
        e.paused = false;
      }),
    setIntensity: (token, value) =>
      changeEffect(token, (e) => {
        e.intensity = clampIntensity(value);
      }),
    /** Makes a token an effect (see createFromApi). */
    create: (token, options) => createFromApi(token, options),
    /** Takes the effect off a token; the token stays. */
    remove: (token) => {
      const id = idOf(token);
      if (!ready || !getEffect(id)) {
        return false;
      }
      releaseEffect(id);
      syncEffects();
      return true;
    },
    /** Adds a preset for this session: registerPreset(id, {name, layers: [{fx, interval}]}). */
    registerPreset: (id, definition) => registerPreset(id, definition),
    /** Lists the presets: [{id, name, pack}]. */
    listPresets: () =>
      allPresets().map((p) => ({ id: p.id, name: presetName(p, getLang()), pack: p.pack })),
    /** Checks a token another Mod moved against the enter and leave triggers. */
    checkToken: (token) => {
      const obj = typeof token === 'string' ? getObj('graphic', token) : token;
      return ready && obj ? checkToken(obj) : 0;
    },
    fire: (token, count = 1) =>
      ready ? fireOnce(idOf(token), Math.max(1, Number(count) || 1)) : 0,
    isRunning: (token) => isRunning(idOf(token)),
    getEffect: (token) => {
      const effect = ready && getEffect(idOf(token));
      return effect
        ? JSON.parse(
            JSON.stringify({
              ...effect,
              running: isRunning(effect.id),
              problems: getProblems(effect.id),
            })
          )
        : null;
    },
    listEffects: (pageId) =>
      ready
        ? Object.keys(getEffects()).filter(
            (id) => !pageId || getObj('graphic', id)?.get('_pageid') === pageId
          )
        : [],
  });
}

/**
 * Startup: load state, take over v1 tokens, start effects and greet the GM.
 *
 * @returns {void}
 */
function checkInstall() {
  const fresh = initialiseState();
  applyGlobalConfig();
  installSchedulerHooks();
  const counts = rescanTokens();
  const s = getState();
  ready = true;
  syncEffects();
  resetTurnOrder();
  primeInside();
  try {
    installHandouts();
  } catch (err) {
    log(`${SCRIPT_NAME}: could not write the handouts: ${err?.message || err}`);
  }
  // Other Mods change the turn order without an event, so it is checked with the live pages.
  watchLivePages(LIVE_PAGE_CHECK_MS, () => handleTurnOrder(Campaign().get('turnorder') || ''));

  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

  const lang = getLang();
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  if (fresh && (counts.effects > 0 || counts.nulls > 0)) {
    lines.push(
      `<div style="margin-top:3px">${escapeHtml(t('messages.adopted', lang, counts))}</div>`
    );
    s.notices.adoptedV1 = true;
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
}

/**
 * Registers all Roll20 event handlers.
 *
 * @returns {void}
 */
function registerEventHandlers() {
  on('ready', () => {
    try {
      publishApi();
      checkInstall();
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR during startup: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
    }
  });
  on('chat:message', (msg) => {
    if (ready) {
      handleInput(msg);
    }
  });
  const resync = guarded('page change', () => syncEffects());
  on('change:campaign:playerpageid', resync);
  on('change:campaign:playerspecificpages', resync);
  on(
    'change:player:_lastpage',
    guarded('GM page change', () => {
      if (getSettings().gmPagePreview) {
        syncEffects();
      }
    })
  );
  on(
    'change:player:_online',
    guarded('player online', () => {
      if (getSettings().gmPagePreview) {
        syncEffects();
      }
    })
  );
  on('change:graphic', guarded('change:graphic', handleGraphicChange));
  on('change:graphic', guarded('trigger areas', handleTokenMoved));
  on(
    'change:campaign:turnorder',
    guarded('turn order', () => handleTurnOrder(Campaign().get('turnorder') || ''))
  );
  on('add:graphic', guarded('add:graphic', handleGraphicAdded));
  on('destroy:graphic', guarded('destroy:graphic', handleGraphicDestroyed));
  on(
    'destroy:graphic',
    guarded('trigger areas', (token) => forgetToken(token.id))
  );
  on(
    'destroy:page',
    guarded('destroy:page', () => {
      for (const id of Object.keys(getEffects())) {
        if (!getObj('graphic', id)) {
          forgetEffect(id);
        }
      }
    })
  );
}

// Stop timers if the sandbox reloads this script in place.
stopAll();
registerEventHandlers();
