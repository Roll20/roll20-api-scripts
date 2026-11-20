import { buildNote, whisper, whisperWarning } from './chat.js';
import { activeCommands, handleInput, shortAliasAllowed, validateSetting } from './commands.js';
import {
  CONFLICTING_GLOBALS,
  SCRIPT_LAST_UPDATED,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  SHORT_ALIAS,
} from './constants.js';
import { t } from './i18n.js';
import { installHandouts, logSession } from './journals.js';
import {
  confirmKill,
  handleAttributeChange,
  handleDeathTrackerStatus,
  handleTokenChange,
  noticeDefeat,
} from './kills.js';
import { onLevelUp } from './levels.js';
import { showMainMenu } from './menu.js';
import { addBonus, addToPool, onAward, onSessionEnd, pay } from './session.js';
import { getProfile } from './sheets.js';
import { applyGlobalConfig, getConfig, getSession, getState, initialiseState } from './state.js';
import { canUseBeacon, escapeForChat, getSandboxVersion, isJumpgate } from './utils.js';

let ready = false;

/**
 * Wraps an event handler so an error is logged instead of stopping the sandbox.
 *
 * @param {string} label Handler name for the log.
 * @param {Function} fn Handler.
 * @returns {Function} Wrapped handler.
 */
function guarded(label, fn) {
  return (...args) => {
    if (!ready) return;
    try {
      fn(...args);
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
      if (err?.stack) log(err.stack);
    }
  };
}

/**
 * Registers with TokenMod and DeathTracker when they are installed. Changes made by
 * other Mods raise no Roll20 events.
 *
 * @returns {string[]} Names of the Mods observed.
 */
function observeOtherMods() {
  const observed = [];
  if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
    TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleTokenChange));
    observed.push('TokenMod');
  }
  const dt = typeof DeathTracker !== 'undefined' ? DeathTracker : globalThis.DeathTracker;
  if (dt && typeof dt.onStatusChange === 'function') {
    // DeathTracker 1.0 reports deaths itself, so its token observer is not needed too.
    dt.onStatusChange(guarded('DeathTracker status', handleDeathTrackerStatus));
    observed.push('DeathTracker');
  } else if (dt && typeof dt.ObserveTokenChange === 'function') {
    dt.ObserveTokenChange(guarded('DeathTracker observer', handleTokenChange));
    observed.push('DeathTracker');
  }
  return observed;
}

/**
 * Resolves a character from an object or ID.
 *
 * @param {object|string} characterOrId Character or ID.
 * @returns {object|undefined} Character.
 */
function toCharacter(characterOrId) {
  return typeof characterOrId === 'string' ? getObj('character', characterOrId) : characterOrId;
}

/**
 * Publishes the API other Mods can call. 0.1.x's CheckInstall and RegisterEventHandlers
 * stay, as no-ops, for scripts that still call them.
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.LazyExperience = Object.freeze({
    version: SCRIPT_VERSION,
    /** Adds XP to the session pool (or pays it now in instant mode). */
    addToPool: (xp, reason = '') =>
      ready ? addToPool(Number(xp), reason, { source: 'api' }) : Promise.resolve(null),
    /** Gives bonus XP to a character on top of its share. */
    award: (characterOrId, xp, reason = '') => {
      const c = toCharacter(characterOrId);
      return ready && c ? addBonus([c.id], Number(xp), reason) : Promise.resolve(null);
    },
    /** Pays XP to a character now, whatever the payout setting. */
    give: (characterOrId, xp) => {
      const c = toCharacter(characterOrId);
      return ready && c ? pay([{ id: c.id, xp: Number(xp) }]) : Promise.resolve([]);
    },
    /** Records a defeated creature token, as if its HP had dropped to 0. */
    recordKill: (tokenOrId, xp = null) => {
      const token = typeof tokenOrId === 'string' ? getObj('graphic', tokenOrId) : tokenOrId;
      return ready && token ? noticeDefeat(token, { xp }) : Promise.resolve('notCreature');
    },
    /** Adds a recorded defeat to the pool (the prompt's Add button). */
    confirmKill: (tokenId, xp) => (ready ? confirmKill(tokenId, xp) : false),
    /** Returns a copy of the current session. */
    getSession: () => JSON.parse(JSON.stringify(getSession())),
    /** Returns the game-system profile used for a character. */
    getSystem: (characterOrId) => {
      const c = toCharacter(characterOrId);
      return c ? getProfile(c).id : null;
    },
    /** Calls fn({kind, xp, reason, targets}) after each award. */
    onAward,
    /** Calls fn({character, level}) after each level-up notice. */
    onLevelUp,
    CheckInstall: () => {},
    RegisterEventHandlers: () => {},
  });
}

/**
 * Startup: migrate state, apply One-Click options, install handouts and greet the GM.
 *
 * @returns {void}
 */
function checkInstall() {
  const migratedFrom = initialiseState();
  applyGlobalConfig(validateSetting);
  installHandouts();
  const observed = observeOtherMods();
  onSessionEnd(logSession);
  publishApi();
  ready = true;

  const sandbox = getSandboxVersion();
  log(
    `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}, sandbox ${sandbox || '?'}) <=-`
  );
  if (observed.length > 0) log(`${SCRIPT_NAME}: observing ${observed.join(', ')}`);

  const lang = getConfig().language;
  const lines = [`<div><strong>${escapeForChat(t('titles.ready', lang))}</strong></div>`];
  lines.push(
    buildNote(escapeForChat(t('messages.commands', lang, { commands: activeCommands().join(' ') })))
  );
  if (!shortAliasAllowed()) {
    const other = CONFLICTING_GLOBALS.filter((n) => typeof globalThis[n] !== 'undefined')
      .map((n) => (n === 'EASYEXPERIENCE' ? 'EasyExperience' : 'ExperienceTracker'))
      .join(', ');
    lines.push(
      buildNote(escapeForChat(t('messages.aliasTaken', lang, { alias: SHORT_ALIAS, mods: other })))
    );
  }
  if (migratedFrom) {
    lines.push(`<div style="margin-top:3px">${escapeForChat(t('messages.migrated', lang))}</div>`);
  }
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);

  const beaconChars = findObjs({ _type: 'character' }).filter(
    (c) => getProfile(c).access === 'beacon'
  );
  if (beaconChars.length > 0 && !canUseBeacon() && !getState().warned.sandbox) {
    getState().warned.sandbox = true;
    whisperWarning(null, t('warnings.sandbox', lang));
  }
  if (migratedFrom) showMainMenu(null);
}

/**
 * Registers the Roll20 event handlers.
 *
 * @returns {void}
 */
function registerEventHandlers() {
  on('ready', () => {
    try {
      checkInstall();
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR during startup: ${err?.message || err}`);
      if (err?.stack) log(err.stack);
    }
  });
  on('chat:message', guarded('chat:message', handleInput));
  on('change:graphic', guarded('change:graphic', handleTokenChange));
  on('change:attribute', guarded('change:attribute', handleAttributeChange));
}

registerEventHandlers();
