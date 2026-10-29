// Restart persistence and fault injection (plan §8, §15.2): restarts at
// action boundaries, during waits, joins and adapter calls, while paused,
// and with unreadable or newer state.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SCHEMA_VERSION } from '../src/constants.js';
import { createState, migrateState } from '../src/state.js';
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

const base = (id, steps, extra = {}) => ({
  schemaVersion: 1,
  id,
  name: id,
  triggers: [{ id: 'manual', type: 'manual' }],
  access: { mode: 'gmOnly', authority: 'initiator' },
  policy: { concurrency: 'allow', maxConcurrent: 5 },
  steps,
  ...extra,
});

/**
 * Rewinds a run to "the action was prepared but not confirmed", as if the
 * sandbox stopped in the middle of it.
 *
 * @param {object} run Instance (in persisted state).
 * @param {string} stepId Action step.
 * @param {number} [index=0] Position of the step in its block.
 * @returns {void}
 */
function crashDuring(run, stepId, index = 0) {
  const main = run.branches.main;
  const entry = Object.values(run.journal).find((e) => e.stepId === stepId);
  entry.status = 'prepared';
  main.wait = null;
  main.status = 'running';
  main.frames.at(-1).index = index;
  run.status = 'running';
}

test('a restart during a wait continues at the original deadline', () => {
  let api = game();
  api.importDef(
    base('w', [
      { id: 'w', type: 'wait', durationMs: 60000 },
      { id: 's', type: 'chat.send', text: 'after wait' },
    ])
  );
  api.command('!taskautomation instance start --definition w');
  api.advance(20000);
  api = restart(api, 10000);
  api.advance(29999);
  assert.doesNotMatch(api.allText(), /after wait/);
  api.advance(1);
  assert.match(api.allText(), /after wait/);
});

test('a restart while paused stays paused; resume keeps the remaining time', () => {
  let api = game();
  api.importDef(
    base('w', [
      { id: 'w', type: 'wait', durationMs: 60000 },
      { id: 's', type: 'chat.send', text: 'after wait' },
    ])
  );
  api.command('!taskautomation instance start --definition w');
  const id = api.lastRun().id;
  api.advance(20000);
  api.command(`!taskautomation instance pause --id ${id}`);
  api = restart(api, 3600 * 1000);
  assert.equal(api.run(id).status, 'paused');
  api.command(`!taskautomation instance resume --id ${id}`);
  api.advance(39999);
  assert.doesNotMatch(api.allText(), /after wait/);
  api.advance(1);
  assert.match(api.allText(), /after wait/);
});

test('an interrupted side change that did happen is confirmed, not repeated', () => {
  let api = game();
  api.command('!taskautomation template add montage');
  const token = api.sidedToken();
  api.command('!taskautomation instance start --definition montage', [token]);
  api.advance(10);
  assert.equal(token.attrs.currentSide, 1);
  const run = api.lastRun();
  crashDuring(run, 'advance');
  api = restart(api, 1000);
  assert.equal(token.attrs.currentSide, 1, 'not advanced twice');
  const entry = Object.values(api.run(run.id).journal).find((e) => e.stepId === 'advance');
  assert.equal(entry.status, 'confirmed');
  assert.equal(entry.reconciled, true);
  assert.equal(api.run(run.id).status, 'waiting');
});

test('an interrupted side change that cannot be confirmed goes to review', () => {
  let api = game();
  api.command('!taskautomation template add montage');
  const token = api.sidedToken();
  api.command('!taskautomation instance start --definition montage', [token]);
  api.advance(10);
  const run = api.lastRun();
  crashDuring(run, 'advance');
  // Someone moved the token to another side meanwhile.
  token.attrs.currentSide = 2;
  api = restart(api, 1000);
  const after = api.run(run.id);
  assert.equal(after.status, 'review');
  assert.equal(after.review.reason, 'restartConflict');
  assert.equal(token.attrs.currentSide, 2);
  assert.ok(
    Object.values(api.taState().incidents).some((i) => i.kind === 'review' && i.runId === run.id)
  );
});

test('an interrupted absolute write is re-applied safely', () => {
  let api = game();
  const token = api.token();
  api.importDef(
    base(
      'move',
      [
        { id: 'set', type: 'token.set', target: { binding: 't' }, set: { left: 455 } },
        { id: 'w', type: 'wait', durationMs: 5000 },
      ],
      {
        bindings: { t: { from: 'selected', objectType: 'graphic' } },
      }
    )
  );
  api.command('!taskautomation instance start --definition move', [token]);
  api.advance(10);
  const run = api.lastRun();
  crashDuring(run, 'set');
  token.attrs.left = 105;
  api = restart(api, 1000);
  api.advance(10);
  assert.equal(token.attrs.left, 455);
  assert.equal(api.run(run.id).status, 'waiting');
});

test('an interrupted chat message is never resent automatically', () => {
  let api = game();
  api.importDef(
    base('say', [
      { id: 'say', type: 'chat.send', text: 'only once' },
      { id: 'w', type: 'wait', durationMs: 5000 },
    ])
  );
  api.command('!taskautomation instance start --definition say');
  api.advance(10);
  const run = api.lastRun();
  crashDuring(run, 'say');
  api.clearChat();
  api = restart(api, 1000);
  api.advance(100);
  assert.doesNotMatch(api.allText(), /^only once$/m);
  assert.equal(api.run(run.id).status, 'review');
  assert.equal(api.run(run.id).review.reason, 'uncertainOutcome');
  api.command(`!taskautomation instance decide --id ${run.id} --action complete`);
  api.advance(5000);
  assert.equal(api.run(run.id).status, 'completed');
});

test('an adapter call in flight at restart is checked, then reviewed', () => {
  let api = game();
  api.importDef(
    base('slow', [
      {
        id: 'call',
        type: 'integration.call',
        adapter: 'reference',
        action: 'delayedEcho',
        input: { delayMs: 5000 },
      },
    ])
  );
  api.command('!taskautomation instance start --definition slow');
  api.advance(1000);
  const id = api.lastRun().id;
  api = restart(api, 1000);
  assert.equal(api.run(id).status, 'review');
  assert.equal(api.run(id).review.reason, 'uncertainOutcome');
  // The old boot's callback is ignored even if it arrives.
  api.advance(10000);
  assert.equal(api.run(id).status, 'review');
});

test('a child that finished just before a restart releases its parent', () => {
  let api = game();
  api.importDef(base('kid', [{ id: 'w', type: 'wait', durationMs: 1000 }]));
  api.importDef(
    base('mum', [
      { id: 'c', type: 'call', definition: 'kid' },
      { id: 's', type: 'chat.send', text: 'child done' },
    ])
  );
  api.command('!taskautomation instance start --definition mum');
  api.advance(10);
  const parent = Object.values(api.taState().instances).find((i) => i.definitionId === 'mum');
  const child = Object.values(api.taState().instances).find((i) => i.definitionId === 'kid');
  // The child finished but the parent was never told.
  child.status = 'completed';
  child.completedAt = api.now;
  api = restart(api, 1000);
  api.advance(10);
  assert.match(api.allText(), /child done/);
  assert.equal(api.run(parent.id).status, 'completed');
});

test('parallel branches restore after a restart and still join', () => {
  let api = game();
  api.importDef(
    base('par', [
      {
        id: 'p',
        type: 'parallel',
        join: 'all',
        branches: [
          { id: 'a', steps: [{ id: 'wa', type: 'wait', durationMs: 3000 }] },
          { id: 'b', steps: [{ id: 'wb', type: 'wait', durationMs: 6000 }] },
        ],
      },
      { id: 's', type: 'chat.send', text: 'joined' },
    ])
  );
  api.command('!taskautomation instance start --definition par');
  api.advance(4000);
  api = restart(api, 500);
  api.advance(1499);
  assert.doesNotMatch(api.allText(), /joined/);
  api.advance(10);
  assert.match(api.allText(), /joined/);
});

test('a loop counter and an if choice survive a restart', () => {
  let api = game();
  api.importDef(
    base('lp', [
      {
        id: 'l',
        type: 'loop',
        mode: 'count',
        count: 4,
        steps: [
          {
            id: 'i',
            type: 'if',
            condition: { op: 'gt', left: { ref: 'run.iteration' }, right: 0 },
            then: [
              { id: 'w', type: 'wait', durationMs: 1000 },
              { id: 's', type: 'chat.send', text: 'pass {{run.iteration}}' },
            ],
          },
        ],
      },
    ])
  );
  api.command('!taskautomation instance start --definition lp');
  api.advance(2500);
  api = restart(api, 100);
  api.advance(5000);
  const passes = api.chat.filter((c) => /^pass \d$/.test(c.text)).map((c) => c.text);
  assert.deepEqual(passes, ['pass 3', 'pass 4']);
});

test('state from a newer version or unreadable state is kept and nothing runs', () => {
  const newer = {
    TaskAutomation: { ...createState(0), schemaVersion: SCHEMA_VERSION + 1, secret: 'keep me' },
  };
  const api = game({ state: newer });
  assert.equal(api.sandbox.state.TaskAutomation.secret, 'keep me');
  assert.equal(api.sandbox.state.TaskAutomation.schemaVersion, SCHEMA_VERSION + 1);
  assert.match(api.allText(), /could not load its saved data/);
  api.clearChat();
  api.command('!taskautomation template add montage');
  assert.match(api.allText(), /disabled/);
  assert.equal(api.handout('TaskAutomation - Dashboard'), undefined);

  const broken = game({ state: { TaskAutomation: 'nonsense' } });
  assert.equal(broken.sandbox.state.TaskAutomation, 'nonsense');
});

test('migrations run in order, and a failing migration keeps the original', () => {
  const old = { schemaVersion: 1, definitions: {}, legacy: true };
  const ok = migrateState(old, 1, { 1: (s) => ({ ...s, schemaVersion: 2, migrated: true }) }, 2);
  assert.equal(ok.status, 'migrated');
  assert.equal(ok.state.migrated, true);
  assert.equal(old.migrated, undefined, 'original untouched');
  const failed = migrateState(
    old,
    1,
    {
      1: () => {
        throw new Error('nope');
      },
    },
    2
  );
  assert.equal(failed.status, 'migrationFailed');
  assert.equal(failed.state, undefined);
  assert.equal(migrateState({ schemaVersion: 1 }, 1, {}, 2).status, 'migrationFailed');
  assert.equal(migrateState({ schemaVersion: 3 }, 1, {}, 2).status, 'newer');
  assert.equal(migrateState(undefined, 1).status, 'fresh');
  assert.equal(migrateState({ schemaVersion: 1, instances: [] }, 1).status, 'corrupt');
});

test('restarting an idle game leaves no timers and sends one summary', () => {
  let api = game();
  api = restart(api, 3600 * 1000);
  api.advance(20 * 60 * 1000);
  assert.equal(api.liveTimers(), 0);
  assert.equal(api.chat.filter((c) => /is ready/.test(c.text)).length, 1);
});
