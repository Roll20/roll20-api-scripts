// Time schedule arithmetic (plan §5): one-off, fixed-rate and fixed-delay
// intervals, and daily/weekly calendar times at a fixed UTC offset. Missed
// occurrences are counted with arithmetic, never by walking years of times.
// Pure: no Roll20 globals and no host timezone.

import { WEEKDAYS } from './constants.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// 1970-01-01 was a Thursday.
const EPOCH_WEEKDAY = 4;

/**
 * Parses `HH:MM` (24-hour) into milliseconds after midnight.
 *
 * @param {*} raw Raw input.
 * @returns {number|null} Milliseconds, or null when invalid.
 */
export function parseClockTime(raw) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(raw ?? '').trim());
  return match ? (Number(match[1]) * 60 + Number(match[2])) * 60000 : null;
}

/**
 * Formats milliseconds after midnight as `HH:MM`.
 *
 * @param {number} ms Milliseconds.
 * @returns {string} Clock time.
 */
export function formatClockTime(ms) {
  const minutes = Math.floor(ms / 60000);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * Parses weekday names (`mon,wed` or `mon wed`) into sorted day numbers.
 *
 * @param {*} raw Raw input (string or array).
 * @returns {number[]|null} Day numbers (0 = Sunday), or null when invalid.
 */
export function parseWeekdays(raw) {
  const list = Array.isArray(raw) ? raw : String(raw ?? '').split(/[\s,]+/);
  const days = new Set();
  for (const item of list.filter((x) => x !== '')) {
    const index =
      typeof item === 'number' ? item : WEEKDAYS.indexOf(String(item).slice(0, 3).toLowerCase());
    if (!Number.isInteger(index) || index < 0 || index > 6) {
      return null;
    }
    days.add(index);
  }
  return days.size ? [...days].sort((a, b) => a - b) : null;
}

/**
 * Returns the local day number (days since 1970-01-01 at the offset) of an instant.
 *
 * @param {number} t Epoch milliseconds.
 * @param {number} offsetMinutes Offset east of UTC.
 * @returns {number} Day number.
 */
function localDay(t, offsetMinutes) {
  return Math.floor((t + offsetMinutes * 60000) / DAY_MS);
}

/**
 * Returns the instant of a calendar occurrence on a local day.
 *
 * @param {number} day Local day number.
 * @param {object} spec Calendar spec.
 * @returns {number} Epoch milliseconds.
 */
function occurrenceOnDay(day, spec) {
  return day * DAY_MS + spec.timeMs - spec.offsetMinutes * 60000;
}

/**
 * Returns true when a calendar spec fires on a local day.
 *
 * @param {number} day Local day number.
 * @param {object} spec Calendar spec.
 * @returns {boolean} True when it fires.
 */
function firesOnDay(day, spec) {
  if (spec.kind === 'daily') {
    return true;
  }
  const weekday = (((day + EPOCH_WEEKDAY) % 7) + 7) % 7;
  return spec.days.includes(weekday);
}

/**
 * Returns the first occurrence at or after an instant, ignoring windows.
 *
 * @param {object} spec Normalised schedule spec.
 * @param {number} t Epoch milliseconds.
 * @returns {number|null} Epoch milliseconds, or null when there is none.
 */
function rawAtOrAfter(spec, t) {
  switch (spec.kind) {
    case 'once':
      return spec.at >= t ? spec.at : null;
    case 'interval': {
      if (t <= spec.anchor) {
        return spec.anchor;
      }
      return spec.anchor + Math.ceil((t - spec.anchor) / spec.everyMs) * spec.everyMs;
    }
    case 'daily':
    case 'weekly': {
      let day = localDay(t, spec.offsetMinutes);
      for (let i = 0; i < 9; i += 1, day += 1) {
        const at = occurrenceOnDay(day, spec);
        if (at >= t && firesOnDay(day, spec)) {
          return at;
        }
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Returns the last occurrence at or before an instant, ignoring windows.
 *
 * @param {object} spec Normalised schedule spec.
 * @param {number} t Epoch milliseconds.
 * @returns {number|null} Epoch milliseconds, or null when there is none.
 */
function rawAtOrBefore(spec, t) {
  switch (spec.kind) {
    case 'once':
      return spec.at <= t ? spec.at : null;
    case 'interval':
      if (t < spec.anchor) {
        return null;
      }
      return spec.anchor + Math.floor((t - spec.anchor) / spec.everyMs) * spec.everyMs;
    case 'daily':
    case 'weekly': {
      let day = localDay(t, spec.offsetMinutes);
      for (let i = 0; i < 9; i += 1, day -= 1) {
        const at = occurrenceOnDay(day, spec);
        if (at <= t && firesOnDay(day, spec)) {
          return at;
        }
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Returns the first occurrence at or after an instant, inside the spec's
 * start/end window.
 *
 * @param {object} spec Normalised schedule spec.
 * @param {number} t Epoch milliseconds.
 * @returns {number|null} Epoch milliseconds, or null when the schedule has ended.
 */
export function nextAtOrAfter(spec, t) {
  const from = Number.isFinite(spec.startAt) ? Math.max(t, spec.startAt) : t;
  const at = rawAtOrAfter(spec, from);
  if (at === null || (Number.isFinite(spec.endAt) && at > spec.endAt)) {
    return null;
  }
  return at;
}

/**
 * Returns the first occurrence strictly after an instant.
 *
 * @param {object} spec Normalised schedule spec.
 * @param {number} t Epoch milliseconds.
 * @returns {number|null} Epoch milliseconds, or null.
 */
export function nextAfter(spec, t) {
  return nextAtOrAfter(spec, t + 1);
}

/**
 * Counts occurrences in the closed range [from, to] arithmetically.
 *
 * @param {object} spec Normalised schedule spec.
 * @param {number} from Epoch milliseconds.
 * @param {number} to Epoch milliseconds.
 * @returns {number} Count.
 */
export function countBetween(spec, from, to) {
  const a = Number.isFinite(spec.startAt) ? Math.max(from, spec.startAt) : from;
  const b = Number.isFinite(spec.endAt) ? Math.min(to, spec.endAt) : to;
  if (b < a) {
    return 0;
  }
  const first = rawAtOrAfter(spec, a);
  const last = rawAtOrBefore(spec, b);
  if (first === null || last === null || last < first) {
    return 0;
  }
  switch (spec.kind) {
    case 'once':
      return 1;
    case 'interval':
      return Math.round((last - first) / spec.everyMs) + 1;
    case 'daily':
      return localDay(last, spec.offsetMinutes) - localDay(first, spec.offsetMinutes) + 1;
    case 'weekly': {
      const d1 = localDay(first, spec.offsetMinutes);
      const d2 = localDay(last, spec.offsetMinutes);
      const days = d2 - d1 + 1;
      const fullWeeks = Math.floor(days / 7);
      let count = fullWeeks * spec.days.length;
      for (let d = d1 + fullWeeks * 7; d <= d2; d += 1) {
        if (firesOnDay(d, spec)) {
          count += 1;
        }
      }
      return count;
    }
    default:
      return 0;
  }
}

/**
 * Lists up to `limit` occurrences at or after an instant.
 *
 * @param {object} spec Normalised schedule spec.
 * @param {number} from Epoch milliseconds.
 * @param {number} limit Maximum occurrences.
 * @param {number} [to=Infinity] Last instant to include.
 * @returns {number[]} Occurrences.
 */
export function listFrom(spec, from, limit, to = Infinity) {
  const out = [];
  let at = nextAtOrAfter(spec, from);
  while (at !== null && at <= to && out.length < limit) {
    out.push(at);
    at = spec.kind === 'once' ? null : nextAfter(spec, at);
  }
  return out;
}

/**
 * Validates and normalises a schedule spec.
 *
 * @param {object} raw Raw spec: {kind, at | everyMs+anchor+mode | time+offset(+days), startAt, endAt, maxCount}.
 * @param {{minIntervalMs: number}} limits Limits.
 * @returns {{ok: boolean, spec?: object, error?: string}} Result.
 */
export function normaliseSpec(raw, { minIntervalMs }) {
  const base = {};
  for (const key of ['startAt', 'endAt']) {
    if (raw[key] !== undefined && raw[key] !== null) {
      if (!Number.isFinite(raw[key])) {
        return { ok: false, error: 'badWindow' };
      }
      base[key] = raw[key];
    }
  }
  if (base.startAt !== undefined && base.endAt !== undefined && base.endAt < base.startAt) {
    return { ok: false, error: 'badWindow' };
  }
  if (raw.maxCount !== undefined && raw.maxCount !== null) {
    if (!Number.isInteger(raw.maxCount) || raw.maxCount < 1) {
      return { ok: false, error: 'badCount' };
    }
    base.maxCount = raw.maxCount;
  }
  switch (raw.kind) {
    case 'once':
      if (!Number.isFinite(raw.at)) {
        return { ok: false, error: 'badTime' };
      }
      return { ok: true, spec: { kind: 'once', at: raw.at, ...base } };
    case 'interval': {
      if (!Number.isFinite(raw.everyMs) || raw.everyMs < minIntervalMs) {
        return { ok: false, error: 'intervalTooShort' };
      }
      if (!Number.isFinite(raw.anchor)) {
        return { ok: false, error: 'badTime' };
      }
      const mode = raw.mode || 'fixedRate';
      if (!['fixedRate', 'fixedDelay'].includes(mode)) {
        return { ok: false, error: 'badMode' };
      }
      return {
        ok: true,
        spec: { kind: 'interval', everyMs: raw.everyMs, anchor: raw.anchor, mode, ...base },
      };
    }
    case 'daily':
    case 'weekly': {
      const timeMs = typeof raw.timeMs === 'number' ? raw.timeMs : parseClockTime(raw.time);
      if (timeMs === null || timeMs < 0 || timeMs >= DAY_MS) {
        return { ok: false, error: 'badTime' };
      }
      if (!Number.isInteger(raw.offsetMinutes) || Math.abs(raw.offsetMinutes) > 14 * 60) {
        return { ok: false, error: 'badOffset' };
      }
      const spec = { kind: raw.kind, timeMs, offsetMinutes: raw.offsetMinutes, ...base };
      if (raw.kind === 'weekly') {
        const days = parseWeekdays(raw.days);
        if (!days) {
          return { ok: false, error: 'badDays' };
        }
        spec.days = days;
      }
      return { ok: true, spec };
    }
    default:
      return { ok: false, error: 'badKind' };
  }
}
