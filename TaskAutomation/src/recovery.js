// Startup recovery (plan §8): admissions are held while persisted work is
// reconciled, overdue schedules apply their policies once, observation gaps
// are recorded, and the GM gets at most one concise summary.

import { audit, createIncident } from './audit.js';
import { ACTIVE_STATUSES, JOB, TIMING } from './constants.js';
import { pruneRevisions, listRecords } from './definitions.js';
import { listInstances, recoverInstance } from './executor.js';
import { now } from './host.js';
import { onJob, runtime, schedule } from './runtime.js';
import { recoverSchedules } from './schedules.js';
import { getConfig, getState } from './state.js';
import { pruneConfirmations } from './permissions.js';
import { rebuildTriggerJobs, reconcileBaselines } from './triggers.js';

/**
 * Starts a new boot: records the previous last-observed time, which only
 * estimates when the sandbox stopped.
 *
 * @returns {{bootId: string, gapFrom: number|null, gapMs: number}} Boot info.
 */
export function startBoot() {
  const s = getState();
  const at = now();
  const previous = s.boot || {};
  const bootId = `boot-${(previous.count || 0) + 1}-${at.toString(36)}`;
  s.boot = {
    id: bootId,
    at,
    count: (previous.count || 0) + 1,
    previousId: previous.id || null,
    previousObservedAt: previous.lastObservedAt || null,
    lastObservedAt: at,
  };
  runtime.bootId = bootId;
  runtime.bootAt = at;
  const gapFrom = previous.lastObservedAt || null;
  return { bootId, gapFrom, gapMs: gapFrom ? at - gapFrom : 0 };
}

/**
 * Runs the recovery protocol over persisted runs, queues and schedules.
 *
 * @param {{gapFrom: number|null, gapMs: number}} boot Boot info.
 * @returns {object} Summary for the GM.
 */
export function recoverState(boot) {
  const s = getState();
  const summary = {
    runs: 0,
    review: 0,
    gaps: 0,
    schedules: 0,
    missed: 0,
    admitted: 0,
    reconciled: 0,
    gapMs: boot.gapMs,
  };
  pruneConfirmations();
  for (const inst of listInstances((i) => ACTIVE_STATUSES.has(i.status))) {
    summary.runs += 1;
    const result = recoverInstance(inst, { gapFrom: boot.gapFrom });
    if (result.review) {
      summary.review += 1;
    }
    if (result.gap) {
      summary.gaps += 1;
    }
  }
  if (summary.gaps && boot.gapFrom) {
    // Events while the sandbox was off cannot be replayed; record the gap.
    createIncident({
      kind: 'gap',
      cause: 'observationGap',
      count: summary.gaps,
      range: { from: boot.gapFrom, to: now() },
      group: `gap:${runtime.bootId}`,
    });
  }
  for (const queue of Object.values(s.queues)) {
    for (const entry of queue) {
      if (entry.expiresAt) {
        schedule({
          kind: JOB.QUEUE_EXPIRY,
          dueAt: entry.expiresAt,
          key: `queue:${entry.id}`,
          target: { defId: entry.definitionId, entryId: entry.id },
        });
      }
    }
  }
  for (const record of listRecords({ archived: true })) {
    pruneRevisions(record.id);
  }
  const schedules = recoverSchedules();
  summary.schedules = schedules.schedules;
  summary.missed = schedules.missed;
  summary.admitted = schedules.admitted;
  rebuildTriggerJobs();
  return summary;
}

/**
 * Finishes recovery: releases admissions, then routes reconciled events.
 *
 * @param {object} summary Recovery summary (updated).
 * @returns {void}
 */
export function releaseAdmissions(summary) {
  runtime.admissionsHeld = false;
  summary.reconciled = reconcileBaselines();
  audit('boot', {
    boot: runtime.bootId,
    runs: summary.runs,
    review: summary.review,
    missed: summary.missed,
  });
  armMaintenance();
}

/**
 * Schedules the periodic maintenance job (pruning, size estimate) and the
 * optional health checkpoint. Both use the shared scheduler.
 *
 * @returns {void}
 */
export function armMaintenance() {
  schedule({ kind: JOB.MAINTENANCE, dueAt: now() + TIMING.maintenanceMs, key: 'maintenance' });
  const every = getConfig().checkpointMs;
  if (every > 0) {
    schedule({ kind: JOB.CHECKPOINT, dueAt: now() + every, key: 'checkpoint' });
  }
}

/**
 * Maintenance: prunes confirmations and old revisions. Re-arms itself only
 * while there is persisted work, so an idle game has no timer.
 *
 * @returns {void}
 */
function onMaintenance() {
  pruneConfirmations();
  for (const record of listRecords({ archived: true })) {
    pruneRevisions(record.id);
  }
  const s = getState();
  const busy =
    Object.values(s.instances).some((i) => ACTIVE_STATUSES.has(i.status)) ||
    Object.keys(s.confirmations).length > 0;
  if (busy) {
    schedule({ kind: JOB.MAINTENANCE, dueAt: now() + TIMING.maintenanceMs, key: 'maintenance' });
  }
}

/**
 * Optional coarse checkpoint: refreshes the last-observed time to sharpen
 * outage estimates. It cannot keep the sandbox alive.
 *
 * @returns {void}
 */
function onCheckpoint() {
  getState().boot.lastObservedAt = now();
  const every = getConfig().checkpointMs;
  if (every > 0) {
    schedule({ kind: JOB.CHECKPOINT, dueAt: now() + every, key: 'checkpoint' });
  }
}

/**
 * Registers recovery job handlers.
 *
 * @returns {void}
 */
export function registerRecoveryJobs() {
  onJob(JOB.MAINTENANCE, onMaintenance);
  onJob(JOB.CHECKPOINT, onCheckpoint);
}

/**
 * Builds the one-line facts of a recovery summary for the GM.
 *
 * @param {object} summary Summary.
 * @returns {boolean} True when there is anything worth saying.
 */
export function summaryWorthTelling(summary) {
  return Boolean(
    summary.runs || summary.review || summary.missed || summary.gaps || summary.reconciled
  );
}
