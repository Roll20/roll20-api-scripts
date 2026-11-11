// Small helpers with no Roll20 globals, so they can be unit tested directly.

import { DURATION_UNITS } from './constants.js';

const UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Returns true when a value is a plain non-null, non-array object.
 *
 * @param {*} value Value to test.
 * @returns {boolean} True when the value is a record.
 */
export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Converts a value to trimmed text, treating null and undefined as empty.
 *
 * @param {*} value Value to convert.
 * @returns {string} Trimmed string.
 */
export function toText(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

/**
 * Escapes HTML special characters for text and attribute contexts.
 *
 * @param {*} text Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Removes characters that could change what a chat line does: line breaks
 * (which start a new command), and leading slashes or `!` (which make the
 * text a chat command or an API command).
 *
 * @param {*} text Text from a task parameter or object.
 * @returns {string} Single-line text that cannot start a command.
 */
export function neutraliseChatText(text) {
  return String(text ?? '')
    .replaceAll(/[\r\n\u2028\u2029]+/g, ' ')
    .replace(/^[\s/!]+/, '');
}

/**
 * Parses a whole number, rejecting anything that is not entirely digits
 * (with an optional leading minus sign).
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Parsed integer, or null when invalid.
 */
export function parseStrictInt(raw) {
  if (typeof raw === 'number') {
    return Number.isInteger(raw) ? raw : null;
  }
  const text = toText(raw);
  return /^-?\d+$/.test(text) ? Number(text) : null;
}

/**
 * Parses a finite decimal number, rejecting partial matches such as "12abc".
 * Empty text is not a number (it never becomes zero).
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Parsed number, or null when invalid.
 */
export function parseStrictNumber(raw) {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  const text = toText(raw);
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(text)) {
    return null;
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/**
 * Parses a yes/no style value.
 *
 * @param {*} raw Raw input.
 * @returns {boolean|null} Parsed boolean, or null when not recognised.
 */
export function parseBoolean(raw) {
  if (typeof raw === 'boolean') {
    return raw;
  }
  const text = toText(raw).toLowerCase();
  if (['on', 'true', 'yes', '1'].includes(text)) {
    return true;
  }
  if (['off', 'false', 'no', '0'].includes(text)) {
    return false;
  }
  return null;
}

/**
 * Clamps a number into a range.
 *
 * @param {number} value Value.
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @returns {number} Clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Parses a duration such as `500ms`, `10s`, `5m`, `2h` or `1d`. A bare
 * number is rejected because its unit would be ambiguous.
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Milliseconds, or null when invalid.
 */
export function parseDuration(raw) {
  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)$/.exec(toText(raw).toLowerCase());
  if (!match) {
    return null;
  }
  const value = Math.round(Number(match[1]) * DURATION_UNITS[match[2]]);
  return Number.isFinite(value) ? value : null;
}

/**
 * Formats milliseconds as a short duration, e.g. `1h 5m`, `12s`, `250ms`.
 *
 * @param {number} ms Milliseconds.
 * @returns {string} Duration text.
 */
export function formatDuration(ms) {
  if (!Number.isFinite(ms)) {
    return '—';
  }
  const sign = ms < 0 ? '-' : '';
  let rest = Math.abs(Math.round(ms));
  if (rest < 1000) {
    return `${sign}${rest}ms`;
  }
  const parts = [];
  for (const [unit, size] of [
    ['d', DURATION_UNITS.d],
    ['h', DURATION_UNITS.h],
    ['m', DURATION_UNITS.m],
    ['s', DURATION_UNITS.s],
  ]) {
    if (rest >= size) {
      parts.push(`${Math.floor(rest / size)}${unit}`);
      rest %= size;
    }
    if (parts.length === 2) {
      break;
    }
  }
  return sign + parts.join(' ');
}

/**
 * Parses an ISO 8601 date-time that states its offset (`Z` or `±hh:mm`).
 * Local times without an offset are rejected: the sandbox has no reliable
 * timezone, and guessing one would move schedules by hours.
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Epoch milliseconds, or null when invalid.
 */
export function parseIsoInstant(raw) {
  const text = toText(raw);
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(
      text
    );
  if (!match) {
    return null;
  }
  const [, y, mo, d, h, mi, s = '0', frac = '0', zone] = match;
  const parts = [y, mo, d, h, mi, s].map(Number);
  if (parts[1] < 1 || parts[1] > 12 || parts[3] > 23 || parts[4] > 59 || parts[5] > 59) {
    return null;
  }
  const utc = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  // Reject dates such as 2026-02-30 that Date.UTC silently rolls over.
  if (new Date(utc).getUTCDate() !== parts[2]) {
    return null;
  }
  const ms = Number(frac.padEnd(3, '0'));
  const offset = zone === 'Z' ? 0 : parseUtcOffset(zone);
  return offset === null ? null : utc + ms - offset * 60000;
}

/**
 * Parses a fixed UTC offset such as `+01:00`, `-05:30` or `Z` into minutes.
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Offset in minutes east of UTC, or null when invalid.
 */
export function parseUtcOffset(raw) {
  const text = toText(raw);
  if (text === 'Z' || text === '+00:00' || text === '-00:00') {
    return 0;
  }
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(text);
  if (!match) {
    return null;
  }
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (hours > 14 || minutes > 59) {
    return null;
  }
  return (match[1] === '-' ? -1 : 1) * (hours * 60 + minutes);
}

/**
 * Formats offset minutes as `+hh:mm`.
 *
 * @param {number} minutes Offset in minutes east of UTC.
 * @returns {string} Offset text.
 */
export function formatUtcOffset(minutes) {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const pad = (n) => String(n).padStart(2, '0');
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/**
 * Formats epoch milliseconds as an ISO UTC string without milliseconds.
 *
 * @param {number} ms Epoch milliseconds.
 * @returns {string} e.g. `2026-11-01T19:00:00Z`.
 */
export function formatUtc(ms) {
  if (!Number.isFinite(ms)) {
    return '—';
  }
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Splits command text into words. Double quotes group words, `\"` inside a
 * quoted phrase is a literal quote, and `--json` takes the rest of the line
 * as one raw value so JSON is never re-split.
 *
 * @param {string} text Command text.
 * @returns {{words: {text: string, quoted: boolean}[], json: string|null, error: string|null}}
 *          Words, the raw JSON payload and an error code for unterminated quotes.
 */
export function tokenize(text) {
  const source = String(text ?? '');
  const words = [];
  let json = null;
  let i = 0;
  while (i < source.length) {
    if (/\s/.test(source[i])) {
      i += 1;
      continue;
    }
    if (source.startsWith('--json', i) && (i + 6 === source.length || /\s/.test(source[i + 6]))) {
      json = source.slice(i + 6).trim();
      break;
    }
    if (source[i] === '"') {
      let value = '';
      let j = i + 1;
      let closed = false;
      while (j < source.length) {
        if (source[j] === '\\' && (source[j + 1] === '"' || source[j + 1] === '\\')) {
          value += source[j + 1];
          j += 2;
          continue;
        }
        if (source[j] === '"') {
          closed = true;
          break;
        }
        value += source[j];
        j += 1;
      }
      if (!closed) {
        return { words, json, error: 'unterminatedQuote' };
      }
      words.push({ text: value, quoted: true });
      i = j + 1;
      continue;
    }
    let j = i;
    while (j < source.length && !/\s/.test(source[j])) {
      j += 1;
    }
    words.push({ text: source.slice(i, j), quoted: false });
    i = j;
  }
  return { words, json, error: null };
}

/**
 * Quotes a value for a command link so it survives the tokenizer.
 *
 * @param {*} value Value.
 * @returns {string} Quoted text, or the bare value when it needs no quotes.
 */
export function quoteArg(value) {
  const text = String(value ?? '');
  if (/^[A-Za-z0-9_.:@+-]+$/.test(text)) {
    return text;
  }
  return `"${text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

/**
 * Returns true when a key may be used in persisted or imported data.
 *
 * @param {string} key Key.
 * @returns {boolean} True when safe.
 */
export function isSafeKey(key) {
  return typeof key === 'string' && !UNSAFE_KEYS.has(key) && key.length <= 200;
}

/**
 * Checks that a value is plain JSON data: finite numbers, strings, booleans,
 * null, arrays and plain objects with safe keys, without cycles, within depth
 * and size limits.
 *
 * @param {*} value Value to check.
 * @param {{maxDepth?: number, maxNodes?: number, maxString?: number}} [limits] Limits.
 * @returns {{ok: boolean, error?: string, path?: string}} Result.
 */
export function checkPlainData(value, { maxDepth = 32, maxNodes = 20000, maxString = 20000 } = {}) {
  const seen = new Set();
  let nodes = 0;
  const visit = (node, depth, path) => {
    nodes += 1;
    if (nodes > maxNodes) {
      return { ok: false, error: 'tooLarge', path };
    }
    if (depth > maxDepth) {
      return { ok: false, error: 'tooDeep', path };
    }
    if (node === null || typeof node === 'boolean') {
      return { ok: true };
    }
    if (typeof node === 'number') {
      return Number.isFinite(node) ? { ok: true } : { ok: false, error: 'notFinite', path };
    }
    if (typeof node === 'string') {
      return node.length <= maxString ? { ok: true } : { ok: false, error: 'stringTooLong', path };
    }
    if (typeof node !== 'object') {
      return { ok: false, error: 'notPlain', path };
    }
    if (seen.has(node)) {
      return { ok: false, error: 'cycle', path };
    }
    // Plain objects only (any realm): no class instances, dates or maps.
    const proto = Object.getPrototypeOf(node);
    const plain =
      proto === null ||
      (Object.getPrototypeOf(proto) === null &&
        Object.prototype.toString.call(node) === '[object Object]');
    if (!Array.isArray(node) && !plain) {
      return { ok: false, error: 'notPlain', path };
    }
    seen.add(node);
    const entries = Array.isArray(node) ? node.map((v, k) => [k, v]) : Object.entries(node);
    for (const [key, child] of entries) {
      if (!Array.isArray(node) && !isSafeKey(key)) {
        return { ok: false, error: 'unsafeKey', path: `${path}.${key}` };
      }
      const result = visit(child, depth + 1, `${path}.${key}`);
      if (!result.ok) {
        return result;
      }
    }
    seen.delete(node);
    return { ok: true };
  };
  return visit(value, 0, '$');
}

/**
 * Parses JSON text and checks it is plain data. Keys such as `__proto__` are
 * rejected at any depth.
 *
 * @param {string} text JSON text.
 * @param {number} maxBytes Maximum length.
 * @returns {{ok: boolean, value?: *, error?: string, path?: string}} Result.
 */
export function parseJsonSafe(text, maxBytes) {
  const raw = toText(text);
  if (!raw) {
    return { ok: false, error: 'emptyJson' };
  }
  if (byteLength(raw) > maxBytes) {
    return { ok: false, error: 'tooLarge' };
  }
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'badJson' };
  }
  const check = checkPlainData(value);
  return check.ok ? { ok: true, value } : check;
}

/**
 * Deep-copies plain JSON data.
 *
 * @template T
 * @param {T} value Value.
 * @returns {T} Copy.
 */
export function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/**
 * Returns the UTF-8 byte length of text.
 *
 * @param {string} text Text.
 * @returns {number} Bytes.
 */
export function byteLength(text) {
  let bytes = 0;
  for (const char of String(text)) {
    const code = char.codePointAt(0);
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}

/**
 * Estimates the serialised size of a value.
 *
 * @param {*} value Value.
 * @returns {number} Approximate bytes.
 */
export function estimateSize(value) {
  try {
    return byteLength(JSON.stringify(value) ?? '');
  } catch {
    return Infinity;
  }
}

/**
 * Hashes text with 32-bit FNV-1a. Used to skip identical handout writes.
 *
 * @param {string} text Text.
 * @returns {string} Hex hash.
 */
export function hashText(text) {
  let hash = 0x811c9dc5;
  const source = String(text);
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Returns an opaque random token for confirmations. Not a secret against
 * other Mods in the sandbox; it binds a click to one previewed operation.
 *
 * @param {number} counter Monotonic counter mixed in so tokens never repeat.
 * @returns {string} Token.
 */
export function randomToken(counter) {
  const part = () => Math.floor(Math.random() * 0x100000000).toString(36);
  return `${part()}${part()}${counter.toString(36)}`;
}

/**
 * Turns a name into a definition ID: lower case letters, digits and dashes.
 *
 * @param {string} name Name.
 * @returns {string} Slug, possibly empty.
 */
export function slugify(name) {
  return toText(name)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 48);
}

/**
 * Splits a token's `statusmarkers` text into entries.
 *
 * @param {*} raw statusmarkers value.
 * @returns {{tag: string, count: number|null}[]} Markers.
 */
export function parseMarkers(raw) {
  return toText(raw)
    .split(',')
    .filter(Boolean)
    .map((entry) => {
      const at = entry.lastIndexOf('@');
      if (at > 0 && /^\d+$/.test(entry.slice(at + 1))) {
        return { tag: entry.slice(0, at), count: Number(entry.slice(at + 1)) };
      }
      return { tag: entry, count: null };
    });
}

/**
 * Joins marker entries back into `statusmarkers` text.
 *
 * @param {{tag: string, count: number|null}[]} markers Markers.
 * @returns {string} statusmarkers value.
 */
export function formatMarkers(markers) {
  return markers.map((m) => (m.count === null ? m.tag : `${m.tag}@${m.count}`)).join(',');
}

/**
 * Truncates text for logs and the dashboard.
 *
 * @param {*} text Text.
 * @param {number} [max=200] Maximum length.
 * @returns {string} Truncated text.
 */
export function truncate(text, max = 200) {
  const value = String(text ?? '');
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * Reads a dotted path from plain data without walking prototypes.
 *
 * @param {*} root Root value.
 * @param {string[]} parts Path segments.
 * @returns {{found: boolean, value?: *}} Result.
 */
export function readPath(root, parts) {
  let current = root;
  for (const part of parts) {
    if (!isSafeKey(part) || current === null || typeof current !== 'object') {
      return { found: false };
    }
    if (!Object.prototype.hasOwnProperty.call(current, part)) {
      return { found: false };
    }
    current = current[part];
  }
  return current === undefined ? { found: false } : { found: true, value: current };
}
