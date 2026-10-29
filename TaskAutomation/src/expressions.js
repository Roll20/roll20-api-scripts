// Safe structured expressions (plan §4.3). Expressions are JSON trees, never
// source code: no eval, no functions, no prototype walking, no regular
// expressions. Missing values stay missing and never turn into zero.
// Pure: references are resolved through a callback supplied by the caller.

import { DEFAULT_LIMITS } from './constants.js';
import { isRecord, parseMarkers, parseStrictNumber, parseBoolean } from './utils.js';

/** The typed "no value" result. Comparisons with it are false. */
export const MISSING = Object.freeze({ missing: true });

const BINARY = new Set([
  'eq',
  'ne',
  'lt',
  'lte',
  'gt',
  'gte',
  'add',
  'sub',
  'mul',
  'div',
  'mod',
  'contains',
  'startsWith',
  'endsWith',
  'hasMarker',
  'in',
]);
const UNARY = new Set([
  'not',
  'neg',
  'abs',
  'round',
  'floor',
  'ceil',
  'exists',
  'number',
  'string',
  'boolean',
  'lower',
  'upper',
  'trim',
  'length',
]);
const NARY = new Set([
  'all',
  'any',
  'min',
  'max',
  'concat',
  'coalesce',
  'crossBelow',
  'crossAbove',
  'randomInt',
]);
const ARITY = { crossBelow: 3, crossAbove: 3, randomInt: 2 };

export const OPERATORS = Object.freeze([...BINARY, ...UNARY, ...NARY, 'if']);

const REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)*$/;

/**
 * Returns true when a value is the MISSING sentinel.
 *
 * @param {*} value Value.
 * @returns {boolean} True when missing.
 */
export function isMissing(value) {
  return value === MISSING;
}

/**
 * Returns whether an evaluated value counts as true. Missing is false.
 *
 * @param {*} value Value.
 * @returns {boolean} Truthiness.
 */
export function truthy(value) {
  if (value === MISSING || value === null || value === undefined) {
    return false;
  }
  return Boolean(value);
}

/**
 * Validates an expression tree.
 *
 * @param {*} node Expression.
 * @param {object} options Options.
 * @param {Set<string>} options.roots Reference roots allowed here (e.g. param, var, event).
 * @param {string} [options.path='$'] Location for error messages.
 * @param {object} [options.limits] Depth/node/string limits.
 * @returns {{path: string, code: string, vars?: object}[]} Errors (empty when valid).
 */
export function validateExpression(node, { roots, path = '$', limits = DEFAULT_LIMITS }) {
  const errors = [];
  let count = 0;
  const visit = (n, depth, at) => {
    count += 1;
    if (count > limits.expressionNodes) {
      errors.push({ path: at, code: 'exprTooLarge', vars: { max: limits.expressionNodes } });
      return;
    }
    if (depth > limits.expressionDepth) {
      errors.push({ path: at, code: 'exprTooDeep', vars: { max: limits.expressionDepth } });
      return;
    }
    if (n === null || typeof n === 'boolean') {
      return;
    }
    if (typeof n === 'number') {
      if (!Number.isFinite(n)) {
        errors.push({ path: at, code: 'notFinite' });
      }
      return;
    }
    if (typeof n === 'string') {
      if (n.length > limits.stringLength) {
        errors.push({ path: at, code: 'stringTooLong', vars: { max: limits.stringLength } });
      }
      return;
    }
    if (!isRecord(n)) {
      errors.push({ path: at, code: 'exprShape' });
      return;
    }
    if ('value' in n) {
      if (Object.keys(n).length !== 1) {
        errors.push({ path: at, code: 'unknownField', vars: { field: Object.keys(n).join(', ') } });
      }
      return;
    }
    if ('ref' in n) {
      for (const key of Object.keys(n)) {
        if (!['ref', 'as', 'default'].includes(key)) {
          errors.push({ path: `${at}.${key}`, code: 'unknownField', vars: { field: key } });
        }
      }
      if (typeof n.ref !== 'string' || !REF_PATTERN.test(n.ref)) {
        errors.push({ path: `${at}.ref`, code: 'badRef', vars: { ref: String(n.ref) } });
        return;
      }
      const root = n.ref.split('.')[0];
      if (!roots.has(root)) {
        errors.push({
          path: `${at}.ref`,
          code: 'refRoot',
          vars: { root, allowed: [...roots].join(', ') },
        });
      }
      if (n.as !== undefined && !['number', 'string', 'boolean'].includes(n.as)) {
        errors.push({ path: `${at}.as`, code: 'badConversion', vars: { as: String(n.as) } });
      }
      if (n.default !== undefined && n.default !== null && typeof n.default === 'object') {
        errors.push({ path: `${at}.default`, code: 'defaultScalar' });
      }
      return;
    }
    if (typeof n.op !== 'string' || !OPERATORS.includes(n.op)) {
      errors.push({ path: `${at}.op`, code: 'badOperator', vars: { op: String(n.op) } });
      return;
    }
    const allowed = ['op'];
    if (BINARY.has(n.op)) {
      allowed.push('left', 'right');
      for (const side of ['left', 'right']) {
        if (!(side in n)) {
          errors.push({ path: at, code: 'missingOperand', vars: { field: side, op: n.op } });
        } else {
          visit(n[side], depth + 1, `${at}.${side}`);
        }
      }
    } else if (UNARY.has(n.op)) {
      allowed.push('arg');
      if (!('arg' in n)) {
        errors.push({ path: at, code: 'missingOperand', vars: { field: 'arg', op: n.op } });
      } else {
        visit(n.arg, depth + 1, `${at}.arg`);
      }
    } else if (n.op === 'if') {
      allowed.push('cond', 'then', 'else');
      for (const field of ['cond', 'then', 'else']) {
        if (!(field in n)) {
          errors.push({ path: at, code: 'missingOperand', vars: { field, op: n.op } });
        } else {
          visit(n[field], depth + 1, `${at}.${field}`);
        }
      }
    } else {
      allowed.push('args');
      if (!Array.isArray(n.args) || n.args.length === 0) {
        errors.push({ path: at, code: 'missingOperand', vars: { field: 'args', op: n.op } });
      } else {
        if (ARITY[n.op] && n.args.length !== ARITY[n.op]) {
          errors.push({
            path: `${at}.args`,
            code: 'arity',
            vars: { op: n.op, count: ARITY[n.op] },
          });
        }
        n.args.forEach((arg, i) => visit(arg, depth + 1, `${at}.args.${i}`));
      }
    }
    for (const key of Object.keys(n)) {
      if (!allowed.includes(key)) {
        errors.push({ path: `${at}.${key}`, code: 'unknownField', vars: { field: key } });
      }
    }
  };
  visit(node, 0, path);
  return errors;
}

/**
 * Lists the reference paths used by an expression (for dependency checks).
 *
 * @param {*} node Expression.
 * @returns {string[]} Reference paths.
 */
export function collectRefs(node) {
  const refs = [];
  const visit = (n) => {
    if (!isRecord(n)) {
      return;
    }
    if (typeof n.ref === 'string') {
      refs.push(n.ref);
      return;
    }
    for (const key of ['left', 'right', 'arg', 'cond', 'then', 'else']) {
      if (key in n) {
        visit(n[key]);
      }
    }
    if (Array.isArray(n.args)) {
      n.args.forEach(visit);
    }
  };
  visit(node);
  return refs;
}

/**
 * Converts a value as `ref.as` asks. Malformed numbers are missing, not zero.
 *
 * @param {*} value Value.
 * @param {string} [as] Target type.
 * @returns {*} Converted value or MISSING.
 */
export function convert(value, as) {
  if (value === MISSING || value === undefined) {
    return MISSING;
  }
  if (as === 'number') {
    const n = parseStrictNumber(value);
    return n === null ? MISSING : n;
  }
  if (as === 'string') {
    return value === null ? '' : typeof value === 'object' ? MISSING : String(value);
  }
  if (as === 'boolean') {
    const b = parseBoolean(value);
    return b === null ? MISSING : b;
  }
  return value;
}

/**
 * Compares two values without coercion. Mismatched types and missing values
 * are not equal and not ordered.
 *
 * @param {string} op Comparison operator.
 * @param {*} a Left.
 * @param {*} b Right.
 * @returns {boolean} Result.
 */
function compare(op, a, b) {
  if (a === MISSING || b === MISSING) {
    return op === 'ne' ? a !== b : false;
  }
  if (op === 'eq') {
    return a === b;
  }
  if (op === 'ne') {
    return a !== b;
  }
  const bothNumbers = typeof a === 'number' && typeof b === 'number';
  const bothStrings = typeof a === 'string' && typeof b === 'string';
  if (!bothNumbers && !bothStrings) {
    return false;
  }
  switch (op) {
    case 'lt':
      return a < b;
    case 'lte':
      return a <= b;
    case 'gt':
      return a > b;
    case 'gte':
      return a >= b;
    default:
      return false;
  }
}

/**
 * Returns a finite number or MISSING.
 *
 * @param {*} value Value.
 * @returns {number|object} Number or MISSING.
 */
function finite(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : MISSING;
}

/**
 * Evaluates an expression.
 *
 * @param {*} node Validated expression.
 * @param {object} ctx Context.
 * @param {(path: string) => {found: boolean, value?: *}} ctx.resolve Reference resolver.
 * @param {() => number} [ctx.random] Random source in [0, 1).
 * @param {number} [ctx.maxString] Longest string result.
 * @returns {*} Value or MISSING.
 */
export function evaluate(node, ctx) {
  const maxString = ctx.maxString ?? DEFAULT_LIMITS.stringLength;
  const ev = (n) => evaluate(n, ctx);
  if (isLiteral(node)) {
    return node;
  }
  if (!isRecord(node)) {
    return MISSING;
  }
  if ('value' in node) {
    return node.value;
  }
  if ('ref' in node) {
    const found = ctx.resolve(node.ref);
    let value = found.found ? found.value : MISSING;
    if (value !== MISSING && node.as) {
      value = convert(value, node.as);
    }
    if (value === MISSING && node.default !== undefined) {
      return node.default;
    }
    return value;
  }
  const op = node.op;
  switch (op) {
    case 'eq':
    case 'ne':
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      return compare(op, ev(node.left), ev(node.right));
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
    case 'mod': {
      const a = finite(ev(node.left));
      const b = finite(ev(node.right));
      if (a === MISSING || b === MISSING) {
        return MISSING;
      }
      const result = { add: a + b, sub: a - b, mul: a * b, div: a / b, mod: a % b }[op];
      return finite(result);
    }
    case 'neg':
    case 'abs':
    case 'round':
    case 'floor':
    case 'ceil': {
      const a = finite(ev(node.arg));
      if (a === MISSING) {
        return MISSING;
      }
      return {
        neg: -a,
        abs: Math.abs(a),
        round: Math.round(a),
        floor: Math.floor(a),
        ceil: Math.ceil(a),
      }[op];
    }
    case 'min':
    case 'max': {
      const values = node.args.map((arg) => finite(ev(arg)));
      if (values.includes(MISSING)) {
        return MISSING;
      }
      return op === 'min' ? Math.min(...values) : Math.max(...values);
    }
    case 'all':
      return node.args.every((arg) => truthy(ev(arg)));
    case 'any':
      return node.args.some((arg) => truthy(ev(arg)));
    case 'not': {
      const a = ev(node.arg);
      return a === MISSING ? MISSING : !truthy(a);
    }
    case 'exists':
      return ev(node.arg) !== MISSING;
    case 'number':
    case 'string':
    case 'boolean':
      return convert(ev(node.arg), op);
    case 'lower':
    case 'upper':
    case 'trim': {
      const a = ev(node.arg);
      if (typeof a !== 'string') {
        return MISSING;
      }
      return op === 'lower' ? a.toLowerCase() : op === 'upper' ? a.toUpperCase() : a.trim();
    }
    case 'length': {
      const a = ev(node.arg);
      return typeof a === 'string' || Array.isArray(a) ? a.length : MISSING;
    }
    case 'concat': {
      const parts = node.args.map(ev);
      if (parts.includes(MISSING)) {
        return MISSING;
      }
      const text = parts.map((p) => (p === null ? '' : String(p))).join('');
      return text.length > maxString ? MISSING : text;
    }
    case 'contains':
    case 'startsWith':
    case 'endsWith': {
      const a = ev(node.left);
      const b = ev(node.right);
      if (typeof a !== 'string' || typeof b !== 'string') {
        return Array.isArray(a) && op === 'contains' && b !== MISSING ? a.includes(b) : false;
      }
      return op === 'contains'
        ? a.includes(b)
        : op === 'startsWith'
          ? a.startsWith(b)
          : a.endsWith(b);
    }
    case 'in': {
      const a = ev(node.left);
      const list = ev(node.right);
      return a !== MISSING && Array.isArray(list) && list.includes(a);
    }
    case 'hasMarker': {
      const markers = ev(node.left);
      const tag = ev(node.right);
      if (typeof markers !== 'string' || typeof tag !== 'string') {
        return false;
      }
      return parseMarkers(markers).some((m) => m.tag === tag);
    }
    case 'coalesce': {
      for (const arg of node.args) {
        const v = ev(arg);
        if (v !== MISSING && v !== null) {
          return v;
        }
      }
      return MISSING;
    }
    case 'crossBelow':
    case 'crossAbove': {
      const [oldV, newV, threshold] = node.args.map((arg) => finite(convert(ev(arg), 'number')));
      if ([oldV, newV, threshold].includes(MISSING)) {
        return false;
      }
      return op === 'crossBelow'
        ? oldV > threshold && newV <= threshold
        : oldV < threshold && newV >= threshold;
    }
    case 'randomInt': {
      const [lo, hi] = node.args.map((arg) => finite(ev(arg)));
      if (lo === MISSING || hi === MISSING || hi < lo) {
        return MISSING;
      }
      const rand = ctx.random ? ctx.random() : Math.random();
      return Math.floor(lo + rand * (Math.floor(hi) - Math.ceil(lo) + 1));
    }
    case 'if':
      return truthy(ev(node.cond)) ? ev(node.then) : ev(node.else);
    default:
      return MISSING;
  }
}

/**
 * Returns true for JSON scalars, which evaluate to themselves.
 *
 * @param {*} node Node.
 * @returns {boolean} True for literals.
 */
function isLiteral(node) {
  return node === null || ['string', 'number', 'boolean'].includes(typeof node);
}

/**
 * Renders a text template. `{{path}}` placeholders are replaced by declared
 * scalar values; the caller escapes the result for its context. Values are
 * flattened to one line so they cannot add commands.
 *
 * @param {string} template Template text.
 * @param {(path: string) => {found: boolean, value?: *}} resolve Resolver.
 * @param {(value: string) => string} sanitise Per-context escaping.
 * @returns {{text: string, missing: string[]}} Text and unresolved placeholders.
 */
export function renderTemplate(template, resolve, sanitise) {
  const missing = [];
  const text = String(template).replaceAll(
    /\{\{\s*([A-Za-z_][A-Za-z0-9_.]*)\s*\}\}/g,
    (_, path) => {
      const found = resolve(path);
      if (!found.found || found.value === null || typeof found.value === 'object') {
        missing.push(path);
        return '';
      }
      return sanitise(String(found.value));
    }
  );
  return { text, missing };
}

/**
 * Lists the placeholder paths in a template.
 *
 * @param {string} template Template text.
 * @returns {string[]} Paths.
 */
export function templatePaths(template) {
  return [...String(template).matchAll(/\{\{\s*([A-Za-z_][A-Za-z0-9_.]*)\s*\}\}/g)].map(
    (m) => m[1]
  );
}
