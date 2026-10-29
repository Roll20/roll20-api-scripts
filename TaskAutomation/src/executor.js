// The executor (plan §4, §7, §8): admission, persistent frames, waits,
// conditions, loops, calls, cooperative parallel branches, the action
// journal, retries, pause/resume/cancel and review. Every continuation is a
// scheduler job carrying generations, so cancelled or superseded work is a
// harmless no-op when its job fires.

import { ACTIONS } from './actions.js';
import { audit, count, createIncident, recordHistory, resolveIncident } from './audit.js';
import { replayClass } from './catalogue.js';
import {
  ACTIVE_STATUSES,
  ERROR_CODES,
  JOB,
  REPLAY,
  STATUS,
  TERMINAL_STATUSES,
} from './constants.js';
import { getCompiled, getRecord, getSnapshot, setEnabled } from './definitions.js';
import { asTaskError, errorRecord, taskError } from './errors.js';
import { MISSING, evaluate, renderTemplate, truthy } from './expressions.js';
import { isGm, now } from './host.js';
import { findAnyTarget, getTarget, readProperty, runQuery } from './objects.js';
import { checkEffectAuthority } from './permissions.js';
import { call, diag, maybeCall, onJob, runtime, schedule } from './runtime.js';
import { checkParamValue, durationValue } from './schema.js';
import { getConfig, getLimits, getState, nextId, stateNearlyFull } from './state.js';
import { clone, isRecord, parseIsoInstant, readPath, truncate } from './utils.js';

const RETAIN_TERMINAL = 20;
const JOURNAL_LIMIT = 60;

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/**
 * Returns an instance.
 *
 * @param {string} id Run ID.
 * @returns {object|null} Instance.
 */
export function getInstance(id) {
  return getState().instances[id] || null;
}

/**
 * Returns instances, newest first.
 *
 * @param {(inst: object) => boolean} [filter] Filter.
 * @returns {object[]} Instances.
 */
export function listInstances(filter = () => true) {
  return Object.values(getState().instances)
    .filter(filter)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Returns the active (not finished) runs of a definition, excluding queued.
 *
 * @param {string} defId Definition ID.
 * @returns {object[]} Instances.
 */
function activeRunsOf(defId) {
  return Object.values(getState().instances).filter(
    (i) => i.definitionId === defId && ACTIVE_STATUSES.has(i.status) && i.status !== STATUS.QUEUED
  );
}

/**
 * Returns the definition snapshot a run is pinned to.
 *
 * @param {object} inst Instance.
 * @returns {object|null} Snapshot.
 */
function defOf(inst) {
  return getSnapshot(inst.definitionId, inst.definitionRevision);
}

/**
 * Adds a timeline entry to a run, keeping the timeline bounded.
 *
 * @param {object} inst Instance.
 * @param {string} kind Entry kind.
 * @param {object} [detail] Detail.
 * @returns {void}
 */
function timeline(inst, kind, detail = {}) {
  inst.timeline.push({ at: now(), kind, ...detail });
  const max = getLimits().timelinePerRun;
  if (inst.timeline.length > max) {
    inst.timeline.splice(1, inst.timeline.length - max);
  }
}

/**
 * Asks for a dashboard refresh after a run changed.
 *
 * @param {object} inst Instance.
 * @returns {void}
 */
function touch(inst) {
  maybeCall('dashboardDirty', 'instances', inst.id);
}

/**
 * Bumps a run's management revision after a status change, so links made
 * before the change are refused as stale.
 *
 * @param {object} inst Instance.
 * @returns {void}
 */
function bump(inst) {
  inst.revision += 1;
  touch(inst);
}

// ---------------------------------------------------------------------------
// Admission (plan §5 admission policies)
// ---------------------------------------------------------------------------

/**
 * Resolves start parameters against the definition's declarations.
 *
 * @param {object} def Definition snapshot.
 * @param {object} raw Raw parameters.
 * @returns {{ok: boolean, params?: object, error?: string, vars?: object}} Result.
 */
export function resolveParams(def, raw = {}) {
  const decls = def.parameters || {};
  const params = {};
  for (const key of Object.keys(raw)) {
    if (!decls[key]) {
      return { ok: false, error: 'unknownParam', vars: { name: key } };
    }
  }
  for (const [name, spec] of Object.entries(decls)) {
    let value = raw[name];
    if (value === undefined) {
      if (spec.default !== undefined) {
        params[name] = spec.default;
        continue;
      }
      if (spec.required) {
        return { ok: false, error: 'paramRequired', vars: { name } };
      }
      continue;
    }
    if (spec.type === 'number' && typeof value === 'string') {
      value = Number(value);
    }
    if (spec.type === 'boolean' && typeof value === 'string') {
      value = value === 'true' ? true : value === 'false' ? false : value;
    }
    const checked = checkParamValue(spec, value);
    if (!checked.ok) {
      return {
        ok: false,
        error: 'badParam',
        vars: { name, ...checked.vars, reason: checked.error },
      };
    }
    params[name] = checked.value;
  }
  return { ok: true, params };
}

/**
 * Admits a new run of a definition according to its concurrency policy.
 *
 * @param {string} defId Definition ID.
 * @param {object} opts Start options.
 * @param {string|null} opts.initiatorId Real player ID, or null for unattended starts.
 * @param {object} [opts.params] Resolved parameters.
 * @param {object} [opts.bindings] Resolved bindings {name: [ids]}.
 * @param {object|null} [opts.event] Normalised event snapshot.
 * @param {object} [opts.trigger] {type, id, scheduleId}.
 * @param {object|null} [opts.occurrence] {key, intendedDueAt, missedCount}.
 * @param {object|null} [opts.parent] {runId, branchId, stepId, owned}.
 * @param {number} [opts.revision] Revision to pin (current by default).
 * @param {object} [opts.correlation] {rootId, depth}.
 * @param {string|null} [opts.rerunOf] Run this one repeats.
 * @param {boolean} [opts.fromQueue] True when draining the queue.
 * @returns {{ok: boolean, status: string, instance?: object, reason?: string, vars?: object}} Result.
 */
export function admitRun(defId, opts) {
  const s = getState();
  const limits = getLimits();
  const record = getRecord(defId);
  const reject = (reason, vars = {}) => {
    count('rejected');
    diag(`admission rejected ${defId}: ${reason}`);
    return { ok: false, status: 'rejected', reason, vars };
  };
  if (runtime.disabled) {
    return reject('disabled');
  }
  if (s.halted) {
    return reject('halted');
  }
  if (!record || record.archived) {
    return reject('definitionNotFound', { id: defId });
  }
  if (!record.enabled) {
    return reject('definitionDisabled', { id: defId });
  }
  const revision = opts.revision ?? record.current;
  const def = getSnapshot(defId, revision);
  if (!def) {
    return reject('revisionMissing', { id: defId, revision });
  }
  const depth = opts.correlation?.depth ?? 0;
  if (depth > limits.ancestryDepth) {
    return reject('ancestryLimit', { max: limits.ancestryDepth });
  }
  if (opts.parent) {
    const parent = getInstance(opts.parent.runId);
    const recursion = def.policy?.recursion;
    if (
      parent &&
      parent.definitionId === defId &&
      !(recursion?.allow && depth <= recursion.maxDepth)
    ) {
      return reject('recursionLimit', {});
    }
    if (parent && countDescendants(parent.correlation.rootId) >= limits.descendantsPerRun) {
      return reject('descendantLimit', { max: limits.descendantsPerRun });
    }
  }
  const active = Object.values(s.instances).filter((i) => ACTIVE_STATUSES.has(i.status)).length;
  if (active >= limits.activeInstances) {
    return reject('tooManyRuns', { max: limits.activeInstances });
  }
  if (stateNearlyFull(now())) {
    return reject('stateFull', {});
  }
  if (!opts.fromQueue && !checkCircuit(defId, def)) {
    return reject('circuitOpen', { id: defId });
  }
  const policy = def.policy || {};
  const mode = policy.concurrency || 'skipIfRunning';
  const running = activeRunsOf(defId);
  const max = policy.maxConcurrent ?? (mode === 'allow' ? 5 : 1);
  if (running.length >= max && !opts.parent) {
    if (mode === 'skipIfRunning') {
      count('suppressed');
      return { ok: false, status: 'skipped', reason: 'alreadyRunning', vars: { id: defId } };
    }
    if (mode === 'allow') {
      return reject('concurrencyLimit', { max });
    }
    if (mode === 'queue') {
      return enqueue(defId, def, opts);
    }
    if (mode === 'replace') {
      for (const inst of running) {
        cancelRun(inst.id, null, 'replaced');
      }
    }
  }
  const instance = createInstance(def, revision, opts);
  return { ok: true, status: 'started', instance };
}

/**
 * Counts the runs started from one root run.
 *
 * @param {string} rootId Root run ID.
 * @returns {number} Count.
 */
function countDescendants(rootId) {
  return Object.values(getState().instances).filter(
    (i) => i.correlation?.rootId === rootId && i.id !== rootId
  ).length;
}

/**
 * Applies the per-definition circuit breaker: too many admissions in a
 * minute disable the definition and raise an incident.
 *
 * @param {string} defId Definition ID.
 * @param {object} def Definition snapshot.
 * @returns {boolean} True when the admission may proceed.
 */
function checkCircuit(defId, def) {
  const s = getState();
  const at = now();
  const max = def.policy?.circuit?.admissionsPerMinute ?? getLimits().admissionsPerMinute;
  const window = s.circuit[defId] || { start: at, count: 0 };
  if (at - window.start > 60000) {
    window.start = at;
    window.count = 0;
  }
  window.count += 1;
  s.circuit[defId] = window;
  if (window.count > max) {
    setEnabled(defId, false, null, { reason: 'circuit' });
    createIncident({
      kind: 'circuit',
      cause: 'circuitBreaker',
      definitionId: defId,
      count: window.count,
      range: { from: window.start, to: at },
    });
    maybeCall('notifyGm', 'circuit', { id: defId, count: window.count });
    return false;
  }
  return true;
}

/**
 * Adds an admission to a definition's queue. Parameters and targets are
 * pinned now, not taken from later selection.
 *
 * @param {string} defId Definition ID.
 * @param {object} def Definition snapshot.
 * @param {object} opts Start options.
 * @returns {object} Admission result.
 */
function enqueue(defId, def, opts) {
  const s = getState();
  const queue = s.queues[defId] || (s.queues[defId] = []);
  const max = Math.min(def.policy?.maxQueue ?? 10, getLimits().queuedPerDefinition);
  if (queue.length >= max) {
    count('rejected');
    createIncident({ kind: 'missed', cause: 'queueFull', definitionId: defId, count: 1 });
    return { ok: false, status: 'rejected', reason: 'queueFull', vars: { max } };
  }
  const at = now();
  const entry = {
    id: nextId('queued'),
    definitionId: defId,
    revision: opts.revision ?? getRecord(defId).current,
    admittedAt: at,
    expiresAt: def.policy?.queueExpiryMs ? at + def.policy.queueExpiryMs : null,
    opts: clone({ ...opts, fromQueue: true }),
  };
  queue.push(entry);
  if (entry.expiresAt) {
    schedule({
      kind: JOB.QUEUE_EXPIRY,
      dueAt: entry.expiresAt,
      key: `queue:${entry.id}`,
      target: { defId, entryId: entry.id },
    });
  }
  audit('run.queue', { definition: defId, entry: entry.id });
  maybeCall('dashboardDirty', 'queue');
  return { ok: true, status: 'queued', entry };
}

/**
 * Starts the next queued admission of a definition when there is room.
 *
 * @param {string} defId Definition ID.
 * @returns {void}
 */
export function drainQueue(defId) {
  const s = getState();
  const queue = s.queues[defId];
  if (!queue?.length) {
    return;
  }
  const def = getSnapshot(defId);
  const max = def?.policy?.maxConcurrent ?? 1;
  while (queue.length && activeRunsOf(defId).length < max) {
    const entry = queue.shift();
    runtime.scheduler?.cancelKey(`queue:${entry.id}`);
    if (entry.expiresAt && entry.expiresAt < now()) {
      createIncident({
        kind: 'missed',
        cause: 'expiredQueue',
        definitionId: defId,
        count: 1,
        range: { from: entry.admittedAt, to: entry.expiresAt },
      });
      continue;
    }
    const result = admitRun(defId, entry.opts);
    if (!result.ok && result.status === 'rejected') {
      createIncident({
        kind: 'missed',
        cause: 'queueRejected',
        definitionId: defId,
        count: 1,
        evidence: result.reason,
      });
    }
  }
  if (!queue.length) {
    delete s.queues[defId];
  }
  maybeCall('dashboardDirty', 'queue');
}

/**
 * Drops an expired queue entry (job handler).
 *
 * @param {object} job Job.
 * @returns {void}
 */
function onQueueExpiry(job) {
  const s = getState();
  const queue = s.queues[job.target.defId] || [];
  const index = queue.findIndex((e) => e.id === job.target.entryId);
  if (index >= 0) {
    const [entry] = queue.splice(index, 1);
    createIncident({
      kind: 'missed',
      cause: 'expiredQueue',
      definitionId: entry.definitionId,
      count: 1,
      range: { from: entry.admittedAt, to: entry.expiresAt },
    });
    maybeCall('dashboardDirty', 'queue');
  }
}

/**
 * Creates and starts a run.
 *
 * @param {object} def Definition snapshot.
 * @param {number} revision Pinned revision.
 * @param {object} opts Start options.
 * @returns {object} Instance.
 */
function createInstance(def, revision, opts) {
  const s = getState();
  const at = now();
  const id = nextId('run');
  const parent = opts.parent ? getInstance(opts.parent.runId) : null;
  const inst = {
    id,
    revision: 1,
    generation: 1,
    definitionId: def.id,
    definitionRevision: revision,
    name: def.name,
    status: STATUS.RUNNING,
    initiatorPlayerId: opts.initiatorId || null,
    authority: def.access?.authority === 'gmService' ? 'gmService' : 'initiator',
    params: clone(opts.params || {}),
    bindings: clone(opts.bindings || {}),
    event: opts.event ? clone(opts.event) : null,
    trigger: opts.trigger || { type: 'manual', id: 'manual' },
    occurrence: opts.occurrence || null,
    parentId: parent?.id || null,
    parentBranchId: opts.parent?.branchId || null,
    parentStepId: opts.parent?.stepId || null,
    owned: Boolean(opts.parent?.owned),
    children: [],
    correlation: {
      rootId: parent?.correlation.rootId || id,
      depth: opts.correlation?.depth ?? (parent ? parent.correlation.depth + 1 : 0),
    },
    rerunOf: opts.rerunOf || null,
    createdAt: at,
    startedAt: at,
    completedAt: null,
    intendedDueAt: opts.occurrence?.intendedDueAt ?? null,
    latenessMs: opts.occurrence?.intendedDueAt
      ? Math.max(0, at - opts.occurrence.intendedDueAt)
      : 0,
    branches: { main: newBranch('main', null, null, 'root', {}) },
    nextBranch: 1,
    journal: {},
    timeline: [],
    pause: null,
    review: null,
    outcome: null,
    error: null,
    effects: 0,
    bootId: runtime.bootId,
  };
  s.instances[id] = inst;
  if (parent) {
    parent.children.push(id);
  }
  timeline(inst, 'start', {
    trigger: inst.trigger.type,
    by: inst.initiatorPlayerId || 'gmService',
  });
  count('admitted');
  audit('run.start', {
    run: id,
    definition: def.id,
    revision,
    by: inst.initiatorPlayerId,
    trigger: inst.trigger.type,
  });
  const policy = def.policy || {};
  if (policy.timeoutMs) {
    schedule({
      kind: JOB.CONTINUE,
      dueAt: at + policy.timeoutMs,
      key: `life:${id}`,
      target: { runId: id, lifetime: 'timeout', gen: inst.generation },
    });
  } else if (policy.lifetimeMs) {
    schedule({
      kind: JOB.CONTINUE,
      dueAt: at + policy.lifetimeMs,
      key: `life:${id}`,
      target: { runId: id, lifetime: 'expire', gen: inst.generation },
    });
  }
  emitTaskEvent(inst, 'task.started');
  scheduleBranch(inst, inst.branches.main, at);
  maybeCall('dashboardDirty', 'instances');
  return inst;
}

/**
 * Creates a branch record.
 *
 * @param {string} id Branch ID.
 * @param {string|null} parentId Parent branch.
 * @param {string|null} stepId Parallel step that spawned it.
 * @param {string} block Starting block key.
 * @param {object} variables Copy-on-start variables.
 * @param {string} [label] Display label.
 * @returns {object} Branch.
 */
function newBranch(id, parentId, stepId, block, variables, label) {
  return {
    id,
    label: label || id,
    parentId,
    stepId,
    status: 'running',
    frames: [{ block, index: 0 }],
    variables,
    wait: null,
    gen: 1,
    consecutive: 0,
    attempts: {},
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

/**
 * Schedules a branch continuation.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {number} dueAt When.
 * @param {string} [kind] Job kind.
 * @returns {void}
 */
function scheduleBranch(inst, branch, dueAt, kind = JOB.CONTINUE) {
  schedule({
    kind,
    dueAt,
    key: `run:${inst.id}:${branch.id}`,
    target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen },
  });
}

/**
 * Cancels every job of a run.
 *
 * @param {object} inst Instance.
 * @param {boolean} [includeLifetime=false] Also cancel the run timeout.
 * @returns {void}
 */
function cancelJobs(inst, includeLifetime = false) {
  runtime.scheduler?.cancelWhere(
    (job) =>
      job.target?.runId === inst.id && (includeLifetime || !String(job.key).startsWith('life:'))
  );
}

/**
 * Returns the branch a job targets when the job is still current.
 *
 * @param {object} job Job.
 * @returns {{inst: object, branch: object}|null} Live target.
 */
function liveTarget(job) {
  const inst = getInstance(job.target.runId);
  if (!inst || inst.generation !== job.target.gen) {
    return null;
  }
  const branch = inst.branches[job.target.branchId];
  if (!branch || branch.gen !== job.target.bgen) {
    return null;
  }
  return { inst, branch };
}

/**
 * Handles continuation, retry and wait-expiry jobs.
 *
 * @param {object} job Job.
 * @returns {void}
 */
function onContinueJob(job) {
  if (job.target.lifetime) {
    const inst = getInstance(job.target.runId);
    if (inst && ACTIVE_STATUSES.has(inst.status)) {
      if (job.target.lifetime === 'timeout') {
        finalize(
          inst,
          STATUS.FAILED,
          errorRecord(taskError(ERROR_CODES.TIMEOUT, 'runTimeout', {}))
        );
      } else {
        finalize(
          inst,
          STATUS.EXPIRED,
          errorRecord(taskError(ERROR_CODES.TIMEOUT, 'runExpired', {}))
        );
      }
    }
    return;
  }
  const live = liveTarget(job);
  if (!live) {
    return;
  }
  const { inst, branch } = live;
  if (inst.status !== STATUS.RUNNING && inst.status !== STATUS.WAITING) {
    return;
  }
  const wait = branch.wait;
  if (wait?.kind === 'time') {
    const lateness = now() - wait.dueAt;
    if (wait.dueAt > now()) {
      // A clock moved backwards: wait for the real deadline.
      scheduleBranch(inst, branch, wait.dueAt);
      return;
    }
    branch.wait = null;
    branch.status = 'running';
    if (lateness > lateWindow(inst)) {
      if (!applyWaitOverdue(inst, branch, wait, lateness)) {
        return;
      }
    }
  } else if (wait?.kind === 'retry' || wait?.kind === 'yield') {
    branch.wait = null;
    branch.status = 'running';
  } else if (wait?.kind === 'child' || wait?.kind === 'join' || wait?.kind === 'async') {
    if (!wait.completion) {
      return;
    }
    branch.wait = null;
    branch.status = 'running';
    if (wait.kind === 'async' && !finishAsync(inst, branch, wait)) {
      return;
    }
    if (wait.kind === 'child' && !finishChildWait(inst, branch, wait)) {
      return;
    }
  } else if (wait) {
    return;
  }
  inst.status = STATUS.RUNNING;
  runBranch(inst, branch);
}

/**
 * Returns the lateness window after which overdue policy applies.
 *
 * @param {object} inst Instance.
 * @returns {number} Milliseconds.
 */
function lateWindow(inst) {
  return defOf(inst)?.policy?.overdue?.windowMs ?? getConfig().lateWindowMs;
}

/**
 * Applies the overdue policy to a wait that ended much later than due
 * (typically after the sandbox was off).
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} wait Expired wait.
 * @param {number} lateness Milliseconds late.
 * @returns {boolean} True when the branch should continue now.
 */
function applyWaitOverdue(inst, branch, wait, lateness) {
  const policyMode = defOf(inst)?.policy?.overdue?.mode;
  const mode = wait.overdue || { review: 'review', expire: 'expire' }[policyMode] || 'continue';
  timeline(inst, 'late', { stepId: wait.stepId, latenessMs: lateness, mode });
  if (mode === 'review') {
    enterReview(inst, branch, 'overdueWait', {
      stepId: wait.stepId,
      latenessMs: lateness,
      indexAdvanced: true,
    });
    return false;
  }
  if (mode === 'expire') {
    finalize(
      inst,
      STATUS.EXPIRED,
      errorRecord(
        taskError(ERROR_CODES.TIMEOUT, 'overdueExpired', { latenessMs: lateness }),
        wait.stepId
      )
    );
    return false;
  }
  if (mode === 'skipNext') {
    const frame = branch.frames.at(-1);
    if (frame) {
      frame.index += 1;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Running steps
// ---------------------------------------------------------------------------

/**
 * Runs a branch until it suspends, finishes or uses up its job budget.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @returns {void}
 */
export function runBranch(inst, branch) {
  const compiled = getCompiled(inst.definitionId, inst.definitionRevision);
  if (!compiled) {
    finalize(
      inst,
      STATUS.FAILED,
      errorRecord(taskError(ERROR_CODES.VALIDATION, 'revisionMissing', { id: inst.definitionId }))
    );
    return;
  }
  const limits = getLimits();
  let steps = 0;
  while (branch.status === 'running' && inst.status === STATUS.RUNNING) {
    if (steps >= limits.stepsPerJob) {
      // Bounded yield: let other due work run, then carry on.
      branch.wait = { kind: 'yield' };
      branch.status = 'waiting';
      scheduleBranch(inst, branch, now() + 10);
      return;
    }
    const frame = branch.frames.at(-1);
    if (!frame) {
      completeBranch(inst, branch);
      return;
    }
    const block = compiled.blocks.get(frame.block) || [];
    if (frame.index >= block.length) {
      popFrame(inst, branch, compiled);
      steps += 1;
      continue;
    }
    branch.consecutive += 1;
    if (branch.consecutive > limits.consecutiveSteps) {
      failBranch(
        inst,
        branch,
        errorRecord(
          taskError(ERROR_CODES.RUNAWAY, 'runaway', { max: limits.consecutiveSteps }),
          block[frame.index].id
        )
      );
      return;
    }
    const step = block[frame.index];
    let outcome;
    try {
      outcome = execStep(inst, branch, frame, step);
    } catch (err) {
      outcome = handleStepError(inst, branch, step, err, false);
    }
    steps += 1;
    if (outcome === 'next') {
      frame.index += 1;
    } else if (outcome === 'suspend' || outcome === 'stop') {
      return;
    }
  }
}

/**
 * Leaves a finished block: loops decide whether to go round again; other
 * compound steps simply continue after themselves.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} compiled Compiled program.
 * @returns {void}
 */
function popFrame(inst, branch, compiled) {
  const frame = branch.frames.pop();
  const parent = branch.frames.at(-1);
  if (!parent || !frame.owner) {
    return;
  }
  const owner = compiled.steps.get(frame.owner)?.step;
  if (owner?.type === 'loop') {
    const next = loopContinues(inst, branch, owner, frame);
    if (next) {
      branch.frames.push({
        block: frame.block,
        index: 0,
        owner: frame.owner,
        loop: { ...frame.loop, iteration: frame.loop.iteration + 1 },
      });
      return;
    }
  }
  parent.index += 1;
}

/**
 * Decides whether a loop runs another iteration.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} step Loop step.
 * @param {object} frame Finished iteration frame.
 * @returns {boolean} True to iterate again.
 */
function loopContinues(inst, branch, step, frame) {
  const done = frame.loop.iteration;
  const cap =
    step.mode === 'forever'
      ? Infinity
      : Math.min(step.maxIterations ?? getLimits().loopIterations, getLimits().loopIterations);
  if (done >= cap) {
    if (step.mode === 'while' || step.mode === 'until') {
      timeline(inst, 'loopCap', { stepId: step.id, iterations: done });
    }
    return false;
  }
  switch (step.mode) {
    case 'count':
      return done < frame.loop.count;
    case 'while':
      return truthy(evalExpr(inst, branch, step.condition));
    case 'until':
      return !truthy(evalExpr(inst, branch, step.condition));
    case 'forever':
      return true;
    default:
      return false;
  }
}

/**
 * Executes one step.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} frame Current frame.
 * @param {object} step Step.
 * @returns {'next'|'pushed'|'suspend'|'stop'} What happens next.
 */
function execStep(inst, branch, frame, step) {
  switch (step.type) {
    case 'wait':
      return execWait(inst, branch, frame, step);
    case 'awaitEvent':
      return execAwait(inst, branch, frame, step);
    case 'if': {
      const value = evalExpr(inst, branch, step.condition);
      const choice = truthy(value) ? 'then' : 'else';
      timeline(inst, 'if', { stepId: step.id, choice, missing: value === MISSING || undefined });
      const list = step[choice] || [];
      if (!list.length) {
        return 'next';
      }
      // The chosen branch is stored in the frame, so a restart resumes it.
      branch.frames.push({ block: `${step.id}/${choice}`, index: 0, owner: step.id, choice });
      return 'pushed';
    }
    case 'loop':
      return execLoop(inst, branch, step);
    case 'call':
      return execCall(inst, branch, frame, step);
    case 'parallel':
      return execParallel(inst, branch, frame, step);
    case 'stop': {
      const message = step.message ? render(inst, branch, step.message, (v) => v) : null;
      const outcome = step.outcome || 'completed';
      const status = {
        completed: STATUS.COMPLETED,
        failed: STATUS.FAILED,
        cancelled: STATUS.CANCELLED,
      }[outcome];
      finalize(
        inst,
        status,
        outcome === 'completed'
          ? null
          : {
              code: 'stopped',
              reason: 'stopStep',
              vars: { message: truncate(message || '', 200) },
              stepId: step.id,
            }
      );
      return 'stop';
    }
    case 'variable.set': {
      const value = evalExpr(inst, branch, step.value);
      branch.variables[step.name] = value === MISSING ? null : clone(value);
      return 'next';
    }
    case 'event.emit': {
      const value = step.value === undefined ? null : evalExpr(inst, branch, step.value);
      call('emitEvent', {
        type: 'signal',
        name: step.signal,
        value: value === MISSING ? null : value,
        source: 'internal',
        correlation: {
          runId: inst.id,
          rootId: inst.correlation.rootId,
          depth: inst.correlation.depth + 1,
        },
      });
      return 'next';
    }
    case 'task.start':
      return execTaskStart(inst, branch, step);
    case 'task.cancel':
    case 'task.pause':
      return execTaskControl(inst, branch, step);
    default:
      return execAction(inst, branch, frame, step);
  }
}

/**
 * Suspends a branch for a duration or until a moment.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} frame Frame.
 * @param {object} step Wait step.
 * @returns {'suspend'} Always suspends.
 */
function execWait(inst, branch, frame, step) {
  const at = now();
  let dueAt;
  let absolute = false;
  if (step.durationMs !== undefined) {
    const raw = evalExpr(inst, branch, step.durationMs);
    const ms = typeof raw === 'number' ? raw : durationValue(raw);
    if (ms === null || !Number.isFinite(ms) || ms < 0) {
      throw taskError(ERROR_CODES.VALIDATION, 'badDuration', {});
    }
    dueAt = at + Math.max(ms, getLimits().minWaitMs);
  } else {
    const raw = evalExpr(inst, branch, step.until);
    dueAt = typeof raw === 'number' ? raw : parseIsoInstant(raw);
    if (!Number.isFinite(dueAt)) {
      throw taskError(ERROR_CODES.VALIDATION, 'badInstant', {});
    }
    absolute = true;
  }
  frame.index += 1;
  branch.consecutive = 0;
  branch.gen += 1;
  branch.wait = { kind: 'time', dueAt, stepId: step.id, absolute, overdue: step.overdue || null };
  branch.status = 'waiting';
  inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
  scheduleBranch(inst, branch, dueAt);
  touch(inst);
  return 'suspend';
}

/**
 * Registers an awaited event with a mandatory timeout.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} frame Frame.
 * @param {object} step awaitEvent step.
 * @returns {'suspend'} Always suspends.
 */
function execAwait(inst, branch, frame, step) {
  const at = now();
  frame.index += 1;
  branch.consecutive = 0;
  branch.gen += 1;
  branch.wait = {
    kind: 'event',
    event: step.event,
    filter: step.filter || {},
    stepId: step.id,
    saveAs: step.saveAs || step.id,
    registeredAt: at,
    timeoutAt: at + step.timeoutMs,
  };
  branch.status = 'waiting';
  inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
  // Registration is saved before any further event is processed.
  maybeCall('awaitsChanged');
  schedule({
    kind: JOB.AWAIT_TIMEOUT,
    dueAt: branch.wait.timeoutAt,
    key: `await:${inst.id}:${branch.id}`,
    target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen },
  });
  touch(inst);
  return 'suspend';
}

/**
 * Starts a loop.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} step Loop step.
 * @returns {'next'|'pushed'} Outcome.
 */
function execLoop(inst, branch, step) {
  let total = null;
  if (step.mode === 'count') {
    const raw = evalExpr(inst, branch, step.count);
    total = typeof raw === 'number' && Number.isInteger(raw) ? raw : Number.NaN;
    if (!Number.isInteger(total) || total < 0) {
      throw taskError(ERROR_CODES.VALIDATION, 'badCount', {});
    }
    total = Math.min(total, getLimits().loopIterations);
    if (total === 0) {
      return 'next';
    }
  }
  if (step.mode === 'while' && !truthy(evalExpr(inst, branch, step.condition))) {
    return 'next';
  }
  branch.frames.push({
    block: `${step.id}/steps`,
    index: 0,
    owner: step.id,
    loop: { iteration: 1, count: total },
  });
  return 'pushed';
}

/**
 * Calls another definition as a child run.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} frame Frame.
 * @param {object} step Call step.
 * @returns {'next'|'suspend'} Outcome.
 */
function execCall(inst, branch, frame, step) {
  const awaitChild = step.await !== false;
  if (!awaitChild && !hasGmAuthority(inst)) {
    throw taskError(ERROR_CODES.UNAUTHORIZED, 'detachNeedsGm', {});
  }
  const child = startChild(inst, branch, step, awaitChild);
  if (!awaitChild) {
    branch.variables[step.saveAs || step.id] = { runId: child.id };
    return 'next';
  }
  frame.index += 1;
  branch.gen += 1;
  branch.wait = {
    kind: 'child',
    childId: child.id,
    stepId: step.id,
    saveAs: step.saveAs || step.id,
    onChildFail: step.onChildFail || 'fail',
  };
  branch.status = 'waiting';
  branch.consecutive = 0;
  inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
  touch(inst);
  return 'suspend';
}

/**
 * Admits a child run with mapped parameters and targets.
 *
 * @param {object} inst Parent instance.
 * @param {object} branch Parent branch.
 * @param {object} step call or task.start step.
 * @param {boolean} owned Whether the parent owns (and awaits) it.
 * @returns {object} Child instance.
 */
function startChild(inst, branch, step, owned) {
  const childDef = getSnapshot(step.definition, step.revision);
  if (!childDef) {
    throw taskError(ERROR_CODES.MISSING_TARGET, 'definitionMissing', { id: step.definition });
  }
  const params = {};
  for (const [name, expr] of Object.entries(step.params || {})) {
    const value = evalExpr(inst, branch, expr);
    if (value !== MISSING) {
      params[name] = value;
    }
  }
  const resolved = resolveParams(childDef, params);
  if (!resolved.ok) {
    throw taskError(ERROR_CODES.VALIDATION, resolved.error, resolved.vars);
  }
  const bindings = {};
  for (const [name, spec] of Object.entries(step.bindings || {})) {
    bindings[name] = resolveTargets(
      inst,
      branch,
      spec,
      childDef.bindings?.[name]?.objectType || 'graphic'
    ).map((t) => t.id);
  }
  const result = admitRun(step.definition, {
    initiatorId: inst.initiatorPlayerId,
    params: resolved.params,
    bindings,
    event: inst.event,
    trigger: { type: 'call', id: step.id },
    parent: { runId: inst.id, branchId: branch.id, stepId: step.id, owned },
    revision: step.revision,
    correlation: { depth: inst.correlation.depth + 1 },
  });
  if (!result.ok || !result.instance) {
    throw taskError(
      ERROR_CODES.RESOURCE_LIMIT,
      'childRejected',
      { id: step.definition, reason: result.reason || result.status },
      { transient: false }
    );
  }
  timeline(inst, 'call', { stepId: step.id, child: result.instance.id });
  return result.instance;
}

/**
 * Starts a detached run (`task.start`).
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} step Step.
 * @returns {'next'} Outcome.
 */
function execTaskStart(inst, branch, step) {
  const child = startChild(inst, branch, step, false);
  if (step.saveAs) {
    branch.variables[step.saveAs] = child.id;
  }
  return 'next';
}

/**
 * Cancels or pauses child runs, or another run with GM authority.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} step Step.
 * @returns {'next'} Outcome.
 */
function execTaskControl(inst, branch, step) {
  let ids;
  if ((step.scope || 'children') === 'children') {
    ids = inst.children;
  } else {
    const raw = evalExpr(inst, branch, step.run);
    ids = (Array.isArray(raw) ? raw : [raw]).filter((x) => typeof x === 'string');
    for (const id of ids) {
      const target = getInstance(id);
      const descendant = target && target.correlation.rootId === inst.correlation.rootId;
      if (target && !descendant && !hasGmAuthority(inst)) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, 'runNotOwned', { id });
      }
    }
  }
  for (const id of ids) {
    const target = getInstance(id);
    if (!target || !ACTIVE_STATUSES.has(target.status) || id === inst.id) {
      continue;
    }
    if (step.type === 'task.cancel') {
      cancelRun(id, null, 'cancelledByTask');
    } else {
      pauseRun(id, null);
    }
  }
  return 'next';
}

/**
 * Spawns cooperative parallel branches and waits for their join.
 *
 * @param {object} inst Instance.
 * @param {object} branch Parent branch.
 * @param {object} frame Frame.
 * @param {object} step Parallel step.
 * @returns {'suspend'} Always suspends.
 */
function execParallel(inst, branch, frame, step) {
  const activeBranches = Object.values(inst.branches).filter(
    (b) => b.status === 'running' || b.status === 'waiting'
  ).length;
  if (activeBranches + step.branches.length > getLimits().branchesPerRun + 1) {
    throw taskError(
      ERROR_CODES.RESOURCE_LIMIT,
      'tooManyBranches',
      { max: getLimits().branchesPerRun },
      { transient: false }
    );
  }
  const children = [];
  for (const spec of step.branches) {
    const id = `b${inst.nextBranch++}`;
    const child = newBranch(
      id,
      branch.id,
      step.id,
      `${step.id}/branch/${spec.id}`,
      clone(branch.variables),
      spec.id
    );
    inst.branches[id] = child;
    children.push(id);
  }
  frame.index += 1;
  branch.gen += 1;
  branch.wait = {
    kind: 'join',
    stepId: step.id,
    join: step.join,
    children,
    cancelLosers: step.cancelLosers !== false,
  };
  branch.status = 'waiting';
  branch.consecutive = 0;
  timeline(inst, 'parallel', { stepId: step.id, branches: children.length });
  for (const id of children) {
    scheduleBranch(inst, inst.branches[id], now());
  }
  touch(inst);
  return 'suspend';
}

/**
 * Runs an action step through the journal.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} frame Frame.
 * @param {object} step Action step.
 * @returns {'next'|'suspend'} Outcome.
 */
function execAction(inst, branch, frame, step) {
  const impl = ACTIONS[step.type];
  if (!impl) {
    throw taskError(
      ERROR_CODES.UNAVAILABLE,
      'unknownAction',
      { type: step.type },
      { transient: false }
    );
  }
  const def = defOf(inst);
  const attempt = branch.attempts[step.id] || 1;
  const key = journalKey(branch, step, attempt);
  const replay = replayClass(step);
  const journaled = replay !== REPLAY.PURE && replay !== REPLAY.INTERNAL;
  const entry = inst.journal[key] || null;
  if (journaled && !entry) {
    inst.journal[key] = {
      status: 'prepared',
      at: now(),
      stepId: step.id,
      branchId: branch.id,
      attempt,
      replay,
      data: {},
    };
    pruneJournal(inst);
  }
  const ctx = actionContext(inst, branch, step, def, key);
  const res = impl(step, ctx);
  if (res.async) {
    return startAsync(inst, branch, frame, step, key, res.async);
  }
  if (res.partial) {
    // Bounded chunk: remember progress, yield, then run this step again.
    inst.journal[key].progress = res.done;
    branch.wait = { kind: 'yield' };
    branch.status = 'waiting';
    scheduleBranch(inst, branch, now() + 10);
    return 'suspend';
  }
  if (journaled) {
    const record = inst.journal[key];
    record.status = res.outcome === 'dispatched' ? 'dispatched' : 'confirmed';
    record.completedAt = now();
    record.result = compactResult(res.result);
    inst.effects += 1;
  }
  if (step.saveAs) {
    branch.variables[step.saveAs] = res.result === undefined ? null : clone(res.result);
  }
  delete branch.attempts[step.id];
  return 'next';
}

/**
 * Shrinks a result for storage.
 *
 * @param {*} result Result.
 * @returns {*} Compact result.
 */
function compactResult(result) {
  const text = JSON.stringify(result ?? null);
  return text.length > 500 ? { truncated: true } : (result ?? null);
}

/**
 * Builds the journal key for an action attempt:
 * `branch/step/iterationPath/attempt`.
 *
 * @param {object} branch Branch.
 * @param {object} step Step.
 * @param {number} attempt Attempt number.
 * @returns {string} Key.
 */
function journalKey(branch, step, attempt) {
  const path =
    branch.frames
      .filter((f) => f.loop)
      .map((f) => f.loop.iteration)
      .join('.') || '0';
  return `${branch.id}/${step.id}/${path}/${attempt}`;
}

/**
 * Keeps the journal bounded, dropping the oldest settled entries.
 *
 * @param {object} inst Instance.
 * @returns {void}
 */
function pruneJournal(inst) {
  const keys = Object.keys(inst.journal);
  if (keys.length <= JOURNAL_LIMIT) {
    return;
  }
  const settled = keys
    .filter((k) =>
      ['confirmed', 'dispatched', 'skipped', 'failed'].includes(inst.journal[k].status)
    )
    .sort((a, b) => inst.journal[a].at - inst.journal[b].at);
  for (const k of settled.slice(0, keys.length - JOURNAL_LIMIT)) {
    delete inst.journal[k];
  }
}

/**
 * Builds the context an action uses.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} step Step.
 * @param {object} def Definition snapshot.
 * @param {string} key Journal key.
 * @returns {object} Context.
 */
function actionContext(inst, branch, step, def, key) {
  return {
    inst,
    def,
    progress: inst.journal[key]?.progress || [],
    evaluate: (expr) => evalExpr(inst, branch, expr),
    render: (template, sanitise, args) => render(inst, branch, template, sanitise, args),
    targets: (spec, type) => {
      const list = resolveTargets(inst, branch, spec, type);
      if (!list.length) {
        throw taskError(ERROR_CODES.MISSING_TARGET, 'noTargets', { stepId: step.id });
      }
      return list;
    },
    authorise: (ids) => {
      const decision = checkEffectAuthority(inst, ids, def);
      if (!decision.ok) {
        throw taskError(ERROR_CODES.UNAUTHORIZED, decision.reason, { id: decision.id || '' });
      }
    },
    prepare: (data) => {
      if (inst.journal[key]) {
        inst.journal[key].data = { ...inst.journal[key].data, ...clone(data) };
      }
    },
    emit: (event) =>
      call('emitEvent', {
        ...event,
        source: 'internal',
        correlation: {
          runId: inst.id,
          rootId: inst.correlation.rootId,
          depth: inst.correlation.depth + 1,
        },
      }),
    noteWrite: (objectId, changes) => maybeCall('noteOwnWrite', objectId, changes),
  };
}

// ---------------------------------------------------------------------------
// Asynchronous actions
// ---------------------------------------------------------------------------

/**
 * Starts an asynchronous adapter call and suspends the branch.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} frame Frame.
 * @param {object} step Step.
 * @param {string} key Journal key.
 * @param {object} op {adapter, action, input, timeoutMs}.
 * @returns {'suspend'} Always suspends.
 */
function startAsync(inst, branch, frame, step, key, op) {
  const at = now();
  const opId = `${inst.id}/${key}`;
  frame.index += 1;
  branch.gen += 1;
  branch.consecutive = 0;
  branch.wait = {
    kind: 'async',
    opId,
    key,
    stepId: step.id,
    saveAs: step.saveAs || null,
    adapter: op.adapter.name,
    action: step.action,
    timeoutAt: at + (op.timeoutMs || 30000),
    bootId: runtime.bootId,
    completion: null,
  };
  branch.status = 'waiting';
  inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
  inst.journal[key].status = 'dispatched';
  schedule({
    kind: JOB.ASYNC_TIMEOUT,
    dueAt: branch.wait.timeoutAt,
    key: `async:${inst.id}:${branch.id}`,
    target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen, opId },
  });
  const bootId = runtime.bootId;
  let called = false;
  const done = (err, result) => {
    if (called) {
      return;
    }
    called = true;
    asyncComplete(inst.id, branch.id, opId, bootId, err, result);
  };
  try {
    op.action.invoke(clone(op.input), { idempotencyKey: key, runId: inst.id, opId }, done);
  } catch (err) {
    done(err);
  }
  touch(inst);
  return 'suspend';
}

/**
 * Receives an adapter callback. Callbacks from an earlier boot, a cancelled
 * run or a superseded attempt are ignored.
 *
 * @param {string} runId Run ID.
 * @param {string} branchId Branch ID.
 * @param {string} opId Operation ID.
 * @param {string} bootId Boot that issued the call.
 * @param {*} err Error, if any.
 * @param {*} result Result.
 * @returns {void}
 */
function asyncComplete(runId, branchId, opId, bootId, err, result) {
  if (bootId !== runtime.bootId) {
    return;
  }
  const inst = getInstance(runId);
  const branch = inst?.branches[branchId];
  if (
    !inst ||
    !branch ||
    branch.wait?.kind !== 'async' ||
    branch.wait.opId !== opId ||
    TERMINAL_STATUSES.has(inst.status)
  ) {
    return;
  }
  runtime.scheduler?.cancelKey(`async:${runId}:${branchId}`);
  branch.wait.completion = {
    ok: !err,
    error: err ? truncate(String(err?.message || err), 200) : null,
    uncertain: Boolean(err?.uncertain),
    result: compactResult(result),
  };
  if (inst.status === STATUS.PAUSED || inst.status === STATUS.REVIEW) {
    // Recorded while paused; the run advances on resume.
    return;
  }
  scheduleBranch(inst, branch, now());
}

/**
 * Applies a recorded adapter completion.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} wait Async wait.
 * @returns {boolean} True when the branch continues.
 */
function finishAsync(inst, branch, wait) {
  const entry = inst.journal[wait.key];
  const done = wait.completion;
  if (entry) {
    entry.status = done.ok ? 'confirmed' : 'failed';
    entry.completedAt = now();
    entry.result = done.result;
  }
  if (!done.ok) {
    const err = taskError(
      done.uncertain ? ERROR_CODES.UNCERTAIN : ERROR_CODES.UNAVAILABLE,
      'adapterFailed',
      { adapter: wait.adapter, message: done.error || '' },
      { transient: false }
    );
    const step = getCompiled(inst.definitionId, inst.definitionRevision).steps.get(
      wait.stepId
    ).step;
    return handleStepError(inst, branch, step, err, true) === 'next-advanced';
  }
  inst.effects += 1;
  if (wait.saveAs) {
    branch.variables[wait.saveAs] = done.result;
  }
  return true;
}

/**
 * Handles an adapter call that did not answer in time. The outcome is
 * unknown, so the adapter's status lookup is tried before review.
 *
 * @param {object} job Job.
 * @returns {void}
 */
function onAsyncTimeout(job) {
  const live = liveTarget(job);
  if (!live || live.branch.wait?.kind !== 'async' || live.branch.wait.opId !== job.target.opId) {
    return;
  }
  const { inst, branch } = live;
  const wait = branch.wait;
  const status = maybeCall('adapterStatus', wait.adapter, wait.action, wait.key);
  if (status?.done) {
    wait.completion = { ok: true, result: compactResult(status.result) };
    scheduleBranch(inst, branch, now());
    return;
  }
  if (inst.journal[wait.key]) {
    inst.journal[wait.key].status = 'uncertain';
  }
  timeline(inst, 'asyncTimeout', { stepId: wait.stepId });
  enterReview(inst, branch, 'uncertainOutcome', {
    stepId: wait.stepId,
    journalKey: wait.key,
    indexAdvanced: true,
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/**
 * Delivers a matching event to a waiting branch, consuming the wait once.
 *
 * @param {string} runId Run ID.
 * @param {string} branchId Branch ID.
 * @param {object} event Normalised event.
 * @returns {boolean} True when consumed.
 */
export function deliverEvent(runId, branchId, event) {
  const inst = getInstance(runId);
  const branch = inst?.branches[branchId];
  if (
    !inst ||
    !branch ||
    branch.wait?.kind !== 'event' ||
    inst.status === STATUS.PAUSED ||
    inst.status === STATUS.REVIEW
  ) {
    return false;
  }
  runtime.scheduler?.cancelKey(`await:${runId}:${branchId}`);
  branch.variables[branch.wait.saveAs] = {
    matched: true,
    timedOut: false,
    event: compactEvent(event),
  };
  timeline(inst, 'event', { stepId: branch.wait.stepId, type: event.type });
  branch.wait = null;
  branch.status = 'running';
  branch.gen += 1;
  inst.status = STATUS.RUNNING;
  maybeCall('awaitsChanged');
  scheduleBranch(inst, branch, now());
  touch(inst);
  return true;
}

/**
 * Handles an awaited event's timeout.
 *
 * @param {object} job Job.
 * @returns {void}
 */
function onAwaitTimeout(job) {
  const live = liveTarget(job);
  if (!live || live.branch.wait?.kind !== 'event') {
    return;
  }
  const { inst, branch } = live;
  branch.variables[branch.wait.saveAs] = { matched: false, timedOut: true, event: null };
  timeline(inst, 'awaitTimeout', { stepId: branch.wait.stepId });
  branch.wait = null;
  branch.status = 'running';
  branch.gen += 1;
  inst.status = STATUS.RUNNING;
  maybeCall('awaitsChanged');
  runBranch(inst, branch);
}

/**
 * Returns a storable copy of an event.
 *
 * @param {object} event Event.
 * @returns {object} Compact event.
 */
export function compactEvent(event) {
  const out = {};
  for (const key of [
    'id',
    'type',
    'source',
    'objectType',
    'objectId',
    'pageId',
    'characterId',
    'name',
    'value',
    'actor',
    'observedAt',
    'old',
    'new',
    'count',
  ]) {
    if (event[key] !== undefined) {
      out[key] = event[key];
    }
  }
  return clone(out);
}

/**
 * Returns the branches waiting for events of a type, for the router.
 *
 * @returns {{runId: string, branchId: string, wait: object, inst: object}[]} Waits.
 */
export function eventWaits() {
  const out = [];
  for (const inst of Object.values(getState().instances)) {
    if (inst.status !== STATUS.RUNNING && inst.status !== STATUS.WAITING) {
      continue;
    }
    for (const branch of Object.values(inst.branches)) {
      if (branch.wait?.kind === 'event') {
        out.push({ runId: inst.id, branchId: branch.id, wait: branch.wait, inst, branch });
      }
    }
  }
  return out;
}

/**
 * Emits an internal task lifecycle event.
 *
 * @param {object} inst Instance.
 * @param {string} type Event type.
 * @returns {void}
 */
function emitTaskEvent(inst, type) {
  maybeCall('emitEvent', {
    type,
    objectType: 'run',
    objectId: inst.id,
    name: inst.definitionId,
    value: inst.status,
    source: 'internal',
    correlation: {
      runId: inst.id,
      rootId: inst.correlation.rootId,
      depth: inst.correlation.depth + 1,
    },
  });
}

// ---------------------------------------------------------------------------
// Expressions and targets
// ---------------------------------------------------------------------------

/**
 * Evaluates an expression in a run's context.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {*} expr Expression.
 * @returns {*} Value or MISSING.
 */
export function evalExpr(inst, branch, expr) {
  return evaluate(expr, { resolve: (path) => resolveRef(inst, branch, path) });
}

/**
 * Renders a template in a run's context.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {string} template Template.
 * @param {(value: string) => string} sanitise Escaping for the destination.
 * @param {object} [args] Extra `args.*` values.
 * @returns {string} Text.
 */
function render(inst, branch, template, sanitise, args) {
  const resolve = (path) => {
    if (path.startsWith('args.') && args) {
      return readPath(args, path.split('.').slice(1));
    }
    return resolveRef(inst, branch, path);
  };
  return renderTemplate(template, resolve, sanitise).text;
}

/**
 * Resolves a reference path for expressions and templates. Only declared
 * roots and allowlisted object properties are readable.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {string} path Dotted path.
 * @returns {{found: boolean, value?: *}} Result.
 */
function resolveRef(inst, branch, path) {
  const parts = path.split('.');
  const root = parts.shift();
  switch (root) {
    case 'param':
      return readPath(inst.params, parts);
    case 'var':
      return readPath(branch.variables, parts);
    case 'event':
      return inst.event ? readPath(inst.event, parts) : { found: false };
    case 'now':
      return parts.length ? { found: false } : { found: true, value: now() };
    case 'bindings': {
      const ids = inst.bindings[parts[0]];
      if (!ids) {
        return { found: false };
      }
      if (parts[1] === 'count') {
        return { found: true, value: ids.length };
      }
      return parts.length === 1 ? { found: true, value: [...ids] } : { found: false };
    }
    case 'run': {
      const loop = branch.frames.filter((f) => f.loop).at(-1);
      const values = {
        id: inst.id,
        definition: inst.definitionId,
        revision: inst.definitionRevision,
        initiator: inst.initiatorPlayerId,
        startedAt: inst.startedAt,
        iteration: loop ? loop.loop.iteration : 0,
        intendedDueAt: inst.intendedDueAt,
        missedCount: inst.occurrence?.missedCount ?? 0,
        branch: branch.label,
      };
      return parts.length === 1 && parts[0] in values && values[parts[0]] !== null
        ? { found: true, value: values[parts[0]] }
        : { found: false };
    }
    case 'target': {
      const [name, prop] = parts;
      const ids = inst.bindings[name] || [];
      if (prop === 'count') {
        return { found: true, value: ids.length };
      }
      const found = ids.length ? findAnyTarget(ids[0]) : null;
      if (!found || parts.length !== 2) {
        return { found: false };
      }
      return readProperty(found.obj, found.type, prop);
    }
    default:
      return { found: false };
  }
}

/**
 * Resolves a step target to live objects. Missing objects are skipped;
 * the action decides whether that is an error.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} spec {binding} | {ids} | {ref}.
 * @param {string} type Expected object type.
 * @returns {{id: string, obj: object, type: string}[]} Targets.
 */
function resolveTargets(inst, branch, spec, type) {
  let ids = [];
  if (isRecord(spec) && 'binding' in spec) {
    const decl = defOf(inst)?.bindings?.[spec.binding];
    ids =
      decl?.from === 'query' && decl.query.evaluate === 'step'
        ? runQuery(decl.query, decl.objectType)
        : inst.bindings[spec.binding] || [];
  } else if (isRecord(spec) && Array.isArray(spec.ids)) {
    ids = spec.ids;
  } else if (isRecord(spec) && 'ref' in spec) {
    const value = evalExpr(inst, branch, { ref: spec.ref });
    ids = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  }
  const out = [];
  for (const id of ids.slice(0, 100)) {
    const obj = getTarget(type, id);
    if (obj) {
      out.push({ id, obj, type });
      continue;
    }
    // A character step accepts tokens that represent characters.
    if (type === 'character') {
      const token = getTarget('graphic', id);
      if (token) {
        out.push({ id, obj: token, type: 'graphic' });
      }
    }
  }
  return out;
}

/**
 * Returns true when a run acts with GM authority.
 *
 * @param {object} inst Instance.
 * @returns {boolean} True for GM authority.
 */
function hasGmAuthority(inst) {
  return inst.authority === 'gmService' || isGm(inst.initiatorPlayerId);
}

/**
 * Returns true when any branch of a run is ready to run.
 *
 * @param {object} inst Instance.
 * @returns {boolean} True when one is running.
 */
function anyRunning(inst) {
  return Object.values(inst.branches).some((b) => b.status === 'running');
}

// ---------------------------------------------------------------------------
// Errors, branches and joins
// ---------------------------------------------------------------------------

/**
 * Applies a step's error policy.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} step Failed step.
 * @param {*} err Error.
 * @param {boolean} advanced True when the frame already points past the step.
 * @returns {'next'|'suspend'|'stop'} What the branch does next.
 */
function handleStepError(inst, branch, step, err, advanced) {
  const typed = asTaskError(err);
  const def = defOf(inst);
  const replay = replayClass(step);
  const frame = branch.frames.at(-1);
  timeline(inst, 'error', { stepId: step.id, code: typed.code, reason: typed.reason });
  const journal = Object.values(inst.journal)
    .filter((e) => e.stepId === step.id && e.branchId === branch.id)
    .at(-1);
  if (
    typed.code === ERROR_CODES.UNAUTHORIZED &&
    ['controlLost', 'initiatorGone', 'publicationRevoked'].includes(typed.reason)
  ) {
    enterReview(inst, branch, typed.reason, {
      stepId: step.id,
      indexAdvanced: advanced,
      vars: typed.vars,
    });
    return 'stop';
  }
  if (typed.reason === 'adapterUnavailable') {
    enterReview(inst, branch, 'adapterUnavailable', {
      stepId: step.id,
      indexAdvanced: advanced,
      vars: typed.vars,
    });
    createIncident({
      kind: 'adapter',
      cause: 'adapterUnavailable',
      runId: inst.id,
      definitionId: inst.definitionId,
      evidence: typed.vars.adapter,
    });
    return 'stop';
  }
  if (typed.uncertain && (replay === REPLAY.NON_IDEMPOTENT || replay === REPLAY.ACKNOWLEDGED)) {
    enterReview(inst, branch, 'uncertainOutcome', {
      stepId: step.id,
      indexAdvanced: advanced,
      journalKey: journal ? keyOf(inst, journal) : null,
    });
    return 'stop';
  }
  if (journal && journal.status === 'prepared') {
    journal.status = 'failed';
    journal.error = { code: typed.code, reason: typed.reason };
  }
  const policy = step.onError || def?.policy?.onError || 'fail';
  const retry =
    step.retry ||
    def?.policy?.retry ||
    (policy === 'retry' ? { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 30000 } : null);
  const attempt = branch.attempts[step.id] || 1;
  if (
    retry &&
    (policy === 'retry' || step.retry) &&
    typed.transient &&
    attempt < retry.maxAttempts
  ) {
    const base = retry.baseDelayMs ?? 1000;
    const delay =
      Math.min(base * 2 ** (attempt - 1), retry.maxDelayMs ?? 30000) +
      Math.floor(Math.random() * (retry.jitterMs ?? 0));
    branch.attempts[step.id] = attempt + 1;
    if (advanced && frame) {
      frame.index -= 1;
    }
    branch.gen += 1;
    branch.wait = {
      kind: 'retry',
      dueAt: now() + Math.max(delay, 10),
      stepId: step.id,
      attempt: attempt + 1,
    };
    branch.status = 'waiting';
    timeline(inst, 'retry', { stepId: step.id, attempt: attempt + 1 });
    scheduleBranch(inst, branch, branch.wait.dueAt, JOB.RETRY);
    touch(inst);
    return 'suspend';
  }
  delete branch.attempts[step.id];
  if (policy === 'skip') {
    timeline(inst, 'skip', { stepId: step.id });
    if (journal && journal.status === 'failed') {
      journal.status = 'skipped';
    }
    if (advanced) {
      return 'next-advanced';
    }
    return 'next';
  }
  if (policy === 'review') {
    enterReview(inst, branch, 'stepError', {
      stepId: step.id,
      indexAdvanced: advanced,
      vars: { code: typed.code, reason: typed.reason },
    });
    return 'stop';
  }
  failBranch(inst, branch, errorRecord(typed, step.id));
  return 'stop';
}

/**
 * Returns the journal key of an entry.
 *
 * @param {object} inst Instance.
 * @param {object} entry Journal entry.
 * @returns {string|null} Key.
 */
function keyOf(inst, entry) {
  return Object.keys(inst.journal).find((k) => inst.journal[k] === entry) || null;
}

/**
 * Marks a branch failed and propagates the failure.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @param {object} error Error record.
 * @returns {void}
 */
function failBranch(inst, branch, error) {
  branch.status = 'failed';
  branch.error = error;
  branch.wait = null;
  branch.gen += 1;
  if (branch.id === 'main') {
    finalize(inst, STATUS.FAILED, error);
    return;
  }
  onSubBranchTerminal(inst, branch);
}

/**
 * Marks a branch completed and propagates.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @returns {void}
 */
function completeBranch(inst, branch) {
  branch.status = 'completed';
  branch.wait = null;
  branch.gen += 1;
  if (branch.id === 'main') {
    finalize(inst, STATUS.COMPLETED, null);
    return;
  }
  onSubBranchTerminal(inst, branch);
}

/**
 * Re-evaluates a parallel join after one of its branches finished.
 *
 * @param {object} inst Instance.
 * @param {object} branch Finished sub-branch.
 * @returns {void}
 */
function onSubBranchTerminal(inst, branch) {
  const parent = inst.branches[branch.parentId];
  const wait = parent?.wait;
  if (
    !parent ||
    wait?.kind !== 'join' ||
    !wait.children.includes(branch.id) ||
    TERMINAL_STATUSES.has(inst.status)
  ) {
    return;
  }
  const children = wait.children.map((id) => inst.branches[id]);
  const finished = children.filter((b) => ['completed', 'failed', 'cancelled'].includes(b.status));
  const succeeded = children.filter((b) => b.status === 'completed');
  let decided = null;
  if (wait.join === 'all') {
    if (finished.length === children.length) {
      const failed = children.find((b) => b.status === 'failed');
      decided = failed ? { ok: false, error: failed.error } : { ok: true };
    }
  } else if (wait.join === 'anySuccess') {
    if (succeeded.length) {
      decided = { ok: true, winner: succeeded[0].id };
    } else if (finished.length === children.length) {
      decided = {
        ok: false,
        error:
          children.find((b) => b.error)?.error ||
          errorRecord(taskError(ERROR_CODES.INTERNAL, 'allBranchesFailed', {})),
      };
    }
  } else if (wait.join === 'race') {
    decided =
      branch.status === 'completed'
        ? { ok: true, winner: branch.id }
        : { ok: false, error: branch.error };
  }
  if (!decided) {
    touch(inst);
    return;
  }
  if (wait.join !== 'all' && wait.cancelLosers) {
    for (const child of children) {
      if (child.status === 'running' || child.status === 'waiting') {
        cancelBranch(inst, child);
      }
    }
  }
  const step = getCompiled(inst.definitionId, inst.definitionRevision).steps.get(wait.stepId).step;
  const results = {};
  for (const child of children) {
    results[child.label] = {
      status: child.status,
      vars: child.status === 'completed' ? child.variables : null,
    };
  }
  parent.variables[step.saveAs || step.id] = clone(results);
  for (const rule of step.merge || []) {
    parent.variables[rule.name] = reduceMerge(rule, results);
  }
  timeline(inst, 'join', { stepId: step.id, ok: decided.ok, winner: decided.winner });
  parent.wait = null;
  parent.gen += 1;
  if (!decided.ok) {
    parent.status = 'running';
    failBranch(
      inst,
      parent,
      decided.error || errorRecord(taskError(ERROR_CODES.INTERNAL, 'branchFailed', {}))
    );
    return;
  }
  parent.status = 'running';
  inst.status = STATUS.RUNNING;
  scheduleBranch(inst, parent, now());
  touch(inst);
}

/**
 * Applies an explicit merge reducer to branch results.
 *
 * @param {object} rule {name, from?, var?, reducer}.
 * @param {object} results Branch results by branch ID.
 * @returns {*} Merged value.
 */
function reduceMerge(rule, results) {
  const source = rule.var || rule.name;
  const values = Object.entries(results)
    .filter(([id, r]) => r.status === 'completed' && (!rule.from || rule.from.includes(id)))
    .map(([, r]) => r.vars?.[source])
    .filter((v) => v !== undefined && v !== null);
  const numbers = values.filter((v) => typeof v === 'number');
  switch (rule.reducer) {
    case 'sum':
      return numbers.reduce((a, b) => a + b, 0);
    case 'min':
      return numbers.length ? Math.min(...numbers) : null;
    case 'max':
      return numbers.length ? Math.max(...numbers) : null;
    case 'first':
      return values[0] ?? null;
    case 'last':
      return values.at(-1) ?? null;
    case 'count':
      return values.length;
    case 'all':
      return values.length > 0 && values.every(Boolean);
    case 'any':
      return values.some(Boolean);
    default:
      return null;
  }
}

/**
 * Cancels one branch (a parallel loser).
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch.
 * @returns {void}
 */
function cancelBranch(inst, branch) {
  if (branch.wait?.kind === 'child') {
    cancelRun(branch.wait.childId, null, 'branchCancelled');
  }
  for (const child of Object.values(inst.branches)) {
    if (
      child.parentId === branch.id &&
      (child.status === 'running' || child.status === 'waiting')
    ) {
      cancelBranch(inst, child);
    }
  }
  branch.status = 'cancelled';
  branch.wait = null;
  branch.gen += 1;
  runtime.scheduler?.cancelKey(`run:${inst.id}:${branch.id}`);
  runtime.scheduler?.cancelKey(`await:${inst.id}:${branch.id}`);
  runtime.scheduler?.cancelKey(`async:${inst.id}:${branch.id}`);
}

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------

/**
 * Tells a parent that an owned child finished.
 *
 * @param {object} child Child instance.
 * @returns {void}
 */
function notifyParent(child) {
  if (!child.parentId || !child.owned) {
    return;
  }
  const parent = getInstance(child.parentId);
  const branch = parent?.branches[child.parentBranchId];
  if (
    !branch ||
    branch.wait?.kind !== 'child' ||
    branch.wait.childId !== child.id ||
    TERMINAL_STATUSES.has(parent.status)
  ) {
    return;
  }
  branch.wait.completion = {
    status: child.status,
    error: child.error,
    vars: clone(child.branches.main?.variables || {}),
  };
  if (parent.status === STATUS.PAUSED || parent.status === STATUS.REVIEW) {
    return;
  }
  scheduleBranch(parent, branch, now());
}

/**
 * Applies a child's outcome to the waiting parent branch.
 *
 * @param {object} inst Parent instance.
 * @param {object} branch Parent branch.
 * @param {object} wait Child wait.
 * @returns {boolean} True when the branch continues.
 */
function finishChildWait(inst, branch, wait) {
  const done = wait.completion;
  branch.variables[wait.saveAs] = { runId: wait.childId, status: done.status, vars: done.vars };
  timeline(inst, 'childDone', { stepId: wait.stepId, child: wait.childId, status: done.status });
  if (done.status !== STATUS.COMPLETED && wait.onChildFail !== 'continue') {
    const step = getCompiled(inst.definitionId, inst.definitionRevision).steps.get(
      wait.stepId
    ).step;
    const err = taskError(
      ERROR_CODES.INTERNAL,
      'childFailed',
      { child: wait.childId, status: done.status },
      { transient: false }
    );
    return handleStepError(inst, branch, step, err, true) === 'next-advanced';
  }
  return true;
}

// ---------------------------------------------------------------------------
// Pause, resume, cancel, review
// ---------------------------------------------------------------------------

/**
 * Freezes a run's waits: relative waits keep their remaining time, event
 * waits stop listening.
 *
 * @param {object} inst Instance.
 * @returns {void}
 */
function freeze(inst) {
  const at = now();
  for (const branch of Object.values(inst.branches)) {
    const wait = branch.wait;
    if (!wait) {
      continue;
    }
    if ((wait.kind === 'time' && !wait.absolute) || wait.kind === 'retry') {
      wait.remainingMs = Math.max(0, wait.dueAt - at);
    } else if (wait.kind === 'event') {
      wait.remainingMs = Math.max(0, wait.timeoutAt - at);
    }
  }
  inst.generation += 1;
  cancelJobs(inst);
  maybeCall('awaitsChanged');
}

/**
 * Re-creates the jobs of a run from its persisted waits.
 *
 * @param {object} inst Instance.
 * @param {{thaw?: boolean, gapFrom?: number}} [options] Thaw relative waits; note an observation gap.
 * @returns {void}
 */
export function rebuildJobs(inst, { thaw = false, gapFrom } = {}) {
  const at = now();
  for (const branch of Object.values(inst.branches)) {
    const wait = branch.wait;
    if (branch.status === 'running' && !wait) {
      scheduleBranch(inst, branch, at);
      continue;
    }
    if (!wait) {
      continue;
    }
    switch (wait.kind) {
      case 'time':
      case 'retry':
        if (thaw && wait.remainingMs !== undefined && wait.remainingMs !== null) {
          wait.dueAt = at + wait.remainingMs;
        }
        wait.remainingMs = null;
        scheduleBranch(inst, branch, wait.dueAt, wait.kind === 'retry' ? JOB.RETRY : JOB.CONTINUE);
        break;
      case 'yield':
        scheduleBranch(inst, branch, at);
        break;
      case 'event':
        if (thaw && wait.remainingMs !== undefined && wait.remainingMs !== null) {
          wait.timeoutAt = at + wait.remainingMs;
          wait.remainingMs = null;
        }
        if (gapFrom) {
          timeline(inst, 'observationGap', { stepId: wait.stepId, from: gapFrom, to: at });
          wait.gaps = (wait.gaps || 0) + 1;
        }
        schedule({
          kind: JOB.AWAIT_TIMEOUT,
          dueAt: wait.timeoutAt,
          key: `await:${inst.id}:${branch.id}`,
          target: { runId: inst.id, branchId: branch.id, gen: inst.generation, bgen: branch.gen },
        });
        break;
      case 'async':
        if (wait.completion) {
          scheduleBranch(inst, branch, at);
        } else {
          schedule({
            kind: JOB.ASYNC_TIMEOUT,
            dueAt: wait.timeoutAt,
            key: `async:${inst.id}:${branch.id}`,
            target: {
              runId: inst.id,
              branchId: branch.id,
              gen: inst.generation,
              bgen: branch.gen,
              opId: wait.opId,
            },
          });
        }
        break;
      case 'child':
      case 'join':
        if (wait.completion) {
          scheduleBranch(inst, branch, at);
        }
        break;
      default:
        break;
    }
  }
  maybeCall('awaitsChanged');
}

/**
 * Pauses a run and its owned children.
 *
 * @param {string} runId Run ID.
 * @param {string|null} by Player ID.
 * @param {{byParent?: boolean}} [options] Paused by its parent.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function pauseRun(runId, by, { byParent = false } = {}) {
  const inst = getInstance(runId);
  if (!inst) {
    return { ok: false, error: 'runNotFound', vars: { id: runId } };
  }
  if (inst.status !== STATUS.RUNNING && inst.status !== STATUS.WAITING) {
    return { ok: false, error: 'notPausable', vars: { id: runId, status: inst.status } };
  }
  freeze(inst);
  inst.pause = { previous: inst.status, at: now(), by: by || null, byParent };
  inst.status = STATUS.PAUSED;
  timeline(inst, 'pause', { by });
  audit('run.pause', { run: runId, by });
  bump(inst);
  for (const childId of inst.children) {
    const child = getInstance(childId);
    if (child?.owned && (child.status === STATUS.RUNNING || child.status === STATUS.WAITING)) {
      pauseRun(childId, by, { byParent: true });
    }
  }
  touch(inst);
  return { ok: true };
}

/**
 * Resumes a paused run. Relative waits keep their remaining time; event waits
 * listen again and the pause is recorded as an observation gap.
 *
 * @param {string} runId Run ID.
 * @param {string|null} by Player ID.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function resumeRun(runId, by) {
  const inst = getInstance(runId);
  if (!inst) {
    return { ok: false, error: 'runNotFound', vars: { id: runId } };
  }
  if (inst.status !== STATUS.PAUSED) {
    return { ok: false, error: 'notPaused', vars: { id: runId } };
  }
  const gapFrom = inst.pause?.at;
  inst.status = anyRunning(inst) ? STATUS.RUNNING : STATUS.WAITING;
  inst.pause = null;
  inst.generation += 1;
  timeline(inst, 'resume', { by });
  audit('run.resume', { run: runId, by });
  bump(inst);
  rebuildJobs(inst, { thaw: true, gapFrom });
  for (const childId of inst.children) {
    const child = getInstance(childId);
    if (child?.status === STATUS.PAUSED && child.pause?.byParent) {
      resumeRun(childId, by);
    }
  }
  touch(inst);
  return { ok: true };
}

/**
 * Cancels a run, its jobs, its waits and its owned children. Effects already
 * applied stay applied and are listed in the journal.
 *
 * @param {string} runId Run ID.
 * @param {string|null} by Player ID.
 * @param {string} [reason='cancelled'] Reason key.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function cancelRun(runId, by, reason = 'cancelled') {
  const inst = getInstance(runId);
  if (!inst) {
    return { ok: false, error: 'runNotFound', vars: { id: runId } };
  }
  if (!ACTIVE_STATUSES.has(inst.status)) {
    return { ok: false, error: 'notActive', vars: { id: runId, status: inst.status } };
  }
  finalize(inst, STATUS.CANCELLED, {
    code: 'cancelled',
    reason,
    vars: { by: by || '' },
    stepId: null,
  });
  return { ok: true };
}

/**
 * Puts a run into review: nothing advances until a GM decides.
 *
 * @param {object} inst Instance.
 * @param {object} branch Branch that needs the decision.
 * @param {string} reason Reason key.
 * @param {object} detail Step, journal key, index state.
 * @returns {void}
 */
function enterReview(inst, branch, reason, detail) {
  if (inst.status === STATUS.REVIEW) {
    return;
  }
  freeze(inst);
  inst.review = { reason, branchId: branch.id, at: now(), ...detail, previous: inst.status };
  branch.status = 'waiting';
  branch.wait = branch.wait || { kind: 'review', stepId: detail.stepId };
  inst.status = STATUS.REVIEW;
  timeline(inst, 'review', { reason, stepId: detail.stepId });
  audit('run.review', { run: inst.id, reason, step: detail.stepId });
  const incident = createIncident({
    kind: 'review',
    cause: reason,
    runId: inst.id,
    definitionId: inst.definitionId,
    evidence: detail.stepId,
    group: `review:${inst.id}`,
  });
  inst.review.incidentId = incident.id;
  maybeCall('notifyGm', 'review', { id: inst.id, reason, step: detail.stepId || '' });
  bump(inst);
}

/**
 * Applies a GM decision to a run in review.
 *
 * @param {string} runId Run ID.
 * @param {'retry'|'skip'|'complete'|'skipNext'|'cancel'} decision Decision.
 * @param {string} by GM player ID.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function decideReview(runId, decision, by) {
  const inst = getInstance(runId);
  if (!inst || inst.status !== STATUS.REVIEW || !inst.review) {
    return { ok: false, error: 'notInReview', vars: { id: runId } };
  }
  const review = inst.review;
  if (review.incidentId) {
    resolveIncident(review.incidentId, decision, by);
  }
  audit('run.decide', { run: runId, decision, by });
  if (decision === 'cancel') {
    inst.status = review.previous === STATUS.PAUSED ? STATUS.PAUSED : STATUS.RUNNING;
    return cancelRun(runId, by, 'reviewCancelled');
  }
  const branch = inst.branches[review.branchId];
  const frame = branch?.frames.at(-1);
  if (review.journalKey && inst.journal[review.journalKey]) {
    inst.journal[review.journalKey].status =
      decision === 'complete' ? 'confirmed' : decision === 'skip' ? 'skipped' : 'abandoned';
    inst.journal[review.journalKey].decidedBy = by;
  }
  if (branch && frame && review.stepId) {
    if (decision === 'retry' && review.indexAdvanced) {
      frame.index -= 1;
    }
    if ((decision === 'skip' || decision === 'complete') && !review.indexAdvanced) {
      frame.index += 1;
    }
    if (decision === 'skipNext') {
      frame.index += 1;
    }
    if (decision === 'retry') {
      branch.attempts[review.stepId] = (branch.attempts[review.stepId] || 1) + 1;
    }
  }
  if (branch && ['review', 'async', 'time'].includes(branch.wait?.kind) && review.stepId) {
    branch.wait = null;
    branch.status = 'running';
  }
  inst.review = null;
  inst.status = STATUS.RUNNING;
  inst.generation += 1;
  timeline(inst, 'decide', { decision, by });
  rebuildJobs(inst, { thaw: true });
  bump(inst);
  return { ok: true };
}

/**
 * Starts a fresh run linked to an earlier one.
 *
 * @param {string} runId Earlier run ID (instance or history).
 * @param {string} by Player ID.
 * @returns {object} Admission result.
 */
export function rerun(runId, by) {
  const s = getState();
  const source = getInstance(runId) || s.history.find((h) => h.id === runId);
  if (!source) {
    return { ok: false, status: 'rejected', reason: 'runNotFound', vars: { id: runId } };
  }
  if (source.status && ACTIVE_STATUSES.has(source.status)) {
    return { ok: false, status: 'rejected', reason: 'stillActive', vars: { id: runId } };
  }
  return admitRun(source.definitionId, {
    initiatorId: by,
    params: source.params,
    bindings: source.bindings,
    trigger: { type: 'rerun', id: runId },
    rerunOf: runId,
  });
}

/**
 * Finishes a run: terminalises branches, cancels owned children, records
 * history, notifies the parent and frees the queue.
 *
 * @param {object} inst Instance.
 * @param {string} status Terminal status.
 * @param {object|null} error Error record.
 * @returns {void}
 */
export function finalize(inst, status, error) {
  if (TERMINAL_STATUSES.has(inst.status)) {
    return;
  }
  const at = now();
  inst.status = status;
  inst.error = error;
  inst.outcome = status;
  inst.completedAt = at;
  inst.generation += 1;
  inst.revision += 1;
  inst.pause = null;
  cancelJobs(inst, true);
  for (const branch of Object.values(inst.branches)) {
    if (branch.status === 'running' || branch.status === 'waiting') {
      branch.status = status === STATUS.COMPLETED ? 'completed' : 'cancelled';
      branch.wait = null;
    }
  }
  for (const childId of inst.children) {
    const child = getInstance(childId);
    if (child?.owned && ACTIVE_STATUSES.has(child.status)) {
      cancelRun(childId, null, 'parentFinished');
    }
  }
  if (inst.review?.incidentId) {
    resolveIncident(inst.review.incidentId, status, null);
  }
  inst.review = null;
  timeline(inst, 'end', { status, code: error?.code, reason: error?.reason });
  count(status === STATUS.COMPLETED ? 'completed' : 'failed');
  recordHistory({
    id: inst.id,
    definitionId: inst.definitionId,
    revision: inst.definitionRevision,
    name: inst.name,
    status,
    initiator: inst.initiatorPlayerId,
    trigger: inst.trigger?.type,
    createdAt: inst.createdAt,
    completedAt: at,
    durationMs: at - inst.startedAt,
    latenessMs: inst.latenessMs,
    effects: inst.effects,
    error,
    params: inst.params,
    bindings: inst.bindings,
    parentId: inst.parentId,
    rerunOf: inst.rerunOf,
    uncertain: Object.values(inst.journal).filter((e) =>
      ['prepared', 'uncertain', 'dispatched'].includes(e.status)
    ).length,
  });
  audit('run.end', { run: inst.id, status, reason: error?.reason });
  emitTaskEvent(
    inst,
    {
      completed: 'task.completed',
      failed: 'task.failed',
      expired: 'task.failed',
      cancelled: 'task.cancelled',
    }[status]
  );
  maybeCall('awaitsChanged');
  notifyParent(inst);
  maybeCall('runTerminal', inst);
  drainQueue(inst.definitionId);
  pruneTerminal();
  maybeCall('dashboardDirty', 'instances');
}

/**
 * Keeps only the most recent finished runs in full; history keeps summaries.
 *
 * @returns {void}
 */
export function pruneTerminal() {
  const s = getState();
  const terminal = Object.values(s.instances)
    .filter((i) => TERMINAL_STATUSES.has(i.status))
    .sort((a, b) => b.completedAt - a.completedAt);
  for (const inst of terminal.slice(RETAIN_TERMINAL)) {
    // Keep finished children while their parent still runs.
    const parent = inst.parentId ? s.instances[inst.parentId] : null;
    if (parent && ACTIVE_STATUSES.has(parent.status)) {
      continue;
    }
    delete s.instances[inst.id];
  }
}

/**
 * Returns the step a run is on, for the dashboard.
 *
 * @param {object} inst Instance.
 * @returns {string} Step ID, or an empty string.
 */
export function currentStep(inst) {
  const main = inst.branches.main;
  if (!main) {
    return '';
  }
  if (main.wait?.stepId) {
    return main.wait.stepId;
  }
  const frame = main.frames.at(-1);
  if (!frame) {
    return '';
  }
  const compiled = getCompiled(inst.definitionId, inst.definitionRevision);
  return compiled?.blocks.get(frame.block)?.[frame.index]?.id || '';
}

// ---------------------------------------------------------------------------
// Restart recovery (plan §8)
// ---------------------------------------------------------------------------

/**
 * Compares an interrupted action's intended result with the live objects.
 *
 * @param {object} entry Journal entry (prepared or dispatched).
 * @param {object} step Step.
 * @returns {'confirmed'|'notApplied'|'conflict'|'unknown'} Reconciliation.
 */
function reconcileEntry(entry, step) {
  const data = entry.data || {};
  const graphic = (id) => getTarget('graphic', id);
  if (data.resolvedSide) {
    const results = Object.entries(data.resolvedSide).map(([id, side]) => {
      const token = graphic(id);
      return token ? Number(token.get('currentSide')) === side : false;
    });
    return results.every(Boolean) ? 'confirmed' : 'conflict';
  }
  if (step.type === 'attribute.adjust' && data.plan) {
    const field = data.field || 'current';
    const states = Object.values(data.plan).map((p) => {
      const attr = getTarget('attribute', p.attrId);
      const value = Number(attr?.get(field));
      return value === p.new ? 'new' : value === p.old ? 'old' : 'other';
    });
    if (states.every((x) => x === 'new')) {
      return 'confirmed';
    }
    return 'conflict';
  }
  if (step.type === 'token.set' && data.set) {
    // Absolute writes: done if every target already holds the values.
    return 'unknown';
  }
  if (step.type === 'attribute.set' && data.old) {
    return 'unknown';
  }
  return 'unknown';
}

/**
 * Reconciles one run after a restart: interrupted actions follow their
 * replay class, callbacks from the old boot are written off, finished
 * children and joins are re-checked, and jobs are rebuilt.
 *
 * @param {object} inst Instance.
 * @param {{gapFrom: number|null}} context Restart context.
 * @returns {{review: boolean, gap: boolean}} What happened.
 */
export function recoverInstance(inst, { gapFrom }) {
  const outcome = { review: false, gap: false };
  const def = defOf(inst);
  const compiled = getCompiled(inst.definitionId, inst.definitionRevision);
  if (!def || !compiled) {
    finalize(
      inst,
      STATUS.FAILED,
      errorRecord(taskError(ERROR_CODES.VALIDATION, 'revisionMissing', { id: inst.definitionId }))
    );
    return outcome;
  }
  inst.generation += 1;
  if (inst.status === STATUS.PAUSED || inst.status === STATUS.REVIEW) {
    return outcome;
  }
  const restart = def.policy?.restart || 'reconcile';
  if (restart === 'fail') {
    finalize(
      inst,
      STATUS.FAILED,
      errorRecord(taskError(ERROR_CODES.UNCERTAIN, 'restartPolicyFail', {}))
    );
    return outcome;
  }
  // Interrupted synchronous actions.
  for (const [key, entry] of Object.entries(inst.journal)) {
    if (entry.status !== 'prepared') {
      continue;
    }
    const branch = inst.branches[entry.branchId];
    const step = compiled.steps.get(entry.stepId)?.step;
    if (!branch || !step) {
      entry.status = 'abandoned';
      continue;
    }
    const replay = entry.replay;
    if (replay === REPLAY.EPHEMERAL) {
      entry.status = 'skipped';
      continue;
    }
    const verdict = reconcileEntry(entry, step);
    if (verdict === 'confirmed') {
      entry.status = 'confirmed';
      entry.reconciled = true;
      const frame = branch.frames.at(-1);
      if (frame && compiled.blocks.get(frame.block)?.[frame.index]?.id === step.id) {
        frame.index += 1;
      }
      continue;
    }
    if (replay === REPLAY.IDEMPOTENT && verdict !== 'conflict' && !step.expect) {
      // Safe to apply again: the step re-runs with the same absolute values.
      entry.status = 'abandoned';
      continue;
    }
    entry.status = 'uncertain';
    enterReview(inst, branch, verdict === 'conflict' ? 'restartConflict' : 'uncertainOutcome', {
      stepId: step.id,
      journalKey: key,
      indexAdvanced: false,
    });
    outcome.review = true;
    return outcome;
  }
  for (const branch of Object.values(inst.branches)) {
    const wait = branch.wait;
    if (!wait) {
      continue;
    }
    if (wait.kind === 'async' && !wait.completion && wait.bootId !== runtime.bootId) {
      const status = maybeCall('adapterStatus', wait.adapter, wait.action, wait.key);
      if (status?.done) {
        wait.completion = { ok: true, result: compactResult(status.result) };
      } else {
        if (inst.journal[wait.key]) {
          inst.journal[wait.key].status = 'uncertain';
        }
        enterReview(inst, branch, 'uncertainOutcome', {
          stepId: wait.stepId,
          journalKey: wait.key,
          indexAdvanced: true,
        });
        outcome.review = true;
        return outcome;
      }
    }
    if (wait.kind === 'child' && !wait.completion) {
      const child = getInstance(wait.childId);
      if (!child || TERMINAL_STATUSES.has(child.status)) {
        wait.completion = {
          status: child?.status || STATUS.FAILED,
          error: child?.error || null,
          vars: clone(child?.branches.main?.variables || {}),
        };
      }
    }
    if (wait.kind === 'event') {
      outcome.gap = true;
    }
  }
  if (restart === 'review') {
    enterReview(inst, inst.branches.main, 'restartPolicyReview', {
      stepId: currentStep(inst),
      indexAdvanced: false,
    });
    outcome.review = true;
    return outcome;
  }
  rebuildJobs(inst, { gapFrom: outcome.gap ? gapFrom : undefined });
  // Joins whose last branch finished just before the restart.
  for (const branch of Object.values(inst.branches)) {
    if (branch.parentId && ['completed', 'failed', 'cancelled'].includes(branch.status)) {
      onSubBranchTerminal(inst, branch);
    }
  }
  return outcome;
}

/**
 * Registers the executor's job handlers.
 *
 * @returns {void}
 */
export function registerExecutorJobs() {
  onJob(JOB.CONTINUE, onContinueJob);
  onJob(JOB.RETRY, onContinueJob);
  onJob(JOB.AWAIT_TIMEOUT, onAwaitTimeout);
  onJob(JOB.ASYNC_TIMEOUT, onAsyncTimeout);
  onJob(JOB.QUEUE_EXPIRY, onQueueExpiry);
}
