// Listens to chat: checks every message against the listeners, runs the
// commands of those that match, and feeds the inspector.

import {
  buildPlaceholderValues,
  isCoolingDown,
  recordFire,
  resetFires,
  resolveSpeaker,
  runCommands,
} from './actions.js';
import { analyseMessage } from './analyse.js';
import { buildButton, buildCode, buildSectionLabel, whisper, whisperWarning } from './chat.js';
import {
  COMMAND,
  COLOR_MUTED,
  COLOR_OFF,
  COLOR_OK,
  CRL_SPEAKER,
  INSPECT_CONTENT_LIMIT,
  SCRIPT_NAME,
} from './constants.js';
import { t } from './i18n.js';
import { matchListener } from './match.js';
import { getConfig, getListeners } from './state.js';
import { getCommands, mirrorRules } from './store.js';
import { escapeHtml, getGmPlayerIds, toText } from './utils.js';

// Player waiting for the next chat message to be inspected.
let inspectFor = null;

// Callbacks registered through the public API.
const observers = [];

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
 * Sets (or clears) the player waiting for the next message to be inspected.
 *
 * @param {string|null} playerId Player ID, or null to stop.
 * @returns {void}
 */
export function setInspector(playerId) {
  inspectFor = playerId;
}

/**
 * Returns the player waiting for an inspection, if any.
 *
 * @returns {string|null} Player ID.
 */
export function getInspector() {
  return inspectFor;
}

/**
 * Registers a callback run whenever a listener matches.
 *
 * @param {Function} fn Callback, given {listener, id, message, verdict}.
 * @returns {void}
 */
export function addObserver(fn) {
  if (typeof fn === 'function') {
    observers.push(fn);
  }
}

/**
 * Returns true for messages CRL sent itself: menus, and listener commands sent as CRL.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {boolean} True when the message came from CRL.
 */
function isOwnMessage(msg) {
  return msg.playerid === 'API' && [CRL_SPEAKER, SCRIPT_NAME].includes(toText(msg.who));
}

/**
 * Returns the display name of the player who sent a message.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {string} Display name, or an empty string.
 */
function playerNameOf(msg) {
  const player = msg.playerid && msg.playerid !== 'API' ? getObj('player', msg.playerid) : null;
  return toText(player?.get('displayname'));
}

/**
 * Shortens text for display.
 *
 * @param {string} text Text.
 * @returns {string} Text, cut to the inspector limit.
 */
function truncate(text) {
  return text.length > INSPECT_CONTENT_LIMIT ? `${text.slice(0, INSPECT_CONTENT_LIMIT)}…` : text;
}

/**
 * Describes one roll for the inspector.
 *
 * @param {object} roll Roll description.
 * @returns {string} Plain text.
 */
function describeRollLine(roll) {
  const dice = roll.dice
    .map((d) => {
      const flags = [d.crit && tr('inspect.crit'), d.fumble && tr('inspect.fumble')]
        .filter(Boolean)
        .join(', ');
      const die = d.sides ? `d${d.sides}` : '?';
      return `${die}:${d.value}${flags ? ` (${flags})` : ''}`;
    })
    .join(' ');
  const label = roll.name ? `${roll.name}: ` : `$[[${roll.index}]] `;
  const parts = [`${label}${roll.expression || '?'} = ${roll.total ?? '?'}`];
  if (dice) {
    parts.push(`${tr('inspect.dice')}: ${dice}`);
  }
  if (roll.tableItems.length > 0) {
    parts.push(`${tr('inspect.table')}: ${roll.tableItems.join(', ')}`);
  }
  if (roll.hasTarget) {
    parts.push(tr('inspect.target'));
  }
  return parts.join(' • ');
}

/**
 * Whispers a breakdown of a message and how every listener judged it.
 *
 * @param {string} playerId Player to whisper.
 * @param {object} message Analysed message.
 * @returns {void}
 */
function sendInspection(playerId, message) {
  const row = (label, value) =>
    `<div><span style="color:${COLOR_MUTED}">${escapeHtml(label)}:</span> ${escapeHtml(value || tr('values.none'))}</div>`;
  const lines = [
    row(tr('inspect.type'), message.type),
    row(tr('inspect.who'), message.who),
    row(tr('inspect.character'), message.character),
    row(tr('inspect.player'), message.playerName || (message.playerId === 'API' ? 'API' : '')),
    row(tr('inspect.template'), message.template),
  ];
  lines.push(row(tr('inspect.keys'), (message.keys || []).join(', ')));
  const fieldNames = Object.keys(message.fields);
  if (fieldNames.length > 0) {
    lines.push(
      row(
        tr('inspect.fields'),
        fieldNames.map((k) => `${k}=${message.fields[k].slice(0, 40)}`).join(', ')
      )
    );
  }
  lines.push(buildSectionLabel(tr('inspect.rolls')));
  lines.push(
    message.rolls.length > 0
      ? buildCode(message.rolls.map(describeRollLine).join('\n'))
      : `<div>${escapeHtml(tr('values.none'))}</div>`
  );
  lines.push(buildSectionLabel(tr('inspect.text')));
  lines.push(buildCode(truncate(message.text)));
  lines.push(buildSectionLabel(tr('inspect.raw')));
  lines.push(buildCode(truncate(message.raw)));
  lines.push(buildSectionLabel(tr('inspect.listeners')));
  const listeners = getListeners();
  if (listeners.length === 0) {
    lines.push(`<div>${escapeHtml(tr('menu.noListeners'))}</div>`);
  }
  for (const { listener } of listeners) {
    const verdict = matchListener(listener, message);
    const mark = verdict.ok
      ? `<span style="color:${COLOR_OK}">✔</span>`
      : `<span style="color:${COLOR_OFF}">✘</span>`;
    const why = verdict.ok
      ? tr('inspect.matched', { result: verdict.result ? tr(`results.${verdict.result}`) : '' })
      : tr(`inspect.reasons.${verdict.reason}`);
    lines.push(
      `<div>${mark} <strong>${escapeHtml(listener.name)}</strong> — ${escapeHtml(why)}</div>`
    );
  }
  lines.push(
    `<div style="margin-top:4px">${buildButton(tr('buttons.inspect'), `${COMMAND} inspect`)}</div>`
  );
  whisper(playerId, tr('titles.inspect'), lines);
  // Extra data (Beacon's roll objects and so on) goes in its own whisper to
  // keep each message a reasonable size.
  const extras = JSON.stringify(message.extras || {}, null, 1);
  if (extras !== '{}') {
    whisper(playerId, tr('inspect.extras'), buildCode(truncate(extras)));
  }
}

/**
 * Switches off a listener that keeps triggering, and tells the GM.
 *
 * @param {string} id Listener ID.
 * @param {object} listener Listener rules.
 * @returns {void}
 */
function stopLoop(id, listener) {
  listener.enabled = false;
  mirrorRules(id);
  resetFires(id);
  const text = tr('messages.loopStopped', { name: listener.name });
  const gms = getGmPlayerIds();
  for (const gm of gms.length > 0 ? gms : [null]) {
    whisperWarning(gm, text);
  }
  log(`${SCRIPT_NAME}: ${text}`);
}

/**
 * Checks a chat message against every listener and runs those that match.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleChatMessage(msg) {
  if (isOwnMessage(msg)) {
    return;
  }
  const config = getConfig();
  const message = analyseMessage(msg, { playerName: playerNameOf(msg) });

  if (inspectFor) {
    const playerId = inspectFor;
    inspectFor = null;
    sendInspection(playerId, message);
  }

  if (!config.enabled || (!config.listenToMods && msg.playerid === 'API')) {
    return;
  }

  const now = Date.now();
  for (const { id, listener } of getListeners()) {
    const verdict = matchListener(listener, message);
    if (!verdict.ok || isCoolingDown(id, listener.cooldown, now)) {
      continue;
    }
    if (recordFire(id, now)) {
      stopLoop(id, listener);
      continue;
    }
    const mode = listener.speaker === 'default' ? config.speaker : listener.speaker;
    runCommands(
      getCommands(id),
      resolveSpeaker(mode, message),
      buildPlaceholderValues(message, verdict, listener.name)
    );
    for (const fn of observers) {
      try {
        fn({ id, listener: { ...listener }, message, verdict });
      } catch (err) {
        log(`${SCRIPT_NAME}: observer failed: ${err?.message || err}`);
      }
    }
    if (listener.stop) {
      break;
    }
  }
}

/**
 * Runs a listener's commands straight away with sample values, so the GM can
 * check them without rolling.
 *
 * @param {string} id Listener ID.
 * @param {object} listener Listener rules.
 * @param {string} playerId Player who asked.
 * @returns {number} Number of messages sent.
 */
export function testListener(id, listener, playerId) {
  const player = getObj('player', playerId);
  const name = toText(player?.get('displayname')) || CRL_SPEAKER;
  const sample = {
    type: 'general',
    who: name,
    playerId,
    playerName: name,
    character: name,
    template: listener.templates[0] || '',
    fields: {},
    raw: '',
    text: '',
    rolls: [
      {
        index: 0,
        expression: '1d20',
        total: 20,
        dice: [{ sides: 20, value: 20, crit: true, fumble: false, success: null }],
        tableItems: [],
        hasTarget: false,
      },
    ],
  };
  const config = getConfig();
  const mode = listener.speaker === 'default' ? config.speaker : listener.speaker;
  return runCommands(
    getCommands(id),
    resolveSpeaker(mode, sample),
    buildPlaceholderValues(
      sample,
      { roll: sample.rolls[0], result: listener.results[0] || '' },
      listener.name
    )
  );
}
