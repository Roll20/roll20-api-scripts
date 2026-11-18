import {
  activePool,
  give,
  handleMarkerChange,
  handlePoolAttribute,
  handleSheetValue,
  observeTokenChange,
  poolGive,
  poolSpend,
  remove,
  spend,
  syncAll,
  syncPool,
  syncTokens,
} from './actions.js';
import { whisper } from './chat.js';
import { handleInput } from './commands.js';
import { showMainMenu } from './menu.js';
import {
  API_PLAYER_ID,
  BEACON_STORE_ATTRIBUTE,
  COMMAND,
  LEGACY_ATTRIBUTE,
  SCRIPT_LAST_UPDATED,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import {
  inspirationFromStore,
  isPoolAttributeName,
  readInspiration,
  readPool,
  readStore,
} from './sheet.js';
import {
  applyGlobalConfig,
  findPool,
  forgetCharacter,
  getConfig,
  getKnown,
  getPools,
  initialiseState,
  takeNoticeOnce,
} from './state.js';
import { escapeHtml, hasMarker, isInspiredValue, isToken, toText } from './utils.js';

let ready = false;

/**
 * Logs a handler error instead of letting it stop the sandbox.
 *
 * @param {string} label Handler name.
 * @param {*} err Error.
 * @returns {void}
 */
function logError(label, err) {
  log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
  if (err?.stack) {
    log(err.stack);
  }
}

/**
 * Runs a handler (which may be async) once the Mod is ready, logging errors.
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
      Promise.resolve(fn(...args)).catch((err) => logError(label, err));
    } catch (err) {
      logError(label, err);
    }
  };
}

/**
 * Handles a new or changed attribute: the 2014 sheet's `inspiration`, or the
 * 2024 sheet's `store`.
 *
 * @param {object} attr Roll20 attribute.
 * @returns {void}
 */
function handleAttribute(attr) {
  const name = toText(attr.get('name')).toLowerCase();
  const charId = attr.get('_characterid') || attr.get('characterid');
  if (name === LEGACY_ATTRIBUTE) {
    handleSheetValue(charId, isInspiredValue(attr.get('current')));
  } else if (name === BEACON_STORE_ATTRIBUTE) {
    const value = inspirationFromStore(readStore(attr));
    if (value !== undefined) {
      handleSheetValue(charId, value);
    }
  } else if (isPoolAttributeName(name)) {
    handlePoolAttribute(attr);
  }
}

/**
 * Handles a changed token: the marker added or taken off by hand or by
 * another Mod, or the token linked to a different character.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {Promise<void>}
 */
async function handleGraphic(token, prev) {
  if (!isToken(token) || !token.get('represents')) {
    return;
  }
  if (prev && prev.represents !== undefined && prev.represents !== token.get('represents')) {
    await markNewToken(token);
    return;
  }
  const marker = getConfig().marker;
  const now = hasMarker(token.get('statusmarkers'), marker);
  const before = hasMarker(prev?.statusmarkers, marker);
  if (now !== before) {
    await handleMarkerChange(token, now);
  }
}

/**
 * Shows the marker on a token that was just placed or relinked, when its
 * character has inspiration.
 *
 * @param {object} token Roll20 graphic.
 * @returns {Promise<void>}
 */
async function markNewToken(token) {
  const charId = token.get('represents');
  if (!isToken(token) || !charId) {
    return;
  }
  for (const pool of getPools()) {
    syncPool(charId, pool);
  }
  if (activePool()) {
    return;
  }
  let inspired = getKnown(charId);
  if (inspired === undefined) {
    const value = await readInspiration(charId);
    if (value.kind === 'none') {
      return;
    }
    inspired = value.inspired;
  }
  syncTokens(charId, inspired);
}

/**
 * Registers with TokenMod (if installed), because the API raises no change
 * event when another Mod changes a token's markers.
 *
 * @returns {void}
 */
function observeOtherMods() {
  if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
    TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleGraphic));
  }
}

/**
 * Publishes the API other Mods can call. Character IDs or token IDs work.
 *
 * @returns {void}
 */
function publishApi() {
  const character = (id) => {
    const token = getObj('graphic', id);
    return getObj('character', token ? token.get('represents') : id);
  };
  const run = async (id, fn) => {
    const c = character(id);
    return c ? (await fn(c, API_PLAYER_ID)).status : 'unknown';
  };
  globalThis.InspirationTracker = Object.freeze({
    version: SCRIPT_VERSION,
    /**
     * Registers a function called with (token, prev) whenever this Mod
     * changes a token's markers.
     *
     * @param {Function} fn Observer.
     * @returns {void}
     */
    ObserveTokenChange(fn) {
      observeTokenChange(fn);
    },
    /**
     * Says whether a character has inspiration.
     *
     * @param {string} id Character or token ID.
     * @returns {Promise<boolean>} True when inspired.
     */
    async isInspired(id) {
      const c = character(id);
      return c ? (await readInspiration(c.id)).inspired : false;
    },
    /**
     * Gives inspiration.
     *
     * @param {string} id Character or token ID.
     * @returns {Promise<string>} Result status.
     */
    give: (id) => run(id, give),
    /**
     * Spends inspiration, announcing it as a player's spend would be.
     *
     * @param {string} id Character or token ID.
     * @returns {Promise<string>} Result status.
     */
    spend: (id) => run(id, spend),
    /**
     * Takes inspiration away quietly.
     *
     * @param {string} id Character or token ID.
     * @returns {Promise<string>} Result status.
     */
    remove: (id) => run(id, (c) => remove(c)),
    /**
     * Returns a character's points in a pool.
     *
     * @param {string} id Character or token ID.
     * @param {string} [pool] Pool name or ID; the default pool when left out.
     * @returns {number} Points, 0 when the character or pool is unknown.
     */
    points(id, pool) {
      const c = character(id);
      const p = pool ? findPool(pool) : getPools()[0];
      return c && p ? readPool(c.id, p).value : 0;
    },
    /**
     * Adds points to a character's pool.
     *
     * @param {string} id Character or token ID.
     * @param {number} amount Points to add.
     * @param {string} [pool] Pool name or ID; the default pool when left out.
     * @returns {Promise<string>} Result status.
     */
    async givePoints(id, amount, pool) {
      const c = character(id);
      const p = pool ? findPool(pool) : getPools()[0];
      const n = Math.floor(Number(amount));
      return c && p && n > 0 ? (await poolGive(c, p, n)).status : 'unknown';
    },
    /**
     * Spends points from a character's pool, announcing it as a player's
     * spend would be.
     *
     * @param {string} id Character or token ID.
     * @param {number} amount Points to spend.
     * @param {string} [pool] Pool name or ID; the default pool when left out.
     * @returns {Promise<string>} Result status.
     */
    async spendPoints(id, amount, pool) {
      const c = character(id);
      const p = pool ? findPool(pool) : getPools()[0];
      const n = Math.floor(Number(amount));
      return c && p && n > 0 ? (await poolSpend(c, p, n, API_PLAYER_ID)).status : 'unknown';
    },
  });
}

/**
 * Startup: set up state, handouts and the API, then read every sheet once.
 *
 * @returns {Promise<void>}
 */
async function checkInstall() {
  const { migrated, command } = initialiseState();
  applyGlobalConfig();
  installHandouts();
  observeOtherMods();
  publishApi();
  ready = true;
  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

  const counts = await syncAll();
  const lang = getConfig().language;
  const line = (text) => `<div style="margin-top:3px">${escapeHtml(text)}</div>`;
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  lines.push(line(t('messages.synced', lang, counts)));
  if (migrated) {
    lines.push(line(t('messages.migrated', lang)));
    if (command) {
      lines.push(
        line(t('messages.legacyCommand', lang, { command: `!${command}`, main: COMMAND }))
      );
    }
  }
  if (takeNoticeOnce('macroHint')) {
    lines.push(line(t('messages.macroHint', lang, { command: `${COMMAND} macro` })));
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang, { command: COMMAND }))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  if (migrated) {
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
    checkInstall().catch((err) => logError('startup', err));
  });
  on('chat:message', guarded('chat:message', handleInput));
  on('change:attribute', guarded('change:attribute', handleAttribute));
  on('add:attribute', guarded('add:attribute', handleAttribute));
  on('change:graphic', guarded('change:graphic', handleGraphic));
  on('add:graphic', guarded('add:graphic', markNewToken));
  on(
    'destroy:character',
    guarded('destroy:character', (obj) => forgetCharacter(obj.id))
  );
}

registerEventHandlers();
