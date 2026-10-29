// Message analysis and listener matching, without Roll20.

import assert from 'node:assert/strict';
import test from 'node:test';

import { analyseMessage, parseTemplateFields } from '../src/analyse.js';
import { DEFAULT_LISTENER } from '../src/constants.js';
import { matchListener, matchText, parseComparison, parseDice } from '../src/match.js';
import { dice, inlineRoll } from './roll20-stub.mjs';

const listener = (rules) => ({ ...DEFAULT_LISTENER, name: 'Test', ...rules });
const math = (expr) => ({ type: 'M', expr });

/** A D&D 5e 2014 atkdmg message: attack roll(s), then damage. */
function attack({ d20 = [12], d8 = 4, adv = false } = {}) {
  const results = adv
    ? d20.map((v, i) => ({ v, d: i === d20.indexOf(Math.min(...d20)) }))
    : d20.map((v) => ({ v }));
  return analyseMessage({
    type: 'general',
    who: 'Alice',
    playerid: 'p1',
    rolltemplate: 'atkdmg',
    content: '{{rname=Longsword}} {{charname=Alice}} {{mod=+5}} {{r1=$[[0]]}} {{dmg1=$[[1]]}}',
    inlinerolls: [
      inlineRoll(adv ? '2d20kh1+5' : '1d20+5', [dice(20, results), math('+5')], 0),
      inlineRoll('1d8+3', [dice(8, [d8]), math('+3')], d8 + 3),
    ],
  });
}

test('parses comparisons and ranges', () => {
  assert.equal(parseComparison('>=15').test(15), true);
  assert.equal(parseComparison('>=15').test(14), false);
  assert.equal(parseComparison('20').test(20), true);
  assert.equal(parseComparison('<3').test(3), false);
  assert.equal(parseComparison('19-20').test(19), true);
  assert.equal(parseComparison('19-20').text, '19-20');
  assert.equal(parseComparison('-2').test(-2), true);
  assert.equal(parseComparison('abc'), null);
  assert.equal(parseComparison(''), null);
  assert.equal(parseDice('d20'), 20);
  assert.equal(parseDice('any'), 'any');
  assert.equal(parseDice(''), 'auto');
  assert.equal(parseDice('d1'), null);
});

test('parses roll template fields', () => {
  const fields = parseTemplateFields('{{name=Bob}} {{r1=$[[0]]}} {{always=1}} {{flag}}');
  assert.deepEqual(fields, { name: 'Bob', r1: '$[[0]]', always: '1', flag: '' });
});

test('a natural 20 is a crit and a 1 a fumble', () => {
  assert.equal(matchListener(listener({ results: ['crit'] }), attack({ d20: [20] })).ok, true);
  assert.equal(matchListener(listener({ results: ['crit'] }), attack({ d20: [19] })).ok, false);
  assert.equal(matchListener(listener({ results: ['fumble'] }), attack({ d20: [1] })).ok, true);
  const verdict = matchListener(listener({ results: ['crit', 'fumble'] }), attack({ d20: [1] }));
  assert.equal(verdict.result, 'fumble');
});

test('maths parts in a roll no longer break crit checks (v1 "not parseable")', () => {
  const verdict = matchListener(listener({ results: ['crit'] }), attack({ d20: [20] }));
  assert.equal(verdict.ok, true);
  assert.equal(verdict.roll.index, 0);
});

test('a dropped 20 is not a crit', () => {
  const disadvantage = analyseMessage({
    type: 'general',
    who: 'Alice',
    content: '$[[0]]',
    inlinerolls: [inlineRoll('2d20kl1', [dice(20, [{ v: 20, d: true }, { v: 7 }])], 7)],
  });
  assert.equal(matchListener(listener({ results: ['crit'] }), disadvantage).ok, false);
  assert.equal(
    matchListener(listener({ results: ['crit'] }), attack({ d20: [20, 3], adv: true })).ok,
    true
  );
});

test('damage dice rolling their highest face are not crits when a d20 was rolled', () => {
  const message = attack({ d20: [10], d8: 8 });
  assert.equal(matchListener(listener({ results: ['crit'] }), message).ok, false);
  assert.equal(matchListener(listener({ results: ['crit'], dice: 'any' }), message).ok, true);
  assert.equal(matchListener(listener({ results: ['crit'], dice: '8' }), message).ok, true);
});

test('without a d20, auto checks every die', () => {
  const message = analyseMessage({
    type: 'general',
    who: 'Bob',
    content: 'Damage $[[0]]',
    inlinerolls: [inlineRoll('2d6', [dice(6, [6, 2])], 8)],
  });
  assert.equal(matchListener(listener({ results: ['crit'] }), message).ok, true);
});

test('custom crit and fumble ranges are honoured', () => {
  const message = analyseMessage({
    type: 'general',
    who: 'Bob',
    content: '$[[0]]',
    inlinerolls: [
      inlineRoll(
        '1d20cs>19cf<2',
        [
          dice(20, [19], {
            customCrit: [{ comp: '>=', point: 19 }],
            customFumble: [{ comp: '<=', point: 2 }],
          }),
        ],
        19
      ),
    ],
  });
  assert.equal(matchListener(listener({ results: ['crit'] }), message).ok, true);
  assert.equal(matchListener(listener({ results: ['fumble'] }), message).ok, false);
});

test('success and failure use the roll target, strictly', () => {
  const roll = (value) =>
    analyseMessage({
      type: 'general',
      who: 'Bob',
      content: '$[[0]]',
      inlinerolls: [
        inlineRoll('1d20>15', [dice(20, [value], { success: { comp: '>=', point: 15 } })], 0),
      ],
    });
  assert.equal(matchListener(listener({ results: ['success'] }), roll(15)).ok, true);
  assert.equal(matchListener(listener({ results: ['fail'] }), roll(15)).ok, false);
  assert.equal(matchListener(listener({ results: ['fail'] }), roll(14)).ok, true);
  assert.equal(matchListener(listener({ results: ['fail'] }), attack()).ok, false);
});

test('totals and natural results', () => {
  const message = attack({ d20: [17] });
  message.rolls[0].total = 22;
  assert.equal(matchListener(listener({ total: '>=20' }), message).ok, true);
  assert.equal(matchListener(listener({ total: '>=25' }), message).ok, false);
  assert.equal(matchListener(listener({ natural: '17' }), message).ok, true);
  assert.equal(matchListener(listener({ natural: '18-20' }), message).ok, false);
});

test('plain text ignores case and regular expression symbols', () => {
  const message = analyseMessage({
    type: 'general',
    who: 'Bob',
    content: 'Attack (Longsword) +5 hits?',
  });
  assert.equal(matchListener(listener({ text: ['attack (longsword) +5'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['hits?'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['misses'] }), message).ok, false);
  assert.equal(matchListener(listener({ text: ['Attack', 'hits'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['Attack', 'misses'] }), message).ok, false);
});

test('regular expression text', () => {
  const message = analyseMessage({ type: 'general', who: 'Bob', content: 'Rolled a 17' });
  assert.equal(matchListener(listener({ text: ['rolled a \\d+'], regex: true }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['^a'], regex: true }), message).ok, false);
});

test('## limits roll checks to the rolls it found, at any index', () => {
  const inlinerolls = Array.from({ length: 12 }, (_, i) =>
    inlineRoll('1d20', [dice(20, [i === 11 ? 20 : 5])], i === 11 ? 20 : 5)
  );
  const content = Array.from({ length: 12 }, (_, i) => `{{r${i}=$[[${i}]]}}`).join(' ');
  const message = analyseMessage({
    type: 'general',
    who: 'Bob',
    rolltemplate: 'simple',
    content,
    inlinerolls,
  });
  const text = matchText(listener({ text: ['r11=##'] }), message);
  assert.deepEqual([...text.rollIndexes], [11]);
  assert.equal(matchListener(listener({ text: ['r11=##'], results: ['crit'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['r10=##'], results: ['crit'] }), message).ok, false);
  // Without ##, every roll is checked (v1 never checked rolls here).
  assert.equal(matchListener(listener({ text: ['r1='], results: ['crit'] }), message).ok, true);
});

test('rollable table results can be matched as text', () => {
  const message = analyseMessage({
    type: 'general',
    who: 'GM',
    content: 'Encounter: $[[0]]',
    inlinerolls: [
      {
        expression: '1t[Encounters]',
        results: {
          total: 1,
          rolls: [
            {
              type: 'R',
              table: 'Encounters',
              sides: 6,
              results: [{ v: 1, tableItem: { name: 'Combat' } }],
            },
          ],
        },
      },
    ],
  });
  assert.equal(message.text, 'Encounter: Combat');
  assert.equal(matchListener(listener({ text: ['combat'] }), message).ok, true);
  // Table dice are not crits.
  assert.equal(matchListener(listener({ results: ['crit'], dice: 'any' }), message).ok, false);
});

test('/roll results are read from their JSON content', () => {
  const message = analyseMessage({
    type: 'rollresult',
    who: 'Bob',
    origRoll: '1d20+2',
    content: JSON.stringify({ type: 'V', total: 22, rolls: [dice(20, [20]), math('+2')] }),
  });
  assert.equal(message.rolls[0].total, 22);
  assert.equal(matchListener(listener({ results: ['crit'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['1d20+2'] }), message).ok, true);
});

test('templates, types, speakers and players filter', () => {
  const message = attack({ d20: [20] });
  assert.equal(matchListener(listener({ templates: ['ATKDMG', 'atk'] }), message).ok, true);
  assert.equal(matchListener(listener({ templates: ['simple'] }), message).reason, 'template');
  assert.equal(matchListener(listener({ templates: ['none'] }), message).ok, false);
  assert.equal(matchListener(listener({ who: ['alice'] }), message).ok, true);
  assert.equal(matchListener(listener({ who: ['Bob'] }), message).reason, 'who');
  assert.equal(matchListener(listener({ types: ['emote'] }), message).reason, 'type');
  const api = analyseMessage({ type: 'api', who: 'Bob', content: '!something' });
  assert.equal(matchListener(listener({}), api).reason, 'type');
  assert.equal(matchListener(listener({ types: ['api'] }), api).ok, true);
  const named = analyseMessage(
    { type: 'general', who: 'Bob', content: 'hi' },
    { playerName: 'Sam' }
  );
  assert.equal(matchListener(listener({ players: ['sam'] }), named).ok, true);
  assert.equal(matchListener(listener({ players: ['Kim'] }), named).reason, 'player');
});

test('character comes from the template, GM suffix is removed', () => {
  const message = analyseMessage({
    type: 'general',
    who: 'The GM (GM)',
    rolltemplate: 'npcatk',
    content: '{{character_name=Goblin}}',
  });
  assert.equal(message.who, 'The GM');
  assert.equal(message.character, 'Goblin');
});

test('HTML content is searchable as text', () => {
  const message = analyseMessage({
    type: 'general',
    who: 'Bob',
    content: '<div class="x"><span>Strength&nbsp;Save</span> &amp; more</div>',
  });
  assert.equal(message.text, 'Strength Save & more');
  assert.equal(matchListener(listener({ text: ['strength save'] }), message).ok, true);
});

test('switched off listeners never match', () => {
  assert.equal(matchListener(listener({ enabled: false }), attack()).reason, 'disabled');
});
