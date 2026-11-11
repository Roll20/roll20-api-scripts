// Bounded audit trail, terminal-run history and missed-work incidents
// (plan §7.2, §9). Limits trim the oldest records; unresolved incident
// counts are aggregated, never dropped.

import { now } from './host.js';
import { maybeCall } from './runtime.js';
import { getLimits, getState, nextId } from './state.js';
import { truncate } from './utils.js';

const MAX_RESOLVED_INCIDENTS = 200;

/**
 * Appends an audit entry.
 *
 * @param {string} kind Entry kind (e.g. `run.start`, `definition.publish`).
 * @param {object} [detail] Short, redacted detail.
 * @returns {void}
 */
export function audit(kind, detail = {}) {
  const s = getState();
  const entry = { at: now(), kind };
  for (const [key, value] of Object.entries(detail)) {
    if (value !== undefined && value !== null) {
      entry[key] = typeof value === 'string' ? truncate(value, 200) : value;
    }
  }
  s.audit.push(entry);
  const max = getLimits().auditEntries;
  if (s.audit.length > max) {
    s.audit.splice(0, s.audit.length - max);
  }
}

/**
 * Records the summary of a finished run and trims history.
 *
 * @param {object} summary Run summary.
 * @returns {void}
 */
export function recordHistory(summary) {
  const s = getState();
  s.history.push(summary);
  const max = getLimits().historyRuns;
  if (s.history.length > max) {
    s.history.splice(0, s.history.length - max);
  }
  maybeCall('dashboardDirty', 'history');
}

/**
 * Bumps a statistics counter.
 *
 * @param {string} key Counter.
 * @param {number} [by=1] Amount.
 * @returns {void}
 */
export function count(key, by = 1) {
  const stats = getState().stats;
  stats[key] = (stats[key] || 0) + by;
}

/**
 * Returns open incidents (open or acknowledged), newest first.
 *
 * @returns {object[]} Incidents.
 */
export function openIncidents() {
  return Object.values(getState().incidents)
    .filter((i) => i.status !== 'resolved')
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Creates a missed-work or review incident, merging it into an open
 * incident of the same group so repeats do not flood the dashboard.
 *
 * @param {object} spec Incident fields.
 * @param {string} spec.kind missed | review | uncertain | gap | security | circuit | adapter | fatal.
 * @param {string} spec.cause Cause key (downtime, pause, concurrency, expiredQueue, …).
 * @param {object} [spec.range] {from, to} epoch range.
 * @param {number} [spec.count] Occurrences affected.
 * @param {string} [spec.group] Merge key; defaults to kind + target + cause.
 * @returns {object} The incident.
 */
export function createIncident(spec) {
  const s = getState();
  const at = now();
  const group =
    spec.group ||
    [spec.kind, spec.scheduleId || spec.runId || spec.definitionId || '', spec.cause].join(':');
  const existing = Object.values(s.incidents).find((i) => i.status === 'open' && i.group === group);
  if (existing) {
    existing.count += spec.count ?? 1;
    if (spec.range) {
      existing.range = {
        from: Math.min(existing.range?.from ?? spec.range.from, spec.range.from),
        to: Math.max(existing.range?.to ?? spec.range.to, spec.range.to),
      };
    }
    existing.updatedAt = at;
    if (spec.proposal) {
      existing.proposal = spec.proposal;
    }
    maybeCall('dashboardDirty', 'incidents');
    return existing;
  }
  const open = Object.values(s.incidents).filter((i) => i.status !== 'resolved');
  if (open.length >= getLimits().openIncidents) {
    return mergeOverflow(spec, at);
  }
  const incident = {
    id: nextId('incident'),
    group,
    kind: spec.kind,
    cause: spec.cause,
    evidence: spec.evidence ? truncate(spec.evidence, 300) : null,
    range: spec.range || null,
    count: spec.count ?? 1,
    definitionId: spec.definitionId || null,
    scheduleId: spec.scheduleId || null,
    runId: spec.runId || null,
    policy: spec.policy || null,
    proposal: spec.proposal || null,
    status: spec.status || 'open',
    createdAt: at,
    updatedAt: at,
    resolution: null,
  };
  s.incidents[incident.id] = incident;
  audit('incident.create', { incident: incident.id, cause: incident.cause, count: incident.count });
  pruneResolved();
  maybeCall('dashboardDirty', 'incidents');
  return incident;
}

/**
 * Folds an incident into the overflow aggregate when the open limit is hit.
 *
 * @param {object} spec Incident fields.
 * @param {number} at Current time.
 * @returns {object} Overflow incident.
 */
function mergeOverflow(spec, at) {
  const s = getState();
  let overflow = Object.values(s.incidents).find(
    (i) => i.group === 'overflow' && i.status === 'open'
  );
  if (!overflow) {
    // Make room by folding the oldest open incident into the new aggregate.
    const oldest = Object.values(s.incidents)
      .filter((i) => i.status === 'open')
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    overflow = {
      id: nextId('incident'),
      group: 'overflow',
      kind: 'missed',
      cause: 'overflow',
      evidence: null,
      range: null,
      count: 0,
      status: 'open',
      createdAt: at,
      updatedAt: at,
      resolution: null,
    };
    if (oldest) {
      overflow.count += oldest.count;
      delete s.incidents[oldest.id];
    }
    s.incidents[overflow.id] = overflow;
  }
  overflow.count += spec.count ?? 1;
  overflow.updatedAt = at;
  return overflow;
}

/**
 * Marks an incident acknowledged. Acknowledging does not run anything.
 *
 * @param {string} id Incident ID.
 * @param {string} by Player ID.
 * @returns {object|null} Incident.
 */
export function acknowledgeIncident(id, by) {
  const incident = getState().incidents[id];
  if (!incident || incident.status === 'resolved') {
    return null;
  }
  incident.status = 'acknowledged';
  incident.updatedAt = now();
  audit('incident.acknowledge', { incident: id, by });
  maybeCall('dashboardDirty', 'incidents');
  return incident;
}

/**
 * Resolves an incident with an audited decision.
 *
 * @param {string} id Incident ID.
 * @param {string} decision What was done.
 * @param {string|null} by Player ID (null for automatic).
 * @returns {object|null} Incident.
 */
export function resolveIncident(id, decision, by) {
  const incident = getState().incidents[id];
  if (!incident || incident.status === 'resolved') {
    return null;
  }
  incident.status = 'resolved';
  incident.resolution = { decision, by: by || null, at: now() };
  incident.updatedAt = now();
  audit('incident.resolve', { incident: id, decision, by });
  pruneResolved();
  maybeCall('dashboardDirty', 'incidents');
  return incident;
}

/**
 * Removes the oldest resolved incidents beyond the retention limit.
 *
 * @returns {void}
 */
function pruneResolved() {
  const s = getState();
  const resolved = Object.values(s.incidents)
    .filter((i) => i.status === 'resolved')
    .sort((a, b) => a.updatedAt - b.updatedAt);
  for (const incident of resolved.slice(0, Math.max(0, resolved.length - MAX_RESOLVED_INCIDENTS))) {
    delete s.incidents[incident.id];
  }
}
