// Decides whether a listener matches an analysed chat message. Pure
// functions only, so the inspector can explain a verdict and tests need no
// Roll20.

import { compare } from './analyse.js';
import { TEMPLATE_NONE } from './constants.js';
import { escapeRegExp, toText } from './utils.js';

// Placeholder a listener's text uses for "an inline roll goes here".
export const ROLL_PLACEHOLDER = '##';

const MARKER_PATTERN = '\\$\\[\\[\\d+\\]\\]';
const MARKER_GLOBAL = /\$\[\[(\d+)\]\]/g;

/**
 * Parses a comparison typed by the GM: "15", "=15", ">=15", ">15", "<=5",
 * "<5" or a range "19-20".
 *
 * @param {*} raw Raw text.
 * @returns {{test: (n: number) => boolean, text: string}|null} Parsed check, or
 *          null when the text is empty or invalid.
 */
export function parseComparison(raw) {
  const text = toText(raw).replaceAll(/\s+/g, '');
  if (!text) {
    return null;
  }
  const range = /^(-?\d+)(?:\.\.|-)(-?\d+)$/.exec(text);
  if (range) {
    const low = Number(range[1]);
    const high = Number(range[2]);
    const [min, max] = low <= high ? [low, high] : [high, low];
    return { test: (n) => n >= min && n <= max, text: `${min}-${max}` };
  }
  const single = /^(>=|<=|==|=|>|<)?(-?\d+)$/.exec(text);
  if (!single) {
    return null;
  }
  const comp = single[1] || '=';
  const point = Number(single[2]);
  return {
    test: (n) => compare(n, comp, point),
    text: `${comp === '==' ? '=' : comp}${point}`,
  };
}

/**
 * Parses a die-size filter: "auto", "any", "20" or "d20".
 *
 * @param {*} raw Raw text.
 * @returns {string|number|null} 'auto', 'any', a die size, or null when invalid.
 */
export function parseDice(raw) {
  const text = toText(raw).toLowerCase();
  if (!text || text === 'auto') {
    return 'auto';
  }
  if (text === 'any' || text === 'all') {
    return 'any';
  }
  const match = /^d?(\d+)$/.exec(text);
  return match && Number(match[1]) > 1 ? Number(match[1]) : null;
}

/**
 * Compiles one text term into a regular expression. In plain mode the term
 * is literal text; in either mode "##" stands for an inline roll.
 *
 * @param {string} term Term typed by the GM.
 * @param {boolean} regex Whether the term is a regular expression.
 * @returns {RegExp} Compiled pattern (case-insensitive, global).
 * @throws {SyntaxError} When a regular expression is invalid.
 */
export function compileTerm(term, regex) {
  const pieces = String(term).split(ROLL_PLACEHOLDER);
  const source = pieces.map((piece) => (regex ? piece : escapeRegExp(piece))).join(MARKER_PATTERN);
  return new RegExp(source, 'gi');
}

/**
 * Returns the first invalid regular expression in a list of terms.
 *
 * @param {string[]} terms Terms.
 * @returns {{term: string, error: string}|null} The problem, or null when all compile.
 */
export function findInvalidTerm(terms) {
  for (const term of terms) {
    try {
      compileTerm(term, true);
    } catch (err) {
      return { term, error: err?.message || String(err) };
    }
  }
  return null;
}

/**
 * Looks for every text term in a message.
 *
 * @param {object} listener Listener rules.
 * @param {object} message Analysed message.
 * @returns {{ok: boolean, rollIndexes: Set<number>, usedPlaceholder: boolean}}
 *          Whether every term was found, and the inline rolls the terms' "##"
 *          placeholders matched.
 */
export function matchText(listener, message) {
  const rollIndexes = new Set();
  let usedPlaceholder = false;
  for (const term of listener.text) {
    let pattern;
    try {
      pattern = compileTerm(term, listener.regex);
    } catch {
      return { ok: false, rollIndexes, usedPlaceholder };
    }
    const hits = [...message.raw.matchAll(pattern)].filter((hit) => hit[0].length > 0);
    if (term.includes(ROLL_PLACEHOLDER)) {
      usedPlaceholder = true;
      for (const hit of hits) {
        for (const marker of hit[0].matchAll(MARKER_GLOBAL)) {
          rollIndexes.add(Number(marker[1]));
        }
      }
      if (hits.length === 0) {
        return { ok: false, rollIndexes, usedPlaceholder };
      }
      continue;
    }
    // Text without "##" may also be found in the readable text, so roll
    // totals and rollable table results can be matched.
    pattern.lastIndex = 0;
    if (hits.length === 0 && !pattern.test(message.text)) {
      return { ok: false, rollIndexes, usedPlaceholder };
    }
  }
  return { ok: true, rollIndexes, usedPlaceholder };
}

/**
 * Returns true when a name list contains a name (case-insensitive).
 *
 * @param {string[]} list Names.
 * @param {...string} names Names to look for.
 * @returns {boolean} True when one is listed.
 */
function listHas(list, ...names) {
  const wanted = new Set(list.map((n) => n.toLowerCase()));
  return names.some((name) => name && wanted.has(name.toLowerCase()));
}

/**
 * Returns the dice of a roll a listener's checks look at.
 *
 * @param {object} roll Roll description.
 * @param {string|number} dice Die-size filter ('any' or a size).
 * @returns {object[]} Dice.
 */
function diceFor(roll, dice) {
  return dice === 'any' ? roll.dice : roll.dice.filter((d) => d.sides === dice);
}

/**
 * Checks one roll against a listener's roll conditions.
 *
 * @param {object} roll Roll description.
 * @param {object} checks Parsed checks.
 * @returns {string|null} The matched result ('' when none was asked for), or
 *          null when the roll fails.
 */
function checkRoll(roll, checks) {
  const dice = diceFor(roll, checks.dice);
  if (checks.total && (roll.total === null || !checks.total.test(roll.total))) {
    return null;
  }
  if (checks.natural && !dice.some((d) => checks.natural.test(d.value))) {
    return null;
  }
  if (checks.results.length === 0) {
    return '';
  }
  const scored = dice.filter((d) => d.success !== null);
  const found = checks.results.find((result) => {
    switch (result) {
      case 'crit':
        return dice.some((d) => d.crit);
      case 'fumble':
        return dice.some((d) => d.fumble);
      case 'success':
        return scored.some((d) => d.success);
      case 'fail':
        return roll.hasTarget && !scored.some((d) => d.success);
      default:
        return false;
    }
  });
  return found ?? null;
}

/**
 * Tests a listener against an analysed message.
 *
 * @param {object} listener Listener rules.
 * @param {object} message Analysed message.
 * @returns {{ok: boolean, reason: string, roll: object|null, result: string}}
 *          Verdict. `reason` names the first filter that failed.
 */
export function matchListener(listener, message) {
  const fail = (reason) => ({ ok: false, reason, roll: null, result: '' });

  if (!listener.enabled) {
    return fail('disabled');
  }
  if (listener.types.length > 0) {
    if (!listener.types.includes(message.type)) {
      return fail('type');
    }
  } else if (message.type === 'api') {
    return fail('type');
  }
  if (listener.templates.length > 0) {
    const template = message.template.toLowerCase();
    const ok = listener.templates.some((t) =>
      t.toLowerCase() === TEMPLATE_NONE ? !template : t.toLowerCase() === template
    );
    if (!ok) {
      return fail('template');
    }
  }
  if (listener.who.length > 0 && !listHas(listener.who, message.who, message.character)) {
    return fail('who');
  }
  if (listener.players.length > 0 && !listHas(listener.players, message.playerName)) {
    return fail('player');
  }

  const text = matchText(listener, message);
  if (!text.ok) {
    return fail('text');
  }

  const checks = {
    results: listener.results,
    total: parseComparison(listener.total),
    natural: parseComparison(listener.natural),
    dice: parseDice(listener.dice) ?? 'auto',
  };
  const needsRoll = checks.results.length > 0 || checks.total || checks.natural;
  const scope = text.usedPlaceholder
    ? message.rolls.filter((r) => text.rollIndexes.has(r.index))
    : message.rolls;
  if (!needsRoll) {
    return { ok: true, reason: '', roll: scope[0] || null, result: '' };
  }
  if (checks.dice === 'auto') {
    // Most crit and fumble rules are about the d20, so when the rolls include
    // one, damage dice rolling their highest face do not count as crits.
    // Beacon sheets post damage on its own card; its dice are never crits.
    const damageCard = /^damage$/i.test(message.fields?.subcategory || '');
    checks.dice = damageCard || scope.some((r) => r.dice.some((d) => d.sides === 20)) ? 20 : 'any';
  }
  for (const roll of scope) {
    const result = checkRoll(roll, checks);
    if (result !== null) {
      return { ok: true, reason: '', roll, result };
    }
  }
  return fail('roll');
}
