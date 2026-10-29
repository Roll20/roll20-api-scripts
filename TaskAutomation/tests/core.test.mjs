// Pure core: utilities, expressions, recurrence, the validator and state
// migrations (plan §4.3, §5, §12.1, §15).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MISSING, evaluate, renderTemplate, validateExpression } from '../src/expressions.js';
import {
  countBetween,
  listFrom,
  nextAtOrAfter,
  nextAfter,
  normaliseSpec,
} from '../src/recurrence.js';
import {
  blockAlwaysSuspends,
  compileDefinition,
  findCallCycle,
  validateDefinition,
} from '../src/schema.js';
import { TEMPLATES } from '../src/templates.js';
import {
  checkPlainData,
  neutraliseChatText,
  parseDuration,
  parseIsoInstant,
  parseJsonSafe,
  parseStrictNumber,
  parseUtcOffset,
  quoteArg,
  tokenize,
} from '../src/utils.js';

const DAY = 24 * 3600 * 1000;
const limits = { minIntervalMs: 1000 };
const ctx = (values) => ({
  resolve: (path) => (path in values ? { found: true, value: values[path] } : { found: false }),
});

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

test('tokenizer keeps quoted phrases, escaped quotes and a raw --json payload', () => {
  const { words, json } = tokenize(
    ' definition create --name "Say \\"hi\\" now" --json {"a": "--b c"}'
  );
  assert.deepEqual(
    words.map((w) => w.text),
    ['definition', 'create', '--name', 'Say "hi" now']
  );
  assert.equal(json, '{"a": "--b c"}');
  assert.equal(tokenize('say "open').error, 'unterminatedQuote');
  assert.equal(quoteArg('run-42'), 'run-42');
  assert.equal(tokenize(`x ${quoteArg('a "b" c')}`).words[1].text, 'a "b" c');
});

test('durations need a unit and instants need an offset', () => {
  assert.equal(parseDuration('500ms'), 500);
  assert.equal(parseDuration('10s'), 10000);
  assert.equal(parseDuration('5m'), 300000);
  assert.equal(parseDuration('2h'), 7200000);
  assert.equal(parseDuration('1d'), DAY);
  assert.equal(parseDuration('10'), null);
  assert.equal(parseDuration('1w'), null);
  assert.equal(parseIsoInstant('2026-11-01T19:00:00Z'), Date.UTC(2026, 10, 1, 19));
  assert.equal(parseIsoInstant('2026-11-01T19:00:00+01:00'), Date.UTC(2026, 10, 1, 18));
  assert.equal(parseIsoInstant('2026-11-01T19:00:00'), null);
  assert.equal(parseIsoInstant('2026-02-30T10:00Z'), null);
  assert.equal(parseUtcOffset('-05:30'), -330);
  assert.equal(parseUtcOffset('+15:00'), null);
});

test('malformed numbers are not zero', () => {
  assert.equal(parseStrictNumber('12'), 12);
  assert.equal(parseStrictNumber('-1.5'), -1.5);
  assert.equal(parseStrictNumber(''), null);
  assert.equal(parseStrictNumber('12abc'), null);
  assert.equal(parseStrictNumber('Infinity'), null);
});

test('imported JSON rejects prototype keys, cycles and oversize input', () => {
  assert.equal(parseJsonSafe('{"__proto__": {"x": 1}}', 1000).error, 'unsafeKey');
  assert.equal(parseJsonSafe('{"a": {"constructor": 1}}', 1000).error, 'unsafeKey');
  assert.equal(parseJsonSafe('{"a": 1}', 3).error, 'tooLarge');
  assert.equal(parseJsonSafe('{bad', 100).error, 'badJson');
  const loop = {};
  loop.self = loop;
  assert.equal(checkPlainData(loop).error, 'cycle');
  assert.equal(checkPlainData({ d: new Date() }).error, 'notPlain');
  let deep = {};
  for (let i = 0; i < 40; i += 1) {
    deep = { deep };
  }
  assert.equal(checkPlainData(deep).error, 'tooDeep');
});

test('chat values cannot start commands or add lines', () => {
  assert.equal(neutraliseChatText('/w gm secret'), 'w gm secret');
  assert.equal(neutraliseChatText('!token-mod --set'), 'token-mod --set');
  assert.equal(neutraliseChatText('hi\n/em dances'), 'hi /em dances');
});

// ---------------------------------------------------------------------------
// Expressions
// ---------------------------------------------------------------------------

test('comparisons do not coerce and missing values stay missing', () => {
  assert.equal(
    evaluate(
      { op: 'lte', left: { ref: 'event.new.bar1_value', as: 'number' }, right: 0 },
      ctx({ 'event.new.bar1_value': '0' })
    ),
    true
  );
  assert.equal(evaluate({ op: 'eq', left: { ref: 'x' }, right: 0 }, ctx({ x: '0' })), false);
  assert.equal(evaluate({ op: 'lt', left: { ref: 'missing' }, right: 1 }, ctx({})), false);
  assert.equal(evaluate({ op: 'add', left: { ref: 'missing' }, right: 1 }, ctx({})), MISSING);
  assert.equal(evaluate({ ref: 'x', as: 'number' }, ctx({ x: 'abc' })), MISSING);
  assert.equal(evaluate({ ref: 'x', as: 'number', default: 5 }, ctx({ x: 'abc' })), 5);
  assert.equal(evaluate({ op: 'div', left: 1, right: 0 }, ctx({})), MISSING);
  assert.equal(evaluate({ op: 'exists', arg: { ref: 'x' } }, ctx({})), false);
  assert.equal(evaluate({ op: 'not', arg: { ref: 'x' } }, ctx({})), MISSING);
});

test('logic, strings, markers and crossings', () => {
  const c = ctx({ a: 3, s: 'Hello', m: 'red,dead@2', old: '5', new: '0' });
  assert.equal(
    evaluate(
      {
        op: 'all',
        args: [
          { op: 'gt', left: { ref: 'a' }, right: 1 },
          { op: 'startsWith', left: { ref: 's' }, right: 'He' },
        ],
      },
      c
    ),
    true
  );
  assert.equal(evaluate({ op: 'concat', args: [{ ref: 's' }, ' ', { ref: 'a' }] }, c), 'Hello 3');
  assert.equal(evaluate({ op: 'hasMarker', left: { ref: 'm' }, right: 'dead' }, c), true);
  assert.equal(evaluate({ op: 'crossBelow', args: [{ ref: 'old' }, { ref: 'new' }, 0] }, c), true);
  assert.equal(evaluate({ op: 'crossBelow', args: [{ ref: 'new' }, { ref: 'new' }, 0] }, c), false);
  assert.equal(evaluate({ op: 'if', cond: false, then: 1, else: 2 }, c), 2);
  assert.equal(evaluate({ op: 'randomInt', args: [1, 6] }, { ...c, random: () => 0.999 }), 6);
});

test('expression validation rejects unknown roots, operators, fields and huge trees', () => {
  const roots = new Set(['event', 'var']);
  assert.deepEqual(
    validateExpression({ op: 'eq', left: { ref: 'event.x' }, right: 1 }, { roots }),
    []
  );
  assert.equal(validateExpression({ ref: 'globalThis.state' }, { roots })[0].code, 'refRoot');
  assert.equal(
    validateExpression({ ref: 'event.__proto__.x' }, { roots }).length,
    0,
    'path is checked at read time'
  );
  assert.equal(validateExpression({ op: 'eval', args: [1] }, { roots })[0].code, 'badOperator');
  assert.equal(
    validateExpression({ op: 'eq', left: 1, right: 2, extra: 1 }, { roots })[0].code,
    'unknownField'
  );
  let deep = 1;
  for (let i = 0; i < 30; i += 1) {
    deep = { op: 'neg', arg: deep };
  }
  assert.ok(validateExpression(deep, { roots }).some((e) => e.code === 'exprTooDeep'));
});

test('templates escape values and report missing ones', () => {
  const out = renderTemplate(
    'Hi {{param.name}} {{param.none}}',
    (p) => (p === 'param.name' ? { found: true, value: '<b>' } : { found: false }),
    (v) => v.replace('<', '&lt;')
  );
  assert.equal(out.text, 'Hi &lt;b> ');
  assert.deepEqual(out.missing, ['param.none']);
});

// ---------------------------------------------------------------------------
// Recurrence
// ---------------------------------------------------------------------------

test('fixed-rate intervals are computed from the anchor, without drift', () => {
  const anchor = Date.UTC(2026, 10, 1, 19);
  const spec = normaliseSpec({ kind: 'interval', everyMs: 600000, anchor }, limits).spec;
  assert.equal(nextAtOrAfter(spec, anchor - 5), anchor);
  assert.equal(nextAfter(spec, anchor + 1), anchor + 600000);
  assert.equal(countBetween(spec, anchor, anchor + 3600000), 7);
});

test('years of missed occurrences are counted arithmetically', () => {
  const spec = normaliseSpec({ kind: 'interval', everyMs: 1000, anchor: 0 }, limits).spec;
  const started = performance.now();
  const count = countBetween(spec, 0, 10 * 365 * DAY);
  assert.equal(count, 10 * 365 * 86400 + 1);
  const weekly = normaliseSpec(
    { kind: 'weekly', time: '19:00', offsetMinutes: 0, days: 'mon,fri' },
    limits
  ).spec;
  assert.equal(countBetween(weekly, Date.UTC(2026, 0, 1), Date.UTC(2036, 0, 1)), 1044);
  assert.ok(performance.now() - started < 50);
});

test('daily and weekly schedules use the fixed offset, across month, year and leap days', () => {
  const daily = normaliseSpec({ kind: 'daily', time: '00:30', offsetMinutes: 60 }, limits).spec;
  // 00:30 at +01:00 is 23:30 UTC the day before.
  assert.equal(nextAtOrAfter(daily, Date.UTC(2028, 1, 28, 12)), Date.UTC(2028, 1, 28, 23, 30));
  assert.equal(nextAfter(daily, Date.UTC(2028, 1, 28, 23, 30)), Date.UTC(2028, 1, 29, 23, 30));
  assert.equal(nextAfter(daily, Date.UTC(2026, 11, 31, 23, 30)), Date.UTC(2027, 0, 1, 23, 30));
  const weekly = normaliseSpec(
    { kind: 'weekly', time: '19:00', offsetMinutes: 0, days: ['fri'] },
    limits
  ).spec;
  // 2026-10-30 is a Friday.
  assert.equal(nextAtOrAfter(weekly, Date.UTC(2026, 9, 29)), Date.UTC(2026, 9, 30, 19));
  // Changing the offset for summer time moves the UTC time an hour earlier.
  const summer = { ...weekly, offsetMinutes: 60 };
  assert.equal(nextAtOrAfter(summer, Date.UTC(2026, 9, 29)), Date.UTC(2026, 9, 30, 18));
});

test('windows and invalid specs', () => {
  const anchor = Date.UTC(2026, 0, 1);
  const spec = normaliseSpec(
    { kind: 'interval', everyMs: DAY, anchor, startAt: anchor + 2 * DAY, endAt: anchor + 4 * DAY },
    limits
  ).spec;
  assert.deepEqual(listFrom(spec, anchor, 10), [
    anchor + 2 * DAY,
    anchor + 3 * DAY,
    anchor + 4 * DAY,
  ]);
  assert.equal(countBetween(spec, anchor, anchor + 30 * DAY), 3);
  assert.equal(
    normaliseSpec({ kind: 'interval', everyMs: 10, anchor }, limits).error,
    'intervalTooShort'
  );
  assert.equal(
    normaliseSpec({ kind: 'daily', time: '25:00', offsetMinutes: 0 }, limits).error,
    'badTime'
  );
  assert.equal(
    normaliseSpec({ kind: 'weekly', time: '10:00', offsetMinutes: 0, days: 'funday' }, limits)
      .error,
    'badDays'
  );
});

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

test('every template is a valid definition', () => {
  for (const tpl of TEMPLATES) {
    const result = validateDefinition(tpl);
    assert.deepEqual(result.errors, [], tpl.id);
    const compiled = compileDefinition(tpl);
    assert.ok(compiled.blocks.has('root'));
  }
});

const minimal = (extra = {}) => ({
  schemaVersion: 1,
  id: 'test',
  name: 'Test',
  triggers: [{ id: 'manual', type: 'manual' }],
  steps: [{ id: 'say', type: 'chat.send', text: 'hi' }],
  ...extra,
});

test('the validator rejects unknown fields, duplicates and bad references', () => {
  const codes = (def) => validateDefinition(def).errors.map((e) => e.code);
  assert.ok(codes(minimal({ extra: 1 })).includes('unknownField'));
  assert.ok(
    codes(
      minimal({
        steps: [
          { id: 'a', type: 'wait', durationMs: 1000 },
          { id: 'a', type: 'wait', durationMs: 1000 },
        ],
      })
    ).includes('duplicateId')
  );
  assert.ok(codes(minimal({ steps: [{ id: 'a', type: 'nope' }] })).includes('unknownAction'));
  assert.ok(
    codes(
      minimal({
        steps: [{ id: 'a', type: 'token.set', target: { binding: 'x' }, set: { left: 1 } }],
      })
    ).includes('unknownBinding')
  );
  assert.ok(
    codes(
      minimal({
        steps: [{ id: 'a', type: 'token.set', target: { ids: ['-a'] }, set: { imgsrc: 'x' } }],
      })
    ).includes('badProperty')
  );
  assert.ok(
    codes(minimal({ steps: [{ id: 'a', type: 'wait', durationMs: 5 }] })).includes('waitTooShort')
  );
  assert.ok(codes(minimal({ schemaVersion: 2 })).includes('schemaVersion'));
  assert.ok(
    codes(minimal({ steps: [{ id: 'a', type: 'chat.send', text: '{{globalThis.x}}' }] })).includes(
      'refRoot'
    )
  );
});

test('forever loops need permission and a wait on every pass', () => {
  const loop = (steps, allow = true) =>
    minimal({
      policy: { allowForever: allow },
      steps: [{ id: 'l', type: 'loop', mode: 'forever', steps }],
    });
  const codes = (def) => validateDefinition(def).errors.map((e) => e.code);
  assert.deepEqual(codes(loop([{ id: 'w', type: 'wait', durationMs: 1000 }])), []);
  assert.ok(
    codes(loop([{ id: 'w', type: 'wait', durationMs: 1000 }], false)).includes('foreverNotAllowed')
  );
  assert.ok(codes(loop([{ id: 's', type: 'chat.send', text: 'x' }])).includes('foreverNoWait'));
  assert.ok(
    codes(
      loop([
        {
          id: 'i',
          type: 'if',
          condition: true,
          then: [{ id: 'w', type: 'wait', durationMs: 1000 }],
        },
      ])
    ).includes('foreverNoWait')
  );
  assert.equal(
    blockAlwaysSuspends([{ id: 'w', type: 'wait', durationMs: { ref: 'param.x' } }]),
    false
  );
});

test('unattended starts act as the GM service and cannot use selection', () => {
  const def = minimal({
    bindings: { t: { from: 'selected', objectType: 'graphic' } },
    triggers: [{ id: 'e', type: 'event', event: 'token.change' }],
  });
  const codes = validateDefinition(def).errors.map((e) => e.code);
  assert.ok(codes.includes('unattendedNeedsService'));
  assert.ok(codes.includes('selectionUnattended'));
});

test('player definitions cannot use GM-only actions or act as the GM', () => {
  const def = minimal({
    access: { mode: 'players', players: ['p1'], authority: 'gmService' },
    steps: [
      { id: 'cmd', type: 'integration.command', command: '!token-mod --flip' },
      { id: 'a', type: 'attribute.set', target: { ids: ['-c'] }, attribute: 'hp', value: 1 },
    ],
  });
  const codes = validateDefinition(def).errors.map((e) => e.code);
  assert.ok(codes.includes('playersNeedInitiator'));
  assert.ok(codes.includes('gmOnlyAction'));
  assert.ok(codes.includes('notPlayerCapability'));
});

test('call cycles are found', () => {
  const graph = { a: ['b'], b: ['c'], c: ['a'], d: [] };
  assert.deepEqual(
    findCallCycle('a', (id) => graph[id] || []),
    ['a', 'b', 'c', 'a']
  );
  assert.equal(
    findCallCycle('d', (id) => graph[id] || []),
    null
  );
});

test('limits on steps, depth and branches', () => {
  let nested = [{ id: 'leaf', type: 'wait', durationMs: 1000 }];
  for (let i = 0; i < 10; i += 1) {
    nested = [{ id: `l${i}`, type: 'loop', mode: 'count', count: 1, steps: nested }];
  }
  assert.ok(
    validateDefinition(minimal({ steps: nested })).errors.some((e) => e.code === 'tooDeep')
  );
  const branches = Array.from({ length: 12 }, (_, i) => ({
    id: `b${i}`,
    steps: [{ id: `w${i}`, type: 'wait', durationMs: 1000 }],
  }));
  assert.ok(
    validateDefinition(
      minimal({ steps: [{ id: 'p', type: 'parallel', join: 'all', branches }] })
    ).errors.some((e) => e.code === 'branchCount')
  );
});
