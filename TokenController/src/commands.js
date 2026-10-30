import {
  buildButton,
  buildDivider,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
  whisperError,
  whisperWarning,
} from './chat.js';
import {
  ANCHOR_PAGE,
  ANCHOR_TOKEN,
  COMBAT_BEHAVIOUR_OPTIONS,
  COMBAT_DETECTION_OPTIONS,
  COMMAND,
  DEFAULT_CONFIG,
  EXAMPLE_ROUTES,
  FACING_OPTIONS,
  FOLLOW_MODE_OPTIONS,
  HANDOUT_DECK_NAME,
  HELP_COMMANDS,
  HANDOUT_HELP_NAME,
  LEGACY_PREFIXES,
  LOCK_MODE_OPTIONS,
  MANUAL_MOVE_OPTIONS,
  MOVEMENT_OPTIONS,
  PATH_TYPE_LEGACY,
  PATH_TYPE_V2,
  ROUTE_KIND_CODE,
  ROUTE_KIND_WAYPOINTS,
  ROUTE_MODE_OPTIONS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { getPageContext, pageGridOptions } from './context.js';
import { drawingWaypoints } from './drawings.js';
import {
  clearTrackCache,
  followLeader,
  isCombatActive,
  lockToken,
  recordStep,
  recordUndo,
  resetPatrol,
  startPatrol,
  stopPatrol,
  toggleStealth,
  unfollow,
  unlockToken,
} from './engine.js';
import { calibrateGrid, DIRECTIONS } from './grid.js';
import { LOCALE_LABELS, SUPPORTED_LOCALES, t } from './i18n.js';
import { installHandouts } from './journals.js';
import { translateLegacy } from './legacy.js';
import { parseCode, recordingToRoute, stepsReturnToStart } from './routes.js';
import {
  addRecording,
  addRoute,
  cleanName,
  deleteRoute,
  findRecording,
  findRoute,
  getCalibration,
  getConfig,
  getFollows,
  getLocks,
  getPatrols,
  getRecordingForToken,
  getRecordings,
  getState,
  listRoutes,
  setCalibration,
  setConfigValue,
  updateRoute,
  validateRouteOption,
} from './state.js';
import {
  escapeHtml,
  getPlayerPageId,
  isToken,
  parseStrictInt,
  tokenize,
  tokenLabel,
  toText,
} from './utils.js';

// Settings shown in the menu, in order, with how to prompt for them.
const SETTING_ROWS = [
  { key: 'interval' },
  { key: 'movement', options: MOVEMENT_OPTIONS },
  { key: 'facing', options: FACING_OPTIONS },
  { key: 'combatDetection', options: COMBAT_DETECTION_OPTIONS },
  { key: 'combatBehaviour', options: COMBAT_BEHAVIOUR_OPTIONS },
  { key: 'lockMode', options: LOCK_MODE_OPTIONS },
  { key: 'lockMarker' },
  { key: 'followMode', options: FOLLOW_MODE_OPTIONS },
  { key: 'manualMove', options: MANUAL_MOVE_OPTIONS },
  { key: 'buttonStep' },
  { key: 'language' },
];

// Settings whose values are shown with a translated label.
const OPTION_KEYS = SETTING_ROWS.filter((row) => row.options).map((row) => row.key);

const RECORD_OPS = ['undo', 'save', 'cancel', 'w', 's'];
const MAX_LISTED_TOKENS = 30;

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
 * Builds a command line from the main command and arguments.
 *
 * @param {string} args Arguments.
 * @returns {string} Command.
 */
function cmd(args) {
  return `${COMMAND} ${args}`.trim();
}

/**
 * Formats a setting value for display.
 *
 * @param {string} key Setting key.
 * @param {*} value Setting value.
 * @returns {string} Display text.
 */
function formatValue(key, value) {
  if (key === 'language') {
    return LOCALE_LABELS[value] || value;
  }
  if (key === 'interval') {
    return tr('values.ms', { ms: value });
  }
  if (key === 'lockMarker' && value === 'none') {
    return tr('values.none');
  }
  if (OPTION_KEYS.includes(key)) {
    return tr(`values.${key}.${value}`);
  }
  return String(value);
}

/**
 * Builds a Roll20 query prompting for a value.
 *
 * @param {string} label Prompt label.
 * @param {string[]|null} options Choices, or null for free text.
 * @param {*} [current] Current value, offered as the default.
 * @returns {string} Query text.
 */
function query(label, options, current) {
  const safe = (text) => String(text).replaceAll(/[|}]/g, '');
  if (options) {
    return `?{${safe(label)}|${options.map(safe).join('|')}}`;
  }
  const shown = current === null || current === undefined ? '' : safe(current);
  return `?{${safe(label)}|${shown}}`;
}

/**
 * Joins words back into text.
 *
 * @param {{text: string}[]} words Words.
 * @returns {string} Text.
 */
function joinWords(words) {
  return words.map((w) => w.text).join(' ');
}

/**
 * Splits words into two names: a quoted or `#id` first name, otherwise
 * everything but the last word, then the rest.
 *
 * @param {{text: string, quoted: boolean}[]} words Words.
 * @returns {string[]|null} [first, second], or null when there are too few words.
 */
function splitTwoNames(words) {
  if (words.length < 2) {
    return null;
  }
  if (words[0].quoted || words[0].text.startsWith('#')) {
    return [words[0].text, joinWords(words.slice(1))];
  }
  return [joinWords(words.slice(0, -1)), words.at(-1).text];
}

/**
 * Describes a route's path for display.
 *
 * @param {object} route Route record.
 * @returns {string} Description.
 */
function describeRoute(route) {
  if (route.kind === ROUTE_KIND_CODE) {
    return route.code;
  }
  const points = route.points.filter((p) => 'x' in p).length;
  return tr(route.anchor === ANCHOR_PAGE ? 'route.drawn' : 'route.recorded', { points });
}

/**
 * Returns the tokens on a route.
 *
 * @param {string} routeId Route ID.
 * @returns {string[]} Token IDs.
 */
function tokensOnRoute(routeId) {
  return Object.entries(getPatrols())
    .filter(([, p]) => p.routeId === routeId)
    .map(([id]) => id);
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/**
 * Returns the other drawing type: `path` for `pathv2` and the reverse.
 *
 * @param {string} type Drawing type.
 * @returns {string} The other drawing type.
 */
function otherPathType(type) {
  return type === PATH_TYPE_V2 ? PATH_TYPE_LEGACY : PATH_TYPE_V2;
}

/**
 * Sorts the selection into tokens and drawings.
 *
 * @param {object} msg Chat message.
 * @returns {{tokens: object[], drawings: object[]}} Selection.
 */
function readSelection(msg) {
  const selection = { tokens: [], drawings: [] };
  for (const sel of msg.selected || []) {
    if (sel._type === PATH_TYPE_V2 || sel._type === PATH_TYPE_LEGACY) {
      // Jumpgate's chat reports its drawings as `path`, but the API knows
      // them as `pathv2`, so look under both.
      const drawing = getObj(sel._type, sel._id) || getObj(otherPathType(sel._type), sel._id);
      if (drawing) {
        selection.drawings.push(drawing);
      }
      continue;
    }
    const obj = getObj(sel._type, sel._id);
    if (obj && isToken(obj)) {
      selection.tokens.push(obj);
    }
  }
  return selection;
}

/**
 * Returns the selected tokens, whispering an error when there are none.
 *
 * @param {object} msg Chat message.
 * @returns {object[]|null} Tokens, or null.
 */
function requireTokens(msg) {
  const { tokens } = readSelection(msg);
  if (tokens.length === 0) {
    fail(msg.playerid, 'noTokens');
    return null;
  }
  return tokens;
}

/**
 * Finds a route, whispering an error when it does not exist.
 *
 * @param {object} msg Chat message.
 * @param {string} ref Route reference.
 * @returns {object|null} Route.
 */
function requireRoute(msg, ref) {
  if (!toText(ref)) {
    fail(msg.playerid, 'noRouteName');
    return null;
  }
  const route = findRoute(ref);
  if (!route) {
    fail(msg.playerid, 'routeNotFound', { name: ref });
  }
  return route;
}

/**
 * Finds a token by ID, or by name on the GM's current page.
 *
 * @param {object} msg Chat message.
 * @param {string} ref Token ID or name.
 * @returns {object|null} Token.
 */
function findToken(msg, ref) {
  const text = toText(ref);
  if (!text) {
    return null;
  }
  const byId = getObj('graphic', text);
  if (isToken(byId)) {
    return byId;
  }
  const pageId = getPlayerPageId(msg.playerid);
  const lower = text.toLowerCase();
  const named = findObjs({ _type: 'graphic', _subtype: 'token', _pageid: pageId }).filter(
    (tok) => toText(tok.get('name')).toLowerCase() === lower
  );
  return named[0] || null;
}

/**
 * Lists token names for a message, shortening long lists.
 *
 * @param {object[]} tokens Roll20 graphics.
 * @returns {string} Comma-separated names.
 */
function namesOf(tokens) {
  const names = tokens.slice(0, MAX_LISTED_TOKENS).map((tok) => tokenLabel(tok));
  if (tokens.length > MAX_LISTED_TOKENS) {
    names.push(tr('values.andMore', { count: tokens.length - MAX_LISTED_TOKENS }));
  }
  return names.join(', ');
}

// ---------------------------------------------------------------------------
// Menus and cards
// ---------------------------------------------------------------------------

/**
 * Shows the main menu.
 *
 * @param {string|null} playerId Player ID, or null for every GM.
 * @returns {void}
 */
export function showMainMenu(playerId) {
  const s = getState();
  const routes = listRoutes();
  const patrolCount = Object.keys(s.patrols).length;
  const lines = [];

  let statusKey = 'menu.statusRunning';
  if (s.paused) {
    statusKey = 'menu.statusPaused';
  } else if (isCombatActive() && getConfig().combatBehaviour !== 'ignore') {
    statusKey = `menu.statusCombat.${getConfig().combatBehaviour}`;
  }
  lines.push(
    `<div style="font-size:0.9em">${escapeHtml(tr(statusKey, { patrols: patrolCount, routes: routes.length }))}</div>`
  );

  lines.push(buildSectionLabel(tr('menu.routes')));
  if (routes.length === 0) {
    lines.push(`<div style="font-size:0.9em">${escapeHtml(tr('menu.noRoutes'))}</div>`);
  }
  for (const route of routes) {
    const count = tokensOnRoute(route.id).length;
    const label = count > 0 ? `${route.name} (${count})` : route.name;
    lines.push(
      buildRow(
        label,
        buildButton(tr('buttons.start'), cmd(`start #${route.id}`)) +
          buildSecondaryButton(tr('buttons.stop'), cmd(`stop #${route.id}`)) +
          buildSecondaryButton('⋯', cmd(`show #${route.id}`))
      )
    );
  }

  lines.push(buildSectionLabel(tr('menu.create')));
  lines.push(
    [
      buildButton(
        tr('buttons.add'),
        cmd(`add ${query(tr('prompts.name'), null)} ${query(tr('prompts.code'), null, 'U2R2D2L2')}`)
      ),
      buildButton(tr('buttons.draw'), cmd(`draw ${query(tr('prompts.name'), null)}`)),
      buildButton(tr('buttons.record'), cmd(`record ${query(tr('prompts.name'), null)}`)),
      buildSecondaryButton(tr('buttons.examples'), cmd('examples')),
    ].join('')
  );

  lines.push(buildSectionLabel(tr('menu.selected')));
  lines.push(
    [
      buildSecondaryButton(tr('buttons.stop'), cmd('stop')),
      buildSecondaryButton(tr('buttons.reset'), cmd('reset')),
      buildSecondaryButton(tr('buttons.lock'), cmd('lock')),
      buildSecondaryButton(tr('buttons.unlock'), cmd('unlock')),
      buildSecondaryButton(tr('buttons.leader'), cmd('leader')),
      buildSecondaryButton(tr('buttons.follow'), cmd('follow')),
      buildSecondaryButton(tr('buttons.unfollow'), cmd('unfollow')),
    ].join('')
  );

  lines.push(buildSectionLabel(tr('menu.tools')));
  const tools = [
    s.paused
      ? buildButton(tr('buttons.resume'), cmd('resume'))
      : buildSecondaryButton(tr('buttons.pause'), cmd('pause')),
  ];
  if (getConfig().combatDetection !== 'tracker') {
    tools.push(
      buildSecondaryButton(
        tr(s.combat.manual ? 'buttons.combatOff' : 'buttons.combatOn'),
        cmd(`combat ${s.combat.manual ? 'off' : 'on'}`)
      )
    );
  }
  tools.push(
    buildSecondaryButton(tr('buttons.stopAll'), cmd('stop all')),
    buildSecondaryButton(tr('buttons.settings'), cmd('set')),
    buildSecondaryButton(tr('buttons.status'), cmd('status')),
    buildSecondaryButton(tr('buttons.help'), cmd('help'))
  );
  lines.push(tools.join(''));

  const recordings = Object.values(getRecordings());
  if (recordings.length > 0) {
    lines.push(buildSectionLabel(tr('menu.recordings')));
    for (const rec of recordings) {
      lines.push(buildRow(rec.name, buildButton(tr('buttons.open'), cmd(`record #${rec.id}`))));
    }
  }

  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
}

/**
 * Shows a route's details and controls.
 *
 * @param {string} playerId Player ID.
 * @param {object} route Route record.
 * @returns {void}
 */
function showRoute(playerId, route) {
  const ref = `#${route.id}`;
  const tokens = tokensOnRoute(route.id).map(
    (id) => getObj('graphic', id) || { id, get: () => id }
  );
  const lines = [
    buildRow(tr('route.path'), `<code>${escapeHtml(describeRoute(route))}</code>`),
    buildRow(
      tr('route.mode'),
      buildSecondaryButton(
        tr(`values.mode.${route.mode}`),
        cmd(`route ${ref} mode ${query(tr('route.mode'), ROUTE_MODE_OPTIONS)}`)
      )
    ),
    buildRow(
      tr('route.interval'),
      buildSecondaryButton(
        route.interval ? tr('values.ms', { ms: route.interval }) : tr('values.default'),
        cmd(`route ${ref} interval ${query(tr('prompts.interval'), null, route.interval || 0)}`)
      )
    ),
    buildRow(
      tr('route.maxTokens'),
      buildSecondaryButton(
        route.maxTokens ? String(route.maxTokens) : tr('values.noLimit'),
        cmd(`route ${ref} max ${query(tr('prompts.maxTokens'), null, route.maxTokens || 0)}`)
      )
    ),
    buildRow(
      tr('route.randomStart'),
      buildSecondaryButton(
        tr(route.randomStart ? 'values.on' : 'values.off'),
        cmd(`route ${ref} random ${route.randomStart ? 'off' : 'on'}`)
      )
    ),
    buildRow(
      tr('route.start'),
      route.start
        ? buildSecondaryButton(tr('buttons.clearStart'), cmd(`route ${ref} start clear`))
        : buildSecondaryButton(tr('buttons.setStart'), cmd(`route ${ref} start set`))
    ),
    buildRow(
      tr('route.tokens'),
      escapeHtml(tokens.length > 0 ? namesOf(tokens) : tr('values.none'))
    ),
    buildDivider(),
    [
      buildButton(tr('buttons.start'), cmd(`start ${ref}`)),
      buildSecondaryButton(tr('buttons.stop'), cmd(`stop ${ref}`)),
      buildSecondaryButton(tr('buttons.reset'), cmd(`reset ${ref}`)),
      route.kind === ROUTE_KIND_CODE
        ? buildSecondaryButton(
            tr('buttons.edit'),
            cmd(`edit ${ref} ${query(tr('prompts.code'), null, route.code)}`)
          )
        : '',
      buildSecondaryButton(
        tr('buttons.rename'),
        cmd(`rename ${ref} ${query(tr('prompts.newName'), null, route.name)}`)
      ),
      buildSecondaryButton(
        tr('buttons.copy'),
        cmd(`copy ${ref} ${query(tr('prompts.newName'), null)}`)
      ),
      buildSecondaryButton(tr('buttons.export'), cmd(`export ${ref}`)),
      buildSecondaryButton(tr('buttons.remove'), cmd(`remove ${ref}`)),
      buildSecondaryButton(tr('buttons.menu'), cmd('')),
    ].join(''),
  ];
  whisper(playerId, route.name, lines);
}

/**
 * Shows a recording's controls.
 *
 * @param {string} playerId Player ID.
 * @param {object} recording Recording record.
 * @returns {void}
 */
function showRecording(playerId, recording) {
  const ref = `#${recording.id}`;
  const step = getConfig().buttonStep;
  const token = getObj('graphic', recording.tokenId);
  const moves = recording.entries.length - 1;
  const dirButton = (dir) => buildButton(dir, cmd(`record ${ref} ${dir} ${step}`));
  const lines = [
    `<div style="font-size:0.9em">${escapeHtml(tr('record.intro', { token: tokenLabel(token, recording.tokenId), count: moves }))}</div>`,
    `<div style="text-align:center">${dirButton('UL')}${dirButton('U')}${dirButton('UR')}</div>`,
    `<div style="text-align:center">${dirButton('L')}${buildSecondaryButton(tr('buttons.wait'), cmd(`record ${ref} W`))}${dirButton('R')}</div>`,
    `<div style="text-align:center">${dirButton('DL')}${dirButton('D')}${dirButton('DR')}</div>`,
    buildRow(
      tr('settings.buttonStep.label'),
      buildSecondaryButton(
        String(step),
        cmd(`set buttonStep ${query(tr('settings.buttonStep.label'), null, step)}`)
      )
    ),
    buildDivider(),
    [
      buildSecondaryButton(tr('buttons.stealth'), cmd(`record ${ref} S`)),
      buildSecondaryButton(tr('buttons.undo'), cmd(`record ${ref} undo`)),
      buildButton(tr('buttons.save'), cmd(`record ${ref} save`)),
      buildSecondaryButton(tr('buttons.cancel'), cmd(`record ${ref} cancel`)),
    ].join(''),
  ];
  whisper(playerId, tr('record.title', { name: recording.name }), lines);
}

/**
 * Shows every setting with a button to change it.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showSettings(playerId) {
  const config = getConfig();
  const lines = SETTING_ROWS.map((row) => {
    const label = tr(`settings.${row.key}.label`);
    const options = row.key === 'language' ? SUPPORTED_LOCALES : row.options || null;
    return buildRow(
      label,
      buildSecondaryButton(
        formatValue(row.key, config[row.key]),
        cmd(`set ${row.key} ${query(label, options, config[row.key])}`)
      )
    );
  });
  lines.push(buildDivider(), buildSecondaryButton(tr('buttons.menu'), cmd('')));
  whisper(playerId, tr('titles.settings'), lines);
}

/**
 * Shows the command list.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showHelp(playerId) {
  const rows = HELP_COMMANDS.map(([text, key]) =>
    buildRow(text ? `${COMMAND} ${text}` : COMMAND, escapeHtml(tr(`help.${key}`)))
  );
  rows.push(
    `<div style="font-size:0.85em;margin-top:4px">${escapeHtml(tr('help.footer', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME, legacy: LEGACY_PREFIXES.join(', ') }))}</div>`
  );
  whisper(playerId, tr('titles.help'), rows);
}

// ---------------------------------------------------------------------------
// Route commands
// ---------------------------------------------------------------------------

/**
 * Picks the default mode for a new route: loop when it ends where it starts,
 * ping-pong otherwise.
 *
 * @param {object} fields Route fields.
 * @returns {string} Mode.
 */
function defaultMode(fields) {
  if (fields.kind === ROUTE_KIND_CODE) {
    const parsed = parseCode(fields.code);
    return parsed.ok && stepsReturnToStart(parsed.steps) ? 'loop' : 'pingpong';
  }
  const places = fields.points.filter((p) => 'x' in p);
  const first = places[0];
  const last = places.at(-1);
  return places.length > 2 && Math.hypot(first.x - last.x, first.y - last.y) < 1
    ? 'loop'
    : 'pingpong';
}

/**
 * Checks a new route name, whispering an error when it is empty or taken.
 *
 * @param {object} msg Chat message.
 * @param {string} raw Name.
 * @param {string} [exceptId] Route allowed to have the name (when renaming).
 * @returns {string|null} Clean name, or null.
 */
function checkNewName(msg, raw, exceptId) {
  const name = cleanName(raw);
  if (!name || name.startsWith('#')) {
    fail(msg.playerid, 'noRouteName');
    return null;
  }
  const existing = findRoute(name);
  if (existing && existing.id !== exceptId) {
    fail(msg.playerid, 'routeExists', { name });
    return null;
  }
  return name;
}

/**
 * Checks a step code, whispering an error when it is invalid.
 *
 * @param {object} msg Chat message.
 * @param {string} code Step code.
 * @returns {boolean} True when valid.
 */
function checkCode(msg, code) {
  const parsed = parseCode(code);
  if (!parsed.ok) {
    fail(msg.playerid, `code.${parsed.error}`, { at: parsed.at || '', code });
    return false;
  }
  return true;
}

/**
 * Stores a new route and confirms it.
 *
 * @param {object} msg Chat message.
 * @param {object} fields Route fields.
 * @returns {object|null} Route.
 */
function createRoute(msg, fields) {
  const route = addRoute({ mode: defaultMode(fields), ...fields });
  if (!route) {
    fail(msg.playerid, 'routeInvalid');
    return null;
  }
  done(msg.playerid, 'routeAdded', { name: route.name, mode: tr(`values.mode.${route.mode}`) });
  showRoute(msg.playerid, route);
  return route;
}

/**
 * `add <name> <code>`: create a route from a step code.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandAdd(msg, words) {
  if (words.length < 2) {
    fail(msg.playerid, 'usageAdd');
    return;
  }
  const code = words.at(-1).text;
  const name = checkNewName(msg, joinWords(words.slice(0, -1)));
  if (name && checkCode(msg, code)) {
    createRoute(msg, { name, kind: ROUTE_KIND_CODE, code });
  }
}

/**
 * `edit <route> <code>`: change a route's step code.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandEdit(msg, words) {
  if (words.length < 2) {
    fail(msg.playerid, 'usageEdit');
    return;
  }
  const route = requireRoute(msg, joinWords(words.slice(0, -1)));
  const code = words.at(-1).text;
  if (!route || !checkCode(msg, code)) {
    return;
  }
  const updated = updateRoute(route.id, { kind: ROUTE_KIND_CODE, code, anchor: undefined });
  clearTrackCache();
  done(msg.playerid, 'routeUpdated', { name: updated.name });
  showRoute(msg.playerid, updated);
}

/**
 * `draw <name>`: create a route that follows the selected drawing.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandDraw(msg, words) {
  const { drawings } = readSelection(msg);
  if (drawings.length !== 1) {
    fail(msg.playerid, 'selectOneDrawing');
    return;
  }
  const name = checkNewName(msg, joinWords(words));
  if (!name) {
    return;
  }
  const drawing = drawings[0];
  const pageId = drawing.get('_pageid');
  const page = getObj('page', pageId);
  const props = {
    type: drawing.get('_type'),
    _path: drawing.get('_path') ?? drawing.get('path'),
    points: drawing.get('points'),
    shape: drawing.get('shape'),
    x: drawing.get('x'),
    y: drawing.get('y'),
    left: drawing.get('left'),
    top: drawing.get('top'),
    width: drawing.get('width'),
    height: drawing.get('height'),
    scaleX: drawing.get('scaleX'),
    scaleY: drawing.get('scaleY'),
    rotation: drawing.get('rotation'),
  };
  const result = drawingWaypoints(props, {
    width: page?.get('width'),
    height: page?.get('height'),
  });
  if (!result) {
    fail(msg.playerid, 'drawingEmpty');
    return;
  }
  createRoute(msg, {
    name,
    kind: ROUTE_KIND_WAYPOINTS,
    anchor: ANCHOR_PAGE,
    pageId,
    points: result.points.map(([x, y]) => ({ x, y })),
  });
}

/**
 * `route <route> <option> <value>`: change a route option.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandRouteOption(msg, words) {
  if (words.length < 3) {
    fail(msg.playerid, 'usageRoute');
    return;
  }
  const route = requireRoute(msg, joinWords(words.slice(0, -2)));
  if (!route) {
    return;
  }
  const option = words.at(-2).text.toLowerCase();
  const value = words.at(-1).text;
  const aliases = {
    mode: 'mode',
    interval: 'interval',
    max: 'maxTokens',
    maxtokens: 'maxTokens',
    random: 'randomStart',
    randomstart: 'randomStart',
    start: 'start',
  };
  const key = aliases[option];
  if (!key) {
    fail(msg.playerid, 'unknownRouteOption', { option });
    return;
  }

  if (key === 'start') {
    const mode = value.toLowerCase();
    if (mode === 'clear') {
      updateRoute(route.id, { start: null });
    } else {
      const tokens = readSelection(msg).tokens;
      if (tokens.length !== 1) {
        fail(msg.playerid, 'selectOneToken');
        return;
      }
      const [token] = tokens;
      updateRoute(route.id, {
        start: {
          pageId: token.get('_pageid'),
          left: token.get('left'),
          top: token.get('top'),
          rotation: token.get('rotation'),
        },
      });
    }
  } else {
    const raw =
      key === 'randomStart' && value.toLowerCase() === 'toggle' ? !route.randomStart : value;
    const result = validateRouteOption(key, raw);
    if (!result.valid) {
      fail(msg.playerid, 'badRouteValue', { option, value });
      return;
    }
    updateRoute(route.id, { [key]: result.value });
  }
  clearTrackCache();
  showRoute(msg.playerid, findRoute(`#${route.id}`));
}

/**
 * `rename <route> <new name>`.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandRename(msg, words) {
  const names = splitTwoNames(words);
  if (!names) {
    fail(msg.playerid, 'usageRename');
    return;
  }
  const route = requireRoute(msg, names[0]);
  const name = route && checkNewName(msg, names[1], route.id);
  if (route && name) {
    updateRoute(route.id, { name });
    done(msg.playerid, 'routeRenamed', { from: route.name, to: name });
  }
}

/**
 * `copy <route> <new name>`.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandCopy(msg, words) {
  const names = splitTwoNames(words);
  if (!names) {
    fail(msg.playerid, 'usageCopy');
    return;
  }
  const route = requireRoute(msg, names[0]);
  const name = route && checkNewName(msg, names[1]);
  if (route && name) {
    const { id, ...fields } = route;
    void id;
    createRoute(msg, { ...JSON.parse(JSON.stringify(fields)), name });
  }
}

/**
 * `remove <route> [confirm]`: delete a route, asking first.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandRemove(msg, words) {
  const confirmed = words.at(-1)?.text.toLowerCase() === 'confirm';
  const route = requireRoute(msg, joinWords(confirmed ? words.slice(0, -1) : words));
  if (!route) {
    return;
  }
  if (!confirmed) {
    whisper(msg.playerid, SCRIPT_NAME, [
      `<div>${escapeHtml(tr('messages.confirmRemove', { name: route.name, count: tokensOnRoute(route.id).length }))}</div>`,
      buildButton(tr('buttons.confirm'), cmd(`remove #${route.id} confirm`)),
    ]);
    return;
  }
  const stopped = deleteRoute(route.id);
  done(msg.playerid, 'routeRemoved', { name: route.name, count: stopped.length });
}

/**
 * `examples`: add v4's example routes that are missing.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandExamples(msg) {
  let added = 0;
  for (const example of EXAMPLE_ROUTES) {
    if (!findRoute(example.name)) {
      const fields = { name: example.name, kind: ROUTE_KIND_CODE, code: example.code };
      if (addRoute({ mode: defaultMode(fields), ...fields })) {
        added++;
      }
    }
  }
  done(msg.playerid, 'examplesAdded', { count: added });
  showMainMenu(msg.playerid);
}

/**
 * Builds the portable form of a route for export.
 *
 * @param {object} route Route record.
 * @returns {object} Export record.
 */
function exportRecord(route) {
  const { id, ...fields } = route;
  void id;
  return fields;
}

/**
 * `export [<route>]`: whisper routes as JSON for `import`.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandExport(msg, words) {
  let routes = listRoutes();
  if (words.length > 0) {
    const route = requireRoute(msg, joinWords(words));
    if (!route) {
      return;
    }
    routes = [route];
  }
  const json = JSON.stringify(routes.map(exportRecord));
  whisper(msg.playerid, tr('titles.export'), [
    `<div style="font-size:0.85em">${escapeHtml(tr('messages.exportHint', { command: `${COMMAND} import` }))}</div>`,
    `<div style="font-family:monospace;word-break:break-all;font-size:0.8em">${escapeHtml(json)}</div>`,
  ]);
}

/**
 * `import <json>`: add routes from `export` (or v4 `exportpaths`) output.
 *
 * @param {object} msg Chat message.
 * @param {string} raw JSON text.
 * @returns {void}
 */
function commandImport(msg, raw) {
  let data;
  try {
    // Roll20 escapes quotes in chat; undo that before parsing.
    data = JSON.parse(
      toText(raw).replaceAll('&quot;', '"').replaceAll('&#34;', '"').replaceAll('&amp;', '&')
    );
  } catch {
    fail(msg.playerid, 'badJson');
    return;
  }
  if (!Array.isArray(data)) {
    fail(msg.playerid, 'badJson');
    return;
  }
  let added = 0;
  let skipped = 0;
  for (const item of data) {
    if (!item || typeof item !== 'object' || findRoute(cleanName(item.name))) {
      skipped++;
      continue;
    }
    let fields = item;
    if (typeof item.path === 'string' && !item.kind) {
      // v4 exportpaths format.
      fields = {
        name: item.name,
        kind: ROUTE_KIND_CODE,
        code: item.path,
        mode: item.runOnce ? 'once' : item.isCycle ? 'loop' : 'pingpong',
        interval: item.intervalOverride,
        maxTokens: item.maxTokens,
        randomStart: item.randomStart === true,
      };
    }
    if (addRoute(fields)) {
      added++;
    } else {
      skipped++;
    }
  }
  done(msg.playerid, 'imported', { added, skipped });
}

// ---------------------------------------------------------------------------
// Token commands
// ---------------------------------------------------------------------------

/**
 * `start <route>`: put the selected tokens on a route.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandStart(msg, words) {
  const tokens = requireTokens(msg);
  const route = tokens && requireRoute(msg, joinWords(words));
  if (!tokens || !route) {
    return;
  }
  const started = [];
  const failures = {};
  let offPage = 0;
  for (const token of tokens) {
    const result = startPatrol(token, route);
    if (result.ok) {
      started.push(token);
      offPage = Math.max(offPage, result.offPage);
    } else {
      (failures[result.reason] ||= []).push(token);
    }
  }
  if (started.length > 0) {
    done(msg.playerid, 'started', { name: route.name, tokens: namesOf(started) });
  }
  if (offPage > 0) {
    whisperWarning(msg.playerid, tr('warnings.offPage', { count: offPage }));
  }
  for (const [reason, failed] of Object.entries(failures)) {
    fail(msg.playerid, reason, { tokens: namesOf(failed), name: route.name, max: route.maxTokens });
  }
}

/**
 * Returns the tokens a stop or reset applies to: the selection, a route's
 * tokens, or every patrolling token for `all`.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {string[]|null} Token IDs, or null after an error.
 */
function targetTokenIds(msg, words) {
  const text = joinWords(words);
  if (text.toLowerCase() === 'all') {
    return Object.keys(getPatrols());
  }
  if (text) {
    const route = requireRoute(msg, text);
    return route ? tokensOnRoute(route.id) : null;
  }
  const tokens = requireTokens(msg);
  return tokens ? tokens.map((tok) => tok.id) : null;
}

/**
 * `stop [<route>|all]`: take tokens off their routes and stop selected
 * tokens following.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandStop(msg, words) {
  const ids = targetTokenIds(msg, words);
  if (!ids) {
    return;
  }
  let count = 0;
  for (const id of ids) {
    const stopped = stopPatrol(id);
    const unfollowed = words.length === 0 && unfollow(id);
    if (stopped || unfollowed) {
      count++;
    }
  }
  done(msg.playerid, 'stopped', { count });
}

/**
 * `reset [<route>|all]`: return tokens to where they started and stop them.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandReset(msg, words) {
  const ids = targetTokenIds(msg, words);
  if (!ids) {
    return;
  }
  const count = ids.filter((id) => resetPatrol(id)).length;
  done(msg.playerid, 'reset', { count });
}

/**
 * `lock` / `unlock`.
 *
 * @param {object} msg Chat message.
 * @param {boolean} lock True to lock.
 * @returns {void}
 */
function commandLock(msg, lock) {
  const tokens = requireTokens(msg);
  if (!tokens) {
    return;
  }
  const changed = tokens.filter((tok) => {
    if (lock) {
      lockToken(tok);
      return true;
    }
    return unlockToken(tok);
  });
  done(msg.playerid, lock ? 'locked' : 'unlocked', {
    tokens: changed.length ? namesOf(changed) : tr('values.none'),
    mode: tr(`values.lockMode.${getConfig().lockMode}`),
  });
}

/**
 * `leader`: remember the selected token as the leader for `follow`.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandLeader(msg) {
  const tokens = requireTokens(msg);
  if (!tokens) {
    return;
  }
  if (tokens.length !== 1) {
    fail(msg.playerid, 'selectOneToken');
    return;
  }
  getState().leaders[msg.playerid] = tokens[0].id;
  done(msg.playerid, 'leaderSet', { token: tokenLabel(tokens[0]) });
}

/**
 * `follow [<leader>]`: make the selected tokens follow a leader, given by
 * name or ID, or the one set with `leader`. `follow <followerId> <leaderId>`
 * (the v4 form) also works.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandFollow(msg, words) {
  let followers = readSelection(msg).tokens;
  let leader = null;
  if (words.length === 2 && getObj('graphic', words[0].text) && getObj('graphic', words[1].text)) {
    followers = [getObj('graphic', words[0].text)];
    leader = getObj('graphic', words[1].text);
  } else if (words.length > 0) {
    leader = findToken(msg, joinWords(words));
    if (!leader) {
      fail(msg.playerid, 'leaderNotFound', { name: joinWords(words) });
      return;
    }
  } else {
    leader = getObj('graphic', getState().leaders[msg.playerid] || '');
    if (!leader) {
      fail(msg.playerid, 'noLeader');
      return;
    }
  }
  followers = followers.filter((tok) => tok.id !== leader.id);
  if (followers.length === 0) {
    fail(msg.playerid, 'noTokens');
    return;
  }
  const { started, skipped } = followLeader(followers, leader);
  if (started.length > 0) {
    done(msg.playerid, 'following', {
      tokens: namesOf(started),
      leader: tokenLabel(leader),
      mode: tr(`values.followMode.${getConfig().followMode}`),
    });
  }
  if (skipped.length > 0) {
    fail(msg.playerid, 'followLoop', { tokens: namesOf(skipped) });
  }
}

/**
 * `unfollow`: stop the selected tokens following.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandUnfollow(msg) {
  const tokens = requireTokens(msg);
  if (tokens) {
    const count = tokens.filter((tok) => unfollow(tok.id)).length;
    done(msg.playerid, 'unfollowed', { count });
  }
}

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

/**
 * `record …`: start a recording, or work on one.
 *
 *   record <name>                start recording the selected token
 *   record <tokenId> <name>      start recording a token (v4 `build`)
 *   record <ref> <dir> [cells]   move the token and record it
 *   record <ref> W | S           record a wait or a stealth toggle
 *   record <ref> undo|save|cancel
 *   record status                list recordings
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandRecord(msg, words) {
  if (words.length === 0 || (words.length === 1 && words[0].text.toLowerCase() === 'status')) {
    const recordings = Object.values(getRecordings());
    if (recordings.length === 0) {
      done(msg.playerid, 'noRecordings');
    }
    for (const rec of recordings) {
      showRecording(msg.playerid, rec);
    }
    return;
  }

  // An operation on an existing recording: the last word (or the one before a
  // number) is a direction or operation, and the rest names the recording.
  let opIndex = words.length - 1;
  let amount = null;
  if (words.length >= 3 && parseStrictInt(words.at(-1).text) !== null) {
    opIndex = words.length - 2;
    amount = parseStrictInt(words.at(-1).text);
  }
  const op = words[opIndex]?.text.toUpperCase();
  const isOp = op && (DIRECTIONS[op] || RECORD_OPS.includes(op.toLowerCase()));
  const recording =
    words.length >= 2 && isOp ? findRecording(joinWords(words.slice(0, opIndex))) : null;
  if (recording) {
    runRecordOp(msg, recording, op, amount);
    return;
  }

  const onlyRecording = words.length === 1 ? findRecording(words[0].text) : null;
  if (onlyRecording) {
    showRecording(msg.playerid, onlyRecording);
    return;
  }

  // Start a new recording.
  let token = null;
  let nameWords = words;
  const byId = getObj('graphic', words[0].text);
  if (isToken(byId) && words.length > 1) {
    token = byId;
    nameWords = words.slice(1);
  } else {
    const tokens = readSelection(msg).tokens;
    if (tokens.length !== 1) {
      fail(msg.playerid, 'selectOneToken');
      return;
    }
    [token] = tokens;
  }
  const name = checkNewName(msg, joinWords(nameWords));
  if (!name) {
    return;
  }
  if (getRecordingForToken(token.id)) {
    fail(msg.playerid, 'alreadyRecording', { token: tokenLabel(token) });
    return;
  }
  stopPatrol(token.id);
  unfollow(token.id);
  const created = addRecording(name, token.id, token.get('_pageid'), [
    Number(token.get('left')) || 0,
    Number(token.get('top')) || 0,
  ]);
  showRecording(msg.playerid, created);
}

/**
 * Runs one recording operation.
 *
 * @param {object} msg Chat message.
 * @param {object} recording Recording record.
 * @param {string} op Upper-case direction or operation.
 * @param {number|null} amount Cells to move.
 * @returns {void}
 */
function runRecordOp(msg, recording, op, amount) {
  const token = getObj('graphic', recording.tokenId);
  const recordings = getRecordings();
  if (op === 'CANCEL') {
    delete recordings[recording.id];
    done(msg.playerid, 'recordingCancelled', { name: recording.name });
    return;
  }
  if (!token) {
    delete recordings[recording.id];
    fail(msg.playerid, 'recordingTokenGone', { name: recording.name });
    return;
  }
  if (op === 'SAVE') {
    saveRecording(msg, recording);
    return;
  }
  if (op === 'UNDO') {
    recordUndo(recording, token);
  } else if (op === 'W') {
    recording.entries.push({ wait: 1 });
  } else if (op === 'S') {
    toggleStealth(token);
    recording.entries.push({ stealth: true });
  } else {
    const cells = Math.min(Math.max(amount ?? getConfig().buttonStep, 1), 20);
    recordStep(recording, token, op, cells);
  }
  showRecording(msg.playerid, recording);
}

/**
 * Saves a recording as a route.
 *
 * @param {object} msg Chat message.
 * @param {object} recording Recording record.
 * @returns {void}
 */
function saveRecording(msg, recording) {
  const ctx = getPageContext(recording.pageId);
  const result = ctx ? recordingToRoute(recording.entries, ctx.grid) : null;
  if (!result) {
    fail(msg.playerid, 'recordingEmpty');
    return;
  }
  const name = checkNewName(msg, recording.name);
  if (!name) {
    return;
  }
  const fields =
    result.kind === 'code'
      ? { name, kind: ROUTE_KIND_CODE, code: result.code }
      : { name, kind: ROUTE_KIND_WAYPOINTS, anchor: ANCHOR_TOKEN, points: result.points };
  if (createRoute(msg, fields)) {
    delete getRecordings()[recording.id];
  }
}

// ---------------------------------------------------------------------------
// Settings, status and tools
// ---------------------------------------------------------------------------

/**
 * `set [<setting> <value>]`.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandSet(msg, words) {
  if (words.length === 0) {
    showSettings(msg.playerid);
    return;
  }
  const key = Object.keys(DEFAULT_CONFIG).find(
    (k) => k.toLowerCase() === words[0].text.toLowerCase()
  );
  if (!key) {
    fail(msg.playerid, 'unknownSetting', { key: words[0].text });
    return;
  }
  if (words.length === 1) {
    if (key === 'language') {
      done(msg.playerid, 'languages', { list: SUPPORTED_LOCALES.join(', ') });
    } else {
      showSettings(msg.playerid);
    }
    return;
  }
  const raw = joinWords(words.slice(1));
  const result = setConfigValue(key, raw);
  if (!result.valid) {
    fail(msg.playerid, 'badSettingValue', { key, value: raw });
    return;
  }
  clearTrackCache();
  if (key === 'language') {
    installHandouts();
  }
  done(msg.playerid, 'settingChanged', {
    setting: tr(`settings.${key}.label`),
    value: formatValue(key, result.value),
  });
}

/**
 * `combat [on|off]`: switch combat on or off by hand.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandCombat(msg, words) {
  const value = words[0]?.text.toLowerCase();
  const combat = getState().combat;
  combat.manual = value === 'on' ? true : value === 'off' ? false : !combat.manual;
  if (getConfig().combatDetection === 'tracker') {
    whisperWarning(msg.playerid, tr('warnings.combatTrackerOnly'));
  }
  done(msg.playerid, combat.manual ? 'combatOn' : 'combatOff');
}

/**
 * `list [routes|tokens]`.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandList(msg, words) {
  const what = words[0]?.text.toLowerCase();
  if (what !== 'tokens') {
    const rows = listRoutes().map((route) =>
      buildRow(route.name, `<code>${escapeHtml(describeRoute(route))}</code>`)
    );
    whisper(msg.playerid, tr('titles.routes'), rows.length ? rows : tr('menu.noRoutes'));
    return;
  }
  const filter = words.length > 1 ? findRoute(joinWords(words.slice(1))) : null;
  const s = getState();
  const rows = [];
  for (const [tokenId, patrol] of Object.entries(s.patrols)) {
    if (filter && patrol.routeId !== filter.id) {
      continue;
    }
    rows.push(
      buildRow(
        tokenLabel(getObj('graphic', tokenId), tokenId),
        escapeHtml(s.routes[patrol.routeId]?.name || '?')
      )
    );
  }
  for (const [tokenId, follow] of Object.entries(s.follows)) {
    rows.push(
      buildRow(
        tokenLabel(getObj('graphic', tokenId), tokenId),
        escapeHtml(
          tr('values.following', {
            leader: tokenLabel(getObj('graphic', follow.leaderId), follow.leaderId),
          })
        )
      )
    );
  }
  for (const tokenId of Object.keys(s.locks)) {
    rows.push(
      buildRow(tokenLabel(getObj('graphic', tokenId), tokenId), escapeHtml(tr('values.locked')))
    );
  }
  whisper(msg.playerid, tr('titles.tokens'), rows.length ? rows : escapeHtml(tr('values.none')));
}

/**
 * `status`: what the Mod is doing and how it sees the current page's grid.
 *
 * @param {object} msg Chat message.
 * @returns {void}
 */
function commandStatus(msg) {
  const s = getState();
  const pageId = getPlayerPageId(msg.playerid);
  const ctx = getPageContext(pageId);
  const lines = [
    buildRow(tr('status.routes'), String(Object.keys(s.routes).length)),
    buildRow(tr('status.patrols'), String(Object.keys(s.patrols).length)),
    buildRow(tr('status.followers'), String(Object.keys(getFollows()).length)),
    buildRow(tr('status.locked'), String(Object.keys(getLocks()).length)),
    buildRow(tr('status.recordings'), String(Object.keys(s.recordings).length)),
    buildRow(tr('status.paused'), escapeHtml(tr(s.paused ? 'values.on' : 'values.off'))),
    buildRow(tr('status.combat'), escapeHtml(tr(isCombatActive() ? 'values.on' : 'values.off'))),
    buildRow(
      tr('settings.interval.label'),
      escapeHtml(formatValue('interval', getConfig().interval))
    ),
  ];
  if (ctx) {
    const grid = ctx.grid;
    const cell =
      grid.kind === 'hex'
        ? `${grid.colStep.toFixed(1)} × ${grid.rowStep.toFixed(1)}`
        : grid.kind === 'iso'
          ? `${grid.width.toFixed(1)} × ${grid.height.toFixed(1)}`
          : grid.unit.toFixed(1);
    lines.push(
      buildDivider(),
      buildRow(tr('status.page'), escapeHtml(toText(ctx.page.get('name')))),
      buildRow(
        tr('status.grid'),
        escapeHtml(
          tr(`values.grid.${grid.kind}`) + (grid.snap ? '' : ` (${tr('values.gridless')})`)
        )
      ),
      buildRow(tr('status.cell'), escapeHtml(`${cell} px`)),
      buildRow(
        tr('status.calibration'),
        escapeHtml(getCalibration(pageId) ? tr('values.on') : tr('values.off'))
      )
    );
  }
  whisper(msg.playerid, tr('titles.status'), lines);
}

/**
 * `calibrate` / `calibrate reset`: line the grid up with tokens snapped to
 * cell centres on the current page.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Arguments.
 * @returns {void}
 */
function commandCalibrate(msg, words) {
  const { tokens } = readSelection(msg);
  const pageId = tokens[0]?.get('_pageid') || getPlayerPageId(msg.playerid);
  const page = getObj('page', pageId);
  if (!page) {
    fail(msg.playerid, 'noPage');
    return;
  }
  if (words[0]?.text.toLowerCase() === 'reset') {
    setCalibration(pageId, null);
    clearTrackCache();
    done(msg.playerid, 'calibrationCleared');
    return;
  }
  if (tokens.length === 0) {
    fail(msg.playerid, 'calibrateNeedsTokens');
    return;
  }
  const points = tokens.slice(0, 2).map((tok) => [Number(tok.get('left')), Number(tok.get('top'))]);
  const calibration = calibrateGrid(pageGridOptions(page), points);
  if (!calibration) {
    fail(msg.playerid, 'calibrateFailed');
    return;
  }
  setCalibration(pageId, calibration);
  clearTrackCache();
  done(msg.playerid, 'calibrated', { scale: calibration.scale.toFixed(3) });
}

/**
 * `pause` / `resume`: stop or restart every patrol at once.
 *
 * @param {object} msg Chat message.
 * @param {boolean} paused True to pause.
 * @returns {void}
 */
function commandPause(msg, paused) {
  getState().paused = paused;
  done(msg.playerid, paused ? 'paused' : 'resumed');
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/**
 * Runs a command.
 *
 * @param {object} msg Chat message.
 * @param {object[]} words Words after the prefix.
 * @param {string} rawRest Raw text after the subcommand (for import).
 * @returns {void}
 */
function routeCommand(msg, words, rawRest) {
  const [first, ...args] = words;
  const sub = first ? first.text.toLowerCase() : 'menu';
  switch (sub) {
    case 'menu':
      showMainMenu(msg.playerid);
      break;
    case 'help':
      showHelp(msg.playerid);
      break;
    case 'start':
      commandStart(msg, args);
      break;
    case 'stop':
      commandStop(msg, args);
      break;
    case 'reset':
      commandReset(msg, args);
      break;
    case 'pause':
      commandPause(msg, true);
      break;
    case 'resume':
      commandPause(msg, false);
      break;
    case 'lock':
      commandLock(msg, true);
      break;
    case 'unlock':
      commandLock(msg, false);
      break;
    case 'leader':
      commandLeader(msg);
      break;
    case 'follow':
      commandFollow(msg, args);
      break;
    case 'unfollow':
      commandUnfollow(msg);
      break;
    case 'add':
      commandAdd(msg, args);
      break;
    case 'edit':
      commandEdit(msg, args);
      break;
    case 'draw':
      commandDraw(msg, args);
      break;
    case 'record':
      commandRecord(msg, args);
      break;
    case 'route':
      commandRouteOption(msg, args);
      break;
    case 'show': {
      const route = requireRoute(msg, joinWords(args));
      if (route) {
        showRoute(msg.playerid, route);
      }
      break;
    }
    case 'rename':
      commandRename(msg, args);
      break;
    case 'copy':
      commandCopy(msg, args);
      break;
    case 'remove':
      commandRemove(msg, args);
      break;
    case 'list':
      commandList(msg, args);
      break;
    case 'examples':
      commandExamples(msg);
      break;
    case 'export':
      commandExport(msg, args);
      break;
    case 'import':
      commandImport(msg, rawRest);
      break;
    case 'combat':
      commandCombat(msg, args);
      break;
    case 'set':
      commandSet(msg, args);
      break;
    case 'calibrate':
      commandCalibrate(msg, args);
      break;
    case 'status':
      commandStatus(msg);
      break;
    case 'journal':
      installHandouts();
      done(msg.playerid, 'journalRebuilt', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME });
      break;
    case 'unitpx':
      whisperWarning(msg.playerid, tr('warnings.unitPx'));
      break;
    default:
      fail(msg.playerid, 'unknownCommand', { command: first.text });
  }
}

/**
 * Handles a chat message, routing TokenController commands.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const content = toText(msg.content);
  const prefix = content.split(/\s+/)[0].toLowerCase();
  const legacy = LEGACY_PREFIXES.includes(prefix);
  if (prefix !== COMMAND && !legacy) {
    return;
  }
  if (!playerIsGM(msg.playerid)) {
    fail(msg.playerid, 'gmOnly');
    return;
  }
  try {
    const afterPrefix = content.slice(prefix.length);
    let words = tokenize(afterPrefix);
    if (legacy) {
      words = translateLegacy(words).words;
    }
    // Text after the subcommand, untouched, for JSON imports.
    const rawRest = afterPrefix.trim().replace(/^\S+\s*/, '');
    routeCommand(msg, words, rawRest);
  } catch (err) {
    log(`${SCRIPT_NAME} ERROR handling "${content}": ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
    fail(msg.playerid, 'internal');
  }
}
