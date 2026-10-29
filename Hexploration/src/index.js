import { whisper } from './chat.js';
import { handleInput, showMainMenu } from './commands.js';
import {
  PATH_TYPE_LEGACY,
  PATH_TYPE_V2,
  SCRIPT_LAST_UPDATED,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { refreshPage, refreshToken } from './cover.js';
import { pruneMissingHexes } from './hexes.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import { removeLabel } from './locations.js';
import { revealAroundToken, handleTokenChange } from './reveal.js';
import {
  applyGlobalConfig,
  deleteHexRecord,
  deletePageData,
  getConfig,
  getCoveredTokens,
  getHexByPathId,
  getPageIds,
  initialiseState,
  setPendingLocation,
} from './state.js';
import { escapeHtml, isJumpgate } from './utils.js';

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
 * Forgets a hex whose path was deleted by hand.
 *
 * @param {object} path Deleted Roll20 path.
 * @returns {void}
 */
function handlePathDestroyed(path) {
  const found = getHexByPathId(path.get('_id'));
  if (found) {
    removeLabel(found.hex);
    deleteHexRecord(found.pageId, found.key);
    refreshPage(found.pageId);
  }
}

/**
 * Forgets a deleted token as a pending location or hidden token.
 *
 * @param {object} token Deleted Roll20 graphic.
 * @returns {void}
 */
function handleGraphicDestroyed(token) {
  setPendingLocation(token.get('_id'), null);
  delete getCoveredTokens()[token.get('_id')];
}

/**
 * Forgets a deleted page's hexes.
 *
 * @param {object} page Deleted Roll20 page.
 * @returns {void}
 */
function handlePageDestroyed(page) {
  const pageId = page.get('_id');
  if (getPageIds().includes(pageId)) {
    deletePageData(pageId);
  }
}

/**
 * Registers with TokenMod (if installed) so tokens it moves reveal hexes;
 * the API does not raise change events for moves made by other mods.
 *
 * @returns {void}
 */
function observeOtherMods() {
  if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
    TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleTokenChange));
  }
}

/**
 * Publishes the API other mods can call.
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.Hexploration = Object.freeze({
    version: SCRIPT_VERSION,
    /**
     * Reveals around a token as if it had just moved, for mods that move tokens.
     *
     * @param {object|string} tokenOrId Roll20 graphic or its ID.
     * @param {object} [prev] Previous left/top, to reveal along the route.
     * @returns {number} Number of hexes revealed or glimpsed.
     */
    revealAround(tokenOrId, prev = null) {
      const token = typeof tokenOrId === 'string' ? getObj('graphic', tokenOrId) : tokenOrId;
      if (!ready || !token) {
        return 0;
      }
      try {
        const changed = revealAroundToken(token, prev);
        refreshPage(token.get('_pageid'));
        return changed;
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR in revealAround: ${err?.message || err}`);
        return 0;
      }
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
  const pruned = pruneMissingHexes();
  for (const pageId of new Set([
    ...getPageIds(),
    ...Object.values(getCoveredTokens()).map((entry) => entry.pageId),
  ])) {
    refreshPage(pageId);
  }
  installHandouts();
  registerEngineHandlers();
  observeOtherMods();
  publishApi();
  ready = true;

  log(
    `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}) <=-`
  );

  const lang = getConfig().language;
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  if (migratedFrom === 1) {
    lines.push(`<div style="margin-top:3px">${escapeHtml(t('messages.migrated', lang))}</div>`);
  }
  if (pruned.dropped > 0) {
    lines.push(
      `<div style="margin-top:3px">${escapeHtml(t('messages.pruned', lang, pruned))}</div>`
    );
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  if (migratedFrom === 1 || pruned.dropped > 0) {
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
  on('change:graphic', guarded('change:graphic', handleTokenChange));
  on('add:graphic', guarded('add:graphic', refreshToken));
  on('destroy:graphic', guarded('destroy:graphic', handleGraphicDestroyed));
  on('destroy:page', guarded('destroy:page', handlePageDestroyed));
  on(`destroy:${PATH_TYPE_LEGACY}`, guarded('destroy:path', handlePathDestroyed));
}

/**
 * Registers handlers that depend on the game engine. pathv2 objects only
 * exist in Jumpgate, and the engine is only known once the game has loaded.
 *
 * @returns {void}
 */
function registerEngineHandlers() {
  if (isJumpgate()) {
    on(`destroy:${PATH_TYPE_V2}`, guarded('destroy:pathv2', handlePathDestroyed));
  }
}

registerEventHandlers();
