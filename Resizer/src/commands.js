// Chat commands: !resizer <subcommand> (also !rsz, and a name the GM chose).
// 0.0.9's commands still work: see translateLegacy.
//
// Commands act on the selected objects, or the objects given with --ids, and
// on the GM's current page unless --pages says otherwise. Menu buttons add
// --menu, --settings, --history or --picker to show their card again.

import { whisper, whisperError, whisperWarning } from './chat.js';
import {
  API_PLAYER_ID,
  COMMAND_LIST,
  CREATURE_SIZES,
  MAX_PAGE_UNITS,
  SCRIPT_NAME,
  SIZE_UNITS,
} from './constants.js';
import { parseFactor } from './geometry.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import {
  describeEntry,
  describePage,
  showHelp,
  showHistory,
  showMainMenu,
  showPagePicker,
  showSettings,
} from './menu.js';
import { attrsOf, targetObjects } from './objects.js';
import {
  calibrateMap,
  centreItems,
  fitGraphics,
  resizeGraphics,
  resizePage,
  sizeToCreature,
  zoomPages,
} from './operations.js';
import { currentPage, pickAll, resolvePages, togglePicked } from './pages.js';
import {
  getCommand,
  getCommandNames,
  getLang,
  getSettings,
  resetSettings,
  setSetting,
} from './state.js';
import { clearHistory, undoLast } from './undo.js';
import { escapeHtml, formatNumber, toNumber, toText } from './utils.js';

// Flags that name the card to show after a change.
const BACK_FLAGS = ['menu', 'settings', 'history', 'picker'];
// Flags that take no value.
const SWITCHES = ['keep-tokens', 'scale-tokens', 'keep-ratio', 'stretch', 'fit-page', 'keep-box'];

/**
 * Splits command words into plain arguments and flags.
 *
 * @param {string[]} words Words after the subcommand.
 * @returns {{args: string[], ids: string[]|null, pages: string|null, cell: number|null,
 *   flags: Set<string>, back: string|null}} Parsed words.
 */
export function parseArgs(words) {
  const args = [];
  let ids = null;
  let pages = null;
  let cell = null;
  let back = null;
  const flags = new Set();
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    const takeRest = () => {
      const rest = [];
      while (i + 1 < words.length && !words[i + 1].startsWith('--')) {
        rest.push(words[++i]);
      }
      return rest;
    };
    if (word === '--ids') {
      ids = takeRest()
        .flatMap((w) => w.split(','))
        .filter(Boolean);
    } else if (word === '--pages') {
      pages = takeRest().join(' ');
    } else if (word === '--cell') {
      cell = toNumber(takeRest()[0]);
    } else if (word.startsWith('--') && BACK_FLAGS.includes(word.slice(2))) {
      back = word.slice(2);
    } else if (word.startsWith('--') && SWITCHES.includes(word.slice(2))) {
      flags.add(word.slice(2));
    } else {
      args.push(words[i]);
    }
  }
  return { args, ids, pages, cell, flags, back };
}

/**
 * Rewrites a 0.0.9 command as a 1.0 one.
 *
 * - `<w> <h>` → `size <w> <h> px`
 * - `scale <n> up|down` → `zoom n` or `zoom 1/n`
 * - `fit keep_ratio` → `fit --keep-ratio`
 * - `page <w> <h> pixels|units` → `page <w> <h> px|units`
 * - `config command|<name>` → `set command <name>`; `config` → `settings`
 *
 * @param {string} sub Subcommand (lower case).
 * @param {string[]} words Words after it.
 * @returns {{sub: string, words: string[]}} 1.0 command.
 */
export function translateLegacy(sub, words) {
  if (toNumber(sub) !== null && toNumber(words[0]) !== null) {
    const unit = words[1] && SIZE_UNITS.includes(words[1].toLowerCase()) ? [] : ['px'];
    return { sub: 'size', words: [sub, ...words, ...unit] };
  }
  if (sub === 'scale') {
    const n = toNumber(words[0]) ?? 2;
    const down = toText(words[1]).toLowerCase() === 'down';
    return { sub: 'zoom', words: [down ? `1/${n}` : String(n), ...words.slice(2)] };
  }
  if (sub === 'fit') {
    return {
      sub,
      words: words.map((w) => (w.toLowerCase() === 'keep_ratio' ? '--keep-ratio' : w)),
    };
  }
  if (sub === 'page' && words[2]?.toLowerCase() === 'pixels') {
    return { sub, words: [words[0], words[1], 'px', ...words.slice(3)] };
  }
  if (sub === 'config') {
    const [setting] = words;
    if (setting && setting.includes('|')) {
      const [key, ...value] = setting.split('|');
      return { sub: 'set', words: [key, value.join('|'), ...words.slice(1)] };
    }
    return { sub: 'settings', words };
  }
  if (sub === 'centre') {
    return { sub: 'center', words };
  }
  return { sub, words };
}

/**
 * Sends a short confirmation.
 *
 * @param {object} ctx Command context.
 * @param {string} text Message.
 * @returns {void}
 */
function notify(ctx, text) {
  whisper(ctx.playerId, SCRIPT_NAME, `<div>${escapeHtml(text)}</div>`);
}

/**
 * Answers a change: shows the card the button came from again, or a short
 * confirmation, plus a warning when the change was too big to keep for undo.
 *
 * @param {object} ctx Command context.
 * @param {string} text Confirmation.
 * @param {object} [result] Operation result (stored).
 * @returns {void}
 */
function reply(ctx, text, result = {}) {
  if (result.stored === false && !result.empty) {
    whisperWarning(ctx.playerId, t('messages.notStored', ctx.lang));
  }
  notify(ctx, text);
  showBack(ctx);
}

/**
 * Shows the card named by a back flag.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
function showBack(ctx) {
  switch (ctx.back) {
    case 'menu':
      showMainMenu(ctx.playerId, selection(ctx).found);
      break;
    case 'settings':
      showSettings(ctx.playerId);
      break;
    case 'history':
      showHistory(ctx.playerId);
      break;
    case 'picker':
      showPagePicker(ctx.playerId);
      break;
    default:
  }
}

/**
 * Sends an error from an operation result.
 *
 * @param {object} ctx Command context.
 * @param {{error: string, vars?: object}} result Result.
 * @returns {void}
 */
function fail(ctx, result) {
  whisperError(ctx.playerId, t(result.error, ctx.lang, result.vars || {}));
}

/**
 * Returns the selected (or --ids) objects.
 *
 * @param {object} ctx Command context.
 * @returns {{found: Array<{type: string, obj: object}>, unknown: string[]}} Objects.
 */
function selection(ctx) {
  return targetObjects(ctx.msg, ctx.ids);
}

/**
 * Returns the selected objects, telling the GM when there are none.
 *
 * @param {object} ctx Command context.
 * @returns {Array<{type: string, obj: object}>} Objects (empty after an error was sent).
 */
function requireSelection(ctx) {
  const { found, unknown } = selection(ctx);
  if (unknown.length > 0 && ctx.ids) {
    whisperError(ctx.playerId, t('errors.unknownIds', ctx.lang, { ids: unknown.join(', ') }));
    return [];
  }
  if (found.length === 0) {
    whisperError(ctx.playerId, t('errors.noSelection', ctx.lang));
  }
  return found;
}

/**
 * Returns the pages a command is for, telling the GM about unknown names.
 *
 * @param {object} ctx Command context.
 * @returns {object[]} Roll20 pages (empty after an error was sent).
 */
function targetPages(ctx) {
  if (ctx.pages === null) {
    const page = currentPage(ctx.msg.playerid);
    if (!page) {
      whisperError(ctx.playerId, t('errors.noPage', ctx.lang));
      return [];
    }
    return [page];
  }
  const { pages, unknown } = resolvePages(ctx.pages, ctx.msg.playerid);
  if (unknown.length > 0) {
    whisperError(ctx.playerId, t('errors.unknownPages', ctx.lang, { pages: unknown.join(', ') }));
    return [];
  }
  if (pages.length === 0) {
    whisperError(ctx.playerId, t('errors.noPages', ctx.lang));
  }
  return pages;
}

/**
 * Reads a unit word.
 *
 * @param {string|undefined} word Word.
 * @param {string} fallback Unit when none is given.
 * @returns {string|null} Unit, or null when the word is not a unit.
 */
function readUnit(word, fallback) {
  if (word === undefined || word === '') {
    return fallback;
  }
  const w = word.toLowerCase();
  if (['px', 'pixel', 'pixels'].includes(w)) {
    return 'px';
  }
  if (['cell', 'cells', 'squares', 'square'].includes(w)) {
    return 'cells';
  }
  if (['unit', 'units', 'un'].includes(w)) {
    return 'units';
  }
  return null;
}

const HANDLERS = {
  menu(ctx) {
    showMainMenu(ctx.playerId, selection(ctx).found);
  },
  help(ctx) {
    showHelp(ctx.playerId, COMMAND_LIST);
  },
  size(ctx) {
    const [first, second, third] = ctx.args;
    const word = toText(first).toLowerCase();
    const items = requireSelection(ctx);
    if (items.length === 0) {
      return;
    }
    if (word in CREATURE_SIZES) {
      const result = sizeToCreature(items, word);
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      reply(
        ctx,
        t('messages.sized', ctx.lang, { count: result.count, size: t(`sizes.${word}`, ctx.lang) }),
        result
      );
      return;
    }
    const width = toNumber(first);
    const height = toNumber(second ?? first);
    const unit = readUnit(third, 'px');
    if (width === null || height === null || unit === null) {
      fail(ctx, { error: 'errors.badSize' });
      return;
    }
    const result = resizeGraphics(items, width, height, unit);
    if (!result.ok) {
      fail(ctx, result);
      return;
    }
    reply(
      ctx,
      t('messages.resized', ctx.lang, {
        count: result.count,
        width: formatNumber(width),
        height: formatNumber(height),
        unit: t(`units.${unit}`, ctx.lang),
      }),
      result
    );
  },
  page(ctx) {
    const [page] = targetPages(ctx);
    if (!page) {
      return;
    }
    const [w, h, u] = ctx.args;
    if (w === undefined) {
      notify(ctx, `${page.get('name')}: ${describePage(page, ctx.lang)}`);
      showBack(ctx);
      return;
    }
    const width = toNumber(w);
    const height = toNumber(h ?? w);
    const unit = readUnit(u, 'units');
    if (width === null || height === null || unit === null) {
      fail(ctx, { error: 'errors.badPageSize', vars: { max: MAX_PAGE_UNITS } });
      return;
    }
    const result = resizePage(page, width, height, unit);
    if (!result.ok) {
      fail(ctx, result);
      return;
    }
    reply(
      ctx,
      t('messages.pageResized', ctx.lang, {
        page: page.get('name'),
        size: describePage(page, ctx.lang),
      }),
      result
    );
  },
  zoom(ctx) {
    const pages = targetPages(ctx);
    if (pages.length === 0) {
      return;
    }
    const factor = parseFactor(ctx.args, attrsOf(pages[0]));
    if (factor === null) {
      fail(ctx, { error: 'errors.badFactorText', vars: { text: ctx.args.join(' ') } });
      return;
    }
    let keepTokens;
    if (ctx.flags.has('keep-tokens')) {
      keepTokens = true;
    } else if (ctx.flags.has('scale-tokens')) {
      keepTokens = false;
    }
    const result = zoomPages(pages, factor, { keepTokens });
    if (!result.ok) {
      fail(ctx, result);
      return;
    }
    const names = pages.map((p) => p.get('name')).join(', ');
    reply(
      ctx,
      t(pages.length === 1 ? 'messages.zoomed' : 'messages.zoomedPages', ctx.lang, {
        factor: formatNumber(factor),
        page: names,
        count: pages.length,
        objects: result.counts.objects,
      }),
      result
    );
    if (result.counts.skipped > 0) {
      whisperWarning(
        ctx.playerId,
        t('messages.skipped', ctx.lang, { count: result.counts.skipped })
      );
    }
  },
  fit(ctx) {
    const items = requireSelection(ctx);
    if (items.length === 0) {
      return;
    }
    const result = fitGraphics(items, ctx.flags.has('keep-ratio'));
    if (!result.ok) {
      fail(ctx, result);
      return;
    }
    reply(ctx, t('messages.fitted', ctx.lang, { count: result.count }), result);
  },
  center(ctx) {
    const items = requireSelection(ctx);
    if (items.length === 0) {
      return;
    }
    const words = ctx.args.map((a) => a.toLowerCase());
    const h = words.some((w) => ['h', 'hor', 'horizontal', 'across', 'both'].includes(w));
    const v = words.some((w) => ['v', 'ver', 'vertical', 'down', 'both'].includes(w));
    const result = centreItems(items, h || !v, v || !h);
    if (!result.ok) {
      fail(ctx, result);
      return;
    }
    reply(ctx, t('messages.centred', ctx.lang, { count: result.count }), result);
  },
  calibrate(ctx) {
    const items = requireSelection(ctx);
    if (items.length === 0) {
      return;
    }
    const across = ctx.args[0] === undefined ? undefined : toNumber(ctx.args[0]);
    const down = ctx.args[1] === undefined ? undefined : toNumber(ctx.args[1]);
    if (across === null || down === null) {
      fail(ctx, { error: 'errors.badCount' });
      return;
    }
    const result = calibrateMap(items, {
      across,
      down,
      squarePx: ctx.cell ?? undefined,
      fitPage: ctx.flags.has('fit-page'),
      keepBox: ctx.flags.has('keep-box'),
    });
    if (!result.ok) {
      fail(ctx, result);
      return;
    }
    const lines = [
      t('messages.calibrated', ctx.lang, {
        square: formatNumber(result.squarePx[0]),
        cell: formatNumber(result.cell),
        scale: formatNumber(result.scale[0]),
      }),
    ];
    if (result.page) {
      lines.push(
        t('messages.calibratedPage', ctx.lang, {
          width: formatNumber(result.page.width),
          height: formatNumber(result.page.height),
        })
      );
    }
    if (result.boxRemoved) {
      lines.push(t('messages.boxRemoved', ctx.lang));
    }
    reply(ctx, lines.join(' '), result);
  },
  undo(ctx) {
    const result = undoLast();
    if (!result.ok) {
      whisperError(ctx.playerId, t('errors.nothingToUndo', ctx.lang));
      showBack(ctx);
      return;
    }
    notify(ctx, t('messages.undone', ctx.lang, { what: describeEntry(result.entry, ctx.lang) }));
    if (result.missing > 0) {
      whisperWarning(ctx.playerId, t('messages.undoMissing', ctx.lang, { count: result.missing }));
    }
    showBack(ctx);
  },
  history(ctx) {
    if (toText(ctx.args[0]).toLowerCase() === 'clear') {
      const n = clearHistory();
      notify(ctx, t('messages.historyCleared', ctx.lang, { count: n }));
    }
    showHistory(ctx.playerId);
  },
  pages(ctx) {
    showPagePicker(ctx.playerId);
  },
  pick(ctx) {
    const word = toText(ctx.args[0]).toLowerCase();
    if (word === 'all' || word === 'none') {
      pickAll(word === 'all');
    } else {
      const id = ctx.args.join(' ');
      const page = resolvePages(id, ctx.msg.playerid).pages[0];
      if (!page || togglePicked(page.id) === null) {
        whisperError(ctx.playerId, t('errors.unknownPages', ctx.lang, { pages: id }));
        return;
      }
    }
    if (ctx.back) {
      showBack(ctx);
    } else {
      showPagePicker(ctx.playerId);
    }
  },
  settings(ctx) {
    showSettings(ctx.playerId);
  },
  set(ctx) {
    const [key = '', ...rest] = ctx.args;
    const value = rest.join(' ');
    const known = ['language', 'command', 'keepTokenSize', 'scaleStrokes', 'deleteCalibrationBox'];
    const match = known.find((k) => k.toLowerCase() === key.toLowerCase());
    if (!match) {
      whisperError(
        ctx.playerId,
        t('errors.badSetting', ctx.lang, { key, settings: known.join(', ') })
      );
      return;
    }
    if (!setSetting(match, value)) {
      whisperError(ctx.playerId, t('errors.badValue', ctx.lang, { key: match, value }));
      return;
    }
    if (match === 'language') {
      installHandouts();
    }
    const lang = getLang();
    const shown = match === 'command' ? getCommand() : String(getSettings()[match]);
    notify({ ...ctx, lang }, t('messages.settingChanged', lang, { key: match, value: shown }));
    if (match === 'command') {
      installHandouts();
    }
    showBack({ ...ctx, lang });
  },
  reset(ctx) {
    resetSettings();
    installHandouts();
    notify(ctx, t('messages.settingsReset', getLang()));
    showBack(ctx);
  },
  journal(ctx) {
    installHandouts();
    notify(ctx, t('messages.handoutsRebuilt', ctx.lang));
  },
};

/**
 * Runs one command.
 *
 * @param {object} msg Chat message.
 * @param {string} rawSub Subcommand.
 * @param {string[]} rawWords Words after it.
 * @returns {void}
 */
function routeCommand(msg, rawSub, rawWords) {
  const { sub, words } = translateLegacy(rawSub, rawWords);
  // A command that starts with a flag (!resizer --menu) is the menu.
  const name = !sub || sub.startsWith('--') ? 'menu' : sub;
  const parsed = parseArgs(sub.startsWith('--') ? [sub, ...words] : words);
  const ctx = {
    msg,
    playerId: msg.playerid === API_PLAYER_ID ? null : msg.playerid,
    lang: getLang(),
    ...parsed,
  };
  const handler = HANDLERS[name];
  if (!handler) {
    whisperError(
      ctx.playerId,
      t('errors.unknownCommand', ctx.lang, { command: rawSub, help: `${getCommand()} help` })
    );
    return;
  }
  handler(ctx);
}

/**
 * Handles a chat message.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const content = toText(msg.content);
  const [first = ''] = content.split(/\s+/, 1);
  if (!getCommandNames().includes(first.toLowerCase())) {
    return;
  }
  // Commands sent by other Mods (ScriptCards, macros run by the API) come from
  // the player "API". Replies to them go to the GM.
  if (msg.playerid !== API_PLAYER_ID && !playerIsGM(msg.playerid)) {
    return;
  }
  try {
    const [sub = '', ...words] = content.slice(first.length).trim().split(/\s+/).filter(Boolean);
    routeCommand(msg, sub.toLowerCase(), words);
  } catch (err) {
    log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
    whisperError(
      msg.playerid === API_PLAYER_ID ? null : msg.playerid,
      t('errors.unexpected', getLang(), { message: err?.message || String(err) })
    );
  }
}
