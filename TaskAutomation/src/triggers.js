// Trigger router (plan §6): one set of native subscriptions registered after
// ready, normalised event envelopes, indexed filters, cooldown/debounce/burst
// controls, awaited events, signals, self-echo suppression and opt-in
// offline reconciliation.

import { count, createIncident } from './audit.js';
import { JOB } from './constants.js';
import { getRecord, getSnapshot, listRecords } from './definitions.js';
import { compactEvent, admitRun, deliverEvent, eventWaits } from './executor.js';
import { MISSING, evaluate, truthy } from './expressions.js';
import { campaign, getObject, isGm, logLine, now, onEvent } from './host.js';
import { resolveBindings, snapshot } from './objects.js';
import { diag, onJob, runtime, schedule } from './runtime.js';
import { getConfig, getLimits, getState } from './state.js';
import { clone, isRecord, parseStrictNumber, readPath, toText, truncate } from './utils.js';

const SELF_SENSITIVE = new Set([
  'token',
  'attribute',
  'turn',
  'turnorder',
  'tracker',
  'page',
  'player',
  'chat',
]);

let triggerIndex = null;
let awaitIndex = null;
let eventCounter = 0;
const internalQueue = [];
const recentWrites = new Map();

/**
 * Marks the trigger index stale (definitions changed).
 *
 * @returns {void}
 */
export function definitionsChanged() {
  triggerIndex = null;
}

/**
 * Marks the awaited-event index stale (a run started or stopped waiting).
 *
 * @returns {void}
 */
export function awaitsChanged() {
  awaitIndex = null;
}

/**
 * Builds the index of event, signal and chat triggers by event type.
 *
 * @returns {Map<string, object[]>} Index.
 */
function buildTriggerIndex() {
  const index = new Map();
  for (const record of listRecords()) {
    if (!record.enabled || !record.current) {
      continue;
    }
    const def = getSnapshot(record.id);
    for (const trigger of def?.triggers || []) {
      if (trigger.enabled === false) {
        continue;
      }
      const type =
        trigger.type === 'event'
          ? trigger.event
          : trigger.type === 'signal'
            ? 'signal'
            : trigger.type === 'chat'
              ? 'chat'
              : null;
      if (!type) {
        continue;
      }
      if (!index.has(type)) {
        index.set(type, []);
      }
      index.get(type).push({ defId: record.id, trigger, def });
    }
  }
  return index;
}

/**
 * Builds the index of awaited events by type.
 *
 * @returns {Map<string, object[]>} Index.
 */
function buildAwaitIndex() {
  const index = new Map();
  for (const entry of eventWaits()) {
    const type = entry.wait.event;
    if (!index.has(type)) {
      index.set(type, []);
    }
    index.get(type).push(entry);
  }
  return index;
}

/**
 * Records a write made by this Mod so the matching native event (if Roll20
 * sends one) is not mistaken for a person's change.
 *
 * @param {string} objectId Object ID.
 * @param {object} changes Properties written.
 * @returns {void}
 */
export function noteOwnWrite(objectId, changes) {
  recentWrites.set(objectId, { changes: clone(changes), until: now() + getLimits().echoWindowMs });
}

/**
 * Returns true when a native change only repeats a recent write by this Mod.
 *
 * @param {object} event Normalised native event.
 * @returns {boolean} True for an echo.
 */
function isEcho(event) {
  const entry = recentWrites.get(event.objectId);
  if (!entry) {
    return false;
  }
  if (entry.until < now()) {
    recentWrites.delete(event.objectId);
    return false;
  }
  const changed = event.changed || [];
  return (
    changed.length > 0 &&
    changed.every((prop) => prop in entry.changes && entry.changes[prop] === event.new?.[prop])
  );
}

/**
 * Creates a normalised event envelope.
 *
 * @param {object} fields Event fields.
 * @returns {object} Event.
 */
function envelope(fields) {
  eventCounter += 1;
  return {
    id: `ev-${eventCounter}`,
    observedAt: now(),
    source: 'native',
    actor: null,
    correlation: null,
    objectType: null,
    objectId: null,
    old: null,
    new: null,
    ...fields,
  };
}

/**
 * Lists the properties that differ between two snapshots.
 *
 * @param {object} oldSnap Old snapshot.
 * @param {object} newSnap New snapshot.
 * @returns {string[]} Changed properties.
 */
function changedProps(oldSnap, newSnap) {
  const keys = new Set([...Object.keys(oldSnap || {}), ...Object.keys(newSnap || {})]);
  return [...keys].filter((k) => oldSnap?.[k] !== newSnap?.[k]);
}

// ---------------------------------------------------------------------------
// Native handlers
// ---------------------------------------------------------------------------

/**
 * Normalises and routes a token change.
 *
 * @param {object} obj Roll20 graphic.
 * @param {object} prev Previous values.
 * @returns {void}
 */
function onGraphicChange(obj, prev) {
  if (obj.get('_subtype') !== 'token') {
    return;
  }
  const oldSnap = snapshot(prev, 'graphic');
  const newSnap = snapshot(obj, 'graphic');
  const changed = changedProps(oldSnap, newSnap);
  if (!changed.length) {
    return;
  }
  routeEvent(
    envelope({
      type: 'token.change',
      objectType: 'graphic',
      objectId: obj.id,
      pageId: obj.get('_pageid'),
      characterId: toText(obj.get('represents')) || null,
      name: toText(obj.get('name')),
      old: oldSnap,
      new: newSnap,
      changed,
    })
  );
}

/**
 * Routes token creation and removal.
 *
 * @param {string} type token.add or token.destroy.
 * @param {object} obj Roll20 graphic.
 * @returns {void}
 */
function onGraphicLifecycle(type, obj) {
  if (obj.get('_subtype') !== 'token') {
    return;
  }
  const snap = snapshot(obj, 'graphic');
  routeEvent(
    envelope({
      type,
      objectType: 'graphic',
      objectId: obj.id,
      pageId: obj.get('_pageid'),
      characterId: toText(obj.get('represents')) || null,
      name: toText(obj.get('name')),
      old: type === 'token.destroy' ? snap : null,
      new: type === 'token.add' ? snap : null,
    })
  );
}

/**
 * Routes attribute events.
 *
 * @param {string} type attribute.add / change / destroy.
 * @param {object} obj Roll20 attribute.
 * @param {object} [prev] Previous values.
 * @returns {void}
 */
function onAttribute(type, obj, prev) {
  const pick = (src) =>
    src ? { current: src.current ?? src.get?.('current'), max: src.max ?? src.get?.('max') } : null;
  const newSnap =
    type === 'attribute.destroy' ? null : { current: obj.get('current'), max: obj.get('max') };
  const oldSnap =
    type === 'attribute.change'
      ? pick(prev)
      : type === 'attribute.destroy'
        ? { current: obj.get('current'), max: obj.get('max') }
        : null;
  const changed = type === 'attribute.change' ? changedProps(oldSnap, newSnap) : [];
  if (type === 'attribute.change' && !changed.length) {
    return;
  }
  routeEvent(
    envelope({
      type,
      objectType: 'attribute',
      objectId: obj.id,
      characterId: obj.get('_characterid'),
      name: toText(obj.get('name')),
      old: oldSnap,
      new: newSnap,
      changed,
    })
  );
}

/**
 * Parses turn order text defensively.
 *
 * @param {*} raw Turn order JSON.
 * @returns {object[]} Entries.
 */
export function parseTurnOrder(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }
  try {
    const parsed = JSON.parse(toText(raw) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

/**
 * Describes a turn order entry.
 *
 * @param {object|undefined} entry Entry.
 * @returns {{tokenId: string|null, custom: string, pr: *}|null} Description.
 */
function turnEntry(entry) {
  if (!entry) {
    return null;
  }
  const id = toText(entry.id);
  return {
    tokenId: id && id !== '-1' ? id : null,
    custom: toText(entry.custom),
    pr: entry.pr ?? null,
  };
}

/**
 * Classifies a turn order change: the current entry changed (a new turn),
 * a new round anchor came up, or the list was only edited.
 *
 * @param {object} c Campaign.
 * @param {object} prev Previous values.
 * @returns {void}
 */
function onTurnOrder(c, prev) {
  const before = parseTurnOrder(prev?.turnorder);
  const after = parseTurnOrder(c.get('turnorder'));
  const oldTurn = turnEntry(before[0]);
  const newTurn = turnEntry(after[0]);
  const key = (t) => (t ? `${t.tokenId}|${t.custom}` : '');
  if (key(oldTurn) !== key(newTurn) && newTurn) {
    const token = newTurn.tokenId ? getObject('graphic', newTurn.tokenId) : null;
    routeEvent(
      envelope({
        type: 'turn.change',
        objectType: newTurn.tokenId ? 'graphic' : null,
        objectId: newTurn.tokenId,
        pageId: token?.get('_pageid') || null,
        characterId: toText(token?.get('represents')) || null,
        name: token ? toText(token.get('name')) : newTurn.custom,
        old: oldTurn,
        new: newTurn,
        value: newTurn.pr,
      })
    );
    const anchor = toText(getConfig().roundAnchor || 'Round').toLowerCase();
    if (!newTurn.tokenId && newTurn.custom.toLowerCase().startsWith(anchor)) {
      routeEvent(
        envelope({
          type: 'turn.round',
          name: newTurn.custom,
          value: newTurn.pr,
          old: oldTurn,
          new: newTurn,
        })
      );
    }
  } else if (JSON.stringify(before) !== JSON.stringify(after)) {
    routeEvent(
      envelope({
        type: 'turnorder.edit',
        value: after.length,
        old: { count: before.length },
        new: { count: after.length },
      })
    );
  }
}

/**
 * Routes the turn tracker opening and closing.
 *
 * @param {object} c Campaign.
 * @param {object} prev Previous values.
 * @returns {void}
 */
function onInitiativePage(c, prev) {
  const wasOpen = Boolean(prev?.initiativepage);
  const isOpen = Boolean(c.get('initiativepage'));
  if (wasOpen !== isOpen) {
    routeEvent(
      envelope({
        type: isOpen ? 'tracker.open' : 'tracker.close',
        pageId: isOpen ? toText(c.get('initiativepage')) : null,
      })
    );
  }
}

/**
 * Routes a change of the player ribbon page.
 *
 * @param {object} c Campaign.
 * @param {object} prev Previous values.
 * @returns {void}
 */
function onPlayerPage(c, prev) {
  const from = toText(prev?.playerpageid);
  const to = toText(c.get('playerpageid'));
  if (from !== to) {
    routeEvent(
      envelope({
        type: 'page.change',
        objectType: 'page',
        objectId: to,
        pageId: to,
        old: { pageid: from },
        new: { pageid: to },
      })
    );
  }
}

/**
 * Routes players coming online or going offline. This is observed presence,
 * not proof that a GM is active.
 *
 * @param {object} player Roll20 player.
 * @returns {void}
 */
function onPlayerOnline(player) {
  const online = Boolean(player.get('_online'));
  routeEvent(
    envelope({
      type: online ? 'player.online' : 'player.offline',
      objectType: 'player',
      objectId: player.id,
      name: toText(player.get('displayname')),
      actor: null,
    })
  );
}

/**
 * Routes ordinary chat to chat triggers. Whispers and rolls are ignored
 * unless the GM enabled private chat triggers; text is kept only when a
 * trigger matches.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
function onChat(msg) {
  if (msg.type === 'api' || msg.playerid === 'API') {
    return;
  }
  const entries = index().get('chat');
  if (!entries?.length) {
    return;
  }
  const isPrivate =
    msg.type === 'whisper' ||
    msg.type === 'gmrollresult' ||
    msg.type === 'rollresult' ||
    msg.target !== undefined;
  for (const entry of entries) {
    const trigger = entry.trigger;
    const channels = trigger.channels || ['general', 'emote', 'desc'];
    if (!channels.includes(msg.type) && !(isPrivate && trigger.private)) {
      continue;
    }
    if (isPrivate && !(trigger.private && getConfig().privateChatTriggers)) {
      continue;
    }
    const text = truncate(toText(msg.content), 500);
    const lower = text.toLowerCase();
    const m = trigger.match;
    const hit =
      (typeof m.equals === 'string' && lower === m.equals.toLowerCase()) ||
      (typeof m.contains === 'string' && lower.includes(m.contains.toLowerCase())) ||
      (typeof m.startsWith === 'string' && lower.startsWith(m.startsWith.toLowerCase()));
    if (hit) {
      handleTrigger(
        entry,
        envelope({ type: 'chat', name: msg.type, value: text, actor: msg.playerid || null })
      );
    }
  }
}

/**
 * Registers the shared native subscriptions once, after ready, so the add
 * events Roll20 replays at startup are not mistaken for new objects.
 *
 * @param {(label: string, fn: Function) => Function} guarded Error wrapper.
 * @returns {void}
 */
export function registerNativeHandlers(guarded) {
  onEvent('change:graphic', guarded('change:graphic', onGraphicChange));
  onEvent(
    'add:graphic',
    guarded('add:graphic', (obj) => onGraphicLifecycle('token.add', obj))
  );
  onEvent(
    'destroy:graphic',
    guarded('destroy:graphic', (obj) => onGraphicLifecycle('token.destroy', obj))
  );
  onEvent(
    'change:attribute',
    guarded('change:attribute', (obj, prev) => onAttribute('attribute.change', obj, prev))
  );
  onEvent(
    'add:attribute',
    guarded('add:attribute', (obj) => onAttribute('attribute.add', obj))
  );
  onEvent(
    'destroy:attribute',
    guarded('destroy:attribute', (obj) => onAttribute('attribute.destroy', obj))
  );
  onEvent('change:campaign:turnorder', guarded('change:campaign:turnorder', onTurnOrder));
  onEvent(
    'change:campaign:initiativepage',
    guarded('change:campaign:initiativepage', onInitiativePage)
  );
  onEvent('change:campaign:playerpageid', guarded('change:campaign:playerpageid', onPlayerPage));
  onEvent('change:player:_online', guarded('change:player:_online', onPlayerOnline));
  onEvent('chat:message', guarded('chat:message', onChat));
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/**
 * Returns the trigger index, rebuilding it when stale.
 *
 * @returns {Map<string, object[]>} Index.
 */
function index() {
  if (!triggerIndex) {
    triggerIndex = buildTriggerIndex();
  }
  return triggerIndex;
}

/**
 * Queues an internal event (a signal from a task, a write by this Mod, a
 * task lifecycle event). Internal events are routed by a scheduler job so a
 * task never re-enters the router while it runs.
 *
 * @param {object} fields Event fields.
 * @returns {void}
 */
export function emitInternal(fields) {
  const depth = fields.correlation?.depth ?? 0;
  if (depth > getLimits().ancestryDepth) {
    count('dropped');
    diag(`internal event dropped (ancestry ${depth}): ${fields.type}`);
    return;
  }
  internalQueue.push(envelope({ ...fields, source: fields.source || 'internal' }));
  if (internalQueue.length > 500) {
    internalQueue.splice(0, internalQueue.length - 500);
    count('dropped');
  }
  schedule({ kind: 'internalEvents', dueAt: now(), key: 'internalEvents' });
}

/**
 * Routes queued internal events in a bounded batch.
 *
 * @returns {void}
 */
function drainInternal() {
  for (const event of internalQueue.splice(0, 50)) {
    routeEvent(event);
  }
  if (internalQueue.length) {
    schedule({ kind: 'internalEvents', dueAt: now() + 10, key: 'internalEvents' });
  }
}

/**
 * Routes one event: first to runs awaiting it, then to triggers.
 *
 * @param {object} event Normalised event.
 * @returns {void}
 */
export function routeEvent(event) {
  if (runtime.disabled || !runtime.ready) {
    return;
  }
  if (event.source === 'native' && isEcho(event)) {
    count('suppressed');
    return;
  }
  updateBaselines(event);
  if (runtime.admissionsHeld) {
    return;
  }
  deliverToAwaits(event);
  for (const entry of index().get(event.type) || []) {
    handleTrigger(entry, event);
  }
}

/**
 * Delivers an event to the first matching awaiting branch of each run.
 *
 * @param {object} event Event.
 * @returns {void}
 */
function deliverToAwaits(event) {
  if (!awaitIndex) {
    awaitIndex = buildAwaitIndex();
  }
  const waits = awaitIndex.get(event.type);
  if (!waits?.length) {
    return;
  }
  for (const entry of [...waits]) {
    if (entry.branch.wait?.kind !== 'event' || entry.branch.wait.event !== event.type) {
      continue;
    }
    if (!allowSource(event, entry.inst.definitionId)) {
      continue;
    }
    if (matchFilter(entry.wait.filter, event, { inst: entry.inst, branch: entry.branch })) {
      deliverEvent(entry.runId, entry.branchId, event);
    }
  }
}

/**
 * Returns true when an event's source may drive a definition. Changes made
 * by tasks themselves only trigger definitions that opt in.
 *
 * @param {object} event Event.
 * @param {string} defId Definition ID.
 * @param {object} [trigger] Trigger.
 * @returns {boolean} True when allowed.
 */
function allowSource(event, defId, trigger) {
  if (event.source !== 'internal') {
    return true;
  }
  if (!SELF_SENSITIVE.has(event.type.split('.')[0])) {
    return true;
  }
  const def = getSnapshot(defId);
  return Boolean(def?.access?.selfTrigger && (trigger ? trigger.selfTrigger : true));
}

/**
 * Tests an event against a filter. Cheap list checks run before the
 * condition expression.
 *
 * @param {object} filter Filter.
 * @param {object} event Event.
 * @param {{inst?: object, branch?: object}} [scope] Run scope for awaits.
 * @returns {boolean} True on a match.
 */
export function matchFilter(filter, event, scope = {}) {
  if (!filter) {
    return true;
  }
  const inList = (list, value) => !Array.isArray(list) || list.includes(value);
  if (!inList(filter.objectIds, event.objectId) || !inList(filter.pageIds, event.pageId)) {
    return false;
  }
  if (!inList(filter.characterIds, event.characterId) || !inList(filter.names, event.name)) {
    return false;
  }
  if (filter.attribute !== undefined && event.name !== filter.attribute) {
    return false;
  }
  if (filter.signal !== undefined && !(event.type === 'signal' && event.name === filter.signal)) {
    return false;
  }
  if (filter.definitionId !== undefined && event.name !== filter.definitionId) {
    return false;
  }
  if (filter.adapter !== undefined && event.adapter !== filter.adapter) {
    return false;
  }
  if (
    Array.isArray(filter.properties) &&
    !(event.changed || []).some((p) => filter.properties.includes(p))
  ) {
    return false;
  }
  for (const [prop, value] of Object.entries(filter.changedTo || {})) {
    if (event.new?.[prop] !== value || event.old?.[prop] === value) {
      return false;
    }
  }
  for (const [prop, value] of Object.entries(filter.changedFrom || {})) {
    if (event.old?.[prop] !== value || event.new?.[prop] === value) {
      return false;
    }
  }
  if (filter.crossing) {
    const { property, direction, threshold } = filter.crossing;
    const before = parseStrictNumber(event.old?.[property]);
    const after = parseStrictNumber(event.new?.[property]);
    if (before === null || after === null) {
      return false;
    }
    // Crossing only: staying below (or above) the threshold does not fire again.
    const crossed =
      direction === 'below'
        ? before > threshold && after <= threshold
        : before < threshold && after >= threshold;
    if (!crossed) {
      return false;
    }
  }
  if (filter.binding !== undefined) {
    const ids = scope.inst?.bindings?.[filter.binding] || [];
    if (!ids.includes(event.objectId) && !ids.includes(event.characterId)) {
      return false;
    }
  }
  if (filter.condition !== undefined) {
    const value = evaluate(filter.condition, {
      resolve: (path) => {
        const parts = path.split('.');
        const root = parts.shift();
        if (root === 'event') {
          return readPath(event, parts);
        }
        if (root === 'now') {
          return { found: true, value: now() };
        }
        if (root === 'param' && scope.inst) {
          return readPath(scope.inst.params, parts);
        }
        if (root === 'var' && scope.branch) {
          return readPath(scope.branch.variables, parts);
        }
        if (root === 'run' && scope.inst && parts[0] === 'id') {
          return { found: true, value: scope.inst.id };
        }
        return { found: false };
      },
    });
    if (value === MISSING || !truthy(value)) {
      return false;
    }
  }
  return true;
}

/**
 * Applies a trigger's filters and rate controls, then admits a run.
 *
 * @param {{defId: string, trigger: object, def: object}} entry Index entry.
 * @param {object} event Event.
 * @returns {void}
 */
function handleTrigger(entry, event) {
  const { defId, trigger } = entry;
  const record = getRecord(defId);
  if (!record?.enabled) {
    return;
  }
  if (!allowSource(event, defId, trigger)) {
    return;
  }
  if (trigger.type === 'signal' && event.name !== trigger.name) {
    return;
  }
  if (
    trigger.type === 'signal' &&
    event.source === 'command' &&
    !isGm(event.actor) &&
    !trigger.players
  ) {
    return;
  }
  if (trigger.type === 'event' && !matchFilter(trigger.filter, event)) {
    return;
  }
  const s = getState();
  const coalesce = trigger.coalesce === 'objectId' && event.objectId ? `:${event.objectId}` : '';
  const key = `${defId}/${trigger.id}${coalesce}`;
  const ts =
    s.triggerState[key] ||
    (s.triggerState[key] = {
      cooldownUntil: 0,
      burst: null,
      debounce: null,
      suppressed: 0,
      dropped: 0,
      fired: 0,
    });
  const at = now();
  // Burst cap: aggregate drops instead of logging each one.
  const burst = trigger.burst || { count: getLimits().burstPerTrigger, windowMs: 10000 };
  if (!ts.burst || at - ts.burst.start > burst.windowMs) {
    ts.burst = { start: at, count: 0 };
  }
  ts.burst.count += 1;
  if (ts.burst.count > burst.count) {
    ts.dropped += 1;
    count('dropped');
    if (ts.burst.count === burst.count + 1) {
      createIncident({
        kind: 'missed',
        cause: 'burstCap',
        definitionId: defId,
        count: 1,
        group: `burst:${key}`,
        range: { from: ts.burst.start, to: at },
      });
    }
    return;
  }
  if (trigger.debounceMs) {
    debounce(key, ts, entry, event, trigger);
    return;
  }
  if (ts.cooldownUntil > at) {
    ts.suppressed += 1;
    count('suppressed');
    return;
  }
  fire(entry, event, ts);
}

/**
 * Applies trailing (or leading-edge) debounce. Only the latest event and a
 * count are kept, persisted with the deadline.
 *
 * @param {string} key Trigger state key.
 * @param {object} ts Trigger state.
 * @param {object} entry Index entry.
 * @param {object} event Event.
 * @param {object} trigger Trigger.
 * @returns {void}
 */
function debounce(key, ts, entry, event, trigger) {
  const at = now();
  const active = ts.debounce && ts.debounce.dueAt > at;
  if (trigger.leading && !active) {
    ts.debounce = {
      dueAt: at + trigger.debounceMs,
      event: null,
      count: 0,
      leading: true,
      defId: entry.defId,
      triggerId: trigger.id,
    };
    fire(entry, event, ts);
  } else {
    const previous = active ? ts.debounce.count : 0;
    ts.debounce = {
      dueAt: at + trigger.debounceMs,
      event: trigger.leading ? null : compactEvent(event),
      count: previous + 1,
      leading: Boolean(trigger.leading),
      defId: entry.defId,
      triggerId: trigger.id,
    };
    count('coalesced');
  }
  schedule({
    kind: JOB.DEBOUNCE,
    dueAt: ts.debounce.dueAt,
    key: `debounce:${key}`,
    target: { key },
  });
}

/**
 * Fires a debounced trigger when its quiet period ends.
 *
 * @param {object} job Job.
 * @returns {void}
 */
function onDebounce(job) {
  const s = getState();
  const ts = s.triggerState[job.target.key];
  const pending = ts?.debounce;
  if (!pending) {
    return;
  }
  if (pending.dueAt > now()) {
    schedule({
      kind: JOB.DEBOUNCE,
      dueAt: pending.dueAt,
      key: `debounce:${job.target.key}`,
      target: job.target,
    });
    return;
  }
  ts.debounce = null;
  if (pending.leading || !pending.event) {
    return;
  }
  const def = getSnapshot(pending.defId);
  const trigger = def?.triggers?.find((t) => t.id === pending.triggerId);
  if (!trigger) {
    return;
  }
  fire({ defId: pending.defId, trigger, def }, { ...pending.event, count: pending.count }, ts);
}

/**
 * Admits a run for a trigger.
 *
 * @param {{defId: string, trigger: object, def: object}} entry Index entry.
 * @param {object} event Event.
 * @param {object} ts Trigger state.
 * @returns {void}
 */
function fire(entry, event, ts) {
  const { defId, trigger, def } = entry;
  const human =
    event.actor && event.actor !== 'API' && getObject('player', event.actor) ? event.actor : null;
  const bindingIds =
    trigger.bind?.from === 'event.characterId' ? event.characterId : event.objectId;
  const explicit = {};
  if (trigger.bind?.binding && bindingIds) {
    explicit[trigger.bind.binding] = [bindingIds];
  }
  const resolved = resolveBindings(def, {
    eventObjectId: bindingIds,
    explicit,
    params: {},
    unattended: !human,
  });
  if (!resolved.ok) {
    ts.suppressed += 1;
    diag(`trigger ${defId}/${trigger.id} bindings failed: ${JSON.stringify(resolved.errors)}`);
    createIncident({
      kind: 'missed',
      cause: 'bindingFailed',
      definitionId: defId,
      count: 1,
      group: `binding:${defId}/${trigger.id}`,
      evidence: resolved.errors[0]?.code,
    });
    return;
  }
  const result = admitRun(defId, {
    initiatorId: def.access?.authority === 'gmService' ? null : human,
    params: {},
    bindings: resolved.bindings,
    event: compactEvent(event),
    trigger: { type: trigger.type, id: trigger.id },
    correlation: { depth: event.correlation?.depth ?? 0 },
  });
  if (result.ok) {
    ts.fired += 1;
    if (trigger.cooldownMs) {
      ts.cooldownUntil = now() + trigger.cooldownMs;
    }
  } else {
    ts.suppressed += 1;
  }
}

/**
 * Raises a signal from an authenticated command or a trusted adapter.
 *
 * @param {string} name Signal name.
 * @param {*} value Scalar value.
 * @param {string|null} actor Real player ID, or null.
 * @param {string} [source='command'] command | adapter | internal.
 * @returns {void}
 */
export function raiseSignal(name, value, actor, source = 'command') {
  const event = envelope({ type: 'signal', name, value: value ?? null, actor, source });
  routeEvent(event);
}

/**
 * Lists the signal names players may raise.
 *
 * @returns {Set<string>} Names.
 */
export function playerSignals() {
  const names = new Set();
  for (const entry of index().get('signal') || []) {
    if (entry.trigger.players) {
      names.add(entry.trigger.name);
    }
  }
  for (const { wait, inst } of eventWaits()) {
    if (
      wait.event === 'signal' &&
      wait.filter?.signal &&
      getSnapshot(inst.definitionId)?.access?.capabilities?.signals
    ) {
      names.add(wait.filter.signal);
    }
  }
  return names;
}

// ---------------------------------------------------------------------------
// Offline reconciliation (opt-in)
// ---------------------------------------------------------------------------

/**
 * Returns the triggers that keep baselines.
 *
 * @returns {object[]} Index entries.
 */
function reconcilingTriggers() {
  const out = [];
  for (const entries of index().values()) {
    for (const entry of entries) {
      if (entry.trigger.reconcile && Array.isArray(entry.trigger.filter?.objectIds)) {
        out.push(entry);
      }
    }
  }
  return out;
}

/**
 * Reads the watched values of an object for a baseline.
 *
 * @param {object} trigger Trigger.
 * @param {string} id Object ID.
 * @returns {object|null} Values.
 */
function baselineValues(trigger, id) {
  const type = trigger.event.startsWith('attribute') ? 'attribute' : 'graphic';
  const obj = getObject(type, id);
  if (!obj) {
    return null;
  }
  const snap =
    type === 'attribute'
      ? { current: obj.get('current'), max: obj.get('max') }
      : snapshot(obj, 'graphic');
  const props = trigger.filter.properties || Object.keys(snap);
  return Object.fromEntries(props.filter((p) => p in snap).map((p) => [p, snap[p]]));
}

/**
 * Keeps baselines current as events are observed.
 *
 * @param {object} event Event.
 * @returns {void}
 */
function updateBaselines(event) {
  if (!event.objectId || event.source === 'reconciled') {
    return;
  }
  const s = getState();
  for (const entry of reconcilingTriggers()) {
    if (entry.trigger.filter.objectIds.includes(event.objectId)) {
      const key = `${entry.defId}/${entry.trigger.id}`;
      s.baselines[key] = s.baselines[key] || {};
      s.baselines[key][event.objectId] = baselineValues(entry.trigger, event.objectId);
    }
  }
}

/**
 * After a restart, compares watched objects with their saved baselines and
 * routes a `reconciled` event for each difference. Intermediate values and
 * crossings while the sandbox was off cannot be known.
 *
 * @returns {number} Reconciled events routed.
 */
export function reconcileBaselines() {
  const s = getState();
  let routed = 0;
  for (const entry of reconcilingTriggers()) {
    const key = `${entry.defId}/${entry.trigger.id}`;
    const saved = s.baselines[key] || {};
    for (const id of entry.trigger.filter.objectIds) {
      const current = baselineValues(entry.trigger, id);
      if (saved[id] && current && JSON.stringify(saved[id]) !== JSON.stringify(current)) {
        const event = envelope({
          type: entry.trigger.event,
          source: 'reconciled',
          objectId: id,
          old: saved[id],
          new: current,
          changed: changedProps(saved[id], current),
        });
        handleTrigger(entry, event);
        routed += 1;
      }
      s.baselines[key] = s.baselines[key] || {};
      s.baselines[key][id] = current;
    }
  }
  return routed;
}

/**
 * Remembers the current turn order so the first change after a restart is
 * compared with what was there before.
 *
 * @returns {void}
 */
export function snapshotCampaign() {
  try {
    getState().notices.turnorder = toText(campaign().get('turnorder'));
  } catch (err) {
    logLine(`could not read the turn order: ${err?.message || err}`);
  }
}

/**
 * Registers the router's job handlers.
 *
 * @returns {void}
 */
export function registerTriggerJobs() {
  onJob(JOB.DEBOUNCE, onDebounce);
  onJob('internalEvents', drainInternal);
}

/**
 * Re-creates debounce jobs from persisted trigger state after a restart.
 *
 * @returns {void}
 */
export function rebuildTriggerJobs() {
  const s = getState();
  for (const [key, ts] of Object.entries(s.triggerState)) {
    if (ts.debounce) {
      schedule({
        kind: JOB.DEBOUNCE,
        dueAt: ts.debounce.dueAt,
        key: `debounce:${key}`,
        target: { key },
      });
    }
  }
}
