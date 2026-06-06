import { whisper } from './chat.js';
import { handleInput, showMainMenu } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import { t } from './i18n.js';
import { installControlPanelHandout, installStatusHandout } from './journals.js';
import { applyGlobalConfig, ensureState, getConfig, getDeckView } from './state.js';
import { escapeHtml, getGmPlayerIds } from './utils.js';

/**
 * Initializes state, journals, and confirms startup to all GM players.
 *
 * @returns {void}
 */
function checkInstall() {
  log(`${SCRIPT_NAME}: Starting up.`);

  ensureState();
  applyGlobalConfig();
  installControlPanelHandout(getDeckView());
  installStatusHandout();

  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

  const lang = getConfig().language;
  const gmIds = getGmPlayerIds();

  for (const gmId of gmIds) {
    whisper(
      gmId,
      `${SCRIPT_NAME} v${SCRIPT_VERSION}`,
      `<div><strong>${escapeHtml(t('titles.scriptReady', lang))}</strong></div>` +
        `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('confirm.scriptReadyHint', lang))}</div>`
    );
    showMainMenu(gmId);
  }
}

/**
 * Registers all Roll20 event handlers.
 *
 * @returns {void}
 */
function registerEventHandlers() {
  on('ready', checkInstall);
  on('chat:message', handleInput);
}

registerEventHandlers();
