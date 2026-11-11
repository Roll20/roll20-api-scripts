// DeathTracker: start-up, event wiring and the public DeathTracker object.

import { whisper, whisperWarning } from './chat.js';
import { handleChat, refreshForOwners } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import { handleAttributeChange, startPoll } from './deathsaves.js';
import { previousHp } from './hp.js';
import { t } from './i18n.js';
import { healthColorsTracksSaves, notifyObservers, observeTokenChange } from './integration.js';
import { installHandouts } from './journals.js';
import { healthColorsShares, owns } from './owners.js';
import { getSandboxVersion } from './sheet.js';
import {
  applyGlobalConfig,
  dropRecord,
  getLang,
  getRecord,
  getSettings,
  getState,
  initialiseState,
} from './state.js';
import { judge, onStatusChange } from './tracker.js';

let started = false;

/**
 * Wraps an event handler so one failure is logged instead of stopping the sandbox.
 *
 * @param {string} label Where the failure happened.
 * @param {Function} fn Handler.
 * @returns {Function} Wrapped handler.
 */
function guarded(label, fn) {
  return (...args) => {
    try {
      fn(...args);
    } catch (e) {
      log(`DeathTracker: ${label} failed: ${e?.stack || e}`);
    }
  };
}

/**
 * Handles a token change: judges it when its hit point bar changed.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
function handleTokenChange(token, prev) {
  if (!token || token.get('_subtype') !== 'token') {
    return;
  }
  const bar = getSettings().hpBar;
  const key = `bar${bar}_value`;
  const maxKey = `bar${bar}_max`;
  if (prev && token.get(key) === prev[key] && token.get(maxKey) === prev[maxKey]) {
    return;
  }
  try {
    judge(token, { prevHp: previousHp(prev, bar), event: true });
  } catch (e) {
    log(`DeathTracker: could not judge ${token.id}: ${e?.stack || e}`);
  }
  notifyObservers(token, prev);
}

/**
 * Judges a token now. For other Mods that change hit points (API changes
 * raise no events).
 *
 * @param {object|string} token Roll20 graphic or its ID.
 * @returns {string|null} The token's status.
 */
function check(token) {
  const obj = typeof token === 'string' ? getObj('graphic', token) : token;
  return obj ? judge(obj).status : null;
}

/**
 * Returns a token's status.
 *
 * @param {object|string} token Roll20 graphic or its ID.
 * @returns {string|null} Status, or null when DeathTracker has not judged it.
 */
function getStatus(token) {
  const id = typeof token === 'string' ? token : token?.id;
  return (id && getRecord(id)?.status) || null;
}

/**
 * Starts DeathTracker once Roll20 is ready.
 *
 * @returns {void}
 */
function start() {
  if (started) {
    return;
  }
  started = true;
  const { fresh, migrated } = initialiseState();
  const s = getState();
  applyGlobalConfig();
  const lang = getLang();
  on('chat:message', guarded('chat:message', handleChat));
  on('change:graphic', handleTokenChange);
  on(
    'destroy:graphic',
    guarded('destroy:graphic', (token) => dropRecord(token.id))
  );
  on('change:attribute', guarded('change:attribute', handleAttributeChange));
  if (typeof TokenMod !== 'undefined' && typeof TokenMod.ObserveTokenChange === 'function') {
    TokenMod.ObserveTokenChange(handleTokenChange);
  }
  startPoll();
  installHandouts();

  const sandbox = getSandboxVersion();
  log(
    `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=- ${sandbox ? `Mod Script Sandbox v${sandbox}` : ''}`
  );
  if (fresh || migrated) {
    const lines = [t('messages.readyHint', lang)];
    if (migrated) {
      lines.push(t('messages.migrated', lang));
    }
    if (fresh && healthColorsShares()) {
      lines.push(t('messages.healthColors', lang));
    }
    whisper(null, t('titles.ready', lang), lines.map((l) => `<div>${l}</div>`).join(''));
  }
  // HealthColors before 2.5 does not read who handles what, so it may track
  // death saves as well.
  if (
    !healthColorsShares() &&
    healthColorsTracksSaves() &&
    getSettings().deathSaves &&
    !s.notices.healthColors
  ) {
    s.notices.healthColors = true;
    whisperWarning(null, t('messages.healthColorsSaves', lang));
  }
}

on('ready', start);

/**
 * The public DeathTracker object. 0.1.x's PascalCase functions are kept for
 * the Mods that call them.
 */
const api = {
  version: SCRIPT_VERSION,
  check,
  getStatus,
  onStatusChange,
  observeTokenChange,
  isManagingDeathSaves: () => getSettings().deathSaves === true && owns('deathSaves'),
  ownersChanged: refreshForOwners,
  ObserveTokenChange: observeTokenChange,
  CheckInstall: () => {},
  RegisterEventHandlers: () => {},
};

globalThis.DeathTracker = api;
