import { whisper } from './chat.js';
import { handleInput, showMainMenu } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import {
  clearTrackCache,
  handleObservedChange,
  handleTokenChange,
  handleTurnOrderChange,
  observeTokenChange,
  preparePatrols,
  resetPatrol,
  startPatrol,
  startScheduler,
  stopPatrol,
} from './engine.js';
import { t } from './i18n.js';
import { installHandouts, removeLegacyHandout } from './journals.js';
import {
  applyGlobalConfig,
  findRoute,
  forgetToken,
  getConfig,
  getPatrols,
  getState,
  initialiseState,
} from './state.js';
import { escapeHtml, isJumpgate, isToken } from './utils.js';

let ready = false;

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
 * Handles a changed graphic: only tokens matter.
 *
 * @param {object} obj Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
function handleGraphicChange(obj, prev) {
  if (isToken(obj)) {
    handleTokenChange(obj, prev);
  }
}

/**
 * Registers with TokenMod (if installed) so followers move with tokens it
 * moves; the API does not raise change events for moves made by other Mods.
 *
 * @returns {void}
 */
function observeOtherMods() {
  if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
    TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleObservedChange));
  }
}

/**
 * Publishes the API other Mods can call.
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.TokenController = Object.freeze({
    version: SCRIPT_VERSION,
    /**
     * Registers a function called with (token, prev) whenever TokenController
     * moves a token, matching TokenMod's ObserveTokenChange.
     *
     * @param {Function} fn Observer.
     * @returns {void}
     */
    ObserveTokenChange(fn) {
      observeTokenChange(fn);
    },
    /**
     * Puts a token on a route.
     *
     * @param {string} tokenId Token ID.
     * @param {string} route Route name or `#id`.
     * @returns {boolean} True when the token started.
     */
    start(tokenId, route) {
      const token = getObj('graphic', tokenId);
      const found = findRoute(route);
      return Boolean(ready && token && found && startPatrol(token, found).ok);
    },
    /**
     * Takes a token off its route.
     *
     * @param {string} tokenId Token ID.
     * @returns {boolean} True when it was on a route.
     */
    stop(tokenId) {
      return ready && stopPatrol(tokenId);
    },
    /**
     * Returns a token to where it started and takes it off its route.
     *
     * @param {string} tokenId Token ID.
     * @returns {boolean} True when it was on a route.
     */
    reset(tokenId) {
      return ready && resetPatrol(tokenId);
    },
    /**
     * Returns the name of the route a token is on.
     *
     * @param {string} tokenId Token ID.
     * @returns {string|null} Route name, or null.
     */
    routeOf(tokenId) {
      const patrol = getPatrols()[tokenId];
      return patrol ? getState().routes[patrol.routeId]?.name || null : null;
    },
  });
}

/**
 * Startup: migrate state, clean up, install handouts and greet the GM.
 *
 * @returns {void}
 */
function checkInstall() {
  const migratedFrom = initialiseState();
  applyGlobalConfig();
  const dropped = preparePatrols();
  installHandouts();
  const removedGuide = migratedFrom === 4 ? removeLegacyHandout() : 0;
  observeOtherMods();
  publishApi();
  startScheduler();
  ready = true;

  log(
    `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}) <=-`
  );

  const lang = getConfig().language;
  const line = (text) => `<div style="margin-top:3px">${escapeHtml(text)}</div>`;
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  if (migratedFrom === 4) {
    const info = getState().notices.migratedV4 || {};
    lines.push(line(t('messages.migrated', lang, info)));
    if (info.unitPx && info.unitPx !== 70) {
      lines.push(line(t('warnings.unitPx', lang)));
    }
    if (removedGuide > 0) {
      lines.push(line(t('messages.removedGuide', lang)));
    }
  }
  if (dropped > 0) {
    lines.push(line(t('messages.pruned', lang, { count: dropped })));
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  if (migratedFrom === 4) {
    showMainMenu(null);
  }
}

/**
 * Registers all Roll20 event handlers.
 *
 * @returns {void}
 */
function registerEventHandlers() {
  on('ready', () => {
    try {
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
  on('change:graphic', guarded('change:graphic', handleGraphicChange));
  on(
    'destroy:graphic',
    guarded('destroy:graphic', (obj) => forgetToken(obj.id))
  );
  on('change:page', guarded('change:page', clearTrackCache));
  on(
    'change:campaign:turnorder',
    guarded('change:campaign:turnorder', (campaign) => handleTurnOrderChange(campaign))
  );
}

registerEventHandlers();
