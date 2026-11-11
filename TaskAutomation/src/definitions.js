// Definition service (plan §3, §4): drafts, validation, immutable published
// revisions, enable/disable, clone, import/export and purge. Runs pin a
// revision; editing a definition only affects future runs.

import { ACTIVE_STATUSES, DEFINITION_SCHEMA_VERSION } from './constants.js';
import { audit } from './audit.js';
import { now } from './host.js';
import { call, maybeCall } from './runtime.js';
import { ID_PATTERN, compileDefinition, findCallCycle, validateDefinition } from './schema.js';
import { getLimits, getState } from './state.js';
import { clone, isRecord, slugify } from './utils.js';

const compiledCache = new Map();

/**
 * Returns a new empty definition body.
 *
 * @param {string} id Definition ID.
 * @param {string} name Name.
 * @returns {object} Definition.
 */
export function blankDefinition(id, name) {
  return {
    schemaVersion: DEFINITION_SCHEMA_VERSION,
    id,
    revision: 1,
    name,
    enabled: true,
    description: '',
    parameters: {},
    bindings: {},
    access: { mode: 'gmOnly', authority: 'initiator' },
    triggers: [{ id: 'manual', type: 'manual' }],
    policy: { concurrency: 'skipIfRunning', maxConcurrent: 1, onError: 'fail' },
    steps: [],
  };
}

/**
 * Returns a definition record.
 *
 * @param {string} id Definition ID.
 * @returns {object|null} Record.
 */
export function getRecord(id) {
  return getState().definitions[id] || null;
}

/**
 * Returns definition records, sorted by name.
 *
 * @param {{archived?: boolean}} [options] Include archived records.
 * @returns {object[]} Records.
 */
export function listRecords({ archived = false } = {}) {
  return Object.values(getState().definitions)
    .filter((r) => archived || !r.archived)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns a published revision.
 *
 * @param {string} id Definition ID.
 * @param {number} [revision] Revision (current when omitted).
 * @returns {object|null} Definition snapshot.
 */
export function getSnapshot(id, revision) {
  const record = getRecord(id);
  if (!record) {
    return null;
  }
  const rev = revision ?? record.current;
  return record.revisions[rev] || null;
}

/**
 * Returns the compiled program of a revision, cached in memory.
 *
 * @param {string} id Definition ID.
 * @param {number} revision Revision.
 * @returns {object|null} Compiled program.
 */
export function getCompiled(id, revision) {
  const key = `${id}@${revision}`;
  if (!compiledCache.has(key)) {
    const snap = getSnapshot(id, revision);
    if (!snap) {
      return null;
    }
    compiledCache.set(key, compileDefinition(snap));
  }
  return compiledCache.get(key);
}

/**
 * Returns a free definition ID based on a name.
 *
 * @param {string} name Name.
 * @returns {string} ID.
 */
export function freeId(name) {
  const base = slugify(name) || 'task';
  const defs = getState().definitions;
  if (!defs[base]) {
    return base;
  }
  for (let i = 2; i < 1000; i += 1) {
    const id = `${base.slice(0, 44)}-${i}`;
    if (!defs[id]) {
      return id;
    }
  }
  return `${base.slice(0, 36)}-${now().toString(36)}`;
}

/**
 * Creates a definition record with a draft.
 *
 * @param {object} body Definition body (validated at publish).
 * @param {string} by Player ID.
 * @returns {{ok: boolean, record?: object, error?: string, vars?: object}} Result.
 */
export function createRecord(body, by) {
  const s = getState();
  if (!ID_PATTERN.test(String(body.id ?? ''))) {
    return { ok: false, error: 'badId', vars: { id: String(body.id) } };
  }
  if (s.definitions[body.id]) {
    return { ok: false, error: 'definitionExists', vars: { id: body.id } };
  }
  if (Object.keys(s.definitions).length >= getLimits().definitions) {
    return { ok: false, error: 'tooManyDefinitions', vars: { max: getLimits().definitions } };
  }
  const at = now();
  const record = {
    id: body.id,
    name: String(body.name || body.id),
    rev: 1,
    enabled: body.enabled !== false,
    archived: false,
    disabledReason: null,
    draft: clone(body),
    // True while the draft has changes that are not published.
    draftDirty: true,
    current: 0,
    revisions: {},
    createdAt: at,
    createdBy: by || null,
    updatedAt: at,
    publishedAt: null,
    publishedBy: null,
    pausedSchedules: false,
  };
  s.definitions[record.id] = record;
  audit('definition.create', { definition: record.id, by });
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true, record };
}

/**
 * Checks an expected management revision.
 *
 * @param {object} record Record.
 * @param {number|null|undefined} expected Revision from a link, if any.
 * @returns {boolean} True when it matches or none was given.
 */
export function revisionMatches(record, expected) {
  return expected === undefined || expected === null || record.rev === expected;
}

/**
 * Changes a draft through a function and bumps the management revision.
 *
 * @param {string} id Definition ID.
 * @param {(draft: object) => ({ok: boolean, error?: string, vars?: object}|void)} change Mutator.
 * @param {string} by Player ID.
 * @param {number} [expectedRev] Stale-link guard.
 * @returns {{ok: boolean, record?: object, error?: string, vars?: object}} Result.
 */
export function updateDraft(id, change, by, expectedRev) {
  const record = getRecord(id);
  if (!record) {
    return { ok: false, error: 'definitionNotFound', vars: { id } };
  }
  if (!revisionMatches(record, expectedRev)) {
    return { ok: false, error: 'stale', vars: { id, rev: record.rev } };
  }
  const draft = record.draft ? clone(record.draft) : clone(getSnapshot(id));
  const result = change(draft) || { ok: true };
  if (!result.ok) {
    return result;
  }
  record.draft = draft;
  record.draftDirty = true;
  if (typeof draft.name === 'string' && draft.name.trim()) {
    record.name = draft.name.trim();
  }
  record.rev += 1;
  record.updatedAt = now();
  audit('definition.edit', { definition: id, by });
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true, record };
}

/**
 * Validates the draft (or a given body) including cross-definition checks.
 *
 * @param {object} body Definition body.
 * @returns {{ok: boolean, errors: object[], warnings: object[]}} Result.
 */
export function validateBody(body) {
  const result = validateDefinition(body, { limits: getLimits() });
  const errors = [...result.errors];
  const warnings = [];
  if (result.ok) {
    for (const target of result.calls) {
      if (target !== body.id && !getSnapshot(target)) {
        warnings.push({ path: 'steps', code: 'lateBoundDefinition', vars: { id: target } });
      }
    }
    const recursion = body.policy?.recursion;
    if (!recursion?.allow) {
      const callsOf = (id) => (id === body.id ? result.calls : callsInSnapshot(getSnapshot(id)));
      const cycle = findCallCycle(body.id, callsOf);
      if (cycle) {
        errors.push({ path: 'steps', code: 'callCycle', vars: { cycle: cycle.join(' → ') } });
      }
    } else if (
      !Number.isInteger(recursion.maxDepth) ||
      recursion.maxDepth < 1 ||
      recursion.maxDepth > getLimits().nestingDepth
    ) {
      errors.push({
        path: 'policy.recursion.maxDepth',
        code: 'outOfRange',
        vars: { min: 1, max: getLimits().nestingDepth },
      });
    }
    for (const adapter of adaptersUsed(body)) {
      if (!maybeCall('adapterKnown', adapter)) {
        warnings.push({ path: 'steps', code: 'adapterUnknown', vars: { adapter } });
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

/**
 * Lists the definitions a snapshot calls or starts.
 *
 * @param {object|null} snap Definition snapshot.
 * @returns {string[]} IDs.
 */
function callsInSnapshot(snap) {
  if (!snap) {
    return [];
  }
  const out = [];
  walkSteps(snap.steps, (step) => {
    if (step.type === 'call' || step.type === 'task.start') {
      out.push(step.definition);
    }
  });
  return out;
}

/**
 * Lists the adapters a definition calls.
 *
 * @param {object} body Definition.
 * @returns {string[]} Adapter names.
 */
export function adaptersUsed(body) {
  const out = new Set();
  walkSteps(body.steps || [], (step) => {
    if (step.type === 'integration.call') {
      out.add(step.adapter);
    }
  });
  return [...out];
}

/**
 * Visits every step in nested blocks.
 *
 * @param {object[]} steps Steps.
 * @param {(step: object) => void} visit Visitor.
 * @returns {void}
 */
export function walkSteps(steps, visit) {
  for (const step of Array.isArray(steps) ? steps : []) {
    if (!isRecord(step)) {
      continue;
    }
    visit(step);
    for (const key of ['steps', 'then', 'else']) {
      if (Array.isArray(step[key])) {
        walkSteps(step[key], visit);
      }
    }
    if (Array.isArray(step.branches)) {
      for (const branch of step.branches) {
        walkSteps(branch?.steps, visit);
      }
    }
  }
}

/**
 * Publishes the draft as a new immutable revision.
 *
 * @param {string} id Definition ID.
 * @param {string} by Player ID of the GM publishing.
 * @param {number} [expectedRev] Stale-link guard.
 * @returns {{ok: boolean, record?: object, revision?: number, errors?: object[], warnings?: object[], error?: string, vars?: object}}
 *          Result.
 */
export function publish(id, by, expectedRev) {
  const record = getRecord(id);
  if (!record) {
    return { ok: false, error: 'definitionNotFound', vars: { id } };
  }
  if (!revisionMatches(record, expectedRev)) {
    return { ok: false, error: 'stale', vars: { id, rev: record.rev } };
  }
  if (!record.draft) {
    return { ok: false, error: 'nothingToPublish', vars: { id } };
  }
  const body = clone(record.draft);
  body.id = id;
  body.revision = record.current + 1;
  const check = validateBody(body);
  if (!check.ok) {
    return {
      ok: false,
      error: 'invalidDefinition',
      errors: check.errors,
      warnings: check.warnings,
    };
  }
  record.revisions[body.revision] = body;
  record.current = body.revision;
  record.draft = clone(body);
  record.draft.revision = body.revision + 1;
  record.draftDirty = false;
  record.name = body.name;
  record.rev += 1;
  record.publishedAt = now();
  record.publishedBy = by || null;
  if (record.disabledReason === 'adapter') {
    record.disabledReason = null;
  }
  pruneRevisions(id);
  audit('definition.publish', { definition: id, revision: body.revision, by });
  maybeCall('definitionChanged', id);
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true, record, revision: body.revision, warnings: check.warnings };
}

/**
 * Enables or disables new runs of a definition. Existing runs carry on.
 *
 * @param {string} id Definition ID.
 * @param {boolean} enabled New value.
 * @param {string|null} by Player ID (null for automatic changes).
 * @param {object} [options] Options.
 * @param {number} [options.expectedRev] Stale-link guard.
 * @param {string} [options.reason] Why (circuit, adapter, gm).
 * @returns {{ok: boolean, record?: object, error?: string, vars?: object}} Result.
 */
export function setEnabled(id, enabled, by, { expectedRev, reason = 'gm' } = {}) {
  const record = getRecord(id);
  if (!record) {
    return { ok: false, error: 'definitionNotFound', vars: { id } };
  }
  if (!revisionMatches(record, expectedRev)) {
    return { ok: false, error: 'stale', vars: { id, rev: record.rev } };
  }
  if (enabled && !record.current) {
    return { ok: false, error: 'notPublished', vars: { id } };
  }
  record.enabled = enabled;
  record.disabledReason = enabled ? null : reason;
  record.rev += 1;
  record.updatedAt = now();
  audit(enabled ? 'definition.enable' : 'definition.disable', {
    definition: id,
    by,
    reason: enabled ? null : reason,
  });
  maybeCall('definitionChanged', id);
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true, record };
}

/**
 * Copies a definition (its draft or current revision) under a new ID.
 *
 * @param {string} id Source ID.
 * @param {string} name New name.
 * @param {string} by Player ID.
 * @param {string} [newId] New ID (derived from the name when omitted).
 * @returns {{ok: boolean, record?: object, error?: string, vars?: object}} Result.
 */
export function cloneRecord(id, name, by, newId) {
  const record = getRecord(id);
  if (!record) {
    return { ok: false, error: 'definitionNotFound', vars: { id } };
  }
  const body = clone(record.draft || getSnapshot(id));
  body.id = newId || freeId(name);
  body.name = name;
  body.revision = 1;
  return createRecord(body, by);
}

/**
 * Returns the revisions of a definition that runs or queues still use.
 *
 * @param {string} id Definition ID.
 * @returns {Set<number>} Revisions.
 */
export function referencedRevisions(id) {
  const s = getState();
  const revs = new Set();
  for (const inst of Object.values(s.instances)) {
    if (inst.definitionId === id) {
      revs.add(inst.definitionRevision);
    }
  }
  for (const entry of s.queues[id] || []) {
    revs.add(entry.revision);
  }
  return revs;
}

/**
 * Removes revisions no run, queue entry or the current pointer needs.
 *
 * @param {string} id Definition ID.
 * @returns {void}
 */
export function pruneRevisions(id) {
  const record = getRecord(id);
  if (!record) {
    return;
  }
  const keep = referencedRevisions(id);
  keep.add(record.current);
  for (const rev of Object.keys(record.revisions).map(Number)) {
    if (!keep.has(rev)) {
      delete record.revisions[rev];
      compiledCache.delete(`${id}@${rev}`);
    }
  }
}

/**
 * Lists what still depends on a definition (blocks a purge).
 *
 * @param {string} id Definition ID.
 * @returns {{runs: number, queued: number, schedules: number, callers: string[]}} Dependencies.
 */
export function dependencies(id) {
  const s = getState();
  const runs = Object.values(s.instances).filter(
    (i) => i.definitionId === id && ACTIVE_STATUSES.has(i.status)
  ).length;
  const queued = (s.queues[id] || []).length;
  const schedules = Object.values(s.schedules).filter(
    (sc) => sc.definitionId === id && !sc.ended
  ).length;
  const callers = Object.values(s.definitions)
    .filter((r) => r.id !== id && callsInSnapshot(getSnapshot(r.id)).includes(id))
    .map((r) => r.id);
  return { runs, queued, schedules, callers };
}

/**
 * Archives a definition: disabled and hidden, kept while referenced.
 *
 * @param {string} id Definition ID.
 * @param {string} by Player ID.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function archiveRecord(id, by) {
  const record = getRecord(id);
  if (!record) {
    return { ok: false, error: 'definitionNotFound', vars: { id } };
  }
  record.archived = true;
  record.enabled = false;
  record.disabledReason = 'archived';
  record.rev += 1;
  audit('definition.archive', { definition: id, by });
  maybeCall('definitionChanged', id);
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true };
}

/**
 * Deletes a definition permanently. Refused while anything depends on it.
 *
 * @param {string} id Definition ID.
 * @param {string} by Player ID.
 * @returns {{ok: boolean, error?: string, vars?: object}} Result.
 */
export function purgeRecord(id, by) {
  const record = getRecord(id);
  if (!record) {
    return { ok: false, error: 'definitionNotFound', vars: { id } };
  }
  const deps = dependencies(id);
  if (deps.runs || deps.queued || deps.callers.length) {
    return {
      ok: false,
      error: 'purgeBlocked',
      vars: { runs: deps.runs, queued: deps.queued, callers: deps.callers.join(', ') || '—' },
    };
  }
  const s = getState();
  for (const sc of Object.values(s.schedules)) {
    if (sc.definitionId === id) {
      call('removeSchedule', sc.id, by);
    }
  }
  for (const key of Object.keys(s.triggerState)) {
    if (key.startsWith(`${id}/`)) {
      delete s.triggerState[key];
    }
  }
  for (const inst of Object.values(s.instances)) {
    if (inst.definitionId === id) {
      delete s.instances[inst.id];
    }
  }
  delete s.definitions[id];
  for (const key of [...compiledCache.keys()]) {
    if (key.startsWith(`${id}@`)) {
      compiledCache.delete(key);
    }
  }
  audit('definition.purge', { definition: id, by });
  maybeCall('definitionChanged', id);
  maybeCall('dashboardDirty', 'definitions');
  return { ok: true };
}

/**
 * Imports a complete definition as a new record or a new revision.
 *
 * @param {object} body Definition JSON (untrusted).
 * @param {string} by Player ID.
 * @param {{replace?: boolean}} [options] Publish over an existing ID.
 * @returns {{ok: boolean, record?: object, revision?: number, errors?: object[], warnings?: object[], error?: string, vars?: object}}
 *          Result.
 */
export function importDefinition(body, by, { replace = false } = {}) {
  const check = validateDefinition(body, { limits: getLimits() });
  if (!check.ok) {
    return { ok: false, error: 'invalidDefinition', errors: check.errors };
  }
  const existing = getRecord(body.id);
  if (existing && !replace) {
    return { ok: false, error: 'definitionExists', vars: { id: body.id } };
  }
  if (!existing) {
    const created = createRecord(body, by);
    if (!created.ok) {
      return created;
    }
  } else {
    existing.draft = clone(body);
    existing.rev += 1;
  }
  const result = publish(body.id, by);
  if (!result.ok) {
    if (!existing) {
      delete getState().definitions[body.id];
    }
    return result;
  }
  if (body.enabled === false) {
    setEnabled(body.id, false, by, { reason: 'gm' });
  }
  audit('definition.import', { definition: body.id, by });
  return result;
}

/**
 * Returns an exportable copy of a definition.
 *
 * @param {string} id Definition ID.
 * @param {{draft?: boolean}} [options] Export the draft instead of the current revision.
 * @returns {object|null} Definition JSON.
 */
export function exportDefinition(id, { draft = false } = {}) {
  const record = getRecord(id);
  if (!record) {
    return null;
  }
  const body = clone(draft && record.draft ? record.draft : getSnapshot(id) || record.draft);
  body.enabled = record.enabled;
  return body;
}

/**
 * Finds the list and index holding a step.
 *
 * @param {object[]} steps Root steps.
 * @param {string} stepId Step ID.
 * @returns {{list: object[], index: number}|null} Location.
 */
export function findStepLocation(steps, stepId) {
  let found = null;
  const search = (list) => {
    if (!Array.isArray(list) || found) {
      return;
    }
    list.forEach((step, index) => {
      if (found || !isRecord(step)) {
        return;
      }
      if (step.id === stepId) {
        found = { list, index };
        return;
      }
      search(step.steps);
      search(step.then);
      search(step.else);
      (step.branches || []).forEach((b) => search(b?.steps));
    });
  };
  search(steps);
  return found;
}

/**
 * Returns the step list addressed by a block key (`root`, `<id>/steps`,
 * `<id>/then`, `<id>/else`, `<id>/branch/<branchId>`).
 *
 * @param {object} draft Definition draft.
 * @param {string} block Block key.
 * @returns {object[]|null} Step list (created when it is an empty then/else).
 */
export function blockList(draft, block) {
  if (!block || block === 'root') {
    return draft.steps;
  }
  const [stepId, kind, branchId] = block.split('/');
  const location = findStepLocation(draft.steps, stepId);
  if (!location) {
    return null;
  }
  const step = location.list[location.index];
  if (kind === 'branch') {
    return (step.branches || []).find((b) => b.id === branchId)?.steps || null;
  }
  if (!['steps', 'then', 'else'].includes(kind)) {
    return null;
  }
  if (!Array.isArray(step[kind]) && (kind === 'then' || kind === 'else') && step.type === 'if') {
    step[kind] = [];
  }
  return Array.isArray(step[kind]) ? step[kind] : null;
}
