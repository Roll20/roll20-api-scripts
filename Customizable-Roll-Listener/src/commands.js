// Chat commands (!crl ...), the chat menus, and the version 1 command syntax.

import { resetFires } from './actions.js';
import {
  buildButton,
  buildCode,
  buildDivider,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
  whisperError,
  whisperWarning,
} from './chat.js';
import {
  COLOR_MUTED,
  COLOR_OFF,
  COLOR_OK,
  COMMAND,
  DEFAULT_LISTENER,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  LISTENER_SPEAKER_OPTIONS,
  MAX_NAME_LENGTH,
  MAX_TEXT_TERMS,
  MESSAGE_TYPES,
  RESULT_ALIASES,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  SPEAKER_OPTIONS,
} from './constants.js';
import { LOCALE_LABELS, SUPPORTED_LOCALES, t } from './i18n.js';
import { installHandouts } from './journals.js';
import { isLegacyCommand, parseLegacyCommand } from './legacy.js';
import { setInspector, testListener } from './listen.js';
import { findInvalidTerm, parseComparison, parseDice } from './match.js';
import {
  deleteListener,
  getConfig,
  getListener,
  getListeners,
  moveListener,
  normaliseListener,
  parseCooldown,
  putListener,
  setConfigValue,
} from './state.js';
import {
  createListenerAbility,
  getCommands,
  getStoreLink,
  mirrorRules,
  prepareStoreCharacter,
  removeAbility,
  renameAbility,
  setCommands,
} from './store.js';
import { escapeHtml, parseBoolean, splitList, toText } from './utils.js';

// Option names accepted after "--", mapped to listener fields.
const OPTION_KEYS = {
  name: 'name',
  rename: 'name',
  template: 'templates',
  templates: 'templates',
  type: 'types',
  types: 'types',
  text: 'text',
  regex: 'regex',
  mode: 'regex',
  who: 'who',
  character: 'who',
  characters: 'who',
  speaker: 'speaker',
  as: 'speaker',
  sendas: 'speaker',
  player: 'players',
  players: 'players',
  result: 'results',
  results: 'results',
  roll: 'results',
  total: 'total',
  natural: 'natural',
  nat: 'natural',
  dice: 'dice',
  die: 'dice',
  cooldown: 'cooldown',
  stop: 'stop',
  enabled: 'enabled',
};

// Fields shown on a listener's card, in order.
const LISTENER_ROWS = [
  'enabled',
  'templates',
  'types',
  'text',
  'regex',
  'who',
  'players',
  'results',
  'total',
  'natural',
  'dice',
  'cooldown',
  'stop',
  'speaker',
];

// Typed as a value, these clear a list or comparison.
const CLEAR_VALUES = new Set(['', '-', 'clear', 'any']);

/**
 * Translates a key in the active locale.
 *
 * @param {string} key Translation key.
 * @param {object} [vars] Interpolation variables.
 * @returns {string} Translated text.
 */
function tr(key, vars) {
  return t(key, getConfig().language, vars);
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
  const hint = t(`hints.${key}`, getConfig().language, vars);
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
 * Makes text safe inside a Roll20 ?{query}.
 *
 * @param {string} text Text.
 * @returns {string} Text without query syntax characters.
 */
function queryText(text) {
  return String(text).replaceAll(/[|{},]/g, ' ');
}

/**
 * Builds a free-text Roll20 query.
 *
 * @param {string} promptKey Key under `prompts.`.
 * @returns {string} Query.
 */
function textQuery(promptKey) {
  return `?{${queryText(tr(`prompts.${promptKey}`))}|}`;
}

/**
 * Builds a drop-down Roll20 query.
 *
 * @param {string} promptKey Key under `prompts.`.
 * @param {[string, string][]} options Label/value pairs.
 * @returns {string} Query.
 */
function choiceQuery(promptKey, options) {
  const list = options.map(([label, value]) => `${queryText(label)},${value}`).join('|');
  return `?{${queryText(tr(`prompts.${promptKey}`))}|${list}}`;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Puts back what Roll20 processed before CRL saw the command: inline rolls
 * become their [[expression]] again, and a roll template is restored, so a
 * listener's commands can contain them.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {string} Command text.
 */
export function restoreCommandText(msg) {
  let content = toText(msg.content).replaceAll(/\$\[\[(\d+)\]\]/g, (marker, index) => {
    const expression = msg.inlinerolls?.[Number(index)]?.expression;
    return expression ? `[[${expression}]]` : marker;
  });
  const template = toText(msg.rolltemplate);
  if (template && !content.includes('&{template:')) {
    const at = content.indexOf('{{');
    if (at >= 0) {
      content = `${content.slice(0, at)}&{template:${template}} ${content.slice(at)}`;
    }
  }
  return content;
}

/**
 * Splits "!crl <sub> <target> --option value ... --commands rest".
 *
 * @param {string} text Text after "!crl".
 * @returns {{sub: string, target: string, options: object, commands: string|null,
 *            unknown: string[]}} Parsed parts.
 */
export function parseArguments(text) {
  let body = String(text);
  let commands = null;
  const commandsAt = /(^|\s)--(?:commands|command|do)(?=\s|$)/i.exec(body);
  if (commandsAt) {
    commands = body.slice(commandsAt.index + commandsAt[0].length).trim();
    body = body.slice(0, commandsAt.index);
  }
  const [head, ...pieces] = body.split(/(?:^|\s)--(?=[a-z])/i);
  const options = {};
  const unknown = [];
  for (const piece of pieces) {
    const match = /^([a-z]+)\s*([\s\S]*)$/i.exec(piece.trim());
    const key = match ? OPTION_KEYS[match[1].toLowerCase()] : null;
    if (key) {
      options[key] = match[2].trim();
    } else if (match) {
      unknown.push(match[1]);
    }
  }
  const trimmed = head.trim();
  const sub = trimmed.split(/\s+/, 1)[0] || '';
  return {
    sub: sub.toLowerCase(),
    target: trimmed.slice(sub.length).trim(),
    options,
    commands,
    unknown,
  };
}

/**
 * Splits commands typed in chat into lines: "\\" separates lines, as in
 * version 1, and so do real line breaks.
 *
 * @param {string} text Commands text.
 * @returns {string} Commands, one per line.
 */
export function commandLines(text) {
  return String(text)
    .split(/\s*\\\\\s*|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Finds a listener by ability ID or (case-insensitive) name.
 *
 * @param {string} target ID or name.
 * @returns {{id: string, listener: object}|null} Listener.
 */
function findListener(target) {
  const text = toText(target);
  if (!text) {
    return null;
  }
  const byId = getListener(text);
  if (byId) {
    return { id: text, listener: byId };
  }
  const lower = text.toLowerCase();
  return getListeners().find(({ listener }) => listener.name.toLowerCase() === lower) || null;
}

/**
 * Checks a listener name.
 *
 * @param {string} name Proposed name.
 * @param {string|null} ownId The listener being renamed, if any.
 * @returns {string|null} Error key, or null when the name is fine.
 */
function nameProblem(name, ownId) {
  if (!name) {
    return 'nameRequired';
  }
  if (
    name.length > MAX_NAME_LENGTH ||
    name.startsWith('-') ||
    name.includes('--') ||
    /[|{}\\[\]@%#?~\r\n]/.test(name)
  ) {
    return 'nameInvalid';
  }
  const lower = name.toLowerCase();
  const taken = getListeners().some(
    ({ id, listener }) => id !== ownId && listener.name.toLowerCase() === lower
  );
  return taken ? 'nameTaken' : null;
}

/**
 * Applies typed options to a copy of a listener.
 *
 * @param {object} base Listener rules.
 * @param {object} options Options from parseArguments.
 * @param {string|null} ownId Listener ID when editing.
 * @returns {{listener: object, errors: {key: string, vars: object}[]}} The
 *          updated copy and any problems.
 */
export function applyOptions(base, options, ownId) {
  const next = { ...base };
  const errors = [];
  const problem = (key, vars = {}) => errors.push({ key, vars });
  const cleared = (value) => CLEAR_VALUES.has(toText(value).toLowerCase());

  if ('name' in options) {
    const name = toText(options.name);
    const err = nameProblem(name, ownId);
    if (err) {
      problem(err, { name, max: MAX_NAME_LENGTH });
    } else {
      next.name = name;
    }
  }
  if ('regex' in options) {
    const value = parseBoolean(options.regex);
    if (value === null) {
      problem('badOnOff', { option: 'regex', value: options.regex });
    } else {
      next.regex = value;
    }
  }
  if ('templates' in options) {
    next.templates = cleared(options.templates) ? [] : splitList(options.templates);
  }
  if ('types' in options) {
    const types = cleared(options.types) ? [] : splitList(options.types.toLowerCase());
    const bad = types.filter((type) => !MESSAGE_TYPES.includes(type));
    if (bad.length > 0) {
      problem('badType', { value: bad.join(', '), types: MESSAGE_TYPES.join(', ') });
    } else {
      next.types = types;
    }
  }
  if ('text' in options) {
    const terms =
      cleared(options.text) && toText(options.text) !== 'any'
        ? []
        : toText(options.text)
            .split(/\s*&&\s*/)
            .map((term) => term.trim())
            .filter(Boolean);
    const invalid = next.regex ? findInvalidTerm(terms) : null;
    if (terms.length > MAX_TEXT_TERMS) {
      problem('tooManyTerms', { max: MAX_TEXT_TERMS });
    } else if (invalid) {
      problem('badRegex', invalid);
    } else {
      next.text = terms;
    }
  } else if ('regex' in options && next.regex) {
    const invalid = findInvalidTerm(next.text);
    if (invalid) {
      problem('badRegex', invalid);
    }
  }
  for (const key of ['who', 'players']) {
    if (key in options) {
      next[key] = cleared(options[key]) ? [] : splitList(options[key], /\s*,\s*/);
    }
  }
  if ('results' in options) {
    const words = cleared(options.results) ? [] : splitList(options.results.toLowerCase());
    const bad = words.filter((word) => !RESULT_ALIASES[word]);
    if (bad.length > 0) {
      problem('badResult', { value: bad.join(', ') });
    } else {
      next.results = [...new Set(words.map((word) => RESULT_ALIASES[word]))];
    }
  }
  for (const key of ['total', 'natural']) {
    if (key in options) {
      if (cleared(options[key])) {
        next[key] = '';
      } else {
        const parsed = parseComparison(options[key]);
        if (parsed) {
          next[key] = parsed.text;
        } else {
          problem('badComparison', { option: key, value: options[key] });
        }
      }
    }
  }
  if ('dice' in options) {
    const dice = parseDice(options.dice);
    if (dice === null) {
      problem('badDice', { value: options.dice });
    } else {
      next.dice = String(dice);
    }
  }
  if ('cooldown' in options) {
    const cooldown = parseCooldown(options.cooldown);
    if (cooldown === null) {
      problem('badCooldown', { value: options.cooldown });
    } else {
      next.cooldown = cooldown;
    }
  }
  for (const key of ['stop', 'enabled']) {
    if (key in options) {
      const value = parseBoolean(options[key]);
      if (value === null) {
        problem('badOnOff', { option: key, value: options[key] });
      } else {
        next[key] = value;
      }
    }
  }
  if ('speaker' in options) {
    const value = toText(options.speaker).toLowerCase();
    if (LISTENER_SPEAKER_OPTIONS.includes(value)) {
      next.speaker = value;
    } else {
      problem('badSpeaker', { value: options.speaker });
    }
  }
  return { listener: normaliseListener(next), errors };
}

/**
 * Whispers every problem found in a command.
 *
 * @param {string} playerId Player ID.
 * @param {{key: string, vars: object}[]} errors Problems.
 * @returns {void}
 */
function reportErrors(playerId, errors) {
  for (const { key, vars } of errors) {
    fail(playerId, key, vars);
  }
}

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

/**
 * Formats a listener field for display.
 *
 * @param {object} listener Listener rules.
 * @param {string} key Field.
 * @returns {string} Display text.
 */
function formatField(listener, key) {
  const value = listener[key];
  switch (key) {
    case 'enabled':
    case 'stop':
      return tr(value ? 'values.on' : 'values.off');
    case 'regex':
      return tr(value ? 'values.regex' : 'values.plain');
    case 'text':
      return value.length > 0 ? value.join(' && ') : tr('values.any');
    case 'results':
      return value.length > 0 ? value.map((r) => tr(`results.${r}`)).join(', ') : tr('values.any');
    case 'types':
      return value.length > 0 ? value.join(', ') : tr('values.allButApi');
    case 'dice':
      return value === 'auto'
        ? tr('values.diceAuto')
        : value === 'any'
          ? tr('values.diceAny')
          : `d${value}`;
    case 'cooldown':
      return value > 0 ? tr('values.seconds', { seconds: value }) : tr('values.off');
    case 'speaker':
      return tr(`values.speaker.${value}`);
    default:
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : tr('values.any');
      }
      return toText(value) || tr('values.any');
  }
}

/**
 * Returns the command a listener card's Change button runs for a field.
 *
 * @param {string} id Listener ID.
 * @param {object} listener Listener rules.
 * @param {string} key Field.
 * @returns {string} Command.
 */
function changeCommand(id, listener, key) {
  const edit = (option, value) => `${COMMAND} edit ${id} --${option} ${value}`;
  switch (key) {
    case 'enabled':
      return edit('enabled', listener.enabled ? 'off' : 'on');
    case 'stop':
      return edit('stop', listener.stop ? 'off' : 'on');
    case 'regex':
      return edit(
        'regex',
        choiceQuery('regex', [
          [tr('values.plain'), 'off'],
          [tr('values.regex'), 'on'],
        ])
      );
    case 'results':
      return edit(
        'results',
        choiceQuery('results', [
          [tr('values.any'), '-'],
          [tr('results.crit'), 'crit'],
          [tr('results.fumble'), 'fumble'],
          [tr('choices.critOrFumble'), 'crit fumble'],
          [tr('results.success'), 'success'],
          [tr('results.fail'), 'fail'],
        ])
      );
    case 'dice':
      return edit(
        'dice',
        choiceQuery('dice', [
          [tr('values.diceAuto'), 'auto'],
          [tr('values.diceAny'), 'any'],
          ...[20, 100, 12, 10, 8, 6, 4].map((n) => [`d${n}`, String(n)]),
        ])
      );
    case 'speaker':
      return edit(
        'speaker',
        choiceQuery(
          'speaker',
          LISTENER_SPEAKER_OPTIONS.map((value) => [tr(`values.speaker.${value}`), value])
        )
      );
    default:
      return edit(key, textQuery(key));
  }
}

/**
 * Whispers the main menu: global switch and the list of listeners.
 *
 * @param {string|null} playerId Player ID.
 * @returns {void}
 */
export function showMainMenu(playerId) {
  const config = getConfig();
  const lines = [
    buildRow(
      tr('menu.listening'),
      buildSecondaryButton(
        tr(config.enabled ? 'values.on' : 'values.off'),
        `${COMMAND} ${config.enabled ? 'off' : 'on'}`
      )
    ),
    buildSectionLabel(tr('menu.listeners')),
  ];
  const listeners = getListeners();
  if (listeners.length === 0) {
    lines.push(`<div style="color:${COLOR_MUTED}">${escapeHtml(tr('menu.noListeners'))}</div>`);
  }
  for (const { id, listener } of listeners) {
    const colour = listener.enabled ? COLOR_OK : COLOR_OFF;
    const label = `<span style="color:${colour}">●</span> ${escapeHtml(listener.name)}`;
    lines.push(
      [
        '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
        `<td>${label}</td>`,
        '<td style="text-align:right;white-space:nowrap">',
        buildSecondaryButton(tr('buttons.edit'), `${COMMAND} show ${id}`),
        buildSecondaryButton(
          tr(listener.enabled ? 'buttons.disable' : 'buttons.enable'),
          `${COMMAND} ${listener.enabled ? 'disable' : 'enable'} ${id}`
        ),
        buildSecondaryButton('▲', `${COMMAND} up ${id}`),
        buildSecondaryButton('▼', `${COMMAND} down ${id}`),
        '</td></tr></table>',
      ].join('')
    );
  }
  lines.push(buildDivider());
  lines.push(
    [
      buildButton(tr('buttons.new'), `${COMMAND} new ${textQuery('newName')}`),
      buildButton(tr('buttons.inspect'), `${COMMAND} inspect`),
      buildSecondaryButton(tr('buttons.settings'), `${COMMAND} config`),
      buildSecondaryButton(tr('buttons.help'), `${COMMAND} help`),
    ].join('')
  );
  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
}

/**
 * Whispers a listener's card.
 *
 * @param {string|null} playerId Player ID.
 * @param {string} id Listener ID.
 * @returns {void}
 */
export function showListener(playerId, id) {
  const listener = getListener(id);
  if (!listener) {
    showMainMenu(playerId);
    return;
  }
  const lines = [];
  for (const key of LISTENER_ROWS) {
    lines.push(
      buildRow(
        tr(`fields.${key}`),
        `${escapeHtml(formatField(listener, key))} ${buildSecondaryButton(tr('buttons.change'), changeCommand(id, listener, key))}`
      )
    );
  }
  // Roll20 silently drops very long chat messages, so the card is sent in
  // two parts: the rules, then the commands and actions.
  whisper(playerId, tr('titles.listener', { name: listener.name }), lines);
  lines.length = 0;
  const commands = getCommands(id);
  lines.push(
    commands
      ? buildCode(commands)
      : `<div style="color:${COLOR_MUTED}">${escapeHtml(tr('menu.noCommands'))}</div>`
  );
  const link = getStoreLink();
  lines.push(
    [
      buildSecondaryButton(
        tr('buttons.setCommands'),
        `${COMMAND} edit ${id} --commands ${textQuery('commands')}`
      ),
      link ? buildSecondaryButton(tr('buttons.openJournal'), link) : '',
    ].join('')
  );
  lines.push(
    `<div style="font-size:0.85em;color:${COLOR_MUTED}">${escapeHtml(tr('menu.commandsHint'))}</div>`
  );
  lines.push(buildDivider());
  lines.push(
    [
      buildButton(tr('buttons.test'), `${COMMAND} test ${id}`),
      buildSecondaryButton(
        tr('buttons.rename'),
        `${COMMAND} edit ${id} --name ${textQuery('name')}`
      ),
      buildSecondaryButton(tr('buttons.delete'), `${COMMAND} delete ${id}`),
      buildSecondaryButton(tr('buttons.back'), COMMAND),
    ].join('')
  );
  whisper(playerId, tr('titles.listenerCommands', { name: listener.name }), lines);
}

/**
 * Whispers the global settings.
 *
 * @param {string|null} playerId Player ID.
 * @returns {void}
 */
function showConfig(playerId) {
  const config = getConfig();
  const row = (key, value, command) =>
    buildRow(
      tr(`settings.${key}.label`),
      `${escapeHtml(value)} ${buildSecondaryButton(tr('buttons.change'), command)}`
    );
  const lines = [
    row(
      'enabled',
      tr(config.enabled ? 'values.on' : 'values.off'),
      `${COMMAND} config enabled ${config.enabled ? 'off' : 'on'}`
    ),
    row(
      'speaker',
      tr(`values.speaker.${config.speaker}`),
      `${COMMAND} config speaker ${choiceQuery(
        'speaker',
        SPEAKER_OPTIONS.map((value) => [tr(`values.speaker.${value}`), value])
      )}`
    ),
    row(
      'listenToMods',
      tr(config.listenToMods ? 'values.on' : 'values.off'),
      `${COMMAND} config listenToMods ${config.listenToMods ? 'off' : 'on'}`
    ),
    row(
      'language',
      LOCALE_LABELS[config.language] || config.language,
      `${COMMAND} config language ?{${queryText(tr('settings.language.label'))}|${SUPPORTED_LOCALES.join('|')}}`
    ),
  ];
  for (const key of ['enabled', 'speaker', 'listenToMods', 'language']) {
    lines.push(
      `<div style="font-size:0.8em;color:${COLOR_MUTED}">${escapeHtml(tr(`settings.${key}.label`))}: ${escapeHtml(tr(`settings.${key}.desc`))}</div>`
    );
  }
  lines.push(buildDivider());
  lines.push(
    [
      buildSecondaryButton(tr('buttons.rebuildJournal'), `${COMMAND} journal`),
      buildSecondaryButton(tr('buttons.back'), COMMAND),
    ].join('')
  );
  whisper(playerId, tr('titles.settings'), lines);
}

/**
 * Whispers the command reference.
 *
 * @param {string|null} playerId Player ID.
 * @returns {void}
 */
function showHelp(playerId) {
  const rows = [
    ['', 'menu'],
    ['new <name> [--option value]', 'new'],
    ['show <name>', 'show'],
    ['edit <name> --option value', 'edit'],
    ['edit <name> --commands …', 'commands'],
    ['enable <name> / disable <name>', 'enable'],
    ['up <name> / down <name>', 'move'],
    ['test <name>', 'test'],
    ['delete <name>', 'delete'],
    ['inspect', 'inspect'],
    ['on / off', 'onOff'],
    ['config [setting value]', 'config'],
    ['journal', 'journal'],
    ['help', 'help'],
  ];
  const lines = rows.map(
    ([cmd, key]) =>
      `<div><code>${escapeHtml(`${COMMAND} ${cmd}`.trim())}</code><br><span style="font-size:0.9em;color:${COLOR_MUTED}">${escapeHtml(tr(`help.${key}`))}</span></div>`
  );
  lines.push(buildSectionLabel(tr('help.optionsTitle')));
  lines.push(
    `<div style="font-size:0.9em">${escapeHtml(tr('help.options'))}</div>`,
    `<div style="font-size:0.9em;margin-top:3px">${escapeHtml(tr('help.placeholders'))}</div>`,
    `<div style="font-size:0.9em;margin-top:3px">${escapeHtml(tr('help.handouts', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`
  );
  whisper(playerId, tr('titles.help'), lines);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Creates a listener.
 *
 * @param {string} playerId Player ID.
 * @param {string} name Listener name.
 * @param {object} options Options.
 * @param {string|null} commands Commands text.
 * @returns {string|null} New listener ID.
 */
function createListener(playerId, name, options, commands) {
  const { listener, errors } = applyOptions({ ...DEFAULT_LISTENER }, { ...options, name }, null);
  if (errors.length > 0) {
    reportErrors(playerId, errors);
    return null;
  }
  const ability = createListenerAbility(listener.name, commands ? commandLines(commands) : '');
  if (!ability) {
    fail(playerId, 'noStore');
    return null;
  }
  putListener(ability.id, listener);
  mirrorRules(ability.id);
  showListener(playerId, ability.id);
  return ability.id;
}

/**
 * Changes a listener.
 *
 * @param {string} playerId Player ID.
 * @param {string} id Listener ID.
 * @param {object} options Options.
 * @param {string|null} commands Commands text, or null to keep them.
 * @param {boolean} [show=true] Show the listener's card afterwards.
 * @returns {boolean} True when saved.
 */
function editListener(playerId, id, options, commands, show = true) {
  const current = getListener(id);
  const { listener, errors } = applyOptions(current, options, id);
  if (errors.length > 0) {
    reportErrors(playerId, errors);
    return false;
  }
  if (listener.name !== current.name) {
    renameAbility(id, listener.name);
  }
  if (commands !== null) {
    setCommands(id, commandLines(commands));
  }
  if (!listener.enabled || listener.cooldown !== current.cooldown) {
    resetFires(id);
  }
  putListener(id, listener);
  mirrorRules(id);
  if (show) {
    showListener(playerId, id);
  }
  return true;
}

/**
 * Deletes a listener and its ability.
 *
 * @param {string} id Listener ID.
 * @returns {void}
 */
function removeListener(id) {
  removeAbility(id);
  deleteListener(id);
  resetFires(id);
}

/**
 * Changes a global setting from chat.
 *
 * @param {string} playerId Player ID.
 * @param {string} key Setting key as typed.
 * @param {string} value Value.
 * @returns {void}
 */
function changeConfig(playerId, key, value) {
  const keys = {
    enabled: 'enabled',
    speaker: 'speaker',
    listentomods: 'listenToMods',
    language: 'language',
  };
  const setting = keys[key.toLowerCase()];
  if (!setting) {
    fail(playerId, 'badSetting', { key, keys: Object.values(keys).join(', ') });
    return;
  }
  if (!value && setting === 'language') {
    whisper(
      playerId,
      tr('titles.languages'),
      SUPPORTED_LOCALES.map((code) =>
        buildSecondaryButton(LOCALE_LABELS[code], `${COMMAND} config language ${code}`)
      )
    );
    return;
  }
  if (!setConfigValue(setting, value)) {
    fail(playerId, 'badSettingValue', { key: setting, value });
    return;
  }
  if (setting === 'language') {
    installHandouts();
    prepareStoreCharacter();
  }
  showConfig(playerId);
}

/**
 * Runs a version 1 command.
 *
 * @param {string} playerId Player ID.
 * @param {string} content Restored command text.
 * @returns {void}
 */
function routeLegacy(playerId, content) {
  const parsed = parseLegacyCommand(content);
  if (!parsed) {
    showHelp(playerId);
    return;
  }
  const found = findListener(parsed.name);
  switch (parsed.action) {
    case 'create':
      if (!parsed.name) {
        fail(playerId, 'nameRequired');
      } else if (found) {
        fail(playerId, 'nameTaken', { name: parsed.name });
      } else {
        createListener(playerId, parsed.name, parsed.options, parsed.commands);
      }
      return;
    case 'edit':
      if (!found) {
        fail(playerId, 'notFound', { name: parsed.name });
      } else {
        editListener(playerId, found.id, parsed.options, parsed.commands);
      }
      return;
    case 'delete':
      if (!found) {
        fail(playerId, 'notFound', { name: parsed.name });
      } else {
        removeListener(found.id);
        showMainMenu(playerId);
      }
      return;
    case 'config': {
      const menu = findListener(parsed.menu);
      if (menu) {
        showListener(playerId, menu.id);
      } else {
        showMainMenu(playerId);
      }
      return;
    }
    case 'set': {
      const value = parseBoolean(parsed.listen);
      if (value !== null) {
        setConfigValue('enabled', value);
      }
      showMainMenu(playerId);
      return;
    }
    default:
      showHelp(playerId);
  }
}

/**
 * Runs a "!crl" command.
 *
 * @param {string} playerId Player ID.
 * @param {string} content Restored command text.
 * @returns {void}
 */
function routeCommand(playerId, content) {
  const args = parseArguments(content.slice(COMMAND.length));
  if (args.unknown.length > 0) {
    fail(playerId, 'badOption', { option: args.unknown.join(', --') });
    return;
  }
  // "delete <name> confirm" is the second step of deleting.
  const confirmed = ['delete', 'remove'].includes(args.sub) && /\s+confirm$/i.test(args.target);
  if (confirmed) {
    args.target = args.target.replace(/\s+confirm$/i, '');
  }
  const needsTarget = [
    'show',
    'view',
    'edit',
    'set',
    'delete',
    'remove',
    'enable',
    'disable',
    'toggle',
    'up',
    'down',
    'test',
  ];
  const found = needsTarget.includes(args.sub) ? findListener(args.target) : null;
  if (needsTarget.includes(args.sub) && !found) {
    fail(playerId, args.target ? 'notFound' : 'nameRequired', { name: args.target });
    return;
  }
  const hasOptions = Object.keys(args.options).length > 0 || args.commands !== null;

  switch (args.sub) {
    case '':
    case 'menu':
    case 'list':
      showMainMenu(playerId);
      return;
    case 'help':
      showHelp(playerId);
      return;
    case 'new':
    case 'create':
    case 'add':
      createListener(playerId, args.target, args.options, args.commands);
      return;
    case 'show':
    case 'view':
      showListener(playerId, found.id);
      return;
    case 'edit':
    case 'set':
      if (hasOptions) {
        editListener(playerId, found.id, args.options, args.commands);
      } else {
        showListener(playerId, found.id);
      }
      return;
    case 'enable':
    case 'disable':
      editListener(
        playerId,
        found.id,
        { enabled: args.sub === 'enable' ? 'on' : 'off' },
        null,
        false
      );
      showMainMenu(playerId);
      return;
    case 'toggle':
      editListener(playerId, found.id, { enabled: found.listener.enabled ? 'off' : 'on' }, null);
      return;
    case 'up':
    case 'down':
      moveListener(found.id, args.sub === 'up' ? -1 : 1);
      showMainMenu(playerId);
      return;
    case 'test': {
      const sent = testListener(found.id, found.listener, playerId);
      if (sent === 0) {
        whisperWarning(playerId, tr('messages.noCommands', { name: found.listener.name }));
      } else {
        done(playerId, 'tested', { name: found.listener.name, count: sent });
      }
      return;
    }
    case 'delete':
    case 'remove': {
      if (!confirmed) {
        whisper(playerId, tr('titles.confirm'), [
          `<div>${escapeHtml(tr('messages.confirmDelete', { name: found.listener.name }))}</div>`,
          `<div style="margin-top:4px">${buildButton(tr('buttons.confirmDelete'), `${COMMAND} delete ${found.id} confirm`)}${buildSecondaryButton(tr('buttons.back'), `${COMMAND} show ${found.id}`)}</div>`,
        ]);
        return;
      }
      removeListener(found.id);
      done(playerId, 'deleted', { name: found.listener.name });
      showMainMenu(playerId);
      return;
    }
    case 'inspect':
      if (/^(off|stop|cancel)$/i.test(args.target)) {
        setInspector(null);
        done(playerId, 'inspectOff');
      } else {
        setInspector(playerId);
        done(playerId, 'inspectOn');
      }
      return;
    case 'on':
    case 'off':
      setConfigValue('enabled', args.sub);
      showMainMenu(playerId);
      return;
    case 'config':
    case 'settings': {
      const [key = '', ...value] = args.target.split(/\s+/).filter(Boolean);
      if (!key) {
        showConfig(playerId);
      } else {
        changeConfig(playerId, key, value.join(' '));
      }
      return;
    }
    case 'journal':
    case 'handouts':
      installHandouts();
      prepareStoreCharacter();
      done(playerId, 'journalRebuilt', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME });
      return;
    default:
      fail(playerId, 'unknownCommand', { command: args.sub });
  }
}

/**
 * Handles "!crl" chat commands.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {boolean} True when the message was a CRL command.
 */
export function handleCommand(msg) {
  if (msg.type !== 'api') {
    return false;
  }
  const content = toText(msg.content);
  if (!/^!crl(?:\s|$)/i.test(content)) {
    return false;
  }
  if (!playerIsGM(msg.playerid)) {
    fail(msg.playerid, 'gmOnly');
    return true;
  }
  try {
    const restored = restoreCommandText(msg);
    if (isLegacyCommand(restored)) {
      routeLegacy(msg.playerid, restored);
    } else {
      routeCommand(msg.playerid, restored);
    }
  } catch (err) {
    log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
    fail(msg.playerid, 'unexpected', { message: err?.message || String(err) });
  }
  return true;
}
