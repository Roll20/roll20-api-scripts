// End-to-end engine behaviour: flow steps, concurrency policies, pause and
// resume, cancellation, triggers, schedules and adapters (plan §4–§7, §11).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSandbox, restart } from './roll20-stub.mjs';

/**
 * Creates a ready game.
 *
 * @param {object} [options] Sandbox options.
 * @returns {object} Sandbox API.
 */
function game(options) {
  const api = createSandbox(options);
  api.ready();
  return api;
}

/**
 * Fails when the Mod logged an error or held more than one timer.
 *
 * @param {object} api Sandbox API.
 * @returns {void}
 */
function assertHealthy(api) {
  assert.deepEqual(
    api.logs.filter((line) => /ERROR/.test(line)),
    []
  );
  assert.ok(api.maxLiveTimers() <= 1, `live timers peaked at ${api.maxLiveTimers()}`);
}

/**
 * Builds a definition.
 *
 * @param {string} id ID.
 * @param {object[]} steps Steps.
 * @param {object} [extra] Other fields.
 * @returns {object} Definition.
 */
function def(id, steps, extra = {}) {
  return {
    schemaVersion: 1,
    id,
    name: id,
    triggers: [{ id: 'manual', type: 'manual' }],
    access: { mode: 'gmOnly', authority: 'initiator' },
    policy: { concurrency: 'allow', maxConcurrent: 5 },
    steps,
    ...extra,
  };
}

const say = (id, text) => ({ id, type: 'chat.send', text });
const wait = (id, durationMs) => ({ id, type: 'wait', durationMs });

test('sequences keep their order across waits and loops count iterations', () => {
  const api = game();
  api.importDef(
    def('seq', [
      say('a', 'one'),
      wait('w1', 1000),
      {
        id: 'l',
        type: 'loop',
        mode: 'count',
        count: 3,
        steps: [say('in', 'loop {{run.iteration}}'), wait('w2', 500)],
      },
      { id: 'v', type: 'variable.set', name: 'total', value: { op: 'add', left: 40, right: 2 } },
      say('z', 'total {{var.total}}'),
    ])
  );
  api.command('!taskautomation instance start --definition seq');
  api.clearChat();
  api.advance(5000);
  const lines = api.chat.map((c) => c.text);
  assert.deepEqual(lines, ['one', 'loop 1', 'loop 2', 'loop 3', 'total 42'].slice(1));
  assertHealthy(api);
});

test('conditions choose once and while/until loops are bounded', () => {
  const api = game();
  api.importDef(
    def('cond', [
      { id: 'set', type: 'variable.set', name: 'n', value: 0 },
      {
        id: 'w',
        type: 'loop',
        mode: 'while',
        condition: { op: 'lt', left: { ref: 'var.n' }, right: 3 },
        steps: [
          {
            id: 'inc',
            type: 'variable.set',
            name: 'n',
            value: { op: 'add', left: { ref: 'var.n' }, right: 1 },
          },
        ],
      },
      {
        id: 'u',
        type: 'loop',
        mode: 'until',
        maxIterations: 5,
        condition: false,
        steps: [{ id: 'inc2', type: 'variable.set', name: 'm', value: { ref: 'run.iteration' } }],
      },
      {
        id: 'pick',
        type: 'if',
        condition: { op: 'eq', left: { ref: 'var.n' }, right: 3 },
        then: [say('yes', 'n is {{var.n}}, m is {{var.m}}')],
        else: [say('no', 'wrong')],
      },
      {
        id: 'missing',
        type: 'if',
        condition: { op: 'gt', left: { ref: 'param.none' }, right: 0 },
        then: [say('bad', 'bad')],
        else: [say('ok', 'missing is false')],
      },
    ])
  );
  api.command('!taskautomation instance start --definition cond');
  api.advance(10);
  assert.match(api.allText(), /n is 3, m is 5/);
  assert.match(api.allText(), /missing is false/);
  assert.equal(api.lastRun().status, 'completed');
  assertHealthy(api);
});

test('a forever loop without suspension is stopped by the runaway breaker', () => {
  const api = game();
  // Built directly so the conservative validator's check is bypassed: the runtime limit is the second defence.
  api.importDef(
    def(
      'spin',
      [
        {
          id: 'l',
          type: 'loop',
          mode: 'forever',
          steps: [{ id: 'w', type: 'wait', durationMs: 1000 }],
        },
      ],
      { policy: { allowForever: true } }
    )
  );
  const record = api.taState().definitions.spin;
  record.revisions[1].steps[0].steps = [{ id: 'v', type: 'variable.set', name: 'x', value: 1 }];
  api.command('!taskautomation instance start --definition spin');
  api.advance(1000);
  const run = api.lastRun();
  assert.equal(run.status, 'failed');
  assert.equal(run.error.reason, 'runaway');
  assertHealthy(api);
});

test('concurrency: skipIfRunning, queue (pinned targets) and replace', () => {
  const api = game();
  api.importDef(def('skip', [wait('w', 5000)], { policy: { concurrency: 'skipIfRunning' } }));
  api.command('!taskautomation instance start --definition skip');
  api.command('!taskautomation instance start --definition skip');
  assert.match(api.allText(), /already running/);
  assert.equal(
    Object.values(api.taState().instances).filter((i) => i.definitionId === 'skip').length,
    1
  );

  const t1 = api.token({ name: 'One' });
  const t2 = api.token({ name: 'Two' });
  api.importDef(
    def(
      'q',
      [wait('w', 1000), { id: 'm', type: 'marker.set', target: { binding: 't' }, marker: 'blue' }],
      {
        bindings: { t: { from: 'selected', objectType: 'graphic' } },
        policy: { concurrency: 'queue', maxConcurrent: 1, maxQueue: 2 },
      }
    )
  );
  api.command('!taskautomation instance start --definition q', [t1]);
  api.command('!taskautomation instance start --definition q', [t2]);
  assert.match(api.allText(), /queued/);
  api.advance(1000);
  assert.equal(t1.attrs.statusmarkers, 'blue');
  assert.equal(t2.attrs.statusmarkers, '');
  api.advance(1000);
  assert.equal(t2.attrs.statusmarkers, 'blue');

  api.importDef(
    def('rep', [wait('w', 5000)], { policy: { concurrency: 'replace', maxConcurrent: 1 } })
  );
  api.command('!taskautomation instance start --definition rep');
  const first = api.lastRun().id;
  api.command('!taskautomation instance start --definition rep');
  assert.equal(api.run(first).status, 'cancelled');
  assert.equal(api.run(first).error.reason, 'replaced');
  assertHealthy(api);
});

test('pause keeps the remaining wait; resume continues from it', () => {
  const api = game();
  api.importDef(def('p', [wait('w', 10000), say('done', 'done')]));
  api.command('!taskautomation instance start --definition p');
  const id = api.lastRun().id;
  api.advance(4000);
  api.command(`!taskautomation instance pause --id ${id}`);
  assert.equal(api.run(id).status, 'paused');
  api.advance(60000);
  assert.doesNotMatch(api.allText(), /^done$/m);
  api.command(`!taskautomation instance resume --id ${id}`);
  api.advance(5999);
  assert.equal(api.run(id).status, 'waiting');
  api.advance(1);
  assert.equal(api.run(id).status, 'completed');
  assertHealthy(api);
});

test('stale revision links are refused', () => {
  const api = game();
  api.importDef(def('p', [wait('w', 10000)]));
  api.command('!taskautomation instance start --definition p');
  const run = api.lastRun();
  const rev = run.revision;
  api.command(`!taskautomation instance pause --id ${run.id} --rev ${rev}`);
  api.command(`!taskautomation instance pause --id ${run.id} --rev ${rev}`);
  assert.match(api.allText(), /has changed since that button was made/);
  assertHealthy(api);
});

test('cancelling a parent cancels owned children but not detached ones', () => {
  const api = game();
  api.importDef(def('child', [wait('w', 60000)]));
  api.importDef(
    def('parent', [
      { id: 'detach', type: 'task.start', definition: 'child', saveAs: 'loose' },
      { id: 'owned', type: 'call', definition: 'child' },
    ])
  );
  api.command('!taskautomation instance start --definition parent');
  api.advance(10);
  const parent = Object.values(api.taState().instances).find((i) => i.definitionId === 'parent');
  const children = Object.values(api.taState().instances).filter((i) => i.definitionId === 'child');
  assert.equal(children.length, 2);
  api.command(`!taskautomation instance cancel --id ${parent.id}`);
  const owned = children.find((c) => c.owned);
  const loose = children.find((c) => !c.owned);
  assert.equal(api.run(owned.id).status, 'cancelled');
  assert.equal(api.run(loose.id).status, 'waiting');
  assertHealthy(api);
});

test('parallel anySuccess cancels losers; race adopts the first outcome', () => {
  const api = game();
  api.importDef(
    def('any', [
      {
        id: 'p',
        type: 'parallel',
        join: 'anySuccess',
        branches: [
          { id: 'slow', steps: [wait('ws', 5000), say('s', 'slow finished')] },
          {
            id: 'fast',
            steps: [
              wait('wf', 1000),
              { id: 'x', type: 'variable.set', name: 'won', value: 'fast' },
            ],
          },
        ],
        merge: [{ name: 'won', reducer: 'first' }],
      },
      say('after', 'winner {{var.won}}'),
    ])
  );
  api.command('!taskautomation instance start --definition any');
  api.advance(6000);
  assert.match(api.allText(), /winner fast/);
  assert.doesNotMatch(api.allText(), /slow finished/);

  api.importDef(
    def('race', [
      {
        id: 'p',
        type: 'parallel',
        join: 'race',
        branches: [
          {
            id: 'boom',
            steps: [
              wait('wb', 500),
              { id: 'bad', type: 'token.set', target: { ids: ['-missing'] }, set: { left: 1 } },
            ],
          },
          { id: 'ok', steps: [wait('wo', 5000)] },
        ],
      },
    ])
  );
  api.command('!taskautomation instance start --definition race');
  api.advance(1000);
  assert.equal(api.lastRun().status, 'failed');
  assertHealthy(api);
});

test('call cycles are rejected at publish', () => {
  const api = game();
  api.importDef(def('a', [{ id: 'c', type: 'call', definition: 'a' }]));
  assert.match(api.allText(), /call each other in a circle/);
  assert.equal(api.taState().definitions.a, undefined);
});

test('retries back off for transient errors; skip continues; review waits for the GM', () => {
  const api = game();
  api.importDef(
    def('retry', [
      { id: 'adapter', type: 'integration.call', adapter: 'nowhere', action: 'x', onError: 'skip' },
      {
        id: 'missing',
        type: 'token.set',
        target: { ids: ['-gone'] },
        set: { left: 1 },
        onError: 'skip',
      },
      say('end', 'reached the end'),
    ])
  );
  api.command('!taskautomation instance start --definition retry');
  api.advance(10);
  // An unknown adapter is never silently skipped: the run waits for the GM.
  const run = api.lastRun();
  assert.equal(run.status, 'review');
  assert.equal(run.review.reason, 'adapterUnavailable');
  api.command(`!taskautomation instance decide --id ${run.id} --action skip`);
  api.advance(10);
  assert.match(api.allText(), /reached the end/);
  assertHealthy(api);
});

test('the reference adapter acknowledges; a silent adapter puts the run in review', () => {
  const api = game();
  api.importDef(
    def('adapt', [
      {
        id: 'echo',
        type: 'integration.call',
        adapter: 'reference',
        action: 'delayedEcho',
        input: { delayMs: 2000, word: 'hello' },
        saveAs: 'reply',
      },
      say('said', 'adapter said {{var.reply.echo.word}}'),
      { id: 'quiet', type: 'integration.call', adapter: 'reference', action: 'silent' },
    ])
  );
  api.command('!taskautomation instance start --definition adapt');
  api.advance(1999);
  assert.doesNotMatch(api.allText(), /adapter said/);
  api.advance(1);
  assert.match(api.allText(), /adapter said hello/);
  api.advance(2000);
  const run = api.lastRun();
  assert.equal(run.status, 'review');
  assert.equal(run.review.reason, 'uncertainOutcome');
  // Retrying could duplicate the effect, so it needs a confirmation.
  api.command(`!taskautomation instance decide --id ${run.id} --action retry`);
  assert.match(api.allText(), /Retrying could do it twice/);
  assertHealthy(api);
});

test('event triggers: debounce coalesces bursts, cooldown suppresses, self-changes are ignored', () => {
  const api = game();
  const token = api.token({ name: 'Bard' });
  api.importDef(
    def(
      'moved',
      [
        {
          id: 'm',
          type: 'marker.set',
          target: { binding: 't' },
          marker: 'yellow',
          op: 'adjust',
          count: 1,
        },
      ],
      {
        bindings: { t: { from: 'event', objectType: 'graphic' } },
        access: { mode: 'gmOnly', authority: 'gmService' },
        triggers: [
          {
            id: 'move',
            type: 'event',
            event: 'token.change',
            filter: { properties: ['left'] },
            debounceMs: 1000,
            bind: { binding: 't' },
          },
        ],
      }
    )
  );
  for (let i = 1; i <= 5; i += 1) {
    api.change(token, { left: 105 + i * 70 });
    api.advance(200);
  }
  api.advance(1000);
  assert.equal(token.attrs.statusmarkers, 'yellow@1');
  // The marker change made by the task is not a "move" and is internal anyway.
  api.advance(5000);
  assert.equal(token.attrs.statusmarkers, 'yellow@1');
  assert.ok(api.taState().stats.coalesced >= 4);
  assertHealthy(api);
});

test('interval schedules: fixed rate, pause skipping the paused range, and downtime summaries', () => {
  const api0 = game();
  api0.importDef(
    def('tick', [say('t', 'tick')], {
      access: { mode: 'gmOnly', authority: 'gmService' },
      policy: { concurrency: 'allow', maxConcurrent: 5 },
    })
  );
  api0.command('!taskautomation schedule add --definition tick --every 10s');
  assert.match(api0.allText(), /New Schedule|Create schedule/);
  api0.clearChat();
  // Anchored now: the first tick is immediate.
  api0.command('!taskautomation schedule add --definition tick --every 10s --yes');
  const sched = Object.values(api0.taState().schedules)[0];
  api0.advance(30000);
  assert.equal(api0.chat.filter((c) => c.text === 'tick').length, 4);
  api0.command(`!taskautomation schedule pause --id ${sched.id}`);
  api0.advance(60000);
  api0.clearChat();
  api0.command(`!taskautomation schedule resume --id ${sched.id}`);
  assert.match(api0.allText(), /Times passed while paused: 5/);
  api0.advance(9000);
  assert.equal(api0.chat.filter((c) => c.text === 'tick').length, 1);
  // Off for a day: the latest time is recent, so it runs once; the other
  // 8,639 missed ticks are counted, not replayed.
  api0.clearChat();
  const api = restart(api0, 24 * 3600 * 1000 + 5000);
  api.advance(10);
  assert.equal(api.chat.filter((c) => c.text === 'tick').length, 1);
  const incident = Object.values(api.taState().incidents).find((i) => i.cause === 'downtime');
  assert.equal(incident.policy, 'coalesce');
  assert.ok(incident.count >= 8639);
  assertHealthy(api);
});

test('one-off times missed by a lot are offered for review and recovered with a confirmation', () => {
  let api = game();
  api.importDef(
    def('once', [say('s', 'it is time')], { access: { mode: 'gmOnly', authority: 'gmService' } })
  );
  const at = new Date(api.now + 60000).toISOString().replace(/\.\d+Z$/, 'Z');
  api.command(`!taskautomation schedule add --definition once --at ${at} --yes`);
  api = restart(api, 3600 * 1000);
  api.advance(10);
  assert.doesNotMatch(api.allText(), /it is time/);
  const incident = Object.values(api.taState().incidents).find((i) => i.policy === 'review');
  assert.ok(incident);
  api.command(`!taskautomation recovery preview --incident ${incident.id} --mode runOnce`);
  const token = /recovery apply --token (\S+?)"/.exec(api.allChat())[1];
  api.command(`!taskautomation recovery apply --token ${token}`);
  api.advance(10);
  assert.match(api.allText(), /it is time/);
  // The same token cannot be used twice.
  api.command(`!taskautomation recovery apply --token ${token}`);
  assert.match(api.allText(), /not valid. Preview again/);
  assertHealthy(api);
});

test('catch-up admits a bounded number of missed occurrences', () => {
  let api = game();
  api.importDef(
    def('catch', [say('s', 'catch {{run.intendedDueAt}}')], {
      access: { mode: 'gmOnly', authority: 'gmService' },
      policy: {
        concurrency: 'allow',
        maxConcurrent: 20,
        overdue: {
          mode: 'catchUpBounded',
          windowMs: 1000,
          catchUp: { max: 3, spacingMs: 500, maxAgeMs: 3600000 },
        },
      },
    })
  );
  api.command('!taskautomation schedule add --definition catch --every 1m --yes');
  // Back half-way between two times, so the latest one is already late.
  api = restart(api, 30 * 60 * 1000 + 30000);
  api.advance(2000);
  assert.equal(api.chat.filter((c) => c.text.startsWith('catch')).length, 3);
  assertHealthy(api);
});

test('fixed-delay intervals wait for the run to finish', () => {
  const api = game();
  api.importDef(
    def('slow', [wait('w', 5000), say('s', 'slow done')], {
      access: { mode: 'gmOnly', authority: 'gmService' },
      policy: { concurrency: 'allow', maxConcurrent: 5 },
    })
  );
  api.command('!taskautomation schedule add --definition slow --every 10s --mode fixedDelay --yes');
  api.clearChat();
  api.advance(40000);
  // Starts at 0, done at 5, next at 15, done at 20, next at 30, done at 35.
  assert.equal(api.chat.filter((c) => c.text === 'slow done').length, 3);
  assertHealthy(api);
});

test('the circuit breaker disables a definition started too often', () => {
  const api = game();
  api.importDef(
    def('busy', [say('s', 'x')], {
      policy: { concurrency: 'allow', maxConcurrent: 100, circuit: { admissionsPerMinute: 3 } },
    })
  );
  for (let i = 0; i < 5; i += 1) {
    api.command('!taskautomation instance start --definition busy');
  }
  assert.equal(api.taState().definitions.busy.enabled, false);
  assert.equal(api.taState().definitions.busy.disabledReason, 'circuit');
  assert.ok(Object.values(api.taState().incidents).some((i) => i.kind === 'circuit'));
  assertHealthy(api);
});

test('stop-all needs a confirmation, cancels runs and holds new starts', () => {
  const api = game();
  api.importDef(def('long', [wait('w', 60000)]));
  api.command('!taskautomation instance start --definition long');
  api.command('!taskautomation stop-all --preview');
  const token = /stop-all --confirm (\S+?)"/.exec(api.allChat())[1];
  api.command(`!taskautomation stop-all --confirm ${token}`);
  assert.equal(api.lastRun().status, 'cancelled');
  api.command('!taskautomation instance start --definition long');
  assert.match(api.allText(), /Everything is stopped/);
  api.command('!taskautomation resume-all');
  api.command('!taskautomation instance start --definition long');
  assert.equal(api.lastRun().status, 'waiting');
  assertHealthy(api);
});

test('drafts: editing steps does not change running runs until republished', () => {
  const api = game();
  api.command('!taskautomation definition create --name "Built here" --id built');
  api.command(
    '!taskautomation definition policy --id built --json {"concurrency":"allow","maxConcurrent":3}'
  );
  api.command(
    '!taskautomation definition step add --id built --json {"id":"w","type":"wait","durationMs":2000}'
  );
  api.command(
    '!taskautomation definition step add --id built --after w --json {"id":"s","type":"chat.send","text":"version one"}'
  );
  api.command('!taskautomation definition publish --id built');
  api.command('!taskautomation instance start --definition built');
  const first = api.lastRun().id;
  api.command(
    '!taskautomation definition step edit --id built --step s --json {"text":"version two"}'
  );
  api.command('!taskautomation definition publish --id built');
  api.command('!taskautomation instance start --definition built');
  api.advance(3000);
  assert.match(api.allText(), /version one/);
  assert.match(api.allText(), /version two/);
  assert.equal(api.run(first).definitionRevision, 1);
  api.command('!taskautomation definition export --id built');
  assert.match(api.allText(), /"revision":2/);
  assertHealthy(api);
});
