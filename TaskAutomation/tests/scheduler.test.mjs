// Heap and single-timer scheduler (plan §3.1, §15.1), with fake timers.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createHeap, heapPeek, heapPop, heapPush, heapRebuild } from '../src/heap.js';
import { createScheduler } from '../src/scheduler.js';

/**
 * Creates fake timers and a scheduler over them.
 *
 * @param {object} [limits] Scheduler limits.
 * @returns {object} Harness.
 */
function harness(limits = {}) {
  let clock = 1_000_000;
  const timers = new Map();
  let seq = 1;
  let maxLive = 0;
  const ran = [];
  const sched = createScheduler({
    now: () => clock,
    setTimer: (fn, ms) => {
      const id = seq++;
      timers.set(id, { fn, at: clock + ms, ms });
      maxLive = Math.max(maxLive, timers.size);
      return id;
    },
    clearTimer: (id) => timers.delete(id),
    dispatch: (job) => {
      ran.push({ kind: job.kind, at: clock, dueAt: job.dueAt, id: job.target.id });
      job.target.effect?.();
    },
    onError: () => {},
    limits,
  });
  const fireDue = () => {
    for (;;) {
      const due = [...timers.entries()]
        .filter(([, t]) => t.at <= clock)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) {
        return;
      }
      timers.delete(due[0]);
      due[1].fn();
    }
  };
  return {
    sched,
    ran,
    timers,
    get clock() {
      return clock;
    },
    maxLive: () => maxLive,
    advance(ms) {
      const end = clock + ms;
      for (;;) {
        const next = Math.min(...[...timers.values()].map((t) => t.at), Infinity);
        if (next > end) {
          break;
        }
        clock = Math.max(clock, next);
        fireDue();
      }
      clock = end;
      fireDue();
    },
    setClock(value) {
      clock = value;
    },
    fireStale(id) {
      // A callback that was queued before clearTimeout ran.
      const entry = timers.get(id);
      return entry;
    },
  };
}

test('heap orders by deadline, then priority, then insertion', () => {
  const heap = createHeap();
  const jobs = [
    { id: 'c', dueAt: 20, priority: 0, sequence: 3 },
    { id: 'a', dueAt: 10, priority: 5, sequence: 1 },
    { id: 'b', dueAt: 10, priority: 1, sequence: 2 },
    { id: 'd', dueAt: 10, priority: 1, sequence: 0 },
  ];
  jobs.forEach((j) => heapPush(heap, j));
  assert.equal(heapPeek(heap).id, 'd');
  assert.deepEqual(
    [heapPop(heap), heapPop(heap), heapPop(heap), heapPop(heap)].map((j) => j.id),
    ['d', 'b', 'a', 'c']
  );
  assert.equal(heapPop(heap), undefined);
  heapRebuild(heap, jobs);
  assert.equal(heapPeek(heap).id, 'd');
});

test('heap stays ordered under random insertions', () => {
  const heap = createHeap();
  for (let i = 0; i < 500; i += 1) {
    heapPush(heap, { dueAt: Math.floor(Math.random() * 1000), priority: 0, sequence: i });
  }
  let last = -1;
  while (heap.items.length) {
    const job = heapPop(heap);
    assert.ok(job.dueAt >= last);
    last = job.dueAt;
  }
});

test('one timer at most, and none when there is no work', () => {
  const h = harness();
  assert.equal(h.timers.size, 0);
  for (let i = 0; i < 50; i += 1) {
    h.sched.add({ kind: 'continue', dueAt: h.clock + 1000 + i * 10, target: { id: i } });
  }
  assert.equal(h.timers.size, 1);
  h.advance(5000);
  assert.equal(h.ran.length, 50);
  assert.equal(h.timers.size, 0);
  assert.equal(h.maxLive(), 1);
});

test('an earlier job re-arms the timer; a later one does not', () => {
  const h = harness();
  h.sched.add({ kind: 'continue', dueAt: h.clock + 5000, target: { id: 'late' } });
  const before = h.sched.stats().timersSet;
  h.sched.add({ kind: 'continue', dueAt: h.clock + 9000, target: { id: 'later' } });
  assert.equal(h.sched.stats().timersSet, before);
  h.sched.add({ kind: 'continue', dueAt: h.clock + 1000, target: { id: 'early' } });
  assert.equal(h.sched.stats().timersSet, before + 1);
  h.advance(10000);
  assert.deepEqual(
    h.ran.map((r) => r.id),
    ['early', 'late', 'later']
  );
});

test('cancelling the head re-arms for the next job; keyed jobs replace each other', () => {
  const h = harness();
  const first = h.sched.add({ kind: 'continue', dueAt: h.clock + 1000, target: { id: 1 } });
  h.sched.add({ kind: 'continue', dueAt: h.clock + 3000, target: { id: 2 } });
  h.sched.cancel(first);
  assert.equal(h.sched.nextDueAt(), h.clock + 3000);
  h.sched.add({ kind: 'dashboard', dueAt: h.clock + 500, key: 'dash', target: { id: 'd1' } });
  h.sched.add({ kind: 'dashboard', dueAt: h.clock + 700, key: 'dash', target: { id: 'd2' } });
  h.advance(4000);
  assert.deepEqual(
    h.ran.map((r) => r.id),
    ['d2', 2]
  );
});

test('a stale callback queued before clearTimeout does nothing', () => {
  const h = harness();
  h.sched.add({ kind: 'continue', dueAt: h.clock + 1000, target: { id: 'x' } });
  const [, stale] = [...h.timers.entries()][0];
  h.sched.add({ kind: 'continue', dueAt: h.clock + 100, target: { id: 'y' } });
  h.setClock(h.clock + 2000);
  stale.fn();
  assert.equal(h.ran.length, 0);
  h.advance(0);
  assert.deepEqual(
    h.ran.map((r) => r.id),
    ['y', 'x']
  );
});

test('long waits are clamped and re-checked: no early effects', () => {
  const h = harness({ maxHostDelayMs: 10_000 });
  const due = h.clock + 35_000;
  h.sched.add({ kind: 'continue', dueAt: due, target: { id: 'far' } });
  assert.equal([...h.timers.values()][0].ms, 10_000);
  h.advance(30_000);
  assert.equal(h.ran.length, 0);
  h.advance(5_000);
  assert.equal(h.ran.length, 1);
  assert.ok(h.ran[0].at >= due);
});

test('draining yields after its job budget and every due job still runs', () => {
  const h = harness({ maxJobsPerDrain: 5, yieldMs: 10 });
  for (let i = 0; i < 23; i += 1) {
    h.sched.add({ kind: 'continue', dueAt: h.clock, target: { id: i } });
  }
  h.advance(0);
  assert.equal(h.ran.length, 5);
  assert.equal(h.sched.stats().yields, 1);
  h.advance(100);
  assert.equal(h.ran.length, 23);
  assert.deepEqual(
    h.ran.map((r) => r.id),
    [...Array(23).keys()]
  );
});

test('a backward clock jump delays work until its real time', () => {
  const h = harness();
  const due = h.clock + 1000;
  h.sched.add({ kind: 'continue', dueAt: due, target: { id: 'a' } });
  h.advance(1000);
  assert.equal(h.ran.length, 1);
  h.sched.add({ kind: 'continue', dueAt: h.clock + 1000, target: { id: 'b' } });
  // Wall clock goes back 10 seconds; the timer fires but the job is not due.
  const [timerId, timer] = [...h.timers.entries()][0];
  h.timers.delete(timerId);
  h.setClock(h.clock - 10_000 + 1000);
  timer.fn();
  assert.equal(h.ran.length, 1);
  assert.equal(h.timers.size, 1);
});

test('an exception in one job is contained and the timer is re-armed', () => {
  const h = harness();
  h.sched.add({
    kind: 'continue',
    dueAt: h.clock + 10,
    target: {
      id: 'boom',
      effect: () => {
        throw new Error('boom');
      },
    },
  });
  h.sched.add({ kind: 'continue', dueAt: h.clock + 20, target: { id: 'after' } });
  h.advance(100);
  assert.deepEqual(
    h.ran.map((r) => r.id),
    ['boom', 'after']
  );
  assert.equal(h.sched.stats().errors, 1);
});

test('cancelled jobs are compacted out of the heap', () => {
  const h = harness({ compactMinimum: 10, compactRatio: 0.5 });
  const ids = [];
  for (let i = 0; i < 100; i += 1) {
    ids.push(h.sched.add({ kind: 'continue', dueAt: h.clock + 10_000 + i, target: { id: i } }));
  }
  for (const id of ids.slice(0, 90)) {
    h.sched.cancel(id);
  }
  assert.ok(h.sched.stats().heap < 100);
  assert.equal(h.sched.size(), 10);
});
