// Load figures (plan §15.5): many definitions and runs, and a burst of due
// work, on one timer with bounded draining. These are stub measurements,
// not Roll20 timings; TESTING.md has the live checklist.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createSandbox } from './roll20-stub.mjs';

test('100 definitions, 100 active runs and a 1,000-job burst stay on one timer', () => {
  const api = createSandbox();
  api.ready();
  for (let i = 0; i < 100; i += 1) {
    api.importDef({
      schemaVersion: 1,
      id: `d${i}`,
      name: `d${i}`,
      triggers: [{ id: 'manual', type: 'manual' }],
      access: { mode: 'gmOnly', authority: 'initiator' },
      policy: { concurrency: 'allow', maxConcurrent: 10, circuit: { admissionsPerMinute: 1000 } },
      steps: [
        {
          id: 'l',
          type: 'loop',
          mode: 'count',
          count: 10,
          steps: [
            { id: 'v', type: 'variable.set', name: 'n', value: { ref: 'run.iteration' } },
            { id: 'w', type: 'wait', durationMs: 1000 },
          ],
        },
      ],
    });
  }
  const started = performance.now();
  for (let i = 0; i < 100; i += 1) {
    api.command(`!taskautomation instance start --definition d${i}`);
  }
  // Every run waits until the same second: 100 jobs due together, ten times.
  api.advance(11000);
  const elapsed = performance.now() - started;
  const runs = Object.values(api.taState().instances);
  assert.equal(runs.filter((r) => r.status === 'completed').length, runs.length);
  assert.ok(api.maxLiveTimers() <= 1);
  const size = JSON.stringify(api.taState()).length;
  assert.ok(size < 1024 * 1024, `state ${size} bytes`);
  console.log(
    `load: 100 runs × 10 waits in ${Math.round(elapsed)} ms (stub), state ${Math.round(size / 1024)} KiB`
  );
});

test('a burst of 1,000 due jobs drains in bounded slices', async () => {
  const { createScheduler } = await import('../src/scheduler.js');
  let clock = 0;
  const timers = [];
  let ran = 0;
  const sched = createScheduler({
    now: () => clock,
    setTimer: (fn, ms) => {
      timers.push({ fn, at: clock + ms });
      return timers.length;
    },
    clearTimer: (id) => {
      timers[id - 1] = null;
    },
    dispatch: () => {
      ran += 1;
    },
  });
  for (let i = 0; i < 1000; i += 1) {
    sched.add({ kind: 'continue', dueAt: 0 });
  }
  let wakes = 0;
  while (ran < 1000 && wakes < 1000) {
    const next = timers.findLast((t) => t);
    timers[timers.indexOf(next)] = null;
    clock = Math.max(clock, next.at);
    next.fn();
    wakes += 1;
  }
  assert.equal(ran, 1000);
  assert.equal(wakes, 40);
  assert.equal(sched.stats().yields, 39);
});
