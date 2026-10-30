// Turns a Roll20 chat message into a plain description of what it contains:
// who sent it, its roll template and fields, its text, and every roll with
// its dice. Pure functions only, so the matcher and tests need no Roll20.

import { isBeaconCard, parseBeaconCard } from './beacon.js';
import { decodeEntities, isRecord, stripGmSuffix, toText } from './utils.js';

// Marker Roll20 leaves in message content where each inline roll was.
const INLINE_MARKER = /\$\[\[(\d+)\]\]/g;

// Roll message types whose content is a JSON description of a /roll.
const ROLL_RESULT_TYPES = new Set([
  'rollresult',
  'gmrollresult',
  'secretrollresult',
  'supersecretrollresult',
]);

// Message properties every chat message may carry; anything else is shown
// by the inspector as extra data.
const STANDARD_KEYS = new Set([
  'who',
  'playerid',
  'type',
  'content',
  'origRoll',
  'inlinerolls',
  'rolltemplate',
  'target',
  'target_name',
  'selected',
  'avatar',
]);

// Template fields that hold the rolling character's name on common sheets.
const CHARACTER_FIELDS = ['charname', 'character_name', 'character', 'actor'];

/**
 * Compares two numbers with a Roll20 comparison operator.
 *
 * @param {number} value Value to test.
 * @param {string} comp Operator ('>=', '<=', '==', '=', '>', '<').
 * @param {number} point Value to compare against.
 * @returns {boolean} Result.
 */
export function compare(value, comp, point) {
  switch (comp) {
    case '>=':
      return value >= point;
    case '<=':
      return value <= point;
    case '>':
      return value > point;
    case '<':
      return value < point;
    case '=':
    case '==':
      return value === point;
    default:
      return false;
  }
}

/**
 * Returns true when a value meets any of Roll20's custom crit/fumble ranges.
 *
 * @param {number} value Die value.
 * @param {*} ranges Roll20 ranges ([{comp, point}]).
 * @returns {boolean} True when it meets one.
 */
function meetsAny(value, ranges) {
  return Array.isArray(ranges) && ranges.some((r) => compare(value, r?.comp, Number(r?.point)));
}

/**
 * Collects the dice and table results of one roll part, recursing into groups.
 *
 * @param {object} part Roll20 roll part (type R, G, M, C or L).
 * @param {object} out Accumulator: {dice, tableItems, targets}.
 * @returns {void}
 */
function collectPart(part, out) {
  if (!isRecord(part)) {
    return;
  }
  if (part.type === 'G' && Array.isArray(part.rolls)) {
    for (const group of part.rolls) {
      for (const inner of Array.isArray(group) ? group : [group]) {
        collectPart(inner, out);
      }
    }
    return;
  }
  if (part.type !== 'R' || !Array.isArray(part.results)) {
    return;
  }
  const mods = isRecord(part.mods) ? part.mods : {};
  if (part.table) {
    for (const result of part.results) {
      const name = toText(result?.tableItem?.name);
      if (name && !result.d) {
        out.tableItems.push(name);
      }
    }
    return;
  }
  const sides = Number(part.sides);
  // Fate dice and other non-numeric dice have no crit or fumble face.
  const numeric = Number.isFinite(sides) && sides > 1 && !part.fate;
  const success = isRecord(mods.success) ? mods.success : null;
  if (success) {
    out.targets.push({ comp: success.comp, point: Number(success.point) });
  }
  for (const result of part.results) {
    // Dropped (kh/kl, d) and rerolled dice no longer count.
    if (!isRecord(result) || result.d || result.r) {
      continue;
    }
    const value = Number(result.v);
    if (!Number.isFinite(value)) {
      continue;
    }
    out.dice.push({
      sides: numeric ? sides : null,
      value,
      // Beacon rolls mark crits and fumbles themselves.
      crit:
        typeof result.isCrit === 'boolean'
          ? result.isCrit
          : numeric
            ? mods.customCrit
              ? meetsAny(value, mods.customCrit)
              : value === sides
            : false,
      fumble:
        typeof result.isFumble === 'boolean'
          ? result.isFumble
          : numeric
            ? mods.customFumble
              ? meetsAny(value, mods.customFumble)
              : value === 1
            : false,
      success: success ? compare(value, success.comp, Number(success.point)) : null,
    });
  }
}

/**
 * Describes one Roll20 roll result object.
 *
 * @param {number} index Inline roll index (0 for /roll messages).
 * @param {string} expression Roll expression as typed.
 * @param {object} results Roll20 results object ({total, rolls}).
 * @returns {object} Roll description.
 */
export function describeRoll(index, expression, results) {
  const out = { dice: [], tableItems: [], targets: [] };
  for (const part of Array.isArray(results?.rolls) ? results.rolls : []) {
    collectPart(part, out);
  }
  const total = Number(results?.total);
  return {
    index,
    expression: toText(expression),
    total: Number.isFinite(total) ? total : null,
    dice: out.dice,
    tableItems: out.tableItems,
    hasTarget: out.targets.length > 0,
  };
}

/**
 * Parses the {{key=value}} fields of a roll template message.
 *
 * @param {string} content Message content.
 * @returns {object} Fields keyed by lower-case name.
 */
export function parseTemplateFields(content) {
  const fields = {};
  for (const match of String(content).matchAll(/\{\{\s*([^=}]+?)\s*(?:=([\s\S]*?))?\}\}/g)) {
    const key = match[1].toLowerCase();
    if (!(key in fields)) {
      fields[key] = toText(match[2]);
    }
  }
  return fields;
}

/**
 * Replaces inline roll markers with each roll's visible result: table item
 * names for table rolls, otherwise the total.
 *
 * @param {string} text Text with $[[n]] markers.
 * @param {object[]} rolls Roll descriptions.
 * @returns {string} Text with results.
 */
export function expandMarkers(text, rolls) {
  return String(text).replaceAll(INLINE_MARKER, (marker, index) => {
    const roll = rolls.find((r) => r.index === Number(index));
    if (!roll) {
      return marker;
    }
    if (roll.tableItems.length > 0) {
      return roll.tableItems.join(', ');
    }
    return roll.total === null ? marker : String(roll.total);
  });
}

/**
 * Converts message HTML to searchable plain text.
 *
 * @param {string} text Content.
 * @returns {string} Plain text.
 */
function toPlainText(text) {
  return decodeEntities(
    String(text)
      .replaceAll(/<br\s*\/?>/gi, '\n')
      .replaceAll(/<[^>]*>/g, ' ')
  )
    .replaceAll(/[ \t]*\n\s*/g, '\n')
    .replaceAll(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Describes a chat message.
 *
 * @param {object} msg Roll20 chat message.
 * @param {object} [extra] Facts only Roll20 can supply.
 * @param {string} [extra.playerName] Display name of the sending player.
 * @returns {object} Message description.
 */
export function analyseMessage(msg, extra = {}) {
  const type = toText(msg?.type);
  const content = typeof msg?.content === 'string' ? msg.content : '';
  let rolls = [];
  let raw = content;

  if (ROLL_RESULT_TYPES.has(type)) {
    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }
    if (isRecord(parsed)) {
      rolls = [describeRoll(0, msg.origRoll, parsed)];
      raw = `${toText(msg.origRoll)} = $[[0]]`;
    }
  } else if (Array.isArray(msg?.inlinerolls)) {
    rolls = msg.inlinerolls.map((roll, index) =>
      describeRoll(index, roll?.expression, roll?.results)
    );
  }

  let template = toText(msg?.rolltemplate);
  let fields = template ? parseTemplateFields(content) : {};
  const who = stripGmSuffix(msg?.who);
  const characterField = CHARACTER_FIELDS.map((key) => fields[key]).find(Boolean);
  let character = characterField ? toPlainText(expandMarkers(characterField, rolls)) : who;

  // Beacon sheets send their dice as msg.rolls, keyed by roll name.
  if (rolls.length === 0 && isRecord(msg?.rolls)) {
    rolls = Object.values(msg.rolls)
      .filter(isRecord)
      .map((roll, index) => ({
        ...describeRoll(index, roll.expression, roll.results),
        name: toText(roll.rollName),
      }));
  }
  // Beacon sheets say what was rolled, e.g. {action: 'repeating_attack', args: [id, 'attack', 'dmg']}.
  if (isRecord(msg?.action)) {
    fields.action = toText(msg.action.action);
    if (Array.isArray(msg.action.args)) {
      fields.args = msg.action.args.map(toText).join(' ');
    }
  }
  if (isBeaconCard(content)) {
    const card = parseBeaconCard(content);
    template = template || card.template;
    fields = { ...card.fields, ...fields };
    character = card.character || character;
    if (rolls.length === 0) {
      rolls = card.rolls;
    } else {
      // The card's headline result includes the sheet's bonuses; the Base
      // roll's own total is only the dice.
      const base = card.rolls.find((r) => r.name.toLowerCase() === 'base');
      for (const roll of rolls) {
        if (base && roll.name.toLowerCase() === 'base') {
          roll.total = base.total;
        }
      }
    }
  }

  return {
    type,
    who,
    playerId: toText(msg?.playerid),
    playerName: toText(extra.playerName),
    characterId: toText(msg?.characterId || msg?.rolledByCharacterId),
    character,
    template,
    fields,
    // Content with $[[n]] markers, used to find which rolls a text matched.
    raw,
    // Readable text: markers replaced by results, HTML removed.
    text: toPlainText(expandMarkers(raw, rolls)),
    rolls,
    // Every property Roll20 sent, so the inspector can show unexpected ones.
    keys: Object.keys(msg || {}).sort(),
    // Properties beyond the classic ones (Beacon sends rolls, action, …), for the inspector.
    extras: Object.fromEntries(
      Object.entries(msg || {}).filter(([key]) => !STANDARD_KEYS.has(key))
    ),
  };
}
