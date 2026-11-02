// Chat commands: `!concentration [spell]`, the settings menu and GM tools.

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
  API_PLAYER_ID,
  DEFAULT_CONFIG,
  DEFAULT_MARKERS,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  HELP_COMMANDS,
  MAX_SPELL_LENGTH,
  SCRIPT_NAME,
  SEND_TO_OPTIONS,
  SUPPORT_MODE_OPTIONS,
  TOGGLE_KEYS,
} from './constants.js';
import { detectSpellCast } from './detect.js';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from './i18n.js';
import { installHandouts } from './journals.js';
import { rollPending } from './saves.js';
import {
  getConfig,
  getRecords,
  hasAdvantage,
  resetState,
  setConfigValue,
  toggleAdvantage,
} from './state.js';
import { dirStyle, rich, tr } from './text.js';
import {
  canControl,
  endConcentration,
  handleSpellCast,
  keyOf,
  listConcentrating,
  reconcile,
  toggleConcentration,
  tokensFor,
} from './tracker.js';
import { cleanSpellName, escapeHtml, isRecord, isToken, setMarker, toText } from './utils.js';

// Subcommands players may use on tokens they control. Everything else is GM only.
const PLAYER_COMMANDS = new Set(['', 'end', 'roll', 'advantage', 'help']);

// Words that are subcommands rather than spell names.
const SUBCOMMANDS = new Set([
  'menu',
  'config',
  'reset',
  'end',
  'status',
  'help',
  'journal',
  'advantage-menu',
  'toggle-advantage',
  'roll',
  'advantage',
]);

// Settings in the order the menu shows them.
const SETTING_ROWS = [
  'statusmarker',
  'bar',
  'send_reminder_to',
  'auto_add_concentration_marker',
  'auto_roll_save',
  'show_roll_button',
  'end_at_zero',
  'bonus_attribute',
  'command',
  'language',
  'debug',
  'support_mode',
];

/**
 * Builds a command line from the configured command and arguments.
 *
 * @param {string} args Arguments.
 * @returns {string} Command.
 */
function cmd(args) {
  return `!${getConfig().command} ${args}`.trim();
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
  const hint = tr(`hints.${key}`, vars);
  whisperError(playerId, tr(`errors.${key}`, vars), hint === `hints.${key}` ? '' : hint);
}

/**
 * Formats a setting value for display.
 *
 * @param {string} key Setting key.
 * @param {*} value Setting value.
 * @returns {string} Display text.
 */
function formatValue(key, value) {
  if (TOGGLE_KEYS.includes(key)) {
    return tr(value ? 'values.on' : 'values.off');
  }
  switch (key) {
    case 'language':
      return LOCALE_LABELS[value] || value;
    case 'bar':
      return tr('values.bar', { bar: value });
    case 'command':
      return `!${value}`;
    case 'send_reminder_to':
      return tr(`values.sendTo.${value}`);
    case 'support_mode':
      return tr(`values.supportMode.${value}`);
    default:
      return String(value);
  }
}

/**
 * Builds a Roll20 query. Options are [label, value] pairs.
 *
 * @param {string} label Prompt label.
 * @param {Array<[string, string]>|null} options Choices, or null for free text.
 * @param {*} [current] Current value, offered as the default for free text.
 * @returns {string} Query text.
 */
function query(label, options, current) {
  const safe = (text) => String(text).replaceAll(/[|},]/g, '');
  if (options) {
    return `?{${safe(label)}|${options.map(([l, v]) => `${safe(l)},${safe(v)}`).join('|')}}`;
  }
  const shown = current === null || current === undefined ? '' : safe(current);
  return `?{${safe(label)}|${shown}}`;
}

/**
 * Returns the marker tags offered in the menu: the game's custom token
 * markers, then Roll20's built-in markers.
 *
 * @returns {string[]} Marker tags.
 */
function markerChoices() {
  let custom = [];
  try {
    const parsed = JSON.parse(Campaign().get('_token_markers') || '[]');
    custom = Array.isArray(parsed) ? parsed.map((m) => toText(m?.tag)).filter(Boolean) : [];
  } catch {
    custom = [];
  }
  return [...new Set([...custom, ...DEFAULT_MARKERS])];
}

/**
 * Returns the button command that changes a setting.
 *
 * @param {string} key Setting key.
 * @returns {string} Command.
 */
function settingCommand(key) {
  const config = getConfig();
  const label = tr(`settings.${key}.label`);
  if (TOGGLE_KEYS.includes(key)) {
    return cmd(`config ${key}|${!config[key]}`);
  }
  const options = {
    statusmarker: markerChoices().map((m) => [m, m]),
    bar: [1, 2, 3].map((b) => [tr('values.bar', { bar: b }), String(b)]),
    send_reminder_to: SEND_TO_OPTIONS.map((o) => [tr(`values.sendTo.${o}`), o]),
    support_mode: SUPPORT_MODE_OPTIONS.map((o) => [tr(`values.supportMode.${o}`), o]),
    language: SUPPORTED_LOCALES.map((l) => [LOCALE_LABELS[l] || l, l]),
  }[key];
  return cmd(`config ${key}|${query(label, options || null, config[key])}`);
}

/**
 * Shows the settings menu to the GM.
 *
 * @param {string|null} playerId Player ID.
 * @param {string} [noteHtml] A line shown above the settings, such as a confirmation.
 * @returns {void}
 */
export function showMenu(playerId, noteHtml = '') {
  const config = getConfig();
  const lines = [];
  if (noteHtml) {
    lines.push(`<div style="margin-bottom:4px">${noteHtml}</div>`, buildDivider());
  }
  const count = Object.keys(getRecords()).length;
  lines.push(
    `<div style="font-size:0.9em">${escapeHtml(tr('menu.concentratingCount', { count }))}</div>`
  );
  lines.push(buildSectionLabel(tr('menu.settings')));
  for (const key of SETTING_ROWS) {
    if (key === 'show_roll_button' && config.auto_roll_save) {
      continue;
    }
    const hint = tr(`settings.${key}.hint`);
    lines.push(
      buildRow(
        tr(`settings.${key}.label`),
        buildSecondaryButton(formatValue(key, config[key]), settingCommand(key)),
        hint === `settings.${key}.hint` ? '' : hint
      )
    );
  }
  lines.push(
    buildDivider(),
    `<div style="text-align:center">${[
      buildButton(tr('buttons.status'), cmd('status')),
      buildButton(tr('buttons.advantageMenu'), cmd('advantage-menu')),
      buildSecondaryButton(tr('buttons.help'), cmd('help')),
      buildSecondaryButton(tr('buttons.reset'), cmd('reset')),
    ].join('')}</div>`,
    `<div style="font-size:0.8em;margin-top:4px">${escapeHtml(tr('menu.footer', { command: cmd(''), deck: HANDOUT_DECK_NAME }))}</div>`
  );
  whisper(playerId, tr('titles.menu'), lines, dirStyle());
}

/**
 * Shows the command list.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showHelp(playerId) {
  const gm = playerId === API_PLAYER_ID || playerIsGM(playerId);
  const rows = HELP_COMMANDS.filter(([text]) => gm || ['', '<spell>', 'end'].includes(text)).map(
    ([text, key]) => buildRow(cmd(text), escapeHtml(tr(`help.${key}`)))
  );
  rows.push(
    `<div style="font-size:0.85em;margin-top:4px">${escapeHtml(tr(gm ? 'help.footer' : 'help.playerFooter', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`
  );
  whisper(playerId, tr('titles.help'), rows, dirStyle());
}

/**
 * Shows who is concentrating, with an End button for each.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showStatus(playerId) {
  const entries = listConcentrating();
  const lines =
    entries.length === 0
      ? [`<div>${escapeHtml(tr('status.none'))}</div>`]
      : entries.map((entry) =>
          buildRow(
            entry.spell ? `${entry.name}: ${entry.spell}` : entry.name,
            buildSecondaryButton(tr('buttons.end'), cmd(`end ${entry.key}`))
          )
        );
  lines.push(buildDivider(), buildSecondaryButton(tr('buttons.menu'), cmd('')));
  whisper(playerId, tr('titles.status'), lines, dirStyle());
}

/**
 * Shows the characters and whether they roll concentration saves with advantage.
 *
 * @param {string} playerId Player ID.
 * @returns {void}
 */
function showAdvantageMenu(playerId) {
  const characters = findObjs({ _type: 'character' }).sort((a, b) =>
    toText(a.get('name')).localeCompare(toText(b.get('name')))
  );
  const lines = [`<div style="font-size:0.9em">${escapeHtml(tr('advantage.intro'))}</div>`];
  if (characters.length === 0) {
    lines.push(`<div>${escapeHtml(tr('advantage.none'))}</div>`);
  }
  for (const character of characters) {
    const on = hasAdvantage(character.id);
    const button = on ? buildButton : buildSecondaryButton;
    lines.push(
      buildRow(
        toText(character.get('name')) || tr('values.unnamed'),
        button(tr(on ? 'values.on' : 'values.off'), cmd(`toggle-advantage ${character.id}`))
      )
    );
  }
  lines.push(buildDivider(), buildSecondaryButton(tr('buttons.menu'), cmd('')));
  whisper(playerId, tr('titles.advantage'), lines, dirStyle());
}

/**
 * Returns the selected tokens.
 *
 * @param {object} msg Chat message.
 * @returns {object[]} Tokens.
 */
function selectedTokens(msg) {
  return (msg.selected || [])
    .map((s) => getObj('graphic', s._id))
    .filter((token) => isToken(token));
}

/**
 * `!concentration [spell]` with tokens selected: start, switch or end.
 *
 * @param {object} msg Chat message.
 * @param {string} spell Spell typed after the command.
 * @returns {void}
 */
function commandToggle(msg, spell) {
  const tokens = selectedTokens(msg);
  if (tokens.length === 0) {
    fail(msg.playerid, 'noSelection');
    return;
  }
  const allowed = tokens.filter((token) => canControl(token, msg.playerid));
  if (allowed.length < tokens.length) {
    fail(msg.playerid, 'notYours');
  }
  const done = new Set();
  for (const token of allowed) {
    const key = keyOf(token);
    if (!done.has(key)) {
      done.add(key);
      toggleConcentration(token, spell);
    }
  }
}

/**
 * `end [<id>]`: ends concentration on the selected tokens, or on a character
 * or token ID (from the status card).
 *
 * @param {object} msg Chat message.
 * @param {string} ref Character or token ID, if given.
 * @returns {void}
 */
function commandEnd(msg, ref) {
  if (ref) {
    if (!playerIsGM(msg.playerid) && msg.playerid !== API_PLAYER_ID) {
      fail(msg.playerid, 'gmOnly');
      return;
    }
    if (!endConcentration(ref, 'ended')) {
      fail(msg.playerid, 'notConcentrating');
    }
    return;
  }
  const tokens = selectedTokens(msg).filter((token) => canControl(token, msg.playerid));
  if (tokens.length === 0) {
    fail(msg.playerid, 'noSelection');
    return;
  }
  const keys = new Set(tokens.map((token) => keyOf(token)));
  let ended = 0;
  for (const key of keys) {
    const token = tokens.find((t) => keyOf(t) === key);
    ended += endConcentration(key, 'ended', { token }) ? 1 : 0;
  }
  if (ended === 0) {
    fail(msg.playerid, 'notConcentrating');
  }
}

/**
 * Moves every concentration marker from one marker to another.
 *
 * @param {string} from Old marker.
 * @param {string} to New marker.
 * @returns {void}
 */
function moveMarkers(from, to) {
  for (const key of Object.keys(getRecords())) {
    for (const token of tokensFor(key)) {
      setMarker(token, from, false);
      setMarker(token, to, true);
    }
  }
}

/**
 * `config [<key>|<value>]` (also `config <key> <value>`): changes a setting
 * and shows the menu again.
 *
 * @param {object} msg Chat message.
 * @param {string} rest Text after `config`.
 * @returns {void}
 */
function commandConfig(msg, rest) {
  const text = toText(rest);
  if (!text) {
    showMenu(msg.playerid);
    return;
  }
  const split = text.includes('|') ? text.indexOf('|') : text.search(/\s/);
  const rawKey = split === -1 ? text : text.slice(0, split);
  const rawValue = split === -1 ? '' : text.slice(split + 1).trim();
  const key = Object.keys(DEFAULT_CONFIG).find((k) => k.toLowerCase() === rawKey.toLowerCase());
  if (!key) {
    fail(msg.playerid, 'unknownSetting', { key: rawKey });
    return;
  }
  const before = getConfig()[key];
  const result = setConfigValue(key, rawValue);
  if (!result.valid) {
    fail(msg.playerid, 'badSettingValue', { key, value: rawValue });
    return;
  }
  if (key === 'statusmarker' && before !== result.value) {
    moveMarkers(before, result.value);
  }
  if (key === 'bar') {
    reconcile({ keepUnmatched: true });
  }
  if (key === 'language' || key === 'command') {
    installHandouts();
  }
  showMenu(
    msg.playerid,
    rich('messages.settingChanged', {
      setting: tr(`settings.${key}.label`),
      value: formatValue(key, result.value),
    })
  );
}

/**
 * `reset [confirm]`: puts the settings back to their defaults.
 *
 * @param {object} msg Chat message.
 * @param {string} rest Text after `reset`.
 * @returns {void}
 */
function commandReset(msg, rest) {
  if (toText(rest).toLowerCase() !== 'confirm') {
    whisper(
      msg.playerid,
      tr('titles.reset'),
      [
        `<div>${escapeHtml(tr('messages.confirmReset'))}</div>`,
        `<div style="text-align:center;margin-top:4px">${buildButton(tr('buttons.confirmReset'), cmd('reset confirm'))}${buildSecondaryButton(tr('buttons.menu'), cmd(''))}</div>`,
      ],
      dirStyle()
    );
    return;
  }
  const marker = getConfig().statusmarker;
  resetState();
  if (marker !== getConfig().statusmarker) {
    moveMarkers(marker, getConfig().statusmarker);
  }
  reconcile({ keepUnmatched: true });
  installHandouts();
  showMenu(msg.playerid, escapeHtml(tr('messages.reset')));
}

/**
 * `roll <id>` / `advantage <id>`: rolls a save from its button.
 *
 * @param {object} msg Chat message.
 * @param {string} id Pending save ID.
 * @param {boolean} advantage Roll with advantage.
 * @returns {Promise<void>}
 */
async function commandRoll(msg, id, advantage) {
  const result = await rollPending(id, advantage, msg.playerid);
  if (result === 'expired') {
    fail(msg.playerid, 'rollExpired');
  } else if (result === 'denied') {
    fail(msg.playerid, 'notYours');
  }
}

/**
 * Routes a command once the prefix has been matched.
 *
 * @param {object} msg Chat message.
 * @param {string} sub Subcommand (lower case), or '' for none.
 * @param {string} rest Text after the subcommand.
 * @param {string} all Text after the prefix.
 * @returns {Promise<void>|void}
 */
function routeCommand(msg, sub, rest, all) {
  const gm = msg.playerid === API_PLAYER_ID || playerIsGM(msg.playerid);
  const isSub = SUBCOMMANDS.has(sub);
  if (isSub && !gm && !PLAYER_COMMANDS.has(sub)) {
    fail(msg.playerid, 'gmOnly');
    return undefined;
  }
  if (!isSub) {
    if (!all && gm && selectedTokens(msg).length === 0) {
      showMenu(msg.playerid);
      return undefined;
    }
    commandToggle(msg, cleanSpellName(all, MAX_SPELL_LENGTH));
    return undefined;
  }
  const word = toText(rest).split(/\s+/)[0] || '';
  switch (sub) {
    case 'menu':
      showMenu(msg.playerid);
      break;
    case 'config':
      commandConfig(msg, rest);
      break;
    case 'reset':
      commandReset(msg, rest);
      break;
    case 'end':
      commandEnd(msg, word);
      break;
    case 'status':
      showStatus(msg.playerid);
      break;
    case 'help':
      showHelp(msg.playerid);
      break;
    case 'journal':
      installHandouts();
      whisper(
        msg.playerid,
        SCRIPT_NAME,
        `<div>${escapeHtml(tr('messages.journal', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`,
        dirStyle()
      );
      break;
    case 'advantage-menu':
      showAdvantageMenu(msg.playerid);
      break;
    case 'toggle-advantage':
      if (!getObj('character', word)) {
        fail(msg.playerid, 'unknownCharacter');
        break;
      }
      toggleAdvantage(word);
      showAdvantageMenu(msg.playerid);
      break;
    case 'roll':
    case 'advantage':
      return commandRoll(msg, word, sub === 'advantage');
    default:
      break;
  }
  return undefined;
}

/**
 * Handles a chat message: spell cards for automatic concentration, and
 * `!concentration` commands.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (!isRecord(msg)) {
    return;
  }
  const config = getConfig();
  if (msg.type !== 'api') {
    if (config.auto_add_concentration_marker) {
      const spellCast = detectSpellCast(msg);
      if (spellCast) {
        handleSpellCast(msg, spellCast);
      }
    }
    return;
  }
  const content = toText(msg.content);
  const prefix = content.split(/\s+/)[0];
  if (prefix.toLowerCase() !== `!${config.command}`.toLowerCase()) {
    return;
  }
  const all = content.slice(prefix.length).trim();
  const sub = all.split(/\s+/)[0].toLowerCase();
  const rest = all.slice(sub.length).trim();
  const run = async () => {
    try {
      await routeCommand(msg, sub, rest, all);
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR handling "${content}": ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
      fail(msg.playerid, 'internal');
    }
  };
  run();
}

/**
 * Warns the GM when a setting looks wrong for this game.
 *
 * @returns {void}
 */
export function checkSetup() {
  const marker = getConfig().statusmarker;
  if (!markerChoices().includes(marker)) {
    whisperWarning(null, tr('warnings.unknownMarker', { marker }));
  }
}
