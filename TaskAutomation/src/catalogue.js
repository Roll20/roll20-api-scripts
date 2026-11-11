// Declarative description of every step type: its fields, replay class and
// who may use it (plan §4.4). The executor (actions.js) supplies behaviour;
// the validator (schema.js) uses these specs. Pure: no Roll20 globals.

import { REPLAY } from './constants.js';

// Field kinds:
//   expr      a safe expression (expressions.js)
//   template  text with {{placeholders}}
//   string    literal text
//   id        literal identifier text
//   number    literal finite number
//   integer   literal whole number
//   boolean   literal true/false
//   enum      one of `values`
//   target    {binding} | {ids: [...]} | {ref}
//   exprMap   object of name -> expression
//   recipients {gm: true} | {players: [...]} | {binding} | {controllers: binding}
//   point     {left, top, page} expressions
//   steps     a nested block
//   any       plain data checked by the action itself

/**
 * Builds a field spec.
 *
 * @param {string} kind Field kind.
 * @param {object} [extra] Extra options (required, values, min, max, default).
 * @returns {object} Field spec.
 */
const f = (kind, extra = {}) => ({ kind, ...extra });

const COMMON = {
  id: f('id', { required: true }),
  type: f('string', { required: true }),
  name: f('string'),
  onError: f('enum', { values: ['fail', 'skip', 'retry', 'review'] }),
  retry: f('any'),
  timeoutMs: f('integer', { min: 100 }),
  saveAs: f('id'),
};

export const STEP_SPECS = {
  // ---- Flow ---------------------------------------------------------------
  wait: {
    flow: true,
    replay: REPLAY.INTERNAL,
    fields: {
      durationMs: f('expr'),
      until: f('expr'),
      overdue: f('enum', { values: ['continue', 'review', 'expire', 'skipNext'] }),
    },
  },
  awaitEvent: {
    flow: true,
    replay: REPLAY.INTERNAL,
    fields: {
      event: f('string', { required: true }),
      filter: f('any'),
      timeoutMs: f('integer', { required: true, min: 100 }),
    },
  },
  if: {
    flow: true,
    replay: REPLAY.PURE,
    fields: { condition: f('expr', { required: true }), then: f('steps'), else: f('steps') },
  },
  loop: {
    flow: true,
    replay: REPLAY.INTERNAL,
    fields: {
      mode: f('enum', { required: true, values: ['count', 'while', 'until', 'forever'] }),
      count: f('expr'),
      condition: f('expr'),
      maxIterations: f('integer', { min: 1 }),
      steps: f('steps', { required: true }),
    },
  },
  call: {
    flow: true,
    replay: REPLAY.INTERNAL,
    fields: {
      definition: f('id', { required: true }),
      revision: f('integer', { min: 1 }),
      await: f('boolean'),
      params: f('exprMap'),
      bindings: f('any'),
      onChildFail: f('enum', { values: ['fail', 'continue'] }),
    },
  },
  parallel: {
    flow: true,
    replay: REPLAY.INTERNAL,
    fields: {
      join: f('enum', { required: true, values: ['all', 'anySuccess', 'race'] }),
      branches: f('any', { required: true }),
      cancelLosers: f('boolean'),
      merge: f('any'),
    },
  },
  stop: {
    flow: true,
    replay: REPLAY.INTERNAL,
    fields: {
      outcome: f('enum', { values: ['completed', 'failed', 'cancelled'] }),
      message: f('template'),
    },
  },
  'variable.set': {
    replay: REPLAY.PURE,
    playerSafe: true,
    fields: { name: f('id', { required: true }), value: f('expr', { required: true }) },
  },
  'event.emit': {
    replay: REPLAY.INTERNAL,
    playerSafe: true,
    fields: { signal: f('id', { required: true }), value: f('expr') },
  },
  // ---- Actions ------------------------------------------------------------
  'chat.send': {
    replay: REPLAY.NON_IDEMPOTENT,
    playerSafe: true,
    fields: {
      mode: f('enum', { values: ['say', 'emote', 'desc', 'whisper'] }),
      text: f('template', { required: true }),
      to: f('recipients'),
      as: f('string'),
    },
  },
  'chat.command': {
    replay: REPLAY.NON_IDEMPOTENT,
    gmOnly: true,
    fields: { text: f('template', { required: true }), as: f('string') },
  },
  'token.set': {
    replay: REPLAY.IDEMPOTENT,
    playerSafe: true,
    fields: {
      target: f('target', { required: true }),
      set: f('exprMap', { required: true }),
      expect: f('exprMap'),
    },
  },
  'token.get': {
    replay: REPLAY.PURE,
    playerSafe: true,
    fields: { target: f('target', { required: true }), property: f('string', { required: true }) },
  },
  'token.advanceSide': {
    replay: REPLAY.NON_IDEMPOTENT,
    playerSafe: true,
    fields: { target: f('target', { required: true }), delta: f('integer'), wrap: f('boolean') },
  },
  'token.setSide': {
    replay: REPLAY.IDEMPOTENT,
    playerSafe: true,
    fields: { target: f('target', { required: true }), side: f('expr', { required: true }) },
  },
  'attribute.set': {
    replay: REPLAY.IDEMPOTENT,
    fields: {
      target: f('target', { required: true }),
      attribute: f('string', { required: true }),
      field: f('enum', { values: ['current', 'max'] }),
      value: f('expr', { required: true }),
      expect: f('expr'),
      create: f('boolean'),
      useWorker: f('boolean'),
    },
  },
  'attribute.adjust': {
    replay: REPLAY.NON_IDEMPOTENT,
    fields: {
      target: f('target', { required: true }),
      attribute: f('string', { required: true }),
      field: f('enum', { values: ['current', 'max'] }),
      by: f('expr', { required: true }),
      min: f('number'),
      max: f('number'),
      useWorker: f('boolean'),
    },
  },
  'attribute.get': {
    replay: REPLAY.PURE,
    playerSafe: true,
    fields: {
      target: f('target', { required: true }),
      attribute: f('string', { required: true }),
      field: f('enum', { values: ['current', 'max'] }),
    },
  },
  'marker.set': {
    replay: REPLAY.IDEMPOTENT,
    playerSafe: true,
    fields: {
      target: f('target', { required: true }),
      marker: f('string', { required: true }),
      op: f('enum', { values: ['add', 'remove', 'toggle', 'set', 'adjust'] }),
      count: f('expr'),
    },
  },
  ping: {
    replay: REPLAY.EPHEMERAL,
    playerSafe: true,
    fields: {
      target: f('target'),
      at: f('point'),
      to: f('recipients'),
      moveView: f('boolean'),
    },
  },
  'effect.spawn': {
    replay: REPLAY.EPHEMERAL,
    playerSafe: true,
    fields: {
      target: f('target'),
      at: f('point'),
      to: f('point'),
      fx: f('string', { required: true }),
    },
  },
  'audio.control': {
    replay: REPLAY.IDEMPOTENT,
    fields: {
      track: f('template', { required: true }),
      op: f('enum', { required: true, values: ['play', 'stop', 'volume'] }),
      volume: f('expr'),
      loop: f('boolean'),
    },
  },
  'task.start': {
    replay: REPLAY.INTERNAL,
    fields: { definition: f('id', { required: true }), params: f('exprMap'), bindings: f('any') },
  },
  'task.cancel': {
    replay: REPLAY.INTERNAL,
    playerSafe: true,
    fields: { run: f('expr'), scope: f('enum', { values: ['run', 'children'] }) },
  },
  'task.pause': {
    replay: REPLAY.INTERNAL,
    playerSafe: true,
    fields: { run: f('expr'), scope: f('enum', { values: ['run', 'children'] }) },
  },
  'integration.command': {
    replay: REPLAY.NON_IDEMPOTENT,
    gmOnly: true,
    fields: { command: f('template', { required: true }), args: f('exprMap') },
  },
  'integration.call': {
    replay: REPLAY.ACKNOWLEDGED,
    fields: {
      adapter: f('id', { required: true }),
      action: f('id', { required: true }),
      input: f('exprMap'),
    },
  },
};

// Step types that suspend a branch on every pass.
export const SUSPENDING = new Set(['wait', 'awaitEvent']);

/**
 * Returns the full allowed field map of a step type (common + specific).
 *
 * @param {string} type Step type.
 * @returns {object|null} Field specs, or null for unknown types.
 */
export function stepFields(type) {
  const spec = STEP_SPECS[type];
  return spec ? { ...COMMON, ...spec.fields } : null;
}

/**
 * Returns the replay class of a step, allowing per-operation refinements
 * (marker counters and toggles are non-idempotent).
 *
 * @param {object} step Step.
 * @param {object} [adapter] Integration adapter for integration.call.
 * @returns {string} Replay class.
 */
export function replayClass(step, adapter) {
  if (step.type === 'marker.set' && ['toggle', 'adjust'].includes(step.op)) {
    return REPLAY.NON_IDEMPOTENT;
  }
  if (step.type === 'integration.call' && adapter?.replay) {
    return adapter.replay;
  }
  return STEP_SPECS[step.type]?.replay ?? REPLAY.NON_IDEMPOTENT;
}

export const EVENT_TYPES = [
  'token.add',
  'token.change',
  'token.destroy',
  'attribute.add',
  'attribute.change',
  'attribute.destroy',
  'turn.change',
  'turn.round',
  'turnorder.edit',
  'tracker.open',
  'tracker.close',
  'page.change',
  'player.online',
  'player.offline',
  'signal',
  'chat',
  'task.started',
  'task.completed',
  'task.failed',
  'task.cancelled',
  'integration',
];

export const TRIGGER_TYPES = [
  'manual',
  'at',
  'interval',
  'daily',
  'weekly',
  'event',
  'signal',
  'chat',
];
export const TIME_TRIGGER_TYPES = new Set(['at', 'interval', 'daily', 'weekly']);
