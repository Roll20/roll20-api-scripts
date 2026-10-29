// In-memory runtime shared by the services: the one scheduler, job handlers,
// cross-service hooks and the admission gate. Nothing here is persisted; the
// scheduler is rebuilt from persistent records on every start (plan §3.1).

import { SCRIPT_NAME } from './constants.js';
import { clearTimer, logLine, now, setTimer } from './host.js';
import { createScheduler } from './scheduler.js';
import { getState } from './state.js';

const handlers = new Map();
const hooks = new Map();

export const runtime = {
  ready: false,
  // True while startup recovery runs; triggers and starts wait.
  admissionsHeld: true,
  // Set when state could not be loaded; nothing runs.
  disabled: null,
  bootId: null,
  bootAt: null,
  scheduler: null,
};

/**
 * Creates the scheduler. Each job kind is dispatched to the handler
 * registered with `onJob`.
 *
 * @returns {object} Scheduler.
 */
export function createRuntimeScheduler() {
  runtime.scheduler = createScheduler({
    now,
    setTimer,
    clearTimer,
    dispatch(job) {
      const handler = handlers.get(job.kind);
      if (handler) {
        handler(job);
      }
      const s = getState();
      if (s) {
        s.boot.lastObservedAt = now();
      }
    },
    onError(job, err) {
      logLine(`ERROR in ${job.kind} job: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
    },
  });
  return runtime.scheduler;
}

/**
 * Registers the handler for a job kind.
 *
 * @param {string} kind Job kind.
 * @param {(job: object) => void} fn Handler.
 * @returns {void}
 */
export function onJob(kind, fn) {
  handlers.set(kind, fn);
}

/**
 * Schedules a job on the shared scheduler.
 *
 * @param {object} spec Job spec (kind, dueAt, key, target).
 * @returns {number|null} Job ID, or null when the scheduler is not running.
 */
export function schedule(spec) {
  return runtime.scheduler ? runtime.scheduler.add(spec) : null;
}

/**
 * Cancels a keyed job.
 *
 * @param {string} key Job key.
 * @returns {void}
 */
export function unschedule(key) {
  runtime.scheduler?.cancelKey(key);
}

/**
 * Registers a hook implementation. Services call each other through hooks
 * so modules do not import each other in circles.
 *
 * @param {string} name Hook name.
 * @param {Function} fn Implementation.
 * @returns {void}
 */
export function provide(name, fn) {
  hooks.set(name, fn);
}

/**
 * Calls a hook. Missing hooks are a programming error.
 *
 * @param {string} name Hook name.
 * @param {...*} args Arguments.
 * @returns {*} Result.
 */
export function call(name, ...args) {
  const fn = hooks.get(name);
  if (!fn) {
    throw new Error(`${SCRIPT_NAME}: hook ${name} is not registered`);
  }
  return fn(...args);
}

/**
 * Calls a hook when it is registered.
 *
 * @param {string} name Hook name.
 * @param {...*} args Arguments.
 * @returns {*} Result, or undefined.
 */
export function maybeCall(name, ...args) {
  const fn = hooks.get(name);
  return fn ? fn(...args) : undefined;
}

/**
 * Writes a diagnostic line when diagnostic logging is on.
 *
 * @param {string} text Text.
 * @returns {void}
 */
export function diag(text) {
  if (getState()?.config?.diagnostics) {
    logLine(`[diag] ${text}`);
  }
}
