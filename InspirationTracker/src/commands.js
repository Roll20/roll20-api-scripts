// Chat command parsing and dispatch.

import {
  activePool,
  give,
  passOn,
  poolGive,
  poolRemove,
  poolSpend,
  remove,
  spend,
  syncAll,
  termFor,
  undoSpend,
} from './actions.js';
import { whisper, whisperError, whisperWarning } from './chat.js';
import { API_PLAYER_ID, COMMAND, MACRO_NAME, MAX_POINTS, SCRIPT_NAME } from './constants.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import { resolveMarker } from './markers.js';
import {
  showHelp,
  showMainMenu,
  showParty,
  showPlayerCard,
  showPools,
  showSettings,
  showStatus,
} from './menu.js';
import { resolveCharacters } from './party.js';
import { readInspiration } from './sheet.js';
import {
  addPool,
  defaultPool,
  deletePool,
  findPool,
  getConfig,
  getPools,
  getState,
  resetConfig,
  setConfigValue,
  setPartyMember,
  validatePoolField,
} from './state.js';
import { escapeHtml, isGmOrMod, tokenize, toText } from './utils.js';

/**
 * Splits a chat message into the command word, its arguments and flags.
 *
 * @param {string} content Message text after the command prefix.
 * @returns {{sub: string, args: string[], ids: string[], party: boolean, pool: string}} Parsed command.
 */
export function parseCommand(content) {
  const words = tokenize(content);
  const args = [];
  const ids = [];
  let party = false;
  let pool = '';
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (word.toLowerCase() === '--pool') {
      pool = words[i + 1] || '';
      i += 1;
      continue;
    }
    if (word.toLowerCase() === '--ids') {
      const list = words[i + 1] || '';
      i += 1;
      ids.push(
        ...list
          .split(/[;,]/)
          .map((id) => id.trim())
          .filter(Boolean)
      );
    } else if (word.toLowerCase() === '--party') {
      party = true;
    } else {
      args.push(word);
    }
  }
  const sub = (args.shift() || '').toLowerCase();
  return { sub, args, ids, party, pool };
}

/**
 * Returns the command prefixes this game answers to: `!inspiration`, plus
 * the command a 0.1.x GM chose.
 *
 * @returns {string[]} Prefixes with the leading "!".
 */
function prefixes() {
  const legacy = getState().legacyCommand;
  return legacy ? [COMMAND, `!${legacy}`] : [COMMAND];
}

/**
 * Tells the GM (or the player who asked) what happened to one character,
 * when the result was not already announced in chat.
 *
 * @param {string} playerId Who asked.
 * @param {object} character Roll20 character.
 * @param {object} result Action result.
 * @returns {void}
 */
function report(playerId, character, result) {
  const lang = getConfig().language;
  const vars = { name: toText(character.get('name')), term: termFor(character.id, lang) };
  const target = playerId === API_PLAYER_ID ? null : playerId;
  switch (result.status) {
    case 'already':
      whisperWarning(target, t('messages.already', lang, vars));
      break;
    case 'none':
      whisperWarning(target, t('messages.none', lang, vars));
      break;
    case 'removed':
      whisper(target, SCRIPT_NAME, escapeHtml(t('messages.removed', lang, vars)));
      break;
    case 'denied':
      whisperError(target, t('errors.denied', lang, vars));
      break;
    case 'busy':
      whisperWarning(target, t('messages.busy', lang, vars));
      break;
    case 'failed':
      whisperError(target, t('errors.writeFailed', lang, vars), result.error);
      break;
    case 'poolNone':
      whisperWarning(target, t('pool.none', lang, { ...vars, ...result }));
      break;
    case 'poolRemoved':
      whisper(target, SCRIPT_NAME, escapeHtml(t('pool.removed', lang, { ...vars, ...result })));
      break;
    case 'short':
      whisperWarning(target, t('pool.short', lang, { ...vars, ...result }));
      break;
    case 'full':
      whisperWarning(target, t('pool.full', lang, { ...vars, ...result }));
      break;
    default:
      break;
  }
}

/**
 * Tells a player that no pool has the name they gave.
 *
 * @param {string|null} who Who asked.
 * @param {string} value The name given.
 * @returns {void}
 */
function unknownPool(who, value) {
  const lang = getConfig().language;
  whisperError(
    who,
    t('errors.unknownPool', lang, { value }),
    t('errors.unknownPoolHint', lang, {
      pools: getPools()
        .map((p) => p.name)
        .join(', '),
    })
  );
}

/**
 * Finds the pool a command works on: the one named with --pool, or the
 * default pool while Tracking is set to a points pool. An unknown name is
 * reported to the player.
 *
 * @param {object} msg Chat message.
 * @param {object} cmd Parsed command.
 * @returns {{pool: object|null, ok: boolean}} The pool (null for the sheet's inspiration box), and false when the name was unknown.
 */
function targetPool(msg, cmd) {
  if (!cmd.pool) {
    return { pool: activePool(), ok: true };
  }
  const pool = findPool(cmd.pool);
  if (!pool) {
    unknownPool(msg.playerid === API_PLAYER_ID ? null : msg.playerid, cmd.pool);
  }
  return { pool: pool || null, ok: Boolean(pool) };
}

/**
 * Reads the number of points (or the bonus) a command gives.
 *
 * @param {object} msg Chat message.
 * @param {string|undefined} raw The argument.
 * @param {{fallback?: number, all?: boolean}} [options] Value when nothing was typed, and whether "all" is accepted.
 * @returns {number|'all'|null} The amount, or null when it was not a whole number (the player is told).
 */
function amountArg(msg, raw, options = {}) {
  const text = toText(raw).toLowerCase();
  if (text === '' && options.fallback !== undefined) {
    return options.fallback;
  }
  if (text === 'all' && options.all) {
    return 'all';
  }
  const n = /^\+?\d{1,5}$/.test(text) ? Number(text) : 0;
  if (n < 1 || n > MAX_POINTS) {
    const lang = getConfig().language;
    whisperError(
      msg.playerid === API_PLAYER_ID ? null : msg.playerid,
      t('errors.badAmount', lang, { value: toText(raw) }),
      t('errors.badAmountHint', lang)
    );
    return null;
  }
  return n;
}

/**
 * Handles give, remove, spend and boost for a points pool.
 *
 * @param {object} msg Chat message.
 * @param {object} cmd Parsed command.
 * @param {object} pool Pool.
 * @returns {Promise<void>}
 */
async function handlePoolAction(msg, cmd, pool) {
  const sub = cmd.sub === '' || cmd.sub === 'toggle' ? 'give' : cmd.sub;
  const amount = amountArg(msg, cmd.args[0], {
    fallback: sub === 'boost' ? undefined : 1,
    all: sub === 'remove',
  });
  if (amount === null) {
    return;
  }
  const actions = {
    give: (character) => poolGive(character, pool, amount),
    remove: (character) => poolRemove(character, pool, amount),
    spend: (character, playerId) => poolSpend(character, pool, amount, playerId),
    boost: (character, playerId) =>
      poolSpend(character, pool, amount * pool.cost, playerId, amount),
  };
  await forCharacters(msg, { ...cmd, pool: pool.id }, actions[sub]);
}

/**
 * Returns the marker a pool shows on tokens, if any.
 *
 * @param {object} pool Pool.
 * @returns {string} Marker tag, or an empty string.
 */
function poolMarkerOf(pool) {
  if (pool === defaultPool()) {
    return activePool() ? getConfig().marker : '';
  }
  return pool.marker;
}

/**
 * Handles "pool add", "pool delete" and "pool set", then shows the pools.
 *
 * @param {string|null} who Who asked.
 * @param {string[]} args Arguments after "pool".
 * @returns {Promise<void>}
 */
async function handlePoolEdit(who, args) {
  const lang = getConfig().language;
  const [action = '', ...rest] = args;
  switch (action.toLowerCase()) {
    case 'add': {
      const name = rest.join(' ');
      const result = addPool(name);
      if (result.status !== 'added') {
        const key = { invalid: 'poolInvalid', exists: 'poolExists', full: 'poolFull' }[
          result.status
        ];
        whisperError(
          who,
          t(`errors.${key}`, lang, { value: name }),
          t('errors.poolNameHint', lang)
        );
        return;
      }
      break;
    }
    case 'delete': {
      const pool = findPool(rest.join(' '));
      if (!pool) {
        unknownPool(who, rest.join(' '));
        return;
      }
      const marker = poolMarkerOf(pool);
      if (!deletePool(pool)) {
        whisperError(who, t('errors.poolDefault', lang, { name: pool.name }));
        return;
      }
      stripMarker(marker);
      break;
    }
    case 'set': {
      const [id = '', rawField = '', ...words] = rest;
      const pool = findPool(id);
      if (!pool) {
        unknownPool(who, id);
        return;
      }
      const field = rawField.toLowerCase();
      let value = words.join(' ');
      if (field === 'marker') {
        if (!value || ['none', 'off'].includes(value.toLowerCase())) {
          value = '';
        } else {
          const marker = resolveMarker(value);
          if (!marker || marker.tag === getConfig().marker) {
            whisperError(
              who,
              t('errors.unknownMarker', lang, { value }),
              t('errors.poolMarkerHint', lang)
            );
            return;
          }
          value = marker.tag;
        }
      }
      const result = validatePoolField(field, value);
      const other = field === 'name' && result.valid ? findPool(value) : undefined;
      if (
        !result.valid ||
        (other && other !== pool) ||
        (field === 'marker' && pool === defaultPool())
      ) {
        whisperError(
          who,
          t('errors.badSetting', lang, { key: rawField, value }),
          t('errors.poolSetHint', lang)
        );
        return;
      }
      const oldMarker = poolMarkerOf(pool);
      pool[field] = result.value;
      if (field === 'marker') {
        stripMarker(oldMarker);
      }
      await syncAll();
      break;
    }
    default:
      break;
  }
  showPools(who);
}

/**
 * Runs an action on the selected characters (or those given with --ids).
 *
 * @param {object} msg Chat message.
 * @param {object} cmd Parsed command.
 * @param {Function} action Async action taking (character, playerId).
 * @returns {Promise<void>}
 */
async function forCharacters(msg, cmd, action) {
  const lang = getConfig().language;
  const { characters, skipped } = resolveCharacters(msg.selected, cmd.ids);
  if (skipped.length > 0) {
    whisperWarning(msg.playerid, t('errors.noCharacter', lang, { names: skipped.join(', ') }));
  }
  if (characters.length === 0) {
    if (skipped.length === 0) {
      whisperError(
        msg.playerid,
        t('errors.nothingSelected', lang),
        t('errors.nothingSelectedHint', lang)
      );
    }
    return;
  }
  for (const character of characters) {
    report(msg.playerid, character, await action(character, msg.playerid));
  }
  if (cmd.party) {
    await showParty(
      msg.playerid,
      isGmOrMod(msg.playerid, API_PLAYER_ID),
      cmd.pool ? findPool(cmd.pool) : null
    );
  }
}

/**
 * Toggles a character: gives inspiration when it has none, otherwise takes
 * it away (0.1.x's `!inspiration` with tokens selected).
 *
 * @param {object} character Roll20 character.
 * @param {string} playerId Who asked.
 * @returns {Promise<object>} Action result.
 */
async function toggle(character, playerId) {
  const { inspired } = await readInspiration(character.id);
  return inspired ? remove(character) : give(character, playerId);
}

/**
 * Handles `set`: with no arguments shows the settings, otherwise changes one.
 *
 * @param {string} playerId Who asked.
 * @param {string[]} args Setting key and value.
 * @returns {Promise<void>}
 */
async function handleSet(playerId, args) {
  const lang = getConfig().language;
  if (args.length === 0) {
    showSettings(playerId);
    return;
  }
  const [rawKey, ...rest] = args;
  const key = Object.keys(getConfig()).find((k) => k.toLowerCase() === rawKey.toLowerCase());
  let value = rest.join(' ');
  if (key === 'marker') {
    const marker = resolveMarker(value);
    if (!marker) {
      whisperError(
        playerId,
        t('errors.unknownMarker', lang, { value }),
        t('errors.unknownMarkerHint', lang)
      );
      return;
    }
    value = marker.tag;
  }
  const oldMarker = getConfig().marker;
  const result = key ? setConfigValue(key, value) : { valid: false };
  if (!result.valid) {
    whisperError(
      playerId,
      t('errors.badSetting', lang, { key: rawKey, value }),
      t('errors.badSettingHint', lang)
    );
    return;
  }
  if (key === 'tracking' || (key === 'marker' && oldMarker !== result.value)) {
    // The marker follows what is tracked: taken off everywhere, then put back
    // on the characters who have inspiration (or points) now.
    stripMarker(oldMarker);
    await syncAll();
  }
  if (key === 'language') {
    installHandouts();
  }
  showSettings(playerId);
}

/**
 * Takes a marker off every token.
 *
 * @param {string} oldMarker Marker tag.
 * @returns {void}
 */
function stripMarker(oldMarker) {
  if (!oldMarker) {
    return;
  }
  for (const token of findObjs({ _type: 'graphic', _subtype: 'token' })) {
    const tags = toText(token.get('statusmarkers')).split(',');
    if (tags.some((tag) => tag.split('@')[0] === oldMarker)) {
      token.set(
        'statusmarkers',
        tags.filter((tag) => tag && tag.split('@')[0] !== oldMarker).join(',')
      );
    }
  }
}

/**
 * Creates or updates the token action players click to spend inspiration.
 *
 * @param {string} playerId GM who asked.
 * @returns {void}
 */
function installMacro(playerId) {
  const lang = getConfig().language;
  const action = `${COMMAND} spend`;
  const creator =
    playerId === API_PLAYER_ID
      ? findObjs({ _type: 'player' }).find((p) => playerIsGM(p.id))?.id
      : playerId;
  const existing = findObjs({ _type: 'macro', name: MACRO_NAME });
  if (existing.length > 0) {
    for (const macro of existing) {
      macro.set({ action, visibleto: 'all', istokenaction: true });
    }
  } else if (creator) {
    createObj('macro', {
      name: MACRO_NAME,
      action,
      visibleto: 'all',
      istokenaction: true,
      playerid: creator,
    });
  }
  whisper(
    playerId === API_PLAYER_ID ? null : playerId,
    SCRIPT_NAME,
    escapeHtml(t('messages.macro', lang, { name: MACRO_NAME }))
  );
}

/**
 * Handles commands from players who are not GMs.
 *
 * @param {object} msg Chat message.
 * @param {object} cmd Parsed command.
 * @returns {Promise<void>}
 */
async function handlePlayer(msg, cmd) {
  const lang = getConfig().language;
  switch (cmd.sub) {
    case '':
    case 'menu':
      await showPlayerCard(msg.playerid);
      return;
    case 'spend':
    case 'boost': {
      if (!getConfig().playerSpend) {
        whisperError(msg.playerid, t('errors.spendOff', lang));
        return;
      }
      const target = targetPool(msg, cmd);
      if (!target.ok) {
        return;
      }
      if (target.pool) {
        await handlePoolAction(msg, cmd, target.pool);
      } else if (cmd.sub === 'boost') {
        whisperError(msg.playerid, t('errors.boostNoPool', lang));
      } else {
        await forCharacters(msg, cmd, spend);
      }
      return;
    }
    case 'party': {
      const target = targetPool(msg, cmd);
      if (target.ok) {
        await showParty(msg.playerid, false, cmd.pool ? target.pool : null);
      }
      return;
    }
    case 'pass':
      await handlePass(msg, cmd);
      return;
    case 'help':
      showHelp(msg.playerid, false);
      return;
    default:
      whisperError(msg.playerid, t('errors.gmOnly', lang), t('errors.gmOnlyHint', lang));
  }
}

/**
 * Handles `pass <offer> <character|none>`.
 *
 * @param {object} msg Chat message.
 * @param {object} cmd Parsed command.
 * @returns {Promise<void>}
 */
async function handlePass(msg, cmd) {
  const lang = getConfig().language;
  const [offerId = '', targetId = ''] = cmd.args;
  const result = await passOn(offerId, targetId, msg.playerid);
  const target = msg.playerid === API_PLAYER_ID ? null : msg.playerid;
  const vars = { from: result.from, to: result.to, name: result.from, term: result.term };
  switch (result.status) {
    case 'unknown':
      whisperWarning(target, t('errors.offerGone', lang));
      break;
    case 'denied':
      whisperError(target, t('errors.denied', lang, vars));
      break;
    case 'invalid':
      whisperError(target, t('errors.passInvalid', lang));
      break;
    case 'already':
      whisperWarning(target, t('messages.passAlready', lang, vars));
      break;
    case 'declined':
      whisper(target, SCRIPT_NAME, escapeHtml(t('messages.declined', lang, vars)));
      break;
    case 'failed':
      whisperError(target, t('errors.writeFailed', lang, { name: result.to }), result.error);
      break;
    default:
      break;
  }
}

/**
 * Handles commands from GMs and other Mods.
 *
 * @param {object} msg Chat message.
 * @param {object} cmd Parsed command.
 * @returns {Promise<void>}
 */
async function handleGm(msg, cmd) {
  const lang = getConfig().language;
  const who = msg.playerid === API_PLAYER_ID ? null : msg.playerid;
  if (['', 'give', 'remove', 'toggle', 'spend', 'boost'].includes(cmd.sub)) {
    const chosen = (msg.selected || []).length > 0 || cmd.ids.length > 0;
    if (cmd.sub === '' && !chosen) {
      showMainMenu(who);
      return;
    }
    const target = targetPool(msg, cmd);
    if (!target.ok) {
      return;
    }
    if (target.pool) {
      await handlePoolAction(msg, cmd, target.pool);
      return;
    }
    if (cmd.sub === 'boost') {
      whisperError(who, t('errors.boostNoPool', lang));
      return;
    }
  }
  switch (cmd.sub) {
    case '':
      await forCharacters(msg, cmd, toggle);
      return;
    case 'menu':
      showMainMenu(who);
      return;
    case 'give':
      await forCharacters(msg, cmd, give);
      return;
    case 'remove':
      await forCharacters(msg, cmd, remove);
      return;
    case 'toggle':
      await forCharacters(msg, cmd, toggle);
      return;
    case 'spend':
      await forCharacters(msg, cmd, spend);
      return;
    case 'party': {
      const action = (cmd.args[0] || '').toLowerCase();
      if (action === 'add' || action === 'remove') {
        const { characters } = resolveCharacters(msg.selected, cmd.ids);
        if (characters.length === 0) {
          whisperError(
            who,
            t('errors.nothingSelected', lang),
            t('errors.nothingSelectedHint', lang)
          );
          return;
        }
        for (const character of characters) {
          setPartyMember(character.id, action === 'add');
        }
      }
      const target = targetPool(msg, cmd);
      if (target.ok) {
        await showParty(who, true, cmd.pool ? target.pool : null);
      }
      return;
    }
    case 'pools':
      showPools(who);
      return;
    case 'pool':
      await handlePoolEdit(who, cmd.args);
      return;
    case 'pass':
      await handlePass(msg, cmd);
      return;
    case 'undo': {
      const result = await undoSpend(cmd.args[0] || '');
      if (result.status === 'unknown') {
        whisperWarning(who, t('errors.undoGone', lang));
      } else if (result.status === 'already') {
        whisperWarning(who, t('messages.undoAlready', lang, { name: result.name }));
      } else if (result.status === 'failed') {
        whisperError(who, t('errors.writeFailed', lang, { name: result.name }), result.error);
      }
      return;
    }
    case 'macro':
      installMacro(msg.playerid);
      return;
    case 'sync': {
      const counts = await syncAll();
      whisper(who, SCRIPT_NAME, escapeHtml(t('messages.synced', lang, counts)));
      return;
    }
    case 'set':
    case 'settings':
    case 'config':
      await handleSet(who, cmd.sub === 'set' ? cmd.args : []);
      return;
    case 'reset': {
      const marker = getConfig().marker;
      const tracked = getConfig().tracking;
      resetConfig();
      if (marker !== getConfig().marker || tracked !== getConfig().tracking) {
        stripMarker(marker);
        await syncAll();
      }
      showSettings(who);
      return;
    }
    case 'status':
      showStatus(who, getState().legacyCommand);
      return;
    case 'journal':
      installHandouts();
      whisper(who, SCRIPT_NAME, escapeHtml(t('messages.journal', lang)));
      return;
    case 'help':
      showHelp(who, true);
      return;
    default:
      whisperError(
        who,
        t('errors.unknownCommand', lang, { command: cmd.sub }),
        t('errors.unknownCommandHint', lang)
      );
  }
}

/**
 * Handles a chat message.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {Promise<void>}
 */
export async function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const text = toText(msg.content);
  const prefix = prefixes().find(
    (p) =>
      text.toLowerCase() === p.toLowerCase() || text.toLowerCase().startsWith(`${p.toLowerCase()} `)
  );
  if (!prefix) {
    return;
  }
  const cmd = parseCommand(text.slice(prefix.length));
  if (isGmOrMod(msg.playerid, API_PLAYER_ID)) {
    await handleGm(msg, cmd);
  } else {
    await handlePlayer(msg, cmd);
  }
}
