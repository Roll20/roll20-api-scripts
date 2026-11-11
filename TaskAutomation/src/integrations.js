// Trusted adapter registry (plan §11). Other Mods register adapters through
// the global TaskAutomation API, or before it exists by pushing specs onto
// globalThis.TaskAutomationQueue. Registration is idempotent; late
// registration lets the GM resume runs that were waiting for the adapter.

import { JOB, REPLAY, SCRIPT_NAME } from './constants.js';
import { audit } from './audit.js';
import { logLine, now } from './host.js';
import { maybeCall, onJob, schedule } from './runtime.js';
import { isRecord, toText } from './utils.js';

export const ADAPTER_CONTRACT = 1;

const adapters = new Map();
const referenceStore = new Map();

/**
 * Validates an adapter spec.
 *
 * @param {*} spec Adapter spec.
 * @returns {{ok: boolean, error?: string}} Result.
 */
export function checkAdapterSpec(spec) {
  if (!isRecord(spec) || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/.test(toText(spec.name))) {
    return { ok: false, error: 'adapterName' };
  }
  if (spec.contract !== ADAPTER_CONTRACT) {
    return { ok: false, error: 'adapterContract' };
  }
  if (!isRecord(spec.actions) || Object.keys(spec.actions).length === 0) {
    return { ok: false, error: 'adapterActions' };
  }
  for (const [name, action] of Object.entries(spec.actions)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/.test(name) || typeof action?.invoke !== 'function') {
      return { ok: false, error: 'adapterActions' };
    }
    if (action.replay !== undefined && !Object.values(REPLAY).includes(action.replay)) {
      return { ok: false, error: 'adapterReplay' };
    }
  }
  return { ok: true };
}

/**
 * Registers (or re-registers) an adapter.
 *
 * Spec: { name, contract: 1, version, description, authority: 'gm'|'any',
 *   actions: { [name]: { invoke(input, ctx, done), replay, timeoutMs,
 *   status?(key) -> {done, result}|null, cancel?(opId) } }, events?: [names] }
 *
 * @param {object} spec Adapter spec.
 * @returns {{ok: boolean, error?: string}} Result.
 */
export function registerAdapter(spec) {
  const check = checkAdapterSpec(spec);
  if (!check.ok) {
    logLine(`adapter rejected (${check.error}): ${toText(spec?.name)}`);
    return check;
  }
  const isNew = !adapters.has(spec.name);
  adapters.set(spec.name, { ...spec, registeredAt: now() });
  if (isNew) {
    audit('adapter.register', { adapter: spec.name, version: toText(spec.version) });
    maybeCall('adapterRegistered', spec.name);
  }
  maybeCall('dashboardDirty', 'integrations');
  return { ok: true };
}

/**
 * Drains adapters queued before the Mod loaded.
 *
 * @returns {number} Adapters registered.
 */
export function drainRegistrationQueue() {
  const queue = Array.isArray(globalThis.TaskAutomationQueue) ? globalThis.TaskAutomationQueue : [];
  let count = 0;
  for (const spec of queue.splice(0)) {
    if (registerAdapter(spec).ok) {
      count += 1;
    }
  }
  return count;
}

/**
 * Returns an adapter.
 *
 * @param {string} name Adapter name.
 * @returns {object|null} Adapter.
 */
export function getAdapter(name) {
  return adapters.get(name) || null;
}

/**
 * Returns all registered adapters.
 *
 * @returns {object[]} Adapters.
 */
export function listAdapters() {
  return [...adapters.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Registers the built-in reference adapter used by the examples and tests.
 * It acknowledges calls immediately (`echo`), after a delay on the shared
 * scheduler (`delayedEcho`), or never (`silent`, to show timeouts), and
 * answers status lookups by idempotency key.
 *
 * @returns {void}
 */
export function registerReferenceAdapter() {
  onJob(JOB.MAINTENANCE + ':referenceAck', (job) => {
    const { key, input, done } = job.target;
    referenceStore.set(key, { done: true, result: { echo: input } });
    done(null, { echo: input });
  });
  registerAdapter({
    name: 'reference',
    contract: ADAPTER_CONTRACT,
    version: '1.0.0',
    description: `${SCRIPT_NAME} reference adapter`,
    authority: 'gm',
    actions: {
      echo: {
        replay: REPLAY.ACKNOWLEDGED,
        invoke(input, ctx, done) {
          referenceStore.set(ctx.idempotencyKey, { done: true, result: { echo: input } });
          done(null, { echo: input });
        },
        status(key) {
          return referenceStore.get(key) || null;
        },
      },
      delayedEcho: {
        replay: REPLAY.ACKNOWLEDGED,
        timeoutMs: 10000,
        invoke(input, ctx, done) {
          const delay = Math.min(Math.max(Number(input?.delayMs) || 1000, 100), 9000);
          schedule({
            kind: `${JOB.MAINTENANCE}:referenceAck`,
            dueAt: now() + delay,
            target: { key: ctx.idempotencyKey, input, done },
          });
        },
        status(key) {
          return referenceStore.get(key) || null;
        },
      },
      silent: {
        replay: REPLAY.ACKNOWLEDGED,
        timeoutMs: 2000,
        invoke() {},
      },
    },
  });
}
