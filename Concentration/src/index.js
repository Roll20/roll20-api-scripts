import { whisper } from './chat.js';
import { checkSetup, handleInput, showMenu } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import { installHandouts } from './journals.js';
import { handleDamage } from './saves.js';
import {
  applyGlobalConfig,
  getConfig,
  initialiseState,
  prunePendingRolls,
  takeNotice,
} from './state.js';
import { dirStyle, tr } from './text.js';
import {
  endConcentration,
  getRecordFor,
  handleMarkerChange,
  handleTokenDestroyed,
  isConcentrating,
  keyOf,
  listConcentrating,
  reconcile,
  startConcentration,
  syncToken,
} from './tracker.js';
import { cleanSpellName, escapeHtml, isToken } from './utils.js';

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
    const report = (err) => {
      log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
    };
    try {
      const result = fn(...args);
      if (result && typeof result.catch === 'function') {
        result.catch(report);
      }
    } catch (err) {
      report(err);
    }
  };
}

/**
 * Handles a changed graphic: hit point damage and the concentration marker.
 *
 * @param {object} obj Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {Promise<void>|void}
 */
function handleGraphicChange(obj, prev) {
  if (!isToken(obj)) {
    return undefined;
  }
  if (prev?.statusmarkers !== obj.get('statusmarkers')) {
    handleMarkerChange(obj, prev);
  }
  // Linking or unlinking the HP bar, or changing what the token represents,
  // moves it between character and token keys.
  const link = `bar${getConfig().bar}_link`;
  if (prev?.[link] !== obj.get(link) || prev?.represents !== obj.get('represents')) {
    syncToken(obj);
  }
  const bar = `bar${getConfig().bar}_value`;
  if (String(prev?.[bar]) !== String(obj.get(bar))) {
    return handleDamage(obj, prev);
  }
  return undefined;
}

/**
 * Publishes the API other Mods can call.
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.Concentration = Object.freeze({
    version: SCRIPT_VERSION,
    /**
     * Returns true when a token is concentrating.
     *
     * @param {string} tokenId Token ID.
     * @returns {boolean} True when concentrating.
     */
    isConcentrating(tokenId) {
      const token = getObj('graphic', tokenId);
      return Boolean(ready && token && isConcentrating(keyOf(token)));
    },
    /**
     * Returns the spell a token is concentrating on.
     *
     * @param {string} tokenId Token ID.
     * @returns {string|null} Spell ('' when none was named), or null when not concentrating.
     */
    spellOf(tokenId) {
      const token = getObj('graphic', tokenId);
      const record = token ? getRecordFor(token) : null;
      return record ? record.spell : null;
    },
    /**
     * Starts (or switches) concentration on a token.
     *
     * @param {string} tokenId Token ID.
     * @param {string} [spell] Spell name.
     * @returns {boolean} True when the token exists.
     */
    start(tokenId, spell = '') {
      const token = getObj('graphic', tokenId);
      if (!ready || !isToken(token)) {
        return false;
      }
      startConcentration(token, cleanSpellName(spell, 80));
      return true;
    },
    /**
     * Ends concentration on a token.
     *
     * @param {string} tokenId Token ID.
     * @returns {boolean} True when it was concentrating.
     */
    end(tokenId) {
      const token = getObj('graphic', tokenId);
      return Boolean(ready && token && endConcentration(keyOf(token), 'ended', { token }));
    },
    /**
     * Lists who is concentrating.
     *
     * @returns {{key: string, name: string, spell: string, since: number}[]} Entries.
     */
    list() {
      return ready ? listConcentrating() : [];
    },
  });
}

/**
 * Startup: migrate state, catch up with the map, install handouts and greet the GM.
 *
 * @returns {void}
 */
function checkInstall() {
  const migratedFrom = initialiseState();
  applyGlobalConfig();
  prunePendingRolls();
  const { added, dropped } = reconcile();
  installHandouts();
  publishApi();
  ready = true;

  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

  const line = (text) => `<div style="margin-top:3px">${escapeHtml(text)}</div>`;
  const lines = [`<div><strong>${escapeHtml(tr('titles.ready'))}</strong></div>`];
  if (migratedFrom === 1) {
    lines.push(line(tr('messages.migrated')));
  }
  if (added + dropped > 0) {
    lines.push(line(tr('messages.reconciled', { added, dropped })));
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(tr('messages.readyHint', { command: `!${getConfig().command}` }))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines, dirStyle());
  checkSetup();
  if (takeNotice('welcomed')) {
    showMenu(null);
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
  on('chat:message', guarded('chat:message', handleInput));
  on('change:graphic', guarded('change:graphic', handleGraphicChange));
  on('destroy:graphic', guarded('destroy:graphic', handleTokenDestroyed));
  // Roll20 fills in a new token's properties just after add:graphic, so wait a moment.
  on(
    'add:graphic',
    guarded('add:graphic', (obj) =>
      setTimeout(
        guarded('add:graphic', () => syncToken(obj)),
        250
      )
    )
  );
}

registerEventHandlers();
