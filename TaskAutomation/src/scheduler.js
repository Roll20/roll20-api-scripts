// The only owner of a timer in TaskAutomation (plan §3.1). One priority queue,
// one re-armed timeout, generation guards and bounded draining. Pure: the
// clock, timer functions and dispatcher are injected so tests can drive it.

import { JOB_PRIORITY, SCHEDULER_DEFAULTS } from './constants.js';
import { createHeap, heapPeek, heapPop, heapPush, heapRebuild } from './heap.js';

/**
 * Creates a scheduler.
 *
 * @param {object} options Options.
 * @param {() => number} options.now Epoch milliseconds.
 * @param {(fn: Function, ms: number) => *} options.setTimer setTimeout.
 * @param {(handle: *) => void} options.clearTimer clearTimeout.
 * @param {(job: object) => void} options.dispatch Runs one due job.
 * @param {(job: object, err: Error) => void} [options.onError] Called when a job throws.
 * @param {object} [options.limits] Budgets, see SCHEDULER_DEFAULTS.
 * @returns {object} Scheduler.
 */
export function createScheduler({ now, setTimer, clearTimer, dispatch, onError, limits = {} }) {
  const cfg = { ...SCHEDULER_DEFAULTS, ...limits };
  const heap = createHeap();
  const jobs = new Map();
  const keys = new Map();
  let sequence = 0;
  let nextJobId = 1;
  let handle = null;
  let armedDueAt = null;
  let armGeneration = 0;
  let draining = false;
  let rearmRequested = false;
  let lastWakeAt = null;
  let expectedWakeAt = null;
  const stats = {
    drains: 0,
    dispatched: 0,
    yields: 0,
    errors: 0,
    maxDrainMs: 0,
    clockJumps: 0,
    lastJumpMs: 0,
    compactions: 0,
    timersSet: 0,
  };

  /**
   * Returns the first job that has not been cancelled, discarding
   * cancelled jobs from the top of the heap.
   *
   * @returns {object|undefined} Head job.
   */
  function validHead() {
    let head = heapPeek(heap);
    while (head && jobs.get(head.id) !== head) {
      heapPop(heap);
      head = heapPeek(heap);
    }
    return head;
  }

  /**
   * Rebuilds the heap when cancelled jobs outnumber the configured ratio.
   *
   * @returns {void}
   */
  function maybeCompact() {
    const stale = heap.items.length - jobs.size;
    if (stale > cfg.compactMinimum && stale > heap.items.length * cfg.compactRatio) {
      heapRebuild(heap, [...jobs.values()]);
      stats.compactions += 1;
    }
  }

  /**
   * Arms the single timeout for the earliest job. Does nothing while
   * draining (the drain re-arms once at the end) or when the timer already
   * targets the same deadline.
   *
   * @param {number} [minDelay=0] Minimum delay, used to yield after a budget.
   * @returns {void}
   */
  function arm(minDelay = 0) {
    if (draining) {
      rearmRequested = true;
      return;
    }
    const head = validHead();
    if (!head) {
      disarm();
      return;
    }
    const current = now();
    const target = Math.max(head.dueAt, current + minDelay);
    if (handle !== null && armedDueAt === target) {
      return;
    }
    disarm();
    armGeneration += 1;
    const generation = armGeneration;
    const delay = Math.min(Math.max(target - current, 0), cfg.maxHostDelayMs);
    armedDueAt = target;
    expectedWakeAt = current + delay;
    stats.timersSet += 1;
    handle = setTimer(() => wake(generation), delay);
  }

  /**
   * Clears the owned timeout, if any.
   *
   * @returns {void}
   */
  function disarm() {
    if (handle !== null) {
      clearTimer(handle);
    }
    handle = null;
    armedDueAt = null;
    expectedWakeAt = null;
  }

  /**
   * Notes clock jumps: a wake far from when it was expected means the clock
   * moved or the sandbox was suspended. The two cannot be told apart.
   *
   * @param {number} current Current time.
   * @returns {void}
   */
  function noteClock(current) {
    if (expectedWakeAt !== null) {
      const drift = current - expectedWakeAt;
      if (Math.abs(drift) > 5000) {
        stats.clockJumps += 1;
        stats.lastJumpMs = drift;
      }
    }
    lastWakeAt = current;
  }

  /**
   * Timer callback: runs due jobs within the job-count and time budgets.
   * Stale generations (callbacks queued before a clear) do nothing.
   *
   * @param {number} generation Arm generation captured when the timer was set.
   * @returns {void}
   */
  function wake(generation) {
    if (generation !== armGeneration || draining) {
      return;
    }
    handle = null;
    armedDueAt = null;
    const started = now();
    noteClock(started);
    expectedWakeAt = null;
    draining = true;
    rearmRequested = false;
    let count = 0;
    let yieldNeeded = false;
    stats.drains += 1;
    try {
      for (;;) {
        const head = validHead();
        // A clamped long wait wakes early: never run future work.
        if (!head || head.dueAt > now()) {
          break;
        }
        if (count >= cfg.maxJobsPerDrain || now() - started >= cfg.maxDrainMs) {
          yieldNeeded = true;
          stats.yields += 1;
          break;
        }
        heapPop(heap);
        jobs.delete(head.id);
        if (head.key && keys.get(head.key) === head.id) {
          keys.delete(head.key);
        }
        count += 1;
        stats.dispatched += 1;
        try {
          dispatch(head);
        } catch (err) {
          stats.errors += 1;
          onError?.(head, err);
        }
      }
    } finally {
      draining = false;
      stats.maxDrainMs = Math.max(stats.maxDrainMs, now() - started);
      maybeCompact();
      arm(yieldNeeded ? cfg.yieldMs : 0);
    }
  }

  return {
    /**
     * Adds a job. A job with the same key replaces the earlier one.
     *
     * @param {{kind: string, dueAt: number, priority?: number, key?: string, target?: object}} spec Job.
     * @returns {number} Job ID.
     */
    add(spec) {
      if (!Number.isFinite(spec.dueAt)) {
        throw new Error(`Job ${spec.kind} has no finite deadline`);
      }
      if (spec.key) {
        this.cancelKey(spec.key);
      }
      const job = {
        id: nextJobId++,
        kind: spec.kind,
        dueAt: spec.dueAt,
        priority: spec.priority ?? JOB_PRIORITY[spec.kind] ?? 50,
        sequence: sequence++,
        key: spec.key || null,
        target: spec.target || {},
      };
      jobs.set(job.id, job);
      if (job.key) {
        keys.set(job.key, job.id);
      }
      heapPush(heap, job);
      const head = validHead();
      if (head === job || handle === null) {
        arm();
      }
      return job.id;
    },
    /**
     * Cancels a job by ID. The heap entry is discarded lazily.
     *
     * @param {number} jobId Job ID.
     * @returns {boolean} True when a job was cancelled.
     */
    cancel(jobId) {
      const job = jobs.get(jobId);
      if (!job) {
        return false;
      }
      const wasHead = heapPeek(heap) === job;
      jobs.delete(jobId);
      if (job.key && keys.get(job.key) === jobId) {
        keys.delete(job.key);
      }
      if (wasHead) {
        arm();
      }
      maybeCompact();
      return true;
    },
    /**
     * Cancels the job registered under a key.
     *
     * @param {string} key Key.
     * @returns {boolean} True when a job was cancelled.
     */
    cancelKey(key) {
      const id = keys.get(key);
      return id === undefined ? false : this.cancel(id);
    },
    /**
     * Cancels every job matching a predicate.
     *
     * @param {(job: object) => boolean} predicate Test.
     * @returns {number} Jobs cancelled.
     */
    cancelWhere(predicate) {
      let count = 0;
      for (const job of [...jobs.values()]) {
        if (predicate(job)) {
          this.cancel(job.id);
          count += 1;
        }
      }
      return count;
    },
    /**
     * Returns the job registered under a key.
     *
     * @param {string} key Key.
     * @returns {object|undefined} Job.
     */
    getKey(key) {
      const id = keys.get(key);
      return id === undefined ? undefined : jobs.get(id);
    },
    /**
     * Returns the earliest deadline, or null when idle.
     *
     * @returns {number|null} Epoch milliseconds.
     */
    nextDueAt() {
      return validHead()?.dueAt ?? null;
    },
    /**
     * Returns the number of live jobs.
     *
     * @returns {number} Count.
     */
    size() {
      return jobs.size;
    },
    /**
     * Returns live jobs, earliest first (for diagnostics).
     *
     * @param {number} [limit=20] Maximum jobs.
     * @returns {object[]} Jobs.
     */
    peekJobs(limit = 20) {
      return [...jobs.values()]
        .sort((a, b) => a.dueAt - b.dueAt || a.priority - b.priority || a.sequence - b.sequence)
        .slice(0, limit);
    },
    /**
     * Re-arms the timer, e.g. after the clock is known to have moved.
     *
     * @returns {void}
     */
    rearm() {
      disarm();
      arm();
    },
    /**
     * Drops every job and the timer (used when the Mod halts).
     *
     * @returns {void}
     */
    clear() {
      jobs.clear();
      keys.clear();
      heap.items = [];
      disarm();
    },
    /**
     * Returns counters for diagnostics.
     *
     * @returns {object} Stats.
     */
    stats() {
      return {
        ...stats,
        jobs: jobs.size,
        heap: heap.items.length,
        stale: heap.items.length - jobs.size,
        nextDueAt: validHead()?.dueAt ?? null,
        armed: handle !== null,
        armedDueAt,
        lastWakeAt,
      };
    },
  };
}
