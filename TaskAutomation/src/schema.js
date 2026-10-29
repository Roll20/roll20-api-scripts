// Runtime validator and compiler for task definitions (plan §12.1). It
// enforces the same rules as schema/task-definition.schema.json plus the
// checks JSON Schema cannot express: unique step IDs, reference roots, loop
// safety, parallel limits and call cycles. Pure: no Roll20 globals.

import {
  DEFAULT_LIMITS,
  DEFINITION_SCHEMA_VERSION,
  TOKEN_READ_PROPERTIES,
  TOKEN_WRITE_PROPERTIES,
} from './constants.js';
import {
  EVENT_TYPES,
  STEP_SPECS,
  SUSPENDING,
  TIME_TRIGGER_TYPES,
  TRIGGER_TYPES,
  stepFields,
} from './catalogue.js';
import { templatePaths, validateExpression } from './expressions.js';
import { parseClockTime, parseWeekdays } from './recurrence.js';
import { isRecord, parseDuration, parseIsoInstant, parseUtcOffset } from './utils.js';

export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/;

const TOP_FIELDS = [
  'schemaVersion',
  'id',
  'revision',
  'name',
  'enabled',
  'description',
  'parameters',
  'bindings',
  'access',
  'triggers',
  'policy',
  'steps',
  'tags',
];
const STEP_ROOTS = new Set(['param', 'var', 'event', 'target', 'run', 'bindings', 'now']);
const EVENT_ROOTS = new Set(['event', 'param', 'now']);
const AWAIT_ROOTS = new Set(['event', 'param', 'var', 'run', 'now']);
const OBJECT_TYPES = ['graphic', 'character', 'player', 'jukeboxtrack', 'page'];
const PARAM_TYPES = ['number', 'string', 'boolean', 'id'];
const CONCURRENCY = ['allow', 'skipIfRunning', 'queue', 'replace'];
const OVERDUE_MODES = ['skip', 'runOnce', 'catchUpBounded', 'review', 'expire'];
const FILTER_FIELDS = [
  'objectIds',
  'pageIds',
  'characterIds',
  'names',
  'properties',
  'attribute',
  'changedTo',
  'changedFrom',
  'crossing',
  'signal',
  'definitionId',
  'binding',
  'condition',
  'adapter',
];

/**
 * Creates an error collector.
 *
 * @returns {{errors: object[], add: Function}} Collector.
 */
function collector() {
  const errors = [];
  return {
    errors,
    add(path, code, vars = {}) {
      if (errors.length < 50) {
        errors.push({ path, code, vars });
      }
    },
  };
}

/**
 * Reports keys that are not in the allowed list.
 *
 * @param {object} obj Object.
 * @param {string[]} allowed Allowed keys.
 * @param {string} path Location.
 * @param {object} out Collector.
 * @returns {void}
 */
function checkKeys(obj, allowed, path, out) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      out.add(`${path}.${key}`, 'unknownField', { field: key });
    }
  }
}

/**
 * Parses a duration given as milliseconds or text such as `5m`.
 *
 * @param {*} raw Value.
 * @returns {number|null} Milliseconds.
 */
export function durationValue(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw >= 0 ? raw : null;
  }
  return parseDuration(raw);
}

/**
 * Validates parameters.
 *
 * @param {*} params Parameter declarations.
 * @param {object} out Collector.
 * @returns {void}
 */
function validateParameters(params, out) {
  if (params === undefined) {
    return;
  }
  if (!isRecord(params)) {
    out.add('parameters', 'notObject');
    return;
  }
  for (const [name, spec] of Object.entries(params)) {
    const at = `parameters.${name}`;
    if (!ID_PATTERN.test(name)) {
      out.add(at, 'badId', { id: name });
    }
    if (!isRecord(spec)) {
      out.add(at, 'notObject');
      continue;
    }
    checkKeys(
      spec,
      ['type', 'default', 'min', 'max', 'maxLength', 'enum', 'required', 'description'],
      at,
      out
    );
    if (!PARAM_TYPES.includes(spec.type)) {
      out.add(`${at}.type`, 'badEnum', { values: PARAM_TYPES.join(', ') });
      continue;
    }
    if (spec.default !== undefined) {
      const checked = checkParamValue(spec, spec.default);
      if (!checked.ok) {
        out.add(`${at}.default`, checked.error, checked.vars);
      }
    }
  }
}

/**
 * Checks a parameter value against its declaration.
 *
 * @param {object} spec Parameter declaration.
 * @param {*} value Value.
 * @returns {{ok: boolean, value?: *, error?: string, vars?: object}} Result.
 */
export function checkParamValue(spec, value) {
  switch (spec.type) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number.NaN;
      if (!Number.isFinite(n)) {
        return { ok: false, error: 'notNumber' };
      }
      if ((spec.min !== undefined && n < spec.min) || (spec.max !== undefined && n > spec.max)) {
        return {
          ok: false,
          error: 'outOfRange',
          vars: { min: spec.min ?? '−∞', max: spec.max ?? '∞' },
        };
      }
      return { ok: true, value: n };
    }
    case 'boolean':
      return typeof value === 'boolean' ? { ok: true, value } : { ok: false, error: 'notBoolean' };
    case 'id':
      return typeof value === 'string' && /^-?[A-Za-z0-9_-]{1,64}$/.test(value)
        ? { ok: true, value }
        : { ok: false, error: 'badId', vars: { id: String(value) } };
    case 'string': {
      if (typeof value !== 'string') {
        return { ok: false, error: 'notString' };
      }
      const max = spec.maxLength ?? 200;
      if (value.length > max) {
        return { ok: false, error: 'stringTooLong', vars: { max } };
      }
      if (Array.isArray(spec.enum) && !spec.enum.includes(value)) {
        return { ok: false, error: 'badEnum', vars: { values: spec.enum.join(', ') } };
      }
      return { ok: true, value };
    }
    default:
      return { ok: false, error: 'badEnum', vars: { values: PARAM_TYPES.join(', ') } };
  }
}

/**
 * Validates binding declarations.
 *
 * @param {*} bindings Bindings.
 * @param {object} params Parameters.
 * @param {object} out Collector.
 * @param {object} limits Limits.
 * @returns {void}
 */
function validateBindings(bindings, params, out, limits) {
  if (bindings === undefined) {
    return;
  }
  if (!isRecord(bindings)) {
    out.add('bindings', 'notObject');
    return;
  }
  for (const [name, spec] of Object.entries(bindings)) {
    const at = `bindings.${name}`;
    if (!ID_PATTERN.test(name)) {
      out.add(at, 'badId', { id: name });
    }
    if (!isRecord(spec)) {
      out.add(at, 'notObject');
      continue;
    }
    checkKeys(
      spec,
      ['from', 'objectType', 'ids', 'max', 'min', 'param', 'query', 'alternate', 'description'],
      at,
      out
    );
    if (!['selected', 'ids', 'event', 'query', 'param', 'none'].includes(spec.from)) {
      out.add(`${at}.from`, 'badEnum', { values: 'selected, ids, event, query, param, none' });
    }
    if (!OBJECT_TYPES.includes(spec.objectType)) {
      out.add(`${at}.objectType`, 'badEnum', { values: OBJECT_TYPES.join(', ') });
    }
    if (
      spec.max !== undefined &&
      (!Number.isInteger(spec.max) || spec.max < 1 || spec.max > limits.targetsPerChunk * 5)
    ) {
      out.add(`${at}.max`, 'outOfRange', { min: 1, max: limits.targetsPerChunk * 5 });
    }
    if (
      spec.from === 'ids' &&
      (!Array.isArray(spec.ids) || spec.ids.some((id) => typeof id !== 'string'))
    ) {
      out.add(`${at}.ids`, 'notIdList');
    }
    if (spec.from === 'param' && !(isRecord(params) && params[spec.param])) {
      out.add(`${at}.param`, 'unknownParam', { name: String(spec.param) });
    }
    if (spec.from === 'query') {
      if (!isRecord(spec.query)) {
        out.add(`${at}.query`, 'notObject');
      } else {
        checkKeys(
          spec.query,
          ['name', 'pageId', 'represents', 'layer', 'max', 'evaluate', 'marker'],
          `${at}.query`,
          out
        );
        const max = spec.query.max;
        if (!Number.isInteger(max) || max < 1 || max > limits.queryResults) {
          out.add(`${at}.query.max`, 'outOfRange', { min: 1, max: limits.queryResults });
        }
        if (spec.query.evaluate !== undefined && !['start', 'step'].includes(spec.query.evaluate)) {
          out.add(`${at}.query.evaluate`, 'badEnum', { values: 'start, step' });
        }
      }
    }
    if (spec.alternate !== undefined) {
      if (!isRecord(spec.alternate) || !['ids', 'event', 'none'].includes(spec.alternate.from)) {
        out.add(`${at}.alternate`, 'badEnum', { values: 'ids, event, none' });
      }
    }
  }
}

/**
 * Validates the access policy.
 *
 * @param {*} access Access.
 * @param {object} out Collector.
 * @returns {void}
 */
function validateAccess(access, out) {
  if (access === undefined) {
    return;
  }
  if (!isRecord(access)) {
    out.add('access', 'notObject');
    return;
  }
  checkKeys(
    access,
    [
      'mode',
      'players',
      'controllers',
      'authority',
      'capabilities',
      'selfTrigger',
      'detachChildren',
    ],
    'access',
    out
  );
  if (access.mode !== undefined && !['gmOnly', 'players'].includes(access.mode)) {
    out.add('access.mode', 'badEnum', { values: 'gmOnly, players' });
  }
  if (access.authority !== undefined && !['initiator', 'gmService'].includes(access.authority)) {
    out.add('access.authority', 'badEnum', { values: 'initiator, gmService' });
  }
  // A player's run acts with that player's rights, never the GM's.
  if (access.mode === 'players' && access.authority === 'gmService') {
    out.add('access.authority', 'playersNeedInitiator');
  }
  if (
    access.players !== undefined &&
    (!Array.isArray(access.players) || access.players.some((p) => typeof p !== 'string'))
  ) {
    out.add('access.players', 'notIdList');
  }
  if (access.capabilities !== undefined) {
    if (!isRecord(access.capabilities)) {
      out.add('access.capabilities', 'notObject');
    } else {
      checkKeys(
        access.capabilities,
        ['actions', 'maxTargets', 'signals'],
        'access.capabilities',
        out
      );
      const actions = access.capabilities.actions;
      if (
        actions !== undefined &&
        (!Array.isArray(actions) || actions.some((a) => !STEP_SPECS[a]))
      ) {
        out.add('access.capabilities.actions', 'unknownAction');
      }
    }
  }
}

/**
 * Validates the run policy.
 *
 * @param {*} policy Policy.
 * @param {object} out Collector.
 * @returns {void}
 */
function validatePolicy(policy, out) {
  if (policy === undefined) {
    return;
  }
  if (!isRecord(policy)) {
    out.add('policy', 'notObject');
    return;
  }
  checkKeys(
    policy,
    [
      'concurrency',
      'maxConcurrent',
      'maxQueue',
      'queueExpiryMs',
      'onError',
      'retry',
      'overdue',
      'restart',
      'timeoutMs',
      'lifetimeMs',
      'allowForever',
      'recursion',
      'circuit',
      'quiet',
    ],
    'policy',
    out
  );
  if (policy.concurrency !== undefined && !CONCURRENCY.includes(policy.concurrency)) {
    out.add('policy.concurrency', 'badEnum', { values: CONCURRENCY.join(', ') });
  }
  if (
    policy.onError !== undefined &&
    !['fail', 'skip', 'retry', 'review'].includes(policy.onError)
  ) {
    out.add('policy.onError', 'badEnum', { values: 'fail, skip, retry, review' });
  }
  if (policy.restart !== undefined && !['reconcile', 'review', 'fail'].includes(policy.restart)) {
    out.add('policy.restart', 'badEnum', { values: 'reconcile, review, fail' });
  }
  for (const key of ['maxConcurrent', 'maxQueue']) {
    if (policy[key] !== undefined && (!Number.isInteger(policy[key]) || policy[key] < 1)) {
      out.add(`policy.${key}`, 'outOfRange', { min: 1, max: '∞' });
    }
  }
  if (policy.retry !== undefined) {
    validateRetry(policy.retry, 'policy.retry', out);
  }
  if (policy.overdue !== undefined) {
    validateOverdue(policy.overdue, 'policy.overdue', out);
  }
  if (policy.recursion !== undefined) {
    if (!isRecord(policy.recursion)) {
      out.add('policy.recursion', 'notObject');
    } else {
      checkKeys(policy.recursion, ['allow', 'maxDepth'], 'policy.recursion', out);
    }
  }
}

/**
 * Validates a retry policy.
 *
 * @param {*} retry Retry policy.
 * @param {string} at Location.
 * @param {object} out Collector.
 * @returns {void}
 */
function validateRetry(retry, at, out) {
  if (!isRecord(retry)) {
    out.add(at, 'notObject');
    return;
  }
  checkKeys(retry, ['maxAttempts', 'baseDelayMs', 'maxDelayMs', 'jitterMs'], at, out);
  if (!Number.isInteger(retry.maxAttempts) || retry.maxAttempts < 1 || retry.maxAttempts > 10) {
    out.add(`${at}.maxAttempts`, 'outOfRange', { min: 1, max: 10 });
  }
  for (const key of ['baseDelayMs', 'maxDelayMs', 'jitterMs']) {
    if (retry[key] !== undefined && (!Number.isFinite(retry[key]) || retry[key] < 0)) {
      out.add(`${at}.${key}`, 'outOfRange', { min: 0, max: '∞' });
    }
  }
}

/**
 * Validates an overdue policy.
 *
 * @param {*} overdue Overdue policy.
 * @param {string} at Location.
 * @param {object} out Collector.
 * @returns {void}
 */
function validateOverdue(overdue, at, out) {
  if (!isRecord(overdue)) {
    out.add(at, 'notObject');
    return;
  }
  checkKeys(overdue, ['mode', 'graceMs', 'windowMs', 'maxAgeMs', 'catchUp'], at, out);
  if (overdue.mode !== undefined && !OVERDUE_MODES.includes(overdue.mode)) {
    out.add(`${at}.mode`, 'badEnum', { values: OVERDUE_MODES.join(', ') });
  }
  if (overdue.catchUp !== undefined) {
    if (!isRecord(overdue.catchUp)) {
      out.add(`${at}.catchUp`, 'notObject');
    } else {
      checkKeys(overdue.catchUp, ['max', 'maxAgeMs', 'spacingMs'], `${at}.catchUp`, out);
    }
  }
}

/**
 * Validates an event filter.
 *
 * @param {*} filter Filter.
 * @param {string} at Location.
 * @param {Set<string>} roots Allowed expression roots for `condition`.
 * @param {object} out Collector.
 * @param {object} limits Limits.
 * @returns {void}
 */
function validateFilter(filter, at, roots, out, limits) {
  if (filter === undefined) {
    return;
  }
  if (!isRecord(filter)) {
    out.add(at, 'notObject');
    return;
  }
  checkKeys(filter, FILTER_FIELDS, at, out);
  for (const key of ['objectIds', 'pageIds', 'characterIds', 'names', 'properties']) {
    if (
      filter[key] !== undefined &&
      (!Array.isArray(filter[key]) || filter[key].some((v) => typeof v !== 'string'))
    ) {
      out.add(`${at}.${key}`, 'notIdList');
    }
  }
  if (Array.isArray(filter.properties)) {
    const allowed = [...TOKEN_READ_PROPERTIES, 'current', 'max'];
    for (const prop of filter.properties) {
      if (!allowed.includes(prop)) {
        out.add(`${at}.properties`, 'badProperty', { property: prop });
      }
    }
  }
  if (filter.crossing !== undefined) {
    const c = filter.crossing;
    if (
      !isRecord(c) ||
      typeof c.property !== 'string' ||
      !['below', 'above'].includes(c.direction) ||
      !Number.isFinite(c.threshold)
    ) {
      out.add(`${at}.crossing`, 'badCrossing');
    }
  }
  for (const key of ['changedTo', 'changedFrom']) {
    if (filter[key] !== undefined && !isRecord(filter[key])) {
      out.add(`${at}.${key}`, 'notObject');
    }
  }
  if (filter.condition !== undefined) {
    for (const e of validateExpression(filter.condition, {
      roots,
      path: `${at}.condition`,
      limits,
    })) {
      out.add(e.path, e.code, e.vars);
    }
  }
}

/**
 * Validates triggers.
 *
 * @param {*} triggers Triggers.
 * @param {object} out Collector.
 * @param {object} limits Limits.
 * @returns {void}
 */
function validateTriggers(triggers, out, limits) {
  if (triggers === undefined) {
    return;
  }
  if (!Array.isArray(triggers)) {
    out.add('triggers', 'notArray');
    return;
  }
  const ids = new Set();
  triggers.forEach((trigger, i) => {
    const at = `triggers.${isRecord(trigger) && trigger.id ? trigger.id : i}`;
    if (!isRecord(trigger)) {
      out.add(at, 'notObject');
      return;
    }
    if (!ID_PATTERN.test(String(trigger.id ?? ''))) {
      out.add(`${at}.id`, 'badId', { id: String(trigger.id) });
    } else if (ids.has(trigger.id)) {
      out.add(`${at}.id`, 'duplicateId', { id: trigger.id });
    }
    ids.add(trigger.id);
    if (!TRIGGER_TYPES.includes(trigger.type)) {
      out.add(`${at}.type`, 'badEnum', { values: TRIGGER_TYPES.join(', ') });
      return;
    }
    const common = ['id', 'type', 'enabled', 'bind', 'description'];
    const time = ['start', 'end', 'maxCount', 'overdue'];
    const rate = ['cooldownMs', 'debounceMs', 'leading', 'burst', 'coalesce', 'selfTrigger'];
    switch (trigger.type) {
      case 'manual':
        checkKeys(trigger, common, at, out);
        break;
      case 'at':
        checkKeys(trigger, [...common, 'at', 'overdue'], at, out);
        if (parseIsoInstant(trigger.at) === null) {
          out.add(`${at}.at`, 'badInstant');
        }
        break;
      case 'interval': {
        checkKeys(trigger, [...common, ...time, 'every', 'anchor', 'mode'], at, out);
        const every = durationValue(trigger.every);
        if (every === null || every < limits.minIntervalMs) {
          out.add(`${at}.every`, 'intervalTooShort', { min: limits.minIntervalMs });
        }
        if (trigger.anchor !== undefined && parseIsoInstant(trigger.anchor) === null) {
          out.add(`${at}.anchor`, 'badInstant');
        }
        if (trigger.mode !== undefined && !['fixedRate', 'fixedDelay'].includes(trigger.mode)) {
          out.add(`${at}.mode`, 'badEnum', { values: 'fixedRate, fixedDelay' });
        }
        break;
      }
      case 'daily':
      case 'weekly':
        checkKeys(trigger, [...common, ...time, 'time', 'offset', 'days'], at, out);
        if (parseClockTime(trigger.time) === null) {
          out.add(`${at}.time`, 'badClock');
        }
        if (parseUtcOffset(trigger.offset) === null) {
          out.add(`${at}.offset`, 'badOffset');
        }
        if (trigger.type === 'weekly' && !parseWeekdays(trigger.days)) {
          out.add(`${at}.days`, 'badDays');
        }
        break;
      case 'event':
        checkKeys(trigger, [...common, ...rate, 'event', 'filter', 'reconcile'], at, out);
        if (!EVENT_TYPES.includes(trigger.event)) {
          out.add(`${at}.event`, 'badEnum', { values: EVENT_TYPES.join(', ') });
        }
        validateFilter(trigger.filter, `${at}.filter`, EVENT_ROOTS, out, limits);
        break;
      case 'signal':
        checkKeys(trigger, [...common, ...rate, 'name', 'players'], at, out);
        if (!ID_PATTERN.test(String(trigger.name ?? ''))) {
          out.add(`${at}.name`, 'badId', { id: String(trigger.name) });
        }
        break;
      case 'chat':
        checkKeys(trigger, [...common, ...rate, 'match', 'channels', 'private'], at, out);
        if (
          !isRecord(trigger.match) ||
          !['equals', 'contains', 'startsWith'].some((k) => typeof trigger.match[k] === 'string')
        ) {
          out.add(`${at}.match`, 'badMatch');
        }
        break;
      default:
        break;
    }
    if (TIME_TRIGGER_TYPES.has(trigger.type)) {
      for (const key of ['start', 'end']) {
        if (trigger[key] !== undefined && parseIsoInstant(trigger[key]) === null) {
          out.add(`${at}.${key}`, 'badInstant');
        }
      }
      if (trigger.overdue !== undefined) {
        validateOverdue(trigger.overdue, `${at}.overdue`, out);
      }
    }
    for (const key of ['cooldownMs', 'debounceMs']) {
      if (trigger[key] !== undefined && (!Number.isFinite(trigger[key]) || trigger[key] < 0)) {
        out.add(`${at}.${key}`, 'outOfRange', { min: 0, max: '∞' });
      }
    }
    if (
      trigger.burst !== undefined &&
      !(
        isRecord(trigger.burst) &&
        Number.isInteger(trigger.burst.count) &&
        Number.isFinite(trigger.burst.windowMs)
      )
    ) {
      out.add(`${at}.burst`, 'badBurst');
    }
    if (trigger.bind !== undefined && !isRecord(trigger.bind)) {
      out.add(`${at}.bind`, 'notObject');
    }
  });
}

/**
 * Validates one field of a step.
 *
 * @param {object} spec Field spec.
 * @param {*} value Value.
 * @param {string} at Location.
 * @param {object} ctx Validation context.
 * @returns {void}
 */
function validateField(spec, value, at, ctx) {
  const { out, limits } = ctx;
  switch (spec.kind) {
    case 'expr':
      for (const e of validateExpression(value, { roots: STEP_ROOTS, path: at, limits })) {
        out.add(e.path, e.code, e.vars);
      }
      break;
    case 'template':
      if (typeof value !== 'string' || value.length > limits.stringLength) {
        out.add(at, 'badTemplate', { max: limits.stringLength });
        break;
      }
      for (const path of templatePaths(value)) {
        const root = path.split('.')[0];
        if (!STEP_ROOTS.has(root) && !(root === 'args' && ctx.stepType === 'integration.command')) {
          out.add(at, 'refRoot', { root: path.split('.')[0], allowed: [...STEP_ROOTS].join(', ') });
        }
      }
      break;
    case 'string':
      if (typeof value !== 'string' || value.length > limits.stringLength) {
        out.add(at, 'notString');
      }
      break;
    case 'id':
      if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
        out.add(at, 'badId', { id: String(value) });
      }
      break;
    case 'number':
      if (!Number.isFinite(value)) {
        out.add(at, 'notNumber');
      }
      break;
    case 'integer':
      if (!Number.isInteger(value) || (spec.min !== undefined && value < spec.min)) {
        out.add(at, 'outOfRange', { min: spec.min ?? '−∞', max: '∞' });
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        out.add(at, 'notBoolean');
      }
      break;
    case 'enum':
      if (!spec.values.includes(value)) {
        out.add(at, 'badEnum', { values: spec.values.join(', ') });
      }
      break;
    case 'target':
      validateTarget(value, at, ctx);
      break;
    case 'recipients':
      if (!isRecord(value)) {
        out.add(at, 'notObject');
      } else {
        checkKeys(value, ['gm', 'players', 'binding', 'controllers', 'initiator'], at, out);
        if (value.binding !== undefined && !ctx.bindings[value.binding]) {
          out.add(at, 'unknownBinding', { name: String(value.binding) });
        }
        if (value.controllers !== undefined && !ctx.bindings[value.controllers]) {
          out.add(at, 'unknownBinding', { name: String(value.controllers) });
        }
      }
      break;
    case 'point':
      if (!isRecord(value)) {
        out.add(at, 'notObject');
      } else {
        checkKeys(value, ['left', 'top', 'page'], at, out);
        for (const key of ['left', 'top', 'page']) {
          if (value[key] === undefined) {
            out.add(at, 'missingField', { field: key });
          } else {
            validateField({ kind: 'expr' }, value[key], `${at}.${key}`, ctx);
          }
        }
      }
      break;
    case 'exprMap':
      if (!isRecord(value)) {
        out.add(at, 'notObject');
      } else {
        for (const [key, expr] of Object.entries(value)) {
          validateField({ kind: 'expr' }, expr, `${at}.${key}`, ctx);
        }
      }
      break;
    case 'steps':
      validateBlock(value, at, ctx);
      break;
    default:
      break;
  }
}

/**
 * Validates a step target.
 *
 * @param {*} target Target.
 * @param {string} at Location.
 * @param {object} ctx Context.
 * @returns {void}
 */
function validateTarget(target, at, ctx) {
  if (!isRecord(target)) {
    ctx.out.add(at, 'notObject');
    return;
  }
  const keys = Object.keys(target);
  if (keys.length !== 1 || !['binding', 'ids', 'ref'].includes(keys[0])) {
    ctx.out.add(at, 'badTarget');
    return;
  }
  if ('binding' in target && !ctx.bindings[target.binding]) {
    ctx.out.add(at, 'unknownBinding', { name: String(target.binding) });
  }
  if (
    'ids' in target &&
    (!Array.isArray(target.ids) || target.ids.some((id) => typeof id !== 'string'))
  ) {
    ctx.out.add(at, 'notIdList');
  }
  if ('ref' in target) {
    validateField({ kind: 'expr' }, { ref: target.ref }, at, ctx);
  }
}

/**
 * Validates a block of steps.
 *
 * @param {*} steps Steps.
 * @param {string} at Location.
 * @param {object} ctx Context.
 * @returns {void}
 */
function validateBlock(steps, at, ctx) {
  if (!Array.isArray(steps)) {
    ctx.out.add(at, 'notArray');
    return;
  }
  ctx.depth += 1;
  if (ctx.depth > ctx.limits.nestingDepth) {
    ctx.out.add(at, 'tooDeep', { max: ctx.limits.nestingDepth });
  }
  for (const step of steps) {
    validateStep(step, ctx);
  }
  ctx.depth -= 1;
}

/**
 * Validates one step and its nested blocks.
 *
 * @param {*} step Step.
 * @param {object} ctx Context.
 * @returns {void}
 */
function validateStep(step, ctx) {
  const { out, limits } = ctx;
  ctx.count += 1;
  if (ctx.count > limits.stepsPerDefinition) {
    if (ctx.count === limits.stepsPerDefinition + 1) {
      out.add('steps', 'tooManySteps', { max: limits.stepsPerDefinition });
    }
    return;
  }
  if (!isRecord(step)) {
    out.add('steps', 'notObject');
    return;
  }
  const id = String(step.id ?? '');
  const at = `step:${id || '?'}`;
  if (!ID_PATTERN.test(id)) {
    out.add(at, 'badId', { id });
  } else if (ctx.stepIds.has(id)) {
    out.add(at, 'duplicateId', { id });
  }
  ctx.stepIds.add(id);
  ctx.stepType = step.type;
  const fields = stepFields(step.type);
  if (!fields) {
    out.add(`${at}.type`, 'unknownAction', { type: String(step.type) });
    return;
  }
  for (const [key, value] of Object.entries(step)) {
    if (!fields[key]) {
      out.add(`${at}.${key}`, 'unknownField', { field: key });
      continue;
    }
    if (key !== 'type' && key !== 'id') {
      validateField(fields[key], value, `${at}.${key}`, ctx);
    }
  }
  for (const [key, spec] of Object.entries(fields)) {
    if (spec.required && step[key] === undefined) {
      out.add(at, 'missingField', { field: key });
    }
  }
  if (step.retry !== undefined) {
    validateRetry(step.retry, `${at}.retry`, out);
  }
  validateStepRules(step, at, ctx);
}

/**
 * Checks rules specific to step types that field specs cannot express.
 *
 * @param {object} step Step.
 * @param {string} at Location.
 * @param {object} ctx Context.
 * @returns {void}
 */
function validateStepRules(step, at, ctx) {
  const { out, limits, def } = ctx;
  switch (step.type) {
    case 'wait': {
      const hasDuration = step.durationMs !== undefined;
      if (hasDuration === (step.until !== undefined)) {
        out.add(at, 'waitKind');
      }
      if (typeof step.durationMs === 'number' && step.durationMs < limits.minWaitMs) {
        out.add(`${at}.durationMs`, 'waitTooShort', { min: limits.minWaitMs });
      }
      break;
    }
    case 'awaitEvent':
      if (!EVENT_TYPES.includes(step.event)) {
        out.add(`${at}.event`, 'badEnum', { values: EVENT_TYPES.join(', ') });
      }
      validateFilter(step.filter, `${at}.filter`, AWAIT_ROOTS, out, limits);
      if (step.timeoutMs > limits.awaitTimeoutMaxMs) {
        out.add(`${at}.timeoutMs`, 'outOfRange', { min: 100, max: limits.awaitTimeoutMaxMs });
      }
      if (step.filter?.binding !== undefined && !ctx.bindings[step.filter.binding]) {
        out.add(`${at}.filter.binding`, 'unknownBinding', { name: String(step.filter.binding) });
      }
      break;
    case 'loop':
      if (step.mode === 'count' && step.count === undefined) {
        out.add(at, 'missingField', { field: 'count' });
      }
      if ((step.mode === 'while' || step.mode === 'until') && step.condition === undefined) {
        out.add(at, 'missingField', { field: 'condition' });
      }
      if (
        step.maxIterations !== undefined &&
        step.maxIterations > limits.loopIterations &&
        step.mode !== 'forever'
      ) {
        out.add(`${at}.maxIterations`, 'outOfRange', { min: 1, max: limits.loopIterations });
      }
      if (
        typeof step.count === 'number' &&
        (!Number.isInteger(step.count) || step.count < 0 || step.count > limits.loopIterations)
      ) {
        out.add(`${at}.count`, 'outOfRange', { min: 0, max: limits.loopIterations });
      }
      if (step.mode === 'forever') {
        if (def.policy?.allowForever !== true) {
          out.add(at, 'foreverNotAllowed');
        }
        if (Array.isArray(step.steps) && !blockAlwaysSuspends(step.steps)) {
          out.add(at, 'foreverNoWait');
        }
      }
      break;
    case 'parallel': {
      if (!Array.isArray(step.branches) || step.branches.length < 2) {
        out.add(`${at}.branches`, 'branchCount', { max: limits.branchesPerRun });
        break;
      }
      if (step.branches.length > limits.branchesPerRun) {
        out.add(`${at}.branches`, 'branchCount', { max: limits.branchesPerRun });
      }
      const ids = new Set();
      step.branches.forEach((branch, i) => {
        const bat = `${at}.branches.${i}`;
        if (!isRecord(branch)) {
          out.add(bat, 'notObject');
          return;
        }
        checkKeys(branch, ['id', 'steps'], bat, out);
        if (!ID_PATTERN.test(String(branch.id ?? '')) || ids.has(branch.id)) {
          out.add(`${bat}.id`, 'badId', { id: String(branch.id) });
        }
        ids.add(branch.id);
        validateBlock(branch.steps, `${bat}.steps`, ctx);
      });
      if (step.merge !== undefined) {
        if (!Array.isArray(step.merge)) {
          out.add(`${at}.merge`, 'notArray');
        } else {
          for (const [i, rule] of step.merge.entries()) {
            if (
              !isRecord(rule) ||
              !ID_PATTERN.test(String(rule.name ?? '')) ||
              !['sum', 'min', 'max', 'first', 'last', 'count', 'all', 'any'].includes(rule.reducer)
            ) {
              out.add(`${at}.merge.${i}`, 'badMerge');
            }
          }
        }
      }
      break;
    }
    case 'call':
    case 'task.start':
      ctx.calls.add(step.definition);
      if (step.bindings !== undefined && !isRecord(step.bindings)) {
        out.add(`${at}.bindings`, 'notObject');
      }
      break;
    case 'token.set':
      if (isRecord(step.set)) {
        for (const key of Object.keys(step.set)) {
          if (!(key in TOKEN_WRITE_PROPERTIES)) {
            out.add(`${at}.set.${key}`, 'badProperty', { property: key });
          }
        }
      }
      break;
    case 'token.get':
      if (!TOKEN_READ_PROPERTIES.includes(step.property)) {
        out.add(`${at}.property`, 'badProperty', { property: String(step.property) });
      }
      break;
    case 'integration.command':
      if (typeof step.command === 'string' && !/^![A-Za-z0-9_-]+/.test(step.command)) {
        out.add(`${at}.command`, 'badCommand');
      }
      if (typeof step.command === 'string' && /[\r\n]/.test(step.command)) {
        out.add(`${at}.command`, 'badCommand');
      }
      break;
    default:
      break;
  }
  if (STEP_SPECS[step.type]?.gmOnly && def.access?.mode === 'players') {
    out.add(at, 'gmOnlyAction', { type: step.type });
  }
  if (def.access?.mode === 'players') {
    const allowed = def.access.capabilities?.actions;
    const spec = STEP_SPECS[step.type];
    if (
      !spec.flow &&
      (!spec.playerSafe || (Array.isArray(allowed) && !allowed.includes(step.type)))
    ) {
      out.add(at, 'notPlayerCapability', { type: step.type });
    }
  }
}

/**
 * Returns true when every pass through a block is certain to suspend
 * (a positive wait, an awaited event or an awaited call). Conservative:
 * anything uncertain counts as not suspending.
 *
 * @param {object[]} steps Steps.
 * @returns {boolean} True when the block always suspends.
 */
export function blockAlwaysSuspends(steps) {
  return steps.some((step) => stepAlwaysSuspends(step));
}

/**
 * Returns true when a step always suspends its branch.
 *
 * @param {object} step Step.
 * @returns {boolean} True when it always suspends.
 */
function stepAlwaysSuspends(step) {
  if (!isRecord(step)) {
    return false;
  }
  if (SUSPENDING.has(step.type)) {
    if (step.type === 'wait' && step.durationMs !== undefined) {
      return typeof step.durationMs === 'number' && step.durationMs > 0;
    }
    return true;
  }
  if (step.type === 'call') {
    return step.await !== false;
  }
  if (step.type === 'if') {
    return blockAlwaysSuspends(step.then || []) && blockAlwaysSuspends(step.else || []);
  }
  if (step.type === 'parallel' && Array.isArray(step.branches)) {
    return step.join === 'all'
      ? step.branches.some((b) => blockAlwaysSuspends(b.steps || []))
      : step.branches.every((b) => blockAlwaysSuspends(b.steps || []));
  }
  return false;
}

/**
 * Validates a definition.
 *
 * @param {*} def Definition.
 * @param {object} [options] Options.
 * @param {object} [options.limits] Limits.
 * @returns {{ok: boolean, errors: object[], calls: string[]}} Result with called definition IDs.
 */
export function validateDefinition(def, { limits = DEFAULT_LIMITS } = {}) {
  const out = collector();
  if (!isRecord(def)) {
    out.add('$', 'notObject');
    return { ok: false, errors: out.errors, calls: [] };
  }
  checkKeys(def, TOP_FIELDS, '$', out);
  if (def.schemaVersion !== DEFINITION_SCHEMA_VERSION) {
    out.add('schemaVersion', 'schemaVersion', { version: DEFINITION_SCHEMA_VERSION });
  }
  if (!ID_PATTERN.test(String(def.id ?? ''))) {
    out.add('id', 'badId', { id: String(def.id) });
  }
  if (typeof def.name !== 'string' || !def.name.trim() || def.name.length > limits.nameLength) {
    out.add('name', 'badName', { max: limits.nameLength });
  }
  if (
    def.description !== undefined &&
    (typeof def.description !== 'string' || def.description.length > limits.stringLength)
  ) {
    out.add('description', 'notString');
  }
  if (def.revision !== undefined && (!Number.isInteger(def.revision) || def.revision < 1)) {
    out.add('revision', 'outOfRange', { min: 1, max: '∞' });
  }
  if (def.enabled !== undefined && typeof def.enabled !== 'boolean') {
    out.add('enabled', 'notBoolean');
  }
  validateParameters(def.parameters, out);
  validateBindings(def.bindings, def.parameters, out, limits);
  validateAccess(def.access, out);
  validateTriggers(def.triggers, out, limits);
  validatePolicy(def.policy, out);
  const ctx = {
    out,
    limits,
    def,
    bindings: isRecord(def.bindings) ? def.bindings : {},
    stepIds: new Set(),
    calls: new Set(),
    depth: 0,
    count: 0,
  };
  if (!Array.isArray(def.steps) || def.steps.length === 0) {
    out.add('steps', 'noSteps');
  } else {
    validateBlock(def.steps, 'steps', ctx);
  }
  // Unattended starts act for the GM, never as a former initiator (plan §10).
  const unattendedTypes = new Set([...TIME_TRIGGER_TYPES, 'event', 'chat']);
  if (
    (def.triggers || []).some((tr) => isRecord(tr) && unattendedTypes.has(tr.type)) &&
    def.access?.authority !== 'gmService'
  ) {
    out.add('access.authority', 'unattendedNeedsService');
  }
  // Selection is only available on a person's command: other starts need an alternate.
  const unattended = (def.triggers || []).some(
    (tr) => isRecord(tr) && tr.type !== 'manual' && tr.type !== 'signal'
  );
  for (const [name, spec] of Object.entries(ctx.bindings)) {
    if (isRecord(spec) && spec.from === 'selected' && unattended && !spec.alternate) {
      out.add(`bindings.${name}`, 'selectionUnattended');
    }
  }
  return { ok: out.errors.length === 0, errors: out.errors, calls: [...ctx.calls] };
}

/**
 * Compiles a validated definition into lookup tables for the executor.
 * Block keys: `root`, `<stepId>/steps`, `<stepId>/then`, `<stepId>/else`,
 * `<stepId>/branch/<branchId>`.
 *
 * @param {object} def Validated definition.
 * @returns {{blocks: Map<string, object[]>, steps: Map<string, object>}} Compiled program.
 */
export function compileDefinition(def) {
  const blocks = new Map();
  const steps = new Map();
  const walk = (list, key) => {
    blocks.set(key, list);
    list.forEach((step, index) => {
      steps.set(step.id, { step, block: key, index });
      if (step.type === 'loop') {
        walk(step.steps, `${step.id}/steps`);
      } else if (step.type === 'if') {
        walk(step.then || [], `${step.id}/then`);
        walk(step.else || [], `${step.id}/else`);
      } else if (step.type === 'parallel') {
        for (const branch of step.branches) {
          walk(branch.steps, `${step.id}/branch/${branch.id}`);
        }
      }
    });
  };
  walk(def.steps, 'root');
  return { blocks, steps };
}

/**
 * Finds a call cycle starting at a definition.
 *
 * @param {string} startId Definition ID.
 * @param {(id: string) => string[]} callsOf Returns the IDs a definition calls.
 * @returns {string[]|null} Cycle path, or null.
 */
export function findCallCycle(startId, callsOf) {
  const stack = [];
  const visiting = new Set();
  const done = new Set();
  const visit = (id) => {
    if (visiting.has(id)) {
      return [...stack.slice(stack.indexOf(id)), id];
    }
    if (done.has(id)) {
      return null;
    }
    visiting.add(id);
    stack.push(id);
    for (const next of callsOf(id)) {
      const cycle = visit(next);
      if (cycle) {
        return cycle;
      }
    }
    stack.pop();
    visiting.delete(id);
    done.add(id);
    return null;
  };
  return visit(startId);
}

/**
 * Formats a validation error path for people: `step:advance.delta` becomes
 * `advance: delta`.
 *
 * @param {string} path Error path.
 * @returns {string} Readable location.
 */
export function describePath(path) {
  const match = /^step:([^.]+)(?:\.(.+))?$/.exec(path);
  if (match) {
    return match[2] ? `${match[1]}: ${match[2]}` : match[1];
  }
  return path;
}
