// D&D 2024 (Beacon) roll cards, captured from a live Jumpgate game.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { analyseMessage } from '../src/analyse.js';
import { DEFAULT_LISTENER } from '../src/constants.js';
import { matchListener } from '../src/match.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARD = fs.readFileSync(path.join(__dirname, 'fixtures', 'dnd2024-check.html'), 'utf8');

const listener = (rules) => ({ ...DEFAULT_LISTENER, name: 'Test', ...rules });

/** The card as the API receives it, with a chosen natural d20. */
function check(natural) {
  return analyseMessage({
    type: 'advancedroll',
    who: 'MidNiteShadow7 (GM)',
    playerid: 'gm1',
    content: CARD.replace('NATURAL', String(natural)),
  });
}

test('reads the card: template, character, fields and the d20', () => {
  const message = check(19);
  assert.equal(message.type, 'advancedroll');
  assert.equal(message.template, 'dnd-2024');
  assert.equal(message.who, 'MidNiteShadow7');
  assert.equal(message.character, 'Skeleton');
  assert.equal(message.fields.title, 'Dexterity Check');
  assert.equal(message.fields.subcategory, 'Ability Check');
  assert.equal(message.fields.mode, 'Normal');
  assert.equal(message.fields.base, '22');
  assert.equal(message.rolls.length, 1);
  assert.equal(message.rolls[0].expression, '1d20');
  assert.equal(message.rolls[0].total, 22);
  assert.deepEqual(
    message.rolls[0].dice.map((d) => [d.sides, d.value]),
    [[20, 19]]
  );
  assert.match(message.text, /Dexterity Check/);
});

test('crits, fumbles, totals and naturals work on Beacon rolls', () => {
  assert.equal(matchListener(listener({ results: ['crit'] }), check(20)).ok, true);
  assert.equal(matchListener(listener({ results: ['crit'] }), check(19)).ok, false);
  assert.equal(matchListener(listener({ results: ['fumble'] }), check(1)).ok, true);
  assert.equal(matchListener(listener({ total: '>=20' }), check(19)).ok, true);
  assert.equal(matchListener(listener({ natural: '19' }), check(19)).ok, true);
});

test('Beacon filters: template, character, type and text', () => {
  const message = check(5);
  assert.equal(matchListener(listener({ templates: ['dnd-2024'] }), message).ok, true);
  assert.equal(matchListener(listener({ who: ['skeleton'] }), message).ok, true);
  assert.equal(matchListener(listener({ types: ['advancedroll'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['dexterity check'] }), message).ok, true);
  assert.equal(matchListener(listener({ text: ['strength check'] }), message).ok, false);
});

/** The card plus the msg.rolls data Roll20 sends with it (captured live). */
function withRolls(results, natural = results[0].v) {
  return analyseMessage({
    type: 'advancedroll',
    who: 'MidNiteShadow7 (GM)',
    playerid: 'gm1',
    characterId: '-P54J97bsYO6ScrFKs5b',
    rolledByCharacterId: '-P54J97bsYO6ScrFKs5b',
    content: CARD.replace('NATURAL', String(natural)),
    rolls: {
      Base: {
        expression: '1d20',
        rollName: 'Base',
        results: {
          resultType: 'sum',
          type: 'V',
          total: natural,
          rolls: [{ type: 'R', dice: results.length, sides: 20, results }],
        },
      },
    },
  });
}

test('msg.rolls is preferred, keeping the card total and the character ID', () => {
  const message = withRolls([{ v: 3, isCrit: false, isFumble: false }]);
  assert.equal(message.characterId, '-P54J97bsYO6ScrFKs5b');
  assert.equal(message.rolls.length, 1);
  assert.equal(message.rolls[0].name, 'Base');
  assert.equal(message.rolls[0].total, 22);
  assert.deepEqual(
    message.rolls[0].dice.map((d) => d.value),
    [3]
  );
});

test('Beacon isCrit / isFumble flags and dropped dice are honoured', () => {
  const crit = withRolls([{ v: 20, isCrit: true, isFumble: false }]);
  assert.equal(matchListener(listener({ results: ['crit'] }), crit).ok, true);
  // A sheet with an expanded crit range marks a 19 as a crit itself.
  const wide = withRolls([{ v: 19, isCrit: true, isFumble: false }]);
  assert.equal(matchListener(listener({ results: ['crit'] }), wide).ok, true);
  const dropped = withRolls(
    [
      { v: 20, isCrit: true, isFumble: false, d: true },
      { v: 7, isCrit: false, isFumble: false },
    ],
    7
  );
  assert.equal(matchListener(listener({ results: ['crit'] }), dropped).ok, false);
});

test('damage cards are not crits with the auto dice setting, and actions become fields', () => {
  const damage = analyseMessage({
    type: 'advancedroll',
    who: 'MidNiteShadow7 (GM)',
    content: CARD.replace('NATURAL', '12').replace('Ability Check', 'Damage'),
    action: { action: 'repeating_attack', args: ['rLeC9pdKB', 'attack', 'dmg'] },
    rolls: {
      wUMf: {
        expression: '1d12+3',
        rollName: 'wUMf',
        results: {
          total: 15,
          rolls: [
            { type: 'R', dice: 1, sides: 12, results: [{ v: 12, isCrit: false, isFumble: false }] },
            { type: 'M', expr: '+3' },
          ],
        },
      },
    },
  });
  assert.equal(damage.fields.subcategory, 'Damage');
  assert.equal(damage.fields.action, 'repeating_attack');
  assert.equal(damage.fields.args, 'rLeC9pdKB attack dmg');
  assert.equal(matchListener(listener({ results: ['crit'] }), damage).ok, false);
  assert.equal(matchListener(listener({ total: '>=15' }), damage).ok, true);
});

test('advantage (2d20kh1) uses the kept die, as captured live', () => {
  const roll = (kept, dropped) =>
    analyseMessage({
      type: 'advancedroll',
      who: 'MidNiteShadow7 (GM)',
      content: CARD.replace('NATURAL', String(kept)).replaceAll('Normal', 'Advantage'),
      rolls: {
        Base: {
          expression: '2d20kh1',
          rollName: 'Base',
          results: {
            resultType: 'sum',
            type: 'V',
            total: kept,
            rolls: [
              {
                type: 'R',
                dice: 2,
                sides: 20,
                mods: { keep: { count: 1, end: 'h' } },
                results: [
                  { v: kept, isCrit: kept === 20, isFumble: kept === 1 },
                  { v: dropped, d: true, isCrit: dropped === 20, isFumble: dropped === 1 },
                ],
              },
            ],
          },
        },
      },
    });
  const message = roll(5, 20);
  assert.equal(message.fields.mode, 'Advantage');
  assert.deepEqual(
    message.rolls[0].dice.map((d) => d.value),
    [5]
  );
  assert.equal(matchListener(listener({ results: ['crit'] }), message).ok, false);
  assert.equal(matchListener(listener({ results: ['crit'] }), roll(20, 5)).ok, true);
  assert.equal(matchListener(listener({ results: ['fumble'] }), roll(1, 1)).ok, true);
});
