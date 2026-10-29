import {
  buildButton,
  buildDivider,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  buildSwatch,
  whisper,
  whisperError,
  whisperWarning,
} from './chat.js';
import {
  ANNOUNCE_OPTIONS,
  COMMAND,
  DEFAULT_CONFIG,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  HEX_LAYER_OPTIONS,
  LAYER_TOKEN,
  LEGACY_ARG_SEPARATOR,
  LEGACY_COMMANDS,
  PAGE_SETTING_KEYS,
  REVEAL_BY_OPTIONS,
  REVEAL_MODE_OPTIONS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { getPageContext } from './context.js';
import { refreshPage, restoreAll } from './cover.js';
import { hexesUnderToken, hexKey } from './grid.js';
import {
  calibratePage,
  cellsInPaths,
  cellsOutsidePaths,
  clearPage,
  consumeSourcePaths,
  fillCells,
  rescanPage,
  resetCalibration,
  undoLastFill,
} from './hexes.js';
import { LOCALE_LABELS, SUPPORTED_LOCALES, t } from './i18n.js';
import { installHandouts } from './journals.js';
import { markLocations, setHexName, unmarkLocations } from './locations.js';
import { getHexLayer, isPathObject } from './paths.js';
import { revealAroundToken, revealHex, revealPage } from './reveal.js';
import {
  clearPageSettings,
  getConfig,
  getHex,
  getHexByPathId,
  getLastFill,
  getPageData,
  getPageHexes,
  getPageIds,
  getPageSettings,
  getPendingLocations,
  setConfigValue,
  setPageSetting,
} from './state.js';
import { escapeHtml, getPlayerPageId, isJumpgate, toText } from './utils.js';

// Settings shown in the menu, in order, with how to prompt for them.
const SETTING_ROWS = [
  { key: 'hexLayer', options: HEX_LAYER_OPTIONS },
  { key: 'fillColor', color: true },
  { key: 'strokeColor', color: true },
  { key: 'labelColor', color: true },
  { key: 'glimpseColor', color: true },
  { key: 'strokeWidth' },
  { key: 'maxDistance' },
  { key: 'revealDistance' },
  { key: 'lineOfSight', options: ['on', 'off'] },
  { key: 'revealPath', options: ['on', 'off'] },
  { key: 'revealBy', options: REVEAL_BY_OPTIONS },
  { key: 'revealMode', options: REVEAL_MODE_OPTIONS },
  { key: 'announce', options: ANNOUNCE_OPTIONS },
  { key: 'pingDiscoveries', options: ['on', 'off'] },
  { key: 'hideCoveredTokens', options: ['on', 'off'] },
  { key: 'language' },
];

/**
 * Returns the active locale.
 *
 * @returns {string} Locale code.
 */
function lang() {
  return getConfig().language;
}

/**
 * Translates a key in the active locale.
 *
 * @param {string} key Translation key.
 * @param {object} [vars] Interpolation variables.
 * @returns {string} Translated text.
 */
function tr(key, vars) {
  return t(key, lang(), vars);
}

/**
 * Whispers a translated error with its hint.
 *
 * @param {string} playerId Player ID.
 * @param {string} key Key under `errors.` (the hint lives under `hints.`).
 * @param {object} [vars] Interpolation variables.
 * @returns {void}
 */
function fail(playerId, key, vars) {
  const hint = t(`hints.${key}`, lang(), vars);
  whisperError(playerId, tr(`errors.${key}`, vars), hint === `hints.${key}` ? '' : hint);
}

/**
 * Whispers a short translated confirmation.
 *
 * @param {string} playerId Player ID.
 * @param {string} key Key under `messages.`.
 * @param {object} [vars] Interpolation variables.
 * @returns {void}
 */
function done(playerId, key, vars) {
  whisper(playerId, SCRIPT_NAME, `<div>${escapeHtml(tr(`messages.${key}`, vars))}</div>`);
}

/**
 * Formats a setting value for display.
 *
 * @param {string} key Setting key.
 * @param {*} value Setting value.
 * @returns {string} Display text.
 */
function formatValue(key, value) {
  if (typeof value === 'boolean') {
    return tr(value ? 'values.on' : 'values.off');
  }
  if (value === null || value === undefined) {
    return tr('values.none');
  }
  if (key === 'language') {
    return LOCALE_LABELS[value] || value;
  }
  if (['hexLayer', 'revealBy', 'revealMode', 'announce'].includes(key)) {
    return tr(`values.${key}.${value}`);
  }
  return String(value);
}

/**
 * Builds a Roll20 query prompting for a setting's new value.
 *
 * @param {object} row Setting row definition.
 * @param {*} current Current value.
 * @returns {string} Query text.
 */
function settingQuery(row, current) {
  const label = tr(`settings.${row.key}.label`).replaceAll(/[|}]/g, '');
  if (row.options) {
    return `?{${label}|${row.options.join('|')}}`;
  }
  if (row.key === 'language') {
    return `?{${label}|${SUPPORTED_LOCALES.join('|')}}`;
  }
  const shown = current === null || current === undefined ? '' : String(current);
  return `?{${label}|${shown.replaceAll(/[|}]/g, '')}}`;
}

// ---------------------------------------------------------------------------
// Selection and page helpers
// ---------------------------------------------------------------------------

/**
 * Sorts the selection into drawn shapes, hexes and tokens.
 *
 * @param {object} msg Chat message.
 * @returns {{paths: object[], hexes: object[], tokens: object[], pageId: string|null}} Selection.
 */
function readSelection(msg) {
  const selection = { paths: [], hexes: [], tokens: [], pageId: null };
  for (const sel of msg.selected || []) {
    const obj = getObj(sel._type, sel._id);
    if (!obj) {
      continue;
    }
    selection.pageId = selection.pageId || obj.get('_pageid');
    if (isPathObject(obj)) {
      const found = getHexByPathId(sel._id);
      if (found) {
        selection.hexes.push(found);
      } else {
        selection.paths.push(obj);
      }
    } else if (sel._type === 'graphic' && obj.get('_subtype') === 'token') {
      selection.tokens.push(obj);
    }
  }
  return selection;
}

/**
 * Returns the context for the selection's page, or the GM's current page.
 * Whispers an error when the page cannot be used.
 *
 * @param {object} msg Chat message.
 * @param {object} selection Selection from readSelection.
 * @returns {object|null} Page context.
 */
function pageContextFor(msg, selection) {
  const ctx = getPageContext(selection.pageId || getPlayerPageId(msg.playerid));
  if (!ctx.ok) {
    fail(msg.playerid, ctx.reason);
    return null;
  }
  return ctx;
}

/**
 * Returns the cells under the selected tokens.
 *
 * @param {object} ctx Page context.
 * @param {object[]} tokens Roll20 graphics.
 * @returns {number[][]} Array of [row, col].
 */
function cellsUnderTokens(ctx, tokens) {
  return tokens.flatMap((token) =>
    hexesUnderToken(
      ctx.grid,
      Number(token.get('left')),
      Number(token.get('top')),
      Number(token.get('width')) || 0,
      Number(token.get('height')) || 0
    )
  );
}

/**
 * Reports the end of a fill.
 *
 * @param {string} playerId Player ID.
 * @param {object} summary Fill summary.
 * @returns {void}
 */
function reportFill(playerId, summary) {
  done(playerId, 'filled', summary);
  if (summary.fellBack) {
    whisperWarning(playerId, tr('warnings.foregroundUnavailable'));
  }
  if (summary.failed > 0) {
    whisperWarning(playerId, tr('warnings.someFailed', { count: summary.failed }));
  }
}

/**
 * Starts a fill and reports its outcome.
 *
 * @param {object} msg Chat message.
 * @param {object} ctx Page context.
 * @param {number[][]} allCells Cells to cover (duplicates are ignored).
 * @param {object[]} sources Saved source polygons.
 * @param {string} kind Fill kind.
 * @returns {void}
 */
function startFill(msg, ctx, allCells, sources, kind) {
  const seen = new Set();
  const cells = allCells.filter(([r, c]) => {
    const key = hexKey(r, c);
    return seen.has(key) ? false : seen.add(key);
  });
  if (cells.length === 0) {
    fail(msg.playerid, 'emptyArea');
    return;
  }
  const result = fillCells(ctx, cells, {
    sources,
    kind,
    onDone: (summary) => {
      refreshPage(ctx.pageId);
      reportFill(msg.playerid, summary);
    },
  });
  if (!result.started) {
    fail(msg.playerid, result.reason, { count: cells.length });
  }
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

/**
 * `fill` and `fill inverse`: cover the selected polygons (or everything
 * outside them) with hexes.
 *
 * @param {object} msg Chat message.
 * @param {boolean} inverse Fill outside the polygons.
 * @returns {void}
 */
function commandFill(msg, inverse) {
  const selection = readSelection(msg);
  if (selection.paths.length === 0) {
    fail(msg.playerid, 'noPolygons');
    return;
  }
  const ctx = pageContextFor(msg, selection);
  if (!ctx) {
    return;
  }
  const cells = inverse
    ? cellsOutsidePaths(ctx, selection.paths)
    : cellsInPaths(ctx, selection.paths);
  if (cells.length === 0) {
    fail(msg.playerid, 'emptyArea');
    return;
  }
  const sources = consumeSourcePaths(selection.paths);
  startFill(msg, ctx, cells, sources, inverse ? 'fillInverse' : 'fill');
}

/**
 * `conceal`: cover the cells under the selected polygons and tokens again.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandConceal(msg) {
  const selection = readSelection(msg);
  if (selection.paths.length === 0 && selection.tokens.length === 0) {
    fail(msg.playerid, 'nothingToConceal');
    return;
  }
  const ctx = pageContextFor(msg, selection);
  if (!ctx) {
    return;
  }
  const cells = [...cellsInPaths(ctx, selection.paths), ...cellsUnderTokens(ctx, selection.tokens)];
  const sources = consumeSourcePaths(selection.paths);
  startFill(msg, ctx, cells, sources, 'conceal');
}

/**
 * `reveal`: reveal the selected hexes and the hexes under selected polygons
 * and tokens. `reveal page` reveals everything on the page silently.
 *
 * @param {object} msg Chat message.
 * @param {string[]} args Arguments.
 * @returns {void}
 */
function commandReveal(msg, args) {
  const selection = readSelection(msg);
  const ctx = pageContextFor(msg, selection);
  if (!ctx) {
    return;
  }

  if (args[0] === 'page') {
    revealPage(ctx, (count) => done(msg.playerid, 'revealedPage', { count }));
    return;
  }

  const keys = new Set(selection.hexes.filter((h) => h.pageId === ctx.pageId).map((h) => h.key));
  for (const [r, c] of [
    ...cellsInPaths(ctx, selection.paths),
    ...cellsUnderTokens(ctx, selection.tokens),
  ]) {
    keys.add(hexKey(r, c));
  }
  if (keys.size === 0) {
    fail(msg.playerid, 'nothingToReveal');
    return;
  }
  consumeSourcePaths(selection.paths);
  const settings = getPageSettings(ctx.pageId);
  let count = 0;
  for (const key of keys) {
    if (revealHex(ctx, key, settings)) {
      count++;
    }
  }
  refreshPage(ctx.pageId);
  done(msg.playerid, 'revealed', { count });
}

/**
 * `explore`: reveal around the selected tokens as if they had just moved
 * there. Useful after moving tokens with other mods.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandExplore(msg) {
  const selection = readSelection(msg);
  if (selection.tokens.length === 0) {
    fail(msg.playerid, 'noTokens');
    return;
  }
  const count = selection.tokens.reduce(
    (sum, token) => sum + revealAroundToken(token, null, true),
    0
  );
  refreshPage(selection.pageId);
  done(msg.playerid, 'revealed', { count });
}

/**
 * `reset page [confirm]`: remove every hex on the page.
 *
 * @param {object} msg Chat message.
 * @param {string[]} args Arguments.
 * @returns {void}
 */
function commandReset(msg, args) {
  if (args[0] !== 'page') {
    fail(msg.playerid, 'unknownCommand', { command: `reset ${args.join(' ')}` });
    return;
  }
  const ctx = pageContextFor(msg, readSelection(msg));
  if (!ctx) {
    return;
  }
  const count = getPageHexes(ctx.pageId).length;
  if (args[1] !== 'confirm') {
    whisper(msg.playerid, tr('titles.confirm'), [
      `<div>${escapeHtml(tr('messages.confirmReset', { count, page: ctx.page.get('name') }))}</div>`,
      `<div style="text-align:center;margin-top:4px">${buildButton(tr('buttons.confirmReset'), `${COMMAND} reset page confirm`)}</div>`,
    ]);
    return;
  }
  clearPage(ctx, (removed) => {
    refreshPage(ctx.pageId);
    done(msg.playerid, 'resetPage', { count: removed });
  });
}

/**
 * `undo`: reverse the last fill.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandUndo(msg) {
  const result = undoLastFill();
  if (!result.ok) {
    fail(msg.playerid, result.reason);
    return;
  }
  refreshPage(result.pageId);
  done(msg.playerid, 'undone', result);
}

/**
 * `name <text>`: name the selected hexes (or the hexes under selected tokens).
 * An empty name clears it.
 *
 * @param {object} msg Chat message.
 * @param {string} rawName Name text.
 * @returns {void}
 */
function commandName(msg, rawName) {
  const selection = readSelection(msg);
  const ctx = pageContextFor(msg, selection);
  if (!ctx) {
    return;
  }
  const keys = new Set(selection.hexes.map((h) => h.key));
  for (const token of selection.tokens) {
    const [r, c] = cellsUnderTokens(ctx, [token])[0];
    keys.add(hexKey(r, c));
  }
  const hexes = [...keys].map((key) => getHex(ctx.pageId, key)).filter(Boolean);
  if (hexes.length === 0) {
    fail(msg.playerid, 'noHexes');
    return;
  }
  for (const hex of hexes) {
    setHexName(ctx, hex, rawName);
  }
  done(msg.playerid, toText(rawName) ? 'named' : 'unnamed', {
    count: hexes.length,
    name: toText(rawName),
  });
}

/**
 * `mark` / `unmark`: turn the selected tokens into hidden locations, or back.
 *
 * @param {object} msg Chat message.
 * @param {boolean} mark True to mark, false to unmark.
 * @returns {void}
 */
function commandMark(msg, mark) {
  const selection = readSelection(msg);
  if (selection.tokens.length === 0) {
    fail(msg.playerid, 'noTokens');
    return;
  }
  const ctx = pageContextFor(msg, selection);
  if (!ctx) {
    return;
  }
  if (mark) {
    done(msg.playerid, 'marked', markLocations(ctx, selection.tokens));
  } else {
    done(msg.playerid, 'unmarked', { count: unmarkLocations(ctx, selection.tokens) });
  }
}

/**
 * `set [key] [value]`: change a global setting, or show the settings card.
 *
 * @param {object} msg Chat message.
 * @param {string[]} args Arguments.
 * @returns {void}
 */
function commandSet(msg, args) {
  const [key, ...rest] = args;
  if (!key) {
    showSettings(msg.playerid);
    return;
  }
  if (!(key in DEFAULT_CONFIG)) {
    fail(msg.playerid, 'unknownSetting', { key });
    return;
  }
  const raw = rest.join(' ');
  if (key === 'language' && !raw) {
    showLanguages(msg.playerid);
    return;
  }
  const result = setConfigValue(key, raw);
  if (!result.valid) {
    fail(msg.playerid, 'invalidValue', { key, value: raw });
    return;
  }
  if (key === 'language') {
    installHandouts();
  }
  if (key === 'hideCoveredTokens') {
    if (result.value) {
      getPageIds().forEach(refreshPage);
    } else {
      restoreAll();
    }
  }
  done(msg.playerid, 'settingChanged', {
    setting: tr(`settings.${key}.label`),
    value: formatValue(key, result.value),
  });
  showSettings(msg.playerid);
}

/**
 * `page [set <key> <value> | clear]`: per-page overrides.
 *
 * @param {object} msg Chat message.
 * @param {string[]} args Arguments.
 * @returns {void}
 */
function commandPage(msg, args) {
  const ctx = pageContextFor(msg, readSelection(msg));
  if (!ctx) {
    return;
  }
  const [action, key, ...rest] = args;
  if (action === 'set') {
    if (!PAGE_SETTING_KEYS.includes(key)) {
      fail(msg.playerid, 'unknownPageSetting', {
        key: key || '',
        keys: PAGE_SETTING_KEYS.join(', '),
      });
      return;
    }
    const raw = rest.join(' ');
    const result = setPageSetting(ctx.pageId, key, raw);
    if (!result.valid) {
      fail(msg.playerid, 'invalidValue', { key, value: raw });
      return;
    }
  } else if (action === 'clear') {
    clearPageSettings(ctx.pageId);
  } else if (action) {
    fail(msg.playerid, 'unknownCommand', { command: `page ${args.join(' ')}` });
    return;
  }
  showPageSettings(msg.playerid, ctx);
}

/**
 * `rescan`: rebuild the page's hex list from the objects on it.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandRescan(msg) {
  const ctx = pageContextFor(msg, readSelection(msg));
  if (ctx) {
    const counts = rescanPage(ctx);
    refreshPage(ctx.pageId);
    done(msg.playerid, 'rescanned', counts);
  }
}

/**
 * `calibrate [reset]`: line the grid up with tokens snapped to hex centres.
 *
 * @param {object} msg Chat message.
 * @param {string[]} args Arguments.
 * @returns {void}
 */
function commandCalibrate(msg, args) {
  const selection = readSelection(msg);
  const ctx = pageContextFor(msg, selection);
  if (!ctx) {
    return;
  }
  if (args[0] === 'reset') {
    const counts = resetCalibration(ctx);
    refreshPage(ctx.pageId);
    done(msg.playerid, 'calibrationReset', counts);
    return;
  }
  if (selection.tokens.length === 0) {
    fail(msg.playerid, 'calibrateNeedsTokens');
    return;
  }
  const result = calibratePage(ctx, selection.tokens);
  if (!result.ok) {
    fail(msg.playerid, 'calibrateFailed');
    return;
  }
  refreshPage(ctx.pageId);
  done(msg.playerid, 'calibrated', {
    ...result.counts,
    colStep: result.calibration.colStep.toFixed(2),
    rowStep: result.calibration.rowStep.toFixed(2),
  });
}

/**
 * `journal rebuild`: recreate the help and Command Deck handouts.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandJournal(msg) {
  installHandouts();
  done(msg.playerid, 'journalRebuilt', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME });
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

/**
 * Whispers the main menu.
 *
 * @param {string|null} playerId Player ID (null for every GM).
 * @returns {void}
 */
export function showMainMenu(playerId) {
  const b = (key, cmd) => buildButton(tr(`buttons.${key}`), `${COMMAND} ${cmd}`);
  const s = (key, cmd) => buildSecondaryButton(tr(`buttons.${key}`), `${COMMAND} ${cmd}`);
  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, [
    buildSectionLabel(tr('menu.draw')),
    `<div>${b('fill', 'fill')}${b('fillInverse', 'fill inverse')}${s('undo', 'undo')}</div>`,
    buildSectionLabel(tr('menu.reveal')),
    `<div>${b('reveal', 'reveal')}${b('conceal', 'conceal')}${b('explore', 'explore')}</div>`,
    `<div>${s('revealPage', 'reveal page')}${s('resetPage', 'reset page')}</div>`,
    buildSectionLabel(tr('menu.locations')),
    `<div>${b('mark', 'mark')}${s('unmark', 'unmark')}${b('name', `name ?{${tr('prompts.name')}}`)}</div>`,
    buildSectionLabel(tr('menu.tools')),
    `<div>${s('settings', 'set')}${s('pageSettings', 'page')}${s('status', 'status')}</div>`,
    `<div>${s('rescan', 'rescan')}${s('calibrate', 'calibrate')}${s('help', 'help')}</div>`,
  ]);
}

/**
 * Whispers the global settings card.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showSettings(playerId) {
  const config = getConfig();
  const rows = SETTING_ROWS.map((row) => {
    const value = config[row.key];
    const shown = row.color ? buildSwatch(value) : escapeHtml(formatValue(row.key, value));
    const button = buildSecondaryButton(
      tr('buttons.change'),
      `${COMMAND} set ${row.key} ${settingQuery(row, value)}`
    );
    return buildRow(tr(`settings.${row.key}.label`), `${shown} ${button}`);
  });
  whisper(playerId, tr('titles.settings'), [
    ...rows,
    buildDivider(),
    `<div style="font-size:0.85em">${escapeHtml(tr('menu.layerInUse', { layer: tr(`values.hexLayer.${getHexLayer() === LAYER_TOKEN ? 'objects' : 'foreground'}`) }))}</div>`,
    `<div>${buildSecondaryButton(tr('buttons.menu'), COMMAND)}</div>`,
  ]);
}

/**
 * Whispers the list of languages.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showLanguages(playerId) {
  const buttons = SUPPORTED_LOCALES.map((code) =>
    buildSecondaryButton(LOCALE_LABELS[code], `${COMMAND} set language ${code}`)
  );
  whisper(playerId, tr('titles.languages'), `<div>${buttons.join('')}</div>`);
}

/**
 * Whispers a page's settings and overrides.
 *
 * @param {string} playerId Player ID.
 * @param {object} ctx Page context.
 * @returns {void}
 */
function showPageSettings(playerId, ctx) {
  const overrides = getPageData(ctx.pageId)?.settings || {};
  const effective = getPageSettings(ctx.pageId);
  const rows = PAGE_SETTING_KEYS.map((key) => {
    const row = SETTING_ROWS.find((r) => r.key === key);
    const marker = key in overrides ? ' ★' : '';
    const button = buildSecondaryButton(
      tr('buttons.change'),
      `${COMMAND} page set ${key} ${settingQuery(row, effective[key])}`
    );
    return buildRow(
      `${tr(`settings.${key}.label`)}${marker}`,
      `${escapeHtml(formatValue(key, effective[key]))} ${button}`
    );
  });
  whisper(playerId, tr('titles.pageSettings', { page: ctx.page.get('name') }), [
    `<div style="font-size:0.85em">${escapeHtml(tr('menu.pageSettingsHelp'))}</div>`,
    ...rows,
    `<div>${buildSecondaryButton(tr('buttons.clearOverrides'), `${COMMAND} page clear`)}${buildSecondaryButton(tr('buttons.menu'), COMMAND)}</div>`,
  ]);
}

/**
 * Whispers the status of the current page.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function showStatus(msg) {
  const ctx = pageContextFor(msg, readSelection(msg));
  if (!ctx) {
    return;
  }
  const hexes = getPageHexes(ctx.pageId);
  const data = getPageData(ctx.pageId);
  const last = getLastFill();
  const row = (key, value) => buildRow(tr(`status.${key}`), escapeHtml(String(value)));
  whisper(msg.playerid, tr('titles.status', { page: ctx.page.get('name') }), [
    row('engine', isJumpgate() ? 'Jumpgate' : 'Legacy'),
    row('grid', tr(`values.orientation.${ctx.grid.orientation}`)),
    row('layer', tr(`values.hexLayer.${getHexLayer() === LAYER_TOKEN ? 'objects' : 'foreground'}`)),
    row('hexes', hexes.length),
    row('named', hexes.filter((h) => h.name).length),
    row('icons', hexes.filter((h) => h.iconId).length),
    row('glimpsed', hexes.filter((h) => h.glimpsed).length),
    row('pending', getPendingLocations(ctx.pageId).length),
    row('calibrated', tr(data?.calibration ? 'values.on' : 'values.off')),
    row('overrides', Object.keys(data?.settings || {}).length),
    row('undo', last ? tr(`values.fillKind.${last.kind}`) : tr('values.none')),
  ]);
}

/**
 * Whispers the help card.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showHelp(playerId) {
  const lines = [
    ['', 'menu'],
    ['fill', 'fill'],
    ['fill inverse', 'fillInverse'],
    ['undo', 'undo'],
    ['reveal', 'reveal'],
    ['reveal page', 'revealPage'],
    ['conceal', 'conceal'],
    ['explore', 'explore'],
    ['reset page', 'resetPage'],
    ['name <text>', 'name'],
    ['mark', 'mark'],
    ['unmark', 'unmark'],
    ['set <setting> <value>', 'set'],
    ['page set <setting> <value>', 'pageSet'],
    ['page clear', 'pageClear'],
    ['rescan', 'rescan'],
    ['calibrate', 'calibrate'],
    ['calibrate reset', 'calibrateReset'],
    ['status', 'status'],
    ['journal rebuild', 'journal'],
    ['help', 'help'],
  ];
  const html = lines
    .map(
      ([cmd, key]) =>
        `<div style="margin:2px 0"><code>${escapeHtml(`${COMMAND} ${cmd}`.trim())}</code><br><span style="font-size:0.85em">${escapeHtml(tr(`help.${key}`))}</span></div>`
    )
    .join('');
  whisper(playerId, tr('titles.help'), [
    html,
    buildDivider(),
    `<div style="font-size:0.85em">${escapeHtml(tr('help.handout', { name: HANDOUT_HELP_NAME }))}</div>`,
  ]);
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/**
 * Routes a parsed command.
 *
 * @param {object} msg Chat message.
 * @param {string} sub Subcommand.
 * @param {string[]} args Arguments.
 * @param {string} rest Raw text after the subcommand.
 * @returns {void}
 */
function routeCommand(msg, sub, args, rest) {
  switch (sub) {
    case '':
    case 'menu':
      showMainMenu(msg.playerid);
      return;
    case 'help':
      showHelp(msg.playerid);
      return;
    case 'fill':
      commandFill(msg, args[0] === 'inverse');
      return;
    case 'conceal':
    case 'hide':
      commandConceal(msg);
      return;
    case 'reveal':
      commandReveal(msg, args);
      return;
    case 'explore':
      commandExplore(msg);
      return;
    case 'reset':
      commandReset(msg, args);
      return;
    case 'undo':
      commandUndo(msg);
      return;
    case 'name':
      commandName(msg, rest);
      return;
    case 'mark':
      commandMark(msg, true);
      return;
    case 'unmark':
      commandMark(msg, false);
      return;
    case 'set':
    case 'config':
      commandSet(msg, args);
      return;
    case 'page':
      commandPage(msg, args);
      return;
    case 'rescan':
      commandRescan(msg);
      return;
    case 'calibrate':
      commandCalibrate(msg, args);
      return;
    case 'status':
      showStatus(msg);
      return;
    case 'journal':
      commandJournal(msg);
      return;
    default:
      fail(msg.playerid, 'unknownCommand', { command: sub });
  }
}

/**
 * Maps a v1 command to the v2 handlers.
 *
 * @param {object} msg Chat message.
 * @param {string} action Legacy action from LEGACY_COMMANDS.
 * @param {string} rest Raw text after the command.
 * @returns {void}
 */
function routeLegacy(msg, action, rest) {
  const params = rest.split(LEGACY_ARG_SEPARATOR).map((p) => p.trim());
  switch (action) {
    case 'fill':
      commandFill(msg, false);
      return;
    case 'fillInverse':
      commandFill(msg, true);
      return;
    case 'menu':
      showMainMenu(msg.playerid);
      return;
    case 'legacyHex':
      if (params[0] === 'name') {
        commandName(msg, params.slice(1).join(LEGACY_ARG_SEPARATOR));
      }
      return;
    case 'legacyConfig': {
      const [prop, ...values] = params;
      // v1 defaults when a colour prompt is left empty.
      const updates = {
        color: () => ({
          fillColor: values[0] || 'black',
          strokeColor: values[1] || 'transparent',
          labelColor: values[2] || 'white',
        }),
        strokeWidth: () => ({ strokeWidth: values[0] || '0' }),
        maxDistance: () => ({ maxDistance: values[0] || '' }),
        revealDistance: () => ({ revealDistance: values[0] || '0' }),
      }[prop];
      if (!updates) {
        fail(msg.playerid, 'unknownSetting', { key: prop || '' });
        return;
      }
      for (const [key, value] of Object.entries(updates())) {
        if (!setConfigValue(key, value).valid) {
          fail(msg.playerid, 'invalidValue', { key, value });
        }
      }
      showSettings(msg.playerid);
      return;
    }
    default:
  }
}

/**
 * Handles chat input: `!hexploration …` and the v1 commands. GM only.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const content = toText(msg.content);
  const [first] = content.split(/\s+/, 1);
  const isMain = first === COMMAND;
  const legacy = LEGACY_COMMANDS[first];
  if (!isMain && !legacy) {
    return;
  }
  if (!playerIsGM(msg.playerid)) {
    return;
  }

  try {
    const rest = content.slice(first.length).trim();
    if (legacy) {
      routeLegacy(msg, legacy, rest);
      return;
    }
    const [sub = '', ...args] = rest.split(/\s+/).filter(Boolean);
    const afterSub = rest.slice(sub.length).trim();
    routeCommand(msg, sub.toLowerCase(), args, afterSub);
  } catch (err) {
    log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
    fail(msg.playerid, 'unexpected', { message: err?.message || String(err) });
  }
}
