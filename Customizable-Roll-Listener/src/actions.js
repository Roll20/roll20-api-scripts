// Runs a matched listener's commands: fills in placeholders, works out who
// to send them as, applies cooldowns and stops runaway loops.

import { CRL_SPEAKER, LOOP_LIMIT, LOOP_WINDOW_MS } from './constants.js';
import { expandMarkers } from './analyse.js';
import { toText } from './utils.js';

// Last time each listener fired, and its recent firing times for loop protection.
const lastFired = new Map();
const recentFires = new Map();

/**
 * Builds the values placeholders are replaced with.
 *
 * @param {object} message Analysed message.
 * @param {object} verdict Match verdict ({roll, result}).
 * @param {string} listenerName Listener name.
 * @returns {object} Placeholder values.
 */
export function buildPlaceholderValues(message, verdict, listenerName) {
  const roll = verdict.roll || message.rolls[0] || null;
  const natural = roll?.dice.find((d) => d.sides === 20) || roll?.dice[0];
  return {
    who: message.who,
    character: message.character,
    player: message.playerName,
    template: message.template,
    total: roll?.total ?? '',
    natural: natural?.value ?? '',
    expression: roll?.expression ?? '',
    result: verdict.result || '',
    table: roll?.tableItems.join(', ') ?? '',
    listener: listenerName,
    fields: message.fields,
    rolls: message.rolls,
  };
}

/**
 * Replaces ${name} and ${field:key} placeholders in a command. Unknown
 * placeholders are left alone, so roll template text is never changed.
 *
 * @param {string} command Command text.
 * @param {object} values Placeholder values.
 * @returns {string} Command with values filled in.
 */
export function fillPlaceholders(command, values) {
  const clean = (value) => toText(value).replaceAll(/[\r\n]+/g, ' ');
  return String(command).replaceAll(/\$\{(\w+)(?::([^}]*))?\}/g, (match, name, arg) => {
    const key = name.toLowerCase();
    if (key === 'field') {
      const field = values.fields?.[toText(arg).toLowerCase()];
      return field === undefined ? '' : clean(expandMarkers(field, values.rolls || []));
    }
    if (arg !== undefined || !(key in values) || key === 'fields' || key === 'rolls') {
      return match;
    }
    return clean(values[key]);
  });
}

/**
 * Splits an ability's commands into chat messages. Each line is a message,
 * except that lines inside an unclosed {{ }} block (a multi-line roll
 * template or ScriptCards script) stay together, as they do in a macro.
 *
 * @param {string} commands Commands.
 * @returns {string[]} Messages.
 */
export function splitCommands(commands) {
  const messages = [];
  let current = [];
  let depth = 0;
  for (const line of String(commands).split(/\r?\n/)) {
    if (current.length === 0 && !line.trim()) {
      continue;
    }
    current.push(line.trim());
    depth += (line.match(/\{\{/g) || []).length - (line.match(/\}\}/g) || []).length;
    if (depth <= 0) {
      depth = 0;
      const joiner = current[0].startsWith('!') ? '\n' : ' ';
      messages.push(current.filter(Boolean).join(joiner));
      current = [];
    }
  }
  if (current.length > 0) {
    messages.push(current.filter(Boolean).join(current[0].startsWith('!') ? '\n' : ' '));
  }
  return messages.filter(Boolean);
}

/**
 * Works out who a listener's commands are sent as.
 *
 * @param {string} mode 'crl' or 'roller'.
 * @param {object} message Analysed message.
 * @returns {string} sendChat speaker.
 */
export function resolveSpeaker(mode, message) {
  if (mode !== 'roller') {
    return CRL_SPEAKER;
  }
  if (message.characterId && getObj('character', message.characterId)) {
    return `character|${message.characterId}`;
  }
  for (const name of [message.character, message.who]) {
    const character = name ? findObjs({ _type: 'character', name })[0] : null;
    if (character) {
      return `character|${character.id}`;
    }
  }
  if (message.playerId && message.playerId !== 'API') {
    return `player|${message.playerId}`;
  }
  return CRL_SPEAKER;
}

/**
 * Returns true when a listener is still cooling down.
 *
 * @param {string} id Listener ID.
 * @param {number} cooldown Cooldown in seconds.
 * @param {number} now Current time in milliseconds.
 * @returns {boolean} True when it must wait.
 */
export function isCoolingDown(id, cooldown, now) {
  const last = lastFired.get(id);
  return cooldown > 0 && last !== undefined && now - last < cooldown * 1000;
}

/**
 * Records that a listener fired and reports whether it is looping.
 *
 * @param {string} id Listener ID.
 * @param {number} now Current time in milliseconds.
 * @returns {boolean} True when it has fired too often to be anything but a loop.
 */
export function recordFire(id, now) {
  lastFired.set(id, now);
  const times = (recentFires.get(id) || []).filter((time) => now - time < LOOP_WINDOW_MS);
  times.push(now);
  recentFires.set(id, times);
  return times.length > LOOP_LIMIT;
}

/**
 * Forgets a listener's firing history.
 *
 * @param {string} id Listener ID.
 * @returns {void}
 */
export function resetFires(id) {
  lastFired.delete(id);
  recentFires.delete(id);
}

/**
 * Sends a listener's commands.
 *
 * @param {string} commands Commands from the listener's ability.
 * @param {string} speaker sendChat speaker.
 * @param {object} values Placeholder values.
 * @returns {number} Number of messages sent.
 */
export function runCommands(commands, speaker, values) {
  const messages = splitCommands(commands);
  for (const text of messages) {
    sendChat(speaker, fillPlaceholders(text, values));
  }
  return messages.length;
}
