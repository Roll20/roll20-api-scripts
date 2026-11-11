// Time schedules (plan §5, §7): one record per time trigger or command-made
// schedule, a persisted cursor and revision, duplicate-safe occurrence keys,
// fixed-rate and fixed-delay intervals, and the overdue policies used after
// downtime or a paused schedule.

import { audit, createIncident, resolveIncident } from './audit.js';
import { JOB } from './constants.js';
import { TIME_TRIGGER_TYPES } from './catalogue.js';
import { getRecord, getSnapshot } from './definitions.js';
import { admitRun } from './executor.js';
import { now } from './host.js';
import { resolveBindings } from './objects.js';
import {
  countBetween,
  listFrom,
  nextAfter,
  nextAtOrAfter,
  normaliseSpec,
  parseClockTime,
} from './recurrence.js';
import { maybeCall, onJob, runtime, schedule } from './runtime.js';
import { durationValue } from './schema.js';
import { getConfig, getLimits, getState, nextId } from './state.js';
import { clone, parseIsoInstant, parseUtcOffset } from './utils.js';

/**
 * Builds a normalised recurrence spec from a definition trigger.
 *
 * @param {object} trigger Time trigger.
 * @param {number} at Current time (default anchor).
 * @returns {{ok: boolean, spec?: object, error?: string}} Result.
 */
export function specFromTrigger(trigger, at) {
  const raw = {};
  if (trigger.start) {
    raw.startAt = parseIsoInstant(trigger.start);
  }
  if (trigger.end) {
    raw.endAt = parseIsoInstant(trigger.end);
  }
  if (trigger.maxCount) {
    raw.maxCount = trigger.maxCount;
  }
  switch (trigger.type) {
    case 'at':
      return normaliseSpec({ kind: 'once', at: parseIsoInstant(trigger.at) }, getLimits());
    case 'interval':
      return normaliseSpec(
        {
          ...raw,
          kind: 'interval',
          everyMs: durationValue(trigger.every),
          anchor: trigger.anchor ? parseIsoInstant(trigger.anchor) : at,
          mode: trigger.mode || 'fixedRate',
        },
        getLimits()
      );
    case 'daily':
    case 'weekly':
      return normaliseSpec(
        {
          ...raw,
          kind: trigger.type,
          timeMs: parseClockTime(trigger.time),
          offsetMinutes: parseUtcOffset(trigger.offset),
          days: trigger.days,
        },
        getLimits()
      );
    default:
      return { ok: false, error: 'badKind' };
  }
}

/**
 * Returns the default overdue policy for a schedule (plan §7.2): one-off
 * times ask the GM when missed by more than the late window; recurring
 * schedules skip and summarise.
 *
 * @param {object} spec Recurrence spec.
 * @returns {object} Overdue policy.
 */
function defaultOverdue(spec) {
  return { mode: spec.kind === 'once' ? 'review' : 'skip' };
}

/**
 * Returns the effective overdue policy of a schedule.
 *
 * @param {object} sched Schedule.
 * @returns {{mode: string, graceMs: number, windowMs: number, catchUp: object}} Policy.
 */
function overdueOf(sched) {
  const def = getSnapshot(sched.definitionId);
  const policy = {
    ...defaultOverdue(sched.spec),
    ...(def?.policy?.overdue || {}),
    ...(sched.overdue || {}),
  };
  return {
    mode: policy.mode,
    graceMs: policy.graceMs ?? getConfig().graceMs,
    maxAgeMs: policy.maxAgeMs ?? null,
    windowMs: policy.windowMs ?? getConfig().lateWindowMs,
    catchUp: {
      max: getLimits().catchUpPerGroup,
      maxAgeMs: 24 * 3600 * 1000,
      spacingMs: 1000,
      ...(policy.catchUp || {}),
    },
  };
}

/**
 * Creates a schedule record and arms its first occurrence.
 *
 * @param {object} options Schedule options.
 * @param {string} options.definitionId Definition ID.
 * @param {object} options.spec Normalised recurrence spec.
 * @param {string|null} [options.triggerId] Definition trigger it comes from.
 * @param {object} [options.overdue] Overdue policy override.
 * @param {object} [options.bindings] Static target IDs per binding.
 * @param {object} [options.params] Parameters.
 * @param {string|null} [options.by] Player ID.
 * @returns {object} Schedule.
 */
export function addSchedule({
  definitionId,
  spec,
  triggerId = null,
  overdue = null,
  bindings = {},
  params = {},
  by = null,
}) {
  const s = getState();
  const at = now();
  const sched = {
    id: nextId('trigger'),
    definitionId,
    triggerId,
    source: triggerId ? 'definition' : 'command',
    spec,
    revision: 1,
    rev: 1,
    paused: false,
    pausedAt: null,
    ended: false,
    overdue,
    bindings: clone(bindings),
    params: clone(params),
    cursor: { nextDueAt: null, lastDueAt: null, count: 0, waitingRun: null },
    createdAt: at,
    createdBy: by,
  };
  sched.cursor.nextDueAt = nextAtOrAfter(spec, at);
  if (sched.cursor.nextDueAt === null) {
    sched.ended = true;
  }
  s.schedules[sched.id] = sched;
  armSchedule(sched);
  audit('schedule.add', { schedule: sched.id, definition: definitionId, by });
  maybeCall('dashboardDirty', 'definitions');
  return sched;
}

/**
 * Arms the scheduler job for a schedule's next occurrence.
 *
 * @param {object} sched Schedule.
 * @returns {void}
 */
export function armSchedule(sched) {
  runtime.scheduler?.cancelKey(`sched:${sched.id}`);
  if (sched.paused || sched.ended || sched.cursor.nextDueAt === null || sched.cursor.waitingRun) {
    return;
  }
  schedule({
    kind: JOB.OCCURRENCE,
    dueAt: sched.cursor.nextDueAt,
    key: `sched:${sched.id}`,
    target: { scheduleId: sched.id, revision: sched.revision, dueAt: sched.cursor.nextDueAt },
  });
}

/**
 * Keeps definition time triggers and schedule records in step after a
 * publish, enable or disable. Changed specs get a new revision, which
 * invalidates occurrences queued for the old one.
 *
 * @param {string} defId Definition ID.
 * @returns {void}
 */
export function syncDefinitionSchedules(defId) {
  const s = getState();
  const record = getRecord(defId);
  const def = record ? getSnapshot(defId) : null;
  const wanted = new Map();
  if (def && record.enabled) {
    for (const trigger of def.triggers || []) {
      if (TIME_TRIGGER_TYPES.has(trigger.type) && trigger.enabled !== false) {
        wanted.set(trigger.id, trigger);
      }
    }
  }
  const existing = Object.values(s.schedules).filter(
    (sc) => sc.definitionId === defId && sc.triggerId
  );
  for (const sched of existing) {
    const trigger = wanted.get(sched.triggerId);
    if (!trigger) {
      removeSchedule(sched.id, null);
      continue;
    }
    wanted.delete(sched.triggerId);
    const built = specFromTrigger(trigger, sched.spec.anchor ?? now());
    if (built.ok && JSON.stringify(built.spec) !== JSON.stringify(sched.spec)) {
      sched.spec = built.spec;
      sched.revision += 1;
      sched.rev += 1;
      sched.cursor.nextDueAt = nextAtOrAfter(sched.spec, now());
      sched.ended = sched.cursor.nextDueAt === null;
      armSchedule(sched);
    }
    sched.overdue = trigger.overdue || null;
  }
  for (const trigger of wanted.values()) {
    const built = specFromTrigger(trigger, now());
    if (built.ok) {
      addSchedule({
        definitionId: defId,
        spec: built.spec,
        triggerId: trigger.id,
        overdue: trigger.overdue || null,
        bindings: staticBindings(def, trigger),
      });
    }
  }
  for (const sched of Object.values(s.schedules).filter(
    (sc) => sc.definitionId === defId && !sc.triggerId
  )) {
    if (!record?.enabled) {
      runtime.scheduler?.cancelKey(`sched:${sched.id}`);
    } else {
      armSchedule(sched);
    }
  }
}

/**
 * Returns explicit IDs a time trigger binds.
 *
 * @param {object} def Definition.
 * @param {object} trigger Trigger.
 * @returns {object} Bindings.
 */
function staticBindings(def, trigger) {
  if (trigger.bind?.binding && Array.isArray(trigger.bind.ids)) {
    return { [trigger.bind.binding]: trigger.bind.ids };
  }
  return {};
}

/**
 * Removes a schedule.
 *
 * @param {string} id Schedule ID.
 * @param {string|null} by Player ID.
 * @returns {boolean} True when removed.
 */
export function removeSchedule(id, by) {
  const s = getState();
  if (!s.schedules[id]) {
    return false;
  }
  runtime.scheduler?.cancelKey(`sched:${id}`);
  delete s.schedules[id];
  audit('schedule.remove', { schedule: id, by });
  maybeCall('dashboardDirty', 'definitions');
  return true;
}

/**
 * Handles a schedule occurrence job.
 *
 * @param {object} job Job.
 * @returns {void}
 */
function onOccurrence(job) {
  const s = getState();
  const sched = s.schedules[job.target.scheduleId];
  if (!sched || sched.revision !== job.target.revision || sched.paused || sched.ended) {
    return;
  }
  if (job.target.catchUp !== undefined) {
    admitOccurrence(sched, job.target.catchUp, { missedCount: 0, catchUp: true });
    return;
  }
  const due = sched.cursor.nextDueAt;
  if (due === null || due !== job.target.dueAt) {
    return;
  }
  const at = now();
  if (due > at) {
    armSchedule(sched);
    return;
  }
  const policy = overdueOf(sched);
  if (at - due <= policy.graceMs) {
    advanceCursor(sched, due);
    admitOccurrence(sched, due, { missedCount: 0 });
    armSchedule(sched);
    return;
  }
  handleOverdue(sched, 'late');
}

/**
 * Moves a schedule's cursor past an occurrence.
 *
 * @param {object} sched Schedule.
 * @param {number} due Occurrence handled.
 * @param {number} [counted=1] Occurrences it accounts for.
 * @returns {void}
 */
function advanceCursor(sched, due, counted = 1) {
  sched.cursor.lastDueAt = due;
  sched.cursor.count += counted;
  if (sched.spec.maxCount && sched.cursor.count >= sched.spec.maxCount) {
    sched.ended = true;
    sched.cursor.nextDueAt = null;
    return;
  }
  if (sched.spec.kind === 'interval' && sched.spec.mode === 'fixedDelay') {
    // The next time is set when this run finishes.
    sched.cursor.nextDueAt = null;
    return;
  }
  sched.cursor.nextDueAt = sched.spec.kind === 'once' ? null : nextAfter(sched.spec, due);
  if (sched.cursor.nextDueAt === null) {
    sched.ended = true;
  }
}

/**
 * Admits the run for one occurrence. The key (schedule, revision, intended
 * time) prevents the same occurrence being admitted twice.
 *
 * @param {object} sched Schedule.
 * @param {number} due Intended time.
 * @param {{missedCount: number, catchUp?: boolean, recovery?: string}} info Occurrence details.
 * @returns {object} Admission result.
 */
export function admitOccurrence(sched, due, info) {
  const key = `${sched.id}:${sched.revision}:${due}`;
  const ledger = sched.cursor.admitted || (sched.cursor.admitted = []);
  if (ledger.includes(key)) {
    return { ok: false, status: 'duplicate' };
  }
  ledger.push(key);
  if (ledger.length > 20) {
    ledger.splice(0, ledger.length - 20);
  }
  const def = getSnapshot(sched.definitionId);
  if (!def) {
    return { ok: false, status: 'rejected', reason: 'definitionNotFound' };
  }
  const resolved = resolveBindings(def, {
    explicit: sched.bindings,
    params: sched.params,
    unattended: true,
  });
  if (!resolved.ok) {
    createIncident({
      kind: 'missed',
      cause: 'bindingFailed',
      scheduleId: sched.id,
      definitionId: sched.definitionId,
      count: 1,
      range: { from: due, to: due },
      evidence: resolved.errors[0]?.code,
    });
    return { ok: false, status: 'rejected', reason: 'bindingFailed' };
  }
  const result = admitRun(sched.definitionId, {
    initiatorId: null,
    params: sched.params,
    bindings: resolved.bindings,
    trigger: { type: 'schedule', id: sched.triggerId || sched.id, scheduleId: sched.id },
    occurrence: {
      key,
      intendedDueAt: due,
      missedCount: info.missedCount,
      recovery: info.recovery || null,
    },
  });
  if (
    result.ok &&
    result.instance &&
    sched.spec.kind === 'interval' &&
    sched.spec.mode === 'fixedDelay'
  ) {
    sched.cursor.waitingRun = result.instance.id;
  }
  if (!result.ok) {
    // Concurrency skips are a different reason from downtime (plan §7.2).
    createIncident({
      kind: 'missed',
      cause: result.status === 'skipped' ? 'concurrency' : result.reason || 'rejected',
      scheduleId: sched.id,
      definitionId: sched.definitionId,
      count: 1,
      range: { from: due, to: due },
      status: result.status === 'skipped' ? 'resolved' : 'open',
    });
  }
  return result;
}

/**
 * Applies the overdue policy to a schedule whose next occurrence has
 * passed by more than the grace period. Missed occurrences are counted
 * arithmetically; only a bounded number are ever admitted.
 *
 * @param {object} sched Schedule.
 * @param {string} cause late | downtime | pause.
 * @returns {{mode: string, missed: number, admitted: number, incident?: object}} Summary.
 */
export function handleOverdue(sched, cause) {
  const at = now();
  const due = sched.cursor.nextDueAt;
  if (due === null || due > at) {
    armSchedule(sched);
    return { mode: 'none', missed: 0, admitted: 0 };
  }
  const policy = overdueOf(sched);
  let missed = countBetween(sched.spec, due, at);
  if (sched.spec.maxCount) {
    missed = Math.min(missed, sched.spec.maxCount - sched.cursor.count);
  }
  const latest = sched.spec.kind === 'once' ? due : listLatest(sched.spec, due, at);
  const summary = { mode: policy.mode, missed, admitted: 0 };
  const range = { from: due, to: at };
  const lateness = at - latest;
  // Within the late window: one representative run, older occurrences summarised.
  if (lateness <= policy.windowMs) {
    finishOverdue(sched, latest, missed);
    admitOccurrence(sched, latest, { missedCount: missed - 1 });
    summary.admitted = 1;
    if (missed > 1) {
      summary.incident = createIncident({
        kind: 'missed',
        cause,
        scheduleId: sched.id,
        definitionId: sched.definitionId,
        count: missed - 1,
        range,
        policy: 'coalesce',
        status: 'resolved',
      });
    }
    armSchedule(sched);
    return summary;
  }
  switch (policy.mode) {
    case 'runOnce':
      if (policy.maxAgeMs !== null && lateness > policy.maxAgeMs) {
        // Too old to be useful: summarise instead of running.
        finishOverdue(sched, latest, missed);
        summary.mode = 'skip';
        summary.incident = createIncident({
          kind: 'missed',
          cause,
          scheduleId: sched.id,
          definitionId: sched.definitionId,
          count: missed,
          range,
          policy: 'runOnce:tooOld',
          proposal: { mode: 'runOnce', occurrence: latest },
        });
        break;
      }
      finishOverdue(sched, latest, missed);
      admitOccurrence(sched, latest, { missedCount: missed, recovery: 'runOnce' });
      summary.admitted = 1;
      summary.incident = createIncident({
        kind: 'missed',
        cause,
        scheduleId: sched.id,
        definitionId: sched.definitionId,
        count: missed,
        range,
        policy: 'runOnce',
        status: 'resolved',
      });
      break;
    case 'catchUpBounded': {
      const eligible = listFrom(
        sched.spec,
        Math.max(due, at - policy.catchUp.maxAgeMs),
        Math.min(policy.catchUp.max, getLimits().catchUpPerGroup),
        at
      );
      finishOverdue(sched, latest, missed);
      eligible.forEach((occurrence, i) => {
        schedule({
          kind: JOB.OCCURRENCE,
          dueAt: at + i * policy.catchUp.spacingMs,
          key: `catchup:${sched.id}:${occurrence}`,
          target: { scheduleId: sched.id, revision: sched.revision, catchUp: occurrence },
        });
      });
      summary.admitted = eligible.length;
      summary.incident = createIncident({
        kind: 'missed',
        cause,
        scheduleId: sched.id,
        definitionId: sched.definitionId,
        count: missed,
        range,
        policy: 'catchUpBounded',
        proposal: { caughtUp: eligible.length, skipped: missed - eligible.length },
        status: 'resolved',
      });
      break;
    }
    case 'review':
      finishOverdue(sched, latest, missed);
      summary.incident = createIncident({
        kind: 'missed',
        cause,
        scheduleId: sched.id,
        definitionId: sched.definitionId,
        count: missed,
        range,
        policy: 'review',
        proposal: { mode: 'runOnce', occurrence: latest },
      });
      maybeCall('notifyGm', 'missed', { id: sched.id, count: missed });
      break;
    case 'expire':
      finishOverdue(sched, latest, missed);
      summary.incident = createIncident({
        kind: 'missed',
        cause,
        scheduleId: sched.id,
        definitionId: sched.definitionId,
        count: missed,
        range,
        policy: 'expire',
        status: 'resolved',
      });
      break;
    default:
      finishOverdue(sched, latest, missed);
      summary.incident = createIncident({
        kind: 'missed',
        cause,
        scheduleId: sched.id,
        definitionId: sched.definitionId,
        count: missed,
        range,
        policy: 'skip',
        proposal: { mode: 'runOnce', occurrence: latest },
      });
      break;
  }
  armSchedule(sched);
  return summary;
}

/**
 * Returns the latest occurrence in a range (falls back to the first).
 *
 * @param {object} spec Recurrence spec.
 * @param {number} from Start.
 * @param {number} to End.
 * @returns {number} Occurrence.
 */
function listLatest(spec, from, to) {
  if (spec.kind === 'interval') {
    return spec.anchor + Math.floor((to - spec.anchor) / spec.everyMs) * spec.everyMs;
  }
  let at = nextAtOrAfter(spec, Math.max(from, to - 8 * 24 * 3600 * 1000));
  let latest = from;
  while (at !== null && at <= to) {
    latest = at;
    at = nextAfter(spec, at);
  }
  return latest;
}

/**
 * Moves the cursor past every missed occurrence to the next future one.
 *
 * @param {object} sched Schedule.
 * @param {number} latest Latest missed occurrence.
 * @param {number} missed Missed count.
 * @returns {void}
 */
function finishOverdue(sched, latest, missed) {
  advanceCursor(sched, latest, Math.max(1, missed));
  if (sched.spec.kind === 'interval' && sched.spec.mode === 'fixedDelay' && !sched.ended) {
    sched.cursor.nextDueAt = null;
  } else if (!sched.ended && sched.cursor.nextDueAt !== null && sched.cursor.nextDueAt <= now()) {
    sched.cursor.nextDueAt = nextAfter(sched.spec, now());
    sched.ended = sched.cursor.nextDueAt === null;
  }
}

/**
 * Pauses a schedule: no admissions; the cursor is kept.
 *
 * @param {string} id Schedule ID.
 * @param {string} by Player ID.
 * @param {number} [expectedRev] Stale-link guard.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function pauseSchedule(id, by, expectedRev) {
  const sched = getState().schedules[id];
  if (!sched) {
    return { ok: false, error: 'scheduleNotFound', vars: { id } };
  }
  if (expectedRev !== undefined && expectedRev !== null && sched.rev !== expectedRev) {
    return { ok: false, error: 'stale', vars: { id, rev: sched.rev } };
  }
  sched.paused = true;
  sched.pausedAt = now();
  sched.rev += 1;
  runtime.scheduler?.cancelKey(`sched:${id}`);
  audit('schedule.pause', { schedule: id, by });
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true };
}

/**
 * Resumes a schedule. `skipPausedRange` (default) jumps to the next future
 * time; `catchUp` applies the schedule's overdue policy to the paused range.
 *
 * @param {string} id Schedule ID.
 * @param {string} by Player ID.
 * @param {'skipPausedRange'|'catchUp'} mode Resume mode.
 * @param {number} [expectedRev] Stale-link guard.
 * @returns {{ok: boolean, skipped?: number, summary?: object, error?: string, vars?: object}} Result.
 */
export function resumeSchedule(id, by, mode = 'skipPausedRange', expectedRev) {
  const sched = getState().schedules[id];
  if (!sched) {
    return { ok: false, error: 'scheduleNotFound', vars: { id } };
  }
  if (expectedRev !== undefined && expectedRev !== null && sched.rev !== expectedRev) {
    return { ok: false, error: 'stale', vars: { id, rev: sched.rev } };
  }
  if (!sched.paused) {
    return { ok: false, error: 'notPaused', vars: { id } };
  }
  sched.paused = false;
  sched.rev += 1;
  const at = now();
  audit('schedule.resume', { schedule: id, by, mode });
  if (mode === 'catchUp') {
    const summary = handleOverdue(sched, 'pause');
    return { ok: true, summary };
  }
  let skipped = 0;
  if (sched.cursor.nextDueAt !== null && sched.cursor.nextDueAt < at) {
    // Times strictly before now were passed while paused; a time due now still runs.
    skipped = countBetween(sched.spec, sched.cursor.nextDueAt, at - 1);
    sched.cursor.count += skipped;
    sched.cursor.nextDueAt = nextAtOrAfter(sched.spec, at);
    sched.ended =
      sched.cursor.nextDueAt === null ||
      Boolean(sched.spec.maxCount && sched.cursor.count >= sched.spec.maxCount);
    if (skipped) {
      createIncident({
        kind: 'missed',
        cause: 'pause',
        scheduleId: id,
        definitionId: sched.definitionId,
        count: skipped,
        range: { from: sched.pausedAt, to: at },
        policy: 'skipPausedRange',
        status: 'resolved',
      });
    }
  }
  sched.pausedAt = null;
  armSchedule(sched);
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true, skipped };
}

/**
 * Previews a new UTC offset for a daily or weekly schedule (for daylight
 * saving changes): the next occurrences before and after.
 *
 * @param {string} id Schedule ID.
 * @param {number} offsetMinutes New offset.
 * @returns {{ok: boolean, before?: number[], after?: number[], error?: string, vars?: object}} Preview.
 */
export function previewOffset(id, offsetMinutes) {
  const sched = getState().schedules[id];
  if (!sched) {
    return { ok: false, error: 'scheduleNotFound', vars: { id } };
  }
  if (sched.spec.kind !== 'daily' && sched.spec.kind !== 'weekly') {
    return { ok: false, error: 'notCalendar', vars: { id } };
  }
  const at = now();
  return {
    ok: true,
    before: listFrom(sched.spec, at, 3),
    after: listFrom({ ...sched.spec, offsetMinutes }, at, 3),
  };
}

/**
 * Applies a new UTC offset to a calendar schedule.
 *
 * @param {string} id Schedule ID.
 * @param {number} offsetMinutes New offset.
 * @param {string} by Player ID.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function applyOffset(id, offsetMinutes, by) {
  const preview = previewOffset(id, offsetMinutes);
  if (!preview.ok) {
    return preview;
  }
  const sched = getState().schedules[id];
  sched.spec = { ...sched.spec, offsetMinutes };
  sched.revision += 1;
  sched.rev += 1;
  sched.cursor.nextDueAt = nextAtOrAfter(sched.spec, now());
  armSchedule(sched);
  audit('schedule.offset', { schedule: id, by, offset: offsetMinutes });
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true };
}

/**
 * Applies a reviewed recovery to a missed-work incident.
 *
 * @param {object} incident Incident.
 * @param {'runOnce'|'skip'} mode Recovery.
 * @param {string} by GM player ID.
 * @returns {{ok: boolean, run?: string, error?: string, vars?: object}} Result.
 */
export function applyRecovery(incident, mode, by) {
  if (mode === 'skip') {
    resolveIncident(incident.id, 'skip', by);
    return { ok: true };
  }
  const sched = getState().schedules[incident.scheduleId];
  const defId = incident.definitionId;
  const occurrence = incident.proposal?.occurrence ?? incident.range?.to ?? now();
  let result;
  if (sched) {
    result = admitOccurrence(sched, occurrence, {
      missedCount: incident.count,
      recovery: 'review',
    });
  } else {
    result = admitRun(defId, {
      initiatorId: null,
      trigger: { type: 'recovery', id: incident.id },
      occurrence: {
        key: `recovery:${incident.id}`,
        intendedDueAt: occurrence,
        missedCount: incident.count,
      },
    });
  }
  if (!result.ok) {
    return {
      ok: false,
      error: 'recoveryRejected',
      vars: { reason: result.reason || result.status },
    };
  }
  resolveIncident(incident.id, 'runOnce', by);
  return { ok: true, run: result.instance?.id };
}

/**
 * Schedules the next fixed-delay occurrence when its run finishes.
 *
 * @param {object} inst Finished instance.
 * @returns {void}
 */
export function onRunTerminal(inst) {
  const schedId = inst.trigger?.scheduleId;
  const sched = schedId ? getState().schedules[schedId] : null;
  if (!sched || sched.cursor.waitingRun !== inst.id) {
    return;
  }
  sched.cursor.waitingRun = null;
  if (!sched.ended) {
    sched.cursor.nextDueAt = Math.max(now(), inst.completedAt) + sched.spec.everyMs;
    if (Number.isFinite(sched.spec.endAt) && sched.cursor.nextDueAt > sched.spec.endAt) {
      sched.ended = true;
      sched.cursor.nextDueAt = null;
    }
  }
  armSchedule(sched);
}

/**
 * Recovers every schedule after a restart: overdue ones apply their policy
 * once; the rest are re-armed.
 *
 * @returns {{schedules: number, missed: number, admitted: number}} Summary.
 */
export function recoverSchedules() {
  const s = getState();
  const totals = { schedules: 0, missed: 0, admitted: 0 };
  const at = now();
  for (const sched of Object.values(s.schedules)) {
    totals.schedules += 1;
    const record = getRecord(sched.definitionId);
    if (!record?.enabled || sched.paused || sched.ended) {
      continue;
    }
    if (sched.cursor.waitingRun && !s.instances[sched.cursor.waitingRun]) {
      sched.cursor.waitingRun = null;
      sched.cursor.nextDueAt = sched.cursor.nextDueAt ?? at;
    }
    if (sched.cursor.nextDueAt !== null && sched.cursor.nextDueAt + overdueOf(sched).graceMs < at) {
      const summary = handleOverdue(sched, 'downtime');
      totals.missed += summary.missed;
      totals.admitted += summary.admitted;
    } else {
      armSchedule(sched);
    }
  }
  return totals;
}

/**
 * Lists schedules, optionally for one definition.
 *
 * @param {string} [defId] Definition ID.
 * @returns {object[]} Schedules.
 */
export function listSchedules(defId) {
  return Object.values(getState().schedules)
    .filter((sc) => !defId || sc.definitionId === defId)
    .sort((a, b) => (a.cursor.nextDueAt ?? Infinity) - (b.cursor.nextDueAt ?? Infinity));
}

/**
 * Registers the schedule job handler.
 *
 * @returns {void}
 */
export function registerScheduleJobs() {
  onJob(JOB.OCCURRENCE, onOccurrence);
}
