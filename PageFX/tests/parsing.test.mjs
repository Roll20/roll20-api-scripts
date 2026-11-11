import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseArgs } from '../src/commands.js';
import { query } from '../src/menu.js';
import { normaliseDefinition, parseFxSpec } from '../src/fx.js';
import { computeLivePages, readSplitPages } from '../src/pages.js';
import { cleanInterval, migrateState, readV1Token } from '../src/state.js';
import { decodeNotes, toNumber } from '../src/utils.js';

const token = (attrs) => ({ get: (k) => attrs[k] });

test('built-in effects parse in any case, with v1 aliases', () => {
  assert.deepEqual(parseFxSpec('explode-fire'), {
    ok: true,
    fx: { kind: 'builtin', value: 'explode-fire' },
  });
  assert.deepEqual(parseFxSpec(' Explosion-FIRE '), {
    ok: true,
    fx: { kind: 'builtin', value: 'explode-fire' },
  });
  assert.equal(parseFxSpec('beam-acid').fx.value, 'beam-acid');
});

test('a known type with an unknown colour is an error', () => {
  const r = parseFxSpec('burn-purple');
  assert.equal(r.ok, false);
  assert.equal(r.error, 'fx.unknownColour');
});

test('anything else is a saved custom FX name, even with a hyphen', () => {
  assert.deepEqual(parseFxSpec('Steam-Vent'), {
    ok: true,
    fx: { kind: 'saved', value: 'Steam-Vent' },
  });
  assert.deepEqual(parseFxSpec('Rain'), { ok: true, fx: { kind: 'saved', value: 'Rain' } });
});

test('JSON definitions parse, and get both colour spellings', () => {
  const r = parseFxSpec('{"maxParticles":10,"startColour":[1,2,3,1]}');
  assert.equal(r.ok, true);
  assert.equal(r.fx.kind, 'custom');
  assert.deepEqual(r.fx.value.startColor, [1, 2, 3, 1]);
  assert.deepEqual(r.fx.value.startColour, [1, 2, 3, 1]);
  assert.equal(parseFxSpec('{oops').error, 'fx.badJson');
  assert.equal(parseFxSpec('').error, 'fx.empty');
});

test('JSON definitions get the values Roll20 needs, without overriding given ones', () => {
  const r = parseFxSpec('{"lifeSpan":40,"startColor":[0,255,0,1]}');
  assert.equal(r.fx.value.lifeSpan, 40);
  assert.equal(r.fx.value.lifeSpanRandom, 0);
  assert.equal(r.fx.value.maxParticles, 100);
  assert.deepEqual(r.fx.value.startColour, [0, 255, 0, 1]);
  assert.deepEqual(r.fx.value.endColor, [0, 0, 0, 0]);
});

test('normaliseDefinition keeps an existing spelling', () => {
  const d = normaliseDefinition({ endColor: [9, 9, 9, 0], endColour: [1, 1, 1, 1] });
  assert.deepEqual(d.endColor, [9, 9, 9, 0]);
  assert.deepEqual(d.endColour, [1, 1, 1, 1]);
});

test('negative angles become positive (Legacy draws nothing for them), except -1 for beams', () => {
  assert.equal(normaliseDefinition({ angle: -90 }).angle, 270);
  assert.equal(normaliseDefinition({ angle: -450 }).angle, 270);
  assert.equal(normaliseDefinition({ angle: -1 }).angle, -1);
  assert.equal(normaliseDefinition({ angle: 45 }).angle, 45);
});

test('GM Notes are decoded and stripped of HTML', () => {
  assert.equal(decodeNotes(encodeURIComponent('<p>explode-fire</p>')), 'explode-fire');
  assert.equal(decodeNotes('<p>{&quot;a&quot;:1}</p>'), '{"a":1}');
  assert.equal(decodeNotes('100%'), '100%');
});

test('numbers are read from text, and junk is rejected', () => {
  assert.equal(toNumber('250'), 250);
  assert.equal(toNumber(' 1.5 '), 1.5);
  assert.equal(toNumber(''), null);
  assert.equal(toNumber('random'), null);
  assert.equal(toNumber(Number.NaN), null);
});

test('v1 tokens: bars as text give a numeric interval range', () => {
  const r = readV1Token(
    token({
      gmnotes: 'bubbling-water',
      bar1_value: '500',
      bar1_max: '2000',
      bar2_value: '',
      bar2_max: '',
    })
  );
  assert.deepEqual(r.layer.interval, [500, 2000]);
  assert.equal(r.layer.direction, null);
  assert.equal(r.enabled, true);
});

test('v1 tokens: an empty Bar 1 means 100 ms, as in v1', () => {
  const r = readV1Token(token({ gmnotes: 'glow-holy', bar1_value: '', bar1_max: '' }));
  assert.deepEqual(r.layer.interval, [100, 100]);
});

test('v1 tokens: Bar 2 gives the beam offset, or random', () => {
  assert.deepEqual(
    readV1Token(token({ gmnotes: 'beam-acid', bar2_value: '2', bar2_max: '-1' })).layer.direction,
    { dx: 2, dy: -1 }
  );
  assert.equal(
    readV1Token(token({ gmnotes: 'beam-acid', bar2_value: 'random', bar2_max: '' })).layer
      .direction,
    'random'
  );
});

test('v1 tokens: the interdiction marker means off, and bad notes are kept as an error', () => {
  const r = readV1Token(token({ gmnotes: 'burn-purple', statusmarkers: 'red,interdiction' }));
  assert.equal(r.enabled, false);
  assert.equal(r.layer.fx, null);
  assert.equal(r.layer.error, 'fx.unknownColour');
});

test('intervals are ordered and kept in range', () => {
  assert.deepEqual(cleanInterval([900, 100]), [100, 900]);
  assert.deepEqual(cleanInterval(['x']), [100, 100]);
  assert.deepEqual(cleanInterval([0, 0]), [1, 1]);
});

test('live pages: ribbon plus every split-party page, plus GM pages when asked', () => {
  assert.deepEqual([...computeLivePages({ ribbon: 'a', split: false })], ['a']);
  assert.deepEqual(
    [...computeLivePages({ ribbon: 'a', split: { p1: 'b', p2: 'c', p3: 'b' } })].sort(),
    ['a', 'b', 'c']
  );
  assert.deepEqual(
    [...computeLivePages({ ribbon: 'a', split: false, gmPages: ['d', ''] })].sort(),
    ['a', 'd']
  );
  assert.deepEqual(readSplitPages('{"p1":"b"}'), { p1: 'b' });
  assert.equal(readSplitPages(''), false);
});

test('state migration fills gaps and keeps effects', () => {
  const { state, fresh } = migrateState({
    effects: { t1: { name: 'Rain', intensity: 99, layers: [{}] } },
  });
  assert.equal(fresh, false);
  assert.equal(state.effects.t1.intensity, 5);
  assert.deepEqual(state.effects.t1.layers[0].interval, [100, 100]);
  assert.equal(state.settings.maxSpawnsPerSecond, 30);
  assert.equal(migrateState(undefined).fresh, true);
});

test('--ids takes comma or space separated lists; --layer and menu flags are read', () => {
  assert.deepEqual(parseArgs(['2', '--ids', 'a,b', 'c', '--x']), {
    args: ['2', '--x'],
    ids: ['a', 'b', 'c'],
    layer: null,
    back: null,
  });
  assert.deepEqual(parseArgs(['on']), { args: ['on'], ids: null, layer: null, back: null });
  assert.deepEqual(parseArgs(['500', '--layer', '2', '--Edit']), {
    args: ['500'],
    ids: null,
    layer: 2,
    back: 'edit',
  });
});

test('roll queries: options with | , and } are made safe', () => {
  assert.equal(query('Name?', 'Rain'), '?{Name?|Rain}');
  assert.equal(query('Pick|one}'), '?{Pickone}');
  assert.equal(
    query('Saved', ['Rain', 'Steam, vent', ['Yes', 'yes']]),
    '?{Saved|Rain|Steam&#44; vent|Yes,yes}'
  );
});
