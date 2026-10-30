import { analyseMessage } from './analyse.js';
import { whisper } from './chat.js';
import { handleCommand, showMainMenu } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import { addObserver, handleChatMessage } from './listen.js';
import { matchListener } from './match.js';
import { applyGlobalConfig, getConfig, getListeners, initialiseState } from './state.js';
import {
  handleAbilityChanged,
  handleAbilityDestroyed,
  prepareStoreCharacter,
  syncListeners,
} from './store.js';
import { escapeHtml } from './utils.js';

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
 * Handles every chat message: CRL commands first, then the listeners.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
function handleChat(msg) {
  if (!handleCommand(msg)) {
    handleChatMessage(msg);
  }
}

/**
 * Publishes the API other mods can call.
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.CRL = Object.freeze({
    version: SCRIPT_VERSION,
    /**
     * Describes a chat message the way listeners see it.
     *
     * @param {object} msg Roll20 chat message.
     * @returns {object} Message description.
     */
    analyse(msg) {
      return analyseMessage(msg);
    },
    /**
     * Returns the names of the listeners a chat message would trigger.
     *
     * @param {object} msg Roll20 chat message.
     * @returns {string[]} Listener names.
     */
    matches(msg) {
      const message = analyseMessage(msg);
      return getListeners()
        .filter(({ listener }) => matchListener(listener, message).ok)
        .map(({ listener }) => listener.name);
    },
    /**
     * Registers a callback run whenever a listener matches.
     *
     * @param {Function} fn Callback, given {id, listener, message, verdict}.
     * @returns {void}
     */
    onMatch(fn) {
      addObserver(fn);
    },
  });
}

/**
 * Startup: migrate state, take on the store character, install handouts and
 * greet the GM.
 *
 * @returns {void}
 */
function checkInstall() {
  const migratedFrom = initialiseState();
  applyGlobalConfig();
  prepareStoreCharacter();
  const counts = syncListeners();
  installHandouts();
  publishApi();
  ready = true;

  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

  const config = getConfig();
  const lang = config.language;
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  const note = (key, vars) =>
    lines.push(`<div style="margin-top:3px">${escapeHtml(t(key, lang, vars))}</div>`);
  if (migratedFrom === 1 || counts.upgraded > 0) {
    note('messages.upgraded', { count: counts.upgraded });
  }
  if (counts.restored > 0) {
    note('messages.restored', { count: counts.restored });
  }
  if (counts.adopted > 0) {
    note('messages.adopted', { count: counts.adopted });
  }
  if (counts.removed > 0) {
    note('messages.removed', { count: counts.removed });
  }
  if (!config.enabled) {
    note('messages.listeningOff');
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang, { count: getListeners().length }))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  if (migratedFrom === 1 || counts.upgraded > 0) {
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
  on('chat:message', guarded('chat:message', handleChat));
  on('add:ability', guarded('add:ability', handleAbilityChanged));
  on('change:ability', guarded('change:ability', handleAbilityChanged));
  on('destroy:ability', guarded('destroy:ability', handleAbilityDestroyed));
}

registerEventHandlers();
