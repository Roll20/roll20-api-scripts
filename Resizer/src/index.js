import { whisper } from './chat.js';
import { handleInput } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import { onZoom } from './hooks.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import { describeEntry } from './menu.js';
import { zoomPages } from './operations.js';
import { applyGlobalConfig, getCommand, getLang, getState, initialiseState } from './state.js';
import { listHistory, undoLast } from './undo.js';
import { escapeHtml } from './utils.js';

let ready = false;

/**
 * Publishes the API other Mods can call. 0.0.9 published a global Resizer
 * object with CheckInstall and RegisterEventHandlers; they are kept (they do
 * nothing now, as 1.0 starts itself).
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.Resizer = Object.freeze({
    version: SCRIPT_VERSION,
    CheckInstall: () => {},
    RegisterEventHandlers: () => {},
    /**
     * Zooms a page with everything on it, keeping the distance per cell.
     *
     * @param {string} pageId Page ID.
     * @param {number} factor Zoom factor (2 = twice as big).
     * @param {{keepTokens?: boolean}} [options] Options.
     * @returns {{ok: boolean, error?: string, objects?: number}} Result; error is a message key.
     */
    zoomPage: (pageId, factor, options = {}) => {
      const page = ready && getObj('page', pageId);
      if (!page) {
        return { ok: false, error: 'errors.noPage' };
      }
      const result = zoomPages([page], Number(factor), options);
      return result.ok
        ? { ok: true, objects: result.counts.objects, stored: result.stored }
        : { ok: false, error: result.error };
    },
    /** Undoes the newest change. */
    undo: () => {
      if (!ready) {
        return { ok: false };
      }
      const result = undoLast();
      return result.ok
        ? { ok: true, what: describeEntry(result.entry, getLang()), missing: result.missing }
        : { ok: false };
    },
    /** Lists the undo history, newest first: [{what, at}]. */
    history: () =>
      ready ? listHistory().map((e) => ({ what: describeEntry(e, getLang()), at: e.at })) : [],
    /** Calls fn(pageId, factor) after every zoom, and after undoing one (factor 1/f). */
    onZoom: (fn) => onZoom(fn),
  });
}

/**
 * Startup: load state, upgrade 0.0.9, write the handouts and greet the GM.
 *
 * @returns {void}
 */
function checkInstall() {
  const { fresh, upgraded } = initialiseState();
  applyGlobalConfig();
  ready = true;
  try {
    installHandouts();
  } catch (err) {
    log(`${SCRIPT_NAME}: could not write the handouts: ${err?.message || err}`);
  }

  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

  const lang = getLang();
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  if (upgraded) {
    lines.push(
      `<div style="margin-top:3px">${escapeHtml(t('messages.upgraded', lang, { command: getCommand() }))}</div>`
    );
  } else if (fresh) {
    lines.push(`<div style="margin-top:3px">${escapeHtml(t('messages.welcome', lang))}</div>`);
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang, { command: getCommand() }))}</div>`
  );
  getState().version = SCRIPT_VERSION;
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
}

registerEventHandlers();
